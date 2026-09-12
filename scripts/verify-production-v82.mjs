import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { CONTENT_COUNTS, RELEASE } from '../src/content.js';
import { PLAYER_VISUAL_ASSETS_V81 } from '../src/player-visual-contract-v81.js';
import { PROVING_GROUND_ASSET_LIST_V81 } from '../src/proving-ground-assets-v81.js';
import { V81_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v81.js';
import {
  CRITICAL_RUNTIME_PATHS_V81, PRIVATE_V81_PROOF_PATHS, PRODUCTION_BASE_V81,
  normalizeTextLineEndingsV81, resolveProductionCommitV81, sha256V81
} from './verify-production-v81.mjs';

export const PRODUCTION_VERSION_V82 = '82.0.0';
export const PRODUCTION_CACHE_V82 = 'atf-v82-modular-proving-shell-1';
export const PRODUCTION_REPORT_PATH_V82 = 'docs/references/v82-release-qa/production-http.json';
export const REPORT_PATHS_V82 = Object.freeze({
  production: PRODUCTION_REPORT_PATH_V82,
  'local-build': 'docs/references/v82-release-qa/local-build-http.json',
  preview: 'docs/references/v82-release-qa/preview-http.json'
});
export const CRITICAL_RUNTIME_PATHS_V82 = Object.freeze([...CRITICAL_RUNTIME_PATHS_V81, 'src/title-scene-v79.js']);
export const MODULAR_RUNTIME_ASSETS_V82 = Object.freeze([
  Object.freeze({ id: 'provingWall', path: '/assets/openai/hub/proving-ground/v82/proving-ground-wall-v82.webp',
    sha256: '62c942325af5bb94f2ceae4018539a8ce2191c616fc5a688a42b87f3ae076160', mime: 'image/webp', kind: 'modular-proving-asset' }),
  Object.freeze({ id: 'provingCeiling', path: '/assets/openai/hub/proving-ground/v82/proving-ground-ceiling-beam-v82.png',
    sha256: '86cb4a1d9ea2e47edf43a8dcbe0744fe2977cf55dfe7fd22f686fe5634d000f4', mime: 'image/png', kind: 'modular-proving-asset' })
]);
export const RUNTIME_ASSETS_V82 = Object.freeze([
  ...PLAYER_VISUAL_ASSETS_V81.map(asset => ({ id: asset.sheetId, path: asset.path, sha256: asset.sha256, mime: 'image/png', kind: 'player-visual-asset' })),
  ...PROVING_GROUND_ASSET_LIST_V81.map(asset => ({ id: asset.id, path: asset.src, sha256: asset.sha256, mime: 'image/png', kind: 'proving-ground-asset' })),
  ...V81_READY_ENEMY_PROFILE_ASSETS.map(asset => ({ id: asset.profileId, path: asset.path, sha256: asset.normalizedSha256, mime: 'image/webp', kind: 'enemy-profile-asset' })),
  ...MODULAR_RUNTIME_ASSETS_V82
].map(Object.freeze));
export const RUNTIME_ASSET_PATHS_V82 = Object.freeze(RUNTIME_ASSETS_V82.map(asset => asset.path));
export const PRIVATE_V82_PREFIXES = Object.freeze(['docs/references/V82_', 'docs/references/v82-']);
export const PRIVATE_V82_PROOF_PATHS = Object.freeze([
  '/docs/references/V82_ENEMY_PROGRESS.json',
  '/docs/references/v82-proving-ground-art/art-audit.json',
  '/docs/references/v82-proving-ground-art/source-receipts/exec-5a4477ce-afa1-41fe-ab1b-1e05f088712c.png',
  '/docs/references/v82-proving-ground-art/source-receipts/exec-af3b58c0-eedc-4d23-b894-421aff748bc6.png',
  '/docs/references/v82-lurker-attack/source-receipts/lurker-attack-r1-original.png',
  '/docs/references/v82-lurker-attack/source-receipts/lurker-attack-r2-original.png',
  '/docs/references/v82-release-qa/production-http.json'
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

export function classifyVerificationTargetV82(base) {
  const url = new URL(base);
  assert.ok(['http:', 'https:'].includes(url.protocol), 'APP_URL must use HTTP(S)');
  if (url.origin === new URL(PRODUCTION_BASE_V81).origin) return 'production';
  return ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ? 'local-build' : 'preview';
}

export async function verifyProductionV82({ commit, base = process.env.APP_URL || PRODUCTION_BASE_V81,
  fetchImpl = globalThis.fetch, spawn = spawnSync, reportPath } = {}) {
  assert.equal(RELEASE.version, PRODUCTION_VERSION_V82, 'Local release must be V82');
  assert.equal(typeof fetchImpl, 'function');
  assert.equal(new Set(RUNTIME_ASSET_PATHS_V82).size, 12, 'Exactly twelve unique runtime assets are required');
  for (const asset of V81_READY_ENEMY_PROFILE_ASSETS) {
    assert.equal(asset.reviewStatus, 'accepted');
    assert.equal(asset.identityVerified, true);
    assert.equal(asset.canonExact, false);
  }
  const deployedCommit = resolveProductionCommitV81(commit, spawn);
  const target = String(base).replace(/\/+$/u, '');
  assert.match(target, /^https?:\/\//u, 'APP_URL must be an absolute HTTP(S) origin');
  const targetKind = classifyVerificationTargetV82(target);
  const outputPath = reportPath === undefined ? REPORT_PATHS_V82[targetKind] : reportPath;
  const results = [];
  const committed = path => gitBytes(['show', `${deployedCommit}:${path}`], spawn);
  const get = async path => {
    const response = await fetchImpl(target + path, { cache: 'no-store', redirect: 'follow', signal: AbortSignal.timeout(30000) });
    return { response, bytes: Buffer.from(await response.arrayBuffer()) };
  };
  const root = await get('/');
  assert.equal(root.response.status, 200, '/');
  const html = root.bytes.toString('utf8');
  assert.match(html, /<title>ALIENS: TANTALUS FRONTIER v82<\/title>/u);
  assert.match(html, /VERSION 82\.0\.0/u);
  assert.match(html, /<meta name="atf-release" content="82\.0\.0">/u);
  assert.match(html, /<canvas id="hub-canvas"/u);
  assert.match(html, /data-proving-ground-control-v81/u);
  assert.match(html, /<section id="bioforge-ui-v80"/u);
  assertTextParity(root.bytes, committed('index.html'), '/');
  results.push({ path: '/', status: 200, version: PRODUCTION_VERSION_V82, matchesCommit: deployedCommit });

  const build = await get('/build-info.json');
  assert.equal(build.response.status, 200, '/build-info.json');
  assert.match(build.response.headers.get('content-type') || '', /application\/json/u);
  const info = JSON.parse(build.bytes.toString('utf8'));
  assert.equal(info.name, RELEASE.name);
  assert.equal(info.version, PRODUCTION_VERSION_V82);
  assert.equal(info.sourceVersion, RELEASE.sourceVersion);
  assert.deepEqual(info.content, CONTENT_COUNTS);
  assert.equal(info.artProvider, 'OpenAI ImageGen');
  assert.equal(Number.isNaN(Date.parse(info.builtAt)), false, 'build-info builtAt must be a date');
  results.push({ path: '/build-info.json', status: 200, version: info.version, builtAt: info.builtAt });

  const worker = await get('/sw.js');
  assert.equal(worker.response.status, 200, '/sw.js');
  const workerSource = worker.bytes.toString('utf8');
  assert.ok(workerSource.includes(PRODUCTION_CACHE_V82), 'V82 cache namespace missing');
  for (const path of RUNTIME_ASSET_PATHS_V82) assert.ok(workerSource.includes(`'${path}'`), `service worker must precache ${path}`);
  for (const path of CRITICAL_RUNTIME_PATHS_V82) {
    const source = committed(path);
    const remote = await get('/' + path);
    assert.equal(remote.response.status, 200, path);
    assertTextParity(remote.bytes, source, path);
    const remoteHash = sha256V81(remote.bytes), commitHash = sha256V81(source);
    results.push({ path: '/' + path, status: 200, sha256: remoteHash, commitSha256: commitHash,
      normalizedSha256: sha256V81(normalizeTextLineEndingsV81(remote.bytes)),
      parity: remoteHash === commitHash ? 'exact-bytes' : 'line-ending-normalized', matchesCommit: deployedCommit, kind: 'critical-runtime' });
  }
  for (const asset of RUNTIME_ASSETS_V82) {
    assert.match(asset.sha256, /^[a-f0-9]{64}$/u, asset.id);
    assert.equal(sha256V81(committed(asset.path.slice(1))), asset.sha256, `committed asset ${asset.path}`);
    const remote = await get(asset.path);
    assert.equal(remote.response.status, 200, asset.path);
    assert.equal((remote.response.headers.get('content-type') || '').split(';')[0].trim(), asset.mime, asset.path);
    assert.equal(sha256V81(remote.bytes), asset.sha256, `production asset ${asset.path}`);
    results.push({ path: asset.path, status: 200, sha256: asset.sha256, runtimeId: asset.id,
      matchesCommit: deployedCommit, kind: asset.kind });
  }
  const trackedPrivate = gitBytes(['ls-tree', '-r', '--name-only', deployedCommit, '--', 'docs/references'], spawn)
    .toString('utf8').split(/\r?\n/u).filter(path => /^docs\/references\/(?:V(?:81|82)_|v(?:81|82)-)/u.test(path));
  const privatePaths = [...new Set([...PRIVATE_V81_PROOF_PATHS, ...PRIVATE_V82_PROOF_PATHS,
    ...trackedPrivate.map(path => '/' + path)])].sort();
  for (const path of privatePaths) {
    const remote = await get(path);
    assert.equal(remote.response.status, 404, `private evidence must not be deployed: ${path}`);
    results.push({ path, status: 404, privateEvidence: true });
  }
  const report = { ok: true, checkedAt: new Date().toISOString(), commit: deployedCommit, target: targetKind,
    base: target, release: PRODUCTION_VERSION_V82, cache: PRODUCTION_CACHE_V82,
    totals: { criticalRuntime: CRITICAL_RUNTIME_PATHS_V82.length, runtimeAssets: RUNTIME_ASSETS_V82.length,
      modularProvingAssets: MODULAR_RUNTIME_ASSETS_V82.length, privateEvidence: privatePaths.length }, results };
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
  console.log(JSON.stringify(await verifyProductionV82({ commit, reportPath }), null, 2));
}
