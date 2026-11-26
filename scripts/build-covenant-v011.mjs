import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { join, dirname, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

export const COVENANT_SOURCE_V011 = 'modules/covenant/dlc/covenant';
export const COVENANT_PUBLIC_V011 = 'dlc/covenant';
export const COVENANT_ASSETS_V011 = 'assets/openai/sprites/alien-covenant-v011';
export const COVENANT_ASSETS_V012 = 'assets/openai/sprites/alien-covenant-v012';
export const COVENANT_ASSETS_V013 = 'assets/openai/sprites/alien-covenant-v013';
export const COVENANT_ASSETS_V014 = 'assets/openai/sprites/alien-covenant-v014';
export const COVENANT_ASSETS_V016 = 'assets/openai/sprites/alien-covenant-v016';
export const COVENANT_ASSET_ROOTS = Object.freeze([COVENANT_ASSETS_V011, COVENANT_ASSETS_V012, COVENANT_ASSETS_V013, COVENANT_ASSETS_V014, COVENANT_ASSETS_V016]);
export const COVENANT_MANIFEST_V011 = COVENANT_PUBLIC_V011 + '/sprites-v011.json';
export const COVENANT_RUNTIME_FILES_V011 = Object.freeze([
  'index.html', 'style.css', 'content.js', 'ship-systems.js', 'maintenance.js',
  'archaeology.js', 'atmosphere.js', 'freight.js', 'fidelity.js', 'core.js',
  'renderer.js', 'art-direction.js', 'threshold-art.js', 'field-art.js',
  'network-art.js', 'maintenance-art.js', 'archaeology-art.js', 'atmosphere-art.js',
  'freight-art.js', 'fidelity-art.js', 'sprite-registry-v011.js', 'sprite-art-v011.js', 'app.js'
]);
const require = createRequire(import.meta.url);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

export const COVENANT_PROVENANCE_V011 = COVENANT_ASSETS_V011 + '/manifest.json';
export const COVENANT_PROVENANCE_V012 = COVENANT_ASSETS_V012 + '/manifest.json';
export const COVENANT_PROVENANCE_V013 = COVENANT_ASSETS_V013 + '/manifest.json';
export const COVENANT_PROVENANCE_V014 = COVENANT_ASSETS_V014 + '/manifest.json';
const REVIEWED_COVENANT_PROVENANCE_SHA256_V011 = '3bc1b0dc4c370ee39c6fd91ab500b236d2eab4b7e686279c131dd4b4451e4923';
const REVIEWED_COVENANT_PROVENANCE_SHA256_V012 = 'd29fb0343de8a7f7f5b97be995a3583d35c93e33df0272e92d42b38af97ef4e3';
const REVIEWED_COVENANT_PROVENANCE_SHA256_V013 = '5154d1c63b0f70c49bf45aa3ac4d26f00e3962214f58e999fa290fe580843788';
const REVIEWED_COVENANT_PROVENANCE_SHA256_V014 = '1fd31f3a6473e95fddb9e3e4dfc41a4938e7bde0454f072472b1f0a7f699e482';
export const COVENANT_PROVENANCE_V016 = COVENANT_ASSETS_V016 + '/manifest.json';
const REVIEWED_COVENANT_SOURCE_METADATA = new Map([
  ['docs/covenant/BIBLE_COVENANT_V016.json', 'c7160711a97a15c495db71d64d326ab7d7173395d83f136015a2aab4b2a8e5ad'],
  ['docs/covenant/BIBLE_COVENANT_V016.md', '6438ff038ee3be7a37a080274bc88838cbe96b56f40583399695a3bb1ed3a036'],
  ['docs/covenant/BIBLE_COVENANT_V016.html', 'b21ee9f7a3f39565907475e92e990985db48d9578bcdd162e1f5fdd5b0c2e001'],
  [COVENANT_PROVENANCE_V016, '6e166985008494e08f2b528368d0ffa53ae299f59634f91a7b0e9941df607c6a'],
  ['scripts/build-covenant-bible-v016.py', '63d1ac2e9ffaba7047759402cdd39f5bca2f8804d49c5bc804c5b6d80bf1d544'],
  ['scripts/build-covenant-bible-v016.mjs', '148e0f2f1b8e7bba8b4d85d2aa46d8338c0eb1f41222cba944f2e8b5751eb076'],
  [COVENANT_PROVENANCE_V011, REVIEWED_COVENANT_PROVENANCE_SHA256_V011],
  [COVENANT_PROVENANCE_V012, REVIEWED_COVENANT_PROVENANCE_SHA256_V012],
  [COVENANT_PROVENANCE_V013, REVIEWED_COVENANT_PROVENANCE_SHA256_V013],
  [COVENANT_PROVENANCE_V014, REVIEWED_COVENANT_PROVENANCE_SHA256_V014],
  // These source-only bible documents retain public reference URL segments and
  // reviewed generation provenance. The Python sanitizer contains a generic
  // local-path prefix literal. Each exact reviewed file is pinned independently;
  // no general text or distribution rule is relaxed.
  ['docs/covenant/BIBLE_COVENANT_V014.json', 'e455aa686746396597a8810fa505efe88337df141dacd110ee35aba9af146528'],
  ['docs/covenant/BIBLE_COVENANT_V014.md', '506f5e235c450341eb1060d02535f4c343e07fdd10acc3c7f564e3677093b49a'],
  ['docs/covenant/BIBLE_COVENANT_V014.html', '484822bcfb34a56f7dcda45f567af0da26944894d37d641cab47b74c1c22fbd2'],
  ['scripts/build-covenant-bible-v014.py', '2b6b3c6853c646f9895243f34752235d6cda678ae32994d06d0d0bfaee64578b']
]);

export function covenantSourceMetadataPathV011(path) {
  return REVIEWED_COVENANT_SOURCE_METADATA.has(path);
}

// Reviewed sprite-generation prompts and public reference URLs are source-only.
// A different path, a changed byte or any built distribution is never exempt.
export function reviewedCovenantSourceMetadataV011(path, bytes, { built = false } = {}) {
  const expected = REVIEWED_COVENANT_SOURCE_METADATA.get(path);
  return !built && typeof expected === 'string'
    && bytes instanceof Uint8Array && sha(bytes) === expected;
}

export async function covenantManifestV011(root) {
  const manifest = JSON.parse(await readFile(join(root, COVENANT_MANIFEST_V011), 'utf8'));
  const { compileManifest } = require('../modules/covenant/dlc/covenant/sprite-registry-v011.js');
  return { manifest, compiled: compileManifest(manifest) };
}

export async function verifyCovenantAssetsV011(root) {
  const { compiled } = await covenantManifestV011(root);
  for (const entry of compiled.entries) {
    const data = await readFile(join(root, entry.path.slice(1)));
    assert.equal(data.length, entry.bytes, 'Changed Covenant sprite size: ' + entry.id);
    assert.equal(sha(data), entry.sha256, 'Changed Covenant sprite bytes: ' + entry.id);
    assert.equal(data.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Not PNG: ' + entry.id);
    assert.equal(data.readUInt32BE(16), entry.width, 'Wrong PNG width: ' + entry.id);
    assert.equal(data.readUInt32BE(20), entry.height, 'Wrong PNG height: ' + entry.id);
  }
  return { sprites: compiled.entries.length, bytes: compiled.entries.reduce((n, row) => n + row.bytes, 0) };
}

export async function buildCovenantHtmlV011(root) {
  const base = join(root, COVENANT_SOURCE_V011), { manifest } = await covenantManifestV011(root);
  let html = await readFile(join(base, 'index.html'), 'utf8');
  assert.equal(html.split('<link rel="stylesheet" href="style.css">').length, 2);
  const style = await readFile(join(base, 'style.css'), 'utf8');
  assert.doesNotMatch(style, /<\/style/i);
  html = html.replace('<link rel="stylesheet" href="style.css">', () => '<style>' + style + '</style>');
  const scripts = [...html.matchAll(/<script src="([a-z0-9-]+\.js)"><\/script>/g)].map(m => m[1]);
  assert.deepEqual(scripts, COVENANT_RUNTIME_FILES_V011.filter(name => name.endsWith('.js')));
  for (const file of scripts) {
    let code = await readFile(join(base, file), 'utf8');
    if (file === 'sprite-registry-v011.js') {
      code = 'globalThis.CovenantSpriteManifestV011=' + JSON.stringify(manifest).replaceAll('<', '\\u003c') + ';\n' + code;
    }
    code = code.replaceAll('</script', '<\\/script');
    html = html.replace('<script src="' + file + '"></script>', () => '<script>\n' + code + '\n</script>');
  }
  assert.doesNotMatch(html, /<script\b[^>]*\bsrc=/i);
  return html;
}

export async function verifyCovenantBundleV011(root) {
  const expected = await buildCovenantHtmlV011(root);
  assert.equal(await readFile(join(root, COVENANT_PUBLIC_V011, 'index.html'), 'utf8'), expected,
    'The Covenant page differs from its editable source modules/manifest.');
  return { htmlBytes: Buffer.byteLength(expected), ...await verifyCovenantAssetsV011(root) };
}

export async function writeCovenantBundleV011(root) {
  const output = join(root, COVENANT_PUBLIC_V011, 'index.html');
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, await buildCovenantHtmlV011(root));
  return verifyCovenantBundleV011(root);
}

export async function buildCovenantDlcV011(root, output) {
  await verifyCovenantBundleV011(root);
  await mkdir(join(output, COVENANT_PUBLIC_V011), { recursive: true });
  for (const name of ['index.html', 'sprites-v011.json']) {
    await cp(join(root, COVENANT_PUBLIC_V011, name), join(output, COVENANT_PUBLIC_V011, name));
  }
  const { compiled } = await covenantManifestV011(root);
  const folders = new Set(compiled.entries.map(entry => dirname(join(output, entry.path.slice(1)))));
  for (const folder of folders) await mkdir(folder, { recursive: true });
  for (const entry of compiled.entries) await cp(join(root, entry.path.slice(1)), join(output, entry.path.slice(1)));
  return verifyCovenantAssetsV011(output);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const outputIndex = process.argv.indexOf('--output');
  const result = process.argv.includes('--check') ? await verifyCovenantBundleV011(root)
    : outputIndex >= 0 ? await buildCovenantDlcV011(root, resolve(process.argv[outputIndex + 1]))
      : await writeCovenantBundleV011(root);
  console.log(JSON.stringify(result));
}
