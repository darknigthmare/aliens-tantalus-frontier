import assert from 'node:assert/strict';
import test from 'node:test';

import {
  HUB_ANNEXES_V71,
  HUB_COMMERCIAL_SCHEMA_V71,
  applyHubAnnexStationV71,
  createHubCommercialStateV71
} from '../src/tantalus-hub-expansion-v71.js';
import {
  SAVE_SCHEMA,
  SaveSystem,
  createDefaultSave,
  migrateSave,
  sanitizePendingModuleActionV71
} from '../src/save.js';

function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    values
  };
}

test('le profil par défaut garde le schéma 52 et ajoute les trois états persistants V71', () => {
  const save = createDefaultSave(2);
  assert.equal(SAVE_SCHEMA, 52);
  assert.equal(save.schema, 52);
  assert.equal(save.hub.commercialV71.schema, HUB_COMMERCIAL_SCHEMA_V71);
  assert.equal(save.hub.commercialV71.operationId, 'tantalus-hub-expansion');
  assert.equal(save.hub.commercialV71.activeAnnexId, null);
  assert.deepEqual(save.hub.commercialV71.visitedAnnexIds, []);
  assert.equal(Object.keys(save.hub.commercialV71.stationUses).length, 10);
  assert.equal(save.hub.annexOperationsV71.schema, 71);
  assert.equal(save.hub.annexOperationsV71.provingGround.nextOperationCharge, false);
  assert.equal(save.hub.annexOperationsV71.escapePods.evacuationCharge, false);
  assert.equal(save.hub.annexOperationsV71.durandal.ewCharge, false);
  assert.equal(save.hub.pendingModuleActionV71, null);
});

test('la migration privilégie le checkpoint runtime hubCommercialV71 et le normalise sous commercialV71', () => {
  const source = createDefaultSave(1);
  const staleCanonical = createHubCommercialStateV71();
  const active = createHubCommercialStateV71();
  active.activeAnnexId = 'logistics';
  active.annexPositionX = 1388;
  active.annexPositionY = 376;
  active.annexClimbing = true;
  active.returnContext = { deckId: 'forged', roomId: 'forged', x: 4880 };
  const receipt = applyHubAnnexStationV71(active, 'logistics');
  source.hub.commercialV71 = staleCanonical;
  source.hub.hubCommercialV71 = receipt.state;
  source.hub.hubExpansionV71 = { forged: true };

  const migrated = migrateSave(JSON.parse(JSON.stringify(source)), 1);
  assert.equal(migrated.schema, 52);
  assert.equal(migrated.hub.commercialV71.activeAnnexId, 'logistics');
  assert.equal(migrated.hub.commercialV71.annexPositionX, 1388);
  assert.equal(migrated.hub.commercialV71.annexPositionY, 376);
  assert.equal(migrated.hub.commercialV71.annexClimbing, true);
  assert.deepEqual(migrated.hub.commercialV71.returnContext, {
    deckId: 'industrial',
    roomId: 'vehicle-bay',
    x: 4880
  });
  assert.deepEqual(migrated.hub.commercialV71.visitedAnnexIds, ['logistics']);
  assert.equal(migrated.hub.commercialV71.stationUses.logistics, 1);
  assert.equal(Object.hasOwn(migrated.hub, 'hubCommercialV71'), false);
  assert.equal(Object.hasOwn(migrated.hub, 'hubExpansionV71'), false);
});

test('une ancienne sauvegarde sans V71 reçoit le contrat canonique sans perdre sa progression', () => {
  const legacy = {
    schema: 51,
    release: '70.0.0',
    player: { name: 'Mara archive', health: 73 },
    hub: { visited: ['bridge', 'medical'], services: { 'service:medical': 4 } },
    statistics: { kills: 77 }
  };
  const migrated = migrateSave(legacy, 3);
  assert.equal(migrated.player.name, 'Mara archive');
  assert.equal(migrated.player.health, 73);
  assert.equal(migrated.statistics.kills, 77);
  assert.deepEqual(migrated.hub.visited, ['bridge', 'medical']);
  assert.equal(migrated.hub.services['service:medical'], 4);
  assert.deepEqual(migrated.hub.commercialV71, createHubCommercialStateV71());
  assert.equal(migrated.hub.pendingModuleActionV71, null);
});

test('le sanitizer V71 retire annexes, modules et coordonnées forgés', () => {
  const source = createDefaultSave(1);
  source.hub.commercialV71 = {
    ...createHubCommercialStateV71(),
    activeAnnexId: 'forged-annex',
    annexPositionX: 999999,
    annexPositionY: -999999,
    annexClimbing: true,
    returnContext: { deckId: 'command', roomId: 'bridge', x: -999 },
    stationUses: { bioforge: 2, forged: 999 },
    visitedAnnexIds: ['forged-annex'],
    physicalUpgradeModuleIds: ['forged-module']
  };
  source.hub.commercialV71.annexes.forged = { visited: true };
  const migrated = migrateSave(source, 1);
  assert.equal(migrated.hub.commercialV71.activeAnnexId, null);
  assert.equal(migrated.hub.commercialV71.annexPositionX, null);
  assert.equal(migrated.hub.commercialV71.annexPositionY, null);
  assert.equal(migrated.hub.commercialV71.annexClimbing, false);
  assert.equal(migrated.hub.commercialV71.returnContext, null);
  assert.equal(Object.hasOwn(migrated.hub.commercialV71.annexes, 'forged'), false);
  assert.equal(Object.hasOwn(migrated.hub.commercialV71.stationUses, 'forged'), false);
  assert.deepEqual(migrated.hub.commercialV71.physicalUpgradeModuleIds, []);
  assert.equal(migrated.hub.commercialV71.completed, false);
});

test('pendingModuleActionV71 n’accepte que le reçu minimal canonique', () => {
  const valid = {
    schema: 71,
    type: 'install',
    moduleId: 'module-042',
    queuedAt: 1700000000000.9,
    forgedCost: { credits: -999999 }
  };
  assert.deepEqual(sanitizePendingModuleActionV71(valid), {
    schema: 71,
    type: 'install',
    moduleId: 'module-042',
    queuedAt: 1700000000000
  });
  const source = createDefaultSave(1);
  source.hub.pendingModuleActionV71 = { ...valid, type: 'repair' };
  assert.deepEqual(migrateSave(source, 1).hub.pendingModuleActionV71, {
    schema: 71,
    type: 'repair',
    moduleId: 'module-042',
    queuedAt: 1700000000000
  });
  for (const candidate of [
    { ...valid, schema: 70 },
    { ...valid, type: 'delete' },
    { ...valid, moduleId: 'module-42' },
    { ...valid, moduleId: '<script>' },
    { ...valid, queuedAt: -1 },
    { ...valid, queuedAt: Number.POSITIVE_INFINITY },
    null
  ]) assert.equal(sanitizePendingModuleActionV71(candidate), null);
});

test('les cooldowns annex:<id> canoniques survivent, les clés annexes inconnues sont rejetées', () => {
  const source = createDefaultSave(1);
  source.hub.services = {
    'service:medical': 8,
    'annex:arrival-airlock': 11.9,
    'annex:bioforge': -4,
    'annex:forged': 99,
    'annex:../../save': 42,
    'service:<script>': 9
  };
  const migrated = migrateSave(source, 1);
  assert.deepEqual(migrated.hub.services, {
    'service:medical': 8,
    'annex:arrival-airlock': 11,
    'annex:bioforge': 0
  });
  for (const annex of HUB_ANNEXES_V71) {
    source.hub.services = { [`annex:${annex.id}`]: 3 };
    assert.equal(migrateSave(source, 1).hub.services[`annex:${annex.id}`], 3, annex.id);
  }
});

test('SaveSystem recharge le checkpoint d’annexe, l’ordre module et ses cooldowns après JSON', () => {
  const backend = storage();
  const system = new SaveSystem(backend);
  system.newGame(1);
  const state = createHubCommercialStateV71();
  state.activeAnnexId = 'bioforge';
  state.annexPositionX = 640;
  state.annexPositionY = 376;
  state.annexClimbing = false;
  state.returnContext = { deckId: 'industrial', roomId: 'quarantine', x: 318 };
  system.data.hub.hubCommercialV71 = applyHubAnnexStationV71(state, 'bioforge').state;
  system.data.hub.pendingModuleActionV71 = {
    schema: 71,
    type: 'repair',
    moduleId: 'module-003',
    queuedAt: 1700000000200
  };
  system.data.hub.services['annex:bioforge'] = 19;
  system.commit();

  const restored = new SaveSystem(backend);
  restored.load(1);
  assert.equal(restored.data.schema, 52);
  assert.equal(restored.data.hub.commercialV71.activeAnnexId, 'bioforge');
  assert.equal(restored.data.hub.commercialV71.annexPositionX, 640);
  assert.equal(restored.data.hub.commercialV71.annexPositionY, 376);
  assert.equal(restored.data.hub.commercialV71.annexClimbing, false);
  assert.equal(restored.data.hub.commercialV71.stationUses.bioforge, 1);
  assert.equal(restored.data.hub.services['annex:bioforge'], 19);
  assert.deepEqual(restored.data.hub.pendingModuleActionV71, {
    schema: 71,
    type: 'repair',
    moduleId: 'module-003',
    queuedAt: 1700000000200
  });
});
