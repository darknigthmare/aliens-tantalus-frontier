import assert from 'node:assert/strict';
import { access, cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import test from 'node:test';
import { CONTENT_COUNTS, RELEASE } from '../src/content.js';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';
import { sha256V81, normalizeTextLineEndingsV81 } from '../scripts/verify-production-v81.mjs';
import { CRITICAL_RUNTIME_PATHS_V84, RUNTIME_ASSETS_V84, RUNTIME_ASSET_PATHS_V84,
  MODULAR_RUNTIME_ASSETS_V84, PRODUCTION_VERSION_V84, PRODUCTION_CACHE_V84 } from '../scripts/verify-production-v84.mjs';
import { RECRUITMENT_RUNTIME_PATHS_V85, CRITICAL_RUNTIME_PATHS_V85, RUNTIME_ASSETS_V85,
  RUNTIME_ASSET_PATHS_V85, MODULAR_RUNTIME_ASSETS_V85, PRODUCTION_VERSION_V85, PRODUCTION_CACHE_V85,
  PRODUCTION_REPORT_PATH_V85, REPORT_PATHS_V85, PRIVATE_V85_PREFIXES, PRIVATE_V85_PROOF_PATHS,
  classifyVerificationTargetV85, verifyProductionV85 } from '../scripts/verify-production-v85.mjs';

const FULL_COMMIT = '1234567890abcdef1234567890abcdef12345678';
const FIXTURE_RELEASE = Object.freeze({ ...RELEASE, version: '85.0.0' });
const TRACKED_PROOFS = [81, 82, 83, 84, 85].flatMap(version => [
  `docs/references/v${version}-not-hardcoded/nested/proof.json`, `docs/references/V${version}_NOT_HARDCODED.txt`
]);
const ART_BYTES = new Map(await Promise.all(RUNTIME_ASSETS_V85.map(async asset => [asset.path.slice(1), await readFile(asset.path.slice(1))])));
const HTML = '<title>ALIENS: TANTALUS FRONTIER v85</title>\nVERSION 85.0.0\n<meta name="atf-release" content="85.0.0">\n<canvas id="hub-canvas"></canvas>\n<button data-proving-ground-control-v81></button>\n<section id="bioforge-ui-v80"></section>\n<link rel="stylesheet" href="/crew-v85.css">\n<p id="hub-onboarding-objective-v84"></p>\n<div id="crew-list" class="crew-roster-v85"></div>\n';

function fixture() {
  const committed = new Map(CRITICAL_RUNTIME_PATHS_V85.map(path => [path, Buffer.from(path + '\nfixture\n')]));
  committed.set('index.html', Buffer.from(HTML));
  committed.set('sw.js', Buffer.from(PRODUCTION_CACHE_V85 + '\n' + [...RUNTIME_ASSET_PATHS_V85,
    ...RECRUITMENT_RUNTIME_PATHS_V85.map(path => '/' + path)].map(path => "'" + path + "'").join('\n')));
  for (const [path, bytes] of ART_BYTES) committed.set(path, bytes);
  const remote = new Map([...committed].map(([path, bytes]) => ['/' + path, { status: 200, bytes,
    type: RUNTIME_ASSETS_V85.find(asset => asset.path === '/' + path)?.mime
      || (path.endsWith('.css') ? 'text/css' : path.endsWith('.html') ? 'text/html' : 'text/javascript') }]));
  remote.set('/', { status: 200, bytes: Buffer.from(HTML), type: 'text/html; charset=utf-8' });
  remote.set('/build-info.json', { status: 200, type: 'application/json', bytes: Buffer.from(JSON.stringify({
    name: FIXTURE_RELEASE.name, version: '85.0.0', sourceVersion: FIXTURE_RELEASE.sourceVersion,
    content: CONTENT_COUNTS, builtAt: '2026-09-13T00:00:00.000Z', artProvider: 'OpenAI ImageGen'
  })) });
  const calls = [], requests = [], tracked = [...TRACKED_PROOFS, 'docs/references/v850-public.txt', 'docs/references/V850_PUBLIC.json', 'docs/VALIDATION_V85.md'];
  const spawn = (command, args) => {
    calls.push({ command, args }); assert.equal(command, 'git');
    if (args[0] === 'rev-parse') return { status: 0, stdout: FULL_COMMIT + '\n' };
    if (args[0] === 'ls-tree') return { status: 0, stdout: Buffer.from(args.includes('-z')
      ? tracked.join('\0') + '\0'
      : tracked.map(path => /[^\x20-\x7e]/u.test(path) ? JSON.stringify(path) : path).join('\n')) };
    assert.equal(args[0], 'show'); assert.ok(args[1].startsWith(FULL_COMMIT + ':'));
    const bytes = committed.get(args[1].slice(41));
    return bytes ? { status: 0, stdout: bytes } : { status: 1, stderr: 'missing committed file' };
  };
  const fetchImpl = async (url, options) => {
    const path = decodeURIComponent(new URL(url).pathname);
    requests.push({ path, options });
    const entry = remote.get(path) || { status: 404, bytes: Buffer.from('missing'), type: 'text/plain' };
    return new Response(entry.bytes, { status: entry.status, headers: { 'content-type': entry.type } });
  };
  return { committed, remote, calls, requests, tracked,
    options: { release: FIXTURE_RELEASE, commit: '1234567', base: 'https://fixture.invalid', fetchImpl, spawn, reportPath: null } };
}

test('V85 adds exactly six recruitment integrations to all 46 V84 critical files without inventing new artwork', () => {
  assert.equal(PRODUCTION_VERSION_V85, '85.0.0');
  assert.equal(PRODUCTION_CACHE_V85, 'atf-v85-causal-recruitment-shell-1');
  assert.deepEqual(RECRUITMENT_RUNTIME_PATHS_V85, ['src/crew-recruitment-v85.js', 'src/crew-transactions-v85.js',
    'src/crew-ui-v85.js', 'src/crew-runtime-v85.js', 'crew-v85.css', 'src/game-final-runtime.js']);
  assert.deepEqual(CRITICAL_RUNTIME_PATHS_V85, [...CRITICAL_RUNTIME_PATHS_V84, ...RECRUITMENT_RUNTIME_PATHS_V85]);
  assert.equal(CRITICAL_RUNTIME_PATHS_V85.length, 52);
  assert.equal(new Set(CRITICAL_RUNTIME_PATHS_V85).size, 52);
  for (const path of ['src/save.js', 'src/app.js', 'src/alpha-bravo-coop-runtime-v69.js', 'src/hub-onboarding-v84.js']) assert.ok(CRITICAL_RUNTIME_PATHS_V85.includes(path));
  assert.equal(RUNTIME_ASSETS_V85, RUNTIME_ASSETS_V84);
  assert.equal(RUNTIME_ASSET_PATHS_V85, RUNTIME_ASSET_PATHS_V84);
  assert.equal(MODULAR_RUNTIME_ASSETS_V85, MODULAR_RUNTIME_ASSETS_V84);
  assert.equal(RUNTIME_ASSETS_V85.length, 12);
  assert.equal(new Set(RUNTIME_ASSET_PATHS_V85).size, 12);
  assert.equal(MODULAR_RUNTIME_ASSETS_V85.length, 2);
  assert.ok(!RUNTIME_ASSET_PATHS_V85.some(path => path.includes('/v85/')));
  assert.equal(PRODUCTION_VERSION_V84, '84.0.0');
  assert.equal(PRODUCTION_CACHE_V84, 'atf-v84-player-onboarding-shell-1');
});

test('the successful gate binds every module and all 12 exact assets to the supplied full commit', async () => {
  const state = fixture(); const report = await verifyProductionV85(state.options);
  assert.equal(report.ok, true); assert.equal(report.commit, FULL_COMMIT);
  assert.equal(report.target, 'preview'); assert.equal(report.release, '85.0.0');
  assert.equal(report.totals.criticalRuntime, 52); assert.equal(report.totals.runtimeAssets, 12);
  assert.equal(report.totals.modularProvingAssets, 2);
  for (const path of CRITICAL_RUNTIME_PATHS_V85) {
    assert.ok(state.calls.some(call => call.args[1] === FULL_COMMIT + ':' + path), path);
    const result = report.results.find(entry => entry.path === '/' + path);
    assert.equal(result.matchesCommit, FULL_COMMIT); assert.equal(result.parity, 'exact-bytes');
    assert.match(result.sha256, /^[a-f0-9]{64}$/u);
  }
  assert.ok(state.calls.some(call => call.args[0] === 'ls-tree' && call.args.includes(FULL_COMMIT)));
  for (const path of TRACKED_PROOFS) assert.ok(report.results.some(entry => entry.path === '/' + path && entry.privateEvidence && entry.status === 404), path);
  assert.ok(!state.requests.some(entry => entry.path.includes('850-public') || entry.path.includes('V850_PUBLIC')));
  assert.ok(state.requests.every(entry => entry.options.cache === 'no-store'));
});

for (const commit of [undefined, '', 'HEAD', 'main', '123', 'not-a-commit', '-1234567']) {
  test(`missing or ambiguous content commit is refused before any Git/fetch work: ${String(commit)}`, async () => {
    const state = fixture();
    await assert.rejects(verifyProductionV85({ ...state.options, commit }), /exact deployed content commit/);
    assert.equal(state.calls.length, 0); assert.equal(state.requests.length, 0);
  });
}

test('Git commit resolution and absent committed files cannot silently fall back to the working tree', async () => {
  const state = fixture();
  await assert.rejects(verifyProductionV85({ ...state.options, spawn: () => ({ status: 0, stdout: 'invalid-sha' }) }), /full commit SHA/);
  state.committed.delete('src/crew-runtime-v85.js');
  await assert.rejects(verifyProductionV85(state.options), /missing committed file/);
});

test('canonical production, local builds and previews receive distinct truthful report classifications', async () => {
  for (const [base, kind] of [
    ['https://aliens-tantalus-frontier.vercel.app', 'production'], ['http://127.0.0.1:4185', 'local-build'],
    ['http://localhost:4185', 'local-build'], ['http://[::1]:4185', 'local-build'],
    ['https://preview.vercel.app', 'preview'], ['https://aliens-tantalus-frontier.vercel.app.evil.invalid', 'preview']
  ]) {
    assert.equal(classifyVerificationTargetV85(base), kind);
    const state = fixture(); const report = await verifyProductionV85({ ...state.options, base });
    assert.equal(report.target, kind); assert.equal(report.base, base);
  }
  assert.equal(REPORT_PATHS_V85.production, PRODUCTION_REPORT_PATH_V85);
  assert.equal(REPORT_PATHS_V85['local-build'], 'docs/references/v85-release-qa/local-build-http.json');
  assert.equal(REPORT_PATHS_V85.preview, 'docs/references/v85-release-qa/preview-http.json');
  assert.throws(() => classifyVerificationTargetV85('file:///private'), /HTTP/);
  for (const base of ['https://fixture.invalid/path', 'https://fixture.invalid/?q=1', 'https://fixture.invalid/#hash', 'https://user:secret@fixture.invalid']) {
    const state = fixture(); await assert.rejects(verifyProductionV85({ ...state.options, base }), /origin without/);
    assert.equal(state.requests.length, 0);
  }
});

test('CRLF-only differences record normalized parity, but altered committed behavior is rejected', async () => {
  const state = fixture(); const path = '/src/crew-transactions-v85.js'; const entry = state.remote.get(path);
  entry.bytes = Buffer.from(entry.bytes.toString().replaceAll('\n', '\r\n'));
  state.remote.get('/').bytes = Buffer.from(HTML.replaceAll('\n', '\r\n'));
  const report = await verifyProductionV85(state.options);
  const result = report.results.find(item => item.path === path);
  assert.equal(result.parity, 'line-ending-normalized');
  assert.notEqual(result.sha256, result.commitSha256);
  assert.equal(result.normalizedSha256, sha256V81(normalizeTextLineEndingsV81(state.committed.get(path.slice(1)))));
  state.committed.set(path.slice(1), Buffer.from('different requested commit'));
  await assert.rejects(verifyProductionV85(state.options), /production text.*crew-transactions/);
});

for (const path of RECRUITMENT_RUNTIME_PATHS_V85) test(`V85 rejects a corrupted integration even when HTTP succeeds: ${path}`, async () => {
  const state = fixture(); state.remote.get('/' + path).bytes = Buffer.from('changed runtime behavior');
  await assert.rejects(verifyProductionV85(state.options), /production text/);
});

test('art bytes and MIME must match the reviewed descriptor and requested commit independently', async () => {
  for (const asset of RUNTIME_ASSETS_V85) {
    const state = fixture(); const entry = state.remote.get(asset.path); const bytes = entry.bytes;
    entry.bytes = Buffer.from('different pixels');
    await assert.rejects(verifyProductionV85(state.options), /production asset/);
    entry.bytes = bytes; entry.type = 'text/html';
    await assert.rejects(verifyProductionV85(state.options), new RegExp(asset.path.split('/').at(-1).replaceAll('.', '\\.')));
    entry.type = asset.mime; state.committed.set(asset.path.slice(1), Buffer.from('different committed pixels'));
    await assert.rejects(verifyProductionV85(state.options), /committed asset/);
  }
});

test('the exact V85 worker cache and every recruitment/art precache entry are mandatory', async () => {
  const state = fixture(); const worker = state.remote.get('/sw.js'); const bytes = worker.bytes;
  worker.bytes = Buffer.from(bytes.toString().replace(PRODUCTION_CACHE_V85, PRODUCTION_CACHE_V84));
  await assert.rejects(verifyProductionV85(state.options), /V85 cache/);
  for (const path of [...RECRUITMENT_RUNTIME_PATHS_V85.map(path => '/' + path), ...RUNTIME_ASSET_PATHS_V85]) {
    worker.bytes = Buffer.from(bytes.toString().replace("'" + path + "'", ''));
    await assert.rejects(verifyProductionV85(state.options), /precache/);
  }
});

test('historical HTML, missing gameplay surfaces and wrong build metadata cannot be certified as V85', async () => {
  const state = fixture();
  for (const html of [HTML.replaceAll('v85', 'v84').replaceAll('85.0.0', '84.0.0'),
    HTML.replace('href="/crew-v85.css"', ''), HTML.replace('id="crew-list" class="crew-roster-v85"', ''),
    HTML.replace('id="hub-onboarding-objective-v84"', '')]) {
    state.remote.get('/').bytes = Buffer.from(html); await assert.rejects(verifyProductionV85(state.options));
  }
  state.remote.get('/').bytes = Buffer.from(HTML);
  const build = state.remote.get('/build-info.json'); const original = JSON.parse(build.bytes);
  for (const patch of [{ version: '84.0.0' }, { name: 'Other game' }, { builtAt: 'invalid' }, { artProvider: 'Unknown' }, { content: {} }]) {
    build.bytes = Buffer.from(JSON.stringify({ ...original, ...patch })); await assert.rejects(verifyProductionV85(state.options));
  }
  await assert.rejects(verifyProductionV85({ ...state.options, release: { ...FIXTURE_RELEASE, version: '84.0.0' } }), /Local release must be V85/);
});

for (const [path, wrongMime] of [['/', 'text/plain'], ['/index.html', 'application/json'], ['/sw.js', 'text/html'],
  ['/src/crew-runtime-v85.js', 'text/html'], ['/src/crew-ui-v85.js', 'application/json'],
  ['/crew-v85.css', 'text/javascript'], ['/build-info.json', 'text/html']]) {
  test(`matching bytes still fail if the browser MIME is invalid: ${path}`, async () => {
    const state = fixture(); state.remote.get(path).type = wrongMime;
    await assert.rejects(verifyProductionV85(state.options));
  });
}

test('every Git-tracked V85 proof, including ChatGPT sources and non-ASCII paths, is checked for HTTP 404', async () => {
  const state = fixture();
  const extra = ['docs/references/V85_CHATGPT_RECRUITMENT_SOURCE.md', 'docs/references/v85-any-new-proof/deep/receipt.json',
    'docs/references/v85-team proofs/preuve-équipe.json'];
  state.tracked.push(...extra);
  const report = await verifyProductionV85(state.options);
  for (const path of extra) {
    assert.ok(report.results.some(entry => entry.path === '/' + path && entry.status === 404 && entry.privateEvidence), path);
    state.remote.set('/' + path, { status: 200, bytes: Buffer.from('private source'), type: 'text/plain' });
    await assert.rejects(verifyProductionV85(state.options), /private evidence must not be deployed/);
    state.remote.delete('/' + path);
  }
});

test('failed verification leaves previous evidence untouched; successful local reports never claim production', async t => {
  const temporary = await mkdtemp(join(tmpdir(), 'tantalus-v85-gate-'));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const reportPath = join(temporary, 'local-report.json'); await writeFile(reportPath, 'previous evidence\n');
  const state = fixture(); const entry = state.remote.get('/src/crew-runtime-v85.js'); const original = entry.bytes;
  entry.bytes = Buffer.from('corrupted'); const options = { ...state.options, base: 'http://127.0.0.1:4185', reportPath };
  await assert.rejects(verifyProductionV85(options));
  assert.equal(await readFile(reportPath, 'utf8'), 'previous evidence\n');
  entry.bytes = original; await verifyProductionV85(options);
  const report = JSON.parse(await readFile(reportPath, 'utf8'));
  assert.equal(report.ok, true); assert.equal(report.target, 'local-build'); assert.equal(report.commit, FULL_COMMIT);
});

test('build filtering excludes all V85 private roots before descent, preserving runtime art and public reports', async t => {
  const temporary = await mkdtemp(join(tmpdir(), 'tantalus-v85-filter-'));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const sourceRoot = join(temporary, 'source'), outputRoot = join(temporary, 'output');
  const roots = ['docs/references/V85_PRIVATE', 'docs/references/v85-browser-qa'];
  const privateFiles = [...roots.map(path => path + '/nested/source.png'), 'docs/references/V85_CHATGPT_RECRUITMENT_SOURCE.md',
    'docs/references/v85-team proofs/preuve-équipe.json'];
  const publicFiles = ['docs/VALIDATION_V85.md', 'docs/V85_RECRUITMENT_REPORT.md', 'docs/references/v850-public.json',
    'docs/references/V850_PUBLIC.json', ...RUNTIME_ASSET_PATHS_V85.map(path => path.slice(1)), ...RECRUITMENT_RUNTIME_PATHS_V85];
  for (const path of [...privateFiles, ...publicFiles]) {
    await mkdir(dirname(join(sourceRoot, path)), { recursive: true }); await writeFile(join(sourceRoot, path), 'fixture:' + path);
  }
  const filter = createBuildAssetFilter(sourceRoot), visited = [];
  await cp(sourceRoot, outputRoot, { recursive: true, filter(source) {
    visited.push(relative(sourceRoot, source).replaceAll('\\', '/')); return filter(source);
  } });
  for (const root of roots) { assert.ok(visited.includes(root)); assert.ok(!visited.some(path => path.startsWith(root + '/'))); }
  for (const path of privateFiles) {
    await assert.rejects(access(join(outputRoot, path)), { code: 'ENOENT' });
    assert.equal(await readFile(join(sourceRoot, path), 'utf8'), 'fixture:' + path);
  }
  for (const path of publicFiles) assert.equal(await readFile(join(outputRoot, path), 'utf8'), 'fixture:' + path);
  for (const path of PRIVATE_V85_PROOF_PATHS) assert.equal(filter(join(sourceRoot, path.slice(1))), false);
  const rules = (await readFile('.vercelignore', 'utf8')).split(/\r?\n/u).map(line => line.trim());
  for (const prefix of PRIVATE_V85_PREFIXES) {
    assert.ok(rules.includes(prefix + '*')); assert.ok(rules.includes(prefix + '*/**'));
    assert.ok(!rules.some(rule => rule.startsWith('!' + prefix)));
  }
});

test('current package, lock, release, HTML, worker and QA commands consistently ship V86 without renaming old art', async () => {
  const [pkg, lock, html, worker] = await Promise.all([readFile('package.json', 'utf8').then(JSON.parse),
    readFile('package-lock.json', 'utf8').then(JSON.parse), readFile('index.html', 'utf8'), readFile('sw.js', 'utf8')]);
  assert.equal(RELEASE.version, '86.0.0');
  for (const version of [pkg.version, lock.version, lock.packages[''].version]) assert.equal(version, '86.0.0');
  assert.match(html, /<title>ALIENS: TANTALUS FRONTIER v86<\/title>/u);
  assert.match(html, /<meta name="atf-release" content="86\.0\.0">/u);
  assert.match(html, /href="\/crew-v85\.css"/u);
  assert.match(html, /id="crew-list" class="crew-roster-v85"/u);
  assert.ok(worker.includes('atf-v86-physical-placeables-shell-8'));
  for (const path of [...RUNTIME_ASSET_PATHS_V85, ...RECRUITMENT_RUNTIME_PATHS_V85.map(path => '/' + path)]) assert.ok(worker.includes("'" + path + "'"), path);
  assert.equal(pkg.scripts['verify:production:v85'], 'node scripts/verify-production-v85.mjs');
  assert.equal(pkg.scripts['verify:production:v84'], 'node scripts/verify-production-v84.mjs');
  assert.equal(pkg.scripts['qa:browser:v85'], 'node tests/browser-recruitment-v85.mjs && node tests/browser-crew-runtime-v85.mjs');
  assert.match(pkg.scripts['qa:release'], /npm run qa:browser:v84 && npm run qa:browser:v85 && npm run qa:browser:v86$/u);
});
