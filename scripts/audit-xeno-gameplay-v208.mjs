import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_GAMEPLAY_BASELINE_V208 = '07e9673f8a602632c13cc83757c10d4e66afa56e';
export const XENO_GAMEPLAY_SUCCESSORS_V208 = freeze({
  ".github/workflows/xeno-trials-standalone-v207.yml": {
    "kind": "tooling",
    "sha256": "8672df6852048782daf4e3798a5a3fa9b74bf3b1965f9380ea4e774fb448be59",
    "previousSha256": "ff52d876a9f50ef3a0967b33b215028ca6e1a5362947e7624a825ea7b859c940"
  },
  "package.json": {
    "kind": "tooling",
    "sha256": "165536a81630ae36c429db384413d6cfca9d11b383ed3764dd2abaad4628bf31",
    "previousSha256": "d5b33ffb13e627f3eaea99a73ce762eb699495969bebe9921e8ddc7b754ab439"
  },
  "scripts/audit-xeno-standalone-v207.mjs": {
    "kind": "tooling",
    "sha256": "1888a178ba31db25ea973ed319d687d3e20b6b06800198bb848654712f944fa1",
    "previousSha256": "592e8e963f23d45c1b5ebdb2a381fb91d5921800dfac9f7b0b5a7b56ad118ade"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "6773e35578cf8e534a76b3b20aaa6fd28a97644b0ec458b532919aba35386ba1",
    "previousSha256": "8f761f53c4cac71f56af764785a22f9daf3f6613ed8899d7fe04cd8f7e01e927"
  },
  "scripts/verify-aliens1986-main-succession-v116.mjs": {
    "kind": "tooling",
    "sha256": "07249527a430a642dcff9f3ccd7cf2887e9f248e2ac1c7affad9e74b3a7f6c31",
    "previousSha256": "65e4e9123ae0ce0186bd7ce3058491ee1a4ca61363237d3c0f659bbc89d309e5"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "d039103964038598f237b56681aad7608b7d80cdea3a7cf0c5fc862adf3d04cb",
    "previousSha256": "67a8fae99957e8f3d9ad37ef47a7519d12ab9a647bd28355daf332096d8ade2d"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "37e9afc503c973241d5cd4d1dc6de74aa88cdbfb602b1191400b87e2534cec14",
    "previousSha256": "fe8280ac7c3ebb2d7fe5b3ba98c972e56f1592ff8c479e731e49f09ce3ff6d7d"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "tooling",
    "sha256": "720cabf3fba6a7cc64cfb15286e571844e741c8216ec4e5810525f54c6c37c38",
    "previousSha256": "8f6ad0afed372acd251e4d1574b3d768936d46d52a79d84c3f2666bbfd2d4e22"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "89ce0213f89d8be66bfcab977c8410f30c5efa28980d709010eaea11ba823af7",
    "previousSha256": "b90535d7e9ce1dadda06f9ad27a761d41f434dd8786ed0c1bc3a866127390740"
  },
  "scripts/verify-river-of-pain-succession.mjs": {
    "kind": "tooling",
    "sha256": "96858f4e3b3553f8233495fc3f0aa67ae50c4d4c780577ef3035e63722a77711",
    "previousSha256": "05b7258d315accf781a848dbe5e1c2d76f931a6ac81877a30211e4661b9b52e0"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "tooling",
    "sha256": "884ea993617bad85e8b70ef3f98467bd8c31ea4fdd97a85df464968a53d8c9b8",
    "previousSha256": "8642765cf30c0f7c34e0a531f32bd866f79fba9d8f66b1a1b2a0a0121339e184"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "tooling",
    "sha256": "fd041029f277a3f87fbcac35047fada4def7b831be4d9655abc9ba7fdc34f2d4",
    "previousSha256": "9d47362efa03e3a2a12e06af702ef2898f721c0ca9e354ea3f21f9865fc5c3a3"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "tooling",
    "sha256": "9b8fcaa043bfb36d3bf39c9ccbdeb783c8d1fd8a1ccaea93a85eacccb50dc97f",
    "previousSha256": "87de42c8945713bfd8ad674c08d1adb7fc68d840467f8c8852f791ec17c0e3e9"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "tooling",
    "sha256": "24bb88407ddc834f65e18c3cf68ee923e9d4e637fd140d528d7e951090d7f8bc",
    "previousSha256": "fcdae46b0ec2edc943877d6aec42f28dd6a577047baeddd7c0ee793ee9ff952a"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "tooling",
    "sha256": "3aafd2e0156a077516aeb7da7267cfea5479b9770ab393788dea2bbff2190dc4",
    "previousSha256": "54c41430bf30014ff217bcb5d9099c2f2f2ce08bf84bb2c6e892c02b8b326a20"
  },
  "scripts/verify-xeno-priorities-audit-v201.mjs": {
    "kind": "tooling",
    "sha256": "36c2d5c1bf74776e6b81220a759c994777dacb0c7e511fc0709ea7c50acbdc4a",
    "previousSha256": "b7f10a57e125d06d3385646dd92cb716969519f0ae7dabf9290fd94fbf5a9127"
  },
  "scripts/verify-xeno-priorities-audit-v202.mjs": {
    "kind": "tooling",
    "sha256": "d1ed156715826dc072b2f8df84ecd99a6c5f5fe354110c60532278a307d29112",
    "previousSha256": "473129864a0b9a3449c876500b218a237e996cc5eac325739176a6cad357772a"
  },
  "scripts/verify-xeno-priorities-audit-v203.mjs": {
    "kind": "tooling",
    "sha256": "cdf7dab29b278a384dbbb7a8c70ddd93eeb589eefe79e6672c7149aeb6e49e05",
    "previousSha256": "2b575f7ade33fa0a4bea35ed26f034f206581c6b7c6a55e0034fa6aead04a8fe"
  },
  "scripts/verify-xeno-priorities-audit-v204.mjs": {
    "kind": "tooling",
    "sha256": "a5f126967c69ed97816606662df6f26a8da516ea396711ff43fd5eedff14ec84",
    "previousSha256": "db1cb148b8db62ef04ae200d30cf799312dd1720c26ec9e40ecbc98d8f3ccc4c"
  },
  "scripts/verify-xeno-production-assets-v206.mjs": {
    "kind": "tooling",
    "sha256": "7b5b1a8f500197d517ab58aa140fa295276b6daa8267574691768c805639408b",
    "previousSha256": "d56b4ca4e3524e775de9b030201bde8dc838eaed9ae9674443d374b6b72809c8"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "tooling",
    "sha256": "7a217a754245780b036b44b2c5b847f6a51b49ebf9b62e809c15fdb79cfe1976",
    "previousSha256": "07a636a3b3ccfc2ce9247c8569403f44d8fcfe8758161825b7fbf3ac5d1c0e29"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "tooling",
    "sha256": "6933981bb8c636b5f731ec1c1c6e23c2675a4ec5d7c5bfb9e6502d3c69cb872a",
    "previousSha256": "21c325316b32d190c277d0ec83165587caa8abee51601ea3036d1ea88640081a"
  },
  "scripts/verify-xeno-standalone-audit-v207.mjs": {
    "kind": "tooling",
    "sha256": "16ab8c772ae030cf227ce8242074c9f29086058ba3ddbc749ef7bff52341fbbe",
    "previousSha256": "9eaef80c069389ad5159d09da77da740ed6716a4fdb7182762add69a008a0166"
  },
  "scripts/verify-xeno-supers-audit-v200.mjs": {
    "kind": "tooling",
    "sha256": "ba414953fd8f38f2009b646421d1ab938991aa1a65ff567cceaadf096eab4cd8",
    "previousSha256": "b7959c943b167f6caede19b96ec9d369437cd54e62a932df9bc990ae353fbad9"
  },
  "scripts/verify-xeno-trials-artifact-v207.mjs": {
    "kind": "tooling",
    "sha256": "2aae56fb0c74ea76f898e378a38eabda20fe4e4997b28793284374bca08ee21c",
    "previousSha256": "8aa22943421b5283783ed5310ce3012141c4b287f55d2055daa95ca09c26a013"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "f72033dea18a75660f1d3449568387226742fc4f98553656e7e9e54129bfbd44",
    "previousSha256": "d111830df6cc6b7920424100329d567260d5f033bcac10692ea53b3c1853f15f"
  },
  "scripts/verify-xeno-trials-gamepad-v186.mjs": {
    "kind": "tooling",
    "sha256": "e267bec3159b042f5ee482deac044b83216c25dde9498f8304df8f94b90aaab6",
    "previousSha256": "bd33adf7fb597d073eb79fa6796272b6e3b7f8647111f2fc964f1c8e33f9578b"
  },
  "scripts/verify-xeno-trials-moveset-v207.mjs": {
    "kind": "tooling",
    "sha256": "059b1e89795b2670da9c0aa4674f92662fa37b1fdd3631d4c771152e358bdc58",
    "previousSha256": "05da23d7aff153571eab046dcc4c708bac051c4fddb6b9fb2b2672f5976e4b2d"
  },
  "scripts/verify-xeno-visual-assets-audit-v205.mjs": {
    "kind": "tooling",
    "sha256": "e64dddca00f0c2669addd19518377902a08adebe53015e87eb99c610c9f9e764",
    "previousSha256": "8ed64ca61b9b968e4027bcb14ad24b2bff9c813b7fd22c7365ef6975cfce7adc"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "sha256": "663f22439a2146e7b17dfacb0ece5ccb2988aa530b1eb2f58ab62af5da80a7cd",
    "previousSha256": "2383011b0be3c80fee049e224d09c412e32b37f4de8956dba217b7d763064f7a"
  },
  "src/xeno-trials-audio-v189.js": {
    "kind": "runtime",
    "sha256": "32627b715eba949a7e659aa26a70378d07d0943f06b8af7e255ac8e9b8e39451",
    "previousSha256": "d1de5ff5d208c1ec22c18a7b72fed2a58bc887e39a4211a9075d299e7ddfd5fc"
  },
  "src/xeno-trials-capture-v163.js": {
    "kind": "runtime",
    "sha256": "533741b71b5c929409f80255ab49d06a6a7c2cee9e1c56391d9e777dbd8eeaf4",
    "previousSha256": "e193d2cb6e3d8fc44e96f01b0a17a010a4ba72b0dca9bcaa0ae8b4f8085113d7"
  },
  "src/xeno-trials-duel-checkpoint-v197.js": {
    "kind": "runtime",
    "sha256": "6a0a1213659aa9e0872f62abdf8b7a9daee09801999877b93bb31b0ea22a8f34",
    "previousSha256": "64ba8a9016d9f9cacce4f9d5b656379e864b6950a5207afe9cf28c51351c7ad2"
  },
  "src/xeno-trials-engine-v96.js": {
    "kind": "runtime",
    "sha256": "f0cf28ecb57cc80ac48626d1cd35034219f118e8fa843139a6c5490f2599615d",
    "previousSha256": "dc2bf84ba6bbcc35db89e7392997625d7048a010731983ec4f440093891b70e1"
  },
  "src/xeno-trials-finishers-v207.js": {
    "kind": "runtime",
    "sha256": "fbd5cb73981b99f05730be6373c7b4ba759538fb2aad095d5437716d08af27df",
    "previousSha256": "3fdcc7b26ed5c6e0929f7cbe7d47a978a529f3aa6b79e216e05cc575ba2b6214"
  },
  "src/xeno-trials-gamepad-v186.js": {
    "kind": "runtime",
    "sha256": "6885b444b15911b1f2234ccfd61f3af95dcdea96c778e9b3a1c880f2b3446d67",
    "previousSha256": "f68db73229dfc444efe2dbad4d7db8caf07e7459ee6f3e331a49dc71aaa3f852"
  },
  "src/xeno-trials-horde-checkpoint-v186.js": {
    "kind": "runtime",
    "sha256": "c180006a758c4077eaac4c9740de7e9dc88a57850d2565875ca554511ef0be14",
    "previousSha256": "81d392e1da50aaaadbbbf4147680d28f80e25ae1f9f1acfe0194caf69890586a"
  },
  "src/xeno-trials-moveset-v207.js": {
    "kind": "runtime",
    "sha256": "4007c6176fd86e23f822ffd8660de7c688429b49fc5f46876e007b2c9d8dd2a5",
    "previousSha256": "47c19ec30d80061db0c10a47e37304f869a372b99a79d627f75a736a903833a4"
  },
  "src/xeno-trials-practice-v207.js": {
    "kind": "runtime",
    "sha256": "b218d3ac2c2a140c1c612fbbae12b5bbf088513247934fb5e88930e2e0b3c5ec",
    "previousSha256": "dac6a2a4ab78f2ed5c9e7ca44378e9ce695515a9733d1796a4dd860161b11d33"
  },
  "src/xeno-trials-progress-v96.js": {
    "kind": "runtime",
    "sha256": "eee120c2cf0b9c5f2da6c2ea7011a2ec9a4126bc3fef71b44d8b70177827bbc5",
    "previousSha256": "7491cbce212de599f3c934a7d6de47112c8a116da99020fb0736f6d9d715be5a"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "sha256": "c98c92eb9cdc8832a4c7c551988758a6d2d9ba3796fb5093c23befd7400b1d2a",
    "previousSha256": "541036498c5c8fbff2f547df51cfe93930c0c9b2360efbe58bfe009b065ab1a3"
  },
  "src/xeno-trials-signatures-v147.js": {
    "kind": "runtime",
    "sha256": "d135669891d63c2f16ff25f41dc5555e5bcfbe38217cc375061b601d559c52fd",
    "previousSha256": "c1fdd1aa4e0426c758c408e6e82fe8ba342967c9395391d2405791ba575a5ffb"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "02659c512f5e560be9c0c70ad10c031cc99ca7f05e0bd851a9de400cfa53c5e9",
    "previousSha256": "3eb97a8587b0bb17e282ded49ff14152cc377b5c6d057c79743c8f5188baf5cb"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "88b8e4f776cff70349b59af38eaefac727f2d4bae9dd34dac4b0e182487358ef",
    "previousSha256": "1f94a0018a6c8ce11b37b4757372bdb1eb6dc16e8e10d12c135bd951100770d4"
  },
  "xeno-trials-fullscreen-v119.css": {
    "kind": "runtime",
    "sha256": "5e465646d371cab8a067cf5ed2f261d830d43e85efec657330048ff6d0fd9a1e",
    "previousSha256": "52b15b5c7f4220be07e7c99ac489511f716632e669a57ef78950d54da9987ef8"
  },
  "xeno-trials-v96.css": {
    "kind": "runtime",
    "sha256": "3db3446694432c8909c5d0c322336487830898b7615257f349412302ce612973",
    "previousSha256": "892ddff2a969e79ccaa9b9507ca66a79854cef0bd95387bf65cd6a61399ae4a9"
  }
});
export const XENO_GAMEPLAY_NEW_INPUTS_V208 = freeze({
  "docs/forge/xeno-trials/V208-GAMEPLAY.md": {
    "kind": "documentation",
    "sha256": "4a6ac6538893b88d6faf179c142ea62dbb8ca2aceba16a487f54319d4bc60fea"
  },
  "scripts/verify-xeno-gameplay-audit-v208.mjs": {
    "kind": "tooling",
    "sha256": "0b481d997da7c2d5a9c728ad7854ca0f3fae145795754c94017a59f3bef08755"
  },
  "scripts/verify-xeno-trials-defense-v208.mjs": {
    "kind": "tooling",
    "sha256": "b7783d713227ae31455f87fc3b329379e2912a7d22eafd5365203a7b1764b0d2"
  },
  "scripts/verify-xeno-trials-finishers-v208.mjs": {
    "kind": "tooling",
    "sha256": "6b77589132211aa2ce5ac62a897ff7d56163bf607686e458e3f49be6de337746"
  },
  "scripts/verify-xeno-trials-practice-v208.mjs": {
    "kind": "tooling",
    "sha256": "d4dc87388211207954c9304d9c66260922f235bb599a25f142e6a72870434a4d"
  },
  "scripts/verify-xeno-trials-ripostes-v208.mjs": {
    "kind": "tooling",
    "sha256": "d1a2a7609967ca239784030e045cad1677918047d8287fecc8e3b49dc90672c8"
  },
  "scripts/verify-xeno-trials-signature-kit-v208.mjs": {
    "kind": "tooling",
    "sha256": "f3b97b9cee87f076b5b2c04b3a00be1fd206322b7232aa5fd6962072bc471a79"
  },
  "src/xeno-trials-defense-v208.js": {
    "kind": "runtime",
    "sha256": "242ced17b2fb6e1e90b64c3f99eab740361829eb900f3f7406a9ac5a0370b719"
  },
  "src/xeno-trials-finishers-v208.js": {
    "kind": "runtime",
    "sha256": "03e891a58c8ecfc1e5f244eb45524f1f2c9f9ff987fa13730fd8baad6217ef02"
  },
  "src/xeno-trials-practice-v208.js": {
    "kind": "runtime",
    "sha256": "c7f74f8aac103f90f112440dcf5d8301cd35acac0e3294bf5967167f076510c9"
  },
  "src/xeno-trials-ripostes-v208.js": {
    "kind": "runtime",
    "sha256": "0f0ebcf1a46083961d9068eb702cd8f1cf7ed03c205ae3f21214c0b4330b55a3"
  },
  "src/xeno-trials-signature-kit-v208.js": {
    "kind": "runtime",
    "sha256": "2e6a5b1fe7b65a2f82b1fcb7dda2c73cee8597a0703197710c6619d4cfd8fd77"
  }
});
export const XENO_GAMEPLAY_DECLARATIONS_V208 = freeze({
  "scripts/audit-xeno-standalone-v207.mjs": {
    "start": "export const XENO_STANDALONE_PARENTS_V207",
    "end": "\nexport function reviewedXenoStandaloneDigestV207",
    "sha256": "fe4564fdcc45a09023f0494b39c7a483598be068ddd5927063a50e6b59138ec7"
  }
});

export function reviewedXenoGameplayDigestV208(path, endpoint) {
  if (!Object.hasOwn(XENO_GAMEPLAY_SUCCESSORS_V208, path)) return endpoint;
  const receipt = XENO_GAMEPLAY_SUCCESSORS_V208[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V207 endpoint for V208: ' + path);
  return receipt.sha256;
}

export function xenoGameplayRuntimeSourcesV208(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_SUCCESSORS_V208)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.sha256) reviewedXenoGameplayDigestV208(path, result[path]);
    result[path] = receipt.sha256;
  }
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_NEW_INPUTS_V208)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined) assert.equal(result[path], receipt.sha256, 'Incorrect V208 runtime input: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoGameplayV208(readSource = readRepository) {
  const successors = Object.entries(XENO_GAMEPLAY_SUCCESSORS_V208);
  const inputs = Object.entries(XENO_GAMEPLAY_NEW_INPUTS_V208);
  assert.ok(successors.length > 0 && inputs.length > 0, 'Incomplete V208 source freeze');
  const paths = new Set(['scripts/audit-xeno-gameplay-v208.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V208 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V208 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256), 'Invalid V208 receipt: ' + path);
    if (Object.hasOwn(receipt, 'previousSha256'))
      assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V208 predecessor: ' + path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V208 source bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_DECLARATIONS_V208)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V207 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V207 declarations changed: ' + path);
  }
  return Object.freeze({ baseline: XENO_GAMEPLAY_BASELINE_V208, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
