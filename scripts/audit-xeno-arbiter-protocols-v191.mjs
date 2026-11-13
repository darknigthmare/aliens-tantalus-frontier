/** Exact 07f9525 V190 -> V191 ARBITER protocols/animation continuation.
 * Historical receipts remain immutable. This audit admits only named source
 * bytes; QA results, publication and canonical fidelity are never inherited.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const safe = path => typeof path === 'string' && /^[a-zA-Z0-9._/-]+$/.test(path) && !path.startsWith('/') && !path.split('/').some(part => part === '..' || !part);

export const ARBITER_PROTOCOLS_BASELINE_V191 = '07f9525c18c9b55cf21ae93fe758209f64ed8ff4';
export const ARBITER_PROTOCOLS_HISTORICAL_DECLARATIONS_V191 = freeze({
  "scripts/audit-xeno-arbiter-campaign-v190.mjs": {
    "start": "export const ARBITER_CAMPAIGN_BASELINE_V190",
    "end": "\n/** Strict predecessor transition:",
    "sha256": "fc8f19b49db898cc88c6a1069cbd1da92f04d1e1823919611c75b50e07607009"
  },
  "scripts/audit-xeno-animation-audio-v189.mjs": {
    "start": "export const ANIMATION_AUDIO_BASELINE_V189",
    "end": "\n/** A current digest",
    "sha256": "61916ef2e1a08e854525103e4abb41970730e6d3d111966c1c6cbaf71b562a44"
  },
  "scripts/audit-xeno-stage-operations-v188.mjs": {
    "start": "export const STAGE_OPERATIONS_BASELINE_V188",
    "end": "\nexport function reviewedStageOperationsDigestV188",
    "sha256": "877b259c841594d4a0cddca47c8977d389bf6c68816951dcbe95389bd49708e4"
  },
  "scripts/audit-native-qa-resources-v187.mjs": {
    "start": "export const NATIVE_QA_RESOURCES_BASELINE_V187",
    "end": "\nexport function reviewedNativeQaResourcesDigestV187",
    "sha256": "a1704b9d7c8381aec02750c5be09ae47f416bf51c4d1635952c1bdb2eaa3de5f"
  },
  "scripts/audit-xeno-trials-completion-v186.mjs": {
    "start": "export const COMPLETION_BASELINES_V186",
    "end": "\nexport function reviewedCompletionDigestV186",
    "sha256": "9c864a391884bd01ec0c4091515d10a7ed6eaf88b93281c0bfec94caabff0495"
  }
});

// Populated only after the implementation and its targeted evidence are frozen.
export const ARBITER_PROTOCOLS_SUCCESSORS_V191 = freeze({
  "package.json": {
    "kind": "configuration",
    "previousSha256": "a872ee10bf3a8068d494fe8d24cdbeee90a427b8770e5745c76dc8645384a4f8",
    "currentSha256": "c60ed60d2a048704a901e7290ddfd082bab01cd71485a278b6473be9a8e700af"
  },
  "scripts/audit-xeno-arbiter-campaign-v190.mjs": {
    "kind": "verifier",
    "previousSha256": "f86a6396fca5e898a8b18ea6361d19b6ceff837866c36e670647348f0b7573f1",
    "currentSha256": "ab65c1e651075dc0fdd062c3d520c83f365e1226ee13f34f7a1a00bdc3163bd7"
  },
  "scripts/build-asset-filter.mjs": {
    "kind": "verifier",
    "previousSha256": "1d536357afc3a879cbaf988c355f9ca6796c7bd6ecfa9e8b1696162c033221ea",
    "currentSha256": "96bc04b1eed9e0f0ac18cb69112008ab9ff3350dc41778afcd88d49e3ddd3ca8"
  },
  "scripts/build.mjs": {
    "kind": "verifier",
    "previousSha256": "c13ad85b95e09c8fdf32a9f7e4583f16d6e403c77dd638664210be1eb62599c7",
    "currentSha256": "6c5b65f0e1a8e65cd151df461cc40ffe9526f34c0376bcf9910b85de839de767"
  },
  "scripts/qa-xeno-trials-capture-v163.py": {
    "kind": "verifier",
    "previousSha256": "a6b4653534000439a743fd24455c01cfc73c4926b8ea8e28c77e770d675f8146",
    "currentSha256": "3f338ef56a2a0389ad28e0724ab510521eb9aa1f0acc26be3ca6ff8dcdc135b5"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "verifier",
    "previousSha256": "d418240cb37eb22492f2da1b492614b7fd262f6effc9179cf737e495f9c58426",
    "currentSha256": "73a263e0656907ed2e459d6b61a05f7b0b5802f63e805b3f403471da50e9c361"
  },
  "scripts/verify-capture-observation-v177.mjs": {
    "kind": "verifier",
    "previousSha256": "e44f384d7d3a27f4dc17a9ef67ee9b84e076976c5bda46d2a265ac06a1944742",
    "currentSha256": "3bcc9fac691aa886d4d5ce1c2918edccca0d8ff8b5e9b8c81e0099718a1de669"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "60ce9cff79a2a5b784306cdde25324410fd2f91f52fd0e877871f6e781d3645f",
    "currentSha256": "b30146ae437a0a9ae1b15aed2ec7a3657d361cefbedb832e5ec95f3db6a02c66"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "verifier",
    "previousSha256": "acb5166a7b0d8b7ad1128ff67fea1638f0ddb2426330ade5c45ffad474fe8ef2",
    "currentSha256": "fcec08eee653444e96f968e24de33035b0cd52640bf3a9e756d654e2aa39be4a"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "verifier",
    "previousSha256": "df26a90565ebae873bb196a4d4a087628402c850ea57463401c4a64799acc902",
    "currentSha256": "7a83130099372e425e42761c77e2f295f6f388e1d781973c765f84f92e005b2e"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "1470c5af4f420d51580854184ccd2bce69c8e2c9f8b3a33673c9a4e9e94906aa",
    "currentSha256": "6941383c478b14a782cee9fd8dbd864d79795c7c3d53d7be5fead381889f1211"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "verifier",
    "previousSha256": "c80df82358a5dbaf0e53dd6f43f74734643d89a126154bd33cdb31d46ac49790",
    "currentSha256": "838ced11831ead152798cacd5549c8b8ad462802fa5c26035796d6d2033ae396"
  },
  "scripts/verify-xeno-arbiter-i18n-v190.mjs": {
    "kind": "verifier",
    "previousSha256": "a15ac842360125c4fce1080aa86228e3ab4d95a23246a9d7a6e2b630181ccc97",
    "currentSha256": "45982e64b82f3bdc5125f68de11bea0ccbb3f71406112a0c9cfd2c9217cb80cb"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "cfc8f043b55acb41218b4ac66f133e33f096ad658ccdff81d6c11753d710ec49",
    "currentSha256": "3a70875bb7b76ab058b918b742df811f993b36920152c926696969936f446f50"
  },
  "scripts/verify-xeno-trials-animation-audio-i18n-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "a9903297cd862a44e16313e1670910fb1c9f34d501ad9edca59df4163d8ff9a3",
    "currentSha256": "53775aa7f5f177fc809bb748b185500ec0f1a8cdb152da85f485cc92b84459a5"
  },
  "scripts/verify-xeno-trials-animation-ui-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "10f7eac763b1bd38f91a10e621df5c1be381bcd2d42378efc3aa58cca555e5bb",
    "currentSha256": "88945758336563bf0573453c4eff4a1082da769de946c4389153db4ae8f2cf8b"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "21977092efa3b5a23ec07fa53e54350d939f0699220b1fb8d98c7184ac2e6a34",
    "currentSha256": "03bb0eca2693ab9d926446183789693bc328fb463cce7484db61caaa8f55e221"
  },
  "scripts/verify-xeno-trials-i18n-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "f34056d2548f0148227647f2ab351ecdd2f4ca0419c88950736493a24b653e30",
    "currentSha256": "fab987012b49e1601618731373500670b3dc9401ff19cdfa9ca42bfa56079af4"
  },
  "scripts/verify-xeno-trials-operation-i18n-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "19a7bc6287bebb6e59191178a00ede820a700dbad2dbb175187cdd76c172b6c0",
    "currentSha256": "8bbfa16a6713becc20e2135b7b5700760eadb23bad669c09d083ca98281f18b3"
  },
  "src/i18n-en-catalog-v185.js": {
    "kind": "runtime",
    "previousSha256": "1e35016834e518294d4be14501872045d1ef54754b5309368bfb99c0c22ea8d3",
    "currentSha256": "38e16b8671fe14d85f04248fb8d31c27f408cf42dae7f43498e22f49a68ee20d"
  },
  "src/xeno-trials-horde-v180.js": {
    "kind": "runtime",
    "previousSha256": "8672d5cb2dee9dfb36e772a3d6981ad209283a62763cd965830b07cc7344c844",
    "currentSha256": "1620a7da6f7f45b9ac8d68cfdeeb3e749d4680c1e5361882b518f6b4d974c9c8"
  },
  "src/xeno-trials-operations-v188.js": {
    "kind": "runtime",
    "previousSha256": "9c22f76c10715cfb7ff392c56a00531a3611aa25dec0feaf27ef60ba0878ecc7",
    "currentSha256": "d69140bff7fb869e88d026269119dc85114dc673180110609eb1084a69fc42a2"
  },
  "src/xeno-trials-progress-v96.js": {
    "kind": "runtime",
    "previousSha256": "a7fdc3c2a1f3491b837937c0ee05b4da9970c9c9ce70f55f5fc761de92c7bf9e",
    "currentSha256": "5ebe7bcf0d67445a7e90e0df02786aa7d939711f109694ba3522be73ccbf54a5"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "previousSha256": "45c010862523888ef172839d52f62fa215b7ff1f4c0d356335ad89b9230f953e",
    "currentSha256": "287a7f3fb9f50eb743d19d98c14e446cb6e23f70d31007ec52144b2a9927dd35"
  },
  "src/xeno-trials-stage-hazards-v188.js": {
    "kind": "runtime",
    "previousSha256": "acf43b4657db5a1040e1ad6591d29dfa7b5cda5f0d7aa6aa31321022bdf639e5",
    "currentSha256": "aab48e1d966e6bfe202d9abbc17d7d4aa09c0bd0c87fc096e0e05091988755b4"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "previousSha256": "13a7f1c7d2188f4162cec2d562141967b8e62248d32d019f079d9138e9002d1a",
    "currentSha256": "eaad814a05e343e08123ac82920412277ef59c33a9b535fda64f83c0356c5898"
  },
  "sw.js": {
    "kind": "runtime",
    "previousSha256": "04ad0d59e7c56c1d64109ef36f3fc156c0fc4c1384f04f260a13ed0296d4d520",
    "currentSha256": "330dd2e96225fc60d21f40ca276193a76274377087766c1e63dff10f369d05d5"
  }
});
export const ARBITER_PROTOCOLS_NEW_INPUTS_V191 = freeze({
  "assets/openai/sprites/xeno-trials-v191/chrysalis-combat-sheet.png": {
    "kind": "asset",
    "sha256": "a1b3a1f3129d3d0e719d8bfa72ac2570f30d597496b7caeb2e50993d6b89c488"
  },
  "assets/openai/sprites/xeno-trials-v191/defender-combat-sheet.png": {
    "kind": "asset",
    "sha256": "dcfe59cdde5c6fcd53f94d1b2e994f7f987d7a32c2127f7d5dd6e0495d0b8584"
  },
  "assets/openai/sprites/xeno-trials-v191/prowler-special-sheet.png": {
    "kind": "asset",
    "sha256": "68b21b568fc9e31298955a0f8ec1c2c1e3fa4cdd8a3eff7f40454ea1dac135bc"
  },
  "assets/openai/sprites/xeno-trials-v191/runner-special-sheet.png": {
    "kind": "asset",
    "sha256": "8e10cdcb418f83391d800df3d179d4454bcd80edf5c0f4266a148fd988dc0d3a"
  },
  "assets/openai/sprites/xeno-trials-v191/smasher-combat-sheet.png": {
    "kind": "asset",
    "sha256": "96ffec697770ee5fe2c15e0d504693f6ac566003567d936a81145f3d1493c681"
  },
  "assets/openai/sprites/xeno-trials-v191/spitter-special-sheet.png": {
    "kind": "asset",
    "sha256": "0702ca1702cc57c61affe3c7fb39d10068084314e83d5868c58e4cffef280929"
  },
  "assets/openai/sprites/xeno-trials-v191/user-brute-combat-sheet.png": {
    "kind": "asset",
    "sha256": "b209caa8a98a62d12b5df640f4bcd78654b951bfeb7b9d951727a277e6adeb8a"
  },
  "assets/openai/sprites/xeno-trials-v191/warrior-special-sheet.png": {
    "kind": "asset",
    "sha256": "8a604d14ced932d5386ecc552601c285e135d61b168057f6bb7d748d867a11fd"
  },
  "docs/forge/xeno-trials/animation-coverage-v191.json": {
    "kind": "document-input",
    "sha256": "d8c8d4b98a8d3f217a6d40556b9bf4708264ce740e6ea07ba92eab1fe6cdff7b"
  },
  "docs/forge/xeno-trials/i18n-arbiter-protocols-review-v191.json": {
    "kind": "document-input",
    "sha256": "19d66cf6dd0495ed519dd1e2fe5813e36ccff5647c922d82c7d0446469b3ea69"
  },
  "docs/forge/xeno-trials/sprite-combat-production-v191.json": {
    "kind": "document-input",
    "sha256": "27943e3b55934be371f9b6d481be181535ad34709d8b99f28dbd5abf60ab1b92"
  },
  "docs/forge/xeno-trials/sprite-special-production-v191.json": {
    "kind": "document-input",
    "sha256": "43633de46c2eeb89143b2003267e21d630d5ef5d63a4a66785e0a4957d1741ab"
  },
  "scripts/public-xeno-sprite-admissions-v191.mjs": {
    "kind": "verifier",
    "sha256": "0d187a9e909bbd72522fcb0ae3e92dd477e535d1576d7f7cd34b96394a7d269b"
  },
  "scripts/qa-xeno-arbiter-protocols-v191.py": {
    "kind": "verifier",
    "sha256": "a896b9a13a9a10db44dd3cde1872f02d6c5ee788b9d59b8d4fa4b9898899116b"
  },
  "scripts/verify-xeno-arbiter-integration-v191.mjs": {
    "kind": "verifier",
    "sha256": "751973fc2afa61b8af04ee33d02b7d15d5dcff89fc72b71a38970546db0f8984"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "verifier",
    "sha256": "21e954ba7fd606628b3c7b58ed9f10166f1e992f4d1adc7ad700114e9cceba5a"
  },
  "scripts/verify-xeno-arbiter-protocols-i18n-v191.mjs": {
    "kind": "verifier",
    "sha256": "3fc78af64421321eb89930abeed002a1de865a10811b8a807ff09f5cb1732f4c"
  },
  "scripts/verify-xeno-arbiter-protocols-v191.mjs": {
    "kind": "verifier",
    "sha256": "85f50fc0e301128601cb71ecb032c93b76332cdd2f042d1ab382ca221afb212d"
  },
  "scripts/verify-xeno-trials-animation-coverage-v191.mjs": {
    "kind": "verifier",
    "sha256": "befbe652eb7c69f6f6a090be71a0f2a68f6ccd4b7eb9562d76ac2fe4b65db77e"
  },
  "scripts/verify-xeno-trials-runtime-animation-v191.mjs": {
    "kind": "verifier",
    "sha256": "9ec97e1aa21a30d8d63a0c5900ca5e42231085259983e84b3a4ab0af7ea26756"
  },
  "scripts/verify-xeno-trials-sprite-atlas-v191.mjs": {
    "kind": "verifier",
    "sha256": "21f9231ffcb8fba0fc2a196b061acc0020ea5a6791106674b84256fbabff8c0b"
  },
  "src/xeno-arbiter-protocols-v191.js": {
    "kind": "runtime",
    "sha256": "f6ead2774d7e9cabe2de56c81b199e0267a77411de76a21b016ff3e7c9da4429"
  },
  "src/xeno-trials-animation-coverage-v191.js": {
    "kind": "runtime",
    "sha256": "277ceee627cb594fbc34975a7887e83f911a09bf584fcf9c6791121ec233035e"
  },
  "src/xeno-trials-sprite-atlas-v191.js": {
    "kind": "runtime",
    "sha256": "c47885f2f0ca45838affa5be93e5a576c517f093a8ef3be0122e5b95ca04c89e"
  },
  "src/xeno-trials-sprite-combat-data-v191.js": {
    "kind": "runtime",
    "sha256": "b99237732b42d534fec9a83476d5d53366e4b475bf4f08ebd4ebfada1b47c9fb"
  },
  "src/xeno-trials-sprite-special-data-v191.js": {
    "kind": "runtime",
    "sha256": "5a2321a53ceb396a172ba8fedbe433755f3fbf028204c5d634d66018097e6384"
  }
});
export const ARBITER_PROTOCOLS_PRESERVED_PLATES_V191 = freeze({
  "assets/openai/sprites/static-enemy-v92/game_avp_capcom_smasher.png": "0efaa9b6afe6f817567725d7aae0b57c15093d1f68a8e480bb34ede566c7dee8",
  "assets/openai/sprites/static-enemy-v93/game_avp_capcom_chrysalis.png": "616aeca6329e615cd42be6324d50de450d22b62d8950c7891acaf56e4a70abb7",
  "assets/openai/sprites/static-enemy-v95/ref-56-xeno-defender.png": "729a6d131424591995e8f948f9f0e6059fe0a82397a5c54f28d1269a0b46cb83",
  "assets/openai/sprites/static-enemy-v95/xeno-brute.png": "c093b0f9bf4ab5b6fa79de9f5787d2552957d1959670c639054c1c01875fca13",
  "assets/user/castes-v87/film_queen_aliens_1986.png": "985abf27db63400d8a6a68101bfaa7dde3335da0e8986ea85c409ab30da5e991",
  "assets/user/castes-v87/film_runner_alien3_1992.png": "f117c7ad0e6da9a02d3a4ce315066d75acfd67a909620f560ff6cd8c3d7b64b3",
  "assets/user/castes-v87/film_warrior_aliens_1986.png": "c791a14045116531425d270c3edd61384b063d82a0bddf4e23195e9397ecb65f",
  "assets/user/castes-v87/game_acm_crusher.png": "eca7855c29455b87bf9fc4e26afe2ab07adbd3ff4afa2c5ffb36dc6b4ebc2baa",
  "assets/user/castes-v87/game_acm_spitter.png": "c281ad7c020999e2796af1c904be45c028bd8643e45bfc45b93edaf5ba4642c7",
  "assets/user/castes-v87/game_afe_burster.png": "b2db2418502099d9f2551434cf207ef72fe0a09dc68914fbc85e18705720ce13",
  "assets/user/castes-v87/game_afe_prowler.png": "48edd1af2710048a065433b9e2c8dc20a03b05bc0a46a47394704f3a0c8bd544",
  "assets/user/castes-v87/game_avp_extinction_ravager.png": "7e2d1e236ef7de411c5458aee40520951c2c6dec2dc932a21164eea087738cbe"
});

/** Strict predecessor transition: current or observed digests are never proofs. */
export function reviewedArbiterProtocolsDigestV191(path, endpointV190) {
  const receipt = ARBITER_PROTOCOLS_SUCCESSORS_V191[path];
  if (!receipt) return endpointV190;
  assert.equal(endpointV190, receipt.previousSha256, 'Incorrect V190 endpoint for V191: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V191 successor digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'Unchanged V191 successor: ' + path);
  return receipt.currentSha256;
}

/** Called after physical verification; retains the historical caller's object. */
export function arbiterProtocolsRuntimeSourcesV191(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(ARBITER_PROTOCOLS_SUCCESSORS_V191)) if (receipt.kind === 'runtime') {
    if (result[path] !== undefined && result[path] !== receipt.currentSha256)
      assert.equal(result[path], receipt.previousSha256, 'Incorrect V191 runtime view predecessor: ' + path);
    result[path] = receipt.currentSha256;
  }
  for (const [path, receipt] of Object.entries(ARBITER_PROTOCOLS_NEW_INPUTS_V191))
    if (receipt.kind === 'runtime') result[path] = receipt.sha256;
  return Object.freeze(result);
}

export function verifyArbiterProtocolsV191(readSource = readRepository) {
  assert.ok(Object.keys(ARBITER_PROTOCOLS_SUCCESSORS_V191).length > 0, 'V191 successors await final source freeze');
  assert.ok(Object.keys(ARBITER_PROTOCOLS_NEW_INPUTS_V191).length > 0, 'V191 added inputs await final source freeze');
  const paths = [], kinds = ['runtime', 'verifier', 'asset', 'configuration', 'document-input'];
  for (const [path, receipt] of Object.entries(ARBITER_PROTOCOLS_SUCCESSORS_V191)) {
    assert.ok(safe(path), 'Unsafe V191 successor path: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'kind', 'previousSha256']);
    assert.ok(kinds.includes(receipt.kind)); paths.push(path);
    assert.equal(sha(readSource(path)), reviewedArbiterProtocolsDigestV191(path, receipt.previousSha256), 'Unreviewed V191 successor bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(ARBITER_PROTOCOLS_NEW_INPUTS_V191)) {
    assert.ok(safe(path), 'Unsafe V191 added-input path: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['kind', 'sha256']);
    assert.ok(kinds.includes(receipt.kind) && validHash(receipt.sha256)); paths.push(path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V191 added-input bytes: ' + path);
  }
  for (const [path, digest] of Object.entries(ARBITER_PROTOCOLS_PRESERVED_PLATES_V191)) {
    assert.ok(safe(path) && validHash(digest)); paths.push(path);
    assert.equal(sha(readSource(path)), digest, 'Historical source plate changed: ' + path);
  }
  assert.equal(new Set(paths).size, paths.length, 'Duplicate V191 source admission');
  assert.equal(paths.includes('scripts/audit-xeno-arbiter-protocols-v191.mjs'), false, 'V191 cannot admit its own bytes');
  for (const [path, receipt] of Object.entries(ARBITER_PROTOCOLS_HISTORICAL_DECLARATIONS_V191)) {
    const text = readSource(path).toString(), start = text.indexOf(receipt.start), end = text.indexOf(receipt.end);
    assert.ok(start >= 0 && end > start, 'Missing historical declaration anchors: ' + path);
    assert.equal(sha(text.slice(start, end)), receipt.sha256, 'Historical receipt declarations changed: ' + path);
  }
  return Object.freeze({ baselineCommit: ARBITER_PROTOCOLS_BASELINE_V191,
    successors: Object.keys(ARBITER_PROTOCOLS_SUCCESSORS_V191).length,
    addedInputs: Object.keys(ARBITER_PROTOCOLS_NEW_INPUTS_V191).length,
    preservedPlates: Object.keys(ARBITER_PROTOCOLS_PRESERVED_PLATES_V191).length,
    historicalResultsTransferred: false });
}
