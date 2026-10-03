// Original mission rules, separate from the vehicle's canonical identification.
export const APC_CONVOY_OPERATION_V121 = 'apc-convoy';
export const APC_CONVOY_CAMPAIGN_V121 = Object.freeze({
  id: 'special-apc-convoy', name: 'APC · CORRIDOR DE FEU', mode: 'SURVIVAL', worldId: 'world-05-lethe',
  year: 2204, canon: 'project-continuity', routes: 1, specialOperationId: APC_CONVOY_OPERATION_V121,
  templateId: 'colony-multiroute', source: 'Tantalus Special Operations',
  summary: 'Convoyage blindé sous assaut : hordes, deux Crushers et une Reine en barrage final.',
  objective: 'Préserver le M577 et franchir le corridor jusqu’au sas de récupération.',
  description: 'Tourelle arrière, carburant fini et chargement de mission. Un déplacement latéral continu, suivi de deux percées et d’un dernier barrage.'
});
export const APC_CONVOY_PHASES_V121 = Object.freeze(['briefing', 'run-1', 'crusher-1', 'run-2', 'crusher-2', 'run-3', 'queen', 'evacuation', 'complete']);
export const APC_CONVOY_LIMITS_V121 = Object.freeze({ distance: 3200, thresholds: Object.freeze([800, 1900, 3200]),
  maxActors: 64, activeActors: 8, hordeCap: 7, heat: 100, reload: 2.5, extraction: 3, hull: 340, magazine: 110, reserve: 120 });
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const bounded = (value, max, fallback = 0) => Number.isFinite(Number(value)) ? Math.max(0, Math.min(max, Number(value))) : fallback;

export function apcConvoyPhaseV121(state) {
  if (!state.briefed) return 'briefing';
  if (state.distance < 800) return 'run-1';
  if (!state.crushersDefeated?.[0]) return 'crusher-1';
  if (state.distance < 1900) return 'run-2';
  if (!state.crushersDefeated?.[1]) return 'crusher-2';
  if (state.distance < 3200) return 'run-3';
  if (!state.queenDefeated) return 'queen';
  return state.complete ? 'complete' : 'evacuation';
}
export function createApcConvoyStateV121() {
  return { schema: 121, operationId: APC_CONVOY_OPERATION_V121, phase: 'briefing', briefed: false,
    distance: 0, roadOffset: 0, elapsed: 0, nextWaveAt: 6, waves: 0, enemySequence: 0, enemies: [],
    crushersDefeated: [false, false], queenDefeated: false, stageBossId: null,
    heat: 0, overheated: false, reloadRemaining: 0, extractionProgress: 0,
    complete: false, rewardClaimed: false, rewards: null, journal: ['orders'] };
}
export function sanitizeApcConvoyStateV121(raw = {}) {
  const state = createApcConvoyStateV121();
  for (const key of ['briefed', 'queenDefeated', 'overheated', 'complete', 'rewardClaimed']) state[key] = raw[key] === true;
  for (const [key, max] of Object.entries({ distance: 3200, roadOffset: 1e8, elapsed: 604800, nextWaveAt: 604800,
    waves: 60, enemySequence: 64, heat: 100, reloadRemaining: 2.5, extractionProgress: 3 })) state[key] = bounded(raw[key], max, state[key]);
  state.waves = Math.floor(state.waves); state.enemySequence = Math.floor(state.enemySequence);
  state.crushersDefeated = [raw.crushersDefeated?.[0] === true, raw.crushersDefeated?.[1] === true];
  state.stageBossId = /^apcv121-\d{1,2}$/.test(raw.stageBossId || '') ? raw.stageBossId : null;
  state.enemies = Array.isArray(raw.enemies) ? raw.enemies.slice(0, 64).flatMap(enemy => {
    if (!record(enemy) || !/^apcv121-\d{1,2}$/.test(enemy.id) || typeof enemy.profileId !== 'string'
      || !['horde', 'crusher-1', 'crusher-2', 'queen'].includes(enemy.role)) return [];
    return [{ id: enemy.id, profileId: enemy.profileId.slice(0, 120), role: enemy.role,
      spawnX: bounded(enemy.spawnX, 780, 60), attackClock: bounded(enemy.attackClock, 5),
      chargeClock: bounded(enemy.chargeClock, 2), chargePhase: enemy.chargePhase === 'charge' ? 'charge' : 'windup' }];
  }) : [];
  state.journal = Array.isArray(raw.journal) ? [...new Set(raw.journal.filter(entry =>
    ['orders', 'depart', 'crusher-1', 'crusher-1-cleared', 'crusher-2', 'crusher-2-cleared', 'queen', 'queen-cleared', 'recovered'].includes(entry)))].slice(0, 12) : ['orders'];
  if (record(raw.rewards)) state.rewards = { credits: Math.floor(bounded(raw.rewards.credits, 10000)),
    salvage: Math.floor(bounded(raw.rewards.salvage, 999999)), intel: Math.floor(bounded(raw.rewards.intel, 999999)),
    retries: Math.floor(bounded(raw.rewards.retries, 9999)), elapsedSeconds: Math.floor(bounded(raw.rewards.elapsedSeconds, 604800)),
    vehicleRecovered: true, noCasualty: raw.rewards.noCasualty === true, operationId: APC_CONVOY_OPERATION_V121,
    hullRemaining: bounded(raw.rewards.hullRemaining, 340) };
  state.phase = apcConvoyPhaseV121(state); return state;
}
export function validateApcConvoyStateV121(raw) {
  if (!record(raw) || raw.schema !== 121 || raw.operationId !== APC_CONVOY_OPERATION_V121) return { valid: false, reason: 'apc-schema-mismatch' };
  const state = sanitizeApcConvoyStateV121(raw);
  const roles = { 'crusher-1': ['enemy-009-crusher', 800], 'crusher-2': ['enemy-009-crusher', 1900], queen: ['enemy-008-queen', 3200] };
  const hordeProfiles = ['enemy-004-drone-big-chap', 'enemy-005-warrior', 'enemy-006-runner'];
  if (raw.phase !== state.phase || (!state.briefed && (state.distance > 0 || state.enemies.length || state.elapsed > 0))
    || (state.distance > 800 && !state.crushersDefeated[0]) || (state.distance > 1900 && !state.crushersDefeated[1])
    || (state.crushersDefeated[0] && state.distance < 800) || (state.crushersDefeated[1] && state.distance < 1900)
    || (state.queenDefeated && (state.distance < 3200 || !state.crushersDefeated.every(Boolean)))
    || (state.extractionProgress > 0 && !state.queenDefeated) || (state.complete && (state.extractionProgress < 3 || !state.rewardClaimed || !state.rewards))
    || (state.rewardClaimed && !state.complete) || state.enemies.length !== (Array.isArray(raw.enemies) ? raw.enemies.length : 0)
    || new Set(state.enemies.map(enemy => enemy.id)).size !== state.enemies.length
    || state.enemies.some(enemy => Number(enemy.id.split('-')[1]) < 1 || Number(enemy.id.split('-')[1]) > state.enemySequence
      || (enemy.role === 'horde' ? !hordeProfiles.includes(enemy.profileId)
        : enemy.profileId !== roles[enemy.role][0] || state.distance < roles[enemy.role][1]))
    || Object.keys(roles).some(role => state.enemies.filter(enemy => enemy.role === role).length > 1)
    || (state.stageBossId && !state.enemies.some(enemy => enemy.id === state.stageBossId && enemy.role === state.phase))) {
    return { valid: false, reason: 'apc-progress-inconsistent' };
  }
  return { valid: true, state };
}
export function apcConvoyDossierV121(state) {
  const phase = apcConvoyPhaseV121(state);
  const stages = {
    briefing: ['ORDRE DE CONVOYAGE', 'E : engager le M577. F : tourelle avec suivi des contacts ; R : bande de munitions, 2,5 s. Espace : accélérer ; S : ralentir.'],
    'run-1': ['GALERIE EXTÉRIEURE', 'Préserver le blindage. Les contacts arrivent de gauche ; surveiller chaleur, bandes et carburant.'],
    'crusher-1': ['PREMIÈRE PERCÉE', 'Crusher au contact. Couper le tir entre les rafales ; le M577 doit survivre à sa charge.'],
    'run-2': ['VOIE DE SERVICE', 'Premier barrage franchi. Garder une réserve de munitions pour la prochaine percée.'],
    'crusher-2': ['DEUXIÈME PERCÉE', 'Second Crusher. Recharger avant le contact si nécessaire ; les réserves ne se renouvellent pas.'],
    'run-3': ['APPROCHE DU PÉRIMÈTRE', 'Le sas de récupération est proche. Protéger le véhicule jusqu’au dernier barrage.'],
    queen: ['BARRAGE ROYAL', 'Reine en travers du corridor. Abattre ce dernier contact sans perdre le M577.'],
    evacuation: ['SAS DE RÉCUPÉRATION', 'Maintenir E pendant 3 s pour confirmer le passage du blindé au périmètre sécurisé.'],
    complete: ['CONVOI RÉCUPÉRÉ', 'Le M577 a rejoint le périmètre. Le Tantalus a archivé le bilan de convoyage.']
  };
  return { phase, title: stages[phase][0], instruction: stages[phase][1], distance: Math.round(state.distance),
    targetDistance: 3200, localPlayers: 1, adaptation: 'Original convoy rules; reviewed project artwork reused.' };
}
