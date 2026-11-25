// V188 spec 007 follow-up — Chromium QA of the Asphodèle station, second pass, walked with real keys.
// Fixtures (declared): profiles built from createDefaultSave(), imported through the Options screen
// (#save-import), with these injected fields only:
//   galaxy.completedCampaignIds += special-archive-relay, station-s1..s4, station-a-journaux, station-a-hydro, station-a-grue;
//   stationV188 = { introHeard, cassius: 'rewrite', scenesSeen: s1/s3/s4 };
//   storyCampaignV188.cinematicsSeen = every CINEMATIC_IDS_V188 entry (no auto-play);
//   worldId / galaxy.shipWorldIdV116 = world-05-lethe;
//   colonyV188: five sites validated at level 2 (Port-Méridien « Autonome »);
//   asphodeleHubV188: location 'station', docks airlock 1, grue 'accept', contracts relay-drift 3 and module 1;
//   galaxy.resources.credits = 4000; crew[1].health = 45 (one injured member for the medbay).
// Injection (declared): in the mission, the marine is placed on the deck of the mission feature for screenshot 12 only.
// Mission fixture: the same save at scene 'command', launched on station-c-relais from the Command dropdown.
// English fixture: localStorage 'atf-language-v185' = 'en' before load (init script).
// Usage: PORT=4602 node scripts/dev.mjs & ; node scripts/qa-asphodele-hub-2-v188.mjs <out-dir>
// MEASURE_ONLY=1 measures the docks of any build that has the station (same fixture), for before/after.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { createDefaultSave } from '../src/save.js';
import { CINEMATIC_IDS_V188 } from '../src/story-cinematics-v188.js';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4602/';
const out = process.argv[2] || 'qa-asphodele-2';
const measureOnly = process.env.MEASURE_ONLY === '1';
await mkdir(out, { recursive: true });
const report = { baseUrl, checks: [], pageErrors: [], measurements: {}, shots: [] };
const check = (label, condition, evidence = null) => { report.checks.push({ label, passed: Boolean(condition), evidence }); console.log(JSON.stringify({ check: label, passed: Boolean(condition) })); };

function fixture({ scene = 'hub', hub = {} } = {}) {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = scene;
  save.worldId = 'world-05-lethe'; save.galaxy.shipWorldIdV116 = 'world-05-lethe';
  save.galaxy.completedCampaignIds = [...new Set([...save.galaxy.completedCampaignIds, 'special-archive-relay', 'station-s1', 'station-s2', 'station-s3', 'station-s4',
    'station-a-journaux', 'station-a-hydro', 'station-a-grue'])];
  save.stationV188 = { schema: 188, introHeard: true, cassius: 'rewrite', scenesSeen: ['s1', 's3', 's4'] };
  save.storyCampaignV188.cinematicsSeen = [...CINEMATIC_IDS_V188];
  save.colonyV188 = { schema: 188, sites: Object.fromEntries(['atmosphere', 'infirmary', 'walls', 'power', 'comms', 'docks', 'habitat'].map((id, index) => [id, index < 5 ? { invested: 2, validated: 2 } : { invested: 0, validated: 0 }])) };
  Object.assign(save.hub, { deck: 3, roomId: 'dropship-hangar', positionX: 470, facing: 1 });
  save.galaxy.resources.credits = 4000; save.crew[1].health = 45;
  save.asphodeleHubV188 = { ...save.asphodeleHubV188, location: 'station', roomId: 'asph-docks', x: 128, z: 0, facing: 1, grue: 'accept',
    contracts: { ...save.asphodeleHubV188.contracts, 'relay-drift': 3, module: 1 }, ...hub };
  return save;
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
let context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 900 } });
let page = await context.newPage(); page.setDefaultTimeout(30000);
const watch = target => target.on('pageerror', error => report.pageErrors.push(error.message));
watch(page);
const snap = () => page.evaluate(() => { const h = globalThis.__ATF_HUB__; const s = h.getSnapshot(); return { ...s, asph: h.isAsphodeleV188?.() || false, room: h.currentRoom?.()?.id, interaction: h.nearestInteraction?.()?.action || null }; });
const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem('atf-v47-profile-1')));
const shot = async name => { const file = join(out, `${name}.png`); await page.locator('#hub-canvas').screenshot({ path: file }); report.shots.push(file); };
const pageShot = async name => { const file = join(out, `${name}.png`); await page.screenshot({ path: file }); report.shots.push(file); };
async function navigate(view) {
  if (await page.locator('#menu-toggle').isVisible() && !(await page.locator('.rail').getAttribute('class')).split(/\s+/).includes('open')) await page.locator('#menu-toggle').click();
  await page.locator(`[data-view="${view}"]`).click();
}
async function closeDialogs() {
  for (let i = 0; i < 6 && await page.locator('.cinematic-v188').count(); i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); }
  for (let i = 0; i < 4; i++) { const button = page.locator('dialog.content-scene-v188 button').last(); if (!(await button.count())) break; await button.click(); await page.waitForTimeout(150); }
}
async function importProfile(save, name, { hub = true } = {}) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 });
  await page.locator('#title-options').click();
  await page.locator('#save-import').setInputFiles({ name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.waitForFunction(() => document.querySelector('#save-import').value === '');
  await page.waitForTimeout(400);
  await navigate('command'); await page.waitForTimeout(400); await closeDialogs();
  if (!hub) return;
  await navigate('hub');
  await page.waitForFunction(() => globalThis.__ATF_HUB__?.running && globalThis.__ATF_HUB__.player?.grounded, null, { timeout: 45000 });
  await page.locator('#hub-canvas').focus();
}
async function walkTo(target) {
  await page.locator('#hub-canvas').focus();
  for (let i = 0; i < 4; i++) {
    const s = await snap(), center = s.x + 22; if (Math.abs(center - target) <= 8) break;
    const key = center < target ? 'KeyD' : 'KeyA';
    await page.keyboard.down(key);
    await page.waitForFunction(([goal, right]) => { const p = globalThis.__ATF_HUB__.player; const c = p.x + 22; return right ? c >= goal - 4 : c <= goal + 4; }, [target, key === 'KeyD'], { timeout: 25000, polling: 'raf' }).catch(() => {});
    await page.keyboard.up(key); await page.waitForTimeout(250);
  }
  return snap();
}
async function pressE() { await page.keyboard.press('KeyE'); await page.waitForTimeout(700); return snap(); }
const choice = id => page.locator(`dialog.content-scene-v188 [data-content-choice-v188="${id}"]`);
const dialogText = () => page.locator('dialog.content-scene-v188').innerText().catch(() => '');
async function measure(label, frames = 300) {
  const result = await page.evaluate(count => {
    const h = globalThis.__ATF_HUB__; const times = [];
    for (let i = 0; i < 30; i++) { h.update(1 / 60); h.draw(); } // warm-up
    for (let i = 0; i < count; i++) { const t0 = performance.now(); h.update(1 / 60); h.draw(); times.push(performance.now() - t0); }
    times.sort((a, b) => a - b);
    return { frames: count, workers: (h.asphCrowdV188 || []).length, mean: times.reduce((a, b) => a + b, 0) / count, p50: times[Math.floor(count / 2)], p95: times[Math.floor(count * .95)], max: times[count - 1] };
  }, frames);
  report.measurements[label] = Object.fromEntries(Object.entries(result).map(([k, v]) => [k, Math.round(v * 1000) / 1000]));
  return result;
}
/** The same docks scene, crowd on and off, alternated three times (same build, same pose). */
async function measureDocks(prefix) {
  for (let round = 1; round <= 3; round++) {
    await measure(`${prefix}-crowd-${round}`);
    await page.evaluate(() => { const h = globalThis.__ATF_HUB__; h.__crowdV188 = h.asphCrowdV188; h.asphCrowdV188 = []; });
    await measure(`${prefix}-no-crowd-${round}`);
    await page.evaluate(() => { const h = globalThis.__ATF_HUB__; h.asphCrowdV188 = h.__crowdV188; });
  }
}

try {
  if (measureOnly) {
    await importProfile(fixture(), 'asphodele-measure.json');
    const s = await snap(); check('measure fixture in the docks', s.asph && s.roomId === 'asph-docks', { roomId: s.roomId });
    for (let round = 1; round <= 3; round++) await measure(`docks-build-${round}`);
  } else {
    // —— Main fixture: resume at the docks ——
    await importProfile(fixture(), 'asphodele-2-main.json');
    let s = await snap(), saved;
    check('resumed at the docks', s.asph && s.roomId === 'asph-docks', { roomId: s.roomId });
    check('no Tantalus objective toast aboard the station', await page.locator('#hub-onboarding-objective-v84').isHidden());
    check('docks crowd: four dockers', s.crowd?.length === 4 && s.crowd.every(actor => actor.role === 'docker'), s.crowd);
    await page.waitForTimeout(1500);
    const clear = await page.evaluate(async () => { const m = await import('/src/asphodele-crowd-v188.js'); const r = await import('/src/asphodele-hub-v188.js');
      const h = globalThis.__ATF_HUB__; return m.asphodeleCrowdClearsDoorwaysV188(r.getAsphodeleRoomV188(h.asphStateV188.roomId), h.asphCrowdV188); });
    check('docks doorways and airlock clear of the crowd', clear === true);
    await shot('01-docks-crowd');
    await measureDocks('docks');
    // Repair hangar (one repressurised module): Cheyenne overhaul.
    s = await walkTo(1480); check('repair hangar door prompt', /ENTRER|ENTER/.test(s.prompt), s.prompt);
    s = await pressE(); check('docks → repair hangar', s.roomId === 'asph-repair' && s.z === 0, { roomId: s.roomId });
    await page.waitForTimeout(400); await shot('02-repair-hangar');
    s = await walkTo(820); s = await pressE();
    check('Cheyenne workshop dialog', await choice('buy').count() === 1, await dialogText());
    await pageShot('03-repair-dialog');
    await choice('buy').click(); await page.waitForTimeout(250); saved = await stored();
    check('Cheyenne overhaul level 1 paid with the existing economy', saved.asphodeleHubV188.cheyenne === 1 && saved.galaxy.resources.credits === 3400, { cheyenne: saved.asphodeleHubV188.cheyenne, credits: saved.galaxy.resources.credits });
    await closeDialogs(); await page.locator('#hub-canvas').focus();
    s = await walkTo(130); s = await pressE(); check('repair hangar → docks (round trip)', s.roomId === 'asph-docks' && Math.abs(s.x + 22 - 1480) <= 2, { roomId: s.roomId, x: s.x });
    // Ring, quarters (colony « Autonome »).
    s = await walkTo(1900); s = await pressE(); check('docks → ring', s.roomId === 'asph-ring', { roomId: s.roomId });
    await page.waitForTimeout(800); await shot('04-ring-crowd'); await measure('ring-crowd');
    s = await walkTo(1880); s = await pressE(); check('ring → quarters (Autonome)', s.roomId === 'asph-quarters', { roomId: s.roomId });
    await page.waitForTimeout(300); await shot('05-quarters');
    s = await walkTo(760); s = await pressE(); const morale = (await stored()).hub.systems.morale;
    check('cabin register offers to settle the volunteers', await choice('settle').count() === 1, await dialogText());
    await choice('settle').click(); await page.waitForTimeout(250); saved = await stored();
    check('volunteers settled once, morale +4', saved.asphodeleHubV188.quartersSettled === true && saved.hub.systems.morale === Math.min(100, morale + 4), { morale: saved.hub.systems.morale });
    await closeDialogs(); await page.locator('#hub-canvas').focus();
    s = await walkTo(130); s = await pressE(); check('quarters → ring', s.roomId === 'asph-ring' && Math.abs(s.x + 22 - 1880) <= 2, { roomId: s.roomId });
    // Market (pact accepted): real trades and refusals.
    s = await walkTo(560); s = await pressE(); check('ring → market', s.roomId === 'asph-market', { roomId: s.roomId });
    await page.waitForTimeout(500); await shot('06-market');
    s = await walkTo(700); s = await pressE();
    check('market counter lists the four offers', await choice('buy-alloy').count() === 1 && await choice('sell-alloy').count() === 1, await dialogText());
    let before = (await stored()).galaxy.resources;
    await choice('buy-alloy').click(); await page.waitForTimeout(250); saved = await stored();
    check('bought 10 alloy for 240 CR', saved.galaxy.resources.alloy === before.alloy + 10 && saved.galaxy.resources.credits === before.credits - 240, { before, after: saved.galaxy.resources });
    for (let i = 0; i < 2; i++) { await choice('buy-alloy').click(); await page.waitForTimeout(200); }
    await choice('buy-alloy').click(); await page.waitForTimeout(250);
    const refusal = await dialogText(); saved = await stored();
    check('fourth purchase refused: stock spent this cycle', /épuisé|Out of stock/.test(refusal) && saved.asphodeleHubV188.market.used['buy-alloy'] === 3, refusal.slice(0, 200));
    await pageShot('07-market-stock-refusal');
    await page.evaluate(() => { const save = globalThis.__ATF_V51__?.saveSystem?.data; return save ? null : 'no-model'; });
    await closeDialogs(); await page.locator('#hub-canvas').focus();
    s = await walkTo(130); s = await pressE(); check('market → ring', s.roomId === 'asph-ring', { roomId: s.roomId });
    // Spoke, control deck, medbay, lower decks.
    s = await walkTo(2380); s = await pressE(); s = await walkTo(1380); s = await pressE(); check('ring → spoke → control', s.roomId === 'asph-control', { roomId: s.roomId });
    s = await walkTo(420); s = await pressE();
    const board = await dialogText(); check('QZ board shows the station indices', /Sécurité|Security/.test(board) && /main-d’œuvre|workforce/.test(board), board.slice(0, 240));
    await closeDialogs(); await page.locator('#hub-canvas').focus();
    s = await walkTo(1680); s = await pressE(); check('control → medbay (S4)', s.roomId === 'asph-medbay', { roomId: s.roomId });
    await page.waitForTimeout(300); await shot('08-medbay');
    s = await walkTo(600); s = await pressE(); const health = (await stored()).crew[1].health;
    check('medbay treats the injured crew member', await choice('treat').count() === 1, await dialogText());
    await choice('treat').click(); await page.waitForTimeout(250); saved = await stored();
    check('crew member treated (1 MEDICAL)', saved.crew[1].health > health, { before: health, after: saved.crew[1].health });
    await closeDialogs(); await page.locator('#hub-canvas').focus();
    s = await walkTo(130); s = await pressE(); check('medbay → control', s.roomId === 'asph-control' && Math.abs(s.x + 22 - 1680) <= 2, { roomId: s.roomId });
    s = await walkTo(1920); s = await pressE(); check('control → lower decks (S3)', s.roomId === 'asph-lower', { roomId: s.roomId });
    await page.waitForTimeout(300); await shot('09-lower-decks');
    s = await walkTo(980); s = await pressE();
    check('night board offers the night inspection', await choice('plan').count() === 1, await dialogText());
    await choice('plan').click(); await page.waitForTimeout(250); saved = await stored();
    check('night inspection planned (orig-asphodele-2)', saved.strategy.plannedCampaignId === 'orig-asphodele-2', saved.strategy.plannedCampaignId);
    await closeDialogs(); await page.locator('#hub-canvas').focus();
    // Resume inside a reopened module.
    await page.waitForTimeout(1300); const pose = (await stored()).asphodeleHubV188;
    await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 });
    await page.locator('#title-continue').click(); await page.waitForTimeout(800); await closeDialogs();
    const resumed = await page.waitForFunction(() => globalThis.__ATF_HUB__?.running, null, { timeout: 8000 }).then(() => true).catch(() => false);
    if (!resumed) { await navigate('command'); await page.waitForTimeout(300); await closeDialogs(); await navigate('hub'); }
    await page.waitForFunction(() => globalThis.__ATF_HUB__?.isAsphodeleV188?.() && globalThis.__ATF_HUB__.running, null, { timeout: 30000 }).catch(() => {});
    s = await snap(); check('resume after reload inside the lower decks', s.asph && s.roomId === pose.roomId && Math.abs(s.x - pose.x) <= 2, { roomId: s.roomId, x: s.x, pose: { roomId: pose.roomId, x: pose.x } });
    await page.locator('#hub-canvas').focus();
    s = await walkTo(130); s = await pressE(); check('lower decks → control (round trip)', s.roomId === 'asph-control' && Math.abs(s.x + 22 - 1920) <= 2, { roomId: s.roomId });
    await shot('10-control-crowd');

    // —— Mission: station dressing of a contract ——
    await importProfile(fixture({ scene: 'command', hub: { location: 'tantalus' } }), 'asphodele-2-mission.json', { hub: false });
    await page.locator('#command-mission-v110').selectOption('station-c-relais');
    await page.locator('#operation-launch').click();
    for (let i = 0; i < 40; i++) { if (await page.evaluate(() => !!globalThis.__ATF_GAME__?.running)) break;
      const advance = page.locator('[data-insertion-action="advance"]'); if (await advance.isVisible().catch(() => false)) await advance.click(); else await page.keyboard.press('Enter'); await page.waitForTimeout(300); }
    await page.waitForFunction(() => globalThis.__ATF_GAME__?.running && !globalThis.__ATF_GAME__.paused, null, { timeout: 45000 }).catch(() => {});
    const dressing = await page.evaluate(() => { const d = globalThis.__ATF_GAME__?.asphMissionDressingV188; return d ? { decks: d.decks, props: d.props.length, bands: d.bands.length, feature: d.feature?.kind, sector: d.sector } : null; });
    check('contract mission dressed as the station', dressing?.props >= 8 && dressing.feature === 'blackbox', dressing);
    await page.waitForTimeout(1200);
    { const file = join(out, '11-mission-station-dressing.png'); await page.locator('#game-canvas').screenshot({ path: file }); report.shots.push(file); }
    // Declared injection: the marine is placed on the deck of the mission feature (no gameplay check depends on it).
    await page.evaluate(() => { const g = globalThis.__ATF_GAME__, f = g.asphMissionDressingV188.feature; g.player.x = f.x - 160; g.player.y = f.y + f.h + 40 - g.player.h; g.player.vx = 0; g.player.vy = 0; });
    await page.waitForTimeout(900);
    { const file = join(out, '12-mission-feature.png'); await page.locator('#game-canvas').screenshot({ path: file }); report.shots.push(file); }

    // —— English: briefing dropdown names, gangway label ——
    await context.close();
    context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => { try { localStorage.setItem('atf-language-v185', 'en'); } catch { /* private mode */ } });
    page = await context.newPage(); page.setDefaultTimeout(30000); watch(page);
    await importProfile(fixture({ scene: 'command', hub: { location: 'tantalus' } }), 'asphodele-2-en.json', { hub: false });
    await page.waitForTimeout(1500);
    const options = await page.evaluate(async () => { const content = await import('/src/content.js');
      return [...document.querySelectorAll('#command-mission-v110 option')].map(option => ({ id: option.value, text: option.textContent, fr: content.CAMPAIGNS.find(entry => entry.id === option.value)?.name })); });
    const station = options.filter(entry => /^(station-|orig-asphodele|act5-)/.test(entry.id));
    check('English: station mission names translated in the dropdown', station.length >= 10 && station.every(entry => entry.text.replace(/^★ /, '') !== entry.fr), station.slice(0, 6));
    const starred = options.find(entry => entry.text.startsWith('★ '));
    check('English: the ★ recommended name is translated too', !starred || starred.text.slice(2) !== starred.fr, starred);
    await pageShot('13-command-dropdown-en');
    const gangway = await page.evaluate(async () => (await import('/src/ship-port-room-v87.js')).shipPortGangwayLabelV188({ shipPortV1: { phase: 'undocked' } }));
    check('English gangway label replaces UNDOCKED', gangway === 'GANGWAY · NO PORT DOCKED', gangway);
  }
} catch (error) {
  report.fatal = error.stack || String(error); console.error(error);
} finally {
  await writeFile(join(out, measureOnly ? 'measure.json' : 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  const failed = report.checks.filter(entry => !entry.passed);
  console.log(JSON.stringify({ passed: report.checks.length - failed.length, failed: failed.length, pageErrors: report.pageErrors, measurements: report.measurements }, null, 1));
  if (failed.length || report.fatal) process.exitCode = 1;
}
