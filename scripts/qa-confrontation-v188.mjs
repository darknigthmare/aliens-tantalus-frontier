// V188 spec 010 — browser playthrough of the no-shooting hearing at the Act V quay.
// Fixtures (declared): profiles built from createDefaultSave(), imported through the
// Options screen (the Act I seal flag is set but the import drops it, so 5 pieces are held): Acts II-IV done, CIN-51 read, every cinematic marked seen, Act V in
// phase 'final' on the line « Tenir » with its three final missions done. Dossier pieces
// come from their own records: Act I PDA/email and seal flag (narrativeArchives), the
// Interlude resolved, Act IV done, station S1-S4 done (CASSIUS orders), « colony-a-quai »
// done (Wren). No piece, ground or credibility is injected; the page's own modules are
// imported only to read the stored save (`import('/src/story-dossier-v188.js')`).
// Input: real keyboard (digits, S, Escape), real mouse clicks and real touch taps
// (context with hasTouch). Run A (FR) wins after one wrong piece and a reload mid-hearing;
// run B (EN, reduced motion on in the save settings, 390 px wide) stays silent and loses.
// Usage: BASE_URL=http://127.0.0.1:4681/ node scripts/qa-confrontation-v188.mjs <out-dir>
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createDefaultSave } from '../src/save.js';
import { CINEMATIC_IDS_V188 } from '../src/story-cinematics-v188.js';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4681/';
const out = process.argv[2] || 'qa-confrontation';
await mkdir(out, { recursive: true });
const report = { baseUrl, checks: [], pageErrors: [], consoleErrors: [], shots: [] };
const check = (label, condition, evidence = null) => { report.checks.push({ label, passed: Boolean(condition), evidence }); console.log(JSON.stringify({ check: label, passed: Boolean(condition), evidence })); };

function fixture({ reducedMotion = false } = {}) {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'command';
  save.worldId = 'world-05-lethe'; save.galaxy.shipWorldIdV116 = 'world-05-lethe';
  save.galaxy.completedCampaignIds = [...new Set([...save.galaxy.completedCampaignIds, 'special-narrative-qz17', 'special-archive-relay', 'special-apc-convoy', 'special-c12-horde',
    'special-black-cocoon', 'station-s1', 'station-s2', 'station-s3', 'station-s4', 'colony-a-quai', 'act5-last-run', 'act5-depot-queen', 'act5-port-walls'])];
  save.stationV188 = { schema: 188, introHeard: true, cassius: 'rewrite', scenesSeen: ['s1', 's3', 's4'] };
  save.narrativeArchives = { ...save.narrativeArchives,
    discovered: { ...save.narrativeArchives.discovered, 'qz17-pda-loading-chief': { id: 'qz17-pda-loading-chief' }, 'qz17-email-logistics-denial': { id: 'qz17-email-logistics-denial' } },
    unlockedFlags: ['qz17-maintenance-bypass'] };
  const story = save.storyCampaignV188;
  story.cinematicsSeen = [...CINEMATIC_IDS_V188]; story.debriefSeen = [...new Set([...(story.debriefSeen || []), 'special-black-cocoon', 'special-c12-horde', 'special-apc-convoy', 'special-archive-relay', 'special-narrative-qz17'])];
  story.m577Manifest = { containers: 1, colonists: 4, resolved: true };
  story.interlude = { phase: 'resolved', crisisId: 'crisis-qa', outcome: 'destroyed' };
  story.act5 = { schema: 188, phase: 'final', recommended: 'hold', decision: { option: 'hold', ending: 'living-without-proof', decidedBy: 'echo-9', dossierCount: 5, signerEstablished: false, restitution: false, recoveryAttempt: false },
    advantages: [], bridge: 'freight', bridgeTimedOut: false, standoff: null, epilogueTalked: [], lockerRead: false };
  save.settings.reducedMotion = reducedMotion;
  return save;
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
async function session({ language, viewport = { width: 1280, height: 900 } }) {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport, hasTouch: true });
  await context.addInitScript(lang => { try { localStorage.setItem('atf-language-v185', lang); } catch {} }, language);
  const page = await context.newPage(); page.setDefaultTimeout(30000);
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
  return { context, page };
}
const stored = page => page.evaluate(() => JSON.parse(localStorage.getItem('atf-v47-profile-1')));
const dossierCount = page => page.evaluate(async () => (await import('/src/story-dossier-v188.js')).storyDossierV188(JSON.parse(localStorage.getItem('atf-v47-profile-1'))).count);
const statusText = page => page.locator('[data-confrontation-status-v188]').textContent();
async function navigate(page, view) {
  if (await page.locator('#menu-toggle').isVisible() && !(await page.locator('.rail').getAttribute('class')).split(/\s+/).includes('open')) await page.locator('#menu-toggle').click();
  await page.locator(`[data-view="${view}"]`).click();
}
async function importProfile(page, save, name) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 });
  await page.locator('#title-options').click();
  await page.locator('#save-import').setInputFiles({ name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.waitForFunction(() => document.querySelector('#save-import').value === '');
  await page.waitForTimeout(400); await navigate(page, 'command'); await page.waitForTimeout(600);
}
const shot = async (page, name) => { const file = join(out, `${name}.png`); await page.locator('dialog[data-confrontation-v188]').screenshot({ path: file }); report.shots.push(file); };
const hearing = page => page.locator('dialog[data-confrontation-v188]');

// —— Run A: FR, wrong piece, reload mid-hearing, mouse + touch + keyboard, won → withdrawn ——
{
  const { context, page } = await session({ language: 'fr' });
  await importProfile(page, fixture(), 'qa-confrontation-a.json');
  check('A: dossier read from the save (5 pieces: no seal, no 18:43 priority)', await dossierCount(page) === 5, await dossierCount(page));
  await hearing(page).waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  check('A: the quay hearing opens at the briefing table', await hearing(page).isVisible());
  const enabled = await page.locator('[data-confrontation-piece-v188]:not([disabled])').count(), total = await page.locator('[data-confrontation-piece-v188]').count();
  check('A: 7 pieces listed, 5 presentable, the missing ones disabled', total === 7 && enabled === 5, { total, enabled });
  await page.waitForTimeout(1600); await shot(page, 'a-01-clause-14');
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  check('A: Escape does not dismiss the hearing', await hearing(page).isVisible());
  await page.keyboard.press('1'); await page.waitForTimeout(200); // PDA at clause 14: off the point
  check('A: keyboard 1 · wrong piece costs credibility', /CRÉDIBILITÉ 2\/3/.test(await statusText(page)), await statusText(page));
  await page.locator('[data-confrontation-piece-v188="pda-email"]').click(); await page.waitForTimeout(200); // manifest: decisive (mouse)
  check('A: mouse · decisive piece gains ground', /TERRAIN 2\/10/.test(await statusText(page)), await statusText(page));
  await page.locator('[data-confrontation-silence-v188]').tap(); await page.waitForTimeout(200); // seals: no seal held, silence (touch)
  check('A: touch · silence costs nothing', /ÉCHANGE 4\/7 · TERRAIN 2\/10 · CRÉDIBILITÉ 2\/3/.test(await statusText(page)), await statusText(page));
  const before = (await stored(page)).storyCampaignV188.confrontationsV188?.['act5-halloran-quay'];
  check('A: each exchange is saved', before?.round === 3 && before?.ground === 2 && before?.credibility === 2, before);
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 });
  await page.locator('#title-continue').click(); await page.waitForTimeout(800);
  // The save reopens on the command view, whose table reopens the hearing by itself (modal); navigate only otherwise.
  if (!(await hearing(page).isVisible())) await navigate(page, 'command');
  await hearing(page).waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  check('A: reload resumes at the fourth clause', /ÉCHANGE 4\/7/.test(await statusText(page)) && await page.locator('[data-confrontation-piece-v188="pda-email"][disabled]').count() === 1, await statusText(page));
  await page.keyboard.press('6'); await page.waitForTimeout(150); // orders ← CASSIUS
  await page.keyboard.press('4'); await page.waitForTimeout(150); // directive ← BISHOP-9
  await page.keyboard.press('5'); await page.waitForTimeout(150); // collapse ← cradles
  await page.keyboard.press('7'); await page.waitForTimeout(400); // witness ← Wren: 10/10 at the last clause
  check('A: hearing won at ground 10', /TERRAIN 10\/10/.test(await statusText(page)) && await page.locator('[data-confrontation-continue-v188]').isVisible(), await statusText(page));
  await page.waitForTimeout(300); await shot(page, 'a-02-won');
  await page.locator('[data-confrontation-continue-v188]').click(); await page.waitForTimeout(800);
  const quay = page.locator('dialog[data-act5-scene-v188="quay-standoff"]');
  check('A: the existing quay scene follows', await quay.isVisible(), await quay.locator('p').first().textContent().catch(() => null));
  const save = await stored(page);
  check('A: outcome fed act5.standoff = withdrawn, phase ending', save.storyCampaignV188.act5.standoff === 'withdrawn' && save.storyCampaignV188.act5.phase === 'ending', save.storyCampaignV188.act5);
  check('A: the hearing granted no piece', await dossierCount(page) === 5);
  await context.close();
}

// —— Run B: EN, reduced motion, phone width (390 px), silence until the last clause → lost → held ——
{
  const { context, page } = await session({ language: 'en', viewport: { width: 390, height: 844 } });
  await importProfile(page, fixture({ reducedMotion: true }), 'qa-confrontation-b.json');
  await hearing(page).waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  check('B: hearing opens in English', /EXCHANGE 1\/7/.test(await statusText(page)) && /DIRECTOR HALLORAN/.test(await page.locator('[data-confrontation-live-v188]').textContent()), await statusText(page));
  await shot(page, 'b-01-reduced-motion');
  const fit = await hearing(page).evaluate(node => ({ scroll: node.scrollWidth, client: node.clientWidth, page: document.documentElement.scrollWidth, width: innerWidth }));
  check('B: phone width · no horizontal overflow', fit.scroll <= fit.client + 1 && fit.page <= fit.width + 1, fit);
  for (let i = 0; i < 7 && await page.locator('[data-confrontation-silence-v188]').count(); i++) { await page.keyboard.press('s'); await page.waitForTimeout(120); }
  check('B: seven silences lose the hearing', /GROUND 0\/10/.test(await statusText(page)) && await page.locator('[data-confrontation-continue-v188]').isVisible(), await statusText(page));
  await shot(page, 'b-02-lost');
  await page.locator('[data-confrontation-continue-v188]').click(); await page.waitForTimeout(800);
  const save = await stored(page);
  check('B: outcome fed act5.standoff = held, even with 5 pieces', save.storyCampaignV188.act5.standoff === 'held', save.storyCampaignV188.act5.standoff);
  await context.close();
}

await browser.close();
check('no page errors', report.pageErrors.length === 0, report.pageErrors.slice(0, 5));
await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2));
const failed = report.checks.filter(entry => !entry.passed);
console.log(`checks: ${report.checks.length - failed.length}/${report.checks.length} passed`);
if (failed.length) process.exitCode = 1;
