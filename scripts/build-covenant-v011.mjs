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
export const COVENANT_ASSET_ROOTS = Object.freeze([COVENANT_ASSETS_V011, COVENANT_ASSETS_V012, COVENANT_ASSETS_V013]);
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
const REVIEWED_COVENANT_PROVENANCE_SHA256_V011 = '3bc1b0dc4c370ee39c6fd91ab500b236d2eab4b7e686279c131dd4b4451e4923';
const REVIEWED_COVENANT_PROVENANCE_SHA256_V012 = 'd29fb0343de8a7f7f5b97be995a3583d35c93e33df0272e92d42b38af97ef4e3';
const REVIEWED_COVENANT_PROVENANCE_SHA256_V013 = '5154d1c63b0f70c49bf45aa3ac4d26f00e3962214f58e999fa290fe580843788';
const REVIEWED_COVENANT_SOURCE_METADATA = new Map([
  [COVENANT_PROVENANCE_V011, REVIEWED_COVENANT_PROVENANCE_SHA256_V011],
  [COVENANT_PROVENANCE_V012, REVIEWED_COVENANT_PROVENANCE_SHA256_V012],
  [COVENANT_PROVENANCE_V013, REVIEWED_COVENANT_PROVENANCE_SHA256_V013]
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
