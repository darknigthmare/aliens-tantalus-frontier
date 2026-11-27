import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_COMBAT_TABLET_BASELINE_V215 = '7e22ceb1134d79c5353080932aa7ae9c259327cb';
export const XENO_COMBAT_TABLET_DECLARATIONS_V215 = freeze({
  'scripts/audit-xeno-selection-v214.mjs': {
    start: 'export const XENO_SELECTION_BASELINE_V214',
    end: '\nexport function reviewedXenoSelectionDigestV214',
    sha256: '1e21eb2ee5dbeeee003a90785d543d2dd9ba2a66d69ac179d99d1c2f6b965204'
  }
});
export const XENO_COMBAT_TABLET_SUCCESSORS_V215 = freeze({
  "scripts/audit-xeno-selection-v214.mjs": {
    "kind": "tooling",
    "sha256": "3b48a326f1907184dca5facdb0850752ed61af663b08cc8d3cfa14b2d3fb3384",
    "previousSha256": "196fe428ed424627cd8e9b991c16c94680f4a06b4519ee3912f8c4139c238cdd"
  },
  "scripts/verify-aliens1986-main-succession-v116.mjs": {
    "kind": "tooling",
    "sha256": "f029396e4e2368c372a770ba50ad5feb0702feb4aca8e5ade9be89ab87582511",
    "previousSha256": "a94ee105a3ad112820ccf3b12c5f60a04aa281c8edc86f3f65d2092cc2793bd9"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "e4b2ab44609051ae5f3d5a30502fc0ee62a6344e412aeb5951dbd0d800b7308b",
    "previousSha256": "204da288c1103f203c18d5d74e7e3f4699eeee906126b4728891a25370d51489"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "63f0832ac9579e30bbd4c2be390a7b979fb0188bfc89c14d2c048aca315ba7fb",
    "previousSha256": "c172935405d4bb3e0a8220cd9479864caa6b6342bc7892d1a0e52385270f5a20"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "tooling",
    "sha256": "3be295e570f006c7414d5949609c41b739bf71a53f35e0ca17903b444460b5e6",
    "previousSha256": "49635d17552176186d7c2eb64b48f89cf2902c759ec7006a4be75a5f9358b5e7"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "901e53e131b94c15633fb02f6a59a154c18310879c27ad3782cacbc74ff5494b",
    "previousSha256": "5c8c63f0f11da8b39ecf690b8b78fec9aa7154d5b8a7d48098dc913676885bc8"
  },
  "scripts/verify-river-of-pain-succession.mjs": {
    "kind": "tooling",
    "sha256": "2e1cfb67bf1477cc858f2285ca78b54cb8acd69c92ec2e9626fc463943db3d06",
    "previousSha256": "7182faf9e05af7dd830f3a8be473a756c2a623f0f4eb8b758ddc709422867aa9"
  },
  "scripts/verify-trials-navigation-v163.mjs": {
    "kind": "tooling",
    "sha256": "01f4eb053ff66ca6ea4ed91de162c46b289367328cb636e91a8e8e83dfcbc23f",
    "previousSha256": "2f87256ada6f134c20c83af4cac5bb432e1a6a3baf6e66fa4f6027985fa21c6a"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "tooling",
    "sha256": "06e2f7de056a3756e87ceec9f8c4d6dcacd1d53249c14dc6399433f8d97090cb",
    "previousSha256": "f10032aa05a3a40d90e2955685ff1eaee1e3471ab5a781a66b7793088ceef437"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "tooling",
    "sha256": "4a5d087e4dd8e0aa46e250ad9aae975ff7b115dc69269557c7a61f07918cd9d4",
    "previousSha256": "85dfbcb0db17fa6d3443431820599b44a3ec7e7133e6ec264993aa50f04116e0"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "tooling",
    "sha256": "ff4afbea5355f43a7a2cbc49b59ccddff355066b4929e8a5646d83dcc527a43b",
    "previousSha256": "3f2662c220c9deb3d52f8427f20928e1853425d07cedf4edc77073bf937f7b6d"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "tooling",
    "sha256": "f1959ae5a8715987a2f2d47525b45af65917e43d4d882f88d47efaa0dff89d24",
    "previousSha256": "26119f9250c0959e218da08e9dfca1fd997cf81cb0c93698412c98b7c281e7f5"
  },
  "scripts/verify-xeno-gameplay-audit-v208.mjs": {
    "kind": "tooling",
    "sha256": "9fa11a2f6b3554fed9935449b664d0a2b1df814232816f76ad522f4611d87ca1",
    "previousSha256": "14aceb808466035f794ae60c489ca016813786484e9964429d79a3c089d6be5f"
  },
  "scripts/verify-xeno-gameplay-audit-v209.mjs": {
    "kind": "tooling",
    "sha256": "436eb1027392626af81c16dd93e0342d66f5032fe4320539497dd7fc339cfbe3",
    "previousSha256": "c8eb905e8360c89906d59219a276eefd6906bc3a7e2e85bbcd933a8f27b4b607"
  },
  "scripts/verify-xeno-gameplay-audit-v213.mjs": {
    "kind": "tooling",
    "sha256": "d2245d1ad77ec32801b7d570c95c6ab5915450e0464f65ca94a75dba434405ea",
    "previousSha256": "35d08eaa5b3d600feeeb13621e00b60a529c92a7caad9e9f56652e330d1fca96"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "tooling",
    "sha256": "997a72a4af35d76136b518711733f8d22a069c6b816a8352e5eb0e356d7dfd95",
    "previousSha256": "1783c745a1e52523b6eba6df305625bc033538c3d38b779a26709ce38829e90b"
  },
  "scripts/verify-xeno-priorities-audit-v201.mjs": {
    "kind": "tooling",
    "sha256": "3c728d93d627e2707b8e467220d0d596d67924be24fb849e1374c7abe6170f50",
    "previousSha256": "7143dcbc42f41f811e4ae13215ac4310c7be90a83d08211af395729297757433"
  },
  "scripts/verify-xeno-priorities-audit-v202.mjs": {
    "kind": "tooling",
    "sha256": "6c372017b1f76a15990c5650406f7b24dd7a31b0f32179e5e7b4fae8d6c5247f",
    "previousSha256": "8d30d9e2c7d9b617e65c87912edaea2e86471bf3ccfa28c0e02c87bc6620bc83"
  },
  "scripts/verify-xeno-priorities-audit-v203.mjs": {
    "kind": "tooling",
    "sha256": "2172d5d338c0eedf178f785d7d58ba153071e992a6042be380cb85745c646b5f",
    "previousSha256": "068634d586d3b6da26fe516794f3ff325fe037df849d4ccf990342f57ec891f7"
  },
  "scripts/verify-xeno-priorities-audit-v204.mjs": {
    "kind": "tooling",
    "sha256": "f1c3009b946614557f332897cd7aa1f0c6fb03db41f1d18e373cbb7698b079e4",
    "previousSha256": "e599f9fa3fbd3a093f3606873244823901ba290812337bcf440965d9592ca17e"
  },
  "scripts/verify-xeno-production-assets-v206.mjs": {
    "kind": "tooling",
    "sha256": "0b29c9d3d262b928b0c79786ade2a465de008ef5ba68d1c03616af6fb351bdb3",
    "previousSha256": "984ada0dff12ec5c673e407321c68bd4760b5c5de07e6c32db10f71fd7fdf5f6"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "tooling",
    "sha256": "60120d936c77a3651c1ccdf4aae68dbf1f52455c8ed750e9ec2465e1d6e17c8f",
    "previousSha256": "7ef78a96ed0461d365e1cebd529a3efbbbdd6169ac6bac3ea53a6d7bfe9cae71"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "tooling",
    "sha256": "7f0c40dd35ba1c3d84a6cbcb3be46f2ede013bbbeffa7fb8b2df021751938b53",
    "previousSha256": "95225a4ec636ec116f041921363e9311e1e56d0e9eae7f979360d09f40552571"
  },
  "scripts/verify-xeno-standalone-audit-v207.mjs": {
    "kind": "tooling",
    "sha256": "311e82e2b408fa953ce08b6044ffc689ae59c0f0100a8e52c367d443b3d8c2c0",
    "previousSha256": "17f404e4578274cdea8297a9e26fc1e8b9851da1dd6b78b4594b4ababf332e7a"
  },
  "scripts/verify-xeno-supers-audit-v200.mjs": {
    "kind": "tooling",
    "sha256": "10d9689ac5eb267a0a7a9125b17b5518a3e6c6b89092eb0bc7b6a84f1006d4d2",
    "previousSha256": "4058a44312a7adc4a71c7bfb89c0370c22c26687d6ae922c0a61f4412502d82c"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "909b596d28844a99127a204d33538998bf95869050d05bfa3fdcd12eca67f875",
    "previousSha256": "96d822022f62bea8fb1058624ee5dd89b6f40145e5227f14c592f93e3091d6ab"
  },
  "scripts/verify-xeno-visual-assets-audit-v205.mjs": {
    "kind": "tooling",
    "sha256": "756e52f42c3ff1dd151d2c13220bddbcc87eb9e2c7f7aaf58331436ba1368863",
    "previousSha256": "21365851cc87b3c0acb34e82d21198de01a6ded27d60d1ee008cbabfad4289fc"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "sha256": "44abd301fd7117a71357bf3571db0ce05e71f936728a21cfeeac64638f293e97",
    "previousSha256": "83293ecb343018635ce87f4872a1efa3550dc2a658b37c3e91b42bbcdd95b18e"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "sha256": "1efd734220cbad5adb69a0172f4b22ce2878272f46fb46f404e5a1075588dfed",
    "previousSha256": "31b5d6a600dce31ae0fbc9dec6f64cf7bac4bc6a417226a5f0515a5b6e720a01"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "0c63d82131baf65742f87261ba2bae6b62537435d91e0a8da4a50a4383a9a2a8",
    "previousSha256": "c52b257d5b6602873cd1798e278977745d5941cc636ec3d8bd0432ac9f807cd7"
  },
  "xeno-trials-fullscreen-v119.css": {
    "kind": "runtime",
    "sha256": "bfe1febbfd066da02bd21e40a683835ad8d978e39baa57ad4efb9e1ab99088c1",
    "previousSha256": "a1e02bc85a96d6291261536c1e2c5b99fb6f606c4f334d46aa12124b2b0cc034"
  }
});

export function reviewedXenoCombatTabletDigestV215(path, endpoint) {
  if (!Object.hasOwn(XENO_COMBAT_TABLET_SUCCESSORS_V215, path)) return endpoint;
  const receipt = XENO_COMBAT_TABLET_SUCCESSORS_V215[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V214 endpoint for V215: ' + path);
  return receipt.sha256;
}

export function xenoCombatTabletRuntimeSourcesV215(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_COMBAT_TABLET_SUCCESSORS_V215)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.sha256) reviewedXenoCombatTabletDigestV215(path, result[path]);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoCombatTabletV215(readSource = readRepository) {
  const successors = Object.entries(XENO_COMBAT_TABLET_SUCCESSORS_V215);
  assert.ok(successors.length > 0, 'Incomplete V215 source freeze');
  for (const [path, receipt] of successors) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V215 source path: ' + path);
    assert.notEqual(path, 'scripts/audit-xeno-combat-tablet-v215.mjs', 'V215 cannot admit its own bytes');
    assert.ok(['runtime', 'tooling'].includes(receipt.kind) && isHash(receipt.sha256), 'Invalid V215 receipt: ' + path);
    assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V215 predecessor: ' + path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V215 source bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_COMBAT_TABLET_DECLARATIONS_V215)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V214 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V214 declarations changed: ' + path);
  }
  return Object.freeze({ baseline: XENO_COMBAT_TABLET_BASELINE_V215, successors: successors.length,
    historicalResultsTransferred: false });
}
