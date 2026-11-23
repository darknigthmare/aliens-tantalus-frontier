// V188 Bioforge containment lab — Chromium QA on the real page (spec 013).
// Fixture (declared): one profile from createDefaultSave() with needsPlayerCreationV84 = false,
// scene 'hub' and hub = { deck: 2, roomId: 'quarantine', positionX: 1500 }, imported through
// the Options screen (#save-import). Default Bioforge composition (1 × Drone Big Chap).
// Input: real keyboard only (A/D, E, F) and the terminal's own buttons, from the hub
// quarantine door to the return to the hub. Runtime globals are observed, never written.
// Injection (declared): the resume check reloads the page and reopens the lab with the QA
// hook __ATF_BIOFORGE_V80__.open() (direct entry) instead of walking the hub again.
// Usage: PORT=4721 node scripts/dev.mjs & ; node scripts/qa-bioforge-lab-v188.mjs <out-dir> [1366x768|390x844]
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { createDefaultSave } from '../src/save.js';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4721/';
const out = process.argv[2] || 'qa-bioforge-lab';
const [vw, vh] = String(process.argv[3] || '1366x768').split('x').map(Number);
const full = vw >= 1000;
await mkdir(out, { recursive: true });
const report = { viewport: `${vw}x${vh}`, checks: [], pageErrors: [], consoleErrors: [], shots: [] };
const check = (label, condition, evidence = null) => { report.checks.push({ label, passed: Boolean(condition), evidence }); console.log(JSON.stringify({ check: label, passed: Boolean(condition), evidence })); };

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: vw, height: vh } });
const page = await context.newPage(); page.setDefaultTimeout(30000);
page.on('pageerror', error => report.pageErrors.push(error.message));
page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
const shot = async (name, canvas = true) => {
  const path = join(out, `${vw}-${name}.png`);
  if (canvas && full) await page.locator('#bioforge-canvas-v80').screenshot({ path }); else await page.screenshot({ path });
  report.shots.push(path);
};
const hub = () => page.evaluate(() => { const h = globalThis.__ATF_HUB__; return h && { running: h.running, room: h.currentRoom()?.id, annex: h.currentAnnexV71?.()?.id || null, x: h.player.x, prompt: h.statusPrompt() }; });
const lab = () => page.evaluate(() => {
  const r = globalThis.__ATF_BIOFORGE_V80__?.runtime; if (!r) return null; const s = r.getBioforgeSnapshotV80();
  return { phase: s.phase, stage: s.transferStage, running: s.running, mode: r.bioforgeAmbulatoryV188, x: Math.round(r.player.x), alive: r.player.alive,
    printed: s.printed, kills: s.kills, caption: r.bioforgeLabCaptionV188?.text || null, prompt: r.resolveBioforgeLabPromptV188?.()?.prompt || null,
    decon: { ...r.bioforgeExitDeconV188 }, doors: Object.fromEntries(s.doors.map(d => [d.id, d.open])), view: document.querySelector('.view.active')?.id || null };
});
async function closeDialogs() {
  for (let i = 0; i < 8; i++) {
    if (await page.locator('.cinematic-v188').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(300); continue; }
    const dialog = page.locator('dialog.content-scene-v188[open]');
    if (!(await dialog.count())) break;
    await dialog.locator('button').last().click(); await page.waitForTimeout(250);
  }
}
async function hubWalk(x) {
  const before = await hub(), key = x > before.x ? 'KeyD' : 'KeyA';
  await page.keyboard.down(key);
  try { await page.waitForFunction(([target, right]) => { const p = globalThis.__ATF_HUB__.player; return right ? p.x >= target - 20 : p.x <= target + 20; }, [x, x > before.x], { timeout: 20000, polling: 'raf' }); }
  finally { await page.keyboard.up(key); }
  await page.waitForTimeout(500);
}
async function labWalk(x, timeout = 15000) {
  const before = await lab(), key = x > before.x ? 'KeyD' : 'KeyA';
  await page.keyboard.down(key);
  try { await page.waitForFunction(([target, right]) => { const p = globalThis.__ATF_BIOFORGE_V80__.runtime.player; return right ? p.x >= target - 10 : p.x <= target + 10; }, [x, x > before.x], { timeout, polling: 'raf' }); }
  catch { /* reported by the caller's position check */ }
  finally { await page.keyboard.up(key); }
  await page.waitForTimeout(350);
  return lab();
}
const pressE = async () => { await page.keyboard.press('KeyE'); await page.waitForTimeout(300); return lab(); };

// 1. Hub → quarantine → Bioforge access annex → station (real keyboard).
await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
await page.locator('#title-start').waitFor({ state: 'visible', timeout: 45000 });
await page.locator('#title-start').click();
await page.locator('#title-menu').waitFor({ state: 'visible' });
const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'hub';
Object.assign(save.hub, { deck: 2, roomId: 'quarantine', positionX: 1500, positionY: 532 });
await page.locator('#title-options').click();
await page.locator('#save-import').setInputFiles({ name: 'bioforge-lab.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
await page.getByText('Sauvegarde importée et migrée.', { exact: true }).last().waitFor();
const exitCommand = page.getByRole('button', { name: /quitter vers commandement/i }).first();
if (await exitCommand.isVisible().catch(() => false)) { await exitCommand.click(); await page.waitForTimeout(600); }
await closeDialogs();
if (await page.locator('#menu-toggle').isVisible() && !(await page.locator('.rail').getAttribute('class')).split(/\s+/).includes('open')) await page.locator('#menu-toggle').click();
await page.locator('[data-view="hub"]').click(); await page.waitForTimeout(1500); await closeDialogs();
await page.locator('#hub-canvas').focus();
const door = await page.evaluate(() => ({ ...globalThis.__ATF_HUB__.getParentAnnexDoorV71('bioforge').bounds }));
await hubWalk(door.x + door.w / 2 - 22);
check('hub: the quarantine door offers the Bioforge access', /BIOFORGE/.test((await hub()).prompt), await hub());
await page.keyboard.press('KeyE');
await page.waitForFunction(() => globalThis.__ATF_HUB__.currentAnnexV71?.()?.id === 'bioforge' && !globalThis.__ATF_HUB__.annexTransitionV71, null, { timeout: 15000 });
const station = await page.evaluate(() => ({ ...globalThis.__ATF_HUB__.currentAnnexV71().station.bounds }));
await hubWalk(station.x + station.w / 2 - 22);
await page.keyboard.press('KeyE'); await page.waitForTimeout(2000); await closeDialogs();
let state = await lab();
check('entry: the hub station opens the Bioforge view without a session', state.view === 'bioforge-ui-v80' && state.phase === 'configuration' && !state.running, state);
await shot('01-arrival', false);

// 2. Walk without a session: cold storage and control console.
await page.locator('#bioforge-canvas-v80').focus();
state = await labWalk(50);
check('standby: A walks the control room without starting a session', state.mode === 'standby' && state.running && state.phase === 'configuration' && state.x <= 70, state);
state = await pressE();
check('cold storage: E reads the archived samples (read-only)', /STOCKAGE FROID/.test(state.caption || ''), state.caption);
await shot('02-cold-storage');
state = await labWalk(212);
check('control console prompt', /TERMINAL DE CONTRÔLE/.test(state.prompt || ''), state.prompt);
state = await pressE();
const expanded = await page.evaluate(() => globalThis.__ATF_BIOFORGE_V80__.ui.terminalExpandedV87);
check('control console: E requests the terminal', expanded === true && /TERMINAL/.test(state.caption || ''), { expanded, caption: state.caption });
await shot('03-control-room');
const standbyX = state.x;

// 3. Session: terminal start, then the three entry stages on foot.
await page.locator('#bioforge-start-v80').scrollIntoViewIfNeeded();
await page.locator('#bioforge-start-v80').click(); await page.waitForTimeout(700);
state = await lab();
check('start: a fresh session keeps the operator in the control room', state.phase === 'configuration' && state.running && !state.mode && Math.abs(state.x - standbyX) < 4, state);
await page.locator('#bioforge-canvas-v80').scrollIntoViewIfNeeded();
await page.locator('#bioforge-canvas-v80').focus();
state = await labWalk(335);
check('airlock prompt', /OUVRIR LE SAS/.test(state.prompt || ''), state.prompt);
state = await pressE();
check('stage 1: the control seal opens', state.stage === 1 && state.doors['control-seal'], state);
state = await labWalk(565);
state = await pressE();
check('stage 2: interlock cycles, seal closes behind', state.stage === 2 && state.doors['inner-interlock'] && !state.doors['control-seal'], state);
await page.waitForTimeout(400);
await shot('04-airlock-decon');
state = await labWalk(800);
await shot('05-admission');
state = await labWalk(1065);
check('printer prompt in the tank hall', /IMPRIMANTE/.test(state.prompt || ''), state.prompt);
await shot('06-tank-hall');
state = await pressE();
check('stage 3: containment door opens', state.stage === 3 && state.doors['arena-containment'], state);
state = await labWalk(1330);
await page.waitForTimeout(1500);
state = await lab();
check('cell: sealed and printed', ['printing', 'combat'].includes(state.phase) && state.printed >= 1, state);
await shot('07-cell-combat');

if (full) {
  // 4. Combat with the real fire key until the session ends and the cell is purged.
  await page.keyboard.down('KeyF');
  try { await page.waitForFunction(() => globalThis.__ATF_BIOFORGE_V80__.runtime.getBioforgeSnapshotV80().phase === 'return', null, { timeout: 30000, polling: 200 }); }
  finally { await page.keyboard.up('KeyF'); }
  state = await lab();
  check('result: purge confirmed, engine stopped, operator alive in the cell', state.phase === 'return' && !state.running && state.alive && state.kills >= 1, state);
  await shot('08-purged');

  // 5. Physical exit: incinerator, analysis, decontamination (interrupted then complete), hub door.
  state = await labWalk(2540);
  check('egress: D resumes the walk after the purge', state.mode === 'egress' && state.x >= 2520, state);
  state = await labWalk(2544);
  check('incinerator prompt', /INCINÉRATEUR/.test(state.prompt || ''), state.prompt);
  state = await pressE();
  check('incinerator: purge report', /INCINÉRATEUR · CYCLE CONFIRMÉ/.test(state.caption || ''), state.caption);
  state = await labWalk(2610);
  state = await pressE();
  check('dissection table: last session analysis', /ANALYSE · CONFINEMENT TENU/.test(state.caption || ''), state.caption);
  await shot('09-analysis-bay');
  check('hub door stays closed before decontamination', !state.doors['hub-return'], state.doors);
  state = await labWalk(2700);
  state = await pressE();
  check('decontamination starts in the booth', state.decon.active, state.decon);
  await page.waitForTimeout(500);
  await shot('10-exit-decon');
  state = await labWalk(2600);
  check('leaving the booth interrupts the cycle', !state.decon.active && !state.decon.complete && state.decon.interrupted >= 1, state.decon);
  state = await labWalk(2700);
  state = await pressE();
  await page.waitForFunction(() => globalThis.__ATF_BIOFORGE_V80__.runtime.bioforgeExitDeconV188.complete, null, { timeout: 6000 });
  await page.waitForTimeout(600);
  state = await lab();
  check('decontamination complete: hub door open', state.decon.complete && state.doors['hub-return'], state);
  await shot('11-exit-open');
  await page.keyboard.down('KeyD');
  try { await page.waitForFunction(() => document.querySelector('.view.active')?.id !== 'bioforge-ui-v80', null, { timeout: 12000 }); }
  finally { await page.keyboard.up('KeyD'); }
  await page.waitForTimeout(1200);
  const back = await hub();
  const saved = await page.evaluate(() => globalThis.__ATF_BIOFORGE_V80__.snapshot().state);
  check('exit: crossing the door returns to the Tantalus annex', back?.running && back.annex === 'bioforge', back);
  check('save: the session is recorded in the history, no session left active', saved.activeSession?.phase === 'return' && saved.history.length === 1, { phase: saved.activeSession?.phase, history: saved.history.length });
  await page.screenshot({ path: join(out, `${vw}-12-back-in-hub.png`) }); report.shots.push(join(out, `${vw}-12-back-in-hub.png`));

  // 6. Resume: a new session suspended in the airlock survives a page reload.
  await page.locator('#hub-canvas').focus();
  await page.keyboard.press('KeyE'); await page.waitForTimeout(2000); await closeDialogs();
  check('re-entry by the annex station', (await lab()).view === 'bioforge-ui-v80', await lab());
  await page.locator('#bioforge-start-v80').scrollIntoViewIfNeeded();
  await page.locator('#bioforge-start-v80').click(); await page.waitForTimeout(700);
  await page.locator('#bioforge-canvas-v80').focus();
  await labWalk(335); state = await pressE();
  check('second session: stage 1', state.stage === 1, state);
  const before = state;
  await page.waitForTimeout(700);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#title-start').waitFor({ state: 'visible', timeout: 45000 });
  await page.locator('#title-start').click();
  await page.locator('#title-continue').click(); await page.waitForTimeout(2000); await closeDialogs();
  await page.evaluate(() => globalThis.__ATF_BIOFORGE_V80__.open()); await page.waitForTimeout(1500);
  state = await lab();
  check('resume: same session, stage and position after reload', state.phase === 'configuration' && state.stage === 1 && state.running && Math.abs(state.x - before.x) < 6, { before, after: state });
  await page.locator('#bioforge-terminal-toggle-v87').click().catch(() => {});
  await page.locator('#bioforge-purge-v80').click(); await page.waitForTimeout(600);
  state = await lab();
  check('emergency purge from the terminal; outside the cell the exit stays the terminal', state.phase === 'return' && !state.running, state);
  await page.locator('#bioforge-canvas-v80').focus();
  await page.keyboard.press('KeyD'); await page.waitForTimeout(400);
  check('no walk from the airlock after a purge', (await lab()).mode === null, await lab());
  await page.locator('#bioforge-return-v80').click(); await page.waitForTimeout(1200);
  check('terminal return to the hub', (await hub())?.running === true, await hub());
}

report.passed = report.checks.every(entry => entry.passed) && report.pageErrors.length === 0 && report.consoleErrors.length === 0;
await writeFile(join(out, `report-${vw}x${vh}.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ passed: report.passed, checks: report.checks.length, failed: report.checks.filter(entry => !entry.passed).map(entry => entry.label), pageErrors: report.pageErrors, consoleErrors: report.consoleErrors }));
await browser.close();
assert.equal(report.passed, true);
