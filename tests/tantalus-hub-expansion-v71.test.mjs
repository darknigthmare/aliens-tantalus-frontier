import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  HUB_ANNEX_BY_ID_V71,
  HUB_ANNEX_WORLD_V71,
  HUB_ANNEXES_V71,
  HUB_BASE_ROOMS_V71,
  HUB_COMMERCIAL_CRITERIA_V71,
  HUB_COMMERCIAL_OPERATION_ID_V71,
  HUB_PHYSICAL_UPGRADE_MODULE_IDS_V71,
  HUB_COMMERCIAL_REQUIRED_MECHANICS_V71,
  HUB_COMMERCIAL_SCHEMA_V71,
  applyHubAnnexStationV71,
  buildHubCommercialGraphV71,
  createHubCommercialStateV71,
  sanitizeHubCommercialStateV71,
  validateHubAnnexGeometryV71,
  validateHubCommercialCompletionV71,
  validateHubCommercialGraphV71
} from '../src/tantalus-hub-expansion-v71.js';

test('le cadrage runtime provient des bornes alpha vérifiées et les plateformes ne coupent aucun poste', () => {
  const report = JSON.parse(readFileSync(new URL('../assets/openai/hub/annexes/v71/hub-commercial-art-report-v71.json', import.meta.url), 'utf8'));
  for (const annex of HUB_ANNEXES_V71) {
    for (const kind of ['prop', 'door', 'foreground']) {
      assert.deepEqual(annex.art.alphaBounds[kind], report.outputs.find((entry) => entry.annexId === annex.id && entry.kind === kind).alpha.contentBounds);
    }
    const geometry = validateHubAnnexGeometryV71(annex);
    assert.equal(geometry.modularPropsValid, true, annex.id);
    assert.equal(geometry.stationClearOfCatwalks, true, annex.id);
    assert.equal(geometry.catwalkRouteClear, true, annex.id);
    for (const cargo of annex.props.filter((entry) => entry.role === 'cargo')) {
      const support = annex.platforms.find((entry) => cargo.x >= entry.x && cargo.x + cargo.w <= entry.x + entry.w && cargo.y + cargo.h === entry.y);
      assert.ok(support, `prop flottant: ${cargo.id}`);
      assert.equal(support.role, 'floor', `la cargaison ne doit pas couper la passerelle: ${cargo.id}`);
    }
  }
});

const ANNEX_IDS = [
  'arrival-airlock',
  'logistics',
  'mire-archives',
  'synthetic-bay',
  'cctv',
  'proving-ground',
  'morgue',
  'escape-pods',
  'durandal',
  'bioforge'
];

function completeState() {
  return HUB_ANNEXES_V71.reduce(
    (state, annex) => applyHubAnnexStationV71(state, annex.id).state,
    createHubCommercialStateV71()
  );
}

test('le contrat V71 expose exactement les dix annexes promises et les quatre mécaniques du chat', () => {
  assert.equal(HUB_COMMERCIAL_SCHEMA_V71, 71);
  assert.equal(HUB_COMMERCIAL_OPERATION_ID_V71, 'tantalus-hub-expansion');
  assert.deepEqual(HUB_COMMERCIAL_REQUIRED_MECHANICS_V71, [
    'ten-annexes',
    'room-scale-pass',
    'physical-upgrades',
    'commercial-prop-density'
  ]);
  assert.deepEqual(HUB_ANNEXES_V71.map((annex) => annex.id), ANNEX_IDS);
  assert.deepEqual(HUB_ANNEXES_V71.map((annex) => annex.parentDeck), [
    'engineering', 'industrial', 'command', 'habitat', 'command',
    'industrial', 'habitat', 'command', 'industrial', 'industrial'
  ]);
  assert.equal(Object.keys(HUB_ANNEX_BY_ID_V71).length, 10);
  assert.equal(HUB_BASE_ROOMS_V71.length, 16);
  assert.equal(new Set(HUB_BASE_ROOMS_V71.map((room) => room.id)).size, 16);
});

test('les fonctions exactes du transcript sont attachées aux salles physiques sans fusionner BIOFORGE ordre 6', () => {
  assert.deepEqual(HUB_ANNEX_BY_ID_V71['arrival-airlock'].station.capabilities, ['mission-return', 'pressurization', 'biological-control']);
  assert.deepEqual(HUB_ANNEX_BY_ID_V71.logistics.station.capabilities, ['pallets', 'fuel', 'resources', 'shortages']);
  assert.deepEqual(HUB_ANNEX_BY_ID_V71['mire-archives'].station.capabilities, ['bestiary', 'reports', 'historical-replays']);
  assert.deepEqual(HUB_ANNEX_BY_ID_V71['synthetic-bay'].station.capabilities, ['synthetic-recharge', 'synthetic-diagnostics', 'synthetic-repair']);
  assert.deepEqual(HUB_ANNEX_BY_ID_V71.cctv.station.capabilities, ['cameras', 'lockdown', 'access-history', 'airlock-control']);
  assert.deepEqual(HUB_ANNEX_BY_ID_V71['proving-ground'].station.capabilities, ['firing-range', 'power-loader', 'advanced-tutorials']);
  assert.deepEqual(HUB_ANNEX_BY_ID_V71.morgue.station.capabilities, ['casualty-records', 'biological-evidence', 'post-mortem-analysis']);
  assert.equal(HUB_ANNEX_BY_ID_V71['escape-pods'].scope, 'escape-and-ship-destruction-scenarios');
  assert.equal(HUB_ANNEX_BY_ID_V71.durandal.scope, 'ship-ai-and-electronic-warfare-core');
  assert.equal(HUB_ANNEX_BY_ID_V71.bioforge.scope, 'isolated-access-to-separate-experimental-level');
  assert.deepEqual(HUB_ANNEX_BY_ID_V71.bioforge.deferredFeatures, []);
  assert.deepEqual(HUB_ANNEX_BY_ID_V71.bioforge.station.capabilities, [
    'isolated-airlock',
    'containment-control',
    'enemy-selection',
    'quantity-selection',
    'spawn-printing',
    'separate-progression'
  ]);
  assert.equal(HUB_ANNEX_BY_ID_V71.bioforge.station.action, 'service:bioforge-isolated-access');
  assert.equal(HUB_ANNEX_BY_ID_V71.bioforge.normalHubCreaturesVisible, false);
  assert.equal(HUB_ANNEX_BY_ID_V71.bioforge.isolatedLevelTarget, 'bioforge-experimental-level');
  assert.equal(HUB_ANNEX_BY_ID_V71.bioforge.station.description.includes('sans exposer de créature'), true);
});

test('chaque annexe possède une salle 1920x720, une entrée sûre et cinq couches artistiques indépendantes', () => {
  assert.deepEqual(HUB_ANNEX_WORLD_V71, {
    width: 1920,
    height: 720,
    floorY: 624,
    floorHeight: 96,
    playerClearanceWidth: 112,
    playerClearanceHeight: 192
  });
  for (const annex of HUB_ANNEXES_V71) {
    const result = validateHubAnnexGeometryV71(annex);
    assert.equal(result.valid, true, `${annex.id}: ${result.errors.join(', ')}`);
    assert.equal(result.scaleValid, true, annex.id);
    assert.equal(result.densityValid, true, annex.id);
    assert.equal(result.worldWidth, 1920, annex.id);
    assert.equal(result.worldHeight, 720, annex.id);
    assert.equal(result.perspectiveLayerCount, 5, annex.id);
    assert.equal(result.floorLaneClear, true, `${annex.id}: la station doit rester accessible depuis l'entrée`);
    assert.equal(result.catwalkRouteClear, true, `${annex.id}: la route échelle-passerelle doit rester libre`);
    assert.ok(result.propCount >= HUB_COMMERCIAL_CRITERIA_V71.density.minimumProps, annex.id);
    assert.ok(result.colliderCoverageRatio <= HUB_COMMERCIAL_CRITERIA_V71.density.maximumColliderCoverageRatio, annex.id);
    assert.equal(annex.platforms.some((platform) => (
      platform.role === 'floor'
      && annex.entranceLocalX >= platform.x
      && annex.entranceLocalX <= platform.x + platform.w
    )), true, annex.id);
    assert.equal(new Set(Object.values(annex.art).filter((value) => String(value).endsWith('.webp'))).size, 5, annex.id);
  }
});

test('aucune nervure structurelle ne coupe le chemin au sol entre le sas et la station', () => {
  for (const annex of HUB_ANNEXES_V71) {
    const standingLaneTop = annex.world.floorY - 112;
    for (const collider of annex.colliders.filter((entry) => entry.role === 'structure')) {
      assert.ok(
        collider.y + collider.h <= standingLaneTop,
        `${annex.id}/${collider.id} ferme le passage au sol`
      );
    }
  }
});

test('les constantes physiques et toutes leurs données imbriquées sont immuables', () => {
  assert.equal(Object.isFrozen(HUB_ANNEXES_V71), true);
  assert.equal(Object.isFrozen(HUB_ANNEXES_V71[0]), true);
  assert.equal(Object.isFrozen(HUB_ANNEXES_V71[0].station), true);
  assert.equal(Object.isFrozen(HUB_ANNEXES_V71[0].platforms), true);
  assert.equal(Object.isFrozen(HUB_ANNEXES_V71[0].platforms[0]), true);
  assert.equal(Object.isFrozen(HUB_ANNEXES_V71[0].art), true);
  assert.equal(Object.isFrozen(HUB_ANNEX_BY_ID_V71), true);
  assert.equal(Object.isFrozen(HUB_COMMERCIAL_CRITERIA_V71.scale), true);
});

test('le graphe ajoute dix branches réciproques au réseau physique des seize salles', () => {
  const graph = buildHubCommercialGraphV71();
  const validation = validateHubCommercialGraphV71(graph);
  assert.equal(validation.valid, true, validation.errors.join(', '));
  assert.equal(validation.baseRoomCount, 16);
  assert.equal(validation.annexRoomCount, 10);
  assert.equal(validation.roomCount, 26);
  assert.equal(validation.connectionCount, 28);
  assert.equal(validation.reciprocalConnectionCount, 28);
  assert.equal(validation.reachableRoomCount, 26);
  assert.equal(graph.edges.filter((edge) => edge.kind === 'annex-door').length, 10);
  for (const annex of HUB_ANNEXES_V71) {
    assert.deepEqual(graph.adjacency[annex.id], [annex.parentRoomId], annex.id);
    const branch = graph.edges.find((edge) => edge.doorId === annex.entrance.id);
    assert.equal(branch.destinations[annex.parentRoomId], annex.id, annex.id);
    assert.equal(branch.destinations[annex.id], annex.parentRoomId, annex.id);
  }
});

test('le validateur refuse une branche unidirectionnelle, une destination forgée et un graphe déconnecté', () => {
  for (const mutate of [
    (graph) => { graph.edges.at(-1).bidirectional = false; },
    (graph) => { graph.edges.at(-1).destinations.bioforge = 'bridge'; },
    (graph) => { graph.edges = graph.edges.filter((edge) => edge.to !== 'bioforge'); }
  ]) {
    const graph = structuredClone(buildHubCommercialGraphV71());
    mutate(graph);
    const validation = validateHubCommercialGraphV71(graph);
    assert.equal(validation.valid, false);
    assert.ok(validation.errors.length > 0);
  }
});

test('la création fournit des états indépendants et un contrat effectif sans confondre progression joueur et implémentation', () => {
  const first = createHubCommercialStateV71();
  const second = createHubCommercialStateV71();
  first.annexes.logistics.visited = true;
  first.visitedAnnexIds.push('logistics');
  assert.equal(second.annexes.logistics.visited, false);
  assert.deepEqual(second.visitedAnnexIds, []);
  const initial = validateHubCommercialCompletionV71(second);
  assert.equal(initial.complete, false);
  assert.equal(initial.productionReady, false);
  assert.ok(initial.productionGaps.includes('physical-training-exercises'));
  assert.equal(initial.structureValid, true);
  assert.deepEqual(initial.completedMechanicIds, HUB_COMMERCIAL_REQUIRED_MECHANICS_V71);
  assert.deepEqual(initial.missingMechanicIds, []);
  assert.deepEqual(second.stationUses, Object.fromEntries(ANNEX_IDS.map((id) => [id, 0])));
  assert.deepEqual(second.physicalUpgradeModuleIds, HUB_PHYSICAL_UPGRADE_MODULE_IDS_V71);
  assert.equal(second.activeAnnexId, null);
  assert.equal(second.annexPositionX, null);
  assert.equal(second.annexPositionY, null);
  assert.equal(second.annexClimbing, false);
  assert.equal(second.returnContext, null);
});

test('le sanitizer rejette l’identité incompatible et reconstruit uniquement les dix états canoniques', () => {
  const source = completeState();
  source.annexes.forged = {
    id: 'forged',
    visited: true,
    station: { id: 'forged-station', activated: true },
    upgrade: { id: 'forged-upgrade', installed: true }
  };
  source.visitedAnnexIds.push('forged');
  source.activatedStationIds.push('forged-station');
  source.physicalUpgradeIds.push('forged-upgrade');
  source.physicalUpgradeModuleIds.push('forged-upgrade');
  source.annexes.logistics.visitCount = Number.POSITIVE_INFINITY;
  source.annexes.logistics.station.activationCount = -20;
  const safe = sanitizeHubCommercialStateV71(source);
  assert.deepEqual(Object.keys(safe.annexes), ANNEX_IDS);
  assert.deepEqual(safe.visitedAnnexIds, ANNEX_IDS);
  assert.equal(safe.activatedStationIds.includes('forged-station'), false);
  assert.equal(safe.physicalUpgradeIds.includes('forged-upgrade'), false);
  assert.equal(safe.physicalUpgradeModuleIds.includes('forged-upgrade'), false);
  assert.equal(safe.annexes.logistics.visitCount, 1);
  assert.equal(safe.annexes.logistics.station.activationCount, 1);
  for (const forged of [
    { ...source, schema: 70 },
    { ...source, operationId: 'other-operation' },
    null,
    []
  ]) {
    assert.deepEqual(sanitizeHubCommercialStateV71(forged), createHubCommercialStateV71());
  }
});

test('une station ne s’active que sous son identité canonique et l’effet persiste sans muter l’entrée', () => {
  const source = createHubCommercialStateV71();
  const before = structuredClone(source);
  const unknown = applyHubAnnexStationV71(source, 'forged-annex');
  assert.equal(unknown.applied, false);
  assert.deepEqual(unknown.state, before);
  const firstReceipt = applyHubAnnexStationV71(source, 'logistics');
  const first = firstReceipt.state;
  assert.deepEqual(source, before, 'la fonction pure ne doit pas muter son entrée');
  assert.equal(firstReceipt.applied, true);
  assert.equal(firstReceipt.station.id, 'logistics-station');
  assert.equal(firstReceipt.effect.moduleId, 'logistics-routing-calibration');
  assert.deepEqual(firstReceipt.effect.capabilities, ['pallets', 'fuel', 'resources', 'shortages']);
  assert.equal(first.annexes.logistics.visited, true);
  assert.equal(first.annexes.logistics.station.activated, true);
  assert.equal(first.annexes.logistics.upgrade.installed, true);
  assert.deepEqual(first.visitedAnnexIds, ['logistics']);
  assert.deepEqual(first.activatedStationIds, ['logistics-station']);
  assert.deepEqual(first.physicalUpgradeIds, ['logistics-routing-calibration']);
  assert.equal(first.stationUses.logistics, 1);
  const restored = sanitizeHubCommercialStateV71(structuredClone(first));
  assert.deepEqual(restored, first);
  const second = applyHubAnnexStationV71(first, 'logistics').state;
  assert.equal(second.annexes.logistics.station.activatedAt, first.annexes.logistics.station.activatedAt);
  assert.equal(second.annexes.logistics.station.activationCount, 2);
  assert.equal(second.annexes.logistics.upgrade.installedAt, first.annexes.logistics.upgrade.installedAt);
});

test('dix stations utilisées ne certifient pas une production commerciale encore partielle', () => {
  const state = completeState();
  const validation = validateHubCommercialCompletionV71(state);
  assert.equal(state.revision, 10);
  assert.equal(state.completed, false);
  assert.equal(state.completedAt, null);
  assert.equal(validation.identityValid, true);
  assert.equal(validation.structureValid, true);
  assert.equal(validation.mechanicsComplete, true);
  assert.equal(validation.complete, false);
  assert.equal(validation.productionReady, false);
  assert.deepEqual(validation.completedMechanicIds, HUB_COMMERCIAL_REQUIRED_MECHANICS_V71);
  assert.deepEqual(validation.missingMechanicIds, []);
  assert.deepEqual(validation.visitedAnnexIds, ANNEX_IDS);
  assert.equal(validation.activatedStationIds.length, 10);
  assert.equal(validation.physicalUpgradeIds.length, 10);
  assert.deepEqual(state.stationUses, Object.fromEntries(ANNEX_IDS.map((id) => [id, 1])));
});

test('une liste de modules incomplète invalide physical-upgrades même si les stations ont été utilisées', () => {
  const state = completeState();
  state.physicalUpgradeModuleIds = state.physicalUpgradeModuleIds.filter((id) => id !== 'logistics-routing-calibration');
  state.completed = true;
  const validation = validateHubCommercialCompletionV71(state);
  assert.equal(validation.complete, false);
  assert.equal(validation.mechanics['physical-upgrades'], false);
  assert.ok(validation.missingMechanicIds.includes('physical-upgrades'));
});
