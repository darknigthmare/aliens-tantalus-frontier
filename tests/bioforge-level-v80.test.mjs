import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BIOFORGE_DOOR_IDS_V80,
  BIOFORGE_LEVEL_V80,
  BIOFORGE_MAX_SPAWNS_V80,
  BIOFORGE_ROOM_IDS_V80,
  BIOFORGE_VIEWPORT_V80,
  BIOFORGE_WORLD_V80,
  confineBioforgeSpecimenV80,
  createBioforgeLevelV80,
  getBioforgeDoorStateV80,
  isInsideBioforgeArenaV80,
  placeBioforgeSpecimenV80,
  syncBioforgeDoorsV80,
  validateBioforgeLevelV80
} from '../src/bioforge-level-v80.js';

test('le niveau BIOFORGE est un monde 2D borné 1280x720 avec contrôle, double sas, printer, arène et retour', () => {
  const level = createBioforgeLevelV80();
  const report = validateBioforgeLevelV80(level);

  assert.deepEqual(level.viewport, BIOFORGE_VIEWPORT_V80);
  assert.deepEqual(level.world, BIOFORGE_WORLD_V80);
  assert.equal(report.valid, true, report.errors.join(', '));
  assert.deepEqual(level.rooms.map(({ id }) => id), [...BIOFORGE_ROOM_IDS_V80]);
  assert.deepEqual(level.doors.map(({ id }) => id), [...BIOFORGE_DOOR_IDS_V80]);
  assert.ok(level.rooms.find(({ id }) => id === 'airlock-inner'));
  assert.ok(level.rooms.find(({ id }) => id === 'airlock-outer'));
  assert.equal(level.spawnSlots.length, BIOFORGE_MAX_SPAWNS_V80);
  assert.equal('vehicle' in level, false);
  assert.equal('pickup' in level, false);
  assert.equal('campaign' in level, false);
});

test('les sas restent fermés pendant le cycle et la sortie ne s ouvre qu après purge', () => {
  const level = createBioforgeLevelV80();
  for (const phase of ['sealing', 'printing', 'combat', 'result', 'purging']) {
    syncBioforgeDoorsV80(level, phase);
    assert.ok(level.doors.filter(({ id }) => id !== 'hub-return').every(({ open }) => open === false));
    assert.equal(level.doors.find(({ id }) => id === 'arena-return').locked, true);
  }

  assert.deepEqual(getBioforgeDoorStateV80('arena-return', 'combat'), {
    open: false,
    locked: true,
    reason: 'combat-active'
  });
  syncBioforgeDoorsV80(level, 'return');
  assert.equal(level.doors.find(({ id }) => id === 'arena-return').open, true);
  assert.equal(level.doors.find(({ id }) => id === 'hub-return').open, true);
  assert.ok(level.doors.filter(({ id }) => !['arena-return', 'hub-return'].includes(id)).every(({ open }) => open === false));
});

test('les douze poses sont uniques, confinées et tournées vers le joueur', () => {
  const level = createBioforgeLevelV80();
  const specimens = level.spawnSlots.map((slot, index) => placeBioforgeSpecimenV80({ id: `specimen-${index + 1}`, w: 52, h: 82 }, index, level));
  const occupied = new Set();

  assert.equal(specimens.length, BIOFORGE_MAX_SPAWNS_V80);
  for (const specimen of specimens) {
    assert.ok(specimen);
    assert.equal(isInsideBioforgeArenaV80(specimen, level), true);
    assert.equal(specimen.facing, -1, `${specimen.id} doit regarder l opérateur placé à gauche`);
    assert.equal(occupied.has(specimen.bioforgeSpawnSlotIdV80), false);
    occupied.add(specimen.bioforgeSpawnSlotIdV80);
  }
});

test('le confinement corrige toute tentative de sortie sans redimensionner le spécimen', () => {
  const level = createBioforgeLevelV80();
  const specimen = { x: -900, y: 9999, w: 72, h: 110, vx: -800, vy: 900 };
  confineBioforgeSpecimenV80(specimen, level);

  assert.equal(isInsideBioforgeArenaV80(specimen, level), true);
  assert.deepEqual({ w: specimen.w, h: specimen.h }, { w: 72, h: 110 });
  assert.equal(specimen.vx, 0);
  assert.equal(specimen.vy, 0);
  assert.equal(specimen.bioforgeContainedV80, true);
});

test('le plan auteur reste gelé tandis qu une instance runtime est indépendante', () => {
  const first = createBioforgeLevelV80();
  const second = createBioforgeLevelV80();
  first.doors[0].open = true;

  assert.equal(Object.isFrozen(BIOFORGE_LEVEL_V80), true);
  assert.equal(Object.isFrozen(BIOFORGE_LEVEL_V80.rooms), true);
  assert.equal(second.doors[0].open, undefined);
  assert.equal(BIOFORGE_LEVEL_V80.doors[0].open, undefined);
});
