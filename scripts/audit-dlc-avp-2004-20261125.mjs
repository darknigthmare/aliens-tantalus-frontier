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

// The complete-media run of the incoming branch exposed only these additional
// translation/fixture continuations. The published 28 AVP and 15 join receipts
// remain immutable; this stage starts at the exact combined commit.
export const AVP_FIORINA_QA_BASELINE_20261125 = 'd61077b3d71dc75d5268d62eb44373f4c8fe4bf4';
// BEGIN FIORINA QA RECEIPTS
export const AVP_FIORINA_QA_SUCCESSORS_20261125 = Object.freeze(Object.fromEntries(
  Object.entries({
  "scripts/i18n-tantalus-xeno-merge-v188.mjs": {
    "previousSha256": "d695ea1baf44c11741ea13c3ba68e3e4513fb19da2498f0cd339cd20878fca37",
    "currentSha256": "0847730b37a1c658d686deee4d678e995577db8a547d3782a0a6024c0e4cc78b"
  },
  "scripts/verify-bugfix-texts-v188.mjs": {
    "previousSha256": "5bbe708480dd47281fbd99f3a38867544744d35deeb911d800c3465dcee0ac87",
    "currentSha256": "7052e4a38e779171aacb38269ce9c5b8012e2bdb18919fb07e0aae1bc49c9e85"
  },
  "scripts/verify-campaign-lethe-v163.mjs": {
    "previousSha256": "e46391c24e1a4cbda36560a96f2908966feb8f6fa4c0ba91545b587648ee71a2",
    "currentSha256": "0c3b7137b88e47dd7bea63fac4b036e01222825ee14c968f484e2d9d5cf74128"
  },
  "scripts/verify-campaign-story-v160.mjs": {
    "previousSha256": "e4daf40c32350565282c09a4cde2f1e50bc34e144f508ef0f12f9c512699aaf4",
    "currentSha256": "67d20a74baeb2cbd1191ae13b4c9e19251a95192fd20ca0a234f5d74b4caf633"
  },
  "scripts/verify-insertion-cinematic-v188.mjs": {
    "previousSha256": "b150ff21f8799a1192d63c25d471cf4647f9a3014880da2ca858e681ddb9fec4",
    "currentSha256": "826d09e4d4ed2074dd36f68df0836ddaac5e89132e7501b8b4e3081944233de0"
  },
  "scripts/verify-m577-everywhere-v188.mjs": {
    "previousSha256": "a17246917522a7346e985e995ced272809a5a9f27308e781c8840416ce0656f8",
    "currentSha256": "7a6a2a17655dfe797155e6a39cf0311243842a7c9a29bf094fdf51961eab8c5b"
  },
  "src/i18n-en-catalog-v185.js": {
    "previousSha256": "f503f6e7edbbbb4ea3acd0f583c1c102bc54e10fa829d4e1fb089bf32825d763",
    "currentSha256": "dc88d2ff0d09e81aebf9a8c90674aa37139a08ba45aa2abc75360ca369108096"
  }
}).map(([path, receipt]) => [path, Object.freeze(receipt)])
));
// END FIORINA QA RECEIPTS

// BEGIN ALIENS MERGE RECEIPTS
// Both published branches remain immutable. These exact successors join AVP's
// reviewed endpoint and the incoming Aliens endpoint at the same current bytes.
export const AVP_ALIENS_JOIN_BASELINES_20261125 = Object.freeze({
  avpCommit: '1290733d51b6be5d075ab8bbc3eb9e87d684e8f4',
  aliensCommit: 'eb4a3107b3abe073acc536ab453be3b98ecb6685',
  commonCommit: '38a4a2272ec48a9cd5011f8a0055caaca6ab0774'
});
export const AVP_ALIENS_INCOMING_SOURCES_20261125 = Object.freeze({
  "index.html": "3cb5d844b1d7ea2726c8af2cb95b49f4515c0bf9322eca90cb4f241d219409a3",
  "package.json": "dd592ca645bc15842d45ab48f30c83a1337039f96982fb40916eaa7c47bd8c0b",
  "scripts/build.mjs": "e3dbf1e40e79b18bebf4d987329044cc06ee546471a70d054b75ce3a492ac3cf",
  "scripts/build-dev-tools-v188.mjs": "73c7963635cfadc00bf2819df2ba6282d8a299025efb767cc8fc8bd28c8c2afa",
  "scripts/verify-public-release-v86.mjs": "c72a3d56d3f83b8b19f321be5dc8b7d7b3423f0e391194d4c4e000f6c2d7bcbc",
  "src/title-screen-v61.js": "0f369985fe5f48f11b03a6711ba7accf2689f1d2ce68f43b6ed52b46c013cdf7",
  "scripts/verify-tantalus-priorities-v188.mjs": "0a9258c24914535d0aea43da726d8250a7ff63645860535b35c1835b94cfe737",
  "scripts/verify-native-qa-resources-v187.mjs": "3e66e7ad4c4475632a2f216ee8efcb940f1bc2127b8e6efa2b09056f45a25734",
  "scripts/verify-audit-continuation-v157.mjs": "a064c967dbd77143d24dbdab24134a0174cefaec30ac23efd42d4b9399afe15d",
  "scripts/verify-audit-continuation-v158.mjs": "8181ebe5a7dbf226d09ce1ffa27e61ba7571dbc80da100ceecf8099df870e5db",
  "scripts/verify-black-cocoon-presentation-v158.mjs": "2a84cef425228efbb08185a9886dd8be0aa11667804d22ce438d17f95d603290",
  "scripts/verify-audit-v143.mjs": "e48029ce56f17da26b437ea4d2dbe2a4845bd45f57d454da1d12b1c9c5d51805",
  "scripts/verify-colony-crew-v188.mjs": "07ca934406c79277efa9b231aa7ded7b2b1d996b760a3695506584c8f38cdf0b",
  "scripts/verify-act5-endings-v188.mjs": "3f24ce7b499bc15f67cab2ae8b4763c1e46b66712cd864bdbab7596ffbfc1918",
  "scripts/verify-xeno-arbiter-campaign-v190.mjs": "5bd55a456bf914f5b79d1c5fca0bac35a3a70083fd99e5415174fac3babac89a",
  "src/i18n-en-catalog-v185.js": "387b5b5a5e4461044cc24ecfaa5fb2f451b69bac3493b11099609c19b901b9d2",
  "src/app.js": "3419d730cc5988bfe30834a9e261567d84186c99f0a53eef513568bd820f01b5",
  "src/content.js": "48376e6a33ef8fc6e71297df60723fa40724c12958b606b90fd7373715c08197",
  "src/game-production-runtime.js": "e367fbb70e195c28194d0ee88fdeb8558ec4a7a4efc103b5bd1a0be45cd92f27",
  "src/special-operations-v131.js": "b7cd05a89ca5aa86b3c46244234cb197e6c0044437ba65c038b8bfc3c8827391",
  "sw.js": "7e868ce49b89a29380bb6d83988b24a31c8443a09ac898efb3131e0f6db3d071",
  "scripts/audit-tantalus-priorities-v188.mjs": "2ed1add52188a55ae3a03fa776b0297a04efdd775533f83436d5821cd00d533a",
  "scripts/audit-xeno-production-assets-v206.mjs": "db2e2f14fd702f2342a683c6b96d5ef584a3dd5dfa91a54eb2e83a306bf134f9"
});
export const AVP_ALIENS_JOIN_SUCCESSORS_20261125 = Object.freeze(Object.fromEntries(
  Object.entries({
  "index.html": {
    "previousSha256": "41a0c2dce43e650e598d188ee655d5bd591c4e353a45a439480d4b6222dbf0d3",
    "currentSha256": "8e6ef33ebd2e2ef5e7ce57e617d73c7de602ae4bb911fa81e328d4b2adac27a0"
  },
  "package.json": {
    "previousSha256": "2312a3808228b5cfebb32b8903b910498ac1af6d734c4f6da2081476cd989729",
    "currentSha256": "24f6777c878017c84d1c72f4cee6a26d160de26323b659094d4f49a79e887da3"
  },
  "scripts/audit-tantalus-priorities-v188.mjs": {
    "previousSha256": "ebebe904c2093a30310eed8df035f7babd89dca914b07695260584ea2713bf61",
    "currentSha256": "eee650275a769b271d0da34c13d13ecbb0178bcfe9e0af66b184b8a3e23f82a8"
  },
  "scripts/audit-xeno-production-assets-v206.mjs": {
    "previousSha256": "9cce60b8ee74d60e8f525e7117885409455f0cdbc5e34ee745e45eb8cd48d48e",
    "currentSha256": "a5364fa87e5dd2d8139f578a5b635e8af05ec866154bd082502fbedb2aabe4ae"
  },
  "scripts/build-dev-tools-v188.mjs": {
    "previousSha256": "888e76d1aa2a206c71696e69f58373197b8f7fff7179581b53f4dd5ea4fe94a2",
    "currentSha256": "73c7963635cfadc00bf2819df2ba6282d8a299025efb767cc8fc8bd28c8c2afa"
  },
  "scripts/build.mjs": {
    "previousSha256": "c941cd1ffeb251289f1c89b7bae3f893cf87263a5beba1613a9f1c4a427bff42",
    "currentSha256": "7332934b66a46995dcda3f5a51753f32b4743b17fd30a3e38e611bad2088bc12"
  },
  "scripts/verify-act5-endings-v188.mjs": {
    "previousSha256": "2a0ee1020aa1f52e0fe6c115a81ffba2f8b5483142ffa5e7a998bf7c8677e24a",
    "currentSha256": "3f24ce7b499bc15f67cab2ae8b4763c1e46b66712cd864bdbab7596ffbfc1918"
  },
  "scripts/verify-audit-continuation-v157.mjs": {
    "previousSha256": "73cf9f322340a7d4e68e58bb772f74e6b9e54d14383b4fb72f8bf299ad0d3d8a",
    "currentSha256": "a064c967dbd77143d24dbdab24134a0174cefaec30ac23efd42d4b9399afe15d"
  },
  "scripts/verify-audit-continuation-v158.mjs": {
    "previousSha256": "09977386675167a50d8e399532c948c344d753237ca50383d93bb5cda112fc68",
    "currentSha256": "8181ebe5a7dbf226d09ce1ffa27e61ba7571dbc80da100ceecf8099df870e5db"
  },
  "scripts/verify-audit-v143.mjs": {
    "previousSha256": "4b15eb3268e935e3043879430487971e22460de9cbd1ff705284e9d0e3c51d72",
    "currentSha256": "e48029ce56f17da26b437ea4d2dbe2a4845bd45f57d454da1d12b1c9c5d51805"
  },
  "scripts/verify-black-cocoon-presentation-v158.mjs": {
    "previousSha256": "5c8363b00e2f32f3e53790a8c4eb8f271bc41a5acfbb25b637d5ce28e6da61cb",
    "currentSha256": "2a84cef425228efbb08185a9886dd8be0aa11667804d22ce438d17f95d603290"
  },
  "scripts/verify-colony-crew-v188.mjs": {
    "previousSha256": "6fbb3400b921376861a899ad099d1d29ffcbad2f32cceb24ff9b629396a8a9b9",
    "currentSha256": "07ca934406c79277efa9b231aa7ded7b2b1d996b760a3695506584c8f38cdf0b"
  },
  "scripts/verify-public-release-v86.mjs": {
    "previousSha256": "11c7fd32d4948c9e3ad25505f4bba519f92bcf005e994120330b6be566e56209",
    "currentSha256": "b6a0bbe5637d6b613a05716ce8a0d1a17a45b5f40545da1eba280a953f6b2990"
  },
  "scripts/verify-tantalus-priorities-v188.mjs": {
    "previousSha256": "c0a120981e36141b191d3c960583345fbe0424421ecbb6c8c2919ba4f4a1ee63",
    "currentSha256": "97590d68b595a1a7f5519f386e91ceae39fcef87dcc7087006ed7955dd0ff5a3"
  },
  "scripts/verify-xeno-arbiter-campaign-v190.mjs": {
    "previousSha256": "c5ca9d04eaf51570faef51e13ff94c2baa05ecfbf1752d0d9fb35f7ae02f3833",
    "currentSha256": "5bd55a456bf914f5b79d1c5fca0bac35a3a70083fd99e5415174fac3babac89a"
  },
  "src/app.js": {
    "previousSha256": "8723cae344d9f121137d64b24cb55552679624b37795a171c213069162edc254",
    "currentSha256": "e3b968211e54bd08eed24b828780a7da0342bc3900541869d7ffb1face1af789"
  },
  "src/title-screen-v61.js": {
    "previousSha256": "9f198a6cf6ee98ce3a5c2bbad7e41511a4d22bc65a18ccb4e07fa6e215e9a841",
    "currentSha256": "c74ff44944d88cc95fb7fa1fabb39de24a309066097448688557e7ddb53b390c"
  }
}).map(([path, receipt]) => [path, Object.freeze(receipt)])
));
export const ALIENS_AVP_JOIN_SUCCESSORS_20261125 = Object.freeze(Object.fromEntries(
  Object.entries({
  "index.html": {
    "previousSha256": "3cb5d844b1d7ea2726c8af2cb95b49f4515c0bf9322eca90cb4f241d219409a3",
    "currentSha256": "8e6ef33ebd2e2ef5e7ce57e617d73c7de602ae4bb911fa81e328d4b2adac27a0"
  },
  "package.json": {
    "previousSha256": "dd592ca645bc15842d45ab48f30c83a1337039f96982fb40916eaa7c47bd8c0b",
    "currentSha256": "24f6777c878017c84d1c72f4cee6a26d160de26323b659094d4f49a79e887da3"
  },
  "scripts/audit-tantalus-priorities-v188.mjs": {
    "previousSha256": "2ed1add52188a55ae3a03fa776b0297a04efdd775533f83436d5821cd00d533a",
    "currentSha256": "eee650275a769b271d0da34c13d13ecbb0178bcfe9e0af66b184b8a3e23f82a8"
  },
  "scripts/audit-xeno-production-assets-v206.mjs": {
    "previousSha256": "db2e2f14fd702f2342a683c6b96d5ef584a3dd5dfa91a54eb2e83a306bf134f9",
    "currentSha256": "a5364fa87e5dd2d8139f578a5b635e8af05ec866154bd082502fbedb2aabe4ae"
  },
  "scripts/build.mjs": {
    "previousSha256": "e3dbf1e40e79b18bebf4d987329044cc06ee546471a70d054b75ce3a492ac3cf",
    "currentSha256": "7332934b66a46995dcda3f5a51753f32b4743b17fd30a3e38e611bad2088bc12"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "previousSha256": "3e66e7ad4c4475632a2f216ee8efcb940f1bc2127b8e6efa2b09056f45a25734",
    "currentSha256": "e740cb5d3567c64788787ba1e0c5d7f09813ac3d4da06f7697eb35914a6d682e"
  },
  "scripts/verify-public-release-v86.mjs": {
    "previousSha256": "c72a3d56d3f83b8b19f321be5dc8b7d7b3423f0e391194d4c4e000f6c2d7bcbc",
    "currentSha256": "b6a0bbe5637d6b613a05716ce8a0d1a17a45b5f40545da1eba280a953f6b2990"
  },
  "scripts/verify-tantalus-priorities-v188.mjs": {
    "previousSha256": "0a9258c24914535d0aea43da726d8250a7ff63645860535b35c1835b94cfe737",
    "currentSha256": "97590d68b595a1a7f5519f386e91ceae39fcef87dcc7087006ed7955dd0ff5a3"
  },
  "src/app.js": {
    "previousSha256": "3419d730cc5988bfe30834a9e261567d84186c99f0a53eef513568bd820f01b5",
    "currentSha256": "e3b968211e54bd08eed24b828780a7da0342bc3900541869d7ffb1face1af789"
  },
  "src/i18n-en-catalog-v185.js": {
    "previousSha256": "387b5b5a5e4461044cc24ecfaa5fb2f451b69bac3493b11099609c19b901b9d2",
    "currentSha256": "dc88d2ff0d09e81aebf9a8c90674aa37139a08ba45aa2abc75360ca369108096"
  },
  "src/title-screen-v61.js": {
    "previousSha256": "0f369985fe5f48f11b03a6711ba7accf2689f1d2ce68f43b6ed52b46c013cdf7",
    "currentSha256": "c74ff44944d88cc95fb7fa1fabb39de24a309066097448688557e7ddb53b390c"
  },
  "sw.js": {
    "previousSha256": "7e868ce49b89a29380bb6d83988b24a31c8443a09ac898efb3131e0f6db3d071",
    "currentSha256": "550d2ceab79ae17a97d5b5790a82f033307fdc057034103eb071f661da9c8c1a"
  }
}).map(([path, receipt]) => [path, Object.freeze(receipt)])
));
// END ALIENS MERGE RECEIPTS

// BEGIN FIORINA V115 SPRITE HOST RECEIPTS
// The published AVP/Aliens joins above remain byte-identical. This final stage
// admits only the nine reviewed host changes from the exact continuation base.
// It does not transfer any earlier CI, browser or film-fidelity result.
export const AVP_FIORINA_SPRITES_BASELINE_20261125 = 'b89dc6ba47ee1ca90de29f3ccff47ddfe699d2d9';
export const AVP_FIORINA_SPRITES_SUCCESSORS_20261125 = Object.freeze(Object.fromEntries(
  Object.entries({
  ".github/workflows/fiorina-native-v114.yml": {
    "previousSha256": "d6f8329d2711ae1ce146e0a6af68bae3d4af2c9234abe792c4b46c55b42f72ce",
    "currentSha256": "78a66ea9e928383dee07a54e890f67ac355317665d8dd93b49b80c943b491a36"
  },
  "package.json": {
    "previousSha256": "24f6777c878017c84d1c72f4cee6a26d160de26323b659094d4f49a79e887da3",
    "currentSha256": "f1255982d1e7527ee751e54bc84da66cc34c3633e43a17f9cde5b99ad64eda76"
  },
  "scripts/build-asset-filter.mjs": {
    "previousSha256": "384b67baf7303dd12f74e90836510fd2a884068a18ceaf96cc89412a0ce50073",
    "currentSha256": "c49bbc4bf3598a633f78c98febff0309e54b367e5643e4a98daf0371d9b91a56"
  },
  "scripts/build.mjs": {
    "previousSha256": "7332934b66a46995dcda3f5a51753f32b4743b17fd30a3e38e611bad2088bc12",
    "currentSha256": "83cf0a94b7001c2f4e3408ecf4432095564ac95d1321d4dbaf9e0cbd898f178b"
  },
  "scripts/qa-fiorina-native-v114.mjs": {
    "previousSha256": "2814e9eacac551df6f4303953c6172f2d3cca1c77214bc2056380529f45250c5",
    "currentSha256": "e8d32bf4763b6fc04f10a080ab806d347f00af857a06f7af8216e6ea8ab8f6a6"
  },
  "scripts/verify-audit-v143.mjs": {
    "previousSha256": "e48029ce56f17da26b437ea4d2dbe2a4845bd45f57d454da1d12b1c9c5d51805",
    "currentSha256": "cefca33dc3843db3bf99b640f5df2e5722b9a81e260f1bdcb7cbf552a7289ddf"
  },
  "scripts/verify-public-release-v86.mjs": {
    "previousSha256": "b6a0bbe5637d6b613a05716ce8a0d1a17a45b5f40545da1eba280a953f6b2990",
    "currentSha256": "6c42dac3d674ebbfb07a3bb5953faa76d5d246f10b889b793d9d916031efcf3f"
  },
  "src/game-production-runtime.js": {
    "previousSha256": "e367fbb70e195c28194d0ee88fdeb8558ec4a7a4efc103b5bd1a0be45cd92f27",
    "currentSha256": "d8e3ac6670b951450ee375cf982bef5d43493a43e89d604666af41914dd64766"
  },
  "sw.js": {
    "previousSha256": "550d2ceab79ae17a97d5b5790a82f033307fdc057034103eb071f661da9c8c1a",
    "currentSha256": "8c65d9aa6deb691d3737cb36ed4f26d8fb99c6d37f01f52ea2879a2ee0dd40ad"
  }
}).map(([path, receipt]) => [path, Object.freeze(receipt)])
));
// END FIORINA V115 SPRITE HOST RECEIPTS

// BEGIN FIORINA V116 HOST RECEIPTS
// Four changed host sources follow the merged V115 continuation exactly. The
// V115 receipt block above remains immutable; it contributes no new test result.
export const AVP_FIORINA_V116_BASELINE_20261125 = 'ae4e49bef5fea639d0c381466aefea85f8a57300';
export const AVP_FIORINA_V116_SUCCESSORS_20261125 = Object.freeze(Object.fromEntries(
  Object.entries({
  ".github/workflows/fiorina-native-v114.yml": {
    "previousSha256": "78a66ea9e928383dee07a54e890f67ac355317665d8dd93b49b80c943b491a36",
    "currentSha256": "3ff53274600e735df988b59ffd1f8ba011cb0cbada5a3a83cfe5679f45ddc47d"
  },
  "scripts/qa-fiorina-native-v114.mjs": {
    "previousSha256": "e8d32bf4763b6fc04f10a080ab806d347f00af857a06f7af8216e6ea8ab8f6a6",
    "currentSha256": "5bf5fb5c0dd04c72ef1e804f204a027fcfb25f2656a5d3ea973e338d06f58ead"
  },
  "scripts/verify-audit-v143.mjs": {
    "previousSha256": "cefca33dc3843db3bf99b640f5df2e5722b9a81e260f1bdcb7cbf552a7289ddf",
    "currentSha256": "2ceca7377c3b9bf11caf572369efa4b6ec4f8ec7a51a4358fe907e12c8d77882"
  },
  "sw.js": {
    "previousSha256": "8c65d9aa6deb691d3737cb36ed4f26d8fb99c6d37f01f52ea2879a2ee0dd40ad",
    "currentSha256": "03d20c98eeadc1ff223ca2a43efec81c9e38ad0bb85aef18c9412917783f1145"
  }
}).map(([path, receipt]) => [path, Object.freeze(receipt)])
));
// END FIORINA V116 HOST RECEIPTS

// BEGIN DLC BIBLE DOCUMENT HOST RECEIPTS 20261126
// Source-only paths follow the exact V116 baseline. Historical receipts and
// earlier QA remain unchanged; this stage grants no artistic or runtime approval.
export const AVP_DLC_BIBLE_DOCUMENTS_BASELINE_20261126 = 'b0df1877a058f0818f96437fdfdea3f21ba7f415';
export const AVP_DLC_BIBLE_DOCUMENTS_SUCCESSORS_20261126 = Object.freeze(Object.fromEntries(
  Object.entries({
  "scripts/verify-public-release-v86.mjs": {
    "previousSha256": "6c42dac3d674ebbfb07a3bb5953faa76d5d246f10b889b793d9d916031efcf3f",
    "currentSha256": "699e7e0234f0528ffe1e7be1b78b6d0130a5f7cb364ac1be1e670c1b625f7558"
  }
}).map(([path, receipt]) => [path, Object.freeze(receipt)])
));
// END DLC BIBLE DOCUMENT HOST RECEIPTS 20261126

// BEGIN DLC BIBLE BRIDGE HOST RECEIPTS 20261126
// PR 68 added the campaign-to-DLC index link without its source successor.
// Record that exact document change after the published document-admission stage.
// This source-only receipt changes no campaign content, game state or art status.
export const AVP_DLC_BIBLE_BRIDGE_BASELINE_20261126 = '16686e8681cc0370db3fa3df2967704ef1862155';
export const AVP_DLC_BIBLE_BRIDGE_SUCCESSORS_20261126 = Object.freeze(Object.fromEntries(
  Object.entries({
  "docs/narrative/CAMPAGNE_PRINCIPALE.md": {
    "previousSha256": "aa4681a3a1eec25fb8bb2ef4502fd0a0dbcffd10bb57a8092b3fbc559bfc51b2",
    "currentSha256": "0828b50f85fb83f3e10a831ceb0f8d5aa489e20a289007057758d03b836bfcf2"
  }
}).map(([path, receipt]) => [path, Object.freeze(receipt)])
));
// END DLC BIBLE BRIDGE HOST RECEIPTS 20261126

// BEGIN AVP PRODUCTION BIBLE HOST RECEIPTS 20261126
// A closed source-only production inventory follows the exact corrected bible head.
// Earlier receipts remain immutable; this stage grants no gameplay or art approval.
export const AVP_PRODUCTION_BIBLE_BASELINE_20261126 = '268b1a517c60338899578a165e9784c5b7313dba';
export const AVP_PRODUCTION_BIBLE_SUCCESSORS_20261126 = Object.freeze(Object.fromEntries(
  Object.entries({
  "scripts/verify-public-release-v86.mjs": {
    "previousSha256": "699e7e0234f0528ffe1e7be1b78b6d0130a5f7cb364ac1be1e670c1b625f7558",
    "currentSha256": "ee4324f23d1a4d3282f55490ea19222dcc9bcea096f4a38d3dce4c937b74916b"
  },
  "scripts/build-asset-filter.mjs": {
    "previousSha256": "c49bbc4bf3598a633f78c98febff0309e54b367e5643e4a98daf0371d9b91a56",
    "currentSha256": "5735cc0a8110342349313df1c70cba220308238ee756674a357f45aa98a4f8bd"
  }
}).map(([path, receipt]) => [path, Object.freeze(receipt)])
));
// END AVP PRODUCTION BIBLE HOST RECEIPTS 20261126

// BEGIN COVENANT V011 HOST RECEIPTS
// The published AVP, Aliens and Fiorina receipts above remain byte-identical.
// This final stage admits only six reviewed host edits after the exact V116
// branch parent. No prior CI, browser, gameplay or fidelity evidence transfers.
export const AVP_COVENANT_BASELINE_20261126 = 'b0df1877a058f0818f96437fdfdea3f21ba7f415';
export const AVP_COVENANT_SUCCESSORS_20261126 = Object.freeze(Object.fromEntries(
  Object.entries({
  "index.html": {
    "previousSha256": "8e6ef33ebd2e2ef5e7ce57e617d73c7de602ae4bb911fa81e328d4b2adac27a0",
    "currentSha256": "dd4f1fb7e5f749a566c816f50074aeb39c73b5dc10813da3276dacb40e0d61f7"
  },
  "package.json": {
    "previousSha256": "f1255982d1e7527ee751e54bc84da66cc34c3633e43a17f9cde5b99ad64eda76",
    "currentSha256": "ee46a793dcfed996d8177bf2141bf33e145fbfc22855d6776cf99e3c561439dc"
  },
  "scripts/build-asset-filter.mjs": {
    "previousSha256": "c49bbc4bf3598a633f78c98febff0309e54b367e5643e4a98daf0371d9b91a56",
    "currentSha256": "fb395cdf164bd61a553b6d65470b2a3336330c8cb8fec7d575c0f982cee03cdf"
  },
  "scripts/build.mjs": {
    "previousSha256": "83cf0a94b7001c2f4e3408ecf4432095564ac95d1321d4dbaf9e0cbd898f178b",
    "currentSha256": "893e645ce5ff0501463827596d8ee7203bc68df9aee4aa372126dcd9228f6054"
  },
  "scripts/verify-public-release-v86.mjs": {
    "previousSha256": "6c42dac3d674ebbfb07a3bb5953faa76d5d246f10b889b793d9d916031efcf3f",
    "currentSha256": "3533161ff393be0f7cee28dc281af70866ac9524a68016c6aac9fb83a8fe119a"
  },
  "src/title-screen-v61.js": {
    "previousSha256": "c74ff44944d88cc95fb7fa1fabb39de24a309066097448688557e7ddb53b390c",
    "currentSha256": "e42c89ca57f24e74366a06ee9c458c2c563b783d3533c7f92e9f710a0434807c"
  }
}).map(([path, receipt]) => [path, Object.freeze(receipt)])
));
// END COVENANT V011 HOST RECEIPTS

// BEGIN COVENANT V012 HOST RECEIPTS
// Only two source files advance from the exact published V011 head.
// Older receipts and their execution evidence remain unchanged.
export const AVP_COVENANT_V012_BASELINE_20261126 = 'aa6e3ccdecd54a5d20905e9d5cb6f9273cc27fa9';
export const AVP_COVENANT_V012_SUCCESSORS_20261126 = Object.freeze(Object.fromEntries(
  Object.entries({
    "scripts/qa-title-compositions-v163.py": {
      "previousSha256": "a5bb799726f884b82c6ea77577f1f0f5d925f6a45a052b8ac43bf1ae086d56f8",
      "currentSha256": "445a89180014a070ba7a99c43951f281b6b7763a6b5cf5817c18d1b99310771f"
    },
    "scripts/verify-public-release-v86.mjs": {
      "previousSha256": "3533161ff393be0f7cee28dc281af70866ac9524a68016c6aac9fb83a8fe119a",
      "currentSha256": "ecea88d7e829fa2072f5d3b3a0e0148401cf2b1fe6f53f98b7e0ab69f286d1c5"
    }
  }).map(([path, receipt]) => [path, Object.freeze(receipt)])
));
// END COVENANT V012 HOST RECEIPTS

// BEGIN COVENANT AND DLC BIBLES MERGE RECEIPTS 20261126
// Both published branches forked at V116. Preserve their independent receipts
// and admit only the three reviewed merged sources, without transferring QA.
export const COVENANT_DLC_BIBLE_MERGE_BASELINES_20261126 = Object.freeze({
  commonCommit: 'b0df1877a058f0818f96437fdfdea3f21ba7f415',
  covenantCommit: '9ee21033a71fc0f965ef270fa560d13eaa89d813',
  targetCommit: '2e8309081d206b86d9f234ebfc33c13ea74970f4'
});
export const COVENANT_DLC_BIBLE_MERGE_SOURCES_20261126 = Object.freeze(Object.fromEntries(
  Object.entries({
  "scripts/verify-public-release-v86.mjs": {
    "commonSha256": "6c42dac3d674ebbfb07a3bb5953faa76d5d246f10b889b793d9d916031efcf3f",
    "covenantSha256": "ecea88d7e829fa2072f5d3b3a0e0148401cf2b1fe6f53f98b7e0ab69f286d1c5",
    "targetSha256": "ee4324f23d1a4d3282f55490ea19222dcc9bcea096f4a38d3dce4c937b74916b",
    "currentSha256": "a1539aeab9240e04cae927d11a50a6c1dccfe36157ab487fb715539458f5158c"
  },
  "scripts/build-asset-filter.mjs": {
    "commonSha256": "c49bbc4bf3598a633f78c98febff0309e54b367e5643e4a98daf0371d9b91a56",
    "covenantSha256": "fb395cdf164bd61a553b6d65470b2a3336330c8cb8fec7d575c0f982cee03cdf",
    "targetSha256": "5735cc0a8110342349313df1c70cba220308238ee756674a357f45aa98a4f8bd",
    "currentSha256": "088d0ede8a8460c2b56329f3372e2b4c77d62b6b4a51d8dc65a16d2b180d2785"
  },
  "docs/narrative/CAMPAGNE_PRINCIPALE.md": {
    "commonSha256": "aa4681a3a1eec25fb8bb2ef4502fd0a0dbcffd10bb57a8092b3fbc559bfc51b2",
    "covenantSha256": "952270ba5a6841c54f89b3b1283d2842563e16d948152ec0de809b37ca9514e4",
    "targetSha256": "0828b50f85fb83f3e10a831ceb0f8d5aa489e20a289007057758d03b836bfcf2",
    "currentSha256": "7f318ee44a83d3cf0fd7a84b48aa94ae7d7a51d25253ae0c289a7e862a37a525"
  }
}).map(([path, receipt]) => [path, Object.freeze(receipt)])
));
// END COVENANT AND DLC BIBLES MERGE RECEIPTS 20261126

export function reviewedCovenantDlcBibleMergeDigest20261126(path, endpoint) {
  if (!Object.hasOwn(COVENANT_DLC_BIBLE_MERGE_SOURCES_20261126, path)) return endpoint;
  const receipt = COVENANT_DLC_BIBLE_MERGE_SOURCES_20261126[path];
  assert.ok(endpoint === receipt.covenantSha256 || endpoint === receipt.targetSha256,
    'Broken Covenant-and-DLC-bibles merge source chain: ' + path);
  return receipt.currentSha256;
}

export function reviewedCovenantV012HostDigest20261126(path, endpoint) {
  const published = advanceReceipt(path, endpoint, AVP_COVENANT_V012_SUCCESSORS_20261126,
    'Broken Covenant-V011-to-V012 host source chain: ');
  return Object.hasOwn(AVP_COVENANT_SUCCESSORS_20261126, path)
    || Object.hasOwn(AVP_COVENANT_V012_SUCCESSORS_20261126, path)
    ? reviewedCovenantDlcBibleMergeDigest20261126(path, published) : published;
}

export function reviewedCovenantHostDigest20261126(path, endpoint) {
  const published = advanceReceipt(path, endpoint, AVP_COVENANT_SUCCESSORS_20261126,
    'Broken published-host-to-Covenant source chain: ');
  return reviewedCovenantV012HostDigest20261126(path, published);
}

function advanceReceipt(path, endpoint, receipts, message) {
  if (!Object.hasOwn(receipts, path)) return endpoint;
  const receipt = receipts[path];
  assert.equal(endpoint, receipt.previousSha256, message + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid host source digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'A host successor must identify changed bytes: ' + path);
  return receipt.currentSha256;
}

function reviewedPublishedAvpHostDigest20261125(path, endpoint) {
  const avp = advanceReceipt(path, endpoint, AVP_HOST_SUCCESSORS_20261125,
    'Broken merged-Tantalus-to-AVP host source chain: ');
  const joined = advanceReceipt(path, avp, AVP_FIORINA_JOIN_SUCCESSORS_20261125,
    'Broken AVP-to-Fiorina host source chain: ');
  return advanceReceipt(path, joined, AVP_FIORINA_QA_SUCCESSORS_20261125,
    'Broken joined-host-to-Fiorina-QA source chain: ');
}

export function reviewedFiorinaSpriteHostDigest20261125(path, endpoint) {
  const published = advanceReceipt(path, endpoint, AVP_FIORINA_SPRITES_SUCCESSORS_20261125,
    'Broken published-merge-to-Fiorina-sprites source chain: ');
  return reviewedFiorinaV116HostDigest20261125(path, published);
}

export function reviewedFiorinaV116HostDigest20261125(path, endpoint) {
  const published = advanceReceipt(path, endpoint, AVP_FIORINA_V116_SUCCESSORS_20261125,
    'Broken Fiorina-V115-to-V116 source chain: ');
  if (Object.hasOwn(AVP_COVENANT_SUCCESSORS_20261126, path)
    || Object.hasOwn(AVP_COVENANT_V012_SUCCESSORS_20261126, path))
    return reviewedCovenantHostDigest20261126(path, published);
  return reviewedDlcBibleDocumentsHostDigest20261126(path, published);
}

export function reviewedDlcBibleDocumentsHostDigest20261126(path, endpoint) {
  const published = advanceReceipt(path, endpoint, AVP_DLC_BIBLE_DOCUMENTS_SUCCESSORS_20261126,
    'Broken V116-to-DLC-bible-documents source chain: ');
  return reviewedDlcBibleBridgeHostDigest20261126(path, published);
}

export function reviewedDlcBibleBridgeHostDigest20261126(path, endpoint) {
  const published = advanceReceipt(path, endpoint, AVP_DLC_BIBLE_BRIDGE_SUCCESSORS_20261126,
    'Broken DLC-bible-document-bridge source chain: ');
  return reviewedAvpProductionBibleHostDigest20261126(path, published);
}

export function reviewedAvpProductionBibleHostDigest20261126(path, endpoint) {
  const published = advanceReceipt(path, endpoint, AVP_PRODUCTION_BIBLE_SUCCESSORS_20261126,
    'Broken DLC-bible-to-AVP-production source chain: ');
  return Object.hasOwn(AVP_DLC_BIBLE_DOCUMENTS_SUCCESSORS_20261126, path)
    || Object.hasOwn(AVP_DLC_BIBLE_BRIDGE_SUCCESSORS_20261126, path)
    || Object.hasOwn(AVP_PRODUCTION_BIBLE_SUCCESSORS_20261126, path)
    ? reviewedCovenantDlcBibleMergeDigest20261126(path, published) : published;
}

export function reviewedAvpHostDigest20261125(path, endpoint) {
  const merged = advanceReceipt(path, reviewedPublishedAvpHostDigest20261125(path, endpoint), AVP_ALIENS_JOIN_SUCCESSORS_20261125,
    'Broken published-AVP-to-Aliens-merge source chain: ');
  return reviewedFiorinaSpriteHostDigest20261125(path, merged);
}

export function reviewedAliensIncomingDigest20261125(path, endpoint) {
  if (!Object.hasOwn(AVP_ALIENS_INCOMING_SOURCES_20261125, path)) return endpoint;
  assert.equal(endpoint, AVP_ALIENS_INCOMING_SOURCES_20261125[path], 'Broken published-Aliens incoming source chain: ' + path);
  const merged = advanceReceipt(path, endpoint, ALIENS_AVP_JOIN_SUCCESSORS_20261125,
    'Broken published-Aliens-to-AVP-merge source chain: ');
  return reviewedFiorinaSpriteHostDigest20261125(path, merged);
}

const hostPaths = () => [...new Set([...Object.keys(AVP_HOST_SUCCESSORS_20261125),
  ...Object.keys(AVP_FIORINA_JOIN_SUCCESSORS_20261125), ...Object.keys(AVP_FIORINA_QA_SUCCESSORS_20261125),
  ...Object.keys(AVP_ALIENS_JOIN_SUCCESSORS_20261125), ...Object.keys(AVP_FIORINA_SPRITES_SUCCESSORS_20261125),
  ...Object.keys(AVP_FIORINA_V116_SUCCESSORS_20261125), ...Object.keys(AVP_COVENANT_SUCCESSORS_20261126),
  ...Object.keys(AVP_COVENANT_V012_SUCCESSORS_20261126), ...Object.keys(AVP_DLC_BIBLE_DOCUMENTS_SUCCESSORS_20261126),
  ...Object.keys(AVP_DLC_BIBLE_BRIDGE_SUCCESSORS_20261126), ...Object.keys(AVP_PRODUCTION_BIBLE_SUCCESSORS_20261126),
  ...Object.keys(COVENANT_DLC_BIBLE_MERGE_SOURCES_20261126)])];

function hostReceiptChains(path) {
  const common = [AVP_HOST_SUCCESSORS_20261125[path], AVP_FIORINA_JOIN_SUCCESSORS_20261125[path],
    AVP_FIORINA_QA_SUCCESSORS_20261125[path], AVP_ALIENS_JOIN_SUCCESSORS_20261125[path],
    AVP_FIORINA_SPRITES_SUCCESSORS_20261125[path], AVP_FIORINA_V116_SUCCESSORS_20261125[path]].filter(Boolean);
  const covenant = [...common, AVP_COVENANT_SUCCESSORS_20261126[path],
    AVP_COVENANT_V012_SUCCESSORS_20261126[path]].filter(Boolean);
  const documents = [...common, AVP_DLC_BIBLE_DOCUMENTS_SUCCESSORS_20261126[path],
    AVP_DLC_BIBLE_BRIDGE_SUCCESSORS_20261126[path], AVP_PRODUCTION_BIBLE_SUCCESSORS_20261126[path]].filter(Boolean);
  for (const chain of [covenant, documents])
    for (let index = 1; index < chain.length; index++)
      assert.equal(chain[index].previousSha256, chain[index - 1].currentSha256,
        'Broken recorded host runtime view chain: ' + path);
  return { common, covenant, documents };
}

// Each branch retains its valid chain. Only exact recorded endpoints from either
// parent and the reviewed merged endpoint may appear in a runtime source view.
export function avpHostRuntimeSources20261125(view) {
  const result = { ...view };
  for (const path of hostPaths()) {
    if (!Object.hasOwn(result, path)) continue;
    const { covenant, documents } = hostReceiptChains(path);
    const endpoints = new Set([covenant, documents].flatMap(chain => chain.length
      ? [chain[0].previousSha256, ...chain.map(receipt => receipt.currentSha256)] : []));
    const merge = COVENANT_DLC_BIBLE_MERGE_SOURCES_20261126[path];
    if (merge) {
      endpoints.add(merge.covenantSha256); endpoints.add(merge.targetSha256); endpoints.add(merge.currentSha256);
    }
    assert.ok(endpoints.has(result[path]), 'Incorrect AVP host runtime view predecessor: ' + path);
    result[path] = merge ? merge.currentSha256
      : (Object.hasOwn(AVP_COVENANT_SUCCESSORS_20261126, path)
        || Object.hasOwn(AVP_COVENANT_V012_SUCCESSORS_20261126, path))
        ? covenant.at(-1).currentSha256 : documents.at(-1).currentSha256;
  }
  return Object.freeze(result);
}

export function verifyAvpHostSources20261125(readSource = readRepository) {
  assert.match(AVP_HOST_BASELINE_20261125, /^[a-f0-9]{40}$/, 'AVP requires its exact reviewed merged baseline');
  assert.equal(AVP_FIORINA_SPRITES_BASELINE_20261125, 'b89dc6ba47ee1ca90de29f3ccff47ddfe699d2d9',
    'Fiorina sprites require the exact published continuation base');
  assert.equal(AVP_FIORINA_V116_BASELINE_20261125, 'ae4e49bef5fea639d0c381466aefea85f8a57300',
    'Fiorina V116 requires the exact merged V115 continuation base');
  assert.equal(AVP_COVENANT_BASELINE_20261126, 'b0df1877a058f0818f96437fdfdea3f21ba7f415',
    'Covenant requires the exact published V116 branch parent');
  assert.equal(AVP_COVENANT_V012_BASELINE_20261126, 'aa6e3ccdecd54a5d20905e9d5cb6f9273cc27fa9',
    'Covenant V012 requires the exact published V011 head');
  assert.equal(AVP_DLC_BIBLE_DOCUMENTS_BASELINE_20261126, 'b0df1877a058f0818f96437fdfdea3f21ba7f415',
    'DLC bible documents requires the exact merged V116 continuation base');
  assert.equal(AVP_DLC_BIBLE_BRIDGE_BASELINE_20261126, '16686e8681cc0370db3fa3df2967704ef1862155',
    'DLC bible bridge requires the exact published PR 68 document head');
  assert.equal(AVP_PRODUCTION_BIBLE_BASELINE_20261126, '268b1a517c60338899578a165e9784c5b7313dba',
    'AVP production documents require the exact corrected bible continuation base');
  assert.equal(AVP_FIORINA_JOIN_BASELINES_20261125.commonCommit, AVP_HOST_BASELINE_20261125);
  for (const commit of Object.values(AVP_FIORINA_JOIN_BASELINES_20261125)) assert.match(commit, /^[a-f0-9]{40}$/);
  assert.match(AVP_FIORINA_QA_BASELINE_20261125, /^[a-f0-9]{40}$/, 'Fiorina QA requires its exact combined baseline');
  assert.deepEqual(AVP_ALIENS_JOIN_BASELINES_20261125, {
    avpCommit: '1290733d51b6be5d075ab8bbc3eb9e87d684e8f4',
    aliensCommit: 'eb4a3107b3abe073acc536ab453be3b98ecb6685',
    commonCommit: '38a4a2272ec48a9cd5011f8a0055caaca6ab0774'
  });
  for (const receipts of [AVP_HOST_SUCCESSORS_20261125, AVP_FIORINA_JOIN_SUCCESSORS_20261125, AVP_FIORINA_QA_SUCCESSORS_20261125,
    AVP_ALIENS_JOIN_SUCCESSORS_20261125, ALIENS_AVP_JOIN_SUCCESSORS_20261125, AVP_FIORINA_SPRITES_SUCCESSORS_20261125,
    AVP_FIORINA_V116_SUCCESSORS_20261125, AVP_COVENANT_SUCCESSORS_20261126,
    AVP_COVENANT_V012_SUCCESSORS_20261126, AVP_DLC_BIBLE_DOCUMENTS_SUCCESSORS_20261126,
    AVP_DLC_BIBLE_BRIDGE_SUCCESSORS_20261126, AVP_PRODUCTION_BIBLE_SUCCESSORS_20261126]) {
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
  for (const [path, receipt] of Object.entries(AVP_FIORINA_QA_SUCCESSORS_20261125)) {
    const prior = AVP_FIORINA_JOIN_SUCCESSORS_20261125[path] || AVP_HOST_SUCCESSORS_20261125[path];
    if (prior) assert.equal(receipt.previousSha256, prior.currentSha256,
      'Fiorina QA must follow the exact combined receipt: ' + path);
  }
  for (const [path, digest] of Object.entries(AVP_FIORINA_INCOMING_SOURCES_20261125)) {
    assert.ok(validHash(digest) && Object.hasOwn(AVP_FIORINA_JOIN_SUCCESSORS_20261125, path),
      'Missing reviewed Fiorina input: ' + path);
    assert.notEqual(digest, AVP_FIORINA_JOIN_SUCCESSORS_20261125[path].previousSha256,
      'A reviewed Fiorina input must identify an actual branch change: ' + path);
  }
  for (const [path, receipt] of Object.entries(AVP_ALIENS_JOIN_SUCCESSORS_20261125)) {
    const prior = AVP_FIORINA_QA_SUCCESSORS_20261125[path] || AVP_FIORINA_JOIN_SUCCESSORS_20261125[path] || AVP_HOST_SUCCESSORS_20261125[path];
    if (prior) assert.equal(receipt.previousSha256, prior.currentSha256, 'Aliens must follow the exact published AVP endpoint: ' + path);
    else assert.ok(Object.hasOwn(AVP_ALIENS_INCOMING_SOURCES_20261125, path), 'A merge successor requires an exact reviewed parent: ' + path);
  }
  for (const [path, receipt] of Object.entries(ALIENS_AVP_JOIN_SUCCESSORS_20261125))
    assert.equal(receipt.previousSha256, AVP_ALIENS_INCOMING_SOURCES_20261125[path], 'The Aliens parent must retain its exact published endpoint: ' + path);
  for (const [path, digest] of Object.entries(AVP_ALIENS_INCOMING_SOURCES_20261125)) {
    assert.notEqual(path, ownPath, 'The terminal cannot admit its own incoming bytes');
    assert.ok(validHash(digest), 'Invalid incoming Aliens source digest: ' + path);
    const merged = AVP_ALIENS_JOIN_SUCCESSORS_20261125[path] || AVP_FIORINA_QA_SUCCESSORS_20261125[path]
      || AVP_FIORINA_JOIN_SUCCESSORS_20261125[path] || AVP_HOST_SUCCESSORS_20261125[path];
    assert.ok(merged, 'An incoming Aliens path requires an exact merged endpoint: ' + path);
    assert.equal(reviewedAliensIncomingDigest20261125(path, digest),
      reviewedFiorinaSpriteHostDigest20261125(path, merged.currentSha256),
      'The two published parents must converge exactly: ' + path);
  }
  for (const [path, receipt] of Object.entries(AVP_FIORINA_SPRITES_SUCCESSORS_20261125)) {
    const prior = AVP_ALIENS_JOIN_SUCCESSORS_20261125[path] || AVP_FIORINA_QA_SUCCESSORS_20261125[path]
      || AVP_FIORINA_JOIN_SUCCESSORS_20261125[path] || AVP_HOST_SUCCESSORS_20261125[path];
    if (prior) assert.equal(receipt.previousSha256, prior.currentSha256,
      'Fiorina sprites must follow the exact published host endpoint: ' + path);
  }
  for (const [path, receipt] of Object.entries(AVP_FIORINA_V116_SUCCESSORS_20261125)) {
    assert.ok(Object.hasOwn(AVP_FIORINA_SPRITES_SUCCESSORS_20261125, path),
      'A V116 host successor requires an exact published V115 receipt: ' + path);
    assert.equal(receipt.previousSha256, AVP_FIORINA_SPRITES_SUCCESSORS_20261125[path].currentSha256,
      'Fiorina V116 must follow its exact merged V115 endpoint: ' + path);
  }
  for (const [path, receipt] of Object.entries(AVP_COVENANT_SUCCESSORS_20261126)) {
    const prior = AVP_FIORINA_V116_SUCCESSORS_20261125[path] || AVP_FIORINA_SPRITES_SUCCESSORS_20261125[path]
      || AVP_ALIENS_JOIN_SUCCESSORS_20261125[path] || AVP_FIORINA_QA_SUCCESSORS_20261125[path]
      || AVP_FIORINA_JOIN_SUCCESSORS_20261125[path] || AVP_HOST_SUCCESSORS_20261125[path];
    assert.ok(prior, 'A Covenant host successor requires an exact published predecessor: ' + path);
    assert.equal(receipt.previousSha256, prior.currentSha256,
      'Covenant must follow the exact published host endpoint: ' + path);
  }
  for (const [path, receipt] of Object.entries(AVP_COVENANT_V012_SUCCESSORS_20261126)) {
    const prior = AVP_COVENANT_SUCCESSORS_20261126[path] || AVP_FIORINA_V116_SUCCESSORS_20261125[path]
      || AVP_FIORINA_SPRITES_SUCCESSORS_20261125[path] || AVP_ALIENS_JOIN_SUCCESSORS_20261125[path]
      || AVP_FIORINA_QA_SUCCESSORS_20261125[path] || AVP_FIORINA_JOIN_SUCCESSORS_20261125[path]
      || AVP_HOST_SUCCESSORS_20261125[path];
    assert.ok(prior, 'A Covenant V012 successor requires a published source endpoint: ' + path);
    assert.equal(receipt.previousSha256, prior.currentSha256,
      'Covenant V012 must follow the exact V011 source endpoint: ' + path);
  }
  for (const [path, receipt] of Object.entries(AVP_DLC_BIBLE_DOCUMENTS_SUCCESSORS_20261126)) {
    const prior = AVP_FIORINA_V116_SUCCESSORS_20261125[path] || AVP_FIORINA_SPRITES_SUCCESSORS_20261125[path]
      || AVP_ALIENS_JOIN_SUCCESSORS_20261125[path] || AVP_FIORINA_QA_SUCCESSORS_20261125[path]
      || AVP_FIORINA_JOIN_SUCCESSORS_20261125[path] || AVP_HOST_SUCCESSORS_20261125[path];
    assert.ok(prior, 'DLC bible documents requires an exact published host predecessor: ' + path);
    assert.equal(receipt.previousSha256, prior.currentSha256,
      'DLC bible documents must follow the exact V116 endpoint: ' + path);
  }
  assert.deepEqual(Object.keys(AVP_DLC_BIBLE_BRIDGE_SUCCESSORS_20261126), ['docs/narrative/CAMPAGNE_PRINCIPALE.md'],
    'The bible bridge can advance only the exact reviewed campaign document');
  for (const path of Object.keys(AVP_DLC_BIBLE_BRIDGE_SUCCESSORS_20261126))
    for (const receipts of [AVP_HOST_SUCCESSORS_20261125, AVP_FIORINA_JOIN_SUCCESSORS_20261125,
      AVP_FIORINA_QA_SUCCESSORS_20261125, AVP_ALIENS_JOIN_SUCCESSORS_20261125,
      AVP_FIORINA_SPRITES_SUCCESSORS_20261125, AVP_FIORINA_V116_SUCCESSORS_20261125,
      AVP_DLC_BIBLE_DOCUMENTS_SUCCESSORS_20261126])
      assert.equal(Object.hasOwn(receipts, path), false, 'The bible bridge must preserve every existing host receipt: ' + path);
  for (const [path, receipt] of Object.entries(AVP_PRODUCTION_BIBLE_SUCCESSORS_20261126)) {
    const prior = AVP_DLC_BIBLE_BRIDGE_SUCCESSORS_20261126[path] || AVP_DLC_BIBLE_DOCUMENTS_SUCCESSORS_20261126[path]
      || AVP_FIORINA_V116_SUCCESSORS_20261125[path] || AVP_FIORINA_SPRITES_SUCCESSORS_20261125[path]
      || AVP_ALIENS_JOIN_SUCCESSORS_20261125[path] || AVP_FIORINA_QA_SUCCESSORS_20261125[path]
      || AVP_FIORINA_JOIN_SUCCESSORS_20261125[path] || AVP_HOST_SUCCESSORS_20261125[path];
    assert.ok(prior, 'AVP production requires an exact published host predecessor: ' + path);
    assert.equal(receipt.previousSha256, prior.currentSha256,
      'AVP production must follow the exact corrected bible endpoint: ' + path);
  }
  assert.deepEqual(COVENANT_DLC_BIBLE_MERGE_BASELINES_20261126, {
    commonCommit: 'b0df1877a058f0818f96437fdfdea3f21ba7f415',
    covenantCommit: '9ee21033a71fc0f965ef270fa560d13eaa89d813',
    targetCommit: '2e8309081d206b86d9f234ebfc33c13ea74970f4'
  });
  assert.deepEqual(Object.keys(COVENANT_DLC_BIBLE_MERGE_SOURCES_20261126).sort(),
    ['docs/narrative/CAMPAGNE_PRINCIPALE.md', 'scripts/build-asset-filter.mjs', 'scripts/verify-public-release-v86.mjs']);
  assert.equal(Object.hasOwn(COVENANT_DLC_BIBLE_MERGE_SOURCES_20261126, ownPath), false,
    'The terminal cannot admit its own merged bytes');
  for (const [path, receipt] of Object.entries(COVENANT_DLC_BIBLE_MERGE_SOURCES_20261126)) {
    assert.deepEqual(Object.keys(receipt).sort(),
      ['commonSha256', 'covenantSha256', 'currentSha256', 'targetSha256']);
    for (const digest of Object.values(receipt)) assert.ok(validHash(digest), 'Invalid merged source digest: ' + path);
    assert.notEqual(receipt.currentSha256, receipt.covenantSha256, 'The Covenant source must advance: ' + path);
    assert.notEqual(receipt.currentSha256, receipt.targetSha256, 'The target source must advance: ' + path);
    const { common, covenant, documents } = hostReceiptChains(path);
    assert.equal(receipt.commonSha256, common.length
      ? common.at(-1).currentSha256 : documents[0].previousSha256, 'Changed common merge source: ' + path);
    assert.equal(receipt.targetSha256, documents.at(-1).currentSha256, 'Changed target merge source: ' + path);
    if (Object.hasOwn(AVP_COVENANT_SUCCESSORS_20261126, path)
      || Object.hasOwn(AVP_COVENANT_V012_SUCCESSORS_20261126, path))
      assert.equal(receipt.covenantSha256, covenant.at(-1).currentSha256, 'Changed Covenant merge source: ' + path);
    else assert.equal(path, 'docs/narrative/CAMPAGNE_PRINCIPALE.md',
      'Only the documented campaign append may lack an old Covenant host receipt');
    assert.equal(reviewedCovenantDlcBibleMergeDigest20261126(path, receipt.covenantSha256), receipt.currentSha256);
    assert.equal(reviewedCovenantDlcBibleMergeDigest20261126(path, receipt.targetSha256), receipt.currentSha256);
  }
  const paths = hostPaths();
  for (const path of paths) {
    const seed = (AVP_HOST_SUCCESSORS_20261125[path] || AVP_FIORINA_JOIN_SUCCESSORS_20261125[path]
      || AVP_FIORINA_QA_SUCCESSORS_20261125[path] || AVP_ALIENS_JOIN_SUCCESSORS_20261125[path]
      || AVP_FIORINA_SPRITES_SUCCESSORS_20261125[path] || AVP_DLC_BIBLE_BRIDGE_SUCCESSORS_20261126[path]).previousSha256;
    assert.equal(sha(readSource(path)), reviewedAvpHostDigest20261125(path, seed), 'Unreviewed AVP host source bytes: ' + path);
  }
  return Object.freeze({ baselineCommit: AVP_HOST_BASELINE_20261125, successors: paths.length,
    joinedSuccessors: Object.keys(AVP_FIORINA_JOIN_SUCCESSORS_20261125).length,
    qualitySuccessors: Object.keys(AVP_FIORINA_QA_SUCCESSORS_20261125).length,
    aliensMergedSuccessors: Object.keys(AVP_ALIENS_JOIN_SUCCESSORS_20261125).length,
    aliensIncomingSuccessors: Object.keys(ALIENS_AVP_JOIN_SUCCESSORS_20261125).length,
    spriteSuccessors: Object.keys(AVP_FIORINA_SPRITES_SUCCESSORS_20261125).length,
    spriteV116Successors: Object.keys(AVP_FIORINA_V116_SUCCESSORS_20261125).length,
    covenantV012Successors: Object.keys(AVP_COVENANT_V012_SUCCESSORS_20261126).length,
    historicalEvidenceTransferred: false });
}
