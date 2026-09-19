// Tight crops isolate usable side-view structure from the surrounding atlas art.
export const MISSION_STRUCTURE_CROPS_V87 = Object.freeze({
  catwalkDeck: Object.freeze({ x: 40, y: 43, w: 188, h: 27 }),
  ladderLeft: Object.freeze({ x: 53, y: 4, w: 9, h: 168 }),
  ladderRight: Object.freeze({ x: 100, y: 4, w: 9, h: 168 }),
  ladderRung: Object.freeze({ x: 62, y: 36, w: 38, h: 4 }),
  pipeShaft: Object.freeze({ x: 49, y: 34, w: 50, h: 86 }),
  floorPanel: Object.freeze({ x: 4, y: 4, w: 210, h: 75 })
});

const MAX_DRAW_CALLS = 8192;
const RAIL_WIDTH = 7;
const RUNG_SPACING = 22;
const finite = value => typeof value === 'number' && Number.isFinite(value);
const positive = value => finite(value) && value > 0;

function validBounds(bounds) {
  return bounds && finite(bounds.x) && finite(bounds.y)
    && positive(bounds.w) && positive(bounds.h)
    && finite(bounds.x + bounds.w) && finite(bounds.y + bounds.h);
}

function drawable(ctx, image, crop) {
  return typeof ctx?.drawImage === 'function' && image?.complete === true
    && positive(image.naturalWidth) && positive(image.naturalHeight)
    && validBounds(crop) && crop.x >= 0 && crop.y >= 0
    && crop.x + crop.w <= image.naturalWidth
    && crop.y + crop.h <= image.naturalHeight;
}

/** Repeat a tight crop without changing its aspect ratio or painting past bounds. */
export function drawTiledMissionCropV87(ctx, image, crop, bounds, options = {}) {
  const axis = options?.axis ?? 'x';
  if ((axis !== 'x' && axis !== 'y') || !drawable(ctx, image, crop) || !validBounds(bounds)) return 0;
  const horizontal = axis === 'x';
  const scale = horizontal ? bounds.h / crop.h : bounds.w / crop.w;
  const tileLength = (horizontal ? crop.w : crop.h) * scale;
  const length = horizontal ? bounds.w : bounds.h;
  const tileCount = Math.ceil(length / tileLength);
  if (!positive(scale) || !positive(tileLength) || !positive(tileCount) || tileCount > MAX_DRAW_CALLS) return 0;
  let count = 0;
  for (let index = 0; index < tileCount; index += 1) {
    const offset = index * tileLength;
    const segment = Math.min(tileLength, length - offset);
    if (!positive(segment)) break;
    // Cropping the final source section preserves scale; squeezing a full tile does not.
    if (horizontal) {
      ctx.drawImage(image, crop.x, crop.y, Math.min(crop.w, segment / scale), crop.h,
        bounds.x + offset, bounds.y, segment, bounds.h);
    } else {
      ctx.drawImage(image, crop.x, crop.y, crop.w, Math.min(crop.h, segment / scale),
        bounds.x, bounds.y + offset, bounds.w, segment);
    }
    count += 1;
  }
  return count;
}

/** Draw separated rails and rungs, leaving the climbable ladder openings empty. */
export function drawMissionLadderV87(ctx, image, ladder) {
  if (!ladder || !finite(ladder.x) || !finite(ladder.top) || !finite(ladder.bottom)) return 0;
  const width = ladder.w === undefined ? 42 : ladder.w;
  const height = ladder.bottom - ladder.top;
  const left = ladder.x - width / 2;
  if (!positive(width) || width <= RAIL_WIDTH * 2 || !positive(height)
    || !validBounds({ x: left, y: ladder.top, w: width, h: height })) return 0;
  const { ladderLeft, ladderRight, ladderRung } = MISSION_STRUCTURE_CROPS_V87;
  if (![ladderLeft, ladderRight, ladderRung].every(crop => drawable(ctx, image, crop))) return 0;
  const scale = RAIL_WIDTH / ladderLeft.w;
  const rungHeight = ladderRung.h * scale;
  const innerWidth = width - RAIL_WIDTH * 2;
  const firstRung = RUNG_SPACING / 2;
  const rungCount = Math.max(0, Math.ceil((height - firstRung) / RUNG_SPACING));
  const railTiles = Math.ceil(height / (ladderLeft.h * scale));
  const rungTiles = Math.ceil(innerWidth / (ladderRung.w * scale));
  if (!finite(railTiles) || !finite(rungCount) || !finite(rungTiles)
    || 2 * railTiles + rungCount * rungTiles > MAX_DRAW_CALLS) return 0;
  let count = drawTiledMissionCropV87(ctx, image, ladderLeft,
    { x: left, y: ladder.top, w: RAIL_WIDTH, h: height }, { axis: 'y' });
  count += drawTiledMissionCropV87(ctx, image, ladderRight,
    { x: left + width - RAIL_WIDTH, y: ladder.top, w: RAIL_WIDTH, h: height }, { axis: 'y' });
  for (let index = 0; index < rungCount; index += 1) {
    const offset = firstRung + index * RUNG_SPACING;
    const visibleHeight = Math.min(rungHeight, height - offset);
    if (!positive(visibleHeight)) break;
    // A terminal partial rung must retain the rail scale in both dimensions.
    const crop = visibleHeight === rungHeight ? ladderRung
      : { ...ladderRung, h: visibleHeight / scale };
    count += drawTiledMissionCropV87(ctx, image, crop,
      { x: left + RAIL_WIDTH, y: ladder.top + offset, w: innerWidth, h: visibleHeight });
  }
  return count;
}
