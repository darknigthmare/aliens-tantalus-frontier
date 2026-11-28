import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { fileManifestV143, stampXenoTrialsHtmlV207 } from './build-release-v143.mjs';
import { resolveSafeBuildOutput, resolveSafeTrialsBuildOutput } from './build-output-guard.mjs';
import { planXenoTrialsBuildV207, xenoTrialsWorkerV207, xenoTrialsCacheName, XENO_TRIALS_BUILD_REVISION } from './build-xeno-trials-v207.mjs';
import { XENO_TRIALS_FACTIONS_V96, XENO_TRIALS_FIGHTERS_V96, XENO_TRIALS_STAGES_V96,
  getXenoTrialsArtV96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_STARTERS_V96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsOpponentCandidatesV119 } from '../src/xeno-trials-selection-v97.js';
import { XENO_TRIALS_MENU_ATLASES_V222 } from '../src/xeno-trials-menu-atlases-v222.js';
import { getXenoTrialsOfflineDuelV223 } from '../src/xeno-trials-offline-v223.js';

export async function verifyXenoTrialsArtifactV207(root) {
  const base = resolveSafeBuildOutput(root, process.env.ATF_BUILD_OUTPUT || 'dist');
  const output = resolveSafeTrialsBuildOutput(root);
  const baseInfo = JSON.parse(await readFile(join(base, 'build-info.json'), 'utf8'));
  const info = JSON.parse(await readFile(join(output, 'build-info.json'), 'utf8'));
  const shipped = await fileManifestV143(output);
  assert.deepEqual(shipped, info.files, 'Standalone files differ from the Trials manifest.');
  assert.equal(createHash('sha256').update(JSON.stringify(shipped)).digest('hex'), info.manifestSha256);
  assert.equal(info.product, 'xeno-trials');
  assert.equal(info.revision, XENO_TRIALS_BUILD_REVISION);
  assert.equal(info.baseManifestSha256, baseInfo.manifestSha256);
  assert.equal(info.cacheName, xenoTrialsCacheName(baseInfo.inputFingerprint));
  for (const field of ['version', 'buildId', 'builtAt', 'sourceCommit', 'saveSchema']) assert.equal(info[field], baseInfo[field], field);

  const releasePath = 'src/release-info-v143.js';
  const baseRelease = (await import(pathToFileURL(join(base, releasePath)).href)).APP_RELEASE_V143;
  const release = (await import(pathToFileURL(join(output, releasePath)).href)).APP_RELEASE_V143;
  assert.deepEqual(release, { ...baseRelease, cacheName: info.cacheName });
  const plan = await planXenoTrialsBuildV207(base, baseInfo);
  const html = await readFile(join(output, 'index.html'), 'utf8');
  assert.equal(html, stampXenoTrialsHtmlV207(plan.html, release));
  assert.equal(info.fighters, plan.fighters);
  assert.equal(info.researchFighters, plan.researchFighters);
  assert.equal(info.stages, plan.stages);
  const copied = new Set(plan.copyPaths.filter(path => path !== releasePath));
  assert.deepEqual(shipped.map(row => row.path), [...copied, releasePath, 'index.html', 'sw.js', 'xeno-trials.webmanifest'].sort());
  assert.deepEqual(shipped.filter(row => copied.has(row.path)), baseInfo.files.filter(row => copied.has(row.path)), 'Shared Trials files differ from the base release.');

  const worker = await readFile(join(output, 'sw.js'), 'utf8');
  assert.equal(worker, xenoTrialsWorkerV207(await readFile(join(base, 'sw.js'), 'utf8'), info.cacheName, plan.shell, plan.duelMedia, plan.duelCatalog));
  const origin = 'https://xeno-trials.example';
  const context = vm.createContext({ self: { addEventListener() {}, location: { origin } }, URL });
  vm.runInContext(worker + ';globalThis.checked={CACHE,SHELL,DUEL_MEDIA_V223,offlineDuelRecipeV225,cacheableRequestV143};', context);
  assert.equal(context.checked.CACHE, info.cacheName);
  assert.deepEqual(Array.from(context.checked.SHELL), plan.shell);
  const paths = new Set(shipped.map(row => '/' + row.path));
  const fingerprints = new Map(shipped.map(row => ['/' + row.path, row.sha256]));
  for (const [path, hash] of context.checked.DUEL_MEDIA_V223) assert.equal(fingerprints.get(path), hash, path);
  const verifyRecipe = config => {
    const duel = getXenoTrialsOfflineDuelV223(config);
    const declared = context.checked.offlineDuelRecipeV225(duel.selection);
    assert.equal(declared?.key, duel.key);
    assert.deepEqual(Array.from(declared.assets), duel.assets, duel.key);
  };
  for (const fighter of XENO_TRIALS_FIGHTERS_V96) for (const variant of [null, ...fighter.variants]) {
    verifyRecipe({ playerId: fighter.id, playerVariant: variant });
    verifyRecipe({ opponentId: fighter.id, opponentVariant: variant });
  }
  for (const stage of XENO_TRIALS_STAGES_V96) verifyRecipe({ stageId: stage.id });
  const offlinePaths = new Set(context.checked.SHELL);
  for (const atlas of Object.values(XENO_TRIALS_MENU_ATLASES_V222)) {
    assert.ok(offlinePaths.has(atlas.path), `Missing offline menu atlas: ${atlas.path}`);
    assert.equal(shipped.find(file => '/' + file.path === atlas.path)?.sha256, atlas.sha256, atlas.path);
  }
  // This checks the base images needed by an untouched terminal before any
  // roster portrait or match asset has been warmed by a live request.
  const [defaultOpponent] = getXenoTrialsOpponentCandidatesV119(XENO_TRIALS_FIGHTERS_V96, XENO_TRIALS_FACTIONS_V96[0]);
  for (const id of [...XENO_TRIALS_STARTERS_V96, defaultOpponent.id]) {
    for (const variant of [null, ...getXenoTrialsFighterV96(id).variants]) {
      const { path } = getXenoTrialsArtV96(id, variant);
      assert.ok(offlinePaths.has(path), `Fresh Trials terminal does not precache ${id} (${variant ?? 'default'}): ${path}`);
    }
  }
  const defaultBackdrop = XENO_TRIALS_STAGES_V96[0].backdrop;
  assert.ok(!defaultBackdrop || offlinePaths.has(defaultBackdrop), 'The first arena backdrop must be in the Trials offline shell.');
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
  return { ok: true, revision: info.revision, buildId: info.buildId, sourceCommit: info.sourceCommit, fighters: info.fighters,
    researchFighters: info.researchFighters, stages: info.stages,
    files: shipped.length, bytes: shipped.reduce((sum, file) => sum + file.bytes, 0), shell: plan.shell.length, manifestSha256: info.manifestSha256 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await verifyXenoTrialsArtifactV207(process.cwd()), null, 2));
}
