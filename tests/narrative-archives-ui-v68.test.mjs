import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  MissionArchiveOverlayV68,
  NarrativeArchivesUiV68,
  createOpenArchivesEventV68,
  normalizeNarrativeArchivesUiStateV68
} from '../src/narrative-archives-ui-v68.js';

const datasetName = (attribute) => attribute.replace(/^data-/u, '').replace(/-([a-z])/gu, (_match, letter) => letter.toUpperCase());

class FakeClassList {
  constructor() { this.values = new Set(); }
  add(...values) { values.forEach((value) => this.values.add(value)); }
  contains(value) { return this.values.has(value); }
}

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.parentNode = null;
    this.dataset = {};
    this.attributes = new Map();
    this.listeners = new Map();
    this.classList = new FakeClassList();
    this._text = '';
    this.value = '';
    this.checked = false;
    this.disabled = false;
    this.hidden = false;
    this.style = {};
    this.selectionStart = 0;
    this.selectionEnd = 0;
  }
  get className() { return [...this.classList.values].join(' '); }
  set className(value) {
    this.classList = new FakeClassList();
    String(value || '').split(/\s+/u).filter(Boolean).forEach((item) => this.classList.add(item));
  }
  get textContent() { return this._text + this.children.map((child) => child.textContent).join(''); }
  set textContent(value) { this._text = String(value ?? ''); this.children = []; }
  append(...nodes) {
    for (const node of nodes) {
      node.parentNode = this;
      this.children.push(node);
    }
  }
  replaceChildren(...nodes) { this.children = []; this._text = ''; this.append(...nodes); }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name.startsWith('data-')) this.dataset[datasetName(name)] = String(value);
    if (name === 'disabled') this.disabled = true;
  }
  getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
  hasAttribute(name) { return this.attributes.has(name); }
  removeAttribute(name) { this.attributes.delete(name); }
  addEventListener(name, listener) { this.listeners.set(name, listener); }
  removeEventListener(name) { this.listeners.delete(name); }
  contains(candidate) {
    for (let current = candidate; current; current = current.parentNode) if (current === this) return true;
    return false;
  }
  matches(selector) {
    if (selector === '*') return true;
    const data = selector.match(/^\[data-([a-z0-9-]+)(?:="([^"]+)")?\]$/u);
    if (data) {
      const key = datasetName(`data-${data[1]}`);
      return Object.hasOwn(this.dataset, key) && (data[2] === undefined || this.dataset[key] === data[2]);
    }
    if (selector.startsWith('#')) return this.attributes.get('id') === selector.slice(1);
    return this.tagName === selector.toUpperCase();
  }
  closest(selector) {
    for (let current = this; current; current = current.parentNode) if (current.matches?.(selector)) return current;
    return null;
  }
  querySelectorAll(selector) {
    const result = [];
    const visit = (node) => {
      for (const child of node.children) {
        if (child.matches(selector)) result.push(child);
        visit(child);
      }
    };
    visit(this);
    return result;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  focus() { this.ownerDocument.activeElement = this; }
  setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; }
}

class FakeDocument {
  constructor() { this.activeElement = null; }
  createElement(tagName) { return new FakeElement(tagName, this); }
}

const fixture = () => ({
  entries: [
    {
      id: 'qz17-pda', title: 'PDA du contremaître', type: 'pda', source: 'M. HOLT', summary: 'Déchargement avancé.',
      body: 'Le conteneur QZ-17 a été livré vide.', discovered: true, claims: [{ id: 'claim-empty', subject: 'Conteneur', statement: 'Livré vide.' }]
    },
    {
      id: 'qz17-email', title: 'Courriel de quai', type: 'email', source: 'WEYLAND-YUTANI', summary: 'Ordre de transfert.',
      body: 'La masse du conteneur dépasse quatre tonnes.', discovered: true, claims: [{ id: 'claim-loaded', subject: 'Conteneur', statement: 'Masse enregistrée : 4,2 tonnes.' }]
    },
    { id: 'qz17-secret', title: 'Archive non trouvée', type: 'text', body: 'Spoiler.', discovered: false }
  ],
  readIds: ['qz17-pda'],
  relations: [
    { id: 'cargo-conflict', type: 'contradicts', fromClaimId: 'claim-empty', toClaimId: 'claim-loaded', label: 'Manifeste incompatible' },
    { id: 'cargo-qualification', type: 'qualifies', fromClaimId: 'claim-empty', toClaimId: 'claim-loaded', label: 'Chronologie à qualifier' }
  ],
  decisions: [{ id: 'qz17-confront', label: 'Confronter le manifeste', requirements: ['claim-empty', 'claim-loaded'], routeUnlockFlag: 'qz17-route-analysis-complete' }],
  unlockedFlags: []
});

function mount(state = fixture(), callbacks = {}) {
  const documentRef = new FakeDocument();
  const root = documentRef.createElement('section');
  const ui = new NarrativeArchivesUiV68({ root, documentRef, getState: () => state, ...callbacks });
  return { documentRef, root, ui, state };
}

test('normalise uniquement les preuves découvertes et indexe la contradiction vérifiable', () => {
  const state = normalizeNarrativeArchivesUiStateV68(fixture());
  assert.deepEqual(state.entries.map((entry) => entry.id), ['qz17-pda', 'qz17-email']);
  assert.equal(state.unreadCount, 1);
  assert.equal(state.relations.length, 1);
  assert.equal(state.qualifications.length, 1);
  assert.equal(state.relations[0].left.statement, 'Livré vide.');
  assert.equal(state.relations[0].right.statement, 'Masse enregistrée : 4,2 tonnes.');
  assert.equal(state.qualifications[0].type, 'qualifies');
  assert.equal(state.qualifications[0].label, 'Chronologie à qualifier');
  assert.equal(state.decisions[0].available, true);
  assert.equal(state.decisions[0].applied, false);
});

test('V72 un registre explicitement vide ne révèle aucune entrée implicite ni texte de relation', () => {
  const input = fixture();
  input.ledger = { discovered: {}, readIds: [] };
  for (const entry of input.entries) delete entry.discovered;
  input.relations[0].leftText = 'SPOILER NON RECUPERE A';
  input.relations[0].rightText = 'SPOILER NON RECUPERE B';
  const state = normalizeNarrativeArchivesUiStateV68(input);
  assert.equal(state.entries.length, 0);
  assert.equal(state.relations.length, 0);
  assert.equal(state.qualifications.length, 0);
  assert.equal(state.decisions[0].available, false);
  assert.doesNotMatch(JSON.stringify(state), /SPOILER NON RECUPERE/u);
});

test('V72 une comparaison exige ses deux déclarations découvertes et garde leurs mots exacts', () => {
  const input = fixture();
  input.entries[1].discovered = false;
  input.relations[0].rightText = 'Spoiler inline';
  let state = normalizeNarrativeArchivesUiStateV68(input);
  assert.equal(state.relations.length, 0);
  assert.equal(state.qualifications.length, 0);
  input.entries[1].discovered = true;
  input.relations[0].leftText = 'Réécriture non vérifiée';
  state = normalizeNarrativeArchivesUiStateV68(input);
  assert.equal(state.relations[0].leftText, input.entries[0].claims[0].statement);
  assert.equal(state.relations[0].rightText, input.entries[1].claims[0].statement);
});

test('V72 available=true ne contourne jamais les preuves manquantes ou un choix exclusif', () => {
  const input = fixture();
  input.decisions[0].available = true;
  input.entries[1].discovered = false;
  assert.equal(normalizeNarrativeArchivesUiStateV68(input).decisions[0].available, false);
  input.entries[1].discovered = true;
  input.decisions[0].lockedByChoice = true;
  assert.equal(normalizeNarrativeArchivesUiStateV68(input).decisions[0].available, false);
});

test('V72 une action narrative rejetée ne promet pas une conclusion enregistrée', async () => {
  const { ui } = mount(fixture(), { onDecision: () => ({ applied: false, reason: 'requirements-not-met' }) });
  await ui.runAction('decision', 'qz17-confront', ui.onDecision);
  assert.doesNotMatch(ui.lastStatus, /Conclusion enregistrée/u);
  assert.match(ui.lastStatus, /non appliquée/u);
});

test('rend une bibliothèque accessible sans faux lecteur audio ou vidéo', () => {
  const { root } = mount();
  assert.equal(root.attributes.get('aria-label'), 'Bibliothèque des archives de mission');
  assert.equal(root.querySelectorAll('[data-archive-entry]').length, 2);
  assert.equal(root.querySelector('[data-archive-search]').attributes.get('aria-label'), 'Rechercher dans les archives');
  assert.equal(root.querySelector('[data-archive-type]').attributes.get('aria-label'), 'Filtrer les archives par type');
  assert.match(root.textContent, /COMPARAISON DES SOURCES/u);
  assert.match(root.textContent, /Manifeste incompatible/u);
  assert.match(root.textContent, /QUALIFICATIONS ET LIMITES/u);
  assert.match(root.textContent, /Chronologie à qualifier/u);
  assert.equal(root.querySelectorAll('audio').length, 0);
  assert.equal(root.querySelectorAll('video').length, 0);
});

test('deux lecteurs montés simultanément gardent des IDs uniques et leurs IDREF locales', () => {
  const documentRef = new FakeDocument();
  const roots = ['narrative-archives-v68', 'mission-narrative-archives-v68'].map((id) => {
    const root = documentRef.createElement('section');
    root.setAttribute('id', id);
    new NarrativeArchivesUiV68({ root, documentRef, getState: fixture });
    return root;
  });
  const descendants = roots.map((root) => root.querySelectorAll('*'));
  const ids = descendants.flatMap((nodes) => nodes.map((node) => node.getAttribute('id')).filter(Boolean));
  assert.equal(ids.length, new Set(ids).size, 'aucun identifiant DOM ne doit être partagé entre les deux lecteurs');

  for (const [root, nodes] of roots.map((candidate, index) => [candidate, descendants[index]])) {
    const references = nodes.flatMap((node) => ['aria-labelledby', 'aria-describedby']
      .flatMap((attribute) => String(node.getAttribute(attribute) || '').split(/\s+/u).filter(Boolean)));
    assert.ok(references.length >= 3, 'le lecteur doit exposer les relations de titre et de description attendues');
    for (const reference of references) {
      assert.ok(root.querySelector(`#${reference}`), `${reference} doit résoudre dans son propre lecteur`);
    }
  }
});

test('les rerenders clavier, filtres et actions async gardent le focus dans le dialogue', async () => {
  const documentRef = new FakeDocument();
  const dialog = documentRef.createElement('section');
  const closeButton = documentRef.createElement('button');
  const root = documentRef.createElement('div');
  root.setAttribute('id', 'mission-narrative-archives-v68');
  dialog.append(closeButton, root);
  let resolveRead;
  let resolveDecision;
  const readResult = new Promise((resolve) => { resolveRead = resolve; });
  const decisionResult = new Promise((resolve) => { resolveDecision = resolve; });
  const ui = new NarrativeArchivesUiV68({
    root,
    documentRef,
    getState: fixture,
    focusFallback: closeButton,
    onMarkRead: () => readResult,
    onDecision: () => decisionResult
  });

  let entry = root.querySelector('[data-archive-entry="qz17-email"]');
  entry.focus();
  ui.handleClick({ target: entry, key: 'Enter' });
  entry = root.querySelector('[data-archive-entry="qz17-email"]');
  assert.equal(documentRef.activeElement, entry, 'activation Enter : focus conservé pendant la lecture');
  assert.equal(dialog.contains(documentRef.activeElement), true);
  resolveRead({ message: 'Lecture enregistrée.' });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(documentRef.activeElement, root.querySelector('[data-archive-entry="qz17-email"]'));
  assert.equal(dialog.contains(documentRef.activeElement), true);

  let type = root.querySelector('[data-archive-type]');
  type.focus();
  type.value = 'pda';
  ui.handleChange({ target: type });
  type = root.querySelector('[data-archive-type]');
  assert.equal(documentRef.activeElement, type, 'le select retrouve son équivalent après filtrage');
  assert.equal(dialog.contains(documentRef.activeElement), true);

  let unread = root.querySelector('[data-archive-unread]');
  unread.focus();
  unread.checked = true;
  ui.handleChange({ target: unread });
  unread = root.querySelector('[data-archive-unread]');
  assert.equal(documentRef.activeElement, unread, 'la case non-lus retrouve son équivalent après filtrage');
  assert.equal(dialog.contains(documentRef.activeElement), true);

  ui.type = 'all';
  ui.unreadOnly = false;
  ui.render();
  const decision = root.querySelector('[data-archive-decision]');
  decision.focus();
  ui.handleClick({ target: decision, key: 'Enter' });
  assert.equal(documentRef.activeElement, closeButton, 'une action temporairement désactivée replie le focus sur la fermeture du modal');
  assert.equal(dialog.contains(documentRef.activeElement), true);
  resolveDecision({ message: 'Conclusion enregistrée.' });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(documentRef.activeElement, closeButton);
  assert.equal(dialog.contains(documentRef.activeElement), true);
});

test('le filtre non-lu et la recherche réduisent réellement la liste', () => {
  const { root, ui } = mount();
  const unread = root.querySelector('[data-archive-unread]');
  unread.checked = true;
  ui.handleChange({ target: unread });
  assert.deepEqual(root.querySelectorAll('[data-archive-entry]').map((entry) => entry.dataset.archiveEntry), ['qz17-email']);

  ui.unreadOnly = false;
  const search = root.querySelector('[data-archive-search]');
  search.value = 'holt';
  ui.handleInput({ target: search });
  assert.deepEqual(root.querySelectorAll('[data-archive-entry]').map((entry) => entry.dataset.archiveEntry), ['qz17-pda']);
});

test('la recherche conserve focus et caret pendant une saisie successive', () => {
  const { documentRef, root, ui } = mount();
  let search = root.querySelector('[data-archive-search]');
  search.focus();
  search.value = 'h';
  search.selectionStart = 1;
  search.selectionEnd = 1;
  ui.handleInput({ target: search });
  search = root.querySelector('[data-archive-search]');
  assert.equal(documentRef.activeElement, search);
  assert.deepEqual([search.selectionStart, search.selectionEnd], [1, 1]);
  search.value = 'ho';
  search.selectionStart = 2;
  search.selectionEnd = 2;
  ui.handleInput({ target: search });
  search = root.querySelector('[data-archive-search]');
  assert.equal(documentRef.activeElement, search);
  assert.deepEqual([search.selectionStart, search.selectionEnd], [2, 2]);
  assert.deepEqual(root.querySelectorAll('[data-archive-entry]').map((entry) => entry.dataset.archiveEntry), ['qz17-pda']);
});

test('ArrowDown navigue entre les dossiers sans déclencher une action', () => {
  const { documentRef, root, ui } = mount();
  const buttons = root.querySelectorAll('[data-archive-entry]');
  let prevented = false;
  ui.handleKeydown({ target: buttons[0], key: 'ArrowDown', preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(ui.selectedId, 'qz17-email');
  assert.equal(documentRef.activeElement.dataset.archiveEntry, 'qz17-email');
});

test('l’ouverture marque explicitement un dossier non lu puis actualise le détail', async () => {
  const state = fixture();
  const calls = [];
  const { root, ui } = mount(state, {
    onMarkRead: async (id) => {
      calls.push(id);
      state.readIds.push(id);
      return { message: 'Lecture enregistrée.' };
    }
  });
  const unread = root.querySelector('[data-archive-entry="qz17-email"]');
  ui.handleClick({ target: unread });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(calls, ['qz17-email']);
  assert.equal(ui.state().unreadCount, 0);
  assert.match(root.textContent, /Lecture enregistrée/u);
});

test('la confrontation appelle le callback une fois et reflète le déblocage de route', async () => {
  const state = fixture();
  const calls = [];
  const { root, ui } = mount(state, {
    onDecision: async (id) => {
      calls.push(id);
      state.unlockedFlags.push('qz17-route-analysis-complete');
      return { message: 'Route QZ-17 déverrouillée.' };
    }
  });
  const decision = root.querySelector('[data-archive-decision]');
  ui.handleClick({ target: decision });
  ui.handleClick({ target: decision });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(calls, ['qz17-confront']);
  const refreshed = root.querySelector('[data-archive-decision]');
  assert.equal(refreshed.disabled, true);
  assert.match(refreshed.textContent, /ROUTE DÉJÀ DÉBLOQUÉE/u);
  assert.match(root.textContent, /Route QZ-17 déverrouillée/u);
});

test('l’événement public encode uniquement un identifiant sûr', () => {
  const event = createOpenArchivesEventV68('qz17-email<script>');
  assert.equal(event.type, 'atf:open-archives');
  assert.deepEqual(event.detail, { entryId: 'qz17-email-script' });
});

test('les quatre dossiers QZ-17 recadrent leur cellule dédiée de l’atlas 2x2', () => {
  const ids = [
    ['qz17-pda-loading-chief', '0% 0%'],
    ['qz17-email-logistics-denial', '100% 0%'],
    ['qz17-black-box-forklift', '0% 100%'],
    ['qz17-cargo-seal-fragment', '100% 100%']
  ];
  const state = {
    entries: ids.map(([id], index) => ({ id, title: `Preuve ${index + 1}`, type: 'text', source: 'Echo-9', body: 'Preuve physique.', discovered: true, read: true })),
    relations: [], decisions: []
  };
  const { root, ui } = mount(state);
  for (const [id, position] of ids) {
    ui.open(id);
    const visual = root.querySelector(`[data-archive-visual="${id}"]`);
    assert.ok(visual, `vignette absente pour ${id}`);
    assert.equal(visual.attributes.get('role'), 'img');
    assert.match(visual.attributes.get('aria-label'), /Preuve physique récupérée/u);
    assert.equal(visual.style.backgroundSize, '200% 200%');
    assert.equal(visual.style.backgroundPosition, position);
    assert.match(visual.style.backgroundImage, /qz17-narrative-collectables-atlas-v68\.png/u);
  }
});

test('l’overlay mission met en pause sans stop puis restaure pause et focus par bouton ou Escape', () => {
  const documentRef = new FakeDocument();
  const root = documentRef.createElement('section');
  root.hidden = true;
  root.setAttribute('aria-hidden', 'true');
  const closeButton = documentRef.createElement('button');
  const lastControl = documentRef.createElement('button');
  root.append(closeButton, lastControl);
  const canvas = documentRef.createElement('canvas');
  const background = documentRef.createElement('div');
  const readerCalls = [];
  const reader = { open: (entryId, options) => readerCalls.push([entryId, options]) };
  let stopCalls = 0;
  let clearCalls = 0;
  const engine = { running: true, paused: false, keys: { clear: () => { clearCalls += 1; } }, stop: () => { stopCalls += 1; } };
  const overlay = new MissionArchiveOverlayV68({ root, reader, engine, canvas, closeButton, background, documentRef });

  assert.equal(overlay.open('qz17-pda-loading-chief'), true);
  assert.equal(root.hidden, false);
  assert.equal(engine.running, true);
  assert.equal(engine.paused, true);
  assert.equal(stopCalls, 0);
  assert.equal(background.inert, true);
  assert.equal(background.attributes.get('inert'), '');
  assert.equal(background.attributes.get('aria-hidden'), 'true');
  assert.equal(root.attributes.get('aria-hidden'), 'false');
  assert.deepEqual(readerCalls[0], ['qz17-pda-loading-chief', { markRead: true }]);
  assert.equal(documentRef.activeElement, closeButton);

  let tabPrevented = 0;
  root.listeners.get('keydown')({ key: 'Tab', shiftKey: true, preventDefault: () => { tabPrevented += 1; } });
  assert.equal(documentRef.activeElement, lastControl);
  root.listeners.get('keydown')({ key: 'Tab', shiftKey: false, preventDefault: () => { tabPrevented += 1; } });
  assert.equal(documentRef.activeElement, closeButton);
  assert.equal(tabPrevented, 2);

  closeButton.listeners.get('click')();
  assert.equal(root.hidden, true);
  assert.equal(engine.paused, false);
  assert.equal(engine.running, true);
  assert.equal(stopCalls, 0);
  assert.equal(documentRef.activeElement, canvas);
  assert.equal(background.inert, false);
  assert.equal(background.hasAttribute('inert'), false);
  assert.equal(background.hasAttribute('aria-hidden'), false);

  engine.paused = true;
  const previousFocus = documentRef.createElement('button');
  previousFocus.focus();
  overlay.open('qz17-email-logistics-denial');
  let prevented = 0;
  let stopped = 0;
  root.listeners.get('keydown')({ key: 'Escape', preventDefault: () => { prevented += 1; }, stopPropagation: () => { stopped += 1; } });
  assert.equal(root.hidden, true);
  assert.equal(engine.paused, true);
  assert.equal(engine.running, true);
  assert.equal(stopCalls, 0);
  assert.equal(documentRef.activeElement, previousFocus);
  assert.equal(prevented, 1);
  assert.equal(stopped, 1);
  assert.ok(clearCalls >= 4);
});

test('l’overlay rend inertes tous ses frères puis restaure exactement leurs attributs', () => {
  const documentRef = new FakeDocument();
  const playView = documentRef.createElement('section');
  const toolbar = documentRef.createElement('header');
  const retirement = documentRef.createElement('button');
  toolbar.append(retirement);
  toolbar.setAttribute('aria-hidden', 'false');
  const equipment = documentRef.createElement('div');
  equipment.setAttribute('inert', 'legacy');
  equipment.inert = true;
  const root = documentRef.createElement('section');
  root.hidden = true;
  root.setAttribute('aria-hidden', 'true');
  const closeButton = documentRef.createElement('button');
  root.append(closeButton);
  playView.append(toolbar, equipment, root);
  const canvas = documentRef.createElement('canvas');
  const engine = { running: true, paused: false, keys: { clear() {} }, stop() { throw new Error('stop interdit'); } };
  const overlay = new MissionArchiveOverlayV68({ root, reader: { open() {} }, engine, canvas, closeButton, documentRef });

  overlay.open('qz17-pda-loading-chief');
  assert.equal(overlay.snapshot().isolatedBackgrounds, 2);
  for (const sibling of [toolbar, equipment]) {
    assert.equal(sibling.inert, true);
    assert.equal(sibling.getAttribute('aria-hidden'), 'true');
  }
  assert.equal(root.inert, undefined);
  assert.equal(root.getAttribute('aria-hidden'), 'false');

  overlay.close();
  assert.equal(toolbar.inert, false);
  assert.equal(toolbar.hasAttribute('inert'), false);
  assert.equal(toolbar.getAttribute('aria-hidden'), 'false');
  assert.equal(equipment.inert, true);
  assert.equal(equipment.getAttribute('inert'), 'legacy');
  assert.equal(equipment.hasAttribute('aria-hidden'), false);
});

test('V72 fermer les archives après une perte de focus ne relance pas le combat', () => {
  const documentRef = new FakeDocument();
  const root = documentRef.createElement('section');
  const closeButton = documentRef.createElement('button');
  root.append(closeButton);
  const canvas = documentRef.createElement('canvas');
  const engine = {
    running: true, paused: false, focusLossVersionV72: 0, player: { jumpBuffer: 0.14 },
    clearGameplayInput() { this.player.jumpBuffer = 0; }
  };
  const overlay = new MissionArchiveOverlayV68({ root, reader: { open() {} }, engine, canvas, closeButton, documentRef });
  overlay.open();
  assert.equal(engine.player.jumpBuffer, 0);
  engine.focusLossVersionV72 += 1;
  overlay.close();
  assert.equal(engine.paused, true);
});

test('le shell raccorde Commandement, navigation et événement terrain au lecteur V68', async () => {
  const [html, app] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../src/app.js', import.meta.url), 'utf8')
  ]);
  assert.match(html, /data-view="archives"/u);
  assert.match(html, /id="open-archives-command"/u);
  assert.match(html, /id="narrative-archives-v68"/u);
  assert.match(html, /id="mission-archives-overlay-v68"[\s\S]*?role="dialog"[\s\S]*?aria-modal="true"/u);
  assert.match(html, /id="close-mission-archives-v68"/u);
  assert.match(app, /document\.addEventListener\('atf:open-archives'/u);
  assert.match(app, /event\.type === 'archive-reader-open'/u);
  assert.match(app, /narrativeArchiveSave: saveSystem\.data/u);
  assert.match(app, /activeView === 'play' && engine\.running/u);
  assert.doesNotMatch(html, /data-panel="archives"[\s\S]*?<audio\b/iu);
  assert.doesNotMatch(html, /data-panel="archives"[\s\S]*?<video\b/iu);
});
