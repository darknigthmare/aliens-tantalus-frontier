import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CatalogWorkbenchV62,
  CatalogSpriteAnimatorV62,
  formatCatalogValueV62,
  getCatalogSpriteFrameV62,
  normalizeCatalogActionsV62,
  resolveCatalogQueryStateV62
} from '../src/catalog-ui-v62.js';
import {
  CATALOG_UNKNOWN_V62,
  getCatalogEntryV62,
  getCatalogNodeV62
} from '../src/catalog-runtime-v62.js';

class FakeClassList {
  constructor() { this.values = new Set(); }
  add(...values) { values.forEach((value) => this.values.add(value)); }
  remove(...values) { values.forEach((value) => this.values.delete(value)); }
  contains(value) { return this.values.has(value); }
  toggle(value, force) {
    const enabled = force === undefined ? !this.values.has(value) : Boolean(force);
    if (enabled) this.values.add(value);
    else this.values.delete(value);
    return enabled;
  }
}

class FakeStyle {
  constructor() { this.values = new Map(); }
  setProperty(key, value) { this.values.set(key, String(value)); }
}

const datasetName = (attribute) => attribute.replace(/^data-/u, '').replace(/-([a-z])/gu, (_match, letter) => letter.toUpperCase());

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.parentNode = null;
    this.dataset = {};
    this.classList = new FakeClassList();
    this.style = new FakeStyle();
    this.attributes = new Map();
    this.listeners = new Map();
    this.hidden = false;
    this.disabled = false;
    this.value = '';
    this.type = '';
    this._text = '';
  }

  get className() { return [...this.classList.values].join(' '); }
  set className(value) {
    this.classList = new FakeClassList();
    String(value || '').split(/\s+/u).filter(Boolean).forEach((entry) => this.classList.add(entry));
  }
  get textContent() { return this._text + this.children.map((child) => child.textContent || '').join(''); }
  set textContent(value) { this._text = String(value || ''); this.children = []; }
  append(...nodes) {
    for (const node of nodes) {
      if (!node) continue;
      node.parentNode = this;
      this.children.push(node);
    }
  }
  replaceChildren(...nodes) { this.children = []; this._text = ''; this.append(...nodes); }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name.startsWith('data-')) this.dataset[datasetName(name)] = String(value);
  }
  addEventListener(name, listener) { this.listeners.set(name, listener); }
  removeEventListener(name) { this.listeners.delete(name); }
  contains(element) {
    for (let current = element; current; current = current.parentNode) if (current === this) return true;
    return false;
  }
  matches(selector) {
    const datasetMatch = selector.match(/^\[data-([a-z0-9-]+)(?:="([^"]+)")?\]$/u);
    if (!datasetMatch) return false;
    const key = datasetName(`data-${datasetMatch[1]}`);
    return Object.hasOwn(this.dataset, key) && (datasetMatch[2] === undefined || this.dataset[key] === datasetMatch[2]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  querySelectorAll(selector) {
    const matches = [];
    const visit = (node) => {
      for (const child of node.children) {
        if (child.matches?.(selector)) matches.push(child);
        visit(child);
      }
    };
    visit(this);
    return matches;
  }
  closest(selector) {
    for (let current = this; current; current = current.parentNode) if (current.matches?.(selector)) return current;
    return null;
  }
  focus() {
    if (this.ownerDocument.activeElement) this.ownerDocument.activeElement.focused = false;
    this.focused = true;
    this.ownerDocument.activeElement = this;
  }
}

class FakeDocument {
  constructor() {
    this.documentElement = new FakeElement('html', this);
  }
  createElement(tagName) { return new FakeElement(tagName, this); }
}

const makeWorkbench = ({ catalogs = ['enemies'], query = '', getActions, reducedMotion = true } = {}) => {
  const documentRef = new FakeDocument();
  const root = documentRef.createElement('section');
  const tree = documentRef.createElement('aside');
  const list = documentRef.createElement('main');
  const detail = documentRef.createElement('aside');
  const search = documentRef.createElement('input');
  search.value = query;
  root.append(tree, list, detail);
  const workbench = new CatalogWorkbenchV62({
    root,
    tree,
    list,
    detail,
    search,
    catalogs,
    getActions,
    limit: 8,
    reducedMotion
  });
  return { workbench, root, tree, list, detail, search };
};

test('la recherche UI sélectionne le meilleur résultat et ouvre tous ses ancêtres', () => {
  const state = resolveCatalogQueryStateV62({ catalogs: ['vehicles'], query: 'p 5000 powered', limit: 5 });
  assert.equal(state.bestEntry.id, 'vehicle-007-p-5000-powered-work-loader');
  assert.equal(state.selectedEntry.id, state.bestEntry.id);
  assert.ok(state.bestEntry.ancestryIds.every((id) => state.expandedNodeIds.includes(id)));
  assert.ok(state.records.every((record) => record.catalog === 'vehicles'));
});

test('un nœud actif filtre réellement ses descendants sans recherche textuelle', () => {
  const entry = getCatalogEntryV62('enemy-001-ovomorph');
  const casteNodeId = entry.ancestryIds.find((id) => id.includes('/caste:'));
  const node = getCatalogNodeV62(casteNodeId);
  const state = resolveCatalogQueryStateV62({ catalogs: ['enemies'], activeNodeId: casteNodeId });
  assert.equal(state.activeNode.id, casteNodeId);
  assert.equal(state.records.length, node.count);
  assert.ok(state.records.every((record) => node.descendantEntryIds.includes(record.id)));
});

test('le cadrage de sprite emploie les vraies cellules du clip idle', () => {
  const record = getCatalogEntryV62('enemy-004-drone-big-chap');
  const first = getCatalogSpriteFrameV62(record.visual, 0);
  const second = getCatalogSpriteFrameV62(record.visual, 1);
  assert.deepEqual(first, {
    path: record.visual.path,
    frame: 0,
    column: 0,
    row: 0,
    columns: 4,
    rows: record.visual.grid.rows,
    widthPercent: 400,
    heightPercent: record.visual.grid.rows * 100,
    translateXPercent: -0,
    translateYPercent: -0
  });
  assert.equal(second.frame, 1);
  assert.equal(second.translateXPercent, -25);
  assert.equal(getCatalogSpriteFrameV62(null), null);
});

test('les actions conservent leurs datasets de gameplay sans perdre les valeurs vides valides', () => {
  const actions = normalizeCatalogActionsV62([{
    id: 'procure',
    label: 'ACQUÉRIR',
    dataset: {
      'data-procure-kind': 'weapon',
      procureId: 'weapon-001-m41a-pulse-rifle',
      selected: true,
      ignored: false
    }
  }]);
  assert.deepEqual(actions[0].dataset, {
    procureKind: 'weapon',
    procureId: 'weapon-001-m41a-pulse-rifle',
    selected: ''
  });
  assert.equal(Object.isFrozen(actions), true);
});

test('le laboratoire V66 sélectionne les quatre clips, parcourt huit poses et fige la mort', () => {
  const documentRef = new FakeDocument();
  const target = documentRef.createElement('section');
  const previewClips = ['sealed', 'opening', 'hatch', 'destroyed'].map((id, ordinal) => ({ sheetId: 'fixture.ovomorph.v66', clip: { id, frames: Array.from({ length: 8 }, (_, index) => ordinal * 8 + index), fps: ordinal ? 10 : 6, loop: ordinal === 0 } }));
  const visual = { sheetId: 'fixture.ovomorph.v66', path: '/fixture-v66.webp', grid: { columns: 4, rows: 8 }, idleClip: previewClips[0], previewClips };
  assert.equal(getCatalogSpriteFrameV62(visual, 99, 'destroyed').frame, 31);
  assert.equal(getCatalogSpriteFrameV62(visual, 9, 'sealed').frame, 1);
  assert.equal(getCatalogSpriteFrameV62(visual, 0, 'unknown'), null);
  const previousSetInterval = globalThis.setInterval;
  const previousClearInterval = globalThis.clearInterval;
  const callbacks = new Map();
  let nextTimer = 0;
  globalThis.setInterval = (callback) => { const id = ++nextTimer; callbacks.set(id, callback); return id; };
  globalThis.clearInterval = (id) => callbacks.delete(id);
  const animator = new CatalogSpriteAnimatorV62({ documentRef, reducedMotion: false });
  try {
    const viewport = animator.mount(target, visual, 'Ovomorph', { detail: true });
    const select = target.querySelector('[data-animation-clip-select]');
    assert.ok(select);
    assert.equal(select.children.length, 4);
    assert.equal(viewport.dataset.frame, '0');
    select.value = 'destroyed';
    select.listeners.get('change')();
    assert.equal(viewport.dataset.clipId, 'destroyed');
    assert.equal(viewport.dataset.frame, '24');
    const tick = [...callbacks.values()][0];
    const poses = [Number(viewport.dataset.frame)];
    for (let index = 0; index < 7; index += 1) { tick(); poses.push(Number(viewport.dataset.frame)); }
    assert.deepEqual(poses, [24, 25, 26, 27, 28, 29, 30, 31]);
    assert.equal(callbacks.size, 0, 'un clip terminal ne reboucle pas sur un oeuf vivant');
    target.querySelector('[data-animation-replay]').listeners.get('click')();
    assert.equal(viewport.dataset.frame, '24');
    assert.equal(callbacks.size, 1);
  } finally {
    animator.clear();
    assert.equal(callbacks.size, 0);
    globalThis.setInterval = previousSetInterval;
    globalThis.clearInterval = previousClearInterval;
  }
});

test('les valeurs inconnues sont signalées sans inventer de donnée', () => {
  assert.equal(formatCatalogValueV62(CATALOG_UNKNOWN_V62), 'NON DOCUMENTÉ');
  assert.equal(formatCatalogValueV62([]), null);
  assert.equal(formatCatalogValueV62(false), 'NON');
});

test('V72 pages the complete roster and keeps list previews static', () => {
  const { workbench, root, list } = makeWorkbench();
  assert.match(list.textContent, /571/);
  assert.equal(list.querySelectorAll('[data-catalog-entry-card]').length, 48);
  assert.ok([...workbench.animator.animations].every((animation) => animation.timer === null));
  const more = list.querySelector('[data-catalog-show-more]');
  root.listeners.get('click')({ target: more });
  assert.equal(list.querySelectorAll('[data-catalog-entry-card]').length, 96);
  workbench.setQuery('queen');
  assert.ok(list.querySelectorAll('[data-catalog-entry-card]').length <= 48);
  workbench.destroy();
});

test('V72 keeps only the detail timer when motion is enabled, including after pagination', () => {
  const previousSetInterval = globalThis.setInterval;
  const previousClearInterval = globalThis.clearInterval;
  const callbacks = new Map();
  let nextTimer = 0;
  globalThis.setInterval = (callback) => { const id = ++nextTimer; callbacks.set(id, callback); return id; };
  globalThis.clearInterval = (id) => callbacks.delete(id);
  let workbench;
  try {
    const fixture = makeWorkbench({ reducedMotion: false });
    ({ workbench } = fixture);
    const assertOnlyDetailAnimates = () => {
      assert.equal(callbacks.size, 1);
      const active = [...workbench.animator.animations].filter((animation) => animation.timer !== null);
      assert.equal(active.length, 1);
      assert.ok(fixture.detail.contains(active[0].image));
      assert.equal(fixture.list.contains(active[0].image), false);
    };
    assertOnlyDetailAnimates();
    const firstTimer = [...callbacks.keys()][0];
    fixture.root.listeners.get('click')({ target: fixture.list.querySelector('[data-catalog-show-more]') });
    assert.equal(fixture.list.querySelectorAll('[data-catalog-entry-card]').length, 96);
    assert.equal(callbacks.has(firstTimer), false, 'rerender disposes the former detail timer');
    assertOnlyDetailAnimates();
  } finally {
    workbench?.destroy();
    assert.equal(callbacks.size, 0);
    globalThis.setInterval = previousSetInterval;
    globalThis.clearInterval = previousClearInterval;
  }
});

test('V72 final page restores keyboard focus to the first newly revealed card', () => {
  const { workbench, root, list } = makeWorkbench();
  try {
    let previousCount = 0;
    for (let page = 0; page < 20; page += 1) {
      const more = list.querySelector('[data-catalog-show-more]');
      if (!more) break;
      previousCount = list.querySelectorAll('[data-catalog-entry-card]').length;
      more.focus();
      root.listeners.get('click')({ target: more });
      const nextMore = list.querySelector('[data-catalog-show-more]');
      if (nextMore) assert.ok(list.ownerDocument.activeElement === nextMore, 'intermediate pages retain show-more focus');
    }
    assert.equal(list.querySelector('[data-catalog-show-more]'), null);
    const cards = list.querySelectorAll('[data-catalog-entry]');
    assert.equal(cards.length, Number(root.dataset.catalogCount));
    assert.ok(list.ownerDocument.activeElement === cards[previousCount], 'the first new card receives final-page focus');
  } finally {
    workbench.destroy();
  }
});

test('V72 playback controls precede the wrapping scale comparison for K-Series020', () => {
  const { workbench, detail } = makeWorkbench();
  try {
    workbench.selectEntry('enemy-020-k-series-yellow-xenomorph');
    const controls = detail.querySelector('[data-animation-controls]');
    const comparison = detail.querySelector('[data-comparison-entry]');
    assert.ok(controls && comparison);
    const directChild = (node) => {
      while (node.parentNode !== detail) node = node.parentNode;
      return node;
    };
    assert.ok(detail.children.indexOf(directChild(controls)) < detail.children.indexOf(directChild(comparison)),
      'the clip selector remains adjacent to its portrait when a fourth silhouette wraps');
  } finally { workbench.destroy(); }
});

test('V72 identifies an unavailable sheet in its card, detail and comparison without fabricating art', () => {
  const { workbench, list, detail } = makeWorkbench();
  const id = 'enemy-019-red-xenomorph';
  try {
    assert.ok(getCatalogEntryV62(id).visual);
    assert.equal(getCatalogSpriteFrameV62(getCatalogEntryV62(id).visual), null);
    assert.equal(workbench.selectEntry(id), true);
    const card = list.querySelector(`[data-catalog-entry="${id}"]`);
    assert.ok(card.querySelector('[data-catalog-media-missing]'));
    assert.match(card.textContent, /MÉDIA VISUEL NON DOCUMENTÉ/u);
    assert.equal(card.querySelector('[data-sheet-id]'), null);
    const comparison = detail.querySelector(`[data-comparison-entry="${id}"]`);
    assert.ok(comparison.querySelector('[data-catalog-media-missing]'));
    assert.equal(comparison.querySelector('[data-sheet-id]'), null);
    assert.equal(detail.querySelectorAll('[data-catalog-media-missing]').length, 2,
      'the detail portrait and selected comparison both explain the absent media');
    assert.equal(detail.querySelectorAll('[data-sheet-id]').length, 3,
      'only the three real reference sheets remain in the comparison');
  } finally {
    workbench.destroy();
  }
});

test('le contrôleur DOM rend arbre, cellules réelles, détail et actions délégables', () => {
  const { workbench, root, tree, list, detail } = makeWorkbench({
    catalogs: ['vehicles'],
    query: 'p 5000 powered',
    getActions: (record) => [{
      id: 'assign',
      label: 'AFFECTER',
      dataset: { selectVehicle: record.id }
    }]
  });
  assert.equal(workbench.getSnapshot().selectedEntryId, 'vehicle-007-p-5000-powered-work-loader');
  assert.ok(tree.querySelectorAll('[data-catalog-node]').length > 0);
  assert.ok(list.querySelector('[data-catalog-entry="vehicle-007-p-5000-powered-work-loader"]'));
  const actionButtons = root.querySelectorAll('[data-catalog-action]');
  assert.ok(actionButtons.length >= 2);
  assert.ok(actionButtons.every((button) => String(button.dataset.selectVehicle || '').startsWith('vehicle-')));
  assert.ok(actionButtons.some((button) => button.dataset.selectVehicle === 'vehicle-007-p-5000-powered-work-loader'));
  const frame = list.querySelector('[data-catalog-entry="vehicle-007-p-5000-powered-work-loader"]')
    .querySelector('[data-sheet-id]');
  assert.ok(frame);
  assert.match(frame.dataset.sheetId, /^vehicle\./u);
  assert.match(detail.textContent, /FAITS DE RÉFÉRENCE/u);
  assert.match(detail.textContent, /STATISTIQUES DE GAMEPLAY/u);
  assert.match(detail.textContent, /comparateur masqué/iu);
  workbench.destroy();
});

test('l’arborescence garde un nœud replié hors auto-ouverture de recherche', () => {
  const { workbench } = makeWorkbench({ catalogs: ['vehicles'] });
  assert.ok(workbench.getSnapshot().expandedNodeIds.includes('catalog:vehicles'));
  assert.equal(workbench.selectNode('catalog:vehicles'), true);
  assert.equal(workbench.getSnapshot().expandedNodeIds.includes('catalog:vehicles'), false);
  workbench.setQuery('p 5000 powered');
  assert.ok(workbench.getSnapshot().expandedNodeIds.includes('catalog:vehicles'));
  workbench.destroy();
});

test('une relation biologique révèle et sélectionne la cible hors du filtre courant', () => {
  const { workbench, detail } = makeWorkbench({ catalogs: ['enemies'], query: 'ovomorph' });
  assert.equal(workbench.getSnapshot().selectedEntryId, 'enemy-001-ovomorph');
  const relationButton = detail.querySelector('[data-catalog-relation-entry]');
  assert.ok(relationButton);
  assert.equal(workbench.selectEntry(relationButton.dataset.catalogRelationEntry), true);
  assert.equal(workbench.getSnapshot().selectedEntryId, relationButton.dataset.catalogRelationEntry);
  assert.equal(workbench.getSnapshot().query, '');
  workbench.destroy();
});
