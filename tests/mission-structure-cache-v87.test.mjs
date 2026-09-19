import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMissionSupportSpansV87, getMissionStructureLayoutV87 } from '../src/mission-structure-layout-v87.js';

const deck = (id, y, extra = {}) => ({ id, x: 0, y, w: 160, h: 24, art: 'catwalk', ...extra });
const makePlatforms = () => [deck('upper', 100), deck('floor', 500, { floor: true, h: 80, art: 'floor' })];

test('cached static layout is reused without returning collider aliases', () => {
  const platforms = makePlatforms();
  const layout = getMissionStructureLayoutV87(platforms);
  assert.equal(getMissionStructureLayoutV87(platforms), layout);
  assert.deepEqual(layout.supports, buildMissionSupportSpansV87(platforms));
  assert.notEqual(layout.decks[0], platforms[0]);
  assert.ok(Object.isFrozen(layout) && Object.isFrozen(layout.decks) && Object.isFrozen(layout.supports));
  assert.ok(Object.isFrozen(layout.decks[0]) && Object.isFrozen(layout.supports[0]));
  assert.equal(platforms[0].h, 24);
  assert.ok(!Object.isFrozen(platforms[0]), 'the cache must not freeze a physics record');
});

test('new mission array has its own cache even when it reuses the same platform objects', () => {
  const platforms = makePlatforms();
  const first = getMissionStructureLayoutV87(platforms);
  const resetPlatforms = [...platforms];
  const reset = getMissionStructureLayoutV87(resetPlatforms);
  assert.notEqual(reset, first);
  assert.deepEqual(reset, first);
  assert.equal(getMissionStructureLayoutV87(platforms), first);
  assert.equal(getMissionStructureLayoutV87(resetPlatforms), reset);
});

test('push, remove and in-place replacement invalidate the cache', () => {
  const platforms = makePlatforms();
  const first = getMissionStructureLayoutV87(platforms);
  platforms.push(deck('middle', 300));
  const pushed = getMissionStructureLayoutV87(platforms);
  assert.notEqual(pushed, first);
  assert.equal(pushed.supports.find(span => span.upperId === 'upper').lowerId, 'middle');
  platforms.pop();
  const popped = getMissionStructureLayoutV87(platforms);
  assert.notEqual(popped, pushed);
  assert.deepEqual(popped, first);
  platforms[0] = { ...platforms[0] };
  const replaced = getMissionStructureLayoutV87(platforms);
  assert.notEqual(replaced, popped, 'identity changes are detected even with identical structural fields');
  assert.deepEqual(replaced, popped);
});

for (const [field, value] of Object.entries({ x: 10, y: 110, w: 180, h: 30, art: 'ledge', floor: true,
  kind: 'lift', id: 'renamed', renderHeight: 31, surfaceOffset: 3 })) {
  test(`in-place static ${field} changes invalidate the layout snapshot`, () => {
    const platforms = makePlatforms();
    const first = getMissionStructureLayoutV87(platforms);
    platforms[0][field] = value;
    const changed = getMissionStructureLayoutV87(platforms);
    assert.notEqual(changed, first);
    assert.equal(getMissionStructureLayoutV87(platforms), changed);
    assert.deepEqual(changed.supports, buildMissionSupportSpansV87(platforms));
  });
}

test('in-place static movement updates actual support endpoints, not only cache identity', () => {
  const platforms = makePlatforms();
  const first = getMissionStructureLayoutV87(platforms);
  assert.equal(first.supports[0].y, 124);
  platforms[0].y = 160;
  platforms[1].y = 620;
  const changed = getMissionStructureLayoutV87(platforms);
  assert.equal(changed.supports[0].y, 184);
  assert.equal(changed.supports[0].y + changed.supports[0].h, 620);
  assert.equal(first.supports[0].y, 124, 'old snapshots remain stable');
});

test('elevator vertical movement does not rebuild static geometry; returned lift remains live', () => {
  const platforms = makePlatforms();
  const lift = deck('moving', 250, { kind: 'lift', phase: 0, baseY: 350, topY: 180, previousY: 250 });
  platforms.push(lift);
  const first = getMissionStructureLayoutV87(platforms);
  assert.equal(first.lifts[0], lift);
  assert.equal(first.decks.length, 1);
  assert.ok(first.supports.every(span => span.upperId !== lift.id && span.lowerId !== lift.id));
  for (const y of [180, 181.125, 300, 350]) {
    lift.previousY = lift.y;
    lift.y = y;
    lift.phase += 0.2;
    const current = getMissionStructureLayoutV87(platforms);
    assert.equal(current, first);
    assert.equal(current.lifts[0].y, y);
  }
  assert.ok(!Object.isFrozen(lift));
  lift.x += 5;
  const shifted = getMissionStructureLayoutV87(platforms);
  assert.notEqual(shifted, first, 'only the moving y coordinate is exempt from structural invalidation');
  assert.equal(shifted.lifts[0], lift);
  lift.kind = 'static';
  const staticLift = getMissionStructureLayoutV87(platforms);
  assert.equal(staticLift.lifts.length, 0);
  assert.ok(staticLift.decks.some(platform => platform.id === 'moving'));
});

test('unrelated gameplay state does not invalidate static geometry', () => {
  const platforms = makePlatforms();
  const first = getMissionStructureLayoutV87(platforms);
  platforms[0].health = 20;
  platforms[0].lastTouchedBy = 'player';
  assert.equal(getMissionStructureLayoutV87(platforms), first);
});

test('a close intermediate deck blocks a long support instead of being pierced to reach a deeper floor', () => {
  const platforms = [deck('upper', 100, { h: 20 }), deck('close', 139, { h: 20 }),
    deck('floor', 600, { floor: true, h: 80, art: 'floor' })];
  for (const spans of [buildMissionSupportSpansV87(platforms), getMissionStructureLayoutV87(platforms).supports]) {
    assert.ok(!spans.some(span => span.upperId === 'upper'));
    assert.ok(spans.some(span => span.upperId === 'close' && span.lowerId === 'floor'));
  }
  platforms[1].y = 148;
  const changed = getMissionStructureLayoutV87(platforms);
  const support = changed.supports.find(span => span.upperId === 'upper');
  assert.equal(support.lowerId, 'close');
  assert.equal(support.h, 28, 'minimum valid gap still renders');
});

test('invalid members remain harmless and NaN records do not force a rebuild every frame', () => {
  const platforms = [null, undefined, deck('invalid', NaN), ...makePlatforms()];
  const first = getMissionStructureLayoutV87(platforms);
  assert.equal(first.decks.length, 1);
  assert.equal(getMissionStructureLayoutV87(platforms), first);
  for (const input of [undefined, null, {}, 42]) {
    assert.deepEqual(getMissionStructureLayoutV87(input), { decks: [], supports: [], lifts: [] });
  }
});
