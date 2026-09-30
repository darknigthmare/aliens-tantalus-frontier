import test from 'node:test';
import assert from 'node:assert/strict';
import { filterXenoTrialsRosterV97 } from '../src/xeno-trials-selection-v97.js';
import { XENO_TRIALS_FIGHTERS_V96 as FIGHTERS } from '../src/xeno-trials-data-v96.js';

test('Trials catalogue exposes every fighter and independently selectable synthetic', () => {
  const result = filterXenoTrialsRosterV97(FIGHTERS);
  assert.equal(result.length, FIGHTERS.length); assert.notEqual(result, FIGHTERS); assert.deepEqual(result, FIGHTERS);
  const machines = filterXenoTrialsRosterV97(FIGHTERS, { family: 'synthetic' });
  assert.equal(machines.length, FIGHTERS.filter(f => f.family === 'synthetic').length);
  assert.equal(new Set(machines.map(f => f.id)).size, machines.length);
  assert.ok(machines.every(f => f.family === 'synthetic'));
});

test('V97 filters compose family, role, owned status and case-insensitive trimmed search', () => {
  const candidate = FIGHTERS.find(f => f.family === 'synthetic');
  const filtered = filterXenoTrialsRosterV97(FIGHTERS, { family: candidate.family, role: candidate.role,
    ownership: 'owned', unlocked: [candidate.id], query: `  ${candidate.label.toLocaleUpperCase('fr')}  ` });
  assert.deepEqual(filtered, [candidate]);
  assert.deepEqual(filterXenoTrialsRosterV97(FIGHTERS, { family: 'xenomorph', ownership: 'owned', unlocked: [candidate.id] }), []);
});

test('V97 owned and locked filters partition the roster without treating duplicate unlocks as fighters', () => {
  const unlocked = ['warrior', 'runner', 'arachnoid', 'runner', 'not-a-fighter'];
  const owned = filterXenoTrialsRosterV97(FIGHTERS, { ownership: 'owned', unlocked });
  const locked = filterXenoTrialsRosterV97(FIGHTERS, { ownership: 'locked', unlocked });
  assert.equal(owned.length, 3); assert.equal(locked.length, FIGHTERS.length - 3);
  assert.equal(new Set([...owned, ...locked].map(f => f.id)).size, FIGHTERS.length);
  assert.ok(locked.every(f => !unlocked.includes(f.id)));
});

test('V97 search returns no results safely and palette variants never duplicate identity', () => {
  assert.deepEqual(filterXenoTrialsRosterV97(FIGHTERS, { query: '<script>absent</script>' }), []);
  assert.deepEqual(filterXenoTrialsRosterV97([], { family: 'synthetic' }), []);
  const arachnoids = filterXenoTrialsRosterV97(FIGHTERS, { query: 'arachnoid' });
  assert.equal(arachnoids.length, 1); assert.equal(arachnoids[0].id, 'arachnoid');
  assert.deepEqual(arachnoids[0].variants, ['grey', 'purple']);
});

test('V99 faction filtering composes with ownership and an empty faction is not all fighters', () => {
  const factionRoster = ['runner', 'warrior'];
  assert.deepEqual(filterXenoTrialsRosterV97(FIGHTERS, { factionRoster, ownership: 'owned', unlocked: ['runner'] }).map(f => f.id), ['runner']);
  assert.deepEqual(filterXenoTrialsRosterV97(FIGHTERS, { factionRoster: [] }), []);
  assert.deepEqual(factionRoster, ['runner', 'warrior']);
});

test('V97 all sort modes leave catalog order and fighter objects intact', () => {
  const before = structuredClone(FIGHTERS);
  for (const [sort, stat] of [['health', 'hp'], ['speed', 'speed'], ['name', null]]) {
    const sorted = filterXenoTrialsRosterV97(FIGHTERS, { sort });
    for (let i = 1; i < sorted.length; i++) {
      const a = sorted[i - 1], b = sorted[i];
      if (stat && a[stat] !== b[stat]) assert.ok(a[stat] > b[stat]);
      else assert.ok(a.label.localeCompare(b.label, 'fr') <= 0);
    }
    assert.ok(sorted.every(f => FIGHTERS.includes(f)));
  }
  assert.deepEqual(FIGHTERS, before); assert.deepEqual(filterXenoTrialsRosterV97(FIGHTERS), before);
});
