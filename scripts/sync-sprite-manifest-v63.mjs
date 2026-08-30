import { access, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';
import { ASSO_400_HARPOON_PROFILE_V63 } from '../src/weapon-visual-runtime-v63.js';
import {
  V61_EXPECTED_ATLASES,
  V61_EXPECTED_CELLS,
  V61_SPRITE_MANIFEST_PATH,
  buildSpriteManifestV61,
  manifestCellCount
} from './sync-sprite-manifest-v61.mjs';

const modulePath = fileURLToPath(import.meta.url);
export const V63_REPO_ROOT = resolve(dirname(modulePath), '..');
export const V63_SPRITE_MANIFEST_PATH = V61_SPRITE_MANIFEST_PATH;
const clone = (value) => JSON.parse(JSON.stringify(value));

export const V63_SHEET_DEFINITION = Object.freeze({
  id: ASSO_400_HARPOON_PROFILE_V63.sheetId,
  family: 'weapon',
  subject: ASSO_400_HARPOON_PROFILE_V63.canonicalName,
  wave: 'v63',
  files: {
    raw: ASSO_400_HARPOON_PROFILE_V63.rawPath,
    normalized: ASSO_400_HARPOON_PROFILE_V63.path,
    normalizedStatus: 'ready'
  },
  grid: 'v50-4x4',
  clips: ASSO_400_HARPOON_PROFILE_V63.clipSet,
  pivot: ASSO_400_HARPOON_PROFILE_V63.pivot,
  hitbox: ASSO_400_HARPOON_PROFILE_V63.hitbox,
  sourceFacing: 'right',
  identityVerified: true,
  referenceStatus: ASSO_400_HARPOON_PROFILE_V63.referenceStatus,
  excelIds: [...ASSO_400_HARPOON_PROFILE_V63.excelIds],
  runtime: {
    status: 'referenced',
    consumers: [
      'src/sprite-animation-runtime.js',
      'src/weapon-visual-runtime-v63.js',
      'src/game-v51-runtime.js',
      'src/catalog-runtime-v62.js',
      'src/app.js'
    ]
  }
});

export const V63_NEW_ATLAS_COUNT = 1;
export const V63_EXPECTED_ATLASES = V61_EXPECTED_ATLASES + V63_NEW_ATLAS_COUNT;
export const V63_EXPECTED_CELLS = V61_EXPECTED_CELLS + 16;

export function buildSpriteManifestV63(sourceManifest) {
  if (!sourceManifest || typeof sourceManifest !== 'object') throw new TypeError('A source sprite manifest is required.');
  const cleanSource = clone(sourceManifest);
  cleanSource.sheets = (cleanSource.sheets || []).filter((sheet) => sheet.wave !== 'v63' && sheet.id !== V63_SHEET_DEFINITION.id);
  const manifest = buildSpriteManifestV61(cleanSource);
  manifest.release = 'v63';
  manifest.sheets.push(clone(V63_SHEET_DEFINITION));
  manifest.sheets.sort((left, right) => left.id.localeCompare(right.id));
  if (manifest.sheets.length !== V63_EXPECTED_ATLASES) throw new Error(`Expected ${V63_EXPECTED_ATLASES} sprite atlases.`);
  if (manifestCellCount(manifest) !== V63_EXPECTED_CELLS) throw new Error(`Expected ${V63_EXPECTED_CELLS} atlas cells.`);
  const sheet = manifest.sheets.find((entry) => entry.id === V63_SHEET_DEFINITION.id);
  if (!sheet || sheet.wave !== 'v63' || sheet.sourceFacing !== 'right' || sheet.files?.normalizedStatus !== 'ready') {
    throw new Error('Invalid ASSO-400 V63 manifest contract.');
  }
  return manifest;
}

const localAssetPath = (webPath, root) => resolve(root, String(webPath).replace(/^\/+/, ''));

export async function validateV63SpriteAssets(root = V63_REPO_ROOT) {
  const required = [V63_SHEET_DEFINITION.files.raw, V63_SHEET_DEFINITION.files.normalized];
  const missing = [];
  for (const webPath of required) {
    try {
      await access(localAssetPath(webPath, root));
    } catch {
      missing.push(webPath);
    }
  }
  if (missing.length) throw new Error(`Missing V63 sprite asset files: ${missing.join(', ')}.`);
  return Object.freeze({ checked: required.length, missing: Object.freeze([]) });
}

export async function runSpriteManifestSyncV63(argv = process.argv.slice(2)) {
  const checkOnly = argv.includes('--check');
  const originalText = await readFile(V63_SPRITE_MANIFEST_PATH, 'utf8');
  const manifest = buildSpriteManifestV63(JSON.parse(originalText));
  await validateV63SpriteAssets();
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  if (checkOnly) {
    const normalizedOriginal = `${JSON.stringify(JSON.parse(originalText), null, 2)}\n`;
    if (serialized !== normalizedOriginal) throw new Error('Sprite manifest V63 is out of sync; run node scripts/sync-sprite-manifest-v63.mjs.');
    console.log(`Sprite manifest V63 is synchronized: ${V63_EXPECTED_ATLASES} atlases / ${V63_EXPECTED_CELLS} cells.`);
    return manifest;
  }
  await writeFile(V63_SPRITE_MANIFEST_PATH, serialized, 'utf8');
  console.log(`Synchronized ${manifest.sheets.length} sprite atlases / ${manifestCellCount(manifest)} cells for V63.`);
  return manifest;
}

const isMain = Boolean(process.argv[1]) && resolve(process.argv[1]) === modulePath;
if (isMain) runSpriteManifestSyncV63().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

export { manifestCellCount };
