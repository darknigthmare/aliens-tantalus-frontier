import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { EXPECTED_V169_ART, auditArmoryPackV171, installArmoryPackV171 }
  from './install-armory-art-v171.mjs';
import { ARMORY_STOREFRONT_SOURCE_SHA256_V169, ARMORY_ART_ADMISSIONS_V171 }
  from '../src/hub-armory-storefront-v169.js';

test('V171 exact companion source art hashes match the published V169 pack',()=>{
 assert.equal(EXPECTED_V169_ART.manifest,
  '5c5b89ef7a7006e46486bacef9a707f4a35a76bb035e7af75c411775898d4a29');
 for(const variant of ['tantalus','colony','station'])
  assert.equal(EXPECTED_V169_ART.source[variant],ARMORY_STOREFRONT_SOURCE_SHA256_V169[variant]);
 assert.ok(Object.values(ARMORY_ART_ADMISSIONS_V171).every(x=>x===false));
});
test('V171 rejects any missing, wrong or forged companion manifest before copying files',()=>{
 const root=mkdtempSync(join(tmpdir(),'armory-verify-v171-'));
 try{
  assert.throws(()=>auditArmoryPackV171(root));
  writeFileSync(join(root,'armory_art_manifest_v169.json'),
    JSON.stringify({schema:169,variant_count:3,sprites_per_variant:32}));
  assert.throws(()=>auditArmoryPackV171(root),/Art manifest differs/);
  const destination=join(root,'target');
  mkdirSync(destination);
  assert.throws(()=>installArmoryPackV171(root,{repoRoot:destination}),/Art manifest differs/);
 } finally {rmSync(root,{recursive:true,force:true})}
});
test('V171 installer never silently marks rendered art or 1:1 rights approved',()=>{
 const scene=readFileSync(new URL('../src/hub-armory-scene-v169.js',import.meta.url),'utf8');
 assert.match(scene,/!isArmoryArtAdmittedV171/);
 const port=readFileSync(new URL('../src/hub-port-meridien-v90.js',import.meta.url),'utf8');
 assert.match(port,/if \(isArmoryArtAdmittedV171\('colony'\)/);
 assert.deepEqual(Object.values(ARMORY_ART_ADMISSIONS_V171),[false,false,false]);
});
