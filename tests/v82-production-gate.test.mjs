import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { CONTENT_COUNTS, RELEASE } from '../src/content.js';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';
import { CRITICAL_RUNTIME_PATHS_V81, RUNTIME_ASSET_PATHS_V81 } from '../scripts/verify-production-v81.mjs';
import {
  CRITICAL_RUNTIME_PATHS_V82, MODULAR_RUNTIME_ASSETS_V82, PRIVATE_V82_PREFIXES, PRIVATE_V82_PROOF_PATHS,
  PRODUCTION_CACHE_V82, PRODUCTION_REPORT_PATH_V82, PRODUCTION_VERSION_V82, RUNTIME_ASSETS_V82,
  RUNTIME_ASSET_PATHS_V82, REPORT_PATHS_V82, classifyVerificationTargetV82, verifyProductionV82
} from '../scripts/verify-production-v82.mjs';

const FULL_COMMIT = '1234567890abcdef1234567890abcdef12345678';

async function fixture() {
  const html = '<title>ALIENS: TANTALUS FRONTIER v82</title>\nVERSION 82.0.0\n<meta name="atf-release" content="82.0.0">\n<canvas id="hub-canvas"></canvas>\n<button data-proving-ground-control-v81></button>\n<section id="bioforge-ui-v80"></section>\n';
  const committed = new Map(CRITICAL_RUNTIME_PATHS_V82.map(path => [path, Buffer.from(path + '\nfixture\n')]));
  committed.set('index.html', Buffer.from(html));
  committed.set('sw.js', Buffer.from(PRODUCTION_CACHE_V82 + '\n' + RUNTIME_ASSET_PATHS_V82.map(path => `'${path}'`).join('\n')));
  for (const asset of RUNTIME_ASSETS_V82) committed.set(asset.path.slice(1), await readFile(asset.path.slice(1)));
  const remote = new Map([...committed].map(([path, bytes]) => ['/' + path, { status: 200, bytes,
    type: RUNTIME_ASSETS_V82.find(asset => asset.path === '/' + path)?.mime || 'text/javascript' }]));
  remote.set('/', { status: 200, bytes: Buffer.from(html), type: 'text/html' });
  remote.set('/build-info.json', { status: 200, type: 'application/json', bytes: Buffer.from(JSON.stringify({
    name: RELEASE.name, version: PRODUCTION_VERSION_V82, sourceVersion: RELEASE.sourceVersion,
    content: CONTENT_COUNTS, builtAt: '2026-09-12T00:00:00.000Z', artProvider: 'OpenAI ImageGen'
  })) });
  const calls = [];
  const spawn = (command, args) => {
    calls.push({ command, args });
    assert.equal(command, 'git');
    if (args[0] === 'rev-parse') return { status: 0, stdout: FULL_COMMIT + '\n' };
    if (args[0] === 'ls-tree') return { status: 0, stdout: Buffer.from('docs/references/v82-unlisted-private/proof.json\n') };
    assert.equal(args[0], 'show');
    assert.ok(args[1].startsWith(FULL_COMMIT + ':'), 'every comparison must use the resolved commit');
    const bytes = committed.get(args[1].slice(41));
    return bytes ? { status: 0, stdout: bytes } : { status: 1, stderr: 'missing committed file' };
  };
  const fetchImpl = async url => {
    const entry = remote.get(new URL(url).pathname) || { status: 404, bytes: Buffer.from('missing'), type: 'text/plain' };
    return new Response(entry.bytes, { status: entry.status, headers: { 'content-type': entry.type } });
  };
  return { remote, calls, options: { commit: '1234567', base: 'https://fixture.invalid', fetchImpl, spawn, reportPath: null } };
}

test('V82 keeps every V81 runtime gate and adds title plus independent wall and ceiling', () => {
  assert.equal(PRODUCTION_VERSION_V82, '82.0.0');
  assert.equal(PRODUCTION_CACHE_V82, 'atf-v82-modular-proving-shell-1');
  assert.equal(PRODUCTION_REPORT_PATH_V82, 'docs/references/v82-release-qa/production-http.json');
  assert.deepEqual(CRITICAL_RUNTIME_PATHS_V82, [...CRITICAL_RUNTIME_PATHS_V81, 'src/title-scene-v79.js']);
  assert.equal(new Set(CRITICAL_RUNTIME_PATHS_V82).size, 35);
  assert.deepEqual(RUNTIME_ASSET_PATHS_V82.slice(0, 10), RUNTIME_ASSET_PATHS_V81);
  assert.equal(new Set(RUNTIME_ASSET_PATHS_V82).size, 12);
});

test('V82 verifies committed text, exact assets and discovered private evidence with mocked HTTP/Git', async () => {
  const { options, calls } = await fixture();
  const report = await verifyProductionV82(options);
  assert.equal(report.ok, true);
  assert.equal(report.target, 'preview');
  assert.equal(report.commit, FULL_COMMIT);
  assert.equal(report.totals.runtimeAssets, 12);
  assert.equal(report.totals.modularProvingAssets, 2);
  assert.ok(report.results.some(result => result.path === '/docs/references/v82-unlisted-private/proof.json'
    && result.status === 404 && result.privateEvidence));
  assert.ok(calls.some(call => call.args[0] === 'ls-tree' && call.args.includes(FULL_COMMIT)));
  assert.ok(calls.some(call => call.args[1] === FULL_COMMIT + ':src/title-scene-v79.js'));
});

test('V82 distinguishes canonical production, local builds and previews without network requests', async () => {
  const cases = [
    ['https://aliens-tantalus-frontier.vercel.app', 'production'],
    ['http://127.0.0.1:4176', 'local-build'],
    ['http://localhost:4176', 'local-build'],
    ['http://[::1]:4176', 'local-build'],
    ['https://aliens-tantalus-frontier-preview.vercel.app', 'preview'],
    ['https://aliens-tantalus-frontier.vercel.app.evil.invalid', 'preview']
  ];
  for (const [base, expected] of cases) {
    assert.equal(classifyVerificationTargetV82(base), expected, base);
    const { options } = await fixture();
    const report = await verifyProductionV82({ ...options, base });
    assert.equal(report.target, expected, base);
    assert.equal(report.base, base);
  }
  assert.equal(REPORT_PATHS_V82.production, PRODUCTION_REPORT_PATH_V82);
  assert.equal(REPORT_PATHS_V82['local-build'], 'docs/references/v82-release-qa/local-build-http.json');
  assert.equal(REPORT_PATHS_V82.preview, 'docs/references/v82-release-qa/preview-http.json');
  assert.throws(() => classifyVerificationTargetV82('file:///private'), /HTTP/);
});

test('V82 tolerates only newline changes and rejects modified title runtime bytes', async () => {
  const state = await fixture();
  const entry = state.remote.get('/src/title-scene-v79.js');
  entry.bytes = Buffer.from(entry.bytes.toString().replaceAll('\n', '\r\n'));
  const report = await verifyProductionV82(state.options);
  assert.equal(report.results.find(result => result.path === '/src/title-scene-v79.js').parity, 'line-ending-normalized');
  entry.bytes = Buffer.concat([entry.bytes, Buffer.from('modified')]);
  await assert.rejects(verifyProductionV82(state.options), /production text.*title-scene/);
});

test('V82 rejects an altered ceiling image and a private proof served with HTTP200', async () => {
  const state = await fixture();
  const beam = state.remote.get(MODULAR_RUNTIME_ASSETS_V82[1].path);
  const original = beam.bytes;
  beam.bytes = Buffer.from('wrong pixels');
  await assert.rejects(verifyProductionV82(state.options), /production asset.*ceiling/);
  beam.bytes = original;
  state.remote.set('/docs/references/v82-unlisted-private/proof.json', {
    status: 200, bytes: Buffer.from('{}'), type: 'application/json'
  });
  await assert.rejects(verifyProductionV82(state.options), /private evidence must not be deployed/);
});

test('V82 private proofs are filtered locally and excluded by Vercel while runtime images remain public', async () => {
  const filter = createBuildAssetFilter(process.cwd());
  for (const path of PRIVATE_V82_PROOF_PATHS) assert.equal(filter(join(process.cwd(), path.slice(1))), false, path);
  for (const prefix of PRIVATE_V82_PREFIXES) assert.equal(filter(join(process.cwd(), prefix + 'future/proof.json')), false, prefix);
  for (const path of RUNTIME_ASSET_PATHS_V82) assert.equal(filter(join(process.cwd(), path.slice(1))), true, path);
  const rules = (await readFile('.vercelignore', 'utf8')).split(/\r?\n/u).map(line => line.trim());
  for (const prefix of PRIVATE_V82_PREFIXES) {
    assert.ok(rules.includes(prefix + '*'), prefix);
    assert.ok(rules.includes(prefix + '*/**'), prefix);
    assert.ok(!rules.some(rule => rule.startsWith('!' + prefix)), prefix);
  }
});

test('V82 image descriptors agree with the effective hub registry and recorded art hashes', async () => {
  const { HUB_ANNEX_MODULE_ART_V82 } = await import('../src/hub-v71-runtime.js');
  const audit = JSON.parse(await readFile('docs/references/v82-proving-ground-art/art-audit.json', 'utf8'));
  for (const asset of MODULAR_RUNTIME_ASSETS_V82) {
    const hubAsset = HUB_ANNEX_MODULE_ART_V82[asset.id];
    assert.equal(typeof hubAsset === 'string' ? hubAsset : hubAsset?.src || hubAsset?.path, asset.path, asset.id);
    assert.equal(audit.assets.find(entry => '/' + entry.output === asset.path)?.outputSha256, asset.sha256, asset.id);
  }
});
