import { resolveSpriteSheet, SPRITE_PIVOTS, SPRITE_CLIP_SETS } from './sprite-animation-runtime.js';
import { getEnemyDisplayPoseV110, getEnemyDisplayDimensionsV110, getEnemyDisplayStatureV110 } from './enemy-display-scale-v110.js';
import { ENEMY_DISPLAY_ALPHA_V110 } from './enemy-display-alpha-v110.js';

// A shared world-pixel scale, never a claim about canonical physical metres.
// Keep the renderer's rectangular dimensions and ground pivot; fitting each
// sheet independently to its card made a facehugger as large as a queen.
export function getCatalogGameplayScaleV72(visual, pixelsPerWorldPixel = 0.5, profileId = null) {
  const sheet = resolveSpriteSheet(visual?.sheetId);
  const pose = getEnemyDisplayPoseV110(visual), display = getEnemyDisplayDimensionsV110(pose);
  let width = Number(display?.width || sheet?.renderWidth || visual?.renderWidth);
  let height = Number(display?.height || sheet?.renderHeight || visual?.renderHeight);
  const scale = Number(pixelsPerWorldPixel);
  if (![width, height, scale].every((value) => Number.isFinite(value) && value > 0)) return null;
  const pivot = SPRITE_PIVOTS[sheet?.pivot];
  const measured = ENEMY_DISPLAY_ALPHA_V110[visual?.path];
  const cellWidth = pose?.sourceWidth || sheet?.cellWidth || visual?.grid?.cellWidth;
  const cellHeight = pose?.sourceHeight || sheet?.cellHeight || visual?.grid?.cellHeight;
  const frame = visual?.idleClip?.clip?.frames?.[0];
  const bounds = display?.alphaBounds || (measured?.frame === frame ? measured.bounds : null);
  const stature = !pose && profileId ? profileId === 'marine-reference'
    ? { height: 126 } : getEnemyDisplayStatureV110({ profileId }) : null;
  if (stature && bounds && cellHeight > 0) {
    const ratio = stature.height / (height * (bounds[3] - bounds[1]) / cellHeight);
    width *= ratio; height *= ratio;
  }
  const pivotY = display?.bottom ?? (bounds ? bounds[3] / cellHeight : pivot ? pivot.y / sheet.cellHeight : 1);
  const visibleWidth = bounds ? width * (bounds[2] - bounds[0]) / cellWidth : width;
  const visibleHeight = bounds ? height * (bounds[3] - bounds[1]) / cellHeight : height * pivotY;
  return Object.freeze({ width: width * scale, height: height * scale,
    groundOffset: height * scale * (1 - pivotY), worldWidth: width, worldHeight: height,
    worldVisibleWidth: visibleWidth, worldVisibleHeight: visibleHeight, alphaBounds: bounds,
    cellWidth, cellHeight, pivotY,
    pixelsPerWorldPixel: scale, source: 'runtime-render-dimensions-not-canon-metres' });
}

export function getCatalogMarineReferenceV72() {
  const sheet = resolveSpriteSheet('player.echo9-marine.locomotion');
  const clip = SPRITE_CLIP_SETS[sheet.clipSet].find((entry) => entry.id === 'idle');
  return { sheetId: sheet.id, path: sheet.path, grid: sheet,
    idleClip: { sheetId: sheet.id, clip }, previewClips: [] };
}

// One container-relative world unit drives every sprite and every ground pivot.
// Missing visuals reserve a labelled slot; they never receive a fabricated size.
export function getCatalogComparisonLayoutV72(visuals, profileIds = []) {
  const sizes = visuals.map((visual, index) => getCatalogGameplayScaleV72(visual, 1, profileIds[index]));
  const slots = sizes.map((size) => size?.worldVisibleWidth || 160);
  const totalWorldWidth = slots.reduce((sum, width) => sum + width, 0);
  const gapPixels = Math.max(0, slots.length - 1) * 8;
  return Object.freeze({
    sizes, slots, totalWorldWidth, gapPixels,
    aboveGround: Math.max(0, ...sizes.map((size) => size?.worldVisibleHeight || 0)),
    belowGround: 0,
    cssWorldUnit: totalWorldWidth
      ? `min(0.35px, max(0px, calc((100cqw - ${gapPixels}px) / ${totalWorldWidth})))`
      : '0px'
  });
}
