import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDefaultSave } from '../src/save.js';
import { HUB_DECKS } from '../src/hub-game.js';
import { HUB_ANNEX_BY_ID_V71, createHubCommercialStateV71 } from '../src/tantalus-hub-expansion-v71.js';

// Idle clock cohorts enter through the actual Save file picker. There are no
// actor, clock, velocity, animation-controller or reward writes in the browser.
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(process.env.ATF_NPC_LIFE_QA_OUTPUT || join(tmpdir(), `atf-npc-life-v136-${Date.now()}`));
const rel = relative(root, output);
if (!rel || !rel.startsWith('..') && !isAbsolute(rel)) throw Error('QA evidence must remain outside the checkout.');
const report = { status: 'running', startedAt: new Date().toISOString(), checks: [], captures: [], pageErrors: [], requestFailures: [],
  method: 'Two disclosed idle clock cohorts imported with the Save picker. Real walking and dialogue controls; read-only runtime observations.',
  limitations: ['The work schedule is observed for 21 seconds; long complete station-return trips and blocked paths also have deterministic physics tests.',
    'Four-cell native walking art is retained. No new motion capture or additional drawn frames are claimed.'] };
let browser, page;
async function playwright() {
  try { return await import('playwright'); } catch (error) {
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__npc_life_qa__.cjs'))('playwright');
    throw error;
  }
}
const observe = () => page.evaluate(() => {
  const h = globalThis.__ATF_HUB__;
  return h && { running: h.running, time: h.animationTime, deck: h.state.deck,
    room: h.currentRoom()?.id, player: { x: h.player.x, y: h.player.y, health: h.player.health, shockHits: h.player.shockHits },
    npcs: h.npcs.map(n => ({ id: n.crewId, x: n.x, y: n.y, vx: n.vx, facing: n.facing,
      sheet: n.v52Animation?.sheetId, clip: n.v52Animation?.clipId, frame: n.v52Animation?.frame,
      life: n.lifeV136 ? structuredClone(n.lifeV136) : null, human: n.humanVisualV133 ? structuredClone(n.humanVisualV133) : null })) };
});
async function capture(name) {
  await page.locator('#hub-canvas').screenshot({ path: join(output, name + '.png') });
  report.captures.push({ name, state: await observe() });
}
function fixture(hour) {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'hub'; save.clock.hour = hour;
  Object.assign(save.hub, { deck: 0, roomId: 'bridge', positionX: 450, positionY: 532 });
  return save;
}
async function importCohort(hour, annexId = null) {
  if (await page.locator('#hub-dialogue-cancel').isVisible()) await page.locator('#hub-dialogue-cancel').click();
  if (await page.locator('#exit-hub').isVisible()) await page.locator('#exit-hub').click();
  await page.locator('[data-view="settings"]').click();
  const idle = fixture(hour);
  if (annexId) {
    const annex = HUB_ANNEX_BY_ID_V71[annexId], deck = HUB_DECKS.findIndex(entry => entry.id === annex.parentDeck);
    const room = HUB_DECKS[deck].rooms.find(entry => entry.id === annex.parentRoomId), commercial = createHubCommercialStateV71();
    Object.assign(commercial, { activeAnnexId: annexId, lastAnnexId: annexId,
      annexPositionX: annex.station.bounds.x + annex.station.bounds.w + 8, annexPositionY: 532, annexClimbing: false,
      returnContext: { deckId: annex.parentDeck, roomId: room.id, x: room.xStart + 180, facing: 1 } });
    commercial.annexes[annexId].visited = true; commercial.visitedAnnexIds.push(annexId);
    Object.assign(idle.hub, { deck, roomId: room.id, positionX: room.xStart + 180, commercialV71: commercial });
  }
  await page.locator('#save-import').setInputFiles({ name: `npc-idle-${hour}.json`, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(idle)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).last().waitFor();
  await page.locator('[data-view="hub"]').click();
  await page.waitForFunction(() => globalThis.__ATF_HUB__?.running && globalThis.__ATF_HUB__.npcs.some(n => n.lifeV136));
  await page.locator('#hub-canvas').focus();
  return observe();
}
async function observations(seconds, name) {
  const values = [], start = Date.now();
  while (Date.now() - start < seconds * 1000) { values.push(await observe()); await page.waitForTimeout(100); }
  report[name] = values; return values;
}
async function walkTo(x) {
  const before = await observe(), right = x > before.player.x, code = right ? 'KeyD' : 'KeyA';
  await page.keyboard.down(code);
  try { await page.waitForFunction(t => { const p = globalThis.__ATF_HUB__.player; return t.right ? p.x >= t.x - 4 : p.x <= t.x + 4; }, { x, right }, { timeout: 12000, polling: 'raf' }); }
  finally { await page.keyboard.up(code); }
  await page.waitForTimeout(180);
}
async function main() {
  await fs.mkdir(output, { recursive: true });
  const module = await playwright(), { chromium } = module.chromium ? module : module.default;
  browser = await chromium.launch({ headless: true, executablePath: process.env.ATF_CHROMIUM_EXECUTABLE || '/usr/bin/chromium' });
  page = await (await browser.newContext({ viewport: { width: 1600, height: 1000 }, serviceWorkers: 'block' })).newPage();
  page.setDefaultTimeout(30000);
  page.on('pageerror', e => report.pageErrors.push(e.message));
  page.on('requestfailed', r => report.requestFailures.push({ url: r.url(), error: r.failure()?.errorText }));
  await page.goto(process.env.ATF_BASE_URL || 'http://127.0.0.1:4173', { waitUntil: 'domcontentloaded' });
  await page.locator('#title-start').click(); await page.locator('#title-options').click();
  await importCohort(6.25); await capture('01-route-cohort');
  const routes = await observations(15, 'routeSamples');
  const moving = routes.flatMap(s => s.npcs).filter(n => Math.abs(n.vx) > .1);
  assert.ok(moving.length > 10, 'The real route cohort must physically walk.');
  assert.ok(moving.every(n => Math.abs(n.vx) <= 27.001 && n.life.mode === 'moving'));
  for (let i = 1; i < routes.length; i++) for (const n of routes[i].npcs) {
    const old = routes[i - 1].npcs.find(v => v.id === n.id);
    if (!old) continue;
    assert.ok(Math.abs(n.x - old.x) <= 27.01 * (routes[i].time - routes[i - 1].time) + .02);
    if (Math.abs(n.x - old.x) < 1e-6 && Math.abs(n.vx) < .1) assert.equal(n.facing, old.facing);
  }
  report.checks.push('Native route cohort moves within speed/contact bounds and stationary crew keep their facing.');
  assert.ok(moving.some(n => n.human && Math.abs(n.human.pivot.y - (n.y + 92)) < .001));
  report.checks.push('Native rendered human soles retain their measured floor anchor and scale.');
  await importCohort(8); const work = await observations(21, 'workSamples'); await capture('02-work-cohort');
  const poses = work.flatMap(s => s.npcs);
  assert.ok(poses.some(n => n.life.passive?.clipId === 'role-work' && n.clip === 'role-work'));
  const schedules = new Map();
  for (const n of poses) { if (!schedules.has(n.id)) schedules.set(n.id, new Set()); schedules.get(n.id).add(`${n.clip}:${n.frame}`); }
  assert.ok([...schedules.values()].some(set => set.size >= 4));
  report.checks.push('Actual work cohort renders varied shipped work cells and long neutral poses.');
  for (const sample of work) {
    const visits = sample.npcs.filter(n => ['approach', 'work', 'return'].includes(n.life.tripPhase));
    for (let i = 0; i < visits.length; i++) for (let j = i + 1; j < visits.length; j++) {
      assert.ok(Math.abs(visits[i].life.workX - visits[j].life.workX) >= 58,
        'Two scheduled specialists cannot reserve the same standing position at a station.');
    }
  }
  report.checks.push('The real multi-person work cohort reserves separate station standing positions.');
  const bridgeNpc = work.at(-1).npcs.filter(n => n.x >= 100 && n.x < 1100).sort((a, b) => Math.abs(a.x - 450) - Math.abs(b.x - 450))[0];
  assert.ok(bridgeNpc); await walkTo(bridgeNpc.x);
  await page.keyboard.press('KeyE'); await page.locator('#hub-dialogue').waitFor({ state: 'visible' });
  const paused = await observe(); assert.equal(paused.running, false);
  await page.waitForTimeout(450); assert.deepEqual((await observe()).npcs, paused.npcs);
  report.checks.push('A real physical dialogue freezes both NPC position and animation schedule.');
  await page.locator('#hub-dialogue-cancel').click(); await page.waitForFunction(() => globalThis.__ATF_HUB__.running);
  await page.waitForTimeout(300); const resumed = await observe();
  assert.ok(resumed.npcs.some(n => n.life.time > paused.npcs.find(p => p.id === n.id).life.time));
  assert.equal(resumed.player.health, 100); assert.equal(resumed.player.shockHits, 0);
  await capture('03-dialogue-resumed');
  report.checks.push('Closing the dialogue resumes the same schedule without player damage or corridor blocking.');
  const cameraStart = await importCohort(6.25, 'cctv'), cameraFrames = await observations(5, 'cctvSamples');
  const cameraEnd = cameraFrames.at(-1), engineElapsed = cameraEnd.time - cameraStart.time;
  assert.ok(engineElapsed > 3);
  assert.ok(cameraEnd.npcs.some(n => Math.abs(n.x - cameraStart.npcs.find(p => p.id === n.id).x) > 20));
  for (const npc of cameraEnd.npcs) {
    const old = cameraStart.npcs.find(p => p.id === npc.id);
    assert.ok(Math.abs((npc.life.time - old.life.time) - engineElapsed) < .07,
      'The CCTV must observe one parent simulation tick, without freezing or ticking twice.');
  }
  await capture('04-live-cctv-cohort');
  report.checks.push('The CCTV observes one real parent-deck simulation tick while the operator remains in the annex.');
  assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.requestFailures, []); report.status = 'passed';
}
await main().catch(async error => {
  report.status = 'failed'; report.error = { message: error.message, stack: error.stack }; process.exitCode = 1;
  if (page) { report.last = await observe().catch(() => null); await page.screenshot({ path: join(output, 'failure.png'), fullPage: true }).catch(() => {}); }
}).finally(async () => {
  report.finishedAt = new Date().toISOString(); await fs.mkdir(output, { recursive: true });
  await fs.writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2)); await browser?.close();
  console.log(JSON.stringify({ status: report.status, checks: report.checks.length, error: report.error?.message, report: join(output, 'report.json') }));
});
