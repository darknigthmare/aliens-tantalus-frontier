import { HUB_DECKS } from './hub-game.js';
import { getHubRecessedPortalV136 } from './hub-spatial-design-v136.js';
import { getHubDestinationSignPlansV138, getHubDoorDestinationDescriptorsV138 } from './hub-destination-signage-v138.js';
import { HUB_ANNEX_BY_ID_V137 } from './hub-annex-registry-v137.js';

export function drawHubDestinationSignV138(ctx, sign) {
  if (!ctx || !sign?.bounds) return false;
  const b = sign.bounds;
  ctx.save(); ctx.fillStyle = '#0d2026'; ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.strokeStyle = '#607a78'; ctx.lineWidth = 1; ctx.strokeRect(b.x + .5, b.y + .5, b.w - 1, b.h - 1);
  ctx.fillStyle = sign.color; ctx.fillRect(b.x + 2, b.y + 2, 3, b.h - 4);
  ctx.fillStyle = '#bdcec1'; ctx.font = `700 ${sign.fontSize}px ui-monospace, monospace`; ctx.textAlign = 'center';
  ctx.fillText(sign.label, b.x + b.w / 2 + 1, b.y + sign.textBaseline);
  ctx.fillStyle = '#8c9f96'; ctx.fillRect(b.x + b.w - 4, b.y + 3, 1, 1); ctx.fillRect(b.x + b.w - 4, b.y + b.h - 4, 1, 1);
  ctx.restore(); return true;
}

/** Follow the actual paired renderer. Authored service frames may need a
 * uniform fit for a broad native work pose; a plaque tied to the historical
 * 156px estimate would overlap that frame. Unowned/editor targets retain the
 * existing layout fallback, and pure composition planning remains immutable. */
export function getHubLiveDestinationSignPlansV161(hub, room) {
  const descriptors = getHubDoorDestinationDescriptorsV138(room);
  return getHubDestinationSignPlansV138(room, { portalTargetForBounds: bounds => {
    const descriptor = descriptors.find(door => ['x', 'y', 'w', 'h'].every(key => door.socket[key] === bounds[key]));
    const annexId = descriptor?.face === 'parent' ? descriptor.destinationId : room?.id;
    const annex = HUB_ANNEX_BY_ID_V137[annexId];
    const pair = annex && hub.hubDoorPairV142?.(annex, descriptor?.endpointId);
    return (descriptor?.face === 'parent' ? pair?.parent : pair?.local)?.target
      || getHubRecessedPortalV136(bounds)?.target;
  } });
}

/** One marker exists only after a real plaque was drawn in this frame. Native
 * maintenance signs and editor renderers keep their existing ownership. */
export function withHubDestinationSignsV138(Base) {
  if (Base.hubDestinationSignsV138) return Base;
  return class HubDestinationSignsV138 extends Base {
    static hubDestinationSignsV138 = true;
    draw() { this.hubDestinationSignsDrawnV138 = new Map(); return super.draw(); }
    hasRenderedHubDestinationSignV138(endpointId) {
      return Boolean(!this.editorPlaytest && endpointId && [...(this.hubDestinationSignsDrawnV138?.values() || [])]
        .some(sign => sign.face === 'return' && sign.endpointId === endpointId));
    }
    drawHubDestinationSignsV138(ctx, room) {
      if (this.editorPlaytest || !room) return [];
      const plans = getHubLiveDestinationSignPlansV161(this, room);
      this.hubDestinationSignsDrawnV138 ||= new Map();
      for (const sign of plans) if (drawHubDestinationSignV138(ctx, sign)) this.hubDestinationSignsDrawnV138.set(sign.id, structuredClone(sign));
      return plans;
    }
    drawTraversal(ctx) {
      const result = super.drawTraversal(ctx);
      if (!this.startingV71 && !this.isAnnexActiveV71?.()) {
        const room = this.currentRoom?.() || HUB_DECKS[this.state?.deck || 0]?.rooms[0];
        this.drawHubDestinationSignsV138(ctx, room);
      }
      return result;
    }
    drawAnnexGeometryV71(ctx, annex) {
      const result = super.drawAnnexGeometryV71(ctx, annex); this.drawHubDestinationSignsV138(ctx, { ...annex, xStart: 0 }); return result;
    }
    getSnapshot() {
      return { ...super.getSnapshot(), hubDestinationSignsV138: { active: !this.editorPlaytest,
        rendered: this.editorPlaytest ? [] : structuredClone([...(this.hubDestinationSignsDrawnV138?.values() || [])]),
        collidable: false, interactive: false, sourceStatus: 'actual-native-door-destination' } };
    }
  };
}
