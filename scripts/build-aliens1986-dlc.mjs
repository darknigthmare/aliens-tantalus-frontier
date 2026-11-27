import assert from 'node:assert/strict';
import { cp, lstat, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveSafeBuildOutput } from './build-output-guard.mjs';
import { ALIENS1986_RUNTIME_FILES, verifyAliens1986DlcAdmissions } from './public-aliens1986-dlc-admissions.mjs';
import { renderAliens1986RasterV116 } from './derive-aliens1986-raster-v116.mjs';

/** Derive the presentation from frozen V114 inputs. Only the build output
 * receives V116 HTML; source history and the save schema remain unchanged. */
export async function buildAliens1986Dlc(root, output) {
  const source = resolve(root), target = resolve(output);
  assert.notEqual(source, target, 'DLC output must differ from the source checkout.');
  await verifyAliens1986DlcAdmissions(source, { sourceRoot: source });
  const derivative = await renderAliens1986RasterV116({ root: source });
  for (const path of [...ALIENS1986_RUNTIME_FILES, ...derivative.assets.map(row => row.path)]) {
    const destination = join(target, path);
    // Inspect existing ancestors before mkdir can follow a link.
    for (let parent = dirname(destination); ; parent = dirname(parent)) {
      try {
        const entry = await lstat(parent);
        assert.ok(entry.isDirectory() && !entry.isSymbolicLink(), 'Invalid DLC build directory: ' + parent);
      } catch (error) { if (error?.code !== 'ENOENT') throw error; }
      if (dirname(parent) === parent) break;
    }
    await mkdir(dirname(destination), { recursive: true });
    try {
      const entry = await lstat(destination);
      assert.ok(entry.isFile() && !entry.isSymbolicLink(), 'Invalid DLC build destination: ' + path);
    } catch (error) { if (error?.code !== 'ENOENT') throw error; }
    if (path.endsWith('/game.html')) await writeFile(destination, derivative.html);
    else await cp(join(source, path), destination);
  }
  return verifyAliens1986DlcAdmissions(target, { built: true, sourceRoot: source });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const output = resolveSafeBuildOutput(process.cwd(), process.argv[2] || 'dist');
  console.log(JSON.stringify(await buildAliens1986Dlc(process.cwd(), output), null, 2));
}
