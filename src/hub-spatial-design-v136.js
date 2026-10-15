import { HUB_DECKS } from './hub-game.js';
import { HUB_ANNEXES_V137 } from './hub-annex-registry-v137.js';
import { HUB_SHIP_SPACE_BY_ID_V137, getHubShipConnectionsForRoomV137, getHubShipConnectionsForSpaceV137 } from './hub-ship-layout-v137.js';
import { HUB_ANNEX_ENTRANCES_V133 } from './hub-navigation-layout-v133.js';
import { getHubRoomPresentationV119 } from './hub-room-presentation-v119.js';
import { resolveSpriteDrawableV134 } from './sprite-alpha-policy-v134.js';
import { getHubInteractionPropBoundsV136, getHubVehiclePlacementV136 } from './hub-prop-placements-v136.js';
import { resolveHubVehicleArtV58 } from './hub-art-runtime-v58.js';
import { DROPSHIP_HANGAR_ART_V55 } from './hub-art-runtime-v55.js';
import { getHubAnnexFixturePlanV138 } from './hub-annex-fixtures-v138.js';
import { getHubDestinationSignReservationsV138 } from './hub-destination-signage-v138.js';
import { getHubRoomPlaqueBoundsV134 } from './hub-room-dressing-v134.js';
import { getHubSupportPlanesV139, getHubLadderMountV139 } from './hub-support-planes-v139.js';
import { getHubAnnexRuntimeGeometryV139 } from './hub-annex-runtime-geometry-v139.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const expanded = (b, margin) => ({ x: b.x - margin, y: b.y - margin, w: b.w + margin * 2, h: b.h + margin * 2 });
const validBounds = b => b && [b.x, b.y, b.w, b.h].every(Number.isFinite) && b.w > 0 && b.h > 0;
const ready = image => image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
const line = (ctx, points) => { ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };

/** One architectural section for the existing ship. These values describe
 * scenery, never another navigation graph. The depth vector is the same one
 * used by the transverse bulkheads: (-38,-24) to (+19,+12). */
export const HUB_SPATIAL_SECTION_V136 = Object.freeze({
  actorHeight: 96.5, actorWidth: 44, walkY: 624, rearServiceY: 600,
  rearWallBaseY: 566, ceilingY: 186, depthDxPerY: 19 / 12,
  entryClearance: 128, gameplayPlane: '2d', collisionPolicy: 'native-geometry'
});

export function getHubSpatialPlanV136(room, { doors = [], ladders = [], vents = [], platforms = [], propBounds = null, depthEnabled = true } = {}) {
  room = getHubAnnexRuntimeGeometryV139(room);
  if (!room?.id) return null;
  const x = finite(room.xStart), width = finite(room.profile?.worldWidth ?? room.world?.width, 1280);
  const support = getHubSupportPlanesV139(room, { depthEnabled });
  const floorY = support.walkY, delta = floorY - 624;
  if (!(width > 0)) return null;
  const ceilingY = room.id === 'personal-refuge' ? 334 : 186;
  const planes = { walkY: floorY, rearServiceY: support.rearServiceY, rearWallBaseY: 566 + delta, ceilingY };
  const reserve = (bounds, role, margin = 14) => validBounds(bounds) && reservations.push({ ...expanded(bounds, margin), role });
  const reservations = [
    { x, y: ceilingY, w: 128, h: floorY - ceilingY, role: 'west-transition' },
    { x: x + width - 128, y: ceilingY, w: 128, h: floorY - ceilingY, role: 'east-transition' },
    { ...expanded(getHubRoomPlaqueBoundsV134(room), 4), role: 'room-sign' }
  ];
  reserve(propBounds || getHubInteractionPropBoundsV136(room), 'native-service', 22);
  reserve(room.viewport, 'viewport', 8);
  // These silhouettes are native functional actors, drawn before the passive
  // dressing pass. Reserve their real current render bounds so a loose case
  // or a wall kit cannot be painted over the parked hull, control booth or
  // live maintenance arc. Their physical support geometry stays with its owner.
  const vehicle = resolveHubVehicleArtV58(room.id)?.vehicle;
  if (vehicle) reserve(getHubVehiclePlacementV136(room, vehicle)?.renderBounds, 'parked-vehicle', 12);
  if (room.id === DROPSHIP_HANGAR_ART_V55.roomId) {
    reserve(getHubVehiclePlacementV136(room, DROPSHIP_HANGAR_ART_V55.dropship)?.renderBounds, 'parked-vehicle', 12);
    for (const [actor, role] of [[DROPSHIP_HANGAR_ART_V55.controlBooth, 'hangar-control-booth'],
      [DROPSHIP_HANGAR_ART_V55.electricalHazard, 'electrical-alcove']]) {
      reserve({ ...actor.renderBounds, x: x + actor.renderBounds.x }, role, 12);
    }
  }
  // Reserve exactly what the native renderer paints, including the overhead
  // shaft that is deliberately larger than its lower collision fitting.
  for (const fixture of getHubAnnexFixturePlanV138(room)?.reservations || []) reserve(fixture, fixture.role, 8);
  for (const door of doors) if (door.x >= x - 100 && door.x <= x + width + 100) reserve({
    x: door.x - (door.lift ? 92 : 80), y: floorY - (door.lift ? 198 : 270),
    w: door.lift ? 184 : 160, h: door.lift ? 214 : 286
  }, door.lift ? 'lift-entrance' : 'transverse-bulkhead', 8);
  for (const annex of HUB_ANNEXES_V137.filter(a => a.parentRoomId === room.id && !HUB_SHIP_SPACE_BY_ID_V137[a.id])) {
    const entry = HUB_ANNEX_ENTRANCES_V133[annex.id];
    const bounds = annex.parentDoorBounds || entry && { x: x + entry.centerX - annex.entrance.w / 2,
      y: entry.bottom - annex.entrance.h, w: annex.entrance.w, h: annex.entrance.h };
    reserve(bounds, 'annex-entrance', 22);
  }
  for (const connection of getHubShipConnectionsForRoomV137(room.id)) reserve(connection.parentDoorBounds, 'ship-service-entrance', 22);
  for (const connection of getHubShipConnectionsForSpaceV137(room.id)) reserve(connection.annexDoorBounds, 'ship-service-return', 22);
  if (room.entrance) reserve({ ...room.entrance, x: x + room.entranceLocalX - room.entrance.w / 2 }, 'return-entrance', 22);
  for (const sign of getHubDestinationSignReservationsV138(room, {
    portalTargetForBounds: bounds => getHubRecessedPortalV136(bounds)?.target
  })) reserve(sign, 'destination-sign', 0);
  for (const ladder of ladders) {
    const mount = getHubLadderMountV139(ladder, { centered: !(ladder.centered === false || room.world) });
    if (!mount || mount.visualBounds.x + mount.visualBounds.w < x || mount.visualBounds.x > x + width) continue;
    reserve(mount.visualBounds, 'ladder-clearance', 20);
  }
  // Native hatches render after the wall furnishings. Keep their complete
  // graphic rectangle and the existing 64px crawl approach free of wall stock.
  // These are scenery exclusions; the vent collider and interaction stay native.
  for (const vent of vents) {
    if (!validBounds(vent) || vent.roomId && vent.roomId !== room.id
      || vent.x + vent.w < x || vent.x > x + width) continue;
    reserve(vent, 'native-vent', 8);
    reserve({ x: vent.x - 64, y: vent.y, w: vent.w + 128, h: vent.h }, 'vent-approach', 0);
  }
  for (const platform of platforms) if (platform.type !== 'floor' && platform.role !== 'floor') reserve(platform, 'maintenance-deck', 8);
  const presentation = getHubRoomPresentationV119(room, depthEnabled);
  return { id: room.id, bounds: { x, y: ceilingY, w: width, h: floorY - ceilingY }, planes,
    presentationMode: presentation.presentationMode, projection: {
      kind: support.projectionDxPerY ? 'parallel-oblique' : 'orthographic', dxPerY: support.projectionDxPerY },
    floorMode: presentation.presentationMode === '2.5d' ? 'parallel-oblique' : 'orthographic',
    reservations, serviceAnchors: Array.from({ length: Math.max(0, Math.floor((width - 256) / 192)) }, (_, index) => ({
      x: x + 176 + index * 192, y: planes.rearServiceY, plane: 'rear-service', collidable: false
    })), gameplayPlane: '2d', collidable: false, geometryPreserved: true };
}

export function hubSpatialPlacementClearV136(bounds, plan, { margin = 0 } = {}) {
  if (!validBounds(bounds) || !plan?.bounds || !Array.isArray(plan.reservations)) return false;
  const b = expanded(bounds, Math.max(0, finite(margin))), p = plan.bounds;
  // A clearance envelope is space around a fitting, not an extra foot below
  // its floor. Keep real feet on the support; retain the full margin against
  // doors, access corridors and neighbouring reserved equipment.
  return bounds.x >= p.x && bounds.x + bounds.w <= p.x + p.w && bounds.y >= p.y && bounds.y + bounds.h <= plan.planes.walkY
    && !plan.reservations.some(reservation => overlap(b, reservation));
}

/** Floor panels project in the same direction as the sectioned door. A
 * camera-dependent vanishing point would rotate their seams while the fixed
 * doors and furniture retained their orientation. Compact rooms stay frontal. */
export function getHubSpatialFloorV136(room, { height = 720, enabled = true } = {}) {
  const plan = getHubSpatialPlanV136(room);
  if (!plan) return null;
  const { x, w } = plan.bounds, y = plan.planes.walkY, bottom = Math.max(y, finite(height, 720));
  // F7 controls background motion, never a partial projection conversion of
  // a room whose props, actors, portals and physical supports stay authored.
  const factor = plan.floorMode === 'parallel-oblique' ? plan.projection.dxPerY : 0;
  const shift = (bottom - y) * factor;
  return { roomId: plan.id, bounds: { x, y: y + 4, w, h: Math.max(0, bottom - y - 4) },
    mode: factor ? 'parallel-oblique' : 'orthographic', dxPerY: factor, walkY: y, bottom,
    seams: Array.from({ length: Math.ceil((w + shift) / 160) + 2 }, (_, index) => {
      const start = x - 160 + index * 160; return { from: [start + 4 * factor, y + 4], to: [start + (bottom - y) * factor, bottom] };
    }), collidable: false };
}

export function drawHubSpatialFloorV136(ctx, room, options = {}) {
  const model = getHubSpatialFloorV136(room, options);
  if (!ctx || !model || !model.bounds.h) return null;
  const b = model.bounds;
  ctx.save(); ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip();
  const shade = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
  shade.addColorStop(0, '#182628'); shade.addColorStop(1, '#0a1316');
  ctx.fillStyle = shade; ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.strokeStyle = 'rgba(94,123,121,.28)'; ctx.lineWidth = 1;
  for (const seam of model.seams) line(ctx, [seam.from, seam.to]);
  for (const fraction of [.32, .74]) line(ctx, [[b.x, b.y + b.h * fraction], [b.x + b.w, b.y + b.h * fraction]]);
  ctx.fillStyle = '#293d3e'; ctx.fillRect(b.x, b.y + 2, b.w, 3);
  ctx.fillStyle = '#17292b'; ctx.fillRect(b.x, b.y + b.h - 10, b.w, 8);
  ctx.restore(); return model;
}

/** Wall posts end on the rear service plinth, not on the actor's feet. The
 * low, continuous base gives small props a common support and keeps the walk
 * lane distinct from cabinets, back-wall screens and painted false floors. */
export function drawHubSpatialFrameV136(ctx, room) {
  const plan = getHubSpatialPlanV136(room);
  if (!ctx || !plan) return null;
  const { x, w } = plan.bounds, { ceilingY: top, rearWallBaseY: base, walkY: floor } = plan.planes;
  ctx.save(); ctx.beginPath(); ctx.rect(x, top - 54, w, floor - top + 54); ctx.clip();
  const serviceFloor = ctx.createLinearGradient(0, base, 0, floor);
  serviceFloor.addColorStop(0, '#15282d'); serviceFloor.addColorStop(1, '#0b1a1e');
  ctx.fillStyle = serviceFloor; ctx.fillRect(x, base, w, floor - base);
  ctx.strokeStyle = 'rgba(83,111,111,.18)'; ctx.lineWidth = 1;
  for (let seamX = x - 160; seamX < x + w + 160; seamX += 160) line(ctx, [
    [seamX + (base - floor) * (plan.floorMode === 'parallel-oblique' ? plan.projection.dxPerY : 0), base], [seamX, floor]]);
  ctx.strokeStyle = 'rgba(80,107,105,.15)';
  line(ctx, [[x, plan.planes.rearServiceY], [x + w, plan.planes.rearServiceY]]);
  ctx.fillStyle = '#16272b'; ctx.fillRect(x, top - 54, w, 42);
  ctx.fillStyle = '#43595b'; ctx.fillRect(x, top - 52, w, 3);
  ctx.fillStyle = '#2d4145'; ctx.fillRect(x, top - 17, w, 5);
  ctx.strokeStyle = '#0c1b20'; ctx.lineWidth = 2;
  for (let offset = 10; offset < w; offset += 160) {
    const panelWidth = Math.min(136, w - offset - 10); if (panelWidth <= 0) continue;
    ctx.strokeRect(x + offset, top - 43, panelWidth, 20);
    ctx.fillStyle = '#758b87'; ctx.fillRect(x + offset + 4, top - 39, 2, 2);
  }
  // The kickplate ends the rear wall above its service floor. No front beam
  // is drawn across a person or doorway.
  ctx.fillStyle = '#14262a'; ctx.fillRect(x, base - 10, w, 12);
  ctx.fillStyle = '#3b5153'; ctx.fillRect(x, base - 10, w, 2);
  for (const postX of [x + 40, x + w - 54]) {
    ctx.fillStyle = '#172a2e'; ctx.fillRect(postX, top - 12, 14, Math.max(0, base - top + 12));
    ctx.fillStyle = '#3a5154'; ctx.fillRect(postX, top - 12, 3, Math.max(0, base - top + 12));
    ctx.fillStyle = '#2b4345'; ctx.fillRect(postX - 8, base - 8, 30, 8);
  }
  ctx.restore(); return plan;
}

/** Annexes and lifts are entered into the rear wall, so they retain a frontal
 * opening. Their visible human-scale surround sits inside the native generous
 * interaction socket. The socket and all destinations stay unchanged. */
export function getHubRecessedPortalV136(bounds, { maximumHeight = 156 } = {}) {
  if (!validBounds(bounds)) return null;
  const scale = Math.min(1, maximumHeight / bounds.h), w = bounds.w * scale, h = bounds.h * scale;
  const target = { x: bounds.x + (bounds.w - w) / 2, y: bounds.y + bounds.h - h, w, h };
  return { target, socket: { ...bounds }, frame: expanded(target, 7), projection: 'rear-wall-recess', collidable: false };
}

function drawPortalSurround(ctx, model, active) {
  const b = model.target;
  ctx.fillStyle = '#15272a'; ctx.fillRect(b.x - 7, b.y - 10, b.w + 14, b.h + 10);
  ctx.strokeStyle = '#51696a'; ctx.lineWidth = 2; ctx.strokeRect(b.x - 6, b.y - 9, b.w + 12, b.h + 9);
  ctx.fillStyle = '#0a1a1e'; ctx.fillRect(b.x - 2, b.y - 2, b.w + 4, b.h + 2);
  ctx.fillStyle = active ? '#8db6a2' : '#657c76'; ctx.fillRect(b.x + 9, b.y - 6, Math.min(42, b.w - 18), 2);
  ctx.fillStyle = '#4a5e5b'; ctx.fillRect(b.x - 8, b.y + b.h - 1, b.w + 16, 3);
}

export function drawHubSpatialLadderV136(ctx, ladder, { centered = true } = {}) {
  const mount = getHubLadderMountV139(ladder, { centered });
  if (!ctx || !mount) return false;
  const { width, left, railTop, railBottom } = mount, height = railBottom - railTop;
  ctx.save();
  // The two rails have a narrow return face; rungs sit between their inner
  // edges rather than forming a bright barcode pasted over the whole wall.
  for (const x of [left, left + width - 6]) {
    ctx.fillStyle = '#243b3e'; ctx.fillRect(x, railTop, 6, height);
    ctx.fillStyle = '#617b7b'; ctx.fillRect(x + 1, railTop, 2, height);
    ctx.fillStyle = '#0c2025'; ctx.fillRect(x + 5, railTop, 2, height);
    for (const y of [railTop + 4, ladder.top + 4, railBottom - 13]) {
      ctx.fillStyle = '#354f52'; ctx.fillRect(x - 5, y, 15, 8);
      ctx.fillStyle = '#91a09b'; ctx.fillRect(x + 2, y + 3, 2, 2);
    }
  }
  for (const { y } of mount.rungs) {
    ctx.fillStyle = '#182f34'; ctx.fillRect(left + 6, y + 3, width - 12, 3);
    ctx.fillStyle = '#657f7d'; ctx.fillRect(left + 6, y, width - 12, 3);
    ctx.fillStyle = '#99aba1'; ctx.fillRect(left + 8, y, width - 16, 1);
  }
  ctx.restore(); return true;
}

export function withHubSpatialDesignV136(Base) {
  if (Base.hubSpatialDesignV136) return Base;
  return class HubSpatialDesignV136 extends Base {
    static hubSpatialDesignV136 = true;
    draw() {
      this.hubSpatialPortalsV136 = new Map(); this.hubSpatialLiftsV136 = new Map(); this.hubSpatialFloorsV136 = new Map();
      return super.draw();
    }
    drawModularRoomV56(ctx, room, phase) {
      if (this.editorPlaytest || phase !== 'back') return super.drawModularRoomV56(ctx, room, phase);
      return Boolean(drawHubSpatialFrameV136(ctx, room));
    }
    drawDepthFloorV116(ctx) {
      if (this.editorPlaytest || this.useGlobalFloor === false) return super.drawDepthFloorV116(ctx);
      const annex = this.currentAnnexV71?.(), rooms = annex ? [{ ...annex, xStart: 0 }] : HUB_DECKS[this.state?.deck || 0].rooms;
      this.hubSpatialFloorsV136 ||= new Map();
      for (const room of rooms) this.hubSpatialFloorsV136.set(room.id, drawHubSpatialFloorV136(ctx, room, { enabled: this.depthPresentationV116 }));
    }
    drawHubSpatialRearV136(ctx, room) {
      if (this.editorPlaytest) return false;
      return Boolean(drawHubSpatialFrameV136(ctx, room));
    }
    drawTraversalLadder(ctx, ladder) {
      return this.editorPlaytest ? super.drawTraversalLadder(ctx, ladder) : drawHubSpatialLadderV136(ctx, ladder);
    }
    drawAnnexSteelLadderV133(ctx, ladder, annex) {
      return this.editorPlaytest ? super.drawAnnexSteelLadderV133(ctx, ladder, annex) : drawHubSpatialLadderV136(ctx, ladder, { centered: false });
    }
    drawDoorBitmapV71(ctx, image, bounds, active = 0, source = null) {
      if (this.editorPlaytest) return super.drawDoorBitmapV71(ctx, image, bounds, active, source, true);
      const portal = getHubRecessedPortalV136(bounds);
      if (!portal) return super.drawDoorBitmapV71(ctx, image, bounds, active, source, true);
      ctx.save(); drawPortalSurround(ctx, portal, active);
      super.drawDoorBitmapV71(ctx, image, portal.target, active, source, true);
      ctx.restore();
      this.hubSpatialPortalsV136 ||= new Map(); this.hubSpatialPortalsV136.set(`${bounds.x}:${bounds.y}`, portal);
      return true;
    }
    drawDoor(ctx, door, phase = 'front') {
      if (this.editorPlaytest || !door.lift) return super.drawDoor(ctx, door, phase);
      const image = this.propImages?.get('/assets/openai/hub/props/lift-door.png');
      if (!ready(image)) return super.drawDoor(ctx, door, phase);
      const floor = 624, height = 156, width = height * image.naturalWidth / image.naturalHeight;
      const portal = getHubRecessedPortalV136({ x: door.x - width / 2, y: floor - height, w: width, h: height });
      const b = portal.target, progress = Math.max(0, Math.min(1, finite(door.progress))), half = b.w / 2;
      ctx.save(); drawPortalSurround(ctx, portal, progress > .5);
      ctx.save(); ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip();
      const drawable = resolveSpriteDrawableV134(image), sourceHalf = image.naturalWidth / 2, slide = progress * half;
      ctx.drawImage(drawable, 0, 0, sourceHalf, image.naturalHeight, b.x - slide, b.y, half, b.h);
      ctx.drawImage(drawable, sourceHalf, 0, sourceHalf, image.naturalHeight, b.x + half + slide, b.y, half, b.h);
      ctx.restore();
      const playerX = this.player ? this.player.x + this.player.w / 2 : Number.NaN;
      if (Math.abs(playerX - door.x) < 520 && door.shaftLabel) {
        ctx.font = '700 10px ui-monospace, monospace';
        const textWidth = Math.min(310, ctx.measureText(door.shaftLabel).width + 18);
        ctx.fillStyle = 'rgba(2,8,7,.9)';
        ctx.fillRect(door.x - textWidth / 2, b.y - 30, textWidth, 18);
        ctx.fillStyle = '#b7d1be'; ctx.textAlign = 'center'; ctx.fillText(door.shaftLabel, door.x, b.y - 17); ctx.textAlign = 'left';
      }
      ctx.restore(); this.hubSpatialLiftsV136 ||= new Map(); this.hubSpatialLiftsV136.set(door.id, { ...portal, progress });
      return true;
    }
    getSnapshot() {
      const snapshot = super.getSnapshot(), room = this.currentAnnexV71?.() || this.currentRoom?.();
      const plan = room ? getHubSpatialPlanV136(room.world ? { ...room, xStart: 0 } : room, {
        doors: this.currentAnnexV71?.() ? [] : this.doorStates,
        ladders: room.ladders || this.v51Ladders, vents: room.world ? room.vents || [] : this.v51Vents || [],
        platforms: room.platforms || this.v51Platforms
      }) : null;
      return { ...snapshot, hubSpatialDesignV136: { active: !this.editorPlaytest, current: plan,
        floor: this.hubSpatialFloorsV136?.get(room?.id) || null,
        lifts: [...(this.hubSpatialLiftsV136?.values() || [])], portals: [...(this.hubSpatialPortalsV136?.values() || [])],
        gameplayPlane: '2d', collisionPolicy: 'native-geometry' } };
    }
  };
}
