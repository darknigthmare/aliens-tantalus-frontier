/** Cumulative source/document guards; these tests do not certify native play. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { verifyAuditSuccessionV163, verifyGamedevCorrectionV163, resolveAuditSourcesV163,
  V165_VERIFIER_SUCCESSORS_V171, V165_VERIFIER_SUCCESSORS_V173,
  V165_VERIFIER_SUCCESSORS_V174, V165_VERIFIER_SUCCESSORS_V176,
  V165_VERIFIER_SUCCESSORS_V177, V165_VERIFIER_SUCCESSORS_V178,
  HUB_V179_SERVICE_SUCCESSOR, HUB_V187_SERVICE_SUCCESSOR,
  V165_VERIFIER_SUCCESSORS_V188 } from './audit-succession-v163.mjs';
import { XENO_TRIALS_RIG_DATA_V165 } from '../src/xeno-trials-rig-data-v165.js';
import { PLAYER_COSTUME_SKINS_V165 } from '../src/player-costume-atlases-v165.js';
import { PLAYER_COSTUME_OUTFITS_V165, PLAYER_COSTUME_LINKED_OUTFITS_V165,
  PLAYER_COSTUME_EQUIPPABLE_OUTFITS_V165 } from '../src/player-costume-outfits-v165.js';
import { PLAYER_COSTUME_PART_ASSETS_V165 } from '../src/player-costume-parts-v165.js';
import { PLAYER_COSTUME_ASSETS_V119, getPlayerCostumeSkinV119 } from '../src/player-costume-skins-v119.js';
import { HUB_ROOM_SERVICE_DETAILS_V165 } from '../src/hub-room-service-details-v165.js';
import { isPublicDistributionTextV86 } from './verify-public-release-v86.mjs';

const prefix = 'docs/forge/xeno-trials/';
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const previous = JSON.parse(read(prefix + 'progress-v162.json'));
const current = JSON.parse(read(prefix + 'progress-v163.json'));
const canonicalMap = map => JSON.stringify(Object.fromEntries(Object.keys(map).sort().map(key => [key, map[key]])));
const source164 = '21b70e140a44775f9f5cb49809d0ca0a5c2abf29';
const merge164 = 'ebbdbb6520e4d76054c3c6d175c9a7a26b07e02d';
const streamIds = ['C165-COSTUMES', 'C165-RIGS', 'C165-ROUTES', 'C165-ARCHIVES', 'C165-PLAYER', 'C165-SHIP'];
const ciWorkstreams = ['campaign', 'crew-lifts', 'crew-leases', 'weapons-title', 'trials',
  'player-v165', 'ship-v165', 'costumes-v165', 'rigs-v165', 'workposts-v165',
  'cal-v165', 'david-v165', 'inez-v165', 'maksim-v165', 'jun-v165'];

test('V165 current provenance and development guide satisfy the source text admission guard', () => {
  for (const path of [prefix + 'progress-v163.json', 'docs/development/GAMEDEV_GUIDANCE.md'])
    assert.equal(isPublicDistributionTextV86(read(path).toString()), true,
      'Private source metadata in tracked development documentation: ' + path);
});

export function verifyParallelCompletionV165(record, readSource = read) {
  const followup = record.followupV165;
  assert.equal(record.publicationState, 'PREPUBLICATION');
  assert.equal(followup?.state, 'PREPUBLICATION');
  assert.equal(followup.runtimeValidation, 'REQUIRES_OWN_EXACT_HEAD_RECEIPTS');
  assert.equal(followup.historicalV163ResultsTransferred, false);
  assert.equal(followup.historicalV164ResultsTransferred, false);
  assert.deepEqual(followup.historicalSource, {
    sourceCommit: source164, mergeCommit: merge164,
    progressSha256: 'c54f3d6f3eb66dbfeee15906e2d03ed412574c2d56e5db3775cbcdc7ec17d897',
    runtimeMapSha256: '3291754a3764eed94bff29428fb85ad8f5aed3218be2806ed780b0deed53385f'
  });
  assert.equal(sha(canonicalMap(followup.runtimeV164SourceSha256)), followup.historicalSource.runtimeMapSha256,
    'The delivered V164 source map is immutable, independent of current source bytes');
  const corrections = verifyGamedevCorrectionV163(record, readSource);
  // The reviewed modern source hashes are a separate, exact successor chain.
  // V165's recorded map remains historical and is never rewritten to today's bytes.
  const effective = resolveAuditSourcesV163(previous, readSource, { effective: true });
  const before = followup.runtimeV164SourceSha256, after = record.runtimeSourceSha256;
  assert.equal(Object.keys(before).length, 105);
  for (const path of Object.keys(before)) assert.ok(Object.hasOwn(after, path), 'Omitted V164 source: ' + path);
  const changed = Object.keys(after).filter(path => before[path] !== after[path]).sort();
  assert.deepEqual(followup.sourceChanges.map(row => row.path), changed, 'Every changed/new V165 source is declared once');
  assert.equal(followup.runtimeSourceCount, Object.keys(after).length);
  const requiredVerifiers = new Set();
  for (const row of followup.sourceChanges) {
    assert.ok(!row.path.startsWith('src/forge') || Object.hasOwn(corrections, row.path),
      'Forge is deferred outside the verified maintenance correction');
    assert.equal(row.previousSha256, before[row.path] ?? null);
    assert.equal(row.currentSha256, after[row.path]);
    const corrected = row.path === HUB_V179_SERVICE_SUCCESSOR.path
      ? HUB_V187_SERVICE_SUCCESSOR : null;
    if (corrected) assert.equal(row.currentSha256, HUB_V179_SERVICE_SUCCESSOR.previousSha256,
      'V187 cannot rewrite the historical V165/V179 service receipts: ' + row.path);
    assert.equal(sha(readSource(row.path)),
      corrected?.currentSha256 ?? effective[row.path] ?? row.currentSha256,
      corrected ? 'Unreviewed V187 service successor: ' + row.path
        : 'Unexpected undeclared source successor: ' + row.path);
    assert.ok(row.reason.startsWith('V165 :') && row.reason.trim().length >= 60);
    assert.ok(row.verifiers.length > 0 && new Set(row.verifiers).size === row.verifiers.length);
    row.verifiers.forEach(verifier => requiredVerifiers.add(verifier));
  }
  assert.deepEqual(record.newWorkstreamsV165.map(row => row.id), streamIds);
  assert.deepEqual(record.tables['26_ChantiersV165'].rows.map(row => row[0]), streamIds);
  for (const stream of record.newWorkstreamsV165) {
    assert.ok(stream.scope && stream.limits && stream.verifiers.length);
    assert.equal(stream.releaseValidation, 'REQUIRES_OWN_EXACT_HEAD_RECEIPTS');
    assert.equal(stream.artClosed, 0); assert.equal(stream.approved1to1, 0);
    for (const module of stream.modules) assert.ok(Object.hasOwn(after, module), module);
    for (const verifier of stream.verifiers) requiredVerifiers.add(verifier);
    for (const driver of stream.qa) assert.ok(readSource(driver).length > 0, driver);
  }
  for (const verifier of requiredVerifiers) {
    assert.match(verifier, /^scripts\/verify-[a-zA-Z0-9._-]+\.mjs$/);
    const legacy = V165_VERIFIER_SUCCESSORS_V171[verifier];
    const revision = V165_VERIFIER_SUCCESSORS_V173[verifier];
    const next = V165_VERIFIER_SUCCESSORS_V174[verifier];
    const v176 = V165_VERIFIER_SUCCESSORS_V176[verifier];
    const v177 = V165_VERIFIER_SUCCESSORS_V177[verifier];
    const v178 = V165_VERIFIER_SUCCESSORS_V178[verifier];
    const v188 = V165_VERIFIER_SUCCESSORS_V188[verifier];
    if (revision) assert.equal(revision.previousSha256, legacy?.currentSha256,
      'Invalid V171-to-V173 verifier successor: ' + verifier);
    if (next) assert.equal(next.previousSha256, (revision || legacy)?.currentSha256,
      'Invalid V173/V171-to-V174 verifier successor: ' + verifier);
    if (v176) assert.equal(v176.previousSha256, (next || revision || legacy)?.currentSha256,
      'Invalid V174-to-V176 verifier successor: ' + verifier);
    if (v177) assert.equal(v177.previousSha256,
      (v176 || next || revision || legacy)?.currentSha256,
      'Invalid V173-to-V177 parallel verifier successor: ' + verifier);
    if (v178) assert.equal(v178.previousSha256,
      (v177 || v176 || next || revision || legacy)?.currentSha256,
      'Invalid V176-to-V178 audit verifier successor: ' + verifier);
    if (v188) assert.equal(v188.previousSha256,(v178 || v177 || v176 || next || revision || legacy)?.currentSha256,
      'Invalid V177-to-V188 parallel verifier successor: ' + verifier);
    const successor = v188 || v178 || v177 || v176 || next || revision || legacy;
    if (legacy) assert.equal(record.verifierSourceSha256V165[verifier], legacy.previousSha256,
      'Untrusted V165 original verifier receipt: ' + verifier);
    assert.equal(sha(readSource(verifier)), successor?.currentSha256 ?? record.verifierSourceSha256V165[verifier],
      'Unreviewed verifier bytes: ' + verifier);
  }
  for (const [verifier, expected] of Object.entries(record.verifierSourceSha256V165)) {
    const legacy = V165_VERIFIER_SUCCESSORS_V171[verifier];
    const revision = V165_VERIFIER_SUCCESSORS_V173[verifier];
    const next = V165_VERIFIER_SUCCESSORS_V174[verifier];
    const v176 = V165_VERIFIER_SUCCESSORS_V176[verifier];
    const v177 = V165_VERIFIER_SUCCESSORS_V177[verifier];
    const v178 = V165_VERIFIER_SUCCESSORS_V178[verifier];
    const v188 = V165_VERIFIER_SUCCESSORS_V188[verifier];
    if (revision) assert.equal(revision.previousSha256, legacy?.currentSha256,
      'Invalid V171-to-V173 verifier successor: ' + verifier);
    if (next) assert.equal(next.previousSha256, (revision || legacy)?.currentSha256,
      'Invalid V173/V171-to-V174 verifier successor: ' + verifier);
    if (v176) assert.equal(v176.previousSha256, (next || revision || legacy)?.currentSha256,
      'Invalid V174-to-V176 verifier successor: ' + verifier);
    if (v177) assert.equal(v177.previousSha256,
      (v176 || next || revision || legacy)?.currentSha256,
      'Invalid V173-to-V177 parallel verifier successor: ' + verifier);
    if (v178) assert.equal(v178.previousSha256,
      (v177 || v176 || next || revision || legacy)?.currentSha256,
      'Invalid V176-to-V178 audit verifier successor: ' + verifier);
    if (v188) assert.equal(v188.previousSha256,(v178 || v177 || v176 || next || revision || legacy)?.currentSha256,
      'Invalid V177-to-V188 parallel verifier successor: ' + verifier);
    const successor = v188 || v178 || v177 || v176 || next || revision || legacy;
    if (legacy) assert.equal(legacy.previousSha256, expected, 'Incorrect V165 verifier predecessor');
    assert.equal(sha(readSource(verifier)), successor?.currentSha256 ?? expected, verifier);
  }
  assert.deepEqual(followup.releaseEvidence, { nodeSuite: null, nativeCandidate: null, ci: null, review: null, merge: null });
  assert.deepEqual([followup.artClosed, followup.approved1to1, followup.humanParticipants], [0, 0, 0]);
  assert.equal(followup.forgeState, 'DEFERRED_BY_USER');
  assert.equal(followup.forgePrioritiesDeferred, 2);
  assert.equal(record.deferredForge.state, 'DEFERRED_BY_USER');
  assert.equal(followup.rigs.newFullWalkAdmissions, 0);
  assert.equal(followup.costumes.newPlayablePrecompositedSkins, 0);
  assert.equal(followup.npcRoutes.routesClosedByThisDocument, 0);
  assert.deepEqual([followup.newArchivesRecovered, followup.existingSourcesReverified], [0, 62]);
  assert.equal(followup.driveContents, 'UNKNOWN');
  assert.equal(followup.chatgptCurrentAttempt, 'NO_USABLE_RETURNED_DATA');
  const ci = followup.ciPlan;
  assert.equal(ci.state, 'CONFIGURED_NOT_VALIDATED');
  assert.deepEqual([ci.applicableWorkflows, ci.historicalContinuationJobs, ci.newContinuationJobs, ci.totalContinuationJobs], [5, 5, 10, 15]);
  assert.deepEqual(ci.workstreams, ciWorkstreams);
  assert.equal(ci.workflow, '.github/workflows/non-forge-regression-v163.yml');
  assert.equal(ci.conclusion, null);
  const workflow = readSource(ci.workflow);
  assert.equal(sha(workflow), ci.workflowSha256, 'CI configuration changed after documentary freeze');
  const matrix = workflow.toString().match(/workstream:\s*\[([^\]]+)\]/);
  assert.ok(matrix);
  assert.deepEqual(matrix[1].split(',').map(value => value.trim()), ciWorkstreams);
  return { streams: 6, inheritedRuntimeSources: 105, currentRuntimeSources: Object.keys(after).length, changed: changed.length };
}

test('V177 parallel verifier is source pinned without changing historical V165/V173 receipts', () => {
  const name='scripts/verify-parallel-completion-v165.mjs';
  assert.deepEqual(Object.keys(V165_VERIFIER_SUCCESSORS_V177),[name]);
  const pin=V165_VERIFIER_SUCCESSORS_V177[name];
  assert.equal(pin.previousSha256,V165_VERIFIER_SUCCESSORS_V173[name].currentSha256);
  const latest=V165_VERIFIER_SUCCESSORS_V188[name];
  assert.equal(latest.previousSha256,pin.currentSha256);
  assert.equal(sha(read(name)),latest.currentSha256);
  const corrupted=path=>path===name?Buffer.concat([read(path),Buffer.from('UNREVIEWED')]):read(path);
  assert.throws(()=>verifyParallelCompletionV165(current,corrupted),
    /Unreviewed V177 cumulative verifier successor|Unreviewed verifier bytes/);
});

test('V187 armory wall service clears native circulation reservations and storefront', () => {
  const receipt = HUB_V187_SERVICE_SUCCESSOR;
  assert.equal(receipt.path,'src/hub-room-service-details-v165.js');
  assert.equal(receipt.previousSha256,HUB_V179_SERVICE_SUCCESSOR.currentSha256);
  assert.equal(current.runtimeSourceSha256[receipt.path],HUB_V179_SERVICE_SUCCESSOR.previousSha256);
  assert.equal(sha(read(receipt.path)),receipt.currentSha256);
  const box=HUB_ROOM_SERVICE_DETAILS_V165.armory;
  assert.equal(box.x,receipt.correctedCenterX);
  assert.equal(box.w,96);
  assert.equal(box.h,42);
  assert.equal(box.y,receipt.correctedTopY);
  assert.ok(box.x-box.w/2>1040,'Panel left edge must clear native issue records');
  assert.ok(box.x+box.w/2<1152,'Panel right edge must clear east transition');
  assert.ok(box.y>280,'Panel must sit below V169 front canopy');
  assert.ok(box.y+box.h<406,'Panel must sit above V169 storage casiers');
  const corrupted=path=>path===receipt.path?Buffer.concat([read(path),Buffer.from('V179-UNREVIEWED')]):read(path);
  assert.throws(()=>verifyParallelCompletionV165(current,corrupted),
    /Unreviewed V187 armory service location|Unreviewed V187 service successor/);
});

test('V165 cumulative pins preserve the byte-anchored V162 bridge and the immutable V164 runtime map', () => {
  verifyAuditSuccessionV163(previous, current);
  const result = verifyParallelCompletionV165(current);
  assert.equal(result.streams, 6);
  assert.equal(result.inheritedRuntimeSources, 105);
  assert.ok(result.currentRuntimeSources > 105);
});

test('V164 alpha, Trials supplement and CI remain delivered historical scopes, separate from V165', () => {
  const historical = current.historicalDeliveryV164;
  assert.equal(historical.status, 'MERGED_AND_INVENTORY_FINALIZED');
  assert.equal(historical.reviewedHead, source164); assert.equal(historical.mainMerge, merge164);
  assert.deepEqual([historical.nodeTests, historical.nodeFiles], [3003, 172]);
  assert.deepEqual(historical.alpha, { automatedBrowserChecks: 61, captures: 26, nativeJourneys: 5, separateRenderingFixtures: 16 });
  assert.deepEqual(historical.trialsSupplement, { automatedBrowserChecks: 65, captures: 42, nativeDuels: 6, keptSeparateFromAlpha: true });
  assert.deepEqual(historical.ci, { workflows: 4, jobs: 8, conclusion: 'success', productionHttpIdentityEstablished: false });
  assert.equal(historical.countsAreCurrentV165Results, false);
  assert.equal(historical.notAHumanPlaytest, true); assert.equal(historical.artistic1to1Approved, false);
  assert.equal(current.followupV164.runtimeValidation, 'REQUIRES_OWN_EXACT_HEAD_RECEIPTS');
  assert.ok(current.tables['07_Recette'].rows.every(row => row[2].startsWith('V164 :')));
  assert.equal(current.historicalRecipeV164.alias, '07_RecetteV164');
  assert.equal(sha(JSON.stringify(current.tables['07_Recette'])), current.historicalRecipeV164.tableSha256);
  assert.equal(current.inheritedTablesFromV162.length, 19);
  assert.equal(current.historyWorkbooks.length, 17);
  assert.equal(current.rosterIds.length, 189);
  assert.equal(current.inheritedPresentationIds.length + current.inheritedArt153Ids.length, 68);
  for (const name of current.inheritedTablesFromV162) assert.deepEqual(current.tables[name], previous.tables[name]);
  for (const item of current.historyWorkbooks) assert.equal(sha(read(item.path)), item.sha256);
});

test('V165 counts describe actual limited presentation rigs, separated clothing and rear-wall details', () => {
  const f = current.followupV165;
  assert.equal(XENO_TRIALS_RIG_DATA_V165.length, 170);
  assert.equal(new Set(XENO_TRIALS_RIG_DATA_V165.map(row => row.fighterId)).size, 170);
  assert.deepEqual(f.rigs, { newScopedPresentation: 170, historicalPresentation: 19, totalPresentationIdentities: 189, newFullWalkAdmissions: 0 });
  assert.equal(PLAYER_COSTUME_OUTFITS_V165.length, 10);
  assert.equal(PLAYER_COSTUME_LINKED_OUTFITS_V165.length, 2);
  assert.equal(PLAYER_COSTUME_EQUIPPABLE_OUTFITS_V165.length, 12);
  assert.equal(new Set(PLAYER_COSTUME_EQUIPPABLE_OUTFITS_V165.map(row => row.costumeId)).size, 12);
  assert.deepEqual(PLAYER_COSTUME_OUTFITS_V165.map(row => row.slug), ['amanda-working', 'working-joe-uniform',
    'sevastopol-security', 'ripley-bomber', 'bishop-utility', 'fireteam-seegson-maintenance',
    'fireteam-nostromo-jacket', 'fireteam-flightsuit', 'vasquez-bdu', 'rain-jacket']);
  const parts = PLAYER_COSTUME_PART_ASSETS_V165;
  assert.equal(parts.length, 21);
  for (const asset of parts) assert.equal(sha(read(asset.path.slice(1))), asset.sha256);
  assert.equal(PLAYER_COSTUME_ASSETS_V119.length, 5);
  for (const asset of PLAYER_COSTUME_ASSETS_V119) assert.equal(sha(read(asset.path.slice(1))), asset.sha256);
  for (const outfit of PLAYER_COSTUME_EQUIPPABLE_OUTFITS_V165)
    assert.equal(getPlayerCostumeSkinV119(outfit.costumeId), null, 'A new or linked modular kit cannot fall back to the precomposited M41A skin');
  const previews = PLAYER_COSTUME_SKINS_V165.flatMap(row => row.atlases);
  assert.equal(previews.length, 15);
  assert.equal(previews.reduce((sum, row) => sum + row.frames.length, 0), 240);
  for (const skin of PLAYER_COSTUME_SKINS_V165) {
    assert.equal(skin.admission, 'reference-preview-only-not-playable-skin');
    assert.equal(skin.exact, false);
  }
  assert.deepEqual(f.costumes, { requestedFranchiseReferences: 30, newModularOutfits: 10, linkedExistingV129Presets: 2,
    equippableFranchiseReferences: 12, remainingFranchiseReferencesOpen: 18, separatedPartPngs: 21,
    historicalNostromoPngsUnchanged: 5, referencePreviewAtlases: 15, referencePreviewCells: 240, newPlayablePrecompositedSkins: 0 });
  assert.equal(Object.keys(HUB_ROOM_SERVICE_DETAILS_V165).length, 35);
  assert.equal(Object.values(HUB_ROOM_SERVICE_DETAILS_V165).filter(row => !row.omissionReason).length, 31);
  assert.deepEqual(f.ship, { roomProfiles: 35, serviceAssemblies: 31, intentionallyOmittedRooms: 4, newCollisionGeometry: 0 });
  assert.equal(f.npcRoutes.routesClosedByThisDocument, 0);
  assert.deepEqual([f.newArchivesRecovered, f.existingSourcesReverified], [0, 62]);
  assert.equal(f.driveContents, 'UNKNOWN');
  assert.equal(f.chatgptCurrentAttempt, 'NO_USABLE_RETURNED_DATA');
});

test('new V165 imports reached by the scoped runtime are all pinned, including new indirect controllers', () => {
  const sources = current.runtimeSourceSha256;
  const imports = /(?:from\s*|import\s*\(\s*)['"]\.\/([^'"]+\.js)['"]/g;
  for (const [path] of Object.entries(sources)) {
    if (!path.startsWith('src/') || !path.endsWith('.js')) continue;
    for (const match of read(path).toString().matchAll(imports)) {
      if (!match[1].endsWith('-v165.js')) continue;
      const target = 'src/' + match[1];
      assert.ok(Object.hasOwn(sources, target), `${path} reaches unpinned ${target}`);
    }
  }
});

test('the public workbook exposes a visible notice on all 27 tabs without changing cached historical formulas', () => {
  const directory = fileURLToPath(new URL('../' + prefix, import.meta.url));
  const script = String.raw`
import hashlib,json,sys,zipfile,xml.etree.ElementTree as E
from pathlib import Path
p=Path(sys.argv[1]);r=json.loads((p/'progress-v163.json').read_text());w=p/r['workbook']
assert hashlib.sha256(w.read_bytes()).hexdigest()==r['workbookSha256']
n={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile(w) as z:
 b=E.fromstring(z.read('xl/workbook.xml')); names=[s.get('name') for s in b.find('m:sheets',n)]
 assert len(names)==27 and names==['00_Synthese']+list(r['tables'])
 assert names[-4:]==['26_ChantiersV165','23_ChantiersV163','24_CouvertureV163','25_RosterEtatV163']
 formulas=0
 for i,name in enumerate(names,1):
  d=E.fromstring(z.read(f'xl/worksheets/sheet{i}.xml')); c=d.find('.//m:c[@r="A3"]',n)
  assert ''.join(c.find('m:is',n).itertext())==r['workbookPublicationNoticeV164'],name
  assert float(d.find('.//m:row[@r="3"]',n).get('ht'))>=48
  assert d.find('m:mergeCells/m:mergeCell',n).get('ref').startswith('A3:')
  assert not d.findall('.//m:c[@t="e"]',n)
  formulas+=len(d.findall('.//m:f',n))
 assert formulas==len(r['indicators'])==32
 assert not any('externalLinks/' in name or name.endswith('vbaProject.bin') for name in z.namelist())
print(json.dumps({'sheets':len(names),'formulas':formulas,'notices':len(names)}))
`;
  const result = JSON.parse(execFileSync('python3', ['-B', '-c', script, directory], { encoding: 'utf8' }));
  assert.deepEqual(result, { sheets: 27, formulas: 32, notices: 27 });
  assert.match(current.workbookPublicationNoticeV164, /043bb60.*8a934b7/);
  assert.match(current.workbookPublicationNoticeV164, /21b70e.*ebbdbb6/);
  assert.match(current.workbookPublicationNoticeV164, /V165.*PRÉPUBLICATION/);
});

test('invented receipts, omitted source changes, modified verifiers and broadened closure claims fail closed', () => {
  const first = current.followupV165.sourceChanges[0];
  assert.ok(first);
  for (const mutate of [
    r => r.followupV165.sourceChanges.shift(),
    r => r.followupV165.sourceChanges.push(structuredClone(first)),
    r => { r.followupV165.runtimeV164SourceSha256['src/app.js'] = '0'.repeat(64); },
    r => { r.followupV165.sourceChanges[0].reason = 'fix'; },
    r => { r.followupV165.sourceChanges[0].verifiers = []; },
    r => { r.followupV165.historicalV164ResultsTransferred = true; },
    r => { r.followupV165.releaseEvidence.nativeCandidate = { status: 'PASSED', captures: 835 }; },
    r => { r.followupV165.approved1to1 = 1; },
    r => { r.followupV165.forgePrioritiesDeferred = 0; },
    r => { delete r.followupGamedev20261029; },
    r => { r.followupGamedev20261029.corrections[0].path = 'src/forge-journey-v141.js'; },
    r => { r.followupV165.rigs.newFullWalkAdmissions = 170; },
    r => { r.followupV165.costumes.newPlayablePrecompositedSkins = 3; },
    r => { r.followupV165.npcRoutes.routesClosedByThisDocument = 7; },
    r => { r.followupV165.driveContents = 'EMPTY'; },
    r => { r.followupV165.ciPlan.conclusion = 'success'; },
    r => { r.newWorkstreamsV165[0].artClosed = 1; }
  ]) { const bad = structuredClone(current); mutate(bad); assert.throws(() => verifyParallelCompletionV165(bad)); }
  for (const path of [first.path, first.verifiers[0], current.followupV165.ciPlan.workflow]) {
    const changed = name => name === path ? Buffer.concat([read(name), Buffer.from('\nUNREVIEWED')]) : read(name);
    assert.throws(() => verifyParallelCompletionV165(current, changed), path);
  }
});
