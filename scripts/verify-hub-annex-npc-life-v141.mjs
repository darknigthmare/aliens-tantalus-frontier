import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HUB_DECKS } from '../src/hub-game.js';
import { HUB_NPC_ROSTER } from '../src/hub-v52-runtime.js';
import { HUB_ANNEXES_V137, HUB_ANNEX_BY_ID_V137 } from '../src/hub-annex-registry-v137.js';
import { getHubAnnexRuntimeGeometryV139 } from '../src/hub-annex-runtime-geometry-v139.js';
import { resolveNpcRoutineV62, beginNpcConversationV62 } from '../src/npc-dialogue-v62.js';
import { createDefaultSave } from '../src/save.js';
import { withHubNpcLifeV136 } from '../src/npc-life-v136.js';
import { HUB_ANNEX_NPC_DUTIES_V141, annexNpcDutiesV141, createAnnexNpcsV141,
  getAnnexNpcPlacementV141 } from '../src/hub-annex-npc-life-v141.js';
import { resolveHumanAtlasGeometryV133 } from '../src/human-visual-contract-v133.js';
import { resolveSpriteSheet, resolveNpcAnimation } from '../src/sprite-animation-runtime.js';

const routineMap = (hour = 8, extra = {}) => new Map(HUB_NPC_ROSTER.map(n => [n.crewId,
  resolveNpcRoutineV62(n.crewId, { clock: { day: 1, hour }, ...extra })]));
class Base {
  start() { this.initialParentNpcs = HUB_DECKS.flatMap((_, index) => this.createNpcs(index)); }
  createNpcs(deck) { return HUB_NPC_ROSTER.filter(n => n.deck === deck).map(n => ({ ...n, x: 420, y: 532, w: 44, h: 92 })); }
  currentAnnexV71() { return this.annex; }
  nearestAnnexStationV71() { return this.station || null; }
  getSnapshot() { return { parent: true }; }
  npcAnimationRequest(npc) { return resolveNpcAnimation(npc); }
  persist() { this.persisted = structuredClone(this.state); }
  onAction(event) { this.event = event; this.running = false; }
  emitStatus() {}
}
const Hub = withHubNpcLifeV136(Base);
function hubFor(roomId, { hour = 8, reducedMotion = false, ...extra } = {}) {
  const hub = new Hub();
  Object.assign(hub, { npcRoutineResolutionsV62: routineMap(hour), state: { deck: 0, sentinel: 'campaign' },
    annex: getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137[roomId]), running: true, reducedMotion,
    player: { x: 900, y: 532, w: 44, h: 92 }, hubNpcInteractions: {}, hubNpcSequence: 0,
    hubNpcAnimation: { reset() {} }, ...extra });
  hub.npcs = HUB_DECKS.flatMap((_, index) => hub.createNpcs(index));
  return hub;
}
function step(hub, seconds, rate = 60) {
  const frames = [];
  for (let frame = 0; frame < seconds * rate; frame++) {
    hub.tickAnnexNpcLifeV141(1 / rate);
    frames.push(structuredClone(hub.activeAnnexNpcsV141()));
  }
  return frames;
}
const overlaps = (a, b) => a.x < b.x + b.w - 1e-7 && a.x + a.w > b.x + 1e-7
  && a.y < b.y + b.h - 1e-7 && a.y + a.h > b.y + 1e-7;

test('reviewed four-annex cohort moves six unique real identities out of the parent, without inventing the other fifteen populations', () => {
  const hub = hubFor('maintenance-spine'), cohort = hub.ensureAnnexNpcCohortV141();
  assert.equal(cohort.length, 6); assert.equal(new Set(cohort.map(n => n.roomId)).size, 4);
  assert.equal(new Set([...hub.npcs, ...cohort].map(n => n.crewId)).size, HUB_NPC_ROSTER.length);
  assert.equal(hub.npcs.length + cohort.length, HUB_NPC_ROSTER.length);
  assert.deepEqual(cohort, hubFor('maintenance-spine').ensureAnnexNpcCohortV141());
  for (const annex of HUB_ANNEXES_V137) if (!cohort.some(n => n.roomId === annex.id)) {
    hub.annex = annex; assert.deepEqual(hub.activeAnnexNpcsV141(), []);
  }
});

test('breaks, routes, crisis, assignment and medical recovery keep their existing native schedules', () => {
  for (const hour of [0, 6.25, 12.5, 13.5, 14.5, 21.5]) assert.deepEqual(annexNpcDutiesV141(routineMap(hour)), []);
  assert.equal(annexNpcDutiesV141(routineMap(16)).length, 6);
  const selected = HUB_ANNEX_NPC_DUTIES_V141.map(n => n.crewId);
  for (const extra of [{ crisis: { active: true } }, { operation: { crewIds: selected } },
    { crew: selected.map(id => ({ id, health: 25, injuries: ['injury'] })) }]) {
    assert.deepEqual(annexNpcDutiesV141(routineMap(8, extra)), []);
  }
});

test('every rail and every shipped idle, walking and work silhouette clears actual props, stations, ladders, return approaches and furniture', () => {
  const cohort = hubFor('morgue').ensureAnnexNpcCohortV141();
  for (const npc of cohort) {
    const plan = getAnnexNpcPlacementV141(npc.roomId, npc.crewId), sheet = resolveSpriteSheet(npc.spriteId);
    assert.equal(npc.y + npc.h, plan.floorY); assert.ok(npc.min <= npc.x && npc.x <= npc.max);
    assert.ok(plan.reservations.some(b => b.role === 'return-approach'));
    for (const x of [npc.min, npc.max]) for (const facing of [-1, 1]) for (let frame = 0; frame < 12; frame++) {
      const geometry = resolveHumanAtlasGeometryV133({ actor: { ...npc, x, facing }, sheet,
        column: frame % 4, row: Math.floor(frame / 4), surface: 'hub' });
      assert.equal(geometry.standingHeight, 96.5); assert.equal(geometry.pivot.y, plan.floorY);
      const body = { x: geometry.visible.x, y: geometry.visible.y, w: geometry.visible.width, h: geometry.visible.height };
      for (const b of plan.reservations) assert.ok(!overlaps(body, b), `${npc.roomId}:${npc.crewId}:${b.role}`);
    }
  }
});

test('real annex rounds use the native acceleration, turn holds, maximum speed and twelve-pixel peer spacing', () => {
  for (const rate of [30, 60, 120]) {
    const hub = hubFor('maintenance-spine'), frames = step(hub, 24, rate);
    for (const frame of frames) {
      const [a, b] = frame;
      assert.ok(b.x - a.x - a.w >= 12 - 1e-7);
      for (const n of frame) assert.ok(n.x >= n.min - 1e-7 && n.x <= n.max + 1e-7 && Math.abs(n.vx) <= 27.001);
    }
    for (const npc of frames[0]) {
      const samples = frames.map(frame => frame.find(n => n.crewId === npc.crewId));
      assert.ok(samples.some(n => n.lifeV136.yieldingTo));
      assert.ok(samples.some(n => n.lifeV136.dwell > 0));
      assert.ok(samples.some(n => n.vx > 20) && samples.some(n => n.vx < -20));
      for (let i = 1; i < samples.length; i++) assert.ok(Math.abs(samples[i].x - samples[i - 1].x) <= 27 / rate + 1e-7);
    }
  }
});

test('the narrow forensic sockets keep both specialists stationary and distinct while native role-work gestures vary', () => {
  const frames = step(hubFor('morgue'), 16), first = frames[0];
  assert.equal(first.length, 2); assert.ok(first.every(n => !n.mobile));
  assert.ok(first[1].x - first[0].x >= 56);
  for (const frame of frames) for (const n of frame) {
    assert.equal(n.x, first.find(old => old.crewId === n.crewId).x); assert.equal(n.vx, 0);
  }
  assert.ok(frames.some(frame => frame.some(n => n.lifeV136.passive?.clipId === 'role-work')));
});

test('pause freezes both cohorts and reduced motion changes gestures without changing physical rounds', () => {
  const normal = hubFor('maintenance-spine'), reduced = hubFor('maintenance-spine', { reducedMotion: true });
  assert.deepEqual(step(normal, 7).map(f => f.map(n => n.x)), step(reduced, 7).map(f => f.map(n => n.x)));
  const before = structuredClone(normal.ensureAnnexNpcCohortV141()); normal.running = false;
  normal.tickAnnexNpcLifeV141(30); normal.tickParentNpcLifeV136(30);
  assert.deepEqual(normal.ensureAnnexNpcCohortV141(), before);
  const morgue = hubFor('morgue', { reducedMotion: true });
  assert.ok(step(morgue, 2).every(f => f.every(n => n.lifeV136.passive.frame === 0 && n.lifeV136.blend === 1)));
});

test('dialogue uses the existing named conversation, actual annex room and interaction ledger, then freezes its speaker', () => {
  const hub = hubFor('morgue'), npc = hub.activeAnnexNpcsV141()[0], original = structuredClone(hub.state);
  hub.player.x = npc.x; assert.equal(hub.nearestAnnexNpcV141(), npc);
  const event = hub.interactWithAnnexNpcV141(npc);
  assert.equal(event.type, 'hub:npc-interaction'); assert.equal(event.roomId, 'morgue');
  assert.equal(event.crewId, npc.crewId); assert.equal(event.persistence.value.lastRoomId, 'morgue');
  const save = createDefaultSave(), dialogue = beginNpcConversationV62(npc.crewId, { save, hub: save.hub, clock: save.clock, crew: save.crew, interaction: event });
  assert.ok(dialogue.lines.length && dialogue.choices.length); assert.equal(dialogue.identity.name, npc.name);
  const paused = structuredClone(npc); hub.tickAnnexNpcLifeV141(20); assert.deepEqual(npc, paused);
  assert.deepEqual(hub.state, original); assert.deepEqual(hub.persisted, original);
  hub.station = { id: 'native-station' }; assert.equal(hub.nearestAnnexNpcV141(), null);
});

test('runtime duty coordinates are absent from campaign state and a fresh resume rebuilds only deterministic local schedules', () => {
  const hub = hubFor('flight-control-cockpit'), before = structuredClone(hub.state); step(hub, 3);
  assert.ok(hub.getSnapshot().annexNpcLifeV141[0].time > 2.9); assert.deepEqual(hub.state, before);
  const resumed = hubFor('flight-control-cockpit');
  assert.equal(resumed.activeAnnexNpcsV141()[0].lifeV136, undefined);
  assert.equal(resumed.activeAnnexNpcsV141()[0].x, resumed.activeAnnexNpcsV141()[0].min);
});

test('annex duty and parent simulation are strictly disabled for editor playtests and Forge sessions', () => {
  for (const flag of [{ editorPlaytest: true }, { forgeSessionV141: { active: true } }, { annexNpcSandboxV141: true }]) {
    const hub = hubFor('maintenance-spine', flag);
    assert.deepEqual(hub.activeAnnexNpcsV141(), []); assert.equal(hub.npcs.length, 16);
    assert.deepEqual(hub.ensureAnnexNpcCohortV141(), []);
    const before = structuredClone(hub.npcs); hub.tickAnnexNpcLifeV141(5); hub.tickParentNpcLifeV136(5);
    assert.deepEqual(hub.npcs, before); assert.equal(hub.nearestAnnexNpcV141(), null);
    assert.deepEqual(hub.getSnapshot().annexNpcLifeV141, []);
  }
});

test('the Forge journey option suppresses annex allocation before the inherited start creates its first actors', () => {
  const hub = hubFor('maintenance-spine');
  hub.start({}, { forgeJourneyV141: true });
  assert.equal(hub.initialParentNpcs.length, 16); assert.deepEqual(hub.ensureAnnexNpcCohortV141(), []);
  assert.deepEqual(hub.activeAnnexNpcsV141(), []);
});

test('existing atlas requests retain the original crew identity and native distance-owned walking clips', () => {
  const hub = hubFor('engine-room'), frames = step(hub, 2), moving = frames.at(-1)[0];
  const request = hub.npcAnimationRequest ? hub.npcAnimationRequest(moving) : resolveNpcAnimation(moving);
  assert.equal(request.sheetId, moving.spriteId); assert.equal(request.clipId, 'walk');
});
