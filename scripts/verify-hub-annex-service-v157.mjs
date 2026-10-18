import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HUB_NPC_ROSTER } from '../src/hub-v52-runtime.js';
import { resolveNpcRoutineV62 } from '../src/npc-dialogue-v62.js';
import { validateHubAnnexGeometryV87 } from '../src/hub-annex-registry-v87.js';
import { HUB_ANNEX_BY_ID_V137, validateHubAnnexGeometryV137 } from '../src/hub-annex-registry-v137.js';
import { HUB_ANNEX_NPC_ROTATIONS_V156, HUB_ANNEX_NPC_ROTATIONS_V157, HUB_ANNEX_NPC_DEFERRED_V156,
  HUB_ANNEX_NPC_DEFERRED_V157, annexNpcDutiesV141, createAnnexNpcsV141, getAnnexNpcPlacementV141 } from '../src/hub-annex-npc-life-v141.js';
import { advanceNpcLifeV136, npcWorkAnchorV136, resolveNpcLifeAnimationV136 } from '../src/npc-life-v136.js';
import { getHubRoomLifePlanV136 } from '../src/hub-room-life-v136.js';
import { getHubSupportPlanesV139 } from '../src/hub-support-planes-v139.js';
import { resolveNpcAnimation } from '../src/sprite-animation-runtime.js';
import { createDefaultSave } from '../src/save.js';
import { SHIP_ANIMAL_HABITATS_V87, getShipAnimalHabitatsV87, installShipAnimalHabitatV87,
  getShipAnimalRoomInteractionV87 } from '../src/ship-animal-habitat-v87.js';
import { SHIP_ANIMAL_ENCLOSURE_PLACEMENTS_V87 } from '../src/ship-animal-enclosure-art-v87.js';
import { SHIP_ANIMAL_TERRARIUM_PLACEMENT_V87 } from '../src/ship-animal-terrarium-art-v87.js';

const room = HUB_ANNEX_BY_ID_V137['animal-care'], crewId = 'crew-04-noor-okafor';
const routines = (hour = 9.5, extra = {}) => new Map(HUB_NPC_ROSTER.map(n => [n.crewId,
  resolveNpcRoutineV62(n.crewId, { clock: { day: 1, hour }, ...extra })]));
function create() { const r = routines(); return createAnnexNpcsV141(annexNpcDutiesV141(r), r).find(n => n.roomId === room.id); }
function tick(actor, dt, extra = {}) {
  actor.lifeV136 = advanceNpcLifeV136(actor.lifeV136, actor, dt, { room, colliders: room.colliders,
    peers: [actor], context: 'animal-care-service-v157', ...extra });
  Object.assign(actor, { x: actor.lifeV136.x, vx: actor.lifeV136.actualVelocity, facing: actor.lifeV136.facing });
  return actor.lifeV136;
}
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

test('the human service bay has an exactly admitted full-width floor and preserves all six animal habitat locations', () => {
  assert.equal(room.world.width, 2432); assert.equal(room.world.floorY, 624);
  assert.equal(room.platforms.find(p => p.role === 'floor').w, 2432);
  assert.deepEqual(validateHubAnnexGeometryV137(room), { valid: true, errors: [], annexId: room.id });
  for (const width of [1920, 2431, 2433, 3000]) {
    const malformed = structuredClone(room); malformed.world.width = width;
    // V137 routes canonical extensions by identity, so use their native V87
    // validator directly for tampered descriptors rather than an unknown copy.
    assert.ok(validateHubAnnexGeometryV87(malformed).errors.includes('invalid-world'));
  }
  assert.deepEqual(SHIP_ANIMAL_HABITATS_V87.map(h => [h.id, h.installX, h.location.x, h.location.y]), [
    ['moka-berth-v87', 690, 690, 624], ['brume-berth-v87', 1160, 1160, 624],
    ['luciole-berth-v87', 354, 354, 624], ['noisette-cafe-pen-v87', 1013, 1013, 624],
    ['tic-tac-pen-v87', 1522, 1522, 624], ['mica-terrarium-v87', 1800, 1800, 612]
  ]);
  assert.deepEqual([...SHIP_ANIMAL_ENCLOSURE_PLACEMENTS_V87, SHIP_ANIMAL_TERRARIUM_PLACEMENT_V87].map(p => p.bounds), [
    { x: 928, y: 542, w: 170, h: 82 }, { x: 1454, y: 548, w: 136, h: 76 }, { x: 1782, y: 536, w: 120, h: 88 }
  ]);
  assert.equal(room.props.length, 17);
  assert.deepEqual(room.props.map(p => p.id), ['care-counter', 'hygiene-cabinet', 'cat-bed', 'cat-water', 'cat-food',
    'cat-hygiene', 'cat-scratch', 'dog-bed', 'dog-water', 'dog-food', 'dog-toy', 'luciole-bed',
    'luciole-water', 'luciole-food', 'luciole-hygiene', 'luciole-scratch', 'luciole-toy']);
});

test('adult-height preparation and records share the room orthographic plane and clear all reserved fittings', () => {
  const plan = getHubRoomLifePlanV136(room), support = getHubSupportPlanesV139(room);
  const table = plan.items.find(i => i.role === 'companion-health-preparation');
  const records = plan.items.find(i => i.role === 'companion-welfare-records');
  assert.ok(table && records); assert.equal(support.presentationMode, '2d');
  assert.equal(table.perspective, 'orthographic'); assert.equal(records.perspective, 'orthographic');
  assert.equal(table.h, 50); assert.equal(table.contactYV139, 624); assert.equal(table.y + table.h, 624);
  assert.equal(records.support, 'rear-wall'); assert.ok(records.y + records.h < 527);
  assert.ok(table.x > 1920 && records.x > 1920);
  for (const item of [table, records]) {
    assert.equal(item.projectionDxPerY, 0); assert.equal(item.interactive, false); assert.equal(item.collidable, false);
    assert.ok(!plan.spatial.reservations.some(b => overlaps(item, b)));
  }
  const npc = create(), placement = getAnnexNpcPlacementV141(room.id, crewId);
  assert.ok(npc.annexServiceVisitV157);
  assert.ok(npc.min + placement.hull.x > 1920);
  assert.ok(npc.max + placement.hull.x + placement.hull.w + 12 <= table.x + 1e-7);
  assert.equal(npc.y + npc.h, table.contactYV139);
});

test('the historical layout blocker remains archived while the new rotation replaces Noor once and yields to native priorities', () => {
  assert.equal(HUB_ANNEX_NPC_ROTATIONS_V156.length, 14); assert.equal(HUB_ANNEX_NPC_ROTATIONS_V157.length, 15);
  assert.equal(HUB_ANNEX_NPC_DEFERRED_V156[0].roomId, room.id); assert.deepEqual(HUB_ANNEX_NPC_DEFERRED_V157, []);
  for (const hour of [9, 9.5, 10.49]) {
    const map = routines(hour), cohort = createAnnexNpcsV141(annexNpcDutiesV141(map), map);
    assert.equal(cohort.filter(n => n.crewId === crewId).length, 1);
    assert.equal(cohort.find(n => n.crewId === crewId).roomId, room.id);
  }
  for (const hour of [8.99, 10.5, 12.5, 23]) assert.ok(annexNpcDutiesV141(routines(hour)).every(d => d.roomId !== room.id));
  for (const extra of [{ crisis: { active: true } }, { infestation: { active: true, stage: 'containment' } },
    { operation: { crewIds: [crewId] } }, { crew: [{ id: crewId, health: 25, injuries: ['injury'] }] }]) {
    assert.ok(annexNpcDutiesV141(routines(9.5, extra)).every(d => d.roomId !== room.id));
  }
});

test('every one of the 64 fitting states retains the same separate human rail and all existing installation interactions', () => {
  const fixed = getAnnexNpcPlacementV141(room.id, crewId);
  for (let mask = 0; mask < 64; mask++) {
    let save = createDefaultSave();
    for (const [index, habitat] of SHIP_ANIMAL_HABITATS_V87.entries()) if (mask & (1 << index)) {
      const result = installShipAnimalHabitatV87(save, habitat.id, { roomId: room.id, playerAlive: true,
        artReady: true, playerX: habitat.installX, feetY: 624 });
      assert.equal(result.ok, true); save = result.save;
    }
    assert.equal(getShipAnimalHabitatsV87(save).filter(h => h.installed).length, mask.toString(2).replace(/0/g, '').length);
    const actor = create(); assert.equal(actor.crewId, crewId);
    assert.deepEqual(getAnnexNpcPlacementV141(room.id, crewId), fixed);
    assert.ok(actor.x + fixed.hull.x > 1920);
    for (const [index, habitat] of SHIP_ANIMAL_HABITATS_V87.entries()) if (!(mask & (1 << index))) {
      const interaction = getShipAnimalRoomInteractionV87({ currentAnnexV71: () => room,
        player: { x: habitat.installX - 22, y: 532, w: 44, h: 92, alive: true } }, save);
      assert.equal(interaction?.action, 'ship-animal:install'); assert.equal(interaction.habitatId, habitat.id);
    }
  }
});

test('the adult physically walks to work and back on its reviewed rail at 30, 60 and 120 Hz without changing supports', () => {
  for (const rate of [30, 60, 120]) {
    const actor = create(), home = actor.x, visit = actor.annexServiceVisitV157, phases = new Set();
    let worked = false, returned = false, moving = 0;
    for (let frame = 0; frame < 44 * rate; frame++) {
      const oldX = actor.x, life = tick(actor, 1 / rate); phases.add(life.tripPhase);
      assert.ok(Math.abs(actor.x - oldX) <= 27 / rate + 1e-7);
      assert.ok(actor.x >= actor.min - 1e-7 && actor.x <= actor.max + 1e-7);
      assert.equal(actor.y + actor.h, 624); assert.ok(Math.abs(actor.vx) <= 27.001);
      const animation = resolveNpcLifeAnimationV136(actor, life, resolveNpcAnimation(actor));
      assert.equal(animation.sheetId, actor.spriteId);
      if (life.mode === 'moving') assert.equal(animation.clipId, 'walk');
      if (life.tripPhase === 'work') assert.equal(animation.clipId, 'role-work');
      moving += Math.abs(actor.x - oldX);
      if (life.tripPhase === 'work') { worked = true; assert.ok(Math.abs(actor.x - visit.workX) < .4); }
      if (worked && life.tripPhase === 'rest') { returned = true; assert.ok(Math.abs(actor.x - home) < .4); }
    }
    assert.ok(worked && returned, `${rate}Hz completes its work visit and actual return`);
    assert.deepEqual([...phases].sort(), ['approach', 'rest', 'return', 'work']); assert.ok(moving > 2 * 170);
  }
});

test('closed geometry and real peers stop a service approach and cause a physical return without teleporting', () => {
  for (const type of ['solid', 'peer']) {
    const actor = create(), blocker = { x: actor.x + 95, y: 532, w: 44, h: 92, alive: true, roomId: room.id, crewId: 'crew-obstacle' };
    let approached = false, turned = false, wentHome = false, maxX = actor.x;
    for (let frame = 0; frame < 44 * 60; frame++) {
      const oldX = actor.x, life = tick(actor, 1 / 60, type === 'solid' ? { colliders: [blocker] } : { peers: [actor, blocker] });
      assert.ok(Math.abs(actor.x - oldX) <= 27 / 60 + 1e-7); maxX = Math.max(maxX, actor.x);
      assert.ok(actor.x + actor.w <= blocker.x + 1e-7);
      approached ||= life.tripPhase === 'approach'; turned ||= life.tripPhase === 'return';
      wentHome ||= turned && life.tripPhase === 'rest';
    }
    assert.ok(approached && turned && wentHome, type); assert.ok(maxX > actor.min + 20);
  }
});

test('a service visit freezes during dialogue and reduced motion preserves the exact physical path', () => {
  const actor = create(), reduced = create();
  for (let frame = 0; frame < 12 * 60; frame++) {
    tick(actor, 1 / 60); tick(reduced, 1 / 60, { reducedMotion: true });
    assert.equal(actor.x, reduced.x); assert.equal(actor.y, reduced.y);
  }
  const before = structuredClone(actor);
  const suspended = advanceNpcLifeV136(actor.lifeV136, actor, 30, { room, context: 'animal-care-service-v157', suspended: true });
  assert.deepEqual(suspended, before.lifeV136); assert.deepEqual(actor, before);
  actor.workClock = 2.4; tick(actor, .1); assert.equal(actor.x, before.x); assert.equal(actor.lifeV136.mode, 'interaction');
});

test('local service anchors reject foreign rooms, forged supports and endpoints outside the admitted rail', () => {
  const actor = create(); assert.equal(npcWorkAnchorV136(actor, room), actor.annexServiceVisitV157.workX);
  for (const patch of [{ workX: actor.max + 1 }, { homeX: actor.min - 1 }, { supportId: 'table-is-not-a-floor' },
    { workX: Infinity }, { workX: actor.min + 10 }]) {
    assert.equal(npcWorkAnchorV136({ ...actor, annexServiceVisitV157: { ...actor.annexServiceVisitV157, ...patch } }, room), null);
  }
  assert.equal(npcWorkAnchorV136(actor, { ...room, id: 'medical' }), null);
  assert.equal(npcWorkAnchorV136({ ...actor, routinePhaseV62: 'break' }, room), null);
});
