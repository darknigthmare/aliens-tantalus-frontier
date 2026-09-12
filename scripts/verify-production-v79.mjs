import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { CONTENT_COUNTS, RELEASE } from '../src/content.js';
import { TITLE_SCENE_READY_ASSETS_V79 } from '../src/title-scene-assets-v79.js';

export const PRODUCTION_VERSION_V79 = '79.0.0';
export const PRODUCTION_CACHE_V79 = 'atf-v79-modular-title-shell-1';
export const PRODUCTION_BASE_V79 = 'https://aliens-tantalus-frontier.vercel.app';
export const PRODUCTION_REPORT_PATH_V79 = 'docs/references/v79-release-qa/production-http.json';

export const CRITICAL_RUNTIME_PATHS_V79 = Object.freeze([
  'index.html',
  'sw.js',
  'title-screen-v61.css',
  'title-scene-v79.css',
  'runtime-level.css',
  'src/app.js',
  'src/content.js',
  'src/save.js',
  'src/save-profile-v78.js',
  'src/title-screen-v61.js',
  'src/title-scene-v79.js',
  'src/title-scene-catalog-v79.js',
  'src/title-scene-assets-v79.js'
]);

export const TITLE_SCENE_RUNTIME_ASSET_PATHS_V79 = Object.freeze(
  TITLE_SCENE_READY_ASSETS_V79.map((asset) => asset.src)
);

export const PRIVATE_V79_PREFIXES = Object.freeze([
  'docs/references/v79-title-scene-production/',
  'docs/references/v79-browser-qa/',
  'docs/references/v79-release-qa/'
]);

export const PRIVATE_V79_PROOF_PATHS = Object.freeze([
  '/docs/references/v79-title-scene-production/asset-manifest.json',
  '/docs/references/v79-title-scene-production/exact-generation-prompts.md',
  '/docs/references/v79-title-scene-production/openai-prompt-recipes.json',
  '/docs/references/v79-title-scene-production/source-receipts/exec-f525edd1-ab19-4fa7-9aeb-c9866863c59f.png',
  '/docs/references/v79-title-scene-production/rejected/orbitals-03-comms-relay-normalized.png',
  '/docs/references/v79-browser-qa/final-local/title-browser-report.json',
  '/docs/references/v79-browser-qa/final-local/title-preset-acheron.jpg',
  '/docs/references/v79-release-qa/production-http.json'
]);

export const sha256V79 = (bytes) => createHash('sha256').update(bytes).digest('hex');

const runGitV79 = (args, { spawn = spawnSync, encoding = null, label = args.join(' ') } = {}) => {
  const result = spawn('git', args, {
    encoding,
    maxBuffer: 32 * 1024 * 1024,
    windowsHide: true
  });
  assert.equal(result.status, 0, `${label}: ${String(result.stderr || '').trim()}`);
  return result.stdout;
};

export function resolveProductionCommitV79(commit, spawn = spawnSync) {
  assert.match(commit || '', /^[a-f0-9]{7,40}$/u, 'Pass the exact deployed content commit with --commit=...');
  const resolved = String(runGitV79(
    ['rev-parse', '--verify', `${commit}^{commit}`],
    { spawn, encoding: 'utf8', label: `commit ${commit}` }
  )).trim();
  assert.match(resolved, /^[a-f0-9]{40}$/u, `Unable to resolve a full commit SHA from ${commit}`);
  return resolved;
}

const committedBytesV79 = (commit, path, spawn) => Buffer.from(runGitV79(
  ['show', `${commit}:${path}`],
  { spawn, label: `committed source ${path}` }
));

const committedPrivatePathsV79 = (commit, spawn) => {
  const output = String(runGitV79(
    ['ls-tree', '-r', '--name-only', commit, '--', ...PRIVATE_V79_PREFIXES.map((prefix) => prefix.slice(0, -1))],
    { spawn, encoding: 'utf8', label: 'committed V79 private evidence' }
  ));
  return output.split(/\r?\n/u).map((path) => path.trim()).filter(Boolean)
    .filter((path) => PRIVATE_V79_PREFIXES.some((prefix) => path.startsWith(prefix)));
};

const requestV79 = async (base, path, fetchImpl) => {
  const response = await fetchImpl(base + path, {
    cache: 'no-store',
    redirect: 'follow',
    signal: AbortSignal.timeout(30000)
  });
  return { response, bytes: Buffer.from(await response.arrayBuffer()) };
};

export async function verifyProductionV79({
  commit,
  base = process.env.APP_URL || PRODUCTION_BASE_V79,
  fetchImpl = globalThis.fetch,
  spawn = spawnSync,
  reportPath = PRODUCTION_REPORT_PATH_V79
} = {}) {
  assert.equal(typeof fetchImpl, 'function', 'A fetch implementation is required.');
  assert.equal(RELEASE.version, PRODUCTION_VERSION_V79, 'local RELEASE must remain V79');
  assert.equal(TITLE_SCENE_READY_ASSETS_V79.length, 18, 'V79 production registry must expose exactly 18 accepted assets');
  assert.equal(new Set(TITLE_SCENE_RUNTIME_ASSET_PATHS_V79).size, 18, 'V79 runtime asset paths must be unique');

  const deployedCommit = resolveProductionCommitV79(commit, spawn);
  const target = String(base).replace(/\/+$/u, '');
  assert.match(target, /^https?:\/\//u, 'APP_URL must be an absolute HTTP(S) origin.');
  const results = [];
  const get = (path) => requestV79(target, path, fetchImpl);

  const root = await get('/');
  assert.equal(root.response.status, 200, '/');
  const rootHtml = root.bytes.toString('utf8');
  assert.match(rootHtml, /<title>ALIENS: TANTALUS FRONTIER v79<\/title>/u);
  assert.match(rootHtml, /VERSION 79\.0\.0/u);
  assert.match(rootHtml, /<div id="title-scene-v79"/u);
  results.push({ path: '/', status: 200, version: PRODUCTION_VERSION_V79, titleScene: 'v79' });

  const build = await get('/build-info.json');
  assert.equal(build.response.status, 200, '/build-info.json');
  assert.match(build.response.headers.get('content-type') || '', /application\/json/u);
  const buildInfo = JSON.parse(build.bytes.toString('utf8'));
  assert.equal(buildInfo.name, RELEASE.name);
  assert.equal(buildInfo.version, PRODUCTION_VERSION_V79);
  assert.equal(buildInfo.sourceVersion, RELEASE.sourceVersion);
  assert.deepEqual(buildInfo.content, CONTENT_COUNTS);
  assert.equal(buildInfo.artProvider, 'OpenAI ImageGen');
  assert.equal(Number.isNaN(Date.parse(buildInfo.builtAt)), false, 'build-info builtAt must be an ISO date');
  results.push({ path: '/build-info.json', status: 200, version: buildInfo.version, builtAt: buildInfo.builtAt });

  const worker = await get('/sw.js');
  assert.equal(worker.response.status, 200, '/sw.js');
  assert.match(worker.bytes.toString('utf8'), new RegExp(PRODUCTION_CACHE_V79, 'u'));
  results.push({ path: '/sw.js', status: 200, cache: PRODUCTION_CACHE_V79 });

  for (const path of CRITICAL_RUNTIME_PATHS_V79) {
    const committed = committedBytesV79(deployedCommit, path, spawn);
    const remote = await get('/' + path);
    assert.equal(remote.response.status, 200, path);
    const remoteHash = sha256V79(remote.bytes);
    const commitHash = sha256V79(committed);
    assert.equal(remoteHash, commitHash, `production bytes ${path}`);
    results.push({
      path: '/' + path,
      status: 200,
      sha256: remoteHash,
      matchesCommit: deployedCommit,
      kind: 'critical-runtime'
    });
  }

  for (const asset of TITLE_SCENE_READY_ASSETS_V79) {
    assert.equal(asset.status, 'ready', `${asset.id}: registry status`);
    const path = asset.src.slice(1);
    const committed = committedBytesV79(deployedCommit, path, spawn);
    assert.equal(sha256V79(committed), asset.sha256, `${asset.id}: committed bytes`);
    const remote = await get(asset.src);
    assert.equal(remote.response.status, 200, asset.src);
    assert.match(remote.response.headers.get('content-type') || '', /^image\/png(?:;|$)/u, `${asset.id}: content type`);
    assert.equal(sha256V79(remote.bytes), asset.sha256, `${asset.id}: production bytes`);
    results.push({
      path: asset.src,
      status: 200,
      sha256: asset.sha256,
      runtimeId: asset.runtimeId,
      matchesCommit: deployedCommit,
      kind: 'title-asset'
    });
  }

  const privatePaths = [...new Set([
    ...PRIVATE_V79_PROOF_PATHS,
    ...committedPrivatePathsV79(deployedCommit, spawn).map((path) => '/' + path)
  ])].sort();
  assert.ok(privatePaths.some((path) => path.includes('/source-receipts/')), 'source receipts must be checked');
  assert.ok(privatePaths.some((path) => path.includes('/rejected/')), 'rejected assets must be checked');
  assert.ok(privatePaths.some((path) => path.endsWith('/asset-manifest.json')), 'production manifest must be checked');
  assert.ok(privatePaths.some((path) => path.endsWith('/title-browser-report.json')), 'browser evidence must be checked');

  for (const path of privatePaths) {
    const remote = await get(path);
    assert.equal(remote.response.status, 404, `private V79 evidence must not be deployed: ${path}`);
    results.push({ path, status: 404, privateEvidence: true });
  }

  const report = {
    ok: true,
    checkedAt: new Date().toISOString(),
    commit: deployedCommit,
    target: 'production',
    base: target,
    release: PRODUCTION_VERSION_V79,
    cache: PRODUCTION_CACHE_V79,
    totals: {
      criticalRuntime: CRITICAL_RUNTIME_PATHS_V79.length,
      titleAssets: TITLE_SCENE_READY_ASSETS_V79.length,
      privateEvidence: privatePaths.length
    },
    results
  };
  await mkdir(dirname(resolve(reportPath)), { recursive: true });
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
  return report;
}

const isDirectRunV79 = process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRunV79) {
  const commit = process.argv.find((argument) => argument.startsWith('--commit='))?.slice(9);
  const report = await verifyProductionV79({ commit });
  console.log(JSON.stringify(report, null, 2));
}
