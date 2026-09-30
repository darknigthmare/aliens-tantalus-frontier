import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { releasePlanV98 } from '../v98-batch-050/verify-release.mjs';

const DEFAULT_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
export function releaseOriginV99(input) {
  const url = new URL(input);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  assert.ok(local && ['http:', 'https:'].includes(url.protocol)
    || url.origin === 'https://aliens-tantalus-frontier.vercel.app', 'Only loopback or this project production origin is allowed');
  assert.ok(!url.username && !url.password && !url.search && !url.hash && url.pathname === '/', 'Expected a bare origin');
  return url.origin;
}
export async function releasePlanV99(root = DEFAULT_ROOT) {
  root = resolve(root);
  const plan = await releasePlanV98(root);
  const json = async p => JSON.parse(await readFile(resolve(root, p), 'utf8'));
  const folder = 'docs/references/v99-batch-050';
  const admission = await json(`${folder}/ADMISSION.json`), batch = await json(`${folder}/batch-050.json`);
  const { ENEMY_DEDICATED_BATCH_V99: poses } = await import(pathToFileURL(resolve(root, 'src/enemy-dedicated-batch-v99.js')));
  const { createBuildAssetFilter } = await import(pathToFileURL(resolve(root, 'scripts/build-asset-filter.mjs')));
  const filter = createBuildAssetFilter(root);
  assert.equal(admission.attempted, 50); assert.equal(batch.jobs.length, 50);
  assert.equal(poses.length, admission.accepted);
  for (const pose of poses) {
    const path = pose.path.slice(1);
    assert.equal(filter(resolve(root, path)), true);
    assert.ok(admission.outcomes.some(o => o.profileId === pose.profileId && o.sha256 === pose.sha256 && o.path === pose.path));
    plan.assetPaths.push(path); plan.declaredHashes.set(path, pose.sha256);
  }
  for (const outcome of admission.outcomes.filter(o => o.status === 'held')) {
    const job = batch.jobs.find(j => j.profileId === outcome.profileId);
    assert.ok(job); assert.equal(filter(resolve(root, job.outputPath)), false);
    plan.heldPaths.push(job.outputPath);
  }
  assert.equal(admission.held + poses.length, 50);
  plan.textPaths.push('src/enemy-dedicated-poses-v99.js', 'src/enemy-dedicated-batch-v99.js',
    'src/bioforge-level-v80.js', 'src/bioforge-runtime-v80.js', 'src/bioforge-session-v80.js',
    'src/bioforge-ui-v80.js',
    'src/catalog-runtime-v62.js', 'src/game-v51-runtime.js', 'src/game-v52-runtime.js');
  plan.privatePaths.push(folder, `${folder}/`);
  for (const entry of await readdir(resolve(root, folder), { withFileTypes: true })) {
    if (!entry.isFile() || !/\.(json|mjs|md)$/.test(entry.name)) continue;
    const path = `${folder}/${entry.name}`;
    assert.equal(filter(resolve(root, path)), false); plan.privatePaths.push(path);
  }
  // Every inherited surface remains checked, once per exact path.
  for (const key of ['assetPaths', 'textPaths', 'privatePaths', 'heldPaths']) plan[key] = [...new Set(plan[key])];
  return plan;
}
export async function verifyReleaseV99({ root = process.env.SOURCE_ROOT || DEFAULT_ROOT,
  base = process.env.APP_URL || 'http://127.0.0.1:4307', fetchImpl = globalThis.fetch } = {}) {
  const origin = releaseOriginV99(base), plan = await releasePlanV99(root);
  const jobs = [
    ...plan.textPaths.map(path => ({ path, type: 'text', expected: 200 })),
    ...plan.assetPaths.map(path => ({ path, type: 'native-png', expected: 200 })),
    ...plan.privatePaths.map(path => ({ path, type: 'private', expected: 404 })),
    ...plan.heldPaths.map(path => ({ path, type: 'held', expected: 404 }))
  ];
  const results = new Array(jobs.length); let cursor = 0;
  const normalize = (bytes, type) => type === 'text' ? Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n')) : bytes;
  async function worker() {
    while (cursor < jobs.length) {
      const n = cursor++, job = jobs[n], result = { ...job, ok: false };
      try {
        let url = `${origin}/${job.path}`, response;
        // Vercel cleanUrls may redirect .html to its extensionless equivalent.
        for (let redirects = 0; redirects < 3; redirects++) {
          response = await fetchImpl(url, { redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(30000) });
          if (![301, 302, 307, 308].includes(response.status)) break;
          const next = new URL(response.headers.get('location'), url);
          assert.equal(next.origin, origin, 'No cross-origin redirects');
          await response.body?.cancel(); url = next.href;
        }
        result.status = response.status; assert.equal(response.status, job.expected, job.path);
        if (job.expected === 200) {
          const local = normalize(await readFile(resolve(plan.sourceRoot, job.path)), job.type);
          const bytes = normalize(Buffer.from(await response.arrayBuffer()), job.type);
          result.sha256 = sha(bytes); assert.equal(result.sha256, sha(local), `Commit export parity ${job.path}`);
          if (job.type === 'native-png') {
            assert.match(response.headers.get('content-type') || '', /^image\/png/);
            const declared = plan.declaredHashes.get(job.path);
            if (declared) assert.equal(result.sha256, declared);
          }
        } else await response.body?.cancel();
        result.ok = true;
      } catch (e) { result.error = String(e.message || e); }
      results[n] = result;
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  return { schema: 'v99-release-http/1', ok: results.every(r => r.ok), origin, sourceRoot: plan.sourceRoot,
    checkedAt: new Date().toISOString(), counts: { text: plan.textPaths.length, bitmaps: plan.assetPaths.length,
      private404: plan.privatePaths.length, held404: plan.heldPaths.length,
      passed: results.filter(r => r.ok).length, failed: results.filter(r => !r.ok).length }, results };
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const output = resolve(process.env.QA_OUTPUT || 'E:/CodexQA/AliensTantalus/v99-release-http.json');
  let report;
  try { report = await verifyReleaseV99(); }
  catch (e) { report = { ok: false, error: String(e.message || e) }; }
  await mkdir(dirname(output), { recursive: true }); await writeFile(output, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ok: report.ok, counts: report.counts, error: report.error, output }));
  if (!report.ok) process.exitCode = 1;
}
