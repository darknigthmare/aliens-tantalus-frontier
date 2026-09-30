import { ENEMY_ENCYCLOPEDIA_CATALOG_V88, getEnemyUserCampaignV88, selectUserCasteEncountersV88, sanitizeUserCasteCampaignV88, isUserCasteCampaignAdmittedV95 } from './enemy-user-campaign-v88.js';
import { createUserCasteActorV87, isUserCasteImageReadyV87, updateUserCasteActorV87, setUserCasteVisualStateV95,
  getUserPoseHabitatV95, moveUserPoseWithinHabitatV95, confineUserPoseToHabitatV95 } from './enemy-user-pose-runtime-v87.js';
import { getEnemyStaticPoseV96 as getEnemyStaticPoseV95, sanitizeEnemyStaticPoseStateV96 as sanitizeEnemyStaticPoseStateV95, getEnemyStaticPoseStatesV96 as getEnemyStaticPoseStatesV95, selectEnemyStaticPoseEncounterStateV96 as selectEnemyStaticPoseEncounterStateV95 } from './enemy-static-poses-v96.js';
import { findLargeMissionActorPlacementV72 } from './mission-large-actor-placement-v72.js';
const IDS = new Set(ENEMY_ENCYCLOPEDIA_CATALOG_V88.map(d => d.id));
const profileId = enemy => enemy?.profileId || String(enemy?.id || '').split(':')[0];
const combatContract = enemy => {
  const definition = getEnemyUserCampaignV88(profileId(enemy));
  return definition?.behaviorContractV90 || definition?.behaviorContractV89;
};
const rangedContract = contract => ['timed-acid', 'cluster-acid'].includes(contract?.kind);
const combatState = contract => ({ schema: 89, kind: contract.kind, phase: 'cooldown', clock: 1.2, serial: 0,
  originX: 0, originY: 0, aimX: 0, aimY: 0,
  ...(contract.kind === 'erratic-stalk' ? { strideStep: 0, strideClock: 0 } : {}) });
// A pending mission wave is not a defeated actor. Keep its cooldown suspended
// until the existing spawn event activates it; never retain an armed windup.
function suspendDormantCombatV94(enemy, state, contract) {
  if (!enemy.dormant) return false;
  if (state.phase === 'windup') { state.phase = 'cooldown'; state.clock = contract.cooldown; }
  enemy.attacking = false; enemy.vx = 0;
  return true;
}
// Time-integrated, deterministic gait. No random save drift and no teleport/dash.
function strideDistanceV90(contract, state, dt) {
  if (contract.kind !== 'erratic-stalk') return dt;
  let remaining = dt, distance = 0;
  while (remaining > 1e-9) {
    const duration = contract.strideDurations[state.strideStep];
    const step = Math.min(remaining, Math.max(0, duration - state.strideClock));
    distance += step * contract.strideScales[state.strideStep];
    remaining -= step; state.strideClock += step;
    if (state.strideClock >= duration - 1e-9) {
      state.strideStep = (state.strideStep + 1) % contract.strideScales.length; state.strideClock = 0;
    }
  }
  return distance;
}
const finite = value => typeof value === 'number' && Number.isFinite(value);
const bounded = (value, low, high) => finite(value) && value >= low && value <= high;
const activeTarget = actor => actor?.alive && !actor.downed && !actor.ventTransit;
const effectDelta = delta => Math.max(0, Math.min(.1, Number(delta) || 0));
// Segment/slab collision includes thin closed doors; a fast projectile cannot tunnel.
function crossesBox(x1, y1, x2, y2, box, padding = 0) {
  let near = 0, far = 1;
  for (const [a, b, min, max] of [[x1, x2, box.x - padding, box.x + box.w + padding], [y1, y2, box.y - padding, box.y + box.h + padding]]) {
    const direction = b - a;
    if (!direction) { if (a < min || a > max) return false; continue; }
    const one = (min - a) / direction, two = (max - a) / direction;
    near = Math.max(near, Math.min(one, two)); far = Math.min(far, Math.max(one, two));
    if (near > far) return false;
  }
  return true;
}

export function createUserCampaignActorV88(definition, previous, slot, difficulty = {}, options = {}) {
  definition = getEnemyUserCampaignV88(definition?.id);
  if (!isUserCasteCampaignAdmittedV95(definition) || !previous) return null;
  const habitat = options.habitat;
  if (definition.locomotion === 'aquatic' && (!habitat?.active || habitat.kind !== 'water'
    || habitat.w < definition.bodyWidth || habitat.h < definition.bodyHeight)) return null;
  const actor = createUserCasteActorV87({ profileId: definition.id, id: `${definition.id}:campaign-${slot}`,
    visualStateV95: options.visualStateV95 }, previous.y + previous.h);
  if (!actor) return null;
  const healthScale = Number(difficulty.enemyHealth) || 1;
  Object.assign(actor, { x: previous.x, spawnX: previous.x, y: previous.y + previous.h - actor.h,
    name: definition.name, caste: definition.caste, userCasteIdleV88: definition.combatRole === 'idle',
    isBoss: previous.isBoss === true, isRoyal: definition.caste === 'royal', keyCarrier: previous.keyCarrier === true,
    reward: previous.reward || 6, dropsDisabledV80: false, campaignCasteV88: true,
    levelSpawnId: previous.levelSpawnId, levelZoneId: previous.levelZoneId,
    dormant: previous.dormant === true, alive: previous.alive !== false,
    maxHealth: Math.round(definition.health * healthScale), health: Math.round(definition.health * healthScale),
    damage: definition.damage * (Number(difficulty.enemyDamage) || 1),
    speed: actor.speed * (Number(difficulty.enemySpeed) || 1), encounterWorldIds: definition.encounterWorldIds,
    provenance: definition.provenance });
  if (definition.locomotion === 'aquatic') Object.assign(actor, { habitatIdV95: habitat.id,
    x: Math.max(habitat.x, Math.min(habitat.x + habitat.w - actor.w, previous.x)),
    y: Math.max(habitat.y, Math.min(habitat.y + habitat.h - actor.h, previous.y)),
    groundY: habitat.y + habitat.h });
  if (definition.locomotion === 'aquatic' && !confineUserPoseToHabitatV95(actor, habitat)) return null;
  const contract = definition.behaviorContractV90 || definition.behaviorContractV89;
  if (contract) actor.userCasteCombatV89 = combatState(contract);
  return actor;
}

/** Two contextual actors replace ordinary contacts; total population and authored mission gates remain intact. */
export function withUserCasteCampaignV88(BaseEngine) {
  return class UserCasteCampaignV88 extends BaseEngine {
    start(options = {}) {
      this.userCasteImageEpochV88 = (this.userCasteImageEpochV88 || 0) + 1;
      this.userCasteFailedImagesV88 ||= new WeakSet();
      this.userCasteCampaignActiveV88 = Boolean(options.userCasteCampaignV88 === true && options.world?.id && options.campaign?.id && !options.editorProject
        && !options.specialOperationId && !/tutorial|prologue|simulation|bioforge/i.test(`${options.campaign.mode || ''} ${options.campaign.id}`));
      this.userCasteObservedV88 = new Set(); this.userCasteDefeatedV88 = new Set();
      this.userCasteDiscoveryPendingV88 = new Map(); this.userCasteDiscoveryRetryClockV88 = 0;
      this.userCasteEffectsV89 = [];
      this.userCasteCampaignV88 = null; this.userCasteLoadingV88 = false; this.userCasteErrorsV88 = [];
      this.userCasteMissionOptionsV88 = options;
      // Only native operations need delayed restore. All historical/special
      // operations keep the exact original balancing/restoration order.
      const nativeRestore = this.userCasteCampaignActiveV88 && options.resumeState
        && sanitizeUserCasteCampaignV88(options.resumeState.userCasteCampaignV88)?.worldId === options.world?.id;
      const snapshot = super.start(nativeRestore ? { ...options, resumeState: null } : options);
      this.installUserCasteEncountersV88(options);
      if (nativeRestore) this.lastResumeResult = this.applyResumeState(options.resumeState);
      return { ...snapshot, userCasteCampaignV88: this.userCasteCampaignV88 };
    }

    installUserCasteEncountersV88(options) {
      if (!this.userCasteCampaignActiveV88) return [];
      const restored = sanitizeUserCasteCampaignV88(options.resumeState?.userCasteCampaignV88);
      // Old operations retain their original enemy identities when migrated mid-mission.
      const selected = options.resumeState ? (restored?.worldId === options.world?.id ? restored.entries.map(e => getEnemyUserCampaignV88(e.profileId)) : [])
        : selectUserCasteEncountersV88(options);
      const entries = [], used = new Set();
      for (const d of selected) {
        if (!isUserCasteCampaignAdmittedV95(d) || !d.encounterWorldIds.includes(options.world?.id)) continue;
        const aquatic = d.locomotion === 'aquatic';
        const receipt = restored?.entries.find(e => e.profileId === d.id);
        const candidates = receipt ? [receipt.slot] : this.enemies.map((_, i) => i)
          // Preserve authored delayed waves instead of requiring a live patrol.
          // createUserCampaignActorV88 retains alive/dormant and levelSpawnId.
          .filter(i => !used.has(i) && (this.enemies[i].alive || this.enemies[i].dormant)
            && !this.enemies[i].keyCarrier && (aquatic ? Boolean(this.enemies[i].cetoHabitatId) : !this.enemies[i].cetoHabitatId)
            && !this.enemies[i].campaignCasteV88)
          .sort((a, b) => {
            const royal = d.caste === 'royal';
            const bossA = this.enemies[a].isBoss === true, bossB = this.enemies[b].isBoss === true;
            return Number(bossB === royal) - Number(bossA === royal)
              || Number(this.enemies[a].dormant === true) - Number(this.enemies[b].dormant === true) || a - b;
          });
        for (const slot of candidates) {
          const previous = this.enemies[slot];
          if (!previous || used.has(slot) || (!receipt && d.caste !== 'royal' && previous.isBoss)) continue;
          const habitat = aquatic ? (this.missionLevelRuntime?.aquaticHabitats || []).find(volume =>
            volume.id === previous.cetoHabitatId && volume.kind === 'water' && volume.active === true) : null;
          const actor = createUserCampaignActorV88(d, previous, slot, this.difficultyRuntime, { habitat,
            // A legacy receipt without colour remains Grey; only new contacts roll a colour.
            visualStateV95: receipt ? receipt.visualStateV95 : selectEnemyStaticPoseEncounterStateV95(d.id, options) });
          if (!actor) continue;
          if (this.missionLevelRuntime && !aquatic) {
            const geometry = { platforms: this.platforms, doors: this.doors, ...this.missionLevelBounds };
            const placement = findLargeMissionActorPlacementV72(actor, geometry, {
              x: previous.x + previous.w / 2, y: previous.y + previous.h, zoneId: previous.levelZoneId });
            if (!placement) continue;
            Object.assign(actor, { x: placement.x, y: placement.y, groundY: placement.groundY,
              spawnX: placement.x, levelZoneId: placement.zoneId || previous.levelZoneId });
          }
          if (d.locomotion === 'flying') moveUserPoseWithinHabitatV95(this, actor, getUserPoseHabitatV95(this, actor), 0, -72);
          this.enemies[slot] = actor; used.add(slot);
          if (this.objectiveState?.trackedBossId === previous.id) this.objectiveState.trackedBossId = actor.id;
          if (!['flying', 'aquatic'].includes(d.locomotion)) this.initializeEnemyMissionNavigation?.(actor);
          entries.push({ profileId: d.id, slot, ...(actor.visualStateV95 ? { visualStateV95: actor.visualStateV95 } : {}) });
          this.ensureUserCasteImageV88(getEnemyStaticPoseV95(d.id, actor.visualStateV95));
          break;
        }
      }
      this.userCasteCampaignV88 = { schema: 88, worldId: options.world?.id || '', entries };
      this.refreshUserCasteLoadingV88();
      return entries;
    }

    ensureUserCasteImageV88(d) {
      const cached = this.images.get(d.imageKey);
      this.userCasteFailedImagesV88 ||= new WeakSet();
      // Keep a valid or in-flight request; only a failed/completed-invalid PNG
      // needs a fresh request when the user restarts the mission.
      const reusable = cached && !this.userCasteFailedImagesV88.has(cached)
        && (!cached.complete || isUserCasteImageReadyV87(cached, d));
      const image = reusable ? cached : new Image(), epoch = this.userCasteImageEpochV88;
      image.onerror = () => {
        if (this.images.get(d.imageKey) !== image) return;
        this.userCasteFailedImagesV88.add(image);
        if (epoch !== this.userCasteImageEpochV88 || !this.userCasteCampaignActiveV88
          || !this.userCasteCampaignV88?.entries.some(entry => entry.profileId === d.id)) return;
        if (!this.userCasteErrorsV88.includes(d.id)) this.userCasteErrorsV88.push(d.id);
      };
      if (!reusable) {
        image.decoding = 'async'; this.images.set(d.imageKey, image); image.src = d.path;
      }
      return image;
    }

    refreshUserCasteLoadingV88() {
      const entries = this.userCasteCampaignV88?.entries || [];
      this.userCasteLoadingV88 = entries.some(e => {
        const d = getEnemyStaticPoseV95(e.profileId, e.visualStateV95), image = this.images.get(d.imageKey);
        const failed = this.userCasteFailedImagesV88?.has(image), ready = !failed && isUserCasteImageReadyV87(image, d);
        if (!ready && (failed || image?.complete) && !this.userCasteErrorsV88.includes(d.id)) this.userCasteErrorsV88.push(d.id);
        return !ready;
      });
      return this.userCasteLoadingV88;
    }

    update(delta) {
      this.retryEnemyDiscoveryV88(delta);
      if (this.refreshUserCasteLoadingV88()) { this.clearGameplayInput?.(); return; }
      return super.update(delta);
    }

    userCasteTargetsV89() {
      return [...new Set([this.userCasteMainPlayerV89 || this.player, this.coopEnabled ? this.coop : null, ...(this.activeSquadActors?.() || [])])].filter(activeTarget);
    }

    missionLevelEnemyTarget(enemy) {
      if (!this.userCasteCampaignActiveV88 || !enemy?.campaignCasteV88 || !combatContract(enemy)) return super.missionLevelEnemyTarget(enemy);
      const target = this.userCasteTargetsV89().sort((a, b) => Math.abs(a.x - enemy.x) - Math.abs(b.x - enemy.x))[0];
      return target?.inVehicle && this.vehicle?.active ? this.vehicle : target || null;
    }

    updateEnemy(enemy, delta) {
      // V95 air/water actors deliberately bypass the terrestrial surface/ladder navigator.
      // Dormant contacts retain their authored event instead of receiving a movement tick.
      const pose = getEnemyStaticPoseV95(enemy?.profileId);
      if (this.userCasteCampaignActiveV88 && enemy?.campaignCasteV88 && ['flying', 'aquatic'].includes(pose?.locomotion)) {
        if (this.paused || this.userCasteLoadingV88 || this.mission?.state !== 'active') return;
        return updateUserCasteActorV87(this, enemy, effectDelta(delta));
      }
      const contract = combatContract(enemy);
      if (!this.userCasteCampaignActiveV88 || !enemy?.campaignCasteV88 || !contract) return super.updateEnemy(enemy, delta);
      if (this.paused || this.userCasteLoadingV88 || !effectDelta(delta) || this.mission?.state !== 'active') return;
      const state = enemy.userCasteCombatV89 ||= combatState(contract);
      if (suspendDormantCombatV94(enemy, state, contract)) return;
      // Navigation may return before the inner combat hook. Cancel before that
      // early return rather than preserving an armed attack through a vent.
      if (!enemy.alive) { state.phase = 'spent'; state.clock = 0; return; }
      if (state.phase === 'windup' && (enemy.dormant || enemy.ventTransit || enemy.staggerClock > 0
        || !this.userCasteTargetsV89().length || (this.missionLevelRuntime && !this.missionLevelEnemyTarget(enemy)))) {
        state.phase = 'cooldown'; state.clock = contract.cooldown; enemy.attacking = false;
      }
      const previousPlayer = this.userCasteMainPlayerV89;
      this.userCasteMainPlayerV89 = this.player;
      try { return super.updateEnemy(enemy, effectDelta(delta)); }
      finally { this.userCasteMainPlayerV89 = previousPlayer; }
    }

    userCastePathClearV89(x1, y1, x2, y2, padding = 0) {
      const obstacles = [...(this.walls || []), ...(this.closedDoorColliders?.() || []),
        ...(this.covers || []).filter(cover => !cover.destroyed), ...(this.platforms || [])];
      return !obstacles.some(box => crossesBox(x1, y1, x2, y2, box, padding));
    }

    userCasteGroundPathV89(x1, x2, y) {
      let covered = Math.min(x1, x2);
      const end = Math.max(x1, x2);
      const spans = [...(this.platforms || []), ...(this.lifts || [])]
        .filter(p => Math.abs(p.y - y - 8) <= 14 && p.x + p.w >= covered && p.x <= end).sort((a, b) => a.x - b.x);
      for (const p of spans) {
        if (p.x > covered + 6) return false;
        covered = Math.max(covered, p.x + p.w);
        if (covered >= end) return true;
      }
      return false;
    }

    updateUserCampaignBehaviorV89(enemy, delta) {
      const contract = combatContract(enemy);
      if (!this.userCasteCampaignActiveV88 || !enemy?.campaignCasteV88 || !contract) return false;
      const state = enemy.userCasteCombatV89 ||= combatState(contract), dt = effectDelta(delta);
      if (suspendDormantCombatV94(enemy, state, contract)) return true;
      if (!enemy.alive) { state.phase = 'spent'; state.clock = 0; return true; }
      if (this.paused || this.userCasteLoadingV88 || !dt || this.mission?.state !== 'active') return true;
      enemy.attacking = false; enemy.vx = 0;
      for (const key of ['attackClock', 'rangedClock', 'staggerClock', 'hurtClock']) enemy[key] = Math.max(0, (Number(enemy[key]) || 0) - dt);
      const targets = this.userCasteTargetsV89();
      const target = targets.sort((a, b) => Math.abs(a.x - enemy.x) - Math.abs(b.x - enemy.x))[0];
      const feet = enemy.y + enemy.h, x = enemy.x + enemy.w / 2;
      const cancel = () => { state.phase = 'cooldown'; state.clock = contract.cooldown; enemy.attacking = false; };
      if (enemy.dormant || enemy.ventTransit || enemy.staggerClock > 0 || !target
        || (enemy.levelNavigation && enemy.levelNavigation.mode !== 'surface')
        || Math.abs(target.y + target.h - feet) > 40) {
        if (state.phase === 'windup') cancel();
        return true;
      }
      const targetX = target.x + target.w / 2, gap = Math.abs(targetX - x);
      enemy.facing = Math.sign(targetX - x) || enemy.facing; enemy.alert = gap < 900;
      if (state.phase === 'windup') {
        if (Math.abs(enemy.x - state.originX) > 4 || Math.abs(enemy.y - state.originY) > 4) { cancel(); return true; }
        state.clock = Math.max(0, state.clock - dt); enemy.attacking = true;
        if (state.clock > 0) return true;
        // Consume the attack before damage/events, so an intervening save sees no pending duplicate.
        state.phase = contract.kind === 'acid-burst' ? 'spent' : 'cooldown'; state.clock = contract.cooldown;
        if (rangedContract(contract)) {
          const y = enemy.y + enemy.h * .45;
          const offsets = contract.clusterOffsets || [0];
          // Reserve the whole volley before inserting anything. Other enemies
          // cannot turn a capped cluster into an unpredictable partial volley.
          if (this.userCasteEffectsV89.filter(e => e.kind === 'glob' && e.life > 0).length + offsets.length <= 4) {
            offsets.forEach((offset, shotIndex) => {
              if (!this.userCastePathClearV89(x, y, state.aimX + offset, state.aimY, 3)) return;
              this.userCasteEffectsV89.push({ kind: 'glob', ownerId: enemy.id, x, y, vx: (state.aimX + offset - x) / contract.fuse,
                vy: (state.aimY - y) / contract.fuse, life: contract.fuse, clock: 0, serial: state.serial,
                ...(contract.kind === 'cluster-acid' ? { shotIndex } : {}) });
            });
          }
        } else {
          // Mark the sacrificial actor dead before callbacks can capture a save.
          // No snapshot may contain an already delivered but still armed Burster.
          if (contract.kind === 'acid-burst') this.defeatEnemy(enemy, null);
          this.userCasteAreaImpactV89(enemy, x, contract.kind === 'ground-slam' ? feet - 8 : enemy.y + enemy.h / 2, contract);
          this.userCasteEffectsV89.push({ kind: 'pulse', ownerId: enemy.id, x, y: feet - 8, vx: 0, vy: 0, life: .3, clock: 0, serial: state.serial });
        }
        this.onEvent({ type: 'user-caste-impact-v89', enemyId: enemy.id, kind: contract.kind, serial: state.serial });
        return true;
      }
      if (state.phase === 'spent') return true;
      state.clock = Math.max(0, state.clock - dt);
      const stop = contract.preferredRange || (contract.kind === 'timed-acid' ? 260 : contract.range * .8);
      if (enemy.alert && gap > stop) {
        const previousX = enemy.x, destinationX = enemy.x + enemy.facing * enemy.speed * strideDistanceV90(contract, state, dt);
        if (this.missionLevelRuntime) this.moveEnemyOnMissionSurface(enemy, destinationX, dt);
        else { enemy.x = destinationX; this.resolveEnemyHorizontal?.(enemy, previousX); }
        enemy.vx = (enemy.x - previousX) / dt;
      }
      const originY = contract.kind === 'ground-slam' ? feet - 8 : enemy.y + enemy.h * .45;
      const aimY = rangedContract(contract) || contract.kind === 'ground-slam' ? target.y + target.h - 8 : target.y + target.h * .5;
      if (state.clock === 0 && gap <= contract.range && enemy.alert
        && this.enemyMeleePathClearV64?.(enemy, target) !== false
        && this.userCastePathClearV89(x, originY, targetX, aimY, 2)) {
        Object.assign(state, { phase: 'windup', clock: contract.windup, serial: state.serial + 1,
          originX: enemy.x, originY: enemy.y, aimX: targetX, aimY });
        enemy.attacking = true;
        this.onEvent({ type: 'user-caste-telegraph-v89', enemyId: enemy.id, kind: contract.kind, windup: contract.windup });
      }
      return true;
    }

    userCasteAreaImpactV89(enemy, x, y, contract, scale = 1) {
      const vehicles = new Set();
      for (const target of this.userCasteTargetsV89()) {
        const targetX = target.x + target.w / 2;
        const targetY = contract.kind === 'ground-slam' || scale !== 1 ? target.y + target.h - 8 : target.y + target.h * .5;
        if (Math.hypot(targetX - x, targetY - y) > contract.radius
          || ((contract.kind === 'ground-slam' || scale !== 1) && Math.abs(target.y + target.h - y - 8) > 24)
          || ((contract.kind === 'ground-slam' || scale !== 1) && !this.userCasteGroundPathV89(x, targetX, y))
          || !this.userCastePathClearV89(x, y, targetX, targetY, 1)) continue;
        const damage = enemy.damage * contract.damageScale * scale;
        if (target.inVehicle && this.vehicle?.active) {
          if (!vehicles.has(this.vehicle)) this.damageVehicle(damage, contract.kind);
          vehicles.add(this.vehicle);
        } else if (target === (this.userCasteMainPlayerV89 || this.player) || target === this.coop) this.damagePlayer(target, damage, { source: contract.kind });
        else this.damageSquadMember?.(target, damage, { source: contract.kind });
      }
    }

    updateHostileProjectiles(delta) {
      super.updateHostileProjectiles(delta);
      const dt = effectDelta(delta);
      if (!dt || this.paused || this.userCasteLoadingV88 || this.mission?.state !== 'active') return;
      const additions = [];
      for (const effect of this.userCasteEffectsV89 || []) {
        const enemy = this.enemies.find(e => e.id === effect.ownerId), contract = combatContract(enemy);
        if (!contract) { effect.life = 0; continue; }
        const step = Math.min(dt, effect.life); effect.life = Math.max(0, effect.life - dt);
        if (effect.kind === 'glob') {
          const x = effect.x + effect.vx * step, y = effect.y + effect.vy * step;
          if (!this.userCastePathClearV89(effect.x, effect.y, x, y, 3)) { effect.life = 0; continue; }
          effect.x = x; effect.y = y;
          if (effect.life === 0) {
            this.userCasteAreaImpactV89(enemy, x, y, contract);
            const floor = this.missionLevelSurfaceFor?.({ x: x - 2, y: y - 2, w: 4, h: 4 }, { tolerance: 28 })
              || this.platforms.find(p => x >= p.x && x <= p.x + p.w && Math.abs(p.y - y) <= 28);
            if (floor && contract.poolLife > 0 && this.userCasteEffectsV89.filter(e => e.kind === 'pool').length + additions.length < 6)
              additions.push({ ...effect, kind: 'pool', y: floor.y - 8, vx: 0, vy: 0, life: contract.poolLife, clock: .6 });
            this.onEvent({ type: 'user-caste-glob-detonated-v89', enemyId: enemy.id, serial: effect.serial,
              ...(contract.kind === 'cluster-acid' ? { shotIndex: effect.shotIndex } : {}) });
          }
        } else if (effect.kind === 'pool' && effect.life > 0) {
          effect.clock = Math.max(0, effect.clock - dt);
          if (!effect.clock) { effect.clock = .6; this.userCasteAreaImpactV89(enemy, effect.x, effect.y, contract, .2); }
        }
      }
      this.userCasteEffectsV89 = [...(this.userCasteEffectsV89 || []).filter(e => e.life > 0), ...additions].slice(-12);
    }

    updateBullets(delta) {
      const dt = effectDelta(delta);
      // Shoot-down is resolved before the ordinary bullet/enemy pass, consuming each bullet once.
      if (dt && !this.paused) for (const bullet of this.bullets || []) {
        if (bullet.hit) continue;
        const effect = (this.userCasteEffectsV89 || []).find(e => e.kind === 'glob' && e.life > 0
          && crossesBox(bullet.x, bullet.y, bullet.x + bullet.vx * dt, bullet.y + (bullet.vy || 0) * dt,
            { x: e.x - 9, y: e.y - 9, w: 18, h: 18 }, 3)
          && this.userCastePathClearV89(bullet.x, bullet.y, e.x, e.y, 1));
        if (effect) { effect.life = 0; bullet.hit = true; this.onEvent({ type: 'user-caste-glob-destroyed-v89', enemyId: effect.ownerId }); }
      }
      this.userCasteEffectsV89 = (this.userCasteEffectsV89 || []).filter(e => e.life > 0);
      return super.updateBullets(delta);
    }

    drawWorld(ctx) {
      super.drawWorld(ctx);
      ctx.save();
      for (const effect of this.userCasteEffectsV89 || []) {
        const contract = combatContract(this.enemies.find(e => e.id === effect.ownerId));
        if (!contract || effect.life <= 0) continue;
        ctx.fillStyle = effect.kind === 'glob' ? '#e9e4d6' : 'rgba(213,222,160,.38)';
        ctx.strokeStyle = '#dfecb0'; ctx.lineWidth = 2; ctx.beginPath();
        ctx.ellipse(effect.x, effect.y, effect.kind === 'glob' ? 9 : contract.radius, effect.kind === 'glob' ? 9 : 7, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }
      ctx.restore();
    }

    drawEnemy(ctx, enemy) {
      const result = super.drawEnemy(ctx, enemy);
      const combat = enemy?.userCasteCombatV89, contract = combatContract(enemy);
      if (enemy?.alive && combat?.phase === 'windup' && contract) {
        ctx.save(); ctx.strokeStyle = '#f4c77b'; ctx.lineWidth = 2;
        ctx.strokeRect(enemy.x - 5, enemy.y - 5, enemy.w + 10, enemy.h + 10);
        ctx.fillStyle = '#f4d7a4'; ctx.font = '12px monospace'; ctx.fillText(contract.label, enemy.x, enemy.y - 12); ctx.restore();
      }
      if (this.userCasteCampaignActiveV88 && enemy?.alive && !enemy.dormant) {
        const id = profileId(enemy), d = getEnemyStaticPoseV95(id, enemy.visualStateV95);
        const p = this.player;
        if (IDS.has(id) && !this.userCasteObservedV88.has(id) && p
          && Math.abs(enemy.x - p.x) < 620 && Math.abs(enemy.y + enemy.h - p.y - p.h) < 300
          && (!d || isUserCasteImageReadyV87(this.images.get(d.imageKey), d))
          && this.enemyMeleePathClearV64?.(enemy, p) !== false) {
          this.userCasteObservedV88.add(id); this.emitEnemyDiscoveryV88('enemy-discovered-v88', enemy);
        }
      }
      return result;
    }

    emitEnemyDiscoveryV88(type, enemy) {
      const options = this.userCasteMissionOptionsV88 || {};
      const operation = options.operationId || options.campaign?.id || '';
      const event = { type, scope: 'campaign', operationId: operation, profileId: profileId(enemy), worldId: options.world?.id || '',
        campaignId: options.campaign?.id || '', receipt: `${operation}:${options.levelSeed?.seed ?? options.seed ?? 0}:${enemy.id}` };
      this.userCasteDiscoveryPendingV88.set(`${type}:${event.receipt}`, event);
      this.retryEnemyDiscoveryV88(0);
    }

    retryEnemyDiscoveryV88(delta) {
      if (!this.userCasteCampaignActiveV88 || !this.userCasteDiscoveryPendingV88?.size) return;
      this.userCasteDiscoveryRetryClockV88 = Math.max(0, this.userCasteDiscoveryRetryClockV88 - Math.max(0, Math.min(1, Number(delta) || 0)));
      if (this.userCasteDiscoveryRetryClockV88 > 0) return;
      const pending = this.userCasteDiscoveryPendingV88;
      for (const [key, event] of pending) {
        // Only an explicit persistence failure retries. Ignored/stale owners
        // are terminal; app.js checks profile, timeline and operation each time.
        const acknowledged = this.onEvent(event);
        if (pending !== this.userCasteDiscoveryPendingV88) return;
        if (acknowledged === false) { this.userCasteDiscoveryRetryClockV88 = 2; return; }
        pending.delete(key);
      }
    }

    defeatEnemy(enemy, owner) {
      const wasAlive = enemy?.alive;
      if (enemy?.userCasteCombatV89) { enemy.userCasteCombatV89.phase = 'spent'; enemy.userCasteCombatV89.clock = 0; }
      const result = super.defeatEnemy(enemy, owner);
      if (this.userCasteCampaignActiveV88 && wasAlive && !enemy.alive && IDS.has(profileId(enemy)) && !this.userCasteDefeatedV88.has(enemy.id)) {
        this.userCasteDefeatedV88.add(enemy.id); this.emitEnemyDiscoveryV88('enemy-defeated-v88', enemy);
      }
      return result;
    }

    captureResumeState() {
      const state = super.captureResumeState();
      return { ...state, enemies: state.enemies.map(entry => {
        const actor = this.enemies.find(e => e.id === entry.id);
        return actor?.campaignCasteV88 ? { ...entry, userCasteAttackClockV88: actor.attackClock,
          userCasteRangedClockV88: actor.rangedClock, profileId: actor.profileId,
          ...(actor.visualStateV95 ? { visualStateV95: actor.visualStateV95 } : {}),
          ...(actor.userCasteCombatV89 ? { userCasteCombatV89: { ...actor.userCasteCombatV89 } } : {}) } : entry;
      }), userCasteCampaignV88: sanitizeUserCasteCampaignV88(this.userCasteCampaignV88),
      userCasteEffectsV89: { schema: 89, entries: (this.userCasteEffectsV89 || []).filter(e => e.life > 0).map(e => ({ ...e })) } };
    }

    applyResumeState(raw) {
      const result = super.applyResumeState(raw);
      if (!result?.applied) return result;
      for (const actor of this.enemies.filter(e => e.campaignCasteV88)) {
        const saved = raw.enemies?.find(e => e.id === actor.id && e.profileId === actor.profileId);
        if (!saved) continue;
        actor.attackClock = Math.max(0, Math.min(2, Number(saved.userCasteAttackClockV88) || 0));
        actor.rangedClock = Math.max(0, Math.min(2, Number(saved.userCasteRangedClockV88) || 0));
        if (getEnemyStaticPoseV95(actor.profileId)?.locomotion === 'aquatic') {
          actor.habitatBlockedV95 = !confineUserPoseToHabitatV95(actor, getUserPoseHabitatV95(this, actor));
        }
        if (getEnemyStaticPoseStatesV95(actor.profileId).length) {
          setUserCasteVisualStateV95(actor, sanitizeEnemyStaticPoseStateV95(actor.profileId, saved.visualStateV95));
          const receipt = this.userCasteCampaignV88?.entries.find(entry => entry.profileId === actor.profileId);
          if (receipt) {
            if (actor.visualStateV95) receipt.visualStateV95 = actor.visualStateV95;
            else delete receipt.visualStateV95;
          }
          this.ensureUserCasteImageV88(getEnemyStaticPoseV95(actor.profileId, actor.visualStateV95));
        }
        const contract = combatContract(actor), state = saved.userCasteCombatV89;
        if (contract) {
          const valid = state?.schema === 89 && state.kind === contract.kind && ['cooldown', 'windup', 'spent'].includes(state.phase)
            && (!(actor.alive || actor.dormant) || state.phase !== 'spent')
            && bounded(state.clock, 0, 3) && bounded(state.serial, 0, 1000000)
            && ['originX', 'originY', 'aimX', 'aimY'].every(key => bounded(state[key], -10000, 100000))
            && (contract.kind !== 'erratic-stalk' || (Number.isInteger(state.strideStep) && bounded(state.strideStep, 0, 3)
              && bounded(state.strideClock, 0, contract.strideDurations[state.strideStep])));
          actor.userCasteCombatV89 = valid ? { schema: 89, kind: state.kind, phase: state.phase, clock: state.clock,
            serial: state.serial, originX: state.originX, originY: state.originY, aimX: state.aimX, aimY: state.aimY,
            ...(contract.kind === 'erratic-stalk' ? { strideStep: state.strideStep, strideClock: state.strideClock } : {}) } : combatState(contract);
          actor.userCasteBehaviorRestoreV89 = valid ? 'restored' : state === undefined ? 'legacy-safe' : 'invalid-safe';
          if (!actor.alive && !actor.dormant) { actor.userCasteCombatV89.phase = 'spent'; actor.userCasteCombatV89.clock = 0; }
        }
      }
      // Invalid/foreign transient effects are dropped; never reconstruct an already spent impact.
      const seenEffects = new Set(), restoredEffectCounts = { glob: 0, pool: 0, pulse: 0 };
      this.userCasteEffectsV89 = raw.userCasteEffectsV89?.schema === 89 && Array.isArray(raw.userCasteEffectsV89.entries)
        ? raw.userCasteEffectsV89.entries.slice(0, 12).filter(effect => {
          if (!effect || typeof effect !== 'object') return false;
          const actor = this.enemies.find(e => e.id === effect.ownerId), contract = combatContract(actor);
          const clustered = contract?.kind === 'cluster-acid';
          const key = `${effect.ownerId}:${effect.serial}:${clustered ? effect.shotIndex : 0}`;
          if (seenEffects.has(key)) return false;
          seenEffects.add(key);
          const valid = actor?.campaignCasteV88 && contract && ['glob', 'pool', 'pulse'].includes(effect.kind)
            && (effect.kind === 'pulse' || (effect.kind === 'glob' && rangedContract(contract)) || (effect.kind === 'pool' && contract.poolLife > 0))
            && (!clustered || (effect.kind === 'glob' && Number.isInteger(effect.shotIndex) && bounded(effect.shotIndex, 0, 2)
              && effect.serial === actor.userCasteCombatV89?.serial && actor.userCasteBehaviorRestoreV89 === 'restored'))
            && bounded(effect.life, Number.EPSILON, effect.kind === 'glob' ? contract.fuse : effect.kind === 'pool' ? contract.poolLife : .3)
            && bounded(effect.clock, 0, .6) && bounded(effect.serial, 0, 1000000)
            && ['x', 'y'].every(key => bounded(effect[key], -10000, 100000)) && ['vx', 'vy'].every(key => bounded(effect[key], -1000, 1000));
          if (!valid || restoredEffectCounts[effect.kind] >= (effect.kind === 'glob' ? 4 : effect.kind === 'pool' ? 6 : 12)) return false;
          restoredEffectCounts[effect.kind]++;
          return true;
        }).map(effect => ({ kind: effect.kind, ownerId: effect.ownerId, x: effect.x, y: effect.y, vx: effect.vx, vy: effect.vy,
          life: effect.life, clock: effect.clock, serial: effect.serial,
          ...(combatContract(this.enemies.find(e => e.id === effect.ownerId))?.kind === 'cluster-acid' ? { shotIndex: effect.shotIndex } : {}) })) : [];
      return result;
    }

    drawHud(ctx) {
      super.drawHud(ctx);
      if (!this.userCasteLoadingV88) return;
      ctx.save(); ctx.fillStyle = '#121d19'; ctx.fillRect(24, 108, 650, 50); ctx.fillStyle = '#edcc89'; ctx.font = '16px monospace';
      ctx.fillText(this.userCasteErrorsV88.length ? 'IMAGE DE CRÉATURE INDISPONIBLE — rechargez la mission' : 'CHARGEMENT DES CRÉATURES — simulation suspendue', 36, 139); ctx.restore();
    }
  };
}
