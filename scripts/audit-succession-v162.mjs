/** Byte-anchored V161 -> V162 continuation; historical source pins are immutable. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolveAuditSourcesV163, ARSENAL_V167_SUCCESSORS, ARMORY_V169_SUCCESSORS, ARSENAL_V170_SUCCESSORS, ARSENAL_V171_SUCCESSORS, ARMORY_V174_ECONOMY_SUCCESSORS } from './audit-succession-v163.mjs';

export const AUDIT_PREDECESSOR_DOCUMENTS_V162 = Object.freeze({
  "docs/forge/xeno-trials/V161-REMAINING-WORKSTREAMS.md": "741f7d28c2373722d208dd80383ae7c4e22142b91177420be7723c41e1053050",
  "docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V161.xlsx": "a16933dd541e60e5b69307d300962d3fe9e1994cf31c5669926ef94efc226fd0",
  "docs/forge/xeno-trials/progress-v161.json": "002e0a398f12d17369d9d6e1c222b65aa7b1dedd554b86a7024d830edb8a7739"
});

/** User deferred Forge. These32 baseline modules are inspected without changing them. */
export const AUDIT_DEFERRED_FORGE_SOURCES_V162 = Object.freeze({
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

function anchoredPredecessor(previous, readSource) {
  let anchored;
  for (const [path, expected] of Object.entries(AUDIT_PREDECESSOR_DOCUMENTS_V162)) {
    const bytes = readSource(path);
    assert.equal(sha(bytes), expected, 'Historical V161 document changed: ' + path);
    if (path.endsWith('/progress-v161.json')) anchored = JSON.parse(bytes);
  }
  assert.deepEqual(previous, anchored, 'Previous contract must be the byte-anchored V161 public record');
}

export function verifyAuditSuccessionV162(previous, current, readSource = readRepository) {
  anchoredPredecessor(previous, readSource);
  assert.equal(previous.lot, 'V161');
  assert.equal(current?.lot, 'V162');
  assert.equal(current.publicationState, 'PREPUBLICATION');
  const bridge = current.runtimeSuccession;
  assert.equal(bridge?.schema, 1);
  assert.equal(bridge.from, 'V161');
  assert.equal(bridge.to, 'V162');
  assert.deepEqual(bridge.predecessorDocuments, AUDIT_PREDECESSOR_DOCUMENTS_V162);
  assert.equal(current.deferredForge?.state, 'DEFERRED_BY_USER');
  assert.deepEqual(current.deferredForge.sourceSha256, AUDIT_DEFERRED_FORGE_SOURCES_V162);
  // Historical pins stay fixed; only a fully verified successor can supply newer bytes.
  const effective = resolveAuditSourcesV163(current, readSource, { effective: true });
  for (const [path, expected] of Object.entries(AUDIT_DEFERRED_FORGE_SOURCES_V162))
    assert.equal(sha(readSource(path)), effective[path] ?? expected, 'Deferred Forge module changed: ' + path);
  const before = previous.runtimeSourceSha256, after = current.runtimeSourceSha256;
  assert.equal(keys(before).length, 82);
  assert.ok(after && keys(after).length >= 82);
  for (const path of keys(before)) assert.ok(Object.hasOwn(after, path), 'Inherited V161 source omitted: ' + path);
  for (const [path, expected] of Object.entries(after)) {
    assert.ok(/^src\/[a-zA-Z0-9._-]+\.(?:js|css)$/.test(path)
      || /^[a-zA-Z0-9._-]+\.css$/.test(path) || ['index.html', 'sw.js'].includes(path),
    'Source path outside the reviewed runtime scope: ' + path);
    assert.ok(validHash(expected), 'Invalid source hash: ' + path);
    const observedSha = sha(readSource(path));
    const next = Object.hasOwn(ARSENAL_V167_SUCCESSORS, path) ? ARSENAL_V167_SUCCESSORS[path] : null;
    if (next) {
      // V162/V163 records remain frozen: verify both the historical anchor
      // and the exact reviewed V167 replacement, not an unbounded whitelist.
      // The V162 and V163 archives can have different historical hashes.
      // V163 independently attests previousSha256; the V162 bridge and
      // its immutable transition list authenticate this older expected hash.
      const currentSha = ARMORY_V174_ECONOMY_SUCCESSORS[path]?.currentSha256 ?? ARSENAL_V171_SUCCESSORS[path]?.currentSha256 ?? ARSENAL_V170_SUCCESSORS[path]?.currentSha256 ?? ARMORY_V169_SUCCESSORS[path]?.currentSha256 ?? next.currentSha256;
      assert.equal(effective[path], currentSha, 'Incorrect effective successor hash: ' + path);
      assert.equal(observedSha, currentSha, 'Unexpected reviewed successor: ' + path);
    } else {
      assert.equal(observedSha, effective[path], 'Current V162 source changed: ' + path);
    }
  }
  const changed = keys(before).filter(path => before[path] !== after[path]);
  const added = keys(after).filter(path => !Object.hasOwn(before, path));
  for (const path of [...changed, ...added]) assert.ok(!path.startsWith('src/forge'), 'Forge is deferred by the user: ' + path);
  assert.ok(Array.isArray(bridge.transitions) && Array.isArray(bridge.addedSources));
  assert.deepEqual(bridge.transitions.map(row => row.path), changed, 'Declare every changed inherited V161 source exactly once');
  assert.deepEqual(bridge.addedSources.map(row => row.path), added, 'Declare every new V162 source exactly once');
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
  return Object.freeze({ inherited: 82, changed: changed.length, unchanged: 82 - changed.length,
    added: added.length, current: keys(after).length });
}

/** A missing successor preserves the anchored record; invalid content never falls back. */
export function resolveAuditSourcesV162(previous, readSource = readRepository, { effective = false } = {}) {
  anchoredPredecessor(previous, readSource);
  let current;
  try {
    current = JSON.parse(readSource('docs/forge/xeno-trials/progress-v162.json'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return previous.runtimeSourceSha256;
  }
  verifyAuditSuccessionV162(previous, current, readSource);
  return effective ? resolveAuditSourcesV163(current, readSource, { effective: true }) : current.runtimeSourceSha256;
}

export function loadAuditSuccessionV162(readSource = readRepository) {
  const previous = JSON.parse(readSource('docs/forge/xeno-trials/progress-v161.json'));
  const current = JSON.parse(readSource('docs/forge/xeno-trials/progress-v162.json'));
  return { previous, current, result: verifyAuditSuccessionV162(previous, current, readSource) };
}
