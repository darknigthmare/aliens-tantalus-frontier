import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { EXPECTED_V169_ART, auditArmoryPackV171, installArmoryPackV171 }
  from './install-armory-art-v171.mjs';
import { ARMORY_STOREFRONT_SOURCE_SHA256_V169, ARMORY_ORIGINAL_PNG_SHA256_V171,
  ARMORY_STOREFRONT_SOURCE_V169, ARMORY_STOREFRONT_VARIANTS_V169,
  isArmoryStorefrontImageReadyV172, ARMORY_ART_ADMISSIONS_V171 }
  from '../src/hub-armory-storefront-v169.js';

test('V172 shipped art matches its exact bytes, retained original PNG receipts and native floor',()=>{
 assert.equal(EXPECTED_V169_ART.manifest,
  '5c5b89ef7a7006e46486bacef9a707f4a35a76bb035e7af75c411775898d4a29');
 assert.deepEqual(ARMORY_ART_ADMISSIONS_V171,{tantalus:true,colony:true,station:true});
 for(const variant of ['tantalus','colony','station']){
  assert.equal(EXPECTED_V169_ART.source[variant],ARMORY_ORIGINAL_PNG_SHA256_V171[variant]);
  const uri=ARMORY_STOREFRONT_SOURCE_V169[variant];
  const binary=readFileSync(new URL('..'+uri,import.meta.url));
  const digest=createHash('sha256').update(binary).digest('hex');
  assert.equal(digest,ARMORY_STOREFRONT_SOURCE_SHA256_V169[variant],variant);
  assert.ok(binary.length>100_000);
  if(variant==='colony'){assert.ok(uri.endsWith('.webp'));assert.equal(binary.toString('ascii',0,4),'RIFF');}
  else{assert.ok(uri.endsWith('.png'));assert.deepEqual([...binary.subarray(0,8)],[137,80,78,71,13,10,26,10]);}
  assert.equal(ARMORY_STOREFRONT_VARIANTS_V169[variant].floorY,624);
 }
 assert.equal(isArmoryStorefrontImageReadyV172(null),false);
 assert.equal(isArmoryStorefrontImageReadyV172({complete:true,naturalWidth:1024,naturalHeight:1086}),false);
 assert.equal(isArmoryStorefrontImageReadyV172({complete:false,naturalWidth:1448,naturalHeight:1086}),false);
 assert.equal(isArmoryStorefrontImageReadyV172({complete:true,naturalWidth:1448,naturalHeight:1086}),true);
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
 assert.deepEqual(Object.values(ARMORY_ART_ADMISSIONS_V171),[true,true,true]);
 assert.match(scene,/isArmoryStorefrontImageReadyV172/);
 assert.match(port,/isArmoryStorefrontImageReadyV172/);
});
