import { TITLE_SCENE_READY_ASSETS_V79, TITLE_SCENE_READY_BY_ID_V79, TITLE_RETIRED_ASSET_IDS_V87 } from './title-scene-assets-v79.js';

export const TITLE_SCENE_SCHEMA_V79 = 79;

// Presentation-only placements, chosen once per entrance without changing the save.
export const TITLE_SCENE_PLACEMENTS_V87 = Object.freeze(['starboard', 'center', 'port']);

export function chooseTitleScenePlacementV87(previous = null, random = Math.random) {
  const choices = TITLE_SCENE_PLACEMENTS_V87.filter(id => id !== previous);
  let sample = 0;
  try { sample = Number(random()); } catch { sample = 0; }
  if (!Number.isFinite(sample)) sample = 0;
  return choices[Math.floor(Math.max(0, Math.min(1 - Number.EPSILON, sample)) * choices.length)];
}

// The existing PNG paints an arc, not a fullscreen scanner. Read-only bright-ridge
// fit: 1600x900 source, centre (761,467), radius 320px. No image pixels are changed.
export const TITLE_PLANET_EFFECT_REGISTRATION_V87 = Object.freeze({
  'vfx-03-scan-sweep': Object.freeze({ x: 441, y: 147, size: 640, sourceWidth: 1600, sourceHeight: 900 })
});

export const TITLE_SCENE_MODES_V79 = Object.freeze({
  FULL: 'full',
  REDUCED: 'reduced',
  STATIC: 'static'
});

export const TITLE_SCENE_LAYER_ROLES_V79 = Object.freeze([
  'space',
  'stars',
  'nebula',
  'planet',
  'atmosphere',
  'clouds',
  'orbitals',
  'traffic',
  'debris',
  'foreground',
  'vfx'
]);

export const TITLE_SCENE_FALLBACK_V79 = Object.freeze({
  src: '/assets/openai/ui/title/tantalus-frontier-title-background-v61.png',
  alt: 'L’USS Tantalus survole une planète frontière ravagée',
  provenance: 'OpenAI ImageGen · V61'
});

const ALL_MODES = Object.freeze(Object.values(TITLE_SCENE_MODES_V79));
const FULL_AND_REDUCED = Object.freeze([TITLE_SCENE_MODES_V79.FULL, TITLE_SCENE_MODES_V79.REDUCED]);
const FULL_ONLY = Object.freeze([TITLE_SCENE_MODES_V79.FULL]);

export const TITLE_RETIRED_SHIP_ASSET_IDS_V87 = TITLE_RETIRED_ASSET_IDS_V87;
export const TITLE_SCENE_SHIP_MODELS_V87 = Object.freeze(Object.values(TITLE_SCENE_READY_BY_ID_V79)
  .filter(asset => asset.role === 'orbitals' && asset.status === 'ready' && !TITLE_RETIRED_SHIP_ASSET_IDS_V87.includes(asset.id)));
const DEFAULT_SHIP_BY_PRESET_V87 = Object.freeze({
  'frontier-night': 'orbitals-uss-sulaco-reference-v87',
  'storm-terminator': 'orbitals-uscss-nostromo-reference-v87',
  'ember-quarantine': 'orbitals-narcissus-reference-v87'
});
const defaultShipIdV87 = presetId => DEFAULT_SHIP_BY_PRESET_V87[presetId];
export function getTitleSceneShipOptionsV87() {
  return Object.freeze(TITLE_SCENE_SHIP_MODELS_V87.map(asset => Object.freeze({
    shipId: asset.shipId, assetId: asset.id, label: asset.label,
    canRename: Boolean(asset.namePlate), defaultShipName: asset.defaultShipName || null
  })));
}
export function sanitizeTitleShipNameV87(value) {
  if (typeof value !== 'string') return null;
  const name = value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toUpperCase();
  return /^[A-Z0-9][A-Z0-9 .'-]{0,23}$/.test(name) ? name : null;
}

const proceduralLayer = (id, role, depth, modes = ALL_MODES) => Object.freeze({
  id,
  role,
  depth,
  renderer: 'procedural',
  planetAnchor: ['planet', 'atmosphere', 'clouds'].includes(role) || id === 'sensor-sweep',
  modes
});

// Every role keeps an independent procedural safety layer. Accepted bitmaps
// are superimposed below and replace only their matching fallback on load.
const BASE_LAYERS_V79 = Object.freeze([
  proceduralLayer('deep-space', 'space', 0),
  proceduralLayer('stars-far', 'stars', 8),
  proceduralLayer('stars-near', 'stars', 12, FULL_AND_REDUCED),
  proceduralLayer('frontier-nebula', 'nebula', 18),
  proceduralLayer('frontier-world', 'planet', 30),
  proceduralLayer('terminator-glow', 'atmosphere', 34),
  proceduralLayer('storm-bands', 'clouds', 38),
  proceduralLayer('high-orbit', 'orbitals', 46),
  proceduralLayer('patrol-traffic', 'traffic', 54),
  proceduralLayer('near-traffic', 'traffic', 58, FULL_ONLY),
  proceduralLayer('orbital-debris', 'debris', 66),
  proceduralLayer('near-debris', 'debris', 70, FULL_AND_REDUCED),
  proceduralLayer('lens-foreground', 'foreground', 82),
  proceduralLayer('sensor-sweep', 'vfx', 90),
  proceduralLayer('ion-pulse', 'vfx', 92, FULL_ONLY)
]);

const bitmapLayer = (id, depth, modes = ALL_MODES) => {
  const asset = TITLE_SCENE_READY_BY_ID_V79[id];
  if (!asset || asset.status !== 'ready') throw new Error(`Asset titre V79 non accepté : ${id}`);
  return Object.freeze({
    id: `bitmap-${asset.id}`,
    role: asset.role,
    depth,
    renderer: 'image',
    modes,
    assetId: asset.id,
    runtimeId: asset.runtimeId,
    assetSrc: asset.src,
    sha256: asset.sha256,
    sphereRegistration: asset.sphereRegistration || TITLE_PLANET_EFFECT_REGISTRATION_V87[id],
    hullRegistration: asset.hullRegistration,
    namePlate: asset.namePlate,
    planetAnchor: ['planet', 'atmosphere', 'clouds'].includes(asset.role) || id === 'vfx-03-scan-sweep',
    fallbackLayerId: asset.layerHint
  });
};

const SHARED_BITMAP_LAYERS_V79 = Object.freeze([
  bitmapLayer('space-01-deep-frontier', 1),
  bitmapLayer('stars-01-distant-field', 9),
  bitmapLayer('stars-02-near-sparks', 13, FULL_AND_REDUCED),
  bitmapLayer('nebula-01-cold-ion', 19),
  bitmapLayer('debris-01-wreck-field', 67),
  bitmapLayer('foreground-01-port-hull', 83),
  bitmapLayer('foreground-02-starboard-truss', 84, FULL_AND_REDUCED),
  bitmapLayer('vfx-03-scan-sweep', 36, FULL_AND_REDUCED)
]);

const PRESET_BITMAP_LAYERS_V79 = Object.freeze({
  'frontier-night': Object.freeze([
    bitmapLayer(defaultShipIdV87('frontier-night'), 47),
    bitmapLayer('planet-01-acheron', 31),
    bitmapLayer('atmosphere-02-acheron-storm', 35),
    bitmapLayer('clouds-01-acheron-storm', 39)
  ]),
  'storm-terminator': Object.freeze([
    bitmapLayer(defaultShipIdV87('storm-terminator'), 47),
    bitmapLayer('planet-02-ceto-basin', 31),
    bitmapLayer('atmosphere-01-ceto-cyan', 35)
  ]),
  'ember-quarantine': Object.freeze([
    bitmapLayer(defaultShipIdV87('ember-quarantine'), 47),
    bitmapLayer('planet-03-mire-9', 31),
    bitmapLayer('atmosphere-03-mire-9', 35)
  ])
});

const preset = (id, label, tone) => Object.freeze({
  id,
  label,
  tone,
  layers: Object.freeze([...BASE_LAYERS_V79, ...SHARED_BITMAP_LAYERS_V79, ...PRESET_BITMAP_LAYERS_V79[id]])
});

export const TITLE_SCENE_PRESETS_V79 = Object.freeze([
  preset('frontier-night', 'Frontière nocturne', 'cyan'),
  preset('storm-terminator', 'Terminateur orageux', 'steel'),
  preset('ember-quarantine', 'Orbite de quarantaine', 'amber')
]);

export const TITLE_SCENE_WORLD_PRESETS_V79 = Object.freeze({
  'world-01-acheron-lv-426': 'frontier-night',
  'world-33-acheron-lv-426-prime': 'frontier-night',
  'world-10-ceto': 'storm-terminator',
  'world-42-ceto-reach': 'storm-terminator',
  'world-26-mire-9': 'ember-quarantine',
  'world-58-mire-9-reach': 'ember-quarantine'
});

export function sanitizeTitleScenePresentationV79(value = {}) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const presetId = TITLE_SCENE_PRESETS_V79.some((entry) => entry.id === source.presetId) ? source.presetId : null;
  const motionMode = ALL_MODES.includes(source.motionMode) ? source.motionMode : null;
  const seed = typeof source.seed === 'string' && source.seed.trim() ? source.seed.trim().slice(0, 80) : null;
  const ship = TITLE_SCENE_SHIP_MODELS_V87.find(asset => asset.shipId === source.shipId || asset.id === source.shipId);
  const shipId = ship?.shipId || null;
  const shipName = sanitizeTitleShipNameV87(source.shipName);
  return { presetId, motionMode, seed, ...(shipId ? { shipId } : {}), ...(shipName ? { shipName } : {}) };
}

const safeExplicitPreset = (save) => {
  const requested = save?.presentation?.titleScene?.presetId;
  return TITLE_SCENE_PRESETS_V79.find((entry) => entry.id === requested) || null;
};

export function hashTitleSceneSeedV79(value) {
  let hash = 2166136261;
  for (const character of String(value || 'tantalus')) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function titleSceneSeedV79(save = {}) {
  const explicitSeed = save?.presentation?.titleScene?.seed;
  if (typeof explicitSeed === 'string' && explicitSeed.trim()) return explicitSeed.trim();
  return [save.createdAt || 0, save.worldId || 'frontier', save.levelSeedId || 'level', save.campaignId || 'none'].join('|');
}

export function resolveTitleScenePresetV79(save = {}) {
  const explicit = safeExplicitPreset(save);
  if (explicit) return explicit;
  const worldPresetId = TITLE_SCENE_WORLD_PRESETS_V79[save?.worldId];
  const worldPreset = TITLE_SCENE_PRESETS_V79.find((entry) => entry.id === worldPresetId);
  if (worldPreset) return worldPreset;
  const profile = Number.isInteger(Number(save.profile)) ? Math.max(1, Number(save.profile)) : 1;
  const offset = (profile - 1) % TITLE_SCENE_PRESETS_V79.length;
  const index = (hashTitleSceneSeedV79(titleSceneSeedV79(save)) + offset) % TITLE_SCENE_PRESETS_V79.length;
  return TITLE_SCENE_PRESETS_V79[index];
}

export function resolveTitleSceneModeV79(save = {}, { prefersReducedMotion = false } = {}) {
  if (prefersReducedMotion || save?.settings?.reducedMotion) return TITLE_SCENE_MODES_V79.STATIC;
  const requested = save?.presentation?.titleScene?.motionMode;
  if (ALL_MODES.includes(requested)) return requested;
  return save?.settings?.quality === 'low' ? TITLE_SCENE_MODES_V79.REDUCED : TITLE_SCENE_MODES_V79.FULL;
}

export function validateTitleSceneCatalogV79(presets = TITLE_SCENE_PRESETS_V79) {
  const failures = [];
  const presetIds = new Set();
  for (const entry of presets) {
    if (!entry?.id || presetIds.has(entry.id)) failures.push(`preset:${entry?.id || 'missing'}`);
    presetIds.add(entry?.id);
    const layerIds = new Set();
    const roles = new Set();
    for (const layer of entry?.layers || []) {
      if (!layer?.id || layerIds.has(layer.id)) failures.push(`${entry.id}:layer:${layer?.id || 'missing'}`);
      layerIds.add(layer?.id);
      roles.add(layer?.role);
      if (!TITLE_SCENE_LAYER_ROLES_V79.includes(layer?.role)) failures.push(`${entry.id}:${layer?.id}:role`);
      if (!['procedural', 'image'].includes(layer?.renderer)) failures.push(`${entry.id}:${layer?.id}:renderer`);
      if (layer?.renderer === 'image' && !/^\/assets\/openai\/ui\/title\/v(?:79|87)\/[a-z0-9/_-]+\.(?:png|webp)$/u.test(layer.assetSrc || '')) {
        failures.push(`${entry.id}:${layer?.id}:asset`);
      }
      if (layer?.renderer === 'image' && (!layer.runtimeId || !layer.assetId || !layer.fallbackLayerId || !layer.sha256)) {
        failures.push(`${entry.id}:${layer?.id}:contract`);
      }
      if (!Array.isArray(layer?.modes) || !layer.modes.length || layer.modes.some((mode) => !ALL_MODES.includes(mode))) {
        failures.push(`${entry.id}:${layer?.id}:modes`);
      }
    }
    for (const role of TITLE_SCENE_LAYER_ROLES_V79) if (!roles.has(role)) failures.push(`${entry.id}:missing:${role}`);
  }
  return Object.freeze({ ok: failures.length === 0, failures: Object.freeze(failures) });
}

export function getTitleSceneRuntimeAssetsV79(presets = TITLE_SCENE_PRESETS_V79) {
  return Object.freeze([...new Set([...presets.flatMap((entry) => entry.layers)
    .filter((layer) => layer.renderer === 'image' && typeof layer.assetSrc === 'string')
    .map((layer) => layer.assetSrc), ...TITLE_SCENE_SHIP_MODELS_V87.map(asset => asset.src)])]);
}

export function buildTitleSceneModelV79(save = {}, options = {}) {
  const preset = resolveTitleScenePresetV79(save);
  const mode = resolveTitleSceneModeV79(save, options);
  const context = sanitizeTitleScenePresentationV79(save?.presentation?.titleScene);
  const shipAssetId = TITLE_SCENE_SHIP_MODELS_V87.find(asset => asset.shipId === context.shipId)?.id || defaultShipIdV87(preset.id);
  const shipAsset = TITLE_SCENE_READY_BY_ID_V79[shipAssetId];
  const shipId = shipAsset.shipId;
  const shipName = shipAsset.namePlate ? context.shipName || shipAsset.defaultShipName || 'TANTALUS' : null;
  // One real ship, never an extra silhouette/utility craft or a generic exhaust.
  const excluded = new Set(['high-orbit', 'patrol-traffic', 'near-traffic', 'ion-pulse']);
  const layers = preset.layers.filter(layer => layer.modes.includes(mode) && !excluded.has(layer.id))
    .map(layer => layer.renderer === 'image' && layer.role === 'orbitals'
      ? Object.freeze({ ...bitmapLayer(shipAssetId, layer.depth), shipName }) : layer);
  return Object.freeze({
    schema: TITLE_SCENE_SCHEMA_V79,
    placementId: TITLE_SCENE_PLACEMENTS_V87.includes(options.placementId) ? options.placementId : 'starboard',
    presetId: preset.id,
    presetLabel: preset.label,
    shipId,
    shipAssetId,
    shipName,
    tone: preset.tone,
    seed: titleSceneSeedV79(save),
    mode,
    layers: Object.freeze(layers),
    fallback: TITLE_SCENE_FALLBACK_V79
  });
}

const validation = validateTitleSceneCatalogV79();
if (!validation.ok) throw new Error(`Catalogue scène titre V79 invalide : ${validation.failures.join(', ')}`);
const catalogAssets = new Set(getTitleSceneRuntimeAssetsV79());
if (TITLE_SCENE_READY_ASSETS_V79.some((asset) => !TITLE_RETIRED_SHIP_ASSET_IDS_V87.includes(asset.id) && !catalogAssets.has(asset.src))) {
  throw new Error('Un asset titre V79 accepté n’est relié à aucun preset runtime.');
}
