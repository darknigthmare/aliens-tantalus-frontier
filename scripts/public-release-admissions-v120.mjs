import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { WEAPON_NATIVE_PROFILES_V120 } from '../src/weapon-native-visuals-v120.js';
import { VEHICLE_NATIVE_POSES_V120 } from '../src/vehicle-native-visuals-v120.js';

// A separate reviewed list prevents a newly generated candidate or a runtime
// registry edit from silently entering a public build.
export const PUBLIC_EQUIPMENT_FILES_V120 = Object.freeze([
  Object.freeze({path:'assets/openai/equipment/v120-weapons/vp70m-sidearm-native-v120.png',
    sha256:'b2d4016ee71430a80b86363badad6521ee15010b0d3172131909aaaef2215def', width:1254, height:1254}),
  Object.freeze({path:'assets/openai/equipment/v120-weapons/ua-571c-sentry-native-v120.png',
    sha256:'f98ebde0c5ec65a2dc7b8c100cabb82d69d219f145d1ca17de2039e33a3df712', width:1536, height:1024}),
  Object.freeze({path:'assets/openai/equipment/v120-vehicles/p5000-work-loader-native-v120.png',
    sha256:'f3b5e28d729cf89976517cac214dbd8ecec13defd1e620ed302d37d6aca6cd58', width:1086, height:1448})
]);
export const PUBLIC_RUNTIME_MODULE_PATHS_V120 = Object.freeze([
  'src/weapon-native-visuals-v120.js', 'src/weapon-reference-coverage-v120.js',
  'src/vehicle-reference-registry-v120.js', 'src/vehicle-native-visuals-v120.js',
  'src/crew-conversations-v120.js'
]);
const approvedPaths = new Set(PUBLIC_EQUIPMENT_FILES_V120.map(file => file.path));
const approvedFolders = new Set(['assets/openai/equipment/v120-weapons', 'assets/openai/equipment/v120-vehicles']);
const runtimePaths = new Set(PUBLIC_RUNTIME_MODULE_PATHS_V120);

export function publicReleasePathAdmissionV120(path, {directory = false} = {}) {
  if (typeof path !== 'string' || !path || path.includes('\\') || path.startsWith('/')) return false;
  if (path.split('/').some(part => !part || part === '.' || part === '..')) return false;
  if (/^docs\/(?:references\/)?(?:V120_|v120-)/i.test(path)) return false;
  if (/^assets\/(?:openai\/)?(?:sprites|equipment)\/(?:[^/]+\/)*[^/]*v120(?:[^0-9]|$)/i.test(path)) {
    return directory ? approvedFolders.has(path) : approvedPaths.has(path);
  }
  if (runtimePaths.has(path) || path === 'scripts/public-release-admissions-v120.mjs') return !directory;
  return null;
}

async function checkedBytes(root, filename) {
  let current = root;
  const parts = filename.split('/');
  for (const [index, part] of parts.entries()) {
    current = join(current, part);
    const stat = await lstat(current);
    assert.equal(stat.isSymbolicLink(), false, `Linked V120 input: ${filename}`);
    assert.equal(index === parts.length - 1 ? stat.isFile() : stat.isDirectory(), true);
  }
  const bytes = await readFile(current);
  assert.ok(bytes.length, `Empty V120 input: ${filename}`);
  return bytes;
}

export async function verifyPublicAdmissionsV120(projectRoot, {strict = false} = {}) {
  const root = resolve(projectRoot);
  assert.equal((await lstat(root)).isSymbolicLink(), false);
  for (const file of PUBLIC_EQUIPMENT_FILES_V120) {
    const profile = [...WEAPON_NATIVE_PROFILES_V120, ...Object.values(VEHICLE_NATIVE_POSES_V120)]
      .find(profile => profile.path === `/${file.path}`);
    assert.ok(profile, `Unowned V120 plate: ${file.path}`);
    assert.equal(profile.reviewStatus, 'accepted-static-adaptation');
    assert.equal(profile.canonExact, false, 'A reconstruction cannot certify 1:1 geometry.');
    assert.equal(profile.animationStatus, 'missing');
    assert.equal(profile.sha256, file.sha256);
    const bytes = await checkedBytes(root, file.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256);
    assert.ok(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
    assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)], [file.width,file.height]);
  }
  for (const filename of PUBLIC_RUNTIME_MODULE_PATHS_V120) await checkedBytes(root, filename);
  if (strict) {
    for (const folder of approvedFolders) {
      for (const entry of await readdir(join(root, folder), {withFileTypes:true})) {
        assert.equal(entry.isSymbolicLink(), false);
        assert.equal(entry.isFile(), true, `Nested V120 candidate: ${entry.name}`);
        assert.equal(approvedPaths.has(`${folder}/${entry.name}`), true, `Unapproved V120 plate: ${entry.name}`);
      }
    }
    for (const privatePath of ['docs/references/v120-weapons', 'docs/references/v120-vehicles',
      'docs/references/v120-conversations', 'docs/references/v120-storage-relocation-receipt.json']) {
      try {
        await lstat(join(root, privatePath));
        assert.fail(`Private V120 source references leaked: ${privatePath}`);
      } catch(error) { if (error.code !== 'ENOENT') throw error; }
    }
  }
  return {ok:true, staticEquipmentPlates:PUBLIC_EQUIPMENT_FILES_V120.length, runtimeModules:PUBLIC_RUNTIME_MODULE_PATHS_V120.length};
}
