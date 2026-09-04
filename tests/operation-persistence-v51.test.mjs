import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  CAMPAIGNS, WORLDS, CREW, WEAPONS, EQUIPMENT, VEHICLES, COSTUMES, LEVEL_SEEDS, ENEMIES,
  NEURO_XENO_PROFILES, APEX_DOSSIERS
} from '../src/content.js';
import { GameEngine } from '../src/game-production-runtime.js';
import {
  createDefaultSave, migrateSave, executeStrategicAction, beginOperation, resolveOperation,
  resolveOperationDeployment, recordOperationResumeState, sanitizeOperationResumeState,
  equipCatalogItem, selectStrategicVehicle, assignCrewMember, applyCostume
} from '../src/save.js';

const APP_URL = new URL('../src/app.js', import.meta.url);
const INDEX_URL = new URL('../index.html', import.meta.url);

function availableOperation(save = createDefaultSave(1)) {
  const campaign = CAMPAIGNS.find((entry) => save.galaxy.unlockedWorldIds.includes(entry.worldId));
  assert.ok(campaign, 'une campagne initiale doit être disponible');
  const world = WORLDS.find((entry) => entry.id === campaign.worldId);
  assert.ok(world, 'le monde de campagne doit exister');
  return { save, campaign, world };
}

test('resolveOperation comptabilise une victoire exactement une fois', async () => {
  const { save, campaign, world } = availableOperation();
  beginOperation(save, campaign, world);
  const before = save.statistics.campaigns;
  const outcome = resolveOperation(save, { success: true, kills: 3 });
  assert.equal(outcome.ok, true);
  assert.equal(save.statistics.campaigns, before + 1);

  const app = await readFile(APP_URL, 'utf8');
  const finalize = app.match(/function finalizeOperation[\s\S]*?\n\}/)?.[0] || '';
  assert.doesNotMatch(finalize, /statistics\.(campaigns|retreats)\s*\+=/);
  assert.match(finalize, /rewards:\s*event\.rewards\s*\|\|\s*null/);
  assert.match(finalize, /resolvedSuccess\s*=\s*outcome\?\.ok\s*\?\s*outcome\.success\s*!==\s*false\s*:\s*false/);
  assert.match(finalize, /applyCampaignConsequence\([\s\S]*\{\s*success:\s*resolvedSuccess\s*\}/);
  assert.match(finalize, /hours:\s*resolvedSuccess\s*\?\s*4\s*:\s*8/);
});

test('resolveOperation comptabilise une retraite exactement une fois', () => {
  const { save, campaign, world } = availableOperation();
  beginOperation(save, campaign, world);
  const before = save.statistics.retreats;
  const outcome = resolveOperation(save, { success: false, reason: 'retreat' });
  assert.equal(outcome.ok, true);
  assert.equal(save.statistics.retreats, before + 1);
});

test('la reprise résout le manifeste persisté, pas les sélections stratégiques ultérieures', () => {
  const { save, campaign, world } = availableOperation();
  const originalCrewIds = CREW.slice(0, 2).map((entry) => entry.id);
  const originalWeaponIds = WEAPONS.slice(0, 2).map((entry) => entry.id);
  const originalEquipmentIds = EQUIPMENT.slice(0, 2).map((entry) => entry.id);
  const originalVehicleId = VEHICLES[0].id;
  const originalCostumeId = COSTUMES.at(1)?.id || COSTUMES[0].id;
  const originalNeuroId = NEURO_XENO_PROFILES[0]?.id || null;
  const originalApexId = APEX_DOSSIERS[0]?.id || null;
  Object.assign(save.strategy, {
    selectedCrewIds: originalCrewIds,
    selectedVehicleId: originalVehicleId,
    selectedNeuroProfileId: originalNeuroId,
    selectedApexDossierId: originalApexId
  });
  Object.assign(save.player, {
    weaponIds: originalWeaponIds,
    equipmentIds: originalEquipmentIds,
    costumeId: originalCostumeId
  });
  save.settings.difficulty = 'nightmare';
  beginOperation(save, campaign, world);

  save.strategy.selectedCrewIds = CREW.slice(-2).map((entry) => entry.id);
  save.strategy.selectedVehicleId = VEHICLES.at(-1).id;
  save.strategy.selectedNeuroProfileId = NEURO_XENO_PROFILES.at(-1)?.id || null;
  save.strategy.selectedApexDossierId = APEX_DOSSIERS.at(-1)?.id || null;
  save.player.weaponIds = [WEAPONS.at(-1).id];
  save.player.equipmentIds = [EQUIPMENT.at(-1).id];
  save.player.costumeId = COSTUMES.at(-1).id;
  save.settings.difficulty = 'story';

  const loaded = migrateSave(JSON.parse(JSON.stringify(save)), 1);
  const deployment = resolveOperationDeployment(loaded, {
    crewCatalog: CREW,
    weaponCatalog: WEAPONS,
    equipmentCatalog: EQUIPMENT,
    vehicleCatalog: VEHICLES,
    costumeCatalog: COSTUMES,
    neuroProfileCatalog: NEURO_XENO_PROFILES,
    apexDossierCatalog: APEX_DOSSIERS
  });
  assert.deepEqual(deployment.crewIds, originalCrewIds);
  assert.deepEqual(deployment.weaponIds, originalWeaponIds);
  assert.deepEqual(deployment.equipmentIds, originalEquipmentIds);
  assert.equal(deployment.vehicleId, originalVehicleId);
  assert.equal(deployment.costumeId, originalCostumeId);
  assert.equal(deployment.neuroProfileId, originalNeuroId);
  assert.equal(deployment.apexDossierId, originalApexId);
  assert.equal(deployment.difficulty, 'nightmare');
});

test('les mutations de dotation sont verrouillées pendant une opération', () => {
  const { save, campaign, world } = availableOperation();
  beginOperation(save, campaign, world);
  assert.throws(() => equipCatalogItem(save, 'weapon', save.player.weaponIds[0]), /verrouillee/i);
  assert.throws(() => selectStrategicVehicle(save, save.strategy.selectedVehicleId), /verrouille/i);
  assert.throws(() => assignCrewMember(save, save.strategy.selectedCrewIds[0]), /verrouillee/i);
  assert.throws(() => applyCostume(save, save.player.costumeId), /verrouillee/i);
});

test('resumeState survit à la migration avec progression, portes, inventaire et charges', () => {
  const { save, campaign, world } = availableOperation();
  beginOperation(save, campaign, world);
  const candidate = {
    checkpoint: { id: 'checkpoint-2', x: 1440, y: 838 },
    player: { x: 1490, y: 838, health: 61, armor: 18, ammo: 17, ammoReserve: 96, weapon: 'rifle', alive: true, downed: false, kills: 7 },
    mission: { elapsed: 312, retries: 1, casualties: 0, phase: 'extract' },
    objectives: { power: true, specimen: false },
    inventory: { cutter: true, accessLevel: 2 },
    doors: [{ id: 'bulkhead-a', open: true, progress: 1 }],
    vents: [{ id: 'vent-a', open: true }],
    equipment: [{ id: EQUIPMENT[0].id, remaining: 1, uses: 2 }],
    pickups: { weaponTaken: true, toolTaken: true, archiveRecovered: false, powerActive: true, supplies: [{ id: 'supply-a', used: true }] },
    ignored: { executable: true }
  };
  assert.equal(recordOperationResumeState(save, candidate), true);
  const loaded = migrateSave(JSON.parse(JSON.stringify(save)), 1);
  assert.deepEqual(loaded.strategy.currentOperation.resumeState, sanitizeOperationResumeState(candidate));
  assert.equal('ignored' in loaded.strategy.currentOperation.resumeState, false);
});

test('la migration borne les identifiants spéciaux sans modifier les opérations ordinaires', () => {
  const { save, campaign, world } = availableOperation();
  const deployment = beginOperation(save, campaign, world);
  assert.equal(deployment.ok, true);
  deployment.operation.specialOperationId = `special-${'x'.repeat(160)}`;
  deployment.operation.issuedVehicleId = `vehicle-${'y'.repeat(160)}`;

  const active = migrateSave(JSON.parse(JSON.stringify(save)), 1);
  assert.equal(active.strategy.currentOperation.specialOperationId, deployment.operation.specialOperationId.slice(0, 120));
  assert.equal(active.strategy.currentOperation.issuedVehicleId, deployment.operation.issuedVehicleId.slice(0, 120));

  assert.equal(resolveOperation(active, { success: true, kills: 0 }).ok, true);
  const completed = migrateSave(JSON.parse(JSON.stringify(active)), 1);
  assert.equal(completed.strategy.lastOperation.specialOperationId, deployment.operation.specialOperationId.slice(0, 120));
  assert.equal(completed.strategy.lastOperation.issuedVehicleId, deployment.operation.issuedVehicleId.slice(0, 120));

  const normal = availableOperation();
  assert.equal(beginOperation(normal.save, normal.campaign, normal.world).ok, true);
  const normalOperation = migrateSave(JSON.parse(JSON.stringify(normal.save)), 1).strategy.currentOperation;
  assert.equal(Object.hasOwn(normalOperation, 'specialOperationId'), false);
  assert.equal(Object.hasOwn(normalOperation, 'issuedVehicleId'), false);
});

test('la migration ne conserve que les fenêtres diplomatiques finies de mondes connus', () => {
  const save = createDefaultSave(1);
  const known = WORLDS[0].id;
  save.galaxy.diplomacyWindows = { [known]: 81.5, 'world-inconnu': 90, [WORLDS[1].id]: 'invalide' };
  const loaded = migrateSave(save, 1);
  assert.deepEqual(loaded.galaxy.diplomacyWindows, { [known]: 81.5 });
});

test('une récupération industrielle avec carburant bas recrée une réserve', () => {
  const save = createDefaultSave(1);
  save.galaxy.resources.fuel = 4;
  save.hub.systems.supplies = 3;
  const result = executeStrategicAction(save, 'salvage-run');
  assert.ok(save.galaxy.resources.fuel > 0);
  assert.match(result.result, /carburant/i);
});

test('app branche accessibilité, captions sans commit et cooldown diplomatique', async () => {
  const [app, html] = await Promise.all([readFile(APP_URL, 'utf8'), readFile(INDEX_URL, 'utf8')]);
  assert.match(app, /accessibility:\s*\{[\s\S]*reducedMotion:[\s\S]*subtitles:[\s\S]*aimAssist:[\s\S]*screenShake:/);
  assert.match(app, /event\.type === 'caption'[\s\S]*settings\.subtitles[\s\S]*return;/);
  assert.match(app, /const persistentEvents = new Set/);
  assert.doesNotMatch(app, /else if \(!\['shot', 'kill'\]\.includes\(event\.type\)\) saveSystem\.commit/);
  assert.match(app, /diplomacyWindows\?\.\[world\.id\]/);
  assert.match(app, /remainingHours > 0/);
  assert.match(app, /diplomacyDisabled/);
  assert.match(app, /neuro-profile-select'[\s\S]*assertOperationMutable\(\)/);
  assert.match(app, /apex-dossier-select'[\s\S]*assertOperationMutable\(\)/);
  assert.match(app, /disabled: loadoutLocked \|\| !canAfford\(saveSystem\.data, quote\)[\s\S]*dataset: \{ procureKind: kind, procureId: item\.id \}/);
  assert.match(app, /disabled: equipped \|\| loadoutLocked[\s\S]*\? \{ selectVehicle: item\.id \}/);
  assert.match(app, /data-crew-assign=[\s\S]*loadoutLocked \|\| member\.status/);
  assert.match(app, /data-crew-treat=[\s\S]*loadoutLocked \|\| member\.status/);
  assert.match(app, /data-costume-id=[\s\S]*selected \|\| loadoutLocked/);
  assert.match(app, /Opération active : manifeste verrouillé/);
  assert.match(app, /operationId:\s*casualtyOperation\?\.id\s*\|\|\s*null/);
  assert.match(html, /id="setting-aim-assist"[\s\S]*value="off"[\s\S]*value="standard"[\s\S]*value="high"/);
  assert.match(html, /id="setting-screen-shake"[^>]*min="0"[^>]*max="1"/);
});


test('migration borne les secousses et convertit les anciennes aides numériques', () => {
  const legacyOff = createDefaultSave(1);
  legacyOff.settings.aimAssist = 0;
  legacyOff.settings.screenShake = -4;
  const legacyHigh = createDefaultSave(1);
  legacyHigh.settings.aimAssist = 0.8;
  legacyHigh.settings.screenShake = 8;
  assert.equal(migrateSave(legacyOff, 1).settings.aimAssist, 'off');
  assert.equal(migrateSave(legacyOff, 1).settings.screenShake, 0);
  assert.equal(migrateSave(legacyHigh, 1).settings.aimAssist, 'high');
  assert.equal(migrateSave(legacyHigh, 1).settings.screenShake, 1);
  assert.equal(createDefaultSave(1).settings.aimAssist, 'standard');
});

test('chaque valeur UI produit le mode exact dans le snapshot mission', () => {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame
  };
  globalThis.Image = class {
    constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; }
    set src(value) { this.currentSrc = value; }
  };
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try {
    const campaign = CAMPAIGNS[0];
    const world = WORLDS.find((entry) => entry.id === campaign.worldId) || WORLDS[0];
    const levelSeed = LEVEL_SEEDS.find((entry) => entry.worldId === world.id) || LEVEL_SEEDS[0];
    for (const aimAssist of ['off', 'standard', 'high']) {
      const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
      const engine = new GameEngine(canvas);
      engine.start({
        seed: levelSeed.seed,
        world,
        campaign,
        levelSeed,
        weapon: WEAPONS[0],
        equipment: [],
        crew: [],
        vehicle: null,
        enemyCatalog: ENEMIES.slice(0, 120),
        accessibility: { aimAssist, screenShake: 0.7, subtitles: true, reducedMotion: false }
      });
      assert.equal(engine.getSnapshot().accessibility.aimAssist, aimAssist);
      engine.stop();
    }
  } finally {
    globalThis.Image = previous.Image;
    globalThis.addEventListener = previous.addEventListener;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
  }
});
