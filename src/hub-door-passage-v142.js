/** Paired rear-wall doors share one visible aperture. The interaction sockets
 * and standing decks remain authored geometry; only the smaller native bitmap
 * and the short walk through its opening are projected between both faces. */
import { resolveSpriteDrawableV134 } from './sprite-alpha-policy-v134.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const valid = box => box && ['x', 'y', 'w', 'h'].every(key => Number.isFinite(box[key])) && box.w > 0 && box.h > 0;
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export const HUB_DOOR_PASSAGE_V142 = Object.freeze({ schema: 142, maximumHeight: 156,
  openingInsetX: .16, openingInsetTop: .13, openingHeight: .78,
  closingSeconds: .65, reducedClosingSeconds: .12, background: 'native-wall-visible-outside-frame',
  progressPolicy: 'runtime-only', arrivalPolicy: 'same-offset-in-paired-visible-opening' });

export function getHubDoorFaceV142(bounds, opposite, source = null) {
  if (!valid(bounds) || !valid(opposite)) return null;
  const sourceWidth = Array.isArray(source) ? source[2] - source[0] : bounds.w;
  const sourceHeight = Array.isArray(source) ? source[3] - source[1] : bounds.h;
  if (!(sourceWidth > 0 && sourceHeight > 0)) return null;
  const ratio = sourceWidth / sourceHeight;
  const height = Math.min(HUB_DOOR_PASSAGE_V142.maximumHeight, bounds.w / ratio, opposite.w / ratio);
  const width = height * ratio;
  const target = { x: bounds.x + (bounds.w - width) / 2, y: bounds.y + bounds.h - height, w: width, h: height };
  const opening = { x: target.x + width * HUB_DOOR_PASSAGE_V142.openingInsetX,
    y: target.y + height * HUB_DOOR_PASSAGE_V142.openingInsetTop,
    w: width * (1 - 2 * HUB_DOOR_PASSAGE_V142.openingInsetX), h: height * HUB_DOOR_PASSAGE_V142.openingHeight };
  return { schema: 142, target, opening, socket: { ...bounds }, source: source ? [...source] : null,
    projection: 'paired-rear-wall-door', pairedSize: { w: width, h: height },
    background: HUB_DOOR_PASSAGE_V142.background, collidable: false };
}

/** Both ends use the visible aperture rather than the generous E socket.
 * Clamp a distant approach to a short aligned walk at the source; the actor
 * then arrives at exactly that offset and on the destination standing deck. */
export function projectHubDoorActorV142(actor, sourceFace, destinationFace, {
  bounds = null, surfaces = [], solids = [], occupied = []
} = {}) {
  if (!valid(actor) || !valid(sourceFace?.target) || !valid(destinationFace?.target)) return null;
  const source = sourceFace.opening, destination = destinationFace.opening;
  if (!valid(source) || !valid(destination) || source.w < actor.w || destination.w < actor.w
    || source.h < actor.h || destination.h < actor.h) return null;
  const halfSpan = Math.min(source.w, destination.w) / 2 - actor.w / 2;
  const offsetX = clamp(actor.x + actor.w / 2 - (source.x + source.w / 2), -halfSpan, halfSpan);
  const sourceAligned = { x: source.x + source.w / 2 + offsetX - actor.w / 2,
    y: sourceFace.socket.y + sourceFace.socket.h - actor.h };
  const arrival = { x: destination.x + destination.w / 2 + offsetX - actor.w / 2,
    y: destinationFace.socket.y + destinationFace.socket.h - actor.h, w: actor.w, h: actor.h };
  if (bounds && (arrival.x < bounds.x || arrival.x + arrival.w > bounds.x + bounds.w
    || arrival.y < bounds.y || arrival.y + arrival.h > bounds.y + bounds.h)) return null;
  const footY = arrival.y + arrival.h;
  if (!surfaces.some(surface => Math.abs(surface.y - footY) < .01
    && arrival.x >= surface.x - .01 && arrival.x + arrival.w <= surface.x + surface.w + .01)) return null;
  if (solids.some(solid => solid.collisionMode !== 'one-way-top' && overlaps(arrival, solid))
    || occupied.some(body => overlaps(arrival, body))) return null;
  return { schema: 142, sourceAligned, arrival, offsetX,
    facing: actor.facing === -1 ? -1 : 1, standingY: footY,
    policy: HUB_DOOR_PASSAGE_V142.arrivalPolicy };
}

export function closingHubDoorProgressV142(elapsed, duration = HUB_DOOR_PASSAGE_V142.closingSeconds) {
  const t = clamp(finite(elapsed) / Math.max(.001, finite(duration, HUB_DOOR_PASSAGE_V142.closingSeconds)), 0, 1);
  return 1 - t * t * (3 - 2 * t);
}

/** Keep the original transparent metal frame stationary. Only the leaves in
 * its inner aperture retract, with no painted rectangle outside that frame. */
export function drawHubDoorFaceV142(ctx, image, face, { progress = 0, active = false } = {}) {
  if (!ctx || !face) return false;
  const b = face.target, hole = face.opening, amount = clamp(finite(progress), 0, 1);
  const ready = image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
  const source = face.source || [0, 0, image?.naturalWidth || 1, image?.naturalHeight || 1];
  const width = source[2] - source[0], height = source[3] - source[1];
  ctx.save();
  if (amount > 0) {
    // The recess is limited to the actual clear aperture, never its E socket.
    ctx.fillStyle = '#090d0c'; ctx.fillRect(hole.x, hole.y, hole.w, hole.h);
    ctx.fillStyle = '#1d2520'; ctx.fillRect(hole.x + 5, hole.y + 6, hole.w - 10, hole.h - 10);
    ctx.fillStyle = '#333a30';
    for (const x of [hole.x + 6, hole.x + hole.w - 9]) ctx.fillRect(x, hole.y + 7, 3, hole.h - 12);
    ctx.fillStyle = '#465044'; ctx.fillRect(hole.x + 5, hole.y + hole.h - 8, hole.w - 10, 3);
  }
  if (ready && width > 0 && height > 0) {
    const drawable = resolveSpriteDrawableV134(image);
    // An even-odd clip leaves the transparent source perimeter untouched.
    ctx.save(); ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.rect(hole.x, hole.y, hole.w, hole.h); ctx.clip('evenodd');
    ctx.drawImage(drawable, source[0], source[1], width, height, b.x, b.y, b.w, b.h); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(hole.x, hole.y, hole.w, hole.h); ctx.clip();
    const scaleX = width / b.w, scaleY = height / b.h;
    const sourceX = source[0] + (hole.x - b.x) * scaleX, sourceY = source[1] + (hole.y - b.y) * scaleY;
    const half = hole.w / 2, slide = half * amount;
    ctx.drawImage(drawable, sourceX, sourceY, half * scaleX, hole.h * scaleY,
      hole.x - slide, hole.y, half, hole.h);
    ctx.drawImage(drawable, sourceX + half * scaleX, sourceY, half * scaleX, hole.h * scaleY,
      hole.x + half + slide, hole.y, half, hole.h); ctx.restore();
  } else {
    // Loading fallback is slender metal architecture, not a full flat block.
    ctx.fillStyle = '#43483e';
    ctx.fillRect(b.x, b.y, 4, b.h); ctx.fillRect(b.x + b.w - 4, b.y, 4, b.h); ctx.fillRect(b.x, b.y, b.w, 4);
  }
  ctx.fillStyle = amount > .5 || active ? '#96b38b' : '#727c64';
  ctx.fillRect(b.x + b.w / 2 - 9, b.y + 6, 18, 2);
  ctx.restore();
  return { ...face, progress: amount, active: Boolean(active), framePolicy: 'stationary-transparent-source',
    leafPolicy: 'two-clipped-sliding-leaves', fullSocketFill: false };
}
