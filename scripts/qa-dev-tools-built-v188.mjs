// Spec 012 — browser QA of the hidden developer tools in the BUILT output (owner decision 2026-11-23).
// The script serves the build itself as a plain static host would (files and directory indexes only:
// no injection, no rewrite), finds the hidden directory by its content and checks, in Chromium:
//   1. the normal game (no dev query): native storage, no dev file requested, service worker installed,
//      nothing of the dev tools in Cache Storage;
//   2. dev sessions opened from the hidden launcher with the service worker in control: expected scene,
//      real localStorage never obtained, read or written, IndexedDB withheld, sentinel profile identical;
//      shooting range (equip, target, fire, measure, export), reload, exit; a dev URL without session;
//   3. the normal game again: still reads the real profile;
//   4. phone size (390×844, touch): launcher and both panels usable with taps, no horizontal overflow.
// Fixtures (declared): the "real player profile" sentinel is a valid save built by
// devtools/dev-fixtures-v188.js (entry hub-armory) and written to the real localStorage by this script;
// every dev session is built by the launcher itself.
// Injections (declared): one observation-only init script counts every access to the real localStorage
// (the native `window.localStorage` getter and the Storage methods); it changes no behaviour.
// The range API (`__ATF_DEV_V188__.range`) is called for the auto-fire and the measures on desktop; the
// phone pass uses taps only.
// Usage: npm run build ; [PORT=4771] node scripts/qa-dev-tools-built-v188.mjs <out-dir> [dist]
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { findBuiltDevToolsPathV188 } from './build-dev-tools-v188.mjs';
import { buildDevCatalogV188 } from '../devtools/dev-catalog-v188.js';
import { buildDevSessionV188, DEV_PROFILE_KEY_V188 } from '../devtools/dev-fixtures-v188.js';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const out = process.argv[2] || 'qa-dev-tools-built';
const dist = resolve(process.argv[3] || process.env.ATF_BUILD_OUTPUT || 'dist');
await mkdir(out, { recursive: true });
const devPath = await findBuiltDevToolsPathV188(dist);
const launcherPath = `/${devPath}/`;

// —— Static host ——
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.webm': 'audio/webm', '.txt': 'text/plain; charset=utf-8' };
const requests = [];
const server = createServer(async (request, response) => {
  const path = decodeURIComponent((request.url || '/').split('?')[0]);
  requests.push(request.url || '/');
  let file = join(dist, normalize(path).replace(/^([/\\])+/, ''));
  try {
    if (!file.startsWith(dist)) throw new Error('outside');
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    response.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' }).end(body);
  } catch { response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found'); }
});
await new Promise(done => server.listen(Number(process.env.PORT || 0), '127.0.0.1', done));
const baseUrl = `http://127.0.0.1:${server.address().port}`;

const report = { baseUrl, dist, hiddenPathLength: devPath.length, checks: [], pageErrors: [], consoleErrors: [], failedResponses: [], shots: [] };
const check = (label, condition, evidence = null) => { report.checks.push({ label, passed: Boolean(condition), evidence }); console.log(JSON.stringify({ check: label, passed: Boolean(condition), evidence })); };
const devRequests = () => requests.filter(url => url.startsWith(`/${devPath}`));

// Observation only: how often the page obtains or uses the real localStorage.
const OBSERVER = () => {
  // Chromium exposes `localStorage` as an own accessor of the window.
  const holder = Object.getOwnPropertyDescriptor(window, 'localStorage') ? window : Window.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(holder, 'localStorage');
  const nativeGet = descriptor.get, real = nativeGet.call(window);
  const counts = { getter: 0, read: 0, write: 0 };
  const countingGet = function () { counts.getter += 1; return nativeGet.call(window); };
  Object.defineProperty(holder, 'localStorage', { ...descriptor, get: countingGet });
  const native = {};
  for (const [name, kind] of [['getItem', 'read'], ['key', 'read'], ['setItem', 'write'], ['removeItem', 'write'], ['clear', 'write']]) {
    native[name] = Storage.prototype[name];
    Storage.prototype[name] = function (...args) { if (this === real) counts[kind] += 1; return native[name].apply(this, args); };
  }
  Object.defineProperty(window, '__QA_REAL_V188__', { value: {
    counts,
    // true while `window.localStorage` still is the browser's storage (observed), false once replaced.
    native: () => Object.getOwnPropertyDescriptor(holder, 'localStorage')?.get === countingGet && !('value' in (Object.getOwnPropertyDescriptor(window, 'localStorage') || {})),
    reaches: () => { const before = counts.getter; const same = window.localStorage === real; counts.getter = before; return same; },
    snapshot: () => JSON.stringify(Object.fromEntries(Array.from({ length: real.length }, (_, i) => native.key.call(real, i)).sort().map(key => [key, native.getItem.call(real, key)]))),
    set: (key, value) => native.setItem.call(real, key, value)
  } });
};
const realSnapshot = page => page.evaluate(() => globalThis.__QA_REAL_V188__.snapshot());
const realCounts = page => page.evaluate(() => ({ ...globalThis.__QA_REAL_V188__.counts }));
const cacheKeys = page => page.evaluate(async () => { const urls = []; for (const name of await caches.keys()) for (const key of await (await caches.open(name)).keys()) urls.push(key.url); return urls; });
const databases = page => page.evaluate(async () => (await indexedDB.databases?.() || []).map(db => db.name).sort());

function watch(page) {
  page.setDefaultTimeout(30000);
  page.on('pageerror', error => report.pageErrors.push(`${page.url().replace(devPath, '<hidden>')} :: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error' && !/Failed to load resource/.test(message.text())) report.consoleErrors.push(message.text().slice(0, 300)); });
  page.on('response', response => { if (response.status() >= 400) report.failedResponses.push(`${response.status()} ${new URL(response.url()).pathname.replace(devPath, '<hidden>')}`); });
}
const shot = async (page, name) => { const file = join(out, `${name}.png`); await page.screenshot({ path: file }); report.shots.push(file); };
async function launch(page, id, language = 'fr', { tap = false } = {}) {
  await page.goto(`${baseUrl}${launcherPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => globalThis.__ATF_DEV_LAUNCHER_V188__);
  await page.selectOption('[data-dev-language]', language);
  await page.fill('[data-dev-search]', id);
  const button = page.locator(`[data-dev-launch="${id}"]`);
  if (tap) await button.tap(); else await button.click();
  await page.waitForURL(/[?&]atf-dev=v188/, { waitUntil: 'commit' }); // the game page's load event can exceed the default timeout on a busy machine
  await page.waitForFunction(() => ['ready', 'error'].includes(globalThis.__ATF_DEV_V188__?.status), null, { timeout: 150000 });
  return page.evaluate(() => globalThis.__ATF_DEV_V188__.snapshot());
}
const isolation = page => page.evaluate(() => ({ counts: { ...globalThis.__QA_REAL_V188__.counts }, own: !globalThis.__QA_REAL_V188__.native() && !globalThis.__QA_REAL_V188__.reaches(),
  isolated: globalThis.__ATF_DEV_SESSION_V188__?.isolated === true, writes: globalThis.__ATF_DEV_SESSION_V188__?.writes, indexedDB: typeof window.indexedDB, marker: document.documentElement.dataset.atfDevSession }));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
try {
  // —— 1. Normal game, service worker allowed ——
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await context.addInitScript(OBSERVER);
  const page = await context.newPage(); watch(page);
  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => globalThis.__ATF_V51__ && globalThis.__ATF_V61__, null, { timeout: 120000 });
  const normal = await page.evaluate(() => ({ session: typeof globalThis.__ATF_DEV_SESSION_V188__, own: !(globalThis.__QA_REAL_V188__.native() && globalThis.__QA_REAL_V188__.reaches()), indexedDB: typeof window.indexedDB,
    marker: document.documentElement.dataset.atfDevSession ?? null, hud: Boolean(document.querySelector('#atf-dev-hud-v188, [data-atf-dev-empty]')), counts: { ...globalThis.__QA_REAL_V188__.counts },
    boot: document.querySelectorAll('script[data-atf-dev-boot]').length, firstScript: document.querySelector('script')?.dataset.atfDevBoot || null }));
  check('normal game: native storage, no dev session object, no dev surface', normal.session === 'undefined' && !normal.own && normal.indexedDB === 'object' && normal.marker === null && !normal.hud, normal);
  check('normal game: the inline bootstrap is the first script and stayed inert', normal.boot === 1 && normal.firstScript === 'v188');
  check('normal game: it does read its real storage (positive control of the observer)', normal.counts.getter > 0 && normal.counts.read > 0, normal.counts);
  check('normal game: no developer file requested', devRequests().length === 0, devRequests().length);
  await page.evaluate(() => Promise.race([navigator.serviceWorker.ready, new Promise((_, reject) => setTimeout(() => reject(new Error('service worker not ready after 240 s')), 240000))]));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => globalThis.__ATF_V51__ && navigator.serviceWorker.controller, null, { timeout: 120000 });
  const keysBefore = await cacheKeys(page);
  check('service worker in control; Cache Storage holds the shell only', keysBefore.length > 500 && keysBefore.every(url => !url.includes(devPath) && !new URL(url).search), { entries: keysBefore.length });
  await shot(page, 'normal-title');

  // The player's real profile: a valid save (declared fixture), then every key of the real storage.
  const sentinelSession = buildDevSessionV188(buildDevCatalogV188().find(entry => entry.id === 'hub-armory'), { language: 'fr' });
  await page.evaluate(([key, value]) => { globalThis.__QA_REAL_V188__.set(key, value); globalThis.__QA_REAL_V188__.set('atf-qa-sentinel-v188', 'real player profile'); }, [DEV_PROFILE_KEY_V188, sentinelSession.storage[DEV_PROFILE_KEY_V188]]);
  const realBefore = await realSnapshot(page), databasesBefore = await databases(page);
  check('sentinel written to the real storage', realBefore.includes('atf-qa-sentinel-v188') && realBefore.length > 5000, { bytes: realBefore.length, databases: databasesBefore });

  // —— 2. Dev sessions from the hidden launcher ——
  const SAMPLE = [['start-title', 'fr'], ['prologue-p3-triage', 'en'], ['hub-armory', 'fr'], ['main-act1-qz17', 'fr'], ['colony-c1', 'fr'], ['cinematic-cin-cq-01', 'fr'], ['trials-xeno', 'fr']];
  let devWrites = 0;
  for (const [id, language] of SAMPLE) {
    let snap;
    try { snap = await launch(page, id, language); } catch (error) { check(`${id}: launched`, false, error.message); continue; }
    check(`${id}: landed on ${snap.expected}`, snap.status === 'ready' && snap.landed === snap.expected, snap);
    check(`${id}: language ${language}`, await page.evaluate(() => document.documentElement.lang) === language);
    if (id === 'colony-c1') {
      await page.locator('[data-dev-toggle="godMode"]').check(); await page.waitForTimeout(600);
      const health = await page.evaluate(() => { const e = globalThis.__ATF_V51__.engine; e.player.health = 5; return new Promise(done => setTimeout(() => done(e.player.health), 400)); });
      check('colony-c1: god mode (panel checkbox) restores health', health >= 100, health);
      await page.waitForTimeout(2500); // an autosave window, in the isolated storage
    }
    const state = await isolation(page); devWrites += state.writes || 0;
    check(`${id}: real localStorage never obtained, read or written; IndexedDB withheld`, state.isolated && state.own && state.marker === 'active'
      && state.counts.getter === 0 && state.counts.read === 0 && state.counts.write === 0 && state.indexedDB === 'undefined', state);
    check(`${id}: sentinel profile byte-identical during the session`, await realSnapshot(page) === realBefore);
    if (['hub-armory', 'main-act1-qz17', 'colony-c1', 'cinematic-cin-cq-01'].includes(id)) await shot(page, `built-${id}`);
  }
  check('the dev sessions did save, into the isolated storage', devWrites > 0, devWrites);

  // Reload inside a session: the session survives in this tab, still isolated.
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => ['ready', 'error'].includes(globalThis.__ATF_DEV_V188__?.status), null, { timeout: 150000 });
  const reloaded = await isolation(page);
  check('reload: session restored from this tab, still isolated', reloaded.marker === 'active' && reloaded.counts.getter === 0 && reloaded.counts.write === 0, reloaded);

  // Shooting range.
  const range = await launch(page, 'range', 'fr');
  check('range: landed', range.status === 'ready' && range.landed === 'range', range);
  await page.locator('[data-range-tab="weapons"]').click();
  await page.selectOption('[data-range-weapon]', 'weapon-003-m4a3-service-pistol');
  await page.locator('[data-range-equip-weapon]').click(); await page.waitForTimeout(500);
  await page.locator('[data-range-tab="targets"]').click();
  await page.fill('[data-range-distance]', '9');
  await page.locator('[data-range-dummy]').click();
  await page.evaluate(() => { const r = globalThis.__ATF_DEV_V188__.range; r.resetMeasures(); r.autoFire(2.5); });
  await page.waitForTimeout(3200);
  const measures = await page.evaluate(() => globalThis.__ATF_DEV_V188__.range.measures());
  check('range: pistol equipped, fired and measured on a dummy', measures.weapon.id === 'weapon-003-m4a3-service-pistol' && measures.fireRate.shots > 0 && measures.dps.damage > 0, { fireRate: measures.fireRate, dps: measures.dps });
  await page.locator('[data-range-tab="measures"]').click(); await page.waitForTimeout(400); await shot(page, 'built-range-measures');
  await page.locator('[data-range-tab="tuning"]').click();
  await page.locator('[data-range-tune="weapon"] [data-field="damage"]').fill('31');
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('[data-range-export]').click()]);
  const diff = JSON.parse(await page.locator('[data-range-diff]').textContent());
  check('range: tuning exported as a JSON diff', diff.count >= 1 && /\.json$/.test(download.suggestedFilename()), { count: diff.count });
  const rangeState = await isolation(page);
  check('range: real localStorage never obtained, read or written', rangeState.counts.getter === 0 && rangeState.counts.read === 0 && rangeState.counts.write === 0, rangeState.counts);
  await page.locator('[data-dev-exit]').click();
  await page.waitForURL(url => url.pathname === launcherPath);
  check('exit: back on the hidden launcher, session discarded', await page.evaluate(() => sessionStorage.getItem('atf-dev-session-v188')) === null);
  await page.waitForFunction(() => globalThis.__ATF_DEV_LAUNCHER_V188__);
  const launcherCounts = await realCounts(page);
  check('launcher page: real localStorage neither read nor written', launcherCounts.read === 0 && launcherCounts.write === 0, launcherCounts);

  // A dev URL typed by hand, in a tab without session: isolated and empty, nothing else.
  const stray = await context.newPage(); watch(stray);
  await stray.goto(`${baseUrl}/index.html?x=1&atf-dev=v188`, { waitUntil: 'domcontentloaded' });
  await stray.waitForFunction(() => globalThis.__ATF_V51__ && document.querySelector('[data-atf-dev-empty]'), null, { timeout: 120000 });
  const strayState = await isolation(stray);
  check('dev URL without session: isolated, empty, no launcher address disclosed', strayState.marker === 'empty' && strayState.isolated && strayState.counts.getter === 0
    && await stray.evaluate(path => !document.documentElement.outerHTML.includes(path) && !document.querySelector('#atf-dev-hud-v188'), devPath), strayState);
  check('dev URL without session: sentinel identical', await realSnapshot(stray) === realBefore);
  await stray.close();

  check('sentinel profile byte-identical after every dev session', await realSnapshot(page) === realBefore);
  check('no IndexedDB database created by the dev sessions', JSON.stringify(await databases(page)) === JSON.stringify(databasesBefore), await databases(page));
  const keysAfter = await cacheKeys(page);
  check('Cache Storage after the dev sessions: no developer file, no query URL', keysAfter.every(url => !url.includes(devPath) && !new URL(url).search), { before: keysBefore.length, after: keysAfter.length });
  check('the developer files were fetched on demand (network), only once the launcher was opened', devRequests().length > 0, devRequests().length);

  // —— 3. The normal game again: it still finds the real profile ——
  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => globalThis.__ATF_V51__ && globalThis.__ATF_V61__, null, { timeout: 120000 });
  for (let i = 0; i < 20 && await page.evaluate(() => { const intro = document.getElementById('intro-v188'); return Boolean(intro && intro.getClientRects().length); }); i += 1) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); }
  await page.locator('#title-start').click({ timeout: 15000 }).catch(() => {});
  await page.locator('#title-continue').waitFor({ state: 'visible', timeout: 15000 }).then(() => check('normal game after the dev sessions: « Continuer » offers the real profile', true), error => check('normal game after the dev sessions: « Continuer » offers the real profile', false, error.message));
  const after = await page.evaluate(() => ({ session: typeof globalThis.__ATF_DEV_SESSION_V188__, own: !(globalThis.__QA_REAL_V188__.native() && globalThis.__QA_REAL_V188__.reaches()), reads: globalThis.__QA_REAL_V188__.counts.read }));
  check('normal game after the dev sessions: native storage, real profile read', after.session === 'undefined' && !after.own && after.reads > 0, after);
  await shot(page, 'normal-after-dev');
  await context.close();

  // —— 4. Phone size, touch ——
  const phone = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await phone.addInitScript(OBSERVER);
  const mobile = await phone.newPage(); watch(mobile);
  const layout = () => mobile.evaluate(() => {
    const visible = element => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden';
    const controls = [...document.querySelectorAll('.atf-dev-launcher-v188 :is(button, select, input, summary), .atf-dev-hud-v188 :is(button, select, input), .atf-dev-range-v188 :is(button, select, input)')].filter(visible);
    const small = controls.filter(element => { const box = (element.type === 'checkbox' ? element.closest('label') || element : element).getBoundingClientRect(); return box.height < 40; })
      .map(element => `${element.tagName.toLowerCase()}${[...element.attributes].filter(a => a.name.startsWith('data-')).map(a => `[${a.name}]`).join('')}`);
    const wide = [...document.querySelectorAll('.atf-dev-hud-v188, .atf-dev-range-v188, .atf-dev-controls, .atf-dev-catalog')].filter(element => { const box = element.getBoundingClientRect(); return box.left < -0.5 || box.right > innerWidth + 0.5; }).length;
    return { controls: controls.length, small: [...new Set(small)].slice(0, 8), wide, overflow: document.documentElement.scrollWidth - innerWidth };
  });
  await mobile.goto(`${baseUrl}${launcherPath}`, { waitUntil: 'domcontentloaded' });
  await mobile.waitForFunction(() => globalThis.__ATF_DEV_LAUNCHER_V188__);
  await mobile.evaluate(([key, value]) => globalThis.__QA_REAL_V188__.set(key, value), [DEV_PROFILE_KEY_V188, sentinelSession.storage[DEV_PROFILE_KEY_V188]]);
  const phoneBefore = await realSnapshot(mobile);
  await mobile.locator('[data-dev-options] summary').tap();
  await mobile.locator('[data-dev-toggle="infiniteAmmo"]').tap();
  let phoneLayout = await layout();
  check('phone launcher: finger-size controls, no horizontal overflow', phoneLayout.controls > 20 && phoneLayout.small.length === 0 && phoneLayout.wide === 0 && phoneLayout.overflow <= 0, phoneLayout);
  await shot(mobile, 'phone-launcher');
  const phoneRange = await launch(mobile, 'range', 'fr', { tap: true });
  check('phone: range launched by a tap', phoneRange.status === 'ready' && phoneRange.landed === 'range' && phoneRange.toggles.infiniteAmmo === true, phoneRange);
  const folded = await mobile.evaluate(() => { const hud = document.querySelector('.atf-dev-hud-v188').getBoundingClientRect(), range = document.querySelector('.atf-dev-range-v188').getBoundingClientRect();
    const canvas = document.getElementById('game-canvas').getBoundingClientRect();
    return { hud: Math.round(hud.height), range: Math.round(range.height), canvasFree: canvas.top >= hud.bottom - 1 && canvas.bottom <= range.top + 1, canvas: [Math.round(canvas.top), Math.round(canvas.bottom)], rangeTop: Math.round(range.top) }; });
  check('phone: both panels start folded to one bar each', folded.hud <= 64 && folded.range <= 64, folded);
  await shot(mobile, 'phone-range-folded');
  await mobile.locator('[data-dev-collapse]').tap();
  await mobile.locator('[data-dev-toggle="godMode"]').tap();
  phoneLayout = await layout();
  check('phone DEV panel: unfolded by a tap, finger-size controls, option toggled', phoneLayout.small.length === 0 && phoneLayout.wide === 0 && phoneLayout.overflow <= 0
    && await mobile.evaluate(() => globalThis.__ATF_DEV_V188__.toggles.godMode === true), phoneLayout);
  await shot(mobile, 'phone-dev-panel');
  await mobile.locator('[data-dev-collapse]').tap();
  await mobile.locator('[data-range-tab="targets"]').tap();
  await mobile.locator('[data-range-dummy]').tap();
  await mobile.locator('[data-range-tab="weapons"]').tap();
  await mobile.evaluate(() => globalThis.__ATF_DEV_V188__.range.resetMeasures());
  await mobile.locator('[data-range-fire="3"]').tap();
  await mobile.waitForTimeout(3600);
  const phoneMeasures = await mobile.evaluate(() => globalThis.__ATF_DEV_V188__.range.measures());
  check('phone range: target added and weapon fired with taps', phoneMeasures.fireRate.shots > 0 && phoneMeasures.targets.length > 0, { shots: phoneMeasures.fireRate.shots, targets: phoneMeasures.targets.length });
  for (const tab of ['weapons', 'equipment', 'squad', 'targets', 'measures', 'tuning', 'log']) {
    await mobile.locator(`[data-range-tab="${tab}"]`).tap(); await mobile.waitForTimeout(250);
    phoneLayout = await layout();
    check(`phone range tab ${tab}: finger-size controls, no horizontal overflow`, phoneLayout.small.length === 0 && phoneLayout.wide === 0 && phoneLayout.overflow <= 0, phoneLayout);
    if (['weapons', 'targets', 'measures', 'tuning'].includes(tab)) await shot(mobile, `phone-range-${tab}`);
  }
  await mobile.locator('[data-range-collapse]').tap();
  check('phone range: folds back to one bar', await mobile.evaluate(() => document.querySelector('.atf-dev-range-v188').getBoundingClientRect().height <= 64));
  const phoneState = await isolation(mobile);
  check('phone: real localStorage never obtained, read or written', phoneState.counts.getter === 0 && phoneState.counts.read === 0 && phoneState.counts.write === 0 && await realSnapshot(mobile) === phoneBefore, phoneState.counts);
  await mobile.locator('[data-dev-collapse]').tap();
  await mobile.locator('[data-dev-exit]').tap();
  await mobile.waitForURL(url => url.pathname === launcherPath);
  check('phone: exit by a tap returns to the launcher', true);
  await phone.close();
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
check('no page error', report.pageErrors.length === 0, report.pageErrors.slice(0, 5));
check('no console error', report.consoleErrors.length === 0, report.consoleErrors.slice(0, 5));
check('no failed response', report.failedResponses.length === 0, [...new Set(report.failedResponses)].slice(0, 8));
await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2));
const failed = report.checks.filter(entry => !entry.passed);
console.log(`checks: ${report.checks.length - failed.length}/${report.checks.length} passed; page errors: ${report.pageErrors.length}; console errors: ${report.consoleErrors.length}`);
if (failed.length) process.exitCode = 1;
