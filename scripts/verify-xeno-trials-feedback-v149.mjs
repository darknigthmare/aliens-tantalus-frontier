import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createXenoTrialsMatchV96 as create, getXenoTrialsSnapshotV96 as snapshot } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsProjectileThreatV149 as threat, stepXenoTrialsBrainV119 as brain } from '../src/xeno-trials-ai-v119.js';
import { XENO_TRIALS_ATTACKS_V96 as specs } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 as bounds } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsStageCueV149 as cue, drawXenoTrialsStageCueV149 as drawCue,
  drawXenoTrialsStageMotionV147 as drawMotion, XENO_TRIALS_STAGE_CUES_V149 as kinds } from '../src/xeno-trials-stage-motion-v147.js';
import { XENO_TRIALS_STAGES_V96 as stages } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';

// Engine boundary fixtures, not authored animation or a manual playthrough.
function trajectory() {
  const m=create({introSeconds:0,playerId:'spitter',opponentId:'warrior'}), defender=m.fighters[1], b=bounds(defender);
  const projectile={id:149,owner:'player',x:b.left-100,y:b.top+100,vx:300,vy:-300,direction:1,
    life:1,signatureIdV147:'test-acid',radiusV147:7};
  return {m,defender,b,projectile};
}
for(const variant of ['signature','super']) test(`defender sees descending ${variant} acid before it crosses body height`,()=>{
  const {defender,b,projectile}=trajectory();if(variant==='super')projectile.superIdV148='test-super';
  assert.ok(projectile.y>b.top);const before=structuredClone([projectile,defender]);
  const result=threat(projectile,defender);assert.ok(result);assert.equal(result.id,149);
  assert.ok(result.contactSeconds>0&&result.contactSeconds<.5);assert.deepEqual([projectile,defender],before);
});
for(const scenario of ['outgoing','passes-above','expired','too-short','ally','below-floor','dead','nonfinite','later-than-horizon']) {
  test(`projectile threat ignores ${scenario}`,()=>{
    const {defender,projectile,b}=trajectory();
    if(scenario==='outgoing')projectile.vx=-300;
    if(scenario==='passes-above')projectile.vy=0;
    if(scenario==='expired')projectile.life=0;
    if(scenario==='too-short')projectile.life=.05;
    if(scenario==='ally')projectile.owner=defender.side;
    if(scenario==='below-floor')Object.assign(projectile,{x:b.left-1,y:-1,vx:300,vy:0});
    if(scenario==='dead')defender.hp=0;
    if(scenario==='nonfinite')projectile.x=NaN;
    const horizon=scenario==='later-than-horizon'?.02:.5;
    assert.equal(threat(projectile,defender,horizon),null);
  });
}
test('legacy horizontal projectiles use their actual fixed-height lane and leading width',()=>{
  const {defender,b}=trajectory();
  const shot={id:2,owner:'player',x:b.left-150,y:(b.bottom+b.top)/2,direction:1,life:1};
  assert.ok(threat(shot,defender));shot.y=b.top+1;assert.equal(threat(shot,defender),null);
  shot.y=b.bottom;assert.ok(threat(shot,defender));
});
test('mirrored projectile observations give the same contact time',()=>{
 const {defender,projectile,b}=trajectory(),center=b.center;
 const a=threat(projectile,defender);
 // Mirror around the observed body centre without flipping anatomical widths.
 const p={...projectile,x:2*center-projectile.x,vx:-projectile.vx,direction:-1};
 assert.equal(threat(p,defender).contactSeconds,a.contactSeconds);
});
test('the native brain receives the new trajectory threat, never changes combat state directly',()=>{
 const {m,projectile}=trajectory();m.projectiles=[projectile];const before=snapshot(m);
 const controls=brain(m,1/120,specs,()=>.5);
 assert.equal(m.ai.observation.projectileThreat,true);
 assert.ok(['DEFEND','EVADE'].includes(m.ai.state));
 assert.deepEqual(m.fighters,before.fighters);assert.deepEqual(m.projectiles,before.projectiles);
 assert.ok(Object.values(controls).every(v=>typeof v==='boolean'));
});
for(const [stageId,kind] of Object.entries(kinds)) test(`${stageId}: intro, R1 loss and terminal cue remain distinct`,()=>{
 const intro=cue(stageId,{phase:'active',round:1,presentation:{blocksSimulation:true,elapsedMs:600,durationMs:1200}});
 const r1=cue(stageId,{phase:'round-over',round:1,roundWinner:'opponent',phaseTime:.9});
 const result=cue(stageId,{phase:'match-over',round:2,result:{winner:'player'}});
 assert.equal(intro.kind,kind);assert.equal(intro.phase,'introduction');assert.equal(intro.progress,.5);
 assert.equal(r1.phase,'intermission');assert.equal(r1.reversible,true);assert.equal(r1.terminal,false);
 assert.equal(r1.outcome,'opponent');assert.equal(result.outcome,'player');assert.equal(result.terminal,true);
 for(const state of [intro,r1,result]){assert.equal(state.affectsCombat,false);assert.ok(Object.isFrozen(state));}
});
test('reduced-motion cues keep the outcome but do not animate phase progress',()=>{
 const context={phase:'round-over',round:1,roundWinner:'opponent',phaseTime:1.8};
 const a=cue('hive-vault',context,true);context.phaseTime=.1;
 assert.deepEqual(cue('hive-vault',context,true),a);assert.equal(a.progress,1);assert.equal(a.outcome,'opponent');
});
test('stage cues are bounded and an unknown arena never borrows another identity',()=>{
 assert.equal(cue('unknown',{phase:'round-over'}).kind,null);
 for(const t of [-100,NaN,Infinity,0,1.8,100]){
  const s=cue('tantalus-cargo',{phase:'round-over',phaseTime:t,roundWinner:'not-a-side'});
  assert.ok(Number.isFinite(s.progress)&&s.progress>=0&&s.progress<=1);assert.equal(s.outcome,null);
 }
});
function canvasContext(){
 const operations=[];const ctx=new Proxy({operations},{get(o,k){return o[k]??((...args)=>operations.push([k,...args]));},set(o,k,v){o[k]=v;return true;}});
 return ctx;
}
for(const stage of stages)test(`${stage.id}: phase fixtures paint behind the floor and leave the match untouched`,()=>{
 const m=create({stageId:stage.id}),before=snapshot(m),ctx=canvasContext();m.phase='round-over';m.phaseTime=.9;m.roundWinner='player';
 const expected=snapshot(m);drawMotion(ctx,stage,{floor:450,center:500},m.tick,false,m);
 assert.deepEqual(snapshot(m),expected);assert.equal(before.config.stageId,stage.id);
 assert.equal(ctx.operations.filter(x=>x[0]==='save').length,ctx.operations.filter(x=>x[0]==='restore').length);
 assert.ok(ctx.operations.some(x=>x[0]==='rect'&&x[1]===0&&x[2]===0&&x[3]===1000&&x[4]===450));
 const empty=canvasContext();drawCue(empty,stage,{floor:450},{phase:'active'});assert.equal(empty.operations.length,0);
});
// Deterministic DOM/RAF host: same production presentation and match engine.
function host(){
 const events=()=>({handlers:new Map(),addEventListener(k,v){this.handlers.set(k,v);},removeEventListener(k){this.handlers.delete(k);}});
 const win=events(),doc=Object.assign(events(),{hidden:false,hasFocus:()=>true}),ctx=canvasContext();ctx.measureText=t=>({width:String(t).length*7});
 ctx.createLinearGradient=ctx.createRadialGradient=()=>({addColorStop(){}});
 const canvas=Object.assign(events(),{width:1000,height:560,getContext:()=>ctx,setAttribute(){},focus(){doc.activeElement=this;}});
 const queue=new Map();let n=0,time=0;
 const runtime=createXenoTrialsRuntimeV96({canvas,window:win,document:doc,config:{playerId:'warrior',opponentId:'runner',rulesV119:{initialHp:1},seed:149},
 loadImage:async()=>({naturalWidth:1024,naturalHeight:1024}),requestAnimationFrame:f=>{queue.set(++n,f);return n;},cancelAnimationFrame:k=>queue.delete(k)});
 const frame=()=>{time+=1000/120;const callbacks=[...queue.values()];queue.clear();callbacks.forEach(f=>f(time));};
 return {runtime,queue,frame};
}
test('real runtime exposes introduction/R1/result cues and pause freezes them without extra rendering loops',async()=>{
 const h=host();await h.runtime.start();assert.equal(h.runtime.getState().stageCueV149.phase,'introduction');
 for(let i=0;i<80;i++)h.frame();h.runtime.pause();const frozen=h.runtime.getState();for(let i=0;i<60;i++)h.frame();assert.deepEqual(h.runtime.getState(),frozen);
 h.runtime.resume();let sawRound=false;
 for(let i=0;i<7000&&h.runtime.getState().phase!=='match-over';i++){
  h.frame();const m=h.runtime.getState();if(m.phase==='round-over'){sawRound=true;assert.equal(m.stageCueV149.reversible,true);assert.equal(m.stageCueV149.terminal,false);}
 }
 const end=h.runtime.getState();assert.ok(sawRound);assert.equal(end.phase,'match-over');assert.equal(end.stageCueV149.phase,'result');
 assert.equal(end.stageCueV149.outcome,end.result.winner);assert.equal(h.queue.size,0);h.runtime.stop();
});
test('the optional progress bar has explicit intrinsic height and distinct native progress colours',()=>{
 const css=readFileSync(new URL('../xeno-trials-fullscreen-v119.css',import.meta.url),'utf8');
 assert.match(css,/\.xt-match-hud \.xt-super-meter-v148\{height:5px;min-height:5px/);
 assert.match(css,/\.xt-super-meter-v148::-webkit-progress-value/);assert.match(css,/\.xt-super-meter-v148::-moz-progress-bar/);
});

test('V149 workbook tracks exact current IDs, open art and source-only distribution',async()=>{
 const {createHash}=await import('node:crypto');const {execFileSync}=await import('node:child_process');
 const {XENO_TRIALS_FIGHTERS_V96:roster}=await import('../src/xeno-trials-data-v96.js');
 const {isPublicDistributionPathV86:isPublic}=await import('./verify-public-release-v86.mjs');
 const dir=new URL('../docs/forge/xeno-trials/',import.meta.url),data=JSON.parse(readFileSync(new URL('progress-v149.json',dir)));
 const hash=b=>createHash('sha256').update(b).digest('hex');
 assert.equal(data.schema,149);assert.equal(data.approved1to1,0);assert.equal(data.newCharacterAnimationClips,0);assert.equal(data.newSupers,0);
 assert.deepEqual(data.fighters.map(f=>f.id),roster.map(f=>f.id));assert.equal(data.retainedPilotSupers,5);
 assert.deepEqual(data.stages.map(s=>s.id),stages.map(s=>s.id));
 assert.equal(hash(readFileSync(new URL(data.workbook,dir))),data.workbookSha256);
 assert.equal(hash(readFileSync(new URL('XENO_TRIALS_SUIVI_V148.xlsx',dir))),data.retainedV148WorkbookSha256);
 for(const file of [data.workbook,'progress-v149.json','V149-FEEDBACK.md']){
  assert.equal(isPublic(`docs/forge/xeno-trials/${file}`),true);assert.equal(isPublic(`docs/forge/xeno-trials/${file}`,{built:true}),false);
 }
 const py=`import json,zipfile,xml.etree.ElementTree as E,sys
z=zipfile.ZipFile(sys.argv[1]);ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
book=E.fromstring(z.read('xl/workbook.xml'));assert len(book.findall('m:sheets/m:sheet',ns))==7
formulas=0
for path in z.namelist():
 if path.startswith('xl/worksheets/') and path.endswith('.xml'):
  root=E.fromstring(z.read(path));assert not root.findall('.//m:c[@t="e"]',ns),path
  formulas+=len(root.findall('.//m:f',ns))
assert formulas==6,formulas
print(json.dumps({'sheets':7,'formulas':formulas,'errors':0}))`;
 const {fileURLToPath}=await import('node:url');const verified=JSON.parse(execFileSync('python3',['-c',py,fileURLToPath(new URL(data.workbook,dir))],{encoding:'utf8'}));
 assert.deepEqual(verified,{sheets:7,formulas:6,errors:0});
});
