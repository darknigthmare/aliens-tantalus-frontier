import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleShipCarrierPresentationV87 as sample, SHIP_CARRIER_PRESENTATION_V87 as limits }
  from '../src/ship-carrier-presentation-v87.js';

const delivery = Object.freeze({ animalId: 'animal-moka', phase: 'carried', carried: true,
  roomId: 'dropship-hangar', deckId: 'engineering', x: 700, y: 624 });
const player = Object.freeze({ roomId: delivery.roomId, deckId: delivery.deckId, x: 700, y: 624, alive: true });

test('a bonded unit has one two-compartment presentation with immutable identity and preserved carry clearance', () => {
  const duo = { ...delivery, animalId: 'animal-noisette', animalIds: ['animal-noisette', 'animal-cafe'], unitId: 'duo-contract' };
  const before = structuredClone(duo), right = sample(duo, player), left = sample(duo, player, { facing: -1 });
  assert.deepEqual(right.bounds, { x: 706, width: 76, bottom: 600 });
  assert.deepEqual(left.bounds, { x: 618, width: 76, bottom: 600 });
  assert.deepEqual(right.animalIds, duo.animalIds); assert.equal(right.unitId, duo.unitId);
  assert.ok(Object.isFrozen(right.animalIds)); assert.deepEqual(duo, before);
  const moved = sample(duo, { ...player, x: 750 }, { remainder: .1 });
  assert.deepEqual(sample(duo, { ...player, x: 765 }, { previous: moved, paused: true }), moved);
  const newContract = sample({ ...duo, unitId: 'other-contract' }, player, { previous: moved, paused: true });
  assert.equal(newContract.x, 700, 'a former transaction cannot provide another paused carrier pose');
  for (const patch of [{ animalIds: ['animal-noisette'] }, { animalIds: ['animal-noisette', 'animal-noisette'] },
    { animalIds: ['animal-cafe', 'animal-noisette'] }, { unitId: '' }]) assert.equal(sample({ ...duo, ...patch }, player), null);
});

test('bounded presentation follows live feet between durable samples without modifying either input', () => {
  const next = Object.freeze({ ...player, x: 774, y: 580 });
  const result = sample(delivery, next, { remainder: .19, frameDelta: .034 });
  assert.deepEqual(result.bounds, { x: 786, width: 48, bottom: 556 });
  assert.deepEqual(result.anchor, { animalId: 'animal-moka', roomId: delivery.roomId, deckId: delivery.deckId, x: 700, y: 624 });
  assert.equal(delivery.x, 700); assert.equal(next.x, 774);
  assert.equal(Object.isFrozen(result), true); assert.equal(Object.isFrozen(result.anchor), true);
  assert.equal(Object.isFrozen(result.bounds), true);
});

test('right and left use exact mirrored centers +36/-36 with the same size and height', () => {
  const right = sample(delivery, player, { facing: 1 });
  const left = sample(delivery, player, { facing: -1 });
  assert.equal(right.bounds.x, 712); assert.equal(left.bounds.x, 640);
  assert.equal(right.bounds.x + right.bounds.width / 2 - player.x, 36);
  assert.equal(left.bounds.x + left.bounds.width / 2 - player.x, -36);
  assert.equal(right.bounds.width, left.bounds.width); assert.equal(right.bounds.bottom, left.bounds.bottom);
});

test('allowance uses active remainder plus one post-tick physics frame, never unbounded wall time', t => {
  t.mock.method(Date, 'now', () => { throw new Error('No wall time'); });
  assert.equal(sample(delivery, { ...player, x: 740 }), null);
  assert.notEqual(sample(delivery, { ...player, x: 740 }, { frameDelta: .034, remainder: .001 }), null);
  const maximum = limits.horizontalSpeedLimit * limits.maxDeltaSeconds + limits.tolerance;
  assert.notEqual(sample(delivery, { ...player, x: player.x + maximum }, { remainder: 1000, frameDelta: 1000 }), null);
  assert.equal(sample(delivery, { ...player, x: player.x + maximum + .001 }, { remainder: 1000, frameDelta: 1000 }), null);
  for (const delta of [NaN, Infinity, -1, '1'])
    assert.equal(sample(delivery, { ...player, x: 740 }, { remainder: delta, frameDelta: delta }), null);
});

test('different room/deck, respawn discontinuity, death and annex transitions never project a carried crate', () => {
  for (const changed of [{ roomId: 'frontier-civil-counter' }, { deckId: 'habitat' }, { x: 118 },
    { y: 100 }, { alive: false }, { alive: undefined }, { x: NaN }, { y: Infinity }, { x: -1 }])
    assert.equal(sample(delivery, { ...player, ...changed }, { remainder: .2, frameDelta: .034 }), null);
  assert.equal(sample(delivery, player, { transitioning: true }), null);
  for (const facing of [0, NaN, Infinity, 'left']) assert.equal(sample(delivery, player, { facing }), null);
});

test('only a validated carried phase can receive a carrier projection; recovery stays a stationary world prop', () => {
  for (const phase of ['awaiting-pickup', 'awaiting-recovery', 'intake', 'acclimating', 'delivered'])
    assert.equal(sample({ ...delivery, phase, carried: false }, player), null);
  assert.equal(sample({ ...delivery, carried: false }, player), null);
  assert.equal(sample(null, player), null); assert.equal(sample(delivery, null), null);
});

test('paused presentation freezes the last approved position and facing, while fresh reload uses the durable anchor', () => {
  const previous = sample(delivery, { ...player, x: 760 }, { remainder: .1, facing: -1 });
  const frozen = sample(delivery, { ...player, x: 780 }, { previous, paused: true, facing: 1 });
  assert.deepEqual(frozen, previous);
  const fresh = sample(delivery, { ...player, x: 780 }, { paused: true });
  assert.equal(fresh.x, delivery.x); assert.equal(fresh.y, delivery.y);
  assert.equal(sample(delivery, { ...player, roomId: 'reactor' }, { previous, paused: true }), null);
});

test('a changed validated anchor or individual cannot reuse an older paused projection', () => {
  const previous = sample(delivery, { ...player, x: 760 }, { remainder: .1 });
  const changed = { ...delivery, x: 750 };
  const next = sample(changed, { ...player, x: 750 }, { previous, paused: true });
  assert.equal(next.x, 750);
  const other = sample({ ...delivery, animalId: 'animal-brume' }, player, { previous, paused: true });
  assert.equal(other.x, delivery.x); assert.equal(other.animalId, 'animal-brume');
});

test('active repeats are deterministic and never extrapolate beyond current physical feet', () => {
  const before = JSON.stringify({ delivery, player });
  for (let i = 0; i < 100; i++) {
    const result = sample(delivery, player, { remainder: .2, frameDelta: .034 });
    assert.equal(result.x, player.x); assert.equal(result.y, player.y);
  }
  assert.equal(JSON.stringify({ delivery, player }), before);
});
