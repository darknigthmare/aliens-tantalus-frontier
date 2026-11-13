import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsRigV154, getXenoTrialsRigMeshV154, drawXenoTrialsRigV154,
  projectXenoTrialsMeshPointV157, xenoTrialsTriangleAreaV154 } from './xeno-trials-rig-v154.js';

// Forty authored states use the five individually measured native plates. A KO
// is a supported articulated collapse, not a newly invented prone silhouette.
// Native pixels/alpha, authoritative controls, HP and collision never change.
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t*t*(3-2*t); };
export const XENO_TRIALS_REACTION_LIMITS_V186 = freeze({ ghostSeconds:.65,ghostLimit:16,collapseSeconds:.45,guardSettleSeconds:.1 });
const states = ['guard','hurt','guard-break','recover','ko','heavy-windup','heavy-contact','heavy-recovery'];
const definitions = [
  { fighterId:'runner',sourceWork:'Alien 3 (1992)',drop:94,supports:['footFar','footNear','handFar','handNear'],
    guard:{spine:.6,head:3.6},hurt:{spine:-1.5,head:-5.3},break:{spine:1.1,head:5},ko:{spine:1,head:3.5},
    windup:{spine:-1,head:-5.5},contact:{spine:1.3,head:6.5} },
  { fighterId:'warrior',sourceWork:'Aliens (1986)',drop:158,supports:['footFar','footNear'],
    guard:{spine:1.6,head:3,upper0:-9,fore0:-7,upper1:9,fore1:-13},
    hurt:{spine:-2.4,head:-5,upper0:3,fore0:2,upper1:-3,fore1:3},
    break:{spine:3,head:6,upper0:4,fore0:5,upper1:-4,fore1:-5},ko:{spine:5,head:8,upper0:5,fore0:7,upper1:-6,fore1:5},
    windup:{spine:-2.1,head:-3,upper1:-11,fore1:10,upper0:3},contact:{spine:2.4,head:2,upper1:13,fore1:-12,hand1:4,upper0:-4} },
  { fighterId:'prowler',sourceWork:'Aliens: Fireteam Elite (2021)',drop:108,supports:['footFar','footNear','handFar','handNear'],
    guard:{spine:.8,head:3.2,upper0:-2,fore0:4,upper1:2,fore1:-3},
    hurt:{spine:-1.3,head:-4.5,upper0:2,fore0:-2,upper1:-2,fore1:3},
    break:{spine:1.8,head:5,upper0:-2,fore0:3,upper1:2,fore1:-3},ko:{spine:1.6,head:3.5,upper0:-3,fore0:5,upper1:3,fore1:-4},
    windup:{spine:-1.4,head:-4,upper0:-3,fore0:5,upper1:4,fore1:-4},contact:{spine:1.5,head:5,upper0:4,fore0:-5,upper1:-4,fore1:5} },
  { fighterId:'spitter',sourceWork:'Aliens: Colonial Marines (2013)',drop:120,supports:['footFar','footNear'],
    guard:{spine:.7,head:4.1},hurt:{spine:-1.7,head:-5.8},break:{spine:1.5,head:5.6},ko:{spine:1.5,head:4},
    windup:{spine:-1,head:-6},contact:{spine:1.5,head:6.4} },
  { fighterId:'burster',sourceWork:'Aliens: Fireteam Elite (2021)',drop:89,supports:['footFar','footNear','handFar','handNear'],
    guard:{spine:.6,head:3.4},hurt:{spine:-1.4,head:-5},break:{spine:1.4,head:5.2},ko:{spine:2.6,head:7.5},
    windup:{spine:-1,head:-5.2},contact:{spine:1.4,head:6} }
];
export const XENO_TRIALS_REACTIONS_V186 = freeze(definitions.map(definition=>{
  const art=getXenoTrialsArtV96(definition.fighterId),rig=getXenoTrialsRigV154(getXenoTrialsFighterV96(definition.fighterId),art);
  return {...definition,profileId:art.id,path:art.path,sourceSha256:rig.sourceSha256,sourceFacing:art.sourceFacing,
    sourceWidth:art.sourceWidth,sourceHeight:art.sourceHeight,sourceProvenance:art.provenance,canonExact:false,fullProne:false,
    states:states.map(state=>({id:`reaction-v186-${definition.fighterId}-${state}`,state}))};
}));
export const getXenoTrialsReactionProfileV186 = id => XENO_TRIALS_REACTIONS_V186.find(profile=>profile.fighterId===id)||null;
const identity=()=>[1,0,0,1,0,0];
const multiply=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
const point=(m,[x,y])=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]];
const rotation=(degrees,[x,y])=>{const a=degrees*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return[c,s,-s,c,x-c*x+s*y,y-s*x-c*y];};

function authoredPose(profile,cue){
  const p=clamp(cue.progress),gain=Number.isFinite(cue.gain)?clamp(cue.gain):1;
  if(cue.state==='guard')return{angles:profile.guard,gain:gain*smooth(p),drop:profile.drop*.1};
  if(cue.state==='hurt')return{angles:profile.hurt,gain:gain*Math.sin(Math.PI*p),drop:profile.drop*.12};
  if(cue.state==='guard-break')return{angles:profile.break,gain:gain*smooth(p),drop:profile.drop*.6};
  if(cue.state==='recover')return{angles:profile.break,gain:gain*(1-smooth(p)),drop:profile.drop*.6};
  if(cue.state==='ko')return{angles:profile.ko,gain:gain*smooth(p),drop:profile.drop};
  if(cue.state==='heavy-windup')return{angles:profile.windup,gain:gain*smooth(p),drop:profile.drop*.04};
  if(cue.state==='heavy-contact')return{angles:profile.contact,from:profile.windup,mix:smooth(p),gain,drop:profile.drop*(.04+.04*smooth(p))};
  if(cue.state==='heavy-recovery')return{angles:profile.contact,gain:gain*(1-smooth(p)),drop:profile.drop*.08};
  return null;
}

/** Exact rig admission and native texture only. The lower support band remains
 * rigid while knees/shoulders/head change independently above it. */
export function sampleXenoTrialsReactionV186(fighter,art,cue,options={}){
  const profile=getXenoTrialsReactionProfileV186(fighter?.id),rig=profile&&getXenoTrialsRigV154(getXenoTrialsFighterV96(fighter.id),art);
  if(!rig||!cue||!states.includes(cue.state)||!Number.isFinite(cue.progress)||cue.progress<0||cue.progress>1||options.blocked||fighter.y>0)return null;
  const pose=authoredPose(profile,cue);
  if(!pose)return null;
  // Reduced motion keeps a single exact source pose; caller may still fade a
  // defeated ghost. No articulated oscillation or autonomous animation clock.
  const gain=options.reducedMotion?0:pose.gain;
  const mesh=getXenoTrialsRigMeshV154(rig),matrices={},angles={};
  for(const bone of rig.bones){
    const target=pose.angles[bone.id]||0,from=pose.from?.[bone.id]||0;
    angles[bone.id]=(pose.from?from*(1-pose.mix)+target*pose.mix:target)*gain;
    matrices[bone.id]=multiply(bone.parent?matrices[bone.parent]:identity(),rotation(angles[bone.id],bone.pivot));
  }
  const floorBand=Math.floor((Math.min(...profile.supports.map(name=>rig.contacts[name].point[1]))-1)/rig.mesh.cell)*rig.mesh.cell;
  const hip=rig.bones.find(bone=>bone.id==='hips').pivot;
  const vertices=mesh.vertices.map(vertex=>{
    const [x,y]=vertex.source;
    // Full sole/claw bands, including their affine mesh boundary, stay fixed.
    const support=smooth((floorBand-y)/Math.max(340,profile.drop*3));
    const body=smooth((x-hip[0]+240)/270);
    const upper=vertex.weights.reduce((out,[bone,weight])=>{const p=point(matrices[bone],vertex.source);return[out[0]+p[0]*weight,out[1]+p[1]*weight];},[0,0]);
    return[x+(upper[0]-x)*support,y+(upper[1]-y)*support+pose.drop*gain*support*body];
  });
  if(mesh.triangles.some(ids=>xenoTrialsTriangleAreaV154(...ids.map(index=>vertices[index]))<xenoTrialsTriangleAreaV154(...ids.map(index=>mesh.vertices[index].source))*.2))return null;
  const frame={rigId:rig.id,clip:`reaction-${cue.state}-v186`,progress:cue.progress,angles,vertices,contacts:{},active:true,
    animation:'authored-native-supported-reaction-v186',canonExact:false,fullProne:false,
    reactionV186:{id:`reaction-v186-${fighter.id}-${cue.state}`,state:cue.state,progress:cue.progress,sourceSha256:profile.sourceSha256,
      reducedMotion:options.reducedMotion===true,fullProne:false,supports:[...profile.supports]}};
  for(const[name,anchor]of Object.entries(rig.contacts)){
    const p=projectXenoTrialsMeshPointV157(rig,frame,anchor.point);if(!p)return null;frame.contacts[name]=p;
  }
  return frame;
}

export function drawXenoTrialsReactionV186(ctx,fighter,art,image,options={}){
  const frame=sampleXenoTrialsReactionV186(fighter,art,options.cue,options);
  if(!frame)return null;
  const rig=getXenoTrialsRigV154(getXenoTrialsFighterV96(fighter.id),art);
  const drawn=drawXenoTrialsRigV154(ctx,rig,image,frame,options.metrics,options.x??fighter.x,options.y??450-fighter.y,options.facing??fighter.facing);
  return drawn?{...drawn,reactionV186:frame.reactionV186}:null;
}

const validTick=match=>Number.isInteger(match?.tick)&&match.tick>=0;
const visualCopy=fighter=>({id:fighter.id,variant:fighter.variant,x:fighter.x,y:fighter.y,facing:fighter.facing,side:fighter.side,
  instanceIdV180:fighter.instanceIdV180,hp:0,stun:0,guard:false,attack:null,hitFlash:0});

/** All history/ghosts are presentation-only and disappear on a new match,
 * rewound tick, new round or clear(). Call refresh before drawing the frame. */
export function createXenoTrialsReactionObserverV186(){
  let owner=null,lastTick=-1,round=null,lastKills=0,actors=new WeakMap(),seen=new Map(),ghosts=[];
  const clear=()=>{owner=null;lastTick=-1;round=null;lastKills=0;actors=new WeakMap();seen.clear();ghosts=[];};
  const key=fighter=>fighter.instanceIdV180||fighter.side;
  function refresh(match){
    if(!validTick(match)){clear();return;}
    if(owner!==match||round!==match.round||match.tick<lastTick){clear();owner=match;round=match.round;lastKills=match.hordeV180?.totalKills||0;}
    if(match.tick===lastTick)return;
    const current=new Map((match.fighters||[]).map(fighter=>[key(fighter),fighter]));
    const kills=match.hordeV180?.totalKills||0;
    let remaining=Math.max(0,kills-lastKills);
    if(match.hordeV180&&['active','match-over'].includes(match.phase)&&remaining>0){
      for(const[id,old]of seen){
        if(remaining<=0)break;
        if(!current.has(id)&&old.side==='opponent'&&getXenoTrialsReactionProfileV186(old.id)){
          ghosts.push({fighter:visualCopy(old),bornTick:match.tick});remaining--;
        }
      }
    }
    ghosts=ghosts.filter(ghost=>match.tick-ghost.bornTick<XENO_TRIALS_REACTION_LIMITS_V186.ghostSeconds*120).slice(-XENO_TRIALS_REACTION_LIMITS_V186.ghostLimit);
    seen=new Map([...current].filter(([,fighter])=>fighter.hp>0).map(([id,fighter])=>[id,{...visualCopy(fighter),hp:fighter.hp}]));
    lastTick=match.tick;lastKills=kills;
  }
  function observe(match,fighter,options={}){
    refresh(match);
    if(!validTick(match)||!getXenoTrialsReactionProfileV186(fighter?.id)||options.blocked)return null;
    const tick=match.tick,old=actors.get(fighter),record=old||{hp:fighter.hp,guard:false,stun:0,koTick:null,hurtTick:null,breakTick:null,guardTick:tick};
    if(old?.tick===tick)return old.cue;
    if(fighter.guard&&!record.guard)record.guardTick=tick;
    if(!fighter.guard&&record.guard)record.guardReleaseTick=tick;
    if(fighter.hp<=0&&record.koTick===null)record.koTick=record.hp>0?tick:tick-54;
    if(fighter.hp>0)record.koTick=null;
    if(fighter.hp<record.hp&&fighter.hp>0||fighter.hitFlash>0&&!(record.hitFlash>0))record.hurtTick=tick;
    if(fighter.guardBrokenV147&&fighter.stun>0&&!record.broken)record.breakTick=tick;
    let cue=null;
    if(fighter.hp<=0)cue={state:'ko',progress:clamp((tick-record.koTick)/54)};
    else if(fighter.guardBrokenV147&&fighter.stun>0){
      const elapsed=(tick-(record.breakTick??tick))/120;
      cue=elapsed<.28?{state:'guard-break',progress:clamp(elapsed/.28)}:{state:'recover',progress:clamp((elapsed-.28)/.44)};
    }else if(record.hurtTick!==null&&tick-record.hurtTick<36)cue={state:'hurt',progress:clamp((tick-record.hurtTick)/36)};
    else if(fighter.guard)cue={state:'guard',progress:clamp((tick-record.guardTick)/12)};
    else if(fighter.attack?.kind==='heavy'){
      const spec=options.spec,age=fighter.attack.age;
      if([spec?.startup,spec?.active,spec?.recovery,age].every(Number.isFinite)&&spec.startup>0&&spec.active>0&&spec.recovery>0&&age>=0){
        if(age<spec.startup)cue={state:'heavy-windup',progress:age/spec.startup};
        else if(age<spec.startup+spec.active)cue={state:'heavy-contact',progress:(age-spec.startup)/spec.active};
        else if(age<spec.startup+spec.active+spec.recovery)cue={state:'heavy-recovery',progress:(age-spec.startup-spec.active)/spec.recovery};
      }
    }
    if(!cue&&Number.isInteger(record.guardReleaseTick)&&tick-record.guardReleaseTick<12)
      cue={state:'guard',progress:1,gain:1-smooth((tick-record.guardReleaseTick)/12)};
    Object.assign(record,{hp:fighter.hp,guard:fighter.guard,hitFlash:fighter.hitFlash,broken:fighter.guardBrokenV147===true,tick,cue});
    actors.set(fighter,record);return cue;
  }
  observe.refresh=refresh;
  observe.clear=clear;
  observe.getDefeated=match=>{
    refresh(match);
    return ghosts.map(ghost=>{const elapsed=(match.tick-ghost.bornTick)/120;
      return{fighter:{...ghost.fighter},cue:{state:'ko',progress:clamp(elapsed/.45)},opacity:1-smooth((elapsed-.45)/.2),bornTick:ghost.bornTick};});
  };
  return observe;
}
