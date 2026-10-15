import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';
import { runEditorSpatialQaV136 } from './qa-editor-spatial-browser-v136.mjs';

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
async function verifyForge() {
  const native = await runEditorSpatialQaV136({ output: join(output, 'forge'), authoringOnly: true });
  report.checks.push(...native.checks);
  report.pageErrors.push(...native.pageErrors); report.requestFailures.push(...native.requestFailures);
  assert.equal(native.status, 'passed', native.error?.message);
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
