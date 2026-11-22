// V188 dedicated colony levels — Chromium QA of C1-C4 on the real page.
// Fixtures (declared): profiles built from createDefaultSave(), imported through the
// Options screen (#save-import), with these injected fields only:
//   galaxy.completedCampaignIds += the act missions that open C1-C4 (QZ-17, QZ-18,
//   APC convoy, Black Cocoon) and the colony missions before the one under test;
//   portMeridienV90 = quay sequence completed; storyCampaignV188.cinematicsSeen = all;
//   worldId / galaxy.shipWorldIdV116 = world-05-lethe; hub pose in the drop hangar.
// Injections (declared): (1) the marine is moved between the level's places
// (`player.x/y`); (2) hostile spawns still alive when a held interaction starts are
// removed with the engine's own `defeatEnemy` (no combat is claimed); (3) C3 panic
// is raised by holding the aim key (Shift) towards the queue. Interactions use the
// real keyboard (E pressed, or held for welds, purge and resin), the mission is
// launched from the Command order and extracted with E.
// Owner decisions of 2026-11-22: the default save deploys Noor Okafor and selects the M577; the
// script checks that C1/C3/C4 run without the M577 (vehicle stowed, landing on foot), that C3 posts
// Noor at the infirmary instead of the squad, that the C4 walks around the ducts are welded shut
// (injection (1) puts the marine on the roof and in the gallery, then the real D key and Space
// walk and jump east; the logical check imports the page's colony module), and captures both
// ends of the C1 corridor (perspective capped). Running these checks only: argv[3] = ids.
// Owner decisions of 2026-11-22 (round 2): the C3 preparation screen (#operation-plan, read before
// launch) lists Noor Okafor as unavailable « à l'infirmerie » with the reason; the EN text is read
// from the page's own catalogue module (`import('/src/i18n-en-catalog-v185.js')`); the M577 parked at
// the quay is checked at scale on the quay floor from the page's level (places, platforms, doors).
// Usage: PORT=4641 node scripts/dev.mjs & ; node scripts/qa-colony-levels-v188.mjs <out-dir>
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { createDefaultSave } from '../src/save.js';
import { CINEMATIC_IDS_V188 } from '../src/story-cinematics-v188.js';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4641/';
const out = process.argv[2] || 'qa-colony-levels';
const only = process.argv[3] ? process.argv[3].split(',') : ['colony-c1', 'colony-c2', 'colony-c3', 'colony-c4'];
await mkdir(out, { recursive: true });
const report = { checks: [], pageErrors: [], consoleErrors: [], shots: [] };
const check = (label, condition, evidence = null) => { report.checks.push({ label, passed: Boolean(condition), evidence }); console.log(JSON.stringify({ check: label, passed: Boolean(condition), evidence })); };
const ACTS = ['special-narrative-qz17', 'special-archive-relay', 'special-apc-convoy', 'special-black-cocoon'];
const ORDER = ['colony-c1', 'colony-c2', 'colony-c3', 'colony-c4'];

function fixture(id) {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'hub';
  save.worldId = 'world-05-lethe'; save.galaxy.shipWorldIdV116 = 'world-05-lethe';
  save.galaxy.completedCampaignIds = [...new Set([...save.galaxy.completedCampaignIds, ...ACTS, ...ORDER.slice(0, ORDER.indexOf(id))])];
  save.portMeridienV90 = { schema: 90, phase: 'complete', revision: 9, freight: 'medical', x: 2310, y: 532, facing: 1, climbing: false, z: 0,
    civiliansX: [2100, 2155, 2210], following: false, receipt: 'port-meridien:quai-des-vivants:v90' };
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
  check(`${id}: offered in the Command mission order`, options.includes(id), options.filter(entry => entry.startsWith('colony-c')));
  await page.locator('#command-mission-v110').selectOption(id); await page.waitForTimeout(400);
  if (id === 'colony-c3') {
    const plan = await page.locator('#operation-plan').innerText();
    const row = await page.locator('#operation-plan [data-crew-unavailable-v188]').evaluateAll(nodes => nodes.map(node => ({ id: node.dataset.crewUnavailableV188, text: node.textContent })));
    const en = await page.evaluate(async () => { const { EN_CATALOG_V185 } = await import('/src/i18n-en-catalog-v185.js');
      return { status: EN_CATALOG_V185['Noor Okafor · À L’INFIRMERIE'], reason: EN_CATALOG_V185['Indisponible pour C3 : elle tient l’infirmerie de Port-Méridien pour le contrôle biologique des rescapés du M577.'] }; });
    const squad = plan.split('\n').find(line => /ESCOUADE/.test(line)) || '';
    check('C3 preparation: Noor Okafor listed as unavailable at the infirmary, with the reason (FR on screen, EN catalogued)',
      row.length === 1 && row[0].id === 'crew-04-noor-okafor' && /Noor Okafor · À L’INFIRMERIE/.test(plan) && /INDISPONIBLE/.test(plan) && /contrôle biologique des rescapés du M577/.test(plan)
        && en.status === 'Noor Okafor · AT THE INFIRMARY' && /^Unavailable for C3/.test(en.reason || ''), { row, squad, en });
    await page.locator('#operation-plan').screenshot({ path: join(out, 'colony-c3-prep-noor.png') }); report.shots.push(join(out, 'colony-c3-prep-noor.png'));
  }
  await page.locator('#operation-launch').click(); await page.waitForTimeout(1200);
  for (let i = 0; i < 40; i++) {
    const live = await game(() => Boolean(globalThis.__ATF_GAME__?.mission && globalThis.__ATF_GAME__?.running && globalThis.__ATF_GAME__?.colonyLevelV188));
    if (live) break;
    if (await page.locator('.cinematic-v188').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(500); continue; }
    const action = page.locator('[data-insertion-action]').first();
    if (await action.count() && await action.isVisible()) { await action.click(); await page.waitForTimeout(500); continue; }
    await page.keyboard.press('KeyE'); await page.waitForTimeout(600);
  }
  // The in-level landing hands control over; then the canvas has the focus.
  await page.waitForFunction(() => { const e = globalThis.__ATF_GAME__; return e?.mission?.state === 'active' && !e.handoverV188?.blocking && (e.mission.elapsed || 0) > .2; }, null, { timeout: 30000 }).catch(() => {});
  await page.locator('#game-canvas').focus().catch(() => {});
  const state = await game(() => ({ campaign: globalThis.__ATF_GAME__?.colonyLevelV188?.campaignId, phase: globalThis.__ATF_GAME__?.colonyPhaseIdV188?.(), corridor: globalThis.__ATF_GAME__?.missionDepthSectionV188?.id || null }));
  check(`${id}: dedicated level running after the insertion`, state.campaign === id, state);
  return state;
}
// Injection (1): move the marine to a place of the level (places read from the level itself).
let P = null;
async function moveTo(x, deck = 'floorY') {
  const y = deck === 'floorY' ? P.floorY : typeof deck === 'number' ? deck : P.decks[deck];
  await game(([px, py]) => {
    const e = globalThis.__ATF_GAME__;
    Object.assign(e.player, { x: px - e.player.w / 2, y: py - e.player.h, vx: 0, vy: 0, grounded: true, depthZ: 0, climbing: false });
  }, [x, y]);
  await page.waitForTimeout(250);
}
const clearSpawns = () => game(() => { const e = globalThis.__ATF_GAME__; for (const enemy of [...e.enemies]) if (enemy.alive && enemy.colonyLevelSpawnV188) e.defeatEnemy(enemy, e.player); e.colonyLevelV188.lastHitAt = -Infinity; e.player.health = Math.max(e.player.health, 80); });
const prompt = () => game(() => globalThis.__ATF_GAME__.getInteractionPrompt());
const phase = () => game(() => globalThis.__ATF_GAME__.colonyPhaseIdV188());
async function press() { await page.keyboard.press('KeyE'); await page.waitForTimeout(800); }
async function holdE(seconds) {
  await page.keyboard.down('KeyE');
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
  check(`${id}: completed and recorded once`, save.galaxy.completedCampaignIds.includes(id) && save.colonyMissionsV188.rewarded.filter(entry => entry === id).length === 1, save.colonyMissionsV188.rewarded);
  return save;
}

for (const id of only) {
  await importProfile(fixture(id), `${id}.json`);
  await launch(id);
  P = await game(() => JSON.parse(JSON.stringify(globalThis.__ATF_GAME__.colonyLevelV188.places)));
  await shot(`${id}-00-start`);
  if (['colony-c1', 'colony-c3', 'colony-c4'].includes(id)) {
    const apc = await game(() => { const e = globalThis.__ATF_GAME__; return { active: Boolean(e.vehicle?.active), status: e.vehicle?.deploymentStatus || null, handover: e.handoverConfigV188?.mode || null,
      requested: e.handoverConfigV188?.requestedMode || null, cinematic: globalThis.__ATF_INSERTION_V188__?.last?.handover?.mode || null, selected: e.selectedVehicleRuntime?.id || null }; });
    check(`${id}: no M577 in the colony streets (stowed, landing on foot)`, !apc.active && apc.status === 'colony-street-v188' && apc.handover !== 'apc' && apc.cinematic !== 'apc', apc);
  }
  if (id === 'colony-c3') {
    const noor = await game(() => { const e = globalThis.__ATF_GAME__; return { posted: Boolean(e.colonyLevelV188.noorPosted),
      manifest: (e.squadManifestV132 || []).map(member => member.id), actors: (e.squadActors || []).map(member => member.crewId || member.memberId || member.id), message: e.colonyLevelV188.message?.text || null }; });
    check('C3: Noor Okafor posted at the infirmary, not in the squad', noor.posted && !noor.manifest.includes('crew-04-noor-okafor') && !noor.actors.some(entry => String(entry).includes('noor')) && /Noor Okafor reste à l’infirmerie/.test(noor.message || ''), noor);
    const quay = await game(async () => {
      const e = globalThis.__ATF_GAME__, p = e.colonyLevelV188.places, { COLONY_C3_M577_V188 } = await import('/src/colony-level-art-v188.js');
      const x0 = p.m577 - COLONY_C3_M577_V188.w / 2, x1 = p.m577 + COLONY_C3_M577_V188.w / 2;
      const floor = e.platforms.filter(entry => Math.abs(entry.y - p.floorY) < 1).map(entry => [entry.x, entry.x + entry.w]).sort((a, b) => a[0] - b[0]);
      let covered = 0, cursor = x0; for (const [a, b] of floor) { const s = Math.max(a, cursor), t = Math.min(b, x1); if (t > s) { covered += t - s; cursor = t; } }
      return { w: COLONY_C3_M577_V188.w, drivable: COLONY_C3_M577_V188.drivable, x0, x1, covered, quay: p.quay, arrivals: p.arrivals,
        doors: e.doors.filter(door => door.x < x1 && door.x + door.w > x0).map(door => door.id), vehicleActive: Boolean(e.vehicle?.active) };
    });
    check('C3: the M577 that brought the survivors is parked at the quay, to scale (449 px) on the quay floor, scenery (nothing drivable)',
      quay.w === 449 && quay.drivable === false && quay.covered >= 448 && !quay.doors.length && !quay.vehicleActive && quay.arrivals[0] >= quay.x1 - 20, quay);
    await moveTo(Math.round((quay.x0 + quay.x1) / 2) + 300); await page.waitForTimeout(500); await shot('colony-c3-00b-m577-quay');
  }
  if (id === 'colony-c1') {
    const span = await game(() => globalThis.__ATF_GAME__.missionDepthSectionV188?.deckPerspectiveSpan ?? null);
    check('C1: corridor deck perspective capped at half a screen', span === 640, span);
    const section = await game(() => { const s = globalThis.__ATF_GAME__.missionDepthSectionV188; return { x0: s.x0, x1: s.x1 }; });
    await moveTo(section.x0 + 260); await page.waitForTimeout(600); await shot('colony-c1-00a-corridor-west-end');
    await moveTo(section.x1 - 260); await page.waitForTimeout(600); await shot('colony-c1-00b-corridor-east-end');
    await moveTo(P.shutter.x - 200); await page.waitForTimeout(300); await clearSpawns();
  }
  if (id === 'colony-c4') {
    const barriers = await game(() => globalThis.__ATF_GAME__.colonyLevelV188.barriers.map(entry => ({ ...entry })));
    check('C4: welded grate in the utility gallery and welded roof door', barriers.length === 2, barriers.map(entry => ({ id: entry.id, x: entry.x, y: entry.y, h: entry.h })));
    const access = await game(async () => { const m = await import('/src/colony-mission-levels-v188.js'), e = globalThis.__ATF_GAME__;
      return { onFoot: m.colonyC4AccessV188(e, { ducts: false }).gathering, ducts: m.colonyC4AccessV188(e).gathering }; });
    check('C4 logical access: the gathering only through the ducts', access.onFoot === false && access.ducts === true, access);
    for (const barrier of barriers) {
      await moveTo(barrier.x - 160, barrier.floorY);
      await page.keyboard.down('KeyD');
      for (let t = 0; t < 8; t++) { await page.keyboard.press('Space'); await page.waitForTimeout(450); }
      await page.keyboard.up('KeyD');
      const at = await game(() => { const e = globalThis.__ATF_GAME__; return { x: e.player.x + e.player.w / 2, feet: e.player.y + e.player.h, prompt: e.getInteractionPrompt() }; });
      await shot(`colony-c4-00-${barrier.id}`);
      check(`C4 physical: ${barrier.id} stops the walk (D + jumps)`, at.x < barrier.x && Math.abs(at.feet - barrier.floorY) < 4 && at.prompt === barrier.requirement, { at, barrier: { x: barrier.x, floorY: barrier.floorY } });
    }
    await moveTo(P.clues.log); await page.waitForTimeout(200);
  }
  if (id === 'colony-c1') {
    const corridor = await game(() => { const s = globalThis.__ATF_GAME__.missionDepthSectionV188; return s && { id: s.id, length: s.x1 - s.x0, props: s.props.length }; });
    check('C1: V2 depth corridor on the street', corridor?.id === 'colony-c1-port-corridor' && corridor.length >= 4200, corridor);
    await moveTo(P.shutter.x + P.shutter.w / 2); check('C1: shutter prompt', /RIDEAU/.test(await prompt()), await prompt());
    await shot('colony-c1-01-warehouse'); await holdE(3);
    check('C1: phase evacuate after the shutter', await phase() === 'evacuate');
    await moveTo(P.infirmary); await shot('colony-c1-02-infirmary'); await press();
    // The patients walk at 1.9 m/s and only while the marine is in sight: lead them in short steps.
    for (let i = 0; i < 60; i++) {
      const lag = await game(() => Math.min(...globalThis.__ATF_GAME__.colonyLevelV188.progress.civilians.map(entry => entry.x)));
      if (lag >= P.platform.x0) break;
      await moveTo(Math.min(P.platform.x0 + 200, lag + 260)); await page.waitForTimeout(1200); await clearSpawns();
    }
    await moveTo(P.platform.x0 + 200); await page.waitForTimeout(3000);
    check('C1: three patients on the platform, weld phase', await phase() === 'weld', await game(() => globalThis.__ATF_GAME__.colonyLevelV188.progress.civilians.map(entry => entry.state)));
    await shot('colony-c1-03-platform');
    for (const index of [0, 1]) { await moveTo(P.kits[index]); await press(); }
    await moveTo(P.airlockB + 220); await press(); await moveTo(P.airlockB + 420); await press();
    await moveTo(P.airlockA + 50); await press(); await holdE(7);
    await shot('colony-c1-04-airlock-a');
    await moveTo(P.airlockB); await press(); await page.keyboard.down('KeyE'); await page.waitForTimeout(2500); await shot('colony-c1-05-weld-b'); await page.keyboard.up('KeyE');
    await holdE(6);
    check('C1: both airlocks welded, quiet run', await phase() === 'extract', await game(() => globalThis.__ATF_GAME__.colonyLevelV188.progress));
  }
  if (id === 'colony-c2') {
    await moveTo(P.gantry.x, 'top'); await page.waitForTimeout(600); await shot('colony-c2-01-gantry');
    check('C2: gantry reached', await phase() === 'ducts');
    await moveTo(P.ducts.x, 'mid'); await page.waitForTimeout(3500); await shot('colony-c2-02-ducts');
    await clearSpawns(); await page.waitForTimeout(800);
    check('C2: ambush cleared', await phase() === 'nest');
    await moveTo(P.nest.x, 'low'); await shot('colony-c2-03-nest'); await press(); await holdE(6);
    check('C2: nest purged', await phase() === 'control');
    for (const index of [0, 1, 2]) { await moveTo(P.breakers[index], 'low'); await press(); }
    await moveTo(P.console.x, 'low'); await shot('colony-c2-04-control'); await press();
    check('C2: processor restarted', await phase() === 'extract' && await game(() => globalThis.__ATF_GAME__.mission.objectives.power));
    await moveTo(P.steam[0].x, 'mid'); await page.waitForTimeout(1500); await shot('colony-c2-05-surge');
  }
  if (id === 'colony-c3') {
    await moveTo(P.arrivals[2]); await shot('colony-c3-01-m577'); await press();
    for (let i = 0; i < 60; i++) {
      const lag = await game(() => Math.min(...globalThis.__ATF_GAME__.colonyLevelV188.progress.civilians.map(entry => entry.x)));
      if (lag >= P.queue.at(-1) - 40) break;
      await moveTo(Math.min(P.plaza + 40, lag + 300)); await page.waitForTimeout(1200);
    }
    await moveTo(P.plaza + 40); await page.waitForTimeout(2500);
    check('C3: queue at the scanner', await phase() === 'scan', await game(() => globalThis.__ATF_GAME__.colonyLevelV188.progress.civilians.map(entry => entry.state)));
    // Injection (3): the aim key held towards the queue.
    await moveTo(P.queue.at(-1) - 120); await game(() => { globalThis.__ATF_GAME__.player.facing = 1; });
    await page.keyboard.down('ShiftLeft'); await page.waitForTimeout(4000); await page.keyboard.up('ShiftLeft');
    await shot('colony-c3-02-panic');
    const scatter = await game(() => globalThis.__ATF_GAME__.colonyLevelV188.progress.scatters);
    check('C3: aiming at the queue scatters the crowd (recoverable)', scatter >= 1, scatter);
    await page.waitForTimeout(4000);
    for (let i = 0; i < 6; i++) {
      const target = await game(() => globalThis.__ATF_GAME__.colonyLevelV188.progress.civilians.find(entry => entry.state === 'scatter')?.x ?? null);
      if (target === null) break;
      await moveTo(target); await press();
    }
    await moveTo(P.scanner - 40);
    for (let i = 0; i < 30; i++) {
      const progress = await game(() => globalThis.__ATF_GAME__.colonyLevelV188.progress);
      if (progress.scanned >= 5) break;
      if (!progress.civilians.some(entry => entry.state === 'scan')) await press(); else await page.waitForTimeout(900);
      if (i === 6) await shot('colony-c3-03-scanner');
    }
    for (let i = 0; i < 12 && await phase() !== 'carrier'; i++) await page.waitForTimeout(500); // the last scan settles before the phase turns
    check('C3: five screened, carrier revealed', await phase() === 'carrier', await game(() => ({ phase: globalThis.__ATF_GAME__.colonyPhaseIdV188(), scanned: globalThis.__ATF_GAME__.colonyLevelV188.progress.scanned, states: globalThis.__ATF_GAME__.colonyLevelV188.progress.civilians.map(entry => entry.state), hatch: globalThis.__ATF_GAME__.colonyLevelV188.progress.hatchRemaining })));
    for (let i = 0; i < 40; i++) {
      const at = await game(() => { const pr = globalThis.__ATF_GAME__.colonyLevelV188.progress; return pr.civilians[pr.carrier].x; });
      if (at >= P.noor - 140) break;
      await moveTo(Math.min(P.noor - 20, at + 200)); await page.waitForTimeout(1200);
    }
    await moveTo(P.noor - 20); await page.waitForTimeout(1500); await shot('colony-c3-04-noor'); await press();
    check('C3: carrier handed to Noor', await phase() === 'extract');
  }
  if (id === 'colony-c4') {
    await shot('colony-c4-01-night');
    for (const clue of ['log', 'sign', 'seal']) { await moveTo(P.clues[clue]); await press(); }
    check('C4: three clues', await phase() === 'vents');
    await moveTo(P.ventEntry); await page.waitForTimeout(400); await shot('colony-c4-02-vent');
    await game(() => { const e = globalThis.__ATF_GAME__; e.player.x = e.colonyLevelV188.places.cache.x - e.player.w / 2; e.player.y = e.colonyLevelV188.places.cache.y - e.player.h; });
    await page.waitForTimeout(400); await press(); await shot('colony-c4-03-cache');
    await moveTo(P.gathering.x0 + 10); await page.waitForTimeout(800); await shot('colony-c4-04-gathering');
    check('C4: gathering reached', await phase() === 'gathering');
    const subdued = await game(() => { const e = globalThis.__ATF_GAME__, convert = e.enemies.find(enemy => enemy.colonyCultistV188 && enemy.alive);
      if (!convert) return null; convert.facing = 1; convert.alert = false; convert.colonyGraceV188 = 0;
      Object.assign(e.player, { x: convert.x + convert.w / 2 - 40 - e.player.w / 2, facing: 1 }); return e.getInteractionPrompt(); });
    check('C4: a convert can be restrained', /MAÎTRISER/.test(subdued || ''), subdued); await press();
    await game(() => { const e = globalThis.__ATF_GAME__; for (const enemy of [...e.enemies]) if (enemy.colonyCultistV188) e.enemies.splice(e.enemies.indexOf(enemy), 1); });
    await moveTo(P.cocoon); await press(); await holdE(5);
    check('C4: élu freed', await phase() === 'extract');
  }
  const save = await extract(id);
  if (id === 'colony-c4') check('C4: the existing decision is pending after extraction', save.galaxy.completedCampaignIds.includes('colony-c4') && !save.colonyMissionsV188.c4);
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
