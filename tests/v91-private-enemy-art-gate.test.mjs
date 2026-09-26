import assert from 'node:assert/strict';
import { access, cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';
import { ENEMY_USER_CASTES_V87 } from '../src/enemy-user-castes-v87.js';
import { V65_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v65.js';
import { V66_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v66.js';
import { V81_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v81.js';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const privateRoots = ['docs/references/v91-enemy-only', 'docs/references/V91_PRIVATE_REVIEW'];
const privateFiles = [
  'docs/references/v91-enemy-only/AUDIT.md',
  'docs/references/v91-enemy-only/GENERATIONS.json',
  'docs/references/v91-enemy-only/prompts/identity.txt',
  'docs/references/v91-enemy-only/candidates/unreviewed.png',
  'docs/references/V91_PRIVATE_REVIEW/nested/source.png',
  'docs/references/V91_ENEMY_STATUS.json'
];
const unrelatedFiles = [
  'docs/references/V64_ENEMY_SOURCES.json',
  'docs/references/V910_ENEMY_STATUS.json',
  'docs/references/v910-enemy-only/AUDIT.md',
  'docs/V91_PUBLIC_NOTES.md',
  'src/enemy-user-campaign-v88.js'
];

test('V91 private roots and descendants are excluded without matching V910 or unrelated documents', () => {
  const filter = createBuildAssetFilter(projectRoot);
  for (const path of [...privateRoots, ...privateFiles]) {
    assert.equal(filter(join(projectRoot, path)), false, path);
  }
  for (const path of unrelatedFiles) assert.equal(filter(join(projectRoot, path)), true, path);
});

test('V91 copy rejects private directories before traversal and preserves the original source files', async (t) => {
  const fixture = await mkdtemp(join(tmpdir(), 'tantalus-v91-private-filter-'));
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const sourceRoot = join(fixture, 'source');
  const outputRoot = join(fixture, 'output');
  for (const file of [...privateFiles, ...unrelatedFiles]) {
    const source = join(sourceRoot, file);
    await mkdir(dirname(source), { recursive: true });
    await writeFile(source, `fixture:${file}`);
  }
  const filter = createBuildAssetFilter(sourceRoot);
  const visited = new Set();
  await cp(sourceRoot, outputRoot, {
    recursive: true,
    filter(source) {
      visited.add(relative(sourceRoot, source).replaceAll('\\', '/'));
      return filter(source);
    }
  });
  for (const root of privateRoots) {
    assert.ok(visited.has(root), `${root}: the root itself is rejected`);
    await assert.rejects(access(join(outputRoot, root)), { code: 'ENOENT' });
  }
  for (const file of privateFiles) {
    if (privateRoots.some(root => file.startsWith(root + '/'))) {
      assert.equal(visited.has(file), false, `${file}: no private descendant traversal`);
    }
    await assert.rejects(access(join(outputRoot, file)), { code: 'ENOENT' });
    assert.equal(await readFile(join(sourceRoot, file), 'utf8'), `fixture:${file}`);
  }
  for (const file of unrelatedFiles) {
    assert.equal(await readFile(join(outputRoot, file), 'utf8'), `fixture:${file}`);
  }
});

test('V91 private exclusion retains all 35 dedicated native poses and the accepted historical runtime atlases', async () => {
  const filter = createBuildAssetFilter(projectRoot);
  assert.equal(ENEMY_USER_CASTES_V87.length, 35);
  const paths = [
    ...ENEMY_USER_CASTES_V87.map(entry => entry.path),
    ...V65_READY_ENEMY_PROFILE_ASSETS.map(entry => entry.path),
    ...[...V66_READY_ENEMY_PROFILE_ASSETS, ...V81_READY_ENEMY_PROFILE_ASSETS]
      .filter(entry => entry.reviewStatus === 'accepted' && entry.identityVerified === true)
      .map(entry => entry.path)
  ];
  for (const path of paths) {
    assert.ok(path?.startsWith('/assets/'), 'Every accepted pose or atlas has an explicit runtime asset path');
    const source = join(projectRoot, path.slice(1));
    assert.equal(filter(source), true, path);
    await access(source);
  }
});
