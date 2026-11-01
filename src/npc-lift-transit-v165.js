import { HUB_DECKS, HUB_WORLD, buildHubObstacleGeometryV87 } from './hub-game.js';
import { buildHubDoorNetworkV58 } from './topology-coherence-v58.js';
import { liftPhaseDurationV163 } from './hub-lift-transit-v163.js';

const finite = Number.isFinite;
const phases = ['boarding', 'closing', 'travel', 'opening', 'exiting'];
const crewIds = ['crew-10-david-8r', 'crew-09-inez-harlow', 'crew-08-maksim-orlov', 'crew-11-jun-park',
  'crew-06-rook', 'crew-02-tamsin-velez'];
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

const queueOverlapV177 = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
function queuePassengerV177(entry) {
  const d=entry?.definition,e=entry?.state,a=e?.actor,b=entry?.body;
  if(entry?.canYield!==true||!d||!e||e.localOwner||!a||!b||a.lift
    ||!['walking-lift','waiting-lift'].includes(a.stage)||!crewIds.includes(d.crewId)
    ||typeof d.id!=='string'||!/^[a-z0-9-]{1,80}$/.test(d.id)
    ||a.crewId!==d.crewId||b.crewId!==d.crewId||b.alive===false||b.downed
    ||b.w!==44||b.h!==92||a.y!==532||b.y!==532||b.roomId!==a.roomId
    ||![a.x,a.velocity,b.x,b.vx===undefined?0:b.vx,entry.destinationX].every(finite)
    ||Math.abs(a.x-b.x)>1e-6||!['outbound','return'].includes(a.direction))return null;
  const home=e.stationOrigin||e.origin,toDeck=a.direction==='return'?home?.deck:d.deck;
  if(!Number.isInteger(a.deck)||!Number.isInteger(toDeck)||a.deck===toDeck
    ||a.deck<0||a.deck>=HUB_DECKS.length||toDeck<0||toDeck>=HUB_DECKS.length)return null;
  const from=npcLiftSocketV165(a.deck,d.shaftId),to=npcLiftSocketV165(toDeck,d.shaftId);
  if(!from||!to||a.roomId!==from.roomId||from.x!==to.x)return null;
  const cabinX=from.x-22;
  if(Math.abs(a.x-cabinX)>96.000001)return null;
  return{routeId:d.id,crewId:d.crewId,shaftId:d.shaftId,fromDeck:a.deck,toDeck,
    cabinX,arrivalX:cabinX+(Math.sign(entry.destinationX-cabinX)||-1)*96,actor:a,body:b};
}

/** Resolve only a genuine closed departure cycle. The election is derived
 * from the saved route/direction/deck, never elapsed time or actor insertion
 * order. It assigns a walking goal; ownership and physical movement stay in
 * the existing route controller. No queue credit constitutes a lift journey. */
export function npcLiftQueueCourtesyPlanV177(entries,{shaftId,occupied=false}={}) {
  if(occupied||!Array.isArray(entries)||typeof shaftId!=='string')return null;
  const passengers=entries.map(queuePassengerV177).filter(p=>p&&p.shaftId===shaftId)
    .sort((a,b)=>a.routeId.localeCompare(b.routeId));
  if(new Set(passengers.map(p=>p.routeId)).size!==passengers.length
    ||new Set(passengers.map(p=>p.crewId)).size!==passengers.length)return null;
  const close=(path,start)=>{
    const last=path.at(-1);
    if(last.toDeck===start.fromDeck)return path.length>1?path:null;
    if(path.length>=passengers.length)return null;
    for(const next of passengers)if(next.fromDeck===last.toDeck&&!path.includes(next)){
      const cycle=close([...path,next],start);if(cycle)return cycle;
    }
    return null;
  };
  let cycle=null;
  for(const first of passengers){cycle=close([first],first);if(cycle)break;}
  if(!cycle)return null;
  const winner=cycle[0],yielding=cycle[1],holdingX=winner.cabinX-Math.sign(winner.arrivalX-winner.cabinX)*96;
  if(yielding.fromDeck!==winner.toDeck||yielding.cabinX!==winner.cabinX)return null;
  const walk={x:Math.min(yielding.actor.x,holdingX),y:532,w:44+Math.abs(holdingX-yielding.actor.x),h:92};
  if(buildHubObstacleGeometryV87(yielding.fromDeck)
    .some(box=>box.collisionMode!=='one-way-top'&&queueOverlapV177(walk,box)))return null;
  return{schema:177,shaftId,winnerRouteId:winner.routeId,winnerCrewId:winner.crewId,
    fromDeck:winner.fromDeck,toDeck:winner.toDeck,cabinX:winner.cabinX,arrivalX:winner.arrivalX,
    yieldRouteId:yielding.routeId,yieldCrewId:yielding.crewId,holdingX,
    cycle:cycle.map(p=>p.routeId)};
}

/** Departure priority is relaxed only after its actual sole body is stopped
 * at the opposite96px waiting mark, outside the complete arrival sweep. The
 * original occupancy and cabin-reservation checks remain mandatory. */
export function npcLiftQueueCourtesyClearedV177(plan,entry) {
  const p=queuePassengerV177(entry);
  if(plan?.schema!==177||!p||p.routeId!==plan.yieldRouteId||p.crewId!==plan.yieldCrewId
    ||p.shaftId!==plan.shaftId||p.fromDeck!==plan.toDeck||p.cabinX!==plan.cabinX
    ||Math.abs(p.actor.x-plan.holdingX)>.01||Math.abs(p.actor.velocity)>.01
    ||Math.abs(p.body.vx||0)>.1)return false;
  const side=Math.sign(plan.arrivalX-plan.cabinX);
  if(![-1,1].includes(side)||plan.arrivalX!==plan.cabinX+side*96
    ||plan.holdingX!==plan.cabinX-side*96)return false;
  const arrival={x:Math.min(plan.cabinX,plan.arrivalX)-12,y:532,
    w:44+Math.abs(plan.arrivalX-plan.cabinX)+24,h:92};
  return !queueOverlapV177(arrival,p.body);
}
