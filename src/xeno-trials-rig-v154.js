import { sampleXenoTrialsRestraintPoseV156 } from './xeno-trials-restraint-pose-v156.js';
import { sampleXenoTrialsCaptureReceptionV158 } from './xeno-trials-capture-reception-v158.js';
import { XENO_TRIALS_RIG_DATA_V154 } from './xeno-trials-rig-data-v154.js';
import { XENO_TRIALS_GRAPPLE_V153 } from './xeno-trials-grapple-v153.js';
import { XENO_TRIALS_CASTES_V151 } from './xeno-trials-castes-v151.js';
import { XENO_PRESENTATION_V97 } from './xeno-trials-presentation-v97.js';
import { resolveSpriteDrawableV134 } from './sprite-alpha-policy-v134.js';
// Read-only native-texture skinning: original small-amplitude key poses, not
// captured 1:1 choreography. No collision, stature, damage, clock or save writes.
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const XENO_TRIALS_RIGS_V154=freeze(XENO_TRIALS_RIG_DATA_V154);
export const XENO_TRIALS_RIG_TIMING_V154=Object.freeze({intro:XENO_PRESENTATION_V97.introMs/1000,round:1.8,release:XENO_TRIALS_GRAPPLE_V153.recovery,settle:.12});
const clamp=(v,lo=0,hi=1)=>Math.max(lo,Math.min(hi,v));
const smooth=v=>{const t=clamp(v);return t*t*(3-2*t);};
const identity=()=>[1,0,0,1,0,0];
const point=(m,x,y)=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]];
const multiply=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
function rotation(degrees,pivot){const a=degrees*Math.PI/180,c=Math.cos(a),s=Math.sin(a),[x,y]=pivot;return[c,s,-s,c,x-c*x+s*y,y-s*x-c*y];}
export function getXenoTrialsRigV154(definition,art){
 const r=XENO_TRIALS_RIGS_V154.find(r=>r.fighterId===definition?.id&&r.profileId===definition.profileId);
 return r&&art?.id===r.profileId&&art.path===r.path&&art.sourceWidth===r.sourceWidth&&art.sourceHeight===r.sourceHeight
  &&art.sourceFacing===r.sourceFacing&&(!art.sha256||art.sha256===r.sourceSha256)?r:null;
}
const inside=(p,r)=>r&&p[0]>=r[0]&&p[0]<=r[2]&&p[1]>=r[1]&&p[1]<=r[3];
function distance(p,b){const[x,y]=b.pivot,dx=b.tip[0]-x,dy=b.tip[1]-y,t=clamp(((p[0]-x)*dx+(p[1]-y)*dy)/(dx*dx+dy*dy||1));return Math.hypot(p[0]-x-dx*t,p[1]-y-dy*t);}
const meshes=new WeakMap();
// One observed contact per match, outside the authoritative engine. A projectile
// can separate the actors before release: reception must keep the direction it
// actually displayed, rather than recompute it from newly displaced bodies.
const receptionContactsV158=new WeakMap();
// Native alpha cells are retained even when they contain a single visible pixel.
export function getXenoTrialsRigMeshV154(rig){
 if(!XENO_TRIALS_RIGS_V154.includes(rig))return null;
 if(meshes.has(rig))return meshes.get(rig);
 const{cell,cols,rows,mask}=rig.mesh,vertices=[],triangles=[],lookup=new Map();
 const vertex=(x,y)=>{
  const key=`${x}:${y}`;if(lookup.has(key))return lookup.get(key);
  const p=[Math.min(x*cell,rig.sourceWidth),Math.min(y*cell,rig.sourceHeight)];let weights;
  if(inside(p,rig.pinned))weights=[['hips',1]];
  else if(inside(p,rig.rigidWeaponZone))weights=[['spine',1]];
  else{const near=rig.bones.map(b=>[b.id,distance(p,b)]).sort((a,b)=>a[1]-b[1]).slice(0,2);
   const values=near.map(([id,d])=>[id,1/(d+24)**4]),sum=values.reduce((n,v)=>n+v[1],0);weights=values.map(([id,w])=>[id,w/sum]);}
  const index=vertices.length;vertices.push({source:p,weights});lookup.set(key,index);return index;
 };
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  const n=y*cols+x;if(!(parseInt(mask[Math.floor(n/4)],16)&(8>>(n%4))))continue;
  const a=vertex(x,y),b=vertex(x+1,y),c=vertex(x,y+1),d=vertex(x+1,y+1);triangles.push([a,b,c],[b,d,c]);
 }
 const mesh=freeze({vertices,triangles});meshes.set(rig,mesh);return mesh;
}
// Only events and phases owned by this match can select a clip.
export function getXenoTrialsRigCueV154(rig,match,fighter,presentation=null){
 if(!XENO_TRIALS_RIGS_V154.includes(rig)||fighter?.id!==rig.fighterId||!match?.fighters?.includes(fighter))return null;
 const index=match.fighters.indexOf(fighter),T=XENO_TRIALS_RIG_TIMING_V154;
 if(match.phase==='active'&&presentation?.fighterSlot===index&&presentation.blocksSimulation)
  return{clip:'intro',progress:clamp(presentation.elapsedMs/(T.intro*1000)),elapsed:presentation.elapsedMs/1000};
 if(match.phase==='round-over'&&['player','opponent'].includes(match.roundWinner)){
  const elapsed=clamp(T.round-match.phaseTime,0,T.round);return{clip:match.roundWinner===fighter.side?'round-win':'round-loss',progress:elapsed/T.round,elapsed};
 }
 if(match.phase!=='active'||presentation?.blocksSimulation||fighter.hp<=0)return null;
 const hold=match.grappleV153;
 if(hold&&[hold.attacker,hold.target].includes(fighter.side)){
  const elapsed=Math.max(0,(match.tick-hold.bornTick)/120);
  const direction=Math.sign(hold.targetX-hold.attackerX);
  receptionContactsV158.set(match,{grappleId:hold.id,round:match.round,direction});
  return{clip:hold.escapeProgress>0?'struggle':'restraint',progress:clamp(hold.escapeProgress/XENO_TRIALS_GRAPPLE_V153.escapeTicks),elapsed,role:hold.attacker===fighter.side?'captor':'captive',grappleId:hold.id,
   contactDirectionV158:direction,facingV158:fighter.facing};
 }
 const startup=XENO_TRIALS_CASTES_V151.find(c=>c.fighterId===rig.fighterId)?.spec.startup;
 if(fighter.attack?.kind==='special'&&rig.fighterId==='prowler'&&fighter.attack.age<startup&&fighter.stun<=0)
  return{clip:'windup',progress:clamp(fighter.attack.age/startup),elapsed:fighter.attack.age};
 if(fighter.attack||fighter.y>0)return null;
 const end=[...(match.events||[])].reverse().find(e=>e.type==='grapple-end-v153'&&[e.side,e.attacker].includes(fighter.side));
 const roundStart=[...(match.events||[])].reverse().find(e=>e.type==='round-start');
 if(end&&(!roundStart||end.id>roundStart.id)&&match.tick>=end.tick&&(match.tick-end.tick)/120<T.release){
  const elapsed=(match.tick-end.tick)/120,start=[...(match.events||[])].reverse().find(e=>e.type==='grapple-start-v153'&&e.grappleId===end.grappleId&&e.tick<=end.tick);
  const contact=receptionContactsV158.get(match);
  return{clip:'release',progress:elapsed/T.release,elapsed,role:end.attacker===fighter.side?'captor':'captive',
   heldSeconds:start?(end.tick-start.tick)/120:XENO_TRIALS_GRAPPLE_V153.durationTicks/120,releaseFrom:end.reason==='escaped'?'struggle':'restraint',
   contactDirectionV158:contact?.grappleId===end.grappleId&&contact.round===match.round?contact.direction:undefined,facingV158:fighter.facing};
 }
 return null;
}
// Rigid bone transforms blend only the source mesh, never the simulation bodies.
export function sampleXenoTrialsRigV154(rig,cue,reducedMotion=false){
 if(!XENO_TRIALS_RIGS_V154.includes(rig)||!Object.hasOwn(rig.poses,cue?.clip)||!Number.isFinite(cue.progress)||!Number.isFinite(cue.elapsed)||cue.elapsed<0)return null;
 const p=clamp(cue.progress);let gain=1;
 if(cue.clip==='intro')gain=Math.sin(Math.PI*p)**2;
 else if(cue.clip==='windup')gain=Math.sin(Math.PI*p)**2;
 else if(cue.clip==='release')gain=1-smooth(p);
 else if(cue.clip.startsWith('round-'))gain=smooth(p/.3)*(1-smooth((p-.78)/.22));
 else gain=smooth(cue.elapsed/XENO_TRIALS_RIG_TIMING_V154.settle);
 if(reducedMotion)gain=0;
 const heldRelease=cue.clip==='release'&&rig.fighterId!=='prowler';
 if(heldRelease&&Number.isFinite(cue.heldSeconds))gain*=smooth(Math.max(0,cue.heldSeconds)/XENO_TRIALS_RIG_TIMING_V154.settle);
 const nativePose=heldRelease?rig.poses[cue.releaseFrom==='struggle'?'struggle':'restraint']:rig.poses[cue.clip];
 const angles={},matrices={};
 for(const bone of rig.bones){
  angles[bone.id]=(nativePose[bone.id]||0)*gain;
  if((cue.clip==='struggle'||heldRelease&&cue.releaseFrom==='struggle')&&!reducedMotion&&bone.id==='head')angles[bone.id]+=Math.sin((heldRelease?(Number.isFinite(cue.heldSeconds)?cue.heldSeconds:0):cue.elapsed)*12)*.7*gain;
  matrices[bone.id]=multiply(bone.parent?matrices[bone.parent]:identity(),rotation(angles[bone.id],bone.pivot));
 }
 const mesh=getXenoTrialsRigMeshV154(rig);
 const vertices=mesh.vertices.map(({source:[x,y],weights})=>weights.reduce((out,[id,w])=>{const p=point(matrices[id],x,y);out[0]+=p[0]*w;out[1]+=p[1]*w;return out;},[0,0]));
 const contacts=Object.fromEntries(Object.entries(rig.contacts).map(([name,a])=>[name,point(matrices[a.bone],...a.point)]));
 const frame={rigId:rig.id,clip:cue.clip,progress:p,angles,vertices,contacts,reducedMotion,canonExact:false,animation:rig.animation,active:gain>1e-6};
 const supported=sampleXenoTrialsRestraintPoseV156(rig,mesh,frame,cue,reducedMotion);
 return sampleXenoTrialsCaptureReceptionV158(rig,mesh,supported,cue,reducedMotion);
}
/** V155 presentation-only angle sampler. Exact native rigs and bounded angles;
 * support bones cannot rotate. It never accepts an unreviewed replacement rig. */
export function sampleXenoTrialsSequenceAnglesV155(rig, cue, keyedAngles, reducedMotion = false) {
 if (!XENO_TRIALS_RIGS_V154.includes(rig) || !cue || !Number.isFinite(cue.progress)
  || !Number.isFinite(cue.elapsed) || cue.elapsed < 0 || !keyedAngles || typeof keyedAngles !== 'object') return null;
 const allowed = new Set(rig.bones.map(b => b.id));
 if (Object.entries(keyedAngles).some(([key,value]) => !allowed.has(key) || !Number.isFinite(value)
  || Math.abs(value) > 8 || key === 'hips' && value !== 0)) return null;
 const angles = {}, matrices = {};
 for (const bone of rig.bones) {
  angles[bone.id] = reducedMotion ? 0 : keyedAngles[bone.id] || 0;
  matrices[bone.id] = multiply(bone.parent ? matrices[bone.parent] : identity(), rotation(angles[bone.id],bone.pivot));
 }
 const mesh = getXenoTrialsRigMeshV154(rig);
 const vertices = mesh.vertices.map(({source:[x,y],weights}) => weights.reduce((out,[id,w]) => {
  const p = point(matrices[id],x,y); out[0] += p[0]*w; out[1] += p[1]*w; return out;
 },[0,0]));
 const contacts = Object.fromEntries(Object.entries(rig.contacts).map(([name,a]) => [name,point(matrices[a.bone],...a.point)]));
 return {rigId:rig.id,clip:cue.clip,progress:clamp(cue.progress),angles,vertices,contacts,reducedMotion,
  canonExact:false,animation:'authored-native-sequence-v155',active:Object.values(angles).some(n=>Math.abs(n)>1e-6)};
}
/** Restrained, distance-driven steps for the separate V157 exit only. Native
 * plates do not contain a complete walk. The cage keeps the carried upper body
 * rigid and deforms the two lower supports with a small alternating clearance.
 * This is deliberately not registered as a combat locomotion animation. */
export function sampleXenoTrialsExitPoseV157(rig,view,metrics,reducedMotion=false) {
 if(!XENO_TRIALS_RIGS_V154.includes(rig)||reducedMotion||!view||view.rigId!==rig.id
  ||![view.distance,view.stride,view.footLift,metrics?.width,metrics?.height].every(Number.isFinite)
  ||view.distance<0||view.stride<=0||view.footLift<0||metrics.width<=0||metrics.height<=0)return null;
 const mesh=getXenoTrialsRigMeshV154(rig),sx=metrics.width/rig.sourceWidth,sy=metrics.height/rig.sourceHeight;
 const phase=view.distance/view.stride,envelope=smooth(view.distance/(view.stride*.2));
 const feet=[0,1].map(index=>{
  const q=(phase+(index===0?.3:.8))%1;
  const swing=q>=.6,u=swing?(q-.6)/.4:0;
  const x=(swing?-.3+.6*smooth(u):.3-q)*view.stride/sx*rig.sourceFacing;
  const y=swing?-(Math.sin(Math.PI*u)**2)*view.footLift/sy*envelope:0;
  return{x,y,stance:!swing,phase:q};
 });
 // Its forward claws remain a native support: lowering the whole Prowler's
 // upper band would push those static claws through the ground pivot.
 const human=rig.fighterId!=='prowler',bodyDrop=(human?1.5:0)/sy*envelope;
 const legs=[0,1].map(index=>{
  const hip=rig.bones.find(b=>b.id===`thigh${index}`).pivot;
  const anchor=rig.contacts[index===0?'footFar':'footNear'].point;
  return{hip,anchor,foot:feet[index]};
 });
 const legDelta=(p,l)=>{
  const top=human?(rig.fighterId==='dd-darwin-era-cultist'?820:l.hip[1]):650;
  const bottom=l.anchor[1]-20;
  const t=smooth((p[1]-top)/(bottom-top));
  return[l.foot.x*t,bodyDrop*(1-t)+l.foot.y*t];
 };
 const delta=p=>{
  const centers=legs.map(l=>{const t=clamp((p[1]-l.hip[1])/(l.anchor[1]-l.hip[1]));return l.hip[0]+(l.anchor[0]-l.hip[0])*t;});
  const t=clamp((p[0]-centers[0])/(centers[1]-centers[0]||1));
  const a=legDelta(p,legs[0]),b=legDelta(p,legs[1]);
  // The Prowler's head/forelimbs overlap its support height in the plate.
  // Its forward half remains rigid; only the two admitted rear supports step.
  const rear=human?1:1-smooth((p[0]-820)/100);
  // The cultist's low hanging carried weapon belongs to the upper-body band.
  const weapon=rig.fighterId==='dd-darwin-era-cultist'?(1-smooth((p[0]-300)/150))*(1-smooth((p[1]-1040)/160)):0;
  const gain=rear*(1-weapon);
  return[(a[0]*(1-t)+b[0]*t)*gain,(a[1]*(1-t)+b[1]*t)*gain+bodyDrop*(1-gain)];
 };
 const vertices=mesh.vertices.map(v=>{const d=delta(v.source);return v.source.map((n,i)=>n+d[i]);});
 // No folded triangles are ever drawn. Keep this failure visible to QA instead
 // of pretending a rigid translated portrait was a successful stepped mesh.
 if(mesh.triangles.some(ids=>xenoTrialsTriangleAreaV154(...ids.map(i=>vertices[i]))<xenoTrialsTriangleAreaV154(...ids.map(i=>mesh.vertices[i].source))*.2))return null;
 const contacts=Object.fromEntries(Object.entries(rig.contacts).map(([name,a])=>{
  const d=delta(a.point);return[name,a.point.map((n,i)=>n+d[i])];
 }));
 return{rigId:rig.id,clip:'spatial-exit-v157',progress:phase%1,angles:{},vertices,contacts,active:envelope>0,
  animation:'bounded-distance-steps-native-mesh-v157',canonExact:false,fullLocomotion:false,
  exitPoseV157:{distance:view.distance,bodyDrop:bodyDrop*sy,feet:feet.map((f,index)=>({name:index?'footNear':'footFar',...f})),
   stride:view.stride,footLift:view.footLift,fullLocomotion:false}};
}
export function xenoTrialsTriangleAreaV154(a,b,c){return((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))/2;}
/** The textured renderer applies one affine per native mesh triangle. Project a
 * source landmark through that same triangle for V157 support QA/receipts;
 * sampling only the intended cage/bone target would miss a mesh discrepancy. */
export function projectXenoTrialsMeshPointV157(rig,frame,source){
 const mesh=getXenoTrialsRigMeshV154(rig);
 if(!mesh||frame?.rigId!==rig.id||!Array.isArray(frame.vertices)||frame.vertices.length!==mesh.vertices.length
  ||!Array.isArray(source)||source.length!==2||!source.every(Number.isFinite))return null;
 for(const ids of mesh.triangles){
  const [a,b,c]=ids.map(i=>mesh.vertices[i].source),det=xenoTrialsTriangleAreaV154(a,b,c)*2;
  const wb=((source[0]-a[0])*(c[1]-a[1])-(source[1]-a[1])*(c[0]-a[0]))/det;
  const wc=((b[0]-a[0])*(source[1]-a[1])-(b[1]-a[1])*(source[0]-a[0]))/det,wa=1-wb-wc;
  if(Math.min(wa,wb,wc)<-1e-7)continue;
  const points=ids.map(i=>frame.vertices[i]);
  if(points.some(p=>!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)))return null;
  return[0,1].map(axis=>points[0][axis]*wa+points[1][axis]*wb+points[2][axis]*wc);
 }
 return null;
}
function affine(s,d){
 const[s0,s1,s2]=s,[d0,d1,d2]=d,ux=s1[0]-s0[0],uy=s1[1]-s0[1],vx=s2[0]-s0[0],vy=s2[1]-s0[1],det=ux*vy-uy*vx;
 if(Math.abs(det)<1e-8)return null;
 const ax=d1[0]-d0[0],ay=d1[1]-d0[1],bx=d2[0]-d0[0],by=d2[1]-d0[1];
 const a=(ax*vy-bx*uy)/det,b=(ay*vy-by*uy)/det,c=(bx*ux-ax*vx)/det,dv=(by*ux-ay*vx)/det;
 return[a,b,c,dv,d0[0]-a*s0[0]-c*s0[1],d0[1]-b*s0[0]-dv*s0[1]];
}
// Wrong images or inverted triangles fall back to the exact native pose.
export function drawXenoTrialsRigV154(ctx,rig,image,frame,metrics,x,y,facing){
 if(!frame?.active||!XENO_TRIALS_RIGS_V154.includes(rig)||frame.rigId!==rig.id||image?.complete===false
  ||(image?.naturalWidth??image?.width)!==rig.sourceWidth||(image?.naturalHeight??image?.height)!==rig.sourceHeight
  ||![x,y,metrics?.width,metrics?.height,metrics?.pivotX,metrics?.bottom].every(Number.isFinite)||metrics.width<=0||metrics.height<=0
  ||![-1,1].includes(facing)||typeof ctx?.clip!=='function'||typeof ctx?.transform!=='function')return null;
 const mesh=getXenoTrialsRigMeshV154(rig);
 if(!Array.isArray(frame.vertices)||frame.vertices.length!==mesh.vertices.length||frame.vertices.some(v=>!Array.isArray(v)||v.length!==2||!v.every(Number.isFinite)))return null;
 if(!frame.contacts||Object.keys(rig.contacts).some(k=>!Array.isArray(frame.contacts[k])||frame.contacts[k].length!==2||!frame.contacts[k].every(Number.isFinite)))return null;
 const lowered=frame.restraintPoseV156;
 if(lowered&&(!Number.isFinite(lowered.gain)||lowered.gain<0||lowered.gain>1||!Number.isFinite(lowered.sourceLowering)||lowered.sourceLowering<0
  ||['knees','hips'].some(key=>!Array.isArray(lowered[key])||lowered[key].length!==2||lowered[key].some(p=>!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)))))return null;
 const reception=frame.captureReceptionV158;
 if(reception&&(!Number.isFinite(reception.seconds)||reception.seconds<0||reception.seconds>.36
  ||!Number.isFinite(reception.releaseGain)||reception.releaseGain<0||reception.releaseGain>1
  ||['hips','knees','ankles'].some(key=>!Array.isArray(reception[key])||reception[key].length!==2||reception[key].some(p=>!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)))))return null;
 const draws=mesh.triangles.map(ids=>({s:ids.map(i=>mesh.vertices[i].source),d:ids.map(i=>frame.vertices[i])}));
 if(draws.some(({s,d})=>xenoTrialsTriangleAreaV154(...d)<xenoTrialsTriangleAreaV154(...s)*.2))return null;
 const sx=metrics.width/rig.sourceWidth,sy=metrics.height/rig.sourceHeight,flip=facing*rig.sourceFacing;
 const world=p=>[x+(p[0]-metrics.pivotX*rig.sourceWidth)*sx*flip,y+(p[1]-metrics.bottom*rig.sourceHeight)*sy];
 const drawable=resolveSpriteDrawableV134(image);
 ctx.save();ctx.translate(x,y);ctx.scale(sx*flip,sy);ctx.translate(-metrics.pivotX*rig.sourceWidth,-metrics.bottom*rig.sourceHeight);
 try{for(const{s,d}of draws){
  const m=affine(s,d),cx=(d[0][0]+d[1][0]+d[2][0])/3,cy=(d[0][1]+d[1][1]+d[2][1])/3;
  // Subpixel overlap removes antialias cracks while retaining native alpha.
  const inset=Math.min(2,.25/Math.max(sx,sy));
  const clip=d.map(p=>{const dx=p[0]-cx,dy=p[1]-cy,len=Math.hypot(dx,dy)||1;return[p[0]+dx/len*inset,p[1]+dy/len*inset];});
  ctx.save();try{ctx.beginPath();ctx.moveTo(...clip[0]);ctx.lineTo(...clip[1]);ctx.lineTo(...clip[2]);ctx.closePath();ctx.clip();ctx.transform(...m);ctx.drawImage(drawable,0,0);}finally{ctx.restore();}
 }}finally{ctx.restore();}
 return{rigId:rig.id,clip:frame.clip,progress:frame.progress,drawn:true,triangles:draws.length,sourcePath:rig.path,sourceSha256:rig.sourceSha256,
  contacts:Object.fromEntries(Object.entries(frame.contacts).map(([key,p])=>[key,world(p)])),animation:frame.animation,canonExact:false,
  ...(frame.restraintPoseV156?{restraintPoseV156:{...frame.restraintPoseV156,
   knees:frame.restraintPoseV156.knees.map(world),hips:frame.restraintPoseV156.hips.map(world)}}:{}),
  ...(reception?{captureReceptionV158:{...reception,hips:reception.hips.map(world),knees:reception.knees.map(world),ankles:reception.ankles.map(world)}}:{})};
}
