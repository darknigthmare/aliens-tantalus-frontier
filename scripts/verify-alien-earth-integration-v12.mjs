import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile, mkdtemp, readdir, rm, writeFile, symlink, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { TitleScreenController } from '../src/title-screen-v61.js';
import { AudioDirector } from '../src/audio.js';
import { EARTH_MODULE_ROOT_V12, EARTH_RUNTIME_ROOT_V12, EARTH_RUNTIME_FILES_V12, EARTH_RASTER_FILES_V12,
  EARTH_SOURCE_ONLY_V12, EARTH_RECOVERY_V11, EARTH_RECOVERY_SHA256_V11,
  publicEarthDlcPathAdmissionV12, verifyEarthDlcV12 } from './public-alien-earth-dlc-admissions.mjs';
import { buildAlienEarthDlc, renderEarthStandaloneV12, earthModuleGraphV12 } from './build-alien-earth-dlc.mjs';
import { EARTH_MAIN_SUCCESSORS_V12, reviewedEarthMainDigestV12, verifyEarthMainSuccessionV12 } from './audit-native-qa-resources-v187.mjs';
import { EARTH_RASTER_ASSETS_V12 } from '../modules/alien-earth/v12/src/alien-earth-raster-v12.js';
import { isPublicDistributionPathV86, isPublicDistributionTextV86 } from './verify-public-release-v86.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFile(join(root, path), 'utf8');
async function temporary(t) {
  const path = await mkdtemp(join(tmpdir(), 'earth-v12-'));
  t.after(() => rm(path, { recursive: true, force: true })); return path;
}
test('Earth title action is optional, ordered and preserves existing actions', () => {
  const buttons = Object.fromEntries(['continueButton', 'newButton', 'dlcButton', 'aliens1986Button', 'alienEarthButton', 'forgeButton', 'optionsButton'].map(key => [key, { id: key }]));
  const context = { ...buttons, root: { hidden: false }, state: 'menu', cancelNewTimelineConfirmation() {}, onAlienEarth: () => true };
  assert.deepEqual(TitleScreenController.prototype.menuButtons.call(context), Object.values(buttons));
  assert.equal(TitleScreenController.prototype.openAlienEarth.call(context), true);
  context.root.hidden = true; assert.equal(TitleScreenController.prototype.openAlienEarth.call(context), false);
  context.root.hidden = false; context.state = 'idle'; assert.equal(TitleScreenController.prototype.openAlienEarth.call(context), false);
  context.state = 'menu'; context.onAlienEarth = () => false; assert.equal(TitleScreenController.prototype.openAlienEarth.call(context), false);
  delete context.alienEarthButton; assert.equal(TitleScreenController.prototype.menuButtons.call(context).length, 6);
});

function launchHarness(source, refuses = false) {
  const start = source.indexOf('  onAlienEarth: () => {'), end = source.indexOf('  onOptions:', start);
  assert.ok(start > 0 && end > start);
  const events = [], context = vm.createContext({
    leavingForEarthV12: false, audioSceneBeforeEarthV12: null, hubEngine: { stop: arg => events.push(['hub', arg]) },
    engine: { stop: () => events.push(['engine']) },
    bioforgeRuntimeV80: { stopBioforgeEngineOnlyV80: () => events.push(['bioforge-engine-only']) },
    audio: { scene: 'menu', disposed: false,
      setScene(value) { this.scene = value; events.push(['scene', value]); },
      unlock: async () => { events.push(['unlock']); return true; },
      stopEffects: () => events.push(['effects']), stopMusic: value => events.push(['music', value]),
      dispose() { this.disposed = true; events.push(['dispose']); } },
    titleScreen: { liveStatus: { textContent: '' } },
    location: { assign: url => { if (refuses) throw Error('Navigation refused'); events.push(['navigate', url]); } },
  });
  vm.runInContext('globalThis.launch = ({' + source.slice(start, end) + '}).onAlienEarth;', context);
  return { context, events };
}
function hostPageEvents(source) {
  const start = source.indexOf("  globalThis.addEventListener('pagehide'", source.indexOf('async function boot()'));
  const end = source.indexOf("  if ('serviceWorker'", start);
  assert.ok(start > 0 && end > start); return source.slice(start, end);
}
test('real host launch stops only runtimes and unload skips native persistence', async () => {
  const source = await read('src/app.js'), h = launchHarness(source);
  assert.equal(h.context.launch(), true); assert.equal(h.context.leavingForEarthV12, true);
  assert.deepEqual(h.events, [['hub', false], ['engine'], ['bioforge-engine-only'], ['scene', null], ['effects'], ['music', 0], ['navigate', '/dlc/alien-earth/v12/index.html']]);
  const beforeUnload = h.events.length;
  assert.equal(h.context.launch(), false); assert.equal(h.events.length, beforeUnload);
  const start = source.indexOf("  globalThis.addEventListener('beforeunload', () => {");
  const end = source.indexOf('\n  bindDelegatedActions();', start); assert.ok(start > 0 && end > start);
  h.context.addEventListener = (_type, callback) => { h.context.unload = callback; };
  vm.runInContext(source.slice(start, end), h.context); h.context.unload();
  assert.equal(h.events.length, beforeUnload); assert.equal(h.context.audio.disposed, false);
  const events = new Map();
  Object.assign(h.context, { addEventListener: (type, callback) => events.set(type, callback),
    clearInterval() {}, galaxyJumpTimerV116: 1, startGalaxyJumpSchedulerV116() {} });
  vm.runInContext(hostPageEvents(source), h.context);
  events.get('pagehide')({ persisted: false });
  assert.deepEqual(h.events.at(-1), ['dispose']);
});
test('refused host navigation clears the flag and leaves the title usable', async () => {
  const h = launchHarness(await read('src/app.js'), true);
  assert.equal(h.context.launch(), false); assert.equal(h.context.leavingForEarthV12, false);
  assert.match(h.context.titleScreen.liveStatus.textContent, /profil Tantalus est conservé/);
  assert.equal(h.context.audio.scene, 'menu'); assert.equal(h.context.audioSceneBeforeEarthV12, null);
  assert.equal(h.context.audio.disposed, false);
});
test('a cached host return restores native mission and profile persistence on later unload', async () => {
  const source = await read('src/app.js'), h = launchHarness(source);
  assert.equal(h.context.launch(), true);
  const listeners = new Map();
  Object.assign(h.context, {
    addEventListener: (type, callback) => listeners.set(type, callback),
    startGalaxyJumpSchedulerV116: () => h.events.push(['scheduler']),
    clearInterval() {}, galaxyJumpTimerV116: 1,
    disposePlayerAppearancePreviewV126: () => h.events.push(['preview-dispose']),
    creatorOwnerV84: null, standaloneContext: null, sessionStart: Date.now(),
    hubDialogueUiV76: { destroy: () => h.events.push(['dialogue-dispose']) },
    persistMissionResumeState: () => h.events.push(['mission-save']),
    saveSystem: { recoveryNeeded: false, data: { needsPlayerCreationV84: false, statistics: { playSeconds: 0 } },
      commit: () => h.events.push(['native-save']) },
  });
  h.context.bioforgeRuntimeV80.stop = () => h.events.push(['forge-suspend']);
  const start = source.indexOf("  globalThis.addEventListener('beforeunload', () => {");
  const end = source.indexOf('\n  bindDelegatedActions();', start);
  assert.ok(start > 0 && end > start);
  vm.runInContext(source.slice(start, end) + '\n' + hostPageEvents(source), h.context);
  listeners.get('beforeunload')(); listeners.get('pagehide')({ persisted: true });
  assert.equal(h.context.audio.disposed, false); assert.equal(h.context.audio.scene, null);
  listeners.get('pageshow')({ persisted: true });
  assert.equal(h.context.audio.scene, 'menu'); assert.equal(h.context.audioSceneBeforeEarthV12, null);
  assert.equal(h.events.filter(event => event[0] === 'unlock').length, 1);
  assert.equal(h.context.leavingForEarthV12, false);
  assert.deepEqual(h.events.at(-1), ['scheduler']);
  listeners.get('beforeunload')();
  assert.equal(h.events.filter(event => event[0] === 'mission-save').length, 1);
  assert.equal(h.events.filter(event => event[0] === 'native-save').length, 1);
});
function returnHarness(source, options = {}) {
  const start = source.indexOf('function returnHostV12('), end = source.indexOf('\nfunction sound', start);
  const pageshow = source.split('\n').find(line => line.includes("addEventListener('pageshow'"));
  const events = [], listeners = new Map(), context = vm.createContext({
    URL, hostReturnUrlV12: '/', hostNavigationPendingV12: null,
    started: true, engine: { dead: false }, protectSave: false,
    saveError: 'Storage unavailable', save: () => true, keys: new Set(['ArrowRight']),
    open: (type, html) => events.push([type, html]), header: () => '', esc: x => x,
    notify: message => events.push(['notify', message]),
    location: { origin: 'https://tantalus.test', assign: url => events.push(['navigate', url]) },
    addEventListener: (type, callback) => listeners.set(type, callback), ...options,
  });
  vm.runInContext('globalThis.window=globalThis;globalThis.top=globalThis;globalThis.self=globalThis;\n'
    + source.slice(start, end) + '\n' + pageshow, context);
  return { context, events, listeners };
}
function previousHostNavigation(events, url = 'https://tantalus.test/') {
  return { currentEntry: { index: 1 }, entries: () => [{ index: 0, url }, { index: 1, url: 'https://tantalus.test/dlc/alien-earth/v12/' }],
    back: () => { events.push(['back']); return { committed: Promise.resolve(), finished: Promise.resolve() }; } };
}
test('Earth return preserves an export route after save failure and protects explicit unsaved exit', async () => {
  const h = returnHarness(await read(EARTH_MODULE_ROOT_V12 + '/src/alien-earth-ui.js'), { save: () => false });
  assert.equal(h.context.returnHostV12(), false); assert.equal(h.events[0][0], 'returnHost');
  assert.match(h.events[0][1], /data-act="export"/); assert.equal(h.events.some(x => x[0] === 'navigate'), false);
  assert.equal(h.context.hostNavigationPendingV12, null);
  assert.equal(h.context.returnHostV12(true), true); assert.equal(h.context.protectSave, true); assert.equal(h.context.keys.size, 0);
  h.listeners.get('pageshow')({ persisted: true });
  h.context.protectSave = false; h.context.location.assign = () => { throw Error('blocked'); };
  assert.equal(h.context.returnHostV12(true), false); assert.equal(h.context.protectSave, false);
  assert.equal(h.context.hostNavigationPendingV12, null);
});
test('Earth returns only to a proven previous host entry and prevents a double traversal', async () => {
  const source = await read(EARTH_MODULE_ROOT_V12 + '/src/alien-earth-ui.js');
  for (const url of ['https://tantalus.test/', 'https://tantalus.test/index.html?qa=1']) {
    const h = returnHarness(source); h.context.navigation = previousHostNavigation(h.events, url);
    let saves = 0; h.context.save = () => { saves++; return true; };
    assert.equal(h.context.returnHostV12(), true); assert.equal(h.context.returnHostV12(), false);
    assert.deepEqual(h.events, [['back']]); assert.equal(saves, 1);
    h.listeners.get('pageshow')({ persisted: true });
    assert.equal(h.context.returnHostV12(), true); assert.equal(h.events.length, 2);
  }
});
test('Earth uses the direct host route when navigation provenance is missing, external or framed', async () => {
  const source = await read(EARTH_MODULE_ROOT_V12 + '/src/alien-earth-ui.js');
  for (const kind of ['no-api', 'direct', 'external', 'other-route', 'missing-url', 'throwing-entries', 'frame', 'no-back']) {
    const h = returnHarness(source); const navigation = previousHostNavigation(h.events);
    h.context.document = { referrer: 'https://tantalus.test/' }; // A referrer alone is never proof.
    if (kind !== 'no-api') h.context.navigation = navigation;
    if (kind === 'direct') navigation.currentEntry.index = 0;
    if (kind === 'external') navigation.entries = () => [{ index: 0, url: 'https://other.test/' }];
    if (kind === 'other-route') navigation.entries = () => [{ index: 0, url: 'https://tantalus.test/account' }];
    if (kind === 'missing-url') navigation.entries = () => [{ index: 0, url: '' }];
    if (kind === 'throwing-entries') navigation.entries = () => { throw Error('unavailable'); };
    if (kind === 'frame') h.context.top = {};
    if (kind === 'no-back') navigation.back = null;
    assert.equal(h.context.returnHostV12(), true, kind); assert.deepEqual(h.events, [['navigate', '/']], kind);
  }
});
test('Earth handles both asynchronous navigation failures and stale failures after a restored page', async () => {
  const source = await read(EARTH_MODULE_ROOT_V12 + '/src/alien-earth-ui.js');
  const h = returnHarness(source); h.context.navigation = previousHostNavigation(h.events);
  h.context.navigation.back = () => ({ committed: Promise.reject(Error('blocked')), finished: Promise.reject(Error('blocked')) });
  assert.equal(h.context.returnHostV12(true), true); assert.equal(h.context.protectSave, true);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.context.protectSave, false); assert.equal(h.context.hostNavigationPendingV12, null);
  assert.equal(h.events.filter(event => event[0] === 'notify').length, 1);
  let rejectOld;
  h.context.navigation.back = () => ({ committed: new Promise((_resolve, reject) => { rejectOld = reject; }), finished: Promise.resolve() });
  assert.equal(h.context.returnHostV12(true), true); h.listeners.get('pageshow')({ persisted: true });
  h.context.navigation = previousHostNavigation(h.events);
  assert.equal(h.context.returnHostV12(true), true); const current = h.context.hostNavigationPendingV12;
  rejectOld(Error('old traversal'));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.context.hostNavigationPendingV12, current); assert.equal(h.context.protectSave, true);
});
test('Earth silences a pending native music transfer without destroying the audio owner', async () => {
  let finishLoad, loading = false, plays = 0;
  const pending = new Promise(resolve => { finishLoad = resolve; });
  class Media { canPlayType() { return 'probably'; } async play() { plays++; } pause() {} removeAttribute() {} load() {} }
  const audio = new AudioDirector({ AudioCtor: Media, bank: { load: () => { loading = true; return pending; }, dispose() {} },
    urlApi: { createObjectURL: () => 'blob:earth-test', revokeObjectURL() {} } });
  audio.context = { state: 'running', close: async () => {} }; audio.manifestStatus = 'ready'; audio.scene = 'menu';
  audio.manifest = { tracks: { sfx: {}, music: { menu: { sources: [{ path: '/assets/audio/music/menu.ogg', mime: 'audio/ogg', sha256: 'a'.repeat(64) }] } } } };
  const playing = audio.playScene(); await Promise.resolve(); assert.equal(loading, true);
  const h = launchHarness(await read('src/app.js')); h.context.audio = audio;
  assert.equal(h.context.launch(), true); assert.equal(audio.scene, null); assert.equal(audio.disposed, false);
  finishLoad({ data: new ArrayBuffer(4), mime: 'audio/ogg' }); await playing;
  assert.equal(plays, 0); assert.equal(audio.musicVoices.size, 0); assert.equal(audio.disposed, false);
  audio.enabled = false; audio.setVolumes({ master: 0.4, music: 0, effects: 0.3 });
  const muted = { enabled: audio.enabled, volumes: { ...audio.volumes } }, listeners = new Map();
  Object.assign(h.context, { addEventListener: (type, callback) => listeners.set(type, callback),
    clearInterval() {}, galaxyJumpTimerV116: 1, startGalaxyJumpSchedulerV116() {} });
  vm.runInContext(hostPageEvents(await read('src/app.js')), h.context);
  listeners.get('pagehide')({ persisted: true }); listeners.get('pageshow')({ persisted: true });
  assert.deepEqual({ enabled: audio.enabled, volumes: { ...audio.volumes } }, muted);
  assert.equal(audio.disposed, false); assert.equal(audio.scene, 'menu');
});
test('closed admission rejects extra runtime files, reports, traversal and source publication', () => {
  assert.deepEqual([...EARTH_RASTER_FILES_V12].sort(), Object.values(EARTH_RASTER_ASSETS_V12).map(asset => asset.path).sort());
  for (const file of EARTH_RUNTIME_FILES_V12) assert.equal(publicEarthDlcPathAdmissionV12(EARTH_RUNTIME_ROOT_V12 + '/' + file, { built: true }), true);
  for (const path of ['../secret', 'dlc/alien-earth/v12/docs/report.html', 'dlc/alien-earth/v12/unlisted.js', 'dlc/alien-earth/v12/assets/raster-v12/unlisted.png', 'modules/alien-earth/unknown.json', 'docs/development/alien-earth-v12/qa/unlisted.png']) {
    assert.equal(publicEarthDlcPathAdmissionV12(path), false, path);
    assert.equal(publicEarthDlcPathAdmissionV12(path, { built: true }), false, path);
  }
  for (const path of EARTH_SOURCE_ONLY_V12) assert.equal(publicEarthDlcPathAdmissionV12(path, { built: true }), false, path);
});
test('the real development router serves only the admitted Earth files', async () => {
  const source = await read('scripts/dev.mjs');
  const start = source.indexOf('function safePath(url) {'), end = source.indexOf('\nawait writeAudioManifestV77', start);
  assert.ok(start > 0 && end > start);
  const context = vm.createContext({ root, normalize, join, EARTH_RUNTIME_ROOT_V12, EARTH_RUNTIME_FILES_V12, EARTH_MODULE_ROOT_V12 });
  vm.runInContext(source.slice(start, end), context);
  for (const path of EARTH_RUNTIME_FILES_V12) {
    assert.equal(context.safePath('/' + EARTH_RUNTIME_ROOT_V12 + '/' + path + '?review=1'), join(root, EARTH_MODULE_ROOT_V12, path));
  }
  for (const path of ['docs/report.html', 'unlisted.js', 'assets/raster-v12/unlisted.png']) {
    assert.equal(context.safePath('/' + EARTH_RUNTIME_ROOT_V12 + '/' + path), null);
  }
  assert.equal(context.safePath('/%broken'), null);
});
test('archive inventory is independently pinned and every source member is present', async () => {
  const bytes = await readFile(join(root, EARTH_RECOVERY_V11));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), EARTH_RECOVERY_SHA256_V11);
  const original = JSON.parse(bytes); assert.equal(original.fileCount, 180);
  assert.equal(original.sourceArchive.sha256, 'c6402939c7e3085609b191848f710cd2efe84c5bfe6547a2cf95ca39494c38f3');
  assert.ok((await verifyEarthDlcV12(root)).files >= 183);
});
test('public derivative rejects missing files, changed bytes and added source reports', async t => {
  const output = await temporary(t), result = await buildAlienEarthDlc(root, output);
  const checked = await verifyEarthDlcV12(output, { built: true });
  assert.equal(checked.files, result.files); assert.equal(result.modules, 23);
  assert.equal(result.saveNamespace, 'atf.dlc.alien-earth.s1.profile-1');
  for (const file of EARTH_RUNTIME_FILES_V12) {
    const path = EARTH_RUNTIME_ROOT_V12 + '/' + file;
    assert.equal(isPublicDistributionPathV86(path, { built: true }), true, path);
    if (/\.(?:html|css|js)$/.test(file)) assert.equal(isPublicDistributionTextV86(await readFile(join(output, path), 'utf8')), true, path);
  }
  assert.deepEqual((await readdir(join(output, EARTH_RUNTIME_ROOT_V12))).sort(), ['assets', 'earth.css', 'index.html', 'src']);
  const ui = join(output, EARTH_RUNTIME_ROOT_V12, 'src/alien-earth-ui.js'), original = await readFile(ui);
  await rm(ui); await assert.rejects(verifyEarthDlcV12(output, { built: true }), /Incomplete Earth package/);
  await writeFile(ui, Buffer.concat([original, Buffer.from('\n// altered derivative\n')]));
  await assert.rejects(verifyEarthDlcV12(output, { built: true }), /Earth derivative mismatch/);
  await writeFile(ui, original);
  await writeFile(join(output, EARTH_RUNTIME_ROOT_V12, 'report.html'), 'unreviewed');
  await assert.rejects(verifyEarthDlcV12(output, { built: true }), /Unapproved Earth path/);
});
test('portable output is deterministic, scoped and embeds its scripts, styles and images', async () => {
  const first = await renderEarthStandaloneV12(root), second = await renderEarthStandaloneV12(root);
  assert.equal(first.html, second.html);
  assert.doesNotMatch(first.html, /<script[^>]+src=|<link[^>]+rel="stylesheet"/);
  assert.match(first.html, /EARTH_RASTER_INLINE_V12/);
  new Function(first.html.match(/<script>\n([\s\S]*)\n<\/script>/)[1]);
  assert.equal((await earthModuleGraphV12(root)).at(-1).path, 'src/alien-earth-ui.js');
});
test('builder refuses linked output before writing through it', async t => {
  const output = await temporary(t), elsewhere = await temporary(t);
  await mkdir(join(output, 'dlc/alien-earth'), { recursive: true });
  await symlink(elsewhere, join(output, EARTH_RUNTIME_ROOT_V12));
  await assert.rejects(buildAlienEarthDlc(root, output)); assert.deepEqual(await readdir(elsewhere), []);
});
test('Earth succession rejects fabricated predecessors and altered host bytes', async () => {
  assert.deepEqual(verifyEarthMainSuccessionV12(), { successors: 8, historicalEvidenceTransferred: false });
  for (const [path, receipt] of Object.entries(EARTH_MAIN_SUCCESSORS_V12)) {
    assert.equal(reviewedEarthMainDigestV12(path, receipt.previousSha256), receipt.currentSha256);
    assert.throws(() => reviewedEarthMainDigestV12(path, '0'.repeat(64)), /Broken Earth main predecessor/);
  }
  const sources = new Map(await Promise.all(Object.keys(EARTH_MAIN_SUCCESSORS_V12).map(async path => [path, await read(path)])));
  assert.throws(() => verifyEarthMainSuccessionV12(path => sources.get(path) + '\n// unreviewed\n'), /Unreviewed Earth main source bytes/);
});
