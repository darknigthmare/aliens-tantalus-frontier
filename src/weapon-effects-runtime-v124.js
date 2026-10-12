import { getWeaponPresentationProfileV124 } from './weapon-presentation-profiles-v124.js';
import {
  createWeaponEffectsV124, resetWeaponEffectsV124, emitWeaponShotEffectsV124, emitWeaponCycleEffectsV124,
  emitWeaponReloadEffectsV124, updateWeaponEffectsV124,
  drawWeaponCasingsV124, drawWeaponLightsV124, getWeaponEffectsSnapshotV124
} from './weapon-effects-v124.js';

const list = value => Array.isArray(value) ? value : [];
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const VIEWPORT = Object.freeze({ width: 1280, height: 720 });
const DEFAULT_BOUNDS = Object.freeze({ width: 6200, height: 1080 });
const RELOAD_DISCARD_PHASE = 0.35;
const profileKey = profile => profile.weaponId || profile.name || profile.mechanism;

/** Cosmetic integration observes accepted simulation events. It never spends,
 * restores or changes ammunition, damage, targeting or the reload transaction. */
export function withWeaponEffectsV124(Base) {
  return class WeaponEffectsRuntimeV124 extends Base {
    resetSceneWeaponEffectsV124() {
      const options = { seed: finite(this.weaponEffectsSeedV124, 124), timeSeconds: finite(this.animationTime),
        context: String(this.mission?.phase || this.missionLevelRuntime?.id || 'mission') };
      if (this.weaponEffectsV124) resetWeaponEffectsV124(this.weaponEffectsV124, options);
      else this.weaponEffectsV124 = createWeaponEffectsV124(options);
      this.weaponEffectsContextV124 = { mission: this.mission, level: this.missionLevelRuntime, platforms: this.platforms };
      this.weaponEffectActorsV124 = new WeakMap();
      this.weaponEffectReloadsV124 = new WeakMap();
      this.weaponEffectFeedsV124 = new WeakMap();
      this.weaponEffectActorSerialV124 = 0;
      this.weaponEffectReloadSerialV124 = 0;
      this.pendingWeaponCyclesV124 = [];
      return this.weaponEffectsV124;
    }

    ensureSceneWeaponEffectsV124() {
      const previous = this.weaponEffectsContextV124;
      // Camera room numbers change while walking. Only replacement of the
      // physical scene starts a new debris pool.
      if (!this.weaponEffectsV124 || !previous || previous.mission !== this.mission
        || previous.level !== this.missionLevelRuntime || previous.platforms !== this.platforms) this.resetSceneWeaponEffectsV124();
      return this.weaponEffectsV124;
    }

    start(options = {}) {
      this.weaponEffectsSeedV124 = finite(options.seed, 124);
      this.resetSceneWeaponEffectsV124();
      const result = super.start(options);
      this.resetSceneWeaponEffectsV124();
      return result;
    }

    stop(...args) {
      const result = super.stop(...args);
      this.resetSceneWeaponEffectsV124();
      return result;
    }

    applyResumeState(raw) {
      const result = super.applyResumeState(raw);
      if (result?.applied) this.resetSceneWeaponEffectsV124();
      return result;
    }

    weaponEffectsWorldV124() {
      return { walls: list(this.walls), covers: list(this.covers), doors: list(this.doors),
        platforms: [...list(this.platforms), ...list(this.lifts)],
        bounds: this.missionLevelBounds || this.bioforgeLevelV80?.world || DEFAULT_BOUNDS };
    }

    weaponEffectsActorV124(actor) {
      this.ensureSceneWeaponEffectsV124();
      let record = this.weaponEffectActorsV124.get(actor);
      if (!record) {
        record = { id: `${actor.crewId || actor.id || (actor.coop ? 'coop' : 'actor')}:${++this.weaponEffectActorSerialV124}`,
          lastShot: -1, auxiliarySerial: 0 };
        this.weaponEffectActorsV124.set(actor, record);
      }
      return record;
    }

    weaponDescriptorV124(actor = this.player) {
      if (actor?.inVehicle) return 'apc-turret';
      if (actor?.squadMember) return actor.crewV85?.weaponRuntime || actor.weaponRuntime || actor.weapon
        || (actor.specialty === 'heavy' ? 'smartgun' : actor.specialty === 'demolition' ? 'launcher' : 'generic-ballistic');
      return this.reloadWeaponV77?.(actor) || actor?.weaponRuntime || actor?.weapon || actor?.weaponMode || 'sidearm';
    }

    weaponShotGeometryV124(actor, bullet) {
      const angle = Number.isFinite(bullet?.angleRadians) ? bullet.angleRadians
        : Math.atan2(finite(bullet?.vy), finite(bullet?.vx, actor.facing < 0 ? -1 : 1));
      const aim = { x: Math.cos(angle), y: Math.sin(angle), angleRadians: angle, facing: actor.facing < 0 ? -1 : 1 };
      const muzzle = { ...bullet, x: finite(bullet?.sourceX, finite(bullet?.x)), y: finite(bullet?.sourceY, finite(bullet?.y)) };
      return { aim, muzzle };
    }

    weaponFeedV124(actor, profile) {
      let feed = this.weaponEffectFeedsV124.get(actor);
      if (!feed || feed.weaponId !== profileKey(profile)) {
        feed = { weaponId: profileKey(profile), emptyDiscarded: false, spentRounds: 0 };
        this.weaponEffectFeedsV124.set(actor, feed);
      }
      return feed;
    }

    emitCommittedWeaponShotV124(actor, bullet, descriptor = this.weaponDescriptorV124(actor), { auxiliary = false } = {}) {
      if (!actor || !bullet || !Number.isFinite(bullet.x) || !Number.isFinite(bullet.y)) return false;
      const record = this.weaponEffectsActorV124(actor);
      const shotSerial = auxiliary ? ++record.auxiliarySerial : finite(actor.shots);
      if (!auxiliary && (shotSerial < 1 || record.lastShot === shotSerial)) return false;
      if (!auxiliary) record.lastShot = shotSerial;
      const profile = getWeaponPresentationProfileV124(descriptor);
      const { aim, muzzle } = this.weaponShotGeometryV124(actor, bullet);
      // Empty chambers are not spent cases. In particular a partial cylinder
      // refill must not create cases for rounds that were never loaded/fired.
      if (profile.casing?.ejectOn === 'reload') this.weaponFeedV124(actor, profile).spentRounds++;
      emitWeaponShotEffectsV124(this.weaponEffectsV124, { actor, actorId: record.id, aim, muzzle, profile,
        shotSerial, timeSeconds: finite(this.animationTime) });
      if (profile.casing?.ejectOn === 'cycle') {
        if (this.pendingWeaponCyclesV124.length >= 64) this.pendingWeaponCyclesV124.shift();
        this.pendingWeaponCyclesV124.push({ actor, actorId: record.id, aim, muzzle, profile, shotSerial,
          x: actor.x, y: actor.y, observedAt: finite(this.animationTime),
          due: finite(this.animationTime) + Math.max(0, finite(profile.casing.delay, 0.18)) });
      }
      return true;
    }

    fire(actor = this.player) {
      const shots = finite(actor?.shots), first = list(this.bullets).length;
      const descriptor = this.weaponDescriptorV124(actor);
      const result = super.fire(actor);
      if (finite(actor?.shots) > shots) {
        const bullet = list(this.bullets).slice(first).find(entry => entry.owner === actor && !entry.placeableInstanceIdV86);
        if (bullet) this.emitCommittedWeaponShotV124(actor, bullet, descriptor);
      }
      return result;
    }

    updateSquadCombat(member) {
      const shots = finite(member?.shots), first = list(this.bullets).length;
      const result = super.updateSquadCombat(member);
      if (finite(member?.shots) > shots) {
        const bullet = list(this.bullets).slice(first).find(entry => entry.owner === member);
        if (bullet) this.emitCommittedWeaponShotV124(member, bullet, this.weaponDescriptorV124(member));
      }
      this.observeWeaponReloadV124(member);
      return result;
    }

    fireCrewWeaponV85(member) {
      const shots = finite(member?.shots), first = list(this.bullets).length;
      const result = super.fireCrewWeaponV85(member);
      if (finite(member?.shots) > shots) {
        const bullet = list(this.bullets).slice(first).find(entry => entry.owner === member);
        if (bullet) this.emitCommittedWeaponShotV124(member, bullet, this.weaponDescriptorV124(member));
      }
      this.observeWeaponReloadV124(member);
      return result;
    }

    spawnEnemyProjectile(enemy, target) {
      const first = list(this.hostileProjectiles).length;
      const result = super.spawnEnemyProjectile(enemy, target);
      const bullet = list(this.hostileProjectiles).slice(first).find(entry => !entry.acid && entry.ownerId === enemy.id);
      if (bullet) this.emitCommittedWeaponShotV124(enemy, bullet,
        enemy.weaponRuntime || enemy.weapon || enemy.weaponId || 'generic-ballistic', { auxiliary: true });
      return result;
    }

    updatePlaceableSentryV86(instance, delta) {
      const ammo = finite(instance?.ammo), first = list(this.bullets).length;
      const result = super.updatePlaceableSentryV86(instance, delta);
      if (finite(instance?.ammo) < ammo) {
        const bullet = list(this.bullets).slice(first).find(entry => entry.placeableInstanceIdV86 === instance.instanceId);
        if (bullet) this.emitCommittedWeaponShotV124(instance, bullet, 'sentry', { auxiliary: true });
      }
      return result;
    }

    observeWeaponReloadV124(actor) {
      if (!actor?.tacticalReload) return null;
      this.ensureSceneWeaponEffectsV124();
      const state = actor.tacticalReload;
      let observed = this.weaponEffectReloadsV124.get(actor);
      if (observed?.state === state) return observed;
      if (state.phase !== 'reloading') return null;
      const profile = getWeaponPresentationProfileV124(this.weaponDescriptorV124(actor));
      const feed = this.weaponFeedV124(actor, profile);
      observed = { state, profile, feed, serial: ++this.weaponEffectReloadSerialV124,
        empty: finite(actor.ammo) === 0,
        spent: feed.spentRounds,
        // A resumed reload already beyond its disposal phase must not replay it.
        discarded: finite(state.elapsed) >= state.profile.duration * RELOAD_DISCARD_PHASE, completed: false };
      this.weaponEffectReloadsV124.set(actor, observed);
      return observed;
    }

    presentWeaponReloadV124(actor) {
      const observed = this.observeWeaponReloadV124(actor);
      if (!observed) return;
      const { state, profile, feed } = observed;
      if (!observed.discarded && ['reloading', 'complete'].includes(state.phase)
        && state.elapsed >= state.profile.duration * RELOAD_DISCARD_PHASE) {
        observed.discarded = true;
        const container = ['magazine', 'cell'].includes(profile.reload.discard);
        if (profile.reload.discard !== 'none' && !(observed.empty && feed.emptyDiscarded && container)) {
          const aim = actor.combatAimV83 || { x: actor.facing < 0 ? -1 : 1, y: 0 };
          const muzzle = this.resolvePlayerMuzzleV124?.(actor, aim)
            || { x: actor.x + actor.w / 2, y: actor.y + actor.h * 0.5 };
          const record = this.weaponEffectsActorV124(actor);
          emitWeaponReloadEffectsV124(this.weaponEffectsV124, { actor, actorId: record.id, aim, muzzle, profile,
            reloadSerial: observed.serial, spentRounds: observed.spent, emptyReload: observed.empty,
            timeSeconds: finite(this.animationTime) });
          if (observed.empty && container) feed.emptyDiscarded = true;
          if (profile.reload.discard === 'shell') feed.spentRounds = Math.max(0, feed.spentRounds - observed.spent);
        }
      }
      if (state.phase === 'complete' && !observed.completed) {
        observed.completed = true;
        if (state.roundsLoaded > 0) feed.emptyDiscarded = false;
      }
    }

    reload(actor = this.player) {
      const result = super.reload(actor);
      this.observeWeaponReloadV124(actor);
      return result;
    }

    advancePlayerReloadV77(actor, delta) {
      this.observeWeaponReloadV124(actor);
      const result = super.advancePlayerReloadV77(actor, delta);
      if (this.running && !this.paused && !this.enemyAtlasLoadingPausedV65) this.presentWeaponReloadV124(actor);
      return result;
    }

    advanceSceneWeaponEffectsV124(delta) {
      if (!this.running || this.paused || this.enemyAtlasLoadingPausedV65 || this.userCasteLoadingV88) return;
      const runtime = this.ensureSceneWeaponEffectsV124();
      for (const actor of [this.player, this.coopEnabled ? this.coop : null, ...list(this.squadActors)].filter(Boolean)) this.presentWeaponReloadV124(actor);
      const now = finite(this.animationTime);
      this.pendingWeaponCyclesV124 = this.pendingWeaponCyclesV124.filter(event => {
        const actor = event.actor;
        if (actor.alive === false || actor.downed || actor.inVehicle || actor.ventTransit
          || actor === this.coop && !this.coopEnabled
          || profileKey(getWeaponPresentationProfileV124(this.weaponDescriptorV124(actor))) !== profileKey(event.profile)) return false;
        const elapsed = Math.max(0, now - event.observedAt);
        event.observedAt = now;
        // An accepted pump shot still owns one spent shell, but the operator
        // cannot cycle a holstered receiver with their hands treating a wound,
        // reacting to an impact, installing equipment or reloading. Electrical
        // stun can outlast the hurt pose. Preserve the remaining cycle time
        // until they return to the weapon; do not invent another shot or flash.
        if (this.isFieldActionBusyV124?.(actor) || this.isPlaceableBusyV86?.(actor)
          || actor.climbing || actor.reloading || actor.toolUseClock > 0 || actor.interactionClock > 0 || actor.meleeClock > 0
          || actor.v52HurtClock > 0 || actor.shockClock > 0 || actor.hazardKind === 'electrical' && actor.hazardClock > 0) {
          event.due += elapsed;
          return true;
        }
        if (event.due > now + 1e-8) return true;
        // The pump follows the current carried receiver. Walking after a shot
        // cannot eject the spent shell from the actor's previous position.
        const dx = finite(actor.x) - finite(event.x), dy = finite(actor.y) - finite(event.y);
        const aim = actor.combatAimV83 || event.aim;
        const muzzle = (actor === this.player || actor === this.coop) && this.resolvePlayerMuzzleV124
          ? this.resolvePlayerMuzzleV124(actor, aim) : { ...event.muzzle, x: event.muzzle.x + dx, y: event.muzzle.y + dy,
          pivotX: Number.isFinite(event.muzzle.pivotX) ? event.muzzle.pivotX + dx : undefined,
          pivotY: Number.isFinite(event.muzzle.pivotY) ? event.muzzle.pivotY + dy : undefined };
        emitWeaponCycleEffectsV124(runtime, { ...event, aim, muzzle, timeSeconds: now });
        return false;
      });
      updateWeaponEffectsV124(runtime, delta, { world: this.weaponEffectsWorldV124(), timeSeconds: finite(this.animationTime) });
    }

    update(delta) {
      if (!this.running || this.paused || this.enemyAtlasLoadingPausedV65 || this.userCasteLoadingV88) return;
      this.ensureSceneWeaponEffectsV124();
      for (const actor of [this.player, this.coopEnabled ? this.coop : null, ...list(this.squadActors)].filter(Boolean)) this.observeWeaponReloadV124(actor);
      const result = super.update(delta);
      this.advanceSceneWeaponEffectsV124(delta);
      return result;
    }

    drawSceneWeaponCasingsV124(ctx) {
      if (!this.weaponEffectsV124) return;
      drawWeaponCasingsV124(ctx, this.weaponEffectsV124, { camera: this.camera, viewport: VIEWPORT });
    }

    drawWorld(ctx) {
      super.drawWorld(ctx);
      this.drawSceneWeaponCasingsV124(ctx);
    }

    // The caller has applied the camera transform. This pass sits after scene
    // sprites and foreground props, before HUD text, so local screen blending
    // illuminates the actual nearby pixels without tinting the interface.
    drawSceneWeaponLightsV124(ctx) {
      if (!this.weaponEffectsV124) return;
      drawWeaponLightsV124(ctx, this.weaponEffectsV124, { world: this.weaponEffectsWorldV124(), camera: this.camera,
        viewport: VIEWPORT, reducedMotion: Boolean(this.reducedMotion || this.accessibilityRuntime?.reducedMotion) });
    }

    weaponEffectsSnapshotV124() {
      return this.weaponEffectsV124 ? getWeaponEffectsSnapshotV124(this.weaponEffectsV124) : null;
    }
  };
}
