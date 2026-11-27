import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_SELECTION_BASELINE_V214 = '26608995d9619ff7c369c2a980e09d0bfbd181cc';
export const XENO_SELECTION_DECLARATIONS_V214 = freeze({
  'scripts/audit-xeno-gameplay-v213.mjs': {
    start: 'export const XENO_GAMEPLAY_BASELINE_V213',
    end: '\nexport function reviewedXenoGameplayDigestV213',
    sha256: '5ae62db5933d47725ec3d9457dadd175097216b2170745f87baa609f7c5b9f89'
  }
});
export const XENO_SELECTION_SUCCESSORS_V214 = freeze({
  "scripts/audit-xeno-gameplay-v213.mjs": {
    "kind": "tooling",
    "sha256": "7ccf1cb965057afa095822306805d11b4cb00586729290e179330fc56be881a6",
    "previousSha256": "c815277a2b1a135140f2be6438afbe03cc1b1cb092a4f1c2cdc1ac5435f7ee8d"
  },
  "scripts/verify-aliens1986-main-succession-v116.mjs": {
    "kind": "tooling",
    "sha256": "a94ee105a3ad112820ccf3b12c5f60a04aa281c8edc86f3f65d2092cc2793bd9",
    "previousSha256": "1252a68f0f567dac5ee33b9d0cfe3a015d573e5f196303766e515dc948b13791"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "204da288c1103f203c18d5d74e7e3f4699eeee906126b4728891a25370d51489",
    "previousSha256": "891d48ee4da8e3ca8f3ec8f40da21a60791506bcc1911a94a8d7a5c8b7ef8979"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "c172935405d4bb3e0a8220cd9479864caa6b6342bc7892d1a0e52385270f5a20",
    "previousSha256": "da9ca7abfee5b5f5ae7dc1c535f209499f85b00171abcefa92f514a613d31857"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "tooling",
    "sha256": "49635d17552176186d7c2eb64b48f89cf2902c759ec7006a4be75a5f9358b5e7",
    "previousSha256": "fb1ae3b003f80c57579aeefe4899515a838b6796f191666ef82e53e485077405"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "5c8c63f0f11da8b39ecf690b8b78fec9aa7154d5b8a7d48098dc913676885bc8",
    "previousSha256": "8a3c9473baa3048b6ac75af5b65fe29daea0b9b0d72d66e7a02a4b8b582b6704"
  },
  "scripts/verify-river-of-pain-succession.mjs": {
    "kind": "tooling",
    "sha256": "7182faf9e05af7dd830f3a8be473a756c2a623f0f4eb8b758ddc709422867aa9",
    "previousSha256": "e59e39a4ada0eb58cbb185dbd7c48c63928e7db55bc7217321d27c1198ba8d46"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "tooling",
    "sha256": "f10032aa05a3a40d90e2955685ff1eaee1e3471ab5a781a66b7793088ceef437",
    "previousSha256": "6fa8a3b4fceb54f82e551a28fce59ec6695dae416a4a73fe8508fb01899c0419"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "tooling",
    "sha256": "85dfbcb0db17fa6d3443431820599b44a3ec7e7133e6ec264993aa50f04116e0",
    "previousSha256": "e25cf960b78ffd198e11a1fe4b501c74274709d27d543be0b27297ac4ba5f554"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "tooling",
    "sha256": "3f2662c220c9deb3d52f8427f20928e1853425d07cedf4edc77073bf937f7b6d",
    "previousSha256": "c5a869469b39280ad280748c95a20896d95f853adcb575d2551d2f57bca923c4"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "tooling",
    "sha256": "26119f9250c0959e218da08e9dfca1fd997cf81cb0c93698412c98b7c281e7f5",
    "previousSha256": "33d6774473c51ac176e1dfcd6d92bbe0b8de25fd7537410594a4ca0939760e4e"
  },
  "scripts/verify-xeno-gameplay-audit-v208.mjs": {
    "kind": "tooling",
    "sha256": "14aceb808466035f794ae60c489ca016813786484e9964429d79a3c089d6be5f",
    "previousSha256": "0be62b2329b8df784ee94861b5caf860f7ceb9c6905196ace6928206c81ca3ff"
  },
  "scripts/verify-xeno-gameplay-audit-v209.mjs": {
    "kind": "tooling",
    "sha256": "c8eb905e8360c89906d59219a276eefd6906bc3a7e2e85bbcd933a8f27b4b607",
    "previousSha256": "36ea5eb4a99433e3b001b7a40f6e2cfb9a9f19d7ad2346bbbf7d14bd06039069"
  },
  "scripts/verify-xeno-gameplay-audit-v213.mjs": {
    "kind": "tooling",
    "sha256": "35d08eaa5b3d600feeeb13621e00b60a529c92a7caad9e9f56652e330d1fca96",
    "previousSha256": "991f6b2771bccb48ec0a61435e58fe94662164e44098ed610c129c9280fa3944"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "tooling",
    "sha256": "1783c745a1e52523b6eba6df305625bc033538c3d38b779a26709ce38829e90b",
    "previousSha256": "ff6743de01097f6f8e41d271b536b4e31bd5be2cdba80b4ce8b393cc79a4730b"
  },
  "scripts/verify-xeno-priorities-audit-v201.mjs": {
    "kind": "tooling",
    "sha256": "7143dcbc42f41f811e4ae13215ac4310c7be90a83d08211af395729297757433",
    "previousSha256": "e5bbbf6eceed34e0b9bbd9259fa09f796d0482b5771b5b065127f4ee841b3d4f"
  },
  "scripts/verify-xeno-priorities-audit-v202.mjs": {
    "kind": "tooling",
    "sha256": "8d30d9e2c7d9b617e65c87912edaea2e86471bf3ccfa28c0e02c87bc6620bc83",
    "previousSha256": "06c514b36885fc56bf07807e38af0edf0dc669f435856c1f3180b59bade9f526"
  },
  "scripts/verify-xeno-priorities-audit-v203.mjs": {
    "kind": "tooling",
    "sha256": "068634d586d3b6da26fe516794f3ff325fe037df849d4ccf990342f57ec891f7",
    "previousSha256": "bcb22ae263298e92afaa20f3269725bff3a26cc481b8b8eb51fe5f081c59340d"
  },
  "scripts/verify-xeno-priorities-audit-v204.mjs": {
    "kind": "tooling",
    "sha256": "e599f9fa3fbd3a093f3606873244823901ba290812337bcf440965d9592ca17e",
    "previousSha256": "37a3cd0ea3d7568784f06387022f54cacd1288b79f88a60899ff2caffdbf2b1f"
  },
  "scripts/verify-xeno-production-assets-v206.mjs": {
    "kind": "tooling",
    "sha256": "984ada0dff12ec5c673e407321c68bd4760b5c5de07e6c32db10f71fd7fdf5f6",
    "previousSha256": "468c8656de5860e5403621d16a24718ef4c3ac9136e8e4790122a88003f12953"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "tooling",
    "sha256": "7ef78a96ed0461d365e1cebd529a3efbbbdd6169ac6bac3ea53a6d7bfe9cae71",
    "previousSha256": "16657c9a36df7e8150e9e44eca45ea5dae74b4edfb12faab1de3ef5ec8320284"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "tooling",
    "sha256": "95225a4ec636ec116f041921363e9311e1e56d0e9eae7f979360d09f40552571",
    "previousSha256": "c389048fccd2fb534ad441026f10fbcdd943fd7e2539f479ad0a89f3df6f496b"
  },
  "scripts/verify-xeno-standalone-audit-v207.mjs": {
    "kind": "tooling",
    "sha256": "17f404e4578274cdea8297a9e26fc1e8b9851da1dd6b78b4594b4ababf332e7a",
    "previousSha256": "8f0a2fc41066b813cb9bc324a4bbaab409419934e1d712683a06eec65259cf6d"
  },
  "scripts/verify-xeno-supers-audit-v200.mjs": {
    "kind": "tooling",
    "sha256": "4058a44312a7adc4a71c7bfb89c0370c22c26687d6ae922c0a61f4412502d82c",
    "previousSha256": "437697ea7adf4280bce1e439414f4e2f8137f3ac0e6e03051b96d16d216eb17a"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "96d822022f62bea8fb1058624ee5dd89b6f40145e5227f14c592f93e3091d6ab",
    "previousSha256": "43b6bbc9615e59cc84be7d02017e5cd8d501bdf9ede1ab6a19f42a62182646a1"
  },
  "scripts/verify-xeno-trials-franchise-stage-ui-v192.mjs": {
    "kind": "tooling",
    "sha256": "2aa8b1a89610255b91e10304ed07b645f374cb876fe5a8d4aca04bb089d1ec99",
    "previousSha256": "8592e5aaa11fa366c3a3d1f546ff67ffdcc36b3e2fbf766c8908341ba388b750"
  },
  "scripts/verify-xeno-visual-assets-audit-v205.mjs": {
    "kind": "tooling",
    "sha256": "21365851cc87b3c0acb34e82d21198de01a6ded27d60d1ee008cbabfad4289fc",
    "previousSha256": "e4daa14d083ea937ce680ef5f7f7af2539606d5dc760088f23acd7d2b010d951"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "sha256": "83293ecb343018635ce87f4872a1efa3550dc2a658b37c3e91b42bbcdd95b18e",
    "previousSha256": "37250e12d3470055cc723fe17be3d0c1bf59ca1294a36e1706f11ba73f6d4288"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "c52b257d5b6602873cd1798e278977745d5941cc636ec3d8bd0432ac9f807cd7",
    "previousSha256": "7cb9edce05901878969e7dbf562fbcc25e35271bef7e5a21ddebbc7e3735ef1a"
  },
  "xeno-trials-fullscreen-v119.css": {
    "kind": "runtime",
    "sha256": "a1e02bc85a96d6291261536c1e2c5b99fb6f606c4f334d46aa12124b2b0cc034",
    "previousSha256": "b0b16b695c2dca9e343b938c2d47a58449799748b8b9a8462747448dcaddd066"
  }
});

export function reviewedXenoSelectionDigestV214(path, endpoint) {
  if (!Object.hasOwn(XENO_SELECTION_SUCCESSORS_V214, path)) return endpoint;
  const receipt = XENO_SELECTION_SUCCESSORS_V214[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V213 endpoint for V214: ' + path);
  return receipt.sha256;
}

export function xenoSelectionRuntimeSourcesV214(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_SELECTION_SUCCESSORS_V214)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.sha256) reviewedXenoSelectionDigestV214(path, result[path]);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoSelectionV214(readSource = readRepository) {
  const successors = Object.entries(XENO_SELECTION_SUCCESSORS_V214);
  assert.ok(successors.length > 0, 'Incomplete V214 source freeze');
  for (const [path, receipt] of successors) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V214 source path: ' + path);
    assert.notEqual(path, 'scripts/audit-xeno-selection-v214.mjs', 'V214 cannot admit its own bytes');
    assert.ok(['runtime', 'tooling'].includes(receipt.kind) && isHash(receipt.sha256), 'Invalid V214 receipt: ' + path);
    assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V214 predecessor: ' + path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V214 source bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_SELECTION_DECLARATIONS_V214)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V213 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V213 declarations changed: ' + path);
  }
  return Object.freeze({ baseline: XENO_SELECTION_BASELINE_V214, successors: successors.length,
    historicalResultsTransferred: false });
}
