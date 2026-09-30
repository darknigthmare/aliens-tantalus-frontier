import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { releaseOriginV99, verifyReleaseV99 } from '../v99-batch-050/verify-release.mjs';

const defaultRoot = fileURLToPath(new URL('../../../', import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export async function verifyReleaseV100({ root = process.env.SOURCE_ROOT || defaultRoot,
  base = process.env.APP_URL || 'http://127.0.0.1:4309', includePrevious = true } = {}) {
  const origin = releaseOriginV99(base);
  root = resolve(root);
  const { USER_REFERENCE_LIBRARY_V100: library } = await import(pathToFileURL(resolve(root, 'src/user-reference-library-v100.js')));
  const textPaths = ['index.html', 'sw.js', 'src/app.js', 'src/catalog-runtime-v62.js', 'src/catalog-ui-v62.js',
    'src/user-pack-v100.js', 'src/user-reference-library-v100.js', 'src/user-reference-recovery-v100.js',
    'src/enemy-physical-size-v100.js', 'user-reference-library-v100.css'];
  const jobs = [...textPaths.map(path => ({ path, kind: 'text', status: 200 })),
    ...library.map(entry => ({ path: entry.path.slice(1), kind: 'image', status: 200, sha256: entry.sourceSha256 })),
    ...['docs/references/v100-user-pack/CLASSIFICATION.json', 'docs/references/v100-user-pack/CLASSIFICATION.md',
      'docs/references/v100-user-pack/verify-release.mjs', 'scripts/import-user-pack-v100.mjs',
      'assets/user/pack-v100/unreviewed.jpg', 'assets/user/recovery-v100/other.jpg']
      .map(path => ({ path, kind: 'private', status: 404 }))];
  const results = new Array(jobs.length); let cursor = 0;
  const normalized = bytes => Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'));
  async function worker() {
    while (cursor < jobs.length) {
      const index = cursor++, job = jobs[index]; const result = { ...job, ok: false };
      try {
        let url = `${origin}/${job.path}`, response;
        for (let redirects = 0; redirects < 3; redirects++) {
          response = await fetch(url, { redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(30000) });
          if (![301, 302, 307, 308].includes(response.status)) break;
          const next = new URL(response.headers.get('location'), url); assert.equal(next.origin, origin);
          await response.body?.cancel(); url = next.href;
        }
        result.actualStatus = response.status; assert.equal(response.status, job.status, job.path);
        if (job.status === 200) {
          const actual = Buffer.from(await response.arrayBuffer()), local = await readFile(resolve(root, job.path));
          if (job.kind === 'image') {
            assert.match(response.headers.get('content-type') || '', /^image\/(jpeg|webp|png)(;|$)/u);
            assert.equal(hash(actual), job.sha256, job.path); assert.equal(hash(local), job.sha256);
          } else assert.equal(hash(normalized(actual)), hash(normalized(local)), job.path);
          result.bytes = actual.length;
        } else await response.body?.cancel();
        result.ok = true;
      } catch (error) { result.error = String(error.message || error); }
      results[index] = result;
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  const previous = includePrevious ? await verifyReleaseV99({ root, base: origin }) : null;
  return { schema: 'v100-release-http/1', origin, sourceRoot: root, checkedAt: new Date().toISOString(),
    ok: results.every(result => result.ok) && (!previous || previous.ok),
    counts: { images: library.length, text: textPaths.length, private404: 6,
      passed: results.filter(result => result.ok).length, failed: results.filter(result => !result.ok).length }, results, previous };
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const output = resolve(process.env.QA_OUTPUT || '.qa/v100-release-http.json');
  const report = await verifyReleaseV100();
  await mkdir(dirname(output), { recursive: true }); await writeFile(output, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ok: report.ok, counts: report.counts, previous: report.previous?.counts,
    failures: report.results.filter(result => !result.ok), output }));
  if (!report.ok) process.exitCode = 1;
}
