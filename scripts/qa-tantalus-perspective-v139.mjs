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
import { HUB_ANNEXES_V137, createHubCommercialStateV137 } from '../src/hub-annex-registry-v137.js';
import { getHubCirculationPlanV137 } from '../src/hub-circulation-v137.js';
import { getHubSupportPlanesV139, getHubLadderMountV139 } from '../src/hub-support-planes-v139.js';

// Save checkpoints disclose only an idle parent room. Every new entrance,
// station, service route and return is reached with native keyboard input.
// Runtime globals are read only. No actor mutation, teleport or win injection.
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(process.env.ATF_PERSPECTIVE_QA_OUTPUT || join(tmpdir(), `atf-tantalus-perspective-v139-${Date.now()}`));
const rel = relative(root, output);
if (!rel || rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel)) throw Error('QA evidence must remain outside the checkout.');
const base = process.env.ATF_BASE_URL || 'http://127.0.0.1:4173';
const pass = process.env.ATF_PERSPECTIVE_QA_PASS || 'final';
const scope = process.env.ATF_PERSPECTIVE_QA_SCOPE || 'all';
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
function observe(withFrame = false) {
  const h = globalThis.__ATF_HUB__;
  if (!h?.player) return null;
  const snap = h.getSnapshot(), annex = h.currentAnnexV71?.();
  const result = { running: h.running, deck: h.state.deck, room: h.currentRoom()?.id, annex: annex?.id || null,
    transition: h.annexTransitionV71?.direction || null, time: h.animationTime,
    player: Object.fromEntries(['x', 'y', 'w', 'h', 'vx', 'vy', 'grounded', 'climbing', 'crouching', 'health', 'shockHits', 'facing'].map(key => [key, h.player[key]])),
    visual: { appearance: h.player.playerAppearanceVisualV126 || null, rig: h.player.playerLocomotionVisualV129 || null, motion: h.player.playerLocomotionStateV129 || null },
    depthEnabled: h.depthPresentationV116 !== false, camera: { ...(annex ? h.annexCameraV71 : h.camera) }, keys: [...h.keys], prompt: h.statusPrompt(),
    station: h.nearestAnnexStationV71?.()?.annexId || null, exit: h.nearestAnnexExitV71?.() || null,
    interaction: h.nearestInteraction?.()?.id || null,
    ladders: (annex?.ladders || h.v51Ladders || []).map(a => ({ ...a })),
    platforms: (annex?.platforms || h.v51Platforms || []).map(a => ({ ...a })),
    ventActive: h.isVentActiveV62?.() || false, ventTransit: h.ventActorV62?.ventTransit ? structuredClone(h.ventActorV62.ventTransit) : null,
    nearestVent: h.nearestVent?.() ? { ...h.nearestVent() } : null,
    vents: (h.v51Vents || []).map(a => ({ ...a })),
    presentation: Object.fromEntries(Object.entries(snap).filter(([key]) => /119|134|136|137|138|139|Commercial|stationUses|visitedAnnex/.test(key))) };
  if (withFrame) { const canvas = document.querySelector('#hub-canvas'); result.framePng = canvas.toDataURL('image/png'); result.bitmapSize = { width: canvas.width, height: canvas.height }; }
  return result;
}
const state = () => page.evaluate(observe);
const check = (label, evidence) => report.checks.push({ label, evidence });
function safe(s, footY = 624) {
  assert.equal(s.player.health, 100); assert.equal(s.player.shockHits, 0);
  const human = s.visual.appearance?.humanVisualV133;
  assert.equal(human?.standingHeight, 96.5, 'Human reference size stays constant at every altitude.');
  assert.ok(Math.abs(human.scaleX - human.scaleY) < 1e-8);
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
  await page.waitForFunction(() => { const snap = globalThis.__ATF_HUB__?.getSnapshot(), life = snap?.hubRoomLifeV136?.current;
    const shell = snap?.hubCompartmentShellV138?.current;
    return life?.furnishingV137 && life.furnishingV137.pendingImageRoles.length === 0 &&
      life.workstationDetailsV139?.pending?.length === 0 &&
      (!shell || !['original-wall-material', 'preserve-authored-refuge-apertures'].includes(shell.sourcePolicy) || shell.nativeReady === true); });
  // Read native canvas pixels and the actual state in one browser task. This
  // does not redraw, pause, replace renderer methods or alter production pixels.
  const s = await page.evaluate(observe, true), bytes = Buffer.from(s.framePng.split(',')[1], 'base64'); delete s.framePng;
  const file = `${String(++serial).padStart(2, '0')}-${label}.png`; await fs.writeFile(join(output, file), bytes);
  report.captures.push({ label, file, sha256: hash(bytes), method: 'synchronous-native-canvas-and-state-read', state: s }); return s;
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
  // Keep native W/S through the endpoint transition: a clamp-height sample can
  // still be a ladder hold, or precede the normal short gravity arc. Inspect
  // standing feet only after real settled support, then confirm key release.
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

function shadowAt(s, expected) {
  const shadow = s.presentation.playerSupportV139;
  assert.ok(shadow, 'The native player draw must publish the actual shadow result.');
  if (!expected) {
    assert.equal(shadow.drawn, false); assert.equal(shadow.contactY, null);
    assert.equal(shadow.omittedReason, 'ladder-contact'); return;
  }
  assert.equal(shadow.drawn, true);
  assert.ok(shadow, 'The actual player draw must report its contact shadow.');
  const feet = s.player.y + s.player.h;
  assert.ok(Math.abs(shadow.contactY - feet) < .02);
  assert.ok(Math.abs(shadow.supportY - feet) < .02); assert.ok(Math.abs(shadow.footY - feet) < .02);
  assert.ok(Math.abs(shadow.y - feet) <= shadow.radiusY, 'The actual ellipse must intersect the physical foot line.');
}
function climbingAt(s, mode) {
  assert.equal(s.player.climbing, true); assert.equal(s.player.grounded, false); safe(s, null); shadowAt(s, false);
  const transit = s.visual.appearance?.transit;
  assert.equal(transit?.kind, 'climb'); assert.equal(transit.mode, mode); assert.equal(transit.drawn, true); assert.equal(transit.firing, false);
  const ladder = s.ladders.find(entry => entry.id === transit.contacts.ladderId);
  const mount = getHubLadderMountV139(ladder, { centered: !s.annex }); assert.ok(mount?.rungs.length);
  for (const limb of ['hands', 'feet']) {
    const contacts = Object.values(transit.contacts[limb]); assert.ok(contacts.some(contact => contact.planted));
    for (const contact of contacts.filter(contact => contact.planted)) {
      const rung = mount.rungs.find(entry => entry.index === contact.rungIndex); assert.ok(rung, 'Every planted limb must name a genuinely painted rung.');
      assert.ok(Math.abs(contact.point.y - contact.rungY) < .02); assert.ok(Math.abs(contact.rungY - rung.y) < .02);
      assert.ok(contact.point.x >= rung.x - .02 && contact.point.x <= rung.x + rung.w + .02);
    }
  }
}
function supportAt(s) {
  const feet = s.player.y + s.player.h, center = s.player.x + s.player.w / 2;
  const platform = s.platforms.find(p => p.type !== 'floor' && p.role !== 'floor' && Math.abs(p.y - feet) < .15 && center >= p.x && center <= p.x + p.w);
  assert.ok(platform, 'Native actor feet must stand on an actual authored support.');
  const room = s.annex ? { ...HUB_SHIP_SPACES_V137.find(a => a.id === s.annex), xStart: 0 } : HUB_DECKS.flatMap(d => d.rooms).find(r => r.id === s.room);
  assert.ok(room); const planes = getHubSupportPlanesV139(room, { depthEnabled: s.depthEnabled });
  const plan = getHubCirculationPlanV137(platform, { room, ladders: s.ladders, vents: s.vents, platforms: s.platforms, centeredLadders: !s.annex, depthEnabled: s.depthEnabled });
  assert.equal(plan.footY, feet); assert.equal(planes.coordinatePolicy, 'preserve-native-support-and-feet');
  assert.ok(plan.topSurface.every(point => point[1] >= feet), 'A service surface must continue toward the viewer from the real rear support edge.');
  if (planes.presentationMode === '2.5d') { assert.equal(plan.depthY, 8); assert.ok(plan.depthDx > 0); }
  else { assert.equal(plan.depthY, 0); assert.equal(plan.depthDx, 0); }
  for (const face of plan.frontFaces) assert.ok(face.y >= feet);
  safe(s, platform.y); shadowAt(s, true); return { planes, platform, plan };
}
async function activeClimb(label, ladder) {
  const before = await state(), target = (before.player.y + before.player.h + ladder.top) / 2;
  await page.keyboard.down('KeyW'); let active;
  try {
    await page.waitForFunction(y => { const p = globalThis.__ATF_HUB__.player; return p.y + p.h <= y; }, target, { polling: 'raf', timeout: 10000 });
    active = await capture(`${label}-W-held`); assert.ok(active.keys.includes('KeyW')); climbingAt(active, 'ascending');
  } finally { await page.keyboard.up('KeyW'); }
  await page.waitForTimeout(140); const holding = await capture(`${label}-W-released-holding`); assert.ok(!holding.keys.includes('KeyW')); climbingAt(holding, 'holding');
  await climbTo(ladder.top); const start = await state();
  await page.keyboard.down('KeyD'); let moving;
  try {
    await page.waitForFunction(x => globalThis.__ATF_HUB__.player.x >= x + 180, start.player.x, { polling: 'raf', timeout: 10000 });
    moving = await capture(`${label}-D-held-on-support`); assert.ok(moving.keys.includes('KeyD')); assert.ok(moving.player.vx > 0); assert.equal(moving.player.climbing, false); supportAt(moving);
  } finally { await page.keyboard.up('KeyD'); }
  await page.waitForTimeout(320); const settled = await state(); safe(settled, ladder.top);
  check(`${label}: held W, released holding and moving D use actual ladder contacts, support geometry and native shadow visibility.`, { active, holding, moving, support: supportAt(moving) });
  return { active, holding, moving, settled };
}
async function parentLaddersJourney() {
  await importParent(fixture('medical', 100)); let s = await state(), ladder = s.ladders.find(l => l.id === 'medical-floor'); assert.ok(ladder);
  await walkTo(ladder.x - 22); await activeClimb('medical-first-ladder', ladder);
  await importParent(fixture('crew-quarters', 100)); const room = HUB_DECKS.flatMap(d => d.rooms).find(r => r.id === 'crew-quarters');
  await walkTo(room.xStart + 210 - 22); await climbTo(500); await walkTo(room.xStart + 610 - 22, 500);
  s = await state(); ladder = s.ladders.find(l => l.id === 'quarters-tier'); assert.ok(ladder); await activeClimb('quarters-upper-ladder', ladder);
  report.routes.push({ id: 'parent-native-ladder-poses-and-contact-shadows', status: 'passed' });
}
async function engineLadderJourney() {
  const space = HUB_SHIP_SPACES_V137.find(a => a.id === 'engine-room'), connection = HUB_SHIP_CONNECTIONS_V137.find(c => c.spaceId === space.id);
  await reachParent(connection); const ladder = space.ladders[0]; await walkTo(ladder.x + ladder.w / 2 - 22);
  const route = await activeClimb('engine-service-ladder', ladder); assert.ok(route.moving.camera.x - route.active.camera.x > 100);
  report.routes.push({ id: 'annex-native-ladder-pose-and-camera', status: 'passed' });
}
async function movedLaddersJourney() {
  for (const [id, ladderId] of [['science-lab', 'lab-floor'], ['sensor-array', 'sensor-floor']]) {
    await importParent(fixture(id, 100)); const s = await state(), room = HUB_DECKS.flatMap(d => d.rooms).find(r => r.id === id), ladder = s.ladders.find(l => l.id === ladderId);
    assert.ok(ladder); assert.equal(ladder.x - room.xStart, 800); await walkTo(ladder.x - 22);
    // The shorter lower service deck has no180px clearance in every room.
    await page.keyboard.down('KeyW'); let climbing;
    try { await page.waitForFunction(y => { const p = globalThis.__ATF_HUB__.player; return p.climbing && p.y + p.h < y - 14; }, s.player.y + s.player.h);
      climbing = await capture(`${id}-new-ladder-W-held`); climbingAt(climbing, 'ascending'); }
    finally { await page.keyboard.up('KeyW'); }
    await climbTo(ladder.top); await walkTo(ladder.x - 22 - 84, ladder.top, false);
    const upper = await capture(`${id}-new-ladder-upper-support`); assert.equal(upper.player.climbing, false); supportAt(upper);
    check(`${id}: the actual new ladder at800 still climbs to its unchanged native support.`, { ladder, climbing, upper });
  }
  report.routes.push({ id: 'moved-laboratory-and-sensor-access', status: 'passed' });
}
async function propsJourney() {
  const contracts = [['medical', 'adult-mattress-length', 118], ['mess', 'dining-worktop-height', 40],
    ['workshop', 'useful-worktop-height', 46], ['briefing', 'standing-planning-worktop-height', 52],
    ['bridge', 'useful-worktop-height', 38], ['combat-information', 'useful-worktop-height', 40],
    ['cryo-bay', 'lying-clear-interior', 110], ['quarantine', 'standing-clear-interior', 104],
    ['crew-quarters', 'lying-clear-interior', 110], ['science-lab', 'useful-worktop-height', 40],
    ['sensor-array', 'useful-worktop-height', 40], ['armory', 'measured-visible-height', 100],
    ['reactor', 'measured-visible-height', 112], ['life-support', 'measured-visible-height', 106]];
  for (const [id, criterion, target] of contracts) {
    await importParent(fixture(id, 100));
    await page.waitForFunction(id => { const p = globalThis.__ATF_HUB__.getSnapshot().hubPropPlacementV139?.current;
      return p?.roomId === id && p.painted && p.image?.width > 0; }, id);
    const placement = (await state()).presentation.hubPropPlacementV139.current;
    await walkTo(placement.inspectionX - 22);
    const s = await capture(`${id}-actual-native-prop-contact`), p = s.presentation.hubPropPlacementV139.current;
    assert.equal(p.roomId, id); assert.equal(p.painted, true); assert.equal(s.interaction, id);
    assert.equal(p.view, 'strict-side', 'All admitted main-room furniture belongs to complete frontal compartments.');
    assert.deepEqual(p.target, p.renderBounds); assert.equal(p.image.asset, p.asset);
    assert.ok(p.source.x >= 0 && p.source.y >= 0 && p.source.x + p.source.w <= p.image.width && p.source.y + p.source.h <= p.image.height);
    const scale = p.target.w / p.source.w;
    assert.ok(Math.abs(scale - p.target.h / p.source.h) < 1e-8);
    assert.ok(Math.abs(scale - p.sizing.scale) < 1e-8);
    assert.ok(Math.abs(p.target.y + p.opaqueFoot.sourceY * scale - p.opaqueFoot.y) < 1e-8);
    assert.equal(p.opaqueFoot.y, p.supportPlanes.rearServiceY);
    assert.equal(p.supportPlanes.rearServiceY, p.supportPlanes.authoredPresentationMode === '2.5d' ? 600 : 624);
    assert.equal(p.sizing.criterion, criterion);
    if (criterion !== 'measured-visible-height') assert.equal(p.sizing.target, target);
    if (id === 'medical') assert.ok(Math.abs(p.usefulSurface.bounds.w - 118) < 1e-8);
    else if (['dining-worktop-height', 'standing-planning-worktop-height', 'useful-worktop-height'].includes(criterion)) assert.ok(Math.abs(p.tableHeight - target) < 1e-8);
    else if (criterion === 'lying-clear-interior') assert.ok(Math.abs(p.interiorBounds.w - target) < 1e-8);
    else if (criterion === 'standing-clear-interior') assert.ok(Math.abs(p.interiorBounds.h - target) < 1e-8);
    else assert.ok(Math.abs(p.target.h - target) < 1e-8);
    if (p.cellId) assert.ok(!p.cellId.endsWith('-oblique'), 'Unreviewed oblique candidate pixels must never be claimed as admitted art.');
    const pixels = await page.evaluate(({ asset, source }) => {
        const image = globalThis.__ATF_HUB__.propImages.get(asset), canvas = document.createElement('canvas');
        canvas.width = source.w; canvas.height = source.h;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(image, source.x, source.y, source.w, source.h, 0, 0, source.w, source.h);
        const rgba = context.getImageData(0, 0, source.w, source.h).data; let last = -1, count = 0;
        for (let y = 0; y < source.h; y++) for (let x = 0; x < source.w; x++) if (rgba[(y * source.w + x) * 4 + 3] >= 192) { last = Math.max(last, y); count++; }
        return { alphaThreshold: 192, opaquePixelCount: count, contactBottom: last + 1, imageWidth: image.naturalWidth, imageHeight: image.naturalHeight };
    }, { asset: p.image.asset, source: p.source });
    assert.ok(pixels.opaquePixelCount > 0); assert.equal(pixels.contactBottom, p.opaqueFoot.sourceY);
    assert.ok(Math.abs(p.target.y + pixels.contactBottom * scale - p.supportPlanes.rearServiceY) < 1e-8);
    const details = inspectWorkstationDetails(s); safe(s); shadowAt(s, true);
    check(`${id}: the actually loaded native image keeps one scale, a measured contact foot and its adult capacity or useful worktop height.`, { state: s, pixels, details });
  }
  report.routes.push({ id: 'native-prop-feet-useful-surfaces-and-capacity', status: 'passed' });
}
function inspectWorkstationDetails(s) {
  const details = s.presentation.hubRoomLifeV136?.current?.workstationDetailsV139;
  assert.ok(details?.plan); assert.deepEqual(details.pending, []);
  assert.equal(details.plan.interactive, false); assert.equal(details.plan.collidable, false);
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  for (const item of details.painted) {
    const surface = details.surfaces.find(surface => surface.id === item.surfaceId);
    assert.ok(surface); assert.notEqual(surface.kind, 'mattress');
    assert.equal(item.interactive, false); assert.equal(item.collidable, false);
    assert.ok(Math.abs(item.scaleX - item.scaleY) < 1e-8);
    assert.ok(Math.abs(item.target.w / item.source.w - item.scaleX) < 1e-8);
    assert.ok(Math.abs(item.target.h / item.source.h - item.scaleY) < 1e-8);
    assert.ok(Math.abs(item.target.y + item.sourceFootY * item.scaleY - item.contactY) < 1e-8);
    assert.ok(Math.abs(item.contactY - item.supportY) < 1e-8); assert.equal(item.supportY, surface.supportY);
    assert.ok(item.target.x >= surface.bounds.x - .01 && item.target.x + item.target.w <= surface.bounds.x + surface.bounds.w + .01);
    assert.ok(!(surface.occupied || []).some(bounds => overlap(item.target, bounds)));
  }
  for (const item of details.plan.items) assert.ok(details.painted.some(painted => painted.role === item.role), `Declared detail ${item.role} must be actually painted.`);
  for (const omitted of details.omitted) assert.ok(omitted.reason);
  return details;
}
async function projectionJourney() {
  const connection = HUB_SHIP_CONNECTIONS_V137.find(c => c.id === 'maintenance-spine:primary'); assert.ok(connection);
  await reachParent(connection); const s = await state(), ladder = s.ladders.find(l => l.x === 820); assert.ok(ladder);
  await walkTo(ladder.x + ladder.w / 2 - 22); await climbTo(ladder.top); await walkTo(1120, ladder.top, false);
  const before = await capture('maintenance-authored-depth-support'), support = supportAt(before);
  assert.equal(support.planes.authoredPresentationMode, '2.5d'); assert.equal(before.depthEnabled, true);
  const geometry = s => ({ platforms: s.platforms, ladders: s.ladders,
    player: { x: s.player.x, y: s.player.y, w: s.player.w, h: s.player.h, grounded: s.player.grounded },
    prop: s.presentation.hubAnnexNativePlacementV139 && {
      source: s.presentation.hubAnnexNativePlacementV139.source, target: s.presentation.hubAnnexNativePlacementV139.target,
      stationBounds: s.presentation.hubAnnexNativePlacementV139.stationBounds,
      layout: s.presentation.hubAnnexNativePlacementV139.layout } });
  await page.keyboard.press('F7'); await page.waitForFunction(() => globalThis.__ATF_HUB__.depthPresentationV116 === false);
  const flat = await capture('maintenance-F7-ambience-disabled'), flatSupport = supportAt(flat);
  assert.equal(flat.presentation.roomPresentationV119.presentationMode, '2.5d');
  assert.deepEqual(flatSupport.plan, support.plan); assert.deepEqual(flatSupport.planes, support.planes);
  assert.deepEqual(geometry(flat), geometry(before));
  const beforeParallax = before.presentation.hubRoomParallaxV134.current;
  assert.equal(new Set(beforeParallax.layers.map(layer => layer.factor)).size, 3);
  for (const layer of beforeParallax.layers) assert.ok(layer.factor > 0);
  for (const layer of flat.presentation.hubRoomParallaxV134.current.layers) { assert.equal(layer.factor, 0); assert.equal(layer.drift, 0); }
  await page.keyboard.press('F7'); await page.waitForFunction(() => globalThis.__ATF_HUB__.depthPresentationV116 === true);
  const restored = await capture('maintenance-F7-depth-restored');
  assert.equal(restored.presentation.roomPresentationV119.presentationMode, '2.5d');
  assert.deepEqual(geometry(restored), geometry(before)); assert.deepEqual(supportAt(restored).plan, support.plan);
  const restoredParallax = restored.presentation.hubRoomParallaxV134.current;
  for (const [index, layer] of restoredParallax.layers.entries()) {
    assert.equal(layer.factor, beforeParallax.layers[index].factor);
    const expectedDrift = Math.max(-layer.maximumDrift, Math.min(layer.maximumDrift, restoredParallax.localEye * layer.factor));
    assert.ok(Math.abs(layer.drift - expectedDrift) < 1e-8, 'Restored parallax must use the real current camera, including native camera easing.');
  }
  inspectWorkstationDetails(before); inspectWorkstationDetails(flat); inspectWorkstationDetails(restored);
  check('F7 disables camera parallax while preserving the complete maintenance projection, native supports, station target, ladders and standing actor.', { before, flat, restored, support, flatSupport });
  report.routes.push({ id: 'native-maintenance-F7-authored-support-stability', status: 'passed' });
}
async function annexFixtureJourney() {
  for (const id of ['morgue', 'mire-archives', 'bioforge']) {
    const annex = HUB_ANNEXES_V137.find(a => a.id === id); assert.ok(annex);
    await importParent(fixture(annex.parentRoomId, 100));
    const door = await page.evaluate(id => ({ ...globalThis.__ATF_HUB__.getParentAnnexDoorV71(id).bounds }), id);
    await walkTo(door.x + door.w / 2 - 22); await page.keyboard.press('KeyE');
    await page.waitForFunction(id => globalThis.__ATF_HUB__.currentAnnexV71?.()?.id === id && !globalThis.__ATF_HUB__.annexTransitionV71, id);
    await walkTo(300);
    await page.waitForFunction(id => { const frame = globalThis.__ATF_HUB__.getSnapshot().hubRoomLifeV136?.nativeFixtures.find(r => r.roomId === id);
      return frame?.mounts?.length === 2 && frame.missing.length === 0; }, id);
    const storage = await capture(`${id}-actual-native-storage`), fixtures = storage.presentation.hubRoomLifeV136.nativeFixtures.find(r => r.roomId === id);
    assert.equal(fixtures.mounts.length, 2); assert.deepEqual(fixtures.missing, []);
    for (const mount of fixtures.mounts) {
      assert.ok(fixtures.painted.some(item => item.id === mount.id && item.source && item.target.w > 0));
      assert.equal(mount.supportY, 624); assert.equal(mount.collidable, false); assert.equal(mount.interactive, false);
    }
    const station = await page.evaluate(() => structuredClone(globalThis.__ATF_HUB__.currentAnnexV71().station.bounds));
    await walkTo(station.x + station.w + 8);
    const reached = await capture(`${id}-station-reached`); assert.equal(reached.station, id); safe(reached);
    const exitX = annex.entranceLocalX + (annex.entranceSide === 'west' ? annex.entrance.w / 2 + 16 : -annex.entrance.w / 2 - 60);
    await walkTo(exitX); await page.keyboard.press('KeyE');
    await page.waitForFunction(() => !globalThis.__ATF_HUB__.currentAnnexV71?.() && !globalThis.__ATF_HUB__.annexTransitionV71);
    const returned = await state(); assert.equal(returned.room, annex.parentRoomId); safe(returned);
    check(`${id}: actual loaded storage contents preserve both physical cargo frames, the station approach and the native return.`, { storage, reached, returned });
  }
  report.routes.push({ id: 'native-task-specific-annex-storage-and-returns', status: 'passed' });
}
async function main() {
  await fs.mkdir(output, { recursive: true }); const before = await sourceManifest(); report.sourceFiles = Object.keys(before).length; report.sourceSignatureAtStart = hash(JSON.stringify(before));
  report.method = 'Native V139 perspective/contact journeys. Idle Save-picker checkpoints, W held then released, actual moving D and native door entries. PNG and snapshot are synchronously read from the real canvas/state; no renderer replacement, actor injection or paused engine.';
  const module = await playwright(), { chromium } = module.chromium ? module : module.default;
  browser = await chromium.launch({ headless: true, executablePath: process.env.ATF_CHROMIUM_EXECUTABLE || '/usr/bin/chromium' });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, serviceWorkers: 'block' }); page = await context.newPage(); page.setDefaultTimeout(30000);
  page.on('pageerror', error => report.pageErrors.push(error.message)); page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
  await page.goto(base, { waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click(); await page.locator('#title-options').click();
  for (const [id, journey] of [['parents', parentLaddersJourney], ['engine', engineLadderJourney], ['moved', movedLaddersJourney], ['props', propsJourney], ['annexes', annexFixtureJourney], ['projection', projectionJourney]]) if (scope === 'all' || scope === id) await journey();
  assert.ok(report.routes.length > 0); const after = await sourceManifest(); report.sourceSignatureAtEnd = hash(JSON.stringify(after)); report.sourceChangedFiles = Object.keys(after).filter(path => before[path] !== after[path]);
  assert.deepEqual(report.sourceChangedFiles, []); assert.equal(report.sourceSignatureAtStart, report.sourceSignatureAtEnd); assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.requestFailures, []);
  check('All production/presentation source files and the actual old/new furnishing image sources stay frozen throughout the recipe.', { files: report.sourceFiles, signature: report.sourceSignatureAtEnd }); report.status = 'passed';
}
await main().catch(async error => { report.status = 'failed'; report.error = { message: error.message, stack: error.stack }; process.exitCode = 1;
  if (page) { report.lastObservedState = await state().catch(() => null); await page.locator('#hub-canvas').screenshot({ path: join(output, 'failure-context.png') }).catch(() => {}); }
}).finally(async () => { report.finishedAt = new Date().toISOString(); await fs.mkdir(output, { recursive: true }); await fs.writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2)); await browser?.close();
  console.log(JSON.stringify({ status: report.status, pass, checks: report.checks.length, captures: report.captures.length, report: join(output, 'report.json'), error: report.error?.message })); });
