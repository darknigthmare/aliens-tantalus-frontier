import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { RELEASE, validateContent } from '../src/content.js';

const root = process.cwd();
const output = join(root, 'dist');
const validation = validateContent();
if (!validation.ok) throw new Error(`Content contract failed: ${validation.failures.join(', ')}`);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const path of ['index.html', 'styles.css', 'styles-v50.css', 'sprite-gallery.css', 'hub-level.css', 'runtime-level.css', 'manifest.webmanifest', 'sw.js', 'LICENSE_NOTICE.md']) {
  await cp(join(root, path), join(output, path));
}
for (const directory of ['src', 'assets', 'docs']) {
  try { await cp(join(root, directory), join(output, directory), { recursive: true }); } catch (error) {
    if (directory !== 'docs') throw error;
  }
}
const index = await readFile(join(output, 'index.html'), 'utf8');
if (!index.includes('/src/app.js') || !index.includes('game-canvas') || !index.includes('hub-canvas')) throw new Error('Built shell is incomplete.');
await writeFile(join(output, 'build-info.json'), JSON.stringify({
  name: RELEASE.name, version: RELEASE.version, sourceVersion: RELEASE.sourceVersion,
  builtAt: new Date().toISOString(), content: validation.counts, artProvider: 'OpenAI ImageGen'
}, null, 2));
console.log(`Built ${RELEASE.name} ${RELEASE.version} with ${Object.values(validation.counts).reduce((a, b) => a + b, 0)} catalog entries.`);
