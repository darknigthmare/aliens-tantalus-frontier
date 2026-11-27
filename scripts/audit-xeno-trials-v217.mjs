import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_TRIALS_BASELINE_V217 = '55c98468250a409b5348a83165390af405f58170';
export const XENO_TRIALS_DECLARATIONS_V217 = freeze({
  'scripts/audit-xeno-tablet-sprite-v216.mjs': {
    start: 'export const XENO_TABLET_SPRITE_BASELINE_V216',
    end: '\nexport function reviewedXenoTabletSpriteDigestV216',
    sha256: 'b677ea3663970b433ace1ababad7bc3767a6a04f2c157c5b875a214f0d33509c'
  }
});
export const XENO_TRIALS_SUCCESSORS_V217 = freeze({
  "package.json": {
    "kind": "tooling",
    "sha256": "97d768ae813a2730fcc5981c507a9530ff53f53057983420644cdcd4e1bf1c04",
    "previousSha256": "f7d46044e2314eda589d6e6c607e8ca918c3313628cb7622a937f22f919527e9"
  },
  "scripts/audit-xeno-tablet-sprite-v216.mjs": {
    "kind": "tooling",
    "sha256": "ca6f82190cfd806a7b9bbe00351d7c57d05b611098685259a855d249c86f1028",
    "previousSha256": "1899e64f40034b94d19a122af4ff847450124896452d4757e473d3c2be9d79d1"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "d50fb3f117da83582640d5cb0839c97dacd13e722f0abdd65a300242394c9291",
    "previousSha256": "97c7bbec335a589d43ec5891b750fd877ad27b667b8948424b7491d21283bd2c"
  },
  "scripts/verify-aliens1986-main-succession-v116.mjs": {
    "kind": "tooling",
    "sha256": "5caa470afcaf7deee9af051f99cda80ee8533325583b12f88adba52de2087434",
    "previousSha256": "473bb9c1dc9ab428480d19197bf3e713437c7f1d253e96e2bb6543aaedaac7c9"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "6b18fcbdde3b0d5ae0829ffd1f2731b5c692207d0432dbbd06a1f54088e82b66",
    "previousSha256": "1b4ed44709761becd17495f136b4ab954eae14f96fad816de3460080a51071c8"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "d31a2dfe3e42526018480897b06e34163ce9e075fbf97adb5d1574bc9b66081e",
    "previousSha256": "550184b33bdaead8e5b3a5d518423a407d3eec56f6daff6bb2c5fdcb6dd66435"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "tooling",
    "sha256": "ce6284f1b4921bfcb24712b903d50059ec5612a96b265ce4018120e79c74b9d6",
    "previousSha256": "f5195d0c2083be19906408886461695dfc64dd0848a4dc05952c793c30994fb0"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "c7dce0e51cc333088ba99efbe6662c9878eb6378bae5012504b433f1ffa66257",
    "previousSha256": "4a5d820656d96e7c593392d1604e7e8fb960ef1a23e1a331728ad15f43543242"
  },
  "scripts/verify-river-of-pain-succession.mjs": {
    "kind": "tooling",
    "sha256": "886144fb81173c8f84db768d1e5491691531b91cd0b5c62673bc9922ef1ffe35",
    "previousSha256": "ea2c2e9e9169f6d4ba492050e58bb917693f8c10a45269f826e647e72e932aaf"
  },
  "scripts/verify-trials-navigation-v163.mjs": {
    "kind": "tooling",
    "sha256": "2e1c54cd6751047db5157ce7cd25276a82e15cd5d7e1117c540d395621736181",
    "previousSha256": "01f4eb053ff66ca6ea4ed91de162c46b289367328cb636e91a8e8e83dfcbc23f"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "tooling",
    "sha256": "62288fee9bd90ab1d7c7e6eb4fa0691994f3125e68f95b6e6018c5316df8ee48",
    "previousSha256": "3838a13bec409163066be3c4bfa57f7b710e033f22f0b4357d6c395c44f0e220"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "tooling",
    "sha256": "da220d6a851c5bf327da15348cf1aea884b95b23bef52ccdea3cf3ca1db8e754",
    "previousSha256": "f85e7cc5295ed0de89d7c5cd316e4fc71d3036684cb0f1cf8968d90a8754164c"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "tooling",
    "sha256": "850d0fefd9ecf06c4982f5d33940e132fdedc84e84f4f52bf86036d588b658c1",
    "previousSha256": "5b853515d8bdc29f6a3f8034943b2fbdf600160d43927b38f7c4f52af168738f"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "tooling",
    "sha256": "38cd46f8e8576ef76d665677493cbaca217d8cb6c122287ba27f0227796be38b",
    "previousSha256": "162adde8818ae1478426ece0a544f3a5ba6fc5aec101e018d0433f6d84342598"
  },
  "scripts/verify-xeno-gameplay-audit-v208.mjs": {
    "kind": "tooling",
    "sha256": "a51da013c6f305325db47d3afa8169e90f3e5f52010f4e293246593f0d0aa792",
    "previousSha256": "5bfb4438e0e74a0e4fa7926bf77d9333bf60323f8a2f581c0e477c032b629e9e"
  },
  "scripts/verify-xeno-gameplay-audit-v209.mjs": {
    "kind": "tooling",
    "sha256": "739ff9b17c9eafbd2d8d67d0e2a15ed5408ce2e5901f64dffb8c851a0ec2fbae",
    "previousSha256": "285cddb33df9fe96e0db2a3cef810949613e7594076a088b7b956df0fa79845f"
  },
  "scripts/verify-xeno-gameplay-audit-v213.mjs": {
    "kind": "tooling",
    "sha256": "21eba5339942dd046106f5bf6032cffeca0e6a73c5945fcd7c09784bd9d8c2c9",
    "previousSha256": "ab02cf74d9f7202b841645fce0d6b6460e8004671e3b2778a48dce3e7c1cc6f0"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "tooling",
    "sha256": "2a1b63651840a3e32f10a7702dcf3c29eb1d6d2d6ad92416e8472336c7b7a79a",
    "previousSha256": "beb70253df1ca2bb91042642703bc0bd8eee039ca10851baaa79f1bfe1e60b1b"
  },
  "scripts/verify-xeno-priorities-audit-v201.mjs": {
    "kind": "tooling",
    "sha256": "a1ac514204e957f77f8743b770f884178cb0f76dc43d28a335402eef6e09e31e",
    "previousSha256": "166e22cf77aa4f2edae1315b2319fb931e52b19b8f6fa07c5d5077f4f842821f"
  },
  "scripts/verify-xeno-priorities-audit-v202.mjs": {
    "kind": "tooling",
    "sha256": "1e584a158e81bc704bf744e09bccdd0bd60f66285c7bdefaa14d98667bbd6bae",
    "previousSha256": "f5007d163c2f0b2d3424c4171a5f6e819a6ec4ea3e67eb3a4b1d7105c6072d9c"
  },
  "scripts/verify-xeno-priorities-audit-v203.mjs": {
    "kind": "tooling",
    "sha256": "2a4f84ed22d26ce0c8ff39255b018dd58f9713dc97821127d534f3fb0f1477c3",
    "previousSha256": "93bba319ea2a7fe58b1eb20e6ab6333bd033d0124efae4d2f05d104b3d44cef8"
  },
  "scripts/verify-xeno-priorities-audit-v204.mjs": {
    "kind": "tooling",
    "sha256": "125a4818153f00311dbad5aa0aa3711ff2457b5f53b61b3bcd887a460cd9a676",
    "previousSha256": "8026f2bbcfa4976c71d523f368b8f412cd5c3203c08509a45f582f0ccecd7147"
  },
  "scripts/verify-xeno-production-assets-v206.mjs": {
    "kind": "tooling",
    "sha256": "ff6f95593bc5c0c84de78fb9b1fe91ea34b73d262b24562d649906123cab2d16",
    "previousSha256": "5be567f7a6d0b00bb4046d6f19aee9c300e76b5a26136bd5bdf2faa65eb82858"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "tooling",
    "sha256": "1bc772d639bab82b1e5f5db9376bf085e090168ded92ecfde62f3c0b20f707af",
    "previousSha256": "9d2acedc24d3c71e88b87bf6f6b81fc24a90e324a5113d838d94da71d3a172de"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "tooling",
    "sha256": "ca8736169a1c8762d7047715f7354ab08e98ee65fae9ec0547482397e87d7d37",
    "previousSha256": "217ae5d243066057e4ab97ee1b51c7fcdf22dbc29e6c11dd094acf9fb12b1c54"
  },
  "scripts/verify-xeno-standalone-audit-v207.mjs": {
    "kind": "tooling",
    "sha256": "68163deaf31d26e3d5ce38ec9340edaf716dcfb4c6554a366f87beab0ca4dc12",
    "previousSha256": "4868c7e2a5e02de49942f2c59853bfd994f9e2adb7a62faa70cce693842a81c8"
  },
  "scripts/verify-xeno-supers-audit-v200.mjs": {
    "kind": "tooling",
    "sha256": "36dd2fa5b9cce423ed29af8dc6c50c5873223d8b80c953645a91e01f024acfe5",
    "previousSha256": "7a87aed20781dcf3712a0a091fe939e907f63f39219e1bd95c539c5ba415fc7e"
  },
  "scripts/verify-xeno-trials-ai-v213.mjs": {
    "kind": "tooling",
    "sha256": "be67b9a53ad6e0850aa47c05c8495cb121d68339f5eef21f7dfabb7e2e95edb8",
    "previousSha256": "dd4568db5db5940cafd5a4d103b25a049715f58cb88dcbac750db5ecda6dd3a2"
  },
  "scripts/verify-xeno-trials-animation-audio-i18n-v189.mjs": {
    "kind": "tooling",
    "sha256": "ce7d6098439f814dfe5512e999519f61032ba846f278a6f700e2f9d0e6306604",
    "previousSha256": "ba529cf66760f865a60d4dffb4b471fd06fcacb1682c3eb9e24272ec9576f65d"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "f0841aa6af2422150fbcd5fd1b06ccef7cebcfd2b20aad036e90f653cde70d4b",
    "previousSha256": "9cc4799c3146635db16817c0da856e8fd4df0914564a5fbf316f980e7160707f"
  },
  "scripts/verify-xeno-trials-horde-minigames-v213.mjs": {
    "kind": "tooling",
    "sha256": "ec867f41a1bcd4255ede4285762f3250b7582ce225a90c04463ff0ec1039505a",
    "previousSha256": "a852aabbcfa3bffc51d493d8bcfc0589a3fb497490ac3aff1c9b085cf39f6c57"
  },
  "scripts/verify-xeno-trials-stage-events-v211.mjs": {
    "kind": "tooling",
    "sha256": "b81ed4633b0d57f1769d51e214ddc8250b2f584b47a0edc1b64c89a23a9db5b1",
    "previousSha256": "57846e3a8fc006b7ae054d0fe71ab9591956810f70a9cc69da2c2c759a859298"
  },
  "scripts/verify-xeno-visual-assets-audit-v205.mjs": {
    "kind": "tooling",
    "sha256": "b14a3111cf98b3db7c0c84f4690a9f409913cd1716b3682869a8e467def88a23",
    "previousSha256": "9affa51cb18ba9a31e837a21a5c24e3d0801c5f617c8c7fa395aebe1eff6def4"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "sha256": "e0f3f0af50ab2a82a42c3119e8a01e8859475edf704fbf3407721e5fbd86dd26",
    "previousSha256": "44abd301fd7117a71357bf3571db0ce05e71f936728a21cfeeac64638f293e97"
  },
  "src/xeno-trials-ai-v209.js": {
    "kind": "runtime",
    "sha256": "ede00382a9f8b5a48010ec4de0ffe6baf19ca23efe36f17a559bcb4317af2682",
    "previousSha256": "1a0f5833f44eafd44f9a58a0dd0af0cd312ca7c73c0806eb85b054233a460cc2"
  },
  "src/xeno-trials-horde-minigames-v213.js": {
    "kind": "runtime",
    "sha256": "b31d0a39207e35df675b9d9306d279faa25d4d5aebcd0df5b4f0cf25083f0f2d",
    "previousSha256": "a033a8c25eab7f039a08620ff4dedea07580f00015d077193d86c7e9fdc04d06"
  },
  "src/xeno-trials-practice-v207.js": {
    "kind": "runtime",
    "sha256": "823622925ab294222ec3ac2a2882b96f4a5bb413935c4e44a47abc5bae20c8c2",
    "previousSha256": "9c7cf690c9cc00c7d5d26d2a4510f8b1d90c1c0fae07b78f251f26b637232b9e"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "sha256": "c071941554df967956fbd6e786b330c9527cc3c2ebdd64267532317a5c5ec213",
    "previousSha256": "1efd734220cbad5adb69a0172f4b22ce2878272f46fb46f404e5a1075588dfed"
  },
  "src/xeno-trials-stage-events-v211.js": {
    "kind": "runtime",
    "sha256": "fa5978b4cef4fb2539742241ff3367e83ff82e4a9fb5a65e8c7ce5ad8fc95b5f",
    "previousSha256": "dfa8c45c76c6f8e309db476483986184d585d1c133caf735e432018aff249d27"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "e9586690b1934b5fca9b5cfe3b59ea0a66e42efc9369fef07f39dbea33c8ff99",
    "previousSha256": "0c63d82131baf65742f87261ba2bae6b62537435d91e0a8da4a50a4383a9a2a8"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "ba8813acd682fb198d8696a431db5fac52983a0aa65a1247de355ea9505071bd",
    "previousSha256": "0181d0e53ef48d10d65eee3cc085320497d37da27b607dc05422c5f65a4672dc"
  },
  "xeno-trials-fullscreen-v119.css": {
    "kind": "runtime",
    "sha256": "96401d0b9c4deb7dcb6e7854b445cf878d807ae17ac7c286ac7642cc5eb6345b",
    "previousSha256": "cf4165644ec0371429b7bb750efed16196cf3ab8dd447298fdc2b2beb64cff3d"
  }
});
export const XENO_TRIALS_NEW_INPUTS_V217 = freeze({
  "scripts/verify-xeno-trials-practice-v217.mjs": {
    "kind": "tooling",
    "sha256": "9a6a23375fa4fb73ad61d6fd8abbc030ab56ca0db5408c25b5ade22f7d5cb96b"
  },
  "src/xeno-trials-practice-v217.js": {
    "kind": "runtime",
    "sha256": "e7e309a3261129693d75a7d243e04e25c92dc5c36c7a8977197cc201e1acfdb2"
  }
});

export function reviewedXenoTrialsDigestV217(path, endpoint) {
  if (!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V217, path)) return endpoint;
  const receipt = XENO_TRIALS_SUCCESSORS_V217[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V216 endpoint for V217: ' + path);
  return receipt.sha256;
}

export function xenoTrialsRuntimeSourcesV217(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V217)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.sha256) reviewedXenoTrialsDigestV217(path, result[path]);
    result[path] = receipt.sha256;
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V217)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined) assert.equal(result[path], receipt.sha256, 'Incorrect V217 runtime input: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoTrialsV217(readSource = readRepository) {
  const successors = Object.entries(XENO_TRIALS_SUCCESSORS_V217);
  const inputs = Object.entries(XENO_TRIALS_NEW_INPUTS_V217);
  assert.ok(successors.length > 0, 'Incomplete V217 source freeze');
  const paths = new Set(['scripts/audit-xeno-trials-v217.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V217 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V217 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256),
      'Invalid V217 receipt: ' + path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V217 source bytes: ' + path);
  }
  for (const [path, receipt] of successors) {
    assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V217 predecessor: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(!Object.hasOwn(receipt, 'previousSha256'), 'V217 input has a predecessor: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_DECLARATIONS_V217)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V216 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V216 declarations changed: ' + path);
  }
  return Object.freeze({ baseline: XENO_TRIALS_BASELINE_V217, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
