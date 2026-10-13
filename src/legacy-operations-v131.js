import { VEHICLES } from './content-core-v50.js';
import { buildMissionLevelV52 } from './mission-levels-v52.js';
import { sweepProjectileAabbV83 } from './projectile-collision-v83.js';
import { resolveVehicleAnimation } from './sprite-animation-runtime.js';
import { loadPlayerCostumeAssetsV119 } from './player-costume-skins-v119.js';
import { LEGACY_CAMPAIGNS_V131, LEGACY_STATIONS_V131, LEGACY_BOUNDS_V131,
  createLegacyOperationStateV131, validateLegacyOperationStateV131, legacyOperationDossierV131 } from './legacy-operation-state-v131.js';
export { LEGACY_CAMPAIGNS_V131 } from './legacy-operation-state-v131.js';
const clone = value => structuredClone(value);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const center = actor => ({ x: actor.x + actor.w / 2, y: actor.y + actor.h / 2 });
const near = (actor, station, radius = 85) => Boolean(actor && station && Math.hypot(center(actor).x - station.x, center(actor).y - station.y) < radius);
const inside = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const HELD = Object.freeze({ left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'], up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'] });
const PROFILES = Object.freeze({ hunt: 'enemy-004-drone-big-chap', predator: 'enemy-051-ceto-reef-predator', queen: 'enemy-008-queen', fighter: 'enemy-006-runner' });
const nests = [{ x: 900, y: 820, w: 120, h: 80 }, { x: 1500, y: 850, w: 120, h: 80 }];
const bells = [{ x: 95, y: 75, w: 190, h: 170 }, { x: 855, y: 350, w: 190, h: 190 }];

function geometry(kind) {
  const bounds = LEGACY_BOUNDS_V131[kind];
  const platforms = [{ id: `legacy-${kind}-bed`, x: 0, y: kind === 'nostromo' ? 570 : 990, w: bounds.width, h: 50, floor: true }];
  const walls = kind === 'abyss' ? [{ id: 'canyon-overhang', x: 660, y: 0, w: 90, h: 345 },
    { id: 'canyon-rise', x: 1420, y: 850, w: 130, h: 140 }]
    : kind === 'broodstorm' ? [{ id: 'air-cliff', x: 1220, y: 680, w: 100, h: 310 }] : [];
  const doors = kind === 'nostromo' ? [720, 1100, 1880].map((x, index) => ({ id: `nostromo-gate-${index}`, x, y: 0, w: 34, h: 570,
    open: false, progress: 0, levelLocked: true, lockedBy: 'legacy-script', visualRole: 'ship-bulkhead' }))
    : kind === 'abyss' ? [{ id: 'hydrothermal-gate', x: 1940, y: 0, w: 34, h: 990, open: false, progress: 0,
      levelLocked: true, lockedBy: 'legacy-script', visualRole: 'security-shutter' }] : [];
  return { platforms, walls, doors };
}

// The V52 plan supplies admitted background art and insertion identity. The
// chapter contract supplies its own authored geometry and navigation stations;
// free swimming/flight are not advertised as V52 walking routes.
export function buildLegacyMissionV131(options = {}) {
  const campaign = LEGACY_CAMPAIGNS_V131.find(entry => entry.id === options.campaign?.id)
    || LEGACY_CAMPAIGNS_V131.find(entry => entry.kind === options.kind);
  if (!campaign) throw new Error('A legacy V131 campaign is required.');
  const plan = buildMissionLevelV52({ ...options, campaign, templateId: campaign.templateId });
  const bounds = LEGACY_BOUNDS_V131[campaign.kind], authored = geometry(campaign.kind);
  const errors = [...authored.platforms, ...authored.walls, ...authored.doors].filter(box =>
    ![box.x, box.y, box.w, box.h].every(Number.isFinite) || box.w <= 0 || box.h <= 0 || box.x < 0 || box.y < 0
    || box.x + box.w > bounds.width || box.y + box.h > bounds.height).map(box => `Invalid chapter geometry: ${box.id}`);
  for (const station of LEGACY_STATIONS_V131[campaign.kind]) {
    if (station.x < 0 || station.x > bounds.width || station.y < 0 || station.y > bounds.height
      || authored.walls.some(wall => inside({ x: station.x - 21, y: station.y - 46, w: 42, h: 92 }, wall))) errors.push(`Station obstructed: ${station.id}`);
  }
  if (errors.length) throw new Error(errors.join('; '));
  return Object.freeze({ ...plan, label: campaign.name, signature: `${plan.signature}:legacy-v131:${campaign.kind}`,
    legacyMissionV131: Object.freeze({ schema: 131, kind: campaign.kind, bounds: { ...bounds }, geometry: authored,
      stations: clone(LEGACY_STATIONS_V131[campaign.kind]), validation: Object.freeze({ valid: true, errors: [], stationCount: LEGACY_STATIONS_V131[campaign.kind].length }) }),
    verticalWorldV130: { enabled: false } });
}

export function withLegacyMissionsV131(BaseEngine) {
  if (BaseEngine.legacyMissionsRuntimeV131 === true) return BaseEngine;
  return class LegacyMissionsV131 extends BaseEngine {
    static legacyMissionsRuntimeV131 = true;
    start(options = {}) {
      const campaign = LEGACY_CAMPAIGNS_V131.find(entry => entry.id === options.campaign?.id);
      this.legacyMissionV131 = campaign ? createLegacyOperationStateV131(campaign.kind) : null;
      this.legacyCheckpointV131 = null; this.legacyBombsV131 = []; this.legacyHeldV131 = new Set();
      if (!campaign) return super.start(options);
      const plan = options.missionLevel;
      if (!plan?.validation?.valid || !plan.legacyMissionV131?.validation?.valid || plan.legacyMissionV131.kind !== campaign.kind
        || !plan.signature.endsWith(`:legacy-v131:${campaign.kind}`)) throw new Error('Legacy operations require buildLegacyMissionV131.');
      this.legacyCatalogV131 = new Map((options.enemyCatalog || []).map(profile => [profile.id, profile]));
      const required = campaign.kind === 'nostromo' ? ['hunt'] : campaign.kind === 'abyss' ? ['predator'] : ['queen', 'fighter'];
      if (required.some(role => !this.legacyCatalogV131.has(PROFILES[role]))) throw new Error('Missing admitted legacy encounter profile.');
      const vehicle = campaign.kind === 'broodstorm' ? VEHICLES.find(entry => entry.id === 'vehicle-009-ud-4l-cheyenne-dropship')
        : campaign.kind === 'abyss' ? VEHICLES.find(entry => entry.family === 'submersible') : null;
      super.start({ ...options, resumeState: undefined, vehicle, crew: [], squad: [], neuroProfile: null,
        apexDossier: null, userCasteCampaignV88: false, verticalWorldV130: false, destructibleSceneryV130: false });
      this.configureLegacyWorldV131(); this.syncLegacyWorldV131();
      if (options.resumeState) this.lastResumeResult = this.applyResumeState(options.resumeState);
      this.legacyCheckpointV131 ||= this.captureLegacyCheckpointV131();
      this.onEvent({ type: 'special-operation-started', campaignId: campaign.id, operationId: campaign.specialOperationId, localPlayers: 1, status: 'partial' });
      this.onEvent({ type: 'legacy-operation-radio', operationId: campaign.specialOperationId, text: campaign.limitations });
      return this.getSnapshot();
    }
    isLegacyMissionV131() { return Boolean(this.legacyMissionV131); }
    canLegacyActV131(actor = this.player, busy = false) {
      return Boolean(this.isLegacyMissionV131() && this.running && !this.paused && !this.enemyAtlasLoadingPausedV65
        && !this.userCasteLoadingV88 && this.mission?.state === 'active' && actor === this.player && actor?.alive && actor.health > 0 && !actor.downed
        && !actor.ventTransit && !(actor.grappledClock > 0) && !(actor.stunClock > 0)
        && (!busy || !(actor.reloading || actor.toolUseClock > 0 || actor.meleeClock > 0
          || this.isPlaceableBusyV86?.(actor) || this.isFieldActionBusyV124?.(actor))));
    }
    configureLegacyWorldV131() {
      const state = this.legacyMissionV131, kind = state.kind, authored = geometry(kind);
      this.enemies = []; this.bullets = []; this.hostileProjectiles = []; this.drops = []; this.squadActors = []; this.coopEnabled = false;
      Object.assign(this, clone(authored));
      for (const name of ['ladders', 'lifts', 'covers', 'hazards', 'vents', 'supplies', 'objectiveNodes', 'collectablesV68', 'narrativeCollectablesV68']) this[name] = [];
      this.powerNode = null; this.archiveTerminal = null; this.ventShortcut = null;
      if (this.weaponPickup) this.weaponPickup.taken = true; if (this.toolPickup) this.toolPickup.taken = true;
      this.missionVentNetworkV62 = null; this.missionVentActorsV62?.clear();
      this.missionLevelEvents?.clear(); this.missionLevelSpawns?.clear(); this.missionLevelTimers?.clear(); this.missionLevelExtractionTimer = null;
      this.verticalRuntimeV130 = null; this.rearEntrancesV130 = [];
      this.missionLevelBounds = { ...LEGACY_BOUNDS_V131[kind], voidY: 1080 };
      Object.assign(this.player, { x: 140, y: kind === 'nostromo' ? 570 - this.player.h : 180 - this.player.h / 2,
        vx: 0, vy: 0, grounded: kind === 'nostromo', climbing: false, inVehicle: state.aboard, facing: 1,
        weaponMode: 'rifle', magazineSize: this.weaponRuntime.magazine, ammo: this.weaponRuntime.magazine, ammoReserve: 180 });
      this.inventory.medkits = 2;
      if (kind === 'nostromo') {
        this.player.costumeId = 'franchise-nostromo-crew'; loadPlayerCostumeAssetsV119(this.images, this.player.costumeId);
        this.vehicle.active = false; this.vehicle.driver = null; this.vehicle.occupied = false;
      } else {
        Object.assign(this.vehicle, { active: true, x: kind === 'abyss' ? 390 : 100, y: kind === 'abyss' ? 410 : 210,
          vx: 0, vy: 0, w: 180, h: 86, groundY: 990, hull: 260, maxHull: 260, fuel: 100, turretAmmo: 160,
          maxTurretAmmo: 160, turretReserve: 0, gunnerBonus: 1, canFire: true, destroyed: false,
          driver: state.aboard ? this.player : null, occupied: state.aboard, passengers: [],
          accessTransition: null, accessSecureClock: 0, squadAccessRuntime: null });
        if (kind === 'abyss') this.vehicle.legacyPrototypeV131 = 'MANTA-6 · PROTOTYPE LOCAL';
        else delete this.vehicle.legacyPrototypeV131;
        this.refreshSpriteCollisionProfiles?.(); if (state.aboard) this.pinLegacyDriverV131();
      }
      const last = LEGACY_STATIONS_V131[kind].at(-1);
      this.objective = { id: `legacy-${kind}-extract`, x: last.x - 40, y: last.y - 60, w: 80, h: 120, complete: false };
      this.checkpoint = { id: 'insertion', x: this.player.x, y: this.player.y }; this.camera.x = 0; this.camera.y = 0;
    }
    setCoop(enabled) { return super.setCoop(this.isLegacyMissionV131() ? false : enabled); }
    syncLegacyWorldV131() {
      if (!this.isLegacyMissionV131() || !this.mission) return;
      const state = this.legacyMissionV131;
      state.actors = this.enemies.filter(actor => actor.legacyRoleV131).map(actor => ({ id: actor.legacyIdV131, role: actor.legacyRoleV131,
        x: actor.x, y: actor.y, health: actor.alive ? actor.health : 0, alive: Boolean(actor.alive), attackClock: clamp(actor.attackClock || 0, 0, 2) }));
      this.mission.phase = state.complete ? 'complete' : LEGACY_STATIONS_V131[state.kind][state.stage].id;
      this.mission.objectives = { power: state.stage >= 1, route: state.stage >= 2, archive: state.stage >= 3,
        boss: state.kind === 'nostromo' ? state.stage >= 4 : state.kind === 'abyss' ? state.stage >= 5 : state.stage >= 4, extract: state.complete };
      this.objective.complete = state.complete; this.coopEnabled = false;
      const thresholds = state.kind === 'nostromo' ? [2, 3, 5] : [4];
      this.doors.forEach((door, index) => { door.open = state.stage >= thresholds[index]; door.levelLocked = !door.open; if (!door.open) door.progress = 0; });
      if (state.kind !== 'nostromo') { state.hull = Math.max(0, this.vehicle.hull); state.fuel = Math.max(0, this.vehicle.fuel); this.vehicle.driver = state.aboard ? this.player : null; this.vehicle.occupied = state.aboard; }
      if (state.complete) this.mission.rewards = clone(state.rewards);
    }
    pinLegacyDriverV131() {
      const actor = this.player, vehicle = this.vehicle;
      Object.assign(actor, { x: vehicle.x + vehicle.w / 2 - actor.w / 2, y: vehicle.y + vehicle.h / 2 - actor.h / 2,
        vx: vehicle.vx || 0, vy: vehicle.vy || 0, inVehicle: true, grounded: false, climbing: false, facing: vehicle.facing || 1 });
      vehicle.driver = actor; vehicle.occupied = true;
    }
    advanceLegacyStageV131() {
      const state = this.legacyMissionV131, current = LEGACY_STATIONS_V131[state.kind][state.stage];
      if (state.stage >= LEGACY_STATIONS_V131[state.kind].length - 1) return false;
      // These are chapter pacing targets, not invented timestamps from a film.
      if (state.kind === 'nostromo' && state.elapsed > [25, 50, 80, 125, 155, 185][state.stage]) state.synchronization = Math.max(0, state.synchronization - 5);
      state.journal.push(current.id); state.stage++; state.hold = 0;
      if (state.kind === 'nostromo' && state.stage === 3) this.spawnLegacyEnemyV131('hunt', 0, 1470, 570);
      if (state.kind === 'abyss' && state.stage === 4) this.spawnLegacyEnemyV131('predator', 0, 2220, 850);
      if (state.kind === 'broodstorm' && state.stage === 3) this.spawnLegacyEnemyV131('queen', 0, 2330, 440);
      this.syncLegacyWorldV131(); this.checkpoint = { id: 'insertion', x: this.player.x, y: this.player.y };
      this.legacyCheckpointV131 = this.captureLegacyCheckpointV131();
      this.onEvent({ type: 'checkpoint', checkpoint: `legacy-${state.kind}-${current.id}`, operationId: state.operationId });
      this.onEvent({ type: 'legacy-operation-radio', operationId: state.operationId, text: this.getLegacyMissionDossierV131().title });
      return true;
    }
    spawnLegacyEnemyV131(role, index, x, groundY) {
      const actor = this.createEnemy(this.legacyCatalogV131.get(PROFILES[role]), index + 1310, x, groundY, { boss: ['queen', 'predator'].includes(role) });
      Object.assign(actor, { id: `legacy-${role}-${index}`, legacyIdV131: `${role}-${index}`, legacyRoleV131: role,
        health: role === 'hunt' ? 160 : role === 'fighter' ? 75 : 420, maxHealth: role === 'hunt' ? 160 : role === 'fighter' ? 75 : 420,
        attackClock: 1.5, alert: true, attackWindupClock: 0 });
      if (role === 'queen') { actor.name = 'FlyingQueen · Queen adaptée'; actor.visualApproximation = true; actor.visualFallbackReason = 'Gameplay aérien adapté ; planche FlyingQueen dédiée absente.'; }
      if (role === 'predator') { actor.name = 'Briseur hydrothermal · Ceto adapté'; actor.visualApproximation = true; actor.visualFallbackReason = 'Boss de chapitre adapté du prédateur Ceto existant.'; }
      this.enemies.push(actor); return actor;
    }
    updateObjectiveRuntime(delta) { if (!this.isLegacyMissionV131()) return super.updateObjectiveRuntime(delta); }
    updateMissionPhase() { if (!this.isLegacyMissionV131()) return super.updateMissionPhase(); this.syncLegacyWorldV131(); }
    missingObjectiveRequirement(options) { return this.isLegacyMissionV131() ? this.missingLegacyRequirementV131() : super.missingObjectiveRequirement(options); }
    missingExtractionRequirement() { return this.isLegacyMissionV131() ? this.missingLegacyRequirementV131() : super.missingExtractionRequirement(); }
    missingLegacyRequirementV131() {
      const state = this.legacyMissionV131, final = LEGACY_STATIONS_V131[state.kind].at(-1), actor = state.aboard ? this.vehicle : this.player;
      return state.stage === LEGACY_STATIONS_V131[state.kind].length - 1 && state.hold >= final.seconds && near(actor, final)
        && (state.kind !== 'broodstorm' || state.escort.hull > 0 && state.escort.arrived)
        && (state.kind !== 'nostromo' || state.countdown > 0)
        && (state.kind === 'nostromo' || !this.vehicle.destroyed && this.vehicle.hull > 0 && this.vehicle.fuel > 0)
        && (state.kind !== 'abyss' || state.oxygen > 0 && (!state.aboard || state.battery > 0)) ? '' : 'CHAPITRE ET EXTRACTION PHYSIQUE REQUIS';
    }
    doorRequirement(door) { return this.isLegacyMissionV131() && door?.lockedBy === 'legacy-script' ? door.levelLocked ? 'SÉQUENCE DU CHAPITRE REQUISE' : '' : super.doorRequirement(door); }
    getDoorRenderState(door, options) {
      const render = super.getDoorRenderState(door, options);
      // Full-volume script gates must not inherit a bitmap-derived 600px wide
      // collider. The authored bounds govern both the image and the obstacle.
      return this.isLegacyMissionV131() && door?.lockedBy === 'legacy-script'
        ? { ...render, x: door.x, y: door.y, w: door.w, h: door.h } : render;
    }
    interact(actor = this.player) {
      if (!this.isLegacyMissionV131()) return super.interact(actor);
      if (!this.canLegacyActV131(actor, true)) return false;
      const state = this.legacyMissionV131, station = LEGACY_STATIONS_V131[state.kind][state.stage], body = state.aboard ? this.vehicle : actor;
      if (near(body, station)) return station.seconds > 0;
      if (state.kind === 'abyss') return this.toggleVehicle(actor);
      return false;
    }
    toggleVehicle(actor = this.player) {
      if (!this.isLegacyMissionV131()) return super.toggleVehicle(actor);
      const state = this.legacyMissionV131;
      if (state.kind !== 'abyss' || !this.canLegacyActV131(actor, true) || this.vehicle.destroyed || state.hull <= 0) return false;
      if (!state.aboard && !near(actor, center(this.vehicle), 135)) return false;
      if (state.aboard) {
        const candidates = [-1, 1].map(sign => ({ x: this.vehicle.x + this.vehicle.w / 2 + sign * (this.vehicle.w / 2 + 20) - actor.w / 2,
          y: this.vehicle.y + this.vehicle.h / 2 - actor.h / 2, w: actor.w, h: actor.h }));
        const bounds = LEGACY_BOUNDS_V131.abyss, obstacles = [...this.walls, ...this.platforms, ...this.doors.filter(door => door.progress < 0.82)];
        const exit = candidates.find(box => box.x >= 0 && box.y >= 0 && box.x + box.w <= bounds.width && box.y + box.h <= bounds.height && !obstacles.some(obstacle => inside(box, obstacle)));
        if (!exit) return false; actor.x = exit.x; actor.y = exit.y; actor.vx = 0; actor.vy = 0;
      }
      state.aboard = !state.aboard; actor.inVehicle = state.aboard; this.vehicle.driver = state.aboard ? actor : null; this.vehicle.occupied = state.aboard;
      if (state.aboard) this.pinLegacyDriverV131(); this.syncLegacyWorldV131(); return true;
    }
    activateTracker(actor = this.player) {
      if (!this.isLegacyMissionV131() || this.legacyMissionV131.kind === 'nostromo') return super.activateTracker(actor);
      if (!this.canLegacyActV131(actor, true)) return false;
      const state = this.legacyMissionV131;
      if (state.kind === 'abyss') { if (state.aboard) return false; const modes = ['neutral', 'weighted', 'magnetic']; state.hadalMode = modes[(modes.indexOf(state.hadalMode) + 1) % modes.length]; }
      else state.wingMode = state.wingMode === 'follow' ? 'suppress' : 'follow';
      return true;
    }
    moveLegacyBodyV131(actor, dx, dy) {
      const obstacles = [...this.walls, ...this.doors.filter(door => door.progress < 0.82), ...this.platforms];
      for (const axis of ['x', 'y']) {
        const displacement = { x: axis === 'x' ? dx : 0, y: axis === 'y' ? dy : 0 };
        const contacts = obstacles.map(box => sweepProjectileAabbV83(actor, displacement, box)).filter(Boolean).sort((a, b) => a.t - b.t);
        const fraction = contacts.length ? Math.max(0, contacts[0].t - 0.00001) : 1;
        actor[axis] += displacement[axis] * fraction;
        if (fraction < 1) actor[axis === 'x' ? 'vx' : 'vy'] = 0;
      }
      const bounds = LEGACY_BOUNDS_V131[this.legacyMissionV131.kind];
      actor.x = clamp(actor.x, 0, bounds.width - actor.w); actor.y = clamp(actor.y, 0, bounds.height - actor.h);
    }
    updatePlayer(actor, delta, controls) {
      if (!this.isLegacyMissionV131() || this.legacyMissionV131.kind === 'nostromo' || actor !== this.player) return super.updatePlayer(actor, delta, controls);
      if (!this.canLegacyActV131(actor)) return;
      for (const key of ['fireClock', 'actionClock', 'hazardClock', 'meleeClock', 'toolUseClock', 'interactionClock', 'grappledClock']) actor[key] = Math.max(0, (actor[key] || 0) - delta);
      if (actor.tacticalReload) this.advancePlayerReloadV77(actor, delta);
      const state = this.legacyMissionV131, body = state.aboard ? this.vehicle : actor;
      const held = direction => HELD[direction].some(key => this.keys.has(key));
      const blocked = !state.aboard && this.keys.has('ShiftLeft') || actor.stunClock > 0 || this.isFieldActionBusyV124?.(actor) || this.isPlaceableBusyV86?.(actor);
      let x = blocked ? 0 : Number(held('right')) - Number(held('left')), y = blocked ? 0 : Number(held('down')) - Number(held('up'));
      const length = Math.hypot(x, y); if (length > 1) { x /= length; y /= length; }
      const speed = state.aboard ? state.kind === 'broodstorm' ? 300 : 240 : state.hadalMode === 'neutral' ? 190 : state.hadalMode === 'weighted' ? 130 : 100;
      const magneticContact = !state.aboard && state.hadalMode === 'magnetic' && [...this.walls, ...this.platforms,
        ...this.doors.filter(door => door.progress < 0.82)].some(box => Math.abs(body.y + body.h - box.y) < 2 && body.x + body.w > box.x && body.x < box.x + box.w
          || Math.min(Math.abs(body.x + body.w - box.x), Math.abs(body.x - box.x - box.w)) < 2 && body.y + body.h > box.y && body.y < box.y + box.h);
      body.vx = x * speed; body.vy = y * speed + (!state.aboard && state.hadalMode !== 'neutral' && !magneticContact ? state.hadalMode === 'weighted' ? 35 : 70 : 0);
      actor.magneticAttachedV131 = Boolean(magneticContact);
      if (body.vx) body.facing = Math.sign(body.vx);
      this.moveLegacyBodyV131(body, body.vx * delta, body.vy * delta);
      actor.grounded = !state.aboard && this.platforms.some(platform => Math.abs(actor.y + actor.h - platform.y) < 1);
      actor.climbing = false; if (state.aboard) this.pinLegacyDriverV131();
      if (this.keys.has('KeyF') || this.keys.has('TouchFire')) this.fire(actor);
    }
    updateVehicleDriver(actor, delta, controls) { if (!this.isLegacyMissionV131()) return super.updateVehicleDriver(actor, delta, controls); }
    updateEnemy(enemy, delta) {
      if (!this.isLegacyMissionV131() || !enemy.legacyRoleV131 || enemy.legacyRoleV131 === 'hunt') return super.updateEnemy(enemy, delta);
      if (!enemy.alive) return;
      const state = this.legacyMissionV131, body = state.aboard ? this.vehicle : this.player;
      const escort = state.kind === 'broodstorm' && enemy.legacyRoleV131 === 'fighter' ? { ...state.escort, w: 180, h: 86 } : null;
      const target = escort || body, from = center(enemy), to = center(target), d = Math.hypot(to.x - from.x, to.y - from.y);
      const speed = enemy.legacyRoleV131 === 'fighter' ? 105 : enemy.legacyRoleV131 === 'queen' ? 135 : 115;
      enemy.vx = d > 65 ? (to.x - from.x) / Math.max(d, 1) * speed : 0;
      enemy.vy = d > 65 ? (to.y - from.y) / Math.max(d, 1) * speed : 0;
      this.moveLegacyBodyV131(enemy, enemy.vx * delta, enemy.vy * delta); if (enemy.vx) enemy.facing = Math.sign(enemy.vx);
      enemy.attackClock = Math.max(0, enemy.attackClock - delta); enemy.hurtClock = Math.max(0, (enemy.hurtClock || 0) - delta);
      if (d < Math.max(100, target.w / 2 + enemy.w / 2 + 32) && enemy.attackClock === 0) {
        enemy.attackClock = 1.3;
        if (escort) state.escort.hull = Math.max(0, state.escort.hull - 8);
        else this.damagePlayer(this.player, 12, 'legacy-contact');
      }
    }
    defeatEnemy(enemy, actor) {
      const result = super.defeatEnemy(enemy, actor);
      const state = this.legacyMissionV131;
      if (state && !enemy.alive && (state.kind === 'abyss' && state.stage === 4 && enemy.legacyRoleV131 === 'predator'
        || state.kind === 'broodstorm' && state.stage === 3 && enemy.legacyRoleV131 === 'queen')) this.advanceLegacyStageV131();
      else if (state) this.syncLegacyWorldV131();
      return result;
    }
    dropLegacyBombV131() {
      if (!this.canLegacyActV131(this.player, true)) return false;
      const state = this.legacyMissionV131;
      if (state.kind !== 'broodstorm' || state.stage < 1 || state.bombs <= 0 || state.bombClock > 0) return false;
      state.bombs--; state.bombClock = 0.8;
      this.legacyBombsV131.push({ x: this.vehicle.x + this.vehicle.w / 2, y: this.vehicle.y + this.vehicle.h,
        w: 12, h: 20, vx: this.vehicle.vx * 0.25, vy: 170, life: 5 }); return true;
    }
    updateLegacyBombsV131(delta) {
      const state = this.legacyMissionV131;
      for (const bomb of this.legacyBombsV131) {
        bomb.vy += 150 * delta; const step = { x: bomb.vx * delta, y: bomb.vy * delta };
        const targets = [...nests.map((box, index) => ({ ...box, index })).filter(box => state.nests[box.index] > 0), ...this.walls, ...this.platforms];
        const hit = targets.map(box => ({ box, contact: sweepProjectileAabbV83(bomb, step, box) })).filter(entry => entry.contact).sort((a, b) => a.contact.t - b.contact.t)[0];
        if (hit) { if (Number.isInteger(hit.box.index)) state.nests[hit.box.index] = Math.max(0, state.nests[hit.box.index] - 70); bomb.life = 0; }
        else { bomb.x += step.x; bomb.y += step.y; bomb.life -= delta; }
      }
      this.legacyBombsV131 = this.legacyBombsV131.filter(bomb => bomb.life > 0);
    }
    updateLegacyDirectorV131(delta) {
      const state = this.legacyMissionV131;
      if (state.stage < 1) return;
      state.directorClock = Math.max(0, state.directorClock - delta); state.wingClock = Math.max(0, state.wingClock - delta);
      if (state.wave < 6 && state.directorClock === 0) {
        this.spawnLegacyEnemyV131('fighter', state.wave++, Math.min(LEGACY_BOUNDS_V131.broodstorm.width - 180, state.escort.x + 420), state.escort.y + 150);
        state.directorClock = 8;
      }
      if (!state.escort.arrived && Math.abs(center(this.vehicle).x - state.escort.x) < 650) {
        state.escort.x = Math.min(2110, state.escort.x + delta * (state.nests.every(hp => hp === 0) ? 85 : 35));
        state.escort.arrived = state.escort.x === 2110;
      }
      if (state.escort.x > 780 && state.nests.some(hp => hp > 0)) state.escort.hull = Math.max(0, state.escort.hull - delta * 1.8);
      if (state.wingClock === 0) {
        const target = this.enemies.filter(enemy => enemy.alive && enemy.legacyRoleV131).find(enemy =>
          Math.hypot(center(enemy).x - center(this.vehicle).x, center(enemy).y - center(this.vehicle).y) < (state.wingMode === 'suppress' ? 720 : 360));
        if (target) {
          // Wing rounds use the real swept projectile path and cannot cross a cliff.
          const origin = { x: this.vehicle.x + this.vehicle.w / 2 - 115, y: this.vehicle.y - 65 }, destination = center(target), length = Math.hypot(destination.x - origin.x, destination.y - origin.y);
          this.bullets.push({ ...origin, w: 9, h: 4, vx: (destination.x - origin.x) / length * 890,
            vy: (destination.y - origin.y) / length * 890, damage: state.wingMode === 'suppress' ? 28 : 16,
            life: 1.1, owner: this.player, facing: 1, hitEnemyIds: [] }); state.wingClock = 1.3;
        }
      }
    }
    update(delta) {
      if (!this.isLegacyMissionV131()) return super.update(delta);
      if (!this.running || this.paused || this.enemyAtlasLoadingPausedV65 || this.userCasteLoadingV88 || this.mission?.state !== 'active') return;
      const seconds = Number(delta); if (!Number.isFinite(seconds) || seconds <= 0) return;
      if (!this.player?.alive || this.player.downed) { this.failMission('Opérateur perdu dans le chapitre.'); return; }
      // Bound a frame and substep physics; pause time is never accumulated.
      let remaining = Math.min(seconds, 0.25);
      while (remaining > 1e-9 && this.canLegacyActV131()) {
        const dt = Math.min(remaining, 1 / 60), state = this.legacyMissionV131; remaining -= dt;
        state.elapsed += dt; state.bombClock = Math.max(0, state.bombClock - dt);
        for (const key of ['KeyE', 'KeyQ', 'KeyB']) {
          const held = this.keys.has(key);
          if (held && !this.legacyHeldV131.has(key) && key === 'KeyB') this.dropLegacyBombV131();
          if (held) this.legacyHeldV131.add(key); else this.legacyHeldV131.delete(key);
        }
        // Q dispatches through activateTracker from the shared keyboard binding.
        if (state.kind === 'nostromo' && state.stage >= 6) {
          state.countdown = Math.max(0, state.countdown - dt); if (!state.countdown) { this.failMission('Nostromo : autodestruction avant le départ.'); break; }
        }
        if (state.kind === 'abyss') {
          const head = { x: this.player.x + this.player.w / 2 - 3, y: this.player.y + 12, w: 6, h: 12 };
          const inBell = bells.some(bell => inside(head, bell));
          state.oxygen = clamp(state.oxygen + dt * (inBell || state.aboard ? 16 : -0.65), 0, 100);
          const depth = (state.aboard ? this.vehicle.y + this.vehicle.h / 2 : center(this.player).y), limit = state.aboard ? 960 : state.hadalMode === 'neutral' ? 650 : 960;
          state.pressure = clamp(state.pressure + dt * (depth > limit ? 9 : -12), 0, 100);
          if (state.pressure >= 100) this.damagePlayer(this.player, dt * 18, 'pression');
          if (state.oxygen <= 0) { this.failMission('HADAL : réserve d’oxygène épuisée.'); break; }
          if (state.aboard) state.battery = Math.max(0, state.battery - dt * 0.14);
          if (state.aboard && state.battery === 0) { this.failMission('MANTA : batterie épuisée.'); break; }
        }
        if (state.kind === 'broodstorm') {
          this.updateLegacyDirectorV131(dt); this.updateLegacyBombsV131(dt);
          if (state.escort.hull <= 0) { this.failMission('BROODSTORM : transport d’escorte perdu.'); break; }
          if (state.bombs === 0 && !this.legacyBombsV131.length && state.nests.some(hp => hp > 0)) {
            this.failMission('BROODSTORM : bombes épuisées avant neutralisation des nids.'); break;
          }
        }
        if (state.kind !== 'nostromo') {
          this.vehicle.fuel = Math.max(0, this.vehicle.fuel - dt * (state.aboard ? 0.12 + (Math.abs(this.vehicle.vx) + Math.abs(this.vehicle.vy) > 20 ? 0.18 : 0) : 0));
          if (this.vehicle.destroyed || this.vehicle.hull <= 0 || this.vehicle.fuel <= 0) { this.failMission('Véhicule de chapitre perdu ou carburant épuisé.'); break; }
        }
        const station = LEGACY_STATIONS_V131[state.kind][state.stage], body = state.aboard ? this.vehicle : this.player;
        const blocked = state.kind === 'nostromo' && state.stage === 3 && this.enemies.some(enemy => enemy.legacyRoleV131 === 'hunt' && enemy.alive)
          || state.kind === 'abyss' && state.stage === 3 && (state.aboard || state.hadalMode === 'neutral');
        if (station.seconds > 0 && near(body, station) && this.keys.has('KeyE') && this.canLegacyActV131(this.player, true) && !blocked) {
          state.hold = Math.min(station.seconds, state.hold + dt);
          if (state.hold >= station.seconds) {
            if (state.stage === LEGACY_STATIONS_V131[state.kind].length - 1) this.completeMission();
            else this.advanceLegacyStageV131();
          }
        } else state.hold = 0;
        if (state.kind === 'abyss' && state.stage === 4 && this.enemies.some(enemy => enemy.legacyRoleV131 === 'predator' && !enemy.alive)) this.advanceLegacyStageV131();
        if (state.kind === 'broodstorm' && (state.stage === 1 && state.nests.every(hp => hp === 0)
          || state.stage === 2 && state.escort.arrived || state.stage === 3 && this.enemies.some(enemy => enemy.legacyRoleV131 === 'queen' && !enemy.alive))) this.advanceLegacyStageV131();
        if (this.mission.state === 'active') super.update(dt);
        this.syncLegacyWorldV131(); const bounds = LEGACY_BOUNDS_V131[state.kind];
        this.player.x = clamp(this.player.x, 0, bounds.width - this.player.w);
        this.camera.x = clamp(this.camera.x, 0, Math.max(0, bounds.width - 1280)); this.camera.y = clamp(this.camera.y, 0, Math.max(0, bounds.height - 720));
      }
    }
    completeMission(actor = this.player) {
      if (!this.isLegacyMissionV131()) return super.completeMission(actor);
      const state = this.legacyMissionV131;
      if (!this.canLegacyActV131(actor, true) || state.complete || state.rewardClaimed || this.missingLegacyRequirementV131()) return false;
      const rewards = { credits: 620, salvage: this.inventory.salvage, intel: this.inventory.intel,
        retries: this.mission.retries, elapsedSeconds: Math.round(this.mission.elapsed), noCasualty: this.mission.casualties === 0,
        operationId: state.operationId, chapter: state.kind, status: 'partial', synchronization: state.synchronization };
      state.complete = true; state.rewardClaimed = true; state.rewards = rewards; this.syncLegacyWorldV131();
      const sink = this.onEvent; this.onEvent = event => { if (event.type === 'mission-complete') { this.mission.rewards = clone(rewards); sink({ ...event, rewards: clone(rewards), operationId: state.operationId }); } else sink(event); };
      let result; try { result = super.completeMission(actor); } finally { this.onEvent = sink; }
      if (!result) { state.complete = false; state.rewardClaimed = false; state.rewards = null; this.syncLegacyWorldV131(); }
      return result;
    }
    damagePlayer(actor, damage, kind) {
      const health = actor?.health, armor = actor?.armor, result = super.damagePlayer(actor, damage, kind);
      if (this.legacyMissionV131?.kind === 'nostromo' && actor === this.player
        && (actor.health < health || actor.armor < armor)) this.legacyMissionV131.synchronization = Math.max(0, this.legacyMissionV131.synchronization - 2);
      return result;
    }
    captureLegacyCheckpointV131() {
      const raw = this.captureResumeState(); delete raw.specialOperation.legacyCheckpointV131; return clone(raw);
    }
    captureResumeState() {
      const raw = super.captureResumeState(); if (!this.isLegacyMissionV131()) return raw;
      this.syncLegacyWorldV131();
      return { ...raw, player: { ...raw.player, inVehicle: Boolean(this.player.inVehicle) },
        mission: { ...raw.mission, rewards: this.mission.rewards ? clone(this.mission.rewards) : null },
        specialOperation: { ...raw.specialOperation, operationId: this.legacyMissionV131.operationId,
        legacyMissionV131: clone(this.legacyMissionV131), legacyCheckpointV131: this.legacyCheckpointV131 ? clone(this.legacyCheckpointV131) : null } };
    }
    validateLegacyResumeV131(raw) {
      const checked = validateLegacyOperationStateV131(raw?.specialOperation?.legacyMissionV131);
      if (!checked.valid) return checked;
      const state = checked.state, bounds = LEGACY_BOUNDS_V131[state.kind], identity = raw.identity;
      const rejection = { valid: false, reason: 'legacy-identity-mismatch' };
      if (raw.schema !== 1 || state.kind !== this.legacyMissionV131.kind || raw.specialOperation.operationId !== state.operationId
        || !identity || ['campaignId', 'worldId', 'levelSeedId', 'objectiveId', 'editorProjectKind'].some(key => identity[key] !== this.resumeIdentity?.[key])
        || Number(identity.seed) !== Number(this.resumeIdentity?.seed) || raw.missionLevel?.signature !== this.missionLevelRuntime?.signature
        || !['active', 'failed', 'complete'].includes(raw.mission?.state) || state.complete !== (raw.mission.state === 'complete')
        || !Number.isFinite(raw.player?.x) || !Number.isFinite(raw.player?.y) || raw.player.x < 0 || raw.player.x + this.player.w > bounds.width
        || raw.player.y < 0 || raw.player.y + this.player.h > bounds.height || raw.coop?.enabled
        || raw.player.inVehicle !== state.aboard
        || !Array.isArray(raw.enemies) || raw.enemies.length !== state.actors.length
        || state.actors.some(actor => { const saved = raw.enemies.find(enemy => enemy.id === `legacy-${actor.id}`);
          return !saved || saved.alive !== actor.alive || Math.abs(saved.x - actor.x) > 0.001 || Math.abs(saved.y - actor.y) > 0.001 || saved.health !== actor.health; })
        || state.complete && (JSON.stringify(raw.mission.rewards) !== JSON.stringify(state.rewards)
          || raw.inventory?.salvage !== state.rewards.salvage || raw.inventory?.intel !== state.rewards.intel
          || !raw.player.alive || raw.player.downed
          || !near(state.aboard ? { ...raw.vehicle, w: this.vehicle.w, h: this.vehicle.h } : { ...raw.player, w: this.player.w, h: this.player.h }, LEGACY_STATIONS_V131[state.kind].at(-1)))) return rejection;
      if (state.kind === 'nostromo') {
        if (raw.vehicle?.active || state.stage < 2 && raw.player.x + this.player.w > 720 || state.stage < 3 && raw.player.x + this.player.w > 1100
          || state.stage < 5 && raw.player.x + this.player.w > 1880) return rejection;
      } else if (!raw.vehicle?.active || raw.vehicle.id !== this.vehicle.id || raw.vehicle.destroyed !== (state.hull <= 0) || raw.vehicle.hull !== state.hull
        || raw.vehicle.fuel !== state.fuel || !Number.isFinite(raw.vehicle.x) || !Number.isFinite(raw.vehicle.y)
        || raw.vehicle.x < 0 || raw.vehicle.x + this.vehicle.w > bounds.width || raw.vehicle.y < 0 || raw.vehicle.y + this.vehicle.h > bounds.height
        || raw.vehicle.occupied !== state.aboard || raw.vehicle.driver !== (state.aboard ? 'player' : null)) return rejection;
      const expected = geometry(state.kind).doors, thresholds = state.kind === 'nostromo' ? [2, 3, 5] : [4];
      if (!Array.isArray(raw.missionLevel.doors) || raw.missionLevel.doors.length !== expected.length || expected.some((door, index) => {
        const saved = raw.missionLevel.doors.find(entry => entry.id === door.id), open = state.stage >= thresholds[index];
        return !saved || saved.open !== open || saved.levelLocked !== !open || !Number.isFinite(saved.progress) || saved.progress < 0 || saved.progress > 1 || !open && saved.progress !== 0;
      })) return rejection;
      const authored = geometry(state.kind), obstacles = [...authored.walls, ...authored.platforms,
        ...authored.doors.filter(door => raw.missionLevel.doors.find(saved => saved.id === door.id).progress < 0.82)];
      const physical = state.aboard ? { ...raw.vehicle, w: this.vehicle.w, h: this.vehicle.h }
        : { ...raw.player, w: this.player.w, h: this.player.h };
      if (obstacles.some(box => inside(physical, box)) || state.kind === 'abyss' && state.stage < 4
        && (raw.player.x + this.player.w > 1940 || raw.vehicle.x + this.vehicle.w > 1940)) return rejection;
      return checked;
    }
    applyResumeState(raw) {
      if (!this.isLegacyMissionV131()) return super.applyResumeState(raw);
      const checked = this.validateLegacyResumeV131(raw); if (!checked.valid) return { applied: false, reason: checked.reason, restored: 0 };
      const checkpoint = raw.specialOperation.legacyCheckpointV131;
      if (checkpoint && (!this.validateLegacyResumeV131(checkpoint).valid
        || checkpoint.specialOperation.legacyMissionV131.stage > checked.state.stage
        || checkpoint.specialOperation.legacyMissionV131.complete)) return { applied: false, reason: 'legacy-checkpoint-invalid', restored: 0 };
      const previous = this.legacyMissionV131, previousEnemies = this.enemies;
      this.legacyMissionV131 = checked.state; this.enemies = [];
      for (const saved of checked.state.actors) {
        const enemy = this.spawnLegacyEnemyV131(saved.role, Number(saved.id.split('-')[1]), saved.x, saved.y + 100);
        Object.assign(enemy, { x: saved.x, y: saved.y, alive: saved.alive, health: saved.health, attackClock: Math.max(0.5, saved.attackClock) });
      }
      const result = super.applyResumeState(raw);
      if (!result?.applied) { this.legacyMissionV131 = previous; this.enemies = previousEnemies; return result; }
      if (!this.legacyMissionV131.complete) this.legacyMissionV131.hold = 0;
      this.legacyBombsV131 = []; this.legacyHeldV131.clear();
      this.legacyCheckpointV131 = checkpoint ? clone(checkpoint) : null;
      this.player.vx = 0; this.player.vy = 0; this.player.inVehicle = checked.state.aboard;
      if (checked.state.aboard) this.pinLegacyDriverV131();
      this.clearGameplayInput?.(); this.syncLegacyWorldV131(); return { ...result, legacyMissionRestoredV131: true };
    }
    restartFromCheckpoint() {
      if (!this.isLegacyMissionV131()) return super.restartFromCheckpoint();
      if (this.mission.state !== 'failed' || !this.legacyCheckpointV131 || this.paused) return false;
      const raw = clone(this.legacyCheckpointV131); raw.mission.state = 'active'; raw.mission.failureReason = null; raw.mission.retries = this.mission.retries + 1;
      const result = this.applyResumeState(raw); if (!result.applied) return false;
      this.onEvent({ type: 'mission-restarted', operationId: this.legacyMissionV131.operationId }); return true;
    }
    getLegacyMissionDossierV131() { return this.isLegacyMissionV131() ? legacyOperationDossierV131(this.legacyMissionV131) : null; }
    phaseLabel() { return this.isLegacyMissionV131() ? this.getLegacyMissionDossierV131().title : super.phaseLabel(); }
    objectiveProgressText() { return this.isLegacyMissionV131() ? this.getLegacyMissionDossierV131().instruction : super.objectiveProgressText(); }
    getInteractionPrompt() {
      if (!this.isLegacyMissionV131()) return super.getInteractionPrompt();
      const state = this.legacyMissionV131, station = LEGACY_STATIONS_V131[state.kind][state.stage], body = state.aboard ? this.vehicle : this.player;
      if (near(body, station)) return station.seconds ? `MAINTENIR E · ${station.label} · ${state.hold.toFixed(1)}/${station.seconds} S` : station.label;
      return state.kind === 'abyss' && (state.aboard || near(this.player, center(this.vehicle), 135)) ? 'E / V · MANTA · EMBARQUER / SORTIR' : '';
    }
    missionNavigationMapV121() {
      if (!this.isLegacyMissionV131()) return super.missionNavigationMapV121();
      const state = this.legacyMissionV131, station = LEGACY_STATIONS_V131[state.kind][state.stage], bounds = LEGACY_BOUNDS_V131[state.kind];
      return { mode: 'local', label: `CHAPITRE · ${state.kind.toUpperCase()}`, width: bounds.width, minY: 0, maxY: bounds.height,
        surfaces: this.platforms.map(box => ({ id: box.id, x: box.x, end: box.x + box.w, y: box.y })), ladders: [],
        goals: [{ ...station }], player: center(this.player) };
    }
    getSnapshot() { return { ...super.getSnapshot(), ...(this.isLegacyMissionV131() ? { legacyMissionV131: { ...clone(this.legacyMissionV131), dossier: this.getLegacyMissionDossierV131() } } : {}) }; }
    getGameplayReport() { return { ...super.getGameplayReport(), ...(this.isLegacyMissionV131() ? { legacyMissionV131: this.getSnapshot().legacyMissionV131 } : {}) }; }
    drawVehicle(ctx) {
      if (!this.isLegacyMissionV131() || this.legacyMissionV131.kind !== 'abyss') return super.drawVehicle(ctx);
      const body = this.vehicle; if (!body.active) return;
      ctx.save(); ctx.fillStyle = '#236579'; ctx.fillRect(body.x, body.y, body.w, body.h); ctx.strokeStyle = '#92cbd9'; ctx.lineWidth = 3;
      ctx.strokeRect(body.x, body.y, body.w, body.h); ctx.fillStyle = '#b4e3dd'; ctx.fillRect(body.x + 28, body.y + 16, 72, 32);
      ctx.font = '11px monospace'; ctx.fillText('MANTA · PROTOTYPE', body.x, body.y - 12); ctx.restore();
    }
    drawActor(ctx, actor) {
      super.drawActor(ctx, actor);
      if (this.legacyMissionV131?.kind !== 'abyss' || actor !== this.player || actor.inVehicle || !actor.alive) return;
      ctx.save(); ctx.strokeStyle = actor.magneticAttachedV131 ? '#efd18a' : '#a0e5e5'; ctx.lineWidth = 2;
      ctx.strokeRect(actor.x - 4, actor.y + 6, actor.w + 8, actor.h - 8);
      ctx.fillStyle = '#9edbdacc'; ctx.fillRect(actor.x + 3, actor.y + 14, actor.w - 6, 12); ctx.restore();
    }
    drawWorld(ctx) {
      super.drawWorld(ctx); if (!this.isLegacyMissionV131()) return;
      const state = this.legacyMissionV131; ctx.save(); ctx.font = '12px monospace';
      if (state.kind === 'abyss') {
        ctx.fillStyle = '#07577333'; ctx.fillRect(0, 0, 2800, 990);
        for (const bell of bells) { ctx.fillStyle = '#315761aa'; ctx.fillRect(bell.x, bell.y, bell.w, bell.h); ctx.strokeStyle = '#88daca'; ctx.strokeRect(bell.x, bell.y, bell.w, bell.h); ctx.fillStyle = '#bce6da'; ctx.fillText('CLOCHE · AIR', bell.x + 10, bell.y + 20); }
      }
      if (state.kind === 'broodstorm') {
        nests.forEach((box, index) => { ctx.fillStyle = state.nests[index] > 0 ? '#874b3c' : '#282a25'; ctx.fillRect(box.x, box.y, box.w, box.h); ctx.fillStyle = '#f1c394'; ctx.fillText(`NID ${index + 1} · ${state.nests[index]}`, box.x, box.y - 12); });
        const allied = [{ id: 'escort', x: state.escort.x, y: state.escort.y, w: 180, h: 86, facing: 1, alive: state.escort.hull > 0 },
          { id: 'wing', x: this.vehicle.x - 180, y: this.vehicle.y - 100, w: 180, h: 86, facing: this.vehicle.facing }];
        for (const body of allied) {
          const vehicle = { ...this.vehicle, ...body, occupied: false, driver: null };
          const sample = this.spriteAnimation?.sample(`legacy-allied-${body.id}`, resolveVehicleAnimation(vehicle), this.animationTime, { emit: false });
          this.drawSpriteSample(ctx, sample, vehicle); ctx.fillStyle = '#9ce6cf'; ctx.fillText(body.id === 'escort' ? `ESCORTE · ${Math.ceil(state.escort.hull)}` : `AILE · ${state.wingMode}`, body.x, body.y - 14);
        }
        ctx.fillStyle = '#e9c073'; for (const bomb of this.legacyBombsV131) ctx.fillRect(bomb.x, bomb.y, bomb.w, bomb.h);
      }
      for (const station of LEGACY_STATIONS_V131[state.kind].filter(entry => entry.seconds > 0)) {
        ctx.fillStyle = '#244847'; ctx.fillRect(station.x - 18, station.y - 24, 36, 48);
        ctx.fillStyle = '#a2dfcc'; ctx.fillText(station.label, station.x - 70, station.y - 36, 220);
      }
      ctx.restore();
    }
    drawHud(ctx) {
      super.drawHud(ctx); if (!this.isLegacyMissionV131()) return;
      const state = this.legacyMissionV131, dossier = this.getLegacyMissionDossierV131();
      const resources = state.kind === 'nostromo' ? `SYNCHRO ${Math.round(state.synchronization)}% · AUTO ${Math.ceil(state.countdown)} s`
        : state.kind === 'abyss' ? `O₂ ${Math.ceil(state.oxygen)} · PRESSION ${Math.ceil(state.pressure)} · HADAL ${state.hadalMode} · MANTA ${Math.ceil(state.battery)}%`
          : `COQUE ${Math.ceil(state.hull)} · ESCORTE ${Math.ceil(state.escort.hull)} · CARB ${Math.ceil(state.fuel)} · BOMBES ${state.bombs} · AILE ${state.wingMode}`;
      ctx.save(); ctx.fillStyle = '#071c24ed'; ctx.fillRect(18, 113, 1220, 89); ctx.fillStyle = '#bce3dc'; ctx.font = 'bold 13px monospace';
      ctx.fillText(`${dossier.title} · ${resources}`, 30, 132, 1190); ctx.font = '11px monospace';
      ctx.fillText(dossier.instruction, 30, 151, 1190); ctx.fillText(`CHAPITRE PARTIEL · ${dossier.limitations}`, 30, 169, 1190);
      ctx.fillText(this.getInteractionPrompt(), 30, 190, 1190); ctx.restore();
    }
  };
}
