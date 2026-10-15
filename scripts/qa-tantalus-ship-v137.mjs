import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';
import { HUB_DECKS } from '../src/hub-game.js';
import { HUB_SHIP_SPACES_V137, HUB_SHIP_CONNECTIONS_V137 } from '../src/hub-ship-layout-v137.js';

// Save checkpoints disclose only an idle parent room. Every new entrance,
// station, service route and return is reached with native keyboard input.
// Runtime globals are read only. No actor mutation, teleport or win injection.
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(process.env.ATF_SHIP_QA_OUTPUT || join(tmpdir(), `atf-tantalus-ship-v137-${Date.now()}`));
const rel = relative(root, output);
if (!rel || !rel.startsWith('..') && !isAbsolute(rel)) throw Error('QA evidence must remain outside the checkout.');
const base = process.env.ATF_BASE_URL || 'http://127.0.0.1:4173';
const pass = process.env.ATF_SHIP_QA_PASS || 'final';
const scope = process.env.ATF_SHIP_QA_SCOPE || 'all';
const report = { status: 'running', startedAt: new Date().toISOString(), pass, scope,
  method: 'Idle parent-room saves imported by the native Save picker; all doors, ladders, stations and the two-way maintenance route use actual keyboard input. Runtime state is observed only.',
  limitations: ['Automated browser exploration, not a human play study.', 'Screenshots are additionally inspected for artistic composition; geometry alone does not certify quality.'],
  checks: [], captures: [], routes: [], pageErrors: [], requestFailures: [] };
let browser, page, serial = 0;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
async function playwright() {
  try { return await import('playwright'); } catch (error) {
    if (process.env.ATF_PLAYWRIGHT_MODULE) return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__tantalus_ship__.cjs'))('playwright');
    throw Error('Existing Playwright installation required.', { cause: error });
  }
}
async function sourceManifest() {
  const files = (await fs.readdir(join(root, 'src'), { recursive: true })).filter(path => path.endsWith('.js')).map(path => `src/${path}`);
  files.push('index.html', 'runtime-level.css', 'sw.js');
  return Object.fromEntries(await Promise.all(files.sort().map(async path => [path, hash(await fs.readFile(join(root, path)))])));
}
function observe() {
  const h = globalThis.__ATF_HUB__;
  if (!h?.player) return null;
  const snap = h.getSnapshot(), annex = h.currentAnnexV71?.();
  return { running: h.running, deck: h.state.deck, room: h.currentRoom()?.id, annex: annex?.id || null,
    transition: h.annexTransitionV71?.direction || null, time: h.animationTime,
    player: Object.fromEntries(['x', 'y', 'w', 'h', 'vx', 'vy', 'grounded', 'climbing', 'health', 'shockHits', 'facing'].map(key => [key, h.player[key]])),
    camera: { ...(annex ? h.annexCameraV71 : h.camera) }, keys: [...h.keys], prompt: h.statusPrompt(),
    station: h.nearestAnnexStationV71?.()?.annexId || null, exit: h.nearestAnnexExitV71?.() || null,
    ladders: (annex?.ladders || h.v51Ladders || []).map(a => ({ ...a })),
    platforms: (annex?.platforms || h.v51Platforms || []).map(a => ({ ...a })),
    presentation: Object.fromEntries(Object.entries(snap).filter(([key]) => /134|136|137|Commercial|stationUses|visitedAnnex/.test(key))) };
}
const state = () => page.evaluate(observe);
const check = (label, evidence) => report.checks.push({ label, evidence });
function safe(s, footY = 624) {
  assert.equal(s.player.health, 100); assert.equal(s.player.shockHits, 0);
  if (footY != null) assert.ok(Math.abs(s.player.y + s.player.h - footY) < .15, `Feet ${s.player.y + s.player.h} do not meet standing plane ${footY}.`);
}
function fixture(roomId, offset = 100) {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'hub';
  const deck = HUB_DECKS.findIndex(d => d.rooms.some(r => r.id === roomId));
  assert.ok(deck >= 0, `Unknown parent ${roomId}.`); const room = HUB_DECKS[deck].rooms.find(r => r.id === roomId);
  Object.assign(save.hub, { deck, roomId, positionX: room.xStart + offset, positionY: 532 }); return save;
}
async function openView(view) {
  const toggle = page.locator('#menu-toggle');
  if (await toggle.isVisible() && !(await page.locator('.rail').getAttribute('class')).split(/\s+/).includes('open')) await toggle.click();
  await page.locator(`[data-view="${view}"]`).click();
}
async function ready() {
  await page.waitForFunction(() => { const h = globalThis.__ATF_HUB__; return h?.running && h.player?.playerAppearanceVisualV126?.drawn; });
  await page.locator('#hub-canvas').focus(); await page.waitForTimeout(450);
}
async function importParent(save) {
  if (await page.locator('#exit-hub').isVisible()) await page.locator('#exit-hub').click();
  await openView('settings');
  await page.locator('#save-import').setInputFiles({ name: 'tantalus-v137-parent-idle.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).last().waitFor(); await openView('hub'); await ready();
  const s = await state(); assert.equal(s.annex, null); safe(s); return s;
}
async function capture(label) {
  await page.waitForFunction(() => { const life = globalThis.__ATF_HUB__?.getSnapshot()?.hubRoomLifeV136?.current;
    return life?.furnishingV137 && life.furnishingV137.pendingImageRoles.length === 0; });
  const file = `${String(++serial).padStart(2, '0')}-${label}.png`;
  const bytes = await page.locator('#hub-canvas').screenshot({ path: join(output, file) });
  const s = await state(); report.captures.push({ label, file, sha256: hash(bytes), state: s }); return s;
}
async function walkTo(x, footY = 624, sprint = true) {
  const before = await state(); if (Math.abs(before.player.x - x) < 7) { safe(before, footY); return before; }
  const right = x > before.player.x, key = right ? 'KeyD' : 'KeyA';
  if (sprint) await page.keyboard.down('ShiftLeft'); await page.keyboard.down(key);
  try { await page.waitForFunction(t => { const p = globalThis.__ATF_HUB__?.player; return p && (t.right ? p.x >= t.x - 5 : p.x <= t.x + 5); },
    { x, right }, { polling: 'raf', timeout: Math.max(12000, Math.abs(before.player.x - x) / 130 * 1000 + 7000) }); }
  finally { await page.keyboard.up(key); if (sprint) await page.keyboard.up('ShiftLeft'); }
  await page.waitForTimeout(320); const after = await state(); safe(after, footY); assert.ok(Math.abs(after.player.x - x) < 58); return after;
}
async function climbTo(footY, up = true) {
  const key = up ? 'KeyW' : 'KeyS'; await page.keyboard.down(key);
  try { await page.waitForFunction(t => { const p = globalThis.__ATF_HUB__?.player; return p && Math.abs(p.y + p.h - t) < .02; }, footY, { polling: 'raf', timeout: 10000 }); }
  finally { await page.keyboard.up(key); }
  await page.waitForTimeout(150); const after = await state(); safe(after, footY); return after;
}
async function reachParent(connection) {
  await importParent(fixture(connection.parentRoomId));
  const room = HUB_DECKS.flatMap(d => d.rooms).find(r => r.id === connection.parentRoomId);
  if (connection.spaceId === 'sanitary-bay') {
    // Genuine authored route: floor → lower berth deck → upper landing.
    await walkTo(room.xStart + 210 - 22); await climbTo(500);
    await walkTo(room.xStart + 610 - 22, 500); await climbTo(connection.standingY);
    await capture('sanitary-upper-landing');
  }
  await walkTo(connection.parentDoorBounds.x + connection.parentDoorBounds.w / 2 - 22, connection.standingY);
  const atDoor = await capture(`${connection.spaceId}-parent-door`); assert.equal(atDoor.room, connection.parentRoomId);
  await page.keyboard.press('KeyE');
  await page.waitForFunction(id => { const h = globalThis.__ATF_HUB__; return h?.currentAnnexV71?.()?.id === id && !h.annexTransitionV71; }, connection.spaceId, { timeout: 12000 });
  safe(await state()); return atDoor;
}
function inspectionCount(s, id) { return s.presentation.hubCommercialV71?.annexes?.[id]?.station?.activationCount ?? s.presentation.stationUsesV71?.[id] ?? null; }
async function inspectStation(space) {
  const bounds = space.station.bounds; await walkTo(bounds.x + bounds.w + 10);
  const before = await capture(`${space.id}-inspection-before`); assert.equal(before.station, space.id);
  const count = inspectionCount(before, space.id); assert.ok(Number.isInteger(count), 'Physical inspection counter must be observable.');
  await page.keyboard.press('KeyE');
  await page.waitForFunction(({ id, count }) => { const snap = globalThis.__ATF_HUB__.getSnapshot();
    return (snap.hubCommercialV71?.annexes?.[id]?.station?.activationCount ?? snap.stationUsesV71?.[id]) === count + 1; }, { id: space.id, count });
  const after = await capture(`${space.id}-inspection-recorded`); safe(after);
  check(`${space.name}: the physically reached inspection records a real E interaction.`, { before, after });
  const life = after.presentation.hubRoomLifeV136?.current, parallax = after.presentation.hubRoomParallaxV134?.current;
  assert.equal(life?.roomId, space.id); assert.deepEqual(life.furnishingV137.pendingImageRoles, []);
  assert.ok(life.furnishingV137.paintedRoles.length > 0, 'Original furnishing must actually be painted.');
  assert.ok(parallax?.nativeReady); assert.equal(parallax.gameplayPlane, '2d'); assert.equal(parallax.layers.length, 3);
  for (const tile of parallax.nativeTiles) assert.ok(Math.abs(tile.scaleX - tile.scaleY) < 1e-9);
  check(`${space.name}: the actual scene paints every new furnishing image and retains three uniformly scaled background planes.`, { life, parallax }); return after;
}
async function leaveAt(connection) {
  const x = connection.entranceLocalX + (connection.entranceSide === 'west' ? connection.annexDoorBounds.w / 2 + 16 : -connection.annexDoorBounds.w / 2 - 60);
  await walkTo(x); await capture(`${connection.spaceId}-${connection.entranceSide}-exit-approach`); await page.keyboard.press('KeyE');
  await page.waitForFunction(() => { const h = globalThis.__ATF_HUB__; return !h.currentAnnexV71?.() && !h.annexTransitionV71; }, null, { timeout: 12000 });
  const after = await capture(`${connection.spaceId}-returned-${connection.parentRoomId}`);
  const deck = HUB_DECKS.findIndex(d => d.id === connection.parentDeck);
  assert.equal(after.room, connection.parentRoomId); assert.equal(after.deck, deck); safe(after, connection.standingY); return after;
}
async function persistAndReload(expected, endpointId) {
  await page.locator('#exit-hub').click();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('atf-v47-profile-1')));
  assert.ok(stored?.hub);
  if (endpointId) assert.equal(stored.hub.commercialV71?.activeConnectionIdV137, endpointId, 'The save must preserve the actual entrance endpoint.');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#title-start').click(); await page.locator('#title-options').click(); await openView('hub'); await ready();
  const restored = await capture(`${expected.annex || expected.room}-restored`);
  assert.equal(restored.annex, expected.annex); assert.equal(restored.deck, expected.deck);
  if (endpointId) assert.equal(restored.presentation.hubCommercialV71?.activeConnectionIdV137, endpointId, 'Reload must preserve the endpoint rather than silently choosing the primary entrance.');
  assert.ok(Math.abs(restored.player.x - expected.player.x) <= 2); safe(restored, expected.player.y + expected.player.h);
  return { stored, restored };
}
async function serviceDeckJourney(space) {
  if (!space.ladders.length) return;
  const first = space.ladders[0], last = space.ladders.at(-1);
  const ladderX = ladder => ladder.x + ladder.w / 2 - 22;
  await walkTo(ladderX(first)); await climbTo(first.top);
  const top = await capture(`${space.id}-service-deck-ascent`);
  const platform = space.platforms.find(a => a.role === 'catwalk'); assert.ok(platform);
  if (space.ladders.length > 1) {
    await walkTo(ladderX(last), last.top); await capture(`${space.id}-service-deck-crossing`);
    await climbTo(last.bottom, false);
  } else {
    await walkTo(platform.x + platform.w - 90, first.top); await capture(`${space.id}-service-deck-far-side`);
    await walkTo(ladderX(first), first.top); await climbTo(first.bottom, false);
  }
  const returned = await capture(`${space.id}-service-deck-descent`); safe(returned);
  check(`${space.name}: its real upper service deck is reached, crossed and left through native ladders without a compensating jump.`, { top, returned });
}
async function roomsJourney() {
  for (const space of HUB_SHIP_SPACES_V137.filter(a => a.id !== 'maintenance-spine')) {
    const connection = HUB_SHIP_CONNECTIONS_V137.find(c => c.spaceId === space.id);
    const before = await reachParent(connection); const inside = await capture(`${space.id}-entry-sightline`);
    await walkTo(space.world.width - 130); const far = await capture(`${space.id}-far-end`);
    assert.equal(far.annex, space.id); assert.ok(far.player.x > inside.player.x + 600, 'The route must physically span the compartment.');
    if (space.world.width > 1280) assert.ok(far.camera.x > inside.camera.x + 100, 'A wide compartment must expose its far side through real camera movement.');
    await walkTo(240); await capture(`${space.id}-return-sightline`);
    await inspectStation(space); await serviceDeckJourney(space);
    const returned = await leaveAt(connection);
    if (space.id === 'sanitary-bay') {
      const room = HUB_DECKS.flatMap(d => d.rooms).find(r => r.id === connection.parentRoomId);
      await walkTo(room.xStart + 610 - 22, connection.standingY); await climbTo(500, false);
      await walkTo(room.xStart + 210 - 22, 500); await climbTo(624, false); safe(await state());
      check('The sanitary door is reached and left through both genuine quarter ladders, preserving all three standing heights.', { before, returned });
    }
    check(`${space.name}: both horizontal approaches, station and parent return remain physically traversable.`, { before, far, returned });
    report.routes.push({ id: space.id, status: 'passed' });
  }
}
async function maintenanceJourney() {
  const space = HUB_SHIP_SPACES_V137.find(a => a.id === 'maintenance-spine');
  const west = HUB_SHIP_CONNECTIONS_V137.find(c => c.spaceId === space.id && c.entranceSide === 'west');
  const east = HUB_SHIP_CONNECTIONS_V137.find(c => c.spaceId === space.id && c.entranceSide === 'east');
  await reachParent(west); await serviceDeckJourney(space); await walkTo(1280); const midpoint = await capture('maintenance-west-to-east-midpoint');
  const resumed = await persistAndReload(midpoint, west.id); await inspectStation(space); const workshop = await leaveAt(east);
  check('Sensor entry survives a real mid-corridor save/reload and exits physically onto the workshop deck.', { midpoint, resumed, workshop });
  // Return without a new fixture: workshop → far door → corridor → sensor.
  await walkTo(east.parentDoorBounds.x + east.parentDoorBounds.w / 2 - 22); await page.keyboard.press('KeyE');
  await page.waitForFunction(id => { const h = globalThis.__ATF_HUB__; return h.currentAnnexV71?.()?.id === id && !h.annexTransitionV71; }, space.id, { timeout: 12000 });
  await walkTo(1280); const opposite = await capture('maintenance-east-to-west-midpoint');
  const reverseResume = await persistAndReload(opposite, east.id); const sensor = await leaveAt(west);
  check('The continuous return route enters from workshop, survives reload with its eastern endpoint and returns to sensors.', { opposite, reverseResume, sensor });
  report.routes.push({ id: 'maintenance-spine-both-directions-and-midpoint-reload', status: 'passed' });
}
async function main() {
  await fs.mkdir(output, { recursive: true }); const before = await sourceManifest(); report.sourceFiles = Object.keys(before).length;
  report.sourceSignatureAtStart = hash(JSON.stringify(before));
  const module = await playwright(), { chromium } = module.chromium ? module : module.default;
  browser = await chromium.launch({ headless: true, executablePath: process.env.ATF_CHROMIUM_EXECUTABLE || '/usr/bin/chromium' });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, serviceWorkers: 'block' });
  page = await context.newPage(); page.setDefaultTimeout(30000);
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
  await page.goto(base, { waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click(); await page.locator('#title-options').click();
  if (scope === 'all' || scope === 'rooms') await roomsJourney();
  if (scope === 'all' || scope === 'maintenance') await maintenanceJourney();
  assert.ok(report.routes.length > 0, 'Unknown QA scope.');
  const after = await sourceManifest(); report.sourceSignatureAtEnd = hash(JSON.stringify(after));
  report.sourceChangedFiles = Object.keys(after).filter(path => before[path] !== after[path]); assert.deepEqual(report.sourceChangedFiles, []);
  assert.equal(report.sourceSignatureAtStart, report.sourceSignatureAtEnd); assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.requestFailures, []);
  check('Production source signatures and browser error logs remain unchanged throughout this complete native-control pass.', { files: report.sourceFiles, signature: report.sourceSignatureAtEnd });
  report.status = 'passed';
}
await main().catch(async error => {
  report.status = 'failed'; report.error = { message: error.message, stack: error.stack }; process.exitCode = 1;
  if (page) { report.lastObservedState = await state().catch(() => null); await page.locator('#hub-canvas').screenshot({ path: join(output, 'failure-context.png') }).catch(() => {}); }
}).finally(async () => {
  report.finishedAt = new Date().toISOString(); await fs.mkdir(output, { recursive: true }); await fs.writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2));
  await browser?.close(); console.log(JSON.stringify({ status: report.status, pass, routes: report.routes.length, checks: report.checks.length, captures: report.captures.length, error: report.error?.message, report: join(output, 'report.json') }));
});
