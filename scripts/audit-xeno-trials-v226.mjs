import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { reviewedXenoTrialsDigestV227, xenoTrialsRuntimeSourcesV227, verifyXenoTrialsV227 } from './audit-xeno-trials-v227.mjs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_TRIALS_BASELINE_V226 = '626945f65112c165f1ee469af200479f0e4f3971';
export const XENO_TRIALS_DECLARATIONS_V226 = freeze({
  "scripts/audit-xeno-trials-v225.mjs": {
    "start": "export const XENO_TRIALS_BASELINE_V225",
    "end": "\nexport function reviewedXenoTrialsDigestV225",
    "sha256": "a425119cfd66e7c285e30d39080bfe4337ef7ec331219b8ac402ad7e60c23081"
  }
});
export const XENO_TRIALS_SUCCESSORS_V226 = freeze({
  "package.json": {
    "kind": "tooling",
    "sha256": "39a073b5d71ff447f0b2e9ba264a5153240cc58dc2775c695bec6ad877858239",
    "previousSha256": "9894e127c48f48ccfbe4fa211959954809852bc13966941bb33b4a9f46112ff0"
  },
  "scripts/audit-xeno-trials-v225.mjs": {
    "kind": "tooling",
    "sha256": "e322823dac88e6248b4b230c8f3a92ec099c9653446b1ba987de23321cf9be1d",
    "previousSha256": "42e63ed4793a2f49fc52eb9f497e68344df9a464a53e0a21bdf9c132ef7f7537"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "9eec13ffb01dfaec268c17dc18fd1bf2e1a85137856a0557d119806973ff5f53",
    "previousSha256": "86ca8b409be89f29e58c13968e614bc6d6053e20492ce1638efb8b60b8fa2cc3"
  },
  "scripts/public-xeno-pose-admissions-v209.mjs": {
    "kind": "tooling",
    "sha256": "5ffc1efb4e612d9e3b09668bc96ef9f05e77221b3fadaf7c1ceaa02efe8110aa",
    "previousSha256": "1a840fe14bc73bc325e61f50dacca17f7f54f4c95993494aab11d8e2552e19dc"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "24a0b9ab89caee64a60fc67e9696f19827bac750a06194915f3e012075e6535e",
    "previousSha256": "7139627d918ad836fd7678f35c19dd1a37df5bbf43988732c6c5f9f58e949307"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "aa470e91bd9f86393ae218b66e9f273e01cfa4ff6e0cf97e507f4c903a6e6cce",
    "previousSha256": "b57891db9bbd3042a3c3add5d0d0ef11c4259ff664c81d22f35c9ec25e544f54"
  },
  "scripts/verify-xeno-gameplay-audit-v213.mjs": {
    "kind": "tooling",
    "sha256": "2bc9ab6c3d9e0ffa174ba590fd04554b3acc81624ae4107e9bc0c80971d3af5a",
    "previousSha256": "73f9be6240131ffa0c0fdc68febab18d206cebd0787820f99fbfe69c3ff7f6cc"
  },
  "scripts/verify-xeno-trials-ai-v213.mjs": {
    "kind": "tooling",
    "sha256": "fa5d0cecee081647c4a7e001e7bf06a1b5c79657cc272426d02aa8a1c004a93d",
    "previousSha256": "29777fd6d8e1c36b957f7db9d920c72f8a8cedb09531d2d0ff7e2bad03fbc211"
  },
  "scripts/verify-xeno-trials-horde-minigames-v213.mjs": {
    "kind": "tooling",
    "sha256": "2511d53516df81bffb801a49c477236f447cf6bf5ed27aa76ce7c3d615a834c6",
    "previousSha256": "288847d0fed4c660f8d5b5f41959f72ab821b4cc244c6f6a7a76bcdd0faf959c"
  },
  "scripts/verify-xeno-trials-poses-v209.mjs": {
    "kind": "tooling",
    "sha256": "f7d20fbee0ec66efb1a247356070b081bd31ee0b9e8b175605953bc4125ad36b",
    "previousSha256": "feea22a8379c43127ad2d3bf635ac31899226c65ef9b9db48bcc737d3b996aa0"
  },
  "scripts/verify-xeno-trials-priority-actions-v204.mjs": {
    "kind": "tooling",
    "sha256": "fe0a3f1b9cbfb5dadf6435361c0d1b22223732948e16eaa51f9033323680248e",
    "previousSha256": "766730cc79eaf034659e1ef16edc64cfc5d911ca8b0e495805fd0a7ace3561ce"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "sha256": "163fa67d5b78276433595fa5f292704fbbcdb3c328d99b653be34a3ded16c966",
    "previousSha256": "3c53e725d2708627c6336d78d5aaace000364c22724a3bff8b6719fbaa1dbf9d"
  },
  "src/xeno-trials-ai-v209.js": {
    "kind": "runtime",
    "sha256": "e7ac18e9a2b2816e863a0547adf572e5b5c8afe35f168b354a0a2446b767334f",
    "previousSha256": "ad056c64d49835332434c753689e2836f4880274a0a1fb922949e7afd4ea70a7"
  },
  "src/xeno-trials-horde-minigames-v213.js": {
    "kind": "runtime",
    "sha256": "d801a4dd17074d136bdce8b0a6ca7d33c2ca04657e42c971722061cd32d7ce0e",
    "previousSha256": "ccc45019d52d8989b76661c5083bbb6f071579b05e4bd910441be228e97ab137"
  },
  "src/xeno-trials-operation-presentation-v188.js": {
    "kind": "runtime",
    "sha256": "0daced2fd050c936f2976179d9d6bad24915e4745c61f70332797b2c709d2eb8",
    "previousSha256": "65bd813f85cffe99082b130d2f43fa6b62e39b7a213aa1f9d2ee0230cce4905d"
  },
  "src/xeno-trials-operations-v188.js": {
    "kind": "runtime",
    "sha256": "e2006ea6b3824f144b0d4a75cef230445352e858207cb759b06b5e350aa2169e",
    "previousSha256": "0dbb1242cd31bd54c453edd519492a654ce1951d6335bc2ae3b6fbee25b383a8"
  },
  "src/xeno-trials-poses-v209.js": {
    "kind": "runtime",
    "sha256": "9579413ece34e3d4d9496623cd128018e9dd787db0934dce928373463aed1cdb",
    "previousSha256": "3355574a3c9aa3d563c248396013056a0249d68e8e2f4ae001d0d08097fc5a98"
  },
  "src/xeno-trials-practice-v207.js": {
    "kind": "runtime",
    "sha256": "0b5a8fb2562e90701c8d10de846e8a8a87f1aaeda0174e19da333be3d17366bd",
    "previousSha256": "4d324a3f03acc2d754e65adb250602ac06bdf2f54bfb8c0b350a421b31b27202"
  },
  "src/xeno-trials-progress-v96.js": {
    "kind": "runtime",
    "sha256": "a11b77a02869554dcbbc63858a89548c1feb885ab72a32bc1c0f7cd67d57741b",
    "previousSha256": "596dafae4627afa1340a72cf001e5a65431b7ed47e4ef069e9c655e8657a7fa3"
  },
  "src/xeno-trials-stage-events-v211.js": {
    "kind": "runtime",
    "sha256": "fe38f2b3fd133ce2b9751d4764c08c81f9e95599f457304e61060e9dfafabea4",
    "previousSha256": "7614bad7a2e1180442fbf9179a2bc62ebfacccf6b4d140725bf1aaf885ae9dcd"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "82dca275ec2cf52a3169fcf64b71658f88b5dbeca49e015767c71d3d2c110727",
    "previousSha256": "a4c8791ce07456649654f9bc0f0f44977df4da9eb561ebbdeeac18d20f447ba5"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "f948cd07dedd24d5ac0ca38c1698ce7af7184a41e1cc65e0016a4717ee93ca5a",
    "previousSha256": "f786712d66e1da3c7cad9008eb4225182ce29d96ff71c68a90a3cebb0312ff39"
  }
});
export const XENO_TRIALS_NEW_INPUTS_V226 = freeze({
  "assets/openai/xeno-trials-v209/characters/gorilla-heavy-impact-four-spines.png": {
    "kind": "asset",
    "sha256": "a0f9fda83b209e792008e4c07857b436a8219336f376a32aa1af573c74d7581c"
  },
  "assets/openai/xeno-trials-v209/characters/gorilla-heavy-recovery-four-spines.png": {
    "kind": "asset",
    "sha256": "a3e1185cc5b1232b752d462f51a72e81b71680eaba65f987c5716b6625bb88b7"
  },
  "assets/openai/xeno-trials-v209/characters/gorilla-special-active-four-spines.png": {
    "kind": "asset",
    "sha256": "c41f8334e3155ad4a89806430463797c14bec69248dbce322f7e660a0bf35c43"
  },
  "assets/openai/xeno-trials-v209/characters/grid-heavy-windup-v226.png": {
    "kind": "asset",
    "sha256": "1a070e2b051846445d85379835ed7dca714192a796ac4504d750b6a16c07707f"
  },
  "assets/openai/xeno-trials-v209/characters/grid-special-contact.png": {
    "kind": "asset",
    "sha256": "b59d9e5b7aee600e668dfe3a0a86cfa6250a277cf9ec0293f4dfff0f0dd60084"
  },
  "assets/openai/xeno-trials-v209/characters/panther-light-contact.png": {
    "kind": "asset",
    "sha256": "9013b24f3964d50b68a166b73175d573470a0b24963bea3b1c505d47c12f31bf"
  },
  "docs/forge/xeno-trials/V226-GAMEPLAY.md": {
    "kind": "documentation",
    "sha256": "0708d0086666cb45671659671573f82b9fb3d04953b77746f6d660f867428853"
  },
  "docs/forge/xeno-trials/sprite-production-v226.json": {
    "kind": "documentation",
    "sha256": "4464f5ae88dcd5544970697b9ff558958fb510bf0ed17449fd54d78f35a16445"
  },
  "scripts/verify-xeno-trials-deflector-calibration-v226.mjs": {
    "kind": "tooling",
    "sha256": "5e9a48151f74bc52d843e16fd0db6a18afec91db84e7e1a6e4f154b6dbe42d5b"
  },
  "scripts/verify-xeno-trials-practice-v226.mjs": {
    "kind": "tooling",
    "sha256": "b5142449ecaa61d839769fcde75560de3234eed6ace97585f5cd17c87a520461"
  },
  "src/xeno-trials-deflector-calibration-v226.js": {
    "kind": "runtime",
    "sha256": "1d88f8d2b6560eb257ea04f6454ba308c8f135c3592001f77f1ca75e649aea7b"
  },
  "src/xeno-trials-practice-v226.js": {
    "kind": "runtime",
    "sha256": "bc2844db46b6764c1d1165f7e25af6c76020a4b1116bf2332d65fe584c01d527"
  }
});

export function reviewedXenoTrialsDigestV226(path, endpoint) {
  if (!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V226, path)) return reviewedXenoTrialsDigestV227(path, endpoint);
  const receipt = XENO_TRIALS_SUCCESSORS_V226[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V225 endpoint for V226: ' + path);
  return reviewedXenoTrialsDigestV227(path, receipt.sha256);
}

export function xenoTrialsRuntimeSourcesV226(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V226)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoTrialsDigestV227(path, receipt.sha256);
    if (result[path] !== undefined && result[path] !== current) reviewedXenoTrialsDigestV226(path, result[path]);
    result[path] = current;
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V226)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoTrialsDigestV227(path, receipt.sha256);
    if (result[path] !== undefined) assert.equal(result[path], current, 'Incorrect V226 runtime input: ' + path);
    result[path] = current;
  }
  return xenoTrialsRuntimeSourcesV227(result);
}

export function verifyXenoTrialsV226(readSource = readRepository) {
  const successors = Object.entries(XENO_TRIALS_SUCCESSORS_V226);
  const inputs = Object.entries(XENO_TRIALS_NEW_INPUTS_V226);
  assert.ok(successors.length > 0, 'Incomplete V226 source freeze');
  const paths = new Set(['scripts/audit-xeno-trials-v226.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V226 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V226 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256),
      'Invalid V226 receipt: ' + path);
    assert.equal(sha(readSource(path)), reviewedXenoTrialsDigestV227(path, receipt.sha256), 'Unreviewed V226 source bytes: ' + path);
  }
  for (const [path, receipt] of successors) {
    assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V226 predecessor: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(!Object.hasOwn(receipt, 'previousSha256'), 'V226 input has a predecessor: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_DECLARATIONS_V226)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V225 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V225 declarations changed: ' + path);
  }
  verifyXenoTrialsV227(readSource);
  return Object.freeze({ baseline: XENO_TRIALS_BASELINE_V226, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
