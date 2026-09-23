import {
  BIOFORGE_TERRESTRIAL_ROSTER_V80,
  getBioforgeCapacityV87,
  getBioforgeMaximumQuantityV80,
  getBioforgeRosterEntryV80,
  sanitizeBioforgeV80,
  validateBioforgeCompositionV87
} from './bioforge-session-v80.js';

export const BIOFORGE_PHASE_LABELS_V80 = Object.freeze({
  configuration: 'CONFIGURATION',
  sealing: 'SCELLEMENT DES SAS',
  printing: 'IMPRESSION BIOLOGIQUE',
  combat: 'COMBAT DE CONFINEMENT',
  result: 'RÉSULTAT DE SESSION',
  purging: 'PURGE ATOMIQUE',
  return: 'RETOUR AUTORISÉ'
});

const PROFILE_LABELS_V80 = Object.freeze({
  'enemy-001-ovomorph': 'Ovomorphe',
  'enemy-002-facehugger': 'Facehugger',
  'enemy-003-chestburster': 'Chestburster',
  'enemy-004-drone-big-chap': 'Drone Big Chap',
  'enemy-005-warrior': 'Warrior',
  'enemy-006-runner': 'Runner',
  'enemy-015-prowler': 'Prowler',
  'enemy-016-burster': 'Burster',
  'enemy-020-k-series-yellow-xenomorph': 'Xénomorphe K-Series',
  'enemy-050-korari-stalker': 'Korari Stalker',
  'enemy-055-albino-chestburster': 'Chestburster albinos'
});

export function getBioforgeProfileLabelV80(profileId) {
  return PROFILE_LABELS_V80[profileId] || String(profileId || 'Profil inconnu');
}


const TOTAL_LIMIT_V87 = 48;
const ACTIVE_LIMIT_V87 = 12;
let requestSerialV87 = 0;
const copyCompositionV87 = lines => lines.map(({ lineId, profileId, quantity }) => ({ lineId, profileId, quantity }));
const totalV87 = lines => lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0);
const configurationV87 = source => ({
  composition: copyCompositionV87(source?.composition?.length ? source.composition : [{
    lineId: 'line-1', profileId: source?.profileId || 'enemy-004-drone-big-chap', quantity: source?.quantity || 1
  }]),
  maxConcurrent: source?.maxConcurrent || ACTIVE_LIMIT_V87
});

export function buildBioforgeUiModelV80(raw, { population } = {}) {
  const state = sanitizeBioforgeV80(raw);
  const session = state.activeSession;
  const phase = session?.phase || (state.recovery.purgeRequired ? 'purging' : 'configuration');
  const configuration = configurationV87(session || state.configuration);
  const composition = configuration.composition;
  const profile = getBioforgeRosterEntryV80(composition[0]?.profileId);
  const active = Boolean(session && session.phase !== 'return');
  const capacity = session ? getBioforgeCapacityV87(session, { population }) : null;
  const printed = capacity?.printed ?? session?.printedCount ?? 0;
  const pending = capacity?.pending ?? 0;
  const activeCount = capacity?.activeCount ?? session?.aliveIds?.length ?? 0;
  const activeCost = capacity?.activeCost ?? 0;
  const reservedCount = capacity?.reservedCount ?? 0;
  const reservedCost = capacity?.reservedCost ?? 0;
  const quantity = capacity?.total ?? totalV87(composition);
  const cancelled = session?.queue?.filter(entry => entry.status === 'cancelled').length || 0;
  const kills = session?.killedIds?.length || 0;
  const outcome = session?.result?.outcome || null;
  const canEditQueue = active && !state.recovery.purgeRequired && ['printing', 'combat'].includes(phase);
  const waitingReason = canEditQueue && pending > 0 && capacity?.canPrint === false ? capacity.reason : null;
  const waitingLabel = {
    'active-count-capacity': 'PLAFOND SIMULTANÉ ATTEINT',
    'active-cost-capacity': 'BUDGET ACTIF OCCUPÉ'
  }[waitingReason];
  const status = state.recovery.purgeRequired
    ? 'PURGE DE RÉCUPÉRATION OBLIGATOIRE'
    : session
      ? `${BIOFORGE_PHASE_LABELS_V80[phase]} · ${pending} en attente · ${printed}/${quantity} imprimés · ${activeCount} vivants${waitingLabel ? ` · IMPRESSION EN ATTENTE : ${waitingLabel}` : ''}`
      : 'SAS DISPONIBLE · COMPOSEZ UNE SESSION ISOLÉE';
  return Object.freeze({
    state, phase, phaseLabel: BIOFORGE_PHASE_LABELS_V80[phase], configuration, composition,
    profile, profileId: profile?.profileId || null, profileLabel: getBioforgeProfileLabelV80(profile?.profileId),
    quantity, maximumQuantity: getBioforgeMaximumQuantityV80(profile?.profileId),
    totalLimit: TOTAL_LIMIT_V87, maxConcurrent: configuration.maxConcurrent,
    unitCost: profile?.cost || 0, budget: ACTIVE_LIMIT_V87,
    active, canStart: !active && !state.recovery.purgeRequired,
    canPurge: state.recovery.purgeRequired || active,
    canReturn: !state.recovery.purgeRequired && (!session || session.phase === 'return'),
    canEditQueue, waitingReason, printed, pending, cancelled, kills, activeCount, activeCost, reservedCount, reservedCost,
    outcome, status, historyCount: state.history.length,
    lines: composition.map(line => {
      const entries = session?.queue?.filter(entry => entry.lineId === line.lineId) || [];
      return { ...line, pending: entries.filter(entry => entry.status === 'queued').length,
        printed: entries.filter(entry => entry.printedAt != null).length,
        cancelled: entries.filter(entry => entry.status === 'cancelled').length };
    })
  });
}

const requiredElementV80 = (root, selector) => {
  const element = root?.querySelector?.(selector);
  if (!element) throw new Error(`Interface BIOFORGE incomplète : ${selector}`);
  return element;
};
const elementV87 = (document, tag, className = '', text = '') => {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
};
const buttonV87 = (document, text, label, action) => {
  const button = elementV87(document, 'button', 'button', text);
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.addEventListener('click', action);
  return button;
};
function thumbnailV87(document, profileId) {
  const node = elementV87(document, 'span', 'bioforge-profile-thumbnail-v80 bioforge-line-thumbnail-v87');
  const profile = getBioforgeRosterEntryV80(profileId);
  node.style.backgroundImage = profile ? `url("${profile.path}")` : 'none';
  node.dataset.profileId = profileId;
  node.dataset.atlasColumns = '4';
  node.dataset.atlasRows = '8';
  node.dataset.atlasFrame = '0';
  node.setAttribute('aria-hidden', 'true');
  return node;
}
function populateRosterV87(document, select) {
  select.replaceChildren(...BIOFORGE_TERRESTRIAL_ROSTER_V80.map(entry => {
    const option = document.createElement('option');
    option.value = entry.profileId;
    option.textContent = `${getBioforgeProfileLabelV80(entry.profileId)} · coût ${entry.cost}`;
    return option;
  }));
}

// One draft editor serves both the pre-session composition and actual reinforcements.
// Stable line IDs survive reordering; editing the draft never mutates the saved session.
class CompositionEditorV87 {
  constructor({ document, host, profile, quantity, maximum, add, list, summary, onChange, prefix = 'line' }) {
    Object.assign(this, { document, host, profile, quantity, maximum, add, list, summary, onChange, prefix });
    this.lines = [];
    this.selectedId = null;
    this.serial = 0;
    this.usedIds = new Set();
    this.disabled = false;
    this.limit = TOTAL_LIMIT_V87;
    populateRosterV87(document, profile);
    profile.addEventListener('change', () => this.updateSelected());
    quantity.addEventListener('input', () => this.updateSelected());
    maximum.addEventListener('input', () => { this.changed(); });
    add.addEventListener('click', () => {
      if (this.disabled || totalV87(this.lines) >= this.limit) return;
      const line = { lineId: this.nextId(), profileId: this.profile.value, quantity: 1 };
      this.lines.push(line);
      this.selectedId = line.lineId;
      this.showSelected();
      this.changed();
      this.profile.focus?.();
    });
  }
  nextId() {
    let id;
    do { id = `${this.prefix}-${++this.serial}`; } while (this.usedIds.has(id));
    this.usedIds.add(id);
    return id;
  }
  load(configuration, { freshIds = false, usedIds = [] } = {}) {
    for (const id of usedIds) this.usedIds.add(id);
    this.lines = copyCompositionV87(configuration.composition);
    if (freshIds) this.lines = this.lines.map(line => ({ ...line, lineId: this.nextId() }));
    for (const line of this.lines) this.usedIds.add(line.lineId);
    this.selectedId = this.lines[0]?.lineId;
    this.maximum.value = String(configuration.maxConcurrent);
    this.showSelected();
    this.draw();
  }
  selection() {
    return Object.freeze({ composition: Object.freeze(this.lines.map(line => Object.freeze({ ...line }))),
      maxConcurrent: Number(this.maximum.value) });
  }
  valid() {
    const selection = this.selection();
    return totalV87(this.lines) <= this.limit && validateBioforgeCompositionV87(selection).ok;
  }
  showSelected() {
    const line = this.lines.find(entry => entry.lineId === this.selectedId);
    if (!line) return;
    this.profile.value = line.profileId;
    this.quantity.value = String(line.quantity);
    this.quantity.max = String(Math.max(1, this.limit - totalV87(this.lines) + line.quantity));
    const index = this.lines.indexOf(line) + 1;
    this.profile.setAttribute('aria-label', `Profil de la ligne ${index}`);
    this.quantity.setAttribute('aria-label', `Quantité de la ligne ${index}`);
  }
  updateSelected() {
    if (this.disabled) return;
    const line = this.lines.find(entry => entry.lineId === this.selectedId);
    if (!line) return;
    line.profileId = this.profile.value;
    // Keep invalid input visible and block submission instead of silently truncating it.
    line.quantity = Number(this.quantity.value);
    this.changed();
  }
  changed() { this.draw(); this.onChange?.(); }
  draw() {
    const sum = totalV87(this.lines);
    const selected = this.lines.find(line => line.lineId === this.selectedId);
    this.quantity.max = String(Math.max(1, this.limit - sum + Number(selected?.quantity || 0)));
    this.summary.textContent = `TOTAL ${sum}/${this.limit} · MAX SIMULTANÉ ${this.maximum.value}/12 · BUDGET ACTIF 12${this.valid() ? '' : ' · COMPOSITION INVALIDE'}`;
    this.summary.dataset.valid = this.valid() ? 'true' : 'false';
    const rowsKey = JSON.stringify([this.lines, this.selectedId, this.disabled]);
    if (rowsKey !== this.rowsKey) {
    this.rowsKey = rowsKey;
    this.list.replaceChildren(...this.lines.map((line, index) => {
      const row = elementV87(this.document, 'li', 'bioforge-composition-line-v87');
      row.dataset.lineId = line.lineId;
      row.dataset.selected = String(line.lineId === this.selectedId);
      const name = getBioforgeProfileLabelV80(line.profileId);
      const select = buttonV87(this.document, `${index + 1}. ${name} × ${line.quantity}`, `Modifier la ligne ${index + 1} : ${name}`, () => {
        if (this.disabled) return;
        this.selectedId = line.lineId;
        this.showSelected();
        this.changed();
        this.profile.focus?.();
      });
      select.className += ' bioforge-line-select-v87';
      select.setAttribute('aria-pressed', String(line.lineId === this.selectedId));
      const actions = elementV87(this.document, 'div', 'bioforge-line-actions-v87');
      const move = offset => {
        if (this.disabled) return;
        const next = index + offset;
        if (next < 0 || next >= this.lines.length) return;
        [this.lines[index], this.lines[next]] = [this.lines[next], this.lines[index]];
        this.selectedId = line.lineId;
        this.showSelected();
        this.changed();
        this.focusLine(line.lineId);
      };
      const up = buttonV87(this.document, '↑', `Monter la ligne ${index + 1}`, () => move(-1));
      const down = buttonV87(this.document, '↓', `Descendre la ligne ${index + 1}`, () => move(1));
      const remove = buttonV87(this.document, 'RETIRER', `Retirer la ligne ${index + 1} : ${name}`, () => {
        if (this.disabled || this.lines.length === 1) return;
        this.lines.splice(index, 1);
        this.selectedId = this.lines[Math.min(index, this.lines.length - 1)].lineId;
        this.showSelected();
        this.changed();
        this.focusLine(this.selectedId);
      });
      select.disabled = this.disabled;
      up.disabled = this.disabled || index === 0;
      down.disabled = this.disabled || index === this.lines.length - 1;
      remove.disabled = this.disabled || this.lines.length === 1;
      actions.replaceChildren(up, down, remove);
      row.replaceChildren(thumbnailV87(this.document, line.profileId), select, actions);
      return row;
    }));
    }
    for (const input of [this.profile, this.quantity, this.maximum]) input.disabled = this.disabled;
    this.add.disabled = this.disabled || sum >= this.limit;
  }
  focusLine(id) {
    this.list.children[this.lines.findIndex(line => line.lineId === id)]?.children[1]?.focus?.();
  }
  setDisabled(value) { this.disabled = value; this.draw(); }
}
function createReinforcementEditorV87(document, host, onChange) {
  const makeInput = (text, type, min, max, value) => {
    const label = elementV87(document, 'label', '', text);
    const input = document.createElement(type === 'select' ? 'select' : 'input');
    if (type !== 'select') Object.assign(input, { type: 'number', min, max, step: '1', value, inputMode: 'numeric' });
    label.appendChild(input);
    return { label, input };
  };
  const profile = makeInput('ORGANISME DU RENFORT', 'select');
  const quantity = makeInput('QUANTITÉ', 'number', '1', '48', '1');
  const maximum = makeInput('MAXIMUM SIMULTANÉ DE LA SESSION', 'number', '1', '12', '12');
  maximum.input.disabled = true;
  const controls = elementV87(document, 'div', 'bioforge-config-v80');
  controls.replaceChildren(profile.label, quantity.label);
  const add = buttonV87(document, 'AJOUTER UNE LIGNE', 'Ajouter une ligne de renfort', () => {});
  const summary = elementV87(document, 'p', 'bioforge-metrics-v80');
  summary.setAttribute('role', 'status');
  const list = elementV87(document, 'ol', 'bioforge-composition-list-v87');
  list.setAttribute('aria-label', 'Composition des renforts à ajouter');
  host.replaceChildren(controls, add, summary, list);
  // The session cap cannot change mid-combat. It remains part of the validated payload.
  return new CompositionEditorV87({ document, host, profile: profile.input, quantity: quantity.input,
    maximum: maximum.input, add, summary, list, onChange, prefix: 'reinforcement' });
}

export class BioforgeUiV80 {
  constructor({ root, documentRef = globalThis.document, onStart = () => {}, onPurge = () => {},
    onReturn = () => {}, onReinforce = null, onCancelPending = null, onError = () => {} } = {}) {
    if (!root || !documentRef) throw new Error('Racine BIOFORGE requise.');
    Object.assign(this, { root, document: documentRef, onStart, onPurge, onReturn, onReinforce, onCancelPending, onError });
    for (const [key, id] of Object.entries({ profile: 'profile-v80', quantity: 'quantity-v80',
      thumbnail: 'profile-thumbnail-v80', preview: 'profile-preview-v80', profileName: 'profile-name-v80',
      cost: 'cost-v80', status: 'status-v80', phase: 'phase-v80', metrics: 'session-metrics-v80',
      start: 'start-v80', purge: 'purge-v80', returnButton: 'return-v80', queuePanel: 'queue-panel-v87',
      queueList: 'queue-v87', cancelPending: 'cancel-pending-v87', reinforcements: 'reinforcements-v87',
      reinforce: 'reinforce-v87' })) this[key] = requiredElementV80(root, '#bioforge-' + id);
    this.busy = false;
    this.state = null;
    this.model = null;
    this.editor = new CompositionEditorV87({ document: this.document,
      host: requiredElementV80(root, '#bioforge-composition-editor-v87'), profile: this.profile, quantity: this.quantity,
      maximum: requiredElementV80(root, '#bioforge-max-concurrent-v87'), add: requiredElementV80(root, '#bioforge-add-line-v87'),
      list: requiredElementV80(root, '#bioforge-composition-v87'), summary: requiredElementV80(root, '#bioforge-composition-summary-v87'),
      onChange: () => { this.syncSelection(); this.refreshActions(); } });
    this.reinforcementEditor = createReinforcementEditorV87(this.document,
      requiredElementV80(root, '#bioforge-reinforcement-editor-v87'),
      () => { this.reinforcementRequest = null; this.refreshActions(); });
    this.start.addEventListener('click', () => {
      if (this.model?.canStart && this.editor.valid()) this.run(() => this.onStart(this.readSelection()));
    });
    this.purge.addEventListener('click', () => {
      if (this.model?.canPurge) this.run(() => this.onPurge());
    });
    this.returnButton.addEventListener('click', () => {
      if (this.model?.canReturn) this.run(() => this.onReturn());
    });
    this.reinforce.addEventListener('click', () => this.submitReinforcements());
    this.cancelPending.addEventListener('click', () => this.cancelQueue({}));
  }
  readSelection() { return this.editor.selection(); }
  syncSelection() {
    const profile = getBioforgeRosterEntryV80(this.profile.value);
    const source = profile?.path || '';
    this.preview.src = source;
    this.preview.alt = profile ? `Plaque validée · ${getBioforgeProfileLabelV80(profile.profileId)}` : '';
    this.thumbnail.style.backgroundImage = source ? `url("${source}")` : 'none';
    this.thumbnail.dataset.atlasColumns = '4';
    this.thumbnail.dataset.atlasRows = '8';
    this.thumbnail.dataset.atlasFrame = '0';
    this.profileName.textContent = getBioforgeProfileLabelV80(profile?.profileId);
    this.cost.textContent = `COÛT ACTIF UNITAIRE ${profile?.cost || 0}/12 · APERÇU NON DÉFORMÉ`;
  }
  async submitReinforcements() {
    if (this.busy || !this.model?.canEditQueue || typeof this.onReinforce !== 'function' || !this.reinforcementEditor.valid()) return false;
    const configuration = this.reinforcementEditor.selection();
    this.reinforcementRequest ||= `bioforge-ui-${Date.now()}-${++requestSerialV87}`;
    const accepted = await this.run(() => this.onReinforce(configuration, { requestId: this.reinforcementRequest }));
    if (accepted) {
      this.reinforcementRequest = null;
      this.resetReinforcements();
      this.refreshActions();
    }
    return accepted;
  }
  cancelQueue(selection) {
    if (!this.model?.canEditQueue || !this.model.pending || typeof this.onCancelPending !== 'function') return false;
    return this.run(() => this.onCancelPending(selection));
  }
  resetReinforcements() {
    this.reinforcementEditor.load({ composition: [{ lineId: 'draft', profileId: this.model.profileId, quantity: 1 }],
      maxConcurrent: this.model.maxConcurrent }, { freshIds: true, usedIds: this.model.composition.map(line => line.lineId) });
  }
  async run(action) {
    if (this.busy) return false;
    this.busy = true;
    this.root.dataset.busy = 'true';
    this.refreshActions();
    try {
      const receipt = await action();
      if (receipt === false || receipt?.ok === false || receipt?.started === false || receipt?.applied === false) {
        throw new Error(receipt?.message || receipt?.reason || receipt?.code || 'BIOFORGE · action refusée par le runtime.');
      }
      return true;
    } catch (error) {
      this.onError(error);
      return false;
    } finally {
      this.busy = false;
      delete this.root.dataset.busy;
      this.refreshActions();
    }
  }
  refreshActions() {
    const model = this.model;
    if (!model) return;
    this.editor.setDisabled(model.active || this.busy || !model.canStart);
    this.reinforcementEditor.limit = Math.max(0, TOTAL_LIMIT_V87 - model.quantity);
    this.reinforcementEditor.setDisabled(this.busy || !model.canEditQueue);
    this.reinforcementEditor.maximum.value = String(model.maxConcurrent);
    this.reinforcementEditor.maximum.disabled = true;
    this.start.disabled = this.busy || !model.canStart || !this.editor.valid();
    this.purge.disabled = this.busy || !model.canPurge;
    this.returnButton.disabled = this.busy || !model.canReturn;
    this.reinforcements.hidden = !model.canEditQueue || typeof this.onReinforce !== 'function';
    this.reinforce.disabled = this.busy || this.reinforcements.hidden || !this.reinforcementEditor.valid();
    this.cancelPending.hidden = !model.canEditQueue || typeof this.onCancelPending !== 'function';
    this.cancelPending.disabled = this.busy || !model.pending;
    this.renderQueue();
  }
  renderQueue() {
    const model = this.model;
    this.queuePanel.hidden = !model.state.activeSession;
    const key = JSON.stringify([model.lines, model.canEditQueue, this.busy, Boolean(this.onCancelPending)]);
    if (key === this.queueKey) return;
    this.queueKey = key;
    this.queueList.replaceChildren(...model.lines.map(line => {
      const row = elementV87(this.document, 'li', 'bioforge-composition-line-v87');
      row.dataset.lineId = line.lineId;
      const label = elementV87(this.document, 'span', 'bioforge-queue-line-label-v87',
        `${getBioforgeProfileLabelV80(line.profileId)} × ${line.quantity} · ${line.pending} en attente · ${line.printed} imprimés · ${line.cancelled} annulés`);
      const cancel = buttonV87(this.document, 'ANNULER L’ATTENTE',
        `Annuler les ${line.pending} spécimens en attente de ${getBioforgeProfileLabelV80(line.profileId)}`,
        () => this.cancelQueue({ lineId: line.lineId }));
      cancel.hidden = !model.canEditQueue || typeof this.onCancelPending !== 'function';
      cancel.disabled = this.busy || !line.pending;
      row.replaceChildren(thumbnailV87(this.document, line.profileId), label, cancel);
      return row;
    }));
  }
  render(raw, options = {}) {
    const model = buildBioforgeUiModelV80(raw, options);
    const previousSession = this.model?.state.activeSession?.id;
    this.model = model;
    this.state = model.state;
    const key = JSON.stringify([model.state.serial, model.state.configuration, model.active]);
    if (options.resetDraft || key !== this.sourceKey) {
      this.editor.load(model.configuration);
      this.sourceKey = key;
    }
    if (options.resetDraft || !this.reinforcementEditor.lines.length || previousSession !== model.state.activeSession?.id) {
      this.reinforcementRequest = null;
      this.resetReinforcements();
    }
    this.root.dataset.phase = model.phase;
    this.root.dataset.sessionActive = model.active ? 'true' : 'false';
    this.editor.host.hidden = model.active;
    this.start.hidden = model.active;
    this.returnButton.hidden = model.active;
    this.purge.hidden = false;
    this.start.textContent = model.outcome || model.phase === 'return' ? 'NOUVELLE SESSION' : 'LANCER LE CYCLE';
    this.phase.textContent = model.phaseLabel;
    this.status.textContent = model.status;
    this.metrics.textContent = model.state.activeSession
      ? `SESSION — TOTAL ${model.quantity}/48 · EN ATTENTE ${model.pending} · IMPRIMÉS ${model.printed} · VIVANTS ${model.activeCount}/${model.maxConcurrent} · BUDGET ACTIF ${model.activeCost}/12 · RÉSERVÉ ${model.reservedCount} / COÛT ${model.reservedCost} · ANNULÉS ${model.cancelled} · NEUTRALISÉS ${model.kills} · SESSIONS ${model.historyCount}`
      : `AUCUNE SESSION EN COURS · SESSIONS TERMINÉES ${model.historyCount}`;
    this.syncSelection();
    this.refreshActions();
    return model;
  }
}
