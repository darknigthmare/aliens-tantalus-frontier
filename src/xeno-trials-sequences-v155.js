import { XENO_TRIALS_RIGS_V154, getXenoTrialsRigV154, sampleXenoTrialsSequenceAnglesV155 } from './xeno-trials-rig-v154.js';
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
const lookup = new Map(XENO_TRIALS_SEQUENCES_V155.map(s => [s.id,s]));
export function getXenoTrialsSequenceV155(rig, kind) {
 if (!XENO_TRIALS_RIGS_V154.includes(rig)) return null;
 return lookup.get(`${rig.fighterId}::${kind}`) || null;
}
export function sampleXenoTrialsSequenceV155(rig, cue, reducedMotion = false) {
 const s = getXenoTrialsSequenceV155(rig,cue?.clip);
 if (!s || !Number.isFinite(cue.progress) || !Number.isFinite(cue.elapsed) || cue.elapsed < 0) return null;
 const p = clamp(cue.progress), right = s.keys.findIndex(k => k.at >= p);
 const b = s.keys[Math.max(1,right)], a = s.keys[Math.max(0,right-1)];
 const u = smooth((p-a.at)/(b.at-a.at)), bones = new Set([...Object.keys(a.angles),...Object.keys(b.angles)]);
 const angles = Object.fromEntries([...bones].map(bone => [bone,(a.angles[bone]||0)*(1-u)+(b.angles[bone]||0)*u]));
 const frame = sampleXenoTrialsSequenceAnglesV155(rig,cue,angles,reducedMotion);
 return frame && {...frame,sequenceIdV155:s.id,beatV155:p >= 1 ? b.beat : a.beat};
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
