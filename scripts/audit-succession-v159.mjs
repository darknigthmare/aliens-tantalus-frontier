/** Anchored V158 -> V159 succession. No Git history or CI checkout assumption. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolveAuditSourcesV160 } from './audit-succession-v160.mjs';

export const AUDIT_PREDECESSOR_DOCUMENTS_V159 = Object.freeze({
  'docs/forge/xeno-trials/V158-CONTINUATION.md': '14ba5d60557c6d499c31fa78aac8f43fd4c646029fd78480e82f0dbb6b24d62e',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V158.xlsx': '36cc4f42bb0c60707959258950fd550d8bea4221cf901423d0cc848945ebb822',
  'docs/forge/xeno-trials/progress-v158.json': '4af5ae6469aa13ec1ea999eaa1fced2f616f23363a3df806cf2d34deb6c67ef7'
});

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const keys = value => Object.keys(value).sort();
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);

function verifyAnchoredPredecessor(previous, readSource) {
  let anchored;
  for (const [path, expected] of Object.entries(AUDIT_PREDECESSOR_DOCUMENTS_V159)) {
    const bytes = readSource(path);
    assert.equal(sha(bytes), expected, 'Historical V158 document changed: ' + path);
    if (path.endsWith('/progress-v158.json')) anchored = JSON.parse(bytes);
  }
  assert.deepEqual(previous, anchored, 'Previous contract must be the anchored V158 public record');
}

export function verifyAuditSuccessionV159(previous, current, readSource = readRepository) {
  assert.equal(previous.lot, 'V158');
  assert.equal(current?.lot, 'V159');
  assert.equal(current.publicationState, 'PREPUBLICATION');
  const bridge = current.runtimeSuccession;
  assert.equal(bridge?.schema, 1);
  assert.equal(bridge.from, 'V158');
  assert.equal(bridge.to, 'V159');
  assert.deepEqual(bridge.predecessorDocuments, AUDIT_PREDECESSOR_DOCUMENTS_V159);
  verifyAnchoredPredecessor(previous, readSource);
  const before = previous.runtimeSourceSha256, after = current.runtimeSourceSha256;
  // These 48 V159 hashes remain historical. Later runtime bytes are admitted
  // only through their byte-anchored predecessor and complete V160 bridge.
  const effective = resolveAuditSourcesV160(current, readSource, { effective: true });
  assert.equal(keys(before).length, 46);
  assert.ok(after && keys(after).length >= 46);
  for (const path of keys(before)) assert.ok(Object.hasOwn(after, path), 'Inherited V158 source omitted: ' + path);
  for (const [path, expected] of Object.entries(after)) {
    assert.ok(/^src\/[a-zA-Z0-9._-]+\.js$/.test(path) || path === 'src/forge-editor-v130.css',
      'Source path outside the reviewed scope: ' + path);
    assert.ok(validHash(expected), 'Invalid source hash: ' + path);
    assert.equal(sha(readSource(path)), effective[path], 'Current V159 source changed: ' + path);
  }
  const changed = keys(before).filter(path => before[path] !== after[path]);
  const added = keys(after).filter(path => !Object.hasOwn(before, path));
  assert.ok(Array.isArray(bridge.transitions) && Array.isArray(bridge.addedSources));
  assert.deepEqual(bridge.transitions.map(row => row.path), changed, 'Declare every changed inherited V158 pin exactly once');
  assert.deepEqual(bridge.addedSources.map(row => row.path), added, 'Declare every newly audited V159 source exactly once');
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
  return Object.freeze({ inherited: 46, changed: changed.length, unchanged: 46 - changed.length,
    added: added.length, current: keys(after).length });
}

/** A historical caller may use successor bytes only after this exact bridge passes. */
export function resolveAuditSourcesV159(previous, readSource = readRepository, { effective = false } = {}) {
  // Absence of a successor must never admit a fabricated historical record.
  verifyAnchoredPredecessor(previous, readSource);
  let current;
  try {
    current = JSON.parse(readSource('docs/forge/xeno-trials/progress-v159.json'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return previous.runtimeSourceSha256;
  }
  verifyAuditSuccessionV159(previous, current, readSource);
  // Historical callers retain their exact V159 return by default. Earlier
  // bridges explicitly request the latest verified bytes for runtime checking.
  return effective ? resolveAuditSourcesV160(current, readSource, { effective: true }) : current.runtimeSourceSha256;
}

export function loadAuditSuccessionV159(readSource = readRepository) {
  const previous = JSON.parse(readSource('docs/forge/xeno-trials/progress-v158.json'));
  const current = JSON.parse(readSource('docs/forge/xeno-trials/progress-v159.json'));
  return { previous, current, result: verifyAuditSuccessionV159(previous, current, readSource) };
}
