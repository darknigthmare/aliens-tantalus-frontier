import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { reviewedXenoTrialsDigestV223, xenoTrialsRuntimeSourcesV223, verifyXenoTrialsV223 } from './audit-xeno-trials-v223.mjs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_TRIALS_BASELINE_V222 = '88362fabe1a9d216085afa1337057517a5cf1f84';
export const XENO_TRIALS_DECLARATIONS_V222 = freeze({
  'scripts/audit-xeno-trials-v221.mjs': {
    start: 'export const XENO_TRIALS_BASELINE_V221',
    end: '\nexport function reviewedXenoTrialsDigestV221',
    sha256: 'e18cc804842b12b0a11e2fabd9ac1c57591581a1777b4c977af8aa865e743516'
  }
});
export const XENO_TRIALS_SUCCESSORS_V222 = freeze({
  "package.json": {
    "kind": "tooling",
    "sha256": "8fde5b17479d22a699430fe33052f7b1465c8cfe93bfda593459fe068e6ad0d1",
    "previousSha256": "e75c6369e6087d7337700e08d8fa822e4bb61e293be08e8b6b5391df50c44967"
  },
  "scripts/audit-xeno-trials-v221.mjs": {
    "kind": "tooling",
    "sha256": "a88b38c1057284510447a91e460590ebaf96404767f8c9540ec4c18473fc1a51",
    "previousSha256": "9ef16dff3e1ec9b0e9ed3f4cba765f05576d14a85d5c1820e2276c93e81d5559"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "982c92f53f9bef94eb8d70d0b4ed8de3105257e882d38f3ec16379d885da07e2",
    "previousSha256": "a280d24069a8ac2ff3745b15a631c121647f1d9739626bb4bf24354daeb71f73"
  },
  "scripts/public-xeno-pose-admissions-v209.mjs": {
    "kind": "tooling",
    "sha256": "9efbe85dba8e740940bb133195cc6c0da3b149ab67101dcff9401b96ef4b9e65",
    "previousSha256": "abc6f184dc0a469073bc581e53d7eecfede3a99877e060c32bdc83e517ed9a68"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "b070b1a2686ea0570866621f0bb74e60ab1050b98f2141ba687cb1ef80c7ab97",
    "previousSha256": "d9062885817308416ba57b66ee5f44843dde55d80e3043b4ade77647856099d1"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "376da2b578908b00e0c6539e5395904ed603ae59b486f0796536963b6828cac2",
    "previousSha256": "1fc4a107d7f445e79966289702c6c406d67fdbfab6b911dc121dcbfd5c147665"
  },
  "scripts/verify-xeno-gameplay-audit-v213.mjs": {
    "kind": "tooling",
    "sha256": "b664d7915929ba9ae65efd494c6a4358a30e75a6437e2e5bd24c354d01a618b5",
    "previousSha256": "6b4415fa2c48fdcb9b10d7246bef69324594e7726e1c12c629f37b4d00580ba9"
  },
  "scripts/verify-xeno-trials-artifact-v207.mjs": {
    "kind": "tooling",
    "sha256": "26fe04be86cf3882799229ebacc6b18375f43d9f12b5b374c6cf42b8e0e73317",
    "previousSha256": "5608af5cc6e1bfd2e6f879162dca48733bb30c85bb16d78ded7a23ea5c51bc5f"
  },
  "scripts/verify-xeno-trials-horde-minigames-v213.mjs": {
    "kind": "tooling",
    "sha256": "eb132d9115e63b82b682d28866fbac75dfcd66633554ea97ff8e258d902e0062",
    "previousSha256": "e6abbef2f335140a8604661720d70e20c4766e6594bfaa6dbc45db54e4b687b9"
  },
  "scripts/verify-xeno-trials-poses-v209.mjs": {
    "kind": "tooling",
    "sha256": "41a0588e30752479e2b66cff7f9d9ffd4d8adfd5debd329627bd3d87563c4ecc",
    "previousSha256": "10d7e1fc1992a5e38723ff9d88b86c3ef21d816b11c9186cec485962b2a099e0"
  },
  "scripts/verify-xeno-trials-priority-actions-v204.mjs": {
    "kind": "tooling",
    "sha256": "766730cc79eaf034659e1ef16edc64cfc5d911ca8b0e495805fd0a7ace3561ce",
    "previousSha256": "6d908a0172ddbb7b5789ecf5627546d001eca09230347ac791213ff223bf1389"
  },
  "scripts/verify-xeno-trials-supers-v148.mjs": {
    "kind": "tooling",
    "sha256": "52f234925569de1db69eabe6ba06829176645549fd3b4b686ae5471f410f399d",
    "previousSha256": "52d4cb9ef863bfe2968c50af0f6a1c919d3ecc0868a243b0acac9487df7a5f96"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "sha256": "421fa650c43b6c16cd800dcba13681c47319a887f593d7b2c67c1e8cf1f3b0cf",
    "previousSha256": "843a8ec4f1283efabafa591529251b2bf25e38bcff786b2dbad6d35eebd10121"
  },
  "src/xeno-trials-animation-coverage-v199.js": {
    "kind": "runtime",
    "sha256": "7a201f078f663f645ee71c419e2e96dcba2a21a88908e160eb2001b4a11d0d28",
    "previousSha256": "844057c3c3c64b4d9261ddda32db98cd4da9b2ab60b471fc5f9a4d002e9b3e85"
  },
  "src/xeno-trials-finishers-v207.js": {
    "kind": "runtime",
    "sha256": "d145aac98b27459343724967aa66ca52275f6acdee903ea628ebadaeeeb35ab0",
    "previousSha256": "0a132604326512cf66a6dbb7f83147d81ba9637c8f16a8a1e2bd22e8f65be6b9"
  },
  "src/xeno-trials-finishers-v211.js": {
    "kind": "runtime",
    "sha256": "4ef7373fe8140669de661f5e3fc070410fab5717d347d5dabeb0ac82b7ffddad",
    "previousSha256": "495ad3331bee061f41542897ad38cba63b1b87d0d2f182b6d1a59efec7804bdd"
  },
  "src/xeno-trials-horde-minigames-v213.js": {
    "kind": "runtime",
    "sha256": "32d5df2c25239450963912cdf2366515ff61ea292d7cd62fea7e372ce5f89225",
    "previousSha256": "b57f7802d9bb65ae501c673cf706b53fa449917252d451626b647ecf73d79116"
  },
  "src/xeno-trials-operation-presentation-v188.js": {
    "kind": "runtime",
    "sha256": "95e9e40702f3e4c13662c8acff6f8f8c633eb48f29ac76f3732711cdbaa64d2d",
    "previousSha256": "727a0a88ebc96f6416fa91d901e701b79a3fc1a09123e4c3a1b61a459924f02d"
  },
  "src/xeno-trials-operations-v188.js": {
    "kind": "runtime",
    "sha256": "79db261079e371f79e33addfc2f004c8fd16d2df3183b9fc98ebc5f2fb29938b",
    "previousSha256": "878067cbc58acccb16fe1382304ca063dc4a80a89ccb1339acf9ef2428af0411"
  },
  "src/xeno-trials-poses-v209.js": {
    "kind": "runtime",
    "sha256": "02495d604e3bd4474ab29a2dfb9a2036e20f1b515022306ff63694be6069b48d",
    "previousSha256": "6f5f050f702d5c0561e2005af8c110edf2bab5c8e79b91ac6a42e45c4b900361"
  },
  "src/xeno-trials-practice-v207.js": {
    "kind": "runtime",
    "sha256": "0824976df264dbf164b518c3c8f169e335aeae62b5d25b17325c374abb645d4b",
    "previousSha256": "d0800cf5e48963628fce591627110a74a5220e56cda045e6ed1d0a262c7a0f41"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "sha256": "6b6fd2a31d67a1be9ab2b0042bc6f7202a35700e11fc6ba544b35cdad4333e48",
    "previousSha256": "cd68d9ea59a25698b75984ee93c5a5a58f96fc880067d6274a8ba927fea55208"
  },
  "src/xeno-trials-stage-events-v211.js": {
    "kind": "runtime",
    "sha256": "6768ae08c8f82d95b56e97651b25a4e1359f36039644879a986f64dc979bb51f",
    "previousSha256": "f418339dd630561be3b9850bb99dce9dc566b8713a4e0cdc83472cb4bea75593"
  },
  "src/xeno-trials-standalone.js": {
    "kind": "runtime",
    "sha256": "c86ab30299471a73432bb4c34f679048d0b1ddea17e6cf181f634ed942abfdd3",
    "previousSha256": "106be7275941c68c2f330bc00280814a9919a6aa7436702dcb262ec0ece77770"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "9818503b63ddd4fe0d55caf63cdf05178b027773010b9a1b9891c422edf2817a",
    "previousSha256": "69948dbfa198f06f1197a8a0a8a6dbff0e7a51dc5a008e53de9606662237ee54"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "d3db8f435e0032158d40dece84060f87b60a843b8274d6a2b1d9ae9bf9b82ba3",
    "previousSha256": "d0f09d58025b757631260c7822c91d22a09659c31f7a1f7e09e9f6053f36c08f"
  },
  "xeno-trials-fullscreen-v119.css": {
    "kind": "runtime",
    "sha256": "5712579ed9a15006b6dc70374d5834c08e04dd5786b340c512ecf8a4a519d478",
    "previousSha256": "96401d0b9c4deb7dcb6e7854b445cf878d807ae17ac7c286ac7642cc5eb6345b"
  }
});
export const XENO_TRIALS_NEW_INPUTS_V222 = freeze({
  "assets/openai/xeno-trials-menu-v222/fighter.webp": {
    "kind": "asset",
    "sha256": "e6130c6138e9e295065c28eacde53108803886c406934a1cb0ace3dc72d4ce83"
  },
  "assets/openai/xeno-trials-menu-v222/stage.webp": {
    "kind": "asset",
    "sha256": "35f51fa08a4608c833fab3837278a6366e788386b5ac4f05f820e6c41dc2c04a"
  },
  "assets/openai/xeno-trials-v209/characters/gorilla-special-recovery.png": {
    "kind": "asset",
    "sha256": "59d0d2ab8bf46f3b0187d829c2cb24989a3e3126a526fec36caf7a0982d5e95c"
  },
  "assets/openai/xeno-trials-v209/characters/gorilla-special-windup.png": {
    "kind": "asset",
    "sha256": "0f3490592578c5cd56fb5a0a74259928e57e7f3f464edea5ce4ff29a39d29c1f"
  },
  "assets/openai/xeno-trials-v209/characters/grid-heavy-impact.png": {
    "kind": "asset",
    "sha256": "2a765adbab34ae6cc0ebb8a43b1801bdbc6ceaeb282c11b0f358558fe420e92c"
  },
  "assets/openai/xeno-trials-v209/characters/grid-heavy-recovery.png": {
    "kind": "asset",
    "sha256": "573bd6642150f3a313dc77a08fd3a57d82260ebf83c40694115b969405ee8369"
  },
  "docs/forge/xeno-trials/V222-GAMEPLAY.md": {
    "kind": "documentation",
    "sha256": "3c28ebd58120979625d7f2641decc0ebca2f08498a93dcb635c89bb0ecccb45f"
  },
  "scripts/generate-xeno-trials-menu-media-v222.mjs": {
    "kind": "tooling",
    "sha256": "fcb89df6476ba802bf4fca104b8c8d91af81391a4be002c079f832c41912c074"
  },
  "scripts/verify-xeno-trials-finishers-v222.mjs": {
    "kind": "tooling",
    "sha256": "a0cafa06d7e8ba657caac353d046e0b6ad9b0398e35d52fbbfbcf0cc15fdc013"
  },
  "scripts/verify-xeno-trials-gantry-convoy-v222.mjs": {
    "kind": "tooling",
    "sha256": "7a04fdd7d0446117d108311e8cc2d71af0f3b1f38e831520b104c7e1093d8f27"
  },
  "scripts/verify-xeno-trials-menu-media-v222.mjs": {
    "kind": "tooling",
    "sha256": "00a065f5f68c89f99ce5cb9cce6a2a804ce292166a6dc2413989a960f4132e15"
  },
  "scripts/verify-xeno-trials-practice-v222.mjs": {
    "kind": "tooling",
    "sha256": "85cda77a1f5b1b0c4d5d9dfc6e8040ba20e7c12b7a8a37cd9344c073ef5638c5"
  },
  "src/xeno-trials-finishers-v222.js": {
    "kind": "runtime",
    "sha256": "146e1dd28049356d000c30b746fa3b30c057d0ee7e49d0bd9b97a2c05172b69d"
  },
  "src/xeno-trials-menu-atlases-v222.js": {
    "kind": "runtime",
    "sha256": "a9010642eb779a041931241e9fd734bcc19030708c47911f941907070e8c5845"
  },
  "src/xeno-trials-menu-media-v222.js": {
    "kind": "runtime",
    "sha256": "7ba940f46d8339ffc5dbd37883a0d5fae0668e76b56428c1f1d611b72d44d134"
  },
  "src/xeno-trials-practice-v222.js": {
    "kind": "runtime",
    "sha256": "0ae78c39e506339e6d751b9a2fd8bb2c8b7dc1b4350e72349bfb1558f66e5e11"
  }
});

export function reviewedXenoTrialsDigestV222(path, endpoint) {
  if (!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V222, path)) return reviewedXenoTrialsDigestV223(path, endpoint);
  const receipt = XENO_TRIALS_SUCCESSORS_V222[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V221 endpoint for V222: ' + path);
  return reviewedXenoTrialsDigestV223(path, receipt.sha256);
}

export function xenoTrialsRuntimeSourcesV222(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V222)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoTrialsDigestV223(path, receipt.sha256);
    if (result[path] !== undefined && result[path] !== current) reviewedXenoTrialsDigestV222(path, result[path]);
    result[path] = current;
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V222)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoTrialsDigestV223(path, receipt.sha256);
    if (result[path] !== undefined) assert.equal(result[path], current, 'Incorrect V222 runtime input: ' + path);
    result[path] = current;
  }
  return xenoTrialsRuntimeSourcesV223(result);
}

export function verifyXenoTrialsV222(readSource = readRepository) {
  const successors = Object.entries(XENO_TRIALS_SUCCESSORS_V222);
  const inputs = Object.entries(XENO_TRIALS_NEW_INPUTS_V222);
  assert.ok(successors.length > 0, 'Incomplete V222 source freeze');
  const paths = new Set(['scripts/audit-xeno-trials-v222.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V222 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V222 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256),
      'Invalid V222 receipt: ' + path);
    assert.equal(sha(readSource(path)), reviewedXenoTrialsDigestV223(path, receipt.sha256), 'Unreviewed V222 source bytes: ' + path);
  }
  for (const [path, receipt] of successors) {
    assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V222 predecessor: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(!Object.hasOwn(receipt, 'previousSha256'), 'V222 input has a predecessor: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_DECLARATIONS_V222)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V221 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V221 declarations changed: ' + path);
  }
  verifyXenoTrialsV223(readSource);
  return Object.freeze({ baseline: XENO_TRIALS_BASELINE_V222, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
