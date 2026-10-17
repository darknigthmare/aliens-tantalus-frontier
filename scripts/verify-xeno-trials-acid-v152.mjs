import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { XENO_TRIALS_FIGHTERS_V96 as roster, getXenoTrialsFighterV96 as definition } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96 as create, stepXenoTrialsMatchV96 as step, nextXenoTrialsRoundV96 as next,
  setXenoTrialsPausedV96 as pause, XENO_TRIALS_ARENA_V96 as arena, XENO_TRIALS_ATTACKS_V96 as attacks } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 as bounds } from '../src/xeno-trials-geometry-v105.js';
import { XENO_TRIALS_ACID_POOL_V152 as config, hasXenoTrialsAcidPoolsV152 as supports,
  depositXenoTrialsAcidV152 as deposit, stepXenoTrialsAcidV152 as advance,
  getXenoTrialsAcidEscapeV152 as escape, drawXenoTrialsAcidV152 as draw } from '../src/xeno-trials-acid-pools-v152.js';
import { stepXenoTrialsBrainV119 as brain } from '../src/xeno-trials-ai-v119.js';
import { createXenoTrialsRuntimeV96 as runtime } from '../src/xeno-trials-runtime-v96.js';
const DT = 1/120, Q = config.fighterId;
const make = (options={}) => create({playerId:Q, opponentId:'warrior', introSeconds:0, holdRoundTransition:true, seed:152, ...options});
const tick = (m,n,a={},b={}) => { for(let i=0;i<n;i++) step(m,DT,a,b); return m; };
const shot = (side='player',superAttack=false) => ({owner:side,signatureIdV147:config.signatureId,spec:{superV148:superAttack}});
const plant = (m,side='player',x=bounds(m.fighters[side==='player'?1:0]).center,superAttack=false) => {
  assert.equal(deposit(m,shot(side,superAttack),definition(Q),x,0,arena),true); return m.acidPoolsV152.at(-1);
};
// Boundary fixtures below may explicitly place a pool, adjust HP or set a clock.
// Separate native-engine/runtime tests emit real attacks; browser QA injects no state.
test('only the exact Queen/profile pair opts in; other 188 identities do not',()=>{
  assert.equal(Object.isFrozen(config),true);assert.equal(config.canonExact,false);
  assert.deepEqual(roster.filter(supports).map(f=>f.id),[Q]);
  assert.equal(supports({...definition(Q),profileId:'wrong'}),false);
  assert.equal(supports({...definition(Q),id:'queen'}),false);
});
for(const cause of ['no-special','paused','intro','terminal','wrong-owner','wrong-signature','invalid-x','invalid-y','outside','below'])test(`residue boundary rejects ${cause} without mutating state`,()=>{
  const m=make(),p=shot();let d=definition(Q),x=500,y=10;
  if(cause==='no-special')m.config.rulesV119.noSpecial=true;
  if(cause==='paused')m.paused=true;
  if(cause==='intro')m.phase='intro';if(cause==='terminal')m.phase='match-over';
  if(cause==='wrong-owner')p.owner='foreign';if(cause==='wrong-signature')p.signatureIdV147='other';
  if(cause==='invalid-x')x=NaN;if(cause==='invalid-y')y=Infinity;
  if(cause==='outside')x=arena.right+1;if(cause==='below')y=-1;
  const before=JSON.stringify(m);assert.equal(deposit(m,p,d,x,y,arena),false);assert.equal(JSON.stringify(m),before);assert.equal(p.residueV152,undefined);
});
test('one projectile deposits once and airborne residue falls without teleporting or hurting',()=>{
  const m=make(),p=shot(),hp=m.fighters[1].hp;assert.equal(deposit(m,p,definition(Q),500,380,arena),true);
  assert.equal(deposit(m,p,definition(Q),500,380,arena),false);assert.equal(m.acidDropsV152.length,1);
  tick(m,60);assert.equal(m.acidPoolsV152,undefined);assert.equal(m.acidDropsV152[0].x,500);
  assert.ok(m.acidDropsV152[0].y>180 && m.acidDropsV152[0].y<200);assert.equal(m.fighters[1].hp,hp);
  tick(m,62);assert.equal(m.acidPoolsV152.length,1);assert.equal(m.acidDropsV152.length,0);
});
test('warmup and cadence yield bounded damage; overlapping acid is not multiplied',()=>{
  for(const n of [1,3,12]){
    const m=make(),hp=m.fighters[1].hp;for(let i=0;i<n;i++)plant(m);
    tick(m,23);assert.equal(m.fighters[1].hp,hp);tick(m,1);assert.equal(m.fighters[1].hp,hp-4);
    tick(m,48);assert.equal(m.fighters[1].hp,hp-8);assert.equal(m.fighters[0].stats.hits,0);
    assert.equal(m.fighters[0].stats.acidTicksV152,2);
  }
});
test('leaving and re-entering the floor zone does not reset the exposure cadence',()=>{
  const m=make();plant(m);tick(m,24);const hp=m.fighters[1].hp,x=m.fighters[1].x;
  m.fighters[1].x=1500;tick(m,10);m.fighters[1].x=x;tick(m,37);assert.equal(m.fighters[1].hp,hp);
  tick(m,1);assert.equal(m.fighters[1].hp,hp-4);
});
test('floor damage preserves guard, accepted attacks and existing stun clocks',()=>{
  const m=make();plant(m);tick(m,22);step(m,DT,{}, {heavy:true});const attack=m.fighters[1].attack;
  step(m,DT,{},{});assert.equal(m.fighters[1].attack,attack);assert.equal(m.fighters[1].stun,0);
  const guard=make();plant(guard);tick(guard,24,{}, {guard:true});assert.equal(guard.fighters[1].guard,true);
  assert.equal(guard.fighters[1].stats.blocks,0);assert.equal(guard.fighters[1].hp,definition('warrior').hp-4);
});
test('jumping, moving out of range and the owning side avoid pool exposure',()=>{
  const m=make();plant(m);const hp=m.fighters[1].hp;tick(m,35,{}, {jump:true});assert.equal(m.fighters[1].hp,hp);
  const outside=make();plant(outside);tick(outside,50,{}, {right:true});const afterExit=outside.fighters[1].hp;
  assert.ok(afterExit>=hp-config.damage);tick(outside,120);assert.equal(outside.fighters[1].hp,afterExit);
  const own=make();plant(own,'player',bounds(own.fighters[0]).center);tick(own,120);assert.equal(own.fighters[0].hp,definition(Q).hp);
});
test('both pool and drop collections are capped and clipped to the actual floor',()=>{
  const m=make();for(let i=0;i<30;i++){plant(m,'player',arena.left);deposit(m,shot(),definition(Q),500,300,arena);}
  assert.equal(m.acidPoolsV152.length,config.maxPools);assert.equal(m.acidDropsV152.length,config.maxDrops);
  assert.equal(m.acidPoolsV152[0].left,arena.left);assert.equal(m.acidPoolsV152[0].right,arena.left+config.radius);
  assert.ok(m.acidPoolsV152[0].id>1);
});
test('a pool expires exactly once and never deals a tick at its expiry boundary',()=>{
  const m=make();plant(m);tick(m,360);assert.equal(m.acidPoolsV152.length,0);
  assert.equal(m.fighters[0].stats.acidTicksV152,7);const hp=m.fighters[1].hp;tick(m,120);assert.equal(m.fighters[1].hp,hp);
});
test('pause freezes residue, cadence, particles, meter and HP byte-for-byte',()=>{
  const m=make();plant(m);deposit(m,shot(),definition(Q),500,300,arena);tick(m,30);pause(m,true);
  const frozen=JSON.stringify(m);tick(m,120);advance(m,DT,bounds,arena,()=>assert.fail('paused impact'),()=>{});
  assert.equal(JSON.stringify(m),frozen);pause(m,false);tick(m,1);assert.notEqual(JSON.stringify(m),frozen);
});
test('both transitions and new matches discard all residue and exposure clocks',()=>{
  for(const terminal of [false,true]){
    const m=make({roundsToWin:terminal?1:2});plant(m);deposit(m,shot(),definition(Q),500,100,arena);
    m.timeRemaining=DT;m.fighters[1].hp=10;step(m,DT,{},{});
    for(const key of ['acidPoolsV152','acidDropsV152','acidNextHitV152'])assert.equal(m[key],undefined);
    if(!terminal){assert.equal(next(m),true);assert.equal(m.acidPoolsV152,undefined);}
    else {const frozen=JSON.stringify(m);tick(m,120);assert.equal(JSON.stringify(m),frozen);}
  }
  assert.equal(make().acidPoolsV152,undefined);
});
test('only real remaining HP funds damage/meter; a super pool cannot recharge its owner',()=>{
  for(const isSuper of [false,true]){
    const m=make();m.fighters[1].hp=3;plant(m,'player',bounds(m.fighters[1]).center,isSuper);tick(m,24);
    assert.equal(m.fighters[0].stats.damage,3);assert.equal(m.fighters[0].stats.acidTicksV152,1);
    assert.equal(m.fighters[0].superMeterV148,isSuper?0:1.8);assert.equal(m.roundWinner,'player');
  }
});
test('two simultaneous floor fatalities resolve as a double KO before verdict',()=>{
  const m=make({opponentId:Q});for(const f of m.fighters)f.hp=3;
  plant(m,'player');plant(m,'opponent');tick(m,24);
  assert.equal(m.roundReason,'double-ko');assert.equal(m.roundWinner,'draw');
  assert.deepEqual(m.fighters.map(f=>f.stats.damage),[3,3]);assert.equal(m.acidPoolsV152,undefined);
});
test('acid killing a Burster still resolves its existing death retaliation before verdict',()=>{
  const m=make({opponentId:'burster'});const [a,b]=m.fighters;const aa=bounds(a),bb=bounds(b);b.x+=aa.right+4-bb.left;
  a.hp=30;b.hp=3;plant(m);tick(m,24);assert.equal(m.roundReason,'double-ko');
  assert.ok(m.events.some(e=>e.type==='burster-death-v151'));assert.equal(m.acidPoolsV152,undefined);
});
test('native Queen attack emits only three direct hits, then physical drops and damaging pools',()=>{
  const m=make();tick(m,60,{special:true});assert.equal(m.projectiles.length,3);assert.equal(m.acidPoolsV152,undefined);
  tick(m,180);assert.equal(m.fighters[0].stats.specials,1);assert.equal(m.fighters[0].stats.hits,3);
  assert.ok(m.fighters[0].stats.acidTicksV152>0);assert.ok(m.acidPoolsV152.length<=3);assert.equal(m.projectiles.length,0);
});
test('projectile ground contact deposits on the swept impact coordinate, never at its overshoot',()=>{
  const m=make();m.projectiles.push({...shot(),id:++m.serial,x:1200,y:1,vx:600,vy:-240,direction:1,life:1,radiusV147:7,power:1});
  step(m,DT,{},{});assert.equal(m.acidPoolsV152.length,1);assert.equal(m.acidPoolsV152[0].x,1202.5);
});
test('an airborne range endpoint falls locally, with no horizontal range extension or immediate damage',()=>{
  const m=make();m.projectiles.push({...shot(),id:++m.serial,x:1200,y:100,vx:600,vy:0,direction:1,life:DT/2,radiusV147:7,power:1});
  step(m,DT,{},{});assert.equal(m.acidPoolsV152,undefined);assert.equal(m.acidDropsV152[0].x,1202.5);assert.equal(m.acidDropsV152[0].y,100);
});
test('expired projectiles and other acidic identities do not fabricate Queen pools',()=>{
  const m=make({playerId:'spitter'});m.projectiles.push({...shot(),id:++m.serial,x:1200,y:1,vx:600,vy:-240,direction:1,life:1,radiusV147:7,power:1});
  step(m,DT,{},{});assert.equal(m.acidPoolsV152,undefined);
  const dead=make();dead.projectiles.push({...shot(),id:++dead.serial,x:1200,y:1,vx:600,vy:-240,direction:1,life:0,radiusV147:7,power:1});
  step(dead,DT,{},{});assert.equal(dead.acidDropsV152,undefined);assert.equal(dead.acidPoolsV152,undefined);
});
test('simulation at 30, 60 and 120 Hz produces identical residue, damage and serials',()=>{
  const states=[30,60,120].map(rate=>{const m=make();for(let i=0;i<rate*5;i++)step(m,1/rate,{special:i<rate},{});return JSON.stringify(m);});
  assert.equal(states[0],states[1]);assert.equal(states[1],states[2]);
});
test('CPU reads a visible spill and issues an ordinary exit movement, without HP or position writes',()=>{
  const m=make();plant(m);const cpu=m.fighters[1],before=[cpu.hp,cpu.x,cpu.y];
  const direction=escape(m,cpu,bounds(cpu),arena);assert.ok([-1,1].includes(direction));
  const controls=brain(m,DT,attacks,()=>.5);assert.equal(controls[direction>0?'right':'left'],true);
  assert.equal(m.ai.state,'EVADE');assert.equal(controls.guard,false);assert.deepEqual([cpu.hp,cpu.x,cpu.y],before);
  tick(m,120,{},null);assert.ok(cpu.hp>=definition('warrior').hp-config.damage);assert.equal(escape(m,cpu,bounds(cpu),arena),0);
  const afterExit=cpu.hp;tick(m,80,{},null);assert.equal(cpu.hp,afterExit);
});
test('CPU chooses the available edge of a connected spill rather than retreating into a wall',()=>{
  const m=make();const cpu=m.fighters[1];cpu.x=arena.left;const b=bounds(cpu);
  plant(m,'player',arena.left);assert.equal(escape(m,cpu,b,arena),1);
  cpu.x=arena.right;plant(m,'player',arena.right);assert.equal(escape(m,cpu,bounds(cpu),arena),-1);
  assert.equal(escape(m,{...cpu,y:50},{...bounds(cpu),bottom:50},arena),0);
});
test('rendering is read-only, aligns the warning to actual pool bounds and keeps reduced-motion warnings',()=>{
  const m=make();const p=plant(m);tick(m,24);const frozen=JSON.stringify(m);
  function paint(reduced){const calls=[];const ctx=new Proxy({}, {get:(_,key)=>(...a)=>calls.push([key,...a]),set:()=>true});draw(ctx,m,arena,reduced);return calls;}
  const animated=paint(false),reduced=paint(true);
  for(const calls of [animated,reduced])assert.ok(calls.some(c=>c[0]==='strokeRect'&&c[1]===p.left&&c[2]===arena.floor-p.height&&c[3]===p.right-p.left));
  assert.ok(animated.some(c=>c[0]==='arc'));assert.ok(!reduced.some(c=>c[0]==='arc'));assert.equal(JSON.stringify(m),frozen);
});
test('normal Queen runtime displays actual residue and freezes it with its native pause',async()=>{
  const calls=[],ctx=new Proxy({measureText:s=>({width:String(s).length*7}),createLinearGradient:()=>({addColorStop(){}})}, {get:(o,k)=>o[k]??((...a)=>calls.push([k,...a]))});
  const win=new EventTarget(),doc=Object.assign(new EventTarget(),{hidden:false,hasFocus:()=>true});
  const canvas=Object.assign(new EventTarget(),{width:1000,height:560,setAttribute(){},getContext:()=>ctx,focus(){doc.activeElement=this;}});
  const frames=new Map();let serial=0,time=0;
  const r=runtime({canvas,window:win,document:doc,config:{playerId:Q,opponentId:'warrior',seed:152},loadImage:async()=>({naturalWidth:1024,naturalHeight:1024}),
    requestAnimationFrame:f=>{frames.set(++serial,f);return serial;},cancelAnimationFrame:i=>frames.delete(i)});
  const frame=()=>{time+=1000/120;const pending=[...frames.values()];frames.clear();pending.forEach(f=>f(time));};
  await r.start();while(r.getState().presentation.blocksSimulation)frame();r.setInput('special',true);
  let observed=false;for(let i=0;i<360;i++){frame();if(r.getState().acidPoolsV152?.length){observed=true;break;}}
  assert.equal(observed,true);assert.ok(calls.some(c=>c[0]==='strokeRect'&&c[2]===arena.floor-config.height));
  r.pause();const frozen=JSON.stringify(r.getState());for(let i=0;i<60;i++)frame();assert.equal(JSON.stringify(r.getState()),frozen);r.stop();assert.equal(frames.size,0);
});
test('pool terminal result settles once with the existing saved ticket and never persists residue',async()=>{
  const {beginXenoTrialsV96:begin,settleXenoTrialsV96:settle}=await import('../src/xeno-trials-progress-v96.js');
  const t=begin({schema:96,unlocked:[Q]},{playerId:Q,opponentId:'warrior'});assert.equal(t.applied,true);
  const m=create({...t.config,introSeconds:0,holdRoundTransition:true});
  while(m.phase!=='match-over'){m.fighters[1].hp=3;plant(m);tick(m,24);if(m.phase==='round-over')next(m);}
  const paid=settle(t.state,m.result);assert.equal(paid.applied,true);assert.equal(settle(paid.state,m.result).applied,false);
  assert.ok(!JSON.stringify(paid.state).includes('acidPoolsV152'));assert.equal(m.acidPoolsV152,undefined);
});
test('offline shell registers the exact module once and browser case observes real Queen pools',()=>{
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');assert.equal(sw.split("'/src/xeno-trials-acid-pools-v152.js'").length-1,1);
  const qa=readFileSync(new URL('./qa-xeno-trials-signatures-v147.py',import.meta.url),'utf8');assert.ok(qa.includes('queen-persistent-acid-v152.png'));assert.ok(qa.includes("frozen.get('acidPoolsV152') == still.get('acidPoolsV152')"));
});

test('CPU refuses a visible hazardous approach and resumes ordinary travel once the spill expires',()=>{
  const m=make(),cpu=m.fighters[1];cpu.x=1200;const box=bounds(cpu);plant(m,'player',box.left-54);
  const before=[cpu.hp,cpu.x,cpu.y];const wait=brain(m,DT,attacks,()=>.5);
  assert.equal(wait.left,false);assert.equal(wait.right,false);assert.equal(wait.jump,false);
  assert.equal(m.ai.state,'REPOSITION');assert.deepEqual([cpu.hp,cpu.x,cpu.y],before);
  m.tick=m.acidPoolsV152[0].expiresTick;m.ai.decisionIn=0;
  const resumed=brain(m,DT,attacks,()=>.5);assert.equal(resumed.left,true);
});
test('CPU ordinary air travel does not create a landing footprint inside a visible pool',()=>{
  const m=make(),cpu=m.fighters[1];cpu.x=1200;cpu.y=80;cpu.vy=-80;
  const box=bounds(cpu);plant(m,'player',box.left-54);
  const before=[cpu.hp,cpu.x,cpu.y,cpu.vy];const wait=brain(m,DT,attacks,()=>.5);
  assert.equal(wait.left,false);assert.equal(wait.right,false);assert.deepEqual([cpu.hp,cpu.x,cpu.y,cpu.vy],before);
});
test('the hazard height boundary and disabled-special rule remain authoritative',()=>{
  const m=make();plant(m);m.tick=24;const box=bounds(m.fighters[1]);let impacts=0;
  advance(m,DT,()=>({...box,bottom:config.height}),arena,()=>impacts++,()=>{});assert.equal(impacts,0);
  m.config.rulesV119.noSpecial=true;const frozen=JSON.stringify(m);
  advance(m,DT,bounds,arena,()=>impacts++,()=>{});assert.equal(impacts,0);assert.equal(JSON.stringify(m),frozen);
});
test('native six-projectile Queen super leaves tagged residue but cannot replenish its own meter',()=>{
  const m=make();m.fighters[0].superMeterV148=100;
  tick(m,240,{super:true});assert.equal(m.fighters[0].stats.supersV148,1);
  assert.equal(m.fighters[0].stats.hits,6);assert.ok(m.fighters[0].stats.acidTicksV152>0);
  assert.ok(m.acidPoolsV152.length>0 && m.acidPoolsV152.every(p=>p.superV148));
  assert.equal(m.fighters[0].superMeterV148,0);
});

test('V152 workbook records the exact new capability without closing animation or other roster tasks',async()=>{
  const root=new URL('../docs/forge/xeno-trials/',import.meta.url);
  const progress=JSON.parse(readFileSync(new URL('progress-v152.json',root)));
  assert.deepEqual(progress.rosterIds,roster.map(f=>f.id));assert.deepEqual(progress.pool,config);
  assert.equal(progress.approved1to1,0);assert.equal(progress.newCharacterAnimationClips,0);
  assert.equal(progress.behaviorTests,38);assert.equal(progress.documentTests,1);assert.equal(progress.testNames.length,38);
  const book=new URL(progress.workbook,root);
  assert.equal(createHash('sha256').update(readFileSync(book)).digest('hex'),progress.workbookSha256);
  const code=`import sys,zipfile,xml.etree.ElementTree as E
z=zipfile.ZipFile(sys.argv[1]);n={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
w=E.fromstring(z.read('xl/workbook.xml'));assert len(w.find('s:sheets',n))==7
r=E.fromstring(z.read('xl/worksheets/sheet1.xml'));cells={c.attrib['r']:c for c in r.findall('.//s:c',n)}
assert [float(cells['E'+str(i)].find('s:v',n).text) for i in range(7,15)]==[189,9,5,1,0,0,38,7]
assert all(cells['E'+str(i)].find('s:f',n) is not None for i in range(7,15))
for name in z.namelist():
 if name.startswith('xl/worksheets/sheet') and name.endswith('.xml'):
  r=E.fromstring(z.read(name));assert not any(c.attrib.get('t')=='e' for c in r.findall('.//s:c',n))
print('Workbook: seven sheets, eight verified formula counters, no error cells')`;
  const result=spawnSync('python3',['-c',code,decodeURIComponent(book.pathname)],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||result.stdout);
  const {isPublicDistributionPathV86:admitted}=await import('./verify-public-release-v86.mjs');
  for(const name of [progress.workbook,'progress-v152.json','V152-ACID-POOLS.md']){
    assert.equal(admitted('docs/forge/xeno-trials/'+name),true);assert.equal(admitted('docs/forge/xeno-trials/'+name,{built:true}),false);
  }
  assert.equal(admitted('docs/forge/xeno-trials/unreviewed-v152.xlsx'),false);
});
