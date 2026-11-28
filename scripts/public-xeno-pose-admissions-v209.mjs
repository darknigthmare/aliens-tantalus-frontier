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
const approved = new Map([
  ...[
    [205, approvedV205, XENO_VISUAL_ASSETS_NEW_INPUTS_V205], [206, approvedV206, XENO_PRODUCTION_ASSETS_NEW_INPUTS_V206]
  ].flatMap(([version, names, receipts]) => names.map(name => {
    const origin = receipts[`assets/openai/xeno-trials-v${version}/characters/${name}`];
    assert.equal(origin?.kind, 'production-asset', 'V209 pose must have a production receipt: ' + name);
    return [name, origin.sha256];
  })),
  ...generatedV226
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
