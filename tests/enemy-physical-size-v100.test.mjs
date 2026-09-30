import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMIES } from '../src/content-core-v50.js';
import { ENEMY_PHYSICAL_SIZE_REFERENCES_V100, getEnemyPhysicalSizeV100 } from '../src/enemy-physical-size-v100.js';

test('V100 preserves conversation targets as unverified dossier metadata', () => {
  const expected = new Map([
    ['Ovomorph', 0.90], ['Facehugger', 1.05], ['Drone / Big Chap', 2.25],
    ['Runner', 1.15], ['Praetorian', 3.00], ['Queen', 4.30], ['Crusher', 2.20],
    ['Wild Boar Host', 0.85], ['Newborn', 2.40], ['Offspring', 2.50]
  ]);
  for (const [name, target] of expected) {
    const size = getEnemyPhysicalSizeV100(name);
    assert.equal(size.targetMeters, target, name);
    assert.equal(size.source, 'conversation-candidate-2026-09-28');
    assert.equal(size.sourceThreadId, '6aba9faf-698c-83eb-b9b4-819c71560995');
    assert.equal(size.status, 'estimated-unverified');
    assert.equal(size.canonVerified, false);
    assert.equal(size.appliesToGameplay, false);
    assert.equal(size.requiresMeasurement, false);
  }
  assert.equal(ENEMY_PHYSICAL_SIZE_REFERENCES_V100.length, 13);
  assert.deepEqual(getEnemyPhysicalSizeV100('Wild Boar Host').rangeMeters, { min: 0.55, max: 1.10 });
  assert.equal(getEnemyPhysicalSizeV100('Queen').rangeMeters, null, 'no fabricated range');
});

test('V100 adult mutation labels inherit exactly, with no size multiplier', () => {
  let count = 0;
  for (const reference of ENEMY_PHYSICAL_SIZE_REFERENCES_V100) {
    const baseEnemy = ENEMIES.find((enemy) => enemy.id === reference.baseArchetypeId);
    assert.ok(baseEnemy, reference.baseArchetypeId);
    for (const enemy of ENEMIES.filter((entry) => entry.modifier !== 'Standard'
      && entry.modifier !== 'Juvenile' && entry.name === `${entry.modifier} ${baseEnemy.name}`)) {
      assert.equal(getEnemyPhysicalSizeV100(enemy), reference, enemy.name);
      count += 1;
    }
  }
  assert.ok(count > 50);
  for (const modifier of ['Albino', 'Armored', 'Elder', 'Neuro-Linked']) {
    assert.equal(getEnemyPhysicalSizeV100(`${modifier} Queen`), getEnemyPhysicalSizeV100('Queen'));
  }
});

test('V100 axial parasite/body length is never a height', () => {
  for (const name of ['Facehugger', 'Chestburster', 'Trilobite Echo', 'Ceto Reef Predator']) {
    const size = getEnemyPhysicalSizeV100(name);
    assert.equal(size.measurementType, 'axial-length', name);
    assert.notEqual(size.axis, 'vertical');
    assert.equal('heightMeters' in size, false);
    assert.equal('renderHeight' in size, false);
    assert.equal('bodyHeight' in size, false);
  }
  assert.equal(getEnemyPhysicalSizeV100('Facehugger').targetMeters, 1.05);
  for (const name of ['Chestburster', 'Trilobite Echo', 'Ceto Reef Predator']) {
    assert.equal(getEnemyPhysicalSizeV100(name).targetMeters, null);
    assert.equal(getEnemyPhysicalSizeV100(name).requiresMeasurement, true);
  }
  assert.equal(getEnemyPhysicalSizeV100('Runner').posture, 'quadrupedal');
  assert.equal(getEnemyPhysicalSizeV100('Queen').posture, 'standing-without-ovipositor');
});

test('V100 juvenile variants have separate unresolved measurements, never double-shrunk larvae', () => {
  for (const name of ['Drone / Big Chap', 'Queen', 'Facehugger', 'Chestburster', 'Ovomorph']) {
    const juvenile = getEnemyPhysicalSizeV100(`Juvenile ${name}`);
    const base = getEnemyPhysicalSizeV100(name);
    assert.ok(juvenile, name);
    assert.notEqual(juvenile, base);
    assert.equal(juvenile.lifeStage, 'juvenile-variant');
    assert.equal(juvenile.targetMeters, null);
    assert.equal(juvenile.rangeMeters, null);
    assert.equal(juvenile.requiresMeasurement, true);
    assert.equal(juvenile.baseArchetypeId, base.baseArchetypeId);
    assert.equal('multiplier' in juvenile, false);
  }
  assert.equal(getEnemyPhysicalSizeV100('Chestburster').lifeStage, 'larval');
});

test('V100 resolver accepts known ids/entries only and never guesses related royal or hybrid names', () => {
  const queen = getEnemyPhysicalSizeV100('Queen');
  assert.equal(getEnemyPhysicalSizeV100('enemy-008-queen'), queen);
  assert.equal(getEnemyPhysicalSizeV100({ profileId: 'enemy-008-queen' }), queen);
  assert.equal(getEnemyPhysicalSizeV100({ id: 'enemy-008-queen', name: 'Juvenile Queen', modifier: 'Juvenile' }), queen);
  for (const entry of [null, undefined, 0, {}, [], 'unknown', 'Ripper Queen', 'Neuro-Xeno Drone',
    'Warrior', 'enemy-571-predalien', { id: 'unregistered', name: 'Queen' }, { name: 'Queen' }]) {
    assert.equal(getEnemyPhysicalSizeV100(entry), null);
  }
});

test('V100 exported references and every resolved nested measurement are immutable', () => {
  assert.ok(Object.isFrozen(ENEMY_PHYSICAL_SIZE_REFERENCES_V100));
  for (const enemy of ENEMIES) {
    const size = getEnemyPhysicalSizeV100(enemy);
    if (!size) continue;
    assert.ok(Object.isFrozen(size));
    assert.ok(Object.isFrozen(size.notes));
    if (size.rangeMeters) assert.ok(Object.isFrozen(size.rangeMeters));
    assert.throws(() => { size.targetMeters = 99; }, TypeError);
  }
  assert.throws(() => { getEnemyPhysicalSizeV100('Wild Boar Host').rangeMeters.min = 99; }, TypeError);
});
