import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { resolve, join, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const root = resolve(process.env.ATF_DLC_QA_ROOT || 'dist');
const output = resolve(process.env.ATF_DLC_QA_OUTPUT || join(tmpdir(), 'atf-avp-host-qa'));
await mkdir(output, { recursive: true });
const { chromium } = await import(process.env.ATF_PLAYWRIGHT_MODULE
  ? pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href : 'playwright');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.webp': 'image/webp',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    let file = resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    let info = await stat(file);
    if (info.isDirectory()) { file = join(file, 'index.html'); info = await stat(file); }
    if (!info.isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'content-type': mime[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(await readFile(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolveReady => server.listen(0, '127.0.0.1', resolveReady));
const base = 'http://127.0.0.1:' + server.address().port;
let browser = null;
const checks = [];
const observedPageErrors = [];
function check(name, condition, detail = null) {
  checks.push({ name, ok: Boolean(condition), ...(detail ? { detail } : {}) });
  assert.ok(condition, name);
}
const nativeSnapshot = page => page.evaluate(() => Object.fromEntries(Object.keys(localStorage)
  .filter(key => key.startsWith('atf-v47-profile-')).sort().map(key => [key, localStorage.getItem(key)])));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
// Explicit native-profile fixture: a fresh context does not persist a profile
// merely by displaying the title. Use the real public SaveSystem API, validate
// its stored slot, then navigate to a fresh native boot before taking snapshots.
async function createNativeProfileFixture(page, name) {
  await page.goto(base + '/src/dlc/avp-2004/index.html', { waitUntil: 'load', timeout: 120000 });
  const fixture = await page.evaluate(async () => {
    const { SaveSystem, SAVE_SCHEMA } = await import('/src/save.js');
    const store = new SaveSystem(localStorage);
    store.newGame(1);
    const slot = store.listProfiles().find(candidate => candidate.profile === 1);
    const persisted = JSON.parse(localStorage.getItem(store.key(1)));
    return { status: slot?.status, schema: persisted?.schema, expectedSchema: SAVE_SCHEMA, profile: persisted?.profile };
  });
  check(name + ': native profile fixture passes real SaveSystem validation',
    fixture.status === 'ready' && fixture.schema === fixture.expectedSchema && fixture.profile === 1, fixture);
}
async function openHostMenu(page) {
  await page.goto(base + '/', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => document.documentElement.classList.contains('title-mode'), null, { timeout: 120000 });
  const start = page.locator('#title-start');
  if (await start.isVisible()) await start.click();
  await page.locator('#title-dlc').waitFor({ state: 'visible' });
}
async function openExpedition(page) {
  await page.locator('#title-dlc').click();
  await page.locator('#dlc-expeditions[open]').waitFor();
  await page.locator('[data-dlc-launch="avp-2004"]').click();
  await page.waitForURL(/\/src\/dlc\/avp-2004\/index(?:\.html)?$/);
  await page.locator('#new-game').waitFor({ state: 'visible' });
}
let fatal = null;
try {
  browser = await chromium.launch({ headless: true,
    ...(process.env.ATF_CHROMIUM_EXECUTABLE ? { executablePath: process.env.ATF_CHROMIUM_EXECUTABLE } : {}) });
  for (const profile of [
    { name: 'desktop', viewport: { width: 1365, height: 900 } },
    { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
  ]) {
    const context = await browser.newContext({ viewport: profile.viewport, isMobile: !!profile.isMobile,
      hasTouch: !!profile.hasTouch, reducedMotion: 'reduce', acceptDownloads: true });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => { errors.push(error.message); observedPageErrors.push({ profile: profile.name, message: error.message, stack: error.stack }); });
    await createNativeProfileFixture(page, profile.name);
    await openHostMenu(page);
    const before = await nativeSnapshot(page);
    check(profile.name + ': real native profile exists before launch', Object.keys(before).length > 0);
    await page.locator('#title-dlc').click();
    await page.locator('#dlc-expeditions[open]').waitFor();
    const box = await page.locator('#dlc-expeditions').boundingBox();
    check(profile.name + ': gallery fits viewport', box && box.x >= 0 && box.width <= profile.viewport.width && box.height <= profile.viewport.height);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.activeElement?.id === 'title-dlc');
    check(profile.name + ': closing restores Extensions focus', await page.evaluate(() => document.activeElement?.id === 'title-dlc'));
    await openExpedition(page);
    check(profile.name + ': production page has no QA shortcut', await page.evaluate(() => typeof globalThis.__AVP_TEST__ === 'undefined'));
    check(profile.name + ': opening keeps native profile byte-for-byte', same(before, await nativeSnapshot(page)));
    check(profile.name + ': host return is visible on the expedition title', await page.locator('#host-return').isVisible());
    await page.locator('#new-game').click();
    await page.locator('#title').waitFor({ state: 'hidden' });
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(650);
    await page.keyboard.up('ArrowRight');
    await page.locator('#pause-button').click();
    await page.locator('#pause-host-return').waitFor({ state: 'visible' });
    const downloaded = page.waitForEvent('download');
    await page.locator('#export-save').click();
    const download = await downloaded;
    const exported = JSON.parse(await readFile(await download.path(), 'utf8'));
    check(profile.name + ': real simulation moved and exported', exported.schema === 10 && exported.player.x > 250 && exported.worldTime > 0);
    await page.locator('#import-file').setInputFiles({ name: 'AVP_CARNET_QA.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(exported)) });
    await page.locator('#panel').waitFor({ state: 'hidden' });
    await page.locator('#pause-button').click();
    check(profile.name + ': export/import leaves the native profile intact', same(before, await nativeSnapshot(page)));
    await page.screenshot({ path: join(output, profile.name + '-avp-pause.png'), fullPage: true });
    await page.locator('#pause-host-return').click();
    await page.waitForURL(base + '/');
    await page.waitForFunction(() => document.documentElement.classList.contains('title-mode'));
    check(profile.name + ': return retains the native profile', same(before, await nativeSnapshot(page)));
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('atf.dlc.avp2004.v1.slot1')));
    check(profile.name + ': return records the dedicated expedition notebook', saved && saved.schema === 10 && saved.player.x >= exported.player.x);
    if (await page.locator('#title-start').isVisible()) await page.locator('#title-start').click();
    await openExpedition(page);
    check(profile.name + ': notebook can be resumed after a real navigation', await page.locator('#continue-game').isEnabled());
    await page.locator('#continue-game').click();
    await page.locator('#title').waitFor({ state: 'hidden' });
    await page.locator('#pause-button').click();
    check(profile.name + ': resumed pause still offers host return', await page.locator('#pause-host-return').isVisible());
    check(profile.name + ': no browser execution error', errors.length === 0, errors);
    await context.close();
  }
  // Explicit fault injection: the browser refuses only AVP notebook writes.
  // Native profiles are real; this does not alter gameplay or teleport actors.
  const blocked = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, acceptDownloads: true });
  await blocked.addInitScript(() => {
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (String(key).startsWith('atf.dlc.avp2004.v1')) throw new DOMException('QA storage quota', 'QuotaExceededError');
      return write.call(this, key, value);
    };
  });
  const page = await blocked.newPage();
  await createNativeProfileFixture(page, 'quota');
  await openHostMenu(page);
  const before = await nativeSnapshot(page);
  await openExpedition(page);
  await page.locator('#new-game').click();
  await page.locator('#title').waitFor({ state: 'hidden' });
  await page.locator('#pause-button').click();
  await page.locator('#pause-host-return').click();
  await page.locator('#host-export').waitFor({ state: 'visible' });
  check('quota: failed save keeps the expedition open', page.url().includes('/src/dlc/avp-2004/'));
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#host-export').click();
  const download = await downloadPromise;
  const notebook = JSON.parse(await readFile(await download.path(), 'utf8'));
  check('quota: notebook remains exportable', notebook.schema === 10 && notebook.dlc === 'avp-2004-rite-under-ice');
  await page.locator('#host-stay').click();
  check('quota: staying restores pause', await page.locator('#pause-host-return').isVisible());
  await page.locator('#pause-host-return').click();
  await page.locator('#host-leave').click();
  await page.waitForURL(base + '/');
  await page.waitForFunction(() => document.documentElement.classList.contains('title-mode'));
  check('quota: explicit unsaved exit retains native profile', same(before, await nativeSnapshot(page)));
  check('quota: unsaved notebook was not falsely created', await page.evaluate(() => localStorage.getItem('atf.dlc.avp2004.v1.slot1') === null));
  await blocked.close();
} catch (error) {
  const pages = [];
  for (const [index, page] of (browser?.contexts().flatMap(context => context.pages()) || []).entries()) {
    try {
      const state = await page.evaluate(() => ({ url: location.href, activeElement: document.activeElement?.outerHTML?.slice(0,1000), titleHidden: document.getElementById('title-screen')?.hidden, titleState: document.getElementById('title-screen')?.dataset.state, menuHidden: document.getElementById('title-menu')?.hidden, galleryOpen: document.getElementById('dlc-expeditions')?.open, liveStatus: document.getElementById('title-live-status')?.textContent }));
      pages.push(state);
      await page.screenshot({ path: join(output, 'failure-' + index + '.png'), fullPage: true });
    } catch (diagnosticError) { pages.push({ diagnosticError: diagnosticError.message }); }
  }
  fatal = { message: error.message, stack: error.stack, pages, observedPageErrors };
} finally {
  await browser?.close();
  await new Promise(done => server.close(done));
  const report = { suite: 'avp-host-browser', sourceRoot: root, method: 'Chromium on a real HTTP origin; actual host boot, menu, keyboard, navigation, export/import and notebook persistence. Each fresh browser context first receives a native profile created and validated by the real SaveSystem public API; no campaign advancement is injected. One isolated storage-quota fault fixture.',
    passed: checks.filter(check => check.ok).length, failed: checks.filter(check => !check.ok).length, checks, fatal };
  await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
}
if (fatal || checks.some(check => !check.ok)) process.exitCode = 1;
