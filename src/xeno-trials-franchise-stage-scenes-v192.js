import { XENO_TRIALS_FRANCHISE_STAGES_V192 } from './xeno-trials-franchise-stages-v192.js';
import { XENO_TRIALS_ORIGINAL_ARENAS_V193 } from './xeno-trials-original-arenas-v193.js';
import { XENO_TRIALS_ICONIC_STAGES_V194 } from './xeno-trials-iconic-stages-v194.js';
import { XENO_TRIALS_REFERENCED_STAGES_V196 } from './xeno-trials-referenced-stages-v196.js';

// These schedules describe MIRE scenery. Their tick is
// supplied by the existing match; they own no simulation, clock or collider.
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const empty = Object.freeze([]);
export const XENO_TRIALS_FRANCHISE_STAGE_EVENT_KINDS_V192 = Object.freeze([
  'airlock-cycle', 'coolant-plume', 'reactor-conduit', 'freight-transit',
  'containment-scan', 'shuttle-approach', 'orbital-transit', 'storm-front',
  'rain-curtain', 'ash-drift', 'sand-drift', 'spore-drift', 'hive-movement',
  'bioluminescent-pulse', 'archive-scan', 'furnace-embers', 'ocean-swell',
  'snow-drift', 'searchlight-sweep', 'rail-transit', 'water-drip'
]);
const allowedKinds = new Set(XENO_TRIALS_FRANCHISE_STAGE_EVENT_KINDS_V192);
const stageSources = Object.freeze({
  192: 'fifty-franchise-stage-atlases-v192',
  193: 'original-tantalus-stage-atlases-v193',
  194: 'iconic-stage-compositions-v194',
  196: 'referenced-film-stage-compositions-v196'
});
export const usesXenoTrialsIndependentProps = revision => revision === 194 || revision === 196;
const layeredStages = [
  ...XENO_TRIALS_FRANCHISE_STAGES_V192,
  ...XENO_TRIALS_ORIGINAL_ARENAS_V193,
  ...XENO_TRIALS_ICONIC_STAGES_V194,
  ...XENO_TRIALS_REFERENCED_STAGES_V196
];
const stages = new Map(layeredStages.map(stage => [stage.id, stage]));
const profiles = new Map(layeredStages.map((stage, index) => {
  const config = stage.sceneV192 || {}, seed = Number.isSafeInteger(config.seed) && config.seed > 0 ? config.seed : index + 1;
  const anchors = [0, 1].map(n => clamp(finite(config.anchors?.[n], n ? .82 : .18), .08, .92));
  const kinds = [0, 1].map(n => allowedKinds.has(config.eventKinds?.[n]) ? config.eventKinds[n] : n ? 'archive-scan' : 'coolant-plume');
  const revision = stage.stageRevision ?? 192;
  const separateProps = usesXenoTrialsIndependentProps(revision);
  const profile = freeze({ stageId: stage.id, revision, replacesArena: true,
    architecture: typeof config.architecture === 'string' ? config.architecture : 'enclosed-bay',
    source: stageSources[revision] ?? stageSources[192], seed, accent: stage.accent, anchors,
    fixtureParallax: separateProps ? .68 : .48 + seed % 3 * .025,
    eventParallax: separateProps ? .20 : .13 + seed % 4 * .018,
    foregroundParallax: separateProps ? 1.18 : 1.15 + seed % 3 * .02,
    events: kinds.map((kind, n) => ({ id: `${stage.id}-rear-${n + 1}`, kind,
      periodTicks: 3400 + seed * 29 + n * 419, durationTicks: 1180 + seed % 5 * 85 + n * 110,
      offsetTicks: 110 + seed % 7 * 37 + n * 307, anchor: anchors[n],
      direction: (seed + n) % 2 ? -1 : 1, altitude: .22 + (seed + n) % 4 * .075,
      scale: .66 + (seed + n) % 3 * .13, affectsCombat: false })),
    canonExact: false, affectsCombat: false });
  return [stage.id, profile];
}));

export const getXenoTrialsFranchiseStageV192 = stageId => stages.get(stageId) || null;
export const getXenoTrialsFranchiseStageSceneV192 = stageId => profiles.get(stageId) || null;
export function getXenoTrialsFranchiseStageAssetsV192(stageId) {
  const stage = stages.get(stageId);
  if (!stage) return empty;
  const props = usesXenoTrialsIndependentProps(stage.stageRevision) && stage.propsV194?.path;
  return Object.freeze(props ? [stage.backdrop, props] : [stage.backdrop]);
}

function matchesTexture(texture, image) {
  return !!texture && /^[a-f0-9]{64}$/.test(texture.sha256 || '') && image?.complete !== false
    && Number.isSafeInteger(texture.width) && Number.isSafeInteger(texture.height)
    && texture.width > 0 && texture.height > 0
    && image?.naturalWidth === texture.width && image?.naturalHeight === texture.height;
}

function isTextureRect(rect, texture) {
  if (!Array.isArray(rect) || rect.length !== 4 || !rect.every(Number.isSafeInteger)) return false;
  const [x, y, width, height] = rect;
  return x >= 0 && y >= 0 && width > 0 && height > 0
    && x + width <= texture.width && y + height <= texture.height;
}

function makePlane(id, [sx, sy, sw, sh], path, hash, parallax, opacity) {
  return freeze({ id, sx, sy, sw, sh, parallax, opacity,
    plane: id === 'foreground' ? 'below-feet' : 'behind-fighters', path, expectedSourceSha256: hash });
}

/** V192/V193 use three crops from a single atlas. V194/V196 admit two base
 * crops and an independent transparent prop plate. Each decoded texture must
 * match the registered dimensions. SHA-256 describes the registered source. */
export function getXenoTrialsFranchiseStageAtlasPlanesV192(stageId, image, propsImage) {
  const stage = stages.get(stageId), atlas = stage?.atlasV192;
  if (!matchesTexture(atlas, image) || atlas.height < 3) return empty;
  const separateProps = usesXenoTrialsIndependentProps(stage.stageRevision);
  const cuts = [0, Math.floor(atlas.height / 3), Math.floor(atlas.height * 2 / 3), atlas.height];
  const rects = separateProps ? atlas.sourceRects
    : atlas.sourceRects || cuts.slice(0, 3).map((y, n) => [0, y, atlas.width, cuts[n + 1] - y]);
  if (!Array.isArray(rects) || rects.length !== (separateProps ? 2 : 3)
    || rects.some(rect => !isTextureRect(rect, atlas))
    || rects.some((rect, n) => n > 0 && rect[1] < rects[n - 1][1] + rects[n - 1][3])) return empty;
  if (separateProps) {
    const far = makePlane('far', rects[0], stage.backdrop, atlas.sha256, .065, 1);
    const foreground = makePlane('foreground', rects[1], stage.backdrop, atlas.sha256,
      profiles.get(stageId).foregroundParallax, 1);
    const props = stage.propsV194;
    if (!props?.path || props.path === stage.backdrop || !matchesTexture(props, propsImage)
      || !isTextureRect(props.rect, props)) return Object.freeze([far, foreground]);
    const middle = makePlane('middle', props.rect, props.path, props.sha256, .42, 1);
    return Object.freeze([far, freeze({ ...middle, separateProps: true }), foreground]);
  }
  const names = ['far', 'middle', 'foreground'], factors = [.035, .28, profiles.get(stageId).foregroundParallax];
  return Object.freeze(rects.map((rect, n) => makePlane(names[n], rect, stage.backdrop, atlas.sha256,
    factors[n], n === 1 ? .9 : 1)));
}

export function getXenoTrialsFranchiseStageViewV192(stageId, camera = {}, tick = 0, options = {}) {
  const profile = profiles.get(stageId); if (!profile) return null;
  const reducedMotion = options.reducedMotion === true, phase = options.phase || 'active';
  const renderTick = clamp(Math.floor(finite(tick, 0)), 0, Number.MAX_SAFE_INTEGER), motionTick = reducedMotion ? 0 : renderTick;
  const floor = clamp(finite(camera.floor, 450), 180, 530), offset = clamp(finite(camera.center, 500), -1e9, 1e9) - 500;
  return freeze({ stageId, revision: profile.revision, replacesArena: true, architecture: profile.architecture,
    renderTick, motionTick, reducedMotion, floor, fixtureOffsetX: -offset * profile.fixtureParallax,
    foregroundOffsetX: -offset * profile.foregroundParallax,
    rearClip: { x: 0, y: 0, width: 1000, height: floor },
    frontClip: { x: 0, y: floor + 8, width: 1000, height: 560 - floor - 8 },
    events: profile.events.map(event => {
      const local = (motionTick + event.offsetTicks) % event.periodTicks;
      const active = !reducedMotion && phase === 'active' && local < event.durationTicks;
      const progress = active ? local / event.durationTicks : 0;
      return { ...event, active, progress, renderTick,
        x: (event.direction > 0 ? -160 + progress * 1320 : 1160 - progress * 1320) - offset * profile.eventParallax,
        anchorX: event.anchor * 1000 - offset * profile.fixtureParallax,
        y: floor * event.altitude, affectsCombat: false };
    }), affectsCombat: false });
}
