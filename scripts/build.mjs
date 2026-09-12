import { access, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { RELEASE, validateContent } from '../src/content.js';
import { createBuildAssetFilter, EXCLUDED_BUILD_ASSET_PATHS } from './build-asset-filter.mjs';
import { resolveSafeBuildOutput } from './build-output-guard.mjs';
import { writeAudioManifestV77 } from './audio-scan-v77.mjs';

const root = process.cwd();
await writeAudioManifestV77(root);
const assetFilter = createBuildAssetFilter(root);
const output = resolveSafeBuildOutput(root, process.env.ATF_BUILD_OUTPUT || 'dist');
const validation = validateContent();
if (!validation.ok) throw new Error(`Content contract failed: ${validation.failures.join(', ')}`);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const path of ['index.html', 'styles.css', 'styles-v50.css', 'sprite-gallery.css', 'hub-level.css', 'runtime-level.css', 'title-screen-v61.css', 'title-scene-v79.css', 'hub-stations-v61.css', 'catalog-v62.css', 'mission-insertion-v62.css', 'alien-survival-v70.css', 'bioforge-v80.css', 'manifest.webmanifest', 'sw.js', 'LICENSE_NOTICE.md']) {
  await cp(join(root, path), join(output, path));
}
for (const directory of ['src', 'assets', 'docs']) {
  try { await cp(join(root, directory), join(output, directory), { recursive: true, filter: assetFilter }); } catch (error) {
    if (directory !== 'docs') throw error;
  }
}
// QA masters, production intermediates and superseded duplicate atlases remain local, never deployed.
await rm(join(output, 'assets', 'openai', 'sprites', 'raw'), { recursive: true, force: true });
await rm(join(output, 'assets', 'openai', 'sprites', 'normalized', 'equipment'), { recursive: true, force: true });
await rm(join(output, 'assets', 'openai', 'sprites', 'frames', 'v64'), { recursive: true, force: true });
await rm(join(output, 'assets', 'openai', 'sprites', 'reference-masters', 'v64'), { recursive: true, force: true });
await rm(join(output, 'assets', 'openai', 'sprites', 'previews', 'v64'), { recursive: true, force: true });
await rm(join(output, 'assets', 'openai', 'sprites', 'metadata', 'v64'), { recursive: true, force: true });
const assertBuildExclusion = async (...segments) => {
  const excludedPath = join(output, ...segments);
  try {
    await access(excludedPath);
  } catch (error) {
    if (error?.code === 'ENOENT') return;
    throw error;
  }
  throw new Error(`Excluded build artifact is still present: ${excludedPath}`);
};
for (const excludedPath of EXCLUDED_BUILD_ASSET_PATHS) {
  await assertBuildExclusion(...excludedPath.split('/'));
}
const index = await readFile(join(output, 'index.html'), 'utf8');
if (!index.includes('/src/app.js') || !index.includes('game-canvas') || !index.includes('hub-canvas') || !index.includes('bioforge-canvas-v80')) throw new Error('Built shell is incomplete.');
await writeFile(join(output, 'build-info.json'), JSON.stringify({
  name: RELEASE.name, version: RELEASE.version, sourceVersion: RELEASE.sourceVersion,
  builtAt: new Date().toISOString(), content: validation.counts, artProvider: 'OpenAI ImageGen'
}, null, 2));
console.log(`Built ${RELEASE.name} ${RELEASE.version} with ${Object.values(validation.counts).reduce((a, b) => a + b, 0)} catalog entries.`);
