// V188 first side campaign « La Saison des Reines » — Chromium QA of the campaign frame and Arc 1 (spec 011).
// Fixtures (declared): profiles built from createDefaultSave(), imported through the Options screen
// (#save-import), with these injected fields only:
//   A · main campaign over: galaxy.completedCampaignIds += the five Cocyte chapters (QZ-17, QZ-18, M577
//       convoy, C-12, black cocoon), storyCampaignV188.debriefSeen = those five, act5 = { phase: 'complete',
//       decision: hold / freight-first }, cinematicsSeen = every cinematic except CQ-01..CQ-06; clock.day = 120;
//       worldId / galaxy.shipWorldIdV116 = world-05-lethe; hub pose in the drop hangar.
//   B · same, plus sideCampaignsV188.queens = accepted, in Nacre-7's orbit, 1.1, 1.2 and the Abysse Noir
//       chapter done, their two first return scenes seen (the chapter's V131 completion receipt cannot be
//       produced without playing it; the Node suite covers the receipt rule).
// Injections (declared): (1) a generic mission objective is completed by marking its requirements met
// (`mission.objectives.power/route`, `objectiveState.rescued`, `objectiveState.complete`) and calling
// `completeMission()` (no combat played, as in qa-colony-crew-v188.mjs); everything else
// is clicked or pressed: the cinematics are skipped with Escape, the call accepted with its button, the jump
// prepared from the galaxy view and settled by the real 8 s countdown, the Rask choice clicked.
// Usage: PORT=4691 node scripts/dev.mjs & ; BASE_URL=http://127.0.0.1:4691/ node scripts/qa-side-campaign-queens-v188.mjs <out-dir>
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { createDefaultSave } from '../src/save.js';
import { CINEMATIC_IDS_V188 } from '../src/story-cinematics-v188.js';
import { QUEENS_CINEMATIC_IDS_V188 } from '../src/queens-cinematics-v188.js';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4691/';
const out = process.argv[2] || 'qa-side-campaign-queens';
const NACRE = 'world-31-nacre-7';
await mkdir(out, { recursive: true });
const report = { checks: [], pageErrors: [], consoleErrors: [], shots: [] };
const check = (label, condition, evidence = null) => { report.checks.push({ label, passed: Boolean(condition), evidence }); console.log(JSON.stringify({ check: label, passed: Boolean(condition), evidence })); };
const CHAPTERS = ['special-narrative-qz17', 'special-archive-relay', 'special-apc-convoy', 'special-c12-horde', 'special-black-cocoon'];

function fixture(variant = 'A') {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'hub';
  save.worldId = 'world-05-lethe'; save.galaxy.shipWorldIdV116 = 'world-05-lethe';
  save.galaxy.completedCampaignIds = [...new Set([...save.galaxy.completedCampaignIds, ...CHAPTERS])];
  save.storyCampaignV188.debriefSeen = [...CHAPTERS];
  save.storyCampaignV188.cinematicsSeen = CINEMATIC_IDS_V188.filter(id => !QUEENS_CINEMATIC_IDS_V188.includes(id)).slice(-32);
  save.storyCampaignV188.act5 = { schema: 188, phase: 'complete', decision: { option: 'hold', ending: 'freight-first', decidedBy: 'vega', dossierCount: 5 } };
  Object.assign(save.hub, { deck: 3, roomId: 'dropship-hangar', positionX: 470, facing: 1 });
  save.clock.day = 120; // a late-game day, so the call's 9-day delay is visible
  if (variant === 'B') {
    save.worldId = NACRE; save.galaxy.shipWorldIdV116 = NACRE;
    if (!save.galaxy.unlockedWorldIds.includes(NACRE)) save.galaxy.unlockedWorldIds.push(NACRE);
    save.galaxy.completedCampaignIds.push('queens-1-1-quai', 'queens-1-2-bassins', 'special-black-abyss-v131');
    save.sideCampaignsV188 = { schema: 188, queens: { phase: 'accepted', callDay: 100, acceptedDay: 100, arrivedDay: 114,
      done: ['queens-1-1-quai', 'queens-1-2-bassins', 'special-black-abyss-v131'], contracts: {}, raskEgg: null, scenesSeen: ['queens-1-1-quai', 'queens-1-2-bassins'] } };
  }
  return save;
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 900 } });
const page = await context.newPage(); page.setDefaultTimeout(30000);
page.on('pageerror', error => report.pageErrors.push(error.message));
page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text().slice(0, 300)); });
const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem('atf-v47-profile-1')));
const shot = async (name, locator = null) => { const file = join(out, `${name}.png`); await (locator ? page.locator(locator).screenshot({ path: file }) : page.screenshot({ path: file })); report.shots.push(file); };
async function navigate(view) {
  const exit = page.getByRole('button', { name: /quitter vers commandement/i }).first();
  if (!(await page.locator(`[data-view="${view}"]`).isVisible().catch(() => false)) && await exit.isVisible().catch(() => false)) { await exit.click(); await page.waitForTimeout(600); }
  if (await page.locator('dialog.content-scene-v188').count() || await page.locator('.cinematic-v188').count()) return;
  if (await page.locator('#menu-toggle').isVisible() && !(await page.locator('.rail').getAttribute('class')).split(/\s+/).includes('open')) await page.locator('#menu-toggle').click();
  await page.locator(`[data-view="${view}"]`).click(); await page.waitForTimeout(300);
}
async function skipCinematics() { let skipped = 0; for (let i = 0; i < 6 && await page.locator('.cinematic-v188').count(); i++) { await page.keyboard.press('Escape'); skipped++; await page.waitForTimeout(400); } return skipped; }
async function closeDialogs(max = 6) {
  const seen = [];
  for (let i = 0; i < max; i++) {
    await skipCinematics();
    const dialog = page.locator('dialog.content-scene-v188');
    if (!(await dialog.count())) break;
    seen.push(await dialog.locator('h2').textContent());
    await dialog.locator('button').last().click(); await page.waitForTimeout(300);
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
async function launchAndComplete(id) {
  await navigate('command'); await page.waitForTimeout(400); await closeDialogs();
  await page.locator('#command-world-v110').selectOption(NACRE).catch(() => {});
  await page.waitForTimeout(300);
  const options = await page.locator('#command-mission-v110 option').evaluateAll(nodes => nodes.map(node => node.value));
  check(`${id}: offered in the Command mission order under Nacre-7`, options.includes(id), options);
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
  const live = await page.evaluate(() => { const e = globalThis.__ATF_GAME__; return { world: e?.world?.id || e?.worldState?.id || null, campaign: e?.campaign?.id || null,
    enemies: [...new Set((e?.spawnedEnemiesV188 || e?.enemies || []).map(enemy => String(enemy.id).split(':')[0]))] }; });
  const operation = (await stored()).strategy.currentOperation;
  check(`${id}: launched on Nacre-7, reef lineage roster only`, operation?.campaignId === id && operation?.worldId === NACRE
    && live.enemies.every(enemy => ['enemy-004-drone-big-chap', 'enemy-011-lurker', 'enemy-006-runner', 'enemy-027-reef-stalker', 'enemy-028-reef-spitter', 'enemy-043-weyland-yutani-commando'].includes(enemy)), { operation: operation?.worldId, live });
  await shot(`mission-${id}`);
  // Injection (1).
  const completed = await page.evaluate(() => { const engine = globalThis.__ATF_GAME__; if (!engine?.mission) return { ok: false };
    // The generic objective's requirements are marked as met (power, route, rescued nodes, hold), as a player would leave them.
    Object.assign(engine.mission.objectives, { power: true, route: true });
    engine.objectiveState.rescued = Math.max(engine.objectiveState.rescued || 0, engine.objectiveRuntime.nodeCount || 0);
    engine.objectiveState.complete = true; if (engine.objective) engine.objective.complete = true;
    return { ok: engine.completeMission(), state: engine.mission.state, missing: engine.missingObjectiveRequirement?.() || null, blocking: Boolean(engine.handoverV188?.blocking) }; });
  check(`${id}: completion through the engine (declared injection)`, completed.ok, completed);
  await page.waitForFunction(target => JSON.parse(localStorage.getItem('atf-v47-profile-1'))?.galaxy?.completedCampaignIds?.includes(target), id, { timeout: 15000 }).catch(() => {});
  for (let i = 0; i < 25; i++) {
    if (await page.getByText('PASSER (ÉCHAP)').first().isVisible().catch(() => false)) { await page.keyboard.press('Escape'); await page.waitForTimeout(600); continue; }
    const back = page.locator('#retreat-mission');
    if (await back.isVisible().catch(() => false) && /RETOUR/.test(await back.textContent())) { await back.click(); await page.waitForTimeout(1200); continue; }
    if (await page.locator('[data-view="command"]').isVisible().catch(() => false) || await page.locator('dialog.content-scene-v188').count()) break;
    await page.waitForTimeout(600);
  }
  const after = await stored();
  check(`${id}: recorded in the campaign`, after.sideCampaignsV188.queens.done.includes(id), after.sideCampaignsV188.queens.done);
  return true;
}

// —— A1. The call after the main campaign: CQ-01, the briefing, acceptance ——
await importProfile(fixture('A'), 'queens-a.json');
await navigate('command'); await page.waitForTimeout(1200);
const cinematic = await page.locator('.cinematic-v188').count();
check('CQ-01 « Trois lignées » plays at the briefing table once the main campaign is over', cinematic === 1, await page.locator('.cinematic-v188').getAttribute('aria-label').catch(() => null));
if (cinematic) { await page.waitForTimeout(2500); await shot('01-cq01-three-shells'); await page.keyboard.press('Space'); await page.waitForTimeout(1500); await shot('01b-cq01-inez'); }
await skipCinematics(); await page.waitForTimeout(600);
const callDialog = page.locator('dialog.content-scene-v188');
const callTitle = await callDialog.count() ? await callDialog.locator('h2').textContent() : null;
const callText = await callDialog.count() ? await callDialog.locator('p').first().textContent() : '';
check('the call briefing opens with the route cost (fuel and 14 days of hypersleep)', /La Saison des Reines/.test(callTitle || '') && /Nacre-7 · \d+ unités de carburant · 14 jours en hypersommeil/.test(callText), { callTitle, callText: callText.slice(-120) });
await shot('02-call-briefing');
const callSave = await stored();
check('the call is recorded once and filed late in the travel messages (9 days by the QZ network)', callSave.sideCampaignsV188.queens.phase === 'call'
  && callSave.travelMessagesV188.messages.some(message => message.id === 'campaign-queens-call' && message.receivedDay - message.sentDay === 9), callSave.sideCampaignsV188.queens);
await callDialog.locator('[data-content-choice-v188="accept"]').click(); await page.waitForTimeout(400);
const acceptedText = await page.locator('dialog.content-scene-v188 p').first().textContent().catch(() => '');
check('acceptance text tells the route', /La route de Nacre-7 est ouverte/.test(acceptedText), acceptedText);
await closeDialogs();
const accepted = await stored();
check('accepted: Nacre-7 route unlocked, the arc waits for the orbit', accepted.sideCampaignsV188.queens.phase === 'accepted' && accepted.galaxy.unlockedWorldIds.includes(NACRE));
await panel.scrollIntoViewIfNeeded();
const panelText = await panel.innerText();
check('the briefing table panel lists Arc 1 and the route', /LA SAISON DES REINES · RÉQUISITION ACCEPTÉE/.test(panelText) && /1\.1 · NACRE-7 · LE QUAI NOYÉ/.test(panelText)
  && /saut vers Nacre-7 \(\d+ carburant · 14 jours en hypersommeil\)/.test(panelText) && /Arc 2 · Echo Basin[^\n]*ouvre après l’arc précédent/.test(panelText), panelText);
await shot('03-panel-accepted', '#side-campaign-queens-v188');
const options = await page.locator('#command-mission-v110 option').evaluateAll(nodes => nodes.map(node => node.value));
check('away from Nacre-7, no campaign mission is offered', !options.some(id => id.startsWith('queens-')), options.filter(id => id.startsWith('queens-')));

// —— A2. The galaxy jump: fuel, 14 days, the late destination call, Navarre on arrival ——
await navigate('galaxy'); await page.waitForTimeout(600);
const picked = await page.evaluate(target => { const node = [...document.querySelectorAll('[data-world-id], [data-world]')].find(entry => (entry.dataset.worldId || entry.dataset.world) === target); node?.click(); return Boolean(node); }, NACRE);
await page.waitForTimeout(500);
const confirm = page.locator('[data-confirm-jump-v115]');
const route = await page.locator('#galaxy-jump-panel-v116').innerText().catch(() => '');
check('Nacre-7 selectable on the galaxy map, route shown with fuel and days', picked && await confirm.isEnabled().catch(() => false) && /14 jours en hypersommeil/.test(route), route.slice(0, 300));
const beforeJump = await stored();
await shot('04-galaxy-route');
await confirm.click(); await page.waitForTimeout(9800);
const arrived = await stored();
check('arrival: fuel debited, 14 days added, arrival recorded once with Navarre’s message', arrived.galaxy.shipWorldIdV116 === NACRE
  && arrived.galaxy.resources.fuel < beforeJump.galaxy.resources.fuel && arrived.clock.day === beforeJump.clock.day + 14
  && arrived.sideCampaignsV188.queens.arrivedDay === arrived.clock.day && arrived.travelMessagesV188.messages.filter(message => message.id.startsWith('campaign-queens-arrival')).length === 1,
  { fuel: [beforeJump.galaxy.resources.fuel, arrived.galaxy.resources.fuel], day: [beforeJump.clock.day, arrived.clock.day], queens: arrived.sideCampaignsV188.queens });
await navigate('command'); await page.waitForTimeout(500); await closeDialogs();
const alerts = await page.locator('#frontier-alerts').innerText().catch(() => '');
check('the alert journal shows Navarre’s arrival message and the late destination call (FR)', /Navarre/.test(alerts) && /RETARD \+9 J/.test(alerts), alerts.slice(0, 400));
await page.locator('#frontier-alerts').scrollIntoViewIfNeeded().catch(() => {}); await shot('05-alerts-fr', '#frontier-alerts');

// —— A3. Arc 1 in order: 1.1, its return scene, 1.2, then the chapter is offered ——
await launchAndComplete('queens-1-1-quai');
await navigate('command'); await page.waitForTimeout(800);
const scene11 = await closeDialogs();
check('1.1 return scene (the pump room) opens once', scene11.some(title => /salle des pompes/.test(title)), scene11);
await launchAndComplete('queens-1-2-bassins');
await navigate('command'); await page.waitForTimeout(800);
const scene12 = await closeDialogs();
check('1.2 return scene (the drained pens) opens once', scene12.some(title => /bassins vidés/.test(title)), scene12);
await page.locator('#command-world-v110').selectOption(NACRE).catch(() => {}); await page.waitForTimeout(300);
const afterTwo = await page.locator('#command-mission-v110 option').evaluateAll(nodes => nodes.map(node => node.value));
check('the Abysse Noir chapter (1.3-1.4) is now offered on Nacre-7, with the annexes and contracts', afterTwo.includes('special-black-abyss-v131')
  && afterTwo.includes('queens-a-navarre') && afterTwo.includes('queens-l-canots') && !afterTwo.includes('queens-1-5-rask'), afterTwo.filter(id => /queens|abyss/.test(id)));
await page.locator('#command-mission-v110').selectOption('special-black-abyss-v131'); await page.waitForTimeout(500);
const planText = await page.locator('#operation-plan').innerText().catch(() => '');
check('the chapter plan is on Nacre-7', /Nacre-7/.test(planText), planText.slice(0, 300));
await panel.scrollIntoViewIfNeeded(); await shot('06-panel-after-1-2', '#side-campaign-queens-v188');

// —— B. After the chapter: CQ-02, its return scene, 1.5, the Rask choice, the Arc 1 debrief ——
await importProfile(fixture('B'), 'queens-b.json');
await navigate('command'); await page.waitForTimeout(1200);
const cq02 = await page.locator('.cinematic-v188').getAttribute('aria-label').catch(() => null);
check('CQ-02 « Le fossé » plays with the chapter’s return', cq02 === 'Le fossé', cq02);
if (cq02) { await page.waitForTimeout(3000); await shot('07-cq02-trench'); }
const sceneChapter = await closeDialogs(1);
check('the chapter’s return scene follows (Rask’s shuttle)', sceneChapter.some(title => /retour à la cloche/.test(title)), sceneChapter);
await launchAndComplete('queens-1-5-rask');
await navigate('command'); await page.waitForTimeout(800);
const rask = await closeDialogs(1);
check('1.5 return scene (the case) opens', rask.some(title => /le caisson/.test(title)), rask);
await page.waitForTimeout(300);
const choice = page.locator('dialog.content-scene-v188');
const choiceButtons = await choice.locator('[data-content-choice-v188]').evaluateAll(nodes => nodes.map(node => node.dataset.contentChoiceV188)).catch(() => []);
check('the Rask choice offers release, seize and destroy, without a dismiss button', JSON.stringify(choiceButtons) === JSON.stringify(['release', 'seize', 'destroy'])
  && !(await choice.locator('[data-content-dismiss-v188]').count()), choiceButtons);
await shot('08-rask-choice');
await choice.locator('[data-content-choice-v188="seize"]').click(); await page.waitForTimeout(400);
await page.locator('dialog.content-scene-v188 [data-content-choice-v188="continue"]').click(); await page.waitForTimeout(800);
await skipCinematics();
const debrief = page.locator('dialog.content-scene-v188');
const debriefText = await debrief.count() ? await debrief.locator('p').first().textContent() : '';
check('the Arc 1 debrief follows, nuanced by the choice', /Compte rendu de Nacre-7/.test(debriefText) && /sous scellés à bord/.test(debriefText), debriefText);
await shot('09-arc1-debrief');
await closeDialogs();
const done = await stored();
check('choice and debrief saved', done.sideCampaignsV188.queens.raskEgg === 'seize' && done.sideCampaignsV188.queens.scenesSeen.includes('arc1-debrief'), done.sideCampaignsV188.queens);
await panel.scrollIntoViewIfNeeded(); await shot('10-panel-arc1-complete', '#side-campaign-queens-v188');

// —— B2. Reload: nothing replayed; English panel ——
await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 }).catch(() => {});
await page.getByRole('button', { name: /^continuer$/i }).first().click({ timeout: 20000 }).catch(() => {});
await page.waitForTimeout(2500);
await navigate('command'); await page.waitForTimeout(800);
const replay = (await page.locator('dialog.content-scene-v188').count()) + (await page.locator('.cinematic-v188').count());
check('after reload: no scene, choice or cinematic replayed', replay === 0, replay);
await navigate('settings'); await page.locator('#language-select-v185').selectOption('en'); await page.waitForTimeout(400);
await navigate('command'); await page.waitForTimeout(600);
const english = await panel.innerText();
check('the panel in English', /THE SEASON OF QUEENS/.test(english) && /Royal egg seized/.test(english), english.slice(0, 300));
await panel.scrollIntoViewIfNeeded(); await shot('11-panel-en', '#side-campaign-queens-v188');

check('no page error', report.pageErrors.length === 0, report.pageErrors.slice(0, 5));
await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2));
await browser.close();
const failed = report.checks.filter(entry => !entry.passed);
console.log(`checks ${report.checks.length - failed.length}/${report.checks.length}`);
assert.equal(failed.length, 0, failed.map(entry => entry.label).join(' | '));
