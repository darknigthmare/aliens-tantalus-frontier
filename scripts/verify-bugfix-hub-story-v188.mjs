// Regression tests, bug hunt "hub story and NPCs" (2026-11-14): Interlude vs ordinary crisis,
// lift "ARRIVÉE OCCUPÉE", quay escort file, range HUD under staging, stale #hub-prompt readout.
// New exports are read through namespaces so each test fails (not the whole file) on the old code.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createDefaultSave, migrateSave } from '../src/save.js';
import * as story from '../src/story-campaign-v188.js';
import { createHubCrisis } from '../src/world-crisis-core.js';
import { resolveHubCrisisEvent } from '../src/world-crisis.js';
import { HUB_DECKS, HUB_WORLD } from '../src/hub-game.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { spreadNpcStationSpawnsV136 } from '../src/npc-life-v136.js';
import * as port from '../src/port-meridien-v90.js';
import { HubGame as RangeHubV81 } from '../src/hub-v81-runtime.js';
import { withHubLiftTransitV163 } from '../src/hub-lift-transit-v163.js';
import * as npcLife from '../src/npc-life-v136.js';
import { HUB_NPC_SERVICE_ROUTES_V161 } from '../src/npc-service-routes-v161.js';
import { HUB_NPC_ANNEX_SERVICE_ROUTES_V163 } from '../src/npc-annex-service-routes-v163.js';
import { HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163, getNpcAnnexLeaseRouteV163 } from '../src/npc-annex-leases-v163.js';
import { createAnnexNpcsV141 } from '../src/hub-annex-npc-life-v141.js';
import { getHubDoorDestinationDescriptorsV138 } from '../src/hub-destination-signage-v138.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const interludeSave = () => {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false;
  save.storyCampaignV188.m577Manifest = { containers: 1, colonists: 4, resolved: true };
  return save;
};
const fire = { id: 'crisis-0042-fire-abc', kind: 'fire', count: 3, deck: 3, roomId: 'reactor', resolved: false };

// —— 1. The Interlude replaces an ordinary crisis ——
test('interlude: an active ordinary crisis is replaced by the deck-2 quarantine crisis, without penalty', () => {
  const save = interludeSave(); save.hub.activeCrisis = { ...fire };
  const before = JSON.stringify({ systems: save.hub.systems, resources: save.galaxy.resources, crew: save.crew, player: save.player, modules: save.hub.moduleIntegrity });
  const crisis = story.startInterludeV188(save, createHubCrisis);
  assert.ok(crisis, 'the interlude starts');
  assert.notEqual(crisis.id, fire.id, 'the fire crisis is not adopted');
  assert.deepEqual([save.hub.activeCrisis.kind, save.hub.activeCrisis.deck, save.hub.activeCrisis.roomId], ['xenomorph', 2, 'quarantine']);
  assert.equal(save.hub.activeCrisis.resolved, false);
  assert.equal(save.storyCampaignV188.interlude.crisisId, save.hub.activeCrisis.id);
  assert.equal(crisis.replacedCrisisIdV188, fire.id, 'the app can log the replacement');
  assert.equal(JSON.stringify({ systems: save.hub.systems, resources: save.galaxy.resources, crew: save.crew, player: save.player, modules: save.hub.moduleIntegrity }), before, 'no penalty');
  // Reload mid-alert: same interlude, same crisis; the real resolver then clears it.
  const reloaded = migrateSave(JSON.parse(JSON.stringify(save)));
  assert.equal(reloaded.hub.activeCrisis.id, reloaded.storyCampaignV188.interlude.crisisId);
  assert.equal(story.reconcileInterludeCrisisV188(reloaded, createHubCrisis), null, 'a coherent save is left alone');
  assert.equal(resolveHubCrisisEvent(reloaded, { action: 'crisis:resolved', crisisId: crisis.id, kind: crisis.kind }).handled, true);
  assert.equal(story.interludeCrisisClearedV188(reloaded, crisis.id), true);
  const app = read('src/app.js');
  assert.match(app, /reconcileInterludeCrisisV188\(candidate, createForcedHubCrisisV188\)/, 'reconciled before the hub spawns the crisis');
  assert.match(app, /crisis\.replacedCrisisIdV188/);
});

test('interlude: saves already contradicting the objective, or a downed marine, are repaired so the player is never blocked', () => {
  assert.equal(typeof story.reconcileInterludeCrisisV188, 'function');
  // Old bug save: the interlude adopted the fire crisis.
  const adopted = interludeSave(); adopted.hub.activeCrisis = { ...fire };
  adopted.storyCampaignV188.interlude = { phase: 'alert', crisisId: fire.id, outcome: null, crisisCleared: false, junRescued: true };
  assert.equal(story.reconcileInterludeCrisisV188(adopted, createHubCrisis), 'rearmed');
  assert.deepEqual([adopted.hub.activeCrisis.kind, adopted.hub.activeCrisis.deck, adopted.hub.activeCrisis.roomId], ['xenomorph', 2, 'quarantine']);
  assert.equal(adopted.storyCampaignV188.interlude.crisisId, adopted.hub.activeCrisis.id);
  assert.equal(adopted.storyCampaignV188.interlude.junRescued, true, 'progress kept');
  // Marine down during the alert: the crisis closes, the creature is still loose -> armed again.
  const down = interludeSave(); const first = story.startInterludeV188(down, createHubCrisis);
  resolveHubCrisisEvent(down, { action: 'crisis:player-down', crisisId: first.id, kind: first.kind });
  assert.equal(down.hub.activeCrisis.resolved, true);
  assert.equal(story.reconcileInterludeCrisisV188(down, createHubCrisis), 'rearmed');
  assert.equal(down.hub.activeCrisis.resolved, false); assert.notEqual(down.hub.activeCrisis.id, first.id);
  // Resolved, but the tab closed before the interlude flag was saved -> cleared, not replayed.
  const crash = interludeSave(); const own = story.startInterludeV188(crash, createHubCrisis);
  resolveHubCrisisEvent(crash, { action: 'crisis:resolved', crisisId: own.id, kind: own.kind });
  assert.equal(story.reconcileInterludeCrisisV188(crash, createHubCrisis), 'cleared');
  assert.equal(crash.storyCampaignV188.interlude.crisisCleared, true);
  assert.deepEqual(Object.keys(migrateSave(JSON.parse(JSON.stringify(crash))).storyCampaignV188.interlude).sort(),
    ['crisisCleared', 'crisisId', 'junRescued', 'outcome', 'phase'], 'save format unchanged');
});

// —— 2. Lift arrival never held by an idle crew member ——
test('lift: idle crew spread in a crowded room never stand on a lift landing', () => {
  const cabinOf = (deck, roomId) => buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck).filter(door => door.lift && door.roomId === roomId)
    .map(door => ({ x: door.x - 22, w: 44 }));
  let checked = 0;
  HUB_DECKS.forEach((deck, index) => deck.rooms.forEach(room => {
    const cabins = cabinOf(index, room.id); if (!cabins.length) return;
    for (const start of [room.xStart + 400, room.xStart + 800, room.xEnd - 200]) {
      const crowd = Array.from({ length: 10 }, (_, i) => ({ crewId: `c${i}`, roomId: room.id, x: start, y: HUB_WORLD.floorY - 92, w: 44, h: 92, mobile: false }));
      for (const npc of spreadNpcStationSpawnsV136(crowd, [room])) for (const cabin of cabins) {
        checked += 1;
        assert.ok(npc.x + npc.w <= cabin.x || npc.x >= cabin.x + cabin.w, `${room.id}: idle ${npc.crewId} at ${npc.x} on the ${cabin.x} landing`);
      }
    }
  }));
  assert.ok(checked > 100);
});

test('lift: a refused arrival is forgotten once the marine leaves that lift', () => {
  class Base { statusPrompt() { return 'BASE'; } }
  const Lift = withHubLiftTransitV163(Base), hub = Object.create(Lift.prototype);
  hub.hubLiftTransitV163 = null; hub.liftDepartureBlockedV163 = { shaftId: 'hub-aft-lift', toDeck: 2 };
  hub.nearestLift = () => ({ shaftId: 'hub-aft-lift' });
  assert.match(hub.statusPrompt(), /ARRIVÉE OCCUPÉE/);
  hub.nearestLift = () => undefined;
  assert.equal(hub.statusPrompt(), 'BASE');
  hub.nearestLift = () => ({ shaftId: 'hub-aft-lift' });
  assert.equal(hub.statusPrompt(), 'BASE', 'no stale refusal when coming back');
});

// —— 3. Quay civilians walk in file ——
test('quay: escorted civilians keep distinct places in file; one more than 390 px behind still waits', () => {
  assert.equal(typeof port.stepPortCivilianV188, 'function');
  let xs = [...port.PORT_CIVILIANS_WAIT_V188]; const playerX = 1500;
  for (let frame = 0; frame < 600; frame += 1) xs = xs.map((x, i) => port.stepPortCivilianV188(x, i, playerX, true, 1 / 60));
  const sorted = [...xs].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i += 1) assert.ok(sorted[i] - sorted[i - 1] >= 50, `file spacing ${xs}`);
  assert.ok(xs.every(x => playerX - x >= 40), 'all behind the marine');
  assert.equal(port.stepPortCivilianV188(1000, 0, 1400, true, .1), 1000, '400 px behind: waits (design rule)');
  assert.equal(port.stepPortCivilianV188(1200, 2, 1400, false, .1), 1200, 'marine airborne: waits');
  // The escort can still complete: one marine position puts every resident at its safe spot.
  let safe = [1900, 1950, 2000];
  for (let frame = 0; frame < 600; frame += 1) safe = safe.map((x, i) => port.stepPortCivilianV188(x, i, 2260, true, 1 / 60));
  assert.deepEqual(safe, [...port.PORT_CIVILIANS_SAFE_V188]);
  const runtime = read('src/hub-port-meridien-v90.js');
  assert.match(runtime, /stepPortCivilianV188\(x, i, this\.player\.x, this\.player\.grounded, elapsed\)/);
  assert.match(runtime, /portCivilianWalkingV188\(x, row, this\.player\.x, this\.player\.grounded\)/);
});

// —— 4. Range HUD under the staging bars ——
test('staging: the proving-ground range HUD box is not drawn while an in-game beat plays', () => {
  const calls = [];
  const ctx = new Proxy({}, { get: (_, key) => typeof key === 'string' && /^(fill|stroke|draw|save|restore|set)/.test(key) ? (...args) => calls.push([key, ...args]) : undefined, set: () => true });
  const dataset = { ingameStageV188: 'beat-exercise-interrupt' };
  const hub = Object.create(RangeHubV81.prototype);
  Object.assign(hub, { canvas: { ownerDocument: { documentElement: { dataset } } }, isProvingGroundActiveV81: () => true,
    provingGroundStateV81: { phase: 'running', hits: 1, score: 10, ammo: { magazine: 9, reserve: 20 }, remainingSeconds: 12, reload: { active: false } },
    currentProvingAimV81: () => 'level', statusPrompt: () => '', drawSinglePromptV71: () => {} });
  hub.drawAnnexHudV71(ctx);
  assert.deepEqual(calls.filter(call => call[0] === 'fillRect'), [], 'no range box under the bars');
  delete dataset.ingameStageV188;
  hub.drawAnnexHudV71(ctx);
  assert.ok(calls.some(call => call[0] === 'fillRect' && call[1] === 18 && call[2] === 18), 'drawn again after the beat');
});

// —— 5. Hidden aria-live #hub-prompt ——
test('readout: #hub-prompt follows the visible lift panel during a trip and is cleared when the hub closes', () => {
  class Base { statusPrompt() { return 'W / S — choisir un pont · E — pont suivant'; } }
  const Lift = withHubLiftTransitV163(Base), hub = Object.create(Lift.prototype);
  const trip = { id: 1, shaftId: 'hub-aft-lift', fromDeck: 0, toDeck: 2, originX: 4914, cabinX: 4914, phase: 'travel', elapsed: 0, facing: 1, reducedMotion: false };
  hub.liftStateV163 = () => ({ schema: 163, serial: 1, trip }); hub.liftBlockedV163 = false;
  assert.equal(hub.statusPrompt(), 'TRAJET · E POUR REVENIR');
  hub.liftBlockedV163 = true;
  assert.equal(hub.statusPrompt(), 'PASSAGE OCCUPÉ · CABINE EN ATTENTE · E POUR REVENIR');
  hub.liftStateV163 = () => ({ schema: 163, serial: 1, trip: null });
  assert.equal(hub.statusPrompt(), 'W / S — choisir un pont · E — pont suivant', 'back to the native prompt after the trip');
  assert.match(read('src/app.js'), /if \(name !== 'hub' && byId\('hub-prompt'\)\) \{ byId\('hub-prompt'\)\.textContent = '';/);
});

// —— 6. No crew post inside any annex doorway (generalises clearParentDoorwayV188) ——
const bayHit = (room, x) => getHubDoorDestinationDescriptorsV138(room).filter(door => door.face === 'parent')
  .map(door => door.socket).find(box => x < box.x + box.w + 12 && x + 44 > box.x - 12);

test('doorways: a route owner whose native body stands in any doorway of its home room gets a post beside it', () => {
  assert.equal(typeof npcLife.clearRoomDoorwayPostV188, 'function');
  const routes = [...HUB_NPC_SERVICE_ROUTES_V161, ...HUB_NPC_ANNEX_SERVICE_ROUTES_V163,
    ...HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163.flatMap(d => d.originRoomIds.map(origin => getNpcAnnexLeaseRouteV163(d.id, origin)))];
  let checked = 0;
  for (const route of routes) {
    const d = route.definition, homeId = d.homeRoomId || d.parentRoomId;
    const home = HUB_DECKS[d.deck].rooms.find(room => room.id === homeId);
    const duty = createAnnexNpcsV141([{ ...d, roomId: d.annexRoomId }], new Map())[0];
    if (!home || !duty) continue;
    for (const door of getHubDoorDestinationDescriptorsV138(home).filter(entry => entry.face === 'parent')) {
      const x = Math.max(home.xStart + 96, Math.min(home.xEnd - 140, door.socket.x + door.socket.w / 2 - 22));
      const state = route.create({ crewId: d.crewId, roomId: homeId, x, y: 532, facing: 1 }, duty);
      if (!state) continue;
      checked += 1;
      assert.equal(bayHit(home, state.homeX), undefined, `${d.id}: home post ${state.homeX} inside the ${door.destinationId} doorway`);
      assert.equal(state.x, state.homeX, `${d.id}: the idle body stands at its post`);
    }
  }
  assert.ok(checked >= 4, `checked ${checked} posts`);
  // Older saves whose home post already sits in another doorway of the room still load, with the post moved aside.
  let repaired = 0;
  for (const route of routes) {
    const d = route.definition, homeId = d.homeRoomId || d.parentRoomId;
    const home = HUB_DECKS[d.deck].rooms.find(room => room.id === homeId);
    const duty = createAnnexNpcsV141([{ ...d, roomId: d.annexRoomId }], new Map())[0];
    const base = home && duty && route.create({ crewId: d.crewId, roomId: homeId, x: home.xStart + 300, y: 532, facing: 1 }, duty);
    if (!base) continue;
    for (const door of getHubDoorDestinationDescriptorsV138(home).filter(entry => entry.face === 'parent' && entry.destinationId !== d.annexRoomId)) {
      const x = door.socket.x + 10;
      if (x < home.xStart + 96 || x > home.xEnd - 140) continue;
      const legacy = route.normalize({ schema: route.definition.schema, actor: { ...base, x, homeX: x }, nativeHandoff: null }).actor;
      if (!legacy) continue;
      repaired += 1;
      assert.equal(bayHit(home, legacy.homeX), undefined, `${d.id}: saved post left in the ${door.destinationId} doorway`);
    }
  }
  assert.ok(repaired >= 1, `repaired ${repaired} legacy posts`);
});

test('doorways: the shared rule never leaves an idle post in a parent doorway or on a lift landing, in any room', () => {
  assert.equal(typeof npcLife.clearRoomDoorwayPostV188, 'function');
  for (const deck of HUB_DECKS) for (const room of deck.rooms) {
    const bays = npcLife.hubRoomIdleBaysV188(room);
    for (let x = room.xStart + 96; x <= room.xEnd - 140; x += 7) {
      const post = npcLife.clearRoomDoorwayPostV188(room, x);
      assert.ok(post >= room.xStart + 96 && post <= room.xEnd - 140);
      assert.ok(bays.every(box => post + 44 + 12 <= box.x || post >= box.x + box.w + 12), `${room.id}: ${x} -> ${post}`);
    }
  }
});
