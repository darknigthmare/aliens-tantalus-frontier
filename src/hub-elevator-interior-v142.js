import { resolveSpriteDrawableV134 } from './sprite-alpha-policy-v134.js';

// The existing 187×191 drawing contains both the surround and the leaves.
// Only the pixels inside this aperture travel; the surround stays bolted down.
export const HUB_ELEVATOR_SOURCE_V142 = Object.freeze({
  width: 187, height: 191,
  aperture: Object.freeze({ x: 51, y: 46, w: 79, h: 132 }),
  humanHeight: 96.5, projection: 'frontal', texturePolicy: 'native-leaf-crop'
});

const finite = value => typeof value === 'number' && Number.isFinite(value);
const valid = bounds => bounds && [bounds.x, bounds.y, bounds.w, bounds.h].every(finite) && bounds.w > 0 && bounds.h > 0;
const polygon = (ctx, points) => { ctx.beginPath(); points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); };

export function getHubElevatorInteriorV142(bounds, progress = 0) {
  if (!valid(bounds)) return null;
  const source = HUB_ELEVATOR_SOURCE_V142, crop = source.aperture;
  const sx = bounds.w / source.width, sy = bounds.h / source.height;
  // Door art is never squeezed independently along either axis.
  if (Math.abs(sx - sy) > 1e-7) return null;
  const opening = { x: bounds.x + crop.x * sx, y: bounds.y + crop.y * sy, w: crop.w * sx, h: crop.h * sy };
  const corner = 7 * sx, p = Math.max(0, Math.min(1, finite(progress) ? progress : 0));
  return { schema: 142, target: { ...bounds }, opening, progress: p,
    openingPolygon: [[opening.x + corner, opening.y], [opening.x + opening.w - corner, opening.y],
      [opening.x + opening.w, opening.y + corner], [opening.x + opening.w, opening.y + opening.h],
      [opening.x, opening.y + opening.h], [opening.x, opening.y + corner]],
    sourceOpening: { ...crop }, leafTravel: p * opening.w / 2,
    visibleWidth: p * opening.w, scale: sx, humanHeight: source.humanHeight,
    projection: source.projection, texturePolicy: source.texturePolicy,
    collidable: false, geometryPreserved: true, animatedBy: 'native-door-progress' };
}

function drawCabin(ctx, model) {
  const b = model.opening, unit = model.scale;
  // A compact frontal cabin, composed at door scale. Flat wall panels and
  // straight floor joints preserve the room's orthographic presentation.
  ctx.fillStyle = '#272c29'; ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = '#373c35'; ctx.fillRect(b.x + 7 * unit, b.y + 8 * unit, b.w - 14 * unit, b.h - 22 * unit);
  ctx.fillStyle = '#45493e'; ctx.fillRect(b.x + 8 * unit, b.y + 9 * unit, b.w - 16 * unit, 3 * unit);
  ctx.fillStyle = '#1d221e';
  for (const fraction of [1 / 3, 2 / 3]) ctx.fillRect(b.x + b.w * fraction, b.y + 13 * unit, unit, b.h - 28 * unit);
  ctx.fillStyle = '#1b211e';
  ctx.fillRect(b.x, b.y, 7 * unit, b.h); ctx.fillRect(b.x + b.w - 7 * unit, b.y, 7 * unit, b.h);
  ctx.fillStyle = '#4a5045'; ctx.fillRect(b.x + 5 * unit, b.y + 12 * unit, 2 * unit, b.h - 26 * unit);
  ctx.fillRect(b.x + b.w - 7 * unit, b.y + 12 * unit, 2 * unit, b.h - 26 * unit);
  // A warm ceiling fixture and its shallow metal recess, with no animated
  // bloom, oscillation or independent clock when paused/reduced motion.
  ctx.fillStyle = '#141b17'; ctx.fillRect(b.x + b.w * .26, b.y + 3 * unit, b.w * .48, 7 * unit);
  ctx.fillStyle = '#b9b595'; ctx.fillRect(b.x + b.w * .3, b.y + 5 * unit, b.w * .4, 2 * unit);
  // The rail is a physical horizontal fitting, not another doorway outline.
  const railY = b.y + b.h * .62;
  ctx.fillStyle = '#161d18'; ctx.fillRect(b.x + 10 * unit, railY, b.w - 20 * unit, 5 * unit);
  ctx.fillStyle = '#727668'; ctx.fillRect(b.x + 10 * unit, railY, b.w - 20 * unit, 2 * unit);
  for (const fraction of [.24, .76]) { ctx.fillStyle = '#4c5346'; ctx.fillRect(b.x + b.w * fraction, railY + 2 * unit, 2 * unit, 5 * unit); }
  // Four restrained buttons and a deck display on the rear right wall.
  const controls = { x: b.x + b.w - 18 * unit, y: b.y + b.h * .3, w: 8 * unit, h: 25 * unit };
  ctx.fillStyle = '#151b17'; ctx.fillRect(controls.x, controls.y, controls.w, controls.h);
  ctx.fillStyle = '#928c60'; ctx.fillRect(controls.x + 2 * unit, controls.y + 2 * unit, 4 * unit, 3 * unit);
  for (let index = 0; index < 4; index++) { ctx.fillStyle = index === 0 ? '#a5ac84' : '#656c5b'; ctx.fillRect(controls.x + 3 * unit, controls.y + (8 + index * 4) * unit, 2 * unit, 2 * unit); }
  const floorY = b.y + b.h - 14 * unit;
  ctx.fillStyle = '#171e19'; ctx.fillRect(b.x, floorY, b.w, b.y + b.h - floorY);
  ctx.fillStyle = '#4b5145'; ctx.fillRect(b.x + 5 * unit, floorY, b.w - 10 * unit, 2 * unit);
  ctx.fillStyle = '#31392e';
  for (let offset = 8; offset < 74; offset += 9) ctx.fillRect(b.x + offset * unit, floorY + 5 * unit, 2 * unit, 6 * unit);
  ctx.fillStyle = '#7b7d69'; ctx.fillRect(b.x, b.y + b.h - 2 * unit, b.w, 2 * unit);
}

export function drawHubElevatorDoorV142(ctx, image, bounds, progress = 0) {
  const model = getHubElevatorInteriorV142(bounds, progress);
  if (!ctx || !model || !image?.complete || image.naturalWidth !== HUB_ELEVATOR_SOURCE_V142.width
    || image.naturalHeight !== HUB_ELEVATOR_SOURCE_V142.height) return null;
  const b = model.target, opening = model.opening, source = model.sourceOpening;
  const drawable = resolveSpriteDrawableV134(image);
  ctx.save();
  // Closed: the existing art is preserved byte for byte and drawn once.
  ctx.drawImage(drawable, b.x, b.y, b.w, b.h);
  if (model.progress > 0) {
    ctx.save(); polygon(ctx, model.openingPolygon); ctx.clip();
    drawCabin(ctx, model);
    const sourceHalf = source.w / 2, half = opening.w / 2;
    ctx.drawImage(drawable, source.x, source.y, sourceHalf, source.h,
      opening.x - model.leafTravel, opening.y, half, opening.h);
    ctx.drawImage(drawable, source.x + sourceHalf, source.y, sourceHalf, source.h,
      opening.x + half + model.leafTravel, opening.y, half, opening.h);
    ctx.restore();
  }
  ctx.restore(); return model;
}
