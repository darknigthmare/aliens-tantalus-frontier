import { TITLE_SCENE_READY_ASSETS_V79, TITLE_SCENE_READY_BY_ID_V79 } from './title-scene-assets-v79.js';

export const TITLE_SCENE_SCHEMA_V79 = 79;

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

const proceduralLayer = (id, role, depth, modes = ALL_MODES) => Object.freeze({
  id,
  role,
  depth,
  renderer: 'procedural',
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
    fallbackLayerId: asset.layerHint
  });
};

const SHARED_BITMAP_LAYERS_V79 = Object.freeze([
  bitmapLayer('space-01-deep-frontier', 1),
  bitmapLayer('stars-01-distant-field', 9),
  bitmapLayer('stars-02-near-sparks', 13, FULL_AND_REDUCED),
  bitmapLayer('nebula-01-cold-ion', 19),
  bitmapLayer('orbitals-01-tantalus-transport', 47),
  bitmapLayer('traffic-01-utility-shuttle', 59, FULL_ONLY),
  bitmapLayer('debris-01-wreck-field', 67),
  bitmapLayer('foreground-01-port-hull', 83),
  bitmapLayer('foreground-02-starboard-truss', 84, FULL_AND_REDUCED),
  bitmapLayer('vfx-01-ion-exhaust', 91, FULL_ONLY),
  bitmapLayer('vfx-03-scan-sweep', 93, FULL_AND_REDUCED)
]);

const PRESET_BITMAP_LAYERS_V79 = Object.freeze({
  'frontier-night': Object.freeze([
    bitmapLayer('planet-01-acheron', 31),
    bitmapLayer('atmosphere-02-acheron-storm', 35),
    bitmapLayer('clouds-01-acheron-storm', 39)
  ]),
  'storm-terminator': Object.freeze([
    bitmapLayer('planet-02-ceto-basin', 31),
    bitmapLayer('atmosphere-01-ceto-cyan', 35)
  ]),
  'ember-quarantine': Object.freeze([
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
  return { presetId, motionMode, seed };
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
      if (layer?.renderer === 'image' && !/^\/assets\/openai\/ui\/title\/v79\/[a-z0-9/_-]+\.(?:png|webp)$/u.test(layer.assetSrc || '')) {
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
  return Object.freeze([...new Set(presets.flatMap((entry) => entry.layers)
    .filter((layer) => layer.renderer === 'image' && typeof layer.assetSrc === 'string')
    .map((layer) => layer.assetSrc))]);
}

export function buildTitleSceneModelV79(save = {}, options = {}) {
  const preset = resolveTitleScenePresetV79(save);
  const mode = resolveTitleSceneModeV79(save, options);
  return Object.freeze({
    schema: TITLE_SCENE_SCHEMA_V79,
    presetId: preset.id,
    presetLabel: preset.label,
    tone: preset.tone,
    seed: titleSceneSeedV79(save),
    mode,
    layers: Object.freeze(preset.layers.filter((layer) => layer.modes.includes(mode))),
    fallback: TITLE_SCENE_FALLBACK_V79
  });
}

const validation = validateTitleSceneCatalogV79();
if (!validation.ok) throw new Error(`Catalogue scène titre V79 invalide : ${validation.failures.join(', ')}`);
const catalogAssets = new Set(getTitleSceneRuntimeAssetsV79());
if (TITLE_SCENE_READY_ASSETS_V79.some((asset) => !catalogAssets.has(asset.src))) {
  throw new Error('Un asset titre V79 accepté n’est relié à aucun preset runtime.');
}
