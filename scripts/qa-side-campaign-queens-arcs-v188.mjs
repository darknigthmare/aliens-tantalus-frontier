// V188 « La Saison des Reines » — Chromium QA of Arc 2 (Echo Basin), Arc 3 (TR-0), the choices, the single
// ending and the seized egg's crisis (spec 011, second lot). Arc 1 has its own QA (qa-side-campaign-queens-v188.mjs).
// Fixtures (declared): saves built by the developer fixtures of spec 012 (`buildDevSaveV188`, devtools/
// dev-fixtures-v188.js: the game's own rules, real prepare/confirm jumps, real hub crisis API; each records
// its own injections) and imported through the Options screen (#save-import):
//   C · `queens-rask-choice`    Arc 1 story line done in Nacre-7's orbit, the Rask decision pending.
//   D · seized egg, Arc 2 done up to 2.4, in Echo Basin's orbit, 2.5 planned (descriptor below).
//   E · `queens-egg-crisis`     seized egg, the Tantalus in TR-0's orbit, the hub crisis running.
//   F · `queens-specimen-choice` 3.1 and « Un spécimen pour Inez » done, the Praetorian decision pending.
//   G · `queens-ending-bishop`  the three arcs done, the campaign debrief pending.
//   H · `queens-crew-quests`    Arc 2 done: the three linked Tantalus quests offered.
// Injections (declared): (1) a generic mission objective is completed by marking its requirements met and
// calling `completeMission()` (no combat played, as in the Arc 1 QA); (2) in the hub, the crisis creatures
// are marked dead (`enemy.alive = false`), the hub loop then emits its own `crisis:resolved` event and the
// app's real handler closes the crisis. Everything else is clicked or pressed: cinematics skipped with
// Escape, decisions clicked (a colony decision the fixture leaves open is answered with its first option),
// jumps prepared on the galaxy map and settled by the real 8 s countdown.
// Usage: PORT=4781 node scripts/dev.mjs & ; BASE_URL=http://127.0.0.1:4781/ node scripts/qa-side-campaign-queens-arcs-v188.mjs <out-dir>
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { buildDevSaveV188 } from '../devtools/dev-fixtures-v188.js';
import { buildDevCatalogV188 } from '../devtools/dev-catalog-v188.js';
import { QUEENS_BURROWER_LINEAGE_IDS_V188, QUEENS_AERIAL_LINEAGE_IDS_V188, QUEENS_MOTHER_LINEAGE_IDS_V188 } from '../src/side-campaign-queens-v188.js';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4781/';
const out = process.argv[2] || 'qa-side-campaign-queens-arcs';
const NACRE = 'world-31-nacre-7', ECHO = 'world-27-echo-basin', TR0 = 'world-65-tr-0';
await mkdir(out, { recursive: true });
const report = { checks: [], pageErrors: [], consoleErrors: [], shots: [], fixtures: {} };
const check = (label, condition, evidence = null) => { report.checks.push({ label, passed: Boolean(condition), evidence }); console.log(JSON.stringify({ check: label, passed: Boolean(condition), evidence })); };
const catalog = buildDevCatalogV188();
function fixture(name, launch) {
  const built = buildDevSaveV188(launch || catalog.find(entry => entry.id === name).launch, { language: 'fr' });
  report.fixtures[name] = { completed: built.completed, injections: built.injections };
  return built.save;
}
const QUEENS_BASE = { milestone: 'complete', queens: 'arrived' };

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 900 } });
const page = await context.newPage(); page.setDefaultTimeout(30000);
page.on('pageerror', error => report.pageErrors.push(error.message));
page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text().slice(0, 300)); });
const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem('atf-v47-profile-1')));
const queens = async () => (await stored()).sideCampaignsV188.queens;
const shot = async (name, locator = null) => { const file = join(out, `${name}.png`); await (locator ? page.locator(locator).screenshot({ path: file }) : page.screenshot({ path: file })); report.shots.push(file); };
async function navigate(view) {
  const exit = page.getByRole('button', { name: /quitter vers commandement/i }).first();
  if (!(await page.locator(`[data-view="${view}"]`).isVisible().catch(() => false)) && await exit.isVisible().catch(() => false)) { await exit.click(); await page.waitForTimeout(600); }
  if (await page.locator('dialog.content-scene-v188').count() || await page.locator('.cinematic-v188').count()) return;
  if (await page.locator('#menu-toggle').isVisible() && !(await page.locator('.rail').getAttribute('class')).split(/\s+/).includes('open')) await page.locator('#menu-toggle').click();
  await page.locator(`[data-view="${view}"]`).click(); await page.waitForTimeout(300);
}
const cinematicTitle = () => page.locator('.cinematic-v188').getAttribute('aria-label').catch(() => null);
async function skipCinematics() { const seen = []; for (let i = 0; i < 6 && await page.locator('.cinematic-v188').count(); i++) { seen.push(await cinematicTitle()); await page.keyboard.press('Escape'); await page.waitForTimeout(450); } return seen; }
/** Closes scenes and cinematics in turn; returns what was shown (cinematic titles prefixed with « CIN »). Stops on a decision. */
async function readTable(max = 10) {
  const seen = [];
  for (let i = 0; i < max; i++) {
    for (const title of await skipCinematics()) seen.push(`CIN ${title}`);
    const dialog = page.locator('dialog.content-scene-v188');
    if (!(await dialog.count())) { await page.waitForTimeout(500); if (!(await dialog.count()) && !(await page.locator('.cinematic-v188').count())) break; continue; }
    const choices = await dialog.locator('[data-content-choice-v188]').evaluateAll(nodes => nodes.map(node => node.dataset.contentChoiceV188));
    const title = await dialog.locator('h2').textContent();
    if (choices.length > 1 && /Rask|Praetorian/.test(title)) { seen.push(`CHOICE ${title}`); break; }
    // A decision of another front left open by the fixture (the colony's C4 decision): answered with its first option.
    if (choices.length > 1) { seen.push(`OTHER ${title}`); await dialog.locator('[data-content-choice-v188]').first().click(); await page.waitForTimeout(350); continue; }
    seen.push(title);
    await dialog.locator('button').last().click(); await page.waitForTimeout(350);
  }
  return seen;
}
async function importProfile(save, name) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 });
  await page.locator('#title-options').click();
  await page.locator('#save-import').setInputFiles({ name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).last().waitFor();
}
const panel = page.locator('#side-campaign-queens-v188');
const missionOptions = async worldId => {
  await page.locator('#command-world-v110').selectOption(worldId).catch(() => {}); await page.waitForTimeout(300);
  return page.locator('#command-mission-v110 option').evaluateAll(nodes => nodes.map(node => node.value));
};
async function launchAndComplete(id, worldId, allowed) {
  await navigate('command'); await page.waitForTimeout(400); await readTable();
  const options = await missionOptions(worldId);
  check(`${id}: offered in the Command mission order`, options.includes(id), options.filter(entry => /queens|special-(?:black|brood|queen|hive)/.test(entry)));
  if (!options.includes(id)) return false;
  await page.locator('#command-mission-v110').selectOption(id); await page.waitForTimeout(400);
  await page.locator('#operation-launch').click(); await page.waitForTimeout(1200);
  for (let i = 0; i < 40; i++) {
    const live = await page.evaluate(() => Boolean(globalThis.__ATF_GAME__?.mission && globalThis.__ATF_GAME__?.running));
    if (live) break;
    if (await page.locator('.cinematic-v188').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(500); continue; }
    const action = page.locator('[data-insertion-action]').first();
    if (await action.count() && await action.isVisible()) { await action.click(); await page.waitForTimeout(500); continue; }
    await page.keyboard.press('KeyE'); await page.waitForTimeout(600);
  }
  for (let i = 0; i < 20; i++) {
    const ready = await page.evaluate(() => { const e = globalThis.__ATF_GAME__; return e?.mission?.state === 'active' && !e.handoverV188?.blocking && (e.mission.elapsed || 0) > .2; });
    if (ready) break;
    await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  }
  await page.waitForTimeout(800);
  const live = await page.evaluate(() => { const e = globalThis.__ATF_GAME__; return { enemies: [...new Set((e?.spawnedEnemiesV188 || e?.enemies || []).map(enemy => String(enemy.id).split(':')[0]))] }; });
  const operation = (await stored()).strategy.currentOperation;
  check(`${id}: launched on its world, lineage roster only`, operation?.campaignId === id && operation?.worldId === worldId
    && live.enemies.length > 0 && live.enemies.every(enemy => allowed.includes(enemy)), { operation: operation?.worldId, live });
  await shot(`mission-${id}`);
  // Injection (1).
  const completed = await page.evaluate(() => { const engine = globalThis.__ATF_GAME__; if (!engine?.mission) return { ok: false };
    Object.assign(engine.mission.objectives, { power: true, route: true });
    engine.objectiveState.rescued = Math.max(engine.objectiveState.rescued || 0, engine.objectiveRuntime.nodeCount || 0);
    if (engine.archiveTerminal) engine.archiveTerminal.recovered = true; // the data terminal read
    engine.objectiveState.complete = true; if (engine.objective) engine.objective.complete = true;
    return { ok: engine.completeMission(), state: engine.mission.state, missing: engine.missingObjectiveRequirement?.() || null }; });
  check(`${id}: completion through the engine (declared injection)`, completed.ok, completed);
  await page.waitForFunction(target => JSON.parse(localStorage.getItem('atf-v47-profile-1'))?.galaxy?.completedCampaignIds?.includes(target), id, { timeout: 15000 }).catch(() => {});
  for (let i = 0; i < 25; i++) {
    if (await page.getByText('PASSER (ÉCHAP)').first().isVisible().catch(() => false)) { await page.keyboard.press('Escape'); await page.waitForTimeout(600); continue; }
    const back = page.locator('#retreat-mission');
    if (await back.isVisible().catch(() => false) && /RETOUR/.test(await back.textContent())) { await back.click(); await page.waitForTimeout(1200); continue; }
    if (await page.locator('[data-view="command"]').isVisible().catch(() => false) || await page.locator('dialog.content-scene-v188').count()) break;
    await page.waitForTimeout(600);
  }
  check(`${id}: recorded in the campaign`, (await queens()).done.includes(id), (await queens()).done);
  return true;
}
async function mapWorlds() { return page.evaluate(() => [...document.querySelectorAll('#star-map [data-world-id]')].map(node => node.dataset.worldId)); }
async function jump(worldId) {
  await navigate('galaxy'); await page.waitForTimeout(600);
  const picked = await page.evaluate(target => { const node = [...document.querySelectorAll('#star-map [data-world-id]')].find(entry => entry.dataset.worldId === target); node?.click(); return Boolean(node); }, worldId);
  await page.waitForTimeout(500);
  const confirm = page.locator('[data-confirm-jump-v115]');
  const route = await page.locator('#galaxy-jump-panel-v116').innerText().catch(() => '');
  const ready = picked && await confirm.isEnabled().catch(() => false);
  if (ready) { await confirm.click(); await page.waitForTimeout(9800); }
  return { picked, ready, route: route.slice(0, 260) };
}

// —— C. The Rask decision ends Arc 1 and opens Echo Basin; TR-0 is not on the map ——
await importProfile(fixture('queens-rask-choice'), 'queens-c.json');
await navigate('command'); await page.waitForTimeout(1000);
const tableC = await readTable();
check('C: the Rask decision is waiting at the table', tableC.at(-1) === 'CHOICE L’œuf royal de Rask', tableC);
await page.locator('dialog.content-scene-v188 [data-content-choice-v188="seize"]').click(); await page.waitForTimeout(400);
await page.locator('dialog.content-scene-v188 [data-content-choice-v188="continue"]').click(); await page.waitForTimeout(700);
const debrief1 = await page.locator('dialog.content-scene-v188 p').first().textContent().catch(() => '');
check('C: the Arc 1 debrief announces the route to Echo Basin (no more « not playable »)', /route d’Echo Basin est ouverte/.test(debrief1) && !/pas encore jouable/.test(debrief1), debrief1.slice(-180));
await readTable();
const afterChoice = await stored();
check('C: egg seized, risk recorded, no crisis yet, Echo Basin route open, TR-0 closed', afterChoice.sideCampaignsV188.queens.raskEgg === 'seize' && !afterChoice.sideCampaignsV188.queens.eggCrisis
  && !afterChoice.hub.activeCrisis && afterChoice.galaxy.unlockedWorldIds.includes(ECHO) && !afterChoice.galaxy.unlockedWorldIds.includes(TR0));
await panel.scrollIntoViewIfNeeded();
const panelC = await panel.innerText();
check('C: the panel moves on to Arc 2, names no TR-0, and shows the risk aboard', /Arc 2 · Echo Basin/i.test(panelC) && /2\.1 · ECHO BASIN · RELAIS GORGE-SEIZE/.test(panelC)
  && /2\.3 · Les nids sous les surplombs \(chapitre « Broodstorm »\)/.test(panelC) && /saut vers Echo Basin \(\d+ carburant · 14 jours en hypersommeil\)/.test(panelC)
  && /monde inconnu/.test(panelC) && !/TR-0/.test(panelC) && /Risque biologique à bord/.test(panelC), panelC);
await shot('c1-panel-arc2-open', '#side-campaign-queens-v188');
await navigate('galaxy'); await page.waitForTimeout(600);
const worldsC = await mapWorlds();
await page.locator('#world-search').fill('TR-0'); await page.waitForTimeout(400);
const searchC = await mapWorlds();
await page.locator('#world-search').fill(''); await page.waitForTimeout(300);
check('C: the galaxy map shows the 64 known worlds; TR-0 is neither drawn nor found by the search', worldsC.length === 64 && !worldsC.includes(TR0) && searchC.length === 0, { worlds: worldsC.length, search: searchC });
await shot('c2-galaxy-no-tr0');
const beforeEcho = await stored();
const toEcho = await jump(ECHO);
const atEcho = await stored();
check('C: real jump to Echo Basin: fuel, 14 days, arrival recorded with the relay message', toEcho.ready && atEcho.galaxy.shipWorldIdV116 === ECHO
  && atEcho.galaxy.resources.fuel < beforeEcho.galaxy.resources.fuel && atEcho.clock.day === beforeEcho.clock.day + 14
  && atEcho.sideCampaignsV188.queens.arrivedEchoDay === atEcho.clock.day
  && atEcho.travelMessagesV188.messages.filter(message => message.id.startsWith('campaign-queens-arrival-echo-')).length === 1, toEcho);
await navigate('command'); await page.waitForTimeout(900);
const tableEcho = await readTable();
check('C: the arrival scene opens once at the table', tableEcho.includes('Echo Basin · orbite'), tableEcho);
const optionsEcho = await missionOptions(ECHO);
check('C: only 2.1 is offered on Echo Basin; Broodstorm waits for its place', optionsEcho.includes('queens-2-1-relais') && !optionsEcho.includes('special-broodstorm-v131')
  && !optionsEcho.includes('queens-2-2-sol') && !optionsEcho.includes('queens-a-mineurs'), optionsEcho.filter(entry => /queens|brood/.test(entry)));
const optionsNacre = await missionOptions(NACRE);
check('C: Abysse Noir, played in its place, is replayable from another orbit; Nacre-7 contracts are not', optionsNacre.includes('special-black-abyss-v131') && !optionsNacre.some(entry => entry.startsWith('queens-')), optionsNacre.filter(entry => /queens|abyss/.test(entry)));
await launchAndComplete('queens-2-1-relais', ECHO, [...new Set([...QUEENS_BURROWER_LINEAGE_IDS_V188, ...QUEENS_AERIAL_LINEAGE_IDS_V188])]);
await navigate('command'); await page.waitForTimeout(800);
const scene21 = await readTable();
check('C: 2.1 return scene (the relay tower)', scene21.some(title => /tour relais/.test(title)), scene21);
const afterRelay = await missionOptions(ECHO);
check('C: after 2.1, 2.2 and the side missions open; Rask’s debt stays closed (the egg was seized)', afterRelay.includes('queens-2-2-sol') && afterRelay.includes('queens-a-mineurs')
  && afterRelay.includes('queens-l-galerie') && !afterRelay.includes('queens-a-rask'), afterRelay.filter(entry => /queens/.test(entry)));

// —— D. 2.5 ends Arc 2: TR-0 appears; the jump there wakes the crew to the egg crisis ——
await importProfile(fixture('D-arc2-before-2-5', { kind: 'mission', campaignId: 'queens-2-5-carte', ...QUEENS_BASE, queensArc: 2, choices: { rask: 'seize' },
  queensBefore: ['queens-2-1-relais', 'queens-2-2-sol', 'special-broodstorm-v131', 'queens-2-4-aire'], queensSeen: ['arc1-debrief'] }), 'queens-d.json');
await launchAndComplete('queens-2-5-carte', ECHO, [...new Set([...QUEENS_BURROWER_LINEAGE_IDS_V188, ...QUEENS_AERIAL_LINEAGE_IDS_V188])]);
await navigate('command'); await page.waitForTimeout(900);
const tableD = await readTable();
check('D: 2.5 return scene then the Arc 2 debrief', tableD.includes('La carte des lignées') && tableD.some(title => /Arc 2, « L’écho des canyons »/.test(title)), tableD);
const afterArc2 = await stored();
check('D: Arc 2 over: TR-0 revealed in the result transaction', afterArc2.galaxy.unlockedWorldIds.includes(TR0) && afterArc2.sideCampaignsV188.queens.scenesSeen.includes('arc2-debrief'));
const replayEcho = await missionOptions(ECHO);
check('D: Broodstorm, played in its place, stays offered for a free replay', replayEcho.includes('special-broodstorm-v131') && !replayEcho.includes('queens-2-5-carte'), replayEcho.filter(entry => /queens|brood/.test(entry)));
await panel.scrollIntoViewIfNeeded();
const panelD = await panel.innerText();
check('D: the panel shows Arc 3 on TR-0 and the route', /Arc 3 · TR-0, la Ruche-monde/i.test(panelD) && /3\.1 · TR-0 · ATTERRISSAGE SUR LA PEAU/.test(panelD) && /saut vers TR-0 \(\d+ carburant/.test(panelD), panelD);
await shot('d1-panel-arc3-open', '#side-campaign-queens-v188');
await navigate('galaxy'); await page.waitForTimeout(600);
const worldsD = await mapWorlds();
check('D: TR-0 is now on the galaxy map (65 worlds)', worldsD.length === 65 && worldsD.includes(TR0), worldsD.length);
await shot('d2-galaxy-tr0-revealed');
const toTr0 = await jump(TR0);
const atTr0 = await stored();
const eggState = atTr0.sideCampaignsV188.queens.eggCrisis, hubCrisis = atTr0.hub.activeCrisis;
check('D: real jump to TR-0: arrival recorded, the seized egg hatches in the same transaction (hub crisis, deck 2, quarantine)', toTr0.ready && atTr0.galaxy.shipWorldIdV116 === TR0
  && atTr0.sideCampaignsV188.queens.arrivedTr0Day === atTr0.clock.day && eggState?.phase === 'alert' && hubCrisis?.id === eggState.crisisId
  && hubCrisis.kind === 'xenomorph' && hubCrisis.deck === 2 && hubCrisis.roomId === 'quarantine' && hubCrisis.resolved === false, { toTr0, eggState, hubCrisis });
await navigate('command'); await page.waitForTimeout(900);
const firstCinematic = await cinematicTitle();
if (firstCinematic) { await page.waitForTimeout(2500); await shot('d3-cq04-tr0-orbit'); }
const tableTr0 = await readTable();
check('D: CQ-04 « La peau du monde », the arrival scene, then the biological alert', firstCinematic === 'La peau du monde' && tableTr0.includes('TR-0 · orbite')
  && tableTr0.includes('Alerte biologique · pont de quarantaine'), { firstCinematic, tableTr0 });
const lockedTr0 = await missionOptions(TR0);
check('D: Arc 3 waits for the crisis: no TR-0 mission offered', !lockedTr0.some(entry => /queens-3|queens-a-|special-queen-mother|special-hive-world/.test(entry)), lockedTr0.filter(entry => /queens|special-queen|special-hive/.test(entry)));
await panel.scrollIntoViewIfNeeded();
check('D: the panel shows the alert', /ALERTE : l’œuf a éclos/.test(await panel.innerText()), (await panel.innerText()).slice(-260));
await shot('d4-panel-alert', '#side-campaign-queens-v188');

// —— E. The crisis in the hub: the existing hub crisis, ended by the hub's own event ——
await importProfile(fixture('queens-egg-crisis'), 'queens-e.json');
await navigate('hub'); await page.waitForTimeout(2500);
const hubBefore = await page.evaluate(() => { const hub = globalThis.__ATF_HUB__; return { crisis: hub?.crisis ? { id: hub.crisis.id, kind: hub.crisis.kind, active: hub.crisis.active } : null,
  creatures: (hub?.enemies || []).filter(enemy => enemy.source === 'crisis' && enemy.alive).length, deck: hub?.state?.deck, room: hub?.state?.roomId }; });
const savedE = await stored();
check('E: the hub runs the egg crisis with its creatures aboard', hubBefore.crisis?.active === true && hubBefore.crisis.kind === 'xenomorph'
  && hubBefore.crisis.id === savedE.sideCampaignsV188.queens.eggCrisis.crisisId && hubBefore.creatures >= 1, hubBefore);
await shot('e1-hub-egg-crisis');
// Injection (2).
await page.evaluate(() => { for (const enemy of globalThis.__ATF_HUB__.enemies) if (enemy.source === 'crisis') { enemy.alive = false; enemy.health = 0; } });
await page.waitForFunction(() => JSON.parse(localStorage.getItem('atf-v47-profile-1'))?.sideCampaignsV188?.queens?.eggCrisis?.phase === 'resolved', null, { timeout: 15000 }).catch(() => {});
const resolvedE = await stored();
check('E: the hub event closes the campaign crisis (creature neutralised) and the hub crisis', resolvedE.sideCampaignsV188.queens.eggCrisis?.phase === 'resolved'
  && resolvedE.sideCampaignsV188.queens.eggCrisis.outcome === 'neutralised' && (!resolvedE.hub.activeCrisis || resolvedE.hub.activeCrisis.resolved === true),
  { egg: resolvedE.sideCampaignsV188.queens.eggCrisis, hub: resolvedE.hub.activeCrisis });
await navigate('command'); await page.waitForTimeout(900);
const tableE = await readTable();
check('E: the aftermath scene follows at the table', tableE.includes('Pont de quarantaine · après l’alerte'), tableE);
const openTr0 = await missionOptions(TR0);
check('E: Arc 3 opens: 3.1 offered, the chapters wait for their place', openTr0.includes('queens-3-1-peau') && !openTr0.includes('special-queen-mother-v131') && !openTr0.includes('special-hive-world-v131'), openTr0.filter(entry => /queens|special-queen|special-hive/.test(entry)));
await launchAndComplete('queens-3-1-peau', TR0, [...QUEENS_MOTHER_LINEAGE_IDS_V188]);
await navigate('command'); await page.waitForTimeout(800);
const scene31 = await readTable();
check('E: 3.1 return scene (the way into Ombelle Base)', scene31.some(title => /Base Ombelle/.test(title)), scene31);

// —— F. The live Praetorian: Inez or BISHOP-9 ——
await importProfile(fixture('queens-specimen-choice'), 'queens-f.json');
await navigate('command'); await page.waitForTimeout(1000);
const tableF = await readTable();
const choiceF = page.locator('dialog.content-scene-v188');
const buttonsF = await choiceF.locator('[data-content-choice-v188]').evaluateAll(nodes => nodes.map(node => node.dataset.contentChoiceV188)).catch(() => []);
check('F: the Praetorian decision offers Inez and BISHOP-9, without a dismiss button', tableF.at(-1) === 'CHOICE Le Praetorian vivant' && JSON.stringify(buttonsF) === JSON.stringify(['inez', 'bishop'])
  && !(await choiceF.locator('[data-content-dismiss-v188]').count()), { tableF, buttonsF });
await shot('f1-specimen-choice');
const trustBefore = (await stored()).crew.find(member => member.id === 'crew-05-bishop-9').loyalty;
await choiceF.locator('[data-content-choice-v188="bishop"]').click(); await page.waitForTimeout(400);
const resultF = await page.locator('dialog.content-scene-v188 p').first().textContent().catch(() => '');
await readTable();
const afterF = await stored();
check('F: BISHOP-9 keeps it: saved once, his trust rises', afterF.sideCampaignsV188.queens.specimen === 'bishop' && /BISHOP-9 scelle le caisson/.test(resultF)
  && afterF.crew.find(member => member.id === 'crew-05-bishop-9').loyalty === Math.min(100, trustBefore + 10), { resultF: resultF.slice(0, 120), trustBefore });

// —— G. The single ending, nuanced by the choices; English; reload ——
await importProfile(fixture('queens-ending-bishop'), 'queens-g.json');
await navigate('command'); await page.waitForTimeout(1000);
const cinematicsG = [];
for (let i = 0; i < 8; i++) {
  for (const title of await skipCinematics()) cinematicsG.push(title);
  const dialog = page.locator('dialog.content-scene-v188');
  if (!(await dialog.count())) { await page.waitForTimeout(500); if (!(await dialog.count()) && !(await page.locator('.cinematic-v188').count())) break; continue; }
  const title = await dialog.locator('h2').textContent();
  if (/La Saison des Reines$/.test(title)) break;
  await dialog.locator('button').last().click(); await page.waitForTimeout(350);
}
const endingTitle = await page.locator('dialog.content-scene-v188 h2').textContent().catch(() => '');
const endingText = await page.locator('dialog.content-scene-v188 p').first().textContent().catch(() => '');
check('G: the campaign debrief: lineages extinct, Base Ombelle shipped the eggs, Khepri Forge, the choices', /Retour au Tantalus · La Saison des Reines/.test(endingTitle)
  && /Les trois lignées sont éteintes/.test(endingText) && /Base Ombelle/.test(endingText) && /Khepri Forge/.test(endingText) && /BISHOP-9 garde le Praetorian/.test(endingText)
  && /a brûlé sur sa plate-forme/.test(endingText), endingText);
await shot('g1-campaign-debrief');
await readTable();
await panel.scrollIntoViewIfNeeded();
const panelG = await panel.innerText();
check('G: the panel reads « campagne terminée »', /LA SAISON DES REINES · CAMPAGNE TERMINÉE/.test(panelG) && /Praetorian vivant confié à BISHOP-9/.test(panelG), panelG);
const replayG = [...await missionOptions(TR0), ...await missionOptions(ECHO), ...await missionOptions(NACRE)];
check('G: the four reused chapters are freely replayable from the registry', ['special-black-abyss-v131', 'special-broodstorm-v131', 'special-queen-mother-v131', 'special-hive-world-v131'].every(id => replayG.includes(id)), replayG.filter(entry => /^special-(?:black|brood|queen|hive)/.test(entry)));
await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 }).catch(() => {});
await page.getByRole('button', { name: /^continuer$/i }).first().click({ timeout: 20000 }).catch(() => {});
await page.waitForTimeout(2500);
await navigate('command'); await page.waitForTimeout(800);
const replay = (await page.locator('dialog.content-scene-v188').count()) + (await page.locator('.cinematic-v188').count());
check('G: after reload, no scene, decision or cinematic is replayed', replay === 0, replay);
await navigate('settings'); await page.locator('#language-select-v185').selectOption('en'); await page.waitForTimeout(400);
await navigate('command'); await page.waitForTimeout(600);
const english = await panel.innerText();
check('G: the panel in English', /THE SEASON OF QUEENS · CAMPAIGN COMPLETE/.test(english) && /Live Praetorian given to BISHOP-9/.test(english), english.slice(0, 400));
await panel.scrollIntoViewIfNeeded(); await shot('g2-panel-complete-en', '#side-campaign-queens-v188');
await navigate('settings'); await page.locator('#language-select-v185').selectOption('fr'); await page.waitForTimeout(400);

// —— H. The linked Tantalus quests are listed after Arc 2 ——
await importProfile(fixture('queens-crew-quests'), 'queens-h.json');
await navigate('command'); await page.waitForTimeout(900); await readTable();
const questsText = await page.locator('#crew-quests-v188').innerText().catch(() => '');
check('H: the three linked quests are listed as offered at the briefing table', /Tirer sur ce qui vole/.test(questsText) && /Le vent des canyons/.test(questsText) && /L’arbre des lignées/.test(questsText), questsText.slice(-500));
await page.locator('#crew-quests-v188').scrollIntoViewIfNeeded().catch(() => {}); await shot('h1-crew-quests', '#crew-quests-v188');

check('no page error', report.pageErrors.length === 0, report.pageErrors.slice(0, 5));
await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2));
await browser.close();
const failed = report.checks.filter(entry => !entry.passed);
console.log(`checks ${report.checks.length - failed.length}/${report.checks.length}`);
assert.equal(failed.length, 0, failed.map(entry => entry.label).join(' | '));
