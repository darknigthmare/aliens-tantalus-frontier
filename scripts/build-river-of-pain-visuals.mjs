import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { lstat, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

export const RIVER_VISUAL_ID = 'river-of-pain-visual-v1';
export const RIVER_ORIGINAL_SHA256 = '91ae538879b939018cea5dc3ba2eb9e45faea7693fdd952efbe8531b33cdfced';
const DLC = 'dlc/fleuve-de-la-douleur';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const require = createRequire(import.meta.url);
const escapeScript = value => value.replace(/<\/script/gi, '<\\/script');

function once(html, anchor, replacement) {
  assert.equal(html.split(anchor).length, 2, 'Missing or ambiguous visual insertion anchor.');
  return html.replace(anchor, () => replacement);
}
function inline(name, code) {
  return '<script data-rop-visual="' + name + '">\n' + escapeScript(code) + '\n</script>\n';
}
async function regularFileBelow(root, path) {
  const suffix = relative(root, path);
  assert.ok(suffix && !isAbsolute(suffix) && suffix !== '..' && !suffix.startsWith('..' + sep),
    'Visual file must remain below its own directory.');
  let current = root;
  assert.equal((await lstat(root)).isSymbolicLink(), false, 'Symbolic visual root.');
  for (const part of suffix.split(sep)) {
    current = join(current, part);
    assert.equal((await lstat(current)).isSymbolicLink(), false, 'Symbolic visual input: ' + suffix);
  }
  assert.equal((await lstat(path)).isFile(), true, 'Not a regular visual input: ' + suffix);
  return path;
}
export function inspectPng(bytes) {
  assert.ok(Buffer.isBuffer(bytes) && bytes.length >= 45, 'PNG is missing or incomplete.');
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Only PNG assets are supported.');
  assert.equal(bytes.toString('ascii', 12, 16), 'IHDR', 'PNG must start with IHDR.');
  assert.equal(bytes.readUInt32BE(8), 13, 'Invalid PNG IHDR.');
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20), color = bytes[25];
  assert.ok(width > 0 && height > 0 && width <= 8192 && height <= 8192, 'PNG dimensions exceed the bounded renderer.');
  let offset = 8, transparency = color === 4 || color === 6, ended = false;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    assert.ok(length <= bytes.length - offset - 12, 'Truncated PNG chunk.');
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    if (type === 'tRNS') transparency = true;
    offset += length + 12;
    if (type === 'IEND') { ended = true; break; }
  }
  assert.ok(ended && offset === bytes.length, 'PNG must end after IEND.');
  assert.ok(transparency, 'Sprite PNG must support transparency.');
  return { width, height };
}
export function assembleVisualHtml({ original, renderSource, fidelityUiSource, manifest, loader, creature, actors }) {
  const originalBytes = Buffer.from(original, 'utf8');
  assert.equal(hash(originalBytes), RIVER_ORIGINAL_SHA256, 'The frozen v0.9 standalone has changed.');
  const renderTag = '<script>\n' + escapeScript(renderSource) + '\n</script>';
  const uiTag = '<script>\n' + escapeScript(fidelityUiSource) + '\n</script>';
  // The authored data script is the first script in the verified standalone.
  const firstScript = '<script>\n/* Authored DLC content.';
  const manifestCode = 'globalThis.ROP_SPRITE_MANIFEST = '
    + JSON.stringify(manifest).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029') + ';';
  let html = once(original, firstScript,
    inline('manifest', manifestCode) + inline('sprite-loader', loader) + firstScript);
  html = once(html, renderTag, renderTag + '\n' + inline('creature-png', creature));
  html = once(html, uiTag, uiTag + '\n' + inline('actors-props-png', actors));
  html = once(html, '</head>', '<meta name="rop-visual-revision" content="' + RIVER_VISUAL_ID + '">'
    + '<meta name="rop-source-sha256" content="' + RIVER_ORIGINAL_SHA256 + '">\n</head>');
  html = once(html, 'DÉCORS PROVISOIRES DESSINÉS PAR CODE', 'COLONIE HADLEY’S HOPE · 2179');
  return html;
}

/** Validate and recompose the canonical presentation without any filesystem
 * writes. Distribution verification can compare dist against this receipt. */
export async function renderRiverOfPainVisuals({ root = process.cwd(), manifestPath } = {}) {
  root = resolve(root);
  const dlc = join(root, DLC), visual = join(dlc, 'visual-v1');
  manifestPath = resolve(manifestPath || join(visual, 'sprite-manifest.json'));
  await regularFileBelow(visual, manifestPath);
  const loaderPath = await regularFileBelow(visual, join(visual, 'sprite-loader.js'));
  const api = require(loaderPath);
  const manifestBytes = await readFile(manifestPath);
  const manifest = api.validateManifest(JSON.parse(manifestBytes.toString('utf8')));
  // Images remain separate PNGs. Runtime URLs are relative to the derived HTML,
  // so both HTTPS hosting and a local extracted directory work without fetch().
  const checkedAssets = [];
  for (const asset of manifest.assets) {
    const path = await regularFileBelow(visual, join(visual, asset.file));
    const bytes = await readFile(path);
    assert.equal(hash(bytes), asset.sha256, 'PNG hash differs: ' + asset.id);
    const dimensions = inspectPng(bytes);
    assert.ok(asset.bounds.x + asset.bounds.w <= dimensions.width
      && asset.bounds.y + asset.bounds.h <= dimensions.height, 'Alpha bounds exceed PNG: ' + asset.id);
    checkedAssets.push({ id: asset.id, file: asset.file, bytes: bytes.length, ...dimensions, sha256: asset.sha256 });
  }
  const [originalBytes, renderSource, fidelityUiSource, loader, creature, actors] = await Promise.all([
    readFile(join(dlc, 'JOUER.html')),
    readFile(join(dlc, 'src/river-of-pain/render.js'), 'utf8'),
    readFile(join(dlc, 'src/river-of-pain/fidelity-ui.js'), 'utf8'),
    readFile(loaderPath, 'utf8'),
    regularFileBelow(visual, join(visual, 'creature-png.js')).then(path => readFile(path, 'utf8')),
    regularFileBelow(visual, join(visual, 'actors-props-png.js')).then(path => readFile(path, 'utf8'))
  ]);
  assert.equal(hash(originalBytes), RIVER_ORIGINAL_SHA256, 'Original v0.9 bytes failed verification.');
  const html = assembleVisualHtml({ original: originalBytes.toString('utf8'), renderSource, fidelityUiSource,
    manifest, loader, creature, actors });
  return { html, visualId: RIVER_VISUAL_ID, sourceSha256: RIVER_ORIGINAL_SHA256,
    manifestSha256: hash(manifestBytes), htmlSha256: hash(Buffer.from(html, 'utf8')),
    htmlBytes: Buffer.byteLength(html), assets: checkedAssets };
}

/** Derive a new presentation beside the archived runtime. No v0.9 builder runs,
 * no model text is rewritten, and no recovered input is an output destination. */
export async function buildRiverOfPainVisuals({ root = process.cwd(), manifestPath, outputPath } = {}) {
  root = resolve(root);
  const dlc = join(root, DLC), visual = join(dlc, 'visual-v1');
  outputPath = resolve(outputPath || join(visual, 'JOUER.html'));
  assert.ok(outputPath.startsWith(visual + sep) && outputPath.endsWith('.html'),
    'Derived HTML can only be written inside visual-v1/.');
  assert.equal(dirname(outputPath), visual, 'Relative assets require HTML at visual-v1/ root.');
  const { html, ...receipt } = await renderRiverOfPainVisuals({ root, manifestPath });
  await mkdir(dirname(outputPath), { recursive: true });
  try { assert.equal((await lstat(outputPath)).isSymbolicLink(), false, 'Symbolic visual output.'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const temporary = outputPath + '.' + randomUUID() + '.tmp';
  try {
    await writeFile(temporary, html, { encoding: 'utf8', flag: 'wx' });
    await rename(temporary, outputPath);
  } finally { await rm(temporary, { force: true }); }
  assert.equal(hash(await readFile(join(dlc, 'JOUER.html'))), RIVER_ORIGINAL_SHA256,
    'Original standalone changed while producing the derived presentation.');
  return { ...receipt, output: relative(root, outputPath).split(sep).join('/') };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const options = {};
  const args = process.argv.slice(2);
  for (let index = 0; index < args.length; index += 2) {
    const option = { '--root': 'root', '--manifest': 'manifestPath', '--output': 'outputPath' }[args[index]];
    assert.ok(option && args[index + 1], 'Usage: node scripts/build-river-of-pain-visuals.mjs [--root path] [--manifest path] [--output path]');
    options[option] = args[index + 1];
  }
  console.log(JSON.stringify(await buildRiverOfPainVisuals(options), null, 2));
}
