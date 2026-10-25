/** Targeted native-source geometry checks. This is not a browser or raster QA.
 * Real PNG alpha chooses the witnesses, including every visible pixel center
 * inside each carried zone and every visible pixel in its lower support band.
 * Projections use the actual textured triangles, not intended bone contacts or
 * an assertion restricted to vertices that happen to lie inside the polygon.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { XENO_TRIALS_RIG_DATA_V163 as rigs } from '../src/xeno-trials-rig-data-v163.js';
import { getXenoTrialsRigMeshV154 as meshOf, sampleXenoTrialsRigV154 as sample,
 projectXenoTrialsMeshPointV157 as project, drawXenoTrialsRigV154 as draw,
 xenoTrialsTriangleAreaV154 as area } from '../src/xeno-trials-rig-v154.js';
import { getXenoTrialsRenderMetricsV110 as metricsOf } from '../src/xeno-trials-scale-v110.js';

const EPSILON=1e-7;
const carried=rigs.filter(r => r.rigidZonesV163?.length);
const close=(a,b,label)=>assert.ok(Math.abs(a-b)<EPSILON,`${label}: ${a} != ${b}`);
const inside=([x,y],polygon)=>{
 let hit=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
  const a=polygon[i],b=polygon[j];
  if((a[1]>y)!==(b[1]>y) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;
 }
 return hit;
};

// Independent PNG decode from the actual bytes; only lossless 8-bit RGBA,
// non-interlaced source plates are admitted by this narrow fixture.
function sourceAlpha(rig) {
 const bytes=readFileSync(new URL('..'+rig.path,import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),rig.sourceSha256);
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
 assert.equal(width,rig.sourceWidth);assert.equal(height,rig.sourceHeight);
 assert.equal(bytes[24],8);assert.equal(bytes[25],6);assert.equal(bytes[28],0);
 const chunks=[];
 for(let offset=8;offset<bytes.length;) {
  const length=bytes.readUInt32BE(offset),type=bytes.toString('ascii',offset+4,offset+8);
  if(type==='IDAT')chunks.push(bytes.subarray(offset+8,offset+8+length));
  offset+=length+12;
 }
 const raw=inflateSync(Buffer.concat(chunks)),stride=width*4,alpha=new Uint8Array(width*height);
 let previous=new Uint8Array(stride),offset=0;
 const paeth=(a,b,c)=>{const p=a+b-c,aa=Math.abs(p-a),bb=Math.abs(p-b),cc=Math.abs(p-c);return aa<=bb&&aa<=cc?a:bb<=cc?b:c;};
 for(let y=0;y<height;y++) {
  const filter=raw[offset++],row=new Uint8Array(stride);assert.ok(filter<=4);
  for(let i=0;i<stride;i++) {
   const left=i>=4?row[i-4]:0,up=previous[i],corner=i>=4?previous[i-4]:0;
   let prediction=0;
   if(filter===1)prediction=left;
   if(filter===2)prediction=up;
   if(filter===3)prediction=Math.floor((left+up)/2);
   if(filter===4)prediction=paeth(left,up,corner);
   row[i]=(raw[offset++]+prediction)&255;
  }
  for(let x=0;x<width;x++)alpha[y*width+x]=row[x*4+3];
  previous=row;
 }
 assert.equal(offset,raw.length);
 return {width,height,alpha};
}

function triangleIndex(mesh,rig) {
 const cells=new Map();
 for(let index=0;index<mesh.triangles.length;index++) {
  const p=mesh.triangles[index].map(id=>mesh.vertices[id].source);
  const x=Math.floor(Math.min(...p.map(p=>p[0]))/rig.mesh.cell),y=Math.floor(Math.min(...p.map(p=>p[1]))/rig.mesh.cell);
  const key=y*rig.mesh.cols+x;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(index);
 }
 return ([x,y])=>{
  const cellX=Math.min(rig.mesh.cols-1,Math.floor(x/rig.mesh.cell)),cellY=Math.min(rig.mesh.rows-1,Math.floor(y/rig.mesh.cell));
  for(const index of cells.get(cellY*rig.mesh.cols+cellX)||[]) {
   const [a,b,c]=mesh.triangles[index].map(id=>mesh.vertices[id].source);
   const det=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
   const wb=((x-a[0])*(c[1]-a[1])-(y-a[1])*(c[0]-a[0]))/det;
   const wc=((b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0]))/det;
   if(Math.min(1-wb-wc,wb,wc)>=-1e-10)return [index,wb,wc];
  }
  assert.fail(`visible source pixel (${x},${y}) has no textured triangle`);
 };
}

// Pack the real triangle and barycentric weights once; exhaustive pixel-center
// checks then avoid searching the entire mesh again for every sampled frame.
const pack=(points,locate)=>{
 const result=new Float64Array(points.length/2*5);
 for(let i=0,j=0;i<points.length;i+=2,j+=5)result.set([points[i],points[i+1],...locate([points[i],points[i+1]])],j);
 return result;
};
function witnesses(rig,mesh,png) {
 assert.equal(rig.rigidZonesV163.length,1,'review a future multi-zone plate explicitly');
 const zone=rig.rigidZonesV163[0];assert.equal(zone.bone,'spine');
 const supports=Object.values(rig.contacts).filter(c=>c.bone==='hips').map(c=>c.point);
 const soleBand=Math.min(...supports.map(p=>p[1]))-16;
 const zonePixels=[],supportPixels=[],edgePixels=[];
 let opaque=0,alphaContour=0,visibleContour=0;
 const at=(x,y)=>x<0||y<0||x>=png.width||y>=png.height?0:png.alpha[y*png.width+x];
 for(let y=0;y<png.height;y++)for(let x=0;x<png.width;x++) {
  const alpha=at(x,y);if(!alpha)continue;
  const point=[x+.5,y+.5];
  if(y+.5>=soleBand)supportPixels.push(...point);
  if(!inside(point,zone.polygon))continue;
  zonePixels.push(...point);
  if(alpha>=250)opaque++;
  const adjacent=[at(x-1,y),at(x+1,y),at(x,y-1),at(x,y+1)];
  const edge=adjacent.some(a=>a===0),visibleEdge=alpha>=128&&adjacent.some(a=>a<128);
  if(edge)alphaContour++;
  if(visibleEdge)visibleContour++;
  if(edge||visibleEdge)edgePixels.push(...point);
 }
 assert.ok(opaque>100,`${rig.fighterId}: actual opaque carried pixels required`);
 assert.ok(alphaContour>10,`${rig.fighterId}: actual zero/nonzero alpha contour required`);
 assert.ok(visibleContour>10,`${rig.fighterId}: actual 128-alpha silhouette contour required`);
 assert.ok(supportPixels.length>100);
 const locate=triangleIndex(mesh,rig),edges=[];
 // Exported projection is cross-checked on a distributed subset of every real
 // contour, plus extreme contour points for explicit distance preservation.
 for(let i=0;i<edgePixels.length;i+=Math.max(2,Math.floor(edgePixels.length/48/2)*2))edges.push([edgePixels[i],edgePixels[i+1]]);
 const pairs=[];
 for(let i=0;i<edgePixels.length;i+=2)pairs.push([edgePixels[i],edgePixels[i+1]]);
 for(const [axis,sign]of [[0,1],[0,-1],[1,1],[1,-1]])edges.push(pairs.reduce((best,p)=>sign*p[axis]>sign*best[axis]?p:best));
 if(rig.fighterId==='synth-trooper')for(const point of [[200,1208],[256,1024]]) {
  assert.ok(at(...point)>=250);assert.equal(inside(point,zone.polygon),true);edges.push(point);
 }
 return {zone:pack(zonePixels,locate),supports:pack(supportPixels,locate),edges,locate,
  counts:{visible:zonePixels.length/2,opaque,alphaContour,visibleContour,support: supportPixels.length/2}};
}

const smooth=n=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
// Expected motion derives from the declared pose and clip envelope, independently
// of frame.angles, vertex weights and the production triangle admission helper.
function expectedTransform(rig,cue,reducedMotion) {
 let gain=1;
 if(cue.clip==='intro')gain=Math.sin(Math.PI*cue.progress)**2;
 else if(cue.clip==='release')gain=1-smooth(cue.progress);
 else if(cue.clip.startsWith('round-'))gain=smooth(cue.progress/.3)*(1-smooth((cue.progress-.78)/.22));
 else gain=smooth(cue.elapsed/.12);
 if(reducedMotion)gain=0;
 const pose=cue.clip==='release'?rig.poses[cue.releaseFrom==='struggle'?'struggle':'restraint']:rig.poses[cue.clip];
 const radians=(pose.spine||0)*gain*Math.PI/180;
 const [x,y]=rig.bones.find(b=>b.id==='spine').pivot,c=Math.cos(radians),s=Math.sin(radians);
 return [c,s,-s,c,x-c*x+s*y,y-s*x-c*y];
}
const transformed=(m,[x,y])=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]];
const identity=[1,0,0,1,0,0];
function verifyPixels(points,mesh,frame,expected,label) {
 let worst=0,where=null;
 for(let i=0;i<points.length;i+=5) {
  const x=points[i],y=points[i+1],ids=mesh.triangles[points[i+2]],wb=points[i+3],wc=points[i+4],wa=1-wb-wc;
  const a=frame.vertices[ids[0]],b=frame.vertices[ids[1]],c=frame.vertices[ids[2]];
  const px=a[0]*wa+b[0]*wb+c[0]*wc,py=a[1]*wa+b[1]*wb+c[1]*wc;
  const ex=expected[0]*x+expected[2]*y+expected[4],ey=expected[1]*x+expected[3]*y+expected[5];
  const error=Math.hypot(px-ex,py-ey);
  if(error>worst){worst=error;where=[x,y];}
 }
 assert.ok(worst<EPSILON,`${label}: (${where}) differs by ${worst} source pixels`);
 return worst;
}

const multiply=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
function recordingContext() {
 let matrix=[...identity];const stack=[],paint=[];
 return {paint,save(){stack.push([...matrix]);},restore(){matrix=stack.pop();},
  translate(x,y){matrix=multiply(matrix,[1,0,0,1,x,y]);},scale(x,y){matrix=multiply(matrix,[x,0,0,y,0,0]);},
  transform(...next){matrix=multiply(matrix,next);},drawImage(){paint.push([...matrix]);},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){}};
}

test('six measured carried zones are checked against source-alpha pixels, not only interior mesh vertices',()=>{
 assert.deepEqual(carried.map(r=>r.fighterId),['synth-trooper','synth-guard','synth-sniper','synth-heavy','combat-synth','synth-good-boy']);
});
for(const rig of carried)test(`${rig.fighterId}: opaque interiors, real contours and planted supports retain rigid geometry across six clips`,t=>{
 const png=sourceAlpha(rig),mesh=meshOf(rig),w=witnesses(rig,mesh,png),metrics=metricsOf(rig.fighterId);
 const sx=metrics.width/rig.sourceWidth,sy=metrics.height/rig.sourceHeight;
 const image={complete:true,naturalWidth:png.width,naturalHeight:png.height};
 assert.deepEqual(Object.keys(rig.poses),['intro','restraint','struggle','release','round-win','round-loss']);
 let frames=0,mirrorDraws=0,maxError=0;
 for(const clip of Object.keys(rig.poses))for(const progress of [0,.125,.5,.6,.875,1])for(const reducedMotion of [false,true]) {
  const cue={clip,progress,elapsed:progress*1.8,heldSeconds:.8,releaseFrom:'struggle'},frame=sample(rig,cue,reducedMotion);
  assert.ok(frame);frames++;
  const expected=expectedTransform(rig,cue,reducedMotion),label=`${rig.fighterId}/${clip}/${progress}/reduced=${reducedMotion}`;
  maxError=Math.max(maxError,verifyPixels(w.zone,mesh,frame,expected,label));
  verifyPixels(w.supports,mesh,frame,identity,`${label}/source-alpha support band`);
  for(const ids of mesh.triangles)assert.ok(area(...ids.map(i=>frame.vertices[i]))>=area(...ids.map(i=>mesh.vertices[i].source))*.2,`${label}: folded triangle`);
  for(const [name,contact]of Object.entries(rig.contacts).filter(([,c])=>c.bone==='hips')) {
   const p=project(rig,frame,contact.point);assert.ok(p);
   close(p[0],contact.point[0],`${label}/${name}/x`);close(p[1],contact.point[1],`${label}/${name}/y`);
   close(frame.contacts[name][0],p[0],`${label}/${name}/reported x`);close(frame.contacts[name][1],p[1],`${label}/${name}/reported y`);
  }
  const shown=w.edges.map(source=>{
   const actual=project(rig,frame,source),target=transformed(expected,source);assert.ok(actual);
   close(actual[0],target[0],`${label}/exported projection x`);close(actual[1],target[1],`${label}/exported projection y`);
   return actual;
  });
  for(let i=1;i<shown.length;i++)close(Math.hypot(shown[i][0]-shown[0][0],shown[i][1]-shown[0][1]),
   Math.hypot(w.edges[i][0]-w.edges[0][0],w.edges[i][1]-w.edges[0][1]),`${label}/contour distance`);
  for(const facing of [-1,1]) {
   const ctx=recordingContext(),receipt=draw(ctx,rig,image,frame,metrics,500,450,facing);
   if(!frame.active){assert.equal(receipt,null);assert.equal(ctx.paint.length,0);continue;}
   assert.equal(receipt?.drawn,true);assert.equal(ctx.paint.length,mesh.triangles.length);mirrorDraws++;
   for(const source of w.edges) {
    const [index]=w.locate(source),actual=transformed(ctx.paint[index],source),local=transformed(expected,source);
    const expectedWorld=[500+(local[0]-metrics.pivotX*rig.sourceWidth)*sx*facing*rig.sourceFacing,
     450+(local[1]-metrics.bottom*rig.sourceHeight)*sy];
    close(actual[0]/sx,expectedWorld[0]/sx,`${label}/facing ${facing}/rendered source-equivalent x`);
    close(actual[1]/sy,expectedWorld[1]/sy,`${label}/facing ${facing}/rendered source-equivalent y`);
   }
  }
 }
 assert.equal(frames,72);assert.ok(mirrorDraws>0);
 t.diagnostic(JSON.stringify({...w.counts,frames,mirrorDraws,maxSourceError:maxError}));
});

test('Trooper regression: the two opaque gun pixels preserve their original 192.333 source-pixel separation',()=>{
 const rig=carried.find(r=>r.fighterId==='synth-trooper'),png=sourceAlpha(rig);
 const sources=[[200,1208],[256,1024]];
 for(const [x,y]of sources)assert.ok(png.alpha[y*png.width+x]>=250);
 const frame=sample(rig,{clip:'struggle',progress:.6,elapsed:.6});
 const shown=sources.map(p=>project(rig,frame,p));assert.ok(shown.every(Boolean));
 close(Math.hypot(shown[0][0]-shown[1][0],shown[0][1]-shown[1][1]),
  Math.hypot(sources[0][0]-sources[1][0],sources[0][1]-sources[1][1]),'formerly stretched native gun');
});

test('negative control: the former vertex-only lower gun policy is rejected through actual pixel projection',t=>{
 const rig=carried.find(r=>r.fighterId==='synth-trooper'),mesh=meshOf(rig),polygon=rig.rigidZonesV163[0].polygon;
 const cue={clip:'struggle',progress:.6,elapsed:.6},frame=sample(rig,cue),before=JSON.stringify(frame);
 let restored=0;
 // A detached malformed frame reproduces the old lower-zone boundary defect:
 // vertices outside the gun polygon but inside the pinned band keep identity.
 // No admitted rig, production sampler, source image or shared frame is edited.
 const regressed={...frame,vertices:frame.vertices.map((p,i)=>{
  const source=mesh.vertices[i].source;
  if(source[0]>=rig.pinned[0]&&source[0]<=rig.pinned[2]&&source[1]>=rig.pinned[1]&&source[1]<=rig.pinned[3]
   &&!inside(source,polygon)) {
   if(Math.hypot(p[0]-source[0],p[1]-source[1])>EPSILON)restored++;
   return [...source];
  }
  return [...p];
 })};
 assert.ok(restored>0);
 const sources=[[200,1208],[256,1024]],expected=expectedTransform(rig,cue,false);
 const bad=sources.map(source=>project(rig,regressed,source));
 const error=Math.max(...bad.map((p,i)=>Math.hypot(...p.map((n,axis)=>n-transformed(expected,sources[i])[axis]))));
 assert.ok(error>1,'the explicit regression must create a measurable source-pixel error');
 const packed=pack(sources.flat(),triangleIndex(mesh,rig));
 assert.throws(()=>verifyPixels(packed,mesh,regressed,expected,'negative control'),/source pixels/);
 const distanceError=Math.abs(Math.hypot(bad[0][0]-bad[1][0],bad[0][1]-bad[1][1])
  -Math.hypot(sources[0][0]-sources[1][0],sources[0][1]-sources[1][1]));
 assert.ok(distanceError>1);
 assert.equal(JSON.stringify(frame),before);
 t.diagnostic(JSON.stringify({detachedRegressedVertices:restored,maxSourceError:error,distanceError}));
});
