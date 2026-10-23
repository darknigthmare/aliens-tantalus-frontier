import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { basename, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { AUDIT_PREDECESSOR_DOCUMENTS_V161, loadAuditSuccessionV161, resolveAuditSourcesV161, verifyAuditSuccessionV161 } from './audit-succession-v161.mjs';
import { resolveAuditSourcesV160, verifyAuditSuccessionV160 } from './audit-succession-v160.mjs';
import { resolveAuditSourcesV159 } from './audit-succession-v159.mjs';
import { isPublicDistributionPathV86, isPublicDistributionTextV86 } from './verify-public-release-v86.mjs';

const prefix = 'docs/forge/xeno-trials/';
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const bytes = name => read(prefix + name);
const previous = JSON.parse(bytes('progress-v160.json'));
const current = JSON.parse(bytes('progress-v161.json'));
const sha = value => createHash('sha256').update(value).digest('hex');
const clone = value => structuredClone(value);
const workstreams = ['C161-FORGE', 'C161-CAMPAIGN', 'C161-CREW'];

test('V161 retains the68 inherited Trials tasks and189 identities without new art or1:1 approval', () => {
  assert.equal(current.lot, 'V161');
  assert.equal(current.baseCommit, 'd0a8cd77ff9a340e079b109bdd676f4a9cb4ef79');
  assert.equal(current.publicationState, 'PREPUBLICATION');
  assert.equal(current.applicationVersion, previous.applicationVersion);
  assert.equal(current.saveSchema, previous.saveSchema);
  for (const key of ['rosterIds', 'inheritedPresentationIds', 'inheritedArt153Ids', 'newWorkstreamsV160'])
    assert.deepEqual(current[key], previous[key], key);
  assert.equal(current.rosterIds.length, 189);
  assert.equal(current.inheritedPresentationIds.length + current.inheritedArt153Ids.length, 68);
  for (const name of current.inheritedTablesFromV160) assert.deepEqual(current.tables[name], previous.tables[name], name);
  for (const key of ['newPresentationMappings', 'approved1to1', 'fullArtTasksClosed', 'newOriginalSpriteFiles']) assert.equal(current[key], 0);
  assert.deepEqual(current.newWorkstreamsV161.map(s => s.id), workstreams);
  for (const stream of current.newWorkstreamsV161) {
    assert.ok(stream.modules.length && stream.verifiers.length && stream.limits.length);
    for (const path of stream.modules) assert.ok(Object.hasOwn(current.runtimeSourceSha256, path), path);
    for (const path of stream.verifiers) assert.ok(read(path).length > 0, path);
  }
  assert.deepEqual(current.tables['21_ChantiersV161'].rows.map(r => r[0]), workstreams);
  for (const row of current.tables['21_ChantiersV161'].rows) {
    assert.match(row[6], /à vérifier/i);
    assert.deepEqual(row.slice(-2), [0, 0]);
  }
});

test('the real final V160 delivery stays historical and fifteen workbook ancestors keep exact bytes', () => {
  const baseline = current.historicalDeliveryV160;
  assert.equal(baseline.status, 'MERGED_AND_INVENTORY_FINALIZED');
  assert.equal(baseline.testedHead, '3b8ebd15f1370c8a98ac3d5e6a5bf9402c4c2daa');
  assert.equal(baseline.mainMerge, current.baseCommit);
  assert.equal(baseline.canonicalSourceSha256, '572e090b0e91bd76824e97bc3aa4584f0dfa8726d4898fb1da1613f50a7c7c91');
  assert.deepEqual([baseline.nodeTests, baseline.nodeTestFiles, baseline.browserProfiles, baseline.automatedChecks, baseline.captures], [2617, 150, 4, 72, 106]);
  assert.equal(baseline.countsAreCurrentV161Results, false);
  assert.deepEqual(current.historyWorkbooks, [...previous.historyWorkbooks,
    { path: prefix + previous.workbook, sha256: previous.workbookSha256 }]);
  assert.equal(current.historyWorkbooks.length, 15);
  for (const row of current.historyWorkbooks) assert.equal(sha(read(row.path)), row.sha256, row.path);
  for (const [path, expected] of Object.entries(AUDIT_PREDECESSOR_DOCUMENTS_V161)) assert.equal(sha(read(path)), expected, path);
});

test('the complete anchored bridge validates current bytes while default historical resolver returns remain intact', () => {
  const result = verifyAuditSuccessionV161(previous, current);
  assert.equal(result.inherited, 74);
  assert.equal(result.current, Object.keys(current.runtimeSourceSha256).length);
  assert.ok(result.added > 0 && result.changed > 0);
  assert.deepEqual(loadAuditSuccessionV161().result, result);
  assert.deepEqual(resolveAuditSourcesV161(previous), current.runtimeSourceSha256);
  const v159 = JSON.parse(bytes('progress-v159.json'));
  const v158 = JSON.parse(bytes('progress-v158.json'));
  assert.deepEqual(resolveAuditSourcesV160(v159), previous.runtimeSourceSha256);
  assert.deepEqual(resolveAuditSourcesV160(v159, read, { effective: true }), current.runtimeSourceSha256);
  assert.deepEqual(resolveAuditSourcesV159(v158), v159.runtimeSourceSha256);
  assert.deepEqual(resolveAuditSourcesV159(v158, read, { effective: true }), current.runtimeSourceSha256);
  assert.equal(verifyAuditSuccessionV160(v159, previous).current, 74);
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
    c => { c.runtimeSuccession.predecessorDocuments[Object.keys(AUDIT_PREDECESSOR_DOCUMENTS_V161)[0]] = '0'.repeat(64); }
  ];
  for (const change of mutations) { const bad = clone(current);change(bad);assert.throws(() => verifyAuditSuccessionV161(previous, bad)); }
  for (const path of [...Object.keys(AUDIT_PREDECESSOR_DOCUMENTS_V161), ...Object.keys(current.runtimeSourceSha256)]) {
    const changed = p => p === path ? Buffer.concat([read(p), Buffer.from('\nUNREVIEWED')]) : read(p);
    assert.throws(() => verifyAuditSuccessionV161(previous, current, changed), path);
  }
});

test('absent successor never admits a fabricated predecessor and malformed successors never fall back', () => {
  const absent = p => { if (p === prefix + 'progress-v161.json') { const e = new Error('absent');e.code = 'ENOENT';throw e; }return read(p); };
  assert.deepEqual(resolveAuditSourcesV161(previous, absent), previous.runtimeSourceSha256);
  const bad = clone(previous);bad.runtimeSourceSha256['src/app.js'] = '0'.repeat(64);
  assert.throws(() => resolveAuditSourcesV161(bad, absent));
  for (const invalid of ['null', 'false', '0', '{}', '[]', '{']) {
    const supplied = p => p === prefix + 'progress-v161.json' ? Buffer.from(invalid) : read(p);
    assert.throws(() => resolveAuditSourcesV161(previous, supplied));
  }
});

test('current recipe cells claim no result and retained reference records remain historical', () => {
  assert.deepEqual(current.referencesDocument, previous.referencesDocument);
  assert.deepEqual(current.historicalDeliveryV159, previous.historicalDeliveryV159);
  assert.ok(current.limitations.some(text => /cloud/i.test(text)));
  assert.ok(current.limitations.some(text => /185/.test(text)));
  for (const row of current.tables['07_Recette'].rows) {
    assert.match(row[2], /à exécuter|à vérifier|prépublication/i);
    assert.doesNotMatch(row[2], /réussi|passed|succès|verte/i);
  }
  assert.equal(current.newExternalSourcesRetrieved, 0);
});

test('the workbook has exact recorded cells cached formulas and no error cells or external executable content', () => {
  const result = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL('./verify-audit-workbook-v161.py', import.meta.url)),
    fileURLToPath(new URL('../' + prefix, import.meta.url))], { encoding: 'utf8' }));
  assert.equal(result.ok, true);
  assert.equal(result.sheets, Object.keys(current.tables).length + 1);
  assert.equal(result.formulaErrors, 0);
});

test('deterministic workbook rebuild leaves historical sources and reviewed runtime pins unchanged', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'atf-audit-v161-'));
  try {
    const doc = join(temporary, 'progress-v161.json');
    copyFileSync(fileURLToPath(new URL('../' + prefix + 'progress-v161.json', import.meta.url)), doc);
    for (const entry of current.historyWorkbooks) copyFileSync(fileURLToPath(new URL('../' + entry.path, import.meta.url)), join(temporary, basename(entry.path)));
    for (let i = 0; i < 2; i++) {
      const generated = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL('./generate-audit-continuation-v161.py', import.meta.url)), temporary], { encoding: 'utf8' }));
      assert.equal(generated.sha256, current.workbookSha256);
      assert.deepEqual(readFileSync(join(temporary, current.workbook)), bytes(current.workbook));
      assert.deepEqual(JSON.parse(readFileSync(doc)), current);
      for (const entry of current.historyWorkbooks) assert.equal(sha(readFileSync(join(temporary, basename(entry.path)))), entry.sha256);
    }
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});

test('only the three reviewed V161 documents are admitted and none enters the playable package', () => {
  const names = ['progress-v161.json', 'V161-REMAINING-WORKSTREAMS.md', current.workbook];
  for (const name of names) {
    assert.equal(isPublicDistributionPathV86(prefix + name), true, name);
    assert.equal(isPublicDistributionPathV86(prefix + name, { built: true }), false, name);
  }
  for (const name of names.filter(n => !n.endsWith('.xlsx'))) {
    const text = bytes(name).toString('utf8');
    assert.doesNotMatch(text, /\/workspace\/|\/home\/|\/Users\//);
    assert.equal(isPublicDistributionTextV86(text), true);
  }
  assert.equal(isPublicDistributionPathV86(prefix + 'unreviewed-v161.xlsx'), false);
  assert.deepEqual(readdirSync(new URL('../' + prefix, import.meta.url)).filter(n => /v161/i.test(n)).sort(), names.sort());
});
