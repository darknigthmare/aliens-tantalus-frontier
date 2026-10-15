import test from 'node:test';
import assert from 'node:assert/strict';
import { createForgeSessionV141, forgeRoomProjectV141, reachableForgeRoomsV141, outgoingForgeLinksV141,
  forgeLinkEndpointV141, captureForgeRoomV141, restoreForgeRoomV141, commitForgeTransitionV141,
  findForgeArrivalV141, blockedForgeObjectivesV141, forgeInteractionClearV141 } from '../src/forge-journey-v141.js';

const room = id => ({ id, name: id, size: [8, 8], cells: [
  { id: `${id}-door`, x: 1, y: 5, type: 'door', layer: 'gameplay' },
  { id: `${id}-goal`, x: 3, y: 5, type: 'objective', layer: 'gameplay' }
] });
const project = bidirectional => ({ schema: 3, kind: 'mission', activeRoomId: 'a', rooms: [room('a'), room('b'), room('c')],
  links: [{ id: 'ab', from: { roomId: 'a', cellId: 'a-door' }, to: { roomId: 'b', cellId: 'b-door' }, bidirectional }] });
const geometry = () => ({ door: { x: 200, y: 100, w: 60, h: 160 }, actor: { w: 42, h: 92, facing: 1 },
  bounds: { width: 600, height: 400 }, surfaces: [{ id: 'floor', x: 0, y: 260, w: 600, h: 30 }] });

test('journey parsing clones authoritative rooms and ignores forged legacy previews', () => {
  const source = { ...project(true), size: [128, 72], tiles: [{ position: '127:71', type: 'hazard' }] };
  const before = structuredClone(source), session = createForgeSessionV141(source, { kind: 'mission' });
  const projection = forgeRoomProjectV141(session.project, 'b');
  assert.deepEqual(projection.size, [8, 8]); assert.deepEqual(projection.tiles.map(tile => tile.type), ['door', 'objective']);
  session.project.rooms[0].name = 'session only'; assert.deepEqual(source, before);
  assert.throws(() => createForgeSessionV141(source, { kind: 'ship' }));
});

test('graph respects direction, exposes physical endpoints and omits disconnected rooms', () => {
  const session = createForgeSessionV141(project(false));
  assert.deepEqual(reachableForgeRoomsV141(session.project), ['a', 'b']);
  assert.deepEqual(reachableForgeRoomsV141(session.project, 'b'), ['b']);
  assert.deepEqual(outgoingForgeLinksV141(session.project, 'b'), []);
  assert.equal(forgeLinkEndpointV141(session.project, outgoingForgeLinksV141(session.project)[0].to).cell.id, 'b-door');
  assert.throws(() => forgeLinkEndpointV141(session.project, { roomId: 'b', cellId: 'b-goal' }));
});

test('bidirectional links reverse both endpoints without mutating the project', () => {
  const session = createForgeSessionV141(project(true)), before = structuredClone(session.project);
  const link = outgoingForgeLinksV141(session.project, 'b')[0];
  assert.equal(link.reverse, true); assert.equal(link.from.cellId, 'b-door'); assert.equal(link.to.cellId, 'a-door');
  assert.deepEqual(session.project, before);
});

test('room captures and restores are independent session snapshots', () => {
  const session = createForgeSessionV141(project(true)), data = { doors: [{ open: true }], enemies: [{ alive: false }], loot: [{ taken: true }] };
  captureForgeRoomV141(session, 'a', data); data.doors[0].open = false;
  const copy = restoreForgeRoomV141(session, 'a'); assert.equal(copy.doors[0].open, true); copy.enemies[0].alive = true;
  assert.equal(restoreForgeRoomV141(session, 'a').enemies[0].alive, false);
  assert.equal(restoreForgeRoomV141(session, 'b'), null); assert.throws(() => captureForgeRoomV141(session, 'missing', {}));
});

test('valid room IDs inherited from Object.prototype never create phantom saved rooms', () => {
  for (const id of ['constructor', 'toString', 'valueOf', 'hasOwnProperty']) {
    const input = project(true); input.rooms.push(room(id));
    const session = createForgeSessionV141(input);
    assert.equal(restoreForgeRoomV141(session, id), null);
    captureForgeRoomV141(session, id, { at: new Date('2026-10-15T00:00:00Z'), complete: true });
    assert.equal(restoreForgeRoomV141(session, id).complete, true);
    assert.equal(restoreForgeRoomV141(session, id).at.toISOString(), '2026-10-15T00:00:00.000Z');
  }
});

test('transition commit validates the current physical direction before mutation', () => {
  const session = createForgeSessionV141(project(false)), link = outgoingForgeLinksV141(session.project)[0];
  commitForgeTransitionV141(session, link); assert.equal(session.currentRoomId, 'b'); assert.equal(session.transitions, 1);
  const before = structuredClone(session); assert.throws(() => commitForgeTransitionV141(session, link)); assert.deepEqual(session, before);
});

test('one-way departure only blocks unfinished objectives that would be stranded', () => {
  const session = createForgeSessionV141(project(false));
  assert.deepEqual(blockedForgeObjectivesV141(session, 'b'), ['a-goal']);
  session.completedObjectives.push('a-goal'); assert.deepEqual(blockedForgeObjectivesV141(session, 'b'), []);
  assert.deepEqual(blockedForgeObjectivesV141(createForgeSessionV141(project(true)), 'b'), []);
});

test('arrival is a full supported body beside the physical door and remains pure', () => {
  const input = geometry(), before = structuredClone(input), arrival = findForgeArrivalV141(input);
  assert.deepEqual(arrival, { ok: true, x: 150, y: 168, surfaceId: 'floor', side: 'left' });
  assert.deepEqual(input, before);
});

test('adjacent floor spans support a body, small gaps refuse it', () => {
  const input = geometry(); input.bounds.width = 200; input.door.x = 190;
  input.surfaces = [{ x: 140, y: 260, w: 20, h: 24 }, { x: 160, y: 260, w: 24, h: 24 }];
  assert.equal(findForgeArrivalV141(input).ok, true);
  input.surfaces[1].x += 1; assert.equal(findForgeArrivalV141(input).ok, false);
});

for (const [name, patch] of [
  ['walls and ceilings', input => input.solids = [{ x: 0, y: 100, w: 600, h: 150 }]],
  ['active hazards', input => input.hazards = [{ x: 0, y: 240, w: 600, h: 20, active: true }]],
  ['living occupants', input => input.occupied = [{ x: 0, y: 150, w: 600, h: 110 }]],
  ['moving lifts without a fixed floor', input => input.surfaces[0].kind = 'lift'],
  ['out-of-bounds body', input => input.bounds.height = 200]
]) test(`arrival rejects ${name}`, () => { const input = geometry(); patch(input); assert.equal(findForgeArrivalV141(input).ok, false); });

test('arrival can choose the other side but never ignores a closed door', () => {
  const input = geometry(); input.solids = [{ x: 0, y: 0, w: 200, h: 260 }, input.door];
  const arrival = findForgeArrivalV141(input); assert.equal(arrival.ok, true); assert.equal(arrival.side, 'right');
  assert.ok(arrival.x >= input.door.x + input.door.w);
});

test('hand reach uses the physical segment and excludes only the actual target door', () => {
  const actor = { x: 20, y: 100, w: 42, h: 92 }, target = { id: 'sas', x: 150, y: 100, w: 48, h: 132 };
  const wall = { id: 'wall', x: 100, y: 100, w: 12, h: 132 };
  assert.equal(forgeInteractionClearV141({ actor, target, solids: [{ ...target }] }), true);
  assert.equal(forgeInteractionClearV141({ actor, target, solids: [wall, target] }), false);
  assert.equal(forgeInteractionClearV141({ actor, target, solids: [{ ...wall, destroyed: true }, target] }), true);
  assert.equal(forgeInteractionClearV141({ actor, target, solids: [{ ...wall, y: 240 }, target] }), true);
  assert.equal(forgeInteractionClearV141({ actor, target: null, solids: [] }), false);
});

test('a clear footprint behind a wall cannot be selected as a door arrival', () => {
  const input = geometry(); input.bounds.width = 270;
  // The first left footprint overlaps this narrow wall; every farther left
  // footprint is free but separated from the door by that same wall.
  input.solids = [{ id: 'divider', x: 180, y: 100, w: 12, h: 160 }];
  assert.equal(findForgeArrivalV141(input).ok, false);
  input.bounds.width = 600;
  const alternative = findForgeArrivalV141(input);
  assert.equal(alternative.ok, true); assert.equal(alternative.side, 'right');
  assert.equal(forgeInteractionClearV141({ actor: { ...alternative, w: 42, h: 92 }, target: input.door, solids: input.solids }), true);
});
