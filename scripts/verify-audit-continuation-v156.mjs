import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { XENO_TRIALS_FIGHTERS_V96 as roster } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_RIGS_V154 as rigs } from '../src/xeno-trials-rig-v154.js';
import { XENO_TRIALS_SEQUENCES_V155 as previousSequences,
  XENO_TRIALS_ADDED_SEQUENCES_V156 as addedSequences,
  XENO_TRIALS_SEQUENCES_V156 as sequences } from '../src/xeno-trials-sequences-v155.js';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { XENO_TRIALS_RESTRAINT_POSE_V156 as restraintPose } from '../src/xeno-trials-restraint-pose-v156.js';
import { HUB_ANNEX_NPC_DUTIES_V141 as annexDuties, HUB_ANNEX_NPC_ROTATIONS_V156 as rotations,
  HUB_ANNEX_NPC_DEFERRED_V156 as deferred } from '../src/hub-annex-npc-life-v141.js';
import { HUB_ANNEXES_V137 as annexes } from '../src/hub-annex-registry-v137.js';
import { FORGE_NARRATIVE_LIMITS_V156 as narrativeLimits,
  defaultForgeNarrativeV156, parseForgeNarrativeV156 } from '../src/forge-narrative-v156.js';
import { withWeaponActionsV131 } from '../src/weapon-actions-v131.js';

const prefix = 'docs/forge/xeno-trials/';
const bytes = name => readFileSync(new URL('../' + prefix + name, import.meta.url));
const json = name => JSON.parse(bytes(name));
const sha = data => createHash('sha256').update(data).digest('hex');
const current = json('progress-v156.json');
const previous = json('progress-v155.json');
const plan = json('xeno-trials-plan-v146.json');
const ids = rows => rows.map(r => r[0]);
const runtimeSources = [
  'src/forge-authoring-v133.js', 'src/forge-mission-runtime-v141.js', 'src/forge-model-v130.js',
  'src/forge-narrative-ui-v156.js', 'src/forge-narrative-v156.js', 'src/forge-ship-runtime-v141.js',
  'src/forge-ui-v130.js', 'src/forge-versions-v136.js', 'src/game-production-runtime.js',
  'src/hub-annex-npc-life-v141.js', 'src/weapon-actions-v131.js', 'src/xeno-trials-restraint-pose-v156.js',
  'src/xeno-trials-rig-v154.js', 'src/xeno-trials-runtime-v96.js', 'src/xeno-trials-sequences-v155.js',
  'src/xeno-trials-ui-v96.js'
].sort();

test('V156 keeps the exact inherited 40 presentation, 28 ART153 and 189 roster IDs without artistic closure', () => {
  assert.equal(current.lot, 'V156');
  assert.equal(current.applicationVersion, '143.0.0');
  assert.equal(current.saveSchema, 52);
  assert.equal(current.approved1to1, 0);
  assert.equal(current.fullArtTasksClosed, 0);
  assert.equal(current.newOriginalSpriteFiles, 0);
  assert.deepEqual(current.rosterIds, roster.map(f => f.id));
  assert.deepEqual(current.rosterIds, previous.rosterIds);
  assert.equal(new Set(current.rosterIds).size, 189);
  const presentations = current.tables['01_Presentations'];
  const art = current.tables['02_ART153'];
  assert.deepEqual(presentations.headers, previous.tables['02_Production'].headers);
  assert.deepEqual(art.headers, previous.tables['03_ART153'].headers);
  assert.deepEqual(ids(presentations.rows), previous.inheritedPresentationIds);
  assert.deepEqual(current.inheritedPresentationIds, previous.inheritedPresentationIds);
  assert.deepEqual(ids(art.rows), ids(previous.tables['03_ART153'].rows));
  assert.deepEqual(current.inheritedArt153Ids, ids(previous.tables['03_ART153'].rows));
  assert.equal(presentations.rows.length, 40);
  assert.equal(art.rows.length, 28);
  const planned = new Set(ids(plan.tables['09_Presentations'].rows));
  for (const row of presentations.rows) {
    assert.ok(planned.has(row[0]));
    assert.equal(row[3], 'Partiel');
    assert.equal(row[6], 0);
    assert.equal(row[7], 0);
  }
  for (let i = 0; i < art.rows.length; i++) {
    assert.deepEqual(art.rows[i].slice(0, 4), previous.tables['03_ART153'].rows[i].slice(0, 4));
    assert.equal(art.rows[i][7], 0);
    assert.doesNotMatch(art.rows[i][4], /terminé|certifié|clos/i);
  }
});

test('the tracker counts the real exported 40 sequences, 20 new mappings and 200 keys', () => {
  assert.equal(previousSequences.length, 20);
  assert.equal(addedSequences.length, 20);
  assert.equal(sequences.length, 40);
  assert.equal(current.sequences, sequences.length);
  assert.equal(current.keyframes, sequences.reduce((n, s) => n + s.keys.length, 0));
  assert.equal(current.keyframes, 200);
  assert.deepEqual(current.sequenceIds, sequences.map(s => s.id));
  assert.deepEqual(current.addedSequenceIds, addedSequences.map(s => s.id));
  assert.equal(current.rigCount, rigs.length);
  assert.equal(rigs.length, 4);
  const mapping = new Map(current.tables['01_Presentations'].rows.map(r => [r[4], r[0]]));
  const oldMapping = new Map(previous.tables['02_Production'].rows.map(r => [r[0], r[4]]));
  assert.equal(current.tables['01_Presentations'].rows.filter(r => r[4] && !oldMapping.get(r[0])).length, 20);
  assert.equal(current.newPresentationMappings, 20);
  assert.equal(mapping.size, 40);
  assert.deepEqual(current.tables['03_Sequences'].rows.map(r => [r[0], r[2], r[3], r[4], r[5]]),
    sequences.map(s => [s.id, s.kind, s.durationMs, s.keys.length, mapping.get(s.id)]));
  for (const s of sequences) {
    assert.equal(s.canonExact, false);
    assert.equal(s.evidence, 'original-versus-presentation');
  }
  const active = new Set(rigs.map(r => r.fighterId));
  assert.deepEqual(current.tables['08_Roster'].rows,
    roster.map(f => [f.id, f.label, f.family, Number(active.has(f.id)), sequences.filter(s => s.fighterId === f.id).length, 0]));
});

test('all ten historical XLSX files and four admitted source plates remain byte-identical', () => {
  const oldNames = ['ALIENS_TANTALUS_XENO_TRIALS_PLAN_V146.xlsx',
    ...Array.from({ length: 9 }, (_, i) => `XENO_TRIALS_SUIVI_V${147 + i}.xlsx`)];
  assert.deepEqual(current.historyWorkbooks.map(h => h.path), oldNames.map(n => prefix + n));
  for (let i = 0; i < current.historyWorkbooks.length; i++) {
    const entry = current.historyWorkbooks[i];
    assert.match(entry.sha256, /^[a-f0-9]{64}$/);
    const inheritedHash = i === 0 ? json('manifest-v146.json').sha256 : json(`progress-v${146 + i}.json`).workbookSha256;
    assert.equal(entry.sha256, inheritedHash, entry.path);
    assert.equal(sha(readFileSync(new URL('../' + entry.path, import.meta.url))), entry.sha256);
  }
  assert.deepEqual(current.sourcePlates, rigs.map(({ id, fighterId, path, sourceSha256, sourceWidth, sourceHeight }) =>
    ({ id, fighterId, path, sourceSha256, sourceWidth, sourceHeight })));
  for (const rig of rigs) {
    assert.equal(sha(readFileSync(new URL('..' + rig.path, import.meta.url))), rig.sourceSha256);
  }
  assert.equal(current.sourcePlates.length, 4);
});

test('V156 documents separate technical scope, remaining audits and prepublication verification', () => {
  assert.deepEqual(Object.keys(current.tables), ['01_Presentations', '02_ART153', '03_Sequences',
    '04_Annexes', '05_Forge', '06_Sources', '07_Recette', '08_Roster', '09_AutresAudits']);
  for (const table of Object.values(current.tables)) {
    assert.ok(table.headers.length && table.rows.length);
    assert.equal(new Set(table.headers).size, table.headers.length);
    assert.equal(new Set(ids(table.rows)).size, table.rows.length);
    for (const row of table.rows) {
      assert.equal(row.length, table.headers.length);
      assert.doesNotMatch(row.join(' '), /PROVISOIRE|contrats agent attendus|ne pas publier ce brouillon/i);
    }
  }
  for (const row of current.tables['07_Recette'].rows) {
    assert.doesNotMatch(String(row[2]), /réussi|passed|succès|verte/i);
    assert.match(String(row[2]), /prépublication|à exécuter|à vérifier/i);
  }
  assert.ok(current.limitations.length >= 5);
  assert.match(current.limitations.join(' '), /185/);
  assert.match(current.limitations.join(' '), /intersessions/i);
  const body = bytes('V156-CONTINUATION.md').toString('utf8');
  assert.match(body, /prépublication/i);
  assert.match(body, /1:1/);
  assert.match(body, /partiel/i);
  assert.doesNotMatch(body, /CI verte|CI réussie|tout est terminé/i);
  assert.deepEqual(Object.keys(current.runtimeSourceSha256), runtimeSources);
  for (const [path, hash] of Object.entries(current.runtimeSourceSha256)) {
    assert.match(path, /^src\/[a-zA-Z0-9._-]+\.js$/);
    assert.equal(sha(readFileSync(new URL('../' + path, import.meta.url))), hash, path);
  }
});

test('the appendix accurately records bounded human lowering, real annex watches and session-only Forge stories', () => {
  assert.deepEqual(current.runtimeContracts.restraintPose, restraintPose);
  assert.equal(restraintPose.fullFloorPin, false);
  assert.equal(restraintPose.canonExact, false);
  assert.equal(restraintPose.targets.length, 3);
  assert.ok(restraintPose.targets.every(t => t.fighterId !== 'prowler'));
  const ann = current.runtimeContracts.annexes;
  assert.deepEqual(ann.baseDuties, annexDuties);
  assert.deepEqual(ann.rotations, rotations);
  assert.deepEqual(ann.deferred, deferred);
  const covered = [...new Set([...annexDuties, ...rotations].map(d => d.roomId))].sort();
  assert.deepEqual(ann.coveredRoomIds, covered);
  assert.deepEqual(ann.roomIds, annexes.map(a => a.id));
  assert.deepEqual(ids(current.tables['04_Annexes'].rows), annexes.map(a => a.id));
  assert.equal(covered.length, 18);
  assert.equal(annexes.length, 19);
  assert.equal(current.indicators.find(i => i.id === 'annexes').expected, covered.length);
  assert.equal(current.tables['04_Annexes'].rows.filter(r => r[6] === 'Affectation technique conditionnelle').length, covered.length);
  assert.equal(current.tables['04_Annexes'].rows.find(r => r[0] === 'animal-care')[6], 'Différé');
  assert.deepEqual(deferred.map(d => d.roomId), ['animal-care']);
  assert.equal(ann.newCrewIdentities, 0);
  assert.equal(ann.interRoomWalking, false);
  const forge = current.runtimeContracts.forge;
  assert.deepEqual(forge.limits, narrativeLimits);
  assert.equal(forge.schema, parseForgeNarrativeV156(defaultForgeNarrativeV156(), 'terminal', 'gameplay').schema);
  assert.equal(forge.sessionPersistence, 'session-memory-only');
  assert.equal(forge.interSessionProgress, false);
  assert.equal(forge.freeScripts, false);
  const recovery = current.runtimeContracts.weaponRecovery;
  assert.equal(recovery.module, 'src/weapon-actions-v131.js');
  assert.equal(recovery.mixin, 'withWeaponActionsV131');
  assert.equal(recovery.method, 'recoverableWeaponIndexV131');
  assert.equal(typeof withWeaponActionsV131(class {}).prototype[recovery.method], 'function');
  assert.equal(recovery.result, 'index-or-minus-one');
  assert.equal(recovery.maxDistance, 72);
  assert.equal(recovery.readOnly, true);
  assert.deepEqual(recovery.guards, ['gameplay-admission', 'equipped-weapon-profile', 'projectile-owner', 'center-distance', 'native-line-of-sight']);
  const art = new Map(current.tables['02_ART153'].rows.map(r => [r[0], r]));
  for (const id of ['ART153-11', 'ART153-12', 'ART153-18', 'ART153-19', 'ART153-25', 'ART153-26']) {
    assert.equal(art.get(id)[4], 'Partiel');
    assert.equal(art.get(id)[6], 'V156');
    assert.equal(art.get(id)[7], 0);
  }
  for (const id of ['ART153-10', 'ART153-17', 'ART153-24']) assert.equal(art.get(id)[4], 'À produire');
});

test('the exact workbook mirrors every JSON cell and eleven verified formula caches using only Python stdlib', () => {
  assert.equal(sha(bytes(current.workbook)), current.workbookSha256);
  const result = JSON.parse(execFileSync('python3', [
    fileURLToPath(new URL('./verify-audit-workbook-v156.py', import.meta.url)),
    fileURLToPath(new URL('../' + prefix, import.meta.url))
  ], { encoding: 'utf8', env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } }));
  assert.equal(result.ok, true);
  assert.equal(result.sheets, 10);
  assert.equal(result.tables, 9);
  assert.equal(result.formulas, 11);
  assert.equal(result.formulaErrors, 0);
  assert.ok(result.sourceCells > 1000);
});

test('only the three reviewed V156 documents are admitted as sources and excluded from the distributed game', () => {
  for (const name of [current.workbook, 'progress-v156.json', 'V156-CONTINUATION.md']) {
    assert.equal(isPublicDistributionPathV86(prefix + name), true, name);
    assert.equal(isPublicDistributionPathV86(prefix + name, { built: true }), false, name);
  }
  assert.equal(isPublicDistributionPathV86(prefix + 'unreviewed-v156.xlsx'), false);
  assert.equal(isPublicDistributionPathV86(prefix + 'unreviewed-v156.json'), false);
  const actual = readdirSync(new URL('../' + prefix, import.meta.url)).filter(name => /v156/i.test(name)).sort();
  assert.deepEqual(actual, ['V156-CONTINUATION.md', 'XENO_TRIALS_SUIVI_V156.xlsx', 'progress-v156.json'].sort());
});
