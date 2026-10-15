import { HUB_DECKS } from './hub-game.js';
import { HUB_SPATIAL_SECTION_V136, getHubSpatialPlanV136 } from './hub-spatial-design-v136.js';
import { HUB_SHIP_CONNECTIONS_V137 } from './hub-ship-layout-v137.js';
import { drawHubSteelServicesV133 } from './hub-authored-composition-v133.js';
import { getHubSupportPlanesV139 } from './hub-support-planes-v139.js';
import { getHubInteractionPropBoundsV136 } from './hub-prop-placements-v136.js';

const finite = value => typeof value === 'number' && Number.isFinite(value);
const valid = bounds => bounds && [bounds.x, bounds.y, bounds.w, bounds.h].every(finite) && bounds.w > 0 && bounds.h > 0;
const near = (a, b) => Math.abs(a - b) < .001;
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const serviceConsoleFits = new Set(['briefing-low', 'lab-low']);
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
    const points = turnY <= top + 2
      // A destination plaque may use the narrow band above its doorway.
      // Take the whole drop from a clear ceiling socket instead of bending
      // a foreground pipe across that plaque to retain its old upper anchor.
      ? [[bypassX, top], [bypassX, bottom - 12], [endX, bottom - 12]]
      : [[x, top], [x, turnY], [bypassX, turnY], [bypassX, bottom - 12], [endX, bottom - 12]];
    return { points,
      bypassedPortal: { ...portal }, protectedBounds, clearance };
  });
  if (conduits.some(conduit => !conduit) || !conduits.some(conduit => conduit.bypassedPortal)) return null;
  const startXs = conduits.map(conduit => conduit.points[0][0]);
  return { id: occlusion.id, conduits, wallMounts: [
    { x: Math.min(...startXs) - 10, y: top + 4, w: Math.max(...startXs) - Math.min(...startXs) + 20, h: 6 },
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
  const supportPlanes = getHubSupportPlanesV139(room, { depthEnabled });
  const depth = Math.min(supportPlanes.deckDepth, Math.max(0, platform.h - 3));
  const dx = depth * supportPlanes.projectionDxPerY;
  const rawOpenings = ladders.flatMap(ladder => {
    const width = finite(ladder.w) ? ladder.w : 52;
    const center = ladder.x + (centeredLadders ? 0 : width / 2);
    if ((!near(ladder.top, y) && !near(ladder.bottom, y)) || center < x - width / 2 || center > right + width / 2) return [];
    // The front rim shifts with the depth extrusion. Its opening still has
    // to leave the native44px adult clear, including that horizontal return.
    const half = Math.max(standard.minimumLadderOpening, width + 20, 44 + Math.abs(dx) * 2 + 12) / 2;
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
  const authoredSupportXs = platform.id === 'lab-low' ? [x + 89, x + 165] : null;
  const supportXs = (authoredSupportXs || Array.from({ length: supportCount }, (_, index) => {
    let candidate = x + endInset + index * (platform.w - endInset * 2) / (supportCount - 1);
    for (const opening of openings) if (candidate - 9 < opening.right && candidate + 14 > opening.left) {
      const choices = [opening.left - 18, opening.right + 13]
        .filter(value => value >= x + 12 && value <= right - 18);
      candidate = choices.sort((a, b) => Math.abs(a - candidate) - Math.abs(b - candidate))[0] ?? candidate;
    }
    return candidate;
  })).filter((value, index, values) => values.findIndex(other => Math.abs(other - value) < .001) === index)
    .sort((a, b) => a - b);
  const serviceBounds = serviceConsoleFits.has(platform.id) ? getHubInteractionPropBoundsV136(room) : null;
  const supports = supportXs.map(supportX => ({
    x: supportX,
    top: y + platform.h, bottom: y + platform.h + standard.maximumBracketDrop,
    attachment: 'rear-wall-bolted-console', collidable: false
  })).map(support => {
    const silhouette = candidate => ({ x: candidate.x - 9, y: candidate.top - 2,
      w: 23, h: candidate.bottom - candidate.top + 5 });
    if (!valid(serviceBounds) || !overlap(silhouette(support), serviceBounds)) return support;
    const margin = 8, minimumDrop = 16;
    const drop = serviceBounds.y - margin - 3 - support.top;
    if (drop >= minimumDrop) return { ...support, bottom: Math.min(support.bottom, support.top + drop),
      serviceFit: 'short-console-above-native-worktop' };
    // The new briefing table leaves0.76px above its opaque top. A compact
    // 16px strut fits that measured slot; it does not claim the usual8px air.
    const compactClearance = serviceBounds.y - support.top - minimumDrop - 3;
    if (platform.id === 'briefing-low' && compactClearance >= .5)
      return { ...support, bottom: support.top + minimumDrop, serviceClearance: compactClearance,
        serviceFit: 'compact-console-above-native-worktop' };
    const candidates = [serviceBounds.x - margin - 14, serviceBounds.x + serviceBounds.w + margin + 9]
      .filter(candidate => candidate >= x + 12 && candidate <= right - 18
        && openings.every(opening => candidate + 14 <= opening.left || candidate - 9 >= opening.right)
        && !overlap(silhouette({ ...support, x: candidate }), serviceBounds))
      .sort((a, b) => Math.abs(a - support.x) - Math.abs(b - support.x));
    return candidates.length ? { ...support, x: candidates[0], serviceFit: 'wall-console-beside-native-workbay' } : support;
  }).sort((a, b) => a.x - b.x);
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
  const frontSpans = guardSpans(x, right, openings);
  return {
    id: platform.id, roomId: room?.id || platform.roomId || null,
    sourceBounds: { x, y, w: platform.w, h: platform.h }, footY: y,
    topSurface: [[x, y], [right, y], [right + dx, y + depth], [x + dx, y + depth]],
    topSurfaces: frontSpans.map(span => [[span.left, y], [span.right, y],
      [span.right + dx, y + depth], [span.left + dx, y + depth]]),
    frontFaces: frontSpans.map(span => ({ x: span.left + dx, y: y + depth,
      w: span.right - span.left, h: platform.h - depth })),
    supportLine: { from: [x, y], to: [right, y], edge: 'native-rear-edge' },
    depthDx: dx, depthY: depth, railY: y, railHeight: standard.railHeight,
    railSpans: guardSpans(x + 6, right - 6, openings), openings, supports, destinations,
    roomBounds: room ? { x: room.xStart || 0, w: room.profile?.worldWidth || room.world?.width || 1280 } : null,
    presentationMode: supportPlanes.presentationMode,
    plane: standard.plane, collidable: false, geometryPreserved: true
  };
}

/** Furnishings reserve the solid steel actually drawn by this renderer, not
 * the open air inside its rear railing. These rectangles include the top
 * depth face and bolted consoles, clipped to the same room cutaway. */
export function getHubCirculationSolidReservationsV138(platform, options = {}) {
  const plan = getHubCirculationPlanV137(platform, options);
  if (!plan) return [];
  const reservation = (bounds, role, polygon = null) => {
    const room = plan.roomBounds;
    const left = room ? Math.max(bounds.x, room.x) : bounds.x;
    const right = room ? Math.min(bounds.x + bounds.w, room.x + room.w) : bounds.x + bounds.w;
    return { ...bounds, x: left, w: Math.max(0, right - left), role, sourceId: plan.id,
      ...(polygon ? { polygon: polygon.map(point => [...point]) } : {}), plane: plan.plane,
      collidable: false, interactive: false, source: 'native-circulation-renderer' };
  };
  return [reservation({ x: plan.sourceBounds.x, y: plan.footY, w: plan.sourceBounds.w, h: 1 }, 'native-deck-support-edge'),
    ...plan.frontFaces.map(face => reservation(face, 'native-deck-face')),
    ...plan.topSurfaces.map(points => {
      const minX = Math.min(...points.map(point => point[0])), maxX = Math.max(...points.map(point => point[0]));
      const minY = Math.min(...points.map(point => point[1])), maxY = Math.max(...points.map(point => point[1]));
      return reservation({ x: minX, y: minY, w: maxX - minX, h: maxY - minY }, 'native-deck-top', points);
    }),
    ...plan.supports.map(support => {
      const x = support.x;
      // Triangle reaches x+14; the bolted wall plate reaches x-9 and
      // three pixels below the diagonal's endpoint, exactly as drawn below.
      return reservation({ x: x - 9, y: support.top - 2, w: 23, h: support.bottom - support.top + 5 }, 'native-deck-console',
        [[x - 6, support.top - 2], [x + 14, support.top - 2], [x - 6, support.bottom]]);
    })
  ].filter(bounds => bounds.w > 0 && bounds.h > 0);
}

export function drawHubCirculationV137(ctx, platform, options = {}) {
  const plan = getHubCirculationPlanV137(platform, options);
  if (!ctx || !plan) return null;
  const { x, y, w, h } = plan.sourceBounds;
  const phase = options.phase || 'all', drawRear = phase !== 'front', drawFront = phase !== 'back';
  ctx.save();
  if (plan.roomBounds) { ctx.beginPath(); ctx.rect(plan.roomBounds.x, 0, plan.roomBounds.w, 720); ctx.clip(); }
  // Triangular wall consoles are scenery in the rear plane. Each is bolted
  // near the deck underside; none becomes a visual column down to the floor.
  if (drawRear) for (const support of plan.supports) {
    const sx = support.x;
    ctx.fillStyle = '#1d3035';
    polygon(ctx, [[sx - 6, support.top - 2], [sx + 14, support.top - 2], [sx - 6, support.bottom]]);
    ctx.strokeStyle = '#3f595d'; ctx.lineWidth = 2;
    line(ctx, [[sx + 12, support.top], [sx - 4, support.bottom - 4], [sx - 4, support.top]]);
    ctx.fillStyle = '#30484c'; ctx.fillRect(sx - 9, support.bottom - 14, 10, 17);
    ctx.fillStyle = '#758b86'; ctx.fillRect(sx - 6, support.bottom - 11, 2, 2); ctx.fillRect(sx - 6, support.bottom - 2, 2, 2);
  }
  ctx.strokeStyle = '#3c565a'; ctx.lineWidth = 2;
  if (drawRear) for (const span of plan.railSpans) {
    const a = span.left, b = span.right;
    line(ctx, [[a, plan.railY], [a, plan.railY - plan.railHeight], [b, plan.railY - plan.railHeight], [b, plan.railY]]);
    line(ctx, [[a, plan.railY - plan.railHeight / 2], [b, plan.railY - plan.railHeight / 2]]);
    for (let post = a + 96; post < b - 12; post += 96) line(ctx, [[post, plan.railY], [post, plan.railY - plan.railHeight]]);
  }
  if (drawRear && plan.depthY) {
    ctx.fillStyle = '#354d52'; for (const surface of plan.topSurfaces) polygon(ctx, surface);
    ctx.strokeStyle = '#5b7477'; ctx.lineWidth = 1;
    for (let seam = x + 44; seam < x + w; seam += 44) if (!plan.openings.some(opening => seam > opening.left && seam < opening.right))
      line(ctx, [[seam, y], [seam + plan.depthDx, y + plan.depthY]]);
  }
  // The rear cleat is continuous like the native support. It explains a
  // grounded foot while the front lip stays open for the climbing body.
  if (drawRear) { ctx.fillStyle = '#536d70'; ctx.fillRect(x, y, w, 1); }
  if (drawFront) for (const face of plan.frontFaces) {
    ctx.fillStyle = '#23373d'; ctx.fillRect(face.x, face.y, face.w, face.h);
    ctx.fillStyle = '#7b918f'; ctx.fillRect(face.x, face.y, face.w, Math.min(2, face.h));
    ctx.fillStyle = '#14272e'; ctx.fillRect(face.x, face.y + face.h - Math.min(4, face.h), face.w, Math.min(4, face.h));
    ctx.strokeStyle = '#40595d'; ctx.lineWidth = 1;
    for (let rib = face.x + 24; rib < face.x + face.w - 6; rib += 64)
      line(ctx, [[rib, face.y + 4], [rib - 13, face.y + face.h - 4], [Math.min(face.x + face.w - 2, rib + 31), face.y + face.h - 4]]);
  }
  // Paint names a destination that actually exists. No decorative hatch,
  // suggested action key or extra navigation node is invented by this pass.
  if (drawRear) for (const destination of plan.destinations) {
    ctx.fillStyle = '#14272d'; ctx.fillRect(destination.x - 64, destination.y - 9, 128, 14);
    ctx.fillStyle = '#b2b7a0'; ctx.font = '8px ui-monospace, monospace'; ctx.textAlign = 'center';
    ctx.fillText(destination.label, destination.x, destination.y + 1, 120);
  }
  if (drawFront) for (const opening of plan.openings) {
    ctx.fillStyle = '#a99f6c';
    for (const edge of [opening.left - 8, opening.right]) ctx.fillRect(Math.max(x, Math.min(x + w - 8, edge)) + plan.depthDx, y + plan.depthY + 4, 8, 3);
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
        depthEnabled: this.depthPresentationV116 !== false, phase: 'back'
      });
    }
    drawAnnexSteelPlatformV133(ctx, platform, annex) {
      if (this.editorPlaytest) return super.drawAnnexSteelPlatformV133?.(ctx, platform, annex);
      return drawHubCirculationV137(ctx, platform, {
        room: { ...annex, xStart: 0 }, ladders: annex.ladders || [], centeredLadders: false,
        depthEnabled: this.depthPresentationV116 !== false, phase: 'back'
      });
    }
    drawHubCirculationFrontV139(ctx) {
      if (this.editorPlaytest || this.hubTrainingV132?.active) return false;
      const annex = this.currentAnnexV71?.();
      const platforms = annex ? annex.platforms : this.v51Platforms || [];
      for (const platform of platforms.filter(entry => entry.type !== 'floor' && entry.role !== 'floor')) {
        const room = annex ? { ...annex, xStart: 0 }
          : HUB_DECKS[this.state?.deck || 0].rooms.find(candidate => candidate.id === platform.roomId);
        drawHubCirculationV137(ctx, platform, {
          room, ladders: annex ? annex.ladders || [] : this.v51Ladders || [],
          centeredLadders: !annex, depthEnabled: this.depthPresentationV116 !== false, phase: 'front'
        });
      }
      return true;
    }
    drawPlayer(ctx) {
      const result = super.drawPlayer(ctx);
      this.drawHubCirculationFrontV139(ctx);
      return result;
    }
    drawTraversalOcclusions(ctx, phase = 'front') {
      if (this.editorPlaytest) return super.drawTraversalOcclusions(ctx, phase);
      const deckId = HUB_DECKS[this.state?.deck || 0].id;
      const portals = HUB_SHIP_CONNECTIONS_V137.filter(connection => connection.parentDeck === deckId).map(connection => connection.parentDoorBounds);
      for (const occlusion of (this.v51Occluders || []).filter(entry => entry.phase === phase)) {
        const room = HUB_DECKS[this.state?.deck || 0].rooms.find(room => occlusion.x >= room.xStart && occlusion.x < room.xEnd);
        const signs = occlusion.art === 'maintenancePipe' && room ? getHubSpatialPlanV136(room, {
          doors: this.doorStates || [], ladders: this.v51Ladders || [], platforms: this.v51Platforms || []
        }).reservations.filter(reservation => reservation.role === 'destination-sign') : [];
        if (!drawHubServiceConduitsV137(ctx, occlusion, portals, { clearanceBounds: [...this.v51Vents || [], ...signs] })) drawHubSteelServicesV133(ctx, occlusion);
      }
    }
  };
}
