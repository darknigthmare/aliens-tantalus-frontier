import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { verifyReleaseV100 } from '../v100-user-pack/verify-release.mjs';
import { releaseOriginV99 } from '../v99-batch-050/verify-release.mjs';

// Verify the clean export against a loopback build or this project's production.
// Private QA paths must remain unavailable; originals are checked by V100.
const root = resolve(process.env.SOURCE_ROOT || fileURLToPath(new URL('../../../', import.meta.url)));
const origin = releaseOriginV99(process.env.APP_URL || 'http://127.0.0.1:4310');
const { XENO_TRIALS_FIGHTERS_V96: fighters, getXenoTrialsArtV96: art } = await import(pathToFileURL(resolve(root, 'src/xeno-trials-data-v96.js')));
assert.equal(fighters.length, 103);
assert.equal(fighters.filter(fighter => fighter.family === 'synthetic').length, 15);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const jobs = [
  ...['src/xeno-trials-data-v96.js', 'sw.js'].map(path => ({ path, kind: 'text', status: 200 })),
  ...fighters.slice(53).map(fighter => ({ path: art(fighter.id).path.slice(1), kind: 'image', status: 200, sha256: art(fighter.id).sha256 })),
  ...['docs/references/v101-trials-roster/verify-release.mjs',
    'docs/references/v101-trials-roster/browser-trials-v101.mjs',
    'docs/references/v101-trials-roster/VALIDATION.json'].map(path => ({ path, kind: 'private', status: 404 }))
];
let cursor = 0;
const results = new Array(jobs.length);
async function worker() {
  while (cursor < jobs.length) {
    const index = cursor++, job = jobs[index], result = { ...job, ok: false };
    try {
      const response = await fetch(origin + '/' + job.path, { redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(30000) });
      result.actualStatus = response.status;
      assert.equal(response.status, job.status, job.path);
      if (job.status === 200) {
        const actual = Buffer.from(await response.arrayBuffer()), expected = await readFile(resolve(root, job.path));
        if (job.kind === 'image') {
          assert.match(response.headers.get('content-type') || '', /^image\/png/);
          assert.equal(hash(actual), job.sha256); assert.equal(hash(expected), job.sha256);
        } else {
          assert.equal(hash(actual.toString('utf8').replace(/\r\n/g, '\n')), hash(expected.toString('utf8').replace(/\r\n/g, '\n')));
          if (job.path === 'sw.js') assert.ok(actual.includes('atf-v86-trials-roster-v101-shell-1'));
        }
      } else await response.body?.cancel();
      result.ok = true;
    } catch (error) { result.error = String(error.message || error); }
    results[index] = result;
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
const previous = await verifyReleaseV100({ root, base: origin });
const report = { schema: 'v101-release-http/1', checkedAt: new Date().toISOString(), origin, sourceRoot: root,
  fighters: 103, added: 50, synthetics: 15,
  ok: results.every(result => result.ok) && previous.ok,
  counts: { passed: results.filter(result => result.ok).length, failed: results.filter(result => !result.ok).length }, results, previous };
const output = resolve(process.env.QA_OUTPUT || '.qa/v101/http.json');
await mkdir(dirname(output), { recursive: true }); await writeFile(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ok: report.ok, counts: report.counts, v100: previous.counts, v99: previous.previous?.counts, output }));
if (!report.ok) process.exitCode = 1;
