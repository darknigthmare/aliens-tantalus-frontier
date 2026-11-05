/** V184 — owner-approved audio slot extension (2026-11-05).
 *
 * Adds mission-feedback effects (checkpoint, locked, kill, pickup, victory) with
 * synth fallbacks, and view music scenes (travel, briefing, archives) that fall
 * back to the legacy menu music until a file exists. Continues the V183 chain:
 * each receipt names the exact predecessor bytes it replaces. This module
 * imports no other audit, so it can never admit a resolver's own bytes. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

export const AUDIO_SLOTS_SUCCESSORS_V184 = freeze({
  'assets/audio/manifest.json': {
    previousSha256: 'd846b693ef573b72fd959392234ad3d9b7bc29eff08fdce8474396e604b75163',
    currentSha256: 'fe1591ced8f54e576de99963bb6034ee35a06d07cafa5022279bd04ac9fef8ab'
  },
  'scripts/audit-original-names-v183.mjs': {
    previousSha256: '127d15d3a064f5114b6fa901c7339ce26fdc48d90a713103dbd7beaf28a1e903',
    currentSha256: '888e16fcd1860bf20ba737d7fbe31635ff1c8581fd1160c36e01522ac843378e'
  },
  'scripts/verify-public-release-v86.mjs': {
    previousSha256: '56e209fe0023cc78d312becbeb9385da5dd01c9d55e20294e004e5fe421e41f4',
    currentSha256: 'adaf958ebc835ba7a9bba7ff2bd99c4de37925e4f8c5a888e9ac33008bf750f5'
  },
  'src/app.js': {
    previousSha256: '6de0d078732aea1477034d9f67e71a112c57f8cf57b0d9bb2b750b776d8141e0',
    currentSha256: 'dca634852e81b557a9e7bc736ef77b2c2a4037dda86286bf99775e8470401aab'
  },
  'src/audio-assets-v77.js': {
    previousSha256: '6a0fe90b0981dd9b45094202bd9d23394d00472f823c31b815d6d45f425d8683',
    currentSha256: 'bbbc868dbf7e0715be6d717d1c5ff142246a95a52ba3ff2e97f4ad11c9f34ce2'
  },
  'src/audio.js': {
    previousSha256: 'ce43a728dc9cc14a7f0b1b0226163c5434fdf1eb804e349a427abdaeeac0b5c2',
    currentSha256: '7dab1c16460a748543686d3a1fc4306e36fe0e2b28ce505663ff5d2a1a6584bc'
  }
});

export function reviewedAudioSlotsDigestV184(path, endpoint) {
  const receipt = AUDIO_SLOTS_SUCCESSORS_V184[path];
  if (!receipt) return endpoint;
  assert.equal(endpoint, receipt.previousSha256, 'Broken V183-to-V184 source chain: ' + path);
  assert.ok(validHash(receipt.currentSha256), 'Invalid V184 source digest: ' + path);
  assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'A V184 successor must identify changed bytes: ' + path);
  return receipt.currentSha256;
}

export function verifyAudioSlotsV184(readSource = readRepository) {
  for (const [path, receipt] of Object.entries(AUDIO_SLOTS_SUCCESSORS_V184)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    assert.equal(sha(readSource(path)), receipt.currentSha256, 'Unreviewed V184 source bytes: ' + path);
  }
  return Object.freeze({ successors: Object.keys(AUDIO_SLOTS_SUCCESSORS_V184).length });
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  console.log(JSON.stringify(verifyAudioSlotsV184()));
}
