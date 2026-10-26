import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { XENO_TRIALS_RIG_DATA_V165 as rigs } from '../src/xeno-trials-rig-data-v165.js';
import { XENO_TRIALS_RIG_DATA_V163 as preceding } from '../src/xeno-trials-rig-data-v163.js';
import { XENO_TRIALS_FIGHTERS_V96 as roster, getXenoTrialsArtV96 as artFor } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_RIGS_V154 as historical, getXenoTrialsRigV154 as resolve,
 getXenoTrialsRigMeshV154 as meshFor, sampleXenoTrialsRigV154 as sample,
 drawXenoTrialsRigV154 as draw, projectXenoTrialsMeshPointV157 as project,
 sampleXenoTrialsSequenceAnglesV155 as sequence, sampleXenoTrialsExitPoseV157 as exit,
 xenoTrialsTriangleAreaV154 as area } from '../src/xeno-trials-rig-v154.js';

const close=(a,b,message='native coordinate')=>assert.ok(Math.abs(a-b)<1e-7,`${message}: ${a} != ${b}`);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const inside=([x,y],polygon)=>{let yes=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
 const a=polygon[i],b=polygon[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes;
}return yes;};
// Decode the original bytes independently of the compiler's Pillow occupancy
// calculation. Even a single alpha pixel requires a native mesh cell.
function alphaFor(bytes){
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
 assert.equal(bytes[24],8);assert.equal(bytes[25],6);assert.equal(bytes[28],0);
 const chunks=[];
 for(let offset=8;offset<bytes.length;){const size=bytes.readUInt32BE(offset),type=bytes.toString('ascii',offset+4,offset+8);
  if(type==='IDAT')chunks.push(bytes.subarray(offset+8,offset+8+size));offset+=12+size;}
 const raw=inflateSync(Buffer.concat(chunks)),stride=width*4,alpha=new Uint8Array(width*height);
 const paeth=(a,b,c)=>{const p=a+b-c,aa=Math.abs(p-a),bb=Math.abs(p-b),cc=Math.abs(p-c);return aa<=bb&&aa<=cc?a:bb<=cc?b:c;};
 let previous=new Uint8Array(stride),offset=0;
 for(let y=0;y<height;y++){
  const filter=raw[offset++],row=new Uint8Array(stride);assert.ok(filter<=4);
  for(let x=0;x<stride;x++){const a=x>=4?row[x-4]:0,b=previous[x],c=x>=4?previous[x-4]:0;
   row[x]=(raw[offset++]+[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter])&255;}
  for(let x=0;x<width;x++)alpha[y*width+x]=row[x*4+3];previous=row;
 }
 assert.equal(offset,raw.length);return{width,height,alpha};
}
function maskFor({width,height,alpha},cell){
 const cols=Math.ceil(width/cell),rows=Math.ceil(height/cell),cells=new Uint8Array(cols*rows);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(alpha[y*width+x])cells[Math.floor(y/cell)*cols+Math.floor(x/cell)]=1;
 let mask='';for(let i=0;i<cells.length;i+=4){let n=0;for(let k=0;k<4;k++)if(cells[i+k])n|=8>>k;mask+=n.toString(16);}
 return{cell,cols,rows,mask};
}
const supports=r=>r.supportContactsV165||['footFar','footNear'];
const references=r=>r.referenceContactsV165||['chest','head'];
const rootBone=r=>r.supportRootBoneV165||'hips';
const ctx=()=>new Proxy({draws:0},{get:(target,key)=>key in target?target[key]:(...args)=>{if(key==='drawImage')target.draws++;}});
const pixels=new Map();
const allSourceIdentities=()=>new Set([...historical,...preceding,...rigs].map(r=>r.fighterId)).size;
function native(r){if(!pixels.has(r.id))pixels.set(r.id,alphaFor(readFileSync(new URL('..'+r.path,import.meta.url))));return pixels.get(r.id);}
const metrics=r=>({width:r.sourceWidth*.2,height:r.sourceHeight*.2,pivotX:.5,bottom:1});
const image=r=>({complete:true,naturalWidth:r.sourceWidth,naturalHeight:r.sourceHeight});

test('measured V165 presentation plates add exact identities while historical choreography remains isolated',()=>{
 assert.equal(historical.length,4);assert.equal(preceding.length,15);
 assert.equal(rigs.length,170);assert.equal(allSourceIdentities(),189);assert.ok(Object.isFrozen(rigs));
 const all=[...historical,...preceding,...rigs];assert.equal(new Set(all.map(r=>r.fighterId)).size,all.length);
 assert.equal(new Set(rigs.map(r=>r.id)).size,rigs.length);
 assert.equal(new Set(rigs.map(r=>JSON.stringify(r.bones))).size,rigs.length);
 for(const f of roster)assert.equal(Boolean(resolve(f,artFor(f.id))),all.some(r=>r.fighterId===f.id),f.id);
 for(const r of rigs){
  assert.equal(r.presentationRevision,165);assert.equal(r.fullLocomotion,false);assert.equal(r.captureSequenceAdmission,false);assert.equal(r.canonExact,false);
  assert.equal(r.referenceStatus,'project-art-adaptation-not-source-game-motion');
  assert.deepEqual(Object.keys(r.poses).sort(),['intro','release','restraint','round-loss','round-win','struggle']);
  assert.equal(sequence(r,{clip:'intro',progress:.5,elapsed:.5},{head:1}),null);
  assert.equal(exit(r,{rigId:r.id,distance:10,stride:20,footLift:1},metrics(r)),null);
 }
});

for(const r of rigs){
 test(`${r.fighterId}: native bytes, complete alpha, visible anchors and identity gates agree`,()=>{
  const bytes=readFileSync(new URL('..'+r.path,import.meta.url)),png=native(r);
  assert.equal(hash(bytes),r.sourceSha256);assert.equal(png.width,r.sourceWidth);assert.equal(png.height,r.sourceHeight);
  assert.deepEqual(r.mesh,maskFor(png,r.mesh.cell));
  const f=roster.find(f=>f.id===r.fighterId),a=artFor(f.id);assert.equal(resolve(f,a),r);
  for(const change of[{id:'other'},{profileId:'other'}])assert.equal(resolve({...f,...change},a),null);
  for(const change of[{id:'other'},{path:'other'},{sourceWidth:1},{sourceHeight:1},{sourceFacing:-a.sourceFacing},{sha256:'0'.repeat(64)}])assert.equal(resolve(f,{...a,...change}),null);
  const ids=new Set();
  for(const b of r.bones){
   assert.ok(!ids.has(b.id));assert.ok(b.parent===null||ids.has(b.parent));ids.add(b.id);
   for(const p of[b.pivot,b.tip]){
    assert.ok(p.every(Number.isInteger)&&p[0]>=0&&p[0]<png.width&&p[1]>=0&&p[1]<png.height);
    assert.ok(png.alpha[p[1]*png.width+p[0]]>=128,`${b.id}: visible native landmark`);
   }
   assert.ok(Math.hypot(b.tip[0]-b.pivot[0],b.tip[1]-b.pivot[1])>0);
  }
  assert.ok(supports(r).length>=2&&new Set(supports(r)).size===supports(r).length);
  for(const name of[...references(r),...supports(r)])assert.ok(r.contacts[name]);
  for(const[name,c]of Object.entries(r.contacts)){
   assert.ok(ids.has(c.bone));assert.ok(png.alpha[c.point[1]*png.width+c.point[0]]>=128,`${name}: native alpha`);
  }
  for(const name of [...r.occludedContactsV165,...(r.absentContactsV165||[])])assert.equal(r.contacts[name],undefined,'an occluded limb must not gain a fabricated contact');
  for(const name of supports(r)){
   const point=r.contacts[name].point;
   assert.ok(point[1]>=r.pinned[1]||(r.rigidZonesV163||[]).some(zone=>zone.bone===rootBone(r)&&inside(point,zone.polygon)),
    'a raised support needs its own static source region');
  }
  assert.equal(meshFor({...r}),null);assert.equal(sample({...r},{clip:'intro',progress:.5,elapsed:.5}),null);
 });
 test(`${r.fighterId}: supported phases stay finite and nonfolding, and all contacts describe actual mesh pixels`,()=>{
  const mesh=meshFor(r);assert.ok(mesh?.triangles.length>0&&mesh.triangles.length<=800);
  let effectiveMotion=0;
  for(const clip of Object.keys(r.poses))for(let i=0;i<=16;i++){
   const frame=sample(r,{clip,progress:i/16,elapsed:i/16*1.8});assert.ok(frame);
   assert.ok(frame.vertices.flat().every(Number.isFinite));assert.equal(frame.restraintPoseV156,undefined);assert.equal(frame.captureReceptionV158,undefined);
   for(const ids of mesh.triangles){
    const original=area(...ids.map(index=>mesh.vertices[index].source));
    assert.ok(area(...ids.map(index=>frame.vertices[index]))>=original*.5,`${clip}/${i}: native triangle compression`);
   }
   for(let j=0;j<mesh.vertices.length;j++)effectiveMotion=Math.max(effectiveMotion,Math.hypot(...frame.vertices[j].map((v,k)=>v-mesh.vertices[j].source[k])));
   for(const[name,c]of Object.entries(r.contacts)){
    const shown=project(r,frame,c.point);assert.ok(shown,`${name}: contact covered by real mesh`);
    shown.forEach((v,k)=>close(v,frame.contacts[name][k],name));
   }
   for(const name of supports(r))r.contacts[name].point.forEach((v,k)=>close(v,frame.contacts[name][k],name+' planted support'));
  }
  assert.ok(effectiveMotion>1,'authored control anchors must produce real source-pixel motion');
  assert.ok(effectiveMotion<Math.max(r.sourceWidth,r.sourceHeight)*.04,'bounded presentation, not a body-scale warp');
  for(const clip of Object.keys(r.poses)){
   const frame=sample(r,{clip,progress:.5,elapsed:.6},true);assert.equal(frame.active,false);
   frame.vertices.forEach((p,i)=>p.forEach((v,k)=>close(v,mesh.vertices[i].source[k],'reduced motion')));
  }
  for(const clip of['intro','round-win','round-loss'])for(const progress of[0,1])assert.equal(sample(r,{clip,progress,elapsed:progress*1.8}).active,false);
 });
 test(`${r.fighterId}: renderer mirrors native scale, rejects malformed input and leaves unsupported choreography unadmitted`,()=>{
  const frame=sample(r,{clip:'intro',progress:.5,elapsed:.6}),mesh=meshFor(r),context=ctx();
  const a=draw(context,r,image(r),frame,metrics(r),500,450,1),b=draw(context,r,image(r),frame,metrics(r),500,450,-1);
  assert.ok(a?.drawn&&b?.drawn);assert.equal(context.draws,mesh.triangles.length*2);
  for(const name of Object.keys(a.contacts)){close(a.contacts[name][0]+b.contacts[name][0],1000,'mirrored x');close(a.contacts[name][1],b.contacts[name][1],'same y');}
  assert.equal(draw(ctx(),r,{...image(r),naturalWidth:1},frame,metrics(r),500,450,1),null);
  assert.equal(draw(ctx(),r,image(r),{...frame,vertices:[[NaN,0]]},metrics(r),500,450,1),null);
  for(const clip of['walk','taunt','terminal','__proto__','constructor'])assert.equal(sample(r,{clip,progress:.5,elapsed:.5}),null);
  assert.ok(r.struggleOscillationV165.degrees>=0&&r.struggleOscillationV165.degrees<=.2);
  assert.ok(r.struggleOscillationV165.radiansPerSecond>=4.8&&r.struggleOscillationV165.radiansPerSecond<=5.5);
 });
}

test('every newly measured rigid source region preserves real opaque pixel distances',()=>{
 let regions=0,visibleSamples=0;
 for(const r of rigs)for(const zone of r.rigidZonesV163||[]){
  const png=native(r),samples=[];assert.ok(zone.polygon.length>=3);regions++;
  // Independent real native pixels, not the selected mesh vertices.
  for(let y=0;y<png.height;y+=7)for(let x=0;x<png.width;x+=7)if(png.alpha[y*png.width+x]>=128&&inside([x,y],zone.polygon))samples.push([x,y]);
  assert.ok(samples.length>=4,`${r.fighterId}: actual rigid source pixels`);visibleSamples+=samples.length;
  const selected=samples.filter((_,i)=>i%Math.max(1,Math.floor(samples.length/72))===0);
  for(const clip of Object.keys(r.poses))for(const progress of[.2,.5,.8]){
   const frame=sample(r,{clip,progress,elapsed:progress*1.8}),shown=selected.map(p=>project(r,frame,p));assert.ok(shown.every(Boolean));
   for(let i=1;i<selected.length;i++)close(Math.hypot(shown[i][0]-shown[0][0],shown[i][1]-shown[0][1]),Math.hypot(selected[i][0]-selected[0][0],selected[i][1]-selected[0][1]),r.fighterId+' rigid source distance');
  }
  if(zone.bone!==rootBone(r))for(const name of supports(r))assert.equal(inside(r.contacts[name].point,zone.polygon),false,'a carried source region cannot acquire a sole');
 }
 assert.ok(regions>=10&&visibleSamples>1000);
});

test('rigid mechanical defaults keep opaque chassis pixels below the head boundary fixed',()=>{
 const protectedRigs=rigs.filter(r=>r.rigidDefaultBoneV165);assert.equal(protectedRigs.length,12);
 for(const id of['mecha','mecha-2','mechanoid','import-engineer-wararmor'])assert.ok(protectedRigs.some(r=>r.fighterId===id));
 for(const r of protectedRigs){
  assert.equal(r.rigidDefaultBoneV165,rootBone(r));
  const png=native(r),headRegions=r.rigidZonesV163.filter(zone=>zone.bone===(r.articulatedRegionBoneV165||'head'));assert.equal(headRegions.length,1);
  const top=Math.max(...headRegions[0].polygon.map(p=>p[1]))+r.mesh.cell*2,samples=[];
  if(r.staticProofRectsV165){
   for(const[left,upper,right,bottom]of r.staticProofRectsV165)for(let y=upper;y<Math.min(bottom,png.height);y+=17)for(let x=left;x<Math.min(right,png.width);x+=17)if(png.alpha[y*png.width+x]>=128)samples.push([x,y]);
  }else for(let y=top;y<png.height;y+=31)for(let x=0;x<png.width;x+=31)if(png.alpha[y*png.width+x]>=128)samples.push([x,y]);
  assert.ok(samples.length>=10);
  for(const clip of Object.keys(r.poses)){
   const frame=sample(r,{clip,progress:.5,elapsed:.6});
   for(const point of samples){const shown=project(r,frame,point);assert.ok(shown);point.forEach((v,k)=>close(v,shown[k],'fixed lower mechanical chassis'));}
  }
 }
});

test('Harbinger keeps six individually located hooks and a mouth/thorax cage rather than humanoid limb reconstruction',()=>{
 const r=rigs.find(r=>r.fighterId==='import-game-afe2-harbinger');assert.ok(r);
 assert.ok(r.bones.some(b=>b.id==='mouth')&&r.bones.some(b=>b.id==='thorax'));
 assert.ok(!r.bones.some(b=>b.id==='spine'||b.id==='head'));
 for(const name of['handFar','handNear','clawUpperFar','clawUpperNear','clawLowerFar','clawLowerNear'])assert.ok(r.contacts[name]);
 assert.equal(r.struggleOscillationV165.bone,'mouth');assert.equal(r.fullLocomotion,false);
});

// Source plates without human limbs must retain their own control vocabulary.
test('legless, sac and robotic sources use declared visible support regions without invented human joints',()=>{
 for(const id of['drive-v123-neca-snake-series13-v14','import-xeno-titan-queen-nolegs','synth-automated-powerloader','import-game-afe2-bulwark','drive-v123-fte-pathogen-popper-profile-v13']){
  const r=rigs.find(r=>r.fighterId===id);assert.ok(r&&r.supportRootBoneV165);
  assert.ok(!r.bones.some(b=>['hips','soleFar','soleNear'].includes(b.id)));
  assert.ok(supports(r).every(name=>!name.startsWith('foot')));
  assert.equal(r.fullLocomotion,false);assert.equal(r.captureSequenceAdmission,false);
 }
 const snake=rigs.find(r=>r.fighterId==='drive-v123-neca-snake-series13-v14');
 assert.deepEqual(snake.absentContactsV165,['handFar','handNear']);
 assert.ok(snake.bones.some(b=>b.id==='coilRoot')&&snake.bones.some(b=>b.id==='vertebralStem'));
 const bulwark=rigs.find(r=>r.fighterId==='import-game-afe2-bulwark');assert.equal(supports(bulwark).length,3);assert.ok(bulwark.occludedContactsV165.includes('rearSupportFar'));
});
