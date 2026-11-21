/** Reviewed source inputs for Xeno Trials V205, anchored to the public V204 commit. */
import assert from 'node:assert/strict';
import { reviewedXenoProductionAssetsDigestV206, verifyXenoProductionAssetsV206, reviewedXenoTrialsTantalusJoinV206,
  xenoTrialsTantalusJoinRuntimeSourcesV206 } from './audit-xeno-production-assets-v206.mjs';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const safePath = path => /^[a-zA-Z0-9._/-]+$/.test(path)
  && !path.split('/').some(segment => !segment || segment === '.' || segment === '..');
const kinds = new Set(['runtime', 'asset', 'production-asset', 'verifier', 'configuration', 'document-input']);

function freezeReceipts(receipts) {
  for (const receipt of Object.values(receipts)) Object.freeze(receipt);
  return Object.freeze(receipts);
}

export const XENO_VISUAL_ASSETS_BASELINE_V205 = '2e784c74a8ad0779438d5f44e8184dd6f7423ddf';
export const XENO_VISUAL_ASSETS_HISTORICAL_DECLARATIONS_V205 = freezeReceipts({
  "scripts/audit-xeno-priorities-v204.mjs": {
    "start": "export const XENO_PRIORITIES_BASELINE_V204",
    "end": "\nexport function reviewedXenoPrioritiesDigestV204",
    "sha256": "160f3b78915d2d4a14fd710db1e1c59264959f96028652592c4c081e8dcb5e91"
  }
});

export const XENO_VISUAL_ASSETS_SUCCESSORS_V205 = freezeReceipts({
  "package.json": {
    "kind": "configuration",
    "previousSha256": "ceb95f8217d9f12527d757f05bd6d08a66190476a1cd68506a3bfdc416ff2476",
    "currentSha256": "f29e5ced2089abc670609dcc4183d6a492b195113839c6733f69976fb9f88994"
  },
  "scripts/audit-xeno-priorities-v204.mjs": {
    "kind": "verifier",
    "previousSha256": "a044a1ed3f8872cd664131fe66c52fad44d16f386d3e890447de2b1c74099dcb",
    "currentSha256": "1a08274cf8e0a0fb2be634b2a267c575d33e3052e9763e5747b9b98d36be5eac"
  },
  "scripts/build-asset-filter.mjs": {
    "kind": "verifier",
    "previousSha256": "e838a6801482b2c10d355b480304052c4cf8f0f3a86bc0626bcad06671b70941",
    "currentSha256": "d5121997a0d946419a955e20499a4d848420b587d81ed174fdd456dda42fcea8"
  },
  "scripts/build.mjs": {
    "kind": "verifier",
    "previousSha256": "ebbe9a97a7cab715bc3711373fc77fb97e0994e031c59fcd9763642540650408",
    "currentSha256": "fa817256bc9832c9390055ddab431e8dd9e1320b273904c39f2489ff6807ab12"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "verifier",
    "previousSha256": "f700865f2c63863c2ffdb47aec81a6f216940343ec027e22004c04a300b88813",
    "currentSha256": "f10f3470e2511997f2bfb23a1f4d94ea9555f16991f1d2db867c67ce8ebdceaf"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "e4c7cc61ce057df839d3fa51fcfdfe88cc36468fb3da95bc2d82d24a45da8252",
    "currentSha256": "ac45b6c2c2fe4a28e55058d9a457b5f1c600f9f84e29f22c6ae92afa0d0ed522"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "verifier",
    "previousSha256": "2d9504849d4aaa959c508693e1c62a34c78f3fbda21c228e719a74d8125f5ca3",
    "currentSha256": "f34cd5a4a2c16c32a5ba1b6884c3f138a8c8334233e989141655fd1238f37d04"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "verifier",
    "previousSha256": "14765788c28585b0c2661dc8ad7c7366a3c971153f7eb29ab1fdcbff7ac01142",
    "currentSha256": "99300ca42eb32149e4bcd2b19b97cca41e606caeed4d6402393acfd215cc1e0f"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "38e54c4319c4829238d060c3521a21f1bfc42b6e9c60e4bea25a6e366d56a0d4",
    "currentSha256": "e91b20e116d6c39f1fdc969b8929b5075fb7266bf300f31d07fc9f695726fd05"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "verifier",
    "previousSha256": "ecb7f7aeea78c96abdd50f7a14fb1ac7a1abedfe38dc63342d98ba3e03cfa192",
    "currentSha256": "e1a52ebfdea6e2683f75cc3e6c99df1ead87248297cde1d8ecdc3b389943190b"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "verifier",
    "previousSha256": "327306980ee53f457831035088f5ff4716310439858429817f1e469d5cc9bfb4",
    "currentSha256": "92db45f7a67ff95b8f08e43b6bb3b5348a73e041256fc9f5fb3a33c71b1e79d7"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "0bbd5e697343d3d40737ca595a3047bb3bac50789338715f813fd4a86f7fa80e",
    "currentSha256": "55548b59ed4b494f9ebe4d1f28890200b06ed6ac38508665fe3fe934c9d618e6"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "verifier",
    "previousSha256": "23529a33369853b74f226a3597ad6a1d8a4dabf057c5d1db04e959fbab3b8e68",
    "currentSha256": "08afb2fc482076332abe5af5390b3a4c5afc2562940504a2ca6143f4471a76bb"
  },
  "scripts/verify-xeno-priorities-audit-v201.mjs": {
    "kind": "verifier",
    "previousSha256": "e7175588d9890deef21eeeafda5019361406c1f47395f33fe04cf3d960215cde",
    "currentSha256": "86dc60d9208ec8e0967b5dce833dab5d48c0f37c7be667799a3eab0d0f12c0fe"
  },
  "scripts/verify-xeno-priorities-audit-v202.mjs": {
    "kind": "verifier",
    "previousSha256": "42e19c41cfcd37bbb3e477ed8f304d64ffe962d1e8483b696ed2a0de19c4e004",
    "currentSha256": "1377d502e2242cac6607030bab88cc48563d83ec3ea053c38b8866e7b62cd963"
  },
  "scripts/verify-xeno-priorities-audit-v203.mjs": {
    "kind": "verifier",
    "previousSha256": "12e0fa9dc903fe56ee316a1b4b0db270890926dda8b1f7114cdfc45e48c78e18",
    "currentSha256": "25b1e6d01419a025d0a5376e8f89a043a84eedcb7f2ae908bd2914edff40b69e"
  },
  "scripts/verify-xeno-priorities-audit-v204.mjs": {
    "kind": "verifier",
    "previousSha256": "1fc34befc13f1fbfe9319e0e1fc7ef6745d34b0d0d1f7f9253b241a9639eddef",
    "currentSha256": "7a36f6846031ace8e460db3303bbf031c24405aa9f982b13036268416e55734e"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "verifier",
    "previousSha256": "7978d0de93d916c404290579cdd794b4a34c2149c9d567fa3623174657c99207",
    "currentSha256": "8c98acb271d6288bcabaa8e033d619d9d1115fb3faf79de97d314c4718a3c7af"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "a29e0655735220930d0747032087fa5e7d44687c072c683bfbbba80b59d9c0fa",
    "currentSha256": "18b603225674fd215a964a43ac31dec60fde56d8c14ca353a2a3939c24aebfef"
  },
  "scripts/verify-xeno-supers-audit-v200.mjs": {
    "kind": "verifier",
    "previousSha256": "741231fb303e79a410eaa10eb613f49d55568a6379c5e3976a1db75f4b201fb4",
    "currentSha256": "9a3d34a5035ec69c48b8da40a9e3f1b1dd657ea15b8d1b1fda6bd634c172a205"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "a2723f2869f1f14050cd0b64b29cec7cf57057f2e4ada7c2c6b273e4e0721c21",
    "currentSha256": "33c44c1c73120bc9d397c8cbe0beaf4f4080f1eec111995d4091d8bb16c43e25"
  },
  "scripts/verify-xeno-trials-franchise-stages-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "df8b0ddf807882b505b4b0d7f3d6c5faa7434c913a73f61504078c7d06de4a90",
    "currentSha256": "d028d7197ed2ec2f323af6c2dc74d25bc21f05799f44098b369b522c526358ac"
  },
  "src/xeno-trials-acid-pools-v152.js": {
    "kind": "runtime",
    "previousSha256": "1995962ffc6618f7a94910f6f49f92a2560b4562a033deea418930201d22354b",
    "currentSha256": "35e3c771aae245986cf3e22b92514380874db68a5843e45f956629273012be56"
  },
  "src/xeno-trials-arena-layers-v119.js": {
    "kind": "runtime",
    "previousSha256": "43e7feec730713ae372295330631e1aeef3c5408287d8f7a295a7deba4716f47",
    "currentSha256": "1bac81e30e980bf6f5f3b982290c63600a3ed75f108a4324c779a207535caae4"
  },
  "src/xeno-trials-data-v96.js": {
    "kind": "runtime",
    "previousSha256": "7ecf7ca89a9532f949751b6a69bca358a19654dde90499de4f08ba74fdc3a2fc",
    "currentSha256": "35187237611c078a13f9710c72e8d211fce5db1be63e45d7f4b17f4904f3bb7d"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "previousSha256": "afe24a25866e8ff5e1ffafae522be49493391e477fce10bd37abfe2428ddc0e2",
    "currentSha256": "9725d80048699a6399b69a765c9d6b4dc3451014bf049b9b9f92484e53bdf6a3"
  },
  "sw.js": {
    "kind": "runtime",
    "previousSha256": "adf22180e5c0cd959206a33d385a53fa262bfb9d94722642d7a8680536adb438",
    "currentSha256": "8352d786320ead53a5cdcbb8582ee1d1d2212798a0b92b006f07d912ac254cec"
  }
});
export const XENO_VISUAL_ASSETS_NEW_INPUTS_V205 = freezeReceipts({
  "assets/openai/xeno-trials-v205/characters/arachnoid-light-impact.png": {
    "kind": "production-asset",
    "sha256": "3012fed84a9ee51b399af0a7f493d0bc7b56c46f78bd7822a5514c85af854ae6"
  },
  "assets/openai/xeno-trials-v205/characters/arachnoid-light-recovery.png": {
    "kind": "production-asset",
    "sha256": "70892c9d5536bc966a7acf487990be675ac7399d934d0dedd9ee85596fae0714"
  },
  "assets/openai/xeno-trials-v205/characters/arachnoid-light-windup.png": {
    "kind": "production-asset",
    "sha256": "82053d2dc53dfa7a25c71e0c7e46117a90134e5934977eae919d13b1554daa2d"
  },
  "assets/openai/xeno-trials-v205/characters/arachnoid-special-active.png": {
    "kind": "production-asset",
    "sha256": "83d51a8916c2e56b2ec0876bcc71f167a14703e60589d746a7aa71f79c2d4ead"
  },
  "assets/openai/xeno-trials-v205/characters/arachnoid-special-recovery.png": {
    "kind": "production-asset",
    "sha256": "b0107abfb5e960471a11d3f51a688e41d28297e3dbc4f096f5e1519956b32005"
  },
  "assets/openai/xeno-trials-v205/characters/arachnoid-special-windup.png": {
    "kind": "production-asset",
    "sha256": "0325aa7feefaec49c34b67b2e25271e1cd74f2915be924ebcd917d229bcf1a4d"
  },
  "assets/openai/xeno-trials-v205/characters/gorilla-heavy-impact.png": {
    "kind": "production-asset",
    "sha256": "a520755e2355e89f3a9a462703d869c6cabef33c0512c0203be3b1bdcd112615"
  },
  "assets/openai/xeno-trials-v205/characters/gorilla-heavy-recovery.png": {
    "kind": "production-asset",
    "sha256": "57cf5faba41e805a424e4b699ce57340ef470a296571f1440b56ca332a6cb54b"
  },
  "assets/openai/xeno-trials-v205/characters/gorilla-heavy-windup.png": {
    "kind": "production-asset",
    "sha256": "7bb8f892ff8abfc84e887977cffa54211dbd608c7bac77e6e1a64f9c3e2d745e"
  },
  "assets/openai/xeno-trials-v205/characters/grid-heavy-impact.png": {
    "kind": "production-asset",
    "sha256": "2a765adbab34ae6cc0ebb8a43b1801bdbc6ceaeb282c11b0f358558fe420e92c"
  },
  "assets/openai/xeno-trials-v205/projectiles/acid-cluster.png": {
    "kind": "asset",
    "sha256": "266820b9fe0754bd7e34c18bafbe716b25ce2c1b7042e4ecb7e00194dbddda27"
  },
  "assets/openai/xeno-trials-v205/projectiles/acid-drop.png": {
    "kind": "asset",
    "sha256": "88119241b1e7497f9dad5e064a6e879105477627130d6c2104bcead293adfb55"
  },
  "assets/openai/xeno-trials-v205/projectiles/aimed-acid.png": {
    "kind": "asset",
    "sha256": "dac8cf71bee006671ca8f9a5a6e6906c993b9ca1bd831ebd485617e0833d664e"
  },
  "assets/openai/xeno-trials-v205/projectiles/ground-wave.png": {
    "kind": "asset",
    "sha256": "21692cbb51235b51e89d0f0edca55c5a36bacc78a9117e0fed02a0954e4036f7"
  },
  "assets/openai/xeno-trials-v205/projectiles/pulse-bolt.png": {
    "kind": "asset",
    "sha256": "c2902bde2a987be0b6b9cb6745a092c846e10a8a087db145c1762e90b0427e9e"
  },
  "assets/openai/xeno-trials-v205/stages/containment-deck.png": {
    "kind": "asset",
    "sha256": "20d1924a46e9284d5759b8eee511c5f652c64cf3b8a0da32688f89174bc7f87a"
  },
  "assets/openai/xeno-trials-v205/stages/hive-vault.png": {
    "kind": "asset",
    "sha256": "67341abdf53a20eb598323f66682c6e142b85a934060b21043de7b02762931a3"
  },
  "assets/openai/xeno-trials-v205/stages/reactor-ring.png": {
    "kind": "asset",
    "sha256": "90fc4cf3834b17540a1cb8f54322e8dade6189c9659cbecc153735b3f1e3d240"
  },
  "assets/openai/xeno-trials-v205/vfx/acid-pool.png": {
    "kind": "asset",
    "sha256": "1f190008a74094aec01764f013339dc7149f8197d75858a427b770d538508d39"
  },
  "assets/openai/xeno-trials-v205/vfx/acid-splash.png": {
    "kind": "asset",
    "sha256": "58a5122fbb51e96a60f4f85c9bd05f02c8cac0e2a40bed8b77187ff8d3b4a812"
  },
  "assets/openai/xeno-trials-v205/vfx/cryo-burst.png": {
    "kind": "asset",
    "sha256": "089a84f3adf5b53423d38c6e5b54d1b290064d061b26a05e7c34edaaada59795"
  },
  "assets/openai/xeno-trials-v205/vfx/debris-impact.png": {
    "kind": "asset",
    "sha256": "3983d3f9b5e53725f7f9862d8a85488be648489e897657574466c7bee71ac5a5"
  },
  "assets/openai/xeno-trials-v205/vfx/detonation.png": {
    "kind": "asset",
    "sha256": "c9170b01f5e59db6795294cd632336bb1ca0ccbb69cd49cc42b2e764d2c871a3"
  },
  "assets/openai/xeno-trials-v205/vfx/electric-arc.png": {
    "kind": "asset",
    "sha256": "67a901c91679fd8895ddeb61081c57396bd6faf6c496a66915d80d6e6cac42b8"
  },
  "assets/openai/xeno-trials-v205/vfx/steam-jet.png": {
    "kind": "asset",
    "sha256": "f36d54267a048e803de8db44485aac6c7a527ffd2b1d9a1e25fb2c8aa2d279b6"
  },
  "assets/openai/xeno-trials-v205/vfx/synth-flame-cone.png": {
    "kind": "asset",
    "sha256": "5310429910cb227a729306f01c8f1a3b76a64f3e93e19cef69d793d23c08cd6c"
  },
  "docs/forge/xeno-trials/ASSET_LOT_V205.json": {
    "kind": "document-input",
    "sha256": "5b9137d9bd660da8f78987e864c5381bb6ab39e24e6421042cd47704e6710d76"
  },
  "scripts/public-xeno-visual-admissions-v205.mjs": {
    "kind": "verifier",
    "sha256": "160a2972a22d14a129fe79011dc109fb6853e116da8b762bb188e0ba3d830afd"
  },
  "scripts/verify-xeno-trials-visual-assets-v205.mjs": {
    "kind": "verifier",
    "sha256": "945b75083fc11a1a1b1d53b2e3fddf58ee39ffd63ec71e0302daa50bb447d097"
  },
  "scripts/verify-xeno-visual-assets-audit-v205.mjs": {
    "kind": "verifier",
    "sha256": "ba872e265f267e3a90dcaba0c6521b2910e364c0db1b805639516d325bd645fd"
  },
  "src/xeno-trials-visual-assets-v205.js": {
    "kind": "runtime",
    "sha256": "794661a7b7e93cf47f5c0c5f27af289e3804fc0a592257d2e8166c0dab0c6040"
  }
});

export function reviewedXenoVisualAssetsDigestV205(path, endpointV204) {
  if (!Object.hasOwn(XENO_VISUAL_ASSETS_SUCCESSORS_V205, path)) return reviewedXenoProductionAssetsDigestV206(path, endpointV204);
  const receipt = XENO_VISUAL_ASSETS_SUCCESSORS_V205[path];
  assert.equal(endpointV204, receipt.previousSha256, 'Incorrect V204 endpoint for V205: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V205 successor digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'Unchanged V205 successor: ' + path);
  return reviewedXenoProductionAssetsDigestV206(path, receipt.currentSha256);
}

export function xenoVisualAssetsRuntimeSourcesV205(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_VISUAL_ASSETS_SUCCESSORS_V205)) {
    if (receipt.kind !== 'runtime') continue;
    // After the Tantalus merge an earlier view can already hold the joined endpoint.
    const joined = reviewedXenoProductionAssetsDigestV206(path, receipt.currentSha256);
    if (result[path] !== undefined && result[path] !== receipt.currentSha256 && result[path] !== joined)
      assert.equal(result[path], receipt.previousSha256, 'Incorrect V205 runtime view predecessor: ' + path);
    result[path] = receipt.currentSha256;
  }
  for (const [path, receipt] of Object.entries(XENO_VISUAL_ASSETS_NEW_INPUTS_V205)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== reviewedXenoTrialsTantalusJoinV206(path, receipt.sha256))
      assert.equal(result[path], receipt.sha256, 'Incorrect new V205 runtime digest: ' + path);
    result[path] = receipt.sha256;
  }
  return xenoTrialsTantalusJoinRuntimeSourcesV206(Object.freeze(result));
}

export function verifyXenoVisualAssetsV205(readSource = readRepository) {
  const successors = Object.entries(XENO_VISUAL_ASSETS_SUCCESSORS_V205);
  const inputs = Object.entries(XENO_VISUAL_ASSETS_NEW_INPUTS_V205);
  assert.ok(successors.length > 0 && inputs.length > 0, 'V205 inputs await final source freeze');
  const paths = [...successors, ...inputs].map(([path]) => path);
  assert.equal(new Set(paths).size, paths.length, 'Duplicate V205 source admission');
  assert.ok(!paths.includes('scripts/audit-xeno-visual-assets-v205.mjs'), 'V205 cannot admit its own bytes');

  for (const [path, receipt] of successors) {
    assert.ok(safePath(path) && kinds.has(receipt.kind), 'Invalid V205 successor path or kind: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'kind', 'previousSha256']);
    assert.equal(sha(readSource(path)), reviewedXenoVisualAssetsDigestV205(path, receipt.previousSha256),
      'Unreviewed V205 successor bytes: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(safePath(path) && kinds.has(receipt.kind) && validHash(receipt.sha256), 'Invalid V205 source receipt: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['kind', 'sha256']);
    assert.equal(sha(readSource(path)), reviewedXenoProductionAssetsDigestV206(path, receipt.sha256), 'Unreviewed V205 added-input bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_VISUAL_ASSETS_HISTORICAL_DECLARATIONS_V205)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing historical declaration anchors: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical receipt declarations changed: ' + path);
  }
  verifyXenoProductionAssetsV206(readSource);
  return Object.freeze({ baselineCommit: XENO_VISUAL_ASSETS_BASELINE_V205, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
