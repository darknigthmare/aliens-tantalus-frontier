import test from 'node:test';
import assert from 'node:assert/strict';
import { CREW, CAMPAIGNS, WORLDS, WEAPONS, EQUIPMENT, VEHICLES } from '../src/content.js';
import { SaveSystem, createDefaultSave, migrateSave, beginOperation, resolveOperation, resolveOperationDeployment,
  advanceStrategicClock, assignCrewMember, recruitCandidateV85, refreshRecruitmentV85,
  trainCrewAptitudeV85, transferCrewGearV85, RECRUITMENT_RULES_V85, recordOperationResumeState } from '../src/save.js';
import { createRecruitmentV85, generateNextRecruitmentPoolV85, resolveCrewDefinitionV85 } from '../src/crew-recruitment-v85.js';

const aptitudes = ['tir', 'physique', 'mobilite', 'sangFroid', 'technique', 'secourisme', 'perception', 'cohesion'];
const catalogs = { crewCatalog: CREW, weaponCatalog: WEAPONS, equipmentCatalog: EQUIPMENT, vehicleCatalog: VEHICLES };
function available() {
  const save = createDefaultSave(1);
  save.needsPlayerCreationV84 = false;
  save.galaxy.resources.credits = 999999;
  save.hub.systems.supplies = 100;
  return save;
}
function hire(save, index = 0) { return recruitCandidateV85(save, save.recruitmentV85.candidates[index].id).member; }
function operation(save) {
  const campaign = CAMPAIGNS.find((entry) => !entry.specialOperationId && save.galaxy.unlockedWorldIds.includes(entry.worldId));
  const world = WORLDS.find((entry) => entry.id === campaign.worldId);
  return beginOperation(save, campaign, world).operation;
}
function store(save = available()) {
  const values = new Map();
  const backend = { values, denied: false, getItem: key => values.get(key) ?? null,
    setItem(key, value) { if (this.denied) throw new Error('quota'); values.set(key, value); }, removeItem: key => values.delete(key) };
  const system = new SaveSystem(backend);
  system.import(JSON.stringify(save));
  return { backend, system };
}
const immutableRefusal = (save, action, pattern) => {
  const before = JSON.stringify(save);
  assert.throws(action, pattern);
  assert.equal(JSON.stringify(save), before);
};

test('new pool is four stable offers, and reloading/reading does not replace hired candidates', () => {
  const save = available();
  assert.equal(save.recruitmentV85.candidates.length, 4);
  const before = structuredClone(save.recruitmentV85);
  assert.deepEqual(migrateSave(save).recruitmentV85, before);
  const expected = structuredClone(before.candidates[0]);
  const inventory = structuredClone(save.strategy.inventory);
  const credits = save.galaxy.resources.credits;
  const member = hire(save);
  assert.equal(member.id, expected.id);
  assert.deepEqual(member.recruitV85, expected);
  assert.deepEqual(member.gearV85, expected.gear);
  assert.equal(save.galaxy.resources.credits, credits - 600);
  assert.deepEqual(save.strategy.inventory, inventory, 'instances are not global catalogue unlocks');
  assert.equal(save.recruitmentV85.candidates.length, 3);
  const migrated = migrateSave(save);
  assert.deepEqual(migrated.recruitmentV85, save.recruitmentV85);
  assert.deepEqual(migrated.crew.find(entry => entry.id === member.id), member);
  immutableRefusal(save, () => recruitCandidateV85(save, member.id), /Candidat absent/);
});

test('recruitment refusal for an unknown candidate, payment or capacity changes nothing', () => {
  const save = available();
  immutableRefusal(save, () => recruitCandidateV85(save, 'nonexistent'), /Candidat absent/);
  save.galaxy.resources.credits = 599;
  immutableRefusal(save, () => hire(save), /Ressources insuffisantes/);
  save.galaxy.resources.credits = 999999;
  let pool = createRecruitmentV85(5);
  let hour = 0;
  while (save.crew.filter(member => member.recruitV85).length < 64) {
    save.recruitmentV85 = pool;
    for (const candidate of [...pool.candidates]) recruitCandidateV85(save, candidate.id);
    hour += 24; pool = generateNextRecruitmentPoolV85(pool, hour);
  }
  save.recruitmentV85 = pool;
  immutableRefusal(save, () => hire(save), /64 recrues/);
  assert.equal(migrateSave(save).crew.filter(member => member.recruitV85).length, 64);
});

test('refresh requires elapsed game time, preserves remaining offers on early refusal and never advances time itself', () => {
  const save = available();
  const oldIds = save.recruitmentV85.candidates.map(entry => entry.id);
  immutableRefusal(save, () => refreshRecruitmentV85(save), /24 heures/);
  advanceStrategicClock(save, 23.5);
  immutableRefusal(save, () => refreshRecruitmentV85(save), /24 heures/);
  advanceStrategicClock(save, .5);
  const clock = structuredClone(save.clock);
  const credits = save.galaxy.resources.credits;
  assert.equal(refreshRecruitmentV85(save).hours, 0);
  assert.deepEqual(save.clock, clock);
  assert.equal(save.galaxy.resources.credits, credits);
  assert.equal(save.recruitmentV85.candidates.length, 4);
  assert.ok(save.recruitmentV85.candidates.every(entry => !oldIds.includes(entry.id)));
  immutableRefusal(save, () => refreshRecruitmentV85(save), /24 heures/);
  save.clock = { day: 1, hour: 0 };
  immutableRefusal(save, () => refreshRecruitmentV85(save), /24 heures/);
});

for (const mode of ['operation', 'onboarding', 'creator']) test(`all four actions refuse ${mode} before any mutation`, () => {
  const save = available(); const member = hire(save);
  if (mode === 'operation') operation(save);
  if (mode === 'onboarding') save.onboardingV84 = { phase: 'medical' };
  if (mode === 'creator') save.needsPlayerCreationV84 = true;
  for (const action of [() => hire(save), () => refreshRecruitmentV85(save),
    () => trainCrewAptitudeV85(save, member.id, 'tir'),
    () => transferCrewGearV85(save, member.id, save.crew[0].id, member.gearV85[0].instanceId)]) {
    immutableRefusal(save, action, /opération|accueil/);
  }
});

for (const legacy of [false, true]) test(`all eight trainings are accessible without classes (${legacy ? 'legacy neutral baseline' : 'new recruit'})`, () => {
  const save = available(); const member = legacy ? save.crew[0] : hire(save);
  const profile = structuredClone(member.recruitV85);
  const pool = structuredClone(save.recruitmentV85);
  for (const aptitudeId of aptitudes) {
    const before = resolveCrewDefinitionV85(member, CREW).aptitudesV85[aptitudeId];
    const credits = save.galaxy.resources.credits;
    const supplies = save.hub.systems.supplies;
    const absolute = (save.clock.day - 1) * 24 + save.clock.hour;
    const result = trainCrewAptitudeV85(save, member.id, aptitudeId);
    assert.equal(result.value, before + 2);
    assert.equal(result.hours, 4);
    assert.equal(save.galaxy.resources.credits, credits - 80);
    assert.equal(save.hub.systems.supplies, supplies - 1);
    assert.equal((save.clock.day - 1) * 24 + save.clock.hour, absolute + 4);
  }
  assert.deepEqual(member.recruitV85, profile);
  assert.deepEqual(save.recruitmentV85, pool, 'training time does not reroll candidates');
  const restored = migrateSave(save).crew.find(entry => entry.id === member.id);
  assert.deepEqual(restored.trainingV85, member.trainingV85);
  if (legacy) assert.equal(Object.hasOwn(restored, 'recruitV85'), false);
  immutableRefusal(save, () => trainCrewAptitudeV85(save, member.id, '__proto__'), /Aptitude inconnue/);
});

test('training caps at 100, never charges a capped/unavailable Marine or an invalid request', () => {
  const save = available(); const member = hire(save);
  member.trainingV85.tir = 49;
  assert.equal(trainCrewAptitudeV85(save, member.id, 'tir').value, 100);
  immutableRefusal(save, () => trainCrewAptitudeV85(save, member.id, 'tir'), /maximal/);
  member.status = 'deceased';
  immutableRefusal(save, () => trainCrewAptitudeV85(save, member.id, 'secourisme'), /indisponible/);
  member.status = 'active'; save.galaxy.resources.credits = 0;
  immutableRefusal(save, () => trainCrewAptitudeV85(save, member.id, 'secourisme'), /Ressources insuffisantes/);
});

test('gear transfer conserves one physical instance, including legacy recipients, without changing the original dossier', () => {
  const save = available(); const one = hire(save); const two = hire(save);
  const legacy = save.crew[0];
  const profiles = [structuredClone(one.recruitV85), structuredClone(two.recruitV85)];
  const inventory = structuredClone(save.strategy.inventory);
  const gear = one.gearV85[0];
  transferCrewGearV85(save, one.id, two.id, gear.instanceId);
  assert.equal(one.gearV85.some(entry => entry.instanceId === gear.instanceId), false);
  transferCrewGearV85(save, two.id, legacy.id, gear.instanceId);
  assert.deepEqual(legacy.gearV85, [gear]);
  const restored = migrateSave(save);
  assert.equal(restored.crew.flatMap(entry => entry.gearV85 || []).filter(entry => entry.instanceId === gear.instanceId).length, 1);
  assert.deepEqual(restored.crew.find(entry => entry.id === legacy.id).gearV85, [gear]);
  assert.deepEqual([one.recruitV85, two.recruitV85], profiles);
  assert.deepEqual(save.strategy.inventory, inventory);
  immutableRefusal(save, () => transferCrewGearV85(save, one.id, legacy.id, gear.instanceId), /absent ou dupliqué/);
  immutableRefusal(save, () => transferCrewGearV85(save, legacy.id, legacy.id, gear.instanceId), /distincts/);
});

test('empty current gear is preserved, forged/duplicate instances cannot be imported or transferred', () => {
  const save = available(); const one = hire(save); const two = hire(save);
  for (const gear of [...one.gearV85]) transferCrewGearV85(save, one.id, two.id, gear.instanceId);
  assert.deepEqual(migrateSave(save).crew.find(entry => entry.id === one.id).gearV85, []);
  const duplicate = structuredClone(two.gearV85[0]);
  one.gearV85 = [duplicate, { ...duplicate, instanceId: 'invented' }];
  immutableRefusal(save, () => transferCrewGearV85(save, one.id, two.id, duplicate.instanceId), /dupliqué/);
  const restored = migrateSave(save);
  const instances = restored.crew.flatMap(member => member.gearV85 || []).map(gear => gear.instanceId);
  assert.equal(new Set(instances).size, instances.length);
  assert.equal(instances.includes('invented'), false);
});

test('migration keeps identities by ID rather than position and bounds/validates dynamic records', () => {
  const save = available(); const recruited = hire(save);
  const canonical = structuredClone(save.crew[0]); canonical.health = 44;
  save.crew = [recruited, canonical, ...save.crew.slice(1, -1), structuredClone(recruited),
    { ...recruited, id: 'forged' }, { ...structuredClone(recruited), id: 'bad', recruitV85: {} }];
  const restored = migrateSave(save);
  assert.equal(restored.crew.find(entry => entry.id === canonical.id).health, 44);
  assert.equal(restored.crew.filter(entry => entry.id === recruited.id).length, 1);
  assert.equal(restored.crew.some(entry => entry.id === 'bad' || entry.id === 'forged'), false);
  assert.equal(restored.crew.filter(entry => !entry.recruitV85).length, CREW.length);
  assert.equal(restored.crew[1].id, CREW[1].id);
  const tampered = structuredClone(recruited); tampered.recruitV85.aptitudes.tir = 100;
  save.crew = [tampered];
  assert.equal(migrateSave(save).crew.some(entry => entry.id === recruited.id), false);
});

test('malformed V85 payloads fail closed without generation, fake history or effective-stat overrides', () => {
  for (const raw of [null, [], 'bad', { schema: 99 }, { schema: 85, candidates: [null, {}, '<script>'] }]) {
    const save = available(); save.recruitmentV85 = raw;
    assert.deepEqual(migrateSave(save).recruitmentV85.candidates, []);
  }
  const save = available(); const member = hire(save);
  member.trainingV85 = { tir: Infinity, physique: 99999, mobilite: -100, __proto__: { technique: 100 } };
  member.aptitudesV85 = Object.fromEntries(aptitudes.map(id => [id, 99999]));
  member.serviceHistoryV85 = [{ type: 'kill', operationId: 'operation-1-invented', text: 'Killed queen' }, null];
  member.relationsV85 = [{ crewId: 'unknown', sharedMissions: 100 }];
  const restored = migrateSave(save).crew.find(entry => entry.id === member.id);
  assert.equal(restored.trainingV85.tir, 0);
  assert.equal(restored.trainingV85.physique, 38);
  assert.equal(restored.trainingV85.mobilite, 0);
  assert.equal(restored.trainingV85.technique, 0, 'prototype keys cannot grant training');
  assert.equal(Object.hasOwn(restored, 'aptitudesV85'), false);
  assert.deepEqual(restored.serviceHistoryV85, []);
  assert.deepEqual(restored.relationsV85, []);
});

test('legacy migration adds no retroactive campaign story, relationships or invented dossier', () => {
  const save = available(); delete save.recruitmentV85;
  save.crew[0].missions = 88; save.crew[0].kills = 123;
  save.clock = { day: 8, hour: 12 };
  const migrated = migrateSave(save);
  assert.equal(migrated.crew[0].missions, 88); assert.equal(migrated.crew[0].kills, 123);
  assert.equal(migrated.crew[0].recruitV85, undefined);
  assert.equal(migrated.crew[0].serviceHistoryV85, undefined);
  assert.equal(migrated.crew[0].relationsV85, undefined);
  assert.equal(migrated.recruitmentV85.lastOfferHour, 180);
  assert.deepEqual(migrateSave(migrated).recruitmentV85, migrated.recruitmentV85);
});

test('selection and full operation manifest preserve real recruit identities, stats and objects across reload', () => {
  const save = available(); const one = hire(save); const two = hire(save);
  trainCrewAptitudeV85(save, one.id, 'tir');
  save.strategy.selectedCrewIds = [one.id]; assignCrewMember(save, two.id);
  const op = operation(save);
  const snapshot = structuredClone(op.crewManifestV85);
  assert.equal(snapshot[0].name, one.recruitV85.name);
  assert.equal(snapshot[0].aptitudesV85.tir, one.recruitV85.aptitudes.tir + 2);
  assert.deepEqual(snapshot[0].gearV85, one.gearV85);
  one.trainingV85.tir = 50; one.gearV85 = []; one.name = 'Impostor';
  assert.deepEqual(resolveOperationDeployment(save, catalogs).crew, snapshot);
  const restored = migrateSave(save);
  assert.deepEqual(restored.strategy.selectedCrewIds, [one.id, two.id]);
  assert.deepEqual(restored.strategy.currentOperation.crewIds, [one.id, two.id]);
  assert.deepEqual(resolveOperationDeployment(restored, catalogs).crew, snapshot);
  const external = resolveOperationDeployment(restored, catalogs).crew;
  external[0].trainingV85.tir = 0; external[0].gearV85.length = 0;
  assert.deepEqual(restored.strategy.currentOperation.crewManifestV85, snapshot);
});

test('pre-V85 active operations without manifests still resolve their known legacy crew', () => {
  const save = available(); operation(save); delete save.strategy.currentOperation.crewManifestV85;
  const restored = migrateSave(save);
  assert.equal(restored.strategy.currentOperation.crewManifestV85, undefined);
  assert.deepEqual(resolveOperationDeployment(restored, catalogs).crew.map(entry => entry.id), save.strategy.currentOperation.crewIds);
});

test('mission completion records only actual participants/outcome, never allocates total kills or duplicates relationships', () => {
  const save = available(); const one = hire(save); const two = hire(save); const reserve = hire(save);
  save.strategy.selectedCrewIds = [one.id, two.id];
  const op = structuredClone(operation(save));
  assert.equal(resolveOperation(save, { success: true, kills: 91 }).ok, true);
  for (const member of [one, two]) {
    assert.equal(member.kills, 0);
    assert.equal(member.serviceHistoryV85.length, 1);
    assert.deepEqual(Object.keys(member.serviceHistoryV85[0]).sort(), ['campaignId', 'day', 'hour', 'operationId', 'outcome', 'schema', 'type', 'worldId']);
    assert.equal(member.serviceHistoryV85[0].outcome, 'success');
    assert.equal(member.relationsV85[0].sharedMissions, 1);
  }
  assert.deepEqual(reserve.serviceHistoryV85, []);
  assert.deepEqual(reserve.relationsV85, []);
  assert.equal(resolveOperation(save, { success: true }).ok, false);
  save.strategy.currentOperation = op;
  resolveOperation(save, { success: false, reason: 'retreat' });
  assert.equal(one.serviceHistoryV85.length, 1);
  assert.equal(one.relationsV85[0].sharedMissions, 1);
  const restored = migrateSave(save);
  assert.deepEqual(restored.crew.find(entry => entry.id === one.id).serviceHistoryV85, one.serviceHistoryV85);
});

test('history and relation ledgers stay bounded and old serials cannot be replayed after history eviction', () => {
  const save = available(); const one = hire(save); const two = hire(save);
  save.strategy.selectedCrewIds = [one.id, two.id];
  const original = structuredClone(operation(save));
  for (let serial = 1; serial <= 70; serial += 1) {
    save.strategy.currentOperation = { ...structuredClone(original), id: `operation-${serial}-history-test` };
    resolveOperation(save, { success: true, kills: 100 });
  }
  assert.equal(one.serviceHistoryV85.length, 64);
  assert.equal(one.lastServiceOperationSerialV85, 70);
  assert.equal(one.relationsV85[0].sharedMissions, 70);
  save.strategy.currentOperation = { ...original, id: 'operation-1-history-test' };
  resolveOperation(save, { success: true });
  assert.equal(one.relationsV85[0].sharedMissions, 70);
  assert.equal(one.kills, 0);
});

for (const action of ['hire', 'refresh', 'training', 'transfer']) test(`${action}: quota failure preserves original save bytes and active data via candidate transaction`, () => {
  const initial = available(); const member = hire(initial); advanceStrategicClock(initial, 24);
  const { backend, system } = store(initial);
  const root = system.data; const before = JSON.stringify(root); const bytes = [...backend.values];
  const candidate = structuredClone(root);
  if (action === 'hire') hire(candidate);
  if (action === 'refresh') refreshRecruitmentV85(candidate);
  if (action === 'training') trainCrewAptitudeV85(candidate, member.id, 'technique');
  if (action === 'transfer') transferCrewGearV85(candidate, member.id, candidate.crew[0].id, member.gearV85[0].instanceId);
  backend.denied = true;
  assert.throws(() => system.commit(candidate), error => error.code === 'SAVE_WRITE_FAILED');
  assert.equal(system.data, root); assert.equal(JSON.stringify(root), before); assert.deepEqual([...backend.values], bytes);
  backend.denied = false;
  system.commit(candidate);
  const restored = new SaveSystem(backend).load(1);
  assert.deepEqual(restored.recruitmentV85, system.data.recruitmentV85);
  assert.deepEqual(restored.crew, system.data.crew);
});

test('rules expose the separate explicit design costs rather than interpreting profile quotations as prices', () => {
  assert.deepEqual(RECRUITMENT_RULES_V85.recruitCost, { credits: 600 });
  assert.deepEqual(RECRUITMENT_RULES_V85.trainingCost, { credits: 80, supplies: 1 });
  assert.equal(RECRUITMENT_RULES_V85.trainingGain, 2);
  assert.equal(RECRUITMENT_RULES_V85.trainingHours, 4);
  assert.equal(RECRUITMENT_RULES_V85.maxRecruits, 64);
});

test('lowered import serial cannot re-offer an engaged identity or reuse a recorded mission serial', () => {
  const save = available();
  for (let batch = 0; batch < 4; batch += 1) { advanceStrategicClock(save, 24); refreshRecruitmentV85(save); }
  const member = hire(save);
  const issuedSerial = save.recruitmentV85.serial;
  save.recruitmentV85.serial = 0;
  save.recruitmentV85.candidates = [];
  save.strategy.serial = 0;
  member.lastServiceOperationSerialV85 = 500;
  const restored = migrateSave(save);
  assert.ok(restored.recruitmentV85.serial > 4);
  assert.ok(restored.recruitmentV85.serial <= issuedSerial);
  assert.equal(restored.strategy.serial, 500);
  advanceStrategicClock(restored, 24);
  refreshRecruitmentV85(restored);
  assert.ok(restored.recruitmentV85.candidates.every(profile => profile.id !== member.id));
  assert.equal(restored.recruitmentV85.candidates.length, 4);
});

test('native squad individual ammunition, charges and tactical reload survive public save and load without aliasing', () => {
  const save = available(); const member = hire(save);
  save.strategy.selectedCrewIds = [member.id]; const op = operation(save);
  const weapon = member.gearV85.find(gear => gear.kind === 'weapon');
  const equipment = member.gearV85.find(gear => gear.kind === 'equipment');
  const runtime = { schema: 85, crewId: member.id, weaponId: weapon.catalogId, ammo: 4, ammoReserve: 17,
    endurance: 73, stress: 14, charges: { [equipment.instanceId]: 1 }, fireClock: .1, supportClock: 2,
    tacticalReloadV77: { phase: 'active', elapsed: .25, totalDuration: 1.8, success: false } };
  const checkpoint = { schema: 1, identity: { operationId: op.id, campaignId: op.campaignId },
    squad: { members: [{ id: member.id, crewId: member.id, crewRuntimeV85: runtime }] } };
  assert.equal(recordOperationResumeState(save, checkpoint), true);
  const { backend, system } = store(save);
  const restored = new SaveSystem(backend).load(system.profile);
  assert.deepEqual(restored.strategy.currentOperation.resumeState.squad.members[0].crewRuntimeV85, runtime);
  runtime.ammo = 999; runtime.charges[equipment.instanceId] = 999;
  assert.equal(restored.strategy.currentOperation.resumeState.squad.members[0].crewRuntimeV85.ammo, 4);
});
