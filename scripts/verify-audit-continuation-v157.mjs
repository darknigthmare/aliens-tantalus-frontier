import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { AUDIT_PREDECESSOR_DOCUMENTS_V157, verifyAuditSuccessionV157 } from './audit-succession-v157.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { XENO_TRIALS_FIGHTERS_V96 as roster } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_RIGS_V154 as rigs } from '../src/xeno-trials-rig-v154.js';
import { XENO_TRIALS_SEQUENCES_V156 as sequences, XENO_TRIALS_EXIT_V157 as spatialExit } from '../src/xeno-trials-sequences-v155.js';
import { SPECIAL_OPERATIONS_V131 as operations, SPECIAL_OPERATION_COUNTS_V131 as operationCounts } from '../src/special-operations-v131.js';
import { HUB_ANNEX_NPC_DUTIES_V141 as baseDuties, HUB_ANNEX_NPC_ROTATIONS_V157 as rotations,
  HUB_ANNEX_NPC_DEFERRED_V157 as deferred } from '../src/hub-annex-npc-life-v141.js';
import { HUB_ANNEXES_V137 as annexes } from '../src/hub-annex-registry-v137.js';
import { FORGE_NARRATIVE_LIMITS_V157 as narrativeExtensions } from '../src/forge-narrative-v156.js';
import { FORGE_CHECKPOINT_LIMITS_V157 as checkpointLimits,
  FORGE_CHECKPOINT_STORAGE_KEY_V157 as checkpointKey } from '../src/forge-playtest-checkpoint-v157.js';

const prefix = 'docs/forge/xeno-trials/';
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const bytes = name => read(prefix + name);
const current = JSON.parse(bytes('progress-v157.json'));
const previous = JSON.parse(bytes('progress-v156.json'));
const sha = value => createHash('sha256').update(value).digest('hex');
const clone = value => JSON.parse(JSON.stringify(value));
const ids = table => table.rows.map(row => row[0]);

test('V157 preserves all 40 presentation, 28 ART153 and 189 roster identities with no artistic closure', () => {
  assert.equal(current.lot, 'V157');
  assert.equal(current.applicationVersion, '143.0.0');
  assert.equal(current.saveSchema, 52);
  assert.equal(current.approved1to1, 0);
  assert.equal(current.fullArtTasksClosed, 0);
  assert.equal(current.newOriginalSpriteFiles, 0);
  assert.equal(current.newPresentationMappings, 0);
  assert.deepEqual(current.inheritedPresentationIds, previous.inheritedPresentationIds);
  assert.deepEqual(current.inheritedArt153Ids, previous.inheritedArt153Ids);
  assert.deepEqual(current.rosterIds, previous.rosterIds);
  assert.deepEqual(current.rosterIds, roster.map(row => row.id));
  assert.deepEqual(ids(current.tables['01_Presentations']), previous.inheritedPresentationIds);
  assert.deepEqual(ids(current.tables['02_ART153']), previous.inheritedArt153Ids);
  assert.equal(current.rosterIds.length, 189);
  for (const row of current.tables['01_Presentations'].rows) {
    assert.equal(row[3], 'Partiel');
    assert.equal(row[6], 0);
    assert.equal(row[7], 0);
  }
  for (const row of current.tables['02_ART153'].rows) {
    assert.equal(row[7], 0);
    assert.doesNotMatch(row[4], /clos|terminé|certifi/i);
  }
});

test('V157 retains 40 historical sequences and 200 keys while declaring spatial exits separately', () => {
  assert.equal(current.rigCount, rigs.length);
  assert.equal(rigs.length, 4);
  assert.equal(current.sequences, sequences.length);
  assert.equal(sequences.length, 40);
  assert.deepEqual(current.sequenceIds, sequences.map(row => row.id));
  assert.equal(current.keyframes, sequences.reduce((sum, row) => sum + row.keys.length, 0));
  assert.equal(current.keyframes, 200);
  assert.deepEqual(current.tables['03_Sequences'], previous.tables['03_Sequences']);
  assert.equal(current.tables['12_TrialsSortie'].rows.length, 4);
  assert.deepEqual(ids(current.tables['12_TrialsSortie']), rigs.map(row => row.fighterId));
  assert.deepEqual(current.runtimeContracts.spatialExit.configuration, spatialExit);
  assert.deepEqual(current.runtimeContracts.spatialExit.rigIds, rigs.map(row => row.fighterId));
  assert.equal(current.runtimeContracts.spatialExit.gameplayCoordinatesChanged, false);
  assert.equal(current.runtimeContracts.spatialExit.camera, 'frozen-terminal-camera');
  assert.equal(spatialExit.canonExact, false);
  assert.equal(spatialExit.fullLocomotion, false);
});

test('current annex and Forge capabilities match their versioned exports without rewriting historical contracts', () => {
  const annex = current.runtimeContracts.annexes;
  assert.deepEqual(annex.baseDuties, baseDuties);
  assert.deepEqual(annex.rotations, rotations);
  assert.deepEqual(annex.deferred, deferred);
  const covered = [...new Set([...baseDuties, ...rotations].map(row => row.roomId))].sort();
  assert.deepEqual(annex.coveredRoomIds, covered);
  assert.deepEqual(annex.roomIds, annexes.map(row => row.id));
  assert.equal(covered.length, 19);
  assert.equal(deferred.length, 0);
  assert.equal(annex.newCrewIdentities, 0);
  assert.equal(annex.interRoomWalking, false);
  assert.equal(current.tables['04_Annexes'].rows.filter(row => row[6] === 'Affectation technique conditionnelle').length, 19);
  assert.deepEqual(current.runtimeContracts.forge.narrativeExtensions.limits, narrativeExtensions);
  assert.equal(current.runtimeContracts.forge.narrativeExtensions.inventoryScope, 'authored-story-tokens-only');
  assert.equal(current.runtimeContracts.forge.narrativeExtensions.clock, 'admitted-simulation-only');
  assert.equal(current.runtimeContracts.forge.interSessionProgress, true);
  assert.equal(current.runtimeContracts.forge.sessionPersistence, 'session-memory-plus-explicit-local-checkpoint');
  assert.equal(current.runtimeContracts.forge.cloud, false);
  assert.equal(current.runtimeContracts.forge.freeScripts, false);
  const checkpoint = current.runtimeContracts.forge.checkpoint;
  assert.deepEqual(checkpoint.limits, checkpointLimits);
  assert.equal(checkpoint.storageKey, checkpointKey);
  assert.equal(checkpoint.scope, 'forge-local-playtest');
  assert.equal(checkpoint.explicitCommands, true);
  assert.equal(checkpoint.cloud, false);
  assert.equal(checkpoint.campaignSave, false);
});

test('eleven historical workbooks and four native source plates retain their exact reviewed bytes', () => {
  assert.deepEqual(current.historyWorkbooks, [...previous.historyWorkbooks,
    { path: prefix + previous.workbook, sha256: previous.workbookSha256 }]);
  assert.equal(current.historyWorkbooks.length, 11);
  for (const entry of current.historyWorkbooks) assert.equal(sha(read(entry.path)), entry.sha256, entry.path);
  assert.deepEqual(current.sourcePlates, previous.sourcePlates);
  for (const plate of current.sourcePlates) assert.equal(sha(read(plate.path.slice(1))), plate.sourceSha256, plate.path);
  for (const [path, expected] of Object.entries(AUDIT_PREDECESSOR_DOCUMENTS_V157)) assert.equal(sha(read(path)), expected, path);
});

test('the succession bridge declares every changed inherited module and verifies all current source bytes', () => {
  const result = verifyAuditSuccessionV157(previous, current);
  assert.equal(result.inherited, 18);
  assert.ok(result.changed > 0);
  assert.equal(result.current, Object.keys(current.runtimeSourceSha256).length);
  const expectedRows = [...current.runtimeSuccession.transitions, ...current.runtimeSuccession.addedSources]
    .map(row => [row.path, row.previousSha256 ?? 'Non épinglé en V156', row.currentSha256, row.reason, row.verifiers.join(' ; ')]);
  assert.deepEqual(current.tables['11_Succession'].rows, expectedRows);
});

test('the succession bridge rejects missing, duplicate and misleading old/new transitions', () => {
  const first = current.runtimeSuccession.transitions[0];
  assert.ok(first);
  const fabricatedPrevious = clone(previous), fabricatedTransition = clone(current);
  fabricatedPrevious.runtimeSourceSha256[first.path] = '0'.repeat(64);
  fabricatedTransition.runtimeSuccession.transitions[0].previousSha256 = '0'.repeat(64);
  assert.throws(() => verifyAuditSuccessionV157(fabricatedPrevious, fabricatedTransition));
  for (const change of [
    c => c.runtimeSuccession.transitions.shift(),
    c => c.runtimeSuccession.transitions.push(clone(first)),
    c => { c.runtimeSuccession.transitions[0].previousSha256 = '0'.repeat(64); },
    c => { c.runtimeSuccession.transitions[0].currentSha256 = '0'.repeat(64); },
    c => { c.runtimeSuccession.transitions[0].reason = 'mise à jour'; },
    c => { c.runtimeSuccession.transitions[0].verifiers = []; },
    c => { delete c.runtimeSourceSha256[first.path]; }
  ]) {
    const bad = clone(current);
    change(bad);
    assert.throws(() => verifyAuditSuccessionV157(previous, bad));
  }
});

test('the succession bridge rejects changed runtime bytes and changed immutable predecessor documents', () => {
  const module = Object.keys(current.runtimeSourceSha256)[0];
  assert.throws(() => verifyAuditSuccessionV157(previous, current,
    path => path === module ? Buffer.concat([read(path), Buffer.from('\n// unreviewed mutation')]) : read(path)));
  const historical = Object.keys(AUDIT_PREDECESSOR_DOCUMENTS_V157)[0];
  assert.throws(() => verifyAuditSuccessionV157(previous, current,
    path => path === historical ? Buffer.concat([read(path), Buffer.from('\n')]) : read(path)));
  const bad = clone(current);
  bad.runtimeSuccession.predecessorDocuments[historical] = '0'.repeat(64);
  assert.throws(() => verifyAuditSuccessionV157(previous, bad));
});

test('the operations appendix uses the active V131 registry rather than the historical V67 backlog', () => {
  assert.deepEqual(current.runtimeContracts.operations.counts, operationCounts);
  assert.equal(operationCounts.total, 21);
  assert.equal(operationCounts.playable, 21);
  assert.equal(operationCounts.missing, 0);
  assert.equal(operationCounts.partial, 20);
  assert.equal(operationCounts.effective, 1);
  assert.deepEqual(ids(current.tables['10_Operations']), operations.map(row => row.id));
  assert.match(current.runtimeContracts.operations.scope, /19.*2/);
  assert.match(current.runtimeContracts.operations.limitations.join(' '), /partiel/i);
});

test('V157 tables and notes distinguish implemented scope, pending verification and missing source material', () => {
  assert.equal(Object.keys(current.tables).length, 12);
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
  assert.match(current.limitations.join(' '), /185/);
  assert.match(current.limitations.join(' '), /cloud/i);
  assert.match(current.limitations.join(' '), /absent/i);
  const notes = bytes('V157-CONTINUATION.md').toString('utf8');
  assert.match(notes, /prépublication/i);
  assert.match(notes, /V67/);
  assert.match(notes, /21/);
  assert.match(notes, /1:1/);
  assert.doesNotMatch(notes, /CI verte|CI réussie|tout est terminé|21 campagnes finies/i);
});

test('all V157 workbook cells and thirteen actual formula caches mirror their reviewed JSON', () => {
  assert.equal(sha(bytes(current.workbook)), current.workbookSha256);
  const result = JSON.parse(execFileSync('python3', [
    fileURLToPath(new URL('./verify-audit-workbook-v157.py', import.meta.url)),
    fileURLToPath(new URL('../' + prefix, import.meta.url))
  ], { encoding: 'utf8', env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } }));
  assert.equal(result.ok, true);
  assert.equal(result.sheets, 13);
  assert.equal(result.tables, 12);
  assert.equal(result.formulas, 13);
  assert.equal(result.formulaErrors, 0);
  assert.ok(result.sourceCells > 2000);
});

test('the stdlib generator reproduces the exact workbook without refreshing source pins or historical bytes', () => {
  const directory = mkdtempSync(join(tmpdir(), 'atf-audit-v157-'));
  try {
    const document = join(directory, 'progress-v157.json');
    copyFileSync(fileURLToPath(new URL('../' + prefix + 'progress-v157.json', import.meta.url)), document);
    for (const entry of current.historyWorkbooks) {
      copyFileSync(fileURLToPath(new URL('../' + entry.path, import.meta.url)), join(directory, basename(entry.path)));
    }
    const command = [fileURLToPath(new URL('./generate-audit-continuation-v157.py', import.meta.url)), directory];
    for (let attempt = 0; attempt < 2; attempt++) {
      const output = JSON.parse(execFileSync('python3', command,
        { encoding: 'utf8', env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } }));
      assert.equal(output.sha256, current.workbookSha256);
      assert.deepEqual(readFileSync(join(directory, current.workbook)), bytes(current.workbook));
      assert.deepEqual(JSON.parse(readFileSync(document)), current);
      for (const entry of current.historyWorkbooks) {
        assert.equal(sha(readFileSync(join(directory, basename(entry.path)))), entry.sha256, entry.path);
      }
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('only the three reviewed V157 documents are admitted as sources and excluded from distribution', () => {
  for (const name of [current.workbook, 'progress-v157.json', 'V157-CONTINUATION.md']) {
    assert.equal(isPublicDistributionPathV86(prefix + name), true, name);
    assert.equal(isPublicDistributionPathV86(prefix + name, { built: true }), false, name);
  }
  assert.equal(isPublicDistributionPathV86(prefix + 'unreviewed-v157.xlsx'), false);
  assert.equal(isPublicDistributionPathV86(prefix + 'unreviewed-v157.json'), false);
  assert.deepEqual(readdirSync(new URL('../' + prefix, import.meta.url)).filter(name => /v157/i.test(name)).sort(),
    ['V157-CONTINUATION.md', 'XENO_TRIALS_SUIVI_V157.xlsx', 'progress-v157.json'].sort());
});
