import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { PLAYER_COSTUME_ASSETS_V165, PLAYER_COSTUME_SKINS_V165 } from '../src/player-costume-atlases-v165.js';
import { PLAYER_COSTUME_PART_ASSETS_V165 } from '../src/player-costume-parts-v165.js';
import { PLAYER_COSTUME_OUTFITS_V165, PLAYER_COSTUME_LINKED_OUTFITS_V165 } from '../src/player-costume-outfits-v165.js';
import { getPlayerCostumeSkinV119 } from '../src/player-costume-skins-v119.js';

const slugs = ['amanda-working', 'working-joe-uniform', 'sevastopol-security'];
const partSlugs = [...slugs, 'ripley-bomber', 'bishop-utility',
  'fireteam-seegson-maintenance', 'fireteam-nostromo-jacket', 'fireteam-flightsuit',
  'vasquez-bdu', 'rain-jacket'];
const kinds = ['locomotion', 'combat', 'melee', 'interaction', 'tool-use'];
const previewRoot = 'assets/openai/sprites/player/costumes-v165';
const partsRoot = 'assets/openai/sprites/player/costume-parts-v165';
// Independent exact admissions: a new runtime record cannot admit another file.
export const PUBLIC_COSTUME_ASSET_PATHS_V165 = Object.freeze([
  ...slugs.flatMap(slug => kinds.map(kind => `${previewRoot}/${slug}/${kind}.png`)),
  ...partSlugs.flatMap(slug => ['upper', 'legs'].map(kind => `${partsRoot}/${slug}/${kind}.png`)),
  `${partsRoot}/sevastopol-security/helmet.png`
]);
export const PUBLIC_COSTUME_RUNTIME_PATHS_V165 = Object.freeze([
  'src/player-costume-atlases-v165.js', 'src/player-costume-parts-v165.js', 'src/player-costume-outfits-v165.js'
]);
export const PUBLIC_COSTUME_SCRIPT_PATHS_V165 = Object.freeze([
  'scripts/public-costume-admissions-v165.mjs', 'scripts/verify-costume-atlases-v165.mjs',
  'scripts/qa-costume-atlases-v165.py'
]);
const files = new Set(PUBLIC_COSTUME_ASSET_PATHS_V165);
const modules = new Set([...PUBLIC_COSTUME_RUNTIME_PATHS_V165, ...PUBLIC_COSTUME_SCRIPT_PATHS_V165]);
const folders = new Set([previewRoot, partsRoot,
  ...slugs.map(slug => `${previewRoot}/${slug}`), ...partSlugs.map(slug => `${partsRoot}/${slug}`)]);

/** Three-state addition to the existing lexical/privacy admission policy. */
export function publicCostumePathAdmissionV165(path, { directory = false } = {}) {
  if (typeof path !== 'string' || !path || path.startsWith('/') || path.includes('\\')
    || path.split('/').some(part => !part || part === '.' || part === '..')) return false;
  if ([previewRoot, partsRoot].some(root => path === root || path.startsWith(root + '/'))) {
    return directory ? folders.has(path) : files.has(path);
  }
  if (modules.has(path)) return !directory;
  return null;
}

async function bytesAt(root, path) {
  const pieces = path.split('/'); let current = root;
  for (const [index, piece] of pieces.entries()) {
    current = join(current, piece);
    const stat = await lstat(current);
    assert.equal(stat.isSymbolicLink(), false, `Linked costume input: ${path}`);
    assert.equal(index === pieces.length - 1 ? stat.isFile() : stat.isDirectory(), true);
  }
  const bytes = await readFile(current); assert.ok(bytes.length); return bytes;
}

export async function verifyPublicCostumeAdmissionsV165(projectRoot, { strict = false, built = false } = {}) {
  const root = resolve(projectRoot);
  assert.equal(typeof built, 'boolean', 'The source/built costume admission mode must be explicit.');
  assert.equal((await lstat(root)).isSymbolicLink(), false);
  assert.equal(PLAYER_COSTUME_OUTFITS_V165.length, 10);
  assert.equal(PLAYER_COSTUME_LINKED_OUTFITS_V165.length, 2);
  assert.equal(PLAYER_COSTUME_PART_ASSETS_V165.length, 21);
  assert.equal(PLAYER_COSTUME_ASSETS_V165.length, 15);
  assert.deepEqual(PLAYER_COSTUME_OUTFITS_V165.map(outfit => outfit.slug), partSlugs);
  for (const outfit of PLAYER_COSTUME_OUTFITS_V165) {
    assert.equal(outfit.exact, false);
    assert.equal(outfit.runtimeMode, 'separated-echo9-parts');
    assert.equal(getPlayerCostumeSkinV119(outfit.costumeId), null,
      'Reference boards must never replace the actual held weapon in gameplay.');
  }
  for (const skin of PLAYER_COSTUME_SKINS_V165) {
    assert.equal(skin.admission, 'reference-preview-only-not-playable-skin');
    assert.equal(skin.runtimeMode, 'preview-only-v165');
    assert.equal(skin.exact, false); assert.equal(skin.atlases.length, 5);
    assert.deepEqual(skin.atlases.map(asset => asset.kind), kinds);
    for (const atlas of skin.atlases) assert.equal(atlas.frames.length, 16);
  }
  const assets = [...PLAYER_COSTUME_ASSETS_V165, ...PLAYER_COSTUME_PART_ASSETS_V165];
  assert.equal(new Set(assets.map(asset => asset.path)).size, assets.length);
  assert.deepEqual(assets.map(asset => asset.path.slice(1)).sort(), [...files].sort());
  for (const asset of assets) {
    const bytes = await bytesAt(root, asset.path.slice(1));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, `Costume SHA differs: ${asset.path}`);
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], [asset.sourceWidth, asset.sourceHeight]);
    assert.equal(bytes[24], 8); assert.equal(bytes[25], 6); assert.equal(bytes[28], 0);
  }
  for (const path of PUBLIC_COSTUME_RUNTIME_PATHS_V165) await bytesAt(root, path);
  // The distribution deliberately omits Node/Python tooling. Runtime inputs
  // retain identical admissions in both modes; source still requires its QA.
  if (!built) for (const path of PUBLIC_COSTUME_SCRIPT_PATHS_V165) await bytesAt(root, path);
  if (strict) {
    const walk = async folder => {
      for (const entry of await readdir(join(root, folder), { withFileTypes: true })) {
        const path = folder + '/' + entry.name;
        assert.equal(entry.isSymbolicLink(), false);
        assert.equal(publicCostumePathAdmissionV165(path, { directory: entry.isDirectory() }), true,
          `Unapproved costume export: ${path}`);
        if (entry.isDirectory()) await walk(path);
      }
    };
    await walk(previewRoot); await walk(partsRoot);
  }
  return { ok: true, modularOutfits: 10, linkedExistingOutfits: 2, equippableModularOutfits: 12,
    nativePartAtlases: 21, previewAtlases: 15,
    previewPoseCells: 240, newPlayablePrecompositedSkins: 0, approved1to1: 0 };
}
