import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync }
  from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
 COSTUME_V175_REVIEW_RECEIPT,auditCostumeReviewPackV175,
 auditV175PixelRoundtrip,stageCostumeReviewPackV175,auditDetachedShapeV177
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
 assert.match(code,/auditDetachedShapeV177\(piece/);
 assert.match(code,/transparentSockets:48/);
 assert.match(code,/nativeRigApproved:false,filmOneToOneApproved:false/);
 assert.doesNotMatch(code,/nativeRigApproved:true|filmOneToOneApproved:true/);
});
test('V176 optional physical V175 fixture has exact opaque reconstruction',
 {skip:!process.env.TANTALUS_V175_ART_ROOT},()=>{
 const result=auditV175PixelRoundtrip(process.env.TANTALUS_V175_ART_ROOT);
 assert.equal(result.status,'OPAQUE_PIXEL_AND_TORSO_APERTURES_PASSED');
 assert.equal(result.sourceAtlases,8);
 assert.equal(result.records.length,8);
 assert.deepEqual(result.topology,{detachedParts:112,verifiedTorsos:24,
   transparentSockets:48,opaqueBorderPixels:0});
 assert.ok(result.records.every(x=>x.opaqueCoveragePercent===100
   &&x.overlaps===0&&x.uncovered===0&&x.incorrect===0&&x.extra===0));
});

// Synthetic RGBA buffers below are topology fixtures, never replacement art.
function topologyFixtureV177({width=64,height=40,rectangles=[],holes=[]}={}){
 const rgba=Buffer.alloc(width*height*4);
 const fill=(box,alpha)=>{for(let y=box.y;y<box.y+box.h;y++)for(let x=box.x;x<box.x+box.w;x++)
   rgba[(y*width+x)*4+3]=alpha;};
 for(const box of rectangles)fill(box,box.alpha??255);
 for(const box of holes)fill(box,0);
 return{width,height,rgba};
}
const outerTorsoV177={x:4,y:4,w:56,h:32};
const socketsV177=[{x:12,y:12,w:6,h:5},{x:40,y:12,w:6,h:5}];
test('V177 topology counts a connected synthetic torso with exactly two enclosed transparent regions',()=>{
 const image=topologyFixtureV177({rectangles:[outerTorsoV177],holes:socketsV177});
 const original=Buffer.from(image.rgba);
 assert.deepEqual(auditDetachedShapeV177(image,{torso:true}),{majorParts:1,openSockets:2,borderOpaque:0});
 assert.deepEqual(image.rgba,original,'Auditing cannot alter source pixels');
});
test('V177 topology rejects an opaque crop border and a second substantial detached component',()=>{
 const edge=topologyFixtureV177({rectangles:[{x:0,y:4,w:12,h:12}]});
 assert.throws(()=>auditDetachedShapeV177(edge),/Sprite touches crop border/);
 const detached=topologyFixtureV177({rectangles:[{x:4,y:4,w:10,h:10},{x:35,y:4,w:10,h:10}]});
 assert.throws(()=>auditDetachedShapeV177(detached),/multiple visible bodies/);
});
test('V177 torso topology rejects painted dark marks, missing or excess enclosed regions and open channels',()=>{
 for(const holes of [[],socketsV177.slice(0,1),[...socketsV177,{x:26,y:23,w:6,h:5}],
   [...socketsV177,{x:14,y:4,w:2,h:9}]]){
  const image=topologyFixtureV177({rectangles:[outerTorsoV177],holes});
  assert.throws(()=>auditDetachedShapeV177(image,{torso:true}),/two real transparent/);
 }
 // All RGB bytes are already black: a dark painted patch remains opaque.
 const painted=topologyFixtureV177({rectangles:[outerTorsoV177]});
 assert.throws(()=>auditDetachedShapeV177(painted,{torso:true}),/two real transparent/);
});
test('V177 topology reports its exact alpha, substantial-region and aperture-area thresholds',()=>{
 const minor=topologyFixtureV177({rectangles:[{x:4,y:4,w:10,h:10},{x:35,y:4,w:9,h:11}]});
 assert.equal(auditDetachedShapeV177(minor).majorParts,1,'A99px detached fleck is below the declared100px threshold');
 const transparentBorder=topologyFixtureV177({rectangles:[{x:0,y:4,w:2,h:2,alpha:40},{x:4,y:4,w:10,h:10}]});
 assert.equal(auditDetachedShapeV177(transparentBorder).borderOpaque,0,'Alpha40 is excluded');
 transparentBorder.rgba[(4*transparentBorder.width)*4+3]=41;
 assert.throws(()=>auditDetachedShapeV177(transparentBorder),/Sprite touches crop border/);
 const smallHole=topologyFixtureV177({rectangles:[outerTorsoV177],holes:[...socketsV177,{x:26,y:23,w:5,h:5}]});
 assert.equal(auditDetachedShapeV177(smallHole,{torso:true}).openSockets,2,'A25px inner opening is below the declared30px threshold');
});
