/** Visual depth on the existing side-scrolling walk plane. Gameplay coordinates,
 * actor feet, obstacle bounds and interaction radii are deliberately unchanged.
 * Only non-colliding distant art parallax and the floor below the walk rail gain
 * perspective. This is not free movement in a third gameplay axis.
 */
import { getHubRoomPresentationV119 } from './hub-room-presentation-v119.js';
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : 0));

export function hubFarParallaxV116(cameraX, room, enabled = true) {
  if (!enabled) return 0;
  const presentation = getHubRoomPresentationV119(room);
  if (presentation.presentationMode !== '2.5d') return 0;
  const width = room?.profile?.worldWidth || 1280;
  const center = (room?.xStart || 0) + width / 2;
  return clamp((cameraX + 640 - center) * presentation.cameraProfile.farFactor,
    -presentation.cameraProfile.maximumDrift, presentation.cameraProfile.maximumDrift);
}

export function hubFloorPerspectiveV116(cameraX, { width = 1280, height = 720, floorY = 624,
  presentationMode = '2.5d' } = {}) {
  const visibleStart = Math.floor(Math.max(0, cameraX) / 160) * 160 - 160;
  const nearY = Math.max(floorY, height);
  const depthEnabled = presentationMode === '2.5d' && nearY > floorY + 4;
  const dxPerY = depthEnabled ? 19 / 12 : 0;
  return {
    walkY: floorY, startY: floorY + 4, nearY,
    presentationMode, projection: depthEnabled ? 'parallel-oblique' : 'orthographic', dxPerY,
    // A room has one fixed parallel projection. A camera-centred vanishing
    // point would turn its floor while doors and supported furniture stayed put.
    horizonX: null, horizonY: null, vanishingPoint: null,
    seams: depthEnabled ? Array.from({ length: Math.ceil(width / 160) + 4 }, (_, index) => {
      const x = visibleStart + index * 160;
      return { walkX: x, farX: x + 4 * dxPerY, nearX: x + (nearY - floorY) * dxPerY };
    }) : [],
    crossRails: depthEnabled ? [0.13, 0.36, 0.72].map(fraction => floorY + (nearY - floorY) * fraction).filter(y => y < nearY) : []
  };
}

export function drawHubFloorPerspectiveV116(ctx, cameraX, bounds) {
  const model = hubFloorPerspectiveV116(cameraX, bounds);
  if (!ctx || model.projection !== 'parallel-oblique') return false;
  ctx.save();
  ctx.strokeStyle = 'rgba(102, 146, 135, .16)'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (const seam of model.seams) { ctx.moveTo(seam.farX, model.startY); ctx.lineTo(seam.nearX, model.nearY); }
  for (const y of model.crossRails) { ctx.moveTo(cameraX, y); ctx.lineTo(cameraX + (bounds?.width || 1280), y); }
  ctx.stroke(); ctx.restore(); return model;
}

/** A contact shadow belongs to the actual supported feet. It is not a second
 * shadow on the bottom deck while the actor uses a ladder or upper landing. */
export function getHubContactShadowV139(actor, supportY) {
  if (!actor || ![actor.x, actor.y, actor.w, actor.h, supportY].every(Number.isFinite)
    || actor.w <= 0 || actor.h <= 0 || actor.grounded === false || actor.climbing
    || actor.ventTransit || actor.inVehicle) return null;
  const footY = actor.y + actor.h;
  if (Math.abs(footY - supportY) > .75) return null;
  return { schema: 139, x: actor.x + actor.w / 2, y: supportY + 2,
    radiusX: Math.max(8, actor.w * .62), radiusY: 3,
    supportY, footY, plane: 'actual-ground-contact', collidable: false };
}

export function drawHubContactShadowV116(ctx, actor, floorY, enabled = true) {
  const contact = enabled && getHubContactShadowV139(actor, floorY);
  if (!ctx || !contact) return null;
  ctx.save(); ctx.fillStyle = 'rgba(0, 0, 0, .30)';
  ctx.beginPath(); ctx.ellipse(contact.x, contact.y, contact.radiusX, contact.radiusY, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  return contact;
}

/** V119 extends the same floor renderer with room-local clips. Floor details
 * and near service rails are strictly below the physical walk rail, so neither
 * a station, actor, door nor ladder can become obscured by this added layer. */
export function drawHubRoomDepthV119(ctx, cameraX, room, bounds = {}, enabled = true) {
  const presentation = getHubRoomPresentationV119(room, enabled);
  if (!presentation.perspectiveFloor) return false;
  const width = room?.profile?.worldWidth || room?.world?.width || 1280;
  const roomX = Number.isFinite(room?.xStart) ? room.xStart : 0;
  const floorY = bounds.floorY ?? room?.world?.floorY ?? 624;
  const height = bounds.height ?? room?.world?.height ?? 720;
  const viewportWidth = bounds.width ?? 1280;
  if (roomX + width <= cameraX || roomX >= cameraX + viewportWidth) return false;
  ctx.save();
  ctx.beginPath(); ctx.rect(roomX, floorY + 4, width, Math.max(0, height - floorY - 4)); ctx.clip();
  drawHubFloorPerspectiveV116(ctx, cameraX, { width: viewportWidth, height, floorY,
    presentationMode: presentation.presentationMode });
  const tint = ctx.createLinearGradient(0, floorY + 4, 0, height);
  tint.addColorStop(0, 'rgba(70, 104, 93, .04)'); tint.addColorStop(1, 'rgba(2, 8, 9, .26)');
  ctx.fillStyle = tint; ctx.fillRect(roomX, floorY + 4, width, height - floorY - 4);
  ctx.strokeStyle = 'rgba(124, 171, 147, .24)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(roomX, height - 12); ctx.lineTo(roomX + width, height - 12); ctx.stroke();
  ctx.restore(); return true;
}
