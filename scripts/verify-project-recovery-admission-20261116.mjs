import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import {
  PROJECT_RECOVERY_ROOT_20261116 as archiveRoot,
  PROJECT_RECOVERY_MANIFEST_20261116 as manifestPath,
  PROJECT_RECOVERY_TOOLS_20261116,
  compileProjectRecoveryManifest20261116,
  projectRecoveryPathAdmission20261116,
  reviewedProjectRecovery20261116,
  verifyProjectRecoveryArchive20261116,
} from './project-recovery-admission-20261116.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { createBuildAssetFilter, EXCLUDED_BUILD_ASSET_PATHS } from './build-asset-filter.mjs';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const memberPath = `${archiveRoot}/predator/original.zip`;
const original = Buffer.from('Archive fixture\r\nExact historical bytes.\r\n');
const manifest = () => ({ schemaVersion: 1, archiveRoot,
  files: [{ path: memberPath, sizeBytes: original.length, sha256: digest(original) }] });
const encoded = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'tantalus-predator-recovery-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(dirname(join(root, manifestPath)), { recursive: true });
  await mkdir(dirname(join(root, memberPath)), { recursive: true });
  const bytes = encoded(manifest());
  await writeFile(join(root, manifestPath), bytes);
  await writeFile(join(root, memberPath), original);
  return { root, expectedSha256: digest(bytes) };
}

test('exact source inventory verifies bytes and rejects every unknown archive path', async t => {
  const { root, expectedSha256 } = await fixture(t);
  assert.deepEqual(await verifyProjectRecoveryArchive20261116(root, { expectedSha256 }), {
    ok: true, files: 1, bytes: original.length, manifestSha256: expectedSha256, built: false,
  });
  const inventory = compileProjectRecoveryManifest20261116(encoded(manifest()), expectedSha256);
  assert.equal(inventory.admits(memberPath), true);
  assert.equal(inventory.admits(`${archiveRoot}/predator`, { directory: true }), true);
  assert.equal(inventory.admits(memberPath, { directory: true }), false);
  assert.equal(inventory.admits(`${archiveRoot}/predator/unlisted.zip`), false);
  assert.equal(inventory.admits('assets/openai/existing.png'), null);
});

test('archives and their tools are excluded by the build and public release policy', async t => {
  const { root } = await fixture(t);
  const filter = createBuildAssetFilter(root);
  assert.ok(EXCLUDED_BUILD_ASSET_PATHS.includes('archives'));
  for (const path of ['archives', archiveRoot, `${archiveRoot}/predator`, memberPath, manifestPath,
    ...PROJECT_RECOVERY_TOOLS_20261116]) {
    assert.equal(projectRecoveryPathAdmission20261116(path, { built: true }), false);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false);
    assert.equal(isPublicDistributionPathV86(path, { built: true, directory: true }), false);
    if (path.startsWith('archives')) assert.equal(filter(join(root, path)), false);
  }
  await assert.rejects(verifyProjectRecoveryArchive20261116(root, { built: true }), /must not be present/);
  await rm(join(root, 'archives'), { recursive: true });
  assert.equal((await verifyProjectRecoveryArchive20261116(root, { built: true })).ok, true);
});

test('a modified manifest cannot authorize changed bytes under the reviewed pin', () => {
  const reviewed = encoded(manifest());
  const changed = manifest(); changed.files[0].sha256 = 'f'.repeat(64);
  assert.throws(() => compileProjectRecoveryManifest20261116(encoded(changed), digest(reviewed)), /Unreviewed/);
});

test('unsafe paths, duplicate entries and file-directory collisions are refused', () => {
  for (const path of ['../escape', `${archiveRoot}/../escape`, `${archiveRoot}//empty`,
    `${archiveRoot}/dot/./file`, `${archiveRoot}\\backslash`, manifestPath, '/absolute', 'src/override.js']) {
    const bad = manifest(); bad.files[0].path = path; const bytes = encoded(bad);
    assert.throws(() => compileProjectRecoveryManifest20261116(bytes, digest(bytes)), /Unsafe/);
  }
  const duplicate = manifest(); duplicate.files.push({ ...duplicate.files[0] });
  assert.throws(() => compileProjectRecoveryManifest20261116(encoded(duplicate), digest(encoded(duplicate))), /Duplicate/);
  const collision = manifest(); collision.files.push({ ...collision.files[0], path: `${archiveRoot}/predator` });
  assert.throws(() => compileProjectRecoveryManifest20261116(encoded(collision), digest(encoded(collision))), /collision/);
});

test('same-length byte changes and missing archive files fail integrity checks', async t => {
  const { root, expectedSha256 } = await fixture(t);
  await writeFile(join(root, memberPath), Buffer.alloc(original.length, 65));
  await assert.rejects(verifyProjectRecoveryArchive20261116(root, { expectedSha256 }), /Changed project recovery bytes/);
  await rm(join(root, memberPath));
  await assert.rejects(verifyProjectRecoveryArchive20261116(root, { expectedSha256 }), /Missing project recovery/);
});

test('unlisted files, directories and archive symlinks cannot enter the source inventory', async t => {
  const { root, expectedSha256 } = await fixture(t);
  const extra = join(root, archiveRoot, 'extra.txt');
  await writeFile(extra, 'Unreviewed bytes');
  await assert.rejects(verifyProjectRecoveryArchive20261116(root, { expectedSha256 }), /Unlisted/);
  await rm(extra);
  await mkdir(join(root, archiveRoot, 'unlisted'));
  await assert.rejects(verifyProjectRecoveryArchive20261116(root, { expectedSha256 }), /Unlisted/);
  await rm(join(root, archiveRoot, 'unlisted'), { recursive: true });
  await rm(join(root, memberPath));
  await writeFile(join(root, 'external.txt'), original);
  await symlink(join(root, 'external.txt'), join(root, memberPath));
  await assert.rejects(verifyProjectRecoveryArchive20261116(root, { expectedSha256 }), /symlink/);
});


test('the aggregate keeps the reviewed Predator manifest and every historical member unchanged', async () => {
  const inventory = reviewedProjectRecovery20261116();
  const legacyPath = archiveRoot + '/predator/MANIFEST.json';
  const bytes = await readFile(new URL('../' + legacyPath, import.meta.url));
  const legacySha256 = 'e08ff5d1564bae543cf88f825c0cd8f041f9c91dc3664e66158af522bf4d6f06';
  assert.equal(digest(bytes), legacySha256);
  assert.equal(inventory.files.get(legacyPath)?.sha256, legacySha256);
  for (const member of JSON.parse(bytes).files) assert.deepEqual(inventory.files.get(member.path), member);
});

test('Fiorina recovery admits only inventoried source bytes and remains excluded from the game build', () => {
  const inventory = reviewedProjectRecovery20261116();
  const members = [...inventory.files.keys()].filter(path => path.startsWith(archiveRoot + '/fiorina/'));
  assert.ok(members.some(path => path.endsWith('ALIEN3_FIORINA_V114_ATLAS_CONTINUITE_SUR_V113.zip')));
  assert.ok(members.some(path => path.endsWith('ALIEN3_FIORINA_V113_SEUILS_DE_FIORINA_SUR_V112.zip')));
  assert.ok(members.some(path => path.endsWith('/INVENTAIRE.json')));
  assert.equal(members.filter(path => path.includes('/evidence/')).length, 29);
  for (const path of members) {
    assert.equal(projectRecoveryPathAdmission20261116(path), true);
    assert.equal(isPublicDistributionPathV86(path), true);
    assert.equal(projectRecoveryPathAdmission20261116(path, { built: true }), false);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false);
  }
  assert.equal(projectRecoveryPathAdmission20261116(archiveRoot + '/fiorina/unreviewed.zip'), false);
  assert.equal(projectRecoveryPathAdmission20261116(archiveRoot + '/fiorina/.env'), false);
});
