/** Byte-anchored V159 -> V160 continuation. Historical documents and pins stay immutable. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolveAuditSourcesV161 } from './audit-succession-v161.mjs';

export const AUDIT_PREDECESSOR_DOCUMENTS_V160 = Object.freeze({
  'docs/forge/xeno-trials/V159-CIRCULATION.md': '22b91e626417d1ff56a756f4a39b384e05df7b3ea5bc13a113090dfd5d587c2b',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V159.xlsx': '34108149c61193417f2a1786c37082abe31447d44b33d7234731e62bac085674',
  'docs/forge/xeno-trials/progress-v159.json': '54eeb16d850c34cfda9ff5256f29976173936664cb8823ca60ab8f03df4b6417',
  'docs/forge/xeno-trials/references-v159.json': 'c01452cecc0ad6b4165e194ba9c69811eca6b281a2e6307b29f436181ed04a71'
});

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const keys = value => Object.keys(value).sort();
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);

function anchoredPredecessor(previous, readSource) {
  let anchored;
  for (const [path, expected] of Object.entries(AUDIT_PREDECESSOR_DOCUMENTS_V160)) {
    const bytes = readSource(path);
    assert.equal(sha(bytes), expected, 'Historical V159 document changed: ' + path);
    if (path.endsWith('/progress-v159.json')) anchored = JSON.parse(bytes);
  }
  assert.deepEqual(previous, anchored, 'Previous contract must be the byte-anchored V159 public record');
}

export function verifyAuditSuccessionV160(previous, current, readSource = readRepository) {
  anchoredPredecessor(previous, readSource);
  assert.equal(previous.lot, 'V159');
  assert.equal(current?.lot, 'V160');
  assert.equal(current.publicationState, 'PREPUBLICATION');
  const bridge = current.runtimeSuccession;
  assert.equal(bridge?.schema, 1);
  assert.equal(bridge.from, 'V159');
  assert.equal(bridge.to, 'V160');
  assert.deepEqual(bridge.predecessorDocuments, AUDIT_PREDECESSOR_DOCUMENTS_V160);
  const before = previous.runtimeSourceSha256, after = current.runtimeSourceSha256;
  // Historical V160 pins retain their exact values. A later runtime is
  // admitted only through a complete bridge anchored to these documents.
  const effective = resolveAuditSourcesV161(current, readSource, { effective: true });
  assert.equal(keys(before).length, 48);
  assert.ok(after && keys(after).length >= 48);
  for (const path of keys(before)) assert.ok(Object.hasOwn(after, path), 'Inherited V159 source omitted: ' + path);
  for (const [path, expected] of Object.entries(after)) {
    assert.ok(/^src\/[a-zA-Z0-9._-]+\.(?:js|css)$/.test(path)
      || /^[a-zA-Z0-9._-]+\.css$/.test(path) || ['index.html', 'sw.js'].includes(path),
    'Source path outside the reviewed runtime scope: ' + path);
    assert.ok(validHash(expected), 'Invalid source hash: ' + path);
    assert.equal(sha(readSource(path)), effective[path], 'Current V160 source changed: ' + path);
  }
  const changed = keys(before).filter(path => before[path] !== after[path]);
  const added = keys(after).filter(path => !Object.hasOwn(before, path));
  assert.ok(Array.isArray(bridge.transitions) && Array.isArray(bridge.addedSources));
  assert.deepEqual(bridge.transitions.map(row => row.path), changed, 'Declare every changed inherited V159 source exactly once');
  assert.deepEqual(bridge.addedSources.map(row => row.path), added, 'Declare every new V160 source exactly once');
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
  return Object.freeze({ inherited: 48, changed: changed.length, unchanged: 48 - changed.length,
    added: added.length, current: keys(after).length });
}

/** Absence of V160 preserves the historical return; fabricated V159 is always rejected. */
export function resolveAuditSourcesV160(previous, readSource = readRepository, { effective = false } = {}) {
  anchoredPredecessor(previous, readSource);
  let current;
  try {
    current = JSON.parse(readSource('docs/forge/xeno-trials/progress-v160.json'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return previous.runtimeSourceSha256;
  }
  verifyAuditSuccessionV160(previous, current, readSource);
  return effective ? resolveAuditSourcesV161(current, readSource, { effective: true }) : current.runtimeSourceSha256;
}

export function loadAuditSuccessionV160(readSource = readRepository) {
  const previous = JSON.parse(readSource('docs/forge/xeno-trials/progress-v159.json'));
  const current = JSON.parse(readSource('docs/forge/xeno-trials/progress-v160.json'));
  return { previous, current, result: verifyAuditSuccessionV160(previous, current, readSource) };
}
