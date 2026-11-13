/** Exact bf42bc7 completion -> V188 stage-operations continuation.
 * This V188 join preserves all 71 V186 receipt declarations. It admits
 * only named byte-pinned successors and new inputs; it neither records nor
 * transfers runtime QA, publication or artistic fidelity outcomes. V189 now
 * succeeds these unchanged receipt declarations through an exact relay.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { reviewedAnimationAudioDigestV189, animationAudioRuntimeSourcesV189,
  verifyAnimationAudioV189 } from './audit-xeno-animation-audio-v189.mjs';
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const safe = path => typeof path === 'string' && /^[a-zA-Z0-9._/-]+$/.test(path) && !path.startsWith('/') && !path.split('/').some(part => part === '..' || !part);
export const STAGE_OPERATIONS_BASELINE_V188 = 'bf42bc7aa5a674b4d204145670181a940d16a5aa';
export const STAGE_OPERATIONS_COMPLETION_RECEIPTS_SHA256_V188 = '9c864a391884bd01ec0c4091515d10a7ed6eaf88b93281c0bfec94caabff0495';
export const STAGE_OPERATIONS_SUCCESSORS_V188 = freeze({
  "package.json": {
    "kind": "configuration",
    "previousSha256": "f8b5758a406b7f2842ba8d39ef245eceb7b9d07c7a640df35cfd157413905a63",
    "currentSha256": "426dc60d498215db555f920f0f1887603ca4c2d8565df2b309d91b28647fcf3e"
  },
  "scripts/audit-xeno-trials-completion-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "04e5b371b257587515da6b09d78aed8116fcaef1531722ab8332314909bd2446",
    "currentSha256": "0eb1d2218ae1905719e38f882563122b1a48759595644a61a8bc51f7e486936d"
  },
  "scripts/build.mjs": {
    "kind": "verifier",
    "previousSha256": "99314d444b6866c54f3c9552919e083c303cf300840de5baaddebf9426e681be",
    "currentSha256": "969c23ab4ad800b394b7648eabaca7e7858e7cd078c84f4bb41a7094cb233fd0"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "verifier",
    "previousSha256": "b481b6b593cd875950d47312f15fa00ba1d1aa0f6c28f5233cff2983df62262f",
    "currentSha256": "2f6de90b5a70adfc6955209bf52b6f9952a977282ad529cec75e9a6c184016ab"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "1e5cd4c3856773f906162e1dba9a1e0ed892735e86b9882f6c0cfbc22a52d6a9",
    "currentSha256": "d6441feb3b2faa6be8a632b9a71104a7e40d8710944f854ba83918ffc62d9c77"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "verifier",
    "previousSha256": "d6c17d6f11c66d362e92c2607a745fd8ca0ff5e416514f2c2c9c1265d1bb3825",
    "currentSha256": "3657eefb8f830299769013ecd896658b859e26a6a5a0a62139e99f454c3d5640"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "verifier",
    "previousSha256": "4dd749ca44ba2cc1ef792546596105c81b7ff46cd7d156a917ec14a025b36518",
    "currentSha256": "e332ae4eece9dfb4ffe5ae06d86acb53f35a6b2a87caf7cf4cbb3aa0a2e2f564"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "2367ee66823951d8a86207b454fc15daf6028a85d93e5f28d55d6998cd2c038d",
    "currentSha256": "06a1235048d275a69d8bc464ef6a10669883880a2f96fa2bc93632870cecab9d"
  },
  "scripts/verify-xeno-trials-i18n-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "fd79387bb0875cc58243bb4c34a803b878c1dd426cbd8cc592331d74d030204a",
    "currentSha256": "71add1b89f3669945439bc7d56af540ad78ee7a7f3402e08650860b3f12f57f1"
  },
  "scripts/verify-xeno-trials-runtime-completion-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "313788a9b15b8192c46219ef5ef9ab1b8f6a0da3f478f13d77880912f51e0b6c",
    "currentSha256": "0bb1e78f1a0611e1f849d8c4e4919d35df9ba3ceec1430414f77e0cee883bba9"
  },
  "src/i18n-en-catalog-v185.js": {
    "kind": "runtime",
    "previousSha256": "acf9367feb5c28cfafec57f1a584c93fadf5733aceb0c706ad453b2131a43638",
    "currentSha256": "b518392cdae2055ef484586491176f5f187d2bf879065c1e91c3b9a8408c561e"
  },
  "src/xeno-trials-engine-v96.js": {
    "kind": "runtime",
    "previousSha256": "1438853fa109ad48323c2758cc81b2b00fd26ae3dae56413b4ecce0609fc839d",
    "currentSha256": "c8cbc099dbd72e1c7e7bb651f88599e41f9066fb80a6643bf46343944eb1e9c2"
  },
  "src/xeno-trials-gamepad-v186.js": {
    "kind": "runtime",
    "previousSha256": "ce1d9218a58f78ac2e6700d61e83da10952573462c92617be57f734780e44095",
    "currentSha256": "38ab717dc76d75d12cc73cb376980d60dc3d5a6a7f161f833b0b4b740490dd5b"
  },
  "src/xeno-trials-horde-checkpoint-v186.js": {
    "kind": "runtime",
    "previousSha256": "628a497e26f1abb1e86204c9d89528951db421aa668df08fc26fc560d124ea25",
    "currentSha256": "7e79e9b1dce5df4fd7f0765f48f258170af4b7b101ea5786f74dc549c8188861"
  },
  "src/xeno-trials-modes-v119.js": {
    "kind": "runtime",
    "previousSha256": "bb7783b5027b5a37970c76db1fd17fbe8e48a1078d7468d2feac1d30aa5f8956",
    "currentSha256": "03485b8db260cdddbbce04ab4c2f622bccef7c7fa1e615043b605d35d406e232"
  },
  "src/xeno-trials-progress-v96.js": {
    "kind": "runtime",
    "previousSha256": "be1ad44500c52952fad923fe60d313abd92d129100db896f56bcf971db9787fb",
    "currentSha256": "a7fdc3c2a1f3491b837937c0ee05b4da9970c9c9ce70f55f5fc761de92c7bf9e"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "previousSha256": "7997b47f24c40d955b0a9eab16b74ee7e0345b2372b55642e8606a8654b123f4",
    "currentSha256": "eee1197255704dcf2dc299878d033baa72eb7894483bb4c47d0c40ed32382ea7"
  },
  "src/xeno-trials-scale-v110.js": {
    "kind": "runtime",
    "previousSha256": "1980a559dec2c744f841b0557b911464a178cf67b8245c0fe7dcd274aea39b81",
    "currentSha256": "de01e4cf4c1e63693b3d7599c97e9d5af45a85ce9cc8a2a071582e37deed794c"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "previousSha256": "b758d08679ca76735eecaf1dfd7adda1b889b157f627952be314e8096a289a05",
    "currentSha256": "a2a7f3cc5ee7c7e1290c8f5710321c9791f502a3de9d06dbe18ecbcf1764dcc1"
  },
  "sw.js": {
    "kind": "runtime",
    "previousSha256": "8aacf705753116705acfffa7f60333219b2d9e772ef2f1f159797c3d069dcc5e",
    "currentSha256": "28dda3a993e1e60749e59d8a17fffc4ac94f9d97bba90d8efa6dfe02962dc655"
  },
  "xeno-trials-fullscreen-v119.css": {
    "kind": "runtime",
    "previousSha256": "6021c148e22b50be250598903bc093487a4e7270354be975874b22c0f3ea7d8b",
    "currentSha256": "b18a69b97f9fd95a894106e530154f0c63e3609f6875dbbff8d941a49b76c658"
  },
  "xeno-trials-v96.css": {
    "kind": "runtime",
    "previousSha256": "b249efbc8e66d9c28c74414bf6f339af600634d0eb265ca5f002b9ba80022eb8",
    "currentSha256": "de84df4da6041632584aaf66cb7547a59273dd9c67272b95a8936bd856a40b84"
  }
});
export const STAGE_OPERATIONS_NEW_INPUTS_V188 = freeze({
  "scripts/qa-xeno-trials-operations-v188.py": {
    "kind": "verifier",
    "sha256": "fcd1c89d34d3201e0922d85e8cb494ecd7c8c01d7104aea71c60bd631571a388"
  },
  "assets/openai/sprites/xeno-trials-v188/prowler-combat-sheet.png": {
    "kind": "asset",
    "sha256": "602d78555ace3a5ed55a5ea35165fffa3689dba21fbd345d1956f53fc4b6bf35"
  },
  "assets/openai/sprites/xeno-trials-v188/runner-combat-sheet.png": {
    "kind": "asset",
    "sha256": "3df7c0df3b7c7d4109d888c46ac1a9f2beffbe89b6fd8cf065e63abdba14ea74"
  },
  "assets/openai/sprites/xeno-trials-v188/spitter-combat-sheet.png": {
    "kind": "asset",
    "sha256": "e59450c2680221e2080682bd77c2c83352dd9d72125aa2f6bca27c8277a6f2b5"
  },
  "assets/openai/sprites/xeno-trials-v188/warrior-combat-sheet.png": {
    "kind": "asset",
    "sha256": "2ef7903a864d621f42d4720cf61483b7445141519a5752c36e39fb6418148e91"
  },
  "docs/forge/xeno-trials/i18n-operations-review-v188.json": {
    "kind": "document-input",
    "sha256": "affef426ae595dec4ad94accdfa55f9ca084009d7ed327784be61b14913fa3d2"
  },
  "docs/forge/xeno-trials/sprite-production-v188.json": {
    "kind": "document-input",
    "sha256": "4981668a3e7b92f796ee14a996260bc95344ba60232a064272bf37928bee1166"
  },
  "scripts/public-xeno-sprite-admissions-v188.mjs": {
    "kind": "verifier",
    "sha256": "70c1d255e580772eff2bd25cf00c1f6ac7ff0ac1c4601f79b86b823e52383b8a"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "verifier",
    "sha256": "0709d6c5b179e3ac2bb247376bcbb8d30806315e1baa83fd99e0760ff5bdabdc"
  },
  "scripts/verify-xeno-trials-operation-i18n-v188.mjs": {
    "kind": "verifier",
    "sha256": "2cb20968045b64da073d87cbbbd374846879af48ed71fdfa1bf71bb0b7cf40cd"
  },
  "scripts/verify-xeno-trials-operation-presentation-v188.mjs": {
    "kind": "verifier",
    "sha256": "54fd577f445ca5e78c3ee73ddeb4b67ba466f64bf43d70427ecc3ec9112f97e7"
  },
  "scripts/verify-xeno-trials-operations-engine-v188.mjs": {
    "kind": "verifier",
    "sha256": "7a579c4c153a4cdb665d227f9c4724232620a63d877d4d2f2043c8beea00874e"
  },
  "scripts/verify-xeno-trials-operations-v188.mjs": {
    "kind": "verifier",
    "sha256": "c5cb5bf9dc9df1ccae63eecc8b04eced423f5a5824ca96c60405d064c42621b4"
  },
  "scripts/verify-xeno-trials-runtime-operations-v188.mjs": {
    "kind": "verifier",
    "sha256": "e7b431fb7d77cc3a4ce97416aa11bc77ab66e5ba70ae0b8a08ce41cf5f93b0be"
  },
  "scripts/verify-xeno-trials-sprite-atlas-v188.mjs": {
    "kind": "verifier",
    "sha256": "18ff91468390fcfa50cb0ee50f539272152f72197b84a2f24f6780afcfd923a1"
  },
  "scripts/verify-xeno-trials-stage-hazards-v188.mjs": {
    "kind": "verifier",
    "sha256": "922fe4af05e466b91135b1c7f7aeb30b74c8265788718487dea3790ad7aaa081"
  },
  "src/xeno-trials-operation-presentation-v188.js": {
    "kind": "runtime",
    "sha256": "1442a416ae5ea57800c0845acb2e834f2b92ac26f894a644f53418e3a0b530c5"
  },
  "src/xeno-trials-operations-v188.js": {
    "kind": "runtime",
    "sha256": "9c22f76c10715cfb7ff392c56a00531a3611aa25dec0feaf27ef60ba0878ecc7"
  },
  "src/xeno-trials-sprite-atlas-data-v188.js": {
    "kind": "runtime",
    "sha256": "96cd5283e968efaa0a1f3efada099aa81fdc906188888c2968e016db10690d48"
  },
  "src/xeno-trials-sprite-atlas-v188.js": {
    "kind": "runtime",
    "sha256": "b4173e052eb172c136213fd5fbb8519dc448b376719046287c9d63bd92bb528a"
  },
  "src/xeno-trials-stage-hazards-render-v188.js": {
    "kind": "runtime",
    "sha256": "7f8e343a6726d02c38228b1dcc9a2ca584fb0cd9609d19901fad89377c48ae08"
  },
  "src/xeno-trials-stage-hazards-v188.js": {
    "kind": "runtime",
    "sha256": "acf43b4657db5a1040e1ad6591d29dfa7b5cda5f0d7aa6aa31321022bdf639e5"
  }
});
export const STAGE_OPERATIONS_PRESERVED_PLATES_V188 = freeze({
  "assets/user/castes-v87/film_warrior_aliens_1986.png": "c791a14045116531425d270c3edd61384b063d82a0bddf4e23195e9397ecb65f",
  "assets/user/castes-v87/film_runner_alien3_1992.png": "f117c7ad0e6da9a02d3a4ce315066d75acfd67a909620f560ff6cd8c3d7b64b3",
  "assets/user/castes-v87/game_afe_prowler.png": "48edd1af2710048a065433b9e2c8dc20a03b05bc0a46a47394704f3a0c8bd544",
  "assets/user/castes-v87/game_acm_spitter.png": "c281ad7c020999e2796af1c904be45c028bd8643e45bfc45b93edaf5ba4642c7"
});

/** A current digest is never accepted as its own predecessor. Unknown paths
 * retain their earlier endpoint; they gain no new source admission. */
export function reviewedStageOperationsDigestV188(path, endpointV186) {
  const receipt = STAGE_OPERATIONS_SUCCESSORS_V188[path];
  if (!receipt) return reviewedAnimationAudioDigestV189(path, endpointV186);
  assert.equal(endpointV186, receipt.previousSha256, 'Incorrect completion endpoint for V188: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V188 successor digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'Unchanged V188 successor: ' + path);
  return reviewedAnimationAudioDigestV189(path, receipt.currentSha256);
}
/** Used only after the complete chain has verified all physical source bytes.
 * Some historical integration paths already export the final reviewed endpoint;
 * avoid applying a strict predecessor transition twice to that exact value. */
export function stageOperationsRuntimeSourcesV188(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(STAGE_OPERATIONS_SUCCESSORS_V188)) if (receipt.kind === 'runtime') {
    const current = reviewedAnimationAudioDigestV189(path, receipt.currentSha256);
    if (result[path] !== undefined)
      assert.ok([receipt.previousSha256, receipt.currentSha256, current].includes(result[path]), 'Incorrect V188 runtime view predecessor: ' + path);
    result[path] = current;
  }
  for (const [path, receipt] of Object.entries(STAGE_OPERATIONS_NEW_INPUTS_V188))
    if (receipt.kind === 'runtime') result[path] = reviewedAnimationAudioDigestV189(path, receipt.sha256);
  return animationAudioRuntimeSourcesV189(result);
}
export function verifyStageOperationsV188(readSource = readRepository) {
  const paths = [], kinds = ['runtime', 'verifier', 'asset', 'configuration', 'document-input'];
  for (const [path, receipt] of Object.entries(STAGE_OPERATIONS_SUCCESSORS_V188)) {
    assert.ok(safe(path), 'Unsafe V188 successor path: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'kind', 'previousSha256']);
    assert.ok(kinds.includes(receipt.kind)); paths.push(path);
    assert.equal(sha(readSource(path)), reviewedStageOperationsDigestV188(path, receipt.previousSha256), 'Unreviewed V188 successor bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(STAGE_OPERATIONS_NEW_INPUTS_V188)) {
    assert.ok(safe(path), 'Unsafe V188 added-input path: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['kind', 'sha256']);
    assert.ok(kinds.includes(receipt.kind) && validHash(receipt.sha256)); paths.push(path);
    assert.equal(sha(readSource(path)), reviewedAnimationAudioDigestV189(path, receipt.sha256), 'Unreviewed V188 added-input bytes: ' + path);
  }
  for (const [path, digest] of Object.entries(STAGE_OPERATIONS_PRESERVED_PLATES_V188)) {
    assert.ok(safe(path) && validHash(digest)); paths.push(path);
    assert.equal(sha(readSource(path)), digest, 'Historical source plate changed: ' + path);
  }
  assert.equal(new Set(paths).size, paths.length, 'Duplicate V188 source admission');
  assert.equal(paths.includes('scripts/audit-xeno-stage-operations-v188.mjs'), false, 'V188 cannot admit its own bytes');
  const completion = readSource('scripts/audit-xeno-trials-completion-v186.mjs').toString();
  const start = completion.indexOf('export const COMPLETION_BASELINES_V186'), end = completion.indexOf('\nexport function reviewedCompletionDigestV186');
  assert.ok(start >= 0 && end > start);
  assert.equal(sha(completion.slice(start, end)), STAGE_OPERATIONS_COMPLETION_RECEIPTS_SHA256_V188, 'Historical V186 receipt declarations changed');
  verifyAnimationAudioV189(readSource);
  return Object.freeze({ baselineCommit: STAGE_OPERATIONS_BASELINE_V188,
    successors: Object.keys(STAGE_OPERATIONS_SUCCESSORS_V188).length,
    addedInputs: Object.keys(STAGE_OPERATIONS_NEW_INPUTS_V188).length,
    preservedPlates: Object.keys(STAGE_OPERATIONS_PRESERVED_PLATES_V188).length,
    historicalResultsTransferred: false });
}
