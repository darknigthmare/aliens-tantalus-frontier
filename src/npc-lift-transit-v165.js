import { HUB_DECKS, HUB_WORLD } from './hub-game.js';
import { buildHubDoorNetworkV58 } from './topology-coherence-v58.js';
import { liftPhaseDurationV163 } from './hub-lift-transit-v163.js';

const finite = Number.isFinite;
const phases = ['boarding', 'closing', 'travel', 'opening', 'exiting'];
const crewIds = ['crew-10-david-8r', 'crew-09-inez-harlow', 'crew-08-maksim-orlov', 'crew-11-jun-park'];
export const NPC_LIFT_TRANSIT_V165 = Object.freeze({ schema: 165, passengerWidth: 44, passengerHeight: 92,
  speed: 27, exclusiveCabin: true, handoff: 'closed-leaves-after-timed-carriage',
  coordinateDistancePolicy: 'chart-handoff-is-not-walking-distance' });
export const npcLiftSocketV165 = (deck, shaftId) => buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck).find(d => d.shaftId === shaftId);
export function npcLiftDurationV165(trip) {
  if (trip.phase === 'boarding') return Math.max(.1, Math.abs(trip.originX - trip.cabinX) / 27);
  if (trip.phase === 'exiting') return Math.max(.1, Math.abs(trip.exitX - trip.cabinX) / 27);
  // Motion reduction never shortens the physical carriage of a passenger.
  return liftPhaseDurationV163({ ...trip, reducedMotion: false });
}
export function npcLiftPoseV165(trip) {
  const p = Math.max(0, Math.min(1, trip.elapsed / npcLiftDurationV165(trip)));
  const x = trip.phase === 'boarding' ? trip.originX + (trip.cabinX - trip.originX) * p
    : trip.phase === 'exiting' ? trip.cabinX + (trip.exitX - trip.cabinX) * p : trip.cabinX;
  return { x, y: HUB_WORLD.floorY - 92, w: 44, h: 92, facing: trip.facing,
    deck: ['opening', 'exiting'].includes(trip.phase) ? trip.toDeck : trip.fromDeck };
}
export function npcLiftDoorProgressV165(trip) {
  const p = Math.max(0, Math.min(1, trip.elapsed / npcLiftDurationV165(trip)));
  return ['boarding', 'exiting'].includes(trip.phase) ? 1 : trip.phase === 'closing' ? 1 - p : trip.phase === 'opening' ? p : 0;
}
export function normalizeNpcLiftTransitV165(value) {
  if (value?.schema !== 165 || !crewIds.includes(value.crewId) || !phases.includes(value.phase)
    || !Number.isInteger(value.fromDeck) || !Number.isInteger(value.toDeck) || value.fromDeck === value.toDeck
    || ![value.fromDeck, value.toDeck].every(d => d >= 0 && d < HUB_DECKS.length)
    || ![value.originX, value.exitX, value.cabinX, value.elapsed, value.carriageSeconds].every(finite)
    || ![-1, 1].includes(value.facing) || value.elapsed < 0 || value.carriageSeconds < 0 || value.carriageSeconds > 60) return null;
  const source = npcLiftSocketV165(value.fromDeck, value.shaftId), destination = npcLiftSocketV165(value.toDeck, value.shaftId);
  if (!source || !destination || value.cabinX !== source.x - 22 || destination.x - 22 !== value.cabinX
    || Math.abs(value.originX - value.cabinX) !== 96 || Math.abs(value.exitX - value.cabinX) !== 96
    || value.elapsed > npcLiftDurationV165(value) + 1e-7
    || value.phase === 'travel' && Math.abs(value.carriageSeconds - value.elapsed) > 1e-7
    || ['opening', 'exiting'].includes(value.phase) && Math.abs(value.carriageSeconds - npcLiftDurationV165({ ...value, phase: 'travel' })) > 1e-7
    || !['travel', 'opening', 'exiting'].includes(value.phase) && value.carriageSeconds !== 0) return null;
  return { schema: 165, crewId: value.crewId, shaftId: value.shaftId, fromDeck: value.fromDeck, toDeck: value.toDeck,
    originX: value.originX, exitX: value.exitX, cabinX: value.cabinX, phase: value.phase,
    elapsed: value.elapsed, carriageSeconds: value.carriageSeconds, facing: value.facing };
}
export function createNpcLiftTransitV165(actor, { fromDeck, toDeck, shaftId, exitDirection = 1 } = {}) {
  const lift = npcLiftSocketV165(fromDeck, shaftId), cabinX = lift && lift.x - 22;
  if (!actor || actor.alive === false || actor.downed || actor.roomId !== lift?.roomId || actor.w !== 44 || actor.h !== 92
    || actor.y !== HUB_WORLD.floorY - 92 || ![-1, 1].includes(exitDirection) || Math.abs(actor.x - cabinX) !== 96) return null;
  return normalizeNpcLiftTransitV165({ schema: 165, crewId: actor.crewId, shaftId, fromDeck, toDeck,
    originX: actor.x, cabinX, exitX: cabinX + 96 * exitDirection, phase: 'boarding', elapsed: 0,
    carriageSeconds: 0, facing: Math.sign(cabinX - actor.x) });
}
export function advanceNpcLiftTransitV165(previous, delta, { running = true, sourceClear = true, arrivalClear = true, exitClear = true } = {}) {
  const trip = normalizeNpcLiftTransitV165(previous);
  if (!trip || !running || !finite(delta) || delta <= 0) return { trip, handoff: false, complete: false, blocked: false, walked: 0 };
  const dt = Math.min(delta, .1), before = npcLiftPoseV165(trip);
  if (trip.phase === 'boarding' && !sourceClear || trip.phase === 'travel' && !arrivalClear
    || trip.phase === 'opening' && !arrivalClear || trip.phase === 'exiting' && !exitClear)
    return { trip, handoff: false, complete: false, blocked: true, walked: 0 };
  const elapsed = Math.min(npcLiftDurationV165(trip), trip.elapsed + dt);
  let next = { ...trip, elapsed, carriageSeconds: trip.carriageSeconds + (trip.phase === 'travel' ? elapsed - trip.elapsed : 0) };
  const after = npcLiftPoseV165(next), walked = ['boarding', 'exiting'].includes(trip.phase) ? Math.abs(after.x - before.x) : 0;
  if (elapsed + 1e-9 < npcLiftDurationV165(trip)) return { trip: next, handoff: false, complete: false, blocked: false, walked };
  if (trip.phase === 'exiting') return { trip: null, pose: after, handoff: false, complete: true, blocked: false, walked };
  next = { ...next, phase: phases[phases.indexOf(trip.phase) + 1], elapsed: 0,
    facing: trip.phase === 'opening' ? Math.sign(trip.exitX - trip.cabinX) : trip.facing };
  return { trip: next, handoff: trip.phase === 'travel', complete: false, blocked: false, walked };
}
