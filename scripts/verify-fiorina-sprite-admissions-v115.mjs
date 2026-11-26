import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { FIORINA_SPRITE_DIRECTORY_V115, FIORINA_SPRITE_MANIFEST_V115,
  FIORINA_SPRITE_CURRENT, FIORINA_SPRITE_FILES_V115, FIORINA_SPRITE_MANIFEST_SHA256_V115, FIORINA_SPRITE_SOURCE_ONLY_V115,
  FIORINA_SPRITE_ADDITIONS_V116, FIORINA_SPRITE_MANIFEST_SHA256_V116,
  publicFiorinaSpritePathAdmissionV115, verifyFiorinaSpriteAdmissionsV115,
  reviewedFiorinaSpritePackFilesV115 } from './public-fiorina-sprite-admissions-v115.mjs';
import { createBuildAssetFilter } from './build-asset-filter.mjs';
import { isPublicDistributionPathV86, isPublicDistributionTextV86 } from './verify-public-release-v86.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FIORINA_SPRITE_FILES_CURRENT = FIORINA_SPRITE_CURRENT.files;

test('the cumulative pack retains all 61 V115/V116 PNG pins and both historical manifest fingerprints', () => {
  assert.equal(FIORINA_SPRITE_MANIFEST_SHA256_V115, '7a13489288e96be84958a159844c5d550d0e4bfa285a8748b49ac19e5b7a72a7');
  assert.equal(FIORINA_SPRITE_FILES_V115.length, 39);
  assert.equal(createHash('sha256').update(JSON.stringify(FIORINA_SPRITE_FILES_V115)).digest('hex'),
    '441f088698d28244d017c762d58fd76ac29af6fb337cacc81405bcb4adf50c46');
  assert.equal(FIORINA_SPRITE_MANIFEST_SHA256_V116, 'db64e2b36aa8a0fa424adf112a1669a0e325c4497067fc38ddbfe140af418e6a');
  assert.equal(FIORINA_SPRITE_ADDITIONS_V116.length, 22);
  assert.equal(createHash('sha256').update(JSON.stringify(FIORINA_SPRITE_ADDITIONS_V116)).digest('hex'),
    'edb35dc67f0c7e6eefffe61cfe483060b82c14c8448cd90583d8770731c09904');
  for (const original of [...FIORINA_SPRITE_FILES_V115, ...FIORINA_SPRITE_ADDITIONS_V116])
    assert.deepEqual(FIORINA_SPRITE_FILES_CURRENT.filter(file => file.path === original.path), [original], original.path);
});

test('delivered Fiorina PNGs and manifest match the independent reviewed fingerprints', async () => {
  const result = await verifyFiorinaSpriteAdmissionsV115(root);
  assert.equal(result.images, FIORINA_SPRITE_FILES_CURRENT.length);
  assert.ok(result.entries > 0 && result.images > 0);
});

test('build and public release admit the exact Fiorina pack and reject neighboring unreviewed files', () => {
  const filter = createBuildAssetFilter(root);
  const files = [FIORINA_SPRITE_MANIFEST_V115, ...FIORINA_SPRITE_FILES_CURRENT.map(file => file.path)];
  assert.equal(filter(join(root, FIORINA_SPRITE_DIRECTORY_V115)), true);
  assert.equal(isPublicDistributionPathV86(FIORINA_SPRITE_DIRECTORY_V115, { directory: true, built: true }), true);
  for (const path of files) {
    assert.equal(publicFiorinaSpritePathAdmissionV115(path), true, path);
    assert.equal(filter(join(root, path)), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), true, path);
    assert.equal(publicFiorinaSpritePathAdmissionV115(path, { directory: true }), false, path);
  }
  for (const filename of ['unreviewed.png', 'manifest-backup.json', 'notes.md', '.env', 'nested/unknown.png']) {
    const path = `${FIORINA_SPRITE_DIRECTORY_V115}/${filename}`;
    assert.equal(publicFiorinaSpritePathAdmissionV115(path), false, path);
    assert.equal(filter(join(root, path)), false, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
});

test('the release copy filter retains the actual manifest and unchanged PNG bytes', async () => {
  const output = await mkdtemp(join(tmpdir(), 'fiorina-sprite-copy-'));
  try {
    await cp(join(root, FIORINA_SPRITE_DIRECTORY_V115), join(output, FIORINA_SPRITE_DIRECTORY_V115), {
      recursive: true, filter: createBuildAssetFilter(root),
    });
    const result = await verifyFiorinaSpriteAdmissionsV115(output);
    assert.equal(result.images, FIORINA_SPRITE_FILES_CURRENT.length);
  } finally { await rm(output, { recursive: true, force: true }); }
});

test('sprite QA and provenance are admitted only as source tooling, with no private source metadata', async () => {
  const filter = createBuildAssetFilter(root);
  for (const path of FIORINA_SPRITE_SOURCE_ONLY_V115) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
    assert.equal(filter(join(root, path)), false, path);
    assert.equal(isPublicDistributionTextV86(await readFile(join(root, path), 'utf8')), true, path);
  }
  assert.equal(isPublicDistributionTextV86(await readFile(join(root, FIORINA_SPRITE_MANIFEST_V115), 'utf8')), true);
});

test('offline shell pins the renderer and manifest while sprite images use the existing media cache', async () => {
  const worker = await readFile(join(root, 'sw.js'), 'utf8');
  const context = { self: { location: { origin: 'https://fiorina.invalid' }, addEventListener() {} }, URL, Request, Response };
  const policy = runInNewContext(worker + '\n;({shell: [...SHELL_PATHS], request: cacheableRequestV143, response: cacheableResponseV143})', context);
  for (const path of ['/src/alien3-production-v115.js', '/src/alien3-sprites-v115.js', '/' + FIORINA_SPRITE_MANIFEST_V115]) {
    assert.ok(policy.shell.includes(path), `${path}: missing from offline shell`);
    const request = new Request('https://fiorina.invalid' + path);
    const type = path.endsWith('.json') ? 'application/json' : 'text/javascript';
    assert.equal(policy.request(request), true);
    assert.equal(policy.response(request, new Response('{}', { headers: { 'content-type': type } })), true);
    assert.equal(policy.response(request, new Response('<html>', { headers: { 'content-type': 'text/html' } })), false);
  }
  for (const image of FIORINA_SPRITE_FILES_CURRENT) {
    const path = '/' + image.path;
    assert.equal(policy.shell.includes(path), false, 'Sprite PNGs must not force a full-pack download at service-worker installation');
    assert.equal(policy.request(new Request('https://fiorina.invalid' + path)), true);
    assert.equal(policy.request(new Request('https://other.invalid' + path)), false);
  }
});

test('the source download contains every admitted sprite and only its declared provenance documents', () => {
  const paths = reviewedFiorinaSpritePackFilesV115();
  assert.ok(Object.isFrozen(paths));
  assert.equal(new Set(paths).size, paths.length);
  for (const path of [FIORINA_SPRITE_MANIFEST_V115, ...FIORINA_SPRITE_FILES_CURRENT.map(file => file.path)])
    assert.ok(paths.includes(path), path);
  for (const path of paths) {
    assert.equal(publicFiorinaSpritePathAdmissionV115(path), true, path);
    if (FIORINA_SPRITE_SOURCE_ONLY_V115.has(path)) {
      assert.match(path, /^docs\/development\/FIORINA_SPRITES_V[0-9]+\.(?:md|json)$/);
      assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
    } else assert.equal(isPublicDistributionPathV86(path, { built: true }), true, path);
  }
  assert.equal(paths.some(path => path.startsWith('scripts/')), false);
  assert.equal(paths.some(path => path.includes('..') || path.includes('://') || path.startsWith('/')), false);
});
