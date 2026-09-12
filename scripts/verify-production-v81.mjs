import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { V81_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v81.js';
import { CONTENT_COUNTS, RELEASE } from '../src/content.js';
import { PLAYER_VISUAL_ASSETS_V81 } from '../src/player-visual-contract-v81.js';
import { PROVING_GROUND_ASSET_LIST_V81 } from '../src/proving-ground-assets-v81.js';

export const PRODUCTION_VERSION_V81 = '81.0.0';
export const PRODUCTION_CACHE_V81 = 'atf-v81-proving-ground-shell-1';
export const PRODUCTION_BASE_V81 = 'https://aliens-tantalus-frontier.vercel.app';
export const PRODUCTION_REPORT_PATH_V81 = 'docs/references/v81-release-qa/production-http.json';

// Every entry must match the deployed commit, apart from an LF/CRLF conversion.
export const CRITICAL_RUNTIME_PATHS_V81 = Object.freeze([
  'index.html',
  'sw.js',
  'styles.css',
  'hub-level.css',
  'bioforge-v80.css',
  'runtime-level.css',
  'src/app.js',
  'src/content.js',
  'src/save.js',
  'src/save-profile-v78.js',
  'src/sprite-animation-runtime.js',
  'src/player-visual-contract-v81.js',
  'src/game-runtime.js',
  'src/game-v51-runtime.js',
  'src/game-v52-runtime.js',
  'src/hub-game.js',
  'src/hub-v51-runtime.js',
  'src/hub-v52-runtime.js',
  'src/hub-v71-runtime.js',
  'src/hub-v81-runtime.js',
  'src/hub-annex-services-v71.js',
  'src/tantalus-hub-expansion-v71.js',
  'src/proving-ground-assets-v81.js',
  'src/proving-ground-session-v81.js',
  'src/tantalus-proving-ground-v81.js',
  'src/bioforge-assets-v80.js',
  'src/bioforge-session-v80.js',
  'src/bioforge-level-v80.js',
  'src/bioforge-runtime-v80.js',
  'src/bioforge-ui-v80.js',
  'src/enemy-profile-assets-v81.js',
  'src/enemy-profile-registry-v66.js',
  'src/enemy-profile-geometry-v66.js',
  'src/enemy-batch-combat-v66.js'
]);

export const PROVING_GROUND_RUNTIME_ASSET_PATHS_V81 = Object.freeze(
  PROVING_GROUND_ASSET_LIST_V81.map((asset) => asset.src)
);

export const ENEMY_RUNTIME_ASSET_PATHS_V81 = Object.freeze(
  V81_READY_ENEMY_PROFILE_ASSETS.map((asset) => asset.path)
);

export const RUNTIME_ASSET_PATHS_V81 = Object.freeze([
  ...PLAYER_VISUAL_ASSETS_V81.map((asset) => asset.path),
  ...PROVING_GROUND_RUNTIME_ASSET_PATHS_V81,
  ...ENEMY_RUNTIME_ASSET_PATHS_V81
]);

export const PRIVATE_V81_PREFIXES = Object.freeze([
  'docs/references/V81_',
  'docs/references/v81-'
]);

export const PRIVATE_V81_PROOF_PATHS = Object.freeze([
  '/docs/references/V81_ENEMY_009_ANCHOR_REVIEW.json',
  '/docs/references/V81_ENEMY_010_ANCHOR_REVIEW.json',
  '/docs/references/V81_ENEMY_010_SCALE_REVIEW.json',
  '/docs/references/v81-enemy-wave-review/enemy-010-spitter/anchor-attack.jpg',
  '/docs/references/v81-proving-ground-art/asset-manifest.json',
  '/docs/references/v81-proving-ground-art/art-audit.json',
  '/docs/references/v81-proving-ground-art/exact-generation-prompts.md',
  '/docs/references/v81-proving-ground-art/generation-receipts.json',
  '/docs/references/v81-proving-ground-art/source-receipts/exec-dd0ed932-9f0f-4a49-be62-b6540c9e483b.png',
  '/docs/references/v81-proving-ground-art/source-receipts/exec-659f1605-c7fb-4226-868f-13343802a819.png',
  '/docs/references/v81-proving-ground-art/source-receipts/exec-02a8be9a-c609-4dde-932f-c1ed58a4d1b0.png',
  '/docs/references/v81-release-qa/production-http.json'
]);

export const sha256V81 = (bytes) => createHash('sha256').update(bytes).digest('hex');

export const normalizeTextLineEndingsV81 = (bytes) => Buffer.from(
  Buffer.from(bytes).toString('utf8').replace(/\r\n/gu, '\n')
);

const runGitV81 = (args, { spawn = spawnSync, encoding = null, label = args.join(' ') } = {}) => {
  const result = spawn('git', args, {
    encoding,
    maxBuffer: 32 * 1024 * 1024,
    windowsHide: true
  });
  assert.equal(result.status, 0, `${label}: ${String(result.stderr || '').trim()}`);
  return result.stdout;
};

export function resolveProductionCommitV81(commit, spawn = spawnSync) {
  assert.match(commit || '', /^[a-f0-9]{7,40}$/u, 'Pass the exact deployed content commit with --commit=...');
  const resolved = String(runGitV81(
    ['rev-parse', '--verify', `${commit}^{commit}`],
    { spawn, encoding: 'utf8', label: `commit ${commit}` }
  )).trim();
  assert.match(resolved, /^[a-f0-9]{40}$/u, `Unable to resolve a full commit SHA from ${commit}`);
  return resolved;
}

const committedBytesV81 = (commit, path, spawn) => Buffer.from(runGitV81(
  ['show', `${commit}:${path}`],
  { spawn, label: `committed source ${path}` }
));

const committedPrivatePathsV81 = (commit, spawn) => {
  const output = String(runGitV81(
    ['ls-tree', '-r', '--name-only', commit, '--', 'docs/references'],
    { spawn, encoding: 'utf8', label: 'committed V81 private evidence' }
  ));
  return output.split(/\r?\n/u).map((path) => path.trim()).filter(Boolean)
    .filter((path) => PRIVATE_V81_PREFIXES.some((prefix) => path.startsWith(prefix)));
};

const requestV81 = async (base, path, fetchImpl) => {
  const response = await fetchImpl(base + path, {
    cache: 'no-store',
    redirect: 'follow',
    signal: AbortSignal.timeout(30000)
  });
  return { response, bytes: Buffer.from(await response.arrayBuffer()) };
};

const validateLocalRegistriesV81 = () => {
  assert.equal(RELEASE.version, PRODUCTION_VERSION_V81, 'local RELEASE must remain V81');
  assert.equal(PROVING_GROUND_ASSET_LIST_V81.length, 3, 'V81 registry must expose exactly three Proving Ground PNGs');
  assert.equal(V81_READY_ENEMY_PROFILE_ASSETS.length, 2, 'V81 registry must expose exactly two accepted enemy WebPs');
  assert.equal(PLAYER_VISUAL_ASSETS_V81.length, 5, 'V81 player contract must expose exactly five Echo-9 PNGs');
  assert.equal(new Set(RUNTIME_ASSET_PATHS_V81).size, 10, 'the ten V81 runtime asset paths must be unique');
  assert.equal(new Set(PROVING_GROUND_ASSET_LIST_V81.map((asset) => asset.id)).size, 3, 'Proving Ground ids must be unique');
  assert.equal(new Set(V81_READY_ENEMY_PROFILE_ASSETS.map((asset) => asset.profileId)).size, 2, 'enemy profile ids must be unique');
};

export async function verifyProductionV81({
  commit,
  base = process.env.APP_URL || PRODUCTION_BASE_V81,
  fetchImpl = globalThis.fetch,
  spawn = spawnSync,
  reportPath = PRODUCTION_REPORT_PATH_V81
} = {}) {
  assert.equal(typeof fetchImpl, 'function', 'A fetch implementation is required.');
  validateLocalRegistriesV81();

  const deployedCommit = resolveProductionCommitV81(commit, spawn);
  const target = String(base).replace(/\/+$/u, '');
  assert.match(target, /^https?:\/\//u, 'APP_URL must be an absolute HTTP(S) origin.');
  const results = [];
  const get = (path) => requestV81(target, path, fetchImpl);

  const root = await get('/');
  assert.equal(root.response.status, 200, '/');
  const rootHtml = root.bytes.toString('utf8');
  assert.match(rootHtml, /<title>ALIENS: TANTALUS FRONTIER v81<\/title>/u);
  assert.match(rootHtml, /VERSION 81\.0\.0/u);
  assert.match(rootHtml, /<meta name="atf-release" content="81\.0\.0">/u);
  assert.match(rootHtml, /<canvas id="hub-canvas"/u);
  assert.match(rootHtml, /data-proving-ground-control-v81/u);
  assert.match(rootHtml, /<section id="bioforge-ui-v80"/u);
  results.push({ path: '/', status: 200, version: PRODUCTION_VERSION_V81, provingGround: 'physical-v81' });

  const build = await get('/build-info.json');
  assert.equal(build.response.status, 200, '/build-info.json');
  assert.match(build.response.headers.get('content-type') || '', /application\/json/u);
  const buildInfo = JSON.parse(build.bytes.toString('utf8'));
  assert.equal(buildInfo.name, RELEASE.name);
  assert.equal(buildInfo.version, PRODUCTION_VERSION_V81);
  assert.equal(buildInfo.sourceVersion, RELEASE.sourceVersion);
  assert.deepEqual(buildInfo.content, CONTENT_COUNTS);
  assert.equal(buildInfo.artProvider, 'OpenAI ImageGen');
  assert.equal(Number.isNaN(Date.parse(buildInfo.builtAt)), false, 'build-info builtAt must be an ISO date');
  results.push({ path: '/build-info.json', status: 200, version: buildInfo.version, builtAt: buildInfo.builtAt });

  const worker = await get('/sw.js');
  assert.equal(worker.response.status, 200, '/sw.js');
  const workerSource = worker.bytes.toString('utf8');
  assert.match(workerSource, new RegExp(PRODUCTION_CACHE_V81, 'u'));
  for (const path of RUNTIME_ASSET_PATHS_V81) {
    assert.ok(workerSource.includes(`'${path}'`), `service worker precache must include ${path}`);
  }
  results.push({ path: '/sw.js', status: 200, cache: PRODUCTION_CACHE_V81 });

  for (const path of CRITICAL_RUNTIME_PATHS_V81) {
    const committed = committedBytesV81(deployedCommit, path, spawn);
    const remote = await get('/' + path);
    assert.equal(remote.response.status, 200, path);
    const remoteHash = sha256V81(remote.bytes);
    const commitHash = sha256V81(committed);
    const remoteNormalizedHash = sha256V81(normalizeTextLineEndingsV81(remote.bytes));
    const commitNormalizedHash = sha256V81(normalizeTextLineEndingsV81(committed));
    assert.equal(remoteNormalizedHash, commitNormalizedHash, `production text after CRLF normalization ${path}`);
    results.push({
      path: '/' + path,
      status: 200,
      sha256: remoteHash,
      commitSha256: commitHash,
      normalizedSha256: remoteNormalizedHash,
      parity: remoteHash === commitHash ? 'exact-bytes' : 'line-ending-normalized',
      matchesCommit: deployedCommit,
      kind: 'critical-runtime'
    });
  }

  for (const asset of PLAYER_VISUAL_ASSETS_V81) {
    assert.match(asset.path, /^\/assets\/openai\/sprites\/normalized\/player\/echo9-marine-.+-sheet\.png$/u, `${asset.sheetId}: runtime path`);
    assert.match(asset.sha256, /^[a-f0-9]{64}$/u, `${asset.sheetId}: registry SHA-256`);
    const committed = committedBytesV81(deployedCommit, asset.path.slice(1), spawn);
    assert.equal(sha256V81(committed), asset.sha256, `${asset.sheetId}: committed bytes`);
    const remote = await get(asset.path);
    assert.equal(remote.response.status, 200, asset.path);
    assert.match(remote.response.headers.get('content-type') || '', /^image\/png(?:;|$)/u, `${asset.sheetId}: content type`);
    assert.equal(sha256V81(remote.bytes), asset.sha256, `${asset.sheetId}: production bytes`);
    results.push({
      path: asset.path,
      status: 200,
      sha256: asset.sha256,
      sheetId: asset.sheetId,
      matchesCommit: deployedCommit,
      kind: 'player-visual-asset'
    });
  }

  for (const asset of PROVING_GROUND_ASSET_LIST_V81) {
    assert.equal(asset.status, 'ready', `${asset.id}: registry status`);
    assert.match(asset.src, /^\/assets\/openai\/hub\/proving-ground\/v81\/.+\.png$/u, `${asset.id}: runtime path`);
    assert.match(asset.sha256, /^[a-f0-9]{64}$/u, `${asset.id}: registry SHA-256`);
    const committed = committedBytesV81(deployedCommit, asset.src.slice(1), spawn);
    assert.equal(sha256V81(committed), asset.sha256, `${asset.id}: committed bytes`);
    const remote = await get(asset.src);
    assert.equal(remote.response.status, 200, asset.src);
    assert.match(remote.response.headers.get('content-type') || '', /^image\/png(?:;|$)/u, `${asset.id}: content type`);
    assert.equal(sha256V81(remote.bytes), asset.sha256, `${asset.id}: production bytes`);
    results.push({
      path: asset.src,
      status: 200,
      sha256: asset.sha256,
      runtimeId: asset.runtimeId,
      matchesCommit: deployedCommit,
      kind: 'proving-ground-asset'
    });
  }

  for (const asset of V81_READY_ENEMY_PROFILE_ASSETS) {
    assert.equal(asset.reviewStatus, 'accepted', `${asset.profileId}: review status`);
    assert.equal(asset.identityVerified, true, `${asset.profileId}: identity status`);
    assert.equal(asset.canonExact, false, `${asset.profileId}: honest adaptation status`);
    assert.equal(asset.path, `/assets/openai/sprites/normalized/enemy-profiles-v81/${asset.profileId}.webp`, `${asset.profileId}: runtime path`);
    assert.match(asset.normalizedSha256, /^[a-f0-9]{64}$/u, `${asset.profileId}: registry SHA-256`);
    const committed = committedBytesV81(deployedCommit, asset.path.slice(1), spawn);
    assert.equal(sha256V81(committed), asset.normalizedSha256, `${asset.profileId}: committed bytes`);
    const remote = await get(asset.path);
    assert.equal(remote.response.status, 200, asset.path);
    assert.match(remote.response.headers.get('content-type') || '', /^image\/webp(?:;|$)/u, `${asset.profileId}: content type`);
    assert.equal(sha256V81(remote.bytes), asset.normalizedSha256, `${asset.profileId}: production bytes`);
    results.push({
      path: asset.path,
      status: 200,
      sha256: asset.normalizedSha256,
      profileId: asset.profileId,
      matchesCommit: deployedCommit,
      kind: 'enemy-profile-asset'
    });
  }

  const privatePaths = [...new Set([
    ...PRIVATE_V81_PROOF_PATHS,
    ...committedPrivatePathsV81(deployedCommit, spawn).map((path) => '/' + path)
  ])].sort();
  assert.ok(privatePaths.some((path) => path.includes('/source-receipts/')), 'source receipts must be checked');
  assert.ok(privatePaths.some((path) => path.endsWith('/asset-manifest.json')), 'Proving Ground asset manifest must be checked');
  assert.ok(privatePaths.some((path) => path.endsWith('/exact-generation-prompts.md')), 'exact ImageGen prompts must be checked');
  assert.ok(privatePaths.some((path) => path.includes('ENEMY_009_ANCHOR_REVIEW')), 'enemy anchor evidence must be checked');
  assert.ok(privatePaths.some((path) => path.endsWith('/production-http.json')), 'production evidence must be checked');

  for (const path of privatePaths) {
    const remote = await get(path);
    assert.equal(remote.response.status, 404, `private V81 evidence must not be deployed: ${path}`);
    results.push({ path, status: 404, privateEvidence: true });
  }

  const report = {
    ok: true,
    checkedAt: new Date().toISOString(),
    commit: deployedCommit,
    target: 'production',
    base: target,
    release: PRODUCTION_VERSION_V81,
    cache: PRODUCTION_CACHE_V81,
    totals: {
      criticalRuntime: CRITICAL_RUNTIME_PATHS_V81.length,
      playerVisualAssets: PLAYER_VISUAL_ASSETS_V81.length,
      provingGroundAssets: PROVING_GROUND_ASSET_LIST_V81.length,
      enemyProfileAssets: V81_READY_ENEMY_PROFILE_ASSETS.length,
      runtimeAssets: RUNTIME_ASSET_PATHS_V81.length,
      privateEvidence: privatePaths.length
    },
    results
  };
  await mkdir(dirname(resolve(reportPath)), { recursive: true });
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
  return report;
}

const isDirectRunV81 = process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRunV81) {
  const commit = process.argv.find((argument) => argument.startsWith('--commit='))?.slice(9);
  const report = await verifyProductionV81({ commit });
  console.log(JSON.stringify(report, null, 2));
}
