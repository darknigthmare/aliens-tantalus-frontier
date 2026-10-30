import { firstProjectileObstacleV83 } from './projectile-collision-v83.js';
import { stampEjectedMagazinesV168, visibleDroppedMagazinesV168,
  nearestDroppedMagazineV168, recoverDroppedMagazineV168 } from './weapon-magazine-world-v168.js';

/** Production-opt-in world layer for detachable weapon magazines.
 * Magazine bytes remain owned by player/coop feed; world display never
 * adds ammo, and interacted magazines are real inventory objects.
 */
export function withMagazineRecoveryWorldV168(Base) {
  return class MagazineRecoveryWorldV168 extends Base {
    magazineWorldLevelV168() {
      const candidate = this.missionLevelRuntime?.signature || this.mission?.id || this.mission?.worldId || 'mission';
      return String(candidate).trim().replace(/\s+/g, '-').slice(0, 140) || 'mission';
    }

    magazineFeedOwnerV168(actor) {
      return actor === this.player ? 'player'
        : actor === this.coop && this.coopEnabled ? 'coop' : null;
    }

    magazineActorPlaneV168(actor) {
      const value = actor?.planeV130 || actor?.plane || 'gameplay';
      return ['gameplay', 'foreground', 'rear'].includes(value) ? value : 'gameplay';
    }

    syncMagazineDropsV168(actor) {
      const ownerId = this.magazineFeedOwnerV168(actor);
      if (!ownerId || !actor?.weaponFeedV167 || !Number.isFinite(actor.x)
        || !Number.isFinite(actor.y) || !Number.isFinite(actor.w) || !Number.isFinite(actor.h)) return 0;
      return stampEjectedMagazinesV168(actor.weaponFeedV167, {
        ownerId, levelId: this.magazineWorldLevelV168(),
        plane: this.magazineActorPlaneV168(actor),
        x: actor.x + actor.w / 2 - (actor.facing < 0 ? -7 : 7), y: actor.y + actor.h - 3
      });
    }

    advancePlayerReloadV77(actor, delta) {
      const result = super.advancePlayerReloadV77(actor, delta);
      this.syncMagazineDropsV168(actor);
      return result;
    }

    captureResumeState() {
      for (const actor of [this.player, this.coopEnabled ? this.coop : null].filter(Boolean))
        this.syncMagazineDropsV168(actor);
      return super.captureResumeState();
    }

    magazinePickupVisibleV168(actor, drop) {
      const source = { x: actor.x + actor.w / 2 - .5, y: actor.y + actor.h - 12, w: 1, h: 1 };
      const world = { walls: this.walls || [], covers: this.covers || [],
        doors: this.closedDoorColliders?.() || this.doors || [],
        platforms: [], bounds: this.missionLevelBounds };
      const segment = { x: drop.x - (source.x + .5), y: drop.y - (source.y + .5) };
      return !firstProjectileObstacleV83(source, segment, world);
    }

    nearestMagazineV168(actor = this.player) {
      const ownerId = this.magazineFeedOwnerV168(actor);
      if (!ownerId || !actor?.weaponFeedV167 || !actor.alive || actor.downed
        || actor.inVehicle || actor.ventTransit || actor.reloading
        || !Number.isFinite(actor.x) || !Number.isFinite(actor.y)) return null;
      const feetX = actor.x + actor.w / 2, feetY = actor.y + actor.h - 3;
      return nearestDroppedMagazineV168(actor.weaponFeedV167, {
        ownerId, levelId: this.magazineWorldLevelV168(), plane: this.magazineActorPlaneV168(actor),
        x: feetX, y: feetY, maxDistance: 72,
        lineOfSight: drop => this.magazinePickupVisibleV168(actor, drop)
      });
    }

    interact(actor = this.player) {
      const prior = super.interact(actor);
      if (prior || !this.canPerformGameplayAction?.(actor)) return prior;
      const nearby = this.nearestMagazineV168(actor);
      if (!nearby) return prior;
      const pickup = recoverDroppedMagazineV168(actor.weaponFeedV167, {
        magazineId: nearby.id, ownerId: nearby.ownerId,
        levelId: this.magazineWorldLevelV168(), plane: this.magazineActorPlaneV168(actor),
        x: actor.x + actor.w / 2, y: actor.y + actor.h - 3, maxDistance: 72,
        lineOfSight: drop => this.magazinePickupVisibleV168(actor, drop)
      });
      if (!pickup) return prior;
      actor.ammoReserve = pickup.reserve;
      this.setInteractionAnimation?.(actor, 'ground-interact', .35);
      this.onEvent?.({ type: 'weapon-magazine-recovered-v168', ownerId: pickup.ownerId,
        magazineId: pickup.magazineId, rounds: pickup.rounds, receipt: pickup.receipt });
      return true;
    }

    getInteractionPrompt(actor = this.player) {
      const prior = super.getInteractionPrompt(actor);
      const nearby = this.nearestMagazineV168(actor);
      if (!nearby || prior && prior !== 'S  COUVERTURE · F  TIR · R  RECHARGER') return prior;
      return 'E  RÉCUPÉRER CHARGEUR · ' + nearby.rounds + ' CARTOUCHES';
    }

    speedReloadWeaponV168(actor = this.player) {
      if (!actor?.weaponFeedV167 || !actor.alive || actor.downed || actor.reloading || actor.inVehicle
        || !this.canPerformGameplayAction?.(actor)) return false;
      const previousPolicy = actor.reloadPolicyV168;
      actor.reloadPolicyV168 = 'speed';
      try {
        const initiated = this.reload(actor);
        return Boolean(initiated && actor.tacticalReload?.weaponReloadIdV167
          && actor.weaponFeedV167?.reload?.policy === 'speed');
      } finally {
        if (previousPolicy === undefined) delete actor.reloadPolicyV168;
        else actor.reloadPolicyV168 = previousPolicy;
      }
    }

    drawWorld(ctx) {
      const result = super.drawWorld(ctx);
      if (!ctx?.save || !ctx?.fillRect || !ctx?.restore) return result;
      const levelId = this.magazineWorldLevelV168();
      for (const actor of [this.player, this.coopEnabled ? this.coop : null].filter(Boolean)) {
        const feed = actor.weaponFeedV167;
        if (!feed) continue;
        const plane = this.magazineActorPlaneV168(actor);
        for (const drop of visibleDroppedMagazinesV168(feed, levelId, plane)) {
          // Compact magazine silhouette; never mistaken for a crate or door.
          ctx.save();
          ctx.fillStyle = '#4a514b';
          ctx.fillRect(drop.x - 8, drop.y - 3, 16, 6);
          ctx.fillStyle = '#b9b5a4';
          ctx.fillRect(drop.x - 6, drop.y - 4, 10, 2);
          ctx.fillStyle = '#7d8c78';
          ctx.fillRect(drop.x + 5, drop.y - 2, 3, 5);
          ctx.restore();
        }
      }
      return result;
    }
  };
}
