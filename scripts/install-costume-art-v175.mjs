/**
 * Source-only V175 costume importer. Receives the unzipped external review
 * archive from this conversation; does NOT fetch, fabricate or admit art.
 * Usage: node scripts/install-costume-art-v175.mjs /path/to/unzipped/pack --verify
 *        node scripts/install-costume-art-v175.mjs /path/to/unzipped/pack --stage
 * Staging copies into an isolated NON-RUNTIME directory. Asset admission,
 * native-pose QA, and license/fidelity review are separate changes.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync,
  readFileSync, realpathSync, renameSync, rmSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
export const COSTUME_V175_REVIEW_RECEIPT=Object.freeze({
  manifestSha256:'721df020f2c581e800683c8edad125a917d9e352149c357199bc8968d0cc8733',
  andyWaistSourceSha256:'4190b79d4838ec94da44c3b6de08c05294bd38438e7bf920bb61148922690bb7',
  outfits:Object.freeze(['ripley_fury161','ripley8_resurrection','andy_romulus','navarro_romulus']),
  sourceAtlases:8, detachedParts:114, totalPngs:123,
  nativeRigApproved:false, filmOneToOneApproved:false
});
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const digestOK=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const safeRel=x=>typeof x==='string'&&x.length<260
  &&/^[a-z0-9_./-]+\.png$/.test(x)&&!x.startsWith('/')
  &&!x.split('/').includes('..')&&!x.split('/').includes('.');
function safePng(root,rel,expectedSha){
  assert.ok(safeRel(rel),'Unsafe PNG path');
  assert.ok(digestOK(expectedSha),'Missing verified image digest');
  const base=realpathSync(root);
  const absolute=resolve(base,rel),real=realpathSync(absolute);
  assert.ok(real.startsWith(base+sep),'Image escaped staging source');
  // Even an in-root link is not a reviewable, independent delivered PNG.
  let current=base;
  for(const part of rel.split('/')){
    current=join(current,part);
    assert.ok(!lstatSync(current).isSymbolicLink(),'Symlink in PNG path');
  }
  assert.ok(lstatSync(absolute).isFile(),'Expected a regular PNG');
  const bytes=readFileSync(absolute);
  assert.equal(digest(bytes),expectedSha,'Unreviewed PNG bytes: '+rel);
  assert.ok(bytes.length>=33 && bytes.subarray(0,8).equals(
    Buffer.from([137,80,78,71,13,10,26,10])),'Not a PNG: '+rel);
  assert.equal(bytes.toString('ascii',12,16),'IHDR','Missing PNG header');
  assert.equal(bytes[25],6,'PNG must be native RGBA');
  return {absolute,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
}
export function auditCostumeReviewPackV175(folder){
  const root=resolve(folder),manifestFile=join(root,'manifest.json');
  assert.ok(!lstatSync(manifestFile).isSymbolicLink(),'Manifest must not be a symlink');
  const bytes=readFileSync(manifestFile);
  assert.equal(digest(bytes),COSTUME_V175_REVIEW_RECEIPT.manifestSha256,
    'Costume manifest was not generated from the reviewed archive');
  const m=JSON.parse(bytes.toString('utf8'));
  assert.equal(m.format,'TANTALUS_SEPARATED_SPRITES_V175');
  assert.deepEqual(Object.keys(m.outfits),[...COSTUME_V175_REVIEW_RECEIPT.outfits]);
  assert.equal(m.summary.outfits,4);
  assert.equal(m.summary.source_atlases,8);
  assert.equal(m.summary.total_parts,114);
  assert.equal(m.claims.canon_fidelity_1to1_verified,false);
  assert.equal(m.claims.native_rig_imported,false);
  const planned=[],used=new Set();
  const keep=(path,hash,width=null,height=null)=>{
    assert.ok(!used.has(path),'Duplicate delivered PNG path');
    used.add(path);
    const item=safePng(root,path,hash);
    if(width!==null)assert.equal(item.width,width,'Wrong PNG width: '+path);
    if(height!==null)assert.equal(item.height,height,'Wrong PNG height: '+path);
    planned.push({from:item.absolute,to:path});
  };
  for(const [slug,outfit] of Object.entries(m.outfits)){
    assert.equal(outfit.fidelity,'PENDING_REFERENCE_AND_IN_GAME_QA');
    for(const kind of ['upper','lower']){
      const group=outfit[kind];
      assert.equal(group.source_file,'outfits/'+slug+'/source_'+kind+'.png');
      keep(group.source_file,group.sha256,1254,1254);
      assert.ok(Array.isArray(group.parts)&&group.parts.length===14);
      const partIds=new Set();
      for(const part of group.parts){
        assert.ok(typeof part.id==='string'&&/^[a-z_]+$/.test(part.id));
        assert.ok(!partIds.has(part.id),'Duplicate part id');
        partIds.add(part.id);
        assert.equal(part.file,'outfits/'+slug+'/'+kind+'/'+part.id+'.png');
        assert.ok(Array.isArray(part.sprite_px)&&part.sprite_px.length===2);
        assert.ok(part.sprite_px.every(x=>Number.isInteger(x)&&x>0&&x<=1254));
        assert.equal(part.review_required,true);
        keep(part.file,part.sha256,...part.sprite_px);
      }
    }
    const count=slug==='andy_romulus'?2:0;
    assert.ok(Array.isArray(outfit.accessories)&&outfit.accessories.length===count);
    for(const item of outfit.accessories){
      assert.ok(['waist_pouch_left','waist_pouch_right'].includes(item.id));
      assert.equal(item.file,'outfits/'+slug+'/accessories/'+item.id+'.png');
      keep(item.file,item.sha256);
    }
  }
  keep('outfits/andy_romulus/source_waist.png',
    COSTUME_V175_REVIEW_RECEIPT.andyWaistSourceSha256,1254,1254);
  assert.equal(planned.length,COSTUME_V175_REVIEW_RECEIPT.totalPngs);
  return Object.freeze({files:Object.freeze(planned),sourceAtlases:8,
    parts:114,verified:true,nativeRigApproved:false,filmOneToOneApproved:false});
}
export function stageCostumeReviewPackV175(folder,{repoRoot=
  resolve(fileURLToPath(new URL('..',import.meta.url)))}={}){
  const review=auditCostumeReviewPackV175(folder);
  auditV175PixelRoundtrip(folder);
  const target=resolve(repoRoot,'assets/openai/sprites/player/costume-review-v175');
  assert.ok(!existsSync(target),'Review assets exist; never overwrite them silently');
  const parent=dirname(target);mkdirSync(parent,{recursive:true});
  const tmp=mkdtempSync(join(parent,'.costume-v175-stage-'));
  let committed=false;
  try{
    for(const item of review.files){
      const destination=join(tmp,item.to);
      mkdirSync(dirname(destination),{recursive:true});
      copyFileSync(item.from,destination);
    }
    copyFileSync(join(resolve(folder),'manifest.json'),join(tmp,'manifest.json'));
    renameSync(tmp,target);committed=true;
  }finally{if(!committed)rmSync(tmp,{recursive:true,force:true});}
  return {path:relative(repoRoot,target),pngs:review.files.length,
    status:'STAGED_FOR_MANUAL_RIG_QA_NOT_PUBLICLY_ADMITTED'};
}

/**
 * V176 deterministic round-trip QA for the *actual delivered* PNG bytes.
 * Check each detached crop's RGBA pixels against its original full atlas;
 * reject missing/altered pixels and neighbor bleed before any staging.
 * This does not verify film likeness, pivots, animations or rig admission.
 * PNG decoding uses built-in zlib; no dependency or generated substitute.
 */
function decodeNativeRgbaV176(path) {
  const png=readFileSync(path);
  const signature=Buffer.from([137,80,78,71,13,10,26,10]);
  assert.ok(png.subarray(0,8).equals(signature),'Not a PNG: '+path);
  let cursor=8,width=0,height=0,header=false,complete=false;
  const blocks=[];
  while(cursor+12<=png.length) {
    const length=png.readUInt32BE(cursor);
    const type=png.toString('ascii',cursor+4,cursor+8);
    assert.ok(length<=png.length-cursor-12,'Truncated PNG chunk');
    const bytes=png.subarray(cursor+8,cursor+8+length);
    if(type==='IHDR') {
      assert.ok(!header&&length===13,'Malformed native PNG');
      width=bytes.readUInt32BE(0);height=bytes.readUInt32BE(4);
      assert.ok(width>=1&&width<=4096&&height>=1&&height<=4096);
      assert.deepEqual([...bytes.subarray(8,13)],[8,6,0,0,0],
        'Only un-interlaced 8-bit RGBA PNG is supported');
      header=true;
    } else if(type==='IDAT')blocks.push(bytes);
    else if(type==='IEND'){complete=true;break;}
    cursor+=12+length;
  }
  assert.ok(header&&complete&&blocks.length,'Incomplete PNG');
  const raw=inflateSync(Buffer.concat(blocks));
  const stride=width*4;
  assert.equal(raw.length,height*(stride+1),'Unexpected PNG decompressed length');
  const rgba=Buffer.alloc(width*height*4);
  for(let y=0;y<height;y++){
    const filter=raw[y*(stride+1)];
    assert.ok(filter<=4,'Invalid PNG filter');
    const start=y*stride;
    for(let x=0;x<stride;x++){
      const left=x>=4?rgba[start+x-4]:0;
      const above=y?rgba[start-stride+x]:0;
      const upperLeft=y&&x>=4?rgba[start-stride+x-4]:0;
      let prediction=0;
      if(filter===1)prediction=left;
      else if(filter===2)prediction=above;
      else if(filter===3)prediction=(left+above)>>>1;
      else if(filter===4){
        const p=left+above-upperLeft;
        const a=Math.abs(p-left),b=Math.abs(p-above),c=Math.abs(p-upperLeft);
        prediction=a<=b&&a<=c?left:b<=c?above:upperLeft;
      }
      rgba[start+x]=(raw[y*(stride+1)+x+1]+prediction)&255;
    }
  }
  return {width,height,rgba};
}
export function auditV175PixelRoundtrip(root){
  // Source hashes cannot be bypassed with caller-provided review receipts.
  const review=auditCostumeReviewPackV175(root);
  assert.equal(review.verified,true,'Missing V175 source receipt');
  const base=resolve(root);
  const manifest=JSON.parse(readFileSync(join(base,'manifest.json'),'utf8'));
  const records=[];
  for(const [slug,outfit] of Object.entries(manifest.outfits)){
    for(const kind of ['upper','lower']){
      const group=outfit[kind];
      const source=decodeNativeRgbaV176(join(base,group.source_file));
      assert.deepEqual([source.width,source.height],[1254,1254]);
      const combined=Buffer.alloc(source.rgba.length);
      let overlaps=0;
      for(const part of group.parts){
        const [ox,oy,width,height]=part.source_bbox_px;
        assert.ok([ox,oy,width,height].every(Number.isInteger)
          &&ox>=0&&oy>=0&&width>0&&height>0
          &&ox+width<=source.width&&oy+height<=source.height,
          'Invalid source rectangle: '+part.id);
        const piece=decodeNativeRgbaV176(join(base,part.file));
        assert.deepEqual([piece.width,piece.height],[width,height],
          'Incorrect crop bounds: '+part.id);
        for(let y=0;y<height;y++)for(let x=0;x<width;x++){
          const from=(y*width+x)*4,to=((oy+y)*source.width+(ox+x))*4;
          if(piece.rgba[from+3]<=40)continue;
          if(combined[to+3]>40)overlaps++;
          piece.rgba.copy(combined,to,from,from+4);
        }
      }
      let sourceOpaque=0,uncovered=0,incorrect=0,extra=0;
      for(let px=0;px<source.rgba.length;px+=4){
        const srcA=source.rgba[px+3],gotA=combined[px+3];
        if(srcA>40){
          sourceOpaque++;
          if(gotA<=40)uncovered++;
          else if(srcA!==gotA||source.rgba[px]!==combined[px]
            ||source.rgba[px+1]!==combined[px+1]
            ||source.rgba[px+2]!==combined[px+2])incorrect++;
        } else if(gotA>40)extra++;
      }
      assert.ok(sourceOpaque>0,'Empty source outfit');
      assert.deepEqual({overlaps,uncovered,incorrect,extra},
        {overlaps:0,uncovered:0,incorrect:0,extra:0},
        'V175 opaque pixel reconstruction failed: '+slug+'/'+kind);
      records.push({outfit:slug,kind,sourceOpaque,restoredOpaque:sourceOpaque,
        opaqueCoveragePercent:100,overlaps,uncovered,incorrect,extra});
    }
  }
  assert.equal(records.length,8,'Exactly eight clothing source atlases required');
  return {schema:176,status:'OPAQUE_PIXEL_ROUNDTRIP_PASSED',
    sourceAtlases:8,nativeRigApproved:false,filmOneToOneApproved:false,
    records};
}

const invoked=process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(invoked){
  try{
    const source=process.argv[2],mode=process.argv[3];
    if(!source||!['--verify','--verify-pixels','--stage'].includes(mode))throw new Error(
      'Usage: node scripts/install-costume-art-v175.mjs <unzipped-pack> --verify|--verify-pixels|--stage');
    const r=mode==='--verify'?auditCostumeReviewPackV175(source):
      mode==='--verify-pixels'?auditV175PixelRoundtrip(source):
      stageCostumeReviewPackV175(source);
    process.stdout.write(JSON.stringify(r,null,2)+'\n');
  }catch(e){process.stderr.write(String(e.message)+'\n');process.exitCode=1;}
}
