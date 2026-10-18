import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';
import { WORLDS } from '../src/content.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.ATF_BASE_URL || 'http://127.0.0.1:4173';
const output = resolve(process.env.ATF_COCOON_QA_OUTPUT || join(tmpdir(), `atf-cocoon-v158-${Date.now()}`));
const rel = relative(root, output);
if (!rel || !rel.startsWith('..') && !isAbsolute(rel)) throw Error('Cocon QA evidence must remain outside the repository.');
const report = { status: 'running', startedAt: new Date().toISOString(), baseUrl: base, checks: [], captures: [],
  pageErrors: [], requestFailures: [], consoleErrors: [], phase: 'prepare',
  scope: 'Two actual Command launches of Cocon Noir: partial quiet cut, native pause/save/reload/Continue, remaining quiet release and ordinary walking; independent force release. Evaluations only read native state/canvas. No gameplay state, result, actor, time or method is injected.',
  fixture: { type: 'declared-legacy-profile-through-native-file-input', credits: 8158, unlockedWorlds: WORLDS.length },
  limitations: ['The profile unlocks routes; this does not certify natural campaign unlock progression.',
    'This journey verifies the dedicated procedural binding and its release, not the full extended survivor campaign or a new bitmap/atlas corpus.',
    'The first visible body may already be awake after browser asset loading; the initial wake phase and all simulation timing are also covered by the native Node suite.',
    'Canvas frames collected by an armed RAF observer belong to the observed transient phase; screen capture timing is not substituted for that state.'] };
let browser, page;
async function playwright() {
  if (process.env.ATF_PLAYWRIGHT_MODULE) return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
  try { return await import('playwright'); }
  catch (error) {
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__cocoon_qa__.cjs'))('playwright');
    throw Error('An existing Playwright and Chromium installation is required.', { cause: error });
  }
}
const observation = () => {
  const e = globalThis.__ATF_GAME__, p = e?.player, s = e?.blackCocoonV121;
  if (!p || !s) return null;
  return { campaign: e.campaign?.id, running: e.running, paused: e.paused, mission: e.mission?.state,
    loading: !!(e.enemyAtlasLoadingPausedV65 || e.userCasteLoadingV88), coop: e.coopEnabled,
    player: { x: p.x, y: p.y, w: p.w, h: p.h, health: p.health, ammo: p.ammo, reserve: p.ammoReserve,
      alive: p.alive, downed: p.downed, appearance: structuredClone(p.appearanceV126), bindingVisual: structuredClone(p.blackCocoonVisualV158),
      heldWeaponId: p.heldWeaponVisualV125?.weaponId || null },
    native: { elapsed: s.elapsed, freed: s.freed, cut: s.cocoonProgress, freedAt: s.freedAtV158,
      noise: s.noise, equipmentRecovered: s.equipmentRecovered, phase: s.phase },
    presentation: e.blackCocoonPresentationV158?.(), resume: structuredClone(e.lastResumeResult) };
};
const snapshot = () => page.evaluate(observation);
const check = (name, evidence) => { report.checks.push({ name, evidence }); };
const phase = name => { report.phase = name; };
async function capture(name) {
  const path = join(output, name); await page.locator('#game-canvas').screenshot({ path });
  report.captures.push({ path, sha256: createHash('sha256').update(await fs.readFile(path)).digest('hex') });
}
async function saveObservedFrame(handle, name) {
  const frame = await (await handle).jsonValue();
  const bytes = Buffer.from(frame.png.split(',')[1], 'base64'), path = join(output, name);
  await fs.writeFile(path, bytes); report.captures.push({ path, sha256: createHash('sha256').update(bytes).digest('hex'),
    captureMode: 'atomic-native-state-and-canvas-read-on-raf', observation: frame.observation });
  return frame.observation;
}
async function ready() {
  for (let i = 0; i < 30; i++) {
    if (await page.evaluate(() => !!globalThis.__ATF_GAME__?.running)) break;
    const advance = page.locator('[data-insertion-action="advance"]');
    if (await advance.isVisible()) await advance.click();
    await page.waitForTimeout(200);
  }
  await page.waitForFunction(() => { const e = globalThis.__ATF_GAME__; return e?.running && !e.paused
    && !e.enemyAtlasLoadingPausedV65 && !e.userCasteLoadingV88 && e.blackCocoonV121?.operationId === 'black-cocoon'; }, null, { timeout: 45000 });
  await page.locator('#game-canvas').focus();
}
async function launch() {
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, serviceWorkers: 'block' });
  page = await context.newPage(); page.setDefaultTimeout(45000);
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
  page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
  await page.goto(base, { waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click();
  await page.locator('#title-options').click();
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'command';
  save.galaxy.resources.credits = report.fixture.credits; save.galaxy.unlockedWorldIds = WORLDS.map(world => world.id);
  await page.locator('#save-import').setInputFiles({ name: 'cocoon-v158-declared-profile.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.waitForFunction(() => document.querySelector('#save-import').value === '');
  await page.waitForFunction(credits => {
    const stored = JSON.parse(localStorage.getItem('atf-v47-profile-1')), model = globalThis.__ATF_V51__?.saveSystem?.data;
    return stored?.galaxy?.resources?.credits === credits && model?.galaxy?.resources?.credits === credits
      && stored.needsPlayerCreationV84 === false && model.needsPlayerCreationV84 === false;
  }, report.fixture.credits);
  await page.locator('[data-view="command"]').click();
  await page.locator('#command-mission-v110').selectOption('special-black-cocoon');
  await page.locator('#operation-launch').click(); await ready();
  await page.waitForFunction(() => globalThis.__ATF_GAME__.player.blackCocoonVisualV158?.nativeBody === true);
  return context;
}
async function holdUntil(code, condition) {
  await page.keyboard.down(code);
  try { await page.waitForFunction(condition, null, { polling: 'raf', timeout: 30000 }); }
  finally { await page.keyboard.up(code); }
}

async function main() {
  await fs.mkdir(output, { recursive: true });
  const module = await playwright(), { chromium } = module.chromium ? module : module.default;
  browser = await chromium.launch({ headless: true,
    ...(process.env.ATF_CHROMIUM_EXECUTABLE ? { executablePath: process.env.ATF_CHROMIUM_EXECUTABLE } : {}) });
  report.browserVersion = browser.version();
  phase('quiet Command launch'); const context = await launch();
  const initial = await snapshot();
  assert.equal(initial.campaign, 'special-black-cocoon'); assert.equal(initial.native.freed, false);
  assert.equal(initial.coop, false); assert.equal(initial.player.bindingVisual.nativeBody, true);
  await capture('01-native-human-bound.png'); check('Native Command insertion renders the selected real modular human inside dedicated resin', initial);

  phase('partial quiet cut and pause');
  await holdUntil('KeyE', () => globalThis.__ATF_GAME__.blackCocoonV121.cocoonProgress >= 1.2);
  await page.keyboard.press('KeyP'); await page.waitForFunction(() => globalThis.__ATF_GAME__.paused);
  const partial = await snapshot(); assert.equal(partial.native.freed, false); assert.ok(partial.native.cut < 4);
  await page.waitForTimeout(450); assert.deepEqual(await snapshot(), partial);
  await capture('02-partial-cut-paused.png'); check('Held native E cuts progressively and pause freezes the same cut, pose and clock', partial);

  phase('native mission save and real reload/Continue');
  await page.locator('#mission-save-v86').click();
  await page.waitForFunction(cut => {
    const state = JSON.parse(localStorage.getItem('atf-v47-profile-1'))?.strategy?.currentOperation?.resumeState?.specialOperation?.blackCocoonV121;
    return state?.cocoonProgress === cut && state.freed === false;
  }, partial.native.cut);
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click();
  if (await page.locator('#title-continue').isVisible()) await page.locator('#title-continue').click();
  await page.locator('[data-view="command"]').click(); await page.locator('#continue-operation').click(); await ready();
  const restored = await snapshot(); assert.equal(restored.resume.applied, true);
  assert.equal(restored.native.cut, partial.native.cut); assert.equal(restored.native.freed, false);
  for (const key of ['health', 'ammo', 'reserve']) assert.equal(restored.player[key], partial.player[key]);
  assert.deepEqual(restored.player.appearance, partial.player.appearance);
  await capture('03-native-cut-resumed.png'); check('Native saved profile reloads the same partial cut, body, kit and finite resources', restored);

  phase('remaining quiet cut and observed release frame');
  // Arm the immutable observation before E. The captured native state and PNG
  // are read together on the first release RAF; no later RPC resamples the pose.
  const releaseFrame = page.waitForFunction(() => {
    const e = globalThis.__ATF_GAME__, view = e?.blackCocoonPresentationV158?.();
    if (!e?.blackCocoonV121?.freed || view?.phase !== 'release') return false;
    return { observation: { freed: e.blackCocoonV121.freed, elapsed: e.blackCocoonV121.elapsed,
      freedAt: e.blackCocoonV121.freedAtV158, release: view.release, anchor: view.anchor,
      actorPose: view.actorPose, x: e.player.x, health: e.player.health, ammo: e.player.ammo, reserve: e.player.ammoReserve },
      png: document.querySelector('#game-canvas').toDataURL('image/png') };
  }, null, { polling: 'raf', timeout: 30000 });
  await holdUntil('KeyE', () => globalThis.__ATF_GAME__.blackCocoonV121.freed);
  const released = await saveObservedFrame(releaseFrame, '04-observed-release-frame.png');
  assert.equal(released.freed, true); assert.equal(released.actorPose, false); assert.ok(released.release < 1);
  check('The real quiet release opens the binding while ordinary body control is restored immediately', released);
  const startX = (await snapshot()).player.x;
  await page.keyboard.down('KeyD');
  try { await page.waitForFunction(x => globalThis.__ATF_GAME__.player.x > x + 50, startX); }
  finally { await page.keyboard.up('KeyD'); }
  await page.waitForFunction(() => globalThis.__ATF_GAME__.blackCocoonPresentationV158().phase === 'settled');
  await page.keyboard.press('KeyP'); const walked = await snapshot();
  assert.deepEqual(walked.presentation.anchor, initial.presentation.anchor);
  assert.ok(walked.player.x > startX + 50); assert.equal(walked.presentation.actorPose, false);
  assert.equal(walked.player.heldWeaponId, null, 'The released body still has empty hands before its physical bag.');
  await capture('05-free-human-resin-left-at-support.png'); check('The free human walks away while severed resin remains at its original wall and floor', walked);
  phase('physical bag restores the same selected weapon without a resource grant');
  await page.keyboard.press('KeyP'); await page.locator('#game-canvas').focus();
  await holdUntil('KeyD', () => { const e = globalThis.__ATF_GAME__, bag = e.blackCocoonPropsV121.equipment;
    return Math.abs(e.player.x + e.player.w / 2 - bag.x) <= 80; });
  await holdUntil('KeyE', () => globalThis.__ATF_GAME__.blackCocoonV121.equipmentRecovered);
  await page.waitForFunction(() => !!globalThis.__ATF_GAME__.player.heldWeaponVisualV125?.weaponId);
  await page.keyboard.press('KeyP'); const equipped = await snapshot();
  assert.equal(equipped.native.equipmentRecovered, true); assert.ok(equipped.player.heldWeaponId);
  for (const key of ['ammo', 'reserve']) assert.equal(equipped.player[key], restored.player[key]);
  assert.deepEqual(equipped.player.appearance, restored.player.appearance);
  await capture('06-native-bag-and-same-kit.png'); check('The real bag interaction restores the equipped weapon visually without an ammunition or kit grant', equipped);
  await context.close();

  phase('independent continuous force Command launch'); const forceContext = await launch();
  const forceFrame = page.waitForFunction(() => {
    const e = globalThis.__ATF_GAME__, s = e?.blackCocoonV121, p = e?.blackCocoonPresentationV158?.();
    if (!s || s.freed || s.cocoonProgress < 1.4 || p?.phase !== 'force') return false;
    return { observation: { native: { elapsed: s.elapsed, cut: s.cocoonProgress, noise: s.noise, freed: s.freed },
      presentation: p, heldWeaponId: e.player.heldWeaponVisualV125?.weaponId || null,
      ammo: e.player.ammo, reserve: e.player.ammoReserve },
      png: document.querySelector('#game-canvas').toDataURL('image/png') };
  }, null, { polling: 'raf', timeout: 30000 });
  await holdUntil('KeyF', () => globalThis.__ATF_GAME__.blackCocoonV121.freed);
  const forcing = await saveObservedFrame(forceFrame, '07-observed-force-strain-and-noise.png');
  assert.equal(forcing.native.freed, false); assert.ok(forcing.native.noise > 0); assert.equal(forcing.heldWeaponId, null);
  check('Native F strains the same binding and produces actual hive noise before release', forcing);
  const forced = await snapshot(); assert.equal(forced.native.freed, true); assert.equal(forced.coop, false);
  const forceSeconds = forced.native.freedAt - (forcing.native.elapsed - forcing.native.cut / 2);
  assert.ok(forceSeconds >= 1.9 && forceSeconds < 2.1, 'Continuous force needs two native seconds, independently of browser/RPC latency.');
  assert.equal(forced.player.heldWeaponId, null);
  for (const key of ['ammo', 'reserve']) assert.equal(forced.player[key], forcing[key]);
  check('Force releases through the original faster rule without an ammunition grant or cooperative body', forced);
  await forceContext.close();
  assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.requestFailures, []); assert.deepEqual(report.consoleErrors, []);
  report.status = 'passed';
}
main().catch(async error => {
  report.status = 'failed'; report.error = { message: error.message, stack: error.stack };
  report.lastPassedCheck = report.checks.at(-1)?.name || null; report.failureState = await snapshot().catch(() => null);
  const diagnostic = JSON.stringify({ phase: report.phase, error: report.error, lastPassedCheck: report.lastPassedCheck, failureState: report.failureState });
  console.error(diagnostic); console.error('::error title=Cocon Noir V158::' + diagnostic.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A'));
  await page?.screenshot({ path: join(output, 'failure.png'), fullPage: true }).catch(() => {}); process.exitCode = 1;
}).finally(async () => {
  report.finishedAt = new Date().toISOString();
  report.sourceHashes = Object.fromEntries(await Promise.all(['src/black-cocoon-presentation-v158.js', 'src/black-cocoon-runtime-v121.js',
    'src/black-cocoon-state-v121.js', 'src/game-production-runtime.js', 'scripts/qa-black-cocoon-browser-v158.mjs'].map(async path =>
    [path, createHash('sha256').update(await fs.readFile(join(root, path))).digest('hex')])));
  await fs.mkdir(output, { recursive: true }); await fs.writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2));
  await browser?.close(); console.log(JSON.stringify({ status: report.status, checks: report.checks.length, captures: report.captures.length, report: join(output, 'report.json') }));
});
