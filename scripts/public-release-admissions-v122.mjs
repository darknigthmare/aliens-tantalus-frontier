import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { REVIEWED_EQUIPMENT_V122, isEquipmentAdmittedV122 } from '../src/equipment-release-v122.js';
import { WEAPON_NATIVE_PROFILES_V122 } from '../src/weapon-native-weapons-v122.js';
import { VEHICLE_NATIVE_POSES_V122 } from '../src/vehicle-native-visuals-v122.js';
import { ENEMY_IMPORT_ANIMATIONS_V122 } from '../src/enemy-import-animation-v107.js';

export const PUBLIC_EQUIPMENT_FILES_V122 = REVIEWED_EQUIPMENT_V122;
// Independent admission: changing the mutable generator/atlas data is insufficient.
export const PUBLIC_WALK_FILES_V122 = Object.freeze([
  ['synth-incinerator-walk.png','70cb1a78b6abdc1821192b16028e4021dc7f3380b566e6aec8174635b921fc8f'],
  ['synth-containment-walk.png','e14c7873202afa8877b50c745636fc1b1cea45ffaf4f9e7f63ce9a71f3ab547d'],
  ['synth-enforcer-walk.png','a626d526f1f50cbd4f858fe297027453dfc8dce9c374adff3f9a74ad781e520d']
].map(([name,sha256])=>Object.freeze({path:`assets/openai/sprites/animated-import-v122/${name}`,sha256,width:1254,height:1254})));
export const PUBLIC_MEDIA_FILES_V122 = Object.freeze([...PUBLIC_EQUIPMENT_FILES_V122,...PUBLIC_WALK_FILES_V122]);
export const PUBLIC_RUNTIME_MODULE_PATHS_V122 = Object.freeze([
  'src/equipment-release-v122.js','src/weapon-release-v122.js','src/weapon-native-weapons-v122.js',
  'src/weapon-catalog-weapons-v122.js','src/weapon-reference-coverage-v122.js','src/weapon-mechanics-weapons-v122.js',
  'src/vehicle-native-visuals-v122.js','src/vehicle-catalog-additions-v122.js',
  'src/archive-relay-state-v122.js','src/archive-relay-runtime-v122.js','src/archive-relay-ui-v122.js',
  'src/enemy-import-animation-data-v122.js'
]);
const paths=new Set(PUBLIC_MEDIA_FILES_V122.map(file=>file.path));
const folders=new Set(PUBLIC_MEDIA_FILES_V122.map(file=>file.path.slice(0,file.path.lastIndexOf('/'))));
const modules=new Set(PUBLIC_RUNTIME_MODULE_PATHS_V122);
export function publicReleasePathAdmissionV122(path,{directory=false}={}) {
  if (typeof path!=='string' || !path || path.includes('\\') || path.startsWith('/')
    || path.split('/').some(part=>!part || part==='.' || part==='..')) return false;
  if (/^docs\/(?:references\/)?(?:V122_|v122-)/i.test(path)) return false;
  if (paths.has(path)) return !directory;
  if (/^assets\/(?:openai\/)?(?:sprites|equipment)\/(?:[^/]+\/)*[^/]*v122(?:[^0-9]|$)/i.test(path))
    return directory?folders.has(path):paths.has(path);
  if (modules.has(path) || path==='scripts/public-release-admissions-v122.mjs') return !directory;
  if (/^(?:src|scripts)\/[^/]*v122(?:[^0-9]|$)/i.test(path)) return false;
  return null;
}
async function checkedBytes(root,filename) {
  let current=root; const parts=filename.split('/');
  for (const [index,part] of parts.entries()) {
    current=join(current,part); const stat=await lstat(current);
    assert.equal(stat.isSymbolicLink(),false,filename);
    assert.equal(index===parts.length-1?stat.isFile():stat.isDirectory(),true,filename);
  }
  const bytes=await readFile(current); assert.ok(bytes.length,filename); return bytes;
}
export async function verifyPublicAdmissionsV122(projectRoot,{strict=false}={}) {
  const root=resolve(projectRoot); assert.equal((await lstat(root)).isSymbolicLink(),false);
  const staticProfiles=[...WEAPON_NATIVE_PROFILES_V122,...Object.values(VEHICLE_NATIVE_POSES_V122)];
  assert.equal(staticProfiles.filter(isEquipmentAdmittedV122).length,8);
  for (const file of PUBLIC_MEDIA_FILES_V122) {
    const walk=PUBLIC_WALK_FILES_V122.includes(file);
    const profile=(walk?ENEMY_IMPORT_ANIMATIONS_V122:staticProfiles).find(profile=>profile.path===`/${file.path}`);
    assert.ok(profile,`Unowned V122 media: ${file.path}`); assert.equal(profile.sha256,file.sha256);
    assert.equal(profile.canonExact,false);
    if (walk) {
      assert.equal(profile.reviewStatus,'accepted-multi-pose-adaptation');
      assert.deepEqual(profile.frames.map(frame=>frame.rect),[[0,0,627,627],[627,0,627,627],[0,627,627,627],[627,627,627,627]]);
      assert.deepEqual(Object.keys(profile.clips),['move']); assert.equal(profile.clips.move.fps,6);
    } else assert.equal(isEquipmentAdmittedV122(profile),true);
    const bytes=await checkedBytes(root,file.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
    assert.ok(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
    assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],[file.width,file.height]);
  }
  for (const filename of PUBLIC_RUNTIME_MODULE_PATHS_V122) await checkedBytes(root,filename);
  if (strict) {
    for (const folder of folders) for (const entry of await readdir(join(root,folder),{withFileTypes:true})) {
      assert.equal(entry.isSymbolicLink(),false); assert.equal(entry.isFile(),true);
      assert.ok(paths.has(`${folder}/${entry.name}`),`Unapproved V122 media: ${entry.name}`);
    }
    for (const parent of ['docs','docs/references']) {
      let entries; try { entries=await readdir(join(root,parent)); } catch(error) { if(error.code==='ENOENT')continue; throw error; }
      assert.equal(entries.some(name=>/^(?:V122_|v122-)/i.test(name)),false,'Private V122 evidence leaked');
    }
  }
  return {ok:true,staticEquipmentPlates:8,nativeFourPoseWalks:3,runtimeModules:PUBLIC_RUNTIME_MODULE_PATHS_V122.length};
}
