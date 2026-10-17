import { XENO_TRIALS_RIGS_V154, getXenoTrialsRigV154, getXenoTrialsRigCueV154, sampleXenoTrialsSequenceAnglesV155 } from './xeno-trials-rig-v154.js';
import { getXenoTrialsFighterV96, getXenoTrialsArtV96 } from './xeno-trials-data-v96.js';
import { XENO_PRESENTATION_V97 } from './xeno-trials-presentation-v97.js';

// Original presentation choreography on the four admitted source plates. No
// canonical animation, voiced line, relation or combat ability is asserted.
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t*t*(3-2*t); };
export const XENO_TRIALS_SEQUENCE_TIMING_V155 = freeze({ outroMs: 1800, maxStepMs: 100, roundMs: 1800 });
const key = (at, beat, angles = {}) => ({ at, beat, angles });
const sequence = (rig, kind, label, keys) => ({
 id: `${rig.fighterId}::${kind}`, fighterId: rig.fighterId, profileId: rig.profileId, rigId: rig.id,
 kind, label, durationMs: kind === 'intro' ? XENO_PRESENTATION_V97.introMs : XENO_TRIALS_SEQUENCE_TIMING_V155.outroMs,
 sourcePath: rig.path, sourceSha256: rig.sourceSha256, evidence: 'original-versus-presentation', canonExact: false, keys
});
const styles = [
 { id:'prowler', label:'Observation du Prowler',
  alert:{spine:.6,head:-3.5,tail0:1.2,tail1:-.6},
  scan:{spine:-.6,head:2,tail0:-.7,tail2:.5},
  victory:{spine:-1.5,head:-4,tail0:1.3,tail1:-.5},
  loss:{spine:2.6,head:4,upper0:1,upper1:-1,tail0:-1} },
 { id:'dd-darwin-era-cultist', label:'Vigilance du cultiste',
  alert:{spine:.8,head:-3,upper0:1,fore0:1.5},
  scan:{spine:-.5,head:1.8,upper1:-1,fore1:-1.5},
  victory:{spine:-1.4,head:-3.6,upper0:1.2},
  loss:{spine:2.6,head:4,fore0:1,fore1:-1} },
 { id:'import-game-dd-wy-commando', label:'Contrôle du secteur',
  alert:{spine:-.9,head:3.4}, scan:{spine:.5,head:-1.6},
  victory:{spine:1.4,head:3.8}, loss:{spine:-2.6,head:-4} },
 { id:'import-game-dd-guardian', label:'Stabilisation du Guardian',
  alert:{spine:-.6,head:2.5}, scan:{spine:.8,head:-2.2},
  victory:{spine:1.1,head:3.2}, loss:{spine:-2.2,head:-3.7} }
];
// Beats are explicit and different between identities, not a sine applied to
// the entire portrait. Foot supports and the carried weapon remain local-rigid.
export const XENO_TRIALS_SEQUENCES_V155 = freeze(styles.flatMap(style => {
 const r = XENO_TRIALS_RIGS_V154.find(r => r.fighterId === style.id);
 const scale = (angles, gain) => Object.fromEntries(Object.entries(angles).map(([b,a]) => [b,a*gain]));
 return [
  sequence(r,'intro',style.label,[key(0,'neutre'),key(.22,'observer',style.scan),key(.52,'identifier',style.alert),key(.78,'stabiliser',scale(style.alert,.55)),key(1,'prêt')]),
  sequence(r,'round-win','Avantage de manche',[key(0,'arrêt'),key(.24,'constater',style.victory),key(.57,'surveiller',scale(style.scan,.5)),key(.78,'recentrer',scale(style.victory,.25)),key(1,'reprise')]),
  sequence(r,'round-loss','Récupération de manche',[key(0,'arrêt'),key(.2,'encaisser',style.loss),key(.52,'récupérer',scale(style.loss,.6)),key(.78,'recentrer',scale(style.alert,.35)),key(1,'reprise')]),
  sequence(r,'outro-win','Évaluation remportée',[key(0,'arrêt'),key(.24,'confirmer',style.victory),key(.53,'vérifier',scale(style.scan,.6)),key(.76,'sécuriser',style.victory),key(1,'pose finale',scale(style.victory,.7))]),
  sequence(r,'outro-loss','Évaluation perdue',[key(0,'arrêt'),key(.2,'encaisser',style.loss),key(.48,'céder',scale(style.loss,.85)),key(.75,'immobiliser',scale(style.loss,.7)),key(1,'pose finale',scale(style.loss,.7))])
 ];
}));
// V155 remains an immutable historical catalog. V156 completes the five missing
// event/command presentations on these same four native identities only.
export const XENO_TRIALS_SEQUENCE_TIMING_V156 = freeze({ tauntMs: 1100, exitMs: 600, drawMs: 1800 });
const scaleAngles = (angles, gain) => Object.fromEntries(Object.entries(angles).map(([bone,a])=>[bone,a*gain]));
const extended = (style, kind, label, durationMs, keys) => ({
 ...sequence(XENO_TRIALS_RIGS_V154.find(r=>r.fighterId===style.id),kind,label,keys),
 durationMs, evidence:'original-versus-presentation', version:156
});
export const XENO_TRIALS_ADDED_SEQUENCES_V156 = freeze(styles.flatMap(style=>[
 extended(style,'intro-rival','Évaluer la famille adverse',1200,[key(0,'neutre'),key(.18,'repérer',scaleAngles(style.scan,.6)),key(.47,'évaluer',style.alert),key(.76,'garder ses distances',scaleAngles(style.scan,.4)),key(1,'prêt')]),
 extended(style,'outro','Retour à la vigilance',600,[key(0,'pose finale',scaleAngles(style.victory,.7)),key(.23,'vérifier le secteur',scaleAngles(style.victory,.55)),key(.52,'se dégager',scaleAngles(style.scan,.45)),key(.8,'recentrer',scaleAngles(style.alert,.2)),key(1,'neutre')]),
 extended(style,'draw','Évaluation sans vainqueur',1800,[key(0,'arrêt'),key(.2,'récupérer',scaleAngles(style.loss,.7)),key(.48,'réévaluer',scaleAngles(style.scan,.6)),key(.76,'se stabiliser',scaleAngles(style.alert,.25)),key(1,'neutre')]),
 extended(style,'taunt','Défi de simulation',1100,[key(0,'neutre'),key(.2,'observer',scaleAngles(style.scan,.8)),key(.5,'défier',scaleAngles(style.alert,1.2)),key(.74,'surveiller',scaleAngles(style.victory,.45)),key(1,'prêt')]),
 extended(style,'rematch','Reprise de simulation',3000,[key(0,'arrêt'),key(.17,'contrôler',scaleAngles(style.scan,.7)),key(.45,'réarmer la posture',scaleAngles(style.alert,.8)),key(.73,'se placer',scaleAngles(style.victory,.35)),key(1,'prêt')])
]));
export const XENO_TRIALS_SEQUENCES_V156 = freeze([...XENO_TRIALS_SEQUENCES_V155,...XENO_TRIALS_ADDED_SEQUENCES_V156]);
const lookup = new Map(XENO_TRIALS_SEQUENCES_V156.map(s => [s.id,s]));
export function getXenoTrialsSequenceV155(rig, kind) {
 if (!XENO_TRIALS_RIGS_V154.includes(rig)) return null;
 return lookup.get(`${rig.fighterId}::${kind}`) || null;
}
export function sampleXenoTrialsSequenceV155(rig, cue, reducedMotion = false) {
 const s = getXenoTrialsSequenceV155(rig,cue?.clip);
 if (!s || !Number.isFinite(cue.progress) || !Number.isFinite(cue.elapsed) || cue.elapsed < 0) return null;
 const p = clamp(cue.progress);
 let keys=s.keys;
 // The initial exit posture is the actual preceding result, including defeat.
 // Family response is a simulation observation, never a claimed rivalry.
 if(s.kind==='outro' && ['outro-win','outro-loss'].includes(cue.previousKind)) {
  const prior=getXenoTrialsSequenceV155(rig,cue.previousKind).keys.at(-1).angles;
  keys=keys.map((k,i)=>i<2?{...k,angles:scaleAngles(prior,i===0?1:.78)}:k);
 } else if(s.kind==='intro-rival') {
  const gains={human:.85,synthetic:.75,xenomorph:1,pathogen:1.1,engineer:.9};
  if(!Object.hasOwn(gains,cue.opponentFamily))return null;
  keys=keys.map(k=>({...k,angles:scaleAngles(k.angles,gains[cue.opponentFamily])}));
 }
 const right = keys.findIndex(k => k.at >= p);
 const b = keys[Math.max(1,right)], a = keys[Math.max(0,right-1)];
 const u = smooth((p-a.at)/(b.at-a.at)), bones = new Set([...Object.keys(a.angles),...Object.keys(b.angles)]);
 const angles = Object.fromEntries([...bones].map(bone => [bone,(a.angles[bone]||0)*(1-u)+(b.angles[bone]||0)*u]));
 const frame = sampleXenoTrialsSequenceAnglesV155(rig,cue,angles,reducedMotion);
 return frame && {...frame,sequenceIdV155:s.id,beatV155:p >= 1 ? b.beat : a.beat,
  ...(s.version===156?{sequenceIdV156:s.id,animation:'authored-native-sequence-v156'}:{})};
}

export function createXenoTrialsOutroV155(match, reducedMotion = false) {
 if (match?.phase !== 'match-over' || !match.result?.completed || !['player','opponent'].includes(match.result.winner)
  || match.result.reason === 'double-ko' || !Array.isArray(match.fighters)) return null;
 const participants = match.fighters.flatMap(f => {
  const def = getXenoTrialsFighterV96(f.id), rig = getXenoTrialsRigV154(def,getXenoTrialsArtV96(f.id,f.variant));
  if (!rig || f.y !== 0 || match.result.winner === f.side && f.hp <= 0) return [];
  const kind = f.side === match.result.winner ? 'outro-win' : 'outro-loss';
  return [{side:f.side,fighterId:f.id,rigId:rig.id,sequenceId:getXenoTrialsSequenceV155(rig,kind).id,kind}];
 });
 if (!participants.length) return null;
 return {matchId:match.config.matchId,terminalTick:match.tick,winner:match.result.winner,participants,
  phase:reducedMotion ? 'complete' : 'playing',elapsedMs:0,durationMs:XENO_TRIALS_SEQUENCE_TIMING_V155.outroMs,
  paused:false,skipped:false,reducedMotion:reducedMotion === true};
}
export function advanceXenoTrialsOutroV155(state, elapsedMs, frozen = false) {
 if (!state || state.phase !== 'playing' || state.paused || frozen || !Number.isFinite(elapsedMs) || elapsedMs <= 0) return state;
 const elapsed = Math.min(state.durationMs,state.elapsedMs+Math.min(XENO_TRIALS_SEQUENCE_TIMING_V155.maxStepMs,elapsedMs));
 return {...state,elapsedMs:elapsed,phase:elapsed+1e-7>=state.durationMs?'complete':'playing'};
}
export function skipXenoTrialsOutroV155(state) {
 return state?.phase === 'playing' && !state.paused ? {...state,elapsedMs:state.durationMs,phase:'complete',skipped:true} : state;
}
export function getXenoTrialsSequenceCueV155(rig, match, fighter, presentation, outro) {
 if (!XENO_TRIALS_RIGS_V154.includes(rig) || fighter?.id !== rig.fighterId || !match?.fighters?.includes(fighter)) return null;
 if (match.phase === 'active' && presentation?.blocksSimulation && presentation.fighterSlot === match.fighters.indexOf(fighter))
  return {clip:'intro',progress:clamp(presentation.elapsedMs/XENO_PRESENTATION_V97.introMs),elapsed:presentation.elapsedMs/1000};
 if (match.phase === 'round-over' && ['player','opponent'].includes(match.roundWinner)) {
  const elapsed = Math.max(0,Math.min(1.8,1.8-match.phaseTime));
  return {clip:match.roundWinner===fighter.side?'round-win':'round-loss',progress:elapsed/1.8,elapsed};
 }
 if (match.phase !== 'match-over' || !outro || outro.matchId !== match.config.matchId || outro.terminalTick !== match.tick || outro.reducedMotion) return null;
 const participant = outro.participants.find(p=>p.side===fighter.side&&p.rigId===rig.id&&p.fighterId===fighter.id);
 return participant ? {clip:participant.kind,progress:clamp(outro.elapsedMs/outro.durationMs),elapsed:outro.elapsedMs/1000} : null;
}
// Skipping an entrance never skips the opponent's entrance or 3-2-1 countdown.
export function skipXenoTrialsIntroV155(state) {
 if (!state || !['intro-player','intro-opponent'].includes(state.phase)) return state;
 return {...state,phase:state.phase==='intro-player'?'intro-opponent':'countdown',elapsedMs:0};
}


/** A detached terminal presentation cannot create, change, or replay a result. */
export function createXenoTrialsTerminalV156(match, kind, reducedMotion=false, previousOutro=null) {
 if(match?.phase!=='match-over' || !match.result?.completed || !Array.isArray(match.fighters))return null;
 if(kind==='draw') { if(match.result.winner!=='draw')return null; }
 else if(kind==='outro') {
  if(!['player','opponent'].includes(match.result.winner) || previousOutro?.phase!=='complete' || previousOutro.skipped
   || previousOutro.reducedMotion || previousOutro.matchId!==match.config.matchId || previousOutro.terminalTick!==match.tick)return null;
 } else return null;
 const participants=match.fighters.flatMap(f=>{
  const rig=getXenoTrialsRigV154(getXenoTrialsFighterV96(f.id),getXenoTrialsArtV96(f.id,f.variant));
  const previous=previousOutro?.participants?.find(p=>p.side===f.side&&p.fighterId===f.id&&p.rigId===rig?.id);
  if(!rig || f.y!==0 || kind==='outro'&&(!previous || previous.kind!==(f.side===match.result.winner?'outro-win':'outro-loss')))return [];
  return [{side:f.side,fighterId:f.id,rigId:rig.id,kind,sequenceId:`${f.id}::${kind}`,...(previous?{previousKind:previous.kind}:{})}];
 });
 if(!participants.length)return null;
 return {kind,matchId:match.config.matchId,terminalTick:match.tick,participants,phase:reducedMotion?'complete':'playing',elapsedMs:0,
  durationMs:kind==='draw'?XENO_TRIALS_SEQUENCE_TIMING_V156.drawMs:XENO_TRIALS_SEQUENCE_TIMING_V156.exitMs,
  paused:false,skipped:false,reducedMotion:reducedMotion===true};
}
export function createXenoTrialsTauntV156(match, presentation, controls={}, reducedMotion=false) {
 const f=match?.fighters?.[0];
 if(match?.phase!=='active' || match.paused || presentation?.blocksSimulation || !f || f.side!=='player'
  || f.hp<=0 || f.y!==0 || f.vy!==0 || f.attack || f.guard || f.stun>0 || f.hitFlash>0 || Object.values(controls).some(Boolean))return null;
 const rig=getXenoTrialsRigV154(getXenoTrialsFighterV96(f.id),getXenoTrialsArtV96(f.id,f.variant));
 if(!rig || getXenoTrialsRigCueV154(rig,match,f,presentation))return null;
 return {kind:'taunt',matchId:match.config.matchId,round:match.round,startedTick:match.tick,fighterId:f.id,rigId:rig.id,
  healthAtStart:f.hp,phase:reducedMotion?'complete':'playing',elapsedMs:0,durationMs:XENO_TRIALS_SEQUENCE_TIMING_V156.tauntMs,
  paused:false,skipped:false,reducedMotion:reducedMotion===true};
}
export function advanceXenoTrialsTauntV156(state, match, elapsedMs, controls={}, reducedMotion=false) {
 if(!state || state.phase!=='playing')return state;
 if(match?.paused)return state;
 const f=match?.fighters?.[0];
 const cancel=match?.config?.matchId!==state.matchId || match.round!==state.round || match.phase!=='active'
  || !f || f.id!==state.fighterId || f.hp!==state.healthAtStart || f.hp<=0 || f.y!==0 || f.vy!==0
  || f.attack || f.guard || f.stun>0 || f.hitFlash>0 || Object.values(controls).some(Boolean)
  || match.grappleV153 && [match.grappleV153.attacker,match.grappleV153.target].includes(f.side);
 if(cancel)return {...state,phase:'cancelled'};
 if(reducedMotion)return {...skipXenoTrialsOutroV155(state),reducedMotion:true};
 return advanceXenoTrialsOutroV155(state,elapsedMs);
}
/** Events are inspected, never synthesized by the renderer. */
export function getXenoTrialsSequenceCueV156(rig, match, fighter, presentation, terminal, taunt) {
 if(!XENO_TRIALS_RIGS_V154.includes(rig) || fighter?.id!==rig.fighterId || !match?.fighters?.includes(fighter) || fighter.y!==0)return null;
 if(match.phase==='match-over' && terminal?.matchId===match.config.matchId && terminal.terminalTick===match.tick && !terminal.reducedMotion
  && ['playing','complete'].includes(terminal.phase) && ['outro','draw'].includes(terminal.kind) && Array.isArray(terminal.participants)
  && Number.isFinite(terminal.durationMs) && terminal.durationMs>0) {
  const p=terminal.participants.find(p=>p.side===fighter.side&&p.fighterId===fighter.id&&p.rigId===rig.id);
  if(p)return {clip:p.kind,progress:clamp(terminal.elapsedMs/terminal.durationMs),elapsed:terminal.elapsedMs/1000,...(p.previousKind?{previousKind:p.previousKind}:{})};
 }
 if(match.phase==='round-over' && match.roundWinner==='draw') {
  const elapsed=Math.max(0,Math.min(1.8,1.8-match.phaseTime));
  return {clip:'draw',progress:elapsed/1.8,elapsed};
 }
 if(match.phase!=='active')return null;
 if(presentation?.blocksSimulation && [0,1].includes(presentation.fighterSlot) && presentation.fighterSlot!==match.fighters.indexOf(fighter)) {
  const opponent=match.fighters[presentation.fighterSlot];
  return {clip:'intro-rival',progress:clamp(presentation.elapsedMs/1200),elapsed:presentation.elapsedMs/1000,opponentFamily:getXenoTrialsFighterV96(opponent.id).family};
 }
 if(presentation?.phase==='countdown' && match.round>1)
  return {clip:'rematch',progress:clamp(presentation.elapsedMs/3000),elapsed:presentation.elapsedMs/1000};
 if(!presentation?.blocksSimulation && fighter.side==='player' && taunt?.phase==='playing' && taunt.matchId===match.config.matchId
  && taunt.round===match.round && taunt.fighterId===fighter.id && taunt.rigId===rig.id)
  return {clip:'taunt',progress:clamp(taunt.elapsedMs/taunt.durationMs),elapsed:taunt.elapsedMs/1000};
 return null;
}
