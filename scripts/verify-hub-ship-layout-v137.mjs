import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openSync, readSync, closeSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HUB_ANNEXES_V87, createHubCommercialStateV87, applyHubAnnexStationV87 } from '../src/hub-annex-registry-v87.js';
import { HUB_ANNEXES_V137, HUB_ANNEX_BY_ID_V137, createHubCommercialStateV137, applyHubAnnexStationV137,
  validateHubAnnexGeometryV137, buildHubRuntimeGraphV137 } from '../src/hub-annex-registry-v137.js';
import { HUB_SHIP_SPACES_V137, HUB_SHIP_CONNECTIONS_V137, HUB_SHIP_PARENT_LANDINGS_V137,
  getHubShipConnectionsForSpaceV137, getHubShipConnectionV137 } from '../src/hub-ship-layout-v137.js';
import { HUB_FURNISHING_ATLAS_V137, getHubFurnishingCellV137 } from '../src/hub-furnishing-atlas-v137.js';
import { HUB_DECKS, HUB_WORLD, buildHubObstacleGeometryV87 } from '../src/hub-game.js';
import { buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { HubGame } from '../src/hub-opening-v88.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { projectRefugeHubSaveV87 } from '../src/refuge-save-v87.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const clone = value => structuredClone(value);
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function size(source) {
  let descriptor;
  try {
    descriptor = openSync(resolve(root, `.${new URL(source, 'http://fixture.invalid').pathname}`), 'r');
    const header = Buffer.alloc(32); readSync(descriptor, header, 0, 32, 0);
    if (header.subarray(1, 4).toString() === 'PNG') return [header.readUInt32BE(16), header.readUInt32BE(20)];
    if (header.subarray(0, 4).toString() === 'RIFF' && header.subarray(12, 16).toString() === 'VP8X') return [header.readUIntLE(24, 3) + 1, header.readUIntLE(27, 3) + 1];
    return [0, 0];
  } catch { return [0, 0]; } finally { if (descriptor !== undefined) closeSync(descriptor); }
}
function host() {
  const events = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener']) globalThis[name] = events[name].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 0; naturalHeight = 0;
    set src(source) { this._src = source; [this.naturalWidth, this.naturalHeight] = size(source);
      queueMicrotask(() => { const event = new Event(this.naturalWidth ? 'load' : 'error'); this.dispatchEvent(event); this[`on${event.type}`]?.(event); }); }
    get src() { return this._src; }
    async decode() { if (!this.naturalWidth) throw new Error('Missing fixture asset'); }
  };
  let depth = 0;
  const ctx = new Proxy({ save() { depth++; }, restore() { assert.ok(depth > 0); depth--; },
    measureText: text => ({ width: String(text).length * 6 }), createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }), getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })
  }, { get: (target, key) => key in target ? target[key] : () => {} });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  function key(type, code) { const event = new Event(type, { cancelable: true }); Object.assign(event,
    { code, repeat: false, ctrlKey: false, metaKey: false, altKey: false }); events.dispatchEvent(event); }
  return { canvas, key, balanced: () => assert.equal(depth, 0) };
}
async function fixture(connection, hubState = null, action = null) {
  const browser = host(), actions = [], patches = [], save = createDefaultSave(); save.needsPlayerCreationV84 = false;
  const deck = HUB_DECKS.findIndex(entry => entry.id === connection.parentDeck), door = connection.parentDoorBounds;
  const hub = new HubGame(browser.canvas, { onAction: event => { actions.push(clone(event)); return action?.(event); },
    onPersist: patch => patches.push(clone(patch)), onStatus() {} });
  hub.start(hubState || { deck, roomId: connection.parentRoomId, positionX: door.x + door.w / 2 - 22,
    positionY: connection.standingY - 92 }, { routineContextV62: { save } });
  for (let i = 0; i < 8; i++) await Promise.resolve();
  return { ...browser, hub, actions, patches, save };
}
function advance(subject, seconds) { for (let t = 0; t < seconds - 1e-9; t += 1 / 60) subject.hub.update(Math.min(1 / 60, seconds - t)); }
function tap(subject, code) { subject.key('keydown', code); subject.key('keyup', code); }
function walk(subject, x) {
  const direction = subject.hub.player.x < x ? 'KeyD' : 'KeyA'; subject.key('keydown', direction);
  for (let count = 0; count < 3600 && Math.abs(subject.hub.player.x - x) > 7; count++) subject.hub.update(1 / 60);
  subject.key('keyup', direction); advance(subject, .15);
  assert.ok(Math.abs(subject.hub.player.x - x) < 42, `Walk stopped at ${subject.hub.player.x}, target ${x}`);
}
function enter(subject, spaceId) {
  assert.equal(subject.hub.nearestParentAnnexDoorV71()?.annexId, spaceId); tap(subject, 'KeyE'); advance(subject, .5);
  assert.equal(subject.hub.currentAnnexV71()?.id, spaceId);
}

test('the historical thirteen annex objects remain canonical while the connected ship grows to thirty-five places', () => {
  assert.equal(HUB_ANNEXES_V87.length, 13); assert.equal(HUB_ANNEXES_V137.length, 19);
  HUB_ANNEXES_V87.forEach((annex, index) => assert.equal(HUB_ANNEXES_V137[index], annex));
  const graph = buildHubRuntimeGraphV137(); assert.equal(graph.nodes.length, 35); assert.equal(graph.annexRoomCount, 19);
  const reached = new Set(), queue = ['bridge']; while (queue.length) { const id = queue.shift(); if (reached.has(id)) continue;
    reached.add(id); queue.push(...graph.adjacency[id]); }
  assert.equal(reached.size, 35); assert.deepEqual(graph.adjacency['maintenance-spine'], ['sensor-array', 'workshop']);
  assert.equal(graph.edges.filter(edge => edge.endpointId).length, 7);
  for (const edge of graph.edges) { assert.ok(graph.adjacency[edge.from].includes(edge.to)); assert.ok(graph.adjacency[edge.to].includes(edge.from)); }
});

test('compact service rooms retain the requested widths and every doorway has a clear standing spawn and continuous floor route', () => {
  assert.deepEqual(HUB_SHIP_SPACES_V137.map(space => space.world.width), [1280, 1280, 1280, 1920, 1280, 2560]);
  for (const space of HUB_SHIP_SPACES_V137) {
    assert.equal(validateHubAnnexGeometryV137(space).valid, true, space.id);
    const broken = clone(space); broken.platforms[0].w -= 24;
    assert.equal(validateHubAnnexGeometryV137(broken).valid, false);
    const standing = { x: 24, y: 532, w: space.world.width - 48, h: 92 };
    assert.ok(space.platforms.filter(p => p.role !== 'floor').every(p => !overlap(standing, p)));
    assert.ok(space.colliders.every(p => p.collisionMode === 'one-way-top' || !overlap(standing, p)));
  }
});

test('new entry sockets fit real parent rooms and the sanitary entrance stands on the shared authored upper landing', () => {
  for (const connection of HUB_SHIP_CONNECTIONS_V137) {
    const room = HUB_DECKS.find(deck => deck.id === connection.parentDeck).rooms.find(room => room.id === connection.parentRoomId);
    const b = connection.parentDoorBounds; assert.ok(b.x >= room.xStart && b.x + b.w <= room.xEnd);
    assert.equal(b.y + b.h, connection.standingY);
    if (connection.parentRoomId !== 'crew-quarters') continue;
    const landing = HUB_SHIP_PARENT_LANDINGS_V137['sanitary-bay'];
    const traversal = buildHubTraversalGeometryV87(1), platform = traversal.platforms.find(p => p.id === landing.platformId);
    assert.equal(platform.y, landing.bottom); assert.ok(b.x > platform.x && b.x + b.w < platform.x + platform.w);
    assert.ok(traversal.ladders.some(ladder => ladder.roomId === 'crew-quarters' && ladder.top === platform.y));
  }
});

test('hero equipment uses functional native sizes and the compact maintenance panel is visibly wall mounted', () => {
  const ids = ['cockpit-seat', 'galley-unit', 'sanitary-unit', 'engine-pump', 'filtration-skid'];
  HUB_SHIP_SPACES_V137.slice(0, 5).forEach((space, index) => {
    const cell = getHubFurnishingCellV137(ids[index]), b = space.station.bounds, s = space.art.alphaBounds.prop;
    assert.equal(space.art.prop, HUB_FURNISHING_ATLAS_V137.asset); assert.equal(b.w, cell.width);
    assert.ok(Math.abs(b.h - cell.height) < 1e-9); assert.equal(b.y + b.h, 624);
    assert.ok(Math.abs(b.w / b.h - (s[2] - s[0]) / (s[3] - s[1])) < 1e-9);
  });
  const maintenance = HUB_ANNEX_BY_ID_V137['maintenance-spine']; assert.equal(maintenance.station.bounds.w, 80);
  assert.equal(maintenance.station.support, 'rear-wall'); assert.equal(maintenance.station.bounds.y + maintenance.station.bounds.h, 570);
});

test('V87 migration preserves every historical record and unknown future registries remain byte-for-byte opaque', () => {
  let old = createHubCommercialStateV87(); old = clone(applyHubAnnexStationV87(old, 'logistics').state);
  old.annexes['animal-care'].visited = true; old.annexes['animal-care'].visitCount = 7; old.annexes['animal-care'].lastVisitedAt = 12;
  const upgraded = createHubCommercialStateV137(old);
  for (const annex of HUB_ANNEXES_V87) assert.deepEqual(upgraded.annexes[annex.id], old.annexes[annex.id]);
  assert.deepEqual(upgraded.physicalUpgradeIds, old.physicalUpgradeIds); assert.deepEqual(upgraded.physicalUpgradeModuleIds, old.physicalUpgradeModuleIds);
  assert.equal(upgraded.registryVersion, 137); assert.equal(Object.keys(upgraded.annexes).length, 19);
  const future = { schema: 71, registryVersion: 138, activeAnnexId: 'unreleased-room', unknown: { signed: [1, 2, 3] } };
  const before = JSON.stringify(future); assert.deepEqual(createHubCommercialStateV137(future), future);
  assert.equal(applyHubAnnexStationV137(future, 'engine-room').applied, false); assert.equal(JSON.stringify(future), before);
});

test('inspections persist distinct counters without inventing upgrades or overwriting historical service evidence', () => {
  let state = createHubCommercialStateV137(); const baselineUpgrades = clone({ installed: state.physicalUpgradeIds, available: state.physicalUpgradeModuleIds });
  for (const space of HUB_SHIP_SPACES_V137) for (let i = 0; i < 2; i++) {
    const receipt = applyHubAnnexStationV137(state, space.id); assert.equal(receipt.applied, true);
    assert.equal(receipt.effect.kind, 'ship-inspection'); assert.equal(receipt.effect.rewards, false); assert.equal(receipt.effect.resourceDelta, null);
    state = clone(receipt.state);
  }
  for (const space of HUB_SHIP_SPACES_V137) { assert.equal(state.stationUses[space.id], 2); assert.equal(state.annexes[space.id].upgrade.installed, false); }
  assert.deepEqual(state.physicalUpgradeIds, baselineUpgrades.installed); assert.deepEqual(state.physicalUpgradeModuleIds, baselineUpgrades.available);
  const historical = applyHubAnnexStationV137(state, 'logistics'); assert.equal(historical.applied, true);
  for (const space of HUB_SHIP_SPACES_V137) assert.deepEqual(historical.state.annexes[space.id], state.annexes[space.id]);
  assert.equal(historical.state.stationUses.logistics, 1);
});

test('corrupted service records and mismatched endpoints cannot place an actor in another room or create an upgrade', () => {
  const raw = createHubCommercialStateV137();
  Object.assign(raw, { activeAnnexId: 'maintenance-spine', annexPositionX: -9999, annexPositionY: 9999,
    activeConnectionIdV137: 'galley-service:primary', returnContext: { endpointId: 'galley-service:primary', deckId: 'habitat', roomId: 'mess', x: -9999 } });
  raw.annexes['maintenance-spine'] = { id: 'maintenance-spine', visited: true, visitCount: -8,
    station: { id: 'forged-station', activated: true, activationCount: 999999999 }, upgrade: { id: 'fabricated-upgrade', installed: true } };
  const safe = createHubCommercialStateV137(raw), connection = getHubShipConnectionV137(safe.returnContext.endpointId);
  assert.equal(connection.spaceId, 'maintenance-spine'); assert.equal(safe.returnContext.deckId, connection.parentDeck);
  assert.ok(safe.annexPositionX >= 24 && safe.annexPositionX <= 2492); assert.equal(safe.annexPositionY, 532);
  assert.equal(safe.stationUses['maintenance-spine'], 0); assert.equal(safe.annexes['maintenance-spine'].upgrade.installed, false);
});

test('inspection counters saturate without wrapping and malformed authored connections fail validation', () => {
  const raw = createHubCommercialStateV137(), station = raw.annexes['engine-room'].station;
  Object.assign(station, { activated: true, activationCount: 999999, activatedAt: 4, lastActivatedAt: 5 }); raw.revision = 999999;
  const receipt = applyHubAnnexStationV137(raw, 'engine-room'); assert.equal(receipt.state.stationUses['engine-room'], 999999);
  assert.equal(receipt.state.revision, 999999); assert.equal(receipt.state.annexes['engine-room'].station.activatedAt, 4);
  const broken = clone(HUB_ANNEX_BY_ID_V137['sanitary-bay']); broken.parentDoorBounds.y += 14;
  assert.ok(validateHubAnnexGeometryV137(broken).errors.includes('inconsistent-connection-definition'));
});

test('a historical service operation preserves a visit resumed from the workshop end of the new maintenance corridor', () => {
  const raw = createHubCommercialStateV137(), connection = getHubShipConnectionV137('maintenance-spine:workshop');
  raw.annexes['maintenance-spine'].visited = true; raw.annexes['maintenance-spine'].visitCount = 3; raw.annexes['maintenance-spine'].lastVisitedAt = 7;
  Object.assign(raw, { activeAnnexId: 'maintenance-spine', lastAnnexId: 'maintenance-spine', annexPositionX: 1788,
    annexPositionY: 334, annexClimbing: false, activeConnectionIdV137: connection.id,
    returnContext: { endpointId: connection.id, deckId: connection.parentDeck, roomId: connection.parentRoomId,
      x: connection.parentDoorBounds.x + 30, facing: -1 } });
  const before = createHubCommercialStateV137(raw), receipt = applyHubAnnexStationV137(before, 'logistics');
  assert.equal(receipt.applied, true); assert.equal(receipt.state.activeAnnexId, before.activeAnnexId);
  for (const key of ['annexPositionX', 'annexPositionY', 'annexClimbing', 'activeConnectionIdV137', 'returnContext']) assert.deepEqual(receipt.state[key], before[key]);
  assert.deepEqual(receipt.state.annexes['maintenance-spine'], before.annexes['maintenance-spine']);
});

test('the save boundary retains inspection evidence and projects REFUGE at its original parent height under registry 137', () => {
  const save = createDefaultSave(); save.hub.commercialV71 = clone(applyHubAnnexStationV137(save.hub.commercialV71, 'engine-room').state);
  const reloaded = migrateSave(JSON.parse(JSON.stringify(save))); assert.equal(reloaded.hub.commercialV71.stationUses['engine-room'], 1);
  const state = clone(reloaded.hub.commercialV71); Object.assign(state, { activeAnnexId: 'personal-refuge',
    returnContext: { deckId: 'habitat', roomId: 'crew-quarters', x: 410, facing: -1 } });
  const projected = projectRefugeHubSaveV87({ deck: 1, positionY: 532, commercialV71: state });
  assert.equal(projected.commercialV71.activeAnnexId, null); assert.equal(projected.positionY, 532);
  assert.equal(projected.commercialV71.stationUses['engine-room'], 1);
});

test('all six native doors support keyboard entry, walking to the actual station, inspection and exact parent return', async () => {
  for (const space of HUB_SHIP_SPACES_V137) {
    const connection = getHubShipConnectionsForSpaceV137(space.id)[0], subject = await fixture(connection);
    const before = clone({ resources: subject.save.galaxy.resources, crew: subject.save.crew, clock: subject.save.clock });
    enter(subject, space.id); walk(subject, space.station.bounds.x + space.station.bounds.w / 2 - 22);
    assert.equal(subject.hub.nearestAnnexStationV71()?.id, space.station.id); tap(subject, 'KeyE');
    assert.equal(subject.hub.getSnapshot().hubCommercialV71.stationUses[space.id], 1, space.id);
    assert.ok(subject.hub.statusPrompt().includes('CONTRÔLES : 1'));
    walk(subject, connection.entranceLocalX - 22); tap(subject, 'KeyE'); advance(subject, .5);
    assert.equal(subject.hub.isAnnexActiveV71(), false); assert.equal(subject.hub.state.roomId, connection.parentRoomId);
    assert.equal(subject.hub.player.y + subject.hub.player.h, connection.standingY);
    assert.deepEqual({ resources: subject.save.galaxy.resources, crew: subject.save.crew, clock: subject.save.clock }, before);
    subject.balanced(); subject.hub.stop(false);
  }
});

test('the native maintenance corridor connects both decks and rebuilds real geometry in each direction after a persisted mid-route reload', async () => {
  for (const endpointId of ['maintenance-spine:primary', 'maintenance-spine:workshop']) {
    const entry = getHubShipConnectionV137(endpointId), exit = getHubShipConnectionsForSpaceV137('maintenance-spine').find(c => c.id !== entry.id);
    let subject = await fixture(entry); enter(subject, 'maintenance-spine'); walk(subject, 1280);
    subject.hub.persist(); const patch = clone(subject.patches.at(-1));
    assert.equal(patch.hubCommercialV71.returnContext.endpointId, entry.id); assert.equal(patch.hubCommercialV71.activeConnectionIdV137, entry.id);
    const savedX = patch.hubCommercialV71.annexPositionX; subject.hub.stop(false); subject = await fixture(entry, patch);
    assert.equal(subject.hub.currentAnnexV71()?.id, 'maintenance-spine'); assert.equal(Math.round(subject.hub.player.x), savedX);
    assert.equal(subject.hub.hubCommercialStateV71.returnContext.endpointId, entry.id);
    walk(subject, exit.entranceLocalX - 22); assert.equal(subject.hub.nearestAnnexExitV71()?.endpointId, exit.id);
    tap(subject, 'KeyE'); advance(subject, .5);
    const deck = HUB_DECKS.findIndex(d => d.id === exit.parentDeck);
    assert.equal(subject.hub.isAnnexActiveV71(), false); assert.equal(subject.hub.state.deck, deck); assert.equal(subject.hub.currentRoom().id, exit.parentRoomId);
    assert.deepEqual(subject.hub.obstacles, buildHubObstacleGeometryV87(deck));
    assert.deepEqual(subject.hub.doorStates.map(d => d.id), buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck).map(d => d.id));
    assert.ok(subject.hub.v51Platforms.every(p => HUB_DECKS[deck].rooms.some(room => room.id === p.roomId)));
    assert.equal(subject.hub.getSnapshot().hubCommercialV71.activeConnectionIdV137, null);
    // The opposite endpoint remains usable immediately; this is a loop, not an exit-only scripted transfer.
    enter(subject, 'maintenance-spine'); assert.equal(subject.hub.hubCommercialStateV71.returnContext.endpointId, exit.id);
    subject.hub.stop(false); subject.balanced();
  }
});

test('a rejected inspection changes neither counters nor recorded position', async () => {
  const connection = getHubShipConnectionsForSpaceV137('galley-service')[0], subject = await fixture(connection, null,
    event => event.type === 'hub:annex-station' ? false : undefined);
  enter(subject, 'galley-service'); walk(subject, 878); const before = clone(subject.hub.hubCommercialStateV71);
  tap(subject, 'KeyE'); assert.deepEqual(subject.hub.hubCommercialStateV71, before); subject.hub.stop(false);
});

test('an annex on another parent deck cannot be entered by a distant transition request', async () => {
  const subject = await fixture(getHubShipConnectionV137('flight-control-cockpit:primary'));
  const before = clone({ commercial: subject.hub.hubCommercialStateV71, player: subject.hub.player, actions: subject.actions, patches: subject.patches });
  assert.equal(subject.hub.beginAnnexTransitionV71('logistics', 'enter'), null);
  assert.equal(subject.hub.annexTransitionV71, null); assert.equal(subject.hub.isAnnexActiveV71(), false);
  assert.deepEqual({ commercial: subject.hub.hubCommercialStateV71, player: subject.hub.player, actions: subject.actions, patches: subject.patches }, before);
  subject.hub.stop(false);
});
