import test from 'node:test';
import assert from 'node:assert/strict';
import { HubGame } from '../src/hub-onboarding-v84.js';
import { HUB_ANNEXES_V71 } from '../src/tantalus-hub-expansion-v71.js';
import { HUB_ANNEXES_V87, buildHubRuntimeGraphV87, createHubCommercialStateV87,
  validateHubAnnexGeometryV87 } from '../src/hub-annex-registry-v87.js';
import { SHIP_REFUGE_ANNEX_V87 as REFUGE, getRefugeInteractionV87 } from '../src/refuge-room-v87.js';
import { REFUGE_ART_V87 } from '../src/refuge-art-v87.js';
import { SHIP_ANIMAL_ANNEX_V87 } from '../src/ship-animal-habitat-v87.js';
import { SHIP_PORT_ANNEX_V87 } from '../src/ship-port-room-v87.js';
import { projectRefugeHubSaveV87, normalizeRefugeHubResumeV87 } from '../src/refuge-save-v87.js';
import { RefugePersonalStoreV87, refugePersonalStorageKeyV87 } from '../src/refuge-personal-state-v87.js';
import { SaveSystem } from '../src/save.js';
import { buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';

const clone = value => structuredClone(value);
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const intersects = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const returnX = () => REFUGE.parentDoorBounds.x + REFUGE.parentDoorBounds.w / 2 - 22;
function visitState(key = 'commercialV71') {
  const commercial = createHubCommercialStateV87();
  Object.assign(commercial, { activeAnnexId: REFUGE.id, annexPositionX: 1440, annexPositionY: 532,
    annexClimbing: false, returnContext: { deckId: 'habitat', roomId: 'crew-quarters', x: returnX(), facing: -1 },
    visitedAnnexIds: [SHIP_ANIMAL_ANNEX_V87.id, REFUGE.id], lastAnnexId: REFUGE.id });
  Object.assign(commercial.annexes[REFUGE.id], { visited: true, visitCount: 3, lastVisitedAt: 4 });
  return { deck: 1, roomId: 'crew-quarters', positionX: 1440, facing: 1,
    visited: ['crew-quarters'], [key]: commercial };
}

for (const key of ['commercialV71', 'hubCommercialV71', 'hubExpansionV71']) {
  test(key + ': save projection returns to the real parent door without changing the live registry', () => {
    const live = freeze(visitState(key)), before = clone(live);
    const saved = projectRefugeHubSaveV87(live);
    assert.deepEqual(live, before); assert.notEqual(saved, live);
    assert.equal(saved.deck, 1); assert.equal(saved.roomId, 'crew-quarters');
    assert.equal(saved.positionX, Math.round(returnX())); assert.equal(saved.facing, -1);
    assert.deepEqual([saved[key].activeAnnexId, saved[key].annexPositionX, saved[key].annexPositionY,
      saved[key].annexClimbing, saved[key].returnContext], [null, null, null, false, null]);
    for (const field of ['annexes', 'visitedAnnexIds', 'lastAnnexId', 'stationUses', 'physicalUpgradeIds'])
      assert.deepEqual(saved[key][field], live[key][field], field);
    assert.deepEqual(projectRefugeHubSaveV87(saved), saved, 'projection is idempotent');
    assert.deepEqual(normalizeRefugeHubResumeV87(live), saved);
  });
}

test('refuge projection bounds malformed return poses and clears every active refuge alias', () => {
  const source = visitState('hubCommercialV71');
  source.commercialV71 = clone(source.hubCommercialV71);
  source.hubExpansionV71 = clone(source.hubCommercialV71);
  for (const x of [-999999, 999999, null, '900', NaN, Infinity]) {
    const live = clone(source); live.hubCommercialV71.returnContext.x = x;
    const saved = projectRefugeHubSaveV87(live);
    assert.ok(saved.positionX >= REFUGE.parentDoorBounds.x);
    assert.ok(saved.positionX <= REFUGE.parentDoorBounds.x + REFUGE.parentDoorBounds.w);
    assert.ok(Number.isSafeInteger(saved.positionX));
    for (const key of ['hubCommercialV71', 'commercialV71', 'hubExpansionV71']) assert.equal(saved[key].activeAnnexId, null);
  }
});

test('normal annexes, future contracts and unrelated data remain byte-equivalent', () => {
  const candidates = [null, {}, { deck: 3, roomId: 'dropship-hangar' }];
  for (const id of HUB_ANNEXES_V87.filter(annex => annex.id !== REFUGE.id).map(annex => annex.id)) {
    const state = visitState(); state.commercialV71.activeAnnexId = id; candidates.push(state);
  }
  for (const field of ['schema', 'registryVersion']) {
    const state = visitState(); state.commercialV71[field] = 999; candidates.push(state);
  }
  for (const input of candidates) assert.deepEqual(projectRefugeHubSaveV87(freeze(input)), input);
});

test('REFUGE is the thirteenth independent annex with its own clear physical doorway', () => {
  assert.equal(REFUGE.id, 'personal-refuge'); assert.equal(REFUGE.parentRoomId, 'crew-quarters');
  assert.equal(REFUGE.parentDeck, 'habitat');
  assert.deepEqual([REFUGE.world.width, REFUGE.world.height, REFUGE.world.floorY], [1920, 720, 624]);
  assert.equal(HUB_ANNEXES_V71.length, 10); assert.equal(HUB_ANNEXES_V87.length, 13);
  for (const historical of [...HUB_ANNEXES_V71, SHIP_ANIMAL_ANNEX_V87, SHIP_PORT_ANNEX_V87]) {
    assert.equal(HUB_ANNEXES_V87.find(annex => annex.id === historical.id), historical);
  }
  assert.equal(validateHubAnnexGeometryV87(REFUGE).valid, true);
  const graph = buildHubRuntimeGraphV87();
  assert.equal(graph.nodes.length, 29); assert.equal(graph.edges.length, 31);
  assert.deepEqual(graph.adjacency[REFUGE.id], ['crew-quarters']);
  assert.equal(graph.adjacency['crew-quarters'].filter(id => id === REFUGE.id).length, 1);
  assert.ok(!intersects(REFUGE.parentDoorBounds, SHIP_ANIMAL_ANNEX_V87.parentDoorBounds));
  assert.ok(REFUGE.parentDoorBounds.h >= 92 && REFUGE.entrance.h >= 92, 'the real Marine fits both doors');
  assert.equal(buildHubTraversalGeometryV87(1).platforms.some(platform =>
    platform.roomId === 'crew-quarters' && intersects(REFUGE.parentDoorBounds, platform)), false,
  'the parent door fits below, never through, an actual quarters walkway');
});

function withRuntime(run) {
  const previous = Object.fromEntries(['Image', 'addEventListener', 'requestAnimationFrame', 'matchMedia'].map(key => [key, globalThis[key]]));
  class MockImage {
    constructor() { this.complete = true; this.naturalWidth = 1536; this.naturalHeight = 1024; }
    set src(value) {
      this.currentSrc = value;
      if (value.includes('/normalized/player/')) this.naturalWidth = this.naturalHeight = 1024;
      const art = Object.values(REFUGE_ART_V87).find(entry => entry.path === value);
      if (art) { this.naturalWidth = art.width; this.naturalHeight = art.height; }
      if (value.startsWith('data:image/')) this.naturalWidth = this.naturalHeight = 1;
    }
  }
  globalThis.Image = MockImage; globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0; globalThis.matchMedia = () => ({ matches: false });
  const draws = [], texts = [], gradient = { addColorStop() {} };
  const context = new Proxy({
    measureText: value => ({ width: String(value).length * 8 }),
    createLinearGradient: () => gradient, createRadialGradient: () => gradient,
    drawImage: (image, ...args) => draws.push({ source: image?.currentSrc, args }),
    fillText: text => texts.push(String(text))
  }, { get: (target, key) => key in target ? target[key] : () => {},
    set: (target, key, value) => { target[key] = value; return true; } });
  const writes = [], events = [];
  const canvas = { width: 1280, height: 720, getContext: () => context, addEventListener() {}, focus() {} };
  const hub = new HubGame(canvas, { onPersist: patch => writes.push(clone(patch)), onAction: event => events.push(clone(event)) });
  try { return run({ hub, writes, events, context, draws, texts }); }
  finally { Object.assign(globalThis, previous); }
}
function startAtDoor(hub, source = {}) {
  hub.start({ deck: 1, roomId: 'crew-quarters', positionX: returnX(), facing: -1,
    commercialV71: createHubCommercialStateV87(), ...source });
  assert.equal(hub.currentAnnexV71(), null);
}
function finishTransition(hub) {
  for (let frame = 0; hub.annexTransitionV71 && frame < 64; frame += 1) hub.update(.016);
  assert.equal(hub.annexTransitionV71, null);
}
function enter(hub) {
  assert.equal(hub.nearestParentAnnexDoorV71()?.annexId, REFUGE.id);
  assert.match(hub.statusPrompt(), /REFUGE/i);
  hub.setControl('interact', true);
  assert.equal(hub.annexTransitionV71?.annexId, REFUGE.id);
  finishTransition(hub);
  assert.equal(hub.currentAnnexV71()?.id, REFUGE.id);
  assert.equal(hub.isRefugeActiveV87(), true);
}
function walkTo(hub, centerX) {
  for (let frame = 0; Math.abs(hub.player.x + hub.player.w / 2 - centerX) > 6 && frame < 720; frame += 1) {
    const right = hub.player.x + hub.player.w / 2 < centerX;
    hub.setControl('right', right); hub.setControl('left', !right); hub.update(.016);
  }
  hub.setControl('right', false); hub.setControl('left', false);
  assert.ok(Math.abs(hub.player.x + hub.player.w / 2 - centerX) <= 6, 'real walking must reach ' + centerX);
}

test('twenty physical refuge round trips preserve all annexes and the parent return pose', () => withRuntime(({ hub, writes }) => {
  startAtDoor(hub);
  const parentX = hub.player.x, originalIds = Object.keys(hub.hubCommercialStateV71.annexes);
  for (let cycle = 1; cycle <= 20; cycle += 1) {
    enter(hub);
    const health = hub.player.health;
    walkTo(hub, 1680);
    assert.equal(hub.player.health, health);
    walkTo(hub, REFUGE.entranceLocalX);
    assert.ok(hub.nearestAnnexExitV71());
    hub.setControl('interact', true); finishTransition(hub);
    assert.equal(hub.currentAnnexV71(), null); assert.equal(hub.player.x, parentX);
    assert.equal(hub.hubCommercialStateV71.annexes[REFUGE.id].visitCount, cycle);
    assert.deepEqual(Object.keys(hub.hubCommercialStateV71.annexes), originalIds);
  }
  assert.equal(writes.some(patch => patch.hubCommercialV71?.activeAnnexId === REFUGE.id), false);
}));

test('all five local stations route physical E actions while the entrance remains an exit, not a menu', () => withRuntime(({ hub, events }) => {
  startAtDoor(hub); enter(hub);
  for (const [x, action] of [[444, 'refuge:portrait'], [860, 'refuge:terminal'], [1082, 'refuge:light'],
    [1325, 'refuge:hologram'], [1640, 'refuge:contemplate']]) {
    walkTo(hub, x);
    assert.equal(getRefugeInteractionV87(hub)?.action, action);
    hub.setControl('interact', true);
    assert.equal(events.at(-1).action, action);
    assert.equal(hub.currentAnnexV71()?.id, REFUGE.id);
  }
  walkTo(hub, REFUGE.entranceLocalX);
  assert.equal(getRefugeInteractionV87(hub), null);
  hub.setControl('interact', true);
  assert.equal(hub.annexTransitionV71?.direction, 'exit');
}));

test('snapshot and save never teleport the live Marine; stop/reload and legacy saves resume at the parent door', () => withRuntime(({ hub, writes }) => {
  startAtDoor(hub); enter(hub); walkTo(hub, 1440);
  const pose = { x: hub.player.x, y: hub.player.y, camera: hub.annexCameraV71.x };
  const snapshot = hub.getSnapshot();
  assert.equal(snapshot.roomId, REFUGE.id); assert.equal(snapshot.activeAnnexIdV71, REFUGE.id);
  assert.equal(snapshot.x, Math.round(pose.x));
  hub.persist();
  assert.deepEqual({ x: hub.player.x, y: hub.player.y, camera: hub.annexCameraV71.x }, pose);
  assert.equal(hub.currentAnnexV71()?.id, REFUGE.id);
  const saved = writes.at(-1);
  assert.equal(saved.roomId, 'crew-quarters'); assert.equal(saved.positionX, Math.round(returnX()));
  assert.equal(saved.hubCommercialV71.activeAnnexId, null);
  hub.stop();
  assert.deepEqual({ x: hub.player.x, y: hub.player.y, camera: hub.annexCameraV71.x }, pose);
  startAtDoor(hub, writes.at(-1));
  assert.equal(hub.player.x, Math.round(returnX()));
  startAtDoor(hub, visitState('hubCommercialV71'));
  assert.equal(hub.player.x, Math.round(returnX()));
  assert.equal(hub.isVentActiveV62(), false);
}));

test('REFUGE isolates enemies, human NPCs, vents and companions while preserving the Marine and external state', () => withRuntime(({ hub, context, draws }) => {
  startAtDoor(hub); enter(hub);
  hub.configureCrisis({ id: 'refuge-isolation-check', kind: 'xenomorph', count: 2 });
  assert.equal(hub.crisis.active, true); assert.ok(hub.enemies.length >= 2); assert.ok(hub.npcs.length > 0);
  const npcs = clone(hub.npcs), enemies = clone(hub.enemies), projectiles = clone(hub.projectiles);
  const routines = clone(hub.npcRoutineStateV62), crisis = clone(hub.crisis);
  const calls = { companionTick: 0, companions: 0, carried: 0, enemy: 0, vent: 0 };
  hub.onCompanionTickV87 = () => calls.companionTick++;
  hub.drawCompanionsV87 = () => calls.companions++;
  hub.drawCarriedCompanionV87 = () => calls.carried++;
  hub.drawEnemy = () => calls.enemy++;
  hub.updateVentTransitV62 = () => calls.vent++;
  const hp = hub.player.health;
  for (let frame = 0; frame < 60; frame += 1) { hub.setControl('fire', true); hub.fire(); hub.update(.016); }
  hub.setControl('fire', false);
  draws.length = 0; hub.draw();
  assert.deepEqual(calls, { companionTick: 0, companions: 0, carried: 0, enemy: 0, vent: 0 });
  assert.deepEqual(hub.npcs, npcs); assert.deepEqual(hub.enemies, enemies); assert.deepEqual(hub.projectiles, projectiles);
  assert.deepEqual(hub.npcRoutineStateV62, routines); assert.deepEqual(hub.crisis, crisis);
  assert.equal(hub.player.health, hp); assert.equal(hub.isVentActiveV62(), false);
  assert.ok(draws.some(draw => draw.source?.includes('/normalized/player/echo9-marine-')));
  assert.ok(draws.some(draw => draw.source === REFUGE_ART_V87.prop.path), 'the dedicated props are really drawn');
  assert.ok(draws.some(draw => draw.source === REFUGE_ART_V87.hologram.path), 'the generic hologram is really drawn');
  assert.equal(draws.some(draw => /\/(enemies|npcs)\//.test(draw.source || '')), false);
  assert.equal(hub.player.playerVisualV81.fallback, false);
  hub.drawPlayer(context);
  assert.equal(calls.companions, 0); assert.equal(calls.carried, 0);
}));

test('private portrait data stays out of hub snapshots and game exports without rewriting military memorial or resources', () => withRuntime(({ hub }) => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const game = new SaveSystem(storage); game.newGame(1);
  game.commit({ memorial: [{ crewId: 'existing-military-record', day: 2, reason: 'combat' }] });
  const original = clone(game.data);
  const owner = { profileId: String(game.profile), gameId: game.data.createdAt + ':legacy' };
  const personal = new RefugePersonalStoreV87({ storage });
  const photoDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZfoAAAAASUVORK5CYII=';
  const name = 'PRIVATE-REFUGE-NAME-ONLY', dedication = 'PRIVATE-REFUGE-DEDICATION-ONLY';
  const saved = personal.commit(owner, { name, dedication, lightOn: true, photoDataUrl });
  assert.equal(saved.ok, true); assert.equal(saved.changed, true);
  const photoImage = new Image(); photoImage.src = photoDataUrl;
  hub.getRefugePresentationV87 = () => ({ personal: { name, dedication, lightOn: true, photoImage }, greetingRemaining: .5, contemplating: false });
  hub.getRefugeSnapshotV87 = () => ({ active: true, modal: false, contemplating: false,
    greetingRemaining: .5, personalRevision: saved.state.revision, hasPhoto: true, storageError: null });
  startAtDoor(hub); enter(hub); walkTo(hub, 1300);
  hub.onPersist = patch => game.commit({ hub: { ...game.data.hub, ...patch } });
  const pose = { x: hub.player.x, y: hub.player.y };
  hub.draw(); const snapshot = hub.getSnapshot(); hub.persist();
  assert.deepEqual({ x: hub.player.x, y: hub.player.y }, pose);
  assert.equal(snapshot.roomId, REFUGE.id);
  for (const serialized of [JSON.stringify(snapshot), game.export()]) {
    for (const privateValue of [name, dedication, photoDataUrl, 'photoDataUrl', 'photoImage'])
      assert.equal(serialized.includes(privateValue), false, 'private value must not be exported: ' + privateValue.slice(0, 32));
  }
  assert.ok(values.get(refugePersonalStorageKeyV87(owner)).includes(photoDataUrl));
  assert.deepEqual(game.data.memorial, original.memorial);
  assert.deepEqual(game.data.galaxy.resources, original.galaxy.resources);
  for (const field of ['crew', 'inventory', 'shipAnimalsV1', 'shipPortV1']) assert.deepEqual(game.data[field], original[field], field);
  assert.deepEqual(game.data.hub.systems, original.hub.systems);
  assert.equal(personal.load({ ...owner, profileId: '2' }).state.photoDataUrl, null);
}));
