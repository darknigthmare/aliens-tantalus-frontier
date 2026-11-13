/** Exact e1d5358 V188 -> V189 animation/audio continuation.
 * This terminal audit preserves all 71 V186 and 48 V188 receipts. It admits
 * only named byte-pinned successors and new inputs; it neither records nor
 * transfers runtime QA, publication or artistic fidelity outcomes.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const safe = path => typeof path === 'string' && /^[a-zA-Z0-9._/-]+$/.test(path) && !path.startsWith('/') && !path.split('/').some(part => part === '..' || !part);
export const ANIMATION_AUDIO_BASELINE_V189 = 'e1d53588f3b56d89ab593f36c3b9cc337c5eadc1';
export const ANIMATION_AUDIO_COMPLETION_RECEIPTS_SHA256_V189 = '9c864a391884bd01ec0c4091515d10a7ed6eaf88b93281c0bfec94caabff0495';
export const ANIMATION_AUDIO_SUCCESSORS_V189 = freeze({
  "package.json": {
    "kind": "configuration",
    "previousSha256": "426dc60d498215db555f920f0f1887603ca4c2d8565df2b309d91b28647fcf3e",
    "currentSha256": "8b397bb663172899a40ef35a29e30fcedda645c20b2bad1ed316df45fba6fbc9"
  },
  "scripts/audit-xeno-stage-operations-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "9efa1c335c65d55fbe90f042ede940173193e2ff2a6f30aee49eea4a54566713",
    "currentSha256": "2d443a1ced4110bf4ed174a19ac8cf7f3e5167eee046efe8462e8d653d8185c6"
  },
  "scripts/build.mjs": {
    "kind": "verifier",
    "previousSha256": "969c23ab4ad800b394b7648eabaca7e7858e7cd078c84f4bb41a7094cb233fd0",
    "currentSha256": "f95c67ae8bcdfe6bfdd46bb4bd40a60612aa0a5d50d8e6cf865620f73b14c527"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "verifier",
    "previousSha256": "2f6de90b5a70adfc6955209bf52b6f9952a977282ad529cec75e9a6c184016ab",
    "currentSha256": "9805093a116d433e08d50ff76f8e4cbe59f0b5895293f99f863f7a5181e8c93a"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "d6441feb3b2faa6be8a632b9a71104a7e40d8710944f854ba83918ffc62d9c77",
    "currentSha256": "10e3f42fcac656fc36ad7175a10c5a499f78e04a1f2b5a06f465336a613f3ba9"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "verifier",
    "previousSha256": "3657eefb8f830299769013ecd896658b859e26a6a5a0a62139e99f454c3d5640",
    "currentSha256": "d9c25a2a1da5275e78927bfce432f4c5744103f92f74bd07d0015818c354bb31"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "verifier",
    "previousSha256": "e332ae4eece9dfb4ffe5ae06d86acb53f35a6b2a87caf7cf4cbb3aa0a2e2f564",
    "currentSha256": "546c53a72d0f6f645d766d7e9e9c9f987c5537a551185d080141756aeb08fd3d"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "0709d6c5b179e3ac2bb247376bcbb8d30806315e1baa83fd99e0760ff5bdabdc",
    "currentSha256": "bbf8b114717ee921d9584e33dfc2439ef31e2e56db6c8fc647ecbc2e30a1a764"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "06a1235048d275a69d8bc464ef6a10669883880a2f96fa2bc93632870cecab9d",
    "currentSha256": "64daefd4c2740980a5d4a2c0f542b84cdefbda17b744c45ca79a49eb52b9cbb3"
  },
  "scripts/verify-xeno-trials-i18n-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "71add1b89f3669945439bc7d56af540ad78ee7a7f3402e08650860b3f12f57f1",
    "currentSha256": "06535328cb13470bf34990cbb015bc6d5532744cfa51f3b74bf3c7459e583e2b"
  },
  "scripts/verify-xeno-trials-operation-i18n-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "2cb20968045b64da073d87cbbbd374846879af48ed71fdfa1bf71bb0b7cf40cd",
    "currentSha256": "af9fea1b43651c08f61f0a1d85ee1ac1754e492229e4ac13102902735c587079"
  },
  "src/app.js": {
    "kind": "runtime",
    "previousSha256": "0cac52e537a5cab042d8820dd689453dada7b2ba2a86ccb3f353bdcbc8d0c546",
    "currentSha256": "7cd214baa4d5b8aabc28c4887539024e0f3cc412567552b4fab197e00073aed3"
  },
  "src/i18n-en-catalog-v185.js": {
    "kind": "runtime",
    "previousSha256": "b518392cdae2055ef484586491176f5f187d2bf879065c1e91c3b9a8408c561e",
    "currentSha256": "60b5ad93be9cce46bd0d91b334f1b135654e368f16a46612554175df167f1dc3"
  },
  "src/xeno-trials-reactions-v186.js": {
    "kind": "runtime",
    "previousSha256": "2495e92a7e481e726e558df4708439a4bcd9083dca215d00b9c1d99c1c870e1b",
    "currentSha256": "f0f01ee666d625e836c2889ae3e383cf29cf98c85dbef1491c4ba26a8a5a9fec"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "previousSha256": "eee1197255704dcf2dc299878d033baa72eb7894483bb4c47d0c40ed32382ea7",
    "currentSha256": "4a514c2ee4fe5e222168800fb27343b57a97b0273b2b8941230a057d9821da61"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "previousSha256": "a2a7f3cc5ee7c7e1290c8f5710321c9791f502a3de9d06dbe18ecbcf1764dcc1",
    "currentSha256": "2e53bfaba41b0a098881e7327a69ab164fbee152ea5fca645b9fbe51e517be0c"
  },
  "sw.js": {
    "kind": "runtime",
    "previousSha256": "28dda3a993e1e60749e59d8a17fffc4ac94f9d97bba90d8efa6dfe02962dc655",
    "currentSha256": "da082382d5943a8f0fbed86b897cbb4a397927dd51a3fc4fea85cc42fe734fc6"
  }
});
export const ANIMATION_AUDIO_NEW_INPUTS_V189 = freeze({
  "scripts/qa-xeno-trials-animation-audio-v189.py": {
    "kind": "verifier",
    "sha256": "e4ae1f33911e00318d5f7032bea2f5335ad79210423c8c133924c02d29af43df"
  },
  "assets/openai/sprites/xeno-trials-v189/burster-combat-sheet.png": {
    "kind": "asset",
    "sha256": "7227ce060096ee89b004df1afc4825fc56d7074d940455d400a289f5b0a3ec46"
  },
  "assets/openai/sprites/xeno-trials-v189/crusher-acm-combat-sheet.png": {
    "kind": "asset",
    "sha256": "ee54a9038466e6a8a9969c8b7f437ea628f94625d37b183b0c31b9ca0fcd3850"
  },
  "assets/openai/sprites/xeno-trials-v189/prowler-motion-sheet.png": {
    "kind": "asset",
    "sha256": "18a82319135b052a164606ce76699cd612deb7b78323a67c2bb10bfcb1b8c29e"
  },
  "assets/openai/sprites/xeno-trials-v189/queen-combat-sheet.png": {
    "kind": "asset",
    "sha256": "9a5713bec8891e44a80f9613a5be9dbb28c643dfe6490cfe5da6af3558521892"
  },
  "assets/openai/sprites/xeno-trials-v189/ravager-combat-sheet.png": {
    "kind": "asset",
    "sha256": "adf1653945d6896211049ddff6f8bfd43780cf27c4ec22eba6cd44dc9fc27ab5"
  },
  "assets/openai/sprites/xeno-trials-v189/runner-motion-sheet.png": {
    "kind": "asset",
    "sha256": "d065e3fa0dd3ba01b38e03c9a1c46cbb43472a58442988502c7cb0ffcb4038ef"
  },
  "assets/openai/sprites/xeno-trials-v189/spitter-motion-sheet.png": {
    "kind": "asset",
    "sha256": "f65d382f75147dc754a56bd207ff72026d88924af225b88dc7788de566213885"
  },
  "assets/openai/sprites/xeno-trials-v189/warrior-motion-sheet.png": {
    "kind": "asset",
    "sha256": "94427ecc53b8e4388b5af3a3ade4c41e017ff2b071e4f47623ee3f7888e6faf8"
  },
  "docs/forge/xeno-trials/animation-coverage-v189.json": {
    "kind": "document-input",
    "sha256": "c02b0bea83ee17be76564cd2ac690e29a9bac06b91ba6d6779084dce3fb36e76"
  },
  "docs/forge/xeno-trials/i18n-animation-audio-review-v189.json": {
    "kind": "document-input",
    "sha256": "efa465772aa15113bd95ba469813df706310d21fb57dcd424030260a4741170c"
  },
  "docs/forge/xeno-trials/sprite-motion-production-v189.json": {
    "kind": "document-input",
    "sha256": "76d1ec46dae9338decb6a6d85770c4facb42cfe209efe9b627c19f38c453c6cd"
  },
  "docs/forge/xeno-trials/sprite-production-v189.json": {
    "kind": "document-input",
    "sha256": "91c2e24d4c8802b813ebf889c9fa0ee102e19239f8b73aab69e3fd511b5a172e"
  },
  "scripts/public-xeno-sprite-admissions-v189.mjs": {
    "kind": "verifier",
    "sha256": "0c1d4936be41489b1d184a0005690142c25e51eb4085782d6d31284a18fda5c0"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "verifier",
    "sha256": "b3c14d53591f5e6a7f907d0a1a93298887c19671137cca1d377b6d2d6ef2d2c7"
  },
  "scripts/verify-xeno-trials-animation-audio-i18n-v189.mjs": {
    "kind": "verifier",
    "sha256": "cf9c60d0a24858ed60c6761ff5da2a24cf4de4201d8987bb577c1648d40e4735"
  },
  "scripts/verify-xeno-trials-animation-coverage-v189.mjs": {
    "kind": "verifier",
    "sha256": "2a9634934eea04372a9b8cef745308854a8d809d0bc56bb6571d840dd7468daf"
  },
  "scripts/verify-xeno-trials-animation-ui-v189.mjs": {
    "kind": "verifier",
    "sha256": "10f7eac763b1bd38f91a10e621df5c1be381bcd2d42378efc3aa58cca555e5bb"
  },
  "scripts/verify-xeno-trials-audio-v189.mjs": {
    "kind": "verifier",
    "sha256": "444a6ada0303b7974233f101c08b1c6f85ab0273e8ff00e64c4c8e154b6b7274"
  },
  "scripts/verify-xeno-trials-runtime-animation-audio-v189.mjs": {
    "kind": "verifier",
    "sha256": "d000f6f483b61ccdb23a226ed5aa114aa3272f3faf1acd38fb59e3a0a4373652"
  },
  "scripts/verify-xeno-trials-sprite-atlas-v189.mjs": {
    "kind": "verifier",
    "sha256": "c16c131a726a1c6bb9f6f7de0cceb527f0e49f4e50b1f95b2ec318fe763ae428"
  },
  "src/xeno-trials-animation-coverage-v189.js": {
    "kind": "runtime",
    "sha256": "ee0f9d0236970b49a5138ea5223ec0aa33b6b5abdaaeba99ddf6a23a45fbf20c"
  },
  "src/xeno-trials-audio-v189.js": {
    "kind": "runtime",
    "sha256": "d1de5ff5d208c1ec22c18a7b72fed2a58bc887e39a4211a9075d299e7ddfd5fc"
  },
  "src/xeno-trials-sprite-atlas-data-v189.js": {
    "kind": "runtime",
    "sha256": "7f5e9c5a4354564de80f15a18411fb7eebd3c3255b256f24a657181ed7ad2770"
  },
  "src/xeno-trials-sprite-atlas-v189.js": {
    "kind": "runtime",
    "sha256": "5e17f98ec7c4c27c6f567d11a88850cda3defcd5866ad7aea1da75bf727b2b97"
  }
});
export const ANIMATION_AUDIO_PRESERVED_PLATES_V189 = freeze({
  "assets/user/castes-v87/film_queen_aliens_1986.png": "985abf27db63400d8a6a68101bfaa7dde3335da0e8986ea85c409ab30da5e991",
  "assets/user/castes-v87/game_acm_crusher.png": "eca7855c29455b87bf9fc4e26afe2ab07adbd3ff4afa2c5ffb36dc6b4ebc2baa",
  "assets/user/castes-v87/game_avp_extinction_ravager.png": "7e2d1e236ef7de411c5458aee40520951c2c6dec2dc932a21164eea087738cbe",
  "assets/user/castes-v87/game_afe_burster.png": "b2db2418502099d9f2551434cf207ef72fe0a09dc68914fbc85e18705720ce13"
});

/** A current digest is never accepted as its own predecessor. Unknown paths
 * retain their earlier endpoint; they gain no new source admission. */
export function reviewedAnimationAudioDigestV189(path, endpointV188) {
  const receipt = ANIMATION_AUDIO_SUCCESSORS_V189[path];
  if (!receipt) return endpointV188;
  assert.equal(endpointV188, receipt.previousSha256, 'Incorrect V188 endpoint for V189: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V189 successor digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'Unchanged V189 successor: ' + path);
  return receipt.currentSha256;
}
/** Used only after the complete chain has verified all physical source bytes.
 * Some historical integration paths already export the final reviewed endpoint;
 * avoid applying a strict predecessor transition twice to that exact value. */
export function animationAudioRuntimeSourcesV189(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(ANIMATION_AUDIO_SUCCESSORS_V189)) if (receipt.kind === 'runtime') {
    if (result[path] !== undefined && result[path] !== receipt.currentSha256)
      assert.equal(result[path], receipt.previousSha256, 'Incorrect V189 runtime view predecessor: ' + path);
    result[path] = receipt.currentSha256;
  }
  for (const [path, receipt] of Object.entries(ANIMATION_AUDIO_NEW_INPUTS_V189))
    if (receipt.kind === 'runtime') result[path] = receipt.sha256;
  return Object.freeze(result);
}
export function verifyAnimationAudioV189(readSource = readRepository) {
  const paths = [], kinds = ['runtime', 'verifier', 'asset', 'configuration', 'document-input'];
  for (const [path, receipt] of Object.entries(ANIMATION_AUDIO_SUCCESSORS_V189)) {
    assert.ok(safe(path), 'Unsafe V189 successor path: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'kind', 'previousSha256']);
    assert.ok(kinds.includes(receipt.kind)); paths.push(path);
    assert.equal(sha(readSource(path)), reviewedAnimationAudioDigestV189(path, receipt.previousSha256), 'Unreviewed V189 successor bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(ANIMATION_AUDIO_NEW_INPUTS_V189)) {
    assert.ok(safe(path), 'Unsafe V189 added-input path: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['kind', 'sha256']);
    assert.ok(kinds.includes(receipt.kind) && validHash(receipt.sha256)); paths.push(path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V189 added-input bytes: ' + path);
  }
  for (const [path, digest] of Object.entries(ANIMATION_AUDIO_PRESERVED_PLATES_V189)) {
    assert.ok(safe(path) && validHash(digest)); paths.push(path);
    assert.equal(sha(readSource(path)), digest, 'Historical source plate changed: ' + path);
  }
  assert.equal(new Set(paths).size, paths.length, 'Duplicate V189 source admission');
  assert.equal(paths.includes('scripts/audit-xeno-animation-audio-v189.mjs'), false, 'V189 cannot admit its own bytes');
  const stage = readSource('scripts/audit-xeno-stage-operations-v188.mjs').toString();
  const stageStart = stage.indexOf('export const STAGE_OPERATIONS_BASELINE_V188'), stageEnd = stage.indexOf('\nexport function reviewedStageOperationsDigestV188');
  assert.ok(stageStart >= 0 && stageEnd > stageStart);
  assert.equal(sha(stage.slice(stageStart, stageEnd)), '877b259c841594d4a0cddca47c8977d389bf6c68816951dcbe95389bd49708e4', 'Historical V188 receipt declarations changed');
  const completion = readSource('scripts/audit-xeno-trials-completion-v186.mjs').toString();
  const start = completion.indexOf('export const COMPLETION_BASELINES_V186'), end = completion.indexOf('\nexport function reviewedCompletionDigestV186');
  assert.ok(start >= 0 && end > start);
  assert.equal(sha(completion.slice(start, end)), ANIMATION_AUDIO_COMPLETION_RECEIPTS_SHA256_V189, 'Historical V186 receipt declarations changed');
  return Object.freeze({ baselineCommit: ANIMATION_AUDIO_BASELINE_V189,
    successors: Object.keys(ANIMATION_AUDIO_SUCCESSORS_V189).length,
    addedInputs: Object.keys(ANIMATION_AUDIO_NEW_INPUTS_V189).length,
    preservedPlates: Object.keys(ANIMATION_AUDIO_PRESERVED_PLATES_V189).length,
    historicalResultsTransferred: false });
}
