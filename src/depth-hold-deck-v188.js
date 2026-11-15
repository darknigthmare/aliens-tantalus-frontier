// V188 — the deck surface of the mission holds in depth (QZ-17, freighter, Lethe).
// The hold floor runs from the back wall (z = 0, the rail) towards the camera
// (z = zMin): on screen, the band floorY … floorY - zMin. Before this module the
// band was left to the void under the rail truss, so floor objects drawn at
// their depth seemed to float below the grating. The deck is drawn over the
// truss of the hold floor only, right after that platform, so hazards, objects,
// actors and their contact shadows land on it.
//
// Image generation is deferred: the deck is a named art slot whose PLACEHOLDER
// is drawn with Canvas primitives (plating, a grating lane along the wall,
// perspective seams converging above the hold, a front lip). When an image is
// produced, commit it at the slot path AND list the slot id in
// DEPTH_HOLD_DECK_FILES_PRESENT_V188: only listed slots are requested.
// No marking on the deck is player text.

export const DEPTH_HOLD_DECK_SLOT_V188 = Object.freeze({
  id: 'hold-deck-plating', layer: 'floor', path: '/assets/depth-holds/v188/hold-deck-plating.png',
  purpose: 'Hold floor seen at the depth band: steel plating, a grating lane along the back wall, tie-down seams, front lip.',
  brief: 'Worn steel cargo-deck plating seen from a low three-quarter side angle, diamond tread, a strip of open grating along the far wall, tie-down tracks; tileable horizontally; no text.'
});
export const DEPTH_HOLD_DECK_FILES_PRESENT_V188 = Object.freeze([]);
/** Height of the front lip under the deck band, and of the soft shadow below it. */
export const DEPTH_HOLD_DECK_LIP_V188 = 8;
export const DEPTH_HOLD_DECK_SHADOW_V188 = 22;
/** The vanishing height of the perspective seams, above the floor line (px). */
export const DEPTH_HOLD_DECK_VANISH_V188 = 520;

/** Screen geometry of a section's deck. */
export function depthHoldDeckGeometryV188(section) {
  const depth = Math.max(0, -(Number(section.zMin) || 0) + (Number(section.zMax) || 0));
  const top = section.floorY - (Number(section.zMax) || 0), front = top + depth;
  return { x0: section.x0, x1: section.x1, top, front, depth, lip: DEPTH_HOLD_DECK_LIP_V188, shadow: DEPTH_HOLD_DECK_SHADOW_V188,
    vanishX: (section.x0 + section.x1) / 2, vanishY: top - DEPTH_HOLD_DECK_VANISH_V188 };
}
/** x on the floor line of a seam that meets the front edge at xFront (one-point perspective). */
export function deckSeamTopXV188(geometry, xFront) {
  const { vanishX, vanishY, top, front } = geometry;
  return vanishX + (xFront - vanishX) * (top - vanishY) / (front - vanishY);
}
/** Screen y of a depth z on the deck. */
export const deckRowYV188 = (section, z) => section.floorY - z;

/** The platform of the hold floor, whose truss the deck replaces inside the hold. */
export function isHoldFloorPlatformV188(section, platform) {
  return Boolean(section && platform && Math.abs(Number(platform.y) - section.floorY) < 1
    && (!section.zoneId || !platform.zoneId || platform.zoneId === section.zoneId)
    && platform.x < section.x1 && platform.x + platform.w > section.x0);
}

const images = new Map(), rendered = new Map();
function slotImage(present, ImageCtor) {
  if (!present.includes(DEPTH_HOLD_DECK_SLOT_V188.id) || !ImageCtor) return null;
  let image = images.get(DEPTH_HOLD_DECK_SLOT_V188.id);
  if (!image) { image = new ImageCtor(); image.src = DEPTH_HOLD_DECK_SLOT_V188.path; images.set(DEPTH_HOLD_DECK_SLOT_V188.id, image); }
  return image.complete && image.naturalWidth > 0 ? image : null;
}

/**
 * Draws the deck of a section between clipX0 and clipX1 (the part of one floor platform).
 * Returns 'image', 'cached' or 'primitive'.
 */
export function drawDepthHoldDeckV188(ctx, section, { clipX0 = section.x0, clipX1 = section.x1, present = DEPTH_HOLD_DECK_FILES_PRESENT_V188, ImageCtor = globalThis.Image } = {}) {
  const g = depthHoldDeckGeometryV188(section);
  const a = Math.max(g.x0, clipX0), b = Math.min(g.x1, clipX1);
  if (!(b > a) || !(g.depth > 0)) return null;
  const height = g.depth + g.lip + g.shadow;
  ctx.save();
  try {
    const image = slotImage(present, ImageCtor);
    if (image) {
      const sx = (a - g.x0) / (g.x1 - g.x0) * image.naturalWidth, sw = (b - a) / (g.x1 - g.x0) * image.naturalWidth;
      ctx.drawImage(image, sx, 0, sw, image.naturalHeight, a, g.top, b - a, g.depth + g.lip);
      return 'image';
    }
    const cached = deckCanvas(section, g, height);
    if (cached) { ctx.drawImage(cached, a - g.x0, 0, b - a, height, a, g.top, b - a, height); return 'cached'; }
    ctx.beginPath(); ctx.rect(a, g.top - 1, b - a, height + 1); ctx.clip();
    paintDeckV188(ctx, g, 0, 0);
    return 'primitive';
  } finally { ctx.restore(); }
}

function deckCanvas(section, g, height) {
  const key = `${section.id}|${g.x0}|${g.x1}|${g.top}|${g.depth}`;
  if (rendered.has(key)) return rendered.get(key);
  const canvas = globalThis.document?.createElement?.('canvas'), c = canvas?.getContext?.('2d');
  if (!c) return null; // no offscreen canvas (Node host): drawn directly
  canvas.width = Math.ceil(g.x1 - g.x0); canvas.height = Math.ceil(height);
  paintDeckV188(c, g, g.x0, g.top);
  if (rendered.size > 8) rendered.clear();
  rendered.set(key, canvas); return canvas;
}

/** The primitive placeholder, painted with (ox, oy) as the canvas origin of (x0, top). */
export function paintDeckV188(ctx, g, ox = 0, oy = 0) {
  const X = x => x - ox, Y = y => y - oy, w = g.x1 - g.x0;
  const top = Y(g.top), front = Y(g.front);
  // Plating: lit towards the camera, darker under the wall.
  const plate = ctx.createLinearGradient?.(0, top, 0, front);
  if (plate) { plate.addColorStop(0, '#171d1f'); plate.addColorStop(1, '#2c3437'); ctx.fillStyle = plate; } else ctx.fillStyle = '#232a2d';
  ctx.fillRect(X(g.x0), top, w, g.depth);
  // Grating lane along the wall (the rail walk, z 0 … -14): open slots over a dark sump.
  const lane = Math.min(14, g.depth / 4);
  ctx.fillStyle = '#0c1012'; ctx.fillRect(X(g.x0), top, w, lane);
  ctx.fillStyle = '#3a4447';
  for (let y = top + 2; y < top + lane - 1; y += 4) ctx.fillRect(X(g.x0), y, w, 1);
  ctx.fillStyle = '#4a5558'; ctx.fillRect(X(g.x0), top + lane, w, 2); // grating frame
  // Transverse plate seams (foreshortened rows, closer together towards the wall).
  ctx.fillStyle = 'rgba(0,0,0,.45)';
  for (const t of [.42, .66, .86]) ctx.fillRect(X(g.x0), Math.round(top + lane + (g.depth - lane) * t), w, 1);
  ctx.fillStyle = 'rgba(255,255,255,.05)';
  for (const t of [.42, .66, .86]) ctx.fillRect(X(g.x0), Math.round(top + lane + (g.depth - lane) * t) + 1, w, 1);
  // Perspective seams: plate joints running from the front edge towards the vanishing point.
  ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 1; ctx.beginPath();
  const first = Math.ceil((g.x0 - g.vanishX) / 64) * 64 + g.vanishX;
  for (let xf = first - 128; xf <= g.x1 + 128; xf += 64) {
    const xt = deckSeamTopXV188(g, xf); ctx.moveTo(X(xt) + .5, top + lane + 2); ctx.lineTo(X(xf) + .5, front);
  }
  ctx.stroke();
  // Tread studs: sparse, in rows, following the same perspective.
  ctx.fillStyle = 'rgba(255,255,255,.06)';
  for (const t of [.55, .76, .95]) {
    const y = top + lane + (g.depth - lane) * t, k = (y - Y(g.vanishY)) / (front - Y(g.vanishY));
    for (let xf = first - 96; xf <= g.x1 + 96; xf += 32) { const x = g.vanishX + (xf - g.vanishX) * k; ctx.fillRect(X(x) - 1, Math.round(y) - 1, 3, 1); }
  }
  // Front lip: the deck's edge facing the camera, then a soft shadow onto the void.
  ctx.fillStyle = '#4b5659'; ctx.fillRect(X(g.x0), front - 1, w, 2);
  ctx.fillStyle = '#1f2628'; ctx.fillRect(X(g.x0), front + 1, w, g.lip - 1);
  ctx.fillStyle = '#c9a54a'; for (let x = g.x0 + 10; x < g.x1 - 10; x += 40) ctx.fillRect(X(x), front + 3, 18, 2); // edge marking
  const fall = ctx.createLinearGradient?.(0, front + g.lip, 0, front + g.lip + g.shadow);
  if (fall) { fall.addColorStop(0, 'rgba(0,0,0,.55)'); fall.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = fall; ctx.fillRect(X(g.x0), front + g.lip, w, g.shadow); }
}

/** Soft contact shadow covering a floor object's footprint depth (z0 … z1, clamped to the deck). */
export function drawFootprintShadowV188(ctx, section, entry) {
  const f = entry.footprint || { x0: entry.x, x1: entry.x + entry.w, z0: entry.z, z1: entry.z };
  const z1 = Math.min(section.zMax, f.z1), z0 = Math.max(section.zMin, f.z0);
  if (!(z1 >= z0)) return null;
  const yBack = deckRowYV188(section, z1), yFront = deckRowYV188(section, z0), cx = (f.x0 + f.x1) / 2;
  const rx = (f.x1 - f.x0) / 2 + 6, ry = Math.max(3, (yFront - yBack) / 2 + 2);
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.30)';
  ctx.beginPath(); ctx.ellipse(cx, (yBack + yFront) / 2, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  return { cx, yBack, yFront, rx, ry };
}
