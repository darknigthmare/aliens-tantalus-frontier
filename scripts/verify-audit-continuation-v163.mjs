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
  verifyGamedevCorrectionV163, ARSENAL_V167_SUCCESSORS, ARSENAL_V167_NEW_SOURCES,
  ARMORY_V169_SUCCESSORS, ARMORY_V169_NEW_SOURCES, ARSENAL_V170_SUCCESSORS,
  ARMORY_V170_ASSET_SOURCE, ARSENAL_V170_NEW_SOURCES, ARSENAL_V171_SUCCESSORS,
  ARSENAL_V171_NEW_SOURCES, V165_VERIFIER_SUCCESSORS_V171,
  ARMORY_V172_RELEASE_SUCCESSORS, WEAPON_V173_SOURCE_SUCCESSORS,
  V165_VERIFIER_SUCCESSORS_V173, V165_VERIFIER_SUCCESSORS_V174,
  V165_VERIFIER_SUCCESSORS_V176, ARMORY_V174_ECONOMY_SUCCESSORS,
  ARMORY_V174_ECONOMY_NEW_SOURCES, V177_SOURCE_SUCCESSORS,
  V165_VERIFIER_SUCCESSORS_V177, verifyReviewedVerifierV177,
  verifyOpenWorkstreamsV177, V177_ARSENAL_SOURCE_INPUTS, V177_RUNTIME_PREDECESSORS, V177_TOOL_SUCCESSORS,
  V178_RUNTIME_SUCCESSORS, V178_VERIFIER_SUCCESSORS, V178_QA_SUCCESSORS,
  reviewedLiveDigestV178, reviewedCurrentDigestV179, verifyFollowupV178 } from './audit-succession-v163.mjs';
import { V179_BASELINE_COMMIT, V179_RUNTIME_SUCCESSORS, V179_VERIFIER_SUCCESSORS, V179_BRIDGE_SUCCESSORS, V179_NEW_RUNTIME_SOURCES, V179_NEW_VERIFIERS, reviewedDigestV179, verifyFollowupV179 } from './audit-succession-v179.mjs';
import { resolveAuditSourcesV162, verifyAuditSuccessionV162 } from './audit-succession-v162.mjs';
import { resolveAuditSourcesV161 } from './audit-succession-v161.mjs';
import { isPublicDistributionPathV86, isPublicDistributionTextV86 } from './verify-public-release-v86.mjs';

const prefix = 'docs/forge/xeno-trials/';
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const previous = JSON.parse(read(prefix + 'progress-v162.json'));
const current = JSON.parse(read(prefix + 'progress-v163.json'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const clone = value => structuredClone(value);
const effectiveSource = (path, historical) => reviewedCurrentDigestV179(path, V177_SOURCE_SUCCESSORS[path]?.currentSha256 || historical);

test('V179 admits only exact changed bytes and new sources after the immutable V178 witness', () => {
  assert.equal(V179_BASELINE_COMMIT, 'd41b5fc120da2e7a5938308f9d3c852d20e53cc5');
  assert.deepEqual(verifyFollowupV179(read), {
    baselineCommit: V179_BASELINE_COMMIT, runtimeSuccessors: 8, verifierSuccessors: 4,
    bridgeSuccessors: 2, newRuntimeSources: 5, newVerifiers: 6
  });
  const historical = Buffer.from(read(prefix + 'progress-v163.json'));
  const effective = resolveAuditSourcesV163(previous, read, { effective: true });
  for (const [path, receipt] of Object.entries(V179_RUNTIME_SUCCESSORS)) {
    assert.equal(effective[path], receipt.currentSha256);
    assert.throws(() => reviewedDigestV179(path, '0'.repeat(64)), /Incorrect V178 endpoint/);
    assert.notEqual(receipt.previousSha256, receipt.currentSha256);
  }
  for (const [path, hash] of Object.entries(V179_NEW_RUNTIME_SOURCES)) assert.equal(effective[path], hash);
  for (const map of [V179_RUNTIME_SUCCESSORS, V179_VERIFIER_SUCCESSORS, V179_BRIDGE_SUCCESSORS]) {
    for (const [path, receipt] of Object.entries(map)) {
      assert.equal(sha(read(path)), receipt.currentSha256, path);
      assert.equal(reviewedDigestV179(path, receipt.previousSha256), receipt.currentSha256);
      assert.throws(() => reviewedDigestV179(path, '0'.repeat(64)), /Incorrect V178 endpoint/, path);
      const changed = name => name === path ? Buffer.concat([read(name), Buffer.from('\nUNREVIEWED')]) : read(name);
      assert.throws(() => verifyFollowupV179(changed), /Unreviewed V179/, path);
      assert.throws(() => verifyAuditSuccessionV163(previous, current, changed), undefined, path);
    }
  }
  for (const [path, hash] of Object.entries({ ...V179_NEW_RUNTIME_SOURCES, ...V179_NEW_VERIFIERS })) {
    assert.equal(sha(read(path)), hash, path);
    const changed = name => name === path ? Buffer.concat([read(name), Buffer.from('\nUNREVIEWED')]) : read(name);
    assert.throws(() => verifyFollowupV179(changed), /Unreviewed V179/, path);
    assert.throws(() => verifyAuditSuccessionV163(previous, current, changed), undefined, path);
  }
  assert.deepEqual(read(prefix + 'progress-v163.json'), historical);
  assert.deepEqual(resolveAuditSourcesV163(previous), current.runtimeSourceSha256,
    'The default resolver remains the historical record');
  for (const [path, receipt] of Object.entries(V178_VERIFIER_SUCCESSORS))
    assert.equal(reviewedLiveDigestV178(path, receipt.previousSha256), receipt.currentSha256,
      'V178 still resolves its own historical endpoint: ' + path);
});

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
  const approvedEffectiveV174 = { ...current.runtimeSourceSha256,
    ...Object.fromEntries(Object.entries(ARSENAL_V167_SUCCESSORS).map(([path, receipt]) => [path, receipt.currentSha256])),
    ...Object.fromEntries(Object.entries(ARMORY_V169_SUCCESSORS).map(([path, receipt]) => [path, receipt.currentSha256])),
    ...Object.fromEntries(Object.entries(ARSENAL_V170_SUCCESSORS).map(([path, receipt]) => [path, receipt.currentSha256])),
    ...Object.fromEntries(Object.entries(ARSENAL_V171_SUCCESSORS)
      .filter(([path]) => Object.hasOwn(current.runtimeSourceSha256, path))
      .map(([path, receipt]) => [path, receipt.currentSha256])),
    ...Object.fromEntries(Object.entries(ARMORY_V174_ECONOMY_SUCCESSORS).map(([path, receipt]) => [path, receipt.currentSha256])),
    ...Object.fromEntries(Object.entries(V177_SOURCE_SUCCESSORS)
      .filter(([path]) => Object.hasOwn(current.runtimeSourceSha256, path))
      .map(([path, receipt]) => [path, receipt.currentSha256])),
    ...Object.fromEntries(Object.entries(V178_RUNTIME_SUCCESSORS).map(([path,receipt]) => [path,receipt.currentSha256])),
    ...Object.fromEntries(Object.entries(V179_RUNTIME_SUCCESSORS).map(([path,receipt]) => [path,receipt.currentSha256])),
    ...V179_NEW_RUNTIME_SOURCES };
  assert.deepEqual(resolveAuditSourcesV162(v161, read, { effective: true }), approvedEffectiveV174);
  assert.deepEqual(resolveAuditSourcesV161(v160), v161.runtimeSourceSha256);
  assert.deepEqual(resolveAuditSourcesV161(v160, read, { effective: true }), approvedEffectiveV174);
  assert.equal(verifyAuditSuccessionV162(v161, previous).current, 87);
});

test('the V169 armory app successor is chained, source-pinned and cannot be forged', () => {
  const app='src/app.js', receipt=ARMORY_V169_SUCCESSORS[app];
  assert.deepEqual(Object.keys(ARMORY_V169_SUCCESSORS), [app]);
  assert.equal(receipt.previousSha256, ARSENAL_V167_SUCCESSORS[app].currentSha256);
  assert.equal(ARSENAL_V170_SUCCESSORS[app].previousSha256, receipt.currentSha256);
  assert.equal(ARMORY_V174_ECONOMY_SUCCESSORS[app].previousSha256, ARSENAL_V170_SUCCESSORS[app].currentSha256);
  assert.equal(sha(read(app)), effectiveSource(app, ARMORY_V174_ECONOMY_SUCCESSORS[app].currentSha256));
  assert.equal(receipt.verifier, 'scripts/verify-hub-armory-v169.mjs');
  assert.equal(sha(read(receipt.verifier)), effectiveSource(receipt.verifier, receipt.verifierSha256));
  assert.deepEqual(Object.keys(ARMORY_V169_NEW_SOURCES), ['src/hub-armory-storefront-v169.js']);
  for (const [path, digest] of Object.entries(ARMORY_V169_NEW_SOURCES)) {
    assert.equal(sha(read(path)), effectiveSource(path, ARMORY_V172_RELEASE_SUCCESSORS[path].currentSha256));
    assert.equal(ARSENAL_V171_SUCCESSORS[path].previousSha256, ARMORY_V170_ASSET_SOURCE.currentSha256);
    assert.equal(ARMORY_V170_ASSET_SOURCE.previousSha256, digest);
  }
  for (const changedPath of [app, receipt.verifier, ...Object.keys(ARMORY_V169_NEW_SOURCES)]) {
    const mutated=path=>path===changedPath ? Buffer.concat([read(path),Buffer.from('\\nUNREVIEWED')]) : read(path);
    assert.throws(() => verifyAuditSuccessionV163(previous,current,mutated),
      /Unreviewed V169|Unreviewed V170|Unreviewed V171|Unreviewed V172|Unreviewed V174|Unreviewed V177/, changedPath);
  }
});

test('V170 evidence, commerce and source-art successors are byte-pinned, not art-certified', () => {
  assert.deepEqual(Object.keys(ARSENAL_V170_SUCCESSORS).sort(), ['src/app.js', 'sw.js']);
  assert.equal(ARSENAL_V170_SUCCESSORS['sw.js'].previousSha256,
    ARSENAL_V167_SUCCESSORS['sw.js'].currentSha256);
  assert.equal(ARSENAL_V171_SUCCESSORS['sw.js'].previousSha256, ARSENAL_V170_SUCCESSORS['sw.js'].currentSha256);
  assert.equal(ARMORY_V174_ECONOMY_SUCCESSORS['sw.js'].previousSha256, ARSENAL_V171_SUCCESSORS['sw.js'].currentSha256);
  assert.equal(sha(read('sw.js')), effectiveSource('sw.js', ARMORY_V174_ECONOMY_SUCCESSORS['sw.js'].currentSha256));
  for (const [path, digest] of Object.entries(ARSENAL_V170_NEW_SOURCES)) {
    const successor=ARSENAL_V171_SUCCESSORS[path];
    if(successor) assert.equal(successor.previousSha256,digest);
    assert.equal(sha(read(path)),effectiveSource(path, ARMORY_V172_RELEASE_SUCCESSORS[path]?.currentSha256||successor?.currentSha256||digest),path);
  }
  for (const path of Object.keys(ARSENAL_V170_NEW_SOURCES)) {
    const corrupted = name => name === path
      ? Buffer.concat([read(name), Buffer.from('\nUNREVIEWED')]) : read(name);
    assert.throws(() => verifyAuditSuccessionV163(previous, current, corrupted), /Unreviewed V170|Unreviewed V171|Unreviewed V172|Unreviewed V173|Unreviewed V177/, path);
  }
});

test('V171 historical successors and research/feed/installer inputs are all source-pinned', () => {
  assert.equal(Object.keys(ARSENAL_V171_SUCCESSORS).length, 5);
  assert.equal(Object.keys(ARSENAL_V171_NEW_SOURCES).length, 6);
  for (const [path, receipt] of Object.entries(ARSENAL_V171_SUCCESSORS)) {
    const current = ARMORY_V174_ECONOMY_SUCCESSORS[path] || ARMORY_V172_RELEASE_SUCCESSORS[path];
    if (current) assert.equal(current.previousSha256, receipt.currentSha256);
    assert.equal(sha(read(path)), effectiveSource(path, current?.currentSha256 || receipt.currentSha256), path);
  }
  for (const [path, expected] of Object.entries(ARSENAL_V171_NEW_SOURCES)) {
    const v172 = ARMORY_V172_RELEASE_SUCCESSORS[path];
    const v173 = WEAPON_V173_SOURCE_SUCCESSORS[path];
    if (v172) assert.equal(v172.previousSha256, expected);
    if (v173) assert.equal(v173.previousSha256, expected);
    assert.equal(sha(read(path)), effectiveSource(path, v173?.currentSha256 || v172?.currentSha256 || expected), path);
  }
  for (const [path, receipt] of Object.entries(ARMORY_V172_RELEASE_SUCCESSORS)) {
    assert.ok(receipt.previousSha256 && receipt.currentSha256);
    assert.equal(sha(read(path)), effectiveSource(path, receipt.currentSha256), path);
  }
  for (const [path, receipt] of Object.entries(WEAPON_V173_SOURCE_SUCCESSORS)) {
    assert.equal(sha(read(path)), effectiveSource(path, receipt.currentSha256), path);
  }
  for (const [path, receipt] of Object.entries(V165_VERIFIER_SUCCESSORS_V171)) {
    assert.ok(receipt.previousSha256 && receipt.currentSha256);
    verifyReviewedVerifierV177(path, receipt.previousSha256, read);
  }
});

test('V176 distributor and audit verifier successors retain V174 receipts intact', () => {
  assert.deepEqual(Object.keys(V165_VERIFIER_SUCCESSORS_V176).sort(),
    ['scripts/verify-audit-continuation-v163.mjs','scripts/verify-public-release-v86.mjs']);
  for (const [path, revision] of Object.entries(V165_VERIFIER_SUCCESSORS_V176)) {
    assert.equal(revision.previousSha256,V165_VERIFIER_SUCCESSORS_V174[path].currentSha256,path);
    assert.equal(sha(read(path)),reviewedCurrentDigestV179(path,V165_VERIFIER_SUCCESSORS_V177[path]?.currentSha256 || revision.currentSha256),path);
    const modified=target=>target===path?Buffer.concat([read(target),Buffer.from('unreviewed')]):read(target);
    assert.throws(()=>verifyAuditSuccessionV163(previous,current,modified),/Unreviewed V17[678] verifier/,path);
  }
});

test('V174 armory economy and QA are exact successors without rewriting historical hashes', () => {
  assert.deepEqual(Object.keys(ARMORY_V174_ECONOMY_SUCCESSORS).sort(), ['src/app.js','sw.js']);
  assert.deepEqual(Object.keys(ARMORY_V174_ECONOMY_NEW_SOURCES).sort(),
    ['scripts/verify-armory-resupply-v174.mjs','src/armory-resupply-v174.js']);
  for (const [path, receipt] of Object.entries(ARMORY_V174_ECONOMY_SUCCESSORS))
    assert.equal(sha(read(path)), effectiveSource(path, receipt.currentSha256), path);
  for (const [path, hash] of Object.entries(ARMORY_V174_ECONOMY_NEW_SOURCES))
    assert.equal(sha(read(path)), effectiveSource(path, hash), path);
  for (const path of Object.keys(ARMORY_V174_ECONOMY_NEW_SOURCES)) {
    const changed=name=>name===path ? Buffer.concat([read(name), Buffer.from('\nUNAPPROVED')]) : read(name);
    assert.throws(()=>verifyAuditSuccessionV163(previous,current,changed),/Unreviewed V174|Unreviewed V177/,path);
  }
});

test('V177 retains every reviewed V167 through V176 receipt instead of rewriting a predecessor', () => {
  const frozenReceipts = {
    ARSENAL_V167_SUCCESSORS, ARSENAL_V167_NEW_SOURCES, ARMORY_V169_SUCCESSORS, ARMORY_V169_NEW_SOURCES,
    ARSENAL_V170_SUCCESSORS, ARMORY_V170_ASSET_SOURCE, ARSENAL_V170_NEW_SOURCES,
    ARSENAL_V171_SUCCESSORS, ARSENAL_V171_NEW_SOURCES, V165_VERIFIER_SUCCESSORS_V171,
    ARMORY_V172_RELEASE_SUCCESSORS, WEAPON_V173_SOURCE_SUCCESSORS, V165_VERIFIER_SUCCESSORS_V173,
    ARMORY_V174_ECONOMY_SUCCESSORS, ARMORY_V174_ECONOMY_NEW_SOURCES,
    V165_VERIFIER_SUCCESSORS_V174, V165_VERIFIER_SUCCESSORS_V176
  };
  assert.equal(sha(JSON.stringify(frozenReceipts)), '9a0cbed89806b89035d878d89f505518fca66f6cfc1bb1f8ce509d1e35e0340e',
    'Historical source and verifier receipt maps must retain their baseline4676a78 values.');
  assert.deepEqual(Object.keys(V165_VERIFIER_SUCCESSORS_V177).sort(), [
    'scripts/verify-audit-continuation-v163.mjs', 'scripts/verify-parallel-completion-v165.mjs',
    'scripts/verify-public-release-v86.mjs'
  ]);
  for (const [path, receipt] of Object.entries(V165_VERIFIER_SUCCESSORS_V177)) {
    const previousReceipt = V165_VERIFIER_SUCCESSORS_V176[path] || V165_VERIFIER_SUCCESSORS_V174[path]
      || V165_VERIFIER_SUCCESSORS_V173[path] || V165_VERIFIER_SUCCESSORS_V171[path];
    assert.equal(receipt.previousSha256, previousReceipt.currentSha256, path);
    assert.notEqual(receipt.currentSha256, receipt.previousSha256, path);
    assert.equal(verifyReviewedVerifierV177(path, V165_VERIFIER_SUCCESSORS_V171[path].previousSha256, read), reviewedCurrentDigestV179(path,receipt.currentSha256));
    const corrupted = name => name === path ? Buffer.concat([read(name), Buffer.from('\nUNREVIEWED')]) : read(name);
    assert.throws(() => verifyAuditSuccessionV163(previous, current, corrupted),
      error => /Unreviewed V17[78] verifier/.test(error.message) && error.message.includes(path), path);
  }
});

test('V177 source successors reject unreviewed bytes even when the live JSON pin is forged to match them', () => {
  assert.ok(Object.keys(V177_SOURCE_SUCCESSORS).length >= 5, 'The actual source continuation must be explicit.');
  for (const [path, receipt] of Object.entries(V177_SOURCE_SUCCESSORS)) {
    assert.equal(sha(read(path)), reviewedCurrentDigestV179(path,receipt.currentSha256), path);
    assert.notEqual(receipt.previousSha256, receipt.currentSha256, path);
    const bytes = Buffer.concat([read(path), Buffer.from('\nUNREVIEWED')]);
    const corrupted = name => name === path ? bytes : read(name);
    assert.throws(() => verifyAuditSuccessionV163(previous, current, corrupted),
      error => error.message.includes('Unreviewed V177') && error.message.includes(path), path);
    const forged = clone(current);
    if (Object.hasOwn(forged.runtimeSourceSha256, path)) forged.runtimeSourceSha256[path] = sha(bytes);
    assert.throws(() => verifyAuditSuccessionV163(previous, forged, corrupted), undefined,
      'Updating a live JSON field must not rewrite this immutable receipt chain: ' + path);
  }
});

test('V177 requires the complete baseline467 source-change ledger and rejects invented predecessors', () => {
  const expected = Object.keys(V177_RUNTIME_PREDECESSORS).sort();
  assert.ok(expected.length >= 20);
  assert.deepEqual(current.followupV177.sourceChanges.map(row => row.path), expected);
  for (const alter of [
    rows => rows.splice(0), rows => rows.pop(), rows => rows.push(clone(rows[0])),
    rows => { rows[0].previousSha256 = '0'.repeat(64); },
    rows => { rows[0].path = 'src/unknown-unreviewed-v177.js'; }
  ]) {
    const forged = clone(current); alter(forged.followupV177.sourceChanges);
    assert.throws(() => verifyOpenWorkstreamsV177(forged), /V177 source-change ledger|V177 runtime predecessor/);
  }
});

test('V177 tracks six bounded corrections while media, Forge and candidate release evidence remain open', () => {
  assert.deepEqual(verifyOpenWorkstreamsV177(current), {
    streams: 6, sources: current.followupV177.sourceChanges.length, trialSheets: 28, arsenalSheets: 5
  });
  for (const mutate of [
    f => { f.state = 'DONE'; }, f => { f.approved1to1 = 1; }, f => { f.fullArtTasksClosed = 18; },
    f => { f.humanParticipants = 4; }, f => { f.remaining.newArchivesRecovered = 1; },
    f => { f.remaining.costumeReferences = 0; }, f => { f.remaining.forgeState = 'DONE'; },
    f => { f.workstreams[0].nativeState = 'PASSED'; }, f => { f.workstreams[0].artClosed = 1; },
    f => { f.workstreams[0].modules.push('src/forge-campaign-v161.js'); },
    f => { f.releaseEvidence.ci = { status: 'SUCCESS' }; },
    f => { f.shipTracking.installations = 200; },
    f => { f.shipTracking.ledgerSha256 = '0'.repeat(64); },
    f => { f.shipTracking.state = 'NATIVE_PASSED'; }
  ]) {
    const forged = clone(current); mutate(forged.followupV177);
    assert.throws(() => verifyOpenWorkstreamsV177(forged));
  }
  for (const path of Object.keys(V177_ARSENAL_SOURCE_INPUTS)) {
    const bytes = Buffer.concat([read(path), Buffer.from('UNREVIEWED')]);
    const changed = name => name === path ? bytes : read(name);
    assert.throws(() => verifyOpenWorkstreamsV177(current, changed), undefined, path);
    const forged = clone(current); forged.followupV177.arsenalTracking.sourceInputs[path] = sha(bytes);
    assert.throws(() => verifyOpenWorkstreamsV177(forged, changed), undefined,
      'The original V1 specification/CSV hash cannot be rewritten: ' + path);
  }
  for (const row of current.followupV177.developmentToolChanges) {
    assert.deepEqual([row.previousSha256, row.currentSha256],
      [V177_TOOL_SUCCESSORS[row.path].previousSha256, V177_TOOL_SUCCESSORS[row.path].currentSha256]);
    const bytes = Buffer.concat([read(row.path), Buffer.from('UNREVIEWED')]);
    const changed = path => path === row.path ? bytes : read(path);
    assert.throws(() => verifyOpenWorkstreamsV177(current, changed),
      error => error.message.includes(row.path)
        && /Unreviewed V177 (?:tool bytes|behavioral verifier)/.test(error.message));
    const forged = clone(current);
    forged.followupV177.developmentToolChanges.find(r => r.path === row.path).currentSha256 = sha(bytes);
    assert.throws(() => verifyOpenWorkstreamsV177(forged, changed));
  }
  const omittedTools = clone(current); omittedTools.followupV177.developmentToolChanges = [];
  assert.throws(() => verifyOpenWorkstreamsV177(omittedTools));
  const ledger = current.followupV177.shipTracking.ledgerPath;
  const changedLedger = path => path === ledger ? Buffer.concat([read(path), Buffer.from('UNREVIEWED')]) : read(path);
  assert.throws(() => verifyOpenWorkstreamsV177(current, changedLedger), /Unreviewed V177 ship ledger bytes/);
});

test('the recovered V168 archive closes only its historical delivery while global CI remains open', () => {
  const delivery = current.historicalDeliveryV168;
  assert.equal(delivery.status, 'MERGED_WITH_SCOPED_LOCAL_VALIDATION_AND_OPEN_GLOBAL_CI');
  assert.equal(delivery.reviewedHead, 'aa10e78b9c51d44efa5904c054e56686776a09f5');
  assert.equal(delivery.mainMerge, 'c932d0dca69aad67e43e496e7fbeb39e0064ca4c');
  assert.equal(delivery.validatedTree, '78b0aea8a32d0f457fe174aa37ae4fe5b1436b8e');
  assert.deepEqual([delivery.nodeTests, delivery.nodeFiles, delivery.nativeRooms,
    delivery.visibleInstallations, delivery.speakerAvatars], [3686, 193, 35, 100, 16]);
  assert.equal(current.followupV168.state, 'PREPUBLICATION');
  assert.equal(delivery.countsAreCurrentV177Results, false);
  assert.equal(delivery.ciGloballyGreen, false);
  assert.deepEqual([delivery.humanParticipants, delivery.artClosed, delivery.canonical1to1Approved], [0, 0, false]);
  for (const alter of [
    d => { d.ciGloballyGreen = true; }, d => { d.countsAreCurrentV177Results = true; },
    d => { d.visibleInstallations = 200; }, d => { d.humanParticipants = 4; },
    d => { d.durableArchive.sha256 = '0'.repeat(64); }, d => { d.mergeReceipt.sha256 = '0'.repeat(64); }
  ]) {
    const forged = clone(current); alter(forged.historicalDeliveryV168);
    assert.throws(() => verifyOpenWorkstreamsV177(forged), /Historical V168 recovered delivery/);
  }
});

test('V177 pins the changed observation pilots without turning a script review into a capture receipt', () => {
  for (const row of current.followupV177.qaDriverChanges) {
    assert.equal(row.state, 'PILOT_SOURCE_REVIEWED_NO_RUN_RESULT_INFERRED');
    assert.equal(sha(read(row.path)), row.currentSha256, row.path);
    const changed = path => path === row.path ? Buffer.concat([read(path), Buffer.from('\nUNREVIEWED')]) : read(path);
    assert.throws(() => verifyOpenWorkstreamsV177(current, changed), /Unreviewed V177 QA pilot bytes/, row.path);
    const forged = clone(current); forged.followupV177.qaDriverChanges.find(r => r.path === row.path).state = 'NATIVE_PASSED';
    assert.throws(() => verifyOpenWorkstreamsV177(forged), undefined, row.path);
    const predecessor = clone(current);
    predecessor.followupV177.qaDriverChanges.find(r => r.path === row.path).previousSha256 = '0'.repeat(64);
    assert.throws(() => verifyOpenWorkstreamsV177(predecessor), /Unreviewed V177 QA predecessor/, row.path);
  }
});

test('the separate V177 arsenal tracker retains all source IDs, exact cells and cached counts without certifying art', () => {
  const script = String.raw`
import hashlib,json,sys,zipfile,xml.etree.ElementTree as E
from pathlib import Path
root=Path(sys.argv[1]);r=json.loads((root/'docs/arsenal/progress-v177.json').read_text());w=root/'docs/arsenal'/r['workbook']
assert hashlib.sha256(w.read_bytes()).hexdigest()==r['workbookSha256']
assert r['state']=='PREPUBLICATION' and not r['canonical1to1Approved'] and r['humanParticipants']==0
assert list(r['tables'])==['01_Armes_Source_V1','02_Recettes_Source_V1','03_Correctifs_V177','04_References_Ouvertes']
assert [len(r['tables'][k]['rows']) for k in ['01_Armes_Source_V1','02_Recettes_Source_V1','04_References_Ouvertes']]==[200,57,129]
n={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile(w) as z:
 assert z.testzip() is None
 assert not any('/externalLinks/' in p or p.endswith('vbaProject.bin') for p in z.namelist())
 book=E.fromstring(z.read('xl/workbook.xml'));names=[s.get('name') for s in book.find('m:sheets',n)]
 assert names==['00_Synthese']+list(r['tables'])
 def value(c):
  if c.get('t')=='inlineStr':return ''.join(c.find('m:is',n).itertext())
  v=c.find('m:v',n)
  if v is None:return None
  if c.get('t')=='b':return v.text=='1'
  return float(v.text)
 formulas=0;checked=0
 for index,name in enumerate(names,1):
  sheet=E.fromstring(z.read(f'xl/worksheets/sheet{index}.xml'));cells={c.get('r'):c for c in sheet.findall('.//m:c',n)}
  assert not sheet.findall('.//m:c[@t="e"]',n)
  assert value(cells['A3'])==r['workbookPublicationNoticeV164']
  formulas+=len(sheet.findall('.//m:f',n))
  if index==1:
   for item in r['indicators']:
    c=cells[item['cell']];assert '='+c.find('m:f',n).text==item['formula'];assert value(c)==item['expected']
  else:
   table=r['tables'][name]
   for row,values in enumerate([table['headers']]+table['rows'],5):
    for col,expected in enumerate(values,1):
     assert value(cells[chr(64+col)+str(row)])==expected,(name,row,col)
     checked+=1
 assert formulas==len(r['indicators'])==5
 print(json.dumps({'sheets':len(names),'formulas':formulas,'checkedCells':checked}))
`;
  const result = JSON.parse(execFileSync('python3', ['-B', '-c', script,
    fileURLToPath(new URL('../', import.meta.url))], { encoding: 'utf8' }));
  assert.deepEqual([result.sheets, result.formulas], [5, 5]);
  assert.ok(result.checkedCells > 2300);
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

test('V178 resolves only exact MainM successors while every V177 witness stays historical', () => {
  assert.deepEqual(verifyFollowupV178(current),{historicalRuntimeSources:147,runtimeSuccessors:2,
    verifierSuccessors:3,qaSuccessors:1,documentarySnapshots:3});
  const effective=resolveAuditSourcesV163(previous,read,{effective:true});
  assert.deepEqual(Object.keys(effective).filter(path=>Object.hasOwn(current.runtimeSourceSha256,path)).sort(),
    Object.keys(current.runtimeSourceSha256).sort());
  assert.deepEqual(Object.keys(effective).filter(path=>!Object.hasOwn(current.runtimeSourceSha256,path)).sort(),
    ['src/tactical-reload-v77.js','src/weapon-actions-v130.js',
      ...Object.keys(V179_RUNTIME_SUCCESSORS).filter(path=>!Object.hasOwn(current.runtimeSourceSha256,path)),
      ...Object.keys(V179_NEW_RUNTIME_SOURCES)].sort(), 'V179 sources follow rather than rewrite the147-source witness');
  assert.equal(current.runtimeSourceSha256['src/npc-interdeck-routes-v165.js'],
    '5330095a1f6d277e71e473c6b741c671fe02c4d4fc44133b3f5a37ccfebb103a');
  assert.equal(effective['src/npc-interdeck-routes-v165.js'],V178_RUNTIME_SUCCESSORS['src/npc-interdeck-routes-v165.js'].currentSha256);
  assert.equal(effective['sw.js'],reviewedDigestV179('sw.js',V178_RUNTIME_SUCCESSORS['sw.js'].currentSha256));
  assert.equal(current.candidateLocalValidationV177.testedCommit,'70adab8e66b8b2ee3fc2a731a182dd20d2a6af31');
  for(const map of [V178_RUNTIME_SUCCESSORS,V178_VERIFIER_SUCCESSORS,V178_QA_SUCCESSORS])
    for(const [path,receipt] of Object.entries(map)) {
      assert.equal(sha(read(path)),reviewedDigestV179(path,receipt.currentSha256),path);
      assert.throws(()=>reviewedLiveDigestV178(path,'0'.repeat(64)),/Incorrect MainM endpoint/);
      const changed=name=>name===path?Buffer.concat([read(name),Buffer.from('\nUNREVIEWED')]):read(name);
      assert.throws(()=>verifyAuditSuccessionV163(previous,current,changed),undefined,path);
    }
  for(const alter of [
    c=>{delete c.followupV178;},c=>{c.followupV178.runtimeChanges=[];},
    c=>{c.followupV178.verifierChanges.pop();},c=>{c.followupV178.qaChanges[0].previousSha256='0'.repeat(64);},
    c=>{c.followupV178.runtimeChanges.push({...c.followupV178.runtimeChanges[0],path:'src/unknown-v178.js'});},
    c=>{c.runtimeSourceSha256['src/npc-interdeck-routes-v165.js']=V178_RUNTIME_SUCCESSORS['src/npc-interdeck-routes-v165.js'].currentSha256;},
    c=>{c.followupV177.sourceChanges[0].reason+=' unreviewed';},
    c=>{c.tables['27_RepriseV177'].rows[0][1]='unreviewed';},
    c=>{c.candidateLocalValidationV177.testedCommit='0'.repeat(40);},
    c=>{c.followupV178.historicalV177ResultsTransferred=true;},c=>{c.followupV178.releaseEvidence.ci={status:'success'};}
  ]) {const forged=clone(current);alter(forged);assert.throws(()=>verifyFollowupV178(forged));}
});

// Append to verify-audit-continuation-v163.mjs; existing test/assert/read/sha/
// execFileSync imports are sufficient. This tests a dated documentary snapshot,
// not execution of its cited gameplay, CI, external reports or Excel engine.
test('the imported PR27 closure snapshot retains exact bytes, dated provenance and all open route/art limits', () => {
  const folder = 'docs/development/';
  const pinned = {
    'CLOTURE_EXCEL_20261101.xlsx': '2a607d9fe749056cb2099cc6776a5ccb227068186eb422b7ab6253b05a6609bd',
    'EXCEL_CLOSURE_20261101.json': '4f5aaf3a4b7e927d34fd75acc3e096314280323a27d72d368572cf63b9dca1c8',
    'EXCEL_CLOSURE_20261101.md': '284fae29f99bbf3fb23633510bfd0fb68fdb9350335db144e89b3ac6830e9f47'
  };
  for (const [name, digest] of Object.entries(pinned)) assert.equal(sha(read(folder + name)), digest, name);
  const document = JSON.parse(read(folder + 'EXCEL_CLOSURE_20261101.json'));
  const markdown = read(folder + 'EXCEL_CLOSURE_20261101.md').toString();
  const snapshot = document.integrationSnapshotV177;
  assert.equal(document.date, '2026-11-01');
  assert.equal(document.repository, 'darknigthmare/aliens-tantalus-frontier');
  assert.equal(document.baselineHead, 'ec099872d3fc59465c6d17e30b577629b462f139', 'ec099 is a cited historical baseline');
  assert.equal(snapshot.kind, 'IMPORTED_DOCUMENTARY_SNAPSHOT_NOT_CURRENT_GAMEPLAY_VALIDATION');
  assert.equal(snapshot.sourcePullRequest, 27);
  assert.equal(snapshot.sourceCommit, 'beacabe75b580233d5c205cdfa4911f19c6277f3');
  assert.equal(snapshot.mainAtImport, '5d9f28f05df732a71a17cec013aa39ebab6d4de1');
  assert.equal(snapshot.historicalClaimsRetainTheirCitedCommits, true);
  assert.equal(snapshot.currentRuntimeOrAuditReplaced, false);
  assert.deepEqual([snapshot.newApprovals1to1, snapshot.newArtClosed], [0, 0]);
  assert.equal(document.policies.noHistoricalSuccessTransferred, true);
  assert.equal(document.policies.approved1to1, 0);
  assert.deepEqual([document.continuation.artClosed, document.continuation.approved1to1], [0, 0]);
  assert.equal(document.continuation.sevenRoutesRemainPartial, true);
  assert.equal(document.continuation.noGlobalCurrentExhaustivenessClaim, true);
  assert.equal(document.rows.length, 1022);
  assert.equal(new Set(document.rows.map(row => JSON.stringify(row.slice(0, 2)))).size, 1022);
  assert.ok(document.rows.every(row => row.length === 9 && row[7] === 0 && row[8] === 0));
  const routes = document.rows.filter(row => row[0] === 'Routes PNJ');
  assert.equal(routes.length, 7);
  assert.ok(routes.every(row => row[3].startsWith('PARTIEL')));
  assert.match(markdown, /Instantané documentaire importé de la PR #27/);
  assert.match(markdown, /Cet import ne valide aucun parcours sur `main`/);
  assert.match(markdown, /pas des validations humaines ou artistiques 1:1/);
  assert.match(markdown, /ces résultats ne sont pas transférés|Ces résultats ne sont pas transférés/);
  const script = String.raw`
import base64,collections,io,json,posixpath,sys,xml.etree.ElementTree as E,zipfile
payload=json.loads(sys.stdin.read()); record=payload['document']
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile(io.BytesIO(base64.b64decode(payload['workbook']))) as archive:
 assert archive.testzip() is None
 names=archive.namelist()
 assert len(names)==len(set(names))
 assert not any('/externalLinks/' in n or n.endswith('vbaProject.bin') for n in names)
 assert all(not n.startswith('/') and '..' not in n.split('/') for n in names)
 shared=[]
 if 'xl/sharedStrings.xml' in names:
  shared=[''.join(si.itertext()) for si in E.fromstring(archive.read('xl/sharedStrings.xml')).findall('s:si',ns)]
 rels={r.get('Id'):r.get('Target') for r in E.fromstring(archive.read('xl/_rels/workbook.xml.rels'))}
 sheets={};formulas={}
 for sheet in E.fromstring(archive.read('xl/workbook.xml')).findall('s:sheets/s:sheet',ns):
  target=rels[sheet.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')]
  path=target.lstrip('/') if target.startswith('/') else posixpath.normpath('xl/'+target)
  assert path.startswith('xl/') and '..' not in path.split('/')
  cells={};fs={}
  for cell in E.fromstring(archive.read(path)).findall('.//s:c',ns):
   assert cell.get('t')!='e', (sheet.get('name'),cell.get('r'),'cached formula error')
   value=cell.find('s:v',ns);inline=cell.find('s:is',ns);formula=cell.find('s:f',ns)
   cells[cell.get('r')]=''.join(inline.itertext()) if inline is not None else shared[int(value.text)] if cell.get('t')=='s' and value is not None else value.text if value is not None else ''
   if formula is not None:fs[cell.get('r')]=formula.text
  sheets[sheet.get('name')]=cells;formulas[sheet.get('name')]=fs
 assert list(sheets)==['Clôture','Travaux ouverts','Anciennes PR','Repères Excel']
 assert formulas=={'Clôture':{'B7':'COUNTIFS(D13:D28,"CORRIGÉ ET VÉRIFIÉ")',
  'B8':"SUM('Travaux ouverts'!I6:I1027)",
  'B9':'COUNTIFS(D13:D28,"CORRECTIF VALIDÉ (LOCAL)")+COUNTIFS(D13:D28,"CORRECTIF VALIDÉ (CI)")'},
  'Travaux ouverts':{},'Anciennes PR':{},'Repères Excel':{}}
 assert [sheets['Clôture'][c] for c in ['B7','B8','B9']]==['3','0','3']
 assert 'PR27 beacabe75' in sheets['Clôture']['A3'] and 'main5d9f28f0' in sheets['Clôture']['A3']
 assert 'aucune recette transférée' in sheets['Clôture']['A3']
 compared=0
 for key,sheet,start in [('rows','Travaux ouverts',6),('actions','Clôture',13),('prRows','Anciennes PR',6),('excelRows','Repères Excel',6)]:
  for number,row in enumerate(record[key],start):
   for col,expected in enumerate(row):
    assert str(expected)==sheets[sheet].get(chr(65+col)+str(number),''),(key,number,col)
    compared+=1
 assert compared==10276
 for key,sheet in [('headers','Travaux ouverts'),('prHeaders','Anciennes PR'),('excelHeaders','Repères Excel')]:
  for col,expected in enumerate(record[key]):assert sheets[sheet][chr(65+col)+'5']==expected
 assert dict(collections.Counter(row[0] for row in record['rows']))==record['counts']
 assert dict(collections.Counter(row[0] for row in record['prRows']))=={'Tantalus':27,'Yautja':64}
 assert len(record['excelRows'])==21 and len({row[1] for row in record['excelRows']})==7
 assert len(record['workbookFiles'])==19
 actions=record['actions']
 initial=lambda rows:sum(row[3]=='CORRIGÉ ET VÉRIFIÉ' for row in rows)
 followup=lambda rows:sum(row[3] in ['CORRECTIF VALIDÉ (LOCAL)','CORRECTIF VALIDÉ (CI)'] for row in rows)
 assert initial(actions)==followup(actions)==3
 for counter,status in [(initial,'CORRIGÉ ET VÉRIFIÉ'),(followup,'CORRECTIF VALIDÉ (LOCAL)')]:
  rows=[list(row) for row in actions];idx=next(i for i,row in enumerate(rows) if row[3]==status)
  rows[idx][3]='DIAGNOSTIC EN COURS';assert counter(rows)==2
  rows[idx][3]=status;assert counter(rows)==3
 assert sum(row[8] for row in record['rows'])==0
print(json.dumps({'sheets':len(sheets),'formulas':sum(len(v) for v in formulas.values()),
 'sourceCells':compared,'records':len(record['rows']),'partialRoutes':7,'formulaErrors':0}))
`;
  const result = JSON.parse(execFileSync('python3', ['-B', '-c', script], {
    input: JSON.stringify({ document, workbook: read(folder + 'CLOTURE_EXCEL_20261101.xlsx').toString('base64') }),
    encoding: 'utf8', maxBuffer: 1024 * 1024
  }));
  assert.deepEqual(result, { sheets: 4, formulas: 3, sourceCells: 10276, records: 1022, partialRoutes: 7, formulaErrors: 0 });
});
