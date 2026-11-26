import assert from 'node:assert/strict';
import { cp, lstat, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveSafeBuildOutput } from './build-output-guard.mjs';
import { ALIEN_ISOLATION_RUNTIME_FILES, verifyAlienIsolationDlcAdmissions } from './public-alien-isolation-dlc-admissions.mjs';

/** Copy only the reviewed launcher and its self-contained game. Historical
 * sources, scripts, screenshots and reports remain in the repository. */
export async function buildAlienIsolationDlc(root, output) {
  const source = resolve(root), target = resolve(output);
  assert.notEqual(source, target, 'DLC output must differ from the source checkout.');
  await verifyAlienIsolationDlcAdmissions(source);
  // Inspect existing ancestors before mkdir can follow a link.
  for (let path = join(target, 'dlc', 'alien-isolation'); ; path = dirname(path)) {
    try {
      const entry = await lstat(path);
      assert.ok(entry.isDirectory() && !entry.isSymbolicLink(), 'Invalid DLC build directory: ' + path);
    } catch (error) { if (error?.code !== 'ENOENT') throw error; }
    if (dirname(path) === path) break;
  }
  await mkdir(join(target, 'dlc', 'alien-isolation'), { recursive: true });
  for (const path of ALIEN_ISOLATION_RUNTIME_FILES) {
    const destination = join(target, path);
    try {
      const entry = await lstat(destination);
      assert.ok(entry.isFile() && !entry.isSymbolicLink(), 'Invalid DLC build destination: ' + path);
    } catch (error) { if (error?.code !== 'ENOENT') throw error; }
    await cp(join(source, path), destination);
  }
  return verifyAlienIsolationDlcAdmissions(target, { built: true });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const output = resolveSafeBuildOutput(process.cwd(), process.argv[2] || 'dist');
  console.log(JSON.stringify(await buildAlienIsolationDlc(process.cwd(), output), null, 2));
}
