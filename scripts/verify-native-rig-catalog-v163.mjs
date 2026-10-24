import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { createXenoTrialsRuntimeV96 as runtime } from '../src/xeno-trials-runtime-v96.js';
import { getXenoTrialsRenderMetricsV110 as nativeMetrics } from '../src/xeno-trials-scale-v110.js';
import { XENO_TRIALS_RIG_DATA_V163 as rigs } from '../src/xeno-trials-rig-data-v163.js';
import { XENO_TRIALS_FIGHTERS_V96 as roster, getXenoTrialsArtV96 as art } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsRigV154 as resolve, getXenoTrialsRigMeshV154 as mesh,
 sampleXenoTrialsRigV154 as sample, sampleXenoTrialsSequenceAnglesV155 as sequence,
 projectXenoTrialsMeshPointV157 as project, xenoTrialsTriangleAreaV154 as area,
 drawXenoTrialsRigV154 as draw } from '../src/xeno-trials-rig-v154.js';

const near = (a,b,epsilon=1e-7) => assert.ok(Math.abs(a-b)<epsilon, `${a} != ${b}`);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const inside = ([x,y], polygon) => {
 let yes=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
  const a=polygon[i],b=polygon[j];
  if((a[1]>y)!==(b[1]>y) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) yes=!yes;
 }
 return yes;
};
// Decode actual native PNG alpha. This checks all source cells, rather than
// merely repeating the dimensions/hash/occupancy declared by the new catalog.
function pngAlpha(bytes) {
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
 assert.equal(bytes[24],8);assert.equal(bytes[25],6);assert.equal(bytes[28],0);
 const chunks=[];
 for(let offset=8;offset<bytes.length;) {
  const size=bytes.readUInt32BE(offset),type=bytes.toString('ascii',offset+4,offset+8);
  if(type==='IDAT')chunks.push(bytes.subarray(offset+8,offset+8+size));
  offset+=12+size;
 }
 const raw=inflateSync(Buffer.concat(chunks)),stride=width*4,alpha=new Uint8Array(width*height);
 let previous=new Uint8Array(stride),offset=0;
 const paeth=(a,b,c)=>{const p=a+b-c,aa=Math.abs(p-a),bb=Math.abs(p-b),cc=Math.abs(p-c);return aa<=bb&&aa<=cc?a:bb<=cc?b:c;};
 for(let y=0;y<height;y++) {
  const filter=raw[offset++],row=new Uint8Array(stride);
  assert.ok(filter<=4);
  for(let i=0;i<stride;i++) {
   const a=i>=4?row[i-4]:0,b=previous[i],c=i>=4?previous[i-4]:0;
   row[i]=(raw[offset++]+[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter])&255;
  }
  for(let x=0;x<width;x++)alpha[y*width+x]=row[x*4+3];
  previous=row;
 }
 assert.equal(offset,raw.length);
 return {width,height,alpha};
}
function measuredMask({width,height,alpha},cell) {
 const cols=Math.ceil(width/cell),rows=Math.ceil(height/cell),occupied=Array(cols*rows).fill(false);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(alpha[y*width+x])occupied[Math.floor(y/cell)*cols+Math.floor(x/cell)]=true;
 let mask='';
 for(let i=0;i<occupied.length;i+=4)mask+=occupied.slice(i,i+4).reduce((n,v,j)=>n+(v?(8>>j):0),0).toString(16);
 return {cell,cols,rows,mask};
}
const image=r=>({complete:true,naturalWidth:r.sourceWidth,naturalHeight:r.sourceHeight});
const metrics=r=>({width:r.sourceWidth*.2,height:r.sourceHeight*.2,pivotX:.5,bottom:1});
const context=()=>new Proxy({draws:0}, {get:(target,key)=>key in target?target[key]:()=>{if(key==='drawImage')target.draws++;}});

test('15 independently bound presentation rigs cover all six roster families without inventing full walks or captures',()=>{
 assert.equal(rigs.length,15);assert.ok(Object.isFrozen(rigs));
 assert.equal(new Set(rigs.map(r=>r.id)).size,15);
 assert.equal(new Set(rigs.map(r=>r.sourceSha256)).size,15);
 assert.equal(new Set(rigs.map(r=>JSON.stringify(r.bones))).size,15);
 assert.deepEqual([...new Set(rigs.map(r=>roster.find(f=>f.id===r.fighterId)?.family))].sort(),['engineer','human','hybrid','pathogen','synthetic','xenomorph']);
 for(const r of rigs) {
  assert.equal(r.fullLocomotion,false);assert.equal(r.captureSequenceAdmission,false);assert.equal(r.canonExact,false);
  assert.equal(r.animation,'authored-native-upper-body-rig-v163');
  assert.ok(!Object.hasOwn(r.poses,'walk'));
 }
});

for(const r of rigs) {
 test(`${r.fighterId}: real bytes, alpha cells, individual joints and exact identity gate agree`,()=>{
  const bytes=readFileSync(new URL('..'+r.path,import.meta.url));
  assert.equal(sha(bytes),r.sourceSha256);
  const png=pngAlpha(bytes);assert.equal(png.width,r.sourceWidth);assert.equal(png.height,r.sourceHeight);
  assert.deepEqual(r.mesh,measuredMask(png,r.mesh.cell));
  const f=roster.find(f=>f.id===r.fighterId),a=art(f.id);
  assert.equal(resolve(f,a),r);
  for(const patch of [{id:'other'},{profileId:'other'}])assert.equal(resolve({...f,...patch},a),null);
  for(const patch of [{id:'other'},{path:'other'},{sourceWidth:1},{sourceHeight:1},{sourceFacing:-a.sourceFacing},{sha256:'0'.repeat(64)}])assert.equal(resolve(f,{...a,...patch}),null);
  const ids=new Set();
  for(const b of r.bones) {
   assert.ok(!ids.has(b.id));assert.ok(b.parent===null||ids.has(b.parent));ids.add(b.id);
   for(const [x,y]of[b.pivot,b.tip]) {
    assert.ok(Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&y>=0&&x<r.sourceWidth&&y<r.sourceHeight);
    assert.ok(png.alpha[y*png.width+x]>0,`${r.fighterId}/${b.id}: landmark (${x},${y}) outside native alpha`);
   }
   assert.ok(Math.hypot(b.tip[0]-b.pivot[0],b.tip[1]-b.pivot[1])>0);
  }
  for(const c of Object.values(r.contacts))assert.ok(ids.has(c.bone));
  for(const zone of r.rigidZonesV163||[]) {
   assert.ok(ids.has(zone.bone));assert.ok(zone.polygon.length>=3);
   for(const key of ['footNear','footFar'])assert.equal(inside(r.contacts[key].point,zone.polygon),false,'carried weapon cannot capture a foot support');
  }
  assert.equal(mesh({...r}),null); // A copied object cannot bypass native admission.
 });
 test(`${r.fighterId}: every clip stays finite and nonfolding, with planted mesh soles and reduced-motion restoration`,()=>{
  const m=mesh(r);assert.ok(m?.triangles.length>0);
  for(const clip of Object.keys(r.poses))for(let i=0;i<=48;i++) {
   const cue={clip,progress:i/48,elapsed:i/48*1.8},frame=sample(r,cue);
   assert.ok(frame?.vertices.flat().every(Number.isFinite));
   for(const ids of m.triangles)assert.ok(area(...ids.map(j=>frame.vertices[j]))>=area(...ids.map(j=>m.vertices[j].source))*.2,`${clip}: folded native mesh`);
   for(const key of ['footNear','footFar']) {
    const source=r.contacts[key].point,shown=project(r,frame,source);assert.ok(shown);
    near(shown[0],source[0]);near(shown[1],source[1]);
    near(frame.contacts[key][0],shown[0]);near(frame.contacts[key][1],shown[1]);
   }
   assert.equal(frame.restraintPoseV156,undefined);assert.equal(frame.captureReceptionV158,undefined);
  }
  for(const clip of Object.keys(r.poses)) {
   const frame=sample(r,{clip,progress:.5,elapsed:.6},true);assert.equal(frame.active,false);
   frame.vertices.forEach((p,i)=>p.forEach((n,k)=>near(n,m.vertices[i].source[k])));
  }
  for(const clip of ['intro','round-win','round-loss'])for(const p of[0,1])assert.equal(sample(r,{clip,progress:p,elapsed:p*1.8}).active,false);
 });
 test(`${r.fighterId}: carried parts retain one transform and drawing mirrors the same native stance`,()=>{
  const m=mesh(r),frame=sample(r,{clip:'struggle',progress:.6,elapsed:.6});
  for(const zone of r.rigidZonesV163||[]) {
   const native=m.vertices.map((v,index)=>({v,index})).filter(({v})=>inside(v.source,zone.polygon));
   assert.ok(native.length>=2);
   for(const {v}of native)assert.deepEqual(v.weights,[[zone.bone,1]]);
   const a=native[0],b=native.at(-1);
   near(Math.hypot(...frame.vertices[a.index].map((n,k)=>n-frame.vertices[b.index][k])),Math.hypot(...a.v.source.map((n,k)=>n-b.v.source[k])));
  }
  const ctx=context(),right=draw(ctx,r,image(r),frame,metrics(r),500,450,1),left=draw(ctx,r,image(r),frame,metrics(r),500,450,-1);
  assert.ok(right?.drawn&&left?.drawn);assert.equal(ctx.draws,m.triangles.length*2);
  for(const key of Object.keys(right.contacts)){near(right.contacts[key][0]+left.contacts[key][0],1000);near(right.contacts[key][1],left.contacts[key][1]);}
  assert.equal(draw(context(),r,{...image(r),naturalWidth:1},frame,metrics(r),0,0,1),null);
  assert.equal(sequence({...r},{clip:'intro',progress:.5,elapsed:.5},{head:1}),null);
 });
}

// Actual controller rendering with a recording Canvas. This catches both the
// missing hybrid label and the old screen-space banner over tall native heads;
// no gameplay state or presentation clock is assigned by this fixture.
test('all189 identities render defined intro labels and an on-screen placard clear of both native silhouettes',async t=>{
 const families={synthetic:'SYNTHÉTIQUE',pathogen:'PATHOGÈNE',xenomorph:'XÉNOMORPHE',engineer:'INGÉNIEUR',human:'HUMAIN',hybrid:'HYBRIDE'};
 const roles={balanced:'POLYVALENT',agile:'MOBILE',tank:'DÉFENSIF',ranged:'DISTANCE'};
 const metadata=new Map(),familyCounts={},matrixProduct=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
 const transform=(m,[x,y])=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]];
 const eventTarget=properties=>Object.assign({addEventListener(){},removeEventListener(){}},properties);
 let observed=0;
 for(const definition of roster){
  const cards=[],texts=[],stack=[];let matrix=[1,0,0,1,0,0];
  const properties={font:'16px monospace',fillStyle:'#000',textAlign:'left',globalAlpha:1,
   save(){stack.push({matrix:[...matrix],font:this.font,fillStyle:this.fillStyle,textAlign:this.textAlign,globalAlpha:this.globalAlpha});},
   restore(){const saved=stack.pop();matrix=saved.matrix;for(const key of ['font','fillStyle','textAlign','globalAlpha'])this[key]=saved[key];},
   translate(x,y){matrix=matrixProduct(matrix,[1,0,0,1,x,y]);},scale(x,y){matrix=matrixProduct(matrix,[x,0,0,y,0,0]);},
   rotate(angle){const c=Math.cos(angle),s=Math.sin(angle);matrix=matrixProduct(matrix,[c,s,-s,c,0,0]);},
   transform(...m){matrix=matrixProduct(matrix,m);},setTransform(...m){matrix=m;},
   measureText(value){return{width:String(value).length*(parseFloat(this.font.match(/[\d.]+px/)?.[0])||16)*.6};},
   fillRect(x,y,width,height){if(this.fillStyle==='#061019df')cards.push({corners:[[x,y],[x+width,y],[x,y+height],[x+width,y+height]].map(p=>transform(matrix,p))});},
   fillText(value,x,y){texts.push({value:String(value),point:transform(matrix,[x,y]),font:this.font,align:this.textAlign,width:this.measureText(value).width});},
   createLinearGradient(){return{addColorStop(){}};},createRadialGradient(){return{addColorStop(){}};}};
  const ctx=new Proxy(properties,{get:(o,key)=>o[key]??(()=>{})});
  const document=eventTarget({hidden:false,hasFocus:()=>true,documentElement:{classList:{contains:()=>false}}});
  const canvas=eventTarget({tagName:'CANVAS',width:1000,height:560,getContext:()=>ctx,setAttribute(){},closest:()=>null,focus(){document.activeElement=this;}});
  const controller=runtime({canvas,document,window:eventTarget({matchMedia:()=>({matches:false})}),
   config:{playerId:definition.id,opponentId:definition.id,introSeconds:0,seed:163},
   loadImage:async path=>{if(!metadata.has(path)){const bytes=readFileSync(new URL('..'+path,import.meta.url));assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');metadata.set(path,{complete:true,naturalWidth:bytes.readUInt32BE(16),naturalHeight:bytes.readUInt32BE(20)});}return metadata.get(path);},
   requestAnimationFrame:()=>1,cancelAnimationFrame(){}});
  try{
   assert.equal(await controller.start(),true,definition.id);
   for(const slot of [0,1]){
    if(slot){cards.length=0;texts.length=0;assert.equal(controller.skipSequence(),true,definition.id);}
    const state=controller.getState(),label=`${definition.id}/slot${slot}`;
    assert.equal(state.presentation.fighterSlot,slot,label);assert.equal(state.tick,0,label);
    assert.ok(families[definition.family],label);assert.ok(roles[definition.role],label);
    assert.ok(texts.every(text=>!/(?:undefined|null|NaN)/.test(text.value)),`${label}: all rendered text defined`);
    const card=cards.at(-1);assert.ok(card,`${label}: actual intro card drawn`);
    const xs=card.corners.map(p=>p[0]),ys=card.corners.map(p=>p[1]);
    const rect={left:Math.min(...xs),right:Math.max(...xs),top:Math.min(...ys),bottom:Math.max(...ys)};
    assert.ok(rect.left>=0&&rect.top>=0&&rect.right<=canvas.width&&rect.bottom<=canvas.height,`${label}: card inside Canvas bounds`);
    const inCard=text=>text.point[0]>=rect.left&&text.point[0]<=rect.right&&text.point[1]>=rect.top&&text.point[1]<=rect.bottom;
    const title=texts.findLast(text=>inCard(text)&&text.value.includes(' / '));
    const details=texts.findLast(text=>inCard(text)&&text.value.includes(' PV'));
    assert.ok(title&&title.value.startsWith(slot?'ADVERSAIRE / ':'VOTRE SPÉCIMEN / '),label);
    assert.equal(details?.value,`${definition.hp} PV  •  ${families[definition.family]}  •  ${roles[definition.role]}`,label);
    for(const text of [title,details]){
     const size=parseFloat(text.font.match(/[\d.]+px/)?.[0]);
     assert.ok(text.point[0]-text.width/2>=rect.left&&text.point[0]+text.width/2<=rect.right&&text.point[1]-size>=rect.top&&text.point[1]+size*.25<=rect.bottom,`${label}: text fits the actual card`);
    }
    for(const fighter of state.fighters){
     const m=nativeMetrics(fighter.id,fighter.variant),a=art(fighter.id,fighter.variant),z=state.cameraV119.zoom,flip=fighter.facing*m.sourceFacing;
     const left=fighter.x+(m.alphaBounds[0]/a.sourceWidth-m.pivotX)*m.width*flip,right=fighter.x+(m.alphaBounds[2]/a.sourceWidth-m.pivotX)*m.width*flip;
     const silhouette={left:500+(Math.min(left,right)-state.cameraV119.center)*z,right:500+(Math.max(left,right)-state.cameraV119.center)*z,
      top:canvas.height*.81+(-fighter.y+(m.alphaBounds[1]/a.sourceHeight-m.bottom)*m.height)*z,
      bottom:canvas.height*.81+(-fighter.y+(m.alphaBounds[3]/a.sourceHeight-m.bottom)*m.height)*z};
     assert.ok(rect.right<=silhouette.left||rect.left>=silhouette.right||rect.bottom<=silhouette.top||rect.top>=silhouette.bottom,`${label}: card does not overlap ${fighter.side}'s measured native alpha envelope`);
    }
    observed++;
   }
  }finally{controller.stop();}
  familyCounts[definition.family]=(familyCounts[definition.family]||0)+1;
 }
 assert.equal(observed,roster.length*2);assert.equal(roster.length,189);assert.deepEqual(Object.keys(familyCounts).sort(),Object.keys(families).sort());
 t.diagnostic(JSON.stringify({identities:roster.length,introRenders:observed,familyCounts,scope:'Recorded native controller/Canvas operations and measured native alpha envelopes; not browser raster evidence.'}));
});
