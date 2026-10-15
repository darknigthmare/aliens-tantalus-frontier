import { HUB_DECKS } from './hub-game.js';
import { getHubRecessedPortalV136 } from './hub-spatial-design-v136.js';
import { getHubDestinationSignPlansV138 } from './hub-destination-signage-v138.js';

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
      const plans = getHubDestinationSignPlansV138(room, { portalTargetForBounds: b => getHubRecessedPortalV136(b)?.target });
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
