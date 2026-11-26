import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

export const AVP_SOURCE = 'scripts/dlc/avp-2004';
export const AVP_RUNTIME = 'src/dlc/avp-2004/index.html';

// Original PNGs remain source-only. The released page carries their exact bytes
// inline, so a notebook opened from disk needs neither a server nor a CDN.
export async function buildAvpRasters(root) {
  const spec = JSON.parse(await readFile(join(root, AVP_SOURCE, 'RASTERS.json'), 'utf8'));
  assert.equal(spec.schema, 1);
  assert.deepEqual(spec.assets.map(asset => asset.id).sort(), ['film-snowcat', 'whalebone']);
  const payload = {};
  for (const asset of spec.assets) {
    assert.match(asset.path, /^assets\/openai\/sprites\/avp2004-reference-v002\/[a-z0-9-]+\.png$/);
    assert.match(asset.sha256, /^[a-f0-9]{64}$/);
    const bytes = await readFile(join(root, asset.path));
    assert.equal(bytes.length, asset.bytes, 'PNG byte count: ' + asset.id);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, 'PNG digest: ' + asset.id);
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'PNG signature: ' + asset.id);
    assert.equal(bytes.subarray(12, 16).toString('ascii'), 'IHDR');
    assert.equal(bytes.readUInt32BE(16), asset.width, 'PNG width: ' + asset.id);
    assert.equal(bytes.readUInt32BE(20), asset.height, 'PNG height: ' + asset.id);
    assert.equal(bytes[25], 6, 'The stage PNG must carry RGBA transparency: ' + asset.id);
    assert.equal(asset.frame.length, 4);
    assert.ok(asset.frame.every(Number.isInteger));
    const [x, y, w, h] = asset.frame;
    assert.ok(x >= 0 && y >= 0 && w > 0 && h > 0 && x + w <= asset.width && y + h <= asset.height, 'PNG source frame: ' + asset.id);
    assert.equal(asset.pivot.length, 2);
    assert.ok(asset.pivot.every(Number.isFinite));
    assert.ok(asset.pivot[0] >= x && asset.pivot[0] <= x + w && asset.pivot[1] >= y && asset.pivot[1] <= y + h, 'PNG contact pivot: ' + asset.id);
    assert.equal(asset.fit.length, 2);
    assert.ok(asset.fit.every(value => Number.isFinite(value) && value > 0 && value <= 4096));
    payload[asset.id] = { src: 'data:image/png;base64,' + bytes.toString('base64'), width: asset.width, height: asset.height, frame: asset.frame, pivot: asset.pivot, fit: asset.fit };
  }
  return payload;
}

export async function buildAvpHtml(root) {
  const base = join(root, AVP_SOURCE);
  const spec = JSON.parse(await readFile(join(base, 'MODULES.json'), 'utf8'));
  assert.equal(spec.schema, 1);
  assert.equal(spec.modules.length, 30);
  assert.equal(new Set(spec.modules).size, spec.modules.length);
  const rasters = await buildAvpRasters(root);
  let html = await readFile(join(base, 'template.html'), 'utf8');
  const replaceOne = (marker, replacement) => {
    assert.equal(html.split(marker).length, 2, 'Missing or duplicated AVP source marker: ' + marker);
    html = html.replace(marker, () => replacement);
  };
  replaceOne('<!-- AVP_STYLE -->', '<style>' + await readFile(join(base, 'web/style.css'), 'utf8') + '</style>');
  for (const name of spec.modules) {
    assert.match(name, /^[a-z][a-z-]*\.js$/);
    let code = await readFile(join(base, 'web', name), 'utf8');
    if (name === 'assets.js') {
      const marker = '/* AVP_RASTER_PAYLOAD */ {}';
      assert.equal(code.split(marker).length, 2, 'Missing or duplicated PNG payload marker.');
      code = code.replace(marker, () => JSON.stringify(rasters));
    }
    assert.doesNotMatch(code, /<\/script/i, 'Unescaped script closing tag in ' + name);
    replaceOne('<!-- AVP_SCRIPT:' + name + ' -->', '<script>' + code + '</script>');
  }
  assert.doesNotMatch(html, /<!-- AVP_(?:SCRIPT|STYLE)/);
  return html;
}

export async function verifyAvpBundle(root) {
  const expected = await buildAvpHtml(root);
  const actual = await readFile(join(root, AVP_RUNTIME), 'utf8');
  assert.equal(actual, expected, 'The shipped AVP bundle differs from its editable sources.');
  return { ok: true, bytes: Buffer.byteLength(actual), modules: 30 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  if (process.argv.includes('--check')) console.log(JSON.stringify(await verifyAvpBundle(root)));
  else {
    const html = await buildAvpHtml(root);
    await mkdir(dirname(join(root, AVP_RUNTIME)), { recursive: true });
    await writeFile(join(root, AVP_RUNTIME), html);
    console.log('AVP 0.11.0 bundle rebuilt from 30 source modules.');
  }
}
