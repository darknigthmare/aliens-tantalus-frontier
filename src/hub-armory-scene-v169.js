import {
  ARMORY_STOREFRONT_SOURCE_V169, getArmoryStorefrontPlanV169,
  drawArmoryStorefrontV169, getArmoryStoreContactV169, isArmoryArtAdmittedV171,
  isArmoryStorefrontImageReadyV172
} from './hub-armory-storefront-v169.js';

/** Opt-in visual composition atop original hub physics/rooms. The Tantalus
 * armory keeps the existing S. Doyle native identity and procurement contract.
 * Missing visual assets cause zero draw calls, never a broken collision or HUD.
 */
export function withHubArmoryStorefrontV169(Base) {
  return class ArmoryStorefrontHubV169 extends Base {
    start(...args) {
      const result = super.start(...args);
      this.armoryStorefrontImagesV169 ||= new Map();
      this.prepareArmoryStorefrontV169();
      return result;
    }

    prepareArmoryStorefrontV169() {
      if (typeof Image !== 'function' || !this.armoryStorefrontImagesV169) return;
      for (const [variant, url] of Object.entries(ARMORY_STOREFRONT_SOURCE_V169)) {
        if (!isArmoryArtAdmittedV171(variant) || this.armoryStorefrontImagesV169.has(variant)) continue;
        const image = new Image();
        image.decoding = 'async';
        image.src = url;
        this.armoryStorefrontImagesV169.set(variant, image);
      }
    }

    drawArmoryStorefrontVariantV169(ctx, roomId, originX = 0) {
      const plan = getArmoryStorefrontPlanV169(roomId);
      if (!plan) return { drawn: 0, reason: 'no-variant' };
      if (!isArmoryArtAdmittedV171(plan.variant)) return { drawn: 0, reason: 'art-not-released' };
      const image = this.armoryStorefrontImagesV169?.get(plan.variant);
      const back = drawArmoryStorefrontV169(ctx, image, plan, { originX, phase: 'back' });
      const front = drawArmoryStorefrontV169(ctx, image, plan, { originX, phase: 'front' });
      return { drawn: back.drawn + front.drawn,
        reason: back.reason || front.reason || null, variant: plan.variant };
    }

    drawRoomModule(ctx, room, farImage) {
      const result = super.drawRoomModule(ctx, room, farImage);
      // Keep the existing original industrial architecture, real S. Doyle,
      // armory interactions, floor and doors; only enrich its interior wall.
      if (room?.id === 'armory') {
        this.armoryStorefrontPaintV169 = this.drawArmoryStorefrontVariantV169(ctx, room.id, room.xStart);
      }
      return result;
    }

    drawAnnexNpcsV141(ctx) {
      // The logistics annex is a second shop context, *not* the separate civil
      // records room, and retains its own service NPCs, doors and station.
      if (this.currentAnnexV71?.()?.id === 'logistics') {
        this.armoryStorefrontPaintV169 = this.drawArmoryStorefrontVariantV169(ctx, 'logistics');
      }
      return super.drawAnnexNpcsV141?.(ctx);
    }

    armoryShopContactV169() {
      const annex = this.currentAnnexV71?.();
      if (!isArmoryArtAdmittedV171('station')
        || !isArmoryStorefrontImageReadyV172(this.armoryStorefrontImagesV169?.get('station'))
        || !this.running || this.paused
        || this.annexTransitionV71 || this.hubDoorClosingV142
        || this.annexStateReadOnlyV87 || this.editorPlaytest || !annex || annex.id !== 'logistics'
        || !this.player || this.player.inVehicle || !this.player.grounded) return null;
      // Native annex exits, existing NPCs and station actions have precedence.
      if (this.nearestAnnexExitV71?.() || this.nearestAnnexNpcV141?.()
        || this.nearestAnnexStationV71?.() || this.prioritizedParentAnnexDoorV133?.()) return null;
      const player = this.player;
      return getArmoryStoreContactV169({
        roomId: annex.id, x: player.x + player.w / 2, y: player.y + player.h,
        alive: player.alive !== false && !player.downed,
        gameplayBlocked: Boolean(this.refugeMovementLockedV87)
      });
    }

    statusPrompt() {
      const contact = this.armoryShopContactV169();
      return contact?.prompt || super.statusPrompt();
    }

    interact(...args) {
      const contact = this.armoryShopContactV169();
      if (contact) {
        this.onAction?.(contact);
        return true;
      }
      return super.interact(...args);
    }

    getSnapshot() {
      const value = super.getSnapshot();
      return { ...value, armoryStorefrontV169: {
        schema: 169, roomId: this.currentRoom?.()?.id || null,
        variant: getArmoryStorefrontPlanV169(this.currentRoom?.()?.id)?.variant || null,
        lastPaint: this.armoryStorefrontPaintV169 || null,
        shopContact: this.armoryShopContactV169()?.contactId || null,
        physics: 'native-unchanged',
        graphicsStatus: isArmoryStorefrontImageReadyV172(this.armoryStorefrontImagesV169?.get('station'))
          ? 'adapted-art-renderable-not-canon-1to1' : 'art-loading-or-unavailable'
      } };
    }
  };
}
