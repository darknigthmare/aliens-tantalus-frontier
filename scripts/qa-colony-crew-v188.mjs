// V188 colony and crew lot — Chromium QA of the Port-Méridien missions, a crew
// quest and the delayed travel messages, on the real page.
// Fixtures (declared): profiles built from createDefaultSave(), imported through
// the Options screen (#save-import), with these injected fields only:
//   galaxy.completedCampaignIds += special-narrative-qz17, special-archive-relay,
//   portMeridienV90 = the quay sequence completed (receipt of port-meridien-v90.js),
//   storyCampaignV188.cinematicsSeen = every CINEMATIC_IDS_V188 entry (no auto-play),
//   worldId / galaxy.shipWorldIdV116 = world-05-lethe, hub pose in the drop hangar.
// Injections (declared): (1) the mission objective is completed by setting the
// engine's objective state and calling `completeMission()` (no combat played);
// (2) the hub conversation's quest buttons are requested by dispatching the
// existing `npc-dialogue-choices-v188` event for Sanaa Doyle / Tamsin Velez
// instead of walking to them. Everything else is clicked or pressed.
// Usage: PORT=4603 node scripts/dev.mjs & ; node scripts/qa-colony-crew-v188.mjs <out-dir>
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { createDefaultSave } from '../src/save.js';
import { CINEMATIC_IDS_V188 } from '../src/story-cinematics-v188.js';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4603/';
const out = process.argv[2] || 'qa-colony';
await mkdir(out, { recursive: true });
const report = { checks: [], pageErrors: [], shots: [] };
const check = (label, condition, evidence = null) => { report.checks.push({ label, passed: Boolean(condition), evidence }); console.log(JSON.stringify({ check: label, passed: Boolean(condition), evidence })); };

function fixture() {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'hub';
  save.worldId = 'world-05-lethe'; save.galaxy.shipWorldIdV116 = 'world-05-lethe';
  save.galaxy.completedCampaignIds = [...new Set([...save.galaxy.completedCampaignIds, 'special-narrative-qz17', 'special-archive-relay'])];
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
const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem('atf-v47-profile-1')));
const shot = async (name, locator = null) => { const file = join(out, `${name}.png`); await (locator ? page.locator(locator).screenshot({ path: file }) : page.screenshot({ path: file })); report.shots.push(file); };
async function navigate(view) {
  // From the hub, the existing exit button leads back to Command (round trip after a mission).
  const exit = page.getByRole('button', { name: /quitter vers commandement/i }).first();
  if (!(await page.locator(`[data-view="${view}"]`).isVisible().catch(() => false)) && await exit.isVisible().catch(() => false)) { await exit.click(); await page.waitForTimeout(600); }
  if (await page.locator('dialog.content-scene-v188').count()) return; // a modal story scene opened on arrival
  if (await page.locator('#menu-toggle').isVisible() && !(await page.locator('.rail').getAttribute('class')).split(/\s+/).includes('open')) await page.locator('#menu-toggle').click();
  await page.locator(`[data-view="${view}"]`).click(); await page.waitForTimeout(300);
}
async function closeDialogs(max = 6) {
  for (let i = 0; i < 6 && await page.locator('.cinematic-v188').count(); i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); }
  const seen = [];
  for (let i = 0; i < max; i++) {
    const dialog = page.locator('dialog.content-scene-v188');
    if (!(await dialog.count())) break;
    seen.push(await dialog.locator('h2').textContent());
    await dialog.locator('button').last().click(); await page.waitForTimeout(200);
  }
  return seen;
}
async function importProfile(save, name) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 });
  await page.locator('#title-options').click();
  await page.locator('#save-import').setInputFiles({ name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).last().waitFor();
  await navigate('command'); await page.waitForTimeout(400); await closeDialogs();
}

// —— 1. Colony table and C1 access ——
await importProfile(fixture(), 'colony-a.json');
const panel = page.locator('#colony-reconstruction-v188');
await panel.scrollIntoViewIfNeeded();
const panelText = await panel.innerText();
check('colony table lists the Port-Méridien missions', /MISSIONS DE PORT-MÉRIDIEN/.test(panelText) && /TENIR LE PORT/.test(panelText), panelText.slice(0, 400));
check('C1 is offered (▣), C2 waits for C1', /▣ PORT-MÉRIDIEN · TENIR LE PORT/.test(panelText) && /□ PORT-MÉRIDIEN · L’AIR DU PORT[^\n]*Terminez d’abord/.test(panelText));
check('C5 is shown as the Act V night of the walls', /C5 · LA NUIT DES MURS/.test(panelText));
await shot('01-colony-table-before', '#colony-reconstruction-v188');
await page.locator('#command-world-v110').selectOption('world-05-lethe').catch(() => {});
await page.waitForTimeout(300);
const options = await page.locator('#command-mission-v110 option').evaluateAll(nodes => nodes.map(node => node.value));
check('C1 in the mission order list, locked missions absent', options.includes('colony-c1') && !options.includes('colony-c2') && !options.includes('colony-a-ferro'), options.filter(id => id.startsWith('colony')));
await page.locator('#command-mission-v110').selectOption('colony-c1');
await page.waitForTimeout(400);
check('C1 planned', (await stored()).strategy.plannedCampaignId === 'colony-c1');
await page.locator('#operation-plan').scrollIntoViewIfNeeded(); await shot('02-c1-plan', '#operation-plan');

// —— 2. Launch C1: insertion (Escape), landing (E), completion (declared injection), return ——
await page.locator('#operation-launch').click();
await page.waitForTimeout(1200);
await shot('02b-c1-insertion-briefing');
// The insertion steps (briefing → take control) are clicked; the insertion cinematic is skipped with Escape, the landing with E.
for (let i = 0; i < 30; i++) {
  const live = await page.evaluate(() => Boolean(globalThis.__ATF_GAME__?.mission && globalThis.__ATF_GAME__?.running));
  if (live) break;
  if (await page.locator('.cinematic-v188').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(500); continue; }
  const action = page.locator('[data-insertion-action]').first();
  if (await action.count() && await action.isVisible()) { await action.click(); await page.waitForTimeout(500); continue; }
  await page.keyboard.press('KeyE'); await page.waitForTimeout(600);
}
const launched = await stored();
check('C1 launched: an operation is active on Cocyte', launched.strategy.currentOperation?.campaignId === 'colony-c1', launched.strategy.currentOperation?.campaignId);
await page.waitForTimeout(1500);
await shot('03-c1-mission');
const completed = await page.evaluate(() => {
  const engine = globalThis.__ATF_GAME__;
  if (!engine?.mission) return { ok: false, reason: 'no mission' };
  engine.objectiveState.complete = true; if (engine.objective) engine.objective.complete = true;
  const missing = engine.missingObjectiveRequirement?.();
  return { ok: engine.completeMission(), missing, template: engine.missionPlan?.templateId || null };
});
check('C1 completion through the engine (declared injection)', completed.ok, completed);
await page.waitForFunction(() => JSON.parse(localStorage.getItem('atf-v47-profile-1'))?.galaxy?.completedCampaignIds?.includes('colony-c1'), null, { timeout: 15000 }).catch(() => {});
await shot('03b-c1-complete');
const afterC1 = await stored();
check('C1 recorded once, walls level 1 built and validated', afterC1.galaxy.completedCampaignIds.includes('colony-c1') && afterC1.colonyMissionsV188.rewarded.includes('colony-c1')
  && afterC1.colonyV188.sites.walls.validated === 1, { walls: afterC1.colonyV188.sites.walls, rewarded: afterC1.colonyMissionsV188.rewarded });
// Extraction and return cinematics skipped with Escape, then « RETOUR À BORD » clicked.
for (let i = 0; i < 25; i++) {
  if (await page.getByText('PASSER (ÉCHAP)').first().isVisible().catch(() => false)) { await page.keyboard.press('Escape'); await page.waitForTimeout(600); continue; }
  const back = page.locator('#retreat-mission');
  if (await back.isVisible().catch(() => false) && /RETOUR/.test(await back.textContent())) { await back.click(); await page.waitForTimeout(1200); continue; }
  if (await page.locator('[data-view="command"]').isVisible().catch(() => false) || await page.locator('dialog.content-scene-v188').count()) break;
  await page.waitForTimeout(600);
}
await shot('03c-after-return');
if (!(await page.locator('dialog.content-scene-v188').count())) await navigate('command');
await page.waitForTimeout(800);
const scene = page.locator('dialog.content-scene-v188');
const sceneTitle = await scene.count() ? await scene.locator('h2').textContent() : null;
check('the C1 return scene opens once at the briefing table', /sas soudés/.test(sceneTitle || ''), sceneTitle);
if (sceneTitle) await shot('04-c1-return-scene');
await closeDialogs();
const panelAfter = await panel.innerText();
check('colony table shows C1 done, walls level 1 and the local-validation rule', /■ PORT-MÉRIDIEN · TENIR LE PORT/.test(panelAfter) && /Sécurité · ■/.test(panelAfter) && /validés par les missions locales/.test(panelAfter));
check('Wren’s annex and the defensive contracts are now offered', /▣ PORT-MÉRIDIEN · CE QUE LE QUAI A VU/.test(panelAfter) && /▣ PORT-MÉRIDIEN · RONDE DES MURS/.test(panelAfter));
await panel.scrollIntoViewIfNeeded(); await shot('05-colony-table-after-c1', '#colony-reconstruction-v188');

// —— 3. Resume: reload, nothing paid twice, scene not replayed ——
await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 }).catch(() => {});
await page.getByRole('button', { name: /^continuer$/i }).first().click({ timeout: 20000 }).catch(() => {});
await page.waitForTimeout(2500); await shot('05b-after-reload');
await navigate('command'); await page.waitForTimeout(600);
const replayed = await page.locator('dialog.content-scene-v188').count();
const resumed = await stored();
check('after reload: same walls level, reward recorded once, no scene replayed', resumed.colonyV188.sites.walls.validated === 1 && resumed.colonyMissionsV188.rewarded.filter(id => id === 'colony-c1').length === 1 && !replayed);

// —— 4. A crew quest from the hub conversation (Sanaa Doyle, after C1) ——
await navigate('hub');
await page.waitForFunction(() => globalThis.__ATF_HUB__?.running, null, { timeout: 45000 }).catch(() => {});
const doyle = await page.evaluate(() => {
  const host = document.getElementById('hub-dialogue-choices'); if (!host) return null;
  host.replaceChildren();
  host.dispatchEvent(new CustomEvent('npc-dialogue-choices-v188', { detail: { crewId: 'crew-07-sanaa-doyle' } }));
  return [...host.querySelectorAll('[data-crew-quest-v188]')].map(node => ({ id: node.dataset.crewQuestV188, label: node.textContent }));
});
check('Sanaa Doyle offers « Les sentinelles » in the hub conversation (declared event)', doyle?.some(entry => entry.id === 'ship-doyle'), doyle);
if (doyle?.some(entry => entry.id === 'ship-doyle')) {
  await page.locator('[data-crew-quest-v188="ship-doyle"]').dispatchEvent('click'); await page.waitForTimeout(400);
  await shot('06-doyle-offer');
  await page.locator('dialog.content-scene-v188 [data-content-choice-v188="accept"]').click(); await page.waitForTimeout(300);
  const accepted = await page.locator('dialog.content-scene-v188 p').first().textContent();
  check('quest accepted with its own collection text', /deux tourelles sentinelles/.test(accepted || ''), accepted);
  await closeDialogs();
}
await navigate('command'); await page.waitForTimeout(400); await closeDialogs();
const quests = await page.locator('#crew-quests-v188').innerText();
check('briefing-table quest list shows 16 quests with Doyle in progress', (quests.match(/^[■▣□]/gm) || []).length === 16 && /▣ Sanaa Doyle · Les sentinelles — en cours \(0\/2\)/.test(quests), quests.slice(0, 300));
await page.locator('#crew-quests-v188').scrollIntoViewIfNeeded(); await shot('07-crew-quests', '#crew-quests-v188');

// —— 5. A galactic jump: delayed messages in the existing alert log, FR then EN ——
await navigate('galaxy'); await page.waitForTimeout(600);
const jumpReady = await page.evaluate(() => {
  const button = [...document.querySelectorAll('[data-world-id], [data-world]')].find(node => /acheron|lv-426/i.test(node.dataset.worldId || node.dataset.world || ''));
  button?.click(); return Boolean(button);
});
await page.waitForTimeout(500);
const confirm = page.locator('[data-confirm-jump-v115]');
const canJump = await confirm.count() && await confirm.isEnabled();
check('a jump can be prepared from the galaxy view', canJump, { jumpReady });
if (canJump) {
  await confirm.click(); await page.waitForTimeout(9500);
  const arrived = await stored();
  check('arrival adds 14 days and delivers the delayed messages once (colony, company, world left behind, destination)', arrived.galaxy.jumpV116?.phase === 'arrived' && arrived.travelMessagesV188.messages.length === 4 && arrived.clock.day === 15,
    arrived.travelMessagesV188.messages.map(message => `${message.kind}:${message.sentDay}->${message.receivedDay}`));
  await navigate('command'); await page.waitForTimeout(500); await closeDialogs();
  const alerts = page.locator('#frontier-alerts');
  const fr = await alerts.innerText();
  check('the alert log shows the messages in French', /PENDANT LE SAUT|À L’ARRIVÉE/.test(fr) && /Weyland-Yutani/.test(fr), fr.slice(0, 300));
  await alerts.scrollIntoViewIfNeeded(); await shot('08-delayed-messages-fr', '#frontier-alerts');
  await navigate('settings'); await page.locator('#language-select-v185').selectOption('en'); await page.waitForTimeout(400);
  await navigate('command'); await page.waitForTimeout(500);
  const en = await alerts.innerText();
  check('the same messages in English', /DURING THE JUMP|ON ARRIVAL/.test(en), en.slice(0, 300));
  await shot('09-delayed-messages-en', '#frontier-alerts');
}
check('no page error', report.pageErrors.length === 0, report.pageErrors.slice(0, 5));
await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2));
await browser.close();
const failed = report.checks.filter(entry => !entry.passed);
console.log(`checks ${report.checks.length - failed.length}/${report.checks.length}`);
assert.equal(failed.length, 0, failed.map(entry => entry.label).join(' | '));
