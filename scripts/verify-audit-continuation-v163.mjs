import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { basename, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { AUDIT_DEFERRED_FORGE_SOURCES_V163, AUDIT_PREDECESSOR_DOCUMENTS_V163, AUDIT_PRIORITY_IDS_V163,
  loadAuditSuccessionV163, resolveAuditSourcesV163, verifyAuditCoverageV163, verifyAuditSuccessionV163,
  verifyGamedevCorrectionV163 } from './audit-succession-v163.mjs';
import { resolveAuditSourcesV162, verifyAuditSuccessionV162 } from './audit-succession-v162.mjs';
import { resolveAuditSourcesV161 } from './audit-succession-v161.mjs';
import { isPublicDistributionPathV86, isPublicDistributionTextV86 } from './verify-public-release-v86.mjs';

const prefix = 'docs/forge/xeno-trials/';
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const previous = JSON.parse(read(prefix + 'progress-v162.json'));
const current = JSON.parse(read(prefix + 'progress-v163.json'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const clone = value => structuredClone(value);

test('V163 keeps all original task identities, roster and historical table cells unchanged', () => {
  assert.equal(current.lot, 'V163');
  assert.equal(current.baseCommit, 'df40528774642dd374641573ace671aead3f4bfe');
  assert.equal(current.publicationState, 'PREPUBLICATION');
  assert.equal(current.applicationVersion, previous.applicationVersion);
  assert.equal(current.saveSchema, previous.saveSchema);
  for (const key of ['rosterIds', 'inheritedPresentationIds', 'inheritedArt153Ids', 'newWorkstreamsV162', 'sourcePlates'])
    assert.deepEqual(current[key], previous[key], key);
  assert.equal(current.rosterIds.length, 189);
  assert.equal(current.inheritedPresentationIds.length + current.inheritedArt153Ids.length, 68);
  for (const name of current.inheritedTablesFromV162) assert.deepEqual(current.tables[name], previous.tables[name], name);
  assert.equal(current.approved1to1, 0);
  assert.equal(current.fullArtTasksClosed, 0);
});

test('the V162 final delivery and seventeen public workbook ancestors remain historical exact bytes', () => {
  const baseline = current.historicalDeliveryV162;
  assert.equal(baseline.status, 'MERGED_AND_INVENTORY_FINALIZED');
  assert.equal(baseline.reviewedHead, '1811f8e046a2f185392b64d92cda98379a4af993');
  assert.equal(baseline.mainMerge, current.baseCommit);
  assert.deepEqual([baseline.nodeTests, baseline.nodeFiles, baseline.browserProfiles, baseline.automatedBrowserChecks, baseline.captures],
    [2702, 159, 7, 168, 106]);
  assert.equal(baseline.countsAreCurrentV163Results, false);
  assert.equal(baseline.notAHumanPlaytest, true);
  assert.deepEqual(current.historyWorkbooks, [...previous.historyWorkbooks,
    { path: prefix + previous.workbook, sha256: previous.workbookSha256 }]);
  assert.equal(current.historyWorkbooks.length, 17);
  for (const row of current.historyWorkbooks) assert.equal(sha(read(row.path)), row.sha256, row.path);
  for (const [path, expected] of Object.entries(AUDIT_PREDECESSOR_DOCUMENTS_V163)) assert.equal(sha(read(path)), expected, path);
});

test('the completed V163 delivery stays historical while V164 runtime contracts require new evidence', () => {
  const historical = current.historicalDeliveryV163;
  assert.equal(historical.status, 'MERGED_AND_INVENTORY_FINALIZED');
  assert.equal(historical.reviewedHead, '043bb60d9777335d247c8d64c2c58c301d23b306');
  assert.equal(historical.mainMerge, '8a934b7634cb8acd22a04fc900bd772d4fd1e9ac');
  assert.deepEqual([historical.nodeTests, historical.nodeFiles, historical.browserProfiles,
    historical.automatedBrowserChecks, historical.captures], [2993, 171, 16, 1566, 835]);
  assert.equal(historical.countsAreCurrentV164Results, false);
  assert.equal(historical.notAHumanPlaytest, true);
  assert.equal(historical.artistic1to1Approved, false);
  assert.equal(current.followupV164.historicalV163ResultsTransferred, false);
  assert.equal(current.followupV164.runtimeValidation, 'REQUIRES_OWN_EXACT_HEAD_RECEIPTS');
  assert.equal(current.followupV164.forgeState, 'DEFERRED_BY_USER');
  assert.equal(current.followupV164.artClosed, 0);
  assert.equal(current.followupV164.approved1to1, 0);
  assert.ok(current.workbookPublicationNoticeV164.includes('043bb60'));
  assert.ok(current.workbookPublicationNoticeV164.includes('8a934b7'));
  assert.ok(current.tables['07_Recette'].rows.every(row => row[2].startsWith('V164 :')));
  assert.equal(current.limitations.some(text => text.startsWith('Tous les résultats de recette, CI, revue et fusion V163 attendent')), false);
});

test('the full current bridge validates runtime bytes and older default returns stay historical', () => {
  const result = verifyAuditSuccessionV163(previous, current);
  assert.equal(result.inherited, 87);
  assert.equal(result.current, Object.keys(current.runtimeSourceSha256).length);
  assert.deepEqual(loadAuditSuccessionV163().result, result);
  assert.deepEqual(resolveAuditSourcesV163(previous), current.runtimeSourceSha256);
  const v161 = JSON.parse(read(prefix + 'progress-v161.json'));
  const v160 = JSON.parse(read(prefix + 'progress-v160.json'));
  assert.deepEqual(resolveAuditSourcesV162(v161), previous.runtimeSourceSha256);
  assert.deepEqual(resolveAuditSourcesV162(v161, read, { effective: true }), current.runtimeSourceSha256);
  assert.deepEqual(resolveAuditSourcesV161(v160), v161.runtimeSourceSha256);
  assert.deepEqual(resolveAuditSourcesV161(v160, read, { effective: true }), current.runtimeSourceSha256);
  assert.equal(verifyAuditSuccessionV162(v161, previous).current, 87);
});

test('undeclared duplicate unsafe and unverified runtime transitions fail closed', () => {
  const first = current.runtimeSuccession.transitions[0];
  assert.ok(first);
  for (const mutate of [
    c => c.runtimeSuccession.transitions.shift(), c => c.runtimeSuccession.transitions.push(clone(first)),
    c => { c.runtimeSuccession.transitions[0].previousSha256 = '0'.repeat(64); },
    c => { c.runtimeSuccession.transitions[0].currentSha256 = '0'.repeat(64); },
    c => { c.runtimeSuccession.transitions[0].verifiers = []; },
    c => { c.runtimeSuccession.transitions[0].reason = 'fix'; },
    c => { delete c.runtimeSourceSha256[first.path]; },
    c => c.runtimeSuccession.addedSources.pop(),
    c => { c.runtimeSourceSha256['../unsafe.js'] = '0'.repeat(64); },
    c => { c.runtimeSuccession.predecessorDocuments[Object.keys(AUDIT_PREDECESSOR_DOCUMENTS_V163)[0]] = '0'.repeat(64); }
  ]) { const invalid = clone(current); mutate(invalid); assert.throws(() => verifyAuditSuccessionV163(previous, invalid)); }
  for (const path of [...Object.keys(AUDIT_PREDECESSOR_DOCUMENTS_V163), ...Object.keys(current.runtimeSourceSha256)]) {
    const changed = p => p === path ? Buffer.concat([read(p), Buffer.from('\nUNREVIEWED')]) : read(p);
    assert.throws(() => verifyAuditSuccessionV163(previous, current, changed), path);
  }
});

test('absent successors preserve only anchored metadata and malformed successors never fall back', () => {
  const absent = path => { if (path === prefix + 'progress-v163.json') { const error = new Error('absent'); error.code = 'ENOENT'; throw error; } return read(path); };
  assert.deepEqual(resolveAuditSourcesV163(previous, absent), previous.runtimeSourceSha256);
  const forged = clone(previous); forged.runtimeSourceSha256['src/app.js'] = '0'.repeat(64);
  assert.throws(() => resolveAuditSourcesV163(forged, absent));
  for (const raw of ['null', 'false', '0', '{}', '[]', '{']) {
    const supplied = path => path === prefix + 'progress-v163.json' ? Buffer.from(raw) : read(path);
    assert.throws(() => resolveAuditSourcesV163(previous, supplied));
  }
});

test('every task and priority has a bounded owner action and current status without art closure', () => {
  assert.deepEqual(verifyAuditCoverageV163(previous, current), { tasks: 68, priorities: 17, roster: 189, rows: 85, unowned: 0 });
  const rows = current.tables['24_CouvertureV163'].rows;
  assert.equal(rows.filter(row => row[0] === 'task').length, 68);
  assert.deepEqual(rows.filter(row => row[0] === 'priority').map(row => row[1]), AUDIT_PRIORITY_IDS_V163);
  for (const mutate of [
    c => c.tables['24_CouvertureV163'].rows.pop(),
    c => c.tables['24_CouvertureV163'].rows.push(clone(c.tables['24_CouvertureV163'].rows[0])),
    c => { c.tables['24_CouvertureV163'].rows[0][5] = ''; },
    c => { c.tables['24_CouvertureV163'].rows[0][8] = ''; },
    c => { c.tables['24_CouvertureV163'].rows[0][4] = 'DONE'; },
    c => { c.tables['24_CouvertureV163'].rows[0][10] = 1; },
    c => { c.coverageV163.unownedRows = 1; },
    c => { c.tables['25_RosterEtatV163'].rows[0][0] = 'another-identity'; }
  ]) { const invalid = clone(current); mutate(invalid); assert.throws(() => verifyAuditCoverageV163(previous, invalid)); }
});

test('every roster source plate exists with its observed exact bytes while missing rigs remain separate', () => {
  const assets = current.projectAssetCoverageV163;
  assert.equal(assets.roster.length, 189);
  assert.equal(assets.roster.filter(row => row.dedicatedRigAtBaseline).length, 4);
  for (const item of assets.roster) {
    const bytes = read(item.path);
    assert.equal(sha(bytes), item.sha256, item.id);
    assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], item.id);
  }
  assert.deepEqual([assets.costumeSets, assets.completeCostumeSetsAtBaseline, assets.missingDedicatedCostumeSetsAtBaseline], [31, 1, 30]);
  assert.equal(assets.countsAreCurrentRuntimeResults, false);
  assert.equal(assets.newScopedPresentationRigsV163, 15);
  assert.equal(assets.remainingScopedPresentationRigAuthoringV163, 170);
  assert.equal(assets.newFullLocomotionAdmissionsV163, 0);
  assert.equal(assets.roster.filter(row => row.newScopedPresentationRigV163).length, 15);
  const bad = clone(current);
  bad.projectAssetCoverageV163.roster[0].newFullLocomotionV163 = true;
  assert.throws(() => verifyAuditCoverageV163(previous, bad));
});

test('all thirty-two historical Forge pins remain exact with only one verified maintenance continuation', () => {
  assert.equal(current.deferredForge.state, 'DEFERRED_BY_USER');
  assert.equal(current.deferredForge.baselineCommit, current.baseCommit);
  assert.equal(current.deferredForge.newForgeRuntime, 0);
  assert.equal(Object.keys(AUDIT_DEFERRED_FORGE_SOURCES_V163).length, 32);
  assert.deepEqual(current.deferredForge.sourceSha256, AUDIT_DEFERRED_FORGE_SOURCES_V163);
  const corrections = verifyGamedevCorrectionV163(current);
  for (const [path, expected] of Object.entries(AUDIT_DEFERRED_FORGE_SOURCES_V163)) {
    assert.equal(sha(read(path)), corrections[path] ?? expected, path);
    const modified = p => p === path ? Buffer.concat([read(p), Buffer.from('\nUNREVIEWED')]) : read(p);
    assert.throws(() => verifyAuditSuccessionV163(previous, current, modified), path);
  }
  const invalid = clone(current); invalid.deferredForge.state = 'DONE';
  assert.throws(() => verifyAuditSuccessionV163(previous, invalid));
});

test('the gamedev correction binds its exact source, behavioral verifier and historical predecessor', () => {
  const path = 'src/forge-journey-admission-v141.js';
  const correction = current.followupGamedev20261029.corrections[0];
  const admitted = verifyGamedevCorrectionV163(current);
  assert.deepEqual(admitted, { [path]: sha(read(path)) });
  assert.ok(Object.isFrozen(admitted));
  assert.equal(correction.previousSha256, previous.runtimeSourceSha256[path]);
  assert.equal(correction.previousSha256, current.followupV165.runtimeV164SourceSha256[path]);
  assert.equal(correction.verifier.sha256, sha(read('scripts/verify-forge-admission-v141.mjs')));
  const without = clone(current); delete without.followupGamedev20261029;
  assert.deepEqual(verifyGamedevCorrectionV163(without), {});
  assert.throws(() => verifyAuditSuccessionV163(previous, without), /Deferred Forge module changed/);
  for (const changedPath of [path, correction.verifier.path]) {
    const changed = name => name === changedPath ? Buffer.concat([read(name), Buffer.from('\nUNREVIEWED')]) : read(name);
    assert.throws(() => verifyGamedevCorrectionV163(current, changed), /Unreviewed Forge correction/);
  }
});

test('malformed, broadened and fabricated gamedev correction records fail closed', () => {
  for (const mutate of [
    r => { r.schema = 2; },
    r => { r.id = 'UNREVIEWED'; },
    r => { r.baselineCommit = '0'.repeat(40); },
    r => { r.state = 'DONE'; },
    r => { r.runtimeValidation = 'PASSED'; },
    r => { r.scope.newForgeRuntimeModules = 1; },
    r => { r.scope.deferredForgePrioritiesReopened = 2; },
    r => { r.scope.allowAnyForgeSource = true; },
    r => { r.unreviewedOverride = true; },
    r => { r.corrections = []; },
    r => { r.corrections.push(clone(r.corrections[0])); },
    r => { r.corrections[0].path = 'src/forge-journey-v141.js'; },
    r => { r.corrections[0].path = '../unsafe.js'; },
    r => { r.corrections[0].previousSha256 = '0'.repeat(64); },
    r => { r.corrections[0].currentSha256 = r.corrections[0].previousSha256; },
    r => { r.corrections[0].currentSha256 = '0'.repeat(64); },
    r => { r.corrections[0].currentSha256 = null; },
    r => { r.corrections[0].reason = 'fix'; },
    r => { r.corrections[0].verifier.path = 'scripts/verify-forge-journey-v141.mjs'; },
    r => { r.corrections[0].verifier.sha256 = '0'.repeat(64); },
    r => { r.corrections[0].verifier.skip = true; },
    ...['nodeSuite', 'nativeCandidate', 'ci', 'review', 'merge'].map(key => r => { r.releaseEvidence[key] = { status: 'PASSED' }; })
  ]) {
    const invalid = clone(current); mutate(invalid.followupGamedev20261029);
    assert.throws(() => verifyGamedevCorrectionV163(invalid));
  }
  for (const value of [null, false, [], {}]) {
    const invalid = clone(current); invalid.followupGamedev20261029 = value;
    assert.throws(() => verifyGamedevCorrectionV163(invalid));
  }
  for (const select of [r => r.deferredForge.sourceSha256, r => r.followupV165.runtimeV164SourceSha256,
    r => r.runtimeSourceSha256]) {
    const invalid = clone(current); select(invalid)['src/forge-journey-admission-v141.js'] = '0'.repeat(64);
    assert.throws(() => verifyGamedevCorrectionV163(invalid));
  }
});

test('the gamedev correction never admits another changed Forge module even with a matching current pin', () => {
  const path = 'src/forge-journey-v141.js';
  const changedBytes = Buffer.concat([read(path), Buffer.from('\nUNREVIEWED')]);
  const invalid = clone(current); invalid.runtimeSourceSha256[path] = sha(changedBytes);
  const changed = name => name === path ? changedBytes : read(name);
  assert.throws(() => verifyAuditSuccessionV163(previous, invalid, changed), /Deferred Forge module changed/);
});

test('declared current recipe cells and generated adaptations make no current pass or canon claim', () => {
  for (const row of current.tables['07_Recette'].rows) {
    assert.match(row[2], /à exécuter|à vérifier|prépublication/i);
    assert.doesNotMatch(row[2], /réussi|passed|succès|verte/i);
  }
  for (const row of current.tables['23_ChantiersV163'].rows) assert.deepEqual(row.slice(-2), [0, 0]);
  for (const sprite of current.newGeneratedAdaptationSpritesV163) {
    assert.match(sprite.path, /^assets\/[a-zA-Z0-9_./-]+\.png$/);
    assert.equal(sha(read(sprite.path)), sprite.sha256);
    assert.equal(sprite.approved1to1, false);
  }
});

test('the complete workbook has exact cells cached formulas and no errors or executable external content', () => {
  const result = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL('./verify-audit-workbook-v163.py', import.meta.url)),
    fileURLToPath(new URL('../' + prefix, import.meta.url))], { encoding: 'utf8' }));
  assert.equal(result.ok, true);
  assert.equal(result.sheets, Object.keys(current.tables).length + 1);
  assert.equal(result.formulaErrors, 0);
});

test('a deterministic workbook rebuild does not update source pins or historical bytes', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'atf-audit-v163-'));
  try {
    const document = join(temporary, 'progress-v163.json');
    copyFileSync(fileURLToPath(new URL('../' + prefix + 'progress-v163.json', import.meta.url)), document);
    for (const item of current.historyWorkbooks) copyFileSync(fileURLToPath(new URL('../' + item.path, import.meta.url)), join(temporary, basename(item.path)));
    for (let i = 0; i < 2; i++) {
      const result = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL('./generate-audit-continuation-v163.py', import.meta.url)), temporary], { encoding: 'utf8' }));
      assert.equal(result.sha256, current.workbookSha256);
      assert.deepEqual(readFileSync(join(temporary, current.workbook)), read(prefix + current.workbook));
      assert.deepEqual(JSON.parse(readFileSync(document)), current);
      for (const item of current.historyWorkbooks) assert.equal(sha(readFileSync(join(temporary, basename(item.path)))), item.sha256);
    }
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});

test('only the reviewed three V163 documentary artifacts are admitted', () => {
  for (const name of ['progress-v163.json', 'V163-EXCEL-COMPLETION.md', current.workbook]) {
    assert.equal(isPublicDistributionPathV86(prefix + name), true, name);
    assert.equal(isPublicDistributionPathV86(prefix + name, { built: true }), false, name);
    if (!name.endsWith('.xlsx')) {
      const text = read(prefix + name).toString();
      assert.doesNotMatch(text, /\/workspace\/|\/home\/|\/Users\//);
      assert.equal(isPublicDistributionTextV86(text), true, name);
    }
  }
  for (const path of ['docs/private-audit-v163.json', 'docs/forge/xeno-trials/unreviewed-v163.json',
    'INVENTAIRE_MANQUES_REPRIS_V163.xlsx', 'reprise-v163/release-index.json'])
    assert.equal(isPublicDistributionPathV86(path), false, path);
});
