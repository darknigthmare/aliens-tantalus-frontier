import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import {
  SHIP_ANIMAL_ANNEX_V87 as ANNEX, SHIP_ANIMAL_HABITATS_V87 as HABITATS,
  SHIP_ANIMAL_PROP_RECTS_V87, getShipAnimalHabitatsV87, installShipAnimalHabitatV87,
  getShipAnimalRoomInteractionV87, drawShipAnimalHabitatV87
} from '../src/ship-animal-habitat-v87.js';
import { HubGame, HUB_DECKS, HUB_ANNEX_TRANSITION_SECONDS_V71, HUB_ANNEX_STATE_KEY_V71, HUB_ANNEX_MODULE_ART_V82 } from '../src/hub-v71-runtime.js';
import { resolveShipAnimalFrameV87 } from '../src/ship-animal-art-v87.js';
import { MISSION_STRUCTURE_CROPS_V87 } from '../src/mission-structure-art-v87.js';
import { validateHubAnnexGeometryV87, HUB_ANNEX_BY_ID_V87, HUB_ANNEXES_V87 } from '../src/hub-annex-registry-v87.js';
import { HUB_ANNEXES_V71 } from '../src/tantalus-hub-expansion-v71.js';
import { SaveSystem, SAVE_PREFIX, createDefaultSave, migrateSave } from '../src/save.js';

const clone = value => structuredClone(value);
const near = (a, b, tolerance = .001) => assert.ok(Math.abs(a - b) <= tolerance, String(a) + ' ≠ ' + String(b));
const intersects = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const contextFor = definition => ({ roomId: ANNEX.id, playerX: definition.installX, feetY: 624, artReady: true });
function equipped(save = createDefaultSave(), count = HABITATS.length) {
  let current = save;
  for (const definition of HABITATS.slice(0, count)) {
    const result = installShipAnimalHabitatV87(current, definition.id, contextFor(definition));
    assert.equal(result.ok, true, result.code);
    current = result.save;
  }
  return current;
}
function storage() {
  const values = new Map();
  return { values, rejectSaveWrites: false,
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) {
      if (this.rejectSaveWrites && key.startsWith(SAVE_PREFIX)) throw new Error('QuotaExceededError');
      values.set(key, value);
    },
    removeItem(key) { values.delete(key); }
  };
}
function mockContext(trace = { texts: [], drawImages: [] }) {
  const gradient = { addColorStop() {} };
  return new Proxy({
    measureText: text => ({ width: String(text).length * 8 }),
    createLinearGradient: () => gradient, createRadialGradient: () => gradient,
    fillText: (...args) => trace.texts.push(args), drawImage: (...args) => trace.drawImages.push(args)
  }, { get: (target, key) => key in target ? target[key] : () => {},
    set: (target, key, value) => { target[key] = value; return true; } });
}
class MockImage {
  constructor() { this.complete = true; this.naturalWidth = 1920; this.naturalHeight = 720; }
  set src(value) {
    this.currentSrc = value;
    if (value.includes('/ship-animals/v87/')) { this.naturalWidth = 1536; this.naturalHeight = 1024; }
    else if (value === HUB_ANNEX_MODULE_ART_V82.floor) {
      const png = readFileSync(new URL('../' + value.slice(1), import.meta.url));
      this.naturalWidth = png.readUInt32BE(16); this.naturalHeight = png.readUInt32BE(20);
    }
    else if (value.endsWith('/door.webp')) { this.naturalWidth = 384; this.naturalHeight = 512; }
    else if (value.endsWith('/prop.webp')) { this.naturalWidth = 640; this.naturalHeight = 512; }
    else if (value.includes('echo9-marine-')) { this.naturalWidth = 1024; this.naturalHeight = 1024; }
  }
}
function withRuntime(run) {
  const previous = { Image: globalThis.Image, addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame, matchMedia: globalThis.matchMedia };
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  globalThis.matchMedia = () => ({ matches: false });
  try { return run(); } finally { Object.assign(globalThis, previous); }
}
function createHub(save = createDefaultSave(), state = null) {
  const trace = { texts: [], drawImages: [] };
  const actions = [];
  const persisted = [];
  const ctx = mockContext(trace);
  const hub = new HubGame({ width: 1280, height: 720, getContext: () => ctx, addEventListener() {}, focus() {} }, {
    onAction: event => actions.push(clone(event)), onPersist: patch => persisted.push(clone(patch))
  });
  hub.start(state || { deck: 1, roomId: 'crew-quarters', positionX: 600, visited: ['crew-quarters'] },
    { routineContextV62: { save } });
  return { hub, trace, actions, persisted };
}
function finishTransition(hub) {
  const half = HUB_ANNEX_TRANSITION_SECONDS_V71 / 2;
  hub.update(half);
  assert.ok(hub.annexTransitionV71);
  assert.ok(hub.annexTransitionV71.progress > 0 && hub.annexTransitionV71.progress < 1);
  hub.update(half + .02);
  assert.equal(hub.annexTransitionV71, null);
}
function walkTo(hub, targetCenter) {
  for (let frame = 0; frame < 1200; frame += 1) {
    const center = hub.player.x + hub.player.w / 2;
    if (Math.abs(center - targetCenter) < 4) {
      hub.keys.clear(); hub.update(1 / 120); return;
    }
    const before = { x: hub.player.x, y: hub.player.y };
    hub.keys = new Set([center < targetCenter ? 'KeyD' : 'KeyA']);
    hub.update(1 / 120);
    assert.ok(Math.abs(hub.player.x - before.x) < 4, 'walking must integrate physical motion');
    near(hub.player.y + hub.player.h, 624);
    assert.equal(hub.player.grounded, true);
    assert.equal(hub.player.climbing, false);
    assert.equal(hub.jumpQueued, 0);
  }
  assert.fail('physical ground walk never reached ' + targetCenter);
}
function enter(hub) {
  walkTo(hub, ANNEX.parentDoorBounds.x + ANNEX.parentDoorBounds.w / 2);
  const parentPose = { x: hub.player.x, y: hub.player.y };
  assert.equal(hub.nearestParentAnnexDoorV71()?.annexId, ANNEX.id);
  hub.interact();
  assert.equal(hub.annexTransitionV71.direction, 'enter');
  assert.equal(hub.currentAnnexV71(), null);
  finishTransition(hub);
  assert.equal(hub.currentAnnexV71().id, ANNEX.id);
  near(hub.player.x, 233);
  near(hub.player.y + hub.player.h, 624);
  return parentPose;
}
function decodeRgbaPng(url) {
  const bytes = readFileSync(url);
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.equal(bytes[24], 8); assert.equal(bytes[25], 6); assert.equal(bytes[28], 0);
  const chunks = [];
  for (let cursor = 8; cursor < bytes.length;) {
    const size = bytes.readUInt32BE(cursor);
    const type = bytes.toString('ascii', cursor + 4, cursor + 8);
    if (type === 'IDAT') chunks.push(bytes.subarray(cursor + 8, cursor + 8 + size));
    cursor += size + 12;
  }
  const raw = inflateSync(Buffer.concat(chunks));
  const stride = width * 4;
  const rgba = Buffer.alloc(stride * height);
  const paeth = (a, b, c) => {
    const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    assert.ok(filter <= 4);
    for (let x = 0; x < stride; x += 1) {
      const index = y * stride + x;
      const a = x >= 4 ? rgba[index - 4] : 0;
      const b = y ? rgba[index - stride] : 0;
      const c = y && x >= 4 ? rgba[index - stride - 4] : 0;
      const predictor = [0, a, b, Math.floor((a + b) / 2), paeth(a, b, c)][filter];
      rgba[index] = (raw[y * (stride + 1) + x + 1] + predictor) & 255;
    }
  }
  return { width, height, rgba, alpha: (x, y) => rgba[(y * width + x) * 4 + 3] };
}

test('the physical animal annex extends the current registry without rewriting the historical ten rooms', () => {
  assert.equal(HUB_ANNEXES_V71.length, 10);
  assert.equal(HUB_ANNEXES_V87.length, 13);
  assert.equal(HUB_ANNEX_BY_ID_V87[ANNEX.id], ANNEX);
  assert.equal(ANNEX.parentRoomId, 'crew-quarters');
  assert.equal(ANNEX.parentDeck, 'habitat');
  assert.equal(ANNEX.navigationKind, 'animal-care-annex');
  assert.equal(ANNEX.id.includes('memorial'), false);
  assert.equal(validateHubAnnexGeometryV87(ANNEX).valid, true);
  assert.equal(Object.isFrozen(ANNEX), true);
  assert.equal(Object.isFrozen(ANNEX.props), true);
});

test('the 118px parent door is on the true 624 floor, clear of every bunk and upper platform', () => withRuntime(() => {
  const { hub } = createHub();
  const door = hub.getParentAnnexDoorV71(ANNEX.id);
  assert.deepEqual(door.bounds, { x: 645, y: 432, w: 118, h: 192 });
  assert.equal(door.bounds.x + door.bounds.w, 763);
  assert.equal(door.bounds.y + door.bounds.h, 624);
  assert.ok(door.bounds.w >= ANNEX.world.playerClearanceWidth);
  assert.equal(ANNEX.world.playerClearanceWidth, 112);
  const solids = [...hub.obstacles, ...hub.v51Platforms];
  for (const obstacle of solids) assert.equal(intersects(door.bounds, obstacle), false, JSON.stringify(obstacle));
  assert.ok(hub.obstacles.some(obstacle => obstacle.roomId === 'crew-quarters' && obstacle.h === 82));
  assert.deepEqual(ANNEX.platforms, [{ id: 'animal-care-floor', x: 0, y: 624, w: 1920, h: 96, role: 'floor' }]);
  assert.deepEqual(ANNEX.colliders, []);
  assert.deepEqual(ANNEX.ladders, []);
  assert.ok(ANNEX.props.every(prop => prop.collidable === false));
}));

test('new and legacy saves contain zero animals and five uninstalled habitats with seven typed places', () => {
  for (const save of [createDefaultSave(), migrateSave({ profile: 1 }), {}]) {
    const habitats = getShipAnimalHabitatsV87(save);
    assert.equal(habitats.length, 5);
    assert.deepEqual(habitats.map(entry => entry.installed), [false, false, false, false, false]);
    assert.equal(Object.keys(save.shipAnimalsV1?.animals || {}).length, 0);
    assert.deepEqual(habitats.map(entry => entry.capacity), [1, 1, 1, 2, 2]);
  }
  assert.deepEqual(HABITATS.map(entry => entry.id), ['moka-berth-v87', 'brume-berth-v87', 'luciole-berth-v87', 'noisette-cafe-pen-v87', 'tic-tac-pen-v87']);
});

for (const definition of HABITATS) {
  test(definition.id + ': fitting is pure, located at the real station, complete and free of invented sale costs', () => {
    const save = createDefaultSave();
    const before = clone(save);
    const result = installShipAnimalHabitatV87(save, definition.id, contextFor(definition));
    assert.equal(result.ok, true);
    assert.equal(result.code, 'installed');
    assert.equal(result.changed, true);
    assert.deepEqual(save, before);
    assert.notEqual(result.save, save);
    assert.deepEqual(result.save.galaxy.resources, before.galaxy.resources);
    assert.deepEqual(result.save.shipAnimalsV1.animals, {});
    assert.deepEqual(result.save.shipAnimalsV1.stock, before.shipAnimalsV1.stock);
    assert.deepEqual(result.save.shipAnimalsV1.reservations, {});
    assert.deepEqual(result.save.shipAnimalsV1.receipts, {});
    assert.deepEqual(result.save.shipAnimalsV1.habitats[definition.id].equipment, definition.requirements);
    assert.equal(getShipAnimalHabitatsV87(result.save).find(entry => entry.id === definition.id).installed, true);
    assert.equal(result.save.shipAnimalsV1.revision, before.shipAnimalsV1.revision + 1);
    const again = installShipAnimalHabitatV87(result.save, definition.id, contextFor(definition));
    assert.equal(again.code, 'already-installed');
    assert.equal(again.changed, false);
    assert.deepEqual(again.save, result.save);
  });

  test(definition.id + ': installation refuses missing art, wrong room, distance and unsupported floor pose', () => {
    const save = createDefaultSave();
    for (const edit of [
      { roomId: 'crew-quarters' }, { roomId: 'memorial' }, { artReady: false }, { artReady: undefined },
      { playerX: definition.installX + 92.01 }, { playerX: NaN }, { feetY: 611.99 }, { feetY: 636.01 }, { feetY: NaN },
      { paused: true }, { playerAlive: false }
    ]) {
      const before = clone(save);
      const result = installShipAnimalHabitatV87(save, definition.id, { ...contextFor(definition), ...edit });
      assert.equal(result.ok, false);
      assert.equal(result.code, 'physical-installation-required');
      assert.equal(result.changed, false);
      assert.deepEqual(result.save, before);
      assert.deepEqual(save, before);
    }
  });
}

test('unknown, quarantined and future animal registries cannot install habitats', () => {
  const save = createDefaultSave();
  assert.equal(installShipAnimalHabitatV87(save, 'imaginary-berth', contextFor(HABITATS[0])).code, 'unknown-habitat');
  for (const registry of [{ schema: 2, future: true }, { ...clone(save.shipAnimalsV1), quarantined: [{ path: 'animals', code: 'invalid' }] }]) {
    const candidate = { ...clone(save), shipAnimalsV1: registry };
    const result = installShipAnimalHabitatV87(candidate, HABITATS[0].id, contextFor(HABITATS[0]));
    assert.equal(result.ok, false);
    assert.equal(result.code, 'state-needs-review');
    assert.deepEqual(result.save, candidate);
  }
});

test('malformed or incomplete saved equipment is never treated as an installed habitat or allowed to crash', () => {
  for (const equipment of [{}, 'bed water-station feeding-station hygiene-station scratching-post', [], ['bed']]) {
    const save = createDefaultSave();
    save.shipAnimalsV1.habitats = { [HABITATS[0].id]: {
      type: HABITATS[0].type, roomId: 'animal-care', installed: true, equipment
    } };
    let habitats;
    assert.doesNotThrow(() => { habitats = getShipAnimalHabitatsV87(save); });
    assert.equal(habitats[0].installed, false);
  }
});

test('real SaveSystem commit persists all five fittings across reloads without debiting credits or instantiating companions', () => {
  const backend = storage();
  const system = new SaveSystem(backend);
  system.newGame(1);
  const credits = system.data.galaxy.resources.credits;
  for (const definition of HABITATS) {
    const prepared = installShipAnimalHabitatV87(system.data, definition.id, contextFor(definition));
    system.commit({ shipAnimalsV1: prepared.save.shipAnimalsV1 });
    const reloaded = new SaveSystem(backend).load(1);
    assert.equal(getShipAnimalHabitatsV87(reloaded).find(entry => entry.id === definition.id).installed, true);
    assert.equal(reloaded.galaxy.resources.credits, credits);
    assert.deepEqual(reloaded.shipAnimalsV1.animals, {});
  }
  const reloaded = new SaveSystem(backend).load(1);
  assert.deepEqual(getShipAnimalHabitatsV87(reloaded).map(entry => entry.installed), [true, true, true, true, true]);
  assert.equal(Object.keys(reloaded.shipAnimalsV1.habitats).length, 5);
});

test('quota failure keeps prior disk and live state; retry installs once only after durable commit', () => {
  const backend = storage();
  const system = new SaveSystem(backend);
  system.newGame(1);
  const initial = clone(system.data);
  const initialDisk = backend.getItem(system.key());
  const prepared = installShipAnimalHabitatV87(system.data, HABITATS[0].id, contextFor(HABITATS[0]));
  backend.rejectSaveWrites = true;
  assert.throws(() => system.commit({ shipAnimalsV1: prepared.save.shipAnimalsV1 }), error => error.code === 'SAVE_WRITE_FAILED');
  assert.deepEqual(system.data, initial);
  assert.equal(backend.getItem(system.key()), initialDisk);
  assert.deepEqual(getShipAnimalHabitatsV87(new SaveSystem(backend).load(1)).map(entry => entry.installed), [false, false, false, false, false]);
  backend.rejectSaveWrites = false;
  system.commit({ shipAnimalsV1: prepared.save.shipAnimalsV1 });
  const after = new SaveSystem(backend).load(1);
  assert.deepEqual(getShipAnimalHabitatsV87(after).map(entry => entry.installed), [true, false, false, false, false]);
  assert.equal(after.shipAnimalsV1.revision, initial.shipAnimalsV1.revision + 1);
  assert.equal(after.galaxy.resources.credits, initial.galaxy.resources.credits);
});

test('physical interaction requires a living grounded player and pauses during the door transition', () => {
  const save = createDefaultSave();
  const hub = { currentAnnexV71: () => ANNEX, player: { x: 668, y: 532, w: 44, h: 92, alive: true }, annexTransitionV71: null };
  assert.equal(getShipAnimalRoomInteractionV87(hub, save).habitatId, HABITATS[0].id);
  for (const edit of [
    () => { hub.player.alive = false; },
    () => { hub.player.y = 500; },
    () => { hub.player.x = 80; },
    () => { hub.annexTransitionV71 = { progress: .5 }; },
    () => { hub.currentAnnexV71 = () => null; }
  ]) {
    hub.player = { x: 668, y: 532, w: 44, h: 92, alive: true };
    hub.annexTransitionV71 = null; hub.currentAnnexV71 = () => ANNEX;
    edit();
    assert.equal(getShipAnimalRoomInteractionV87(hub, save), null);
  }
  hub.currentAnnexV71 = () => ANNEX; hub.annexTransitionV71 = null;
  hub.player = { x: 1600, y: 532, w: 44, h: 92, alive: true };
  assert.deepEqual(getShipAnimalRoomInteractionV87(hub, save),
    { action: 'ship-animal:care', prompt: 'E — CONTRÔLER L’ACCUEIL ANIMALIER' });
});

test('actual hub walks from spawn233 through all five fitting points and the care counter, then reloads and exits on the parent floor', () => withRuntime(() => {
  const save = createDefaultSave();
  const { hub, actions, persisted } = createHub(save);
  const parent = enter(hub);
  for (const definition of HABITATS) {
    walkTo(hub, definition.installX);
    assert.ok(hub.statusPrompt().includes('INSTALLER'));
    hub.interact();
    const interaction = actions.at(-1);
    assert.equal(interaction.action, 'ship-animal:install');
    assert.equal(interaction.habitatId, definition.id);
    const result = installShipAnimalHabitatV87(save, definition.id, {
      roomId: hub.currentAnnexV71().id, playerX: hub.player.x + hub.player.w / 2,
      feetY: hub.player.y + hub.player.h,
      artReady: [...hub.getAnnexAssetGroupV71(ANNEX.id).values()].every(image => image.complete && image.naturalWidth > 0)
    });
    assert.equal(result.ok, true);
    save.shipAnimalsV1 = result.save.shipAnimalsV1;
    hub.npcRoutineContextV62.save = save;
  }
  walkTo(hub, 1660);
  hub.interact();
  assert.equal(actions.at(-1).action, 'ship-animal:care');
  assert.equal(actions.filter(event => event.type === 'hub:annex-station').length, 0, 'no generic fake reward');
  assert.equal(hub.hubCommercialStateV71.stationUses[ANNEX.id], 0);
  hub.persist();
  const patch = persisted.at(-1);
  assert.equal(patch[HUB_ANNEX_STATE_KEY_V71].activeAnnexId, ANNEX.id);
  const pose = { x: hub.player.x, y: hub.player.y };
  hub.stop(false);
  const { hub: resumed } = createHub(save, patch);
  assert.equal(resumed.currentAnnexV71().id, ANNEX.id);
  near(resumed.player.x, Math.round(pose.x));
  near(resumed.player.y, pose.y);
  assert.deepEqual(getShipAnimalHabitatsV87(resumed.npcRoutineContextV62.save).map(entry => entry.installed), [true, true, true, true, true]);
  walkTo(resumed, 144);
  const exit = resumed.annexExitDoorV71();
  assert.ok(exit.bounds.w >= 112);
  assert.equal(exit.bounds.y + exit.bounds.h, 624);
  resumed.interact();
  assert.equal(resumed.annexTransitionV71.direction, 'exit');
  finishTransition(resumed);
  assert.equal(resumed.currentAnnexV71(), null);
  assert.equal(resumed.currentRoom().id, 'crew-quarters');
  near(resumed.player.y + resumed.player.h, 624);
  near(resumed.player.x, Math.round(parent.x));
  assert.equal(Object.keys(save.shipAnimalsV1.animals).length, 0);
}));

test('actual animal-care HUD counts all five physical fittings for new and fully equipped saves', () => withRuntime(() => {
  for (const [save, fitted] of [[createDefaultSave(), 0], [equipped(createDefaultSave(), 5), 5]]) {
    const { hub, trace } = createHub(save); enter(hub); trace.texts.length = 0;
    hub.draw();
    assert.ok(trace.texts.some(args => args[0] === `LOGEMENTS ÉQUIPÉS ${fitted}/5`));
    assert.equal(trace.texts.some(args => /LOGEMENTS ÉQUIPÉS .*\/2/.test(String(args[0]))), false);
  }
}));

test('drawing independent cropped props paints2/7/11/17 entries as fitting progresses and never silhouettes unowned animals', () => {
  const image = new MockImage(); image.src = ANNEX.art.prop;
  for (const count of [0, 1, 2, 3]) {
    const save = equipped(createDefaultSave(), count);
    const before = clone(save);
    const trace = { texts: [], drawImages: [] };
    assert.equal(drawShipAnimalHabitatV87(mockContext(trace), image, save), true);
    assert.equal(trace.drawImages.length, [2, 7, 11, 17][count]);
    assert.equal(trace.texts.length, 5 - count);
    for (const call of trace.drawImages) {
      assert.equal(call.length, 9, 'never draw the entire props board as background');
      assert.equal(call[0], image);
      assert.ok(call[1] >= 0 && call[2] >= 0 && call[1] + call[3] <= image.naturalWidth && call[2] + call[4] <= image.naturalHeight);
      assert.ok(call[3] < image.naturalWidth && call[4] < image.naturalHeight);
      near(call[3] / call[4], call[7] / call[8]);
      const prop = ANNEX.props.find(entry => entry.x === call[5] && entry.y === call[6]);
      assert.ok(prop);
      near(call[6] + call[8], prop.id === 'hygiene-cabinet' ? 548 : 624);
      assert.deepEqual(call.slice(1, 5), [prop.source[0], prop.source[1], prop.source[2] - prop.source[0], prop.source[3] - prop.source[1]]);
    }
    assert.deepEqual(save, before);
    assert.deepEqual(save.shipAnimalsV1.animals, {});
  }
});

test('missing or incompletely loaded atlas paints neither props nor pretend completed fittings', () => {
  for (const image of [null, {}, { complete: false, naturalWidth: 1536, naturalHeight: 1024 },
    { complete: true, naturalWidth: 0, naturalHeight: 1024 }, { complete: true, naturalWidth: 1536, naturalHeight: 0 }]) {
    const trace = { texts: [], drawImages: [] };
    assert.equal(drawShipAnimalHabitatV87(mockContext(trace), image, equipped()), false);
    assert.equal(trace.drawImages.length, 0);
    assert.equal(trace.texts.length, 0);
  }
});

test('furniture uses the real 92px human and 33/49px companion scale instead of room-sized accessories', () => withRuntime(() => {
  const { hub } = createHub();
  assert.equal(hub.player.h, 92);
  const cat = resolveShipAnimalFrameV87('animal-moka', 'idle', 0);
  const dog = resolveShipAnimalFrameV87('animal-brume', 'idle', 0);
  const catHeight = cat.frame.pivotY * cat.atlas.worldScale;
  const dogHeight = dog.frame.pivotY * dog.atlas.worldScale;
  near(catHeight, 33.2);
  near(dogHeight, 49.2);
  assert.ok(catHeight < dogHeight && dogHeight < hub.player.h * .6);
  const byId = Object.fromEntries(ANNEX.props.map(prop => [prop.id, prop]));
  const expectedWidths = { 'cat-bed': 55, 'dog-bed': 88, 'cat-water': 16, 'cat-food': 16,
    'dog-water': 22, 'dog-food': 22, 'care-counter': 94, 'hygiene-cabinet': 40,
    'cat-scratch': 30, 'cat-hygiene': 52, 'dog-toy': 28 };
  for (const [id, width] of Object.entries(expectedWidths)) near(byId[id].w, width);
  for (const [kind, sample, height] of [['cat', cat, catHeight], ['dog', dog, dogHeight]]) {
    const bed = byId[kind + '-bed'];
    const bodyLength = sample.frame.w * sample.atlas.worldScale;
    assert.ok(bed.w >= bodyLength * 1.35 && bed.w <= bodyLength * 1.75, kind + ': bed fits one companion');
    assert.ok(bed.h < height, kind + ': bed does not tower over its occupant');
    for (const bowl of ['water', 'food']) assert.ok(byId[kind + '-' + bowl].h <= height * .25,
      kind + ': bowl is smaller than the head-to-paw silhouette');
    near(bed.y + bed.h, 624);
  }
  const counter = byId['care-counter'];
  assert.ok(counter.h >= hub.player.h * .65 && counter.h <= hub.player.h * .85, 'human counter is around waist/chest height');
  near(counter.h, 94 * 219 / 290);
  assert.deepEqual(ANNEX.station.bounds, { x: counter.x, y: counter.y, w: counter.w, h: counter.h });
  assert.ok(byId['cat-scratch'].h >= catHeight * 1.4 && byId['cat-scratch'].h <= catHeight * 1.8);
  assert.ok(byId['cat-hygiene'].h <= catHeight * 1.25);
  assert.ok(byId['dog-toy'].h <= dogHeight * .2);
  near(byId['hygiene-cabinet'].y + byId['hygiene-cabinet'].h, 548);
  assert.ok(byId['hygiene-cabinet'].h < hub.player.h * .55);
}));

test('the real props PNG has transparent negative space and every crop contains both art and clear background', () => {
  const png = decodeRgbaPng(new URL('../' + ANNEX.art.prop.slice(1), import.meta.url));
  assert.deepEqual([png.width, png.height], [1536, 1024]);
  let transparent = 0;
  for (let index = 3; index < png.rgba.length; index += 4) if (png.rgba[index] === 0) transparent += 1;
  assert.ok(transparent > png.width * png.height * .3, 'atlas may not be a flat white or opaque board');
  for (const [kind, [x, y, right, bottom]] of Object.entries(SHIP_ANIMAL_PROP_RECTS_V87)) {
    let clear = 0, visible = 0;
    for (let py = y; py < bottom; py += 1) for (let px = x; px < right; px += 1) {
      if (png.alpha(px, py) === 0) clear += 1;
      if (png.alpha(px, py) > 0) visible += 1;
    }
    assert.ok(clear > 0, kind + ': missing transparent crop background');
    assert.ok(visible > 0, kind + ': empty crop');
  }
});

test('actual annex renderer repeats world-anchored wall tiles at native aspect ratio and draws props only via source crops', () => withRuntime(() => {
  const { hub, trace } = createHub(equipped());
  enter(hub);
  trace.drawImages.length = 0;
  hub.draw();
  const walls = trace.drawImages.filter(call => call[0]?.currentSrc === ANNEX.art.far);
  const props = trace.drawImages.filter(call => call[0]?.currentSrc === ANNEX.art.prop);
  const floor = trace.drawImages.filter(call => call[0]?.currentSrc === HUB_ANNEX_MODULE_ART_V82.floor);
  assert.equal(walls.length, 3);
  assert.equal(props.length, 17);
  const camera = hub.annexCameraV71.x;
  let next = 0;
  for (const call of walls) {
    assert.equal(call.length, 9);
    near(call[5] + camera, next);
    near(call[3] / call[4], call[7] / call[8]);
    near(call[6] + call[8], 624);
    next += call[7];
  }
  near(next, 1920);
  const crop = MISSION_STRUCTURE_CROPS_V87.floorPanel;
  assert.equal(floor.length, Math.ceil(ANNEX.world.width / (crop.w * ANNEX.world.floorHeight / crop.h)));
  let floorEnd = 0;
  for (const call of floor) {
    assert.equal(call.length, 9, 'floor uses cropped art rather than a whole atlas or a CSS slab');
    assert.equal(call[1], crop.x); assert.equal(call[2], crop.y); assert.equal(call[4], crop.h);
    assert.ok(call[3] > 0 && call[3] <= crop.w);
    assert.ok(call[1] + call[3] <= call[0].naturalWidth && call[2] + call[4] <= call[0].naturalHeight);
    near(call[5], floorEnd);
    near(call[6], ANNEX.world.floorY);
    near(call[8], ANNEX.world.floorHeight);
    near(call[3] / call[4], call[7] / call[8]);
    floorEnd += call[7];
  }
  near(floorEnd, ANNEX.world.width);
  assert.ok(floor.at(-1)[3] < crop.w, 'the final tile is cropped, never stretched');
  assert.ok(trace.drawImages.indexOf(floor.at(-1)) < trace.drawImages.indexOf(props[0]), 'equipment is painted over the physical floor');
  assert.ok(props.every(call => call.length === 9 && call[3] < 1536));
  assert.equal(trace.drawImages.some(call => /moka|brume|luciole/i.test(call[0]?.currentSrc || '')), false,
    'no default resident exists merely because its art was generated');
  assert.deepEqual(ANNEX.implementedFeatures, ['local-docked-counter', 'physical-arrival-transfer']);
  assert.deepEqual(ANNEX.deferredFeatures, ['dedicated-human-carry-animation']);
}));
