import { resolveSpriteSheet, SPRITE_PIVOTS, SPRITE_CLIP_SETS } from './sprite-animation-runtime.js';

// A shared world-pixel scale, never a claim about canonical physical metres.
// Keep the renderer's rectangular dimensions and ground pivot; fitting each
// sheet independently to its card made a facehugger as large as a queen.
export function getCatalogGameplayScaleV72(visual, pixelsPerWorldPixel = 0.5) {
  const sheet = resolveSpriteSheet(visual?.sheetId);
  const width = Number(sheet?.renderWidth || visual?.renderWidth);
  const height = Number(sheet?.renderHeight || visual?.renderHeight);
  const scale = Number(pixelsPerWorldPixel);
  if (![width, height, scale].every((value) => Number.isFinite(value) && value > 0)) return null;
  const pivot = SPRITE_PIVOTS[sheet?.pivot];
  const pivotY = pivot ? pivot.y / sheet.cellHeight : 1;
  return Object.freeze({ width: width * scale, height: height * scale,
    groundOffset: height * scale * (1 - pivotY), worldWidth: width, worldHeight: height,
    pixelsPerWorldPixel: scale, source: 'runtime-render-dimensions-not-canon-metres' });
}

export function getCatalogMarineReferenceV72() {
  const sheet = resolveSpriteSheet('player.echo9-marine.locomotion');
  const clip = SPRITE_CLIP_SETS[sheet.clipSet].find((entry) => entry.id === 'idle');
  return { sheetId: sheet.id, path: sheet.path, grid: sheet,
    idleClip: { sheetId: sheet.id, clip }, previewClips: [] };
}
