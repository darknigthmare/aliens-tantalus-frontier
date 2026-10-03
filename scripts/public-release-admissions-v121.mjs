import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat,readFile,readdir } from 'node:fs/promises';
import { join,resolve } from 'node:path';
import { REVIEWED_EQUIPMENT_V121 } from '../src/equipment-release-v121.js';
import { ADMITTED_WEAPON_PROFILES_V121 } from '../src/weapon-release-v121.js';
import { VEHICLE_NATIVE_POSES_V121 } from '../src/vehicle-native-visuals-v121.js';
import { BLACK_COCOON_STATIC_PROP_V121 } from '../src/black-cocoon-runtime-v121.js';

export const PUBLIC_EQUIPMENT_FILES_V121=REVIEWED_EQUIPMENT_V121;
export const PUBLIC_SCENERY_FILES_V121=Object.freeze([BLACK_COCOON_STATIC_PROP_V121]);
export const PUBLIC_MEDIA_FILES_V121=Object.freeze([...PUBLIC_EQUIPMENT_FILES_V121,...PUBLIC_SCENERY_FILES_V121]);
export const PUBLIC_RUNTIME_MODULE_PATHS_V121=Object.freeze([
  'src/equipment-release-v121.js','src/weapon-release-v121.js','src/weapon-native-visuals-v121.js',
  'src/weapon-catalog-additions-v121.js','src/weapon-native-extra-v121.js','src/weapon-reference-coverage-v121.js',
  'src/vehicle-native-visuals-v121.js','src/vehicle-catalog-additions-v121.js','src/black-cocoon-state-v121.js','src/black-cocoon-runtime-v121.js',
  'src/apc-convoy-state-v121.js','src/apc-convoy-runtime-v121.js',
  'src/c12-horde-state-v121.js','src/c12-horde-runtime-v121.js'
]);
const paths=new Set(PUBLIC_MEDIA_FILES_V121.map(file=>file.path));
const folders=new Set(PUBLIC_MEDIA_FILES_V121.map(file=>file.path.slice(0,file.path.lastIndexOf('/'))));
const modules=new Set(PUBLIC_RUNTIME_MODULE_PATHS_V121);
export function publicReleasePathAdmissionV121(path,{directory=false}={}) {
  if (typeof path!=='string' || !path || path.includes('\\') || path.startsWith('/')
    || path.split('/').some(part=>!part || part==='.' || part==='..')) return false;
  if (/^docs\/(?:references\/)?(?:V121_|v121-)/i.test(path)) return false;
  if (paths.has(path) || (directory && path===BLACK_COCOON_STATIC_PROP_V121.path.slice(0,BLACK_COCOON_STATIC_PROP_V121.path.lastIndexOf('/')))) return true;
  if (/^assets\/(?:openai\/)?(?:sprites|equipment)\/(?:[^/]+\/)*[^/]*v121(?:[^0-9]|$)/i.test(path))
    return directory?folders.has(path):paths.has(path);
  if (modules.has(path) || path==='scripts/public-release-admissions-v121.mjs') return !directory;
  if (/^(?:src|scripts)\/[^/]*v121(?:[^0-9]|$)/i.test(path)) return false;
  return null;
}
async function checkedBytes(root,filename) {
  let current=root;const parts=filename.split('/');
  for (const [index,part] of parts.entries()) {
    current=join(current,part);const stat=await lstat(current);assert.equal(stat.isSymbolicLink(),false,filename);
    assert.equal(index===parts.length-1?stat.isFile():stat.isDirectory(),true,filename);
  }
  const bytes=await readFile(current);assert.ok(bytes.length,filename);return bytes;
}
export async function verifyPublicAdmissionsV121(projectRoot,{strict=false}={}) {
  const root=resolve(projectRoot);assert.equal((await lstat(root)).isSymbolicLink(),false);
  const profiles=[...ADMITTED_WEAPON_PROFILES_V121,...Object.values(VEHICLE_NATIVE_POSES_V121),
    {...BLACK_COCOON_STATIC_PROP_V121,path:`/${BLACK_COCOON_STATIC_PROP_V121.path}`}];
  for (const file of PUBLIC_MEDIA_FILES_V121) {
    const profile=profiles.find(profile=>profile.path===`/${file.path}`);assert.ok(profile,`Unowned V121 plate: ${file.path}`);
    assert.equal(profile.sha256,file.sha256);assert.equal(profile.canonExact,false);assert.equal(profile.animationStatus,'missing');
    assert.equal(profile.reviewStatus,'accepted-static-adaptation');
    const bytes=await checkedBytes(root,file.path);assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
    assert.ok(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
    assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],[file.width,file.height]);
  }
  for (const filename of PUBLIC_RUNTIME_MODULE_PATHS_V121) await checkedBytes(root,filename);
  if (strict) {
    for (const folder of folders) if (!folder.endsWith('static-import-v106')) for (const entry of await readdir(join(root,folder),{withFileTypes:true})) {
      assert.equal(entry.isSymbolicLink(),false);assert.equal(entry.isFile(),true);
      assert.ok(paths.has(`${folder}/${entry.name}`),`Unapproved V121 plate: ${entry.name}`);
    }
    for (const folder of ['v121-root-weapons','v121-weapons','v121-vehicles','v121-conversations']) {
      try { await lstat(join(root,'docs/references',folder));assert.fail('Private V121 reference leaked: '+folder); }
      catch (error) { if (error.code!=='ENOENT') throw error; }
    }
  }
  return {ok:true,staticEquipmentPlates:PUBLIC_EQUIPMENT_FILES_V121.length,reusedScenery:PUBLIC_SCENERY_FILES_V121.length,runtimeModules:PUBLIC_RUNTIME_MODULE_PATHS_V121.length};
}
