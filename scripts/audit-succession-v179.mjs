/** Exact V178 -> V179 source continuation. No historical receipt is rewritten.
 * This development-only module pins the changed bridges/verifiers separately,
 * avoiding self-referential hashes inside those files. Receipts attest bytes,
 * never native gameplay, artistic fidelity, CI, publication or completion.
 */
import assert from 'node:assert/strict';
import { reviewedCompletionDigestV186 } from './audit-xeno-trials-completion-v186.mjs';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { reviewedDigestV180 } from './audit-succession-v180.mjs';
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
export const V179_BASELINE_COMMIT = 'd41b5fc120da2e7a5938308f9d3c852d20e53cc5';

export const V179_RUNTIME_SUCCESSORS = freeze({
  "src/app.js": {
    "previousSha256": "6de0d078732aea1477034d9f67e71a112c57f8cf57b0d9bb2b750b776d8141e0",
    "currentSha256": "65de8b68f03f1855fcaeb231491f88c23583e06038cc6c5c624208cee5b0c540"
  },
  "src/mission-insertion-ui-v62.js": {
    "previousSha256": "1e8b4c42e6b5115ff75e86c50dbace7d649c8a4b244629c7788b963a6c690dc5",
    "currentSha256": "5de383b9379b5466c783abeabf1b800816adbd273d48dafc0d7b7c91caa639bf"
  },
  "src/xeno-trials-data-v96.js": {
    "previousSha256": "14e11161a71b2a65a70c085f17e4c169df2f89b3cc196bc8aeaec07af1baf5be",
    "currentSha256": "e98af33016b8ba0503b70b7e6bd755f1127722d023dd5138fed8e133bf42f33b"
  },
  "src/xeno-trials-modes-v119.js": {
    "previousSha256": "756af6bc90755f16a6afdf3e256082a3281698045ff16a642f2e8e2e0fce4dfd",
    "currentSha256": "fa5c8127fa546c9276af3087ee8d9f14a87ccdb618c82dbae23a3f41fca87fb1"
  },
  "src/xeno-trials-progress-v96.js": {
    "previousSha256": "168a272b5c8b82cc4e5770cc48e261bd2725984eafeba566363b9b488a5da0fa",
    "currentSha256": "2a05fd87e03bc90fea07855a1673371a6b6cee2964ba55b6b63c5fe7bc7475b0"
  },
  "src/xeno-trials-stage-motion-v147.js": {
    "previousSha256": "9a23ffd03d4997f14d81c4184000e47dfdf9d33d500f30a1b001db3600faacd7",
    "currentSha256": "4f7313115c2fb5e420ac86d5af537507a18a4e3f0542efd97a41dce582a9e847"
  },
  "src/xeno-trials-ui-v96.js": {
    "previousSha256": "afcbe460f875f5f03285a4b2b509bbdebdbba081dd7d18447a33f97a0231568a",
    "currentSha256": "b87beaa68aa701def2d0da4de5ef5ebedecf0ce03b3b5caf231de766963c61af"
  },
  "sw.js": {
    "previousSha256": "cca2f58e7c34952e15d0238edeb9d5606d8766b4bea15da955b61aa3a718bfaf",
    "currentSha256": "4be687c094d35f7487b92d40ede89504a60f9f5456999ab39367413e7bc6ca6d"
  }
});

export const V179_VERIFIER_SUCCESSORS = freeze({
  "scripts/verify-audit-continuation-v163.mjs": {
    "previousSha256": "da597b00722760cf102956851cbd14423a66d77a4fc04ff0a1f6bb000a441291",
    "currentSha256": "0b313656796b64fcdf61e80eecf53baaf0370ff4c9c5b7482678b0d8b017f672"
  },
  "scripts/verify-public-release-v86.mjs": {
    "previousSha256": "bc913fdd26cd4af6eb67889002559e88e6e98f4952b2712c9186f006376222ab",
    "currentSha256": "28722b10d8ef0b6e54f43c31f91a5fa5de1135b843245ff6de6dc379592d86fc"
  },
  "scripts/verify-xeno-trials-feedback-v149.mjs": {
    "previousSha256": "e9b3f36763c67348a50d00b4e21fa3012e6c3554496004d3a14746b684a1e561",
    "currentSha256": "6cc6b2229a677233405effd1d5b02f4ac81e390e9a6df7e5fb523cb69b158d5f"
  },
  "scripts/verify-xeno-trials-plan-v146.mjs": {
    "previousSha256": "62b344b8572fbe7ebdcc733d846c17f356227aa49ee24084527b380902508b6a",
    "currentSha256": "b9cc15d2912840d8ee02dd469062081af0253d9c858f6e35a07e22effff7c09c"
  }
});

export const V179_BRIDGE_SUCCESSORS = freeze({
  "scripts/audit-succession-v162.mjs": {
    "previousSha256": "6fd7253c4afea86d324de11cdb432772250f222c7e25cdd7df3be618135e0806",
    "currentSha256": "fef7a42ad1e0548ea08cbf8b5417279abb46f23187f0e2ce0d27875b34f36481"
  },
  "scripts/audit-succession-v163.mjs": {
    "previousSha256": "f57a6f4cb1e76cd32d98f4824b26795e0445e5bfbc00aedd687ee18b67cf994c",
    "currentSha256": "7ef9fd767712f8b24a41016cb41eb9df8b5fece6076b87a6abe4735f2ab1e346"
  }
});

export const V179_NEW_RUNTIME_SOURCES = freeze({
  "src/campaign-art-v179.js": "236176b3f18ae485b08ab79e32701829fdd4a284505231b7400ed7f972867d68",
  "src/xeno-trials-boss-stages-v179.js": "3c4e7f8bf5289fe302e4a008307c842bb93c1ac49b0af9e83c1e073147e91247",
  "src/xeno-trials-challenge-curriculum-v179.js": "e35fc8003f9cacdc44085edc05c01b7576362e5c388484668219f95900862dae",
  "src/xeno-trials-events-v179.js": "b5fe271f5e76c08215bd9a85b8f0bc65598e3771fa842bb22854b1625e625b69",
  "src/xeno-trials-roster-v179.js": "2b0c7eceb3acc605fb2077767b5fa5e9675fb7daadeb6f9b46067627e19c7234"
});

export const V179_NEW_VERIFIERS = freeze({
  "scripts/verify-campaign-art-v179.mjs": "994769d1e8faff4a7ea90da1c136f96b0dba9ca8ecf2543ad50ec1430938ce53",
  "scripts/verify-xeno-trials-boss-stages-v179.mjs": "dacd2bf22f3616fbeba14dcd1a874e3ce287dc9f1c204a8b485dedf4a1294c2d",
  "scripts/verify-xeno-trials-curriculum-v179.mjs": "b8a7a233c1ea0fc2206df69aca1e877ec74298d148e49ec561c630150d9bd820",
  "scripts/verify-xeno-trials-events-v179.mjs": "aad8646f247fef73f644a252329522f5c20a95524d6f033f5c7bbe104dda8be4",
  "scripts/verify-xeno-trials-roster-v179.mjs": "9399d4156d69c03a86058a314d68738fd04ddfb8abba401ac8dfe070a5cc2989",
  "scripts/verify-xeno-trials-tickets-v179.mjs": "941727b23339b64e578fc4e7177e1f7443c2de57bce8e9ffdcce6439cb33b506"
});

const successorMaps = [V179_RUNTIME_SUCCESSORS, V179_VERIFIER_SUCCESSORS, V179_BRIDGE_SUCCESSORS];
/** The input must be the exact endpoint reviewed at HEAD V178. Unknown paths
 * retain their earlier digest; only entries in the pinned maps can advance.
 */
export function reviewedDigestV179(path, endpointV178) {
  const found = successorMaps.filter(map => Object.hasOwn(map, path)).map(map => map[path]);
  assert.ok(found.length <= 1, 'Ambiguous V179 successor: ' + path);
  if (!found.length) return endpointV178;
  const receipt = found[0];
  assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
  assert.equal(endpointV178, receipt.previousSha256, 'Incorrect V178 endpoint for V179: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V179 digest: ' + path);
  assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'Unchanged V179 successor: ' + path);
  return receipt.currentSha256;
}

export function verifyFollowupV179(readSource = readRepository) {
  const allPaths = [];
  for (const map of successorMaps) for (const [path, receipt] of Object.entries(map)) {
    assert.ok(path === 'sw.js' || /^(?:src\/[a-zA-Z0-9._-]+\.js|scripts\/[a-zA-Z0-9._-]+\.mjs)$/.test(path), 'Invalid V179 successor path: ' + path);
    allPaths.push(path);
    const digest = reviewedCompletionDigestV186(path, reviewedDigestV180(path, reviewedDigestV179(path, receipt.previousSha256)));
    assert.equal(sha(readSource(path)), digest, 'Unreviewed V179 successor bytes: ' + path);
  }
  for (const map of [V179_NEW_RUNTIME_SOURCES, V179_NEW_VERIFIERS]) for (const [path, digest] of Object.entries(map)) {
    assert.match(path, /^(?:src\/[a-zA-Z0-9._-]+\.js|scripts\/verify-[a-zA-Z0-9._-]+\.mjs)$/);
    allPaths.push(path);
    assert.ok(validHash(digest), 'Invalid V179 added-source digest: ' + path);
    assert.equal(sha(readSource(path)), reviewedCompletionDigestV186(path, reviewedDigestV180(path, digest)), 'Unreviewed V179 added-source bytes: ' + path);
  }
  assert.equal(new Set(allPaths).size, allPaths.length, 'Duplicate V179 source admission');
  return Object.freeze({ baselineCommit: V179_BASELINE_COMMIT,
    runtimeSuccessors: Object.keys(V179_RUNTIME_SUCCESSORS).length,
    verifierSuccessors: Object.keys(V179_VERIFIER_SUCCESSORS).length,
    bridgeSuccessors: Object.keys(V179_BRIDGE_SUCCESSORS).length,
    newRuntimeSources: Object.keys(V179_NEW_RUNTIME_SOURCES).length,
    newVerifiers: Object.keys(V179_NEW_VERIFIERS).length });
}
