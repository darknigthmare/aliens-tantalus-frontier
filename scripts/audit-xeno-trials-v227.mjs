import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { reviewedXenoTrialsDigestV228, xenoTrialsRuntimeSourcesV228, verifyXenoTrialsV228 } from './audit-xeno-trials-v228.mjs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_TRIALS_BASELINE_V227 = 'ae84b7dcfbf3bd28cbf2c901b1e7e56c14111998';
export const XENO_TRIALS_DECLARATIONS_V227 = freeze({
  "scripts/audit-xeno-trials-v226.mjs": {
    "start": "export const XENO_TRIALS_BASELINE_V226",
    "end": "\nexport function reviewedXenoTrialsDigestV226",
    "sha256": "5f8a48010ccb081d93c6495a1072f50a240b819f88f45f3b8d8de7b00e838dca"
  }
});
export const XENO_TRIALS_SUCCESSORS_V227 = freeze({
  "package.json": {
    "kind": "tooling",
    "sha256": "753d656376887b0d35393fd0ed9be451a878a47648707cbd8959921d358b42ab",
    "previousSha256": "39a073b5d71ff447f0b2e9ba264a5153240cc58dc2775c695bec6ad877858239"
  },
  "scripts/audit-xeno-trials-v226.mjs": {
    "kind": "tooling",
    "sha256": "e6cbebabd509a3b878356b4940135c746dce484611454dbff45d0d25eaad664d",
    "previousSha256": "a7cbce200f98b60e318a666eb60501effb2ee3dd3a2488eea8a5b7f7f667c30e"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "638ad4b4a9400624fd8ef44921a1ab16d6c1644f9cc34c7c09bb8eda582e394a",
    "previousSha256": "9eec13ffb01dfaec268c17dc18fd1bf2e1a85137856a0557d119806973ff5f53"
  },
  "scripts/public-xeno-pose-admissions-v209.mjs": {
    "kind": "tooling",
    "sha256": "74726cf320e557d4533f3d156de3d1505ebaea53824a183fdba29e515379c77e",
    "previousSha256": "5ffc1efb4e612d9e3b09668bc96ef9f05e77221b3fadaf7c1ceaa02efe8110aa"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "89325ccff8daf40f1c53bb6ae510421c6dca9ec52d90b37501ccb856a547f9a4",
    "previousSha256": "24a0b9ab89caee64a60fc67e9696f19827bac750a06194915f3e012075e6535e"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "45d621e1af750c1792e7237b07c927fe8e0f0639ad16e8eebdf9643313876a0e",
    "previousSha256": "aa470e91bd9f86393ae218b66e9f273e01cfa4ff6e0cf97e507f4c903a6e6cce"
  },
  "scripts/verify-xeno-gameplay-audit-v213.mjs": {
    "kind": "tooling",
    "sha256": "8165f5f40de2ce1d483d594e0da07318fb56ad293ad359e429eb2ebc31e1966a",
    "previousSha256": "2bc9ab6c3d9e0ffa174ba590fd04554b3acc81624ae4107e9bc0c80971d3af5a"
  },
  "scripts/verify-xeno-trials-animation-ui-v189.mjs": {
    "kind": "tooling",
    "sha256": "876ca5638cd6fdb426bff988e399538d0f3be15fd27d9f6cb9496de4b6d5fcb5",
    "previousSha256": "c0f445800ebff770d36a463d797fc8232a9cf95cbd97eac7b094c55ccd6af840"
  },
  "scripts/verify-xeno-trials-poses-v209.mjs": {
    "kind": "tooling",
    "sha256": "65440038034a25b3cfbc2155530c2b1a4afd027ec348f5bb47a5e3d9694f925d",
    "previousSha256": "f7d20fbee0ec66efb1a247356070b081bd31ee0b9e8b175605953bc4125ad36b"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "sha256": "78de41b2bdeda2ef697b9f06cbb5ce2c32913afec72bcdbb2f08fa7ffd000d9f",
    "previousSha256": "163fa67d5b78276433595fa5f292704fbbcdb3c328d99b653be34a3ded16c966"
  },
  "src/xeno-trials-combat-contract-v186.js": {
    "kind": "runtime",
    "sha256": "5f6937691bc98819dc14f041656043ec3e35b36b141af55e2c3157f0fd79c895",
    "previousSha256": "da964588d740ce35b10a53f7ead3586def8a11dcc17e9d5c16536b7ce38c2e39"
  },
  "src/xeno-trials-engine-v96.js": {
    "kind": "runtime",
    "sha256": "95698b746cebd5ebbc2911d8a15efb0fdd1b9d8ce3f383cc5300b2dfb0f3b1c8",
    "previousSha256": "76b6280f42b633fc4dd73b696eb2f6028216f86df56e7bedf156666a46f6e77f"
  },
  "src/xeno-trials-physical-scale-v119.js": {
    "kind": "runtime",
    "sha256": "94865f9bdba58a89840fdbf36e5d6406943f13862f1cdbb8208abd5cb34b4eaf",
    "previousSha256": "d58163bc0b57caf2f5a9737881289b87d81c72aba0619e9bf1b15393c05c7899"
  },
  "src/xeno-trials-poses-v209.js": {
    "kind": "runtime",
    "sha256": "aec20e647457f1a82aff6be1c2bf6634d8dcb599f0229de2e06970c7c4f31d11",
    "previousSha256": "9579413ece34e3d4d9496623cd128018e9dd787db0934dce928373463aed1cdb"
  },
  "src/xeno-trials-research-v209.js": {
    "kind": "runtime",
    "sha256": "bb216a98725b6aaa76049d0327f520fb9247d161fbf4a9048272203a60be9861",
    "previousSha256": "87d5ffff9a3dd1e8d4a7d93d6471c210512c08fc703009d9658c9bb9b1c5af92"
  },
  "src/xeno-trials-roster-v179.js": {
    "kind": "runtime",
    "sha256": "56d3c1ce3ab4153748bc02c89e6e78359cd93a17aa63aa6c52d485f97ea27f8d",
    "previousSha256": "2b0c7eceb3acc605fb2077767b5fa5e9675fb7daadeb6f9b46067627e19c7234"
  },
  "src/xeno-trials-selection-v97.js": {
    "kind": "runtime",
    "sha256": "1855fdd1aee70c83f0cd0e47892c87ee83e3ce6450390150c74123d40a9b3e08",
    "previousSha256": "acb6bda6327ef144d4d5d78223c12fdbdb8df2832565fa748c4f2970b64a4a9f"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "d090724a6bbcf687498f7a067d78cb14d8366dd370f11eb061e6ee905cb23d62",
    "previousSha256": "82dca275ec2cf52a3169fcf64b71658f88b5dbeca49e015767c71d3d2c110727"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "95b058eab771ff789b5076dec242c2aeb448e9b3b28ac025c2fccbc67e96f93f",
    "previousSha256": "f948cd07dedd24d5ac0ca38c1698ce7af7184a41e1cc65e0016a4717ee93ca5a"
  },
  "xeno-trials-fullscreen-v119.css": {
    "kind": "runtime",
    "sha256": "48abbc42072e94835b83abe9537a16cd5b00ee101050bf49d8fb8d7acf0a2191",
    "previousSha256": "2e8c4ef4a4ebb2f7ddbb6bf5f5d8b4861bc7843f6734abdb1d1f683b02610c00"
  }
});
export const XENO_TRIALS_NEW_INPUTS_V227 = freeze({
  "assets/openai/xeno-trials-v209/characters/gorilla-light-contact.png": {
    "kind": "asset",
    "sha256": "cf25c79d91b189b0df8a04eb386cef4e7b079759c2177907967c6e5d95c31270"
  },
  "assets/openai/xeno-trials-v209/characters/gorilla-light-recovery.png": {
    "kind": "asset",
    "sha256": "57dcf8ac332b9221f28125fb8289978fab436f91fba938cb09f21378bb3edd86"
  },
  "assets/openai/xeno-trials-v209/characters/gorilla-light-windup.png": {
    "kind": "asset",
    "sha256": "3ea25936db937362cb06b03d20a6f0059f8a43821ba9c42f5510e0e39db6696c"
  },
  "assets/openai/xeno-trials-v209/characters/grid-light-contact.png": {
    "kind": "asset",
    "sha256": "13a7e416e27facc8b6d94075064714a33f61d36bf57ab3000be29a2af6bf8ece"
  },
  "assets/openai/xeno-trials-v209/characters/grid-light-windup.png": {
    "kind": "asset",
    "sha256": "2da2aabd48c2f83b8b733023bb98e7d0e8cf04bd897aca887b3f49a25da5c2a5"
  },
  "assets/openai/xeno-trials-v209/characters/panther-heavy-contact.png": {
    "kind": "asset",
    "sha256": "45d1d78cefa1224841db0f473baecd8e35f6a918de6c555251869ff4c0aad01f"
  },
  "assets/openai/xeno-trials-v209/characters/panther-heavy-recovery.png": {
    "kind": "asset",
    "sha256": "b94eff0dc4ac3e761fa132fd8a1b50d93ffa92790444269d521304ebbe87e8ec"
  },
  "assets/openai/xeno-trials-v209/characters/panther-heavy-windup.png": {
    "kind": "asset",
    "sha256": "d0c955350551dec409312e47337d85989ea7d82158fbc88414cfc3016a02c773"
  },
  "assets/openai/xeno-trials-v209/characters/queen-light-contact-v227.png": {
    "kind": "asset",
    "sha256": "bb659438e5ef994a6a560fc9ecb155a05d3792b0cb33fccd3a245edba00c24c7"
  },
  "assets/openai/xeno-trials-v209/characters/queen-light-recovery-v227.png": {
    "kind": "asset",
    "sha256": "f53f8546a4a68047fe0bae0bc50741d9679934ff9cb6d75936a96c1ea72c0df9"
  },
  "assets/openai/xeno-trials-v209/characters/queen-light-windup-v227.png": {
    "kind": "asset",
    "sha256": "a826ddce7bf7113267df212190cfa8653f598a27678b4a95297719cbc31982ae"
  },
  "assets/openai/xeno-trials-v209/characters/runner-heavy-contact-v227.png": {
    "kind": "asset",
    "sha256": "2b6a4d4483b407f77fb87f4bcda42abc26c06e88a907edfbdbef1d4e55df7878"
  },
  "assets/openai/xeno-trials-v209/characters/runner-heavy-recovery-v227.png": {
    "kind": "asset",
    "sha256": "4f6aa7dc1f6a6c84484f2a84425eef41f5825bd34406bf745dff67b7e4eb7ed8"
  },
  "assets/openai/xeno-trials-v209/characters/runner-heavy-windup-v227.png": {
    "kind": "asset",
    "sha256": "e9d289d37931a1475f39d225d25fc6de1fac3d2eff0aef5bf25286523ea17494"
  },
  "assets/openai/xeno-trials-v209/characters/warrior-heavy-contact-v227.png": {
    "kind": "asset",
    "sha256": "136c94084ec3704a570f5b81b9b63c50ef5286891fa3782e1ae48b803be0cbf6"
  },
  "assets/openai/xeno-trials-v209/characters/warrior-heavy-recovery-v227.png": {
    "kind": "asset",
    "sha256": "bac35046a30a10fe4c0d548325157e6ec36feb43833c36f67053f58f230c817e"
  },
  "assets/openai/xeno-trials-v209/characters/warrior-heavy-windup-v227.png": {
    "kind": "asset",
    "sha256": "1ea23b2f477954f356bdd72275ad8c1c74f780b0fb27dc8e18e76390a249cf6f"
  },
  "docs/forge/xeno-trials/V227-ROSTER-AND-SPRITES.md": {
    "kind": "documentation",
    "sha256": "bc2e4e62599c7684484c2d41822a80b9d5921bc2c4efdcca45eed8c206068e99"
  },
  "docs/forge/xeno-trials/roster-audit-v227.json": {
    "kind": "documentation",
    "sha256": "cab16f7936d0c298151183945ae49142b7bea86c803ff77d1ad9d41d4d34d764"
  },
  "docs/forge/xeno-trials/sprite-production-v227.json": {
    "kind": "documentation",
    "sha256": "2d8cd6f977f9aeb503b5735c3a31414d379a5b3ae19192cd151801e6dc272f15"
  },
  "scripts/verify-xeno-trials-roster-audit-v227.mjs": {
    "kind": "tooling",
    "sha256": "21ea020e171e4c84879f331f9511c664e4039f9bc9d4986e94561ba9143f1d34"
  },
  "scripts/verify-xeno-trials-roster-ui-v227.mjs": {
    "kind": "tooling",
    "sha256": "aada644df05bdf33cb7c0f0fcf15a8aa4f3f55a4899b842edde1f2467ac0d21d"
  },
  "src/xeno-trials-power-v227.js": {
    "kind": "runtime",
    "sha256": "3edf07010ec66982eb964e7df20606a8048416a7555ca01d7a04d510aa9cf761"
  }
});

export function reviewedXenoTrialsDigestV227(path, endpoint) {
  if (!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V227, path)) return reviewedXenoTrialsDigestV228(path, endpoint);
  const receipt = XENO_TRIALS_SUCCESSORS_V227[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V226 endpoint for V227: ' + path);
  return reviewedXenoTrialsDigestV228(path, receipt.sha256);
}

export function xenoTrialsRuntimeSourcesV227(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V227)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoTrialsDigestV228(path, receipt.sha256);
    if (result[path] !== undefined && result[path] !== current) reviewedXenoTrialsDigestV227(path, result[path]);
    result[path] = current;
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V227)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoTrialsDigestV228(path, receipt.sha256);
    if (result[path] !== undefined) assert.equal(result[path], current, 'Incorrect V227 runtime input: ' + path);
    result[path] = current;
  }
  return xenoTrialsRuntimeSourcesV228(result);
}

export function verifyXenoTrialsV227(readSource = readRepository) {
  const successors = Object.entries(XENO_TRIALS_SUCCESSORS_V227);
  const inputs = Object.entries(XENO_TRIALS_NEW_INPUTS_V227);
  assert.ok(successors.length > 0, 'Incomplete V227 source freeze');
  const paths = new Set(['scripts/audit-xeno-trials-v227.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V227 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V227 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256),
      'Invalid V227 receipt: ' + path);
    assert.equal(sha(readSource(path)), reviewedXenoTrialsDigestV228(path, receipt.sha256), 'Unreviewed V227 source bytes: ' + path);
  }
  for (const [path, receipt] of successors) {
    assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V227 predecessor: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(!Object.hasOwn(receipt, 'previousSha256'), 'V227 input has a predecessor: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_DECLARATIONS_V227)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V226 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V226 declarations changed: ' + path);
  }
  verifyXenoTrialsV228(readSource);
  return Object.freeze({ baseline: XENO_TRIALS_BASELINE_V227, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
