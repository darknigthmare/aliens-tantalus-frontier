import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile, lstat, rm } from 'node:fs/promises';
import { dirname, join, posix, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { EARTH_MODULE_ROOT_V12, EARTH_RUNTIME_ROOT_V12, EARTH_JS_FILES_V12,
  EARTH_RASTER_FILES_V12 } from './public-alien-earth-dlc-admissions.mjs';

const imports = /^import\s+(\{[^}]+\})\s+from\s+['"]([^'"]+)['"];?\s*$/gm;
const declarations = /^export\s+(?:const|let|(?:async\s+)?function|class)\s+([A-Za-z_$][\w$]*)/gm;
const moduleRoot = root => join(root, EARTH_MODULE_ROOT_V12);
async function regularFile(root, relative) {
  assert.ok(!relative.startsWith('/') && !relative.split('/').some(p => !p || p === '.' || p === '..'));
  const parts = relative.split('/');
  for (let i = 1; i <= parts.length; i++) {
    const info = await lstat(join(root, ...parts.slice(0, i)));
    assert.equal(info.isSymbolicLink(), false, 'Earth source symlink: ' + relative);
    assert.ok(i === parts.length ? info.isFile() : info.isDirectory());
  }
  return readFile(join(root, relative));
}

/** Read the closed local ES graph in dependency order, starting from the real UI. */
export async function earthModuleGraphV12(root) {
  const visited = new Map(), pending = new Set();
  async function visit(path) {
    if (visited.has(path)) return;
    assert.ok(EARTH_JS_FILES_V12.includes(path), 'Unreviewed Earth module: ' + path);
    assert.equal(pending.has(path), false, 'Cyclic Earth module: ' + path);
    pending.add(path);
    const code = (await regularFile(moduleRoot(root), path)).toString('utf8');
    const dependencies = [...code.matchAll(imports)].map(match => {
      assert.ok(match[2].startsWith('./'), 'Earth imports must stay local: ' + match[2]);
      return { statement: match[0], bindings: match[1], target: posix.normalize(posix.join(posix.dirname(path), match[2])) };
    });
    for (const dependency of dependencies) await visit(dependency.target);
    assert.doesNotMatch(code.replace(imports, ''), /^\s*import\s|\bimport\s*\(/m, 'Unsupported Earth import: ' + path);
    visited.set(path, { path, code, dependencies }); pending.delete(path);
  }
  await visit('src/alien-earth-ui.js');
  assert.deepEqual([...visited.keys()].sort(), [...EARTH_JS_FILES_V12].sort(), 'Incomplete Earth runtime graph');
  return [...visited.values()];
}

/** Portable edition isolates bindings per module and embeds unmodified PNG bytes. */
export async function renderEarthStandaloneV12(root) {
  const graph = await earthModuleGraphV12(root), inline = {};
  for (const path of EARTH_RASTER_FILES_V12) {
    const bytes = await regularFile(moduleRoot(root), path);
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Invalid Earth PNG: ' + path);
    inline[path] = 'data:image/png;base64,' + bytes.toString('base64');
  }
  const bodies = graph.map(({ path, code, dependencies }) => {
    const names = [...code.matchAll(declarations)].map(m => m[1]);
    for (const dependency of dependencies) code = code.replace(dependency.statement,
      'const ' + dependency.bindings.replace(/\bas\b/g, ':') + ' = __earthModules[' + JSON.stringify(dependency.target) + '];');
    code = code.replace(/^export\s+(?=(?:const|let|(?:async\s+)?function|class)\b)/gm, '');
    assert.doesNotMatch(code, /^\s*export\s/m, 'Unsupported Earth export: ' + path);
    return '__earthModules[' + JSON.stringify(path) + '] = (() => {\n' + code + '\nreturn {' + names.join(',') + '};\n})();';
  });
  const script = "'use strict';\nconst __earthModules = Object.create(null);\n"
    + 'globalThis.EARTH_RASTER_INLINE_V12 = ' + JSON.stringify(inline) + ';\n' + bodies.join('\n');
  new Function(script);
  const css = (await regularFile(moduleRoot(root), 'earth.css')).toString('utf8');
  const template = (await regularFile(moduleRoot(root), 'index.html')).toString('utf8');
  assert.equal(template.split('<script type="module" src="src/alien-earth-ui.js"></script>').length, 2);
  assert.equal(template.split('<link rel="stylesheet" href="earth.css">').length, 2);
  const html = template.replace('<link rel="stylesheet" href="earth.css">', () => '<style>\n' + css + '\n</style>')
    .replace('<script type="module" src="src/alien-earth-ui.js"></script>', () => '<script>\n(()=>{\n'
      + script.replaceAll('</script', '<\\/script') + '\n})();\n</script>');
  return { html, modules: graph.length, images: EARTH_RASTER_FILES_V12.length };
}

export async function buildAlienEarthDlc(root, output) {
  root = resolve(root); output = resolve(output);
  const graph = await earthModuleGraphV12(root);
  const paths = ['index.html', 'earth.css', ...graph.map(row => row.path), ...EARTH_RASTER_FILES_V12];
  const target = join(output, EARTH_RUNTIME_ROOT_V12), source = moduleRoot(root);
  assert.ok(target !== source && !target.startsWith(source + sep) && !source.startsWith(target + sep), 'Earth output overlaps source');
  // Verify existing ancestors before mkdir so a linked output cannot cause writes.
  let ancestor = target;
  while (true) {
    try { assert.equal((await lstat(ancestor)).isSymbolicLink(), false, 'Earth output symlink'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    const parent = dirname(ancestor); if (parent === ancestor) break; ancestor = parent;
  }
  const files = await Promise.all(paths.map(async path => [path, await regularFile(source, path)]));
  await mkdir(dirname(target), { recursive: true });
  await rm(target, { recursive: true, force: true });
  for (const [path, bytes] of files) {
    await mkdir(dirname(join(target, path)), { recursive: true });
    await writeFile(join(target, path), bytes);
  }
  return { runtimeRoot: EARTH_RUNTIME_ROOT_V12, files: paths.length, modules: graph.length,
    images: EARTH_RASTER_FILES_V12.length, saveNamespace: 'atf.dlc.alien-earth.s1.profile-1' };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
  if (process.argv.includes('--standalone')) {
    const result = await renderEarthStandaloneV12(root);
    const argument = process.argv.find(value => value.startsWith('--output='));
    assert.ok(argument, 'Standalone export needs an explicit --output= path.');
    const output = resolve(argument.slice('--output='.length));
    await mkdir(dirname(output), { recursive: true }); await writeFile(output, result.html);
    console.log(JSON.stringify({ output, modules: result.modules, images: result.images, bytes: Buffer.byteLength(result.html) }));
  } else console.log(JSON.stringify(await buildAlienEarthDlc(root, process.env.ATF_BUILD_OUTPUT || root)));
}
