import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Optional visual smoke test: use an existing Playwright/Chromium installation.
// ATF_BASE_URL=https://preview.example ATF_PLAYER_QA_OUTPUT=/tmp/player-qa \
//   node scripts/qa-player-browser-v124.mjs
// It creates a fresh browser context and imports an editor plan through the UI.
// Browser evaluations only read the live runtime; no game/save state is injected.
const baseUrl = process.env.ATF_BASE_URL || 'http://127.0.0.1:4173';
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(process.env.ATF_PLAYER_QA_OUTPUT || join(tmpdir(), `atf-player-v124-${Date.now()}`));
const outputRelative = relative(repository, output);
if (!outputRelative || !outputRelative.startsWith('..') && !isAbsolute(outputRelative)) {
  throw new Error('ATF_PLAYER_QA_OUTPUT must be outside the repository; screenshots are review artifacts.');
}
await mkdir(output, { recursive: true });

async function playwrightModule() {
  if (process.env.ATF_PLAYWRIGHT_MODULE) return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
  try { return await import('playwright'); } catch (error) {
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) {
      const require = createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__player_qa__.cjs'));
      return require('playwright');
    }
    throw new Error('Install Playwright and Chromium in the QA environment before running this optional script.', { cause: error });
  }
}

const report = { schema: 124, baseUrl, startedAt: new Date().toISOString(), status: 'running',
  scenario: 'Production mission entered through Frontier Forge UI; isolated browser context.',
  checks: [], captures: [], pageErrors: [], requestFailures: [],
  limitations: ['No physical gamepad or mobile device is connected.',
    'Cover, medical cancellation and deployable persistence are covered separately by the production runtime integration suite; the imported editor plan does not supply cover.'] };
let browser, page;

try {
  const { chromium } = await playwrightModule();
  browser = await chromium.launch({ headless: process.env.ATF_HEADED !== '1',
    ...(process.env.ATF_CHROMIUM_EXECUTABLE ? { executablePath: process.env.ATF_CHROMIUM_EXECUTABLE } : {}) });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1, serviceWorkers: 'block' });
  page = await context.newPage();
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), failure: request.failure()?.errorText }));
  page.setDefaultTimeout(15000);

  const snapshot = () => page.evaluate(() => {
    const engine = globalThis.__ATF_GAME__, actor = engine?.player;
    if (!engine || !actor) return null;
    return { running: engine.running, paused: engine.paused, loading: Boolean(engine.enemyAtlasLoadingPausedV65 || engine.userCasteLoadingV88),
      editorMode: engine.editorMode, phase: engine.mission?.state, elapsed: engine.animationTime,
      keys: [...(engine.keys || [])], player: { x: actor.x, y: actor.y, vx: actor.vx, vy: actor.vy,
        grounded: actor.grounded, crouching: actor.crouching, aiming: actor.aimingV124, facing: actor.facing,
        health: actor.health, ammo: actor.ammo, ammoReserve: actor.ammoReserve, shots: actor.shots,
        reloading: actor.reloading, movement: actor.movementV124, presentation: actor.playerPresentationV124,
        fieldAction: actor.fieldActionV124, cover: actor.coverV124 ? { id: actor.coverV124.id, peeking: actor.coverV124.peeking } : null } };
  });
  const capture = async (filename, label) => {
    await page.locator('#game-canvas').screenshot({ path: join(output, filename) });
    report.captures.push({ filename, label, state: await snapshot() });
  };
  const check = (label, evidence) => report.checks.push({ label, status: 'passed', evidence });

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('#title-forge').waitFor({ state: 'visible', timeout: 45000 });
  await page.locator('#title-forge').click();
  await page.locator('#editor-canvas').waitFor({ state: 'visible' });
  const plan = { schema: 2, kind: 'mission', size: [32, 18], tiles: [
    ...Array.from({ length: 32 }, (_, column) => ({ position: `${column}:16`, type: 'floor' })),
    { position: '2:15', type: 'spawn' }, { position: '30:15', type: 'objective' },
    { position: '8:14', type: 'ladder' }, { position: '8:12', type: 'platform' },
    { position: '12:15', type: 'door' }, { position: '20:15', type: 'terminal' }
  ] };
  await page.locator('#editor-import').setInputFiles({ name: 'player-v124-qa-stage.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(plan)) });
  await page.locator('#editor-play').click();
  await page.locator('#game-canvas').waitFor({ state: 'visible' });
  await page.waitForFunction(() => {
    const engine = globalThis.__ATF_GAME__;
    return engine?.running && !engine.paused && !engine.enemyAtlasLoadingPausedV65 && !engine.userCasteLoadingV88 && engine.player?.grounded;
  }, null, { timeout: 45000 });
  const canvas = page.locator('#game-canvas');
  await canvas.focus(); await page.waitForTimeout(250);
  const initial = await snapshot(); assert.equal(initial.editorMode, true); assert.equal(initial.phase, 'active');
  await capture('01-idle.png', 'Idle in a production Forge playtest');
  check('Production playtest launched through the editor UI', initial);

  await page.keyboard.down('KeyD'); await page.waitForTimeout(600);
  const running = await snapshot(); assert.ok(running.player.x > initial.player.x + 50);
  await capture('02-run.png', 'Running after a held movement key');
  await page.keyboard.up('KeyD'); await page.waitForTimeout(450);
  check('Movement advances the physical actor', { before: initial.player.x, after: running.player.x });

  await page.keyboard.down('KeyZ'); await page.waitForTimeout(150);
  const crouched = await snapshot(); assert.equal(crouched.player.crouching, true);
  await capture('03-crouch.png', 'Dedicated crouch input');
  await page.keyboard.down('ShiftLeft'); await page.keyboard.down('KeyD'); await page.waitForTimeout(300);
  const aimed = await snapshot();
  assert.equal(aimed.player.crouching, true); assert.equal(aimed.player.aiming, true);
  assert.equal(aimed.player.ammo, crouched.player.ammo); assert.ok(Math.abs(aimed.player.x - crouched.player.x) < 3);
  await capture('04-crouch-aim.png', 'Stationary crouched aim');
  await page.keyboard.up('KeyD'); await page.keyboard.up('ShiftLeft'); await page.keyboard.up('KeyZ');
  check('Shift aiming preserves crouch without movement or ammo use', aimed.player);

  const beforeJump = await snapshot();
  await page.keyboard.down('Space');
  await page.waitForFunction(() => globalThis.__ATF_GAME__?.player?.vy < 0);
  await capture('05-jump.png', 'Physical jump after a press edge');
  await page.waitForTimeout(2600);
  const heldJump = await snapshot();
  assert.equal(heldJump.player.grounded, true); assert.ok(Math.abs(heldJump.player.y - beforeJump.player.y) < 1);
  await page.keyboard.up('Space');
  check('Holding jump through landing does not keep the actor bouncing', heldJump.player);

  const rect = await canvas.boundingBox();
  await page.mouse.move(rect.x + rect.width * 0.77, rect.y + rect.height * 0.45);
  const beforeAim = await snapshot();
  await page.mouse.down({ button: 'right' }); await page.waitForTimeout(250);
  assert.equal((await snapshot()).player.ammo, beforeAim.player.ammo);
  await page.mouse.down({ button: 'left' }); await page.waitForTimeout(120);
  const firing = await snapshot(); assert.ok(firing.player.shots > beforeAim.player.shots);
  await capture('06-fire.png', 'Firing with RMB aim and LMB chord');
  await page.mouse.up({ button: 'left' });
  const shotsAfterRelease = (await snapshot()).player.shots;
  await page.waitForTimeout(300);
  const aimOnly = await snapshot();
  assert.equal(aimOnly.player.aiming, true); assert.equal(aimOnly.player.shots, shotsAfterRelease);
  await page.mouse.up({ button: 'right' });
  check('RMB aim and LMB fire remain independent on press and release', { beforeAim: beforeAim.player, firing: firing.player, aimOnly: aimOnly.player });

  await canvas.focus(); await page.keyboard.press('KeyR');
  await page.waitForFunction(() => globalThis.__ATF_GAME__?.player?.reloading);
  await capture('07-reload.png', 'Timed tactical reload');
  await page.waitForFunction(() => !globalThis.__ATF_GAME__?.player?.reloading);
  assert.ok((await snapshot()).player.ammo > aimOnly.player.ammo);
  check('Reload completes on the live simulation clock', (await snapshot()).player);

  await page.keyboard.down('KeyD');
  const otherTab = await context.newPage(); await otherTab.goto('about:blank'); await otherTab.bringToFront();
  await page.waitForFunction(() => globalThis.__ATF_GAME__?.paused, null, { timeout: 5000 });
  const blurred = await snapshot(); assert.equal(blurred.keys.length, 0);
  await page.bringToFront(); await page.keyboard.up('KeyD'); await otherTab.close();
  await capture('08-focus-pause.png', 'Focus loss pauses and clears input');
  check('Switching browser tabs releases held movement and pauses', blurred);
  await canvas.focus(); await page.keyboard.press('KeyP');
  await page.waitForFunction(() => !globalThis.__ATF_GAME__?.paused);
  await page.locator('#retreat-mission').click();
  await page.locator('#editor-canvas').waitFor({ state: 'visible' });
  assert.equal((await snapshot()).running, false);
  check('Returning from the playtest stops the runtime', { editorVisible: true });
  assert.equal(report.pageErrors.length, 0, `Browser exceptions: ${report.pageErrors.join('; ')}`);
  report.status = 'passed';
} catch (error) {
  report.status = 'failed'; report.error = { message: error.message, stack: error.stack };
  if (page && !page.isClosed()) await page.screenshot({ path: join(output, 'failure.png'), fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  await writeFile(join(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await browser?.close();
  console.log(`Player browser QA ${report.status}: ${join(output, 'report.json')}`);
}
