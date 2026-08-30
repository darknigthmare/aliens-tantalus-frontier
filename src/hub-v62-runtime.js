import {
  HUB_DECKS,
  HUB_MODULAR_ASSETS,
  HUB_MODULAR_PROP_FILES,
  HUB_NPC_INTERACTION_KINDS,
  HUB_NPC_MISSION_SPRITE_FILES,
  HUB_NPC_ROSTER,
  HUB_NPC_SPRITE_FILES,
  HUB_ROOM_COUNT,
  HUB_WORLD,
  HubGame as HubGameV52,
  buildHubNpcInteractionEvent,
  compileShipProject
} from './hub-v52-runtime.js';
import { buildHubDoorNetworkV58 } from './topology-coherence-v58.js';
import {
  NPC_IDENTITIES_V62,
  normalizeNpcRoutineStateV62,
  persistNpcRoutineResolutionV62,
  resolveNpcRoutineV62,
  sampleNpcPhysicalRouteV62
} from './npc-dialogue-v62.js';
import {
  HUB_VENT_NETWORK_V62,
  VENT_TRANSIT_PHASES_V62,
  advanceVentTransitionV62,
  createVentContactOutputV62 as buildVentContactOutputV62,
  enterVentNetworkV62,
  exitVentNetworkV62,
  getVentBranchesV62,
  getVentExitsAtActorV62,
  getVentTransitPositionV62,
  moveVentTransitV62,
  planAllyVentTraversalV62 as buildAllyVentPlanV62,
  planEnemyVentTraversalV62 as buildEnemyVentPlanV62,
  selectVentBranchV62,
  selectVentExitV62
} from './vent-network-v62.js';

export {
  HUB_DECKS,
  HUB_MODULAR_ASSETS,
  HUB_MODULAR_PROP_FILES,
  HUB_NPC_INTERACTION_KINDS,
  HUB_NPC_MISSION_SPRITE_FILES,
  HUB_NPC_ROSTER,
  HUB_NPC_SPRITE_FILES,
  HUB_ROOM_COUNT,
  HUB_WORLD,
  HUB_VENT_NETWORK_V62,
  NPC_IDENTITIES_V62,
  buildHubNpcInteractionEvent,
  compileShipProject
};

export const HUB_VENT_RUNTIME_SCHEMA_V62 = 62;
export const HUB_VENT_INTERIOR_ASSET_V62 = '/assets/openai/hub/vents/tantalus-duct-interior-v62.png';
export const HUB_VENT_DIRECTIONS_V62 = Object.freeze(['left', 'right', 'up', 'down', 'depth']);

const PLAYER_ACTOR_ID = 'hub-player-v62';
const CRAWL_SPEED = 640;
const TRANSITION_EPSILON = 1e-6;

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, Number(value) || 0));
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const imageReady = (image) => Boolean(image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0);

function stableOffset(value, maximum) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % Math.max(1, maximum);
}

function createImage(source) {
  const image = new Image();
  image.decoding = 'async';
  image.src = source;
  return image;
}

function resolveNpcWaypointAnchorV62(waypoint, { deckIndex, doorStates, crewId, actorWidth = 44, phase = 'route' } = {}) {
  if (!waypoint || Number(waypoint.deck) !== Number(deckIndex)) return null;
  const deck = HUB_DECKS[deckIndex];
  const room = deck?.rooms.find((entry) => entry.id === waypoint.roomId);
  if (!room) return null;
  const halfWidth = actorWidth / 2;
  let centerX = room.xStart + 280 + stableOffset(`${crewId}:${phase}:${room.id}`, 520) + halfWidth;
  if (waypoint.kind === 'corridor') {
    centerX = room.xStart + HUB_WORLD.roomWidth / 2 + stableOffset(`${crewId}:${waypoint.id}`, 120) - 60;
  } else if (waypoint.kind === 'door') {
    const door = doorStates.find((entry) => !entry.lift && entry.id.endsWith(`:${waypoint.doorId}`));
    if (door) {
      const direction = Math.sign(Number(waypoint.direction)) || 1;
      const sideOffset = (waypoint.side === 'crossed' ? direction : -direction) * (halfWidth + 10);
      centerX = door.x + sideOffset;
    }
  } else if (waypoint.kind.startsWith('lift-')) {
    const lift = doorStates.find((entry) => entry.lift && entry.shaftId === waypoint.shaftId);
    if (lift) centerX = lift.x;
  }
  return {
    kind: waypoint.kind,
    waypointId: waypoint.id,
    deck: deckIndex,
    room,
    roomId: room.id,
    x: clamp(centerX - halfWidth, 40, HUB_WORLD.width - actorWidth - 40)
  };
}

function nodeById(nodeId) {
  return HUB_VENT_NETWORK_V62.nodes.find((entry) => entry.id === nodeId) || null;
}

function edgeById(edgeId) {
  return HUB_VENT_NETWORK_V62.edges.find((entry) => entry.id === edgeId) || null;
}

function portalById(entries, portalId) {
  return entries.find((entry) => entry.id === portalId) || null;
}

function branchVector(branch) {
  const from = nodeById(branch?.fromNodeId)?.position;
  const to = nodeById(branch?.toNodeId)?.position;
  if (!from || !to) return null;
  return {
    x: Number(to.x) - Number(from.x),
    y: Number(to.y) - Number(from.y),
    depth: Number(to.depth) - Number(from.depth)
  };
}

function directionScore(direction, vector) {
  if (!vector || !HUB_VENT_DIRECTIONS_V62.includes(direction)) return -Infinity;
  const { x, y, depth } = vector;
  const horizontalDominant = Math.abs(x) >= Math.abs(y) && Math.abs(x) >= Math.abs(depth);
  const verticalDominant = Math.abs(y) > Math.abs(x) && Math.abs(y) >= Math.abs(depth);
  const depthDominant = Math.abs(depth) > Math.abs(x) && Math.abs(depth) > Math.abs(y);
  if (direction === 'left' && horizontalDominant && x < 0) return Math.abs(x);
  if (direction === 'right' && horizontalDominant && x > 0) return Math.abs(x);
  if (direction === 'up' && verticalDominant && y < 0) return Math.abs(y);
  if (direction === 'down' && verticalDominant && y > 0) return Math.abs(y);
  if (direction === 'depth' && depthDominant && depth !== 0) return Math.abs(depth);
  return -Infinity;
}

export function chooseHubVentBranchV62(actor, direction) {
  if (!actor?.ventTransit || actor.ventTransit.phase !== 'at-node' || !HUB_VENT_DIRECTIONS_V62.includes(direction)) return null;
  return getVentBranchesV62(HUB_VENT_NETWORK_V62, actor)
    .map((branch) => ({ branch, score: directionScore(direction, branchVector(branch)) }))
    .filter((entry) => Number.isFinite(entry.score))
    .sort((left, right) => right.score - left.score
      || left.branch.edgeId.localeCompare(right.branch.edgeId)
      || left.branch.toNodeId.localeCompare(right.branch.toNodeId))[0]?.branch || null;
}

function transitReferencesAreValid(transit) {
  if (!transit || transit.schema !== HUB_VENT_RUNTIME_SCHEMA_V62 || transit.networkId !== HUB_VENT_NETWORK_V62.id) return false;
  if (!VENT_TRANSIT_PHASES_V62.includes(transit.phase)) return false;
  if (transit.entryId && !portalById(HUB_VENT_NETWORK_V62.entrances, transit.entryId)) return false;
  if (transit.selectedExitId && !portalById(HUB_VENT_NETWORK_V62.exits, transit.selectedExitId)) return false;
  for (const id of [transit.entryNodeId, transit.currentNodeId, transit.fromNodeId, transit.toNodeId].filter(Boolean)) {
    if (!nodeById(id)) return false;
  }
  return !transit.edgeId || Boolean(edgeById(transit.edgeId));
}

export function normalizeHubVentStateV62(rawState) {
  if (!rawState || typeof rawState !== 'object') return null;
  const actorSource = rawState.actor || rawState;
  const transit = actorSource.ventTransit || rawState.ventTransit || (rawState.phase ? rawState : null);
  if (!transitReferencesAreValid(transit)) return null;
  const position = actorSource.position && Number.isFinite(Number(actorSource.position.x)) && Number.isFinite(Number(actorSource.position.y))
    ? {
        x: Number(actorSource.position.x),
        y: Number(actorSource.position.y),
        depth: Number(actorSource.position.depth) || 0
      }
    : clone(getVentTransitPositionV62(HUB_VENT_NETWORK_V62, transit));
  const entryContext = rawState.entryContext && typeof rawState.entryContext === 'object'
    ? {
        deck: clamp(rawState.entryContext.deck, 0, HUB_DECKS.length - 1),
        roomId: String(rawState.entryContext.roomId || ''),
        positionX: Number(rawState.entryContext.positionX) || 0
      }
    : null;
  return {
    schema: HUB_VENT_RUNTIME_SCHEMA_V62,
    networkId: HUB_VENT_NETWORK_V62.id,
    actor: {
      id: String(actorSource.id || PLAYER_ACTOR_ID),
      ventActorKind: 'player',
      position,
      ventTransit: clone(transit)
    },
    entryContext
  };
}

function directionFromKeys(keys) {
  if (keys.has('KeyD') || keys.has('ArrowRight')) return 'right';
  if (keys.has('KeyA') || keys.has('ArrowLeft')) return 'left';
  if (keys.has('KeyW') || keys.has('ArrowUp')) return 'up';
  if (keys.has('KeyS') || keys.has('ArrowDown')) return 'down';
  if (keys.has('KeyQ')) return 'depth';
  return null;
}

function directionForTransit(transit) {
  if (!transit || transit.phase !== 'moving') return null;
  return HUB_VENT_DIRECTIONS_V62.find((direction) => Number.isFinite(directionScore(direction, branchVector({
    fromNodeId: transit.fromNodeId,
    toNodeId: transit.toNodeId
  })))) || null;
}

export class HubGame extends HubGameV52 {
  constructor(canvas, options = {}) {
    super(canvas, options);
    this.ventInteriorImageV62 = createImage(HUB_VENT_INTERIOR_ASSET_V62);
    this.ventActorV62 = null;
    this.ventEntryContextV62 = null;
    this.ventMoveDirectionV62 = null;
    this.ventContactKeyV62 = '';
    this.npcRoutineStateV62 = normalizeNpcRoutineStateV62();
    this.npcRoutineResolutionsV62 = new Map();
    this.npcRoutineContextV62 = {};
    this.npcRoutineHubStateV62 = {};
  }

  start(hubState = {}, options = {}) {
    this.ventActorV62 = null;
    this.ventEntryContextV62 = null;
    this.ventMoveDirectionV62 = null;
    this.ventContactKeyV62 = '';
    this.initializeNpcRoutinesV62(hubState, options.routineContextV62 || {});
    super.start(hubState, options);
    const routineAlert = [...this.npcRoutineResolutionsV62.values()].some((resolution) => resolution.alert);
    this.setNpcCrisisAlert(Boolean(this.crisis?.active || routineAlert));
    const restored = normalizeHubVentStateV62(hubState.ventTransitV62);
    if (!restored || this.editorPlaytest) {
      this.draw();
      return;
    }
    this.ventActorV62 = restored.actor;
    this.ventEntryContextV62 = restored.entryContext || {
      deck: this.state.deck,
      roomId: this.state.roomId,
      positionX: this.player.x
    };
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.crouching = true;
    this.player.climbing = false;
    this.statusKey = '';
    this.emitStatus();
    this.draw();
  }

  initializeNpcRoutinesV62(hubState = {}, routineContext = {}) {
    this.npcRoutineContextV62 = clone(routineContext) || {};
    let localHub = {
      ...clone(hubState),
      npcRoutineState: normalizeNpcRoutineStateV62(hubState.npcRoutineState)
    };
    const resolutions = new Map();
    for (const identity of NPC_IDENTITIES_V62) {
      const resolution = resolveNpcRoutineV62(identity.crewId, {
        ...this.npcRoutineContextV62,
        hub: localHub,
        clock: this.npcRoutineContextV62.clock || hubState.clock,
        crisis: this.npcRoutineContextV62.crisis || hubState.activeCrisis,
        infestation: this.npcRoutineContextV62.infestation || hubState.infestationChain
      });
      if (!resolution) continue;
      resolutions.set(identity.crewId, resolution);
      const persisted = persistNpcRoutineResolutionV62(localHub, resolution);
      localHub = persisted.hub;
    }
    this.npcRoutineResolutionsV62 = resolutions;
    this.npcRoutineStateV62 = normalizeNpcRoutineStateV62(localHub.npcRoutineState);
    this.npcRoutineHubStateV62 = localHub;
    return resolutions;
  }

  setNpcRoutineContextV62(routineContext = {}, { persist = true, rebuild = true } = {}) {
    const hubState = {
      ...this.npcRoutineHubStateV62,
      activeCrisis: routineContext.crisis ?? this.state?.activeCrisis ?? this.npcRoutineHubStateV62.activeCrisis,
      infestationChain: routineContext.infestation ?? this.npcRoutineHubStateV62.infestationChain,
      npcRoutineState: this.npcRoutineStateV62
    };
    this.initializeNpcRoutinesV62(hubState, { ...this.npcRoutineContextV62, ...routineContext });
    if (rebuild && this.state) {
      this.npcs = this.createNpcs(this.state.deck);
      const routineAlert = [...this.npcRoutineResolutionsV62.values()].some((resolution) => resolution.alert);
      this.setNpcCrisisAlert?.(Boolean(this.crisis?.active || routineAlert));
    }
    if (persist && this.state && this.player) this.persist();
    return this.getNpcRoutineResolutionsV62();
  }

  getNpcRoutineResolutionsV62() {
    return clone([...this.npcRoutineResolutionsV62.values()]);
  }

  createNpcs(deckIndex) {
    if (!this.npcRoutineResolutionsV62?.size) return super.createNpcs(deckIndex);
    const templates = new Map(HUB_DECKS.flatMap((_, index) => super.createNpcs(index)).map((npc) => [npc.crewId, npc]));
    return [...this.npcRoutineResolutionsV62.values()]
      .filter((resolution) => resolution.deck === deckIndex)
      .sort((left, right) => left.roomId.localeCompare(right.roomId) || left.crewId.localeCompare(right.crewId))
      .map((resolution) => {
        const source = templates.get(resolution.crewId);
        const routePhase = resolution.phase === 'route';
        const progress = clamp(resolution.routeProgress, 0, 1);
        const routeSample = routePhase ? (resolution.routeSample || sampleNpcPhysicalRouteV62(resolution.route, progress)) : null;
        const activeAnchor = routeSample ? resolveNpcWaypointAnchorV62(
          routeSample.segmentProgress < 0.5 ? routeSample.fromWaypoint : routeSample.toWaypoint,
          { deckIndex, doorStates: this.doorStates, crewId: resolution.crewId, actorWidth: source.w, phase: resolution.phase }
        ) : null;
        const fromAnchor = routeSample ? resolveNpcWaypointAnchorV62(routeSample.fromWaypoint, {
          deckIndex,
          doorStates: this.doorStates,
          crewId: resolution.crewId,
          actorWidth: source.w,
          phase: resolution.phase
        }) : null;
        const toAnchor = routeSample ? resolveNpcWaypointAnchorV62(routeSample.toWaypoint, {
          deckIndex,
          doorStates: this.doorStates,
          crewId: resolution.crewId,
          actorWidth: source.w,
          phase: resolution.phase
        }) : null;
        const roomId = activeAnchor?.roomId || resolution.roomId;
        const room = HUB_DECKS[deckIndex].rooms.find((entry) => entry.id === roomId) || HUB_DECKS[deckIndex].rooms[0];
        const roomOffset = 280 + stableOffset(`${resolution.crewId}:${resolution.phase}`, 520);
        const interpolatedX = fromAnchor && toAnchor
          ? fromAnchor.x + (toAnchor.x - fromAnchor.x) * routeSample.segmentProgress
          : activeAnchor?.x;
        const x = clamp(routePhase && Number.isFinite(interpolatedX) ? interpolatedX : room.xStart + roomOffset, room.xStart + 40, room.xEnd - source.w - 40);
        const direction = routePhase && fromAnchor && toAnchor ? Math.sign(toAnchor.x - fromAnchor.x) : 0;
        const mobile = routePhase && direction !== 0 && Math.abs(toAnchor.x - fromAnchor.x) > 8;
        const segmentMinimum = mobile ? Math.min(fromAnchor.x, toAnchor.x) : x;
        const segmentMaximum = mobile ? Math.max(fromAnchor.x, toAnchor.x) : x;
        return {
          ...source,
          roomId: room.id,
          x,
          y: HUB_WORLD.floorY - source.h,
          min: clamp(segmentMinimum, 40, HUB_WORLD.width - source.w - 40),
          max: clamp(segmentMaximum, 40, HUB_WORLD.width - source.w - 40),
          vx: mobile ? direction * Math.max(18, Math.abs(source.patrolSpeed || 22)) : 0,
          resumeVx: mobile ? direction * Math.max(18, Math.abs(source.patrolSpeed || 22)) : 0,
          mobile,
          alerted: Boolean(resolution.alert),
          routinePhaseV62: resolution.phase,
          routineReasonV62: resolution.reason,
          routineRouteV62: clone(resolution.route),
          routineRouteProgressV62: progress,
          routineWaypointV62: routeSample ? clone({
            waypointId: routeSample.waypointId,
            kind: routeSample.kind,
            segmentIndex: routeSample.segmentIndex,
            segmentProgress: routeSample.segmentProgress,
            fromWaypointId: routeSample.fromWaypoint.id,
            toWaypointId: routeSample.toWaypoint.id
          }) : null,
          routineDeterministicKeyV62: resolution.deterministicKey
        };
      });
  }

  isVentActiveV62() {
    return Boolean(this.ventActorV62?.ventTransit);
  }

  serializeVentStateV62() {
    if (!this.isVentActiveV62()) return null;
    return clone({
      schema: HUB_VENT_RUNTIME_SCHEMA_V62,
      networkId: HUB_VENT_NETWORK_V62.id,
      actor: this.ventActorV62,
      entryContext: this.ventEntryContextV62
    });
  }

  enterVentAtCurrentRoomV62() {
    if (!this.running || !this.player?.alive || this.editorPlaytest || this.isVentActiveV62()) return null;
    const hatch = this.nearestVent();
    if (!hatch) return null;
    const roomId = hatch.roomId || this.currentRoom().id;
    const entrance = portalById(HUB_VENT_NETWORK_V62.entrances, `hub-${roomId}-entrance`);
    if (!entrance) return null;
    const actor = {
      id: PLAYER_ACTOR_ID,
      ventActorKind: 'player',
      position: clone(entrance.worldPosition)
    };
    this.ventEntryContextV62 = {
      deck: this.state.deck,
      roomId,
      positionX: this.player.x
    };
    this.ventActorV62 = enterVentNetworkV62(HUB_VENT_NETWORK_V62, actor, entrance.id, { maximumDistance: 1 });
    this.ventMoveDirectionV62 = null;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.crouching = true;
    this.player.climbing = false;
    this.audio?.ui?.();
    this.onAction({
      type: 'hub:vent-transition',
      action: 'hub:vent-enter',
      networkId: HUB_VENT_NETWORK_V62.id,
      entranceId: entrance.id,
      roomId,
      deck: this.state.deck
    });
    this.persist();
    this.statusKey = '';
    this.emitVentContactV62(true);
    this.emitStatus();
    return clone(this.ventActorV62.ventTransit);
  }

  selectVentDirectionV62(direction) {
    if (!this.isVentActiveV62() || this.ventActorV62.ventTransit.phase !== 'at-node') return null;
    const branch = chooseHubVentBranchV62(this.ventActorV62, direction);
    if (!branch) return null;
    this.ventActorV62 = selectVentBranchV62(HUB_VENT_NETWORK_V62, this.ventActorV62, branch.edgeId, branch.toNodeId);
    this.ventMoveDirectionV62 = direction;
    this.onAction({
      type: 'hub:vent-transition',
      action: 'hub:vent-segment',
      networkId: HUB_VENT_NETWORK_V62.id,
      edgeId: branch.edgeId,
      fromNodeId: branch.fromNodeId,
      toNodeId: branch.toNodeId,
      direction
    });
    this.persist();
    this.emitVentContactV62(true);
    return clone(branch);
  }

  beginVentExitV62(exitId = null) {
    if (!this.isVentActiveV62() || this.ventActorV62.ventTransit.phase !== 'at-node') return null;
    const exits = getVentExitsAtActorV62(HUB_VENT_NETWORK_V62, this.ventActorV62);
    const selected = exits.find((entry) => entry.id === exitId) || (!exitId ? exits[0] : null);
    if (!selected) return null;
    this.ventActorV62 = selectVentExitV62(HUB_VENT_NETWORK_V62, this.ventActorV62, selected.id);
    this.ventActorV62 = exitVentNetworkV62(HUB_VENT_NETWORK_V62, this.ventActorV62);
    this.ventMoveDirectionV62 = null;
    this.audio?.ui?.();
    this.onAction({
      type: 'hub:vent-transition',
      action: 'hub:vent-exit-start',
      networkId: HUB_VENT_NETWORK_V62.id,
      exitId: selected.id,
      nodeId: selected.nodeId
    });
    this.persist();
    this.emitVentContactV62(true);
    return clone(this.ventActorV62.ventTransit);
  }

  interact() {
    if (!this.running) return;
    if (this.isVentActiveV62()) {
      if (this.ventActorV62.ventTransit.phase === 'at-node') this.beginVentExitV62();
      return;
    }
    if (!this.editorPlaytest && this.nearestVent()) {
      this.enterVentAtCurrentRoomV62();
      return;
    }
    super.interact();
  }

  useLift(direction, wrap = false) {
    if (this.isVentActiveV62()) return false;
    super.useLift(direction, wrap);
    return true;
  }

  fire() {
    if (this.isVentActiveV62()) return false;
    super.fire();
    return true;
  }

  setControl(control, active) {
    if (control === 'depth') {
      active ? this.keys.add('KeyQ') : this.keys.delete('KeyQ');
      return;
    }
    if (this.isVentActiveV62() && control === 'fire') return;
    super.setControl(control, active);
  }

  update(delta) {
    if (!this.isVentActiveV62()) {
      super.update(delta);
      return;
    }
    const elapsed = clamp(delta, 0, 0.25);
    const heldKeys = this.keys;
    const playerPose = {
      x: this.player.x,
      y: this.player.y,
      vx: this.player.vx,
      vy: this.player.vy,
      grounded: this.player.grounded,
      crouching: this.player.crouching,
      climbing: this.player.climbing,
      facing: this.player.facing,
      invulnerability: this.player.invulnerability
    };
    this.keys = new Set();
    this.player.invulnerability = Number.POSITIVE_INFINITY;
    try {
      // Keep every inherited clock, NPC routine, projectile and crisis enemy
      // alive while the controlled marine is physically concealed in the duct.
      super.update(elapsed);
    } finally {
      this.keys = heldKeys;
      Object.assign(this.player, playerPose, { vx: 0, vy: 0, crouching: true, climbing: false });
      this.state.positionX = Math.round(playerPose.x);
    }
    this.updateVentTransitV62(elapsed);
    this.statusKey = '';
    this.emitStatus();
  }

  updateVentTransitV62(delta) {
    if (!this.isVentActiveV62()) return;
    let transit = this.ventActorV62.ventTransit;
    const phaseBefore = transit.phase;
    const nodeBefore = transit.currentNodeId;
    const exitId = transit.selectedExitId;

    if (transit.phase === 'entering' || transit.phase === 'exiting') {
      this.ventActorV62 = advanceVentTransitionV62(HUB_VENT_NETWORK_V62, this.ventActorV62, delta * 1000);
      if (!this.ventActorV62.ventTransit) {
        this.completeVentExitV62(exitId);
        return;
      }
      transit = this.ventActorV62.ventTransit;
    }

    if (transit.phase === 'at-node') {
      const direction = directionFromKeys(this.keys);
      if (direction) this.selectVentDirectionV62(direction);
      transit = this.ventActorV62.ventTransit;
    }

    if (transit.phase === 'moving') {
      const expectedDirection = this.ventMoveDirectionV62 || directionForTransit(transit);
      const heldDirection = directionFromKeys(this.keys);
      if (heldDirection === expectedDirection) {
        this.ventActorV62 = moveVentTransitV62(HUB_VENT_NETWORK_V62, this.ventActorV62, CRAWL_SPEED * delta);
        transit = this.ventActorV62.ventTransit;
      }
    }

    const reachedNode = transit.phase === 'at-node' && (phaseBefore !== 'at-node' || transit.currentNodeId !== nodeBefore);
    if (reachedNode) {
      this.ventMoveDirectionV62 = null;
      this.onAction({
        type: 'hub:vent-transition',
        action: 'hub:vent-node',
        networkId: HUB_VENT_NETWORK_V62.id,
        nodeId: transit.currentNodeId,
        routeNodeIds: clone(transit.routeNodeIds)
      });
      this.persist();
    }
    if (transit.phase !== phaseBefore || reachedNode || Math.abs((transit.progress || 0) - 1) < TRANSITION_EPSILON) {
      this.emitVentContactV62(true);
    }
  }

  completeVentExitV62(exitId) {
    const exit = portalById(HUB_VENT_NETWORK_V62.exits, exitId);
    if (!exit) return;
    const destination = exit.destination || {};
    const deckIndex = Math.max(0, HUB_DECKS.findIndex((deck) => deck.id === destination.deckId));
    const room = HUB_DECKS[deckIndex].rooms.find((entry) => entry.id === destination.roomId) || HUB_DECKS[deckIndex].rooms[0];
    this.state.deck = deckIndex;
    this.state.roomId = room.id;
    if (!this.state.visited.includes(room.id)) this.state.visited.push(room.id);
    this.npcs = this.createNpcs(deckIndex);
    this.obstacles = this.createObstacles(deckIndex);
    this.doorStates = buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deckIndex).map((door) => ({ ...door }));
    this.configureTraversal();
    const routineAlert = [...this.npcRoutineResolutionsV62.values()].some((resolution) => resolution.alert);
    this.setNpcCrisisAlert?.(Boolean(this.crisis?.active || routineAlert));
    const hatch = this.v51Vents.find((entry) => entry.roomId === room.id) || this.v51Vents[0];
    const roomStart = room.xStart;
    const preferLeft = hatch && hatch.x - this.player.w - 18 >= roomStart + 24;
    const x = hatch
      ? (preferLeft ? hatch.x - this.player.w - 18 : hatch.x + hatch.w + 18)
      : roomStart + 180;
    const surfaces = [
      ...this.v51Platforms.filter((entry) => x + this.player.w / 2 >= entry.x && x + this.player.w / 2 <= entry.x + entry.w),
      { y: this.floorY }
    ].filter((entry) => !hatch || entry.y >= hatch.y).sort((left, right) => left.y - right.y);
    Object.assign(this.player, {
      x: clamp(x, room.xStart + 24, room.xEnd - this.player.w - 24),
      y: (surfaces[0]?.y || this.floorY) - this.player.h,
      vx: 0,
      vy: 0,
      grounded: true,
      crouching: false,
      climbing: false
    });
    this.state.positionX = Math.round(this.player.x);
    this.spawnPoint = { x: this.player.x, y: this.player.y };
    this.camera.x = clamp(this.player.x - this.canvas.width / 2, 0, HUB_WORLD.width - this.canvas.width);
    this.roomChangePulse = this.reducedMotion ? 0.35 : 1.25;
    this.ventActorV62 = null;
    this.ventEntryContextV62 = null;
    this.ventMoveDirectionV62 = null;
    this.ventContactKeyV62 = '';
    this.audio?.ui?.();
    this.onAction({
      type: 'hub:vent-transition',
      action: 'hub:vent-exit-complete',
      networkId: HUB_VENT_NETWORK_V62.id,
      exitId,
      deck: deckIndex,
      roomId: room.id,
      positionX: Math.round(this.player.x)
    });
    this.persist();
    this.statusKey = '';
    this.emitStatus();
  }

  planAllyVentTraversalV62(options = {}) {
    return buildAllyVentPlanV62({ network: HUB_VENT_NETWORK_V62, ...options });
  }

  planEnemyVentTraversalV62(options = {}) {
    return buildEnemyVentPlanV62({ network: HUB_VENT_NETWORK_V62, ...options });
  }

  createVentContactOutputV62({ actor = null, observerActor = this.ventActorV62, observerPosition = { x: this.player?.x || 0, y: this.player?.y || 0, depth: 0 }, trackerRange, hearingRadius } = {}) {
    if (!actor?.ventTransit || actor === observerActor || (actor.id && actor.id === observerActor?.id)) return null;
    return buildVentContactOutputV62({
      network: HUB_VENT_NETWORK_V62,
      actor,
      observerPosition,
      trackerRange,
      hearingRadius
    });
  }

  emitVentContactV62(force = false) {
    const output = this.createVentContactOutputV62({ actor: null });
    if (!output) return null;
    const key = JSON.stringify({
      phase: this.ventActorV62.ventTransit.phase,
      nodeId: output.tracker.nodeId,
      edgeId: output.tracker.edgeId,
      cue: output.audio.cue
    });
    if (!force && key === this.ventContactKeyV62) return output;
    this.ventContactKeyV62 = key;
    this.audio?.vent?.(output.audio);
    this.onAction({
      type: 'hub:vent-contact',
      action: 'hub:vent-contact',
      networkId: HUB_VENT_NETWORK_V62.id,
      tracker: clone(output.tracker),
      audio: clone(output.audio)
    });
    return output;
  }

  statusPrompt() {
    if (!this.isVentActiveV62()) {
      if (!this.editorPlaytest && this.nearestVent()) return 'E — OUVRIR LA TRAPPE ET ENTRER DANS LE CONDUIT';
      return super.statusPrompt();
    }
    const transit = this.ventActorV62.ventTransit;
    if (transit.phase === 'entering') return 'ENTRÉE DANS LE CONDUIT…';
    if (transit.phase === 'exiting') return 'OUVERTURE DE LA SORTIE…';
    if (transit.phase === 'moving') return 'MAINTENIR LA DIRECTION — RAMPER DANS LE CONDUIT';
    const exits = getVentExitsAtActorV62(HUB_VENT_NETWORK_V62, this.ventActorV62);
    const branches = getVentBranchesV62(HUB_VENT_NETWORK_V62, this.ventActorV62);
    const directions = HUB_VENT_DIRECTIONS_V62.filter((direction) => branches.some((branch) => Number.isFinite(directionScore(direction, branchVector(branch)))));
    return `${directions.map((direction) => direction === 'depth' ? 'Q PROFONDEUR' : direction.toUpperCase()).join(' / ')}${exits.length ? ' · E — SORTIR' : ''}`;
  }

  persist() {
    if (!this.state || !this.player) return;
    let inheritedPatch = null;
    const originalOnPersist = this.onPersist;
    this.onPersist = (patch) => { inheritedPatch = patch; };
    try {
      super.persist();
    } finally {
      this.onPersist = originalOnPersist;
    }
    originalOnPersist({
      ...(inheritedPatch || {}),
      ventTransitV62: this.serializeVentStateV62(),
      npcRoutineState: clone(this.npcRoutineStateV62)
    });
  }

  getAssetReport() {
    const report = super.getAssetReport();
    const ventInteriorArtReady = imageReady(this.ventInteriorImageV62) ? 1 : 0;
    return {
      ...report,
      ventInteriorAssetCount: 1,
      ventInteriorArtReady,
      totalReadyAssetCount: (report.totalReadyAssetCount || 0) + ventInteriorArtReady
    };
  }

  getSnapshot() {
    const snapshot = super.getSnapshot();
    const savedState = this.serializeVentStateV62();
    const contact = this.createVentContactOutputV62();
    return {
      ...snapshot,
      ventNetworkIdV62: HUB_VENT_NETWORK_V62.id,
      ventNetworkNodeCountV62: HUB_VENT_NETWORK_V62.nodes.length,
      ventNetworkEdgeCountV62: HUB_VENT_NETWORK_V62.edges.length,
      ventActiveV62: Boolean(savedState),
      ventTransitV62: savedState,
      ventPositionV62: this.isVentActiveV62() ? clone(getVentTransitPositionV62(HUB_VENT_NETWORK_V62, this.ventActorV62)) : null,
      ventTrackerV62: contact ? clone(contact.tracker) : null,
      ventAudioV62: contact ? clone(contact.audio) : null,
      ventInteriorAssetV62: HUB_VENT_INTERIOR_ASSET_V62,
      ventInteriorArtReadyV62: imageReady(this.ventInteriorImageV62),
      npcRoutineStateV62: clone(this.npcRoutineStateV62),
      npcRoutineResolutionsV62: this.getNpcRoutineResolutionsV62(),
      npcRoutineVisibleV62: (this.npcs || []).map((npc) => ({
        crewId: npc.crewId,
        deck: this.state?.deck ?? 0,
        roomId: npc.roomId,
        phase: npc.routinePhaseV62 || null,
        reason: npc.routineReasonV62 || null,
        routeProgress: npc.routineRouteProgressV62 ?? null,
        x: Math.round(npc.x),
        y: Math.round(npc.y)
      }))
    };
  }

  draw() {
    if (!this.isVentActiveV62()) {
      super.draw();
      return;
    }
    const ctx = this.ctx;
    const width = this.canvas.width || 1280;
    const height = this.canvas.height || 720;
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#010303';
    ctx.fillRect(0, 0, width, height);
    this.drawVentInteriorBitmapV62(ctx, width, height);
    this.drawVentPlayerV62(ctx, width, height);
    this.drawVentHudV62(ctx, width, height);
    ctx.restore();
  }

  drawVentInteriorBitmapV62(ctx, width, height) {
    const image = this.ventInteriorImageV62;
    if (!imageReady(image)) return;
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const canvasRatio = width / height;
    let sx = 0;
    let sy = 0;
    let sourceWidth = image.naturalWidth;
    let sourceHeight = image.naturalHeight;
    if (imageRatio > canvasRatio) {
      sourceWidth = image.naturalHeight * canvasRatio;
      sx = (image.naturalWidth - sourceWidth) / 2;
    } else if (imageRatio < canvasRatio) {
      sourceHeight = image.naturalWidth / canvasRatio;
      sy = (image.naturalHeight - sourceHeight) / 2;
    }
    ctx.drawImage(image, sx, sy, sourceWidth, sourceHeight, 0, 0, width, height);
    ctx.fillStyle = 'rgba(0, 4, 4, .16)';
    ctx.fillRect(0, 0, width, height);
  }

  drawVentPlayerV62(ctx, width, height) {
    const transit = this.ventActorV62.ventTransit;
    const progress = clamp(transit.progress, 0, 1);
    const vertical = transit.phase === 'moving' && ['up', 'down'].includes(directionForTransit(transit));
    const reverse = ['left', 'up'].includes(directionForTransit(transit));
    const renderX = vertical ? width * 0.66 : width * (reverse ? 0.72 - progress * 0.44 : 0.28 + progress * 0.44);
    const renderY = vertical ? height * (reverse ? 0.66 - progress * 0.38 : 0.28 + progress * 0.38) : height * 0.68;
    const previous = {
      x: this.player.x,
      y: this.player.y,
      vx: this.player.vx,
      vy: this.player.vy,
      grounded: this.player.grounded,
      crouching: this.player.crouching,
      climbing: this.player.climbing,
      facing: this.player.facing
    };
    Object.assign(this.player, {
      x: renderX - this.player.w / 2,
      y: renderY - this.player.h,
      vx: vertical ? 0 : (reverse ? -70 : 70),
      vy: vertical ? (reverse ? -70 : 70) : 0,
      grounded: !vertical,
      crouching: !vertical,
      climbing: vertical,
      facing: reverse ? -1 : 1
    });
    super.drawPlayer(ctx);
    Object.assign(this.player, previous);
  }

  drawVentHudV62(ctx, width, height) {
    const transit = this.ventActorV62.ventTransit;
    const position = getVentTransitPositionV62(HUB_VENT_NETWORK_V62, this.ventActorV62);
    ctx.fillStyle = 'rgba(1, 7, 7, .88)';
    ctx.fillRect(24, 20, Math.min(520, width - 48), 74);
    ctx.strokeStyle = '#78aa89';
    ctx.strokeRect(24.5, 20.5, Math.min(520, width - 48), 74);
    ctx.fillStyle = '#d3e1d6';
    ctx.font = '700 14px ui-monospace, monospace';
    ctx.fillText('RÉSEAU DE CONDUITS · USS TANTALUS', 44, 49);
    ctx.fillStyle = '#8bc6a1';
    ctx.font = '600 12px ui-monospace, monospace';
    ctx.fillText(`${transit.phase.toUpperCase()} · PROFONDEUR ${Number(position?.depth || 0).toFixed(1)} · ${transit.currentNodeId || transit.toNodeId || 'TRANSIT'}`, 44, 75);
    const prompt = this.statusPrompt();
    ctx.font = '700 13px ui-monospace, monospace';
    const promptWidth = Math.min(width - 48, Math.max(340, ctx.measureText(prompt).width + 48));
    const promptX = (width - promptWidth) / 2;
    ctx.fillStyle = 'rgba(1, 7, 7, .9)';
    ctx.fillRect(promptX, height - 72, promptWidth, 42);
    ctx.strokeStyle = '#93d2a3';
    ctx.strokeRect(promptX + 0.5, height - 71.5, promptWidth, 42);
    ctx.fillStyle = '#c8e8d0';
    ctx.textAlign = 'center';
    ctx.fillText(prompt, width / 2, height - 46);
    ctx.textAlign = 'left';
  }
}
