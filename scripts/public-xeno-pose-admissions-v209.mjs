import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { XENO_VISUAL_ASSETS_NEW_INPUTS_V205 } from './audit-xeno-visual-assets-v205.mjs';
import { XENO_PRODUCTION_ASSETS_NEW_INPUTS_V206 } from './audit-xeno-production-assets-v206.mjs';
import { getXenoTrialsPoseAssetsV209 } from '../src/xeno-trials-poses-v209.js';

const rootDirectory = 'assets/openai/xeno-trials-v209';
export const PUBLIC_XENO_POSE_DIRECTORIES_V209 = Object.freeze([rootDirectory, rootDirectory + '/characters']);
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
const approved = new Map([
  ...[
    [205, approvedV205, XENO_VISUAL_ASSETS_NEW_INPUTS_V205], [206, approvedV206, XENO_PRODUCTION_ASSETS_NEW_INPUTS_V206]
  ].flatMap(([version, names, receipts]) => names.map(name => {
    const origin = receipts[`assets/openai/xeno-trials-v${version}/characters/${name}`];
    assert.equal(origin?.kind, 'production-asset', 'V209 pose must have a production receipt: ' + name);
    return [name, origin.sha256];
  })),
  ...generatedV226,
  ...generatedV227
].map(([name, sha256]) => [`${rootDirectory}/characters/${name}`, sha256]));

export function publicXenoPosePathAdmissionV209(path, { directory = false } = {}) {
  if (path !== rootDirectory && !path.startsWith(rootDirectory + '/')) return null;
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
