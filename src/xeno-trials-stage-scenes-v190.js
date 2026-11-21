import { XENO_TRIALS_BOSS_STAGES_V179 } from './xeno-trials-boss-stages-v179.js';

// ARBITER's recovered settings are original Tantalus fiction, not documented
// franchise architecture. Forty existing image families stay byte-identical;
// four newly drawn corporate settings are admitted separately below.
const atlasRoot = '/assets/openai/stages/xeno-trials-v190/';
const corporate = [
  ['adjudication-vault', 'ARBITER / Chambre d’arbitrage', 'secured-cargo-atlas.png', '#131d22', '#cea96b', '#28343b', 'containment-transit', 'gallery-shutters', 'sealed-bay', [.18, .77]],
  ['specimen-transfer', 'ARBITER / Transit des spécimens', 'containment-rail-atlas.png', '#101b20', '#85bec1', '#25343b', 'containment-transit', 'inspection-drone', 'transfer-rail', [.14, .85]],
  ['executive-gallery', 'ARBITER / Galerie des mandataires', 'arbitration-gallery-atlas.png', '#171a20', '#c3b687', '#34343c', 'gallery-shutters', 'witness-transfer', 'observation-gallery', [.23, .80]],
  ['evidence-stack', 'ARBITER / Archives sous scellés', 'council-server-atlas.png', '#101b21', '#8bbeb0', '#273237', 'archival-pulse', 'inspection-drone', 'server-aisle', [.16, .73]]
];
export const XENO_TRIALS_CORPORATE_STAGES_V190 = Object.freeze(corporate.map(([slug, label, file, background, accent, floor]) => Object.freeze({
  id: `xt190-${slug}`, label, background, accent, floor, backdrop: atlasRoot + file,
  stageRevision: 190, assetStatus: 'new-project-layer-atlas',
  canonStatus: 'original-tantalus-arbiter-reconstruction', canonExact: false, affectsCombat: false
})));

// Each row selects architectural sightlines and two physically plausible rear
// activities for that setting. These are not forty additional illustrations.
const scenes = [
  ['ship-habitation', 'gallery-shutters', 'witness-transfer', 'window-row', [.16, .82]],
  ['ship-extraction', 'cargo-shuttle', 'service-gantry', 'airlock-apron', [.21, .77]],
  ['ship-engineering', 'coolant-vent', 'inspection-drone', 'pipe-gallery', [.14, .86]],
  ['ship-docking', 'cargo-shuttle', 'containment-transit', 'docking-span', [.20, .80]],
  ['planet-surface', 'storm-sweep', 'distant-traffic', 'ridge-outlook', [.12, .88]],
  ['planet-ruins', 'inspection-drone', 'storm-sweep', 'ruined-window', [.27, .76]],
  ['planet-ridge', 'distant-traffic', 'storm-sweep', 'cliff-outlook', [.18, .84]],
  ['planet-evac', 'cargo-shuttle', 'inspection-drone', 'landing-perimeter', [.23, .73]],
  ['planet-caves', 'resin-fall', 'coolant-vent', 'cave-breach', [.18, .75]],
  ['planet-approach', 'distant-traffic', 'storm-sweep', 'mesa-outlook', [.16, .79]],
  ['colony-utility', 'coolant-vent', 'service-gantry', 'utility-gallery', [.26, .88]],
  ['colony-security', 'gallery-shutters', 'inspection-drone', 'security-window', [.13, .78]],
  ['colony-landing', 'cargo-shuttle', 'distant-traffic', 'apron-window', [.22, .81]],
  ['colony-habitat', 'witness-transfer', 'gallery-shutters', 'abandoned-gallery', [.19, .72]],
  ['colony-civic', 'archival-pulse', 'gallery-shutters', 'civic-balcony', [.24, .84]],
  ['colony-approach', 'inspection-drone', 'storm-sweep', 'road-overlook', [.12, .79]],
  ['workshop', 'service-gantry', 'coolant-vent', 'workshop-rail', [.19, .87]],
  ['vehicle-bay', 'service-gantry', 'containment-transit', 'vehicle-rail', [.16, .76]],
  ['quarantine', 'containment-transit', 'gallery-shutters', 'sealed-window', [.25, .82]],
  ['armory', 'service-gantry', 'inspection-drone', 'secure-rack', [.15, .73]],
  ['quarters', 'gallery-shutters', 'witness-transfer', 'privacy-window', [.18, .84]],
  ['mess', 'witness-transfer', 'gallery-shutters', 'service-window', [.26, .78]],
  ['medical', 'gallery-shutters', 'archival-pulse', 'medical-window', [.21, .81]],
  ['laboratory', 'inspection-drone', 'containment-transit', 'laboratory-rail', [.13, .87]],
  ['sensors', 'archival-pulse', 'inspection-drone', 'sensor-array', [.20, .76]],
  ['reactor', 'coolant-vent', 'service-gantry', 'reactor-catwalk', [.14, .83]],
  ['life-support', 'coolant-vent', 'inspection-drone', 'filter-gallery', [.23, .86]],
  ['hangar', 'cargo-shuttle', 'service-gantry', 'hangar-span', [.15, .77]],
  ['cryo', 'archival-pulse', 'gallery-shutters', 'cryo-window', [.19, .81]],
  ['cic', 'archival-pulse', 'witness-transfer', 'command-window', [.24, .74]],
  ['briefing', 'gallery-shutters', 'archival-pulse', 'briefing-gallery', [.16, .88]],
  ['bridge', 'distant-traffic', 'archival-pulse', 'bridge-outlook', [.22, .79]],
  ['synthetic-bay', 'inspection-drone', 'service-gantry', 'synthetic-rail', [.14, .82]],
  ['proving-ground', 'containment-transit', 'witness-transfer', 'test-gallery', [.21, .85]],
  ['morgue', 'gallery-shutters', 'coolant-vent', 'morgue-window', [.18, .75]],
  ['archives', 'archival-pulse', 'inspection-drone', 'archive-aisle', [.25, .80]],
  ['logistics', 'containment-transit', 'service-gantry', 'freight-rail', [.13, .86]],
  ['escape-pods', 'cargo-shuttle', 'gallery-shutters', 'lifeboat-window', [.20, .78]],
  ['arrival', 'gallery-shutters', 'inspection-drone', 'arrival-window', [.17, .83]],
  ['bioforge', 'containment-transit', 'archival-pulse', 'specimen-gallery', [.24, .76]]
];

export const XENO_TRIALS_STAGE_EVENT_KINDS_V190 = Object.freeze([
  'containment-transit', 'inspection-drone', 'gallery-shutters', 'cargo-shuttle',
  'service-gantry', 'archival-pulse', 'coolant-vent', 'witness-transfer',
  'storm-sweep', 'distant-traffic', 'resin-fall'
]);
const makeScene = (stage, first, second, architecture, anchors, index, replacesArena) => Object.freeze({
  stageId: stage.id, revision: 190, architecture, replacesArena,
  source: replacesArena ? 'four-new-corporate-atlases' : 'forty-preserved-image-families',
  anchors: Object.freeze(anchors), seed: index + 1, accent: stage.accent,
  // Two extra depths surround the three image depths. The faster plane is
  // clipped below feet; rear fixtures and moving silhouettes precede fighters.
  fixtureParallax: .46 + index % 3 * .025, eventParallax: .14 + index % 4 * .018,
  foregroundParallax: 1.16 + index % 3 * .02,
  events: Object.freeze([first, second].map((kind, n) => Object.freeze({
    id: `${stage.id}-rear-${n + 1}`, kind, periodTicks: 3600 + index * 37 + n * 431,
    durationTicks: (replacesArena ? 1440 : 960) + index % 5 * 90 + n * 120,
    // Recovered corporate rooms start with a readable transfer/inspection;
    // the forty older locations keep their independent, less regular schedules.
    offsetTicks: replacesArena ? 90 + n * 180 + (index - 40) * 45
      : (index * 149 + n * 1731) % 3400, anchor: anchors[n],
    direction: (index + n) % 2 ? -1 : 1,
    altitude: .27 + (index + n) % 4 * .095,
    scale: .65 + (index + n) % 3 * .16
  }))),
  canonExact: false, affectsCombat: false
});
const historical = new Map(XENO_TRIALS_BOSS_STAGES_V179.map(stage => [stage.id, stage]));
export const XENO_TRIALS_STAGE_ENRICHMENTS_V190 = Object.freeze(scenes.map(([slug, first, second, architecture, anchors], index) =>
  makeScene(historical.get(`xt179-${slug}`), first, second, architecture, anchors, index, false)));
const corporateScenes = corporate.map(([, , , , , , first, second, architecture, anchors], index) =>
  makeScene(XENO_TRIALS_CORPORATE_STAGES_V190[index], first, second, architecture, anchors, index + 40, true));
const profiles = new Map([...XENO_TRIALS_STAGE_ENRICHMENTS_V190, ...corporateScenes].map(profile => [profile.stageId, profile]));
const corporateStages = new Map(XENO_TRIALS_CORPORATE_STAGES_V190.map(stage => [stage.id, stage]));
const empty = Object.freeze([]);
export const getXenoTrialsStageSceneV190 = stageId => profiles.get(stageId) || null;
export const getXenoTrialsCorporateStageV190 = stageId => corporateStages.get(stageId) || null;
export const getXenoTrialsStageAssetsV190 = stageId => corporateStages.has(stageId)
  ? Object.freeze([corporateStages.get(stageId).backdrop]) : empty;

// A source rectangle selects a generated image plane; it never edits pixels.
export function getXenoTrialsStageAtlasPlanesV190(stageId, image) {
  if (!corporateStages.has(stageId) || !Number.isFinite(image?.naturalWidth) || !Number.isFinite(image?.naturalHeight)
    || image.naturalWidth <= 0 || image.naturalHeight <= 0) return empty;
  const width = image.naturalWidth, height = image.naturalHeight / 3;
  return Object.freeze([
    Object.freeze({ id: 'far', sx: 0, sy: 0, sw: width, sh: height, parallax: .035, opacity: 1, plane: 'behind-fighters' }),
    Object.freeze({ id: 'middle', sx: 0, sy: height, sw: width, sh: height, parallax: .265, opacity: .86, plane: 'behind-fighters' }),
    Object.freeze({ id: 'foreground', sx: 0, sy: height * 2, sw: width, sh: height, parallax: 1.18, opacity: .75, plane: 'below-feet' })
  ]);
}

const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
export function getXenoTrialsStageViewV190(stageId, camera = {}, tick = 0, options = {}) {
  const profile = profiles.get(stageId);
  if (!profile) return null;
  const reducedMotion = options.reducedMotion === true;
  const safeTick = reducedMotion ? 0 : clamp(Math.floor(finite(tick, 0)), 0, Number.MAX_SAFE_INTEGER);
  const offset = finite(camera.center, 500) - 500, floor = clamp(finite(camera.floor, 450), 180, 530);
  const phase = ['intro', 'round-over', 'match-over'].includes(options.phase) ? options.phase : 'active';
  return Object.freeze({ stageId, revision: 190, replacesArena: profile.replacesArena, architecture: profile.architecture,
    time: safeTick / 120, reducedMotion, phase, floor,
    fixtureOffsetX: -offset * profile.fixtureParallax,
    foregroundOffsetX: -offset * profile.foregroundParallax,
    rearClip: Object.freeze({ x: 0, y: 0, width: 1000, height: floor }),
    frontClip: Object.freeze({ x: 0, y: floor + 8, width: 1000, height: 560 - floor - 8 }),
    events: Object.freeze(profile.events.map(event => {
      const local = (safeTick + event.offsetTicks) % event.periodTicks;
      const active = !reducedMotion && phase === 'active' && local < event.durationTicks;
      const progress = active ? local / event.durationTicks : 0;
      return Object.freeze({ ...event, active, progress,
        x: (event.direction > 0 ? -140 + progress * 1280 : 1140 - progress * 1280) - offset * profile.eventParallax,
        anchorX: event.anchor * 1000 - offset * profile.fixtureParallax,
        y: floor * event.altitude, affectsCombat: false });
    })), affectsCombat: false });
}
