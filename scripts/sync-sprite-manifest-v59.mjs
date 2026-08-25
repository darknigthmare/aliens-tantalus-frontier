import { access, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SPRITE_CLIP_SETS, SPRITE_HITBOXES, SPRITE_PIVOTS, SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';
import { VEHICLE_ACCESS_CONTRACTS_V59 } from '../src/vehicle-access-runtime-v59.js';
import {
  V56_EXPECTED_ATLASES,
  V56_EXPECTED_CELLS,
  V56_SPRITE_MANIFEST_PATH,
  buildSpriteManifestV56,
  manifestCellCount
} from './sync-sprite-manifest-v56.mjs';

const modulePath = fileURLToPath(import.meta.url);
export const V59_REPO_ROOT = resolve(dirname(modulePath), '..');
export const V59_SPRITE_MANIFEST_PATH = V56_SPRITE_MANIFEST_PATH;
export const V59_CLIP_SET_ID = 'vehicle-access-damage-v59';

const clone = (value) => JSON.parse(JSON.stringify(value));
const rawFromNormalized = (path) => path.replace('/sprites/normalized/', '/sprites/');
const runtime = Object.freeze({
  status: 'referenced',
  consumers: Object.freeze([
    'src/vehicle-access-runtime-v59.js',
    'src/sprite-animation-runtime.js',
    'src/game-v52-runtime.js'
  ])
});

export const V59_SHEET_DEFINITIONS = Object.freeze(VEHICLE_ACCESS_CONTRACTS_V59
  .map((contract) => {
    const entry = SPRITE_SHEETS[contract.accessSheetId];
    if (!entry) throw new Error(`Missing V59 runtime sheet ${contract.accessSheetId}.`);
    return Object.freeze({
      id: entry.id,
      family: 'vehicle',
      subject: contract.subject,
      wave: 'v59',
      files: {
        raw: rawFromNormalized(entry.path),
        normalized: entry.path,
        normalizedStatus: 'ready'
      },
      grid: 'v50-4x4',
      clips: entry.clipSet,
      pivot: entry.pivot,
      hitbox: entry.hitbox,
      sourceFacing: 'right',
      identityVerified: true,
      runtime
    });
  })
  .sort((left, right) => left.id.localeCompare(right.id)));

export const V59_NEW_SHEET_IDS = Object.freeze(V59_SHEET_DEFINITIONS.map((entry) => entry.id));
export const V59_NEW_ATLAS_COUNT = V59_NEW_SHEET_IDS.length;
export const V59_EXPECTED_ATLASES = V56_EXPECTED_ATLASES + V59_NEW_ATLAS_COUNT;
export const V59_EXPECTED_CELLS = V56_EXPECTED_CELLS + V59_NEW_ATLAS_COUNT * 16;

const addOrReplaceSheet = (manifest, authored) => {
  const index = manifest.sheets.findIndex((sheet) => sheet.id === authored.id);
  if (index < 0) manifest.sheets.push(clone(authored));
  else manifest.sheets[index] = { ...manifest.sheets[index], ...clone(authored) };
};

export function assertSpriteManifestV59(manifest) {
  if (manifest.release !== 'v59') throw new Error(`Expected sprite release v59, received ${String(manifest.release)}.`);
  if (!Array.isArray(manifest.sheets)) throw new Error('Sprite manifest sheets must be an array.');
  const ids = manifest.sheets.map((sheet) => sheet.id);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate sprite sheet id after v59 synchronization.');
  if (ids.length !== V59_EXPECTED_ATLASES) {
    throw new Error(`Expected ${V59_EXPECTED_ATLASES} sprite atlases, received ${ids.length}.`);
  }
  if (manifestCellCount(manifest) !== V59_EXPECTED_CELLS) {
    throw new Error(`Expected ${V59_EXPECTED_CELLS} atlas cells, received ${manifestCellCount(manifest)}.`);
  }
  for (const definition of V59_SHEET_DEFINITIONS) {
    const sheet = manifest.sheets.find((candidate) => candidate.id === definition.id);
    if (!sheet) throw new Error(`Missing v59 sprite atlas: ${definition.id}.`);
    if (sheet.wave !== 'v59' || sheet.family !== 'vehicle') throw new Error(`${sheet.id} has an invalid V59 family/wave contract.`);
    if (sheet.grid !== 'v50-4x4' || sheet.clips !== V59_CLIP_SET_ID) throw new Error(`${sheet.id} has an invalid V59 grid/clip contract.`);
    if (sheet.sourceFacing !== 'right' || sheet.identityVerified !== true) throw new Error(`${sheet.id} has not passed identity/facing verification.`);
    if (sheet.files?.normalizedStatus !== 'ready') throw new Error(`${sheet.id} has no ready normalized atlas.`);
    if (!manifest.contracts?.pivots?.[sheet.pivot] || !manifest.contracts?.hitboxes?.[sheet.hitbox]) {
      throw new Error(`${sheet.id} references a missing pivot or hitbox.`);
    }
  }
  return manifest;
}

export function buildSpriteManifestV59(sourceManifest) {
  if (!sourceManifest || typeof sourceManifest !== 'object') throw new TypeError('A source sprite manifest is required.');
  const cleanSource = clone(sourceManifest);
  cleanSource.sheets = (cleanSource.sheets || []).filter((sheet) => sheet.wave !== 'v59' && !V59_NEW_SHEET_IDS.includes(sheet.id));
  const manifest = buildSpriteManifestV56(cleanSource);
  manifest.release = 'v59';
  manifest.clipSets[V59_CLIP_SET_ID] = clone(SPRITE_CLIP_SETS[V59_CLIP_SET_ID]).map((clip) => ({
    ...clip,
    row: Math.floor(clip.frames[0] / 4)
  }));
  for (const definition of V59_SHEET_DEFINITIONS) {
    const pivot = SPRITE_PIVOTS[definition.pivot];
    const hitbox = SPRITE_HITBOXES[definition.hitbox];
    if (!pivot || !hitbox) throw new Error(`${definition.id} is missing its runtime pivot/hitbox.`);
    manifest.contracts.pivots[definition.pivot] = { ...pivot, unit: 'cell-pixel' };
    manifest.contracts.hitboxes[definition.hitbox] = { ...hitbox, unit: 'cell-pixel' };
    addOrReplaceSheet(manifest, definition);
  }
  manifest.sheets.sort((left, right) => left.id.localeCompare(right.id));
  return assertSpriteManifestV59(manifest);
}

const localAssetPath = (webPath, root) => resolve(root, String(webPath).replace(/^\/+/, ''));

export async function validateV59SpriteAssets(root = V59_REPO_ROOT) {
  const required = [...new Set(V59_SHEET_DEFINITIONS.flatMap((sheet) => [sheet.files.raw, sheet.files.normalized]))];
  const missing = [];
  for (const webPath of required) {
    try {
      await access(localAssetPath(webPath, root));
    } catch {
      missing.push(webPath);
    }
  }
  if (missing.length) throw new Error(`Missing v59 sprite asset files: ${missing.join(', ')}.`);
  return Object.freeze({ checked: required.length, missing: Object.freeze([]) });
}

export async function runSpriteManifestSyncV59(argv = process.argv.slice(2)) {
  const checkOnly = argv.includes('--check');
  const dryRun = argv.includes('--dry-run') || argv.includes('--summary');
  const originalText = await readFile(V59_SPRITE_MANIFEST_PATH, 'utf8');
  const manifest = buildSpriteManifestV59(JSON.parse(originalText));
  const assets = await validateV59SpriteAssets();
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;

  if (dryRun) {
    console.log(JSON.stringify({
      release: manifest.release,
      atlases: manifest.sheets.length,
      cells: manifestCellCount(manifest),
      newAtlases: V59_NEW_ATLAS_COUNT,
      assetFilesChecked: assets.checked,
      wroteManifest: false
    }, null, 2));
    return manifest;
  }
  if (checkOnly) {
    const normalizedOriginal = `${JSON.stringify(JSON.parse(originalText), null, 2)}\n`;
    if (serialized !== normalizedOriginal) throw new Error('Sprite manifest v59 is out of sync; run node scripts/sync-sprite-manifest-v59.mjs.');
    console.log(`Sprite manifest v59 is synchronized: ${V59_EXPECTED_ATLASES} atlases / ${V59_EXPECTED_CELLS} cells.`);
    return manifest;
  }
  await writeFile(V59_SPRITE_MANIFEST_PATH, serialized, 'utf8');
  console.log(`Synchronized ${manifest.sheets.length} sprite atlases / ${manifestCellCount(manifest)} cells for v59 runtime truth.`);
  return manifest;
}

const isMain = Boolean(process.argv[1]) && resolve(process.argv[1]) === modulePath;
if (isMain) {
  runSpriteManifestSyncV59().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

export { manifestCellCount };
