// Explicit local commit scope, excluding unrelated Ceto water alignment and private bitmaps.
// Default is a read-only manifest. --stage stages only the inspected list, never commits/pushes.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createBuildAssetFilter } from '../../../scripts/build-asset-filter.mjs';

const root = process.cwd(), filter = createBuildAssetFilter(root);
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
const split = result => result.split('\0').filter(Boolean);
const excluded = new Set(['src/mission-interactive-art-v56.js', 'tests/mission-interactive-art-v56.test.mjs']);
const paths = new Set(split(git('diff', '--name-only', '-z')).filter(p => !excluded.has(p)));
for (const p of split(git('ls-files', '--others', '--exclude-standard', '-z', '--', 'src', 'tests'))) paths.add(p);
for (const p of ['xeno-trials-v96.css', 'depth-lab-v97.html', 'depth-lab-v97.css']) paths.add(p);
for (const p of split(git('ls-files', '--others', '--exclude-standard', '-z', '--', 'assets/openai/sprites', 'assets/openai/ui/title/v90'))) {
  if (/^assets\/openai\/(?:sprites\/(?:static-enemy-v9[2-7]|user-equipment-v95)\/|ui\/title\/v90\/orbitals\/)/.test(p)
    && filter(resolve(root, p))) paths.add(p);
}
for (const p of split(git('ls-files', '--others', '--exclude-standard', '-z', '--', 'docs'))) {
  if (/^docs\/(?:V(?:88|89|90|96|97)_[^/]+\.md|references\/V(?:88|89|90)_[^/]+\.md)$/.test(p)) paths.add(p);
}
const references = {
  'v91-enemy-only': ['audit-candidate-png.mjs', 'GENERATIONS.json', 'pass-v92/GENERATIONS.json', 'pass-v93/GENERATIONS.json', 'pass-v94/GENERATIONS.json'],
  'v90-art-batch': ['GENERATIONS.json'],
  'v95-user-creatures': ['audit-pngs-v95.mjs', 'INVENTORY.json', 'STATUS-20260926.json', 'inspect-status-v95.mjs',
    'generation-a.json', 'generation-b.json', 'generation-root-20260926.json', 'generation-root-final.json',
    'generation-quality-25-20260926.json', 'ADMISSION-25-20260926.json', 'generation-arachnoid-purple-20260926.json'],
  'v96-xeno-trials': ['audit-roster-v96.mjs', 'production-manifest-v96.json',
    ...readdirSync('docs/references/v96-xeno-trials').filter(p => /^generation-[a-z0-9-]+\.json$/.test(p))],
  'v97-batch-050': readdirSync('docs/references/v97-batch-050').filter(p => /^(?:generation-|shard-|batch-050\.json$|ADMISSION\.json$|prepare-batch\.mjs$|admit-batch\.mjs$|browser-[a-z0-9-]+\.mjs$|verify-build-v97\.mjs$|stage-release\.mjs$)/.test(p))
};
for (const [folder, files] of Object.entries(references)) for (const file of files) paths.add(`docs/references/${folder}/${file}`);
for (const p of paths) assert.ok(existsSync(p), p);
const selected = [...paths].sort();
writeFileSync('docs/references/v97-batch-050/commit-scope.json', JSON.stringify({ excluded: [...excluded],
  excludedHunk: 'src/game-v51-runtime.js: Ceto water-band alignment', count: selected.length, files: selected }, null, 2) + '\n');
if (process.argv.includes('--stage')) {
  assert.equal(git('diff', '--cached', '--name-only').trim(), '', 'Index must be empty before scoped staging');
  const gameDiff = git('diff', '--', 'src/game-v51-runtime.js');
  const header = gameDiff.slice(0, gameDiff.indexOf('@@'));
  const hunks = gameDiff.slice(gameDiff.indexOf('@@')).split(/(?=^@@ )/m);
  const ceto = hunks.filter(h => h.includes('profile.cetoVisibleBands'));
  assert.equal(ceto.length, 1, 'Expected exactly one independent Ceto hunk');
  for (let i = 0; i < selected.length; i += 40) git('add', '--', ...selected.slice(i, i + 40));
  execFileSync('git', ['apply', '--cached', '--reverse', '-'], { cwd: root, input: header + ceto[0], encoding: 'utf8' });
  assert.ok(!git('diff', '--cached', '--', 'src/game-v51-runtime.js').includes('profile.cetoVisibleBands'));
  assert.ok(git('diff', '--', 'src/game-v51-runtime.js').includes('profile.cetoVisibleBands'), 'Unrelated work must remain untouched');
}
console.log(JSON.stringify({ stage: process.argv.includes('--stage'), files: selected.length,
  publicAssets: selected.filter(p => p.startsWith('assets/')).length, sources: selected.filter(p => p.startsWith('src/')).length }));
