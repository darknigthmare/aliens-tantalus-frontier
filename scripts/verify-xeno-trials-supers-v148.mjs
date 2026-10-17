import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { XENO_TRIALS_FIGHTERS_V96 as fighters, getXenoTrialsFighterV96 as definition } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96 as create, stepXenoTrialsMatchV96 as step, nextXenoTrialsRoundV96 as next,
  setXenoTrialsPausedV96 as pause, getXenoTrialsSnapshotV96 as snapshot, XENO_TRIALS_ATTACKS_V96 as base } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 as bounds } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsAttackV147 as spec, getXenoTrialsSignatureV147, XENO_TRIALS_SIGNATURE_SOURCES_V147 } from '../src/xeno-trials-signatures-v147.js';
import { getSynthTrialAttackV110 } from '../src/synth-combat-v110.js';
import { XENO_TRIALS_SUPERS_V148 as supers, getXenoTrialsSuperV148 as profile,
  getXenoTrialsSuperReadinessV148 as ready, getXenoTrialsSuperMeterV148 as meter,
  addXenoTrialsSuperMeterV148 as addMeter, awardXenoTrialsContactMeterV148 as award,
  getXenoTrialsSuperStatusV148 as label } from '../src/xeno-trials-supers-v148.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { XenoTrialsUiV96 } from '../src/xeno-trials-ui-v96.js';

// Pure-engine boundary fixtures can set position, HP or meter to isolate a
// contract. They are not represented as ordinary browser-playthrough evidence.
const [BRUTE, QUEEN, WARDEN, EXPLODER, HARBINGER] = supers.map(s => s.fighterId);
const tick = (m, seconds, a = {}, b = {}) => { for (let i = 0; i < Math.round(seconds * 120); i++) step(m, 1/120, a, b); return m; };
const make = (id = WARDEN, extra = {}) => create({ playerId:id, opponentId:'warrior', introSeconds:0, holdRoundTransition:true, seed:148, ...extra });
function close(m, gap = 4) {
  const [a,b] = m.fighters, aa=bounds(a), bb=bounds(b);
  b.x += aa.right + gap - bb.left;
}
function full(m, side = 0) { m.fighters[side].superMeterV148=100; return m; }
const count = (m, kind = 'super', side = 'player') => m.events.filter(e=>e.type==='attack'&&e.side===side&&e.kind===kind).length;
const projectiles = m => m.projectiles.filter(p=>p.superIdV148);

test('five immutable supers are original simulation extensions on exact fighter/profile pairs only', () => {
  assert.equal(supers.length,5); assert.equal(new Set(supers.map(s=>s.id)).size,5);
  for(const s of supers) {
    assert.ok(Object.isFrozen(s)&&Object.isFrozen(s.spec));
    assert.equal(profile(definition(s.fighterId)),s);
    assert.equal(profile({id:s.fighterId,profileId:'other'}),null);
    assert.equal(profile({id:`albino-${s.fighterId}`,profileId:s.profileId}),null);
    assert.equal(s.canonExact,false); assert.equal(s.animation,'existing-static-pose');
    assert.ok(s.evidence.startsWith('original-versus')); assert.ok(XENO_TRIALS_SIGNATURE_SOURCES_V147[s.sourceId]?.url);
    assert.equal(s.meterCost,100); assert.equal(s.spec.cost,48); assert.equal(s.spec.superV148,true);
    assert.equal(spec(definition(s.fighterId),'super',null),s.spec);
  }
});
test('the other 184 fighters retain all light/heavy/special contracts and gain no guessed super', () => {
  const others = fighters.filter(f=>!profile(f));assert.equal(others.length,184);
  for(const f of others) {
    assert.equal(spec(f,'super',base.special),null);
    for(const kind of ['light','heavy','special']) assert.equal(spec(f,kind,base[kind]),getSynthTrialAttackV110(f,kind,base[kind]));
    const m=make(f.id);tick(m,.1,{super:true});assert.equal(count(m),0);assert.equal(m.fighters[0].superMeterV148,undefined);
  }
  for(const f of [null,{}, {id:'constructor'},{id:WARDEN,profileId:null}])assert.equal(profile(f),null);
});
test('meter is finite and bounded and cannot be created on an unsupported actor', () => {
  for(const value of [undefined,null,NaN,Infinity,-Infinity,-10,101,10000]) {
    const f={superMeterV148:value};assert.ok(meter(f)>=0&&meter(f)<=100);addMeter(f,3.25);assert.ok(meter(f)>=0&&meter(f)<=100);
  }
  const f={};addMeter(f,99);assert.equal(f.superMeterV148,undefined);
  const a={superMeterV148:0},b={superMeterV148:0};
  for(const n of [0,-1,NaN,Infinity])award(a,b,n,false);assert.equal(meter(a),0);assert.equal(meter(b),0);
  award(a,b,20,false);assert.equal(meter(a),12);assert.equal(meter(b),8);
  award(a,b,10,true);assert.equal(meter(a),14);assert.equal(meter(b),12);
  award(a,b,20,false,true);assert.equal(meter(a),14);assert.equal(meter(b),20);
});
for(const s of supers) test(`${s.id}: initial empty meter, idle, misses and denied input are resource-neutral`, () => {
  const m=make(s.fighterId); const a=m.fighters[0];
  m.fighters[1].y=1000; m.fighters[1].vy=1000; // Unambiguously outside even the Queen's reach.
  assert.equal(meter(a),0);assert.equal(ready(m,a,definition(a.id)).reason,'meter');
  tick(m,.2,{super:true});assert.equal(count(m),0);assert.equal(a.stamina,100);
  tick(m,.5,{light:true});tick(m,1);assert.equal(a.stats.damage,0);assert.equal(meter(a),0);
  assert.equal(m.projectiles.length,0);
});
for(const s of supers) test(`${s.id}: one input consumes exactly one full meter and 48 endurance at acceptance`, () => {
  const m=full(make(s.fighterId)),a=m.fighters[0];
  assert.equal(ready(m,a,definition(a.id)).ready,true);
  step(m,1/120,{super:true},{});assert.equal(a.attack.kind,'super');assert.equal(a.stamina,52);
  assert.equal(meter(a),0);assert.equal(a.stats.supersV148,1);assert.equal(a.stats.specials,0);
  assert.equal(a.specialCooldown,3);assert.equal(count(m),1);
  assert.equal(m.events.find(e=>e.superIdV148)?.superIdV148,s.id);
  tick(m,.2,{super:true});assert.equal(count(m),1);assert.equal(a.stamina,52);
});
for(const condition of ['pause','inactive','rules','locked','airborne','guard','stun','cooldown','endurance'])test(`rejected super is not charged: ${condition}`, () => {
  const m=full(make()),a=m.fighters[0];
  if(condition==='pause')pause(m,true);
  if(condition==='inactive')m.phase='round-over';
  if(condition==='rules')m.config.rulesV119.noSpecial=true;
  if(condition==='locked')m.config.rulesV119.specialLockSeconds=20;
  if(condition==='airborne'){a.y=100;a.vy=0;}
  if(condition==='guard')a.guard=true;
  if(condition==='stun')a.stun=1;
  if(condition==='cooldown')a.specialCooldown=1;
  if(condition==='endurance')a.stamina=20;
  assert.equal(ready(m,a,definition(a.id)).ready,false);
  step(m,1/120,{super:true,...(condition==='guard'?{guard:true}:{})},{});
  assert.equal(count(m),0);assert.equal(meter(a),100);assert.ok(!a.attack);
});
test('holding an unready super does not trigger when contact fills the meter', () => {
  const m=make(),a=m.fighters[0];step(m,1/120,{super:true},{});a.superMeterV148=100;
  tick(m,.2,{super:true});assert.equal(count(m),0);tick(m,.02);tick(m,.02,{super:true});assert.equal(count(m),1);
});
test('both fighters must release a held super after the opening twenty-second restriction', () => {
  const m=make(WARDEN,{opponentId:WARDEN,rulesV119:{specialLockSeconds:20}});full(m);full(m,1);
  tick(m,20.2,{super:true},{super:true});assert.equal(count(m),0);assert.equal(count(m,'super','opponent'),0);
  tick(m,.02);tick(m,.02,{super:true},{super:true});assert.equal(count(m),1);assert.equal(count(m,'super','opponent'),1);
});
test('jump and guard take precedence over a grounded-only super pressed in the same frame', () => {
  for(const control of ['jump','guard']) {
    const m=full(make());step(m,1/120,{super:true,[control]:true},{});assert.equal(count(m),0);assert.equal(meter(m.fighters[0]),100);
  }
});
test('a full super takes precedence over simultaneous normal attack inputs without paying twice', () => {
  const m=full(make());step(m,1/120,{super:true,special:true,heavy:true,light:true},{});
  assert.equal(m.fighters[0].attack.kind,'super');assert.equal(m.fighters[0].stamina,52);assert.equal(m.fighters[0].stats.specials,0);
});
test('super cooldown also blocks the ordinary special, without refunding spent meter', () => {
  const m=full(make());tick(m,2.05,{super:true});tick(m,.02);tick(m,.1,{special:true});
  assert.equal(m.fighters[0].stats.specials,0);assert.equal(meter(m.fighters[0]),0);
  tick(m,1.1);tick(m,.02,{special:true});assert.equal(m.fighters[0].stats.specials,1);
});
test('ordinary contact and chip award only resolved HP loss; a defeated target cannot generate overkill hits', () => {
  for(const guarding of [false,true]) {
    const m=make(WARDEN,{opponentId:WARDEN});close(m);const [a,b]=m.fighters;
    tick(m,.12,{light:true},guarding?{guard:true}:{});
    const damage=a.stats.damage;assert.ok(damage>0);
    assert.equal(meter(a),Math.round(damage*(guarding?.2:.6)*100)/100);assert.equal(meter(b),Math.round(damage*.4*100)/100);
  }
  const m=full(make(QUEEN));close(m);m.fighters[1].hp=1;
  tick(m,1,{super:true});assert.equal(m.fighters[0].stats.hits,1);assert.equal(m.fighters[0].stats.damage,1);assert.equal(meter(m.fighters[0]),0);
});
test('Brute emits three separate paired waves, one maximum hit per pair and no extra volley', () => {
  const m=full(make(BRUTE));const ids=new Set(),groups=new Set();
  for(let i=0;i<145;i++){step(m,1/120,{super:true},{});for(const p of projectiles(m)){ids.add(p.id);groups.add(p.groupIdV147);}}
  assert.equal(ids.size,6);assert.equal(groups.size,3);assert.equal(m.fighters[0].attack.volleysV148,3);
  tick(m,1);assert.ok(m.fighters[0].stats.hits<=3);assert.equal(meter(m.fighters[0]),0);
});
for(const id of [QUEEN,WARDEN])test(`${id}: two volleys keep initial aim, each is finite and cannot fund its owner`, () => {
  const m=full(make(id));step(m,1/120,{super:true},{});const frozen={...m.fighters[0].attack.targetBodyV148};
  tick(m,.2);m.fighters[1].y=300;m.fighters[1].vy=1000;
  const seen=new Map();for(let i=0;i<130;i++){step(m,1/120,{},{});for(const p of projectiles(m))seen.set(p.id,{...p});}
  assert.equal(seen.size,id===QUEEN?6:2);const values=[...seen.values()];
  const directions=volley=>values.filter(p=>p.volleyV148===volley).map(p=>[p.vx,p.vy]);
  assert.deepEqual(directions(0),directions(1));assert.equal(meter(m.fighters[0]),0);
  assert.deepEqual(m.fighters[0].attack.targetBodyV148,frozen);
});
test('interrupting Brute stops future volleys, but does not delete a wave already emitted', () => {
  const m=full(make(BRUTE));tick(m,.68,{super:true});assert.equal(m.fighters[0].attack.volleysV148,1);
  close(m);m.fighters[1].y=60; // Counter from above the already-emitted ground front.
  tick(m,.12,{}, {light:true});assert.equal(m.fighters[0].attack,null);assert.ok(projectiles(m).length>0);
  assert.ok(projectiles(m).every(p=>p.volleyV148===0));tick(m,.4);assert.ok(projectiles(m).every(p=>p.volleyV148===0));
});
for(const id of [BRUTE,QUEEN,WARDEN,EXPLODER,HARBINGER])test(`${id}: ordinary early contact interrupts the super before activation`, () => {
  const m=full(make(id));close(m);tick(m,.13,{super:true},{light:true});
  assert.equal(m.fighters[0].attack,null);assert.equal(count(m),1);assert.equal(m.projectiles.length,0);
  assert.ok(m.fighters[0].hp>0);assert.ok(meter(m.fighters[0])<100);
});
test('Harbinger super traverses the physical arena with a locked direction and at most one hit', () => {
  const m=full(make(HARBINGER)),a=m.fighters[0],b=m.fighters[1];const x=a.x;
  tick(m,.55,{super:true});assert.ok(a.y>0&&a.x>x);assert.equal(a.attack.facing,1);
  b.x=100;tick(m,.3);assert.equal(a.attack.facing,1);assert.ok(a.x>x);assert.ok(a.stats.hits<=1);
  tick(m,1.5);assert.ok(a.x<=930);assert.equal(a.y,0);assert.equal(meter(a),0);
});
test('Exploder consumes itself even on a missed super and never turns a miss into a free recharge', () => {
  const m=full(make(EXPLODER));m.fighters[1].y=1000;m.fighters[1].vy=1000;
  tick(m,1.3,{super:true});assert.equal(m.fighters[0].hp,0);assert.equal(m.fighters[0].stats.damage,0);
  assert.equal(m.roundWinner,'opponent');assert.equal(meter(m.fighters[0]),0);assert.equal(count(m),1);
});
test('Exploder permits a real double KO and discards every projectile before the next round', () => {
  const m=full(make(EXPLODER));close(m);m.fighters[1].hp=100;
  tick(m,1.3,{super:true});assert.equal(m.roundReason,'double-ko');assert.equal(m.roundWinner,'draw');
  assert.equal(m.projectiles.length,0);assert.equal(next(m),true);assert.equal(m.projectiles.length,0);assert.equal(m.synthEffectsV110.length,0);
});
test('pause freezes an active volley, meter and cooldown and rejects next-round mutation', () => {
  const m=full(make(BRUTE));tick(m,.72,{super:true});pause(m,true);const frozen=snapshot(m);tick(m,2,{super:true});assert.deepEqual(snapshot(m),frozen);
  pause(m,false);tick(m,.6);assert.equal(m.fighters[0].attack.volleysV148,3);
  m.fighters[1].hp=0;step(m,1/120,{},{});pause(m,true);const round=snapshot(m);assert.equal(next(m),false);assert.deepEqual(snapshot(m),round);
});
test('earned meter carries across rounds but not into a new match; held super does not replay', () => {
  const m=make();m.fighters[0].superMeterV148=87;m.fighters[1].hp=0;step(m,1/120,{},{});
  assert.equal(next(m),true);assert.equal(meter(m.fighters[0]),87);assert.equal(meter(make().fighters[0]),0);
  m.fighters[0].superMeterV148=100;m.fighters[1].hp=0;
  step(m,1/120,{super:true},{});assert.equal(m.phase,'match-over');assert.equal(meter(m.fighters[0]),0);
  const done=snapshot(m);tick(m,1,{super:true});assert.deepEqual(snapshot(m),done);
});
for(const s of supers)test(`${s.id}: 30/60/120 Hz agree on accepted input, volleys and resolved damage`, () => {
  const states=[30,60,120].map(rate=>{
    const m=full(make(s.fighterId));for(let i=0;i<2*rate;i++)step(m,1/rate,{super:true},{});return snapshot(m);
  });assert.deepEqual(states[0],states[1]);assert.deepEqual(states[1],states[2]);
});
for(const s of supers)test(`${s.id}: CPU earns its own meter in a real deterministic fight, then uses its super`, () => {
  const m=create({playerId:'warrior',opponentId:s.fighterId,introSeconds:0,seed:96001,difficulty:'hard',roundSeconds:99,roundsToWin:3});
  for(let i=0;i<120*300&&!m.result;i++)step(m,1/120,{});
  assert.ok(m.result);assert.ok(m.fighters[1].stats.supersV148>0);assert.ok(m.fighters[1].stats.damage>0);
  assert.ok(meter(m.fighters[1])>=0&&meter(m.fighters[1])<=100);
});
test('full-meter CPU still respects the no-special restriction and never uses a hidden super', () => {
  for(const s of supers){const m=make('warrior',{opponentId:s.fighterId,rulesV119:{noSpecial:true},difficulty:'hard'});full(m,1);
    for(let i=0;i<120*10;i++)step(m,1/120,{});assert.equal(m.fighters[1].stats.supersV148,undefined);assert.equal(m.fighters[1].stats.specials,0);}
});

function target(extra={}){const events=new Map();return Object.assign({addEventListener(t,f){if(!events.has(t))events.set(t,new Set());events.get(t).add(f);},
 removeEventListener(t,f){events.get(t)?.delete(f);},emit(t,e={}){for(const f of [...(events.get(t)||[])])f({preventDefault(){},stopPropagation(){},...e});}},extra);}
function host(id=WARDEN){const text=[],queue=new Map();let serial=0,time=0;
 const ctx=new Proxy({fillText:t=>text.push(t),measureText:t=>({width:String(t).length*6}),createLinearGradient:()=>({addColorStop(){}})}, {get:(o,k)=>o[k]??(()=>{})});
 const win=target(),doc=target({hidden:false,hasFocus:()=>true}),root=target({contains:b=>b?.control===true});
 const canvas=target({tagName:'CANVAS',width:1000,height:560,getContext:()=>ctx,setAttribute(){},focus(){doc.activeElement=this;},closest:()=>null});doc.activeElement=canvas;
 const runtime=createXenoTrialsRuntimeV96({canvas,window:win,document:doc,controlsRoot:root,config:{playerId:id,opponentId:'warrior',seed:148,roundSeconds:99},
 loadImage:async()=>({naturalWidth:1024,naturalHeight:1024}),requestAnimationFrame:f=>{queue.set(++serial,f);return serial;},cancelAnimationFrame:n=>queue.delete(n)});
 const frame=()=>{time+=1000/120;const pending=[...queue.values()];queue.clear();pending.forEach(f=>f(time));};
 return {runtime,win,doc,root,canvas,frame,text,queue,async start(){await runtime.start();for(let i=0;i<1200&&runtime.getState().presentation.blocksSimulation;i++)frame();frame();}};
}
test('I, touch and keyboard button inputs use the same meter gate and cannot survive pause as a delayed super',async()=>{
 const h=host();await h.start();const button={control:true,getAttribute:()=> 'super',closest(){return this;},setPointerCapture(){},releasePointerCapture(){}};
 h.win.emit('keydown',{target:h.canvas,code:'KeyI'});h.frame();assert.equal(h.runtime.getState().fighters[0].previousInput.super,true);assert.equal(h.runtime.getState().fighters[0].stats.supersV148,undefined);
 h.runtime.pause();h.runtime.resume();h.frame();h.frame();assert.equal(h.runtime.getState().fighters[0].previousInput.super,false);
 h.win.emit('keyup',{target:h.canvas,code:'KeyI'});
 h.root.emit('pointerdown',{target:button,pointerId:1});h.frame();assert.equal(h.runtime.getState().fighters[0].previousInput.super,true);
 h.root.emit('pointerup',{target:button,pointerId:1});h.frame();assert.equal(h.runtime.getState().fighters[0].previousInput.super,false);
 h.root.emit('keydown',{target:button,code:'Enter',repeat:false});h.frame();assert.equal(h.runtime.getState().fighters[0].previousInput.super,true);
 h.root.emit('keyup',{target:button,code:'Enter'});h.frame();assert.equal(h.runtime.getState().fighters[0].previousInput.super,false);
 h.runtime.stop();assert.equal(h.queue.size,0);
});
test('snapshots and native canvas expose the correct meter without changing its simulation',async()=>{
 const h=host();await h.start();const state=h.runtime.getState();assert.equal(state.supersV148[0].id,profile(definition(WARDEN)).id);
 assert.equal(state.supersV148[0].meter,0);assert.equal(state.supersV148[1].supported,false);
 assert.ok(h.text.some(t=>t.startsWith('SUPER 0 / 100')));const before=h.runtime.getState();h.runtime.getState();assert.deepEqual(h.runtime.getState(),before);h.runtime.stop();
});
test('HTML meter and control are pilot-specific and rendering performs no resource transaction',()=>{
 const els=new Map(),makeEl=()=>({hidden:false,value:0,max:0,textContent:'',attrs:{},setAttribute(k,v){this.attrs[k]=v;},focus(){}});
 const el=k=>{if(!els.has(k))els.set(k,makeEl());return els.get(k);};const button=makeEl();
 const ui=Object.create(XenoTrialsUiV96.prototype);ui.el=el;ui.message=()=>{};ui.unsavedResult=null;
 ui.root={getAttribute:()=> 'false',setAttribute(){},querySelector:()=>button,ownerDocument:{hidden:false,hasFocus:()=>true}};
 for(const id of [WARDEN,'warrior']){const m=make(id),before=snapshot(m);ui.updateMatch(m);assert.equal(el('player-super').hidden,id==='warrior');assert.equal(button.hidden,id==='warrior');assert.deepEqual(snapshot(m),before);}
 const m=full(make());ui.updateMatch(m);assert.equal(el('player-super').value,100);assert.equal(button.attrs['aria-disabled'],'false');
 m.paused=true;ui.updateMatch(m);assert.equal(button.attrs['aria-disabled'],'true');assert.equal(meter(m.fighters[0]),100);
});
test('readiness labels distinguish cooldown, disabled rules, endurance and missing meter',()=>{
 const m=make(),a=m.fighters[0],d=definition(a.id);assert.match(label(ready(m,a,d)),/Jauge insuffisante/);
 full(m);a.stamina=20;assert.match(label(ready(m,a,d)),/Endurance insuffisante/);a.stamina=100;a.specialCooldown=1;
 assert.match(label(ready(m,a,d)),/Récupération/);m.config.rulesV119.noSpecial=true;assert.match(label(ready(m,a,d)),/Interdit/);
});
test('offline shell admits the new exact module once and reduced-motion QA targets a Page',()=>{
 const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');assert.equal(sw.split("'/src/xeno-trials-supers-v148.js'").length-1,1);
 const qa=readFileSync(new URL('./qa-xeno-trials-signatures-v147.py',import.meta.url),'utf8');assert.ok(qa.includes("page.emulate_media(reduced_motion='reduce')"));assert.ok(!qa.includes('context.emulate_media'));
});

test('V148 workbook and progress cover the live roster without certifying missing artwork',async()=>{
 const {createHash}=await import('node:crypto'),{spawnSync}=await import('node:child_process');
 const root=new URL('../docs/forge/xeno-trials/',import.meta.url),progress=JSON.parse(readFileSync(new URL('progress-v148.json',root)));
 assert.deepEqual(progress.rosterIds,fighters.map(f=>f.id));assert.equal(progress.approved1to1,0);assert.equal(progress.newCharacterAnimationClips,0);
 assert.equal(progress.behaviorTests,58);assert.equal(progress.documentTests,1);
 assert.deepEqual(progress.supers.map(({status,productionLotsV146,remaining,...s})=>s),supers);
 const book=new URL(progress.workbook,root);
 assert.equal(createHash('sha256').update(readFileSync(book)).digest('hex'),progress.workbookSha256);
 const code=`import sys,json,zipfile,xml.etree.ElementTree as E
z=zipfile.ZipFile(sys.argv[1]);n={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
w=E.fromstring(z.read('xl/workbook.xml'));assert len(w.find('s:sheets',n))==7
r=E.fromstring(z.read('xl/worksheets/sheet1.xml'));cells={c.attrib['r']:c for c in r.findall('.//s:c',n)}
assert [float(cells['E'+str(i)].find('s:v',n).text) for i in range(7,13)]==[189,5,184,0,0,35]
for name in z.namelist():
 if name.startswith('xl/worksheets/sheet') and name.endswith('.xml'):
  r=E.fromstring(z.read(name));assert not any(c.attrib.get('t')=='e' for c in r.findall('.//s:c',n))
print('Workbook: 7 sheets; six cached counters correct; no error cells')`;
 const result=spawnSync('python3',['-c',code,decodeURIComponent(book.pathname)],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr||result.stdout);
 const {isPublicDistributionPathV86}=await import('./verify-public-release-v86.mjs');
 for(const name of ['V148-SUPERS.md','progress-v148.json',progress.workbook]){
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials/'+name),true);
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials/'+name,{built:true}),false);
 }
});
