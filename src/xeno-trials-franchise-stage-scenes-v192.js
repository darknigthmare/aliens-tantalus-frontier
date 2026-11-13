import { XENO_TRIALS_FRANCHISE_STAGES_V192 } from './xeno-trials-franchise-stages-v192.js';

// These schedules only describe the recovered MIRE scenery. Their tick is
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
const stages = new Map(XENO_TRIALS_FRANCHISE_STAGES_V192.map(stage => [stage.id, stage]));
const profiles = new Map(XENO_TRIALS_FRANCHISE_STAGES_V192.map((stage, index) => {
  const config = stage.sceneV192 || {}, seed = Number.isSafeInteger(config.seed) && config.seed > 0 ? config.seed : index + 1;
  const anchors = [0, 1].map(n => clamp(finite(config.anchors?.[n], n ? .82 : .18), .08, .92));
  const kinds = [0, 1].map(n => allowedKinds.has(config.eventKinds?.[n]) ? config.eventKinds[n] : n ? 'archive-scan' : 'coolant-plume');
  const profile = freeze({ stageId: stage.id, revision: 192, replacesArena: true,
    architecture: typeof config.architecture === 'string' ? config.architecture : 'enclosed-bay',
    source: 'fifty-franchise-stage-atlases-v192', seed, accent: stage.accent, anchors,
    fixtureParallax: .48 + seed % 3 * .025, eventParallax: .13 + seed % 4 * .018,
    foregroundParallax: 1.15 + seed % 3 * .02,
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
export const getXenoTrialsFranchiseStageAssetsV192 = stageId => stages.has(stageId)
  ? Object.freeze([stages.get(stageId).backdrop]) : empty;

/** Three explicit source crops; no image pixels are resized, rewritten or
 * composited here. A decoded image must have the exact admitted dimensions.
 * sha256 is expected provenance from the source registry, not a claim that a
 * synchronous Canvas draw has independently hashed a browser Image. */
export function getXenoTrialsFranchiseStageAtlasPlanesV192(stageId, image) {
  const stage = stages.get(stageId), atlas = stage?.atlasV192;
  if (!atlas || !/^[a-f0-9]{64}$/.test(atlas.sha256 || '') || image?.complete === false
    || !(image?.naturalWidth > 0) || !(image?.naturalHeight > 0)
    || image.naturalWidth !== atlas.width || image.naturalHeight !== atlas.height
    || !Number.isSafeInteger(atlas.width) || !Number.isSafeInteger(atlas.height) || atlas.height < 3) return empty;
  const cuts = [0, Math.floor(atlas.height / 3), Math.floor(atlas.height * 2 / 3), atlas.height];
  const rects = atlas.sourceRects || cuts.slice(0, 3).map((y, n) => [0, y, atlas.width, cuts[n + 1] - y]);
  if (!Array.isArray(rects) || rects.length !== 3 || rects.some(rect => !Array.isArray(rect) || rect.length !== 4
    || !rect.every(Number.isSafeInteger) || rect[0] < 0 || rect[1] < 0 || rect[2] <= 0 || rect[3] <= 0
    || rect[0] + rect[2] > atlas.width || rect[1] + rect[3] > atlas.height)
    || rects.some((rect, n) => n > 0 && rect[1] < rects[n - 1][1] + rects[n - 1][3])) return empty;
  const names = ['far', 'middle', 'foreground'], factors = [.035, .28, profiles.get(stageId).foregroundParallax];
  return Object.freeze(rects.map(([sx, sy, sw, sh], n) => freeze({ id: names[n], sx, sy, sw, sh,
    parallax: factors[n], opacity: n === 1 ? .9 : 1, plane: n === 2 ? 'below-feet' : 'behind-fighters',
    path: stage.backdrop, expectedSourceSha256: atlas.sha256 })));
}

export function getXenoTrialsFranchiseStageViewV192(stageId, camera = {}, tick = 0, options = {}) {
  const profile = profiles.get(stageId); if (!profile) return null;
  const reducedMotion = options.reducedMotion === true, phase = options.phase || 'active';
  const renderTick = clamp(Math.floor(finite(tick, 0)), 0, Number.MAX_SAFE_INTEGER), motionTick = reducedMotion ? 0 : renderTick;
  const floor = clamp(finite(camera.floor, 450), 180, 530), offset = clamp(finite(camera.center, 500), -1e9, 1e9) - 500;
  return freeze({ stageId, revision: 192, replacesArena: true, architecture: profile.architecture,
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
