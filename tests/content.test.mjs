import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONTENT_COUNTS, CONTENT_TARGETS, WORLDS, CAMPAIGNS, WEAPONS, EQUIPMENT, ENEMIES, VEHICLES,
  CREW, COSTUMES, LEVEL_SEEDS, APEX_DOSSIERS, NEURO_XENO_PROFILES, validateContent
} from '../src/content.js';

test('v46 additive content contract is exact', () => {
  assert.deepEqual(CONTENT_COUNTS, CONTENT_TARGETS);
  assert.deepEqual(validateContent(), { ok: true, failures: [], counts: CONTENT_COUNTS });
});

test('every MIRE archive has exactly one Frontier counterpart', () => {
  const pairs = new Map();
  for (const campaign of CAMPAIGNS.filter((item) => item.pairId)) {
    if (!pairs.has(campaign.pairId)) pairs.set(campaign.pairId, []);
    pairs.get(campaign.pairId).push(campaign.mode);
  }
  assert.equal(pairs.size, 206);
  for (const modes of pairs.values()) assert.deepEqual(modes.sort(), ['FRONTIER', 'MIRE']);
  assert.equal(CAMPAIGNS.filter((item) => !item.pairId).length, 24);
});

test('catalog relationships and gameplay payloads are usable', () => {
  const worldIds = new Set(WORLDS.map((world) => world.id));
  assert.ok(CAMPAIGNS.every((campaign) => worldIds.has(campaign.worldId)));
  assert.ok(LEVEL_SEEDS.every((level) => worldIds.has(level.worldId) && level.name && level.routes >= 3));
  assert.ok(VEHICLES.every((vehicle) => vehicle.seats.length > 0 && vehicle.seats[0].role === 'driver'));
  assert.ok(WEAPONS.every((weapon) => weapon.damage > 0 && weapon.magazine > 0));
  assert.ok(EQUIPMENT.every((item) => item.charges > 0));
  assert.ok(ENEMIES.some((enemy) => enemy.name.includes('Queen')));
  assert.ok(ENEMIES.some((enemy) => enemy.name.includes('K-Series')));
  assert.equal(CREW.length, 16); assert.equal(COSTUMES.length, 392);
  assert.equal(APEX_DOSSIERS.length, 244); assert.equal(NEURO_XENO_PROFILES.length, 234);
});
