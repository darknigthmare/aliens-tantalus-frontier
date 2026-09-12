import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENEMY_PROFILE_REGISTRY_V65 } from '../src/enemy-profile-registry-v65.js';
import { ENEMY_PROFILE_REGISTRY_V66 } from '../src/enemy-profile-registry-v66.js';
import { SPRITE_CLIP_SETS, SPRITE_HITBOXES, SPRITE_PIVOTS, SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';

const modulePath = fileURLToPath(import.meta.url);
export const V66_REPO_ROOT = resolve(dirname(modulePath), '..');
export const V66_SPRITE_MANIFEST_PATH = resolve(V66_REPO_ROOT, 'assets/openai/sprites/manifest-v66.json');
const clone = (value) => JSON.parse(JSON.stringify(value));

export function buildSupplementalSpriteManifestV66({ registryV65 = ENEMY_PROFILE_REGISTRY_V65, registryV66 = ENEMY_PROFILE_REGISTRY_V66,
  spriteSheets = SPRITE_SHEETS, clipSets = SPRITE_CLIP_SETS, hitboxes = SPRITE_HITBOXES, pivots = SPRITE_PIVOTS } = {}) {
  const profiles = [...registryV65, ...registryV66].filter((profile) => profile.ready && profile.asset);
  const sheets = [];
  const contracts = { grids: {}, pivots: {}, hitboxes: {} };
  const usedClips = {};
  const seenIds = new Set(), seenPaths = new Set();
  for (const profile of profiles) {
    const asset = profile.asset;
    if (seenIds.has(asset.sheetId) || seenPaths.has(asset.path)) throw new Error('Duplicate supplemental atlas identity or path.');
    seenIds.add(asset.sheetId);
    seenPaths.add(asset.path);
    const runtime = spriteSheets[asset.sheetId];
    if (!runtime || runtime.path !== asset.path || runtime.family !== 'enemy') throw new Error(`Ready profile is not wired to runtime: ${profile.profileId}`);
    if (Object.entries(asset.grid).some(([key, value]) => runtime[key] !== value)) throw new Error(`Runtime atlas grid differs for ${profile.profileId}`);
    const clips = clipSets[runtime.clipSet];
    const pivot = pivots[runtime.pivot], hitbox = hitboxes[runtime.hitbox];
    if (!Array.isArray(clips) || !pivot || !hitbox) throw new Error(`Incomplete runtime sprite contract for ${profile.profileId}`);
    const frameCount = runtime.columns * runtime.rows;
    const frames = clips.flatMap((clip) => clip.frames).sort((left, right) => left - right);
    if (JSON.stringify(frames) !== JSON.stringify(Array.from({ length: frameCount }, (_, index) => index))) throw new Error(`Missing or duplicated runtime poses for ${profile.profileId}`);
    const gridId = `profile-${runtime.columns}x${runtime.rows}-${runtime.cellWidth}x${runtime.cellHeight}`;
    contracts.grids[gridId] = { columns: runtime.columns, rows: runtime.rows, cellWidth: runtime.cellWidth, cellHeight: runtime.cellHeight, guard: 16 };
    contracts.pivots[runtime.pivot] = clone(pivot);
    contracts.hitboxes[runtime.hitbox] = clone(hitbox);
    usedClips[runtime.clipSet] = clone(clips);
    const version = profile.schema === 65 ? 'v65' : asset.wave || 'v66';
    sheets.push({ id: asset.sheetId, profileId: profile.profileId, subject: profile.name, wave: version, family: 'enemy',
      imageKey: asset.imageKey, files: { normalized: asset.path, normalizedStatus: 'ready' },
      metadataSource: version === 'v65' ? '/assets/openai/sprites/metadata/v65/facehugger-motion/enemy-002-facehugger.json' : `/assets/openai/sprites/metadata/${version}/${profile.profileId}.json`,
      grid: gridId, clips: runtime.clipSet, pivot: runtime.pivot, hitbox: runtime.hitbox,
      renderWidth: runtime.renderWidth, renderHeight: runtime.renderHeight, sourceFacing: runtime.sourceFacing,
      frameCount, canonExact: false, referenceStatus: asset.referenceStatus, referenceUrls: [...asset.referenceUrls],
      runtime: { status: 'referenced', loading: 'visible-enemy-lru-or-explicit-world-preload', consumers: ['src/enemy-atlas-loader-v65.js', 'src/catalog-runtime-v62.js', 'src/catalog-ui-v62.js', 'src/game-v51-runtime.js', 'src/game-v52-runtime.js'] },
    });
  }
  sheets.sort((left, right) => left.id.localeCompare(right.id));
  return { schemaVersion: 1, release: 'v66', generatedBy: 'scripts/sync-sprite-manifest-v66.mjs',
    baseManifest: '/assets/openai/sprites/manifest.json', baseRelease: 'v64', supplemental: true,
    sourceOfTruth: 'Accepted profile registries must resolve to real runtime sheets and complete clip coverage. The V64 snapshot remains unchanged.',
    atlasCount: sheets.length, cellCount: sheets.reduce((sum, sheet) => sum + sheet.frameCount, 0),
    contracts, clipSets: usedClips, sheets };
}

export async function validateSupplementalAssetsV66(manifest, root = V66_REPO_ROOT) {
  for (const sheet of manifest.sheets) {
    const metadata = JSON.parse(await readFile(resolve(root, sheet.metadataSource.slice(1)), 'utf8'));
    const bytes = await readFile(resolve(root, sheet.files.normalized.slice(1)));
    if (metadata.profileId !== sheet.profileId || metadata.normalizedSha256 !== createHash('sha256').update(bytes).digest('hex')) throw new Error(`Atlas provenance mismatch: ${sheet.profileId}`);
    if (metadata.validation?.uniqueFrameCount !== sheet.frameCount || metadata.validation.findings.length) throw new Error(`Atlas cell quality has not passed: ${sheet.profileId}`);
    const grid = manifest.contracts.grids[sheet.grid];
    if (['columns', 'rows', 'cellWidth', 'cellHeight'].some((key) => metadata.grid?.[key] !== grid[key])) throw new Error(`Atlas metadata grid mismatch: ${sheet.profileId}`);
  }
  return { checked: manifest.sheets.length, missing: [] };
}

export async function runSpriteManifestSyncV66(args = process.argv.slice(2)) {
  const manifest = buildSupplementalSpriteManifestV66();
  await validateSupplementalAssetsV66(manifest);
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  if (args.includes('--check')) {
    const existing = `${JSON.stringify(JSON.parse(await readFile(V66_SPRITE_MANIFEST_PATH, 'utf8')), null, 2)}\n`;
    if (existing !== serialized) throw new Error('Supplemental V66 sprite manifest is stale; run node scripts/sync-sprite-manifest-v66.mjs.');
  } else await writeFile(V66_SPRITE_MANIFEST_PATH, serialized);
  console.log(`Supplemental V65/V66 manifest synchronized: ${manifest.atlasCount} atlases / ${manifest.cellCount} authored poses.`);
  return manifest;
}
if (process.argv[1] && resolve(process.argv[1]) === modulePath) runSpriteManifestSyncV66().catch((error) => { console.error(error.message); process.exitCode = 1; });
