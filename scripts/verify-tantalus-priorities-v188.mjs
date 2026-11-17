import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  TANTALUS_PRIORITIES_BASELINE_V188, TANTALUS_PRIORITIES_SUCCESSORS_V188, TANTALUS_PRIORITIES_CONTINUATION_V188,
  TANTALUS_PRIORITIES_PROLOGUE_V188, TANTALUS_PRIORITIES_QUAY_V188, TANTALUS_PRIORITIES_CARGO_ABYSS_V188,
  TANTALUS_PRIORITIES_HADAL_V188, TANTALUS_PRIORITIES_SOURCE_ONLY_PATHS_V188, reviewedTantalusPrioritiesDigestV188,
  verifyTantalusPrioritiesV188, TANTALUS_PRIORITIES_CARGO_REGISTRY_V188, verifyCargoRegistryContinuationV188
} from './audit-tantalus-priorities-v188.mjs';
import { verifyNativeQaResourcesV187 } from './audit-native-qa-resources-v187.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { collectReleaseTestsV143 } from './test-release-v143.mjs';
import { SPECIAL_OPERATIONS_V131 as operations, SPECIAL_OPERATION_COUNTS_V131 as operationCounts } from '../src/special-operations-v131.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('V188 registry continuation closes only the Cargo art debt and rejects neighboring promotions', () => {
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
  assert.deepEqual(verifyCargoRegistryContinuationV188(operations, operationCounts), {
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
    const mutated = operations.map(operation => ({ ...operation, remainingMechanics: [...operation.remainingMechanics] }));
    mutate(mutated);
    assert.throws(() => verifyCargoRegistryContinuationV188(mutated, operationCounts), undefined, reason);
  }
  for (const badCounts of [transition.previousCounts, { ...operationCounts, playable: 20 },
    { ...operationCounts, extra: 1 }]) {
    assert.throws(() => verifyCargoRegistryContinuationV188(operations, badCounts), /Registry counters/);
  }
  assert.throws(() => verifyCargoRegistryContinuationV188(operations, operationCounts,
    path => Buffer.concat([read(path), Buffer.from('\n')])), /Changed historical V158 operations snapshot/);
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
  const unique = new Set([...Object.keys(TANTALUS_PRIORITIES_SUCCESSORS_V188), ...Object.keys(continuation.successors),
    ...Object.keys(prologue.successors), ...Object.keys(quay.successors), ...Object.keys(cargoAbyss.successors), ...Object.keys(hadal.successors)]);
  assert.equal(result.successors, unique.size); assert.equal(result.successors, 133);
  assert.equal(result.addedSources, 9);
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
    assert.equal(reviewedTantalusPrioritiesDigestV188(path, anchor.previousSha256), TANTALUS_PRIORITIES_HADAL_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_CARGO_ABYSS_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_QUAY_V188.successors[path]?.currentSha256 || receipt.currentSha256,
      'The original anchor must resolve through every exact published endpoint: ' + path);
    assert.throws(() => verifyTantalusPrioritiesV188(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate)), /Unreviewed V188 source bytes/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, '0'.repeat(64)), /Broken .* source chain/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.currentSha256), /Broken .* source chain/);
  }
  for (const [path, receipt] of Object.entries(TANTALUS_PRIORITIES_QUAY_V188.successors)) {
    const anchor = TANTALUS_PRIORITIES_SUCCESSORS_V188[path] || TANTALUS_PRIORITIES_CONTINUATION_V188.successors[path]
      || TANTALUS_PRIORITIES_PROLOGUE_V188.successors[path] || receipt;
    assert.equal(reviewedTantalusPrioritiesDigestV188(path, anchor.previousSha256), TANTALUS_PRIORITIES_HADAL_V188.successors[path]?.currentSha256
      || TANTALUS_PRIORITIES_CARGO_ABYSS_V188.successors[path]?.currentSha256 || receipt.currentSha256,
      'The original anchor must resolve through the exact published ee565717 endpoint: ' + path);
    assert.throws(() => verifyTantalusPrioritiesV188(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate)), /Unreviewed V188 source bytes/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, '0'.repeat(64)), /Broken .* source chain/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.currentSha256), /Broken .* source chain/);
    if (anchor !== receipt) assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.previousSha256), /Broken .* source chain/);
  }
  for (const [path, receipt] of Object.entries(TANTALUS_PRIORITIES_CARGO_ABYSS_V188.successors)) {
    const anchor = TANTALUS_PRIORITIES_SUCCESSORS_V188[path] || TANTALUS_PRIORITIES_CONTINUATION_V188.successors[path]
      || TANTALUS_PRIORITIES_PROLOGUE_V188.successors[path] || TANTALUS_PRIORITIES_QUAY_V188.successors[path] || receipt;
    assert.equal(reviewedTantalusPrioritiesDigestV188(path, anchor.previousSha256), TANTALUS_PRIORITIES_HADAL_V188.successors[path]?.currentSha256 || receipt.currentSha256,
      'The original anchor must resolve through the exact published 232693f1 endpoint: ' + path);
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
    assert.equal(reviewedTantalusPrioritiesDigestV188(path, anchor.previousSha256), receipt.currentSha256,
      'The original anchor must resolve through the exact published a3634de7 endpoint: ' + path);
    assert.throws(() => verifyTantalusPrioritiesV188(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate)), /Unreviewed V188 source bytes/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, '0'.repeat(64)), /Broken .* source chain/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.currentSha256), /Broken .* source chain/);
    if (anchor !== receipt) assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.previousSha256), /Broken .* source chain/);
  }
  for (const path of [...Object.keys(TANTALUS_PRIORITIES_CONTINUATION_V188.addedSources), ...Object.keys(TANTALUS_PRIORITIES_PROLOGUE_V188.addedSources),
    ...Object.keys(TANTALUS_PRIORITIES_QUAY_V188.addedSources), ...Object.keys(TANTALUS_PRIORITIES_CARGO_ABYSS_V188.addedSources),
    ...Object.keys(TANTALUS_PRIORITIES_HADAL_V188.addedSources)]) {
    assert.throws(() => verifyTantalusPrioritiesV188(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate)), /Unreviewed V188 source bytes/);
  }
  for (const map of [TANTALUS_PRIORITIES_CONTINUATION_V188.successors, TANTALUS_PRIORITIES_CONTINUATION_V188.addedSources,
    TANTALUS_PRIORITIES_PROLOGUE_V188.successors, TANTALUS_PRIORITIES_PROLOGUE_V188.addedSources,
    TANTALUS_PRIORITIES_QUAY_V188.successors, TANTALUS_PRIORITIES_QUAY_V188.addedSources,
    TANTALUS_PRIORITIES_CARGO_ABYSS_V188.successors, TANTALUS_PRIORITIES_CARGO_ABYSS_V188.addedSources,
    TANTALUS_PRIORITIES_HADAL_V188.successors, TANTALUS_PRIORITIES_HADAL_V188.addedSources]) {
    assert.equal(Object.hasOwn(map, 'scripts/audit-tantalus-priorities-v188.mjs'), false);
  }
  assert.equal(reviewedTantalusPrioritiesDigestV188('src/unreviewed.js', 'unchanged'), 'unchanged');
  assert.equal(Object.hasOwn(TANTALUS_PRIORITIES_SUCCESSORS_V188, 'scripts/audit-tantalus-priorities-v188.mjs'), false);
  const terminal = read('scripts/audit-tantalus-priorities-v188.mjs').toString();
  assert.equal(/(?:from\s*|import\s*\(?\s*)['"]\.\//.test(terminal), false, 'The terminal audit must not import another audit.');
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
