// Real production GameEngine and queen controller. Browser APIs/Image delivery
// are declared doubles; Canvas commands and transforms are recorded, not rasterized.
// Pose/phase injections below isolate presentation and Cargo lifecycle contracts.
// Independent native-Canvas review supplies the sixteen-pose visual evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { host, prepare } from './engine-host-v188.mjs';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, WORLDS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content.js';
import { ENEMIES as CORE_ENEMIES } from '../src/content-core-v50.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { getAnimationEntityKeyV57 } from '../src/game-v52-runtime.js';
import { resolveEnemyAnimation, resolveSpriteClip } from '../src/sprite-animation-runtime.js';
import { CARGO_MATRIARCH_ART_IDS_V188 as IDS, CARGO_MATRIARCH_ART_V188 as ART,
  CARGO_MATRIARCH_ART_FRAMES_V188 as FRAMES, CARGO_MATRIARCH_ATTACK_REVIEW_V188 as ATTACK_REVIEW,
  cargoMatriarchSourceReadyV188, cargoMatriarchArtReadyV188,
  cargoMatriarchFrameFitV188, drawCargoMatriarchArtV188 } from '../src/cargo-matriarch-art-v188.js';

const paths = new Set(IDS.map(id => ART[id].path));
const ownImage = (engine, id) => engine.images.get(ART[id].imageKey);
const nativeKey = enemy => getAnimationEntityKeyV57('enemy', enemy, 'hostile');
const body = enemy => ({ id: enemy.id, x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h, groundY: enemy.groundY,
  spriteKey: enemy.spriteKey, visualSheetId: enemy.visualSheetId, scale: enemy.creatureScaleV188 });
const near = (a, b, message = '') => assert.ok(Math.abs(a - b) < 1e-7, `${message}: ${a} != ${b}`);

function drawingRecorder() {
  const calls = [], stack = []; let matrix = [1, 0, 0, 1, 0, 0];
  const multiply = ([a, b, c, d, e, f]) => {
    const [aa, bb, cc, dd, ee, ff] = matrix;
    matrix = [aa*a+cc*b, bb*a+dd*b, aa*c+cc*d, bb*c+dd*d, aa*e+cc*f+ee, bb*e+dd*f+ff];
  };
  const ctx = new Proxy({
    globalAlpha: 1, shadowColor: '', shadowBlur: 0,
    save() { stack.push({ matrix: [...matrix], alpha: this.globalAlpha, shadowColor: this.shadowColor, shadowBlur: this.shadowBlur }); },
    restore() { const saved = stack.pop(); assert.ok(saved, 'balanced save/restore'); matrix = saved.matrix;
      this.globalAlpha = saved.alpha; this.shadowColor = saved.shadowColor; this.shadowBlur = saved.shadowBlur; },
    translate(x,y) { multiply([1,0,0,1,x,y]); }, scale(x,y) { multiply([x,0,0,y,0,0]); },
    rotate(angle) { multiply([Math.cos(angle),Math.sin(angle),-Math.sin(angle),Math.cos(angle),0,0]); },
    transform(...value) { multiply(value); }, setTransform(...value) { matrix = value; },
    getTransform() { return Object.fromEntries(['a','b','c','d','e','f'].map((key,i) => [key,matrix[i]])); },
    drawImage(image,...args) { calls.push({ kind:'image', path:image.currentSrc || image.src, args, matrix:[...matrix],
      alpha:this.globalAlpha, shadowColor:this.shadowColor, shadowBlur:this.shadowBlur }); },
    fillRect(...args) { calls.push({ kind:'rect', color:this.fillStyle, args, matrix:[...matrix] }); },
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }),
    measureText: value => ({ width:String(value).length*7 })
  }, { get: (target,key) => key in target ? target[key] : () => {} });
  return { ctx, calls, reset() { calls.length = 0; }, balanced() { assert.equal(stack.length,0); assert.deepEqual(matrix,[1,0,0,1,0,0]); } };
}
function sourcePoint(call,[sx,sy]) {
  const [ix,iy,iw,ih,dx,dy,dw,dh] = call.args, [a,b,c,d,e,f] = call.matrix;
  const x = dx+(sx-ix)*dw/iw, y = dy+(sy-iy)*dh/ih;
  return [a*x+c*y+e,b*x+d*y+f];
}
function sourceSize(path) {
  try { const bytes = readFileSync(new URL(`..${path}`,import.meta.url));
    assert.equal(bytes.subarray(1,4).toString(),'PNG'); return [bytes.readUInt32BE(16),bytes.readUInt32BE(20)];
  } catch { return null; }
}

async function nativeFixture(t, { holdArt = false, cargo = true, catalog = ENEMIES, settleBody = true } = {}) {
  const names = ['addEventListener','removeEventListener','dispatchEvent','document','Image','requestAnimationFrame','cancelAnimationFrame','location'];
  const previous = new Map(names.map(name => [name,Object.getOwnPropertyDescriptor(globalThis,name)]));
  const browser = host(), BaseImage = globalThis.Image, requested = [], delivered = [], events = [];
  globalThis.location = { origin:'https://cargo.invalid' };
  globalThis.Image = class extends BaseImage {
    set src(path) {
      if (!paths.has(path)) { super.src = path; return; }
      this._src = path; this.complete = false; this.naturalWidth = this.naturalHeight = 0;
      requested.push(path); delivered.push(this); if (!holdArt) this.finish();
    }
    get src() { return super.src; }
    finish(failed = false) {
      const size = failed ? null : sourceSize(this.src); this.complete = true;
      this.naturalWidth = size?.[0] || 0; this.naturalHeight = size?.[1] || 0;
      const type = size ? 'load' : 'error'; this.dispatchEvent(new Event(type)); this[`on${type}`]?.();
    }
  };
  const drawing = drawingRecorder(), campaign = cargo ? CAMPAIGNS.find(entry => entry.id === 'special-cargo-brutal') : CAMPAIGNS[0];
  assert.ok(campaign); const world = WORLDS.find(entry => entry.id === campaign.worldId);
  const missionLevel = buildMissionLevelV52({ campaign,world,levelSeeds:LEVEL_SEEDS,variant:0 });
  const options = { campaign,world,missionLevel,levelSeed:missionLevel.levelSeed,seed:missionLevel.levelSeed.seed,
    weapon:WEAPONS[0],enemyCatalog:catalog,equipment:[],crew:[],userCasteCampaignV88:false };
  const engine = new GameEngine(browser.canvas,{ onEvent:event => events.push(event) });
  t.after(() => { engine.stop(); for (const [name,descriptor] of previous) {
    if (descriptor) Object.defineProperty(globalThis,name,descriptor); else delete globalThis[name];
  } });
  engine.start(options); await prepare(engine);
  // The app catalogue can select a V98 static queen before Cargo overrides its
  // sheet fields. Load that actual native fallback, then settle the physical
  // profile through the production normalizer (the same preview preparation
  // used by verify-creature-scale). No body dimensions are injected.
  let legacySheet;
  if (cargo && settleBody) {
    legacySheet = engine.getVisibleEnemyAtlasSheetsV65([engine.cargoMatriarchV67])[0];
    await engine.ensureEnemyAtlas(legacySheet); await prepare(engine);
    engine.cargoMatriarchV67.creatureScaleRetryV188 = 0;
    engine.normalizeCreatureV188(engine.cargoMatriarchV67); engine.settleCreatureScaleV188();
  }
  return { engine,events,options,requested,delivered,drawing,legacySheet,
    render(enemy = engine.cargoMatriarchV67) { drawing.reset(); engine.drawEnemy(drawing.ctx,enemy); drawing.balanced(); return structuredClone(drawing.calls); },
    async reenter() { engine.start(options); await prepare(engine); },
    readyAll() { for (const id of IDS) ownImage(engine,id).finish(); }
  };
}
function activateForDrawing(engine) {
  // Presentation fixture only: no claim of a completed Cargo traversal.
  engine.cargoBrutalV67.matriarch.active = true;
  Object.assign(engine.cargoMatriarchV67,{ alive:true,cargoDormantV67:false });
}
function pose(enemy,id) {
  Object.assign(enemy,{ alive:true,alert:id === 'advance',vx:0,attacking:id === 'claw-tail',
    pendingMelee:false,attackAnimationClock:0,hurtClock:id === 'roar-hurt' ? .3 : 0,v52HurtClock:0 });
}
const artCalls = calls => calls.filter(call => call.kind === 'image' && paths.has(call.path));

test('Matriarch art: all sixteen production samples keep native clips, events, feet, ratios and health bars in both directions', async t => {
  const fixture = await nativeFixture(t), { engine } = fixture, enemy = engine.cargoMatriarchV67;
  assert.equal(cargoMatriarchArtReadyV188(engine.images),true,'all four shipped sheets admitted');
  assert.equal(enemy.w,300); assert.equal(enemy.h,245); const original = structuredClone(body(enemy));
  activateForDrawing(engine); const seen = new Set(), linkedMarkers = new Set();
  // This hash binds the externally reviewed poses to the deployed pixels. The
  // checks below prove timing/window linkage, not visual recognition of a pose.
  const attackBytes = readFileSync(new URL(`..${ATTACK_REVIEW.sourcePath}`,import.meta.url));
  assert.equal(createHash('sha256').update(attackBytes).digest('hex'),ATTACK_REVIEW.sourceSha256,'the visually reviewed attack source');
  for (const reducedMotion of [false,true]) for (const facing of [-1,1]) for (const [clipIndex,id] of IDS.entries()) {
    pose(enemy,id); enemy.facing = facing; enemy.revealed = 1; enemy.health = enemy.maxHealth*.6;
    engine.accessibilityRuntime = Object.freeze({...engine.accessibilityRuntime,reducedMotion});
    engine.spriteAnimation.reset(nativeKey(enemy));
    const request = resolveEnemyAnimation(enemy), clip = resolveSpriteClip(request.sheetId,request.clipId);
    const fps = reducedMotion && clip.loop ? 1 : clip.fps, baseTime = 100+clipIndex*10;
    engine.animationTime = baseTime; engine.updateSpriteAnimationEvents();
    for (let index = 0; index < 4; index++) {
      const emittedBefore = fixture.events.length;
      engine.animationTime = baseTime+(index+.01)/fps; engine.updateSpriteAnimationEvents();
      const native = structuredClone(enemy.v52Animation), before = engine.captureResumeState();
      const eventsBefore = engine.animationTelemetry.events, controllerBefore = structuredClone(engine.spriteAnimation.states.get(nativeKey(enemy)));
      const calls = fixture.render(), selected = artCalls(calls);
      assert.equal(selected.length,1); const call = selected[0], frame = FRAMES[id][index];
      assert.equal(native.frame,clip.frames[index]); seen.add(native.frame);
      assert.equal(call.path,ART[id].path); assert.deepEqual(call.args.slice(0,4),frame.rect);
      for (const event of fixture.events.slice(emittedBefore).filter(entry => entry.type === 'animation-frame'
        && entry.entityId === nativeKey(enemy) && ['combat:claw-hit','combat:tail-hit'].includes(entry.event))) {
        const reviewed = ATTACK_REVIEW.markers.find(marker => marker.event === event.event);
        assert.ok(reviewed,`${event.event}: a visual review identifies its source window`);
        assert.equal(event.clipId,'claw-tail'); assert.equal(event.frame,native.frame); assert.equal(event.frame,reviewed.frame);
        assert.equal(call.path,ATTACK_REVIEW.sourcePath); assert.deepEqual(call.args.slice(0,4),reviewed.sourceRect);
        linkedMarkers.add(event.event);
      }
      const foot = sourcePoint(call,[frame.rect[0]+frame.foot[0],frame.rect[1]+frame.foot[1]]);
      near(foot[0],enemy.x+enemy.w/2,'centre'); near(foot[1],enemy.y+enemy.h,'feet');
      near(Math.abs(call.matrix[0]),Math.abs(call.matrix[3]),'uniform canvas scale');
      near(call.args[6]/call.args[2],call.args[7]/call.args[3],'uniform source scale');
      const opaqueHeight = (frame.opaqueBounds[3]-frame.opaqueBounds[1])*Math.abs(call.matrix[3]);
      assert.ok(opaqueHeight <= enemy.h+1e-7,'action extension does not exceed the native stature ceiling');
      if (id === 'idle') assert.ok(Math.abs(opaqueHeight-enemy.h) <= 4,'idle stays at the native queen stature');
      assert.equal(Math.sign(call.matrix[0]),facing); assert.equal(call.shadowColor,'#8fe7a8'); assert.equal(call.shadowBlur,16);
      assert.ok(call.args.every(Number.isFinite));
      const bar = calls.filter(call => call.kind === 'rect' && call.color === '#d27662'); assert.equal(bar.length,1);
      near(bar[0].args[2]*bar[0].matrix[0],enemy.w*.6,'boss health width');
      assert.deepEqual(engine.captureResumeState(),before,'drawing does not write gameplay/save state');
      assert.deepEqual(body(enemy),original,'physical body restored after the outer scale transform');
      assert.equal(engine.animationTelemetry.events,eventsBefore,'draw never emits frame events');
      assert.deepEqual(engine.spriteAnimation.states.get(nativeKey(enemy)),controllerBefore,'same controller timeline');
    }
    engine.animationTime = baseTime+4.1/fps; engine.updateSpriteAnimationEvents();
    assert.equal(enemy.v52Animation.frame,clip.frames[clip.loop ? 0 : 3],'loop/terminal cadence stays native');
    const beforePause = engine.animationTime; engine.paused = true; engine.update(.5);
    assert.equal(engine.animationTime,beforePause); engine.paused = false;
  }
  assert.deepEqual([...seen].sort((a,b) => a-b),Array.from({length:16},(_,i) => i));
  assert.deepEqual([...linkedMarkers].sort(),['combat:claw-hit','combat:tail-hit']);
});

test('Matriarch art: an incomplete or foreign sheet keeps the whole native fallback; other queens and detached probes remain unchanged', async t => {
  const fixture = await nativeFixture(t), { engine } = fixture; activateForDrawing(engine);
  const enemy = engine.cargoMatriarchV67; pose(enemy,'idle');
  const originals = IDS.map(id => ownImage(engine,id));
  engine.images.delete(ART.idle.imageKey); const fallback = fixture.render();
  assert.equal(artCalls(fallback).length,0); assert.ok(fallback.some(call => call.path === fixture.legacySheet.path));
  engine.images.set(ART.idle.imageKey,originals[0]);
  for (const id of IDS) for (const corrupt of [image => ({...image,complete:false}),
    image => ({...image,naturalWidth:image.naturalWidth+1}), image => ({...image,currentSrc:'/assets/not-the-matriarch.png'}),
    image => ({...image,currentSrc:`https://foreign.invalid${ART[id].path}`})]) {
    const original = ownImage(engine,id);
    engine.images.set(ART[id].imageKey,corrupt({ src:original.src,complete:true,naturalWidth:original.naturalWidth,naturalHeight:original.naturalHeight }));
    assert.equal(cargoMatriarchSourceReadyV188(ownImage(engine,id),id),false);
    assert.deepEqual(fixture.render(),fallback,'the same historical commands, including health bar');
    engine.images.set(ART[id].imageKey,original);
  }
  assert.equal(artCalls(fixture.render()).length,1);
  // A detached normalizer/foreign queen is not the encounter-owned object.
  const other = {...enemy,id:`${enemy.id}:foreign`,cargoMatriarchV67:true};
  const readyOther = fixture.render(other); assert.equal(artCalls(readyOther).length,0);
  const measured = engine.measureCreatureDrawV188(enemy,'idle',enemy.creatureScaleV188.k);
  for (const id of IDS) engine.images.delete(ART[id].imageKey);
  assert.deepEqual(fixture.render(other),readyOther);
  assert.deepEqual(engine.measureCreatureDrawV188(enemy,'idle',enemy.creatureScaleV188.k),measured,'gabarit cannot depend on loaded art');
});

test('Matriarch art: readiness waits for the native body; the engine-host fixture without an explicit level seed keeps its atlas fallback', async t => {
  const fixture = await nativeFixture(t,{settleBody:false}), {engine} = fixture, enemy = engine.cargoMatriarchV67;
  assert.equal(cargoMatriarchArtReadyV188(engine.images),true); assert.equal(enemy.creatureScaleV188,undefined);
  activateForDrawing(engine); assert.equal(artCalls(fixture.render()).length,0,'ready pictures wait for the physical profile');
  const legacy = engine.getVisibleEnemyAtlasSheetsV65([enemy])[0]; await engine.ensureEnemyAtlas(legacy); await prepare(engine);
  enemy.creatureScaleRetryV188 = 0; engine.normalizeCreatureV188(enemy); engine.settleCreatureScaleV188();
  assert.equal(enemy.w,300); assert.equal(enemy.h,245); assert.equal(artCalls(fixture.render()).length,1);
  // Reproduce the earlier engine-host fixture: core catalogue, seed1321, no
  // separate levelSeed for encounter selection (the app does supply that seed).
  const coreOptions = {...fixture.options,enemyCatalog:CORE_ENEMIES,seed:1321}; delete coreOptions.levelSeed;
  engine.start(coreOptions); await prepare(engine);
  const core = engine.cargoMatriarchV67, oldSheet = engine.getVisibleEnemyAtlasSheetsV65([core])[0];
  assert.ok(core.id.startsWith('enemy-372-apex-queen:'));
  await engine.ensureEnemyAtlas(oldSheet); await prepare(engine); core.creatureScaleRetryV188 = 0;
  engine.normalizeCreatureV188(core); engine.settleCreatureScaleV188(); activateForDrawing(engine);
  assert.equal(core.w,300); assert.equal(core.h,245); assert.equal(artCalls(fixture.render()).length,1);
  engine.images.delete(ART.idle.imageKey);
  const fallback = fixture.render(); assert.equal(artCalls(fallback).length,0);
  assert.ok(fallback.some(call => call.path === '/assets/openai/sprites/normalized/enemies/xenomorph-queen-combat-sheet.png'));
});

test('Matriarch art: Cargo entry shares pending and ready sheets, retries errors and ignores obsolete events without restarting gameplay', async t => {
  const fixture = await nativeFixture(t,{holdArt:true}), {engine,requested} = fixture;
  assert.deepEqual(requested,[...paths]); const pending = IDS.map(id => ownImage(engine,id));
  await fixture.reenter(); assert.equal(requested.length,4); assert.deepEqual(IDS.map(id => ownImage(engine,id)),pending);
  activateForDrawing(engine); fixture.render(); fixture.render(); assert.equal(requested.length,4,'no draw requests');
  const failed = pending[2]; failed.finish(true); await fixture.reenter();
  assert.equal(requested.length,5); const replacement = ownImage(engine,'claw-tail'); assert.notEqual(replacement,failed);
  const before = engine.captureResumeState(), eventCount = fixture.events.length;
  failed.finish(); failed.dispatchEvent(new Event('error'));
  assert.equal(ownImage(engine,'claw-tail'),replacement,'old load/error cannot replace the current source');
  assert.deepEqual(engine.captureResumeState(),before); assert.equal(fixture.events.length,eventCount);
  fixture.readyAll(); assert.equal(cargoMatriarchArtReadyV188(engine.images),true);
  const ready = IDS.map(id => ownImage(engine,id)); await fixture.reenter();
  assert.equal(requested.length,5); assert.deepEqual(IDS.map(id => ownImage(engine,id)),ready);
  engine.stop(); const stopped = engine.captureResumeState(), stoppedEvents = fixture.events.length;
  for (const image of ready) image.dispatchEvent(new Event('load'));
  assert.deepEqual(engine.captureResumeState(),stopped); assert.equal(fixture.events.length,stoppedEvents);
});

test('Matriarch art: a different mission never requests Cargo sources', async t => {
  const fixture = await nativeFixture(t,{cargo:false}); assert.equal(fixture.engine.isCargoBrutalV67(),false);
  assert.equal(fixture.requested.length,0); for (const enemy of fixture.engine.enemies) fixture.render(enemy);
  assert.equal(fixture.requested.length,0);
});

test('Matriarch art: dormant guard, native awakening, phase waves, resume and defeat remain physical encounter actions', async t => {
  const fixture = await nativeFixture(t), {engine,events} = fixture, enemy = engine.cargoMatriarchV67;
  const original = structuredClone(body(enemy)); assert.equal(fixture.render().length,0);
  const health = enemy.health; assert.equal(engine.applyEnemyDamage(enemy,90,{owner:engine.player}),0); assert.equal(enemy.health,health);
  // Declared fixture: power and cargo doors are open, and the loader has brought
  // the core to its install node. The real interaction/checkpoint/waves run below.
  const state = engine.cargoBrutalV67, player = engine.player, vehicle = engine.vehicle;
  state.phase = 'carry-core'; state.core.carried = true; state.core.retrieved = true; state.powerRestored = true;
  engine.powerNode.active = true;
  for (const door of engine.doors) { door.open = true; door.progress = 1; }
  state.loaderMounted = true; vehicle.x = state.installNode.x; vehicle.y = state.installNode.y+state.installNode.h-vehicle.h;
  vehicle.active = true; vehicle.driver = player; player.inVehicle = true;
  player.x = vehicle.x; player.y = vehicle.y+vehicle.h-player.h;
  assert.equal(engine.cargoBrutalInteractV67(player),true);
  assert.equal(state.phase,'matriarch'); assert.equal(engine.checkpoint.id,'cargo-matriarch');
  assert.equal(state.matriarch.active,true); assert.equal(artCalls(fixture.render()).length,1);
  assert.deepEqual(body(enemy),original); assert.ok(events.some(event => event.type === 'objective-wave' && event.wave === 'matriarch-awakening'));
  enemy.health = enemy.maxHealth*.6; engine.updateCargoMatriarchPhasesV67(); assert.equal(state.matriarch.phase,2);
  enemy.health = enemy.maxHealth*.3; engine.updateCargoMatriarchPhasesV67(); assert.equal(state.matriarch.phase,3);
  const saved = engine.captureResumeState(), phaseEvents = events.filter(event => event.type === 'objective-action' && event.action === 'matriarch-phase').length;
  assert.equal(phaseEvents,2);
  assert.equal(engine.applyResumeState(JSON.parse(JSON.stringify(saved))).applied,true);
  assert.deepEqual(engine.captureResumeState().specialOperation,saved.specialOperation);
  fixture.render(); assert.equal(events.filter(event => event.type === 'objective-action' && event.action === 'matriarch-phase').length,phaseEvents);
  engine.defeatEnemy(enemy,player); assert.equal(engine.cargoBrutalV67.matriarch.defeated,true);
  assert.equal(engine.cargoBrutalV67.phase,'extract'); assert.equal(fixture.render().length,0,'defeated Cargo boss stays hidden natively');
});

test('Matriarch art: emergency actor keeps its own body, with complete bounded sources and uniform scale', async t => {
  const fixture = await nativeFixture(t), {engine} = fixture;
  // Exercise the actual no-boss fallback in configureCargoBrutalWorldV67.
  engine.enemies = []; engine.cargoBrutalV67.matriarch.id = null; engine.cargoMatriarchV67 = null;
  engine.configureCargoBrutalWorldV67(); const enemy = engine.cargoMatriarchV67;
  assert.ok(enemy.id.startsWith('cargo-matriarch:')); activateForDrawing(engine); pose(enemy,'idle');
  fixture.render(); const original = structuredClone(body(enemy)); assert.notEqual(enemy.h,245,'uncatalogued actor is not forced to the catalogued queen size');
  const sample = engine.spriteAnimation.sample(nativeKey(enemy),resolveEnemyAnimation(enemy),engine.animationTime,{emit:false});
  const fit = cargoMatriarchFrameFitV188(enemy,sample); assert.ok(fit); near(fit.scale,enemy.h/FRAMES.idle[0].referenceHeight);
  const call = artCalls(fixture.render())[0], frame = FRAMES.idle[0];
  const foot = sourcePoint(call,[frame.rect[0]+frame.foot[0],frame.rect[1]+frame.foot[1]]);
  near(foot[0],enemy.x+enemy.w/2); near(foot[1],enemy.y+enemy.h); near(Math.abs(call.matrix[0]),Math.abs(call.matrix[3]));
  assert.deepEqual(body(enemy),original);
  for (const id of IDS) {
    const bytes = readFileSync(new URL(`..${ART[id].path}`,import.meta.url));
    assert.equal(bytes[25],6,'RGBA source'); assert.deepEqual(sourceSize(ART[id].path),[ART[id].width,ART[id].height]);
    assert.equal(FRAMES[id].length,4); const cells = new Set();
    for (const frame of FRAMES[id]) {
      const [x,y,w,h] = frame.rect; assert.equal(w,ART[id].width/2); assert.equal(h,ART[id].height/2);
      assert.ok([0,w].includes(x) && [0,h].includes(y)); cells.add(`${x},${y}`);
    }
    assert.equal(cells.size,4,'no repeated or missing cell');
  }
  const before = fixture.drawing.calls.length;
  assert.equal(drawCargoMatriarchArtV188(fixture.drawing.ctx,engine.images,enemy,{...sample,frame:16}),false);
  assert.equal(drawCargoMatriarchArtV188(fixture.drawing.ctx,engine.images,enemy,{...sample,clip:{id:'advance'}}),false);
  assert.equal(fixture.drawing.calls.length,before,'foreign action/frame cannot draw a partial replacement');
});
