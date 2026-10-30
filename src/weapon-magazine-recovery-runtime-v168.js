import { firstProjectileObstacleV83 } from './projectile-collision-v83.js';
import { weaponMasterySummaryV167 } from './weapon-mastery-v167.js';
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

    drawHud(ctx) {
      const result = super.drawHud(ctx);
      const actor = this.player, descriptor = actor && this.reloadWeaponV77?.(actor);
      const weaponId = descriptor && typeof descriptor === 'object' ? descriptor.id : null;
      if (!ctx?.save || !ctx?.fillRect || !ctx?.fillText || !this.running || !weaponId
        || !this.weaponMasteryV167) return result;
      const mastery = weaponMasterySummaryV167(this.weaponMasteryV167, 'player', weaponId);
      if (!mastery || mastery.xp <= 0) return result;
      // Compact in-game label rather than a developer overlay.
      const width = Math.min(228, Math.max(150, (this.canvas?.width || 1280) * .20));
      const x = (this.canvas?.width || 1280) - width - 16, y = 56, h = 31;
      const fraction = mastery.level >= 30 ? 1 : mastery.xpNextLevel > 0
        ? Math.min(1, mastery.xpInLevel / mastery.xpNextLevel) : 0;
      ctx.save();
      ctx.fillStyle = 'rgba(5, 18, 18, .82)'; ctx.fillRect(x, y, width, h);
      ctx.fillStyle = '#b4e4ca'; ctx.font = 'bold 11px monospace';
      ctx.fillText('MAÎTRISE · LV ' + mastery.level + ' / 30', x + 9, y + 14);
      ctx.fillStyle = '#263d35'; ctx.fillRect(x + 9, y + 22, width - 18, 4);
      ctx.fillStyle = '#87bd9e'; ctx.fillRect(x + 9, y + 22, (width - 18) * fraction, 4);
      ctx.restore();
      return result;
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
