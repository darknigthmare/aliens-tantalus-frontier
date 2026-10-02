/** Visual depth on the existing side-scrolling walk plane. Gameplay coordinates,
 * actor feet, obstacle bounds and interaction radii are deliberately unchanged.
 * Only non-colliding distant art parallax and the floor below the walk rail gain
 * perspective. This is not free movement in a third gameplay axis.
 */
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : 0));

export function hubFarParallaxV116(cameraX, room, enabled = true) {
  if (!enabled) return 0;
  const width = room?.profile?.worldWidth || 1280;
  const center = (room?.xStart || 0) + width / 2;
  return clamp((cameraX + 640 - center) * .025, -18, 18);
}

export function hubFloorPerspectiveV116(cameraX, { width = 1280, height = 720, floorY = 624 } = {}) {
  const visibleStart = Math.floor(Math.max(0, cameraX) / 160) * 160 - 160;
  const vanishingX = cameraX + width / 2;
  const nearY = Math.max(floorY, height);
  return {
    walkY: floorY, nearY,
    seams: Array.from({ length: Math.ceil(width / 160) + 4 }, (_, index) => {
      const x = visibleStart + index * 160;
      return { farX: x, nearX: vanishingX + (x - vanishingX) * 1.28 };
    }),
    crossRails: [floorY + 12, floorY + 34, floorY + 67].filter(y => y < nearY)
  };
}

export function drawHubFloorPerspectiveV116(ctx, cameraX, bounds) {
  const model = hubFloorPerspectiveV116(cameraX, bounds);
  ctx.save();
  ctx.strokeStyle = 'rgba(102, 146, 135, .16)'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (const seam of model.seams) { ctx.moveTo(seam.farX, model.walkY + 4); ctx.lineTo(seam.nearX, model.nearY); }
  for (const y of model.crossRails) { ctx.moveTo(cameraX, y); ctx.lineTo(cameraX + (bounds?.width || 1280), y); }
  ctx.stroke(); ctx.restore();
}

export function drawHubContactShadowV116(ctx, actor, floorY, enabled = true) {
  if (!enabled || !actor || !Number.isFinite(floorY)) return;
  const airborne = clamp(floorY - actor.y - actor.h, 0, 220);
  const width = Math.max(8, (actor.w || 44) * (.62 - airborne / 1000));
  ctx.save(); ctx.fillStyle = `rgba(0, 0, 0, ${(.30 - airborne / 1100).toFixed(3)})`;
  ctx.beginPath(); ctx.ellipse(actor.x + actor.w / 2, floorY + 3, width, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
