import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_TRIALS_BASELINE_V221 = '410771c1f48c515a2361adb613a34c2406323f65';
export const XENO_TRIALS_DECLARATIONS_V221 = freeze({
  'scripts/audit-xeno-trials-v220.mjs': {
    start: 'export const XENO_TRIALS_BASELINE_V220',
    end: '\nexport function reviewedXenoTrialsDigestV220',
    sha256: 'cf499d8260b9b978e90e86babd9bcbfc8d532467cfd4e5f34156492904d3a93c'
  }
});
export const XENO_TRIALS_SUCCESSORS_V221 = freeze({
  "package.json": {
    "kind": "tooling",
    "sha256": "e75c6369e6087d7337700e08d8fa822e4bb61e293be08e8b6b5391df50c44967",
    "previousSha256": "d8dacd07c50fe829a6a5960dbf59007b4fde0bcd591b7d79e49b00cdda23e591"
  },
  "scripts/audit-xeno-trials-v220.mjs": {
    "kind": "tooling",
    "sha256": "882fe81d1ed26a538193c0218266d09a11259e85f672f39a3af957992d918f4f",
    "previousSha256": "eae6484feac6b320754bacc44f689f46a1f7b6c3404066fc293c528171bbbf05"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "a280d24069a8ac2ff3745b15a631c121647f1d9739626bb4bf24354daeb71f73",
    "previousSha256": "9fde68a57c0362c314216d89053e5b1b0ebfc903f670f94f635c754e7fea3f6b"
  },
  "scripts/public-xeno-pose-admissions-v209.mjs": {
    "kind": "tooling",
    "sha256": "abc6f184dc0a469073bc581e53d7eecfede3a99877e060c32bdc83e517ed9a68",
    "previousSha256": "60b5a2a4d230ca34e387ecedfb44e14dd7474a873b371f13fa5666ac3bb7fd50"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "d9062885817308416ba57b66ee5f44843dde55d80e3043b4ade77647856099d1",
    "previousSha256": "218c3228cc6bb29be62ded8a21b7554ccb254bb732d20c9e09e7f5ce5a2eda4b"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "1fc4a107d7f445e79966289702c6c406d67fdbfab6b911dc121dcbfd5c147665",
    "previousSha256": "ae6dd9991efd38be8eb87ce98bdf23367b4a0e074210f92050120f87e518fb2c"
  },
  "scripts/verify-trials-navigation-v163.mjs": {
    "kind": "tooling",
    "sha256": "ec2084f970fb886d0a3297a33a8f2a4d3b7152d9f576cdb59713577671626a5e",
    "previousSha256": "2e1c54cd6751047db5157ce7cd25276a82e15cd5d7e1117c540d395621736181"
  },
  "scripts/verify-xeno-gameplay-audit-v213.mjs": {
    "kind": "tooling",
    "sha256": "6b4415fa2c48fdcb9b10d7246bef69324594e7726e1c12c629f37b4d00580ba9",
    "previousSha256": "c0194542a8832f8ac11289606b708944fd80892db384f3eea7315141b8e1d83c"
  },
  "scripts/verify-xeno-trials-castes-v151.mjs": {
    "kind": "tooling",
    "sha256": "c19f6ec4d05a7e252f9dd33e6ca1f539caafb4f19075b6913054a2f0c55136e0",
    "previousSha256": "7431d76647b0d4b4c108faa6584d9c0b35c6a7e758c3802094092cd9fff5f48c"
  },
  "scripts/verify-xeno-trials-grapple-v153.mjs": {
    "kind": "tooling",
    "sha256": "3ee6f7c175061a97b5656c4f35a2782af105ccc7523b6db3d681fe7185baecd3",
    "previousSha256": "7d9bfb26ad6b0aeea3b21ae0d7c60774a74780b9f2f49bb10a9b8dd4aa54ba76"
  },
  "scripts/verify-xeno-trials-horde-minigames-v213.mjs": {
    "kind": "tooling",
    "sha256": "e6abbef2f335140a8604661720d70e20c4766e6594bfaa6dbc45db54e4b687b9",
    "previousSha256": "8f20cdfbcfc72f89629d0c3f551e7c732efbe6a6fa8c7b50ff6287fe80645e46"
  },
  "scripts/verify-xeno-trials-poses-v209.mjs": {
    "kind": "tooling",
    "sha256": "10d7e1fc1992a5e38723ff9d88b86c3ef21d816b11c9186cec485962b2a099e0",
    "previousSha256": "48b6b11bacb3179ae8fdf1020ddc4dbc5a49be379e9dff85862f96d539875bf2"
  },
  "scripts/verify-xeno-trials-priority-actions-v204.mjs": {
    "kind": "tooling",
    "sha256": "6d908a0172ddbb7b5789ecf5627546d001eca09230347ac791213ff223bf1389",
    "previousSha256": "60b321291a062f2acbb0ccab790804cf11a89a144c677c98584ce1cd2835acac"
  },
  "scripts/verify-xeno-trials-signatures-v147.mjs": {
    "kind": "tooling",
    "sha256": "c6195533e405473fc07dc53f6d52b5043261dde07c70bdc1226db6765c6afe57",
    "previousSha256": "cc07ea22c0520bbd88cf1a0319cdbd8b6d41f83166e7790764e013293543cf7e"
  },
  "scripts/verify-xeno-trials-spatial-outro-v220.mjs": {
    "kind": "tooling",
    "sha256": "85e21f6c65e840ac316db0d99993a471f246248e3d46ce227eeb198a60dab111",
    "previousSha256": "f57f085aa3a84ada50b833eb376a2ade96237a61cac4043dc665cd7572c67be3"
  },
  "scripts/verify-xeno-trials-supers-v148.mjs": {
    "kind": "tooling",
    "sha256": "52d4cb9ef863bfe2968c50af0f6a1c919d3ecc0868a243b0acac9487df7a5f96",
    "previousSha256": "34c4dc519d8602b3bb8c92e36500251cf79b00722235c46399630134c8b91d34"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "sha256": "843a8ec4f1283efabafa591529251b2bf25e38bcff786b2dbad6d35eebd10121",
    "previousSha256": "04d44d2957c7c0c371d59dff7da7cb0f3ece3d22e5a67cdf2146d5a3d3da84c8"
  },
  "src/xeno-trials-animation-coverage-v199.js": {
    "kind": "runtime",
    "sha256": "844057c3c3c64b4d9261ddda32db98cd4da9b2ab60b471fc5f9a4d002e9b3e85",
    "previousSha256": "0331c15ba3e4bb62768002693021ed6c4b4b871d81ac038917f41984d2613c20"
  },
  "src/xeno-trials-finishers-v207.js": {
    "kind": "runtime",
    "sha256": "0a132604326512cf66a6dbb7f83147d81ba9637c8f16a8a1e2bd22e8f65be6b9",
    "previousSha256": "530cf419647a38889227b2e071d920db05e051c2e4bb1c5f92e5e81baaa9c606"
  },
  "src/xeno-trials-finishers-v211.js": {
    "kind": "runtime",
    "sha256": "495ad3331bee061f41542897ad38cba63b1b87d0d2f182b6d1a59efec7804bdd",
    "previousSha256": "e36b7a98c1faf92275e365f56e0ce5c4e65460cd7f812f9268d6411dc4ca78bb"
  },
  "src/xeno-trials-finishers-v212.js": {
    "kind": "runtime",
    "sha256": "5b3f00dbc0882170d8355d774c1816ae64f0be7ad63a6c3da7c007b5c8e112b0",
    "previousSha256": "96655a9fc5b8b57f34565625e5085e9484edf31086178b78b5eb797ef1868218"
  },
  "src/xeno-trials-horde-minigames-v213.js": {
    "kind": "runtime",
    "sha256": "b57f7802d9bb65ae501c673cf706b53fa449917252d451626b647ecf73d79116",
    "previousSha256": "e257b416190a1654a6afa4c54034ec71b5d2d547687ecfeaabb9e0fca3d146a6"
  },
  "src/xeno-trials-operation-presentation-v188.js": {
    "kind": "runtime",
    "sha256": "727a0a88ebc96f6416fa91d901e701b79a3fc1a09123e4c3a1b61a459924f02d",
    "previousSha256": "d3dcc38335a1c66f248fb74a655129d92aefaa1dc217e964731fed6cf9af7e05"
  },
  "src/xeno-trials-operations-v188.js": {
    "kind": "runtime",
    "sha256": "878067cbc58acccb16fe1382304ca063dc4a80a89ccb1339acf9ef2428af0411",
    "previousSha256": "d257cfae50644bbc7f5dedd4a171f8a83b113b7244c7607bd4e17195540fbdc2"
  },
  "src/xeno-trials-poses-v209.js": {
    "kind": "runtime",
    "sha256": "6f5f050f702d5c0561e2005af8c110edf2bab5c8e79b91ac6a42e45c4b900361",
    "previousSha256": "0afd3041c7fb892e7fec83108e1d016cc9df8bc294dd6fe26dc2a4b38c778e33"
  },
  "src/xeno-trials-practice-v207.js": {
    "kind": "runtime",
    "sha256": "d0800cf5e48963628fce591627110a74a5220e56cda045e6ed1d0a262c7a0f41",
    "previousSha256": "95603e708d6ba92b3dd3eef6845a4c1318147166fbdfb0eb4940c62aed88cb52"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "sha256": "cd68d9ea59a25698b75984ee93c5a5a58f96fc880067d6274a8ba927fea55208",
    "previousSha256": "56ededa3cf1f24c1a1afca9e56d24f1b3aed92d2b159de9b0c51786051f69b78"
  },
  "src/xeno-trials-signatures-v147.js": {
    "kind": "runtime",
    "sha256": "6b9f54733f7d912e3505bca73948a641b4aa7fe187baf2da6528d1b16c8419c5",
    "previousSha256": "6433634ab652c3fbf3daf8cea974ae585f0a2f4041af36cee5f92f731c7fb189"
  },
  "src/xeno-trials-spatial-outro-v220.js": {
    "kind": "runtime",
    "sha256": "5fdb62877830ac8015347671e1f5ebab732ac1922e0c6bd407de37b43164817c",
    "previousSha256": "197cef717513b89a4c0745956460ae316240393735a0099c154b28ab0bddcce0"
  },
  "src/xeno-trials-stage-events-v211.js": {
    "kind": "runtime",
    "sha256": "f418339dd630561be3b9850bb99dce9dc566b8713a4e0cdc83472cb4bea75593",
    "previousSha256": "4d8153d5b5986e9f1a7c8374d0e28a8de8993dc2ab2406e2e98dae84eeb2f3fe"
  },
  "src/xeno-trials-supers-v148.js": {
    "kind": "runtime",
    "sha256": "7bf970b5de90792b14e97f6e6c1e222312fc46923c6e58642a4a7eb138a4835b",
    "previousSha256": "2d115ec7042b141affcdc31e18dd43673cf35a1e4ad9b0b335351c7ea059e9ad"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "69948dbfa198f06f1197a8a0a8a6dbff0e7a51dc5a008e53de9606662237ee54",
    "previousSha256": "f4c6086ae0a1e4e9fb9b445bb6940f3e54f7ab90cd8a82ac17e151a716098085"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "d0f09d58025b757631260c7822c91d22a09659c31f7a1f7e09e9f6053f36c08f",
    "previousSha256": "0f2c6e86b7a23a89ed427726829b9f010fcefdd6ad86ecb2feab3674ff0eebdb"
  }
});
export const XENO_TRIALS_NEW_INPUTS_V221 = freeze({
  "assets/openai/xeno-trials-v209/characters/panther-special-active.png": {
    "kind": "asset",
    "sha256": "44d1dc982a8184f40b8efc5bff31eb6504f86d1eb2ac531cc451274dd0716d40"
  },
  "assets/openai/xeno-trials-v209/characters/panther-special-recovery.png": {
    "kind": "asset",
    "sha256": "b75bc63ac51284d99c42a73fc5077e2312653feafdd86e2ea8f324df4208fb90"
  },
  "assets/openai/xeno-trials-v209/characters/panther-special-windup.png": {
    "kind": "asset",
    "sha256": "d594c9581134d92cacdcb9d65ad6622bd2f0b138faf503d42612fe079fb4c09a"
  },
  "docs/forge/xeno-trials/V221-GAMEPLAY.md": {
    "kind": "documentation",
    "sha256": "e9989f4d348c9b7d70a1cd4198b7b76ffe12eb106eb58c546152bbb15d6e937e"
  },
  "scripts/verify-xeno-trials-finishers-v221.mjs": {
    "kind": "tooling",
    "sha256": "b57449c2c360c5291def8d00375241a0183a39944e8cec55ae704ae05a56a407"
  },
  "scripts/verify-xeno-trials-hangar-bypass-v221.mjs": {
    "kind": "tooling",
    "sha256": "9ec4a7281a774f6fdbcb124d955d22155ebe6773bf47c922a666d37db0b671e1"
  },
  "scripts/verify-xeno-trials-practice-v221.mjs": {
    "kind": "tooling",
    "sha256": "806b01ff6c781c20408f31421fb61956061239cc495009929693d98e44c83ca1"
  },
  "src/xeno-trials-finishers-v221.js": {
    "kind": "runtime",
    "sha256": "5ca9116fddc0259cdaa51483d5bb259601c2b8399215acf210b32461b20788aa"
  },
  "src/xeno-trials-practice-v221.js": {
    "kind": "runtime",
    "sha256": "8baf1f29fede76bd5a5cef444025b5934b1fb448ec93426f52a96ba51134d0e5"
  }
});

export function reviewedXenoTrialsDigestV221(path, endpoint) {
  if (!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V221, path)) return endpoint;
  const receipt = XENO_TRIALS_SUCCESSORS_V221[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V220 endpoint for V221: ' + path);
  return receipt.sha256;
}

export function xenoTrialsRuntimeSourcesV221(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V221)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.sha256) reviewedXenoTrialsDigestV221(path, result[path]);
    result[path] = receipt.sha256;
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V221)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined) assert.equal(result[path], receipt.sha256, 'Incorrect V221 runtime input: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoTrialsV221(readSource = readRepository) {
  const successors = Object.entries(XENO_TRIALS_SUCCESSORS_V221);
  const inputs = Object.entries(XENO_TRIALS_NEW_INPUTS_V221);
  assert.ok(successors.length > 0, 'Incomplete V221 source freeze');
  const paths = new Set(['scripts/audit-xeno-trials-v221.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V221 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V221 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256),
      'Invalid V221 receipt: ' + path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V221 source bytes: ' + path);
  }
  for (const [path, receipt] of successors) {
    assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V221 predecessor: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(!Object.hasOwn(receipt, 'previousSha256'), 'V221 input has a predecessor: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_DECLARATIONS_V221)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V220 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V220 declarations changed: ' + path);
  }
  return Object.freeze({ baseline: XENO_TRIALS_BASELINE_V221, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
