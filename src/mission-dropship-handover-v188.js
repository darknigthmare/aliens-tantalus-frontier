// V188 — in-level dropship handover (owner request, 2026-11-15): the UD-4L
// lands inside the level at insertion and comes back at extraction, as staged
// action instead of text. The out-of-level cinematic (drop bay, orbit, entry,
// cockpit screens) belongs to another layer of the app; this layer starts when
// the mission is on screen.
//
// Contract, read in start(): options.insertionHandoverV188 =
//   { mode: 'foot'|'apc', placeType: 'atmosphere'|'airless'|'space', dropshipId: 'ud4l', short }
// Absent (old flow, tests, Forge) → the mission starts exactly as before.
//
// Insertion: descend → settle (dust / rain / airless debris) → ramp → marines
// walk down (foot) or the M577 is lowered from the belly and drives out (apc)
// → control → the ship lifts off behind the player. 'space': docking collar,
// seal, hatch cycle, marines step through. Full ≈ 8–9 s, short ≈ 3.5 s.
// While control is withheld the simulation below this layer does not run:
// mission time stands still, so no enemy moves or attacks and the insertion
// grace (insertion-safe-zone-v188.js, counted on mission time) only starts
// when control is given.
//
// Extraction: the mission-complete event of any mode is held, the ship (or the
// docking airlock) comes to the extraction point, the marines or the APC board
// under covering fire, the ship lifts, then
//   onEvent({ type: 'extraction-boarding-complete-v188', mode, placeType })
// and the held mission-complete event. A mode with deferred accounting settles
// its canonical result after the fight; rewards and debrief are delivered once.
//
// Resume: a capture taken mid-landing records the post-landing poses (no
// replay); a capture taken mid-boarding records the boarding and its held
// event, so the resumed mission finishes the boarding and pays once.
import { UD4L_FRAME_V188, UD4L_RAMP_FOOT_V188, LEVEL_DROPSHIP_SCALE_V188, ud4lToWorldV188, drawUd4lHullV188, drawUd4lRampV188,
  drawStatusBeaconV188, drawM577TransportV188, drawHoistV188, drawDockingCollarV188, drawDownwashParticlesV188,
  drawCoveringFireV188, drawHandoverLetterboxV188, levelDropshipSlotV188 } from './level-dropship-slots-v188.js';
import { M577_SCALE_V188, applyM577MissionScaleV188, m577HitboxRuntimeV188, m577AnchorsV188, drawM577ScaledPlaceholderV188, isM577VehicleV188,
  m577LanesV188, m577ParkingV188, m577ClampToLaneV188, m577SideDoorXV188 } from './m577-scale-v188.js';
import { resolveCombatMuzzleV83 } from './combat-aim-v83.js';

const MODES = ['foot', 'apc'], PLACES = ['atmosphere', 'airless', 'space'];
const MECHA = ['special-titan-v131', 'special-z110-v131'];
const LEGACY = { 'special-nostromo-v131': 'Nostromo chronicle: a 2122 commercial tug, no Colonial Marines dropship in its period',
  'special-black-abyss-v131': 'underwater swim mission: the operator starts submerged, no landing zone',
  'special-broodstorm-v131': 'free flight: the player already flies the Cheyenne' };
const MECHA_REASON = 'mecha arena duel: the operator starts in a mecha the UD-4L cannot carry at project scale';
/** Mission kinds that keep their own arrival or departure, with the reason. */
export const DROPSHIP_HANDOVER_SKIPS_V188 = Object.freeze({
  insertion: Object.freeze({
    'special-narrative-qz17': 'QZ-17 keeps its authored docks insertion (story cinematic) and its authored encounters',
    'special-archive-relay': 'QZ-18 keeps its authored relay insertion shots',
    'special-black-cocoon': 'the operator wakes cocooned in resin: the capture is the authored insertion',
    ...Object.fromEntries(MECHA.map(id => [id, MECHA_REASON])), ...LEGACY }),
  extraction: Object.freeze({ ...Object.fromEntries(MECHA.map(id => [id, MECHA_REASON])), ...LEGACY })
});

// Seconds of each phase, full version; the short version scales them.
export const DROPSHIP_HANDOVER_PLANS_V188 = Object.freeze({
  landing: Object.freeze({ short: .4, block: [['descend', 3.4], ['settle', .8], ['ramp', 1], ['disembark', 3.2]], after: [['close', .6], ['liftoff', 2]] }),
  docking: Object.freeze({ short: .45, block: [['seal', 2], ['pressurize', 1.2], ['hatch', 1.4], ['step', 3.6]], after: [['hatch-close', 1]] }),
  boarding: Object.freeze({ short: .4, block: [['arrive', 3.2], ['ramp', 1], ['board', 3], ['close', .7], ['lift', 1.8]], after: [] }),
  undocking: Object.freeze({ short: .45, block: [['seal', 2], ['hatch', 1.4], ['board', 3], ['close', 1.2], ['undock', 1]], after: [] })
});
const SKIP_KEYS = new Set(['KeyE', 'Escape', 'Enter']);
/**
 * [PROPOSÉ] Defended boarding (gameplay gaps V188): during the extraction boarding the enemies keep moving
 * and attacking, the chin turret and the marine covering from the bay really hit (damage per tracer, reach
 * from the gun), and the marines take damage but never fall below `floorHealth` while they board: the
 * extraction already succeeded (mission-complete is held until boarding ends), so a death here could not be
 * honoured without contradicting it. Boarded marines are out of reach.
 */
export const DEFENDED_BOARDING_V188 = Object.freeze({ tracerDamage: 14, reach: 900, floorHealth: 1 });
/**
 * [PROPOSÉ] Owner decision 2026-11-22 (round 2): the M577 under the belly is the M577 to scale (449 × 112 px, 140 px with
 * its turret). On its skids the UD-4L belly is 36 px above the ground: an 8.8 m hull cannot hang or drive under it there.
 * In 'apc' mode the ship therefore holds a hover (`hover` px, skids clear of the hull) while the M577 is lowered
 * (its turret recessed `recess` px into the bay) or hoisted, and the lowered M577 rolls at most `drive` px inside its
 * floor lane (m577-scale-v188.js: no lift cabin, door or level edge crossed). The transport M577 (the squad rides it
 * down; the mission's own M577 is parked in the level) backs under the belly and is hoisted again before lift-off.
 */
export const M577_DROP_V188 = Object.freeze({ status: 'PROPOSÉ', hover: 150, recess: 20, drive: 220 });
const SILENT_DURING_BOARDING = new Set(['mission-complete', 'mission-failed', 'objective-failed', 'player-down', 'squad-down', 'squad-lost']);

export function normalizeHandoverOptionV188(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  return Object.freeze({ mode: MODES.includes(raw.mode) ? raw.mode : 'foot', placeType: PLACES.includes(raw.placeType) ? raw.placeType : 'atmosphere',
    dropshipId: typeof raw.dropshipId === 'string' && raw.dropshipId ? raw.dropshipId.slice(0, 40) : 'ud4l', short: raw.short === true });
}
/** null when the option is absent or the start is not a native mission (Forge, editor). */
export function dropshipHandoverPolicyV188(options = {}) {
  const option = normalizeHandoverOptionV188(options.insertionHandoverV188);
  if (!option || !options.missionLevel || options.editorProject || options.forgePlaytest || options.forgeSessionV141) return null;
  const id = options.campaign?.id || options.campaignId || '';
  return Object.freeze({ ...option, campaignId: id,
    insertion: !DROPSHIP_HANDOVER_SKIPS_V188.insertion[id], extraction: !DROPSHIP_HANDOVER_SKIPS_V188.extraction[id] });
}
/** App rule (V188 cinematic contract): the M577 rides only for vehicle 001/002, on a
 *  colony-multiroute or planet-exterior template, never in 'space'. Otherwise 'foot'. */
export const APC_HANDOVER_TEMPLATES_V188 = Object.freeze(['colony-multiroute', 'planet-exterior']);
/** Owner decision 2026-11-22: no M577 in the Port-Méridien streets of C1, C3, C4 (colony-mission-levels-v188.js). */
export const APC_HANDOVER_EXCLUDED_CAMPAIGNS_V188 = Object.freeze(['colony-c1', 'colony-c3', 'colony-c4']);
export function apcHandoverAdmissibleV188({ placeType, templateId, vehicleId, campaignId = null } = {}) {
  return placeType !== 'space' && APC_HANDOVER_TEMPLATES_V188.includes(templateId) && /^vehicle-00[12]-/.test(String(vehicleId || ''))
    && !APC_HANDOVER_EXCLUDED_CAMPAIGNS_V188.includes(campaignId);
}
export function buildHandoverPlanV188(name, short = false) {
  const plan = DROPSHIP_HANDOVER_PLANS_V188[name], scale = short ? plan.short : 1;
  let at = 0;
  const phases = [...plan.block, ...plan.after].map(([id, seconds], index) => {
    const start = at; at += seconds * scale; return Object.freeze({ id, start, end: at, blocking: index < plan.block.length });
  });
  return { phases, controlAt: phases.filter(entry => entry.blocking).at(-1).end, total: at };
}
const phaseAt = (seq, t) => {
  const phase = seq.phases.find(entry => t < entry.end) || seq.phases.at(-1);
  return { id: phase.id, p: clamp01((t - phase.start) / Math.max(1e-6, phase.end - phase.start)), phase };
};
const phaseEnd = (seq, id) => seq.phases.find(entry => entry.id === id)?.end ?? 0;
const phaseStart = (seq, id) => seq.phases.find(entry => entry.id === id)?.start ?? 0;
const clamp01 = value => Math.max(0, Math.min(1, value));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ease = u => u < .5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
const finite = value => Number.isFinite(value);
const centreX = actor => actor.x + actor.w / 2;
const feetY = actor => actor.y + actor.h;
const lang = () => globalThis.document?.documentElement?.lang === 'en' ? 'en' : 'fr';
const text = (fr, en) => lang() === 'en' ? en : fr;
const isApcVehicle = vehicle => Boolean(vehicle?.active && !vehicle.destroyed && /m577|apc/i.test(`${vehicle.id || ''} ${vehicle.name || ''}`));
const pointAlong = (points, u) => {
  const lengths = points.slice(1).map((point, i) => Math.hypot(point.x - points[i].x, point.y - points[i].y));
  const total = lengths.reduce((a, b) => a + b, 0);
  if (!(total > 0)) return { ...points.at(-1), dx: 0 };
  let target = clamp01(u) * total;
  for (let i = 0; i < lengths.length; i++) {
    if (target <= lengths[i] || i === lengths.length - 1) {
      const k = lengths[i] ? clamp01(target / lengths[i]) : 1, a = points[i], b = points[i + 1];
      return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, dx: Math.sign(b.x - a.x), total };
    }
    target -= lengths[i];
  }
  return { ...points.at(-1), dx: 0, total };
};

let hullImageV188 = null;
function hullImage() {
  if (hullImageV188 || typeof globalThis.Image !== 'function') return hullImageV188;
  try { hullImageV188 = new globalThis.Image(); hullImageV188.decoding = 'async'; hullImageV188.src = levelDropshipSlotV188('level-ud4l-hull').reuse; } catch { hullImageV188 = null; }
  return hullImageV188;
}

export function withMissionDropshipHandoverV188(Base) {
  if (Base.missionDropshipHandoverV188) return Base;
  return class MissionDropshipHandoverV188 extends Base {
    static missionDropshipHandoverV188 = true;

    start(options = {}) {
      this.handoverV188 = null; this.handoverDepartedV188 = false; this.handoverExtractedV188 = false;
      this.handoverTerminalPosesV188 = null;
      this.handoverParticlesV188 = []; this.handoverShakeV188 = 0;
      let policy = dropshipHandoverPolicyV188(options);
      this.handoverConfigV188 = policy;
      this.installHandoverRoutesV188();
      this.m577LaneV188 = null; this.m577ParkingV188 = null;
      const result = super.start(options);
      this.applyM577OrdinaryScaleV188(options);
      if (policy?.mode === 'apc' && !apcHandoverAdmissibleV188({ placeType: policy.placeType, templateId: options.missionLevel?.templateId,
        vehicleId: options.vehicle?.id || (this.apcConvoyActiveV121 ? this.vehicle?.id : ''), campaignId: policy.campaignId })) {
        policy = Object.freeze({ ...policy, mode: 'foot', requestedMode: 'apc' }); // mismatch with the carried-M577 rule: on foot
        this.handoverConfigV188 = policy;
      }
      const access = options.accessibility || {};
      this.handoverMotionV188 = { reduced: Boolean(access.reducedMotion || this.accessibilityRuntime?.reducedMotion),
        shake: !access.reducedMotion && access.screenShake !== false && access.screenShake !== 0 && access.screenShake !== 'off' };
      this.handoverWeatherV188 = policy?.placeType === 'airless' ? 'debris'
        : /storm|rain/i.test(String(options.world?.atmosphere || '')) || this.missionLevelVisualState?.storm ? 'rain' : 'dust';
      const resumed = this.lastResumeResult?.applied === true, saved = resumed ? options.resumeState?.dropshipHandoverV188 : null;
      const key = [options.operationId || '', options.campaign?.id || '', options.seed ?? '', options.missionLevel?.signature || ''].join('|');
      this.handoverLandedKeysV188 ||= new Set();
      if (saved?.boarding && typeof saved.boarding === 'object' && this.mission?.state === 'complete' && saved.boarding.event) {
        // A resumed boarding is finished whatever the launch flow: its held event is still owed.
        this.beginExtractionV188(saved.boarding.event, normalizeHandoverOptionV188(saved.boarding) || policy, Number(saved.boarding.t) || 0);
      } else if (saved?.schema === 188 && saved.extracted === true && saved.boarding === null && this.mission?.state === 'complete') {
        // A terminal checkpoint already delivered its event. Keep the marines
        // aboard without replaying boarding, rewards or the ascent cinematic.
        this.handoverDepartedV188 = true; this.handoverExtractedV188 = true;
      } else if (policy?.insertion && !resumed && this.mission?.state === 'active' && !this.handoverLandedKeysV188.has(key) && this.player) {
        this.handoverLandedKeysV188.add(key); // a retry of the same deployment never lands twice
        this.beginInsertionV188(policy);
      }
      return result;
    }

    installHandoverRoutesV188() {
      if (this.handoverSinkV188 === undefined) {
        this.handoverSinkV188 = this.onEvent;
        this.onEvent = event => this.routeHandoverEventV188(event);
      }
      if (!this.handoverKeysBoundV188 && typeof globalThis.addEventListener === 'function') {
        this.handoverKeysBoundV188 = true;
        globalThis.addEventListener('keydown', event => {
          if (!this.running || event.repeat || !SKIP_KEYS.has(event.code) || !this.handoverV188?.blocking) return;
          if (this.canRouteGameplayKey && !this.canRouteGameplayKey(event)) return;
          event.preventDefault?.();
          this.skipDropshipHandoverV188();
        });
      }
    }
    routeHandoverEventV188(event) {
      const sink = this.handoverSinkV188;
      if (event?.type === 'mission-complete' && this.handoverConfigV188?.extraction && !this.handoverExtractedV188
        && this.handoverV188?.kind !== 'extraction' && this.mission?.state !== 'failed') {
        let held = event; try { held = structuredClone(event); } catch {}
        this.beginExtractionV188(held, this.handoverConfigV188, 0);
        return undefined;
      }
      return typeof sink === 'function' ? sink(event) : undefined;
    }

    dropshipHandoverBlocksV188() { return Boolean(this.handoverV188?.blocking); }
    handoverMarinesV188() {
      const squad = typeof this.activeSquadActors === 'function' ? this.activeSquadActors() : [];
      return [this.player, this.coopEnabled ? this.coop : null, ...(Array.isArray(squad) ? squad : [])]
        .filter((actor, index, list) => actor && list.indexOf(actor) === index && actor.alive !== false
          && finite(actor.x) && finite(actor.y) && finite(actor.w) && finite(actor.h));
    }
    handoverBoundsV188() { return { w: this.missionLevelBounds?.width || 6200, h: this.missionLevelBounds?.height || 1080 }; }

    // —— Insertion ——
    beginInsertionV188(config) {
      const style = config.placeType === 'space' ? 'dock' : 'ship';
      const plan = buildHandoverPlanV188(style === 'dock' ? 'docking' : 'landing', config.short);
      this.handoverV188 = { kind: 'insertion', style, mode: config.mode, placeType: config.placeType, short: config.short,
        ...plan, t: 0, blocking: true, resolved: false, cues: new Set(), hidden: new Set(), fireClock: 0 };
      this.onEvent?.({ type: 'insertion-handover-started-v188', mode: config.mode, placeType: config.placeType, short: config.short });
    }
    resolveInsertionV188(seq) {
      if (seq.resolved) return; seq.resolved = true;
      const player = this.player, groundY = feetY(player), spawn = centreX(player);
      seq.groundY = groundY; seq.dir = 1;
      seq.actors = this.handoverMarinesV188().map((actor, index) => ({ actor, index, final: { x: actor.x, y: actor.y, facing: actor.facing || 1 } }));
      const vehicle = this.vehicle;
      seq.ownVehicle = seq.style === 'ship' && seq.mode === 'apc' && Boolean(player.inVehicle) && isApcVehicle(vehicle);
      if (seq.ownVehicle) seq.vehicleFinal = { x: vehicle.x, y: vehicle.y };
      const bounds = this.handoverBoundsV188();
      if (seq.style === 'dock') {
        seq.collar = { x: clamp(spawn - 96, 80, bounds.w - 80), floorY: groundY };
        for (const entry of seq.actors) entry.path = [{ x: seq.collar.x, y: feetY(entry.actor) }, { x: centreX(entry.actor), y: feetY(entry.actor) }];
      } else if (seq.mode === 'apc') {
        // The M577 rides in the belly bay (Aliens, 1986) and is lowered on its hoist.
        const facing = seq.ownVehicle ? (vehicle.facing || 1) : 1, w = seq.ownVehicle ? vehicle.w : LEVEL_DROPSHIP_SCALE_V188.m577.w;
        // The 8.8 m hull stays on its floor lane (no lift cabin, door or level edge crossed): lowered and final points clamp to it.
        const lane = seq.ownVehicle && this.m577LaneV188 ? this.m577LaneV188 : this.m577LaneAtV188(groundY, spawn, w);
        const inLane = c => lane ? m577ClampToLaneV188(c - w / 2, lane, w) + w / 2 : c;
        const finalCentre = inLane(seq.ownVehicle ? vehicle.x + vehicle.w / 2 : spawn + 140);
        const lowerCentre = inLane(clamp(finalCentre - facing * M577_DROP_V188.drive, this.camera.x + 160, this.camera.x + 1120));
        seq.m577Lane = lane;
        seq.dir = facing > 0 ? 1 : -1;
        seq.ship = { tailX: lowerCentre + seq.dir * UD4L_FRAME_V188.belly.x, groundY, dir: seq.dir, lift: 0, gear: 1 };
        seq.apc = { own: seq.ownVehicle, facing, w, lowerX: lowerCentre - w / 2, finalX: finalCentre - w / 2, x: lowerCentre - w / 2,
          drop: 0, visible: true, wheel: 0 };
        const rear = finalCentre - facing * w / 2;
        for (const entry of seq.actors) {
          if (entry.actor === player && seq.ownVehicle) { entry.path = null; continue; }
          entry.path = [{ x: rear, y: groundY }, { x: centreX(entry.actor), y: feetY(entry.actor) }];
        }
      } else {
        // Ramp foot 60 px behind the insertion point, the hull (870 px, true
        // scale, never scaled down) behind it. Near the level start there is no
        // room behind the marines: the ship then lands ahead of them, ramp
        // towards them, and the marines step down backwards into their lane.
        // Where neither side has 870 px the hull runs past the level edge.
        const behind = spawn - 60 + UD4L_RAMP_FOOT_V188 - UD4L_FRAME_V188.length, ahead = spawn + 60 - UD4L_RAMP_FOOT_V188 + UD4L_FRAME_V188.length;
        seq.dir = behind >= 0 || ahead > bounds.w ? 1 : -1;
        seq.ship = { tailX: spawn - seq.dir * 60 + seq.dir * UD4L_RAMP_FOOT_V188, groundY, dir: seq.dir, lift: 0, gear: 1 };
        const hinge = ud4lToWorldV188(seq.ship, UD4L_FRAME_V188.hinge), foot = ud4lToWorldV188(seq.ship, { x: UD4L_RAMP_FOOT_V188, y: 0 });
        for (const entry of seq.actors) entry.path = [hinge, foot, { x: centreX(entry.actor), y: feetY(entry.actor) }];
      }
      for (const entry of seq.actors) if (entry.path) seq.hidden.add(entry.actor);
      // Camera hold: frame the landing zone and the marines' lane, then ease to
      // the gameplay framing (player 430 px from the left, as in the base update).
      const lane = seq.ship ? (seq.ship.tailX - seq.dir * 300 + spawn) / 2 : spawn;
      seq.camFrom = { x: clamp(lane - 640, 0, Math.max(0, bounds.w - 1280)), y: clamp(player.y - 420, 0, Math.max(0, bounds.h - 720)) };
      seq.camTo = { x: clamp(spawn - 430, 0, Math.max(0, bounds.w - 1280)), y: seq.camFrom.y };
      this.camera.x = seq.camFrom.x; this.camera.y = seq.camFrom.y;
    }
    placeInsertionActorsV188(seq) {
      const window = seq.style === 'dock' ? 'step' : 'disembark', start = phaseStart(seq, window), end = phaseEnd(seq, window);
      const exitStart = seq.mode === 'apc' && seq.style === 'ship' ? start + (end - start) * .685 : start;
      const span = end - exitStart, count = seq.actors.filter(entry => entry.path).length;
      const stagger = count > 1 ? Math.min(.45, span * .4 / (count - 1)) : 0, walk = span - stagger * Math.max(0, count - 1);
      let order = 0;
      for (const entry of seq.actors) {
        if (!entry.path) continue;
        const u = (seq.t - exitStart - stagger * order++) / Math.max(.05, walk), actor = entry.actor;
        if (u <= 0) { seq.hidden.add(actor); continue; }
        seq.hidden.delete(actor);
        const at = pointAlong(entry.path, ease(clamp01(u)));
        actor.x = at.x - actor.w / 2; actor.y = at.y - actor.h; actor.vy = 0; actor.grounded = true;
        actor.vx = u < 1 ? at.dx * Math.max(90, (at.total || 0) / walk) : 0;
        if (u < 1 && at.dx) actor.facing = at.dx; else { actor.facing = entry.final.facing; actor.x = entry.final.x; actor.y = entry.final.y; }
      }
    }
    /** The floor lane of a scaled M577 standing at feet line `feetY` near `x` (null when none holds the hull). */
    m577LaneAtV188(feetY, x, w = M577_SCALE_V188.w) {
      const bounds = this.handoverBoundsV188(), far = lane => Math.min(Math.abs(lane.x0 - x), Math.abs(lane.x1 - x));
      const lanes = m577LanesV188({ platforms: this.platforms, lifts: this.lifts, walls: this.walls, feetY, width: bounds.w }).filter(lane => lane.x1 - lane.x0 >= w + 16);
      return lanes.find(lane => x >= lane.x0 && x <= lane.x1) || [...lanes].sort((a, b) => far(a) - far(b))[0] || null;
    }
    giveControlV188(seq, skipped) {
      for (const entry of seq.actors || []) Object.assign(entry.actor, { x: entry.final.x, y: entry.final.y, facing: entry.final.facing, vx: 0, vy: 0 });
      if (seq.ownVehicle && seq.vehicleFinal) Object.assign(this.vehicle, seq.vehicleFinal, { vx: 0 });
      seq.hidden.clear(); seq.blocking = false; seq.t = Math.max(seq.t, seq.controlAt);
      if (skipped || !(seq.total > seq.controlAt)) this.handoverV188 = null;
      if (seq.apc && !seq.apc.own) seq.apc.leaving = true;
      this.onEvent?.({ type: 'insertion-handover-complete-v188', mode: seq.mode, placeType: seq.placeType, skipped: Boolean(skipped) });
    }

    // —— Extraction ——
    beginExtractionV188(event, config, t = 0) {
      const placeType = PLACES.includes(config?.placeType) ? config.placeType : 'atmosphere';
      const style = placeType === 'space' ? 'dock' : 'ship';
      const plan = buildHandoverPlanV188(style === 'dock' ? 'undocking' : 'boarding', config?.short === true);
      this.handoverV188 = { kind: 'extraction', style, mode: MODES.includes(config?.mode) ? config.mode : 'foot', placeType, short: config?.short === true,
        ...plan, t: clamp(t, 0, phaseEnd({ phases: plan.phases }, style === 'dock' ? 'seal' : 'arrive')), blocking: true, resolved: false,
        cues: new Set(), hidden: new Set(), event, fireClock: 0, tracers: [] };
    }
    resolveExtractionV188(seq) {
      if (seq.resolved) return; seq.resolved = true;
      const player = this.player, target = this.objective && finite(this.objective.x) ? this.objective : player;
      const footX = target.x + (target.w || 0) / 2, groundY = target === player ? feetY(player) : target.y + (target.h || 0);
      seq.dir = Math.sign(centreX(player) - footX) || -1; seq.groundY = groundY;
      seq.actors = this.handoverMarinesV188().map((actor, index) => ({ actor, index, final: { x: actor.x, y: actor.y, facing: actor.facing || 1 } }));
      seq.ownVehicle = seq.style === 'ship' && player.inVehicle && isApcVehicle(this.vehicle);
      seq.boardedBy = seq.ownVehicle ? 'apc' : 'foot';
      const bounds = this.handoverBoundsV188();
      if (seq.style === 'dock') {
        seq.collar = { x: footX, floorY: groundY };
        for (const entry of seq.actors) entry.path = [{ x: centreX(entry.actor), y: feetY(entry.actor) }, { x: footX, y: groundY }];
      } else if (seq.ownVehicle) {
        // The hoist point stands over the scaled hull kept on its lane (never past a lift shaft, a door or the level edge).
        const v = this.vehicle, lane = v.m577OrdinaryV188 ? this.m577LaneV188 : null;
        const under = lane ? m577ClampToLaneV188(footX - v.w / 2, lane, v.w) + v.w / 2 : footX;
        seq.hoistX = under;
        seq.ship = { tailX: under + seq.dir * UD4L_FRAME_V188.belly.x, groundY, dir: seq.dir, lift: 0, gear: 1 };
        seq.vehicleStart = { x: this.vehicle.x, y: this.vehicle.y };
        for (const entry of seq.actors) entry.path = entry.actor === player ? null : [{ x: centreX(entry.actor), y: feetY(entry.actor) }, { x: footX, y: groundY }];
      } else {
        seq.ship = { tailX: footX + seq.dir * UD4L_RAMP_FOOT_V188, groundY, dir: seq.dir, lift: 0, gear: 1 };
        const hinge = ud4lToWorldV188(seq.ship, UD4L_FRAME_V188.hinge);
        for (const entry of seq.actors) entry.path = [{ x: centreX(entry.actor), y: feetY(entry.actor) }, { x: footX, y: groundY }, hinge];
      }
      seq.camFrom = { x: this.camera.x, y: this.camera.y };
      seq.camTo = { x: clamp(footX - seq.dir * 140 - 640, 0, Math.max(0, bounds.w - 1280)), y: clamp(groundY - 512, 0, Math.max(0, bounds.h - 720)) };
    }
    placeExtractionActorsV188(seq) {
      const start = phaseStart(seq, 'board'), end = phaseEnd(seq, 'board'), list = seq.actors.filter(entry => entry.path);
      const stagger = list.length > 1 ? Math.min(.4, (end - start) * .35 / (list.length - 1)) : 0, walk = end - start - stagger * Math.max(0, list.length - 1);
      list.forEach((entry, order) => {
        const actor = entry.actor, u = (seq.t - start - stagger * order) / Math.max(.05, walk);
        if (u >= 1) { seq.hidden.add(actor); actor.vx = 0; return; }
        if (u <= 0) return;
        const at = pointAlong(entry.path, ease(u));
        actor.x = at.x - actor.w / 2; actor.y = at.y - actor.h; actor.vy = 0; actor.grounded = true;
        actor.vx = at.dx * Math.max(90, (at.total || 0) / walk); if (at.dx) actor.facing = at.dx;
      });
      if (seq.ownVehicle) { // drive under the belly, then the hoist takes it up
        const vehicle = this.vehicle, under = seq.ship.tailX - seq.dir * UD4L_FRAME_V188.belly.x - vehicle.w / 2;
        const drive = clamp01((seq.t - start) / ((end - start) * .5)), hoist = clamp01((seq.t - start - (end - start) * .5) / ((end - start) * .5));
        vehicle.x = seq.vehicleStart.x + (under - seq.vehicleStart.x) * ease(drive);
        // Hoisted into the bay of the hovering ship (M577_DROP_V188): the turret recesses, the hull hangs under the belly.
        vehicle.y = seq.vehicleStart.y + (this.m577HungFeetV188(seq.ship) - (seq.vehicleStart.y + vehicle.h)) * ease(hoist);
        vehicle.vx = drive < 1 ? Math.sign(under - seq.vehicleStart.x) * 120 : 0;
        seq.vehicleHidden = hoist >= 1;
      }
    }
    finishBoardingV188(seq, skipped) {
      if (!this.running || this.handoverV188 !== seq || seq?.kind !== 'extraction' || this.mission?.state !== 'complete') return false;
      // Settle before either callback: the presentation callback can pause the
      // engine, and the terminal callback captures the authoritative save.
      seq.event = this.finalizeDeferredMissionCompletionV188?.(seq.event) ?? seq.event;
      // The app captures inside the terminal callback, after the staged sequence
      // is gone. Keep only its native poses for capture; the live drawn poses and
      // the paid event are not part of this bounded, per-mission record. An ordinary
      // stop keeps the actors, so this record lasts until the next start as well.
      this.handoverTerminalPosesV188 = { kind: 'extraction',
        actors: (seq.actors || []).map(entry => ({ actor: entry.actor, final: { ...entry.final } })),
        vehicleStart: seq.vehicleStart ? { ...seq.vehicleStart } : null };
      this.handoverV188 = null; this.handoverDepartedV188 = true; this.handoverExtractedV188 = true; this.handoverParticlesV188 = [];
      this.onEvent?.({ type: 'extraction-boarding-complete-v188', mode: seq.mode, placeType: seq.placeType,
        boardedBy: seq.boardedBy || 'foot', skipped: Boolean(skipped) });
      // The held terminal event, finalized once: the app pays it once, as before.
      const sink = this.handoverSinkV188;
      if (typeof sink === 'function') sink(seq.event);
      return true;
    }

    skipDropshipHandoverV188() {
      const seq = this.handoverV188;
      if (!seq?.blocking) return false;
      if (seq.kind === 'insertion') { this.resolveInsertionV188(seq); this.giveControlV188(seq, true); }
      else { this.resolveExtractionV188(seq); this.finishBoardingV188(seq, true); }
      this.handoverParticlesV188 = []; this.handoverShakeV188 = 0;
      return true;
    }

    // —— Simulation ——
    update(delta) {
      const seq = this.handoverV188;
      if (!seq) return super.update(delta);
      const dt = clamp(Number(delta) || 0, 0, .1);
      if (seq.blocking) {
        if (this.paused || this.enemyAtlasLoadingPausedV65 || !(dt > 0)) return undefined;
        // Nothing under this layer runs: mission time, enemies, directors and the grace stand still.
        this.animationTime = (this.animationTime || 0) + dt;
        this.advanceHandoverV188(seq, dt);
        if (seq.kind === 'extraction' && seq.resolved) this.simulateDefendedBoardingV188(seq, dt);
        if (seq.kind === 'insertion' && seq.t >= seq.controlAt) this.giveControlV188(seq, false);
        else if (seq.kind === 'extraction' && seq.t >= seq.total) this.finishBoardingV188(seq, false);
        return undefined;
      }
      const result = super.update(delta);
      if (this.handoverV188 === seq && dt > 0 && !this.paused) {
        this.advanceHandoverV188(seq, dt);
        if (seq.t >= seq.total) { this.handoverV188 = null; this.handoverParticlesV188 = []; }
      }
      return result;
    }
    /** The fight goes on around the boarding: enemies, their projectiles and the salvos in flight (DEFENDED_BOARDING_V188). */
    simulateDefendedBoardingV188(seq, dt) {
      const mission = this.mission;
      if (!mission || mission.state !== 'complete' || this.handoverV188 !== seq) return;
      const route = this.onEvent, aboard = [...(seq.hidden || [])].filter(actor => actor.alive !== false);
      // Terminal and casualty events cannot come out of this window; the held mission-complete stays the only one.
      this.onEvent = event => SILENT_DURING_BOARDING.has(event?.type) ? undefined : route.call(this, event);
      for (const actor of aboard) actor.alive = false; // boarded: out of reach
      // The insertion grace belongs to the landing: it never shields the enemies' fight at extraction.
      const grace = this.insertionGraceV188; this.insertionGraceV188 = null;
      mission.state = 'active'; this.defendedBoardingV188 = seq;
      try {
        for (const enemy of this.enemies || []) if (enemy.alive && !enemy.dormant) this.updateEnemy(enemy, dt);
        this.updateHostileProjectiles(dt);
        this.updateBullets?.(dt);
        if (seq.pendingHitsV188?.length) for (const hit of seq.pendingHitsV188.splice(0)) if (hit.enemy.alive) this.applyEnemyDamage(hit.enemy, hit.damage, { owner: this.player, kind: hit.kind });
      } finally {
        mission.state = 'complete'; this.defendedBoardingV188 = null; this.insertionGraceV188 = grace;
        for (const actor of aboard) actor.alive = true;
        this.onEvent = route;
      }
    }
    advanceHandoverV188(seq, dt) {
      if (seq.kind === 'insertion') this.resolveInsertionV188(seq); else this.resolveExtractionV188(seq);
      seq.t += dt;
      const now = phaseAt(seq, seq.t);
      this.playHandoverCuesV188(seq, now);
      if (seq.ship) this.poseShipV188(seq, now);
      if (seq.apc) this.poseApcV188(seq, now, dt);
      if (seq.blocking) {
        if (seq.kind === 'insertion') this.placeInsertionActorsV188(seq); else this.placeExtractionActorsV188(seq);
        const k = seq.kind === 'insertion'
          ? ease(clamp01((seq.t - phaseStart(seq, seq.style === 'dock' ? 'step' : 'disembark')) / Math.max(.1, seq.controlAt - phaseStart(seq, seq.style === 'dock' ? 'step' : 'disembark'))))
          : ease(clamp01(seq.t / .8));
        this.camera.x = seq.camFrom.x + (seq.camTo.x - seq.camFrom.x) * k; this.camera.y = seq.camFrom.y + (seq.camTo.y - seq.camFrom.y) * k;
      }
      if (seq.kind === 'extraction' && now.id === 'board' && seq.style === 'ship') this.coveringFireV188(seq, dt);
      this.stepHandoverParticlesV188(seq, now, dt);
      this.handoverShakeV188 = Math.max(0, this.handoverShakeV188 - dt);
    }
    poseShipV188(seq, now) {
      // An M577 under the belly: the ship hovers (M577_DROP_V188); on insertion the ramp stays shut (the squad rides the M577).
      const ship = seq.ship, high = 760, hover = seq.apc || seq.ownVehicle ? M577_DROP_V188.hover : 0;
      if (seq.kind === 'insertion') {
        if (now.id === 'descend') { const u = ease(now.p); ship.lift = hover + (high - hover) * (1 - u); ship.gear = clamp01(now.p * 1.6 - .4); }
        else if (now.id === 'settle') { ship.lift = hover + Math.max(0, Math.sin(now.p * Math.PI) * 6 * (1 - now.p)); ship.gear = 1; }
        else if (now.id === 'liftoff') { const u = now.p * now.p; ship.lift = hover + u * (high + 200 - hover); ship.gear = 1 - clamp01(now.p * 2); }
        else ship.lift = hover;
        ship.ramp = hover ? 0 : now.id === 'ramp' ? ease(now.p) : now.id === 'disembark' ? 1 : now.id === 'close' ? 1 - ease(now.p) : now.id === 'liftoff' ? 0 : 0;
      } else {
        if (now.id === 'arrive') { const u = ease(now.p); ship.lift = hover + (high - hover) * (1 - u); ship.gear = clamp01(now.p * 1.6 - .4); }
        else if (now.id === 'lift') { const u = now.p * now.p; ship.lift = hover + u * (high + 200 - hover); ship.gear = 1 - clamp01(now.p * 2); }
        else ship.lift = hover;
        ship.ramp = now.id === 'ramp' ? ease(now.p) : now.id === 'board' ? 1 : now.id === 'close' ? 1 - ease(now.p) : 0;
      }
    }
    /** Feet line of an M577 hanging in the belly bay (turret recessed into the bay). */
    m577HungFeetV188(ship) { return ud4lToWorldV188(ship, UD4L_FRAME_V188.belly).y + M577_SCALE_V188.drawnHeight - M577_DROP_V188.recess; }
    poseApcV188(seq, now, dt) {
      const apc = seq.apc, start = phaseStart(seq, 'disembark'), end = phaseEnd(seq, 'disembark'), span = end - start;
      const lower = clamp01((seq.t - start) / (span * .31)), drive = clamp01((seq.t - start - span * .31) / (span * .375));
      const before = apc.x;
      if (apc.leaving) {
        // The transport backs under the belly during 'close' and is hoisted early in 'liftoff': it leaves with the ship.
        const close = phaseStart(seq, 'close'), closeEnd = phaseEnd(seq, 'close'), lift = phaseStart(seq, 'liftoff'), liftEnd = phaseEnd(seq, 'liftoff');
        const back = clamp01((seq.t - close) / Math.max(.05, closeEnd - close)), hoist = clamp01((seq.t - lift) / Math.max(.05, (liftEnd - lift) * .3));
        apc.x = apc.finalX + (apc.lowerX - apc.finalX) * ease(back); apc.drop = 1 - ease(hoist);
      }
      else if (seq.t < start) { apc.drop = 0; apc.x = apc.lowerX; }
      else { apc.drop = ease(lower); apc.x = apc.lowerX + (apc.finalX - apc.lowerX) * ease(drive); }
      apc.wheel += (apc.x - before) / M577_SCALE_V188.wheelRadius;
      if (apc.own) {
        const vehicle = this.vehicle, hung = this.m577HungFeetV188(seq.ship) - vehicle.h;
        vehicle.x = apc.x; vehicle.y = hung + (seq.vehicleFinal.y - hung) * apc.drop;
        vehicle.vx = Math.abs(apc.x - before) > .01 ? apc.facing * 120 : 0;
      }
    }
    coveringFireV188(seq, dt) {
      seq.fireClock -= dt;
      seq.tracers = seq.tracers.filter(entry => (entry.life -= dt) > 0);
      if (seq.fireClock > 0) return;
      seq.fireClock = .16;
      const chin = ud4lToWorldV188(seq.ship, UD4L_FRAME_V188.chinGun), bay = ud4lToWorldV188(seq.ship, { x: UD4L_FRAME_V188.hinge.x, y: UD4L_FRAME_V188.hinge.y - 40 });
      // Ahead of the nose the chin turret fires; behind the ship, a marine in the bay covers the ramp.
      const gun = chin;
      const reach = enemy => Math.min(Math.abs(centreX(enemy) - chin.x), Math.abs(centreX(enemy) - bay.x));
      const target = (this.enemies || []).filter(enemy => enemy.alive && !enemy.dormant && reach(enemy) < 900).sort((a, b) => reach(a) - reach(b))[0];
      // Without a visible contact the gunner sweeps the approach in front of the ramp.
      const to = target ? { x: centreX(target), y: target.y + target.h * .45 }
        : { x: gun.x - seq.ship.dir * (380 + Math.sin(seq.t * 3) * 120), y: seq.groundY - 30 };
      const from = Math.abs(to.x - bay.x) < Math.abs(to.x - chin.x) ? bay : chin;
      seq.tracers.push({ from, to, life: .14, max: .14 });
      // The tracer is a real hit (applied inside the boarding fight window, with the marines' owner).
      if (target && reach(target) < DEFENDED_BOARDING_V188.reach) {
        (seq.pendingHitsV188 ||= []).push({ enemy: target, damage: DEFENDED_BOARDING_V188.tracerDamage, kind: from === chin ? 'dropship-chin-gun' : 'dropship-covering-fire' });
        this.onEvent?.({ type: 'dropship-covering-hit-v188', enemyId: target.id, gun: from === chin ? 'chin' : 'bay', x: to.x, y: to.y });
      }
      for (let i = 0; i < 3; i++) this.pushHandoverParticleV188({ kind: 'spark', x: to.x, y: to.y, vx: (Math.random() - .5) * 220, vy: -Math.random() * 160, life: .3, max: .3, r: 2 });
      if (!seq.cues.has(`fire-${Math.floor(seq.t / .7)}`)) { seq.cues.add(`fire-${Math.floor(seq.t / .7)}`); this.audio?.cue?.('weapon-smartgun'); }
    }
    playHandoverCuesV188(seq, now) {
      const once = (id, cue) => { if (!seq.cues.has(id)) { seq.cues.add(id); this.audio?.cue?.(cue); } };
      const map = seq.style === 'dock'
        ? { seal: seq.kind === 'insertion' ? 'airlock-pressurize' : 'airlock-depressurize', hatch: 'door-open', 'hatch-close': 'door-close', close: 'door-close', undock: 'airlock-depressurize' }
        : { descend: 'lift-depart', arrive: 'lift-depart', settle: 'lift-arrive', ramp: 'door-open', close: 'door-close', liftoff: 'lift-depart', lift: 'lift-depart' };
      if (map[now.id]) once(now.id, map[now.id]);
      if (seq.kind === 'insertion' && seq.style === 'ship' && now.id === 'settle' && !seq.cues.has('touchdown')) {
        seq.cues.add('touchdown'); if (this.handoverMotionV188?.shake) this.handoverShakeV188 = .3;
      }
      if ((now.id === 'disembark' || now.id === 'step' || now.id === 'board') && !seq.apc?.own) once(`step-${Math.floor(now.p * 4)}`, 'step-metal');
    }
    pushHandoverParticleV188(particle) {
      const cap = this.handoverMotionV188?.reduced ? 50 : 140, list = this.handoverParticlesV188;
      if (list.length >= cap) list.shift();
      list.push(particle);
    }
    stepHandoverParticlesV188(seq, now, dt) {
      const reduced = this.handoverMotionV188?.reduced, weather = this.handoverWeatherV188;
      if (seq.ship && seq.ship.lift < 300 && ['descend', 'settle', 'arrive', 'liftoff', 'lift', 'ramp'].includes(now.id)) {
        const power = (1 - seq.ship.lift / 300) * (reduced ? .4 : 1), count = Math.round(power * 60 * dt + Math.random() * .6);
        for (const source of UD4L_FRAME_V188.nacelles) {
          const x = ud4lToWorldV188(seq.ship, source).x;
          for (let i = 0; i < count; i++) {
            const side = Math.random() < .5 ? -1 : 1, speed = (160 + Math.random() * 220) * (reduced ? .5 : 1);
            if (weather === 'debris') this.pushHandoverParticleV188({ kind: 'debris', x, y: seq.groundY - 4, vx: side * speed, vy: -120 - Math.random() * 200, g: 380, life: 1.1, max: 1.1, r: 3 + Math.random() * 3 });
            else this.pushHandoverParticleV188({ kind: weather === 'rain' ? 'rain' : 'dust', x: x + side * 20, y: seq.groundY - 6 - Math.random() * 10,
              vx: side * speed, vy: weather === 'rain' ? -60 - Math.random() * 80 : -20 - Math.random() * 40, g: weather === 'rain' ? 300 : 0, drag: weather === 'rain' ? 0 : 1.6,
              life: .9 + Math.random() * .5, max: 1.4, r: 10 + Math.random() * 12 });
          }
        }
      }
      if (weather === 'rain' && seq.blocking) { // rain keeps falling across the held shot
        const n = Math.round((reduced ? 20 : 70) * dt + Math.random() * .5);
        for (let i = 0; i < n; i++) this.pushHandoverParticleV188({ kind: 'rain', x: this.camera.x + Math.random() * 1400, y: this.camera.y - 20, vx: -80, vy: 900, g: 0, life: .9, max: .9, r: 1 });
      }
      for (const p of this.handoverParticlesV188) {
        p.vy += (p.g || 0) * dt; if (p.drag) { p.vx *= Math.max(0, 1 - p.drag * dt); p.vy *= Math.max(0, 1 - p.drag * dt); }
        p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
        if (p.kind === 'debris' && p.y > seq.groundY) { p.y = seq.groundY; p.vy *= -.25; p.vx *= .6; }
      }
      this.handoverParticlesV188 = this.handoverParticlesV188.filter(p => p.life > 0);
    }

    // —— Guards ——
    damagePlayer(actor, amount, options = {}) {
      const seq = this.handoverV188;
      if (seq?.blocking && !this.defendedBoardingV188) return 0;
      if (!this.defendedBoardingV188 || !actor) return super.damagePlayer(actor, amount, options);
      // Defended boarding: hurt, never killed (DEFENDED_BOARDING_V188.floorHealth).
      const floor = DEFENDED_BOARDING_V188.floorHealth, capped = Math.max(0, Math.min(Number(amount) || 0, (Number(actor.health) || 0) - floor));
      const result = super.damagePlayer(actor, capped, options);
      if (actor.alive === false || !(actor.health >= floor)) Object.assign(actor, { alive: true, health: floor, downed: false });
      return result;
    }
    damageSquadMember(member, amount, options = {}) {
      if (!this.defendedBoardingV188 || !member) return super.damageSquadMember(member, amount, options);
      const floor = DEFENDED_BOARDING_V188.floorHealth, capped = Math.max(0, Math.min(Number(amount) || 0, (Number(member.health) || 0) - floor));
      const result = super.damageSquadMember(member, capped, options);
      if (member.alive === false || member.downed || !(member.health >= floor)) Object.assign(member, { alive: true, health: Math.max(floor, Number(member.health) || 0), downed: false });
      return result;
    }
    failMission(reason) { return this.handoverV188?.kind === 'extraction' && this.handoverV188.blocking ? false : super.failMission(reason); }
    togglePause() {
      // Escape during the held shot skips it (the base binds Escape to pause).
      if (!this.paused && this.running && this.handoverV188?.blocking) return this.skipDropshipHandoverV188();
      return super.togglePause();
    }

    // —— Drawing ——
    handoverHiddenV188(actor) {
      if (this.handoverDepartedV188) return Boolean(actor && (actor === this.player || actor === this.coop || actor.squadMember || this.handoverMarinesV188().includes(actor)));
      return Boolean(this.handoverV188?.hidden?.has(actor));
    }
    drawActor(ctx, actor) { return this.handoverHiddenV188(actor) ? undefined : super.drawActor(ctx, actor); }
    drawSquadActor(ctx, member) { return this.handoverHiddenV188(member) ? undefined : super.drawSquadActor?.(ctx, member); }
    drawVehicle(ctx) {
      const seq = this.handoverV188;
      if (seq) this.drawHandoverBackV188(ctx, seq);
      if (seq?.vehicleHidden || this.handoverDepartedV188 && this.player?.inVehicle) return undefined;
      const v = this.vehicle;
      if (!v?.m577OrdinaryV188 || !v.active) return super.drawVehicle(ctx);
      // The M577 to scale (slot m577-mission-side-scale, Canvas placeholder): the 250 px action sheet is not at this scale.
      for (const member of this.activeSquadActors?.() || []) if (['entering', 'exiting'].includes(member.vehicleAccessPhase)) this.drawSquadActor(ctx, member);
      const hurt = Number(v.hull) < Number(v.maxHull || 1) * .35 ? 1 : 0, firing = (this.player?.inVehicle && (this.player.fireClock || 0) > 0) ? 1 : 0;
      drawM577ScaledPlaceholderV188(ctx, v.x, v.y + v.h, Number(v.facing) < 0 ? -1 : 1,
        { wheelTurn: v.x / M577_SCALE_V188.wheelRadius, hurt, turretRecoil: firing, command: v.id === 'vehicle-002-m577-command-apc', wreck: Boolean(v.destroyed) });
      return undefined;
    }
    drawHandoverBackV188(ctx, seq) {
      if (!seq.resolved) return;
      const time = seq.t, reduced = this.handoverMotionV188?.reduced, now = phaseAt(seq, time);
      if (seq.collar) {
        const seal = seq.kind === 'insertion' ? clamp01(time / Math.max(.1, phaseEnd(seq, 'seal'))) : clamp01(time / Math.max(.1, phaseEnd(seq, 'seal')));
        const open = seq.kind === 'insertion'
          ? now.id === 'hatch' ? ease(now.p) : now.id === 'step' ? 1 : now.id === 'hatch-close' ? 1 - ease(now.p) : 0
          : now.id === 'hatch' ? ease(now.p) : now.id === 'board' ? 1 : now.id === 'close' ? 1 - ease(now.p) : 0;
        drawDockingCollarV188(ctx, seq.collar.x, seq.collar.floorY, { seal: now.id === 'undock' ? 1 - now.p : seal, open, time, reducedMotion: reduced });
        return;
      }
      const ship = seq.ship;
      if (!ship) return;
      drawUd4lRampV188(ctx, ship, ship.ramp || 0);
      drawUd4lHullV188(ctx, ship, { image: hullImage() });
      if (seq.apc) { // in front of the hull: it hangs under the belly bay
        const bellyWorld = ud4lToWorldV188(ship, UD4L_FRAME_V188.belly), h = LEVEL_DROPSHIP_SCALE_V188.m577.h;
        const footY = seq.groundY + (this.m577HungFeetV188(ship) - seq.groundY) * (1 - seq.apc.drop);
        if (seq.apc.drop < 1 && phaseStart(seq, 'disembark') <= time) drawHoistV188(ctx, bellyWorld, { x: seq.apc.x + seq.apc.w / 2, y: footY - h });
        if (!seq.apc.own && phaseStart(seq, 'disembark') <= time) drawM577TransportV188(ctx, seq.apc.x, footY, seq.apc.facing, { wheelTurn: seq.apc.wheel });
      }
    }
    /** Render suspend (app hook): while the app shows its own full-screen cinematic over the
     *  mission, the engine skips its frame entirely instead of having draw() replaced. */
    setRenderSuspendedV188(suspended) { this.renderSuspendedV188 = Boolean(suspended); return this.renderSuspendedV188; }
    draw() {
      if (this.renderSuspendedV188) return undefined;
      const seq = this.handoverV188, shake = this.handoverShakeV188 > 0 && this.handoverMotionV188?.shake;
      const camera = this.camera, saved = shake ? { x: camera.x, y: camera.y } : null;
      if (saved) { camera.x += (Math.random() - .5) * 6; camera.y += (Math.random() - .5) * 4; }
      let result;
      try { result = super.draw(); } finally { if (saved) { camera.x = saved.x; camera.y = saved.y; } }
      if (seq?.resolved || this.handoverParticlesV188?.length) this.drawHandoverFrontV188(seq);
      return result;
    }
    drawHandoverFrontV188(seq) {
      const ctx = this.ctx || this.canvas?.getContext?.('2d');
      if (!ctx) return;
      ctx.save();
      ctx.scale((this.canvas?.width || 1280) / 1280, (this.canvas?.height || 720) / 720);
      ctx.save(); ctx.translate(-this.camera.x, -this.camera.y);
      drawDownwashParticlesV188(ctx, this.handoverParticlesV188 || []);
      if (seq?.resolved) {
        for (const tracer of seq.tracers || []) drawCoveringFireV188(ctx, tracer.from, tracer.to, 1 - tracer.life / tracer.max);
        if (seq.ship && seq.ship.lift < 40) {
          const hinge = ud4lToWorldV188(seq.ship, UD4L_FRAME_V188.hinge), r = seq.ship.ramp || 0;
          drawStatusBeaconV188(ctx, hinge.x - seq.ship.dir * 18, hinge.y - 74, r >= 1 ? 'safe' : r > 0 ? 'moving' : 'idle', seq.t, { reducedMotion: this.handoverMotionV188?.reduced });
        }
      }
      ctx.restore();
      if (seq) {
        const amount = seq.blocking ? clamp01(seq.t / .4) : 1 - clamp01((seq.t - seq.controlAt) / .5);
        drawHandoverLetterboxV188(ctx, amount);
        if (seq.blocking && amount > .9) {
          ctx.font = '700 12px monospace'; ctx.textAlign = 'right'; ctx.fillStyle = '#9fb7a5';
          ctx.fillText(text('E · ÉCHAP · ENTRÉE  PASSER', 'E · ESC · ENTER  SKIP'), 1250, 720 - 36); ctx.textAlign = 'left';
        }
      }
      ctx.restore();
    }
    drawHud(ctx) {
      // The HUD stays hidden while control is withheld and fades back in after.
      const seq = this.handoverV188;
      if (seq?.blocking) return undefined;
      if (!seq || seq.kind !== 'insertion') return super.drawHud(ctx);
      ctx.save(); ctx.globalAlpha *= clamp01((seq.t - seq.controlAt) / .6);
      try { return super.drawHud(ctx); } finally { ctx.restore(); }
    }
    drawStateOverlay(ctx) {
      if (this.handoverV188?.blocking && !this.paused) return undefined; // no "extraction confirmed" card over the boarding
      return super.drawStateOverlay(ctx);
    }

    // —— Resume ——
    withHandoverPosesV188(seq, run) {
      const poses = (seq.actors || []).map(entry => ({ actor: entry.actor, x: entry.actor.x, y: entry.actor.y, facing: entry.actor.facing }));
      const vehicle = this.vehicle, vehiclePose = vehicle ? { x: vehicle.x, y: vehicle.y } : null;
      for (const entry of seq.actors || []) Object.assign(entry.actor, { x: entry.final.x, y: entry.final.y, facing: entry.final.facing });
      if (seq.kind === 'insertion' && seq.ownVehicle && seq.vehicleFinal) Object.assign(vehicle, seq.vehicleFinal);
      if (seq.kind === 'extraction' && seq.vehicleStart) Object.assign(vehicle, seq.vehicleStart);
      try { return run(); } finally {
        for (const pose of poses) Object.assign(pose.actor, { x: pose.x, y: pose.y, facing: pose.facing });
        if (vehiclePose) Object.assign(vehicle, vehiclePose);
      }
    }
    captureResumeState() {
      const seq = this.handoverV188;
      const poses = seq?.blocking && seq.resolved ? seq : this.mission?.state === 'complete' ? this.handoverTerminalPosesV188 : null;
      const state = poses ? this.withHandoverPosesV188(poses, () => super.captureResumeState()) : super.captureResumeState();
      // Additive: the scaled hull's width, so a resume restores its centre (records without it are the legacy 190 px box).
      if (state?.vehicle && typeof state.vehicle === 'object' && this.vehicle?.m577OrdinaryV188) state.vehicle.w = this.vehicle.w;
      if (state && typeof state === 'object' && (this.handoverConfigV188 || seq || this.handoverExtractedV188)) {
        let event = null;
        if (seq?.kind === 'extraction') { try { event = structuredClone(seq.event); } catch { event = seq.event; } }
        state.dropshipHandoverV188 = { schema: 188, landed: true, extracted: this.handoverExtractedV188 === true,
          boarding: seq?.kind === 'extraction' ? { mode: seq.mode, placeType: seq.placeType, short: seq.short,
            t: Math.min(seq.t, phaseEnd(seq, seq.style === 'dock' ? 'seal' : 'arrive')), event } : null };
      }
      return state;
    }
    applyResumeState(raw) {
      const result = super.applyResumeState(raw), v = this.vehicle, saved = raw?.vehicle;
      if (result?.applied && v && saved && typeof saved === 'object' && saved.id === v.id && isM577VehicleV188(v) && (!v.m577ScaleV188 || v.m577OrdinaryV188)
        && Number.isFinite(Number(saved.x))) {
        const width = Number(saved.w) > 0 && Number(saved.w) <= 1000 ? Number(saved.w) : M577_SCALE_V188.legacy.w, centre = Number(saved.x) + width / 2;
        if (v.m577OrdinaryV188) { v.x = this.m577LaneV188 ? m577ClampToLaneV188(centre - v.w / 2, this.m577LaneV188, v.w) : centre - v.w / 2; v.spriteHitbox = m577HitboxRuntimeV188(v); }
        else this.m577ResumeCentreV188 = centre;
      }
      return result;
    }

    // —— The drivable M577 to scale in the ordinary levels (owner decision 2026-11-22, round 2) ——
    /** Scales the level's M577 (001/002) to 449 × 112 and parks it on a floor lane that holds it. Convoy and Act V keep their own. */
    applyM577OrdinaryScaleV188(options = {}) {
      const v = this.vehicle, centre = this.m577ResumeCentreV188; this.m577ResumeCentreV188 = null;
      if (!v || !v.active || v.m577ScaleV188 || !isM577VehicleV188(v) || this.editorMode || options.editorProject || options.forgePlaytest || options.forgeSessionV141
        || this.apcConvoyActiveV121 || this.act5RaceActiveV188 || this.mechaMissionV131) return false;
      const feet = Number(v.y) + Number(v.h), preferred = Number.isFinite(centre) ? centre : Number(v.x) + Number(v.w) / 2;
      applyM577MissionScaleV188(v); v.m577OrdinaryV188 = true;
      this.parkM577V188(preferred, feet);
      return true;
    }
    /** The lane the hull parks on: one that holds it and reaches the extraction (it is driven there to board), nearest to the
     *  level's own vehicle point, on the same floor first; never one reached through a door. Geometry is read, never moved. */
    chooseM577LaneV188(preferredCentre, feetY) {
      const v = this.vehicle, bounds = this.handoverBoundsV188(), m = 8, need = v.w + 2 * m;
      const extraction = this.objective && finite(this.objective.x) ? { x: this.objective.x + (this.objective.w || 0) / 2, feet: this.objective.y + (this.objective.h || 0) } : null;
      const feetLines = [feetY, ...new Set((this.platforms || []).filter(entry => /^node-platform-/.test(String(entry.id || ''))).map(entry => entry.y))];
      const doorCentres = (this.doors || []).map(door => door.x + door.w / 2);
      let best = null;
      for (const feet of feetLines) {
        for (const lane of m577LanesV188({ platforms: this.platforms, lifts: this.lifts, walls: this.walls, feetY: feet, width: bounds.w })) {
          if (lane.x1 - lane.x0 < need) continue;
          const reachesExtraction = extraction && Math.abs(extraction.feet - feet) <= 24 && extraction.x >= lane.x0 && extraction.x <= lane.x1;
          const nearest = Math.max(lane.x0 + m + v.w / 2, Math.min(lane.x1 - m - v.w / 2, preferredCentre));
          const throughDoor = feet === feetY && doorCentres.some(x => x > Math.min(preferredCentre, nearest) && x < Math.max(preferredCentre, nearest));
          const score = (reachesExtraction ? 0 : 10000) + (throughDoor ? 5000 : 0) + Math.abs(nearest - preferredCentre) + 2 * Math.abs(feet - feetY);
          if (!best || score < best.score) best = { feet, lane, score, reachesExtraction: Boolean(reachesExtraction) };
        }
      }
      return best;
    }
    parkM577V188(preferredCentre, preferredFeet) {
      const v = this.vehicle, bounds = this.handoverBoundsV188();
      const chosen = this.chooseM577LaneV188(preferredCentre, preferredFeet), feetY = chosen ? chosen.feet : preferredFeet;
      const lanes = chosen ? [chosen.lane] : [];
      const near = entry => entry && finite(entry.x) && finite(entry.y) && Math.abs(entry.y + (entry.h || 0) - feetY) < 80;
      const avoid = [this.objective, this.powerNode, this.archiveTerminal, ...(this.supplies || []), ...(this.objectiveNodes || []), ...(this.covers || [])].filter(near);
      const parking = m577ParkingV188({ lanes, doors: this.doors, ladders: this.ladders, avoid, feetY, preferredCentre, w: v.w });
      v.y = feetY - v.h; v.groundY = v.y;
      if (parking) { v.x = parking.x; this.m577LaneV188 = parking.lane; }
      else { v.x = clamp(preferredCentre - v.w / 2, 0, Math.max(0, bounds.w - v.w)); this.m577LaneV188 = null; }
      this.m577ParkingV188 = Object.freeze({ parked: Boolean(parking), preferredCentre, preferredFeet, feetY, centre: v.x + v.w / 2, lane: this.m577LaneV188,
        segment: parking?.segment || null, clear: parking?.clear ?? false, reachesExtraction: Boolean(chosen?.reachesExtraction), lanes });
      v.spriteHitbox = m577HitboxRuntimeV188(v);
    }
    refreshSpriteCollisionProfiles() {
      const result = super.refreshSpriteCollisionProfiles?.();
      if (this.vehicle?.m577OrdinaryV188) this.vehicle.spriteHitbox = m577HitboxRuntimeV188(this.vehicle);
      return result;
    }
    updateVehicleDriver(actor, delta, controls) {
      const result = super.updateVehicleDriver(actor, delta, controls), v = this.vehicle;
      if (!v?.m577OrdinaryV188 || !v.active || this.handoverV188?.blocking) return result;
      // A ground-locked 8.8 m hull never leaves its floor lane (lift shafts, low decks and the level edge stop it).
      if (this.m577LaneV188) { const x = m577ClampToLaneV188(v.x, this.m577LaneV188, v.w); if (x !== v.x) { v.x = x; v.vx = 0; } }
      const seat = m577AnchorsV188(v).seat.x;
      for (const rider of [this.player, this.coop]) if (rider?.inVehicle) { rider.x = (rider === v.driver ? seat : seat - v.facing * 60) - (rider.w || 42) / 2; rider.y = v.y + 10; }
      return result;
    }
    /** A marine leaves the scaled hull by its side door (between the road wheels), on the lane. */
    placeM577ExitV188(actor, index = 0) {
      const v = this.vehicle; if (!actor || !v?.m577OrdinaryV188) return;
      const lane = this.m577LaneV188, door = m577SideDoorXV188(v) + index * 54;
      actor.x = clamp(door - (actor.w || 42) / 2, lane ? lane.x0 : 0, (lane ? lane.x1 : this.handoverBoundsV188().w) - (actor.w || 42));
      actor.y = v.y + v.h - actor.h;
    }
    commitVehicleAccessV59(actor, phase) {
      const result = super.commitVehicleAccessV59?.(actor, phase);
      if (result && phase === 'exiting') this.placeM577ExitV188(actor);
      return result;
    }
    toggleVehicle(actor = this.player) {
      const wasIn = Boolean(actor?.inVehicle), result = super.toggleVehicle(actor);
      if (result && wasIn && !actor.inVehicle) this.placeM577ExitV188(actor);
      return result;
    }
    ejectVehicleOccupants() {
      const riders = [this.player, this.coop].filter(actor => actor?.inVehicle), result = super.ejectVehicleOccupants();
      riders.forEach((actor, index) => this.placeM577ExitV188(actor, index));
      return result;
    }
    /** The roof turret of the scaled hull fires from its own mount (rear roof), not from the box centre. */
    resolvePlayerMuzzleV124(player, aim) {
      const v = this.vehicle;
      if (!player?.inVehicle || !v?.m577OrdinaryV188) return super.resolvePlayerMuzzleV124(player, aim);
      const turret = m577AnchorsV188(v).turret;
      return resolveCombatMuzzleV83(player, aim, { pivotX: turret.x, pivotY: turret.y, barrelLength: 70 });
    }
    m577ScaleSnapshotV188() {
      const v = this.vehicle; if (!v) return null;
      return { id: v.id, active: Boolean(v.active), scaled: Boolean(v.m577ScaleV188), ordinary: Boolean(v.m577OrdinaryV188), x: Math.round(v.x), y: Math.round(v.y), w: v.w, h: v.h,
        feet: Math.round(v.y + v.h), facing: v.facing || 1, lane: this.m577LaneV188 ? { x0: Math.round(this.m577LaneV188.x0), x1: Math.round(this.m577LaneV188.x1) } : null,
        parked: this.m577ParkingV188 ? { parked: this.m577ParkingV188.parked, clear: this.m577ParkingV188.clear, reachesExtraction: this.m577ParkingV188.reachesExtraction,
          preferredCentre: Math.round(this.m577ParkingV188.preferredCentre), preferredFeet: Math.round(this.m577ParkingV188.preferredFeet) } : null };
    }

    getSnapshot() {
      const seq = this.handoverV188;
      return { ...super.getSnapshot(), dropshipHandoverV188: seq ? { kind: seq.kind, style: seq.style, mode: seq.mode, placeType: seq.placeType,
        short: seq.short, t: Math.round(seq.t * 100) / 100, controlAt: seq.controlAt, total: seq.total, blocking: seq.blocking,
        phase: phaseAt(seq, seq.t).id } : null };
    }
  };
}
