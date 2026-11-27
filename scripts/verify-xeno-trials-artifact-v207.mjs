import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { fileManifestV143, stampXenoTrialsHtmlV207 } from './build-release-v143.mjs';
import { resolveSafeBuildOutput, resolveSafeTrialsBuildOutput } from './build-output-guard.mjs';
import { planXenoTrialsBuildV207, xenoTrialsWorkerV207 } from './build-xeno-trials-v207.mjs';

export async function verifyXenoTrialsArtifactV207(root) {
  const base = resolveSafeBuildOutput(root, process.env.ATF_BUILD_OUTPUT || 'dist');
  const output = resolveSafeTrialsBuildOutput(root);
  const baseInfo = JSON.parse(await readFile(join(base, 'build-info.json'), 'utf8'));
  const info = JSON.parse(await readFile(join(output, 'build-info.json'), 'utf8'));
  const shipped = await fileManifestV143(output);
  assert.deepEqual(shipped, info.files, 'Standalone files differ from the Trials manifest.');
  assert.equal(createHash('sha256').update(JSON.stringify(shipped)).digest('hex'), info.manifestSha256);
  assert.equal(info.product, 'xeno-trials');
  assert.equal(info.revision, 207);
  assert.equal(info.baseManifestSha256, baseInfo.manifestSha256);
  assert.equal(info.cacheName, `atf-trials-v207-${baseInfo.inputFingerprint.slice(0, 24)}`);
  for (const field of ['version', 'buildId', 'builtAt', 'sourceCommit', 'saveSchema']) assert.equal(info[field], baseInfo[field], field);

  const releasePath = 'src/release-info-v143.js';
  const baseRelease = (await import(pathToFileURL(join(base, releasePath)).href)).APP_RELEASE_V143;
  const release = (await import(pathToFileURL(join(output, releasePath)).href)).APP_RELEASE_V143;
  assert.deepEqual(release, { ...baseRelease, cacheName: info.cacheName });
  const plan = await planXenoTrialsBuildV207(base, baseInfo);
  const html = await readFile(join(output, 'index.html'), 'utf8');
  assert.equal(html, stampXenoTrialsHtmlV207(plan.html, release));
  assert.equal(info.fighters, plan.fighters);
  assert.equal(info.stages, plan.stages);
  const copied = new Set(plan.copyPaths.filter(path => path !== releasePath));
  assert.deepEqual(shipped.map(row => row.path), [...copied, releasePath, 'index.html', 'sw.js', 'xeno-trials.webmanifest'].sort());
  assert.deepEqual(shipped.filter(row => copied.has(row.path)), baseInfo.files.filter(row => copied.has(row.path)), 'Shared Trials files differ from the base release.');

  const worker = await readFile(join(output, 'sw.js'), 'utf8');
  assert.equal(worker, xenoTrialsWorkerV207(await readFile(join(base, 'sw.js'), 'utf8'), info.cacheName, plan.shell));
  const origin = 'https://xeno-trials.example';
  const context = vm.createContext({ self: { addEventListener() {}, location: { origin } }, URL });
  vm.runInContext(worker + ';globalThis.checked={CACHE,SHELL,cacheableRequestV143};', context);
  assert.equal(context.checked.CACHE, info.cacheName);
  assert.deepEqual(Array.from(context.checked.SHELL), plan.shell);
  const paths = new Set(shipped.map(row => '/' + row.path));
  for (const path of plan.shell) {
    const url = new URL(path, origin);
    assert.ok(path === '/' || paths.has(url.pathname), `Missing standalone offline resource: ${path}`);
    const request = new Request(url);
    assert.equal(context.checked.cacheableRequestV143(request), true, path);
    if (url.search) {
      assert.match(path, /^\/assets\/audio\/(?:sfx|music)\/[a-z0-9_-]+\.[a-z]+\?v=[a-f0-9]{16}$/);
      url.searchParams.set('unexpected', '1');
      assert.equal(context.checked.cacheableRequestV143(new Request(url)), false, 'Unlisted query cannot enter the Trials cache.');
    }
  }

  const manifest = JSON.parse(await readFile(join(output, 'xeno-trials.webmanifest'), 'utf8'));
  assert.equal(manifest.name, 'Xeno Trials');
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  for (const icon of manifest.icons) assert.ok(paths.has(icon.src), `Missing Trials install icon: ${icon.src}`);
  return { ok: true, buildId: info.buildId, sourceCommit: info.sourceCommit, fighters: info.fighters, stages: info.stages,
    files: shipped.length, bytes: shipped.reduce((sum, file) => sum + file.bytes, 0), shell: plan.shell.length, manifestSha256: info.manifestSha256 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await verifyXenoTrialsArtifactV207(process.cwd()), null, 2));
}
