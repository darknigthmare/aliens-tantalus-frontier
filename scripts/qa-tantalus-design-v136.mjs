import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';
import { HUB_DECKS } from '../src/hub-game.js';
import { HUB_ANNEXES_V87 } from '../src/hub-annex-registry-v87.js';
import { getHubInteractionPropBoundsV136 } from '../src/hub-prop-placements-v136.js';

// Four distinct browser journeys exercise navigation, authored composition,
// human animation, and touch/reflow. They are automated perspectives, not four
// human participants. Idle checkpoints enter through the real Save picker;
// all travel uses actual controls. Production globals are observed only.
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(process.env.ATF_DESIGN_QA_OUTPUT || join(tmpdir(), `atf-tantalus-design-v136-${Date.now()}`));
const rel = relative(root, output);
if (!rel || !rel.startsWith('..') && !isAbsolute(rel)) throw Error('QA evidence must remain outside the checkout.');
const base = process.env.ATF_BASE_URL || 'http://127.0.0.1:4173';
const scope = process.env.ATF_DESIGN_QA_SCOPE || 'all';
const report = { status: 'running', startedAt: new Date().toISOString(), scope,
  method: 'Four native-control journeys in isolated browser contexts; disclosed idle saves imported through the Save UI. Runtime state is read only.',
  limitations: ['Automated browser journeys, not a study with four human participants.', 'Touch is Chromium emulation, not a physical mobile device.',
    'Visual composition is additionally reviewed from saved production PNGs; geometry checks alone do not certify artistic quality.'],
  journeys: [], checks: [], captures: [], pageErrors: [], requestFailures: [] };
let browser, page, serial = 0;
async function playwright() {
  try { return await import('playwright'); } catch (error) {
    if (process.env.ATF_PLAYWRIGHT_MODULE) return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__tantalus_design__.cjs'))('playwright');
    throw Error('Existing Playwright installation required.', { cause: error });
  }
}
async function sourceManifest() {
  const files = (await fs.readdir(join(root, 'src'), { recursive: true })).filter(path => path.endsWith('.js')).map(path => `src/${path}`);
  files.push('index.html', 'runtime-level.css', 'sw.js');
  return Object.fromEntries(await Promise.all(files.sort().map(async path => [path, createHash('sha256').update(await fs.readFile(join(root, path))).digest('hex')])));
}
function observed() {
  const h = globalThis.__ATF_HUB__;
  if (!h?.player) return null;
  const read = a => ({ x: a.x, y: a.y, w: a.w, h: a.h, vx: a.vx, vy: a.vy, facing: a.facing, grounded: a.grounded,
    health: a.health, shockHits: a.shockHits, alive: a.alive, motion: a.playerLocomotionStateV129 || null,
    rig: a.playerLocomotionVisualV129 || null, human: a.humanVisualV133 || null });
  const snapshot = h.getSnapshot();
  return { running: h.running, time: h.animationTime, deck: h.state.deck, room: h.currentRoom()?.id,
    annex: h.currentAnnexV71?.()?.id || null, transition: h.annexTransitionV71?.direction || null,
    player: read(h.player), camera: { ...h.camera }, keys: [...h.keys], prompt: h.statusPrompt(),
    lift: h.nearestLift?.()?.shaftId || null, station: h.nearestAnnexStationV71?.()?.annexId || null,
    npcs: h.npcs.map(a => ({ id: a.crewId || a.id, ...read(a), life: a.lifeV136 || null })),
    presentation: Object.fromEntries(Object.entries(snapshot).filter(([key]) => /136|134/.test(key))) };
}
const snapshot = () => page.evaluate(observed);
function fixture(roomId = 'bridge', offset = 620) {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'hub';
  const deck = HUB_DECKS.findIndex(d => d.rooms.some(room => room.id === roomId));
  const room = HUB_DECKS[deck].rooms.find(room => room.id === roomId);
  Object.assign(save.hub, { deck, roomId, positionX: room.xStart + offset, positionY: 532 });
  return save;
}
async function navigate(view) {
  if (await page.locator('#menu-toggle').isVisible() && !(await page.locator('.rail').getAttribute('class')).split(/\s+/).includes('open')) await page.locator('#menu-toggle').click();
  await page.locator(`[data-view="${view}"]`).click();
}
async function context(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, serviceWorkers: 'block', ...options });
  page = await context.newPage(); page.setDefaultTimeout(30000);
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
  await page.goto(base, { waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click(); await page.locator('#title-options').click();
  return context;
}
async function importIdle(save) {
  if (await page.locator('#exit-hub').isVisible()) await page.locator('#exit-hub').click();
  await navigate('settings');
  await page.locator('#save-import').setInputFiles({ name: 'tantalus-design-idle-v136.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).last().waitFor(); await navigate('hub');
  await page.waitForFunction(() => { const h = globalThis.__ATF_HUB__; return h?.running && h.player?.grounded && h.player.playerAppearanceVisualV126?.drawn; });
  await page.locator('#hub-canvas').focus(); await page.waitForTimeout(300); return snapshot();
}
async function capture(label, wholePage = false) {
  const file = `${String(++serial).padStart(2, '0')}-${label}.png`;
  const bytes = await (wholePage ? page : page.locator('#hub-canvas')).screenshot({ path: join(output, file), ...(wholePage ? { fullPage: true } : {}) });
  const item = { file, label, sha256: createHash('sha256').update(bytes).digest('hex'), state: await snapshot() };
  report.captures.push(item); return item.state;
}
function check(label, evidence) { report.checks.push({ label, evidence }); }
function safe(state) { assert.equal(state.player.health, 100); assert.equal(state.player.shockHits, 0); assert.equal(state.player.y, 532); }
const intersects = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function inspectComposition(state) {
  const architecture = state.presentation.hubSpatialDesignV136, life = state.presentation.hubRoomLifeV136;
  assert.ok(architecture?.active && life?.active);
  assert.equal(architecture.gameplayPlane, '2d'); assert.equal(architecture.current.planes.walkY, 624);
  assert.equal(life.current.roomId, state.annex || state.room); assert.ok(life.current.items.length >= 2);
  assert.ok(life.current.items.some(item => item.source === '/assets/openai/hub/props/v136/service-prop-atlas.png'), 'An original supply prop must actually be drawn.');
  for (const item of life.current.items) {
    assert.ok(Object.values(item.bounds).every(Number.isFinite)); assert.ok(item.bounds.w > 0 && item.bounds.h > 0);
    assert.equal(item.collidable, false); assert.equal(item.interactive, false); assert.equal(item.plane, 'rear');
    assert.ok(!life.current.reservations.some(reserve => intersects(item.bounds, reserve)), `${state.room}: ${item.kind} obstructs ${life.current.reservations.find(r => intersects(item.bounds, r))?.role}`);
  }
  for (const portal of [...architecture.portals, ...architecture.lifts]) {
    assert.ok(portal.target.h <= 156 + 1e-6); assert.ok(Math.abs(portal.target.y + portal.target.h - portal.socket.y - portal.socket.h) < 1e-6);
    assert.ok(Math.abs(portal.target.w / portal.target.h - portal.socket.w / portal.socket.h) < 1e-6);
  }
  const vehicles = (life.vehicles || []).filter(v => v.renderBounds.x >= architecture.current.bounds.x && v.renderBounds.x < architecture.current.bounds.x + architecture.current.bounds.w);
  for (const vehicle of vehicles) {
    assert.ok(Math.abs(vehicle.scaleX - vehicle.scaleY) < 1e-8);
    for (const portal of architecture.portals) assert.equal(intersects(vehicle.renderBounds, portal.target), false, `${state.room}: actual portal overlaps the parked vehicle`);
    for (const item of life.current.items) assert.equal(intersects(vehicle.renderBounds, item.bounds), false, `${state.room}: actual furniture overlaps the parked vehicle`);
  }
  return { room: state.room, drawnFurnishings: life.current.items.length, portals: architecture.portals.length, lifts: architecture.lifts.length, vehicles };
}
async function walkTo(x, sprint = false) {
  const before = await snapshot(); if (Math.abs(before.player.x - x) < 8) return before;
  const right = x > before.player.x, key = right ? 'KeyD' : 'KeyA';
  if (sprint) await page.keyboard.down('ShiftLeft'); await page.keyboard.down(key);
  try { await page.waitForFunction(t => { const p = globalThis.__ATF_HUB__?.player; return p && (t.right ? p.x >= t.x - 5 : p.x <= t.x + 5); },
    { x, right }, { polling: 'raf', timeout: Math.max(12000, Math.abs(before.player.x - x) / 130 * 1000 + 8000) }); }
  finally { await page.keyboard.up(key); if (sprint) await page.keyboard.up('ShiftLeft'); }
  await page.waitForTimeout(250); const after = await snapshot(); safe(after); assert.ok(Math.abs(after.player.x - x) < 55); return after;
}
async function visitAnnex(id, atStation = null) {
  const annex = HUB_ANNEXES_V87.find(a => a.id === id);
  const bounds = await page.evaluate(id => ({ ...globalThis.__ATF_HUB__.getParentAnnexDoorV71(id).bounds }), id);
  await walkTo(bounds.x + bounds.w / 2 - 22); await capture(`${id}-entrance`); await page.keyboard.press('KeyE');
  await page.waitForFunction(id => globalThis.__ATF_HUB__.currentAnnexV71?.()?.id === id && !globalThis.__ATF_HUB__.annexTransitionV71, id, { timeout: 12000 });
  const station = getHubInteractionPropBoundsV136(annex);
  await walkTo(station.x + station.w + 8); const inside = await capture(`${id}-station`);
  assert.equal(inside.annex, id); assert.equal(inside.station, id);
  if (atStation) await atStation(inside);
  const exitX = annex.entranceLocalX + (annex.entranceSide === 'west' ? annex.entrance.w / 2 + 16 : -annex.entrance.w / 2 - 60);
  await walkTo(exitX); await page.keyboard.press('KeyE');
  await page.waitForFunction(() => !globalThis.__ATF_HUB__.currentAnnexV71?.() && !globalThis.__ATF_HUB__.annexTransitionV71, null, { timeout: 12000 });
  const returned = await snapshot(); assert.equal(returned.room, annex.parentRoomId); safe(returned);
  return { id, inside, returned };
}
async function navigationJourney() {
  const ctx = await context(); await importIdle(fixture('bridge', 940)); await capture('navigation-before-bulkhead');
  for (const x of [1080, 1160, 1300, 1480, 2340]) await walkTo(x);
  const shaft = await capture('navigation-briefing-lift'); assert.equal(shaft.room, 'briefing'); assert.ok(shaft.lift);
  await page.keyboard.press('KeyS'); await page.waitForFunction(() => globalThis.__ATF_HUB__.state.deck === 1);
  safe(await snapshot()); await capture('navigation-mess-after-lift');
  await walkTo(3180, true); assert.equal((await snapshot()).room, 'medical');
  const morgue = await visitAnnex('morgue');
  check('Continuous native route crosses bulkheads, takes a physical lift, reaches the medical annex station and returns safely.', { shaft, morgue });
  const end = await snapshot(); await page.locator('#exit-hub').click();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('atf-v47-profile-1')));
  assert.ok(stored.hub.visited.includes('medical')); assert.equal(stored.player.name, fixture().player.name);
  check('The reached route is persisted by the actual hub exit.', { end, visited: stored.hub.visited });
  report.journeys.push({ id: 1, perspective: 'navigation-and-physical-access', status: 'passed' }); await ctx.close();
}
async function compositionJourney() {
  const ctx = await context();
  for (const id of ['vehicle-bay', 'dropship-hangar', 'medical', 'mess', 'combat-information']) {
    await importIdle(fixture(id, 280));
    await page.waitForFunction(() => globalThis.__ATF_HUB__?.getSnapshot().hubRoomLifeV136?.current?.items.some(item => item.source === '/assets/openai/hub/props/v136/service-prop-atlas.png'));
    const start = await capture(`composition-${id}-start`); safe(start);
    const room = HUB_DECKS[start.deck].rooms.find(r => r.id === id);
    await walkTo(room.xStart + 950); const end = await capture(`composition-${id}-end`); assert.equal(end.room, id);
    assert.ok(Math.abs(end.camera.x - start.camera.x) > 100);
    const composition = inspectComposition(end);
    check(`${id}: actual furniture leaves access reservations clear, portals retain source aspect, and the vehicle silhouette stays separate.`, composition);
    check(`${id}: physical camera travel observes the integrated architecture and room furnishing.`, { start, end });
  }
  await importIdle(fixture('armory', 180));
  const proving = await visitAnnex('proving-ground', async inside => {
    const console = inside.presentation.provingGroundConsoleV136;
    assert.equal(console?.painted, true, 'The special V81 console must actually be drawn.');
    const { bounds: b, stationBounds: socket, floorY, sourceOpaqueBounds: source } = console;
    assert.ok([b.x, b.y, b.w, b.h, ...source].every(Number.isFinite));
    assert.ok(Math.abs(b.w / b.h - (source[2] - source[0]) / (source[3] - source[1])) < 1e-8);
    assert.ok(Math.abs(b.y + b.h - floorY) < 1e-8, 'The visible console foot must meet the actual floor.');
    assert.ok(b.x >= socket.x - 1e-8 && b.x + b.w <= socket.x + socket.w + 1e-8);
    assert.ok(b.y >= socket.y - 1e-8 && b.y + b.h <= socket.y + socket.h + 1e-8);
    check('The active Proving Ground console uses its measured opaque source, preserves aspect and fits completely above the floor.', console);
    await page.keyboard.press('KeyE');
    await page.waitForFunction(() => globalThis.__ATF_HUB__.provingGroundStateV81.phase === 'armed');
    const armed = await capture('proving-ground-console-armed');
    assert.equal(armed.presentation.provingGroundConsoleV136.painted, true); safe(armed);
    check('The physically reached console arms its real range session through native E input.', armed);
  });
  check('The Proving Ground entrance and newly sized station remain reachable with a real physical return to the armory.', proving);
  report.journeys.push({ id: 2, perspective: 'composition-scale-and-sightlines', status: 'passed' }); await ctx.close();
}
async function motionSamples(key, count = 28) {
  const samples = []; await page.keyboard.down(key);
  try { for (let i = 0; i < count; i++) { await page.waitForTimeout(25); samples.push(await snapshot()); } }
  finally { await page.keyboard.up(key); }
  return samples;
}
function inspectGait(samples) {
  const moving = samples.filter(s => s.player.motion?.moving && s.player.rig?.drawn); assert.ok(moving.length >= 10);
  let contactPairs = 0, slide = 0, lift = 0;
  for (let i = 0; i < moving.length; i++) {
    const a = moving[i].player, old = moving[i - 1]?.player; safe(moving[i]);
    assert.ok(a.rig.presentationV133.stepsPerSecond < 5.2);
    for (const side of ['near', 'far']) {
      const foot = a.rig.contacts.feet[side], prior = old?.rig.contacts.feet[side]; lift = Math.max(lift, foot.lift || 0);
      assert.ok(!a.rig.legs[side].reachClamped);
      if (foot.planted && prior?.planted && old.facing === a.facing) { slide = Math.max(slide, Math.hypot(foot.point.x - prior.point.x, foot.point.y - prior.point.y)); contactPairs++; }
    }
  }
  assert.ok(contactPairs >= 3); assert.ok(slide < .01); assert.ok(lift <= 6.01);
  return { samples: moving.length, contactPairs, maxPlantedFootSlide: slide, maxLift: lift, startX: samples[0].player.x, endX: samples.at(-1).player.x };
}
async function animationJourney() {
  const ctx = await context(); await importIdle(fixture('bridge', 400)); await capture('motion-start');
  const forward = await motionSamples('KeyD'); check('Real walking keeps planted feet stationary in world space and retains subdued boot lift.', inspectGait(forward));
  await page.waitForTimeout(500); const stopped = await snapshot(); assert.equal(stopped.player.motion.moving, false);
  await page.waitForTimeout(250); const settled = await snapshot(); assert.equal(settled.player.motion.cycles, stopped.player.motion.cycles);
  check('Released walking settles without advancing its distance-driven cycle.', { stopped, settled }); await capture('motion-settled');
  const backward = await motionSamples('KeyA'); check('Mirrored walking retains the same floor contacts and proportions.', inspectGait(backward));
  const npcSamples = [];
  for (let i = 0; i < 100; i++) { await page.waitForTimeout(200); npcSamples.push(await snapshot()); if ([0, 45, 99].includes(i)) await capture(`npc-life-${i}`); }
  const lives = npcSamples.flatMap(s => s.presentation.npcLifeV136 || []); assert.ok(lives.length > 10, 'Integrated NPC life must be observed.');
  assert.ok(lives.some(a => a.mode === 'moving')); assert.ok(lives.some(a => a.mode === 'idle' || a.mode === 'turn'));
  const ids = [...new Set(lives.map(a => a.crewId))];
  const perActor = ids.map(id => ({ id, modes: [...new Set(lives.filter(a => a.crewId === id).map(a => a.mode))],
    clips: [...new Set(lives.filter(a => a.crewId === id).map(a => a.passive?.clipId).filter(Boolean))] }));
  safe(npcSamples.at(-1)); check('Actual NPC schedules vary between travel and rest in an uninterrupted twenty-second observation.', { perActor, samples: npcSamples.length });
  report.npcSamples = npcSamples; report.journeys.push({ id: 3, perspective: 'procedural-gait-and-npc-life', status: 'passed' }); await ctx.close();
}
async function touchHold(control, duration, cancel = false) {
  const button = page.locator(`[data-hub-control="${control}"]`); await button.scrollIntoViewIfNeeded(); const b = await button.boundingBox(); assert.ok(b);
  const session = await page.context().newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: b.x + b.width / 2, y: b.y + b.height / 2, radiusX: 4, radiusY: 4 }] });
  try { await page.waitForTimeout(duration); } finally { await session.send('Input.dispatchTouchEvent', { type: cancel ? 'touchCancel' : 'touchEnd', touchPoints: [] }); await session.detach(); }
}
async function touchJourney() {
  const ctx = await context({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); await importIdle(fixture('bridge', 940));
  for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport); await page.waitForTimeout(150);
    const geometry = await page.evaluate(() => ({ viewport: { width: innerWidth, height: innerHeight }, pageWidth: document.documentElement.scrollWidth,
      controls: [...document.querySelectorAll('[data-hub-control]')].filter(b => !b.hidden && b.getBoundingClientRect().width).map(b => {
        const r = b.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return { control: b.dataset.hubControl, name: b.getAttribute('aria-label'), x: r.x, y: r.y, w: r.width, h: r.height, reachable: hit === b || b.contains(hit) };
      }) }));
    assert.ok(geometry.pageWidth <= viewport.width + 1); assert.ok(geometry.controls.length >= 4);
    assert.ok(geometry.controls.every(b => b.name && b.w >= 44 && b.h >= 44 && b.reachable));
    await capture(`touch-layout-${viewport.width}`, true); check(`${viewport.width}px viewport retains named, reachable controls without horizontal page overflow.`, geometry);
  }
  const before = await snapshot(); await touchHold('right', 1200); await page.waitForTimeout(350); const released = await snapshot();
  await page.waitForTimeout(300); const stopped = await snapshot(); safe(stopped);
  assert.ok(stopped.player.x > before.player.x + 100); assert.ok(!stopped.keys.includes('KeyD')); assert.ok(Math.abs(stopped.player.x - released.player.x) < 2);
  await touchHold('left', 250, true); await page.waitForTimeout(350); const cancelled = await snapshot();
  await page.waitForTimeout(250); const afterCancel = await snapshot(); assert.ok(!afterCancel.keys.includes('KeyA')); assert.ok(Math.abs(afterCancel.player.x - cancelled.player.x) < 2);
  await capture('touch-physical-travel'); check('Native touch travel and touch cancellation release movement without retained drift.', { before, stopped, cancelled, afterCancel });
  report.journeys.push({ id: 4, perspective: 'touch-controls-and-resize', status: 'passed' }); await ctx.close();
}
async function main() {
  await fs.mkdir(output, { recursive: true }); const before = await sourceManifest();
  report.sourceSignatureAtStart = createHash('sha256').update(JSON.stringify(before)).digest('hex');
  const module = await playwright(), { chromium } = module.chromium ? module : module.default;
  browser = await chromium.launch({ headless: true, executablePath: process.env.ATF_CHROMIUM_EXECUTABLE || '/usr/bin/chromium' });
  for (const [id, journey] of [['navigation', navigationJourney], ['composition', compositionJourney], ['animation', animationJourney], ['touch', touchJourney]]) if (scope === 'all' || scope === id) await journey();
  assert.ok(report.journeys.length > 0, 'Unknown QA scope.');
  const after = await sourceManifest(); report.sourceChangedFiles = Object.keys(after).filter(path => before[path] !== after[path]);
  report.sourceSignatureAtEnd = createHash('sha256').update(JSON.stringify(after)).digest('hex'); assert.deepEqual(report.sourceChangedFiles, []);
  assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.requestFailures, []); report.status = 'passed';
}
await main().catch(async error => { report.status = 'failed'; report.error = { message: error.message, stack: error.stack }; process.exitCode = 1;
  if (page && !page.isClosed()) { report.lastObservedState = await snapshot().catch(() => null); await page.screenshot({ path: join(output, 'failure.png'), fullPage: true }).catch(() => {}); }
}).finally(async () => { report.finishedAt = new Date().toISOString(); await fs.mkdir(output, { recursive: true });
  await fs.writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2)); await browser?.close();
  console.log(JSON.stringify({ status: report.status, journeys: report.journeys.length, checks: report.checks.length, error: report.error?.message, report: join(output, 'report.json') }));
});
