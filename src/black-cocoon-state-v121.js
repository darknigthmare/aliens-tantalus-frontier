// Original playable adaptation of the requested hive escape; no private source text.
export const BLACK_COCOON_OPERATION_V121 = 'black-cocoon';
export const BLACK_COCOON_CAMPAIGN_V121 = Object.freeze({
  id: 'special-black-cocoon', name: 'COCON NOIR', mode: 'SURVIVAL', worldId: 'world-05-lethe',
  year: 2204, canon: 'project-continuity', routes: 3, summary: 'Exfiltration semi-discrète de la ruche et retour contrôlé au Tantalus.',
  source: 'Tantalus Special Operations',
  specialOperationId: BLACK_COCOON_OPERATION_V121, templateId: 'colony-multiroute',
  objective: 'Se libérer de la ruche, rejoindre une extraction et revenir au Tantalus.',
  description: 'Une exfiltration semi-discrète depuis les tunnels colonisés. Deux sorties, un relais à rétablir et une extraction sous pression.'
});
export const BLACK_COCOON_PHASES_V121 = Object.freeze([
  'cocoon', 'equipment', 'relay', 'surface', 'delta', 'beacons', 'hold', 'board', 'quarantine', 'complete'
]);
export const BLACK_COCOON_TIMING_V121 = Object.freeze({ cut: 4, lift: 6, valve: 3, beacon: 2, approach: 90, scan: 4 });
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const bounded = (value, fallback, max) => Number.isFinite(Number(value)) ? Math.max(0, Math.min(max, Number(value))) : fallback;
const booleanFields = Object.freeze(['freed', 'equipmentRecovered', 'battery', 'relayContact', 'surfaceReached',
  'deltaAbandoned', 'boarded', 'weaponsDeposited', 'complete', 'rewardClaimed', 'purgeUsed', 'watcherSpawned']);

export function blackCocoonPhaseV121(state) {
  if (!state.freed) return 'cocoon';
  if (!state.equipmentRecovered) return 'equipment';
  if (!state.relayContact) return 'relay';
  if (!state.surfaceReached) return 'surface';
  if (!state.deltaAbandoned) return 'delta';
  if (!state.beacons?.every(Boolean)) return 'beacons';
  if (state.extractionElapsed < BLACK_COCOON_TIMING_V121.approach) return 'hold';
  if (!state.boarded) return 'board';
  return state.complete ? 'complete' : 'quarantine';
}

export function createBlackCocoonStateV121() {
  const state = {
    schema: 121, operationId: BLACK_COCOON_OPERATION_V121, phase: 'cocoon',
    alert: 0, noise: 0, quietSeconds: 0, elapsed: 0, cocoonProgress: 0,
    power: null, route: null, liftProgress: 0, valveProgress: 0,
    beacons: [false, false], extractionElapsed: 0, nextWaveAt: 24, wavesSpawned: 0,
    scanProgress: 0, action: null, enemySequence: 0, enemies: [],
    checkpoint: null, journal: ['captured'], rewards: null
  };
  for (const field of booleanFields) state[field] = false;
  return state;
}

export function sanitizeBlackCocoonStateV121(raw = {}) {
  const state = createBlackCocoonStateV121();
  for (const field of booleanFields) state[field] = raw[field] === true;
  for (const [field, max] of Object.entries({ alert: 100, noise: 100, quietSeconds: 600,
    elapsed: 604800, cocoonProgress: 4, liftProgress: 6, valveProgress: 3,
    extractionElapsed: 90, nextWaveAt: 120, wavesSpawned: 4, scanProgress: 4, enemySequence: 32 })) {
    state[field] = bounded(raw[field], state[field], max);
  }
  state.enemySequence = Math.floor(state.enemySequence);
  state.wavesSpawned = Math.floor(state.wavesSpawned);
  state.power = ['battery', 'generator'].includes(raw.power) ? raw.power : null;
  state.route = ['industrial', 'cooling'].includes(raw.route) ? raw.route : null;
  state.beacons = [raw.beacons?.[0] === true, raw.beacons?.[1] === true];
  state.journal = Array.isArray(raw.journal) ? [...new Set(raw.journal.filter(value =>
    ['captured', 'freed', 'equipment', 'battery', 'contact', 'industrial', 'cooling', 'surface', 'delta',
      'beacons', 'watcher', 'boarded', 'deposited', 'scanned'].includes(value)))].slice(0, 16) : ['captured'];
  // An interrupted interaction resumes idle, never as an autonomous delayed reward.
  state.action = null;
  state.enemies = Array.isArray(raw.enemies) ? raw.enemies.slice(0, 32).flatMap(enemy => {
    if (!record(enemy) || !/^bc121-\d{1,2}$/.test(enemy.id) || typeof enemy.profileId !== 'string') return [];
    return [{ id: enemy.id, profileId: enemy.profileId.slice(0, 120), role: enemy.role === 'watcher' ? 'watcher' : 'guard',
      spawnX: bounded(enemy.spawnX, 2500, 5150), groundY: bounded(enemy.groundY, 470, 620) }];
  }) : [];
  if (record(raw.rewards)) state.rewards = {
    credits: Math.floor(bounded(raw.rewards.credits, 0, 10000)), salvage: Math.floor(bounded(raw.rewards.salvage, 0, 999999)),
    intel: Math.floor(bounded(raw.rewards.intel, 0, 999999)), retries: Math.floor(bounded(raw.rewards.retries, 0, 9999)),
    elapsedSeconds: Math.floor(bounded(raw.rewards.elapsedSeconds, 0, 604800)),
    vehicleRecovered: false, noCasualty: raw.rewards.noCasualty === true, operationId: BLACK_COCOON_OPERATION_V121,
    route: state.route, quietPower: state.power === 'battery', quarantineComplete: state.complete
  };
  state.phase = blackCocoonPhaseV121(state);
  return state;
}

export function validateBlackCocoonStateV121(raw) {
  if (!record(raw) || raw.schema !== 121 || raw.operationId !== BLACK_COCOON_OPERATION_V121) return { valid: false, reason: 'cocoon-schema-mismatch' };
  const state = sanitizeBlackCocoonStateV121(raw);
  const ordered = [state.freed, state.equipmentRecovered, state.relayContact, state.surfaceReached,
    state.deltaAbandoned, state.beacons.every(Boolean), state.extractionElapsed >= 90, state.boarded,
    state.weaponsDeposited, state.complete];
  let gap = false;
  for (const flag of ordered) { if (!flag) gap = true; else if (gap) return { valid: false, reason: 'cocoon-progress-inconsistent' }; }
  if ((state.relayContact && !state.power) || (state.power === 'battery' && !state.battery)
    || (state.battery && !state.equipmentRecovered) || (state.power && !state.relayContact)
    || (state.route && !state.relayContact) || (state.beacons.some(Boolean) && !state.deltaAbandoned)
    || (state.surfaceReached && !state.route) || (state.route === 'industrial' && state.liftProgress < 6)
    || (state.route === 'cooling' && state.valveProgress < 3)
    || (state.complete && (state.scanProgress < 4 || !state.rewardClaimed || !state.rewards))
    || (state.rewardClaimed && !state.complete) || raw.phase !== state.phase
    || (state.extractionElapsed > 0 && !state.beacons.every(Boolean))
    || state.enemies.length !== (Array.isArray(raw.enemies) ? raw.enemies.length : 0)
    || new Set(state.enemies.map(enemy => enemy.id)).size !== state.enemies.length
    || state.enemies.some(enemy => Number(enemy.id.split('-')[1]) > state.enemySequence)) {
    return { valid: false, reason: 'cocoon-progress-inconsistent' };
  }
  return { valid: true, state };
}

export function advanceBlackCocoonAlertV121(state, delta, { noise = 0, seen = false, crouching = false } = {}) {
  const dt = bounded(delta, 0, 0.1);
  state.elapsed += dt;
  state.noise = Math.max(0, Math.min(100, state.noise - dt * 16 + Math.max(0, noise)));
  if (seen || noise > 0) {
    state.alert = Math.min(100, state.alert + (seen ? dt * 22 : noise * 0.42));
    state.quietSeconds = 0;
  } else {
    state.quietSeconds += dt;
    if (state.quietSeconds > 5) state.alert = Math.max(state.relayContact ? 60 : 0, state.alert - dt * (crouching ? 2.5 : 1.25));
  }
  if (state.relayContact) state.alert = Math.max(60, state.alert);
  return state.alert;
}

export function blackCocoonDossierV121(state) {
  const phase = blackCocoonPhaseV121(state);
  const stages = {
    cocoon: ['LA MATRICE', 'Maintenir E pour couper la résine. F permet de forcer, avec plus de bruit.'],
    equipment: ['SAC DE RÉCUPÉRATION', 'Rejoindre le sac dans la galerie basse. S : avancer accroupi pour réduire la détection.'],
    relay: ['CONTACT TANTALUS', 'Relais dans les tunnels est. E : générateur bruyant ; batterie sur la passerelle ouest : alimentation discrète.'],
    surface: ['DEUX SORTIES', 'E au moteur est : 6 s pour l’échelle industrielle. Ou gagner la passerelle haute et ouvrir sa vanne.'],
    delta: ['POINT DELTA', 'Rejoindre Delta à la surface. Le contrôleur évaluera le site avant d’autoriser la descente.'],
    beacons: ['DÉPLACEMENT KAPPA', 'Delta est impraticable. Activer les deux balises de Kappa ; E maintenu pendant 2 s chacune.'],
    hold: ['APPROCHE DU TRANSPORT', `Tenir Kappa. Arrivée dans ${Math.ceil(Math.max(0, 90 - state.extractionElapsed))} s. Maintenir le périmètre jusqu’au signal d’approche.`],
    board: ['RAMPE OUVERTE', 'Rejoindre la rampe. Repousser tout contact proche ; V : une seule purge défensive. E : embarquer.'],
    quarantine: ['TANTALUS · QUARANTAINE', state.weaponsDeposited ? 'Gagner le scanner. Maintenir E pendant 4 s pour terminer le protocole.' : 'E au râtelier : déposer les armes avant le contrôle biologique.'],
    complete: ['RETOUR CONFIRMÉ', 'Le Tantalus a confirmé le contrôle biologique et archivé votre retour.']
  };
  return { phase, title: stages[phase][0], instruction: stages[phase][1], alertLevel: Math.min(5, Math.floor(state.alert / 20)),
    location: state.boarded ? 'tantalus-quarantine' : state.surfaceReached ? 'colony-surface' : 'hive-tunnels',
    adaptation: 'Original playable adaptation; existing project artwork reused, no complete bespoke animation claim.' };
}
