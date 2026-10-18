import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HUB_DECKS, HUB_WORLD } from '../src/hub-game.js';
import { HubGame as RoutineHub, HUB_NPC_ROSTER } from '../src/hub-v62-runtime.js';
import { HubGame as AnnexHub } from '../src/hub-v71-runtime.js';
import { HUB_ANNEXES_V137, HUB_ANNEX_BY_ID_V137 } from '../src/hub-annex-registry-v137.js';
import { getHubAnnexRuntimeGeometryV139 } from '../src/hub-annex-runtime-geometry-v139.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { resolveNpcRoutineV62, beginNpcConversationV62 } from '../src/npc-dialogue-v62.js';
import { resolveSpriteSheet } from '../src/sprite-animation-runtime.js';
import { resolveHumanAtlasGeometryV133 } from '../src/human-visual-contract-v133.js';
import { withHubNpcLifeV136 } from '../src/npc-life-v136.js';
import { createDefaultSave } from '../src/save.js';
import { getShipPortVisitorFixtureBoundsV142, getShipPortInteractionV87 } from '../src/ship-port-room-v87.js';
import { HUB_ANNEX_NPC_DUTIES_V141, HUB_ANNEX_NPC_ROTATIONS_V156, HUB_ANNEX_NPC_DEFERRED_V156, HUB_ANNEX_NPC_ROTATIONS_V157, HUB_ANNEX_NPC_DEFERRED_V157,
  annexNpcDutiesV141, createAnnexNpcsV141, getAnnexNpcPlacementV141 } from '../src/hub-annex-npc-life-v141.js';

const Hub = withHubNpcLifeV136(AnnexHub);
const rosterIds = HUB_NPC_ROSTER.map(n => n.crewId).sort();
const workHours = [8, 9.5, 11, 16, 17.5, 19.5];
const routinesAt = (hour, extra = {}, day = 1) => new Map(HUB_NPC_ROSTER.map(n => [n.crewId,
  resolveNpcRoutineV62(n.crewId, { clock: { day, hour }, ...extra })]));
const overlaps = (a, b) => a.x < b.x + b.w - 1e-7 && a.x + a.w > b.x + 1e-7
  && a.y < b.y + b.h - 1e-7 && a.y + a.h > b.y + 1e-7;

/** Actual native roster factory, station priority, conversation and annex
 * interaction methods, without constructing browser images or a canvas. */
function hubAt(hour, roomId = 'maintenance-spine', extra = {}) {
  const hub = Object.create(Hub.prototype);
  Object.assign(hub, {
    npcRoutineResolutionsV62: routinesAt(hour),
    state: { deck: 0, sentinel: 'unchanged-campaign' },
    running: true, annexCameraV71: { x: 0 },
    room: getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137[roomId]),
    player: { x: 900, y: 532, w: 44, h: 92, alive: true },
    hubNpcInteractions: {}, hubNpcSequence: 0, hubNpcAnimation: { reset() {} }, events: [],
    currentAnnexV71() { return this.room; },
    isAnnexActiveV71() { return true; },
    prioritizedParentAnnexDoorV133() { return null; },
    nearestAnnexExitV71() { return null; },
    persist() { this.persistedState = structuredClone(this.state); },
    onAction(event) { this.events.push(event); }, emitStatus() {},
    ...extra
  });
  hub.npcs = HUB_DECKS.flatMap((_, deck) => {
    hub.doorStates = buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck);
    return hub.createNpcs(deck);
  });
  return hub;
}

function allDutyCases() {
  const result = new Map();
  for (const hour of workHours) {
    const resolutions = routinesAt(hour);
    for (const npc of createAnnexNpcsV141(annexNpcDutiesV141(resolutions), resolutions)) {
      result.set(`${npc.crewId}:${npc.roomId}`, { hour, npc });
    }
  }
  return [...result.values()];
}

test('a complete quarter-hour schedule covers nineteen real annexes while preserving the historical V156 diagnosis', () => {
  const covered = new Set();
  for (const day of [1, 2, 29]) for (let tick = 0; tick < 96; tick++) {
    const resolutions = routinesAt(tick / 4, {}, day), duties = annexNpcDutiesV141(resolutions);
    const cohort = createAnnexNpcsV141(duties, resolutions);
    assert.equal(cohort.length, duties.length, `No silently dropped duty at day ${day}, ${tick / 4}h`);
    assert.equal(new Set(cohort.map(n => n.crewId)).size, cohort.length);
    for (const npc of cohort) covered.add(npc.roomId);
  }
  assert.equal(covered.size, 19);
  assert.deepEqual(HUB_ANNEXES_V137.filter(room => !covered.has(room.id)).map(room => room.id), []);
  assert.deepEqual(HUB_ANNEX_NPC_DEFERRED_V157, []);
  assert.deepEqual(HUB_ANNEX_NPC_DEFERRED_V156.map(entry => entry.roomId), ['animal-care']);
  assert.equal(HUB_ANNEX_NPC_DEFERRED_V156[0].reason, 'no-clear-adult-duty-post');
});

test('native parent and annex factories conserve all sixteen identities exactly once throughout the day', () => {
  for (let tick = 0; tick < 96; tick++) {
    const hub = hubAt(tick / 4), cohort = hub.ensureAnnexNpcCohortV141();
    const ids = [...hub.npcs, ...cohort].map(n => n.crewId).sort();
    assert.deepEqual(ids, rosterIds);
    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual(cohort, hubAt(tick / 4).ensureAnnexNpcCohortV141());
    for (const npc of cohort) {
      const original = HUB_NPC_ROSTER.find(member => member.crewId === npc.crewId);
      for (const field of ['name', 'role', 'specialty', 'spriteId', 'spritePath', 'interaction']) {
        assert.deepEqual(npc[field], original[field], `${npc.crewId}:${field}`);
      }
    }
  }
});

test('the original six-person 08:00 and 16:00 watches survive while inspection windows replace individuals atomically', () => {
  for (const hour of [8, 16]) assert.deepEqual(annexNpcDutiesV141(routinesAt(hour)), HUB_ANNEX_NPC_DUTIES_V141);
  for (const duty of HUB_ANNEX_NPC_ROTATIONS_V157) {
    for (const hour of [duty.fromHour, (duty.fromHour + duty.toHour) / 2, duty.toHour - .01]) {
      const selected = annexNpcDutiesV141(routinesAt(hour)).filter(entry => entry.crewId === duty.crewId);
      assert.deepEqual(selected, [duty]);
    }
    for (const hour of [duty.fromHour - .01, duty.toHour]) {
      assert.ok(!annexNpcDutiesV141(routinesAt(hour)).includes(duty));
    }
  }
});

test('rest, native transit, crisis, infestation, mission assignment and medical recovery always preempt visits', () => {
  for (const hour of [0, 6.5, 12.5, 13.5, 14.5, 21.5, 23]) assert.deepEqual(annexNpcDutiesV141(routinesAt(hour)), []);
  for (const hour of workHours) for (const extra of [
    { crisis: { active: true } }, { infestation: { active: true, stage: 'containment' } },
    { operation: { crewIds: rosterIds } },
    { crew: rosterIds.map(id => ({ id, health: 25, injuries: ['injury'] })) }
  ]) assert.deepEqual(annexNpcDutiesV141(routinesAt(hour, extra)), []);
  const mixed = routinesAt(11, { operation: { crewIds: ['crew-11-jun-park'] } });
  assert.ok(annexNpcDutiesV141(mixed).some(duty => duty.roomId === 'mire-archives'));
  assert.ok(annexNpcDutiesV141(mixed).every(duty => duty.crewId !== 'crew-11-jun-park'));
});

test('every full standing, walking and work silhouette clears actual equipment along the entire supported rail', () => {
  for (const { npc } of allDutyCases()) {
    const plan = getAnnexNpcPlacementV141(npc.roomId, npc.crewId), sheet = resolveSpriteSheet(npc.spriteId);
    assert.equal(npc.annexSupportIdV156, plan.support.id);
    assert.equal(npc.y + npc.h, plan.support.y);
    assert.ok(plan.support.role === 'floor' || plan.support.role === 'catwalk');
    assert.ok(npc.min + plan.hull.x >= plan.support.x && npc.max + plan.hull.x + plan.hull.w <= plan.support.x + plan.support.w);
    if (npc.roomId === 'logistics') {
      assert.equal(plan.support.id, 'logistics-catwalk'); assert.equal(plan.floorY, 468);
      const room = HUB_ANNEX_BY_ID_V137.logistics;
      assert.ok(room.ladders.some(ladder => ladder.top === plan.support.y && ladder.bottom === room.world.floorY));
    } else assert.equal(plan.floorY, 624);
    for (const x of [npc.min, (npc.min + npc.max) / 2, npc.max]) {
      for (const facing of [-1, 1]) for (let frame = 0; frame < 12; frame++) {
        const geometry = resolveHumanAtlasGeometryV133({ actor: { ...npc, x, facing }, sheet,
          column: frame % 4, row: Math.floor(frame / 4), surface: 'hub' });
        assert.equal(geometry.standingHeight, 96.5); assert.equal(geometry.pivot.y, plan.support.y);
        const body = { x: geometry.visible.x, y: geometry.visible.y, w: geometry.visible.width, h: geometry.visible.height };
        for (const b of plan.reservations) assert.ok(!overlaps(body, { ...b, x: b.x - b.margin, w: b.w + 2 * b.margin }),
          `${npc.roomId}:${npc.crewId}:${b.role}:${x}:${facing}:${frame}`);
      }
    }
    assert.equal(npc.mobile || !!npc.annexServiceVisitV157, npc.max > npc.min);
    if (npc.mobile) assert.ok(npc.max - npc.min >= 70, `${npc.roomId} has an actual walking rail`);
  }
});

test('physical rounds remain continuous at 30, 60 and 120Hz; small service posts stand rather than fake walking', () => {
  for (const rate of [30, 60, 120]) for (const { hour, npc: sample } of allDutyCases()) {
    const hub = hubAt(hour, sample.roomId), crew = hub.activeAnnexNpcsV141(), before = structuredClone(hub.state);
    const first = new Map(crew.map(n => [n.crewId, n.x])), travelled = new Map(crew.map(n => [n.crewId, 0]));
    for (let frame = 0; frame < 8 * rate; frame++) {
      const previous = new Map(crew.map(n => [n.crewId, n.x])); hub.tickAnnexNpcLifeV141(1 / rate);
      for (const n of crew) {
        assert.ok(n.x >= n.min - 1e-7 && n.x <= n.max + 1e-7);
        assert.ok(Math.abs(n.x - previous.get(n.crewId)) <= 27 / rate + 1e-7);
        travelled.set(n.crewId, travelled.get(n.crewId) + Math.abs(n.x - previous.get(n.crewId)));
        if (!n.mobile && !n.annexServiceVisitV157) { assert.equal(n.x, first.get(n.crewId)); assert.equal(n.vx, 0); }
      }
      const sorted = crew.toSorted((a, b) => a.x - b.x);
      for (let index = 1; index < sorted.length; index++) assert.ok(sorted[index].x - sorted[index - 1].x - sorted[index - 1].w >= 12 - 1e-7);
    }
    for (const n of crew) if (n.mobile) assert.ok(travelled.get(n.crewId) > 60, `${n.roomId}:${rate}Hz physical movement`);
    assert.deepEqual(hub.state, before);
    const paused = structuredClone(crew); hub.running = false; hub.tickAnnexNpcLifeV141(20);
    assert.deepEqual(crew, paused);
  }
});

test('each scheduled specialist has a reachable native dialogue with the correct annex and unchanged campaign save', () => {
  for (const { hour, npc: sample } of allDutyCases()) {
    const hub = hubAt(hour, sample.roomId), npc = hub.activeAnnexNpcsV141().find(n => n.crewId === sample.crewId);
    let approach = null;
    for (let offset = -110; offset <= 110 && approach === null; offset++) {
      const x = npc.x + offset, room = hub.currentAnnexV71();
      if (x < 24 || x + 44 > room.world.width - 24) continue;
      hub.player = { ...hub.player, x, y: npc.y };
      if (hub.nearestAnnexNpcV141() !== npc || hub.nearestAnnexStationV71()) continue;
      if (sample.roomId === 'frontier-civil-counter' && hub.prioritizedCivilAnnexNpcV156() !== npc) continue;
      approach = x;
    }
    assert.ok(approach !== null, `${sample.roomId}:${sample.crewId} has an accessible conversation`);
    assert.match(hub.statusPrompt(), new RegExp(npc.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    const before = structuredClone(hub.state); hub.interact();
    const event = hub.events.at(-1);
    assert.equal(event.type, 'hub:npc-interaction'); assert.equal(event.crewId, npc.crewId);
    assert.equal(event.roomId, npc.roomId); assert.equal(event.persistence.value.lastRoomId, npc.roomId);
    const save = createDefaultSave(), dialogue = beginNpcConversationV62(npc.crewId,
      { save, hub: save.hub, clock: save.clock, crew: save.crew, interaction: event });
    assert.equal(dialogue.identity.name, npc.name); assert.ok(dialogue.lines.length && dialogue.choices.length);
    assert.deepEqual(hub.state, before); assert.deepEqual(hub.persistedState, before);
  }
});

test('the civil inspector clears the exact vendor and terrarium while closer port subjects, exits and stations keep priority', () => {
  const hub = hubAt(19.5, 'frontier-civil-counter'), [npc] = hub.activeAnnexNpcsV141();
  assert.equal(npc.crewId, 'crew-09-inez-harlow'); assert.equal(npc.mobile, false);
  const plan = getAnnexNpcPlacementV141(npc.roomId, npc.crewId);
  const hull = { ...plan.hull, x: npc.x + plan.hull.x };
  for (const b of getShipPortVisitorFixtureBoundsV142()) assert.ok(!overlaps(hull, { ...b, x: b.x - 6, w: b.w + 12 }));
  hub.player.x = 725; assert.equal(hub.nearestAnnexStationV71(), null);
  assert.equal(hub.prioritizedCivilAnnexNpcV156(), npc); assert.ok(hub.statusPrompt().includes(npc.name));
  hub.interact(); assert.equal(hub.events.at(-1).crewId, npc.crewId);
  for (const [center, expectedAnimal] of [[668, undefined], [810, 'animal-mica']]) {
    hub.events = []; hub.player.x = center - 22;
    assert.equal(hub.prioritizedCivilAnnexNpcV156(), null); hub.interact();
    assert.equal(hub.events.at(-1).action, 'ship-port:shop');
    assert.equal(hub.events.at(-1).animalId, expectedAnimal);
  }
  hub.player.x = 725;
  for (const flag of ['hubDoorClosingV142', 'annexTransitionV71', 'annexStateReadOnlyV87']) {
    hub.events = []; hub[flag] = { active: true }; assert.equal(hub.prioritizedCivilAnnexNpcV156(), null);
    hub.interact(); assert.deepEqual(hub.events, []); hub[flag] = null;
  }
  hub.nearestAnnexExitV71 = () => ({ id: 'actual-return' });
  hub.beginAnnexTransitionV71 = (room, direction) => hub.events.push({ room, direction }); hub.events = [];
  assert.equal(hub.prioritizedCivilAnnexNpcV156(), null); hub.interact();
  assert.deepEqual(hub.events, [{ room: 'frontier-civil-counter', direction: 'exit' }]);
});

test('the real Refuge render branch draws its visitor once before the player and normal annexes retain their existing pass', () => {
  class DrawBase extends AnnexHub { drawPlayer(ctx) { ctx.events.push('player'); } }
  const DrawHub = withHubNpcLifeV136(DrawBase), hub = Object.create(DrawHub.prototype);
  const ctx = new Proxy({ events: [], measureText: value => ({ width: String(value).length * 7 }),
    createLinearGradient: () => ({ addColorStop() {} }) }, { get: (target, key) => key in target ? target[key] : () => {} });
  Object.assign(hub, { ctx, annexCameraV71: { x: 0 }, animationTime: 0, reducedMotion: false,
    currentAnnexV71: () => HUB_ANNEX_BY_ID_V137['personal-refuge'], isRefugeActiveV87: () => true,
    ensureAnnexAssetsV71: () => new Map(), drawAnnexGeometryV71: () => ctx.events.push('geometry'),
    drawDoorBitmapV71() {}, annexExitDoorV71: () => ({ bounds: {} }), nearestAnnexExitV71: () => null,
    drawAnnexHudV71() {}, drawAnnexNpcsV141: () => ctx.events.push('crew') });
  hub.drawAnnexV71(); assert.deepEqual(ctx.events, ['geometry', 'crew', 'player']);
  ctx.events = []; hub.currentAnnexV71 = () => HUB_ANNEX_BY_ID_V137.cctv;
  hub.drawPlayer(ctx); assert.deepEqual(ctx.events, ['player']);
});

test('habitat state changes cannot spawn an adult inside an enclosure or an uninstalled fitting plaque', () => {
  for (const member of HUB_NPC_ROSTER) {
    const plan = getAnnexNpcPlacementV141('animal-care', member.crewId);
    assert.ok(plan.rails.length > 0 && plan.rails.every(rail => rail.min > 1920), member.crewId);
    assert.equal(plan.reservations.filter(b => b.role === 'habitat-fitting-plaque').length, 6);
    assert.equal(plan.reservations.filter(b => b.role === 'installed-habitat-fixture').length, 3);
  }
  for (const hour of workHours) {
    const hub = hubAt(hour, 'animal-care'), assigned = hub.activeAnnexNpcsV141();
    assert.equal(assigned.length, hour >= 9 && hour < 10.5 ? 1 : 0);
    for (const npc of assigned) assert.equal(npc.crewId, 'crew-04-noor-okafor');
  }
});

test('editor, Forge and sandbox sessions suppress all expanded duties, rendering and dialogue selection', () => {
  for (const flags of [{ editorPlaytest: true }, { forgeSessionV141: { active: true } }, { annexNpcSandboxV141: true }]) {
    const hub = hubAt(19.5, 'frontier-civil-counter', flags); hub.player.x = 725;
    assert.equal(hub.npcs.length, 16); assert.deepEqual(hub.activeAnnexNpcsV141(), []);
    assert.equal(hub.prioritizedCivilAnnexNpcV156(), null);
    const before = structuredClone(hub.npcs); hub.tickAnnexNpcLifeV141(15); assert.deepEqual(hub.npcs, before);
  }
});
