import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { basename, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { AUDIT_DEFERRED_FORGE_SOURCES_V162, AUDIT_PREDECESSOR_DOCUMENTS_V162, loadAuditSuccessionV162, resolveAuditSourcesV162, verifyAuditSuccessionV162 } from './audit-succession-v162.mjs';
import { resolveAuditSourcesV161, verifyAuditSuccessionV161 } from './audit-succession-v161.mjs';
import { resolveAuditSourcesV159 } from './audit-succession-v159.mjs';
import { isPublicDistributionPathV86, isPublicDistributionTextV86 } from './verify-public-release-v86.mjs';

const prefix = 'docs/forge/xeno-trials/';
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const bytes = name => read(prefix + name);
const previous = JSON.parse(bytes('progress-v161.json'));
const current = JSON.parse(bytes('progress-v162.json'));
const sha = value => createHash('sha256').update(value).digest('hex');
const clone = value => structuredClone(value);
const workstreams = ['C162-HARPOON', 'C162-AUDIO', 'C162-CREW', 'C162-APC'];

test('V162 retains the68 inherited Trials tasks and189 identities without new art or1:1 approval', () => {
  assert.equal(current.lot, 'V162');
  assert.equal(current.baseCommit, '4c81e847a13507d33d18a6509af4a77014c84b88');
  assert.equal(current.publicationState, 'PREPUBLICATION');
  assert.equal(current.applicationVersion, previous.applicationVersion);
  assert.equal(current.saveSchema, previous.saveSchema);
  for (const key of ['rosterIds', 'inheritedPresentationIds', 'inheritedArt153Ids', 'newWorkstreamsV161'])
    assert.deepEqual(current[key], previous[key], key);
  assert.equal(current.rosterIds.length, 189);
  assert.equal(current.inheritedPresentationIds.length + current.inheritedArt153Ids.length, 68);
  for (const name of current.inheritedTablesFromV161) assert.deepEqual(current.tables[name], previous.tables[name], name);
  for (const key of ['newPresentationMappings', 'approved1to1', 'fullArtTasksClosed', 'newOriginalSpriteFiles']) assert.equal(current[key], 0);
  assert.deepEqual(current.newWorkstreamsV162.map(s => s.id), workstreams);
  for (const stream of current.newWorkstreamsV162) {
    assert.ok((stream.modules.length || stream.qaDrivers.length) && stream.limits.length);
    for (const path of stream.qaDrivers) assert.ok(read(path).length > 0, path);
    for (const path of stream.modules) assert.ok(Object.hasOwn(current.runtimeSourceSha256, path), path);
    for (const path of stream.verifiers) assert.ok(read(path).length > 0, path);
  }
  assert.deepEqual(current.tables['22_ChantiersV162'].rows.map(r => r[0]), workstreams);
  for (const row of current.tables['22_ChantiersV162'].rows) {
    assert.match(row[6], /à vérifier/i);
    assert.deepEqual(row.slice(-2), [0, 0]);
  }
});

test('the real final V161 delivery stays historical and sixteen workbook ancestors keep exact bytes', () => {
  const baseline = current.historicalDeliveryV161;
  assert.equal(baseline.status, 'MERGED_AND_INVENTORY_FINALIZED');
  assert.equal(baseline.testedHead, '27a5f4f848da7dd0e422e67baf394d71fc2c6391');
  assert.equal(baseline.mainMerge, current.baseCommit);
  assert.equal(baseline.canonicalSourceSha256, 'b06608e4a44cf4a84890128563b517106840f976511254c8099f9ed913c880d3');
  assert.deepEqual([baseline.nodeTests, baseline.nodeTestFiles, baseline.browserProfiles, baseline.automatedChecks, baseline.captures], [2657, 154, 7, 149, 105]);
  assert.equal(baseline.countsAreCurrentV162Results, false);
  assert.deepEqual(current.historyWorkbooks, [...previous.historyWorkbooks,
    { path: prefix + previous.workbook, sha256: previous.workbookSha256 }]);
  assert.equal(current.historyWorkbooks.length, 16);
  for (const row of current.historyWorkbooks) assert.equal(sha(read(row.path)), row.sha256, row.path);
  for (const [path, expected] of Object.entries(AUDIT_PREDECESSOR_DOCUMENTS_V162)) assert.equal(sha(read(path)), expected, path);
});

test('the complete anchored bridge validates current bytes while default historical resolver returns remain intact', () => {
  const result = verifyAuditSuccessionV162(previous, current);
  assert.equal(result.inherited, 82);
  assert.equal(result.current, Object.keys(current.runtimeSourceSha256).length);
  assert.ok(result.added > 0 && result.changed > 0);
  assert.deepEqual(loadAuditSuccessionV162().result, result);
  assert.deepEqual(resolveAuditSourcesV162(previous), current.runtimeSourceSha256);
  const v160 = JSON.parse(bytes('progress-v160.json'));
  const v159 = JSON.parse(bytes('progress-v159.json'));
  const v158 = JSON.parse(bytes('progress-v158.json'));
  assert.deepEqual(resolveAuditSourcesV161(v160), previous.runtimeSourceSha256);
  assert.deepEqual(resolveAuditSourcesV161(v160, read, { effective: true }), resolveAuditSourcesV162(previous, read, { effective: true }));
  assert.deepEqual(resolveAuditSourcesV159(v158), v159.runtimeSourceSha256);
  assert.deepEqual(resolveAuditSourcesV159(v158, read, { effective: true }), resolveAuditSourcesV162(previous, read, { effective: true }));
  assert.equal(verifyAuditSuccessionV161(v160, previous).current, 82);
});

test('missing duplicate unsafe unverified and fabricated source transitions are refused', () => {
  const first = current.runtimeSuccession.transitions[0];
  assert.ok(first);
  const mutations = [
    c => c.runtimeSuccession.transitions.shift(),
    c => c.runtimeSuccession.transitions.push(clone(first)),
    c => { c.runtimeSuccession.transitions[0].previousSha256 = '0'.repeat(64); },
    c => { c.runtimeSuccession.transitions[0].currentSha256 = '0'.repeat(64); },
    c => { c.runtimeSuccession.transitions[0].verifiers = []; },
    c => { c.runtimeSuccession.transitions[0].reason = 'fix'; },
    c => { delete c.runtimeSourceSha256[first.path]; },
    c => c.runtimeSuccession.addedSources.pop(),
    c => { c.runtimeSourceSha256['../unsafe.js'] = '0'.repeat(64); },
    c => { c.runtimeSuccession.predecessorDocuments[Object.keys(AUDIT_PREDECESSOR_DOCUMENTS_V162)[0]] = '0'.repeat(64); }
  ];
  for (const change of mutations) { const bad = clone(current);change(bad);assert.throws(() => verifyAuditSuccessionV162(previous, bad)); }
  for (const path of [...Object.keys(AUDIT_PREDECESSOR_DOCUMENTS_V162), ...Object.keys(current.runtimeSourceSha256)]) {
    const changed = p => p === path ? Buffer.concat([read(p), Buffer.from('\nUNREVIEWED')]) : read(p);
    assert.throws(() => verifyAuditSuccessionV162(previous, current, changed), path);
  }
});

test('absent successor never admits a fabricated predecessor and malformed successors never fall back', () => {
  const absent = p => { if (p === prefix + 'progress-v162.json') { const e = new Error('absent');e.code = 'ENOENT';throw e; }return read(p); };
  assert.deepEqual(resolveAuditSourcesV162(previous, absent), previous.runtimeSourceSha256);
  const bad = clone(previous);bad.runtimeSourceSha256['src/app.js'] = '0'.repeat(64);
  assert.throws(() => resolveAuditSourcesV162(bad, absent));
  for (const invalid of ['null', 'false', '0', '{}', '[]', '{']) {
    const supplied = p => p === prefix + 'progress-v162.json' ? Buffer.from(invalid) : read(p);
    assert.throws(() => resolveAuditSourcesV162(previous, supplied));
  }
});

test('Forge is explicitly deferred and every one of its32 native modules remains byte-identical', () => {
  assert.equal(current.deferredForge.state, 'DEFERRED_BY_USER');
  assert.equal(current.deferredForge.baselineCommit, current.baseCommit);
  assert.equal(current.deferredForge.newForgeRuntime, 0);
  assert.equal(Object.keys(AUDIT_DEFERRED_FORGE_SOURCES_V162).length, 32);
  assert.deepEqual(current.deferredForge.sourceSha256, AUDIT_DEFERRED_FORGE_SOURCES_V162);
  assert.deepEqual(readdirSync(new URL('../src/', import.meta.url)).filter(name => name.startsWith('forge')).sort(),
    Object.keys(AUDIT_DEFERRED_FORGE_SOURCES_V162).map(path => basename(path)).sort());
  for (const [path, expected] of Object.entries(AUDIT_DEFERRED_FORGE_SOURCES_V162)) {
    assert.equal(sha(read(path)), expected, path);
    const modified = p => p === path ? Buffer.concat([read(p), Buffer.from('\nUNAUTHORIZED')]) : read(p);
    assert.throws(() => verifyAuditSuccessionV162(previous, current, modified), path);
  }
  for (const path of [...current.runtimeSuccession.transitions, ...current.runtimeSuccession.addedSources].map(row => row.path))
    assert.ok(!path.startsWith('src/forge'), path);
  const bad = clone(current);bad.deferredForge.state = 'DONE';
  assert.throws(() => verifyAuditSuccessionV162(previous, bad));
});

test('current recipe cells claim no result and retained reference records remain historical', () => {
  assert.deepEqual(current.referencesDocument, previous.referencesDocument);
  assert.deepEqual(current.historicalDeliveryV160, previous.historicalDeliveryV160);
  assert.ok(current.limitations.some(text => /DEFERRED_BY_USER/.test(text)));
  assert.ok(current.limitations.some(text => /185/.test(text)));
  for (const row of current.tables['07_Recette'].rows) {
    assert.match(row[2], /à exécuter|à vérifier|prépublication/i);
    assert.doesNotMatch(row[2], /réussi|passed|succès|verte/i);
  }
  assert.equal(current.newExternalSourcesRetrieved, 0);
});

test('the workbook has exact recorded cells cached formulas and no error cells or external executable content', () => {
  const result = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL('./verify-audit-workbook-v162.py', import.meta.url)),
    fileURLToPath(new URL('../' + prefix, import.meta.url))], { encoding: 'utf8' }));
  assert.equal(result.ok, true);
  assert.equal(result.sheets, Object.keys(current.tables).length + 1);
  assert.equal(result.formulaErrors, 0);
});

test('deterministic workbook rebuild leaves historical sources and reviewed runtime pins unchanged', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'atf-audit-v162-'));
  try {
    const doc = join(temporary, 'progress-v162.json');
    copyFileSync(fileURLToPath(new URL('../' + prefix + 'progress-v162.json', import.meta.url)), doc);
    for (const entry of current.historyWorkbooks) copyFileSync(fileURLToPath(new URL('../' + entry.path, import.meta.url)), join(temporary, basename(entry.path)));
    for (let i = 0; i < 2; i++) {
      const generated = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL('./generate-audit-continuation-v162.py', import.meta.url)), temporary], { encoding: 'utf8' }));
      assert.equal(generated.sha256, current.workbookSha256);
      assert.deepEqual(readFileSync(join(temporary, current.workbook)), bytes(current.workbook));
      assert.deepEqual(JSON.parse(readFileSync(doc)), current);
      for (const entry of current.historyWorkbooks) assert.equal(sha(readFileSync(join(temporary, basename(entry.path)))), entry.sha256);
    }
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});

test('only the three reviewed V162 documents are admitted and none enters the playable package', () => {
  const names = ['progress-v162.json', 'V162-NON-FORGE-CONTINUATION.md', current.workbook];
  for (const name of names) {
    assert.equal(isPublicDistributionPathV86(prefix + name), true, name);
    assert.equal(isPublicDistributionPathV86(prefix + name, { built: true }), false, name);
  }
  for (const name of names.filter(n => !n.endsWith('.xlsx'))) {
    const text = bytes(name).toString('utf8');
    assert.doesNotMatch(text, /\/workspace\/|\/home\/|\/Users\//);
    assert.equal(isPublicDistributionTextV86(text), true);
  }
  assert.equal(isPublicDistributionPathV86(prefix + 'unreviewed-v162.xlsx'), false);
  assert.deepEqual(readdirSync(new URL('../' + prefix, import.meta.url)).filter(n => /v162/i.test(n)).sort(), names.sort());
});
