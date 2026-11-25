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
  fixture: { inspection: sourceFixture.inspection, injections: sourceFixture.injections },
  checks: [], cuts: {}, screenshots: [], pageErrors: [], consoleErrors: [] };
const check = (name, condition, evidence = null) => {
  report.checks.push({ name, passed: Boolean(condition), evidence });
  assert.ok(condition, `${name}: ${JSON.stringify(evidence)}`);
};
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}),
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});
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
      campaignId: engine.campaign?.id, active: engine.isAlien3V88?.() === true,
      cut: state?.specialOperation?.alien3V114?.cut,
      phase: engine.alien3V88?.phase, player: { x: engine.player?.x, y: engine.player?.y },
      flares: engine.alien3V88?.flares,
      allies: engine.activeSquadActors?.()?.length ?? engine.squad?.length ?? 0,
      coop: Boolean(engine.coopEnabled || engine.coop?.alive), globalCoop: saveSystem.data.settings.coop,
      vehicle: Boolean(engine.vehicle?.active || engine.player?.inVehicle),
      operationId: saveSystem.data.strategy.currentOperation?.id,
      lastResumeApplied: engine.lastResumeResult?.applied === true,
      marineProfile: { weapon: saveSystem.data.strategy.loadout?.weaponId,
        equipment: saveSystem.data.strategy.loadout?.equipmentIds }
    };
  });
}

try {
  for (const cut of ['theatrical', 'assembly']) {
    const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    page.on('pageerror', error => report.pageErrors.push({ cut, message: error.message }));
    page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push({ cut, message: message.text() }); });
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
    await page.waitForFunction(async () => (await import('/src/app.js')).engine.isAlien3V88?.() === true);
    const started = await snapshot(page);
    report.cuts[cut] = { started };
    check(`${cut}: native production engine launches the selected cut`, started.active && started.campaignId === campaignId && started.cut === cut, started);
    check(`${cut}: no squad or cooperative actor`, started.allies === 0 && !started.coop && started.globalCoop === true, { allies: started.allies, coop: started.coop, globalCoop: started.globalCoop });
    check(`${cut}: no vehicle or dropship overlay`, !started.vehicle && await page.locator('.cinematic-v188').count() === 0 && !(await page.locator('#mission-insertion-v62').isVisible()), { vehicle: started.vehicle });
    check(`${cut}: native controls identify flares`, (await page.locator('.game-toolbar .controls').innerText()).includes('F : FUSÉE'));
    await screenshot(page, `${cut}-mission`, '#game-canvas');
    await page.locator('#game-canvas').focus();
    await page.keyboard.down('d');
    await page.waitForTimeout(1000);
    await page.keyboard.up('d');
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
    await page.waitForFunction(async () => (await import('/src/app.js')).engine.lastResumeResult?.applied === true);
    const resumed = await snapshot(page);
    report.cuts[cut].resumed = { cut: resumed.cut, position: resumed.player, flares: resumed.flares, operationId: resumed.operationId };
    check(`${cut}: reload restores the same operation and cut`, resumed.operationId === stored.id && resumed.cut === cut && resumed.lastResumeApplied, report.cuts[cut].resumed);
    check(`${cut}: reload preserves position and flare resource`, Math.abs(resumed.player.x - saved.player.x) <= 12 && resumed.flares === saved.flares, { saved: report.cuts[cut].saved, resumed: report.cuts[cut].resumed });
    check(`${cut}: profile marine loadout is preserved`, JSON.stringify(resumed.marineProfile) === JSON.stringify(started.marineProfile), resumed.marineProfile);
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
  await browser.close();
}
