import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, copyFileSync, unlinkSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLDS, CAMPAIGNS, WEAPONS } from '../src/content.js';
import { GameEngine } from '../src/game-production-runtime.js';
import { hostV136 } from './forge-native-host-v136.mjs';
import { createDefaultSave, migrateSave, applyCostume } from '../src/save.js';
import { getCostumeV119, canEquipCostumeV119 } from '../src/franchise-costumes-v119.js';
import { getPlayerCostumeSkinV119, PLAYER_COSTUME_ASSETS_V119 } from '../src/player-costume-skins-v119.js';
import { PLAYER_COSTUME_SKINS_V165, PLAYER_COSTUME_ASSETS_V165,
  getPlayerCostumePreviewSkinV165 } from '../src/player-costume-atlases-v165.js';
import { PLAYER_COSTUME_OUTFITS_V165, PLAYER_COSTUME_LINKED_OUTFITS_V165, COSTUME_APPEARANCE_PRESETS_V165,
  applyCostumeOutfitV165 } from '../src/player-costume-outfits-v165.js';
import { PLAYER_COSTUME_PARTS_V165, PLAYER_COSTUME_PART_ASSETS_V165,
  PLAYER_COSTUME_LEG_DEFINITIONS_V165 } from '../src/player-costume-parts-v165.js';
import { normalizePlayerAppearanceV126, getPlayerAppearanceItemV126,
  PLAYER_APPEARANCE_PRESETS_V129, getPlayerAppearancePresetV129 } from '../src/player-appearance-v126.js';
import { PLAYER_BODY_RIG_ASSETS_V125, resolvePlayerBodyRigV125 } from '../src/player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ASSETS_V126, drawPlayerModularRigV126 } from '../src/player-modular-rig-v126.js';
import { PLAYER_TRANSIT_RIG_ASSETS_V128, resolvePlayerTransitRigV128, drawPlayerTransitRigV128 } from '../src/player-transit-rig-v128.js';
import { PLAYER_ACTION_PROP_ASSETS_V127, resolvePlayerActionRigV127, drawPlayerActionRigV127 } from '../src/player-action-rig-v127.js';
import { resolvePlayerLocomotionRigV129 } from '../src/player-locomotion-rig-v129.js';
import { PLAYER_COLONIAL_RIG_ASSETS_V129 } from '../src/player-colonial-art-v129.js';
import { PLAYER_APPEARANCE_PREVIEW_MODES_V128, samplePlayerAppearancePreviewV128 } from '../src/player-appearance-preview-v126.js';
import { resolveHeldWeaponProfileV125 } from '../src/held-weapon-profiles-v125.js';
import { getHeldWeaponPoseV125 } from '../src/held-weapon-renderer-v125.js';
import { renderCostumeArchiveCardV119, buildCostumeArchivesModelV119 } from '../src/costume-ui-v119.js';
import { publicCostumePathAdmissionV165, verifyPublicCostumeAdmissionsV165,
  PUBLIC_COSTUME_ASSET_PATHS_V165, PUBLIC_COSTUME_RUNTIME_PATHS_V165,
  PUBLIC_COSTUME_SCRIPT_PATHS_V165 } from './public-costume-admissions-v165.mjs';

const root = new URL('../', import.meta.url);
const allAssets = [...PLAYER_BODY_RIG_ASSETS_V125, ...PLAYER_MODULAR_RIG_ASSETS_V126,
  ...PLAYER_TRANSIT_RIG_ASSETS_V128, ...PLAYER_ACTION_PROP_ASSETS_V127,
  ...PLAYER_COLONIAL_RIG_ASSETS_V129, ...PLAYER_COSTUME_PART_ASSETS_V165];
const portable = [...new Map(WEAPONS.map(descriptor => ({ descriptor, profile: resolveHeldWeaponProfileV125(descriptor) }))
  .filter(row => row.profile?.portable).map(row => [row.profile.weaponId, row])).values()];
const images = new Map([...allAssets, ...portable.map(row => row.profile)].map(asset => [asset.imageKey,
  { src: asset.path, complete: true, naturalWidth: asset.sourceWidth, naturalHeight: asset.sourceHeight }]));
const pngCache = new Map();
function png(asset) {
  if (pngCache.has(asset.path)) return pngCache.get(asset.path);
  const bytes = readFileSync(new URL('.' + asset.path, root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
  assert.equal(bytes.subarray(0,8).toString('hex'), '89504e470d0a1a0a');
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.deepEqual([width,height], [asset.sourceWidth,asset.sourceHeight]);
  assert.equal(bytes[24],8); assert.equal(bytes[25],6); assert.equal(bytes[28],0);
  const chunks=[];
  for(let at=8;at<bytes.length;){const size=bytes.readUInt32BE(at);assert.ok(at+size+12<=bytes.length);
    if(bytes.toString('ascii',at+4,at+8)==='IDAT')chunks.push(bytes.subarray(at+8,at+8+size));at+=size+12;}
  const raw=inflateSync(Buffer.concat(chunks)),stride=width*4,data=Buffer.alloc(width*height*4);
  assert.equal(raw.length,(stride+1)*height);
  const paeth=(a,b,c)=>{const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c);return da<=db&&da<=dc?a:db<=dc?b:c;};
  for(let y=0;y<height;y++){const row=y*stride,start=y*(stride+1),filter=raw[start];assert.ok(filter<=4);
    for(let x=0;x<stride;x++){const a=x>=4?data[row+x-4]:0,b=y?data[row+x-stride]:0,c=y&&x>=4?data[row+x-stride-4]:0;
      data[row+x]=(raw[start+x+1]+(filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c)))&255;}}
  const decoded={width,height,data,alpha:(x,y)=>data[(Math.round(y)*width+Math.round(x))*4+3]};
  pngCache.set(asset.path,decoded);return decoded;
}
const host=()=>{const calls=[],stack=[];return {calls,stack,ctx:{save(){stack.push(1);},restore(){assert.ok(stack.pop());},
  transform(...values){assert.ok(values.every(Number.isFinite));},drawImage(...args){calls.push(args);},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){}}};};
function render(preset, mode, facing=1, descriptor=portable[0].descriptor, selectedImages=images) {
  const appearance=normalizePlayerAppearanceV126({schema:126,slots:preset.slots});
  const sample=samplePlayerAppearancePreviewV128({appearance,animation:mode.id,timeSeconds:mode.fixedTime,facing,weaponDescriptor:descriptor});
  const options={actor:sample.actor,appearance,images:selectedImages,timeSeconds:sample.timeSeconds,surface:'mission'};
  const decorate=bodyRig=>resolvePlayerLocomotionRigV129({...options,bodyRig,legDefinitions:PLAYER_COSTUME_LEG_DEFINITIONS_V165}).bodyRig;
  const transit=sample.transit?resolvePlayerTransitRigV128({...options,ladder:sample.ladder,transitState:sample.transitState,
    legDefinitions:PLAYER_COSTUME_LEG_DEFINITIONS_V165}):null;
  const action=sample.action?resolvePlayerActionRigV127({...options,weaponDescriptor:descriptor,decorateBodyRigV129:decorate}):null;
  const body=transit?.bodyRig||action?.bodyRig||decorate(resolvePlayerBodyRigV125(options));
  const draw=host();let result,weaponPose;
  if(transit?.eligible)result=drawPlayerTransitRigV128(draw.ctx,{transitRig:transit,appearance,images:selectedImages});
  else if(action?.eligible)result=drawPlayerActionRigV127(draw.ctx,{actionRig:action,appearance,images:selectedImages});
  else{
    weaponPose=sample.profile?getHeldWeaponPoseV125({actor:sample.actor,descriptor,bodyRig:body,timeSeconds:sample.timeSeconds,surface:'mission'}):null;
    result=drawPlayerModularRigV126(draw.ctx,{bodyRig:body,appearance,images:selectedImages,
      ...(weaponPose?{weaponPose,drawWeapon(){}}:{})});
  }
  return {sample,body,result,weaponPose,draw};
}

function nativeHeldWeaponFramePredicateV165() {
  const qa = readFileSync(new URL('./qa-costume-atlases-v165.py', import.meta.url), 'utf8');
  const expression = qa.match(/NATIVE_HELD_WEAPON_FRAME_V165 = '''([\s\S]*?)'''/);
  assert.ok(expression, 'Read the predicate actually shared by native aim and shot observations.');
  return new Function('e', 'p', `return Boolean(${expression[1]});`);
}

function nativeTerminalObservationV165() {
  const qa = readFileSync(new URL('./qa-costume-atlases-v165.py', import.meta.url), 'utf8');
  const expression = qa.match(/NATIVE_TERMINAL_V165 = '''([\s\S]*?)'''/);
  assert.ok(expression, 'Read the exact terminal approach/action observer used by the browser QA.');
  return new Function(`return (${expression[1]});`)();
}

function nativeCostumeFloorV165({ spawn = 2, terminal = 4, blocked = false } = {}) {
  return { schema: 2, kind: 'mission', name: 'QA tenue modulaire V165', size: [48, 18],
    tiles: [...Array.from({ length: 48 }, (_, x) => ({ position: `${x}:16`, type: 'floor' })),
      { position: `${spawn}:15`, type: 'spawn' }, { position: '46:15', type: 'objective' },
      ...(terminal === null ? [] : [{ position: `${terminal}:15`, type: 'terminal' }]),
      ...(blocked ? [{ position: '3:15', type: 'door' }] : [])] };
}

async function withNativeCostumeFixtureV165(run, { project = null } = {}) {
  const names = ['addEventListener', 'removeEventListener', 'dispatchEvent', 'document',
    'Image', 'requestAnimationFrame', 'cancelAnimationFrame', 'window', '__ATF_GAME__', '__COSTUME_V165_OBSERVER__'];
  const previous = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  let engine;
  try {
    const host = hostV136(), draws = [], events = [], ctx = host.canvas.getContext('2d');
    const dimensions = new Map([...allAssets, ...portable.map(row => row.profile)]
      .map(asset => [asset.path, { width: asset.sourceWidth, height: asset.sourceHeight }]));
    // The production engine, input events and renderer are real. DOM, RAF,
    // images and canvas calls are explicit doubles, not raster/Chromium proof.
    globalThis.Image = class extends EventTarget {
      complete = true; naturalWidth = 0; naturalHeight = 0; width = 0; height = 0;
      async decode() {}
      set src(path) {
        this._src = path;
        const size = dimensions.get(path) || { width: 1024, height: 1024 };
        this.naturalWidth = this.width = size.width; this.naturalHeight = this.height = size.height;
        queueMicrotask(() => this.dispatchEvent(new Event('load')));
      }
      get src() { return this._src; }
    };
    ctx.drawImage = (...args) => draws.push(args);
    const outfit = PLAYER_COSTUME_OUTFITS_V165.find(row => row.slug === 'amanda-working');
    assert.ok(outfit);
    engine = new GameEngine(host.canvas, { onEvent: event => events.push(event) });
    engine.start({ world: WORLDS[0], campaign: CAMPAIGNS[0],
      weapon: WEAPONS.find(row => row.id === 'weapon-003-m4a3-service-pistol'),
      enemyCatalog: [], equipment: [], crew: [], seed: 426, costume: getCostumeV119(outfit.costumeId),
      playerAppearanceV126: { schema: 126, slots: outfit.slots },
      ...(project ? { editorProject: project, forgeJourneyV141: true } : {}) });
    if (!project) {
      Object.assign(engine, { platforms: [{ id: 'qa-floor', x: -200, y: 930, w: 6800, h: 200, floor: true }],
        ladders: [], lifts: [], walls: [], covers: [], doors: [], hazards: [], enemies: [], missionLevelRuntime: null });
      Object.assign(engine.player, { x: 160, y: 838, vx: 0, vy: 0, grounded: true, operatorId: 'echo-9' });
    }
    for (let count = 0; count < 10; count++) {
      await Promise.resolve(); engine.update(1 / 60); engine.drawActor(ctx, engine.player);
    }
    const pointer = (button, buttons, down = true) => {
      const event = new Event(down ? 'pointerdown' : 'pointerup', { cancelable: true });
      Object.assign(event, { pointerId: 47, pointerType: 'mouse', button, buttons, clientX: 1200, clientY: 500 });
      host.canvas.focus(); host.canvas.dispatchEvent(event);
    };
    const key = (code, down = true) => {
      host.canvas.focus();
      const event = new Event(down ? 'keydown' : 'keyup', { cancelable: true });
      Object.assign(event, { code, repeat: false }); host.events.dispatchEvent(event);
    };
    const press = code => { key(code); key(code, false); };
    const frame = () => { engine.update(1 / 60); engine.drawActor(ctx, engine.player); };
    const until = (condition, limit = 1800) => {
      for (let count = 0; count < limit; count++) { if (condition()) return true; frame(); }
      return condition();
    };
    const walk = target => {
      const right = target > engine.player.x, code = right ? 'KeyD' : 'KeyA'; key(code);
      let reached;
      try { reached = until(() => right ? engine.player.x >= target : engine.player.x <= target); }
      finally { key(code, false); }
      assert.ok(until(() => Math.abs(engine.player.vx) < 1), 'The real controller settles after releasing the key.');
      return reached;
    };
    await run({ engine, actor: engine.player, canvas: host.canvas, ctx, draws, pointer, outfit, events, press, frame, until, walk });
  } finally {
    engine?.stop();
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
}

test('V165 native costume QA approaches the compiled terminal through real input and observes its exact action', async () => {
  const observe = nativeTerminalObservationV165();
  await withNativeCostumeFixtureV165(({ engine, actor, ctx, pointer, outfit, events, press, frame, until, walk }) => {
    // The same 48x18 editor fixture goes through createForgeSessionV141,
    // forgeRoomProjectV141 and compileEditorGridV136 inside the production start.
    assert.ok(engine.forgeSessionV141); assert.deepEqual(engine.editorGridV136,
      { columns: 48, rows: 18, tileWidth: 6200 / 48, tileHeight: 60 });
    assert.ok(Math.abs(actor.x - 303.54166666666663) < .001); assert.equal(actor.y, 868);
    const origin = actor.x, target = observe(engine).target;
    assert.ok(Math.abs(target.x - 568.3333333333333) < .001);
    assert.deepEqual([target.y, target.w, target.h], [900, 52, 60]);
    assert.equal(walk(origin + 110), true);
    pointer(2, 2); frame(); assert.equal(actor.aimingV124, true);
    const shots = actor.shots, ammo = actor.ammo;
    pointer(0, 3); frame(); pointer(0, 2, false); pointer(2, 0, false);
    assert.equal(actor.shots, shots + 1); assert.equal(actor.ammo, ammo - 1);
    press('KeyR'); assert.ok(until(() => !actor.reloading));
    press('KeyQ'); frame(); assert.equal(actor.playerActionVisualV127.kind, 'motion-tracker');
    assert.ok(until(() => !(actor.toolUseClock > 0)));
    assert.equal(walk(origin + 70), true);
    const distance = Math.hypot(actor.x + actor.w / 2 - target.x - target.w / 2,
      actor.y + actor.h / 2 - target.y - target.h / 2);
    assert.ok(distance > 200, 'The former spawn-relative return is outside the native 130px reach.');
    assert.equal(observe(engine, target).ready, false);
    press('KeyE'); for (let count = 0; count < 900; count++) frame();
    assert.equal(actor.interactionClock, 0); assert.equal(engine.powerNode.active, false);
    assert.equal(engine.mission.objectives.power, false);
    assert.equal(events.filter(event => event.type === 'power-restored').length, 0);

    assert.equal(walk(observe(engine, target).x), true);
    assert.equal(observe(engine, target).ready, true);
    assert.equal(engine.forgePendingTerminalV156(actor), engine.powerNode);
    assert.equal(observe(engine, target).drawn, false);
    const ammoBeforeInteraction = actor.ammo, reserve = actor.ammoReserve;
    press('KeyE');
    assert.equal(engine.powerNode.active, true); assert.equal(engine.mission.objectives.power, true);
    assert.equal(observe(engine, target).drawn, false, 'An accepted E cannot reuse the preceding framebuffer.');
    engine.drawActor(ctx, actor);
    assert.equal(observe(engine, target).drawn, true);
    assert.deepEqual(actor.playerAppearanceVisualV126.selected.slots, outfit.slots);
    assert.equal(actor.playerActionVisualV127.kind, 'control-use');
    assert.equal(events.filter(event => event.type === 'power-restored').length, 1);
    assert.equal(actor.ammo, ammoBeforeInteraction); assert.equal(actor.ammoReserve, reserve);
    engine.update(1 / 60);
    assert.equal(observe(engine, target).drawn, false, 'The action receipt must belong to this animation frame.');
    engine.drawActor(ctx, actor); assert.equal(observe(engine, target).drawn, true);
    assert.ok(until(() => !(actor.interactionClock > 0)));
    assert.equal(observe(engine, target).drawn, false, 'A completed power objective is not a new interaction.');
    assert.deepEqual(observe(engine).target, target);
    assert.equal(events.filter(event => event.type === 'power-restored').length, 1);
  }, { project: nativeCostumeFloorV165() });
});

test('V165 native costume QA follows real terminal geometry from both directions', async () => {
  const observe = nativeTerminalObservationV165();
  for (const setup of [{ spawn: 2, terminal: 6 }, { spawn: 8, terminal: 4 }]) {
    await withNativeCostumeFixtureV165(({ engine, actor, ctx, outfit, events, press, walk }) => {
      const state = observe(engine), origin = actor.x;
      assert.equal(state.active, false); assert.equal(state.power, false);
      assert.equal(Math.sign(state.x - origin), setup.spawn < setup.terminal ? 1 : -1);
      assert.equal(walk(state.x), true);
      assert.equal(observe(engine, state.target).ready, true);
      press('KeyE'); engine.drawActor(ctx, actor);
      assert.equal(observe(engine, state.target).drawn, true);
      assert.deepEqual(actor.playerAppearanceVisualV126.selected.slots, outfit.slots);
      assert.equal(events.filter(event => event.type === 'power-restored').length, 1);
    }, { project: nativeCostumeFloorV165(setup) });
  }
});

test('V165 native costume QA refuses absent, obstructed or changed terminals and unrelated E actions', async () => {
  const observe = nativeTerminalObservationV165();
  await withNativeCostumeFixtureV165(({ engine, actor, events }) => {
    const origin = { x: actor.x, y: actor.y };
    assert.equal(engine.powerNode, null);
    assert.throws(() => observe(engine), /terminal is missing or invalid/);
    assert.deepEqual({ x: actor.x, y: actor.y }, origin);
    assert.equal(events.filter(event => event.type === 'power-restored').length, 0);
  }, { project: nativeCostumeFloorV165({ terminal: null }) });
  await withNativeCostumeFixtureV165(({ engine, actor, ctx, events, press, walk }) => {
    const state = observe(engine), door = engine.doors[0];
    assert.equal(door.open, false);
    assert.equal(walk(state.x), false, 'The unchanged 30s movement budget fails against a real closed door.');
    assert.ok(actor.x + actor.w <= door.x + .01);
    assert.equal(observe(engine, state.target).ready, false);
    assert.equal(engine.powerNode.active, false);
    // An E near the blocking door is a real action, but never this terminal's action.
    press('KeyE'); engine.drawActor(ctx, actor);
    assert.equal(door.open, true); assert.ok(actor.interactionClock > 0);
    assert.equal(actor.interactionKind, 'force-interact');
    assert.equal(observe(engine, state.target).drawn, false);
    assert.equal(engine.powerNode.active, false); assert.equal(engine.mission.objectives.power, false);
    assert.equal(events.filter(event => event.type === 'power-restored').length, 0);
    for (const field of ['id', 'cellId', 'roomId', 'x', 'y', 'w', 'h']) {
      const changed = { ...state.target, [field]: typeof state.target[field] === 'number' ? state.target[field] + 1 : 'other' };
      assert.throws(() => observe(engine, changed), /terminal changed/, field);
    }
  }, { project: nativeCostumeFloorV165({ blocked: true }) });
});

test('V165 native costume QA captures terminal activation and its rendered frame in the same observer callback', async () => {
  const observe = nativeTerminalObservationV165();
  const qa = readFileSync(new URL('./qa-costume-atlases-v165.py', import.meta.url), 'utf8');
  const source = qa.match(/def observe_action\(page,condition\):\n page\.evaluate\('''([\s\S]*?)''',condition\)/);
  assert.ok(source, 'Execute the exact browser action observer, including capture and rejection.');
  const install = new Function(`return (${source[1]});`)();
  await withNativeCostumeFixtureV165(async ({ engine, actor, canvas, press, frame, until, walk }) => {
    const state = observe(engine); assert.ok(walk(state.x));
    const callbacks = [];
    globalThis.window = globalThis; globalThis.__ATF_GAME__ = engine;
    globalThis.requestAnimationFrame = callback => { callbacks.push(callback); return callbacks.length; };
    globalThis.document.querySelector = selector => selector === '#game-canvas' ? canvas : null;
    // A frame label replaces raster bytes in this controller test; no PNG proof is claimed.
    canvas.toDataURL = () => `test-frame:${engine.animationTime}`;
    const expression = qa.match(/NATIVE_TERMINAL_V165 = '''([\s\S]*?)'''/)[1];
    install(`(${expression})(e,${JSON.stringify(state.target)}).drawn`);
    const promise = globalThis.__COSTUME_V165_OBSERVER__;
    press('KeyE'); callbacks.shift()();
    assert.equal(callbacks.length, 1, 'Accepted gameplay still waits for the action to be drawn.');
    frame(); const sampledAt = engine.animationTime; callbacks.shift()();
    assert.equal(callbacks.length, 0);
    const captured = await promise;
    assert.equal(captured.png, `test-frame:${sampledAt}`);
    assert.equal(captured.state.appearance.sampledAt, sampledAt);
    assert.equal(captured.state.terminal.id, state.target.id);
    assert.equal(captured.state.terminal.forgeCellIdV141, state.target.cellId);
    assert.equal(captured.state.roomId, state.target.roomId);
    assert.equal(captured.state.terminal.active, true); assert.equal(captured.state.powerObjective, true);
    assert.equal(captured.state.action.kind, 'control-use'); assert.equal(captured.state.action.drawn, true);
    assert.ok(captured.state.player.interactionClock > 0);
    assert.ok(until(() => !(actor.interactionClock > 0)));
    assert.ok(captured.state.player.interactionClock > 0, 'The resolved snapshot cannot decay before the Python capture consumes it.');
    install(`(${expression})(e,${JSON.stringify({ ...state.target, cellId: 'changed-cell' })}).drawn`);
    callbacks.shift()();
    await assert.rejects(globalThis.__COSTUME_V165_OBSERVER__, /terminal changed/);
    assert.equal(callbacks.length, 0, 'Invalid target identity rejects instead of leaving an unresolved observer.');
  }, { project: nativeCostumeFloorV165() });
});

test('V165 native costume QA observes the real weapon receipt and waits for the accepted shot to be drawn', async () => {
  const ready = nativeHeldWeaponFramePredicateV165();
  await withNativeCostumeFixtureV165(({ engine, actor, ctx, draws, pointer, outfit }) => {
    pointer(2, 2); engine.update(1 / 60); engine.drawActor(ctx, actor);
    assert.equal(actor.aimingV124, true);
    assert.equal(actor.heldWeaponVisualV125.visible, undefined, 'The production receipt has no visible flag.');
    assert.equal(ready(engine, actor), true);
    assert.deepEqual(actor.playerAppearanceVisualV126.selected.slots, outfit.slots);
    assert.ok(draws.some(([image]) => image.src === actor.heldWeaponVisualV125.path));
    const shots = actor.shots, ammo = actor.ammo, reserve = actor.ammoReserve;
    pointer(0, 3);
    assert.equal(actor.shots, shots + 1, 'The real pointer event accepts one native shot.');
    assert.equal(actor.ammo, ammo - 1); assert.equal(actor.ammoReserve, reserve);
    assert.equal(actor.heldWeaponVisualV125.shotSerial, shots);
    assert.equal(ready(engine, actor), false, 'A live shot cannot reuse the previous rendered frame.');
    engine.drawActor(ctx, actor);
    assert.equal(ready(engine, actor), true);
    assert.equal(actor.shots, shots + 1, 'Drawing a receipt cannot duplicate the accepted shot.');
    assert.equal(actor.ammo, ammo - 1); assert.equal(actor.ammoReserve, reserve);
    assert.equal(actor.heldWeaponVisualV125.shotSerial, actor.shots);
    assert.equal(actor.heldWeaponVisualV125.weaponId, 'weapon-003-m4a3-service-pistol');
    engine.update(1 / 60);
    assert.equal(ready(engine, actor), false, 'A receipt from the previous animation time is not current.');
    engine.drawActor(ctx, actor); assert.equal(ready(engine, actor), true);
    engine.stop(); assert.equal(ready(engine, actor), false);
  });
});

test('V165 native costume QA rejects missing, mismatched and fallback weapon observations', async () => {
  const ready = nativeHeldWeaponFramePredicateV165();
  await withNativeCostumeFixtureV165(({ engine, actor }) => {
    assert.equal(ready(engine, actor), true);
    const mutations = [
      ['missing receipt', row => { row.heldWeaponVisualV125 = null; }],
      ['foreign schema', row => { row.heldWeaponVisualV125.schema = 124; }],
      ['old shot', row => { row.heldWeaponVisualV125.shotSerial--; }],
      ['future shot', row => { row.heldWeaponVisualV125.shotSerial++; }],
      ['old frame', row => { row.heldWeaponVisualV125.timeSeconds -= .01; }],
      ['future frame', row => { row.heldWeaponVisualV125.timeSeconds += .01; }],
      ['missing outfit', row => { row.playerAppearanceVisualV126 = null; }],
      ['undrawn outfit', row => { row.playerAppearanceVisualV126.drawn = false; }],
      ['missing layers', row => { delete row.playerAppearanceVisualV126.layers; }],
      ['unarmed layers', row => { row.playerAppearanceVisualV126.layers = row.playerAppearanceVisualV126.layers.filter(layer => layer.slot !== 'weapon'); }],
      ['different weapon layer', row => { row.playerAppearanceVisualV126.layers.find(layer => layer.slot === 'weapon').itemId = 'weapon-001-m41a-pulse-rifle'; }]
    ];
    for (const [label, mutate] of mutations) {
      const row = structuredClone(actor); mutate(row);
      assert.equal(ready(engine, row), false, label);
    }
    assert.equal(ready(engine, actor), true, 'Testing rejected observations never changes the live receipt.');
  });
});

test('V165 eight new outfits own six admitted cosmetic slots, distinct from the four historical film presets',()=>{
  assert.equal(PLAYER_COSTUME_OUTFITS_V165.length,8);assert.equal(PLAYER_APPEARANCE_PRESETS_V129.length,4);
  for(const outfit of PLAYER_COSTUME_OUTFITS_V165){
    assert.deepEqual(Object.keys(outfit.slots).sort(),['arms','back','helmet','legs','mask','torso']);
    assert.equal(outfit.exact,false);assert.equal(outfit.cosmeticOnly,true);
    assert.equal(getCostumeV119(outfit.costumeId).outfitId,outfit.id);assert.equal(canEquipCostumeV119(outfit.costumeId),true);
    for(const [slot,id]of Object.entries(outfit.slots))if(id!==null)assert.equal(getPlayerAppearanceItemV126(id)?.slot,slot);
    assert.deepEqual(normalizePlayerAppearanceV126({schema:126,slots:outfit.slots}).slots,outfit.slots);
  }
});

test('V165 full-body reference boards cannot become playable or baked-weapon fallbacks',()=>{
  assert.equal(PLAYER_COSTUME_ASSETS_V119.length,5);assert.equal(PLAYER_COSTUME_ASSETS_V165.length,15);
  assert.equal(getPlayerCostumeSkinV119('franchise-nostromo-crew').id,'player.nostromo-crew-v119');
  for(const skin of PLAYER_COSTUME_SKINS_V165){
    assert.equal(skin.admission,'reference-preview-only-not-playable-skin');assert.equal(skin.runtimeMode,'preview-only-v165');
    assert.equal(skin.atlases.reduce((sum,atlas)=>sum+atlas.frames.length,0),80);
    assert.equal(getPlayerCostumeSkinV119(skin.costumeId),null);assert.equal(getPlayerCostumePreviewSkinV165(skin.costumeId),skin);
    for(const atlas of skin.atlases){const image=png(atlas);for(const frame of atlas.frames){
      const r=frame.source;assert.ok(r.x>=0&&r.y>=0&&r.width>0&&r.height>0&&r.x+r.width<=image.width&&r.y+r.height<=image.height);}}
  }
});

test('V165 Hicks and Hudson archive application uses their exact existing V129 clothes without relabelling the Vasquez BDU',()=>{
  assert.equal(PLAYER_COSTUME_LINKED_OUTFITS_V165.length,2);
  for(const outfit of PLAYER_COSTUME_LINKED_OUTFITS_V165){
    const preset=getPlayerAppearancePresetV129(outfit.id);assert.ok(preset);
    assert.deepEqual(outfit.slots,preset.slots);assert.equal(outfit.sourceCharacter,preset.sourceCharacter);
    assert.equal(getCostumeV119(outfit.costumeId).outfitId,preset.id);
    const save=createDefaultSave(),before=structuredClone(save);applyCostume(save,outfit.costumeId);
    assert.deepEqual(save.player.appearanceV126.slots,preset.slots);
    assert.deepEqual(save.player.weaponIds,before.player.weaponIds);assert.deepEqual(save.galaxy.resources,before.galaxy.resources);
    assert.equal(getPlayerCostumeSkinV119(outfit.costumeId),null);
  }
  assert.equal(getCostumeV119('franchise-vasquez-bdu').outfitId,null);
  assert.equal(canEquipCostumeV119('franchise-vasquez-bdu'),false);
});

test('V165 seventeen original part PNGs have genuine transparency and measured torso/helmet apertures',()=>{
  assert.equal(PLAYER_COSTUME_PART_ASSETS_V165.length,17);
  for(const asset of PLAYER_COSTUME_PART_ASSETS_V165){const image=png(asset);let empty=0,solid=0;
    for(let at=3;at<image.data.length;at+=4){if(image.data[at]===0)empty++;if(image.data[at]>=128)solid++;}
    assert.ok(empty>image.width*image.height*.1);assert.ok(solid>image.width*image.height*.05);
  }
  for(const kit of Object.values(PLAYER_COSTUME_PARTS_V165)){
    const upper=png(kit.upperAsset),legs=png(kit.legAsset);
    for(const part of Object.values(kit.torso))for(const point of Object.values(part.apertures))assert.ok(upper.alpha(point.x,point.y)<=16);
    for(const side of ['near','far']){const part=kit.legs[side].boot;assert.ok(legs.alpha(part.sole.x,part.sole.y)>=128);
      assert.equal(part.sole.y,part.alphaBounds[3]-1);}
    for(const helmet of Object.values(kit.helmet||{})){const image=png(helmet.asset),p=helmet.part.apertures.face;assert.ok(image.alpha(p.x,p.y)<=16);}
  }
});

test('V165 actual costume application prepares all six pieces without resources, issued gear or J2 changes',()=>{
  for(const outfit of PLAYER_COSTUME_OUTFITS_V165){const save=createDefaultSave();save.needsPlayerCreationV84=false;
    const before=structuredClone(save);applyCostume(save,outfit.costumeId);
    assert.equal(save.player.costumeId,outfit.costumeId);assert.deepEqual(save.player.appearanceV126.slots,outfit.slots);
    for(const key of ['weaponIds','equipmentIds','ammo','userEquipmentV95','coopAppearanceV126'])assert.deepEqual(save.player[key],before.player[key]);
    assert.deepEqual(save.galaxy.resources,before.galaxy.resources);assert.deepEqual(save.crew,before.crew);
    const restored=migrateSave(JSON.parse(JSON.stringify(save)));assert.deepEqual(restored.player.appearanceV126,save.player.appearanceV126);
    save.strategy.currentOperation={id:'active'};const locked=structuredClone(save);
    assert.throws(()=>applyCostumeOutfitV165(save,outfit.costumeId),/Opération active/);assert.deepEqual(save,locked);
  }
});

test('V165 fourteen production preview modes retain each outfit and real independent arms in both orientations',()=>{
  for(const preset of COSTUME_APPEARANCE_PRESETS_V165)for(const facing of [-1,1])for(const mode of PLAYER_APPEARANCE_PREVIEW_MODES_V128){
    const {sample,body,result,draw}=render(preset,mode,facing);
    assert.equal(result.drawn,true,`${preset.id}/${facing}/${mode.id}: ${result.reason}`);
    assert.deepEqual(result.effectiveSlots,preset.slots);assert.equal(sample.actor.w,44);assert.equal(sample.actor.h,92);
    assert.ok(result.layers.some(layer=>layer.itemId===preset.slots.torso));
    assert.ok(result.layers.filter(layer=>layer.slot==='arms').every(layer=>layer.itemId===preset.slots.arms));
    assert.equal(result.layers.filter(layer=>layer.slot==='legs').length,7);
    assert.ok(result.layers.every(layer=>!String(layer.imageKey).startsWith('playerCostumeV165:')));
    assert.equal(draw.stack.length,0);assert.ok(draw.calls.length>8);assert.ok(body.eligible);
  }
});

test('V165 every portable weapon keeps its own held layer instead of the reference board rifle',()=>{
  assert.ok(portable.length>3);
  for(const preset of COSTUME_APPEARANCE_PRESETS_V165)for(const facing of [-1,1])for(const row of portable){
    const {result,weaponPose}=render(preset,{id:'aim',fixedTime:.7},facing,row.descriptor);
    assert.equal(result.drawn,true,`${preset.id}/${row.profile.weaponId}/${facing}: ${result.reason}`);
    assert.equal(weaponPose.profile.weaponId,row.profile.weaponId);
    assert.equal(result.layers.find(layer=>layer.slot==='weapon')?.itemId,row.profile.weaponId);
    assert.deepEqual(result.effectiveSlots,preset.slots);
  }
});

test('V165 unarmed and mixed saved pieces do not require a hidden firearm or a monolithic costume',()=>{
  const mixed={...COSTUME_APPEARANCE_PRESETS_V165[0],slots:{...COSTUME_APPEARANCE_PRESETS_V165[0].slots,
    arms:COSTUME_APPEARANCE_PRESETS_V165[1].slots.arms,legs:COSTUME_APPEARANCE_PRESETS_V165[2].slots.legs}};
  for(const facing of [-1,1]){const {result}=render(mixed,{id:'idle',fixedTime:.4},facing,null);
    assert.equal(result.drawn,true);assert.equal(result.unarmed,true);assert.deepEqual(result.effectiveSlots,mixed.slots);
    assert.equal(result.layers.some(layer=>layer.slot==='weapon'),false);}
});

test('V165 missing selected clothing fails before any partial outfit is drawn',()=>{
  for(const preset of COSTUME_APPEARANCE_PRESETS_V165){const kit=PLAYER_COSTUME_PARTS_V165[preset.id.slice(7,-5)];
    for(const asset of [kit.upperAsset,kit.legAsset,...Object.values(kit.helmet||{}).map(row=>row.asset)]){
      const broken=new Map(images);broken.delete(asset.imageKey);
      const {result,draw}=render(preset,{id:'idle',fixedTime:.4},1,null,broken);
      assert.equal(result.drawn,false);assert.equal(result.fallback,true);assert.equal(draw.calls.length,0);
    }
  }
});

test('V165 archives separate live modular clothing from illustrative full-body boards',()=>{
  assert.equal(buildCostumeArchivesModelV119().modularReadyCount,PLAYER_COSTUME_OUTFITS_V165.length+PLAYER_COSTUME_LINKED_OUTFITS_V165.length);
  for(const outfit of PLAYER_COSTUME_OUTFITS_V165){const html=renderCostumeArchiveCardV119(getCostumeV119(outfit.costumeId));
    assert.match(html,/TENUE MODULAIRE ADAPTÉE/);
    if(getPlayerCostumePreviewSkinV165(outfit.costumeId))assert.match(html,/Illustration de la tenue/);
    else{assert.match(html,/PIÈCES DISPONIBLES À L’ARMURERIE/);assert.doesNotMatch(html,/<image /);}
    assert.match(html,/data-costume-id=/);assert.match(html,/PERSONNALISER LES PIÈCES/);
    assert.doesNotMatch(html,/ATLAS JOUEUR DÉDIÉ ADAPTÉ/);}
  const outfit=PLAYER_COSTUME_OUTFITS_V165[0],entry=getCostumeV119(outfit.costumeId);
  const active=renderCostumeArchiveCardV119(entry,{selectedId:outfit.costumeId,appearanceSlots:outfit.slots});
  assert.match(active,/data-costume-id="[^"]+" disabled/);
  const mixed=renderCostumeArchiveCardV119(entry,{selectedId:outfit.costumeId,
    appearanceSlots:{...outfit.slots,legs:PLAYER_COSTUME_OUTFITS_V165[1].slots.legs}});
  assert.match(mixed,/>APPLIQUER LA TENUE<\/button>/);
});

test('V165 exact admission rejects extra costume assets and retains independent source checks',async()=>{
  for(const path of ['assets/openai/sprites/player/costumes-v165/extra.png','assets/openai/sprites/player/costume-parts-v165/sevastopol-security/unreviewed.png','../src/app.js'])
    assert.equal(publicCostumePathAdmissionV165(path),false);
  assert.equal(publicCostumePathAdmissionV165('src/unrelated.js'),null);
  const result=await verifyPublicCostumeAdmissionsV165(new URL('../',import.meta.url).pathname,{strict:true});
  assert.equal(result.nativePartAtlases,17);assert.equal(result.previewPoseCells,240);assert.equal(result.newPlayablePrecompositedSkins,0);
});

test('V165 built admission omits tooling while source QA and every runtime/PNG input remain mandatory',async()=>{
  const fixture=mkdtempSync(join(tmpdir(),'atf-costume-admission-v165-'));
  const copy=path=>{const target=join(fixture,path);mkdirSync(dirname(target),{recursive:true});
    copyFileSync(fileURLToPath(new URL('../'+path,import.meta.url)),target);};
  try{
    assert.equal(PUBLIC_COSTUME_ASSET_PATHS_V165.length,32);
    assert.equal(PUBLIC_COSTUME_RUNTIME_PATHS_V165.length,3);
    for(const path of [...PUBLIC_COSTUME_ASSET_PATHS_V165,...PUBLIC_COSTUME_RUNTIME_PATHS_V165])copy(path);
    const built=await verifyPublicCostumeAdmissionsV165(fixture,{strict:true,built:true});
    assert.equal(built.nativePartAtlases,17);assert.equal(built.previewPoseCells,240);
    for(const path of PUBLIC_COSTUME_SCRIPT_PATHS_V165.filter(path=>!path.endsWith('.py')))copy(path);
    await assert.rejects(()=>verifyPublicCostumeAdmissionsV165(fixture,{strict:true}),/qa-costume-atlases-v165\.py/);
    copy('scripts/qa-costume-atlases-v165.py');
    assert.equal((await verifyPublicCostumeAdmissionsV165(fixture,{strict:true,built:false})).ok,true);
    const runtime=PUBLIC_COSTUME_RUNTIME_PATHS_V165[1];unlinkSync(join(fixture,runtime));
    for(const built of [false,true])await assert.rejects(()=>verifyPublicCostumeAdmissionsV165(fixture,{strict:true,built}),/ENOENT/);
    copy(runtime);
    const asset=PUBLIC_COSTUME_ASSET_PATHS_V165.at(-1);unlinkSync(join(fixture,asset));
    for(const built of [false,true])await assert.rejects(()=>verifyPublicCostumeAdmissionsV165(fixture,{strict:true,built}),/ENOENT/);
  }finally{rmSync(fixture,{recursive:true,force:true});}
});
