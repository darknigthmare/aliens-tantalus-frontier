import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import {
  HORS_DES_OMBRES_ARCHIVE_ROOT_V010,
  HORS_DES_OMBRES_MANIFEST_V010,
  HORS_DES_OMBRES_MANIFEST_SHA256_V010,
  HORS_DES_OMBRES_RUNTIME_PATHS_V010,
  HORS_DES_OMBRES_SOURCE_ARCHIVE_SHA256_V010,
  HORS_DES_OMBRES_SOURCE_ONLY_PATHS_V010,
  compileHorsDesOmbresManifestV010,
  copyHorsDesOmbresRuntimeV010,
  horsDesOmbresPathAdmissionV010,
  reviewedHorsDesOmbresV010,
  verifyHorsDesOmbresV010,
} from './hors-des-ombres-admission-v010.mjs';
import { HORS_DES_OMBRES_EVENT_V010, HORS_DES_OMBRES_PATH_V010, launchHorsDesOmbresV010 } from '../src/hors-des-ombres-launch-v010.js';
import { TitleScreenController } from '../src/title-screen-v61.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const textAt = path => readFile(join(ROOT, path), 'utf8');
async function temporary(t) {
  const path = await mkdtemp(join(tmpdir(), 'hors-des-ombres-v010-'));
  t.after(() => rm(path, { recursive: true, force: true }));
  return path;
}
async function runtimeFixture(t) {
  const path = await temporary(t);
  await copyHorsDesOmbresRuntimeV010(ROOT, path);
  return path;
}
async function filesBelow(root, relative = '') {
  const paths = [];
  for (const entry of await readdir(join(root, relative), { withFileTypes: true })) {
    const path = relative ? relative + '/' + entry.name : entry.name;
    if (entry.isDirectory()) paths.push(...await filesBelow(root, path));
    else paths.push(path);
  }
  return paths.sort();
}

test('recovered source: every original member, ZIP chunk and runtime byte is verified', async () => {
  const result = await verifyHorsDesOmbresV010(ROOT);
  assert.equal(result.ok, true);
  assert.equal(result.archiveFiles, 333);
  assert.equal(result.runtimeFiles, 8);
  assert.equal(result.sourceArchiveSha256, HORS_DES_OMBRES_SOURCE_ARCHIVE_SHA256_V010);
  assert.equal(result.manifestSha256, HORS_DES_OMBRES_MANIFEST_SHA256_V010);
});

test('admission is exact, source-only and independent of unrelated DLC', () => {
  const inventory = reviewedHorsDesOmbresV010();
  for (const path of HORS_DES_OMBRES_RUNTIME_PATHS_V010) {
    assert.equal(horsDesOmbresPathAdmissionV010(path), true);
    assert.equal(horsDesOmbresPathAdmissionV010(path, { built: true }), true);
    assert.equal(horsDesOmbresPathAdmissionV010(path, { directory: true }), false);
  }
  for (const path of [...inventory.files.keys(), HORS_DES_OMBRES_MANIFEST_V010, ...HORS_DES_OMBRES_SOURCE_ONLY_PATHS_V010]) {
    assert.equal(horsDesOmbresPathAdmissionV010(path), true, path);
    assert.equal(horsDesOmbresPathAdmissionV010(path, { built: true }), false, path);
  }
  for (const path of [
    '../secret', '/absolute', 'src\\oth-v1\\oth-ui.js', 'src/oth-v1/../app.js',
    'src/oth-v1/unknown.js', 'src/oth-v1/subfolder', 'dlc/alien-hors-des-ombres/unknown.html',
    HORS_DES_OMBRES_ARCHIVE_ROOT_V010 + '/original/injected.txt',
  ]) assert.equal(horsDesOmbresPathAdmissionV010(path), false, path);
  assert.equal(horsDesOmbresPathAdmissionV010('src/app.js'), null);
  assert.equal(horsDesOmbresPathAdmissionV010('dlc/unrelated/index.html'), null);
  assert.equal(horsDesOmbresPathAdmissionV010('archives/project-recovery-20261116'), null);
});

test('changing manifest metadata cannot update the reviewed pin', async () => {
  const bytes = await readFile(join(ROOT, HORS_DES_OMBRES_MANIFEST_V010));
  const changed = Buffer.concat([bytes, Buffer.from('\n')]);
  assert.throws(() => compileHorsDesOmbresManifestV010(changed, HORS_DES_OMBRES_MANIFEST_SHA256_V010), /manifest bytes/);
});

test('manifest compiler rejects malformed inventories even with a recomputed test digest', () => {
  const original = reviewedHorsDesOmbresV010().manifest;
  const reject = change => {
    const manifest = structuredClone(original);
    change(manifest);
    const bytes = Buffer.from(JSON.stringify(manifest));
    assert.throws(() => compileHorsDesOmbresManifestV010(bytes, digest(bytes)));
  };
  reject(m => { m.files[0].path = '../escape'; });
  reject(m => { m.files.push({ ...m.files[0] }); });
  reject(m => { m.runtimeFiles.push({ ...m.runtimeFiles[0], path: 'src/oth-v1/injected.js' }); });
  reject(m => { m.runtimeFiles.pop(); });
  reject(m => { m.runtimeFiles.find(e => !e.adapted).sha256 = '0'.repeat(64); });
  reject(m => { m.sourceArchive.sha256 = '0'.repeat(64); });
  reject(m => { m.sourceArchive.chunks[1] = m.sourceArchive.chunks[0]; });
  reject(m => { m.runtimeFiles[0].sourcePath = null; m.runtimeFiles[0].adapted = false; });
});

test('ZIP-only report metadata is exact and cannot hide another direct source member', () => {
  const original = reviewedHorsDesOmbresV010().manifest;
  const reject = change => {
    const manifest = structuredClone(original);
    change(manifest);
    const bytes = Buffer.from(JSON.stringify(manifest));
    assert.throws(() => compileHorsDesOmbresManifestV010(bytes, digest(bytes)));
  };
  assert.equal(original.files.filter(e => e.kind === 'original-member').length, 320);
  assert.equal(original.sourceArchive.memberCount, 321);
  assert.equal(original.sourceArchive.chunks.length, 12);
  assert.equal(horsDesOmbresPathAdmissionV010(HORS_DES_OMBRES_ARCHIVE_ROOT_V010 + '/original/RAPPORT_ILLUSTRE.html'), false);
  reject(m => { delete m.sourceArchive.zipOnlyMembers; });
  reject(m => { m.sourceArchive.zipOnlyMembers = []; });
  reject(m => { m.sourceArchive.zipOnlyMembers.push({ ...m.sourceArchive.zipOnlyMembers[0] }); });
  reject(m => { m.sourceArchive.zipOnlyMembers[0].originalPath = '../escape'; });
  reject(m => { m.sourceArchive.zipOnlyMembers[0].originalPath = 'JOUER_HORS_DES_OMBRES.html'; });
  reject(m => { m.sourceArchive.zipOnlyMembers[0].sizeBytes--; });
  reject(m => { m.sourceArchive.zipOnlyMembers[0].sha256 = '0'.repeat(64); });
  reject(m => { m.sourceArchive.zipOnlyMembers[0].extra = true; });
  reject(m => { m.sourceArchive.chunks.pop(); });
  reject(m => { m.files.find(e => e.kind === 'original-archive-chunk').sizeBytes++; });
});

test('distribution copy ships exactly eight runtime files, with the standalone HTML entry', async t => {
  const path = await runtimeFixture(t);
  assert.deepEqual(await filesBelow(path), [...HORS_DES_OMBRES_RUNTIME_PATHS_V010].sort());
  const result = await verifyHorsDesOmbresV010(path, { built: true });
  assert.equal(result.ok, true);
  assert.equal(result.runtimeFiles, 8);
  assert.equal(result.archiveFiles, 0);
  assert.equal(result.archiveBytes, 0);
});

test('built verification rejects changed, missing and unreviewed runtime files', async t => {
  const path = await runtimeFixture(t);
  const target = join(path, 'src/oth-v1/oth-engine.js');
  const original = await readFile(target);
  const changed = Buffer.from(original);
  changed[0] ^= 1;
  await writeFile(target, changed);
  await assert.rejects(verifyHorsDesOmbresV010(path, { built: true }), /Changed Hors des ombres bytes/);
  await rm(target);
  await assert.rejects(verifyHorsDesOmbresV010(path, { built: true }), /Missing runtime files|ENOENT/);
  await writeFile(target, original);
  await writeFile(join(path, 'src/oth-v1/injected.js'), '');
  await assert.rejects(verifyHorsDesOmbresV010(path, { built: true }), /Unreviewed Hors des ombres runtime path/);
});

test('source-only reports and historical archives cannot enter a distribution', async t => {
  const path = await runtimeFixture(t);
  await mkdir(join(path, 'archives'));
  await assert.rejects(verifyHorsDesOmbresV010(path, { built: true }), /source-only content/);
  await rm(join(path, 'archives'), { recursive: true });
  const report = join(path, HORS_DES_OMBRES_SOURCE_ONLY_PATHS_V010.at(-1));
  await mkdir(dirname(report), { recursive: true });
  await writeFile(report, '{}');
  await assert.rejects(verifyHorsDesOmbresV010(path, { built: true }), /source-only content/);
});

test('runtime symlinks and destination symlinks are refused before outside writes', async t => {
  const path = await runtimeFixture(t);
  const target = join(path, 'src/oth-v1/oth-engine.js');
  await rm(target);
  await symlink(join(ROOT, 'src/oth-v1/oth-engine.js'), target);
  await assert.rejects(verifyHorsDesOmbresV010(path, { built: true }), /symlink/);
  const destination = await temporary(t);
  const outside = await temporary(t);
  await symlink(outside, join(destination, 'dlc'));
  await assert.rejects(copyHorsDesOmbresRuntimeV010(ROOT, destination), /real destination directory/);
  assert.deepEqual(await readdir(outside), []);
  const parent = await temporary(t);
  await symlink(outside, join(parent, 'alias'));
  await assert.rejects(copyHorsDesOmbresRuntimeV010(ROOT, join(parent, 'alias', 'new')), /real destination directory/);
  assert.deepEqual(await readdir(outside), []);
});

test('copy refuses filesystem roots and source ancestors before making directories', async () => {
  await assert.rejects(copyHorsDesOmbresRuntimeV010(ROOT, '/'), /Output must not contain/);
  await assert.rejects(copyHorsDesOmbresRuntimeV010(ROOT, ROOT), /Output must not contain/);
  await assert.rejects(copyHorsDesOmbresRuntimeV010(ROOT, dirname(ROOT)), /Output must not contain/);
});

test('HTML styles, mount import and runtime imports resolve to admitted shipped files', async () => {
  const entry = HORS_DES_OMBRES_PATH_V010.slice(1);
  const html = await textAt(entry);
  const allowed = new Set(HORS_DES_OMBRES_RUNTIME_PATHS_V010);
  const dependencies = [
    ...html.matchAll(/href=["']([^"']+)["']/g),
    ...html.matchAll(/\bfrom\s+["']([^"']+)["']/g),
  ].map(match => match[1]);
  assert.equal(dependencies.length, 2);
  for (const dependency of dependencies) {
    const path = new URL(dependency, 'https://local.invalid/' + entry).pathname.slice(1);
    assert.ok(allowed.has(path), path);
  }
  for (const path of allowed) {
    if (!path.endsWith('.js')) continue;
    for (const match of (await textAt(path)).matchAll(/\bfrom\s*["'](\.[^"']+)["']/g)) {
      const imported = new URL(match[1], 'https://local.invalid/' + path).pathname.slice(1);
      assert.ok(allowed.has(imported), path + ' -> ' + imported);
    }
  }
  assert.match(html, /mount\(document\.getElementById\('oth-root'\)\)/);
});

test('the real worker caches all eight runtime paths but refuses queries, archives and wrong MIME', async () => {
  const origin = 'https://local.invalid';
  const worker = runInNewContext((await textAt('sw.js')) + '\n({ SHELL, cacheableRequestV143, cacheableResponseV143 });', {
    self: { location: { origin }, addEventListener() {} }, URL, Request, Response,
  });
  for (const path of HORS_DES_OMBRES_RUNTIME_PATHS_V010) {
    assert.ok(worker.SHELL.includes('/' + path), path);
    const request = new Request(origin + '/' + path);
    const mime = path.endsWith('.html') ? 'text/html' : path.endsWith('.css') ? 'text/css' : 'text/javascript';
    assert.equal(worker.cacheableRequestV143(request), true, path);
    assert.equal(worker.cacheableResponseV143(request, new Response('ok', { headers: { 'content-type': mime } })), true);
    assert.equal(worker.cacheableResponseV143(request, new Response('wrong', { headers: { 'content-type': 'application/octet-stream' } })), false);
    assert.equal(worker.cacheableRequestV143(new Request(origin + '/' + path + '?from=tantalus')), false);
  }
  assert.equal(worker.cacheableRequestV143(new Request(origin + '/' + HORS_DES_OMBRES_MANIFEST_V010)), false);
  assert.equal(worker.cacheableRequestV143(new Request('https://outside.invalid' + HORS_DES_OMBRES_PATH_V010)), false);
});

test('host launch requires a synchronous strict-true save, then navigates once', () => {
  const events = [];
  assert.equal(launchHorsDesOmbresV010({
    save: () => { events.push('save'); return true; },
    navigate: path => events.push(path),
  }), true);
  assert.deepEqual(events, ['save', '/dlc/alien-hors-des-ombres/index.html']);
  for (const result of [false, undefined, null, 1, 'true', Promise.resolve(true)]) {
    const navigations = [];
    assert.equal(launchHorsDesOmbresV010({ save: () => result, navigate: path => navigations.push(path) }), false);
    assert.deepEqual(navigations, []);
  }
  assert.equal(launchHorsDesOmbresV010({ navigate: () => assert.fail('navigation without save') }), false);
  assert.throws(() => launchHorsDesOmbresV010({
    save: () => { throw new Error('storage failed'); },
    navigate: () => assert.fail('navigation after failed save'),
  }), /storage failed/);
});

const titlePrototype = TitleScreenController.prototype;
function menuFixture() {
  const button = name => ({ name, hidden: false, disabled: false, click() {} });
  return {
    continueButton: button('continue'), newButton: button('new'), forgeButton: button('forge'),
    horsDesOmbresButton: button('chronicle'), optionsButton: button('options'),
    menuButtons: titlePrototype.menuButtons,
  };
}

test('title keyboard and gamepad menu order includes the optional DLC button', () => {
  const fixture = menuFixture();
  assert.deepEqual(fixture.menuButtons().map(b => b.name), ['continue', 'new', 'forge', 'chronicle', 'options']);
  fixture.horsDesOmbresButton.hidden = true;
  assert.deepEqual(fixture.menuButtons().map(b => b.name), ['continue', 'new', 'forge', 'options']);
  fixture.horsDesOmbresButton = null;
  fixture.continueButton.disabled = true;
  assert.deepEqual(fixture.menuButtons().map(b => b.name), ['new', 'forge', 'options']);
});

test('title DLC callback respects hidden, non-menu and recovery states', () => {
  let launches = 0;
  let cancellations = 0;
  const fixture = {
    root: { hidden: true }, state: 'menu', liveStatus: { textContent: '' },
    cancelNewTimelineConfirmation() { cancellations++; }, getRecoveryStatus: () => false,
    onHorsDesOmbres() { launches++; return false; },
  };
  titlePrototype.openHorsDesOmbres.call(fixture);
  fixture.root.hidden = false;
  fixture.state = 'other';
  titlePrototype.openHorsDesOmbres.call(fixture);
  assert.equal(launches, 0);
  assert.equal(cancellations, 0);
  fixture.state = 'menu';
  fixture.getRecoveryStatus = () => ({ blocked: true });
  titlePrototype.openHorsDesOmbres.call(fixture);
  assert.equal(launches, 0);
  assert.match(fixture.liveStatus.textContent, /Récupérez/);
  fixture.getRecoveryStatus = () => false;
  titlePrototype.openHorsDesOmbres.call(fixture);
  assert.equal(launches, 1);
  assert.equal(cancellations, 2);
  assert.equal(fixture.root.hidden, false);
});

test('focus movement and activation reach the DLC callback without relying on browser tab order', () => {
  const priorDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const fixture = menuFixture();
  let launches = 0;
  const documentFixture = { activeElement: fixture.forgeButton };
  Object.defineProperty(globalThis, 'document', { configurable: true, value: documentFixture });
  try {
    fixture.root = { hidden: false };
    fixture.state = 'menu';
    fixture.focusButton = button => { documentFixture.activeElement = button; };
    fixture.horsDesOmbresButton.click = () => { launches++; };
    titlePrototype.moveFocus.call(fixture, 1);
    assert.equal(documentFixture.activeElement, fixture.horsDesOmbresButton);
    titlePrototype.activateFocused.call(fixture);
    assert.equal(launches, 1);
    titlePrototype.moveFocus.call(fixture, 1);
    assert.equal(documentFixture.activeElement, fixture.optionsButton);
  } finally {
    if (priorDocument) Object.defineProperty(globalThis, 'document', priorDocument);
    else delete globalThis.document;
  }
});

test('Operations bridge is additive, installs once and delegates launch to the host event', async () => {
  const source = (await textAt('src/oth-v1/oth-bridge.js')).replace(/^import[^\n]+\n/m, '');
  const elements = new Map();
  const events = [];
  const panel = {
    querySelector() { return null; },
    prepend(element) { elements.set(element.id, element); },
  };
  const document = {
    readyState: 'complete',
    querySelector: () => panel,
    getElementById: id => elements.get(id),
    createElement: tag => ({
      tag, children: [], style: {}, listeners: {},
      append(...children) { this.children.push(...children); },
      addEventListener(type, callback) { this.listeners[type] = callback; },
    }),
  };
  class FixtureEvent { constructor(type, options) { this.type = type; Object.assign(this, options); } }
  const install = runInNewContext(source + '\ninstall;', {
    document, window: { dispatchEvent: event => events.push(event) },
    CustomEvent: FixtureEvent, HORS_DES_OMBRES_EVENT_V010,
  });
  assert.equal(elements.size, 1);
  install();
  assert.equal(elements.size, 1);
  const button = [...elements.values()][0].children.find(element => element.tag === 'button');
  assert.ok(button);
  button.listeners.click();
  assert.equal(events.length, 1);
  assert.equal(events[0].type, HORS_DES_OMBRES_EVENT_V010);
  assert.equal(events[0].cancelable, true);
});

test('host shell loads one bridge and exposes a dedicated title button', async () => {
  const html = await textAt('index.html');
  assert.equal([...html.matchAll(/src=["']\/src\/oth-v1\/oth-bridge\.js["']/g)].length, 1);
  assert.equal([...html.matchAll(/id=["']title-hors-des-ombres["']/g)].length, 1);
  assert.match(html, /HORS DES OMBRES/);
});
