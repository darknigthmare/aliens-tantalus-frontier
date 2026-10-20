import { drawMotionTrackerDisplayV160, motionTrackerActorBoundsV160 } from './motion-tracker-display-v160.js';

// Project gameplay in the actual side-view coordinate chart. The existing900u
// range is not a claimed M314 specification, metre conversion or3D sensor model.
// Presentation cues are compared with the official Alien:Isolation manual;
// that device is a different prop and does not certify an Aliens M314 replica.
export const MOTION_TRACKER_V160 = Object.freeze({ schema: 160, range: 900,
  sweepSeconds: 1.25, displaySeconds: 5, echoSeconds: 1.35, minimumSpeed: 4,
  maximumSampleGap: .25, maximumSpeed: 2200, maximumBodies: 128, maximumEchoes: 24,
  cooldown: 2.1, coneRadians: Math.PI / 3 });
const finite = (n, fallback = 0) => Number.isFinite(n) ? n : fallback;
const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
const list = n => Array.isArray(n) ? n : [];
const point = n => n && Number.isFinite(n.x) && Number.isFinite(n.y)
  && (n.depth === undefined || Number.isFinite(n.depth)) ? { x: n.x, y: n.y, depth: finite(n.depth) } : null;
const separation = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, finite(a.depth) - finite(b.depth));
const actorPoint = actor => actor && point({ x: actor.x + finite(actor.w) / 2,
  y: actor.y + finite(actor.h), depth: finite(actor.depth) });
const facing = actor => actor?.facing < 0 ? -1 : 1;

export function createMotionTrackerStateV160(context = '', time = 0) {
  return { schema: 160, context, time: Math.max(0, finite(time)), observations: new Map(), echoes: new Map(),
    serial: 0, activationSerial: 0, activeUntil: 0, startedAt: 0, sweepCycle: 0, sweepRadius: 0,
    scanOrigin: null, heading: 1, range: MOTION_TRACKER_V160.range, pingCount: 0, nextPingAt: 0 };
}

/** Real position deltas, not intention/vx or the observer's own movement. New
 * object generations, changed charts, long gaps and teleports start unobserved. */
export function observeMotionTrackerBodiesV160(state, { context, time, bodies = [] } = {}) {
  if (!Number.isFinite(time) || time < 0 || typeof context !== 'string') return state;
  if (state.context !== context || time < state.time) Object.assign(state, createMotionTrackerStateV160(context, time));
  const next = new Map();
  for (const body of bodies.slice(0, MOTION_TRACKER_V160.maximumBodies)) {
    const position = point(body?.position), entity = body?.entity;
    if (!position || !entity || typeof entity !== 'object' || body.active === false || body.context !== context) continue;
    const previous = state.observations.get(entity), dt = previous ? time - previous.time : 0;
    const displacement = previous ? separation(previous.position, position) : 0;
    const continuous = previous && dt > 0 && dt <= MOTION_TRACKER_V160.maximumSampleGap + 1e-8
      && displacement <= Math.max(120, MOTION_TRACKER_V160.maximumSpeed * dt);
    // Merely reading/re-observing an unchanged frame must not erase its sample.
    if (previous && dt === 0 && displacement === 0) { next.set(entity, previous); continue; }
    const speed = continuous ? displacement / dt : 0;
    next.set(entity, { entity, id: String(body.id || `motion-${previous?.serial || state.serial + 1}`),
      serial: previous?.serial || ++state.serial, position, time, speed,
      moving: Boolean(continuous && speed >= MOTION_TRACKER_V160.minimumSpeed), concealed: Boolean(body.concealed) });
    if (!continuous) state.echoes.delete(entity);
  }
  state.time = time; state.observations = next;
  for (const [entity, echo] of state.echoes) if (!next.has(entity) || time - echo.seenAt > MOTION_TRACKER_V160.echoSeconds)
    state.echoes.delete(entity);
  return state;
}

export function beginMotionTrackerPulseV160(state, observer, { range = MOTION_TRACKER_V160.range } = {}) {
  const origin = point(observer?.position);
  if (!origin) return false;
  state.activationSerial += 1; state.startedAt = state.time; state.activeUntil = state.time + MOTION_TRACKER_V160.displaySeconds;
  state.scanOrigin = origin; state.heading = observer.heading < 0 ? -1 : 1;
  state.range = clamp(finite(range, MOTION_TRACKER_V160.range), 1, 2400);
  state.sweepCycle = 0; state.sweepRadius = 0; state.echoes.clear(); state.nextPingAt = state.time + .2;
  return true;
}

export function advanceMotionTrackerSweepV160(state, observer) {
  const origin = point(observer?.position);
  if (!origin || state.time >= state.activeUntil || !state.activationSerial) { state.echoes.clear(); return; }
  const elapsed = Math.max(0, state.time - state.startedAt), cycle = Math.floor(elapsed / MOTION_TRACKER_V160.sweepSeconds);
  let previousRadius = state.sweepRadius;
  if (cycle !== state.sweepCycle) {
    state.sweepCycle = cycle; previousRadius = 0; state.scanOrigin = origin;
    state.heading = observer.heading < 0 ? -1 : 1;
  }
  state.sweepRadius = (elapsed / MOTION_TRACKER_V160.sweepSeconds - cycle) * state.range;
  for (const [entity, body] of state.observations) {
    if (!body.moving || state.time - body.time > MOTION_TRACKER_V160.maximumSampleGap) continue;
    const distance = separation(state.scanOrigin, body.position);
    if (distance > state.range || distance < previousRadius - 1e-7 || distance > state.sweepRadius + 1e-7) continue;
    state.echoes.set(entity, { id: body.id, serial: body.serial, position: { ...body.position },
      seenAt: state.time, concealed: body.concealed, cycle });
  }
  // Bound retained echoes as well as the public projection.
  if (state.echoes.size > MOTION_TRACKER_V160.maximumEchoes) {
    const nearest = [...state.echoes].sort((a, b) => separation(a[1].position, origin) - separation(b[1].position, origin))
      .slice(0, MOTION_TRACKER_V160.maximumEchoes);
    state.echoes = new Map(nearest);
  }
}

/** An echo is a measured past position. It never follows an unobserved body,
 * exposes a species/faction/boss flag, or fabricates a lateral3D coordinate. */
export function motionTrackerSnapshotV160(state, observer, { running = true, energy = null, cooldown = 0 } = {}) {
  const origin = point(observer?.position), heading = observer?.heading < 0 ? -1 : 1;
  const active = Boolean(origin && state.activationSerial && state.time < state.activeUntil && running);
  const contacts = active ? [...state.echoes.entries()].flatMap(([entity, echo]) => {
    const age = Math.max(0, state.time - echo.seenAt), distance = separation(origin, echo.position);
    if (age > MOTION_TRACKER_V160.echoSeconds || distance > state.range) return [];
    const dx = (echo.position.x - origin.x) * heading, dy = echo.position.y - origin.y;
    const depth = finite(echo.position.depth) - finite(origin.depth), bearing = Math.atan2(dy, dx);
    const sector = Math.abs(depth) > 12 ? 'depth' : dx < 0 ? 'rear'
      : Math.abs(bearing) <= MOTION_TRACKER_V160.coneRadians ? 'front' : dy < 0 ? 'above' : 'below';
    const body = state.observations.get(entity), currentMotion = Boolean(body?.moving && body.time === state.time);
    return [{ id: echo.id, serial: echo.serial, distance, dx, dy, depth, bearing, sector, age,
      x: echo.position.x, y: echo.position.y, alpha: clamp(1 - age / MOTION_TRACKER_V160.echoSeconds, 0, 1),
      currentMotion, concealed: echo.concealed, sampledAt: echo.seenAt }];
  }).sort((a, b) => a.distance - b.distance).slice(0, MOTION_TRACKER_V160.maximumEchoes) : [];
  const fresh = contacts.filter(contact => contact.currentMotion);
  return { schema: 160, active, time: state.time, activationSerial: state.activationSerial,
    remaining: active ? Math.max(0, state.activeUntil - state.time) : 0, range: state.range,
    sweep: active ? state.sweepRadius / state.range : 0, heading, contacts,
    nearestDistance: contacts[0]?.distance ?? null, currentMovement: fresh.length > 0,
    pingCount: state.pingCount, energy: Number.isFinite(energy) ? energy : null,
    cooldown: Math.max(0, finite(cooldown)), units: 'world-units', projection: 'side-view-cross-section',
    identityAvailable: false, factionAvailable: false, canonical1to1: false,
    scope: 'Current coordinate chart only; fading measured echoes, not live targets or a3D reconstruction.' };
}

export function motionTrackerPingIntervalV160(distance, range = MOTION_TRACKER_V160.range) {
  return .2 + 1.0 * clamp(finite(distance, range) / Math.max(1, range), 0, 1);
}

function directBodies(engine, observer, context, hub) {
  const annex = hub ? engine.currentAnnexV71?.()?.id || null : null;
  const natives = hub ? annex ? list(engine.activeAnnexNpcsV141?.()) : list(engine.npcs)
    : [...list(engine.activeSquadActors?.()), ...list(engine.forgeNpcsV158)];
  const actors = [...new Set([...list(engine.enemies), ...natives,
    ...(!hub && engine.coopEnabled && engine.coop !== observer ? [engine.coop] : []),
    ...(!hub && engine.player !== observer ? [engine.player] : []),
    ...(!hub ? list(engine.missionVentActorsListV62?.()) : [])])];
  const vents = !hub ? list(engine.createMissionVentContactOutputsV62?.(observer)) : [];
  const ventId = actor => actor === engine.player ? 'mission-player-v62' : actor === engine.coop ? 'mission-coop-v62'
    : actor?.squadMember ? `mission-ally-${actor.crewId || actor.id || 'unknown'}` : String(actor?.id || actor?.crewId || actor?.operatorId || '');
  return actors.flatMap(actor => {
    if (!actor || actor === observer || actor.dead || actor.inVehicle
      || actor.rearEntryV130 && actor.rearEntryV130.phase !== 'active'
      || hub && actor.deck !== undefined && actor.deck !== engine.state?.deck
      || hub && (annex ? actor.annexNativeV141 === false || actor.roomId && actor.roomId !== annex
        : actor.annexNativeV141)) return [];
    const vent = actor.ventTransit && vents.find(output => output.tracker.actorId === ventId(actor));
    // Concealment deliberately sets a live enemy alive=false/dormant=true.
    // Only the actual registered vent owner and its admitted previous life can
    // override those flags; an arbitrary/stale transit payload cannot do so.
    const liveVent = Boolean(!hub && vent && actor.ventConcealedV62
      && engine.missionVentActorsV62?.get(ventId(actor)) === actor
      && actor.ventRuntimePreviousV62?.alive === true && !(Number.isFinite(actor.health) && actor.health <= 0));
    if (actor.ventTransit && !liveVent || !liveVent && (actor.alive === false || actor.dormant)) return [];
    const position = vent ? point(vent.position) : actorPoint(actor);
    return position ? [{ entity: actor, id: ventId(actor) || String(actor.crewId || actor.id || 'body'),
      position, context, concealed: Boolean(vent) }] : [];
  });
}

function missionContext(engine) {
  return `mission:${engine.forgeSessionV141?.currentRoomId || engine.missionLevelRuntime?.signature || engine.resumeIdentity?.campaignId || 'current'}`;
}
function hubContext(engine) {
  return `hub:${engine.state?.deck ?? ''}:${engine.forgeSessionV141?.currentRoomId
    ? 'forge:' + engine.forgeSessionV141.currentRoomId : engine.currentAnnexV71?.()?.id || 'deck'}`;
}
function observerFor(engine, actor = engine.player) {
  const source = actor?.inVehicle && engine.vehicle?.active ? engine.vehicle : actor;
  return { position: actorPoint(source), heading: facing(actor) };
}
function observeEngine(engine, { hub = false, time, observer = engine.player } = {}) {
  const context = hub ? hubContext(engine) : missionContext(engine);
  const binding = hub ? engine.npcRoutineContextV62?.save || engine.state : engine.mission;
  const trackerBinding = hub ? engine.state : engine.tracker;
  if (!engine.motionTrackerStateV160 || engine.motionTrackerBindingV160 !== binding
    || engine.motionTrackerResourceBindingV160 !== trackerBinding) {
    engine.motionTrackerStateV160 = createMotionTrackerStateV160(context, time);
    engine.motionTrackerBindingV160 = binding; engine.motionTrackerResourceBindingV160 = trackerBinding;
  }
  observeMotionTrackerBodiesV160(engine.motionTrackerStateV160, { context, time,
    bodies: directBodies(engine, observer, context, hub) });
  return engine.motionTrackerStateV160;
}
function trackerPing(engine, state, actor, model) {
  const nearest = model.contacts.find(contact => contact.currentMotion);
  if (!nearest || state.time < state.nextPingAt) return;
  state.nextPingAt = state.time + motionTrackerPingIntervalV160(nearest.distance, state.range); state.pingCount += 1;
  // User volume does not change in-world stealth. It only mutes the local sound.
  if (engine.audio?.enabled !== false && engine.audio?.volumes?.master !== 0 && engine.audio?.volumes?.effects !== 0)
    engine.audio?.tracker?.();
  engine.emitEnemyNoiseV130?.(actor, 170, 'motion-tracker');
}

/** Hooks keep existing objective, campaign, personal-gear and energy contracts.
 * No old method receives a temporary/replaced enemy array. */
export function withMotionTrackerV160(Base) {
  if (Base.motionTrackerRuntimeV160) return Base;
  return class MotionTrackerMissionV160 extends Base {
    static motionTrackerRuntimeV160 = true;
    get motionTrackerOwnsHudV160() { return true; }
    start(options = {}) {
      this.motionTrackerStateV160 = null; this.motionTrackerBindingV160 = null;
      this.motionTrackerOperatorV160 = null;
      const result = super.start(options);
      observeEngine(this, { time: finite(this.mission?.elapsed) });
      return result && typeof this.getSnapshot === 'function' ? this.getSnapshot() : result;
    }
    activateTracker(actor = this.player) {
      // Q also changes HADAL buoyancy and the wing command in authored legacy
      // chapters. Those actions neither raise a detector nor spend its energy.
      if (this.isLegacyMissionV131?.() && this.legacyMissionV131.kind !== 'nostromo') return super.activateTracker(actor);
      if (!actor || actor.climbing || actor.ventTransit || !actor.inVehicle && actor.grounded === false
        || actor.reloading || actor.fireClock > 0 || actor.meleeClock > 0 || actor.toolUseClock > 0
        || actor.interactionClock > 0 || actor.v52HurtClock > 0 || actor.hurtClock > 0 || actor.shockClock > 0) return false;
      const accepted = super.activateTracker(actor);
      if (!accepted) return accepted;
      const state = observeEngine(this, { time: finite(this.mission?.elapsed), observer: actor });
      this.motionTrackerOperatorV160 = actor;
      const range = MOTION_TRACKER_V160.range + (actor.inVehicle && this.vehicle?.active ? Math.max(0, finite(this.vehicle.observeBonus)) : 0);
      beginMotionTrackerPulseV160(state, observerFor(this, actor), { range });
      this.tracker.contacts = [];
      this.emitEnemyNoiseV130?.(actor, 170, 'motion-tracker');
      return accepted;
    }
    update(delta) {
      const before = finite(this.mission?.elapsed), result = super.update(delta);
      if (!this.running || this.paused || this.forgeNarrativeOpenV156 || this.enemyAtlasLoadingPausedV65
        || this.userCasteLoadingV88 || this.mission?.state !== 'active' || !(this.mission.elapsed > before)) return result;
      const actor = this.motionTrackerOperatorV160 || this.player;
      const state = observeEngine(this, { time: this.mission.elapsed, observer: actor });
      if (!actor?.alive || actor.downed || actor.ventTransit || actor !== this.player && actor !== this.coop) {
        state.activeUntil = 0; state.echoes.clear();
      }
      advanceMotionTrackerSweepV160(state, observerFor(this, actor));
      const model = this.motionTrackerSnapshotV160();
      this.tracker.contacts = model.contacts.map(contact => ({ id: contact.id, x: contact.x, y: contact.y,
        distance: Math.round(contact.distance), age: contact.age, source: 'measured-motion-v160' }));
      if (model.active) trackerPing(this, state, actor, model);
      return result;
    }
    commitFieldActionV124(actor, task) {
      const result = super.commitFieldActionV124(actor, task);
      if (result && ['motion-pulse', 'deep-scan', 'drone-recon'].includes(task?.kind)) {
        const state = observeEngine(this, { time: finite(this.mission?.elapsed), observer: actor });
        this.motionTrackerOperatorV160 = actor;
        beginMotionTrackerPulseV160(state, observerFor(this, actor), { range: task.kind === 'drone-recon' ? 900 : 650 });
      }
      return result;
    }
    applyResumeState(raw) {
      const result = super.applyResumeState(raw);
      if (result?.applied) {
        this.motionTrackerStateV160 = null; this.motionTrackerBindingV160 = null;
        this.motionTrackerOperatorV160 = null; if (this.tracker) this.tracker.contacts = [];
      }
      return result;
    }
    motionTrackerSnapshotV160() {
      const actor = this.motionTrackerOperatorV160 || this.player;
      const context = missionContext(this), state = this.motionTrackerStateV160;
      const current = state && state.context === context && this.motionTrackerBindingV160 === this.mission
        && this.motionTrackerResourceBindingV160 === this.tracker ? state : createMotionTrackerStateV160(context, finite(this.mission?.elapsed));
      return motionTrackerSnapshotV160(current, observerFor(this, actor), {
        running: Boolean(this.running && this.mission?.state === 'active'),
        energy: this.tracker?.energy, cooldown: this.tracker?.cooldown });
    }
    drawHud(ctx) {
      super.drawHud(ctx);
      if (!this.forgeNarrativeOpenV156) drawMotionTrackerDisplayV160(ctx, this.motionTrackerSnapshotV160(), {
        reducedMotion: this.reducedMotion, viewportWidth: this.canvas?.getBoundingClientRect?.().width,
        vehicle: Boolean(this.vehicle?.occupied),
        actorScreenBounds: motionTrackerActorBoundsV160(this.player, this.camera) });
    }
    getSnapshot() { return { ...super.getSnapshot(), motionTrackerV160: this.motionTrackerSnapshotV160() }; }
    stop(...args) {
      if (this.motionTrackerStateV160) Object.assign(this.motionTrackerStateV160, createMotionTrackerStateV160());
      this.motionTrackerOperatorV160 = null; return super.stop(...args);
    }
  };
}

export function canUseHubMotionTrackerV160(hub) {
  const actor = hub.player;
  return Boolean(hub.running && actor?.alive !== false && actor?.health > 0 && !actor.downed
    && !actor.climbing && actor.grounded !== false && !actor.ventTransit && !hub.ventActorV62 && !actor.inVehicle
    && !(actor.shockClock > 0) && !(actor.v52HurtClock > 0) && !(actor.hurtClock > 0) && !(actor.toolUseClock > 0)
    && !(actor.fireClock > 0) && !hub.annexTransitionV71 && !hub.hubDoorClosingV142
    && !hub.refugeMovementLockedV87 && !hub.annexStateReadOnlyV87 && !hub.openingRepairV88
    && !hub.forgeNarrativeOpenV156 && !(hub.hubMotionTrackerCooldownV160 > 0));
}

/** Hub dotation: the detector has a session cooldown, not invented persistent
 * charges. Ordinary Q input must be routed here only outside vent traversal. */
export function withHubMotionTrackerV160(Base) {
  if (Base.hubMotionTrackerRuntimeV160) return Base;
  return class MotionTrackerHubV160 extends Base {
    static hubMotionTrackerRuntimeV160 = true;
    start(...args) {
      this.motionTrackerStateV160 = null; this.motionTrackerBindingV160 = null;
      this.hubMotionTrackerTimeV160 = 0; this.hubMotionTrackerCooldownV160 = 0;
      this.hubMotionTrackerToolActorV160 = null;
      const result = super.start(...args); observeEngine(this, { hub: true, time: this.hubMotionTrackerTimeV160 }); return result;
    }
    activateTracker() {
      if (!canUseHubMotionTrackerV160(this)) return false;
      const state = observeEngine(this, { hub: true, time: this.hubMotionTrackerTimeV160 });
      beginMotionTrackerPulseV160(state, observerFor(this)); this.hubMotionTrackerCooldownV160 = MOTION_TRACKER_V160.cooldown;
      this.player.toolId = 'motion-tracker'; this.player.toolUseClock = .7;
      this.hubMotionTrackerToolActorV160 = this.player; this.audio?.tracker?.(); return true;
    }
    fire(...args) {
      return this.hubMotionTrackerToolActorV160?.toolUseClock > 0 ? false : super.fire(...args);
    }
    update(delta) {
      const wasRunning = this.running, result = super.update(delta);
      if (!wasRunning || !this.running || this.forgeNarrativeOpenV156) return result;
      const dt = clamp(finite(delta), 0, MOTION_TRACKER_V160.maximumSampleGap);
      this.hubMotionTrackerTimeV160 += dt;
      this.hubMotionTrackerCooldownV160 = Math.max(0, this.hubMotionTrackerCooldownV160 - dt);
      if (this.hubMotionTrackerToolActorV160) {
        this.hubMotionTrackerToolActorV160.toolUseClock = Math.max(0, finite(this.hubMotionTrackerToolActorV160.toolUseClock) - dt);
        if (!this.hubMotionTrackerToolActorV160.toolUseClock) this.hubMotionTrackerToolActorV160 = null;
      }
      const state = observeEngine(this, { hub: true, time: this.hubMotionTrackerTimeV160 });
      if (this.annexTransitionV71 || this.ventActorV62 || this.player?.ventTransit || this.player?.alive === false) {
        state.activeUntil = 0; state.echoes.clear();
      }
      advanceMotionTrackerSweepV160(state, observerFor(this));
      const model = this.motionTrackerSnapshotV160(); if (model.active) trackerPing(this, state, this.player, model);
      return result;
    }
    motionTrackerSnapshotV160() {
      const context = hubContext(this), state = this.motionTrackerStateV160;
      const current = state && state.context === context && this.motionTrackerResourceBindingV160 === this.state
        ? state : createMotionTrackerStateV160(context, finite(this.hubMotionTrackerTimeV160));
      return motionTrackerSnapshotV160(current, observerFor(this), { running: Boolean(this.running), cooldown: this.hubMotionTrackerCooldownV160 });
    }
    drawHud(ctx) {
      super.drawHud(ctx);
      if (!this.currentAnnexV71?.()) this.drawMotionTrackerDisplayV160(ctx);
    }
    drawAnnexHudV71(ctx) { super.drawAnnexHudV71(ctx); this.drawMotionTrackerDisplayV160(ctx); }
    drawMotionTrackerDisplayV160(ctx) {
      if (!this.forgeNarrativeOpenV156) drawMotionTrackerDisplayV160(ctx, this.motionTrackerSnapshotV160(), {
        reducedMotion: this.reducedMotion, viewportWidth: this.canvas?.getBoundingClientRect?.().width,
        actorScreenBounds: motionTrackerActorBoundsV160(this.player,
          this.currentAnnexV71?.() ? this.annexCameraV71 : this.camera) });
    }
    getSnapshot() { return { ...super.getSnapshot(), motionTrackerV160: this.motionTrackerSnapshotV160() }; }
    stop(...args) {
      if (this.hubMotionTrackerToolActorV160) this.hubMotionTrackerToolActorV160.toolUseClock = 0;
      this.hubMotionTrackerToolActorV160 = null;
      if (this.motionTrackerStateV160) Object.assign(this.motionTrackerStateV160, createMotionTrackerStateV160());
      return super.stop(...args);
    }
  };
}
