import { XENO_TRIALS_BOSS_STAGES_V179 } from './xeno-trials-boss-stages-v179.js';
import { ARBITER_STAGE_HAZARDS_V191 } from './xeno-arbiter-protocols-v191.js';

/** Original physical machinery for the forty Tantalus operation settings.
 * The old duels and eighty horde protocols never enable this system. All times
 * are native 120 Hz ticks; warnings remain visible with reduced motion enabled.
 * Coordinates share the combat world and the floor, rather than camera pixels.
 */
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const kinds = freeze({
  steam: { label: 'DÉCHARGE DE VAPEUR', hint: 'Quittez le conduit balisé avant la décharge.', color: '#b5d5d7', height: 150, activeTicks: 60, damage: 6 },
  arc: { label: 'ARC ÉLECTRIQUE', hint: 'Sautez la bande au sol ou attendez hors de sa portée.', color: '#91d7ed', height: 38, activeTicks: 42, damage: 7 },
  debris: { label: 'CHUTE DE DÉBRIS', hint: 'Dégagez la zone de chute balisée.', color: '#dfb67c', height: 420, activeTicks: 12, damage: 8 },
  corrosive: { label: 'FUITE CORROSIVE', hint: 'Évitez la fuite au sol ; une issue reste libre.', color: '#c1d575', height: 8, activeTicks: 150, damage: 4 },
  cryo: { label: 'PURGE CRYOGÉNIQUE', hint: 'Franchissez la purge après le signal.', color: '#a2c4ec', height: 22, activeTicks: 84, damage: 5 }
});
// Kind, first anchor, second anchor, physical width. Anchors reserve the three
// authored objective stations and their approach bands; a cargo can wait before
// either crossing. No wall or permanently damaging strip closes the route.
const settings = [
  ['steam', 392, 906, 112], ['arc', 908, 394, 120], ['steam', 410, 892, 128],
  ['debris', 898, 400, 132], ['debris', 390, 910, 120], ['debris', 904, 398, 136],
  ['debris', 408, 892, 128], ['arc', 898, 406, 116], ['corrosive', 400, 906, 144],
  ['debris', 912, 392, 120], ['steam', 394, 908, 132], ['arc', 902, 398, 112],
  ['debris', 404, 894, 136], ['corrosive', 910, 390, 128], ['arc', 396, 904, 120],
  ['debris', 892, 408, 128], ['arc', 406, 898, 112], ['debris', 904, 394, 144],
  ['corrosive', 392, 910, 128], ['arc', 908, 400, 120], ['steam', 398, 902, 112],
  ['steam', 894, 408, 120], ['cryo', 402, 896, 128], ['corrosive', 910, 394, 136],
  ['arc', 396, 906, 112], ['arc', 900, 410, 144], ['steam', 390, 912, 128],
  ['debris', 906, 394, 136], ['cryo', 408, 898, 120], ['arc', 892, 406, 112],
  ['steam', 402, 904, 120], ['arc', 908, 396, 128], ['cryo', 392, 910, 136],
  ['debris', 898, 408, 144], ['cryo', 404, 892, 112], ['arc', 910, 394, 120],
  ['debris', 398, 902, 128], ['steam', 894, 406, 136], ['steam', 410, 392, 120],
  ['corrosive', 902, 400, 144]
];

export const XENO_TRIALS_STAGE_HAZARD_LIMITS_V188 = freeze({
  revision: 188, tickRate: 120, maximumActors: 10, hitIntervalTicks: 120,
  maximumTick: 1000000, maximumContacts: 10000, maximumDamage: 80000
});
const limits = XENO_TRIALS_STAGE_HAZARD_LIMITS_V188;
export const XENO_TRIALS_STAGE_HAZARDS_V188 = freeze(XENO_TRIALS_BOSS_STAGES_V179.map((stage, index) => {
  const [kind, first, second, width] = settings[index], tuning = kinds[kind];
  const warningTicks = 600 + index % 3 * 60;
  return { id: `xhz188-${stage.id.slice(6)}`, stageId: stage.id, kind,
    ...tuning, anchors: [first, second], width, bottom: 0,
    graceTicks: 180 + index % 4 * 24, warningTicks,
    periodTicks: warningTicks + tuning.activeTicks + 480 + index % 5 * 24,
    hitIntervalTicks: limits.hitIntervalTicks, affectsCombat: true,
    canonExact: false, canonStatus: 'original-tantalus-simulation' };
}));
const definitions = new Map([...XENO_TRIALS_STAGE_HAZARDS_V188, ...ARBITER_STAGE_HAZARDS_V191].map(value => [value.stageId, value]));
export function getXenoTrialsStageHazardV188(stageId) { return definitions.get(stageId) || null; }
const integer = (value, min = 0, max = limits.maximumTick) => Number.isSafeInteger(value) && value >= min && value <= max;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (value, keys) => record(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
const stateKeys = ['revision', 'stageId', 'seed', 'startedTick', 'lastTick', 'playerDamage', 'totalDamage', 'contacts', 'nextHits'];
const actorId = actor => actor.side === 'player' ? 'player' : actor.instanceIdV180;
const validActorId = id => typeof id === 'string' && (id === 'player' || /^horde-[1-9]\d{0,3}$/.test(id));

export function createXenoTrialsStageHazardsV188(stageId, seed = 1, startedTick = 0) {
  if (!definitions.has(stageId) || !integer(seed, 0, 0xffffffff) || !integer(startedTick)) return null;
  return { revision: 188, stageId, seed, startedTick, lastTick: startedTick,
    playerDamage: 0, totalDamage: 0, contacts: 0, nextHits: [] };
}

/** No geometry, damage tuning, cached visual phase or arbitrary object keys are
 * admitted from a save. They are always reconstructed from the authored stage.
 */
export function validateXenoTrialsStageHazardsV188(state, { stageId, seed, tick } = {}) {
  if (!exactKeys(state, stateKeys) || state.revision !== 188 || !definitions.has(stageId)
    || state.stageId !== stageId || state.seed !== seed || !integer(seed, 0, 0xffffffff)
    || !integer(tick) || !integer(state.startedTick, 0, tick) || !integer(state.lastTick, state.startedTick, tick)
    || !integer(state.contacts, 0, limits.maximumContacts) || !integer(state.totalDamage, 0, limits.maximumDamage)
    || !integer(state.playerDamage, 0, state.totalDamage) || state.totalDamage < state.contacts
    || state.totalDamage > state.contacts * 8 || (state.contacts === 0 && state.totalDamage !== 0)
    || !Array.isArray(state.nextHits) || state.nextHits.length > limits.maximumActors
    || state.nextHits.length > state.contacts) return false;
  const upperBound = Math.ceil((state.lastTick - state.startedTick) / limits.hitIntervalTicks) * limits.maximumActors;
  if (state.contacts > upperBound) return false;
  const ids = new Set();
  for (const entry of state.nextHits) {
    if (!exactKeys(entry, ['actorId', 'tick']) || !validActorId(entry.actorId) || ids.has(entry.actorId)
      || !integer(entry.tick, state.startedTick, state.lastTick + limits.hitIntervalTicks)
      || viewAt(state, entry.tick - limits.hitIntervalTicks)?.phase !== 'active') return false;
    ids.add(entry.actorId);
  }
  return true;
}

/** The checkpoint owner additionally validates HP and the native spawn ledger.
 * Disappearing cadence rows are permitted for actors removed by that ledger.
 */
export function isXenoTrialsStageHazardsForwardV188(before, after) {
  return Boolean(before && after && Array.isArray(before.nextHits) && Array.isArray(after.nextHits)
    && before.stageId === after.stageId && before.seed === after.seed
    && before.startedTick === after.startedTick && after.lastTick >= before.lastTick
    && after.playerDamage >= before.playerDamage && after.totalDamage >= before.totalDamage
    && after.contacts >= before.contacts && before.nextHits.every(previous => {
      const next = after.nextHits.find(value => value.actorId === previous.actorId);
      return !next || next.tick >= previous.tick;
    }));
}

function operationEnabled(match) {
  return Boolean(match?.config?.operationV188?.id && match.operationV188
    && match.config.operationV188.id === match.operationV188.operationId && !match.result
    && !['completed', 'failed'].includes(match.operationV188.status)
    && match.phase === 'active' && match.stageHazardsV188?.stageId === match.config.stageId);
}
function viewAt(state, tick) {
  const definition = definitions.get(state.stageId);
  if (!definition || !integer(tick) || tick < state.startedTick) return null;
  const age = tick - state.startedTick - definition.graceTicks;
  const cycle = Math.max(0, Math.floor(age / definition.periodTicks));
  const position = age < 0 ? -1 : age % definition.periodTicks;
  const phase = position < 0 ? 'idle' : position < definition.warningTicks ? 'warning'
    : position < definition.warningTicks + definition.activeTicks ? 'active' : 'idle';
  const anchor = definition.anchors[(cycle + state.seed % definition.anchors.length) % definition.anchors.length];
  const left = anchor - definition.width / 2, right = anchor + definition.width / 2;
  return { id: definition.id, stageId: definition.stageId, kind: definition.kind,
    label: definition.label, hint: definition.hint, color: definition.color, cycle, phase,
    tick, startedTick: state.startedTick,
    startsTick: state.startedTick + definition.graceTicks + cycle * definition.periodTicks + definition.warningTicks,
    endsTick: state.startedTick + definition.graceTicks + cycle * definition.periodTicks + definition.warningTicks + definition.activeTicks,
    remainingTicks: phase === 'warning' ? definition.warningTicks - position
      : phase === 'active' ? definition.warningTicks + definition.activeTicks - position : 0,
    warningProgress: phase === 'warning' ? position / definition.warningTicks : phase === 'active' ? 1 : 0,
    activeProgress: phase === 'active' ? (position - definition.warningTicks) / definition.activeTicks : 0,
    damage: definition.damage,
    zones: phase === 'idle' ? [] : [{ left, right, bottom: definition.bottom, top: definition.height }],
    playerDamage: state.playerDamage, contacts: state.contacts };
}

export function getXenoTrialsStageHazardViewV188(match) {
  return operationEnabled(match) ? viewAt(match.stageHazardsV188, match.tick) : null;
}

/** The native engine calls once after movement/contact resolution. Environmental
 * contacts have no fictitious attacker, combat meter or reward contribution.
 * HP changes belong to onHit; only its actual accepted reduction is recorded.
 * The same tick cannot be applied twice, even through a reentrant callback.
 */
export function stepXenoTrialsStageHazardsV188(match, bounds, arena, onHit, emit = () => {}) {
  if (!operationEnabled(match) || match.paused || typeof bounds !== 'function' || typeof onHit !== 'function'
    || !integer(match.tick) || match.tick <= match.stageHazardsV188.lastTick) return 0;
  const state = match.stageHazardsV188, previous = viewAt(state, state.lastTick), view = viewAt(state, match.tick);
  if (!view) return 0;
  state.lastTick = match.tick;
  const living = match.fighters.filter(actor => actor.hp > 0 && validActorId(actorId(actor))).slice(0, limits.maximumActors);
  const liveIds = new Set(living.map(actorId));
  state.nextHits = state.nextHits.filter(entry => liveIds.has(entry.actorId) && entry.tick > match.tick);
  if (view.phase !== 'idle' && (view.phase !== previous?.phase || view.cycle !== previous?.cycle))
    emit(view.phase === 'warning' ? 'stage-hazard-warning-v188' : 'stage-hazard-active-v188',
      { hazardId: view.id, kind: view.kind, cycle: view.cycle, startsTick: view.startsTick, endsTick: view.endsTick });
  if (view.phase !== 'active') return 0;
  const zone = view.zones[0];
  if (zone.left < arena.left || zone.right > arena.right) return 0;
  let accepted = 0;
  for (const actor of living) {
    const id = actorId(actor);
    if (state.nextHits.some(entry => entry.actorId === id && entry.tick > match.tick)) continue;
    const body = bounds(actor);
    if (![body.left, body.right, body.bottom, body.top].every(Number.isFinite)
      || body.right <= zone.left || body.left >= zone.right || body.bottom >= zone.top || body.top <= zone.bottom) continue;
    const next = { actorId: id, tick: match.tick + limits.hitIntervalTicks };
    state.nextHits.push(next);
    const before = actor.hp;
    onHit({ to: actor, damage: view.damage, hazardId: view.id, kind: view.kind });
    const damage = Math.max(0, Math.min(view.damage, before - actor.hp));
    if (!(damage > 0)) { state.nextHits = state.nextHits.filter(entry => entry !== next); continue; }
    state.contacts++; state.totalDamage += damage;
    if (id === 'player') state.playerDamage += damage;
    accepted++;
    emit('stage-hazard-contact-v188', { hazardId: view.id, kind: view.kind, actorId: id, damage });
  }
  return accepted;
}

