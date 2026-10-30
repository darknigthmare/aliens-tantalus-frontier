/** Install only the exact original V169 3x32 sprite pack exported in this
 * conversation. Never download, generate or infer missing art.
 *
 * Usage:
 *   node scripts/install-armory-art-v171.mjs /path/to/unzipped/V169 --verify
 *   node scripts/install-armory-art-v171.mjs /path/to/unzipped/V169 --install
 *
 * The installer does NOT enable release gates or claim 1:1 canon. The art
 * must be reviewed in native side view before ARMORY_ART_ADMISSIONS_V171
 * is independently changed to true and that new change passes CI.
 */
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, lstatSync, mkdtempSync, mkdirSync,
  readFileSync, realpathSync, renameSync, rmSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const VARIANTS=['tantalus','colony','station'];
export const EXPECTED_V169_ART = Object.freeze({
 manifest:'5c5b89ef7a7006e46486bacef9a707f4a35a76bb035e7af75c411775898d4a29',
 source:Object.freeze({
  tantalus:'ce5d979dc84c4b8d34c0f8b5403abd6b3ec706e0cd50c819222be9cf323c1767',
  colony:'de220600940eec4471ac93e09a5a2d023f8c64f2b40c1fb6c1a8a969010f33c8',
  station:'93d3d1c56463f8379ce063fa2721bddf2bba58fe435de4161c25b66d29bbb987'
 })
});
const digest=b=>createHash('sha256').update(b).digest('hex');
const hex=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
function imageSize(p){
 const b=readFileSync(p);
 assert.ok(b.length>=33 && b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),
   'Not a real PNG: '+p);
 assert.equal(b.subarray(12,16).toString('ascii'),'IHDR','Malformed PNG header');
 const width=b.readUInt32BE(16), height=b.readUInt32BE(20);
 assert.ok(width>0&&width<=4096&&height>0&&height<=4096,'Unexpected dimensions');
 return {width,height};
}
function safeSource(root,rel){
 assert.ok(typeof rel==='string'&&/^[a-zA-Z0-9/_-]+\.png$/.test(rel)
   &&!rel.split('/').includes('..')&&!rel.startsWith('/'),'Untrusted PNG path: '+rel);
 const full=resolve(root,rel);
 const canon=realpathSync(full),base=realpathSync(root);
 assert.ok(canon.startsWith(base+sep),'Escaped source folder');
 assert.ok(lstatSync(full).isFile() && statSync(canon).isFile(),'Source is not regular PNG');
 return full;
}
export function auditArmoryPackV171(root){
 const base=resolve(root);
 const manifestPath=join(base,'armory_art_manifest_v169.json');
 const bytes=readFileSync(manifestPath);
 assert.equal(digest(bytes),EXPECTED_V169_ART.manifest,'Art manifest differs from reviewed archive');
 const data=JSON.parse(bytes.toString('utf8'));
 assert.equal(data.schema,169);assert.equal(data.variant_count,3);
 assert.equal(data.sprites_per_variant,32);
 assert.deepEqual(data.logical_sheet_size,[1448,1086]);
 assert.deepEqual(Object.keys(data.variants).sort(),[...VARIANTS].sort());
 const files=[];
 for(const variant of VARIANTS){
  const group=data.variants[variant];
  const baseSrc='variants/'+variant+'/'+variant+'_source_1448x1086.png';
  assert.equal(group.source,baseSrc);
  assert.equal(group.source_sha256,EXPECTED_V169_ART.source[variant]);
  const original=safeSource(base,baseSrc);
  assert.deepEqual(imageSize(original),{width:1448,height:1086});
  assert.equal(digest(readFileSync(original)),group.source_sha256,'Wrong source PNG: '+variant);
  files.push({from:original,to:variant+'_source_1448x1086.png',kind:'atlas',variant});
  assert.ok(Array.isArray(group.sprites)&&group.sprites.length===32,'32 independent sprites required');
  const seen=new Set();
  for(const entry of group.sprites){
    assert.ok(typeof entry.id==='string'&&entry.id.startsWith(variant+'.'));
    assert.ok(!seen.has(entry.id),'Duplicate sprite '+entry.id);seen.add(entry.id);
    assert.ok(Array.isArray(entry.crop_size)&&entry.crop_size.length===2
      &&entry.crop_size.every(x=>Number.isInteger(x)&&x>0));
    assert.ok(entry.file.startsWith('variants/'+variant+'/sprites/'));
    assert.ok(hex(entry.sha256),'Missing sprite SHA256');
    const image=safeSource(base,entry.file);
    const dims=imageSize(image);
    assert.deepEqual([dims.width,dims.height],entry.crop_size,'Bad crop size: '+entry.id);
    assert.equal(digest(readFileSync(image)),entry.sha256,'Corrupt sprite: '+entry.id);
    files.push({from:image,to:'sprites/'+variant+'/'+entry.file.split('/').at(-1),kind:'sprite',variant});
  }
 }
 assert.equal(files.length,99);
 return Object.freeze({files:Object.freeze(files),sourceCount:3,spriteCount:96,
  validated:true,canon1to1Approved:false,visuallyApproved:false,manifestSha256:EXPECTED_V169_ART.manifest});
}
export function installArmoryPackV171(root,{repoRoot=resolve(fileURLToPath(new URL('..',import.meta.url)))}={}){
 const audit=auditArmoryPackV171(root);
 const target=resolve(repoRoot,'assets/openai/hub/armory-v169');
 assert.ok(!existsSync(target),'Existing armory assets: review manually rather than overwriting');
 const parent=dirname(target);
 mkdirSync(parent,{recursive:true});
 const temp=mkdtempSync(join(parent,'.armory-v171-stage-'));
 let committed=false;
 try{
  for(const item of audit.files){
    const dest=join(temp,item.to);
    mkdirSync(dirname(dest),{recursive:true});
    copyFileSync(item.from,dest);
  }
  renameSync(temp,target);committed=true;
 }finally{if(!committed)rmSync(temp,{recursive:true,force:true});}
 return {destination:relative(repoRoot,target),files:audit.files.length,
  sourceCount:audit.sourceCount,spriteCount:audit.spriteCount,
  visualAdmission:'DISABLED_PENDING_NATIVE_QA',canon1to1Approved:false};
}
const invoked=process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(invoked){
 try{
  const source=process.argv[2],mode=process.argv[3];
  if(!source||!['--verify','--install'].includes(mode))
   throw new Error('Usage: node scripts/install-armory-art-v171.mjs <extracted-pack-directory> --verify|--install');
  const result=mode==='--verify'?auditArmoryPackV171(source):installArmoryPackV171(source);
  const out=mode==='--verify'?{validated:result.validated,sourceCount:result.sourceCount,
    spriteCount:result.spriteCount,canon1to1Approved:false}:result;
  process.stdout.write(JSON.stringify(out,null,2)+'\n');
 }catch(error){process.stderr.write(String(error.message)+'\n');process.exitCode=1;}
}
