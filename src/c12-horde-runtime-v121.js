import { buildMissionLevelV52 } from './mission-levels-v52.js';
import { C12_HORDE_CAMPAIGN_V121, C12_HORDE_OPERATION_V121, C12_HORDE_LIMITS_V121,
  createC12HordeStateV121, sanitizeC12HordeStateV121, validateC12HordeStateV121,
  c12HordePhaseV121, c12HordeDossierV121 } from './c12-horde-state-v121.js';
export { C12_HORDE_CAMPAIGN_V121 } from './c12-horde-state-v121.js';
const clone = value => structuredClone(value);
const distance = (actor, x, y) => Math.hypot(actor.x + actor.w / 2 - x, actor.y + actor.h - y);
const near = (actor, x, y, radius = 100) => distance(actor, x, y) <= radius;
const profiles = ['enemy-004-drone-big-chap', 'enemy-002-facehugger'];

export function buildC12HordeLevelV121(options = {}) {
  const plan = buildMissionLevelV52({ ...options, campaign: options.campaign || C12_HORDE_CAMPAIGN_V121, templateId: 'colony-multiroute' });
  return { ...plan, label: 'Rupture du sas C-12', signature: `${plan.signature}:c12-horde-v121` };
}
export function withC12HordeRuntimeV121(BaseEngine) {
  if (BaseEngine.c12HordeRuntimeV121 === true) return BaseEngine;
  return class C12HordeRuntimeV121 extends BaseEngine {
    static c12HordeRuntimeV121 = true;
    start(options = {}) {
      this.c12HordeActiveV121 = options.campaign?.id === C12_HORDE_CAMPAIGN_V121.id;
      this.c12HordeV121 = this.c12HordeActiveV121 ? createC12HordeStateV121() : null;
      this.c12HordeCheckpointV121 = null;
      if (!this.c12HordeActiveV121) return super.start(options);
      if (!options.missionLevel?.validation?.valid || !options.missionLevel.signature.endsWith(':c12-horde-v121')) throw new Error('C-12 requires buildC12HordeLevelV121.');
      this.c12HordeCatalogV121 = (options.enemyCatalog || []).filter(profile => profiles.includes(profile.id));
      if (this.c12HordeCatalogV121.length !== profiles.length) throw new Error('C-12 requires its two existing enemy profiles.');
      super.start({ ...options, resumeState: undefined, vehicle: null, crew: [], squad: [],
        userCasteCampaignV88: false, neuroProfile: null, apexDossier: null });
      this.configureC12HordeWorldV121();
      if (options.resumeState) this.lastResumeResult = this.applyResumeState(options.resumeState);
      this.syncC12HordeWorldV121(); this.c12HordeCheckpointV121 ||= this.captureC12HordeCheckpointV121();
      return this.getSnapshot();
    }
    isC12HordeV121() { return Boolean(this.c12HordeActiveV121 && this.c12HordeV121); }
    canC12HordeActV121(actor = this.player) {
      return Boolean(this.running && !this.paused && !this.enemyAtlasLoadingPausedV65 && !this.userCasteLoadingV88
        && this.mission?.state === 'active' && actor === this.player && actor.alive && !actor.downed);
    }
    configureC12HordeWorldV121() {
      this.enemies = []; this.bullets = []; this.hostileProjectiles = []; this.drops = []; this.squadActors = []; this.coopEnabled = false;
      this.platforms = [{ id: 'c12-floor', x: 0, y: 570, w: 1280, h: 38, floor: true, art: 'floor' },
        { id: 'c12-walkway', x: 0, y: 355, w: 920, h: 20, art: 'grate' }];
      this.ladders = [{ id: 'c12-ladder', x: 865, top: 355, bottom: 570, y: 355, w: 50, h: 215 }];
      this.walls = []; this.doors = []; this.lifts = []; this.covers = []; this.hazards = []; this.vents = []; this.supplies = [];
      this.objectiveNodes = []; this.collectablesV68 = []; this.narrativeCollectablesV68 = [];
      this.powerNode = null; this.archiveTerminal = null;
      this.ventShortcut = null;
      if (this.weaponPickup) this.weaponPickup.taken = true;
      if (this.toolPickup) this.toolPickup.taken = true;
      this.vehicle.active = false; this.vehicle.occupied = false; this.vehicle.driver = null;
      this.player.x = 810; this.player.y = 570 - this.player.h; this.player.facing = -1;
      this.player.inVehicle = false; this.player.vx = 0; this.player.vy = 0;
      this.objective = { id: 'c12-service-lift', x: 1100, y: 410, w: 110, h: 160, complete: false };
      this.checkpoint = { id: 'insertion', x: this.player.x, y: this.player.y };
      this.missionVentNetworkV62 = null; this.missionVentActorsV62?.clear();
      this.missionLevelEvents?.clear(); this.missionLevelSpawns?.clear(); this.missionLevelTimers?.clear(); this.missionLevelExtractionTimer = null;
      this.missionLevelBounds = { width: 1280, height: 620, voidY: 720 }; this.camera.x = 0; this.camera.y = 0;
    }
    syncC12HordeWorldV121() {
      if (!this.isC12HordeV121() || !this.mission) return;
      const state = this.c12HordeV121; state.phase = c12HordePhaseV121(state); this.mission.phase = state.phase;
      this.mission.objectives = { power: state.activated, route: state.defenceElapsed >= 45, boss: true, archive: true, extract: state.complete };
      this.objective.complete = state.complete; this.coopEnabled = false;
      if (state.complete && state.rewards) this.mission.rewards = clone(state.rewards);
    }
    setCoop(enabled) { return super.setCoop(this.isC12HordeV121() ? false : enabled); }
    toggleVehicle(actor) { return this.isC12HordeV121() ? false : super.toggleVehicle(actor); }
    updateObjectiveRuntime(delta) { if (!this.isC12HordeV121()) return super.updateObjectiveRuntime(delta); }
    updateMissionPhase() { if (!this.isC12HordeV121()) return super.updateMissionPhase(); this.syncC12HordeWorldV121(); }
    missingObjectiveRequirement(options) { return this.isC12HordeV121() ? this.missingC12HordeRequirementV121() : super.missingObjectiveRequirement(options); }
    missingExtractionRequirement() { return this.isC12HordeV121() ? this.missingC12HordeRequirementV121() : super.missingExtractionRequirement(); }
    missingC12HordeRequirementV121() {
      return this.c12HordeV121?.defenceElapsed >= 45 && this.c12HordeV121.evacuationProgress >= 2
        && near(this.player, 1150, 570) ? '' : 'ASCENSEUR NON CONFIRMÉ';
    }
    interact(actor = this.player) {
      if (!this.isC12HordeV121()) return super.interact(actor);
      if (!this.canC12HordeActV121(actor)) return false;
      const state = this.c12HordeV121;
      if (!state.activated && near(actor, 845, 570, 55)
        && (state.ammoTaken || distance(actor, 845, 570) <= distance(actor, 760, 570))) {
        state.activated = true; this.syncC12HordeWorldV121(); this.c12HordeMilestoneV121('activated', 'Ascenseur en rétablissement. Bruits derrière la grille gauche.'); return true;
      }
      if (!state.ammoTaken && near(actor, 760, 570, 55)) {
        state.ammoTaken = true; actor.ammoReserve += C12_HORDE_LIMITS_V121.ammoCrate;
        this.onEvent({ type: 'c12-ammunition', amount: C12_HORDE_LIMITS_V121.ammoCrate }); return true;
      }
      if (!state.cargoTaken && near(actor, 400, 355, 65)) {
        state.cargoTaken = true; this.inventory.salvage += 20; this.onEvent({ type: 'c12-cargo', amount: 20 }); return true;
      }
      return state.phase === 'evacuate' && near(actor, 1150, 570);
    }
    update(delta) {
      if (!this.isC12HordeV121()) return super.update(delta);
      if (this.running && !this.paused && this.mission?.state === 'active' && !this.player?.alive) { this.failMission('Repli C-12 interrompu.'); return; }
      if (!this.canC12HordeActV121()) return;
      const seconds = Number(delta); if (!Number.isFinite(seconds) || seconds <= 0) return;
      const dt = Math.min(seconds, 0.1), state = this.c12HordeV121;
      if (this.keys.has('KeyE')) this.interact();
      state.impactCooldown = Math.max(0, state.impactCooldown - dt);
      if (state.activated && state.warningRemaining > 0) state.warningRemaining = Math.max(0, state.warningRemaining - dt);
      else if (state.activated && state.defenceElapsed < 45) {
        state.defenceElapsed = Math.min(45, state.defenceElapsed + dt);
        if (state.defenceElapsed >= 13) this.c12HordeRadioV121('swarm-breach', 'Petits contacts annoncés : nuée dans la voie basse.');
        if (state.defenceElapsed >= 28) this.c12HordeRadioV121('upper-breach', 'Grille de passerelle déformée : nouvel axe en hauteur.');
        this.emitC12HordePopulationV121();
      }
      const before = state.phase; this.syncC12HordeWorldV121();
      if (before !== 'evacuate' && state.phase === 'evacuate') this.c12HordeMilestoneV121('lift-ready', 'Ascenseur disponible : repli autorisé, contacts restants non bloquants.');
      if (state.phase === 'evacuate' && this.keys.has('KeyE') && near(this.player, 1150, 570)) {
        state.evacuationProgress = Math.min(2, state.evacuationProgress + dt);
        if (state.evacuationProgress >= 2) this.completeMission();
      } else if (!state.complete) state.evacuationProgress = 0;
      super.update(dt); this.camera.x = 0; this.camera.y = 0;
      this.player.x = Math.max(0, Math.min(1280 - this.player.w, this.player.x));
      // Corpses remain individually recorded for saves, but their effects expire
      // and never become physical barriers or permanent acid fields.
      for (const enemy of this.enemies) if (!enemy.alive) enemy.deathClock = Math.max(0, (enemy.deathClock || 0) - dt);
      state.peakLive = Math.max(state.peakLive, this.enemies.filter(enemy => enemy.alive).length);
    }
    c12HordeSpawnV121(profileId, lane = 'ground', descriptor = null) {
      const state = this.c12HordeV121, profile = this.c12HordeCatalogV121.find(candidate => candidate.id === profileId);
      if (!profile || !descriptor && (state.emitted >= 72 || this.enemies.filter(enemy => enemy.alive).length >= 36)) return null;
      const entry = descriptor || { id: `c12v121-${state.emitted + 1}`, profileId, lane,
        spawnX: 24 + state.emitted % 12 * 15, groundY: lane === 'upper' ? 355 : 570 };
      const enemy = this.createEnemy(profile, Number(entry.id.split('-')[1]), entry.spawnX, entry.groundY, { boss: false, keyCarrier: false });
      enemy.id = entry.id; enemy.c12HordeProfileV121 = 'one-impact'; enemy.c12HordeLaneV121 = entry.lane;
      enemy.profileId = profileId; enemy.health = 1; enemy.maxHealth = 1; enemy.armor = 0; enemy.acid = 0; enemy.reward = 0;
      enemy.alert = true; enemy.facing = 1; enemy.dormant = false; enemy.c12HordeGroundV121 = entry.groundY;
      this.enemies.push(enemy);
      if (!descriptor) { state.emitted += 1; state.enemies.push(entry); state.peakLive = Math.max(state.peakLive, this.enemies.filter(actor => actor.alive).length); }
      return enemy;
    }
    emitC12HordePopulationV121() {
      const state = this.c12HordeV121, wave = Math.floor(state.emitted / 24);
      if (wave > 2 || state.defenceElapsed < [0, 15, 30][wave]) return;
      const target = (wave + 1) * 24;
      const live = this.enemies.filter(enemy => enemy.alive).length;
      if (state.emitted >= target || live >= 36) return;
      // Both entrance lanes are announced in advance. Wait if the player is at
      // the breach: never materialize a dense batch on the operator's body.
      const lane = wave === 2 ? 'upper' : 'ground', ground = lane === 'upper' ? 355 : 570;
      if (near(this.player, 140, ground, 260)) return;
      const announcement = ['ground-breach', 'swarm-breach', 'upper-breach'][wave];
      if (!state.journal.includes(announcement)) this.c12HordeRadioV121(announcement,
        wave === 2 ? 'Grille de passerelle déformée : nouvel axe en hauteur.' : wave === 1 ? 'Petits contacts : nuée dans la voie basse.' : 'Grille basse cédée. Marée dans la voie de service.');
      const amount = Math.min(24, target - state.emitted, 36 - live);
      for (let index = 0; index < amount; index += 1) this.c12HordeSpawnV121(wave === 1 ? 'enemy-002-facehugger' : 'enemy-004-drone-big-chap', lane);
      if (state.emitted >= target) state.batches[wave] = true;
      state.peakLive = Math.max(state.peakLive, this.enemies.filter(enemy => enemy.alive).length);
    }
    updateEnemy(enemy, delta) {
      if (!this.isC12HordeV121() || !enemy.c12HordeProfileV121) return super.updateEnemy(enemy, delta);
      if (!enemy.alive || this.c12HordeV121.complete) return;
      const target = this.player, upper = enemy.c12HordeLaneV121 === 'upper';
      enemy.facing = target.x + target.w / 2 >= enemy.x + enemy.w / 2 ? 1 : -1;
      const speed = enemy.profileId === 'enemy-002-facehugger' ? 112 : 72;
      enemy.vx = speed * enemy.facing;
      if (Math.abs(target.x - enemy.x) > enemy.w * 0.6) enemy.x = Math.max(0, Math.min(1280 - enemy.w, enemy.x + enemy.vx * delta));
      if (upper && enemy.x >= 915) enemy.c12HordeGroundV121 = 570;
      // Once past the edge, the upper lane descends continuously. Position and
      // destination floor are saved, so resuming mid-descent does not teleport.
      const floorY = enemy.c12HordeGroundV121 - enemy.h;
      enemy.y = Math.min(floorY, enemy.y + 300 * delta);
      enemy.hurtClock = Math.max(0, (enemy.hurtClock || 0) - delta);
      if (Math.abs(target.x + target.w / 2 - (enemy.x + enemy.w / 2)) < 54
        && Math.abs(target.y + target.h - (enemy.y + enemy.h)) < 70 && this.c12HordeV121.impactCooldown <= 0) {
        // A shared impact budget prevents simultaneous attackers from stacking
        // dozens of damage events in one frame. Swarms do not impose latch QTEs.
        this.c12HordeV121.impactCooldown = 0.85;
        this.damagePlayer(target, enemy.profileId === 'enemy-002-facehugger' ? 8 : 12,
          { source: 'c12-horde-contact', bypassCover: true });
        this.onEvent({ type: 'c12-horde-impact', enemyId: enemy.id });
      }
    }
    defeatEnemy(enemy, owner = this.player) {
      if (!this.isC12HordeV121() || !enemy.c12HordeProfileV121) return super.defeatEnemy(enemy, owner);
      if (!enemy.alive) return;
      const previousDrops = this.drops.length; super.defeatEnemy(enemy, owner);
      this.drops.splice(previousDrops); enemy.deathClock = Math.min(1.2, enemy.deathClock);
    }
    applyEnemyDamage(enemy, amount, source = {}) {
      if (!this.isC12HordeV121() || !enemy?.c12HordeProfileV121) return super.applyEnemyDamage(enemy, amount, source);
      if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) return 0;
      return super.applyEnemyDamage(enemy, amount, source);
    }
    c12HordeRadioV121(id, text) {
      if (this.c12HordeV121.journal.includes(id)) return;
      this.c12HordeV121.journal.push(id); this.onEvent({ type: 'c12-horde-radio', id, text, operationId: C12_HORDE_OPERATION_V121 });
    }
    c12HordeMilestoneV121(id, text) {
      this.c12HordeRadioV121(id, text); this.checkpoint = { id: 'insertion', x: this.player.x, y: this.player.y };
      this.c12HordeCheckpointV121 = this.captureC12HordeCheckpointV121();
      this.onEvent({ type: 'checkpoint', checkpoint: `c12-${id}`, operationId: C12_HORDE_OPERATION_V121 });
    }
    completeMission(actor = this.player) {
      if (!this.isC12HordeV121()) return super.completeMission(actor);
      const state = this.c12HordeV121;
      if (!this.canC12HordeActV121(actor) || state.complete || state.rewardClaimed || this.missingC12HordeRequirementV121()) return false;
      const rewards = { credits: 650 + (state.cargoTaken ? 100 : 0), salvage: this.inventory.salvage, intel: this.inventory.intel,
        retries: this.mission.retries, elapsedSeconds: Math.round(this.mission.elapsed), noCasualty: this.mission.casualties === 0, operationId: C12_HORDE_OPERATION_V121 };
      state.complete = true; state.rewardClaimed = true; state.rewards = rewards; this.syncC12HordeWorldV121();
      const sink = this.onEvent;
      this.onEvent = event => { if (event.type === 'mission-complete') { this.mission.rewards = clone(rewards); sink({ ...event, rewards: clone(rewards), operationId: C12_HORDE_OPERATION_V121 }); } else sink(event); };
      let result; try { result = super.completeMission(actor); } finally { this.onEvent = sink; }
      if (!result) { state.complete = false; state.rewardClaimed = false; state.rewards = null; this.syncC12HordeWorldV121(); }
      return result;
    }
    captureC12HordeCheckpointV121() {
      const raw = this.captureResumeState(); delete raw.specialOperation.c12HordeCheckpointV121; return clone(raw);
    }
    captureResumeState() {
      const base = super.captureResumeState(); if (!this.isC12HordeV121()) return base;
      const state = sanitizeC12HordeStateV121(this.c12HordeV121);
      for (const entry of state.enemies) entry.groundY = this.enemies.find(enemy => enemy.id === entry.id)?.c12HordeGroundV121 || entry.groundY;
      return { ...base, specialOperation: { ...(base.specialOperation || {}), operationId: C12_HORDE_OPERATION_V121,
        c12HordeV121: state, c12HordeCheckpointV121: this.c12HordeCheckpointV121 ? clone(this.c12HordeCheckpointV121) : null } };
    }
    validateC12HordeResumeV121(raw) {
      const checked = validateC12HordeStateV121(raw?.specialOperation?.c12HordeV121); if (!checked.valid) return checked;
      const id = raw?.identity, state = checked.state;
      if (raw.schema !== 1 || raw.specialOperation.operationId !== C12_HORDE_OPERATION_V121 || !id
        || ['campaignId', 'worldId', 'levelSeedId', 'objectiveId', 'editorProjectKind'].some(key => id[key] !== this.resumeIdentity?.[key])
        || Number(id.seed) !== Number(this.resumeIdentity?.seed) || raw.missionLevel?.signature !== this.missionLevelRuntime?.signature
        || !['active', 'failed', 'complete'].includes(raw.mission?.state) || (raw.mission.state === 'complete') !== state.complete
        || !Array.isArray(raw.enemies) || raw.enemies.length !== state.emitted
        || new Set(raw.enemies.map(enemy => enemy.id)).size !== state.emitted
        || raw.enemies.some(enemy => !state.enemies.some(entry => entry.id === enemy.id)
          || (enemy.alive !== false ? enemy.health !== 1 : enemy.health !== 0)
          || !Number.isFinite(enemy.x) || enemy.x < 0 || enemy.x > 1280
          || !Number.isFinite(enemy.y) || enemy.y < 0 || enemy.y > 570)
        || raw.enemies.filter(enemy => enemy.alive !== false).length > 36
        || raw.vehicle?.active || raw.player?.inVehicle || !Number.isFinite(raw.player?.x) || raw.player.x < 0 || raw.player.x > 1280 - this.player.w
        || !Number.isFinite(raw.player?.y) || raw.player.y < 0 || raw.player.y > 570
        || state.complete && (raw.player.alive === false || raw.player.downed === true)) return { valid: false, reason: 'c12-identity-mismatch' };
      return checked;
    }
    applyResumeState(raw) {
      if (!this.isC12HordeV121()) return super.applyResumeState(raw);
      const checked = this.validateC12HordeResumeV121(raw); if (!checked.valid) return { applied: false, restored: 0, reason: checked.reason };
      const previousState = this.c12HordeV121, previousEnemies = this.enemies;
      this.c12HordeV121 = checked.state; this.enemies = [];
      for (const descriptor of checked.state.enemies) this.c12HordeSpawnV121(descriptor.profileId, descriptor.lane, descriptor);
      const result = super.applyResumeState(raw);
      if (!result?.applied) { this.c12HordeV121 = previousState; this.enemies = previousEnemies; return result; }
      this.missionLevelTimers?.clear(); this.missionLevelEvents?.clear(); this.missionLevelSpawns?.clear();
      const checkpoint = raw.specialOperation.c12HordeCheckpointV121;
      if (checkpoint && this.validateC12HordeResumeV121(checkpoint).valid) { this.c12HordeCheckpointV121 = clone(checkpoint); delete this.c12HordeCheckpointV121.specialOperation.c12HordeCheckpointV121; }
      this.syncC12HordeWorldV121(); this.refreshSpriteCollisionProfiles?.(); return { ...result, specialOperationRestored: true };
    }
    restartFromCheckpoint() {
      if (!this.isC12HordeV121()) return super.restartFromCheckpoint();
      if (this.mission?.state !== 'failed' || !this.c12HordeCheckpointV121) return false;
      const raw = clone(this.c12HordeCheckpointV121); raw.mission.state = 'active'; raw.mission.failureReason = null; raw.mission.retries = this.mission.retries + 1;
      raw.inventory.salvage = Math.max(0, Math.min(raw.inventory.salvage, this.inventory.salvage) - 20);
      const result = this.applyResumeState(raw); if (!result.applied) return false;
      this.clearGameplayInput?.(); this.onEvent({ type: 'mission-restarted', operationId: C12_HORDE_OPERATION_V121, salvagePenalty: 20 }); return true;
    }
    phaseLabel() { return this.isC12HordeV121() ? c12HordeDossierV121(this.c12HordeV121).title : super.phaseLabel(); }
    objectiveProgressText() { return this.isC12HordeV121() ? c12HordeDossierV121(this.c12HordeV121).instruction : super.objectiveProgressText(); }
    getInteractionPrompt() {
      if (!this.isC12HordeV121()) return super.getInteractionPrompt();
      const state = this.c12HordeV121;
      if (state.phase === 'evacuate' && near(this.player, 1150, 570)) return 'MAINTENIR E · ASCENSEUR · 2 S';
      if (!state.activated && near(this.player, 845, 570, 55)
        && (state.ammoTaken || distance(this.player, 845, 570) <= distance(this.player, 760, 570))) return 'E · RÉTABLIR L’ASCENSEUR';
      if (!state.ammoTaken && near(this.player, 760, 570, 55)) return 'E · RÉSERVE DE MUNITIONS · 160';
      if (!state.cargoTaken && near(this.player, 400, 355, 65)) return 'E · CAISSE FACULTATIVE';
      return '';
    }
    getSnapshot() { return { ...super.getSnapshot(), ...(this.isC12HordeV121() ? { c12HordeV121: {
      ...sanitizeC12HordeStateV121(this.c12HordeV121), dossier: c12HordeDossierV121(this.c12HordeV121) } } : {}) }; }
    getGameplayReport() { return { ...super.getGameplayReport(), ...(this.isC12HordeV121() ? { c12HordeV121: this.getSnapshot().c12HordeV121 } : {}) }; }
    drawBackdrop(ctx) {
      if (!this.isC12HordeV121()) return super.drawBackdrop(ctx);
      ctx.fillStyle = '#10181d'; ctx.fillRect(0, 0, 1280, 720);
      for (let x = 0; x < 1280; x += 160) { ctx.fillStyle = '#263338'; ctx.fillRect(x, 245, 4, 325); }
      ctx.strokeStyle = '#54777a'; ctx.lineWidth = 5; ctx.strokeRect(15, 388, 160, 181); ctx.strokeRect(20, 210, 170, 145);
      ctx.fillStyle = '#637a7c'; ctx.fillRect(828, 465, 36, 76);
      ctx.fillStyle = this.c12HordeV121.ammoTaken ? '#24353b' : '#c2ac77'; ctx.fillRect(744, 531, 36, 38);
      ctx.fillStyle = this.c12HordeV121.cargoTaken ? '#24353b' : '#b5c5ac'; ctx.fillRect(377, 317, 44, 36);
      ctx.strokeStyle = this.c12HordeV121.defenceElapsed >= 45 ? '#94d8b0' : '#aa7771'; ctx.strokeRect(1085, 380, 140, 190);
    }
    drawHud(ctx) {
      super.drawHud(ctx); if (!this.isC12HordeV121()) return;
      const state = this.c12HordeV121, dossier = c12HordeDossierV121(state);
      ctx.save(); ctx.fillStyle = '#0b161bef'; ctx.fillRect(18, 113, 1200, 73); ctx.font = '700 13px monospace'; ctx.fillStyle = '#c1d7d8';
      ctx.fillText(`RUPTURE C-12 · ${dossier.title} · ${Math.ceil(dossier.remaining)} S`, 32, 134);
      ctx.font = '12px monospace'; ctx.fillText(dossier.instruction, 32, 155);
      ctx.fillStyle = '#acc5ad'; ctx.fillText('PROFIL DE RENCONTRE : UN IMPACT · RÉSERVE UNIQUE · REPLI SANS NETTOYAGE TOTAL', 32, 175); ctx.restore();
    }
  };
}
