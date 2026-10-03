import { getXenoTrialsPhysicalScaleV119 } from './xeno-trials-physical-scale-v119.js';
import { getXenoTrialsArtV96 } from './xeno-trials-data-v96.js';
import { getEnemyImportAnimationV107 } from './enemy-import-animation-v107.js';
import { getEnemyImportAttackV109 } from './enemy-import-attacks-v109.js';

/** Historical API: world-space factor shared by both units. Only camera fitting
 * changes the viewport scale; there is no per-fighter silhouette cap. */
export function getXenoTrialsDisplayScaleV110() { return 1; }
export function getXenoTrialsRenderMetricsV110(id, variant = null, zoom = 1) {
  const size = getXenoTrialsPhysicalScaleV119(id, variant);
  if (!size || !Number.isFinite(zoom) || zoom <= 0) return null;
  return { ...size, width: size.width * zoom, height: size.height * zoom,
    visibleHeight: size.visibleHeight * zoom, visibleWidth: size.visibleWidth * zoom, zoom };
}

export function getXenoTrialsVisualEnvelopeV119(fighter) {
  const metrics = getXenoTrialsPhysicalScaleV119(fighter.id, fighter.variant), art = getXenoTrialsArtV96(fighter.id, fighter.variant);
  if (!metrics || !art) return null;
  const root = metrics.pivotX * art.sourceWidth, factor = metrics.width / art.sourceWidth;
  const sourceLeft = (metrics.alphaBounds[0] - root) * factor, sourceRight = (metrics.alphaBounds[2] - root) * factor;
  const flip = fighter.facing === metrics.sourceFacing ? 1 : -1;
  let left = Math.min(sourceLeft * flip, sourceRight * flip), right = Math.max(sourceLeft * flip, sourceRight * flip);
  let visibleHeight = metrics.visibleHeight;
  for (const animation of [getEnemyImportAnimationV107(art), getEnemyImportAttackV109(art)].filter(Boolean)) {
    const extent = Math.max(...animation.frames.map(frame => Math.max(Math.abs(frame.alphaBounds[0] - frame.pivot.x * frame.rect[2]),
      Math.abs(frame.alphaBounds[2] - frame.pivot.x * frame.rect[2])))) * metrics.visibleHeight / animation.referenceHeight;
    left = Math.min(left, -extent); right = Math.max(right, extent);
    visibleHeight = Math.max(visibleHeight, ...animation.frames.map(frame =>
      (frame.alphaBounds[3] - frame.alphaBounds[1]) * metrics.visibleHeight / animation.referenceHeight));
  }
  return { left: fighter.x + left, right: fighter.x + right, top: fighter.y + visibleHeight, bottom: fighter.y };
}

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
/** Read-only, damped two-target camera. Height, jumps, tails and native frames
 * are included. It never mutates a fighter, hitbox, physics tick or save. */
export function createXenoTrialsCameraV119(fighters, viewport = { width: 1000, height: 560 }) {
  const camera = { center: 500, zoom: 1, floor: viewport.height * .81, initialized: false, previousCenter: null };
  const update = (values, dt = 0) => {
    const envelopes = values.map(getXenoTrialsVisualEnvelopeV119).filter(Boolean);
    if (!envelopes.length) return { ...camera };
    const left = Math.min(...envelopes.map(e => e.left)) - 70, right = Math.max(...envelopes.map(e => e.right)) + 70;
    const highest = Math.max(...envelopes.map(e => e.top)) + 40;
    const center = (left + right) / 2;
    const velocity = dt > 0 && camera.previousCenter !== null ? clamp((center - camera.previousCenter) / dt, -150, 150) : 0;
    camera.previousCenter = center;
    const targetCenter = center + velocity * .1;
    const targetZoom = clamp(Math.min((viewport.width - 40) / (right - left), (camera.floor - 115) / highest), .08, 1.65);
    if (!camera.initialized) { camera.center = targetCenter; camera.zoom = targetZoom; camera.initialized = true; }
    else if (dt > 0) {
      const damping = 1 - Math.exp(-dt * 4);
      if (Math.abs(targetCenter - camera.center) * camera.zoom > 20) camera.center += (targetCenter - camera.center) * damping;
      if (Math.abs(targetZoom - camera.zoom) > .025) camera.zoom += clamp((targetZoom - camera.zoom) * damping, -dt * .75, dt * .35);
    }
    // Real clipping can force retreat even for the synchronous dt=0 render
    // after a manual round reset. Zoom-in/ordinary tracking remain damped; the
    // safety envelope must not wait for the next RAF to fit both silhouettes.
    const horizontalExtent = Math.max(Math.abs(left - camera.center), Math.abs(right - camera.center));
    camera.zoom = Math.min(camera.zoom, (camera.floor - 100) / highest,
      (viewport.width / 2 - 20) / horizontalExtent);
    return { ...camera, translateX: viewport.width / 2 - camera.center * camera.zoom,
      translateY: camera.floor - 450 * camera.zoom, pixelsPerMeter: 90 * camera.zoom };
  };
  update(fighters);
  return Object.freeze({ update, getState: () => update(fighters) });
}
