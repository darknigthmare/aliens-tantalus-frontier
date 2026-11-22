// V188 Act V convoy race — browser playthrough (src/act5-convoy-race-runtime-v188.js).
// Fixtures (declared): profiles built from createDefaultSave(), imported through the
// Options screen: Acts II-IV done, CIN-51 read, every cinematic marked seen, Act V in
// phase 'final' on the line « Tenir », M577 manifest of 2 containers; the Queen run adds
// « Dernier départ » done with the colonists' trailer left at the bridge.
// Owner decisions of 2026-11-22 (third run): a « Céder » line with a restitution promised at the
// council (2 containers); X drops the freight on the bridge. After the run, the page's own story
// module is imported (`import('/src/story-act5-v188.js')`) to read the ending and epilogue from the
// stored save; for the epilogue a copy of the save is set to phase 'epilogue' (declared injection,
// in memory only, never written back).
// Input: real keyboard (E engage, D throttle, F turret, C / X uncouple). No position injection.
// Usage: BASE_URL=http://127.0.0.1:4631/ node scripts/qa-act5-convoy-race-v188.mjs <out-dir>
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createDefaultSave } from '../src/save.js';
import { CINEMATIC_IDS_V188 } from '../src/story-cinematics-v188.js';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4631/';
const out = process.argv[2] || 'qa-act5-convoy-race';
await mkdir(out, { recursive: true });
const report = { baseUrl, checks: [], pageErrors: [], consoleErrors: [], shots: [], snapshots: {} };
const check = (label, condition, evidence = null) => { report.checks.push({ label, passed: Boolean(condition), evidence }); console.log(JSON.stringify({ check: label, passed: Boolean(condition), evidence })); };

function fixture({ lastRunDone = false, cede = false } = {}) {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'command';
  save.worldId = 'world-05-lethe'; save.galaxy.shipWorldIdV116 = 'world-05-lethe';
  save.galaxy.completedCampaignIds = [...new Set([...save.galaxy.completedCampaignIds, 'special-narrative-qz17', 'special-archive-relay', 'special-apc-convoy', 'special-c12-horde', 'special-black-cocoon',
    ...(lastRunDone ? ['act5-last-run'] : [])])];
  const story = save.storyCampaignV188;
  story.cinematicsSeen = [...CINEMATIC_IDS_V188]; story.debriefSeen = [...new Set([...(story.debriefSeen || []), 'special-black-cocoon', 'special-c12-horde', 'special-apc-convoy', 'special-archive-relay'])];
  story.m577Manifest = { containers: 2, colonists: 2, resolved: true };
  story.act5 = { schema: 188, phase: 'final', recommended: cede ? 'cede' : 'hold', decision: cede ? { option: 'cede', ending: 'freight-first', decidedBy: 'echo-9', dossierCount: 3, signerEstablished: false, restitution: true, recoveryAttempt: false }
    : { option: 'hold', ending: 'living-without-proof', decidedBy: 'echo-9', dossierCount: 5, signerEstablished: true, restitution: false, recoveryAttempt: false },
    advantages: ['window'], bridge: lastRunDone ? 'colonists' : null, bridgeTimedOut: false, standoff: null, epilogueTalked: [], lockerRead: false,
    ...(lastRunDone ? { convoyV188: { drops: [{ trailer: 'colonists', mission: 'act5-last-run', cause: 'bridge', metres: 720 }], bridgeCrossed: true, queen: null } } : {}) };
  save.galaxy.resources.credits = 4000;
  return save;
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 900 } });
const page = await context.newPage(); page.setDefaultTimeout(30000);
page.on('pageerror', error => report.pageErrors.push(error.message));
page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem('atf-v47-profile-1')));
const race = () => page.evaluate(() => globalThis.__ATF_GAME__?.act5RaceSnapshotV188?.() || null);
const shot = async name => { const file = join(out, `${name}.png`); await page.locator('#game-canvas').screenshot({ path: file }); report.shots.push(file); };
async function navigate(view) {
  if (await page.locator('#menu-toggle').isVisible() && !(await page.locator('.rail').getAttribute('class')).split(/\s+/).includes('open')) await page.locator('#menu-toggle').click();
  await page.locator(`[data-view="${view}"]`).click();
}
async function closeDialogs() {
  for (let i = 0; i < 6 && await page.locator('.cinematic-v188').count(); i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); }
  for (let i = 0; i < 4; i++) { const button = page.locator('dialog.content-scene-v188 button').last(); if (!(await button.count())) break; await button.click(); await page.waitForTimeout(150); }
}
async function importProfile(save, name) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 });
  await page.locator('#title-options').click();
  await page.locator('#save-import').setInputFiles({ name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.waitForFunction(() => document.querySelector('#save-import').value === '');
  await page.waitForTimeout(400); await navigate('command'); await page.waitForTimeout(400); await closeDialogs();
}
async function launch(campaignId) {
  await page.locator('#command-mission-v110').selectOption(campaignId);
  await page.locator('#operation-launch').click();
  for (let i = 0; i < 60; i++) {
    if (await page.evaluate(() => !!globalThis.__ATF_GAME__?.running && globalThis.__ATF_GAME__?.isAct5RaceV188?.())) break;
    const advance = page.locator('[data-insertion-action="advance"]');
    if (await advance.isVisible().catch(() => false)) await advance.click(); else await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
  }
  await page.waitForFunction(() => globalThis.__ATF_GAME__?.running && !globalThis.__ATF_GAME__.paused, null, { timeout: 45000 }).catch(() => {});
  await page.locator('#game-canvas').focus();
  // In-level UD-4L landing: wait for control (it is short; Escape skips it as the player can).
  for (let i = 0; i < 40 && await page.evaluate(() => globalThis.__ATF_GAME__?.dropshipHandoverBlocksV188?.()); i++) await page.waitForTimeout(300);
}
const hold = async (keys, ms) => { for (const key of keys) await page.keyboard.down(key); await page.waitForTimeout(ms); };
const release = async keys => { for (const key of keys) await page.keyboard.up(key); };

try {
  // —— « Dernier départ »: race, trailer drop on the collapsing bridge ——
  await importProfile(fixture(), 'act5-race.json');
  await launch('act5-last-run');
  let s = await race();
  check('race starts seated in the M577 with both trailers', s?.trailers.length === 2 && s.phase === 'briefing', s);
  check('M577 to scale: 449 px (8.8 m at 51 px/m), wheels on the road, whole hull in view; trailers 235 px', s?.apcPx?.w === 449 && s.apcPx.metres === 8.8 && s.apcPx.feet === 570
    && s.apcPx.x >= 0 && s.apcPx.x + s.apcPx.w <= 1280 && s.trailerPx?.w === 235, { apc: s?.apcPx, trailer: s?.trailerPx });
  await shot('01-race-briefing');
  await page.keyboard.press('KeyE'); await page.waitForTimeout(300);
  await hold(['KeyD', 'KeyF'], 9000); s = await race();
  check('convoy drives on the road with sprung drawbars', s.phase === 'road' && s.speed > 20 && s.trailers.every(entry => entry.gap > 0), s);
  await shot('02-race-road-trailers');
  for (let i = 0; i < 200 && !(s = await race()).bridge?.strain; i++) await page.waitForTimeout(250);
  check('the bridge sags under both trailers (decision window)', s.bridge?.strain && s.bridge.left > 0, s.bridge);
  await page.waitForTimeout(1500); await shot('03-bridge-strain');
  await page.keyboard.press('KeyC'); await page.waitForTimeout(1200); s = await race();
  check('C uncouples the colonists’ trailer on the bridge', s.dropped.some(entry => entry.id === 'colonists' && entry.cause === 'bridge') && s.trailers.map(entry => entry.id).join() === 'freight', s);
  await shot('04-bridge-collapse');
  let saved = (await stored()).storyCampaignV188.act5;
  check('the drop is the bridge decision, written additively', saved.bridge === 'colonists' && saved.convoyV188?.drops?.[0]?.cause === 'bridge', { bridge: saved.bridge, convoy: saved.convoyV188 });
  for (let i = 0; i < 200 && !(s = await race()).bridge?.crossed; i++) await page.waitForTimeout(250);
  await page.waitForTimeout(600); await shot('05-bridge-behind');
  for (let i = 0; i < 300 && !(s = await race())?.complete; i++) await page.waitForTimeout(250);
  await release(['KeyD', 'KeyF']);
  check('the convoy reaches the port walls', s?.complete === true, s);
  await page.waitForTimeout(1500); await shot('06-arrival-extraction');
  for (let i = 0; i < 80 && await page.evaluate(() => !!globalThis.__ATF_GAME__?.running && globalThis.__ATF_GAME__?.mission?.state !== 'failed' && !document.querySelector('#debrief-v121:not([hidden]), .debrief-v188')); i++) await page.waitForTimeout(300);
  saved = (await stored());
  check('race complete in the save: bridge crossed, checkpoints per phase', saved.storyCampaignV188.act5.convoyV188?.bridgeCrossed === true, saved.storyCampaignV188.act5.convoyV188);
  report.snapshots.race = s;

  // —— « La Reine du dépôt »: the Queen chases the M577 ——
  await importProfile(fixture({ lastRunDone: true }), 'act5-queen.json');
  await launch('act5-depot-queen');
  s = await race();
  check('Queen chase: freight trailer towed, Queen admitted at 245 px', s?.trailers.map(entry => entry.id).join() === 'freight' && s.queen?.height === 245, s);
  await page.keyboard.press('KeyE'); await page.waitForTimeout(300);
  await hold(['KeyD', 'KeyF'], 4000);
  for (let i = 0; i < 120 && (s = await race()).queen.gap > 20; i++) await page.waitForTimeout(250);
  await shot('07-queen-closing');
  for (let i = 0; i < 80 && !['windup', 'lunge'].includes((s = await race()).queen.state); i++) await page.waitForTimeout(100);
  await shot('08-queen-lunge');
  check('the Queen closes on the convoy and attacks (dedicated FSM)', ['windup', 'lunge', 'recover', 'staggered'].includes(s.queen.state) || s.queen.gap < 15, s.queen);
  const chase = { lowest: Infinity, deadBeforeJunction: false, states: new Set(), killedAtMetres: null };
  for (let i = 0; i < 1200 && !(s = await race())?.complete && !s?.failed; i++) {
    if (s.queen) {
      chase.states.add(s.queen.state);
      if (s.phase === 'chase') { chase.lowest = Math.min(chase.lowest, s.queen.health); if (s.queen.state === 'dead') chase.deadBeforeJunction = true; }
    }
    if (s.queen?.state === 'recoil' && !report.shots.some(file => file.endsWith('08b-queen-recoil.png'))) await shot('08b-queen-recoil');
    await page.waitForTimeout(150);
  }
  if (s?.queen?.state === 'dead') chase.killedAtMetres = s.metres;
  await release(['KeyD', 'KeyF']);
  check('the M577 survives and the Queen is stopped', s?.complete === true && !s.failed, s);
  check('the Queen is hurt and thrown back on the road but never killed before the port junction', !chase.deadBeforeJunction && chase.lowest === s.queen.floor && chase.states.has('recoil'),
    { lowest: chase.lowest, floor: s?.queen?.floor, states: [...chase.states] });
  check('she is killed only at the port junction (stand-off)', s?.phase === 'complete' && chase.killedAtMetres >= s.length && s.queen.killable === true, { metres: chase.killedAtMetres, length: s?.length });
  await page.waitForTimeout(800); await shot('09-queen-stopped');
  for (let i = 0; i < 40; i++) { const act5 = (await stored()).storyCampaignV188.act5; if (act5.convoyV188?.queen) break; await page.waitForTimeout(300); }
  saved = (await stored()).storyCampaignV188.act5;
  check('Queen outcome written additively', saved.convoyV188?.queen === 'killed', saved.convoyV188);
  report.snapshots.queen = s;

  // —— Owner decision 2026-11-22: the freight lost at the bridge no longer counts as brought back ——
  await importProfile(fixture({ cede: true }), 'act5-cede.json');
  await launch('act5-last-run');
  await page.keyboard.press('KeyE'); await page.waitForTimeout(300);
  await hold(['KeyD', 'KeyF'], 4000);
  for (let i = 0; i < 240 && !(s = await race()).bridge?.strain; i++) await page.waitForTimeout(250);
  await page.keyboard.press('KeyX'); await page.waitForTimeout(1200); s = await race();
  check('cede line: X uncouples the freight trailer on the bridge', s.dropped.some(entry => entry.id === 'freight') && s.trailers.map(entry => entry.id).join() === 'colonists', s.dropped);
  await shot('10-freight-dropped');
  for (let i = 0; i < 300 && !(s = await race())?.complete; i++) await page.waitForTimeout(250);
  await release(['KeyD', 'KeyF']);
  for (let i = 0; i < 40; i++) { const act5 = (await stored()).storyCampaignV188.act5; if (act5.bridge) break; await page.waitForTimeout(300); }
  const ending = await page.evaluate(async raw => {
    const story = await import('/src/story-act5-v188.js');
    const epilogue = structuredClone(raw); epilogue.storyCampaignV188.act5.phase = 'epilogue';
    return { bridge: story.act5StateV188(raw).bridge, restitution: story.act5RestitutionHeldV188(raw), containers: story.act5ContainersBroughtBackV188(raw),
      lines: story.act5EndingSummaryV188(raw, 'fr').lines, linesEn: story.act5EndingSummaryV188(raw, 'en').lines,
      freightFr: story.act5EpilogueV188(epilogue, 'fr').find(fact => fact.id === 'freight')?.text || null,
      freightEn: story.act5EpilogueV188(epilogue, 'en').find(fact => fact.id === 'freight')?.text || null };
  }, await stored());
  check('the lost freight no longer counts: no restitution, 0 containers brought back', ending.bridge === 'freight' && ending.restitution === false && ending.containers === 0, ending);
  check('ending and epilogue mention the lost freight (FR + EN)', ending.lines.some(line => /ne parle plus de « restitution »/.test(line)) && ending.linesEn.some(line => /no longer speaks of a "restitution"/.test(line))
    && /ravin du pont avec 2 conteneur/.test(ending.freightFr || '') && /bridge ravine with 2 QZ17/.test(ending.freightEn || ''), ending);
  report.snapshots.cede = { race: s, ending };
} finally {
  check('no page error', report.pageErrors.length === 0, report.pageErrors);
  await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();
}
const failed = report.checks.filter(entry => !entry.passed);
console.log(JSON.stringify({ passed: report.checks.length - failed.length, failed: failed.length, shots: report.shots.length, consoleErrors: report.consoleErrors.length }));
process.exitCode = failed.length ? 1 : 0;
