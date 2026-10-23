import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {inflateSync} from 'node:zlib';
import {XENO_TRIALS_CAPTURE_ATLASES_V163 as atlases} from '../src/xeno-trials-capture-data-v163.js';
import {XENO_TRIALS_CAPTURE_V163 as config,getXenoTrialsCaptureAtlasV163 as atlasFor,getXenoTrialsCaptureViewV163 as view,
 drawXenoTrialsCaptureTargetV163 as draw,getXenoTrialsCaptureReceiptV163 as receipt,sampleXenoTrialsPreparationV163 as prep} from '../src/xeno-trials-capture-v163.js';
import {XENO_TRIALS_RIGS_V154 as rigs,getXenoTrialsRigMeshV154 as mesh,sampleXenoTrialsRigV154 as sample,
 getXenoTrialsRigCueV154 as cue,projectXenoTrialsMeshPointV157 as project,xenoTrialsTriangleAreaV154 as area} from '../src/xeno-trials-rig-v154.js';
import {createXenoTrialsMatchV96 as create,stepXenoTrialsMatchV96 as step,setXenoTrialsPausedV96 as pause} from '../src/xeno-trials-engine-v96.js';
import {getXenoTrialsArtV96 as art,getXenoTrialsFighterV96 as definition} from '../src/xeno-trials-data-v96.js';
const clone=v=>JSON.parse(JSON.stringify(v)),DT=1/120,near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const images=new Map([...atlases,...rigs].map(a=>[a.path,{naturalWidth:a.sourceWidth,naturalHeight:a.sourceHeight,complete:true}]));
function native(id){const m=create({playerId:id,opponentId:'prowler',introSeconds:0,roundSeconds:120,seed:153,difficulty:'hard'});
 for(let i=0;i<5400&&!m.grappleV153;i++)step(m,DT,{});assert.ok(m.grappleV153,'native CPU must earn contact');return m;}
const ctx=()=>new Proxy({globalAlpha:1,calls:[]},{get:(t,k)=>k in t?t[k]:(...args)=>t.calls.push([k,...args])});
// Inspect the actual atlas bytes using only Node's standard library. The source
// contract is non-interlaced 8-bit RGBA PNG; Python imaging packages are not a
// dependency of the repository's Node/CI verification phase.
function rgbaAlpha(bytes){
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(bytes.toString('ascii',12,16),'IHDR');assert.equal(bytes.readUInt32BE(8),13);
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
 assert.equal(bytes[24],8);assert.equal(bytes[25],6);assert.equal(bytes[26],0);assert.equal(bytes[27],0);assert.equal(bytes[28],0);
 const chunks=[];
 for(let offset=8;offset<bytes.length;){
  const length=bytes.readUInt32BE(offset);assert.ok(offset+length+12<=bytes.length);
  if(bytes.toString('ascii',offset+4,offset+8)==='IDAT')chunks.push(bytes.subarray(offset+8,offset+8+length));
  offset+=length+12;
 }
 const raw=inflateSync(Buffer.concat(chunks)),stride=width*4,alpha=new Uint8Array(width*height);
 assert.equal(raw.length,(stride+1)*height);
 const paeth=(a,b,c)=>{const p=a+b-c,aa=Math.abs(p-a),bb=Math.abs(p-b),cc=Math.abs(p-c);return aa<=bb&&aa<=cc?a:bb<=cc?b:c;};
 let previous=new Uint8Array(stride),offset=0;
 for(let y=0;y<height;y++){
  const filter=raw[offset++],row=new Uint8Array(stride);assert.ok(filter<=4);
  for(let i=0;i<stride;i++){
   const left=i>=4?row[i-4]:0,up=previous[i],corner=i>=4?previous[i-4]:0;
   let prediction=0;
   if(filter===1)prediction=left;
   else if(filter===2)prediction=up;
   else if(filter===3)prediction=Math.floor((left+up)/2);
   else if(filter===4)prediction=paeth(left,up,corner);
   row[i]=(raw[offset++]+prediction)&255;
  }
  for(let x=0;x<width;x++)alpha[y*width+x]=row[x*4+3];
  previous=row;
 }
 assert.equal(offset,raw.length);return{width,height,alpha};
}
function inspectAtlasAlpha(bytes,atlas){
 const {width,height,alpha}=rgbaAlpha(bytes),labels=new Uint32Array(alpha.length),queue=new Uint32Array(alpha.length),large=new Set();
 let zero=0,solid=0,component=0;
 for(let index=0;index<alpha.length;index++){
  if(alpha[index]===0)zero++;if(alpha[index]>=128)solid++;
  if(alpha[index]<=2||labels[index])continue;
  // scipy.ndimage.label's default two-dimensional connectivity is the same
  // four-neighbour cross. Label every component before applying size>1000.
  const id=++component;let head=0,tail=1;queue[0]=index;labels[index]=id;
  const visit=next=>{if(alpha[next]>2&&!labels[next]){labels[next]=id;queue[tail++]=next;}};
  while(head<tail){
   const next=queue[head++],x=next%width;
   if(x>0)visit(next-1);if(x+1<width)visit(next+1);
   if(next>=width)visit(next-width);if(next+width<alpha.length)visit(next+width);
  }
  if(tail>1000)large.add(id);
 }
 const at=point=>{
  const[x,y]=point;assert.ok(Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<width&&y<height);
  return alpha[y*width+x];
 };
 const frames=atlas.frames.map(frame=>{
  const[x0,y0,x1,y1]=frame.rect;assert.ok([x0,y0,x1,y1].every(Number.isInteger)&&x0>=0&&y0>=0&&x1<=width&&y1<=height&&x1>x0&&y1>y0);
  const bodies=new Set();let pixels=0;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
   const index=y*width+x;if(alpha[index]>2)pixels++;
   if(large.has(labels[index]))bodies.add(labels[index]);
  }
  return{bodies:[...bodies],pixels,solidContacts:Object.values(frame.contacts).every(point=>at(point)>=128),floor:at(frame.contacts.floorSupport)};
 });
 return{mode:'RGBA',zero,solid,bodyCount:large.size,frames};
}
test('27 original painted poses have pinned byte provenance, real alpha and nine separated bodies per atlas',()=>{
 const report=atlases.map(a=>inspectAtlasAlpha(readFileSync(new URL('..'+a.path,import.meta.url)),a));
 assert.equal(atlases.length,3);assert.equal(config.taskIds.length,9);assert.equal(atlases.reduce((n,a)=>n+a.frames.length,0),27);
 for(const[a,i]of atlases.map((a,i)=>[a,i])){const bytes=readFileSync(new URL('..'+a.path,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sourceSha256);assert.equal(bytes.length,a.bytes);
  assert.equal(bytes.readUInt32BE(16),1536);assert.equal(bytes.readUInt32BE(20),1024);assert.equal(a.canonExact,false);
  const r=report[i];assert.equal(r.mode,'RGBA');assert.equal(r.bodyCount,9);assert.ok(r.zero>1000000);assert.ok(r.solid>300000);
  for(const[f,j]of a.frames.map((f,j)=>[f,j])){assert.equal(r.frames[j].bodies.length,1);assert.equal(r.frames[j].pixels,f.alphaPixelsOver2);assert.ok(r.frames[j].solidContacts);assert.ok(r.frames[j].floor>=128);assert.equal(f.contacts.floorSupport[1],f.supportY);}
 }
});
test('identity binding refuses another costume, historical source or SHA',()=>{
 for(const a of atlases){assert.equal(atlasFor(definition(a.fighterId),art(a.fighterId)),a);
  assert.equal(atlasFor({...definition(a.fighterId),id:'warrior'},art(a.fighterId)),null);
  for(const patch of [{id:'other'},{path:atlases[(atlases.indexOf(a)+1)%3].referencePath},{sha256:'x'.repeat(64)}])assert.equal(atlasFor(definition(a.fighterId),{...art(a.fighterId),...patch}),null);
 }
});
for(const atlas of atlases){
 test(atlas.fighterId+': real contact reaches an articulated supported floor pin, exact drawn hand contacts and a distinct guard resistance',()=>{
  const m=native(atlas.fighterId);let observed=null;
  for(let i=0;i<75;i++){step(m,DT,{});const state=clone(m),v=view(m,images);assert.deepEqual(m,state);if(v?.pairedContacts)observed=v;}
  assert.ok(observed?.fullFloorPin);assert.ok(observed.gaps.every(g=>g<=8));assert.equal(observed.layout.frame.id,'floor-pin');
  for(const limb of observed.captorPose.pairedPinV163.limbs){assert.ok(limb.lengthRatio>=.8&&limb.lengthRatio<=1.25);assert.ok(limb.degrees<=18);}
  near(observed.layout.contacts.floorSupport[1],450);assert.ok(Math.abs(observed.rootOffset)<=config.maxVisualRootOffset);
  assert.ok(observed.layout.bounds.right-observed.layout.bounds.left<200,'floor body retains native human stature');
  for(const ids of mesh(observed.rig).triangles)assert.ok(area(...ids.map(i=>observed.captorPose.vertices[i]))>=area(...ids.map(i=>mesh(observed.rig).vertices[i].source))*.2);
  const phases=new Set();for(let i=0;i<60&&m.grappleV153;i++){step(m,DT,{guard:true});const v=view(m,images);if(v?.pairedContacts){phases.add(v.layout.frame.id);assert.ok(v.gaps.every(g=>g<=8));}}
  assert.deepEqual([...phases].sort(),['floor-pin','resistance']);
 });
 test(atlas.fighterId+': mirrored geometric boundary fixture keeps actual supports, hand gaps and native size',()=>{
  const m=native(atlas.fighterId);for(let i=0;i<65;i++){step(m,DT,{});view(m,images);}
  const a=view(m,images),other=clone(m);
  for(const f of other.fighters){f.x=1000-f.x;f.facing*=-1;}other.grappleV153.attackerX=1000-other.grappleV153.attackerX;other.grappleV153.targetX=1000-other.grappleV153.targetX;
  const b=view(other,images);assert.ok(a.pairedContacts&&b.pairedContacts);
  for(const key of Object.keys(a.layout.contacts)){near(a.layout.contacts[key][0]+b.layout.contacts[key][0],1000);near(a.layout.contacts[key][1],b.layout.contacts[key][1]);}
  for(let i=0;i<2;i++){near(a.actualHands[i][0]+b.actualHands[i][0],1000);near(a.actualHands[i][1],b.actualHands[i][1]);near(a.gaps[i],b.gaps[i]);}
 });
 test(atlas.fighterId+': pause is exact, native guard escape releases once, recovery does not rewrite a match',()=>{
  const a=native(atlas.fighterId);for(let i=0;i<60;i++){step(a,DT,{});view(a,images);}
  pause(a,true);const frozen=clone(a),before=receipt(view(a,images),'captive');
  for(let i=0;i<12;i++){step(a,DT,{guard:true});assert.deepEqual(receipt(view(a,images),'captive'),before);}assert.deepEqual(a,frozen);pause(a,false);
  const b=clone(a);let recoveryFrames=new Set();for(let i=0;i<160;i++){
   const controls=i<75?{guard:true}:{};step(a,DT,controls,{});step(b,DT,controls,{});const v=view(a,images);
   if(v?.record.phase==='recovery')recoveryFrames.add(v.layout.frame.id);
   if(v){const c=ctx(),image=images.get(v.atlas.path),state=clone(a);assert.ok(draw(c,image,v)?.drawn);assert.deepEqual(a,state);}
  }
  assert.deepEqual(a,b);assert.equal(a.fighters[0].stats.grappleEscapesV153,1);assert.ok(recoveryFrames.has('elbow-release'));assert.ok(recoveryFrames.has('half-kneel'));assert.ok(recoveryFrames.has('recovered'));
 });
 test(atlas.fighterId+': missing or wrong-size atlas retains the historical native fallback',()=>{
  const m=native(atlas.fighterId);for(let i=0;i<65;i++)step(m,DT,{});
  const missing=new Map(images);missing.delete(atlas.path);assert.equal(view(m,missing),null);
  missing.set(atlas.path,{naturalWidth:1,naturalHeight:1024});assert.equal(view(m,missing),null);
  const v=view(m,images),c=ctx();assert.equal(draw(c,{naturalWidth:1,naturalHeight:1},v),null);assert.equal(c.calls.length,0);
 });
 test(atlas.fighterId+': Prowler forelimbs start release at the actual held skin and finish within the native quarter-second stun',()=>{
  const m=native(atlas.fighterId);for(let i=0;i<60;i++){step(m,DT,{},{});view(m,images);}
  let held=null;
  for(let i=0;i<72;i++){held=view(m,images);step(m,DT,{guard:true},{});if(!m.grappleV153)break;}
  assert.ok(!m.grappleV153);const release=view(m,images);
  assert.ok(release.captorRecovery);assert.equal(release.captorPose.pairedReleaseV163.duration,.25);
  release.captorPose.vertices.forEach((p,i)=>p.forEach((v,k)=>near(v,held.captorPose.vertices[i][k])));
  const heldTime=m.tick,lastState=clone(m);assert.equal(lastState.fighters[1].stun,.25);
  for(let i=0;i<31;i++){step(m,DT,{},{});view(m,images);}
  assert.ok((m.tick-heldTime)/120>=.25);assert.equal(view(m,images).captorRecovery,false);assert.ok(m.fighters[1].stun<=1e-7);
 });
}
test('Prowler real startup owns bounded body absorption; lower source band and all supports stay exact',()=>{
 const r=rigs[0],m=create({playerId:'prowler',opponentId:atlases[0].fighterId,introSeconds:0});
 step(m,DT,{special:true},{});let loaded=false;
 for(let i=0;i<45;i++){const c=cue(r,m,m.fighters[0]);if(c?.clip==='windup'){
  const f=sample(r,c),p=prep(r,f,c);if(p.preparationV163?.gain>.5)loaded=true;
  mesh(r).vertices.forEach((v,i)=>{if(v.source[1]>=877){near(f.vertices[i][0],p.vertices[i][0]);near(f.vertices[i][1],p.vertices[i][1]);}});
  for(const key of ['footNear','footFar']){const a=project(r,f,r.contacts[key].point),b=project(r,p,r.contacts[key].point);a.forEach((v,i)=>near(v,b[i]));}
  assert.equal(prep(r,f,c,true),f);
 }step(m,DT,{},{});}
 assert.ok(loaded);assert.ok(!cue(r,m,m.fighters[0])||cue(r,m,m.fighters[0]).clip!=='windup');
});
test('nine task IDs are technique-only and no renderer changes authority, costs or source art bytes',()=>{
 const source=readFileSync(new URL('../src/xeno-trials-capture-v163.js',import.meta.url),'utf8');
 assert.equal(config.canonExact,false);assert.ok(!/match\.(tick|phase|fighters|grappleV153)\s*=/.test(source));
 assert.ok(source.includes('engineBodiesUnchanged:true'));assert.ok(source.includes('new-original-native-art-not-canonical-reference'));
});
