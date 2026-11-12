/** V188 — owner-approved P0/P1 priorities of the campaign bible (§56).
 *
 * Baseline: 803db26dbd7ed453d9534eee237806053438f300 (main after PR #46). The predecessor of
 * every receipt is the reviewed V187 endpoint of that file at this baseline.
 * The owner lifted the save/catalogue protection for this lot on 2026-11-12
 * (bible §56.1): each changed byte still needs an exact receipt here, and
 * migrations stay additive. This terminal module imports no audit and has no
 * receipt for itself. It makes no art, translation-coverage or playtest claim.
 */
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

export const TANTALUS_PRIORITIES_BASELINE_V188 = '803db26dbd7ed453d9534eee237806053438f300';
// BEGIN V188 SOURCE RECEIPTS
export const TANTALUS_PRIORITIES_SUCCESSORS_V188 = freeze({
  "LICENSE_NOTICE.md": {
    "previousSha256": "9a9f2b4bad2c4f0cd2a0b4b2b274607f12c80884489c41c30d1ea2fa1efea714",
    "currentSha256": "7cb68d12e9f47641c45c8d61d5dbf5ba846ff3688a1f5be2ed9a637cfc88fa74"
  },
  "assets/audio/manifest.json": {
    "previousSha256": "fe1591ced8f54e576de99963bb6034ee35a06d07cafa5022279bd04ac9fef8ab",
    "currentSha256": "1e2de4cf1ae7c1e5c22d42d5f82e7242b5550d651c73012b0e345fb89c51d311"
  },
  "docs/narrative/CAMPAGNE_PRINCIPALE.md": {
    "previousSha256": "95287e9c3f9be2b88db9e391a9a143c4c69be8956b6763e4113645974b9e878d",
    "currentSha256": "25e2d8ae61a4f54067a2fb2d651d991b0fcede1f38efb51139c13a1f3a791cd1"
  },
  "index.html": {
    "previousSha256": "337a0b230d0b075bf70e5122240f1ce8e0d2deaebbbd563a15496ea92b5f4d66",
    "currentSha256": "b36be58497a7e12b4d22bb3472ada31cea3e23d3517d809fbf3499783df38af1"
  },
  "package.json": {
    "previousSha256": "ff133a405bfc1ef2afa7085fcb2a6cde27a9f52c4af0de5172a058b47082eb48",
    "currentSha256": "db6f5f4707ca70af96e40010d5fc1175ae4711a0e5573ad89af54ef2a9ff20a7"
  },
  "scripts/audit-native-qa-resources-v187.mjs": {
    "previousSha256": "6be75d792e8ae0ba4d1ad6cbdaa4285e78bd958fda2eeaa23e510a5b2b49190d",
    "currentSha256": "4f2d15004b203a1171fe5cc0b1e67394a79b5a343f3a1360da5ef3604ca8dbd1"
  },
  "scripts/verify-campaign-lethe-v163.mjs": {
    "previousSha256": "cb3ac8826d4f15bbab86e0c42dcd225aeee341c9b10950046fb14af104473049",
    "currentSha256": "d2df7436c236e19240bee69843d2f122693e60de34aec776f95bfb332385864c"
  },
  "scripts/verify-campaign-story-v160.mjs": {
    "previousSha256": "a8f09d16a1e137b36b95c1473910d228289c2515b26bd3704584a2f13cfabcf8",
    "currentSha256": "7bab9f00bfb5a57a667c240be8d0cd56628aa4729349bd080c85a2bf2d383418"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "previousSha256": "8f3342580f3969a7ddef8680af2bf4ab1df6cf64c61a67419ae8add7458e21e9",
    "currentSha256": "a3efc37fd10216930c26e9afb54c52d6a6b71050c233db87b5b1c224748c166a"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "previousSha256": "763a500bddbdbac72145b64fe88419280a9d6377b80cfb7f2333140f95bc7b14",
    "currentSha256": "0b67859c912f521a2d674140dd78ea3f2ba69736ac6d6be5f4d8b8ee3a6b1f50"
  },
  "scripts/verify-public-release-v86.mjs": {
    "previousSha256": "328c764b2bf467d0bc21ae86abf415a7722bd0a88cba486eb2167c22fa8f0b84",
    "currentSha256": "dd9642dc24e300d043a006955e607d1b0891e3c33e9dd03bdb7c4fb242b9ad62"
  },
  "src/app.js": {
    "previousSha256": "482835e65677c536085a1344cf61c3ffa5e09e2af1b8029b949e000a533038ae",
    "currentSha256": "cf4c7d24ef7749f32741c6e9b8f87ed1b8cc23049b73dfbe788615fd6dc6832e"
  },
  "src/audio-assets-v77.js": {
    "previousSha256": "bbbc868dbf7e0715be6d717d1c5ff142246a95a52ba3ff2e97f4ad11c9f34ce2",
    "currentSha256": "fec1cd050aa97c1a0350954ece0945145ab84b77240b19f15fcca6eb8805c109"
  },
  "src/audio.js": {
    "previousSha256": "7dab1c16460a748543686d3a1fc4306e36fe0e2b28ce505663ff5d2a1a6584bc",
    "currentSha256": "f04d665c3f43d38587f9bdba49ae2afd76354056ecf13e4032948a4881eb00bc"
  },
  "src/game-production-runtime.js": {
    "previousSha256": "f0c9ff64ce004cc0dd8d028e3a62a717364fa0c1425eafb16b2ae8f808715419",
    "currentSha256": "40dc9feedb496e6e9edec1c16b0d8a6a7b884d845ec0a4e2da28cbd1d674b741"
  },
  "src/game-runtime.js": {
    "previousSha256": "9005aae32379ade306e187ea6c3d156f1a3083178bc0c0808d9963cdd6b8f379",
    "currentSha256": "a2dd71ff5cfc8b450172618f82a0f98710a4736e9cc64818a06b949ff7aba6d0"
  },
  "src/i18n-en-catalog-v185.js": {
    "previousSha256": "ac3632c302294c3e2869d673ad6d8cd861e1b0f62641d2d16335387746a6218a",
    "currentSha256": "7b8c8446fd2b2b122b70db6d9659d0aaecbfd2fcab6c1d5f593423707c41b876"
  },
  "src/player-creator-ui-v84.js": {
    "previousSha256": "0b5174e5ff3948b5ec987bc2fdee1aca277d64d4eb668ef369461df272bb566f",
    "currentSha256": "c3550bbe7b521b9585f5f9260d7ed1d747de660bdbdc0d0b156645e90a5daeba"
  },
  "src/save.js": {
    "previousSha256": "afd5b289887c3a6be5d704ad9b501d9cd7bfeae4514fdfb4eaf21095e6d42304",
    "currentSha256": "dd20004effccaa0767f7d9cc8ef8325e8d79bc488b12fd830c5c5f2bc0007ffc"
  },
  "styles.css": {
    "previousSha256": "5d7f49517ea4377aaf2847e7ef5f5dd5f6e4b015301e1280072d41fd9edab36c",
    "currentSha256": "50bb521df711879b4656ce0f2fccf14b5fcb3adc0a980f4e44e9f9ed9155d8e9"
  },
  "sw.js": {
    "previousSha256": "ff86bba365c3875c8ebaeb0abe13b2a6185ccd5f1a030b4ee5b15ac0e4a12f9b",
    "currentSha256": "23ea49973f38fd7c967504e1986b2f96d24b20569c53e5049a63c4809d7ee085"
  }
});
// END V188 SOURCE RECEIPTS

export const TANTALUS_PRIORITIES_SOURCE_ONLY_PATHS_V188 = Object.freeze([
  'scripts/audit-tantalus-priorities-v188.mjs',
  'scripts/verify-tantalus-priorities-v188.mjs',
  '.ai-tools/adopted-v188.json',
  'docs/development/PRIORITIES_P0_P1_V188.md'
]);

export function reviewedTantalusPrioritiesDigestV188(path, endpoint) {
  const receipt = TANTALUS_PRIORITIES_SUCCESSORS_V188[path];
  if (!receipt) return endpoint;
  assert.equal(endpoint, receipt.previousSha256, 'Broken V187-to-V188 source chain: ' + path);
  assert.ok(validHash(receipt.currentSha256), 'Invalid V188 source digest: ' + path);
  assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'A V188 successor must identify changed bytes: ' + path);
  return receipt.currentSha256;
}

export function verifyTantalusPrioritiesV188(readSource = readRepository) {
  for (const [path, receipt] of Object.entries(TANTALUS_PRIORITIES_SUCCESSORS_V188)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    assert.equal(sha(readSource(path)), reviewedTantalusPrioritiesDigestV188(path, receipt.previousSha256),
      'Unreviewed V188 source bytes: ' + path);
  }
  return Object.freeze({ successors: Object.keys(TANTALUS_PRIORITIES_SUCCESSORS_V188).length });
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  console.log(JSON.stringify(verifyTantalusPrioritiesV188()));
}
