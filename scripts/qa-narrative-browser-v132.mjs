import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';

// A real ordinary ship launch, native movement/E and the actual mission reader.
// All page evaluations only observe state. No runtime position, evidence,
// objective, resource or playback method is injected.
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.ATF_BASE_URL || 'http://127.0.0.1:4173';
const output = resolve(process.env.ATF_NARRATIVE_QA_OUTPUT || join(tmpdir(), `atf-narrative-v132-${Date.now()}`));
const outputRelative = relative(repository, output);
if (!outputRelative || !outputRelative.startsWith('..') && !isAbsolute(outputRelative)) throw new Error('QA evidence must remain outside the checkout.');
async function playwrightModule() {
  if (process.env.ATF_PLAYWRIGHT_MODULE) return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
  try { return await import('playwright'); } catch (error) {
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__narrative_qa__.cjs'))('playwright');
    throw new Error('An existing Playwright and Chromium installation is required.', { cause: error });
  }
}
const report = { startedAt: new Date().toISOString(), status: 'running', checks: [], pageErrors: [], requestFailures: [],
  method: 'Save picker imports an idle legacy profile; actual Command launch, keyboard actions and visible archive controls; runtime observations only.' };
let browser, page;
const snapshot = () => page.evaluate(() => {
  const engine = globalThis.__ATF_GAME__, actor = engine?.player;
  const save = JSON.parse(localStorage.getItem('atf-v47-profile-1') || 'null');
  return { running: engine?.running, paused: engine?.paused, loading: Boolean(engine?.enemyAtlasLoadingPausedV65 || engine?.userCasteLoadingV88),
    mission: engine?.mission?.state, player: actor && { x: actor.x, y: actor.y, w: actor.w, h: actor.h, health: actor.health,
      shots: actor.shots, grounded: actor.grounded }, evidence: engine?.narrativeEvidenceSnapshotV132?.(),
    vertical: engine?.getVerticalWorldSnapshotV130?.(),
    journal: save?.narrativeEvidenceV132, inventoryIntel: engine?.inventory?.intel };
});
function check(label, evidence) { report.checks.push({ label, evidence }); }
async function main() {
  await fs.mkdir(output, { recursive: true });
  const module = await playwrightModule(), { chromium } = module.chromium ? module : module.default;
  browser = await chromium.launch({ headless: true, ...(process.env.ATF_CHROMIUM_EXECUTABLE ? { executablePath: process.env.ATF_CHROMIUM_EXECUTABLE } : {}) });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, serviceWorkers: 'block' });
  page = await context.newPage(); page.setDefaultTimeout(25000);
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('#title-start').click({ timeout: 45000 }); await page.locator('#title-options').click();
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'command';
  await page.locator('#save-import').setInputFiles({ name: 'narrative-idle-legacy-profile.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).waitFor();
  await page.locator('[data-view="command"]').click(); await page.locator('#command-mission-v110').selectOption('pair-004-frontier');
  await page.locator('#operation-launch').click();
  for (let step = 0; step < 20 && !await page.evaluate(() => globalThis.__ATF_GAME__?.running); step++) {
    const advance = page.locator('[data-insertion-action="advance"]'); if (await advance.isVisible()) await advance.click();
    await page.waitForTimeout(250);
  }
  await page.locator('#game-canvas').waitFor({ state: 'visible' });
  await page.waitForFunction(() => {
    const engine = globalThis.__ATF_GAME__; return engine?.running && !engine.paused && !engine.enemyAtlasLoadingPausedV65
      && !engine.userCasteLoadingV88 && engine.player.grounded;
  }, null, { timeout: 45000 });
  await page.locator('#game-canvas').focus();
  let state = await snapshot(); assert.equal(state.evidence.placements.length, 2);
  assert.equal(state.evidence.discovered, 0); assert.equal(state.evidence.objectives.length, 2);
  // Keep the deployed crew at the lower landing through the real command
  // dock, so the human's narrow elevator journey cannot lift into a follower.
  await page.keyboard.press('KeyC');
  const squadDock = page.locator('.squad-command-v132'); await squadDock.waitFor({ state: 'visible' });
  await squadDock.locator('[data-squad-action="order"][data-squad-value="hold"]').click();
  await page.keyboard.press('Escape'); await squadDock.waitFor({ state: 'hidden' });
  const target = state.evidence.placements.find(item => item.id === 'qz17-service-cache-v132'); assert.ok(target);
  check('Ordinary ship deploys two supported optional clues with no prior discoveries', state.evidence);
  const destinationY = target.y + target.h;
  if (Math.abs(destinationY - state.player.y - state.player.h) > 3) {
    const lift = state.vertical.lifts.find(item => item.stops.some(stop => Math.abs(stop.y - destinationY) < 2)
      && item.stops.some(stop => Math.abs(stop.y - state.player.y - state.player.h) < 2));
    assert.ok(lift, 'A native vertical connector must serve the clue floor.');
    await page.keyboard.down('KeyD');
    try { await page.waitForFunction(x => { const p = globalThis.__ATF_GAME__.player; return p.x + p.w / 2 >= x - 18; }, lift.x + 72); }
    finally { await page.keyboard.up('KeyD'); }
    await page.waitForTimeout(150);
    await page.keyboard.press('KeyE');
    await page.waitForFunction(({ id, y }) => Math.abs(globalThis.__ATF_GAME__.lifts.find(item => item.id === id).y - y) < .1,
      { id: lift.id, y: destinationY }, { timeout: 15000 });
    await page.waitForTimeout(200); state = await snapshot();
    assert.ok(Math.abs(state.player.y + state.player.h - destinationY) < 2);
    check('The real lift carries the operator to the evidence floor without moving the clue', { liftId: lift.id, floorY: destinationY });
  }
  const direction = target.x > state.player.x ? 'KeyD' : 'KeyA';
  await page.keyboard.down(direction);
  try {
    await page.waitForFunction(id => {
      const engine = globalThis.__ATF_GAME__, actor = engine.player, item = engine.evidenceActorsV132.find(entry => entry.id === id);
      return Math.hypot(actor.x + actor.w / 2 - item.x - item.w / 2, actor.y + actor.h / 2 - item.y - item.h / 2) < 85;
    }, target.id, { timeout: 25000, polling: 'raf' });
  } finally { await page.keyboard.up(direction); }
  await page.waitForTimeout(120); state = await snapshot(); const intel = state.inventoryIntel;
  await page.keyboard.press('KeyE');
  const overlay = page.locator('#mission-archives-overlay-v68'), reader = page.locator('#mission-narrative-archives-v68');
  await overlay.waitFor({ state: 'visible' });
  await reader.locator(`[data-archive-entry="${target.id}"]`).waitFor();
  await page.waitForFunction(id => {
    const save = JSON.parse(localStorage.getItem('atf-v47-profile-1') || 'null'); return save?.narrativeEvidenceV132?.readIds.includes(id);
  }, target.id);
  state = await snapshot(); assert.equal(state.paused, true); assert.equal(state.inventoryIntel, intel);
  assert.ok(state.journal.discovered[target.id]); assert.ok(state.journal.mediaCaptures['echo9-blackbox-v132']);
  check('Native E collects once, opens the matching reader, pauses the mission and persists the read without an intel reward', {
    id: target.id, receipt: state.journal.discovered[target.id], read: state.journal.readIds, intel: state.inventoryIntel
  });
  const simulationTime = await page.evaluate(() => globalThis.__ATF_GAME__.mission.elapsed);
  await page.waitForTimeout(350); assert.equal(await page.evaluate(() => globalThis.__ATF_GAME__.mission.elapsed), simulationTime);
  const play = reader.locator('[data-archive-media-play="echo9-blackbox-v132"]'), seek = reader.locator('[data-archive-media-seek="echo9-blackbox-v132"]');
  await play.click();
  await page.waitForFunction(() => Number(document.querySelector('#mission-narrative-archives-v68 [data-archive-media-seek]').value) > 0,
    null, { timeout: 5000 });
  const time = Number(await seek.inputValue()); assert.ok(time > 0);
  await play.click(); const stopped = await seek.inputValue(); await page.waitForTimeout(180); assert.equal(await seek.inputValue(), stopped);
  await seek.focus(); await page.keyboard.press('End'); assert.ok(Math.abs(Number(await seek.inputValue()) - Number(await seek.getAttribute('max'))) < .011);
  await page.keyboard.press('Home'); assert.equal(Number(await seek.inputValue()), 0);
  const shots = (await snapshot()).player.shots; await page.keyboard.press('KeyF'); assert.equal((await snapshot()).player.shots, shots);
  assert.equal(await page.evaluate(() => globalThis.__ATF_GAME__.mission.elapsed), simulationTime);
  check('Actual black-box playback advances independently, pauses, seeks with keyboard and keeps game controls suspended', { stopped, duration: await seek.getAttribute('max') });
  await play.click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('atf-v47-profile-1') || 'null')?.narrativeEvidenceV132?.playedIds.includes('echo9-blackbox-v132'));
  state = await snapshot();
  assert.equal(state.journal.playedIds.length, 1); assert.ok(state.journal.mediaCaptures['echo9-blackbox-v132'].frames.length >= 2);
  assert.equal(await reader.locator('audio,video').count(), 0);
  check('Finishing real playback persists its addressable trace without inventing an audio/video track', { mediaId: 'echo9-blackbox-v132',
    frames: state.journal.mediaCaptures['echo9-blackbox-v132'].frames.length, played: state.journal.playedIds });
  await overlay.screenshot({ path: join(output, '01-recovered-blackbox.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await overlay.screenshot({ path: join(output, '02-mobile-archives.png') });
  const bounds = await overlay.boundingBox(); assert.ok(bounds.x >= -1 && bounds.x + bounds.width <= 391);
  check('Archive dialog remains within the 390px viewport', bounds);
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.locator('#close-mission-archives-v68').click(); assert.equal((await snapshot()).paused, false);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'game-canvas');
  await page.keyboard.press('KeyE'); assert.equal((await snapshot()).evidence.discovered, 1);
  check('Closing restores the canvas and collecting again cannot duplicate the evidence or reward', (await snapshot()).evidence);
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 });
  await page.locator('#title-options').click();
  await page.locator('[data-view="archives"]').click();
  const library = page.locator('#narrative-archives-v68'); await library.locator(`[data-archive-entry="${target.id}"]`).click();
  await library.locator('[data-archive-media-play="echo9-blackbox-v132"]').waitFor();
  const persisted = await snapshot(); assert.ok(persisted.journal.readIds.includes(target.id));
  assert.deepEqual(persisted.journal.playedIds, ['echo9-blackbox-v132']);
  check('Reload preserves the same proof, journal and replay in the permanent library', { discovered: Object.keys(persisted.journal.discovered), played: persisted.journal.playedIds });
  assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.requestFailures, []);
  report.status = 'passed';
}
main().catch(async error => {
  report.status = 'failed'; report.error = { message: error.message, stack: error.stack };
  if (page) { report.lastState = await snapshot().catch(() => null); await page.screenshot({ path: join(output, 'failure.png'), fullPage: true }).catch(() => {}); }
  process.exitCode = 1;
}).finally(async () => {
  report.finishedAt = new Date().toISOString(); await fs.mkdir(output, { recursive: true });
  await fs.writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2)); await browser?.close();
  console.log(JSON.stringify({ status: report.status, checks: report.checks.length, error: report.error?.message, report: join(output, 'report.json') }));
});
