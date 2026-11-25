import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  TANTALUS_PRIORITIES_BASELINE_V188, TANTALUS_PRIORITIES_SUCCESSORS_V188, TANTALUS_PRIORITIES_CONTINUATION_V188,
  TANTALUS_PRIORITIES_PROLOGUE_V188, TANTALUS_PRIORITIES_QUAY_V188, TANTALUS_PRIORITIES_CARGO_ABYSS_V188,
  TANTALUS_PRIORITIES_HADAL_V188, TANTALUS_PRIORITIES_BROODSTORM_V188, TANTALUS_PRIORITIES_QUEEN_MOTHER_V188,
  TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188, TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188, TANTALUS_PRIORITIES_LEAD_CONTINUATION_V188,
  TANTALUS_PRIORITIES_XENO_TRIALS_JOIN_V188,
  reviewedTantalusMergedIntegrationDigestV188, projectFiorinaHistoricalRegistryV188,
  fiorinaHistoricalRegistryReaderV188, FIORINA_HISTORICAL_REGISTRY_PROJECTION_V188, projectFiorinaHistoricalCampaignsV188,
  TANTALUS_PRIORITIES_SOURCE_ONLY_PATHS_V188, reviewedTantalusPrioritiesDigestV188,
  verifyTantalusPrioritiesV188, TANTALUS_PRIORITIES_CARGO_REGISTRY_V188, verifyCargoRegistryContinuationV188,
  TANTALUS_PRIORITIES_BROODSTORM_REGISTRY_V188, verifyBroodstormRegistryContinuationV188,
  TANTALUS_PRIORITIES_QUEEN_MOTHER_REGISTRY_V188, verifyQueenMotherRegistryContinuationV188,
  TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_REGISTRY_V188, verifyQueenMotherGuardRegistryContinuationV188,
  TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_REGISTRY_V188, verifyQueenMotherChoirRegistryContinuationV188
} from './audit-tantalus-priorities-v188.mjs';
import { verifyNativeQaResourcesV187 } from './audit-native-qa-resources-v187.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { collectReleaseTestsV143 } from './test-release-v143.mjs';
import { SPECIAL_OPERATIONS_V131 as operations, SPECIAL_OPERATION_COUNTS_V131 as operationCounts } from '../src/special-operations-v131.js';
import { CAMPAIGNS, CONTENT_COUNTS, CONTENT_TARGETS } from '../src/content.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

// Historical verifiers keep their own inputs: restore Q to the exact B2
// declarations first; only the Cargo test then restores Broodstorm to H.
const bOperations = operations.map(operation => ({ ...operation, remainingMechanics: operation.id === 'queen-mother-song'
  ? ['dedicated-queen-mother-animation', 'complete-royal-cast'] : [...operation.remainingMechanics] }));

// The lead continuation (after b6e01ef1) and then the Xeno Trials join (after 0d1d9950) are the last
// links before the exact cumulative Aliens 1986 and inherited Fiorina continuations.
const leadEndV188 = (path, digest) => {
  const r = TANTALUS_PRIORITIES_LEAD_CONTINUATION_V188.successors[path];
  const lead = r && r.previousSha256 === digest ? r.currentSha256 : digest;
  const j = Object.hasOwn(TANTALUS_PRIORITIES_XENO_TRIALS_JOIN_V188.successors, path) ? TANTALUS_PRIORITIES_XENO_TRIALS_JOIN_V188.successors[path] : null;
  return reviewedTantalusMergedIntegrationDigestV188(path, j && j.previousSha256 === lead ? j.currentSha256 : lead);
};

test('Fiorina projects the live registry and campaign catalog to their historical declarations without changing the inputs', () => {
  const beforeRows = JSON.stringify(operations), beforeCounts = JSON.stringify(operationCounts);
  const projection = projectFiorinaHistoricalRegistryV188(operations, operationCounts, read);
  assert.deepEqual(operationCounts, { total: 22, effective: 2, partial: 20, missing: 0, playable: 22 });
  assert.equal(operations[0].id, 'alien3-fiorina-161');
  assert.deepEqual(projection.counts, { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 });
  assert.equal(projection.operations.length, 21);
  assert.ok(projection.operations.every((row, index) => row === operations[index + 1]), 'Every historical row retains its identity and position');
  const declarations = projection.operations.map(row => Object.keys(row).filter(key => key !== 'campaign').sort().map(key => [key, row[key]]));
  assert.equal(sha(JSON.stringify(declarations)), FIORINA_HISTORICAL_REGISTRY_PROJECTION_V188.currentDeclarationsSha256);
  const path = FIORINA_HISTORICAL_REGISTRY_PROJECTION_V188.registryPath;
  assert.equal(sha(read(path)), FIORINA_HISTORICAL_REGISTRY_PROJECTION_V188.currentSha256);
  assert.equal(sha(projection.readSource(path)), FIORINA_HISTORICAL_REGISTRY_PROJECTION_V188.previousSha256);
  assert.deepEqual(projection.readSource('docs/forge/xeno-trials/progress-v158.json'), read('docs/forge/xeno-trials/progress-v158.json'));
  const repeated = projectFiorinaHistoricalRegistryV188(projection.operations, projection.counts, projection.readSource);
  assert.deepEqual(repeated.operations, projection.operations);
  assert.deepEqual(repeated.counts, projection.counts);
  assert.deepEqual(repeated.readSource(path), projection.readSource(path));
  assert.equal(JSON.stringify(operations), beforeRows);
  assert.equal(JSON.stringify(operationCounts), beforeCounts);
  const beforeCampaigns = JSON.stringify(CAMPAIGNS);
  const campaigns = projectFiorinaHistoricalCampaignsV188(CAMPAIGNS);
  assert.equal(campaigns.length, 526);
  assert.equal(CAMPAIGNS.length, 527);
  assert.equal(CONTENT_COUNTS.campaigns, 527);
  assert.equal(CONTENT_TARGETS.campaigns, 527);
  assert.ok(campaigns.every((campaign, index) => campaign === CAMPAIGNS[index]));
  assert.ok(Object.isFrozen(campaigns));
  assert.equal(JSON.stringify(CAMPAIGNS), beforeCampaigns);
});

test('Fiorina projection rejects unreviewed additions, deceptive declarations, inconsistent counts and further source changes', () => {
  const clone = () => structuredClone(operations);
  for (const [reason, mutate] of [
    ['promoted Fiorina', rows => { rows[0].implementationStatus = 'effective'; }],
    ['changed campaign', rows => { rows[0].campaign.objective += ' unreviewed'; }],
    ['changed scope', rows => { rows[0].remainingMechanics.pop(); }],
    ['extra field', rows => { rows[0].unreviewed = true; }],
    ['hidden field', rows => { Object.defineProperty(rows[0], 'hidden', { value: true }); }],
    ['symbol field', rows => { rows[0][Symbol('hidden')] = true; }],
    ['undefined field', rows => { rows[0].unreviewed = undefined; }],
    ['non-JSON value', rows => { rows[0].campaign.year = Infinity; }],
    ['object accessor', rows => { const year = rows[0].campaign.year; Object.defineProperty(rows[0].campaign, 'year', { get: () => year, enumerable: true }); }],
    ['array accessor', rows => { const value = rows[0].remainingMechanics[0]; Object.defineProperty(rows[0].remainingMechanics, '0', { get: () => value, enumerable: true }); }],
    ['extra array field', rows => { rows[0].remainingMechanics.unreviewed = true; }],
    ['array hole', rows => { delete rows[0].remainingMechanics[0]; }],
    ['changed prototype', rows => { Object.setPrototypeOf(rows[0], { unreviewed: true }); }],
    ['duplicate Fiorina', rows => { rows.push(structuredClone(rows[0])); }],
    ['changed position', rows => { [rows[0], rows[1]] = [rows[1], rows[0]]; }],
    ['unreviewed 22nd operation', rows => { rows[0].id = 'unreviewed-operation'; }],
    ['23rd operation', rows => { rows.push({ ...rows[1], id: 'unreviewed-operation', productionOrder: 23 }); }],
  ]) {
    const rows = clone(); mutate(rows);
    assert.throws(() => projectFiorinaHistoricalRegistryV188(rows, operationCounts, read), undefined, reason);
  }
  for (const counts of [{ ...operationCounts, total: 21 }, { ...operationCounts, partial: 19 }, { ...operationCounts, extra: 1 }])
    assert.throws(() => projectFiorinaHistoricalRegistryV188(operations, counts, read), /Fiorina projection requires exact live registry counters/);
  for (const [reason, mutate] of [
    ['missing Fiorina campaign', rows => { rows.pop(); }],
    ['duplicate Fiorina campaign', rows => { rows[0] = rows.at(-1); }],
    ['another campaign instead of Fiorina', rows => { rows.at(-1).id = 'unreviewed-campaign'; }],
    ['changed Fiorina objective', rows => { rows.at(-1).objective += ' unreviewed'; }],
    ['changed Fiorina world', rows => { rows.at(-1).worldId = 'unreviewed-world'; }],
    ['hidden Fiorina campaign field', rows => { Object.defineProperty(rows.at(-1), 'hidden', { value: true }); }],
    ['reordered Fiorina campaign', rows => { [rows[0], rows[526]] = [rows[526], rows[0]]; }],
    ['additional campaign', rows => { rows.push({ ...rows[0], id: 'unreviewed-campaign' }); }],
    ['duplicate historical campaign identity', rows => { rows[1].id = rows[0].id; }],
  ]) {
    const campaigns = structuredClone(CAMPAIGNS); mutate(campaigns);
    assert.throws(() => projectFiorinaHistoricalCampaignsV188(campaigns), undefined, reason);
  }
  const changed = clone();
  changed.find(row => row.id === 'black-cocoon').promisedTitle += ' unreviewed';
  assert.throws(() => verifyQueenMotherChoirRegistryContinuationV188(changed, operationCounts, read), /preserve every exact R registry declaration/);
  for (const source of [read(FIORINA_HISTORICAL_REGISTRY_PROJECTION_V188.registryPath),
    fiorinaHistoricalRegistryReaderV188(read)(FIORINA_HISTORICAL_REGISTRY_PROJECTION_V188.registryPath)]) {
    const mutated = Buffer.from(source); mutated[mutated.length - 1] ^= 1;
    const reader = fiorinaHistoricalRegistryReaderV188(path => path === FIORINA_HISTORICAL_REGISTRY_PROJECTION_V188.registryPath ? mutated : read(path));
    assert.throws(() => reader(FIORINA_HISTORICAL_REGISTRY_PROJECTION_V188.registryPath), /Unreviewed Fiorina registry source bytes/);
  }
});

test('V188 registry continuation closes only the Cargo art debt and rejects neighboring promotions', () => {
  // Cargo remains tested on H, after restoring the later Queen Mother and
  // Broodstorm deltas. The historical verifier and its assertions stay intact.
  const hOperations = bOperations.map(operation => ({ ...operation, remainingMechanics: operation.id === 'broodstorm'
    ? ['dedicated-flying-queen-art', 'complete-modular-dropship-corpus'] : [...operation.remainingMechanics] }));
  const transition = TANTALUS_PRIORITIES_CARGO_REGISTRY_V188;
  assert.deepEqual(transition, {
    baseline: '232693f1e0ed24e404bb2fb0dbcd779611ccd2fc',
    historicalSnapshot: { path: 'docs/forge/xeno-trials/progress-v158.json',
      sha256: '4af5ae6469aa13ec1ea999eaa1fced2f616f23363a3df806cf2d34deb6c67ef7' },
    operationId: 'cargo-brutal', removedDebt: 'dedicated-cargo-matriarch-art',
    titlesAlreadyPublishedAtBaseline: {
      'hive-world': 'TR-0 : LA RUCHE-MONDE',
      'narrative-collectables': 'QZ-17 — LA CARGAISON FANTÔME'
    },
    previousCounts: { total: 21, effective: 1, partial: 20, missing: 0, playable: 21 },
    currentCounts: { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 }
  });
  assert.deepEqual(verifyCargoRegistryContinuationV188(hOperations, operationCounts), {
    historicalCounts: transition.previousCounts, currentCounts: transition.currentCounts,
    changedIds: ['cargo-brutal'], unchangedOperations: 20
  });
  assert.equal(Object.isFrozen(transition), true); assert.equal(Object.isFrozen(transition.currentCounts), true);
  const byId = (rows, id) => rows.find(row => row.id === id);
  for (const [reason, mutate] of [
    ['old Cargo debt retained', rows => { byId(rows, 'cargo-brutal').remainingMechanics = ['dedicated-cargo-matriarch-art']; }],
    ['invented Cargo debt', rows => { byId(rows, 'cargo-brutal').remainingMechanics = ['unreviewed-new-debt']; }],
    ['Cargo demoted', rows => { byId(rows, 'cargo-brutal').implementationStatus = 'partial'; }],
    ['Cocon promoted instead of Cargo', rows => {
      byId(rows, 'cargo-brutal').implementationStatus = 'partial';
      byId(rows, 'black-cocoon').implementationStatus = 'effective';
    }],
    ['HADAL promoted instead of Cargo', rows => {
      byId(rows, 'cargo-brutal').implementationStatus = 'partial';
      byId(rows, 'black-abyss').implementationStatus = 'effective';
    }],
    ['Cocon debt removed without changing its count', rows => { byId(rows, 'black-cocoon').remainingMechanics.shift(); }],
    ['HADAL debt removed without changing its count', rows => { byId(rows, 'black-abyss').remainingMechanics.shift(); }],
    ['combined debt string hides a changed list', rows => {
      const entry = byId(rows, 'black-abyss'); entry.remainingMechanics = [entry.remainingMechanics.join('; ')];
    }],
    ['canon claim', rows => { byId(rows, 'cargo-brutal').canonExact = true; }],
    ['missing adaptation disclosure', rows => { delete byId(rows, 'black-cocoon').canonExact; }],
    ['changed identity', rows => { byId(rows, 'cargo-brutal').id = 'other-cargo'; }],
    ['changed route', rows => { byId(rows, 'cargo-brutal').campaignId = 'other-campaign'; }],
    ['changed title', rows => { byId(rows, 'cargo-brutal').promisedTitle = 'Other title'; }],
    ['published hive title reverted', rows => { byId(rows, 'hive-world').promisedTitle = 'LV-XENO : LA RUCHE-MONDE'; }],
    ['unreviewed narrative title', rows => { byId(rows, 'narrative-collectables').promisedTitle = 'Other narrative'; }],
    ['not playable', rows => { byId(rows, 'cargo-brutal').playable = false; }],
    ['reordered identities', rows => rows.reverse()],
    ['removed operation', rows => rows.pop()],
    ['duplicate operation', rows => rows.push(rows[0])]
  ]) {
    const mutated = hOperations.map(operation => ({ ...operation, remainingMechanics: [...operation.remainingMechanics] }));
    mutate(mutated);
    assert.throws(() => verifyCargoRegistryContinuationV188(mutated, operationCounts), undefined, reason);
  }
  for (const badCounts of [transition.previousCounts, { ...operationCounts, playable: 20 },
    { ...operationCounts, extra: 1 }]) {
    assert.throws(() => verifyCargoRegistryContinuationV188(hOperations, badCounts), /Registry counters|Fiorina projection requires exact live registry counters/);
  }
  assert.throws(() => verifyCargoRegistryContinuationV188(hOperations, operationCounts,
    path => Buffer.concat([read(path), Buffer.from('\n')])), /Changed historical V158 operations snapshot/);
});

test('Broodstorm registry continuation removes only queen art, projects exact H and keeps historical Cargo evidence', () => {
  const transition = TANTALUS_PRIORITIES_BROODSTORM_REGISTRY_V188;
  assert.equal(transition.baseline, '361e40670c393dd548b4faa081f12edb0e9b05c4');
  assert.deepEqual(transition.baselineRegistry, {
    path: 'src/special-operations-v131.js',
    sha256: '5c412f4c3adb8df674b25740ce7b2227a0ead01844c82d219a226a3497035243',
    declarationsSha256: 'b9fb8c67c5cb0e06b2c8a75fb8bfc39765b8b78357e445acca702ec92ba32a14'
  });
  assert.deepEqual(transition.previousRemainingMechanics, ['dedicated-flying-queen-art', 'complete-modular-dropship-corpus']);
  assert.deepEqual(transition.currentRemainingMechanics, ['complete-modular-dropship-corpus']);
  assert.equal(Object.isFrozen(transition.baselineRegistry), true);
  const before = JSON.stringify(bOperations);
  const result = verifyBroodstormRegistryContinuationV188(bOperations, operationCounts);
  assert.deepEqual(result, {
    historicalCounts: { total: 21, effective: 1, partial: 20, missing: 0, playable: 21 },
    currentCounts: { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 },
    changedIds: ['cargo-brutal', 'broodstorm'], unchangedOperations: 19
  });
  assert.equal(JSON.stringify(bOperations), before, 'Projection must not rewrite live declarations or campaign objects.');
  assert.equal(Object.isFrozen(result.changedIds), true);
  assert.throws(() => verifyCargoRegistryContinuationV188(bOperations, operationCounts), /Only the Cargo art debt/,
    'The old verifier must not silently admit a second transition.');
  const byId = (rows, id = 'broodstorm') => rows.find(row => row.id === id);
  for (const [reason, mutate] of [
    ['old queen debt retained', rows => { byId(rows).remainingMechanics.unshift('dedicated-flying-queen-art'); }],
    ['dropship debt removed', rows => { byId(rows).remainingMechanics = []; }],
    ['dropship debt replaced', rows => { byId(rows).remainingMechanics = ['unreviewed-dropship']; }],
    ['extra debt', rows => { byId(rows).remainingMechanics.push('unreviewed-debt'); }],
    ['duplicate debt', rows => { byId(rows).remainingMechanics.push('complete-modular-dropship-corpus'); }],
    ['missing debt array', rows => { byId(rows).remainingMechanics = 'complete-modular-dropship-corpus'; }],
    ['whole chapter promoted', rows => { byId(rows).implementationStatus = 'effective'; }],
    ['canon claim', rows => { byId(rows).canonExact = true; }],
    ['adaptation flag removed', rows => { delete byId(rows).canonExact; }],
    ['not playable', rows => { byId(rows).playable = false; }],
    ['changed identity', rows => { byId(rows).id = 'other-broodstorm'; }],
    ['changed route', rows => { byId(rows).campaignId = 'other-campaign'; }],
    ['changed title', rows => { byId(rows).promisedTitle = 'Other title'; }],
    ['changed neighbor title', rows => { byId(rows, 'black-cocoon').promisedTitle = 'Other Cocon'; }],
    ['changed production order', rows => { byId(rows).productionOrder += 1; }],
    ['required mechanics removed', rows => { byId(rows).requiredMechanics = ['flying-queen']; }],
    ['new declaration field', rows => { byId(rows).unreviewed = undefined; }],
    ['Cocon promoted', rows => { byId(rows, 'black-cocoon').implementationStatus = 'effective'; }],
    ['HADAL promoted', rows => { byId(rows, 'black-abyss').implementationStatus = 'effective'; }],
    ['Cocon debt removed', rows => { byId(rows, 'black-cocoon').remainingMechanics.shift(); }],
    ['HADAL debt removed', rows => { byId(rows, 'black-abyss').remainingMechanics.shift(); }],
    ['Cargo debt reinstated', rows => { byId(rows, 'cargo-brutal').remainingMechanics = ['dedicated-cargo-matriarch-art']; }],
    ['reordered declarations', rows => rows.reverse()],
    ['removed neighbor', rows => rows.pop()],
    ['duplicate identity', rows => rows.push({ ...byId(rows) })]
  ]) {
    const mutated = bOperations.map(operation => ({ ...operation, remainingMechanics: [...operation.remainingMechanics] }));
    mutate(mutated);
    assert.throws(() => verifyBroodstormRegistryContinuationV188(mutated, operationCounts), undefined, reason);
  }
  assert.throws(() => verifyBroodstormRegistryContinuationV188(bOperations,
    { ...operationCounts, partial: 18, effective: 3 }), /does not promote|Fiorina projection requires exact live registry counters/);
  assert.throws(() => verifyBroodstormRegistryContinuationV188(bOperations, operationCounts,
    path => Buffer.concat([read(path), Buffer.from('\n')])), /Changed historical V158 operations snapshot/,
  'The new projection still verifies the immutable archive through the original Cargo verifier.');
});

test('Queen Mother registry continuation removes only animation, projects exact B2 and preserves Broodstorm and Cargo evidence', () => {
  const transition = TANTALUS_PRIORITIES_QUEEN_MOTHER_REGISTRY_V188;
  assert.deepEqual(transition, {
    baseline: 'b9aee06a0783bc7c0cf7094268a08618364df781',
    baselineRegistry: {
      path: 'src/special-operations-v131.js',
      sha256: '99a629ceba7042ca320e50d384fe9b9e734bdefa452bd5485899661adca5b45a',
      declarationsSha256: 'bc90066e0fa20fc3222d5f252354622af72df66f5670f868ea29fb582ccbebec'
    },
    operationId: 'queen-mother-song', removedDebt: 'dedicated-queen-mother-animation',
    previousRemainingMechanics: ['dedicated-queen-mother-animation', 'complete-royal-cast'],
    currentRemainingMechanics: ['complete-royal-cast'],
    previousCounts: { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 },
    currentCounts: { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 }
  });
  assert.equal(Object.isFrozen(transition.baselineRegistry), true);
  assert.equal(Object.isFrozen(transition.previousRemainingMechanics), true);
  const before = JSON.stringify(operations);
  const result = verifyQueenMotherRegistryContinuationV188(operations, operationCounts);
  assert.deepEqual(result, {
    historicalCounts: { total: 21, effective: 1, partial: 20, missing: 0, playable: 21 },
    currentCounts: { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 },
    changedIds: ['cargo-brutal', 'broodstorm', 'queen-mother-song'], unchangedOperations: 18
  });
  assert.equal(JSON.stringify(operations), before, 'Projection must not rewrite live declarations or campaign objects.');
  assert.equal(Object.isFrozen(result.changedIds), true);
  assert.throws(() => verifyBroodstormRegistryContinuationV188(operations, operationCounts), /exact H registry declarations/,
    'The unchanged Broodstorm verifier must reject the third transition without projection.');
  const byId = (rows, id = 'queen-mother-song') => rows.find(row => row.id === id);
  for (const [reason, mutate] of [
    ['old animation debt retained', rows => { byId(rows).remainingMechanics.unshift('dedicated-queen-mother-animation'); }],
    ['royal cast debt removed', rows => { byId(rows).remainingMechanics = []; }],
    ['royal cast debt replaced', rows => { byId(rows).remainingMechanics = ['unreviewed-royal-cast']; }],
    ['extra debt', rows => { byId(rows).remainingMechanics.push('unreviewed-debt'); }],
    ['duplicate debt', rows => { byId(rows).remainingMechanics.push('complete-royal-cast'); }],
    ['missing debt array', rows => { byId(rows).remainingMechanics = 'complete-royal-cast'; }],
    ['whole chapter promoted', rows => { byId(rows).implementationStatus = 'effective'; }],
    ['canon claim', rows => { byId(rows).canonExact = true; }],
    ['adaptation flag removed', rows => { delete byId(rows).canonExact; }],
    ['not playable', rows => { byId(rows).playable = false; }],
    ['changed identity', rows => { byId(rows).id = 'other-queen-mother'; }],
    ['changed route', rows => { byId(rows).campaignId = 'other-campaign'; }],
    ['changed title', rows => { byId(rows).promisedTitle = 'Other Queen Mother'; }],
    ['changed summary', rows => { byId(rows).promiseSummary = 'Unreviewed scope'; }],
    ['changed production order', rows => { byId(rows).productionOrder += 1; }],
    ['required mechanics removed', rows => { byId(rows).requiredMechanics = ['queen-mother']; }],
    ['new declaration field', rows => { byId(rows).unreviewed = undefined; }],
    ['changed neighbor title', rows => { byId(rows, 'black-cocoon').promisedTitle = 'Other Cocon'; }],
    ['Cocon promoted', rows => { byId(rows, 'black-cocoon').implementationStatus = 'effective'; }],
    ['HADAL promoted', rows => { byId(rows, 'black-abyss').implementationStatus = 'effective'; }],
    ['Cocon debt removed', rows => { byId(rows, 'black-cocoon').remainingMechanics.shift(); }],
    ['HADAL debt removed', rows => { byId(rows, 'black-abyss').remainingMechanics.shift(); }],
    ['Broodstorm debt reinstated', rows => { byId(rows, 'broodstorm').remainingMechanics.unshift('dedicated-flying-queen-art'); }],
    ['Broodstorm dropship debt removed', rows => { byId(rows, 'broodstorm').remainingMechanics = []; }],
    ['Cargo debt reinstated', rows => { byId(rows, 'cargo-brutal').remainingMechanics = ['dedicated-cargo-matriarch-art']; }],
    ['reordered declarations', rows => rows.reverse()],
    ['removed neighbor', rows => rows.pop()],
    ['missing Queen Mother', rows => rows.splice(rows.findIndex(row => row.id === 'queen-mother-song'), 1)],
    ['duplicate identity', rows => rows.push({ ...byId(rows) })]
  ]) {
    const mutated = operations.map(operation => ({ ...operation, remainingMechanics: [...operation.remainingMechanics] }));
    mutate(mutated);
    assert.throws(() => verifyQueenMotherRegistryContinuationV188(mutated, operationCounts), undefined, reason);
  }
  for (const badCounts of [{ ...operationCounts, partial: 18, effective: 3 },
    { ...operationCounts, playable: 20 }, { ...operationCounts, extra: 1 }]) {
    assert.throws(() => verifyQueenMotherRegistryContinuationV188(operations, badCounts), /does not promote|Fiorina projection requires exact live registry counters/);
  }
  assert.throws(() => verifyQueenMotherRegistryContinuationV188(operations, operationCounts,
    path => Buffer.concat([read(path), Buffer.from('\n')])), /Changed historical V158 operations snapshot/,
  'Q-to-B2-to-H projection still verifies the immutable archive through the original Cargo verifier.');
});

test('Queen Mother guard presentation projects identically to Q, leaves every debt open and adds no changed operation', () => {
  const continuation = TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_REGISTRY_V188;
  assert.deepEqual(continuation, {
    baseline: 'c1d4c636347275d2d3a6ecbc15ebfcfeadfb035c',
    baselineRegistry: {
      path: 'src/special-operations-v131.js',
      sha256: '433ddc7b821c98b973c10fc9e3aa39bc66c77e8cf9364dd9f1a25d03b70b08af',
      declarationsSha256: '46cdb671b6cc3cb1591c5fe4cd124d85335278d93b79a386cddbd9cc4995618a'
    },
    operationId: 'queen-mother-song', projection: 'identity', removedDebts: [], newChangedIds: [],
    historicalChangedIds: ['cargo-brutal', 'broodstorm', 'queen-mother-song'],
    previousRemainingMechanics: ['complete-royal-cast'], currentRemainingMechanics: ['complete-royal-cast'],
    previousCounts: { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 },
    currentCounts: { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 }
  });
  for (const field of ['baselineRegistry', 'newChangedIds', 'removedDebts']) assert.equal(Object.isFrozen(continuation[field]), true);
  const before = JSON.stringify(operations);
  const result = verifyQueenMotherGuardRegistryContinuationV188(operations, operationCounts);
  assert.deepEqual(result, {
    historicalCounts: { total: 21, effective: 1, partial: 20, missing: 0, playable: 21 },
    currentCounts: { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 },
    changedIds: ['cargo-brutal', 'broodstorm', 'queen-mother-song'], unchangedOperations: 18
  });
  assert.deepEqual(result, verifyQueenMotherRegistryContinuationV188(operations, operationCounts),
    'The identity projection returns the exact historical Q result.');
  assert.equal(JSON.stringify(operations), before, 'Identity projection must not rewrite declarations or campaigns.');
  assert.equal(new Set(result.changedIds).size, 3);
  assert.equal(Object.isFrozen(result), true); assert.equal(Object.isFrozen(result.changedIds), true);
  const byId = (rows, id = 'queen-mother-song') => rows.find(row => row.id === id);
  for (const [reason, mutate] of [
    ['complete cast debt closed', rows => { byId(rows).remainingMechanics = []; }],
    ['different cast debt', rows => { byId(rows).remainingMechanics = ['choirs-only']; }],
    ['adult debt reinstated', rows => { byId(rows).remainingMechanics.unshift('dedicated-queen-mother-animation'); }],
    ['duplicate debt', rows => { byId(rows).remainingMechanics.push('complete-royal-cast'); }],
    ['whole chapter promoted', rows => { byId(rows).implementationStatus = 'effective'; }],
    ['canonical guard claim', rows => { byId(rows).canonExact = true; }],
    ['adaptation flag removed', rows => { delete byId(rows).canonExact; }],
    ['not playable', rows => { byId(rows).playable = false; }],
    ['route changed', rows => { byId(rows).campaignId = 'other-royal-campaign'; }],
    ['title changed', rows => { byId(rows).promisedTitle = 'Complete royal cast'; }],
    ['scope changed', rows => { byId(rows).requiredMechanics = ['guards']; }],
    ['summary changed', rows => { byId(rows).promiseSummary = 'Complete'; }],
    ['production order changed', rows => { byId(rows).productionOrder += 1; }],
    ['new declaration field', rows => { byId(rows).royalIdentity = undefined; }],
    ['Cocon debt removed', rows => { byId(rows, 'black-cocoon').remainingMechanics.shift(); }],
    ['HADAL promoted', rows => { byId(rows, 'black-abyss').implementationStatus = 'effective'; }],
    ['Broodstorm dropship debt closed', rows => { byId(rows, 'broodstorm').remainingMechanics = []; }],
    ['Cargo debt reinstated', rows => { byId(rows, 'cargo-brutal').remainingMechanics = ['dedicated-cargo-matriarch-art']; }],
    ['declarations reordered', rows => rows.reverse()],
    ['missing operation', rows => rows.pop()],
    ['missing Queen Mother', rows => rows.splice(rows.findIndex(row => row.id === 'queen-mother-song'), 1)],
    ['duplicate Queen Mother', rows => rows.push({ ...byId(rows) })]
  ]) {
    const mutated = operations.map(operation => ({ ...operation, remainingMechanics: [...operation.remainingMechanics] }));
    mutate(mutated);
    assert.throws(() => verifyQueenMotherGuardRegistryContinuationV188(mutated, operationCounts), undefined, reason);
  }
  for (const badCounts of [{ ...operationCounts, partial: 18, effective: 3 },
    { ...operationCounts, playable: 20 }, { ...operationCounts, extra: 1 }]) {
    assert.throws(() => verifyQueenMotherGuardRegistryContinuationV188(operations, badCounts), /does not change registry counts|Fiorina projection requires exact live registry counters/);
  }
  const presentationOnly = operations.map(operation => operation.id === 'queen-mother-song'
    ? { ...operation, campaign: { ...operation.campaign, description: 'A separately reviewed guard presentation.' } } : operation);
  assert.deepEqual(verifyQueenMotherGuardRegistryContinuationV188(presentationOnly, operationCounts), result,
    'Campaign presentation retains its separate source receipt without inventing a registry delta.');
  assert.throws(() => verifyQueenMotherGuardRegistryContinuationV188(operations, operationCounts,
    path => path === continuation.baselineRegistry.path ? Buffer.concat([read(path), Buffer.from('\n')]) : read(path)),
  /retain the exact Q registry source bytes|Unreviewed Fiorina registry source bytes/);
  const archive = TANTALUS_PRIORITIES_CARGO_REGISTRY_V188.historicalSnapshot.path;
  assert.throws(() => verifyQueenMotherGuardRegistryContinuationV188(operations, operationCounts,
    path => path === archive ? Buffer.concat([read(path), Buffer.from('\n')]) : read(path)),
  /Changed historical V158 operations snapshot/, 'Identity R-to-Q still follows Q-to-B2-to-H and the original Cargo witness.');
});

test('Queen Mother choir presentation projects identically to R, leaves every debt open and adds no changed operation', () => {
  const continuation = TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_REGISTRY_V188;
  assert.deepEqual(continuation, {
    baseline: 'ded6ef34dd35a659313e9361b407f6b94b62fb96',
    baselineRegistry: {
      path: 'src/special-operations-v131.js',
      sha256: '433ddc7b821c98b973c10fc9e3aa39bc66c77e8cf9364dd9f1a25d03b70b08af',
      declarationsSha256: '46cdb671b6cc3cb1591c5fe4cd124d85335278d93b79a386cddbd9cc4995618a'
    },
    operationId: 'queen-mother-song', projection: 'identity', removedDebts: [], newChangedIds: [],
    historicalChangedIds: ['cargo-brutal', 'broodstorm', 'queen-mother-song'],
    previousRemainingMechanics: ['complete-royal-cast'], currentRemainingMechanics: ['complete-royal-cast'],
    previousCounts: { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 },
    currentCounts: { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 }
  });
  for (const field of ['baselineRegistry', 'newChangedIds', 'removedDebts']) assert.equal(Object.isFrozen(continuation[field]), true);
  const before = JSON.stringify(operations);
  const result = verifyQueenMotherChoirRegistryContinuationV188(operations, operationCounts);
  assert.deepEqual(result, {
    historicalCounts: { total: 21, effective: 1, partial: 20, missing: 0, playable: 21 },
    currentCounts: { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 },
    changedIds: ['cargo-brutal', 'broodstorm', 'queen-mother-song'], unchangedOperations: 18
  });
  assert.deepEqual(result, verifyQueenMotherGuardRegistryContinuationV188(operations, operationCounts),
    'The identity projection returns the exact historical R result.');
  assert.equal(JSON.stringify(operations), before, 'Identity projection must not rewrite declarations or campaigns.');
  assert.equal(new Set(result.changedIds).size, 3);
  assert.equal(Object.isFrozen(result), true); assert.equal(Object.isFrozen(result.changedIds), true);
  const byId = (rows, id = 'queen-mother-song') => rows.find(row => row.id === id);
  for (const [reason, mutate] of [
    ['complete cast debt closed', rows => { byId(rows).remainingMechanics = []; }],
    ['different cast debt', rows => { byId(rows).remainingMechanics = ['choirs-only']; }],
    ['adult debt reinstated', rows => { byId(rows).remainingMechanics.unshift('dedicated-queen-mother-animation'); }],
    ['duplicate debt', rows => { byId(rows).remainingMechanics.push('complete-royal-cast'); }],
    ['whole chapter promoted', rows => { byId(rows).implementationStatus = 'effective'; }],
    ['canonical choir claim', rows => { byId(rows).canonExact = true; }],
    ['adaptation flag removed', rows => { delete byId(rows).canonExact; }],
    ['not playable', rows => { byId(rows).playable = false; }],
    ['route changed', rows => { byId(rows).campaignId = 'other-royal-campaign'; }],
    ['title changed', rows => { byId(rows).promisedTitle = 'Complete royal cast'; }],
    ['scope changed', rows => { byId(rows).requiredMechanics = ['guards']; }],
    ['summary changed', rows => { byId(rows).promiseSummary = 'Complete'; }],
    ['production order changed', rows => { byId(rows).productionOrder += 1; }],
    ['new declaration field', rows => { byId(rows).royalIdentity = undefined; }],
    ['Cocon debt removed', rows => { byId(rows, 'black-cocoon').remainingMechanics.shift(); }],
    ['HADAL promoted', rows => { byId(rows, 'black-abyss').implementationStatus = 'effective'; }],
    ['Broodstorm dropship debt closed', rows => { byId(rows, 'broodstorm').remainingMechanics = []; }],
    ['Cargo debt reinstated', rows => { byId(rows, 'cargo-brutal').remainingMechanics = ['dedicated-cargo-matriarch-art']; }],
    ['declarations reordered', rows => rows.reverse()],
    ['missing operation', rows => rows.pop()],
    ['missing Queen Mother', rows => rows.splice(rows.findIndex(row => row.id === 'queen-mother-song'), 1)],
    ['duplicate Queen Mother', rows => rows.push({ ...byId(rows) })]
  ]) {
    const mutated = operations.map(operation => ({ ...operation, remainingMechanics: [...operation.remainingMechanics] }));
    mutate(mutated);
    assert.throws(() => verifyQueenMotherChoirRegistryContinuationV188(mutated, operationCounts), undefined, reason);
  }
  for (const badCounts of [{ ...operationCounts, partial: 18, effective: 3 },
    { ...operationCounts, playable: 20 }, { ...operationCounts, extra: 1 }]) {
    assert.throws(() => verifyQueenMotherChoirRegistryContinuationV188(operations, badCounts), /does not change registry counts|Fiorina projection requires exact live registry counters/);
  }
  const presentationOnly = operations.map(operation => operation.id === 'queen-mother-song'
    ? { ...operation, campaign: { ...operation.campaign, description: 'A separately reviewed choir presentation.' } } : operation);
  assert.deepEqual(verifyQueenMotherChoirRegistryContinuationV188(presentationOnly, operationCounts), result,
    'Campaign presentation retains its separate source receipt without inventing a registry delta.');
  assert.throws(() => verifyQueenMotherChoirRegistryContinuationV188(operations, operationCounts,
    path => path === continuation.baselineRegistry.path ? Buffer.concat([read(path), Buffer.from('\n')]) : read(path)),
  /retain the exact R registry source bytes|Unreviewed Fiorina registry source bytes/);
  const archive = TANTALUS_PRIORITIES_CARGO_REGISTRY_V188.historicalSnapshot.path;
  assert.throws(() => verifyQueenMotherChoirRegistryContinuationV188(operations, operationCounts,
    path => path === archive ? Buffer.concat([read(path), Buffer.from('\n')]) : read(path)),
  /Changed historical V158 operations snapshot/, 'Identity C-to-R still follows R-to-Q-to-B2-to-H and the original Cargo witness.');
});

test('V188 verifies every reviewed successor and keeps the V187 chain intact', () => {
  assert.equal(TANTALUS_PRIORITIES_BASELINE_V188, '803db26dbd7ed453d9534eee237806053438f300');
  const result = verifyTantalusPrioritiesV188();
  const continuation = TANTALUS_PRIORITIES_CONTINUATION_V188;
  assert.equal(continuation.baseline, 'da8b29fa4b7688d18686b1e28be4065c3a821d3b');
  assert.equal(Object.keys(TANTALUS_PRIORITIES_SUCCESSORS_V188).length, 106);
  assert.equal(sha(JSON.stringify(Object.fromEntries(Object.entries(TANTALUS_PRIORITIES_SUCCESSORS_V188)
    .map(([path, receipt]) => [path, receipt.previousSha256])))),
    '6ce2d3c74d91671fc8bc505faca829297e43b2ce6e19e038e97680af7a0d897c', 'Every original historical predecessor remains immutable.');
  assert.deepEqual(Object.fromEntries(Object.entries(continuation.successors).map(([path, receipt]) => [path, receipt.previousSha256])), {
    "scripts/verify-audit-continuation-v158.mjs": "87ca45b2c3c48d96e9ae02f4a57241b723372e3e12cd172ef4f978f34ba3eb98",
    "scripts/verify-black-cocoon-presentation-v158.mjs": "96029dc66cb8781bd30bd91482dbfbc7466679020fd22420784e7baaac43bfa5",
    "scripts/verify-cinematic-coherence-v188.mjs": "fd1f943ea6b50c339073a936eaed60dafa0618b472988353b93edd31d106d07f",
    "scripts/verify-dropship-handover-v188.mjs": "3f644dcaf173647081d3f1dab2c8fd642fc82d6839a7d1b26de129e567a3ca05",
    "scripts/verify-qz17-coherence-v188.mjs": "c06ba96c8b6e400f71da707ba18beed8c9f47afffb867d432c704bc8f2f92fcd",
    "scripts/verify-story-cinematics-v188.mjs": "4047f1f7607812751ea8314f81e0cfa5171fc5cf43abd3f3e6afd62f478aeaa6",
    "src/black-cocoon-presentation-v158.js": "69169757f789461886aed3788b79e5ba9adcbd8bfa41b5cab81af85ff0be0767",
    "src/mission-dropship-handover-v188.js": "ea7aba8f264a931fe71de296b444f2c7810c214f7b825f6f7e56c11865f17b95",
    "src/qz17-level-dressing-v188.js": "2a5ad6d33e9ecabd0d26a7510b19d1ab396927516491d8a636ffc2aacd33806b",
    "src/story-cinematics-v188.js": "1b0783003a58b4dca02193b6c9048750b068ac99c3023534479786f6009c6465"
  });
  assert.deepEqual(Object.keys(continuation.addedSources), ['src/biological-art-v188.js']);
  assert.equal(Object.isFrozen(continuation.successors), true);
  assert.equal(Object.isFrozen(continuation.addedSources), true);
  assert.equal(sha(JSON.stringify(TANTALUS_PRIORITIES_SUCCESSORS_V188)), 'c3e771a8bfbc7cabcc78b82747158fb91329da2262b9a6c80262add8562b23da',
    'Every original V188 receipt, including its published endpoint, remains immutable.');
  assert.equal(sha(JSON.stringify(continuation)), '95987803d3d2ecd6292b6764f82b274627e08388e576e4c1b7a7a2e9dca9d005',
    'The complete da8b29fa continuation remains historical.');
  const prologue = TANTALUS_PRIORITIES_PROLOGUE_V188;
  assert.equal(prologue.baseline, 'd54f13cc55983ddb5f55851071c9144198fe1155');
  assert.deepEqual(Object.fromEntries(Object.entries(prologue.successors).map(([path, receipt]) => [path, receipt.previousSha256])), {
    "scripts/qa-black-cocoon-browser-v158.mjs": "ebb81a7deeab1c1a2d8ce47d1f14759889638b9af2f42859ef26119e2f459b0b",
    "scripts/qa-campaign-story-v160.py": "0a6cd23cdcc3bf32e8209258e4920e7897264883e10877401f787f010cde5a4e",
    "scripts/qa-forge-npcs-v158.py": "5c0b24aed9faf3e0921cfdb698735329063f5d93e1bb2a6b49c5c74e9afc677b",
    "scripts/qa-title-compositions-v163.py": "9444fe218aa06dfdef566bf996ebc43c6cd91a6b33a203ec2d3471f2af7b0b1a",
    "scripts/qa-trials-continuity-v163.py": "173f2e35f826970cee84ac967a44715f991efd7665f1dbf46f8c0db384b95e31",
    "scripts/verify-audit-v143.mjs": "9939371033f1654e51a73366a4d129c63f85d0871a40ca7014afe1f228a4fce0",
    "scripts/verify-black-cocoon-presentation-v158.mjs": "635ee8e4463e32676dbd7be409a5f92cb9ed4d40b0ee59097251e90819645b99",
    "scripts/verify-campaign-story-v160.mjs": "55b6b5ac7e045df047ccb6d867905e7cfec44a0f29e9dbda9a74778df9d39cad",
    "scripts/verify-cinematic-coherence-v188.mjs": "5f5bd9495aa0d7e7de6de16ee2f20b0064e4a9fc2ddb54f7f3f0c8ad7d6d72de",
    "scripts/verify-legacy-operations-v131.mjs": "950fbaa2c7b92d1b062ac7b933862c52c7787ca00671e1922213686100ec3e28",
    "scripts/verify-public-release-v86.mjs": "db03102b96ba14c20a265f83e39f1223657a6b2fc38b31f00983eb5fb80a16d5",
    "scripts/verify-story-cinematics-v188.mjs": "66dd489ef35c8ffcb53eee350e1234f34669cfd1f0abb75949a83a47651a295d",
    "src/story-cinematics-v188.js": "921e3a8ae80b0000e1ee4eed5af38bc84312d7458109db879a33ebad1b1221cc",
    "sw.js": "20f87df7565d64fc36ebef8a24ef94695cf41fabcc80a1ee9706fa854615f842"
  });
  assert.deepEqual(Object.keys(prologue.addedSources), ['src/prologue-art-v188.js']);
  assert.equal(Object.isFrozen(prologue.successors), true); assert.equal(Object.isFrozen(prologue.addedSources), true);
  assert.equal(sha(JSON.stringify(prologue)), 'fc40151c6f44c0f22e499a28eec01ce119367fee4feb8d58cd43b99b486d19ee',
    'The complete d54f13cc prologue continuation remains historical.');
  const quay = TANTALUS_PRIORITIES_QUAY_V188;
  assert.equal(quay.baseline, 'ee565717bdc698594c41f76fe1e1c72c2a730656');
  assert.deepEqual(Object.fromEntries(Object.entries(quay.successors).map(([path, receipt]) => [path, receipt.previousSha256])), {
    "scripts/qa-campaign-story-v160.py": "0483f3b99b6d0b05cd7a7bbb984e2a662360a3828ad532d0c0fbbd201072e49f",
    "scripts/qa-forge-npcs-v158.py": "0d6bcda73a5ee085eb9a886ca755e56ec1a2195a13e6f0fff9c4014e562193f1",
    "scripts/qa-trials-continuity-v163.py": "a5a3ae0189e2ad47c5d2f2b12985f9e935e8f8c27bc9fe92001b5886deae4a0b",
    "scripts/verify-audit-v143.mjs": "b2283b440d2be425eaadebc919dde1495656d875e31025ecd475e27428ad5efb",
    "scripts/verify-campaign-story-v160.mjs": "63fd6e24dc57561e3d88f0d549906a8a1b891ace8767675cb4ca42699bbcbe1b",
    "scripts/verify-forge-npcs-v158.mjs": "ae3813cbb02f125e450fcf08217c2ffa8512915d98bb983961d1a2810a9ec34d",
    "scripts/verify-legacy-operations-v131.mjs": "c8823fea400d848cd1d90c65ff841a5a6f6833b84515ab799eb2bf41627706e5",
    "scripts/verify-public-release-v86.mjs": "0376088c873ed60751b81d646cadd0e965476df5e61b88c0d83a40670d45dce5",
    "scripts/verify-quay-coherence-v188.mjs": "d69f271f5db777ade2b32f4608f58675d405ed84b1015992a850c083bd4da929",
    "src/hub-port-meridien-v90.js": "a81ed4df17c3b91edaf52c66bf24bd3981190c2b73db22366c3e4076de76cabb",
    "sw.js": "082f8d2e6b94053c5e080256f359c1fbad4b787d6e3b6a052001724b8cd54f66"
  });
  assert.deepEqual(Object.keys(quay.addedSources), ['src/port-quay-art-v188.js']);
  assert.equal(Object.isFrozen(quay.successors), true); assert.equal(Object.isFrozen(quay.addedSources), true);
  assert.equal(sha(JSON.stringify(quay)), '3b23c8897b666f16352d3a62e34e75df9a3e4d0b59bd29f90eb04a749c0a0997',
    'The complete ee565717 quay continuation remains historical.');
  const cargoAbyss = TANTALUS_PRIORITIES_CARGO_ABYSS_V188;
  assert.equal(cargoAbyss.baseline, '232693f1e0ed24e404bb2fb0dbcd779611ccd2fc');
  assert.deepEqual(Object.fromEntries(Object.entries(cargoAbyss.successors).map(([path, receipt]) => [path, receipt.previousSha256])), {
  "docs/narrative/CAMPAGNE_PRINCIPALE.md": "64a13e855d68cda96d0541c78202b77bdcf0703eaf1c91a786fd93e21cc3a271",
  "package.json": "d10e191570b28fe0e2a6213c1ee1e0b75b49ad152f0024e81feb45fb4f9f760e",
  "scripts/qa-title-compositions-v163.py": "2c854d3190619b506b45fe1e22d21014f8f12af56a6966598a327c3fbdc2554a",
  "scripts/verify-audit-continuation-v157.mjs": "641676a21373c30747555d01f180a8c38f07819091860c6c1924bf6f5c08b5cf",
  "scripts/verify-audit-continuation-v158.mjs": "86d8781274bc77362ad291d6a638c02c74c0521e8bcee5776c913b8fef06400e",
  "scripts/verify-audit-v143.mjs": "9dc8947f8b6d3dfb568777307390e561874e213c41edd501b6b4835cb3531a7a",
  "scripts/verify-black-cocoon-presentation-v158.mjs": "5b4a2e933b81654f746e8a94c7214523bd7dbb92cdb92dc3adef8dbd3031cedd",
  "scripts/verify-intro-v188.mjs": "49a813bcfed5f5065c2e9bac02eb53e566eb17d22d53cb55257b940d8f8e37a9",
  "scripts/verify-public-release-v86.mjs": "dac556b3f8fa6ce714732094dda492c4f7c6b25422b32901a72e219ca10fe67f",
  "src/cargo-brutal-runtime-v67.js": "60f511f19a3359935a4317e359e66037330c77955834226732b14b1059696ab9",
  "src/i18n-en-catalog-v185.js": "28d42706b8ee4a3713532837328f33bdb2b6fc7b0517cd2dc911ac9a9a601c38",
  "src/legacy-operation-state-v131.js": "95c3759015297bd0c6e5120222758ded484675d41610db68c40faa7d75c7a0f1",
  "src/legacy-operations-v131.js": "7c7de1da1e5c1bd43c89a5dc1ecdc86ca777fb872283f0cf2d4cd9857ae49cc5",
  "src/special-operations-v131.js": "0e9805fce4ecddc8dc00f694b7646885e8a8292f8460928639c4eb9ffae48f83",
  "sw.js": "50b6526783bce8a799d19123059dcee6dc535cf4b2ac45534e0b9bcea2726a41"
});
  assert.deepEqual(Object.keys(cargoAbyss.addedSources), [
    'scripts/verify-cargo-matriarch-art-v188.mjs', 'scripts/verify-manta-art-v188.mjs',
    'src/cargo-matriarch-art-v188.js', 'src/manta-art-v188.js'
  ]);
  assert.equal(Object.isFrozen(cargoAbyss.successors), true); assert.equal(Object.isFrozen(cargoAbyss.addedSources), true);
  assert.equal(sha(JSON.stringify(cargoAbyss)), '5dd3984bb3ecf973baa17060279301d8bd6e5c2f25225129382edb2fa590fbad',
    'The complete 232693f1 Cargo/Abysse continuation remains historical.');
  const hadal = TANTALUS_PRIORITIES_HADAL_V188;
  assert.equal(hadal.baseline, 'a3634de7c294ae82554d899057fab96088ccf769');
  assert.deepEqual(Object.fromEntries(Object.entries(hadal.successors).map(([path, receipt]) => [path, receipt.previousSha256])), {
  "docs/narrative/CAMPAGNE_PRINCIPALE.md": "af84940ea813e6307086101b0a1439c1e02f84fd2cc6afee8f69b0527d79c812",
  "package.json": "386949dd02f996625f0ec7317fe4355f1316b3cadb000d7ee837a3ea4c0a570d",
  "scripts/verify-audit-v143.mjs": "2eb58ef20c62f91c392827358da0062063efcbe793695d14d221e63de7768c87",
  "scripts/verify-public-release-v86.mjs": "71f4efa64f734ff6e378f378b90071f0159bbb54c817f7e2e42c176d08f8a5bc",
  "src/i18n-en-catalog-v185.js": "c4d72221b1455a84c43112171a28cae38f74000baa2a2609f1d3f236f9944218",
  "src/legacy-operation-state-v131.js": "54cd1b9305cdeab348acb9b050f004a5278b8e295f3670ad23ff5d43de23e1ae",
  "src/legacy-operations-v131.js": "ae50089c68584ef983e7fd9ab70537eeb824ba4fb1b0a427fab9e2d9d2948bb4",
  "src/player-appearance-runtime-v126.js": "cce67f9128241fcf6e8f6932a57ec73b080c7e875acf024e15259450dbd9188b",
  "src/player-body-rig-v125.js": "401f81aaf0b2f1ab3b90353486782aa755fb54fd16084a5beda964c5d6c8a1df",
  "src/player-locomotion-rig-v129.js": "4af0bb1aaca511418267e0e5fead565de6ec739263c35ffa84eeb85573416dda",
  "src/player-modular-rig-v126.js": "2fef117a684b16b6c426ed93f932ce91e660648682f50600c799f5cd6126c8f9",
  "src/player-transit-rig-v128.js": "5aceb439b4d5b5421073e4a9bd0fa0e5a7f8d2673fbbf3e88dbc69ebd98472fd",
  "src/player-weapon-runtime-v125.js": "a2d11f762b1064be9b888e7d1e9502e161784be9f09012376b11426fe88b2032",
  "sw.js": "85c8f787966610c1cd17570f137717222334a01d337da30ed2898a1385610b24"
});
  assert.deepEqual(Object.keys(hadal.addedSources), ['scripts/verify-hadal-player-art-v188.mjs', 'src/hadal-player-art-v188.js']);
  assert.equal(Object.isFrozen(hadal.successors), true); assert.equal(Object.isFrozen(hadal.addedSources), true);
  assert.equal(sha(JSON.stringify(hadal)), '7b66c48a759a397792a41bfdd3f7e860f5740c412e4b58be56b509026ee425a9',
    'The complete a3634de7 HADAL continuation remains historical.');
  const broodstorm = TANTALUS_PRIORITIES_BROODSTORM_V188;
  assert.equal(broodstorm.baseline, '361e40670c393dd548b4faa081f12edb0e9b05c4');
  assert.deepEqual(Object.fromEntries(Object.entries(broodstorm.successors).map(([path, receipt]) => [path, receipt.previousSha256])), {
    'docs/narrative/CAMPAGNE_PRINCIPALE.md': '2438b8895b36a729434264e0488c4687cdf2e9a377160bdbf476a073a57e5c9c',
    'package.json': '48c789b2740a9b1a2b2b128699051ef3df5ae4b20efa3c35b1b277771f3b7510',
    'scripts/verify-audit-continuation-v157.mjs': '1c1987e69cc44577a44a49182f79522a886ef00fd5758d7d1538e9fc3f90dedb',
    'scripts/verify-audit-continuation-v158.mjs': '41393b57bbd863f90bec5af9c367193954bd0bba1048e87c8d0b48a8c9804525',
    'scripts/verify-audit-v143.mjs': 'e0830aced7f0172ac455b2caa1f01fab29a886a98323ef9dffac1942eadcd999',
    'scripts/verify-black-cocoon-presentation-v158.mjs': '112c504b77d81943596e21d13caef1df9d8ed4e47968e22443fea87687cefbf5',
    'scripts/verify-public-release-v86.mjs': '43d082f94a0ee3fdba5b40c55c2d663220d9f92af615e0dfd0b6196f1734faef',
    'src/i18n-en-catalog-v185.js': '3148d98764e42a05192d72ad7c64e565ca3648c6922704a9db7fba99b8d8ee2d',
    'src/legacy-operation-state-v131.js': '68d888f3725d4fb06be41c30bee84e776cdc7dcad92e52f725e8511a8cb157ab',
    'src/legacy-operations-v131.js': 'e3233ae75f5e81436cf920e28b9cf7ea52e03b3a99860992dd3d74449eda8d29',
    'src/special-operations-v131.js': '5c412f4c3adb8df674b25740ce7b2227a0ead01844c82d219a226a3497035243',
    'sw.js': '024d58728b16a4485dcf618a822280003b7eeb966561df0eac3b1e17c44b4b19'
  });
  assert.deepEqual(Object.keys(broodstorm.addedSources), ['scripts/verify-broodstorm-queen-art-v188.mjs', 'src/broodstorm-queen-art-v188.js']);
  assert.equal(Object.isFrozen(broodstorm.successors), true); assert.equal(Object.isFrozen(broodstorm.addedSources), true);
  assert.equal(broodstorm.successors[TANTALUS_PRIORITIES_BROODSTORM_REGISTRY_V188.baselineRegistry.path].previousSha256,
    TANTALUS_PRIORITIES_BROODSTORM_REGISTRY_V188.baselineRegistry.sha256,
    'The registry declaration projection and terminal source chain share the exact H predecessor.');
  const queenMother = TANTALUS_PRIORITIES_QUEEN_MOTHER_V188;
  assert.equal(queenMother.baseline, 'b9aee06a0783bc7c0cf7094268a08618364df781');
  assert.deepEqual(Object.fromEntries(Object.entries(queenMother.successors).map(([path, receipt]) => [path, receipt.previousSha256])), {
  "docs/narrative/CAMPAGNE_PRINCIPALE.md": "5460541da3d8b8f45e59ea584afb00e8be32378f19e82bcceb0fab688d527471",
  "package.json": "de4535cf179efd3fe86b6a73622b979ef0f75892d1865aad18d407fa7700b3d2",
  "scripts/verify-audit-continuation-v157.mjs": "afb20cffa2a0214c7802b7c9b36f5dadcc7c8eef795452e1c08bf0bdd19c6697",
  "scripts/verify-audit-continuation-v158.mjs": "1bc844e8a063004fdd64141d8e3d908fd10163fb6c9e2ef39a8353581c172406",
  "scripts/verify-audit-v143.mjs": "50a8b5904d59e82b788c23738d8a9ec809f69fd20beb965d7328b70698ce217d",
  "scripts/verify-black-cocoon-presentation-v158.mjs": "fe489fab18e96fa26ba31cb3f39ea61e8f70ba4daa120613b4d564faa60eb0a5",
  "scripts/verify-public-release-v86.mjs": "4c92d631018952c243a3c3ac49b64cdf18bf04f609daf322ec99c2c6ce333425",
  "src/ecosystem-missions-v131.js": "646012d4cd8465db13739b0df8a00407acf04cad8ffe5ee6f5035818b0c33ddc",
  "src/ecosystem-systems-v131.js": "4e240a73054c5fefe872200f8b34a7055feff373d8f6c43b27e81d0c5ed621a3",
  "src/i18n-en-catalog-v185.js": "73d71fb68c960c112c3bf1cd792e5a522279de76f4f7d634a0d33257303d63ae",
  "src/special-operations-v131.js": "99a629ceba7042ca320e50d384fe9b9e734bdefa452bd5485899661adca5b45a",
  "sw.js": "6bf7972ff27396e71d850cdb13d449d187d35ec170e2c217122dde630fa6cdd3"
});
  assert.deepEqual(Object.keys(queenMother.addedSources), ['scripts/verify-queen-mother-art-v188.mjs', 'src/queen-mother-art-v188.js']);
  assert.equal(Object.isFrozen(queenMother.successors), true); assert.equal(Object.isFrozen(queenMother.addedSources), true);
  assert.equal(queenMother.successors[TANTALUS_PRIORITIES_QUEEN_MOTHER_REGISTRY_V188.baselineRegistry.path].previousSha256,
    TANTALUS_PRIORITIES_QUEEN_MOTHER_REGISTRY_V188.baselineRegistry.sha256,
    'The Queen Mother projection and terminal source chain share the exact published B2 predecessor.');
  const guards = TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188;
  assert.equal(guards.baseline, 'c1d4c636347275d2d3a6ecbc15ebfcfeadfb035c');
  assert.deepEqual(Object.fromEntries(Object.entries(guards.successors).map(([path, receipt]) => [path, receipt.previousSha256])), {
  "docs/narrative/CAMPAGNE_PRINCIPALE.md": "f8f0b2d4d67183b09f9d8be7f989d8032ad3e4796295367e4a07fc11bf86ab7e",
  "package.json": "2f1841faceabf92adbe9f829bac3e66ad81c7900064bdc1b382d0470e1717e4f",
  "scripts/verify-audit-continuation-v157.mjs": "6a88297b6d018c5086f2cdd92b88ff408eafc9fbf869be52365988edbb8a76c0",
  "scripts/verify-audit-continuation-v158.mjs": "4fbb9c96780e8d46143f87997963246b9c634e4503a692742bacec7c8dad7f24",
  "scripts/verify-audit-v143.mjs": "32df0186eeb4bd76263a46c6517f1f2f92fcb0aa25fa47c41292d7e178bc0ca7",
  "scripts/verify-black-cocoon-presentation-v158.mjs": "488aa7cfe2b50a2f0c40a20793b50dcded23f5babe0634208c204d573444f175",
  "scripts/verify-public-release-v86.mjs": "11fc3b2d559034519dcb66c678e70c489f0b9132a7797142513860e81d654647",
  "src/ecosystem-missions-v131.js": "3b90f5739b4ff282d29304f0dc2aa7ad12150efb80e4b7459d60071ad4f03ec7",
  "src/ecosystem-systems-v131.js": "4fda558fd365aa872cc656c5565bef204dd967da9a2fb3b8f673d87678b8353f",
  "src/game-production-runtime.js": "5cfd2d4a4e5ca6d01529332d67f9afa0564cfa05dbcfabd06657f90559a7e141",
  "src/i18n-en-catalog-v185.js": "4c75f584d9a2a4fc1d7328f0b85a38bd037f75f416131af9cca135012d1daee7",
  "sw.js": "881f6a320f57315bdd5f8985a091cc967ba6d8090b02290997c43e9fd7eeeac5"
});
  assert.deepEqual(Object.keys(guards.addedSourceSuccessors), ['scripts/verify-queen-mother-art-v188.mjs']);
  assert.equal(guards.addedSourceSuccessors['scripts/verify-queen-mother-art-v188.mjs'].previousSha256,
    'cabf01a56b817a86ff16f026a51f4614e9ff78764a76c391bbdf86d64a121d80');
  assert.equal(guards.addedSourceSuccessors['scripts/verify-queen-mother-art-v188.mjs'].previousSha256,
    queenMother.addedSources['scripts/verify-queen-mother-art-v188.mjs']);
  assert.deepEqual(Object.keys(guards.addedSources), ['scripts/verify-queen-mother-guard-art-v188.mjs', 'src/queen-mother-guard-art-v188.js']);
  for (const map of [guards.successors, guards.addedSourceSuccessors, guards.addedSources]) assert.equal(Object.isFrozen(map), true);
  assert.equal(Object.hasOwn(guards.successors, 'src/special-operations-v131.js'), false,
    'The unchanged registry needs no invented source successor.');
  assert.equal(sha(fiorinaHistoricalRegistryReaderV188(read)('src/special-operations-v131.js')),
    TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_REGISTRY_V188.baselineRegistry.sha256);
  const choirs = TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188;
  assert.equal(choirs.baseline, 'ded6ef34dd35a659313e9361b407f6b94b62fb96');
  assert.deepEqual(Object.fromEntries(Object.entries(choirs.successors).map(([path, receipt]) => [path, receipt.previousSha256])), {
  "docs/narrative/CAMPAGNE_PRINCIPALE.md": "c1c14fc8e850a7bbfd4946196edd233db6324b7898c4878298554f2ad0bbd438",
  "package.json": "3066253712f123ae2008fced03a1473b849f67a8d364bbc0864f30588f35d609",
  "scripts/verify-audit-continuation-v157.mjs": "a3230677a0ea8bcafab21917da2823e49777bcc2c1e406bb9dc6b91e396c2155",
  "scripts/verify-audit-continuation-v158.mjs": "80f296774fff4bbd1eaecca48fdd4c63cb1beaca03ed0c44a3d674ebfae87a28",
  "scripts/verify-audit-v143.mjs": "3a2ad226bf0ae4076e3fbd526f2d03fa3bd7459f8811f0d27d6a1a33a3626e85",
  "scripts/verify-black-cocoon-presentation-v158.mjs": "a35cab0472f11b1e656aec251a035dc1cd3a4b9df6e6803ab0f2da83ab313cb1",
  "scripts/verify-public-release-v86.mjs": "0d663f627b878c05ecd067c417d2bd2895ffeede9de0b21e6ad3852134d10a7d",
  "src/ecosystem-missions-v131.js": "34fc724a8b7c758153b42f7f1542512056a12aef6b6c119f6e8cea7ce9fa5c7d",
  "src/ecosystem-systems-v131.js": "577e12210793abf2ea46df9afef38aeab26bbce12a960073379cf6a639993d5c",
  "src/i18n-en-catalog-v185.js": "4b3e6552f422a1a7d30b9940eebd81880e292bcbae5067cf1e2697284dbca917",
  "sw.js": "e31f82016ae97434c8805dd00d35279c6246bc9c52ddc32faa3c678996db8d22"
});
  assert.deepEqual(Object.keys(choirs.addedSourceSuccessors), ['scripts/verify-queen-mother-art-v188.mjs']);
  assert.equal(choirs.addedSourceSuccessors['scripts/verify-queen-mother-art-v188.mjs'].previousSha256,
    '889d7e7a91eecb6fa9ba780982a164c458c394b8174d59514ce8baf5125f15b3');
  assert.equal(choirs.addedSourceSuccessors['scripts/verify-queen-mother-art-v188.mjs'].previousSha256,
    guards.addedSourceSuccessors['scripts/verify-queen-mother-art-v188.mjs'].currentSha256);
  assert.deepEqual(Object.keys(choirs.addedSources), ['scripts/verify-queen-mother-choir-art-v188.mjs', 'src/queen-mother-choir-art-v188.js']);
  for (const map of [choirs.successors, choirs.addedSourceSuccessors, choirs.addedSources]) assert.equal(Object.isFrozen(map), true);
  for (const path of ['src/special-operations-v131.js', 'src/game-production-runtime.js',
    'src/queen-mother-art-v188.js', 'src/queen-mother-guard-art-v188.js', 'scripts/verify-queen-mother-guard-art-v188.mjs']) {
    assert.equal(Object.hasOwn(choirs.successors, path) || Object.hasOwn(choirs.addedSourceSuccessors, path)
      || Object.hasOwn(choirs.addedSources, path), false, 'An unchanged R or Q source needs no choir successor: ' + path);
  }
  const noticeTest = read('scripts/verify-queen-mother-art-v188.mjs').toString();
  const noticePattern = /^const queenNotice='[^'\r\n]*';$/gm;
  assert.equal([...noticeTest.matchAll(noticePattern)].length, 1);
  assert.equal(sha(noticeTest.replace(noticePattern, "const queenNotice='<reviewed R wording>';")),
    'bca3a3d10f6fd8fe21ad129a565ec3881e74d54f32f3487149966065d66b7baa', 'Only the Q notice literal may change; every other Q test byte remains historical.');
  const terminal = read('scripts/audit-tantalus-priorities-v188.mjs').toString();
  for (const [startMarker, endMarker, digest] of [
    ['export const TANTALUS_PRIORITIES_BROODSTORM_V188 = freeze(',
      'export const TANTALUS_PRIORITIES_CARGO_REGISTRY_V188 = freeze(', 'e10a0158b99e4a4f7236edfc9e851229c6e6049a7b20d6a070876c5bbf75b774'],
    ['export const TANTALUS_PRIORITIES_CARGO_REGISTRY_V188 = freeze(',
      'export const TANTALUS_PRIORITIES_BROODSTORM_REGISTRY_V188 = freeze(', '006ed72e9dc64b91d8f3085241b2f5afc9ec31943e89500020a869a06a75ed0c'],
    ['export const TANTALUS_PRIORITIES_BROODSTORM_REGISTRY_V188 = freeze(',
      'export const TANTALUS_PRIORITIES_SOURCE_ONLY_PATHS_V188 = Object.freeze(', 'bd01aa5b2720a67f92c7f1d24775384b0199c4ab2f345171b9df648380632c54'],
    ['export const TANTALUS_PRIORITIES_QUEEN_MOTHER_V188 = freeze(',
      'export const TANTALUS_PRIORITIES_QUEEN_MOTHER_REGISTRY_V188 = freeze(', '47cb23afdb862c49acf45004ffef0365f8101e2ba9cc03d980ff682b1160d7be'],
    ['export const TANTALUS_PRIORITIES_QUEEN_MOTHER_REGISTRY_V188 = freeze(',
      '// Queen Mother guard source continuation', '766f9efcad8e06033236818b471e01870828da196db86e41dd827a8351021fe5'],
    ['export const TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188 = freeze(',
      '// Queen Mother choir source continuation', '88ccc8bd6112fc747729d650d0cb9766a96e787d6c545af788029ecff4b699b3']
  ]) {
    const start = terminal.indexOf(startMarker), end = terminal.indexOf(endMarker, start + 1);
    assert.ok(start >= 0 && end > start);
    assert.equal(sha(terminal.slice(start, end)), digest, 'Historical Cargo/Broodstorm/Queen Mother source bytes must remain intact: ' + startMarker);
  }
  const unique = new Set([...Object.keys(TANTALUS_PRIORITIES_SUCCESSORS_V188), ...Object.keys(continuation.successors),
    ...Object.keys(prologue.successors), ...Object.keys(quay.successors), ...Object.keys(cargoAbyss.successors),
    ...Object.keys(hadal.successors), ...Object.keys(broodstorm.successors), ...Object.keys(queenMother.successors), ...Object.keys(guards.successors), ...Object.keys(choirs.successors)]);
  assert.equal(result.successors, unique.size); assert.equal(result.successors, 133);
  assert.equal(result.addedSources, 17);
  assert.equal(Object.keys(guards.addedSourceSuccessors).length, 1, 'The notice successor keeps its Q birth and is not a sixteenth new source.');
  assert.equal(Object.keys(choirs.addedSourceSuccessors).length, 1, 'The second notice successor keeps its Q birth; only the two C files are new.');
  assert.deepEqual(verifyNativeQaResourcesV187(), { successors: 8, preserved: 7 });
});

test('V188 rejects mutated bytes and arbitrary predecessor endpoints', () => {
  for (const [path, receipt] of Object.entries(TANTALUS_PRIORITIES_SUCCESSORS_V188)) {
    assert.throws(() => verifyTantalusPrioritiesV188(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate)), /Unreviewed V188 source bytes/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, '0'.repeat(64)), /Broken V187-to-V188 source chain/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.currentSha256), /Broken V187-to-V188 source chain/);
  }
  for (const [path, receipt] of Object.entries(TANTALUS_PRIORITIES_CONTINUATION_V188.successors)) {
    assert.throws(() => verifyTantalusPrioritiesV188(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate)), /Unreviewed V188 source bytes/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, '0'.repeat(64)), /Broken published-V188 source chain/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.currentSha256), /Broken published-V188 source chain/);
  }
  for (const [path, receipt] of Object.entries(TANTALUS_PRIORITIES_PROLOGUE_V188.successors)) {
    const anchor = TANTALUS_PRIORITIES_SUCCESSORS_V188[path] || TANTALUS_PRIORITIES_CONTINUATION_V188.successors[path] || receipt;
    assert.equal(reviewedTantalusPrioritiesDigestV188(path, anchor.previousSha256), leadEndV188(path, TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_QUEEN_MOTHER_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_BROODSTORM_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_HADAL_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_CARGO_ABYSS_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_QUAY_V188.successors[path]?.currentSha256 || receipt.currentSha256,
      'The original anchor must resolve through every exact published endpoint: ' + path));
    assert.throws(() => verifyTantalusPrioritiesV188(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate)), /Unreviewed V188 source bytes/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, '0'.repeat(64)), /Broken .* source chain/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.currentSha256), /Broken .* source chain/);
  }
  for (const [path, receipt] of Object.entries(TANTALUS_PRIORITIES_QUAY_V188.successors)) {
    const anchor = TANTALUS_PRIORITIES_SUCCESSORS_V188[path] || TANTALUS_PRIORITIES_CONTINUATION_V188.successors[path]
      || TANTALUS_PRIORITIES_PROLOGUE_V188.successors[path] || receipt;
    assert.equal(reviewedTantalusPrioritiesDigestV188(path, anchor.previousSha256), leadEndV188(path, TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_QUEEN_MOTHER_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_BROODSTORM_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_HADAL_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_CARGO_ABYSS_V188.successors[path]?.currentSha256 || receipt.currentSha256,
      'The original anchor must resolve through the exact published ee565717 endpoint: ' + path));
    assert.throws(() => verifyTantalusPrioritiesV188(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate)), /Unreviewed V188 source bytes/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, '0'.repeat(64)), /Broken .* source chain/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.currentSha256), /Broken .* source chain/);
    if (anchor !== receipt) assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.previousSha256), /Broken .* source chain/);
  }
  for (const [path, receipt] of Object.entries(TANTALUS_PRIORITIES_CARGO_ABYSS_V188.successors)) {
    const anchor = TANTALUS_PRIORITIES_SUCCESSORS_V188[path] || TANTALUS_PRIORITIES_CONTINUATION_V188.successors[path]
      || TANTALUS_PRIORITIES_PROLOGUE_V188.successors[path] || TANTALUS_PRIORITIES_QUAY_V188.successors[path] || receipt;
    assert.equal(reviewedTantalusPrioritiesDigestV188(path, anchor.previousSha256), leadEndV188(path, TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_QUEEN_MOTHER_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_BROODSTORM_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_HADAL_V188.successors[path]?.currentSha256 || receipt.currentSha256,
      'The original anchor must resolve through the exact published 232693f1 endpoint: ' + path));
    assert.throws(() => verifyTantalusPrioritiesV188(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate)), /Unreviewed V188 source bytes/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, '0'.repeat(64)), /Broken .* source chain/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.currentSha256), /Broken .* source chain/);
    if (anchor !== receipt) assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.previousSha256), /Broken .* source chain/);
  }
  for (const [path, receipt] of Object.entries(TANTALUS_PRIORITIES_HADAL_V188.successors)) {
    const anchor = TANTALUS_PRIORITIES_SUCCESSORS_V188[path] || TANTALUS_PRIORITIES_CONTINUATION_V188.successors[path]
      || TANTALUS_PRIORITIES_PROLOGUE_V188.successors[path] || TANTALUS_PRIORITIES_QUAY_V188.successors[path]
      || TANTALUS_PRIORITIES_CARGO_ABYSS_V188.successors[path] || receipt;
    assert.equal(reviewedTantalusPrioritiesDigestV188(path, anchor.previousSha256), leadEndV188(path, TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_QUEEN_MOTHER_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_BROODSTORM_V188.successors[path]?.currentSha256 || receipt.currentSha256,
      'The original anchor must resolve through the exact published a3634de7 endpoint: ' + path));
    assert.throws(() => verifyTantalusPrioritiesV188(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate)), /Unreviewed V188 source bytes/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, '0'.repeat(64)), /Broken .* source chain/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.currentSha256), /Broken .* source chain/);
    if (anchor !== receipt) assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.previousSha256), /Broken .* source chain/);
  }
  for (const [path, receipt] of Object.entries(TANTALUS_PRIORITIES_BROODSTORM_V188.successors)) {
    const anchor = TANTALUS_PRIORITIES_SUCCESSORS_V188[path] || TANTALUS_PRIORITIES_CONTINUATION_V188.successors[path]
      || TANTALUS_PRIORITIES_PROLOGUE_V188.successors[path] || TANTALUS_PRIORITIES_QUAY_V188.successors[path]
      || TANTALUS_PRIORITIES_CARGO_ABYSS_V188.successors[path] || TANTALUS_PRIORITIES_HADAL_V188.successors[path] || receipt;
    assert.equal(reviewedTantalusPrioritiesDigestV188(path, anchor.previousSha256), leadEndV188(path, TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_QUEEN_MOTHER_V188.successors[path]?.currentSha256 || receipt.currentSha256,
      'The original anchor must resolve through the exact published 361e4067 endpoint: ' + path));
    assert.throws(() => verifyTantalusPrioritiesV188(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate)), /Unreviewed V188 source bytes/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, '0'.repeat(64)), /Broken .* source chain/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.currentSha256), /Broken .* source chain/);
    if (anchor !== receipt) assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.previousSha256), /Broken .* source chain/);
  }
  for (const [path, receipt] of Object.entries(TANTALUS_PRIORITIES_QUEEN_MOTHER_V188.successors)) {
    const anchor = TANTALUS_PRIORITIES_SUCCESSORS_V188[path] || TANTALUS_PRIORITIES_CONTINUATION_V188.successors[path]
      || TANTALUS_PRIORITIES_PROLOGUE_V188.successors[path] || TANTALUS_PRIORITIES_QUAY_V188.successors[path]
      || TANTALUS_PRIORITIES_CARGO_ABYSS_V188.successors[path] || TANTALUS_PRIORITIES_HADAL_V188.successors[path]
      || TANTALUS_PRIORITIES_BROODSTORM_V188.successors[path] || receipt;
    assert.equal(reviewedTantalusPrioritiesDigestV188(path, anchor.previousSha256), leadEndV188(path, TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188.successors[path]?.currentSha256 || receipt.currentSha256,
      'The original anchor must resolve through the exact published B2 endpoint: ' + path));
    assert.throws(() => verifyTantalusPrioritiesV188(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate)), /Unreviewed V188 source bytes/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, '0'.repeat(64)), /Broken .* source chain/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.currentSha256), /Broken .* source chain/);
    if (anchor !== receipt) assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.previousSha256), /Broken .* source chain/);
  }
  for (const [path, receipt] of Object.entries(TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188.successors)) {
    const anchor = TANTALUS_PRIORITIES_SUCCESSORS_V188[path] || TANTALUS_PRIORITIES_CONTINUATION_V188.successors[path]
      || TANTALUS_PRIORITIES_PROLOGUE_V188.successors[path] || TANTALUS_PRIORITIES_QUAY_V188.successors[path]
      || TANTALUS_PRIORITIES_CARGO_ABYSS_V188.successors[path] || TANTALUS_PRIORITIES_HADAL_V188.successors[path]
      || TANTALUS_PRIORITIES_BROODSTORM_V188.successors[path] || TANTALUS_PRIORITIES_QUEEN_MOTHER_V188.successors[path];
    assert.ok(anchor, 'Every R source successor starts from a reviewed historical endpoint.');
    assert.equal(reviewedTantalusPrioritiesDigestV188(path, anchor.previousSha256),
      leadEndV188(path, TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188.successors[path]?.currentSha256 || receipt.currentSha256));
    assert.throws(() => verifyTantalusPrioritiesV188(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate)), /Unreviewed V188 source bytes/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, '0'.repeat(64)), /Broken .* source chain/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.currentSha256), /Broken .* source chain/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.previousSha256), /Broken .* source chain/);
  }
  for (const [path, receipt] of Object.entries(TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188.addedSourceSuccessors)) {
    assert.equal(reviewedTantalusPrioritiesDigestV188(path, TANTALUS_PRIORITIES_QUEEN_MOTHER_V188.addedSources[path]),
      TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188.addedSourceSuccessors[path]?.currentSha256 || receipt.currentSha256);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, '0'.repeat(64)), /Broken c1d4c636-to-queen-mother-guard/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.currentSha256), /Broken c1d4c636-to-queen-mother-guard/);
  }
  for (const path of [...Object.keys(TANTALUS_PRIORITIES_CONTINUATION_V188.addedSources), ...Object.keys(TANTALUS_PRIORITIES_PROLOGUE_V188.addedSources),
    ...Object.keys(TANTALUS_PRIORITIES_QUAY_V188.addedSources), ...Object.keys(TANTALUS_PRIORITIES_CARGO_ABYSS_V188.addedSources),
    ...Object.keys(TANTALUS_PRIORITIES_HADAL_V188.addedSources), ...Object.keys(TANTALUS_PRIORITIES_BROODSTORM_V188.addedSources),
    ...Object.keys(TANTALUS_PRIORITIES_QUEEN_MOTHER_V188.addedSources), ...Object.keys(TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188.addedSources),
    ...Object.keys(TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188.addedSources)]) {
    assert.throws(() => verifyTantalusPrioritiesV188(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate)), /Unreviewed V188 source bytes/);
  }
  for (const map of [TANTALUS_PRIORITIES_CONTINUATION_V188.successors, TANTALUS_PRIORITIES_CONTINUATION_V188.addedSources,
    TANTALUS_PRIORITIES_PROLOGUE_V188.successors, TANTALUS_PRIORITIES_PROLOGUE_V188.addedSources,
    TANTALUS_PRIORITIES_QUAY_V188.successors, TANTALUS_PRIORITIES_QUAY_V188.addedSources,
    TANTALUS_PRIORITIES_CARGO_ABYSS_V188.successors, TANTALUS_PRIORITIES_CARGO_ABYSS_V188.addedSources,
    TANTALUS_PRIORITIES_HADAL_V188.successors, TANTALUS_PRIORITIES_HADAL_V188.addedSources,
    TANTALUS_PRIORITIES_BROODSTORM_V188.successors, TANTALUS_PRIORITIES_BROODSTORM_V188.addedSources,
    TANTALUS_PRIORITIES_QUEEN_MOTHER_V188.successors, TANTALUS_PRIORITIES_QUEEN_MOTHER_V188.addedSources,
    TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188.successors, TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188.addedSourceSuccessors,
    TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188.addedSources,
    TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188.successors, TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188.addedSourceSuccessors,
    TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188.addedSources]) {
    assert.equal(Object.hasOwn(map, 'scripts/audit-tantalus-priorities-v188.mjs'), false);
  }
  assert.equal(reviewedTantalusPrioritiesDigestV188('src/unreviewed.js', 'unchanged'), 'unchanged');
  assert.equal(Object.hasOwn(TANTALUS_PRIORITIES_SUCCESSORS_V188, 'scripts/audit-tantalus-priorities-v188.mjs'), false);
  const terminal = read('scripts/audit-tantalus-priorities-v188.mjs').toString();
  assert.equal(/(?:from\s*|import\s*\(?\s*)['"]\.\//.test(terminal), false, 'The terminal audit must not import another audit.');
});

test('Broodstorm terminal rejects a false H receipt or an added-source disguise for a successor', async () => {
  const terminal = read('scripts/audit-tantalus-priorities-v188.mjs').toString();
  const start = terminal.indexOf('export const TANTALUS_PRIORITIES_BROODSTORM_V188 = freeze(');
  const end = terminal.indexOf('\n});', start) + '\n});'.length;
  assert.ok(start >= 0 && end > start);
  // Keep the historical B receipt mutations on a B successor untouched by Q.
  // Q's own registry receipt is exercised separately below.
  // V188 spec 011 moved the Abysse Noir chapter's worldId (src/legacy-operation-state-v131.js), so that
  // B successor is now also a join successor; the B runtime successor is untouched by Q and by the join.
  const path = 'src/legacy-operations-v131.js';
  assert.equal(Object.hasOwn(TANTALUS_PRIORITIES_QUEEN_MOTHER_V188.successors, path), false);
  assert.equal(Object.hasOwn(TANTALUS_PRIORITIES_XENO_TRIALS_JOIN_V188.successors, path), false);
  for (const [reason, mutate, error] of [
    ['false H predecessor', receipt => { receipt.successors[path].previousSha256 = '0'.repeat(64); }, /Broken historical-to-361e4067/],
    ['unreviewed terminal bytes', receipt => { receipt.successors[path].currentSha256 = '0'.repeat(64); }, /Unreviewed V188 source bytes/],
    ['duplicate successor as an added source', receipt => {
      receipt.addedSources[path] = receipt.successors[path].currentSha256;
    }, /A new V188 source cannot replace a successor/],
    ['replace successor with added source', receipt => {
      receipt.addedSources[path] = receipt.successors[path].currentSha256;
      delete receipt.successors[path];
    }, /Unreviewed V188 source bytes/]
  ]) {
    const receipt = structuredClone(TANTALUS_PRIORITIES_BROODSTORM_V188);
    mutate(receipt);
    // Execute the actual terminal implementation with only this receipt changed.
    // readSource supplies repository bytes; no temporary module or source edit.
    const source = terminal.slice(0, start) + 'export const TANTALUS_PRIORITIES_BROODSTORM_V188 = freeze('
      + JSON.stringify(receipt) + ');' + terminal.slice(end);
    const mutant = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
    assert.throws(() => mutant.verifyTantalusPrioritiesV188(read), error, reason);
  }
});

test('Queen Mother terminal rejects a false B2 receipt or an added-source disguise for a successor', async () => {
  const terminal = read('scripts/audit-tantalus-priorities-v188.mjs').toString();
  const start = terminal.indexOf('export const TANTALUS_PRIORITIES_QUEEN_MOTHER_V188 = freeze(');
  const end = terminal.indexOf('\n});', start) + '\n});'.length;
  assert.ok(start >= 0 && end > start);
  const path = 'src/special-operations-v131.js';
  for (const [reason, mutate, error] of [
    ['false B2 predecessor', receipt => { receipt.successors[path].previousSha256 = '0'.repeat(64); }, /Broken historical-to-b9aee06a/],
    ['unreviewed terminal bytes', receipt => { receipt.successors[path].currentSha256 = '0'.repeat(64); }, /Broken 001a20b-to-fiorina source chain: src\/special-operations-v131\.js/],
    ['duplicate successor as an added source', receipt => {
      receipt.addedSources[path] = receipt.successors[path].currentSha256;
    }, /A new V188 source cannot replace a successor/],
    ['replace successor with added source', receipt => {
      receipt.addedSources[path] = receipt.successors[path].currentSha256;
      delete receipt.successors[path];
    }, /Broken 001a20b-to-fiorina source chain: src\/special-operations-v131\.js/]
  ]) {
    const receipt = structuredClone(TANTALUS_PRIORITIES_QUEEN_MOTHER_V188);
    mutate(receipt);
    const source = terminal.slice(0, start) + 'export const TANTALUS_PRIORITIES_QUEEN_MOTHER_V188 = freeze('
      + JSON.stringify(receipt) + ');' + terminal.slice(end);
    const mutant = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
    assert.throws(() => mutant.verifyTantalusPrioritiesV188(read), error, reason);
  }
});

test('Queen Mother guard terminal rejects false Q links, invented births and any added-source exception beyond the Q notice test', async () => {
  const terminal = read('scripts/audit-tantalus-priorities-v188.mjs').toString();
  const start = terminal.indexOf('export const TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188 = freeze(');
  const end = terminal.indexOf('\n});', start) + '\n});'.length;
  assert.ok(start >= 0 && end > start);
  const path = 'src/game-production-runtime.js', notice = 'scripts/verify-queen-mother-art-v188.mjs';
  for (const [reason, mutate, error] of [
    ['false Q predecessor', receipt => { receipt.successors[path].previousSha256 = '0'.repeat(64); }, /Broken historical-to-c1d4c636/],
    // The 0d1d9950 Xeno Trials join reviews this runtime file, so a forged R endpoint is now refused at that link.
    ['unreviewed R endpoint', receipt => { receipt.successors[path].currentSha256 = '0'.repeat(64); }, /Unreviewed V188 source bytes|Broken 0d1d9950-to-xeno-trials-join source chain/],
    ['unchanged ordinary successor', receipt => { receipt.successors[path].currentSha256 = receipt.successors[path].previousSha256; }, /must identify changed bytes/],
    ['ordinary successor duplicated as new', receipt => { receipt.addedSources[path] = receipt.successors[path].currentSha256; }, /A new V188 source cannot replace a successor/],
    ['ordinary successor disguised as new', receipt => {
      receipt.addedSources[path] = receipt.successors[path].currentSha256; delete receipt.successors[path];
    }, /Unreviewed V188 source bytes|Broken 0d1d9950-to-xeno-trials-join source chain/],
    ['false Q test birth', receipt => { receipt.addedSourceSuccessors[notice].previousSha256 = '0'.repeat(64); }, /Broken Q added-source predecessor/],
    ['unreviewed Q test endpoint', receipt => { receipt.addedSourceSuccessors[notice].currentSha256 = '0'.repeat(64); }, /Unreviewed V188 source bytes/],
    ['unchanged Q test successor', receipt => { receipt.addedSourceSuccessors[notice].currentSha256 = receipt.addedSourceSuccessors[notice].previousSha256; }, /must identify changed bytes/],
    ['Q test duplicated in ordinary successors', receipt => { receipt.successors[notice] = { ...receipt.addedSourceSuccessors[notice] }; }, /cannot replace a separately added/],
    ['Q test duplicated as a new source', receipt => { receipt.addedSources[notice] = receipt.addedSourceSuccessors[notice].currentSha256; }, /cannot disguise or duplicate/],
    ['Q test disguised as a new source', receipt => {
      receipt.addedSources[notice] = receipt.addedSourceSuccessors[notice].currentSha256; delete receipt.addedSourceSuccessors[notice];
    }, /may supersede only/],
    ['Q helper smuggled into the exception', receipt => {
      receipt.addedSourceSuccessors['src/queen-mother-art-v188.js'] = {
        previousSha256: TANTALUS_PRIORITIES_QUEEN_MOTHER_V188.addedSources['src/queen-mother-art-v188.js'], currentSha256: '0'.repeat(64)
      };
    }, /may supersede only/],
    ['unreviewed historical endpoint', receipt => {
      receipt.successors['src/unreviewed.js'] = { previousSha256: '0'.repeat(64), currentSha256: '1'.repeat(64) };
    }, /needs a reviewed historical endpoint/]
  ]) {
    const receipt = structuredClone(TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188);
    mutate(receipt);
    const source = terminal.slice(0, start) + 'export const TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188 = freeze('
      + JSON.stringify(receipt) + ');' + terminal.slice(end);
    const mutant = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
    assert.throws(() => mutant.verifyTantalusPrioritiesV188(read), error, reason);
  }
});

test('Queen Mother choir resolves through exact R predecessors and rejects bypasses of the historical Q birth', () => {
  const choir = TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188;
  for (const [path, receipt] of Object.entries(choir.successors)) {
    const anchor = TANTALUS_PRIORITIES_SUCCESSORS_V188[path] || TANTALUS_PRIORITIES_CONTINUATION_V188.successors[path]
      || TANTALUS_PRIORITIES_PROLOGUE_V188.successors[path] || TANTALUS_PRIORITIES_QUAY_V188.successors[path]
      || TANTALUS_PRIORITIES_CARGO_ABYSS_V188.successors[path] || TANTALUS_PRIORITIES_HADAL_V188.successors[path]
      || TANTALUS_PRIORITIES_BROODSTORM_V188.successors[path] || TANTALUS_PRIORITIES_QUEEN_MOTHER_V188.successors[path];
    assert.ok(anchor);
    assert.equal(reviewedTantalusPrioritiesDigestV188(path, anchor.previousSha256), leadEndV188(path, receipt.currentSha256));
    assert.equal(receipt.previousSha256, TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188.successors[path].currentSha256);
    for (const endpoint of ['0'.repeat(64), receipt.previousSha256, receipt.currentSha256]) {
      assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, endpoint), /Broken .* source chain/);
    }
  }
  const notice = 'scripts/verify-queen-mother-art-v188.mjs';
  assert.equal(reviewedTantalusPrioritiesDigestV188(notice, TANTALUS_PRIORITIES_QUEEN_MOTHER_V188.addedSources[notice]),
    choir.addedSourceSuccessors[notice].currentSha256);
  for (const endpoint of [choir.addedSourceSuccessors[notice].previousSha256, choir.addedSourceSuccessors[notice].currentSha256]) {
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(notice, endpoint), /Broken c1d4c636-to-queen-mother-guard/);
  }
});

test('Queen Mother choir terminal rejects false R links, a skipped Q birth and source duplication or extra exceptions', async () => {
  const terminal = read('scripts/audit-tantalus-priorities-v188.mjs').toString();
  const start = terminal.indexOf('export const TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188 = freeze(');
  const end = terminal.indexOf('\n});', start) + '\n});'.length;
  assert.ok(start >= 0 && end > start);
  const path = 'src/ecosystem-missions-v131.js', notice = 'scripts/verify-queen-mother-art-v188.mjs';
  for (const [reason, mutate, error] of [
    ['false R predecessor', receipt => { receipt.successors[path].previousSha256 = '0'.repeat(64); }, /Broken historical-to-ded6ef34/],
    // V188 spec 011 (2026-11-23): this file has a later reviewed successor in the join chain (the chapter moved to TR-0),
    // so a forged endpoint here is now refused as a broken link to that successor, no longer as the final bytes.
    ['unreviewed C endpoint', receipt => { receipt.successors[path].currentSha256 = '0'.repeat(64); }, /Broken 0d1d9950-to-xeno-trials-join source chain/],
    ['unchanged ordinary successor', receipt => { receipt.successors[path].currentSha256 = receipt.successors[path].previousSha256; }, /must identify changed bytes/],
    ['ordinary successor duplicated as new', receipt => { receipt.addedSources[path] = receipt.successors[path].currentSha256; }, /A new V188 source cannot replace a successor/],
    ['ordinary successor disguised as new', receipt => {
      receipt.addedSources[path] = receipt.successors[path].currentSha256; delete receipt.successors[path];
    }, /Broken 0d1d9950-to-xeno-trials-join source chain/],
    ['false R notice predecessor', receipt => { receipt.addedSourceSuccessors[notice].previousSha256 = '0'.repeat(64); }, /Broken R added-source predecessor/],
    ['skip R notice predecessor', receipt => { receipt.addedSourceSuccessors[notice].previousSha256 = TANTALUS_PRIORITIES_QUEEN_MOTHER_V188.addedSources[notice]; }, /Broken R added-source predecessor/],
    ['unreviewed C notice endpoint', receipt => { receipt.addedSourceSuccessors[notice].currentSha256 = '0'.repeat(64); }, /Unreviewed V188 source bytes/],
    ['unchanged C notice successor', receipt => { receipt.addedSourceSuccessors[notice].currentSha256 = receipt.addedSourceSuccessors[notice].previousSha256; }, /must identify changed bytes/],
    ['notice duplicated in ordinary successors', receipt => { receipt.successors[notice] = { ...receipt.addedSourceSuccessors[notice] }; }, /cannot replace a separately added/],
    ['notice duplicated as new', receipt => { receipt.addedSources[notice] = receipt.addedSourceSuccessors[notice].currentSha256; }, /cannot disguise or duplicate/],
    ['notice disguised as new', receipt => {
      receipt.addedSources[notice] = receipt.addedSourceSuccessors[notice].currentSha256; delete receipt.addedSourceSuccessors[notice];
    }, /may supersede only/],
    ...['src/queen-mother-art-v188.js', 'src/queen-mother-guard-art-v188.js', 'scripts/verify-queen-mother-guard-art-v188.mjs'].map(extra => [
      'unreviewed exception for ' + extra, receipt => {
        receipt.addedSourceSuccessors[extra] = { previousSha256: '0'.repeat(64), currentSha256: '1'.repeat(64) };
      }, /may supersede only/]),
    ['unreviewed historical endpoint', receipt => {
      receipt.successors['src/unreviewed.js'] = { previousSha256: '0'.repeat(64), currentSha256: '1'.repeat(64) };
    }, /needs a reviewed R endpoint/]
  ]) {
    const receipt = structuredClone(TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188);
    mutate(receipt);
    const source = terminal.slice(0, start) + 'export const TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188 = freeze('
      + JSON.stringify(receipt) + ');' + terminal.slice(end);
    const mutant = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
    assert.throws(() => mutant.verifyTantalusPrioritiesV188(read), error, reason);
  }
});

test('V188 audit and adopted AI tooling stay source-only with exact upstream bytes', () => {
  for (const path of TANTALUS_PRIORITIES_SOURCE_ONLY_PATHS_V188) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
    read(path);
  }
  const manifest = JSON.parse(read('.ai-tools/adopted-v188.json'));
  assert.deepEqual(manifest.tools.map(tool => tool.tool), ['spec_kit', 'claude_game_studios']);
  const sources = JSON.parse(read('.ai-tools/sources.json')).tools;
  assert.equal(manifest.tools[0].commit, sources.spec_kit.commit);
  assert.equal(manifest.tools[1].commit, sources.claude_game_studios.commit);
  for (const tool of manifest.tools) for (const { path, sha256 } of tool.files) {
    assert.equal(sha(read(path)), sha256, 'Adopted tooling differs from its staged bytes: ' + path);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  for (const path of ['.claude/unreviewed.md', '.specify/unreviewed.sh', 'studio-tests/unreviewed.md',
    'docs/engine-reference/unreviewed.md', 'scripts/audit-tantalus-unreviewed-v188.mjs']) {
    assert.equal(isPublicDistributionPathV86(path), false, path);
  }
  const files = collectReleaseTestsV143(JSON.parse(read('package.json')).scripts);
  assert.equal(files.filter(path => path === 'scripts/verify-tantalus-priorities-v188.mjs').length, 1);
});
