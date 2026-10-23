/** Byte-anchored V160 -> V161 continuation; historical source pins are immutable. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const AUDIT_PREDECESSOR_DOCUMENTS_V161 = Object.freeze({
  'docs/forge/xeno-trials/V160-PLAYER-TRACKER-CAMPAIGN.md': 'bba092e37c881cde8bdc3a98aefbe96f9a50231733c1e5345e29a52373e5331e',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V160.xlsx': '50d6ef55026f6686b5fb360136c68614942d8c6e6f4d4d82f90bea1b581b4a72',
  'docs/forge/xeno-trials/progress-v160.json': '3feb80417e294fd43d7da146a51d694ca08a3d581e4722ec91daf9829fbf3515',
  'docs/forge/xeno-trials/references-v160.json': 'f59c2dc108c1e2aeb89abe2b9270f9c0ae5c75c72b522fbcb4d2c4037a1a3834'
});

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const keys = value => Object.keys(value).sort();
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);

function anchoredPredecessor(previous, readSource) {
  let anchored;
  for (const [path, expected] of Object.entries(AUDIT_PREDECESSOR_DOCUMENTS_V161)) {
    const bytes = readSource(path);
    assert.equal(sha(bytes), expected, 'Historical V160 document changed: ' + path);
    if (path.endsWith('/progress-v160.json')) anchored = JSON.parse(bytes);
  }
  assert.deepEqual(previous, anchored, 'Previous contract must be the byte-anchored V160 public record');
}

export function verifyAuditSuccessionV161(previous, current, readSource = readRepository) {
  anchoredPredecessor(previous, readSource);
  assert.equal(previous.lot, 'V160');
  assert.equal(current?.lot, 'V161');
  assert.equal(current.publicationState, 'PREPUBLICATION');
  const bridge = current.runtimeSuccession;
  assert.equal(bridge?.schema, 1);
  assert.equal(bridge.from, 'V160');
  assert.equal(bridge.to, 'V161');
  assert.deepEqual(bridge.predecessorDocuments, AUDIT_PREDECESSOR_DOCUMENTS_V161);
  const before = previous.runtimeSourceSha256, after = current.runtimeSourceSha256;
  assert.equal(keys(before).length, 74);
  assert.ok(after && keys(after).length >= 74);
  for (const path of keys(before)) assert.ok(Object.hasOwn(after, path), 'Inherited V160 source omitted: ' + path);
  for (const [path, expected] of Object.entries(after)) {
    assert.ok(/^src\/[a-zA-Z0-9._-]+\.(?:js|css)$/.test(path)
      || /^[a-zA-Z0-9._-]+\.css$/.test(path) || ['index.html', 'sw.js'].includes(path),
    'Source path outside the reviewed runtime scope: ' + path);
    assert.ok(validHash(expected), 'Invalid source hash: ' + path);
    assert.equal(sha(readSource(path)), expected, 'Current V161 source changed: ' + path);
  }
  const changed = keys(before).filter(path => before[path] !== after[path]);
  const added = keys(after).filter(path => !Object.hasOwn(before, path));
  assert.ok(Array.isArray(bridge.transitions) && Array.isArray(bridge.addedSources));
  assert.deepEqual(bridge.transitions.map(row => row.path), changed, 'Declare every changed inherited V160 source exactly once');
  assert.deepEqual(bridge.addedSources.map(row => row.path), added, 'Declare every new V161 source exactly once');
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
  return Object.freeze({ inherited: 74, changed: changed.length, unchanged: 74 - changed.length,
    added: added.length, current: keys(after).length });
}

/** A missing successor preserves the anchored record; invalid content never falls back. */
export function resolveAuditSourcesV161(previous, readSource = readRepository) {
  anchoredPredecessor(previous, readSource);
  let current;
  try {
    current = JSON.parse(readSource('docs/forge/xeno-trials/progress-v161.json'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return previous.runtimeSourceSha256;
  }
  verifyAuditSuccessionV161(previous, current, readSource);
  return current.runtimeSourceSha256;
}

export function loadAuditSuccessionV161(readSource = readRepository) {
  const previous = JSON.parse(readSource('docs/forge/xeno-trials/progress-v160.json'));
  const current = JSON.parse(readSource('docs/forge/xeno-trials/progress-v161.json'));
  return { previous, current, result: verifyAuditSuccessionV161(previous, current, readSource) };
}
