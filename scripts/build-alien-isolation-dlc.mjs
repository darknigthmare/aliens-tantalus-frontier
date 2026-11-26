import assert from 'node:assert/strict';
import { cp, lstat, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveSafeBuildOutput } from './build-output-guard.mjs';
import { alienIsolationRuntimeFiles, verifyAlienIsolationDlcAdmissions } from './public-alien-isolation-dlc-admissions.mjs';

/** Export only externally pinned runtime members. Every destination ancestor and
 * existing file is checked before any copy; sources and candidates stay out. */
export async function buildAlienIsolationDlc(root, output) {
  const source = resolve(root), target = resolve(output);
  assert.notEqual(source, target, 'DLC output must differ from the source checkout.');
  await verifyAlienIsolationDlcAdmissions(source);
  const paths = alienIsolationRuntimeFiles(), directories = new Set();
  for (const path of paths) {
    const destination = join(target, path);
    for (let ancestor = dirname(destination); ; ancestor = dirname(ancestor)) {
      directories.add(ancestor);
      if (dirname(ancestor) === ancestor) break;
    }
    try {
      const entry = await lstat(destination);
      assert.ok(entry.isFile() && !entry.isSymbolicLink(), 'Invalid DLC build destination: ' + path);
    } catch (error) { if (error?.code !== 'ENOENT') throw error; }
  }
  for (const directory of directories) {
    try {
      const entry = await lstat(directory);
      assert.ok(entry.isDirectory() && !entry.isSymbolicLink(), 'Invalid DLC build directory: ' + directory);
    } catch (error) { if (error?.code !== 'ENOENT') throw error; }
  }
  for (const path of paths) {
    const destination = join(target, path);
    await mkdir(dirname(destination), { recursive: true });
    await cp(join(source, path), destination);
  }
  return verifyAlienIsolationDlcAdmissions(target, { built: true });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const output = resolveSafeBuildOutput(process.cwd(), process.argv[2] || 'dist');
  console.log(JSON.stringify(await buildAlienIsolationDlc(process.cwd(), output), null, 2));
}
