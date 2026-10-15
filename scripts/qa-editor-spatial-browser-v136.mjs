import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';
import { ForgeModel } from '../src/forge-model-v130.js';

/** Native Forge regression shared with authoring QA. Inputs change the app; evaluations only read. */
export async function runEditorSpatialQaV136(options = {}) {
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(options.output || process.env.ATF_EDITOR_SPATIAL_QA_OUTPUT || join(tmpdir(), `atf-editor-native-v141-${Date.now()}`));
const rel = relative(repository, output);
if (!rel || !rel.startsWith('..') && !isAbsolute(rel)) throw Error('QA evidence must remain outside the checkout.');
let pw;
if (process.env.ATF_PLAYWRIGHT_MODULE) pw = await import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
else { try { pw = await import('playwright'); } catch (error) {
  if (!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) throw Error('Existing Playwright required.', { cause: error });
  pw = createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__qa_editor_native_v140__.cjs'))('playwright');
} }
const { chromium } = pw.chromium ? pw : pw.default;
const report = { status: 'running', startedAt: new Date().toISOString(), checks: [], pageErrors: [], requestFailures: [], method: 'Production app, native file inputs/downloads, real pointer/keyboard/touch, library controls, Mission and Ship playtests. Evaluations only observe.' };
const check = (label, evidence) => report.checks.push({ label, evidence });
let browser, page, acceptDialogs = true;
const editor = () => page.evaluate(() => globalThis.__ATF_V51__?.editor?.getSnapshot());
const authored = () => page.evaluate(() => structuredClone(globalThis.__ATF_V51__.editor.model.data));
const audit = () => page.evaluate(() => globalThis.__ATF_V51__?.editor?.controlV136?.getReport());
const campaign = () => page.evaluate(() => JSON.parse(localStorage.getItem('atf-v47-profile-1')));
const mission = () => page.evaluate(() => { const e = globalThis.__ATF_GAME__; return { player: Object.fromEntries(['x','y','w','h','alive','grounded','health','armor','ammo','ammoReserve','weaponMode','costumeId'].map(key => [key, e.player[key]])), inventory: structuredClone(e.inventory), equipment: [...e.equipmentActions.values()].map(item => ({id:item.id,remaining:item.remaining,uses:item.uses})), enemies: e.enemies.map(enemy => ({id:enemy.id,alive:enemy.alive,health:enemy.health})), journey: e.getForgeJourneySnapshotV141?.(), hud:e.getForgeMissionHudV141?.(), prompt:e.getInteractionPrompt(), doors: e.doors.map(door => ({id:door.forgeCellIdV141,open:door.open})), grid: e.editorGridV136, tileCount: e.editorTileCount, objective: { ...e.objective }, state: e.mission.state, rewards: e.mission.rewards }; });
const ship = () => page.evaluate(() => { const e = globalThis.__ATF_HUB__; return { player: { x: e.player.x, y: e.player.y, w: e.player.w, h: e.player.h, grounded: e.player.grounded }, editorPlaytest: e.editorPlaytest, objectives: e.v51Objectives.map(o => ({ ...o })), grid: e.compiledProject?.grid, running: e.running }; });
const tile = (x, y, type) => ({ position: `${x}:${y}`, type });
function twoRoomMission(enemies = true) {
  const m = new ForgeModel({ schema: 2, kind: 'mission', name: 'V141 deux secteurs', size: [128, 72], tiles: [...Array.from({ length: 128 }, (_, x) => tile(x, 70, 'floor')), tile(118, 69, 'spawn'), tile(126, 69, 'objective'), tile(110, 69, 'door'), ...(enemies ? [tile(122, 69, 'enemy')] : [])] });
  m.transaction('Fixture authored document', () => { m.paint(1, 1, 'wall', 'background'); m.paint(1, 1, 'wall', 'foreground'); const door = m.room.cells.find(c => c.type === 'door').id; m.addRoom({ duplicate: true }); const second = m.room.cells.find(c => c.type === 'door').id; m.link(second, 'room-1', door); m.data.activeRoomId = 'room-1'; });
  return m.data;
}
async function openPage(context) {
  page = await context.newPage(); page.setDefaultTimeout(30000); page.on('dialog', dialog => acceptDialogs ? dialog.accept() : dialog.dismiss());
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
}
async function enterForge() {
  await page.goto(process.env.ATF_BASE_URL || 'http://127.0.0.1:4173', { waitUntil: 'domcontentloaded' });
  await page.locator('#title-start').click({ timeout: 45000 }); await page.locator('#title-options').click();
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'command';
  await page.locator('#save-import').setInputFiles({ name: 'idle.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).waitFor();
  await page.locator('#return-title').click(); if (await page.locator('#title-start').isVisible()) await page.locator('#title-start').click();
  await page.locator('#title-forge').click(); await page.locator('#editor-canvas').waitFor({ state: 'visible' });
  await page.waitForFunction(() => Boolean(globalThis.__ATF_V51__?.editor?.workspaceV133));
}
async function importProject(project) {
  await page.locator('#editor-import').setInputFiles({ name: 'authored-level.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(project)) });
  await page.waitForFunction(() => document.querySelector('#editor-import').value === '');
  assert.match(await page.locator('.forge-message-v130').textContent(), /Projet importé/);
}
async function point(x, y) {
  const canvas = page.locator('#editor-canvas'); await canvas.scrollIntoViewIfNeeded();
  const projection = await page.evaluate(() => { const e = globalThis.__ATF_V51__.editor; return { matrix: e.matrix(), width: e.canvas.width, height: e.canvas.height }; });
  const box = await canvas.boundingBox(), m = projection.matrix;
  return { x: box.x + (m.x + (x + .5) * m.scale) / projection.width * box.width, y: box.y + (m.y + (y + .5) * m.scale) / projection.height * box.height };
}
async function clickCell(x, y) { const p = await point(x, y); await page.mouse.click(p.x, p.y); }
async function exportDocument(name) {
  const downloading = page.waitForEvent('download'); await page.locator('#editor-export').click(); const download = await downloading;
  const path = join(output, name); await download.saveAs(path); return JSON.parse(await fs.readFile(path, 'utf8'));
}
async function tab(name) { await page.locator(`[data-work-action="tab"][data-tab="${name}"]`).click(); }
async function verifyMissionJourneyV141({ imported = false, exported = null } = {}) {
  const beforeCampaign = await campaign();
  if (!imported) await importProject(twoRoomMission());
  const document = await authored(), roomA = document.activeRoomId, roomB = document.rooms.find(room => room.id !== roomA).id;
  assert.equal((await audit()).scope, 'reachable-rooms'); assert.equal((await audit()).ok, true);
  assert.match(await page.locator('#editor-play').textContent(), /TESTER LE PARCOURS/);
  exported ||= await exportDocument('mission-two-rooms-v141.json');
  const launch = async () => {
    await page.locator('#editor-play').click(); await page.locator('#game-canvas').waitFor({ state: 'visible' });
    await page.waitForFunction(() => { const e = globalThis.__ATF_GAME__; return e?.running && !e.paused && e.player.grounded && !e.enemyAtlasLoadingPausedV65; }, null, { timeout: 45000 });
    await page.locator('#game-canvas').focus();
  };
  const walk = async (code, condition) => { await page.keyboard.down(code); try { await page.waitForFunction(condition, null, { timeout: 20000 }); } finally { await page.keyboard.up(code); } };
  const goal = () => walk('KeyD', () => { const e = globalThis.__ATF_GAME__; return Math.abs(e.player.x + e.player.w / 2 - e.objective.x - e.objective.w / 2) < 65; });
  const door = () => walk('KeyA', () => Boolean(globalThis.__ATF_GAME__.forgeLinkedDoorV141()));
  const pressE = () => page.keyboard.press('KeyE');
  const resources = snapshot => ({ health:snapshot.player.health,armor:snapshot.player.armor,ammo:snapshot.player.ammo,ammoReserve:snapshot.player.ammoReserve,weaponMode:snapshot.player.weaponMode,costumeId:snapshot.player.costumeId,inventory:snapshot.inventory,equipment:snapshot.equipment });
  const combat = async () => {
    // F is actual native fire. Evaluations only observe the authored opponent.
    await page.keyboard.down('KeyD'); await page.waitForTimeout(80); await page.keyboard.up('KeyD');
    const before = await mission(); await page.keyboard.down('KeyF');
    try { await page.waitForFunction(() => globalThis.__ATF_GAME__.enemies.every(enemy => !enemy.alive), null, { timeout: 15000 }); }
    finally { await page.keyboard.up('KeyF'); }
    const after = await mission(); assert.ok(after.player.ammo < before.player.ammo); assert.ok(after.enemies.every(enemy => !enemy.alive));
    return { before, after };
  };
  await launch(); const insertion = await mission(); assert.equal(insertion.journey.roomId, roomA); assert.equal(insertion.tileCount, 132);
  assert.equal(insertion.hud.context,'PARCOURS FORGE · SESSION'); assert.equal(insertion.hud.objectives,'OBJECTIFS GLOBAUX 0/2');
  assert.equal(insertion.hud.location,`SALLE · ${document.rooms.find(room=>room.id===roomA).name}`);
  const firstCombat = await combat(); await goal(); await pressE();
  const firstGoal = await mission(); assert.equal(firstGoal.state, 'active'); assert.equal(firstGoal.journey.completedObjectives.length, 1);
  assert.equal(firstGoal.hud.objectives,'OBJECTIFS GLOBAUX 1/2');
  await pressE(); assert.equal((await mission()).state, 'active');
  check('Native F spends ammunition during authored combat; E validates the first goal and extraction remains blocked by the remote goal', { combat:firstCombat, firstGoal });
  await page.screenshot({ path: join(output, '01-mission-first-goal-blocked.png'), fullPage: true });
  await door(); const beforeDeparture = await mission(); await pressE(); await page.waitForFunction(id => globalThis.__ATF_GAME__.forgeActiveRoomIdV141 === id, roomB);
  const arrived = await mission(); assert.deepEqual(resources(arrived), resources(beforeDeparture)); assert.equal(arrived.player.grounded, true); assert.equal(arrived.player.y + arrived.player.h, 1050);
  assert.equal(arrived.hud.location,`SALLE · ${document.rooms.find(room=>room.id===roomB).name}`);
  check('Actual A/E crosses the linked physical door; the full supported body and carried resources survive', { beforeDeparture, arrived });
  await page.screenshot({ path: join(output, '02-mission-second-room-arrival.png'), fullPage: true });
  const secondCombat = await combat(); await goal(); await pressE(); const secondGoal = await mission();
  assert.equal(secondGoal.state, 'active'); assert.equal(secondGoal.journey.completedObjectives.length, 2);
  assert.equal(secondGoal.hud.objectives,'OBJECTIFS GLOBAUX 2/2');
  await door(); const beforeReturn = await mission(); await pressE(); await page.waitForFunction(id => globalThis.__ATF_GAME__.forgeActiveRoomIdV141 === id, roomA);
  const returned = await mission(); assert.deepEqual(resources(returned), resources(beforeReturn));
  assert.ok(returned.enemies.every(enemy => !enemy.alive)); assert.equal(returned.objective.complete, true); assert.ok(returned.doors.every(door => door.open));
  assert.equal(returned.journey.transitions, 2); check('Return through the native door preserves dead opponents, completed objectives, opened doors and resources', { secondCombat, secondGoal, returned });
  await page.screenshot({ path: join(output, '03-mission-round-trip-persistence.png'), fullPage: true });
  await goal(); await pressE(); await page.waitForFunction(() => globalThis.__ATF_GAME__.mission.state === 'complete'); const complete = await mission();
  for (const key of ['credits','salvage','intel','apex','cargo']) assert.equal(complete.rewards[key], 0);
  check('A separate native E confirms extraction after every reachable goal, with zero campaign rewards', complete);
  await page.screenshot({ path: join(output, '04-mission-native-extraction.png'), fullPage: true });
  await page.locator('#retreat-mission').click(); await page.locator('#editor-canvas').waitFor({ state:'visible' }); assert.deepEqual(await authored(), exported);
  assert.deepEqual(await campaign(), beforeCampaign);
  const oneWay = twoRoomMission(false), edge = oneWay.links[0]; [edge.from,edge.to] = [edge.to,edge.from]; edge.bidirectional = false;
  await importProject(oneWay); await launch(); await door(); const refusalBefore = await mission(); await pressE(); await page.waitForTimeout(180);
  const refusalAfter = await mission(); assert.equal(refusalAfter.journey.roomId, roomA); assert.equal(refusalAfter.journey.transitions, 0); assert.deepEqual(resources(refusalAfter), resources(refusalBefore));
  check('A real E refuses a one-way departure that would strand an unfinished source objective', { before:refusalBefore,after:refusalAfter });
  await page.screenshot({ path: join(output, '05-mission-one-way-refusal.png'), fullPage: true });
  await goal(); await pressE(); await door(); await pressE(); await page.waitForFunction(id => globalThis.__ATF_GAME__.forgeActiveRoomIdV141 === id, roomB);
  assert.equal((await mission()).journey.transitions, 1);
  check('After the source objective is actually validated, the same one-way door admits the linear journey', await mission());
  await page.locator('#retreat-mission').click(); await page.locator('#editor-canvas').waitFor({ state:'visible' }); assert.deepEqual(await campaign(), beforeCampaign);
  const walled = twoRoomMission(false), entry = walled.rooms.find(room=>room.id===walled.activeRoomId);
  entry.cells.find(cell=>cell.type==='door').x=121;
  for(let row=64;row<70;row++) entry.cells.push({id:`qa-native-wall-${row}`,x:120,y:row,type:'wall',layer:'structure'});
  await importProject(walled); assert.equal((await audit()).ok,true); await launch();
  await walk('KeyD',()=>Boolean(globalThis.__ATF_GAME__.forgeLinkedDoorV141())); const wallBefore=await mission();
  assert.match(wallBefore.prompt,/CLOISON/); await pressE(); await page.waitForTimeout(180); const wallAfter=await mission();
  assert.equal(wallAfter.journey.roomId,roomA); assert.equal(wallAfter.journey.transitions,0); assert.deepEqual(resources(wallAfter),resources(wallBefore));
  check('Native walking reaches a nearby sas across an authored full-height wall, and E refuses interaction through the wall',{before:wallBefore,after:wallAfter});
  await page.screenshot({path:join(output,'06-mission-physical-wall-refusal.png'),fullPage:true});
  await page.locator('#retreat-mission').click(); await page.locator('#editor-canvas').waitFor({state:'visible'}); assert.deepEqual(await campaign(),beforeCampaign);
  await importProject(exported); assert.deepEqual(await authored(), exported);
  check('Both native returns preserve the entire campaign and the authored document', { rooms:exported.rooms.length,links:exported.links.length,campaignUnchanged:true });
}
async function verifyDrawing() {
  const beforeProfile = await campaign();
  await importProject({ schema: 2, kind: 'mission', name: 'Atelier de dessin V140', size: [48, 24], tiles: [...Array.from({ length: 48 }, (_, x) => tile(x, 22, 'floor')), tile(2, 21, 'spawn'), tile(46, 21, 'objective')] });
  assert.deepEqual((await editor()).size, [48, 24]); assert.equal((await audit()).ok, true);
  check('Native legacy import preserves the 48×24 room and its authored insertion, objective and floor', { size: [48, 24] });
  const choose = async type => page.locator(`[data-editor-tool="${type}"]`).click();
  const mode = async name => page.locator(`[data-forge-action="mode"][data-mode="${name}"]`).click();
  const stroke = async (from, to) => { const a = await point(...from), b = await point(...to); await page.mouse.move(a.x, a.y); await page.mouse.down(); try { await page.mouse.move(b.x, b.y); } finally { await page.mouse.up(); } };
  const counts = async () => (await editor()).validation.counts;
  await choose('platform'); await stroke([8, 10], [14, 10]); assert.equal((await counts()).platform, 7);
  await page.locator('#editor-undo').click(); assert.equal((await counts()).platform, 0); await page.locator('#editor-redo').click(); assert.equal((await counts()).platform, 7);
  check('A sparse native pointer stroke interpolates seven platforms and uses one whole-stroke Undo/Redo', { platforms: 7 });
  await choose('wall'); await mode('rect'); await stroke([20, 8], [22, 10]); assert.equal((await counts()).wall, 9);
  await choose('hazard'); await page.locator('[data-forge-field="layer"]').selectOption('structure'); await mode('fill'); await clickCell(21, 9);
  assert.equal((await counts()).hazard, 9); assert.equal((await counts()).floor, 48);
  await page.locator('#editor-undo').click(); assert.equal((await counts()).wall, 9); await page.locator('#editor-redo').click();
  check('Filled rectangle and same-layer flood replace the nine connected walls while preserving the 48 floor cells', { hazards: 9, floors: 48 });
  await choose('platform'); await page.keyboard.down('Shift'); try { await stroke([8, 10], [14, 10]); } finally { await page.keyboard.up('Shift'); }
  assert.equal((await counts()).platform, 0); await page.locator('#editor-undo').click(); assert.equal((await counts()).platform, 7);
  check('Native Shift erasure removes the full stroke and one Undo restores every platform', { restored: 7 });
  const dimensions = async (w, h) => { await page.locator('[data-forge-field="width"]').fill(String(w)); await page.locator('[data-forge-field="height"]').fill(String(h)); await page.locator('[data-forge-action="resize"]').click(); };
  await dimensions(56, 28); assert.deepEqual((await editor()).size, [56, 28]); await page.locator('#editor-undo').click(); assert.deepEqual((await editor()).size, [48, 24]); await page.locator('#editor-redo').click();
  const expanded = await authored(); acceptDialogs = false; await dimensions(16, 16); acceptDialogs = true; assert.deepEqual(await authored(), expanded);
  await dimensions(16, 16); assert.deepEqual((await editor()).size, [16, 16]); assert.equal((await editor()).validation.ok, false);
  await page.locator('#editor-undo').click(); assert.deepEqual(await authored(), expanded);
  check('Native crop confirmation can be declined; accepting it is one undoable change of dimensions and all cropped cells', { expanded: [56, 28], crop: [16, 16] });
  await choose('terminal'); await clickCell(4, 10); await mode('select'); await clickCell(4, 10); await page.keyboard.press('ArrowRight');
  assert.ok((await editor()).tiles.some(c => c.position === '5:10' && c.type === 'terminal'));
  await page.keyboard.press('Delete'); assert.equal((await counts()).terminal, 0); await page.keyboard.press('Control+z'); assert.equal((await counts()).terminal, 1);
  check('Actual keyboard selection, arrow movement, Delete and Ctrl+Z edit a terminal without firing game controls', { position: '5:10' });
  const beforeInvalid = await authored(), history = await page.evaluate(() => globalThis.__ATF_V51__.editor.history.length);
  await page.locator('#editor-import').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ schema: 2, size: [48, 24], tiles: [tile(999, 999, 'wall')] })) });
  await page.waitForFunction(() => document.querySelector('.forge-message-v130')?.dataset.error === 'true');
  assert.deepEqual(await authored(), beforeInvalid); assert.equal(await page.evaluate(() => globalThis.__ATF_V51__.editor.history.length), history);
  check('Invalid native file import retains the complete authored document and history', { cells: beforeInvalid.rooms[0].cells.length });
  const exported = await exportDocument('drawn-56x28.json'); assert.deepEqual(exported, beforeInvalid); assert.deepEqual(exported.rooms[0].size, [56, 28]);
  check('The native export downloads the full schema3 document with exact edited cells and custom dimensions', { rooms: exported.rooms.length, cells: exported.rooms[0].cells.length });
  await page.screenshot({ path: join(output, '01-native-authoring.png'), fullPage: true }); await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true); await page.screenshot({ path: join(output, '02-native-authoring-mobile.png'), fullPage: true });
  check('Native construction controls fit the 390px viewport', { width: 390 }); await page.setViewportSize({ width: 1680, height: 1100 });
  await page.locator('#editor-play').click(); await page.locator('#game-canvas').waitFor({ state: 'visible' });
  await page.waitForFunction(() => { const e = globalThis.__ATF_GAME__; return e?.running && e.player.grounded && !e.enemyAtlasLoadingPausedV65; }, null, { timeout: 45000 });
  const start = await mission(); await page.locator('#game-canvas').focus(); await page.keyboard.down('KeyD'); try { await page.waitForTimeout(220); } finally { await page.keyboard.up('KeyD'); }
  const walked = await mission(); assert.ok(walked.player.x > start.player.x + 2); assert.ok(walked.player.alive);
  await page.locator('#retreat-mission').click(); await page.locator('#editor-canvas').waitFor({ state: 'visible' }); assert.deepEqual(await authored(), exported);
  const after = await campaign(); for (const key of ['statistics', 'clock', 'crew']) assert.deepEqual(after[key], beforeProfile[key]); assert.deepEqual(after.galaxy.resources, beforeProfile.galaxy.resources);
  check('The edited custom-size room compiles and accepts real keyboard movement; return preserves the document and campaign state', { insertion: start.player, walked: walked.player });
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 }); await page.locator('#title-forge').click(); await page.locator('#editor-canvas').waitFor({ state: 'visible' }); assert.deepEqual(await authored(), exported);
  check('Actual reload reopens the entire edited custom-dimension project', { size: [56, 28], cells: exported.rooms[0].cells.length });
}
try {
  await fs.mkdir(output, { recursive: true }); browser = await chromium.launch({ headless: true, ...(process.env.ATF_CHROMIUM_EXECUTABLE ? { executablePath: process.env.ATF_CHROMIUM_EXECUTABLE } : {}) });
  const context = await browser.newContext({ viewport: { width: 1680, height: 1100 }, serviceWorkers: 'block', acceptDownloads: true }); await openPage(context); await enterForge();
  if (options.authoringOnly) await verifyDrawing();
  else if (options.missionOnly) await verifyMissionJourneyV141();
  else {
  const beforeCampaign = await campaign(); await importProject(twoRoomMission());
  let snapshot = await editor(), document = await authored(), review = await audit();
  assert.equal(snapshot.schema, 3); assert.equal(document.rooms.length, 2); assert.equal(document.links.length, 1); assert.deepEqual(review.grid, [128, 72]); assert.equal(review.ok, true);
  assert.equal(review.issues.some(i => i.code === 'native-grid-capacity' || i.code === 'native-reference-scenario'), false);
  assert.equal(await page.locator('#editor-play').isEnabled(), true);
  check('Native import opens both rooms, four layers and a door link; 128×72 admission matches the isolated mission compiler', { rooms: document.rooms.length, links: document.links.length, audit: { ok: review.ok, grid: review.grid, bounds: review.bounds } });
  await page.locator('[data-work-field="scope"]').selectOption('visible'); await page.locator('[data-forge-action="mode"][data-mode="select"]').click();
  await clickCell(1, 1); assert.equal((await editor()).selection.length, 2);
  await page.keyboard.press('ArrowRight'); document = await authored(); assert.equal(document.rooms[0].cells.filter(c => ['background', 'foreground'].includes(c.layer) && c.x === 2 && c.y === 1).length, 2);
  await page.keyboard.press('Control+z'); assert.equal((await authored()).rooms[0].cells.filter(c => ['background', 'foreground'].includes(c.layer) && c.x === 1).length, 2);
  await page.keyboard.press('Control+y');
  check('Real visible-layer selection and keyboard transform move both decorative layers; one native Undo/Redo restores the full group', { selected: 2 });
  const missionId = (await editor()).forgeProjectIdV133;
  await tab('projects'); await page.locator('[data-work-field="project-name"]').fill('Vide contrôle V140'); await page.locator('[data-work-action="project-create"]').click();
  assert.equal(await page.locator('#editor-play').isEnabled(), false);
  await page.locator(`[data-work-action="project-open"][data-project="${missionId}"]`).click();
  assert.equal(await page.locator('#editor-play').isEnabled(), true); assert.equal((await authored()).rooms.length, 2);
  check('Opening a valid library project from an empty document immediately refreshes the real launch button without a fake edit', { projectId: missionId });
  const exported = await exportDocument('mission-two-rooms.json'); assert.equal(exported.rooms.length, 2); assert.equal(exported.links.length, 1); assert.equal(Object.hasOwn(exported, 'tiles'), false);
  await verifyMissionJourneyV141({ imported:true,exported });
  await tab('projects'); await page.locator('[data-work-field="project-name"]').fill('Vaisseau V140'); await page.locator('[data-work-field="project-kind"]').selectOption('ship'); await page.locator('[data-work-action="project-create"]').click();
  const shipProject = { schema: 2, kind: 'ship', size: [128, 72], tiles: [...Array.from({ length: 128 }, (_, x) => tile(x, 70, 'floor')), tile(0, 69, 'spawn'), tile(10, 69, 'objective')] };
  await importProject(shipProject); review = await audit(); assert.equal(review.ok, true); assert.deepEqual(review.grid, [128, 72]);
  const shipExported = await exportDocument('ship-128x72.json');
  await page.locator('#editor-play').click(); await page.locator('#hub-canvas').waitFor({ state: 'visible' });
  await page.waitForFunction(() => globalThis.__ATF_HUB__?.running && globalThis.__ATF_HUB__.editorPlaytest);
  const shipInsertion = await ship(); assert.equal(shipInsertion.player.x, 24); assert.equal(shipInsertion.player.y, 608); assert.equal(shipInsertion.player.h, 92);
  await page.waitForTimeout(180); const idle = await ship(); assert.equal(idle.player.x, 24); assert.equal(idle.player.y, 608);
  await page.locator('#hub-canvas').focus(); await page.keyboard.down('KeyD');
  try { await page.waitForFunction(() => {const e=globalThis.__ATF_HUB__,o=e.v51Objectives[0];return Math.abs(e.player.x+e.player.w/2-o.x-o.w/2)<60;}, null, { timeout: 15000 }); } finally { await page.keyboard.up('KeyD'); }
  await page.keyboard.press('KeyE'); await page.waitForFunction(() => globalThis.__ATF_HUB__.v51Objectives.some(o => o.complete));
  const shipReached = await ship(); assert.ok(shipReached.player.x > shipInsertion.player.x + 300); assert.equal(Math.round(shipReached.player.y + shipReached.player.h), 700);
  check('Native 128×72 Ship admission inserts at bounded x24/y608, stays stable through idle updates, and validates its goal with native D/E', { insertion: shipInsertion, idle, reached: shipReached });
  await page.screenshot({ path: join(output, '02-ship-playtest.png'), fullPage: true });
  await page.locator('#exit-hub').click(); await page.locator('#editor-canvas').waitFor({ state: 'visible' }); assert.deepEqual(await authored(), shipExported);
  const afterCampaign = await campaign(); for (const key of ['statistics', 'clock', 'crew', 'hub']) assert.deepEqual(afterCampaign[key], beforeCampaign[key]); assert.deepEqual(afterCampaign.galaxy.resources, beforeCampaign.galaxy.resources); assert.deepEqual(afterCampaign.strategy.currentOperation, beforeCampaign.strategy.currentOperation);
  await tab('projects'); await page.locator(`[data-work-action="project-open"][data-project="${missionId}"]`).click(); assert.deepEqual(await authored(), exported);
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 }); await page.locator('#title-forge').click(); await page.locator('#editor-canvas').waitFor({ state: 'visible' }); assert.deepEqual(await authored(), exported);
  check('Both sandbox returns preserve campaign bytes and authored documents; library open and actual reload retain rooms, links and decorative layers', { rooms: exported.rooms.length, links: exported.links.length });
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, serviceWorkers: 'block' }); await openPage(mobile); await enterForge();
  await importProject({ schema: 2, kind: 'mission', size: [8, 8], tiles: [...Array.from({ length: 6 }, (_, x) => tile(x, 5, 'floor')), tile(1, 4, 'spawn'), tile(4, 4, 'objective')] });
  const cdp = await mobile.newCDPSession(page);
  const touch = (type, p) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: p.x, y: p.y, id: 1, radiusX: 1, radiusY: 1, force: 1 }] });
  // Use one touch session, a nonzero contact force and human gesture timing.
  // Mixing Playwright taps with raw CDP drags suppresses later clicks in Chromium.
  const tapControl = async selector => {
    const node = page.locator(selector); await node.scrollIntoViewIfNeeded(); await page.waitForTimeout(300); const b = await node.boundingBox();
    await touch('touchStart', { x: b.x + b.width / 2, y: b.y + b.height / 2 }); await page.waitForTimeout(100);
    await touch('touchEnd'); await page.waitForTimeout(500);
  };
  await tapControl('[data-forge-action="mode"][data-mode="brush"]'); const touchStart = await point(0, 2), touchEnd = await point(3, 2);
  await touch('touchStart', touchStart); await page.waitForTimeout(100); await touch('touchMove', touchEnd); await page.waitForTimeout(100);
  await touch('touchEnd'); await page.waitForTimeout(500);
  await page.waitForFunction(() => globalThis.__ATF_V51__.editor.room.cells.filter(c => c.y === 2 && c.type === 'floor').length === 4);
  snapshot = await editor(); assert.equal(snapshot.tiles.length, 12); assert.equal(snapshot.canUndo, true);
  await tapControl('#editor-undo');
  await page.waitForFunction(() => globalThis.__ATF_V51__.editor.room.cells.length === 8);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
  await page.screenshot({ path: join(output, '03-touch-native-forge.png'), fullPage: true });
  check('Real touch brush gesture interpolates four tiles at 390px; native touch Undo removes the whole stroke', { tilesAfterGesture: 12, tilesAfterUndo: (await editor()).tiles.length });
  }
  assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.requestFailures, []); report.status = 'passed';
} catch (error) {
  report.status = 'failed'; report.error = { message: error.message, stack: error.stack };
  report.editor = await editor().catch(() => null); report.audit = await audit().catch(() => null); report.mission = await mission().catch(() => null); report.ship = await ship().catch(() => null);
  await page?.screenshot({ path: join(output, 'failure.png'), fullPage: true }).catch(() => {});
} finally {
  report.finishedAt = new Date().toISOString(); await fs.writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2)); await browser?.close();

}

return report;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await runEditorSpatialQaV136();
  console.log(JSON.stringify({ status: report.status, checks: report.checks.length, error: report.error?.message }));
  if (report.status !== 'passed') process.exitCode = 1;
}
