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
  ['Ovomorph', ['ovomorph', null, null]], ['Facehugger', ['facehugger', null, null]],
  ['Chestburster', ['chestburster', null, null]], ['Drone / Big Chap', ['xenoBigChapV56', null, null]],
  ['Warrior', ['xenoWarriorV56', null, null]], ['Runner', ['xenoRunner', null, null]],
  ['Praetorian', ['xenoPraetorian', null, null]], ['Queen', ['xenoQueenV56', null, null]],
  ['Crusher', ['xenoCrusher', null, null]], ['Spitter', ['xenoSpitter', null, null]],
  ['Lurker', ['xenoLurker', null, null]], ['Carrier', ['xenoCarrier', null, null]],
  ['Ravager', ['xenoRavager', null, null]], ['Boiler', ['xenoBoilerV56', null, null]],
  ['Prowler', ['xenoProwlerV56', null, null]], ['Burster', ['xenoBursterV56', null, null]],
  ['Monica Line', ['monicaLineV56', null, null]], ['Specimen Six Line', ['specimenSixLineV56', null, null]],
  ['Red Xenomorph', ['legacy', 'neuroXeno', 0]], ['K-Series Yellow Xenomorph', ['legacy', 'neuroXeno', 1]],
  ['Neuro-Xeno Drone', ['neuroXenoDroneV56', null, null]], ['Xenoborg', ['xenoborgV56', null, null]],
  ['ATARAX Ripper', ['ataraxRipperV56', null, null]], ['Ripper Queen', ['ripperQueen', null, null]],
  ['Foundry Drone', ['foundryDroneV56', null, null]], ['Foundry Crusher', ['foundryCrusherV56', null, null]],
  ['Reef Stalker', ['reefStalkerV56', null, null]], ['Reef Spitter', ['reefSpitterV56', null, null]],
  ['Siege Royal', ['siegeRoyalV56', null, null]], ['Pale Crucible Hunter', ['paleCrucibleHunter', null, null]],
  ['Dust Runner', ['dustRunnerV56', null, null]], ['Salvage Hive Brute', ['salvageHiveBruteV56', null, null]],
  ['Arcology Lurker', ['arcologyLurkerV56', null, null]], ['Caravan Stalker', ['caravanStalkerV56', null, null]],
  ['Trilobite Echo', ['trilobiteEchoV56', null, null]], ['Deacon Line', ['deaconLineV56', null, null]],
  ['Neomorph', ['neomorph', null, null]], ['Protomorph', ['protomorphV56', null, null]],
  ['Abomination', ['pathogenAbominationV56', null, null]], ['Pathogen Mimic', ['pathogenMimic', null, null]],
  ['Working Joe', ['workingJoe', null, null]], ['Combat Synthetic', ['legacy', 'synthetic', 2]],
  ['Weyland-Yutani Commando', ['weylandYutaniCommandoV56', null, null]], ['UPP Vanguard', ['uppVanguardV56', null, null]],
  ['Seegson Security', ['seegsonSecurityV56', null, null]], ['Colonial Raider', ['colonialRaiderV56', null, null]],
  ['ATARAX Controller', ['ataraxControllerV56', null, null]], ['Cult Host', ['cultHostV56', null, null]],
  ['Wild Boar Host', ['wildBoarHostV56', null, null]], ['Korari Stalker', ['korariStalkerV56', null, null]],
  ['Ceto Reef Predator', ['cetoReefPredatorV56', null, null]], ['Tantalus Tunnel Vermin', ['tantalusTunnelVerminV56', null, null]],
  ['Newborn', ['newbornV64', null, null]], ['Offspring', ['offspringV64', null, null]],
  ['Predalien', ['predalienV64', null, null]]
]);

const signature = (profile) => JSON.stringify([
  profile.spriteKey, profile.imageKey, profile.row, profile.artSubject
]);

test('le registre visuel couvre exactement les 55 archétypes du catalogue V64', () => {
  const baseEnemies = ENEMIES.filter((enemy) => enemy.modifier === 'Standard');
  const baseArchetypes = baseEnemies.map((enemy) => enemy.name);
  assert.equal(ENEMY_VISUAL_PROFILE_COUNT, 55);
  assert.equal(EXPECTED.size, 55);
  assert.deepEqual(ENEMY_VISUAL_ARCHETYPES, baseArchetypes);
  assert.deepEqual([...EXPECTED.keys()], baseArchetypes);
  for (const enemy of baseEnemies) {
    const resolved = resolveEnemyVisualProfile(enemy);
    const [spriteKey, imageKey, row] = EXPECTED.get(enemy.name);
    assert.equal(resolved.archetype, enemy.name);
    assert.equal(resolved.spriteKey, spriteKey, enemy.name);
    assert.equal(resolved.imageKey, imageKey, enemy.name);
    assert.equal(resolved.row, row, enemy.name);
  }
});

test('les 571 profils gardent une identité visuelle stable quelle que soit leur variante', () => {
  assert.equal(ENEMIES.length, 571);
  const signaturesByArchetype = new Map();
  for (const enemy of ENEMIES) {
    const archetype = resolveEnemyArchetype(enemy);
    const resolved = resolveEnemyVisualProfile(enemy);
    assert.ok(EXPECTED.has(archetype), `${enemy.name}: archétype non résolu`);
    if (!signaturesByArchetype.has(archetype)) signaturesByArchetype.set(archetype, new Set());
    signaturesByArchetype.get(archetype).add(signature(resolved));
  }
  assert.equal(signaturesByArchetype.size, 55);
  for (const [archetype, signatures] of signaturesByArchetype) assert.equal(signatures.size, 1, `${archetype}: mapping instable`);
});

test('la couverture v53 conserve les comptes auditables du catalogue complet', () => {
  const report = enemyVisualCoverageReport(ENEMIES);
  assert.equal(report.total, 571);
  assert.equal(report.uniqueArchetypes, 55);
  assert.equal(report.modern, 538);
  assert.equal(report.legacy, 33);
  assert.deepEqual(report.bySpriteKey, {
    ovomorph: 11, facehugger: 11, chestburster: 11, xenoBigChapV56: 11, xenoWarriorV56: 11,
    xenoRunner: 11, xenoPraetorian: 11, xenoQueenV56: 11, xenoCrusher: 11, xenoSpitter: 11,
    xenoLurker: 11, xenoCarrier: 11, xenoRavager: 11, xenoBoilerV56: 11, xenoProwlerV56: 11,
    xenoBursterV56: 11, monicaLineV56: 11, specimenSixLineV56: 11, legacy: 33,
    neuroXenoDroneV56: 11, xenoborgV56: 11, ataraxRipperV56: 11, ripperQueen: 11,
    foundryDroneV56: 11, foundryCrusherV56: 11,
    reefStalkerV56: 11, reefSpitterV56: 11, siegeRoyalV56: 11, paleCrucibleHunter: 11,
    dustRunnerV56: 11, salvageHiveBruteV56: 11, arcologyLurkerV56: 11, caravanStalkerV56: 11,
    trilobiteEchoV56: 11, deaconLineV56: 11, neomorph: 11, protomorphV56: 11,
    pathogenAbominationV56: 11, pathogenMimic: 11, workingJoe: 11, weylandYutaniCommandoV56: 11,
    uppVanguardV56: 11, seegsonSecurityV56: 11, colonialRaiderV56: 11,
    ataraxControllerV56: 11, cultHostV56: 11, wildBoarHostV56: 10,
    korariStalkerV56: 10, cetoReefPredatorV56: 10, tantalusTunnelVerminV56: 10,
    newbornV64: 1, offspringV64: 1, predalienV64: 1
  });
  assert.deepEqual(report.byImageKey, { neuroXeno: 22, synthetic: 11 });
  assert.deepEqual(report.byIdentityStatus, {
    exact: 29,
    'source-locked-adaptation': 1,
    'project-adaptation': 18,
    'project-original': 7,
    'authored-family': 516
  });
});

test('Pathogen Mimic et Pale Crucible Hunter gardent leur plaque mais seuls leurs profils de base sont exacts', () => {
  const expected = new Map([
    ['Pathogen Mimic', ['pathogenMimic', 'enemy.pathogen-mimic.action']],
    ['Pale Crucible Hunter', ['paleCrucibleHunter', 'enemy.pale-crucible-hunter.action']]
  ]);
  for (const [archetype, [spriteKey, sheetId]] of expected) {
    const variants = ENEMIES.filter((enemy) => resolveEnemyArchetype(enemy) === archetype);
    assert.equal(variants.length, 11, archetype);
    for (const enemy of variants) {
      const resolved = resolveEnemyVisualProfile(enemy);
      assert.equal(resolved.spriteKey, spriteKey, enemy.name);
      assert.equal(resolved.sheetId, sheetId, enemy.name);
      const isBase = Number(enemy.id.match(/^enemy-(\d+)-/)?.[1]) <= 52;
      assert.equal(resolved.identityStatus, isBase ? 'exact' : 'authored-family', enemy.name);
      assert.equal(resolved.approximate, !isBase, enemy.name);
      if (isBase) assert.equal(resolved.fallbackReason, null, enemy.name);
      else assert.match(resolved.fallbackReason, /modifier systémique/, enemy.name);
    }
  }
});

test('Runner et Ripper Queen utilisent leurs plaques v54 dans toutes les phases', () => {
  assert.equal(resolveEnemyAnimation({ spriteKey: 'xenoRunner', alive: true, alert: true }).sheetId, 'enemy.xenomorph-runner.action');
  assert.equal(resolveEnemyAnimation({ spriteKey: 'xenoRunner', alive: true, attacking: true }).clipId, 'pounce-bite');
  assert.equal(resolveEnemyAnimation({ spriteKey: 'ripperQueen', alive: true, attacking: true }).sheetId, 'enemy.ripper-queen.action');
  assert.equal(resolveEnemyAnimation({ spriteKey: 'ripperQueen', alive: false }).clipId, 'wounded-death');
});

test('le Combat Synthetic ne devient jamais silencieusement un Working Joe', () => {
  for (const name of ['Combat Synthetic', 'Combat Synthetic Alpha']) {
    const resolved = resolveEnemyVisualProfile({ name, biology: 'synthetic' });
    assert.deepEqual([resolved.spriteKey, resolved.imageKey, resolved.row], ['legacy', 'synthetic', 2]);
  }
});

test('les identités neuro-xéno legacy utilisent des lignes fixes et ne retombent pas sur Drone', () => {
  const expectedRows = new Map([
    ['Red Xenomorph', 0], ['K-Series Yellow Xenomorph', 1]
  ]);
  for (const [name, row] of expectedRows) {
    const resolved = resolveEnemyVisualProfile({ name, biology: 'xenomorph' });
    assert.deepEqual([resolved.spriteKey, resolved.imageKey, resolved.row], ['legacy', 'neuroXeno', row], name);
    assert.equal(resolveEnemyAnimation({ ...resolved, biology: 'xenomorph', alive: true }), null, name);
  }
});

test('Xenoborg utilise son atlas V56 exact au lieu de la ligne neuro-xéno legacy', () => {
  const xenoborg = resolveEnemyVisualProfile({ name: 'Xenoborg', biology: 'xenomorph' });
  assert.deepEqual([xenoborg.spriteKey, xenoborg.imageKey, xenoborg.row], ['xenoborgV56', null, null]);
  assert.equal(xenoborg.identityStatus, 'exact');
  assert.equal(
    resolveEnemyAnimation({ ...xenoborg, visualSheetId: xenoborg.sheetId, alive: true }).sheetId,
    'enemy.xenoborg.action.v56'
  );
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
    assert.equal(
      resolved.approximate,
      ['authored-family', 'missing-dedicated-art'].includes(resolved.identityStatus),
      enemy.name
    );
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
