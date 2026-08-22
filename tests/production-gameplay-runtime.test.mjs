import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GameEngine,
  buildAccessibilityRuntime,
  buildCostumeRuntime,
  buildEnemyEncounterEligibility,
  buildEquipmentActionRuntime,
  buildLevelRouteRuntime,
  buildVehicleHandlingProfile,
  buildWeaponBallisticsRuntime,
  selectEnemyEncounterCatalog,
  shouldSpawnApex
} from '../src/game-production-runtime.js';
import {
  APEX_DOSSIERS,
  CAMPAIGNS,
  COSTUMES,
  CREW,
  ENEMIES,
  EQUIPMENT,
  LEVEL_SEEDS,
  NEURO_XENO_PROFILES,
  VEHICLES,
  WEAPONS,
  WORLDS
} from '../src/content.js';

class MockImage {
  constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; }
  set src(value) { this.currentSrc = value; }
}

function withBrowserMocks(run) {
  const previous = { Image: globalThis.Image, addEventListener: globalThis.addEventListener, requestAnimationFrame: globalThis.requestAnimationFrame };
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try { return run(); } finally {
    globalThis.Image = previous.Image;
    globalThis.addEventListener = previous.addEventListener;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
  }
}

function createEngine(events = []) {
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
  return new GameEngine(canvas, { onEvent: (event) => events.push(event) });
}

function options(overrides = {}) {
  const world = overrides.world || WORLDS.find((entry) => entry.biomes.includes('industrial')) || WORLDS[0];
  const campaign = overrides.campaign || { ...CAMPAIGNS[1], id: 'production-runtime-test', mode: 'FRONTIER', objective: 'restore atmospheric processing', worldId: world.id, routes: 5 };
  const levelSeed = overrides.levelSeed || { ...LEVEL_SEEDS.find((entry) => entry.worldId === world.id), id: 'production-level-test', worldId: world.id, width: 8, height: 6, routes: 5, hazards: ['acid', 'darkness'], objective: campaign.objective, seed: 510051 };
  return {
    campaign,
    world,
    levelSeed,
    weapon: overrides.weapon || WEAPONS[0],
    enemyCatalog: overrides.enemyCatalog || ENEMIES,
    vehicle: overrides.vehicle || VEHICLES[0],
    equipment: overrides.equipment || EQUIPMENT.slice(0, 8),
    crew: overrides.crew || CREW,
    difficulty: 'standard',
    ...overrides
  };
}

test('six vehicle families compile to distinct handling and move on their promised axes', () => withBrowserMocks(() => {
  const families = ['ground', 'air', 'space', 'maritime', 'rail', 'exosuit'];
  const locomotions = new Set();
  for (const family of families) {
    const source = VEHICLES.find((vehicle) => vehicle.family === family);
    const profile = buildVehicleHandlingProfile(source);
    assert.equal(profile.family, family);
    locomotions.add(profile.locomotion);
    const engine = createEngine();
    engine.start(options({ vehicle: source, enemyCatalog: ENEMIES.slice(0, 120) }));
    Object.assign(engine.player, { x: engine.vehicle.x, y: engine.vehicle.y });
    assert.equal(engine.toggleVehicle(engine.player), true, family);
    const before = { x: engine.vehicle.x, y: engine.vehicle.y, depth: engine.vehicle.depth };
    const key = family === 'maritime' ? 'KeyS' : family === 'air' || family === 'space' || family === 'exosuit' ? 'KeyW' : 'KeyD';
    engine.keys.add(key);
    engine.updateVehicleDriver(engine.player, 0.2, { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space', fire: 'KeyF' });
    engine.keys.delete(key);
    if (family === 'ground' || family === 'rail') assert.ok(engine.vehicle.x > before.x, family);
    if (family === 'air' || family === 'space' || family === 'exosuit') assert.ok(engine.vehicle.y < before.y, family);
    if (family === 'maritime') assert.ok(engine.vehicle.depth > before.depth, family);
    assert.equal(engine.getSnapshot().vehicleHandling.locomotion, profile.locomotion);
    assert.ok(engine.getSnapshot().vehicleHandling.seats.length >= 1);
  }
  assert.equal(locomotions.size, families.length);
}));

test('level dimensions, routes, biomes and every declared hazard build visible deterministic geometry', () => {
  const world = { ...WORLDS[0], biomes: ['cryogenic', 'hive'], danger: 9, atmosphere: 'thin' };
  const compact = buildLevelRouteRuntime({ campaign: { id: 'c', mode: 'FRONTIER', routes: 3 }, world, level: { id: 'compact', seed: 10, width: 3, height: 2, routes: 3, hazards: ['acid'] } });
  const expansive = buildLevelRouteRuntime({ campaign: { id: 'e', mode: 'SURVIVAL', routes: 6 }, world, level: { id: 'expansive', seed: 11, width: 12, height: 8, routes: 6, hazards: ['acid', 'vacuum', 'fire', 'steam', 'radiation', 'flood', 'darkness'] } });
  assert.notEqual(compact.signature, expansive.signature);
  assert.ok(expansive.platforms.length > compact.platforms.length);
  assert.ok(expansive.maxTier > compact.maxTier);
  assert.ok(expansive.ladders.length > compact.ladders.length);
  assert.equal(expansive.routes, 6);
  assert.equal(expansive.palette.id, 'cryogenic');
  for (const kind of expansive.declaredHazards) assert.ok(expansive.hazards.some((hazard) => hazard.kind === kind), kind);
  assert.ok(expansive.biomeZones.length >= 6);
});

test('all 106 equipment entries have a charged gameplay action and can mutate the live mission', () => withBrowserMocks(() => {
  const contracts = EQUIPMENT.map(buildEquipmentActionRuntime);
  assert.equal(contracts.length, 106);
  assert.equal(new Set(contracts.map((entry) => entry.id)).size, 106);
  for (const contract of contracts) {
    assert.ok(contract.action, contract.id);
    assert.ok(contract.charges > 0, contract.id);
    assert.ok(contract.magnitude > 0, contract.id);
  }
  const events = [];
  const engine = createEngine(events);
  engine.start(options({ equipment: EQUIPMENT, enemyCatalog: ENEMIES.slice(0, 180) }));
  engine.player.health = 20;
  engine.player.armor = 0;
  engine.environmentStatus.oxygen = 5;
  for (const item of EQUIPMENT) assert.equal(engine.useEquipment(item.id), true, item.id);
  const snapshot = engine.getSnapshot();
  assert.equal(snapshot.equipmentRuntime.length, EQUIPMENT.length);
  assert.ok(snapshot.equipmentRuntime.every((item) => item.uses === 1));
  assert.ok(snapshot.equipmentRuntime.every((item) => item.remaining === item.maxCharges - 1));
  assert.equal(events.filter((event) => event.type === 'equipment-used').length, EQUIPMENT.length);
  assert.ok(snapshot.fieldEffects.scans > 0);
  assert.ok(snapshot.fieldEffects.repairs > 0);
  assert.ok(snapshot.equipmentDeployments.length > 0);
}));

test('all 392 costumes compile armor, mobility, stealth, faction, provenance and a visual marking', () => withBrowserMocks(() => {
  for (const costume of COSTUMES) {
    const runtime = buildCostumeRuntime(costume);
    assert.equal(runtime.id, costume.id);
    assert.ok(runtime.armor >= 0, costume.id);
    assert.ok(runtime.mobility > 0, costume.id);
    assert.ok(runtime.stealth >= 0, costume.id);
    assert.ok(runtime.faction, costume.id);
    assert.equal(runtime.provenance, costume.provenance);
    assert.match(runtime.visual.primary, /^#[0-9a-f]{6}$/i);
    assert.ok(runtime.visual.marking);
  }
  const costume = COSTUMES.find((entry) => /APE suit/i.test(entry.part)) || COSTUMES[0];
  const engine = createEngine();
  engine.start(options({ costume, enemyCatalog: ENEMIES.slice(0, 120) }));
  const snapshot = engine.getSnapshot();
  assert.equal(snapshot.costumeRuntime.id, costume.id);
  assert.equal(engine.player.costumeId, costume.id);
  assert.ok(engine.player.maxArmor > 100);
}));

test('dynamic stealth makes crouching and cover delay detection and emits spotted/lost events', () => withBrowserMocks(() => {
  const events = [];
  const stealthCostume = [...COSTUMES].sort((a, b) => buildCostumeRuntime(b).stealth - buildCostumeRuntime(a).stealth)[0];
  const engine = createEngine(events);
  engine.start(options({ costume: stealthCostume, enemyCatalog: ENEMIES.slice(0, 160) }));
  const enemy = engine.enemies.find((entry) => !entry.isBoss);
  Object.assign(engine.player, { vx: 0, crouching: false, inCover: false, actionClock: 0, y: 830 });
  const standing = engine.refreshStealth(engine.player).detectionRadius;
  Object.assign(engine.player, { crouching: true, inCover: true });
  const hidden = engine.refreshStealth(engine.player).detectionRadius;
  assert.ok(hidden < standing * 0.65);
  const encounterDistance = Math.min(580, Math.round((standing + hidden) / 2));
  Object.assign(enemy, { x: engine.player.x + encounterDistance, spawnX: engine.player.x + encounterDistance, y: engine.player.y, alert: false, revealed: 0, searchClock: 0 });
  engine.updateEnemy(enemy, 0.05);
  assert.equal(enemy.alert, false, 'crouched player remains hidden');
  Object.assign(engine.player, { crouching: false, inCover: false });
  engine.refreshStealth(engine.player);
  engine.updateEnemy(enemy, 0.05);
  assert.equal(enemy.alert, true, 'standing player is detected at the same range');
  assert.ok(events.some((event) => event.type === 'spotted' && event.enemyId === enemy.id));
  enemy.x = engine.player.x + 1800;
  enemy.revealed = 0;
  engine.updateEnemy(enemy, 3);
  assert.equal(enemy.alert, false);
  assert.ok(events.some((event) => event.type === 'lost' && event.enemyId === enemy.id));
}));

test('Apex dossiers use habitat, danger and deterministic spawn chance rather than unconditional boss replacement', () => {
  const context = { world: { id: 'hive-world', biomes: ['hive'], danger: 7 }, campaign: { id: 'hunt', mode: 'FRONTIER' }, levelSeed: { id: 'nest', seed: 42, hazards: ['acid'] } };
  const allowed = shouldSpawnApex({ dossier: { id: 'allowed', spawnChance: 100, restrictions: ['hive', 'danger-4'] }, ...context });
  const dangerBlocked = shouldSpawnApex({ dossier: { id: 'blocked-danger', spawnChance: 100, restrictions: ['hive', 'danger-9'] }, ...context });
  const habitatBlocked = shouldSpawnApex({ dossier: { id: 'blocked-habitat', spawnChance: 100, restrictions: ['laboratory', 'danger-2'] }, ...context });
  assert.equal(allowed.eligible, true);
  assert.equal(dangerBlocked.reason, 'danger-blocked');
  assert.equal(habitatBlocked.reason, 'habitat-blocked');
  const real = shouldSpawnApex({ dossier: APEX_DOSSIERS[0], ...context });
  assert.equal(typeof real.roll, 'number');
  assert.equal(real.checks.length, 3);
});

test('enemy frequency, habitats, encounter worlds and adaptation modifiers affect deterministic encounter selection', () => {
  const world = { ...WORLDS[0], id: 'encounter-world', biomes: ['cryogenic', 'hive'], atmosphere: 'vacuum' };
  const context = { world, campaign: { id: 'mire', mode: 'MIRE', objective: 'seal the hive' }, levelSeed: { seed: 9876, hazards: ['vacuum'], objective: 'seal the hive' } };
  for (const enemy of ENEMIES) {
    const result = buildEnemyEncounterEligibility(enemy, context);
    assert.equal(result.id, enemy.id);
    assert.ok(Number.isFinite(result.weight) && result.weight > 0, enemy.id);
    assert.equal(typeof result.frequency, 'string');
  }
  const custom = [
    { id: 'common-hive', frequency: 'common', modifier: 'Vacuum-Adapted', encounterWorldIds: [world.id], habitats: ['hive'] },
    { id: 'rare-wrong', frequency: 'rare', modifier: 'Cryo-Adapted', encounterWorldIds: ['elsewhere'], habitats: ['desert'] },
    { id: 'scripted', frequency: 'scripted', modifier: 'Standard', encounterWorldIds: [world.id], habitats: ['hive'], caste: 'hive' }
  ];
  assert.equal(buildEnemyEncounterEligibility(custom[0], context).eligible, true);
  assert.equal(buildEnemyEncounterEligibility(custom[1], context).eligible, true, 'cryo modifier is valid through biome even when the explicit world differs');
  const first = selectEnemyEncounterCatalog(ENEMIES, context, 40);
  const second = selectEnemyEncounterCatalog(ENEMIES, context, 40);
  assert.deepEqual(first.selectedIds, second.selectedIds);
  assert.ok(first.selectedIds.length >= 40);
  assert.ok(first.eligibleCount < first.totalCount);
  assert.ok(first.selected.every((enemy) => buildEnemyEncounterEligibility(enemy, context).eligible
    || (enemy.caste === 'royal' && /hive|queen|ruche|reine/i.test(`${context.campaign.objective} ${context.levelSeed.objective}`))));
});

test('boss profile remains contextual in a synthetic lockdown and never coerces a queen sprite', () => withBrowserMocks(() => {
  const world = { id: 'synthetic-station', name: 'Synthetic Station', biomes: ['industrial'], atmosphere: 'breathable', danger: 4 };
  const campaign = { id: 'synthetic-lockdown', name: 'Synthetic Lockdown', mode: 'FRONTIER', objective: 'restore synthetic security control', worldId: world.id, routes: 4 };
  const levelSeed = { id: 'synthetic-floor', worldId: world.id, seed: 510052, width: 8, height: 5, routes: 4, hazards: ['darkness'], objective: campaign.objective };
  const syntheticProfiles = [
    { id: 'joe-security', name: 'Working Joe Security', biology: 'synthetic', caste: 'security', health: 92, damage: 18, armor: 18, speed: 0.8, frequency: 'common', encounterWorldIds: [world.id], habitats: ['industrial'], behavior: 'guard' },
    { id: 'combat-synthetic-apex', name: 'Combat Synthetic Alpha', biology: 'synthetic', caste: 'assault', health: 190, damage: 34, armor: 42, speed: 1.1, frequency: 'apex', encounterWorldIds: [world.id], habitats: ['industrial'], behavior: 'control' }
  ];
  const foreignQueen = { id: 'foreign-queen', name: 'Foreign Queen', biology: 'xenomorph', caste: 'royal', health: 360, damage: 42, armor: 60, speed: 0.9, frequency: 'scripted', encounterWorldIds: ['hive-world'], habitats: ['hive'], behavior: 'rush' };
  const context = { world, campaign, levelSeed };
  const selection = selectEnemyEncounterCatalog([...syntheticProfiles, foreignQueen], context, 3);
  assert.deepEqual(new Set(selection.selectedIds), new Set(syntheticProfiles.map((entry) => entry.id)));
  assert.ok(selection.selected.every((entry) => entry.biology === 'synthetic'));

  const engine = createEngine();
  engine.start(options({ world, campaign, levelSeed, enemyCatalog: [...syntheticProfiles, foreignQueen] }));
  const bosses = engine.enemies.filter((enemy) => enemy.isBoss);
  assert.equal(bosses.length, 1);
  assert.equal(bosses[0].biology, 'synthetic');
  assert.equal(bosses[0].spriteKey, 'legacy');
  assert.equal(bosses[0].visualImageKey, 'synthetic');
  assert.equal(bosses[0].visualRow, 2);
  assert.equal(bosses[0].visualIdentityStatus, 'exact');
  assert.equal(bosses[0].isRoyal, false);
  assert.equal(engine.enemies.some((enemy) => enemy.spriteKey === 'xenoQueen'), false);

  const royalNonBoss = engine.createEnemy(foreignQueen, 99, 800, 930, { boss: false, keyCarrier: false });
  assert.equal(royalNonBoss.isRoyal, true);
  assert.equal(royalNonBoss.isBoss, false);
  assert.equal(royalNonBoss.spriteKey, 'xenoQueen');
}));

test('an explicit hive or queen campaign may select a royal profile as its contextual boss', () => withBrowserMocks(() => {
  const world = { id: 'hive-world', name: 'Hive World', biomes: ['hive'], atmosphere: 'corrosive', danger: 8 };
  const campaign = { id: 'seal-the-hive', name: 'Queen Chamber', mode: 'FRONTIER', objective: 'seal the hive queen chamber', worldId: world.id, routes: 5 };
  const levelSeed = { id: 'queen-nest', worldId: world.id, seed: 510053, width: 9, height: 6, routes: 5, hazards: ['acid'], objective: campaign.objective };
  const drone = { id: 'hive-drone', name: 'Hive Drone', biology: 'xenomorph', caste: 'drone', health: 90, damage: 15, armor: 8, speed: 1.3, frequency: 'common', encounterWorldIds: [world.id], habitats: ['hive'], behavior: 'stalk' };
  const queen = { id: 'hive-queen', name: 'Hive Queen', biology: 'xenomorph', caste: 'royal', health: 340, damage: 38, armor: 58, speed: 0.9, frequency: 'scripted', encounterWorldIds: [world.id], habitats: ['hive'], behavior: 'control' };
  const context = { world, campaign, levelSeed };
  const selection = selectEnemyEncounterCatalog([drone, queen], context, 2);
  assert.ok(selection.selectedIds.includes(queen.id));

  const engine = createEngine();
  engine.start(options({ world, campaign, levelSeed, enemyCatalog: [drone, queen] }));
  const boss = engine.enemies.find((enemy) => enemy.isBoss);
  assert.ok(boss);
  assert.match(boss.name, /queen/i);
  assert.equal(boss.isRoyal, true);
  assert.equal(boss.biology, 'xenomorph');
  assert.equal(boss.spriteKey, 'xenoQueen');
}));

test('weapon family and penetration produce statuses, armor bypass and multi-target pass-through', () => withBrowserMocks(() => {
  const contracts = WEAPONS.map(buildWeaponBallisticsRuntime);
  assert.equal(contracts.length, WEAPONS.length);
  assert.ok(new Set(contracts.map((entry) => entry.family)).size >= 10);
  assert.ok(contracts.some((entry) => entry.splash > 0));
  assert.ok(contracts.some((entry) => entry.status === 'frozen'));
  const weapon = [...WEAPONS].filter((entry) => entry.family === 'energy').sort((a, b) => b.penetration - a.penetration)[0];
  const engine = createEngine();
  engine.start(options({ weapon, aimAssist: false, enemyCatalog: ENEMIES.slice(0, 180) }));
  const targets = engine.enemies.filter((entry) => !entry.isBoss).slice(0, 3);
  Object.assign(engine.player, { x: 280, y: 820, facing: 1, fireClock: 0, reloading: false });
  for (const [index, enemy] of targets.entries()) Object.assign(enemy, { x: 410 + index * 70, spawnX: 410 + index * 70, y: 820, health: enemy.maxHealth, armor: 12, alert: false });
  for (const enemy of engine.enemies.filter((entry) => !targets.includes(entry))) enemy.alive = false;
  assert.equal(engine.fire(engine.player), true);
  for (let index = 0; index < 8; index += 1) engine.updateBullets(0.035);
  assert.ok(targets.filter((enemy) => enemy.health < enemy.maxHealth).length >= 2);
  assert.ok(engine.penetrationTelemetry.passThroughs >= 1);
  assert.ok(targets.some((enemy) => enemy.statusEffect === 'ionized'));
}));

test('Neuro-Xeno has a disrupting adversary, limited counter-pulses and a physical relay to neutralize', () => withBrowserMocks(() => {
  const events = [];
  const profile = NEURO_XENO_PROFILES.find((entry) => entry.playerClassCompatible);
  const engine = createEngine(events);
  engine.start(options({ neuroProfile: profile, enemyCatalog: ENEMIES.slice(0, 180) }));
  const counter = engine.neuroCounterplay;
  assert.equal(counter.active, true);
  assert.ok(counter.adversaryId);
  assert.equal(counter.relay.active, true);
  const adversary = engine.enemies.find((enemy) => enemy.id === counter.adversaryId);
  Object.assign(engine.player, { x: adversary.x, y: adversary.y });
  const beforeDrain = engine.neuro.signal;
  engine.updateNeuroControl(0.8);
  assert.ok(engine.neuro.signal < beforeDrain);
  engine.neuro.signal = 40;
  assert.equal(engine.activateNeuroCountermeasure(engine.player), true);
  assert.equal(counter.pulses, 1);
  assert.ok(engine.neuro.signal > 40);
  Object.assign(engine.player, { x: counter.relay.x, y: counter.relay.y });
  assert.equal(engine.interact(engine.player), true);
  assert.equal(counter.neutralized, true);
  assert.equal(counter.relay.active, false);
  assert.ok(events.some((event) => event.type === 'neuro-counter-pulse'));
  assert.ok(events.some((event) => event.type === 'neuro-disruption-neutralized'));
}));

test('accessibility settings make aim assist effective, reduced motion suppress VFX/shake and subtitles emit captions', () => withBrowserMocks(() => {
  assert.deepEqual(buildAccessibilityRuntime({ reducedMotion: true, aimAssist: 'high', subtitles: true, screenShake: 1 }), { reducedMotion: true, subtitles: true, aimAssist: 'high', aimAssistStrength: 1, screenShake: 0 });
  const events = [];
  const assisted = createEngine(events);
  assisted.start(options({ reducedMotion: true, aimAssist: 'high', subtitles: true, enemyCatalog: ENEMIES.slice(0, 160) }));
  const target = assisted.enemies.find((enemy) => !enemy.isBoss);
  for (const enemy of assisted.enemies) enemy.alive = enemy === target;
  Object.assign(assisted.player, { x: 260, y: 820, facing: 1, fireClock: 0, reloading: false });
  Object.assign(target, { x: 720, y: 590, spawnX: 720 });
  assert.equal(assisted.fire(assisted.player), true);
  const assistedBullet = assisted.bullets.at(-1);
  assert.equal(assistedBullet.aimAssistTargetId, target.id);
  assert.notEqual(assistedBullet.vy, 0);
  assisted.particles = Array.from({ length: 20 }, () => ({ life: 1 }));
  assisted.cameraShake = 1;
  assisted.update(0.01);
  assert.ok(assisted.particles.length <= 4);
  assert.equal(assisted.cameraShake, 0);
  assert.ok(events.some((event) => event.type === 'caption'));
  assert.equal(assisted.getSnapshot().accessibility.aimAssist, 'high');

  const unassisted = createEngine();
  unassisted.start(options({ aimAssist: false, subtitles: false, enemyCatalog: ENEMIES.slice(0, 160) }));
  const plainTarget = unassisted.enemies.find((enemy) => !enemy.isBoss);
  for (const enemy of unassisted.enemies) enemy.alive = enemy === plainTarget;
  Object.assign(unassisted.player, { x: 260, y: 820, facing: 1, fireClock: 0, reloading: false });
  Object.assign(plainTarget, { x: 720, y: 590, spawnX: 720 });
  assert.equal(unassisted.fire(unassisted.player), true);
  assert.equal(unassisted.bullets.at(-1).vy || 0, 0);
  assert.equal(unassisted.getSnapshot().captions.length, 0);
}));
