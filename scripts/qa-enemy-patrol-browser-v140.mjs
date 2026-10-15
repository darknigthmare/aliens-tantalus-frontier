import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';

// Native UI launches the standard operation. Evaluations only read actors;
// no engine method, input state, position, objective or clock is injected.
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(process.env.ATF_ENEMY_PATROL_QA_OUTPUT || '/tmp/atf-enemy-patrol-v140');
const outputRelative = relative(repository, output);
if (!outputRelative || !outputRelative.startsWith('..') && !isAbsolute(outputRelative)) throw new Error('QA output must be outside the repository.');
async function playwrightModule() {
  if (process.env.ATF_PLAYWRIGHT_MODULE) return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
  try { return await import('playwright'); } catch (error) {
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__enemy_qa__.cjs'))('playwright');
    throw error;
  }
}
const report = { startedAt: new Date().toISOString(), scenario: 'Real save picker → Command → standard ship mission; read-only enemy samples and native P pause.',
  pageErrors: [], requestFailures: [], checks: [], samples: [] };
let browser;
try {
  await fs.mkdir(output, { recursive: true });
  const module = await playwrightModule(), { chromium } = module.chromium ? module : module.default;
  browser = await chromium.launch({ headless: true, ...(process.env.ATF_CHROMIUM_EXECUTABLE ? { executablePath: process.env.ATF_CHROMIUM_EXECUTABLE } : {}) });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, serviceWorkers: 'block' });
  page.setDefaultTimeout(20000);
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
  const snapshot = () => page.evaluate(() => {
    const engine = globalThis.__ATF_GAME__;
    return engine ? { running: engine.running, paused: engine.paused, time: engine.enemyTacticsV130?.time,
      phase: engine.mission?.state, player: { x: engine.player?.x, y: engine.player?.y, health: engine.player?.health, ammo: engine.player?.ammo },
      enemies: engine.enemies.map(enemy => ({ id: enemy.id, x: enemy.x, y: enemy.y, vx: enemy.vx, facing: enemy.facing,
        state: enemy.tacticsV130?.mode, direction: enemy.tacticsV130?.direction,
        patrol: enemy.tacticsV130?.patrolV140 ? { ...enemy.tacticsV130.patrolV140 } : null,
        rear: enemy.rearEntryV130?.phase })) } : null;
  });
  await page.goto(process.env.ATF_BASE_URL || 'http://127.0.0.1:4173', { waitUntil: 'domcontentloaded' });
  await page.locator('#title-start').click({ timeout: 45000 }); await page.locator('#title-options').click();
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'command';
  await page.locator('#save-import').setInputFiles({ name: 'enemy-patrol-legacy-profile-v140.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).waitFor();
  await page.locator('[data-view="command"]').click();
  await page.locator('#command-mission-v110').selectOption('pair-004-frontier');
  await page.locator('#operation-launch').click();
  for (let n = 0; n < 16; n++) {
    if (await page.evaluate(() => Boolean(globalThis.__ATF_GAME__?.running))) break;
    const advance = page.locator('[data-insertion-action="advance"]');
    if (await advance.isVisible()) await advance.click();
    await page.waitForTimeout(350);
  }
  await page.waitForFunction(() => {
    const engine = globalThis.__ATF_GAME__;
    return engine?.running && !engine.paused && !engine.enemyAtlasLoadingPausedV65 && !engine.userCasteLoadingV88;
  }, null, { timeout: 45000 });
  await page.locator('#game-canvas').focus();
  await page.keyboard.down('KeyD');
  try { await page.waitForFunction(() => globalThis.__ATF_GAME__?.player?.x >= 420, null, { timeout: 10000 }); }
  finally { await page.keyboard.up('KeyD'); }
  await page.locator('#game-canvas').screenshot({ path: join(output, '01-native-standard-operation.png') });
  const until = Date.now() + 22000;
  while (Date.now() < until) { report.samples.push(await snapshot()); await page.waitForTimeout(80); }
  const tracks = new Map();
  for (const sample of report.samples) for (const enemy of sample.enemies) if (enemy.state === 'patrol' && enemy.patrol) {
    const track = tracks.get(enemy.id) || []; track.push({ time: sample.time, ...enemy }); tracks.set(enemy.id, track);
  }
  const cycles = [];
  for (const [id, track] of tracks) {
    for (let n = 1; n < track.length; n++) if (track[n].patrol.phase === 'observe' && track[n - 1].patrol.phase === 'travel') {
      const stop = track[n], departure = track.slice(n + 1).find(sample => sample.patrol.phase === 'travel' && sample.direction === -stop.direction && Math.abs(sample.vx) > 1);
      const held = track.slice(n).filter(sample => sample.time >= stop.time && sample.time <= stop.time + .25);
      if (departure && held.length >= 2 && held.every(sample => sample.x === stop.x && sample.vx === 0)) {
        cycles.push({ id, arrival: track[n - 1], stop, heldSeconds: held.at(-1).time - stop.time, departure }); break;
      }
    }
  }
  assert.ok(cycles.length > 0, 'A real standard mission actor must brake, stop and depart in the opposite direction.');
  report.checks.push({ label: 'Native patrol actors stop at a physical endpoint and resume in the opposite direction', cycles });
  await page.keyboard.press('KeyP');
  const paused = await snapshot(); assert.equal(paused.paused, true);
  await page.waitForTimeout(450); const frozen = await snapshot();
  assert.deepEqual(frozen, paused);
  report.checks.push({ label: 'Native P freezes the patrol timeline, poses and resources', snapshot: paused });
  await page.locator('#game-canvas').screenshot({ path: join(output, '02-native-pause.png') });
  await page.keyboard.press('KeyP'); await page.waitForTimeout(160);
  const resumed = await snapshot(); assert.equal(resumed.paused, false); assert.ok(resumed.time > paused.time);
  assert.deepEqual(report.pageErrors, []);
  report.checks.push({ label: 'Native P resumes the same operation without page errors', snapshot: resumed });
  report.passed = true;
} catch (error) { report.passed = false; report.error = error.stack; process.exitCode = 1; }
finally {
  report.finishedAt = new Date().toISOString();
  await fs.writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  await browser?.close();
  console.log(JSON.stringify({ passed: report.passed, checks: report.checks.length, output, error: report.error || null }));
}
