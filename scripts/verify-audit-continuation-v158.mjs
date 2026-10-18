import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { AUDIT_PREDECESSOR_DOCUMENTS_V158, verifyAuditSuccessionV158 } from './audit-succession-v158.mjs';
import { verifyAuditSuccessionV157 } from './audit-succession-v157.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { XENO_TRIALS_FIGHTERS_V96 as roster } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_SEQUENCES_V156 as sequences } from '../src/xeno-trials-sequences-v155.js';
import { XENO_TRIALS_CAPTURE_RECEPTION_V158 as capture } from '../src/xeno-trials-capture-reception-v158.js';
import { FORGE_NPC_LIMITS_V158 as npcLimits, FORGE_NPC_PRESETS_V158 as npcPresets } from '../src/forge-npcs-v158.js';
import { HUB_NPC_CIRCULATION_V158 as circulation } from '../src/npc-circulation-v158.js';
import { BLACK_COCOON_PRESENTATION_V158 as cocoon } from '../src/black-cocoon-presentation-v158.js';
import { SPECIAL_OPERATION_COUNTS_V131 as operationCounts, SPECIAL_OPERATIONS_V131 as operations } from '../src/special-operations-v131.js';

const prefix = 'docs/forge/xeno-trials/';
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const bytes = name => read(prefix + name);
const current = JSON.parse(bytes('progress-v158.json'));
const previous = JSON.parse(bytes('progress-v157.json'));
const older = JSON.parse(bytes('progress-v156.json'));
const plan = JSON.parse(bytes('xeno-trials-plan-v146.json'));
const sha = value => createHash('sha256').update(value).digest('hex');
const clone = value => JSON.parse(JSON.stringify(value));
const ids = table => table.rows.map(row => row[0]);
const captureTasks = ['ART153-10', 'ART153-17', 'ART153-24'];

test('V158 preserves the 68 inherited task IDs and 189 roster IDs without artistic closure', () => {
  assert.equal(current.lot, 'V158');
  assert.equal(current.publicationState, 'PREPUBLICATION');
  assert.equal(current.applicationVersion, previous.applicationVersion);
  assert.equal(current.saveSchema, previous.saveSchema);
  assert.equal(current.approved1to1, 0);
  assert.equal(current.fullArtTasksClosed, 0);
  assert.equal(current.newPresentationMappings, 0);
  assert.equal(current.newOriginalSpriteFiles, 0);
  assert.deepEqual(current.rosterIds, previous.rosterIds);
  assert.deepEqual(current.rosterIds, roster.map(row => row.id));
  assert.equal(current.rosterIds.length, 189);
  assert.deepEqual(current.inheritedPresentationIds, previous.inheritedPresentationIds);
  assert.deepEqual(current.inheritedArt153Ids, previous.inheritedArt153Ids);
  assert.deepEqual(current.tables['01_Presentations'], previous.tables['01_Presentations']);
  assert.deepEqual(ids(current.tables['02_ART153']), previous.inheritedArt153Ids);
  for (const row of current.tables['02_ART153'].rows) {
    const old = previous.tables['02_ART153'].rows.find(entry => entry[0] === row[0]);
    assert.equal(row[7], 0);
    assert.doesNotMatch(row[4], /clos|terminé|certifi/i);
    if (captureTasks.includes(row[0])) {
      assert.equal(row[4], 'Implémenté (adaptation native)');
      assert.equal(row[6], 'V158');
      assert.match(row[5], /simulation/);
      assert.deepEqual(row.slice(0, 4), old.slice(0, 4));
    } else assert.deepEqual(row, old, row[0]);
  }
});

test('the three receptions are exact native-image simulation adaptations with historical clips intact', () => {
  assert.deepEqual(current.runtimeContracts.captureReception.configuration, capture);
  assert.equal(capture.canonExact, false);
  assert.equal(capture.fullFloorPin, false);
  assert.deepEqual(capture.targets.map(row => row.taskId).sort(), captureTasks);
  assert.deepEqual(capture.targets.map(row => row.fighterId).sort(),
    ['dd-darwin-era-cultist', 'import-game-dd-guardian', 'import-game-dd-wy-commando']);
  assert.equal(current.runtimeContracts.captureReception.physicalCoordinatesChanged, false);
  assert.equal(current.runtimeContracts.captureReception.referenceMotionCaptured, false);
  assert.equal(current.runtimeContracts.captureReception.newSourcePixels, false);
  assert.equal(current.runtimeContracts.captureReception.historicalSequencesChanged, false);
  assert.deepEqual(current.tables['03_Sequences'], previous.tables['03_Sequences']);
  assert.deepEqual(current.sequenceIds, sequences.map(row => row.id));
  assert.equal(sequences.length, 40);
  assert.equal(sequences.reduce((sum, row) => sum + row.keys.length, 0), 200);
});

test('Forge conversation NPCs retain their executable limits and local scope', () => {
  const contract = current.runtimeContracts.forge.npcs;
  assert.deepEqual(contract.limits, npcLimits);
  assert.deepEqual(contract.presets, npcPresets);
  assert.equal(npcLimits.room, 16);
  assert.equal(npcLimits.project, 64);
  assert.equal(npcLimits.name, 80);
  assert.equal(contract.stationary, true);
  assert.equal(contract.campaignCrew, false);
  assert.equal(contract.cloud, false);
  assert.equal(contract.freeScripts, false);
  assert.equal(contract.historicalSandboxArchiveRecovered, false);
  assert.deepEqual(contract.model, { schema: 1, fields: ['name', 'presetId', 'facing'],
    layers: ['structure', 'gameplay'], facings: [-1, 1] });
  assert.deepEqual(contract.bodies, { mission: { width: 42, height: 92 }, ship: { width: 44, height: 92 },
    combatant: false, blocking: false });
  assert.equal(contract.placement.fixedSupportRequired, true);
  assert.equal(contract.placement.liftSupportAllowed, false);
  assert.equal(contract.dialogue.storiesIncludingTerminalsAndNpcs, 64);
  assert.equal(contract.dialogue.nativePowerOrArchiveActivation, false);
  assert.equal(contract.checkpoint.rebuildActorsFromProject, true);
  assert.deepEqual(contract.checkpoint.projectIdentityIncludes, ['name', 'presetId', 'facing']);
  assert.deepEqual(current.runtimeContracts.forge.checkpoint, previous.runtimeContracts.forge.checkpoint);
  assert.equal(current.runtimeContracts.forge.cloud, false);
});

test('the physical ECHO-A circuit does not claim circulation among the annexes or decks', () => {
  const contract = current.runtimeContracts.npcCirculation;
  assert.deepEqual(contract.configuration, circulation);
  assert.equal(circulation.crewId, 'crew-14-echo-a');
  assert.equal(circulation.deck, 0);
  assert.deepEqual(circulation.roomIds, ['briefing', 'combat-information']);
  assert.equal(circulation.doorId, 'command:hub-central-bulkhead');
  assert.equal(contract.physicalDoorCrossing, true);
  assert.equal(contract.newCrewIdentities, 0);
  assert.equal(contract.interAnnexWalking, false);
  assert.equal(contract.interDeckWalking, false);
  assert.equal(contract.liftTransit, false);
  assert.equal(contract.nativeSecurityGateAcrossDecks, true);
  assert.equal(contract.thresholdDoorProgressPersisted, true);
  assert.deepEqual(current.tables['04_Annexes'], previous.tables['04_Annexes']);
  assert.equal(current.runtimeContracts.annexes.interRoomWalking, false);
});

test('dedicated Cocon rendering is distinct from source-work certification and an extended campaign', () => {
  const contract = current.runtimeContracts.operations.blackCocoonPresentation;
  assert.deepEqual(contract.configuration, cocoon);
  assert.equal(cocoon.canonExact, false);
  assert.equal(cocoon.operationId, 'black-cocoon');
  assert.equal(contract.newBitmapAtlas, false);
  assert.equal(contract.campaignExtended, false);
  assert.equal(contract.nativeRulesChanged, false);
  assert.equal(contract.resinFollowsFreedPlayer, false);
  assert.equal(contract.oldFreedSaveWithoutTimestamp, 'settled');
  assert.equal(contract.paintedResinClampedToSupport, true);
  assert.equal(contract.equipmentAcquiredThroughNativeBagOnly, true);
  assert.deepEqual(current.runtimeContracts.operations.counts, operationCounts);
  assert.deepEqual(operationCounts, previous.runtimeContracts.operations.counts);
  assert.deepEqual(ids(current.tables['10_Operations']), operations.map(row => row.id));
  for (const row of current.tables['10_Operations'].rows) {
    const operation = operations.find(entry => entry.id === row[0]);
    assert.equal(row[5], operation.remainingMechanics.join('; '));
    assert.equal(row[6], 0);
  }
});

test('all 189 evidence rows distinguish unchanged project images from absent source-work proof', () => {
  const evidence = current.tables['13_Preuve1to1'];
  assert.deepEqual(ids(evidence), current.rosterIds);
  assert.equal(evidence.rows.length, 189);
  const plates = new Map(current.sourcePlates.map(row => [row.fighterId, row]));
  for (const row of evidence.rows) {
    assert.deepEqual(row.slice(6, 9), [null, null, null]);
    assert.equal(row[10], 0);
    const plate = plates.get(row[0]);
    if (plate) {
      assert.equal(row[4], plate.path);
      assert.equal(row[5], plate.sourceSha256);
      assert.equal(row[9], 'Image du projet conservée ; geste adapté');
    } else {
      assert.equal(row[4], null);
      assert.equal(row[5], null);
      assert.equal(row[9], 'Non évalué dans ce lot');
    }
  }
  const fidelity = current.runtimeContracts.fidelityEvidence;
  assert.equal(fidelity.sourceWorkApproved1to1, 0);
  assert.equal(fidelity.sourceWorkEditionSpecified, 0);
  assert.equal(fidelity.sourceWorkTimecodes, 0);
  assert.equal(fidelity.sourceWorkApprovedCaptures, 0);
  assert.equal(fidelity.newOnlineFootageRetrieved, false);
  assert.equal(fidelity.encyclopediaRawWorkbookRecovered, false);
  assert.equal(fidelity.dlcBlackoutEarthOrV10ArchivesRecovered, false);
  assert.deepEqual(current.tables['14_References'], plan.tables['15_Sources']);
  assert.equal(current.tables['14_References'].rows.length, 65);
});

test('twelve historical workbooks, the three V157 documents and four native plates retain exact bytes', () => {
  assert.deepEqual(current.historyWorkbooks, [...previous.historyWorkbooks,
    { path: prefix + previous.workbook, sha256: previous.workbookSha256 }]);
  assert.equal(current.historyWorkbooks.length, 12);
  for (const entry of current.historyWorkbooks) assert.equal(sha(read(entry.path)), entry.sha256, entry.path);
  for (const [path, expected] of Object.entries(AUDIT_PREDECESSOR_DOCUMENTS_V158)) assert.equal(sha(read(path)), expected, path);
  assert.deepEqual(current.sourcePlates, previous.sourcePlates);
  for (const plate of current.sourcePlates) assert.equal(sha(read(plate.path.slice(1))), plate.sourceSha256);
});

test('the strict V158 succession verifies every source and preserves the V156 to V157 historical bridge', () => {
  const result = verifyAuditSuccessionV158(previous, current);
  assert.equal(result.inherited, 31);
  assert.ok(result.changed > 0);
  assert.ok(result.added >= 4);
  assert.equal(result.current, Object.keys(current.runtimeSourceSha256).length);
  const inherited = verifyAuditSuccessionV157(older, previous);
  assert.equal(inherited.inherited, 18);
  assert.equal(inherited.current, 31);
  assert.deepEqual(current.tables['11_Succession'].rows,
    [...current.runtimeSuccession.transitions, ...current.runtimeSuccession.addedSources]
      .map(row => [row.path, row.previousSha256 ?? 'Non épinglé en V157', row.currentSha256, row.reason, row.verifiers.join(' ; ')]));
});

test('succession rejects dishonest predecessors, missing transitions and unreviewed current sources', () => {
  const first = current.runtimeSuccession.transitions[0];
  assert.ok(first);
  const badPrevious = clone(previous);
  badPrevious.runtimeSourceSha256[first.path] = '0'.repeat(64);
  assert.throws(() => verifyAuditSuccessionV158(badPrevious, current));
  for (const mutate of [
    c => c.runtimeSuccession.transitions.shift(),
    c => c.runtimeSuccession.transitions.push(clone(first)),
    c => { c.runtimeSuccession.transitions[0].previousSha256 = '0'.repeat(64); },
    c => { c.runtimeSuccession.transitions[0].currentSha256 = '0'.repeat(64); },
    c => { c.runtimeSuccession.transitions[0].reason = 'changement'; },
    c => { c.runtimeSuccession.transitions[0].verifiers = []; },
    c => { delete c.runtimeSourceSha256[first.path]; },
    c => { c.runtimeSourceSha256['src/unreviewed.css'] = '0'.repeat(64); }
  ]) {
    const bad = clone(current);mutate(bad);
    assert.throws(() => verifyAuditSuccessionV158(previous, bad));
  }
  for (const target of [first.path, 'src/forge-editor-v130.css', Object.keys(AUDIT_PREDECESSOR_DOCUMENTS_V158)[0]]) {
    assert.throws(() => verifyAuditSuccessionV158(previous, current,
      path => path === target ? Buffer.concat([read(path), Buffer.from('\n// unreviewed mutation')]) : read(path)));
  }
});

test('the four lots and source notes keep every new validation explicitly pending', () => {
  assert.equal(Object.keys(current.tables).length, 15);
  assert.equal(current.tables['15_LotsV158'].rows.length, 4);
  for (const [name, table] of Object.entries(current.tables)) {
    assert.ok(table.headers.length && table.rows.length, name);
    assert.equal(new Set(table.headers).size, table.headers.length, name);
    assert.equal(new Set(ids(table)).size, table.rows.length, name);
    for (const row of table.rows) assert.equal(row.length, table.headers.length, name);
  }
  for (const row of current.tables['15_LotsV158'].rows) assert.match(row[4], /à exécuter/i);
  for (const row of current.tables['07_Recette'].rows) {
    assert.match(row[2], /à exécuter|à vérifier|prépublication/i);
    assert.doesNotMatch(row[2], /réussi|passed|succès|verte/i);
  }
  const notes = bytes('V158-CONTINUATION.md').toString('utf8');
  assert.match(notes, /prépublication/i);
  assert.match(notes, /1:1/);
  assert.match(notes, /65/);
  assert.match(notes, /189/);
  assert.match(notes, /métrage.*bloqu|bloqu.*proxy/is);
  assert.doesNotMatch(notes, /CI verte|CI réussie|tout est terminé/i);
});

test('all V158 workbook source cells and seventeen real formula caches match the reviewed JSON', () => {
  assert.equal(sha(bytes(current.workbook)), current.workbookSha256);
  const result = JSON.parse(execFileSync('python3', [
    fileURLToPath(new URL('./verify-audit-workbook-v158.py', import.meta.url)),
    fileURLToPath(new URL('../' + prefix, import.meta.url))
  ], { encoding: 'utf8', env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } }));
  assert.equal(result.ok, true);
  assert.equal(result.sheets, 16);
  assert.equal(result.tables, 15);
  assert.equal(result.formulas, 17);
  assert.equal(result.formulaErrors, 0);
  assert.ok(result.sourceCells > 5000);
});

test('the stdlib V158 generator reproduces the workbook without changing source pins or twelve histories', () => {
  const directory = mkdtempSync(join(tmpdir(), 'atf-audit-v158-'));
  try {
    const document = join(directory, 'progress-v158.json');
    copyFileSync(fileURLToPath(new URL('../' + prefix + 'progress-v158.json', import.meta.url)), document);
    for (const entry of current.historyWorkbooks) copyFileSync(fileURLToPath(new URL('../' + entry.path, import.meta.url)), join(directory, basename(entry.path)));
    for (let attempt = 0; attempt < 2; attempt++) {
      const output = JSON.parse(execFileSync('python3', [fileURLToPath(new URL('./generate-audit-continuation-v158.py', import.meta.url)), directory],
        { encoding: 'utf8', env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } }));
      assert.equal(output.sha256, current.workbookSha256);
      assert.deepEqual(readFileSync(join(directory, current.workbook)), bytes(current.workbook));
      assert.deepEqual(JSON.parse(readFileSync(document)), current);
      for (const entry of current.historyWorkbooks) assert.equal(sha(readFileSync(join(directory, basename(entry.path)))), entry.sha256);
    }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('only the three reviewed V158 documents are admitted and remain outside the distributed game', () => {
  for (const name of [current.workbook, 'progress-v158.json', 'V158-CONTINUATION.md']) {
    assert.equal(isPublicDistributionPathV86(prefix + name), true, name);
    assert.equal(isPublicDistributionPathV86(prefix + name, { built: true }), false, name);
  }
  assert.equal(isPublicDistributionPathV86(prefix + 'unreviewed-v158.xlsx'), false);
  assert.equal(isPublicDistributionPathV86(prefix + 'unreviewed-v158.json'), false);
  assert.deepEqual(readdirSync(new URL('../' + prefix, import.meta.url)).filter(name => /v158/i.test(name)).sort(),
    ['V158-CONTINUATION.md', 'XENO_TRIALS_SUIVI_V158.xlsx', 'progress-v158.json'].sort());
});
