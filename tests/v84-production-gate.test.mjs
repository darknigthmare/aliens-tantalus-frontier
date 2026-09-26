import assert from 'node:assert/strict';
import { access, cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import test from 'node:test';
import { CONTENT_COUNTS, RELEASE } from '../src/content.js';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';
import {
  CRITICAL_RUNTIME_PATHS_V83, MODULAR_RUNTIME_ASSETS_V83, RUNTIME_ASSETS_V83,
  RUNTIME_ASSET_PATHS_V83, PRODUCTION_CACHE_V83, PRODUCTION_VERSION_V83
} from '../scripts/verify-production-v83.mjs';
import {
  ONBOARDING_RUNTIME_PATHS_V84, CRITICAL_RUNTIME_PATHS_V84, MODULAR_RUNTIME_ASSETS_V84,
  PRIVATE_V84_PREFIXES, PRIVATE_V84_PROOF_PATHS, PRODUCTION_CACHE_V84,
  PRODUCTION_REPORT_PATH_V84, PRODUCTION_VERSION_V84, REPORT_PATHS_V84,
  RUNTIME_ASSETS_V84, RUNTIME_ASSET_PATHS_V84, classifyVerificationTargetV84, verifyProductionV84
} from '../scripts/verify-production-v84.mjs';

const FULL_COMMIT = '1234567890abcdef1234567890abcdef12345678';
const FIXTURE_RELEASE = Object.freeze({ ...RELEASE, version: '84.0.0' });
const PRIVATE_TRACKED = [81, 82, 83, 84].flatMap(version => [
  'docs/references/v' + version + '-unlisted-private/proof.json',
  'docs/references/V' + version + '_UNLISTED_PRIVATE.json'
]);

async function fixture() {
  const html = '<title>ALIENS: TANTALUS FRONTIER v84</title>\nVERSION 84.0.0\n<meta name="atf-release" content="84.0.0">\n<canvas id="hub-canvas"></canvas>\n<button data-proving-ground-control-v81></button>\n<section id="bioforge-ui-v80"></section>\n<link rel="stylesheet" href="/player-onboarding-v84.css">\n<p id="hub-onboarding-objective-v84"></p>\n';
  const committed = new Map(CRITICAL_RUNTIME_PATHS_V84.map(path => [path, Buffer.from(path + '\nfixture\n')]));
  committed.set('index.html', Buffer.from(html));
  const precache = [...RUNTIME_ASSET_PATHS_V84, ...ONBOARDING_RUNTIME_PATHS_V84.map(path => '/' + path)];
  committed.set('sw.js', Buffer.from(PRODUCTION_CACHE_V84 + '\n' + precache.map(path => "'" + path + "'").join('\n')));
  for (const asset of RUNTIME_ASSETS_V84) committed.set(asset.path.slice(1), await readFile(asset.path.slice(1)));
  const remote = new Map([...committed].map(([path, bytes]) => ['/' + path, { status: 200, bytes,
    type: RUNTIME_ASSETS_V84.find(asset => asset.path === '/' + path)?.mime || (path.endsWith('.css') ? 'text/css' : 'text/javascript') }]));
  remote.set('/', { status: 200, bytes: Buffer.from(html), type: 'text/html' });
  remote.set('/build-info.json', { status: 200, type: 'application/json', bytes: Buffer.from(JSON.stringify({
    name: FIXTURE_RELEASE.name, version: PRODUCTION_VERSION_V84, sourceVersion: FIXTURE_RELEASE.sourceVersion,
    content: CONTENT_COUNTS, builtAt: '2026-09-12T00:00:00.000Z', artProvider: 'OpenAI ImageGen'
  })) });
  const calls = [], requests = [];
  const spawn = (command, args) => {
    calls.push({ command, args });
    assert.equal(command, 'git');
    if (args[0] === 'rev-parse') return { status: 0, stdout: FULL_COMMIT + '\n' };
    if (args[0] === 'ls-tree') return { status: 0, stdout: Buffer.from([
      ...PRIVATE_TRACKED, 'docs/references/v840-public.txt', 'docs/VALIDATION_V84.md'
    ].join('\n')) };
    assert.equal(args[0], 'show');
    assert.ok(args[1].startsWith(FULL_COMMIT + ':'), 'every comparison resolves to the requested full commit');
    const bytes = committed.get(args[1].slice(41));
    return bytes ? { status: 0, stdout: bytes } : { status: 1, stderr: 'missing committed file' };
  };
  const fetchImpl = async url => {
    requests.push(new URL(url).pathname);
    const entry = remote.get(new URL(url).pathname) || { status: 404, bytes: Buffer.from('missing'), type: 'text/plain' };
    return new Response(entry.bytes, { status: entry.status, headers: { 'content-type': entry.type } });
  };
  return { remote, committed, calls, requests,
    options: { release: FIXTURE_RELEASE, commit: '1234567', base: 'https://fixture.invalid', fetchImpl, spawn, reportPath: null } };
}

test('V84 covers the prior 39 paths plus onboarding, captions, CSS, squad integration and CIC profiles, with unchanged art', () => {
  assert.equal(PRODUCTION_VERSION_V84, '84.0.0');
  assert.equal(PRODUCTION_CACHE_V84, 'atf-v84-player-onboarding-shell-1');
  assert.deepEqual(CRITICAL_RUNTIME_PATHS_V84, [...CRITICAL_RUNTIME_PATHS_V83, ...ONBOARDING_RUNTIME_PATHS_V84]);
  assert.equal(new Set(CRITICAL_RUNTIME_PATHS_V84).size, 46);
  assert.ok(CRITICAL_RUNTIME_PATHS_V84.includes('src/hub-profiles-v53.js'));
  for (const path of ['src/game-production-base.js', 'src/mission-input-v77.js', 'src/player-onboarding-v84.js',
    'src/combat-captions-v84.js', 'src/bioforge-runtime-v80.js', 'src/game-v51-runtime.js', 'src/game-v52-runtime.js']) {
    assert.ok(CRITICAL_RUNTIME_PATHS_V84.includes(path), path);
  }
  assert.equal(RUNTIME_ASSETS_V84, RUNTIME_ASSETS_V83, 'reuse reviewed descriptors, do not relabel their versions');
  assert.equal(RUNTIME_ASSET_PATHS_V84, RUNTIME_ASSET_PATHS_V83);
  assert.equal(MODULAR_RUNTIME_ASSETS_V84, MODULAR_RUNTIME_ASSETS_V83);
  assert.equal(new Set(RUNTIME_ASSET_PATHS_V84).size, 12);
  assert.ok(!RUNTIME_ASSET_PATHS_V84.some(path => path.includes('/v84/')));
  assert.equal(PRODUCTION_VERSION_V83, '83.0.0');
  assert.equal(PRODUCTION_CACHE_V83, 'atf-v83-eight-way-combat-shell-1', 'historical gate stays historical');
});

test('V84 compares all critical committed bytes and twelve assets, and discovers private proofs in four versions', async () => {
  const { options, calls, requests } = await fixture();
  const report = await verifyProductionV84(options);
  assert.equal(report.ok, true);
  assert.equal(report.target, 'preview');
  assert.equal(report.commit, FULL_COMMIT);
  assert.equal(report.release, '84.0.0');
  assert.equal(report.totals.criticalRuntime, 46);
  assert.equal(report.totals.runtimeAssets, 12);
  assert.equal(report.totals.modularProvingAssets, 2);
  for (const path of PRIVATE_TRACKED) {
    assert.ok(report.results.some(result => result.path === '/' + path && result.privateEvidence && result.status === 404), path);
  }
  for (const path of ONBOARDING_RUNTIME_PATHS_V84) assert.ok(calls.some(call => call.args[1] === FULL_COMMIT + ':' + path), path);
  assert.ok(calls.some(call => call.args[0] === 'ls-tree' && call.args.includes(FULL_COMMIT)));
  assert.ok(!requests.includes('/docs/references/v840-public.txt'), 'exact private version boundary');
  assert.ok(report.results.filter(result => result.kind === 'critical-runtime').every(result => result.matchesCommit === FULL_COMMIT));
});

test('target classification and report destinations distinguish production, preview and local builds', async () => {
  for (const [base, target] of [
    ['https://aliens-tantalus-frontier.vercel.app', 'production'],
    ['http://127.0.0.1:4176', 'local-build'], ['http://localhost:4176', 'local-build'],
    ['http://[::1]:4176', 'local-build'], ['https://preview.vercel.app', 'preview'],
    ['https://aliens-tantalus-frontier.vercel.app.evil.invalid', 'preview']
  ]) {
    assert.equal(classifyVerificationTargetV84(base), target);
    const { options } = await fixture();
    const report = await verifyProductionV84({ ...options, base });
    assert.equal(report.target, target);
    assert.equal(report.base, base);
  }
  assert.equal(REPORT_PATHS_V84.production, PRODUCTION_REPORT_PATH_V84);
  assert.equal(REPORT_PATHS_V84['local-build'], 'docs/references/v84-release-qa/local-build-http.json');
  assert.equal(REPORT_PATHS_V84.preview, 'docs/references/v84-release-qa/preview-http.json');
  assert.throws(() => classifyVerificationTargetV84('file:///private'), /HTTP/);
  for (const base of ['https://fixture.invalid/path', 'https://fixture.invalid/?query=1', 'https://fixture.invalid/#fragment']) {
    const { options, requests } = await fixture();
    await assert.rejects(verifyProductionV84({ ...options, base }), /origin without/);
    assert.equal(requests.length, 0);
  }
});

test('CRLF is tolerated but altered combat modules and changed committed integrations fail', async () => {
  const state = await fixture();
  const entry = state.remote.get('/src/player-onboarding-v84.js');
  const original = entry.bytes;
  entry.bytes = Buffer.from(original.toString().replaceAll('\n', '\r\n'));
  const report = await verifyProductionV84(state.options);
  assert.equal(report.results.find(result => result.path === '/src/player-onboarding-v84.js').parity, 'line-ending-normalized');
  entry.bytes = Buffer.concat([original, Buffer.from('changed behavior')]);
  await assert.rejects(verifyProductionV84(state.options), /production text.*player-onboarding/);
  entry.bytes = original;
  state.committed.set('src/game-production-base.js', Buffer.from('different requested commit'));
  await assert.rejects(verifyProductionV84(state.options), /production text.*game-production-base/);
});

test('runtime images must match both the registry and requested commit with exact MIME', async () => {
  const state = await fixture();
  const asset = MODULAR_RUNTIME_ASSETS_V84[1];
  const entry = state.remote.get(asset.path);
  const original = entry.bytes;
  entry.bytes = Buffer.from('wrong pixels');
  await assert.rejects(verifyProductionV84(state.options), /production asset.*ceiling/);
  entry.bytes = original;
  entry.type = 'text/html';
  await assert.rejects(verifyProductionV84(state.options), /ceiling/);
  entry.type = asset.mime;
  state.committed.set(asset.path.slice(1), Buffer.from('wrong committed pixels'));
  await assert.rejects(verifyProductionV84(state.options), /committed asset.*ceiling/);
});

test('missing new module precache, wrong release and public private proofs cannot pass', async () => {
  const state = await fixture();
  const worker = state.remote.get('/sw.js');
  const source = worker.bytes;
  worker.bytes = Buffer.from(source.toString().replace("'/src/combat-captions-v84.js'", ''));
  await assert.rejects(verifyProductionV84(state.options), /precache.*combat-captions/);
  worker.bytes = source;
  for (const path of PRIVATE_TRACKED) {
    state.remote.set('/' + path, { status: 200, bytes: Buffer.from('{}'), type: 'application/json' });
    await assert.rejects(verifyProductionV84(state.options), /private evidence must not be deployed/);
    state.remote.delete('/' + path);
  }
  await assert.rejects(verifyProductionV84({ ...state.options, release: { ...FIXTURE_RELEASE, version: '83.0.0' } }), /Local release must be V84/);
});

test('a report is written only after success and local output never claims production', async t => {
  const temporary = await mkdtemp(join(tmpdir(), 'tantalus-v84-gate-'));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const reportPath = join(temporary, 'local-report.json');
  await writeFile(reportPath, 'previous evidence\n');
  const state = await fixture();
  const entry = state.remote.get('/src/combat-captions-v84.js');
  const original = entry.bytes;
  entry.bytes = Buffer.from('wrong');
  const options = { ...state.options, base: 'http://127.0.0.1:4176', reportPath };
  await assert.rejects(verifyProductionV84(options));
  assert.equal(await readFile(reportPath, 'utf8'), 'previous evidence\n', 'failure does not overwrite evidence');
  entry.bytes = original;
  await verifyProductionV84(options);
  const report = JSON.parse(await readFile(reportPath, 'utf8'));
  assert.equal(report.target, 'local-build');
  assert.equal(report.ok, true);
  assert.equal(report.commit, FULL_COMMIT);
});

test('V84 proof roots are excluded before recursive copy while public reports and prior runtime art remain', async t => {
  const temporary = await mkdtemp(join(tmpdir(), 'tantalus-v84-filter-'));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const sourceRoot = join(temporary, 'source'), outputRoot = join(temporary, 'output');
  const roots = ['docs/references/V84_PRIVATE', 'docs/references/v84-browser-qa'];
  const privateFiles = [...roots.map(path => path + '/nested/receipt.png'), 'docs/references/V84_AUDIT.json'];
  const publicFiles = ['docs/V84_GAMEPLAY_SOURCE_AUDIT.md', 'docs/VALIDATION_V84.md',
    'docs/references/v840-public.json', 'docs/references/V840_PUBLIC.json', ...RUNTIME_ASSET_PATHS_V84.map(path => path.slice(1))];
  for (const path of [...privateFiles, ...publicFiles]) {
    await mkdir(dirname(join(sourceRoot, path)), { recursive: true });
    await writeFile(join(sourceRoot, path), 'fixture:' + path);
  }
  const filter = createBuildAssetFilter(sourceRoot), visited = [];
  await cp(sourceRoot, outputRoot, { recursive: true, filter(source) {
    visited.push(relative(sourceRoot, source).replaceAll('\\', '/'));
    return filter(source);
  } });
  for (const root of roots) {
    assert.ok(visited.includes(root));
    assert.ok(!visited.some(path => path.startsWith(root + '/')), 'no descent into private source');
  }
  for (const path of privateFiles) {
    await assert.rejects(access(join(outputRoot, path)), { code: 'ENOENT' });
    assert.equal(await readFile(join(sourceRoot, path), 'utf8'), 'fixture:' + path, 'source preserved');
  }
  for (const path of publicFiles) assert.equal(await readFile(join(outputRoot, path), 'utf8'), 'fixture:' + path);
  for (const path of PRIVATE_V84_PROOF_PATHS) assert.equal(filter(join(sourceRoot, path.slice(1))), false);
  const rules = (await readFile('.vercelignore', 'utf8')).split(/\r?\n/u).map(line => line.trim());
  for (const prefix of PRIVATE_V84_PREFIXES) {
    assert.ok(rules.includes(prefix + '*'));
    assert.ok(rules.includes(prefix + '*/**'));
    assert.ok(!rules.some(rule => rule.startsWith('!' + prefix)));
  }
});

test('current release, package lock, HTML, SW and QA scripts agree without relabelling V83 art', async () => {
  const [packageSource, lockSource, html, worker] = await Promise.all([
    readFile('package.json', 'utf8'), readFile('package-lock.json', 'utf8'), readFile('index.html', 'utf8'), readFile('sw.js', 'utf8')
  ]);
  const packageJson = JSON.parse(packageSource), lock = JSON.parse(lockSource);
  assert.equal(RELEASE.version, '86.0.0');
  for (const version of [packageJson.version, lock.version, lock.packages[''].version]) assert.equal(version, RELEASE.version);
  assert.match(html, /<title>ALIENS: TANTALUS FRONTIER v86<\/title>/u);
  assert.match(html, /<meta name="atf-release" content="86\.0\.0">/u);
  assert.match(html, /contenu ennemi encore en cours/u);
  assert.ok(worker.includes('atf-v86-xeno-trials-v97-shell-1'));
  for (const path of ONBOARDING_RUNTIME_PATHS_V84) assert.ok(worker.includes("'/" + path + "'"), path);
  for (const path of RUNTIME_ASSET_PATHS_V83) assert.ok(worker.includes("'" + path + "'"), path);
  assert.equal(packageJson.scripts['verify:production:v84'], 'node scripts/verify-production-v84.mjs');
  assert.equal(packageJson.scripts['qa:browser:v84'], 'node tests/browser-onboarding-v84.mjs && node tests/browser-captions-v84.mjs');
  assert.equal(packageJson.scripts['qa:release'], 'npm run qa && npm run qa:browser:v81 && npm run qa:browser:v83 && npm run qa:browser:v84 && npm run qa:browser:v85 && npm run qa:browser:v86');
});

test('V84 refuses a stylesheet served with a script MIME even when its committed bytes match', async () => {
  const state = await fixture();
  state.remote.get('/player-onboarding-v84.css').type = 'text/javascript';
  await assert.rejects(verifyProductionV84(state.options), /stylesheet MIME.*player-onboarding/);
});
