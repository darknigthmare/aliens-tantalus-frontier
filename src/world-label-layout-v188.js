// V188 — placement of world-space labels so they never cover a character
// sprite (graphics audit 2026-11-15, item 13: the save-terminal prompt sat on
// the marine at every mission spawn). Pure geometry, shared by the renderers.

/** Horizontal reach of a character sprite around its hitbox (weapon, shoulders). */
export const LABEL_SPRITE_SIDE_V188 = 22;
/** Height of a character sprite above its hitbox top (helmet, raised weapon, health bar). */
export const LABEL_SPRITE_HEAD_V188 = 18;
/** Gap kept between a label plate and a sprite. */
export const LABEL_GAP_V188 = 4;

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

/** The screen box a character sprite may cover (world coordinates). */
export function labelSpriteBoxV188(actor) {
  const x = finite(actor?.x), y = finite(actor?.y), w = finite(actor?.w, 40), h = finite(actor?.h, 80);
  return { x: x - LABEL_SPRITE_SIDE_V188, y: y - LABEL_SPRITE_HEAD_V188, w: w + LABEL_SPRITE_SIDE_V188 * 2, h: h + LABEL_SPRITE_HEAD_V188 };
}
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/**
 * A label centred on x with its baseline at preferredBaseline: raised above every sprite it would cover.
 * Returns { x, baseline, plate: {x, y, w, h}, raisedBy }.
 */
export function placeWorldLabelV188({ x, preferredBaseline, textWidth, fontSize = 11, actors = [] }) {
  const padX = 6, ascent = Math.ceil(fontSize * .85), descent = Math.ceil(fontSize * .3);
  const w = Math.ceil(finite(textWidth) + padX * 2), h = ascent + descent + 6;
  const plateAt = baseline => ({ x: x - w / 2, y: baseline - ascent - 3, w, h });
  const boxes = actors.filter(actor => actor && actor.alive !== false && !actor.inVehicle && !actor.hidden).map(labelSpriteBoxV188);
  let baseline = finite(preferredBaseline);
  // Raise the label until its plate clears every sprite it meets (a few passes for stacked actors).
  for (let pass = 0; pass < 4; pass++) {
    const plate = plateAt(baseline), hit = boxes.filter(box => overlaps(plate, box));
    if (!hit.length) break;
    baseline = Math.min(...hit.map(box => box.y)) - LABEL_GAP_V188 - descent - 3;
  }
  return { x, baseline, plate: plateAt(baseline), raisedBy: finite(preferredBaseline) - baseline };
}
