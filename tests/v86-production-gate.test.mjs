import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { RELEASE, CONTENT_COUNTS } from '../src/content.js';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';
import { CRITICAL_RUNTIME_PATHS_V85 } from '../scripts/verify-production-v85.mjs';
import { verifyProductionV86, CRITICAL_RUNTIME_PATHS_V86, RUNTIME_ASSETS_V86, RUNTIME_ASSET_PATHS_V86, PLACEABLE_RUNTIME_PATHS_V86, PRIVATE_V86_PROOF_PATHS, PRODUCTION_CACHE_V86 } from '../scripts/verify-production-v86.mjs';

const commit = '1234567890abcdef1234567890abcdef12345678';
const source = new Map(await Promise.all([...new Set([...CRITICAL_RUNTIME_PATHS_V86, ...RUNTIME_ASSETS_V86.map(asset => asset.path.slice(1))])].map(async path => [path, await readFile(path)])));
function fixture() {
  const remote = new Map([...source].map(([path, bytes]) => ['/' + path, { bytes, type: path.endsWith('.css') ? 'text/css' : path.endsWith('.html') ? 'text/html' : path.endsWith('.png') ? 'image/png' : path.endsWith('.webp') ? 'image/webp' : 'text/javascript' }]));
  remote.set('/', remote.get('/index.html'));
  remote.set('/build-info.json', { type: 'application/json', bytes: JSON.stringify({ name: RELEASE.name, version: RELEASE.version, sourceVersion: RELEASE.sourceVersion, content: CONTENT_COUNTS, builtAt: '2026-09-13T12:00:00Z', artProvider: 'OpenAI ImageGen' }) });
  const privatePath = 'docs/references/v86-autre/épreuve privée.png';
  const spawn = (cmd, args) => {
    assert.equal(cmd, 'git');
    if (args[0] === 'rev-parse') return { status: 0, stdout: commit + '\n' };
    if (args[0] === 'ls-tree') { assert.ok(args.includes('-z')); return { status: 0, stdout: privatePath + '\0' }; }
    assert.equal(args[0], 'show'); assert.ok(args[1].startsWith(commit + ':'));
    const bytes = source.get(args[1].slice(41));
    return bytes ? { status: 0, stdout: bytes } : { status: 1, stderr: 'missing' };
  };
  const requests = [];
  const fetchImpl = async url => {
    const path = decodeURIComponent(new URL(url).pathname); requests.push(path);
    const entry = remote.get(path);
    return new Response(entry?.bytes || 'missing', { status: entry ? 200 : 404, headers: { 'content-type': entry?.type || 'text/plain' } });
  };
  return { remote, requests, privatePath, options: { commit, base: 'http://127.0.0.1:4188', spawn, fetchImpl, reportPath: null } };
}
test('V86 extends every prior critical integration with five placeable modules and four unchanged bitmap hashes', () => {
  assert.deepEqual(CRITICAL_RUNTIME_PATHS_V86, [...CRITICAL_RUNTIME_PATHS_V85, ...PLACEABLE_RUNTIME_PATHS_V86]);
  assert.equal(CRITICAL_RUNTIME_PATHS_V86.length, 57); assert.equal(new Set(CRITICAL_RUNTIME_PATHS_V86).size, 57);
  assert.equal(RUNTIME_ASSETS_V86.length, 16); assert.equal(new Set(RUNTIME_ASSET_PATHS_V86).size, 16);
  assert.equal(RUNTIME_ASSETS_V86.filter(item => item.kind === 'existing-placeable-bitmap').length, 4);
  assert.ok(!RUNTIME_ASSETS_V86.some(item => /barricade/.test(item.path)));
});
test('V86 HTTP gate verifies actual repository bytes, exact image MIME and discovered private proof 404s', async () => {
  const f = fixture(), report = await verifyProductionV86(f.options);
  assert.equal(report.ok, true); assert.equal(report.release, '86.0.0'); assert.equal(report.target, 'local-build');
  assert.equal(report.cache, PRODUCTION_CACHE_V86); assert.equal(report.totals.criticalRuntime, 57);
  assert.ok(f.requests.includes('/' + f.privatePath));
});
for (const path of PLACEABLE_RUNTIME_PATHS_V86) test('V86 refuses a changed published module: ' + path, async () => {
  const f = fixture(); f.remote.set('/' + path, { bytes: 'corrupt', type: path.endsWith('.css') ? 'text/css' : 'text/javascript' });
  await assert.rejects(verifyProductionV86(f.options));
});
test('V86 refuses exposed candidate art, malformed PNG MIME, missing precache and old release', async () => {
  let f = fixture(); f.remote.set(PRIVATE_V86_PROOF_PATHS[1], { bytes: 'private-image', type: 'image/png' }); await assert.rejects(verifyProductionV86(f.options));
  f = fixture(); f.remote.get(RUNTIME_ASSETS_V86.at(-1).path).type = 'application/octet-stream'; await assert.rejects(verifyProductionV86(f.options));
  f = fixture(); f.remote.get('/sw.js').bytes = Buffer.from(String(f.remote.get('/sw.js').bytes).replace(PRODUCTION_CACHE_V86, 'old-cache')); await assert.rejects(verifyProductionV86(f.options));
  f = fixture(); await assert.rejects(verifyProductionV86({ ...f.options, release: { ...RELEASE, version: '85.0.0' } }));
});
test('V86 candidates and source archives stay out of the build, while the runtime sheets and styles remain', () => {
  const root = process.cwd(), filter = createBuildAssetFilter(root);
  for (const path of PRIVATE_V86_PROOF_PATHS) assert.equal(filter(join(root, path.slice(1))), false, path);
  for (const path of [...PLACEABLE_RUNTIME_PATHS_V86, ...RUNTIME_ASSET_PATHS_V86.map(path => path.slice(1))]) assert.equal(filter(join(root, path)), true, path);
});
