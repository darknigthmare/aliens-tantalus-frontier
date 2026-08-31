import { ENEMIES } from './content-core-v50.js';
import { V65_READY_ENEMY_PROFILE_ASSETS } from './enemy-profile-assets-v65.js';

export const V65_ENEMY_ATLAS_GRID = Object.freeze({ columns: 4, rows: 4, cellWidth: 256, cellHeight: 256 });
export const V65_ENEMY_ANIMATION_LAYOUTS = Object.freeze({
  'enemy-action-v56': V65_ENEMY_ATLAS_GRID,
  'facehugger-action-v65': Object.freeze({ columns: 4, rows: 8, cellWidth: 256, cellHeight: 256 })
});

const REQUIRED_ASSET_TEXT_FIELDS = Object.freeze([
  'path', 'spriteKey', 'pivot', 'hitbox', 'identityStatus', 'referenceStatus'
]);
const freezeStrings = (items = []) => Object.freeze(items.map((item) => String(item)));
const cleanText = (value) => String(value ?? '').trim();
const profileSheetId = (profileId) => `enemy.profile.${profileId}.v65`;
const profileImageKey = (profileId) => `enemy-profile-v65:${profileId}`;

function normalizeCatalogProfile(source, index) {
  const id = cleanText(source?.id);
  const name = cleanText(source?.name);
  if (!id || !name) throw new Error(`Profil ennemi V65 invalide à l'index ${index}: id et name sont requis.`);
  const modifier = cleanText(source.modifier || 'Standard');
  const prefix = modifier && modifier !== 'Standard' ? `${modifier} ` : '';
  const archetype = prefix && name.startsWith(prefix) ? name.slice(prefix.length) : name;
  return Object.freeze({
    schema: 65,
    profileId: id,
    name,
    archetype,
    modifier,
    biology: cleanText(source.biology || 'unknown'),
    caste: cleanText(source.caste || ''),
    behavior: cleanText(source.behavior || ''),
    provenance: cleanText(source.provenance || 'unknown'),
    encounterWorldIds: freezeStrings(source.encounterWorldIds),
    habitats: freezeStrings(source.habitats)
  });
}

function normalizeReadyAsset(source, profile) {
  for (const field of REQUIRED_ASSET_TEXT_FIELDS) {
    if (!cleanText(source?.[field])) throw new Error(`Asset V65 ${profile.profileId}: ${field} est requis.`);
  }
  const path = cleanText(source.path);
  if (!/^\/assets\/openai\/sprites\/normalized\/enemy-profiles-v65\/.+\.webp$/i.test(path)) {
    throw new Error(`Asset V65 ${profile.profileId}: path doit cibler un WebP RGBA 1024 V65 normalisé.`);
  }
  const renderWidth = Number(source.renderWidth);
  const renderHeight = Number(source.renderHeight);
  if (![renderWidth, renderHeight].every((value) => Number.isFinite(value) && value > 0)) {
    throw new Error(`Asset V65 ${profile.profileId}: renderWidth/renderHeight doivent être positifs.`);
  }
  const providerSource = cleanText(source.provider || source.provenanceProvider || source.generationProvider);
  if (!/openai/i.test(providerSource)) {
    throw new Error(`Asset V65 ${profile.profileId}: provider OpenAI requis pour la provenance.`);
  }
  const provider = 'openai-imagegen';
  const clipSet = cleanText(source.clipSet || 'enemy-action-v56');
  const grid = Object.hasOwn(V65_ENEMY_ANIMATION_LAYOUTS, clipSet)
    ? V65_ENEMY_ANIMATION_LAYOUTS[clipSet]
    : null;
  if (!grid) throw new Error(`Asset V65 ${profile.profileId}: clipSet non pris en charge.`);
  if (source.grid && Object.entries(grid).some(([key, value]) => source.grid[key] !== value)) {
    throw new Error(`Asset V65 ${profile.profileId}: grille incompatible avec ${clipSet}.`);
  }
  const referenceUrls = freezeStrings(source.referenceUrls);
  if (referenceUrls.some((url) => !/^https:\/\//i.test(url))) {
    throw new Error(`Asset V65 ${profile.profileId}: chaque referenceUrl doit être HTTPS.`);
  }
  return Object.freeze({
    schema: 65,
    profileId: profile.profileId,
    sheetId: profileSheetId(profile.profileId),
    imageKey: profileImageKey(profile.profileId),
    path,
    spriteKey: cleanText(source.spriteKey),
    clipSet,
    grid,
    pivot: cleanText(source.pivot),
    hitbox: cleanText(source.hitbox),
    renderWidth,
    renderHeight,
    sourceFacing: Number(source.sourceFacing) < 0 ? -1 : 1,
    identityStatus: cleanText(source.identityStatus),
    referenceStatus: cleanText(source.referenceStatus),
    provider,
    promptId: cleanText(source.promptId),
    referenceUrls,
    identityVerified: source.identityVerified !== false,
    assetFormat: grid.rows === 4 ? 'webp-rgba-1024' : 'webp-rgba-1024x2048'
  });
}

export function buildEnemyProfileRegistryV65(catalog = ENEMIES, readyAssets = V65_READY_ENEMY_PROFILE_ASSETS) {
  const profiles = catalog.map(normalizeCatalogProfile);
  const profileById = new Map();
  for (const profile of profiles) {
    if (profileById.has(profile.profileId)) throw new Error(`Profil ennemi V65 dupliqué: ${profile.profileId}`);
    profileById.set(profile.profileId, profile);
  }

  const assetByProfileId = new Map();
  const paths = new Set();
  for (const source of readyAssets) {
    const profileId = cleanText(source?.profileId);
    const profile = profileById.get(profileId);
    if (!profile) throw new Error(`Asset V65 lié à un profil ENEMIES inconnu: ${profileId || '(vide)'}`);
    if (assetByProfileId.has(profileId)) throw new Error(`Asset V65 dupliqué pour ${profileId}`);
    const asset = normalizeReadyAsset(source, profile);
    if (paths.has(asset.path)) throw new Error(`Plaque V65 réemployée par plusieurs profils: ${asset.path}`);
    paths.add(asset.path);
    assetByProfileId.set(profileId, asset);
  }

  return Object.freeze(profiles.map((profile) => {
    const asset = assetByProfileId.get(profile.profileId) || null;
    return Object.freeze({
      ...profile,
      ready: Boolean(asset),
      assetStatus: asset ? 'ready' : 'pending-art',
      asset
    });
  }));
}

export function buildEnemyProfileSpriteSheetsV65(registry) {
  return Object.freeze(Object.fromEntries(registry
    .filter((profile) => profile.ready && profile.asset)
    .map((profile) => {
      const asset = profile.asset;
      return [asset.sheetId, Object.freeze({
        id: asset.sheetId,
        imageKey: asset.imageKey,
        path: asset.path,
        clipSet: asset.clipSet,
        pivot: asset.pivot,
        hitbox: asset.hitbox,
        renderWidth: asset.renderWidth,
        renderHeight: asset.renderHeight,
        family: 'enemy',
        ...asset.grid,
        sourceFacing: asset.sourceFacing,
        releaseReady: true,
        identityVerified: asset.identityVerified,
        assetFormat: asset.assetFormat,
        profileId: profile.profileId,
        wave: 'v65'
      })];
    })));
}

const registryIndexes = (registry) => ({
  byId: new Map(registry.map((profile) => [profile.profileId, profile])),
  byName: new Map(registry.map((profile) => [profile.name, profile]))
});

function resolveEnemyProfileVisualFromIndexesV65(source, { byId, byName }) {
  const id = typeof source === 'string' ? source : cleanText(source?.id);
  const name = typeof source === 'string' ? source : cleanText(source?.name);
  const profile = byId.get(id) || byName.get(name);
  if (!profile?.ready || !profile.asset) return null;
  const asset = profile.asset;
  return Object.freeze({
    schema: 65,
    wave: 'v65',
    profileId: profile.profileId,
    archetype: profile.archetype,
    spriteKey: asset.spriteKey,
    sheetId: asset.sheetId,
    imageKey: null,
    row: null,
    artSubject: profile.name,
    legacy: false,
    identityStatus: asset.identityStatus,
    referenceStatus: asset.referenceStatus,
    sourceFacing: asset.sourceFacing,
    approximate: false,
    fallbackReason: null,
    provenance: Object.freeze({
      provider: asset.provider,
      promptId: asset.promptId,
      referenceUrls: asset.referenceUrls
    })
  });
}

export function resolveEnemyProfileVisualFromRegistryV65(source = {}, registry) {
  return resolveEnemyProfileVisualFromIndexesV65(source, registryIndexes(registry));
}

export const ENEMY_PROFILE_REGISTRY_V65 = buildEnemyProfileRegistryV65();
export const READY_ENEMY_PROFILE_REGISTRY_V65 = Object.freeze(ENEMY_PROFILE_REGISTRY_V65.filter((profile) => profile.ready));
export const V65_ENEMY_PROFILE_SPRITE_SHEETS = buildEnemyProfileSpriteSheetsV65(ENEMY_PROFILE_REGISTRY_V65);
const ENEMY_PROFILE_INDEXES_V65 = registryIndexes(ENEMY_PROFILE_REGISTRY_V65);

export function resolveEnemyProfileVisualV65(source = {}) {
  return resolveEnemyProfileVisualFromIndexesV65(source, ENEMY_PROFILE_INDEXES_V65);
}

export function getReadyEnemyAtlasPathsForWorldV65(worldId, registry = ENEMY_PROFILE_REGISTRY_V65) {
  const id = cleanText(worldId);
  return Object.freeze(registry
    .filter((profile) => profile.ready && profile.encounterWorldIds.includes(id))
    .map((profile) => profile.asset.path));
}
