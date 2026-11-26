import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { HISTORICAL_ARCHIVE_FILES_20261126 as files, verifyHistoricalArchiveSources20261126 as verify } from './historical-archive-admissions-20261126.mjs';
import { isPublicDistributionPathV86 as admitted } from './verify-public-release-v86.mjs';
import { EXCLUDED_BUILD_ASSET_PATHS } from './build-asset-filter.mjs';
import { AVP_HISTORICAL_ARCHIVE_BASELINE_20261126 as baseline, AVP_HISTORICAL_ARCHIVE_SUCCESSORS_20261126 as successors,
  AVP_DLC_ARCHIVE_SOURCE_SUCCESSORS_20261126 as previous, reviewedHistoricalArchiveHostDigest20261126 as advance } from './audit-dlc-avp-2004-20261125.mjs';
const root = new URL('../', import.meta.url);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

test('historical archive admission is closed, typed and excluded from public builds', () => {
  assert.ok(Object.isFrozen(files));
  assert.ok(Object.keys(files).length > 0);
  assert.ok(EXCLUDED_BUILD_ASSET_PATHS.includes('archives'));
  for (const [path, record] of Object.entries(files)) {
    assert.ok(Object.isFrozen(record));
    assert.match(record.sha256, /^[a-f0-9]{64}$/);
    assert.ok(Number.isSafeInteger(record.bytes) && record.bytes >= 0);
    assert.equal(admitted(path), true, path);
    assert.equal(admitted(path, { directory: true }), false, path);
    assert.equal(admitted(path, { built: true }), false, path);
    assert.equal(admitted(path + '.unreviewed'), false, path);
    const segments = path.split('/');
    for (let i = 1; i < segments.length; i++) {
      const directory = segments.slice(0, i).join('/');
      assert.equal(admitted(directory, { directory: true }), true, directory);
      assert.equal(admitted(directory, { directory: true, built: true }), false, directory);
    }
  }
  for (const path of ['archives/dlc-historical-recovery-20261126/unknown.zip', 'archives/dlc-historical-recovery-20261126/../escape', 'archives/dlc-historical-recovery-20261126/__proto__'])
    assert.equal(admitted(path), false, path);
});

test('historical archive validation rejects same-length changes, truncation and missing bytes', async () => {
  const first = Object.keys(files)[0];
  const original = readFileSync(new URL(first, root));
  assert.equal(hash(original), files[first].sha256);
  const altered = Buffer.from(original); altered[0] ^= 1;
  await assert.rejects(verify('', { readSource: async () => altered }), /Changed historical archive bytes/);
  await assert.rejects(verify('', { readSource: async () => original.subarray(1) }), /Changed historical archive size/);
  await assert.rejects(verify('', { readSource: async () => { throw new Error('missing source'); } }), /missing source/);
});

test('historical source continuation preserves PR73 receipt and accepts its exact endpoint once', () => {
  assert.equal(baseline, '6b46eaf8f574871e39487e0a10ef46acfb1f41a6');
  assert.equal(hash(JSON.stringify(previous)), '4ee82a5db250154a4e17802edefec0b27c837013dfc04cb225d958cf403e3e56');
  assert.deepEqual(Object.keys(successors), ['scripts/verify-public-release-v86.mjs']);
  for (const [path, receipt] of Object.entries(successors)) {
    assert.ok(Object.isFrozen(receipt));
    assert.equal(receipt.previousSha256, previous[path].currentSha256);
    assert.equal(hash(readFileSync(new URL(path, root))), receipt.currentSha256);
    assert.equal(advance(path, receipt.previousSha256), receipt.currentSha256);
    for (const wrong of [receipt.currentSha256, '0'.repeat(64), undefined])
      assert.throws(() => advance(path, wrong), /Broken PR73-to-historical-archive source chain/);
  }
  assert.equal(advance('scripts/audit-dlc-avp-2004-20261125.mjs', 'unchanged'), 'unchanged');
});
