import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  HUB_DECKS,
  HUB_VENT_INTERIOR_ASSET_V62,
  HUB_VENT_NETWORK_V62,
  HubGame,
  chooseHubVentBranchV62,
  normalizeHubVentStateV62
} from '../src/hub-v62-runtime.js';
import {
  advanceVentTransitionV62,
  enterVentNetworkV62,
  moveVentTransitV62,
  selectVentBranchV62
} from '../src/vent-network-v62.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1672;
    this.naturalHeight = 941;
  }

  set src(value) { this.currentSrc = value; }
}

function mockContext() {
  const gradient = { addColorStop() {} };
  const base = {
    measureText: (text) => ({ width: String(text).length * 8 }),
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient
  };
  return new Proxy(base, {
    get: (target, key) => key in target ? target[key] : () => {},
    set: (target, key, value) => { target[key] = value; return true; }
  });
}

function withRuntime(run) {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame,
    performance: globalThis.performance
  };
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  globalThis.performance = { now: () => 1000 };
  try { return run(); }
  finally {
    globalThis.Image = previous.Image;
    globalThis.addEventListener = previous.addEventListener;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
    globalThis.performance = previous.performance;
  }
}

function createHub(options = {}) {
  const canvas = { width: 1280, height: 720, getContext: mockContext, addEventListener() {} };
  return new HubGame(canvas, options);
}

function placeAtRoomHatch(hub, roomId) {
  const hatch = hub.v51Vents.find((entry) => entry.roomId === roomId);
  assert.ok(hatch, `trappe physique absente : ${roomId}`);
  Object.assign(hub.player, { x: hatch.x + 12, y: hatch.y + 8, vx: 0, vy: 0, grounded: false });
  return hatch;
}

function finishEntry(hub) {
  hub.update(0.24);
  hub.update(0.24);
  assert.equal(hub.ventActorV62.ventTransit.phase, 'at-node');
}

function crawlToNode(hub, controlCode, nodeId) {
  hub.keys.add(controlCode);
  let guard = 0;
  while (hub.ventActorV62?.ventTransit?.currentNodeId !== nodeId && guard < 32) {
    hub.update(0.25);
    guard += 1;
  }
  hub.keys.delete(controlCode);
  assert.equal(hub.ventActorV62.ventTransit.currentNodeId, nodeId, `nœud non atteint après ${guard} ticks`);
}

test('le décor de conduit V62 est un vrai bitmap OpenAI 16:9, pas un placeholder dessiné par le runtime', () => {
  const asset = resolve(repoRoot, HUB_VENT_INTERIOR_ASSET_V62.replace(/^\//, ''));
  assert.equal(existsSync(asset), true);
  assert.ok(statSync(asset).size > 1_000_000);
  const png = readFileSync(asset);
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1672, 941]);
  assert.ok(Math.abs(png.readUInt32BE(16) / png.readUInt32BE(20) - 16 / 9) < 0.01);
});

test('la trappe existante ouvre un parcours physique bridge → briefing → mess puis ressort dans la bonne salle', () => withRuntime(() => {
  const actions = [];
  const persisted = [];
  const hub = createHub({ onAction: (event) => actions.push(event), onPersist: (patch) => persisted.push(patch) });
  hub.start({ deck: 0, roomId: 'bridge', positionX: 180 }, { routineContextV62: { clock: { day: 2, hour: 8 } } });
  placeAtRoomHatch(hub, 'bridge');

  hub.interact();
  assert.equal(hub.getSnapshot().ventActiveV62, true);
  assert.equal(hub.ventActorV62.ventTransit.phase, 'entering');
  assert.equal(hub.useLift(1), false, 'un changement de pont extérieur est impossible pendant le transit');
  finishEntry(hub);
  assert.equal(hub.ventActorV62.ventTransit.currentNodeId, 'hub-bridge');
  assert.equal(chooseHubVentBranchV62(hub.ventActorV62, 'right').toNodeId, 'hub-briefing');

  crawlToNode(hub, 'KeyD', 'hub-briefing');
  crawlToNode(hub, 'KeyS', 'hub-mess');
  assert.deepEqual(hub.ventActorV62.ventTransit.routeNodeIds, ['hub-bridge', 'hub-briefing', 'hub-mess']);
  hub.interact();
  assert.equal(hub.ventActorV62.ventTransit.phase, 'exiting');
  hub.update(0.24);
  hub.update(0.24);

  const snapshot = hub.getSnapshot();
  assert.equal(snapshot.ventActiveV62, false);
  assert.equal(snapshot.deck, 1);
  assert.equal(snapshot.roomId, 'mess');
  assert.equal(hub.currentRoom().id, 'mess');
  assert.ok(hub.v51Vents.some((entry) => entry.roomId === 'mess'));
  assert.equal(persisted.at(-1).ventTransitV62, null);
  assert.ok(actions.some((event) => event.action === 'hub:vent-enter'));
  assert.ok(actions.some((event) => event.action === 'hub:vent-exit-complete' && event.roomId === 'mess'));
}));

test('un segment partiellement parcouru survit à la sérialisation et reprend la même entité sans téléportation', () => withRuntime(() => {
  const persisted = [];
  const hub = createHub({ onPersist: (patch) => persisted.push(patch) });
  hub.start({ deck: 0, roomId: 'bridge', positionX: 180 });
  placeAtRoomHatch(hub, 'bridge');
  hub.interact();
  finishEntry(hub);
  hub.keys.add('KeyD');
  hub.update(0.25);
  hub.keys.delete('KeyD');
  assert.equal(hub.ventActorV62.ventTransit.phase, 'moving');
  assert.ok(hub.ventActorV62.ventTransit.progress > 0);
  hub.persist();

  const patch = structuredClone(persisted.at(-1));
  const normalized = normalizeHubVentStateV62(patch.ventTransitV62);
  assert.equal(normalized.actor.id, 'hub-player-v62');
  assert.equal(normalized.actor.ventTransit.phase, 'moving');
  const resumed = createHub();
  resumed.start(patch);
  assert.deepEqual(resumed.getSnapshot().ventTransitV62, patch.ventTransitV62);
  assert.equal(resumed.getSnapshot().ventInteriorArtReadyV62, true);
  assert.equal(resumed.createVentContactOutputV62(), null, 'le joueur ne devient jamais son propre contact tracker/audio');
}));

test('tracker, audio et plans IA sont exposés depuis le runtime avec les routes déterministes auteur', () => withRuntime(() => {
  const ventAudio = [];
  const hub = createHub({ audio: { ui() {}, vent: (payload) => ventAudio.push(payload) } });
  hub.start({ deck: 0, roomId: 'bridge', positionX: 180 });
  placeAtRoomHatch(hub, 'bridge');
  hub.interact();
  finishEntry(hub);
  hub.keys.add('KeyD');
  hub.update(0.25);
  hub.keys.delete('KeyD');
  assert.equal(hub.createVentContactOutputV62({ observerPosition: { x: 0, y: 0, depth: 0 } }), null);
  const hostileEntrance = HUB_VENT_NETWORK_V62.entrances.find((entry) => entry.id === 'hub-bridge-entrance');
  let hostile = enterVentNetworkV62(HUB_VENT_NETWORK_V62, {
    id: 'crisis-xeno-vent',
    isEnemy: true,
    position: { ...hostileEntrance.worldPosition }
  }, hostileEntrance.id, { actorKind: 'enemy', maximumDistance: 1 });
  hostile = advanceVentTransitionV62(HUB_VENT_NETWORK_V62, hostile, hostile.ventTransit.transitionMs);
  hostile = selectVentBranchV62(HUB_VENT_NETWORK_V62, hostile, 'hub-bridge-briefing', 'hub-briefing');
  hostile = moveVentTransitV62(HUB_VENT_NETWORK_V62, hostile, 320);
  const contact = hub.createVentContactOutputV62({ actor: hostile, observerActor: hub.ventActorV62, observerPosition: { x: 0, y: 0, depth: 0 } });
  assert.equal(contact.tracker.source, 'vent-motion');
  assert.equal(contact.tracker.actorId, 'crisis-xeno-vent');
  assert.equal(contact.audio.occluded, true);
  assert.equal(contact.audio.cue, 'vent-claw-scrape');
  assert.equal(ventAudio.length, 0, 'aucun faux son n’est émis pour le crawl du joueur');

  const ally = hub.planAllyVentTraversalV62({
    actor: { id: 'ally', isAlly: true },
    entranceId: 'hub-bridge-entrance',
    exitId: 'hub-mess-exit'
  });
  const enemy = hub.planEnemyVentTraversalV62({
    actor: { id: 'enemy', isEnemy: true },
    entranceId: 'hub-bridge-entrance',
    candidateExitIds: ['hub-mess-exit', 'hub-sensor-array-exit'],
    targetPosition: HUB_VENT_NETWORK_V62.exits.find((entry) => entry.id === 'hub-mess-exit').worldPosition
  });
  assert.deepEqual(ally.nodeIds, ['hub-bridge', 'hub-briefing', 'hub-mess']);
  assert.equal(enemy.exitId, 'hub-mess-exit');
}));

test('le transit joueur ne gèle ni la crise ni les ennemis hérités du hub', () => withRuntime(() => {
  const hub = createHub();
  hub.start({ deck: 0, roomId: 'bridge', positionX: 180 });
  placeAtRoomHatch(hub, 'bridge');
  hub.crisis = { id: 'crisis-live-v62', active: true, kind: 'xenomorph' };
  hub.state.activeCrisis = { ...hub.crisis };
  hub.enemies = [{
    id: 'crisis-live-enemy', source: 'crisis', kind: 'xenomorph', x: 720, y: 548,
    w: 50, h: 76, health: 80, maxHealth: 80, damage: 8, speed: 92,
    facing: -1, attackClock: 3, alive: true, attacking: false
  }];
  hub.interact();
  const elapsedBefore = hub.animationTime;
  const attackBefore = hub.enemies[0].attackClock;
  hub.update(0.2);
  assert.ok(hub.animationTime > elapsedBefore);
  assert.ok(hub.enemies[0].attackClock < attackBefore);
  assert.equal(hub.crisis.active, true);
  assert.equal(hub.player.health, 100, 'le marine dissimulé ne prend pas un coup fantôme');
}));

test('les seize routines résolvent une position physique et persistent sans muter l’état source', () => withRuntime(() => {
  const source = { deck: 0, roomId: 'bridge', positionX: 180, npcRoutineState: { schema: 62, sequence: 0, entries: {} } };
  const sourceBefore = structuredClone(source);
  const persisted = [];
  const hub = createHub({ onPersist: (patch) => persisted.push(patch) });
  hub.start(source, { routineContextV62: { clock: { day: 4, hour: 12.25 } } });
  assert.deepEqual(source, sourceBefore, 'le runtime travaille sur une copie et ne mute pas la campagne');

  const resolutions = hub.getNpcRoutineResolutionsV62();
  assert.equal(resolutions.length, 16);
  assert.ok(resolutions.every((entry) => entry.phase === 'route'));
  assert.equal(Object.keys(hub.npcRoutineStateV62.entries).length, 16);
  assert.equal(hub.npcRoutineStateV62.sequence, 16);
  for (const npc of hub.npcs) {
    const resolution = resolutions.find((entry) => entry.crewId === npc.crewId);
    assert.equal(resolution.deck, hub.state.deck);
    assert.equal(npc.roomId, resolution.roomId);
    assert.equal(npc.routineDeterministicKeyV62, resolution.deterministicKey);
    const room = HUB_DECKS[hub.state.deck].rooms.find((entry) => entry.id === npc.roomId);
    assert.ok(npc.x >= room.xStart && npc.x < room.xEnd);
  }
  assert.equal(Object.keys(persisted.at(-1).npcRoutineState.entries).length, 16);

  hub.setNpcRoutineContextV62({ clock: { day: 4, hour: 13.25 } });
  assert.ok(hub.getNpcRoutineResolutionsV62().every((entry) => entry.phase === 'break'));
  const breakSequence = hub.npcRoutineStateV62.sequence;
  hub.setNpcRoutineContextV62({ clock: { day: 4, hour: 13.25 } });
  assert.equal(hub.npcRoutineStateV62.sequence, breakSequence, 'la même résolution déterministe ne double pas le journal');

  hub.setNpcRoutineContextV62({
    clock: { day: 4, hour: 13.25 },
    crisis: { id: 'breach-62', active: true, roomId: 'bridge' }
  });
  assert.ok(hub.getNpcRoutineResolutionsV62().every((entry) => entry.phase === 'alert'));
  assert.ok(hub.npcs.every((npc) => npc.alerted));
  const snapshot = hub.getSnapshot();
  assert.equal(snapshot.npcRoutineResolutionsV62.length, 16);
  assert.ok(snapshot.npcRoutineVisibleV62.every((entry) => entry.deck === snapshot.deck));
}));

test('le hub consomme les waypoints de sas et d ascenseur au lieu de téléporter les PNJ entre salles', () => withRuntime(() => {
  const hub = createHub();
  hub.start({ deck: 0, roomId: 'bridge', positionX: 180 }, { routineContextV62: { clock: { day: 5, hour: 6.5 } } });

  const vega = hub.npcs.find((entry) => entry.crewId === 'crew-01-mara-vega');
  const westBulkhead = hub.doorStates.find((entry) => entry.id.endsWith(':hub-west-bulkhead'));
  assert.ok(vega && westBulkhead);
  assert.equal(vega.routineWaypointV62.kind, 'door');
  assert.ok(Math.abs((vega.x + vega.w / 2) - westBulkhead.x) < 96, 'Vega franchit le sas physique bridge/briefing');

  const velez = hub.npcs.find((entry) => entry.crewId === 'crew-02-tamsin-velez');
  const midshipLift = hub.doorStates.find((entry) => entry.shaftId === 'hub-midship-lift');
  assert.ok(velez && midshipLift);
  assert.equal(velez.routineWaypointV62.kind, 'lift-transit');
  assert.ok(Math.abs((velez.x + velez.w / 2) - midshipLift.x) < 8, 'Velez est dans la cabine réelle avant le changement de pont');

  hub.setNpcRoutineContextV62({ clock: { day: 5, hour: 6.75 } }, { persist: false, rebuild: true });
  const velezAfterLift = hub.getNpcRoutineResolutionsV62().find((entry) => entry.crewId === 'crew-02-tamsin-velez');
  assert.equal(velezAfterLift.deck, 2);
  assert.equal(velezAfterLift.routeSample.kind, 'lift-exit');
  assert.equal(hub.npcs.some((entry) => entry.crewId === 'crew-02-tamsin-velez'), false, 'le PNJ quitte le pont source seulement après la sortie d ascenseur');
}));
