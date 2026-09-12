import test from 'node:test';
import assert from 'node:assert/strict';
import { CREW, WEAPONS, EQUIPMENT } from '../src/content.js';
import {
  APTITUDE_DEFINITIONS_V85, RECRUITMENT_POOL_SIZE_V85, RECRUITMENT_REFRESH_HOURS_V85,
  RECRUITMENT_COST_V85, RECRUIT_STAT_BUDGET_V85, RECRUIT_GEAR_BUDGET_V85,
  RECRUIT_VISUAL_PROFILE_V85, RECRUIT_GEAR_CATALOG_V85,
  createRecruitmentV85, sanitizeRecruitmentV85, sanitizeRecruitProfileV85,
  generateNextRecruitmentPoolV85, resolveCrewDefinitionV85
} from '../src/crew-recruitment-v85.js';

const ids = ['tir', 'physique', 'mobilite', 'sangFroid', 'technique', 'secourisme', 'perception', 'cohesion'];
const sum = object => Object.values(object).reduce((total, value) => total + value, 0);
const copy = value => structuredClone(value);
const gearById = new Map(RECRUIT_GEAR_CATALOG_V85.map(item => [item.catalogId, item]));
const specimen = () => createRecruitmentV85(123).candidates[0];

test('V85 uses the eight recovered source aptitudes and explicit separate design budgets', () => {
  assert.deepEqual(APTITUDE_DEFINITIONS_V85.map(entry => entry.id), ids);
  assert.deepEqual(APTITUDE_DEFINITIONS_V85.map(entry => entry.label), ['Tir', 'Physique', 'Mobilité', 'Sang-froid', 'Technique', 'Secourisme', 'Perception', 'Cohésion']);
  assert.equal(RECRUIT_STAT_BUDGET_V85, 400);
  assert.equal(RECRUIT_GEAR_BUDGET_V85, 600);
  assert.equal(RECRUITMENT_COST_V85, 600);
  assert.equal(RECRUITMENT_POOL_SIZE_V85, 4);
  assert.equal(RECRUITMENT_REFRESH_HOURS_V85, 24);
  assert.ok(Object.isFrozen(APTITUDE_DEFINITIONS_V85));
  assert.ok(APTITUDE_DEFINITIONS_V85.every(Object.isFrozen));
});

test('the initial four original examples reproduce every stated source number and unchanged 50s', () => {
  const pool = createRecruitmentV85('source-examples').candidates;
  const expected = [
    { name: 'Mara Voss', callsign: 'RIVET', changes: { technique: 74, physique: 62, mobilite: 38, secourisme: 26 } },
    { name: 'Nadia Bensaïd', callsign: 'SUTURE', changes: { secourisme: 72, sangFroid: 60, tir: 34, physique: 34 } },
    { name: 'Jonas Reed', callsign: 'BASTION', changes: { tir: 70, physique: 66, mobilite: 34, technique: 30 } },
    { name: 'Jun Seo', callsign: 'BALISE', changes: { perception: 72, mobilite: 64, physique: 34, cohesion: 30 } }
  ];
  pool.forEach((profile, index) => {
    assert.equal(profile.name, expected[index].name);
    assert.equal(profile.callsign, expected[index].callsign);
    assert.deepEqual(profile.aptitudes, { ...Object.fromEntries(ids.map(id => [id, 50])), ...expected[index].changes });
    assert.equal(sum(profile.aptitudes), 400);
    assert.equal(profile.canonStatus, 'project-fiction-not-franchise-canon');
    assert.notEqual(profile.id, CREW[0].id);
    assert.notEqual(profile.name, CREW[0].name);
  });
  assert.deepEqual({ ...pool[0].breakdown.technique, explanations: [] }, { base: 50, experience: 16, formation: 8, total: 74, explanations: [] });
});

test('kits use existing item IDs, a semantic allowlist and explicit ammunition policy', () => {
  const catalogs = new Map([...WEAPONS, ...EQUIPMENT].map(item => [item.id, item]));
  for (const item of RECRUIT_GEAR_CATALOG_V85) {
    assert.ok(catalogs.has(item.catalogId), item.catalogId);
    assert.ok(['weapon', 'medical', 'repair', 'scan', 'armor', 'ammo'].includes(item.function));
    assert.ok(item.mass > 0 && item.value > 0);
    assert.ok(Number.isInteger(item.charges));
    assert.ok(Object.isFrozen(item));
    if (item.kind === 'weapon') assert.equal(item.reserveMagazines, 3);
    if (item.function === 'ammo') assert.equal(item.ammunitionWeaponId, 'weapon-007-m37a2-pump-shotgun');
  }
  assert.equal(gearById.get('equipment-006-medkit').function, 'medical');
  assert.equal(gearById.get('equipment-004-cutting-torch').function, 'repair');
  assert.equal(gearById.get('equipment-001-motion-tracker').function, 'scan');
});

test('personal objects remain biographical, and unavailable source props are not fictional inventory items', () => {
  for (const profile of createRecruitmentV85(7).candidates) {
    assert.equal(profile.gear.filter(item => item.kind === 'weapon').length, 1);
    assert.ok(profile.background.personalObject.length > 0);
    assert.ok(profile.gear.every(item => gearById.has(item.catalogId)));
    assert.ok(profile.gear.every(item => item.reason.length > 20));
    assert.ok(profile.gear.reduce((value, item) => value + item.value, 0) <= profile.gearBudget);
    assert.equal(profile.equipmentPolicy, 'v85-existing-functional-kits-not-full-source-props');
    assert.equal(profile.artStatus, 'shared-standard-uniform-no-individual-portrait');
    assert.equal(profile.visualProfileId, RECRUIT_VISUAL_PROFILE_V85);
    assert.equal(Object.hasOwn(profile, 'portrait'), false);
    assert.equal(Object.hasOwn(profile, 'serviceHistory'), false);
  }
});

test('creation is deterministic for numeric and string seeds without sharing mutable objects', () => {
  for (const seed of [0, 1, -1, 123, 4294967295, 'tantalus', '', NaN, Infinity, null, {}]) {
    const first = createRecruitmentV85(seed);
    const second = createRecruitmentV85(seed);
    assert.deepEqual(first, second);
    first.candidates[0].aptitudes.tir = 99;
    first.candidates[0].gear[0].reason = 'changed';
    assert.notDeepEqual(first, second);
    assert.deepEqual(createRecruitmentV85(seed), second);
  }
});

test('different campaigns namespace identities and item instances even for initial source examples', () => {
  const first = createRecruitmentV85(1).candidates;
  const second = createRecruitmentV85(2).candidates;
  assert.equal(new Set([...first, ...second].map(profile => profile.id)).size, 8);
  assert.equal(new Set([...first, ...second].flatMap(profile => profile.gear.map(item => item.instanceId))).size, 24);
  assert.deepEqual(first[0].aptitudes, second[0].aptitudes);
});

test('complete initial dossiers round trip and sanitization strips unknown properties', () => {
  const profile = specimen();
  const raw = JSON.parse(JSON.stringify(profile));
  raw.admin = true;
  raw.background.extra = '<script>not retained</script>';
  raw.breakdown.technique.untrusted = 9999;
  const result = sanitizeRecruitProfileV85(raw);
  assert.deepEqual(result, profile);
  result.gear[0].reason = 'changed';
  assert.notEqual(result.gear[0].reason, raw.gear[0].reason);
});

for (const [field, mutate] of [
  ['schema', profile => { profile.schema = 86; }],
  ['id', profile => { profile.id = 'crew-01-mara-vega'; }],
  ['id serial', profile => { profile.id = profile.id.slice(0, -6) + '000000'; }],
  ['name HTML', profile => { profile.name = '<img src=x>'; }],
  ['name NPC', profile => { profile.name = 'Mara Vega'; }],
  ['callsign', profile => { profile.callsign = 'OTHER'; }],
  ['demographic modifier', profile => { profile.background.origin = 'Changed colony'; profile.aptitudes.tir += 2; }],
  ['balanced but unearned aptitude', profile => { profile.aptitudes.tir += 1; profile.aptitudes.technique -= 1; }],
  ['forged breakdown', profile => { profile.breakdown.technique.experience = 999; }],
  ['missing breakdown', profile => { delete profile.breakdown.cohesion; }],
  ['forged gear ID', profile => { profile.gear[0].catalogId = 'weapon-025-plasma-rifle'; }],
  ['duplicated gear', profile => { profile.gear[1] = copy(profile.gear[0]); }],
  ['stolen gear instance', profile => { profile.gear[0].instanceId = 'another-crew-item'; }],
  ['gear mass', profile => { profile.gear[0].mass = 0; }],
  ['price', profile => { profile.recruitCost = 0; }],
  ['budget', profile => { profile.statBudget = 800; }],
  ['signature', profile => { profile.signature = 'name-only'; }],
  ['visual identity', profile => { profile.visualProfileId = 'crew-01-mara-vega'; }],
  ['canon claim', profile => { profile.canonStatus = 'franchise-canon'; }]
]) test(`initial dossier validation rejects ${field}`, () => {
  const profile = specimen();
  mutate(profile);
  assert.equal(sanitizeRecruitProfileV85(profile), null);
});

test('malformed and unbounded raw profiles fail closed without scalar coercion', () => {
  for (const raw of [null, undefined, false, 0, 'profile', [], {}, { schema: 85, id: 'x'.repeat(50000) }, { schema: 85, id: {} }]) {
    assert.equal(sanitizeRecruitProfileV85(raw), null);
  }
});

test('invalid/legacy recruitment state never creates candidates implicitly on reload', () => {
  for (const raw of [undefined, null, {}, [], { schema: 84 }, { schema: 999 }]) {
    const state = sanitizeRecruitmentV85(raw);
    assert.equal(state.candidates.length, 0);
    assert.equal(state.serial, 0);
    assert.equal(state.lastOfferHour, 0);
    assert.deepEqual(sanitizeRecruitmentV85(state), state);
  }
});

test('reloading or rendering an unchanged pool cannot reroll identities, biographies, kit or timestamp', () => {
  let state = createRecruitmentV85(71);
  state.lastOfferHour = 6;
  const expected = copy(state);
  for (let step = 0; step < 100; step += 1) state = sanitizeRecruitmentV85(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(state, expected);
  for (const hour of [null, undefined, NaN, Infinity, '30', -1, 0, 6, 29.99, 2400001]) {
    assert.deepEqual(generateNextRecruitmentPoolV85(state, hour), expected);
  }
});

test('refresh at its exact deadline creates one independent pool and repeated request is idempotent', () => {
  const state = createRecruitmentV85(71);
  state.lastOfferHour = 6;
  const before = copy(state);
  const next = generateNextRecruitmentPoolV85(state, 30);
  assert.deepEqual(state, before);
  assert.equal(next.lastOfferHour, 30);
  assert.equal(next.candidates.length, 4);
  assert.ok(next.serial > before.serial);
  assert.ok(next.candidates.every(profile => !before.candidates.some(old => old.id === profile.id || old.signature === profile.signature)));
  assert.deepEqual(generateNextRecruitmentPoolV85(next, 30), next);
  assert.deepEqual(sanitizeRecruitmentV85(JSON.parse(JSON.stringify(next))), next);
});

test('removing a hired candidate preserves the remaining exact offers after reload', () => {
  const state = createRecruitmentV85(1);
  const hired = state.candidates.splice(1, 1)[0];
  const after = sanitizeRecruitmentV85(state);
  assert.deepEqual(after, state);
  assert.equal(after.serial, 4);
  assert.ok(!after.candidates.some(profile => profile.id === hired.id));
  assert.equal(after.candidates.length, 3);
});

test('pool sanitizer bounds forged data and deduplicates identities/signatures without generating', () => {
  const state = createRecruitmentV85(3);
  const otherSeed = createRecruitmentV85(4).candidates[0];
  state.candidates = [state.candidates[0], copy(state.candidates[0]), otherSeed, ...state.candidates.slice(1)];
  state.serial = -100;
  state.lastOfferHour = Infinity;
  state.recentSignatures = ['<script>', null, 'x'.repeat(10000), ...state.recentSignatures];
  const cleaned = sanitizeRecruitmentV85(state);
  assert.equal(cleaned.candidates.length, 4);
  assert.equal(new Set(cleaned.candidates.map(profile => profile.id)).size, 4);
  assert.equal(cleaned.serial, 4);
  assert.equal(cleaned.lastOfferHour, 0);
  assert.equal(cleaned.recentSignatures.length, 4);
  assert.deepEqual(sanitizeRecruitmentV85(cleaned), cleaned);
});

test('generation at the serial ceiling is bounded and never partially replaces a pool', () => {
  const state = createRecruitmentV85(3);
  state.serial = 999999;
  assert.deepEqual(generateNextRecruitmentPoolV85(state, 100), sanitizeRecruitmentV85(state));
  state.serial = 999998;
  assert.deepEqual(generateNextRecruitmentPoolV85(state, 100), sanitizeRecruitmentV85(state));
});

test('1024 generated profiles preserve budgets, causal explanations, recent diversity and unique item ownership', () => {
  let state = createRecruitmentV85('large-cohort');
  const identities = new Set(state.candidates.map(profile => profile.id));
  const itemIds = new Set(state.candidates.flatMap(profile => profile.gear.map(item => item.instanceId)));
  const structures = new Set();
  for (let wave = 1; wave <= 256; wave += 1) {
    const prior = new Set(state.recentSignatures);
    const next = generateNextRecruitmentPoolV85(state, wave * 24);
    assert.equal(next.candidates.length, 4);
    assert.equal(new Set(next.candidates.map(profile => profile.signature)).size, 4);
    assert.equal(next.diversityFallbackUsed, false);
    assert.ok(next.recentSignatures.length <= 32);
    for (const profile of next.candidates) {
      assert.ok(!prior.has(profile.signature), profile.signature);
      assert.ok(!identities.has(profile.id)); identities.add(profile.id);
      structures.add(profile.signature);
      assert.equal(sum(profile.aptitudes), 400);
      assert.equal(Object.keys(profile.aptitudes).length, 8);
      assert.equal(profile.gear.reduce((value, item) => value + item.value, 0) <= 600, true);
      for (const id of ids) {
        const breakdown = profile.breakdown[id];
        assert.equal(breakdown.base, 50);
        assert.equal(breakdown.base + breakdown.experience + breakdown.formation, profile.aptitudes[id]);
        assert.equal(breakdown.total, profile.aptitudes[id]);
        assert.equal(breakdown.explanations.length, 3);
        assert.ok(profile.aptitudes[id] >= 0 && profile.aptitudes[id] <= 100);
      }
      for (const item of profile.gear) { assert.ok(!itemIds.has(item.instanceId)); itemIds.add(item.instanceId); }
      assert.deepEqual(sanitizeRecruitProfileV85(profile), profile);
    }
    state = sanitizeRecruitmentV85(JSON.parse(JSON.stringify(next)));
  }
  assert.equal(identities.size, 1028);
  assert.equal(itemIds.size, 3084);
  assert.equal(structures.size, 64);
});

test('aptitudes depend on activity and formation, never on identity or origin', () => {
  const byStructure = new Map();
  let distinctDemographicComparisons = 0;
  for (let seed = 0; seed < 24; seed += 1) {
    let state = createRecruitmentV85(seed);
    for (let wave = 1; wave <= 16; wave += 1) {
      state = generateNextRecruitmentPoolV85(state, wave * 24);
      for (const profile of state.candidates) {
        const prior = byStructure.get(profile.signature);
        if (prior) {
          assert.deepEqual(profile.aptitudes, prior.aptitudes);
          if (prior.name !== profile.name && prior.background.origin !== profile.background.origin) distinctDemographicComparisons += 1;
        } else byStructure.set(profile.signature, profile);
      }
    }
  }
  assert.ok(distinctDemographicComparisons > 100);
});

test('hired definition retains dynamic identity, immutable background and current gear/training independently', () => {
  const profile = specimen();
  const gear = [copy(profile.gear[1])];
  const member = { id: profile.id, recruitV85: profile, status: 'injured', health: 42, stress: 7, fatigue: 12,
    trainingV85: { technique: 4, tir: 200, cohesion: -5 }, gearV85: gear };
  const definition = resolveCrewDefinitionV85(member, CREW);
  assert.equal(definition.id, profile.id);
  assert.equal(definition.name, 'Mara Voss');
  assert.equal(definition.callsign, 'RIVET');
  assert.equal(definition.health, 42);
  assert.equal(definition.aptitudesV85.technique, 78);
  assert.equal(definition.aptitudesV85.tir, 100);
  assert.equal(definition.aptitudesV85.cohesion, 50);
  assert.equal(definition.recruitV85.aptitudes.technique, 74);
  assert.deepEqual(definition.gearV85, gear);
  assert.equal(definition.visualProfileId, 'echo9-standard-v85');
  definition.gearV85[0].reason = 'changed';
  definition.recruitV85.background.event = 'changed';
  assert.notEqual(member.gearV85[0].reason, 'changed');
  assert.notEqual(member.recruitV85.background.event, 'changed');
});

test('removing all functional gear is respected and not silently refilled from the historical dossier', () => {
  const profile = specimen();
  const definition = resolveCrewDefinitionV85({ id: profile.id, recruitV85: profile, gearV85: [] }, CREW);
  assert.deepEqual(definition.gearV85, []);
  assert.equal(definition.recruitV85.gear.length, 3);
});

test('missing current gear gets the original kit once in resolution without modifying the member', () => {
  const profile = specimen();
  const member = { id: profile.id, recruitV85: profile };
  const definition = resolveCrewDefinitionV85(member, CREW);
  assert.deepEqual(definition.gearV85, profile.gear);
  assert.equal(Object.hasOwn(member, 'gearV85'), false);
});

test('legacy crew preserve names, roles and stats without fabricated background or service feats', () => {
  const original = CREW[0];
  const member = { id: original.id, name: 'Injected rename', status: 'injured', health: 44, missions: 12, kills: 3, trainingV85: { cohesion: 2 } };
  const definition = resolveCrewDefinitionV85(member, CREW);
  assert.equal(definition.name, original.name);
  assert.equal(definition.specialty, original.specialty);
  assert.equal(definition.status, 'injured');
  assert.equal(definition.health, 44);
  assert.equal(definition.missions, 12);
  assert.equal(definition.kills, 3);
  assert.equal(definition.aptitudesV85.cohesion, 52);
  assert.equal(definition.aptitudesV85.technique, 50);
  for (const key of ['recruitV85', 'background', 'gearV85', 'serviceHistoryV85', 'visualProfileId']) assert.equal(Object.hasOwn(definition, key), false);
});

test('unknown, mismatched or forged recruit identities cannot silently borrow a legacy NPC definition', () => {
  const profile = specimen();
  assert.equal(resolveCrewDefinitionV85({ id: 'unknown' }, CREW), null);
  assert.equal(resolveCrewDefinitionV85({ id: CREW[0].id, recruitV85: profile }, CREW), null);
  const invalid = copy(profile); invalid.aptitudes.tir = 99;
  assert.equal(resolveCrewDefinitionV85({ id: profile.id, recruitV85: invalid }, CREW), null);
  for (const raw of [null, undefined, [], {}, false]) assert.equal(resolveCrewDefinitionV85(raw, CREW), null);
});
