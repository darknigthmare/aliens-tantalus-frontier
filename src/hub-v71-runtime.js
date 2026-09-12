import {
  HUB_DECKS,
  HUB_WORLD,
  HubGame as HubGameV62
} from './hub-v62-runtime.js';
import {
  HUB_ANNEX_BY_ID_V71,
  HUB_ANNEX_WORLD_V71,
  HUB_ANNEXES_V71,
  applyHubAnnexStationV71,
  buildHubCommercialGraphV71,
  createHubCommercialStateV71
} from './tantalus-hub-expansion-v71.js';
import { fitHubBitmapV72 } from './hub-annex-art-layout-v72.js';
import { normalizePlayerFacingV81 } from './player-visual-contract-v81.js';

export * from './hub-v62-runtime.js';
export * from './tantalus-hub-expansion-v71.js';

export const HUB_ANNEX_RUNTIME_SCHEMA_V71 = 71;
export const HUB_ANNEX_STATE_KEY_V71 = 'hubCommercialV71';
export const HUB_ANNEX_TRANSITION_SECONDS_V71 = 0.42;
export const HUB_ANNEX_ART_ROLES_V71 = Object.freeze(['far', 'mid', 'prop', 'foreground', 'door']);

const VIEW_WIDTH = 1280;
const VIEW_HEIGHT = 720;
const GRAVITY = 1900;
const WALK_SPEED = 270;
const SPRINT_SPEED = 370;
const JUMP_SPEED = 665;
const LADDER_SPEED = 205;
const INTERACTION_MARGIN = 72;

const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, Number(value) || 0));
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const overlaps = (left, right) => Boolean(left && right
  && left.x < right.x + right.w
  && left.x + left.w > right.x
  && left.y < right.y + right.h
  && left.y + left.h > right.y);
const imageReady = (image) => Boolean(image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0);

function createImage(source) {
  const image = new Image();
  image.decoding = 'async';
  image.src = source;
  return image;
}

function annexFromState(state) {
  return HUB_ANNEX_BY_ID_V71[state?.activeAnnexId] || null;
}

function expanded(bounds, horizontal = INTERACTION_MARGIN, vertical = 28) {
  return {
    x: bounds.x - horizontal,
    y: bounds.y - vertical,
    w: bounds.w + horizontal * 2,
    h: bounds.h + vertical * 2
  };
}

function horizontalGap(actor, bounds) {
  if (actor.x + actor.w < bounds.x) return bounds.x - (actor.x + actor.w);
  if (actor.x > bounds.x + bounds.w) return actor.x - (bounds.x + bounds.w);
  return 0;
}

function layerSourceRect(image, cameraX, factor = 1) {
  const naturalWidth = Math.max(1, Number(image?.naturalWidth) || HUB_ANNEX_WORLD_V71.width);
  const naturalHeight = Math.max(1, Number(image?.naturalHeight) || HUB_ANNEX_WORLD_V71.height);
  const sourceWidth = Math.min(naturalWidth, naturalHeight * (VIEW_WIDTH / VIEW_HEIGHT));
  const maximumX = Math.max(0, naturalWidth - sourceWidth);
  const worldMaximum = Math.max(1, HUB_ANNEX_WORLD_V71.width - VIEW_WIDTH);
  return {
    x: clamp((cameraX / worldMaximum) * maximumX * factor, 0, maximumX),
    y: 0,
    w: sourceWidth,
    h: naturalHeight
  };
}

function mutableCommercialState(rawState) {
  return clone(createHubCommercialStateV71(rawState));
}

/**
 * Public bridge used by the app, tests and future diegetic station effects.
 * A runtime instance performs persistence/events; a plain state keeps the
 * contract usable as a pure data operation.
 */
export function confirmHubPhysicalUpgradeV71(target, annexId) {
  if (target && typeof target.confirmHubPhysicalUpgradeV71 === 'function') {
    return target.confirmHubPhysicalUpgradeV71(annexId);
  }
  return applyHubAnnexStationV71(target, annexId);
}

export class HubGame extends HubGameV62 {
  constructor(canvas, options = {}) {
    super(canvas, options);
    this.hubCommercialGraphV71 = buildHubCommercialGraphV71();
    this.hubCommercialStateV71 = mutableCommercialState();
    this.annexImagesV71 = new Map();
    this.annexModularImagesV72 = new Map();
    this.annexTransitionV71 = null;
    this.annexCameraV71 = { x: 0 };
    this.annexReturnPoseV71 = null;
    this.annexLastStationReceiptV71 = null;
    this.startingV71 = false;
  }

  start(hubState = {}, options = {}) {
    const restored = mutableCommercialState(
      hubState[HUB_ANNEX_STATE_KEY_V71]
      || hubState.hubExpansionV71
      || hubState.commercialV71
    );
    this.startingV71 = true;
    this.annexTransitionV71 = null;
    this.annexReturnPoseV71 = null;
    this.hubCommercialStateV71 = mutableCommercialState();
    super.start(hubState, options);
    this.startingV71 = false;
    this.hubCommercialStateV71 = restored;

    const annex = this.editorPlaytest ? null : annexFromState(restored);
    if (!annex) {
      if (this.editorPlaytest && restored.activeAnnexId) {
        this.hubCommercialStateV71 = mutableCommercialState({ ...restored, activeAnnexId: null });
      }
      this.draw();
      return;
    }

    // A corrupted save cannot put the same actor in the duct and an annex.
    this.ventActorV62 = null;
    this.ventEntryContextV62 = null;
    this.ensureAnnexAssetsV71(annex.id);
    this.annexReturnPoseV71 = this.restoreReturnPoseV71(annex, restored.returnContext);
    const restoredPose = this.restoreAnnexPlayerPoseV71(annex, restored);
    Object.assign(this.player, restoredPose, { vx: 0, vy: 0 });
    this.hubCommercialStateV71.annexPositionX = Math.round(this.player.x);
    this.hubCommercialStateV71.annexPositionY = Math.round(this.player.y);
    this.hubCommercialStateV71.annexClimbing = Boolean(this.player.climbing);
    this.annexCameraV71.x = clamp(
      this.player.x - VIEW_WIDTH / 2,
      0,
      annex.world.width - VIEW_WIDTH
    );
    this.statusKey = '';
    this.emitStatus();
    this.draw();
  }

  isAnnexActiveV71() {
    return Boolean(annexFromState(this.hubCommercialStateV71));
  }

  currentAnnexV71() {
    return annexFromState(this.hubCommercialStateV71);
  }

  restoreAnnexPlayerPoseV71(annex, state = this.hubCommercialStateV71) {
    const minimumX = 24;
    const maximumX = annex.world.width - this.player.w - 24;
    const maximumY = annex.world.floorY - this.player.h;
    const desired = {
      x: clamp(state?.annexPositionX, minimumX, maximumX),
      y: clamp(state?.annexPositionY, 0, maximumY),
      w: this.player.w,
      h: this.player.h
    };
    const ladder = annex.ladders.find((entry) => {
      const center = desired.x + desired.w / 2;
      return center >= entry.x - 28 && center <= entry.x + entry.w + 28
        && desired.y + desired.h >= entry.top - 18
        && desired.y <= entry.bottom + 18;
    });
    if (state?.annexClimbing && ladder) {
      return {
        x: clamp(ladder.x + ladder.w / 2 - desired.w / 2, minimumX, maximumX),
        y: clamp(desired.y, ladder.top - desired.h, ladder.bottom - desired.h),
        grounded: false,
        crouching: false,
        climbing: true
      };
    }

    const colliders = this.annexSolidCollidersV71(annex);
    const safeAt = (x, y) => {
      const actor = { ...desired, x, y };
      return !colliders.some((collider) => overlaps(actor, collider));
    };
    if (!safeAt(desired.x, desired.y)) {
      const candidates = colliders
        .filter((collider) => overlaps(desired, collider))
        .flatMap((collider) => [
          { x: collider.x - desired.w, y: desired.y },
          { x: collider.x + collider.w, y: desired.y },
          { x: desired.x, y: collider.y - desired.h }
        ])
        .map((candidate) => ({
          x: clamp(candidate.x, minimumX, maximumX),
          y: clamp(candidate.y, 0, maximumY)
        }))
        .filter((candidate) => safeAt(candidate.x, candidate.y))
        .sort((left, right) => (
          Math.abs(left.x - desired.x) + Math.abs(left.y - desired.y)
          - Math.abs(right.x - desired.x) - Math.abs(right.y - desired.y)
        ));
      const fallbackX = clamp(
        annex.entranceSide === 'west'
          ? annex.entranceLocalX + annex.entrance.w / 2 + 30
          : annex.entranceLocalX - annex.entrance.w / 2 - desired.w - 30,
        minimumX,
        maximumX
      );
      const safe = candidates[0] || { x: fallbackX, y: maximumY };
      desired.x = safe.x;
      desired.y = safe.y;
    }

    const grounded = [...annex.platforms, ...colliders].some((surface) => (
      desired.x + desired.w > surface.x
      && desired.x < surface.x + surface.w
      && Math.abs(desired.y + desired.h - surface.y) <= 8
    ));
    return {
      x: desired.x,
      y: desired.y,
      grounded,
      crouching: false,
      climbing: false
    };
  }

  ensureAnnexAssetsV71(annexId) {
    const annex = HUB_ANNEX_BY_ID_V71[annexId];
    if (!annex) return null;
    if (!this.annexImagesV71.has(annex.id)) {
      this.annexImagesV71.set(annex.id, new Map(HUB_ANNEX_ART_ROLES_V71.map((role) => [
        role,
        createImage(annex.art[role])
      ])));
    }
    for (const asset of [...annex.props.map((prop) => prop.asset), '/assets/openai/metroidvania/props/maintenance-pipe.png'].filter(Boolean)) {
      if (!this.annexModularImagesV72.has(asset)) this.annexModularImagesV72.set(asset, createImage(asset));
    }
    return this.annexImagesV71.get(annex.id);
  }

  getAnnexAssetGroupV71(annexId) {
    return this.annexImagesV71.get(annexId) || null;
  }

  annexForParentRoomV71(roomId = this.state?.roomId) {
    return HUB_ANNEXES_V71.find((annex) => annex.parentRoomId === roomId) || null;
  }

  getParentAnnexDoorV71(annexId = null) {
    const annex = annexId ? HUB_ANNEX_BY_ID_V71[annexId] : this.annexForParentRoomV71();
    if (!annex || !this.state || HUB_DECKS[this.state.deck]?.id !== annex.parentDeck) return null;
    const room = HUB_DECKS[this.state.deck].rooms.find((entry) => entry.id === annex.parentRoomId);
    if (!room) return null;
    const platforms = (this.v51Platforms || [])
      .filter((platform) => platform.roomId === room.id && platform.w >= annex.entrance.w + 64)
      .sort((left, right) => left.y - right.y || (
        annex.entranceSide === 'west' ? left.x - right.x : right.x - left.x
      ));
    const support = platforms[0];
    const sideOffset = annex.entrance.w / 2 + 32;
    const centerX = support
      ? (annex.entranceSide === 'west'
          ? support.x + sideOffset
          : support.x + support.w - sideOffset)
      : room.xStart + (annex.entranceSide === 'west' ? 220 : HUB_WORLD.roomWidth - 220);
    const bottom = support?.y || HUB_WORLD.floorY;
    const bounds = {
      x: centerX - annex.entrance.w / 2,
      y: bottom - annex.entrance.h,
      w: annex.entrance.w,
      h: annex.entrance.h
    };
    return {
      id: `${annex.id}-parent-door`,
      type: 'hub:annex-door',
      action: 'hub:annex-enter',
      interactionPriority: 130,
      annexId: annex.id,
      roomId: room.id,
      deckId: annex.parentDeck,
      annex,
      bounds,
      interactionBounds: expanded(bounds, 42, 18),
      description: `Entrer dans ${annex.name}`
    };
  }

  nearestParentAnnexDoorV71() {
    if (this.startingV71 || this.editorPlaytest || this.isAnnexActiveV71() || this.isVentActiveV62()) return null;
    const door = this.getParentAnnexDoorV71();
    return door && overlaps(this.player, door.interactionBounds) ? door : null;
  }

  annexExitDoorV71() {
    const annex = this.currentAnnexV71();
    if (!annex) return null;
    const bounds = {
      x: annex.entranceLocalX - annex.entrance.w / 2,
      y: annex.entrance.y,
      w: annex.entrance.w,
      h: annex.entrance.h
    };
    return {
      id: annex.entrance.id,
      annexId: annex.id,
      bounds,
      interactionBounds: expanded(bounds, 42, 18),
      description: `Retour vers ${annex.parentRoomId}`
    };
  }

  nearestAnnexExitV71() {
    const door = this.annexExitDoorV71();
    return door && overlaps(this.player, door.interactionBounds) ? door : null;
  }

  nearestAnnexStationV71() {
    const annex = this.currentAnnexV71();
    if (!annex) return null;
    const bounds = annex.station.bounds;
    const bodyAligned = this.player.y + this.player.h >= bounds.y - 34
      && this.player.y <= bounds.y + bounds.h + 28;
    return bodyAligned && horizontalGap(this.player, bounds) <= INTERACTION_MARGIN
      ? { ...annex.station, annexId: annex.id, interactionPriority: 120 }
      : null;
  }

  nearestInteraction() {
    if (this.isAnnexActiveV71()) return this.nearestAnnexStationV71();
    return this.nearestParentAnnexDoorV71() || super.nearestInteraction();
  }

  statusPrompt() {
    const transition = this.annexTransitionV71;
    if (transition) {
      const verb = transition.direction === 'enter' ? 'OUVERTURE DU SAS ANNEXE' : 'RETOUR AU HUB';
      return `${verb} · ${Math.round(transition.progress * 100)}%`;
    }
    if (this.isAnnexActiveV71()) {
      const annex = this.currentAnnexV71();
      if (this.nearestAnnexExitV71()) return `E — SORTIR VERS ${annex.parentRoomId.toUpperCase()}`;
      const station = this.nearestAnnexStationV71();
      if (station) return `E — ${station.description.toUpperCase()}`;
      return 'A / D — MARCHER · MAJ — COURIR · ESPACE — SAUTER · E — UTILISER';
    }
    const annexDoor = this.nearestParentAnnexDoorV71();
    if (annexDoor) return `E — ENTRER DANS ${annexDoor.annex.shortName}`;
    return super.statusPrompt();
  }

  interact() {
    if (!this.running || this.annexTransitionV71) return;
    if (this.isAnnexActiveV71()) {
      if (this.nearestAnnexExitV71()) {
        this.beginAnnexTransitionV71(this.currentAnnexV71().id, 'exit');
        return;
      }
      const station = this.nearestAnnexStationV71();
      if (station) this.confirmHubPhysicalUpgradeV71(station.annexId);
      return;
    }
    const door = this.nearestParentAnnexDoorV71();
    if (door) {
      this.beginAnnexTransitionV71(door.annexId, 'enter');
      return;
    }
    super.interact();
  }

  beginAnnexTransitionV71(annexId, direction) {
    const annex = HUB_ANNEX_BY_ID_V71[annexId];
    if (!annex || !['enter', 'exit'].includes(direction) || this.annexTransitionV71) return null;
    if (direction === 'enter' && this.isAnnexActiveV71()) return null;
    if (direction === 'exit' && this.currentAnnexV71()?.id !== annex.id) return null;
    if (direction === 'enter') {
      const door = this.getParentAnnexDoorV71(annex.id);
      this.annexReturnPoseV71 = {
        x: this.player.x,
        y: this.player.y,
        facing: this.player.facing,
        cameraX: this.camera.x,
        door
      };
    }
    this.ensureAnnexAssetsV71(annex.id);
    this.keys.clear();
    this.player.vx = 0;
    this.player.vy = 0;
    this.annexTransitionV71 = {
      annexId: annex.id,
      direction,
      elapsed: 0,
      duration: this.reducedMotion ? 0.12 : HUB_ANNEX_TRANSITION_SECONDS_V71,
      progress: 0
    };
    this.statusKey = '';
    this.audio?.ui?.();
    this.onAction({
      type: 'hub:annex-transition',
      action: direction === 'enter' ? 'hub:annex-enter-start' : 'hub:annex-exit-start',
      annexId: annex.id,
      parentRoomId: annex.parentRoomId,
      noMenu: true
    });
    this.emitStatus();
    return clone(this.annexTransitionV71);
  }

  completeAnnexTransitionV71() {
    const transition = this.annexTransitionV71;
    const annex = transition && HUB_ANNEX_BY_ID_V71[transition.annexId];
    if (!transition || !annex) return false;
    if (transition.direction === 'enter') this.activateAnnexV71(annex);
    else this.deactivateAnnexV71(annex);
    this.annexTransitionV71 = null;
    this.statusKey = '';
    this.persist();
    this.emitStatus();
    return true;
  }

  activateAnnexV71(annex) {
    const state = clone(this.hubCommercialStateV71);
    state.revision = Math.min(999999, Number(state.revision || 0) + 1);
    const annexState = state.annexes[annex.id];
    annexState.visited = true;
    annexState.visitCount = Math.min(999999, Number(annexState.visitCount || 0) + 1);
    annexState.lastVisitedAt = state.revision;
    state.activeAnnexId = annex.id;
    const spawnX = annex.entranceSide === 'west'
      ? annex.entranceLocalX + annex.entrance.w / 2 + 30
      : annex.entranceLocalX - annex.entrance.w / 2 - this.player.w - 30;
    state.annexPositionX = Math.round(spawnX);
    state.annexPositionY = annex.world.floorY - this.player.h;
    state.annexClimbing = false;
    state.returnContext = {
      deckId: annex.parentDeck,
      roomId: annex.parentRoomId,
      x: Math.round(this.annexReturnPoseV71?.x ?? this.player.x),
      facing: normalizePlayerFacingV81(this.annexReturnPoseV71?.facing ?? this.player.facing)
    };
    state.lastAnnexId = annex.id;
    this.hubCommercialStateV71 = mutableCommercialState(state);
    Object.assign(this.player, {
      x: clamp(spawnX, 24, annex.world.width - this.player.w - 24),
      y: annex.world.floorY - this.player.h,
      vx: 0,
      vy: 0,
      grounded: true,
      crouching: false,
      climbing: false,
      facing: annex.entranceSide === 'west' ? 1 : -1
    });
    this.annexCameraV71.x = clamp(this.player.x - VIEW_WIDTH / 2, 0, annex.world.width - VIEW_WIDTH);
    this.onAction({
      type: 'hub:annex-transition',
      action: 'hub:annex-enter-complete',
      annexId: annex.id,
      parentRoomId: annex.parentRoomId,
      noMenu: true
    });
  }

  deactivateAnnexV71(annex) {
    const state = clone(this.hubCommercialStateV71);
    const pose = this.annexReturnPoseV71 || this.restoreReturnPoseV71(annex, state.returnContext);
    state.activeAnnexId = null;
    state.annexPositionX = null;
    state.annexPositionY = null;
    state.annexClimbing = false;
    state.returnContext = null;
    state.lastAnnexId = annex.id;
    this.hubCommercialStateV71 = mutableCommercialState(state);
    Object.assign(this.player, {
      x: clamp(pose.x, 24, HUB_WORLD.width - this.player.w - 24),
      y: pose.y,
      vx: 0,
      vy: 0,
      grounded: true,
      crouching: false,
      climbing: false,
      facing: normalizePlayerFacingV81(pose.facing)
    });
    this.state.positionX = Math.round(this.player.x);
    this.camera.x = clamp(pose.cameraX, 0, HUB_WORLD.width - VIEW_WIDTH);
    this.annexCameraV71.x = 0;
    this.annexReturnPoseV71 = null;
    this.onAction({
      type: 'hub:annex-transition',
      action: 'hub:annex-exit-complete',
      annexId: annex.id,
      parentRoomId: annex.parentRoomId,
      noMenu: true
    });
  }

  restoreReturnPoseV71(annex, returnContext = null) {
    const door = this.getParentAnnexDoorV71(annex.id);
    const x = Number.isFinite(Number(returnContext?.x))
      ? Number(returnContext.x)
      : door?.bounds.x || 180;
    return {
      x,
      y: door ? door.bounds.y + door.bounds.h - this.player.h : HUB_WORLD.floorY - this.player.h,
      facing: returnContext?.facing === -1 || returnContext?.facing === 1
        ? returnContext.facing
        : annex.entranceSide === 'west' ? -1 : 1,
      cameraX: clamp(x - VIEW_WIDTH / 2, 0, HUB_WORLD.width - VIEW_WIDTH),
      door
    };
  }

  confirmHubPhysicalUpgradeV71(annexId = this.currentAnnexV71()?.id) {
    const annex = this.currentAnnexV71();
    if (!annex || annex.id !== annexId || !this.nearestAnnexStationV71()) {
      return { applied: false, state: clone(this.hubCommercialStateV71), station: null, effect: null };
    }
    const visitCount = this.hubCommercialStateV71.annexes[annex.id].visitCount;
    const lastVisitedAt = this.hubCommercialStateV71.annexes[annex.id].lastVisitedAt;
    const contractReceipt = applyHubAnnexStationV71(this.hubCommercialStateV71, annex.id);
    const proposedState = clone(contractReceipt.state);
    proposedState.annexes[annex.id].visitCount = visitCount;
    proposedState.annexes[annex.id].lastVisitedAt = lastVisitedAt;
    proposedState.activeAnnexId = annex.id;
    proposedState.annexPositionX = Math.round(this.player.x);
    proposedState.annexPositionY = Math.round(this.player.y);
    proposedState.annexClimbing = Boolean(this.player.climbing);
    proposedState.returnContext = {
      deckId: annex.parentDeck,
      roomId: annex.parentRoomId,
      x: Math.round(this.annexReturnPoseV71?.x ?? this.state.positionX),
      facing: normalizePlayerFacingV81(this.annexReturnPoseV71?.facing ?? this.player.facing)
    };
    const actionResult = this.onAction({
      type: 'hub:annex-station',
      action: annex.station.action,
      stationAction: annex.station.action,
      annexId: annex.id,
      stationId: annex.station.id,
      effect: clone(contractReceipt.effect),
      noMenu: true
    });
    if (actionResult === false) {
      return {
        applied: false,
        rejected: true,
        state: clone(this.hubCommercialStateV71),
        station: clone(contractReceipt.station),
        effect: null
      };
    }
    this.hubCommercialStateV71 = proposedState;
    const receipt = {
      ...clone(contractReceipt),
      state: clone(this.hubCommercialStateV71)
    };
    this.annexLastStationReceiptV71 = clone(receipt);
    this.audio?.ui?.();
    this.persist();
    this.statusKey = '';
    this.emitStatus();
    return clone(receipt);
  }

  setControl(control, active) {
    if (this.annexTransitionV71) return;
    if (this.isAnnexActiveV71() && ['depth', 'fire'].includes(control)) return;
    super.setControl(control, active);
  }

  useLift(direction, wrap = false) {
    if (this.isAnnexActiveV71() || this.annexTransitionV71) return false;
    return super.useLift(direction, wrap);
  }

  fire() {
    if (this.isAnnexActiveV71() || this.annexTransitionV71) return false;
    return super.fire();
  }

  update(delta) {
    const elapsed = clamp(delta, 0, 0.25);
    if (this.annexTransitionV71) {
      this.animationTime += elapsed;
      this.annexTransitionV71.elapsed += elapsed;
      this.annexTransitionV71.progress = clamp(
        this.annexTransitionV71.elapsed / this.annexTransitionV71.duration,
        0,
        1
      );
      if (this.annexTransitionV71.progress >= 1) this.completeAnnexTransitionV71();
      else {
        this.statusKey = '';
        this.emitStatus();
      }
      return;
    }
    if (!this.isAnnexActiveV71()) {
      super.update(delta);
      return;
    }
    this.updateAnnexPhysicsV71(elapsed);
  }

  updateAnnexPhysicsV71(delta) {
    // Fixed upper bound avoids tunnelling through thin props after a dropped frame.
    const steps = Math.max(1, Math.ceil(delta / (1 / 120)));
    for (let step = 0; step < steps; step += 1) this.stepAnnexPhysicsV72(delta / steps);
  }

  stepAnnexPhysicsV72(delta) {
    const annex = this.currentAnnexV71();
    if (!annex || !this.player) return;
    this.animationTime += delta;
    this.jumpQueued = Math.max(0, this.jumpQueued - delta);
    const left = this.keys.has('KeyA') || this.keys.has('ArrowLeft');
    const right = this.keys.has('KeyD') || this.keys.has('ArrowRight');
    const up = this.keys.has('KeyW') || this.keys.has('ArrowUp');
    const down = this.keys.has('KeyS') || this.keys.has('ArrowDown');
    const crouching = this.keys.has('KeyC');
    const sprinting = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    const ladder = annex.ladders.find((entry) => {
      const center = this.player.x + this.player.w / 2;
      return center >= entry.x - 28 && center <= entry.x + entry.w + 28
        && this.player.y + this.player.h >= entry.top - 18
        && this.player.y <= entry.bottom + 18;
    });
    const horizontalExit = left || right;
    const ladderJump = this.player.climbing && this.jumpQueued > 0;
    const atLadderTop = ladder && this.player.y <= ladder.top - this.player.h + 1;
    const atLadderBottom = ladder && this.player.y >= ladder.bottom - this.player.h - 1;
    const leavingEndpoint = this.player.climbing && ((atLadderTop && up) || (atLadderBottom && down));
    if (ladder && !horizontalExit && !ladderJump && !leavingEndpoint && (up || down || this.player.climbing)) {
      this.player.climbing = true;
      this.player.crouching = false;
      this.player.grounded = false;
      this.player.vx = 0;
      this.player.x += (ladder.x + ladder.w / 2 - (this.player.x + this.player.w / 2)) * Math.min(1, delta * 12);
      this.player.vy = (Number(down) - Number(up)) * LADDER_SPEED;
      this.player.y = clamp(this.player.y + this.player.vy * delta, ladder.top - this.player.h, ladder.bottom - this.player.h);
      if (!up && !down) this.player.vy = 0;
    } else {
      if (this.player.climbing) {
        this.player.grounded = Boolean(atLadderTop || atLadderBottom);
        if (ladderJump) {
          this.player.vy = -JUMP_SPEED;
          this.player.grounded = false;
          this.jumpQueued = 0;
          this.coyoteTime = 0;
        }
      }
      this.player.climbing = false;
      this.player.crouching = crouching && this.player.grounded;
      const movementSpeed = this.player.crouching ? 105 : sprinting ? SPRINT_SPEED : WALK_SPEED;
      const targetVelocity = (Number(right) - Number(left)) * movementSpeed;
      const acceleration = this.player.grounded ? 15 : 8;
      this.player.vx += (targetVelocity - this.player.vx) * Math.min(1, delta * acceleration);
      if (!left && !right && Math.abs(this.player.vx) < 0.4) this.player.vx = 0;
      if (this.player.vx) this.player.facing = Math.sign(this.player.vx);
      if (this.player.grounded) this.coyoteTime = 0.1;
      else this.coyoteTime = Math.max(0, this.coyoteTime - delta);
      if (this.jumpQueued > 0 && this.coyoteTime > 0) {
        this.player.vy = -JUMP_SPEED;
        this.player.grounded = false;
        this.jumpQueued = 0;
        this.coyoteTime = 0;
      }
      this.player.vy += GRAVITY * delta;
      const previousX = this.player.x;
      this.player.x = clamp(this.player.x + this.player.vx * delta, 24, annex.world.width - this.player.w - 24);
      this.resolveAnnexHorizontalV71(annex, previousX);
      const previousBottom = this.player.y + this.player.h;
      this.player.y += this.player.vy * delta;
      this.player.grounded = false;
      this.resolveAnnexVerticalV71(annex, previousBottom);
    }
    this.annexCameraV71.x += (
      clamp(this.player.x - VIEW_WIDTH / 2, 0, annex.world.width - VIEW_WIDTH) - this.annexCameraV71.x
    ) * Math.min(1, delta * (this.reducedMotion ? 12 : 6));
    this.hubCommercialStateV71.annexPositionX = Math.round(this.player.x);
    this.hubCommercialStateV71.annexPositionY = Math.round(this.player.y);
    this.hubCommercialStateV71.annexClimbing = Boolean(this.player.climbing);
    this.statusKey = '';
    this.emitStatus();
  }

  annexSolidCollidersV71(annex) {
    return annex.colliders.map((collider) => ({ ...collider }));
  }

  resolveAnnexHorizontalV71(annex, previousX) {
    for (const collider of this.annexSolidCollidersV71(annex)) {
      if (!overlaps(this.player, collider)) continue;
      if (this.player.vx > 0 && previousX + this.player.w <= collider.x + 8) {
        this.player.x = collider.x - this.player.w;
      } else if (this.player.vx < 0 && previousX >= collider.x + collider.w - 8) {
        this.player.x = collider.x + collider.w;
      }
      this.player.vx = 0;
    }
  }

  resolveAnnexVerticalV71(annex, previousBottom) {
    if (this.player.vy < 0) {
      const previousTop = previousBottom - this.player.h;
      const ceilings = this.annexSolidCollidersV71(annex).filter((collider) => (
        this.player.x + this.player.w > collider.x && this.player.x < collider.x + collider.w
        && previousTop >= collider.y + collider.h - 1 && this.player.y < collider.y + collider.h
      )).sort((left, right) => right.y + right.h - left.y - left.h);
      if (ceilings[0]) {
        this.player.y = ceilings[0].y + ceilings[0].h;
        this.player.vy = 0;
        return;
      }
      if (this.player.y < 0) { this.player.y = 0; this.player.vy = 0; }
    }
    const surfaces = [
      ...annex.platforms.map((platform) => ({ ...platform })),
      ...annex.colliders.map((collider) => ({ ...collider, role: 'collider-top' }))
    ].sort((left, right) => left.y - right.y);
    if (this.player.vy >= 0) {
      for (const surface of surfaces) {
        const horizontallySupported = this.player.x + this.player.w > surface.x
          && this.player.x < surface.x + surface.w;
        if (!horizontallySupported || previousBottom > surface.y + 8 || this.player.y + this.player.h < surface.y) continue;
        this.player.y = surface.y - this.player.h;
        this.player.vy = 0;
        this.player.grounded = true;
        return;
      }
    }
    if (this.player.y > annex.world.height + 120) {
      this.player.x = annex.entranceLocalX;
      this.player.y = annex.world.floorY - this.player.h;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.grounded = true;
    }
  }

  emitStatus() {
    if (!this.state || !this.player || (!this.isAnnexActiveV71() && !this.annexTransitionV71)) {
      super.emitStatus();
      return;
    }
    const transitionAnnex = this.annexTransitionV71 && HUB_ANNEX_BY_ID_V71[this.annexTransitionV71.annexId];
    const annex = this.currentAnnexV71() || transitionAnnex;
    const payload = {
      deck: this.state.deck,
      deckName: HUB_DECKS[this.state.deck].name,
      roomId: annex.id,
      roomName: annex.name,
      prompt: this.statusPrompt(),
      visited: this.hubCommercialStateV71.visitedAnnexIds.length,
      health: Math.round(this.player.health),
      threats: 0,
      route: { source: 'hub-annex-v71', nodeCount: this.hubCommercialGraphV71.nodes.length },
      editorPlaytest: false,
      activeAnnexId: this.currentAnnexV71()?.id || null,
      transition: this.annexTransitionV71 ? clone(this.annexTransitionV71) : null
    };
    const key = JSON.stringify(payload);
    if (key === this.statusKey) return;
    this.statusKey = key;
    this.onStatus(payload);
  }

  persist() {
    if (!this.state || !this.player) return;
    const annex = this.currentAnnexV71();
    if (annex) {
      this.hubCommercialStateV71.annexPositionX = Math.round(this.player.x);
      this.hubCommercialStateV71.annexPositionY = Math.round(this.player.y);
      this.hubCommercialStateV71.annexClimbing = Boolean(this.player.climbing);
    }
    const originalOnPersist = this.onPersist;
    let inheritedPatch = null;
    const playerPose = annex ? { x: this.player.x, y: this.player.y } : null;
    const statePosition = this.state.positionX;
    if (annex) {
      const returnX = this.hubCommercialStateV71.returnContext?.x ?? this.annexReturnPoseV71?.x ?? statePosition;
      this.player.x = returnX;
      this.state.positionX = Math.round(returnX);
    }
    this.onPersist = (patch) => { inheritedPatch = patch; };
    try {
      super.persist();
    } finally {
      this.onPersist = originalOnPersist;
      if (annex) {
        this.player.x = playerPose.x;
        this.player.y = playerPose.y;
        this.state.positionX = statePosition;
      }
    }
    originalOnPersist({
      ...(inheritedPatch || {}),
      [HUB_ANNEX_STATE_KEY_V71]: clone(this.hubCommercialStateV71)
    });
  }

  getAssetReport() {
    const report = super.getAssetReport();
    const groups = [...(this.annexImagesV71?.values() || [])];
    const loaded = groups.reduce((total, group) => total + group.size, 0);
    const ready = groups.reduce((total, group) => total + [...group.values()].filter(imageReady).length, 0);
    const activeGroup = this.currentAnnexV71() && this.annexImagesV71?.get(this.currentAnnexV71().id);
    const modularReady = [...(this.annexModularImagesV72?.values() || [])].filter(imageReady).length;
    return {
      ...report,
      annexAssetCountV71: HUB_ANNEXES_V71.length * HUB_ANNEX_ART_ROLES_V71.length,
      annexAssetsLoadedV71: loaded,
      annexAssetsReadyV71: ready,
      annexAssetGroupsLoadedV71: groups.length,
      activeAnnexAssetsReadyV71: activeGroup ? [...activeGroup.values()].filter(imageReady).length : 0,
      annexSharedModularAssetsLoadedV72: this.annexModularImagesV72?.size || 0,
      annexSharedModularAssetsReadyV72: modularReady,
      totalReadyAssetCount: (report.totalReadyAssetCount || 0) + ready + modularReady
    };
  }

  getSnapshot() {
    const annex = this.currentAnnexV71();
    let baseSnapshot;
    if (annex && this.annexReturnPoseV71) {
      const pose = { x: this.player.x, y: this.player.y };
      this.player.x = this.annexReturnPoseV71.x;
      this.player.y = this.annexReturnPoseV71.y;
      try { baseSnapshot = super.getSnapshot(); }
      finally { Object.assign(this.player, pose); }
    } else baseSnapshot = super.getSnapshot();
    const assetReport = this.getAssetReport();
    return {
      ...baseSnapshot,
      roomId: annex?.id || baseSnapshot.roomId,
      roomNameV71: annex?.name || null,
      x: Math.round(this.player?.x || 0),
      y: Math.round(this.player?.y || 0),
      cameraX: Math.round(annex ? this.annexCameraV71.x : this.camera.x),
      hubCommercialGraphRoomCountV71: this.hubCommercialGraphV71.nodes.length,
      hubCommercialGraphConnectionCountV71: this.hubCommercialGraphV71.edges.length,
      activeAnnexV71: Boolean(annex),
      activeAnnexIdV71: annex?.id || null,
      annexTransitionV71: this.annexTransitionV71 ? clone(this.annexTransitionV71) : null,
      hubCommercialV71: clone(this.hubCommercialStateV71),
      visitedAnnexIdsV71: [...this.hubCommercialStateV71.visitedAnnexIds],
      stationUsesV71: { ...this.hubCommercialStateV71.stationUses },
      annexAssetCountV71: assetReport.annexAssetCountV71,
      annexAssetsLoadedV71: assetReport.annexAssetsLoadedV71,
      annexAssetsReadyV71: assetReport.annexAssetsReadyV71,
      activeAnnexAssetsReadyV71: assetReport.activeAnnexAssetsReadyV71,
      promptV71: this.statusPrompt()
    };
  }

  drawTraversal(ctx) {
    super.drawTraversal(ctx);
    if (this.startingV71 || this.editorPlaytest || this.isAnnexActiveV71()) return;
    const door = this.getParentAnnexDoorV71();
    if (!door) return;
    const images = this.ensureAnnexAssetsV71(door.annexId);
    this.drawDoorBitmapV71(ctx, images?.get('door'), door.bounds, this.nearestParentAnnexDoorV71() ? 1 : 0, door.annex.art.alphaBounds.door);
  }

  drawHud(ctx) {
    if (this.isAnnexActiveV71()) {
      this.drawAnnexHudV71(ctx);
      return;
    }
    const deck = HUB_DECKS[this.state.deck];
    const room = this.currentRoom();
    const prompt = this.statusPrompt();
    const threats = (this.enemies || []).filter((enemy) => enemy.alive).length;
    ctx.fillStyle = 'rgba(2, 8, 7, .88)';
    ctx.fillRect(18, 18, 700, 82);
    ctx.strokeStyle = '#648270';
    ctx.strokeRect(18.5, 18.5, 700, 82);
    ctx.fillStyle = '#9adbac';
    ctx.font = '700 13px ui-monospace, monospace';
    ctx.fillText(`USS TANTALUS // ${deck.shortName}`, 36, 41);
    ctx.fillStyle = '#d3ddd5';
    ctx.font = '700 15px ui-monospace, monospace';
    ctx.fillText(room.name.toUpperCase(), 36, 65);
    ctx.fillStyle = '#9cc9aa';
    ctx.font = '700 12px ui-monospace, monospace';
    ctx.fillText(`SANTÉ ${Math.round(this.player.health)}% · MENACES ${threats} · HUB 16 + ANNEXES ${this.hubCommercialStateV71.visitedAnnexIds.length}/10`, 300, 65);
    this.drawSinglePromptV71(ctx, prompt);
  }

  draw() {
    if (!this.player) return;
    if (!this.isAnnexActiveV71()) {
      super.draw();
      if (this.annexTransitionV71) this.drawAnnexTransitionV71(this.ctx);
      return;
    }
    this.drawAnnexV71();
    if (this.annexTransitionV71) this.drawAnnexTransitionV71(this.ctx);
  }

  drawAnnexV71() {
    const annex = this.currentAnnexV71();
    if (!annex) return;
    const ctx = this.ctx;
    const images = this.ensureAnnexAssetsV71(annex.id);
    ctx.save();
    ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    ctx.fillStyle = '#020606';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    this.drawAnnexLayerV71(ctx, images.get('far'), 0.18, 1);
    this.drawAnnexLayerV71(ctx, images.get('mid'), 1, 0.92);
    ctx.save();
    ctx.translate(-this.annexCameraV71.x, 0);
    this.drawAnnexGeometryV71(ctx, annex);
    this.drawAnnexModularPropsV72(ctx, annex);
    this.drawAnnexPropLayerV71(ctx, annex, images.get('prop'));
    this.drawDoorBitmapV71(ctx, images.get('door'), this.annexExitDoorV71().bounds, this.nearestAnnexExitV71() ? 1 : 0, annex.art.alphaBounds.door);
    super.drawPlayer(ctx);
    this.drawAnnexForegroundV72(ctx, annex, images.get('foreground'));
    ctx.restore();
    this.drawAnnexLightingV71(ctx);
    this.drawAnnexHudV71(ctx);
    ctx.restore();
  }

  drawAnnexLayerV71(ctx, image, cameraFactor, alpha) {
    if (!imageReady(image)) return;
    const source = layerSourceRect(image, this.annexCameraV71.x, cameraFactor);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, source.x, source.y, source.w, source.h, 0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    ctx.restore();
  }

  drawAnnexGeometryV71(ctx, annex) {
    ctx.fillStyle = 'rgba(4, 10, 9, .8)';
    ctx.fillRect(0, annex.world.floorY, annex.world.width, annex.world.floorHeight);
    ctx.fillStyle = '#789080';
    ctx.fillRect(0, annex.world.floorY, annex.world.width, 4);
    for (const platform of annex.platforms.filter((entry) => entry.role !== 'floor')) {
      ctx.fillStyle = '#273832';
      ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
      ctx.fillStyle = '#789080';
      ctx.fillRect(platform.x, platform.y, platform.w, 4);
    }
    for (const ladder of annex.ladders) {
      ctx.strokeStyle = '#829789';
      ctx.lineWidth = 5;
      ctx.strokeRect(ladder.x, ladder.top, ladder.w, ladder.bottom - ladder.top);
      ctx.lineWidth = 2;
      for (let y = ladder.top + 12; y < ladder.bottom; y += 22) {
        ctx.beginPath();
        ctx.moveTo(ladder.x + 4, y);
        ctx.lineTo(ladder.x + ladder.w - 4, y);
        ctx.stroke();
      }
    }
  }

  drawAnnexPropLayerV71(ctx, annex, image) {
    if (!imageReady(image)) return;
    this.drawCroppedBitmapV72(ctx, image, annex.art.alphaBounds.prop, annex.station.bounds);
    if (this.nearestAnnexStationV71()) {
      ctx.save();
      ctx.strokeStyle = '#d9ca79';
      ctx.lineWidth = 3;
      ctx.strokeRect(annex.station.bounds.x - 6, annex.station.bounds.y - 6, annex.station.bounds.w + 12, annex.station.bounds.h + 12);
      ctx.restore();
    }
  }

  drawCroppedBitmapV72(ctx, image, source, target) {
    if (!imageReady(image)) return;
    const fitted = fitHubBitmapV72(source, target);
    ctx.drawImage(image, source[0], source[1], source[2] - source[0], source[3] - source[1], fitted.x, fitted.y, fitted.w, fitted.h);
  }

  drawAnnexModularPropsV72(ctx, annex) {
    for (const prop of annex.props.filter((entry) => entry.asset)) {
      const image = this.annexModularImagesV72.get(prop.asset);
      if (imageReady(image)) this.drawCroppedBitmapV72(ctx, image, [0, 0, image.naturalWidth, image.naturalHeight], prop);
    }
    const pipe = this.annexModularImagesV72.get('/assets/openai/metroidvania/props/maintenance-pipe.png');
    if (!imageReady(pipe)) return;
    for (const collider of annex.colliders.filter((entry) => entry.role === 'structure')) {
      // The collision rib sits inside the visible pipe silhouette, not in empty air.
      const w = collider.h * pipe.naturalWidth / pipe.naturalHeight;
      ctx.drawImage(pipe, collider.x + (collider.w - w) / 2, collider.y, w, collider.h);
    }
  }

  drawAnnexForegroundV72(ctx, annex, image) {
    if (!imageReady(image)) return;
    const bounds = { x: annex.entranceSide === 'west' ? 1620 : 48, y: 444, w: 240, h: 212 };
    ctx.save();
    // Foreground equipment has its own world anchor. It must never be a
    // viewport-sized opaque image hiding the traversal or the service console.
    ctx.globalAlpha = overlaps(expanded(this.player, 24, 24), bounds) ? 0.2 : 0.86;
    this.drawCroppedBitmapV72(ctx, image, annex.art.alphaBounds.foreground, bounds);
    ctx.restore();
  }

  drawDoorBitmapV71(ctx, image, bounds, active = 0, source = null) {
    ctx.save();
    if (active) {
      ctx.shadowColor = 'rgba(142, 224, 169, .78)';
      ctx.shadowBlur = 16;
    }
    if (imageReady(image)) {
      if (source) this.drawCroppedBitmapV72(ctx, image, source, bounds);
      else ctx.drawImage(image, bounds.x, bounds.y, bounds.w, bounds.h);
    }
    else {
      ctx.fillStyle = '#17241f';
      ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
      ctx.strokeStyle = '#82a28e';
      ctx.strokeRect(bounds.x + 0.5, bounds.y + 0.5, bounds.w - 1, bounds.h - 1);
    }
    ctx.restore();
  }

  drawAnnexLightingV71(ctx) {
    const vignette = ctx.createRadialGradient(VIEW_WIDTH / 2, VIEW_HEIGHT * 0.55, 120, VIEW_WIDTH / 2, VIEW_HEIGHT * 0.55, 760);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 3, 4, .62)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  }

  drawAnnexHudV71(ctx) {
    const annex = this.currentAnnexV71();
    if (!annex) return;
    const annexState = this.hubCommercialStateV71.annexes[annex.id];
    ctx.fillStyle = 'rgba(2, 8, 7, .9)';
    ctx.fillRect(18, 18, 690, 82);
    ctx.strokeStyle = '#648270';
    ctx.strokeRect(18.5, 18.5, 690, 82);
    ctx.fillStyle = '#9adbac';
    ctx.font = '700 13px ui-monospace, monospace';
    ctx.fillText(`USS TANTALUS // ANNEXE PHYSIQUE // ${annex.parentDeck.toUpperCase()}`, 36, 41);
    ctx.fillStyle = '#e2eadf';
    ctx.font = '700 16px ui-monospace, monospace';
    ctx.fillText(annex.shortName, 36, 67);
    ctx.fillStyle = annexState.station.activated ? '#9bdcac' : '#d4c778';
    ctx.font = '700 12px ui-monospace, monospace';
    ctx.fillText(annexState.station.activated ? 'STATION CALIBRÉE' : 'STATION À CALIBRER', 492, 67);
    this.drawSinglePromptV71(ctx, this.statusPrompt());
  }

  drawSinglePromptV71(ctx, prompt) {
    if (!prompt) return;
    ctx.font = '700 13px ui-monospace, monospace';
    const width = Math.min(940, Math.max(360, ctx.measureText(prompt).width + 48));
    const x = (VIEW_WIDTH - width) / 2;
    ctx.fillStyle = 'rgba(2, 8, 7, .92)';
    ctx.fillRect(x, 662, width, 42);
    ctx.strokeStyle = '#93d2a3';
    ctx.strokeRect(x + 0.5, 662.5, width, 41);
    ctx.fillStyle = '#c8e8d0';
    ctx.textAlign = 'center';
    ctx.fillText(prompt.toUpperCase(), VIEW_WIDTH / 2, 688);
    ctx.textAlign = 'left';
  }

  drawAnnexTransitionV71(ctx) {
    const transition = this.annexTransitionV71;
    if (!transition) return;
    const annex = HUB_ANNEX_BY_ID_V71[transition.annexId];
    const eased = transition.progress * transition.progress * (3 - 2 * transition.progress);
    const cover = transition.direction === 'enter' ? eased : 1 - eased;
    ctx.save();
    ctx.fillStyle = `rgba(0, 3, 4, ${0.18 + cover * 0.78})`;
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    const shutter = VIEW_WIDTH * 0.5 * cover;
    ctx.fillStyle = '#050b0a';
    ctx.fillRect(0, 0, shutter, VIEW_HEIGHT);
    ctx.fillRect(VIEW_WIDTH - shutter, 0, shutter, VIEW_HEIGHT);
    ctx.strokeStyle = '#86a58f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(shutter, 0);
    ctx.lineTo(shutter, VIEW_HEIGHT);
    ctx.moveTo(VIEW_WIDTH - shutter, 0);
    ctx.lineTo(VIEW_WIDTH - shutter, VIEW_HEIGHT);
    ctx.stroke();
    ctx.fillStyle = '#cfe1d3';
    ctx.font = '700 16px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${annex.shortName} · SAS ${Math.round(transition.progress * 100)}%`, VIEW_WIDTH / 2, VIEW_HEIGHT / 2);
    ctx.textAlign = 'left';
    ctx.restore();
  }
}
