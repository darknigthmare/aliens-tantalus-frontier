// Native Fiorina browser integration: fixture admission, real command menu,
// cut selector, launch, keyboard movement, quick-save and a real page reload.
// Fixture injections are reported. Actors, progression and inventory are never
// moved/advanced by this test. Each cut gets a fresh isolated browser context.
// Usage: BASE_URL=http://127.0.0.1:4399 PLAYWRIGHT_MODULE=playwright node scripts/qa-fiorina-native-v114.mjs [output]
// FIORINA_FIXTURE_PATH can supply a JSON fixture built by dev-fixtures-v188.js
// when this script runs outside a checkout (for example against the built game).
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4399/';
const out = resolve(process.argv[2] || 'qa-fiorina-native-v114');
const campaignId = 'special-alien3-fiorina-161';
const expectSpritesV116 = process.env.EXPECT_FIORINA_SPRITES_V116 === '1';
const expectSpritesV115 = process.env.EXPECT_FIORINA_SPRITES_V115 === '1' || expectSpritesV116;
await mkdir(out, { recursive: true });

async function fixture() {
  if (process.env.FIORINA_FIXTURE_PATH) return JSON.parse(await readFile(process.env.FIORINA_FIXTURE_PATH, 'utf8'));
  const { buildDevSaveV188 } = await import('../devtools/dev-fixtures-v188.js');
  const { inspectSaveSlotV78 } = await import('../src/save-profile-v78.js');
  const result = buildDevSaveV188({ kind: 'view', worldId: 'world-05-lethe' });
  result.save.scene = 'command';
  result.save.settings.coop = true;
  result.save.settings.reducedMotion = true;
  result.save.strategy.plannedCampaignId = null;
  for (const key of Object.keys(result.save.galaxy.resources)) result.save.galaxy.resources[key] = 10000;
  result.injections.push('strategic-resources-10000', 'coop-enabled-to-test-solo-isolation', 'command-view');
  result.inspection = inspectSaveSlotV78(JSON.stringify(result.save)).status;
  return result;
}

const sourceFixture = await fixture();
assert.equal(sourceFixture.inspection, 'ready', 'fixture must pass native save admission');
const report = { schema: 114, surface: 'native-production-app', baseUrl,
  expectSpritesV115, expectSpritesV116, spriteResponses: [],
  fixture: { inspection: sourceFixture.inspection, injections: sourceFixture.injections },
  checks: [], cuts: {}, screenshots: [], pageErrors: [], consoleErrors: [] };
const check = (name, condition, evidence = null) => {
  report.checks.push({ name, passed: Boolean(condition), evidence });
  assert.ok(condition, `${name}: ${JSON.stringify(evidence)}`);
};
let browser;
const screenshot = async (page, name, selector = null) => {
  const path = join(out, `${name}.png`);
  if (selector) await page.locator(selector).screenshot({ path });
  else await page.screenshot({ path, fullPage: false });
  report.screenshots.push(path);
};

async function enterProfile(page) {
  await page.waitForFunction(() => document.querySelector('#title-start')?.offsetParent || !document.querySelector('#app')?.hidden, null, { timeout: 60000 });
  if (await page.locator('#title-start').isVisible()) await page.locator('#title-start').click();
  if (await page.locator('#title-continue').isVisible()) await page.locator('#title-continue').click();
  await page.waitForFunction(() => document.querySelector('#app') && !document.querySelector('#app').hidden, null, { timeout: 45000 });
}
async function commandMenu(page) {
  const toggle = page.locator('#menu-toggle');
  if (await toggle.isVisible() && !((await page.locator('.rail').getAttribute('class')) || '').split(/\s+/).includes('open')) await toggle.click();
  await page.locator('[data-view="command"]').click();
  await page.locator('#command-mission-v110').waitFor({ state: 'visible' });
}
async function snapshot(page) {
  return page.evaluate(async () => {
    const { engine, saveSystem } = await import('/src/app.js');
    const state = engine.captureResumeState?.();
    return {
      campaignId: engine.campaign?.id, active: engine.isAlien3ProductionV114?.() === true,
      cut: state?.specialOperation?.alien3V114?.cut,
      phase: engine.alien3V88?.phase, player: { x: engine.player?.x, y: engine.player?.y },
      flares: engine.alien3V88?.flares,
      allies: engine.activeSquadActors?.()?.length ?? engine.squad?.length ?? 0,
      coop: Boolean(engine.coopEnabled || engine.coop?.alive), globalCoop: saveSystem.data.settings.coop,
      vehicle: Boolean(engine.vehicle?.active || engine.player?.inVehicle),
      operationId: saveSystem.data.strategy.currentOperation?.id,
      lastResumeApplied: engine.lastResumeResult?.applied === true,
      marineProfile: { weapons: [...saveSystem.data.player.weaponIds],
        equipment: [...saveSystem.data.player.equipmentIds], costume: saveSystem.data.player.costumeId }
    };
  });
}

async function verifySprites(page, cut, stage) {
  if (!expectSpritesV115) return;
  // Observe the natural idle render after launch/reload. Do not inject a pose,
  // replace the image loader, or manually invoke a drawing method in this test.
  await page.waitForFunction(() => {
    const engine = globalThis.__ATF_GAME__;
    const state = engine?.getAlien3SpriteReportV115?.();
    return state?.active && state.assets?.ready > 0 && state.receipts?.ripley?.drawn === true;
  }, null, { timeout: 60000 });
  const sprites = await page.evaluate(async () => {
    const engine = globalThis.__ATF_GAME__;
    await engine.alien3SpritesReadyV115;
    await engine.alien3SpriteBankV115.ready;
    return engine.getAlien3SpriteReportV115();
  });
  report.cuts[cut][stage + 'Sprites'] = sprites;
  check(`${cut}: ${stage} renders a delivered Ripley PNG`,
    sprites.receipts.ripley.drawn && sprites.receipts.ripley.id === 'ripley-crash-idle', sprites.receipts.ripley);
  check(`${cut}: ${stage} keeps the production image cache bounded`,
    !sprites.assets.preloadAll && sprites.assets.unrequested > 0
      && sprites.assets.cachedImages <= sprites.assets.maxCachedImages
      && sprites.assets.estimatedRgbaBytes <= sprites.assets.maxDecodedBytes
      && sprites.assets.errors.length === 0, sprites.assets);
  const responses = report.spriteResponses.filter((entry) => entry.cut === cut);
  check(`${cut}: ${stage} received real PNG resources`,
    responses.some((entry) => entry.status === 200 && entry.path.endsWith('/ripley-crash-idle.png')),
    responses);
}

async function verifyMovementSprites(page, cut) {
  if (!expectSpritesV116) return;
  // The existing keyboard journey drives physics. Observe its presentation;
  // neither the actor pose nor the bank is injected or manually preloaded.
  await page.waitForFunction(() => {
    const engine = globalThis.__ATF_GAME__;
    const receipt = engine?.getAlien3SpriteReportV115?.().receipts?.ripley;
    return engine?.player?.grounded && Math.abs(engine.player.vx || 0) > 2
      && receipt?.drawn && ['ripley-crash-walk', 'ripley-crash-run'].includes(receipt.id);
  }, null, { timeout: 5000 });
  const movement = await page.evaluate(() => {
    const engine = globalThis.__ATF_GAME__, report = engine.getAlien3SpriteReportV115();
    const receipt = report.receipts.ripley;
    const asset = engine.alien3SpriteBankV115.manifest.assets[receipt.id];
    return { receipt, vx: engine.player.vx, grounded: engine.player.grounded,
      source: asset.frames[receipt.frameIndex].src,
      distinctSources: [...new Set(asset.frames.map(frame => frame.src))], cache: report.assets };
  });
  report.cuts[cut].movingSprites = movement;
  check(`${cut}: keyboard motion renders the corresponding delivered pose`,
    movement.grounded && Math.abs(movement.vx) > 2
      && movement.receipt.id === (Math.abs(movement.vx) > 230 ? 'ripley-crash-run' : 'ripley-crash-walk'), movement);
  check(`${cut}: movement uses a real two-pose PNG asset`, movement.distinctSources.length === 2
    && report.spriteResponses.some(response => response.cut === cut && response.status === 200
      && response.path === '/' + movement.source), movement);
  check(`${cut}: movement keeps lazy loading bounded`, !movement.cache.preloadAll
    && movement.cache.cachedImages <= movement.cache.maxCachedImages
    && movement.cache.estimatedRgbaBytes <= movement.cache.maxDecodedBytes
    && movement.cache.errors.length === 0, movement.cache);
}

try {
  browser = await chromium.launch({
    ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}),
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  for (const cut of ['theatrical', 'assembly']) {
    const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    page.on('pageerror', error => report.pageErrors.push({ cut, message: error.message }));
    page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push({ cut, message: message.text() }); });
    page.on('response', response => {
      const path = new URL(response.url()).pathname;
      if (path.startsWith('/assets/openai/sprites/alien3-fiorina-v115/') && path.endsWith('.png')) {
        report.spriteResponses.push({ cut, path, status: response.status() });
      }
    });
    await context.addInitScript(({ save }) => {
      if (localStorage.getItem('fiorina-qa-seeded-v114')) return;
      localStorage.setItem('atf-v47-profile-1', JSON.stringify(save));
      localStorage.setItem('atf-v78-selected-profile', '1');
      localStorage.setItem('atf-language-v185', 'fr');
      localStorage.setItem('fiorina-qa-seeded-v114', '1');
    }, { save: sourceFixture.save });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await enterProfile(page);
    await commandMenu(page);
    check(`${cut}: native menu contains Fiorina`, await page.locator(`#command-mission-v110 option[value="${campaignId}"]`).count() === 1);
    await page.locator('#command-mission-v110').selectOption(campaignId);
    await page.locator('#fiorina-cut-v114').waitFor({ state: 'visible' });
    check(`${cut}: theatrical is the initial selection`, await page.locator('#fiorina-cut-v114').inputValue() === 'theatrical');
    await page.locator('#fiorina-cut-v114').selectOption(cut);
    const brief = await page.locator('#operation-plan').innerText();
    check(`${cut}: briefing identifies Ripley and the partial adaptation`, brief.includes('RIPLEY') && brief.includes('adaptation reste partielle') && brief.includes('FUSÉES DE DIVERSION'), brief);
    await screenshot(page, `${cut}-briefing`, '#operation-plan');
    await page.locator('#operation-launch').click();
    await page.waitForFunction(() => { const engine = globalThis.__ATF_GAME__; return engine?.isAlien3ProductionV114?.() === true && engine.running && !engine.paused && engine.mission?.state === 'active' && !engine.enemyAtlasLoadingPausedV65 && !engine.userCasteLoadingV88; }, null, { timeout: 60000 });
    const started = await snapshot(page);
    report.cuts[cut] = { started };
    check(`${cut}: native production engine launches the selected cut`, started.active && started.campaignId === campaignId && started.cut === cut, started);
    check(`${cut}: no squad or cooperative actor`, started.allies === 0 && !started.coop && started.globalCoop === true, { allies: started.allies, coop: started.coop, globalCoop: started.globalCoop });
    check(`${cut}: no vehicle or dropship overlay`, !started.vehicle && await page.locator('.cinematic-v188').count() === 0 && !(await page.locator('#mission-insertion-v62').isVisible()), { vehicle: started.vehicle });
    check(`${cut}: native controls identify flares`, (await page.locator('.game-toolbar .controls').innerText()).includes('F : FUSÉE'));
    await verifySprites(page, cut, 'started');
    await screenshot(page, `${cut}-mission`, '#game-canvas');
    await page.locator('#game-canvas').focus();
    await page.keyboard.down('d');
    try {
      await page.waitForTimeout(1000);
      await verifyMovementSprites(page, cut);
      if (expectSpritesV116) await screenshot(page, `${cut}-moving`, '#game-canvas');
    } finally { await page.keyboard.up('d'); }
    const moved = await snapshot(page);
    check(`${cut}: keyboard movement traverses physical coast`, Number.isFinite(moved.player.x) && moved.player.x > started.player.x + 25, { from: started.player, to: moved.player });
    await page.keyboard.press('f', { delay: 100 });
    await page.waitForTimeout(150);
    await page.locator('#mission-save-v160').click();
    const saved = await snapshot(page);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('atf-v47-profile-1'))?.strategy?.currentOperation);
    check(`${cut}: quick-save stores the selected cut`, stored?.resumeState?.specialOperation?.alien3V114?.cut === cut, { savedCut: stored?.resumeState?.specialOperation?.alien3V114?.cut });
    check(`${cut}: flare input respects its finite stock`, Number.isFinite(saved.flares) && saved.flares === Math.max(0, started.flares - 1), { before: started.flares, after: saved.flares });
    report.cuts[cut].saved = { position: saved.player, flares: saved.flares, operationId: stored?.id };
    await page.reload({ waitUntil: 'domcontentloaded' });
    await enterProfile(page);
    await commandMenu(page);
    await page.locator('#fiorina-cut-v114').waitFor({ state: 'visible' });
    check(`${cut}: resumed briefing locks its stored cut`, await page.locator('#fiorina-cut-v114').inputValue() === cut && await page.locator('#fiorina-cut-v114').isDisabled());
    await page.locator('#operation-launch').click();
    await page.waitForFunction(() => globalThis.__ATF_GAME__?.lastResumeResult?.applied === true);
    const resumed = await snapshot(page);
    report.cuts[cut].resumed = { cut: resumed.cut, position: resumed.player, flares: resumed.flares, operationId: resumed.operationId };
    check(`${cut}: reload restores the same operation and cut`, resumed.operationId === stored.id && resumed.cut === cut && resumed.lastResumeApplied, report.cuts[cut].resumed);
    check(`${cut}: reload preserves position and flare resource`, Math.abs(resumed.player.x - saved.player.x) <= 12 && resumed.flares === saved.flares, { saved: report.cuts[cut].saved, resumed: report.cuts[cut].resumed });
    check(`${cut}: profile marine loadout is preserved`, JSON.stringify(resumed.marineProfile) === JSON.stringify(started.marineProfile), resumed.marineProfile);
    await verifySprites(page, cut, 'resumed');
    await screenshot(page, `${cut}-resumed`, '#game-canvas');
    await context.close();
  }
  check('no JavaScript page errors', report.pageErrors.length === 0, report.pageErrors);
} catch (error) {
  report.error = error.stack || error.message;
  process.exitCode = 1;
} finally {
  report.ok = !report.error && report.checks.every(entry => entry.passed);
  await writeFile(join(out, 'fiorina-native-v114.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ok: report.ok, checks: report.checks.length, failures: report.checks.filter(entry => !entry.passed).map(entry => entry.name), error: report.error?.slice(0, 700), report: join(out, 'fiorina-native-v114.json') }));
  await browser?.close();
}
