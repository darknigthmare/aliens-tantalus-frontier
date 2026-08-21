import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

const relativeImports = (source) => {
  const imports = [];
  for (const pattern of [
    /(?:import|export)\s+(?:[^'"]*?\sfrom\s*)?['"](\.[^'"]+)['"]/g,
    /import\(\s*['"](\.[^'"]+)['"]\s*\)/g
  ]) {
    for (const match of source.matchAll(pattern)) imports.push(match[1]);
  }
  return imports;
};

const localPath = (webPath) => path.join(process.cwd(), ...webPath.split('/').filter(Boolean));

test('le cache hors-ligne couvre toute la fermeture ESM publique sans fallback HTML pour les modules', async () => {
  const worker = await readFile('sw.js', 'utf8');
  const visited = new Set();

  async function visit(webPath) {
    if (visited.has(webPath)) return;
    visited.add(webPath);
    const source = await readFile(localPath(webPath), 'utf8');
    for (const specifier of relativeImports(source)) {
      let resolved = path.posix.normalize(path.posix.join(path.posix.dirname(webPath), specifier));
      if (!path.posix.extname(resolved)) resolved += '.js';
      if (!resolved.startsWith('/')) resolved = '/' + resolved;
      await visit(resolved);
    }
  }

  await visit('/src/app.js');
  for (const modulePath of visited) {
    assert.ok(
      worker.includes(`'${modulePath}'`) || worker.includes(`"${modulePath}"`),
      `${modulePath} manque dans CORE`
    );
  }
  assert.match(worker, /event\.request\.mode === 'navigate'/);
  assert.doesNotMatch(worker, /cached\s*\|\|\s*caches\.match\(['"]\/index\.html/);
});
