/** Byte-anchored V162 -> V163 continuation; historical documents stay immutable. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const AUDIT_PREDECESSOR_DOCUMENTS_V163 = Object.freeze({
  "docs/forge/xeno-trials/V162-NON-FORGE-CONTINUATION.md": "a67a133e6cf8249cbc832c1ed6ff69eb6da18ecbe9a0993ffaaea015727949c2",
  "docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V162.xlsx": "994632af8d436fc1996eeec8b1f9fab20857391286bf81ba1b1f07a718e7ea72",
  "docs/forge/xeno-trials/progress-v162.json": "e6139378c57af0e2943ff98dad1fb4f1866c9de5dfc1dd50e46a1ff2415f000f"
});

export const AUDIT_DEFERRED_FORGE_SOURCES_V163 = Object.freeze({
  "src/forge-authoring-v133.js": "41a3f33249661d32caa841155d9947589ec9c6548068932553fb114c90ac3975",
  "src/forge-blueprints-v135.js": "dc91a4bb2250e6920740df0e89f087dbea1ab3c03f250259773f730cb8b161f3",
  "src/forge-campaign-ui-v161.js": "e9d82bc38f661260687e53affe1fb9c272ec7ec6906d645cb91034d6756ef01b",
  "src/forge-campaign-v161.js": "a0f7b6cd7f062d6b392d27befa55751a788959dcc00f01fc15c03c61ec967c12",
  "src/forge-construction-v135.css": "ee2d594d1a998272a34e57d591c101785c108ba0f710f2a6d82b2634ce5a48de",
  "src/forge-construction-v135.js": "718735298fd87d118c5739b9c157100bf5bd91ce3b913ae8c6c0eea6a7aefafe",
  "src/forge-control-v136.css": "631b345f60c7acbd5cf3ec47f516f259a0f0331a5d05dc307a0110f7303bdce1",
  "src/forge-control-v136.js": "eed31afd5468437a7a8b87078ca1f6ca2cf9bbf02fb6f3f783c077800321bf5f",
  "src/forge-decoration-v141.js": "8df7f9f306e2635547b4488198b1d3f6f815633999516bc5819d28cadff2cbfe",
  "src/forge-editor-base.js": "bcb438505c136e72d9c97ea05fca38331aac3738e935b2398dedd6ef0a946060",
  "src/forge-editor-v130.css": "26fbbe3ab81709df35eb90b0f3eca57829297673a935a1a3a95603a23fddedba",
  "src/forge-journey-admission-v141.js": "5bbc1fd5546e55c7f82c13d5f1b2962e8f49a00c5baf5c614b2a9ade81d14491",
  "src/forge-journey-v141.js": "415ec639f1fd2f7d57600f17f115de07cd30b99acf06e0c3328292490ced7a03",
  "src/forge-layout-v134.js": "8020db0f2e44328abbe535f978dc81f9a4ca93cf4da64a5294087e1ea34ae16d",
  "src/forge-mission-runtime-v141.js": "1335114f76ffd164a88bf6e2a8e7ef86d86d37ad36be726a8055cfc10a642cb0",
  "src/forge-model-v130.js": "9bc39547e1bb1b7add1489efab073d22302a64f6220a701eb6abcd1c084252c7",
  "src/forge-narrative-ui-v156.js": "766a0a9abf003514425260e361868701117831de3245289d97fae92d109fdaf4",
  "src/forge-narrative-v156.js": "2770cb180f398399193ea5074a9182fc51c08349029860a70a30a4ee74256ff7",
  "src/forge-navigator-v134.css": "6fe6df9faa252af683a6a0c8e47405905dd6ae5d9397332877e26f23c97d3f37",
  "src/forge-navigator-v134.js": "7a6517cbac3b19191d729ad07dd564541e349dff81af6c0827d0be479b31f62a",
  "src/forge-npcs-v158.js": "74866242ffe7d99b6b34771abf739fa639e46dac1b6b27712c3ca27eb68059b8",
  "src/forge-playtest-checkpoint-ui-v157.js": "85032efba0f8071afc69af9369682ce372c0ca6e718e6898c1ad456259ceafee",
  "src/forge-playtest-checkpoint-v157.js": "d7930fd9d9056970e63e02d54b6e70a3a4a00de931c26c7551db59ee15b4569c",
  "src/forge-playtest-v136.js": "71bba96af5b96be472c56a83166643dd1b62744f1a03328a87eb7d9b03d6676f",
  "src/forge-sandbox-v140.js": "8d8006ebf414c3a6402de3a7f2375fa3e17dcc712a55a494369bcb4ddc75827a",
  "src/forge-save-v62-base.js": "f7e758aee0731d0cb27274218d1a1dfbeac7905d8dcf964b069f374e39df7968",
  "src/forge-save-v62.js": "4d11c2a8ff64669b459675ec14c668344a216556dacaed3d28ce2ab245ac3bed",
  "src/forge-ship-runtime-v141.js": "20cf6a07e8deefcbdeefa276eb8d307f7abc9b6b55da9602195f43c5968cf32e",
  "src/forge-ui-v130.js": "d5bd35a344d577b0fce54649912ac71679fb5e09b78f274f77b326db6dd91378",
  "src/forge-versions-v136.js": "4e4d7a6db216a4d965dc5433272148dfa0792075c8472d69d17541a939c7be87",
  "src/forge-workbench-v133.css": "9fd1e811590d68cdfb135e3f16d073038a56c0157322984eec3a1404729dda0d",
  "src/forge-workbench-v133.js": "de6ff72f016b4b3dc91ddc8f8bb35656c59c0f7763b75d66c3259f48d3f9ed06"
});

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const keys = value => Object.keys(value).sort();
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);

/** V167 arsenal continuation has its own exact byte successor. Historical V163
 * receipts remain unchanged; arbitrary future changes still fail closed.
 * Baseline hashes refer to the actual V163 sources at 69c13e5.
 */
/** Pinned V167/V168 successors are verified byte-for-byte; prior V163 hashes are immutable. */
export const ARSENAL_V167_SUCCESSORS = Object.freeze({
  'src/game-production-runtime.js': Object.freeze({
    previousSha256: '710e0901b87b7961aa2bb661f138d16eb46d76b100ef2bc9913d7ebfbd143fde', currentSha256: '8e31b01c84ef7af0b810d3aa4d22afc429153f362627b9f31d0b7b6c75ad60fb'
  }),
  'src/weapon-actions-v130.js': Object.freeze({
    previousSha256: 'bed8071910771e0b017dedb2a842e435a47141c594126558f0eb65d907b22a10', currentSha256: 'f7ba5f603027c6d10fbf5f01eecf40e429f4d34a106c5fe6e5c306f4e6be933c'
  }),
  'src/weapon-actions-v131.js': Object.freeze({
    previousSha256: 'de53ad1d3e00099415407256fdbd7ff69d41b27a86b97b431e8f7d6e30a9d654', currentSha256: '4ff367efb3c919ba51fcb5595f119d54f462a3453dbd95ca1d6c40110f44172a'
  }),
  'src/tactical-reload-v77.js': Object.freeze({
    previousSha256: '73c3da2d2416a003600d5d54b4180f04f2456189eb5358ec452be6f4683eb982', currentSha256: 'f792032340ea32b017d3ffcfa935a4cd7fd1ec5eab277902e6c873aa49bb6dc3'
  }),
  'sw.js': Object.freeze({
    previousSha256: '732d8eca7c6a8e4443f5a4d26b6a4cd677f2ad5b3fc1c4e766b452606ce153e9', currentSha256: '956bb0319a903d5b18f10a76aadef648360e1ca48ead3fbc2a9bc21da889fc27'
  }),
  'src/app.js': Object.freeze({
    previousSha256: 'ac0404430bb38a08b454bcc30a4d85a6af1f0afb57a953552739039cdc8180dd', currentSha256: '85294f9e50a75dcbe9bd2be8d1d8b5c57ae1e46f8060a44dbf4544a545f5c022'
  }),
  'src/mission-input-v77.js': Object.freeze({
    previousSha256: 'cb6c9ed206e0e4e13fd4a1f367f6e0b8722932b768c903e9df6ee7e0e5c09846', currentSha256: 'c564966b27980c6733b7024fa832e6b8dd64e4441b08104a50f4c43e459d49b4'
  })
});

export const ARSENAL_V167_NEW_SOURCES = Object.freeze({
  'src/weapon-magazine-inventory-v167.js': '2f9c281f886c93c7640d10a85f1550a1320bdedbd6f63ba57185739acc856928',
  'src/weapon-mastery-v167.js': 'efa0d34da1fb3d26491257b9ec9a4b3fb76cc3342c7e4425247abd2d55e83f29',
  'scripts/verify-weapon-arsenal-v167.mjs': '00ea47ff30bead48a1272689482cfd659a7f9b204343b0956a9a281687dfb509',
  'src/weapon-magazine-world-v168.js': '6024a584079bf6bac0d83ccc439e810afb4d6aadc33990d51ce72fcae715962a',
  'src/weapon-magazine-recovery-runtime-v168.js': '4dbf78d2a4aa096125dada27b2b5fff05c1b927777f705eaf7d57f7626b88889',
  'src/weapon-attachments-v168.js': '08462193b55e18132dbf14b72d1f50dc07a10bd4be6bf0b70cad83ec0338306d',
  'scripts/verify-weapon-magazine-world-v168.mjs': '3000f9087c459358c2ad59714283075e722c21ab88110c254434830652612a64',
  'scripts/verify-weapon-attachments-v168.mjs': '9021a0adf8c3037bc29e26812011d8988e0323adddd04e7c645103a8f088e9fe'
});


/** One maintenance correction follows the frozen Forge scope; it does not reopen that scope. */
export function verifyGamedevCorrectionV163(current, readSource = readRepository) {
  if (!Object.hasOwn(current, 'followupGamedev20261029')) return Object.freeze({});
  const record = current.followupGamedev20261029;
  assert.ok(record && typeof record === 'object' && !Array.isArray(record));
  assert.deepEqual(keys(record), ['baselineCommit', 'corrections', 'id', 'releaseEvidence',
    'runtimeValidation', 'schema', 'scope', 'state'].sort());
  assert.equal(record.schema, 1);
  assert.equal(record.id, 'GAMEDEV-20261029-FORGE-ADMISSION');
  assert.equal(record.baselineCommit, 'ffea37ad83ef1fa1fdd0a1e0549b4b4035bb4c52');
  assert.equal(record.state, 'PREPUBLICATION');
  assert.equal(record.runtimeValidation, 'REQUIRES_OWN_EXACT_HEAD_RECEIPTS');
  assert.deepEqual(record.scope, { existingModuleMaintenance: true, newForgeRuntimeModules: 0,
    deferredForgePrioritiesReopened: 0, historicalForgeScope: 'V163' });
  assert.deepEqual(record.releaseEvidence, { nodeSuite: null, nativeCandidate: null, ci: null, review: null, merge: null });
  assert.ok(Array.isArray(record.corrections) && record.corrections.length === 1,
    'Exactly one Forge admission correction is authorized by this continuation');
  const correction = record.corrections[0];
  assert.ok(correction && typeof correction === 'object' && !Array.isArray(correction));
  assert.deepEqual(keys(correction), ['currentSha256', 'path', 'previousSha256', 'reason', 'verifier'].sort());
  const path = 'src/forge-journey-admission-v141.js';
  const previousSha256 = AUDIT_DEFERRED_FORGE_SOURCES_V163[path];
  assert.equal(correction.path, path, 'The maintenance continuation cannot admit another runtime path');
  assert.equal(correction.previousSha256, previousSha256);
  assert.equal(current.deferredForge?.sourceSha256?.[path], previousSha256);
  assert.equal(current.followupV165?.runtimeV164SourceSha256?.[path], previousSha256);
  assert.ok(validHash(correction.currentSha256));
  assert.notEqual(correction.currentSha256, previousSha256, 'A correction must identify changed source bytes');
  assert.equal(current.runtimeSourceSha256?.[path], correction.currentSha256);
  assert.ok(typeof correction.reason === 'string' && correction.reason.trim().length >= 60,
    'Explain the concrete admission behavior corrected after the historical Forge scope');
  const verifier = correction.verifier;
  assert.ok(verifier && typeof verifier === 'object' && !Array.isArray(verifier));
  assert.deepEqual(keys(verifier), ['path', 'sha256']);
  assert.equal(verifier.path, 'scripts/verify-forge-admission-v141.mjs');
  assert.ok(validHash(verifier.sha256));
  assert.equal(sha(readSource(path)), correction.currentSha256, 'Unreviewed Forge correction bytes: ' + path);
  assert.equal(sha(readSource(verifier.path)), verifier.sha256, 'Unreviewed Forge correction verifier bytes');
  return Object.freeze({ [path]: correction.currentSha256 });
}

function anchoredPredecessor(previous, readSource) {
  let anchored;
  for (const [path, expected] of Object.entries(AUDIT_PREDECESSOR_DOCUMENTS_V163)) {
    const bytes = readSource(path);
    assert.equal(sha(bytes), expected, 'Historical V162 document changed: ' + path);
    if (path.endsWith('/progress-v162.json')) anchored = JSON.parse(bytes);
  }
  assert.deepEqual(previous, anchored, 'Previous contract must be the byte-anchored V162 public record');
}

export const AUDIT_PRIORITY_IDS_V163 = Object.freeze([
  "verification-latest-ci",
  "trials-presentation-unmapped",
  "trials-capture-human",
  "trials-reference-and-art",
  "trials-roster-extension",
  "trials-remaining-pilot-art",
  "forge-narrative-events",
  "forge-test-persistence",
  "campaigns-not-playable",
  "costume-art",
  "excel-identity-and-motion",
  "master-encyclopedia-source",
  "dlc-v10-sources",
  "legacy-backlog-triage",
  "annex-crew-coverage",
  "trials-spatial-exit",
  "broodstorm-resume-projectile"
]);

export function verifyAuditCoverageV163(previous, current) {
  const classes = new Set(['REALISABLE_MAINTENANT', 'VERIFICATION_NECESSAIRE', 'REFERENCES_MEDIAS_ABSENTS', 'FORGE_DIFFEREE']);
  const taskIds = [...previous.inheritedPresentationIds, ...previous.inheritedArt153Ids];
  assert.equal(taskIds.length, 68);
  const rows = current.tables?.['24_CouvertureV163']?.rows;
  assert.ok(Array.isArray(rows));
  assert.deepEqual(rows.map(row => [row[0], row[1]]), [
    ...taskIds.map(id => ['task', id]), ...AUDIT_PRIORITY_IDS_V163.map(id => ['priority', id])]);
  const counts = {};
  for (const row of rows) {
    assert.equal(row.length, 12);
    assert.ok(classes.has(row[4]), 'Unknown need category: ' + row[1]);
    assert.ok(typeof row[5] === 'string' && row[5].trim(), 'Coverage owner missing: ' + row[1]);
    for (const index of [6, 7, 8]) assert.ok(typeof row[index] === 'string' && row[index].trim(), 'Coverage state/limit/action missing: ' + row[1]);
    assert.equal(row[4] === 'FORGE_DIFFEREE', row[1].startsWith('forge-'));
    assert.deepEqual(row.slice(-2), [0, 0]);
    counts[row[4]] = (counts[row[4]] || 0) + 1;
  }
  assert.deepEqual(current.coverageV163.classifications, counts);
  assert.deepEqual([current.coverageV163.tasks, current.coverageV163.priorities, current.coverageV163.roster,
    current.coverageV163.rows, current.coverageV163.unownedRows], [68, 17, 189, 85, 0]);
  assert.equal(current.coverageV163.notACompletionClaim, true);
  const roster = current.tables?.['25_RosterEtatV163']?.rows;
  assert.deepEqual(roster.map(row => row[0]), previous.rosterIds);
  const pilots = new Set(['prowler', 'import-game-dd-wy-commando', 'import-game-dd-guardian', 'dd-darwin-era-cultist']);
  for (const row of roster) {
    assert.equal(row.length, 7);
    assert.equal(row[1], pilots.has(row[0]));
    assert.ok(classes.has(row[2]) && typeof row[3] === 'string' && row[3].trim() && typeof row[4] === 'string' && row[4].trim());
    assert.deepEqual(row.slice(-2), [0, 0]);
  }
  const assets = current.projectAssetCoverageV163;
  assert.deepEqual(assets.roster.map(row => row.id), previous.rosterIds);
  assert.equal(assets.observedBaselineCommit, current.baseCommit);
  assert.deepEqual([assets.spritesPresent, assets.spritesMissing, assets.dedicatedRigsAtBaseline, assets.withoutDedicatedRigAtBaseline], [189, 0, 4, 185]);
  for (const row of assets.roster) {
    assert.match(row.path, /^assets\/[a-zA-Z0-9_./-]+\.png$/);
    assert.ok(!row.path.includes('..'));
    assert.match(row.sha256, /^[a-f0-9]{64}$/);
    assert.equal(row.exists, true);
    assert.equal(Boolean(row.dedicatedRigAtBaseline), pilots.has(row.id));
    assert.equal(typeof row.newScopedPresentationRigV163, 'boolean');
    assert.equal(row.newFullLocomotionV163, false);
    if (row.newScopedPresentationRigV163) {
      assert.equal(row.dedicatedRigAtBaseline, false);
      assert.equal(row.newRigSourceSha256, row.sha256);
      assert.equal(row.newRigAdmissionScope, 'presentation-upper-body-fixed-support');
    } else {
      assert.equal(row.newRigSourceSha256, null);
      assert.equal(row.newRigAdmissionScope, null);
    }
    assert.equal(row.approved1to1, false);
  }
  const newRigCount = assets.roster.filter(row => row.newScopedPresentationRigV163).length;
  assert.equal(assets.newScopedPresentationRigsV163, newRigCount);
  assert.equal(assets.remainingScopedPresentationRigAuthoringV163, 185 - newRigCount);
  assert.equal(assets.newFullLocomotionAdmissionsV163, 0);
  assert.deepEqual([assets.costumeSets, assets.completeCostumeSetsAtBaseline, assets.missingDedicatedCostumeSetsAtBaseline], [31, 1, 30]);
  assert.equal(assets.countsAreCurrentRuntimeResults, false);
  assert.equal(current.documentaryReferencesV163.length, current.newExternalSourcesRetrieved);
  assert.equal(current.documentaryReferencesV163.length, 13);
  assert.equal(new Set(current.documentaryReferencesV163.map(row => row.id)).size, 13);
  for (const reference of current.documentaryReferencesV163) {
    assert.match(reference.url, /^https:\/\//);
    assert.match(reference.sourceSnapshotSha256, /^[a-f0-9]{64}$/);
    assert.equal(reference.status, 'CONTENT_REVIEWED_DOCUMENTARY_REFERENCE');
    assert.equal(reference.assetReuseLicenceEstablished, false);
    assert.equal(reference.motion1to1Established, false);
    assert.equal(reference.rawArchiveRecovered, false);
  }
  const streams = current.newWorkstreamsV163;
  assert.ok(Array.isArray(streams) && streams.length > 0);
  assert.equal(new Set(streams.map(row => row.id)).size, streams.length);
  assert.deepEqual(current.tables['23_ChantiersV163'].rows.map(row => row[0]), streams.map(row => row.id));
  for (const stream of streams) {
    assert.match(stream.id, /^C163-[A-Z0-9-]+$/);
    assert.ok(stream.implementedScope && stream.limits && stream.profileNames?.length);
    assert.equal(new Set(stream.profileNames).size, stream.profileNames.length);
    assert.ok(!stream.priorityLinks.some(id => id.startsWith('forge-')));
    assert.ok(stream.priorityLinks.every(id => AUDIT_PRIORITY_IDS_V163.includes(id)));
    for (const path of stream.modules) assert.ok(Object.hasOwn(current.runtimeSourceSha256, path));
  }
  return Object.freeze({ tasks: 68, priorities: 17, roster: 189, rows: 85, unowned: 0 });
}

export function verifyAuditSuccessionV163(previous, current, readSource = readRepository) {
  anchoredPredecessor(previous, readSource);
  assert.equal(previous.lot, 'V162');
  assert.equal(current?.lot, 'V163');
  assert.equal(current.publicationState, 'PREPUBLICATION');
  verifyAuditCoverageV163(previous, current);
  const bridge = current.runtimeSuccession;
  assert.equal(bridge?.schema, 1);
  assert.equal(bridge.from, 'V162');
  assert.equal(bridge.to, 'V163');
  assert.deepEqual(bridge.predecessorDocuments, AUDIT_PREDECESSOR_DOCUMENTS_V163);
  assert.equal(current.deferredForge?.state, 'DEFERRED_BY_USER');
  assert.deepEqual(current.deferredForge.sourceSha256, AUDIT_DEFERRED_FORGE_SOURCES_V163);
  const corrections = verifyGamedevCorrectionV163(current, readSource);
  for (const [path, expected] of Object.entries(AUDIT_DEFERRED_FORGE_SOURCES_V163))
    assert.equal(sha(readSource(path)), corrections[path] ?? expected, 'Deferred Forge module changed: ' + path);
  const before = previous.runtimeSourceSha256, after = current.runtimeSourceSha256;
  assert.equal(keys(before).length, 87);
  assert.ok(after && keys(after).length >= 87);
  for (const path of keys(before)) assert.ok(Object.hasOwn(after, path), 'Inherited V162 source omitted: ' + path);
  for (const [path, expected] of Object.entries(after)) {
    assert.ok(/^src\/[a-zA-Z0-9._-]+\.(?:js|css)$/.test(path)
      || /^[a-zA-Z0-9._-]+\.css$/.test(path) || ['index.html', 'sw.js'].includes(path),
    'Source path outside the reviewed runtime scope: ' + path);
    assert.ok(validHash(expected), 'Invalid source hash: ' + path);
    const successor = Object.hasOwn(ARSENAL_V167_SUCCESSORS, path) ? ARSENAL_V167_SUCCESSORS[path] : null;
    if (successor) {
      assert.equal(expected, successor.previousSha256, 'Incorrect V163 baseline for V167 successor: ' + path);
      assert.equal(sha(readSource(path)), successor.currentSha256, 'Unreviewed V167 runtime successor: ' + path);
    } else {
      assert.equal(sha(readSource(path)), expected, 'Current V163 source changed: ' + path);
    }
  }
  // New V167 modules are not retroactively called historical V163 sources.
  for (const [path, expected] of Object.entries(ARSENAL_V167_NEW_SOURCES))
    assert.equal(sha(readSource(path)), expected, 'Unreviewed V167 added source: ' + path);
  const changed = keys(before).filter(path => before[path] !== after[path]);
  const added = keys(after).filter(path => !Object.hasOwn(before, path));
  for (const path of [...changed, ...added]) assert.ok(!path.startsWith('src/forge') || Object.hasOwn(corrections, path),
    'Forge is deferred by the user outside the verified maintenance correction: ' + path);
  assert.ok(Array.isArray(bridge.transitions) && Array.isArray(bridge.addedSources));
  assert.deepEqual(bridge.transitions.map(row => row.path), changed, 'Declare every changed inherited V162 source exactly once');
  assert.deepEqual(bridge.addedSources.map(row => row.path), added, 'Declare every new V163 source exactly once');
  for (const row of [...bridge.transitions, ...bridge.addedSources]) {
    assert.equal(row.previousSha256, before[row.path] ?? null);
    assert.equal(row.currentSha256, after[row.path]);
    assert.equal(typeof row.reason, 'string');
    assert.ok(row.reason.trim().length >= 24, 'Explain the deliberate change: ' + row.path);
    assert.ok(Array.isArray(row.verifiers) && row.verifiers.length > 0);
    assert.equal(new Set(row.verifiers).size, row.verifiers.length);
    for (const verifier of row.verifiers) {
      assert.match(verifier, /^scripts\/verify-[a-zA-Z0-9._-]+\.mjs$/);
      assert.ok(readSource(verifier).length > 0, 'Missing behavioral verifier: ' + verifier);
    }
  }
  return Object.freeze({ inherited: 87, changed: changed.length, unchanged: 87 - changed.length,
    added: added.length, current: keys(after).length });
}

/** A missing successor preserves the anchored record; invalid content never falls back. */
export function resolveAuditSourcesV163(previous, readSource = readRepository, { effective = false } = {}) {
  anchoredPredecessor(previous, readSource);
  let current;
  try {
    current = JSON.parse(readSource('docs/forge/xeno-trials/progress-v163.json'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return previous.runtimeSourceSha256;
  }
  verifyAuditSuccessionV163(previous, current, readSource);
  // Never mutate V163 archival hashes. An explicit effective read exports the
  // exact, previously validated successor set to legacy audit callers.
  return effective ? Object.freeze({ ...current.runtimeSourceSha256,
    ...Object.fromEntries(Object.entries(ARSENAL_V167_SUCCESSORS).map(([path, receipt]) => [path, receipt.currentSha256])) })
    : current.runtimeSourceSha256;
}

export function loadAuditSuccessionV163(readSource = readRepository) {
  const previous = JSON.parse(readSource('docs/forge/xeno-trials/progress-v162.json'));
  const current = JSON.parse(readSource('docs/forge/xeno-trials/progress-v163.json'));
  return { previous, current, result: verifyAuditSuccessionV163(previous, current, readSource) };
}
