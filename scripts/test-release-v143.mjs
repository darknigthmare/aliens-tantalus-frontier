import { readFile } from 'node:fs/promises';
import { readdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Execute every declared Node test exactly once; overlapping suite aliases do
 * not inflate results. Browser and build checks remain separate CI steps. */
export function collectReleaseTestsV143(scripts) {
  const files = new Set();
  for (const [name, command] of Object.entries(scripts)) {
    if (!name.startsWith('test:') || !command.startsWith('node --test ')) continue;
    for (const file of command.slice('node --test '.length).trim().split(/\s+/)) {
      if (file === 'modules/alien-earth/v12/tests/*.test.mjs') {
        // Expand this admitted suite to literal files without invoking a shell.
        const directory = 'modules/alien-earth/v12/tests/';
        const tests = readdirSync(new URL('../' + directory, import.meta.url), { withFileTypes: true })
          .filter(entry => entry.name.endsWith('.test.mjs'));
        if (!tests.length || tests.some(entry => !entry.isFile() || !/^[a-z0-9-]+\.test\.mjs$/.test(entry.name)))
          throw new Error(`Unsupported test entry: ${name}`);
        for (const entry of tests) files.add(directory + entry.name);
        continue;
      }
      if (!/^scripts\/[a-z0-9-]+\.mjs$/.test(file)) throw new Error(`Unsupported test entry: ${name}`);
      files.add(file);
    }
  }
  if (!files.size) throw new Error('No release tests declared.');
  return [...files].sort();
}
export async function runReleaseTestsV143() {
  const pkg = JSON.parse(await readFile('package.json', 'utf8'));
  const files = collectReleaseTestsV143(pkg.scripts);
  console.log(`Release test files: ${files.length} (unique; no suite aliases counted twice).`);
  const child = spawn(process.execPath, ['--test', '--test-concurrency=2', ...files], { stdio: 'inherit' });
  const code = await new Promise((ok, fail) => { child.once('error', fail); child.once('exit', (status, signal) => ok(signal ? 1 : status ?? 1)); });
  process.exitCode = code;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await runReleaseTestsV143();
