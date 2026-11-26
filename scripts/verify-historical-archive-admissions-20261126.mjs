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
const earthRoot = 'archives/dlc-historical-recovery-20261126/alien-earth';
const blackoutRoot = 'archives/dlc-historical-recovery-20261126/alien-blackout';
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
  assert.equal(Object.keys(files).filter(path => !path.startsWith(conversationRoot + '/') && !path.startsWith(blackoutRoot + '/') && !path.startsWith(earthRoot + '/')).length, 140);
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


const blackoutExpected = [
  {
    "archiveId": "alien-blackout/v0.1.0",
    "bytes": 7604057,
    "sha256": "7c74c14e3e1e660b8285be220953e872e1745909465e8e937348d3129bebd304",
    "wholeArchiveGitBlobSha1": "d2ff3598915a0eee61cd8339090cb8a1993bcad8",
    "memberCount": 76,
    "pngOccurrences": 9
  },
  {
    "archiveId": "alien-blackout/v0.2.0",
    "bytes": 19015524,
    "sha256": "285aeffe826cd122b3fe8c2da90cb54f8cdb346709ae91493099c75b8d201794",
    "wholeArchiveGitBlobSha1": "1cefa41bc467e173f0cf99a3e91c110b5c502449",
    "memberCount": 178,
    "pngOccurrences": 0
  },
  {
    "archiveId": "alien-blackout/v0.3.0",
    "bytes": 15692851,
    "sha256": "d6f9e904153ce91c31324897f77a1a7df93db92f88ec5db64675df8c44e08fc8",
    "wholeArchiveGitBlobSha1": "d32f8893b6a36f0e73b5bc44ec15a86ac36a969e",
    "memberCount": 220,
    "pngOccurrences": 0
  },
  {
    "archiveId": "alien-blackout/v0.4.0",
    "bytes": 20737593,
    "sha256": "579936acdb52b58c629c3e944ed7db853b66225dc81369ce0f9179912aa379ad",
    "wholeArchiveGitBlobSha1": "5c458d8068c65a3e83e6068c4b97c88e2c4ad685",
    "memberCount": 281,
    "pngOccurrences": 0
  },
  {
    "archiveId": "alien-blackout/v0.5.0",
    "bytes": 23799439,
    "sha256": "e44b6ffab9350a3dad521eab4466e5ecf7c3d96000e10558a070b2e55600d664",
    "wholeArchiveGitBlobSha1": "b69c230d5413c6511547c36d6d102c71bcc9b56e",
    "memberCount": 337,
    "pngOccurrences": 0
  },
  {
    "archiveId": "alien-blackout/v0.6.0",
    "bytes": 25056068,
    "sha256": "8102117a0d1e16b9f121a403659bde35ccfc82c93f747b15d40bef7dce748663",
    "wholeArchiveGitBlobSha1": "1dc1b383b574023e2df7b8f2b52b94e85cac0788",
    "memberCount": 304,
    "pngOccurrences": 0
  }
];

test('Blackout v0.1-v0.6 preserves six complete ZIP inventories behind exact source paths', () => {
  const index = JSON.parse(readFileSync(new URL('archives/dlc-historical-recovery-20261126/INDEX.json', root), 'utf8'));
  assert.equal(Object.keys(files).filter(path => !path.startsWith(blackoutRoot + '/') && !path.startsWith(earthRoot + '/')).length, 160);
  const paths = [blackoutRoot + '/README.md'];
  let members = 0, pngs = 0, bytes = 0, fragments = 0;
  for (const expected of blackoutExpected) {
    const folder = 'archives/dlc-historical-recovery-20261126/' + expected.archiveId;
    const manifest = JSON.parse(readFileSync(new URL(folder + '/MANIFEST.json', root), 'utf8'));
    const inventory = JSON.parse(readFileSync(new URL(folder + '/ZIP_CONTENTS.json', root), 'utf8'));
    for (const [key, value] of Object.entries(expected)) assert.equal(manifest[key], value, expected.archiveId + ':' + key);
    assert.equal(manifest.originalFilename, 'ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_' + expected.archiveId.split('/')[1] + '.zip');
    assert.equal(manifest.format, 'zip');
    assert.equal(manifest.preservation, 'exact-original-bytes');
    assert.equal(manifest.zipCrc32, 'verified');
    assert.equal(manifest.manifest, folder + '/MANIFEST.json');
    assert.equal(manifest.contents, folder + '/ZIP_CONTENTS.json');
    assert.deepEqual(index.preserved.filter(row => row.archiveId === expected.archiveId), [manifest]);
    const candidate = index.candidates.filter(row => row.filename === manifest.originalFilename);
    assert.equal(candidate.length, 1);
    assert.equal(candidate[0].status, 'preserved-exact-in-this-recovery');
    assert.equal(candidate[0].sha256, manifest.sha256);
    assert.equal(inventory.complete, true);
    assert.equal(inventory.allMemberCrc32Verified, true);
    assert.equal(inventory.entries.length, expected.memberCount);
    assert.equal(inventory.entries.filter(row => !row.directory && row.path.toLowerCase().endsWith('.png')).length, expected.pngOccurrences);
    assert.deepEqual(inventory.duplicatePaths, []);
    assert.deepEqual(inventory.unsafePaths, []);
    for (const row of inventory.entries) {
      assert.match(row.sha256, /^[a-f0-9]{64}$/);
      assert.match(row.crc32, /^[a-f0-9]{8}$/);
      assert.equal(row.unsafePath, false);
    }
    for (const part of manifest.parts) {
      assert.deepEqual(files[part.path], { bytes: part.bytes, sha256: part.sha256 }, part.path);
      assert.ok(part.bytes > 0 && part.bytes <= 10485760);
      paths.push(part.path);
    }
    paths.push(manifest.manifest, manifest.contents);
    members += manifest.memberCount; pngs += manifest.pngOccurrences; bytes += manifest.bytes; fragments += manifest.parts.length;
  }
  assert.equal(bytes, 111905532);
  assert.equal(members, 1396);
  assert.equal(pngs, 9);
  assert.equal(fragments, 13);
  assert.equal(paths.length, 26);
  assert.equal(new Set(paths).size, 26);
  assert.deepEqual(Object.keys(files).filter(path => path.startsWith(blackoutRoot + '/')).sort(), paths.sort());
  for (const path of [blackoutRoot + '/unreviewed.zip', blackoutRoot + '/v0.6.0/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.6.0.zip.part004',
    blackoutRoot + '/../unknown', blackoutRoot + '/v0.1.0/MANIFEST.json/extra'])
    for (const directory of [false, true]) for (const built of [false, true])
      assert.equal(admitted(path, { directory, built }), false, path);
});

test('Blackout originals reconstruct their SHA256 and Git hashes from all 13 fragments', () => {
  for (const expected of blackoutExpected) {
    const manifest = JSON.parse(readFileSync(new URL('archives/dlc-historical-recovery-20261126/' + expected.archiveId + '/MANIFEST.json', root), 'utf8'));
    const archiveHash = createHash('sha256');
    const archiveGit = createHash('sha1').update('blob ' + expected.bytes + '\0');
    let offset = 0;
    for (const [index, part] of manifest.parts.entries()) {
      const path = 'archives/dlc-historical-recovery-20261126/' + expected.archiveId + '/' + manifest.originalFilename + '.part' + String(index + 1).padStart(3, '0');
      assert.equal(part.path, path);
      assert.equal(part.offset, offset, path);
      const bytes = readFileSync(new URL(path, root));
      assert.equal(bytes.length, part.bytes, path);
      assert.equal(hash(bytes), part.sha256, path);
      assert.equal(createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex'), part.gitBlobSha1, path);
      archiveHash.update(bytes); archiveGit.update(bytes); offset += bytes.length;
    }
    assert.equal(offset, expected.bytes, expected.archiveId);
    assert.equal(archiveHash.digest('hex'), expected.sha256, expected.archiveId);
    assert.equal(archiveGit.digest('hex'), expected.wholeArchiveGitBlobSha1, expected.archiveId);
  }
});

const earthExpected = [
  {
    "archiveId": "alien-earth/v1",
    "originalFilename": "ALIEN_EARTH_DLC_V1_PROTOTYPE_JOUABLE.zip",
    "bytes": 11089227,
    "sha256": "f47ab4a6a99a64158b34663571277a5623ce567ff3e96a391b02874974193f77",
    "wholeArchiveGitBlobSha1": "0da24be3333f73f015707ca95115dafd36a3055f",
    "memberCount": 43,
    "pngOccurrences": 12
  },
  {
    "archiveId": "alien-earth/v2",
    "originalFilename": "ALIEN_EARTH_DLC_V2_MODULE_COMPLET.zip",
    "bytes": 16902480,
    "sha256": "bb879ec2d1677a01cb5798f63972b28f397ffef8957e959c3cbfea95b80f8086",
    "wholeArchiveGitBlobSha1": "229abd3a06b98d9dd30b73c4012e9b9449d7b8c7",
    "memberCount": 69,
    "pngOccurrences": 25
  },
  {
    "archiveId": "alien-earth/v3",
    "originalFilename": "ALIEN_EARTH_DLC_V3_MODULE_COMPLET.zip",
    "bytes": 16185188,
    "sha256": "da9c35a79591ad2c4f9d7cc616c5782735a9c9f484474ed47778d925c4154780",
    "wholeArchiveGitBlobSha1": "db961defde4eb8d0049e261f123de8666a73beb3",
    "memberCount": 73,
    "pngOccurrences": 25
  },
  {
    "archiveId": "alien-earth/v4",
    "originalFilename": "ALIEN_EARTH_DLC_V4_MODULE_COMPLET.zip",
    "bytes": 14122782,
    "sha256": "4235e12983f36c2079bc346598fd5697757dc937691391cfd7a754178767e8dc",
    "wholeArchiveGitBlobSha1": "149ba14af4639fd3de794fcf7d8fe1b94d782ce5",
    "memberCount": 84,
    "pngOccurrences": 24
  },
  {
    "archiveId": "alien-earth/v5",
    "originalFilename": "ALIEN_EARTH_DLC_V5_MODULE_COMPLET.zip",
    "bytes": 19392814,
    "sha256": "1df3294a24538ad636c8245e4b15353df97a469516ae14f54f74f3b437afa8c1",
    "wholeArchiveGitBlobSha1": "e54015928b4afd7fa00e636361a6df586d4a9298",
    "memberCount": 105,
    "pngOccurrences": 37
  },
  {
    "archiveId": "alien-earth/v6",
    "originalFilename": "ALIEN_EARTH_DLC_V6_MODULE_COMPLET.zip",
    "bytes": 22772673,
    "sha256": "47075ae3467b9a3c149ad92afec5cc434e7ee6f6ef2cb6ea8fa121d342e9a227",
    "wholeArchiveGitBlobSha1": "ae07818831f6ba0d717ed92f816c76c51251f790",
    "memberCount": 143,
    "pngOccurrences": 48
  },
  {
    "archiveId": "alien-earth/v7",
    "originalFilename": "ALIEN_EARTH_DLC_V7_MODULE_COMPLET.zip",
    "bytes": 29105693,
    "sha256": "e5123f208ddb844b47fc876612d945f721ce3d382620cfa389fac1dd75d27b5c",
    "wholeArchiveGitBlobSha1": "9e0c3251a759d5c1773d0b6519eb1e4cbbd7f85f",
    "memberCount": 172,
    "pngOccurrences": 57
  },
  {
    "archiveId": "alien-earth/v8",
    "originalFilename": "ALIEN_EARTH_DLC_V8_MODULE_COMPLET.zip",
    "bytes": 30595564,
    "sha256": "d4d30711500d317b1f0e4d408ea9d3122fb7a5b56607a6a3d7162501eb6ca8a9",
    "wholeArchiveGitBlobSha1": "2f6e2d9a3346594b3cb97784f9ea281c1c85de58",
    "memberCount": 199,
    "pngOccurrences": 69
  },
  {
    "archiveId": "alien-earth/v9",
    "originalFilename": "ALIEN_EARTH_DLC_V9_MODULE_COMPLET.zip",
    "bytes": 36819269,
    "sha256": "7680925c191f65ca205925e5268594f6fa03c6b2d08cf796c60f22d40969ef49",
    "wholeArchiveGitBlobSha1": "702d4c64f340007ace43adbec7bb334d40f94156",
    "memberCount": 224,
    "pngOccurrences": 79
  },
  {
    "archiveId": "alien-earth/v10",
    "originalFilename": "ALIEN_EARTH_DLC_V10_MODULE_COMPLET.zip",
    "bytes": 39336861,
    "sha256": "b0afb821b6acbe57f591c9c489426abb4c3b8e92bb945f7b2dc0b5e9b67423e7",
    "wholeArchiveGitBlobSha1": "594a4b3eb40417be3147e3a50a117370350b67e8",
    "memberCount": 202,
    "pngOccurrences": 81
  }
];

test('Earth V1-V10 preserves ten exact ZIP inventories and closed source admissions', () => {
  const index = JSON.parse(readFileSync(new URL('archives/dlc-historical-recovery-20261126/INDEX.json', root), 'utf8'));
  assert.equal(Object.keys(files).filter(path => !path.startsWith(earthRoot + '/')).length, 186);
  const paths = [earthRoot + '/README.md'];
  let members = 0, pngs = 0, bytes = 0, fragments = 0;
  for (const [position, expected] of earthExpected.entries()) {
    assert.equal(expected.archiveId, 'alien-earth/v' + (position + 1));
    const folder = 'archives/dlc-historical-recovery-20261126/' + expected.archiveId;
    const manifest = JSON.parse(readFileSync(new URL(folder + '/MANIFEST.json', root), 'utf8'));
    const inventory = JSON.parse(readFileSync(new URL(folder + '/ZIP_CONTENTS.json', root), 'utf8'));
    for (const [key, value] of Object.entries(expected)) assert.equal(manifest[key], value, expected.archiveId + ':' + key);
    assert.equal(manifest.format, 'zip');
    assert.equal(manifest.preservation, 'exact-original-bytes');
    assert.equal(manifest.zipCrc32, 'verified');
    assert.equal(manifest.manifest, folder + '/MANIFEST.json');
    assert.equal(manifest.contents, folder + '/ZIP_CONTENTS.json');
    assert.deepEqual(index.preserved.filter(row => row.archiveId === expected.archiveId), [manifest]);
    const candidate = index.candidates.filter(row => row.filename === manifest.originalFilename);
    assert.equal(candidate.length, 1);
    assert.equal(candidate[0].status, 'preserved-exact-in-this-recovery');
    assert.equal(candidate[0].sha256, manifest.sha256);
    assert.equal(inventory.filename, manifest.originalFilename);
    assert.equal(inventory.complete, true);
    assert.equal(inventory.allMemberCrc32Verified, true);
    assert.equal(inventory.entries.length, expected.memberCount);
    assert.equal(inventory.fileCount + inventory.directoryCount, expected.memberCount);
    assert.equal(inventory.entries.filter(row => !row.directory && row.path.toLowerCase().endsWith('.png')).length, expected.pngOccurrences);
    assert.deepEqual(inventory.duplicatePaths, []);
    assert.deepEqual(inventory.unsafePaths, []);
    for (const row of inventory.entries) {
      assert.match(row.sha256, /^[a-f0-9]{64}$/);
      assert.match(row.crc32, /^[a-f0-9]{8}$/);
      assert.equal(row.unsafePath, false);
    }
    for (const part of manifest.parts) {
      assert.deepEqual(files[part.path], { bytes: part.bytes, sha256: part.sha256 }, part.path);
      assert.ok(part.bytes > 0 && part.bytes <= 10485760);
      paths.push(part.path);
    }
    paths.push(manifest.manifest, manifest.contents);
    members += manifest.memberCount; pngs += manifest.pngOccurrences; bytes += manifest.bytes; fragments += manifest.parts.length;
  }
  assert.equal(bytes, 236322551);
  assert.equal(members, 1314);
  assert.equal(pngs, 457);
  assert.equal(fragments, 27);
  assert.equal(paths.length, 48);
  assert.equal(new Set(paths).size, 48);
  assert.deepEqual(Object.keys(files).filter(path => path.startsWith(earthRoot + '/')).sort(), paths.sort());
  for (const path of [earthRoot + '/unreviewed.zip', earthRoot + '/v10/ALIEN_EARTH_DLC_V10_MODULE_COMPLET.zip.part005',
    earthRoot + '/../unknown', earthRoot + '/v1/MANIFEST.json/extra', earthRoot + '/v11/unknown.zip'])
    for (const directory of [false, true]) for (const built of [false, true])
      assert.equal(admitted(path, { directory, built }), false, path);
});

test('Earth V1-V10 reconstruct their original SHA256 and Git hashes from all 27 fragments', () => {
  for (const expected of earthExpected) {
    const manifest = JSON.parse(readFileSync(new URL('archives/dlc-historical-recovery-20261126/' + expected.archiveId + '/MANIFEST.json', root), 'utf8'));
    const archiveHash = createHash('sha256');
    const archiveGit = createHash('sha1').update('blob ' + expected.bytes + '\0');
    let offset = 0;
    for (const [index, part] of manifest.parts.entries()) {
      const path = 'archives/dlc-historical-recovery-20261126/' + expected.archiveId + '/' + manifest.originalFilename + '.part' + String(index + 1).padStart(3, '0');
      assert.equal(part.path, path);
      assert.equal(part.offset, offset, path);
      const bytes = readFileSync(new URL(path, root));
      assert.equal(bytes.length, part.bytes, path);
      assert.equal(hash(bytes), part.sha256, path);
      assert.equal(createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex'), part.gitBlobSha1, path);
      archiveHash.update(bytes); archiveGit.update(bytes); offset += bytes.length;
    }
    assert.equal(offset, expected.bytes, expected.archiveId);
    assert.equal(archiveHash.digest('hex'), expected.sha256, expected.archiveId);
    assert.equal(archiveGit.digest('hex'), expected.wholeArchiveGitBlobSha1, expected.archiveId);
  }
});
