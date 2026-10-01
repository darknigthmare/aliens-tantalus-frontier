import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { XENO_TRIALS_ARENA_V105, getXenoTrialsGeometryV105 } from './xeno-trials-geometry-v105.js';
import { getEnemyDisplayDimensionsV110 } from './enemy-display-scale-v110.js';
import { getEnemyImportAnimationV107 } from './enemy-import-animation-v107.js';
import { getEnemyImportAttackV109 } from './enemy-import-attacks-v109.js';

/** One camera factor for BOTH combatants, fixed for the duel. Never independently
 * cap a Queen to the height of a human. Physics boxes remain V105 authored boxes;
 * the common view can recede, but idle bodies cannot grow through their fronts. */
export function getXenoTrialsDisplayScaleV110(fighters) {
  let zoom = 1.5;
  for (const fighter of fighters || []) {
    const definition = getXenoTrialsFighterV96(fighter.id), art = getXenoTrialsArtV96(fighter.id, fighter.variant);
    const size = getEnemyDisplayDimensionsV110(art), body = getXenoTrialsGeometryV105(fighter.id, fighter.variant);
    if (!definition || !size || !body) continue;
    const b = size.alphaBounds, root = size.pivotX * art.sourceWidth, nativeScale = size.width / art.sourceWidth;
    const front = (size.sourceFacing > 0 ? b[2] - root : root - b[0]) * nativeScale;
    const extent = Math.max(Math.abs(b[0] - root), Math.abs(b[2] - root)) * nativeScale;
    const ceiling = 450 - definition.jump ** 2 / (2 * 1450) - 112;
    zoom = Math.min(zoom, ceiling / size.visibleHeight,
      (XENO_TRIALS_ARENA_V105.left - 2) / extent, front > 0 ? body.front / front : zoom);
    // Optional native animation sheets use the same stature. Reserve their
    // widest frame now so loading/attacking never changes a unit's scale.
    for (const animation of [getEnemyImportAnimationV107(art), getEnemyImportAttackV109(art)].filter(Boolean)) {
      const animatedExtent = Math.max(...animation.frames.map(frame => Math.max(
        Math.abs(frame.alphaBounds[0] - frame.pivot.x * frame.rect[2]),
        Math.abs(frame.alphaBounds[2] - frame.pivot.x * frame.rect[2])))) * size.visibleHeight / animation.referenceHeight;
      zoom = Math.min(zoom, (XENO_TRIALS_ARENA_V105.left - 2) / animatedExtent);
    }
  }
  return Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
}

export function getXenoTrialsRenderMetricsV110(id, variant = null, zoom = 1) {
  const size = getEnemyDisplayDimensionsV110(getXenoTrialsArtV96(id, variant));
  if (!size || !Number.isFinite(zoom) || zoom <= 0) return null;
  return { ...size, width: size.width * zoom, height: size.height * zoom,
    visibleHeight: size.visibleHeight * zoom, visibleWidth: size.visibleWidth * zoom, zoom };
}
