import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, posix, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileManifestV143, stampXenoTrialsHtmlV207 } from './build-release-v143.mjs';
import { resolveSafeBuildOutput, resolveSafeTrialsBuildOutput } from './build-output-guard.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { normalizeAudioManifestV77 } from '../src/audio-assets-v77.js';
import { XENO_TRIALS_FACTIONS_V96, XENO_TRIALS_FIGHTERS_V96, XENO_TRIALS_STAGES_V96,
  getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { normalizeXenoTrialsConfigV96, XENO_TRIALS_STARTERS_V96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsOpponentCandidatesV119 } from '../src/xeno-trials-selection-v97.js';
import { getXenoTrialsPoseAssetsV209 } from '../src/xeno-trials-poses-v209.js';
import { getXenoTrialsResearchLabAssetsV209 } from '../src/xeno-trials-research-lab-v209.js';
import { XENO_TRIALS_RESEARCH_FIGHTERS_V210, getXenoTrialsResearchAssetsV210 } from '../src/xeno-trials-research-v210.js';
import { XENO_TRIALS_RESEARCH_MEDIA_V210 } from '../src/xeno-trials-research-media-v210.js';
import { XENO_TRIALS_MENU_ASSETS_V222 } from '../src/xeno-trials-menu-media-v222.js';
import { XENO_TRIALS_FIGHT_EFFECTS_V223, getXenoTrialsArenaAssetsV223 as stageAssets,
  getXenoTrialsFighterAssetsV223 as fighterAssets } from '../src/xeno-trials-offline-v223.js';
import { xenoTrialsOfflineWorkerV223 } from './xeno-trials-offline-worker-v223.mjs';

const manifestPath = 'xeno-trials.webmanifest';
const entryModule = 'src/xeno-trials-standalone.js';
const launchPage = 'xeno-trials.html';
const digest = value => createHash('sha256').update(value).digest('hex');

export const XENO_TRIALS_BUILD_REVISION = 228;
export const xenoTrialsCacheName = fingerprint => `atf-trials-v${XENO_TRIALS_BUILD_REVISION}-${fingerprint.slice(0, 24)}`;

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
  const audio = normalizeAudioManifestV77(JSON.parse(await readFile(join(base, audioManifest), 'utf8')));
  const audioSources = Object.values(audio.tracks).flatMap(tracks => Object.values(tracks).flatMap(track => track.sources));
  const audioAssets = [audioManifest, ...audioSources.map(source => required(source.path.slice(1)))];
  const poseAssets = getXenoTrialsPoseAssetsV209().map(path => required(path.slice(1)));
  const researchMedia = XENO_TRIALS_RESEARCH_MEDIA_V210.map(row => required(row.path.slice(1)));
  const researchAssets = [...getXenoTrialsResearchAssetsV210(), ...getXenoTrialsResearchLabAssetsV209()]
    .map(path => required(path.slice(1)));
  const menuMedia = XENO_TRIALS_MENU_ASSETS_V222.map(path => required(path.slice(1)));
  const assets = new Set([...bootstrapArt, ...audioAssets, ...poseAssets, ...researchAssets, ...researchMedia, ...menuMedia]);
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
  const duelCatalog = {
    effects: XENO_TRIALS_FIGHT_EFFECTS_V223,
    fighters: XENO_TRIALS_FIGHTERS_V96.flatMap(fighter => [null, ...fighter.variants].map(variant =>
      [JSON.stringify([fighter.id, variant]), fighterAssets(fighter.id, variant)])),
    arenas: XENO_TRIALS_STAGES_V96.map(stage => [stage.id, stageAssets(stage)]),
  };
  const duelPaths = new Set([...duelCatalog.effects, ...duelCatalog.fighters.flatMap(([, art]) => art),
    ...duelCatalog.arenas.flatMap(([, art]) => art)]);
  const assetHashes = new Map(info.files.map(file => [file.path, file.sha256]));
  const duelMedia = [...duelPaths].sort().map(path => {
    assets.add(required(path.slice(1)));
    const checksum = assetHashes.get(path.slice(1));
    assert.match(checksum, /^[a-f0-9]{64}$/u, path);
    return [path, checksum];
  });
  const starter = normalizeXenoTrialsConfigV96();
  const starterStage = XENO_TRIALS_STAGES_V96.find(stage => stage.id === starter.stageId);
  const [firstOpponent] = getXenoTrialsOpponentCandidatesV119(XENO_TRIALS_FIGHTERS_V96, XENO_TRIALS_FACTIONS_V96[0]);
  assert.ok(firstOpponent, 'The Trials terminal must have a default opponent.');
  // On a fresh terminal the browser selects the first available form option.
  // The normalizer also supports callers that omit the opponent entirely.
  const entranceFighters = new Set([...XENO_TRIALS_STARTERS_V96, starter.playerId, starter.opponentId, firstOpponent.id]);
  const entranceStages = new Set([XENO_TRIALS_STAGES_V96[0], starterStage]);
  const starterArt = [
    ...[...entranceFighters].flatMap(id => [null, ...getXenoTrialsFighterV96(id).variants].flatMap(variant => fighterAssets(id, variant))),
    ...[...entranceStages].flatMap(stageAssets)
  ].map(path => required(path.slice(1)));
  const copyPaths = [...new Set([...modules, ...css, ...assets, required('LICENSE_NOTICE.md')])].sort();
  const shellPaths = [manifestPath, audioManifest, ...modules, ...css, ...bootstrapArt, ...starterArt, ...poseAssets, ...researchMedia, ...menuMedia]
    .map(path => '/' + path);
  // AudioAssetBankV77 uses the stamped sound hash in the request URL.
  const audioUrls = audioSources.map(({ path, sha256 }) => `${path}?v=${sha256.slice(0, 16)}`);
  const shell = ['/', ...[...new Set([...shellPaths, ...audioUrls])].sort()];
  const researchFighters = new Set(XENO_TRIALS_RESEARCH_FIGHTERS_V210.map(fighter => fighter.id)).size;
  return { html: pageWithWorker(html), copyPaths, shell, duelMedia, duelCatalog, fighters: XENO_TRIALS_FIGHTERS_V96.length,
    researchFighters, stages: XENO_TRIALS_STAGES_V96.length };
}

export function xenoTrialsWorkerV207(baseWorker, cacheName, shell, duelMedia, duelCatalog) {
  const cacheAnchor = /^const CACHE = 'atf-v143-[a-z0-9-]+';$/m;
  const shellAnchor = /const SHELL = Object\.freeze\(\[[\s\S]*?\n\]\);/;
  const cleanupAnchor = "caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('atf-') && key !== CACHE).map(key => caches.delete(key))))";
  assert.match(baseWorker, cacheAnchor);
  assert.match(baseWorker, shellAnchor);
  assert.ok(baseWorker.includes(cleanupAnchor), 'Unrecognized worker cache cleanup.');
  let worker = baseWorker.replace(cacheAnchor, `const CACHE = '${cacheName}';`)
    .replace(shellAnchor, `const SHELL = Object.freeze(${JSON.stringify(shell, null, 2)});`)
    .replace(cleanupAnchor, 'activateOfflineDuelsV225()');
  // Versioned URLs are available offline only when the exact query was stamped
  // into this Trials shell. Keep all other query-bearing requests network-only.
  const versionedAudio = [
    ['const SHELL_PATHS = new Set(SHELL);', `const SHELL_PATHS = new Set(SHELL);
function shellPathV207(request) {
  const url = new URL(request.url);
  return url.pathname + url.search;
}`],
    ['|| url.search || url.username || url.password', '|| (url.search && !SHELL_PATHS.has(url.pathname + url.search)) || url.username || url.password'],
    ['if (SHELL_PATHS.has(path)) return true;', 'if (SHELL_PATHS.has(path + url.search)) return true;'],
    ['!SHELL_PATHS.has(new URL(key.url).pathname)', '!SHELL_PATHS.has(shellPathV207(key))'],
    ['    const path = new URL(request.url).pathname;\n', ''],
    ['if (SHELL_PATHS.has(path)) {', 'if (SHELL_PATHS.has(shellPathV207(request))) {'],
    ['  if (!response) return null;\n  if (cacheableResponseV143(request, response)) return response;\n  await cache.delete(request);\n  return null;',
      '  if (cacheableResponseV143(request, response)) return response;\n  if (response) await cache.delete(request);\n  return readOfflineDuelAssetV223(request);']
  ];
  for (const [anchor, replacement] of versionedAudio) {
    assert.equal(worker.split(anchor).length, 2, `Unrecognized dedicated worker anchor: ${anchor}`);
    worker = worker.replace(anchor, replacement);
  }
  return worker + xenoTrialsOfflineWorkerV223(duelMedia, duelCatalog);
}

export async function buildXenoTrialsV207(root) {
  const base = resolveSafeBuildOutput(root, process.env.ATF_BUILD_OUTPUT || 'dist');
  const output = resolveSafeTrialsBuildOutput(root);
  const info = JSON.parse(await readFile(join(base, 'build-info.json'), 'utf8'));
  assert.match(info.inputFingerprint, /^[a-f0-9]{64}$/, 'The base distribution must be stamped first.');
  const plan = await planXenoTrialsBuildV207(base, info);
  const cacheName = xenoTrialsCacheName(info.inputFingerprint);
  const releasePath = 'src/release-info-v143.js';
  const release = (await import(pathToFileURL(join(base, releasePath)).href)).APP_RELEASE_V143;
  const runtime = { ...release, cacheName };
  const baseWorker = await readFile(join(base, 'sw.js'), 'utf8');
  const worker = xenoTrialsWorkerV207(baseWorker, cacheName, plan.shell, plan.duelMedia, plan.duelCatalog);
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
  const result = { product: 'xeno-trials', revision: XENO_TRIALS_BUILD_REVISION, version, sourceCommit, buildId, builtAt, cacheName, saveSchema,
    baseManifestSha256: info.manifestSha256, manifestSha256: digest(JSON.stringify(files)), fighters: plan.fighters,
    researchFighters: plan.researchFighters, stages: plan.stages, files };
  await writeFile(join(output, 'build-info.json'), JSON.stringify(result, null, 2) + '\n');
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await buildXenoTrialsV207(process.cwd());
  console.log(`Xeno Trials ${result.buildId} V${result.revision} ready in dist-xeno-trials (${result.files.length} files).`);
}
