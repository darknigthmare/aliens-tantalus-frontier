/** V183 — owner-validated original names (2026-11-05).
 *
 * Continues the V182 join for the bytes changed by the renaming of the project
 * world (Lethe → Cocyte), Pioneer Station (→ Station Orphée), the former
 * Freya's Prospect slot (→ Hiémale, Freya's Prospect becoming BG-386's colony)
 * and the correction of generated biomes/atmospheres of franchise worlds.
 * World identifiers, save keys and generated gameplay values (danger,
 * infestation, stability) are unchanged; only displayed data moves.
 *
 * Each receipt names the exact predecessor bytes it replaces. This module does
 * not import the V182 audit, so it can never admit its own resolver's bytes. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { reviewedAudioSlotsDigestV184 } from './audit-audio-slots-v184.mjs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

export const ORIGINAL_NAMES_SUCCESSORS_V183 = freeze({
  'scripts/audit-pr-integration-v182.mjs': {
    previousSha256: '92a0a0fc067c90a499b8f6d7604f5f04b6cd46a6d73ad1d8b30c437d7d1880f8',
    currentSha256: '8662e7a399ec550e398ae18f41c36ef9803c55abbc21a9de2e30606c0032acd1'
  },
  'scripts/audit-succession-v163.mjs': {
    previousSha256: '467983aef6f72cfd208130b7671a36f6f06067d0d91b7baac85c64ff5cc6644f',
    currentSha256: 'd69451f1d8848662cac1264b24640faec9346ff36c633e62802378fc9a981390'
  },
  'scripts/verify-audit-continuation-v163.mjs': {
    previousSha256: 'a2e5a4036d4adcb7d66798652b7944b4898a6c55331b617ab98c993a8c383aa5',
    currentSha256: '7d1f368a4a6e5b3f8ae8a5161c8a8d819e32c33a14013dfed2ef8a1bb16cbd29'
  },
  'scripts/verify-public-release-v86.mjs': {
    previousSha256: '9204eed81123bc26eed9a517f1727733a36879e9963ca0202b8b8ceda2a1404a',
    currentSha256: '56e209fe0023cc78d312becbeb9385da5dd01c9d55e20294e004e5fe421e41f4'
  },
  'src/campaign-convoy-history-ui-v162.js': {
    previousSha256: 'e973c53c63ef8b425772ad049cab133b7052532be6956210e149174b3d940619',
    currentSha256: 'd1185471df1479ee47dd6c32689f944e8e0b22ce558c1462481126aa0ccfc6b3'
  },
  'src/campaign-convoy-story-ui-v161.js': {
    previousSha256: 'e5dad2c548c7cf05584e88330538f0d606d330e99645e5a48fcef51d235e707c',
    currentSha256: '0e56e8f903fd68095b04f0c56c1a52305f701a409fa1527f4237cd53a681e7eb'
  },
  'src/campaign-convoy-story-v161.js': {
    previousSha256: '17e3abceb4554a1223d4a456038d7664d42c44d5b96297285b73814678fc274e',
    currentSha256: 'ce2859f1f2636f22b370c467bb2457a992dc7a8fd6bd26349c61e0fada10c6e7'
  },
  'src/campaign-story-v160.js': {
    previousSha256: '649bb76d681b3d162d9966163becf1e65e9b40f3b3e5c6216dd6cc17acb8cd4c',
    currentSha256: 'b4f65bc360af9a952dced25446e07a11aa95a480e65de144fde247848f3d64bd'
  },
  'src/content-core-v50.js': {
    previousSha256: 'fc71b52d7dbe8b5ca69beb38cdbc19690fe67534372358b0998004e829cb3555',
    currentSha256: '6d073593ea5854b17ae626556ba6bf6259f835bd4eb59ba3e0d1a5c785418fdb'
  },
  'src/ecosystem-missions-v131.js': {
    previousSha256: 'a103a3fc109209fcc76c0d7b373317a9f54f085af3933454e21bd200a4bf2429',
    currentSha256: '63bb1d49b9ee5b34114ea3353897fe9a1fd6314a6841ab04ef221552d3a3c889'
  },
  'src/ecosystem-systems-v131.js': {
    previousSha256: 'ebbd26783149e569566850362a7192c7608b8b306b175c4577f6e7b0ff7f05a5',
    currentSha256: '8ee1253920709a8d00ded0306b8937de490941a46abc718b9f0e2f89c34bb7a3'
  },
  'src/special-operations-v67.js': {
    previousSha256: '663239f2c5a4ee5613c396c3ec2cff8beed6e654cd9909c45af0321c6f09194f',
    currentSha256: '3a6760b8d8629764ce078263a0538a95bcfa90fe23a63ec3df9b62e358afd0f2'
  }
});

export function reviewedOriginalNamesDigestV183(path, endpoint) {
  const receipt = ORIGINAL_NAMES_SUCCESSORS_V183[path];
  // V184 (audit-audio-slots-v184.mjs) continues this chain.
  if (!receipt) return reviewedAudioSlotsDigestV184(path, endpoint);
  assert.equal(endpoint, receipt.previousSha256, 'Broken V182-to-V183 source chain: ' + path);
  assert.ok(validHash(receipt.currentSha256), 'Invalid V183 source digest: ' + path);
  assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'A V183 successor must identify changed bytes: ' + path);
  return reviewedAudioSlotsDigestV184(path, receipt.currentSha256);
}

export function verifyOriginalNamesV183(readSource = readRepository) {
  for (const [path, receipt] of Object.entries(ORIGINAL_NAMES_SUCCESSORS_V183)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    assert.equal(sha(readSource(path)), reviewedAudioSlotsDigestV184(path, receipt.currentSha256), 'Unreviewed V183 source bytes: ' + path);
  }
  return Object.freeze({ successors: Object.keys(ORIGINAL_NAMES_SUCCESSORS_V183).length });
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  console.log(JSON.stringify(verifyOriginalNamesV183()));
}
