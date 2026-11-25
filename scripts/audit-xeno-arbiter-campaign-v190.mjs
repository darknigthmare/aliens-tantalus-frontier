/** Exact 3a6c141 V189 -> V190 ARBITER campaign/stage continuation.
 * Historical receipts remain immutable. This audit admits only named source
 * bytes; QA results, publication and canonical fidelity are never inherited.
 * V191 continues the unchanged receipt declarations through an exact relay.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { reviewedArbiterProtocolsDigestV191, arbiterProtocolsRuntimeSourcesV191,
  verifyArbiterProtocolsV191 } from './audit-xeno-arbiter-protocols-v191.mjs';

const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const safe = path => typeof path === 'string' && /^[a-zA-Z0-9._/-]+$/.test(path) && !path.startsWith('/') && !path.split('/').some(part => part === '..' || !part);

export const ARBITER_CAMPAIGN_BASELINE_V190 = '3a6c1410f606b83a7be881f93b6e87f8d0008a98';
export const ARBITER_CAMPAIGN_HISTORICAL_DECLARATIONS_V190 = freeze({
  'scripts/audit-xeno-animation-audio-v189.mjs': {
    start: 'export const ANIMATION_AUDIO_BASELINE_V189', end: '\n/** A current digest',
    sha256: '61916ef2e1a08e854525103e4abb41970730e6d3d111966c1c6cbaf71b562a44'
  },
  'scripts/audit-xeno-stage-operations-v188.mjs': {
    start: 'export const STAGE_OPERATIONS_BASELINE_V188', end: '\nexport function reviewedStageOperationsDigestV188',
    sha256: '877b259c841594d4a0cddca47c8977d389bf6c68816951dcbe95389bd49708e4'
  },
  'scripts/audit-native-qa-resources-v187.mjs': {
    start: 'export const NATIVE_QA_RESOURCES_BASELINE_V187', end: '\nexport function reviewedNativeQaResourcesDigestV187',
    sha256: 'a1704b9d7c8381aec02750c5be09ae47f416bf51c4d1635952c1bdb2eaa3de5f'
  },
  'scripts/audit-xeno-trials-completion-v186.mjs': {
    start: 'export const COMPLETION_BASELINES_V186', end: '\nexport function reviewedCompletionDigestV186',
    sha256: '9c864a391884bd01ec0c4091515d10a7ed6eaf88b93281c0bfec94caabff0495'
  }
});

// Populated only after the implementation and its targeted evidence are frozen.
export const ARBITER_CAMPAIGN_SUCCESSORS_V190 = freeze({
  ".github/workflows/full-release-v143.yml": {
    "kind": "configuration",
    "previousSha256": "0ec3deb5a88aac2e6bae73f51f41ed653ce3ff202254fb318bcff98034fbe8a2",
    "currentSha256": "16ef2b6b1b1b1c5268b278ccfc703cb7316b09fe2089a9820c5e3f96aa81982b"
  },
  ".github/workflows/non-forge-regression-v163.yml": {
    "kind": "configuration",
    "previousSha256": "6b7270ac2cd8f5d84ba529de5f3675cedf0e430898823c1d107872980b7a6002",
    "currentSha256": "3db6cc53887a07224afacb2a0e15df9889d4bd09319d2cf3b2ff91767463e518"
  },
  "index.html": {
    "kind": "runtime",
    "previousSha256": "337a0b230d0b075bf70e5122240f1ce8e0d2deaebbbd563a15496ea92b5f4d66",
    "currentSha256": "ee97f3a438cf92e3b4a34beb28ca9c5d7687a40fe5cab389fcf5876085a789e3"
  },
  "package.json": {
    "kind": "configuration",
    "previousSha256": "8b397bb663172899a40ef35a29e30fcedda645c20b2bad1ed316df45fba6fbc9",
    "currentSha256": "a872ee10bf3a8068d494fe8d24cdbeee90a427b8770e5745c76dc8645384a4f8"
  },
  "scripts/audit-native-qa-resources-v187.mjs": {
    "kind": "verifier",
    "previousSha256": "8ec970927c3693f1183099ab7e006fca77b2b4cb0030f35111589022b1e1ebfe",
    "currentSha256": "74908e96de43186a67240f9ac0590d3e9d3bee4418cce371cbd097478c7bd68a"
  },
  "scripts/audit-xeno-animation-audio-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "1e7add28277c1e18122e88d3eda7e4ec75390e8bb42225fedd0b3c636ef98f08",
    "currentSha256": "30df35de210a7b7421a98e2517ab4216f10cab23b4a2954e35d1c7895748ffaa"
  },
  "scripts/build-asset-filter.mjs": {
    "kind": "verifier",
    "previousSha256": "62ebdd3ce0c5d1d1c0667b838f32847be6b810a26828632c2edbc73dea2882dc",
    "currentSha256": "1d536357afc3a879cbaf988c355f9ca6796c7bd6ecfa9e8b1696162c033221ea"
  },
  "scripts/build.mjs": {
    "kind": "verifier",
    "previousSha256": "f95c67ae8bcdfe6bfdd46bb4bd40a60612aa0a5d50d8e6cf865620f73b14c527",
    "currentSha256": "c13ad85b95e09c8fdf32a9f7e4583f16d6e403c77dd638664210be1eb62599c7"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "verifier",
    "previousSha256": "9805093a116d433e08d50ff76f8e4cbe59f0b5895293f99f863f7a5181e8c93a",
    "currentSha256": "d418240cb37eb22492f2da1b492614b7fd262f6effc9179cf737e495f9c58426"
  },
  "scripts/verify-audit-v143.mjs": {
    "kind": "verifier",
    "previousSha256": "825a8672e074c335568669ce8e5c496ed2fb70af9e11f3d834169da1a8d5a1c2",
    "currentSha256": "3884df6e20f1d9bfeab80087c5b4e208ef773b3ecbe3ed27fd2cd962b280b45e"
  },
  "scripts/verify-campaign-lethe-v163.mjs": {
    "kind": "verifier",
    "previousSha256": "cb3ac8826d4f15bbab86e0c42dcd225aeee341c9b10950046fb14af104473049",
    "currentSha256": "2bbeef4cb4340350e187cdd22945e800df43cd3207d8f72429992250b05883b8"
  },
  "scripts/verify-campaign-story-v160.mjs": {
    "kind": "verifier",
    "previousSha256": "a8f09d16a1e137b36b95c1473910d228289c2515b26bd3704584a2f13cfabcf8",
    "currentSha256": "8a7d9b5722882df610e87dfb4d393c5c879f281d06bb127c645d01649587d885"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "10e3f42fcac656fc36ad7175a10c5a499f78e04a1f2b5a06f465336a613f3ba9",
    "currentSha256": "60ce9cff79a2a5b784306cdde25324410fd2f91f52fd0e877871f6e781d3645f"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "verifier",
    "previousSha256": "d9c25a2a1da5275e78927bfce432f4c5744103f92f74bd07d0015818c354bb31",
    "currentSha256": "acb5166a7b0d8b7ad1128ff67fea1638f0ddb2426330ade5c45ffad474fe8ef2"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "verifier",
    "previousSha256": "546c53a72d0f6f645d766d7e9e9c9f987c5537a551185d080141756aeb08fd3d",
    "currentSha256": "df26a90565ebae873bb196a4d4a087628402c850ea57463401c4a64799acc902"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "b3c14d53591f5e6a7f907d0a1a93298887c19671137cca1d377b6d2d6ef2d2c7",
    "currentSha256": "1470c5af4f420d51580854184ccd2bce69c8e2c9f8b3a33673c9a4e9e94906aa"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "bbf8b114717ee921d9584e33dfc2439ef31e2e56db6c8fc647ecbc2e30a1a764",
    "currentSha256": "cfc8f043b55acb41218b4ac66f133e33f096ad658ccdff81d6c11753d710ec49"
  },
  "scripts/verify-xeno-trials-animation-audio-i18n-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "cf9c60d0a24858ed60c6761ff5da2a24cf4de4201d8987bb577c1648d40e4735",
    "currentSha256": "a9903297cd862a44e16313e1670910fb1c9f34d501ad9edca59df4163d8ff9a3"
  },
  "scripts/verify-xeno-trials-boss-stages-v179.mjs": {
    "kind": "verifier",
    "previousSha256": "dacd2bf22f3616fbeba14dcd1a874e3ce287dc9f1c204a8b485dedf4a1294c2d",
    "currentSha256": "f258d4932ef9a7b2dc6b995f61b0f7e6e200f902353a010ad133e4e3b657ad0a"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "64daefd4c2740980a5d4a2c0f542b84cdefbda17b744c45ca79a49eb52b9cbb3",
    "currentSha256": "21977092efa3b5a23ec07fa53e54350d939f0699220b1fb8d98c7184ac2e6a34"
  },
  "scripts/verify-xeno-trials-feedback-v149.mjs": {
    "kind": "verifier",
    "previousSha256": "6cc6b2229a677233405effd1d5b02f4ac81e390e9a6df7e5fb523cb69b158d5f",
    "currentSha256": "131a937e71959d4ca1342d5c690897a6d4eec7bf75e543871fee8686464df7fa"
  },
  "scripts/verify-xeno-trials-i18n-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "06535328cb13470bf34990cbb015bc6d5532744cfa51f3b74bf3c7459e583e2b",
    "currentSha256": "f34056d2548f0148227647f2ab351ecdd2f4ca0419c88950736493a24b653e30"
  },
  "scripts/verify-xeno-trials-operation-i18n-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "af9fea1b43651c08f61f0a1d85ee1ac1754e492229e4ac13102902735c587079",
    "currentSha256": "19a7bc6287bebb6e59191178a00ede820a700dbad2dbb175187cdd76c172b6c0"
  },
  "scripts/verify-xeno-trials-signatures-v147.mjs": {
    "kind": "verifier",
    "previousSha256": "87bfad249fd6331e49959f9f02b4f56b34703ba81126cd7f506be731182e4a12",
    "currentSha256": "abaf985401d0c9aac0abecb21ef56d2833d0af943d9f0266e5f6a8b58026f35a"
  },
  "src/app.js": {
    "kind": "runtime",
    "previousSha256": "7cd214baa4d5b8aabc28c4887539024e0f3cc412567552b4fab197e00073aed3",
    "currentSha256": "570a0bb52c52a92eefe596408ec6fb54f446c77998d69b80c4332576783a6c30"
  },
  "src/content.js": {
    "kind": "runtime",
    "previousSha256": "916a3ee2c7c05a6a81e9de9eacb68e41ab9dd0aeac9be53e260c1024a369a701",
    "currentSha256": "a7fb0c9bc6da8ff2bf9c008dfbbf2f580a9207ac9a8b1ec6f8e06025003363ff"
  },
  "src/game-production-runtime.js": {
    "kind": "runtime",
    "previousSha256": "f0c9ff64ce004cc0dd8d028e3a62a717364fa0c1425eafb16b2ae8f808715419",
    "currentSha256": "2c12ae1bfe30bd28c19035cf84e2cbbe10c88d2c39fc24b5dab21d91229a2886"
  },
  "src/i18n-en-catalog-v185.js": {
    "kind": "runtime",
    "previousSha256": "60b5ad93be9cce46bd0d91b334f1b135654e368f16a46612554175df167f1dc3",
    "currentSha256": "1e35016834e518294d4be14501872045d1ef54754b5309368bfb99c0c22ea8d3"
  },
  "src/mission-insertion-ui-v62.js": {
    "kind": "runtime",
    "previousSha256": "5de383b9379b5466c783abeabf1b800816adbd273d48dafc0d7b7c91caa639bf",
    "currentSha256": "7ee5a40ec08e355ca0d36ac386599e700b27129df3726232192fb28e5131d62e"
  },
  "src/player-surfaces-v110.js": {
    "kind": "runtime",
    "previousSha256": "88cf09a67c5fc21a7a55c49209dcdd5c84b9362f21e1618a7b30aed11c5453d4",
    "currentSha256": "4b0772b9ffc5d616635b4704d7a88c8cd1bb16fafbbb599293fb9000c65ea160"
  },
  "src/save.js": {
    "kind": "runtime",
    "previousSha256": "afd5b289887c3a6be5d704ad9b501d9cd7bfeae4514fdfb4eaf21095e6d42304",
    "currentSha256": "977662049f595d83c4fb51a3516d80481ebbd37567a96d3a46f62e557ca177a8"
  },
  "src/xeno-trials-data-v96.js": {
    "kind": "runtime",
    "previousSha256": "e98af33016b8ba0503b70b7e6bd755f1127722d023dd5138fed8e133bf42f33b",
    "currentSha256": "739847452dd808d3bcef3e36b60c2e723acff64c5d523ec7059e94ffac335a18"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "previousSha256": "4a514c2ee4fe5e222168800fb27343b57a97b0273b2b8941230a057d9821da61",
    "currentSha256": "45c010862523888ef172839d52f62fa215b7ff1f4c0d356335ad89b9230f953e"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "previousSha256": "2e53bfaba41b0a098881e7327a69ab164fbee152ea5fca645b9fbe51e517be0c",
    "currentSha256": "13a7f1c7d2188f4162cec2d562141967b8e62248d32d019f079d9138e9002d1a"
  },
  "sw.js": {
    "kind": "runtime",
    "previousSha256": "da082382d5943a8f0fbed86b897cbb4a397927dd51a3fc4fea85cc42fe734fc6",
    "currentSha256": "04ad0d59e7c56c1d64109ef36f3fc156c0fc4c1384f04f260a13ed0296d4d520"
  }
});
export const ARBITER_CAMPAIGN_NEW_INPUTS_V190 = freeze({
  "assets/openai/campaign/xeno-arbiter-v190/arbiter-recovery.png": {
    "kind": "asset",
    "sha256": "7a166494b72948ea997fc0fb20e951b4ab2154046e4656e277e794c3ce9ec431"
  },
  "assets/openai/stages/xeno-trials-v190/arbitration-gallery-atlas.png": {
    "kind": "asset",
    "sha256": "675a800f85be1829d9b7f0dcd5616d249a04df224339322064017e7d51112dc5"
  },
  "assets/openai/stages/xeno-trials-v190/containment-rail-atlas.png": {
    "kind": "asset",
    "sha256": "c582de5de305c399d0aa50ab3a62efd8b265487542bee634fdcf947ea52e222d"
  },
  "assets/openai/stages/xeno-trials-v190/council-server-atlas.png": {
    "kind": "asset",
    "sha256": "9d2938344b1bd67d10e39710cefb0da5e97ddf26900917ee1251a565218bf04f"
  },
  "assets/openai/stages/xeno-trials-v190/secured-cargo-atlas.png": {
    "kind": "asset",
    "sha256": "45a35d8614bbeb52a9890bf2513cc5a0e3b28da4fc5317309d722b9616755f22"
  },
  "docs/forge/xeno-trials/campaign-art-production-v190.json": {
    "kind": "document-input",
    "sha256": "a4b1967287f42a02a6b63cc54dd85f2cc456c5003a0946f16e48735ea839357f"
  },
  "docs/forge/xeno-trials/i18n-arbiter-review-v190.json": {
    "kind": "document-input",
    "sha256": "e4dc499030727f8e96dc00982c6cf57da4d348030bb403ac2d25e10d7f755168"
  },
  "docs/forge/xeno-trials/stage-art-production-v190.json": {
    "kind": "document-input",
    "sha256": "9c47c79d77b7b1bf71b06b8e35c07b01713a8b1889981b618012dcf09923e02b"
  },
  "scripts/public-xeno-arbiter-admissions-v190.mjs": {
    "kind": "verifier",
    "sha256": "c57ef9375698621b0e32482ba46588b20cf100a6507df7b5ecc24df87c03ec8f"
  },
  "scripts/qa-xeno-arbiter-stages-v190.py": {
    "kind": "verifier",
    "sha256": "b060f1fe98971a8a3507a12644e2e668d2c18220676a47f6e45257a6a84b2463"
  },
  "scripts/verify-xeno-arbiter-campaign-art-v190.mjs": {
    "kind": "verifier",
    "sha256": "469e4ca31eed43c2917fe3c5a8d14f7e32600221f11b1a3b0328eeee8f796320"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "verifier",
    "sha256": "c80df82358a5dbaf0e53dd6f43f74734643d89a126154bd33cdb31d46ac49790"
  },
  "scripts/verify-xeno-arbiter-campaign-v190.mjs": {
    "kind": "verifier",
    "sha256": "54554db19910b260837967ece8f6ec6918e6c946ea6a2b5b643679ab84d3b41f"
  },
  "scripts/verify-xeno-arbiter-i18n-v190.mjs": {
    "kind": "verifier",
    "sha256": "a15ac842360125c4fce1080aa86228e3ab4d95a23246a9d7a6e2b630181ccc97"
  },
  "scripts/verify-xeno-arbiter-save-ui-v190.mjs": {
    "kind": "verifier",
    "sha256": "4a3f78c84016a5db764fe3c0fecd60adbe99799d8962b0aa1d7467f7df49547b"
  },
  "scripts/verify-xeno-arbiter-scenery-v190.mjs": {
    "kind": "verifier",
    "sha256": "a9cf755be9f5846eb8d64ba423611ba1cb592738326245af9b1bef80a52a8684"
  },
  "scripts/verify-xeno-trials-stage-scenes-v190.mjs": {
    "kind": "verifier",
    "sha256": "28b501874e8359d1caebeaa461e317d590aea7c10d56263e824e042c2840f56b"
  },
  "scripts/xeno-arbiter-test-helpers-v190.mjs": {
    "kind": "verifier",
    "sha256": "1b63cfbb0555b97058e8e7652efee31ce1ce4d1d65d01746d378e29079b05983"
  },
  "src/campaign-art-v190.js": {
    "kind": "runtime",
    "sha256": "f6cdee8a25385866d69bd3a1a8b3d699c69b574622926cdea032f18cad67e466"
  },
  "src/xeno-arbiter-campaign-v190.js": {
    "kind": "runtime",
    "sha256": "50196f768f896bd7671d5c50c5f5979172b54925b49a960f6b1375df9590a591"
  },
  "src/xeno-arbiter-runtime-v190.js": {
    "kind": "runtime",
    "sha256": "e5380991a5eaeb995f6e309b6053412376169caac98da722258417fff38ce7a0"
  },
  "src/xeno-arbiter-scenery-v190.js": {
    "kind": "runtime",
    "sha256": "7fcdf0ea9dc0819c52e7d917e6acd675ea2d814d0b1bffa4a7ef3d9a07485c6f"
  },
  "src/xeno-arbiter-ui-v190.js": {
    "kind": "runtime",
    "sha256": "3b9d60bee90c21535aaaf97baa3a28c335f558be4ae4d478da3ebe98b5a49955"
  },
  "src/xeno-trials-stage-scenes-render-v190.js": {
    "kind": "runtime",
    "sha256": "74b0ba84138ce86105356c92ed5c3b282ce183de65698da6e959de0a4c776be6"
  },
  "src/xeno-trials-stage-scenes-v190.js": {
    "kind": "runtime",
    "sha256": "4c73eb6861fe0a9d5335188170c477f4d9f2f046c4ca5ba0b5556ac8a82bc664"
  },
  "xeno-arbiter-v190.css": {
    "kind": "runtime",
    "sha256": "f8cebfd4a294e05b18d0a30bacb06318489ed1a78473985e8509c09f8d73b365"
  }
});
export const ARBITER_CAMPAIGN_PRESERVED_PLATES_V190 = freeze({
  'assets/user/castes-v87/film_queen_aliens_1986.png': '985abf27db63400d8a6a68101bfaa7dde3335da0e8986ea85c409ab30da5e991',
  'assets/user/castes-v87/game_acm_crusher.png': 'eca7855c29455b87bf9fc4e26afe2ab07adbd3ff4afa2c5ffb36dc6b4ebc2baa',
  'assets/user/castes-v87/game_avp_extinction_ravager.png': '7e2d1e236ef7de411c5458aee40520951c2c6dec2dc932a21164eea087738cbe',
  'assets/user/castes-v87/game_afe_burster.png': 'b2db2418502099d9f2551434cf207ef72fe0a09dc68914fbc85e18705720ce13'
});

/** Strict predecessor transition: current or observed digests are never proofs. */
export function reviewedArbiterCampaignDigestV190(path, endpointV189) {
  const receipt = ARBITER_CAMPAIGN_SUCCESSORS_V190[path];
  if (!receipt) return reviewedArbiterProtocolsDigestV191(path, endpointV189);
  assert.equal(endpointV189, receipt.previousSha256, 'Incorrect V189 endpoint for V190: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V190 successor digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'Unchanged V190 successor: ' + path);
  return reviewedArbiterProtocolsDigestV191(path, receipt.currentSha256);
}

/** Called after physical verification; retains the historical caller's object. */
export function arbiterCampaignRuntimeSourcesV190(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(ARBITER_CAMPAIGN_SUCCESSORS_V190)) if (receipt.kind === 'runtime') {
    const current = reviewedArbiterProtocolsDigestV191(path, receipt.currentSha256);
    if (result[path] !== undefined)
      assert.ok([receipt.previousSha256, receipt.currentSha256, current].includes(result[path]), 'Incorrect V190 runtime view predecessor: ' + path);
    result[path] = current;
  }
  for (const [path, receipt] of Object.entries(ARBITER_CAMPAIGN_NEW_INPUTS_V190))
    if (receipt.kind === 'runtime') result[path] = reviewedArbiterProtocolsDigestV191(path, receipt.sha256);
  return arbiterProtocolsRuntimeSourcesV191(result);
}

export function verifyArbiterCampaignV190(readSource = readRepository) {
  assert.ok(Object.keys(ARBITER_CAMPAIGN_SUCCESSORS_V190).length > 0, 'V190 successors await final source freeze');
  assert.ok(Object.keys(ARBITER_CAMPAIGN_NEW_INPUTS_V190).length > 0, 'V190 added inputs await final source freeze');
  const paths = [], kinds = ['runtime', 'verifier', 'asset', 'configuration', 'document-input'];
  for (const [path, receipt] of Object.entries(ARBITER_CAMPAIGN_SUCCESSORS_V190)) {
    assert.ok(safe(path), 'Unsafe V190 successor path: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'kind', 'previousSha256']);
    assert.ok(kinds.includes(receipt.kind)); paths.push(path);
    assert.equal(sha(readSource(path)), reviewedArbiterCampaignDigestV190(path, receipt.previousSha256), 'Unreviewed V190 successor bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(ARBITER_CAMPAIGN_NEW_INPUTS_V190)) {
    assert.ok(safe(path), 'Unsafe V190 added-input path: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['kind', 'sha256']);
    assert.ok(kinds.includes(receipt.kind) && validHash(receipt.sha256)); paths.push(path);
    assert.equal(sha(readSource(path)), reviewedArbiterProtocolsDigestV191(path, receipt.sha256), 'Unreviewed V190 added-input bytes: ' + path);
  }
  for (const [path, digest] of Object.entries(ARBITER_CAMPAIGN_PRESERVED_PLATES_V190)) {
    assert.ok(safe(path) && validHash(digest)); paths.push(path);
    assert.equal(sha(readSource(path)), digest, 'Historical source plate changed: ' + path);
  }
  assert.equal(new Set(paths).size, paths.length, 'Duplicate V190 source admission');
  assert.equal(paths.includes('scripts/audit-xeno-arbiter-campaign-v190.mjs'), false, 'V190 cannot admit its own bytes');
  for (const [path, receipt] of Object.entries(ARBITER_CAMPAIGN_HISTORICAL_DECLARATIONS_V190)) {
    const text = readSource(path).toString(), start = text.indexOf(receipt.start), end = text.indexOf(receipt.end);
    assert.ok(start >= 0 && end > start, 'Missing historical declaration anchors: ' + path);
    assert.equal(sha(text.slice(start, end)), receipt.sha256, 'Historical receipt declarations changed: ' + path);
  }
  verifyArbiterProtocolsV191(readSource);
  return Object.freeze({ baselineCommit: ARBITER_CAMPAIGN_BASELINE_V190,
    successors: Object.keys(ARBITER_CAMPAIGN_SUCCESSORS_V190).length,
    addedInputs: Object.keys(ARBITER_CAMPAIGN_NEW_INPUTS_V190).length,
    preservedPlates: Object.keys(ARBITER_CAMPAIGN_PRESERVED_PLATES_V190).length,
    historicalResultsTransferred: false });
}
