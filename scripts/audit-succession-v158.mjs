/** Immutable V157 contract and explicit transitions to the current V158 sources.
 * All evidence is repository-local, including shallow release checkouts.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const AUDIT_PREDECESSOR_DOCUMENTS_V158 = Object.freeze({
  'docs/forge/xeno-trials/V157-CONTINUATION.md': '7f6d2eb3537d9da61c9bc4397d91d84a78430aa9cb2ba6f0f7848a6f10e53017',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V157.xlsx': '5606550b16ca256531220a1975897ce6eda32b1416a9ae02f7efc97d3acc71ec',
  'docs/forge/xeno-trials/progress-v157.json': 'e7579e638182527ddd8c4c54fe60f157944c1d314d888eb0b3fd2a4af0e67238'
});

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const keys = value => Object.keys(value).sort();
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);

export function verifyAuditSuccessionV158(previous, current, readSource = readRepository) {
  assert.equal(previous.lot, 'V157');
  assert.equal(current.lot, 'V158');
  assert.equal(current.publicationState, 'PREPUBLICATION');
  const bridge = current.runtimeSuccession;
  assert.equal(bridge?.schema, 1);
  assert.equal(bridge.from, 'V157');
  assert.equal(bridge.to, 'V158');
  assert.deepEqual(bridge.predecessorDocuments, AUDIT_PREDECESSOR_DOCUMENTS_V158);
  let anchored;
  for (const [path, expected] of Object.entries(AUDIT_PREDECESSOR_DOCUMENTS_V158)) {
    const bytes = readSource(path);
    assert.equal(sha(bytes), expected, 'Historical V157 document changed: ' + path);
    if (path.endsWith('/progress-v157.json')) anchored = JSON.parse(bytes);
  }
  assert.deepEqual(previous, anchored, 'Previous contract must be the anchored final V157 public record');
  const before = previous.runtimeSourceSha256, after = current.runtimeSourceSha256;
  assert.equal(keys(before).length, 31);
  assert.ok(after && keys(after).length >= 31);
  for (const path of keys(before)) assert.ok(Object.hasOwn(after, path), 'Inherited V157 source omitted: ' + path);
  for (const [path, expected] of Object.entries(after)) {
    assert.ok(/^src\/[a-zA-Z0-9._-]+\.js$/.test(path) || path === 'src/forge-editor-v130.css',
      'Source path outside the reviewed scope: ' + path);
    assert.ok(validHash(expected), 'Invalid source hash: ' + path);
    assert.equal(sha(readSource(path)), expected, 'Current V158 source changed: ' + path);
  }
  const changed = keys(before).filter(path => before[path] !== after[path]);
  const added = keys(after).filter(path => !Object.hasOwn(before, path));
  assert.ok(Array.isArray(bridge.transitions) && Array.isArray(bridge.addedSources));
  assert.deepEqual(bridge.transitions.map(row => row.path), changed, 'Declare every changed inherited V157 pin exactly once');
  assert.deepEqual(bridge.addedSources.map(row => row.path), added, 'Declare every newly audited V158 source exactly once');
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
  return Object.freeze({ inherited: 31, changed: changed.length, unchanged: 31 - changed.length,
    added: added.length, current: keys(after).length });
}

export function loadAuditSuccessionV158(readSource = readRepository) {
  const previous = JSON.parse(readSource('docs/forge/xeno-trials/progress-v157.json'));
  const current = JSON.parse(readSource('docs/forge/xeno-trials/progress-v158.json'));
  return { previous, current, result: verifyAuditSuccessionV158(previous, current, readSource) };
}
