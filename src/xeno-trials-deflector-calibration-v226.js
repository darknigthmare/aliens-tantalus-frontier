import { getXenoTrialsHordeMinigameV213 } from './xeno-trials-horde-minigames-v213.js';

const orders = 'Bloquez une attaque de face dans chaque zone balisée. Les déflecteurs se déploient après les blocages. Une fois les deux alignés, maintenez Interagir au terminal central.';
const guards = Object.freeze([
  Object.freeze({ id: 'deflector-west', kind: 'terminal', label: 'Zone ouest', x: 475, y: 0, radius: 94, requiredTicks: 1 }),
  Object.freeze({ id: 'deflector-east', kind: 'terminal', label: 'Zone est', x: 865, y: 0, radius: 94, requiredTicks: 1 })
]);
const terminal = Object.freeze({ id: 'deflector-control', kind: 'terminal', label: 'Terminal de contrôle', x: 650, y: 0, radius: 84, requiredTicks: 96 });
const deployTicks = 72;

export const XENO_TRIALS_DEFLECTOR_OPERATION_V226 = Object.freeze({
  id: 'xto226-deflector-calibration', kind: 'relay', title: 'CALIBRAGE DES DÉFLECTEURS', label: 'CALIBRAGE DES DÉFLECTEURS',
  stageId: 'xt179-proving-ground', hordeProtocolId: 'xth226-proving-assault', difficulty: 'easy', factionId: 'containment',
  roundSeconds: 150, reward: 600, instruction: orders, description: orders, startX: 650, cargoStartX: 650, cargoEndX: 650,
  objectives: Object.freeze([...guards, terminal]), deflectorCalibrationV226: true,
  canonExact: false, canonStatus: 'original-tantalus-simulation', revision: 226
});

const integer = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;
const within = (x, target) => Number.isFinite(x) && Math.abs(x - target.x) <= target.radius;
const blocked = event => event?.type === 'block' && event.side === 'player' && event.attacker === 'opponent'
  && event.targetInstanceV180 === 'player' && /^horde-\d+$/.test(event.attackerInstanceV180) && event.damage > 0;
const deploymentEnd = stamps => stamps.every(Boolean) ? Math.max(...stamps.map(stamp => stamp.tick)) + deployTicks : Infinity;
function contactsExhausted(match) {
  const horde = match?.hordeV180;
  const protocol = getXenoTrialsHordeMinigameV213(XENO_TRIALS_DEFLECTOR_OPERATION_V226.hordeProtocolId);
  return horde?.protocolId === protocol.id && horde.wavesCleared === protocol.waves.length
    && (horde.totalKills ?? horde.kills) === protocol.totalEnemies;
}

export function advanceXenoTrialsDeflectorCalibrationV226(state, match, contact, complete) {
  const stamps = state.deflectorCalibrationV226;
  if (state.lastTick >= deploymentEnd(stamps)) {
    state.progress[2] = contact(terminal) ? state.progress[2] + 1 : Math.max(0, state.progress[2] - 2);
    if (state.progress[2] === terminal.requiredTicks) complete(2);
    return;
  }
  const player = match.fighters[0];
  const index = guards.findIndex((zone, slot) => !stamps[slot] && within(player.x, zone));
  if (player.y === 0 && index >= 0) {
    const event = match.events.findLast(hit => hit.tick === match.tick && blocked(hit));
    if (event) {
      stamps[index] = { id: event.id, tick: event.tick, x: player.x };
      complete(index);
    }
  }
  if (stamps.some(stamp => stamp === null) && match.hordeV180?.phase === 'complete' && contactsExhausted(match)) state.integrity = 0;
}

export function validateXenoTrialsDeflectorCalibrationV226(state, match) {
  const stamps = state.deflectorCalibrationV226;
  if (!Array.isArray(stamps) || stamps.length !== guards.length) return false;
  for (const [index, stamp] of stamps.entries()) {
    if (!state.completed[index] ? stamp !== null : !stamp || Object.keys(stamp).length !== 3
      || !integer(stamp.id, 1, Number.MAX_SAFE_INTEGER) || !integer(stamp.tick, state.startedTick + 1, state.lastTick)
      || !within(stamp.x, guards[index])) return false;
    if (!stamp || !match?.events) continue;
    if (stamp.id > match.serial) return false;
    if (stamp.id >= (match.events[0]?.id ?? Infinity)) {
      const event = match.events.find(hit => hit.id === stamp.id);
      if (!blocked(event) || event.tick !== stamp.tick) return false;
    }
    if (stamp.tick === match.tick && (match.fighters?.[0]?.x !== stamp.x || match.fighters[0].y !== 0)) return false;
  }
  const [west, east] = stamps;
  if (west && east && (west.tick === east.tick || Math.sign(west.tick - east.tick) !== Math.sign(west.id - east.id))) return false;
  if (state.progress[2] > Math.max(0, state.lastTick - deploymentEnd(stamps) + 1)) return false;
  const playerBlocks = match?.fighters?.[0]?.stats?.blocks ?? match?.playerStats?.blocks;
  if (match && (!Number.isSafeInteger(playerBlocks) || playerBlocks < stamps.filter(Boolean).length)) return false;
  if (state.failureReason === 'structure-destroyed') {
    return state.integrity === 0 && stamps.some(stamp => stamp === null) && (!match || contactsExhausted(match));
  }
  if (state.integrity !== 100 || match && state.status === 'active' && stamps.some(stamp => stamp === null) && contactsExhausted(match)) return false;
  return true;
}

export function isXenoTrialsDeflectorCalibrationForwardV226(previous, next) {
  return previous.deflectorCalibrationV226.every((stamp, index) => {
    const after = next.deflectorCalibrationV226?.[index];
    return stamp ? after?.id === stamp.id && after.tick === stamp.tick && after.x === stamp.x
      : after === null || after?.tick > previous.lastTick;
  });
}

export function getXenoTrialsDeflectorCalibrationV226(match) {
  const state = match?.operationV188;
  if (state?.operationId !== XENO_TRIALS_DEFLECTOR_OPERATION_V226.id) return null;
  const { deflectorCalibrationV226: stamps, lastTick } = state;
  const deploying = stamps.every(Boolean);
  const ready = lastTick >= deploymentEnd(stamps);
  return { phase: ready ? 'ready' : deploying ? 'deploying' : 'guard', aligned: stamps.map(Boolean),
    deployment: stamps.map(stamp => stamp ? Math.min(1, (lastTick - stamp.tick) / deployTicks) : 0) };
}

export function getXenoTrialsDeflectorTargetsV226(match, view) {
  const { status, completed, progress } = match.operationV188;
  const entities = XENO_TRIALS_DEFLECTOR_OPERATION_V226.objectives.map((objective, index) => ({
    ...objective, active: status === 'active' && !completed[index] && (index < 2 || view.phase === 'ready'),
    guardZone: index < 2, completed: completed[index], progress: progress[index]
  }));
  const playerX = match.fighters?.[0]?.x;
  const zones = entities.filter(entity => entity.guardZone && !entity.completed);
  const target = zones.reduce((best, zone) => Math.abs(zone.x - playerX) < Math.abs(best.x - playerX) ? zone : best, zones[0]);
  return { entities, target: status === 'active' ? target ?? entities[2] : null };
}
