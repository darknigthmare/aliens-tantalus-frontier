import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { AUDIT_PREDECESSOR_DOCUMENTS_V159, verifyAuditSuccessionV159, resolveAuditSourcesV159 } from './audit-succession-v159.mjs';
import { verifyAuditSuccessionV158 } from './audit-succession-v158.mjs';
import { verifyAuditSuccessionV157 } from './audit-succession-v157.mjs';
import { isPublicDistributionPathV86, isPublicDistributionTextV86 } from './verify-public-release-v86.mjs';
import { HUB_NPC_ANNEX_CIRCULATION_V159 as circulation } from '../src/npc-annex-circulation-v159.js';
import { getHubRoomProjectionV139 } from '../src/hub-room-projection-v139.js';
import { XENO_TRIALS_FIGHTERS_V96 as roster } from '../src/xeno-trials-data-v96.js';

const prefix = 'docs/forge/xeno-trials/';
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const bytes = name => read(prefix + name);
const current = JSON.parse(bytes('progress-v159.json'));
const previous = JSON.parse(bytes('progress-v158.json'));
const previous157 = JSON.parse(bytes('progress-v157.json'));
const previous156 = JSON.parse(bytes('progress-v156.json'));
const references = JSON.parse(bytes('references-v159.json'));
const sha = value => createHash('sha256').update(value).digest('hex');
// Sanitized bibliography reviewed against the frozen 15-content supplement.
const referenceRecordSha256 = 'c01452cecc0ad6b4165e194ba9c69811eca6b281a2e6307b29f436181ed04a71';
const clone = value => JSON.parse(JSON.stringify(value));
const ids = table => table.rows.map(row => row[0]);
const expectedTables = ['01_Presentations', '02_ART153', '03_Sequences', '04_Annexes', '05_Forge',
  '06_Sources', '07_Recette', '08_Roster', '09_AutresAudits', '10_Operations', '11_Succession',
  '12_TrialsSortie', '13_Preuve1to1', '14_References', '15_LotsV159', '16_SourcesV159', '17_LiensV159'];

// New assertions are about provenance, scope and succession, not artistic approval.
test('V159 preserves the exact 68 inherited tasks and 189 identities without artistic closure', () => {
  assert.equal(current.lot, 'V159');
  assert.equal(current.publicationState, 'PREPUBLICATION');
  assert.equal(current.baseCommit, 'f4c943a66e85153d9bf989c24d2fda0b5fe91897');
  assert.equal(current.applicationVersion, previous.applicationVersion);
  assert.equal(current.saveSchema, previous.saveSchema);
  for (const key of ['approved1to1', 'fullArtTasksClosed', 'newPresentationMappings', 'newOriginalSpriteFiles']) assert.equal(current[key], 0);
  assert.deepEqual(current.rosterIds, previous.rosterIds);
  assert.deepEqual(current.rosterIds, roster.map(row => row.id));
  assert.equal(current.rosterIds.length, 189);
  assert.deepEqual(current.inheritedPresentationIds, previous.inheritedPresentationIds);
  assert.deepEqual(current.inheritedArt153Ids, previous.inheritedArt153Ids);
  assert.equal(current.inheritedPresentationIds.length + current.inheritedArt153Ids.length, 68);
  for (const name of ['01_Presentations', '02_ART153', '03_Sequences', '05_Forge', '08_Roster',
    '10_Operations', '12_TrialsSortie', '13_Preuve1to1', '14_References']) assert.deepEqual(current.tables[name], previous.tables[name], name);
});

test('the actual final V158 delivery is a historical baseline, never a V159 recipe result', () => {
  const baseline = current.historicalDeliveryV158;
  assert.equal(baseline.status, 'MERGED_AND_INVENTORY_FINALIZED');
  assert.equal(baseline.testedHead, '66f0f5f7bc1e7d07a683e2cff9d95406f842af23');
  assert.equal(baseline.mainMerge, current.baseCommit);
  assert.notEqual(baseline.mainMerge, baseline.testedHead);
  assert.equal(baseline.canonicalSourceSha256, 'ea7165b79a8d545682f2ec288e62c6567dea13fa2fcf613e4c2b4decfb4ad32d');
  assert.equal(baseline.workbookSha256, 'aa7c0bff8c693722ff76762e16fb7c2df5337f1fbdd224194ca17b126c39e4b2');
  assert.deepEqual([baseline.tasks, baseline.priorities, baseline.sourceSnapshots], [68, 17, 85]);
  assert.deepEqual([baseline.nodeTests, baseline.nodeTestFiles, baseline.browserProfiles,
    baseline.automatedChecks, baseline.captures], [2467, 143, 18, 553, 269]);
  assert.equal(baseline.countsAreCurrentV159Results, false);
  assert.equal(baseline.notAHumanPlaytest, true);
});

test('BISHOP has one bounded native parent-annex circuit and a separately normalized save field', () => {
  const contract = current.runtimeContracts.annexCirculation;
  assert.deepEqual(contract.configuration, circulation);
  assert.equal(circulation.crewId, 'crew-05-bishop-9');
  assert.equal(circulation.deck, 1);
  assert.equal(circulation.parentRoomId, 'science-lab');
  assert.equal(circulation.annexRoomId, 'synthetic-bay');
  assert.equal(circulation.crossingPolicy, 'paired-airlock-covered-coordinate-handoff');
  assert.equal(contract.stateField, 'npcAnnexCirculationV159');
  assert.equal(contract.continuousRoutesAdded, 1);
  assert.equal(contract.sourceAndDestinationActorSameIdentity, true);
  assert.equal(contract.coordinateHandoffOnlyBehindFullyCoveringLeaf, true);
  assert.equal(contract.arrivalUsesNativePairedDoorProjection, true);
  assert.equal(contract.historicalInitialAdoptionIsWalkedJourneyProof, false);
  assert.deepEqual(contract.nativeHandoff, { owner: 'native-v62-routine', observedTravel: false,
    continuousTravelProof: false, fields: ['crewId', 'fromRoomId', 'toRoomId', 'reason', 'observedTravel', 'owner'] });
  for (const field of ['newCrewIdentities']) assert.equal(contract[field], 0);
  for (const field of ['sourceArtChanged', 'newBackViewSprites', 'quarantineTransit', 'otherAnnexRoutes',
    'interDeckWalking', 'liftTransit']) assert.equal(contract[field], false);
  assert.deepEqual(contract.priorityInterruptions,
    ['active-crisis', 'infestation', 'mission-assignment', 'medical-recovery', 'unavailable']);
  assert.equal(contract.recipeState, 'PENDING_CURRENT_HEAD_RECEIPTS');
});

test('both actual resolved compartments remain complete 2D rooms on supported feet', () => {
  const contract = current.runtimeContracts.annexCirculation.projection;
  assert.deepEqual(contract, { parentRoomId: 'science-lab', annexRoomId: 'synthetic-bay', mode: '2d',
    renderMode: 'strict-side-elevation', dxPerY: 0, serviceDepth: 0, mixed: false,
    feetY: 624, changedByThisLot: false });
  for (const id of [contract.parentRoomId, contract.annexRoomId]) {
    const resolved = getHubRoomProjectionV139(id);
    assert.equal(resolved.mode, contract.mode);
    assert.equal(resolved.projection, contract.renderMode);
    assert.equal(resolved.dxPerY, contract.dxPerY);
    assert.equal(resolved.serviceDepth, contract.serviceDepth);
    assert.equal(resolved.mixedProjectionAllowed, contract.mixed);
  }
});

test('nineteen native assignments stay distinct from one physical annex route and ECHO-A', () => {
  assert.deepEqual(current.runtimeContracts.annexes, previous.runtimeContracts.annexes);
  assert.deepEqual(current.runtimeContracts.npcCirculation, previous.runtimeContracts.npcCirculation);
  const table = current.tables['04_Annexes'];
  assert.deepEqual(ids(table), ids(previous.tables['04_Annexes']));
  assert.equal(table.rows.length, 19);
  for (const row of table.rows) {
    const old = previous.tables['04_Annexes'].rows.find(r => r[0] === row[0]);
    if (row[0] === 'synthetic-bay') {
      assert.deepEqual(row.slice(0, 7), old.slice(0, 7));
      assert.match(row[7], /même BISHOP/);
      assert.match(row[7], /science-lab/);
      assert.match(row[7], /quarantaine/);
    } else assert.deepEqual(row, old);
  }
  assert.equal(current.tables['15_LotsV159'].rows.length, 1);
  assert.equal(current.tables['15_LotsV159'].rows[0][0], 'bishop-annex-circulation');
});

test('the fifteen recovered contents are distinct from historical V146 consultations and unavailable motion proof', () => {
  assert.equal(references.schema, 159);
  assert.equal(references.sources.length, 15);
  assert.deepEqual(references.sources.map(s => s.id), Array.from({ length: 15 }, (_, i) => 'V159-REF-' + String(i + 1).padStart(3, '0')));
  assert.deepEqual(references.counts, { htmlPagesRecovered: 11, publicProjectJsonRecovered: 2,
    officialImagesRecoveredAndViewed: 2, totalRecoveredSources: 15, httpContentUnavailable: 3,
    cdnImageRequestsBlocked: 4, exactAnimationReferencesRecovered: 0, canon1to1Closures: 0,
    missingUserDlcArchivesRecovered: 0 });
  assert.equal(current.tables['14_References'].rows.length, 65);
  for (const source of references.sources) {
    assert.equal(source.httpStatus, 200);
    assert.equal(source.animationReference, false);
    assert.equal(source.canonExact, false);
    assert.equal(source.permittedGameAssetReuseEstablished, false);
    assert.match(source.contentSha256, /^[a-f0-9]{64}$/);
    assert.ok(Number.isFinite(Date.parse(source.consultedAt)));
    const url = new URL(source.url);
    assert.equal(url.protocol, 'https:');
    assert.ok(source.contribution.length > 30 && source.limitations.length > 30);
    assert.equal(Object.hasOwn(source, 'excerpts'), false);
    assert.equal(Object.hasOwn(source, 'rawFile'), false);
  }
});

test('retrieved creator metadata distinguishes rejected Guardian V01 and Guardian V02 from viewed pixels', () => {
  const byId = Object.fromEntries(references.sources.map(row => [row.id, row]));
  assert.equal(byId['V159-REF-012'].url, 'https://www.artstation.com/projects/g0Va4P.json');
  assert.equal(byId['V159-REF-013'].url, 'https://www.artstation.com/projects/JvgEP0.json');
  assert.match(byId['V159-REF-012'].contribution, /Guardian/);
  assert.match(byId['V159-REF-013'].contribution, /rejected GuardianV01/);
  assert.match(byId['V159-REF-012'].limitations, /pixels were not viewed/);
  assert.match(byId['V159-REF-013'].limitations, /images remain unavailable/);
  assert.match(byId['V159-REF-014'].evidenceScope, /static image/);
  assert.match(byId['V159-REF-015'].evidenceScope, /static silhouette/);
});

test('all ninety-six source correspondences keep exact distinct IDs and historical state scope', () => {
  assert.equal(references.mappingRows, 96);
  assert.equal(references.inheritedTaskRows, 68);
  assert.equal(references.mappings.length, 96);
  assert.equal(new Set(references.mappings.map(row => row.id)).size, 96);
  const tasks = references.mappings.filter(row => row.kind === 'Tâche Excel héritée');
  assert.equal(tasks.length, 68);
  assert.deepEqual(tasks.map(row => row.id).sort(), [...current.inheritedPresentationIds, ...current.inheritedArt153Ids].sort());
  const known = new Set(references.sources.map(row => row.id));
  for (const mapping of references.mappings) {
    assert.equal(mapping.recordedStateScope, 'historical-prepublication-v158-mapping-not-current-delivery');
    assert.equal(mapping.fullyArtClosed, false);
    assert.equal(mapping.approved1to1, false);
    assert.ok(mapping.sourceIds.every(id => known.has(id)));
    if (mapping.projectFile) {
      const path = mapping.projectFile.replace(/^\//, '');
      assert.match(path, /^(assets|src)\//);
      if (mapping.projectImageSha256) assert.equal(sha(read(path)), mapping.projectImageSha256);
      else assert.ok(read(path).length > 0);
    }
  }
});

test('reference tables expose the reviewed metadata and mappings without private paths or raw quotations', () => {
  assert.equal(sha(bytes('references-v159.json')), referenceRecordSha256);
  assert.equal(current.referencesDocument.sha256, sha(bytes('references-v159.json')));
  assert.deepEqual(current.referencesDocument, { path: prefix + 'references-v159.json',
    sha256: sha(bytes('references-v159.json')), sources: 15, mappings: 96,
    inheritedTaskRows: 68, motionReferences: 0, approved1to1: 0,
    historicalMappingStateIsCurrentDelivery: false });
  assert.deepEqual(current.tables['16_SourcesV159'].rows, references.sources.map(s => [
    s.id, s.title, s.authorPublisher, s.url, s.consultedAt, s.contentSha256,
    s.evidenceScope, s.contribution, s.limitations, 0, 0]));
  assert.deepEqual(current.tables['17_LiensV159'].rows, references.mappings.map(r => [
    r.id, r.kind, r.fighterId, r.sourceIds.join(' ; '), r.historicalSourceIds.join(' ; '), r.need,
    r.recordedState, r.contribution, r.remaining, r.projectFile, r.projectImageSha256, 0, 0]));
  for (const name of ['progress-v159.json', 'references-v159.json', 'V159-CIRCULATION.md']) {
    const content = bytes(name).toString('utf8');
    assert.doesNotMatch(content, /\/workspace\/|\/home\/|\/Users\//);
    assert.equal(isPublicDistributionTextV86(content), true);
  }
});

test('all 189 motion-proof rows and project plates remain separate from new identity references', () => {
  assert.deepEqual(current.tables['13_Preuve1to1'], previous.tables['13_Preuve1to1']);
  assert.equal(current.tables['13_Preuve1to1'].rows.length, 189);
  for (const row of current.tables['13_Preuve1to1'].rows) {
    assert.deepEqual(row.slice(6, 9), [null, null, null]);
    assert.equal(row[10], 0);
  }
  assert.deepEqual(current.sourcePlates, previous.sourcePlates);
  for (const plate of current.sourcePlates) assert.equal(sha(read(plate.path.slice(1))), plate.sourceSha256);
  const evidence = current.runtimeContracts.fidelityEvidence;
  for (const key of ['sourceWorkApproved1to1', 'sourceWorkEditionSpecified', 'sourceWorkTimecodes', 'sourceWorkApprovedCaptures']) assert.equal(evidence[key], 0);
  assert.equal(evidence.consultedReferencesV159.recoveredSources, 15);
  assert.equal(evidence.consultedReferencesV159.newMotionReferences, 0);
  assert.equal(evidence.consultedReferencesV159.historical65RowsReclassified, false);
});

test('thirteen historical XLSX and the three anchored V158 documents retain exact bytes', () => {
  assert.deepEqual(current.historyWorkbooks, [...previous.historyWorkbooks,
    { path: prefix + previous.workbook, sha256: previous.workbookSha256 }]);
  assert.equal(current.historyWorkbooks.length, 13);
  for (const entry of current.historyWorkbooks) assert.equal(sha(read(entry.path)), entry.sha256, entry.path);
  for (const [path, expected] of Object.entries(AUDIT_PREDECESSOR_DOCUMENTS_V159)) assert.equal(sha(read(path)), expected, path);
});

test('strict V159 source succession preserves and validates the full V156 onward bridge', () => {
  const result = verifyAuditSuccessionV159(previous, current);
  assert.equal(result.inherited, 46);
  assert.equal(result.added, 2);
  assert.equal(result.current, 48);
  assert.deepEqual(current.runtimeSuccession.addedSources.map(r => r.path),
    ['src/hub-v71-runtime.js', 'src/npc-annex-circulation-v159.js']);
  assert.equal(verifyAuditSuccessionV158(previous157, previous).current, 46);
  assert.equal(verifyAuditSuccessionV157(previous156, previous157).current, 31);
  assert.deepEqual(resolveAuditSourcesV159(previous), current.runtimeSourceSha256);
  assert.deepEqual(current.tables['11_Succession'].rows,
    [...current.runtimeSuccession.transitions, ...current.runtimeSuccession.addedSources]
      .map(r => [r.path, r.previousSha256 ?? 'Non épinglé en V158', r.currentSha256, r.reason, r.verifiers.join(' ; ')]));
});

test('successor validation rejects omitted, duplicated, dishonest or unsupported transitions', () => {
  const first = current.runtimeSuccession.transitions[0];
  assert.ok(first);
  const badPrevious = clone(previous);badPrevious.runtimeSourceSha256[first.path] = '0'.repeat(64);
  assert.throws(() => verifyAuditSuccessionV159(badPrevious, current));
  const mutations = [
    c => c.runtimeSuccession.transitions.shift(),
    c => c.runtimeSuccession.transitions.push(clone(first)),
    c => { c.runtimeSuccession.transitions[0].previousSha256 = '0'.repeat(64); },
    c => { c.runtimeSuccession.transitions[0].currentSha256 = '0'.repeat(64); },
    c => { c.runtimeSuccession.transitions[0].reason = 'fix'; },
    c => { c.runtimeSuccession.transitions[0].verifiers = []; },
    c => { delete c.runtimeSourceSha256[first.path]; },
    c => { c.runtimeSourceSha256['src/unreviewed.css'] = '0'.repeat(64); },
    c => c.runtimeSuccession.addedSources.pop(),
    c => { c.runtimeSuccession.predecessorDocuments[Object.keys(AUDIT_PREDECESSOR_DOCUMENTS_V159)[0]] = '0'.repeat(64); }
  ];
  for (const mutate of mutations) {
    const bad = clone(current);mutate(bad);
    assert.throws(() => verifyAuditSuccessionV159(previous, bad));
  }
});

test('unreviewed current or historical bytes cannot hide behind the V159 or earlier bridge', () => {
  for (const path of ['src/app.js', 'src/save.js', 'src/hub-v71-runtime.js',
    'src/npc-annex-circulation-v159.js', 'src/forge-editor-v130.css',
    ...Object.keys(AUDIT_PREDECESSOR_DOCUMENTS_V159)]) {
    const altered = p => p === path ? Buffer.concat([read(p), Buffer.from('\n// unreviewed mutation')]) : read(p);
    assert.throws(() => verifyAuditSuccessionV159(previous, current, altered), path);
    assert.throws(() => verifyAuditSuccessionV158(previous157, previous, altered), path);
    assert.throws(() => verifyAuditSuccessionV157(previous156, previous157, altered), path);
  }
  const omitted = path => {
    if (path === prefix + 'progress-v159.json') { const error = new Error('omitted');error.code = 'ENOENT';throw error; }
    return read(path);
  };
  assert.throws(() => verifyAuditSuccessionV158(previous157, previous, omitted));
});

test('an absent or invalid successor never admits a repinned historical V158 record', () => {
  const absent = path => {
    if (path === prefix + 'progress-v159.json') { const error = new Error('absent');error.code = 'ENOENT';throw error; }
    return read(path);
  };
  assert.deepEqual(resolveAuditSourcesV159(previous, absent), previous.runtimeSourceSha256);
  const fabricated = clone(previous);
  fabricated.runtimeSourceSha256['src/app.js'] = '0'.repeat(64);
  assert.throws(() => resolveAuditSourcesV159(fabricated, absent));
  assert.throws(() => verifyAuditSuccessionV158(previous157, fabricated, absent));
  for (const invalid of ['null', 'false', '0', '{}', '[]']) {
    const readInvalid = path => path === prefix + 'progress-v159.json' ? Buffer.from(invalid) : read(path);
    assert.throws(() => resolveAuditSourcesV159(previous, readInvalid), invalid);
    assert.throws(() => verifyAuditSuccessionV158(previous157, previous, readInvalid), invalid);
  }
});

test('all current result cells remain pending and every table has exact unique IDs', () => {
  assert.deepEqual(Object.keys(current.tables), expectedTables);
  for (const [name, table] of Object.entries(current.tables)) {
    assert.ok(table.headers.length && table.rows.length, name);
    assert.equal(new Set(table.headers).size, table.headers.length, name);
    assert.equal(new Set(ids(table)).size, table.rows.length, name);
    for (const row of table.rows) assert.equal(row.length, table.headers.length, name);
  }
  for (const row of current.tables['07_Recette'].rows) {
    assert.match(row[2], /à exécuter|à vérifier|prépublication/i);
    assert.doesNotMatch(row[2], /réussi|passed|succès|verte/i);
  }
  for (const row of current.tables['15_LotsV159'].rows) assert.match(row[4], /à exécuter/i);
  const notes = bytes('V159-CIRCULATION.md').toString('utf8');
  for (const pattern of [/prépublication/i, /189/, /65/, /96/, /15 contenus/, /2D intégrales/, /1:1/]) assert.match(notes, pattern);
  assert.doesNotMatch(notes, /CI verte|CI réussie|tout est terminé/i);
});

test('V159 source cells and all seventeen actual formulas match the reviewed JSON', () => {
  assert.equal(sha(bytes(current.workbook)), current.workbookSha256);
  const result = JSON.parse(execFileSync('python3', [
    fileURLToPath(new URL('./verify-audit-workbook-v159.py', import.meta.url)),
    fileURLToPath(new URL('../' + prefix, import.meta.url))
  ], { encoding: 'utf8', env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } }));
  assert.equal(result.ok, true);
  assert.equal(result.sheets, 18);
  assert.equal(result.tables, 17);
  assert.equal(result.formulas, 17);
  assert.equal(result.formulaErrors, 0);
  assert.ok(result.sourceCells > 6000);
});

test('deterministic stdlib generation never changes pins, references or thirteen histories', () => {
  const directory = mkdtempSync(join(tmpdir(), 'atf-audit-v159-'));
  try {
    const document = join(directory, 'progress-v159.json');
    copyFileSync(fileURLToPath(new URL('../' + prefix + 'progress-v159.json', import.meta.url)), document);
    for (const entry of current.historyWorkbooks) copyFileSync(fileURLToPath(new URL('../' + entry.path, import.meta.url)), join(directory, basename(entry.path)));
    const referenceBefore = sha(bytes('references-v159.json'));
    for (let attempt = 0; attempt < 2; attempt++) {
      const output = JSON.parse(execFileSync('python3', [fileURLToPath(new URL('./generate-audit-continuation-v159.py', import.meta.url)), directory],
        { encoding: 'utf8', env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } }));
      assert.equal(output.sha256, current.workbookSha256);
      assert.deepEqual(readFileSync(join(directory, current.workbook)), bytes(current.workbook));
      assert.deepEqual(JSON.parse(readFileSync(document)), current);
      assert.equal(sha(bytes('references-v159.json')), referenceBefore);
      for (const entry of current.historyWorkbooks) assert.equal(sha(readFileSync(join(directory, basename(entry.path)))), entry.sha256);
    }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('only four reviewed V159 documents are admitted and excluded from the shipped game', () => {
  const names = [current.workbook, 'progress-v159.json', 'references-v159.json', 'V159-CIRCULATION.md'];
  for (const name of names) {
    assert.equal(isPublicDistributionPathV86(prefix + name), true, name);
    assert.equal(isPublicDistributionPathV86(prefix + name, { built: true }), false, name);
  }
  assert.equal(isPublicDistributionPathV86(prefix + 'unreviewed-v159.xlsx'), false);
  assert.equal(isPublicDistributionPathV86(prefix + 'unreviewed-v159.json'), false);
  assert.deepEqual(readdirSync(new URL('../' + prefix, import.meta.url)).filter(name => /v159/i.test(name)).sort(), names.sort());
});
