/** V185 — owner-approved French and English text (2026-11-05, §45.1 of the
 * narrative bible). Adds a language preference kept per device outside the
 * save, a French/English dictionary for the title screen, navigation, view
 * titles and the System settings panel, and its tests. Continues the V184
 * chain: each receipt names the exact predecessor bytes it replaces. This
 * module imports no other audit, so it can never admit a resolver's own bytes. */
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

export const I18N_SUCCESSORS_V185 = freeze({
  'index.html': {
    previousSha256: 'a4f5bf1470b0b736451ffbb74cc7c07994d2c9a6f9816bb9e81f53016253d6f5',
    currentSha256: '337a0b230d0b075bf70e5122240f1ce8e0d2deaebbbd563a15496ea92b5f4d66'
  },
  'package.json': {
    previousSha256: 'ff849b03809ae5f0e8bb0949cc76291330425f881d6cd113cca536a20c79cd61',
    currentSha256: 'af8e6bff9fa01e8447a7c3d3446ac033eaee26250b6ce92d0bc91cc36284ccb8'
  },
  'scripts/audit-audio-slots-v184.mjs': {
    previousSha256: 'f732386a6a50de0edfde531925b552445df20c360703748b7af6e54bee067517',
    currentSha256: '5442b1ebba3720eb95058600990b93ca384d7d3f1c61fac1f8a3e625b3c57df6'
  },
  'scripts/verify-public-release-v86.mjs': {
    previousSha256: 'adaf958ebc835ba7a9bba7ff2bd99c4de37925e4f8c5a888e9ac33008bf750f5',
    currentSha256: '3a3973d7398cb8d74a13f5248f273611093757af93417737de9c9d195ac1d54a'
  },
  'src/app.js': {
    previousSha256: 'dca634852e81b557a9e7bc736ef77b2c2a4037dda86286bf99775e8470401aab',
    currentSha256: '482835e65677c536085a1344cf61c3ffa5e09e2af1b8029b949e000a533038ae'
  },
  'src/hub-v71-runtime.js': {
    previousSha256: '289b6c489f20563b39ac3cebda505dcefc0008d6237948a4d154100c7ad183a4',
    currentSha256: '0013ef68e3db38888a83e97b88ab5615b8a3b4ebe9f229c7d659a5381433956a'
  },
  'src/player-creator-ui-v84.js': {
    previousSha256: '6eab777a85e20594def1881aa9637fc1fab981281ea8e033c5afa2d253bb978d',
    currentSha256: '0b5174e5ff3948b5ec987bc2fdee1aca277d64d4eb668ef369461df272bb566f'
  },
  'src/title-screen-v61.js': {
    previousSha256: '62466850a993e23cae9219e0ec8655b237251784fa70b91ad8a9487e3bb5922d',
    currentSha256: 'e0c10ca738df12c78b48a24d79cb049aea2ac3e1c08ec270d3eed750fe267342'
  },
  'sw.js': {
    previousSha256: 'c3e1b4a7f3bf10623f3e3962a309f981bd895f7ddb81d5a4dc03a79fa648b8aa',
    currentSha256: 'ff86bba365c3875c8ebaeb0abe13b2a6185ccd5f1a030b4ee5b15ac0e4a12f9b'
  }
});

export function reviewedI18nDigestV185(path, endpoint) {
  const receipt = I18N_SUCCESSORS_V185[path];
  if (!receipt) return endpoint;
  assert.equal(endpoint, receipt.previousSha256, 'Broken V184-to-V185 source chain: ' + path);
  assert.ok(validHash(receipt.currentSha256), 'Invalid V185 source digest: ' + path);
  assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'A V185 successor must identify changed bytes: ' + path);
  return receipt.currentSha256;
}

export function verifyI18nV185(readSource = readRepository) {
  for (const [path, receipt] of Object.entries(I18N_SUCCESSORS_V185)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    assert.equal(sha(readSource(path)), receipt.currentSha256, 'Unreviewed V185 source bytes: ' + path);
  }
  return Object.freeze({ successors: Object.keys(I18N_SUCCESSORS_V185).length });
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  console.log(JSON.stringify(verifyI18nV185()));
}
