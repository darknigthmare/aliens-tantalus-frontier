import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';

// Only an ordinary idle profile and a simple valid Forge project are imported.
// Every garment choice, checkbox, recall, reload and movement uses native UI.
// Browser evaluations observe storage, DOM and actual rendered runtime only.
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.ATF_BASE_URL || 'http://127.0.0.1:4173';
const output = resolve(process.env.ATF_WARDROBE_QA_OUTPUT || join(tmpdir(), `atf-wardrobe-parts-v140-${Date.now()}`));
const rel = relative(repository, output);
if (!rel || !rel.startsWith('..') && !isAbsolute(rel)) throw Error('Wardrobe QA evidence must remain outside the checkout.');
const report = { schema: 140, status: 'running', startedAt: new Date().toISOString(), checks: [], pageErrors: [], requestFailures: [],
  method: 'Native idle-profile import; actual J1/J2 presets, wardrobe checkboxes and recall controls; native export/import, browser reload, real Forge playtest and keyboard movement. Runtime and canvas observations are read-only.',
  limitations: ['Existing garment images remain project/film-reference adaptations with exact:false. No new canonical costume art is claimed.',
    'This QA checks partial cabinet recall and its selected/rendered pieces in the simple Forge stage. It does not close either broad conversation or revalidate all campaign missions.'] };
let browser, page;
async function playwright() {
  if (process.env.ATF_PLAYWRIGHT_MODULE) return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
  try { return await import('playwright'); } catch (error) {
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__wardrobe_qa__.cjs'))('playwright');
    throw error;
  }
}
const check = (label, evidence) => report.checks.push({ label, evidence });
const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('atf-v47-profile-1') || 'null'));
const panel = () => page.locator('#player-appearance-v126');
const field = owner => owner === 'coop' ? 'coopAppearanceV126' : 'appearanceV126';
async function view(name) { await page.locator(`[data-view="${name}"]`).click(); await page.locator(`[data-panel="${name}"].active`).waitFor(); }
async function chooseOwner(owner) { await panel().locator(`.appearance-owners-v126 [data-appearance-owner-v126="${owner}"]`).click(); }
async function preset(owner, id) { await panel().locator(`[data-appearance-owner-v126="${owner}"][data-appearance-preset-v129="${id}"]`).click(); }
async function piece(owner, slot, id) { await panel().locator(`[data-appearance-owner-v126="${owner}"][data-appearance-slot-v126="${slot}"][data-appearance-item-v126="${id || ''}"]`).click(); }
async function action(owner, slot, name) { await panel().locator(`[data-wardrobe-action-v135="${name}"][data-wardrobe-owner-v135="${owner}"][data-wardrobe-slot-v135="${slot}"]`).click(); }
async function openParts(slot) {
  const details = panel().locator(`[data-wardrobe-detail-v140="${slot}"]`);
  if (!await details.evaluate(element => element.open)) await details.locator('summary').click();
  return details;
}
async function recallParts(owner, slot, parts) {
  const details = await openParts(slot);
  for (const id of parts) await details.locator(`input[value="${id}"]`).check();
  await action(owner, slot, 'equip-parts');
}
async function preview(file) {
  await panel().locator('canvas[data-appearance-ready-v126="true"]').waitFor({ timeout: 45000 });
  await panel().locator('canvas').screenshot({ path: join(output, file) });
}
function equipment(save) {
  const player = structuredClone(save.player);
  delete player.appearanceV126; delete player.coopAppearanceV126; delete player.wardrobeV135;
  return { player, crew: save.crew, resources: save.galaxy.resources, clock: save.clock, operation: save.strategy.currentOperation };
}
async function snapshot() {
  return page.evaluate(() => {
    const engine = globalThis.__ATF_GAME__;
    if (!engine?.player) return null;
    const actor = subject => subject && ({ x: subject.x, y: subject.y, w: subject.w, h: subject.h, vx: subject.vx,
      grounded: subject.grounded, health: subject.health, appearance: subject.playerAppearanceVisualV126,
      locomotion: subject.playerLocomotionVisualV129, heldWeapon: subject.heldWeaponVisualV125 });
    return { running: engine.running, paused: engine.paused, player: actor(engine.player),
      coop: engine.coopEnabled ? actor(engine.coop) : null,
      canvas: document.querySelector('#game-canvas').toDataURL('image/png') };
  });
}
function certify(subject, expected) {
  assert.ok(subject?.appearance?.drawn, 'The actual frame must have used the native modular renderer.');
  assert.equal(subject.appearance.ready, true); assert.deepEqual(subject.appearance.selected.slots, expected);
  assert.ok(Math.abs(subject.appearance.humanVisualV133.standingHeight - 96.5) < .01);
  for (const [slot, itemId] of Object.entries(expected)) {
    const layers = subject.appearance.layers.filter(layer => layer.slot === slot);
    if (itemId === null) assert.equal(layers.length, 0, `Removed ${slot} must have no rendered layer.`);
    else assert.ok(layers.length && layers.every(layer => layer.itemId === itemId), `${slot} must draw its selected authored part.`);
  }
  for (const leg of Object.values(subject.locomotion.legs)) {
    assert.ok(Math.abs(Math.hypot(leg.knee.x - leg.hip.x, leg.knee.y - leg.hip.y) - 24) < 1e-5);
    assert.ok(Math.abs(Math.hypot(leg.ankle.x - leg.knee.x, leg.ankle.y - leg.knee.y) - 23.5) < 1e-5);
  }
}
async function captureRuntime(file) {
  const { canvas, ...state } = await snapshot();
  await fs.writeFile(join(output, file), Buffer.from(canvas.split(',')[1], 'base64'));
  return state;
}
async function main() {
  await fs.mkdir(output, { recursive: true }); const module = await playwright(), { chromium } = module.chromium ? module : module.default;
  browser = await chromium.launch({ headless: true, ...(process.env.ATF_CHROMIUM_EXECUTABLE ? { executablePath: process.env.ATF_CHROMIUM_EXECUTABLE } : {}) });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, serviceWorkers: 'block', acceptDownloads: true });
  page = await context.newPage(); page.setDefaultTimeout(25000);
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 }); await page.locator('#title-options').click();
  const fixture = createDefaultSave(); fixture.needsPlayerCreationV84 = false; fixture.scene = 'command'; fixture.settings.coop = true;
  await page.locator('#save-import').setInputFiles({ name: 'wardrobe-v140-idle-profile.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).waitFor(); await view('armory');
  const baseline = await saved();
  await preset('player', 'uscm-hicks-v129'); await piece('player', 'helmet', null); await piece('player', 'mask', 'mask-rebreather-v126'); await piece('player', 'back', null);
  const source = (await saved()).player.appearanceV126.slots;
  await panel().locator('[data-wardrobe-name-v135="1"]').fill('Inspection cargo'); await action('player', 1, 'save');
  await panel().locator('[data-appearance-reset-v126="player"]').click();
  const beforeRecall = await saved();
  const details = await openParts(1); assert.equal(await details.locator('input:checked').count(), 0);
  await action('player', 1, 'equip-parts');
  await panel().locator('[data-wardrobe-status-v135]').filter({ hasText: /Cochez au moins/ }).waitFor();
  assert.deepEqual((await saved()).player, beforeRecall.player);
  check('An empty native checkbox selection explains the required choice and leaves both operators and the cabinet unchanged', { checkboxes: 6 });
  const helmet = details.locator('input[value="helmet"]'); await helmet.focus(); await page.keyboard.press('Space'); assert.equal(await helmet.isChecked(), true);
  await details.locator('input[value="mask"]').check(); await details.locator('input[value="back"]').check(); await action('player', 1, 'equip-parts');
  const expectedFirst = { ...beforeRecall.player.appearanceV126.slots, helmet: source.helmet, mask: source.mask, back: source.back };
  let state = await saved(); assert.deepEqual(state.player.appearanceV126.slots, expectedFirst); assert.deepEqual(state.player.coopAppearanceV126, baseline.player.coopAppearanceV126);
  assert.deepEqual(state.player.wardrobeV135.owners.player[0].appearance.slots, source);
  const focused = panel().locator('[data-wardrobe-action-v135="equip-parts"]'); assert.equal(await focused.evaluate(element => element === document.activeElement && element.getClientRects().length > 0), true);
  check('Keyboard and native checkbox controls recall exactly the stored helmet, mask and back choices, including optional empty pieces, then restore visible focus', { expectedFirst });
  await recallParts('player', 1, ['torso']);
  const expectedPlayer = { ...expectedFirst, torso: source.torso };
  state = await saved(); assert.deepEqual(state.player.appearanceV126.slots, expectedPlayer);
  assert.equal(await panel().locator('[data-wardrobe-detail-v140="1"] input:checked').count(), 0, 'Each recall needs a fresh explicit part selection.');
  await preview('01-j1-mixed-preview.png');
  check('A second recall replaces only the newly checked torso and the real animated preview draws the persistent mixed selection', expectedPlayer);
  await chooseOwner('coop'); await preset('coop', 'uscm-smartgunner-v129');
  const secondSource = (await saved()).player.coopAppearanceV126.slots;
  await panel().locator('[data-wardrobe-name-v135="2"]').fill('Relève smartgunner'); await action('coop', 2, 'save');
  await panel().locator('[data-appearance-reset-v126="coop"]').click();
  const secondDefault = (await saved()).player.coopAppearanceV126.slots;
  await recallParts('coop', 2, ['torso', 'arms']);
  const expectedCoop = { ...secondDefault, torso: secondSource.torso, arms: secondSource.arms };
  state = await saved(); assert.deepEqual(state.player.coopAppearanceV126.slots, expectedCoop); assert.deepEqual(state.player.appearanceV126.slots, expectedPlayer);
  assert.deepEqual(equipment(state), equipment(baseline)); await preview('02-j2-mixed-preview.png');
  check('J2 can recall two different stored pieces independently; all issued gear, health, armor, resources, crew and strategic clock are preserved', expectedCoop);
  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = await panel().locator('[data-wardrobe-detail-v140="2"]').boundingBox(); assert.ok(mobile.x >= -1 && mobile.x + mobile.width <= 391);
  await panel().locator('[data-wardrobe-detail-v140="2"]').screenshot({ path: join(output, '03-mobile-part-selection.png') });
  check('The expanded six-piece controls fit a 390px viewport', mobile); await page.setViewportSize({ width: 1600, height: 1000 });
  await view('settings'); const downloadEvent = page.waitForEvent('download'); await page.locator('#save-export').click();
  const download = await downloadEvent, exportPath = join(output, 'native-export.json'); await download.saveAs(exportPath);
  const exported = JSON.parse(await fs.readFile(exportPath, 'utf8'));
  assert.deepEqual(exported.player.appearanceV126.slots, expectedPlayer); assert.deepEqual(exported.player.coopAppearanceV126.slots, expectedCoop);
  await page.locator('#save-import').setInputFiles(exportPath); await page.getByText('Sauvegarde importée et migrée.', { exact: true }).waitFor();
  assert.deepEqual((await saved()).player.wardrobeV135, state.player.wardrobeV135);
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 }); await page.locator('#title-options').click(); await view('armory');
  const reloaded = await saved(); assert.deepEqual(reloaded.player.appearanceV126.slots, expectedPlayer); assert.deepEqual(reloaded.player.coopAppearanceV126.slots, expectedCoop);
  assert.deepEqual(reloaded.player.wardrobeV135, state.player.wardrobeV135);
  check('Actual save export, import and browser reload preserve both independent mixtures and both six-piece source cabinets', { player: expectedPlayer, coop: expectedCoop });
  await page.locator('#return-title').click(); await page.locator('#title-start').click(); await page.locator('#title-forge').click();
  const project = { schema: 2, kind: 'mission', size: [48, 24], tiles: [
    ...Array.from({ length: 48 }, (_, x) => ({ position: `${x}:22`, type: 'floor' })),
    { position: '2:21', type: 'spawn' }, { position: '46:21', type: 'objective' }
  ] };
  await page.locator('#editor-import').setInputFiles({ name: 'wardrobe-v140-observation-stage.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(project)) });
  await page.getByText(/^(?:Plan importé\.|Projet importé\. Toutes les salles et liaisons ont été vérifiées\.)$/).waitFor(); await page.locator('#editor-play').click();
  await page.waitForFunction(() => { const e = globalThis.__ATF_GAME__; return e?.running && !e.paused && e.player?.grounded && e.player.playerAppearanceVisualV126?.drawn && e.coopEnabled && e.coop?.playerAppearanceVisualV126?.drawn; }, null, { timeout: 45000 });
  const deployed = await captureRuntime('04-native-two-operator-runtime.png'); certify(deployed.player, expectedPlayer); certify(deployed.coop, expectedCoop);
  check('The real Forge deployment draws each persisted mixture, correct absent layers and the unchanged human stature and rigid leg lengths', deployed);
  await page.locator('#game-canvas').focus(); await page.keyboard.down('KeyD'); await page.waitForTimeout(180);
  const moving = await captureRuntime('05-native-mixed-outfit-walk.png'); await page.keyboard.up('KeyD');
  assert.ok(moving.player.x > deployed.player.x + 2); certify(moving.player, expectedPlayer);
  assert.ok(moving.player.locomotion.drawn); assert.ok(moving.player.locomotion.contacts.floorY !== null);
  check('Actual movement keeps the mixed costume attached to the same human rig and real ground support', moving);
  assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.requestFailures, []); report.status = 'passed';
}
await main().catch(async error => { report.status = 'failed'; report.error = { message: error.message, stack: error.stack }; process.exitCode = 1;
  if (page) { report.lastRuntime = await snapshot().catch(() => null); await page.screenshot({ path: join(output, 'failure.png'), fullPage: true }).catch(() => {}); }
}).finally(async () => { report.finishedAt = new Date().toISOString(); await fs.mkdir(output, { recursive: true }); await fs.writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2)); await browser?.close();
  console.log(JSON.stringify({ status: report.status, checks: report.checks.length, error: report.error?.message, report: join(output, 'report.json') })); });
