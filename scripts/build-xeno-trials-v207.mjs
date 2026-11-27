import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, posix, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileManifestV143, stampXenoTrialsHtmlV207 } from './build-release-v143.mjs';
import { resolveSafeBuildOutput, resolveSafeTrialsBuildOutput } from './build-output-guard.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { XENO_TRIALS_FIGHTERS_V96, XENO_TRIALS_STAGES_V96, getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { normalizeXenoTrialsConfigV96, XENO_TRIALS_STARTERS_V96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsStageAssetsV180 } from '../src/xeno-trials-stage-depth-v180.js';
import { getXenoTrialsStageAssetsV190 } from '../src/xeno-trials-stage-scenes-v190.js';
import { getXenoTrialsFranchiseStageAssetsV192 } from '../src/xeno-trials-franchise-stage-scenes-v192.js';
import { getXenoTrialsCaptureAssetsV163 } from '../src/xeno-trials-capture-v163.js';
import { getXenoTrialsSpriteAtlasV188 } from '../src/xeno-trials-sprite-atlas-v188.js';
import { getXenoTrialsSpriteAtlasV189 } from '../src/xeno-trials-sprite-atlas-v189.js';
import { getXenoTrialsRuntimeSpriteAtlas } from '../src/xeno-trials-sprite-atlas-v191.js';
import { getXenoTrialsRuntimeActionAtlases } from '../src/xeno-trials-action-atlas-v199.js';
import { getEnemyImportAnimationV107 } from '../src/enemy-import-animation-v107.js';
import { getEnemyImportAttackV109 } from '../src/enemy-import-attacks-v109.js';
import { XENO_TRIALS_PROJECTILE_IMAGES_V205, XENO_TRIALS_EFFECT_IMAGES_V205 } from '../src/xeno-trials-visual-assets-v205.js';

const manifestPath = 'xeno-trials.webmanifest';
const entryModule = 'src/xeno-trials-standalone.js';
const launchPage = 'xeno-trials.html';
const digest = value => createHash('sha256').update(value).digest('hex');

function fighterAssets(id, variant) {
  const art = getXenoTrialsArtV96(id, variant);
  const fighter = { id, variant };
  return [art.path, getEnemyImportAnimationV107(art)?.path, getEnemyImportAttackV109(art)?.path,
    getXenoTrialsSpriteAtlasV188(fighter, art)?.texture.path, getXenoTrialsSpriteAtlasV189(fighter, art)?.texture.path,
    getXenoTrialsRuntimeSpriteAtlas(fighter, art)?.texture.path,
    ...getXenoTrialsRuntimeActionAtlases(fighter, art).map(atlas => atlas.texture.path),
    ...getXenoTrialsCaptureAssetsV163([fighter])].filter(Boolean);
}

function stageAssets(stage) {
  return [stage.backdrop, ...getXenoTrialsStageAssetsV180(stage.id), ...getXenoTrialsStageAssetsV190(stage.id),
    ...getXenoTrialsFranchiseStageAssetsV192(stage.id)].filter(Boolean);
}

const icons = [192, 512].flatMap(size => ['any', 'maskable'].map(purpose => ({
  src: `/assets/openai/pwa/tantalus-frontier-${purpose === 'any' ? 'icon' : 'maskable'}-${size}-v68.png`,
  sizes: `${size}x${size}`, type: 'image/png', purpose
})));

function pageWithWorker(html) {
  const workerAnchor = /(<meta name="xeno-trials-worker" content=")(">)/g;
  assert.equal([...html.matchAll(workerAnchor)].length, 1, 'Missing or duplicated standalone worker anchor.');
  return html.replace(workerAnchor, `$1/sw.js$2\n  <link rel="manifest" href="/${manifestPath}">`);
}

export async function planXenoTrialsBuildV207(base, info) {
  const paths = new Set(info.files.map(file => file.path));
  const required = path => {
    assert.ok(paths.has(path) && isPublicDistributionPathV86(path, { built: true }), `Missing public Trials resource: ${path}`);
    return path;
  };
  const html = await readFile(join(base, required(launchPage)), 'utf8');
  const pageRefs = [...html.matchAll(/\b(?:src|href)="\/(?!\/)([^"?#]+)"/g)].map(([, path]) => path);
  const modules = new Set(pageRefs.filter(path => path.endsWith('.js')).map(required));
  const css = new Set(pageRefs.filter(path => path.endsWith('.css')).map(required));
  assert.ok(modules.has(entryModule), 'Trials launch page is missing its entry module.');
  assert.ok(css.has('xeno-trials-standalone.css'), 'Trials launch page is missing its stylesheet.');
  const bootstrapArt = new Set([...pageRefs.filter(path => path.startsWith('assets/')), ...icons.map(icon => icon.src.slice(1))].map(required));
  for (const path of css) {
    const code = await readFile(join(base, path), 'utf8');
    for (const [, ref] of code.matchAll(/url\(\s*['"]?([^\s'"#)]+)['"]?\s*\)/g)) {
      if (/^(?:data:|https?:|\/\/)/i.test(ref)) continue;
      const asset = required(ref.startsWith('/') ? ref.slice(1) : posix.join(posix.dirname(path), ref));
      if (asset.endsWith('.css')) css.add(asset);
      else bootstrapArt.add(asset);
    }
  }
  const audioManifest = required('assets/audio/manifest.json');
  const audio = JSON.parse(await readFile(join(base, audioManifest), 'utf8'));
  const audioAssets = [audioManifest, ...Object.values(audio.tracks).flatMap(tracks => Object.values(tracks)
    .flatMap(track => track.sources.map(source => required(source.path.slice(1)))))];
  const assets = new Set([...bootstrapArt, ...audioAssets]);
  for (const path of modules) {
    assert.notEqual(path, 'src/app.js', 'The Trials package cannot boot the campaign application.');
    const code = await readFile(join(base, path), 'utf8');
    for (const [, spec] of code.matchAll(/(?:from\s*|import\s*\(?\s*)['"](\.[^'"]+|\/src\/[^'"]+)['"]/g)) {
      modules.add(required(spec.startsWith('/') ? spec.slice(1) : posix.join(posix.dirname(path), spec)));
    }
    // Only Trials presentation may contribute optional media literals. The
    // shared registry modules also inventory campaign and source reference art.
    if (!/^src\/(?:xeno-trials|xeno-arbiter)-/.test(path)) continue;
    for (const [, art] of code.matchAll(/['"`](\/assets\/[a-z0-9/_.-]+\.(?:png|webp|jpe?g|json|mp3|wav|ogg|m4a|webm))['"`]/gi)) {
      if (paths.has(art.slice(1))) assets.add(required(art.slice(1)));
    }
  }
  for (const fighter of XENO_TRIALS_FIGHTERS_V96) {
    for (const variant of [null, ...fighter.variants]) {
      for (const art of fighterAssets(fighter.id, variant)) assets.add(required(art.slice(1)));
    }
  }
  for (const stage of XENO_TRIALS_STAGES_V96) {
    for (const art of stageAssets(stage)) assets.add(required(art.slice(1)));
  }
  for (const art of [...Object.values(XENO_TRIALS_PROJECTILE_IMAGES_V205), ...Object.values(XENO_TRIALS_EFFECT_IMAGES_V205)]) {
    assets.add(required(art.slice(1)));
  }
  const starter = normalizeXenoTrialsConfigV96();
  const starterStage = XENO_TRIALS_STAGES_V96.find(stage => stage.id === starter.stageId);
  const starterArt = [...fighterAssets(starter.playerId, starter.playerVariant),
    ...fighterAssets(starter.opponentId, starter.opponentVariant), ...stageAssets(starterStage),
    ...XENO_TRIALS_STARTERS_V96.map(id => getXenoTrialsArtV96(id).path)].map(path => path.slice(1));
  const copyPaths = [...new Set([...modules, ...css, ...assets, required('LICENSE_NOTICE.md')])].sort();
  const shell = ['/', ...[...new Set([manifestPath, ...modules, ...css, ...bootstrapArt, ...audioAssets, ...starterArt])].sort().map(path => '/' + path)];
  return { html: pageWithWorker(html), copyPaths, shell, fighters: XENO_TRIALS_FIGHTERS_V96.length, stages: XENO_TRIALS_STAGES_V96.length };
}

export function xenoTrialsWorkerV207(baseWorker, cacheName, shell) {
  const cacheAnchor = /^const CACHE = 'atf-v143-[a-z0-9-]+';$/m;
  const shellAnchor = /const SHELL = Object\.freeze\(\[[\s\S]*?\n\]\);/;
  const cleanupAnchor = "key.startsWith('atf-')";
  assert.match(baseWorker, cacheAnchor);
  assert.match(baseWorker, shellAnchor);
  assert.ok(baseWorker.includes(cleanupAnchor), 'Unrecognized worker cache cleanup.');
  return baseWorker.replace(cacheAnchor, `const CACHE = '${cacheName}';`)
    .replace(shellAnchor, `const SHELL = Object.freeze(${JSON.stringify(shell, null, 2)});`)
    .replace(cleanupAnchor, "key.startsWith('atf-trials-')");
}

export async function buildXenoTrialsV207(root) {
  const base = resolveSafeBuildOutput(root, process.env.ATF_BUILD_OUTPUT || 'dist');
  const output = resolveSafeTrialsBuildOutput(root);
  const info = JSON.parse(await readFile(join(base, 'build-info.json'), 'utf8'));
  assert.match(info.inputFingerprint, /^[a-f0-9]{64}$/, 'The base distribution must be stamped first.');
  const plan = await planXenoTrialsBuildV207(base, info);
  const cacheName = `atf-trials-v207-${info.inputFingerprint.slice(0, 24)}`;
  const releasePath = 'src/release-info-v143.js';
  const release = (await import(pathToFileURL(join(base, releasePath)).href)).APP_RELEASE_V143;
  const runtime = { ...release, cacheName };
  const baseWorker = await readFile(join(base, 'sw.js'), 'utf8');
  const worker = xenoTrialsWorkerV207(baseWorker, cacheName, plan.shell);
  const html = stampXenoTrialsHtmlV207(plan.html, runtime);
  const manifest = { id: 'xeno-trials', name: 'Xeno Trials', short_name: 'Xeno Trials', start_url: '/', scope: '/',
    display: 'standalone', background_color: '#071019', theme_color: '#071019', icons };

  await rm(output, { recursive: true, force: true });
  for (const path of plan.copyPaths) {
    await mkdir(dirname(join(output, path)), { recursive: true });
    await copyFile(join(base, path), join(output, path));
  }
  await writeFile(join(output, 'index.html'), html);
  await writeFile(join(output, 'sw.js'), worker);
  await writeFile(join(output, manifestPath), JSON.stringify(manifest, null, 2) + '\n');
  await writeFile(join(output, releasePath), `export const APP_RELEASE_V143 = Object.freeze(${JSON.stringify(runtime, null, 2)});\n`);
  const files = await fileManifestV143(output);
  const { version, sourceCommit, buildId, builtAt, saveSchema } = info;
  const result = { product: 'xeno-trials', revision: 207, version, sourceCommit, buildId, builtAt, cacheName, saveSchema,
    baseManifestSha256: info.manifestSha256, manifestSha256: digest(JSON.stringify(files)), fighters: plan.fighters, stages: plan.stages, files };
  await writeFile(join(output, 'build-info.json'), JSON.stringify(result, null, 2) + '\n');
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await buildXenoTrialsV207(process.cwd());
  console.log(`Xeno Trials ${result.buildId} V${result.revision} ready in dist-xeno-trials (${result.files.length} files).`);
}
