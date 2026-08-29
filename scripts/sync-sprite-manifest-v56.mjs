import { access, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  NPC_MISSION_IDENTITIES_V55,
  NPC_MISSION_IDENTITIES_V56
} from '../src/npc-mission-runtime-v55.js';
import { SPRITE_CLIP_SETS, SPRITE_HITBOXES, SPRITE_PIVOTS, SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';
import { WEAPON_VISUAL_PROFILES_V56 } from '../src/weapon-visual-runtime-v56.js';
import { EQUIPMENT_VISUAL_PROFILES_V56 } from '../src/equipment-visual-runtime-v56.js';
import {
  V55_EXPECTED_ATLASES,
  V55_EXPECTED_CELLS,
  V55_SPRITE_MANIFEST_PATH,
  buildSpriteManifestV55,
  manifestCellCount
} from './sync-sprite-manifest-v55.mjs';

const modulePath = fileURLToPath(import.meta.url);
export const V56_REPO_ROOT = resolve(dirname(modulePath), '..');
export const V56_SPRITE_MANIFEST_PATH = V55_SPRITE_MANIFEST_PATH;

const clone = (value) => JSON.parse(JSON.stringify(value));
const rowsForFrames = (frames, columns = 4) => [...new Set(frames.map((frame) => Math.floor(frame / columns)))];
const manifestClip = (clip, columns = 4) => {
  const output = clone(clip);
  const rows = rowsForFrames(output.frames, columns);
  if (rows.length === 1 && output.row === undefined) output.row = rows[0];
  return output;
};
const rawFromNormalized = (path) => path.replace('/sprites/normalized/', '/sprites/');
const runtime = (...consumers) => ({
  status: 'referenced',
  consumers: [...new Set(['src/sprite-animation-runtime.js', ...consumers])]
});

const legacyIds = new Set(Object.values(NPC_MISSION_IDENTITIES_V55).map((entry) => entry.missionSheetId));
const V56_RUNTIME_SHEET_IDS = Object.freeze([
  'player.echo9-marine.melee',
  'player.echo9-marine.interaction',
  'player.echo9-marine.tool-use',
  'enemy.xenomorph-big-chap.action.v56',
  'enemy.xenomorph-warrior.action.v56',
  'enemy.xenomorph-queen.action.v56',
  'enemy.xenoborg.action.v56',
  'enemy.weyland-yutani-commando.action.v56',
  'enemy.seegson-security.action.v56',
  'enemy.xenomorph-boiler.action.v56',
  'enemy.xenomorph-prowler.action.v56',
  'enemy.xenomorph-burster.action.v56',
  'vehicle.m40-ridgeway-heavy-tank.action.v56',
  'vehicle.ud4b-cheyenne-dropship.action.v56',
  'vehicle.narcissus-lifeboat.action.v56',
  'vehicle.lander-one-class-e.action.v56',
  'vehicle.rt01-group-transport.action.v56',
  'vehicle.nr9-euv01-atv.action.v56',
  'vehicle.daihotai-tractor.action.v56',
  'vehicle.eva7c-pressure-pod.action.v56',
  'enemy.monica-line.action.v56',
  'enemy.specimen-six-line.action.v56',
  'enemy.dust-runner.action.v56',
  'enemy.trilobite-echo.action.v56',
  'enemy.deacon-line.action.v56',
  'enemy.protomorph.action.v56',
  'enemy.abomination-pathogen-brute.action.v56',
  'enemy.upp-vanguard.action.v56',
  'enemy.wild-boar-host.action.v56',
  'vehicle.combat-power-loader.action.v56',
  'vehicle.ua571-remote-sentry-carrier.action.v56',
  'vehicle.seegson-maintenance-tram.action.v56',
  'vehicle.crucible-caravan-crawler.action.v56',
  'vehicle.uscm-assault-gunship.action.v56',
  'vehicle.orbital-lifeboat.action.v56',
  'vehicle.colony-cargo-lifter.action.v56',
  'vehicle.weyland-yutani-executive-shuttle.action.v56',
  'enemy.foundry-drone.action.v56',
  'enemy.foundry-crusher.action.v56',
  'enemy.reef-stalker.action.v56',
  'enemy.reef-spitter.action.v56',
  'enemy.siege-royal.action.v56',
  'enemy.salvage-hive-brute.action.v56',
  'enemy.arcology-lurker.action.v56',
  'enemy.caravan-stalker.action.v56',
  'enemy.cult-host.action.v56',
  'vehicle.upp-combat-aerodyne.action.v56',
  'vehicle.hyperdyne-synthetic-carrier.action.v56',
  'vehicle.atmospheric-processor-elevator.action.v56',
  'vehicle.maglev-personnel-car.action.v56',
  'vehicle.ripper-siege-loader.action.v56',
  'enemy.neuro-xeno-drone.action.v56',
  'enemy.atarax-ripper.action.v56',
  'enemy.colonial-raider.action.v56',
  'enemy.atarax-controller.action.v56',
  'enemy.korari-stalker.action.v56',
  'enemy.ceto-reef-predator.action.v56',
  'enemy.tantalus-tunnel-vermin.action.v56',
  'vehicle.ceto-patrol-boat.action.v56',
  'vehicle.tantalus-command-skiff.action.v56',
  'vehicle.echo-9-recon-bike.action.v56',
  'vehicle.neuro-xeno-transport-rig.action.v56',
  'vehicle.mining-bore-crawler.action.v56',
  'vehicle.ice-driller.action.v56',
  'vehicle.reef-hydrofoil.action.v56',
  ...WEAPON_VISUAL_PROFILES_V56.filter((entry) => entry.sheetId !== 'weapon.m41a-pulse-rifle.action')
    .map((entry) => entry.sheetId),
  ...EQUIPMENT_VISUAL_PROFILES_V56
    .filter((entry) => !entry.manifestAlias)
    .map((entry) => entry.sheetId)
]);

const npcDefinitions = Object.values(NPC_MISSION_IDENTITIES_V56)
  .filter((entry) => !legacyIds.has(entry.missionSheetId))
  .map((entry) => ({
    id: entry.missionSheetId,
    family: 'npc',
    subject: `${entry.name} - mission`,
    wave: 'v56',
    files: {
      raw: rawFromNormalized(entry.missionPath),
      normalized: entry.missionPath,
      normalizedStatus: 'ready'
    },
    grid: 'v50-4x4',
    clips: 'npc-mission-v55',
    pivot: 'humanoid-feet',
    hitbox: 'npc-standing',
    sourceFacing: 'right',
    identityVerified: true,
    runtime: runtime('src/npc-mission-runtime-v55.js', 'src/game.js')
  }));

const runtimeDefinitions = V56_RUNTIME_SHEET_IDS.map((id) => {
  const entry = SPRITE_SHEETS[id];
  if (!entry) throw new Error(`Missing runtime sprite definition for ${id}.`);
  return {
    id: entry.id,
    family: entry.family,
    subject: entry.id,
    wave: 'v56',
    files: {
      raw: rawFromNormalized(entry.path),
      normalized: entry.path,
      normalizedStatus: 'ready'
    },
    grid: entry.columns === 2 && entry.rows === 2 ? 'v56-equipment-2x2' : 'v50-4x4',
    clips: entry.clipSet,
    pivot: entry.pivot,
    hitbox: entry.hitbox,
    sourceFacing: entry.sourceFacing < 0 ? 'left' : 'right',
    identityVerified: entry.identityVerified === true,
    runtime: runtime(
      entry.family === 'enemy'
        ? 'src/enemy-visual-overrides-v56.js'
        : entry.family === 'vehicle'
          ? 'src/vehicle-visual-overrides-v56.js'
          : entry.family === 'equipment'
            ? 'src/equipment-visual-runtime-v56.js'
            : 'src/game-v51-runtime.js',
      entry.family === 'equipment' ? 'src/app.js' : 'src/game-v52-runtime.js'
    )
  };
});

export const V56_SHEET_DEFINITIONS = Object.freeze(
  [...npcDefinitions, ...runtimeDefinitions]
    .sort((left, right) => left.id.localeCompare(right.id))
    .map((entry) => Object.freeze(entry))
);

export const V56_NEW_SHEET_IDS = Object.freeze(V56_SHEET_DEFINITIONS.map((entry) => entry.id));
export const V56_NEW_ATLAS_COUNT = V56_NEW_SHEET_IDS.length;
export const V56_EXPECTED_ATLASES = V55_EXPECTED_ATLASES + V56_NEW_ATLAS_COUNT;
export const V56_EXPECTED_CELLS = V55_EXPECTED_CELLS + V56_SHEET_DEFINITIONS.reduce(
  (total, entry) => total + (entry.grid === 'v56-equipment-2x2' ? 4 : 16),
  0
);

export const V56_SHEET_FAMILY_COUNTS = Object.freeze(Object.fromEntries(
  V56_SHEET_DEFINITIONS.reduce((counts, sheet) => {
    counts.set(sheet.family, (counts.get(sheet.family) || 0) + 1);
    return counts;
  }, new Map())
));

const addOrReplaceSheet = (manifest, authored) => {
  const index = manifest.sheets.findIndex((sheet) => sheet.id === authored.id);
  if (index < 0) manifest.sheets.push(clone(authored));
  else manifest.sheets[index] = { ...manifest.sheets[index], ...clone(authored) };
};

export function assertSpriteManifestV56(manifest) {
  if (manifest.release !== 'v56') {
    throw new Error(`Expected sprite release v56, received ${String(manifest.release)}.`);
  }
  if (!Array.isArray(manifest.sheets)) throw new Error('Sprite manifest sheets must be an array.');

  const ids = manifest.sheets.map((sheet) => sheet.id);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate sprite sheet id after v56 synchronization.');
  if (ids.length !== V56_EXPECTED_ATLASES) {
    throw new Error(`Expected ${V56_EXPECTED_ATLASES} sprite atlases, received ${ids.length}.`);
  }
  if (V56_NEW_SHEET_IDS.length !== V56_NEW_ATLAS_COUNT) {
    throw new Error(`Expected ${V56_NEW_ATLAS_COUNT} authored v56 definitions, received ${V56_NEW_SHEET_IDS.length}.`);
  }

  for (const definition of V56_SHEET_DEFINITIONS) {
    const sheet = manifest.sheets.find((candidate) => candidate.id === definition.id);
    if (!sheet) throw new Error(`Missing v56 sprite atlas: ${definition.id}.`);
    if (sheet.wave !== 'v56') throw new Error(`${sheet.id} is missing wave v56.`);
    if (sheet.family !== definition.family) throw new Error(`${sheet.id} must remain in the ${definition.family} family.`);
    if (sheet.files?.normalizedStatus !== 'ready') throw new Error(`${sheet.id} has no ready normalized atlas.`);
    if (!manifest.contracts?.grids?.[sheet.grid]) throw new Error(`${sheet.id} references missing grid ${sheet.grid}.`);
    if (sheet.family === 'equipment' && sheet.grid !== 'v56-equipment-2x2') {
      throw new Error(`${sheet.id} must use the dedicated 2x2 equipment grid.`);
    }
    if (sheet.sourceFacing !== 'right') throw new Error(`${sheet.id} must use authored facing right.`);
    if (sheet.identityVerified !== true) throw new Error(`${sheet.id} has not passed identity verification.`);
    if (!manifest.clipSets?.[sheet.clips]) throw new Error(`${sheet.id} references missing clips ${sheet.clips}.`);
    if (!manifest.contracts?.pivots?.[sheet.pivot]) throw new Error(`${sheet.id} references missing pivot ${sheet.pivot}.`);
    if (!manifest.contracts?.hitboxes?.[sheet.hitbox]) throw new Error(`${sheet.id} references missing hitbox ${sheet.hitbox}.`);
  }

  const cells = manifestCellCount(manifest);
  if (cells !== V56_EXPECTED_CELLS) {
    throw new Error(`Expected ${V56_EXPECTED_CELLS} atlas cells, received ${cells}.`);
  }
  return manifest;
}

export function buildSpriteManifestV56(sourceManifest) {
  if (!sourceManifest || typeof sourceManifest !== 'object') throw new TypeError('A source sprite manifest is required.');
  const cleanSource = clone(sourceManifest);
  cleanSource.sheets = (cleanSource.sheets || []).filter((sheet) => !['v59', 'v61'].includes(sheet.wave) && !V56_NEW_SHEET_IDS.includes(sheet.id));

  const manifest = buildSpriteManifestV55(cleanSource);
  manifest.contracts ||= {};
  manifest.contracts.grids ||= {};
  manifest.contracts.grids['v56-equipment-2x2'] = {
    columns: 2,
    rows: 2,
    cellWidth: 256,
    cellHeight: 256,
    guard: 16,
    frameOrder: 'row-major'
  };
  manifest.contracts.pivots ||= {};
  manifest.contracts.hitboxes ||= {};
  for (const entry of runtimeDefinitions) {
    const pivot = SPRITE_PIVOTS[entry.pivot];
    if (!pivot) throw new Error(`Missing runtime pivot ${entry.pivot}.`);
    manifest.contracts.pivots[entry.pivot] = {
      kind: pivot.kind,
      x: pivot.x,
      y: pivot.y,
      unit: 'cell-pixel'
    };
    const bounds = SPRITE_HITBOXES[entry.hitbox];
    if (!bounds) throw new Error(`Missing runtime hitbox ${entry.hitbox}.`);
    manifest.contracts.hitboxes[entry.hitbox] = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      unit: 'cell-pixel'
    };
  }
  manifest.release = 'v56';
  for (const clipSetId of new Set(runtimeDefinitions.map((entry) => entry.clips))) {
    const clips = SPRITE_CLIP_SETS[clipSetId];
    if (!clips) throw new Error(`Missing runtime clip set ${clipSetId}.`);
    const definition = runtimeDefinitions.find((entry) => entry.clips === clipSetId);
    const columns = definition?.grid === 'v56-equipment-2x2' ? 2 : 4;
    manifest.clipSets[clipSetId] = clips.map((clip) => manifestClip(clip, columns));
  }
  for (const authored of V56_SHEET_DEFINITIONS) addOrReplaceSheet(manifest, authored);
  manifest.sheets.sort((left, right) => left.id.localeCompare(right.id));
  return assertSpriteManifestV56(manifest);
}

const localAssetPath = (webPath, root) => resolve(root, String(webPath).replace(/^\/+/, ''));

export async function validateV56SpriteAssets(root = V56_REPO_ROOT) {
  const required = [...new Set(V56_SHEET_DEFINITIONS.flatMap((sheet) => [
    sheet.files.raw,
    sheet.files.normalized
  ]))];
  const missing = [];
  for (const webPath of required) {
    try {
      await access(localAssetPath(webPath, root));
    } catch {
      missing.push(webPath);
    }
  }
  if (missing.length) throw new Error(`Missing v56 sprite asset files: ${missing.join(', ')}.`);
  return Object.freeze({ checked: required.length, missing: Object.freeze([]) });
}

export async function runSpriteManifestSyncV56(argv = process.argv.slice(2)) {
  const checkOnly = argv.includes('--check');
  const dryRun = argv.includes('--dry-run') || argv.includes('--summary');
  const originalText = await readFile(V56_SPRITE_MANIFEST_PATH, 'utf8');
  const manifest = buildSpriteManifestV56(JSON.parse(originalText));
  const assets = await validateV56SpriteAssets();
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;

  if (dryRun) {
    console.log(JSON.stringify({
      release: manifest.release,
      atlases: manifest.sheets.length,
      cells: manifestCellCount(manifest),
      newAtlases: V56_NEW_SHEET_IDS.length,
      families: V56_SHEET_FAMILY_COUNTS,
      assetFilesChecked: assets.checked,
      wroteManifest: false
    }, null, 2));
    return manifest;
  }

  if (checkOnly) {
    const normalizedOriginal = `${JSON.stringify(JSON.parse(originalText), null, 2)}\n`;
    if (serialized !== normalizedOriginal) {
      throw new Error('Sprite manifest v56 is out of sync; run node scripts/sync-sprite-manifest-v56.mjs.');
    }
    console.log(`Sprite manifest v56 is synchronized: ${V56_EXPECTED_ATLASES} atlases / ${V56_EXPECTED_CELLS} cells.`);
    return manifest;
  }

  await writeFile(V56_SPRITE_MANIFEST_PATH, serialized, 'utf8');
  console.log(`Synchronized ${manifest.sheets.length} sprite atlases / ${manifestCellCount(manifest)} cells for v56 runtime truth.`);
  return manifest;
}

const isMain = Boolean(process.argv[1]) && resolve(process.argv[1]) === modulePath;
if (isMain) {
  runSpriteManifestSyncV56().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

export { manifestCellCount };
