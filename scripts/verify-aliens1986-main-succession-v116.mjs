import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as terminalAudit from './audit-native-qa-resources-v187.mjs';
import {
  FORTIETH_RECOVERY_ROOT_20261126, FORTIETH_RECOVERY_FILES_20261126,
  fortiethRecoveryPathAdmission20261126, fortiethRecoveryFile20261126,
  verifyFortiethRecoveryBytes20261126,
} from './public-40th-source-recovery-20261126.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { createBuildAssetFilter } from './build-asset-filter.mjs';
import { RIVER_OF_PAIN_RUNTIME } from './river-of-pain-distribution.mjs';
import { ALIENS1986_RUNTIME_FILES } from './public-aliens1986-dlc-admissions.mjs';
import {
  ALIENS1986_MAIN_BASELINE_V116, ALIENS1986_MAIN_SUCCESSORS_V116,
  reviewedAliens1986MainDigestV116, verifyAliens1986MainSuccessionV116,
  RIVER_OF_PAIN_SUCCESSORS_20261125, reviewedRiverOfPainDigest20261125,
  verifyRiverOfPainSuccession20261125,
} from './audit-native-qa-resources-v187.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('Aliens continues exactly seven main files while preserving all five Fleuve endpoints', () => {
  assert.equal(ALIENS1986_MAIN_BASELINE_V116, '334fe15ba0b7e01de277a13bfc025b208163882d');
  assert.deepEqual(Object.keys(ALIENS1986_MAIN_SUCCESSORS_V116).sort(), [
    'index.html', 'package.json', 'scripts/build.mjs', 'scripts/dev.mjs',
    'scripts/verify-public-release-v86.mjs', 'src/app.js', 'src/title-screen-v61.js',
  ]);
  for (const [path, receipt] of Object.entries(RIVER_OF_PAIN_SUCCESSORS_20261125)) {
    assert.equal(ALIENS1986_MAIN_SUCCESSORS_V116[path].previousSha256, receipt.currentSha256, path);
    assert.equal(reviewedRiverOfPainDigest20261125(path, receipt.previousSha256), sha(read(path)), path);
  }
  assert.deepEqual(verifyRiverOfPainSuccession20261125(), {
    successors: 5, recoveredDlcVersion: '0.9.0-candidate.1', historicalEvidenceTransferred: false,
  });
  assert.deepEqual(verifyAliens1986MainSuccessionV116(), {
    successors: 7, historicalEvidenceTransferred: false,
  });
  // The native keyboard QA is a reviewed tooling change; the seven host receipts stay unchanged.
  assert.equal(sha(read('scripts/qa-title-compositions-v163.py')),
    '83a2cea01f17149d8a512c265604b572dac653c704001903989e66b8c94ecdba', 'Unreviewed native title keyboard QA bytes');
});

test('the new succession rejects fabricated predecessors and changed source bytes', () => {
  for (const [path, receipt] of Object.entries(ALIENS1986_MAIN_SUCCESSORS_V116)) {
    for (const forged of ['0'.repeat(64), receipt.currentSha256]) {
      assert.throws(() => reviewedAliens1986MainDigestV116(path, forged), /Broken Aliens main predecessor/);
    }
    const changed = target => target === path
      ? Buffer.concat([read(target), Buffer.from('\n/* unreviewed */')]) : read(target);
    assert.throws(() => verifyAliens1986MainSuccessionV116(changed), /Unreviewed Aliens main source bytes/);
  }
  assert.equal(reviewedAliens1986MainDigestV116('src/unrelated.js', 'unchanged'), 'unchanged');
});

test('the terminal audit remains independent of downstream audits and has no self receipt', () => {
  const path = 'scripts/audit-native-qa-resources-v187.mjs';
  assert.doesNotMatch(read(path).toString(), /from\s+['"][^'"]*audit-/);
  assert.equal(Object.hasOwn(ALIENS1986_MAIN_SUCCESSORS_V116, path), false);
  assert.equal(Object.hasOwn(RIVER_OF_PAIN_SUCCESSORS_20261125, path), false);
});

test('40th recovery admits exactly 37 immutable files and their parents in source only', () => {
  const rows = FORTIETH_RECOVERY_FILES_20261126;
  assert.equal(rows.length, 37);
  assert.equal(new Set(rows.map(row => row.path)).size, 37);
  const directories = new Set();
  for (const row of rows) {
    assert.ok(Object.isFrozen(row));
    assert.equal(fortiethRecoveryFile20261126(row.path), row);
    assert.equal(isPublicDistributionPathV86(row.path), true, row.path);
    assert.equal(isPublicDistributionPathV86(row.path, { built: true }), false, row.path);
    assert.equal(isPublicDistributionPathV86(row.path, { directory: true }), false, row.path);
    const parts = row.path.split('/');
    while (parts.length > 1) { parts.pop(); directories.add(parts.join('/')); }
  }
  for (const path of directories) {
    assert.equal(isPublicDistributionPathV86(path, { directory: true }), true, path);
    assert.equal(isPublicDistributionPathV86(path), false, path);
    assert.equal(isPublicDistributionPathV86(path, { directory: true, built: true }), false, path);
  }
  const script = 'scripts/public-40th-source-recovery-20261126.mjs';
  assert.equal(isPublicDistributionPathV86(script), true);
  assert.equal(isPublicDistributionPathV86(script, { directory: true }), false);
  assert.equal(isPublicDistributionPathV86(script, { built: true }), false);
  for (const path of [rows[0].path + '/extra', FORTIETH_RECOVERY_ROOT_20261126 + '/extra.json',
    FORTIETH_RECOVERY_ROOT_20261126 + '/parts/v0.7.0/archive.zip.part001',
    FORTIETH_RECOVERY_ROOT_20261126 + '/documents/../README.md',
    FORTIETH_RECOVERY_ROOT_20261126 + '//README.md', '/' + rows[0].path,
    rows[0].path.replaceAll('/', '\\'), rows[0].path + '\u0000']) {
    assert.equal(isPublicDistributionPathV86(path), false, path);
    assert.equal(isPublicDistributionPathV86(path, { directory: true }), false, path);
  }
  assert.equal(fortiethRecoveryPathAdmission20261126('src/app.js'), null);
});

test('40th manifest cannot authorize extra files or replace independent fragment pins', () => {
  const root = FORTIETH_RECOVERY_ROOT_20261126;
  const bytes = read(root + '/MANIFEST.json');
  assert.equal(verifyFortiethRecoveryBytes20261126(root + '/MANIFEST.json', bytes), true);
  const manifest = JSON.parse(bytes);
  assert.equal(manifest.archives.length, 6);
  const parts = manifest.archives.flatMap(archive => archive.parts);
  assert.equal(parts.length, 20);
  assert.equal(parts.reduce((sum, part) => sum + part.sizeBytes, 0), 174243911);
  for (const part of parts) {
    assert.deepEqual(fortiethRecoveryFile20261126(root + '/' + part.path), {
      path: root + '/' + part.path, bytes: part.sizeBytes, sha256: part.sha256,
    });
  }
  manifest.archives[0].parts.push({ path: 'extra.json', sizeBytes: 0, sha256: sha('') });
  assert.throws(() => verifyFortiethRecoveryBytes20261126(root + '/MANIFEST.json',
    Buffer.from(JSON.stringify(manifest))), /Changed 40th recovery/);
  assert.equal(fortiethRecoveryPathAdmission20261126(root + '/extra.json'), false);
});

test('40th original text bytes are checked, and size or same-size mutations are rejected', () => {
  const texts = FORTIETH_RECOVERY_FILES_20261126.filter(row => !row.path.includes('/parts/'));
  assert.equal(texts.length, 17);
  for (const row of texts) {
    const bytes = read(row.path);
    assert.equal(verifyFortiethRecoveryBytes20261126(row.path, bytes), true, row.path);
    assert.throws(() => verifyFortiethRecoveryBytes20261126(row.path,
      Buffer.concat([bytes, Buffer.from('x')])), /Changed 40th recovery size/);
    const changed = Buffer.from(bytes); changed[0] ^= 1;
    assert.throws(() => verifyFortiethRecoveryBytes20261126(row.path, changed), /Changed 40th recovery bytes/);
  }
  const smallestPart = FORTIETH_RECOVERY_FILES_20261126.filter(row => row.path.includes('/parts/'))
    .sort((a, b) => a.bytes - b.bytes)[0];
  assert.throws(() => verifyFortiethRecoveryBytes20261126(smallestPart.path,
    Buffer.alloc(smallestPart.bytes)), /Changed 40th recovery bytes/);
  assert.throws(() => verifyFortiethRecoveryBytes20261126('archives/unreviewed.txt', Buffer.alloc(0)),
    /Unapproved 40th recovery file/);
});

test('40th admission preserves all historical constants and continues only one exact main host', () => {
  const historical = Object.fromEntries(Object.entries(terminalAudit)
    .filter(([key, value]) => !key.startsWith('FORTIETH_') && typeof value !== 'function'));
  assert.equal(sha(JSON.stringify(historical)), '45aef466730406e39db5cda7e3bf958da5f3f393c6c4c2f33055fc047b883f9d');
  assert.equal(terminalAudit.FORTIETH_RECOVERY_BASELINE_20261126, '5f38b7bad2c6401424b23fda11aeb86068f0f354');
  assert.deepEqual(Object.keys(terminalAudit.FORTIETH_RECOVERY_SUCCESSORS_20261126), ['scripts/verify-public-release-v86.mjs']);
  assert.deepEqual(Object.keys(terminalAudit.FORTIETH_RECOVERY_SOURCE_SHA256_20261126), ['scripts/public-40th-source-recovery-20261126.mjs']);
  assert.deepEqual(terminalAudit.verifyFortiethRecoverySuccession20261126(), {
    successors: 1, addedSources: 1, runtimeChanged: false, historicalEvidenceTransferred: false,
  });
  const path = 'scripts/verify-public-release-v86.mjs';
  assert.equal(terminalAudit.FORTIETH_RECOVERY_SUCCESSORS_20261126[path].previousSha256,
    ALIENS1986_MAIN_SUCCESSORS_V116[path].currentSha256);
  const terminal = 'scripts/audit-native-qa-resources-v187.mjs';
  assert.equal(Object.hasOwn(terminalAudit.FORTIETH_RECOVERY_SUCCESSORS_20261126, terminal), false);
  assert.equal(Object.hasOwn(terminalAudit.FORTIETH_RECOVERY_SOURCE_SHA256_20261126, terminal), false);
  assert.doesNotMatch(read(terminal).toString(), /(?:from\s*|import\s*\(?\s*)['"]\.\//);
});

test('40th succession rejects forged endpoints and changed host or admission bytes', () => {
  const path = 'scripts/verify-public-release-v86.mjs';
  const receipt = terminalAudit.FORTIETH_RECOVERY_SUCCESSORS_20261126[path];
  for (const forged of ['0'.repeat(64), receipt.currentSha256])
    assert.throws(() => terminalAudit.reviewedFortiethRecoveryDigest20261126(path, forged), /Broken 40th recovery predecessor/);
  for (const target of [path, ...Object.keys(terminalAudit.FORTIETH_RECOVERY_SOURCE_SHA256_20261126)]) {
    assert.throws(() => terminalAudit.verifyFortiethRecoverySuccession20261126(candidate => candidate === target
      ? Buffer.concat([read(candidate), Buffer.from('\nchanged')]) : read(candidate)), /Unreviewed 40th recovery/);
  }
  assert.equal(terminalAudit.reviewedFortiethRecoveryDigest20261126('src/unrelated.js', 'unchanged'), 'unchanged');
});

test('the unchanged build source-copy phase keeps archives and tooling out of its output', async () => {
  // A small filesystem fixture exercises the actual two-directory copy phase.
  // This is not a complete game build or a reconstruction of the six ZIPs.
  const build = read('scripts/build.mjs').toString();
  assert.equal(sha(build), ALIENS1986_MAIN_SUCCESSORS_V116['scripts/build.mjs'].currentSha256);
  const match = build.match(/for \(const directory of \[([^\]]+)\]\) \{\s*await cp\(join\(root, directory\), join\(output, directory\), \{ recursive: true, filter: assetFilter \}\);/);
  assert.ok(match, 'Build source-copy phase changed; review its roots.');
  const roots = [...match[1].matchAll(/'([^']+)'/g)].map(row => row[1]);
  assert.deepEqual(roots, ['src', 'assets']);
  assert.ok([...RIVER_OF_PAIN_RUNTIME, ...ALIENS1986_RUNTIME_FILES].every(path => path.startsWith('dlc/')));
  const tmp = await mkdtemp(join(tmpdir(), 'fortieth-source-copy-'));
  try {
    const root = join(tmp, 'source'), output = join(tmp, 'output');
    const fixtures = ['src/control.js', 'assets/control.png',
      FORTIETH_RECOVERY_ROOT_20261126 + '/MANIFEST.json', 'scripts/public-40th-source-recovery-20261126.mjs'];
    for (const path of fixtures) {
      await mkdir(join(root, path, '..'), { recursive: true });
      await writeFile(join(root, path), 'fixture');
    }
    await mkdir(output);
    const assetFilter = createBuildAssetFilter(root);
    for (const directory of roots)
      await cp(join(root, directory), join(output, directory), { recursive: true, filter: assetFilter });
    assert.equal(await readFile(join(output, 'src/control.js'), 'utf8'), 'fixture');
    assert.equal(await readFile(join(output, 'assets/control.png'), 'utf8'), 'fixture');
    for (const path of fixtures.slice(2)) await assert.rejects(readFile(join(output, path)), { code: 'ENOENT' });
  } finally { await rm(tmp, { recursive: true, force: true }); }
});
