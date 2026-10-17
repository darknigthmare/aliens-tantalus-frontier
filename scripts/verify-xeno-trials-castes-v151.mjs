import test from 'node:test';
import assert from 'node:assert/strict';
import { XENO_TRIALS_FIGHTERS_V96 as fighters, getXenoTrialsFighterV96 as definition } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_CASTES_V151 as castes, XENO_TRIALS_CASTE_SOURCES_V151 as sources, getXenoTrialsCasteV151 as caste } from '../src/xeno-trials-castes-v151.js';
import { getXenoTrialsSignatureV147 as signature, getXenoTrialsAttackV147 as spec, getXenoTrialsSpecialStyleV147 as style } from '../src/xeno-trials-signatures-v147.js';
import { createXenoTrialsMatchV96 as create, stepXenoTrialsMatchV96 as step, nextXenoTrialsRoundV96 as next, setXenoTrialsPausedV96 as pause, XENO_TRIALS_ATTACKS_V96 as base } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsSuperV148 as superProfile } from '../src/xeno-trials-supers-v148.js';
import { getXenoTrialsBodyBoundsV105 as bounds, resolveXenoTrialsBodiesV105 as resolve } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsAIProfileV119 as aiProfile } from '../src/xeno-trials-ai-v119.js';
import { createXenoTrialsRuntimeV96 as runtime } from '../src/xeno-trials-runtime-v96.js';
import { getXenoTrialsFighterSpecialLabelV147 as label } from '../src/xeno-trials-ui-v96.js';

// Unit boundary fixtures control HP/positions to isolate collision and KO order.
// These are NOT a normal browser playthrough or new articulated artwork.
const DT=1/120, ids=Object.fromEntries(castes.map(c=>[c.style,c.fighterId]));
const make=(id,extra={})=>create({playerId:id,opponentId:'warrior',introSeconds:0,holdRoundTransition:true,seed:151,...extra});
const tick=(m,s,a={},b={})=>{for(let i=0;i<Math.round(s*120);i++)step(m,DT,a,b);return m;};
const copy=m=>JSON.parse(JSON.stringify(m));
function close(m,gap=4) {const[a,b]=m.fighters,aa=bounds(a),bb=bounds(b);b.x+=aa.right+gap-bb.left;resolve(a,b,1);}
const bursts=m=>m.events.filter(e=>e.type==='burster-death-v151');

test('four explicit Fireteam identities are separate from film, ACM and invented variants',()=>{
  assert.equal(castes.length,4); assert.equal(new Set(castes.map(c=>c.fighterId)).size,4);
  for(const c of castes) {
    assert.equal(definition(c.fighterId).profileId,c.profileId); assert.equal(caste(definition(c.fighterId)),c);
    assert.equal(signature(definition(c.fighterId)),c); assert.equal(spec(definition(c.fighterId),'special',base.special),c.spec);
    assert.equal(label(definition(c.fighterId)),c.label);assert.equal(style(definition(c.fighterId)),c.style);
    assert.ok(Object.isFrozen(c)&&Object.isFrozen(c.spec));assert.equal(c.canonExact,false);
    assert.equal(c.animation,'existing-static-pose');assert.equal(sources[c.sourceId].directAccess,'blocked');
    assert.equal(superProfile(definition(c.fighterId)),null);
    assert.equal(caste({...definition(c.fighterId),profileId:'wrong'}),null);
    assert.equal(caste({...definition(c.fighterId),id:'albino-'+c.fighterId}),null);
  }
  for(const id of ['runner','spitter','drive-v123-afe-prowler','drive-v123-afe-burster','albino-burster','cryo-burster','acid-burster'])
    assert.equal(caste(definition(id)),null,id);
  assert.equal(fighters.filter(f=>signature(f)).length,9);
});
for(const c of castes) {
  test(`${c.id}: exact action, cost, cooldown and held trigger`,()=>{
    const m=make(c.fighterId),f=m.fighters[0];step(m,DT,{special:true},{});
    assert.equal(f.attack.kind,'special');assert.equal(f.stamina,100-c.spec.cost);assert.equal(f.stats.specials,1);
    assert.equal(f.specialCooldown,c.spec.cooldown);assert.equal(m.events.at(-1).signatureIdV147,c.id);
    tick(m,4,{special:true});assert.equal(f.stats.specials,1);
  });
  test(`${c.id}: no-special, airborne and pause retain real admission`,()=>{
    const forbidden=make(c.fighterId,{rulesV119:{noSpecial:true}});tick(forbidden,1,{special:true});assert.equal(forbidden.fighters[0].attack,null);
    const air=make(c.fighterId);step(air,DT,{jump:true,special:true},{});assert.equal(air.fighters[0].attack,null);
    const m=make(c.fighterId);pause(m,true);const frozen=copy(m);tick(m,1,{special:true});assert.deepEqual(copy(m),frozen);
  });
  test(`${c.id}: initial lock requires release on both sides`,()=>{
    for(const side of [0,1]) {
      const m=make(c.fighterId,{opponentId:c.fighterId,rulesV119:{specialLockSeconds:20}}),held={special:true};
      step(m,DT,side===0?held:{},side===1?held:{});m.timeRemaining=m.config.roundSeconds-21;
      step(m,DT,side===0?held:{},side===1?held:{});assert.equal(m.fighters[side].attack,null);
      step(m,DT,{},{});step(m,DT,side===0?held:{},side===1?held:{});assert.equal(m.fighters[side].attack.kind,'special');
    }
  });
  test(`${c.id}: real contact interrupts preparation without a refunded charge`,()=>{
    const m=make(c.fighterId);close(m);tick(m,.22,{special:true},{light:true});
    assert.ok(m.fighters[0].hp<definition(c.fighterId).hp);assert.equal(m.fighters[0].attack,null);
    assert.equal(m.fighters[0].stats.hits,0);assert.equal(m.fighters[0].stats.specials,1);assert.ok(m.fighters[0].stamina<100);assert.equal(m.projectiles.length,0);
  });
  test(`${c.id}: identical serialization at 30/60/120 Hz`,()=>{
    const states=[30,60,120].map(rate=>{const m=make(c.fighterId);for(let i=0;i<rate*3;i++)step(m,1/rate,{special:i<rate},{});return copy(m);});
    assert.deepEqual(states[0],states[1]);assert.deepEqual(states[1],states[2]);
  });
  test(`${c.id}: CPU uses the new signature without changing statistics or resources directly`,()=>{
    const m=make('warrior',{opponentId:c.fighterId,difficulty:'hard',roundSeconds:120});let seen=false;
    for(let i=0;i<120*45 && m.phase!=='match-over';i++) {step(m,DT,{});if(m.events.some(e=>e.signatureIdV147===c.id&&e.side==='opponent')){seen=true;break;}}
    assert.ok(seen,c.id);assert.ok(m.fighters[1].stamina<100);assert.ok(m.fighters[1].stats.specials>0);
  });
}
test('Prowler leaves the floor, locks direction and deals no more than one leap contact',()=>{
  const m=make('prowler');close(m,70);const a=m.fighters[0],start=a.x;tick(m,.5,{special:true});
  assert.ok(a.y>0);assert.ok(a.x>start);assert.equal(a.attack.facing,1);
  tick(m,.8);assert.ok(a.stats.hits<=1);assert.equal(m.projectiles.length,0);
});
test('Runner tail sweep has no ram displacement and misses a target above its actual low arc',()=>{
  const m=make(ids['tail-sweep']);close(m,35);const x=m.fighters[0].x;tick(m,.42,{special:true});
  assert.ok(m.fighters[0].stats.hits===1);assert.equal(m.fighters[0].x,x);
  const jump=make(ids['tail-sweep']);close(jump,35);tick(jump,.42,{special:true},{jump:true});
  assert.equal(jump.fighters[0].stats.hits,0);assert.ok(jump.fighters[1].y>bounds(jump.fighters[0]).height);
});
test('AFE Spitter emits one adjusted shot that keeps its velocity when the enemy moves',()=>{
  const m=make(ids['aimed-acid']);tick(m,.46,{special:true},{jump:true});assert.equal(m.projectiles.length,1);
  const p=m.projectiles[0],velocity=[p.vx,p.vy];assert.ok(p.vy>0);const count=m.fighters[0].stats.specials;
  m.fighters[1].x+=70;step(m,DT,{},{});assert.deepEqual([p.vx,p.vy],velocity);
  assert.equal(p.signatureIdV147,'fte-spitter-aimed-acid');assert.equal(m.fighters[0].stats.specials,count);
});
test('Burster attacks in contact instead of firing a Spitter projectile',()=>{
  const m=make('burster');close(m,65);tick(m,.6,{special:true});assert.equal(m.projectiles.length,0);
  assert.equal(m.fighters[0].stats.hits,1);assert.ok(m.fighters[0].hp>0);assert.equal(bursts(m).length,0);
});
for(const scenario of ['near','far','air','guard','no-special','already-dead']) test(`Burster death: ${scenario}`,()=>{
  const m=make('burster',{rulesV119:scenario==='no-special'?{noSpecial:true}:{}});close(m);
  const [a,b]=m.fighters;a.hp=scenario==='already-dead'?0:1;
  // One pre-existing physical projectile supplies the fatal contact, allowing
  // the victim to stand far/above without fabricating a remote melee hit.
  if(scenario==='far') b.x=900;
  if(scenario==='air') {b.y=400;b.vy=0;}
  if(scenario==='guard') b.stamina=100;
  const body=bounds(a);
  m.projectiles.push({id:++m.serial,owner:'opponent',x:body.right+1,y:body.bottom+body.height*.5,
    direction:-1,life:1,spec:base.light,power:1,style:'pulse'});
  const old=b.hp;step(m,DT,{},scenario==='guard'?{guard:true}:{});
  const active=!['no-special','already-dead'].includes(scenario);
  assert.equal(bursts(m).length,Number(active));assert.equal(Boolean(a.deathBurstV151),active);
  const hit=['near','guard'].includes(scenario);assert.equal(b.hp,old-(hit?42:0));
  assert.equal(m.projectiles.length,0);assert.equal(m.phase,'round-over');
  const hp=b.hp;tick(m,.5);assert.equal(b.hp,hp);assert.equal(bursts(m).length,Number(active));
  next(m);assert.equal(m.fighters[0].deathBurstV151,undefined);assert.equal(m.synthEffectsV110.length,0);
});
test('Burster death retaliation is resolved before verdict and may turn a kill into double KO',()=>{
  const m=make('burster');close(m);m.fighters[0].hp=1;m.fighters[1].hp=30;
  tick(m,.15,{}, {light:true});assert.equal(m.roundReason,'double-ko');assert.equal(m.roundWinner,'draw');
  assert.deepEqual(m.wins,{player:0,opponent:0});assert.equal(m.fighters[0].stats.damage,30);
  assert.equal(m.fighters[1].stats.damage,1);assert.equal(bursts(m).length,1);
});
test('simultaneous Burster deaths are bounded once per actor with no overkill stats',()=>{
  const m=make('burster',{opponentId:'burster'});close(m);for(const f of m.fighters)f.hp=1;
  tick(m,.15,{light:true},{light:true});assert.equal(m.roundReason,'double-ko');assert.equal(bursts(m).length,2);
  assert.equal(m.fighters[0].stats.damage,1);assert.equal(m.fighters[1].stats.damage,1);
});
test('a Burster killed by the other death burst still emits once before the result',()=>{
  const m=make('burster',{opponentId:'burster'});close(m);m.fighters[0].hp=1;m.fighters[1].hp=35;
  tick(m,.15,{}, {light:true});assert.equal(m.roundReason,'double-ko');assert.equal(bursts(m).length,2);
  assert.equal(m.fighters[0].stats.damage,35);assert.equal(m.fighters[1].stats.damage,1);
});
test('ranged AI maximum range is bounded by the actually admitted projectile reach',()=>{
  assert.equal(aiProfile(definition(ids['aimed-acid'])).maximumRange,540);
  assert.equal(aiProfile(definition('burster')).ranged,false);
});

function host(id) {
  const target=(extra={})=>{const events=new Map();return Object.assign({addEventListener(t,f){if(!events.has(t))events.set(t,new Set());events.get(t).add(f);},removeEventListener(t,f){events.get(t)?.delete(f);},emit(t,e={}){for(const f of events.get(t)||[])f({preventDefault(){},...e});}},extra);};
  const calls=[],ctx=new Proxy({measureText:s=>({width:String(s).length*6}),createLinearGradient:()=>({addColorStop(){}})}, {get:(o,k)=>o[k]??((...args)=>calls.push([k,...args]))});
  const doc=target({hidden:false,hasFocus:()=>true}),win=target(),queue=new Map();let serial=0,time=0;
  const canvas=target({tagName:'CANVAS',width:1000,height:560,getContext:()=>ctx,setAttribute(){},focus(){doc.activeElement=this;},closest:()=>null});doc.activeElement=canvas;
  const r=runtime({canvas,window:win,document:doc,config:{playerId:id,opponentId:'warrior',seed:151},
    loadImage:async()=>({naturalWidth:1024,naturalHeight:1024}),requestAnimationFrame:f=>{queue.set(++serial,f);return serial;},cancelAnimationFrame:n=>queue.delete(n)});
  const frame=()=>{time+=1000/120;const fs=[...queue.values()];queue.clear();fs.forEach(f=>f(time));};
  return {r,calls,frame,win,canvas,async start(){await r.start();for(let i=0;i<1200&&r.getState().presentation.blocksSimulation;i++)frame();frame();}};
}
for(const c of castes)test(`${c.id}: production renderer and snapshot present the exact action and freeze on pause`,async()=>{
  const h=host(c.fighterId);await h.start();h.win.emit('keydown',{code:'KeyL',target:h.canvas});h.frame();
  assert.equal(h.r.getState().combatSignaturesV147[0].id,c.id);
  assert.ok(h.calls.some(c0=>c0[0]==='fillText'&&c0[1]===c.label.toUpperCase()));
  h.r.pause();const frozen=h.r.getState();for(let i=0;i<30;i++)h.frame();assert.deepEqual(h.r.getState(),frozen);h.r.stop();
});
test('terminal Burster damage settles once through the existing saved match ticket',async()=>{
  const {beginXenoTrialsV96:begin,settleXenoTrialsV96:settle}=await import('../src/xeno-trials-progress-v96.js');
  const transaction=begin({schema:96,unlocked:['burster']},{playerId:'burster',opponentId:'warrior'});
  assert.equal(transaction.applied,true);
  const m=create({...transaction.config,introSeconds:0,holdRoundTransition:true});
  for(let round=0;round<5;round++) {
    step(m,DT,{},{}); // A new physical press, not the held input from the prior round.
    close(m);m.fighters[0].hp=1;m.fighters[1].hp=30;
    tick(m,.2,{}, {light:true});assert.equal(m.roundReason,'double-ko');
    if(m.phase==='round-over')next(m);
  }
  assert.equal(m.phase,'match-over');assert.equal(m.result.winner,'draw');
  const paid=settle(transaction.state,m.result);assert.equal(paid.applied,true);assert.equal(paid.receipt.credits,25);
  assert.equal(settle(paid.state,m.result).applied,false);assert.equal(m.projectiles.length,0);
});

test('V151 workbook and progress retain exact roster, open art work and source-only distribution', async()=>{
  const {readFileSync}=await import('node:fs'),{createHash}=await import('node:crypto'),{spawnSync}=await import('node:child_process');
  const root=new URL('../docs/forge/xeno-trials/',import.meta.url),p=JSON.parse(readFileSync(new URL('progress-v151.json',root)));
  assert.deepEqual(p.rosterIds,fighters.map(f=>f.id));assert.deepEqual(p.castes,castes);assert.deepEqual(p.sources,sources);
  assert.equal(p.behaviorTests,44);assert.equal(p.documentTests,1);assert.equal(p.testNames.length,44);
  assert.equal(p.approved1to1,0);assert.equal(p.newCharacterAnimationClips,0);assert.equal(p.newSupers,0);
  assert.equal(p.cumulativeSignatureCount,9);assert.equal(p.unchangedAttackContracts,180);
  const file=new URL(p.workbook,root);assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),p.workbookSha256);
  const code=`import sys,zipfile,xml.etree.ElementTree as E
z=zipfile.ZipFile(sys.argv[1]);ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
w=E.fromstring(z.read('xl/workbook.xml'));assert len(w.find('s:sheets',ns))==7
r=E.fromstring(z.read('xl/worksheets/sheet1.xml'));cs={c.attrib['r']:c for c in r.findall('.//s:c',ns)}
assert [float(cs['E'+str(i)].find('s:v',ns).text) for i in range(7,15)]==[189,4,9,5,0,0,44,28]
assert all(cs['E'+str(i)].find('s:f',ns) is not None for i in range(7,15))
for name in z.namelist():
 if name.startswith('xl/worksheets/sheet') and name.endswith('.xml'):
  assert not any(c.attrib.get('t')=='e' for c in E.fromstring(z.read(name)).findall('.//s:c',ns))
print('V151: seven sheets, eight correct cached formula counters, no spreadsheet errors')`;
  const r=spawnSync('python3',['-c',code,decodeURIComponent(file.pathname)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr||r.stdout);
  const {isPublicDistributionPathV86:allowed}=await import('./verify-public-release-v86.mjs');
  for(const n of [p.workbook,'progress-v151.json','V151-FIRETEAM-CASTES.md']) {
    assert.equal(allowed(`docs/forge/xeno-trials/${n}`),true);assert.equal(allowed(`docs/forge/xeno-trials/${n}`,{built:true}),false);
  }
  assert.equal(allowed('docs/forge/xeno-trials/unreviewed-v151.xlsx'),false);
});
