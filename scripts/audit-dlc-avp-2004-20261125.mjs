/**
 * Exact AVP host successors after the merged Tantalus/Xeno Trials endpoint.
 * Historical receipts are immutable. This terminal imports no audit, admits no
 * bytes for itself and transfers no earlier CI, browser or fidelity result.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const ownPath = 'scripts/audit-dlc-avp-2004-20261125.mjs';

export const AVP_HOST_BASELINE_20261125 = '001a20bdc0f9f1a3c835e84d8f3c9434bc159330';
export const AVP_HOST_SUCCESSORS_20261125 = Object.freeze(Object.fromEntries(
  Object.entries({
  "index.html": {
    "previousSha256": "1ab4a1fd0e2a090c287e501e12f6476a15644ca8455a1689133fc1bbeae7f2fd",
    "currentSha256": "bcef383f942f6b7d113f8fe6afb85d157cbde3867b5de45d8fc1bb2147f9b492"
  },
  "package.json": {
    "previousSha256": "6d261eda040a57d60f8b4039443517a0cfeddd55b657c77ae87d2c8f486a39be",
    "currentSha256": "9d44e3a248a1084305772e4d2cdbf5963200f1c37b1940fd9a15c57c26b23914"
  },
  "scripts/audit-tantalus-priorities-v188.mjs": {
    "previousSha256": "b75a3adbf7271c6c7d6b0ce817db43c12209c261e54cae08e8ae001167ff9568",
    "currentSha256": "1fc91c75bac707ab286533aad8410e8109b81a2ad951adb08a22bf108dff4d91"
  },
  "scripts/audit-xeno-production-assets-v206.mjs": {
    "previousSha256": "c309884e210d998dd1c8cd49355905f73fdf4f464ea2d0c15cac78a0f8cff307",
    "currentSha256": "9cce60b8ee74d60e8f525e7117885409455f0cdbc5e34ee745e45eb8cd48d48e"
  },
  "scripts/build.mjs": {
    "previousSha256": "fa817256bc9832c9390055ddab431e8dd9e1320b273904c39f2489ff6807ab12",
    "currentSha256": "c941cd1ffeb251289f1c89b7bae3f893cf87263a5beba1613a9f1c4a427bff42"
  },
  "scripts/qa-title-compositions-v163.py": {
    "previousSha256": "e5ea9bd5a6dddf15ad3c4993f7233ff1ec3f8aac497ab815e16b19df86d381d3",
    "currentSha256": "a5bb799726f884b82c6ea77577f1f0f5d925f6a45a052b8ac43bf1ae086d56f8"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "previousSha256": "4abcfb2e30d5cc770e9299c5af4b766fc5b1f20de1628f4f7a17b611ce428263",
    "currentSha256": "e5f7aa243560e71abc887090b4f8e1b2918ad190575737f5e596025b9fd37d02"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "previousSha256": "05367a5372ae834063f6fce495b70d431553977c46efef28337921eb71525bde",
    "currentSha256": "e740cb5d3567c64788787ba1e0c5d7f09813ac3d4da06f7697eb35914a6d682e"
  },
  "scripts/verify-public-release-v86.mjs": {
    "previousSha256": "c5f3c645310d030cf6f4e9b89d5a6b4012f30b61d06fe3f3af9fcfb73582e9ae",
    "currentSha256": "c1b934fb956d2824dbe7142c0bd669ae151a70b3c9fd5131da6494df03a2fbfc"
  },
  "scripts/verify-tantalus-priorities-v188.mjs": {
    "previousSha256": "cc0bda305eec62e3577e72091d2b6b7ca38a71d238950698f614e88b6ae84fc8",
    "currentSha256": "9db65df87bdc2209e344234b0e58c7dff0a6af28640e7078c410e40d81f80326"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "previousSha256": "58eedf345dc2e98f1f4e67cba8558e1e5575d731b104c604c45f4a33bd8373b6",
    "currentSha256": "b0d5d001c823931e0342e8d486921d5cf23b278b6443dc98711adab4437fc9dc"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "previousSha256": "bba7d655e9b21a5fdba4d59d89442b358dfe485047c00c9d2f03184886cf9f4d",
    "currentSha256": "2a2d2f1801900a773c0c21925080380b29f9a74d95c2bb2f931e6284c09ef3f1"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "previousSha256": "c44b244ba3bacb7657b7023e4ed97bfe4afa4aa9edcdefd21a6c99707c2c30e2",
    "currentSha256": "780af992f2222106c0867c7c7f974a1e2d6695ddd053a16f622d6a971abee206"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "previousSha256": "3b4a88a92b59daa19b7e8fb377f6b236904a94bf9ac107c4603c57dcf28eb522",
    "currentSha256": "b56aa0d9094f588afad6d52a5ee0f582f6e23ecbc2bf44551d3581871a98ba3e"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "previousSha256": "273fffa43b99557eb5a08264697f4cce63ab3f85e7597ea1dbe85f0c4634eab8",
    "currentSha256": "1ab0cdc65554d54fdf3165fa5a4be63087b4e52eacf6a8f73a6ef75b9d9bb0b9"
  },
  "scripts/verify-xeno-priorities-audit-v201.mjs": {
    "previousSha256": "0b9cdf68d5c356f25e14a355f262a5c620292ca8a300193573b7d6bc9c35bc92",
    "currentSha256": "63df393aba051b2910b94bc5d00ae20f9c165e4ba1d276f7850aa5d0639f8774"
  },
  "scripts/verify-xeno-priorities-audit-v202.mjs": {
    "previousSha256": "23f218a916011b7d49cbc4d889f604b37ecadb713dea70d00e7cf9d4d7e8fdc0",
    "currentSha256": "3a6dfd03728650fab071fa1fe2e69e114a2994597bc555c13abc4abc025b751a"
  },
  "scripts/verify-xeno-priorities-audit-v203.mjs": {
    "previousSha256": "b39b36e1132d8d4e7f46cbcba9a44f0b99fc26b1d07eab42f37d8de58f180e91",
    "currentSha256": "90c48d3b02c499b2fb77a03f0d4395fb7da11a1e7b9650e8ba8d128ac10947c8"
  },
  "scripts/verify-xeno-priorities-audit-v204.mjs": {
    "previousSha256": "83d234514adf5adf9ea5fdc8f320b113df9a06c62ea1f2b91a027fc5a0f1cd25",
    "currentSha256": "ab82a6c40648667320cbeaf18c278c3fcf1dbe8d3263b771c649e35d168ecb0f"
  },
  "scripts/verify-xeno-production-assets-v206.mjs": {
    "previousSha256": "5f231063b6a88420cfbacd170ad447da254e14ff18badd7771d89141afab07cb",
    "currentSha256": "07e72057b4fa136582c732457660b505b5080d0fa47bf29b51f685449a0dc18b"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "previousSha256": "2ea616dd3c765de747b47d62bec31cdd4a8bf8d1e0be1d78920814a312263a4f",
    "currentSha256": "097cc6ebc6d7be2fc279dc6e1bc637a7a69741e1d8da1a215524b3bf9dbd02a2"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "previousSha256": "feafbe3d8222bb236fa73be5987b7032ab26b14979e849254d6b391509d7a29c",
    "currentSha256": "200d24defa8d3170409ffdf9446c36a53b08bd8eb169676f2c9060e1b42fbc52"
  },
  "scripts/verify-xeno-supers-audit-v200.mjs": {
    "previousSha256": "66c6615e1b4ca620c778069af509b54402cfe2a0a0f85083615b7d3f2ea88a6d",
    "currentSha256": "83a42098e057b2f4876b6d34c6fec5accfb837f02c7963aa92a34ea1e4770fa9"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "previousSha256": "01430d9b819378a9d41d90771b3a6b00207ae01fa9f2c8be69768b0e51f7e008",
    "currentSha256": "b48b5b28ee07b2a13f826c33888a2a2a2b3bd8108c16ea53547406e611e10c51"
  },
  "scripts/verify-xeno-visual-assets-audit-v205.mjs": {
    "previousSha256": "ad5605b10105f185fd495929ffe7e674ea67cc178bae9a9d49d622b0732f4bd2",
    "currentSha256": "14bc9676a34f9e55cf4ef1336d2f075095bc249e242bb8072cf3a0758c82eda1"
  },
  "src/app.js": {
    "previousSha256": "da0588f8b64d8a1afd8f2e5ac3871cdc17336369fd87a743a1d9ae807b664798",
    "currentSha256": "eb53b851ccfb8b92016bff9107e23cac03e85a124b3d6a3849a402119fae5f0a"
  },
  "src/title-screen-v61.js": {
    "previousSha256": "e0c10ca738df12c78b48a24d79cb049aea2ac3e1c08ec270d3eed750fe267342",
    "currentSha256": "9f198a6cf6ee98ce3a5c2bbad7e41511a4d22bc65a18ccb4e07fa6e215e9a841"
  },
  "sw.js": {
    "previousSha256": "31a06e95264d7280f823c1a78d6cebacb67260ea5468e8466e4bb2cbe0e916a5",
    "currentSha256": "e1e4c773e2d6e15b9f4bc5c23b4d0a929d30407a505198221c2746b517366847"
  }
}).map(([path, receipt]) => [path, Object.freeze(receipt)])
));

// Fiorina landed independently while AVP was under review. These parents and
// input digests identify that exact join; neither branch lends it test evidence.
export const AVP_FIORINA_JOIN_BASELINES_20261125 = Object.freeze({
  avpCommit: 'ed323c37811e832604d1790b48c6d602a0b0b296',
  fiorinaCommit: '38a4a2272ec48a9cd5011f8a0055caaca6ab0774',
  commonCommit: AVP_HOST_BASELINE_20261125
});
export const AVP_FIORINA_INCOMING_SOURCES_20261125 = Object.freeze(
{
  "index.html": "fd922482b74ee0ff7d411a19b6c0b5c47993ceb5c8a912948e14c6bb9a86c119",
  "package.json": "b122d57377c72d4391baa992918c0b2762362f9bcc5cf1328b30e2f45bcaac23",
  "scripts/verify-public-release-v86.mjs": "8f6650607da911c3d69893d361236c20107611c749f49cce599d460d1e67d8ea",
  "src/app.js": "3419d730cc5988bfe30834a9e261567d84186c99f0a53eef513568bd820f01b5",
  "sw.js": "7e868ce49b89a29380bb6d83988b24a31c8443a09ac898efb3131e0f6db3d071",
  "src/content.js": "48376e6a33ef8fc6e71297df60723fa40724c12958b606b90fd7373715c08197",
  "src/game-production-runtime.js": "e367fbb70e195c28194d0ee88fdeb8558ec4a7a4efc103b5bd1a0be45cd92f27",
  "src/special-operations-v131.js": "b7cd05a89ca5aa86b3c46244234cb197e6c0044437ba65c038b8bfc3c8827391"
}
);
// BEGIN FIORINA JOIN RECEIPTS
export const AVP_FIORINA_JOIN_SUCCESSORS_20261125 = Object.freeze(Object.fromEntries(
  Object.entries(
{
  "index.html": {
    "previousSha256": "bcef383f942f6b7d113f8fe6afb85d157cbde3867b5de45d8fc1bb2147f9b492",
    "currentSha256": "41a0c2dce43e650e598d188ee655d5bd591c4e353a45a439480d4b6222dbf0d3"
  },
  "package.json": {
    "previousSha256": "9d44e3a248a1084305772e4d2cdbf5963200f1c37b1940fd9a15c57c26b23914",
    "currentSha256": "2312a3808228b5cfebb32b8903b910498ac1af6d734c4f6da2081476cd989729"
  },
  "scripts/audit-tantalus-priorities-v188.mjs": {
    "previousSha256": "1fc91c75bac707ab286533aad8410e8109b81a2ad951adb08a22bf108dff4d91",
    "currentSha256": "ebebe904c2093a30310eed8df035f7babd89dca914b07695260584ea2713bf61"
  },
  "scripts/verify-act5-endings-v188.mjs": {
    "previousSha256": "88dd846ac4a5cab51d9563ab6a31b434d96f678603644355b864798876e77214",
    "currentSha256": "2a0ee1020aa1f52e0fe6c115a81ffba2f8b5483142ffa5e7a998bf7c8677e24a"
  },
  "scripts/verify-audit-v143.mjs": {
    "previousSha256": "efd454272d2a8e251a8e6b2a7a82f9894eee47b3923a9a027bacb18a8a0202e4",
    "currentSha256": "4b15eb3268e935e3043879430487971e22460de9cbd1ff705284e9d0e3c51d72"
  },
  "scripts/verify-black-cocoon-presentation-v158.mjs": {
    "previousSha256": "cb52f555918b941d0eed87a3e4b10fcfdab8563536e47187b8b42dad3db6e930",
    "currentSha256": "5c8363b00e2f32f3e53790a8c4eb8f271bc41a5acfbb25b637d5ce28e6da61cb"
  },
  "scripts/verify-colony-crew-v188.mjs": {
    "previousSha256": "912fdacd502be953cae671169f4917788d078a45106f07a649917d363d3e220f",
    "currentSha256": "6fbb3400b921376861a899ad099d1d29ffcbad2f32cceb24ff9b629396a8a9b9"
  },
  "scripts/verify-public-release-v86.mjs": {
    "previousSha256": "c1b934fb956d2824dbe7142c0bd669ae151a70b3c9fd5131da6494df03a2fbfc",
    "currentSha256": "11c7fd32d4948c9e3ad25505f4bba519f92bcf005e994120330b6be566e56209"
  },
  "scripts/verify-tantalus-priorities-v188.mjs": {
    "previousSha256": "9db65df87bdc2209e344234b0e58c7dff0a6af28640e7078c410e40d81f80326",
    "currentSha256": "c0a120981e36141b191d3c960583345fbe0424421ecbb6c8c2919ba4f4a1ee63"
  },
  "scripts/verify-xeno-arbiter-campaign-v190.mjs": {
    "previousSha256": "781a07800a322dde2c3bfd8cc07f98c013ad84be9fa3d9e06e15bdb504faa7f3",
    "currentSha256": "c5ca9d04eaf51570faef51e13ff94c2baa05ecfbf1752d0d9fb35f7ae02f3833"
  },
  "src/app.js": {
    "previousSha256": "eb53b851ccfb8b92016bff9107e23cac03e85a124b3d6a3849a402119fae5f0a",
    "currentSha256": "8723cae344d9f121137d64b24cb55552679624b37795a171c213069162edc254"
  },
  "src/content.js": {
    "previousSha256": "05844898c856f7142195a9abde62b99af25f1764f3d07e1803c90a9a1f833907",
    "currentSha256": "48376e6a33ef8fc6e71297df60723fa40724c12958b606b90fd7373715c08197"
  },
  "src/game-production-runtime.js": {
    "previousSha256": "c82536440c96ef5c08a683c34949d70644a347c1b3b1e9e03be20bad64f91658",
    "currentSha256": "e367fbb70e195c28194d0ee88fdeb8558ec4a7a4efc103b5bd1a0be45cd92f27"
  },
  "src/special-operations-v131.js": {
    "previousSha256": "433ddc7b821c98b973c10fc9e3aa39bc66c77e8cf9364dd9f1a25d03b70b08af",
    "currentSha256": "b7cd05a89ca5aa86b3c46244234cb197e6c0044437ba65c038b8bfc3c8827391"
  },
  "sw.js": {
    "previousSha256": "e1e4c773e2d6e15b9f4bc5c23b4d0a929d30407a505198221c2746b517366847",
    "currentSha256": "550d2ceab79ae17a97d5b5790a82f033307fdc057034103eb071f661da9c8c1a"
  }
}
  ).map(([path, receipt]) => [path, Object.freeze(receipt)])
));
// END FIORINA JOIN RECEIPTS

function advanceReceipt(path, endpoint, receipts, message) {
  if (!Object.hasOwn(receipts, path)) return endpoint;
  const receipt = receipts[path];
  assert.equal(endpoint, receipt.previousSha256, message + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid host source digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'A host successor must identify changed bytes: ' + path);
  return receipt.currentSha256;
}

export function reviewedAvpHostDigest20261125(path, endpoint) {
  const avp = advanceReceipt(path, endpoint, AVP_HOST_SUCCESSORS_20261125,
    'Broken merged-Tantalus-to-AVP host source chain: ');
  return advanceReceipt(path, avp, AVP_FIORINA_JOIN_SUCCESSORS_20261125,
    'Broken AVP-to-Fiorina host source chain: ');
}

const hostPaths = () => [...new Set([...Object.keys(AVP_HOST_SUCCESSORS_20261125),
  ...Object.keys(AVP_FIORINA_JOIN_SUCCESSORS_20261125)])];

// The runtime view can originate before AVP, at its published endpoint or at the
// exact joined endpoint. No other digest or independent incoming branch is valid.
export function avpHostRuntimeSources20261125(view) {
  const result = { ...view };
  for (const path of hostPaths()) {
    if (!Object.hasOwn(result, path)) continue;
    const avp = AVP_HOST_SUCCESSORS_20261125[path];
    const join = AVP_FIORINA_JOIN_SUCCESSORS_20261125[path];
    const current = join?.currentSha256 || avp.currentSha256;
    if (result[path] === current) continue;
    if (avp && result[path] === avp.previousSha256)
      result[path] = reviewedAvpHostDigest20261125(path, result[path]);
    else if (join && result[path] === join.previousSha256)
      result[path] = advanceReceipt(path, result[path], AVP_FIORINA_JOIN_SUCCESSORS_20261125,
        'Incorrect AVP host runtime view predecessor: ');
    else assert.fail('Incorrect AVP host runtime view predecessor: ' + path);
  }
  return Object.freeze(result);
}

export function verifyAvpHostSources20261125(readSource = readRepository) {
  assert.match(AVP_HOST_BASELINE_20261125, /^[a-f0-9]{40}$/, 'AVP requires its exact reviewed merged baseline');
  assert.equal(AVP_FIORINA_JOIN_BASELINES_20261125.commonCommit, AVP_HOST_BASELINE_20261125);
  for (const commit of Object.values(AVP_FIORINA_JOIN_BASELINES_20261125)) assert.match(commit, /^[a-f0-9]{40}$/);
  for (const receipts of [AVP_HOST_SUCCESSORS_20261125, AVP_FIORINA_JOIN_SUCCESSORS_20261125]) {
    assert.equal(Object.hasOwn(receipts, ownPath), false, 'The AVP terminal cannot admit its own bytes');
    for (const [path, receipt] of Object.entries(receipts)) {
      assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(segment => !segment || segment === '.' || segment === '..'), 'Invalid AVP host source path: ' + path);
      assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
      assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid host source digest: ' + path);
      assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'A host successor must identify changed bytes: ' + path);
    }
  }
  for (const [path, receipt] of Object.entries(AVP_FIORINA_JOIN_SUCCESSORS_20261125)) {
    if (Object.hasOwn(AVP_HOST_SUCCESSORS_20261125, path))
      assert.equal(receipt.previousSha256, AVP_HOST_SUCCESSORS_20261125[path].currentSha256,
        'Fiorina must follow the exact published AVP receipt: ' + path);
  }
  for (const [path, digest] of Object.entries(AVP_FIORINA_INCOMING_SOURCES_20261125)) {
    assert.ok(validHash(digest) && Object.hasOwn(AVP_FIORINA_JOIN_SUCCESSORS_20261125, path),
      'Missing reviewed Fiorina input: ' + path);
    assert.notEqual(digest, AVP_FIORINA_JOIN_SUCCESSORS_20261125[path].previousSha256,
      'A reviewed Fiorina input must identify an actual branch change: ' + path);
  }
  const paths = hostPaths();
  for (const path of paths) {
    const seed = (AVP_HOST_SUCCESSORS_20261125[path] || AVP_FIORINA_JOIN_SUCCESSORS_20261125[path]).previousSha256;
    assert.equal(sha(readSource(path)), reviewedAvpHostDigest20261125(path, seed), 'Unreviewed AVP host source bytes: ' + path);
  }
  return Object.freeze({ baselineCommit: AVP_HOST_BASELINE_20261125, successors: paths.length,
    joinedSuccessors: Object.keys(AVP_FIORINA_JOIN_SUCCESSORS_20261125).length, historicalEvidenceTransferred: false });
}
