import { HUB_DECKS, HUB_WORLD, buildHubObstacleGeometryV87 } from './hub-game.js';
import { HubGame as RosterHubV52 } from './hub-v52-runtime.js';
import { getNpcRoutineStandingAnchorV158 } from './hub-v62-runtime.js';
import { HUB_ANNEX_BY_ID_V137 } from './hub-annex-registry-v137.js';
import { getHubAnnexRuntimeGeometryV139 } from './hub-annex-runtime-geometry-v139.js';
import { getHubDoorDestinationDescriptorsV138 } from './hub-destination-signage-v138.js';
import { annexNpcDutiesV141, createAnnexNpcsV141, getAnnexNpcPlacementV141 } from './hub-annex-npc-life-v141.js';
import { getHubDoorFaceV142, projectHubDoorActorV142 } from './hub-door-passage-v142.js';
import { advanceNpcLifeV136, moveNpcAgainstGeometryV136, spreadNpcStationSpawnsV136 } from './npc-life-v136.js';
import { getHubRoomPresentationV119 } from './hub-room-presentation-v119.js';
import { drawHumanAtlasV133 } from './human-visual-contract-v133.js';
import { CREW_SPRITE_IDS, CREW_MISSION_SPRITE_IDS, resolveSpriteClip } from './sprite-animation-runtime.js';
import { buildHubDoorNetworkV58 } from './topology-coherence-v58.js';
import { getHubBulkheadColliderV134 } from './hub-bulkhead-depth-v134.js';


/** V161 adds two physically bounded service routes. The reviewed V159 BISHOP
 * route remains frozen; each new owner has independent private symbols and
 * combines the existing door hooks with super, never replacing another crew.
 * All movement/occlusion uses the same native floor, paired socket and atlas
 * policy. Cross-deck/lift travel remains delegated, explicitly unobserved. */
export function createServiceRouteV161(definition, { schema: SCHEMA = 161,
  stateField: STATE_FIELD = 'npcServiceRoutesV161', alternateAnnexRoomIds = [],
  homeRoomId: HOME = definition.parentRoomId,
  nativeTemplateDeck: TEMPLATE_DECK = definition.deck,
  originPhase: ORIGIN_PHASE = 'station' } = {}) {
const { crewId: ID, parentRoomId: PARENT, annexRoomId: ANNEX, deck: DECK } = definition;
const actorKey = Symbol('actor:' + definition.id), stateKey = Symbol('state:' + definition.id),
  handoffKey = Symbol('handoff:' + definition.id), sandboxKey = Symbol('sandbox:' + definition.id),
  peersKey = Symbol('peers:' + definition.id),
  doorsKey = Symbol('main-doors:' + definition.id),
  syncDoorsKey = Symbol('sync-main-doors:' + definition.id),
  refreshKey = Symbol('refresh:' + definition.id), shouldHandoffKey = Symbol('shouldHandoff:' + definition.id),
  handoffMethodKey = Symbol('handoffMethod:' + definition.id),
  handoffRebuildKey = Symbol('handoffRebuild:' + definition.id);
const parent = HUB_DECKS[DECK].rooms.find(room => room.id === PARENT);
const home = HUB_DECKS[DECK].rooms.find(room => room.id === HOME);
if (!home || !parent) throw new RangeError('Service origin must be a real room on the portal deck: ' + definition.id);
const mainRooms = HUB_DECKS[DECK].rooms.filter(room => room.xEnd > Math.min(parent.xStart, home.xStart)
  && room.xStart < Math.max(parent.xEnd, home.xEnd));
const mainIds = mainRooms.map(room => room.id);
const mainLeft = mainRooms[0].xStart, mainRight = mainRooms.at(-1).xEnd;
const corridor = HOME !== PARENT;
const mainDoorTemplates = corridor ? buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, DECK)
  .filter(door => !door.lift && door.x > mainLeft && door.x < mainRight) : [];
const mainDoorIds = mainDoorTemplates.map(door => door.id);
const annex = getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137[ANNEX]);
const descriptor = getHubDoorDestinationDescriptorsV138(parent).find(door => door.destinationId === ANNEX);
// Reserve every shipped idle/walk/work alpha hull before defining the real
// opening. Leila's broad tool pose is 66.78px wide; the historical 64.73px
// aperture shaves her arms even fully open. Her swept facing envelope gets
// 3px total clearance, rounded upward. Scale the WHOLE paired native
// door uniformly (not just its clip or inset), preserving painted jambs and
// source aspect. Both faces still fit their 118x192 sockets and stand at624.
const actorHullWidth = getAnnexNpcPlacementV141(ANNEX, ID).hull.w;
const minimumOpeningWidth = Math.ceil(actorHullWidth + 3);
const fitDoorFace = face => {
  if (actorHullWidth <= face.opening.w) return face;
  const scale = minimumOpeningWidth / face.opening.w;
  const w = face.target.w * scale, h = face.target.h * scale;
  if (w > face.socket.w || h > face.socket.h) throw new RangeError('Native service socket cannot admit whole actor: ' + definition.id);
  const target = { x: face.socket.x + (face.socket.w - w) / 2,
    y: face.socket.y + face.socket.h - h, w, h };
  return { ...face, target, pairedSize: { w, h }, opening: {
    x: target.x + (face.opening.x - face.target.x) * scale,
    y: target.y + (face.opening.y - face.target.y) * scale,
    w: face.opening.w * scale, h: face.opening.h * scale } };
};
const parentFace = fitDoorFace(getHubDoorFaceV142(descriptor.socket, { ...annex.entrance, x: annex.entranceLocalX - annex.entrance.w / 2 }, annex.art.alphaBounds.door));
const localFace = fitDoorFace(getHubDoorFaceV142({ ...annex.entrance, x: annex.entranceLocalX - annex.entrance.w / 2 }, descriptor.socket, annex.art.alphaBounds.door));
const faces = { [PARENT]: parentFace, [ANNEX]: localFace };
const finite = Number.isFinite;
const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const stages = ['walking', 'service', 'opening', 'covering', 'revealing'];
const reasons = ['daily-schedule', 'active-crisis', 'infestation', 'mission-assignment', 'medical-recovery', 'unavailable', 'interaction', 'occupied',
  ...(alternateAnnexRoomIds.length ? ['annex-assignment'] : [])];
const alternateDuty = hub => annexNpcDutiesV141(hub.npcRoutineResolutionsV62, hub)
  .find(duty => duty.crewId === ID && alternateAnnexRoomIds.includes(duty.roomId));
const crossing = state => ['opening', 'covering', 'revealing'].includes(state?.stage);
const inDoorway = actor => {
  const opening = actor && faces[actor.roomId]?.opening;
  return Boolean(opening && actor.x <= opening.x + opening.w + 12
    && actor.x + (actor.w || 44) >= opening.x - 12);
};
const socketX = roomId => faces[roomId].opening.x + faces[roomId].opening.w / 2 - 22;
const portalDestination = state => state.targetRoomId === ANNEX ? ANNEX : PARENT;
const inMainChart = roomId => mainIds.includes(roomId);
const normalizeMainDoors = value => Object.fromEntries(mainDoorIds.map(id => [id,
  finite(value?.[id]) && value[id] >= 0 && value[id] <= 1 ? value[id] : 0]));
const homeTemplate = () => {
  const actor = RosterHubV52.prototype.createNpcs.call({}, TEMPLATE_DECK).find(npc => npc.crewId === ID);
  if (!actor) throw new RangeError('Unknown native service identity: ' + definition.id);
  // V165 can retain an actually observed local work post whose native roster
  // lives on another deck. This template supplies identity/art only: admission
  // still requires a real native body at HOME or a validated saved owner.
  // It never manufactures an interdeck arrival from the timetable sample.
  return spreadNpcStationSpawnsV136([{ ...actor, mobile: false,
    roomId: HOME, x: getNpcRoutineStandingAnchorV158(ID, HOME, ORIGIN_PHASE) }], [home])[0];
};
const mainPost = (roomId, phase = 'station') => spreadNpcStationSpawnsV136([{ ...homeTemplate(), roomId,
  x: getNpcRoutineStandingAnchorV158(ID, roomId, phase), mobile: false }],
  [mainRooms.find(room => room.id === roomId)])[0]?.x;

const HUB_NPC_ANNEX_CIRCULATION_V161 = Object.freeze({ id: definition.id, schema: SCHEMA, crewId: ID, deck: DECK,
  parentRoomId: PARENT, annexRoomId: ANNEX, connectionId: descriptor.connectionId,
  maximumSpeed: 27, acceleration: 92, actorWidth: 44, actorHeight: 92,
  openingSeconds: .42, coveringSeconds: .65, reducedDoorSeconds: .12,
  crossingPolicy: 'paired-airlock-covered-coordinate-handoff',
  source: definition.source || 'native-v52-actor-v141-v156-watches-v138-sockets-v142-paired-doors',
  ...(corridor ? { homeRoomId: HOME, mainRoomIds: Object.freeze([...mainIds]),
    mainDoorIds: Object.freeze([...mainDoorIds]), mainTravelPolicy: 'continuous-native-floor-and-bulkheads' } : {}),
  excluded: Object.freeze(['lift-transit', 'other-annex-routes', 'new-back-view-art']) });

/** Strict actual coordinates and finite native door phases, never the old
 * timetable's sampled room pose. Historical V158/ECHO state is untouched. */
function normalizeNpcAnnexCirculationV161(value) {
  const rawHandoff = value?.schema === SCHEMA && value.nativeHandoff;
  const nativeTarget = rawHandoff?.reason !== 'annex-assignment'
    && HUB_DECKS.some(deck => deck.rooms.some(room => room.id === rawHandoff?.toRoomId));
  const annexTarget = rawHandoff?.reason === 'annex-assignment' && rawHandoff?.fromRoomId === HOME
    && rawHandoff?.owner === 'native-v141-annex-watch'
    && alternateAnnexRoomIds.includes(rawHandoff?.toRoomId);
  const nativeHandoff = rawHandoff?.crewId === ID && [...mainIds, ANNEX].includes(rawHandoff.fromRoomId)
    && (nativeTarget || annexTarget)
    && reasons.includes(rawHandoff.reason) && rawHandoff.observedTravel === false
    ? { crewId: ID, fromRoomId: rawHandoff.fromRoomId, toRoomId: rawHandoff.toRoomId,
      reason: rawHandoff.reason, observedTravel: false, owner: annexTarget ? 'native-v141-annex-watch' : 'native-v62-routine' } : null;
  const empty = { schema: SCHEMA, actor: null, nativeHandoff }, a = value?.schema === SCHEMA && value.actor;
  if (!a || a.crewId !== ID || a.deck !== DECK || ![...mainIds, ANNEX].includes(a.roomId)
    || ![...mainIds, ANNEX].includes(a.targetRoomId) || !stages.includes(a.stage)
    || ![a.x, a.y, a.homeX, a.dutyX, a.velocity, a.time, a.distance, a.doorProgress].every(finite)
    || a.y !== 532 || a.homeX < home.xStart + 96 || a.homeX > home.xEnd - 140
    || a.dutyX < 24 || a.dutyX > annex.world.width - 68
    || a.x < (inMainChart(a.roomId) ? mainLeft + 24 : 24)
    || a.x > (inMainChart(a.roomId) ? mainRight - 68 : annex.world.width - 68)
    || Math.abs(a.velocity) > 27.000001 || ![-1, 1].includes(a.facing)
    || a.time < 0 || a.time > 1e9 || a.distance < 0 || a.distance > 1e9
    || a.doorProgress < 0 || a.doorProgress > 1
    || !Number.isInteger(a.crossings) || a.crossings < 0 || a.crossings > 1e6
    || !Number.isInteger(a.arrivals) || a.arrivals < 0 || a.arrivals > 1e6
    || ![HOME, ANNEX].includes(a.admittedRoomId)) return empty;
  const bulkheadProgress = normalizeMainDoors(a.bulkheadProgress);
  const targetPostX = corridor ? (finite(a.targetPostX) ? a.targetPostX : a.homeX) : null;
  if (corridor && (targetPostX < mainLeft + 96 || targetPostX > mainRight - 140
    || inMainChart(a.targetRoomId) && (a.targetRoomId === HOME ? targetPostX !== a.homeX
      : !['station', 'work', 'break'].some(phase => Math.abs(mainPost(a.targetRoomId, phase) - targetPostX) < 1e-8)))) return empty;
  if (corridor && a.bulkheadProgress != null && (typeof a.bulkheadProgress !== 'object'
    || Array.isArray(a.bulkheadProgress) || Object.entries(a.bulkheadProgress).some(([id, progress]) =>
      !mainDoorIds.includes(id) || !finite(progress) || progress < 0 || progress > 1))) return empty;
  if (corridor && inMainChart(a.roomId)) {
    const room = mainRooms.find(room => room.id === a.roomId);
    if (a.x + 44 <= room.xStart || a.x >= room.xEnd) return empty;
    if (mainDoorTemplates.some(door => overlap({ x: a.x, y: a.y, w: 44, h: 92 }, getHubBulkheadColliderV134(door))
      && bulkheadProgress[door.id] < .82)) return empty;
  }
  const dutyPlan = getAnnexNpcPlacementV141(ANNEX, ID);
  if (!dutyPlan?.rails.some(rail => a.dutyX >= rail.min && a.dutyX <= rail.max)
    || overlap({ x: a.homeX, y: 532, w: 44, h: 92 }, { ...descriptor.socket, x: descriptor.socket.x - 12, w: descriptor.socket.w + 24 })) return empty;
  if (a.stage === 'service' && Math.abs(a.x - (a.roomId === ANNEX ? a.dutyX : corridor ? targetPostX : a.homeX)) > .26) return empty;
  if (crossing(a) && (![PARENT, ANNEX].includes(a.roomId) || Math.abs(a.x - socketX(a.roomId)) > .26 || a.velocity !== 0)
    || ['opening', 'covering'].includes(a.stage) && a.roomId !== (a.targetRoomId === ANNEX ? PARENT : ANNEX)
    || a.stage === 'revealing' && a.roomId !== portalDestination(a)
    || a.stage === 'service' && a.roomId !== a.targetRoomId) return empty;
  return { schema: SCHEMA, nativeHandoff: null, actor: { crewId: ID, deck: DECK, roomId: a.roomId, x: a.x, y: a.y,
    homeX: a.homeX, dutyX: a.dutyX, targetRoomId: a.targetRoomId, stage: a.stage,
    velocity: a.velocity, facing: a.facing, doorProgress: a.doorProgress,
    time: a.time, distance: a.distance, crossings: a.crossings, arrivals: a.arrivals,
    admittedRoomId: a.admittedRoomId, reason: reasons.includes(a.reason) ? a.reason : 'unavailable',
    ...(corridor ? { bulkheadProgress, targetPostX } : {}) } };
}

function npcAnnexInterruptionV161(resolution, actor) {
  if (!resolution || actor?.alive === false || actor?.downed) return 'unavailable';
  if (resolution.alert) return resolution.reason === 'active-crisis' ? 'active-crisis' : 'infestation';
  if (resolution.missionAssigned) return 'mission-assignment';
  if (resolution.needsCare) return 'medical-recovery';
  return null;
}

function createNpcAnnexCirculationStateV161(actor, dutyActor) {
  if (actor?.crewId !== ID || ![HOME, ANNEX].includes(actor.roomId) || !dutyActor) return null;
  return normalizeNpcAnnexCirculationV161({ schema: SCHEMA, actor: { crewId: ID, deck: DECK,
    roomId: actor.roomId, x: actor.x, y: actor.y, homeX: actor.roomId === HOME ? actor.x : homeTemplate().x,
    dutyX: dutyActor.x, targetRoomId: actor.roomId, stage: 'service', velocity: 0,
    facing: actor.facing === -1 ? -1 : 1, doorProgress: 0, time: 0, distance: 0,
    crossings: 0, arrivals: 0, admittedRoomId: actor.roomId, reason: 'daily-schedule' } }).actor;
}

function npcAnnexDoorPassageV161(actor, destinationRoomId, { peers = [], player = null } = {}) {
  const source = actor.roomId, local = destinationRoomId === ANNEX;
  if (source === destinationRoomId || !faces[source] || !faces[destinationRoomId]) return null;
  const sourcePeers = peers.filter(n => n !== actor && n.crewId !== ID && n.alive !== false && n.roomId === source);
  if (player?.roomId === source && player.alive !== false) sourcePeers.push(player);
  if (sourcePeers.some(body => overlap(actor, body))) return null;
  const occupied = peers.filter(n => n !== actor && n.crewId !== ID && n.alive !== false && n.roomId === destinationRoomId);
  if (player?.roomId === destinationRoomId && player.alive !== false) occupied.push(player);
  return projectHubDoorActorV142(actor, faces[source], faces[destinationRoomId], {
    bounds: { x: local ? 24 : parent.xStart + 24, y: 0,
      w: local ? annex.world.width - 48 : parent.xEnd - parent.xStart - 48, h: 720 },
    surfaces: local ? annex.platforms : [{ x: parent.xStart, y: 624, w: parent.xEnd - parent.xStart, h: 96 }],
    solids: local ? annex.colliders : buildHubObstacleGeometryV87(DECK), occupied
  });
}

/** Whole-body floor walking spends actual horizontal distance. A rear portal
 * has a separate, durable door cycle: only a fully covering leaf may change
 * coordinate charts. It cannot manufacture gait, distance, rewards or events. */
function advanceNpcAnnexCirculationV161(previous, actor, delta, {
  resolution, duty = false, peers = [], player = null, portalBusy = false, running = true,
  reducedMotion = false, doors = [], alternateAssignment = false,
  returnToOrigin = false, preserveIntentVelocity = false,
  yieldGoalX = null,
  colliders = actor?.roomId === ANNEX ? annex.colliders : buildHubObstacleGeometryV87(DECK)
} = {}) {
  if (!previous || !actor || !running || !finite(delta) || delta <= 0) return previous;
  const dt = Math.min(delta, .1), originalX = actor.x;
  let s = { ...previous, x: actor.x, y: actor.y, time: Math.min(1e9, previous.time + dt), actualVelocity: 0, blocked: false };
  const interruption = npcAnnexInterruptionV161(resolution, actor);
  const emergency = interruption === 'active-crisis' || interruption === 'infestation';
  const clearingDoor = emergency && (crossing(s) || s.doorProgress > 0 || inDoorway(actor));
  if (!clearingDoor && (interruption || actor.workClock > 0 || actor.supportClock > 0)) return { ...s, velocity: 0,
    reason: interruption || 'interaction' };
  // An emergency cannot leave a frozen body owning both faces indefinitely.
  // Reopen its current leaf, withdraw on the real floor in the same chart,
  // then close only after the whole body clears the opening. Merely dropping
  // the reservation would instead allow a player to pass through that body.
  if (clearingDoor && s.stage !== 'revealing' && crossing(s))
    s = { ...s, targetRoomId: s.roomId, stage: 'revealing' };
  const nativeRoomId = resolution?.phase === 'route' ? resolution.toRoomId : resolution?.roomId;
  const nativeMainPost = !returnToOrigin && corridor && inMainChart(nativeRoomId) && !alternateAssignment;
  const targetRoomId = clearingDoor ? inMainChart(s.roomId) ? HOME : ANNEX : duty ? ANNEX : nativeMainPost ? nativeRoomId : HOME;
  const targetPostX = targetRoomId === HOME ? s.homeX : corridor && inMainChart(targetRoomId)
    ? mainPost(targetRoomId, ['work', 'break', 'station'].includes(resolution?.phase) ? resolution.phase : 'work') : s.targetPostX;
  // A committed cycle finishes before a changed timetable can reverse it.
  // Emergency withdrawal above cancels it without changing coordinate charts.
  if (!crossing(s) && (targetRoomId !== s.targetRoomId || corridor && targetPostX !== s.targetPostX))
    s = { ...s, targetRoomId, stage: 'walking', velocity: preserveIntentVelocity ? s.velocity : 0, ...(corridor ? { targetPostX } : {}) };
  s.reason = interruption || 'daily-schedule';
  const doorDuration = stage => reducedMotion ? .12 : stage === 'covering' ? .65 : .42;
  if (crossing(s)) {
    if (s.stage === 'opening') {
      if (portalBusy || !npcAnnexDoorPassageV161(actor, portalDestination(s), { peers, player })) return { ...s, reason: 'occupied' };
      s.doorProgress = Math.min(1, s.doorProgress + dt / doorDuration(s.stage));
      if (s.doorProgress >= 1) s.stage = 'covering';
    } else if (s.stage === 'covering') {
      if (portalBusy || !npcAnnexDoorPassageV161(actor, portalDestination(s), { peers, player })) return { ...s, reason: 'occupied' };
      s.doorProgress = Math.max(0, s.doorProgress - dt / doorDuration(s.stage));
      if (s.doorProgress === 0) {
        const passage = !portalBusy && npcAnnexDoorPassageV161(actor, portalDestination(s), { peers, player });
        if (!passage) return { ...s, reason: 'occupied' };
        // The only coordinate-chart handoff. It occurs behind a fully closed
        // native leaf, at the same measured aperture offset and supported feet.
        Object.assign(s, { x: passage.arrival.x, y: passage.arrival.y, roomId: portalDestination(s),
          stage: 'revealing', crossings: Math.min(1e6, s.crossings + 1) });
      }
    } else {
      const occupants = peers.filter(n => n !== actor && n.crewId !== ID && n.alive !== false && n.roomId === s.roomId);
      if (player?.roomId === s.roomId && player.alive !== false) occupants.push(player);
      if (portalBusy || occupants.some(body => overlap(actor, body))) return { ...s, reason: 'occupied' };
      s.doorProgress = Math.min(1, s.doorProgress + dt / doorDuration(s.stage));
      if (s.doorProgress >= 1) s.stage = 'walking';
    }
    return { ...s, velocity: 0 };
  }
  const serviceGoal = s.targetRoomId === ANNEX ? s.roomId === ANNEX : inMainChart(s.roomId);
  const yielding = finite(yieldGoalX) && inMainChart(s.roomId)
    && yieldGoalX >= mainLeft + 24 && yieldGoalX <= mainRight - 68;
  const goal = yielding ? yieldGoalX : serviceGoal ? s.targetRoomId === ANNEX ? s.dutyX : corridor ? s.targetPostX : s.homeX
    : socketX(s.roomId === ANNEX ? ANNEX : PARENT);
  if (s.stage === 'service' && !yielding) {
    s.doorProgress = Math.max(0, s.doorProgress - dt / (reducedMotion ? .12 : .65));
    return { ...s, velocity: 0 };
  }
  if (yielding) s.stage = 'walking';
  const physicalPeers = peers.filter(p => p && p !== actor && p.crewId !== ID && p.alive !== false
    && (p.roomId === s.roomId || corridor && inMainChart(p.roomId) && inMainChart(s.roomId))
    && [p.x, p.y, p.w, p.h].every(finite) && Math.abs(p.y + p.h - actor.y - actor.h) < 16);
  if ((player?.roomId === s.roomId || corridor && inMainChart(player?.roomId) && inMainChart(s.roomId))
    && player.alive !== false && [player.x, player.y, player.w, player.h].every(finite)
    && Math.abs(player.y + player.h - actor.y - actor.h) < 16) physicalPeers.push(player);
  const boxes = [...colliders, ...(inMainChart(s.roomId) ? doors.filter(door => mainDoorIds.includes(door.id)
    && door.blocking !== false && door.progress < .82).map(door => getHubBulkheadColliderV134(door)) : []),
  ...physicalPeers.map(p => ({ x: p.x - 12, y: p.y, w: p.w + 24, h: p.h }))];
  for (let remaining = dt; remaining > 1e-8;) {
    const step = Math.min(1 / 120, remaining); remaining -= step;
    const distance = Math.abs(goal - s.x), direction = Math.sign(goal - s.x);
    let speed = Math.min(27, Math.sqrt(2 * 92 * Math.max(0, distance - .1)));
    for (const p of physicalPeers) {
      if (direction * (p.x + p.w / 2 - s.x - actor.w / 2) <= 0) continue;
      const gap = direction > 0 ? p.x - s.x - actor.w - 12 : s.x - p.x - p.w - 12;
      speed = Math.min(speed, Math.sqrt(2 * 92 * Math.max(0, gap - .2)));
    }
    const velocity = s.velocity + clamp(direction * speed - s.velocity, -92 * step, 92 * step);
    const proposed = clamp(s.x + (s.velocity + velocity) * .5 * step, Math.min(s.x, goal), Math.max(s.x, goal));
    const contact = moveNpcAgainstGeometryV136({ ...actor, x: s.x }, proposed, boxes);
    s.x = contact.x; s.velocity = contact.blocked ? 0 : velocity; s.blocked ||= contact.blocked;
    if (Math.abs(s.x - goal) < .25 && Math.abs(s.velocity) < 3) {
      s.velocity = 0;
      // A temporary courtesy bay is physical distance, never an arrival at
      // the actual watch or permission to enter a different portal.
      if (yielding) break;
      if (serviceGoal) { s.stage = 'service'; s.arrivals = Math.min(1e6, s.arrivals + 1); }
      else s.stage = 'opening';
      break;
    }
  }
  s.actualVelocity = (s.x - originalX) / dt;
  if (corridor && inMainChart(s.roomId)) {
    s.roomId = mainRooms.find(room => s.x + actor.w / 2 >= room.xStart && s.x + actor.w / 2 < room.xEnd)?.id || s.roomId;
    s.bulkheadProgress = Object.fromEntries(mainDoorIds.map(id => [id,
      doors.find(door => door.id === id)?.progress ?? s.bulkheadProgress?.[id] ?? 0]));
  }
  s.distance = Math.min(1e9, s.distance + Math.abs(s.x - originalX));
  if (Math.abs(s.actualVelocity) > .1) s.facing = Math.sign(s.actualVelocity);
  // Keep the paired opening free until the departing whole body clears it.
  const opening = faces[s.roomId === ANNEX ? ANNEX : PARENT].opening;
  if (serviceGoal && (s.x + actor.w < opening.x - 12 || s.x > opening.x + opening.w + 12))
    s.doorProgress = Math.max(0, s.doorProgress - dt / (reducedMotion ? .12 : .65));
  return s;
}

/** Opaque native leaves occlude an intact source sprite; no scaling, opacity
 * fade, depth slide, new back view or drawing on a fictitious support rail. */
function npcAnnexOcclusionV161(state) {
  if (!['covering', 'revealing'].includes(state?.stage)) return null;
  const face = faces[state.roomId], p = state.doorProgress;
  return { x: face.opening.x + face.opening.w * (1 - p) / 2,
    y: face.opening.y, w: face.opening.w * p, h: face.socket.y + face.socket.h + 8 - face.opening.y,
    progress: p, policy: 'native-leaf-occlusion-on-supported-feet' };
}

function withHubNpcAnnexCirculationV161(Base) {
  return class HubNpcAnnexCirculationV161 extends Base {
    start(hubState = {}, options = {}) {
      this[sandboxKey] = Boolean(options.editorProject || options.forgeJourneyV141 || this.forgeSessionV141);
      this[stateKey] = this[sandboxKey] ? null : normalizeNpcAnnexCirculationV161(hubState[STATE_FIELD]?.routes?.[definition.id]).actor;
      this[handoffKey] = normalizeNpcAnnexCirculationV161(hubState[STATE_FIELD]?.routes?.[definition.id]).nativeHandoff;
      this[actorKey] = null; this[peersKey] = [];
      this[doorsKey] = mainDoorTemplates.map(door => ({ ...door,
        progress: this[stateKey]?.bulkheadProgress?.[door.id] || 0 }));
      const result = super.start(hubState, options);
      this[syncDoorsKey]();
      this.draw?.(); return result;
    }

    ensureAnnexNpcCohortV141() {
      const cohort = super.ensureAnnexNpcCohortV141();
      if (this[sandboxKey] || this.editorPlaytest || this.forgeSessionV141) return cohort;
      // Actual moving actor belongs to this owner, even after the historical
      // intention cohort changes/rebuilds at a quarter-hour boundary.
      const filtered = cohort.filter(n => n.crewId !== ID);
      const actor = this[actorKey];
      if (actor?.roomId === ANNEX) filtered.push(actor);
      return actor ? filtered : cohort;
    }

    createNpcs(deck) {
      if (this[sandboxKey] || this.editorPlaytest || this.forgeSessionV141) return super.createNpcs(deck);
      const resolution = this.npcRoutineResolutionsV62?.get(ID);
      if (!this[actorKey] && this[stateKey] && (resolution?.missionAssigned || resolution?.needsCare)) {
        this[handoffKey] = { crewId: ID, fromRoomId: this[stateKey].roomId,
          toRoomId: resolution.roomId, reason: resolution.reason, observedTravel: false, owner: 'native-v62-routine' };
        this[stateKey] = null;
      }
      const leased = this.hubNpcLeaseOwnerV163?.(ID);
      const released = !leased && this[shouldHandoffKey](resolution);
      if (released) this[handoffMethodKey](resolution);
      // Release before the base factory reads annex membership, otherwise its
      // parent filter would suppress the newly medical/mission-owned identity.
      const natives = super.createNpcs(deck);
      if (!this[actorKey] && (!leased || this[stateKey]) && !released && !this[handoffRebuildKey] && !this.hubNpcLeaseReentryBlockedV163?.(ID)) {
        const duty = { roomId: ANNEX, crewId: ID, targetX: definition.targetX, duty: definition.duty };
        const dutyActor = createAnnexNpcsV141([duty], this.npcRoutineResolutionsV62).find(n => n.crewId === ID);
        const saved = this[stateKey];
        // A fresh load may adopt the existing standing V141 duty. That is an
        // initial condition, never evidence that a pre-load journey was walked.
        const source = natives.find(n => n.crewId === ID && n.roomId === HOME)
          || super.ensureAnnexNpcCohortV141().find(n => n.crewId === ID && n.roomId === ANNEX);
        let parentSource = source;
        if (!source && !saved && resolution?.roomId === HOME && resolution.deck === DECK) {
          // createNpcs can be requested while the player is on another deck.
          parentSource = super.createNpcs(DECK).find(n => n.crewId === ID && n.roomId === HOME);
        }
        if (dutyActor && (saved || parentSource?.alive !== false && parentSource)
          && !resolution?.missionAssigned && !resolution?.needsCare) {
          const template = parentSource || homeTemplate();
          const actor = this[actorKey] = { ...template, ...(saved ? { x: saved.x, y: saved.y,
            roomId: saved.roomId, facing: saved.facing } : {}), vx: 0, mobile: false };
          this[stateKey] = saved || createNpcAnnexCirculationStateV161(actor, dutyActor);
          this[handoffKey] = null;
          if (!this[stateKey]) this[actorKey] = null;
        }
      }
      const actor = this[actorKey];
      if (!actor) return natives;
      this[refreshKey]();
      if (deck === DECK) this[peersKey] = natives.filter(n => n.crewId !== ID);
      else if (SCHEMA >= 163 && this.getNpcServicePeersV163) this[peersKey] = this.getNpcServicePeersV163(DECK, ID);
      else if (!this[peersKey]?.length) this[peersKey] = super.createNpcs(DECK).filter(n => n.crewId !== ID);
      return [...natives.filter(n => n.crewId !== ID), ...(deck === DECK && (inMainChart(actor.roomId)
        || leased && HUB_DECKS[DECK].rooms.some(room => room.id === actor.roomId)) ? [actor] : [])];
    }

    [shouldHandoffKey](resolution = this.npcRoutineResolutionsV62?.get(ID)) {
      if (this.hubNpcLeaseOwnerV163?.(ID)) return false;
      const actor = this[actorKey], s = this[stateKey];
      if (!actor || !s || !resolution) return false;
      if (resolution.missionAssigned || resolution.needsCare || actor.alive === false || actor.downed) return true;
      // A coupled physical journey may still need this same owner and its
      // real passing pocket after the local watch ends. Retention only
      // prevents the routine handoff; its controller, collisions and all
      // medical/mission/emergency priorities continue to own the body.
      if (!resolution.alert && this.shouldRetainNpcServiceOwnerV165?.(definition.id, actor, s) === true) return false;
      const passingDuty = this.getNpcServicePassingDutyV165?.(definition.id, actor);
      const duty = typeof passingDuty === 'boolean' ? passingDuty
        : annexNpcDutiesV141(this.npcRoutineResolutionsV62, this).some(d => d.crewId === ID && d.roomId === ANNEX);
      if (corridor && inMainChart(resolution.phase === 'route' ? resolution.toRoomId : resolution.roomId) && !alternateDuty(this)) return false;
      return !resolution.alert && !duty && (resolution.roomId !== HOME || alternateDuty(this))
        && actor.roomId === HOME && s.stage === 'service';
    }

    [handoffMethodKey](resolution) {
      const actor = this[actorKey];
      if (!actor) return;
      const interruption = npcAnnexInterruptionV161(resolution, actor);
      const alternate = !interruption && alternateDuty(this);
      this[handoffKey] = { crewId: ID, fromRoomId: actor.roomId, toRoomId: alternate?.roomId || resolution.roomId,
        reason: interruption || (alternate ? 'annex-assignment' : 'daily-schedule'), observedTravel: false,
        owner: alternate ? 'native-v141-annex-watch' : 'native-v62-routine' };
      this[actorKey] = null; this[stateKey] = null;
    }

    [refreshKey]() {
      const actor = this[actorKey], r = this.npcRoutineResolutionsV62?.get(ID);
      if (!actor || !r) return;
      Object.assign(actor, { routinePhaseV62: actor.roomId === ANNEX ? 'work' : r.roomId === actor.roomId ? r.phase : 'station',
        routineReasonV62: r.reason, routineDeterministicKeyV62: r.deterministicKey,
        alerted: Boolean(r.alert), annexNativeV141: actor.roomId === ANNEX,
        annexDutyV141: actor.roomId === ANNEX ? definition.duty : undefined,
        min: actor.x, max: actor.x, mobile: false });
    }

    stepHubNpcLifeV136(actor, delta, options) {
      if (actor === this[actorKey]) return;
      return super.stepHubNpcLifeV136(actor, delta, options);
    }

    [syncDoorsKey]() {
      if (!corridor || this.state?.deck !== DECK || !this.doorStates?.some(door => mainDoorIds.includes(door.id))) return;
      for (const door of this.doorStates) if (mainDoorIds.includes(door.id)) {
        const previous = this[doorsKey]?.find(entry => entry.id === door.id);
        if (previous && previous !== door) door.progress = previous.progress;
      }
      this[doorsKey] = this.doorStates.filter(door => mainDoorIds.includes(door.id));
    }

    hubNpcBulkheadDemandV158(door) {
      if (super.hubNpcBulkheadDemandV158?.(door)) return true;
      const actor = this[actorKey];
      if (!corridor || !actor || !inMainChart(actor.roomId) || !mainDoorIds.includes(door.id)
        || Math.abs(actor.x + actor.w / 2 - door.x) >= 182) return false;
      const locked = this.hubTrainingV132?.lockedDoorIds?.includes(door.id);
      return !locked || overlap(actor, getHubBulkheadColliderV134(door));
    }

    npcAnimationRequest(npc) {
      const request = super.npcAnimationRequest(npc), s = this[stateKey];
      if (npc !== this[actorKey] || npc?.crewId !== ID || this.running === false || s?.stage !== 'walking'
        || !['active-crisis', 'infestation'].includes(s.reason)
        || !(Math.abs(s.actualVelocity) > .1 && Math.abs(npc.vx) > .1)
        || npc.inVehicle || npc.ventTransit || npc.grounded === false || npc.crouching || npc.inCover
        || !['ready', 'role-support'].includes(request?.clipId)) return request;
      const sheetId = CREW_SPRITE_IDS[ID];
      if (![sheetId, CREW_MISSION_SPRITE_IDS[ID]].includes(request.sheetId)
        || !resolveSpriteClip(sheetId, 'walk')?.loop) return request;
      // Only the real emergency withdrawal outranks a stationary alert/work
      // pose. Its own native walk spends measured floor distance; lifecycle,
      // combat, traversal and alternate uniform requests retain precedence.
      // Include the final moving frame that has just closed the cleared leaf.
      return { sheetId, clipId: 'walk' };
    }

    tickAnnexNpcLifeV141(delta) {
      // Let the existing loop own every other crew member, never this singleton.
      const actor = this[actorKey];
      const active = this.activeAnnexNpcsV141;
      this.activeAnnexNpcsV141 = () => active.call(this).filter(n => n !== actor);
      try { return super.tickAnnexNpcLifeV141(delta); } finally { this.activeAnnexNpcsV141 = active; }
    }

    hubDoorPairV142(space, endpointId = null) {
      const pair = super.hubDoorPairV142(space, endpointId);
      if (!pair || space?.id !== ANNEX) return pair;
      return { ...pair, parent: fitDoorFace(pair.parent), local: fitDoorFace(pair.local) };
    }

    npcAnnexDoorDemandV159(annexId) {
      return Math.max(super.npcAnnexDoorDemandV159?.(annexId) || 0,
        annexId === ANNEX && this[actorKey] && !this.hubNpcLeaseOwnerV163?.(ID) ? this[stateKey]?.doorProgress || 0 : 0);
    }

    npcAnnexDoorReservedV159(annexId) {
      const s = this[stateKey];
      const actor = this[actorKey];
      return Boolean(super.npcAnnexDoorReservedV159?.(annexId)
        || annexId === ANNEX && s && actor && !this.hubNpcLeaseOwnerV163?.(ID) && (crossing(s) || s.doorProgress > 0 || inDoorway(actor)));
    }

    drawSheetCell(ctx, image, ...args) {
      const actor = this[actorKey];
      const clip = actor && !this.hubNpcLeaseOwnerV163?.(ID) && this.npcImageCrewIds?.get(image) === ID && this.npcs?.includes(actor)
        && npcAnnexOcclusionV161(this[stateKey]);
      if (!clip) return super.drawSheetCell(ctx, image, ...args);
      // V52 adds the optional uniform marking AFTER the body renderer. Keep
      // that entire native draw (including its fallback) behind the same leaf.
      ctx.save(); ctx.beginPath(); ctx.rect(clip.x, clip.y, clip.w, clip.h); ctx.clip();
      try { return super.drawSheetCell(ctx, image, ...args); } finally { ctx.restore(); }
    }

    drawNpcLifeV136(ctx, image, actor, sample, geometry) {
      const clip = actor === this[actorKey] && !this.hubNpcLeaseOwnerV163?.(ID) && npcAnnexOcclusionV161(this[stateKey]);
      if (!clip) return super.drawNpcLifeV136(ctx, image, actor, sample, geometry);
      ctx.save(); ctx.beginPath(); ctx.rect(clip.x, clip.y, clip.w, clip.h); ctx.clip();
      super.drawNpcLifeV136(ctx, image, actor, sample, geometry) || drawHumanAtlasV133(ctx, image, geometry);
      ctx.restore(); return true;
    }

    drawDepthContactShadowV116(ctx, actor, supportY) {
      const clip = actor === this[actorKey] && !this.hubNpcLeaseOwnerV163?.(ID) && npcAnnexOcclusionV161(this[stateKey]);
      if (!clip) return super.drawDepthContactShadowV116(ctx, actor, supportY);
      ctx.save(); ctx.beginPath(); ctx.rect(clip.x, clip.y, clip.w, clip.h); ctx.clip();
      const result = super.drawDepthContactShadowV116(ctx, actor, supportY); ctx.restore(); return result;
    }

    update(delta) {
      this[syncDoorsKey]();
      const doorProgressBefore = corridor ? new Map((this[doorsKey] || []).map(door => [door.id, door.progress])) : null;
      const before = this[actorKey], wasRunning = this.running;
      const clocks = before && Object.fromEntries(['workClock', 'supportClock', 'alertClock'].map(k => [k, finite(before[k]) ? before[k] : 0]));
      const result = super.update(delta);
      if (this.hubNpcLeaseOwnerV163?.(ID)) return result;
      if (!wasRunning || !this.running || this[sandboxKey] || !finite(delta) || delta <= 0) return result;
      const actor = this[actorKey], previous = this[stateKey];
      if (!actor || !previous) return result;
      const resolution = this.npcRoutineResolutionsV62?.get(ID);
      if (this[shouldHandoffKey](resolution)) {
        this[handoffMethodKey](resolution);
        // Publishing a cohort must visit every composed owner (including
        // outer Leila), unlike the super calls used only to sample templates.
        // A transient downed/dead body may still have a healthy timetable:
        // do not immediately re-admit this released owner during that rebuild.
        const rebuilding = this[handoffRebuildKey]; this[handoffRebuildKey] = true;
        try { this.npcs = this.createNpcs(this.state.deck); }
        finally { this[handoffRebuildKey] = rebuilding; }
        return result;
      }
      const dt = Math.min(delta, .1);
      this[syncDoorsKey]();
      // Native floor updates and the inner ECHO route may already own these
      // same leaves. Only advance an unchanged leaf when no inherited update
      // has moved it; restore a saved threshold without adding another clock.
      for (const door of this[doorsKey] || []) {
        if (door.progress === doorProgressBefore?.get(door.id)) {
          const target = this.hubNpcBulkheadDemandV158(door) ? 1 : 0;
          door.progress += (target - door.progress) * Math.min(1, dt * (this.reducedMotion ? 14 : 7));
        }
        if (this.hubTrainingV132?.lockedDoorIds?.includes(door.id))
          door.progress = overlap(actor, getHubBulkheadColliderV134(door)) ? Math.max(.82, door.progress) : 0;
      }
      if (actor === before) for (const [key, value] of Object.entries(clocks))
        actor[key] = finite(actor[key]) && actor[key] > value ? actor[key] : Math.max(0, value - dt);
      const cohort = this.ensureAnnexNpcCohortV141();
      const physicalPeers = SCHEMA >= 163 && this.getNpcServicePeersV163 ? this.getNpcServicePeersV163(DECK, ID)
        : this.state?.deck === DECK ? this.npcs || [] : this[peersKey] || [];
      const peers = [...physicalPeers, ...cohort];
      const local = this.currentAnnexV71?.();
      const player = !this.ventActorV62 && this.player && { ...this.player, roomId: local?.id || (this.state?.deck === DECK ? this.state.roomId : null) };
      const passingDuty = this.getNpcServicePassingDutyV165?.(definition.id, actor);
      const duty = typeof passingDuty === 'boolean' ? passingDuty
        : annexNpcDutiesV141(this.npcRoutineResolutionsV62, this).some(d => d.crewId === ID && d.roomId === ANNEX);
      const portalBusy = this.annexTransitionV71?.annexId === ANNEX || this.hubDoorClosingV142?.annexId === ANNEX
        || this.hubTrainingV132?.lockedDoorIds?.some(id => [ANNEX, descriptor.connectionId, descriptor.id].includes(id));
      const heldAtPost = previous.stage === 'service' && previous.roomId === ANNEX && previous.doorProgress === 0
        && !resolution?.alert && !resolution?.needsCare && !resolution?.missionAssigned
        && actor.workClock <= 0 && actor.supportClock <= 0
        && this.shouldHoldNpcServiceOwnerV165?.(definition.id, actor, previous) === true;
      const next = heldAtPost ? { ...previous, time: Math.min(1e9, previous.time + dt),
        velocity: 0, actualVelocity: 0, reason: 'occupied' }
        : advanceNpcAnnexCirculationV161(previous, actor, dt, { resolution,
        duty, peers, player, portalBusy, doors: this[doorsKey] || [], alternateAssignment: Boolean(alternateDuty(this)),
        yieldGoalX: this.getNpcServiceOwnerYieldGoalV165?.(definition.id, actor),
        reducedMotion: this.reducedMotion });
      if (corridor) next.bulkheadProgress = Object.fromEntries((this[doorsKey] || []).map(door => [door.id, door.progress]));
      const changedRoom = next.roomId !== actor.roomId;
      Object.assign(actor, { x: next.x, y: next.y, roomId: next.roomId, facing: next.facing, vx: next.actualVelocity || 0 });
      this[stateKey] = next; this[refreshKey]();
      if (changedRoom) this.npcs = [...(this.npcs || []).filter(n => n.crewId !== ID),
        ...(this.state?.deck === DECK && inMainChart(actor.roomId) ? [actor] : [])];
      if (next.stage === 'service' && next.reason === 'daily-schedule') {
        const life = advanceNpcLifeV136(actor.lifeV136, actor, dt, { room: actor.roomId === ANNEX ? annex : mainRooms.find(room => room.id === actor.roomId),
          peers, context: `annex-circulation-v161:${actor.roomId}`, colliders: actor.roomId === ANNEX ? annex.colliders : buildHubObstacleGeometryV87(DECK),
          reducedMotion: this.reducedMotion });
        if (life) actor.lifeV136 = life;
      } else actor.lifeV136 = { schema: 136, context: 'annex-circulation-v161', x: actor.x, y: actor.y,
        time: next.time, velocity: next.velocity, actualVelocity: actor.vx, facing: actor.facing,
        mode: Math.abs(actor.vx) > .1 ? 'moving' : next.reason !== 'daily-schedule' ? 'alert' : next.blocked ? 'blocked' : 'idle',
        passive: null, previousPassive: null, blend: 1 };
      // Every camera/deck/duct shares the same physical animation owner. The
      // covered chart change is explicitly not spent as a giant walking step.
      const visible = actor.roomId === ANNEX ? this.currentAnnexV71?.()?.id === ANNEX
        : this.state?.deck === DECK && !this.isAnnexActiveV71?.() && !this.ventActorV62;
      if (!visible) this.sampleNpcAnimation?.(actor, { emit: false, discardEvents: true });
      return result;
    }

    persist() {
      const original = this.onPersist; let patch;
      this.onPersist = value => { patch = value; };
      try { super.persist(); } finally { this.onPersist = original; }
      if (patch) original({ ...patch, [STATE_FIELD]: { schema: SCHEMA, routes: {
        ...patch[STATE_FIELD]?.routes, [definition.id]: normalizeNpcAnnexCirculationV161({ schema: SCHEMA,
          actor: this[stateKey], nativeHandoff: this[handoffKey] }) } } });
    }

    /** Read actual intent without sampling a native timetable body. */
    getNpcServiceTrafficIntentsV163() {
      const inherited = super.getNpcServiceTrafficIntentsV163?.() || [];
      const actor = this[actorKey], s = this[stateKey];
      if (SCHEMA < 163 || this.hubNpcLeaseOwnerV163?.(ID) || !actor || !s || !inMainChart(actor.roomId) || crossing(s)
        || s.stage !== 'walking' || s.reason !== 'daily-schedule') return inherited;
      const goalX = s.targetRoomId === ANNEX ? socketX(PARENT) : corridor ? s.targetPostX : s.homeX;
      return [...inherited, { routeId: definition.id, actor, deck: DECK, goalX,
        roomIds: [...mainIds], minX: mainLeft + 24, maxX: mainRight - 68,
        doorIds: [...mainDoorIds] }];
    }

    getNpcServiceActorV161(routeId) {
      return routeId === definition.id ? this[actorKey] : super.getNpcServiceActorV161?.(routeId) || null;
    }

    /** A small validated read for physical owner arbitration. No sampling,
     * mutable state reference or lifecycle rebuild is exposed. */
    getNpcServicePhysicalStateV165(routeId) {
      return routeId === definition.id
        ? normalizeNpcAnnexCirculationV161({ schema: SCHEMA, actor: this[stateKey] }).actor
        : super.getNpcServicePhysicalStateV165?.(routeId) || null;
    }

    returnNpcPhysicalLeaseV163(crewId) {
      if (crewId !== ID) return super.returnNpcPhysicalLeaseV163?.(crewId);
      const actor = this[actorKey], state = this[stateKey];
      if (actor && state) this[stateKey] = { ...state, x: actor.x, y: actor.y, velocity: 0, facing: actor.facing };
      this[refreshKey]();
    }

    delegateNpcPhysicalLeaseV163(crewId) {
      if (crewId !== ID) return super.delegateNpcPhysicalLeaseV163?.(crewId);
      this[actorKey] = null; this[stateKey] = null; this[handoffKey] = null;
    }

    getSnapshot() {
      const snapshot = super.getSnapshot();
      const leased = this.hubNpcLeaseOwnerV163?.(ID);
      return { ...snapshot, [STATE_FIELD]: { schema: SCHEMA, routes: {
        ...snapshot[STATE_FIELD]?.routes, [definition.id]: {
        ...normalizeNpcAnnexCirculationV161({ schema: SCHEMA, actor: this[stateKey], nativeHandoff: this[handoffKey] }),
        ...(leased ? { actor: null, leasedToV163: leased,
          leaseOriginBookmarkV163: normalizeNpcAnnexCirculationV161({ schema: SCHEMA, actor: this[stateKey] }).actor } : {}),
        actualVelocity: this[actorKey]?.vx || 0, reserved: this.npcAnnexDoorReservedV159(ANNEX),
        occlusion: npcAnnexOcclusionV161(this[stateKey]),
        initialCondition: this[stateKey]?.admittedRoomId || null,
        preLoadTravelObserved: false, scope: 'one-native-parent-annex-route',
        sourceFace: clone(parentFace), annexFace: clone(localFace),
        presentation: [...mainRooms, annex].map(room => ({ roomId: room.id, mode: getHubRoomPresentationV119(room).presentationMode,
          projection: getHubRoomPresentationV119(room).projectionV139.projection, mixedProjectionAllowed: false })),
        ...(corridor ? { homeRoomId: HOME, mainRoomIds: [...mainIds], mainDoors: (this[doorsKey] || []).map(door => ({
          id: door.id, x: door.x, progress: door.progress, demandedBy: this.hubNpcBulkheadDemandV158(door) ? ID : null })) } : {}) } } } };
    }
  };
}

return Object.freeze({ definition: HUB_NPC_ANNEX_CIRCULATION_V161, normalize: normalizeNpcAnnexCirculationV161,
  create: createNpcAnnexCirculationStateV161, advance: advanceNpcAnnexCirculationV161,
  passage: npcAnnexDoorPassageV161, occlusion: npcAnnexOcclusionV161,
  faces: Object.freeze({ parent: parentFace, local: localFace }), mainRooms: Object.freeze([...mainRooms]),
  trafficIntent: (state, actor) => !actor || !state || !inMainChart(actor.roomId) || state.stage !== 'walking'
    || state.reason !== 'daily-schedule' ? null : { routeId: definition.id, actor, deck: DECK,
      goalX: state.targetRoomId === ANNEX ? socketX(PARENT) : corridor ? state.targetPostX : state.homeX,
      roomIds: [...mainIds], minX: mainLeft + 24, maxX: mainRight - 68, doorIds: [...mainDoorIds] },
  withHub: withHubNpcAnnexCirculationV161 });
}

export const HUB_NPC_SERVICE_ROUTE_DEFINITIONS_V161 = Object.freeze([
  Object.freeze({ id: 'idris-engine', crewId: 'crew-03-idris-kwan', deck: 3, parentRoomId: 'reactor',
    annexRoomId: 'engine-room', targetX: 1500, duty: 'mechanical-inspection' }),
  Object.freeze({ id: 'leila-galley', crewId: 'crew-15-leila-s-rensen', deck: 1, parentRoomId: 'mess',
    annexRoomId: 'galley-service', targetX: 420, duty: 'ration-and-galley-review' })
]);
export const HUB_NPC_SERVICE_ROUTES_V161 = Object.freeze(HUB_NPC_SERVICE_ROUTE_DEFINITIONS_V161.map(definition => createServiceRouteV161(definition)));

/** Separate bounded native route saves; no cloud state, campaign clock, reward
 * or unobserved lift route is synthesized. Unknown routes never migrate. */
export function normalizeNpcServiceRoutesV161(value) {
  return { schema: 161, routes: Object.fromEntries(HUB_NPC_SERVICE_ROUTES_V161.map(route =>
    [route.definition.id, route.normalize(value?.schema === 161 ? value.routes?.[route.definition.id] : null)])) };
}
export function withHubNpcServiceRoutesV161(Base) {
  return HUB_NPC_SERVICE_ROUTES_V161.reduce((Hub, route) => route.withHub(Hub), Base);
}
