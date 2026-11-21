import { XENO_TRIALS_BOSS_STAGES_V179 } from './xeno-trials-boss-stages-v179.js';

/** The forty existing project scenery families each provide their own far,
 * middle and foreground image. They remain Tantalus simulation adaptations,
 * with no claim of canonical architecture or new illustration production.
 * All coordinates below are presentation pixels, never combat world geometry.
 */
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;
const sibling = (path, layer) => path.endsWith('/far.webp')
  ? path.replace(/\/far\.webp$/, `/${layer}.webp`) : path.replace(/-far\.png$/, `-${layer}.png`);
const theme = stage => stage.id.includes('planet-') ? stage.id.includes('caves') ? 'spores' : 'dust'
  : stage.id.includes('colony-') ? 'mist'
    : ['reactor-ring', 'containment-deck'].includes(stage.motionBaseStageId) ? 'vapor'
      : stage.motionBaseStageId === 'hive-vault' ? 'spores' : 'condensation';

export const XENO_TRIALS_STAGE_DEPTH_V180 = Object.freeze(XENO_TRIALS_BOSS_STAGES_V179.map((stage, index) => {
  const layers = Object.freeze([
    Object.freeze({ id: 'far', path: stage.backdrop, parallax: .035, opacity: 1, plane: 'behind-fighters' }),
    Object.freeze({ id: 'middle', path: sibling(stage.backdrop, 'mid'), parallax: .24 + index % 3 * .025,
      opacity: stage.id.includes('planet-') ? .82 : .72, plane: 'behind-fighters' }),
    Object.freeze({ id: 'foreground', path: sibling(stage.backdrop, 'foreground'), parallax: 1.08 + index % 4 * .025,
      opacity: .78, plane: 'below-feet' })
  ]);
  return Object.freeze({ stageId: stage.id, revision: 180, layers,
    assets: Object.freeze(layers.map(layer => layer.path)),
    atmosphere: theme(stage), atmosphereSeed: index + 1, lightColor: stage.accent,
    lightAnchors: Object.freeze(index % 2 ? [.12, .76] : [.22, .88]),
    canonExact: false, assetStatus: 'existing-project-layer-family', affectsCombat: false });
}));
const depths = new Map(XENO_TRIALS_STAGE_DEPTH_V180.map(depth => [depth.stageId, depth]));
const empty = Object.freeze([]);
export function getXenoTrialsStageDepthV180(stageId) { return depths.get(stageId) || null; }
export function getXenoTrialsStageAssetsV180(stageId) { return depths.get(stageId)?.assets || empty; }

/** Diagnostic view also used by the renderer. No independent clock, randomness
 * or state accumulation: pause and reduced motion are driven by the runtime.
 */
export function getXenoTrialsStageDepthViewV180(stageId, camera = {}, tick = 0, options = {}) {
  const depth = getXenoTrialsStageDepthV180(stageId);
  if (!depth) return null;
  const floor = clamp(finite(camera.floor, 450), 180, 530), offset = finite(camera.center, 500) - 500;
  const reducedMotion = options.reducedMotion === true;
  const time = reducedMotion ? 0 : Math.max(0, finite(tick, 0)) / 120;
  const phase = ['intro', 'round-over', 'match-over'].includes(options.phase) ? options.phase : 'active';
  const phaseProgress = phase === 'round-over' && !reducedMotion
    ? clamp(1 - finite(options.phaseTime, 1.8) / 1.8, 0, 1) : 1;
  const lightLevel = phase === 'intro' ? .16 : phase === 'round-over' ? .12 + phaseProgress * .05
    : phase === 'match-over' ? .19 : .10;
  return Object.freeze({ stageId, floor, time, phase, phaseProgress, reducedMotion,
    lightLevel, atmosphere: depth.atmosphere, affectsCombat: false,
    foregroundClip: Object.freeze({ x: 0, y: floor + 8, width: 1000, height: Math.max(0, 560 - floor - 8) }),
    layers: Object.freeze(depth.layers.map(layer => Object.freeze({ ...layer, offsetX: -offset * layer.parallax }))) });
}

/** Keep image aspect ratio and tile complete image planes as the camera pans.
 * Tiling is bounded to the viewport; there is no growing world-sized canvas.
 */
export function getXenoTrialsStageLayerLayoutV180(layer, image, camera = {}) {
  if (!layer || !Number.isFinite(image?.naturalWidth) || !Number.isFinite(image?.naturalHeight)
    || !(image.naturalWidth > 0) || !(image.naturalHeight > 0)) return null;
  const floor = clamp(finite(camera.floor, 450), 180, 530);
  const factor = Math.max(1160 / image.naturalWidth, (layer.id === 'foreground' ? 560 : floor) / image.naturalHeight);
  const width = image.naturalWidth * factor, height = image.naturalHeight * factor;
  const offset = (finite(camera.center, 500) - 500) * layer.parallax;
  const origin = (1000 - width) / 2 - offset;
  const start = ((origin % width) + width) % width - width;
  const tiles = [];
  for (let x = start; x < 1000; x += width) tiles.push(x);
  return Object.freeze({ width, height, y: (layer.id === 'foreground' ? 560 : floor) - height,
    tiles: Object.freeze(tiles), aspectRatio: image.naturalWidth / image.naturalHeight });
}

function paintLayer(ctx, layer, images, camera) {
  const image = images?.get?.(layer.path), layout = getXenoTrialsStageLayerLayoutV180(layer, image, camera);
  if (!layout) return false;
  ctx.globalAlpha = layer.opacity;
  for (const x of layout.tiles) ctx.drawImage(image, x, layout.y, layout.width, layout.height);
  return true;
}

/** Rear layers are clipped above the physical contact line and painted before
 * bodies; even an opaque middle image cannot occlude a combatant.
 */
export function drawXenoTrialsStageDepthRearV180(ctx, stage, images, camera, tick = 0, options = {}) {
  const depth = getXenoTrialsStageDepthV180(stage.id), view = getXenoTrialsStageDepthViewV180(stage.id, camera, tick, options);
  if (!depth || !view) return null;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1000, view.floor); ctx.clip();
  for (const layer of depth.layers) if (layer.plane === 'behind-fighters') paintLayer(ctx, layer, images, camera);
  // Slow localized rear light pools. They never flash the viewport or change
  // fighter colours; terminal/round phases use the same bounded fixtures.
  for (const [index, anchor] of depth.lightAnchors.entries()) {
    const x = anchor * 1000 - (finite(camera.center, 500) - 500) * .12;
    const y = view.floor * .25, radius = view.floor * .56;
    const gradient = ctx.createRadialGradient?.(x, y, 0, x, y, radius);
    gradient?.addColorStop?.(0, depth.lightColor); gradient?.addColorStop?.(1, '#00000000');
    ctx.fillStyle = gradient || depth.lightColor;
    ctx.globalAlpha = view.lightLevel * (.85 + .15 * Math.sin(view.time * .35 + index + depth.atmosphereSeed));
    ctx.beginPath(); ctx.ellipse(x, y, radius, radius * .72, 0, 0, Math.PI * 2); ctx.fill();
  }
  // Vapor/mist/spores are rear-plane details rather than attack or hazard art.
  const vapor = ['vapor', 'mist', 'condensation'].includes(depth.atmosphere);
  const count = vapor ? 5 : 14;
  ctx.fillStyle = stage.accent;
  for (let i = 0; i < count; i++) {
    const drift = view.time * (vapor ? 9 : 18), seed = depth.atmosphereSeed;
    const x = ((i * 227 + seed * 37 + drift - (finite(camera.center, 500) - 500) * .52) % 1160 + 1160) % 1160 - 80;
    const y = view.floor * (vapor ? .78 : .23) + ((i * 31 + seed * 7) % Math.max(1, view.floor * (vapor ? .1 : .55)));
    ctx.globalAlpha = vapor ? .035 + view.lightLevel * .11 : .09;
    if (vapor) { ctx.beginPath(); ctx.ellipse(x, y - Math.sin(view.time * .4 + i) * 6, 68 + i * 8, 12 + i % 3 * 4, -.1, 0, Math.PI * 2); ctx.fill(); }
    else ctx.fillRect(x, y, depth.atmosphere === 'dust' ? 4 : 2, 2);
  }
  ctx.restore(); return view;
}

/** A real foreground image plane at a faster camera depth, restricted below
 * every grounded fighter's contact line. It cannot cover bodies or low shots.
 */
export function drawXenoTrialsStageDepthFrontV180(ctx, stage, images, camera, tick = 0, options = {}) {
  const depth = getXenoTrialsStageDepthV180(stage.id), view = getXenoTrialsStageDepthViewV180(stage.id, camera, tick, options);
  if (!depth || !view) return null;
  const clip = view.foregroundClip;
  ctx.save(); ctx.beginPath(); ctx.rect(clip.x, clip.y, clip.width, clip.height); ctx.clip();
  paintLayer(ctx, depth.layers[2], images, camera);
  ctx.restore(); return view;
}
