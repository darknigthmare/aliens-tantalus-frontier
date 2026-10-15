import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';

// The only fixture is an ordinary idle profile imported through its real file
// picker and a visible Forge project import. All edits, outfit changes and
// playtest movement use the actual interface. Evaluations only read snapshots.
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.ATF_BASE_URL || 'http://127.0.0.1:4173';
const output = resolve(process.env.ATF_AUTHORING_QA_OUTPUT || join(tmpdir(), `atf-authoring-v135-${Date.now()}`));
const rel = relative(repository, output);
if (!rel || !rel.startsWith('..') && !isAbsolute(rel)) throw Error('QA evidence must remain outside the checkout.');
const report = { status: 'running', startedAt: new Date().toISOString(), checks: [], pageErrors: [], requestFailures: [],
  method: 'Native profile and project imports, real outfit controls, real canvas pointer strokes, keyboard editing and isolated playtest movement; runtime and storage observations only.' };
let browser, page;
async function playwright() {
  if (process.env.ATF_PLAYWRIGHT_MODULE) return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
  try { return await import('playwright'); } catch (error) {
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__authoring_qa__.cjs'))('playwright');
    throw Error('Existing Playwright and Chromium required.', { cause: error });
  }
}
const check = (label, evidence) => report.checks.push({ label, evidence });
const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('atf-v47-profile-1') || 'null'));
const editor = () => page.evaluate(() => globalThis.__ATF_V51__?.editor?.getSnapshot());
const tiles = snapshot => new Map(snapshot.tiles.map(tile => [tile.position, tile.type]));
const appearance = () => page.locator('#player-appearance-v126');
async function view(name) { await page.locator(`[data-view="${name}"]`).click(); await page.locator(`[data-panel="${name}"].active`).waitFor(); }
async function bootSettings() {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 }); await page.locator('#title-options').click();
}
async function switchOwner(owner) { await appearance().locator(`.appearance-owners-v126 [data-appearance-owner-v126="${owner}"]`).click(); }
async function wardrobe(action, owner, slot) {
  await appearance().locator(`[data-wardrobe-action-v135="${action}"][data-wardrobe-owner-v135="${owner}"]${slot ? `[data-wardrobe-slot-v135="${slot}"]` : ''}`).click();
}
async function verifyWardrobe() {
  const fixture = createDefaultSave(); fixture.needsPlayerCreationV84 = false; fixture.scene = 'command';
  await page.locator('#save-import').setInputFiles({ name: 'authoring-idle-profile.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).waitFor(); await view('armory');
  const baseline = await saved();
  const mixed = { helmet: 'helmet-patrol-v126', mask: 'mask-rebreather-v126', torso: 'torso-utility-v126', arms: 'arms-utility-v126', legs: 'legs-utility-v126', back: 'back-radio-v126' };
  for (const [slot, id] of Object.entries(mixed)) await appearance().locator(`[data-appearance-owner-v126="player"][data-appearance-slot-v126="${slot}"][data-appearance-item-v126="${id}"]`).click();
  let state = await saved(); assert.deepEqual(state.player.appearanceV126.slots, mixed);
  assert.equal(await appearance().locator('[data-wardrobe-cabinet-v135]').count(), 4);
  for (let slot = 1; slot <= 4; slot++) {
    await appearance().locator(`[data-wardrobe-name-v135="${slot}"]`).fill(`Patrouille ${slot}`); await wardrobe('save', 'player', slot);
  }
  state = await saved(); assert.equal(state.player.wardrobeV135.owners.player.length, 4); assert.equal(state.player.wardrobeV135.owners.coop.length, 0);
  assert.ok(state.player.wardrobeV135.owners.player.every(outfit => JSON.stringify(outfit.appearance.slots) === JSON.stringify(mixed)));
  check('Six real modular garment buttons compose J1 and four visible personal cabinets preserve the complete six-part selection', { slots: mixed, cabinets: state.player.wardrobeV135.owners.player.map(({ slot, name }) => ({ slot, name })) });
  await appearance().locator('[data-wardrobe-name-v135="1"]').fill('Reconnaissance de nuit'); await wardrobe('save', 'player', 1);
  await appearance().locator('[data-appearance-reset-v126="player"]').click(); assert.notDeepEqual((await saved()).player.appearanceV126.slots, mixed);
  await wardrobe('equip', 'player', 1); assert.deepEqual((await saved()).player.appearanceV126.slots, mixed);
  assert.equal((await saved()).player.wardrobeV135.owners.player[0].name, 'Reconnaissance de nuit');
  check('Renaming a cabinet and recalling it after a native outfit reset restores every authored part', { name: 'Reconnaissance de nuit', slot: 1 });
  await switchOwner('coop'); await wardrobe('copy', 'coop');
  assert.deepEqual((await saved()).player.coopAppearanceV126.slots, mixed);
  await appearance().locator('[data-appearance-owner-v126="coop"][data-appearance-slot-v126="helmet"][data-appearance-item-v126=""]').click();
  const second = { ...mixed, helmet: null }; state = await saved(); assert.deepEqual(state.player.coopAppearanceV126.slots, second); assert.deepEqual(state.player.appearanceV126.slots, mixed);
  await appearance().locator('[data-wardrobe-name-v135="1"]').fill('Relève sans casque'); await wardrobe('save', 'coop', 1);
  await switchOwner('player'); await wardrobe('delete', 'player', 4);
  state = await saved(); assert.deepEqual(state.player.wardrobeV135.owners.player.map(outfit => outfit.slot), [1, 2, 3]); assert.equal(state.player.wardrobeV135.owners.coop[0].name, 'Relève sans casque');
  assert.deepEqual(state.player.weaponIds, baseline.player.weaponIds); assert.deepEqual(state.player.equipmentIds, baseline.player.equipmentIds); assert.deepEqual(state.player.ammo, baseline.player.ammo);
  for (const key of ['health', 'armor', 'stress', 'costumeId']) assert.equal(state.player[key], baseline.player[key]);
  assert.deepEqual(state.crew, baseline.crew); assert.deepEqual(state.galaxy.resources, baseline.galaxy.resources); assert.deepEqual(state.clock, baseline.clock);
  check('Copying J1 into J2, changing J2 and deleting J1 cabinet 4 keep both operators independent and cannot issue gear or alter protection, resources or clock', { first: state.player.wardrobeV135.owners.player.length, second: state.player.wardrobeV135.owners.coop.length });
  await page.waitForFunction(() => { const status = document.querySelector('[data-appearance-preview-status-v126]');
    return status?.textContent && !status.textContent.includes('Chargement'); }, null, { timeout: 45000 });
  await page.screenshot({ path: join(output, '01-modular-outfits.png'), fullPage: true });
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 }); await page.locator('#title-options').click(); await view('armory');
  const reloaded = await saved(); assert.deepEqual(reloaded.player.wardrobeV135, state.player.wardrobeV135); assert.deepEqual(reloaded.player.appearanceV126.slots, mixed); assert.deepEqual(reloaded.player.coopAppearanceV126.slots, second);
  await switchOwner('coop'); await wardrobe('equip', 'coop', 1); assert.deepEqual((await saved()).player.coopAppearanceV126.slots, second);
  check('Reload preserves the names, separate J1/J2 cabinets and actual garment selections; the J2 cabinet remains usable', reloaded.player.wardrobeV135);
  await page.setViewportSize({ width: 390, height: 844 });
  const bounds = await appearance().locator('[data-wardrobe-v135]').boundingBox(); assert.ok(bounds.x >= -1 && bounds.x + bounds.width <= 391);
  await page.screenshot({ path: join(output, '02-mobile-cabinets.png'), fullPage: true });
  check('The personal-cabinet controls stay inside the 390px mobile viewport', bounds);
  await page.setViewportSize({ width: 1600, height: 1000 });
}
async function selectTool(tool) { await page.locator(`[data-editor-tool="${tool}"]`).click(); }
async function brush(mode) { await page.locator(`[data-editor-brush-v135="${mode}"]`).click(); }
async function cellPoint(x, y) {
  const snapshot = await editor(), canvas = page.locator('#editor-canvas'); await canvas.scrollIntoViewIfNeeded(); const box = await canvas.boundingBox();
  return { x: box.x + (x + .5) * box.width / snapshot.size[0], y: box.y + (y + .5) * box.height / snapshot.size[1] };
}
async function stroke(from, to) {
  const start = await cellPoint(...from), end = await cellPoint(...to); await page.mouse.move(start.x, start.y); await page.mouse.down();
  try { await page.mouse.move(end.x, end.y, { steps: 1 }); } finally { await page.mouse.up(); }
}
async function clickCell(x, y) { const point = await cellPoint(x, y); await page.mouse.click(point.x, point.y); }
async function dimensions(columns, rows, crop = false) {
  await page.locator('[data-editor-columns-v135]').fill(String(columns)); await page.locator('[data-editor-rows-v135]').fill(String(rows));
  await page.locator('[data-editor-crop-v135]').setChecked(crop); await page.locator('[data-editor-resize-v135]').click();
}
async function verifyForge() {
  const profileBefore = await saved(); await page.locator('#return-title').click();
  if (await page.locator('#title-start').isVisible()) await page.locator('#title-start').click();
  await page.locator('#title-forge').click(); await page.locator('#editor-canvas').waitFor({ state: 'visible' });
  const project = { schema: 2, kind: 'mission', size: [48, 24], tiles: [
    ...Array.from({ length: 48 }, (_, x) => ({ position: `${x}:22`, type: 'floor' })),
    { position: '2:21', type: 'spawn' }, { position: '46:21', type: 'objective' }
  ] };
  await page.locator('#editor-import').setInputFiles({ name: 'authoring-48x24-idle-mission.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(project)) });
  await page.getByText('Plan importé.', { exact: true }).waitFor(); let snapshot = await editor(); assert.deepEqual(snapshot.size, [48, 24]); assert.equal(snapshot.validation.ok, true);
  assert.equal(await page.locator('[data-editor-columns-v135]').inputValue(), '48'); assert.equal(await page.locator('[data-editor-rows-v135]').inputValue(), '24');
  check('A native Forge file import preserves the actual 48×24 project dimensions and validated floor, spawn and objective', { size: snapshot.size, tiles: snapshot.tiles.length });
  await selectTool('platform'); await brush('paint'); await stroke([8, 10], [14, 10]);
  snapshot = await editor(); for (let x = 8; x <= 14; x++) assert.equal(tiles(snapshot).get(`${x}:10`), 'platform');
  await page.locator('#editor-undo').click(); for (let x = 8; x <= 14; x++) assert.equal(tiles(await editor()).has(`${x}:10`), false);
  await page.locator('#editor-redo').click(); for (let x = 8; x <= 14; x++) assert.equal(tiles(await editor()).get(`${x}:10`), 'platform');
  check('A sparse real pointer stroke paints all seven intervening cells and one Undo/Redo removes and restores the entire gesture', { from: [8, 10], to: [14, 10], cells: 7 });
  await selectTool('wall'); await brush('rectangle'); await stroke([20, 8], [22, 10]);
  snapshot = await editor(); for (let y = 8; y <= 10; y++) for (let x = 20; x <= 22; x++) assert.equal(tiles(snapshot).get(`${x}:${y}`), 'wall');
  await selectTool('hazard'); await brush('fill'); await clickCell(21, 9);
  snapshot = await editor(); assert.equal(snapshot.tiles.filter(tile => tile.type === 'hazard').length, 9); assert.equal(snapshot.validation.counts.floor, 48);
  await page.locator('#editor-undo').click(); assert.equal((await editor()).validation.counts.wall, 9); await page.locator('#editor-redo').click();
  check('The filled rectangle contains nine cells; native flood fill replaces only its connected type and a single Undo restores it', { hazardCells: 9, preservedFloorCells: 48 });
  await brush('erase'); await stroke([8, 10], [14, 10]); assert.equal((await editor()).validation.counts.platform, 0);
  await page.locator('#editor-undo').click(); assert.equal((await editor()).validation.counts.platform, 7);
  check('The real eraser gesture removes the whole continuous stroke and one Undo restores it', { restoredCells: 7 });
  await dimensions(56, 28); assert.deepEqual((await editor()).size, [56, 28]);
  await page.locator('#editor-undo').click(); assert.deepEqual((await editor()).size, [48, 24]); await page.locator('#editor-redo').click();
  const expanded = await editor(); await dimensions(16, 16); assert.deepEqual((await editor()).size, [56, 28]); assert.deepEqual((await editor()).tiles, expanded.tiles);
  await page.locator('[data-editor-authoring-status-v135]').filter({ hasText: /coupées|rognage/ }).waitFor();
  await dimensions(16, 16, true); assert.deepEqual((await editor()).size, [16, 16]); assert.equal((await editor()).validation.ok, false);
  await page.locator('#editor-undo').click(); assert.deepEqual((await editor()).size, [56, 28]); assert.deepEqual((await editor()).tiles, expanded.tiles);
  check('Resizing preserves content; destructive shrinking requires the real explicit crop checkbox and one Undo restores dimensions plus every removed tile', { expanded: [56, 28], cropped: [16, 16] });
  await brush('paint'); await selectTool('terminal'); await page.locator('#editor-canvas').focus();
  const cursor = (await editor()).cursor; await page.keyboard.press('ArrowRight'); await page.keyboard.press('Enter');
  const key = `${cursor[0] + 1}:${cursor[1]}`; assert.equal(tiles(await editor()).get(key), 'terminal');
  await page.keyboard.press('Delete'); assert.equal(tiles(await editor()).has(key), false); await page.keyboard.press('Control+z'); assert.equal(tiles(await editor()).get(key), 'terminal');
  check('The focused grid supports native arrow movement, Enter, Delete and Ctrl+Z without triggering game controls', { key });
  const beforeInvalid = await editor();
  await page.locator('#editor-import').setInputFiles({ name: 'invalid-authoring-plan.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ ...project, tiles: [{ position: '999:999', type: 'floor' }] })) });
  await page.getByText(/dépasse les dimensions|tuile invalide/).last().waitFor(); assert.deepEqual(await editor(), beforeInvalid);
  check('A rejected native project import leaves the complete current project, dimensions and edit history unchanged', { size: beforeInvalid.size, tiles: beforeInvalid.tiles.length });
  const download = page.waitForEvent('download'); await page.locator('#editor-export').click(); const file = await download, path = join(output, 'exported-56x28-forge.json'); await file.saveAs(path);
  const exported = JSON.parse(await fs.readFile(path, 'utf8')); assert.deepEqual(exported.size, [56, 28]); assert.deepEqual(exported.tiles, beforeInvalid.tiles);
  check('The real Export button downloads the exact edited project and preserved custom dimensions', { path, size: exported.size, tiles: exported.tiles.length });
  await page.screenshot({ path: join(output, '03-forge-authoring.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  const bounds = await page.locator('[data-editor-authoring-v135]').boundingBox(); assert.ok(bounds.x >= -1 && bounds.x + bounds.width <= 391);
  await page.screenshot({ path: join(output, '04-mobile-forge.png'), fullPage: true }); check('Construction controls fit the 390px mobile viewport', bounds);
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.locator('#editor-play').click(); await page.locator('#game-canvas').waitFor({ state: 'visible' });
  await page.waitForFunction(() => { const e = globalThis.__ATF_GAME__; return e?.running && !e.paused && !e.enemyAtlasLoadingPausedV65 && !e.userCasteLoadingV88 && e.player?.grounded; }, null, { timeout: 45000 });
  const beforeMove = await page.evaluate(() => { const e = globalThis.__ATF_GAME__; return { x: e.player.x, health: e.player.health, campaign: e.campaign?.id }; });
  await page.locator('#game-canvas').focus(); await page.keyboard.down('KeyD'); await page.waitForTimeout(180); await page.keyboard.up('KeyD');
  const afterMove = await page.evaluate(() => ({ x: globalThis.__ATF_GAME__.player.x, health: globalThis.__ATF_GAME__.player.health })); assert.ok(afterMove.x > beforeMove.x + 2); assert.ok(afterMove.health > 0);
  await page.locator('#retreat-mission').click(); await page.locator('#editor-canvas').waitFor({ state: 'visible' }); assert.deepEqual((await editor()).size, [56, 28]); assert.deepEqual((await editor()).tiles, exported.tiles);
  const afterPlaytest = await saved(); assert.deepEqual(afterPlaytest.statistics, profileBefore.statistics); assert.deepEqual(afterPlaytest.strategy.currentOperation, profileBefore.strategy.currentOperation); assert.deepEqual(afterPlaytest.galaxy.resources, profileBefore.galaxy.resources); assert.deepEqual(afterPlaytest.clock, profileBefore.clock);
  check('The edited custom-size level compiles into a real playable scene, accepts actual movement, then returns to the same project without campaign results or rewards', { beforeMove, afterMove });
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 }); await page.locator('#title-forge').click();
  await page.locator('#editor-canvas').waitFor({ state: 'visible' }); assert.deepEqual((await editor()).size, [56, 28]); assert.deepEqual((await editor()).tiles, exported.tiles);
  check('An actual browser reload reopens the persisted custom-dimension Forge workspace', { size: [56, 28], tiles: exported.tiles.length });
}
async function main() {
  await fs.mkdir(output, { recursive: true }); const module = await playwright(), { chromium } = module.chromium ? module : module.default;
  browser = await chromium.launch({ headless: true, ...(process.env.ATF_CHROMIUM_EXECUTABLE ? { executablePath: process.env.ATF_CHROMIUM_EXECUTABLE } : {}) });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, serviceWorkers: 'block', acceptDownloads: true }); page = await context.newPage(); page.setDefaultTimeout(25000);
  page.on('pageerror', error => report.pageErrors.push(error.message)); page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
  await bootSettings(); await verifyWardrobe(); await verifyForge(); assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.requestFailures, []); report.status = 'passed';
}
await main().catch(async error => { report.status = 'failed'; report.error = { message: error.message, stack: error.stack }; process.exitCode = 1;
  if (page) { report.lastEditor = await editor().catch(() => null); await page.screenshot({ path: join(output, 'failure.png'), fullPage: true }).catch(() => {}); }
}).finally(async () => { report.finishedAt = new Date().toISOString(); await fs.mkdir(output, { recursive: true }); await fs.writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2)); await browser?.close();
  console.log(JSON.stringify({ status: report.status, checks: report.checks.length, error: report.error?.message, report: join(output, 'report.json') })); });
