import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';

const base = 'https://aliens-tantalus-frontier.vercel.app';
const commit = '7804645';
const results = [];
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
async function get(path) {
  const response = await fetch(base + path, { cache: 'no-store', signal: AbortSignal.timeout(60000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  return { response, bytes };
}
for (const path of ['/', '/build-info.json', '/sw.js']) {
  const { response, bytes } = await get(path);
  assert.equal(response.status, 200, path);
  const body = bytes.toString('utf8');
  if (path === '/') assert.match(body, /<title>ALIENS: TANTALUS FRONTIER v76<\/title>/);
  if (path === '/build-info.json') assert.equal(JSON.parse(body).version, '76.0.0');
  if (path === '/sw.js') assert.match(body, /atf-v76-hub-enemy-shell-1/);
  results.push({ path, status: response.status, versionVerified: true });
}
for (const path of [
  'assets/openai/sprites/normalized/enemy-profiles-v66/enemy-015-prowler.webp',
  'assets/openai/sprites/normalized/enemy-profiles-v66/enemy-051-ceto-reef-predator.webp',
  'src/enemy-ceto-v75.js', 'src/hub-dialogue-ui-v76.js', 'hub-stations-v61.css'
]) {
  const git = spawnSync('git', ['show', `${commit}:${path}`], { maxBuffer: 8 * 1024 * 1024, windowsHide: true });
  assert.equal(git.status, 0, `committed source ${path}`);
  const { response, bytes } = await get('/' + path);
  assert.equal(response.status, 200, path);
  assert.equal(sha(bytes), sha(git.stdout), `production bytes ${path}`);
  results.push({ path, status: response.status, sha256: sha(bytes), matchesCommit: commit });
}
for (const path of [
  '/docs/references/V76_CHATGPT_PROJECT_GAP_MATRIX.md',
  '/assets/openai/sprites/frames/v75/enemy-011-lurker/attack-pounce-r1.png',
  '/assets/openai/sprites/normalized/enemy-profiles-v66/enemy-023-atarax-ripper.webp'
]) {
  const { response } = await get(path);
  assert.equal(response.status, 404, `private or rejected asset excluded: ${path}`);
  results.push({ path, status: response.status, excluded: true });
}
const report = { ok: true, checkedAt: new Date().toISOString(), commit, target: 'production', base, results };
await writeFile('docs/references/v76-release-qa/production-http.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
