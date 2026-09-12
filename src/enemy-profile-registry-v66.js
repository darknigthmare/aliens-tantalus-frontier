import { ENEMIES } from './content-core-v50.js';
import { V66_READY_ENEMY_PROFILE_ASSETS } from './enemy-profile-assets-v66.js';
import { V81_READY_ENEMY_PROFILE_ASSETS } from './enemy-profile-assets-v81.js';

const READY_ENEMY_PROFILE_ASSETS = Object.freeze([
  ...V66_READY_ENEMY_PROFILE_ASSETS,
  ...V81_READY_ENEMY_PROFILE_ASSETS
]);

const gridForClips = (count) => Object.freeze({ columns: 4, rows: count * 2, cellWidth: 256, cellHeight: 256 });
const actionGrid = gridForClips(4);
const extendedGrid = gridForClips(5);
export const V66_ENEMY_ANIMATION_LAYOUTS = Object.freeze({
  'enemy-action-v66': actionGrid,
  'ovomorph-cycle-v66': actionGrid,
  'royal-action-v66': extendedGrid,
  'armed-action-v66': extendedGrid,
  'synthetic-action-v66': extendedGrid,
  'siege-action-v66': extendedGrid,
  'carrier-action-v66': extendedGrid,
  'controller-action-v66': extendedGrid,
});
const clean = (value) => String(value ?? '').trim();
const strings = (values) => Object.freeze((Array.isArray(values) ? values : []).map(clean));

function catalogProfile(source, index) {
  const profileId = clean(source?.id);
  const name = clean(source?.name);
  if (!/^enemy-\d{3}-[a-z0-9-]+$/.test(profileId) || !name) throw new Error(`Invalid V66 enemy identity at index ${index}.`);
  const modifier = clean(source.modifier || 'Standard');
  const prefix = modifier === 'Standard' ? '' : `${modifier} `;
  return Object.freeze({ schema: 66, profileId, name,
    archetype: prefix && name.startsWith(prefix) ? name.slice(prefix.length) : name,
    modifier, biology: clean(source.biology || 'unknown'), caste: clean(source.caste), behavior: clean(source.behavior),
    provenance: clean(source.provenance || 'unknown'), encounterWorldIds: strings(source.encounterWorldIds), habitats: strings(source.habitats) });
}

function readyAsset(source, profile) {
  const wave = clean(source.wave || 'v66');
  if (!['v66', 'v81'].includes(wave)) throw new Error(`Unsupported enemy profile asset wave: ${wave}`);
  for (const key of ['path', 'spriteKey', 'pivot', 'hitbox', 'identityStatus', 'referenceStatus', 'promptId']) {
    if (!clean(source[key])) throw new Error(`${wave.toUpperCase()} ${profile.profileId}: ${key} is required.`);
  }
  if (source.path !== `/assets/openai/sprites/normalized/enemy-profiles-${wave}/${profile.profileId}.webp`) throw new Error(`${wave.toUpperCase()} ${profile.profileId}: atlas path must belong to this exact profile.`);
  if (source.identityVerified !== true || source.reviewStatus !== 'accepted') throw new Error(`V66 ${profile.profileId}: explicit accepted identity review is required.`);
  if (source.canonExact === true) throw new Error(`V66 ${profile.profileId}: generated adaptation cannot certify 1:1 pixels.`);
  const provider = clean(source.provider || source.generationProvider);
  if (!/^openai(?:[- ]imagegen)?$/i.test(provider)) throw new Error(`V66 ${profile.profileId}: OpenAI ImageGen provenance is required.`);
  const referenceUrls = strings(source.referenceUrls);
  if (!referenceUrls.length || referenceUrls.some((url) => !/^https:\/\/[^\s]+$/.test(url))) throw new Error(`V66 ${profile.profileId}: reviewed HTTPS references are required.`);
  const clipSet = clean(source.clipSet || 'enemy-action-v66');
  if (!Object.hasOwn(V66_ENEMY_ANIMATION_LAYOUTS, clipSet)) throw new Error(`V66 ${profile.profileId}: unknown animation layout.`);
  const grid = V66_ENEMY_ANIMATION_LAYOUTS[clipSet];
  if (source.grid && Object.entries(grid).some(([key, value]) => source.grid[key] !== value)) throw new Error(`V66 ${profile.profileId}: animation grid mismatch.`);
  if (profile.archetype === 'Ovomorph' && clipSet !== 'ovomorph-cycle-v66') throw new Error(`V66 ${profile.profileId}: living eggs need their own lifecycle clips.`);
  if (profile.archetype !== 'Ovomorph' && clipSet === 'ovomorph-cycle-v66') throw new Error(`V66 ${profile.profileId}: egg lifecycle cannot animate another creature.`);
  const renderWidth = Number(source.renderWidth), renderHeight = Number(source.renderHeight);
  if (![renderWidth, renderHeight].every((value) => Number.isFinite(value) && value > 0)) throw new Error(`V66 ${profile.profileId}: positive render dimensions are required.`);
  if (Math.abs(renderWidth - renderHeight) > 1e-6) throw new Error(`V66 ${profile.profileId}: square source cells must keep an isotropic render scale.`);
  if (source.sourceFacing !== 1 && source.sourceFacing !== -1) throw new Error(`V66 ${profile.profileId}: explicit sourceFacing +/-1 is required.`);
  if (source.normalizedSha256 !== undefined && !/^[a-f0-9]{64}$/.test(source.normalizedSha256)) throw new Error(`V66 ${profile.profileId}: invalid atlas hash.`);
  const schema = wave === 'v81' ? 81 : 66;
  return Object.freeze({ schema, wave, profileId: profile.profileId,
    sheetId: `enemy.profile.${profile.profileId}.${wave}`, imageKey: `enemy-profile-${wave}:${profile.profileId}`,
    path: source.path, spriteKey: clean(source.spriteKey), clipSet, grid,
    pivot: clean(source.pivot), hitbox: clean(source.hitbox), renderWidth, renderHeight, sourceFacing: source.sourceFacing,
    identityStatus: clean(source.identityStatus), referenceStatus: clean(source.referenceStatus), identityVerified: true,
    reviewStatus: 'accepted', canonExact: false, provider: 'openai-imagegen', promptId: clean(source.promptId), referenceUrls,
    normalizedSha256: source.normalizedSha256 || null, assetFormat: `webp-rgba-${grid.columns * grid.cellWidth}x${grid.rows * grid.cellHeight}`,
  });
}

export function buildEnemyProfileRegistryV66(catalog = ENEMIES, readyAssets = READY_ENEMY_PROFILE_ASSETS) {
  const profiles = catalog.map(catalogProfile);
  const profileById = new Map(profiles.map((profile) => [profile.profileId, profile]));
  if (profileById.size !== profiles.length) throw new Error('Duplicate V66 catalog profile IDs.');
  const assets = new Map();
  const paths = new Set();
  for (const source of readyAssets) {
    const profile = profileById.get(clean(source?.profileId));
    if (!profile) throw new Error('Ready V66 asset points to an unknown ENEMIES profile.');
    if (assets.has(profile.profileId)) throw new Error(`Duplicate V66 ready profile: ${profile.profileId}`);
    const asset = readyAsset(source, profile);
    if (paths.has(asset.path)) throw new Error('Different V66 profiles cannot share a supposedly dedicated atlas.');
    paths.add(asset.path);
    assets.set(profile.profileId, asset);
  }
  return Object.freeze(profiles.map((profile) => {
    const asset = assets.get(profile.profileId) || null;
    return Object.freeze({ ...profile, ready: Boolean(asset), assetStatus: asset ? 'ready' : 'pending-art', asset });
  }));
}

export function buildEnemyProfileSpriteSheetsV66(registry) {
  return Object.freeze(Object.fromEntries(registry.filter((profile) => profile.ready && profile.asset).map((profile) => {
    const asset = profile.asset;
    return [asset.sheetId, Object.freeze({ id: asset.sheetId, imageKey: asset.imageKey, path: asset.path, clipSet: asset.clipSet,
      pivot: asset.pivot, hitbox: asset.hitbox, renderWidth: asset.renderWidth, renderHeight: asset.renderHeight,
      family: 'enemy', ...asset.grid, sourceFacing: asset.sourceFacing, releaseReady: true, identityVerified: true,
      assetFormat: asset.assetFormat, profileId: profile.profileId, wave: asset.wave, canonExact: false })];
  })));
}

function indexes(registry) { return { byId: new Map(registry.map((profile) => [profile.profileId, profile])), byName: new Map(registry.map((profile) => [profile.name, profile])) }; }
function resolveIndexed(source, registryIndexes) {
  const id = typeof source === 'string' ? source : clean(source?.id);
  const name = typeof source === 'string' ? source : clean(source?.name);
  // An explicit catalog ID is authoritative. A wrong/variant ID cannot borrow
  // a standard atlas via a contradictory name.
  const profile = id && registryIndexes.byId.has(id) ? registryIndexes.byId.get(id) : id && typeof source !== 'string' ? null : registryIndexes.byName.get(name);
  if (!profile?.ready || !profile.asset) return null;
  const asset = profile.asset;
  return Object.freeze({ schema: asset.schema, wave: asset.wave, profileId: profile.profileId, archetype: profile.archetype,
    spriteKey: asset.spriteKey, sheetId: asset.sheetId, imageKey: null, row: null, artSubject: profile.name,
    legacy: false, identityStatus: asset.identityStatus, referenceStatus: asset.referenceStatus, sourceFacing: asset.sourceFacing,
    approximate: false, canonExact: false, fallbackReason: null,
    provenance: Object.freeze({ provider: asset.provider, promptId: asset.promptId, referenceUrls: asset.referenceUrls }) });
}
export function resolveEnemyProfileVisualFromRegistryV66(source = {}, registry) { return resolveIndexed(source, indexes(registry)); }
export const ENEMY_PROFILE_REGISTRY_V66 = buildEnemyProfileRegistryV66();
export const READY_ENEMY_PROFILE_REGISTRY_V66 = Object.freeze(ENEMY_PROFILE_REGISTRY_V66.filter((profile) => profile.ready));
export const V66_ENEMY_PROFILE_SPRITE_SHEETS = buildEnemyProfileSpriteSheetsV66(ENEMY_PROFILE_REGISTRY_V66);
const INDEXES_V66 = indexes(ENEMY_PROFILE_REGISTRY_V66);
export function resolveEnemyProfileVisualV66(source = {}) { return resolveIndexed(source, INDEXES_V66); }
export function getReadyEnemyAtlasPathsForWorldV66(worldId, registry = ENEMY_PROFILE_REGISTRY_V66) {
  return Object.freeze(registry.filter((profile) => profile.ready && profile.encounterWorldIds.includes(clean(worldId))).map((profile) => profile.asset.path));
}
