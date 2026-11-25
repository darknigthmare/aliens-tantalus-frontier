import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const AVP_SOURCE = 'scripts/dlc/avp-2004';
export const AVP_RUNTIME = 'src/dlc/avp-2004/index.html';

export async function buildAvpHtml(root) {
  const base = join(root, AVP_SOURCE);
  const spec = JSON.parse(await readFile(join(base, 'MODULES.json'), 'utf8'));
  assert.equal(spec.schema, 1);
  assert.equal(spec.modules.length, 30);
  assert.equal(new Set(spec.modules).size, spec.modules.length);
  let html = await readFile(join(base, 'template.html'), 'utf8');
  const replaceOne = (marker, replacement) => {
    assert.equal(html.split(marker).length, 2, 'Missing or duplicated AVP source marker: ' + marker);
    html = html.replace(marker, () => replacement);
  };
  replaceOne('<!-- AVP_STYLE -->', '<style>' + await readFile(join(base, 'web/style.css'), 'utf8') + '</style>');
  for (const name of spec.modules) {
    assert.match(name, /^[a-z][a-z-]*\.js$/);
    const code = await readFile(join(base, 'web', name), 'utf8');
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
