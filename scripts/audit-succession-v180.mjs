/** Exact V179 -> V180 continuation. All V179 receipt constants remain frozen.
 * Runtime, release guards, bridge code and new inputs are admitted separately.
 * Byte identity does not imply artistic fidelity, native QA, CI or publication.
 */
import assert from 'node:assert/strict';
import { reviewedCompletionDigestV186 } from './audit-xeno-trials-completion-v186.mjs';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
export const V180_BASELINE_COMMIT = 'd516dda1f39d5112d46c638d2d58a06fdd2ecee3';
export const V180_V179_CONSTANTS_SHA256 = '649430808007c1e0b187b8cb7372c57ba6c958043d52d2b150b302e16c9b57d8';
export const V180_PROGRESS_V163_SHA256 = 'cc61060d14f3e7b5ecceccb7d36f897da8175965e7e15fb71a5de2be0676644a';

export const V180_RUNTIME_SUCCESSORS = freeze({
  "src/campaign-art-v179.js": {
    "previousSha256": "236176b3f18ae485b08ab79e32701829fdd4a284505231b7400ed7f972867d68",
    "currentSha256": "1b6b0e7a527b44af5c80e774a80917bad9e9f4df8191dad62793987f5e1ba79b"
  },
  "src/xeno-trials-arena-layers-v119.js": {
    "previousSha256": "3a2a12a55d1398cc16d039664c61f278a7b9f09779a92994c5efc79139bde2c8",
    "currentSha256": "43e7feec730713ae372295330631e1aeef3c5408287d8f7a295a7deba4716f47"
  },
  "src/xeno-trials-engine-v96.js": {
    "previousSha256": "48e4e6cc8091e2f266f0b6831eb5d08f523a9acc27ba1f23cea3f227aaf0a007",
    "currentSha256": "70fd084b65a5a2f1e8fa97754d6fb01651601c0221993e79d613ea7bf126e376"
  },
  "src/xeno-trials-modes-v119.js": {
    "previousSha256": "fa5c8127fa546c9276af3087ee8d9f14a87ccdb618c82dbae23a3f41fca87fb1",
    "currentSha256": "bb7783b5027b5a37970c76db1fd17fbe8e48a1078d7468d2feac1d30aa5f8956"
  },
  "src/xeno-trials-progress-v96.js": {
    "previousSha256": "2a05fd87e03bc90fea07855a1673371a6b6cee2964ba55b6b63c5fe7bc7475b0",
    "currentSha256": "9ea6d01aa7cad055b5f45ebf6c62f85ab2d14e4e74e9bc8cd87ef9289c9150d9"
  },
  "src/xeno-trials-runtime-v96.js": {
    "previousSha256": "ef87fa84ba5f085cd0fc973b40dfeb11cf832f88b5168e259c2bc406303a2867",
    "currentSha256": "ece4be24b60e91881292259c91c76f77f5f7da01d0cb196e4f6f4121a0306f41"
  },
  "src/xeno-trials-ui-v96.js": {
    "previousSha256": "b87beaa68aa701def2d0da4de5ef5ebedecf0ce03b3b5caf231de766963c61af",
    "currentSha256": "9cafc6217d0da3466f4a5e26809b70a8e68ae025eb7d779c58acb370f884fdd7"
  },
  "sw.js": {
    "previousSha256": "4be687c094d35f7487b92d40ede89504a60f9f5456999ab39367413e7bc6ca6d",
    "currentSha256": "9c24b8932ddcf30e836a363178be4148d6699cfbc631901255fdbd039225cc96"
  },
  "xeno-trials-fullscreen-v119.css": {
    "previousSha256": "861ce30fd8721d0406fdef9e6881ac3220f3a58ab4d46b7e1878463063b26682",
    "currentSha256": "bdd9199f651ef89eed8c9144acbf7a48351bcec8756b785df6e5d3c968f204c7"
  },
  "xeno-trials-v96.css": {
    "previousSha256": "7b34c819ecd9f6843d59f7534e902603ad80fa1b02d55ecdfc1ee5ac82a4b5ea",
    "currentSha256": "5ccc8bb23f3c16c8dfef230de5b05aa7d48ecd117df8a66fffe741b9f89bc2fa"
  }
});

export const V180_VERIFIER_SUCCESSORS = freeze({
  "scripts/build-asset-filter.mjs": {
    "previousSha256": "437088c9f62a81c645876d6d57afe3146ef87623fcdca5f85d5a7f9119835146",
    "currentSha256": "62ebdd3ce0c5d1d1c0667b838f32847be6b810a26828632c2edbc73dea2882dc"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "previousSha256": "0b313656796b64fcdf61e80eecf53baaf0370ff4c9c5b7482678b0d8b017f672",
    "currentSha256": "3cfb3d121479254176d06bf7f8ba9a2cc5eee8f0712bb6ede17a6d9929449377"
  },
  "scripts/verify-campaign-art-v179.mjs": {
    "previousSha256": "994769d1e8faff4a7ea90da1c136f96b0dba9ca8ecf2543ad50ec1430938ce53",
    "currentSha256": "bb611da3d6da3053e826a040b11e6fcfcf49011860758a1bd4aef2fcc06ff99a"
  },
  "scripts/verify-public-release-v86.mjs": {
    "previousSha256": "28722b10d8ef0b6e54f43c31f91a5fa5de1135b843245ff6de6dc379592d86fc",
    "currentSha256": "99fddfab82b05d18b40a06961cd6f42b8977a462c218d3699edd50cc575220ce"
  }
});

export const V180_BRIDGE_SUCCESSORS = freeze({
  "scripts/audit-succession-v162.mjs": {
    "previousSha256": "fef7a42ad1e0548ea08cbf8b5417279abb46f23187f0e2ce0d27875b34f36481",
    "currentSha256": "c1ae7027138160852b39d5082ce0c49d635807f930c35771cb078ec37411b5df"
  },
  "scripts/audit-succession-v163.mjs": {
    "previousSha256": "7ef9fd767712f8b24a41016cb41eb9df8b5fece6076b87a6abe4735f2ab1e346",
    "currentSha256": "bdc8ccb8d0b9a4dc3ff60b870894432c9223858c5d692882cff6aa1f70ab4e60"
  },
  "scripts/audit-succession-v179.mjs": {
    "previousSha256": "ffc287a474e65803a3ce52cee15347ceae331a056bb07882429373093e48e31f",
    "currentSha256": "59d8cb1b3f4cf0d0b42cb50bcd2d5d083b4ce9c149d80e2094bd9a605fb236ef"
  }
});

export const V180_NEW_RUNTIME_SOURCES = freeze({
  "src/campaign-art-v180.js": "51cbbe5caecd9efe4a5a2ed972cb68cda6ea579cf3bf3997a09e85a70ae7d8ca",
  "src/xeno-trials-horde-ui-v180.js": "393d5fa4d849aa799df4fe84924cb06ec61c586ed860c4a69e13652284045b3b",
  "src/xeno-trials-horde-v180.js": "2547bc192db6e69f8717aa822f1bba9aea4c1e16c942f3e86118cfe15218d0e6",
  "src/xeno-trials-stage-depth-v180.js": "60daeb77b6986bea8b2a4b6cdae57b69b36da6085a6e7b0cee33868ec732e74a",
  "src/xeno-trials-swarm-sprites-v180.js": "4ca13173505d69e04a818b98f56b3b1de1e41e4bfaa3d1c236b3313f58bddf06"
});

export const V180_NEW_VERIFIERS = freeze({
  "scripts/public-campaign-art-admissions-v180.mjs": "9c278a1ddf7588064bb504289c62a114caf9473153649ff8470a2c5e85de92ba",
  "scripts/verify-campaign-art-v180.mjs": "30172790d2329b5f96460e88e21ed06ceecc3a7476f7a307c1f982071f770668",
  "scripts/verify-xeno-trials-horde-runtime-v180.mjs": "556aee90fae398fb2959dbaf833d533b2d132d6ef1f8530770e2a9f1859dc3eb",
  "scripts/verify-xeno-trials-horde-ui-v180.mjs": "5726b712abe7debf99b99271f47022230ecaeb191bff108529105fb9cd5e2fd2",
  "scripts/verify-xeno-trials-horde-v180.mjs": "48dfaa5b94212ed6cff67e4e727c7d7f0632545628b83dc88733edb0c017ddf7",
  "scripts/verify-xeno-trials-stage-depth-v180.mjs": "468f4cce9af4d5d8cc9110746045be9576ea40f0511c21efc88e1811160c9bd8",
  "scripts/verify-xeno-trials-swarm-sprites-v180.mjs": "044e69ecd5a0cae4586394c0a876dd57d7aed7af54446abc36c606608398c28a"
});

const successorMaps = [V180_RUNTIME_SUCCESSORS, V180_VERIFIER_SUCCESSORS, V180_BRIDGE_SUCCESSORS];
/** Only an exact reviewed V179 endpoint may advance. Unknown paths retain their
 * earlier digest; no prefix, unknown version or caller-supplied hash is admitted.
 */
export function reviewedDigestV180(path, endpointV179) {
  const found = successorMaps.filter(map => Object.hasOwn(map, path)).map(map => map[path]);
  assert.ok(found.length <= 1, 'Ambiguous V180 successor: ' + path);
  if (!found.length) return endpointV179;
  const receipt = found[0];
  assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
  assert.equal(endpointV179, receipt.previousSha256, 'Incorrect V179 endpoint for V180: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V180 digest: ' + path);
  assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'Unchanged V180 successor: ' + path);
  return receipt.currentSha256;
}
export function verifyFollowupV180(readSource = readRepository) {
  const allPaths = [];
  for (const map of successorMaps) for (const [path, receipt] of Object.entries(map)) {
    assert.ok(path === 'sw.js' || /^(?:src\/[a-zA-Z0-9._-]+\.(?:js|css)|[a-zA-Z0-9._-]+\.css|scripts\/[a-zA-Z0-9._-]+\.mjs)$/.test(path), 'Invalid V180 successor path: ' + path);
    allPaths.push(path);
    assert.equal(sha(readSource(path)), reviewedCompletionDigestV186(path, reviewedDigestV180(path, receipt.previousSha256)), 'Unreviewed V180 successor bytes: ' + path);
  }
  for (const map of [V180_NEW_RUNTIME_SOURCES, V180_NEW_VERIFIERS]) for (const [path, digest] of Object.entries(map)) {
    assert.match(path, /^(?:src\/[a-zA-Z0-9._-]+\.js|scripts\/(?:verify-|public-campaign-art-admissions-)[a-zA-Z0-9._-]+\.mjs)$/);
    allPaths.push(path);
    assert.ok(validHash(digest), 'Invalid V180 added-source digest: ' + path);
    assert.equal(sha(readSource(path)), reviewedCompletionDigestV186(path, digest), 'Unreviewed V180 added-source bytes: ' + path);
  }
  assert.equal(new Set(allPaths).size, allPaths.length, 'Duplicate V180 source admission');
  assert.equal(sha(readSource('docs/forge/xeno-trials/progress-v163.json')), reviewedCompletionDigestV186('docs/forge/xeno-trials/progress-v163.json', V180_PROGRESS_V163_SHA256), 'Historical V163/V179 progress changed');
  return Object.freeze({ baselineCommit: V180_BASELINE_COMMIT,
    runtimeSuccessors: Object.keys(V180_RUNTIME_SUCCESSORS).length,
    verifierSuccessors: Object.keys(V180_VERIFIER_SUCCESSORS).length,
    bridgeSuccessors: Object.keys(V180_BRIDGE_SUCCESSORS).length,
    newRuntimeSources: Object.keys(V180_NEW_RUNTIME_SOURCES).length,
    newVerifiers: Object.keys(V180_NEW_VERIFIERS).length });
}
