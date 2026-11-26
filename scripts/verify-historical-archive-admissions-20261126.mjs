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

const recoveredRoot = 'archives/local-recovery-20261125';
const reconciliationPath = 'archives/dlc-historical-recovery-20261126/RECONCILIATION_20261126.json';

test('reconciliation admits exactly the 123 preserved source paths and keeps the two AVP records', () => {
  const receipt = JSON.parse(readFileSync(new URL(reconciliationPath, root), 'utf8'));
  const manifest = JSON.parse(readFileSync(new URL(recoveredRoot + '/MANIFEST.json', root), 'utf8'));
  assert.equal(receipt.source.commit, '6ed9b9210a097bbdf90ec3a22043a3fe5845e541');
  assert.equal(receipt.files.length, 123);
  assert.equal(receipt.archives.length, 16);
  assert.equal(Object.keys(files).filter(path => !path.startsWith(conversationRoot + '/')).length, 140);
  const expectedPaths = receipt.files.map(entry => entry.path).sort();
  assert.equal(new Set(expectedPaths).size, 123);
  assert.deepEqual(Object.keys(files).filter(path => path.startsWith(recoveredRoot + '/')).sort(), expectedPaths);
  const parts = manifest.archives.flatMap(archive => archive.parts.map(part => ({
    path: recoveredRoot + '/' + part.path,
    bytes: part.size_bytes,
    sha256: part.sha256,
    gitBlobSha1: part.git_blob_sha
  })));
  assert.equal(parts.length, 121);
  assert.deepEqual(parts.map(part => part.path).sort(),
    receipt.files.filter(entry => entry.archiveId).map(entry => entry.path).sort());
  for (const part of parts) {
    assert.deepEqual(files[part.path], { bytes: part.bytes, sha256: part.sha256 }, part.path);
    assert.equal(receipt.files.find(entry => entry.path === part.path).gitBlobSha1, part.gitBlobSha1, part.path);
  }
  for (const path of [recoveredRoot + '/PENDING_TRANSFER.json',
    recoveredRoot + '/avp-2004/original-standalone-v0.11.0.html']) {
    assert.equal(Object.hasOwn(files, path), false, 'AVP remains the owner of its original record');
    assert.equal(admitted(path), true, path);
    assert.equal(admitted(path, { directory: true }), false, path);
    assert.equal(admitted(path, { built: true }), false, path);
  }
  for (const path of [recoveredRoot + '/unreviewed.zip', recoveredRoot + '/alien-earth/extra.zip.part001',
    recoveredRoot + '/../escape', recoveredRoot + '/__proto__', recoveredRoot + '/MANIFEST.json/extra',
    recoveredRoot + '//MANIFEST.json', '/' + recoveredRoot + '/MANIFEST.json',
    recoveredRoot + '/alien-earth/../../private.txt']) {
    for (const directory of [false, true]) for (const built of [false, true])
      assert.equal(admitted(path, { directory, built }), false, path);
  }
});

test('reconciliation verifies all copied Git blobs, fragment hashes and 16 complete archive hashes', async () => {
  const receipt = JSON.parse(readFileSync(new URL(reconciliationPath, root), 'utf8'));
  const copied = new Map(receipt.files.map(entry => [entry.path, entry]));
  const archives = new Map(receipt.archives.map(entry => [entry.id,
    { expected: entry, hash: createHash('sha256'), bytes: 0, parts: 0 }]));
  let copiedFiles = 0;
  const result = await verify('', { readSource: async path => {
    const bytes = readFileSync(new URL(path, root));
    const expected = copied.get(path);
    if (expected) {
      assert.equal(bytes.length, expected.bytes, path);
      const gitBlob = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
      assert.equal(gitBlob, expected.gitBlobSha1, 'Changed copied Git blob: ' + path);
      copiedFiles++;
      if (expected.archiveId) {
        const archive = archives.get(expected.archiveId);
        assert.ok(archive, 'Unknown recovered archive: ' + path);
        assert.equal(archive.bytes, expected.offset, 'Out-of-order recovered range: ' + path);
        archive.hash.update(bytes); archive.bytes += bytes.length; archive.parts++;
      }
    }
    return bytes;
  } });
  assert.equal(copiedFiles, 123);
  assert.equal(result.files, Object.keys(files).length);
  assert.equal(result.bytes, Object.values(files).reduce((total, entry) => total + entry.bytes, 0));
  assert.equal(result.sourceOnly, true);
  for (const { expected, hash: archiveHash, bytes, parts } of archives.values()) {
    assert.equal(bytes, expected.bytes, expected.id);
    assert.equal(parts, expected.fragmentCount, expected.id);
    assert.equal(archiveHash.digest('hex'), expected.sha256, 'Changed reconstructed archive: ' + expected.id);
  }
});

test('reconciled source bytes cannot self-authorize mutation, truncation or absence', async () => {
  const path = recoveredRoot + '/MANIFEST.json';
  const original = readFileSync(new URL(path, root));
  const altered = Buffer.from(original); altered[0] ^= 1;
  const read = replacement => async requested => requested === path ? replacement : readFileSync(new URL(requested, root));
  await assert.rejects(verify('', { readSource: read(altered) }), /Changed historical archive bytes/);
  await assert.rejects(verify('', { readSource: read(original.subarray(1)) }), /Changed historical archive size/);
  await assert.rejects(verify('', { readSource: async requested => {
    if (requested === path) throw new Error('missing reconciled source');
    return readFileSync(new URL(requested, root));
  } }), /missing reconciled source/);
  let reads = 0;
  assert.deepEqual(await verify('', { built: true, readSource: async () => { reads++; throw new Error('archive read in build'); } }),
    { sourceOnly: true, files: 0 });
  assert.equal(reads, 0);
});

const conversationRoot = 'archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06';
const preservationWorkflow = '.github/workflows/dlc-archive-preservation.yml';

test('conversation RAR has a closed source inventory and exact native header counts', () => {
  const manifest = JSON.parse(readFileSync(new URL(conversationRoot + '/MANIFEST.json', root), 'utf8'));
  const inventory = JSON.parse(readFileSync(new URL(conversationRoot + '/RAR_CONTENTS.json', root), 'utf8'));
  const index = JSON.parse(readFileSync(new URL('archives/dlc-historical-recovery-20261126/INDEX.json', root), 'utf8'));
  assert.equal(manifest.archiveId, 'conversation-images/2026-10-06');
  assert.equal(manifest.originalFilename, 'ALIEN_IMAGES_CONVERSATION_COMPLETE_2026-10-06.rar');
  assert.equal(manifest.bytes, 168791485);
  assert.equal(manifest.sha256, '4e5a50ea8b95eb92614d0e57d48c16064dc2f8ce4a5ae208446b1618ae70882a');
  assert.equal(manifest.format, 'rar');
  assert.equal(manifest.preservation, 'exact-original-bytes');
  assert.equal(manifest.parts.length, 17);
  assert.equal(manifest.rarPayloadCrc32, 'not-tested');
  assert.deepEqual(index.preserved.filter(row => row.archiveId === manifest.archiveId), [manifest]);
  const expectedPaths = [...manifest.parts.map(part => part.path),
    conversationRoot + '/MANIFEST.json', conversationRoot + '/RAR_CONTENTS.json', conversationRoot + '/README.md'];
  assert.equal(new Set(expectedPaths).size, 20);
  assert.deepEqual(Object.keys(files).filter(path => path.startsWith(conversationRoot + '/')).sort(), expectedPaths.sort());
  for (const part of manifest.parts)
    assert.deepEqual(files[part.path], { bytes: part.bytes, sha256: part.sha256 }, part.path);
  assert.equal(inventory.complete, true);
  assert.equal(inventory.memberCount, 232);
  assert.equal(inventory.fileCount, 232);
  assert.equal(inventory.directoryCount, 0);
  assert.equal(inventory.pngCount, 227);
  assert.equal(inventory.entries.length, 232);
  assert.equal(inventory.entries.filter(entry => entry.path.toLowerCase().endsWith('.png')).length, 227);
  assert.equal(inventory.memberPayloadCrcVerified, false);
  for (const key of ['headerWarnings', 'duplicatePaths', 'unsafePaths', 'encryptedMembers'])
    assert.deepEqual(inventory[key], [], key);
  assert.equal(admitted(preservationWorkflow), true);
  assert.equal(admitted(preservationWorkflow, { directory: true }), false);
  assert.equal(admitted(preservationWorkflow, { built: true }), false);
  for (const path of [preservationWorkflow + '.unreviewed', conversationRoot + '/unknown.rar',
    conversationRoot + '/ALIEN_IMAGES_CONVERSATION_COMPLETE_2026-10-06.rar.part018',
    conversationRoot + '/MANIFEST.json/extra', conversationRoot + '/../unreviewed.png']) {
    for (const directory of [false, true]) for (const built of [false, true])
      assert.equal(admitted(path, { directory, built }), false, path);
  }
});

test('conversation RAR reconstructs exact bytes from all 17 pinned Git fragments', () => {
  const manifest = JSON.parse(readFileSync(new URL(conversationRoot + '/MANIFEST.json', root), 'utf8'));
  const archiveHash = createHash('sha256');
  const wholeGitBlob = createHash('sha1').update('blob ' + manifest.bytes + '\0');
  let offset = 0;
  for (const [index, part] of manifest.parts.entries()) {
    assert.equal(part.path, conversationRoot + '/' + manifest.originalFilename + '.part' + String(index + 1).padStart(3, '0'));
    assert.equal(part.offset, offset, 'Non-contiguous original bytes');
    const bytes = readFileSync(new URL(part.path, root));
    assert.equal(bytes.length, part.bytes, part.path);
    assert.equal(hash(bytes), part.sha256, part.path);
    assert.equal(createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex'), part.gitBlobSha1, part.path);
    archiveHash.update(bytes); wholeGitBlob.update(bytes); offset += bytes.length;
  }
  assert.equal(offset, manifest.bytes);
  assert.equal(archiveHash.digest('hex'), manifest.sha256);
  assert.equal(wholeGitBlob.digest('hex'), '85ff0458e5ad514b40f0eddcdfbb0a79342f2ce8');
});

