import test from 'node:test';
import assert from 'node:assert/strict';
import { WEAPONS } from '../src/content.js';
import { buildWeaponRuntime } from '../src/game-runtime.js';

test('le M41A réel et ses finitions ne sont plus des fusils à une cartouche', () => {
  const entries = WEAPONS.filter(weapon => weapon.name === 'M41A Pulse Rifle' || weapon.name.startsWith('M41A Pulse Rifle —'));
  assert.equal(entries.length, 4);
  assert.equal(entries[0].id, 'weapon-001-m41a-pulse-rifle');
  for (const weapon of entries) {
    assert.equal(weapon.magazine, 99);
    assert.equal(weapon.fireRate, 7.7);
    assert.equal(weapon.reload, 1.45);
    assert.equal(weapon.statsPolicy, 'm41a-reviewed-v77');
    const runtime = buildWeaponRuntime(weapon);
    assert.equal(runtime.magazine, weapon.magazine);
    assert.equal(runtime.fireRate, weapon.fireRate);
    assert.equal(runtime.reload, weapon.reload);
  }
});

test('la correction ne réécrit ni les identités ni silencieusement les autres statistiques', () => {
  assert.equal(WEAPONS.length, 146);
  assert.equal(new Set(WEAPONS.map(weapon => weapon.id)).size, 146);
  const untouched = WEAPONS.filter(weapon => weapon.statsPolicy === 'legacy-generated-pending-review');
  assert.equal(untouched.length, 142);
  const m41a2 = WEAPONS.find(weapon => weapon.id === 'weapon-002-m41a2-pulse-rifle');
  assert.equal(m41a2.magazine, 18);
  assert.equal(m41a2.statsPolicy, 'legacy-generated-pending-review');
});
