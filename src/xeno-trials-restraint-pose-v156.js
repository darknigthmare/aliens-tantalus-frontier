/** Original, bounded lowering of the three admitted native human plates.
 * A two-leg cage bends the painted knees without rotating a whole portrait.
 * The source does not expose the anatomy required for a prone/floor pin: this
 * remains a supported lowering, not a complete takedown or canonical capture.
 * Read-only source geometry; combat bodies and clocks are never accepted here.
 */
import { XENO_TRIALS_RIG_DATA_V154 } from './xeno-trials-rig-data-v154.js';
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
export const XENO_TRIALS_RESTRAINT_POSE_V156 = freeze({
 id: 'native-supported-lowering-v156', canonExact: false, fullFloorPin: false,
 animation: 'original-supported-lowering-native-mesh', settleSeconds: .24,
 targets: [
  {fighterId:'dd-darwin-era-cultist',profileId:'pose-v118-dd-darwin-era-cultist',lowering:72,armBandBottom:820,weaponFeather:[300,450]},
  {fighterId:'import-game-dd-wy-commando',profileId:'pose-v106-import-game-dd-wy-commando',lowering:124},
  {fighterId:'import-game-dd-guardian',profileId:'pose-v106-import-game-dd-guardian',lowering:150}
 ]
});
const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t*t*(3-2*t); };
const finitePoint = value => Array.isArray(value) && value.length === 2 && value.every(Number.isFinite);
const area = (a,b,c) => ((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))/2;
const distance = (a,b) => Math.hypot(a[0]-b[0],a[1]-b[1]);
function solveKnee(hip,knee,ankle,targetHip,forward) {
 const thigh=distance(hip,knee),shin=distance(knee,ankle),dx=ankle[0]-targetHip[0],dy=ankle[1]-targetHip[1],length=Math.hypot(dx,dy);
 if (!(length>0 && length<thigh+shin && length>Math.abs(thigh-shin))) return null;
 const along=(thigh*thigh-shin*shin+length*length)/(2*length),across=Math.sqrt(Math.max(0,thigh*thigh-along*along));
 return [targetHip[0]+dx/length*along+forward*dy/length*across,targetHip[1]+dy/length*along-forward*dx/length*across];
}
function sourceCage(rig,spec) {
 const shift=[rig.sourceFacing*spec.lowering*.12,spec.lowering],legs=[];
 for (const index of [0,1]) {
  const hip=rig.bones?.find(b=>b.id===`thigh${index}`)?.pivot,knee=rig.bones?.find(b=>b.id===`shin${index}`)?.pivot,ankle=rig.bones?.find(b=>b.id===`foot${index}`)?.pivot;
  if (![hip,knee,ankle].every(finitePoint) || !(hip[1]<knee[1] && knee[1]<ankle[1]-35)) return null;
  const targetHip=hip.map((v,i)=>v+shift[i]),targetKnee=solveKnee(hip,knee,ankle,targetHip,rig.sourceFacing);
  if (!targetKnee) return null;
  legs.push({hip,knee,ankle,targetHip,targetKnee});
 }
 const deltaForLeg = (p,leg) => {
  const upperBand=spec.armBandBottom||leg.hip[1];
  if (p[1]<=upperBand) return shift;
  // Preserve the complete painted sole/boot support band, not only one point.
  if (p[1]>=leg.ankle[1]-35) return [0,0];
  const kneeShift=leg.targetKnee.map((v,i)=>v-leg.knee[i]);
  const [top,bottom,a,b]=p[1]<leg.knee[1] ? [upperBand,leg.knee[1],shift,kneeShift] : [leg.knee[1],leg.ankle[1]-35,kneeShift,[0,0]];
  const t=clamp((p[1]-top)/(bottom-top));return a.map((v,i)=>v*(1-t)+b[i]*t);
 };
 const delta = p => {
  const centers=legs.map(l=>{const t=clamp((p[1]-l.hip[1])/(l.ankle[1]-l.hip[1]));return l.hip[0]+(l.ankle[0]-l.hip[0])*t;});
  if (!(centers[1]-centers[0]>0)) return null;
  const weight=clamp((p[0]-centers[0])/(centers[1]-centers[0])),a=deltaForLeg(p,legs[0]),b=deltaForLeg(p,legs[1]);
  const carry=spec.weaponFeather ? (1-smooth((p[0]-spec.weaponFeather[0])/(spec.weaponFeather[1]-spec.weaponFeather[0])))*(1-smooth((p[1]-1040)/160)) : 0;
  return a.map((v,i)=>(v*(1-weight)+b[i]*weight)*(1-carry)+shift[i]*carry);
 };
 return {shift,legs,delta};
}
/** Called only after V154 has admitted the exact native rig and base sample.
 * Invalid or folded candidate geometry retains the already validated base pose.
 */
export function sampleXenoTrialsRestraintPoseV156(rig,mesh,frame,cue,reducedMotion=false) {
 const spec=XENO_TRIALS_RESTRAINT_POSE_V156.targets.find(t=>t.fighterId===rig?.fighterId&&t.profileId===rig.profileId);
 if (!XENO_TRIALS_RIG_DATA_V154.includes(rig) || !spec || !['restraint','struggle','release'].includes(cue?.clip) || cue.role==='captor'
  || !frame || frame.rigId!==rig.id || !Array.isArray(mesh?.vertices) || !Array.isArray(mesh.triangles)
  || !Array.isArray(frame.vertices) || frame.vertices.length!==mesh.vertices.length
  || !Number.isFinite(cue.elapsed) || cue.elapsed<0 || !Number.isFinite(cue.progress)
  || ![-1,1].includes(rig.sourceFacing) || !frame.vertices.every(finitePoint)) return frame;
 // No new oscillation: reduced-motion restores the exact V154 native geometry.
 const entry=smooth(cue.elapsed/XENO_TRIALS_RESTRAINT_POSE_V156.settleSeconds);
 const prior=Number.isFinite(cue.heldSeconds)?smooth(Math.max(0,cue.heldSeconds)/XENO_TRIALS_RESTRAINT_POSE_V156.settleSeconds):1;
 const gain=reducedMotion ? 0 : cue.clip==='release' ? prior*(1-smooth(cue.progress)) : entry;
 if (!(gain>1e-6)) return frame;
 const cage=sourceCage(rig,spec);
 if (!cage || mesh.vertices.some(v=>!finitePoint(v.source))) return frame;
 const deltas=mesh.vertices.map(v=>cage.delta(v.source));
 if (!deltas.every(finitePoint)) return frame;
 const vertices=frame.vertices.map((p,index)=>p.map((v,axis)=>v+deltas[index][axis]*gain));
 if (mesh.triangles.some(ids=>!Array.isArray(ids)||ids.length!==3||ids.some(i=>!Number.isInteger(i)||!vertices[i])
  || area(...ids.map(i=>vertices[i]))<area(...ids.map(i=>mesh.vertices[i].source))*.2)) return frame;
 const contacts={};
 for (const [name,anchor] of Object.entries(rig.contacts||{})) {
  if (!finitePoint(frame.contacts?.[name]) || !finitePoint(anchor.point)) return frame;
  // Report the same deformation applied to the painted attachment, not a
  // desired IK point. Feet and the entire sole band remain untouched.
  const delta=name.startsWith('foot')?[0,0]:cage.delta(anchor.point);
  if (!finitePoint(delta)) return frame;
  contacts[name]=frame.contacts[name].map((v,axis)=>v+delta[axis]*gain);
 }
 return {...frame,vertices,contacts,active:true,animation:XENO_TRIALS_RESTRAINT_POSE_V156.animation,
  restraintPoseV156:{id:XENO_TRIALS_RESTRAINT_POSE_V156.id,stage:cue.clip==='release'?'rising':'lowering',
   gain,sourceLowering:cage.shift[1]*gain,fullFloorPin:false,canonExact:false,
   knees:cage.legs.map(l=>l.knee.map((v,axis)=>v+cage.delta(l.knee)[axis]*gain)),
   hips:cage.legs.map(l=>l.hip.map((v,axis)=>v+cage.delta(l.hip)[axis]*gain))}};
}
