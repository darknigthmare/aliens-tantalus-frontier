// Original playable adaptations. These prototypes do not certify absent
// dedicated creature artwork or the complete narrative campaign corpus.
export const ECOSYSTEM_OPERATIONS_V131 = Object.freeze(['queen-mother-song', 'hive-world', 'pangaea-second-extinction']);
export const SAURIA_CASTES_V131 = Object.freeze([
  Object.freeze({ id: 'hunter', label: 'Traqueur', speed: 105, health: 110, damage: 12, shape: 'raptor', action: 'flank' }),
  Object.freeze({ id: 'charger', label: 'Bélier', speed: 58, health: 190, damage: 22, shape: 'horns', action: 'charge' }),
  Object.freeze({ id: 'spitter', label: 'Cracheur', speed: 46, health: 100, damage: 14, shape: 'sail', action: 'acid' }),
  Object.freeze({ id: 'leaper', label: 'Bondisseur', speed: 78, health: 90, damage: 16, shape: 'wings', action: 'leap' }),
  Object.freeze({ id: 'burrower', label: 'Fouisseur', speed: 62, health: 150, damage: 18, shape: 'spikes', action: 'burrow' }),
  Object.freeze({ id: 'swimmer', label: 'Nageur', speed: 115, health: 120, damage: 14, shape: 'fin', action: 'water' }),
  Object.freeze({ id: 'sentinel', label: 'Sentinelle', speed: 32, health: 220, damage: 20, shape: 'plates', action: 'guard' })
]);
const bounded = (value, minimum, maximum) => Number.isFinite(value) && value >= minimum && value <= maximum;
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const clone = value => structuredClone(value);
export function ecosystemPhaseV131(state) {
  if (state.complete) return 'complete';
  if (state.operationId === 'queen-mother-song') return state.targets.some(done => !done) ? 'choirs'
    : !state.bossDefeated ? `mother-${state.bossPhase}` : state.defenceElapsed < 22 ? 'beacons' : 'extract';
  if (state.operationId === 'hive-world') return state.targets.some(done => !done) ? 'organs'
    : !state.bossDefeated ? `nucleus-${state.bossPhase}` : 'collapse';
  return state.targets.some(done => !done) ? 'containment' : state.rescued < 3 ? 'rescue'
    : !state.bossDefeated ? 'colossus' : 'extract';
}
export function createEcosystemStateV131(operationId) {
  if (!ECOSYSTEM_OPERATIONS_V131.includes(operationId)) throw new Error('Unknown ecosystem operation.');
  return { schema: 131, operationId, phase: operationId === 'queen-mother-song' ? 'choirs' : operationId === 'hive-world' ? 'organs' : 'containment',
    targets: Array(operationId === 'hive-world' ? 4 : 3).fill(false), bossPhase: 1, bossDefeated: false,
    pressure: 0, integrity: 100, focusCharges: 3, vaccineCharges: 5, supplyTaken: false,
    nursery: [false, false, false], beacons: [false, false], defenceElapsed: 0,
    collapseRemaining: 100, extractionProgress: 0, interactionProgress: 0, interactionTarget: null,
    rescued: 0, deadHealthy: 0, journal: ['orders'], actors: [], population: [],
    complete: false, rewardClaimed: false, rewards: null, ending: null };
}
export function biosphereIntegrityV131(state) {
  if (state.operationId !== 'pangaea-second-extinction') return 100;
  const originalHosts = state.population.filter(member => member.originalHost);
  return Math.max(0, Math.min(100, 100 - state.deadHealthy * 12
    - originalHosts.filter(member => member.status === 'infected').length * 9
    - originalHosts.filter(member => member.status === 'healthy').reduce((sum, member) => sum + member.infection, 0) / 16));
}
export function advancePopulationV131(state, seconds, positions = new Map()) {
  if (state.operationId !== 'pangaea-second-extinction' || !Number.isFinite(seconds) || seconds <= 0) return [];
  const infected = state.population.filter(member => member.status === 'infected');
  const liveNests = state.targets.filter(done => !done).length;
  const transitions = [];
  for (const member of state.population) {
    if (member.status !== 'healthy') continue;
    const position = positions.get(member.id);
    const nearby = infected.some(carrier => {
      const source = positions.get(carrier.id);
      return position && source && Math.abs(position.x - source.x) < 480 && Math.abs(position.y - source.y) < 100;
    });
    const rate = liveNests > 0 ? .18 * liveNests + (nearby ? 1.05 : 0) : nearby ? .3 : -1.6;
    member.infection = Math.max(0, Math.min(100, member.infection + rate * seconds));
    if (member.infection >= 100) { member.status = 'infected'; transitions.push(member.id); }
  }
  state.integrity = biosphereIntegrityV131(state);
  return transitions;
}
export function validateEcosystemStateV131(raw) {
  if (!record(raw) || raw.schema !== 131 || !ECOSYSTEM_OPERATIONS_V131.includes(raw.operationId)) return { valid: false, reason: 'ecosystem-schema-mismatch' };
  const state = clone(raw), targetCount = raw.operationId === 'hive-world' ? 4 : 3;
  if (!Array.isArray(raw.targets) || raw.targets.length !== targetCount || raw.targets.some(value => typeof value !== 'boolean')
    || !Array.isArray(raw.nursery) || raw.nursery.length !== 3 || raw.nursery.some(value => typeof value !== 'boolean')
    || !Array.isArray(raw.beacons) || raw.beacons.length !== 2 || raw.beacons.some(value => typeof value !== 'boolean')
    || !Number.isInteger(raw.bossPhase) || raw.bossPhase < 1 || raw.bossPhase > (raw.operationId === 'queen-mother-song' ? 4 : 3)
    || ['bossDefeated', 'supplyTaken', 'complete', 'rewardClaimed'].some(key => typeof raw[key] !== 'boolean')
    || !bounded(raw.pressure, 0, 100) || !bounded(raw.integrity, 0, 100)
    || !Number.isInteger(raw.focusCharges) || !bounded(raw.focusCharges, 0, 3)
    || !Number.isInteger(raw.vaccineCharges) || !bounded(raw.vaccineCharges, 0, 8)
    || !bounded(raw.defenceElapsed, 0, 22) || !bounded(raw.collapseRemaining, 0, 100)
    || !bounded(raw.extractionProgress, 0, 2) || !bounded(raw.interactionProgress, 0, 2)
    || !Number.isInteger(raw.rescued) || !bounded(raw.rescued, 0, 7)
    || !Number.isInteger(raw.deadHealthy) || !bounded(raw.deadHealthy, 0, 7)
    || !Array.isArray(raw.journal) || raw.journal.length > 48 || raw.journal.some(value => typeof value !== 'string' || value.length > 70)
    || !Array.isArray(raw.actors) || raw.actors.length > 48 || new Set(raw.actors.map(actor => actor?.id)).size !== raw.actors.length
    || raw.actors.some(actor => !record(actor) || !/^eco131-[a-z0-9-]+$/.test(actor.id || '')
      || !['target', 'boss', 'guard', 'host', 'sauria'].includes(actor.role)
      || !bounded(actor.x, 0, 5150) || ![355, 570].includes(actor.floorY)
      || !bounded(actor.clock, 0, 60) || !bounded(actor.attackClock, 0, 60)
      || !bounded(actor.windup, 0, 4) || !bounded(actor.actionPhase, 0, 2))
    || !Array.isArray(raw.population) || raw.population.length > 14 || new Set(raw.population.map(member => member?.id)).size !== raw.population.length
    || raw.population.some(member => !record(member) || !raw.actors.some(actor => actor.id === member.id)
      || !SAURIA_CASTES_V131.some(caste => caste.id === member.caste)
      || typeof member.originalHost !== 'boolean' || !['healthy', 'infected', 'rescued', 'dead'].includes(member.status)
      || !bounded(member.infection, 0, 100))
    || raw.phase !== ecosystemPhaseV131(raw)
    || raw.bossDefeated && raw.targets.some(done => !done)
    || raw.bossDefeated && raw.bossPhase !== (raw.operationId === 'queen-mother-song' ? 4 : 3)
    || raw.defenceElapsed > 0 && (!raw.bossDefeated || raw.beacons.some(done => !done))
    || raw.complete !== raw.rewardClaimed || raw.complete && (!record(raw.rewards) || !raw.bossDefeated || raw.extractionProgress < 2)
    || raw.complete && raw.operationId === 'queen-mother-song' && (raw.defenceElapsed < 22 || raw.beacons.some(done => !done))
    || raw.complete && raw.operationId === 'hive-world' && raw.collapseRemaining <= 0
    || raw.complete && raw.operationId === 'pangaea-second-extinction' && (raw.rescued < 3 || raw.integrity <= 25)
    || raw.extractionProgress > 0 && (!raw.bossDefeated || raw.targets.some(done => !done)
      || raw.operationId === 'queen-mother-song' && raw.defenceElapsed < 22
      || raw.operationId === 'pangaea-second-extinction' && raw.rescued < 3)
    || raw.collapseRemaining < 100 && (!raw.bossDefeated || raw.operationId !== 'hive-world')
    || raw.complete && (raw.rewards.operationId !== raw.operationId || raw.rewards.ending !== raw.ending
      || raw.ending !== (raw.operationId === 'queen-mother-song' ? raw.nursery.every(Boolean) ? 'nursery-preserved' : 'royal-route-broken'
        : raw.operationId === 'hive-world' ? raw.pressure < 50 ? 'quiet-collapse' : 'planetary-rupture'
          : raw.integrity >= 75 ? 'biosphere-preserved' : 'quarantine'))
    || !raw.complete && raw.ending !== null
    || !raw.complete && raw.rewards !== null
    || raw.operationId === 'pangaea-second-extinction' && (raw.population.length !== 14
      || raw.rescued !== raw.population.filter(member => member.status === 'rescued').length
      || raw.deadHealthy !== raw.population.filter(member => member.originalHost && member.status === 'dead').length
      || Math.abs(raw.integrity - biosphereIntegrityV131(raw)) > .000001)
    || raw.operationId !== 'pangaea-second-extinction' && (raw.population.length || raw.rescued || raw.deadHealthy)) return { valid: false, reason: 'ecosystem-progress-inconsistent' };
  return { valid: true, state };
}
export function ecosystemDossierV131(state) {
  const queen = state.operationId === 'queen-mother-song', hive = state.operationId === 'hive-world';
  const remaining = state.targets.filter(done => !done).length;
  const instruction = remaining ? `Détruire ${remaining} ${queen ? 'chœur(s)' : hive ? 'organe(s)' : 'nid(s)'} : tirs ou attaques. Échelles W/S pour les paliers.`
    : !queen && !hive && state.rescued < 3 ? 'Maintenir E 2 s près de trois dinosaures sains. Vaccins limités ; dépôt près de l’insertion.'
    : !state.bossDefeated ? `Affronter ${queen ? 'la Reine-Mère' : hive ? 'le noyau planétaire' : 'le Porte-Ruche Colosse'}. Éviter les attaques annoncées.`
    : queen && state.defenceElapsed < 22 ? 'E sur les deux balises ; défendre 22 s. Le compteur progresse seulement dans leur secteur.'
    : hive ? 'Effondrement : revenir au sas d’insertion et maintenir E 2 s avant la fin du compte à rebours.'
    : 'Rejoindre le sas à droite et maintenir E 2 s pour confirmer l’extraction.';
  return { phase: ecosystemPhaseV131(state), title: queen ? 'LE CHANT DE LA REINE-MÈRE' : hive ? 'LV-XENO · LA RUCHE-MONDE' : 'PANGAEA · LA SECONDE EXTINCTION',
    instruction, pressureLabel: queen ? 'EMPRISE' : hive ? 'ALERTE PLANÈTE' : 'INTÉGRITÉ BIOSPHÈRE',
    pressure: queen || hive ? state.pressure : state.integrity,
    artworkStatus: 'original-vector-prototype', canonExact: false, implementationStatus: 'partial' };
}
