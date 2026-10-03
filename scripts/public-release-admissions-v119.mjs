import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { PLAYER_COSTUME_ASSETS_V119, PLAYER_COSTUME_SKIN_V119 } from '../src/player-costume-skins-v119.js';

// Deliberately independent of the runtime registry: adding another skin or SDK
// to that registry must not implicitly admit its files into a public release.
const costumeFolder = 'assets/openai/sprites/player/costumes-v119';
const deliveredSkinFolder = `${costumeFolder}/nostromo-crew`;
export const PUBLIC_COSTUME_ASSET_PATHS_V119 = Object.freeze([
  `${deliveredSkinFolder}/locomotion.png`, `${deliveredSkinFolder}/combat.png`,
  `${deliveredSkinFolder}/melee.png`, `${deliveredSkinFolder}/interaction.png`,
  `${deliveredSkinFolder}/tool-use.png`
]);
export const PUBLIC_VENDOR_FILES_V119 = Object.freeze([
  Object.freeze({ path: 'src/vendor/supabase-2.117.2.js', sha256: '59d39487c3589843b410322d8a3d562ce022aba1e5ccb16898ef3fb2a0da2ecd' }),
  Object.freeze({ path: 'src/vendor/supabase-LICENSE.txt', sha256: '334dd6820e2eaeab2064e7c59001b810566728a28a41a7c1dbf69bbee17d0936' })
]);
export const PUBLIC_RUNTIME_MODULE_PATHS_V119 = Object.freeze([
  'src/franchise-costumes-v119.js', 'src/player-costume-skins-v119.js', 'src/costume-ui-v119.js',
  'src/cloud-auth-v119.js', 'src/cloud-save-v119.js', 'src/cloud-sync-v119.js', 'src/cloud-ui-v119.js'
]);
export const PUBLIC_ROOT_FILE_PATHS_V119 = Object.freeze(['xeno-trials-fullscreen-v119.css']);
export const PUBLIC_SCRIPT_PATH_V119 = 'scripts/public-release-admissions-v119.mjs';
export const DEVELOPMENT_ONLY_PATHS_V119 = Object.freeze([
  'depth-lab-v97.html', 'depth-lab-v97.css', 'src/depth-lab-v97.js', 'src/depth-lab-model-v97.js'
]);
const developmentPaths = new Set(DEVELOPMENT_ONLY_PATHS_V119);
const costumePaths = new Set(PUBLIC_COSTUME_ASSET_PATHS_V119);
const vendorPaths = new Set(PUBLIC_VENDOR_FILES_V119.map(file => file.path));
const folders = new Set([costumeFolder, deliveredSkinFolder, 'src/vendor']);
const additions = new Set([...PUBLIC_RUNTIME_MODULE_PATHS_V119, ...PUBLIC_ROOT_FILE_PATHS_V119, PUBLIC_SCRIPT_PATH_V119]);

// Three states: exact V119 admission, rejected protected scope, or null so the
// existing public path/privacy policy still decides. Never bypass that policy's
// lexical, private-segment or private-text checks when composing these rules.
export function publicReleasePathAdmissionV119(path, { directory = false } = {}) {
  if (typeof path !== 'string' || !path || path.includes('\\') || path.startsWith('/')) return false;
  if (path.split('/').some(part => !part || part === '.' || part === '..')) return false;
  if (developmentPaths.has(path)) return false;
  if (/^src\/vendor(?:\/|$)/i.test(path)) return directory ? path === 'src/vendor' : vendorPaths.has(path);
  if (/^assets\/openai\/(?:sprites|equipment)\/(?:[^/]+\/)*[^/]*v119(?:[^0-9]|$)/i.test(path)) {
    return directory ? folders.has(path) : costumePaths.has(path);
  }
  if (additions.has(path)) return !directory;
  return null;
}

export function validatePlayerCostumeAdmissionsV119() {
  assert.equal(PLAYER_COSTUME_SKIN_V119.id, 'player.nostromo-crew-v119');
  assert.equal(PLAYER_COSTUME_SKIN_V119.visualStatus, 'adapted-dedicated-atlas');
  assert.equal(PLAYER_COSTUME_SKIN_V119.exact, false);
  assert.equal(PLAYER_COSTUME_ASSETS_V119.length, 5, 'Exactly the five delivered costume atlases are admitted.');
  assert.deepEqual(PLAYER_COSTUME_ASSETS_V119.map(asset => asset.path.slice(1)).sort(), [...costumePaths].sort());
  for (const asset of PLAYER_COSTUME_ASSETS_V119) {
    assert.equal(asset.family, 'player');
    assert.equal(asset.id, `player.nostromo-crew-v119.${asset.kind}`);
    assert.equal(asset.path, `/${deliveredSkinFolder}/${asset.kind}.png`);
    assert.match(asset.sha256, /^[a-f0-9]{64}$/);
    assert.deepEqual([asset.sourceWidth, asset.sourceHeight], [1254, 1254]);
    assert.equal(asset.frames.length, 16);
  }
  return true;
}

async function regularFileBytes(root, path) {
  const parts = path.split('/');
  let current = root;
  for (const [index, part] of parts.entries()) {
    current = join(current, part);
    const entry = await lstat(current);
    assert.equal(entry.isSymbolicLink(), false, `Linked V119 release input: ${path}`);
    assert.equal(index === parts.length - 1 ? entry.isFile() : entry.isDirectory(), true, `Unsupported V119 release input: ${path}`);
  }
  const bytes = await readFile(current);
  assert.ok(bytes.length, `Empty V119 release input: ${path}`);
  return bytes;
}

// Additional mandatory V119 gate, not a replacement for the public verifier.
// Source validation permits private candidates; strict export validation rejects
// extras within the two new protected subtrees after the copy filter runs.
export async function verifyPublicAdmissionsV119(projectRoot, { strict = false } = {}) {
  validatePlayerCostumeAdmissionsV119();
  const root = resolve(projectRoot);
  assert.equal((await lstat(root)).isSymbolicLink(), false, 'V119 release root cannot be a link.');
  const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
  for (const asset of PLAYER_COSTUME_ASSETS_V119) {
    const bytes = await regularFileBytes(root, asset.path.slice(1));
    assert.equal(sha256(bytes), asset.sha256, `Costume checksum mismatch: ${asset.path}`);
    assert.ok(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `Invalid costume PNG: ${asset.path}`);
    assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], [asset.sourceWidth, asset.sourceHeight]);
  }
  for (const file of PUBLIC_VENDOR_FILES_V119) {
    assert.equal(sha256(await regularFileBytes(root, file.path)), file.sha256, `Vendor checksum mismatch: ${file.path}`);
  }
  for (const path of [...PUBLIC_RUNTIME_MODULE_PATHS_V119, ...PUBLIC_ROOT_FILE_PATHS_V119]) await regularFileBytes(root, path);
  if (strict) {
    for (const path of DEVELOPMENT_ONLY_PATHS_V119) {
      try {
        await lstat(join(root, path));
      } catch (error) {
        if (error?.code === 'ENOENT') continue;
        throw error;
      }
      assert.fail(`Development-only input in V119 export: ${path}`);
    }
    async function walk(folder) {
      for (const entry of await readdir(join(root, folder), { withFileTypes: true })) {
        const path = `${folder}/${entry.name}`;
        assert.equal(entry.isSymbolicLink(), false, `Linked V119 export: ${path}`);
        assert.equal(publicReleasePathAdmissionV119(path, { directory: entry.isDirectory() }), true, `Unapproved V119 export: ${path}`);
        if (entry.isDirectory()) await walk(path);
      }
    }
    await walk(costumeFolder);
    await walk('src/vendor');
  }
  return { ok: true, costumeAtlases: 5, costumePoses: 80, vendorFiles: 2, runtimeModules: PUBLIC_RUNTIME_MODULE_PATHS_V119.length };
}
