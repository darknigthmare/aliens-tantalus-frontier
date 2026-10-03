import { VEHICLES } from './content-core-v50.js';
import { buildMissionLevelV52 } from './mission-levels-v52.js';
import { cancelTacticalReloadV77 } from './tactical-reload-v77.js';
import { APC_CONVOY_CAMPAIGN_V121, APC_CONVOY_OPERATION_V121, APC_CONVOY_LIMITS_V121,
  createApcConvoyStateV121, sanitizeApcConvoyStateV121, validateApcConvoyStateV121,
  apcConvoyPhaseV121, apcConvoyDossierV121 } from './apc-convoy-state-v121.js';
export { APC_CONVOY_CAMPAIGN_V121 } from './apc-convoy-state-v121.js';
export const APC_CONVOY_ASSET_V121 = '/assets/openai/sprites/normalized/vehicles/m577-apc-action-sheet.png';
const APC_ID = 'vehicle-001-m577-armored-personnel-carrier';
const safeProfiles = new Set(['enemy-004-drone-big-chap', 'enemy-005-warrior', 'enemy-006-runner', 'enemy-008-queen', 'enemy-009-crusher']);
const list = value => Array.isArray(value) ? value : [];
const center = actor => actor.x + actor.w / 2;
const clone = value => structuredClone(value);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const collisionBounds = actor => {
  const local = actor.spriteHitbox?.local;
  return local ? { x: actor.x + local.x, y: actor.y + local.y, w: local.w, h: local.h } : actor;
};

export function buildApcConvoyLevelV121(options = {}) {
  const plan = buildMissionLevelV52({ ...options, campaign: options.campaign || APC_CONVOY_CAMPAIGN_V121, templateId: 'colony-multiroute' });
  return { ...plan, label: 'APC · corridor de feu', signature: `${plan.signature}:apc-convoy-v121` };
}
export function withApcConvoyRuntimeV121(BaseEngine) {
  if (BaseEngine.apcConvoyRuntimeV121 === true) return BaseEngine;
  return class ApcConvoyRuntimeV121 extends BaseEngine {
    static apcConvoyRuntimeV121 = true;
    start(options = {}) {
      this.apcConvoyActiveV121 = options.campaign?.id === APC_CONVOY_CAMPAIGN_V121.id;
      this.apcConvoyV121 = this.apcConvoyActiveV121 ? createApcConvoyStateV121() : null;
      this.apcConvoyCheckpointV121 = null;
      if (!this.apcConvoyActiveV121) return super.start(options);
      if (!options.missionLevel?.validation?.valid || !options.missionLevel.signature.endsWith(':apc-convoy-v121')) throw new Error('APC convoy requires buildApcConvoyLevelV121.');
      this.apcConvoyCatalogV121 = list(options.enemyCatalog).filter(profile => safeProfiles.has(profile.id));
      if (this.apcConvoyCatalogV121.length !== safeProfiles.size) throw new Error('APC convoy requires its five existing xenomorph profiles.');
      // Mission-issued ammunition and hull tuning are original gameplay rules,
      // not a new canonical M577 configuration or a change to its catalog entry.
      const base = VEHICLES.find(vehicle => vehicle.id === APC_ID);
      super.start({ ...options, resumeState: undefined, vehicle: { ...base, hull: 340, cargo: 60 }, crew: [],
        squad: [], userCasteCampaignV88: false, neuroProfile: null, apexDossier: null });
      this.configureApcConvoyWorldV121();
      if (options.resumeState) this.lastResumeResult = this.applyResumeState(options.resumeState);
      this.syncApcConvoyWorldV121();
      this.apcConvoyCheckpointV121 ||= this.captureApcConvoyCheckpointV121();
      this.onEvent({ type: 'special-operation-started', operationId: APC_CONVOY_OPERATION_V121, campaignId: this.campaign.id, localPlayers: 1 });
      return this.getSnapshot();
    }
    isApcConvoyV121() { return Boolean(this.apcConvoyActiveV121 && this.apcConvoyV121); }
    canApcConvoyActV121(actor = this.player) {
      return Boolean(this.running && !this.paused && !this.enemyAtlasLoadingPausedV65 && !this.userCasteLoadingV88
        && this.mission?.state === 'active' && actor === this.player && actor.alive && !actor.downed
        && this.vehicle?.active && !this.vehicle.destroyed);
    }
    configureApcConvoyWorldV121() {
      this.enemies = []; this.bullets = []; this.hostileProjectiles = []; this.drops = []; this.squadActors = []; this.coopEnabled = false;
      this.platforms = [{ id: 'apcv121-road', x: 0, y: 570, w: 1280, h: 38, floor: true, art: 'floor' }];
      this.walls = []; this.doors = []; this.ladders = []; this.lifts = []; this.covers = []; this.hazards = []; this.vents = [];
      this.supplies = []; this.objectiveNodes = []; this.collectablesV68 = []; this.narrativeCollectablesV68 = [];
      this.powerNode = null; this.archiveTerminal = null;
      if (this.weaponPickup) this.weaponPickup.taken = true;
      if (this.toolPickup) this.toolPickup.taken = true;
      this.ventShortcut = { id: 'none', x: -1000, y: -1000, w: 0, h: 0, open: false };
      this.missionVentNetworkV62 = null; this.missionVentActorsV62?.clear();
      this.missionLevelEvents?.clear(); this.missionLevelSpawns?.clear(); this.missionLevelTimers?.clear(); this.missionLevelExtractionTimer = null;
      this.missionLevelBounds = { width: 1280, height: 620, voidY: 720 };
      Object.assign(this.vehicle, { id: APC_ID, active: true, occupied: true, driver: this.player, passengers: [],
        x: 955, y: 570 - this.vehicle.h, groundY: 570 - this.vehicle.h, facing: -1,
        vx: 0, vy: 0, hull: 340, maxHull: 340, fuel: 100, turretAmmo: 110, maxTurretAmmo: 110, turretReserve: 120,
        canFire: true, destroyed: false, supportRepairRate: 0, gunnerBonus: 1 });
      // This operation starts already seated: no boarding transition or undefined
      // secure timer may keep the first shot locked before the first update.
      this.vehicle.accessTransition = null; this.vehicle.accessSecureClock = 0;
      this.vehicle.squadAccessRuntime = null;
      this.pinApcConvoyDriverV121();
      this.refreshSpriteCollisionProfiles?.();
      this.camera.x = 0; this.camera.y = 0;
      this.objective = { id: 'apcv121-recovery-gate', x: 1000, y: 450, w: 80, h: 120, complete: false };
      this.checkpoint = { id: 'insertion', x: this.player.x, y: this.player.y };
    }
    pinApcConvoyDriverV121() {
      this.player.inVehicle = true; this.player.x = this.vehicle.x + 48; this.player.y = this.vehicle.y + 10;
      this.player.vx = 0; this.player.vy = 0; this.player.facing = -1; this.player.climbing = false; this.player.ladderId = null;
      this.vehicle.occupied = true; this.vehicle.driver = this.player; this.vehicle.passengers = [];
    }
    syncApcConvoyWorldV121() {
      if (!this.isApcConvoyV121() || !this.objective || !this.vehicle) return;
      const state = this.apcConvoyV121; state.phase = apcConvoyPhaseV121(state); this.mission.phase = state.phase;
      this.mission.objectives = { power: state.briefed, route: state.distance >= 3200, boss: state.queenDefeated,
        archive: state.crushersDefeated.every(Boolean), extract: state.complete };
      this.objective.complete = state.complete; this.coopEnabled = false;
      if (!this.vehicle.destroyed) this.pinApcConvoyDriverV121();
      if (state.complete && state.rewards) this.mission.rewards = clone(state.rewards);
    }
    setCoop(enabled) { return super.setCoop(this.isApcConvoyV121() ? false : enabled); }
    updateObjectiveRuntime(delta) { if (!this.isApcConvoyV121()) return super.updateObjectiveRuntime(delta); }
    updateMissionPhase() { if (!this.isApcConvoyV121()) return super.updateMissionPhase(); this.syncApcConvoyWorldV121(); }
    missingObjectiveRequirement(options) { return this.isApcConvoyV121() ? this.missingApcConvoyRequirementV121() : super.missingObjectiveRequirement(options); }
    missingExtractionRequirement() { return this.isApcConvoyV121() ? this.missingApcConvoyRequirementV121() : super.missingExtractionRequirement(); }
    missingApcConvoyRequirementV121() {
      const state = this.apcConvoyV121;
      return state?.queenDefeated && state.crushersDefeated.every(Boolean) && state.extractionProgress >= 3
        && !this.vehicle.destroyed && this.vehicle.hull > 0 ? '' : 'BLINDÉ ET CORRIDOR NON SÉCURISÉS';
    }
    updateVehicleDriver(actor, delta, controls) {
      if (!this.isApcConvoyV121()) return super.updateVehicleDriver(actor, delta, controls);
      this.pinApcConvoyDriverV121();
    }
    update(delta) {
      if (!this.isApcConvoyV121()) return super.update(delta);
      if (this.running && !this.paused && this.mission?.state === 'active' && (this.vehicle?.destroyed || !this.player?.alive)) {
        this.failMission('M577 perdu dans le corridor.'); return;
      }
      if (!this.canApcConvoyActV121()) return;
      const seconds = Number(delta); if (!Number.isFinite(seconds) || seconds <= 0) return;
      const dt = Math.min(seconds, 0.1), state = this.apcConvoyV121;
      if (this.keys.has('KeyE') && state.phase === 'briefing') this.interact();
      if (!state.briefed) return;
      state.elapsed += dt;
      const heldFire = this.keys.has('KeyF') || this.keys.has('TouchFire');
      state.heat = Math.max(0, state.heat - dt * (state.overheated ? 25 : heldFire ? 8 : 24));
      if (state.overheated && state.heat <= 32) state.overheated = false;
      if (state.reloadRemaining > 0) {
        state.reloadRemaining = Math.max(0, state.reloadRemaining - dt);
        if (state.reloadRemaining === 0) {
          const transfer = Math.min(110 - this.vehicle.turretAmmo, this.vehicle.turretReserve);
          this.vehicle.turretAmmo += transfer; this.vehicle.turretReserve -= transfer;
          this.onEvent({ type: 'vehicle-reload', amount: transfer, reserve: this.vehicle.turretReserve, operationId: APC_CONVOY_OPERATION_V121 });
        }
      }
      if (this.keys.has('KeyR')) this.reload();
      if (state.phase === 'evacuation') {
        this.vehicle.vx = 0;
        if (this.keys.has('KeyE')) { state.extractionProgress = Math.min(3, state.extractionProgress + dt); if (state.extractionProgress >= 3) this.completeMission(); }
        else state.extractionProgress = 0;
      } else {
        const braking = this.keys.has('KeyS') || this.keys.has('ArrowDown'), boost = !braking && this.keys.has('Space');
        const speed = braking ? 10 : boost ? 38 : 26;
        state.roadOffset += speed * dt * 6; this.vehicle.vx = -speed * 6;
        this.vehicle.fuel = Math.max(0, this.vehicle.fuel - dt * (braking ? 0.15 : boost ? 0.85 : 0.45));
        if (this.vehicle.fuel <= 0) { this.failMission('Réservoir du M577 épuisé avant le périmètre.'); return; }
        if (state.phase.startsWith('run-')) {
          const threshold = APC_CONVOY_LIMITS_V121.thresholds[Number(state.phase.slice(-1)) - 1];
          state.distance = Math.min(threshold, state.distance + speed * dt);
          if (state.elapsed >= state.nextWaveAt) { state.nextWaveAt = state.elapsed + 9; this.spawnApcConvoyWaveV121(); }
        }
      }
      super.update(dt);
      if (this.mission.state !== 'active') return;
      this.camera.x = 0; this.camera.y = 0;
      this.syncApcConvoyWorldV121(); this.ensureApcConvoyStageBossV121();
    }
    interact(actor = this.player) {
      if (!this.isApcConvoyV121()) return super.interact(actor);
      if (!this.canApcConvoyActV121(actor)) return false;
      if (this.apcConvoyV121.phase !== 'briefing' && this.apcConvoyV121.phase !== 'evacuation') return false;
      if (!this.apcConvoyV121.briefed) { this.apcConvoyV121.briefed = true; this.syncApcConvoyWorldV121(); this.apcConvoyMilestoneV121('depart', 'M577 engagé. Contacts à gauche, garder la tourelle sur le corridor.'); }
      return true;
    }
    toggleVehicle(actor = this.player) { return this.isApcConvoyV121() ? false : super.toggleVehicle(actor); }
    useEquipment(id, actor = this.player) { return this.isApcConvoyV121() ? false : super.useEquipment(id, actor); }
    useMedkit(actor = this.player) { return this.isApcConvoyV121() ? false : super.useMedkit(actor); }
    reload(actor = this.player) {
      if (!this.isApcConvoyV121()) return super.reload(actor);
      const state = this.apcConvoyV121;
      if (!this.canApcConvoyActV121(actor) || !state.briefed || state.reloadRemaining || this.vehicle.turretAmmo >= 110 || this.vehicle.turretReserve <= 0) return false;
      state.reloadRemaining = 2.5; cancelTacticalReloadV77(actor, 'mounted-band-reload');
      this.onEvent({ type: 'apc-convoy-band-loading', operationId: APC_CONVOY_OPERATION_V121 }); return true;
    }
    apcConvoyTargetV121() {
      return this.enemies.filter(enemy => enemy.alive && enemy.apcConvoyRoleV121 && center(enemy) < this.vehicle.x + 15
        && center(enemy) > this.vehicle.x - 980).sort((a, b) => b.x - a.x)[0] || null;
    }
    resolvePlayerCombatAimV83(actor = this.player) {
      if (!this.isApcConvoyV121()) return super.resolvePlayerCombatAimV83(actor);
      const target = this.apcConvoyTargetV121();
      if (!target) return { x: -1, y: 0, facing: -1, active: true, direction: 'left', angleRadians: Math.PI };
      const dx = center(target) - (this.vehicle.x + this.vehicle.w / 2);
      const dy = target.y + target.h * 0.55 - (this.vehicle.y + 28), length = Math.hypot(dx, dy);
      const aim = { x: dx / length, y: dy / length, facing: -1, active: true, direction: 'left', angleRadians: Math.atan2(dy, dx) };
      actor.combatAimV83 = aim; return aim;
    }
    fire(actor = this.player) {
      if (!this.isApcConvoyV121()) return super.fire(actor);
      const state = this.apcConvoyV121;
      if (!this.canApcConvoyActV121(actor) || !state.briefed || state.phase === 'evacuation'
        || state.overheated || state.reloadRemaining > 0 || !this.apcConvoyTargetV121() || this.vehicle.turretAmmo <= 0) return false;
      const fired = super.fire(actor);
      if (fired) { state.heat = Math.min(100, state.heat + 11); if (state.heat >= 100) state.overheated = true; }
      return fired;
    }
    damageVehicle(amount, source = 'enemy') {
      const result = super.damageVehicle(amount, source);
      if (this.isApcConvoyV121() && this.vehicle.destroyed && this.mission?.state === 'active') this.failMission('M577 détruit.');
      return result;
    }
    apcConvoySpawnV121(profileId, role = 'horde', descriptor = null) {
      const state = this.apcConvoyV121, profile = this.apcConvoyCatalogV121.find(candidate => candidate.id === profileId);
      if (!profile || !descriptor && state.enemySequence >= 64) return null;
      const entry = descriptor || { id: `apcv121-${++state.enemySequence}`, profileId, role,
        spawnX: role === 'horde' ? 50 + state.enemySequence % 3 * 70 : 80,
        attackClock: 1.2, chargeClock: 0.7, chargePhase: 'windup' };
      const enemy = this.createEnemy(profile, Number(entry.id.split('-')[1]), entry.spawnX, 570, { boss: role !== 'horde', keyCarrier: false });
      enemy.id = entry.id; enemy.apcConvoyRoleV121 = entry.role; enemy.apcConvoyProfileV121 = profileId;
      enemy.alert = true; enemy.dormant = false; enemy.facing = 1;
      enemy.apcConvoyAttackClockV121 = entry.attackClock; enemy.apcConvoyChargeClockV121 = entry.chargeClock; enemy.apcConvoyChargePhaseV121 = entry.chargePhase;
      this.enemies.push(enemy); if (!descriptor) state.enemies.push(entry); return enemy;
    }
    spawnApcConvoyWaveV121() {
      const state = this.apcConvoyV121;
      const room = Math.max(0, APC_CONVOY_LIMITS_V121.hordeCap - this.enemies.filter(enemy => enemy.alive).length);
      let count = 0;
      for (let index = 0; index < Math.min(2, room); index += 1) if (this.apcConvoySpawnV121(index ? 'enemy-005-warrior' : 'enemy-006-runner')) count += 1;
      state.waves += 1; this.onEvent({ type: 'apc-convoy-wave', operationId: APC_CONVOY_OPERATION_V121, wave: state.waves, spawned: count }); return count;
    }
    ensureApcConvoyStageBossV121() {
      const state = this.apcConvoyV121;
      if (!['crusher-1', 'crusher-2', 'queen'].includes(state.phase)) return;
      if (this.enemies.some(enemy => enemy.alive && enemy.apcConvoyRoleV121 === state.phase)) return;
      const enemy = this.apcConvoySpawnV121(state.phase === 'queen' ? 'enemy-008-queen' : 'enemy-009-crusher', state.phase);
      if (!enemy) { this.failMission('Contact de barrage indisponible.'); return; }
      state.stageBossId = enemy.id;
      this.apcConvoyMilestoneV121(state.phase, state.phase === 'queen' ? 'Barrage royal. Le sas reste fermé tant que ce contact tient la voie.' : 'Crusher en approche : conserver le blindage pour la percée.');
    }
    updateEnemy(enemy, delta) {
      if (!this.isApcConvoyV121() || !enemy.apcConvoyRoleV121) return super.updateEnemy(enemy, delta);
      if (!enemy.alive || !this.apcConvoyV121.briefed || this.apcConvoyV121.phase === 'evacuation') return;
      enemy.facing = 1; enemy.y = 570 - enemy.h;
      enemy.apcConvoyAttackClockV121 = Math.max(0, enemy.apcConvoyAttackClockV121 - delta);
      enemy.hurtClock = Math.max(0, (enemy.hurtClock || 0) - delta); enemy.staggerClock = Math.max(0, (enemy.staggerClock || 0) - delta);
      // Stop against the displayed hull, not the narrower navigation rectangle.
      // This keeps a charging contact outside the APC instead of visibly merging.
      const hull = collisionBounds(this.vehicle), body = collisionBounds(enemy);
      const contactX = hull.x - body.w - (body.x - enemy.x) - 4;
      const crusher = enemy.apcConvoyRoleV121.startsWith('crusher');
      let speed = Math.max(60, Math.min(200, Number(enemy.speed) || 85));
      if (crusher) {
        enemy.apcConvoyChargeClockV121 = Math.max(0, enemy.apcConvoyChargeClockV121 - delta);
        if (!enemy.apcConvoyChargeClockV121) { enemy.apcConvoyChargePhaseV121 = 'charge'; }
        speed = enemy.apcConvoyChargePhaseV121 === 'charge' ? 410 : 35;
      }
      if (enemy.staggerClock > 0) speed *= 0.25;
      enemy.vx = speed; enemy.x = Math.min(contactX, enemy.x + speed * delta);
      if (enemy.x >= contactX - 1 && enemy.apcConvoyAttackClockV121 <= 0) {
        this.damageVehicle(enemy.damage * (crusher ? 1.8 : enemy.apcConvoyRoleV121 === 'queen' ? 1.4 : 1), `${enemy.name}:convoy-impact`);
        enemy.apcConvoyAttackClockV121 = crusher ? 2.1 : 1.6;
        if (crusher) { enemy.x = Math.max(120, enemy.x - 240); enemy.apcConvoyChargeClockV121 = 0.7; enemy.apcConvoyChargePhaseV121 = 'windup'; }
        this.onEvent({ type: 'apc-convoy-impact', operationId: APC_CONVOY_OPERATION_V121, enemyId: enemy.id, role: enemy.apcConvoyRoleV121 });
      }
    }
    defeatEnemy(enemy, owner = this.player) {
      if (!this.isApcConvoyV121() || !enemy.apcConvoyRoleV121) return super.defeatEnemy(enemy, owner);
      if (!enemy.alive) return;
      const role = enemy.apcConvoyRoleV121, state = this.apcConvoyV121;
      if (role === 'crusher-1') state.crushersDefeated[0] = true;
      if (role === 'crusher-2') state.crushersDefeated[1] = true;
      if (role === 'queen') state.queenDefeated = true;
      super.defeatEnemy(enemy, owner);
      if (role !== 'horde') {
        state.stageBossId = null; state.nextWaveAt = state.elapsed + 6; this.syncApcConvoyWorldV121();
        this.apcConvoyMilestoneV121(`${role}-cleared`, role === 'queen' ? 'Dernier barrage franchi. Confirmer le passage au sas.' : 'Contact lourd neutralisé. Reprendre le convoyage.');
      }
    }
    apcConvoyMilestoneV121(id, text) {
      const state = this.apcConvoyV121;
      if (!state.journal.includes(id)) { state.journal.push(id); this.onEvent({ type: 'apc-convoy-radio', operationId: APC_CONVOY_OPERATION_V121, id, text }); }
      this.checkpoint = { id: 'insertion', x: this.player.x, y: this.player.y };
      this.apcConvoyCheckpointV121 = this.captureApcConvoyCheckpointV121();
      this.onEvent({ type: 'checkpoint', checkpoint: `apc-convoy-${id}`, operationId: APC_CONVOY_OPERATION_V121 });
    }
    completeMission(actor = this.player) {
      if (!this.isApcConvoyV121()) return super.completeMission(actor);
      const state = this.apcConvoyV121;
      if (!this.canApcConvoyActV121(actor) || state.complete || state.rewardClaimed || this.missingApcConvoyRequirementV121()) return false;
      const rewards = { credits: 850 + actor.kills * 10 + Math.floor(this.vehicle.hull / 340 * 250), salvage: this.inventory.salvage,
        intel: this.inventory.intel, retries: this.mission.retries, elapsedSeconds: Math.round(this.mission.elapsed),
        noCasualty: this.mission.casualties === 0, vehicleRecovered: true, hullRemaining: Math.round(this.vehicle.hull), operationId: APC_CONVOY_OPERATION_V121 };
      state.complete = true; state.rewardClaimed = true; state.rewards = rewards; this.syncApcConvoyWorldV121();
      const sink = this.onEvent;
      this.onEvent = event => { if (event.type === 'mission-complete') { this.mission.rewards = clone(rewards); sink({ ...event, rewards: clone(rewards), operationId: APC_CONVOY_OPERATION_V121 }); } else sink(event); };
      let result = false; try { result = super.completeMission(actor); } finally { this.onEvent = sink; }
      if (!result) { state.complete = false; state.rewardClaimed = false; state.rewards = null; this.syncApcConvoyWorldV121(); }
      return result;
    }
    captureApcConvoyCheckpointV121() {
      const snapshot = this.captureResumeState(); if (snapshot.specialOperation) delete snapshot.specialOperation.apcConvoyCheckpointV121; return clone(snapshot);
    }
    captureResumeState() {
      const base = super.captureResumeState(); if (!this.isApcConvoyV121()) return base;
      const state = sanitizeApcConvoyStateV121(this.apcConvoyV121);
      for (const descriptor of state.enemies) {
        const enemy = this.enemies.find(candidate => candidate.id === descriptor.id); if (!enemy) continue;
        descriptor.attackClock = enemy.apcConvoyAttackClockV121; descriptor.chargeClock = enemy.apcConvoyChargeClockV121; descriptor.chargePhase = enemy.apcConvoyChargePhaseV121;
      }
      return { ...base, specialOperation: { ...(base.specialOperation || {}), operationId: APC_CONVOY_OPERATION_V121,
        apcConvoyV121: state, apcConvoyCheckpointV121: this.apcConvoyCheckpointV121 ? clone(this.apcConvoyCheckpointV121) : null } };
    }
    validateApcConvoyResumeV121(raw) {
      const checked = validateApcConvoyStateV121(raw?.specialOperation?.apcConvoyV121); if (!checked.valid) return checked;
      const id = raw?.identity, state = checked.state, vehicle = raw?.vehicle;
      if (raw.schema !== 1 || raw.specialOperation.operationId !== APC_CONVOY_OPERATION_V121 || !id
        || ['campaignId', 'worldId', 'levelSeedId', 'objectiveId', 'editorProjectKind'].some(key => id[key] !== this.resumeIdentity?.[key])
        || Number(id.seed) !== Number(this.resumeIdentity?.seed) || raw.missionLevel?.signature !== this.missionLevelRuntime?.signature
        || !['active', 'failed', 'complete'].includes(raw.mission?.state) || (raw.mission.state === 'complete') !== state.complete
        || state.enemies.some(enemy => !safeProfiles.has(enemy.profileId)) || !vehicle || vehicle.id !== APC_ID
        || vehicle.x !== 955 || vehicle.y !== 570 - this.vehicle.h || vehicle.active !== true
        || !Number.isFinite(vehicle.hull) || vehicle.hull < 0 || vehicle.hull > 340 || !Number.isFinite(vehicle.fuel) || vehicle.fuel < 0 || vehicle.fuel > 100
        || !Number.isInteger(vehicle.turretAmmo) || vehicle.turretAmmo < 0 || vehicle.turretAmmo > 110
        || !Number.isInteger(vehicle.turretReserve) || vehicle.turretReserve < 0 || vehicle.turretReserve > 120
        || vehicle.turretAmmo + vehicle.turretReserve > 230 || !Array.isArray(raw.enemies)
        || raw.enemies.length !== state.enemies.length || new Set(raw.enemies.map(enemy => enemy.id)).size !== state.enemies.length
        || raw.enemies.some(enemy => !state.enemies.some(descriptor => descriptor.id === enemy.id))
        || raw.enemies.some(enemy => {
          const role = state.enemies.find(descriptor => descriptor.id === enemy.id).role;
          const defeated = role === 'queen' ? state.queenDefeated : role === 'crusher-1' ? state.crushersDefeated[0]
            : role === 'crusher-2' ? state.crushersDefeated[1] : null;
          return defeated !== null && (enemy.alive === false) !== defeated;
        })
        || (raw.mission.state !== 'failed' && (vehicle.destroyed || vehicle.hull <= 0 || vehicle.fuel <= 0 || raw.player?.alive === false))) {
        return { valid: false, reason: 'apc-identity-mismatch' };
      }
      return checked;
    }
    applyResumeState(raw) {
      if (!this.isApcConvoyV121()) return super.applyResumeState(raw);
      const checked = this.validateApcConvoyResumeV121(raw); if (!checked.valid) return { applied: false, restored: 0, reason: checked.reason, specialOperationRestored: false };
      const previousState = this.apcConvoyV121, previousEnemies = this.enemies;
      this.apcConvoyV121 = checked.state; this.enemies = [];
      for (const descriptor of checked.state.enemies) this.apcConvoySpawnV121(descriptor.profileId, descriptor.role, descriptor);
      const result = super.applyResumeState(raw);
      if (!result?.applied) { this.apcConvoyV121 = previousState; this.enemies = previousEnemies; return result; }
      this.missionLevelEvents?.clear(); this.missionLevelSpawns?.clear(); this.missionLevelTimers?.clear();
      const checkpoint = raw.specialOperation.apcConvoyCheckpointV121;
      if (checkpoint && this.validateApcConvoyResumeV121(checkpoint).valid) { this.apcConvoyCheckpointV121 = clone(checkpoint); delete this.apcConvoyCheckpointV121.specialOperation.apcConvoyCheckpointV121; }
      this.vehicle.accessTransition = null; this.vehicle.accessSecureClock = 0; this.vehicle.squadAccessRuntime = null;
      this.syncApcConvoyWorldV121(); this.refreshSpriteCollisionProfiles?.();
      return { ...result, restored: (result.restored || 0) + 1, specialOperationRestored: true };
    }
    restartFromCheckpoint() {
      if (!this.isApcConvoyV121()) return super.restartFromCheckpoint();
      if (this.mission?.state !== 'failed' || !this.apcConvoyCheckpointV121) return false;
      const snapshot = clone(this.apcConvoyCheckpointV121); snapshot.mission.state = 'active'; snapshot.mission.failureReason = null; snapshot.mission.retries = this.mission.retries + 1;
      snapshot.inventory.salvage = Math.max(0, Math.min(snapshot.inventory.salvage, this.inventory.salvage) - 20);
      const result = this.applyResumeState(snapshot); if (!result.applied) return false;
      this.clearGameplayInput?.(); this.onEvent({ type: 'mission-restarted', operationId: APC_CONVOY_OPERATION_V121, salvagePenalty: 20 }); return true;
    }
    phaseLabel() { return this.isApcConvoyV121() ? apcConvoyDossierV121(this.apcConvoyV121).title : super.phaseLabel(); }
    objectiveProgressText() { return this.isApcConvoyV121() ? apcConvoyDossierV121(this.apcConvoyV121).instruction : super.objectiveProgressText(); }
    getInteractionPrompt() {
      if (!this.isApcConvoyV121()) return super.getInteractionPrompt();
      return this.apcConvoyV121.phase === 'briefing' ? 'E · ENGAGER LE CONVOI' : this.apcConvoyV121.phase === 'evacuation' ? 'MAINTENIR E · CONFIRMER LE SAS · 3 S' : '';
    }
    getSnapshot() {
      return { ...super.getSnapshot(), ...(this.isApcConvoyV121() ? { apcConvoyV121: {
        ...sanitizeApcConvoyStateV121(this.apcConvoyV121), dossier: apcConvoyDossierV121(this.apcConvoyV121),
        vehicleId: APC_ID, assetPath: APC_CONVOY_ASSET_V121, localPlayers: 1 } } : {}) };
    }
    getGameplayReport() { return { ...super.getGameplayReport(), ...(this.isApcConvoyV121() ? { apcConvoyV121: this.getSnapshot().apcConvoyV121 } : {}) }; }
    drawBackdrop(ctx) {
      if (!this.isApcConvoyV121()) return super.drawBackdrop(ctx);
      ctx.fillStyle = '#0b1418'; ctx.fillRect(0, 0, 1280, 720);
      const offset = this.apcConvoyV121.roadOffset;
      for (let index = -1; index < 10; index += 1) {
        const x = index * 190 + offset * 0.12 % 190;
        ctx.fillStyle = '#18262a'; ctx.fillRect(x, 240 - index % 3 * 18, 130, 330);
        ctx.fillStyle = '#405256'; ctx.fillRect(x + 18, 285, 4, 8); ctx.fillRect(x + 68, 285, 4, 8);
      }
      ctx.fillStyle = '#273238'; ctx.fillRect(0, 570, 1280, 60);
      ctx.fillStyle = '#a5a58a';
      for (let x = -100 + offset % 150; x < 1350; x += 150) ctx.fillRect(x, 589, 74, 4);
    }
    drawWorld(ctx) {
      super.drawWorld(ctx); if (!this.isApcConvoyV121()) return;
      if (this.apcConvoyV121.phase === 'evacuation' || this.apcConvoyV121.complete) {
        ctx.save(); ctx.strokeStyle = '#8bc6c8'; ctx.lineWidth = 7; ctx.strokeRect(915, 270, 340, 300);
        ctx.font = '700 15px monospace'; ctx.fillStyle = '#b4dadb'; ctx.fillText('PÉRIMÈTRE TANTALUS', 933, 254); ctx.restore();
      }
    }
    drawHud(ctx) {
      super.drawHud(ctx); if (!this.isApcConvoyV121()) return;
      const state = this.apcConvoyV121, dossier = apcConvoyDossierV121(state);
      ctx.save(); ctx.fillStyle = '#091318ed'; ctx.fillRect(18, 113, 1150, 92);
      ctx.font = '700 13px monospace'; ctx.fillStyle = '#cbded5';
      ctx.fillText(`CORRIDOR DE FEU · ${dossier.title} · ${Math.round(state.distance)}/3200 M`, 32, 133);
      ctx.font = '12px monospace'; ctx.fillStyle = '#acc1c3'; ctx.fillText(dossier.instruction, 32, 153);
      ctx.fillStyle = state.overheated ? '#f8aa79' : '#aacdcc';
      ctx.fillText(`CHALEUR ${Math.round(state.heat)}%${state.overheated ? ' · REFROIDISSEMENT' : ''} · BANDE ${this.vehicle.turretAmmo} · RÉSERVE ${this.vehicle.turretReserve}${state.reloadRemaining ? ` · CHARGEMENT ${state.reloadRemaining.toFixed(1)} S` : ''}`, 32, 173);
      ctx.fillStyle = '#24373b'; ctx.fillRect(32, 187, 1118, 5); ctx.fillStyle = '#8dbfad'; ctx.fillRect(32, 187, 1118 * state.distance / 3200, 5); ctx.restore();
    }
  };
}
