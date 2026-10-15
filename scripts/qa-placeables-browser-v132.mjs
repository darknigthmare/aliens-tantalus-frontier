import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';

// The fixture enters via the public save import. All mission changes use actual
// keyboard/dock buttons; evaluate observes state and never assigns gameplay.
const baseUrl = process.env.ATF_BASE_URL || 'http://127.0.0.1:4173';
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(process.env.ATF_PLACEABLES_QA_OUTPUT || join(tmpdir(), `atf-placeables-v132-${Date.now()}`));
const location = relative(repository, output);
if (!location || !location.startsWith('..') && !isAbsolute(location)) throw new Error('Placeable QA artifacts must be outside the repository.');
const ids = { barrier: 'equipment-028-portable-quarantine', ammo: 'equipment-021-ammo-satchel' };
const equipmentIds = [ids.barrier, ids.ammo, 'equipment-014-portable-battery', 'equipment-020-portable-sentry',
  'equipment-024-cryo-mine', 'equipment-026-electroshock-trap', 'equipment-023-signal-jammer', 'equipment-030-colony-beacon'];
async function playwright() {
  if (process.env.ATF_PLAYWRIGHT_MODULE) return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
  try { return await import('playwright'); } catch (error) {
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__placeables_qa__.cjs'))('playwright');
    throw new Error('An existing Playwright installation is required.', { cause: error });
  }
}
const report = { startedAt: new Date().toISOString(), checks: [], pageErrors: [], requestFailures: [],
  scenario: 'Legacy profile with eight exact equipped tools imported through the real save picker, then a standard Command operation. Mission evaluation is read-only.' };
let browser, page;
const snapshot = () => page.evaluate(() => {
  const e = globalThis.__ATF_GAME__;
  return e?.player ? { running: e.running, paused: e.paused, loading: !!(e.enemyAtlasLoadingPausedV65 || e.userCasteLoadingV88),
    mission: e.mission?.state, resume: e.lastResumeResult,
    player: { x: e.player.x, y: e.player.y, w: e.player.w, h: e.player.h, health: e.player.health, grounded: e.player.grounded, ammoReserve: e.player.ammoReserve },
    equipment: [...e.equipmentActions.values()].map(item => ({ id: item.id, remaining: item.remaining, uses: item.uses })),
    placeables: e.getPlaceablesSnapshotV86(), extension: e.getPlaceablesExtensionSnapshotV132(),
    barriers: e.walls.filter(item => item.placeableBarrierV132).map(item => ({ id: item.placeableInstanceIdV132, x: item.x, y: item.y, w: item.w, h: item.h })) } : null;
});
const check = (label, evidence) => report.checks.push({ label, evidence });
const action = (instanceId, kind) => page.locator(`[data-placeable-instance="${instanceId}"][data-placeable-extension="${kind}"]`);
async function awaitTask() {
  await page.waitForFunction(() => globalThis.__ATF_GAME__.getPlaceablesSnapshotV86().tasks.length === 0, null, { timeout: 15000 });
}
async function insertion() {
  for (let i = 0; i < 16; i++) {
    if (await page.evaluate(() => !!globalThis.__ATF_GAME__?.running)) break;
    const next = page.locator('[data-insertion-action="advance"]'); if (await next.isVisible()) await next.click();
    await page.waitForTimeout(350);
  }
  await page.waitForFunction(() => { const e = globalThis.__ATF_GAME__; return e?.running && !e.enemyAtlasLoadingPausedV65 && !e.userCasteLoadingV88 && e.player.grounded; }, null, { timeout: 45000 });
}
async function openNearby() {
  const details = page.locator('.placeable-nearby-v86');
  if (!await details.evaluate(node => node.open)) await details.locator('summary').click();
}
async function preview(catalogId) {
  await page.locator(`[data-use-equipment="${catalogId}"]`).click();
  let state = await snapshot();
  for (let i = 0; i < 8 && !state.placeables.previews[0]?.valid; i++) {
    await page.locator('#game-canvas').focus(); await page.keyboard.down('KeyD'); await page.waitForTimeout(150); await page.keyboard.up('KeyD');
    await page.waitForTimeout(120); state = await snapshot();
  }
  assert.equal(state.placeables.previews[0]?.valid, true, state.placeables.previews[0]?.reason);
  return state.placeables.previews[0];
}
async function main() {
  await fs.mkdir(output, { recursive: true }); const module = await playwright(), { chromium } = module.chromium ? module : module.default;
  browser = await chromium.launch({ headless: true, ...(process.env.ATF_CHROMIUM_EXECUTABLE ? { executablePath: process.env.ATF_CHROMIUM_EXECUTABLE } : {}) });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, serviceWorkers: 'block' });
  page = await context.newPage(); page.setDefaultTimeout(20000);
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('#title-start').click({ timeout: 45000 }); await page.locator('#title-options').click();
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'command';
  save.player.equipmentIds = equipmentIds; save.strategy.inventory.equipmentIds = equipmentIds;
  await page.locator('#save-import').setInputFiles({ name: 'placeables-qa-legacy-profile.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).waitFor();
  await page.locator('[data-view="command"]').click(); await page.locator('#command-mission-v110').selectOption('pair-004-frontier');
  await page.locator('#operation-launch').click(); await insertion();
  let state = await snapshot(); assert.equal(state.extension.ready, true);
  assert.ok(Object.values(state.extension.counts).every(count => count > 0));
  check('Command issues only the eight actually imported equipped tools, covering T/M/B/S/R/U', state.extension);
  // Stop teammates from walking into the preview while verifying the dock.
  await page.locator('#mission-squad-command-v132').click();
  await page.locator('[data-squad-action="order"][data-squad-value="hold"]').click(); await page.keyboard.press('Escape');
  const p = await preview(ids.barrier), id = p.instanceId;
  const before = (await snapshot()).equipment.find(item => item.id === ids.barrier);
  await page.locator(`[data-placeable-mode="barrier"][data-placeable-instance="${id}"]`).click();
  assert.equal((await snapshot()).placeables.previews[0].modeV132, 'barrier');
  await page.locator('[data-placeable-action="confirm"]').click();
  await page.waitForFunction(() => globalThis.__ATF_GAME__.getPlaceablesSnapshotV86().tasks.length > 0);
  state = await snapshot(); assert.equal(state.equipment.find(item => item.id === ids.barrier).uses, before.uses);
  await awaitTask(); state = await snapshot();
  const installed = state.placeables.instances.find(item => item.instanceId === id);
  assert.equal(installed.status, 'deployed'); assert.equal(installed.modeV132, 'barrier'); assert.equal(state.barriers.length, 1);
  assert.equal(state.equipment.find(item => item.id === ids.barrier).uses, before.uses + 1);
  check('Real preview, mode and timed Install commit one material unit into a solid barrier', { installed, source: state.equipment.find(item => item.id === ids.barrier) });
  await page.locator('#game-canvas').screenshot({ path: output + '/01-barrier-installed.png' });
  await openNearby(); await action(id, 'push-right').click(); await awaitTask(); state = await snapshot();
  assert.equal(state.placeables.instances.find(item => item.instanceId === id).x, installed.x + 24);
  await action(id, 'lock').click(); await awaitTask();
  assert.equal((await snapshot()).placeables.instances.find(item => item.instanceId === id).lockedV132, true);
  assert.equal(await action(id, 'push-right').isDisabled(), true);
  check('Dock pushes the actual frame by 24 units, then its timed lock disables movement', (await snapshot()).barriers);
  await action(id, 'lock').click(); await awaitTask(); await action(id, 'containment').click(); await awaitTask(); state = await snapshot();
  assert.equal(state.barriers.length, 0); assert.equal(state.placeables.instances.find(item => item.instanceId === id).modeV132, 'containment');
  await action(id, 'barrier').click(); await awaitTask(); await action(id, 'lock').click(); await awaitTask();
  check('The same object switches to finite containment and back to its physical armature through real controls', (await snapshot()).placeables.instances.find(item => item.instanceId === id));
  await page.keyboard.press('KeyP'); const paused = await snapshot(); await page.waitForTimeout(350);
  assert.deepEqual((await snapshot()).barriers, paused.barriers); assert.equal(await action(id, 'push-right').isDisabled(), true);
  await page.locator('#mission-save-v86').click(); await page.getByText('Sauvegarde locale confirmée.', { exact: true }).waitFor();
  const saved = await snapshot(); check('Actual paused save records committed HP, mode, lock, quantity and collision', saved.placeables.instances.find(item => item.instanceId === id));
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 });
  if (await page.locator('#title-continue').isVisible()) await page.locator('#title-continue').click();
  await page.locator('[data-view="command"]').click(); await page.locator('#continue-operation').click(); await insertion();
  state = await snapshot(); assert.equal(state.resume.applied, true);
  const resumed = state.placeables.instances.find(item => item.instanceId === id), original = saved.placeables.instances.find(item => item.instanceId === id);
  for (const key of ['health', 'modeV132', 'lockedV132', 'x', 'y', 'carrierCrewIdV132']) assert.equal(resumed[key], original[key], key);
  assert.deepEqual(state.equipment.find(item => item.id === ids.barrier), saved.equipment.find(item => item.id === ids.barrier)); assert.equal(state.barriers.length, 1);
  check('Reload and Continue restore one same owned supported barrier with no refund', { resumed, source: state.equipment.find(item => item.id === ids.barrier) });
  if (state.paused) await page.keyboard.press('KeyP');
  await openNearby(); await page.locator(`[data-placeable-recover="${id}"]`).click(); await awaitTask(); state = await snapshot();
  assert.equal(state.placeables.instances.find(item => item.instanceId === id).status, 'carried'); assert.equal(state.barriers.length, 0);
  check('Real Fold clears the passage and keeps the same HP and consumed source unit', state.placeables.instances.find(item => item.instanceId === id));
  const ammoPreview = await preview(ids.ammo); await page.locator('[data-placeable-action="confirm"]').click(); await awaitTask(); await openNearby();
  state = await snapshot(); const cache = state.placeables.instances.find(item => item.instanceId === ammoPreview.instanceId), reserve = state.player.ammoReserve;
  await action(cache.instanceId, 'use').click(); await awaitTask(); state = await snapshot();
  assert.equal(state.player.ammoReserve, reserve + cache.resourceRemainingV132);
  assert.equal(state.placeables.instances.find(item => item.instanceId === cache.instanceId).resourceRemainingV132, 0);
  assert.equal(await action(cache.instanceId, 'use').isDisabled(), true);
  check('The real cache transfer gives only its finite authored equipment resource, then disables a second withdrawal', { cache: state.placeables.instances.find(item => item.instanceId === cache.instanceId), reserve: state.player.ammoReserve });
  await page.locator('#game-canvas').screenshot({ path: output + '/02-folded-frame-spent-cache.png' });
  assert.equal(report.pageErrors.length, 0); assert.equal(report.requestFailures.length, 0); report.status = 'passed';
}
main().catch(async error => {
  report.status = 'failed'; report.error = { message: error.message, stack: error.stack };
  if (page) { report.lastState = await snapshot().catch(() => null); await page.screenshot({ path: output + '/failure.png', fullPage: true }).catch(() => {}); }
  process.exitCode = 1;
}).finally(async () => {
  report.finishedAt = new Date().toISOString(); await fs.writeFile(output + '/report.json', JSON.stringify(report, null, 2));
  await browser?.close(); console.log(JSON.stringify({ status: report.status, checks: report.checks.length, error: report.error?.message, report: output + '/report.json' }));
});
