import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';
import { HUB_DECKS } from '../src/hub-game.js';
import { HUB_SHIP_SPACES_V137, HUB_SHIP_CONNECTIONS_V137 } from '../src/hub-ship-layout-v137.js';
import { createHubCommercialStateV137 } from '../src/hub-annex-registry-v137.js';

// Save checkpoints disclose only an idle parent room. Every new entrance,
// station, service route and return is reached with native keyboard input.
// Runtime globals are read only. No actor mutation, teleport or win injection.
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(process.env.ATF_LEVEL_QA_OUTPUT || join(tmpdir(), `atf-tantalus-level-v138-${Date.now()}`));
const rel = relative(root, output);
if (!rel || rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel)) throw Error('QA evidence must remain outside the checkout.');
const base = process.env.ATF_BASE_URL || 'http://127.0.0.1:4173';
const pass = process.env.ATF_LEVEL_QA_PASS || 'final';
const scope = process.env.ATF_LEVEL_QA_SCOPE || 'all';
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
let manifestSequence = 0;
async function sourceManifest() {
  const sources = (await fs.readdir(join(root, 'src'), { recursive: true })).filter(path => path.endsWith('.js')).map(path => `src/${path}`);
  const assets = (await fs.readdir(join(root, 'assets'), { recursive: true, withFileTypes: true }))
    .filter(entry => entry.isFile()).map(entry => relative(root, join(entry.parentPath, entry.name)));
  const files = [...new Set([...sources, ...assets, 'index.html', 'runtime-level.css', 'sw.js'])].sort();
  const manifest = {};
  const scriptSha256 = createHash('sha256').update(await fs.readFile(fileURLToPath(import.meta.url))).digest('hex');
  if (manifestSequence === 0) report.scriptSha256 = scriptSha256;
  else assert.equal(scriptSha256, report.scriptSha256, 'The actual QA recipe changed during execution.');
  report.sourceManifestFormat = 'relative-path-sha256-map-v1';
  report.sourceManifestFiles = { start: 'source-manifest-start.json', end: 'source-manifest-end.json' };
  // Hash sequentially: the original asset collection is about 1.5 GB; evidence
  // must cover it without retaining the entire collection in process memory.
  for (const path of files) manifest[path] = createHash('sha256').update(await fs.readFile(join(root, path))).digest('hex');
  for (const name of ['furniture-atlas.png', 'service-front-atlas.png', 'ship-front-atlas.png', 'surface-details-atlas.png', 'annex-stations-front-atlas.png', 'dropship-hangar-side.png'])
    assert.ok(manifest[`assets/openai/hub/props/v139/${name}`], `Required V139 original asset missing: ${name}`);
  report.sourceFiles = files.length;
  report.sourceAssetFiles = assets.length;
  report.v139AssetFiles = assets.filter(path => path.startsWith('assets/openai/hub/props/v139/')).sort();
  await fs.writeFile(join(output, `source-manifest-${++manifestSequence === 1 ? 'start' : 'end'}.json`), JSON.stringify(manifest, null, 2));
  return manifest;
}
function observe() {
  const h = globalThis.__ATF_HUB__;
  if (!h?.player) return null;
  const snap = h.getSnapshot(), annex = h.currentAnnexV71?.();
  return { running: h.running, deck: h.state.deck, room: h.currentRoom()?.id, annex: annex?.id || null,
    transition: h.annexTransitionV71?.direction || null, time: h.animationTime,
    player: Object.fromEntries(['x', 'y', 'w', 'h', 'vx', 'vy', 'grounded', 'climbing', 'crouching', 'health', 'shockHits', 'facing'].map(key => [key, h.player[key]])),
    camera: { ...(annex ? h.annexCameraV71 : h.camera) }, keys: [...h.keys], prompt: h.statusPrompt(),
    station: h.nearestAnnexStationV71?.()?.annexId || null, exit: h.nearestAnnexExitV71?.() || null,
    ladders: (annex?.ladders || h.v51Ladders || []).map(a => ({ ...a })),
    platforms: (annex?.platforms || h.v51Platforms || []).map(a => ({ ...a })),
    ventActive: h.isVentActiveV62?.() || false, ventTransit: h.ventActorV62?.ventTransit ? structuredClone(h.ventActorV62.ventTransit) : null,
    nearestVent: h.nearestVent?.() ? { ...h.nearestVent() } : null,
    vents: (h.v51Vents || []).map(a => ({ ...a })),
    presentation: Object.fromEntries(Object.entries(snap).filter(([key]) => /134|136|137|138|Commercial|stationUses|visitedAnnex/.test(key))) };
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
  await page.waitForFunction(() => { const snapshot = globalThis.__ATF_HUB__?.getSnapshot(), life = snapshot?.hubRoomLifeV136?.current;
    const shell = snapshot?.hubCompartmentShellV138?.current;
    return life?.furnishingV137 && life.furnishingV137.pendingImageRoles.length === 0 &&
      (!shell || !['original-wall-material', 'preserve-authored-refuge-apertures'].includes(shell.sourcePolicy) || shell.nativeReady === true); });
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
  try { await page.waitForFunction(t => { const p = globalThis.__ATF_HUB__?.player;
    return p?.grounded === true && p.climbing === false && Math.abs(p.vy) < .02 && Math.abs(p.y + p.h - t) < .02;
  }, footY, { polling: 'raf', timeout: 10000 }); }
  finally { await page.keyboard.up(key); }
  // Complete the native endpoint dismount before key release; touching its
  // height alone can still be a valid ladder hold rather than standing support.
  await page.waitForFunction(t => { const p = globalThis.__ATF_HUB__?.player;
    return p?.grounded === true && p.climbing === false && Math.abs(p.vy) < .02 && Math.abs(p.y + p.h - t) < .02;
  }, footY, { polling: 'raf', timeout: 2000 });
  const after = await state(); safe(after, footY); return after;
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
  safe(await state(), connection.annexDoorBounds.y + connection.annexDoorBounds.h); return atDoor;
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
async function reachAnnexStandingPlane(footY, destinationX) {
  const current = await state(), currentFoot = current.player.y + current.player.h;
  if (Math.abs(currentFoot - footY) < .15) return current;
  assert.ok(current.annex, 'Standing-plane transfers must use actual annex ladders.');
  const candidates = current.ladders.filter(ladder => Math.abs(ladder.top - Math.min(currentFoot, footY)) < .15
    && Math.abs(ladder.bottom - Math.max(currentFoot, footY)) < .15);
  assert.ok(candidates.length > 0, `No real ladder links feet${currentFoot} to feet${footY}.`);
  const center = ladder => ladder.x + ladder.w / 2 - current.player.w / 2;
  candidates.sort((a, b) => Math.abs(center(a) - current.player.x) + Math.abs(center(a) - destinationX)
    - Math.abs(center(b) - current.player.x) - Math.abs(center(b) - destinationX));
  await walkTo(center(candidates[0]), currentFoot); return climbTo(footY, footY < currentFoot);
}
async function leaveAt(connection) {
  const x = connection.entranceLocalX + (connection.entranceSide === 'west' ? connection.annexDoorBounds.w / 2 + 16 : -connection.annexDoorBounds.w / 2 - 60);
  const annexFootY = connection.annexDoorBounds.y + connection.annexDoorBounds.h;
  await reachAnnexStandingPlane(annexFootY, x); await walkTo(x, annexFootY); await capture(`${connection.spaceId}-${connection.entranceSide}-exit-approach`); await page.keyboard.press('KeyE');
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

async function importLevelCheckpoint(save, expectedAnnex = null, footY = 624) {
  if (await page.locator('#exit-hub').isVisible()) await page.locator('#exit-hub').click();
  await openView('settings');
  await page.locator('#save-import').setInputFiles({ name: 'tantalus-level-v138-disclosed-checkpoint.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).last().waitFor(); await openView('hub'); await ready();
  const s = await state(); assert.equal(s.annex, expectedAnnex); safe(s, footY); return s;
}
async function observeSolidMaterials(label) {
  const s = await state(), shell = s.presentation.hubCompartmentShellV138?.current;
  assert.ok(shell, `${label}: the actual compartment material model must be observed.`);
  assert.equal(shell.sourcePolicy, 'original-wall-material'); assert.equal(shell.nativeReady, true);
  assert.ok(shell.solidBacking); assert.ok(shell.nativeTiles.length > 0);
  for (const tile of shell.nativeTiles) {
    assert.ok(Math.abs(tile.target.w / tile.source.w - tile.target.h / tile.source.h) < 1e-8);
    assert.ok(tile.target.w / tile.source.w <= 1 + 1e-8);
  }
  return { label, shell };
}
async function medicalJourneyV138() {
  await importParent(fixture('medical', 100)); const start = await state();
  const first = start.ladders.find(a => a.id === 'medical-floor'), tier = start.ladders.find(a => a.id === 'medical-tier');
  assert.ok(first && tier); const actorX = ladder => ladder.x - 22;
  await walkTo(actorX(first)); await climbTo(first.top); await capture('medical-first-landing');
  // Preserve the sprint approach and settling delay which exposed the V137 fall.
  await walkTo(actorX(tier), tier.bottom, true); const sprintArrival = await capture('medical-sprint-arrival-before-climb');
  assert.equal(sprintArrival.player.grounded, true); safe(sprintArrival, tier.bottom);
  await climbTo(tier.top); const upper = await capture('medical-upper-landing-after-sprint');
  check('Normal sprint braking reaches the medical ladder on a real standing support, followed by native W ascent without a jump.', { sprintArrival, upper });
  const vent = upper.vents.find(a => a.id === 'medical-vent'); assert.ok(vent);
  await walkTo(vent.x - 44 - 40, tier.top, false); const approach = await capture('medical-crawl-advice-before-contact');
  assert.match(approach.prompt, /C.*RAMPER/); assert.equal(approach.nearestVent, null);
  assert.ok(vent.x - approach.player.x - approach.player.w > 0);
  await walkTo(vent.x - 44 - 76, tier.top, false); const withdrawn = await capture('medical-crawl-advice-withdrawn');
  assert.doesNotMatch(withdrawn.prompt, /C.*RAMPER/);
  check('Crawl advice appears before contact and disappears beyond its short approach range.', { approach, withdrawn });
  await page.keyboard.down('KeyD'); await page.waitForTimeout(1000); await page.keyboard.up('KeyD'); await page.waitForTimeout(220);
  const blocked = await capture('medical-standing-contact-crawl-advice'); safe(blocked, tier.top);
  assert.ok(Math.abs(blocked.player.x + blocked.player.w - vent.x) < .1); assert.match(blocked.prompt, /C.*RAMPER/);
  assert.equal(blocked.nearestVent, null); await page.keyboard.press('KeyE'); await page.waitForTimeout(250);
  assert.equal((await state()).ventActive, false, 'Approach advice must not enlarge the actual E entrance.');
  check('Standing contact gives the C instruction while the real vent entrance still rejects E outside overlap.', blocked);
  await page.keyboard.down('KeyC'); await page.keyboard.down('KeyD');
  try { await page.waitForFunction(x => globalThis.__ATF_HUB__.player.x >= x + 55, blocked.player.x, { timeout: 6000, polling: 'raf' }); }
  finally { await page.keyboard.up('KeyD'); }
  const crawled = await capture('medical-native-crouch-through-grille'); assert.ok(crawled.player.x > blocked.player.x + 50);
  assert.ok(crawled.nearestVent); assert.match(crawled.prompt, /E.*TRAPPE|E.*CONDUIT/); safe(crawled, tier.top);
  await page.keyboard.press('KeyE'); await page.keyboard.up('KeyC');
  await page.waitForFunction(() => globalThis.__ATF_HUB__.isVentActiveV62?.() && globalThis.__ATF_HUB__.ventActorV62?.ventTransit?.phase === 'at-node');
  await capture('medical-real-duct-entry'); await page.keyboard.press('KeyE');
  await page.waitForFunction(() => !globalThis.__ATF_HUB__.isVentActiveV62?.());
  const returned = await capture('medical-real-duct-return'); assert.equal(returned.room, 'medical'); safe(returned, tier.top);
  check('Crouching passes the same physical grille, then native E enters and returns from the real duct network.', { blocked, crawled, returned });
  await walkTo(actorX(tier), tier.top, true); const reverse = await capture('medical-reverse-sprint-arrival');
  assert.equal(reverse.player.grounded, true); await climbTo(tier.bottom, false);
  await walkTo(actorX(first), first.top, true); await climbTo(first.bottom, false); const floor = await capture('medical-sprint-and-ladder-return-floor');
  safe(floor); check('The reverse sprint approach and both native descents return safely to floor624.', { reverse, floor });
  check('The medical scene actually paints its original interior material without stretching.', await observeSolidMaterials('medical'));
  report.routes.push({ id: 'medical-sprint-crawl-advice-and-real-duct', status: 'passed' });
}
async function maintenanceJourneyV138() {
  const space = HUB_SHIP_SPACES_V137.find(a => a.id === 'maintenance-spine');
  const west = HUB_SHIP_CONNECTIONS_V137.find(c => c.spaceId === space.id && c.entranceSide === 'west');
  const east = HUB_SHIP_CONNECTIONS_V137.find(c => c.spaceId === space.id && c.entranceSide === 'east');
  const upperFoot = east.annexDoorBounds.y + east.annexDoorBounds.h; assert.equal(upperFoot, 426);
  await reachParent(west); await reachAnnexStandingPlane(upperFoot, 2100); await walkTo(2100, upperFoot);
  const midpoint = await capture('maintenance-extension-upper-midpoint'); assert.ok(midpoint.player.x > 1800);
  const persisted = await persistAndReload(midpoint, west.id); const workshop = await leaveAt(east);
  check('The real upper deck extends beyond its former end, survives a save/reload at426 and reaches the workshop doorway.', { midpoint, persisted, workshop });
  await walkTo(east.parentDoorBounds.x + east.parentDoorBounds.w / 2 - 22); await page.keyboard.press('KeyE');
  await page.waitForFunction(id => { const h = globalThis.__ATF_HUB__; return h.currentAnnexV71?.()?.id === id && !h.annexTransitionV71; }, space.id);
  const arrival = await capture('maintenance-fresh-workshop-entry-upper'); safe(arrival, upperFoot);
  assert.equal(arrival.presentation.hubCommercialV71?.activeConnectionIdV137, east.id);
  const restored = await persistAndReload(arrival, east.id); safe(restored.restored, upperFoot);
  const sensor = await leaveAt(west);
  check('Fresh workshop entry stands on426, retains that altitude after reload and returns through the real ladder to the sensor-side floor exit.', { arrival, restored, sensor });
  report.routes.push({ id: 'maintenance-upper-workshop-entry-and-reload', status: 'passed' });
}
async function legacyJourneyV138() {
  const legacyPath = process.env.ATF_LEVEL_QA_LEGACY_SAVE;
  const west = HUB_SHIP_CONNECTIONS_V137.find(c => c.spaceId === 'maintenance-spine' && c.entranceSide === 'west');
  const east = HUB_SHIP_CONNECTIONS_V137.find(c => c.spaceId === 'maintenance-spine' && c.entranceSide === 'east');
  let legacy, bytes;
  if (legacyPath) { bytes = await fs.readFile(resolve(legacyPath)); legacy = JSON.parse(bytes); }
  else {
    // Portable compatibility fixture, explicitly reconstructed rather than archived.
    // V137's public floor is624; this idle actor has its feet there at y532.
    legacy = fixture(west.parentRoomId, 180);
    const commercial = createHubCommercialStateV137();
    Object.assign(commercial, { registryVersion: 137, activeAnnexId: 'maintenance-spine', lastAnnexId: 'maintenance-spine',
      annexPositionX: 1258, annexPositionY: 532, annexClimbing: false, activeConnectionIdV137: west.id,
      returnContext: { endpointId: west.id, deckId: west.parentDeck, roomId: west.parentRoomId, x: legacy.hub.positionX, facing: 1 } });
    commercial.annexes['maintenance-spine'].visited = true; commercial.visitedAnnexIds.push('maintenance-spine');
    legacy.hub.commercialV71 = commercial; bytes = Buffer.from(JSON.stringify(legacy));
  }
  const raw = legacy.hub?.commercialV71 || legacy.hub?.hubCommercialV71;
  assert.equal(raw?.activeAnnexId, 'maintenance-spine'); assert.equal(raw.registryVersion, 137); assert.equal(raw.annexPositionY, 532);
  report.legacyFixture = { sha256: hash(bytes), provenance: legacyPath ? 'actual-v137-browser-exit' : 'reconstructed-v137-floor-checkpoint',
    method: legacyPath ? 'Actual V137 browser-exit save, imported through the Save picker.'
      : 'Reconstructed idle V137 checkpoint from public maintenance geometry and registry137; not an archived user save. Imported through the Save picker.',
    publicSources: legacyPath ? undefined : ['src/hub-ship-layout-v137.js', 'src/hub-annex-registry-v137.js'],
    original: { x: raw.annexPositionX, y: raw.annexPositionY, endpoint: raw.activeConnectionIdV137, registryVersion: raw.registryVersion } };
  const loaded = await importLevelCheckpoint(legacy, 'maintenance-spine', 624); await capture('legacy-v137-floor-checkpoint-restored');
  assert.ok(Math.abs(loaded.player.x - raw.annexPositionX) <= 2);
  const eastX = east.entranceLocalX - east.annexDoorBounds.w / 2 - 60;
  await walkTo(eastX); await page.keyboard.press('KeyE'); await page.waitForTimeout(350);
  const belowDoor = await capture('legacy-floor-below-upper-door-refused'); assert.equal(belowDoor.annex, 'maintenance-spine'); safe(belowDoor);
  const workshop = await leaveAt(east); safe(workshop);
  check(`${legacyPath ? 'A real V137 browser-exit save' : 'A reconstructed V137 floor checkpoint'} preserves its position; the upper doorway refuses E from below and becomes usable after an actual ladder climb.`, { fixture: report.legacyFixture, loaded, belowDoor, workshop });
  await walkTo(east.parentDoorBounds.x + east.parentDoorBounds.w / 2 - 22); await page.keyboard.press('KeyE');
  await page.waitForFunction(() => globalThis.__ATF_HUB__.currentAnnexV71?.()?.id === 'maintenance-spine' && !globalThis.__ATF_HUB__.annexTransitionV71);
  const sensor = await leaveAt(west); safe(sensor);
  check('The migrated journey can continuously return from workshop upper entry to the unchanged lower sensor exit.', sensor);
  report.routes.push({ id: legacyPath ? 'real-v137-floor-save-compatibility' : 'reconstructed-v137-floor-checkpoint-compatibility', status: 'passed' });
}
async function main() {
  await fs.mkdir(output, { recursive: true }); const before = await sourceManifest(); report.sourceFiles = Object.keys(before).length;
  report.sourceSignatureAtStart = hash(JSON.stringify(before));
  report.method = 'Native-control V138 journeys: sprint and ladders, precontact crawl advice with exact duct entry, upper maintenance door and reload, then a V137 compatibility checkpoint with actual or reconstructed provenance stated in legacyFixture. Runtime globals are read only.';
  const module = await playwright(), { chromium } = module.chromium ? module : module.default;
  browser = await chromium.launch({ headless: true, executablePath: process.env.ATF_CHROMIUM_EXECUTABLE || '/usr/bin/chromium' });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, serviceWorkers: 'block' });
  page = await context.newPage(); page.setDefaultTimeout(30000);
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
  await page.goto(base, { waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click(); await page.locator('#title-options').click();
  for (const [id, journey] of [['medical', medicalJourneyV138], ['maintenance', maintenanceJourneyV138], ['legacy', legacyJourneyV138]])
    if (scope === 'all' || scope === id) await journey();
  assert.ok(report.routes.length > 0, 'Unknown QA scope.');
  const after = await sourceManifest(); report.sourceSignatureAtEnd = hash(JSON.stringify(after));
  report.sourceChangedFiles = Object.keys(after).filter(path => before[path] !== after[path]); assert.deepEqual(report.sourceChangedFiles, []);
  assert.equal(report.sourceSignatureAtStart, report.sourceSignatureAtEnd); assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.requestFailures, []);
  check('Production JS, every original asset and presentation files retain their signatures throughout the complete native-control recipe.',
    { sourceFiles: report.sourceFiles, signature: report.sourceSignatureAtEnd }); report.status = 'passed';
}
await main().catch(async error => {
  report.status = 'failed'; report.error = { message: error.message, stack: error.stack }; process.exitCode = 1;
  if (page) { report.lastObservedState = await state().catch(() => null); await page.locator('#hub-canvas').screenshot({ path: join(output, 'failure-context.png') }).catch(() => {}); }
}).finally(async () => {
  report.finishedAt = new Date().toISOString(); await fs.mkdir(output, { recursive: true }); await fs.writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2));
  await browser?.close(); console.log(JSON.stringify({ status: report.status, pass, routes: report.routes.length, checks: report.checks.length, captures: report.captures.length, error: report.error?.message, report: join(output, 'report.json') }));
});
