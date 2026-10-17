import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';
import { HUB_DECKS } from '../src/hub-game.js';
import { HUB_ANNEX_BY_ID_V137 } from '../src/hub-annex-registry-v137.js';
import { getHubDoorDestinationDescriptorsV138 } from '../src/hub-destination-signage-v138.js';
import { requestShipPortDockV87, stepShipPortV87, SHIP_PORT_DEFINITION_V87 } from '../src/ship-port-state-v87.js';

// Only disclosed idle parent checkpoints enter through the native Save picker.
// All doors, walking, ladders and dialogue use actual keyboard/UI controls.
// Production globals, actors, renderers and clocks are observed without writes.
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(process.env.ATF_ANNEX_POPULATION_QA_OUTPUT || join(tmpdir(), `atf-annex-population-v156-${Date.now()}`));
const rel = relative(root, output);
if (!rel || rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel)) throw Error('QA evidence must remain outside the checkout.');
const report = { status: 'running', startedAt: new Date().toISOString(),
  method: 'Three disclosed idle parent saves through the Save picker; native E passages/dialogues, A/D walking and W/S logistics catwalk. Read-only runtime observations and canvas pixels in the same browser task.',
  limitations: ['Automated native-control journeys, not human QA.', 'Three rare integration cases are covered; all eighteen scheduled annexes additionally have deterministic geometry/identity/schedule tests.',
    'Continuous human travel between annexes is not implemented; native routine context determines the current assignment.'],
  fixtures: [], checks: [], captures: [], pageErrors: [], requestFailures: [] };
const cases = [
  { roomId: 'personal-refuge', crewId: 'crew-12-asha-mbaye', name: 'Asha Mbaye', hour: 17.5, targetX: 960, feetY: 624 },
  { roomId: 'frontier-civil-counter', crewId: 'crew-09-inez-harlow', name: 'Inez Harlow', hour: 19.5, targetX: 725, feetY: 624 },
  { roomId: 'logistics', crewId: 'crew-16-cal-mercer', name: 'Cal Mercer', hour: 9.5, targetX: 1000, feetY: 468 }
];
let browser, page, serial = 0;
const hash = data => createHash('sha256').update(data).digest('hex');
async function playwright() {
  try { return await import('playwright'); } catch (error) {
    if (process.env.ATF_PLAYWRIGHT_MODULE) return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__annex_population__.cjs'))('playwright');
    throw Error('Existing Playwright installation required.', { cause: error });
  }
}
async function sourceManifest(label) {
  const sources = (await fs.readdir(join(root, 'src'), { recursive: true })).filter(path => path.endsWith('.js')).map(path => `src/${path}`);
  const assets = (await fs.readdir(join(root, 'assets'), { recursive: true, withFileTypes: true }))
    .filter(entry => entry.isFile()).map(entry => relative(root, join(entry.parentPath, entry.name)));
  const styles = (await fs.readdir(root)).filter(path => path.endsWith('.css'));
  const files = [...new Set([...sources, ...assets, ...styles, 'index.html', 'sw.js', 'package.json', 'package-lock.json', 'manifest.webmanifest'])].sort();
  const manifest = {};
  for (const file of files) manifest[file] = hash(await fs.readFile(join(root, file)));
  await fs.writeFile(join(output, `source-manifest-${label}.json`), JSON.stringify(manifest, null, 2));
  return manifest;
}
function observe(withFrame = false) {
  const h = globalThis.__ATF_HUB__;
  if (!h?.player) return null;
  const snap = h.getSnapshot(), annex = h.currentAnnexV71?.();
  const routine = h.npcRoutineResolutionsV62?.values().next().value;
  const npcs = annex ? h.activeAnnexNpcsV141() : [];
  const state = { running: h.running, time: h.animationTime, deck: h.state.deck, roomId: h.currentRoom()?.id, annexId: annex?.id || null,
    clock: h.npcRoutineContextV62?.clock || (routine ? { day: routine.day, hour: routine.hour } : null), prompt: h.statusPrompt(), camera: { ...(annex ? h.annexCameraV71 : h.camera) },
    transition: h.annexTransitionV71 ? structuredClone(h.annexTransitionV71) : null,
    closing: h.hubDoorClosingV142 ? structuredClone(h.hubDoorClosingV142) : null,
    player: Object.fromEntries(['x', 'y', 'w', 'h', 'vx', 'vy', 'grounded', 'climbing', 'health', 'shockHits', 'facing'].map(key => [key, h.player[key]])),
    keys: [...h.keys], npcs: npcs.map(n => ({ crewId: n.crewId, name: n.name, roomId: n.roomId, duty: n.annexDutyV141,
      x: n.x, y: n.y, w: n.w, h: n.h, min: n.min, max: n.max, mobile: n.mobile, vx: n.vx, facing: n.facing,
      supportId: n.annexSupportIdV156, time: n.lifeV136?.time || 0, animation: n.v52Animation || null,
      human: n.humanVisualV133 ? structuredClone(n.humanVisualV133) : null,
      image: (() => { const image = h.npcImagesBySheetId?.get(n.spriteId); return image && { complete: image.complete, width: image.naturalWidth, height: image.naturalHeight, src: image.src }; })() })),
    interactionLedger: structuredClone(h.hubNpcInteractions),
    dialogue: { visible: !document.querySelector('#hub-dialogue')?.hidden, speaker: document.querySelector('#hub-dialogue-speaker')?.textContent },
    station: h.nearestAnnexStationV71?.()?.id || null, nearestNpc: h.nearestAnnexNpcV141?.()?.crewId || null,
    exit: h.nearestAnnexExitV71?.()?.id || null,
    ladders: annex?.ladders || [], platforms: annex?.platforms || [],
    activeAssetsReady: snap.activeAnnexAssetsReadyV71 ?? null };
  if (withFrame) { const canvas = document.querySelector('#hub-canvas'); state.framePng = canvas.toDataURL('image/png'); }
  return state;
}
const state = () => page.evaluate(observe);
async function capture(label) {
  const s = await page.evaluate(observe, true), bytes = Buffer.from(s.framePng.split(',')[1], 'base64'); delete s.framePng;
  const file = `${String(++serial).padStart(2, '0')}-${label}.png`; await fs.writeFile(join(output, file), bytes);
  report.captures.push({ label, file, sha256: hash(bytes), method: 'synchronous-native-canvas-and-state-read', state: s }); return s;
}
function safe(s, feetY = null) {
  assert.equal(s.player.health, 100); assert.equal(s.player.shockHits, 0);
  if (feetY !== null) assert.ok(Math.abs(s.player.y + s.player.h - feetY) < .2, `Actual player feet do not meet ${feetY}.`);
}
async function openView(view) {
  const toggle = page.locator('#menu-toggle');
  if (await toggle.isVisible() && !(await page.locator('.rail').getAttribute('class')).split(/\s+/).includes('open')) await toggle.click();
  await page.locator(`[data-view="${view}"]`).click();
}
function fixture(testCase) {
  const annex = HUB_ANNEX_BY_ID_V137[testCase.roomId], deck = HUB_DECKS.findIndex(d => d.id === annex.parentDeck);
  const room = HUB_DECKS[deck].rooms.find(r => r.id === annex.parentRoomId);
  const door = getHubDoorDestinationDescriptorsV138(room).find(entry => entry.face === 'parent' && entry.destinationId === testCase.roomId).socket;
  let save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'hub'; save.clock.hour = testCase.hour;
  Object.assign(save.hub, { deck, roomId: room.id, positionX: Math.max(room.xStart + 24, door.x + door.w / 2 - 102), positionY: 532 });
  if (testCase.roomId === 'frontier-civil-counter') {
    const scope = SHIP_PORT_DEFINITION_V87, campaignHours = (save.clock.day - 1) * 24 + save.clock.hour;
    const context = { careReady: true, manifestReady: true, physical: { roomId: 'dropship-hangar' },
      authorization: { granted: true, portId: scope.id, sectorId: scope.sectorId, campaignHours } };
    const docked = requestShipPortDockV87(save, { transactionId: 'annex-population-fixture-v156', portId: scope.id }, context);
    assert.equal(docked.ok, true, docked.code); save = docked.save;
    for (let time = 1; time <= 14; time++) { const advanced = stepShipPortV87(save, { dtSeconds: 1, simulationTime: time }, context); assert.equal(advanced.ok, true); save = advanced.save; }
    assert.equal(save.shipPortV1.phase, 'docked');
    assert.equal(save.shipPortV1.authorization.campaignHours, campaignHours);
  }
  return save;
}
async function importParent(testCase) {
  if (await page.locator('#hub-dialogue-cancel').isVisible()) await page.locator('#hub-dialogue-cancel').click();
  if (await page.locator('#exit-hub').isVisible()) await page.locator('#exit-hub').click();
  await openView('settings'); const save = fixture(testCase), bytes = Buffer.from(JSON.stringify(save));
  const file = `${testCase.roomId}-${testCase.hour}-idle-parent.json`; await fs.writeFile(join(output, file), bytes);
  report.fixtures.push({ file, sha256: hash(bytes), roomId: save.hub.roomId, positionX: save.hub.positionX, clock: save.clock,
    provenance: testCase.roomId === 'frontier-civil-counter' ? 'disclosed-idle-parent-and-native-pure-port-docking' : 'disclosed-idle-parent' });
  await page.locator('#save-import').setInputFiles({ name: file, mimeType: 'application/json', buffer: bytes });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).last().waitFor(); await openView('hub');
  await page.waitForFunction(() => { const h = globalThis.__ATF_HUB__; return h?.running && !h.currentAnnexV71?.() && h.player?.playerAppearanceVisualV126?.drawn; });
  await page.locator('#hub-canvas').focus(); const s = await state(); safe(s, 624); assert.equal(s.annexId, null);
  assert.equal(s.clock.hour, testCase.hour); return s;
}
// Software-rendered headless runs can advance the clamped engine clock much
// slower than wall time. Budget wall waits from travel distance with sixfold
// headroom and 15s settling margin, retaining the exact physical arrival gates.
const travelTimeout = (distance, speed = 100) => Math.max(30000, Math.ceil(Math.abs(distance) / speed * 1000 * 6 + 15000));
async function walkTo(x, feetY = 624) {
  let s = await state(); if (Math.abs(s.player.x - x) < 4) return s;
  const right = x > s.player.x, key = right ? 'KeyD' : 'KeyA'; await page.keyboard.down(key);
  try { await page.waitForFunction(t => { const p = globalThis.__ATF_HUB__?.player; return p && (t.right ? p.x >= t.x - 3 : p.x <= t.x + 3); },
    { x, right }, { polling: 'raf', timeout: travelTimeout(s.player.x - x) }); }
  finally { await page.keyboard.up(key); }
  await page.waitForTimeout(180); s = await state(); safe(s, feetY); assert.ok(Math.abs(s.player.x - x) < 40); return s;
}
async function walkToCivilConversation() {
  // Release D at the actual interaction gate, before PNG/JSON transfer. This
  // narrow service bay must be reached by keys rather than assigning player x.
  const before = await state(), targetX = 725;
  await page.keyboard.down('KeyD');
  try { await page.waitForFunction(() => {
    const h = globalThis.__ATF_HUB__;
    return h?.prioritizedCivilAnnexNpcV156?.()?.crewId === 'crew-09-inez-harlow';
  }, null, { polling: 'raf', timeout: travelTimeout(targetX - before.player.x) }); }
  finally { await page.keyboard.up('KeyD'); }
  // Normal deceleration can carry a short approach beyond a prompt boundary.
  // E owns the interaction immediately after actual key release.
  await page.keyboard.press('KeyE');
}
async function climbTo(feetY, up) {
  const before = await state();
  const key = up ? 'KeyW' : 'KeyS'; await page.keyboard.down(key);
  try { await page.waitForFunction(target => { const p = globalThis.__ATF_HUB__?.player;
    return p?.grounded && !p.climbing && Math.abs(p.y + p.h - target) < .1 && Math.abs(p.vy) < .02;
  }, feetY, { polling: 'raf', timeout: travelTimeout(feetY - before.player.y - before.player.h, 205) }); }
  finally { await page.keyboard.up(key); }
  const s = await state(); safe(s, feetY); return s;
}
async function readyAnnex(testCase) {
  await page.waitForFunction(({ roomId, crewId }) => {
    const h = globalThis.__ATF_HUB__, npc = h?.activeAnnexNpcsV141?.().find(n => n.crewId === crewId);
    const image = npc && h.npcImagesBySheetId?.get(npc.spriteId);
    return h?.running && h.currentAnnexV71?.()?.id === roomId && !h.annexTransitionV71 && !h.hubDoorClosingV142
      && h.getSnapshot().activeAnnexAssetsReadyV71 && npc?.humanVisualV133 && image?.complete && image.naturalWidth > 0;
  }, testCase, { timeout: 20000 });
}
async function passDoor(testCase, direction) {
  const bounds = await page.evaluate(({ roomId, direction }) => {
    const h = globalThis.__ATF_HUB__;
    return direction === 'enter' ? { ...h.getParentAnnexDoorV71(roomId).bounds } : { ...h.annexExitDoorV71().bounds };
  }, { roomId: testCase.roomId, direction });
  const feetY = bounds.y + bounds.h; await walkTo(bounds.x + bounds.w / 2 - 22, feetY);
  await page.keyboard.press('KeyE');
  if (direction === 'enter') await readyAnnex(testCase);
  else await page.waitForFunction(() => { const h = globalThis.__ATF_HUB__; return h?.running && !h.currentAnnexV71?.() && !h.annexTransitionV71 && !h.hubDoorClosingV142; }, null, { timeout: 15000 });
  return state();
}
async function verifyDialogue(testCase, entered = false) {
  if (!entered) await page.keyboard.press('KeyE');
  await page.locator('#hub-dialogue').waitFor({ state: 'visible' });
  assert.ok((await page.locator('#hub-dialogue-speaker').innerText()).includes(testCase.name));
  const paused = await capture(`${testCase.roomId}-dialogue`); assert.equal(paused.running, false);
  const before = paused.npcs.find(n => n.crewId === testCase.crewId); assert.ok(before);
  await page.waitForTimeout(350);
  const frozen = (await state()).npcs.find(n => n.crewId === testCase.crewId);
  assert.deepEqual({ x: frozen.x, y: frozen.y, time: frozen.time, animation: frozen.animation },
    { x: before.x, y: before.y, time: before.time, animation: before.animation });
  const file = `${testCase.roomId}-dialogue-ui.png`; await page.screenshot({ path: join(output, file), fullPage: true });
  report.captures.push({ label: `${testCase.roomId}-dialogue-ui`, file, method: 'native-visible-dialogue-ui', speaker: paused.dialogue.speaker });
  await page.locator('#hub-dialogue-cancel').click();
  await page.waitForFunction(() => globalThis.__ATF_HUB__?.running);
  await page.locator('#hub-canvas').focus(); await page.waitForTimeout(180);
  const resumed = await state(); safe(resumed, testCase.feetY);
  assert.ok(resumed.npcs.find(n => n.crewId === testCase.crewId).time > frozen.time);
  assert.equal(resumed.interactionLedger[testCase.crewId].lastRoomId, testCase.roomId);
  report.checks.push({ label: `${testCase.roomId}: real E opens the named existing dialogue, freezes its actor and resumes the same native schedule.`,
    evidence: { speaker: paused.dialogue.speaker, pausedTime: before.time, resumedTime: resumed.npcs.find(n => n.crewId === testCase.crewId).time,
      interaction: resumed.interactionLedger[testCase.crewId] } });
}
async function main() {
  await fs.mkdir(output, { recursive: true }); const before = await sourceManifest('start');
  report.scriptSha256 = hash(await fs.readFile(fileURLToPath(import.meta.url)));
  const module = await playwright(), { chromium } = module.chromium ? module : module.default;
  browser = await chromium.launch({ headless: true, executablePath: process.env.ATF_CHROMIUM_EXECUTABLE || '/usr/bin/chromium' });
  page = await (await browser.newContext({ viewport: { width: 1600, height: 1000 }, serviceWorkers: 'block' })).newPage(); page.setDefaultTimeout(30000);
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
  await page.goto(process.env.ATF_BASE_URL || 'http://127.0.0.1:4173', { waitUntil: 'domcontentloaded' });
  await page.locator('#title-start').click(); await page.locator('#title-options').click();
  for (const testCase of cases) {
    const parent = await importParent(testCase); await passDoor(testCase, 'enter');
    const entry = await capture(`${testCase.roomId}-native-entry`); safe(entry, 624);
    const actor = entry.npcs.find(n => n.crewId === testCase.crewId);
    assert.equal(actor.roomId, testCase.roomId); assert.ok(actor.human && actor.image.complete);
    assert.equal(actor.human.standingHeight, 96.5); assert.ok(Math.abs(actor.human.pivot.y - testCase.feetY) < .001);
    assert.equal(actor.image.width, actor.human.sourceWidth); assert.equal(actor.image.height, actor.human.sourceHeight);
    report.checks.push({ label: `${testCase.roomId}: native doorway reaches a visibly rendered existing crew member on its actual support.`, evidence: { actor } });
    if (testCase.roomId === 'logistics') {
      const ladder = entry.ladders.find(l => l.top === 468 && l.bottom === 624); assert.ok(ladder);
      await walkTo(ladder.x + ladder.w / 2 - 22); await climbTo(468, true);
      await walkTo(testCase.targetX, 468); await capture('logistics-real-catwalk-approach');
    } else if (testCase.roomId === 'frontier-civil-counter') {
      await walkTo(650); await walkToCivilConversation();
    } else { await walkTo(testCase.targetX); await capture('personal-refuge-visible-visitor'); }
    await verifyDialogue(testCase, testCase.roomId === 'frontier-civil-counter');
    if (testCase.roomId === 'logistics') {
      const current = await state(), ladder = current.ladders.find(l => l.top === 468 && l.bottom === 624);
      await walkTo(ladder.x + ladder.w / 2 - 22, 468); await climbTo(624, false);
    }
    const returned = await passDoor(testCase, 'exit'); assert.equal(returned.roomId, parent.roomId); safe(returned, 624);
    await capture(`${testCase.roomId}-returned-parent`); await passDoor(testCase, 'enter');
    const reentered = await capture(`${testCase.roomId}-door-reentered`); safe(reentered, 624);
    report.checks.push({ label: `${testCase.roomId}: actual return and re-entry doors remain usable with the scheduled crew present.`, evidence: { returnedRoom: returned.roomId, reenteredAnnex: reentered.annexId } });
  }
  const after = await sourceManifest('end'); assert.deepEqual(after, before);
  assert.equal(hash(await fs.readFile(fileURLToPath(import.meta.url))), report.scriptSha256);
  report.sourceMapsEqual = true; report.sourceFiles = Object.keys(before).length;
  assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.requestFailures, []);
  report.checks.push({ label: 'Source, original assets and QA recipe are unchanged across all three native journeys; no browser errors.' }); report.status = 'passed';
}
await main().catch(async error => {
  report.status = 'failed'; report.error = { message: error.message, stack: error.stack }; process.exitCode = 1;
  if (page) { report.lastObservedState = await state().catch(() => null); await page.screenshot({ path: join(output, 'failure.png'), fullPage: true }).catch(() => {}); }
}).finally(async () => {
  report.finishedAt = new Date().toISOString(); await fs.mkdir(output, { recursive: true });
  await fs.writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2)); await browser?.close();
  console.log(JSON.stringify({ status: report.status, checks: report.checks.length, captures: report.captures.length, error: report.error?.message, report: join(output, 'report.json') }));
});
