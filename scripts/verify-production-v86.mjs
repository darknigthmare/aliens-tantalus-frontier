import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { CONTENT_COUNTS, RELEASE } from '../src/content.js';
import { V81_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v81.js';
import { PLACEABLE_VISUAL_PROFILES_V86 } from '../src/placeables-visual-v86.js';
import {
  PRIVATE_V81_PROOF_PATHS, PRODUCTION_BASE_V81,
  normalizeTextLineEndingsV81, resolveProductionCommitV81, sha256V81
} from './verify-production-v81.mjs';
import {
  CRITICAL_RUNTIME_PATHS_V85, MODULAR_RUNTIME_ASSETS_V85, RUNTIME_ASSETS_V85,
  RUNTIME_ASSET_PATHS_V85, PRIVATE_V85_PROOF_PATHS
} from './verify-production-v85.mjs';
import { PRIVATE_V83_PROOF_PATHS } from './verify-production-v83.mjs';
import { PRIVATE_V82_PROOF_PATHS } from './verify-production-v82.mjs';

export const PRODUCTION_VERSION_V86 = '86.0.0';
export const PRODUCTION_CACHE_V86 = 'atf-v86-physical-placeables-shell-9';
export const PRODUCTION_REPORT_PATH_V86 = 'docs/references/v86-release-qa/production-http.json';
export const REPORT_PATHS_V86 = Object.freeze({
  production: PRODUCTION_REPORT_PATH_V86,
  'local-build': 'docs/references/v86-release-qa/local-build-http.json',
  preview: 'docs/references/v86-release-qa/preview-http.json'
});
export const PLACEABLE_RUNTIME_PATHS_V86 = Object.freeze([
  'src/placeables-state-v86.js', 'src/placeables-runtime-v86.js', 'src/placeables-visual-v86.js',
  'src/placeables-ui-v86.js', 'placeables-v86.css'
]);
export const CRITICAL_RUNTIME_PATHS_V86 = Object.freeze([...CRITICAL_RUNTIME_PATHS_V85, ...PLACEABLE_RUNTIME_PATHS_V86]);
// Gate V86 retains prior reviewed runtime assets. The generated B03 candidate is private, not runtime.
export const MODULAR_RUNTIME_ASSETS_V86 = MODULAR_RUNTIME_ASSETS_V85;
export const RUNTIME_ASSETS_V86 = Object.freeze([...RUNTIME_ASSETS_V85, ...PLACEABLE_VISUAL_PROFILES_V86.map(profile => Object.freeze({
  id: profile.catalogId, path: profile.path, sha256: profile.sha256, mime: 'image/png', kind: 'existing-placeable-bitmap'
}))]);
export const RUNTIME_ASSET_PATHS_V86 = Object.freeze([...RUNTIME_ASSET_PATHS_V85, ...PLACEABLE_VISUAL_PROFILES_V86.map(profile => profile.path)]);
export const PRIVATE_V86_PREFIXES = Object.freeze(['docs/references/V86_', 'docs/references/v86-']);
export const PRIVATE_V86_PROOF_PATHS = Object.freeze([
  '/docs/references/V86_CHATGPT_PLACEABLES_SOURCE_TRUNCATED.md',
  '/docs/references/v86-art-candidates/b03-mobile-barricade-openai.png',
  '/docs/references/v86-browser-qa/report.json',
  ...Object.values(REPORT_PATHS_V86).map(path => '/' + path)
]);

function gitBytes(args, spawn) {
  const result = spawn('git', args, { maxBuffer: 32 * 1024 * 1024, windowsHide: true });
  assert.equal(result.status, 0, `git ${args.join(' ')}: ${String(result.stderr || '').trim()}`);
  return Buffer.from(result.stdout);
}

function assertTextParity(remote, committed, path) {
  assert.equal(sha256V81(normalizeTextLineEndingsV81(remote)), sha256V81(normalizeTextLineEndingsV81(committed)),
    `production text after CRLF normalization ${path}`);
}

export function classifyVerificationTargetV86(base) {
  const url = new URL(base);
  assert.ok(['http:', 'https:'].includes(url.protocol), 'APP_URL must use HTTP(S)');
  if (url.origin === new URL(PRODUCTION_BASE_V81).origin) return 'production';
  return ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ? 'local-build' : 'preview';
}

export async function verifyProductionV86({ commit, base = process.env.APP_URL || PRODUCTION_BASE_V81,
  fetchImpl = globalThis.fetch, spawn = spawnSync, reportPath, release = RELEASE } = {}) {
  assert.equal(release.version, PRODUCTION_VERSION_V86, 'Local release must be V86');
  assert.equal(typeof fetchImpl, 'function');
  assert.equal(new Set(RUNTIME_ASSET_PATHS_V86).size, 16, 'Twelve prior reviewed assets plus four unchanged equipment sheets are required');
  for (const asset of V81_READY_ENEMY_PROFILE_ASSETS) {
    assert.equal(asset.reviewStatus, 'accepted');
    assert.equal(asset.identityVerified, true);
    assert.equal(asset.canonExact, false);
  }
  const deployedCommit = resolveProductionCommitV81(commit, spawn);
  const target = String(base).replace(/\/+$/u, '');
  assert.match(target, /^https?:\/\//u, 'APP_URL must be an absolute HTTP(S) origin');
  const targetUrl = new URL(target);
  assert.ok(!targetUrl.username && !targetUrl.password && !targetUrl.search && !targetUrl.hash && targetUrl.pathname === '/', 'APP_URL must be an origin without credentials, query or path');
  const targetKind = classifyVerificationTargetV86(target);
  const outputPath = reportPath === undefined ? REPORT_PATHS_V86[targetKind] : reportPath;
  const results = [];
  const committed = path => gitBytes(['show', `${deployedCommit}:${path}`], spawn);
  const get = async path => {
    const response = await fetchImpl(target + path, { cache: 'no-store', redirect: 'follow', signal: AbortSignal.timeout(30000) });
    return { response, bytes: Buffer.from(await response.arrayBuffer()) };
  };
  const root = await get('/');
  assert.equal(root.response.status, 200, '/');
  assert.match(root.response.headers.get('content-type') || '', /^text\/html(?:;|$)/u, 'root HTML MIME');
  const html = root.bytes.toString('utf8');
  assert.match(html, /<title>ALIENS: TANTALUS FRONTIER v86<\/title>/u);
  assert.match(html, /VERSION 86\.0\.0/u);
  assert.match(html, /<meta name="atf-release" content="86\.0\.0">/u);
  assert.match(html, /<canvas id="hub-canvas"/u);
  assert.match(html, /data-proving-ground-control-v81/u);
  assert.match(html, /<section id="bioforge-ui-v80"/u);
  assert.match(html, /href="\/placeables-v86\.css"/u);
  assert.match(html, /id="hub-onboarding-objective-v84"/u);
  assert.match(html, /id="crew-list" class="crew-roster-v85"/u);
  assertTextParity(root.bytes, committed('index.html'), '/');
  results.push({ path: '/', status: 200, version: PRODUCTION_VERSION_V86, matchesCommit: deployedCommit });

  const build = await get('/build-info.json');
  assert.equal(build.response.status, 200, '/build-info.json');
  assert.match(build.response.headers.get('content-type') || '', /application\/json/u);
  const info = JSON.parse(build.bytes.toString('utf8'));
  assert.equal(info.name, release.name);
  assert.equal(info.version, PRODUCTION_VERSION_V86);
  assert.equal(info.sourceVersion, release.sourceVersion);
  assert.deepEqual(info.content, CONTENT_COUNTS);
  assert.equal(info.artProvider, 'OpenAI ImageGen');
  assert.equal(Number.isNaN(Date.parse(info.builtAt)), false, 'build-info builtAt must be a date');
  results.push({ path: '/build-info.json', status: 200, version: info.version, builtAt: info.builtAt });

  const worker = await get('/sw.js');
  assert.equal(worker.response.status, 200, '/sw.js');
  assert.match(worker.response.headers.get('content-type') || '', /^(?:text|application)\/(?:javascript|ecmascript)(?:;|$)/u, 'service worker JavaScript MIME');
  const workerSource = worker.bytes.toString('utf8');
  assert.ok(workerSource.includes(PRODUCTION_CACHE_V86), 'V86 cache namespace missing');
  for (const path of [...RUNTIME_ASSET_PATHS_V86, ...PLACEABLE_RUNTIME_PATHS_V86.map(path => '/' + path)]) assert.ok(workerSource.includes(`'${path}'`), `service worker must precache ${path}`);
  for (const path of CRITICAL_RUNTIME_PATHS_V86) {
    const source = committed(path);
    const remote = await get('/' + path);
    assert.equal(remote.response.status, 200, path);
    if (/\.m?js$/u.test(path)) assert.match(remote.response.headers.get('content-type') || '', /^(?:text|application)\/(?:javascript|ecmascript)(?:;|$)/u, `module MIME ${path}`);
    if (path.endsWith('.html')) assert.match(remote.response.headers.get('content-type') || '', /^text\/html(?:;|$)/u, `HTML MIME ${path}`);
    if (path.endsWith('.css')) assert.match(remote.response.headers.get('content-type') || '', /^text\/css(?:;|$)/u, `stylesheet MIME ${path}`);
    assertTextParity(remote.bytes, source, path);
    const remoteHash = sha256V81(remote.bytes), commitHash = sha256V81(source);
    results.push({ path: '/' + path, status: 200, sha256: remoteHash, commitSha256: commitHash,
      normalizedSha256: sha256V81(normalizeTextLineEndingsV81(remote.bytes)),
      parity: remoteHash === commitHash ? 'exact-bytes' : 'line-ending-normalized', matchesCommit: deployedCommit, kind: 'critical-runtime' });
  }
  for (const asset of RUNTIME_ASSETS_V86) {
    assert.match(asset.sha256, /^[a-f0-9]{64}$/u, asset.id);
    assert.equal(sha256V81(committed(asset.path.slice(1))), asset.sha256, `committed asset ${asset.path}`);
    const remote = await get(asset.path);
    assert.equal(remote.response.status, 200, asset.path);
    assert.equal((remote.response.headers.get('content-type') || '').split(';')[0].trim(), asset.mime, asset.path);
    assert.equal(sha256V81(remote.bytes), asset.sha256, `production asset ${asset.path}`);
    results.push({ path: asset.path, status: 200, sha256: asset.sha256, runtimeId: asset.id,
      matchesCommit: deployedCommit, kind: asset.kind });
  }
  const trackedPrivate = gitBytes(['ls-tree', '-r', '-z', '--name-only', deployedCommit, '--', 'docs/references'], spawn)
    .toString('utf8').split('\0').filter(path => /^docs\/references\/(?:V(?:81|82|83|84|85|86)_|v(?:81|82|83|84|85|86)-)/u.test(path));
  const privatePaths = [...new Set([...PRIVATE_V81_PROOF_PATHS, ...PRIVATE_V82_PROOF_PATHS, ...PRIVATE_V83_PROOF_PATHS, ...PRIVATE_V85_PROOF_PATHS, ...PRIVATE_V86_PROOF_PATHS,
    ...trackedPrivate.map(path => '/' + path)])].sort();
  for (const path of privatePaths) {
    const remote = await get(path);
    assert.equal(remote.response.status, 404, `private evidence must not be deployed: ${path}`);
    results.push({ path, status: 404, privateEvidence: true });
  }
  const report = { ok: true, checkedAt: new Date().toISOString(), commit: deployedCommit, target: targetKind,
    base: target, release: PRODUCTION_VERSION_V86, cache: PRODUCTION_CACHE_V86,
    totals: { criticalRuntime: CRITICAL_RUNTIME_PATHS_V86.length, runtimeAssets: RUNTIME_ASSETS_V86.length,
      modularProvingAssets: MODULAR_RUNTIME_ASSETS_V86.length, privateEvidence: privatePaths.length }, results };
  if (outputPath !== null) {
    await mkdir(dirname(resolve(outputPath)), { recursive: true });
    await writeFile(outputPath, JSON.stringify(report, null, 2) + '\n');
  }
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const commit = process.argv.find(argument => argument.startsWith('--commit='))?.slice(9);
  const reportArgument = process.argv.find(argument => argument.startsWith('--report='));
  const reportPath = reportArgument?.slice(9);
  if (reportArgument) assert.ok(reportPath, '--report requires an output path');
  console.log(JSON.stringify(await verifyProductionV86({ commit, reportPath }), null, 2));
}
