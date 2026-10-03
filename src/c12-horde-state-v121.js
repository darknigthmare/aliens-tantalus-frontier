// An encounter profile, not a new species or a canonical biological weakness.
export const C12_HORDE_OPERATION_V121 = 'c12-horde';
export const C12_HORDE_CAMPAIGN_V121 = Object.freeze({
  id: 'special-c12-horde', name: 'RUPTURE · SAS C-12', mode: 'SURVIVAL', worldId: 'world-05-lethe',
  year: 2204, canon: 'project-continuity', routes: 1, specialOperationId: C12_HORDE_OPERATION_V121,
  templateId: 'colony-multiroute', source: 'Tantalus Special Operations',
  summary: 'Un événement isolé de horde et de nuée, suivi d’un repli par ascenseur.',
  objective: 'Rétablir l’ascenseur et rejoindre le sas, sans obligation de nettoyer les survivants.',
  description: 'Profil de rencontre fragile : un impact suffit. Le danger vient de la masse, des axes et du rechargement. Les rencontres ordinaires ne changent pas.'
});
export const C12_HORDE_PHASES_V121 = Object.freeze(['prepare', 'warning', 'defend', 'evacuate', 'complete']);
export const C12_HORDE_LIMITS_V121 = Object.freeze({ warning: 4, defence: 45, maxLive: 36, total: 72, batch: 24,
  ammoCrate: 160, impactCooldown: 0.85, evacuation: 2 });
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const bounded = (value, max, fallback = 0) => Number.isFinite(Number(value)) ? Math.max(0, Math.min(max, Number(value))) : fallback;
export function c12HordePhaseV121(state) {
  if (state.complete) return 'complete';
  if (!state.activated) return 'prepare';
  if (state.warningRemaining > 0) return 'warning';
  return state.defenceElapsed >= 45 ? 'evacuate' : 'defend';
}
export function createC12HordeStateV121() {
  return { schema: 121, operationId: C12_HORDE_OPERATION_V121, phase: 'prepare', activated: false,
    warningRemaining: 4, defenceElapsed: 0, emitted: 0, peakLive: 0, batches: [false, false, false],
    ammoTaken: false, cargoTaken: false, impactCooldown: 0, evacuationProgress: 0,
    complete: false, rewardClaimed: false, rewards: null, enemies: [], journal: ['orders'] };
}
export function sanitizeC12HordeStateV121(raw = {}) {
  const state = createC12HordeStateV121();
  for (const key of ['activated', 'ammoTaken', 'cargoTaken', 'complete', 'rewardClaimed']) state[key] = raw[key] === true;
  for (const [key, max] of Object.entries({ warningRemaining: 4, defenceElapsed: 45, emitted: 72,
    peakLive: 36, impactCooldown: 0.85, evacuationProgress: 2 })) state[key] = bounded(raw[key], max, state[key]);
  state.emitted = Math.floor(state.emitted); state.peakLive = Math.floor(state.peakLive);
  state.batches = [0, 1, 2].map(index => raw.batches?.[index] === true);
  state.enemies = Array.isArray(raw.enemies) ? raw.enemies.slice(0, 72).flatMap(enemy => {
    if (!record(enemy) || !/^c12v121-(?:[1-9]|[1-6]\d|7[0-2])$/.test(enemy.id)
      || !['enemy-004-drone-big-chap', 'enemy-002-facehugger'].includes(enemy.profileId)
      || !['ground', 'upper'].includes(enemy.lane)) return [];
    return [{ id: enemy.id, profileId: enemy.profileId, lane: enemy.lane,
      spawnX: bounded(enemy.spawnX, 1220, 60), groundY: enemy.groundY === 355 ? 355 : 570 }];
  }) : [];
  state.journal = Array.isArray(raw.journal) ? [...new Set(raw.journal.filter(entry =>
    ['orders', 'activated', 'ground-breach', 'swarm-breach', 'upper-breach', 'lift-ready', 'recovered'].includes(entry)))] : ['orders'];
  if (record(raw.rewards)) state.rewards = { credits: Math.floor(bounded(raw.rewards.credits, 2000)),
    salvage: Math.floor(bounded(raw.rewards.salvage, 999999)), intel: Math.floor(bounded(raw.rewards.intel, 999999)),
    retries: Math.floor(bounded(raw.rewards.retries, 9999)), elapsedSeconds: Math.floor(bounded(raw.rewards.elapsedSeconds, 604800)),
    noCasualty: raw.rewards.noCasualty === true, operationId: C12_HORDE_OPERATION_V121 };
  state.phase = c12HordePhaseV121(state); return state;
}
export function validateC12HordeStateV121(raw) {
  if (!record(raw) || raw.schema !== 121 || raw.operationId !== C12_HORDE_OPERATION_V121) return { valid: false, reason: 'c12-schema-mismatch' };
  const state = sanitizeC12HordeStateV121(raw), ids = state.enemies.map(enemy => enemy.id);
  const count = Array.isArray(raw.enemies) ? raw.enemies.length : 0;
  if (raw.phase !== state.phase || count !== state.enemies.length || count !== state.emitted
    || !Number.isInteger(raw.emitted) || raw.emitted < 0 || raw.emitted > 72
    || !Number.isInteger(raw.peakLive) || raw.peakLive < 0 || raw.peakLive > 36
    || new Set(ids).size !== count || ids.some((id, index) => id !== `c12v121-${index + 1}`)
    || state.enemies.some((enemy, index) => enemy.profileId !== (index >= 24 && index < 48 ? 'enemy-002-facehugger' : 'enemy-004-drone-big-chap')
      || enemy.lane !== (index >= 48 ? 'upper' : 'ground') || enemy.lane === 'ground' && enemy.groundY !== 570)
    || (!state.activated && (state.defenceElapsed > 0 || state.emitted || state.warningRemaining !== 4))
    || (state.warningRemaining > 0 && (state.defenceElapsed > 0 || state.emitted > 0))
    || (state.emitted > 24 && state.defenceElapsed < 15) || (state.emitted > 48 && state.defenceElapsed < 30)
    || (state.batches[1] && (!state.batches[0] || state.defenceElapsed < 15))
    || (state.batches[2] && (!state.batches[1] || state.defenceElapsed < 30))
    || state.batches.some((done, index) => done && state.emitted < (index + 1) * 24)
    || (state.evacuationProgress > 0 && state.defenceElapsed < 45)
    || (state.complete && (state.evacuationProgress < 2 || !state.rewardClaimed || !state.rewards))
    || (state.rewardClaimed && !state.complete) || (!state.complete && state.rewards)
    || (state.complete && state.rewards.credits !== 650 + (state.cargoTaken ? 100 : 0))) return { valid: false, reason: 'c12-progress-inconsistent' };
  return { valid: true, state };
}
export function c12HordeDossierV121(state) {
  const phase = c12HordePhaseV121(state), stages = {
    prepare: ['ASCENSEUR HORS LIGNE', 'E au relais : engager le rétablissement. Réserve visible près du relais, caisse en alcôve facultative.'],
    warning: ['BRÈCHE ANNONCÉE', 'Contacts à gauche. Préparer le tir : les assaillants de cet événement tombent au premier impact.'],
    defend: ['TENIR OU SE DÉPLACER', 'Tirer, recharger, utiliser la passerelle. L’ascenseur se rétablit en 45 s ; éliminer tous les contacts n’est pas obligatoire.'],
    evacuate: ['ASCENSEUR DISPONIBLE', 'Rejoindre le sas à droite et maintenir E 2 s. Les assaillants restants ne bloquent pas le repli.'],
    complete: ['SAS REFERMÉ', 'Repli confirmé. Le bilan de cet événement est archivé.']
  };
  return { phase, title: stages[phase][0], instruction: stages[phase][1], remaining: Math.max(0, 45 - state.defenceElapsed),
    profile: 'horde-one-impact', localPlayers: 1, emitted: state.emitted, peakLive: state.peakLive };
}
