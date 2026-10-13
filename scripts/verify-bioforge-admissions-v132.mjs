import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openSync, readSync, closeSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { BioforgeRuntimeV80 } from '../src/bioforge-runtime-v80.js';
import { ENEMIES } from '../src/content-core-v50.js';
import { BIOFORGE_ADMISSIONS_V132, BIOFORGE_COLLIDER_REVIEW_IDS_V132, getBioforgeAdmissionV132,
  isBioforgeAdmissionImageReadyV132, getBioforgeCoverageV132, auditBioforgeCatalogueV132 } from '../src/bioforge-admissions-v132.js';
import { BIOFORGE_TERRESTRIAL_ROSTER_V80, validateBioforgeSelectionV80, validateBioforgeCompositionV87,
  sanitizeBioforgeV80 } from '../src/bioforge-session-v80.js';
import { buildBioforgeUiModelV80, getBioforgeProfileLabelV80 } from '../src/bioforge-ui-v80.js';
import { resolveSpriteSheet, resolveSpriteClip } from '../src/sprite-animation-runtime.js';
import { buildSpriteHitboxRuntime } from '../src/game-v52-runtime.js';
import { enemySightClearV130 } from '../src/enemy-tactics-v130.js';
import { sanitizeBioforgeTacticsV132 } from '../src/bioforge-tactics-state-v132.js';
const root=fileURLToPath(new URL('../',import.meta.url)), dimensions=new Map();
function imageSize(source) {
  if (dimensions.has(source)) return dimensions.get(source);
  let descriptor;
  try {
    descriptor = openSync(resolve(root, `.${new URL(source, 'http://qa.invalid').pathname}`), 'r');
    const header = Buffer.alloc(32); readSync(descriptor, header, 0, 32, 0);
    let size;
    if (header.subarray(1, 4).toString() === 'PNG') size = { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
    else if (header.subarray(0, 4).toString() === 'RIFF' && header.subarray(12, 16).toString() === 'VP8X') {
      size = { width: header.readUIntLE(24, 3) + 1, height: header.readUIntLE(27, 3) + 1 };
    } else if (header.subarray(0,4).toString()==='RIFF' && header.subarray(12,16).toString()==='VP8L' && header[20]===0x2f) {
      const bits=header.readUInt32LE(21); size={width:(bits&0x3fff)+1,height:((bits>>>14)&0x3fff)+1};
    } else if (header.subarray(0,4).toString()==='RIFF' && header.subarray(12,16).toString()==='VP8 '
      && header[23]===0x9d && header[24]===0x01 && header[25]===0x2a) {
      size={width:header.readUInt16LE(26)&0x3fff,height:header.readUInt16LE(28)&0x3fff};
    }
    if (size) dimensions.set(source, size);
    return size || null;
  } catch { return null; } finally { if (descriptor !== undefined) closeSync(descriptor); }
}

function host() {
  const windowEvents = new EventTarget(), requests = [], drawings = [], stack = [];
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = windowEvents[name].bind(windowEvents);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  globalThis.Image = class extends EventTarget {
    complete = false; naturalWidth = 0; naturalHeight = 0; width = 0; height = 0;
    set src(source) {
      this._src = String(source); requests.push(this._src);
      const size = imageSize(this._src); this.complete = true;
      this.naturalWidth = this.width = size?.width || 0; this.naturalHeight = this.height = size?.height || 0;
      queueMicrotask(() => { const event = new Event(size ? 'load' : 'error'); this.dispatchEvent(event); this[`on${event.type}`]?.(event); });
    }
    get src() { return this._src; }
    async decode() { if (!this.complete || !this.naturalWidth) throw new Error('Missing or unsupported shipped fixture image.'); }
  };
  const gradient = { addColorStop() {} }, texts = [];
  const ctx = new Proxy({ globalAlpha: 1, save() { stack.push(this.globalAlpha); },
    restore() { assert.ok(stack.length, 'Balanced rendering context.'); this.globalAlpha = stack.pop(); },
    drawImage(image, ...args) { assert.ok(image.naturalWidth > 0); drawings.push({ path: image.src, args }); },
    fillText(text) { texts.push(String(text)); }, measureText: text => ({ width: String(text).length * 7 }),
    createLinearGradient: () => gradient, createRadialGradient: () => gradient,
    getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 }) },
  { get(target, property) { return property in target ? target[property] : () => {}; } });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const key = (type, code) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { code, repeat: false, ctrlKey: false, metaKey: false, altKey: false, isComposing: false });
    windowEvents.dispatchEvent(event);
  };
  return { canvas, ctx, requests, drawings, stack, texts, key };
}


async function prepare(engine) {
  for(let count=0;count<40;count++) await Promise.resolve();
  await Promise.all(engine.getVisibleEnemyAtlasSheetsV65().map(sheet=>engine.ensureEnemyAtlas(sheet)));
  for(let count=0;count<40;count++) await Promise.resolve();
  engine.refreshEnemyAtlasAvailabilityV65();
}
function simulate(engine,seconds) {
  for(let remaining=seconds;remaining>1e-9;remaining-=Math.min(1/60,remaining)) engine.update(Math.min(1/60,remaining));
}
async function fixture(profileId='enemy-007-praetorian',extra={}) {
  const browser=host(),events=[],commits=[];
  const engine=new BioforgeRuntimeV80(browser.canvas,{autoLoop:false,onEvent:event=>events.push(event),
    onPersist:state=>{commits.push(structuredClone(state));return true;},...extra});
  const options={configuration:{profileId,quantity:1,maxConcurrent:12},seed:132};
  assert.equal(engine.start(options).started,true);
  await prepare(engine);
  return {...browser,engine,options,events,commits};
}
async function walkTo(subject,x) {
  const {engine,key}=subject;key('keydown','KeyD');
  let steps=0;
  while(engine.player.x<x && engine.running && steps++<900) {
    engine.update(1/60);
    if(engine.enemyAtlasLoadingPausedV65) await prepare(engine);
  }
  key('keyup','KeyD');
  assert.ok(engine.player.x>=x,`Physical route blocked at ${engine.player.x}/${x}, stage ${engine.bioforgeTransferStageV80}`);
}
async function enterArena(subject,{print=true}={}) {
  const {engine,key}=subject;
  for(const [x,stage] of [[335,1],[565,2],[1065,3]]) {
    await walkTo(subject,x);key('keydown','KeyE');key('keyup','KeyE');
    assert.equal(engine.bioforgeTransferStageV80,stage);
  }
  await walkTo(subject,1310);
  assert.equal(engine.bioforgeRootV80.activeSession.phase,'sealing');
  await prepare(engine);
  if(!print)return null;
  simulate(engine,.8);await prepare(engine);simulate(engine,.5);await prepare(engine);
  assert.equal(engine.enemies.length,1,`Native specimen was not printed: ${engine.bioforgeBlockedV87}`);
  return engine.enemies[0];
}
function physical(engine) {return engine.captureBioforgeResumeStateV80().state.runtimeV81.physicalV87;}
function closeTo(actual,expected,message) {assert.ok(Math.abs(actual-expected)<1e-8,`${message}: ${actual} / ${expected}`);}

test('38 exact existing animated identities have measured shipped atlases and four usable clips',()=>{
  assert.equal(BIOFORGE_ADMISSIONS_V132.length,38);
  const paths=new Set(),hashes=new Set();
  for(const profile of BIOFORGE_ADMISSIONS_V132) {
    const size=imageSize(profile.path);
    assert.deepEqual(size,{width:profile.expectedWidth,height:profile.expectedHeight},profile.profileId);
    paths.add(profile.path);
    hashes.add(createHash('sha256').update(readFileSync(resolve(root,`.${profile.path}`))).digest('hex'));
    assert.equal(profile.canonExact,false);
    const sheet=resolveSpriteSheet(profile.sheetId);
    assert.equal(sheet.path,profile.path);
    for(const clip of Object.values(profile.clips)) assert.ok(resolveSpriteClip(profile.sheetId,clip.id).frames.length>=2);
  }
  assert.equal(paths.size,38,'Each admission owns its atlas.');
  assert.equal(hashes.size,38,'Admission cannot be inflated by cloned bitmap identities.');
});

test('the public roster preserves 324 old admissions and exposes exact catalogue/import coverage',()=>{
  const coverage=getBioforgeCoverageV132(BIOFORGE_TERRESTRIAL_ROSTER_V80);
  assert.deepEqual({...coverage,label:undefined},{schema:132,catalogue:571,admittedCatalogue:170,
    admittedImports:192,totalSelectable:362,remainingCatalogue:401,newAnimatedAdmissions:38,canonExact:false,label:undefined});
  const audit=auditBioforgeCatalogueV132(BIOFORGE_TERRESTRIAL_ROSTER_V80);
  assert.equal(audit.length,571);assert.equal(audit.filter(row=>row.admitted).length,170);
  assert.equal(audit.filter(row=>row.newAdmission).length,38);
  for(const id of ['enemy-051-ceto-reef-predator','enemy-103-albino-ceto-reef-predator',
    'enemy-155-armored-ceto-reef-predator','enemy-207-acid-blooded-ceto-reef-predator']) {
    assert.match(audit.find(row=>row.profileId===id).reason,/aquatic/);
    assert.equal(validateBioforgeSelectionV80({profileId:id,quantity:1}).ok,false);
  }
  for(const id of BIOFORGE_COLLIDER_REVIEW_IDS_V132) assert.match(audit.find(row=>row.profileId===id).reason,/collider-offset/);
  const excluded=audit.find(row=>!row.admitted&&row.reason==='ancestor-or-family-atlas-is-not-an-identity');
  assert.ok(excluded);assert.equal(validateBioforgeSelectionV80({profileId:excluded.profileId,quantity:1}).ok,false);
});

test('configuration and accessible status present these as native animated lab adaptations',()=>{
  const model=buildBioforgeUiModelV80(null);
  assert.equal(model.coverageV132.totalSelectable,362);
  for(const profile of BIOFORGE_ADMISSIONS_V132) {
    assert.match(getBioforgeProfileLabelV80(profile.profileId),/atlas animé existant/);
    assert.equal(validateBioforgeSelectionV80({profileId:profile.profileId,quantity:1}).ok,true);
    assert.equal(validateBioforgeSelectionV80({profileId:profile.profileId,quantity:13}).ok,false);
  }
  assert.equal(validateBioforgeCompositionV87({composition:[{lineId:'heavy',profileId:'enemy-008-queen',quantity:48}],maxConcurrent:12}).ok,true);
  assert.equal(validateBioforgeCompositionV87({composition:[{lineId:'heavy',profileId:'enemy-008-queen',quantity:49}],maxConcurrent:12}).ok,false);
});

for(const profile of BIOFORGE_ADMISSIONS_V132) test(`${profile.profileId}: real doors, atlas, authored collider, confinement, pause and physical resume`,async()=>{
  const subject=await fixture(profile.profileId),{engine,ctx,drawings,stack}=subject;
  const enemy=await enterArena(subject),source=ENEMIES.find(entry=>entry.id===profile.profileId);
  const native=engine.createEnemy(source,0,enemy.x,enemy.groundY,{boss:false,keyCarrier:false});
  assert.equal(enemy.behavior,native.behavior,'Native combat role must be preserved.');
  assert.equal(enemy.visualSheetId,profile.sheetId);
  assert.equal(enemy.reward,0);assert.equal(enemy.dropsDisabledV80,true);
  closeTo(enemy.w,profile.bodyWidth,'Body width');closeTo(enemy.h,profile.bodyHeight,'Body height');
  for(const facing of [-1,1]) {
    const bounds=buildSpriteHitboxRuntime({...enemy,facing},profile.sheetId).world;
    closeTo(bounds.x,enemy.x,'Facing-preserved collider X');closeTo(bounds.y,enemy.y,'Collider Y');
    closeTo(bounds.w,enemy.w,'Collider width');closeTo(bounds.h,enemy.h,'Collider height');
  }
  engine.drawBioforgeActorsV80(ctx);assert.equal(stack.length,0);
  assert.ok(drawings.some(call=>call.path===profile.path),`Dedicated atlas not rendered: ${profile.profileId}`);
  const drawn=drawings.find(call=>call.path===profile.path);
  assert.equal(drawn.args[2],profile.cellWidth);assert.equal(drawn.args[3],profile.cellHeight);
  simulate(engine,.5);
  assert.equal(engine.getBioforgeIsolationReportV80().secure,true);
  const before=physical(engine);assert.ok(before,'Physical state must remain valid.');
  engine.paused=true;const elapsed=engine.mission.elapsed;simulate(engine,.5);
  assert.equal(engine.mission.elapsed,elapsed);assert.deepEqual(physical(engine),before);engine.paused=false;
  const saved=structuredClone(engine.captureBioforgeResumeStateV80());
  assert.ok(saved.state.runtimeV81.physicalV87);
  assert.equal(sanitizeBioforgeV80(saved.state).activeSession.id,saved.state.activeSession.id);
  engine.stop({purge:false});
  assert.equal(engine.start({...subject.options,resumeState:saved}).started,true);
  await prepare(engine);assert.deepEqual(physical(engine),before);
  simulate(engine,.2);assert.equal(engine.getBioforgeIsolationReportV80().secure,true);
  const purged=engine.purgeBioforgeV80('v132-test');assert.equal(purged.completed,true);
  assert.ok(Object.values(purged.report).every(value=>value===0));
  assert.equal(engine.running,false);assert.equal(engine.enemies.length,0);
});

test('a corrupt active native atlas freezes simulation while purge stays available',async()=>{
  const subject=await fixture('enemy-008-queen'),{engine}=subject;
  await enterArena(subject);
  const profile=getBioforgeAdmissionV132('enemy-008-queen'),sheet=resolveSpriteSheet(profile.sheetId);
  const image=engine.images.get(sheet.imageKey),before=physical(engine);
  assert.equal(isBioforgeAdmissionImageReadyV132(image,profile),true);
  image.naturalWidth=1;engine.refreshEnemyAtlasAvailabilityV65();
  assert.equal(engine.bioforgeUserPoseIssueV87,'atlas-invalid-dimensions-v132');
  assert.equal(engine.enemyAtlasLoadingPausedV65,true);
  simulate(engine,.5);assert.deepEqual(physical(engine),before);
  assert.equal(engine.purgeBioforgeV80('corrupt-atlas').completed,true);
});

test('missing or malformed queued images cannot advance printing or manufacture an invisible actor',async()=>{
  const subject=await fixture('enemy-008-queen'),{engine}=subject;
  await enterArena(subject,{print:false});simulate(engine,.8);await prepare(engine);
  assert.equal(engine.bioforgeRootV80.activeSession.phase,'printing');
  const profile=getBioforgeAdmissionV132('enemy-008-queen'),sheet=resolveSpriteSheet(profile.sheetId);
  const image=engine.images.get(sheet.imageKey),serial=engine.bioforgeRootV80.activeSession.printedCount;
  for(const width of [0,1]) {
    image.naturalWidth=width;
    assert.equal(engine.advanceBioforgePhaseV80().applied,false);
    assert.equal(engine.bioforgeRootV80.activeSession.printedCount,serial);assert.equal(engine.enemies.length,0);
  }
  image.naturalWidth=profile.expectedWidth;engine.refreshEnemyAtlasAvailabilityV65();
  simulate(engine,.5);await prepare(engine);
  assert.equal(engine.enemies.length,1);engine.purgeBioforgeV80('queued-image-test');
});

test('40px lab bulkheads preserve clear perception, continuous pursuit and actual native attack damage',async()=>{
  const subject=await fixture(),{engine}=subject;const enemy=await enterArena(subject);
  for(const door of engine.doors) assert.equal(engine.getDoorRenderState(door,{open:false}).w,40);
  assert.equal(enemySightClearV130(engine,enemy,engine.player),true);
  const x=enemy.x,health=engine.player.health;simulate(engine,3);
  assert.equal(enemy.tacticsV130.mode,'pursuit');assert.ok(enemy.x<x);
  assert.ok(engine.player.health<health,'A native enemy must actually attack in the visible arena.');
  const saved=structuredClone(engine.captureBioforgeResumeStateV80()),state=structuredClone(enemy.tacticsV130);
  engine.stop({purge:false});assert.equal(engine.start({...subject.options,resumeState:saved}).started,true);await prepare(engine);
  assert.deepEqual(engine.enemies[0].tacticsV130,state);
  engine.purgeBioforgeV80('native-combat-test');
});

test('real lab shots emit persisted noise that ages only during active simulation',async()=>{
  const subject=await fixture(),{engine,key}=subject;await enterArena(subject);
  const ammo=engine.player.ammo;key('keydown','KeyF');simulate(engine,1/60);key('keyup','KeyF');
  assert.equal(engine.player.ammo,ammo-1);assert.equal(engine.enemyTacticsV130.noises.length,1);
  const remaining=engine.enemyTacticsV130.noises[0].remaining,saved=structuredClone(engine.captureBioforgeResumeStateV80());
  engine.stop({purge:false});assert.equal(engine.start({...subject.options,resumeState:saved}).started,true);await prepare(engine);
  assert.equal(engine.enemyTacticsV130.noises[0].remaining,remaining);
  engine.paused=true;simulate(engine,.5);assert.equal(engine.enemyTacticsV130.noises[0].remaining,remaining);
  engine.paused=false;simulate(engine,.5);closeTo(engine.enemyTacticsV130.noises[0].remaining,remaining-.5,'Noise lifetime');
  engine.purgeBioforgeV80('noise-test');
});

test('a present corrupt awareness cursor is rejected against its exact physical population and purged on resume',async()=>{
  const subject=await fixture(),{engine}=subject;await enterArena(subject);
  const saved=structuredClone(engine.captureBioforgeResumeStateV80()),cursor=saved.state.runtimeV81.enemyTacticsV132;
  assert.ok(sanitizeBioforgeTacticsV132(cursor,saved.state.runtimeV81.physicalV87));
  for(const change of [raw=>raw.enemies[0].id='foreign',raw=>raw.enemies[0].tactics.mode='invalid',
    raw=>raw.enemies[0].tactics.clock=Infinity,raw=>raw.enemies[0].tactics.targetId='squad:ghost']) {
    const corrupt=structuredClone(cursor);change(corrupt);
    assert.equal(sanitizeBioforgeTacticsV132(corrupt,saved.state.runtimeV81.physicalV87),null);
  }
  saved.state.runtimeV81.enemyTacticsV132.enemies[0].tactics.mode='invalid';
  engine.stop({purge:false});const result=engine.start({...subject.options,resumeState:saved});
  assert.equal(result.started,false);assert.equal(result.purge.completed,true);assert.equal(engine.enemies.length,0);
});

test('pending atlas requests remain bounded by active identities and the next queued profile',async()=>{
  const subject=await fixture(),{engine}=subject;
  await enterArena(subject);
  const result=engine.reinforceBioforgeV87({composition:BIOFORGE_ADMISSIONS_V132.map((profile,index)=>({
    lineId:`native-${index}`,profileId:profile.profileId,quantity:1})),maxConcurrent:12},{requestId:'v132-bounded-atlases'});
  assert.equal(result.applied,true);
  const sheets=engine.getVisibleEnemyAtlasSheetsV65();
  assert.ok(sheets.length<=2,`No eager loading of 38 unused atlases: ${sheets.length}`);
  engine.purgeBioforgeV80('bounded-atlas-test');
});

test('a rejected external reinforcement commit restores the last durable native population and stops the lab',async()=>{
  let allow=true;
  const subject=await fixture('enemy-007-praetorian',{onPersist:()=>allow}),{engine}=subject;
  await enterArena(subject);
  const durable=structuredClone(engine.bioforgeDurableStateV87.runtimeV81.physicalV87);allow=false;
  const result=engine.reinforceBioforgeV87({composition:[{lineId:'rejected',profileId:'enemy-008-queen',quantity:1}],maxConcurrent:12},{requestId:'v132-rejected'});
  assert.equal(result.applied,false);assert.equal(engine.bioforgeLastErrorV80,'persistence-failed');
  assert.equal(engine.running,false);assert.equal(engine.paused,true);
  assert.deepEqual(physical(engine),durable);
  assert.equal(engine.enemies.length,1);
});

