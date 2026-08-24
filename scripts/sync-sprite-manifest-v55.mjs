import { access, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ENEMY_VISUAL_OVERRIDE_HITBOXES_V55,
  ENEMY_VISUAL_OVERRIDES_V55
} from '../src/enemy-visual-overrides-v55.js';
import { NPC_MISSION_IDENTITIES_V55 } from '../src/npc-mission-runtime-v55.js';
import {
  VEHICLE_VISUAL_CLIP_SETS,
  VEHICLE_VISUAL_HITBOXES,
  VEHICLE_VISUAL_PROFILES
} from '../src/vehicle-visual-runtime-v55.js';

export const V55_EXPECTED_ATLASES = 51;
export const V55_EXPECTED_CELLS = 816;
export const V55_NEW_ATLAS_COUNT = 20;

const modulePath = fileURLToPath(import.meta.url);
export const V55_REPO_ROOT = resolve(dirname(modulePath), '..');
export const V55_SPRITE_MANIFEST_PATH = resolve(V55_REPO_ROOT, 'assets/openai/sprites/manifest.json');

const clone = (value) => JSON.parse(JSON.stringify(value));
const rowsForFrames = (frames) => [...new Set(frames.map((frame) => Math.floor(frame / 4)))];
const manifestClip = (clip) => {
  const output = clone(clip);
  const rows = rowsForFrames(output.frames);
  if (rows.length === 1 && output.row === undefined) output.row = rows[0];
  return output;
};
const clip = (id, row, fps, loop, events) => ({
  id,
  row,
  frames: [row * 4, row * 4 + 1, row * 4 + 2, row * 4 + 3],
  fps,
  loop,
  events
});

const NPC_MISSION_CLIPS_V55 = Object.freeze([
  clip('ready', 0, 5, true, [{ frame: 2, type: 'state:mission-ready' }]),
  clip('traversal', 1, 9, true, [
    { frame: 4, type: 'audio:footstep-right' },
    { frame: 6, type: 'audio:footstep-left' }
  ]),
  clip('role-action', 2, 9, false, [{ frame: 10, type: 'interaction:role-action' }]),
  clip('wounded-death', 3, 7, false, [
    { frame: 12, type: 'state:hurt' },
    { frame: 15, type: 'state:death-lock' }
  ])
]);

const OVOMORPH_CYCLE_CLIPS_V55 = Object.freeze([
  clip('sealed', 0, 3, true, [{ frame: 2, type: 'creature:egg-pulse' }]),
  clip('opening', 1, 6, false, [{ frame: 6, type: 'creature:egg-open' }]),
  clip('hatch', 2, 9, false, [{ frame: 10, type: 'combat:hatch-window' }]),
  clip('destroyed', 3, 6, false, [
    { frame: 12, type: 'state:hurt' },
    { frame: 15, type: 'state:death-lock' }
  ])
]);

const runtime = (...consumers) => ({
  status: 'referenced',
  consumers: [...new Set(['src/sprite-animation-runtime.js', ...consumers])]
});

const rawFromNormalized = (path) => path.replace('/sprites/normalized/', '/sprites/');
const files = (raw, normalized) => ({ raw, normalized, normalizedStatus: 'ready' });

const enemyDefinitions = Object.values(ENEMY_VISUAL_OVERRIDES_V55).map((entry) => ({
  id: entry.sheetId,
  family: 'enemy',
  subject: entry.archetype,
  wave: 'v55',
  files: files(rawFromNormalized(entry.path), entry.path),
  grid: 'v50-4x4',
  clips: entry.archetype === 'Ovomorph' ? 'ovomorph-cycle-v55' : 'enemy-action-v54',
  pivot: 'creature-ground',
  hitbox: entry.hitboxId,
  sourceFacing: 'right',
  identityVerified: true,
  runtime: runtime('src/enemy-visual-overrides-v55.js', 'src/enemy-visual-runtime-v53.js', 'src/game.js')
}));

const vehicleDefinitions = Object.values(VEHICLE_VISUAL_PROFILES).map((entry) => ({
  id: entry.sheetId,
  family: 'vehicle',
  subject: entry.catalogName,
  wave: 'v55',
  files: files(entry.masterPath, entry.path),
  grid: 'v50-4x4',
  clips: entry.clipSet,
  pivot: entry.pivot,
  hitbox: entry.hitbox,
  sourceFacing: 'right',
  identityVerified: true,
  runtime: runtime('src/vehicle-visual-runtime-v55.js', 'src/game.js')
}));

const npcDefinitions = Object.values(NPC_MISSION_IDENTITIES_V55).map((entry) => ({
  id: entry.missionSheetId,
  family: 'npc',
  subject: `${entry.name} — mission`,
  wave: 'v55',
  files: files(rawFromNormalized(entry.missionPath), entry.missionPath),
  grid: 'v50-4x4',
  clips: 'npc-mission-v55',
  pivot: 'humanoid-feet',
  hitbox: 'npc-standing',
  sourceFacing: 'right',
  identityVerified: true,
  runtime: runtime('src/npc-mission-runtime-v55.js', 'src/game.js')
}));

export const V55_SHEET_DEFINITIONS = Object.freeze(
  [...enemyDefinitions, ...vehicleDefinitions, ...npcDefinitions]
    .sort((left, right) => left.id.localeCompare(right.id))
    .map((entry) => Object.freeze(entry))
);

export const V55_NEW_SHEET_IDS = Object.freeze(V55_SHEET_DEFINITIONS.map((entry) => entry.id));

export const V55_SHEET_FAMILY_COUNTS = Object.freeze(Object.fromEntries(
  V55_SHEET_DEFINITIONS.reduce((counts, sheet) => {
    counts.set(sheet.family, (counts.get(sheet.family) || 0) + 1);
    return counts;
  }, new Map())
));

const setHitbox = (manifest, id, bounds) => {
  manifest.contracts.hitboxes[id] = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    unit: 'cell-pixel'
  };
};

const addOrReplaceSheet = (manifest, authored) => {
  const index = manifest.sheets.findIndex((sheet) => sheet.id === authored.id);
  if (index < 0) manifest.sheets.push(clone(authored));
  else manifest.sheets[index] = { ...manifest.sheets[index], ...clone(authored) };
};

export function manifestCellCount(manifest) {
  return manifest.sheets.reduce((total, sheet) => {
    const grid = manifest.contracts?.grids?.[sheet.grid];
    if (!grid) throw new Error(`Unknown grid ${String(sheet.grid)} for ${sheet.id}.`);
    return total + Number(grid.columns) * Number(grid.rows);
  }, 0);
}

export function assertSpriteManifestV55(manifest) {
  if (manifest.release !== 'v55') throw new Error(`Expected sprite release v55, received ${String(manifest.release)}.`);
  if (!Array.isArray(manifest.sheets)) throw new Error('Sprite manifest sheets must be an array.');

  const ids = manifest.sheets.map((sheet) => sheet.id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) throw new Error('Duplicate sprite sheet id after v55 synchronization.');
  if (ids.length !== V55_EXPECTED_ATLASES) {
    throw new Error(`Expected ${V55_EXPECTED_ATLASES} sprite atlases, received ${ids.length}.`);
  }

  const v55Sheets = V55_NEW_SHEET_IDS.map((id) => manifest.sheets.find((sheet) => sheet.id === id));
  const missing = V55_NEW_SHEET_IDS.filter((_, index) => !v55Sheets[index]);
  if (missing.length) throw new Error(`Missing v55 sprite atlases: ${missing.join(', ')}.`);
  if (V55_NEW_SHEET_IDS.length !== V55_NEW_ATLAS_COUNT) {
    throw new Error(`Expected ${V55_NEW_ATLAS_COUNT} authored v55 definitions, received ${V55_NEW_SHEET_IDS.length}.`);
  }

  const familyCounts = Object.fromEntries(v55Sheets.reduce((counts, sheet) => {
    counts.set(sheet.family, (counts.get(sheet.family) || 0) + 1);
    return counts;
  }, new Map()));
  for (const [family, expected] of Object.entries({ enemy: 8, vehicle: 4, npc: 8 })) {
    if (familyCounts[family] !== expected) {
      throw new Error(`Expected ${expected} v55 ${family} atlases, received ${familyCounts[family] || 0}.`);
    }
  }

  for (const sheet of v55Sheets) {
    if (sheet.wave !== 'v55') throw new Error(`${sheet.id} is missing wave v55.`);
    if (sheet.files?.normalizedStatus !== 'ready' || !sheet.files?.normalized?.includes('/sprites/normalized/')) {
      throw new Error(`${sheet.id} has no runtime-ready normalized atlas.`);
    }
    if (sheet.sourceFacing !== 'right') throw new Error(`${sheet.id} must use authored facing right.`);
    if (sheet.identityVerified !== true) throw new Error(`${sheet.id} has not passed identity verification.`);
    if (!manifest.clipSets?.[sheet.clips]) throw new Error(`${sheet.id} references missing clip set ${sheet.clips}.`);
    if (!manifest.contracts?.pivots?.[sheet.pivot]) throw new Error(`${sheet.id} references missing pivot ${sheet.pivot}.`);
    if (!manifest.contracts?.hitboxes?.[sheet.hitbox]) throw new Error(`${sheet.id} references missing hitbox ${sheet.hitbox}.`);
  }

  const cells = manifestCellCount(manifest);
  if (cells !== V55_EXPECTED_CELLS) {
    throw new Error(`Expected ${V55_EXPECTED_CELLS} atlas cells, received ${cells}.`);
  }
  return manifest;
}

export function buildSpriteManifestV55(sourceManifest) {
  if (!sourceManifest || typeof sourceManifest !== 'object') throw new TypeError('A source sprite manifest is required.');
  const manifest = clone(sourceManifest);
  manifest.sheets = (manifest.sheets || []).filter((sheet) => sheet.wave !== 'v56');
  manifest.release = 'v55';
  manifest.contracts ||= {};
  manifest.contracts.hitboxes ||= {};
  manifest.clipSets ||= {};
  manifest.sheets ||= [];

  for (const [id, bounds] of Object.entries(ENEMY_VISUAL_OVERRIDE_HITBOXES_V55)) setHitbox(manifest, id, bounds);
  for (const [id, bounds] of Object.entries(VEHICLE_VISUAL_HITBOXES)) setHitbox(manifest, id, bounds);

  if (!manifest.clipSets['enemy-action-v54']) throw new Error('The v54 enemy action clip set is required before v55 synchronization.');
  manifest.clipSets['npc-mission-v55'] = NPC_MISSION_CLIPS_V55.map(manifestClip);
  manifest.clipSets['ovomorph-cycle-v55'] = OVOMORPH_CYCLE_CLIPS_V55.map(manifestClip);
  for (const [id, set] of Object.entries(VEHICLE_VISUAL_CLIP_SETS)) {
    manifest.clipSets[id] = set.clips.map(manifestClip);
  }

  for (const authored of V55_SHEET_DEFINITIONS) addOrReplaceSheet(manifest, authored);
  manifest.sheets.sort((left, right) => left.id.localeCompare(right.id));
  return assertSpriteManifestV55(manifest);
}

const localAssetPath = (webPath, root) => resolve(root, String(webPath).replace(/^\/+/, ''));

export async function validateV55SpriteAssets(root = V55_REPO_ROOT) {
  const required = [...new Set(V55_SHEET_DEFINITIONS.flatMap((sheet) => [sheet.files.raw, sheet.files.normalized]))];
  const missing = [];
  for (const webPath of required) {
    try {
      await access(localAssetPath(webPath, root));
    } catch {
      missing.push(webPath);
    }
  }
  if (missing.length) throw new Error(`Missing v55 sprite asset files: ${missing.join(', ')}.`);
  return Object.freeze({ checked: required.length, missing: Object.freeze([]) });
}

export async function runSpriteManifestSyncV55(argv = process.argv.slice(2)) {
  const checkOnly = argv.includes('--check');
  const dryRun = argv.includes('--dry-run') || argv.includes('--summary');
  const originalText = await readFile(V55_SPRITE_MANIFEST_PATH, 'utf8');
  const manifest = buildSpriteManifestV55(JSON.parse(originalText));
  const assets = await validateV55SpriteAssets();
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;

  if (dryRun) {
    console.log(JSON.stringify({
      release: manifest.release,
      atlases: manifest.sheets.length,
      cells: manifestCellCount(manifest),
      newAtlases: V55_NEW_SHEET_IDS.length,
      families: V55_SHEET_FAMILY_COUNTS,
      assetFilesChecked: assets.checked,
      wroteManifest: false
    }, null, 2));
    return manifest;
  }

  if (checkOnly) {
    const normalizedOriginal = `${JSON.stringify(JSON.parse(originalText), null, 2)}\n`;
    if (serialized !== normalizedOriginal) {
      throw new Error('Sprite manifest v55 is out of sync; run node scripts/sync-sprite-manifest-v55.mjs.');
    }
    console.log(`Sprite manifest v55 is synchronized: ${V55_EXPECTED_ATLASES} atlases / ${V55_EXPECTED_CELLS} cells.`);
    return manifest;
  }

  await writeFile(V55_SPRITE_MANIFEST_PATH, serialized, 'utf8');
  console.log(`Synchronized ${manifest.sheets.length} sprite atlases / ${manifestCellCount(manifest)} cells for v55 runtime truth.`);
  return manifest;
}

const isMain = Boolean(process.argv[1]) && resolve(process.argv[1]) === modulePath;
if (isMain) {
  runSpriteManifestSyncV55().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
