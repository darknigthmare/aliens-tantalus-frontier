/** Explicit, read-only succession of the immutable V156 audit to V157.
 * No git history is needed: the predecessor documents are anchored here and
 * every changed predecessor source needs a declared old/new transition.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { verifyAuditSuccessionV158 } from './audit-succession-v158.mjs';

export const AUDIT_PREDECESSOR_DOCUMENTS_V157 = Object.freeze({
  'docs/forge/xeno-trials/V156-CONTINUATION.md': '48ddc7a166370bbcbd4e04ca4cd15c31a05d0340b90443600ec006d1ad31416e',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V156.xlsx': 'aadcf1f4b018150af8a4d183806f41a2c3ddc23847bbe6a19db5020a046b2e5d',
  'docs/forge/xeno-trials/progress-v156.json': '73703c0f34fb4e48c5f93b8fc99d16a358116bb4a795c774847841d2e6efff46'
});

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sortedKeys = value => Object.keys(value).sort();
const validHash = hash => typeof hash === 'string' && /^[a-f0-9]{64}$/.test(hash);

export function verifyAuditSuccessionV157(previous, current, readSource = readRepository) {
  assert.equal(previous.lot, 'V156');
  assert.equal(current.lot, 'V157');
  const bridge = current.runtimeSuccession;
  assert.equal(bridge?.schema, 1);
  assert.equal(bridge.from, 'V156');
  assert.equal(bridge.to, 'V157');
  assert.deepEqual(bridge.predecessorDocuments, AUDIT_PREDECESSOR_DOCUMENTS_V157);
  let predecessorRecord;
  for (const [path, hash] of Object.entries(AUDIT_PREDECESSOR_DOCUMENTS_V157)) {
    const payload = readSource(path);
    assert.equal(sha(payload), hash, 'Historical document changed: ' + path);
    if (path.endsWith('/progress-v156.json')) predecessorRecord = JSON.parse(payload);
  }
  assert.deepEqual(previous, predecessorRecord, 'Previous contract must be the anchored V156 record');
  const before = previous.runtimeSourceSha256;
  const after = current.runtimeSourceSha256;
  // A successor never rewrites these 31 historical hashes. Its anchored
  // predecessor, exhaustive transitions and actual source hashes are checked
  // first; V156/V157 assertions still inspect their original contracts.
  let effective = after;
  let successor;
  try {
    successor = JSON.parse(readSource('docs/forge/xeno-trials/progress-v158.json'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (successor) {
    verifyAuditSuccessionV158(current, successor, readSource);
    effective = successor.runtimeSourceSha256;
  }
  assert.equal(sortedKeys(before).length, 18);
  assert.ok(after && sortedKeys(after).length >= sortedKeys(before).length);
  for (const path of sortedKeys(before)) assert.ok(Object.hasOwn(after, path), 'Inherited source omitted: ' + path);
  for (const [path, hash] of Object.entries(after)) {
    assert.ok(/^src\/[a-zA-Z0-9._-]+\.js$/.test(path) || path === 'src/forge-editor-v130.css',
      'Source path outside the reviewed JavaScript and checkpoint stylesheet scope: ' + path);
    assert.ok(validHash(hash), 'Invalid current SHA: ' + path);
    assert.equal(sha(readSource(path)), effective[path], 'Current source changed: ' + path);
  }
  const changed = sortedKeys(before).filter(path => before[path] !== after[path]);
  const added = sortedKeys(after).filter(path => !Object.hasOwn(before, path));
  assert.ok(Array.isArray(bridge.transitions));
  assert.deepEqual(bridge.transitions.map(t => t.path), changed, 'Transitions must exactly match changed inherited sources');
  assert.ok(Array.isArray(bridge.addedSources));
  assert.deepEqual(bridge.addedSources.map(t => t.path), added, 'Additions must exactly match new source pins');
  for (const transition of [...bridge.transitions, ...bridge.addedSources]) {
    assert.equal(transition.previousSha256, before[transition.path] ?? null);
    assert.equal(transition.currentSha256, after[transition.path]);
    assert.equal(typeof transition.reason, 'string');
    assert.ok(transition.reason.trim().length >= 24, 'Explain the deliberate change: ' + transition.path);
    assert.ok(Array.isArray(transition.verifiers) && transition.verifiers.length > 0);
    assert.equal(new Set(transition.verifiers).size, transition.verifiers.length);
    for (const verifier of transition.verifiers) {
      assert.match(verifier, /^scripts\/verify-[a-zA-Z0-9._-]+\.mjs$/);
      assert.ok(readSource(verifier).length > 0, 'Missing behavioral verifier: ' + verifier);
    }
  }
  return Object.freeze({ inherited: sortedKeys(before).length, changed: changed.length,
    unchanged: sortedKeys(before).length - changed.length, added: added.length,
    current: sortedKeys(after).length });
}

export function loadAuditSuccessionV157() {
  const previous = JSON.parse(readRepository('docs/forge/xeno-trials/progress-v156.json'));
  const current = JSON.parse(readRepository('docs/forge/xeno-trials/progress-v157.json'));
  return { previous, current, result: verifyAuditSuccessionV157(previous, current) };
}
