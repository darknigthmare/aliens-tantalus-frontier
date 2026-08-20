import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const roots = ['src', 'scripts', 'tests'];
const files = [];
async function walk(path) {
  try {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const target = join(path, entry.name);
      if (entry.isDirectory()) await walk(target);
      else if (['.js', '.mjs'].includes(extname(entry.name))) files.push(target);
    }
  } catch (error) {
    if (path !== 'tests') throw error;
  }
}
for (const root of roots) await walk(root);
const failures = [];
for (const file of files) {
  const check = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (check.status !== 0) failures.push(`${file}: ${check.stderr || check.stdout}`);
  const source = await readFile(file, 'utf8');
  if (/\beval\s*\(/.test(source)) failures.push(`${file}: eval is forbidden`);
  if (/document\.write\s*\(/.test(source)) failures.push(`${file}: document.write is forbidden`);
}
if (failures.length) throw new Error(failures.join('\n'));
console.log(`Syntax and safety lint passed for ${files.length} modules.`);
