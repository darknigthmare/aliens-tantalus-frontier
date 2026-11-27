import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { reviewedXenoTrialsDigestV217, xenoTrialsRuntimeSourcesV217,
  verifyXenoTrialsV217 } from './audit-xeno-trials-v217.mjs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_TABLET_SPRITE_BASELINE_V216 = 'fc2c6549295521cc731fa3d90b79b24c304d769a';
export const XENO_TABLET_SPRITE_DECLARATIONS_V216 = freeze({
  'scripts/audit-xeno-combat-tablet-v215.mjs': {
    start: 'export const XENO_COMBAT_TABLET_BASELINE_V215',
    end: '\nexport function reviewedXenoCombatTabletDigestV215',
    sha256: '280f8ccd71be6398e3e7de46f29762840e224d058596ce794f9a54782d09d93a'
  }
});
export const XENO_TABLET_SPRITE_SUCCESSORS_V216 = freeze({
  "scripts/audit-xeno-combat-tablet-v215.mjs": {
    "kind": "tooling",
    "sha256": "2afde484138be0a8bb84794285ad16b4acf6e9545c271d1ec799cffde84faf42",
    "previousSha256": "56801e63d5d6e27a6bf462f2e02d2fab623ddb3e6f6c6f703d4929f8ade03000"
  },
  "scripts/verify-aliens1986-main-succession-v116.mjs": {
    "kind": "tooling",
    "sha256": "473bb9c1dc9ab428480d19197bf3e713437c7f1d253e96e2bb6543aaedaac7c9",
    "previousSha256": "f029396e4e2368c372a770ba50ad5feb0702feb4aca8e5ade9be89ab87582511"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "1b4ed44709761becd17495f136b4ab954eae14f96fad816de3460080a51071c8",
    "previousSha256": "e4b2ab44609051ae5f3d5a30502fc0ee62a6344e412aeb5951dbd0d800b7308b"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "550184b33bdaead8e5b3a5d518423a407d3eec56f6daff6bb2c5fdcb6dd66435",
    "previousSha256": "63f0832ac9579e30bbd4c2be390a7b979fb0188bfc89c14d2c048aca315ba7fb"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "tooling",
    "sha256": "f5195d0c2083be19906408886461695dfc64dd0848a4dc05952c793c30994fb0",
    "previousSha256": "3be295e570f006c7414d5949609c41b739bf71a53f35e0ca17903b444460b5e6"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "4a5d820656d96e7c593392d1604e7e8fb960ef1a23e1a331728ad15f43543242",
    "previousSha256": "901e53e131b94c15633fb02f6a59a154c18310879c27ad3782cacbc74ff5494b"
  },
  "scripts/verify-river-of-pain-succession.mjs": {
    "kind": "tooling",
    "sha256": "ea2c2e9e9169f6d4ba492050e58bb917693f8c10a45269f826e647e72e932aaf",
    "previousSha256": "2e1cfb67bf1477cc858f2285ca78b54cb8acd69c92ec2e9626fc463943db3d06"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "tooling",
    "sha256": "3838a13bec409163066be3c4bfa57f7b710e033f22f0b4357d6c395c44f0e220",
    "previousSha256": "06e2f7de056a3756e87ceec9f8c4d6dcacd1d53249c14dc6399433f8d97090cb"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "tooling",
    "sha256": "f85e7cc5295ed0de89d7c5cd316e4fc71d3036684cb0f1cf8968d90a8754164c",
    "previousSha256": "4a5d087e4dd8e0aa46e250ad9aae975ff7b115dc69269557c7a61f07918cd9d4"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "tooling",
    "sha256": "5b853515d8bdc29f6a3f8034943b2fbdf600160d43927b38f7c4f52af168738f",
    "previousSha256": "ff4afbea5355f43a7a2cbc49b59ccddff355066b4929e8a5646d83dcc527a43b"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "tooling",
    "sha256": "162adde8818ae1478426ece0a544f3a5ba6fc5aec101e018d0433f6d84342598",
    "previousSha256": "f1959ae5a8715987a2f2d47525b45af65917e43d4d882f88d47efaa0dff89d24"
  },
  "scripts/verify-xeno-gameplay-audit-v208.mjs": {
    "kind": "tooling",
    "sha256": "5bfb4438e0e74a0e4fa7926bf77d9333bf60323f8a2f581c0e477c032b629e9e",
    "previousSha256": "9fa11a2f6b3554fed9935449b664d0a2b1df814232816f76ad522f4611d87ca1"
  },
  "scripts/verify-xeno-gameplay-audit-v209.mjs": {
    "kind": "tooling",
    "sha256": "285cddb33df9fe96e0db2a3cef810949613e7594076a088b7b956df0fa79845f",
    "previousSha256": "436eb1027392626af81c16dd93e0342d66f5032fe4320539497dd7fc339cfbe3"
  },
  "scripts/verify-xeno-gameplay-audit-v213.mjs": {
    "kind": "tooling",
    "sha256": "ab02cf74d9f7202b841645fce0d6b6460e8004671e3b2778a48dce3e7c1cc6f0",
    "previousSha256": "d2245d1ad77ec32801b7d570c95c6ab5915450e0464f65ca94a75dba434405ea"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "tooling",
    "sha256": "beb70253df1ca2bb91042642703bc0bd8eee039ca10851baaa79f1bfe1e60b1b",
    "previousSha256": "997a72a4af35d76136b518711733f8d22a069c6b816a8352e5eb0e356d7dfd95"
  },
  "scripts/verify-xeno-priorities-audit-v201.mjs": {
    "kind": "tooling",
    "sha256": "166e22cf77aa4f2edae1315b2319fb931e52b19b8f6fa07c5d5077f4f842821f",
    "previousSha256": "3c728d93d627e2707b8e467220d0d596d67924be24fb849e1374c7abe6170f50"
  },
  "scripts/verify-xeno-priorities-audit-v202.mjs": {
    "kind": "tooling",
    "sha256": "f5007d163c2f0b2d3424c4171a5f6e819a6ec4ea3e67eb3a4b1d7105c6072d9c",
    "previousSha256": "6c372017b1f76a15990c5650406f7b24dd7a31b0f32179e5e7b4fae8d6c5247f"
  },
  "scripts/verify-xeno-priorities-audit-v203.mjs": {
    "kind": "tooling",
    "sha256": "93bba319ea2a7fe58b1eb20e6ab6333bd033d0124efae4d2f05d104b3d44cef8",
    "previousSha256": "2172d5d338c0eedf178f785d7d58ba153071e992a6042be380cb85745c646b5f"
  },
  "scripts/verify-xeno-priorities-audit-v204.mjs": {
    "kind": "tooling",
    "sha256": "8026f2bbcfa4976c71d523f368b8f412cd5c3203c08509a45f582f0ccecd7147",
    "previousSha256": "f1c3009b946614557f332897cd7aa1f0c6fb03db41f1d18e373cbb7698b079e4"
  },
  "scripts/verify-xeno-production-assets-v206.mjs": {
    "kind": "tooling",
    "sha256": "5be567f7a6d0b00bb4046d6f19aee9c300e76b5a26136bd5bdf2faa65eb82858",
    "previousSha256": "0b29c9d3d262b928b0c79786ade2a465de008ef5ba68d1c03616af6fb351bdb3"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "tooling",
    "sha256": "9d2acedc24d3c71e88b87bf6f6b81fc24a90e324a5113d838d94da71d3a172de",
    "previousSha256": "60120d936c77a3651c1ccdf4aae68dbf1f52455c8ed750e9ec2465e1d6e17c8f"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "tooling",
    "sha256": "217ae5d243066057e4ab97ee1b51c7fcdf22dbc29e6c11dd094acf9fb12b1c54",
    "previousSha256": "7f0c40dd35ba1c3d84a6cbcb3be46f2ede013bbbeffa7fb8b2df021751938b53"
  },
  "scripts/verify-xeno-standalone-audit-v207.mjs": {
    "kind": "tooling",
    "sha256": "4868c7e2a5e02de49942f2c59853bfd994f9e2adb7a62faa70cce693842a81c8",
    "previousSha256": "311e82e2b408fa953ce08b6044ffc689ae59c0f0100a8e52c367d443b3d8c2c0"
  },
  "scripts/verify-xeno-supers-audit-v200.mjs": {
    "kind": "tooling",
    "sha256": "7a87aed20781dcf3712a0a091fe939e907f63f39219e1bd95c539c5ba415fc7e",
    "previousSha256": "10d9689ac5eb267a0a7a9125b17b5518a3e6c6b89092eb0bc7b6a84f1006d4d2"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "9cc4799c3146635db16817c0da856e8fd4df0914564a5fbf316f980e7160707f",
    "previousSha256": "909b596d28844a99127a204d33538998bf95869050d05bfa3fdcd12eca67f875"
  },
  "scripts/verify-xeno-visual-assets-audit-v205.mjs": {
    "kind": "tooling",
    "sha256": "9affa51cb18ba9a31e837a21a5c24e3d0801c5f617c8c7fa395aebe1eff6def4",
    "previousSha256": "756e52f42c3ff1dd151d2c13220bddbcc87eb9e2c7f7aaf58331436ba1368863"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "0181d0e53ef48d10d65eee3cc085320497d37da27b607dc05422c5f65a4672dc",
    "previousSha256": "4d1d02071bba4e81aaf84e974d4b297e3835a1b524611e9d3db24606e0b5ab84"
  },
  "xeno-trials-fullscreen-v119.css": {
    "kind": "runtime",
    "sha256": "cf4165644ec0371429b7bb750efed16196cf3ab8dd447298fdc2b2beb64cff3d",
    "previousSha256": "bfe1febbfd066da02bd21e40a683835ad8d978e39baa57ad4efb9e1ab99088c1"
  }
});
export const XENO_TABLET_SPRITE_NEW_INPUTS_V216 = freeze({
  "assets/openai/xeno-trials-v216/tablet-chassis.png": {
    "kind": "asset",
    "sha256": "1f46d9031d89f6afa06503606e8cf447611489ff1741d0c228e892f874ed4dbe"
  }
});

export function reviewedXenoTabletSpriteDigestV216(path, endpoint) {
  if (!Object.hasOwn(XENO_TABLET_SPRITE_SUCCESSORS_V216, path)) return reviewedXenoTrialsDigestV217(path, endpoint);
  const receipt = XENO_TABLET_SPRITE_SUCCESSORS_V216[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V215 endpoint for V216: ' + path);
  return reviewedXenoTrialsDigestV217(path, receipt.sha256);
}

export function xenoTabletSpriteRuntimeSourcesV216(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_TABLET_SPRITE_SUCCESSORS_V216)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoTrialsDigestV217(path, receipt.sha256);
    if (result[path] !== undefined && result[path] !== receipt.sha256 && result[path] !== current)
      reviewedXenoTabletSpriteDigestV216(path, result[path]);
    result[path] = current;
  }
  return xenoTrialsRuntimeSourcesV217(result);
}

export function verifyXenoTabletSpriteV216(readSource = readRepository) {
  const successors = Object.entries(XENO_TABLET_SPRITE_SUCCESSORS_V216);
  const inputs = Object.entries(XENO_TABLET_SPRITE_NEW_INPUTS_V216);
  assert.ok(successors.length > 0 && inputs.length > 0, 'Incomplete V216 source freeze');
  const paths = new Set(['scripts/audit-xeno-tablet-sprite-v216.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V216 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V216 receipt: ' + path);
    paths.add(path);
    assert.ok(isHash(receipt.sha256), 'Invalid V216 receipt: ' + path);
    assert.equal(sha(readSource(path)), reviewedXenoTrialsDigestV217(path, receipt.sha256), 'Unreviewed V216 source bytes: ' + path);
  }
  for (const [path, receipt] of successors) {
    assert.ok(['runtime', 'tooling'].includes(receipt.kind), 'Invalid V216 successor kind: ' + path);
    assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V216 predecessor: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(receipt.kind === 'asset' && path.startsWith('assets/openai/xeno-trials-v216/'), 'Invalid V216 art input: ' + path);
    assert.ok(!Object.hasOwn(receipt, 'previousSha256'), 'V216 art input has a predecessor: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_TABLET_SPRITE_DECLARATIONS_V216)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V215 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V215 declarations changed: ' + path);
  }
  verifyXenoTrialsV217(readSource);
  return Object.freeze({ baseline: XENO_TABLET_SPRITE_BASELINE_V216, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
