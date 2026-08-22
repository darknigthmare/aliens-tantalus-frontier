import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMIES } from '../src/content-core-v50.js';
import {
  ENEMY_VISUAL_ARCHETYPES,
  ENEMY_VISUAL_PROFILE_COUNT,
  enemyVisualCoverageReport,
  resolveEnemyArchetype,
  resolveEnemyVisualProfile,
  resolveLegacyEnemyCell
} from '../src/enemy-visual-runtime-v53.js';
import { resolveEnemyAnimation } from '../src/sprite-animation-runtime.js';

const EXPECTED = new Map([
  ['Ovomorph', ['xenoDrone', null, null]], ['Facehugger', ['facehugger', null, null]],
  ['Chestburster', ['xenoDrone', null, null]], ['Drone / Big Chap', ['xenoDrone', null, null]],
  ['Warrior', ['xenoWarrior', null, null]], ['Runner', ['xenoDrone', null, null]],
  ['Praetorian', ['xenoDrone', null, null]], ['Queen', ['xenoQueen', null, null]],
  ['Crusher', ['xenoDrone', null, null]], ['Spitter', ['xenoDrone', null, null]],
  ['Lurker', ['xenoDrone', null, null]], ['Carrier', ['xenoDrone', null, null]],
  ['Ravager', ['xenoDrone', null, null]], ['Boiler', ['xenoDrone', null, null]],
  ['Prowler', ['xenoDrone', null, null]], ['Burster', ['xenoDrone', null, null]],
  ['Monica Line', ['xenoDrone', null, null]], ['Specimen Six Line', ['xenoDrone', null, null]],
  ['Red Xenomorph', ['legacy', 'neuroXeno', 0]], ['K-Series Yellow Xenomorph', ['legacy', 'neuroXeno', 1]],
  ['Neuro-Xeno Drone', ['legacy', 'neuroXeno', 3]], ['Xenoborg', ['legacy', 'neuroXeno', 2]],
  ['ATARAX Ripper', ['legacy', 'neuroXeno', 2]], ['Ripper Queen', ['xenoQueen', null, null]],
  ['Foundry Drone', ['xenoDrone', null, null]], ['Foundry Crusher', ['xenoDrone', null, null]],
  ['Reef Stalker', ['xenoDrone', null, null]], ['Reef Spitter', ['xenoDrone', null, null]],
  ['Siege Royal', ['xenoDrone', null, null]], ['Pale Crucible Hunter', ['xenoDrone', null, null]],
  ['Dust Runner', ['xenoDrone', null, null]], ['Salvage Hive Brute', ['xenoDrone', null, null]],
  ['Arcology Lurker', ['xenoDrone', null, null]], ['Caravan Stalker', ['xenoDrone', null, null]],
  ['Trilobite Echo', ['legacy', 'pathogen', 2]], ['Deacon Line', ['legacy', 'pathogen', 1]],
  ['Neomorph', ['neomorph', null, null]], ['Protomorph', ['legacy', 'pathogen', 1]],
  ['Abomination', ['legacy', 'pathogen', 2]], ['Pathogen Mimic', ['legacy', 'pathogen', 2]],
  ['Working Joe', ['workingJoe', null, null]], ['Combat Synthetic', ['legacy', 'synthetic', 2]],
  ['Weyland-Yutani Commando', ['legacy', 'human', 1]], ['UPP Vanguard', ['legacy', 'human', 2]],
  ['Seegson Security', ['legacy', 'human', 2]], ['Colonial Raider', ['legacy', 'human', 3]],
  ['ATARAX Controller', ['legacy', 'human', 3]], ['Cult Host', ['legacy', 'human', 3]],
  ['Wild Boar Host', ['legacy', 'pathogen', 3]], ['Korari Stalker', ['legacy', 'pathogen', 3]],
  ['Ceto Reef Predator', ['legacy', 'pathogen', 3]], ['Tantalus Tunnel Vermin', ['legacy', 'pathogen', 3]]
]);

const signature = (profile) => JSON.stringify([
  profile.spriteKey, profile.imageKey, profile.row, profile.identityStatus, profile.artSubject
]);

test('le registre v53 couvre exactement les 52 archétypes du catalogue', () => {
  const baseArchetypes = ENEMIES.slice(0, 52).map((enemy) => enemy.name);
  assert.equal(ENEMY_VISUAL_PROFILE_COUNT, 52);
  assert.equal(EXPECTED.size, 52);
  assert.deepEqual(ENEMY_VISUAL_ARCHETYPES, baseArchetypes);
  assert.deepEqual([...EXPECTED.keys()], baseArchetypes);
  for (const enemy of ENEMIES.slice(0, 52)) {
    const resolved = resolveEnemyVisualProfile(enemy);
    const [spriteKey, imageKey, row] = EXPECTED.get(enemy.name);
    assert.equal(resolved.archetype, enemy.name);
    assert.equal(resolved.spriteKey, spriteKey, enemy.name);
    assert.equal(resolved.imageKey, imageKey, enemy.name);
    assert.equal(resolved.row, row, enemy.name);
  }
});

test('les 568 profils gardent une identité visuelle stable quelle que soit leur variante', () => {
  assert.equal(ENEMIES.length, 568);
  const signaturesByArchetype = new Map();
  for (const enemy of ENEMIES) {
    const archetype = resolveEnemyArchetype(enemy);
    const resolved = resolveEnemyVisualProfile(enemy);
    assert.ok(EXPECTED.has(archetype), `${enemy.name}: archétype non résolu`);
    if (!signaturesByArchetype.has(archetype)) signaturesByArchetype.set(archetype, new Set());
    signaturesByArchetype.get(archetype).add(signature(resolved));
  }
  assert.equal(signaturesByArchetype.size, 52);
  for (const [archetype, signatures] of signaturesByArchetype) assert.equal(signatures.size, 1, `${archetype}: mapping instable`);
});

test('la couverture v53 conserve les comptes auditables du catalogue complet', () => {
  const report = enemyVisualCoverageReport(ENEMIES);
  assert.equal(report.total, 568);
  assert.equal(report.uniqueArchetypes, 52);
  assert.equal(report.modern, 341);
  assert.equal(report.legacy, 227);
  assert.deepEqual(report.bySpriteKey, {
    xenoDrone: 275, facehugger: 11, xenoWarrior: 11, xenoQueen: 22,
    legacy: 227, neomorph: 11, workingJoe: 11
  });
  assert.deepEqual(report.byImageKey, { neuroXeno: 55, pathogen: 95, synthetic: 11, human: 66 });
  assert.deepEqual(report.byIdentityStatus, { 'missing-dedicated-art': 297, exact: 66, 'authored-family': 205 });
});

test('le Combat Synthetic ne devient jamais silencieusement un Working Joe', () => {
  for (const name of ['Combat Synthetic', 'Combat Synthetic Alpha']) {
    const resolved = resolveEnemyVisualProfile({ name, biology: 'synthetic' });
    assert.deepEqual([resolved.spriteKey, resolved.imageKey, resolved.row], ['legacy', 'synthetic', 2]);
  }
});

test('les identités neuro-xéno utilisent des lignes fixes et ne retombent pas sur Drone', () => {
  const expectedRows = new Map([
    ['Red Xenomorph', 0], ['K-Series Yellow Xenomorph', 1], ['Neuro-Xeno Drone', 3], ['Xenoborg', 2], ['ATARAX Ripper', 2]
  ]);
  for (const [name, row] of expectedRows) {
    const resolved = resolveEnemyVisualProfile({ name, biology: 'xenomorph' });
    assert.deepEqual([resolved.spriteKey, resolved.imageKey, resolved.row], ['legacy', 'neuroXeno', row], name);
    assert.equal(resolveEnemyAnimation({ ...resolved, biology: 'xenomorph', alive: true }), null, name);
  }
});

test('la cellule legacy garde sa ligne d’identité à la mort', () => {
  const enemy = { visualRow: 2, animationPhase: 3, alert: true, alive: true };
  const alive = resolveLegacyEnemyCell(enemy, 1.25);
  const dead = resolveLegacyEnemyCell({ ...enemy, alive: false }, 1.25);
  assert.equal(alive.row, 2);
  assert.equal(dead.row, 2);
  assert.equal(dead.frame, 3);
  assert.ok(alive.frame >= 0 && alive.frame <= 3);
});

test('aucune approximation ou famille inconnue ne reste silencieuse', () => {
  for (const enemy of ENEMIES) {
    const resolved = resolveEnemyVisualProfile(enemy);
    assert.equal(resolved.approximate, resolved.identityStatus !== 'exact');
    if (resolved.approximate) assert.ok(resolved.fallbackReason?.length > 20, enemy.name);
    else assert.equal(resolved.fallbackReason, null, enemy.name);
  }
  const unknownFamilies = [
    [{ name: 'Unknown Synthetic', biology: 'synthetic' }, 'synthetic', 2],
    [{ name: 'Unknown Human', biology: 'human' }, 'human', 0],
    [{ name: 'Unknown Pathogen', biology: 'pathogen' }, 'pathogen', 2],
    [{ name: 'Unknown Fauna', biology: 'fauna' }, 'pathogen', 3]
  ];
  for (const [source, imageKey, row] of unknownFamilies) {
    const resolved = resolveEnemyVisualProfile(source);
    assert.equal(resolved.identityStatus, 'missing-dedicated-art');
    assert.equal(resolved.approximate, true);
    assert.equal(resolved.imageKey, imageKey);
    assert.equal(resolved.row, row);
    assert.ok(resolved.fallbackReason.includes('explicitement signalé'));
  }
});
