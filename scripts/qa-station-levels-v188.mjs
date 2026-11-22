// V188 dedicated Asphodèle station levels — Chromium QA of S1-S4 on the real page (spec 009).
// Fixtures (declared): profiles built from createDefaultSave(), imported through the Options
// screen (#save-import), with these injected fields only:
//   galaxy.completedCampaignIds += the Act missions up to QZ-18 (special-narrative-qz17,
//   special-archive-relay) and the station missions before the one under test;
//   stationV188 = { introHeard: true, cassius: S3 'erase' (forced airlock 3) / S4 'rewrite',
//   scenesSeen: the return scenes of the missions already done };
//   storyCampaignV188.cinematicsSeen = all; worldId / galaxy.shipWorldIdV116 = world-05-lethe;
//   hub pose in the drop hangar.
// Injections (declared): (1) the marine is moved between the level's places (`player.x/y`);
// (2) hostile spawns alive when an interaction starts are removed with the engine's own
// `defeatEnemy` (no combat is claimed); (3) S4: the remaining dock-hold time is set to 3 s
// (the 60 s hold itself is covered by the Node suite). Interactions use the real keyboard
// (E pressed, or held), the mission is launched from the Command order and extracted with E.
// S2: the spec 010 hearing is played with the dialog’s own buttons (silence on every exchange,
// so the « lost » outcome; « won » is covered by the Node suite), then the decision text is read
// at the Command table after CIN-71 (skipped with Escape).
// The physical check of the sealed frames uses the real D key and Space.
// Usage: PORT=4671 node scripts/dev.mjs & ; node scripts/qa-station-levels-v188.mjs <out-dir> [ids]
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { createDefaultSave } from '../src/save.js';
import { CINEMATIC_IDS_V188 } from '../src/story-cinematics-v188.js';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4671/';
const out = process.argv[2] || 'qa-station-levels';
const ORDER = ['station-s1', 'station-s2', 'station-s3', 'station-s4'];
const only = process.argv[3] ? process.argv[3].split(',') : ORDER;
await mkdir(out, { recursive: true });
const report = { checks: [], pageErrors: [], consoleErrors: [], shots: [] };
const check = (label, condition, evidence = null) => { report.checks.push({ label, passed: Boolean(condition), evidence }); console.log(JSON.stringify({ check: label, passed: Boolean(condition), evidence })); };
const ACTS = ['special-narrative-qz17', 'special-archive-relay'];

function fixture(id) {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'hub';
  save.worldId = 'world-05-lethe'; save.galaxy.shipWorldIdV116 = 'world-05-lethe';
  const before = ORDER.slice(0, ORDER.indexOf(id));
  save.galaxy.completedCampaignIds = [...new Set([...save.galaxy.completedCampaignIds, ...ACTS, ...before])];
  save.stationV188 = { schema: 188, introHeard: true, cassius: id === 'station-s3' ? 'erase' : id === 'station-s4' ? 'rewrite' : null,
    scenesSeen: ['s1', 's3', 's4'].filter(scene => before.includes(`station-${scene}`)) };
  save.storyCampaignV188.cinematicsSeen = [...CINEMATIC_IDS_V188];
  Object.assign(save.hub, { deck: 3, roomId: 'dropship-hangar', positionX: 470, facing: 1 });
  return save;
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 900 } });
const page = await context.newPage(); page.setDefaultTimeout(30000);
page.on('pageerror', error => report.pageErrors.push(error.message));
page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text().slice(0, 300)); });
const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem('atf-v47-profile-1')));
const shot = async name => { const file = join(out, `${name}.png`); await page.screenshot({ path: file }); report.shots.push(file); };
const game = (fn, arg) => page.evaluate(fn, arg);
async function navigate(view) {
  const exit = page.getByRole('button', { name: /quitter vers commandement/i }).first();
  if (!(await page.locator(`[data-view="${view}"]`).isVisible().catch(() => false)) && await exit.isVisible().catch(() => false)) { await exit.click(); await page.waitForTimeout(600); }
  if (await page.locator('dialog.content-scene-v188').count()) return;
  if (await page.locator('#menu-toggle').isVisible() && !(await page.locator('.rail').getAttribute('class')).split(/\s+/).includes('open')) await page.locator('#menu-toggle').click();
  await page.locator(`[data-view="${view}"]`).click(); await page.waitForTimeout(300);
}
async function closeDialogs(max = 8) {
  for (let i = 0; i < 6 && await page.locator('.cinematic-v188').count(); i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); }
  for (let i = 0; i < max; i++) {
    const dialog = page.locator('dialog.content-scene-v188');
    if (!(await dialog.count())) break;
    await dialog.locator('button').last().click(); await page.waitForTimeout(200);
  }
}
async function importProfile(save, name) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 });
  await page.locator('#title-options').click();
  await page.locator('#save-import').setInputFiles({ name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).last().waitFor();
  await navigate('command'); await page.waitForTimeout(400); await closeDialogs();
}
async function launch(id) {
  await page.locator('#command-world-v110').selectOption('world-05-lethe').catch(() => {});
  await page.waitForTimeout(300);
  const options = await page.locator('#command-mission-v110 option').evaluateAll(nodes => nodes.map(node => node.value));
  check(`${id}: offered in the Command mission order`, options.includes(id), options.filter(entry => entry.startsWith('station-')));
  await page.locator('#command-mission-v110').selectOption(id); await page.waitForTimeout(400);
  await page.locator('#operation-launch').click(); await page.waitForTimeout(1200);
  for (let i = 0; i < 40; i++) {
    const live = await game(() => Boolean(globalThis.__ATF_GAME__?.mission && globalThis.__ATF_GAME__?.running && globalThis.__ATF_GAME__?.stationLevelV188));
    if (live) break;
    if (await page.locator('.cinematic-v188').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(500); continue; }
    const action = page.locator('[data-insertion-action]').first();
    if (await action.count() && await action.isVisible()) { await action.click(); await page.waitForTimeout(500); continue; }
    await page.keyboard.press('KeyE'); await page.waitForTimeout(600);
  }
  await page.waitForFunction(() => { const e = globalThis.__ATF_GAME__; return e?.mission?.state === 'active' && !e.handoverV188?.blocking && (e.mission.elapsed || 0) > .2; }, null, { timeout: 30000 }).catch(() => {});
  await page.locator('#game-canvas').focus().catch(() => {});
  const state = await game(() => ({ campaign: globalThis.__ATF_GAME__?.stationLevelV188?.campaignId, phase: globalThis.__ATF_GAME__?.stationPhaseIdV188?.(),
    corridor: globalThis.__ATF_GAME__?.missionDepthSectionV188?.id || null, enemies: globalThis.__ATF_GAME__?.enemies?.length }));
  check(`${id}: dedicated level running after the insertion (V1, no generic roster)`, state.campaign === id && !state.corridor, state);
  return state;
}
let P = null, S2_HEARING = null;
// Injection (1): move the marine to a place of the level (places read from the level itself).
async function moveTo(x, deck = 'low') {
  const y = typeof deck === 'number' ? deck : P.decks[deck];
  await game(([px, py]) => { const e = globalThis.__ATF_GAME__; Object.assign(e.player, { x: px - e.player.w / 2, y: py - e.player.h, vx: 0, vy: 0, grounded: true, depthZ: 0, climbing: false }); }, [x, y]);
  await page.waitForTimeout(250);
}
// Injection (2).
const clearSpawns = () => game(() => { const e = globalThis.__ATF_GAME__; for (const enemy of [...e.enemies]) if (enemy.alive && enemy.stationLevelSpawnV188) e.defeatEnemy(enemy, e.player); e.stationLevelV188.lastHitAt = -Infinity; e.player.health = Math.max(e.player.health, 80); });
const prompt = () => game(() => globalThis.__ATF_GAME__.getInteractionPrompt());
const phase = () => game(() => globalThis.__ATF_GAME__.stationPhaseIdV188());
async function press() { await clearSpawns(); await page.keyboard.press('KeyE'); await page.waitForTimeout(800); }
async function holdE(seconds) {
  await clearSpawns(); await page.keyboard.down('KeyE');
  for (let t = 0; t < seconds; t += .5) { await clearSpawns(); await page.waitForTimeout(500); }
  await page.keyboard.up('KeyE'); await page.waitForTimeout(300);
}
async function extract(id) {
  await clearSpawns();
  await game(() => { const e = globalThis.__ATF_GAME__, o = e.objective; Object.assign(e.player, { x: o.x + o.w / 2 - e.player.w / 2, y: o.y + o.h - e.player.h, vx: 0, vy: 0, depthZ: 0, grounded: true }); });
  await page.waitForTimeout(400);
  const before = await prompt();
  check(`${id}: extraction offered`, /CONFIRMER L’EXTRACTION/.test(before), before);
  await press();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('atf-v47-profile-1'))?.galaxy?.completedCampaignIds?.includes(globalThis.__ATF_GAME__?.campaign?.id), null, { timeout: 40000 }).catch(() => {});
  await shot(`${id}-99-extraction`);
  const save = await stored();
  check(`${id}: completed and recorded`, save.galaxy.completedCampaignIds.includes(id), save.galaxy.completedCampaignIds.filter(entry => entry.startsWith('station-')));
  return save;
}

for (const id of only) {
  await importProfile(fixture(id), `${id}.json`);
  await launch(id);
  P = await game(() => JSON.parse(JSON.stringify(globalThis.__ATF_GAME__.stationLevelV188.places)));
  await shot(`${id}-00-start`);
  if (id === 'station-s1') {
    // Sealed frames: logical access from the page's own module, physical stop with D + Space.
    const access = await game(async () => { const m = await import('/src/station-mission-levels-v188.js'); return m.stationAccessV188(globalThis.__ATF_GAME__); });
    check('S1 logical access: only the dock block before the airlock is cycled', !access.control && !access.extraction && access.reached.length === 6, access);
    const barriers = await game(() => globalThis.__ATF_GAME__.stationLevelV188.barriers.map(entry => ({ ...entry })));
    for (const barrier of barriers) {
      await moveTo(barrier.x - 160, barrier.floorY);
      await page.keyboard.down('KeyD');
      for (let t = 0; t < 8; t++) { await page.keyboard.press('Space'); await page.waitForTimeout(450); }
      await page.keyboard.up('KeyD');
      const at = await game(() => { const e = globalThis.__ATF_GAME__; return { x: e.player.x + e.player.w / 2, feet: e.player.y + e.player.h, prompt: e.getInteractionPrompt() }; });
      await shot(`station-s1-00-${barrier.id}`);
      check(`S1 physical: ${barrier.id} stops the walk (D + jumps) and says why`, at.x < barrier.x && Math.abs(at.feet - barrier.floorY) < 4 && at.prompt === barrier.requirement, { at, barrier: { x: barrier.x, floorY: barrier.floorY } });
    }
    await moveTo(P.crank.x); check('S1: manual crank prompt', /MANIVELLE/.test(await prompt()), await prompt());
    await shot('station-s1-01-collar'); await holdE(5);
    check('S1: airlock cycled, ring phase', await phase() === 'ring');
    await moveTo(P.fans[0].x + 50); await page.waitForTimeout(500); await shot('station-s1-02-dark-ring');
    check('S1: tracker saturated by the fans', await game(() => globalThis.__ATF_GAME__.stationHudLinesV188().includes('DÉTECTEUR SATURÉ · VENTILATEURS')));
    await moveTo(P.traces[0].x); await press(); await moveTo(P.traces[1].x, 'mid'); await press();
    await moveTo(P.salvagers.x); await shot('station-s1-03-salvagers'); await press();
    await moveTo(P.x.cargoDoor + 80); await page.waitForTimeout(500);
    check('S1: salvagers negotiated, control phase', await phase() === 'control', await game(() => globalThis.__ATF_GAME__.stationLevelV188.progress));
    await moveTo(P.console.x, 'top'); await shot('station-s1-04-control-deck'); await press();
    check('S1: emergency power, extraction', await phase() === 'extract' && await game(() => globalThis.__ATF_GAME__.mission.objectives.power));
  }
  if (id === 'station-s2') {
    for (const breaker of P.breakers) { await moveTo(breaker.x, breaker.y); await press(); }
    await shot('station-s2-01-breakers');
    check('S2: three breakers, reactor phase', await phase() === 'reactor');
    await moveTo(P.reactor.x); await press(); await holdE(6); await shot('station-s2-02-reactor');
    check('S2: reactor restarted', await phase() === 'cassius' && await game(() => globalThis.__ATF_GAME__.powerNode.active));
    await moveTo(P.cassius.x, 'top');
    check('S2: hearing offered at the core', /INTERROGATOIRE DE CASSIUS/.test(await prompt()), await prompt());
    await press();
    // Spec 010 hearing over the paused level: silence on every exchange (real buttons of the dialog).
    const dialog = page.locator('[data-confrontation-v188]');
    await dialog.waitFor({ timeout: 10000 }).catch(() => {});
    check('S2: hearing dialog opened, mission paused', await dialog.count() > 0 && await game(() => globalThis.__ATF_GAME__.paused), await dialog.count());
    await shot('station-s2-03-hearing');
    for (let i = 0; i < 30 && await dialog.count(); i++) {
      const silence = dialog.locator('[data-confrontation-silence-v188]'), next = dialog.locator('[data-confrontation-continue-v188]');
      if (await next.count()) await next.click(); else if (await silence.count()) await silence.click();
      await page.waitForTimeout(700);
    }
    const hearing = await game(() => ({ hearing: globalThis.__ATF_GAME__.stationLevelV188.progress.hearing, paused: globalThis.__ATF_GAME__.paused }));
    check('S2: hearing concluded, level resumed', ['won', 'lost'].includes(hearing.hearing) && !hearing.paused, hearing);
    await page.locator('#game-canvas').focus().catch(() => {});
    await shot('station-s2-04-cassius');
    await holdE(4);
    check('S2: CASSIUS questioned, orders copied', await phase() === 'extract');
    S2_HEARING = hearing.hearing;
  }
  if (id === 'station-s3') {
    await moveTo(P.airlock3.x); check('S3: CASSIUS erased → airlock 3 forced by hand', /FORCER LE SAS 3/.test(await prompt()), await prompt());
    await shot('station-s3-01-airlock3'); await holdE(7);
    check('S3: airlock 3 open, lab phase', await phase() === 'lab');
    await moveTo(P.cradles.x + P.cradles.w / 2); await shot('station-s3-02-lab'); await press(); await moveTo(P.log.x); await press();
    check('S3: lab searched, routing phase', await phase() === 'routing');
    await moveTo(P.router.x - 30); await press(); await shot('station-s3-03-routing');
    check('S3: power routed (airlocks + lights), escape phase with the seal countdown', await phase() === 'escape'
      && await game(() => globalThis.__ATF_GAME__.stationLevelV188.progress.sealRemaining > 140));
    await moveTo(P.tag.x); await press(); await shot('station-s3-04-kessler-tag');
    check('S3: Kessler’s tag, extraction', await phase() === 'extract');
  }
  if (id === 'station-s4') {
    await moveTo(P.nest.x, 'mid'); await shot('station-s4-01-nest'); await holdE(6);
    check('S4: nest purged', await phase() === 'pressure');
    for (const valve of P.valves) { await moveTo(valve.x, valve.y); await holdE(4); }
    check('S4: station pressurised, dock hold', await phase() === 'hold');
    await moveTo(P.hold.x); await page.waitForTimeout(3000); await shot('station-s4-02-hold');
    await game(() => { globalThis.__ATF_GAME__.stationLevelV188.progress.holdRemaining = 3; }); // injection (3)
    for (let i = 0; i < 12 && await phase() === 'hold'; i++) { await clearSpawns(); await page.waitForTimeout(600); }
    await shot('station-s4-03-team');
    check('S4: the technical team arrives, extraction at the dock', await phase() === 'extract');
  }
  await extract(id);
  if (id === 'station-s2') {
    // Back aboard, then the Command table: CIN-71 (skipped with Escape), then the existing decision.
    for (let i = 0; i < 40 && !(await page.locator('dialog.content-scene-v188').count()); i++) {
      if (await page.getByText('PASSER (ÉCHAP)').first().isVisible().catch(() => false) || await page.locator('.cinematic-v188').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(600); continue; }
      const back = page.locator('#retreat-mission');
      if (await back.isVisible().catch(() => false) && /RETOUR/.test(await back.textContent())) { await back.click(); await page.waitForTimeout(1200); continue; }
      if (i > 4) await navigate('command').catch(() => {});
      await page.waitForTimeout(800);
    }
    const text = await page.locator('dialog.content-scene-v188').first().textContent().catch(() => '');
    await shot('station-s2-05-decision');
    check('S2: the existing CASSIUS decision carries the hearing’s last answer (text only, three choices)',
      /CASSIUS ne ment pas/.test(text) && /Mes consignes (se contredisent|restent cohérentes)/.test(text) && /RÉÉCRIRE/.test(text) && /LE BRIDER/.test(text) && /L’EFFACER/.test(text), { hearing: S2_HEARING, text: text.slice(0, 400) });
  }
  for (let i = 0; i < 25; i++) {
    if (await page.getByText('PASSER (ÉCHAP)').first().isVisible().catch(() => false)) { await page.keyboard.press('Escape'); await page.waitForTimeout(600); continue; }
    const back = page.locator('#retreat-mission');
    if (await back.isVisible().catch(() => false) && /RETOUR/.test(await back.textContent())) { await back.click(); await page.waitForTimeout(1200); continue; }
    if (await page.locator('[data-view="command"]').isVisible().catch(() => false) || await page.locator('dialog.content-scene-v188').count()) break;
    await page.waitForTimeout(600);
  }
  await shot(`${id}-100-return`);
}
check('no page error', report.pageErrors.length === 0, report.pageErrors.slice(0, 8));
await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2));
await browser.close();
const failed = report.checks.filter(entry => !entry.passed);
console.log(`checks ${report.checks.length - failed.length}/${report.checks.length}`);
assert.equal(failed.length, 0, failed.map(entry => entry.label).join(' | '));
