import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';

// Ordinary idle save and authored project use their actual file inputs. All
// movement/erasure uses visible controls; evaluations only read live snapshots.
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(process.env.ATF_EDITOR_SPATIAL_QA_OUTPUT || join(tmpdir(), `atf-editor-spatial-v136-${Date.now()}`));
const rel = relative(repository, output);
if (!rel || !rel.startsWith('..') && !isAbsolute(rel)) throw Error('QA evidence must stay outside the public checkout.');
const report = { status: 'running', startedAt: new Date().toISOString(), checks: [], pageErrors: [], requestFailures: [],
  method: 'Idle save and 128×72 mission imported through native file inputs; native clearance toggle, Shift erasure, export, movement to the right edge, return and reload. Runtime observations read only.' };
let browser, page;
const check = (label, evidence) => report.checks.push({ label, evidence });
const editor = () => page.evaluate(() => globalThis.__ATF_V51__?.editor?.getSnapshot());
const runtime = () => page.evaluate(() => {
  const e = globalThis.__ATF_GAME__;
  return e ? { player: { x: e.player.x, y: e.player.y, w: e.player.w, h: e.player.h, health: e.player.health, grounded: e.player.grounded },
    grid: e.getSnapshot().editorGridV136, tileCount: e.editorTileCount, camera: { ...e.camera }, objective: { ...e.objective }, paused: e.paused,
    checkpoint: { ...e.checkpoint }, resume: e.captureResumeState(), campaign: { id: e.campaign?.id, name: e.campaign?.name },
    missionState: e.mission?.state, rewards: e.mission?.rewards, objectiveRuntime: e.objectiveRuntime,
    objectiveNodes: e.objectiveNodes?.map(node => ({ id: node.id, kind: node.kind })) } : null;
});
const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('atf-v47-profile-1') || 'null'));
async function importProject(project) {
  await page.locator('#editor-import').setInputFiles({ name: 'far-corner-128x72.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(project)) });
  await page.getByText('Plan importé.', { exact: true }).waitFor();
}
async function main() {
  await fs.mkdir(output, { recursive: true });
  let pw;
  if (process.env.ATF_PLAYWRIGHT_MODULE) pw = await import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
  else { try { pw = await import('playwright'); } catch {
    if (!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) throw Error('Existing Playwright required.');
    pw = createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__editor_spatial_qa__.cjs'))('playwright');
  } }
  const { chromium } = pw.chromium ? pw : pw.default;
  browser = await chromium.launch({ headless: true, ...(process.env.ATF_CHROMIUM_EXECUTABLE ? { executablePath: process.env.ATF_CHROMIUM_EXECUTABLE } : {}) });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, serviceWorkers: 'block', acceptDownloads: true });
  page = await context.newPage(); page.setDefaultTimeout(30000);
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
  await page.goto(process.env.ATF_BASE_URL || 'http://127.0.0.1:4173', { waitUntil: 'domcontentloaded' });
  await page.locator('#title-start').click({ timeout: 45000 }); await page.locator('#title-options').click();
  const fixture = createDefaultSave(); fixture.needsPlayerCreationV84 = false; fixture.scene = 'command';
  await page.locator('#save-import').setInputFiles({ name: 'editor-idle-profile.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).waitFor(); const beforeProfile = await saved();
  await page.locator('#return-title').click();
  if (await page.locator('#title-start').isVisible()) await page.locator('#title-start').click();
  await page.locator('#title-forge').click(); await page.locator('#editor-canvas').waitFor({ state: 'visible' });
  const project = { schema: 2, kind: 'mission', size: [128, 72], tiles: [
    ...Array.from({ length: 128 }, (_, x) => ({ position: `${x}:70`, type: 'floor' })),
    { position: '118:69', type: 'spawn' }, { position: '126:69', type: 'objective' }, { position: '118:65', type: 'wall' }
  ] };
  await importProject(project); let snapshot = await editor();
  assert.deepEqual(snapshot.size, [128, 72]); assert.ok(snapshot.spatialV136.issues.some(issue => issue.code === 'spawn-obstructed'));
  await page.locator('[data-editor-spatial-v136] summary').click();
  await page.locator('[data-editor-spatial-overlay-v136]').check();
  assert.match(await page.locator('[data-editor-spatial-issues-v136]').textContent(), /Départ encombré/);
  const footprint = (await editor()).spatialV136.footprints.find(entry => entry.type === 'spawn');
  assert.deepEqual([footprint.w, footprint.h, footprint.y + footprint.h], [42, 92, 1050]);
  check('Actual maximum-grid project import shows a wall obstructing the full-height spawn silhouette and exposes native physical-volume overlay', { size: snapshot.size, footprint });
  await page.screenshot({ path: join(output, '01-clearance-review.png'), fullPage: true });
  const canvas = page.locator('#editor-canvas'); await canvas.scrollIntoViewIfNeeded(); const box = await canvas.boundingBox();
  await page.keyboard.down('Shift');
  try { await page.mouse.click(box.x + 118.5 / 128 * box.width, box.y + 65.5 / 72 * box.height); } finally { await page.keyboard.up('Shift'); }
  snapshot = await editor(); assert.deepEqual(snapshot.spatialV136.issues, []); assert.equal(snapshot.tiles.length, 130);
  assert.match(await page.locator('[data-editor-spatial-v136] summary').textContent(), /0 point/);
  check('Native Shift erasure frees the actual insertion clearance and immediately updates the review without blocking intentional level design', { tileCount: snapshot.tiles.length, issues: snapshot.spatialV136.issues });
  const downloadPromise = page.waitForEvent('download'); await page.locator('#editor-export').click(); const download = await downloadPromise;
  const exportPath = join(output, 'exported-128x72.json'); await download.saveAs(exportPath); const exported = JSON.parse(await fs.readFile(exportPath, 'utf8'));
  assert.deepEqual(exported.size, [128, 72]); assert.equal(exported.tiles.length, 130); assert.equal(Object.hasOwn(exported, 'spatialV136'), false);
  check('Native export preserves all 128 columns and 72 rows while review visibility remains a local viewing choice', { path: exportPath, tiles: exported.tiles.length });
  await page.locator('#editor-play').click(); await page.locator('#game-canvas').waitFor({ state: 'visible' });
  await page.waitForFunction(() => { const e = globalThis.__ATF_GAME__; return e?.running && !e.paused && !e.enemyAtlasLoadingPausedV65 && !e.userCasteLoadingV88 && e.player?.grounded; }, null, { timeout: 45000 });
  const insertion = await runtime();
  assert.deepEqual(insertion.grid, { columns: 128, rows: 72, tileWidth: 48.4375, tileHeight: 15 });
  assert.equal(insertion.tileCount, 130); assert.ok(insertion.player.x > 5600 && insertion.player.y > 900); assert.ok(insertion.objective.x > 6100);
  assert.equal(Math.round(insertion.player.y + insertion.player.h), 1050);
  assert.equal(insertion.campaign.id, 'forge-authored-v136'); assert.equal(insertion.campaign.name, 'PLAYTEST FORGE');
  assert.equal(insertion.objectiveRuntime.id, 'forge-authored-objective-v136'); assert.deepEqual(insertion.objectiveNodes, []);
  check('Production playtest retains far-right/far-bottom geometry and inserts at the real authored tile beyond both former limits', insertion);
  await page.locator('#game-canvas').focus(); await page.keyboard.down('KeyD');
  try { await page.waitForTimeout(2200); } finally { await page.keyboard.up('KeyD'); }
  const edge = await runtime(); assert.ok(edge.player.x > insertion.player.x + 250); assert.ok(edge.player.x + edge.player.w <= 6200.01);
  assert.ok(edge.player.health > 0); assert.equal(Math.round(edge.player.y + edge.player.h), 1050);
  assert.ok(edge.camera.x > 4910 && edge.camera.x <= 4920.01); assert.ok(edge.camera.y > 359 && edge.camera.y <= 360.01);
  assert.ok(edge.checkpoint.x > 5600 && edge.checkpoint.y > 900);
  check('Real keyboard walking reaches the right world edge over the bottom authored floor; camera and checkpoint remain within the same physical world', edge);
  await page.screenshot({ path: join(output, '02-far-right-playtest.png'), fullPage: true });
  await page.keyboard.press('KeyP'); const paused = await runtime(); assert.equal(paused.paused, true);
  await page.waitForTimeout(150); const still = await runtime(); assert.equal(still.player.x, paused.player.x); assert.equal(still.player.y, paused.player.y);
  await page.keyboard.press('KeyP'); assert.equal((await runtime()).paused, false);
  check('Actual pause/resume freezes and restores the far-corner operator without moving the authored scene', { paused: paused.player, afterPause: still.player });
  await page.keyboard.press('KeyE');
  await page.waitForFunction(() => globalThis.__ATF_GAME__?.mission?.state === 'complete');
  const complete = await runtime(); assert.equal(complete.objective.complete, true);
  for (const key of ['credits', 'salvage', 'intel', 'apex', 'cargo']) assert.equal(complete.rewards[key], 0);
  assert.match(await page.locator('#mission-log').textContent(), /PLAYTEST TERMINÉ/);
  check('Native E interaction completes the actual authored objective without reference-campaign survivors or reward issuance', { objective: complete.objectiveRuntime.id, rewards: complete.rewards });
  await page.locator('#retreat-mission').click(); await page.locator('#editor-canvas').waitFor({ state: 'visible' });
  assert.deepEqual((await editor()).tiles, exported.tiles);
  const afterProfile = await saved();
  for (const key of ['statistics', 'clock', 'crew']) assert.deepEqual(afterProfile[key], beforeProfile[key]);
  assert.deepEqual(afterProfile.strategy.currentOperation, beforeProfile.strategy.currentOperation); assert.deepEqual(afterProfile.galaxy.resources, beforeProfile.galaxy.resources);
  check('Returning from the actual playtest preserves the whole project and cannot issue campaign results, time or resources', { tiles: exported.tiles.length });
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 }); await page.locator('#title-forge').click();
  await page.locator('#editor-canvas').waitFor({ state: 'visible' }); snapshot = await editor();
  assert.deepEqual(snapshot.size, [128, 72]); assert.deepEqual(snapshot.tiles, exported.tiles); assert.deepEqual(snapshot.spatialV136.issues, []);
  check('Actual browser reload restores the maximum-grid workspace with its far-corner spawn/objective and corrected clearance', { size: snapshot.size, tiles: snapshot.tiles.length });
  await page.setViewportSize({ width: 390, height: 844 }); await page.locator('[data-editor-spatial-v136] summary').click();
  const mobile = await page.locator('[data-editor-spatial-v136]').boundingBox(); assert.ok(mobile.x >= -1 && mobile.x + mobile.width <= 391);
  const checkbox = await page.locator('[data-editor-spatial-overlay-v136]').boundingBox(); assert.ok(checkbox.width >= 16 && checkbox.width <= 24);
  for (const selector of ['[data-editor-columns-v135]', '[data-editor-rows-v135]']) {
    const bounds = await page.locator(selector).boundingBox(); assert.ok(bounds.width <= 100 && bounds.x >= -1 && bounds.x + bounds.width <= 391);
  }
  await page.screenshot({ path: join(output, '03-mobile-clearance.png'), fullPage: true });
  check('Clearance and overlay controls remain within a 390px viewport', mobile);
  assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.requestFailures, []); report.status = 'passed';
}
await main().catch(async error => { report.status = 'failed'; report.error = { message: error.message, stack: error.stack }; process.exitCode = 1;
  if (page) { report.lastEditor = await editor().catch(() => null); report.lastRuntime = await runtime().catch(() => null); await page.screenshot({ path: join(output, 'failure.png'), fullPage: true }).catch(() => {}); }
}).finally(async () => { report.finishedAt = new Date().toISOString(); await fs.mkdir(output, { recursive: true });
  await fs.writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2)); await browser?.close();
  console.log(JSON.stringify({ status: report.status, checks: report.checks.length, error: report.error?.message, report: join(output, 'report.json') })); });
