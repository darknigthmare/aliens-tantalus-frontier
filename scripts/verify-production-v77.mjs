import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';

const commit = process.argv.find(arg => arg.startsWith('--commit='))?.slice(9);
assert.match(commit || '', /^[a-f0-9]{7,40}$/, 'Pass the exact deployed content commit with --commit=...');
const base = 'https://aliens-tantalus-frontier.vercel.app';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const results = [];
async function get(path) {
  const response = await fetch(base + path, { cache: 'no-store', signal: AbortSignal.timeout(30000) });
  return { response, bytes: Buffer.from(await response.arrayBuffer()) };
}
for (const path of ['/', '/build-info.json', '/sw.js']) {
  const { response, bytes } = await get(path);
  assert.equal(response.status, 200, path);
  const text = bytes.toString('utf8');
  if (path === '/') assert.match(text, /<title>ALIENS: TANTALUS FRONTIER v77<\/title>/);
  if (path === '/build-info.json') assert.equal(JSON.parse(text).version, '77.0.0');
  if (path === '/sw.js') assert.match(text, /atf-v77-tactical-audio-shell-1/);
  results.push({ path, status: response.status, versionVerified: true });
}
for (const path of [
  'index.html', 'runtime-level.css', 'src/game-runtime.js', 'src/content.js',
  'src/tactical-reload-v77.js', 'src/mission-input-v77.js', 'src/tactical-reload-hud-v77.js',
  'src/audio.js', 'src/audio-assets-v77.js', 'src/app.js', 'src/content-core-v50.js',
  'src/game-v51-runtime.js', 'src/game-production-runtime.js', 'src/game-v52-level-runtime.js',
  'assets/audio/manifest.json',
  'assets/openai/sprites/normalized/enemy-profiles-v66/enemy-015-prowler.webp',
  'assets/openai/sprites/normalized/enemy-profiles-v66/enemy-051-ceto-reef-predator.webp'
]) {
  const git = spawnSync('git', ['show', `${commit}:${path}`], { maxBuffer: 8 * 1024 * 1024, windowsHide: true });
  assert.equal(git.status, 0, `committed source ${path}`);
  const { response, bytes } = await get('/' + path);
  assert.equal(response.status, 200, path);
  assert.equal(sha(bytes), sha(git.stdout), `production bytes ${path}`);
  if (path.endsWith('/manifest.json')) {
    assert.match(response.headers.get('content-type'), /application\/json/);
    const manifest = JSON.parse(bytes);
    assert.equal(Object.values(manifest.tracks).flatMap(tracks => Object.values(tracks)).flatMap(track => track.sources).length, 0);
  }
  results.push({ path, status: response.status, sha256: sha(bytes), matchesCommit: commit });
}
for (const path of [
  '/assets/audio/music/menu.mp3', '/assets/audio/sfx/shot.wav',
  '/docs/references/V76_CHATGPT_PROJECT_GAP_MATRIX.md',
  '/docs/references/v77-player-reload/PRODUCTION_STATUS.md',
  '/assets/openai/sprites/frames/v75/enemy-011-lurker/attack-pounce-r1.png',
  '/assets/openai/sprites/normalized/enemy-profiles-v66/enemy-023-atarax-ripper.webp'
]) {
  const { response } = await get(path);
  assert.equal(response.status, 404, `absent or excluded file: ${path}`);
  results.push({ path, status: response.status, absentOrExcluded: true });
}
const report = { ok: true, checkedAt: new Date().toISOString(), commit, target: 'production', base, results };
await mkdir('docs/references/v77-release-qa', { recursive: true });
await writeFile('docs/references/v77-release-qa/production-http.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
