import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Private, local-only release QA. SOURCE_ROOT is the exported Git index, not dist.
// APP_URL=http://127.0.0.1:4307 SOURCE_ROOT=<export> QA_OUTPUT=<directory-or-json>
// No browser, Git mutation, asset conversion, deployment or production request.
const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(HERE, '../../..');
export const TEXT_PATHS_V97 = Object.freeze([
  'index.html', 'sw.js', 'src/app.js', 'xeno-trials-v96.css',
  ...['data', 'engine', 'progress', 'runtime', 'ui'].map(part => `src/xeno-trials-${part}-v96.js`),
  'src/xeno-trials-presentation-v97.js', 'src/xeno-trials-selection-v97.js',
  'depth-lab-v97.html', 'depth-lab-v97.css', 'src/depth-lab-model-v97.js', 'src/depth-lab-v97.js',
  'src/enemy-dedicated-batch-v97.js', 'src/enemy-dedicated-poses-v97.js', 'src/enemy-dedicated-poses-v96.js',
  'src/enemy-static-poses-v94.js', 'src/enemy-static-poses-v95.js', 'src/enemy-static-poses-v96.js',
  'src/enemy-sprite-revisions-v92.js', 'src/enemy-sprite-revisions-v93.js',
  'src/enemy-additional-poses-v94.js', 'src/enemy-user-creations-v95.js',
  'src/enemy-historical-variants-v95.js', 'src/enemy-expansion-assets-v96.js', 'src/enemy-expansion-queen-v96.js',
  'src/user-equipment-art-v95.js', 'src/user-equipment-v95.js',
  'src/user-reference-art-v95.js', 'src/user-reference-effects-v95.js', 'src/title-scene-angle-assets-v88.js'
]);
const ASSET_ROOTS = Object.freeze([
  ...[92, 93, 94, 95, 96, 97].map(version => `assets/openai/sprites/static-enemy-v${version}`),
  'assets/openai/sprites/user-equipment-v95', 'assets/openai/ui/title/v90/orbitals'
]);
const PRIVATE_ROOTS = Object.freeze([
  'docs/references/v95-user-creatures', 'docs/references/v96-xeno-trials', 'docs/references/v97-batch-050'
]);
const REGISTRY_MODULES = Object.freeze([
  'enemy-sprite-revisions-v92', 'enemy-sprite-revisions-v93', 'enemy-additional-poses-v94',
  'enemy-user-creations-v95', 'enemy-historical-variants-v95', 'enemy-dedicated-poses-v97',
  'enemy-expansion-assets-v96', 'enemy-expansion-queen-v96', 'user-equipment-art-v95',
  'user-reference-effects-v95', 'title-scene-angle-assets-v88'
]);
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const normalizedText = bytes => Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'));
const inAssetScope = path => ASSET_ROOTS.some(root => path.startsWith(`${root}/`));

export function localOriginV97(base) {
  const url = new URL(base);
  assert.ok(['http:', 'https:'].includes(url.protocol), 'APP_URL must use HTTP(S)');
  assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname), 'Only localhost/loopback verification is authorized');
  assert.ok(!url.username && !url.password && !url.search && !url.hash && url.pathname === '/',
    'APP_URL must be an origin without credentials, path, query or fragment');
  return url.origin;
}

async function listFiles(root, directory) {
  const files = [];
  for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    assert.ok(!entry.isSymbolicLink(), `Unexpected source symlink: ${path}`);
    if (entry.isDirectory()) files.push(...await listFiles(root, path));
    else if (entry.isFile()) files.push(path);
  }
  return files.sort();
}

export async function buildVerificationPlanV97(sourceRoot = DEFAULT_ROOT) {
  sourceRoot = resolve(sourceRoot);
  const importSource = path => import(pathToFileURL(resolve(sourceRoot, path)).href);
  const { createBuildAssetFilter } = await importSource('scripts/build-asset-filter.mjs');
  const filter = createBuildAssetFilter(sourceRoot);
  const assetPaths = new Set(), declaredHashes = new Map(), visited = new Set();
  // Registry paths prevent a missing source PNG from disappearing silently from a directory scan.
  const visit = value => {
    if (!value || typeof value !== 'object' || visited.has(value)) return;
    visited.add(value);
    for (const candidate of [value.path, value.src]) {
      if (typeof candidate !== 'string' || !candidate.startsWith('/')) continue;
      const path = candidate.slice(1);
      if (!inAssetScope(path) || !filter(resolve(sourceRoot, path))) continue;
      assetPaths.add(path);
      if (/^[a-f0-9]{64}$/.test(value.sha256 || '')) {
        assert.ok(!declaredHashes.has(path) || declaredHashes.get(path) === value.sha256, `Conflicting registry hashes: ${path}`);
        declaredHashes.set(path, value.sha256);
      }
    }
    for (const child of Object.values(value)) visit(child);
  };
  for (const name of REGISTRY_MODULES) visit(await importSource(`src/${name}.js`));
  const excludedCandidatePaths = [];
  for (const directory of ASSET_ROOTS) {
    for (const path of await listFiles(sourceRoot, directory)) {
      if (filter(resolve(sourceRoot, path))) {
        assert.match(path, /\.png$/i, `Unexpected admitted bitmap format: ${path}`);
        assetPaths.add(path);
      } else excludedCandidatePaths.push(path);
    }
    assert.ok([...assetPaths].some(path => path.startsWith(`${directory}/`)), `No admitted assets: ${directory}`);
  }
  const readJson = async path => JSON.parse(await readFile(resolve(sourceRoot, path), 'utf8'));
  const admission = await readJson('docs/references/v97-batch-050/ADMISSION.json');
  const manifest = await readJson('docs/references/v97-batch-050/batch-050.json');
  const held = admission.outcomes.filter(outcome => outcome.status === 'held');
  assert.equal(held.length, 7, 'This release must retain all seven V97 held outcomes');
  assert.equal(admission.held, held.length);
  const heldPaths = held.map(outcome => {
    const job = manifest.jobs.find(job => job.profileId === outcome.profileId);
    assert.ok(job, `Held job absent from manifest: ${outcome.profileId}`);
    assert.equal(job.outputPath, `assets/openai/sprites/static-enemy-v97/${outcome.profileId}.png`);
    assert.equal(filter(resolve(sourceRoot, job.outputPath)), false, `Held image admitted by build filter: ${job.outputPath}`);
    assert.equal(assetPaths.has(job.outputPath), false);
    return job.outputPath;
  });
  const accepted = admission.outcomes.filter(outcome => outcome.status === 'accepted-static-pose');
  assert.equal(accepted.length, admission.accepted);
  assert.equal(assetPaths.size > 0, true);
  assert.equal([...assetPaths].filter(path => path.startsWith('assets/openai/sprites/static-enemy-v97/')).length, accepted.length);
  for (const outcome of accepted) {
    assert.ok(assetPaths.has(outcome.path.slice(1)), `Admission absent from runtime registry: ${outcome.profileId}`);
    assert.equal(declaredHashes.get(outcome.path.slice(1)), outcome.sha256);
  }
  const privatePaths = new Set();
  for (const directory of PRIVATE_ROOTS) {
    privatePaths.add(directory); privatePaths.add(`${directory}/`);
    assert.equal(filter(resolve(sourceRoot, directory)), false, `Private directory admitted: ${directory}`);
    for (const path of await listFiles(sourceRoot, directory)) {
      if (!/\.(?:json|mjs)$/i.test(path)) continue;
      assert.equal(filter(resolve(sourceRoot, path)), false, `Private receipt/helper admitted: ${path}`);
      privatePaths.add(path);
    }
  }
  return { sourceRoot, textPaths: [...TEXT_PATHS_V97], assetPaths: [...assetPaths].sort(),
    declaredHashes, privatePaths: [...privatePaths].sort(), heldPaths, excludedCandidatePaths };
}

export async function verifyBuildV97({ sourceRoot = process.env.SOURCE_ROOT || DEFAULT_ROOT,
  base = process.env.APP_URL || 'http://127.0.0.1:4307', fetchImpl = globalThis.fetch } = {}) {
  const origin = localOriginV97(base), startedAt = new Date().toISOString();
  const plan = await buildVerificationPlanV97(sourceRoot);
  const jobs = [
    ...plan.textPaths.map(path => ({ path, kind: 'text-crlf-normalized', status: 200 })),
    ...plan.assetPaths.map(path => ({ path, kind: 'native-bitmap-exact', status: 200 })),
    ...plan.privatePaths.map(path => ({ path, kind: 'private-not-published', status: 404 })),
    ...plan.heldPaths.map(path => ({ path, kind: 'held-not-published', status: 404 }))
  ];
  const results = new Array(jobs.length);
  let cursor = 0;
  async function worker() {
    while (cursor < jobs.length) {
      const index = cursor++, job = jobs[index], result = { ...job, expectedStatus: job.status };
      delete result.status;
      try {
        const source = job.status === 200 ? await readFile(resolve(plan.sourceRoot, job.path)) : null;
        const expected = source && (job.kind === 'text-crlf-normalized' ? normalizedText(source) : source);
        if (expected) result.sourceSha256 = sha256(expected);
        const registered = plan.declaredHashes.get(job.path);
        if (registered) assert.equal(result.sourceSha256, registered, `Export differs from admitted SHA: ${job.path}`);
        // Never follow redirects: this cannot contact a remote production host.
        const response = await fetchImpl(`${origin}/${job.path}`, {
          cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(15000)
        });
        result.status = response.status;
        result.contentType = response.headers.get('content-type') || '';
        assert.equal(response.status, job.status, `HTTP status: ${job.path}`);
        if (expected) {
          const bytes = Buffer.from(await response.arrayBuffer());
          const remote = job.kind === 'text-crlf-normalized' ? normalizedText(bytes) : bytes;
          result.sourceBytes = source.length; result.httpBytes = bytes.length;
          result.httpSha256 = sha256(remote);
          if (job.kind === 'native-bitmap-exact') assert.match(result.contentType, /^image\/png(?:;|$)/i, job.path);
          assert.equal(result.httpSha256, result.sourceSha256, `HTTP SHA256 differs from export: ${job.path}`);
        } else await response.body?.cancel();
        result.ok = true;
      } catch (error) {
        result.ok = false; result.error = String(error.message || error);
      }
      results[index] = result;
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  return { schema: 'v97-local-build-http/1', ok: results.every(result => result.ok), target: 'local-build-only',
    origin, sourceRoot: plan.sourceRoot, startedAt, finishedAt: new Date().toISOString(),
    textPolicy: 'SHA256 after CRLF-to-LF normalization only', bitmapPolicy: 'Exact native source bytes',
    counts: { text: plan.textPaths.length, bitmaps: plan.assetPaths.length, private404: plan.privatePaths.length,
      held404: plan.heldPaths.length, passed: results.filter(result => result.ok).length, failed: results.filter(result => !result.ok).length },
    excludedCandidatePaths: plan.excludedCandidatePaths, results };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const requested = resolve(process.env.QA_OUTPUT || resolve(HERE, 'local-build-http.json'));
  const output = /\.json$/i.test(requested) ? requested : resolve(requested, 'local-build-http.json');
  let report;
  try { report = await verifyBuildV97(); }
  catch (error) { report = { schema: 'v97-local-build-http/1', ok: false, target: 'local-build-only',
    error: String(error.message || error), finishedAt: new Date().toISOString() }; }
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ok: report.ok, output, counts: report.counts, error: report.error }));
  if (!report.ok) process.exitCode = 1;
}
