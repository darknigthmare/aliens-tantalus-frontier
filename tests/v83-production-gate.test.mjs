import assert from 'node:assert/strict';
import { access, cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import test from 'node:test';
import { CONTENT_COUNTS, RELEASE } from '../src/content.js';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';
import {
  CRITICAL_RUNTIME_PATHS_V82, MODULAR_RUNTIME_ASSETS_V82, RUNTIME_ASSETS_V82,
  RUNTIME_ASSET_PATHS_V82, PRODUCTION_CACHE_V82, PRODUCTION_VERSION_V82
} from '../scripts/verify-production-v82.mjs';
import {
  COMBAT_RUNTIME_PATHS_V83, CRITICAL_RUNTIME_PATHS_V83, MODULAR_RUNTIME_ASSETS_V83,
  PRIVATE_V83_PREFIXES, PRIVATE_V83_PROOF_PATHS, PRODUCTION_CACHE_V83,
  PRODUCTION_REPORT_PATH_V83, PRODUCTION_VERSION_V83, REPORT_PATHS_V83,
  RUNTIME_ASSETS_V83, RUNTIME_ASSET_PATHS_V83, classifyVerificationTargetV83, verifyProductionV83
} from '../scripts/verify-production-v83.mjs';

const FULL_COMMIT = '1234567890abcdef1234567890abcdef12345678';
const FIXTURE_RELEASE = Object.freeze({ ...RELEASE, version: '83.0.0' });
const PRIVATE_TRACKED = [81, 82, 83].flatMap(version => [
  'docs/references/v' + version + '-unlisted-private/proof.json',
  'docs/references/V' + version + '_UNLISTED_PRIVATE.json'
]);

async function fixture() {
  const html = '<title>ALIENS: TANTALUS FRONTIER v83</title>\nVERSION 83.0.0\n<meta name="atf-release" content="83.0.0">\n<canvas id="hub-canvas"></canvas>\n<button data-proving-ground-control-v81></button>\n<section id="bioforge-ui-v80"></section>\n';
  const committed = new Map(CRITICAL_RUNTIME_PATHS_V83.map(path => [path, Buffer.from(path + '\nfixture\n')]));
  committed.set('index.html', Buffer.from(html));
  const precache = [...RUNTIME_ASSET_PATHS_V83, ...COMBAT_RUNTIME_PATHS_V83.map(path => '/' + path)];
  committed.set('sw.js', Buffer.from(PRODUCTION_CACHE_V83 + '\n' + precache.map(path => "'" + path + "'").join('\n')));
  for (const asset of RUNTIME_ASSETS_V83) committed.set(asset.path.slice(1), await readFile(asset.path.slice(1)));
  const remote = new Map([...committed].map(([path, bytes]) => ['/' + path, { status: 200, bytes,
    type: RUNTIME_ASSETS_V83.find(asset => asset.path === '/' + path)?.mime || 'text/javascript' }]));
  remote.set('/', { status: 200, bytes: Buffer.from(html), type: 'text/html' });
  remote.set('/build-info.json', { status: 200, type: 'application/json', bytes: Buffer.from(JSON.stringify({
    name: FIXTURE_RELEASE.name, version: PRODUCTION_VERSION_V83, sourceVersion: FIXTURE_RELEASE.sourceVersion,
    content: CONTENT_COUNTS, builtAt: '2026-09-12T00:00:00.000Z', artProvider: 'OpenAI ImageGen'
  })) });
  const calls = [], requests = [];
  const spawn = (command, args) => {
    calls.push({ command, args });
    assert.equal(command, 'git');
    if (args[0] === 'rev-parse') return { status: 0, stdout: FULL_COMMIT + '\n' };
    if (args[0] === 'ls-tree') return { status: 0, stdout: Buffer.from([
      ...PRIVATE_TRACKED, 'docs/references/v830-public.txt', 'docs/VALIDATION_V83.md'
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

test('V83 covers the prior 35 paths plus both modules and both central integrations, with unchanged art', () => {
  assert.equal(PRODUCTION_VERSION_V83, '83.0.0');
  assert.equal(PRODUCTION_CACHE_V83, 'atf-v83-eight-way-combat-shell-1');
  assert.deepEqual(CRITICAL_RUNTIME_PATHS_V83, [...CRITICAL_RUNTIME_PATHS_V82, ...COMBAT_RUNTIME_PATHS_V83]);
  assert.equal(new Set(CRITICAL_RUNTIME_PATHS_V83).size, 39);
  for (const path of ['src/game-production-base.js', 'src/mission-input-v77.js', 'src/combat-aim-v83.js',
    'src/projectile-collision-v83.js', 'src/bioforge-runtime-v80.js', 'src/game-v51-runtime.js', 'src/game-v52-runtime.js']) {
    assert.ok(CRITICAL_RUNTIME_PATHS_V83.includes(path), path);
  }
  assert.equal(RUNTIME_ASSETS_V83, RUNTIME_ASSETS_V82, 'reuse reviewed descriptors, do not relabel their versions');
  assert.equal(RUNTIME_ASSET_PATHS_V83, RUNTIME_ASSET_PATHS_V82);
  assert.equal(MODULAR_RUNTIME_ASSETS_V83, MODULAR_RUNTIME_ASSETS_V82);
  assert.equal(new Set(RUNTIME_ASSET_PATHS_V83).size, 12);
  assert.ok(!RUNTIME_ASSET_PATHS_V83.some(path => path.includes('/v83/')));
  assert.equal(PRODUCTION_VERSION_V82, '82.0.0');
  assert.equal(PRODUCTION_CACHE_V82, 'atf-v82-modular-proving-shell-1', 'historical gate stays historical');
});

test('V83 compares all critical committed bytes and twelve assets, and discovers private proofs in three versions', async () => {
  const { options, calls, requests } = await fixture();
  const report = await verifyProductionV83(options);
  assert.equal(report.ok, true);
  assert.equal(report.target, 'preview');
  assert.equal(report.commit, FULL_COMMIT);
  assert.equal(report.release, '83.0.0');
  assert.equal(report.totals.criticalRuntime, 39);
  assert.equal(report.totals.runtimeAssets, 12);
  assert.equal(report.totals.modularProvingAssets, 2);
  for (const path of PRIVATE_TRACKED) {
    assert.ok(report.results.some(result => result.path === '/' + path && result.privateEvidence && result.status === 404), path);
  }
  for (const path of COMBAT_RUNTIME_PATHS_V83) assert.ok(calls.some(call => call.args[1] === FULL_COMMIT + ':' + path), path);
  assert.ok(calls.some(call => call.args[0] === 'ls-tree' && call.args.includes(FULL_COMMIT)));
  assert.ok(!requests.includes('/docs/references/v830-public.txt'), 'exact private version boundary');
  assert.ok(report.results.filter(result => result.kind === 'critical-runtime').every(result => result.matchesCommit === FULL_COMMIT));
});

test('target classification and report destinations distinguish production, preview and local builds', async () => {
  for (const [base, target] of [
    ['https://aliens-tantalus-frontier.vercel.app', 'production'],
    ['http://127.0.0.1:4176', 'local-build'], ['http://localhost:4176', 'local-build'],
    ['http://[::1]:4176', 'local-build'], ['https://preview.vercel.app', 'preview'],
    ['https://aliens-tantalus-frontier.vercel.app.evil.invalid', 'preview']
  ]) {
    assert.equal(classifyVerificationTargetV83(base), target);
    const { options } = await fixture();
    const report = await verifyProductionV83({ ...options, base });
    assert.equal(report.target, target);
    assert.equal(report.base, base);
  }
  assert.equal(REPORT_PATHS_V83.production, PRODUCTION_REPORT_PATH_V83);
  assert.equal(REPORT_PATHS_V83['local-build'], 'docs/references/v83-release-qa/local-build-http.json');
  assert.equal(REPORT_PATHS_V83.preview, 'docs/references/v83-release-qa/preview-http.json');
  assert.throws(() => classifyVerificationTargetV83('file:///private'), /HTTP/);
  for (const base of ['https://fixture.invalid/path', 'https://fixture.invalid/?query=1', 'https://fixture.invalid/#fragment']) {
    const { options, requests } = await fixture();
    await assert.rejects(verifyProductionV83({ ...options, base }), /origin without/);
    assert.equal(requests.length, 0);
  }
});

test('CRLF is tolerated but altered combat modules and changed committed integrations fail', async () => {
  const state = await fixture();
  const entry = state.remote.get('/src/combat-aim-v83.js');
  const original = entry.bytes;
  entry.bytes = Buffer.from(original.toString().replaceAll('\n', '\r\n'));
  const report = await verifyProductionV83(state.options);
  assert.equal(report.results.find(result => result.path === '/src/combat-aim-v83.js').parity, 'line-ending-normalized');
  entry.bytes = Buffer.concat([original, Buffer.from('changed behavior')]);
  await assert.rejects(verifyProductionV83(state.options), /production text.*combat-aim/);
  entry.bytes = original;
  state.committed.set('src/game-production-base.js', Buffer.from('different requested commit'));
  await assert.rejects(verifyProductionV83(state.options), /production text.*game-production-base/);
});

test('runtime images must match both the registry and requested commit with exact MIME', async () => {
  const state = await fixture();
  const asset = MODULAR_RUNTIME_ASSETS_V83[1];
  const entry = state.remote.get(asset.path);
  const original = entry.bytes;
  entry.bytes = Buffer.from('wrong pixels');
  await assert.rejects(verifyProductionV83(state.options), /production asset.*ceiling/);
  entry.bytes = original;
  entry.type = 'text/html';
  await assert.rejects(verifyProductionV83(state.options), /ceiling/);
  entry.type = asset.mime;
  state.committed.set(asset.path.slice(1), Buffer.from('wrong committed pixels'));
  await assert.rejects(verifyProductionV83(state.options), /committed asset.*ceiling/);
});

test('missing new module precache, wrong release and public private proofs cannot pass', async () => {
  const state = await fixture();
  const worker = state.remote.get('/sw.js');
  const source = worker.bytes;
  worker.bytes = Buffer.from(source.toString().replace("'/src/projectile-collision-v83.js'", ''));
  await assert.rejects(verifyProductionV83(state.options), /precache.*projectile-collision/);
  worker.bytes = source;
  for (const path of PRIVATE_TRACKED) {
    state.remote.set('/' + path, { status: 200, bytes: Buffer.from('{}'), type: 'application/json' });
    await assert.rejects(verifyProductionV83(state.options), /private evidence must not be deployed/);
    state.remote.delete('/' + path);
  }
  await assert.rejects(verifyProductionV83({ ...state.options, release: { ...FIXTURE_RELEASE, version: '82.0.0' } }), /Local release must be V83/);
});

test('a report is written only after success and local output never claims production', async t => {
  const temporary = await mkdtemp(join(tmpdir(), 'tantalus-v83-gate-'));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const reportPath = join(temporary, 'local-report.json');
  await writeFile(reportPath, 'previous evidence\n');
  const state = await fixture();
  const entry = state.remote.get('/src/projectile-collision-v83.js');
  const original = entry.bytes;
  entry.bytes = Buffer.from('wrong');
  const options = { ...state.options, base: 'http://127.0.0.1:4176', reportPath };
  await assert.rejects(verifyProductionV83(options));
  assert.equal(await readFile(reportPath, 'utf8'), 'previous evidence\n', 'failure does not overwrite evidence');
  entry.bytes = original;
  await verifyProductionV83(options);
  const report = JSON.parse(await readFile(reportPath, 'utf8'));
  assert.equal(report.target, 'local-build');
  assert.equal(report.ok, true);
  assert.equal(report.commit, FULL_COMMIT);
});

test('V83 proof roots are excluded before recursive copy while public reports and prior runtime art remain', async t => {
  const temporary = await mkdtemp(join(tmpdir(), 'tantalus-v83-filter-'));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const sourceRoot = join(temporary, 'source'), outputRoot = join(temporary, 'output');
  const roots = ['docs/references/V83_PRIVATE', 'docs/references/v83-browser-qa'];
  const privateFiles = [...roots.map(path => path + '/nested/receipt.png'), 'docs/references/V83_AUDIT.json'];
  const publicFiles = ['docs/V83_GAMEPLAY_SOURCE_AUDIT.md', 'docs/VALIDATION_V83.md',
    'docs/references/v830-public.json', 'docs/references/V830_PUBLIC.json', ...RUNTIME_ASSET_PATHS_V83.map(path => path.slice(1))];
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
  for (const path of PRIVATE_V83_PROOF_PATHS) assert.equal(filter(join(sourceRoot, path.slice(1))), false);
  const rules = (await readFile('.vercelignore', 'utf8')).split(/\r?\n/u).map(line => line.trim());
  for (const prefix of PRIVATE_V83_PREFIXES) {
    assert.ok(rules.includes(prefix + '*'));
    assert.ok(rules.includes(prefix + '*/**'));
    assert.ok(!rules.some(rule => rule.startsWith('!' + prefix)));
  }
});

test('current release, package lock, HTML, SW and QA scripts agree without relabelling V82 art', async () => {
  const [packageSource, lockSource, html, worker] = await Promise.all([
    readFile('package.json', 'utf8'), readFile('package-lock.json', 'utf8'), readFile('index.html', 'utf8'), readFile('sw.js', 'utf8')
  ]);
  const packageJson = JSON.parse(packageSource), lock = JSON.parse(lockSource);
  assert.ok(Number(RELEASE.version.split('.')[0]) >= 83, 'current release still includes V83 combat');
  for (const version of [packageJson.version, lock.version, lock.packages[''].version]) assert.equal(version, RELEASE.version);
  assert.ok(html.includes(`<title>ALIENS: TANTALUS FRONTIER v${RELEASE.version.split('.')[0]}</title>`));
  assert.ok(html.includes(`<meta name="atf-release" content="${RELEASE.version}">`));
  assert.match(html, /contenu ennemi encore en cours/u);
  assert.ok(worker.includes(`atf-v${RELEASE.version.split('.')[0]}-`));
  for (const path of COMBAT_RUNTIME_PATHS_V83) assert.ok(worker.includes("'/" + path + "'"), path);
  for (const path of RUNTIME_ASSET_PATHS_V82) assert.ok(worker.includes("'" + path + "'"), path);
  assert.equal(packageJson.scripts['verify:production:v83'], 'node scripts/verify-production-v83.mjs');
  assert.equal(packageJson.scripts['qa:browser:v83'], 'node tests/browser-combat-v83.mjs');
  assert.equal(packageJson.scripts['qa:release'], 'npm run qa && npm run qa:browser:v81 && npm run qa:browser:v83 && npm run qa:browser:v84');
});
