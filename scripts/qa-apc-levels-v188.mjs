// V188 — the M577 to scale in the ordinary levels and under the UD-4L (owner decisions of
// 2026-11-22, round 2): Chromium pass on the real page (src/mission-dropship-handover-v188.js,
// src/m577-scale-v188.js).
// Fixtures (declared): profiles built from createDefaultSave() (Echo-9 squad, M577 selected),
// imported through the Options screen (#save-import), with these injected fields only:
// worldId / galaxy.shipWorldIdV116 = the mission's world, strategy.selectedVehicleId = the M577
// under test (001, or the 002 Command variant), storyCampaignV188.cinematicsSeen = all.
// Missions: pair-001-frontier (colony-multiroute, world-01) and pair-006-frontier (planet-exterior,
// world-06), launched from the Command order with the app's own insertion (the UD-4L lands in the
// level in 'apc' mode). Observation: a read-only page sampler (`__QA_APC_DROP__`, setInterval 50 ms)
// records the lowered M577 and the ship during the landing; it writes nothing to the game.
// Injections (declared): (1) the marine is moved to the M577's side door (`player.x/y`) before
// boarding; (2) for the extraction aboard, the objective chain is declared satisfied
// (`missingObjectiveRequirement` / `missingExtractionRequirement` return '') — the extraction itself
// is the real E press at the extraction point after driving there with the real D key.
// Inputs: real keyboard (V board / leave, D / A drive, E extract). Rendering is a Canvas placeholder
// (slot m577-mission-side-scale): the captures attest this pass, not a 1:1 likeness.
// Usage: PORT=4661 node scripts/dev.mjs & ; BASE_URL=http://127.0.0.1:4661/ node scripts/qa-apc-levels-v188.mjs <out-dir>
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { createDefaultSave } from '../src/save.js';
import { CINEMATIC_IDS_V188 } from '../src/story-cinematics-v188.js';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4661/';
const out = process.argv[2] || 'qa-apc-levels';
await mkdir(out, { recursive: true });
const report = { baseUrl, checks: [], pageErrors: [], consoleErrors: [], shots: [], runs: {} };
const check = (label, condition, evidence = null) => { report.checks.push({ label, passed: Boolean(condition), evidence }); console.log(JSON.stringify({ check: label, passed: Boolean(condition), evidence })); };
const RUNS = [
  { id: 'pair-001-frontier', world: 'world-01-acheron-lv-426', vehicle: 'vehicle-001-m577-armored-personnel-carrier', template: 'colony-multiroute', extract: true },
  { id: 'pair-006-frontier', world: 'world-06-lv-895', vehicle: 'vehicle-002-m577-command-apc', template: 'planet-exterior', extract: false }
];

function fixture(run) {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'command';
  save.worldId = run.world; save.galaxy.shipWorldIdV116 = run.world; save.strategy.selectedVehicleId = run.vehicle;
  save.storyCampaignV188.cinematicsSeen = [...CINEMATIC_IDS_V188];
  return save;
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 900 } });
const page = await context.newPage(); page.setDefaultTimeout(30000);
page.on('pageerror', error => report.pageErrors.push(error.message));
page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text().slice(0, 300)); });
const game = (fn, arg) => page.evaluate(fn, arg);
const shot = async name => { const file = join(out, `${name}.png`), canvas = page.locator('#game-canvas');
  if (await canvas.isVisible().catch(() => false)) await canvas.screenshot({ path: file }); else await page.screenshot({ path: file }); report.shots.push(file); };
const snap = () => game(() => globalThis.__ATF_GAME__?.m577ScaleSnapshotV188?.() || null);
async function navigate(view) {
  if (await page.locator('#menu-toggle').isVisible() && !(await page.locator('.rail').getAttribute('class')).split(/\s+/).includes('open')) await page.locator('#menu-toggle').click();
  await page.locator(`[data-view="${view}"]`).click(); await page.waitForTimeout(300);
}
async function closeDialogs() {
  for (let i = 0; i < 6 && await page.locator('.cinematic-v188').count(); i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); }
  for (let i = 0; i < 6; i++) { const button = page.locator('dialog.content-scene-v188 button').last(); if (!(await button.count())) break; await button.click(); await page.waitForTimeout(150); }
}
async function importProfile(save, name) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 });
  await page.locator('#title-options').click();
  await page.locator('#save-import').setInputFiles({ name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.waitForFunction(() => document.querySelector('#save-import').value === '');
  await page.waitForTimeout(400); await navigate('command'); await page.waitForTimeout(400); await closeDialogs();
}
// Read-only observer of the landing (declared above).
const installSampler = () => game(() => {
  globalThis.__QA_APC_DROP__ = [];
  clearInterval(globalThis.__QA_APC_TIMER__);
  globalThis.__QA_APC_TIMER__ = setInterval(() => {
    const e = globalThis.__ATF_GAME__, seq = e?.handoverV188; if (!seq?.apc || !seq.ship || !seq.resolved) return;
    const phase = seq.phases.find(entry => seq.t < entry.end)?.id || 'end', hung = e.m577HungFeetV188(seq.ship), feet = seq.groundY + (hung - seq.groundY) * (1 - seq.apc.drop);
    const belly = seq.ship.groundY - (seq.ship.lift || 0) - 36;
    globalThis.__QA_APC_DROP__.push({ t: +seq.t.toFixed(2), phase, own: seq.apc.own, w: seq.apc.w, x0: Math.round(seq.apc.x), x1: Math.round(seq.apc.x + seq.apc.w), feet: Math.round(feet), ground: seq.groundY,
      top: Math.round(feet - 140), belly: Math.round(belly), lift: Math.round(seq.ship.lift), drop: +seq.apc.drop.toFixed(3), lane: seq.m577Lane ? { x0: Math.round(seq.m577Lane.x0), x1: Math.round(seq.m577Lane.x1) } : null,
      doors: e.doors.map(door => [Math.round(door.x), Math.round(door.x + door.w)]) });
  }, 50);
});
async function launch(run) {
  await page.locator('#command-world-v110').selectOption(run.world).catch(() => {}); await page.waitForTimeout(300);
  const options = await page.locator('#command-mission-v110 option').evaluateAll(nodes => nodes.map(node => node.value));
  check(`${run.id}: offered in the Command mission order`, options.includes(run.id), options.slice(0, 12));
  await page.locator('#command-mission-v110').selectOption(run.id); await page.waitForTimeout(400);
  await installSampler();
  await page.locator('#operation-launch').click(); await page.waitForTimeout(800);
  let lowered = false, rolled = false;
  for (let i = 0; i < 120; i++) {
    const state = await game(() => { const e = globalThis.__ATF_GAME__, seq = e?.handoverV188; return { running: Boolean(e?.running && e?.mission), blocking: Boolean(seq?.blocking), phase: seq ? seq.phases.find(entry => seq.t < entry.end)?.id : null, drop: seq?.apc?.drop ?? null, x: seq?.apc?.x ?? null, lowerX: seq?.apc?.lowerX ?? null }; });
    if (state.running && state.blocking) {
      if (!lowered && state.phase === 'disembark' && state.drop > .3 && state.drop < .95) { await shot(`${run.id}-01-m577-lowered`); lowered = true; }
      if (!rolled && state.drop === 1 && state.x > state.lowerX + 120) { await shot(`${run.id}-02-m577-rolled-out`); rolled = true; }
      await page.waitForTimeout(120); continue;
    }
    if (state.running && !state.blocking && (await game(() => (globalThis.__ATF_GAME__.mission.elapsed || 0) > .2))) break;
    if (await page.locator('.cinematic-v188').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(400); continue; }
    const action = page.locator('[data-insertion-action]').first();
    if (await action.count() && await action.isVisible()) { await action.click(); await page.waitForTimeout(400); continue; }
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(2600); // the ship lifts off with the transport hoisted again
  await shot(`${run.id}-03-control`);
  await page.locator('#game-canvas').focus().catch(() => {});
  return { lowered, rolled };
}
// Physical fit computed on the page's own level (floors at the feet line, lift cabins excluded).
const fit = () => game(() => {
  const e = globalThis.__ATF_GAME__, v = e.vehicle, feet = v.y + v.h, lifts = new Set((e.lifts || []).map(lift => lift.id));
  const ov = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const floors = e.platforms.filter(entry => !lifts.has(entry.id) && Math.abs(entry.y - feet) <= 16).map(entry => [entry.x, entry.x + entry.w]).sort((a, b) => a[0] - b[0]);
  let covered = 0, cursor = v.x; for (const [a, b] of floors) { const s = Math.max(a, cursor), t = Math.min(b, v.x + v.w); if (t > s) { covered += t - s; cursor = t; } }
  const drawn = { x: v.x, y: feet - 140, w: v.w, h: 122 };
  return { covered: covered / v.w, solid: [...e.doors, ...e.walls].filter(entry => ov(v, entry)).map(entry => entry.id),
    overhead: e.platforms.filter(entry => !lifts.has(entry.id) && Math.abs(entry.y - feet) > 16 && ov(drawn, entry)).map(entry => entry.id),
    cabins: (e.lifts || []).filter(lift => lift.x < v.x + v.w && lift.x + lift.w > v.x).map(lift => lift.id), bounds: e.missionLevelBounds.width,
    hitbox: v.spriteHitbox?.local, extraction: e.objective ? Math.round(e.objective.x + e.objective.w / 2) : null };
});

try {
  for (const run of RUNS) {
    await importProfile(fixture(run), `${run.id}.json`);
    const seen = await launch(run);
    const drop = await game(() => globalThis.__QA_APC_DROP__ || []);
    clearInterval(await game(() => globalThis.__QA_APC_TIMER__));
    const config = await game(() => ({ mode: globalThis.__ATF_GAME__.handoverConfigV188?.mode || null, template: globalThis.__ATF_GAME__.missionLevelRuntime?.templateId || null }));
    check(`${run.id}: the UD-4L lands in the level in APC mode (${run.template})`, config.mode === 'apc' && config.template === run.template && drop.length > 10, { config, samples: drop.length });
    const doorCross = drop.filter(s => s.doors.some(([d0, d1]) => s.x0 < d1 && s.x1 > d0));
    check(`${run.id}: the lowered M577 is 449 px, hangs under the hovering ship, never below the ground, inside its lane and never through a door`,
      drop.every(s => s.w === 449 && s.feet <= s.ground && s.lane && s.x0 >= s.lane.x0 && s.x1 <= s.lane.x1) && !doorCross.length
        && drop.filter(s => s.phase !== 'liftoff').every(s => s.lift >= 149) && drop.filter(s => s.drop === 0 && s.phase !== 'liftoff').every(s => s.top >= s.belly - 21),
      { first: drop[0], last: drop.at(-1), doorCross: doorCross.slice(0, 2) });
    check(`${run.id}: lowered, rolled out, hoisted again before lift-off`, seen.lowered && seen.rolled && drop.some(s => s.drop === 1 && s.feet === s.ground) && drop.some(s => s.phase === 'liftoff' && s.drop === 0), seen);
    report.runs[run.id] = { drop: drop.filter((_, index) => index % 6 === 0) };

    let s = await snap(); const f = await fit();
    check(`${run.id}: the mission M577 (${run.vehicle}) is to scale and parked on a floor that holds it, clear of doors, cabins and decks, on the extraction lane`,
      s?.active && s.ordinary && s.w === 449 && s.h === 112 && f.covered > .999 && !f.solid.length && !f.overhead.length && !f.cabins.length && s.x >= 0 && s.x + s.w <= f.bounds
        && s.parked?.reachesExtraction && s.lane && f.extraction >= s.lane.x0 && f.extraction <= s.lane.x1 && f.hitbox?.w === 445, { snapshot: s, fit: f });
    // Injection (1): the marine at the side door; then the real V key.
    await game(() => { const e = globalThis.__ATF_GAME__, v = e.vehicle, p = e.player; for (const enemy of e.enemies) if (enemy.alive && Math.abs(enemy.x - v.x) < 900) e.defeatEnemy?.(enemy, p);
      Object.assign(p, { x: v.x + v.w * .47 - p.w / 2, y: v.y + v.h - p.h, vx: 0, vy: 0, grounded: true, climbing: false }); });
    await page.waitForTimeout(300); await shot(`${run.id}-04-parked`);
    const prompt = await game(() => globalThis.__ATF_GAME__.getInteractionPrompt());
    await page.keyboard.press('KeyV'); await page.waitForTimeout(1300);
    const boarded = await game(() => Boolean(globalThis.__ATF_GAME__.player.inVehicle));
    check(`${run.id}: boarding at the side door (V)`, boarded, prompt);
    // The squad boards through the rear socket after the driver; teammates left behind by injection (1) are skipped by the
    // engine's own timeout. Driving is locked until then, as in play.
    for (let i = 0; i < 30 && await game(() => Boolean(globalThis.__ATF_GAME__.vehicle.squadAccessRuntime)); i++) await page.waitForTimeout(500);
    await page.keyboard.down('KeyD'); await page.waitForTimeout(7000); await page.keyboard.up('KeyD'); await page.waitForTimeout(500);
    s = await snap();
    const view = await game(() => { const e = globalThis.__ATF_GAME__; return { screen0: Math.round(e.vehicle.x - e.camera.x), screen1: Math.round(e.vehicle.x + e.vehicle.w - e.camera.x) }; });
    await shot(`${run.id}-05-driven-east`);
    check(`${run.id}: driven east (D) it stops at the end of its floor lane, the whole hull framed by the camera`, s.lane && Math.abs(s.x + s.w - (s.lane.x1 - 8)) <= 1 && view.screen0 >= 0 && view.screen1 <= 1280, { snapshot: s, view });
    if (run.extract) {
      await page.keyboard.down('KeyA'); await page.waitForTimeout(9000); await page.keyboard.up('KeyA'); await page.waitForTimeout(500);
      s = await snap(); await shot(`${run.id}-06-driven-west`);
      check(`${run.id}: driven west (A) it stops at the lift shaft edge (the 2.8 m cabin never carries it)`, s.lane && Math.abs(s.x - (s.lane.x0 + 8)) <= 1, s);
      await page.keyboard.down('KeyD'); await page.waitForTimeout(7000); await page.keyboard.up('KeyD'); await page.waitForTimeout(500);
      // Injection (2): objectives satisfied; the extraction is the real E press aboard the M577 at the extraction point.
      await game(() => { const e = globalThis.__ATF_GAME__; e.missingObjectiveRequirement = () => ''; e.missingExtractionRequirement = () => ''; for (const enemy of e.enemies) if (enemy.alive) e.defeatEnemy?.(enemy, e.player); });
      await game(() => { globalThis.__QA_APC_HOIST__ = []; globalThis.__QA_APC_TIMER__ = setInterval(() => { const e = globalThis.__ATF_GAME__, seq = e?.handoverV188; if (!seq?.ownVehicle || !seq.ship) return;
        const v = e.vehicle; globalThis.__QA_APC_HOIST__.push({ phase: seq.phases.find(entry => seq.t < entry.end)?.id, x0: v.x, x1: v.x + v.w, top: v.y + v.h - 140, belly: seq.ship.groundY - (seq.ship.lift || 0) - 36, hoistX: seq.hoistX, lane: e.m577LaneV188 }); }, 50); });
      await page.keyboard.press('KeyE'); await page.waitForTimeout(1600); await shot(`${run.id}-07-extraction-hoist`);
      await page.waitForFunction(() => JSON.parse(localStorage.getItem('atf-v47-profile-1'))?.galaxy?.completedCampaignIds?.includes('pair-001-frontier') || !globalThis.__ATF_GAME__?.handoverV188, null, { timeout: 30000 }).catch(() => {});
      const hoist = await game(() => { clearInterval(globalThis.__QA_APC_TIMER__); return globalThis.__QA_APC_HOIST__ || []; });
      const board = hoist.filter(entry => entry.phase === 'board');
      check(`${run.id}: extraction aboard: the ship hovers over the hull on its lane, belly clear of the hull top, then hoists it`,
        board.length > 5 && hoist.every(entry => entry.x0 >= entry.lane.x0 && entry.x1 <= entry.lane.x1) && board.every(entry => entry.belly <= entry.top + 20.5), { samples: hoist.length, first: hoist[0], last: hoist.at(-1) });
    } else {
      await page.keyboard.press('KeyV'); await page.waitForTimeout(1300);
      const exit = await game(() => { const e = globalThis.__ATF_GAME__, v = e.vehicle, p = e.player, door = v.facing < 0 ? v.x + .53 * v.w : v.x + .47 * v.w;
        return { inVehicle: p.inVehicle, centre: Math.round(p.x + p.w / 2), door: Math.round(door), feet: Math.round(p.y + p.h), ground: Math.round(v.y + v.h) }; });
      await shot(`${run.id}-06-stepped-out`);
      check(`${run.id}: leaving (V) the marine steps out of the side door onto the floor (terrain within 16 px)`, !exit.inVehicle && Math.abs(exit.centre - exit.door) <= 1 && Math.abs(exit.feet - exit.ground) <= 16, exit);
    }
  }
} finally {
  check('no page error', report.pageErrors.length === 0, report.pageErrors);
  await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();
}
const failed = report.checks.filter(entry => !entry.passed);
console.log(JSON.stringify({ passed: report.checks.length - failed.length, failed: failed.length, shots: report.shots.length, consoleErrors: report.consoleErrors.length }));
process.exitCode = failed.length ? 1 : 0;
