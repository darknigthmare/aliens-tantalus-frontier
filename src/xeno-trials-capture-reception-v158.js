/** Three original reception clips on the exact native V154 human plates.
 * This read-only deformation adds weight absorption before V156's supported
 * hold. It does not contain a prone body, complete pin, canonical choreography,
 * new attack window or simulated landing. No source pixel is replaced.
 */
import { XENO_TRIALS_RIG_DATA_V154 } from './xeno-trials-rig-data-v154.js';
import { getXenoTrialsRenderMetricsV110 } from './xeno-trials-scale-v110.js';
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
export const XENO_TRIALS_CAPTURE_RECEPTION_V158=freeze({
 id:'native-capture-receptions-v158',duration:.36,canonExact:false,fullFloorPin:false,
 phases:[{id:'prise',start:0,end:.055},{id:'absorption',start:.055,end:.14},{id:'appuis',start:.14,end:.24},{id:'raccord',start:.24,end:.36}],
 targets:[
  {fighterId:'dd-darwin-era-cultist',profileId:'pose-v118-dd-darwin-era-cultist',taskId:'ART153-24',recoil:3.5,lowering:2.1,lean:1.2,rigidBottom:840,weaponFeather:[300,450]},
  {fighterId:'import-game-dd-wy-commando',profileId:'pose-v106-import-game-dd-wy-commando',taskId:'ART153-10',recoil:4.2,lowering:2.2,lean:.95,rigidBottom:760},
  {fighterId:'import-game-dd-guardian',profileId:'pose-v106-import-game-dd-guardian',taskId:'ART153-17',recoil:2.8,lowering:2.8,lean:.7,rigidBottom:820}
 ]
});
const clamp=n=>Math.max(0,Math.min(1,n));
const smooth=n=>{const t=clamp(n);return t*t*(3-2*t);};
const smoother=n=>{const t=clamp(n);return t*t*t*(t*(t*6-15)+10);};
const point=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite);
const area=(a,b,c)=>((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]));
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
// Native triangle projection is also used for joint/contact measurements. The
// model never reports an intended IK target as a contact the skin did not draw.
function project(mesh,vertices,p){
 for(const ids of mesh.triangles){
  const [a,b,c]=ids.map(i=>mesh.vertices[i].source),det=area(a,b,c);
  const wb=((p[0]-a[0])*(c[1]-a[1])-(p[1]-a[1])*(c[0]-a[0]))/det;
  const wc=((b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]))/det,wa=1-wb-wc;
  if(Math.min(wa,wb,wc)<-1e-7)continue;
  return[0,1].map(axis=>vertices[ids[0]][axis]*wa+vertices[ids[1]][axis]*wb+vertices[ids[2]][axis]*wc);
 }
 return null;
}
function solveKnee(hip,knee,ankle,targetHip){
 const thigh=distance(hip,knee),shin=distance(knee,ankle),dx=ankle[0]-targetHip[0],dy=ankle[1]-targetHip[1],length=Math.hypot(dx,dy);
 if(!(length>Math.abs(thigh-shin)+1e-5&&length<thigh+shin-1e-5))return null;
 const along=(thigh*thigh-shin*shin+length*length)/(2*length),across=Math.sqrt(Math.max(0,thigh*thigh-along*along));
 const choices=[-1,1].map(sign=>[targetHip[0]+dx/length*along+sign*dy/length*across,targetHip[1]+dy/length*along-sign*dx/length*across]);
 return choices.sort((a,b)=>distance(a,knee)-distance(b,knee))[0];
}
const keys=[{at:0,recoil:0,lowering:0,lean:0},{at:.055,recoil:.7,lowering:.45,lean:.7},
 {at:.14,recoil:1,lowering:1,lean:1},{at:.24,recoil:.55,lowering:.65,lean:.3},{at:.36,recoil:0,lowering:0,lean:0}];
function sampleKeys(seconds){
 const right=keys.findIndex(k=>k.at>=seconds),b=keys[Math.max(1,right)],a=keys[Math.max(0,right-1)],t=smoother((seconds-a.at)/(b.at-a.at));
 return Object.fromEntries(['recoil','lowering','lean'].map(key=>[key,a[key]*(1-t)+b[key]*t]));
}
export function sampleXenoTrialsCaptureReceptionV158(rig,mesh,frame,cue,reducedMotion=false){
 const config=XENO_TRIALS_CAPTURE_RECEPTION_V158,spec=config.targets.find(t=>t.fighterId===rig?.fighterId&&t.profileId===rig.profileId);
 if(!XENO_TRIALS_RIG_DATA_V154.includes(rig)||!spec||reducedMotion||cue?.role!=='captive'
  ||!['restraint','struggle','release'].includes(cue.clip)||![-1,1].includes(cue.contactDirectionV158)||![-1,1].includes(cue.facingV158)
  ||!Number.isFinite(cue.elapsed)||cue.elapsed<0||!Number.isFinite(cue.progress)||!Array.isArray(mesh?.vertices)||!Array.isArray(mesh?.triangles)
  ||frame?.rigId!==rig.id||!Array.isArray(frame.vertices)||frame.vertices.length!==mesh.vertices.length||!frame.vertices.every(point)
  ||mesh.vertices.some(v=>!point(v?.source))||mesh.triangles.some(ids=>!Array.isArray(ids)||ids.length!==3||ids.some(i=>!Number.isInteger(i)||!mesh.vertices[i]))
  ||!frame.contacts||Object.keys(rig.contacts).some(name=>!point(frame.contacts[name])))return frame;
 const seconds=cue.clip==='release'?cue.heldSeconds:cue.elapsed;
 if(!Number.isFinite(seconds)||seconds<=0||seconds>=config.duration)return frame;
 const releaseGain=cue.clip==='release'?1-smooth(cue.progress):1;
 if(releaseGain<=1e-7)return frame;
 const keyed=sampleKeys(seconds),metrics=getXenoTrialsRenderMetricsV110(rig.fighterId),sx=metrics.width/rig.sourceWidth,sy=metrics.height/rig.sourceHeight;
 const flip=cue.facingV158*rig.sourceFacing,localDirection=cue.contactDirectionV158*flip;
 const shift=[localDirection*spec.recoil*keyed.recoil*releaseGain/sx,spec.lowering*keyed.lowering*releaseGain/sy];
 const radians=localDirection*spec.lean*keyed.lean*releaseGain*Math.PI/180,c=Math.cos(radians),s=Math.sin(radians);
 const pivot=project(mesh,frame.vertices,rig.bones.find(b=>b.id==='hips').pivot);
 if(!pivot)return frame;
 const upper=p=>[pivot[0]+c*(p[0]-pivot[0])-s*(p[1]-pivot[1])+shift[0],pivot[1]+s*(p[0]-pivot[0])+c*(p[1]-pivot[1])+shift[1]];
 const legs=[0,1].map(index=>{
  const sources=['thigh','shin','foot'].map(name=>rig.bones.find(b=>b.id===name+index)?.pivot);
  if(!sources.every(point))return null;
  const [hip,knee,ankle]=sources.map(p=>project(mesh,frame.vertices,p));
  if(![hip,knee,ankle].every(point))return null;
  const targetHip=upper(hip),targetKnee=solveKnee(hip,knee,ankle,targetHip);
  return targetKnee?{sources,hip,knee,ankle,targetHip,targetKnee}:null;
 });
 if(legs.some(leg=>!leg))return frame;
 const legDelta=(source,p,leg)=>{
  if(source[1]<=spec.rigidBottom){const target=upper(p);return target.map((v,i)=>v-p[i]);}
  if(source[1]>=leg.sources[2][1]-35)return[0,0];
  const hipShift=leg.targetHip.map((v,i)=>v-leg.hip[i]),kneeShift=leg.targetKnee.map((v,i)=>v-leg.knee[i]);
  const [top,bottom,a,b]=source[1]<leg.sources[1][1]?[spec.rigidBottom,leg.sources[1][1],hipShift,kneeShift]:[leg.sources[1][1],leg.sources[2][1]-35,kneeShift,[0,0]];
  const t=clamp((source[1]-top)/(bottom-top));return a.map((v,i)=>v*(1-t)+b[i]*t);
 };
 const delta=(source,p)=>{
  const centers=legs.map(l=>{const t=clamp((source[1]-l.sources[0][1])/(l.sources[2][1]-l.sources[0][1]));return l.sources[0][0]+(l.sources[2][0]-l.sources[0][0])*t;});
  const weight=clamp((source[0]-centers[0])/(centers[1]-centers[0])),a=legDelta(source,p,legs[0]),b=legDelta(source,p,legs[1]);
  const carry=spec.weaponFeather?(1-smooth((source[0]-spec.weaponFeather[0])/(spec.weaponFeather[1]-spec.weaponFeather[0])))*(1-smooth((source[1]-1040)/160)):0;
  const target=upper(p),upperDelta=target.map((v,i)=>v-p[i]);
  return a.map((v,i)=>(v*(1-weight)+b[i]*weight)*(1-carry)+upperDelta[i]*carry);
 };
 const vertices=frame.vertices.map((p,index)=>{const d=delta(mesh.vertices[index].source,p);return p.map((v,i)=>v+d[i]);});
 if(!vertices.every(point)||mesh.triangles.some(ids=>area(...ids.map(i=>vertices[i]))<area(...ids.map(i=>mesh.vertices[i].source))*.2))return frame;
 const contacts={};
 for(const[name,anchor]of Object.entries(rig.contacts)){
  const projected=project(mesh,vertices,anchor.point);if(!projected)return frame;contacts[name]=projected;
 }
 const phase=config.phases.find(phase=>seconds<phase.end)?.id||'raccord';
 return{...frame,vertices,contacts,active:true,animation:'original-native-capture-reception-v158',
  captureReceptionV158:{id:config.id,taskId:spec.taskId,phase,seconds,releaseGain,contactDirection:cue.contactDirectionV158,
   worldRecoil:spec.recoil*keyed.recoil*releaseGain,worldLowering:spec.lowering*keyed.lowering*releaseGain,
   leanDegrees:spec.lean*keyed.lean*releaseGain,canonExact:false,fullFloorPin:false,
   hips:legs.map(l=>project(mesh,vertices,l.sources[0])),knees:legs.map(l=>project(mesh,vertices,l.sources[1])),
   ankles:legs.map(l=>project(mesh,vertices,l.sources[2]))}};
}
