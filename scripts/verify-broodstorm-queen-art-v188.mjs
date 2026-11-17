// Real production engine, full application catalogue and native chapter builder.
// DOM/RAF/Image delivery are declared doubles; image sizes and hashes come from
// the shipped PNGs. Draw commands are measured, not rasterized. Stage setup is
// a declared encounter fixture; it is not a completed browser campaign.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { host, prepare, tick } from './engine-host-v188.mjs';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content.js';
import { buildLegacyMissionV131, LEGACY_CAMPAIGNS_V131 } from '../src/legacy-operations-v131.js';
import { getAnimationEntityKeyV57 } from '../src/game-v52-runtime.js';
import { resolveEnemyAnimation, resolveSpriteSheet, resolveSpriteClip } from '../src/sprite-animation-runtime.js';
import { createDrawMeasureContextV188 } from '../src/creature-scale-v188.js';
import { BROODSTORM_QUEEN_ART_IDS_V188 as IDS, BROODSTORM_QUEEN_ART_V188 as ART,
  BROODSTORM_QUEEN_ART_FRAMES_V188 as FRAMES, BROODSTORM_QUEEN_PLACEMENT_V188 as PLACEMENT,
  broodstormQueenArtReadyV188, broodstormQueenSourceReadyV188, broodstormQueenFrameFitV188,
  broodstormQueenVisualBoundsV188, isBroodstormQueenArtOwnerV188, drawBroodstormQueenArtV188
} from '../src/broodstorm-queen-art-v188.js';

const NATIVE_SHEET = 'enemy.xenomorph-queen.action.v56';
const paths = new Set(IDS.map(id => ART[id].path));
const key = enemy => getAnimationEntityKeyV57('enemy', enemy, 'hostile');
const close = (actual, expected, label = '') => assert.ok(Math.abs(actual - expected) <= 1e-7, `${label}: ${actual} != ${expected}`);
const physical = enemy => ({ id:enemy.id, x:enemy.x, y:enemy.y, w:enemy.w, h:enemy.h,
  health:enemy.health, maxHealth:enemy.maxHealth, alive:enemy.alive, attackClock:enemy.attackClock,
  legacyRoleV131:enemy.legacyRoleV131, spriteKey:enemy.spriteKey, visualSheetId:enemy.visualSheetId,
  creatureScaleV188:enemy.creatureScaleV188 });
const artCalls = calls => calls.filter(call => call.kind === 'image' && paths.has(call.path));
function sourceSize(path) {
  try { const bytes = readFileSync(new URL(`..${path}`, import.meta.url));
    return bytes.subarray(1,4).toString() === 'PNG' ? [bytes.readUInt32BE(16),bytes.readUInt32BE(20)] : null;
  } catch { return null; }
}
function recorder() {
  const ctx = createDrawMeasureContextV188(), calls = [], stack = [];
  ctx.shadowColor=''; ctx.shadowBlur=0;
  const old = { drawImage:ctx.drawImage, save:ctx.save, restore:ctx.restore };
  ctx.save = () => { stack.push({globalAlpha:ctx.globalAlpha,shadowBlur:ctx.shadowBlur,shadowColor:ctx.shadowColor}); old.save(); };
  ctx.restore = () => { assert.ok(stack.length, 'Canvas restore has a matching save'); old.restore(); Object.assign(ctx,stack.pop()); };
  ctx.drawImage = (image,...args) => { calls.push({kind:'image',path:image.currentSrc || image.src,args,
    matrix:ctx.getTransform(),alpha:ctx.globalAlpha,shadowBlur:ctx.shadowBlur,shadowColor:ctx.shadowColor}); old.drawImage(image,...args); };
  ctx.fillRect = (...args) => calls.push({kind:'rect',args,color:ctx.fillStyle,matrix:ctx.getTransform()});
  return {ctx,calls,render(engine,enemy) { calls.length = ctx.draws.length = 0;
    engine.drawEnemy(ctx,enemy); assert.equal(stack.length,0);
    assert.deepEqual(ctx.getTransform(),{a:1,b:0,c:0,d:1,e:0,f:0});
    return structuredClone(calls);
  }};
}
function mapSource(call, local, rect) {
  const [sx,sy,sw,sh,dx,dy,dw,dh]=call.args, m=call.matrix;
  const x=dx+(rect[0]+local[0]-sx)*dw/sw, y=dy+(rect[1]+local[1]-sy)*dh/sh;
  return [m.a*x+m.c*y+m.e,m.b*x+m.d*y+m.f];
}
async function fixture(t,{kind='broodstorm',holdArt=false,encounter=true}={}) {
  const globals=['addEventListener','removeEventListener','dispatchEvent','document','Image','requestAnimationFrame','cancelAnimationFrame','location'];
  const saved=new Map(globals.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
  const browser=host(), BaseImage=globalThis.Image, requested=[],delivered=[],events=[];
  globalThis.location={origin:'https://broodstorm.invalid'};
  globalThis.Image=class extends BaseImage {
    set src(path) {
      if (!paths.has(path)) { super.src=path; return; }
      this._src=path; this.complete=false; this.naturalWidth=this.naturalHeight=0;
      requested.push(path); delivered.push(this); if (!holdArt) this.finish();
    }
    get src() { return this._src; }
    get currentSrc() { return this._src; }
    finish(failed=false) {
      const size=failed?null:sourceSize(this._src); this.complete=true;
      this.naturalWidth=size?.[0]||0; this.naturalHeight=size?.[1]||0;
      const type=size?'load':'error'; this.dispatchEvent(new Event(type)); this[`on${type}`]?.();
    }
  };
  const campaign=LEGACY_CAMPAIGNS_V131.find(entry=>entry.kind===kind);
  const options={campaign,world:WORLDS.find(entry=>entry.id===campaign.worldId),weapon:WEAPONS[0],
    enemyCatalog:ENEMIES,equipment:[],crew:[],seed:188};
  options.missionLevel=buildLegacyMissionV131({...options,levelSeeds:LEVEL_SEEDS});
  const engine=new GameEngine(browser.canvas,{onEvent:event=>events.push(event)}), drawing=recorder();
  t.after(()=>{ engine.stop(); for(const [name,descriptor] of saved) {
    if(descriptor) Object.defineProperty(globalThis,name,descriptor); else delete globalThis[name];
  }});
  engine.start(options); await prepare(engine);
  async function admitEncounter() {
    assert.equal(engine.legacyMissionV131.kind,'broodstorm');
    // Declare the already cleared nests and arrived escort; the production
    // stage transition owns spawning, checkpoint creation and actor identity.
    const state=engine.legacyMissionV131; state.nests=[0,0]; state.escort.x=2110; state.escort.arrived=true;
    while(state.stage<3) assert.equal(engine.advanceLegacyStageV131(),true);
    const queen=engine.enemies.find(enemy=>enemy.id==='legacy-queen-0'); assert.ok(queen);
    await engine.ensureEnemyAtlas(resolveSpriteSheet(resolveEnemyAnimation(queen).sheetId));
    engine.normalizeCreatureV188(queen); engine.camera.x=1800; await prepare(engine);
    return queen;
  }
  let queen=kind==='broodstorm' && encounter ? await admitEncounter() : null;
  return {engine,events,options,requested,delivered,drawing,get queen(){return queen;},
    render(enemy=queen){return drawing.render(engine,enemy);},
    async reenter(){engine.start(options); await prepare(engine); queen=encounter?await admitEncounter():null;},
    readyAll(){for(const id of IDS) engine.images.get(ART[id].imageKey).finish();}};
}
function pose(enemy,id) {
  Object.assign(enemy,{alive:id!=='death',deathClock:id==='death'?2.8:0,alert:id!=='idle',vx:0,vy:0,
    attacking:false,hurtClock:id==='idle'?0.24:0,v52HurtClock:0,revealed:0});
}

test('Broodstorm art: twelve native samples retain one anatomical scale per family, hip, source windows and facing',async t=>{
  const s=await fixture(t), e=s.engine, q=s.queen;
  assert.equal(q.w,336); close(q.h,268.28125); assert.equal(q.creatureScaleV188.exempt,true);
  assert.equal(q.spriteKey,'xenoQueenV56'); assert.equal(resolveEnemyAnimation(q).sheetId,NATIVE_SHEET);
  assert.equal(broodstormQueenArtReadyV188(e.images),true);
  const before=structuredClone(physical(q)), seen=new Set(), barHeights=[];
  for(const id of IDS) {
    const bytes=readFileSync(new URL(`..${ART[id].path}`,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),ART[id].sha256);
    assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],[1254,1254]);
  }
  for(const reducedMotion of [false,true]) for(const facing of [-1,1]) for(const id of IDS) {
    pose(q,id); q.facing=facing; q.revealed=1; q.health=q.maxHealth*.6;
    e.accessibilityRuntime=Object.freeze({...e.accessibilityRuntime,reducedMotion});
    e.spriteAnimation.reset(key(q)); e.animationTime=20; s.render();
    const clip=resolveSpriteClip(NATIVE_SHEET,id), fps=reducedMotion&&clip.loop?1:clip.fps;
    const events=e.animationTelemetry.events; assert.ok(Number.isInteger(events));
    for(let i=0;i<4;i++) {
      e.animationTime=20+(i+.1)/fps;
      const calls=s.render(), draws=artCalls(calls); assert.equal(draws.length,1);
      const call=draws[0], frame=FRAMES[id][i]; seen.add(`${id}:${i}`);
      assert.equal(call.path,ART[id].path); assert.deepEqual(call.args.slice(0,4),frame.rect);
      assert.equal(call.args[6],627); assert.equal(call.args[7],627);
      close(Math.abs(call.matrix.a),q.h/frame.referenceHeight); close(call.matrix.d,q.h/frame.referenceHeight);
      assert.equal(Math.sign(call.matrix.a),facing); assert.equal(call.matrix.b,0); assert.equal(call.matrix.c,0);
      const hip=mapSource(call,frame.hip,frame.rect);
      close(hip[0],q.x+q.w*PLACEMENT.hipFraction[0]); close(hip[1],q.y+q.h*PLACEMENT.hipFraction[1]);
      const bounds=broodstormQueenVisualBoundsV188(q);
      for(const point of [[0,0],[627,0],[0,627],[627,627]]) {
        const [x,y]=mapSource(call,point,frame.rect);
        assert.ok(x>=bounds.x-1e-7&&x<=bounds.x+bounds.w+1e-7&&y>=bounds.y-1e-7&&y<=bounds.y+bounds.h+1e-7);
      }
      assert.equal(call.shadowColor,'#8fe7a8'); assert.equal(call.shadowBlur,16);
      assert.equal(calls.filter(call=>call.kind==='rect').length,id==='death'?0:2);
      if(id!=='death') {
        // Independent source measurement: the twelve registered alpha>=32
        // silhouettes reach at most 372 CHASE pixels above the hip. This
        // constant is not a per-clip alpha crop or a family-scale ceiling.
        const wingTop=hip[1]-372*q.h/410, rectangles=calls.filter(call=>call.kind==='rect');
        assert.deepEqual(rectangles[0].args,[q.x,wingTop-10,q.w,4]);
        assert.deepEqual(rectangles[1].args,[q.x,wingTop-10,q.w*.6,4]);
        assert.equal(rectangles[0].color,'#2b1616'); assert.equal(rectangles[1].color,'#d27662');
        assert.ok(rectangles[1].args[1]+4<=wingTop-6,'health bar clears every measured opaque wing');
        barHeights.push(rectangles[1].args[1]);
      }
    }
    assert.equal(e.animationTelemetry.events,events,'render samples never emit combat/lifecycle events');
    assert.equal(new Set(FRAMES[id].map(frame=>frame.referenceHeight)).size,1,'one uniform family scale, no pose-dependent resizing');
  }
  assert.equal(seen.size,12);
  assert.equal(new Set(barHeights).size,1,'health bar height is stable through all living poses, both facings and reduced motion');
  assert.deepEqual({w:q.w,h:q.h,scale:q.creatureScaleV188},{w:before.w,h:before.h,scale:before.creatureScaleV188});
});

test('Broodstorm art: every incomplete source mask keeps the whole native fallback; foreign sources and unrelated actors are rejected',async t=>{
  const s=await fixture(t,{holdArt:true}), e=s.engine,q=s.queen; pose(q,'chase');
  e.animationTime=4; const snapshot=JSON.stringify(e.captureResumeState());
  const fallback=s.render(); assert.ok(fallback.some(call=>call.path?.endsWith('xenomorph-queen-action-sheet-v56.png')));
  for(let mask=0;mask<8;mask++) {
    IDS.forEach((id,index)=>e.images.get(ART[id].imageKey).finish(!(mask&(1<<index))));
    const calls=s.render(); assert.equal(artCalls(calls).length,mask===7?1:0);
    if(mask<7) assert.deepEqual(calls,fallback,`availability mask ${mask}`);
  }
  const id=IDS[0], image=e.images.get(ART[id].imageKey), source=image.src;
  for(const path of ['https://foreign.invalid'+source,source+'?v=1',source+'#foreign','data:image/png;base64,x',source.replace('flying-queen','foreign')]) {
    image._src=path; assert.equal(broodstormQueenSourceReadyV188(image,id),false); assert.deepEqual(s.render(),fallback);
  }
  image._src=source; image.naturalWidth=1253; assert.deepEqual(s.render(),fallback); image.naturalWidth=1254;
  const detached={...q}; assert.equal(isBroodstormQueenArtOwnerV188(e,detached),false); assert.equal(artCalls(s.render(detached)).length,0);
  const savedKind=e.legacyMissionV131.kind; e.legacyMissionV131.kind='abyss'; assert.equal(artCalls(s.render()).length,0); e.legacyMissionV131.kind=savedKind;
  const savedRole=q.legacyRoleV131; q.legacyRoleV131='fighter'; assert.equal(artCalls(s.render()).length,0); q.legacyRoleV131=savedRole;
  assert.equal(JSON.stringify(e.captureResumeState()),snapshot,'presentation and image delivery do not change native checkpoint state');
  const sample=e.spriteAnimation.sample(key(q),resolveEnemyAnimation(q),e.animationTime,{emit:false});
  for(const invalid of [{...sample,frame:8},{...sample,frame:99},{...sample,clip:{id:'attack'}},{...sample,sheet:{id:'enemy.xenomorph-queen.combat'}}]) {
    assert.equal(broodstormQueenFrameFitV188(q,invalid),null); assert.equal(drawBroodstormQueenArtV188(s.drawing.ctx,e.images,q,invalid),false);
  }
});

test('Broodstorm art: chapter entry shares pending sources, retries errors and obsolete callbacks cannot change an encounter',async t=>{
  const s=await fixture(t,{holdArt:true}), e=s.engine;
  assert.equal(s.requested.length,3); const first=IDS.map(id=>e.images.get(ART[id].imageKey));
  await s.reenter(); assert.equal(s.requested.length,3);
  first[1].finish(true); await s.reenter(); assert.equal(s.requested.length,4);
  const replacement=e.images.get(ART[IDS[1]].imageKey); assert.notEqual(replacement,first[1]);
  const before=JSON.stringify(e.captureResumeState()), time=e.animationTime;
  first[1].finish(); assert.equal(e.images.get(ART[IDS[1]].imageKey),replacement);
  assert.equal(broodstormQueenArtReadyV188(e.images),false);
  s.readyAll(); assert.equal(broodstormQueenArtReadyV188(e.images),true);
  assert.equal(JSON.stringify(e.captureResumeState()),before); assert.equal(e.animationTime,time);
  await s.reenter(); assert.equal(s.requested.length,4,'ready sources are reused');
});

test('Broodstorm art: other local chapters request none of the three flying-queen sheets',async t=>{
  for(const kind of ['nostromo','abyss']) await t.test(kind,async t=>{
    const s=await fixture(t,{kind,encounter:false}); assert.equal(s.requested.length,0);
  });
});

test('Broodstorm art: native contact, accepted hurt, pause, stage-four death and corpse expiry keep their gameplay clocks',async t=>{
  const s=await fixture(t),e=s.engine,q=s.queen;
  e.legacyMissionV131.directorClock=8; e.legacyMissionV131.wingClock=2;
  // Let the existing four-second insertion grace expire through real updates.
  // A direct contact during that native window is correctly withheld.
  tick(e,4.05); assert.equal(e.insertionGraceActiveV188(),false);
  e.vehicle.x=q.x+q.w/2-e.vehicle.w/2; e.vehicle.y=q.y+q.h/2-e.vehicle.h/2; e.pinLegacyDriverV131();
  q.attackClock=0; const hull=e.vehicle.hull, width=q.w,height=q.h;
  e.updateEnemy(q,1/60); assert.equal(e.vehicle.hull,hull-12); close(q.attackClock,1.3);
  const drawHull=e.vehicle.hull; for(let i=0;i<8;i++) s.render(); assert.equal(e.vehicle.hull,drawHull);
  e.applyEnemyDamage(q,12,{owner:e.player,x:q.x,y:q.y}); assert.equal(resolveEnemyAnimation(q).clipId,'idle'); close(q.hurtClock,.24);
  const hurtDraw=artCalls(s.render())[0]; assert.equal(hurtDraw.path,ART.idle.path); assert.deepEqual(hurtDraw.args.slice(0,4),FRAMES.idle[0].rect);
  const time=e.animationTime, deathBefore=q.deathClock; e.paused=true; tick(e,1);
  assert.equal(e.animationTime,time); assert.equal(q.deathClock,deathBefore); assert.deepEqual(artCalls(s.render()),[hurtDraw]); e.paused=false;
  e.defeatEnemy(q,e.player); assert.equal(e.legacyMissionV131.stage,4); assert.equal(q.deathClock,2.8);
  const [x,y]=[q.x,q.y]; const first=artCalls(s.render())[0]; assert.equal(first.path,ART.death.path); assert.deepEqual(first.args.slice(0,4),FRAMES.death[0].rect);
  tick(e,.46); assert.equal(artCalls(s.render())[0].path,ART.death.path);
  assert.deepEqual(artCalls(s.render())[0].args.slice(0,4),FRAMES.death[3].rect);
  assert.deepEqual([q.x,q.y,q.w,q.h],[x,y,width,height],'death is a held airborne body, not an invented landing');
  tick(e,2.4); assert.equal(q.deathClock,0); assert.equal(e.getVisibleEnemiesV65().includes(q),false);
});

test('Broodstorm art: native resume reconstructs the same queen body and rejects its obsolete owner reference',async t=>{
  const s=await fixture(t),e=s.engine,old=s.queen;
  const raw=e.captureResumeState(); assert.equal(e.validateLegacyResumeV131(raw).valid,true);
  const result=e.applyResumeState(raw); assert.equal(result.applied,true);
  const restored=e.enemies.find(enemy=>enemy.id===old.id); assert.notEqual(restored,old);
  assert.deepEqual([restored.x,restored.y,restored.w,restored.h],[old.x,old.y,old.w,old.h]);
  assert.equal(artCalls(s.render(restored)).length,1); assert.equal(isBroodstormQueenArtOwnerV188(e,old),false);
  assert.equal(artCalls(s.render(old)).length,0);
});

test('Broodstorm art: extended wings are culled by visual bounds only, preserving enemy order and dormant/corpse guards',async t=>{
  const s=await fixture(t),e=s.engine,q=s.queen, body=structuredClone(physical(q));
  // Left-facing tail/wing envelope exceeds the native 448px sprite rectangle.
  q.facing=-1; const bounds=broodstormQueenVisualBoundsV188(q);
  e.camera.x=bounds.x+bounds.w+63; e.camera.y=q.y;
  assert.ok(e.camera.x>q.x+q.w/2+224+64,'fixture lies outside the old right edge');
  assert.equal(e.getVisibleEnemiesV65().includes(q),true,'the last visible wing is retained');
  e.camera.x=bounds.x+bounds.w+65; assert.equal(e.getVisibleEnemiesV65().includes(q),false);
  e.camera.x=q.x; const nativeOrder=e.getVisibleEnemiesV65().map(enemy=>enemy.id);
  assert.deepEqual(nativeOrder,e.enemies.filter(enemy=>nativeOrder.includes(enemy.id)).map(enemy=>enemy.id));
  q.dormant=true; assert.equal(e.getVisibleEnemiesV65().includes(q),false); q.dormant=false;
  q.alive=false; q.deathClock=0; assert.equal(e.getVisibleEnemiesV65().includes(q),false);
  q.deathClock=.1; assert.equal(e.getVisibleEnemiesV65().includes(q),true);
  Object.assign(q,{alive:true,deathClock:0}); assert.deepEqual(physical(q),body);
});
