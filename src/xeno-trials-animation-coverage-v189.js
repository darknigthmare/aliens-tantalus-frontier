import {XENO_TRIALS_FIGHTERS_V96 as FIGHTERS,getXenoTrialsFighterV96,getXenoTrialsArtV96} from './xeno-trials-data-v96.js';
import {getXenoTrialsSpriteAtlasV188} from './xeno-trials-sprite-atlas-v188.js';
import {getXenoTrialsSpriteAtlasV189} from './xeno-trials-sprite-atlas-v189.js';
import {getXenoTrialsRigV154} from './xeno-trials-rig-v154.js';
import {getXenoTrialsSwarmSpriteV180} from './xeno-trials-swarm-sprites-v180.js';
import {getXenoTrialsReactionProfileV186} from './xeno-trials-reactions-v186.js';
import {getEnemyImportAnimationV107} from './enemy-import-animation-v107.js';
import {getEnemyImportAttackV109} from './enemy-import-attacks-v109.js';
import {getXenoTrialsSignatureV147} from './xeno-trials-signatures-v147.js';

// Admission coverage, not a second renderer/unlock registry. An admitted image
// may still fail to load; runtime guards and native fallback retain ownership.
// A source rig for presentations never silently becomes a walk or an attack.
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
export const XENO_TRIALS_ANIMATION_ACTIONS_V189=freeze(['idle','walk','air','light','heavy','guard','hurt','ko','special','presentation']);
const nativeSource=(fighter,art)=>({id:art.id,path:art.path,revision:art.visualRevision||fighter.importRevision||96,frameIds:['native-pose'],renderKind:'static'});
const source=(id,path,revision,renderKind,frameIds=[])=>({id,path,revision,renderKind,frameIds:[...frameIds]});
const state=(supported,sources,limitations=[])=>({supported,motionSupported:supported&&sources[0].renderKind!=='static',
 renderKind:sources[0].renderKind,sources,frameIds:[...sources[0].frameIds],limitations});

export function getXenoTrialsAnimationCoverageV189(value){
 const id=typeof value==='string'?value:value?.id,fighter=getXenoTrialsFighterV96(id);
 if(!fighter||typeof value==='object'&&value.profileId!==undefined&&value.profileId!==fighter.profileId)return null;
 const art=getXenoTrialsArtV96(id),atlas188=getXenoTrialsSpriteAtlasV188(fighter,art),atlas189=getXenoTrialsSpriteAtlasV189(fighter,art),rig=getXenoTrialsRigV154(fighter,art);
 const walk=getEnemyImportAnimationV107(art),light=getEnemyImportAttackV109(art);
 const swarm=getXenoTrialsSwarmSpriteV180(id),reaction=getXenoTrialsReactionProfileV186(id),signature=getXenoTrialsSignatureV147(fighter);
 const base=nativeSource(fighter,art),states={};
 for(const action of XENO_TRIALS_ANIMATION_ACTIONS_V189)states[action]=state(true,[base],['native-static-plate-no-authored-action']);
 states.walk.supported=Number.isFinite(fighter.speed)&&fighter.speed>0;
 states.air.supported=Number.isFinite(fighter.jump)&&fighter.jump>0;
 if(rig)states.presentation=state(true,[source(rig.id,rig.path,rig.presentationRevision||Number(/v(\d+)/.exec(rig.id)?.[1])||154,'mesh',
  Object.keys(rig.poses).filter(clip=>['intro','round-win','round-loss'].includes(clip))),base],['authored-native-mesh-not-captured-choreography']);
 if(swarm){
  states.walk=state(true,[source(`swarm-v180-${id}`,swarm.path,180,'mesh',swarm.poses.map(pose=>pose.id)),base],['bounded-short-strides-not-complete-locomotion']);
  for(const action of ['light','heavy','special'])states[action]=state(true,[source(`swarm-v180-${id}-${action}`,swarm.path,180,'mesh',[`${action}-engine-clock`]),base],
   ['grounded-only','fallback-for-airborne-phase','native-source-mesh-not-drawn-frames']);
 }
 if(reaction)for(const action of ['heavy','guard','hurt','ko']){
  const clips=reaction.states.filter(clip=>action==='heavy'?clip.state.startsWith('heavy-'):action==='hurt'?['hurt','guard-break','recover'].includes(clip.state):clip.state===action);
  states[action]=state(true,[source(`reactions-v186-${id}`,reaction.path,186,'mesh',clips.map(clip=>clip.id)),...states[action].sources],
   ['supported-lowering-not-full-prone','grounded-only','capture-and-sequence-keep-priority']);
 }
 if(walk)states.walk=state(true,[source(walk.id,walk.path,Number(/v(\d+)/.exec(walk.id)?.[1])||107,'drawn',walk.clips.move.frames),...states.walk.sources],
  ['reviewed-partial-imported-walk','grounded-movement-only']);
 if(light)states.light=state(true,[source(light.id,light.path,109,'drawn',light.frames.map(frame=>frame.id)),...states.light.sources],
  ['light-only','native-engine-attack-clock','grounded-only']);
 if(atlas188){
  const mapping={idle:['idle'],walk:['walk-a','walk-b'],light:['attack-windup','attack-impact','attack-recovery'],
   heavy:['attack-windup','attack-impact','attack-recovery'],guard:['guard'],hurt:['hit-recoil'],ko:['ko-fall','ko-ground']};
  for(const[action,frames]of Object.entries(mapping))states[action]=state(true,[source(`atlas-v188-${id}`,atlas188.texture.path,188,'drawn',frames),...states[action].sources],
   ['ten-drawn-keyposes-not-full-choreography','grounded-only','capture-and-sequence-keep-priority']);
 }
 if(atlas189){
  const mapping=atlas189.kind==='motion'
   ?{walk:atlas189.frames.filter(frame=>frame.id.startsWith('walk-')).map(frame=>frame.id),air:atlas189.frames.filter(frame=>frame.id.startsWith('air-')).map(frame=>frame.id)}
   :{idle:['idle'],walk:['walk-a','walk-b'],light:['attack-windup','attack-impact','attack-recovery'],heavy:['attack-windup','attack-impact','attack-recovery'],
    guard:['guard'],hurt:['hit-recoil'],ko:['ko-fall','ko-ground']};
  for(const[action,frames]of Object.entries(mapping))states[action]=state(true,[source(`atlas-v189-${id}`,atlas189.texture.path,189,'drawn',frames),...states[action].sources],
   atlas189.kind==='motion'?['eight-ground-strides-two-air-keyposes-not-full-locomotion','living-without-attack-guard-or-reaction','capture-and-sequence-keep-priority']
    :['ten-drawn-keyposes-not-full-choreography','grounded-only','anatomical-primary-action-shared-by-light-heavy','capture-and-sequence-keep-priority']);
 }
 states.special.effectsSupported=Boolean(signature||fighter.special);
 const drawnStates=XENO_TRIALS_ANIMATION_ACTIONS_V189.filter(action=>states[action].renderKind==='drawn');
 const meshStates=XENO_TRIALS_ANIMATION_ACTIONS_V189.filter(action=>states[action].renderKind==='mesh');
 const hasDrawnGestures=drawnStates.some(action=>action!=='idle');
 return freeze({id:fighter.id,profileId:fighter.profileId,label:fighter.label,artPath:art.path,sourceProvenance:art.provenance||'existing-project-source',
  states,drawnStates,meshStates,hasDrawnGestures,playerLabel:hasDrawnGestures?'Gestes dessinés':meshStates.some(action=>action!=='presentation')?'Gestes articulés':'Posture de référence',
  fullProne:states.ko.renderKind==='drawn'&&states.ko.frameIds.includes('ko-ground'),canonExact:false,fullAnimation:false,
  coverageBasis:'exact-id-admitted-registries-not-image-load-or-gameplay-receipt'});
}

export function getXenoTrialsAnimationCoverageListV189(){return freeze(FIGHTERS.map(fighter=>getXenoTrialsAnimationCoverageV189(fighter.id)));}
export function getXenoTrialsAnimationCoverageSummaryV189(){
 const entries=getXenoTrialsAnimationCoverageListV189(),byAction={};
 for(const action of XENO_TRIALS_ANIMATION_ACTIONS_V189)byAction[action]={drawn:entries.filter(entry=>entry.states[action].renderKind==='drawn').length,
  mesh:entries.filter(entry=>entry.states[action].renderKind==='mesh').length,static:entries.filter(entry=>entry.states[action].renderKind==='static').length,
  supported:entries.filter(entry=>entry.states[action].supported).length};
 const frameKeys=new Set(),trialsFrameKeys=new Set();for(const entry of entries)for(const action of XENO_TRIALS_ANIMATION_ACTIONS_V189)for(const media of entry.states[action].sources)
  if(media.renderKind==='drawn')for(const frame of media.frameIds){const key=`${media.path}#${frame}`;frameKeys.add(key);if(/\/xeno-trials-v18[89]\//.test(media.path))trialsFrameKeys.add(key);}
 return freeze({schema:189,roster:entries.length,drawnProfiles:entries.filter(entry=>entry.hasDrawnGestures).length,
  articulatedProfiles:entries.filter(entry=>entry.meshStates.length>0).length,fullProneProfiles:entries.filter(entry=>entry.fullProne).length,
  activeArticulatedProfiles:entries.filter(entry=>entry.meshStates.some(action=>action!=='presentation')).length,
  uniqueAdmittedDrawnFrames:frameKeys.size,trialsDrawnFrames:trialsFrameKeys.size,byAction,canonExact:0,fullyAnimated:0});
}
