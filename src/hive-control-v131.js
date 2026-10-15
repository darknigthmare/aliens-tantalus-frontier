// Original Tantalus mechanics. The mission identities are adaptations; the
// accepted generic sprites are never presented as dedicated character art.
export const HIVE_SCHEMA_V131 = 131;
export const HIVE_PROFILES_V131 = Object.freeze([
  { id: 'worker', label: 'Ouvrier', cost: 3, dissonance: 2 },
  { id: 'warrior', label: 'Guerrier', cost: 5, dissonance: 4 },
  { id: 'nurse', label: 'Nourrice', cost: 5, dissonance: 3 },
  { id: 'royal-echo', label: 'Écho royal', cost: 9, dissonance: 8 },
  { id: 'prey-mark', label: 'Marque de proie', cost: 2, dissonance: 12 }
].map(Object.freeze));
export const HIVE_ORDERS_V131 = Object.freeze([
  { id: 'claw', label: 'Griffe · assaut', cost: 3 },
  { id: 'shadow', label: 'Ombre · infiltration', cost: 2 },
  { id: 'bulwark', label: 'Rempart · garder', cost: 2 },
  { id: 'follow', label: 'Rassemblement', cost: 1 }
].map(Object.freeze));
export const HIVE_ENDINGS_V131 = Object.freeze([
  { id: 'coexistence', label: 'Accord à trois voix', description: 'HUSH-6, le Premier-Né et Éloïse conservent leur voix.' },
  { id: 'severance', label: 'Rompre le Chœur', description: 'Désactiver le réseau et évacuer les consciences restantes.' },
  { id: 'crown', label: 'Prendre la couronne', description: 'Éloïse assume le réseau organique, au prix de charge royale.' },
  { id: 'sacrifice', label: 'Le dernier chant', description: 'L’interface est sacrifiée pour laisser une voie d’évacuation.' }
].map(Object.freeze));
export const HIVE_CONSCIOUSNESSES_V131 = Object.freeze(['human', 'hybrid', 'hive']);
const operations = ['jeri-false-son', 'atax-false-queen', 'eloise-uncrowned-queen'];
const bounded = (value, maximum) => Number.isFinite(value) ? Math.max(0, Math.min(maximum, value)) : 0;
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const validIds = (value, allowed) => Array.isArray(value) && value.length === new Set(value).size
  && value.every(id => allowed.includes(id));

export function createHiveControlV131(operationId) {
  if (!operations.includes(operationId)) throw new Error('Unknown hive operation.');
  return { schema: 131, operationId, phase: 'commission', commissioned: false,
    charge: operationId === 'atax-false-queen' ? 78 : 90, chargeSpent: 0, chargeCollected: 0, dissonance: 0, royalInstinct: 0,
    profile: 'worker', consciousness: 'human', choir: 24, pain: 0,
    segments: { head: 100, torso: 140, legs: 110 }, inspections: [], failedInspections: 0,
    rescued: false, implanted: false, survivorHealth: 100, implantClock: 0,
    hushSaved: false, pylons: ['sealed', 'sealed', 'sealed'], arteries: [],
    selectedRecruit: null, recruitedIds: [], spentCapsules: [], killedIds: [],
    bossPhase: 0, bossShielded: false, bossDefeated: false, bossReleased: false,
    finalInspection: false, ending: null, complete: false, failed: false,
    failReason: null, rewardClaimed: false, rewards: null, journal: ['arrival'],
    channel: null, channelProgress: 0, exitProgress: 0, possession: null, threats: [] };
}

export function hivePhaseV131(state) {
  if (state.failed) return 'failed'; if (state.complete) return 'complete';
  if (!state.commissioned) return 'commission';
  if (state.operationId === 'jeri-false-son') return state.inspections.length < 2 ? 'infiltrate'
    : !state.rescued ? 'rescue' : !state.bossDefeated ? 'saint' : !state.finalInspection ? 'queen-inspection' : 'extract';
  if (state.operationId === 'atax-false-queen') return state.recruitedIds.length < 2 ? 'recruit'
    : state.arteries.length < 3 ? 'arteries' : !state.bossDefeated ? 'queen' : 'extract';
  return state.pylons.some(value => value === 'sealed') ? 'pylons'
    : !state.bossDefeated ? 'mother-hunter' : !state.ending ? 'decision' : 'extract';
}

export function spendHiveChargeV131(state, cost) {
  if (!(cost >= 0) || !Number.isFinite(cost) || state.charge + 1e-9 < cost) return false;
  state.charge = Math.max(0, state.charge - cost); state.chargeSpent += cost; return true;
}

export function selectHiveProfileV131(state, profileId) {
  const profile = HIVE_PROFILES_V131.find(entry => entry.id === profileId);
  if (!profile || state.operationId !== 'jeri-false-son' || !state.commissioned || state.complete || state.failed)
    return { applied: false, reason: 'profile-unavailable' };
  if (state.profile === profileId) return { applied: false, reason: 'already-selected' };
  if (!spendHiveChargeV131(state, profile.cost)) return { applied: false, reason: 'charge-empty' };
  state.profile = profile.id; state.dissonance = Math.min(100, state.dissonance + profile.dissonance);
  return { applied: true, reason: 'profile-selected' };
}

export function inspectHiveProfileV131(state, inspection) {
  if (state.operationId !== 'jeri-false-son' || !state.commissioned || state.failed || state.complete)
    return { applied: false, reason: 'inspection-unavailable' };
  if (state.inspections.includes(inspection.id)) return { applied: false, reason: 'already-inspected' };
  if (inspection.id === 'inspection-nurse' && !state.inspections.includes('inspection-worker')
    || inspection.id === 'inspection-queen' && (!state.rescued || !state.bossDefeated)) return { applied: false, reason: 'inspection-prerequisite' };
  if (state.profile !== inspection.profile || state.dissonance >= 70) {
    state.failedInspections++; state.dissonance = Math.min(100, state.dissonance + 18);
    return { applied: false, reason: 'caste-rejected' };
  }
  if (!spendHiveChargeV131(state, inspection.cost || 4)) return { applied: false, reason: 'charge-empty' };
  state.inspections.push(inspection.id); state.dissonance = Math.max(0, state.dissonance - 6);
  return { applied: true, reason: 'inspection-passed' };
}

export function hiveEndingAvailabilityV131(state, roster = []) {
  const resolved = state.pylons.every(value => value !== 'sealed'), attuned = state.pylons.filter(value => value === 'attuned').length;
  const firstborn = roster.find(actor => actor.storyRoleV131 === 'firstborn' && actor.alive && actor.loyaltyV131 >= 50);
  return HIVE_ENDINGS_V131.map(ending => {
    let reason = !resolved || !state.bossDefeated ? 'Pylônes et Chasseur à résoudre' : state.ending ? 'Conclusion déjà enregistrée' : '';
    if (!reason && ending.id === 'coexistence' && (!state.hushSaved || !firstborn || state.choir < 45)) reason = 'HUSH-6, Premier-Né loyal et Chœur ≥45 requis';
    if (!reason && ending.id === 'severance' && (state.pylons.filter(value => value === 'severed').length < 2 || state.pain >= 90)) reason = 'Deux pylônes rompus et douleur <90 requis';
    if (!reason && ending.id === 'crown' && (attuned < 3 || state.charge < 20)) reason = 'Trois pylônes accordés et charge ≥20 requis';
    return { ...ending, canApply: !reason, reason };
  });
}

export function validateHiveControlV131(raw, manifest = {}) {
  if (!record(raw) || raw.schema !== 131 || !operations.includes(raw.operationId)) return { valid: false, reason: 'hive-schema-mismatch' };
  const state = structuredClone(raw), initial = createHiveControlV131(raw.operationId);
  for (const [key, maximum] of Object.entries({ charge: 100, dissonance: 100, royalInstinct: 100, choir: 100, pain: 100,
    chargeSpent: 1000000, chargeCollected: 60, survivorHealth: 100, implantClock: 150, failedInspections: 9999, bossPhase: 2, channelProgress: 3, exitProgress: 2 })) {
    if (!Number.isFinite(raw[key]) || raw[key] !== bounded(raw[key], maximum)) return { valid: false, reason: `hive-invalid-${key}` };
  }
  for (const key of Object.keys(initial).filter(key => typeof initial[key] === 'boolean'))
    if (typeof raw[key] !== 'boolean') return { valid: false, reason: `hive-invalid-${key}` };
  if (!record(raw.segments) || ['head', 'torso', 'legs'].some(key => !Number.isFinite(raw.segments[key])
    || raw.segments[key] < 0 || raw.segments[key] > initial.segments[key])
    || !HIVE_PROFILES_V131.some(profile => profile.id === raw.profile)
    || !HIVE_CONSCIOUSNESSES_V131.includes(raw.consciousness)
    || !Array.isArray(raw.pylons) || raw.pylons.length !== 3 || raw.pylons.some(value => !['sealed', 'attuned', 'severed'].includes(value))
    || !validIds(raw.inspections, ['inspection-worker', 'inspection-nurse', 'inspection-queen'])
    || !validIds(raw.arteries, ['artery-claw', 'artery-shadow', 'artery-bulwark'])
    || !validIds(raw.recruitedIds, manifest.recruitIds || [])
    || !validIds(raw.spentCapsules, manifest.capsuleIds || [])
    || raw.chargeCollected > raw.spentCapsules.length * 20
    || Math.abs(raw.charge - (initial.charge + raw.chargeCollected - raw.chargeSpent)) > 0.00001
    || !validIds(raw.killedIds, manifest.enemyIds || [])
    || !validIds(raw.threats, ['inspection-worker', 'inspection-nurse', 'inspection-queen', 'sector-wave', 'boss-wave-1', 'boss-wave-2'])
    || raw.selectedRecruit !== null && !raw.recruitedIds.includes(raw.selectedRecruit)
    || raw.possession !== null && (!record(raw.possession) || !raw.recruitedIds.includes(raw.possession.actorId))
    || raw.ending !== null && !HIVE_ENDINGS_V131.some(ending => ending.id === raw.ending)
    || raw.phase !== hivePhaseV131(raw) || !Array.isArray(raw.journal) || raw.journal.length > 64
    || raw.journal.some(value => typeof value !== 'string' || value.length > 80)
    || raw.complete && (!raw.rewardClaimed || !record(raw.rewards) || raw.failed || raw.exitProgress !== 2 || !raw.bossDefeated || !raw.commissioned)
    || raw.rewardClaimed !== raw.complete || !raw.complete && raw.rewards !== null
    || raw.finalInspection && (!raw.bossDefeated || !raw.rescued || !raw.inspections.includes('inspection-queen'))
    || raw.bossDefeated && raw.bossPhase !== 2
    || raw.bossDefeated && (!raw.bossReleased || raw.bossShielded || !raw.killedIds.includes('hive-boss'))
    || raw.killedIds.includes('hive-boss') !== raw.bossDefeated
    || raw.bossShielded && (!raw.bossReleased || raw.bossPhase < 1)
    || !raw.commissioned && (raw.inspections.length || raw.rescued || raw.hushSaved || raw.recruitedIds.length
      || raw.arteries.length || raw.pylons.some(value => value !== 'sealed') || raw.bossReleased || raw.possession || raw.ending)
    || raw.operationId === 'jeri-false-son' && (raw.inspections.includes('inspection-nurse') && !raw.inspections.includes('inspection-worker')
      || raw.rescued && (!raw.inspections.includes('inspection-worker') || !raw.inspections.includes('inspection-nurse'))
      || raw.finalInspection && (raw.inspections.length !== 3 || raw.survivorHealth <= 0 || raw.implanted)
      || raw.complete && (!raw.finalInspection || !raw.rescued || raw.inspections.length !== 3))
    || raw.operationId === 'atax-false-queen' && raw.complete && (raw.arteries.length !== 3 || raw.recruitedIds.length < 2)
    || raw.operationId === 'eloise-uncrowned-queen' && (raw.ending && (!raw.bossDefeated || raw.pylons.includes('sealed'))
      || raw.complete && (!raw.ending || raw.pylons.includes('sealed')))
    || raw.operationId === 'atax-false-queen' && raw.bossReleased && raw.arteries.length !== 3
    || raw.operationId === 'eloise-uncrowned-queen' && raw.bossReleased && raw.pylons.includes('sealed')
    || raw.operationId === 'jeri-false-son' && raw.bossReleased && (!raw.rescued || raw.inspections.length < 2))
    return { valid: false, reason: 'hive-progress-inconsistent' };
  return { valid: true, state };
}

export function hiveDossierV131(state) {
  const phase = hivePhaseV131(state);
  const text = {
    commission: 'E au pupitre d’entrée : initialiser l’interface. Les ressources de terrain sont finies.',
    infiltrate: 'E : inspections Ouvrier puis Nourrice. V : adhérence.',
    rescue: 'Rejoindre le cocon sur la passerelle. Maintenir E 3 s avant la fin de l’implantation.',
    saint: 'Combattre SAINT. Après chaque phase, maintenir E 2 s au relais du boss pour exposer son segment.',
    'queen-inspection': '4 : Écho royal. E à la dernière inspection, après le sauvetage et SAINT.',
    recruit: 'E devant les castes pour recruter (12 charge). Deux recrues vivantes ouvrent l’assaut.',
    arteries: '1 Griffe / 2 Ombre / 3 Rempart / 4 Rassembler. Capturer les trois relais avec une recrue proche. B : contrôler la recrue sélectionnée ; B : revenir.',
    queen: 'Combattre la Reine. E au relais royal expose la phase suivante.',
    pylons: '1 Humain / 2 Hybride / 3 Ruche. E devant un pylône : accorder ; 5 devant celui-ci : rompre. Les ponts et obstacles changent réellement.',
    'mother-hunter': 'Vaincre le Chasseur de Mères. E au relais expose chaque phase ; préserver le Chœur.',
    decision: 'E au nexus : afficher les quatre conclusions. 6–9 : choisir une fin disponible.',
    extract: 'Rejoindre la balise de retour à l’est. Maintenir E 2 s. Le bilan conserve le choix et les pertes.',
    complete: 'Opération terminée. Récompense acquise une seule fois dans ce bilan.',
    failed: state.failReason || 'Interface perdue. Reprendre le dernier checkpoint.'
  };
  return { phase, instruction: text[phase], resource: state.operationId === 'jeri-false-son' ? 'Dissonance / segments'
    : state.operationId === 'atax-false-queen' ? 'Charge royale / loyauté' : 'Chœur / douleur' };
}
