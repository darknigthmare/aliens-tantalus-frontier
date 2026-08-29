import { access, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';
import { WEAPON_VISUAL_PROFILES_NEW_V61 } from '../src/weapon-visual-runtime-v61.js';
import {
  V59_EXPECTED_ATLASES,
  V59_EXPECTED_CELLS,
  V59_SPRITE_MANIFEST_PATH,
  buildSpriteManifestV59,
  manifestCellCount
} from './sync-sprite-manifest-v59.mjs';

const modulePath = fileURLToPath(import.meta.url);
export const V61_REPO_ROOT = resolve(dirname(modulePath), '..');
export const V61_SPRITE_MANIFEST_PATH = V59_SPRITE_MANIFEST_PATH;

const clone = (value) => JSON.parse(JSON.stringify(value));
const rawFromNormalized = (path) => path.replace('/sprites/normalized/', '/sprites/');
const runtime = Object.freeze({
  status: 'referenced',
  consumers: Object.freeze([
    'src/sprite-animation-runtime.js',
    'src/weapon-visual-runtime-v61.js',
    'src/game-v51-runtime.js',
    'src/game-v52-runtime.js',
    'src/app.js'
  ])
});

export const V61_SHEET_DEFINITIONS = Object.freeze(WEAPON_VISUAL_PROFILES_NEW_V61
  .map((profile) => {
    const entry = SPRITE_SHEETS[profile.sheetId];
    if (!entry) throw new Error(`Missing V61 runtime sheet ${profile.sheetId}.`);
    return Object.freeze({
      id: entry.id,
      family: 'weapon',
      subject: profile.name,
      wave: 'v61',
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
      referenceStatus: profile.referenceStatus,
      excelIds: [...profile.excelIds],
      runtime
    });
  })
  .sort((left, right) => left.id.localeCompare(right.id)));

export const V61_NEW_SHEET_IDS = Object.freeze(V61_SHEET_DEFINITIONS.map((entry) => entry.id));
export const V61_NEW_ATLAS_COUNT = V61_NEW_SHEET_IDS.length;
export const V61_EXPECTED_ATLASES = V59_EXPECTED_ATLASES + V61_NEW_ATLAS_COUNT;
export const V61_EXPECTED_CELLS = V59_EXPECTED_CELLS + V61_NEW_ATLAS_COUNT * 16;

const addOrReplaceSheet = (manifest, authored) => {
  const index = manifest.sheets.findIndex((sheet) => sheet.id === authored.id);
  if (index < 0) manifest.sheets.push(clone(authored));
  else manifest.sheets[index] = { ...manifest.sheets[index], ...clone(authored) };
};

export function assertSpriteManifestV61(manifest) {
  if (manifest.release !== 'v61') throw new Error(`Expected sprite release v61, received ${String(manifest.release)}.`);
  if (!Array.isArray(manifest.sheets)) throw new Error('Sprite manifest sheets must be an array.');
  const ids = manifest.sheets.map((sheet) => sheet.id);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate sprite sheet id after v61 synchronization.');
  if (ids.length !== V61_EXPECTED_ATLASES) {
    throw new Error(`Expected ${V61_EXPECTED_ATLASES} sprite atlases, received ${ids.length}.`);
  }
  if (manifestCellCount(manifest) !== V61_EXPECTED_CELLS) {
    throw new Error(`Expected ${V61_EXPECTED_CELLS} atlas cells, received ${manifestCellCount(manifest)}.`);
  }
  for (const definition of V61_SHEET_DEFINITIONS) {
    const sheet = manifest.sheets.find((candidate) => candidate.id === definition.id);
    if (!sheet) throw new Error(`Missing V61 sprite atlas: ${definition.id}.`);
    if (sheet.wave !== 'v61' || sheet.family !== 'weapon') throw new Error(`${sheet.id} has an invalid V61 family/wave contract.`);
    if (sheet.grid !== 'v50-4x4' || sheet.clips !== 'weapon-action-v56') throw new Error(`${sheet.id} has an invalid V61 grid/clip contract.`);
    if (sheet.sourceFacing !== 'right' || sheet.identityVerified !== true) throw new Error(`${sheet.id} has not passed identity/facing verification.`);
    if (sheet.files?.normalizedStatus !== 'ready') throw new Error(`${sheet.id} has no ready normalized atlas.`);
    if (!sheet.excelIds?.length) throw new Error(`${sheet.id} has no workbook identity bridge.`);
    if (!manifest.contracts?.pivots?.[sheet.pivot] || !manifest.contracts?.hitboxes?.[sheet.hitbox]) {
      throw new Error(`${sheet.id} references a missing pivot or hitbox.`);
    }
  }
  return manifest;
}

export function buildSpriteManifestV61(sourceManifest) {
  if (!sourceManifest || typeof sourceManifest !== 'object') throw new TypeError('A source sprite manifest is required.');
  const cleanSource = clone(sourceManifest);
  cleanSource.sheets = (cleanSource.sheets || []).filter((sheet) => sheet.wave !== 'v61' && !V61_NEW_SHEET_IDS.includes(sheet.id));
  const manifest = buildSpriteManifestV59(cleanSource);
  manifest.release = 'v61';
  for (const definition of V61_SHEET_DEFINITIONS) addOrReplaceSheet(manifest, definition);
  manifest.sheets.sort((left, right) => left.id.localeCompare(right.id));
  return assertSpriteManifestV61(manifest);
}

const localAssetPath = (webPath, root) => resolve(root, String(webPath).replace(/^\/+/, ''));

export async function validateV61SpriteAssets(root = V61_REPO_ROOT) {
  const required = [...new Set(V61_SHEET_DEFINITIONS.flatMap((sheet) => [sheet.files.raw, sheet.files.normalized]))];
  const missing = [];
  for (const webPath of required) {
    try {
      await access(localAssetPath(webPath, root));
    } catch {
      missing.push(webPath);
    }
  }
  if (missing.length) throw new Error(`Missing V61 sprite asset files: ${missing.join(', ')}.`);
  return Object.freeze({ checked: required.length, missing: Object.freeze([]) });
}

export async function runSpriteManifestSyncV61(argv = process.argv.slice(2)) {
  const checkOnly = argv.includes('--check');
  const dryRun = argv.includes('--dry-run') || argv.includes('--summary');
  const originalText = await readFile(V61_SPRITE_MANIFEST_PATH, 'utf8');
  const manifest = buildSpriteManifestV61(JSON.parse(originalText));
  const assets = await validateV61SpriteAssets();
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  if (dryRun) {
    console.log(JSON.stringify({
      release: manifest.release,
      atlases: manifest.sheets.length,
      cells: manifestCellCount(manifest),
      newAtlases: V61_NEW_ATLAS_COUNT,
      assetFilesChecked: assets.checked,
      wroteManifest: false
    }, null, 2));
    return manifest;
  }
  if (checkOnly) {
    const normalizedOriginal = `${JSON.stringify(JSON.parse(originalText), null, 2)}\n`;
    if (serialized !== normalizedOriginal) throw new Error('Sprite manifest V61 is out of sync; run node scripts/sync-sprite-manifest-v61.mjs.');
    console.log(`Sprite manifest V61 is synchronized: ${V61_EXPECTED_ATLASES} atlases / ${V61_EXPECTED_CELLS} cells.`);
    return manifest;
  }
  await writeFile(V61_SPRITE_MANIFEST_PATH, serialized, 'utf8');
  console.log(`Synchronized ${manifest.sheets.length} sprite atlases / ${manifestCellCount(manifest)} cells for V61 runtime truth.`);
  return manifest;
}

const isMain = Boolean(process.argv[1]) && resolve(process.argv[1]) === modulePath;
if (isMain) {
  runSpriteManifestSyncV61().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

export { manifestCellCount };
