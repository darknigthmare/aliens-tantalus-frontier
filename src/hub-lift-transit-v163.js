import { HUB_DECKS, HUB_WORLD, getHubDoorBounds } from './hub-game.js';
import { buildHubDoorNetworkV58 } from './topology-coherence-v58.js';
import { getHubElevatorInteriorV142, HUB_ELEVATOR_SOURCE_V142 } from './hub-elevator-interior-v142.js';
import { resolveSpriteDrawableV134 } from './sprite-alpha-policy-v134.js';
import { HubGame as RoutineHubV62 } from './hub-v62-runtime.js';
import { getHubRecessedPortalV136 } from './hub-spatial-design-v136.js';
import { spreadNpcStationSpawnsV136 } from './npc-life-v136.js';
import { annexNpcDutiesV141, createAnnexNpcsV141 } from './hub-annex-npc-life-v141.js';

const SCHEMA = 163;
const SHAF = new Set(['hub-midship-lift', 'hub-aft-lift']);
const PHASES = new Set(['boarding', 'closing', 'travel', 'opening', 'returning']);
const finite = Number.isFinite;
const copy = value => value == null ? value : JSON.parse(JSON.stringify(value));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = t => t * t * (3 - 2 * t);
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const liftAt = (deck, shaft) => buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck).find(d => d.shaftId === shaft);
const floorPose = (x, facing = 1) => ({ x, y: HUB_WORLD.floorY - 92, w: 44, h: 92, facing });

export const HUB_LIFT_TRANSIT_V163 = Object.freeze({ schema: SCHEMA, floorY: HUB_WORLD.floorY,
  boardingSpeed: 90, closingSeconds: .65, openingSeconds: .65,
  minimumTravelSeconds: .8, secondsPerDeck: .65,
  coordinateHandoff: 'closed-native-leaves', scope: 'native-player-lift-journey' });

export function liftPhaseDurationV163(trip) {
  if (trip.phase === 'boarding') return Math.max(.2, Math.abs(trip.originX - trip.cabinX) / 60);
  if (['closing', 'opening', 'returning'].includes(trip.phase)) return trip.reducedMotion ? .12 : .65;
  return trip.reducedMotion ? .24 : .8 + Math.abs(trip.toDeck - trip.fromDeck) * .65;
}

export function liftPoseV163(trip) {
  const t = clamp(trip.elapsed / liftPhaseDurationV163(trip), 0, 1);
  const x = trip.phase === 'boarding' ? trip.originX + (trip.cabinX - trip.originX) * smooth(t) : trip.cabinX;
  return floorPose(x, trip.facing);
}

export function liftDoorProgressV163(trip) {
  const t = smooth(clamp(trip.elapsed / liftPhaseDurationV163(trip), 0, 1));
  return trip.phase === 'boarding' ? 1 : trip.phase === 'closing' ? 1 - t : ['opening', 'returning'].includes(trip.phase) ? t : 0;
}

/** A saved trip is tied to one real shaft, both native sockets, and its actual
 * current coordinate chart. No arbitrary deck/pose can become a lift arrival. */
export function normalizeHubLiftTransitV163(value) {
  const serial = value?.schema === SCHEMA && Number.isInteger(value.serial) && value.serial >= 0 && value.serial <= 1e6 ? value.serial : 0;
  const empty = { schema: SCHEMA, serial, trip: null };
  const t = value?.schema === SCHEMA && value.trip;
  if (!t || !SHAF.has(t.shaftId) || !PHASES.has(t.phase) || !Number.isInteger(t.id) || t.id !== serial || serial === 0
    || !Number.isInteger(t.fromDeck) || !Number.isInteger(t.toDeck) || t.fromDeck === t.toDeck
    || ![t.fromDeck, t.toDeck].every(d => d >= 0 && d < HUB_DECKS.length)
    || ![t.originX, t.cabinX, t.elapsed].every(finite) || t.elapsed < 0 || ![-1, 1].includes(t.facing)
    || typeof t.reducedMotion !== 'boolean') return empty;
  const source = liftAt(t.fromDeck, t.shaftId), destination = liftAt(t.toDeck, t.shaftId);
  if (!source || !destination || Math.abs(t.cabinX - (source.x - 22)) > .001
    || Math.abs(t.cabinX - (destination.x - 22)) > .001 || Math.abs(t.originX + 22 - source.x) >= 128
    || t.originX < 24 || t.originX > HUB_WORLD.width - 68 || t.elapsed > liftPhaseDurationV163(t) + 1e-7) return empty;
  return { schema: SCHEMA, serial, trip: { id: serial, shaftId: t.shaftId,
    fromDeck: t.fromDeck, toDeck: t.toDeck, originX: t.originX, cabinX: t.cabinX,
    phase: t.phase, elapsed: t.elapsed, facing: t.facing, reducedMotion: t.reducedMotion } };
}

export function createHubLiftTripV163(previous, { lift, deck, direction, wrap = false, player, reducedMotion = false } = {}) {
  const state = normalizeHubLiftTransitV163(previous);
  if (state.trip || !lift?.lift || !SHAF.has(lift.shaftId) || lift.deckIndex !== deck || ![-1, 1].includes(direction)
    || !player || player.alive === false || player.health <= 0 || player.w !== 44 || player.h !== 92
    || !player.grounded || Math.abs(player.y + player.h - HUB_WORLD.floorY) > .01
    || !finite(player.x) || Math.abs(player.x + 22 - lift.x) >= 128 || state.serial >= 1e6) return state;
  const toDeck = wrap ? (deck + 1) % HUB_DECKS.length : deck + direction;
  if (toDeck < 0 || toDeck >= HUB_DECKS.length || toDeck === deck || !lift.destinations?.some(d => d.deckIndex === toDeck && d.roomId)) return state;
  const facing = Math.abs(player.x - (lift.x - 22)) > .5 ? Math.sign(lift.x - 22 - player.x) : player.facing === -1 ? -1 : 1;
  return normalizeHubLiftTransitV163({ schema: SCHEMA, serial: state.serial + 1,
    trip: { id: state.serial + 1, shaftId: lift.shaftId, fromDeck: deck, toDeck,
      originX: player.x, cabinX: lift.x - 22, phase: 'boarding', elapsed: 0, facing, reducedMotion: Boolean(reducedMotion) } });
}

/** Consume one native frame, never strategy-clock hours or a background timer.
 * The caller must admit the destination before a covered chart handoff. */
export function advanceHubLiftTripV163(previous, delta, { sourceClear = true, arrivalClear = true } = {}) {
  const state = normalizeHubLiftTransitV163(previous), trip = state.trip;
  if (!trip || !finite(delta) || delta <= 0) return { state, handoff: false, complete: false, blocked: false };
  if (trip.phase === 'boarding' && !sourceClear || trip.phase === 'travel' && !arrivalClear)
    return { state, handoff: false, complete: false, blocked: true };
  const elapsed = Math.min(liftPhaseDurationV163(trip), trip.elapsed + Math.min(delta, .1));
  const next = { ...trip, elapsed };
  if (elapsed < liftPhaseDurationV163(trip)) return { state: { ...state, trip: next }, handoff: false, complete: false, blocked: false };
  if (['opening', 'returning'].includes(trip.phase)) return { state: { ...state, trip: null }, handoff: false, complete: true, blocked: false };
  const phase = trip.phase === 'boarding' ? 'closing' : trip.phase === 'closing' ? 'travel' : 'opening';
  return { state: { ...state, trip: { ...trip, phase, elapsed: 0 } }, handoff: trip.phase === 'travel', complete: false, blocked: false };
}

export function liftDestinationPeersV163(hub, deck) {
  if (deck === hub.state.deck) return hub.npcs || [];
  // The virtual createNpcs also transfers service ownership. An occupancy
  // query must not rebuild an off-screen deck or transfer a second body.
  const context = Object.create(hub);
  context.doorStates = buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck);
  // Match the shipped life factory's detached placement as well as its V62
  // timetable. Raw templates still contain annex visitors and overlapping
  // idle anchors that are never painted in the actual main-deck cohort.
  const annexIds = new Set(createAnnexNpcsV141(annexNpcDutiesV141(context.npcRoutineResolutionsV62, context),
    context.npcRoutineResolutionsV62).map(actor => actor.crewId));
  const peers = spreadNpcStationSpawnsV136(RoutineHubV62.prototype.createNpcs.call(context, deck)
    .filter(actor => !annexIds.has(actor.crewId)), HUB_DECKS[deck].rooms);
  const liveOwners = hub.getNpcAnnexServiceActorsV163 && hub.getNpcServiceActorV161 && hub.getNpcMedicalActorV162;
  const snapshot = liveOwners ? null : hub.getSnapshot();
  const owners = (liveOwners
    ? [hub.npcCirculationActorV158, hub.npcAnnexActorV159, hub.getNpcMedicalActorV162(),
      hub.getNpcServiceActorV161('idris-engine'), hub.getNpcServiceActorV161('leila-galley'),
      ...hub.getNpcAnnexServiceActorsV163(), ...(hub.getNpcServiceTrafficActorsV163?.() || []),
      ...(hub.getNpcInterdeckActorsV165?.() || []), ...(hub.getNpcStationRelayActorsV166?.() || [])]
    : [snapshot.npcCirculationV158?.actor, snapshot.npcAnnexCirculationV159?.actor,
      ...(snapshot.npcServiceTrafficV163?.actors || []),
      ...['npcServiceRoutesV161', 'npcMedicalRouteV162', 'npcAnnexRoutesV163']
        .flatMap(key => Object.values(snapshot[key]?.routes || {}).map(route => route.actor))]).filter(Boolean);
  const byCrew = new Map(peers.map(actor => [actor.crewId, actor]));
  for (const actor of owners) {
    byCrew.delete(actor.crewId);
    // Native live bodies carry a roomId, whereas their durable ledgers also
    // carry deck. Resolve the chart from the unique real room in either case.
    if (HUB_DECKS[deck].rooms.some(room => room.id === actor.roomId))
      byCrew.set(actor.crewId, { ...actor, w: 44, h: 92, alive: actor.alive !== false });
  }
  return [...byCrew.values()];
}

function passageClear(hub, box, deck, roomId) {
  const peers = liftDestinationPeersV163(hub, deck);
  const solids = deck === hub.state.deck ? hub.obstacles || [] : hub.createObstacles(deck);
  return !peers.some(p => p.alive !== false && p.roomId === roomId && overlaps(box, p))
    && !solids.some(p => p.collisionMode !== 'one-way-top' && overlaps(box, p));
}

export function getLiftOcclusionV163(hub, door, progress) {
  const bounds = hub.hubSpatialLiftsV136?.get(door.id)?.target
    || getHubRecessedPortalV136(getHubDoorBounds(door))?.target;
  return getHubElevatorInteriorV142(bounds, progress);
}

function drawLiftLeaves(ctx, image, model) {
  const m = model, bounds = m?.target;
  if (!m || !image?.complete || image.naturalWidth !== 187 || image.naturalHeight !== 191) return;
  const src = HUB_ELEVATOR_SOURCE_V142.aperture, b = m.opening, drawable = resolveSpriteDrawableV134(image);
  // Repaint only native frame/leaves above the intact actor. The cabin stays
  // behind it, with the same frontal projection and no opaque blue socket.
  ctx.save(); ctx.beginPath(); ctx.rect(bounds.x, bounds.y, bounds.w, bounds.h); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip('evenodd');
  ctx.drawImage(drawable, bounds.x, bounds.y, bounds.w, bounds.h); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip();
  ctx.drawImage(drawable, src.x, src.y, src.w / 2, src.h, b.x - m.leafTravel, b.y, b.w / 2, b.h);
  ctx.drawImage(drawable, src.x + src.w / 2, src.y, src.w / 2, src.h, b.x + b.w / 2 + m.leafTravel, b.y, b.w / 2, b.h);
  ctx.restore();
}

export function withHubLiftTransitV163(Base) {
  return class HubLiftTransitV163 extends Base {
    start(hubState = {}, ...args) {
      this.hubLiftTransitV163 = normalizeHubLiftTransitV163(hubState.hubLiftTransitV163);
      this.liftBlockedV163 = false;
      this.liftDepartureBlockedV163 = null;
      const trip = this.hubLiftTransitV163.trip;
      if (trip) {
        const deck = trip.phase === 'opening' ? trip.toDeck : trip.fromDeck;
        const pose = liftPoseV163(trip), lift = liftAt(deck, trip.shaftId);
        if (hubState.deck !== deck || hubState.roomId !== lift.roomId || Math.abs(hubState.positionX - pose.x) > 1
          || hubState.positionY != null && Math.abs(hubState.positionY - pose.y) > 1 || hubState.activeAnnexId || hubState.ventTransitV62) {
          this.hubLiftTransitV163.trip = null;
        } else hubState = { ...hubState, positionX: pose.x, positionY: pose.y, facing: trip.facing };
      }
      const result = super.start(hubState, ...args);
      if (this.editorPlaytest || this.isPortMeridienV90?.()) this.hubLiftTransitV163 = normalizeHubLiftTransitV163();
      this.applyLiftPoseV163();
      return result;
    }

    liftStateV163() { return this.hubLiftTransitV163 ||= normalizeHubLiftTransitV163(); }

    useLift(direction, wrap = false) {
      if (this.editorPlaytest || this.isPortMeridienV90?.()) return super.useLift(direction, wrap);
      if (!this.running || this.liftStateV163().trip || this.isAnnexActiveV71?.() || this.isVentActiveV62?.()
        || this.annexTransitionV71 || this.hubDoorClosingV142 || this.hubTrainingV132?.active) return false;
      const lift = this.nearestLift();
      if (lift && this.npcLiftCabinReservationV165?.(lift.shaftId)) return false;
      const state = createHubLiftTripV163(this.liftStateV163(), { lift, deck: this.state.deck, direction, wrap, player: this.player, reducedMotion: this.reducedMotion });
      if (!state.trip) return false;
      const pose = liftPoseV163({ ...state.trip, phase: 'closing', elapsed: 0 });
      const sweep = { ...pose, x: Math.min(pose.x, this.player.x), w: 44 + Math.abs(pose.x - this.player.x) };
      const destination = liftAt(state.trip.toDeck, lift.shaftId);
      if (!passageClear(this, floorPose(state.trip.cabinX), state.trip.toDeck, destination.roomId)) {
        this.liftDepartureBlockedV163 = { shaftId: lift.shaftId, toDeck: state.trip.toDeck };
        this.statusKey = ''; this.emitStatus(); return false;
      }
      if (!passageClear(this, sweep, this.state.deck, lift.roomId)) return false;
      this.liftDepartureBlockedV163 = null;
      this.hubLiftTransitV163 = state;
      this.keys.clear(); this.jumpQueued = 0; this.player.vx = 0; this.player.vy = 0;
      this.audio?.ui?.(); this.statusKey = ''; this.persist(); this.emitStatus();
      return true;
    }

    applyLiftPoseV163() {
      const trip = this.liftStateV163().trip;
      if (!trip || !this.player) return;
      const before = this.player.x, pose = liftPoseV163(trip);
      Object.assign(this.player, { x: pose.x, y: pose.y, facing: pose.facing, vy: 0, grounded: true, climbing: false });
      const lift = this.doorStates?.find(d => d.shaftId === trip.shaftId);
      if (lift) lift.progress = liftDoorProgressV163(trip);
      return pose.x - before;
    }

    update(delta) {
      const trip = this.liftStateV163().trip;
      if (!trip) return super.update(delta);
      if (!this.running || !finite(delta) || delta <= 0) return;
      this.keys.clear(); this.jumpQueued = 0; this.player.vx = 0; this.player.vy = 0;
      const result = super.update(delta);
      if (!this.running) return result;
      const current = liftPoseV163(trip), predicted = liftPoseV163({ ...trip, elapsed: Math.min(liftPhaseDurationV163(trip), trip.elapsed + Math.min(delta, .1)) });
      const source = liftAt(trip.fromDeck, trip.shaftId), destination = liftAt(trip.toDeck, trip.shaftId);
      const sweep = { ...current, x: Math.min(current.x, predicted.x), w: 44 + Math.abs(predicted.x - current.x) };
      const admission = advanceHubLiftTripV163(this.hubLiftTransitV163, delta, {
        sourceClear: trip.phase !== 'boarding' || passageClear(this, sweep, trip.fromDeck, source.roomId),
        arrivalClear: trip.phase !== 'travel' || passageClear(this, floorPose(trip.cabinX), trip.toDeck, destination.roomId)
      });
      this.liftBlockedV163 = admission.blocked;
      if (admission.handoff) {
        // Delegate the single chart change to every inherited native lift
        // owner, while both leaves are fully shut and the body is covered.
        // Native useLift persists synchronously. Publish the matching opening
        // ledger before it writes its new deck, never a destination/travel mix.
        const before = this.hubLiftTransitV163;
        this.hubLiftTransitV163 = admission.state;
        try { super.useLift(trip.toDeck - trip.fromDeck, false); }
        finally {
          if (this.state.deck === trip.fromDeck) this.hubLiftTransitV163 = before;
        }
        if (this.state.deck !== trip.toDeck || this.state.roomId !== destination.roomId) return result;
      }
      this.hubLiftTransitV163 = admission.state;
      const displacement = this.applyLiftPoseV163() || 0;
      this.player.vx = admission.state.trip?.phase === 'boarding' ? displacement / Math.min(delta, .1) : 0;
      if (admission.complete) { this.keys.clear(); this.player.vx = 0; }
      if (admission.handoff || admission.complete || admission.state.trip?.phase !== trip.phase) {
        this.statusKey = ''; this.persist(); this.emitStatus();
      }
      return result;
    }

    interact() {
      const state = this.liftStateV163();
      if (state.trip?.phase === 'travel') {
        // The destination may become occupied after boarding. Until the
        // covered native handoff, the cabin still belongs to the source deck:
        // reopen there without moving a peer, changing charts or rewinding.
        this.hubLiftTransitV163 = { ...state, trip: { ...state.trip, phase: 'returning', elapsed: 0 } };
        this.liftBlockedV163 = false; this.keys.clear(); this.player.vx = 0;
        this.statusKey = ''; this.persist(); this.emitStatus(); return;
      }
      if (state.trip?.phase === 'boarding') {
        // A person can stop approaching a cabin if a corridor becomes busy.
        // Keep the actual supported pose; cancelling never rewinds a walk.
        this.hubLiftTransitV163 = { ...state, trip: null };
        this.keys.clear(); this.jumpQueued = 0; this.player.vx = 0;
        this.statusKey = ''; this.persist(); this.emitStatus(); return;
      }
      if (state.trip) return;
      return super.interact();
    }
    fire(...args) { if (!this.liftStateV163().trip) return super.fire(...args); return false; }
    setControl(control, active) {
      if (this.liftStateV163().trip && control !== 'interact') return;
      return super.setControl(control, active);
    }

    statusPrompt() {
      const blocked = this.liftDepartureBlockedV163;
      if (blocked && !this.liftStateV163().trip && this.nearestLift()?.shaftId === blocked.shaftId)
        return HUB_DECKS[blocked.toDeck].name + ' · ARRIVÉE OCCUPÉE';
      return super.statusPrompt?.();
    }

    drawDoor(ctx, door, ...args) {
      const trip = this.liftStateV163().trip;
      if (trip && door.shaftId === trip.shaftId) door.progress = liftDoorProgressV163(trip);
      return super.drawDoor(ctx, door, ...args);
    }
    drawPlayer(ctx) {
      const result = super.drawPlayer(ctx), trip = this.liftStateV163().trip;
      if (!trip || trip.phase === 'boarding') return result;
      const door = this.doorStates?.find(d => d.shaftId === trip.shaftId);
      if (door) drawLiftLeaves(ctx, this.propImages?.get('/assets/openai/hub/props/lift-door.png'), getLiftOcclusionV163(this, door, liftDoorProgressV163(trip)));
      return result;
    }
    drawHud(ctx) {
      const result = super.drawHud(ctx), trip = this.liftStateV163().trip;
      if (!trip) return result;
      const labels = { boarding: 'EMBARQUEMENT', closing: 'FERMETURE', travel: 'TRAJET', opening: 'ARRIVÉE', returning: 'RETOUR AU PONT DE DÉPART' };
      ctx.save(); ctx.fillStyle = '#07120f'; ctx.fillRect(324, 642, 632, 54);
      ctx.strokeStyle = '#86ac94'; ctx.strokeRect(324.5, 642.5, 631, 53);
      ctx.textAlign = 'center'; ctx.font = '700 14px ui-monospace, monospace'; ctx.fillStyle = '#c2ddc8';
      ctx.fillText((this.liftBlockedV163 ? 'PASSAGE OCCUPÉ · CABINE EN ATTENTE' : labels[trip.phase])
        + (trip.phase === 'boarding' ? ' · E POUR ANNULER' : trip.phase === 'travel' ? ' · E POUR REVENIR' : ''), 640, 664);
      ctx.font = '12px ui-monospace, monospace';
      ctx.fillText(trip.phase === 'returning' ? HUB_DECKS[trip.fromDeck].name
        : HUB_DECKS[trip.fromDeck].name + ' → ' + HUB_DECKS[trip.toDeck].name, 640, 684);
      ctx.restore(); return result;
    }

    persist() {
      const original = this.onPersist;
      this.onPersist = patch => original({ ...patch, hubLiftTransitV163: copy(this.liftStateV163()) });
      try { return super.persist(); } finally { this.onPersist = original; }
    }
    getSnapshot() {
      return { ...super.getSnapshot(), hubLiftTransitV163: { ...copy(this.liftStateV163()),
        blocked: Boolean(this.liftBlockedV163), scope: HUB_LIFT_TRANSIT_V163.scope,
        coordinateHandoff: HUB_LIFT_TRANSIT_V163.coordinateHandoff,
        physicalNpcCrossDeckTravel: false } };
    }
  };
}
