import { getXenoTrialsFighterV96, getXenoTrialsArtV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsRigV154, getXenoTrialsRigMeshV154, drawXenoTrialsRigV154,
  projectXenoTrialsMeshPointV157, xenoTrialsTriangleAreaV154 } from './xeno-trials-rig-v154.js';

// Native painted plates, individually viewed in V180. No replacement creature,
// recolouring, raster edits, hitbox changes or claim of captured film motion.
// These short strides are bounded source-mesh adaptations, not full walk atlases.
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
const mod = value => ((value % 1) + 1) % 1;
const profiles = [
  { fighterId: 'runner', sourceWork: 'Alien 3 (1992)', stride: 68, lift: 17, radius: 74,
    chains: [
      { contact: 'footFar', points: [[743, 497], [651, 623], [448, 792]], phase: 0 },
      { contact: 'footNear', points: [[817, 532], [818, 692], [930, 779]], phase: .5 },
      { contact: 'handFar', points: [[1100, 490], [1158, 640], [1245, 792]], phase: .5 },
      { contact: 'handNear', points: [[1201, 492], [1268, 626], [1470, 755]], phase: 0 }
    ], attackAngles: { spine: -.3, head: -3.2 } },
  { fighterId: 'warrior', sourceWork: 'Aliens (1986)', stride: 62, lift: 18, radius: 76,
    chains: [
      { contact: 'footFar', points: [[1057, 548], [1005, 708], [851, 875], [879, 979]], phase: 0 },
      { contact: 'footNear', points: [[1121, 551], [1260, 697], [1167, 894], [1271, 968]], phase: .5 }
    ], attackAngles: { spine: -.7, head: -1.8, upper1: -5, fore1: 6.5, hand1: -2 } },
  { fighterId: 'prowler', sourceWork: 'Aliens: Fireteam Elite (2021)', stride: 64, lift: 16, radius: 76,
    chains: [
      { contact: 'footFar', points: [[555, 578], [463, 754], [305, 724], [185, 937]], phase: 0 },
      { contact: 'footNear', points: [[655, 611], [749, 720], [638, 750], [751, 941]], phase: .5 },
      { contact: 'handFar', points: [[1005, 579], [1151, 749], [1415, 907]], phase: .5 },
      { contact: 'handNear', points: [[914, 583], [877, 752], [1181, 916]], phase: 0 }
    ], attackAngles: { spine: -.45, head: -2, upper0: -2.5, fore0: 3.5, upper1: 3, fore1: -3 } },
  { fighterId: 'spitter', sourceWork: 'Aliens: Colonial Marines (2013)', stride: 54, lift: 15, radius: 73,
    chains: [
      { contact: 'footFar', points: [[842, 616], [890, 749], [661, 735], [610, 937]], phase: 0 },
      { contact: 'footNear', points: [[964, 641], [1020, 746], [998, 823], [1125, 937]], phase: .5 }
    ], attackAngles: { spine: -.25, head: -3.8 } },
  { fighterId: 'burster', sourceWork: 'Aliens: Fireteam Elite (2021)', stride: 60, lift: 16, radius: 72,
    chains: [
      { contact: 'footFar', points: [[862, 542], [741, 682], [475, 759], [552, 834]], phase: 0 },
      { contact: 'footNear', points: [[921, 574], [944, 690], [1000, 785], [1021, 796]], phase: .5 },
      { contact: 'handFar', points: [[1132, 528], [1186, 701], [1290, 869]], phase: .5 },
      { contact: 'handNear', points: [[1211, 540], [1320, 718], [1428, 784]], phase: 0 }
    ], attackAngles: { spine: -.2, head: -2.8 } }
];

export const XENO_TRIALS_SWARM_SPRITES_V180 = freeze(profiles.map(profile => {
  const fighter = getXenoTrialsFighterV96(profile.fighterId), art = getXenoTrialsArtV96(profile.fighterId);
  const rig = getXenoTrialsRigV154(fighter, art);
  return { ...profile, profileId: fighter.profileId, path: art.path, sourceSha256: rig.sourceSha256,
    sourceWidth: art.sourceWidth, sourceHeight: art.sourceHeight, sourceFacing: art.sourceFacing,
    evidence: 'native-source-pixel-chains-and-eight-authored-short-stride-poses', canonExact: false, fullLocomotion: false,
    sourceProvenance: art.provenance, referenceStatus: 'user-art-adaptation-not-film-or-source-game-motion',
    poses: Array.from({ length: 8 }, (_, phase) => ({ id: `swarm-v180-${profile.fighterId}-step-${phase}`, phase: phase / 8 })) };
}));

export function getXenoTrialsSwarmSpriteV180(fighterId) {
  return XENO_TRIALS_SWARM_SPRITES_V180.find(profile => profile.fighterId === fighterId) || null;
}

const identity = () => [1, 0, 0, 1, 0, 0];
const multiply = (a, b) => [a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
const point = (matrix, [x, y]) => [matrix[0]*x+matrix[2]*y+matrix[4],matrix[1]*x+matrix[3]*y+matrix[5]];
function rotation(degrees, [x, y]) { const angle=degrees*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle); return [c,s,-s,c,x-c*x+s*y,y-s*x-c*y]; }
function segment(point, a, b) {
  const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
  const t=clamp(((point[0]-a[0])*dx+(point[1]-a[1])*dy)/(length*length||1));
  return { t, length, distance: Math.hypot(point[0]-a[0]-dx*t,point[1]-a[1]-dy*t) };
}
const weights = new WeakMap();
function skinWeights(profile, rig) {
  if (weights.has(profile)) return weights.get(profile);
  const mesh=getXenoTrialsRigMeshV154(rig);
  const rows=mesh.vertices.map(vertex => profile.chains.map(chain => {
    const lengths=chain.points.slice(1).map((p,i)=>Math.hypot(p[0]-chain.points[i][0],p[1]-chain.points[i][1]));
    const total=lengths.reduce((n,value)=>n+value,0); let nearest=null,walked=0;
    chain.points.slice(1).forEach((p,i)=>{
      const hit=segment(vertex.source,chain.points[i],p);
      if (!nearest||hit.distance<nearest.distance) nearest={...hit,progress:(walked+hit.t*hit.length)/total};
      walked+=lengths[i];
    });
    return { influence: (1-smooth(nearest.distance/(profile.radius*1.75))) * smooth(nearest.progress), progress: nearest.progress };
  }));
  weights.set(profile,rows); return rows;
}
function footStep(profile, phase) {
  const q=mod(phase),swing=q>=.5,u=(q-.5)*2;
  return { x: profile.stride*(swing ? -.5+smooth(u) : .5-2*q),
    y: swing ? -profile.lift*Math.sin(Math.PI*u)**2 : 0, stance: !swing, phase:q };
}
function attackGain(attack, spec) {
  if (!attack || !['light','heavy','special','super'].includes(attack.kind) || !Number.isFinite(attack.age) || attack.age<0
    || ![spec?.startup,spec?.active,spec?.recovery].every(value=>Number.isFinite(value)&&value>0)) return null;
  const total=spec.startup+spec.active+spec.recovery;
  if (attack.age>=total) return null;
  const activePhase=(attack.age-spec.startup)/spec.active;
  const gain=attack.age<spec.startup ? -.35*Math.sin(Math.PI*attack.age/spec.startup)
    : attack.age<spec.startup+spec.active ? activePhase<.5?smooth(activePhase*2):1-.6*smooth((activePhase-.5)*2)
      : .4*(1-smooth((attack.age-spec.startup-spec.active)/spec.recovery));
  return { gain, progress:attack.age/total, phase:attack.age<spec.startup?'windup':attack.age<spec.startup+spec.active?'contact':'recovery' };
}

/** Observer state is isolated from fighters and from all saves. Repeated draws
 * at one timestamp are stable; teleports/round resets do not create giant steps. */
export function createXenoTrialsSwarmMotionV180() {
  const previous=new WeakMap();
  return (fighter,timeSeconds) => {
    if (!fighter||!Number.isFinite(fighter.x)||!Number.isFinite(timeSeconds)) return { distance:0,moving:false,gain:0 };
    const old=previous.get(fighter);
    if (old&&old.time===timeSeconds) return old.view;
    const elapsed=old?timeSeconds-old.time:0,delta=old?fighter.x-old.x:0;
    const valid=old&&elapsed>0&&elapsed<=.3&&Math.abs(delta)<120;
    const moving=Boolean(valid&&Math.abs(delta)>.01&&fighter.hp>0&&fighter.y===0&&!fighter.attack&&!fighter.guard&&fighter.stun<=0);
    const gain=valid?clamp((old.view.gain||0)+(moving?1:-1)*elapsed/.12):0;
    const view={distance:valid?old.view.distance+delta:0,moving,gain};
    previous.set(fighter,{x:fighter.x,time:timeSeconds,view});return view;
  };
}

/** Pure texture pose. Native combat timing chooses the strike; observed world
 * displacement chooses the gait. The function never changes the actor. */
export function sampleXenoTrialsSwarmSpriteV180(fighter, art, options = {}) {
  const definition=getXenoTrialsFighterV96(fighter?.id),profile=getXenoTrialsSwarmSpriteV180(fighter?.id);
  const rig=profile&&getXenoTrialsRigV154(definition,art);
  if (!rig||fighter?.hp<=0||fighter?.y>0||fighter?.stun>0||fighter?.guard||options.reducedMotion||options.blocked
    || !Number.isFinite(options.metrics?.width)||options.metrics.width<=0) return null;
  const strike=attackGain(fighter.attack,options.spec);
  if (fighter.attack&&!strike) return null;
  const gaitGain=clamp(options.gain ?? (options.moving?1:0));
  if (!strike&&gaitGain<=0) return null;
  const mesh=getXenoTrialsRigMeshV154(rig),scale=options.metrics.width/rig.sourceWidth;
  const distance=Number.isFinite(options.distance)?options.distance:0;
  const phase=mod(distance/(profile.stride*scale*2));
  const feet=profile.chains.map(chain=>footStep(profile,phase+chain.phase));
  const rows=skinWeights(profile,rig),matrices={},angles={};
  for(const bone of rig.bones){
    angles[bone.id]=(profile.attackAngles[bone.id]||0)*(strike?.gain||0);
    matrices[bone.id]=multiply(bone.parent?matrices[bone.parent]:identity(),rotation(angles[bone.id],bone.pivot));
  }
  const vertices=mesh.vertices.map((vertex,index)=>{
    const base=vertex.weights.reduce((out,[bone,weight])=>{const transformed=point(matrices[bone],vertex.source);return [out[0]+transformed[0]*weight,out[1]+transformed[1]*weight];},[0,0]);
    if(strike)return base;
    const sum=rows[index].reduce((total,row)=>total+row.influence,0),denominator=Math.max(1,sum);
    return [base[0]+rows[index].reduce((delta,row,i)=>delta+feet[i].x*row.influence/denominator,0)*gaitGain,
      base[1]+rows[index].reduce((delta,row,i)=>delta+feet[i].y*row.influence/denominator,0)*gaitGain];
  });
  if(mesh.triangles.some(ids=>xenoTrialsTriangleAreaV154(...ids.map(index=>vertices[index]))<xenoTrialsTriangleAreaV154(...ids.map(index=>mesh.vertices[index].source))*.2))return null;
  const frame={rigId:rig.id,clip:strike?`swarm-${fighter.attack.kind}-v180`:'swarm-short-stride-v180',progress:strike?.progress??phase,
    angles,vertices,contacts:{},active:true,animation:'authored-native-short-strides-and-engine-timed-strikes-v180',canonExact:false,fullLocomotion:false,
    swarmV180:{fighterId:fighter.id,poseIndex:Math.floor(phase*8),phase,distance,gain:gaitGain,action:strike?fighter.attack.kind:'move',
      attackPhase:strike?.phase??null,fullLocomotion:false,feet:profile.chains.map((chain,index)=>({name:chain.contact,...feet[index]}))}};
  for(const [name,anchor] of Object.entries(rig.contacts)){
    const displayed=projectXenoTrialsMeshPointV157(rig,frame,anchor.point);
    if(!displayed)return null;frame.contacts[name]=displayed;
  }
  return frame;
}

export function drawXenoTrialsSwarmSpriteV180(ctx,fighter,art,image,options={}) {
  const frame=sampleXenoTrialsSwarmSpriteV180(fighter,art,options);
  if(!frame)return null;
  const rig=getXenoTrialsRigV154(getXenoTrialsFighterV96(fighter.id),art);
  const drawn=drawXenoTrialsRigV154(ctx,rig,image,frame,options.metrics,options.x??fighter.x,options.y??450-fighter.y,options.facing??fighter.facing);
  return drawn?{...drawn,swarmV180:frame.swarmV180,fullLocomotion:false}:null;
}
