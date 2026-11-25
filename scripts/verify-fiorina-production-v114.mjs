import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openSync, readSync, closeSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, LEVEL_SEEDS, validateContent } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { buildFiorinaMissionV114 } from '../src/fiorina-campaign-v114.js';
import { SPECIAL_OPERATIONS_V131, isSoloSpecialOperationV131 } from '../src/special-operations-v131.js';
import { createDefaultSave, beginOperation, recordOperationResumeState, migrateSave } from '../src/save.js';
// Real production composition. Only the browser host is substituted. No source
// bitmap is synthesized, no engine gameplay method or result is mocked.
const root = fileURLToPath(new URL('../', import.meta.url));
const dimensions = new Map();
const OPERATIONS = Object.freeze(['jeri-false-son', 'atax-false-queen', 'eloise-uncrowned-queen',
  'protocol-z110', 'titan-equalizer', 'queen-mother-song', 'hive-world', 'pangaea-second-extinction',
  'mire-archive-001', 'black-abyss', 'broodstorm']);

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


const CAMPAIGN_ID = 'special-alien3-fiorina-161';
async function prepare(engine) {
  for (let count = 0; count < 40; count++) await Promise.resolve();
  await Promise.all((engine.getVisibleEnemyAtlasSheetsV65?.() || []).map(sheet => engine.ensureEnemyAtlas?.(sheet)));
  for (let count = 0; count < 40; count++) await Promise.resolve();
  engine.refreshEnemyAtlasAvailabilityV65?.();
}
function simulate(engine, seconds) {
  for (let remaining=seconds;remaining>1e-9;) { const dt=Math.min(1/60,remaining);engine.update(dt);remaining-=dt; }
}
async function native(cut='theatrical',resumeState) {
  const browser=host(),events=[],engine=new GameEngine(browser.canvas,{onEvent:event=>events.push(event)});
  const campaign=CAMPAIGNS.find(c=>c.id===CAMPAIGN_ID);
  assert.ok(campaign,'Fiorina must resolve in the production catalogue');
  const world=WORLDS.find(w=>w.id===campaign.worldId)||WORLDS[0];
  const missionLevel=buildFiorinaMissionV114({campaign,world,levelSeeds:LEVEL_SEEDS,seed:114});
  const options={campaign,world,missionLevel,levelSeed:missionLevel.levelSeed,weapon:WEAPONS[0],
    enemyCatalog:ENEMIES,equipment:[],crew:[],seed:114,alien3CutV114:cut,...(resumeState?{resumeState}:{})};
  engine.start(options);await prepare(engine);
  return{...browser,engine,events,options,campaign,world,missionLevel};
}

test('production catalogue and builder expose exactly one stable Fiorina route without changing prior template choices',()=>{
  assert.equal(validateContent().ok,true);
  assert.equal(CAMPAIGNS.filter(c=>c.id===CAMPAIGN_ID).length,1);
  const op=SPECIAL_OPERATIONS_V131.find(o=>o.campaignId===CAMPAIGN_ID);
  assert.ok(op?.playable);assert.equal(op.implementationStatus,'partial');assert.equal(op.canonExact,false);
  assert.equal(isSoloSpecialOperationV131(CAMPAIGN_ID),true);
  const level=buildFiorinaMissionV114();
  assert.equal(level.graph.nodes.length,72);
  assert.equal(level.graph.edges.length,119);
  const byId=new Map(level.graph.nodes.map(n=>[n.id,n]));
  for(const edge of level.graph.edges){assert.ok(byId.has(edge.from));assert.ok(byId.has(edge.to));}
  assert.equal(byId.get('f161-infirmary').x,1120);
  assert.equal(byId.get('f161-mold').x,4920);
});

for(const cut of ['theatrical','assembly']) test('real production engine starts Fiorina with '+cut+' continuity and a living solo protagonist',async()=>{
  const{engine,options}=await native(cut);
  try{
    assert.equal(engine.isAlien3ProductionV114(),true);
    assert.equal(engine.alien3CutV114,cut);
    assert.equal(engine.player.alive,true);
    assert.equal(engine.alien3StandardV104.scene.nodes.length,72);
    assert.ok(engine.alien3RunnerV88);
    assert.equal(engine.coopEnabled,false);
    engine.setCoop(true);
    assert.equal(engine.coopEnabled,false,'The profile setting cannot reactivate a marine partner');
    assert.equal(engine.vehicle?.active===true,false);
    assert.ok(engine.doors.some(d=>String(d.id).includes('infirmary')));
    assert.equal(engine.missionLevelRuntime.graph.nodes.length,options.missionLevel.graph.nodes.length);
  }finally{engine.stop();}
});

test('movement, pause and codex use the native lifecycle and do not retain duplicate keyboard listeners',async()=>{
  const{engine,key}=await native();
  try{
    const x=engine.player.x;
    key('keydown','ArrowRight');simulate(engine,.75);key('keyup','ArrowRight');
    assert.ok(engine.player.x>x+5,'Native keyboard movement must actually advance Ripley');
    engine.paused=true;
    const before=JSON.stringify(engine.captureResumeState().specialOperation);
    key('keydown','ArrowRight');simulate(engine,.4);key('keyup','ArrowRight');
    assert.equal(JSON.stringify(engine.captureResumeState().specialOperation),before,'Pause freezes DLC state');
    engine.paused=false;
    assert.equal(engine.alien3V98.codexUi.open,false);
    key('keydown','KeyC');key('keyup','KeyC');
    assert.equal(engine.alien3V98.codexUi.open,true,'One C event opens the codex once');
    key('keydown','KeyC');key('keyup','KeyC');
    assert.equal(engine.alien3V98.codexUi.open,false,'A second C event closes it once');
  }finally{engine.stop();}
});

test('Fiorina fire action cannot create military ammunition, bullets, melee attacks or an APC',async()=>{
  const{engine,events}=await native();
  try{
    const shots=engine.player.shots, ammo=engine.player.ammo, bullets=engine.bullets.length;
    engine.fire(engine.player);
    assert.equal(engine.bullets.length,bullets);
    assert.equal(engine.player.shots,shots);
    assert.equal(engine.player.ammo,ammo);
    engine.reload(engine.player);engine.melee(engine.player);engine.toggleVehicle(engine.player);
    assert.equal(engine.player.ammo,ammo);
    assert.equal(engine.vehicle?.active===true,false);
    assert.equal(events.some(e=>e.type==='shot'),false);
  }finally{engine.stop();}
});

test('production save sanitizer and migration preserve montage and DLC state before a fresh-engine resume',async()=>{
  const first=await native('assembly');
  let second;
  try{
    const save=createDefaultSave();
    if(!save.galaxy.unlockedWorldIds.includes(first.world.id))save.galaxy.unlockedWorldIds.push(first.world.id);
    const begun=beginOperation(save,first.campaign,first.world);
    assert.ok(begun.operation,'The campaign must create a real operation');
    const operation=begun.operation;
    operation.levelSeedId=first.engine.resumeIdentity.levelSeedId;
    operation.missionLevelSignature=first.missionLevel.signature;
    const captured=first.engine.captureResumeState();
    assert.equal(captured.specialOperation.alien3V114.cut,'assembly');
    assert.equal(recordOperationResumeState(save,captured),true);
    const migrated=migrateSave(JSON.parse(JSON.stringify(save)));
    const restored=migrated.strategy.currentOperation.resumeState;
    assert.equal(restored.specialOperation.alien3V114.cut,'assembly');
    second=await native('theatrical',restored);
    assert.equal(second.engine.lastResumeResult.applied,true,JSON.stringify(second.engine.lastResumeResult));
    assert.equal(second.engine.alien3CutV114,'assembly');
    assert.equal(second.engine.alien3V88.phase,first.engine.alien3V88.phase);
    assert.equal(second.engine.player.x,first.engine.player.x);
  }finally{first.engine.stop();second?.engine.stop();}
});

test('stopping Fiorina and starting an ordinary campaign removes the archive guards and state',async()=>{
  const{engine,key}=await native('assembly');
  try{
    engine.stop();
    const campaign=CAMPAIGNS.find(c=>!c.specialOperationId),world=WORLDS.find(w=>w.id===campaign.worldId)||WORLDS[0];
    const missionLevel=buildMissionLevelV52({campaign,world,levelSeeds:LEVEL_SEEDS,seed:114});
    engine.start({campaign,world,missionLevel,weapon:WEAPONS[0],enemyCatalog:ENEMIES,equipment:[],crew:[],seed:114});
    await prepare(engine);
    assert.equal(engine.isAlien3ProductionV114(),false);
    key('keydown','KeyC');key('keyup','KeyC');
    assert.equal(engine.alien3V98?.codexUi?.open===true,false);
    assert.equal(engine.captureResumeState().specialOperation?.alien3V114,undefined);
  }finally{engine.stop();}
});
