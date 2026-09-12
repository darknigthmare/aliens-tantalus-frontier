import test from 'node:test';
import assert from 'node:assert/strict';

import { CAMPAIGNS, CREW, ENEMIES, WORLDS } from '../src/content.js';
import {
  beginOperation,
  createDefaultSave,
  getOperationBrief,
  migrateSave
} from '../src/save.js';
import { addInfestationEvidenceV62, createInfestationExposureV62 } from '../src/infestation-chain-v62.js';
import { HUB_CRISIS_ACTIONS, planHubCrisisResolution } from '../src/world-crisis.js';
import {
  HUB_ANNEX_BUSINESS_IDS_V71,
  P5000_VEHICLE_ID_V71,
  applyHubAnnexBusinessV71,
  applyProvingGroundQualificationV81,
  consumeHubAnnexDeploymentSupportV71,
  consumeHubEscapePodMitigationV71,
  createHubAnnexOperationsV71,
  getHubAnnexDeploymentSupportV71,
  sanitizeHubAnnexOperationsV71
} from '../src/hub-annex-services-v71.js';

function provingGroundReceiptV81(ordinal = 1, score = 900) {
  const id = `m41a-qualification-v81:session-${ordinal}:qualification`;
  return {
    id,
    idempotencyKey: id,
    schemaVersion: 81,
    type: 'proving-ground-qualification',
    courseId: 'm41a-qualification-v81',
    weaponId: 'weapon-001-m41a-pulse-rifle',
    sessionId: `m41a-qualification-v81:session-${ordinal}`,
    qualified: true,
    score,
    hits: 9,
    targetCount: 9,
    remainingSeconds: 18,
    bonus: { nextOperationCharge: true },
    powerLoaderCertified: false,
    advancedTutorialsComplete: false
  };
}

function activeInfestation(save, id = 'v71-exposure') {
  createInfestationExposureV62(save, {
    id,
    type: 'live-specimen',
    kind: 'xenomorph',
    severity: 70,
    estimatedThreats: 3,
    label: 'Spécimen ramené au Tantalus'
  });
  return save.hub.infestationChain;
}

function fundedSave(profile = 1) {
  const save = createDefaultSave(profile);
  Object.assign(save.galaxy.resources, {
    credits: 999999,
    alloy: 9999,
    fuel: 9999,
    medical: 9999,
    research: 9999,
    pathogen: 9999
  });
  Object.assign(save.hub.systems, { supplies: 100, power: 100 });
  return save;
}

test('le contrat métier couvre exactement les dix annexes et refuse les identités forgées', () => {
  assert.equal(HUB_ANNEX_BUSINESS_IDS_V71.length, 10);
  assert.equal(new Set(HUB_ANNEX_BUSINESS_IDS_V71).size, 10);
  const save = createDefaultSave();
  assert.throws(() => applyHubAnnexBusinessV71(save, 'annexe-forgée'), /inconnu/);
});

test('l’état opérationnel V71 se normalise sans clés forgées ni tableaux illimités', () => {
  const forged = {
    ...createHubAnnexOperationsV71(),
    lastProcessedReturnOperationId: 'x'.repeat(400),
    lastSyntheticCrewIds: ['crew-05-bishop-9', 'human-forged'],
    processedMorgueCaseKeys: Array.from({ length: 600 }, (_, index) => `case-${index}`),
    processedMorgueEvidenceIds: Array.from({ length: 600 }, (_, index) => `evidence-${index}`),
    provingGround: { nextOperationCharge: 1, powerLoaderCertified: true, forged: true },
    forged: { enabled: true }
  };
  const safe = sanitizeHubAnnexOperationsV71(forged);
  assert.equal(safe.schema, 71);
  assert.equal(safe.lastProcessedReturnOperationId.length, 180);
  assert.deepEqual(safe.lastSyntheticCrewIds, ['crew-05-bishop-9']);
  assert.equal(safe.processedMorgueCaseKeys.length, 512);
  assert.equal(safe.processedMorgueEvidenceIds.length, 512);
  assert.equal(safe.provingGround.powerLoaderCertified, false);
  assert.equal(safe.provingGround.nextOperationCharge, false);
  assert.equal(safe.provingGround.lastQualificationIdV81, null);
  assert.deepEqual(safe.provingGround.qualificationReceiptIdsV81, []);
  assert.equal(Object.hasOwn(safe, 'forged'), false);
  assert.equal(Object.hasOwn(safe.provingGround, 'forged'), false);
});

test('Logistique publie puis retire réellement l’alerte de pénurie', () => {
  const save = createDefaultSave();
  Object.assign(save.galaxy.resources, { fuel: 1, medical: 1, alloy: 1 });
  Object.assign(save.hub.systems, { supplies: 1, power: 1 });
  const shortage = applyHubAnnexBusinessV71(save, 'logistics');
  assert.deepEqual(shortage.details.shortages, ['carburant', 'médical', 'alliage', 'ravitaillement', 'énergie']);
  assert.equal(save.galaxy.alerts[0].id, 'alert-v71-logistics-shortage');
  Object.assign(save.galaxy.resources, { fuel: 20, medical: 20, alloy: 20 });
  Object.assign(save.hub.systems, { supplies: 40, power: 40 });
  const nominal = applyHubAnnexBusinessV71(save, 'logistics');
  assert.deepEqual(nominal.details.shortages, []);
  assert.equal(save.galaxy.alerts.some((entry) => entry.id === 'alert-v71-logistics-shortage'), false);
});

test('MIRE indexe les vraies archives et rend deux points R&D dépensables', () => {
  const save = createDefaultSave();
  save.narrativeArchives.discovered = { one: {}, two: {} };
  save.narrativeArchives.readIds = ['one', 'one', 'unknown'];
  save.narrativeArchives.playedIds = ['one', 'one', 'unknown'];
  save.strategy.log = [{ id: 'rapport-1' }, { id: 'rapport-2' }];
  save.alphaBravoDoctrine.runs = [{ id: 'ab' }];
  save.alienSurvivalSystems.runs = [{ id: 'survival' }];
  const before = save.galaxy.resources.research;
  const receipt = applyHubAnnexBusinessV71(save, 'mire-archives');
  assert.equal(receipt.details.bestiaryEntries, ENEMIES.length);
  assert.equal(receipt.details.narrativeEvidence, 2);
  assert.equal(receipt.details.readEvidence, 1);
  assert.equal(receipt.details.reports, 2);
  assert.equal(receipt.details.playedArchiveMedia, 1);
  assert.equal(receipt.details.recordedRuns, 2);
  assert.equal(Object.hasOwn(receipt.details, 'historicalReplays'), false);
  assert.doesNotMatch(receipt.message, /replay/i);
  assert.equal(save.galaxy.resources.research, before + 2);
});

test('la baie synthétique ne répare que BISHOP-9, DAVID-8R et ECHO-A', () => {
  const save = createDefaultSave();
  const syntheticIds = CREW.filter((member) => member.species === 'synthetic').map((member) => member.id);
  const human = save.crew.find((member) => !syntheticIds.includes(member.id));
  const humanBefore = structuredClone(human);
  for (const member of save.crew.filter((entry) => syntheticIds.includes(entry.id))) {
    Object.assign(member, { health: 50, stress: 40, fatigue: 50, status: 'injured' });
  }
  const receipt = applyHubAnnexBusinessV71(save, 'synthetic-bay');
  assert.deepEqual(receipt.details.servicedCrewIds, syntheticIds);
  for (const member of save.crew.filter((entry) => syntheticIds.includes(entry.id))) {
    assert.deepEqual(
      { health: member.health, stress: member.stress, fatigue: member.fatigue, status: member.status },
      { health: 75, stress: 25, fatigue: 25, status: 'active' }
    );
  }
  assert.deepEqual(human, humanBefore);
});

test('le sas d’arrivée traite une fois le retour et renforce la vraie chaîne de quarantaine', () => {
  const save = createDefaultSave();
  save.strategy.lastOperation = { id: 'operation-v71-return' };
  activeInfestation(save, 'arrival-exposure');
  const first = applyHubAnnexBusinessV71(save, 'arrival-airlock');
  assert.equal(first.details.newReturn, true);
  assert.equal(first.details.returnId, 'operation-v71-return');
  assert.equal(first.details.containment.applied, true);
  assert.equal(first.details.containment.action, 'raise-quarantine');
  assert.equal(save.hub.annexOperationsV71.lastProcessedReturnOperationId, 'operation-v71-return');
  const second = applyHubAnnexBusinessV71(save, 'arrival-airlock');
  assert.equal(second.details.newReturn, false);
});

test('CCTV ajoute une preuve capteur et mémorise seulement l’incident scanné', () => {
  const save = createDefaultSave();
  activeInfestation(save, 'cctv-exposure');
  save.hub.activeCrisis = {
    id: 'crisis-cctv-v71',
    kind: 'xenomorph',
    count: 2,
    deck: 2,
    roomId: 'quarantine',
    resolved: false
  };
  const beforeEvidence = save.hub.infestationChain.evidence.length;
  const receipt = applyHubAnnexBusinessV71(save, 'cctv');
  assert.equal(receipt.details.containment.action, 'sensor-scan');
  assert.equal(save.hub.infestationChain.evidence.length, beforeEvidence + 1);
  assert.equal(save.hub.infestationChain.evidence.some((entry) => entry.type === 'motion'), true);
  assert.equal(save.hub.annexOperationsV71.lastCctvScanCrisisId, 'crisis-cctv-v71');
  assert.doesNotMatch(receipt.message, /lockdown|localisé/i);
});

test('la morgue ne rémunère jamais deux fois le même dossier ou la même preuve', () => {
  const save = createDefaultSave();
  save.memorial = [{ crewId: 'crew-01', operationId: 'operation-lost', day: 3 }];
  activeInfestation(save, 'morgue-exposure');
  addInfestationEvidenceV62(save, { id: 'evidence-morgue-v71', type: 'biological', label: 'Prélèvement', confidence: 80 });
  const before = save.galaxy.resources.research;
  const first = applyHubAnnexBusinessV71(save, 'morgue');
  assert.deepEqual(
    { cases: first.details.newCases, evidence: first.details.newEvidence, award: first.details.researchAward },
    { cases: 1, evidence: 1, award: 3 }
  );
  assert.equal(save.galaxy.resources.research, before + 3);
  const second = applyHubAnnexBusinessV71(save, 'morgue');
  assert.equal(second.details.researchAward, 0);
  assert.equal(save.galaxy.resources.research, before + 3);
});

test('seule une qualification physique V81 valide arme le soutien Proving Ground', () => {
  const save = createDefaultSave();
  const station = applyHubAnnexBusinessV71(save, 'proving-ground');
  assert.equal(station.details.qualificationRequiredV81, true);
  assert.equal(getHubAnnexDeploymentSupportV71(save).provingGround, false);
  assert.equal(applyProvingGroundQualificationV81(save, { qualified: true }).reason, 'invalid-receipt');
  const receipt = provingGroundReceiptV81(1, 1234);
  assert.deepEqual(applyProvingGroundQualificationV81(save, receipt), {
    applied: true,
    duplicate: false,
    reason: null,
    id: receipt.id,
    score: 1234,
    nextOperationCharge: true
  });
  assert.deepEqual(applyProvingGroundQualificationV81(save, receipt), {
    applied: false,
    duplicate: true,
    reason: 'already-applied'
  });
  const secondReceipt = provingGroundReceiptV81(2, 1300);
  assert.equal(applyProvingGroundQualificationV81(save, secondReceipt).applied, true);
  assert.deepEqual(applyProvingGroundQualificationV81(save, receipt), {
    applied: false,
    duplicate: true,
    reason: 'already-applied'
  });
  applyHubAnnexBusinessV71(save, 'durandal');
  const armed = getHubAnnexDeploymentSupportV71(save, P5000_VEHICLE_ID_V71);
  assert.deepEqual(armed, {
    provingGround: true,
    durandal: true,
    riskReduction: 10,
    powerLoaderFuelReduction: 0
  });
  assert.deepEqual(consumeHubAnnexDeploymentSupportV71(save), {
    provingGround: true,
    durandal: true,
    riskReduction: 10,
    powerLoaderFuelReduction: 0
  });
  assert.equal(save.hub.annexOperationsV71.provingGround.nextOperationCharge, false);
  assert.equal(save.hub.annexOperationsV71.durandal.ewCharge, false);
  assert.equal(save.hub.annexOperationsV71.provingGround.powerLoaderCertified, false);
  assert.equal(save.hub.annexOperationsV71.provingGround.advancedTutorialsComplete, false);
  assert.equal(save.hub.annexOperationsV71.provingGround.lastQualificationIdV81, secondReceipt.id);
  assert.deepEqual(save.hub.annexOperationsV71.provingGround.qualificationReceiptIdsV81, [receipt.id, secondReceipt.id]);
});

test('Capsules arme une extraction unique et BIOFORGE reste un sas sans donnée de spawn', () => {
  const save = createDefaultSave();
  applyHubAnnexBusinessV71(save, 'escape-pods');
  assert.equal(consumeHubEscapePodMitigationV71(save).applied, true);
  assert.equal(consumeHubEscapePodMitigationV71(save).applied, false);

  activeInfestation(save, 'bioforge-exposure');
  const receipt = applyHubAnnexBusinessV71(save, 'bioforge');
  assert.equal(receipt.details.containment.action, 'seal-entry');
  assert.equal(receipt.details.isolationVerified, true);
  assert.equal(receipt.details.containmentCycles, 1);
  assert.equal(receipt.details.organismsInHub, 0);
  assert.match(receipt.message, /niveau V80 prêt · ouverture autorisée/);
  assert.doesNotMatch(JSON.stringify(save.hub.annexOperationsV71.bioforge), /spawn|enemy|quantity|printer/i);
});

test('migration et round-trip conservent uniquement l’état métier V71 canonique', () => {
  const save = createDefaultSave();
  const receipt = provingGroundReceiptV81(2, 777);
  applyProvingGroundQualificationV81(save, receipt);
  applyHubAnnexBusinessV71(save, 'escape-pods');
  applyHubAnnexBusinessV71(save, 'durandal');
  save.hub.annexOperationsV71.processedMorgueCaseKeys = ['crew-01:operation-1:2'];
  save.hub.annexOperationsV71.forged = { spawn: 999 };
  const restored = migrateSave(JSON.parse(JSON.stringify(save)), save.profile);
  assert.equal(restored.hub.annexOperationsV71.provingGround.nextOperationCharge, true);
  assert.equal(restored.hub.annexOperationsV71.provingGround.lastQualificationIdV81, receipt.id);
  assert.deepEqual(restored.hub.annexOperationsV71.provingGround.qualificationReceiptIdsV81, [receipt.id]);
  assert.equal(restored.hub.annexOperationsV71.provingGround.qualificationsCompletedV81, 1);
  assert.equal(restored.hub.annexOperationsV71.provingGround.bestScoreV81, 777);
  assert.equal(restored.hub.annexOperationsV71.escapePods.evacuationCharge, true);
  assert.equal(restored.hub.annexOperationsV71.durandal.ewCharge, true);
  assert.deepEqual(restored.hub.annexOperationsV71.processedMorgueCaseKeys, ['crew-01:operation-1:2']);
  assert.equal(Object.hasOwn(restored.hub.annexOperationsV71, 'forged'), false);
});

test('le calcul stratégique applique -10 risque sans faux bonus P-5000 puis consomme les charges au départ', () => {
  const baseline = fundedSave();
  const campaign = CAMPAIGNS.find((entry) => baseline.galaxy.unlockedWorldIds.includes(entry.worldId));
  const world = WORLDS.find((entry) => entry.id === campaign.worldId);
  baseline.strategy.inventory.vehicleIds.push(P5000_VEHICLE_ID_V71);
  baseline.strategy.selectedVehicleId = P5000_VEHICLE_ID_V71;
  const plainBrief = getOperationBrief(baseline, campaign, world);

  const supported = structuredClone(baseline);
  applyProvingGroundQualificationV81(supported, provingGroundReceiptV81(3));
  applyHubAnnexBusinessV71(supported, 'durandal');
  const supportedBrief = getOperationBrief(supported, campaign, world);
  assert.equal(supportedBrief.risk, plainBrief.risk - 10);
  assert.equal(supportedBrief.cost.fuel, plainBrief.cost.fuel);
  assert.equal(supportedBrief.annexSupportV71.riskReduction, 10);

  const deployment = beginOperation(supported, campaign, world);
  assert.equal(deployment.operation.risk, supportedBrief.risk);
  assert.equal(deployment.operation.flags['v71-proving-ground-support'], true);
  assert.equal(deployment.operation.flags['v71-durandal-ew-support'], true);
  assert.equal(supported.hub.annexOperationsV71.provingGround.nextOperationCharge, false);
  assert.equal(supported.hub.annexOperationsV71.durandal.ewCharge, false);

  supported.hub.annexOperationsV71.provingGround.nextOperationCharge = true;
  supported.hub.annexOperationsV71.durandal.ewCharge = true;
  const resumed = beginOperation(supported, campaign, world);
  assert.equal(resumed.resumed, true);
  assert.equal(supported.hub.annexOperationsV71.provingGround.nextOperationCharge, true);
  assert.equal(supported.hub.annexOperationsV71.durandal.ewCharge, true);
});

test('une capsule réduit une seule fois les dégâts, le stress et les dommages module d’une crise perdue', () => {
  const base = createDefaultSave();
  base.hub.moduleIntegrity = Object.fromEntries(base.hub.moduleIds.map((id) => [id, 100]));
  base.hub.activeCrisis = {
    id: 'crisis-pods-v71',
    kind: 'xenomorph',
    count: 4,
    deck: 2,
    roomId: 'quarantine',
    resolved: false
  };
  const armed = structuredClone(base);
  applyHubAnnexBusinessV71(armed, 'escape-pods');
  const event = { action: HUB_CRISIS_ACTIONS.playerDown, crisisId: 'crisis-pods-v71', kind: 'xenomorph' };
  const unprotected = planHubCrisisResolution(base, event);
  const protectedResult = planHubCrisisResolution(armed, event);
  assert.equal(protectedResult.effects.evacuation.applied, true);
  assert.equal(
    protectedResult.effects.injury.severity,
    unprotected.effects.injury.severity - 14
  );
  const baseStress = Math.max(...unprotected.save.crew.map((member) => member.stress));
  const protectedStress = Math.max(...protectedResult.save.crew.map((member) => member.stress));
  assert.equal(protectedStress, baseStress - 6);
  assert.equal(
    protectedResult.effects.module.damage,
    Math.max(0, unprotected.effects.module.damage - 4)
  );
  assert.equal(protectedResult.save.hub.annexOperationsV71.escapePods.evacuationCharge, false);
});

test('les anciennes certifications de simple visite sont neutralisées à la migration', () => {
  const save = createDefaultSave();
  Object.assign(save.hub.annexOperationsV71.provingGround, {
    nextOperationCharge: true,
    powerLoaderCertified: true,
    advancedTutorialsComplete: true
  });
  Object.assign(save.hub.annexOperationsV71.escapePods, {
    evacuationCharge: true,
    destructionDrillCertified: true
  });
  const restored = migrateSave(JSON.parse(JSON.stringify(save)), save.profile);
  assert.deepEqual(restored.hub.annexOperationsV71.provingGround, {
    nextOperationCharge: false,
    lastQualificationIdV81: null,
    qualificationReceiptIdsV81: [],
    qualificationsCompletedV81: 0,
    bestScoreV81: 0,
    powerLoaderCertified: false,
    advancedTutorialsComplete: false
  });
  assert.deepEqual(restored.hub.annexOperationsV71.escapePods, {
    evacuationCharge: true,
    destructionDrillCertified: false
  });
  assert.equal(getHubAnnexDeploymentSupportV71(restored, P5000_VEHICLE_ID_V71).powerLoaderFuelReduction, 0);
  const proving = applyHubAnnexBusinessV71(restored, 'proving-ground');
  const pods = applyHubAnnexBusinessV71(restored, 'escape-pods');
  assert.doesNotMatch(proving.message, /certifi|tutoriel/i);
  assert.doesNotMatch(pods.message, /certifi|autodestruction/i);
  assert.equal(proving.details.powerLoaderCertified, false);
  assert.equal(proving.details.qualificationRequiredV81, true);
  assert.equal(pods.details.destructionDrillCertified, false);
});

test('la baie synthétique ne modifie jamais une unité capturée, disparue, morte ou sans santé', () => {
  const syntheticIds = CREW.filter((member) => member.species === 'synthetic').map((member) => member.id);
  for (const unavailable of [
    { status: 'captured', health: 30 },
    { status: 'missing', health: 30 },
    { status: 'deceased', health: 30 },
    { status: 'active', health: 0 }
  ]) {
    const save = createDefaultSave();
    for (const member of save.crew.filter((entry) => syntheticIds.includes(entry.id))) {
      Object.assign(member, unavailable, { stress: 60, fatigue: 50 });
    }
    const before = structuredClone(save.crew);
    const receipt = applyHubAnnexBusinessV71(save, 'synthetic-bay');
    assert.deepEqual(receipt.details.servicedCrewIds, []);
    assert.deepEqual(save.crew, before, unavailable.status);
  }
});

test('CCTV ne présente pas une crise résolue comme un contact actif', () => {
  const save = createDefaultSave();
  save.hub.activeCrisis = { id: 'resolved-cctv', resolved: true };
  save.hub.annexOperationsV71.lastCctvScanCrisisId = 'resolved-cctv';
  const receipt = applyHubAnnexBusinessV71(save, 'cctv');
  assert.equal(receipt.details.crisisId, null);
  assert.equal(save.hub.annexOperationsV71.lastCctvScanCrisisId, null);
  assert.match(receipt.message, /aucun incident actif détecté/);
});

test('la morgue déduplique les dossiers et preuves présents plusieurs fois dans le même lot', () => {
  const save = createDefaultSave();
  const record = { crewId: 'crew-01', operationId: 'lost-duplicate', day: 4 };
  save.memorial = [record, { ...record }];
  activeInfestation(save, 'morgue-duplicates');
  const proof = { id: 'morgue-proof-duplicate', type: 'biological', label: 'Preuve', confidence: 80 };
  save.hub.infestationChain.evidence = [proof, { ...proof }];
  const first = applyHubAnnexBusinessV71(save, 'morgue');
  assert.equal(first.details.newCases, 1);
  assert.equal(first.details.newEvidence, 1);
  assert.equal(first.details.researchAward, 3);
  assert.equal(applyHubAnnexBusinessV71(save, 'morgue').details.researchAward, 0);
});

test('la morgue garde 300 puis 512 dossiers traités et leurs preuves après sauvegarde', () => {
  let save = createDefaultSave();
  save.memorial = Array.from({ length: 300 }, (_, index) => ({
    crewId: `crew-${index}`, operationId: `operation-${index}`, day: 3
  }));
  activeInfestation(save, 'morgue-large-history');
  addInfestationEvidenceV62(save, {
    id: 'morgue-history-proof', type: 'biological', label: 'Preuve', confidence: 80
  });
  const first = applyHubAnnexBusinessV71(save, 'morgue');
  assert.equal(first.details.newCases, 300);
  assert.equal(first.details.newEvidence, 1);
  const awarded = save.galaxy.resources.research;
  for (let pass = 0; pass < 3; pass += 1) {
    save = migrateSave(JSON.parse(JSON.stringify(save)), save.profile);
    assert.equal(save.hub.annexOperationsV71.processedMorgueCaseKeys.length, 300);
    const repeated = applyHubAnnexBusinessV71(save, 'morgue');
    assert.equal(repeated.details.researchAward, 0);
    assert.equal(repeated.details.newCases, 0);
    assert.equal(repeated.details.newEvidence, 0);
    assert.equal(save.galaxy.resources.research, awarded);
  }
  save.memorial.push(...Array.from({ length: 212 }, (_, index) => ({
    crewId: `new-crew-${index}`, operationId: `new-operation-${index}`, day: 4
  })));
  assert.equal(applyHubAnnexBusinessV71(save, 'morgue').details.newCases, 212);
  save = migrateSave(JSON.parse(JSON.stringify(save)), save.profile);
  assert.equal(save.hub.annexOperationsV71.processedMorgueCaseKeys.length, 512);
  assert.equal(applyHubAnnexBusinessV71(save, 'morgue').details.researchAward, 0);
});

test('les longues clés composées de morgue restent identiques après normalisation', () => {
  let save = createDefaultSave();
  save.memorial = [{
    crewId: 'c'.repeat(180), operationId: 'o'.repeat(180), day: 8
  }];
  assert.equal(applyHubAnnexBusinessV71(save, 'morgue').details.newCases, 1);
  assert.ok(save.hub.annexOperationsV71.processedMorgueCaseKeys[0].length > 180);
  save = migrateSave(JSON.parse(JSON.stringify(save)), save.profile);
  assert.equal(applyHubAnnexBusinessV71(save, 'morgue').details.newCases, 0);
});
