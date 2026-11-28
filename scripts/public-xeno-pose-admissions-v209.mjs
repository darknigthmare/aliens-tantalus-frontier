import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { XENO_VISUAL_ASSETS_NEW_INPUTS_V205 } from './audit-xeno-visual-assets-v205.mjs';
import { XENO_PRODUCTION_ASSETS_NEW_INPUTS_V206 } from './audit-xeno-production-assets-v206.mjs';
import { getXenoTrialsPoseAssetsV209 } from '../src/xeno-trials-poses-v209.js';

const rootDirectory = 'assets/openai/xeno-trials-v209';
const rootDirectoryV232 = 'assets/openai/xeno-trials-v232';
export const PUBLIC_XENO_POSE_DIRECTORIES_V209 = Object.freeze([
  rootDirectory, rootDirectory + '/characters', rootDirectoryV232, rootDirectoryV232 + '/characters'
]);
const approvedV205 = ['grid-heavy-impact.png', 'arachnoid-light-windup.png', 'arachnoid-light-impact.png', 'arachnoid-light-recovery.png',
  'arachnoid-special-windup.png', 'arachnoid-special-recovery.png'];
const approvedV206 = [
  'arachnoid-heavy-windup.png', 'arachnoid-heavy-impact.png', 'arachnoid-heavy-recovery.png', 'arachnoid-special-active-grounded.png',
  'panther-special-windup.png', 'panther-special-active.png', 'panther-special-recovery.png',
  'grid-heavy-recovery.png', 'gorilla-special-windup.png', 'gorilla-special-recovery.png',
  'panther-light-windup.png', 'panther-light-recovery.png', 'grid-special-windup.png', 'grid-special-recovery.png',
  'gorilla-heavy-windup-four-spines.png'
];
const generatedV226 = [
  ['gorilla-heavy-impact-four-spines.png', 'a0f9fda83b209e792008e4c07857b436a8219336f376a32aa1af573c74d7581c'],
  ['gorilla-heavy-recovery-four-spines.png', 'a3e1185cc5b1232b752d462f51a72e81b71680eaba65f987c5716b6625bb88b7'],
  ['gorilla-special-active-four-spines.png', 'c41f8334e3155ad4a89806430463797c14bec69248dbce322f7e660a0bf35c43'],
  ['grid-heavy-windup-v226.png', '1a070e2b051846445d85379835ed7dca714192a796ac4504d750b6a16c07707f'],
  ['grid-special-contact.png', 'b59d9e5b7aee600e668dfe3a0a86cfa6250a277cf9ec0293f4dfff0f0dd60084'],
  ['panther-light-contact.png', '9013b24f3964d50b68a166b73175d573470a0b24963bea3b1c505d47c12f31bf']
];
const generatedV227 = [
  ['warrior-heavy-windup-v227.png', '1ea23b2f477954f356bdd72275ad8c1c74f780b0fb27dc8e18e76390a249cf6f'],
  ['warrior-heavy-contact-v227.png', '136c94084ec3704a570f5b81b9b63c50ef5286891fa3782e1ae48b803be0cbf6'],
  ['warrior-heavy-recovery-v227.png', 'bac35046a30a10fe4c0d548325157e6ec36feb43833c36f67053f58f230c817e'],
  ['runner-heavy-windup-v227.png', 'e9d289d37931a1475f39d225d25fc6de1fac3d2eff0aef5bf25286523ea17494'],
  ['runner-heavy-contact-v227.png', '2b6a4d4483b407f77fb87f4bcda42abc26c06e88a907edfbdbef1d4e55df7878'],
  ['runner-heavy-recovery-v227.png', '4f6aa7dc1f6a6c84484f2a84425eef41f5825bd34406bf745dff67b7e4eb7ed8'],
  ['queen-light-windup-v227.png', 'a826ddce7bf7113267df212190cfa8653f598a27678b4a95297719cbc31982ae'],
  ['queen-light-contact-v227.png', 'bb659438e5ef994a6a560fc9ecb155a05d3792b0cb33fccd3a245edba00c24c7'],
  ['queen-light-recovery-v227.png', 'f53f8546a4a68047fe0bae0bc50741d9679934ff9cb6d75936a96c1ea72c0df9'],
  ['gorilla-light-windup.png', '3ea25936db937362cb06b03d20a6f0059f8a43821ba9c42f5510e0e39db6696c'],
  ['gorilla-light-contact.png', 'cf25c79d91b189b0df8a04eb386cef4e7b079759c2177907967c6e5d95c31270'],
  ['gorilla-light-recovery.png', '57dcf8ac332b9221f28125fb8289978fab436f91fba938cb09f21378bb3edd86'],
  ['grid-light-windup.png', '2da2aabd48c2f83b8b733023bb98e7d0e8cf04bd897aca887b3f49a25da5c2a5'],
  ['grid-light-contact.png', '13a7e416e27facc8b6d94075064714a33f61d36bf57ab3000be29a2af6bf8ece'],
  ['panther-heavy-windup.png', 'd0c955350551dec409312e47337d85989ea7d82158fbc88414cfc3016a02c773'],
  ['panther-heavy-contact.png', '45d1d78cefa1224841db0f473baecd8e35f6a918de6c555251869ff4c0aad01f'],
  ['panther-heavy-recovery.png', 'b94eff0dc4ac3e761fa132fd8a1b50d93ffa92790444269d521304ebbe87e8ec']
];
const generatedV228 = [
  ['rhino-light-windup-v228.png', 'a52bb0cc13c01299b9633551f3e79f921a4e4f4640a98ce34b6dd89c4c22407b'],
  ['rhino-light-contact-v228.png', '1dcc92f85ca5d53b40b3494f72b65d186d001932947194ba821c550939305238'],
  ['rhino-light-recovery-v228.png', 'b8f31103ed7aa78a9167180085b5d513d3771eb75a492af075a381a62e6b929a'],
  ['rhino-heavy-windup-v228.png', 'b38f380734d9e46517555e37e336de89c8259b47a8e9f8945835967a1b9c6e92'],
  ['rhino-heavy-contact-v228.png', '5039673693fb8f14bd23ac936ae6873a811d3ff9c22597a62e16dad7f79f39eb'],
  ['rhino-heavy-recovery-v228.png', '307daa03fcc4afbf712a8a01c7b9de721a49bdd343614e8289f880f0da0028ac'],
  ['mantis-light-windup-v228.png', '62cb0145db0fc5f3c83eb8de0907638940e4b9883fff79a3389fe4bae1f14580'],
  ['mantis-light-contact-v228.png', 'd49208d597cbad86c624df2ed025a86fd39da84a6d63d86b93ab3e6ee750eb53'],
  ['mantis-light-recovery-v228.png', 'b11c4bb117c36db75bfbb757d9d8bc11a442ffbea0011dff400a749ac7ac19a4'],
  ['mantis-heavy-atlas-v228.png', '3c4bdbd63cbe054f1f969f2e0eca7378d43a9de8ef2c25dd9630d3d6a9bf2f11'],
  ['armored-joe-light-atlas-v228.png', 'b64a0b074ac4d229dea3e16298caee795713eb458edf8a01411c25080f6eb92c'],
  ['armored-joe-heavy-atlas-v228.png', '3781789d46dab6149390e57d24c8cc145889fdf535cd4d30592591e2f4901aab'],
  ['synth-sniper-light-windup-v228.png', 'cbde1074f428f1720e500710f51b42bda1c58e4fce8672dea8db35957d457aaa'],
  ['synth-sniper-light-contact-v228.png', 'b97c4b05f1119c76535e4ddcd2db58ccfa8b4e24dac0045f4e90a715d302804a'],
  ['synth-sniper-light-recovery-v228.png', '4e44d75e394428b7abcbba481e125dc0b63231438281c91626a52f0d27c89d96'],
  ['synth-sniper-heavy-windup-v228.png', 'daee6fb1ee65e417322c660cf94cf2571db24b080bc2b26f9272800b5526be74'],
  ['synth-sniper-heavy-contact-v228.png', 'e888e73e30ccd3261d17ae5de1a0726f5ef80ed7d07ad2a31e45dcc3c8ae1aa9'],
  ['synth-sniper-heavy-recovery-v228.png', '466ce98bdd389b427f9fa3ab4983a8b06ed5b96830cf53bb51e995ab865d4073'],
  ['synth-heavy-light-windup-v228.png', 'e86c40d98c01b9c4b97a975dd676d3478d7cd7446e956d524d932c4b8dd83d13'],
  ['synth-heavy-light-contact-v228.png', 'ca0a7193d360a69bb559531b1732845a179bb82a4039d2ee69897bb91179ab3f'],
  ['synth-heavy-light-recovery-v228.png', '4480d0fceca32f7c4ca873ec3f42004113259691df5e571c99d24d2dd1c2d07c'],
  ['synth-heavy-heavy-atlas-v228.png', 'db3cd02b113daa667c852e43497046ad52046b7ea48271acce0adf09ed49635f']
];
const generatedV229 = [
  ['predalien-light-windup-v229.png', 'e143cbaa3fc5b2a896a97baf072e41157ce4412e76047b49addfa177f332234c'],
  ['predalien-light-contact-v229.png', '6594f8e1d0f60c55236fcb85328aae3b68781c107b4962db1608ef995fa11064'],
  ['predalien-light-recovery-v229.png', 'aa2b6066cb36bdd8ad454daa75b40cb287e1754b5efe2159dd28c4b971cb264d'],
  ['predalien-heavy-windup-v229.png', '81a5e06c8737f656f8e2a960682f898693fbe14cad9fbfd194e37e4c6f1432ec'],
  ['predalien-heavy-contact-v229.png', '58d673302cfdeb7f215ab7dcb7a773af15d4279dc92fa8aebe5b11ff76c16df8'],
  ['predalien-heavy-recovery-v229.png', '4c2876a80882bb6d30c68faa40a8289942d19c6149d07d15b9640bdb7f81d176'],
  ['boiler-light-windup-v229.png', 'd9df03486712634df0fe7fa45b2b9c86cb87c947135131f16f759df5c198349f'],
  ['boiler-light-contact-v229.png', '7f3ae95c95d3993c62669559f6bb138b3a605cafa197ee8b6f4de314c447260a'],
  ['boiler-light-recovery-v229.png', '9d5bd5483743e6e216c479485a82be6250adab5e61f7c0e70e1e008729356d8c'],
  ['boiler-heavy-windup-v229.png', '9134a7f64e5658c6dc6616e603ce0800ab96e36b070d39fda54c8a58896faa53'],
  ['boiler-heavy-contact-v229.png', '7c1bc2dbc566edc336b13c89a1d9fbf7c48426653609f4c47cefecc1006e7b08'],
  ['boiler-heavy-recovery-v229.png', 'a5f509bad6f8bc1c1aba5fbebb28e35885584e448c8628d7032be35b1685587d'],
  ['royal-guard-light-atlas-v229.png', '0a12cb0cb25a215631c5a52f6046c1fd36447d521d78181f19ec31fe3ec1d317'],
  ['royal-guard-heavy-atlas-v229.png', 'b4c8b74c61df65a29a8f826a07e7abf595bf1935a3ac4fd62c00eb1ba17e8bee'],
  ['razor-claws-light-atlas-v229.png', '6fd947e7c7309e45561e95f7bbc241572333ec612d1001397371851a39d19777'],
  ['razor-claws-heavy-atlas-v229.png', '26af781bcba0de3fda6afef18ff9c9c0b2898065eba6ec7def6362c79b483290'],
  ['xenoborg-light-atlas-v229.png', '1acdf9209a4ce9f351d8a16c4c07cc81267d45c4ae1d256faf148dc3644964a3'],
  ['xenoborg-heavy-atlas-v229.png', 'd11ca6d80817e204ea584468fefa950ba987771851685d014e0315bf41f1fbb3'],
  ['combat-synth-light-atlas-v229.png', 'bfc304d6139ff8633f05ac339243f206fc6749a7e2ac51209aeb90bd5567ca97'],
  ['combat-synth-heavy-atlas-v229.png', '126d382bd6a8283660300dbcfe963f526c7f6643702f8dff5d39f54f4cb4b159']
];
const generatedV232 = [
  ['big-chap-light-atlas-v232.png', '5ea2e20218f27e65bba22de276df9405b74814af05952b30857baab30452112c'],
  ['big-chap-heavy-atlas-v232.png', 'cf5125360b9bff4f9f1a22ee07acc5515a369d88323943aa0cc0c7dc221f54cc'],
  ['deacon-light-atlas-v232.png', '7747c023bb2884cf0c614c6807c8eda19268fdb65a663f355512ac7fbc502d8c'],
  ['deacon-heavy-atlas-v232.png', 'c72d5c5150b5807cee358ac69f19f4f81ef0d690330afd8f54a4107c4979c049']
];
const approved = new Map([
  ...[
    [205, approvedV205, XENO_VISUAL_ASSETS_NEW_INPUTS_V205], [206, approvedV206, XENO_PRODUCTION_ASSETS_NEW_INPUTS_V206]
  ].flatMap(([version, names, receipts]) => names.map(name => {
    const origin = receipts[`assets/openai/xeno-trials-v${version}/characters/${name}`];
    assert.equal(origin?.kind, 'production-asset', 'V209 pose must have a production receipt: ' + name);
    return [name, origin.sha256];
  })),
  ...generatedV226,
  ...generatedV227,
  ...generatedV228,
  ...generatedV229
].map(([name, sha256]) => [`${rootDirectory}/characters/${name}`, sha256]).concat(
  generatedV232.map(([name, sha256]) => [`${rootDirectoryV232}/characters/${name}`, sha256])));

export function publicXenoPosePathAdmissionV209(path, { directory = false } = {}) {
  if (![rootDirectory, rootDirectoryV232].some(root => path === root || path.startsWith(root + '/'))) return null;
  return directory ? PUBLIC_XENO_POSE_DIRECTORIES_V209.includes(path) : approved.has(path);
}

export async function verifyXenoPoseAdmissionsV209(root) {
  assert.deepEqual(new Set(getXenoTrialsPoseAssetsV209()), new Set([...approved.keys()].map(path => '/' + path)),
    'The V209 pose registry must use exactly the admitted files.');
  for (const [path, sha256] of approved) {
    const file = join(root, path);
    assert.ok((await lstat(file)).isFile(), 'V209 pose must be a regular file: ' + path);
    assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'), sha256,
      'V209 pose bytes differ from the approved production image: ' + path);
  }
}
