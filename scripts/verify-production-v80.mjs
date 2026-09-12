import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { BIOFORGE_ASSET_LIST_V80 } from '../src/bioforge-assets-v80.js';
import { CONTENT_COUNTS, RELEASE } from '../src/content.js';

export const PRODUCTION_VERSION_V80 = '80.0.0';
export const PRODUCTION_CACHE_V80 = 'atf-v80-bioforge-shell-1';
export const PRODUCTION_BASE_V80 = 'https://aliens-tantalus-frontier.vercel.app';
export const PRODUCTION_REPORT_PATH_V80 = 'docs/references/v80-release-qa/production-http.json';

export const CRITICAL_RUNTIME_PATHS_V80 = Object.freeze([
  'index.html',
  'sw.js',
  'bioforge-v80.css',
  'runtime-level.css',
  'src/app.js',
  'src/audio-assets-v77.js',
  'src/content.js',
  'src/save.js',
  'src/hub-annex-services-v71.js',
  'src/tantalus-hub-expansion-v71.js',
  'src/special-operations-v67.js',
  'src/bioforge-assets-v80.js',
  'src/bioforge-level-v80.js',
  'src/bioforge-runtime-v80.js',
  'src/bioforge-session-v80.js',
  'src/bioforge-ui-v80.js'
]);

export const BIOFORGE_RUNTIME_ASSET_PATHS_V80 = Object.freeze(
  BIOFORGE_ASSET_LIST_V80.map((asset) => asset.src)
);

export const PRIVATE_V80_PREFIXES = Object.freeze([
  'docs/references/v80-bioforge-art/',
  'docs/references/v80-release-qa/'
]);

export const PRIVATE_V80_PROOF_PATHS = Object.freeze([
  '/docs/references/v80-bioforge-art/asset-manifest.json',
  '/docs/references/v80-bioforge-art/exact-generation-prompts.md',
  '/docs/references/v80-bioforge-art/generation-receipts.json',
  '/docs/references/v80-bioforge-art/audit-report.json',
  '/docs/references/v80-bioforge-art/source-receipts/exec-da7ec657-558e-43f9-b93c-f08e97a742d9.png',
  '/docs/references/v80-release-qa/production-http.json'
]);

export const sha256V80 = (bytes) => createHash('sha256').update(bytes).digest('hex');

const runGitV80 = (args, { spawn = spawnSync, encoding = null, label = args.join(' ') } = {}) => {
  const result = spawn('git', args, {
    encoding,
    maxBuffer: 32 * 1024 * 1024,
    windowsHide: true
  });
  assert.equal(result.status, 0, `${label}: ${String(result.stderr || '').trim()}`);
  return result.stdout;
};

export function resolveProductionCommitV80(commit, spawn = spawnSync) {
  assert.match(commit || '', /^[a-f0-9]{7,40}$/u, 'Pass the exact deployed content commit with --commit=...');
  const resolved = String(runGitV80(
    ['rev-parse', '--verify', `${commit}^{commit}`],
    { spawn, encoding: 'utf8', label: `commit ${commit}` }
  )).trim();
  assert.match(resolved, /^[a-f0-9]{40}$/u, `Unable to resolve a full commit SHA from ${commit}`);
  return resolved;
}

const committedBytesV80 = (commit, path, spawn) => Buffer.from(runGitV80(
  ['show', `${commit}:${path}`],
  { spawn, label: `committed source ${path}` }
));

const committedPrivatePathsV80 = (commit, spawn) => {
  const output = String(runGitV80(
    ['ls-tree', '-r', '--name-only', commit, '--', ...PRIVATE_V80_PREFIXES.map((prefix) => prefix.slice(0, -1))],
    { spawn, encoding: 'utf8', label: 'committed V80 private evidence' }
  ));
  return output.split(/\r?\n/u).map((path) => path.trim()).filter(Boolean)
    .filter((path) => PRIVATE_V80_PREFIXES.some((prefix) => path.startsWith(prefix)));
};

const requestV80 = async (base, path, fetchImpl) => {
  const response = await fetchImpl(base + path, {
    cache: 'no-store',
    redirect: 'follow',
    signal: AbortSignal.timeout(30000)
  });
  return { response, bytes: Buffer.from(await response.arrayBuffer()) };
};

export async function verifyProductionV80({
  commit,
  base = process.env.APP_URL || PRODUCTION_BASE_V80,
  fetchImpl = globalThis.fetch,
  spawn = spawnSync,
  reportPath = PRODUCTION_REPORT_PATH_V80
} = {}) {
  assert.equal(typeof fetchImpl, 'function', 'A fetch implementation is required.');
  assert.equal(RELEASE.version, PRODUCTION_VERSION_V80, 'local RELEASE must remain V80');
  assert.equal(BIOFORGE_ASSET_LIST_V80.length, 6, 'V80 production registry must expose exactly six accepted BIOFORGE assets');
  assert.equal(new Set(BIOFORGE_RUNTIME_ASSET_PATHS_V80).size, 6, 'V80 runtime asset paths must be unique');
  assert.equal(new Set(BIOFORGE_ASSET_LIST_V80.map((asset) => asset.id)).size, 6, 'V80 asset ids must be unique');
  assert.equal(new Set(BIOFORGE_ASSET_LIST_V80.map((asset) => asset.runtimeId)).size, 6, 'V80 runtime ids must be unique');

  const deployedCommit = resolveProductionCommitV80(commit, spawn);
  const target = String(base).replace(/\/+$/u, '');
  assert.match(target, /^https?:\/\//u, 'APP_URL must be an absolute HTTP(S) origin.');
  const results = [];
  const get = (path) => requestV80(target, path, fetchImpl);

  const root = await get('/');
  assert.equal(root.response.status, 200, '/');
  const rootHtml = root.bytes.toString('utf8');
  assert.match(rootHtml, /<title>ALIENS: TANTALUS FRONTIER v80<\/title>/u);
  assert.match(rootHtml, /VERSION 80\.0\.0/u);
  assert.match(rootHtml, /<section id="bioforge-ui-v80"/u);
  assert.match(rootHtml, /<canvas id="bioforge-canvas-v80"/u);
  results.push({ path: '/', status: 200, version: PRODUCTION_VERSION_V80, bioforgeLevel: 'v80' });

  const build = await get('/build-info.json');
  assert.equal(build.response.status, 200, '/build-info.json');
  assert.match(build.response.headers.get('content-type') || '', /application\/json/u);
  const buildInfo = JSON.parse(build.bytes.toString('utf8'));
  assert.equal(buildInfo.name, RELEASE.name);
  assert.equal(buildInfo.version, PRODUCTION_VERSION_V80);
  assert.equal(buildInfo.sourceVersion, RELEASE.sourceVersion);
  assert.deepEqual(buildInfo.content, CONTENT_COUNTS);
  assert.equal(buildInfo.artProvider, 'OpenAI ImageGen');
  assert.equal(Number.isNaN(Date.parse(buildInfo.builtAt)), false, 'build-info builtAt must be an ISO date');
  results.push({ path: '/build-info.json', status: 200, version: buildInfo.version, builtAt: buildInfo.builtAt });

  const worker = await get('/sw.js');
  assert.equal(worker.response.status, 200, '/sw.js');
  const workerSource = worker.bytes.toString('utf8');
  assert.match(workerSource, new RegExp(PRODUCTION_CACHE_V80, 'u'));
  for (const path of BIOFORGE_RUNTIME_ASSET_PATHS_V80) {
    assert.ok(workerSource.includes(`'${path}'`), `service worker precache must include ${path}`);
  }
  results.push({ path: '/sw.js', status: 200, cache: PRODUCTION_CACHE_V80 });

  for (const path of CRITICAL_RUNTIME_PATHS_V80) {
    const committed = committedBytesV80(deployedCommit, path, spawn);
    const remote = await get('/' + path);
    assert.equal(remote.response.status, 200, path);
    const remoteHash = sha256V80(remote.bytes);
    const commitHash = sha256V80(committed);
    assert.equal(remoteHash, commitHash, `production bytes ${path}`);
    results.push({
      path: '/' + path,
      status: 200,
      sha256: remoteHash,
      matchesCommit: deployedCommit,
      kind: 'critical-runtime'
    });
  }

  for (const asset of BIOFORGE_ASSET_LIST_V80) {
    assert.equal(asset.status, 'ready', `${asset.id}: registry status`);
    assert.match(asset.src, /^\/assets\/openai\/bioforge\/v80\/.+\.png$/u, `${asset.id}: runtime path`);
    const path = asset.src.slice(1);
    const committed = committedBytesV80(deployedCommit, path, spawn);
    assert.equal(sha256V80(committed), asset.sha256, `${asset.id}: committed bytes`);
    const remote = await get(asset.src);
    assert.equal(remote.response.status, 200, asset.src);
    assert.match(remote.response.headers.get('content-type') || '', /^image\/png(?:;|$)/u, `${asset.id}: content type`);
    assert.equal(sha256V80(remote.bytes), asset.sha256, `${asset.id}: production bytes`);
    results.push({
      path: asset.src,
      status: 200,
      sha256: asset.sha256,
      runtimeId: asset.runtimeId,
      matchesCommit: deployedCommit,
      kind: 'bioforge-asset'
    });
  }

  const privatePaths = [...new Set([
    ...PRIVATE_V80_PROOF_PATHS,
    ...committedPrivatePathsV80(deployedCommit, spawn).map((path) => '/' + path)
  ])].sort();
  assert.ok(privatePaths.some((path) => path.includes('/source-receipts/')), 'source receipts must be checked');
  assert.ok(privatePaths.some((path) => path.endsWith('/asset-manifest.json')), 'BIOFORGE asset manifest must be checked');
  assert.ok(privatePaths.some((path) => path.endsWith('/exact-generation-prompts.md')), 'exact ImageGen prompts must be checked');
  assert.ok(privatePaths.some((path) => path.endsWith('/production-http.json')), 'production evidence must be checked');

  for (const path of privatePaths) {
    const remote = await get(path);
    assert.equal(remote.response.status, 404, `private V80 evidence must not be deployed: ${path}`);
    results.push({ path, status: 404, privateEvidence: true });
  }

  const report = {
    ok: true,
    checkedAt: new Date().toISOString(),
    commit: deployedCommit,
    target: 'production',
    base: target,
    release: PRODUCTION_VERSION_V80,
    cache: PRODUCTION_CACHE_V80,
    totals: {
      criticalRuntime: CRITICAL_RUNTIME_PATHS_V80.length,
      bioforgeAssets: BIOFORGE_ASSET_LIST_V80.length,
      privateEvidence: privatePaths.length
    },
    results
  };
  await mkdir(dirname(resolve(reportPath)), { recursive: true });
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
  return report;
}

const isDirectRunV80 = process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRunV80) {
  const commit = process.argv.find((argument) => argument.startsWith('--commit='))?.slice(9);
  const report = await verifyProductionV80({ commit });
  console.log(JSON.stringify(report, null, 2));
}
