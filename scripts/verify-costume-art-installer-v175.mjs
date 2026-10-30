import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync }
  from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
 COSTUME_V175_REVIEW_RECEIPT,auditCostumeReviewPackV175,
 auditV175PixelRoundtrip,stageCostumeReviewPackV175
} from './install-costume-art-v175.mjs';
const sha=buf=>createHash('sha256').update(buf).digest('hex');
test('V175 receipt has only four independent outfits and no game approval',()=>{
 const r=COSTUME_V175_REVIEW_RECEIPT;
 assert.deepEqual([...r.outfits],[
   'ripley_fury161','ripley8_resurrection','andy_romulus','navarro_romulus']);
 assert.equal(r.sourceAtlases,8);
 assert.equal(r.detachedParts,114);
 assert.equal(r.totalPngs,123);
 assert.match(r.manifestSha256,/^[a-f0-9]{64}$/);
 assert.match(r.andyWaistSourceSha256,/^[a-f0-9]{64}$/);
 assert.equal(r.nativeRigApproved,false);
 assert.equal(r.filmOneToOneApproved,false);
});
test('V175 absent or forged external manifest never creates destination',()=>{
 const folder=mkdtempSync(join(tmpdir(),'tantalus-costume-v175-'));
 try{
  assert.throws(()=>auditCostumeReviewPackV175(folder));
  writeFileSync(join(folder,'manifest.json'),
   JSON.stringify({format:'TANTALUS_SEPARATED_SPRITES_V175',outfits:{}}));
  assert.notEqual(sha(readFileSync(join(folder,'manifest.json'))),
   COSTUME_V175_REVIEW_RECEIPT.manifestSha256);
  assert.throws(()=>auditCostumeReviewPackV175(folder),/manifest was not generated/);
  const destination=join(folder,'game');
  mkdirSync(destination);
  assert.throws(()=>stageCostumeReviewPackV175(folder,{repoRoot:destination}),
   /manifest was not generated/);
  assert.equal(existsSync(join(destination,
   'assets/openai/sprites/player/costume-review-v175')),false);
 }finally{rmSync(folder,{recursive:true,force:true});}
});
test('V175 importer and art remain source-only until independent native pose QA',()=>{
 const code=readFileSync(new URL('./install-costume-art-v175.mjs',import.meta.url),'utf8');
 assert.match(code,/realpathSync\(absolute\)/);
 assert.match(code,/isSymbolicLink/);
 assert.match(code,/copyFileSync/);
 assert.match(code,/renameSync\(tmp,target\)/);
 assert.match(code,/STAGED_FOR_MANUAL_RIG_QA_NOT_PUBLICLY_ADMITTED/);
 assert.doesNotMatch(code,/ARMORY_ART_ADMISSIONS_V171\s*=/);
});

test('V176 native source round-trip is mandatory before staging or admission',()=>{
 const code=readFileSync(new URL('./install-costume-art-v175.mjs',import.meta.url),'utf8');
 assert.match(code,/auditV175PixelRoundtrip\(folder\);/);
 assert.match(code,/mode==='--verify-pixels'\?auditV175PixelRoundtrip\(source\)/);
 assert.match(code,/const review=auditCostumeReviewPackV175\(root\)/);
 assert.match(code,/sourceOpaque>0/);
 assert.match(code,/overlaps:0,uncovered:0,incorrect:0,extra:0/);
 assert.match(code,/nativeRigApproved:false,filmOneToOneApproved:false/);
 assert.doesNotMatch(code,/nativeRigApproved:true|filmOneToOneApproved:true/);
});
test('V176 optional physical V175 fixture has exact opaque reconstruction',
 {skip:!process.env.TANTALUS_V175_ART_ROOT},()=>{
 const result=auditV175PixelRoundtrip(process.env.TANTALUS_V175_ART_ROOT);
 assert.equal(result.status,'OPAQUE_PIXEL_ROUNDTRIP_PASSED');
 assert.equal(result.sourceAtlases,8);
 assert.equal(result.records.length,8);
 assert.ok(result.records.every(x=>x.opaqueCoveragePercent===100
   &&x.overlaps===0&&x.uncovered===0&&x.incorrect===0&&x.extra===0));
});
