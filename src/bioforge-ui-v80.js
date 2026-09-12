import {
  BIOFORGE_TERRESTRIAL_ROSTER_V80,
  getBioforgeMaximumQuantityV80,
  getBioforgeRosterEntryV80,
  sanitizeBioforgeV80,
  validateBioforgeSelectionV80
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

export function buildBioforgeUiModelV80(raw) {
  const state = sanitizeBioforgeV80(raw);
  const session = state.activeSession;
  const phase = session?.phase || (state.recovery.purgeRequired ? 'purging' : 'configuration');
  const selection = validateBioforgeSelectionV80(session || state.configuration);
  const profile = selection.profile || getBioforgeRosterEntryV80(state.configuration.profileId);
  const quantity = selection.quantity || 1;
  const maximumQuantity = getBioforgeMaximumQuantityV80(profile?.profileId);
  const active = Boolean(session && session.phase !== 'return');
  const canReturn = !state.recovery.purgeRequired && (!session || session.phase === 'return');
  const activeCount = session?.aliveIds?.length || 0;
  const printed = session?.printedCount || 0;
  const kills = session?.killedIds?.length || 0;
  const outcome = session?.result?.outcome || null;
  const status = state.recovery.purgeRequired
    ? 'PURGE DE RÉCUPÉRATION OBLIGATOIRE'
    : session
      ? `${BIOFORGE_PHASE_LABELS_V80[phase]} · ${printed}/${session.quantity} imprimés · ${kills} neutralisés · ${activeCount} actifs`
      : 'SAS DISPONIBLE · CONFIGUREZ UNE SESSION ISOLÉE';
  return Object.freeze({
    state,
    phase,
    phaseLabel: BIOFORGE_PHASE_LABELS_V80[phase],
    profile,
    profileId: profile?.profileId || null,
    profileLabel: getBioforgeProfileLabelV80(profile?.profileId),
    quantity,
    maximumQuantity,
    unitCost: profile?.cost || 0,
    budget: (profile?.cost || 0) * quantity,
    active,
    canStart: !active && !state.recovery.purgeRequired,
    canPurge: state.recovery.purgeRequired || active,
    canReturn,
    printed,
    kills,
    activeCount,
    outcome,
    status,
    historyCount: state.history.length
  });
}

const requiredElementV80 = (root, selector) => {
  const element = root?.querySelector?.(selector);
  if (!element) throw new Error(`Interface BIOFORGE incomplète : ${selector}`);
  return element;
};

export class BioforgeUiV80 {
  constructor({
    root,
    documentRef = globalThis.document,
    onStart = () => {},
    onPurge = () => {},
    onReturn = () => {},
    onError = () => {}
  } = {}) {
    if (!root || !documentRef) throw new Error('Racine BIOFORGE requise.');
    this.root = root;
    this.document = documentRef;
    this.onStart = onStart;
    this.onPurge = onPurge;
    this.onReturn = onReturn;
    this.onError = onError;
    this.profile = requiredElementV80(root, '#bioforge-profile-v80');
    this.quantity = requiredElementV80(root, '#bioforge-quantity-v80');
    this.thumbnail = requiredElementV80(root, '#bioforge-profile-thumbnail-v80');
    this.preview = requiredElementV80(root, '#bioforge-profile-preview-v80');
    this.profileName = requiredElementV80(root, '#bioforge-profile-name-v80');
    this.cost = requiredElementV80(root, '#bioforge-cost-v80');
    this.status = requiredElementV80(root, '#bioforge-status-v80');
    this.phase = requiredElementV80(root, '#bioforge-phase-v80');
    this.metrics = requiredElementV80(root, '#bioforge-session-metrics-v80');
    this.start = requiredElementV80(root, '#bioforge-start-v80');
    this.purge = requiredElementV80(root, '#bioforge-purge-v80');
    this.returnButton = requiredElementV80(root, '#bioforge-return-v80');
    this.busy = false;
    this.state = null;
    this.populateRoster();
    this.bind();
  }

  populateRoster() {
    this.profile.replaceChildren(...BIOFORGE_TERRESTRIAL_ROSTER_V80.map((entry) => {
      const option = this.document.createElement('option');
      option.value = entry.profileId;
      option.textContent = `${getBioforgeProfileLabelV80(entry.profileId)} · coût ${entry.cost}`;
      return option;
    }));
  }

  bind() {
    this.profile.addEventListener('change', () => this.syncSelection());
    this.quantity.addEventListener('input', () => this.syncSelection());
    this.start.addEventListener('click', () => this.run(() => this.onStart(this.readSelection())));
    this.purge.addEventListener('click', () => this.run(() => this.onPurge()));
    this.returnButton.addEventListener('click', () => this.run(() => this.onReturn()));
  }

  readSelection() {
    return Object.freeze({
      profileId: this.profile.value,
      quantity: Number(this.quantity.value)
    });
  }

  syncSelection() {
    const maximum = Math.max(1, getBioforgeMaximumQuantityV80(this.profile.value));
    const quantity = Math.max(1, Math.min(maximum, Math.floor(Number(this.quantity.value) || 1)));
    this.quantity.max = String(maximum);
    this.quantity.value = String(quantity);
    const profile = getBioforgeRosterEntryV80(this.profile.value);
    const source = profile?.path || '';
    this.preview.src = source;
    this.preview.alt = profile ? `Plaque validée · ${getBioforgeProfileLabelV80(profile.profileId)}` : '';
    this.thumbnail.style.backgroundImage = source ? `url("${source}")` : 'none';
    this.thumbnail.dataset.atlasColumns = '4';
    this.thumbnail.dataset.atlasRows = '8';
    this.thumbnail.dataset.atlasFrame = '0';
    this.profileName.textContent = getBioforgeProfileLabelV80(profile?.profileId);
    this.cost.textContent = `CHARGE ${(profile?.cost || 0) * quantity}/12 · MAX ${maximum}`;
  }

  async run(action) {
    if (this.busy) return false;
    this.busy = true;
    this.root.dataset.busy = 'true';
    try {
      await action();
      return true;
    } catch (error) {
      this.onError(error);
      return false;
    } finally {
      this.busy = false;
      delete this.root.dataset.busy;
    }
  }

  render(raw) {
    const model = buildBioforgeUiModelV80(raw);
    this.state = model.state;
    this.root.dataset.phase = model.phase;
    this.root.dataset.sessionActive = model.active ? 'true' : 'false';
    this.profile.value = model.profileId || BIOFORGE_TERRESTRIAL_ROSTER_V80[0].profileId;
    this.quantity.value = String(model.quantity);
    this.profile.disabled = model.active;
    this.quantity.disabled = model.active;
    this.start.disabled = !model.canStart;
    this.purge.disabled = !model.canPurge;
    this.returnButton.disabled = !model.canReturn;
    this.start.hidden = model.active;
    this.returnButton.hidden = model.active;
    this.purge.hidden = false;
    this.start.textContent = model.outcome || model.phase === 'return' ? 'NOUVELLE SESSION' : 'LANCER LE CYCLE';
    this.phase.textContent = model.phaseLabel;
    this.status.textContent = model.status;
    this.metrics.textContent = `IMPRIMÉS ${model.printed} · NEUTRALISÉS ${model.kills} · ACTIFS ${model.activeCount} · SESSIONS ${model.historyCount}`;
    this.syncSelection();
    return model;
  }
}
