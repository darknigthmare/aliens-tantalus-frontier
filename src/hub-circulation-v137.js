import { HUB_DECKS } from './hub-game.js';
import { HUB_SPATIAL_SECTION_V136 } from './hub-spatial-design-v136.js';
import { getHubRoomPresentationV119 } from './hub-room-presentation-v119.js';
import { HUB_SHIP_CONNECTIONS_V137 } from './hub-ship-layout-v137.js';
import { drawHubSteelServicesV133 } from './hub-authored-composition-v133.js';

const finite = value => typeof value === 'number' && Number.isFinite(value);
const valid = bounds => bounds && [bounds.x, bounds.y, bounds.w, bounds.h].every(finite) && bounds.w > 0 && bounds.h > 0;
const near = (a, b) => Math.abs(a - b) < .001;
const line = (ctx, points) => {
  ctx.beginPath(); points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
};
const polygon = (ctx, points) => {
  ctx.beginPath(); points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill();
};

export const HUB_CIRCULATION_STANDARD_V137 = Object.freeze({
  deckDepth: 8, railHeight: 38, minimumLadderOpening: 68,
  maximumBracketDrop: 34, maximumBracketSpacing: 190,
  dxPerY: HUB_SPATIAL_SECTION_V136.depthDxPerY,
  plane: 'rear-service', collidable: false, geometryPreserved: true
});

/** Keep a real service run attached above and beside a new rear-wall entry.
 * The old front occlusion can no longer cross its door leaf, standing player
 * or landing. Bounds come from native doorway descriptors, not screen pixels. */
export function getHubServiceConduitPlanV137(occlusion, portals = [], { floorY = 624, clearanceBounds = [] } = {}) {
  if (occlusion?.art !== 'maintenancePipe' || !valid(occlusion)) return null;
  const top = Math.max(174, occlusion.y), bottom = Math.min(floorY - 150, top + occlusion.h);
  const endX = occlusion.x + occlusion.w - 18, clearance = 12;
  const conduits = Array.from({ length: 3 }, (_, index) => {
    const x = occlusion.x + 20 + index * 12;
    const portal = portals.find(bounds => valid(bounds) && x >= bounds.x - clearance && x <= bounds.x + bounds.w + clearance
      && top < bounds.y + bounds.h + clearance && bottom - 12 > bounds.y - clearance);
    if (!portal) return { points: [[x, top], [x, bottom - 12], [endX, bottom - 12]], bypassedPortal: null };
    let protectedBounds = { ...portal };
    // A hatch immediately beside the door belongs to the same clear bay.
    // Routing around the door must not move its conduit onto that real hatch.
    for (const bounds of clearanceBounds.filter(valid)) if (bounds.x < protectedBounds.x + protectedBounds.w + clearance
      && bounds.x + bounds.w > protectedBounds.x - clearance
      && bounds.y < protectedBounds.y + protectedBounds.h + clearance && bounds.y + bounds.h > protectedBounds.y - clearance) {
      const right = Math.max(protectedBounds.x + protectedBounds.w, bounds.x + bounds.w);
      const bottom = Math.max(protectedBounds.y + protectedBounds.h, bounds.y + bounds.h);
      protectedBounds.x = Math.min(protectedBounds.x, bounds.x); protectedBounds.y = Math.min(protectedBounds.y, bounds.y);
      protectedBounds.w = right - protectedBounds.x; protectedBounds.h = bottom - protectedBounds.y;
    }
    const bypassX = protectedBounds.x + protectedBounds.w + clearance + index * 12, turnY = protectedBounds.y - clearance - index * 5;
    if (turnY <= top + 2) return null;
    return { points: [[x, top], [x, turnY], [bypassX, turnY], [bypassX, bottom - 12], [endX, bottom - 12]],
      bypassedPortal: { ...portal }, protectedBounds, clearance };
  });
  if (conduits.some(conduit => !conduit) || !conduits.some(conduit => conduit.bypassedPortal)) return null;
  return { id: occlusion.id, conduits, wallMounts: [
    { x: occlusion.x + 10, y: top + 4, w: 52, h: 6 },
    { x: endX - 10, y: bottom - 22, w: 6, h: 24 }
  ], collidable: false, geometryPreserved: true, source: 'native-doorway-clearance' };
}

export function drawHubServiceConduitsV137(ctx, occlusion, portals = [], options = {}) {
  const plan = getHubServiceConduitPlanV137(occlusion, portals, options);
  if (!ctx || !plan) return false;
  ctx.save(); ctx.strokeStyle = '#31494b'; ctx.lineWidth = 5;
  for (const conduit of plan.conduits) line(ctx, conduit.points);
  ctx.fillStyle = '#4b6463';
  for (const mount of plan.wallMounts) ctx.fillRect(mount.x, mount.y, mount.w, mount.h);
  ctx.restore(); return plan;
}

function guardSpans(left, right, openings) {
  const spans = []; let cursor = left;
  for (const opening of openings) {
    if (opening.left > cursor) spans.push({ left: cursor, right: opening.left });
    cursor = Math.max(cursor, opening.right);
  }
  if (cursor < right) spans.push({ left: cursor, right });
  return spans.filter(span => span.right - span.left >= 3);
}

/** Describe only the existing native support. Rear rails stop at real ladder
 * landings; short wall brackets explain the support without planting false
 * full-height columns in front of room furniture and people. */
export function getHubCirculationPlanV137(platform, {
  room = null, ladders = [], vents = [], platforms = [], centeredLadders = true, depthEnabled = true
} = {}) {
  if (!valid(platform) || platform.type === 'floor' || platform.role === 'floor') return null;
  const standard = HUB_CIRCULATION_STANDARD_V137;
  const x = platform.x, right = x + platform.w, y = platform.y;
  const depth = standard.deckDepth, presentation = getHubRoomPresentationV119(room, depthEnabled);
  const dx = presentation.presentationMode === '2.5d' ? -depth * standard.dxPerY : 0;
  const rawOpenings = ladders.flatMap(ladder => {
    const width = finite(ladder.w) ? ladder.w : 52;
    const center = ladder.x + (centeredLadders ? 0 : width / 2);
    if ((!near(ladder.top, y) && !near(ladder.bottom, y)) || center < x - width / 2 || center > right + width / 2) return [];
    const half = Math.max(standard.minimumLadderOpening, width + 20) / 2;
    return [{ left: Math.max(x, center - half), right: Math.min(right, center + half), ladderIds: [ladder.id], center }];
  }).filter(opening => opening.right > opening.left).sort((a, b) => a.left - b.left);
  const openings = [];
  for (const opening of rawOpenings) {
    const previous = openings.at(-1);
    if (previous && opening.left <= previous.right) {
      previous.right = Math.max(previous.right, opening.right); previous.ladderIds.push(...opening.ladderIds);
    } else openings.push({ ...opening });
  }
  const endInset = Math.min(28, platform.w / 4);
  const supportCount = Math.max(2, Math.ceil((platform.w - endInset * 2) / standard.maximumBracketSpacing) + 1);
  const supports = Array.from({ length: supportCount }, (_, index) => ({
    x: x + endInset + index * (platform.w - endInset * 2) / (supportCount - 1),
    top: y + platform.h, bottom: y + platform.h + standard.maximumBracketDrop,
    attachment: 'rear-wall-bolted-console', collidable: false
  }));
  const hatches = vents.filter(vent => valid(vent) && near(vent.y + vent.h, y)
    && vent.x < right && vent.x + vent.w > x
    && (!room?.id || !vent.roomId || vent.roomId === room.id));
  const destinations = hatches.map(vent => ({
    kind: 'native-vent', id: vent.id, label: 'GAINE DE SERVICE',
    x: Math.max(x + 66, Math.min(right - 66, vent.x + vent.w / 2)), y: y + platform.h + 13,
    sourceBounds: { x: vent.x, y: vent.y, w: vent.w, h: vent.h }
  }));
  if (room) {
    const adjacent = platforms.find(other => other.id !== platform.id && other.roomId && other.roomId !== room.id
      && near(other.x, right) && Math.abs(other.y - y) <= 18);
    if (adjacent) {
      const target = HUB_DECKS.flatMap(deck => deck.rooms).find(candidate => candidate.id === adjacent.roomId);
      destinations.push({ kind: 'native-adjacent-deck', id: adjacent.id,
        label: target?.id === 'reactor' ? 'RÉACTEUR →' : 'COURSIVE →', x: right - 78, y: y + platform.h + 13 });
    }
  }
  return {
    id: platform.id, roomId: room?.id || platform.roomId || null,
    sourceBounds: { x, y, w: platform.w, h: platform.h }, footY: y,
    topSurface: [[x, y], [right, y], [right + dx, y - depth], [x + dx, y - depth]],
    depthDx: dx, depthY: -depth, railY: y - depth, railHeight: standard.railHeight,
    railSpans: guardSpans(x + 6, right - 6, openings), openings, supports, destinations,
    roomBounds: room ? { x: room.xStart || 0, w: room.profile?.worldWidth || room.world?.width || 1280 } : null,
    presentationMode: presentation.presentationMode,
    plane: standard.plane, collidable: false, geometryPreserved: true
  };
}

export function drawHubCirculationV137(ctx, platform, options = {}) {
  const plan = getHubCirculationPlanV137(platform, options);
  if (!ctx || !plan) return null;
  const { x, y, w, h } = plan.sourceBounds;
  ctx.save();
  if (plan.roomBounds) { ctx.beginPath(); ctx.rect(plan.roomBounds.x, 0, plan.roomBounds.w, 720); ctx.clip(); }
  // Triangular wall consoles are scenery in the rear plane. Each is bolted
  // near the deck underside; none becomes a visual column down to the floor.
  for (const support of plan.supports) {
    const sx = support.x + plan.depthDx;
    ctx.fillStyle = '#1d3035';
    polygon(ctx, [[sx - 6, support.top - 2], [sx + 14, support.top - 2], [sx - 6, support.bottom]]);
    ctx.strokeStyle = '#3f595d'; ctx.lineWidth = 2;
    line(ctx, [[sx + 12, support.top], [sx - 4, support.bottom - 4], [sx - 4, support.top]]);
    ctx.fillStyle = '#30484c'; ctx.fillRect(sx - 9, support.bottom - 14, 10, 17);
    ctx.fillStyle = '#758b86'; ctx.fillRect(sx - 6, support.bottom - 11, 2, 2); ctx.fillRect(sx - 6, support.bottom - 2, 2, 2);
  }
  ctx.strokeStyle = '#3c565a'; ctx.lineWidth = 2;
  for (const span of plan.railSpans) {
    const a = span.left + plan.depthDx, b = span.right + plan.depthDx;
    line(ctx, [[a, plan.railY], [a, plan.railY - plan.railHeight], [b, plan.railY - plan.railHeight], [b, plan.railY]]);
    line(ctx, [[a, plan.railY - plan.railHeight / 2], [b, plan.railY - plan.railHeight / 2]]);
    for (let post = a + 96; post < b - 12; post += 96) line(ctx, [[post, plan.railY], [post, plan.railY - plan.railHeight]]);
  }
  ctx.fillStyle = '#354d52'; polygon(ctx, plan.topSurface);
  ctx.strokeStyle = '#5b7477'; ctx.lineWidth = 1;
  for (let seam = x + 44; seam < x + w; seam += 44) line(ctx, [[seam, y], [seam + plan.depthDx, y + plan.depthY]]);
  ctx.fillStyle = '#23373d'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#7b918f'; ctx.fillRect(x, y, w, Math.min(3, h));
  ctx.fillStyle = '#14272e'; ctx.fillRect(x, y + h - 4, w, 4);
  ctx.strokeStyle = '#40595d'; ctx.lineWidth = 1;
  for (let rib = x + 24; rib < x + w - 6; rib += 64) line(ctx, [[rib, y + 5], [rib - 13, y + h - 6], [rib + 31, y + h - 6]]);
  // Paint names a destination that actually exists. No decorative hatch,
  // suggested action key or extra navigation node is invented by this pass.
  for (const destination of plan.destinations) {
    ctx.fillStyle = '#14272d'; ctx.fillRect(destination.x - 64, destination.y - 9, 128, 14);
    ctx.fillStyle = '#b2b7a0'; ctx.font = '8px ui-monospace, monospace'; ctx.textAlign = 'center';
    ctx.fillText(destination.label, destination.x, destination.y + 1, 120);
  }
  for (const opening of plan.openings) {
    ctx.fillStyle = '#a99f6c';
    for (const edge of [opening.left, opening.right - 8]) ctx.fillRect(Math.max(x, Math.min(x + w - 8, edge)), y + 4, 8, 3);
  }
  ctx.restore(); return plan;
}

export function withHubCirculationV137(Base) {
  if (Base.hubCirculationV137) return Base;
  return class HubCirculationV137 extends Base {
    static hubCirculationV137 = true;
    drawTraversalPlatform(ctx, platform) {
      if (this.editorPlaytest) return super.drawTraversalPlatform(ctx, platform);
      const room = HUB_DECKS[this.state?.deck || 0].rooms.find(candidate => candidate.id === platform.roomId);
      return drawHubCirculationV137(ctx, platform, {
        room, ladders: this.v51Ladders || [], vents: this.v51Vents || [], platforms: this.v51Platforms || [],
        depthEnabled: this.depthPresentationV116 !== false
      });
    }
    drawAnnexSteelPlatformV133(ctx, platform, annex) {
      if (this.editorPlaytest) return super.drawAnnexSteelPlatformV133?.(ctx, platform, annex);
      return drawHubCirculationV137(ctx, platform, {
        room: { ...annex, xStart: 0 }, ladders: annex.ladders || [], centeredLadders: false,
        depthEnabled: this.depthPresentationV116 !== false
      });
    }
    drawTraversalOcclusions(ctx, phase = 'front') {
      if (this.editorPlaytest) return super.drawTraversalOcclusions(ctx, phase);
      const deckId = HUB_DECKS[this.state?.deck || 0].id;
      const portals = HUB_SHIP_CONNECTIONS_V137.filter(connection => connection.parentDeck === deckId).map(connection => connection.parentDoorBounds);
      for (const occlusion of (this.v51Occluders || []).filter(entry => entry.phase === phase)) {
        if (!drawHubServiceConduitsV137(ctx, occlusion, portals, { clearanceBounds: this.v51Vents || [] })) drawHubSteelServicesV133(ctx, occlusion);
      }
    }
  };
}
