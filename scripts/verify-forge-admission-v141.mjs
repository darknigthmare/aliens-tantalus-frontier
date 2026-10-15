import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectForgeJourneyV141, admittedForgeJourneyV141 } from '../src/forge-journey-admission-v141.js';

function room(id, { spawn = false, goal = false, door = 6 } = {}) {
  const cell = (suffix, x, y, type, layer = 'gameplay') => ({ id: `${id}-${suffix}`, x, y, type, layer });
  return { id, name: `Salle ${id}`, size: [32, 18], cells: [
    ...Array.from({ length: 32 }, (_, x) => cell(`floor-${x}`, x, 16, 'floor', 'structure')),
    cell('door', door, 15, 'door'),
    ...(spawn ? [cell('spawn', 1, 15, 'spawn')] : []),
    ...(goal ? [cell('goal', 20, 15, 'objective')] : [])
  ] };
}
const project = kind => ({ schema: 3, kind, name: 'Parcours admissible', activeRoomId: 'a',
  rooms: [room('a', { spawn: true }), room('b', { goal: true })],
  links: [{ id: 'ab', from: { roomId: 'a', cellId: 'a-door' }, to: { roomId: 'b', cellId: 'b-door' }, bidirectional: true }] });
const has = (audit, code) => audit.issues.some(issue => issue.code === code && issue.severity === 'error');

for (const kind of ['mission', 'ship']) {
  test(`${kind}: a transit room needs no local objective or unused insertion`, () => {
    const input = project(kind), before = structuredClone(input), audit = inspectForgeJourneyV141(input);
    assert.equal(audit.ok, true, audit.errors.join('\n'));
    assert.equal(audit.scope, 'reachable-rooms'); assert.equal(audit.totalObjectiveCount, 1);
    assert.deepEqual(audit.reachableRoomIds, ['a', 'b']); assert.equal(audit.arrivals.length, 2);
    assert.ok(audit.arrivals.every(arrival => arrival.ok)); assert.deepEqual(input, before);
    assert.ok(audit.issues.every(issue => !['native-active-room-only', 'native-decoration-omitted'].includes(issue.code)));
  });
  test(`${kind}: an objective in a disconnected room cannot complete the journey`, () => {
    const input = project(kind); input.links = [];
    const audit = inspectForgeJourneyV141(input);
    assert.equal(audit.ok, false); assert.ok(has(audit, 'journey-missing-objective'));
    assert.equal(audit.totalObjectiveCount, 0);
    assert.ok(audit.issues.some(issue => issue.code === 'journey-unreachable-room' && issue.roomId === 'b'));
    assert.throws(() => admittedForgeJourneyV141(input));
  });
  test(`${kind}: a linked door without a fixed landing is refused before launch`, () => {
    const input = project(kind); input.rooms[1].cells = input.rooms[1].cells.filter(cell => cell.type !== 'floor');
    const audit = inspectForgeJourneyV141(input);
    assert.equal(audit.ok, false); assert.ok(has(audit, 'journey-blocked-arrival'));
  });
  test(`${kind}: a one-way route is warned about and retains its destination objective`, () => {
    const input = project(kind); input.links[0].bidirectional = false;
    const audit = inspectForgeJourneyV141(input);
    assert.equal(audit.ok, true, audit.errors.join('\n'));
    assert.equal(audit.arrivals.length, 1); assert.equal(audit.totalObjectiveCount, 1);
    assert.ok(audit.issues.some(issue => issue.code === 'journey-one-way' && issue.severity === 'warning'));
  });
}

test('admission recompiles canonical rooms rather than trusting legacy size/tiles/validation fields', () => {
  const input = { ...project('mission'), size: [128, 72], tiles: [{ position: '0:0', type: 'hazard' }], validation: { ok: true } };
  const admitted = admittedForgeJourneyV141(input);
  assert.deepEqual(admitted.size, [32, 18]); assert.ok(admitted.tiles.every(tile => tile.type !== 'hazard'));
  assert.equal(admitted.rooms.length, 2); assert.equal(admitted.links.length, 1);
  admitted.rooms[0].name = 'Changed'; assert.equal(input.rooms[0].name, 'Salle a');
  input.rooms[0].cells = input.rooms[0].cells.filter(cell => cell.type !== 'spawn');
  assert.throws(() => admittedForgeJourneyV141(input));
});

test('capacity failures in a later reachable room are no longer hidden by an admissible entry', () => {
  const input = project('mission');
  input.rooms[1].cells.push({ id: 'b-extra-goal', x: 25, y: 15, type: 'objective', layer: 'gameplay' });
  const audit = inspectForgeJourneyV141(input);
  assert.equal(audit.ok, false); assert.ok(has(audit, 'native-objective-capacity'));
  assert.ok(audit.issues.some(issue => issue.code === 'native-objective-capacity' && issue.roomId === 'b'));
});

test('a ship insertion overlapping a standing vent is refused by its compiled body geometry', () => {
  const input = project('ship');
  input.rooms[0].cells.push({ id: 'a-spawn-vent', x: 1, y: 14, type: 'vent', layer: 'gameplay' });
  const audit = inspectForgeJourneyV141(input);
  assert.equal(audit.ok, false); assert.ok(has(audit, 'journey-spawn-vent'));
});

test('invalid link endpoints cannot be admitted through forged successful validation', () => {
  const input = project('ship'); input.links[0].to.cellId = 'b-goal'; input.validation = { ok: true };
  assert.throws(() => inspectForgeJourneyV141(input)); assert.throws(() => admittedForgeJourneyV141(input));
});
