// V188 — runtime of the Act V convoy race (rules: act5-convoy-race-v188.js; bible
// §5.6 steps 4-6, §5.11; spec 006). It owns the scene of the two race missions
// exactly as the Act III convoy (apc-convoy-runtime-v121.js) owns its corridor:
// the player starts seated in the issued M577, the road scrolls, the towed
// trailers follow on their drawbars, X / C uncouple one, the bridge collapses
// behind and under the convoy, and in « La Reine du dépôt » the Queen chases it.
// It is composed just outside the V158 production chain, so every V188 layer
// (insertion/extraction handover, VFX, combat feel, cues, tension, tracker)
// wraps it unchanged. Save consequences go out as events
// (`act5-trailer-dropped-v188`, `act5-race-milestone-v188`); the app writes them
// with story-act5-v188.js. One checkpoint per phase (owner rule).
// Owner decision 2026-11-22: the M577 is drawn and collides to scale (m577-scale-v188.js,
// 8.8 m [À VÉRIFIER] ≈ 449 px; Canvas placeholder behind the slot m577-mission-side-scale);
// the trailers keep their own 4.6 m [PROPOSÉ] and hang on the M577's rear hitch.
import { VEHICLES } from './content-core-v50.js';
import { M577_SCALE_V188, applyM577MissionScaleV188, m577AnchorsV188, m577HitboxRuntimeV188, drawM577ScaledPlaceholderV188 } from './m577-scale-v188.js';
import {
  ACT5_RACE_V188, ACT5_RACE_TEXT_V188, isAct5RaceCampaignV188, createAct5RaceStateV188, stepAct5RaceV188, engageAct5RaceV188,
  dropAct5TrailerV188, act5RacePhaseV188, act5RaceRearV188, act5RaceTargetV188, sanitizeAct5RaceStateV188, act5QueenAdmissibleV188,
  act5RunnerAdmissibleV188, act5RaceSlotV188, ACT5_RACE_SOURCE_RECTS_V188, drawAct5QueenPlaceholderV188, drawAct5TrailerPlaceholderV188,
  drawAct5RunnerPlaceholderV188
} from './act5-convoy-race-v188.js';

export const ACT5_RACE_OPERATION_V188 = 'act5-convoy-race';
const APC_ID = 'vehicle-001-m577-armored-personnel-carrier';
// The M577's left (rear) edge on screen: nose at 1229 px when stopped, the whole convoy (≈ 21 m) in the 1280 px view.
const GROUND = 570, APC_SCREEN_X = 780;
const clone = value => structuredClone(value);
const list = value => Array.isArray(value) ? value : [];
const lang = () => globalThis.document?.documentElement?.lang === 'en' ? 'en' : 'fr';
const tx = entry => entry?.[lang()] || entry?.fr || '';

/** Default trailers when the app passes no setup (tests, direct starts): both for the race, the colonists for the chase. */
export function defaultAct5RaceSetupV188(campaignId) {
  const trailers = campaignId === 'act5-last-run' ? [{ id: 'colonists', people: 4, containers: 0 }, { id: 'freight', people: 0, containers: 0 }]
    : [{ id: 'colonists', people: 4, containers: 0 }];
  return { campaignId, replay: true, trailers, apcColonists: 0, containers: 0, bridgeSeconds: 15, bridgeDecided: false };
}

const imageCache = new Map();
function slotImage(id) {
  const slot = act5RaceSlotV188(id);
  if (!slot?.present || typeof globalThis.Image !== 'function') return null; // absent slots are never requested
  if (!imageCache.has(id)) { try { const image = new globalThis.Image(); image.decoding = 'async'; image.src = slot.path; imageCache.set(id, image); } catch { imageCache.set(id, null); } }
  const image = imageCache.get(id);
  return image && image.complete && image.naturalWidth > 0 ? image : null;
}

export function withAct5ConvoyRaceV188(BaseEngine) {
  if (BaseEngine.act5ConvoyRaceV188 === true) return BaseEngine;
  return class Act5ConvoyRaceV188 extends BaseEngine {
    static act5ConvoyRaceV188 = true;
    start(options = {}) {
      this.act5RaceActiveV188 = isAct5RaceCampaignV188(options.campaign?.id);
      this.act5RaceV188 = null; this.act5RaceCheckpointV188 = null; this.act5RaceKeysV188 = new Set(); this.act5RaceFxV188 = { tracer: 0, shake: 0 };
      this.act5RaceCommittedV188 = []; this.act5RaceQueuedV188 = [];
      if (!this.act5RaceActiveV188) return super.start(options);
      this.bindAct5RaceKeysV188();
      const campaignId = options.campaign.id;
      const catalog = list(options.enemyCatalog);
      const queenProfile = catalog.find(profile => profile.id === ACT5_RACE_V188.queen.profileId) || null;
      const runnerProfile = catalog.find(profile => profile.id === ACT5_RACE_V188.runner.profileId) || null;
      if (campaignId === 'act5-depot-queen' && !act5QueenAdmissibleV188(queenProfile).admitted) throw new Error('Act V Queen chase requires the royal Queen profile.');
      if (!act5RunnerAdmissibleV188(runnerProfile)) throw new Error('Act V convoy race requires the runner profile.');
      this.act5RaceProfilesV188 = { queen: queenProfile, runner: runnerProfile };
      const setup = options.act5RaceV188 && options.act5RaceV188.campaignId === campaignId ? options.act5RaceV188 : defaultAct5RaceSetupV188(campaignId);
      this.act5RaceSetupV188 = setup;
      const base = VEHICLES.find(vehicle => vehicle.id === APC_ID);
      super.start({ ...options, resumeState: undefined, vehicle: { ...base, hull: ACT5_RACE_V188.apc.hull, cargo: 60 }, crew: [], squad: [],
        userCasteCampaignV88: false, hordeDirectorV132: false, neuroProfile: null, apexDossier: null });
      this.configureAct5RaceWorldV188();
      const ppm = ACT5_RACE_V188.pixelsPerMetre;
      this.act5RaceV188 = createAct5RaceStateV188({ campaignId, trailers: setup.trailers, apcLength: this.vehicle.w / ppm,
        trailerLength: this.act5TrailerSizeV188().w / ppm, bridgeSeconds: setup.bridgeSeconds, queenProfile, replay: setup.replay });
      if (setup.bridgeDecided && this.act5RaceV188.bridge) this.act5RaceV188.bridge.window = 0; // decided earlier: no second decision
      const saved = sanitizeAct5RaceStateV188(options.resumeState?.specialOperation?.act5RaceV188);
      if (saved && saved.campaignId === campaignId && options.resumeState?.identity?.campaignId === campaignId) {
        this.act5RaceV188 = saved;
        const checkpoint = sanitizeAct5RaceStateV188(options.resumeState.specialOperation.act5RaceCheckpointV188);
        this.act5RaceCheckpointV188 = checkpoint;
        this.act5RaceCommittedV188 = list(options.resumeState.specialOperation.act5RaceCommittedV188).filter(id => ['colonists', 'freight'].includes(id));
        this.lastResumeResult = { applied: true, restored: 1, specialOperationRestored: true };
      }
      this.syncAct5RaceWorldV188();
      this.act5RaceCheckpointV188 ||= clone(this.act5RaceV188);
      this.onEvent({ type: 'special-operation-started', operationId: ACT5_RACE_OPERATION_V188, campaignId, localPlayers: 1 });
      return this.getSnapshot();
    }
    // A tap shorter than a frame still uncouples: keydown queues the decision for the next update.
    bindAct5RaceKeysV188() {
      if (this.act5RaceKeysBoundV188 || typeof globalThis.addEventListener !== 'function') return;
      this.act5RaceKeysBoundV188 = true;
      globalThis.addEventListener('keydown', event => {
        if (!this.isAct5RaceV188() || event.repeat || !['KeyX', 'KeyC'].includes(event.code)) return;
        if (this.canRouteGameplayKey && !this.canRouteGameplayKey(event)) return;
        this.act5RaceQueuedV188.push(event.code === 'KeyX' ? 'freight' : 'colonists');
      });
    }
    isAct5RaceV188() { return Boolean(this.act5RaceActiveV188 && this.act5RaceV188); }
    canAct5RaceActV188(actor = this.player) {
      return Boolean(this.running && !this.paused && !this.enemyAtlasLoadingPausedV65 && this.mission?.state === 'active'
        && actor === this.player && actor?.alive && !actor.downed && this.vehicle?.active && !this.vehicle.destroyed);
    }
    act5TrailerSizeV188() { const w = Math.round(ACT5_RACE_V188.trailer.length * ACT5_RACE_V188.pixelsPerMetre); return { w, h: Math.round(w * 662 / 2134) + 10 }; }
    configureAct5RaceWorldV188() {
      this.enemies = []; this.bullets = []; this.hostileProjectiles = []; this.drops = []; this.squadActors = []; this.coopEnabled = false;
      this.platforms = [{ id: 'act5r-road', x: 0, y: GROUND, w: 1280, h: 38, floor: true, art: 'floor' }];
      this.walls = []; this.doors = []; this.ladders = []; this.lifts = []; this.covers = []; this.hazards = []; this.vents = [];
      this.supplies = []; this.objectiveNodes = []; this.collectablesV68 = []; this.narrativeCollectablesV68 = [];
      this.powerNode = null; this.archiveTerminal = null;
      if (this.weaponPickup) this.weaponPickup.taken = true;
      if (this.toolPickup) this.toolPickup.taken = true;
      this.ventShortcut = { id: 'none', x: -1000, y: -1000, w: 0, h: 0, open: false };
      this.missionVentNetworkV62 = null; this.missionVentActorsV62?.clear?.();
      this.missionLevelEvents?.clear?.(); this.missionLevelSpawns?.clear?.(); this.missionLevelTimers?.clear?.(); this.missionLevelExtractionTimer = null;
      this.missionLevelBounds = { width: 1280, height: 620, voidY: 720 };
      applyM577MissionScaleV188(this.vehicle, { anchorX: APC_SCREEN_X });
      Object.assign(this.vehicle, { id: APC_ID, active: true, occupied: true, driver: this.player, passengers: [],
        x: APC_SCREEN_X, y: GROUND - this.vehicle.h, groundY: GROUND - this.vehicle.h, facing: 1, vx: 0, vy: 0,
        hull: ACT5_RACE_V188.apc.hull, maxHull: ACT5_RACE_V188.apc.hull, fuel: 100, turretAmmo: 0, maxTurretAmmo: 0, turretReserve: 0,
        canFire: true, destroyed: false, supportRepairRate: 0, gunnerBonus: 1 });
      this.vehicle.accessTransition = null; this.vehicle.accessSecureClock = 0; this.vehicle.squadAccessRuntime = null;
      this.pinAct5RaceDriverV188();
      this.refreshSpriteCollisionProfiles?.();
      this.camera.x = 0; this.camera.y = 0;
      this.objective = { id: 'act5r-port-gate', x: 1150, y: 450, w: 80, h: 120, complete: false };
      this.checkpoint = { id: 'insertion', x: this.player.x, y: this.player.y };
    }
    pinAct5RaceDriverV188() {
      // The driver sits in the cab behind the nose glazing (m577-scale-v188.js anchors).
      this.player.inVehicle = true; this.player.x = m577AnchorsV188(this.vehicle).seat.x - (this.player.w || 42) / 2; this.player.y = this.vehicle.y + 10;
      this.player.vx = 0; this.player.vy = 0; this.player.facing = 1; this.player.climbing = false; this.player.ladderId = null;
      this.vehicle.occupied = true; this.vehicle.driver = this.player; this.vehicle.passengers = [];
    }
    act5ApcScreenXV188() { return APC_SCREEN_X - Math.min(60, (this.act5RaceV188?.apc.v || 0) * 2.4); }
    act5ScreenXV188(s) { return this.act5ApcScreenXV188() + this.vehicle.w / 2 + (s - this.act5RaceV188.apc.s) * ACT5_RACE_V188.pixelsPerMetre; }
    syncAct5RaceWorldV188() {
      if (!this.isAct5RaceV188() || !this.vehicle) return;
      const state = this.act5RaceV188, phase = act5RacePhaseV188(state);
      this.mission.phase = phase;
      this.mission.objectives = { power: state.phase !== 'briefing', route: phase === 'arrival' || phase === 'stand' || state.complete,
        boss: state.mode === 'chase' ? state.queen?.state === 'dead' : Boolean(state.bridge?.crossed), archive: true, extract: state.complete };
      this.objective.complete = state.complete; this.coopEnabled = false;
      if (!this.vehicle.destroyed) {
        this.vehicle.x = this.act5ApcScreenXV188(); this.vehicle.y = GROUND - this.vehicle.h; this.vehicle.facing = 1;
        this.vehicle.hull = state.apc.hull; this.vehicle.vx = state.apc.v * ACT5_RACE_V188.pixelsPerMetre; this.pinAct5RaceDriverV188();
      }
    }
    setCoop(enabled) { return super.setCoop(this.isAct5RaceV188() ? false : enabled); }
    refreshSpriteCollisionProfiles() {
      const result = super.refreshSpriteCollisionProfiles?.();
      if (this.act5RaceActiveV188 && this.vehicle?.m577ScaleV188) this.vehicle.spriteHitbox = m577HitboxRuntimeV188(this.vehicle);
      return result;
    }
    updateObjectiveRuntime(delta) { if (!this.isAct5RaceV188()) return super.updateObjectiveRuntime(delta); }
    updateMissionPhase() { if (!this.isAct5RaceV188()) return super.updateMissionPhase(); this.syncAct5RaceWorldV188(); }
    missingObjectiveRequirement(options) { return this.isAct5RaceV188() ? this.missingAct5RaceRequirementV188() : super.missingObjectiveRequirement(options); }
    missingExtractionRequirement() { return this.isAct5RaceV188() ? this.missingAct5RaceRequirementV188() : super.missingExtractionRequirement(); }
    missingAct5RaceRequirementV188() {
      return this.act5RaceV188?.complete && !this.vehicle.destroyed && this.act5RaceV188.apc.hull > 0 ? ''
        : lang() === 'en' ? 'CONVOY NOT THROUGH' : 'CONVOI NON ARRIVÉ';
    }
    updateVehicleDriver(actor, delta, controls) { if (!this.isAct5RaceV188()) return super.updateVehicleDriver(actor, delta, controls); this.pinAct5RaceDriverV188(); }
    toggleVehicle(actor = this.player) { return this.isAct5RaceV188() ? false : super.toggleVehicle(actor); }
    useEquipment(id, actor = this.player) { return this.isAct5RaceV188() ? false : super.useEquipment(id, actor); }
    useMedkit(actor = this.player) { return this.isAct5RaceV188() ? false : super.useMedkit(actor); }
    reload(actor = this.player) { return this.isAct5RaceV188() ? false : super.reload(actor); }
    // The rear turret is resolved by the race rules (hitscan, heat); no infantry projectile is created.
    fire(actor = this.player) { return this.isAct5RaceV188() ? false : super.fire(actor); }
    interactionCandidatesV188(actor = this.player) {
      if (!this.isAct5RaceV188()) return super.interactionCandidatesV188(actor);
      if (actor !== this.player || !actor?.alive || actor.downed || this.act5RaceV188.phase !== 'briefing') return [];
      return [{ kind: 'act5-race-v188', category: 'action', target: 'briefing', distance: 0, prompt: tx(ACT5_RACE_TEXT_V188.engage) }];
    }
    interact(actor = this.player) {
      if (!this.isAct5RaceV188()) return super.interact(actor);
      if (!this.canAct5RaceActV188(actor) || this.selectInteractionTargetV188?.(actor)?.kind !== 'act5-race-v188') return false;
      return this.engageAct5RaceV188();
    }
    engageAct5RaceV188() {
      if (!engageAct5RaceV188(this.act5RaceV188)) return false;
      this.act5RaceMilestoneV188(this.act5RaceV188.phase, tx(ACT5_RACE_TEXT_V188.radio[this.act5RaceV188.mode === 'chase' ? 'chase' : 'depart']));
      return true;
    }
    /** Player decision: uncouple a trailer (X: freight, C: colonists). */
    dropAct5TrailerV188(trailerId, cause = null) {
      if (!this.isAct5RaceV188() || !this.canAct5RaceActV188()) return false;
      const state = this.act5RaceV188, reason = cause || (state.mode === 'chase' ? 'decoy' : act5RacePhaseV188(state) === 'bridge' ? 'bridge' : 'road');
      if (!dropAct5TrailerV188(state, trailerId, reason)) return false;
      this.processAct5RaceEventsV188(state.events.splice(0)); return true;
    }
    update(delta) {
      if (!this.isAct5RaceV188()) return super.update(delta);
      if (!this.canAct5RaceActV188()) return;
      const seconds = Number(delta); if (!Number.isFinite(seconds) || seconds <= 0) return;
      const dt = Math.min(seconds, ACT5_RACE_V188.maxStep), state = this.act5RaceV188, keys = this.keys;
      if (keys.has('KeyE') && state.phase === 'briefing') this.interact();
      const pressed = code => { const down = keys.has(code), was = this.act5RaceKeysV188.has(code); if (down) this.act5RaceKeysV188.add(code); else this.act5RaceKeysV188.delete(code); return down && !was; };
      const queued = this.act5RaceQueuedV188.splice(0);
      if (pressed('KeyX') || queued.includes('freight')) this.dropAct5TrailerV188('freight');
      if (pressed('KeyC') || queued.includes('colonists')) this.dropAct5TrailerV188('colonists');
      const throttle = keys.has('KeyD') || keys.has('ArrowRight') || keys.has('TouchRight') ? 1 : keys.has('KeyA') || keys.has('ArrowLeft') || keys.has('TouchLeft') ? -1 : 0;
      const fire = keys.has('KeyF') || keys.has('TouchFire') || Boolean(this.mouse?.down);
      const events = stepAct5RaceV188(state, dt, { throttle, fire });
      super.update(dt);
      if (this.mission.state !== 'active') return;
      this.camera.x = 0; this.camera.y = 0;
      this.processAct5RaceEventsV188(events);
      this.act5RaceFxV188.tracer = Math.max(0, this.act5RaceFxV188.tracer - dt); this.act5RaceFxV188.shake = Math.max(0, this.act5RaceFxV188.shake - dt);
      this.syncAct5RaceWorldV188();
      if (state.failed && this.mission.state === 'active') { this.vehicle.destroyed = state.failed === 'hull'; this.failMission(tx(ACT5_RACE_TEXT_V188.fail[state.failed])); return; }
      if (state.complete) this.completeMission();
    }
    processAct5RaceEventsV188(events) {
      const state = this.act5RaceV188, R = ACT5_RACE_TEXT_V188.radio;
      let turret = false;
      for (const event of events) {
        switch (event.type) {
          case 'phase':
            if (event.phase === 'bridge') this.act5RaceMilestoneV188('bridge', '');
            if (event.phase === 'far-side') this.act5RaceMilestoneV188('far-side', tx(R.crossed));
            if (event.phase === 'arrival') this.act5RaceMilestoneV188('arrival', tx(R.arrival));
            if (event.phase === 'stand') this.act5RaceMilestoneV188('stand', tx(R.stand));
            break;
          case 'trailer-dropped': {
            if (!this.act5RaceCommittedV188.includes(event.trailer)) this.act5RaceCommittedV188.push(event.trailer);
            const trailer = state.dropped.find(entry => entry.id === event.trailer);
            const x = trailer ? this.act5ScreenXV188(trailer.s) : 400;
            this.vfxEmitV188?.('spark', x + (trailer ? trailer.length * ACT5_RACE_V188.pixelsPerMetre / 2 : 0), GROUND - 30, { count: 14, angle: -Math.PI / 2, spread: 2, speed: 260, life: .35, size: 3 });
            this.act5RaceFxV188.shake = .25;
            this.onEvent({ type: 'act5-trailer-dropped-v188', campaignId: state.campaignId, trailer: event.trailer, cause: event.cause, metres: event.metres, replay: state.replay });
            if (['horde', 'queen', 'collapse'].includes(event.cause)) this.act5RaceRadioV188('torn', tx(R.torn));
            break;
          }
          case 'bridge-strain': this.onEvent({ type: 'act5-race-bridge-v188', id: 'strain', seconds: event.seconds }); this.act5RaceRadioV188('strain', tx(R.strain)); break;
          case 'bridge-collapse': this.onEvent({ type: 'act5-race-bridge-v188', id: 'collapse' }); this.act5RaceRadioV188('collapse', tx(R.collapse)); this.act5RaceFxV188.shake = .5; break;
          case 'bridge-crossed': this.onEvent({ type: 'act5-race-milestone-v188', id: 'bridge-crossed', campaignId: state.campaignId, replay: state.replay }); break;
          case 'wave': this.onEvent({ type: 'act5-race-wave-v188', count: event.count }); this.act5RaceRadioV188('wave', tx(R.wave)); break;
          case 'runner-blocked': this.act5RaceRadioV188('blocked', tx(R.blocked)); break;
          case 'runner-killed': {
            this.player.kills = (Number(this.player.kills) || 0) + 1;
            this.onEvent({ type: 'kill', enemy: { id: event.id, name: this.act5RaceProfilesV188.runner.name }, operationId: ACT5_RACE_OPERATION_V188 });
            const runner = state.runners.find(entry => entry.id === event.id);
            if (runner) this.vfxEmitV188?.('acid', this.act5ScreenXV188(runner.s), GROUND - 40, { count: 10, angle: -Math.PI / 2, spread: 1.6, speed: 200, life: .5, size: 3, floorY: GROUND });
            break;
          }
          case 'hit': {
            turret = true;
            const s = event.target === 'queen' ? state.queen.s + 1.2 : state.runners.find(entry => entry.id === event.target)?.s;
            if (Number.isFinite(s)) this.vfxEmitV188?.('acid', this.act5ScreenXV188(s), GROUND - (event.target === 'queen' ? 150 : 45), { count: 2, angle: Math.PI, spread: 1.2, speed: 160, life: .3, size: 2, floorY: GROUND });
            break;
          }
          case 'queen-lunge': this.onEvent({ type: 'act5-race-queen-v188', id: 'lunge' }); this.act5RaceRadioV188('lunge', tx(R.lunge)); break;
          case 'queen-feeding': this.onEvent({ type: 'act5-race-queen-v188', id: 'feeding' }); this.act5RaceRadioV188('feeding', tx(R.feeding)); break;
          case 'queen-recoil':
            this.onEvent({ type: 'act5-race-queen-v188', id: 'recoil' }); this.act5RaceRadioV188('recoil', tx(R.recoil));
            this.vfxEmitV188?.('acid', this.act5ScreenXV188(state.queen.s + 1.2), GROUND - 150, { count: 8, angle: Math.PI, spread: 1.4, speed: 220, life: .45, size: 3, floorY: GROUND });
            this.act5RaceFxV188.shake = Math.max(this.act5RaceFxV188.shake, .2);
            break;
          case 'queen-killed':
            this.player.kills = (Number(this.player.kills) || 0) + 1;
            this.onEvent({ type: 'act5-race-queen-v188', id: 'roar' });
            this.onEvent({ type: 'boss-defeated', enemy: { id: 'act5-depot-queen', name: state.queen.name }, operationId: ACT5_RACE_OPERATION_V188 });
            this.onEvent({ type: 'act5-race-milestone-v188', id: 'queen-killed', campaignId: state.campaignId, replay: state.replay });
            this.act5RaceRadioV188('killed', tx(R.killed));
            this.vfxExplosionV188?.(this.act5ScreenXV188(state.queen.s), GROUND - 80);
            break;
          case 'hull-hit': case 'trailer-hit': this.act5RaceFxV188.shake = Math.max(this.act5RaceFxV188.shake, .18); break;
          default: break;
        }
      }
      if (turret) {
        this.act5RaceFxV188.tracer = .08;
        if (!this.act5RaceFxV188.cueAt || this.animationTime - this.act5RaceFxV188.cueAt > .42) { this.act5RaceFxV188.cueAt = this.animationTime; this.onEvent({ type: 'act5-race-turret-v188' }); }
      }
    }
    act5RaceRadioV188(id, text) {
      const said = this.act5RaceSaidV188 ||= new Set();
      if (!text || said.has(id) && !['lunge', 'torn', 'blocked'].includes(id)) return;
      said.add(id); this.onEvent({ type: 'act5-race-radio-v188', operationId: ACT5_RACE_OPERATION_V188, id, text });
    }
    /** One checkpoint per phase entered (owner rule): the race state is captured at the phase boundary. */
    act5RaceMilestoneV188(id, text) {
      const state = this.act5RaceV188;
      if (state.checkpoints.includes(id)) return;
      state.checkpoints.push(id);
      if (text) this.act5RaceRadioV188(`phase-${id}`, text);
      this.checkpoint = { id: 'insertion', x: this.player.x, y: this.player.y };
      this.act5RaceCheckpointV188 = sanitizeAct5RaceStateV188(clone(state));
      this.onEvent({ type: 'checkpoint', checkpoint: `act5-race-${id}`, operationId: ACT5_RACE_OPERATION_V188, campaignId: state.campaignId });
    }
    completeMission(actor = this.player) {
      if (!this.isAct5RaceV188()) return super.completeMission(actor);
      if (!this.canAct5RaceActV188(actor) || this.missingAct5RaceRequirementV188()) return false;
      this.syncAct5RaceWorldV188();
      return super.completeMission(actor);
    }
    restartFromCheckpoint() {
      if (!this.isAct5RaceV188()) return super.restartFromCheckpoint();
      if (this.mission?.state !== 'failed' || !this.act5RaceCheckpointV188) return false;
      if (!super.restartFromCheckpoint()) return false;
      const state = clone(this.act5RaceCheckpointV188);
      // Decisions already written to the save stay made: a trailer dropped after this checkpoint is not towed again.
      for (const id of this.act5RaceCommittedV188) if (state.trailers.some(trailer => trailer.id === id)) {
        const index = state.trailers.findIndex(trailer => trailer.id === id), [trailer] = state.trailers.splice(index, 1);
        trailer.dropCause = 'road'; trailer.blocking = false; trailer.falling = state.bridge && trailer.s >= state.bridge.start ? 0 : -1; state.dropped.push(trailer);
      }
      if (state.bridge && state.trailers.length < 2) state.bridge.strain = false;
      state.events = []; state.failed = null; this.act5RaceV188 = state;
      this.player.alive = true; this.player.health = Math.max(this.player.health, 55);
      Object.assign(this.vehicle, { destroyed: false, active: true });
      this.configureAct5RaceWorldV188(); this.syncAct5RaceWorldV188(); this.clearGameplayInput?.();
      return true;
    }
    captureResumeState() {
      const base = super.captureResumeState(); if (!this.isAct5RaceV188()) return base;
      return { ...base, specialOperation: { ...(base.specialOperation || {}), operationId: ACT5_RACE_OPERATION_V188,
        act5RaceV188: sanitizeAct5RaceStateV188(this.act5RaceV188), act5RaceCheckpointV188: this.act5RaceCheckpointV188 ? clone(this.act5RaceCheckpointV188) : null,
        act5RaceCommittedV188: [...this.act5RaceCommittedV188] } };
    }
    applyResumeState(raw) {
      if (!this.isAct5RaceV188()) return super.applyResumeState(raw);
      const state = sanitizeAct5RaceStateV188(raw?.specialOperation?.act5RaceV188);
      if (!state || state.campaignId !== this.act5RaceV188.campaignId) return { applied: false, restored: 0, reason: 'act5-race-mismatch', specialOperationRestored: false };
      this.act5RaceV188 = state; this.act5RaceCheckpointV188 = sanitizeAct5RaceStateV188(raw.specialOperation.act5RaceCheckpointV188) || clone(state);
      this.act5RaceCommittedV188 = list(raw.specialOperation.act5RaceCommittedV188).filter(id => ['colonists', 'freight'].includes(id));
      this.syncAct5RaceWorldV188();
      return { applied: true, restored: 1, specialOperationRestored: true };
    }
    phaseLabel() { return this.isAct5RaceV188() ? tx(ACT5_RACE_TEXT_V188.phase[act5RacePhaseV188(this.act5RaceV188)]) : super.phaseLabel(); }
    objectiveProgressText() {
      if (!this.isAct5RaceV188()) return super.objectiveProgressText();
      const state = this.act5RaceV188;
      return `${Math.round(Math.min(state.apc.s, state.length))}/${state.length} m · ${tx(ACT5_RACE_TEXT_V188.controls)}`;
    }
    getInteractionPrompt() { return this.isAct5RaceV188() ? this.selectInteractionTargetV188?.(this.player)?.prompt || '' : super.getInteractionPrompt(); }
    missionLocalZoneV121() {
      if (!this.isAct5RaceV188()) return super.missionLocalZoneV121?.() ?? null;
      return { id: 'act5r-road', label: lang() === 'en' ? 'Cocyte · complex-to-port road' : 'Cocyte · route du complexe au port', biome: 'extérieur' };
    }
    missionNavigationMapV121() {
      if (!this.isAct5RaceV188()) return super.missionNavigationMapV121?.() ?? null;
      const state = this.act5RaceV188;
      return { mode: 'distance', label: `M577 · ${Math.round(Math.min(state.apc.s, state.length))}/${state.length} M`, length: state.length,
        progress: Math.max(0, Math.min(state.length, state.apc.s)), direction: 1, checkpoints: state.bridge ? [state.bridge.start, state.bridge.start + state.bridge.length] : [] };
    }
    act5RaceSnapshotV188() {
      const state = this.act5RaceV188; if (!state) return null;
      return { campaignId: state.campaignId, mode: state.mode, phase: act5RacePhaseV188(state), metres: Math.round(state.apc.s), length: state.length,
        speed: Math.round(state.apc.v * 3.6), hull: Math.round(state.apc.hull), trailers: state.trailers.map(trailer => ({ id: trailer.id, gap: +((state.apc.s - trailer.s).toFixed(2)), integrity: trailer.integrity })),
        dropped: state.dropped.map(trailer => ({ id: trailer.id, cause: trailer.dropCause })), bridge: state.bridge ? { strain: state.bridge.strain, crossed: state.bridge.crossed,
          left: Math.max(0, +(state.bridge.window - state.bridge.strainClock).toFixed(1)), collapse: state.bridge.collapse } : null,
        queen: state.queen ? { state: state.queen.state, health: Math.round(state.queen.health), maxHealth: state.queen.maxHealth, gap: +((act5RaceRearV188(state) - state.queen.s - 2.4).toFixed(1)), height: state.queen.height,
          killable: state.apc.s >= state.length, floor: Math.ceil(state.queen.maxHealth * ACT5_RACE_V188.queen.chaseFloor) } : null,
        apcPx: { w: this.vehicle.w, h: this.vehicle.h, metres: +(this.vehicle.w / ACT5_RACE_V188.pixelsPerMetre).toFixed(2), x: Math.round(this.vehicle.x), feet: Math.round(this.vehicle.y + this.vehicle.h) },
        trailerPx: this.act5TrailerSizeV188(),
        runners: state.runners.filter(runner => runner.alive).length, checkpoints: [...state.checkpoints], complete: state.complete, failed: state.failed };
    }
    getSnapshot() { return { ...super.getSnapshot(), ...(this.isAct5RaceV188() ? { act5RaceV188: this.act5RaceSnapshotV188() } : {}) }; }
    getGameplayReport() { return { ...super.getGameplayReport(), ...(this.isAct5RaceV188() ? { act5RaceV188: this.act5RaceSnapshotV188() } : {}) }; }

    // —— Drawing ——
    drawBackdrop(ctx) {
      if (!this.isAct5RaceV188()) return super.drawBackdrop(ctx);
      const state = this.act5RaceV188, ppm = ACT5_RACE_V188.pixelsPerMetre, offset = state.apc.s * ppm;
      const sky = ctx.createLinearGradient?.(0, 0, 0, 720);
      if (sky) { sky.addColorStop(0, '#05080b'); sky.addColorStop(.6, '#0c1418'); sky.addColorStop(1, '#141a18'); ctx.fillStyle = sky; } else ctx.fillStyle = '#0b1418';
      ctx.fillRect(0, 0, 1280, 720);
      // Far ridges and the atmosphere processor glow (parallax).
      ctx.fillStyle = '#10191c';
      for (let i = -1; i < 9; i++) { const x = i * 220 - (offset * .05) % 220; ctx.beginPath(); ctx.moveTo(x, 420); ctx.lineTo(x + 110, 330 - (i % 3) * 22); ctx.lineTo(x + 220, 420); ctx.fill(); }
      ctx.fillStyle = '#172327';
      for (let i = -1; i < 12; i++) { const x = i * 150 - (offset * .2) % 150; ctx.fillRect(x, 400 - (i % 2) * 30, 18, 170); ctx.fillRect(x - 20, 420, 58, 6); }
      // Road or bridge under the convoy.
      const bridge = state.bridge;
      const bx0 = bridge ? this.act5ScreenXV188(bridge.start) : Infinity, bx1 = bridge ? this.act5ScreenXV188(bridge.start + bridge.length) : -Infinity;
      ctx.fillStyle = '#273238';
      if (bx0 > 0) ctx.fillRect(0, GROUND, Math.min(1280, bx0), 150);
      if (bx1 < 1280) ctx.fillRect(Math.max(0, bx1), GROUND, 1280 - Math.max(0, bx1), 150);
      if (bridge && bx1 > 0 && bx0 < 1280) this.drawAct5BridgeV188(ctx, bx0, bx1);
      ctx.fillStyle = '#a5a58a';
      for (let x = -((offset) % 150); x < 1350; x += 150) if (x + 74 < bx0 || x > bx1) ctx.fillRect(x, GROUND + 19, 74, 4);
      if (state.mode === 'chase' || state.mode === 'race') this.drawAct5PortGateV188(ctx);
      // Rain (reduced motion: still drops).
      const still = Boolean(this.accessibilityRuntime?.reducedMotion), time = still ? 0 : this.animationTime || 0;
      ctx.strokeStyle = 'rgba(170,200,210,.22)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let i = 0; i < 90; i++) { const x = (i * 137 + time * 380 * (1 + i % 3 * .2)) % 1300 - 10, y = (i * 71 + time * 900) % 720; ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 16); }
      ctx.stroke();
    }
    drawAct5BridgeV188(ctx, x0, x1) {
      const bridge = this.act5RaceV188.bridge, R = ACT5_RACE_V188.race, ppm = ACT5_RACE_V188.pixelsPerMetre;
      // Ravine
      ctx.fillStyle = '#05080a'; ctx.fillRect(x0, GROUND, x1 - x0, 150);
      ctx.strokeStyle = '#3b4a4f'; ctx.lineWidth = 3;
      const load = this.act5RaceV188.trailers.length, sag = bridge.strain ? 16 : load ? 4 : 0;
      bridge.segments.forEach((segment, index) => {
        const sx = x0 + index * R.segment * ppm, w = R.segment * ppm;
        if (sx > 1280 || sx + w < 0) return;
        const falling = segment.fall >= 0, drop = falling ? Math.min(400, 260 * segment.fall * segment.fall) : 0, tilt = falling ? Math.min(.6, segment.fall * .5) * (index % 2 ? 1 : -1) : 0;
        const middle = Math.sin(Math.PI * (index + .5) / bridge.segments.length) * sag;
        if (falling && drop >= 400) return;
        ctx.save(); ctx.translate(sx + w / 2, GROUND + middle + drop); ctx.rotate(tilt);
        ctx.fillStyle = falling ? '#2a2f2f' : '#3a4446'; ctx.fillRect(-w / 2, 0, w - 1, 14);
        ctx.strokeStyle = '#56666a'; ctx.beginPath(); ctx.moveTo(-w / 2, 14); ctx.lineTo(0, 40); ctx.lineTo(w / 2, 14); ctx.stroke();
        ctx.restore();
      });
      // Truss rails above the deck.
      ctx.strokeStyle = '#4b5a5e'; ctx.lineWidth = 4; ctx.beginPath();
      const intactTo = bridge.collapse !== null ? this.act5ScreenXV188(bridge.collapse) : x0;
      ctx.moveTo(Math.max(intactTo, x0), GROUND - 54 + sag / 2); ctx.lineTo(x1, GROUND - 54); ctx.stroke();
      for (let x = Math.max(intactTo, x0); x < x1; x += 46) { ctx.beginPath(); ctx.moveTo(x, GROUND); ctx.lineTo(x + 23, GROUND - 54); ctx.lineTo(x + 46, GROUND); ctx.stroke(); }
    }
    drawAct5PortGateV188(ctx) {
      const state = this.act5RaceV188, x = this.act5ScreenXV188(state.length + 6);
      if (x > 1400 || x < -200) return;
      ctx.fillStyle = '#1d282b'; ctx.fillRect(x, GROUND - 260, 160, 260);
      ctx.fillStyle = '#e0b060'; for (let i = 0; i < 4; i++) ctx.fillRect(x + 20 + i * 34, GROUND - 230, 10, 6);
      ctx.fillStyle = '#9fb7b0'; ctx.font = '700 13px monospace'; ctx.fillText(state.mode === 'chase' ? (lang() === 'en' ? 'PORT ROAD' : 'ROUTE DU PORT') : 'PORT-MÉRIDIEN', x + 6, GROUND - 270);
    }
    drawWorld(ctx) {
      if (!this.isAct5RaceV188()) return super.drawWorld(ctx);
      const shake = this.act5RaceFxV188.shake > 0 && !this.accessibilityRuntime?.reducedMotion ? Math.sin(this.animationTime * 90) * 3 : 0;
      ctx.save(); ctx.translate(0, shake);
      const state = this.act5RaceV188, size = this.act5TrailerSizeV188();
      for (const trailer of state.dropped) this.drawAct5TrailerV188(ctx, trailer, size, true);
      // Drawbars, then towed trailers (each follows its own physics position).
      // The first drawbar hangs on the M577's rear hitch, each next one on the rear coupling of the trailer ahead.
      const hitch = m577AnchorsV188(this.vehicle).rearHitch;
      let frontX = hitch.x;
      for (const trailer of state.trailers) {
        const x = this.act5ScreenXV188(trailer.s) - size.w / 2, y = GROUND - 22 + trailer.bounce * 6;
        ctx.strokeStyle = '#141a17'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + size.w - 4, y); ctx.lineTo(frontX, hitch.y); ctx.stroke();
        ctx.fillStyle = '#8a8f7a'; ctx.fillRect(frontX - 4, hitch.y - 4, 8, 8);
        this.drawAct5TrailerV188(ctx, trailer, size, false);
        frontX = x + 4;
      }
      // The race owns its road: the template's floor, props and cover layers are not drawn, only the M577
      // (through the final drawVehicle, so the handover layer still hides or poses it).
      this.drawVehicle(ctx);
      for (const runner of state.runners) {
        const x = this.act5ScreenXV188(runner.s); if (x < -100 || x > 1380) continue;
        ctx.save(); if (!runner.alive) ctx.globalAlpha = Math.max(0, 1 - (runner.deadClock || 0));
        drawAct5RunnerPlaceholderV188(ctx, x, GROUND + (runner.alive ? 0 : 10), { height: ACT5_RACE_V188.runner.height, gait: runner.gait }); ctx.restore();
      }
      if (state.queen && state.queen.state !== 'dead') {
        const x = this.act5ScreenXV188(state.queen.s);
        if (x > -300) drawAct5QueenPlaceholderV188(ctx, x, GROUND, { height: state.queen.height, gait: state.queen.gait, state: state.queen.state });
        else this.drawAct5OffscreenV188(ctx, tx(ACT5_RACE_TEXT_V188.queen), act5RaceRearV188(state) - state.queen.s);
      }
      const target = act5RaceTargetV188(state);
      if (this.act5RaceFxV188.tracer > 0 && target) {
        const turret = m577AnchorsV188(this.vehicle).turret, tx0 = turret.x, ty0 = turret.y, txx = this.act5ScreenXV188(target.s), ty = GROUND - (target.kind === 'queen' ? 150 : 45);
        ctx.strokeStyle = 'rgba(255,214,120,.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx0, ty0); ctx.lineTo(txx, ty); ctx.stroke();
        ctx.fillStyle = 'rgba(255,235,170,.9)'; ctx.beginPath(); ctx.arc(tx0, ty0, 5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    drawForeground(ctx) { if (!this.isAct5RaceV188()) return super.drawForeground(ctx); }
    /** The M577 to scale (Canvas placeholder until the slot m577-mission-side-scale exists), wheels on the road line. */
    drawVehicle(ctx) {
      if (!this.isAct5RaceV188() || !this.vehicle?.m577ScaleV188) return super.drawVehicle(ctx);
      if (!this.vehicle.active || this.vehicle.destroyed) return undefined;
      const state = this.act5RaceV188, hurt = this.act5RaceFxV188.shake > 0 ? 1 : 0;
      drawM577ScaledPlaceholderV188(ctx, this.vehicle.x, this.vehicle.y + this.vehicle.h, 1,
        { wheelTurn: state.apc.s * ACT5_RACE_V188.pixelsPerMetre / M577_SCALE_V188.wheelRadius, hurt, turretRecoil: this.act5RaceFxV188.tracer > 0 ? 1 : 0 });
      return undefined;
    }
    drawAct5OffscreenV188(ctx, label, metres) {
      ctx.save(); ctx.fillStyle = '#e07a5f'; ctx.font = '700 13px monospace';
      ctx.beginPath(); ctx.moveTo(14, GROUND - 120); ctx.lineTo(30, GROUND - 130); ctx.lineTo(30, GROUND - 110); ctx.fill();
      ctx.fillText(`${label} · ${Math.max(0, Math.round(metres))} m`, 36, GROUND - 115); ctx.restore();
    }
    drawAct5TrailerV188(ctx, trailer, size, detached) {
      const x = this.act5ScreenXV188(trailer.s) - size.w / 2; if (x > 1300 || x + size.w < -20) return;
      const fall = trailer.falling >= 0 ? Math.min(500, 300 * trailer.falling * trailer.falling) : 0;
      if (fall >= 500) return;
      const y = GROUND + (detached ? 0 : trailer.bounce * 6) + fall;
      ctx.save();
      if (fall) { ctx.translate(x + size.w / 2, y - size.h / 2); ctx.rotate(Math.min(.9, trailer.falling * .8)); ctx.translate(-(x + size.w / 2), -(y - size.h / 2)); }
      const id = trailer.id === 'freight' ? 'freight-trailer' : 'colonist-trailer', image = slotImage(id), rect = ACT5_RACE_SOURCE_RECTS_V188[id];
      // The existing trailer art faces right (towed behind the M577 in the Act V cinematics).
      if (image && rect) ctx.drawImage(image, rect[0], rect[1], rect[2], rect[3], x, y - size.h, size.w, size.h);
      else drawAct5TrailerPlaceholderV188(ctx, x, y, size.w, size.h, trailer.id);
      if (trailer.integrity < 100 && !detached) { ctx.fillStyle = '#2b0f0f'; ctx.fillRect(x, y - size.h - 8, size.w, 4); ctx.fillStyle = '#d0a040'; ctx.fillRect(x, y - size.h - 8, size.w * trailer.integrity / 100, 4); }
      ctx.restore();
    }
    drawHud(ctx) {
      if (!this.isAct5RaceV188()) return super.drawHud(ctx);
      const state = this.act5RaceV188, T = ACT5_RACE_TEXT_V188, phase = act5RacePhaseV188(state);
      ctx.save(); ctx.fillStyle = '#091318ed'; ctx.fillRect(18, 16, 1244, 128); ctx.strokeStyle = '#5b817e'; ctx.strokeRect(18.5, 16.5, 1243, 127);
      ctx.font = '700 15px monospace'; ctx.fillStyle = '#d3e8df'; ctx.textAlign = 'left';
      ctx.fillText(`${tx(T.title[state.campaignId])} · ${tx(T.phase[phase])}`, 34, 41);
      ctx.font = '13px monospace'; ctx.fillStyle = '#c6d9d9';
      const trailers = state.trailers.map(trailer => `${tx(T.trailer[trailer.id])} ${trailer.integrity}%`).join(' · ') || '—';
      ctx.fillText(`${tx(T.hull)} ${Math.ceil(state.apc.hull)}/${ACT5_RACE_V188.apc.hull} · ${tx(T.speed)} ${Math.round(state.apc.v * 3.6)} km/h · ${trailers}`, 34, 64);
      ctx.fillStyle = state.turret.overheated ? '#f8aa79' : '#a8d7c5';
      ctx.fillText(`${tx(T.heat)} ${Math.round(state.turret.heat)}%${state.turret.overheated ? ` · ${tx(T.cooling)}` : ''}${state.queen ? ` · ${tx(T.queen)} ${Math.round(state.queen.health / state.queen.maxHealth * 100)}%` : ''}`, 34, 86);
      ctx.font = '12px monospace'; ctx.fillStyle = '#c1d0d2'; ctx.fillText(this.objectiveProgressText(), 34, 108);
      const drops = [state.trailers.some(trailer => trailer.id === 'colonists') ? tx(T.dropColonists) : null, state.trailers.some(trailer => trailer.id === 'freight') ? tx(T.dropFreight) : null].filter(Boolean);
      if (drops.length && state.phase !== 'briefing') { ctx.fillStyle = '#e9d07a'; ctx.fillText(drops.join(' · '), 760, 108); }
      ctx.fillStyle = '#24373b'; ctx.fillRect(34, 124, 1130, 5); ctx.fillStyle = '#8dbfad'; ctx.fillRect(34, 124, 1130 * Math.min(1, state.apc.s / state.length), 5);
      if (state.bridge) { ctx.fillStyle = '#e07a5f'; ctx.fillRect(34 + 1130 * state.bridge.start / state.length, 121, 1130 * state.bridge.length / state.length, 3); }
      if (state.bridge?.strain) {
        const left = Math.max(0, state.bridge.window - state.bridge.strainClock);
        ctx.font = '700 18px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#f2c46d';
        ctx.fillText(`${tx(T.bridgeClock)} · ${Math.ceil(left)} s`, 640, 186);
        ctx.font = '700 14px monospace'; ctx.fillStyle = '#e6efe6'; ctx.fillText(`${tx(T.dropFreight)}   ·   ${tx(T.dropColonists)}`, 640, 210);
      }
      const prompt = this.getInteractionPrompt();
      if (prompt) {
        ctx.font = '700 14px monospace'; ctx.textAlign = 'center';
        const width = Math.min(1160, (ctx.measureText?.(prompt).width || 300) + 44);
        ctx.fillStyle = '#091318ed'; ctx.fillRect((1280 - width) / 2, 654, width, 38); ctx.strokeStyle = '#8dbfad'; ctx.strokeRect((1280 - width) / 2 + .5, 654.5, width, 38);
        ctx.fillStyle = '#d3e8df'; ctx.fillText(prompt, 640, 679);
      }
      ctx.restore();
    }
  };
}
