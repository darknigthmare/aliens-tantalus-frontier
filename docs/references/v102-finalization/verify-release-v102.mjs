import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { releaseOriginV99, releasePlanV99 } from '../v99-batch-050/verify-release.mjs';

// The private admission evidence defines the allowed art. Public text is compared
// against the audited, sanitized distribution, never against private provenance.
const sourceRoot = resolve(process.env.SOURCE_ROOT || '.');
assert.ok(process.env.PUBLIC_ROOT, 'PUBLIC_ROOT must identify the audited public build');
const publicRoot = resolve(process.env.PUBLIC_ROOT);
const origin = releaseOriginV99(process.env.APP_URL || 'http://127.0.0.1:4312');
const plan = await releasePlanV99(sourceRoot);
const { USER_REFERENCE_LIBRARY_V100: library } = await import(pathToFileURL(resolve(sourceRoot, 'src/user-reference-library-v100.js')));
const { XENO_TRIALS_FIGHTERS_V96: fighters, getXenoTrialsArtV96: art } = await import(pathToFileURL(resolve(sourceRoot, 'src/xeno-trials-data-v96.js')));
assert.equal(library.length, 108);
assert.equal(fighters.length, 103);
assert.equal(fighters.filter(fighter => fighter.family === 'synthetic').length, 15);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const normalize = bytes => Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'));
const jobsByPath = new Map();
function add(path, type, status = 200, hash) {
  const previous = jobsByPath.get(path);
  assert.ok(!previous || previous.status === status, `Conflicting admission: ${path}`);
  jobsByPath.set(path, { ...previous, path, type, status, hash: hash || previous?.hash });
}
for (const path of plan.textPaths) add(path, 'text');
for (const path of plan.assetPaths) add(path, 'image', 200, plan.declaredHashes.get(path));
for (const path of [...plan.privatePaths, ...plan.heldPaths]) add(path, 'private', 404);
for (const path of ['index.html', 'sw.js', 'src/app.js', 'src/catalog-runtime-v62.js', 'src/catalog-ui-v62.js',
  'src/user-pack-v100.js', 'src/user-reference-library-v100.js', 'src/user-reference-recovery-v100.js',
  'src/enemy-physical-size-v100.js', 'user-reference-library-v100.css', 'src/xeno-trials-data-v96.js',
  'src/xeno-trials-runtime-v96.js', 'src/xeno-trials-ui-v96.js', 'xeno-trials-v96.css',
  'src/game-v51-runtime.js', 'src/mission-interactive-art-v56.js', 'depth-lab-v97.html', 'depth-lab-v97.css']) add(path, 'text');
for (const entry of library) add(entry.path.slice(1), 'image', 200, entry.sourceSha256 || entry.sha256);
for (const fighter of fighters) {
  const entry = art(fighter.id);
  if (entry?.path) add(entry.path.slice(1), 'image', 200, entry.sha256);
}
for (const path of ['docs/references/v100-user-pack/CLASSIFICATION.json',
  'docs/references/v100-user-pack/CLASSIFICATION.md', 'docs/references/v100-user-pack/verify-release.mjs',
  'scripts/import-user-pack-v100.mjs', 'assets/user/pack-v100/unreviewed.jpg', 'assets/user/recovery-v100/other.jpg',
  'docs/references/v101-trials-roster/verify-release.mjs', 'docs/references/v101-trials-roster/browser-trials-v101.mjs',
  'docs/references/v101-trials-roster/VALIDATION.json', 'docs/references/v102-finalization/browser-ceto-v102.mjs',
  'docs/references/v102-finalization/verify-release-v102.mjs', 'docs/references/v102-finalization/VALIDATION.json',
  '.env', '.git/config', 'tests/mission-interactive-art-v56.test.mjs']) add(path, 'private', 404);
const jobs = [...jobsByPath.values()];
// Fail locally before network access if sanitization accidentally changed art.
for (const job of jobs.filter(job => job.type === 'image')) {
  const bytes = await readFile(resolve(publicRoot, job.path));
  const source = await readFile(resolve(sourceRoot, job.path));
  assert.equal(sha(bytes), sha(source), `Public asset changed: ${job.path}`);
  if (job.hash) assert.equal(sha(bytes), job.hash, job.path);
}
assert.ok((await readFile(resolve(publicRoot, 'sw.js'), 'utf8')).includes('atf-v86-ceto-final-v102-shell-1'));
let cursor = 0;
const results = new Array(jobs.length);
async function worker() {
  while (cursor < jobs.length) {
    const index = cursor++, job = jobs[index], result = { ...job, ok: false };
    try {
      let url = `${origin}/${job.path}`, response;
      for (let redirects = 0; redirects < 3; redirects++) {
        response = await fetch(url, { redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(45000) });
        if (![301, 302, 307, 308].includes(response.status)) break;
        const next = new URL(response.headers.get('location'), url);
        assert.equal(next.origin, origin, 'No cross-origin redirect');
        await response.body?.cancel(); url = next.href;
      }
      result.actualStatus = response.status;
      assert.equal(response.status, job.status, job.path);
      if (job.status === 200) {
        const actual = Buffer.from(await response.arrayBuffer());
        const expected = await readFile(resolve(publicRoot, job.path));
        result.sha256 = sha(job.type === 'text' ? normalize(actual) : actual);
        assert.equal(result.sha256, sha(job.type === 'text' ? normalize(expected) : expected), job.path);
        if (job.type === 'image') {
          assert.match(response.headers.get('content-type') || '', /^image\/(png|jpeg|webp)(;|$)/u);
          if (job.hash) assert.equal(result.sha256, job.hash, job.path);
        }
      } else await response.body?.cancel();
      result.ok = true;
    } catch (error) { result.error = String(error.message || error); }
    results[index] = result;
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
const report = { schema: 'v102-public-http/1', checkedAt: new Date().toISOString(), origin, sourceRoot, publicRoot,
  ok: results.every(result => result.ok), counts: { total: jobs.length,
    passed: results.filter(result => result.ok).length, failed: results.filter(result => !result.ok).length,
    images: jobs.filter(job => job.type === 'image').length, private404: jobs.filter(job => job.status === 404).length }, results };
const output = resolve(process.env.QA_OUTPUT || '.qa/v102/http.json');
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ok: report.ok, counts: report.counts, failures: results.filter(result => !result.ok), output }));
if (!report.ok) process.exitCode = 1;
