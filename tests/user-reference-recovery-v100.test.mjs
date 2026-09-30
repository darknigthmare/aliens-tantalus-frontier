import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { USER_REFERENCE_RECOVERY_V100 as references, getUserReferenceRecoveryV100 } from '../src/user-reference-recovery-v100.js';
import { ENEMY_USER_CREATIONS_V95 } from '../src/enemy-user-creations-v95.js';
import { ENEMY_USER_CASTES_ORIGINALS_V87, ENEMY_USER_CASTES_V87 } from '../src/enemy-user-castes-v87.js';

const concepts = references.filter(entry => entry.legacySourceNumber !== null);
const originals = references.filter(entry => entry.relationship === 'retained-altered-original');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

test('V100 recovers exactly seventeen held concepts and two distinct Altered original dossiers', () => {
  assert.equal(references.length, 19);
  assert.equal(concepts.length, 17);
  assert.equal(originals.length, 2);
  assert.ok(Object.isFrozen(references));
  for (const field of ['id', 'sourceFile', 'sourceSha256', 'path']) assert.equal(new Set(references.map(entry => entry[field])).size, 19, field);
  for (const entry of references) {
    assert.ok(Object.isFrozen(entry));
    assert.match(entry.id, /^reference-v100-[a-z0-9-]+$/);
    assert.match(entry.sourceSha256, /^[a-f0-9]{64}$/);
    assert.equal(getUserReferenceRecoveryV100(entry.id), entry);
    assert.equal(/[A-Z]:[\\/]|Downloads|\.\.\//i.test(entry.sourcePath), false);
    assert.match(entry.path, /^\/assets\/user\/(recovery-v100|castes-v87)\/[a-z0-9_-]+\.(jpg|png)$/);
  }
  for (const invalid of [null, {}, '__proto__', 'constructor', ' ' + references[0].id, references[0].id + ':0']) {
    assert.equal(getUserReferenceRecoveryV100(invalid), null);
  }
});

test('V100 concept filenames, hashes, dimensions and preserved hold decisions match the authoritative old manifest', async () => {
  const status = JSON.parse(await readFile(new URL('../docs/references/v95-user-creatures/STATUS-20260926.json', import.meta.url), 'utf8'));
  const inventory = JSON.parse(await readFile(new URL('../docs/references/v95-user-creatures/INVENTORY.json', import.meta.url), 'utf8'));
  const held = status.entries.filter(entry => entry.status.startsWith('held-'));
  assert.deepEqual(concepts.map(entry => entry.legacySourceNumber), held.map(entry => entry.sourceNumber));
  assert.equal(concepts.reduce((sum, entry) => sum + entry.sourceBytes, 0), 34317754);
  for (const entry of concepts) {
    const original = held.find(source => source.sourceNumber === entry.legacySourceNumber);
    const details = inventory.entries.find(source => source.number === entry.legacySourceNumber);
    assert.equal(entry.sourceFile, original.file);
    assert.equal(entry.sourceSha256, original.sourceSha256);
    assert.equal(entry.previousAdmissionStatus, original.status);
    assert.deepEqual([entry.sourceBytes, entry.sourceWidth, entry.sourceHeight], [details.bytes, details.width, details.height]);
    assert.equal(entry.sourcePath, 'AlienTentalusAintergrer/' + original.file);
    assert.equal(entry.sourceFormat, 'JPEG');
    assert.equal(entry.visualStatus, 'source-concept-unaltered');
  }
});

test('V100 composite/concept dossiers never imply a combat sprite, canonical identity or population admission', () => {
  for (const entry of references) {
    assert.equal(entry.combatReady, false);
    assert.equal(entry.automaticEncounter, false);
    assert.equal(entry.kind, 'concept');
    assert.equal(entry.selectable, true);
    assert.equal(entry.selectionScope, 'reference-library');
    assert.equal(entry.visualMode, 'static-reference');
    assert.equal(entry.animationStatus, 'missing');
    assert.equal(entry.canonExact, false);
    assert.equal(entry.identityVerified, false);
    assert.equal(entry.backgroundPreserved, true);
    for (const field of ['health', 'damage', 'speed', 'cost', 'profileId', 'alphaBounds', 'states']) assert.equal(Object.hasOwn(entry, field), false, field);
  }
  const composite = concepts.find(entry => entry.legacySourceNumber === 9);
  assert.equal(composite.composite, true);
  assert.equal(composite.biology, 'unknown');
  assert.equal(composite.alteredOf, null);
  assert.match(composite.reason, /repère humain inclus/);
  assert.equal(concepts.find(entry => entry.legacySourceNumber === 10).biology, 'unknown');
});

test('V100 only links confirmed alternate poses/states, without merging similarly named designs', () => {
  const big = concepts.find(entry => entry.legacySourceNumber === 41);
  const carrier = concepts.find(entry => entry.legacySourceNumber === 51);
  assert.deepEqual([big.relationship, big.alteredOf], ['alternate-pose', 'pose-v95-user-xeno-big-xeno-1']);
  assert.deepEqual([carrier.relationship, carrier.alteredOf], ['alternate-state', 'pose-v95-user-xeno-carrier']);
  for (const entry of [big, carrier]) assert.ok(ENEMY_USER_CREATIONS_V95.some(profile => profile.id === entry.alteredOf));
  for (const entry of concepts.filter(entry => ![41, 51].includes(entry.legacySourceNumber))) {
    assert.equal(entry.alteredOf, null);
    assert.equal(entry.relationship, 'unresolved-user-reference');
  }
  const experiments = concepts.filter(entry => entry.lineage === 'experiment');
  assert.deepEqual(experiments.map(entry => entry.legacySourceNumber), [58, 62]);
  assert.notEqual(experiments[0].id, experiments[1].id);
});

test('V100 original Smasher and Chrysalis PNG hashes remain exact while active revisions stay distinct', async () => {
  for (const entry of originals) {
    const original = ENEMY_USER_CASTES_ORIGINALS_V87.find(profile => profile.id === entry.alteredOf);
    const active = ENEMY_USER_CASTES_V87.find(profile => profile.id === entry.alteredOf);
    assert.ok(original && active);
    assert.equal(entry.path, original.path);
    assert.equal(entry.sourceFile, original.filename);
    assert.notEqual(entry.path, active.path);
    assert.equal(active.originalPath, entry.path);
    assert.match(entry.name, / — Altered \(original fourni\)$/);
    assert.equal(hash(await readFile(new URL('..' + entry.path, import.meta.url))), entry.sourceSha256);
  }
});
