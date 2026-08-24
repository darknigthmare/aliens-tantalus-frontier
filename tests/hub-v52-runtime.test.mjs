import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  HUB_DECKS,
  HUB_NPC_INTERACTION_KINDS,
  HUB_NPC_ROSTER,
  HUB_NPC_SPRITE_FILES,
  HubGame,
  buildHubNpcInteractionEvent
} from '../src/hub-v52-runtime.js';
import { CREW_MISSION_SPRITE_IDS, CREW_SPRITE_IDS, resolveSpriteSheet } from '../src/sprite-animation-runtime.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1024;
    this.naturalHeight = 1024;
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

test('the v52 hub assigns all sixteen unique crew sheets to one physical room each', () => {
  const rooms = HUB_DECKS.flatMap((deck) => deck.rooms);
  assert.equal(HUB_NPC_ROSTER.length, 16);
  assert.equal(HUB_NPC_SPRITE_FILES.length, 16);
  assert.equal(new Set(HUB_NPC_ROSTER.map((entry) => entry.crewId)).size, 16);
  assert.equal(new Set(HUB_NPC_ROSTER.map((entry) => entry.roomId)).size, 16);
  assert.equal(new Set(HUB_NPC_SPRITE_FILES).size, 16);
  assert.deepEqual(new Set(HUB_NPC_ROSTER.map((entry) => entry.roomId)), new Set(rooms.map((room) => room.id)));
  assert.deepEqual(new Set(HUB_NPC_ROSTER.map((entry) => entry.interaction.kind)), new Set(HUB_NPC_INTERACTION_KINDS));

  for (const member of HUB_NPC_ROSTER) {
    const spriteId = CREW_SPRITE_IDS[member.crewId];
    const sheet = resolveSpriteSheet(spriteId);
    assert.ok(sheet, `missing sprite contract for ${member.crewId}`);
    assert.equal(member.spriteId, spriteId);
    assert.equal(member.spritePath, sheet.path);
    assert.match(member.spritePath, /^\/assets\/openai\/sprites\/normalized\/npcs\/[a-z0-9-]+-locomotion-sheet\.png$/);
    const file = resolve(repoRoot, member.spritePath.replace(/^\//, ''));
    assert.ok(existsSync(file), `missing NPC sheet ${member.spritePath}`);
    assert.ok(statSync(file).size > 1000, `empty NPC sheet ${member.spritePath}`);
    const header = readFileSync(file).subarray(0, 24);
    assert.equal(header.toString('hex', 1, 4), '504e47', `${member.spritePath} is not PNG`);
    assert.deepEqual([header.readUInt32BE(16), header.readUInt32BE(20)], [1024, 1024], `${member.spritePath} is not a normalized 4x4 sheet`);
  }

  const expectedBySpecialty = {
    medical: 'care', engineering: 'repair', pilot: 'piloting', vehicle: 'piloting',
    assault: 'loadout', heavy: 'loadout', demolition: 'loadout'
  };
  for (const member of HUB_NPC_ROSTER) {
    assert.equal(member.interaction.kind, expectedBySpecialty[member.specialty] || 'intel', `${member.name}: contextual specialty`);
    assert.ok(member.interaction.action.includes(':'));
    assert.ok(member.interaction.consequence?.target);
  }
});

test('walking to each NPC emits a serializable strategic action and a persistable consequence', () => withRuntime(() => {
  const seenCrew = new Set();
  for (let deck = 0; deck < HUB_DECKS.length; deck += 1) {
    const actions = [];
    const persisted = [];
    const hub = createHub({ onAction: (event) => actions.push(event), onPersist: (patch) => persisted.push(patch) });
    hub.start({ deck, roomId: HUB_DECKS[deck].rooms[0].id, positionX: deck * 40 + 180 });
    assert.equal(hub.npcs.length, 4);
    for (const npc of hub.npcs) {
      Object.assign(hub.player, { x: npc.x, y: npc.y, vx: 0, vy: 0, grounded: true });
      const before = actions.length;
      hub.interact();
      assert.equal(actions.length, before + 1, `${npc.name} must be physically interactive`);
      const event = actions.at(-1);
      seenCrew.add(event.crewId);
      assert.equal(event.type, 'hub:npc-interaction');
      assert.equal(event.crewId, npc.crewId);
      assert.equal(event.roomId, npc.roomId);
      assert.equal(event.interactionKind, npc.interaction.kind);
      assert.equal(event.action, npc.interaction.action);
      assert.equal(event.persistence.target, 'hub.npcInteractions');
      assert.equal(event.persistence.operation, 'upsert');
      assert.equal(event.persistence.key, npc.crewId);
      assert.equal(event.persistence.value.count, 1, 'a first conversation is count one even after another crew member');
      assert.doesNotThrow(() => JSON.stringify(event));
      assert.ok(npc.workClock > 0, 'the interaction drives the role-work animation state');
      assert.equal(persisted.at(-1).npcInteractions[npc.crewId].count, 1);
    }
    const snapshot = hub.getSnapshot();
    assert.equal(snapshot.npcRosterCount, 16);
    assert.equal(snapshot.npcUniqueSpriteCount, 16);
    assert.equal(snapshot.npcInteractionCount, 4);
  }
  assert.equal(seenCrew.size, 16);
}));

test('NPC animation sampling keeps idle/walk locomotion then uses role and alert mission cells', () => withRuntime(() => {
  const hub = createHub();
  hub.start({ deck: 0, roomId: 'bridge', positionX: 180 });
  const npc = hub.npcs[0];
  const samples = [];

  Object.assign(npc, { vx: 0, workClock: 0, alertClock: 0, alerted: false });
  hub.animationTime = 0;
  hub.hubNpcAnimation.reset(npc.crewId);
  samples.push(hub.sampleNpcAnimation(npc));

  Object.assign(npc, { vx: 22, workClock: 0, alertClock: 0, alerted: false });
  hub.animationTime = 1;
  hub.hubNpcAnimation.reset(npc.crewId);
  samples.push(hub.sampleNpcAnimation(npc));

  Object.assign(npc, { vx: 0, workClock: 1, alertClock: 0, alerted: false });
  hub.animationTime = 2;
  hub.hubNpcAnimation.reset(npc.crewId);
  samples.push(hub.sampleNpcAnimation(npc));

  Object.assign(npc, { vx: 0, workClock: 0, alertClock: 1, alerted: false });
  hub.animationTime = 3;
  hub.hubNpcAnimation.reset(npc.crewId);
  samples.push(hub.sampleNpcAnimation(npc));

  assert.deepEqual(samples.map((sample) => sample.clip.id), ['idle', 'walk', 'role-support', 'ready']);
  assert.deepEqual(samples.map((sample) => sample.row), [0, 1, 3, 0]);
  assert.deepEqual(samples.map((sample) => sample.sheet.id), [
    CREW_SPRITE_IDS[npc.crewId], CREW_SPRITE_IDS[npc.crewId],
    CREW_MISSION_SPRITE_IDS[npc.crewId], CREW_MISSION_SPRITE_IDS[npc.crewId]
  ]);

  hub.draw();
  const snapshot = hub.getSnapshot();
  const animated = snapshot.npcAnimations.find((entry) => entry.crewId === npc.crewId);
  assert.equal(animated.clipId, 'ready');
  assert.equal(animated.row, 0);
}));

test('active crises keep priority, alert the crew and still resolve through the v51 combat contract', () => withRuntime(() => {
  const actions = [];
  const persisted = [];
  const hub = createHub({ onAction: (event) => actions.push(event), onPersist: (patch) => persisted.push(patch) });
  hub.start({ deck: 0, roomId: 'bridge', positionX: 180, activeCrisis: { id: 'v52-breach', kind: 'xenomorph', count: 1 } });
  assert.equal(hub.getSnapshot().crisisActive, true);
  assert.ok(hub.npcs.every((npc) => npc.alerted));
  const crisisAnimations = hub.getSnapshot().npcAnimations;
  assert.equal(crisisAnimations.length, 4);
  assert.ok(crisisAnimations.every((entry) => entry.clipId === 'ready'));
  for (const entry of crisisAnimations) {
    assert.equal(entry.sheetId, CREW_MISSION_SPRITE_IDS[entry.crewId], `${entry.crewId}: plaque mission dédiée`);
  }
  assert.equal(new Set(crisisAnimations.map((entry) => entry.sheetId)).size, 4, 'aucun partage de plaque entre identités');
  assert.equal(crisisAnimations.some((entry) => entry.clipId === 'alert-reaction'), false, 'aucun retour locomotion quand la plaque mission existe');

  const npc = hub.npcs[0];
  Object.assign(hub.player, { x: npc.x, y: npc.y, vx: 0, vy: 0, grounded: true });
  hub.interact();
  assert.equal(actions.filter((event) => event.type === 'hub:npc-interaction').length, 0, 'crew services cannot mask a live crisis');

  const enemy = hub.enemies.find((entry) => entry.source === 'crisis');
  enemy.health = 1;
  hub.projectiles = [{ x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h, vx: 0, damage: 99, life: 1 }];
  hub.updateCombat(0.016);
  assert.ok(actions.some((event) => event.action === 'crisis:resolved'));
  assert.ok(persisted.some((patch) => patch.activeCrisis === null));
  assert.ok(hub.npcs.every((entry) => !entry.alerted));
  assert.equal(hub.getSnapshot().crisisActive, false);
}));

test('the pure NPC event builder rejects invalid actors and preserves an explicit repeat count', () => {
  assert.equal(buildHubNpcInteractionEvent({ crewId: 'unknown' }), null);
  const member = HUB_NPC_ROSTER[0];
  const event = buildHubNpcInteractionEvent(member, { deck: 0, roomId: member.roomId, count: 3, sequence: 9 });
  assert.equal(event.persistence.value.count, 3);
  assert.equal(event.persistence.value.sequence, 9);
  assert.equal(event.consequence, member.interaction.consequence);
});
