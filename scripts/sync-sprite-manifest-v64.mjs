import { access, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SPRITE_CLIP_SETS, SPRITE_HITBOXES, SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';
import { ENEMY_VISUAL_OVERRIDES_V64 } from '../src/enemy-visual-overrides-v64.js';
import {
  V63_EXPECTED_ATLASES,
  V63_EXPECTED_CELLS,
  V63_SPRITE_MANIFEST_PATH,
  buildSpriteManifestV63,
  manifestCellCount
} from './sync-sprite-manifest-v63.mjs';

const modulePath = fileURLToPath(import.meta.url);
export const V64_REPO_ROOT = resolve(dirname(modulePath), '..');
export const V64_SPRITE_MANIFEST_PATH = V63_SPRITE_MANIFEST_PATH;
const clone = (value) => JSON.parse(JSON.stringify(value));
const rowsForFrames = (frames, columns = 4) => [...new Set(frames.map((frame) => Math.floor(frame / columns)))];
const manifestClip = (clip, columns = 4) => {
  const output = clone(clip);
  const rows = rowsForFrames(output.frames, columns);
  if (rows.length === 1 && output.row === undefined) output.row = rows[0];
  return output;
};

export const V64_SHEET_DEFINITIONS = Object.freeze(
  Object.values(ENEMY_VISUAL_OVERRIDES_V64).map((profile) => {
    const runtimeSheet = SPRITE_SHEETS[profile.sheetId];
    if (!runtimeSheet) throw new Error(`Missing runtime sheet ${profile.sheetId}.`);
    const rawPath = profile.path
      .replace('/sprites/normalized/enemies/', '/sprites/enemies/');
    return Object.freeze({
      id: profile.sheetId,
      family: 'enemy',
      subject: profile.archetype,
      wave: 'v64',
      files: {
        raw: rawPath,
        normalized: profile.path,
        normalizedStatus: 'ready'
      },
      grid: 'v50-4x4',
      clips: runtimeSheet.clipSet,
      pivot: runtimeSheet.pivot,
      hitbox: runtimeSheet.hitbox,
      sourceFacing: 'right',
      identityVerified: true,
      referenceStatus: profile.referenceStatus,
      continuity: profile.continuity,
      excelIds: [...profile.excelIds],
      referenceUrls: [...profile.referenceUrls],
      runtime: {
        status: 'referenced',
        consumers: [
          'src/sprite-animation-runtime.js',
          'src/enemy-visual-overrides-v64.js',
          'src/enemy-visual-runtime-v53.js',
          'src/game-v51-runtime.js',
          'src/game-v52-runtime.js',
          'src/catalog-runtime-v62.js'
        ]
      }
    });
  })
);

export const V64_NEW_ATLAS_COUNT = V64_SHEET_DEFINITIONS.length;
export const V64_EXPECTED_ATLASES = V63_EXPECTED_ATLASES + V64_NEW_ATLAS_COUNT;
export const V64_EXPECTED_CELLS = V63_EXPECTED_CELLS + V64_NEW_ATLAS_COUNT * 16;
export const V64_CLIP_SET_IDS = Object.freeze([...new Set(V64_SHEET_DEFINITIONS.map((sheet) => sheet.clips))]);
export const V64_HITBOX_IDS = Object.freeze([...new Set(V64_SHEET_DEFINITIONS.map((sheet) => sheet.hitbox))]);

export function buildSpriteManifestV64(sourceManifest) {
  if (!sourceManifest || typeof sourceManifest !== 'object') throw new TypeError('A source sprite manifest is required.');
  const ids = new Set(V64_SHEET_DEFINITIONS.map((sheet) => sheet.id));
  const cleanSource = clone(sourceManifest);
  cleanSource.sheets = (cleanSource.sheets || []).filter((sheet) => sheet.wave !== 'v64' && !ids.has(sheet.id));
  const manifest = buildSpriteManifestV63(cleanSource);
  manifest.release = 'v64';
  manifest.normalization = {
    status: 'ready',
    report: '/docs/references/V64_PNG_ALPHA_AUDIT.json',
    rawMastersPreserved: true,
    sourceOfTruth: 'Normalized files listed by the V64 manifest are runtime-ready; the V64 PNG audit certifies their alpha and grid contracts.'
  };
  manifest.contracts ||= {};
  manifest.contracts.hitboxes ||= {};
  manifest.clipSets ||= {};
  for (const clipSetId of V64_CLIP_SET_IDS) {
    const clips = SPRITE_CLIP_SETS[clipSetId];
    if (!clips) throw new Error(`Missing runtime clip set ${clipSetId}.`);
    manifest.clipSets[clipSetId] = clips.map((clip) => manifestClip(clip));
  }
  for (const hitboxId of V64_HITBOX_IDS) {
    const hitbox = SPRITE_HITBOXES[hitboxId];
    if (!hitbox) throw new Error(`Missing runtime hitbox ${hitboxId}.`);
    manifest.contracts.hitboxes[hitboxId] = { ...clone(hitbox), unit: 'cell-pixel' };
  }
  manifest.sheets.push(...V64_SHEET_DEFINITIONS.map(clone));
  manifest.sheets.sort((left, right) => left.id.localeCompare(right.id));
  if (manifest.sheets.length !== V64_EXPECTED_ATLASES) throw new Error(`Expected ${V64_EXPECTED_ATLASES} sprite atlases.`);
  if (manifestCellCount(manifest) !== V64_EXPECTED_CELLS) throw new Error(`Expected ${V64_EXPECTED_CELLS} atlas cells.`);
  for (const definition of V64_SHEET_DEFINITIONS) {
    const sheet = manifest.sheets.find((entry) => entry.id === definition.id);
    if (!sheet || sheet.wave !== 'v64' || sheet.sourceFacing !== 'right' || sheet.files?.normalizedStatus !== 'ready') {
      throw new Error(`Invalid V64 manifest contract for ${definition.id}.`);
    }
    const grid = manifest.contracts?.grids?.[sheet.grid];
    const pivot = manifest.contracts?.pivots?.[sheet.pivot];
    const hitbox = manifest.contracts?.hitboxes?.[sheet.hitbox];
    const clips = manifest.clipSets?.[sheet.clips];
    if (!grid || !pivot || !hitbox || !Array.isArray(clips) || clips.length === 0) {
      throw new Error(`${definition.id} references an incomplete autonomous sprite contract.`);
    }
    const frameCount = grid.columns * grid.rows;
    const coveredFrames = clips.flatMap((clip) => clip.frames).sort((left, right) => left - right);
    const expectedFrames = Array.from({ length: frameCount }, (_, frame) => frame);
    if (JSON.stringify(coveredFrames) !== JSON.stringify(expectedFrames)) {
      throw new Error(`${definition.id} does not cover its complete ${sheet.grid} frame grid.`);
    }
    if (hitbox.x < 0 || hitbox.y < 0 || hitbox.x + hitbox.width > grid.cellWidth || hitbox.y + hitbox.height > grid.cellHeight) {
      throw new Error(`${definition.id} has an out-of-bounds hitbox ${sheet.hitbox}.`);
    }
  }
  return manifest;
}

const localAssetPath = (webPath, root) => resolve(root, String(webPath).replace(/^\/+/, ''));

export async function validateV64SpriteAssets(root = V64_REPO_ROOT) {
  const required = V64_SHEET_DEFINITIONS.flatMap((sheet) => [sheet.files.raw, sheet.files.normalized]);
  const missing = [];
  for (const webPath of required) {
    try {
      await access(localAssetPath(webPath, root));
    } catch {
      missing.push(webPath);
    }
  }
  if (missing.length) throw new Error(`Missing V64 sprite asset files: ${missing.join(', ')}.`);
  return Object.freeze({ checked: required.length, missing: Object.freeze([]) });
}

export async function runSpriteManifestSyncV64(argv = process.argv.slice(2)) {
  const checkOnly = argv.includes('--check');
  const originalText = await readFile(V64_SPRITE_MANIFEST_PATH, 'utf8');
  const manifest = buildSpriteManifestV64(JSON.parse(originalText));
  await validateV64SpriteAssets();
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  if (checkOnly) {
    const normalizedOriginal = `${JSON.stringify(JSON.parse(originalText), null, 2)}\n`;
    if (serialized !== normalizedOriginal) throw new Error('Sprite manifest V64 is out of sync; run node scripts/sync-sprite-manifest-v64.mjs.');
    console.log(`Sprite manifest V64 is synchronized: ${V64_EXPECTED_ATLASES} atlases / ${V64_EXPECTED_CELLS} cells.`);
    return manifest;
  }
  await writeFile(V64_SPRITE_MANIFEST_PATH, serialized, 'utf8');
  console.log(`Synchronized ${manifest.sheets.length} sprite atlases / ${manifestCellCount(manifest)} cells for V64.`);
  return manifest;
}

const isMain = Boolean(process.argv[1]) && resolve(process.argv[1]) === modulePath;
if (isMain) runSpriteManifestSyncV64().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

export { manifestCellCount };
