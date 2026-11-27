/** Targeted Node fixtures, not a browser/menu or visual acceptance run.
 * Combat outcomes below use only public create/step/next-round APIs and native
 * controls. HP, positions, clocks and results are never assigned by this file.
 * Detached presentation receipts explicitly test their own admission boundary.
 * The CPU/RAF fixture doubles Canvas and image metadata, not combat or AI.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { XENO_TRIALS_RIG_DATA_V163 as nativeRigs } from '../src/xeno-trials-rig-data-v163.js';
import { XENO_TRIALS_RIGS_V154 as historicalRigs, getXenoTrialsRigV154 as resolveRig,
 getXenoTrialsRigCueV154 as nativeCue, sampleXenoTrialsRigV154 as nativeSample,
 sampleXenoTrialsSequenceAnglesV155 as sequenceAngles,
 sampleXenoTrialsExitPoseV157 as exitPose } from '../src/xeno-trials-rig-v154.js';
import { XENO_TRIALS_SEQUENCES_V155 as historicalSequences,
 XENO_TRIALS_ADDED_SEQUENCES_V156 as addedSequences,
 XENO_TRIALS_SEQUENCES_V156 as allSequences,
 getXenoTrialsSequenceV155 as sequence, sampleXenoTrialsSequenceV155 as sampleSequence,
 getXenoTrialsSequenceCueV155 as sequenceCue155,
 getXenoTrialsSequenceCueV156 as sequenceCue156,
 createXenoTrialsOutroV155 as outro, advanceXenoTrialsOutroV155 as advance,
 createXenoTrialsTerminalV156 as terminal, createXenoTrialsTauntV156 as taunt,
 createXenoTrialsLandingV157 as landing, createXenoTrialsExitV157 as exit } from '../src/xeno-trials-sequences-v155.js';
import { createXenoTrialsMatchV96 as create, stepXenoTrialsMatchV96 as step,
 nextXenoTrialsRoundV96 as nextRound } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyGapV105 as gap } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsFighterV96 as fighter, getXenoTrialsArtV96 as art } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsRenderMetricsV110 as metrics } from '../src/xeno-trials-scale-v110.js';
import { getXenoTrialsPresentationRigV211 as presentationRig } from '../src/xeno-trials-presentation-v211.js';
import { createXenoTrialsPilotOutroV197, createXenoTrialsPilotReturnV212 } from '../src/xeno-trials-pilot-sequences-v197.js';
import { createXenoTrialsRuntimeV96 as runtime } from '../src/xeno-trials-runtime-v96.js';
import { createXenoTrialsProgressV96 as initialProgress, normalizeXenoTrialsProgressV96 as normalizeProgress,
 beginXenoTrialsV96 as begin, settleXenoTrialsV96 as settle } from '../src/xeno-trials-progress-v96.js';

const copy = value => JSON.parse(JSON.stringify(value));
const activePresentation = Object.freeze({ phase:'active', fighterSlot:null, blocksSimulation:false });
const camera = Object.freeze({ translateX:0, zoom:1 });
const historicalIds = new Set(historicalRigs.map(r => r.id));
const clip = Object.freeze({ clip:'intro', progress:.5, elapsed:.6 });
const exitView = rig => ({ rigId:rig.id, distance:40, stride:40, footLift:3.2 });
const config = (playerId, opponentId, suffix) => ({
 playerId, opponentId, matchId:`native-terminal-v163-${suffix}`, seed:163,
 introSeconds:0, roundsToWin:2, roundSeconds:15, holdRoundTransition:true,
 rulesV119:{ initialHp:1 }
});

/** One side approaches and pulses the ordinary light attack. Passing {} for
 * the other side is the documented two-input fixture API; it disables AI only
 * in these engine fixtures. Draws consume all five real round time limits. */
function finish(configuration, winner, airborne=false) {
 const match=create(configuration);
 assert.ok(match.fighters.every(f => f.hp===1));
 for(let calls=0;calls<5000 && match.phase!=='match-over';calls++) {
  if(match.phase==='round-over') {
   assert.equal(nextRound(match),true);
   // Round transitions intentionally require a physical release before a held
   // movement or attack may start again. Exercise that public input contract.
   step(match,.05,{},{});
   continue;
  }
  const controls=[{},{}];
  if(winner!=='draw') {
   const index=winner==='player'?0:1, a=match.fighters[index], b=match.fighters[1-index];
   const close=gap(a,b)<=28, pulse=calls%4===0;
   controls[index][b.x>=a.x?'right':'left']=true;
   if(close && pulse) controls[index].light=true;
   // Equal native mirrors jump together, then the real light contact ends the
   // round in flight. This exercises landing admission with actual engine y.
   if(airborne && close && pulse && a.y===0 && b.y===0 && !a.attack && !b.attack) {
    controls[0].jump=true; controls[1].jump=true;
   }
  }
  step(match,winner==='draw'?.25:.05,controls[0],controls[1]);
 }
 assert.equal(match.phase,'match-over',`${configuration.matchId}: native inputs did not finish`);
 assert.equal(match.result?.completed,true);
 assert.equal(match.result.winner,winner);
 assert.equal(match.result.reason,winner==='draw'?'time':'ko');
 assert.equal(match.result.rounds,winner==='draw'?5:2);
 assert.ok(match.result.durationTicks>0);
 if(winner==='draw') {
  assert.deepEqual(match.wins,{player:0,opponent:0});
  assert.ok(match.fighters.every(f => f.hp===1));
 } else {
  const won=match.fighters.find(f => f.side===winner),lost=match.fighters.find(f => f.side!==winner);
  assert.equal(won.hp,1); assert.equal(lost.hp,0);
  assert.ok(won.stats.hits>=2 && won.stats.damage>=2);
 }
 if(airborne) assert.ok(match.fighters.every(f => f.y>0),'KO must genuinely freeze airborne native mirrors');
 return match;
}

const completed = state => {
 assert.ok(state);
 for(let i=0;i<200 && state.phase==='playing';i++) state=advance(state,100);
 assert.equal(state.phase,'complete');
 return state;
};
// Synthetic detached presentation receipts only: these do not replace an
// engine verdict or claim that an unsupported clip was played by the game.
const receipt = (match,kind) => ({
 kind, matchId:match.config.matchId, terminalTick:match.tick,
 phase:'complete', elapsedMs:1800, skipped:false, reducedMotion:false,
 participants:match.fighters.map(f => ({ side:f.side, fighterId:f.id,
  rigId:resolveRig(fighter(f.id),art(f.id,f.variant)).id,
  kind:kind==='outro'?f.side===match.result.winner?'outro-win':'outro-loss':kind }))
});

function assertArticulatedReceipt(participant, actor, kind) {
 const rig=presentationRig(fighter(actor.id),art(actor.id,actor.variant));
 assert.ok(rig);
 assert.ok(participant);
 assert.equal(participant.revision,211);
 assert.equal(participant.side,actor.side);
 assert.equal(participant.rigId,rig.id);
 assert.equal(participant.fighterId,actor.id);
 assert.equal(participant.presentationKindV211,kind);
 assert.equal(participant.sequenceId,`${actor.id}::${kind}`);
}

function assertNativeTerminalGates(match) {
 const before=copy(match);
 const grounded=match.fighters.every(actor=>actor.y===0),draw=match.result.winner==='draw';
 const verdict=outro(match),drawView=terminal(match,'draw');
 if (!grounded) {
  assert.equal(verdict,null);
  assert.equal(drawView,null);
 } else if (!draw && match.fighters[0].id==='drive-v123-fte-pathogen-brute-profile-v13') {
  assert.equal(verdict,null);
  assert.equal(drawView,null);
  const pilot=createXenoTrialsPilotOutroV197(match, verdict);
  assert.equal(pilot?.participants.length,2);
  for(const actor of match.fighters) {
   const entry=pilot.participants.find(p=>p.side===actor.side);
   assert.equal(entry?.kind,actor.side===match.result.winner?'outro-win':'outro-ko');
   assert.equal(entry?.revision,197);
   assert.equal(entry?.rigId,resolveRig(fighter(actor.id),art(actor.id,actor.variant)).id);
  }
  const signedReturn=createXenoTrialsPilotReturnV212(match,null,completed(pilot));
  assert.equal(signedReturn?.participants.length,1);
  assert.equal(signedReturn.participants[0].revision,212);
  assert.equal(signedReturn.participants[0].side,match.result.winner);
 } else {
  const view=draw?drawView:verdict;
  assert.ok(view);
  assert.equal(view.matchId,match.config.matchId);
  assert.equal(view.terminalTick,match.tick);
  assert.equal(view.participants.length,2);
  for(const actor of match.fighters) assertArticulatedReceipt(view.participants.find(p=>p.side===actor.side),actor,
   draw?'draw':actor.side===match.result.winner?'win-final':'lose-final');
  if(draw) assert.equal(verdict,null);
  else {
   assert.equal(drawView,null);
   const winner=match.fighters.find(actor=>actor.side===match.result.winner);
   const returnView=terminal(match,'outro',false,completed(verdict));
   assert.equal(returnView?.participants.length,1);
   assertArticulatedReceipt(returnView.participants[0],winner,'outro');
  }
 }
 assert.equal(terminal(match,'outro',false,receipt(match,'outro')),null);
 if(grounded) assert.equal(landing(match),null);
 else for(const participant of landing(match)?.participants ?? []) {
  assert.ok(participant.atlasPathV219);
  assert.equal(match.fighters.find(actor=>actor.side===participant.side).hp,0);
 }
 const owner=receipt(match,match.result.winner==='draw'?'draw':'outro');
 assert.equal(exit(match,owner,camera),null);
 assert.deepEqual(match,before,'presentation admission must not mutate a terminal match');
}

test('V163 native admission leaves four historical rigs and their 20/20/40 sequence catalogs intact',()=>{
 assert.equal(nativeRigs.length,15); assert.equal(historicalRigs.length,4);
 assert.equal(historicalSequences.length,20); assert.equal(addedSequences.length,20); assert.equal(allSequences.length,40);
 assert.ok(allSequences.every(s => historicalIds.has(s.rigId)));
 assert.equal(new Set(allSequences.map(s => s.id)).size,40);
});

for(const rig of nativeRigs) {
 test(`${rig.fighterId}: native presentation and the articulated taunt preserve historical sequence/exit boundaries`,()=>{
  const match=create(config(rig.fighterId,rig.fighterId,`${rig.fighterId}-active`)),before=copy(match);
  assert.equal(resolveRig(fighter(rig.fighterId),art(rig.fighterId)),rig);
  const intro=nativeCue(rig,match,match.fighters[0],{ fighterSlot:0, blocksSimulation:true, elapsedMs:600 });
  assert.equal(intro.clip,'intro'); assert.ok(nativeSample(rig,intro)?.active);
  assert.equal(nativeSample(rig,intro,true)?.active,false);
  const signal=taunt(match,activePresentation,{});
  assert.equal(signal?.rigId,presentationRig(fighter(rig.fighterId),art(rig.fighterId))?.id);
  assert.equal(signal?.fighterId,rig.fighterId);
  assert.equal(taunt(match,activePresentation,{guard:true}),null);
  assert.equal(sequence(rig,'intro'),null); assert.equal(sampleSequence(rig,clip),null);
  assert.equal(sequenceCue155(rig,match,match.fighters[0],activePresentation,null),null);
  assert.equal(sequenceCue156(rig,match,match.fighters[0],activePresentation,null,null),null);
  assert.equal(sequenceAngles(rig,clip,{head:1}),null);
  assert.equal(exitPose(rig,exitView(rig),metrics(rig.fighterId)),null);
  assert.deepEqual(match,before);
 });
 for(const winner of ['player','opponent','draw']) test(`${rig.fighterId}: genuine engine ${winner} outcome signs its articulated terminal clips`,()=>{
  const match=finish(config(rig.fighterId,rig.fighterId,`${rig.fighterId}-${winner}`),winner);
  assertNativeTerminalGates(match);
 });
 test(`${rig.fighterId}: genuine airborne KO preserves its physical verdict and historical exit boundary`,()=>{
  const match=finish(config(rig.fighterId,rig.fighterId,`${rig.fighterId}-airborne`),'player',true);
  assertNativeTerminalGates(match);
 });
}

for(const rig of historicalRigs) {
 test(`${rig.fighterId}: historical sequence, taunt, landing and exit capabilities remain admitted`,()=>{
  assert.equal(historicalSequences.filter(s => s.rigId===rig.id).length,5);
  assert.equal(addedSequences.filter(s => s.rigId===rig.id).length,5);
  const active=create(config(rig.fighterId,rig.fighterId,`${rig.fighterId}-historical-active`));
  assert.ok(taunt(active,activePresentation,{}));
  assert.ok(sequence(rig,'intro')); assert.ok(sampleSequence(rig,clip));
  assert.ok(sequenceAngles(rig,clip,{head:1}));
  assert.ok(exitPose(rig,exitView(rig),metrics(rig.fighterId)));
  const match=finish(config(rig.fighterId,rig.fighterId,`${rig.fighterId}-historical-outcome`),'player');
  const before=copy(match),resultOutro=outro(match);
  assert.equal(resultOutro?.participants.length,2);
  const finalTerminal=terminal(match,'outro',false,completed(resultOutro));
  assert.equal(finalTerminal?.participants.length,2);
  assert.deepEqual(match,before);
  const air=finish(config(rig.fighterId,rig.fighterId,`${rig.fighterId}-historical-airborne`),'player',true);
  const airBefore=copy(air),land=landing(air);
  assert.equal(land?.participants.length,2);
  // A zoomed detached viewport keeps this pure admission check within V157's
  // existing finite travel bound; it never changes physical fighter positions.
  const center=(air.fighters[0].x+air.fighters[1].x)/2;
  const spatial=exit(air,null,{zoom:2,translateX:500-center*2},false,completed(land));
  assert.equal(spatial?.participants.length,2);
  assert.ok(spatial.participants.every(p => p.rigId===rig.id));
  assert.deepEqual(air,airBefore);
 });
 for(const nativeSide of ['player','opponent']) for(const winner of ['player','opponent','draw']) {
  test(`${rig.fighterId}: mixed ${nativeSide} V163 / ${winner} outcome keeps each participant tied to its source`,()=>{
   const fresh=nativeRigs[0].fighterId;
   const ids=nativeSide==='player'?[fresh,rig.fighterId]:[rig.fighterId,fresh];
   const match=finish(config(...ids,`${rig.fighterId}-mixed-${nativeSide}-${winner}`),winner),before=copy(match);
   const o=outro(match),t=winner==='draw'?terminal(match,'draw'):terminal(match,'outro',false,completed(o));
   if(winner==='draw') assert.equal(o,null); else assert.equal(o?.participants.length,2);
   const nativeActor=match.fighters.find(actor=>actor.side===nativeSide);
   const nativeReturns=winner==='draw'||winner===nativeSide;
   assert.equal(t?.participants.length,nativeReturns?2:1);
   const historical=t.participants.find(p=>p.side!==nativeSide);
   assert.equal(historical?.rigId,rig.id);
   assert.ok(sequence(rig,historical.kind));
   if(nativeReturns) assertArticulatedReceipt(t.participants.find(p=>p.side===nativeSide),nativeActor,winner==='draw'?'draw':'outro');
   const x=exit(match,completed(t),camera);
   if(x) assert.ok(x.participants.every(p => p.rigId===rig.id));
   assert.deepEqual(match,before);
  });
 }
}

function eventTarget(properties={}) {
 const listeners=new Map();
 return Object.assign({
  addEventListener(type,listener) { if(!listeners.has(type))listeners.set(type,new Set()); listeners.get(type).add(listener); },
  removeEventListener(type,listener) { listeners.get(type)?.delete(listener); }
 },properties);
}
const metadata = path => {
 const bytes=readFileSync(new URL('..'+path,import.meta.url));
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',`PNG metadata fixture: ${path}`);
 return { complete:true, naturalWidth:bytes.readUInt32BE(16), naturalHeight:bytes.readUInt32BE(20) };
};
function cpuHost(configuration,onResult) {
 const window=eventTarget({matchMedia:()=>({matches:false})});
 const document=eventTarget({hidden:false,hasFocus:()=>true,documentElement:{classList:{contains:()=>false}}});
 const gradient=()=>({addColorStop(){}});
 const context=new Proxy({measureText:s=>({width:String(s).length*7}),createLinearGradient:gradient,createRadialGradient:gradient},
  {get:(object,key)=>object[key]??(()=>{})});
 const canvas=eventTarget({tagName:'CANVAS',width:1000,height:560,getContext:()=>context,
  setAttribute(){},closest:()=>null,focus(){document.activeElement=this;}});
 const queue=new Map(); let serial=0,time=0;
 const controller=runtime({canvas,window,document,config:configuration,loadImage:async path=>metadata(path),
  requestAnimationFrame:callback=>{queue.set(++serial,callback);return serial;},
  cancelAnimationFrame:id=>queue.delete(id),onResult});
 const frames=(count,hz)=>{
  for(let i=0;i<count;i++) {
   time+=1000/hz; const callbacks=[...queue.values()]; queue.clear();
   assert.ok(callbacks.length<=1,'at most one controller callback per RAF');
   for(const callback of callbacks)callback(time);
   assert.ok(queue.size<=1,'at most one scheduled successor RAF');
  }
 };
 return {controller,queue,frames};
}

for(const [hz,opponentId] of [[30,'synth-trooper'],[60,'synth-good-boy'],[120,'drive-v123-creature-romulus-offspring']]) {
 test(`real CPU/RAF at ${hz}Hz: result settles once, survives normalized reload and cannot replay (${opponentId})`,async()=>{
  // Warrior is a normal starter and itself one of the new native rigs. This
  // fixture needs neither an unlock injection nor a fabricated pending ticket.
  const ticket=begin(initialProgress(),{ playerId:'warrior',opponentId,difficulty:'hard',roundSeconds:30,
   activityV119:{branch:'on-demand',id:'on-demand',rules:{initialHp:1,timeLimitSeconds:30}} });
  assert.equal(ticket.applied,true);
  let progress=normalizeProgress(copy(ticket.state)),calls=0,acceptedResult;
  const h=cpuHost(progress.pending.config,result=>{
   calls++; acceptedResult=copy(result);
   const transaction=settle(progress,result);
   assert.equal(transaction.applied,true,'public settlement accepts the actual CPU result');
   progress=normalizeProgress(copy(transaction.state));
  });
  try {
   assert.equal(await h.controller.start(),true);
   for(let i=0;i<hz*240 && h.controller.getState().phase!=='match-over';i++) {
    assert.equal(h.queue.size,1,'active runtime keeps exactly one RAF'); h.frames(1,hz);
   }
   const verdict=h.controller.getState();
   assert.equal(verdict.phase,'match-over'); assert.equal(verdict.result.winner,'opponent');
   assert.equal(calls,1); assert.deepEqual(acceptedResult,verdict.result);
   assert.equal(verdict.outroV155?.phase,'playing');
   for(const actor of verdict.fighters) assertArticulatedReceipt(verdict.outroV155.participants.find(p=>p.side===actor.side),actor,
     actor.side==='opponent'?'win-final':'lose-final');
   assert.equal(verdict.landingV157,null); assert.equal(verdict.exitV157,null);
   h.frames(hz*5,hz);
   const final=h.controller.getState();
   assert.equal(final.outroV155?.phase,'complete');
   assert.equal(final.terminalV156?.phase,'complete');
   assert.deepEqual(final.result,acceptedResult);
   assert.deepEqual(final.fighters,verdict.fighters);
   assert.equal(final.tick,verdict.tick);
   assert.equal(h.queue.size,0,'the finite articulated finale releases its RAF owner');
   assert.equal(progress.pending,null); assert.equal(progress.ledger.length,1); assert.equal(progress.losses,1);
   const saved=copy(progress),reloaded=normalizeProgress(copy(progress));
   assert.deepEqual(normalizeProgress(copy(reloaded)),reloaded,'save normalization is stable after reload');
   const replay=settle(reloaded,acceptedResult);
   assert.equal(replay.applied,false); assert.equal(replay.reason,'invalid-or-replayed-result');
   assert.deepEqual(replay.state,reloaded); assert.deepEqual(progress,saved);
   h.frames(60,hz); assert.equal(calls,1); assert.deepEqual(h.controller.getState(),final);
   assert.equal(h.controller.resume(),false); assert.equal(h.controller.nextRound(),false);
   assert.equal(h.controller.taunt(),false); assert.equal(h.queue.size,0);
   const another=begin(reloaded,{playerId:'warrior',opponentId});
   assert.equal(another.applied,true); assert.notEqual(another.config.matchId,acceptedResult.matchId);
  } finally { h.controller.stop(); }
  assert.equal(h.queue.size,0); assert.equal(calls,1);
 });
}
