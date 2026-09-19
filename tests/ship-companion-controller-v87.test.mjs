import test from 'node:test';
import assert from 'node:assert/strict';
import { ShipCompanionControllerV87, sampleCompanionPresentationV87 } from '../src/ship-companion-controller-v87.js';
import { SaveSystem, SAVE_PREFIX } from '../src/save.js';
import { SHIP_PORT_DEFINITION_V87 as PORT, requestShipPortDockV87, stepShipPortV87 } from '../src/ship-port-state-v87.js';
import { SHIP_PORT_ANNEX_V87 } from '../src/ship-port-room-v87.js';
import { SHIP_ANIMAL_ANNEX_V87, getShipAnimalHabitatsV87, installShipAnimalHabitatV87 } from '../src/ship-animal-habitat-v87.js';
import { SHIP_ANIMAL_ATLASES_V87 } from '../src/ship-animal-art-v87.js';
import { acquireShipAnimalV87 } from '../src/ship-animal-state-v87.js';
import { initializeShipAnimalDeliveryV87, pickupShipAnimalDeliveryV87, stepShipAnimalDeliveryV87,
  sampleShipAnimalDeliveriesV87 } from '../src/ship-animal-delivery-v87.js';

const clone = value => structuredClone(value);
const success = result => { assert.equal(result.ok, true, result.code); return result.save; };
const image = path => ({ currentSrc: path, complete: true, naturalWidth: 1536, naturalHeight: 1024 });
function memoryStorage() {
  const values = new Map();
  return { values, reject: false, attempts: 0,
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) {
      if (key.startsWith(SAVE_PREFIX)) { this.attempts += 1; if (this.reject) throw new Error('QuotaExceededError'); }
      values.set(key, value);
    }, removeItem(key) { values.delete(key); }
  };
}
function dockContext(save) {
  return { careReady: true, manifestReady: true, physical: { roomId: PORT.commandRoomId },
    authorization: { granted: true, portId: PORT.id, sectorId: PORT.sectorId,
      campaignHours: (save.clock.day - 1) * 24 + save.clock.hour } };
}
function docked(save) {
  save = success(requestShipPortDockV87(save, { transactionId: 'controller-dock' }, dockContext(save)));
  for (let i = 1; i <= 14; i += 1) save = success(stepShipPortV87(save, { simulationTime: i, dtSeconds: 1 }, dockContext(save)));
  return save;
}
function equip(save) {
  for (const habitat of getShipAnimalHabitatsV87(save)) save = success(installShipAnimalHabitatV87(save, habitat.id,
    { roomId: 'animal-care', playerX: habitat.installX, feetY: 624, artReady: true }));
  return save;
}
function purchased(save, carried = false) {
  const habitat = getShipAnimalHabitatsV87(save).find(entry => entry.type === 'cat-berth');
  save = success(acquireShipAnimalV87(save, { offerId: 'offer-animal-moka', habitatId: habitat.id, transactionId: 'controller-moka' },
    { vendorAccessible: true, artReadyIds: ['animal-moka'], habitats: getShipAnimalHabitatsV87(save),
      care: { available: true, capacity: 2 }, simulationTime: save.shipAnimalsV1.lastSimulationTime,
      transit: { edgeId: 'controller-delivery', from: { hubId: PORT.id, roomId: PORT.counterRoomId,
        deckId: 'engineering', x: 990, y: 624 }, to: habitat.location } }));
  save = success(initializeShipAnimalDeliveryV87(save, { animalId: 'animal-moka' }));
  if (carried) save = success(pickupShipAnimalDeliveryV87(save, { animalId: 'animal-moka' },
    { player: { roomId: PORT.counterRoomId, deckId: 'engineering', x: 990, y: 624, alive: true }, portAccessible: true }));
  return save;
}
function atBerth(save) {
  let player = { roomId: PORT.counterRoomId, deckId: 'engineering', x: 990, y: 624, alive: true };
  const tick = next => {
    save = success(stepShipAnimalDeliveryV87(save, { delta: .25, simulationTime: save.shipAnimalsV1.lastSimulationTime + .25 }, { player: next }));
    player = next;
  };
  for (const [x, roomId, deckId] of [
    [200, PORT.counterRoomId, 'engineering'],
    [SHIP_PORT_ANNEX_V87.parentDoorBounds.x + SHIP_PORT_ANNEX_V87.parentDoorBounds.w / 2, PORT.commandRoomId, 'engineering'],
    [1250, PORT.commandRoomId, 'engineering'], [1300, 'reactor', 'engineering'], [2372, 'reactor', 'engineering'],
    [2372, 'armory', 'industrial'], [2372, 'mess', 'habitat'], [1300, 'mess', 'habitat'],
    [1250, 'crew-quarters', 'habitat'], [704, 'crew-quarters', 'habitat'], [255, 'animal-care', 'habitat'], [690, 'animal-care', 'habitat']
  ]) {
    if (roomId !== player.roomId || deckId !== player.deckId) tick({ ...player, x, roomId, deckId });
    else while (Math.abs(x - player.x) > .001) tick({ ...player, x: player.x + Math.sign(x - player.x) * Math.min(150, Math.abs(x - player.x)) });
  }
  return save;
}

/** Method-level controller tests use the real SaveSystem/domains, not a browser or production page. */
function fixture({ atPort = false, equipped = false, delivery = null } = {}) {
  const backend = memoryStorage(); const saveSystem = new SaveSystem(backend);
  saveSystem.newGame(1); saveSystem.commit({ needsPlayerCreationV84: false, scene: 'hub' });
  if (atPort || delivery) saveSystem.commit(docked(saveSystem.data));
  if (equipped || delivery) saveSystem.commit(equip(saveSystem.data));
  if (delivery) {
    let save = purchased(saveSystem.data, delivery !== 'awaiting');
    if (delivery === 'at-berth') save = atBerth(save);
    saveSystem.commit(save);
  }
  const control = { active: true, roomId: PORT.commandRoomId, openResult: true };
  const calls = { stop: [], pause: 0, resume: 0, uiOpen: [], uiClose: [], refresh: 0, graph: 0, toasts: [] };
  const portImages = new Map(SHIP_PORT_ANNEX_V87.artRoles.map(role => [role, image(SHIP_PORT_ANNEX_V87.art[role])]));
  const hub = {
    running: true, annexTransitionV71: null, editorPlaytest: false,
    player: { x: 24, y: 532, w: 44, h: 92, alive: true, facing: 1, climbing: false },
    state: { deck: 3, roomId: PORT.commandRoomId },
    hubCommercialStateV71: clone(saveSystem.data.hub.commercialV71),
    npcRoutineContextV62: { save: clone(saveSystem.data) },
    currentRoom: () => ({ id: control.roomId }),
    currentAnnexV71: () => control.roomId === PORT.counterRoomId ? SHIP_PORT_ANNEX_V87 : control.roomId === 'animal-care' ? SHIP_ANIMAL_ANNEX_V87 : null,
    getAnnexAssetGroupV71: () => portImages, ensureAnnexAssetsV71: () => portImages,
    stop(persist = true) { calls.stop.push(persist); if (persist) saveSystem.commit(); this.running = false; },
    pause() { calls.pause += 1; saveSystem.commit(); this.running = false; return true; },
    resume() { calls.resume += 1; this.running = true; return true; }
  };
  const controller = Object.create(ShipCompanionControllerV87.prototype);
  Object.assign(controller, { hub, saveSystem, isActive: () => control.active,
    toast: message => calls.toasts.push(message), documentRef: { hidden: false }, tickRemainder: 0,
    graph: null, ownerStamp: null, lastFailure: null,
    images: new Map(Object.entries(SHIP_ANIMAL_ATLASES_V87).map(([id, atlas]) => [id, image(atlas.path)])),
    ui: { isOpen: false,
      open(options) { calls.uiOpen.push(options); this.isOpen = control.openResult; return control.openResult; },
      close(options) { calls.uiClose.push(options); this.isOpen = false; },
      refresh() { calls.refresh += 1; }
    }
  });
  controller.refreshGraph = () => { calls.graph += 1; return null; };
  controller.ownerStamp = controller.stamp();
  const locate = (roomId, x, deck = roomId === 'animal-care' || roomId === 'crew-quarters' ? 1 : 3, y = 624) => {
    control.roomId = roomId; hub.state.deck = deck;
    hub.state.roomId = roomId === PORT.counterRoomId ? PORT.commandRoomId : roomId === 'animal-care' ? 'crew-quarters' : roomId;
    Object.assign(hub.player, { x: x - 22, y: y - 92 });
    hub.hubCommercialStateV71.activeAnnexId = [PORT.counterRoomId, 'animal-care'].includes(roomId) ? roomId : null;
  };
  backend.attempts = 0;
  return { controller, hub, backend, saveSystem, calls, control, locate };
}
const drawContext = draws => ({ drawImage: (...args) => draws.push(args), save() {}, restore() {}, translate() {}, scale() {} });

test('quota rollback performs one write attempt, preserves durable/live state and stops without a second persist', () => {
  const f = fixture(); const { controller, backend, saveSystem, hub, calls } = f;
  const root = saveSystem.data, state = root.shipPortV1, context = clone(hub.npcRoutineContextV62.save);
  const before = JSON.stringify(root), bytes = [...backend.values];
  const candidate = requestShipPortDockV87(root, { transactionId: 'quota-dock' }, dockContext(root));
  assert.equal(candidate.ok, true); backend.reject = true;
  assert.doesNotThrow(() => assert.equal(controller.commit(candidate), false));
  assert.equal(backend.attempts, 1); assert.deepEqual(calls.stop, [false]); assert.equal(calls.pause, 0);
  assert.equal(hub.running, false); assert.equal(saveSystem.data, root); assert.equal(root.shipPortV1, state);
  assert.equal(JSON.stringify(root), before); assert.deepEqual([...backend.values], bytes);
  assert.deepEqual(hub.npcRoutineContextV62.save, context); assert.equal(calls.toasts.length, 1);
  backend.reject = false; hub.running = true;
  assert.equal(controller.commit(candidate), true);
  assert.equal(saveSystem.data.shipPortV1.phase, 'approach');
  assert.deepEqual(hub.npcRoutineContextV62.save.shipPortV1, saveSystem.data.shipPortV1);
  assert.notEqual(hub.npcRoutineContextV62.save.shipPortV1, saveSystem.data.shipPortV1);
});

test('a pause persistence refusal is caught and does not open a dialog or submit a port transaction', () => {
  const { controller, backend, calls, saveSystem } = fixture(); const before = JSON.stringify(saveSystem.data);
  backend.reject = true;
  assert.doesNotThrow(() => assert.equal(controller.handle({ action: 'ship-port:terminal' }), false));
  assert.equal(backend.attempts, 1); assert.equal(calls.pause, 1); assert.equal(calls.uiOpen.length, 0);
  assert.match(calls.toasts[0], /Pause non enregistrée/); assert.equal(JSON.stringify(saveSystem.data), before);
});

test('dialog creation refusal resumes a successfully paused hub and reports the unavailable display', () => {
  const f = fixture(); f.control.openResult = false;
  assert.equal(f.controller.handle({ action: 'ship-port:terminal' }), false);
  assert.equal(f.calls.pause, 1); assert.equal(f.calls.resume, 1); assert.equal(f.hub.running, true);
  assert.match(f.calls.toasts.at(-1), /dialogue ne peut pas être affiché/);
});

test('abort remains enabled by the controller model during approach and cancels through the real port domain', () => {
  const { controller, saveSystem, calls } = fixture();
  saveSystem.commit(success(requestShipPortDockV87(saveSystem.data, { transactionId: 'abort-dock' }, dockContext(saveSystem.data))));
  const before = saveSystem.data.galaxy.resources.credits;
  assert.equal(controller.model().phase, 'approach'); assert.equal(controller.model().busy, false);
  assert.equal(controller.uiAction({ type: 'abort' }), true);
  assert.equal(saveSystem.data.shipPortV1.phase, 'undocked');
  assert.equal(saveSystem.data.galaxy.resources.credits, before); assert.equal(calls.uiClose.length, 1);
});

test('a physical shop purchase atomically debits once and creates a pickup crate, not an instant resident', () => {
  const f = fixture({ atPort: true, equipped: true }); f.locate(PORT.counterRoomId, 600);
  assert.equal(f.controller.model().offers.find(entry => entry.animalId === 'animal-moka').canBuy, true);
  assert.equal(f.controller.uiAction({ type: 'buy', animalId: 'animal-moka' }), true);
  assert.equal(f.saveSystem.data.galaxy.resources.credits, 2980);
  const animal = f.saveSystem.data.shipAnimalsV1.animals['animal-moka'];
  assert.equal(animal.location.kind, 'transit'); assert.equal(animal.deliveryV87.phase, 'awaiting-pickup');
  assert.equal(f.controller.uiAction({ type: 'buy', animalId: 'animal-moka' }), false);
  assert.equal(f.saveSystem.data.galaxy.resources.credits, 2980);
});

test('controller buys Luciole before Moka into separate berths and allows three companions only with three installed slots', () => {
  const f = fixture({ atPort: true, equipped: true }); f.locate(PORT.counterRoomId, 600);
  for (const animalId of ['animal-luciole', 'animal-moka', 'animal-brume']) {
    assert.equal(f.controller.model().offers.find(o => o.animalId === animalId).canBuy, true);
    assert.equal(f.controller.uiAction({ type: 'buy', animalId }), true);
    const owned = f.saveSystem.data.shipAnimalsV1.animals[animalId];
    assert.equal(owned.habitatId, animalId.replace('animal-', '') + '-berth-v87');
    assert.equal(owned.deliveryV87.phase, 'awaiting-pickup'); assert.equal(owned.location.kind, 'transit');
  }
  assert.equal(f.saveSystem.data.galaxy.resources.credits, 2460);
  assert.equal(Object.keys(f.saveSystem.data.shipAnimalsV1.receipts).length, 3);
  assert.equal(new Set(Object.values(f.saveSystem.data.shipAnimalsV1.reservations).map(r => r.habitatId)).size, 3);
  assert.equal(f.controller.uiAction({ type: 'buy', animalId: 'animal-luciole' }), false);
  assert.equal(f.saveSystem.data.galaxy.resources.credits, 2460);
});

test('controller never offers Moka berth as a substitute for missing Luciole fitting or missing dedicated art', () => {
  const f = fixture({ atPort: true, equipped: true }); f.locate(PORT.counterRoomId, 600);
  const state = clone(f.saveSystem.data.shipAnimalsV1); delete state.habitats['luciole-berth-v87'];
  f.saveSystem.commit({ shipAnimalsV1: state });
  assert.equal(f.controller.model().offers.find(o => o.animalId === 'animal-moka').canBuy, true);
  assert.equal(f.controller.model().offers.find(o => o.animalId === 'animal-luciole').canBuy, false);
  const before = JSON.stringify(f.saveSystem.data);
  assert.equal(f.controller.uiAction({ type: 'buy', animalId: 'animal-luciole' }), false);
  assert.equal(JSON.stringify(f.saveSystem.data), before);
  f.saveSystem.commit(equip(f.saveSystem.data)); f.controller.images.delete('animal-luciole');
  assert.equal(f.controller.model().offers.find(o => o.animalId === 'animal-luciole').canBuy, false);
  assert.equal(f.controller.uiAction({ type: 'buy', animalId: 'animal-luciole' }), false);
});

test('Luciole purchase quota failure never publishes ownership, money debit or a pickup crate', () => {
  const f = fixture({ atPort: true, equipped: true }); f.locate(PORT.counterRoomId, 600);
  const before = JSON.stringify(f.saveSystem.data), bytes = [...f.backend.values]; f.backend.reject = true;
  assert.equal(f.controller.uiAction({ type: 'buy', animalId: 'animal-luciole' }), false);
  assert.equal(JSON.stringify(f.saveSystem.data), before); assert.deepEqual([...f.backend.values], bytes);
  assert.equal(f.backend.attempts, 1); assert.deepEqual(sampleShipAnimalDeliveriesV87(f.saveSystem.data), []);
});

for (const reason of ['wrong-room', 'too-far', 'airborne', 'dead', 'danger', 'unknown-animal']) test(`purchase guard ${reason} preserves money and ownership`, () => {
  const f = fixture({ atPort: true, equipped: true }); f.locate(PORT.counterRoomId, 600);
  if (reason === 'wrong-room') f.locate(PORT.commandRoomId, 600);
  if (reason === 'too-far') f.locate(PORT.counterRoomId, 1875);
  if (reason === 'airborne') f.hub.player.y -= 80;
  if (reason === 'dead') f.hub.player.alive = false;
  if (reason === 'danger') f.saveSystem.commit({ hub: { ...f.saveSystem.data.hub, activeCrisis: { id: 'controller-crisis', kind: 'xenomorph', resolved: false } } });
  const before = JSON.stringify(f.saveSystem.data), bytes = [...f.backend.values];
  assert.equal(f.controller.uiAction({ type: 'buy', animalId: reason === 'unknown-animal' ? 'unknown' : 'animal-moka' }), false);
  assert.equal(JSON.stringify(f.saveSystem.data), before); assert.deepEqual([...f.backend.values], bytes);
});

test('a stale profile or inactive owner cannot commit a prepared candidate or buy through an old dialog', () => {
  const f = fixture({ atPort: true, equipped: true }); f.locate(PORT.counterRoomId, 600);
  const stale = { ok: true, changed: true, save: purchased(f.saveSystem.data) };
  f.saveSystem.newGame(2);
  const second = JSON.stringify(f.saveSystem.data), bytes = [...f.backend.values];
  assert.equal(f.controller.commit(stale), false);
  assert.equal(f.controller.uiAction({ type: 'buy', animalId: 'animal-moka' }), false);
  assert.equal(JSON.stringify(f.saveSystem.data), second); assert.deepEqual([...f.backend.values], bytes);
  assert.deepEqual(f.calls.uiClose.at(-1), { notify: false });
  f.controller.ownerStamp = f.controller.stamp(); f.control.active = false;
  assert.equal(f.controller.commit(stale), false);
  assert.equal(f.controller.handle({ action: 'ship-port:shop' }), false);
});

test('danger at reception refuses the real transfer without losing or relocating the carried crate', () => {
  const f = fixture({ delivery: 'at-berth' }); f.locate('animal-care', 690);
  f.saveSystem.commit({ hub: { ...f.saveSystem.data.hub, activeCrisis: { id: 'arrival-crisis', kind: 'xenomorph', resolved: false } } });
  const before = JSON.stringify(f.saveSystem.data), bytes = [...f.backend.values];
  assert.equal(f.controller.interaction()?.action, 'ship-animal:receive');
  assert.equal(f.controller.handle({ action: 'ship-animal:receive', animalId: 'animal-moka' }), false);
  assert.equal(JSON.stringify(f.saveSystem.data), before); assert.deepEqual([...f.backend.values], bytes);
  assert.equal(f.saveSystem.data.shipAnimalsV1.animals['animal-moka'].deliveryV87.phase, 'carried');
  assert.match(f.calls.toasts.at(-1), /transfer-blocked/);
});

test('a discontinuous transport tick commits one recoverable drop at the last anchor and keeps the game running', () => {
  const f = fixture({ delivery: 'carried' }); f.locate('animal-care', 690);
  const before = clone(f.saveSystem.data);
  f.controller.tick(.2);
  assert.deepEqual(f.calls.stop, []); assert.equal(f.hub.running, true);
  assert.equal(f.backend.attempts, 1); assert.match(f.calls.toasts.at(-1), /dernier point de transport validé/);
  const expected = clone(before.shipAnimalsV1); expected.revision += 1;
  expected.animals['animal-moka'].revision += 1; expected.animals['animal-moka'].deliveryV87.phase = 'awaiting-recovery';
  assert.deepEqual(f.saveSystem.data.shipAnimalsV1, expected);
  assert.deepEqual(f.saveSystem.data.shipPortV1, before.shipPortV1);
  assert.deepEqual(f.saveSystem.data.galaxy, before.galaxy);
  assert.deepEqual(sampleShipAnimalDeliveriesV87(f.saveSystem.data), [{ animalId: 'animal-moka', phase: 'awaiting-recovery',
    elapsed: 0, roomId: PORT.counterRoomId, deckId: 'engineering', x: 990, y: 624, carried: false, checkpoints: 0 }]);
  assert.equal(f.controller.interaction(), null);
  f.controller.tick(.2); assert.equal(f.backend.attempts, 1);
  f.locate(PORT.counterRoomId, 990);
  const interaction = f.controller.interaction(); assert.equal(interaction.action, 'ship-animal:pickup');
  assert.match(interaction.prompt, /REPRENDRE LA CAISSE/);
  const draws = []; f.controller.draw(drawContext(draws)); assert.equal(draws.length, 1);
  f.controller.drawCarried(drawContext(draws)); assert.equal(draws.length, 1);
  assert.equal(f.controller.handle(interaction), true); assert.equal(f.backend.attempts, 2);
  assert.equal(f.saveSystem.data.shipAnimalsV1.animals['animal-moka'].deliveryV87.phase, 'carried');
  assert.deepEqual(f.saveSystem.data.galaxy, before.galaxy);
});

test('quota refusal of a recovery drop preserves the carried route and stops once without a second persist', () => {
  const f = fixture({ delivery: 'carried' }); f.locate('animal-care', 690);
  const before = JSON.stringify(f.saveSystem.data), bytes = [...f.backend.values];
  const context = clone(f.hub.npcRoutineContextV62.save);
  f.backend.reject = true;
  assert.doesNotThrow(() => f.controller.tick(.2));
  assert.equal(f.backend.attempts, 1); assert.deepEqual(f.calls.stop, [false]);
  assert.equal(f.hub.running, false); assert.equal(f.calls.pause, 0);
  assert.equal(JSON.stringify(f.saveSystem.data), before); assert.deepEqual([...f.backend.values], bytes);
  assert.deepEqual(f.hub.npcRoutineContextV62.save, context);
  assert.equal(f.calls.toasts.length, 1); assert.match(f.calls.toasts[0], /Enregistrement refusé/);
  assert.equal(sampleShipAnimalDeliveriesV87(f.saveSystem.data)[0].carried, true);
  f.controller.tick(.2); assert.equal(f.backend.attempts, 1);
});

test('corrupt transport metadata stops without converting corruption into a recoverable drop or bitmap', () => {
  const f = fixture({ delivery: 'carried' }); f.locate('animal-care', 690);
  f.saveSystem.data.shipAnimalsV1.animals['animal-moka'].deliveryV87.carrierLocation.x += 1;
  const before = JSON.stringify(f.saveSystem.data);
  f.controller.tick(.2);
  assert.deepEqual(f.calls.stop, [false]); assert.equal(f.backend.attempts, 0);
  assert.equal(JSON.stringify(f.saveSystem.data), before);
  assert.match(f.calls.toasts.at(-1), /invalid-delivery/);
  f.locate(PORT.counterRoomId, 990);
  assert.equal(f.controller.interaction(), null);
  const draws = []; f.controller.draw(drawContext(draws)); f.controller.drawCarried(drawContext(draws));
  assert.equal(draws.length, 0);
});

test('a carried crate follows bounded live feet between commits but never crosses rooms or a respawn discontinuity', () => {
  const f = fixture({ delivery: 'carried' }); f.locate(PORT.counterRoomId, 1000);
  const before = JSON.stringify(f.saveSystem.data), bytes = [...f.backend.values];
  const draws = []; f.controller.drawCarried(drawContext(draws));
  assert.equal(draws.length, 1); assert.equal(draws[0][5], 1000 + 12);
  f.controller.tick(.1); f.locate(PORT.counterRoomId, 1027);
  f.controller.drawCarried(drawContext(draws)); assert.equal(draws.at(-1)[5], 1027 + 12);
  f.locate(PORT.counterRoomId, 118); draws.length = 0;
  f.controller.drawCarried(drawContext(draws)); assert.equal(draws.length, 0);
  f.locate('animal-care', 690); draws.length = 0;
  f.controller.drawCarried(drawContext(draws)); assert.equal(draws.length, 0);
  assert.equal(JSON.stringify(f.saveSystem.data), before); assert.deepEqual([...f.backend.values], bytes);
  assert.equal(f.backend.attempts, 0);
});

test('drawn carried crate mirrors exactly and follows a normal post-commit physics frame with unchanged collider', () => {
  const f = fixture({ delivery: 'carried' }); f.locate(PORT.counterRoomId, 990);
  const before = JSON.stringify(f.saveSystem.data), collider = [f.hub.player.w, f.hub.player.h];
  const draws = []; f.controller.drawCarried(drawContext(draws));
  const right = draws.at(-1); f.hub.player.facing = -1;
  f.controller.drawCarried(drawContext(draws)); const left = draws.at(-1);
  assert.equal(right[5] + right[7] / 2 - 990, 36);
  assert.equal(left[5] + left[7] / 2 - 990, -36);
  assert.equal(right[6], left[6]); assert.equal(right[7], left[7]); assert.equal(right[8], left[8]);
  f.controller.tick(.034); f.locate(PORT.counterRoomId, 1002.58);
  f.controller.drawCarried(drawContext(draws)); assert.equal(draws.at(-1)[5], 1002.58 - 60);
  assert.deepEqual([f.hub.player.w, f.hub.player.h], collider);
  assert.equal(JSON.stringify(f.saveSystem.data), before); assert.equal(f.backend.attempts, 0);
});

test('a real sequence of pre-physics controller ticks and post-physics draws keeps every frame attached', () => {
  const f = fixture({ delivery: 'carried' }); let x = 990; f.locate(PORT.counterRoomId, x);
  const draws = [];
  for (let frame = 0; frame < 60; frame += 1) {
    f.controller.tick(.016); x += 370 * .016; f.locate(PORT.counterRoomId, x);
    const bytes = [...f.backend.values], attempts = f.backend.attempts;
    f.controller.drawCarried(drawContext(draws));
    assert.equal(draws.length, frame + 1); assert.ok(Math.abs(draws.at(-1)[5] - (x + 12)) < 1e-9);
    assert.deepEqual([...f.backend.values], bytes); assert.equal(f.backend.attempts, attempts);
    assert.equal(f.hub.running, true);
  }
  assert.equal(f.saveSystem.data.shipAnimalsV1.animals['animal-moka'].deliveryV87.phase, 'carried');
  assert.ok(f.backend.attempts > 0, 'regular transport commits must still occur');
});

test('a dropped crate stays on its anchor until physical recovery, then bounded frame tracking resumes', () => {
  const f = fixture({ delivery: 'carried' }); f.locate(PORT.counterRoomId, 990);
  const first = []; f.controller.drawCarried(drawContext(first));
  f.locate('animal-care', 690); f.controller.tick(.2);
  assert.equal(f.saveSystem.data.shipAnimalsV1.animals['animal-moka'].deliveryV87.phase, 'awaiting-recovery');
  f.locate(PORT.counterRoomId, 1050);
  const before = JSON.stringify(f.saveSystem.data), attempts = f.backend.attempts;
  const world = []; f.controller.draw(drawContext(world)); f.controller.drawCarried(drawContext(world));
  assert.equal(world.length, 1); assert.equal(world[0][5], 990 - 28);
  assert.equal(f.controller.carriedPresentationV87, null);
  assert.equal(JSON.stringify(f.saveSystem.data), before); assert.equal(f.backend.attempts, attempts);
  assert.equal(f.controller.handle(f.controller.interaction()), true);
  const recovered = JSON.stringify(f.saveSystem.data); f.locate(PORT.counterRoomId, 1060);
  const carried = []; f.controller.drawCarried(drawContext(carried));
  assert.equal(carried.length, 1); assert.equal(carried[0][5], 1060 + 12);
  assert.equal(JSON.stringify(f.saveSystem.data), recovered);
});

for (const condition of ['hub-paused', 'dialog-open', 'hidden']) test(`carried presentation ${condition} freezes its last approved pose without saving`, () => {
  const f = fixture({ delivery: 'carried' }); f.controller.tick(.1); f.locate(PORT.counterRoomId, 1027);
  const draws = []; f.controller.drawCarried(drawContext(draws)); const approved = [...draws.at(-1)];
  if (condition === 'hub-paused') f.hub.running = false;
  if (condition === 'dialog-open') f.controller.ui.isOpen = true;
  if (condition === 'hidden') f.controller.documentRef.hidden = true;
  const before = JSON.stringify(f.saveSystem.data), bytes = [...f.backend.values];
  f.locate(PORT.counterRoomId, 1037); f.hub.player.facing = -1;
  f.controller.tick(5); f.controller.drawCarried(drawContext(draws));
  assert.deepEqual(draws.at(-1), approved);
  assert.equal(JSON.stringify(f.saveSystem.data), before); assert.deepEqual([...f.backend.values], bytes);
  assert.equal(f.backend.attempts, 0);
});

test('carrier presentation clears on door transfer, profile mismatch, close or inactive owner', () => {
  for (const condition of ['door', 'profile', 'close', 'inactive']) {
    const f = fixture({ delivery: 'carried' }); f.locate(PORT.counterRoomId, 990);
    const draws = []; f.controller.drawCarried(drawContext(draws)); assert.equal(draws.length, 1);
    if (condition === 'door') f.hub.annexTransitionV71 = { annexId: PORT.counterRoomId, progress: .2 };
    if (condition === 'profile') f.controller.ownerStamp = 'old-profile';
    if (condition === 'inactive') f.control.active = false;
    if (condition === 'close') {
      f.controller.close(); assert.equal(f.controller.carriedPresentationV87, null);
      assert.equal(f.controller.carryFrameDeltaV87, 0); continue;
    }
    const before = JSON.stringify(f.saveSystem.data);
    draws.length = 0; f.controller.drawCarried(drawContext(draws));
    assert.equal(draws.length, 0); assert.equal(f.controller.carriedPresentationV87, null);
    assert.equal(JSON.stringify(f.saveSystem.data), before); assert.equal(f.backend.attempts, 0);
  }
});

for (const phase of ['awaiting', 'carried']) test(`invalid ${phase} delivery metadata produces no crate bitmap`, () => {
  const f = fixture({ delivery: phase }); f.locate(PORT.counterRoomId, 990);
  f.saveSystem.data.shipAnimalsV1.animals['animal-moka'].deliveryV87.schema = 999;
  const before = JSON.stringify(f.saveSystem.data), draws = [];
  f.controller.draw(drawContext(draws)); f.controller.drawCarried(drawContext(draws));
  assert.equal(draws.length, 0); assert.equal(JSON.stringify(f.saveSystem.data), before);
});

for (const condition of ['inactive', 'hidden', 'dialog-open', 'hub-paused']) test(`${condition}: controller does not advance time, graph, storage or maneuver`, () => {
  const f = fixture(); f.saveSystem.commit(success(requestShipPortDockV87(f.saveSystem.data, { transactionId: 'paused-dock' }, dockContext(f.saveSystem.data))));
  f.backend.attempts = 0;
  if (condition === 'inactive') f.control.active = false;
  if (condition === 'hidden') f.controller.documentRef.hidden = true;
  if (condition === 'dialog-open') f.controller.ui.isOpen = true;
  if (condition === 'hub-paused') f.hub.running = false;
  const before = JSON.stringify(f.saveSystem.data);
  f.controller.tick(.25); f.controller.tick(60);
  assert.equal(JSON.stringify(f.saveSystem.data), before); assert.equal(f.backend.attempts, 0);
  assert.equal(f.calls.graph, 0); assert.equal(f.controller.tickRemainder, 0);
});

test('active ticks advance only fixed gameplay time and synchronize the same owner after a durable commit', () => {
  const f = fixture(); f.saveSystem.commit(success(requestShipPortDockV87(f.saveSystem.data, { transactionId: 'active-dock' }, dockContext(f.saveSystem.data))));
  f.backend.attempts = 0; f.controller.tick(.1);
  assert.equal(f.backend.attempts, 0); assert.equal(f.saveSystem.data.shipPortV1.elapsedSeconds, 0);
  f.controller.tick(.1);
  assert.equal(f.backend.attempts, 1); assert.equal(f.saveSystem.data.shipPortV1.elapsedSeconds, .2);
  assert.deepEqual(f.hub.npcRoutineContextV62.save.shipPortV1, f.saveSystem.data.shipPortV1);
  assert.equal(f.saveSystem.data.galaxy.resources.credits, 3200);
});

test('presentation blends only between committed endpoints and caps animation lookahead to .2 seconds without mutation', () => {
  const previous = Object.freeze({ animalId: 'animal-moka', roomId: 'animal-care', deckId: 'habitat',
    clipId: 'walk', facing: 1, x: 600, y: 624, elapsed: 3 });
  const actor = Object.freeze({ ...previous, x: 612, y: 620, elapsed: 3.2 });
  const middle = sampleCompanionPresentationV87(actor, previous, .1);
  assert.equal(middle.x, 606); assert.equal(middle.y, 622); assert.ok(Math.abs(middle.elapsed - 3.3) < 1e-9);
  assert.equal(sampleCompanionPresentationV87(actor, previous, 0).x, 600);
  const late = sampleCompanionPresentationV87(actor, previous, 5000);
  assert.equal(late.x, 612); assert.equal(late.y, 620); assert.ok(Math.abs(late.elapsed - 3.4) < 1e-9);
  for (const bad of [NaN, Infinity, -5]) {
    const result = sampleCompanionPresentationV87(actor, previous, bad);
    assert.equal(result.x, previous.x); assert.equal(result.elapsed, actor.elapsed);
    assert.ok(Number.isFinite(result.x) && Number.isFinite(result.y));
  }
  assert.equal(actor.x, 612); assert.equal(actor.elapsed, 3.2); assert.equal(previous.x, 600);
  assert.notEqual(middle, actor); assert.notEqual(middle, previous);
});

test('presentation never bridges identities, rooms, decks, clips, facing reversals or gaps larger than 32 pixels', () => {
  const actor = { animalId: 'animal-moka', roomId: 'animal-care', deckId: 'habitat', clipId: 'walk', facing: 1,
    x: 612, y: 624, elapsed: 1 };
  for (const patch of [{ animalId: 'animal-brume' }, { roomId: 'crew-quarters' }, { deckId: 'engineering' },
    { clipId: 'idle' }, { facing: -1 }, { x: 579 }, { y: 590 }]) {
    const result = sampleCompanionPresentationV87(actor, { ...actor, x: 600, ...patch }, .1);
    assert.equal(result.x, actor.x); assert.equal(result.y, actor.y);
  }
  assert.equal(sampleCompanionPresentationV87(actor, undefined, .1).x, actor.x);
  assert.equal(sampleCompanionPresentationV87(actor, { ...actor, x: actor.x - 32 }, .1).x, actor.x - 16);
});

test('pause and reduced motion suppress interpolation and animation advancement rather than modifying the saved actor', () => {
  const actor = Object.freeze({ animalId: 'animal-moka', roomId: 'animal-care', deckId: 'habitat', clipId: 'walk',
    facing: 1, x: 612, y: 624, elapsed: 4 });
  const previous = Object.freeze({ ...actor, x: 600, elapsed: 3.8 });
  const paused = sampleCompanionPresentationV87(actor, previous, .2, { paused: true });
  assert.equal(paused.x, actor.x); assert.equal(paused.elapsed, 4);
  for (const paused of [false, true]) {
    const reduced = sampleCompanionPresentationV87(actor, previous, .2, { paused, reducedMotion: true });
    assert.equal(reduced.x, actor.x); assert.equal(reduced.elapsed, 0);
  }
  assert.equal(actor.elapsed, 4); assert.equal(actor.x, 612); assert.equal(previous.x, 600);
});
