import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { XENO_TRIALS_FIGHTERS_V96 as fighters, XENO_TRIALS_STAGES_V96 as stages, getXenoTrialsFighterV96 as definition } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96 as create, stepXenoTrialsMatchV96 as step, nextXenoTrialsRoundV96 as next,
  setXenoTrialsPausedV96 as pause, XENO_TRIALS_ATTACKS_V96 as base, getXenoTrialsSnapshotV96 as snapshot } from '../src/xeno-trials-engine-v96.js';
import { getSynthTrialAttackV110 } from '../src/synth-combat-v110.js';
import { getXenoTrialsBodyBoundsV105 as bounds } from '../src/xeno-trials-geometry-v105.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { XENO_TRIALS_SIGNATURES_V147 as profiles, XENO_TRIALS_SIGNATURE_SOURCES_V147 as sources,
  getXenoTrialsSignatureV147 as signature, getXenoTrialsAttackV147 as spec,
  createXenoTrialsSignatureProjectilesV147 as emit, xenoTrialsSegmentContactV147 as contact } from '../src/xeno-trials-signatures-v147.js';
import { drawXenoTrialsStageMotionV147 as drawStage, getXenoTrialsStageMotionV147 as stageState } from '../src/xeno-trials-stage-motion-v147.js';
import { getXenoTrialsFighterSpecialLabelV147 as label } from '../src/xeno-trials-ui-v96.js';

const ids = Object.fromEntries(profiles.map(p => [p.style, p.fighterId]));
const tick = (m, seconds, a = {}, b = {}) => { for (let i = 0; i < Math.round(seconds * 120); i++) step(m, 1 / 120, a, b); return m; };
const match = (id, extra = {}) => create({ playerId: id, opponentId: 'warrior', introSeconds: 0, holdRoundTransition: true, seed: 147, ...extra });
function close(m) {
  const [a,b] = m.fighters, aa = bounds(a), bb = bounds(b);
  b.x += aa.right + 4 - bb.left;
}

test('five exact admitted identities have sourced, immutable and explicitly non-certified signatures', () => {
  assert.equal(profiles.length, 5);
  const progress = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/progress-v147.json', import.meta.url)));
  assert.deepEqual(progress.pilots.map(p => p.fighterId), profiles.map(p => p.fighterId));
  assert.equal(progress.approved1to1, 0); assert.equal(progress.newCharacterAnimationClips, 0);
  const sha = data => createHash('sha256').update(data).digest('hex');
  assert.equal(sha(readFileSync(new URL(`../docs/forge/xeno-trials/${progress.workbook}`, import.meta.url))), progress.workbookSha256);
  assert.equal(sha(readFileSync(new URL('../docs/forge/xeno-trials/xeno-trials-plan-v146.json', import.meta.url))), progress.planV146Sha256);

  for (const p of profiles) {
    assert.equal(definition(p.fighterId).id, p.fighterId);
    assert.equal(signature(definition(p.fighterId)), p);
    assert.equal(p.canonExact, false); assert.equal(p.animation, 'existing-static-pose');
    assert.ok(sources[p.sourceId]?.url.startsWith('https://'));
    assert.ok(Object.isFrozen(p) && Object.isFrozen(p.spec));
    for (const field of ['cost','damage','reach','startup','active','recovery','stun','cooldown']) assert.ok(p.spec[field] > 0);
    assert.equal(label(definition(p.fighterId)), p.label);
  }
});
test('all other 184 fighters retain each original attack contract; namesakes inherit nothing', () => {
  const other = fighters.filter(f => !signature(f)); assert.equal(other.length, 184);
  for (const f of other) for (const kind of ['light','heavy','special'])
    assert.equal(spec(f, kind, base[kind]), getSynthTrialAttackV110(f, kind, base[kind]), `${f.id}/${kind}`);
  for (const p of profiles) {
    assert.equal(signature({ id: p.fighterId, profileId: 'wrong' }), null);
    assert.equal(signature({ id: `albino-${p.fighterId}`, profileId: p.profileId }), null);
  }
  assert.equal(signature(definition('import-game-afe-synth-warden')), null);
  assert.equal(signature(definition('queen')), null);
});
for (const p of profiles) {
  test(`${p.id}: cost, signature identity and one press are authoritative`, () => {
    const m = match(p.fighterId), a = m.fighters[0];
    step(m, 1 / 120, { special: true }, {});
    assert.equal(a.stamina, 100 - p.spec.cost); assert.equal(a.stats.specials, 1);
    assert.equal(m.events.find(e => e.type === 'attack').signatureIdV147, p.id);
    tick(m, 4, { special: true }); assert.equal(a.stats.specials, 1);
  });
  test(`${p.id}: no-special, initial lock, air and pause never arm a deferred special`, () => {
    for (const rules of [{ noSpecial: true }, { specialLockSeconds: 20 }]) {
      const m = match(p.fighterId, { rulesV119: rules });
      tick(m, 3, { special: true });
      assert.equal(m.fighters[0].stats.specials, 0); assert.equal(m.projectiles.length, 0);
    }
    const airborne = match(p.fighterId);
    step(airborne, 1 / 120, { jump: true, special: true }, {});
    assert.equal(airborne.fighters[0].stats.specials, 0);
    const m = match(p.fighterId); pause(m, true); const before = snapshot(m);
    tick(m, 1, { special: true }); assert.deepEqual(snapshot(m), before);
  });
  test(`${p.id}: a physical light hit interrupts its windup without emission`, () => {
    const m = match(p.fighterId); close(m);
    tick(m, .8, { special: true }, { light: true });
    assert.ok(m.fighters[0].hp < definition(p.fighterId).hp);
    assert.ok(m.fighters[0].hp > 0); assert.equal(m.fighters[0].stats.hits, 0);
    assert.equal(m.projectiles.length, 0); assert.ok(!m.events.some(e => /detonation/.test(e.type)));
  });
  test(`${p.id}: deterministic at 30, 60 and 120 input frames per second`, () => {
    const results = [30,60,120].map(rate => {
      const m = match(p.fighterId);
      for (let frame = 0; frame < rate * 3; frame++) step(m, 1 / rate, { special: frame < rate }, {});
      return snapshot(m);
    });
    assert.deepEqual(results[0], results[1]); assert.deepEqual(results[1], results[2]);
  });
  test(`${p.id}: actual AI uses the signature and switches to legal melee without specials`, () => {
    const m = match('warrior', { opponentId: p.fighterId, difficulty: 'hard' });
    for (let i = 0; i < 2400 && m.phase === 'active'; i++) step(m, 1 / 120, {}, null);
    assert.ok(m.fighters[1].stats.specials > 0); assert.ok(m.fighters[1].stats.hits > 0);
    const restricted = match('warrior', { opponentId: p.fighterId, difficulty: 'hard', rulesV119: { noSpecial: true } });
    for (let i = 0; i < 2400 && restricted.phase === 'active'; i++) step(restricted, 1 / 120, {}, null);
    assert.equal(restricted.fighters[1].stats.specials, 0); assert.ok(restricted.fighters[1].stats.hits > 0);
  });
}
test('Brute ground impact sends two finite ground fronts without becoming a charging ram', () => {
  const m = match(ids['ground-wave']), x = m.fighters[0].x;
  tick(m, .5, { special: true });
  assert.equal(m.projectiles.length, 2); assert.deepEqual(m.projectiles.map(p => p.direction), [-1,1]);
  assert.ok(m.projectiles.every(p => p.style === 'ground-wave' && p.y === 10));
  assert.equal(m.fighters[0].x, x);
  tick(m, .7); assert.equal(m.fighters[0].stats.hits, 1); assert.equal(m.projectiles.length, 0);
});
test('jumping over the Brute wave avoids damage; moving out of range also avoids it', () => {
  const m = match(ids['ground-wave']); tick(m, .5, { special: true });
  tick(m, .7, {}, { jump: true }); assert.equal(m.fighters[1].hp, definition('warrior').hp);
  const distant = match(ids['ground-wave']); distant.fighters[1].x = 1700;
  tick(distant, 2, { special: true }); assert.equal(distant.fighters[0].stats.hits, 0); assert.equal(distant.projectiles.length, 0);
});
test('Queen acid is a three-projectile fan with no homing; Warden emits only one aimed shot', () => {
  for (const [style,count] of [['acid-cluster',3], ['aimed-acid',1]]) {
    const m = match(ids[style]), [a,b] = m.fighters; const p = signature(definition(a.id));
    const bullets = emit(p,a,bounds(a),bounds(b),{ id:10, facing:1 });
    assert.equal(bullets.length, count);
    for (const bullet of bullets) { assert.ok(bullet.vx > 0); assert.ok(bullet.vy < 0); assert.equal(bullet.target, undefined); }
    const before = JSON.stringify(bullets); b.x += 500; assert.equal(JSON.stringify(bullets), before); b.x -= 500;
    tick(m, 2, { special: true }); assert.equal(m.fighters[0].stats.hits, count);
  }
});
test('swept diagonal projectiles reject false corner contacts, detect thin targets and reject malformed boxes', () => {
  const box = { left:0,right:10,bottom:0,top:10 };
  assert.equal(contact(-5,8,8,21,box), null);
  assert.equal(contact(-100,5,100,5,box), .5);
  assert.equal(contact(5,5,5,5,box), 0);
  assert.equal(contact(5,20,5,20,box), null);
  assert.equal(contact(0,0,10,10,{ left:NaN,right:10,bottom:0,top:10 }), null);
  assert.equal(contact(0,0,10,10,box,-1), null);
});
test('Exploder detonation consumes its body on a miss and permits a real double KO', () => {
  const miss = match(ids.detonation); miss.fighters[1].x = 1700;
  tick(miss, 1.2, { special:true });
  assert.equal(miss.fighters[0].hp, 0); assert.equal(miss.fighters[1].hp, definition('warrior').hp);
  assert.equal(miss.roundWinner, 'opponent'); assert.equal(miss.events.filter(e => e.type === 'xeno-detonation').length,1);
  const tie = match(ids.detonation, { rulesV119: { initialHp:1 } }); close(tie);
  tick(tie, 1.2, { special:true }); assert.equal(tie.roundWinner,'draw'); assert.equal(tie.roundReason,'double-ko');
});
test('Harbinger really leaves the floor, keeps locked facing and lands without a second hit', () => {
  const m = match(ids.leap); tick(m, .5, { special:true });
  assert.ok(m.fighters[0].y > 0); assert.equal(m.fighters[0].attack.facing,1);
  tick(m,1.5); assert.equal(m.fighters[0].y,0); assert.equal(m.fighters[0].vy,0);
  assert.equal(m.fighters[0].stats.hits,1);
});
test('ordinary Warden heavy stagger is not falsely labelled as a broken guard', () => {
  const m = match(ids['aimed-acid']); close(m);
  tick(m,.34,{heavy:true}); assert.ok(m.fighters[1].stun > .4); assert.equal(m.fighters[1].guardBrokenV147,false);
  const guarded = match(ids['aimed-acid']); close(guarded); guarded.fighters[1].stamina=10;
  tick(guarded,.34,{heavy:true},{guard:true}); assert.equal(guarded.fighters[1].guardBrokenV147,true);
  tick(guarded,1); assert.equal(guarded.fighters[1].guardBrokenV147,false);
});
test('new projectiles freeze on pause, clear at a result and cannot leak into the next round', () => {
  const m = match(ids['ground-wave']); tick(m,.5,{special:true}); const before = snapshot(m);
  pause(m,true); tick(m,2); assert.deepEqual(m.projectiles,before.projectiles); pause(m,false);
  tick(m,.7); m.fighters[1].hp=0; step(m,1/120,{},{});
  assert.equal(m.phase,'round-over'); assert.equal(m.projectiles.length,0); assert.equal(next(m),true);
  assert.equal(m.round,2); assert.equal(m.projectiles.length,0); assert.ok(m.fighters.every(f=>f.hp>0 && !f.attack));
  const explosion = match(ids.detonation); tick(explosion,1.2,{special:true});
  assert.ok(explosion.synthEffectsV110.length); assert.equal(next(explosion),true);
  assert.equal(explosion.synthEffectsV110.length,0);
});

function context() {
  const calls = [];
  const ctx = new Proxy({ calls, measureText: text => ({width:String(text).length*6}),
    createLinearGradient: () => ({addColorStop(){}}), createRadialGradient: () => ({addColorStop(){}}) },
    { get: (object,key) => object[key] ?? ((...args) => calls.push([key,...args])) });
  return ctx;
}
for (const stage of stages) test(`${stage.id}: deterministic distinct scenery, frozen with reduced motion, no state mutation`, () => {
  const camera = { floor:450, center:500 }, original=JSON.stringify([stage,camera]);
  const a=context(),b=context(),c=context(),d=context();
  drawStage(a,stage,camera,120); drawStage(b,stage,camera,240);
  assert.notDeepEqual(a.calls,b.calls);
  drawStage(c,stage,camera,120,true); drawStage(d,stage,camera,240,true); assert.deepEqual(c.calls,d.calls);
  assert.equal(JSON.stringify([stage,camera]),original); assert.equal(stageState(stage.id,120).affectsCombat,false);
});
test('unknown scenery and invalid clocks do not invent arena content', () => {
  assert.equal(stageState('constructor',100).kind,null); assert.equal(stageState(stages[0].id,NaN).time,0);
  assert.equal(new Set(stages.map(s=>stageState(s.id).kind)).size,6);
});

function target(extra={}) {
  const events=new Map(); return Object.assign({addEventListener(t,f){if(!events.has(t))events.set(t,new Set());events.get(t).add(f);},
    removeEventListener(t,f){events.get(t)?.delete(f);}, emit(t,e={}){for(const f of events.get(t)||[])f({preventDefault(){},...e});}},extra);
}
function host(playerId) {
  const ctx=context(), doc=target({hidden:false,hasFocus:()=>true}), win=target(), queue=new Map(); let serial=0,time=0;
  const canvas=target({tagName:'CANVAS',width:1000,height:560,getContext:()=>ctx,setAttribute(){},focus(){doc.activeElement=this;},closest:()=>null});
  doc.activeElement=canvas;
  const runtime=createXenoTrialsRuntimeV96({canvas,window:win,document:doc,config:{playerId,opponentId:'warrior',seed:147},
    loadImage:async()=>({naturalWidth:1024,naturalHeight:1024}),
    requestAnimationFrame:f=>{queue.set(++serial,f);return serial;}, cancelAnimationFrame:id=>queue.delete(id)});
  const frame=()=>{time+=1000/120;const callbacks=[...queue.values()];queue.clear();callbacks.forEach(f=>f(time));};
  return {runtime,ctx,win,canvas,frame, async start(){await runtime.start();for(let i=0;i<1200 && runtime.getState().presentation.blocksSimulation;i++)frame();frame();},
    key(code){win.emit('keydown',{code,target:canvas});}};
}
test('runtime uses the real shield active window, not the generic .29-second special timing', async () => {
  const h=host('synth-containment'); await h.start(); h.key('KeyL');
  for(let i=0;i<30;i++){h.ctx.calls.length=0;h.frame();const attack=h.runtime.getState().fighters[0].attack;
    if(attack?.age>=.17 && attack.age<.22){assert.ok(h.ctx.calls.some(c=>c[0]==='quadraticCurveTo'));h.runtime.stop();return;}}
  h.runtime.stop(); assert.fail('The shield active window was not observed');
});
test('runtime shows signature anticipation and no imaginary melee slash for a ranged acid cast', async () => {
  const h=host(ids['aimed-acid']); await h.start(); h.key('KeyL');
  let anticipation=false, emission=false;
  for(let i=0;i<80;i++) { h.ctx.calls.length=0; h.frame();const state=h.runtime.getState();
    if(h.ctx.calls.some(c=>c[0]==='fillText' && c[1]==='PROJECTION ACIDE'))anticipation=true;
    if(state.projectiles.length){emission=true;assert.ok(!h.ctx.calls.some(c=>c[0]==='quadraticCurveTo'));break;}}
  assert.equal(anticipation,true);assert.equal(emission,true);
  const state=h.runtime.getState();assert.equal(state.combatSignaturesV147[0].id,'afe2-warden-acid');
  h.runtime.pause();const frozen=h.runtime.getState().stageAnimationV147;for(let i=0;i<30;i++)h.frame();
  assert.deepEqual(h.runtime.getState().stageAnimationV147,frozen);h.runtime.stop();
});
