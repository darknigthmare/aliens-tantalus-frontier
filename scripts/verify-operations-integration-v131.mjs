import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openSync, readSync, closeSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, LEVEL_SEEDS, validateContent } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { buildHiveMissionV131 } from '../src/hive-missions-v131.js';
import { buildMechaMissionV131 } from '../src/mecha-missions-v131.js';
import { buildEcosystemMissionV131 } from '../src/ecosystem-missions-v131.js';
import { buildLegacyMissionV131 } from '../src/legacy-operations-v131.js';
import { buildApcConvoyLevelV121 } from '../src/apc-convoy-runtime-v121.js';
import { createDefaultSave, beginOperation, recordOperationResumeState, resolveOperation, migrateSave } from '../src/save.js';
import { firstProjectileObstacleV83 } from '../src/projectile-collision-v83.js';
import { validateOperationCompletionV131 } from '../src/operation-receipts-v131.js';
import { LEGACY_STATIONS_V131 } from '../src/legacy-operation-state-v131.js';
import { createHiveControlV131, validateHiveControlV131, hivePhaseV131 } from '../src/hive-control-v131.js';
import { createEcosystemStateV131, validateEcosystemStateV131, ecosystemPhaseV131 } from '../src/ecosystem-systems-v131.js';

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

function campaign(operationId) {
  const matches = CAMPAIGNS.filter(entry => entry.specialOperationId === operationId);
  assert.equal(matches.length, 1, `Production must route ${operationId} exactly once.`);
  return matches[0];
}

function productionLevel(selected, world) {
  const options = { levelSeeds: LEVEL_SEEDS, world, campaign: selected };
  if (selected.id === 'special-apc-convoy') return buildApcConvoyLevelV121(options);
  if (['jeri-false-son', 'atax-false-queen', 'eloise-uncrowned-queen'].includes(selected.specialOperationId)) return buildHiveMissionV131(options);
  if (['protocol-z110', 'titan-equalizer'].includes(selected.specialOperationId)) return buildMechaMissionV131(options);
  if (['queen-mother-song', 'hive-world', 'pangaea-second-extinction'].includes(selected.specialOperationId)) return buildEcosystemMissionV131(options);
  if (['mire-archive-001', 'black-abyss', 'broodstorm'].includes(selected.specialOperationId)) return buildLegacyMissionV131(options);
  return buildMissionLevelV52({ ...options, templateId: selected.templateId || 'colony-multiroute' });
}

async function fixture(operationId = 'jeri-false-son') {
  const browser = host(), events = [], engine = new GameEngine(browser.canvas, { onEvent: event => events.push(event) });
  const selected = campaign(operationId), world = WORLDS.find(entry => entry.id === selected.worldId) || WORLDS[0];
  const missionLevel = productionLevel(selected, world);
  const options = { world, campaign: selected, weapon: WEAPONS[0], enemyCatalog: ENEMIES,
    equipment: [], crew: [], seed: 131426, missionLevel };
  engine.start(options);
  await prepare(engine);
  return { ...browser, engine, events, options, selected };
}

async function prepare(engine) {
  for (let count = 0; count < 40; count++) await Promise.resolve();
  const sheets = engine.getVisibleEnemyAtlasSheetsV65?.() || [];
  await Promise.all(sheets.map(sheet => engine.ensureEnemyAtlas?.(sheet)));
  for (let count = 0; count < 40; count++) await Promise.resolve();
  engine.refreshEnemyAtlasAvailabilityV65?.();
}
function simulate(engine, seconds) {
  let remaining = seconds;
  while (remaining > 1e-9) { const dt = Math.min(1 / 60, remaining); engine.update(dt); remaining -= dt; }
}
function state(engine, operationId) {
  return operationStates(engine).find(value => value?.operationId === operationId);
}
function operationStates(engine) { return [engine.hiveV131, engine.mechaMissionV131, engine.ecosystemV131, engine.legacyMissionV131].filter(Boolean); }
function persistent(engine) { return structuredClone(engine.captureResumeState()); }

test('the production catalogue routes every new chapter once and preserves the existing campaign IDs', () => {
  assert.equal(validateContent().ok, true);
  for (const operationId of OPERATIONS) assert.ok(campaign(operationId).id.startsWith('special-'));
  for (const id of ['special-black-cocoon', 'special-apc-convoy', 'special-c12-horde', 'special-archive-relay',
    'special-cargo-brutal', 'special-alpha-bravo-doctrine', 'special-alien-survival-systems', 'pair-001-mire']) {
    assert.equal(CAMPAIGNS.filter(entry => entry.id === id).length, 1, id);
  }
});

test('hive validators reject a finished mission that skipped commissioning, inspections and its final decision', () => {
  for (const operationId of ['jeri-false-son', 'atax-false-queen', 'eloise-uncrowned-queen']) {
    const forged = createHiveControlV131(operationId);
    Object.assign(forged, { complete: true, rewardClaimed: true, rewards: {}, bossDefeated: true, bossPhase: 2, exitProgress: 2 });
    forged.phase = hivePhaseV131(forged);
    assert.equal(validateHiveControlV131(forged).valid, false, operationId);
  }
});

test('ecosystem validators reject Queen Mother extraction before final boss phase, beacons and defence', () => {
  const forged = createEcosystemStateV131('queen-mother-song');
  Object.assign(forged, { targets: [true, true, true], bossDefeated: true, complete: true,
    rewardClaimed: true, rewards: {}, extractionProgress: 2 });
  forged.phase = ecosystemPhaseV131(forged);
  assert.equal(validateEcosystemStateV131(forged).valid, false);
});

test('every new chapter starts a dedicated physical runtime, survives rendering and cannot complete without actions', async () => {
  for (const operationId of OPERATIONS) {
    const subject = await fixture(operationId), { engine, ctx, stack } = subject;
    const owned = state(engine, operationId);
    assert.ok(owned, `Dedicated state absent for ${operationId}.`);
    assert.equal(owned.complete, false); assert.equal(owned.rewardClaimed, false);
    assert.equal(engine.mission.state, 'active');
    assert.ok(Number.isFinite(engine.player.x) && Number.isFinite(engine.player.y));
    assert.ok(engine.platforms.length > 0 && engine.missionLevelBounds.width > 0);
    engine.drawWorld(ctx); engine.drawHud(ctx); assert.equal(stack.length, 0);
    simulate(engine, .4);
    assert.equal(owned.complete, false); assert.equal(owned.rewardClaimed, false);
    assert.notEqual(engine.mission.state, 'complete', `No generic extraction may complete ${operationId}.`);
    engine.stop();
  }
});

test('pause guards the final stack and freezes mission clocks, resources and accepted inputs for every chapter', async () => {
  for (const operationId of OPERATIONS) {
    const { engine, key } = await fixture(operationId), owned = state(engine, operationId);
    engine.paused = true;
    const snapshot = persistent(engine), clock = engine.animationTime, serial = engine.player.shots;
    key('keydown', 'KeyF'); key('keydown', 'KeyE'); key('keydown', 'Digit1');
    assert.equal(engine.fire(engine.player), false); assert.equal(engine.interact(engine.player), false);
    engine.update(.5); if (engine.enemies[0]) engine.updateEnemy(engine.enemies[0], .5);
    assert.equal(engine.animationTime, clock, operationId); assert.equal(engine.player.shots, serial, operationId);
    assert.deepEqual(persistent(engine), snapshot, `Pause changed persistent state of ${operationId}.`);
    assert.equal(owned.complete, false);
    engine.stop();
  }
});

test('production start restores its own chapter once and rejects a foreign resume without mutating live state', async () => {
  for (const operationId of OPERATIONS) {
    const { engine, options } = await fixture(operationId), saved = persistent(engine);
    engine.start({ ...options, resumeState: saved }); await prepare(engine);
    assert.equal(engine.lastResumeResult?.applied, true, `${operationId} rejects its own real capture: ${JSON.stringify(engine.lastResumeResult)}`);
    assert.equal(state(engine, operationId)?.complete, false);
    const before = persistent(engine), foreign = structuredClone(saved);
    foreign.identity.campaignId = 'other-operation'; foreign.player.health = 1;
    const result = engine.applyResumeState(foreign);
    assert.equal(result.applied, false, `${operationId} accepted a foreign identity.`);
    assert.deepEqual(persistent(engine), before, `${operationId} partially committed the rejected resume.`);
    engine.stop();
  }
});

test('switching chapters clears every unrelated operation state and never transfers a reward or pending action', async () => {
  const subject = await fixture(OPERATIONS[0]), { engine } = subject;
  for (const operationId of OPERATIONS.slice(1)) {
    const selected = campaign(operationId), world = WORLDS.find(entry => entry.id === selected.worldId) || WORLDS[0];
    const options = { ...subject.options, world, campaign: selected,
      missionLevel: productionLevel(selected, world), resumeState: undefined };
    engine.start(options); await prepare(engine);
    const active = operationStates(engine).filter(value => OPERATIONS.includes(value.operationId));
    assert.deepEqual([...new Set(active.map(value => value.operationId))], [operationId]);
    assert.equal(state(engine, operationId).complete, false); assert.equal(state(engine, operationId).rewardClaimed, false);
    assert.equal(engine.player.downed, false); assert.equal(engine.mission.state, 'active');
  }
  const selected = CAMPAIGNS.find(entry => entry.id === 'pair-004-frontier');
  const world = WORLDS.find(entry => entry.id === selected.worldId) || WORLDS[0];
  engine.start({ ...subject.options, world, campaign:selected, missionLevel:productionLevel(selected,world) });
  await prepare(engine);
  assert.deepEqual(operationStates(engine), [], 'Returning to a standard mission retains no V131 operation.');
  assert.equal(engine.mission.state, 'active'); assert.ok(engine.enemies.length);
  assert.ok(engine.verticalRuntimeV130, 'The standard ship still configures its V130 decks.');
  engine.stop();
});

test('real APC controls complete a finite course and archive one verified payout across save migration', async () => {
  const subject = await fixture('apc-convoy'), { engine, key, selected, options } = subject;
  const save = createDefaultSave(), operation = beginOperation(save, selected, options.world).operation;
  let completedEvent = null, terminalWasRecorded = false;
  const blockedShotExamples = [];
  engine.onEvent = event => {
    if (event.type === 'mission-complete') {
      completedEvent = event;
      terminalWasRecorded = recordOperationResumeState(save, engine.captureResumeState());
    }
    if (event.type === 'shot' && blockedShotExamples.length < 4) {
      const bullet = engine.bullets.at(-1), target = engine.apcConvoyTargetV121();
      if (bullet && target) {
        const time = (target.x + target.w / 2 - bullet.x) / bullet.vx;
        if (time > 0) {
          const collision = firstProjectileObstacleV83(bullet, {x:bullet.vx*time,y:bullet.vy*time},
            {walls:engine.walls,doors:engine.doors,platforms:engine.platforms,bounds:engine.missionLevelBounds});
          if (collision) blockedShotExamples.push({lane:engine.apcCourseStateV131.lane,origin:{x:bullet.x,y:bullet.y},
            target:{id:target.id,x:target.x,y:target.y,w:target.w,h:target.h},obstacle:collision.target?.id,contact:{x:collision.x,y:collision.y}});
        }
      }
    }
  };
  const held = new Set(), controls = next => {
    const desired = new Set(next);
    for (const code of held) if (!desired.has(code)) { key('keyup', code); held.delete(code); }
    for (const code of desired) if (!held.has(code)) { key('keydown', code); held.add(code); }
  };
  controls(['KeyE']); simulate(engine, .1); controls([]);
  assert.equal(engine.apcConvoyV121.briefed, true, 'E accepts the actual briefing.');
  let cooling = false;
  for (let frame = 0; frame < 180 * 60 && engine.mission.state === 'active'; frame++) {
    const convoy = engine.apcConvoyV121, course = engine.apcCourseStateV131;
    if (convoy.heat > 83 || convoy.overheated) cooling = true;
    if (convoy.heat < 33 && !convoy.overheated) cooling = false;
    const boss = engine.enemies.find(enemy => enemy.alive && enemy.apcConvoyRoleV121 !== 'horde');
    const nearest = boss || engine.enemies.filter(enemy => enemy.alive).sort((a,b) => b.x-a.x)[0];
    const desiredLane = nearest?.apcLaneV131 ?? course.lane;
    const next = convoy.phase === 'evacuation' ? ['KeyE'] : ['Space'];
    if (desiredLane < course.lane) next.push('KeyW');
    if (desiredLane > course.lane) next.push('KeyS');
    if (nearest && !cooling && engine.vehicle.turretAmmo > 0) next.push('KeyF');
    if (engine.vehicle.turretAmmo < 18 && engine.vehicle.turretReserve > 0) next.push('KeyR');
    controls(next); engine.update(1 / 60);
  }
  controls([]);
  assert.equal(engine.mission.state, 'complete', `Control course failed: ${JSON.stringify({convoy:engine.apcConvoyV121,
    course:engine.apcCourseStateV131,hull:engine.vehicle.hull,fuel:engine.vehicle.fuel,ammo:engine.vehicle.turretAmmo,
    reserve:engine.vehicle.turretReserve,shots:engine.player.shots,reason:engine.mission.failureReason,blockedShotExamples})}`);
  assert.ok(completedEvent); assert.equal(terminalWasRecorded, true);
  assert.equal(save.strategy.currentOperation.id, operation.id);
  const creditsBefore = save.galaxy.resources.credits, terminal = structuredClone(save.strategy.currentOperation);
  const resolution = resolveOperation(save, { success:true, kills:engine.player.kills, rewards:completedEvent.rewards });
  assert.equal(resolution.ok, true); assert.equal(resolution.success, true);
  assert.equal(save.galaxy.resources.credits - creditsBefore, completedEvent.rewards.credits);
  const result = save.strategy.lastOperation.apcCourseResultV131;
  assert.deepEqual(result, {mode:'finite',score:Math.floor(engine.apcCourseStateV131.score),laps:1,distance:3200,kills:engine.player.kills});
  const migrated = migrateSave(structuredClone(save));
  assert.deepEqual(migrated.strategy.lastOperation.apcCourseResultV131, result);
  const paidCredits = migrated.galaxy.resources.credits;
  migrated.strategy.currentOperation = terminal;
  assert.equal(resolveOperation(migrated, {success:true,rewards:completedEvent.rewards}).reason, 'operation-already-resolved');
  assert.equal(migrated.galaxy.resources.credits, paidCredits);
  engine.stop();
});

test('V131 result certification rejects ecosystem success while its recorded boss and organs are still alive', async () => {
  const {engine,selected,options}=await fixture('queen-mother-song');
  const save=createDefaultSave(), operation=beginOperation(save,selected,options.world).operation;
  operation.levelSeedId=engine.resumeIdentity.levelSeedId;
  operation.missionLevelSignature=options.missionLevel.signature;
  const raw=persistent(engine), terminal=raw.specialOperation.ecosystemV131;
  const rewards={credits:600,salvage:raw.inventory.salvage,intel:raw.inventory.intel,retries:0,elapsedSeconds:0,
    noCasualty:true,vehicleRecovered:false,operationId:'queen-mother-song',ending:'royal-route-broken',
    ecosystemIntegrity:100,nurserySaved:0,rescued:0};
  Object.assign(terminal,{targets:[true,true,true],bossPhase:4,bossDefeated:true,beacons:[true,true],defenceElapsed:22,
    extractionProgress:2,complete:true,rewardClaimed:true,phase:'complete',ending:'royal-route-broken',rewards});
  raw.mission.state='complete';raw.mission.rewards=structuredClone(rewards);
  assert.equal(validateEcosystemStateV131(terminal).valid,true,'The isolated terminal state is coherent.');
  assert.equal(engine.validateEcosystemResumeV131(raw).valid,false,'The physical capture contradicts the declared boss death.');
  assert.equal(recordOperationResumeState(save,raw),true);
  const before=structuredClone(save);
  assert.equal(validateOperationCompletionV131(operation,rewards).valid,false,'A result must validate actors as well as its progress flags.');
  assert.equal(resolveOperation(save,{success:true,rewards}).ok,false);
  assert.deepEqual(save,before,'An incoherent terminal result pays no resources and closes no deployment.');
  engine.stop();
});

test('real Nostromo controls traverse script gates, contain the hunt and certify the physical Narcissus departure', async () => {
  const {engine,key,selected,options,requests}=await fixture('mire-archive-001');
  const save=createDefaultSave(); save.galaxy.unlockedWorldIds.push(options.world.id);
  const operation=beginOperation(save,selected,options.world).operation;
  operation.levelSeedId=engine.resumeIdentity.levelSeedId; operation.missionLevelSignature=options.missionLevel.signature;
  let completedEvent;
  engine.onEvent=event=>{if(event.type==='mission-complete'){completedEvent=event;assert.equal(recordOperationResumeState(save,engine.captureResumeState()),true);}};
  async function frame() { engine.update(1/60); if(engine.enemyAtlasLoadingPausedV65) await prepare(engine); }
  async function walkTo(x) {
    const code=engine.player.x+engine.player.w/2<x?'KeyD':'KeyA'; key('keydown',code);
    for(let n=0;n<20*60&&Math.abs(engine.player.x+engine.player.w/2-x)>10&&engine.mission.state==='active';n++) await frame();
    key('keyup',code); simulate(engine,.1);
    assert.ok(Math.abs(engine.player.x+engine.player.w/2-x)<30,`Script gate blocks real route to ${x}: player=${engine.player.x}`);
  }
  for(const [index,station] of LEGACY_STATIONS_V131.nostromo.entries()) {
    if(index===3) {
      await prepare(engine);
      key('keydown','ShiftLeft');key('keydown','KeyD');key('keydown','KeyF');
      for(let n=0;n<8*60&&engine.enemies.some(actor=>actor.alive)&&engine.mission.state==='active';n++) await frame();
      key('keyup','KeyF');key('keyup','KeyD');key('keyup','ShiftLeft');
      assert.equal(engine.enemies.some(actor=>actor.alive),false,`The real weapon contains the hunt before the next script stage: ${JSON.stringify({
        player:{x:engine.player.x,y:engine.player.y,hp:engine.player.health,armor:engine.player.armor,shots:engine.player.shots,ammo:engine.player.ammo},
        enemies:engine.enemies.map(a=>({id:a.id,x:a.x,y:a.y,w:a.w,h:a.h,hp:a.health})),doors:engine.doors.map(d=>({x:d.x,locked:d.levelLocked,progress:d.progress})),
        aim:engine.player.combatAimV83,state:engine.mission.state,reason:engine.mission.failureReason,loading:engine.enemyAtlasLoadingPausedV65,
        readiness:engine.getEnemyAtlasAvailabilityV65?.(),missing:requests.filter(source=>!imageSize(source))})}`);
    }
    await walkTo(station.x);key('keydown','KeyE');
    for(let n=0;n<(station.seconds+.08)*60;n++) await frame();
    key('keyup','KeyE');
    if(index<6) assert.equal(engine.legacyMissionV131.stage,index+1,station.id);
  }
  assert.equal(engine.mission.state,'complete');assert.ok(completedEvent);assert.equal(engine.player.kills,1);
  assert.equal(validateOperationCompletionV131(operation,completedEvent.rewards).valid,true,'The real physical terminal checkpoint is certified.');
  const transplanted=structuredClone(operation);
  transplanted.resumeState.player.x=0;
  assert.equal(validateOperationCompletionV131(transplanted,completedEvent.rewards).valid,false,'A terminal result moved away from Narcissus must be rejected.');
  const result=resolveOperation(save,{success:true,rewards:completedEvent.rewards,kills:1});
  assert.equal(result.ok,true);assert.equal(result.success,true);
  assert.equal(save.strategy.lastOperation.operationResultV131?.operationId,'mire-archive-001');
  engine.stop();
});
