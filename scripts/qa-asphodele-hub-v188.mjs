// V188 spec 007 — Chromium QA of the Asphodèle second hub, walked with real keys.
// Fixtures (declared): profiles built from createDefaultSave(), imported through
// the Options screen (#save-import), with these injected fields only:
//   galaxy.completedCampaignIds += special-archive-relay, station-s1..s4 (+ side missions in fixture B),
//   stationV188 = { introHeard, cassius: 'rewrite', scenesSeen: s1/s3/s4 },
//   storyCampaignV188.cinematicsSeen = every CINEMATIC_IDS_V188 entry (no auto-play),
//   worldId / galaxy.shipWorldIdV116 = world-05-lethe, hub pose in the hangar or the cryo bay,
//   fixture B: asphodeleHubV188.contracts['relay-drift'] = 3.
// Usage: PORT=4592 node scripts/dev.mjs & ; node scripts/qa-asphodele-hub-v188.mjs <out-dir>
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { createDefaultSave } from '../src/save.js';
import { CINEMATIC_IDS_V188 } from '../src/story-cinematics-v188.js';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4592/';
const out = process.argv[2] || 'qa-asphodele';
await mkdir(out, { recursive: true });
const report = { checks: [], pageErrors: [], measurements: {}, shots: [] };
const check = (label, condition, evidence = null) => { report.checks.push({ label, passed: Boolean(condition), evidence }); console.log(JSON.stringify({ check: label, passed: Boolean(condition) })); };

function fixture({ deck = 3, roomId = 'dropship-hangar', positionX = 470, extraDone = [], contracts = {}, hub = {} } = {}) {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'hub';
  save.worldId = 'world-05-lethe'; save.galaxy.shipWorldIdV116 = 'world-05-lethe';
  save.galaxy.completedCampaignIds = [...new Set([...save.galaxy.completedCampaignIds, 'special-archive-relay', 'station-s1', 'station-s2', 'station-s3', 'station-s4', ...extraDone])];
  save.stationV188 = { schema: 188, introHeard: true, cassius: 'rewrite', scenesSeen: ['s1', 's3', 's4'] };
  save.storyCampaignV188.cinematicsSeen = [...CINEMATIC_IDS_V188]; // every story cinematic marked seen (no auto-play)
  Object.assign(save.hub, { deck, roomId, positionX, facing: 1 });
  save.asphodeleHubV188 = { ...save.asphodeleHubV188, ...hub, contracts: { ...save.asphodeleHubV188.contracts, ...contracts } };
  return save;
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 900 } });
const page = await context.newPage(); page.setDefaultTimeout(30000);
page.on('pageerror', error => report.pageErrors.push(error.message));
const snap = () => page.evaluate(() => { const h = globalThis.__ATF_HUB__; const s = h.getSnapshot(); return { ...s, asph: h.isAsphodeleV188?.() || false, room: h.currentRoom?.()?.id, running: h.running, interaction: h.echo8LockerContactV188?.()?.action || h.nearestInteraction?.()?.action || null }; });
const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem('atf-v47-profile-1')));
const shot = async name => { const file = join(out, `${name}.png`); await page.locator('#hub-canvas').screenshot({ path: file }); report.shots.push(file); };
async function navigate(view) {
  if (await page.locator('#menu-toggle').isVisible() && !(await page.locator('.rail').getAttribute('class')).split(/\s+/).includes('open')) await page.locator('#menu-toggle').click();
  await page.locator(`[data-view="${view}"]`).click();
}
async function importProfile(save, name) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 });
  await page.locator('#title-options').click();
  await page.locator('#save-import').setInputFiles({ name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).last().waitFor();
  await navigate('command'); await page.waitForTimeout(400);
  await closeDialogs();
  await navigate('hub');
  await page.waitForFunction(() => globalThis.__ATF_HUB__?.running && globalThis.__ATF_HUB__.player?.grounded, null, { timeout: 45000 });
  await page.locator('#hub-canvas').focus();
}
async function closeDialogs() {
  for (let i = 0; i < 6 && await page.locator('.cinematic-v188').count(); i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); }
  for (let i = 0; i < 4; i++) {
    const button = page.locator('dialog.content-scene-v188 button').last();
    if (!(await button.count())) break; await button.click(); await page.waitForTimeout(150);
  }
}
/** Hold A or D until the marine's centre is within 6 px of `target`. */
async function walkTo(target) {
  await page.locator('#hub-canvas').focus();
  for (let i = 0; i < 4; i++) {
    const s = await snap(), center = s.x + 22;
    if (Math.abs(center - target) <= 8) break;
    const key = center < target ? 'KeyD' : 'KeyA';
    await page.keyboard.down(key);
    await page.waitForFunction(([goal, right]) => { const p = globalThis.__ATF_HUB__.player; const c = p.x + 22; return right ? c >= goal - 4 : c <= goal + 4; }, [target, key === 'KeyD'], { timeout: 20000, polling: 'raf' }).catch(() => {});
    await page.keyboard.up(key); await page.waitForTimeout(250);
  }
  return snap();
}
async function holdKey(code, ms) { await page.keyboard.down(code); await page.waitForTimeout(ms); await page.keyboard.up(code); await page.waitForTimeout(150); return snap(); }
async function pressE() { await page.keyboard.press('KeyE'); await page.waitForTimeout(700); return snap(); }
async function measure(label, frames = 240) {
  const result = await page.evaluate(count => {
    const h = globalThis.__ATF_HUB__; const times = [];
    for (let i = 0; i < count; i++) { const t0 = performance.now(); h.update(1 / 60); h.draw(); times.push(performance.now() - t0); }
    times.sort((a, b) => a - b);
    return { frames: count, mean: times.reduce((a, b) => a + b, 0) / count, p50: times[Math.floor(count / 2)], p95: times[Math.floor(count * .95)], max: times[count - 1] };
  }, frames);
  report.measurements[label] = Object.fromEntries(Object.entries(result).map(([k, v]) => [k, Math.round(v * 1000) / 1000]));
  return result;
}

try {
  // —— Fixture A: post-S4, no contract done ——
  await importProfile(fixture(), 'asphodele-a.json');
  let s = await snap();
  check('Tantalus hangar after import', s.room === 'dropship-hangar' && !s.asph, s);
  await measure('tantalus-hangar');
  // Reach the UD-4L boarding contact (the depth hangar: step towards the camera in front of the dropship).
  // The UD-4L stands off the wall (spec 001): go round its tail, step forward, then walk in front of it.
  s = await walkTo(250);
  await page.keyboard.down('KeyS');
  await page.waitForFunction(() => (globalThis.__ATF_HUB__.player.depthZ || 0) <= -50, null, { timeout: 10000, polling: 'raf' }).catch(() => {});
  await page.keyboard.up('KeyS'); await page.waitForTimeout(150);
  s = await walkTo(470);
  check('UD-4L boarding contact reached', s.interaction === 'navigate:operations', s);
  await pressE();
  await page.locator('#hub-dialogue').waitFor({ state: 'visible' });
  const shuttle = page.locator('[data-asphodele-shuttle-v188]');
  check('shuttle choice offered in the hangar dialog', await shuttle.count() === 1 && await shuttle.isEnabled());
  await page.screenshot({ path: join(out, '00-hangar-shuttle-choice.png') }); report.shots.push(join(out, '00-hangar-shuttle-choice.png'));
  await shuttle.click();
  await page.waitForFunction(() => globalThis.__ATF_HUB__?.isAsphodeleV188?.() && globalThis.__ATF_HUB__.running, null, { timeout: 20000 });
  s = await snap(); let saved = await stored();
  check('arrived at the docks, airlock 1', s.roomId === 'asph-docks' && Math.abs(s.x + 22 - 150) <= 2 && saved.asphodeleHubV188.location === 'station', { s, hub: saved.asphodeleHubV188 });
  check('hangar return pose kept', saved.hub.roomId === 'dropship-hangar' && saved.hub.deck === 3, saved.hub);
  await page.waitForTimeout(300); await shot('01-docks-arrival');
  // Depth: S steps towards the camera, W back to the wall.
  s = await holdKey('KeyS', 400); const zFront = s.z;
  s = await holdKey('KeyW', 600);
  check('docks are a depth floor (W/S)', zFront < -20 && Math.abs(s.z) < 1, { zFront, back: s.z });
  // Sealed collars answer E with their reason; no room change.
  s = await walkTo(560); s = await pressE();
  check('Echo-8 collar sealed (E keeps the room)', s.roomId === 'asph-docks' && /SCELL|Sealed/i.test(s.prompt), s.prompt);
  // Grue stands on the floor at z −34: reach her in depth.
  s = await walkTo(1200); s = await holdKey('KeyS', 220);
  check('Grue reachable in depth', s.interaction === 'asphodele:grue', { z: s.z, i: s.interaction });
  s = await holdKey('KeyW', 500);
  s = await walkTo(1900);
  check('ring door prompt', /ENTRER|ENTER/.test(s.prompt), s.prompt);
  await shot('02-docks-ring-door');
  s = await pressE();
  check('docks → ring', s.roomId === 'asph-ring' && Math.abs(s.x + 22 - 130) <= 2 && s.z === 0, s);
  await page.waitForTimeout(300); await shot('03-ring');
  await measure('asphodele-ring');
  for (const [doorId, x] of [['ring-market', 560], ['ring-greenhouse', 1000], ['ring-memorial', 1440], ['ring-quarters', 1880]]) {
    s = await walkTo(x); s = await pressE();
    check(`${doorId} sealed with its reason`, s.roomId === 'asph-ring' && /·/.test(s.prompt), s.prompt);
  }
  s = await walkTo(2380); s = await pressE();
  check('ring → spoke', s.roomId === 'asph-spoke', s);
  s = await walkTo(1380); s = await pressE();
  check('spoke → control deck', s.roomId === 'asph-control', s);
  await page.waitForTimeout(300); await shot('04-control-deck');
  await measure('asphodele-control');
  s = await walkTo(1160); s = await pressE();
  check('relay room sealed without three drifting relays', s.roomId === 'asph-control' && /3|trois|three/i.test(s.prompt), s.prompt);
  s = await walkTo(1420); s = await pressE();
  check('control → transit lab (S3 done)', s.roomId === 'asph-lab', s);
  await page.waitForTimeout(300); await shot('05-transit-lab');
  s = await walkTo(130); s = await pressE();
  check('lab → control (round trip)', s.roomId === 'asph-control' && Math.abs(s.x + 22 - 1420) <= 2, s);
  // The contract board: E opens the station mission list.
  s = await walkTo(420); s = await pressE();
  const board = page.locator('dialog.content-scene-v188');
  await board.locator('[data-content-choice-v188="contracts"]').click(); await page.waitForTimeout(200);
  check('board dialog lists the contracts', await board.count() === 1 && (await board.locator('[data-content-choice-v188="station-c-relais"]').count()) === 1);
  await page.screenshot({ path: join(out, '06-board.png') }); report.shots.push(join(out, '06-board.png'));
  await board.locator('[data-content-choice-v188="station-c-relais"]').click(); await page.waitForTimeout(200);
  saved = await stored(); check('board plans the contract', saved.strategy.plannedCampaignId === 'station-c-relais', saved.strategy.plannedCampaignId);
  await closeDialogs(); await page.locator('#hub-canvas').focus();
  // Resume: reload mid-station, continue, same room and pose.
  s = await walkTo(600); await page.waitForTimeout(1300);
  const before = (await stored()).asphodeleHubV188;
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 });
  await page.locator('#title-continue').click(); await page.waitForTimeout(800); await closeDialogs();
  const resumedInHub = await page.waitForFunction(() => globalThis.__ATF_HUB__?.running, null, { timeout: 8000 }).then(() => true).catch(() => false);
  if (!resumedInHub) { await navigate('command'); await page.waitForTimeout(300); await closeDialogs(); await navigate('hub'); }
  await page.waitForFunction(() => globalThis.__ATF_HUB__?.isAsphodeleV188?.() && globalThis.__ATF_HUB__.running, null, { timeout: 30000 }).catch(() => {});
  s = await snap();
  check('resume after reload: same room and pose', s.asph && s.roomId === before.roomId && Math.abs(s.x - before.x) <= 2, { s: { roomId: s.roomId, x: s.x }, before });
  // Walk all the way back to the UD-4L and return to the Tantalus.
  await page.locator('#hub-canvas').focus();
  s = await walkTo(130); s = await pressE();
  s = await walkTo(130); s = await pressE();
  s = await walkTo(130); s = await pressE();
  check('back at the docks via spoke and ring', s.roomId === 'asph-docks', s);
  s = await walkTo(150);
  check('return prompt at airlock 1', /TANTALUS/.test(s.prompt), s.prompt);
  s = await pressE();
  await page.waitForFunction(() => !globalThis.__ATF_HUB__?.isAsphodeleV188?.() && globalThis.__ATF_HUB__.running, null, { timeout: 20000 });
  s = await snap(); saved = await stored();
  check('returned to the Tantalus hangar', s.room === 'dropship-hangar' && saved.asphodeleHubV188.location === 'tantalus', { room: s.room, loc: saved.asphodeleHubV188.location });
  await shot('07-back-in-hangar');
  // A second Tantalus room for the frame-time comparison: the bridge (deck 0 spawn of a fresh hub).

  // —— Fixture B: relay contracts ×3, side missions done, Grue pending ——
  await importProfile(fixture({ extraDone: ['station-a-journaux', 'station-a-hydro', 'station-a-grue'], contracts: { 'relay-drift': 3 },
    hub: { location: 'station', roomId: 'asph-control', x: 1138, z: 0 } }), 'asphodele-b.json');
  s = await snap();
  check('fixture B resumes on the control deck', s.asph && s.roomId === 'asph-control', s);
  s = await walkTo(1160); s = await pressE();
  check('relay room open after three drifting relays', s.roomId === 'asph-relay', s);
  await page.waitForTimeout(300); await shot('08-relay-room');
  s = await walkTo(760); s = await pressE();
  saved = await stored();
  check('transmission bays brought online (relay predicate)', saved.asphodeleHubV188.relayOnline === true, saved.asphodeleHubV188);
  await page.screenshot({ path: join(out, '09-relay-online.png') }); report.shots.push(join(out, '09-relay-online.png'));
  const predicate = await page.evaluate(async () => { const m = await import('/src/asphodele-hub-v188.js'); const d = await import('/src/story-dossier-v188.js');
    const save = JSON.parse(localStorage.getItem('atf-v47-profile-1')); return { ready: m.asphodeleRelayReadyV188(save), options: d.finalChoiceOptionsV188(save).options.map(o => o.id) }; });
  check('asphodeleRelayReadyV188 true in the browser', predicate.ready === true, predicate);
  await closeDialogs(); await page.locator('#hub-canvas').focus();
  s = await walkTo(130); s = await pressE(); s = await walkTo(130); s = await pressE(); s = await walkTo(130); s = await pressE();
  check('back on the ring', s.roomId === 'asph-ring', s);
  s = await walkTo(1440); s = await pressE();
  check('memorial open after the crew logs', s.roomId === 'asph-memorial', s);
  await page.waitForTimeout(300); await shot('10-memorial');
  s = await walkTo(130); s = await pressE();
  s = await walkTo(1000); s = await pressE();
  check('greenhouse open after « La serre »', s.roomId === 'asph-greenhouse', s);
  await page.waitForTimeout(300); await shot('11-greenhouse');
  s = await walkTo(130); s = await pressE();
  s = await walkTo(560); s = await pressE();
  check('market closed while the pact is pending', s.roomId === 'asph-ring', s.prompt);
  s = await walkTo(130); s = await pressE();
  s = await walkTo(1200); s = await holdKey('KeyS', 220); s = await pressE();
  const accept = page.locator('[data-content-choice-v188="accept"]');
  check('Grue offers the pact', await accept.count() === 1);
  await accept.click(); await page.waitForTimeout(200); saved = await stored();
  check('pact accepted', saved.asphodeleHubV188.grue === 'accept', saved.asphodeleHubV188.grue);
  await closeDialogs(); await page.locator('#hub-canvas').focus();
  s = await holdKey('KeyW', 500); s = await walkTo(1900); s = await pressE();
  s = await walkTo(560); s = await pressE();
  check('market open after the pact', s.roomId === 'asph-market', s);
  await page.waitForTimeout(300); await shot('12-market');

  // —— Fixture C: Kessler's tag in Echo-8's locker (cryo bay, deck 0) ——
  await importProfile(fixture({ deck: 0, roomId: 'cryo-bay', positionX: 3920 }), 'asphodele-c.json');
  s = await snap();
  if (s.interaction !== 'story:echo8-locker') s = await walkTo(3943); // the locker's centre (ECHO8_LOCKER_V188)
  check('cryo locker contact', s.interaction === 'story:echo8-locker', s.interaction);
  await page.locator('#hub-canvas').focus(); await page.keyboard.press('KeyE'); await page.waitForTimeout(500);
  const deposit = page.locator('[data-content-choice-v188="deposit"]');
  check('locker offers to place the tag', await deposit.count() === 1);
  await page.screenshot({ path: join(out, '13-locker-tag.png') }); report.shots.push(join(out, '13-locker-tag.png'));
  if (await deposit.count()) { await deposit.click(); await page.waitForTimeout(200); }
  saved = await stored(); check('tag placed in the locker', saved.asphodeleHubV188.kesslerTag === 'locker', saved.asphodeleHubV188.kesslerTag);
  await closeDialogs(); await page.waitForTimeout(300); await shot('14-locker-with-tag');
  await measure('tantalus-cryo-bay');
} catch (error) {
  report.fatal = error.stack || String(error); console.error(error);
} finally {
  await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  const failed = report.checks.filter(entry => !entry.passed);
  console.log(JSON.stringify({ passed: report.checks.length - failed.length, failed: failed.length, pageErrors: report.pageErrors.length, measurements: report.measurements }, null, 1));
  if (failed.length || report.fatal) process.exitCode = 1;
}
