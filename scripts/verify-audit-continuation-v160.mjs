import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { basename, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { AUDIT_PREDECESSOR_DOCUMENTS_V160, loadAuditSuccessionV160, resolveAuditSourcesV160, verifyAuditSuccessionV160 } from './audit-succession-v160.mjs';
import { resolveAuditSourcesV159, verifyAuditSuccessionV159 } from './audit-succession-v159.mjs';
import { verifyAuditSuccessionV158 } from './audit-succession-v158.mjs';
import { verifyAuditSuccessionV157 } from './audit-succession-v157.mjs';
import { isPublicDistributionPathV86, isPublicDistributionTextV86 } from './verify-public-release-v86.mjs';

const prefix = 'docs/forge/xeno-trials/';
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const bytes = name => read(prefix + name);
const previous = JSON.parse(bytes('progress-v159.json'));
const current = JSON.parse(bytes('progress-v160.json'));
const references = JSON.parse(bytes('references-v160.json'));
const sha = value => createHash('sha256').update(value).digest('hex');
const clone = value => structuredClone(value);
const workstreams = ['C160-PLAYER', 'C160-TRACKER', 'C160-WEAPONS', 'C160-CAMPAIGN'];

test('the68 inherited Trials tasks and four explicit user workstreams have distinct exact identities', () => {
  assert.equal(current.lot, 'V160');
  assert.equal(current.baseCommit, '4fc9da82832003939028e14f83ed8731638250da');
  assert.equal(current.publicationState, 'PREPUBLICATION');
  assert.equal(current.applicationVersion, previous.applicationVersion);
  assert.equal(current.saveSchema, previous.saveSchema);
  assert.deepEqual(current.rosterIds, previous.rosterIds);
  assert.equal(current.rosterIds.length, 189);
  assert.deepEqual(current.inheritedPresentationIds, previous.inheritedPresentationIds);
  assert.deepEqual(current.inheritedArt153Ids, previous.inheritedArt153Ids);
  assert.equal(current.inheritedPresentationIds.length + current.inheritedArt153Ids.length, 68);
  assert.deepEqual(current.newWorkstreamsV160.map(s => s.id), workstreams);
  assert.equal(new Set(current.newWorkstreamsV160.map(s => s.id)).size, 4);
  assert.ok(current.newWorkstreamsV160.every(s => s.modules.length && s.verifiers.length));
  for (const stream of current.newWorkstreamsV160) for (const path of stream.modules)
    assert.ok(Object.hasOwn(current.runtimeSourceSha256, path), 'Workstream source omitted from current pins: ' + path);
  for (const name of readdirSync(new URL('../src/', import.meta.url)).filter(name => /-v160\.js$/.test(name)))
    assert.ok(Object.hasOwn(current.runtimeSourceSha256, 'src/' + name), 'V160 runtime source omitted from current pins: ' + name);
  for (const name of current.inheritedTablesFromV159) assert.deepEqual(current.tables[name], previous.tables[name], name);
  assert.deepEqual(current.tables['18_ChantiersV160'].rows.map(r => r[0]), workstreams);
  assert.ok(current.tables['18_ChantiersV160'].rows.every(r => r[1] === 'Demande utilisateur explicite V160' && r[11] === 0 && r[12] === 0));
  for (const key of ['newPresentationMappings', 'approved1to1', 'fullArtTasksClosed', 'newOriginalSpriteFiles']) assert.equal(current[key], 0);
});

test('the actual final V159 delivery stays historical and is never counted as current V160 validation', () => {
  const baseline = current.historicalDeliveryV159;
  assert.equal(baseline.status, 'MERGED_AND_INVENTORY_FINALIZED');
  assert.equal(baseline.testedHead, '0327f8538972c138e3e6152bef445484ab2d1170');
  assert.equal(baseline.mainMerge, current.baseCommit);
  assert.equal(baseline.canonicalSourceSha256, 'e34fbb112248e8a35052c06b6d808a22e92dc18a6199562bf61e416cfd3f7343');
  assert.equal(baseline.workbookSha256, 'b0a13048fa186936493f65849d61dcca0ea69f89c5a77429a669eede88feb949');
  assert.deepEqual([baseline.nodeTests, baseline.nodeTestFiles, baseline.browserProfiles, baseline.automatedChecks, baseline.captures], [2508, 145, 4, 85, 44]);
  assert.deepEqual([baseline.tasks, baseline.priorities, baseline.sourceSnapshots], [68, 17, 89]);
  assert.equal(baseline.countsAreCurrentV160Results, false);
  assert.equal(baseline.notAHumanPlaytest, true);
  assert.deepEqual(current.historicalDeliveryV158, previous.historicalDeliveryV158);
});

test('fourteen historical workbooks and all four V159 documentary sources retain exact bytes', () => {
  assert.deepEqual(current.historyWorkbooks, [...previous.historyWorkbooks,
    { path: prefix + previous.workbook, sha256: previous.workbookSha256 }]);
  assert.equal(current.historyWorkbooks.length, 14);
  for (const row of current.historyWorkbooks) assert.equal(sha(read(row.path)), row.sha256, row.path);
  for (const [path, expected] of Object.entries(AUDIT_PREDECESSOR_DOCUMENTS_V160)) assert.equal(sha(read(path)), expected, path);
});

test('all current runtime bytes pass the exhaustive V160 succession while historical resolver returns stay intact', () => {
  const result = verifyAuditSuccessionV160(previous, current);
  assert.equal(result.inherited, 48);
  assert.equal(result.current, Object.keys(current.runtimeSourceSha256).length);
  assert.ok(result.added > 0 && result.changed > 0);
  assert.deepEqual(loadAuditSuccessionV160().result, result);
  assert.deepEqual(resolveAuditSourcesV160(previous), current.runtimeSourceSha256);
  const v158 = JSON.parse(bytes('progress-v158.json'));
  const v157 = JSON.parse(bytes('progress-v157.json'));
  const v156 = JSON.parse(bytes('progress-v156.json'));
  assert.deepEqual(resolveAuditSourcesV159(v158), previous.runtimeSourceSha256);
  assert.deepEqual(resolveAuditSourcesV159(v158, read, { effective: true }), current.runtimeSourceSha256);
  assert.equal(verifyAuditSuccessionV159(v158, previous).current, 48);
  assert.equal(verifyAuditSuccessionV158(v157, v158).current, 46);
  assert.equal(verifyAuditSuccessionV157(v156, v157).current, 31);
  assert.deepEqual(current.tables['11_Succession'].rows,
    [...current.runtimeSuccession.transitions, ...current.runtimeSuccession.addedSources]
      .map(r => [r.path, r.previousSha256 ?? 'Non épinglé en V159', r.currentSha256, r.reason, r.verifiers.join(' ; ')]));
});

test('missing, duplicated or dishonest new transitions and an altered historical contract cannot be admitted', () => {
  const first = current.runtimeSuccession.transitions[0];
  assert.ok(first);
  const badPrevious = clone(previous);badPrevious.runtimeSourceSha256[first.path] = '0'.repeat(64);
  assert.throws(() => verifyAuditSuccessionV160(badPrevious, current));
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
    c => { c.runtimeSuccession.predecessorDocuments[Object.keys(AUDIT_PREDECESSOR_DOCUMENTS_V160)[0]] = '0'.repeat(64); }
  ];
  for (const change of mutations) { const bad = clone(current);change(bad);assert.throws(() => verifyAuditSuccessionV160(previous, bad)); }
});

test('an absent V160 never permits fabricated V159 and invalid successor content never falls back silently', () => {
  const absent = p => { if (p === prefix + 'progress-v160.json') { const e = new Error('absent');e.code = 'ENOENT';throw e; }return read(p); };
  assert.deepEqual(resolveAuditSourcesV160(previous, absent), previous.runtimeSourceSha256);
  const bad = clone(previous);bad.runtimeSourceSha256['src/app.js'] = '0'.repeat(64);
  assert.throws(() => resolveAuditSourcesV160(bad, absent));
  for (const invalid of ['null', 'false', '0', '{}', '[]']) {
    const supplied = p => p === prefix + 'progress-v160.json' ? Buffer.from(invalid) : read(p);
    assert.throws(() => resolveAuditSourcesV160(previous, supplied));
  }
  for (const path of [...Object.keys(AUDIT_PREDECESSOR_DOCUMENTS_V160), ...Object.keys(current.runtimeSourceSha256)]) {
    const changed = p => p === path ? Buffer.concat([read(p), Buffer.from('\nUNREVIEWED')]) : read(p);
    assert.throws(() => verifyAuditSuccessionV160(previous, current, changed), path);
  }
});

test('references distinguish the one new official Isolation illustration, historical sources and unavailable exact models', () => {
  assert.equal(references.schema, 160);
  assert.equal(references.sourceRows.length, 10);
  assert.equal(references.newOfficialImagesRetrievedAndViewed, 1);
  assert.equal(references.exactHumanMotionReferences, 0);
  assert.equal(references.genericHumanMocapReferences, 1);
  assert.equal(references.franchiseSpecificHumanMotionReferences, 0);
  assert.equal(references.exactM314References, 0);
  assert.equal(references.artClosuresAdded, 0);
  assert.equal(references.approved1to1Added, 0);
  assert.deepEqual(references.historicalReferencesV159, previous.referencesDocument);
  const byId = Object.fromEntries(references.sourceRows.map(r => [r.id, r]));
  assert.equal(new Set(references.sourceRows.map(r => r.id)).size, 10);
  assert.equal(byId['V160-REF-002'].url, 'https://www.feralinteractive.com/en/manuals/alienisolation/latest/steam/motion_tracker.jpg');
  assert.equal(byId['V160-REF-002'].sha256, 'ac5ef11291d013636ee8bac24b110197eea155f7cda732ff3bfccfd348f57b07');
  assert.equal(byId['V160-REF-002'].httpStatus, 200);
  assert.equal(byId['V160-REF-002'].actuallyVisuallyInspected, true);
  assert.equal(byId['V160-REF-002'].reuseLicenceEstablished, false);
  assert.equal(byId['V160-REF-003'].httpStatus, 402);
  for (const id of ['V160-REF-003', 'V160-REF-008', 'V160-REF-009']) assert.deepEqual(byId[id].proves, []);
  assert.equal(byId['V160-REF-009'].networkAttempted, false);
  assert.equal(byId['V160-REF-010'].frames, 344);
  assert.equal(byId['V160-REF-010'].motionFrames, 343);
  assert.equal(byId['V160-REF-010'].calibrationFrameExcluded, 0);
  assert.equal(byId['V160-REF-010'].sha256, 'cf56db43157acc3d200b3d4215523f54d354a8926bea67e1f6c8031bd335ba7e');
  for (const row of references.sourceRows) {
    assert.equal(row.canonical1to1Approved, false);
    assert.ok(row.domains.length && row.domains.every(id => workstreams.includes(id)));
    assert.ok(row.doesNotProve.length > 0);
    if (row.sha256) assert.match(row.sha256, /^[a-f0-9]{64}$/);
    for (const [path, expected] of Object.entries(row.baselineSha256 || {})) assert.equal(sha(read(path)), expected, path);
  }
  assert.equal(sha(bytes('references-v160.json')), current.referencesDocument.sha256);
  assert.deepEqual(current.historicalReferencesDocumentV159, previous.referencesDocument);
});

test('four comparison protocols specify measurable geometry and causality without claiming executed QA or canon', () => {
  const protocols = references.comparisonProtocols;
  assert.deepEqual(Object.keys(protocols), workstreams);
  assert.deepEqual(current.tables['20_ComparaisonsV160'].rows.map(r => r[1]), workstreams);
  for (const id of workstreams) {
    assert.ok(protocols[id].capturePairs.length >= 2);
    assert.ok(protocols[id].metrics.length >= 3);
    assert.ok(protocols[id].passConditions.length >= 1);
  }
  for (const row of current.tables['07_Recette'].rows) {
    assert.match(row[2], /à exécuter|à vérifier|prépublication/i);
    assert.doesNotMatch(row[2], /réussi|passed|succès|verte/i);
  }
  for (const row of current.tables['18_ChantiersV160'].rows) assert.match(row[9], /à vérifier/i);
  assert.ok(current.tables['20_ComparaisonsV160'].rows.every(r => r[6] === 0 && /à vérifier/i.test(r[5])));
});

test('all current table identities, source cells and twenty actual formulas remain explicit and unique', () => {
  assert.equal(Object.keys(current.tables).length, 20);
  for (const [name, table] of Object.entries(current.tables)) {
    assert.ok(table.rows.length > 0 && table.headers.length > 0, name);
    assert.equal(new Set(table.headers).size, table.headers.length, name);
    assert.equal(new Set(table.rows.map(r => r[0])).size, table.rows.length, name);
    for (const row of table.rows) assert.equal(row.length, table.headers.length, name);
  }
  assert.equal(sha(bytes(current.workbook)), current.workbookSha256);
  const measured = JSON.parse(execFileSync('python3', [fileURLToPath(new URL('./verify-audit-workbook-v160.py', import.meta.url)), fileURLToPath(new URL('../' + prefix, import.meta.url))], { encoding: 'utf8', env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } }));
  assert.equal(measured.ok, true);
  assert.equal(measured.sheets, 21);
  assert.equal(measured.tables, 20);
  assert.equal(measured.formulas, 20);
  assert.equal(measured.formulaErrors, 0);
  assert.ok(measured.sourceCells > 7000);
});

test('the shared deterministic workbook engine writes only V160 and leaves all historical sources intact', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'atf-audit-v160-'));
  try {
    const doc = join(temporary, 'progress-v160.json');
    copyFileSync(fileURLToPath(new URL('../' + prefix + 'progress-v160.json', import.meta.url)), doc);
    for (const entry of current.historyWorkbooks) copyFileSync(fileURLToPath(new URL('../' + entry.path, import.meta.url)), join(temporary, basename(entry.path)));
    for (let i = 0; i < 2; i++) {
      const generated = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL('./generate-audit-continuation-v160.py', import.meta.url)), temporary], { encoding: 'utf8' }));
      assert.equal(generated.sha256, current.workbookSha256);
      assert.deepEqual(readFileSync(join(temporary, current.workbook)), bytes(current.workbook));
      assert.deepEqual(JSON.parse(readFileSync(doc)), current);
      for (const entry of current.historyWorkbooks) assert.equal(sha(readFileSync(join(temporary, basename(entry.path)))), entry.sha256);
    }
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});

test('only four reviewed documentary files are admitted, none ships in the playable distribution', () => {
  const names = ['progress-v160.json', 'references-v160.json', 'V160-PLAYER-TRACKER-CAMPAIGN.md', current.workbook];
  for (const name of names) {
    assert.equal(isPublicDistributionPathV86(prefix + name), true, name);
    assert.equal(isPublicDistributionPathV86(prefix + name, { built: true }), false, name);
  }
  for (const name of names.filter(n => !n.endsWith('.xlsx'))) {
    const text = bytes(name).toString('utf8');
    assert.doesNotMatch(text, /\/workspace\/|\/home\/|\/Users\//);
    assert.equal(isPublicDistributionTextV86(text), true);
  }
  assert.equal(isPublicDistributionPathV86(prefix + 'unreviewed-v160.xlsx'), false);
  assert.deepEqual(readdirSync(new URL('../' + prefix, import.meta.url)).filter(n => /v160/i.test(n)).sort(), names.sort());
});
