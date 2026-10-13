import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';
import { CAMPAIGNS, WORLDS, LEVEL_SEEDS } from '../src/content.js';
import { getCommandMissionsV110 } from '../src/player-surfaces-v110.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { HORDE_DIRECTOR_V132 } from '../src/horde-director-v132.js';

// Import an ordinary idle legacy profile through the real picker, launch in
// Command, then use keyboard/buttons only. Runtime evaluations only read data.
// This observes actual Chromium simulation and images, not a crowd benchmark.
const baseUrl = process.env.ATF_BASE_URL || 'http://127.0.0.1:4173';
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(process.env.ATF_HORDE_QA_OUTPUT || join(tmpdir(), `atf-horde-v132-${Date.now()}`));
const relativeOutput = relative(repository, output);
if (!relativeOutput || !relativeOutput.startsWith('..') && !isAbsolute(relativeOutput)) throw Error('Horde QA output must be outside the checkout.');
async function playwright() {
  if (process.env.ATF_PLAYWRIGHT_MODULE) return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
  try { return await import('playwright'); } catch (error) {
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__horde_qa__.cjs'))('playwright');
    throw Error('Use an existing Playwright and Chromium installation.', { cause: error });
  }
}
const report = { startedAt: new Date().toISOString(), checks: [], pageErrors: [], requestFailures: [],
  scenario: 'Ordinary ship mission, legacy import through save picker, real Command launch and keyboard travel, real warning wait, pause and native quick-save/reload. No actor, timer, objective or runtime state is assigned through evaluate.' };
let browser, page;
function observed() {
  const e = globalThis.__ATF_GAME__;
  if (!e?.player) return null;
  return { running: e.running, paused: e.paused, loading: !!(e.enemyAtlasLoadingPausedV65 || e.userCasteLoadingV88),
    campaignId: e.campaign?.id, template: e.missionLevelRuntime?.templateId, mission: e.mission?.state, resume: e.lastResumeResult,
    contextualCastes: e.userCasteCampaignActiveV88, neuro: !!e.neuro?.active,
    player: { x: e.player.x, y: e.player.y, w: e.player.w, h: e.player.h, alive: e.player.alive, health: e.player.health },
    director: e.hordeDirectorV132 ? structuredClone(e.hordeDirectorV132) : null, metrics: e.getSnapshot().hordeDirectorV132,
    actors: e.enemies.filter(actor => actor.hordeV132).map(actor => ({ id: actor.id, profileId: actor.profileId, x: actor.x, y: actor.y,
      w: actor.w, h: actor.h, alive: actor.alive, dormant: actor.dormant, health: actor.health, entry: { ...actor.rearEntryV130 } })),
    vertical: e.getVerticalWorldSnapshotV130() };
}
const snapshot = () => page.evaluate(observed);
const check = (label, evidence) => { report.checks.push({ label, evidence }); console.log(JSON.stringify({ check: label })); };
const capture = file => page.locator('#game-canvas').screenshot({ path: join(output, file) });
async function advanceInsertion() {
  for (let n = 0; n < 20; n++) {
    if (await page.evaluate(() => !!globalThis.__ATF_GAME__?.running)) break;
    const button = page.locator('[data-insertion-action="advance"]');
    if (await button.isVisible()) await button.click();
    await page.waitForTimeout(250);
  }
  await page.waitForFunction(() => { const e = globalThis.__ATF_GAME__; return e?.running && !e.paused && !e.enemyAtlasLoadingPausedV65 && !e.userCasteLoadingV88 && e.player?.grounded; }, null, { timeout: 45000 });
  await page.locator('#game-canvas').focus();
}
async function importAndLaunch(campaignId) {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'command'; save.strategy.plannedCampaignId = campaignId;
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('#title-start').click({ timeout: 45000 }); await page.locator('#title-options').click();
  await page.locator('#save-import').setInputFiles({ name: 'horde-idle-legacy-profile.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).last().waitFor();
  await page.locator('[data-view="command"]').click();
  await page.locator('#command-world-v110').selectOption(CAMPAIGNS.find(campaign => campaign.id === campaignId).worldId);
  await page.locator('#command-mission-v110').selectOption(campaignId);
  await page.locator('#operation-launch').click(); await advanceInsertion(); return snapshot();
}
async function main() {
  await fs.mkdir(output, { recursive: true }); const module = await playwright(), { chromium } = module.chromium ? module : module.default;
  browser = await chromium.launch({ headless: true, ...(process.env.ATF_CHROMIUM_EXECUTABLE ? { executablePath: process.env.ATF_CHROMIUM_EXECUTABLE } : {}) });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, serviceWorkers: 'block' });
  page = await context.newPage(); page.setDefaultTimeout(25000);
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
  const candidates = getCommandMissionsV110(createDefaultSave(), CAMPAIGNS).filter(campaign => !campaign.specialOperationId
    && !campaign.id.startsWith('special-') && buildMissionLevelV52({ campaign, world: WORLDS.find(world => world.id === campaign.worldId), levelSeeds: LEVEL_SEEDS }).templateId === 'ship-interior-vertical');
  candidates.sort((a, b) => Number(b.id === 'pair-004-frontier') - Number(a.id === 'pair-004-frontier'));
  let state;
  for (const candidate of candidates) {
    state = await importAndLaunch(candidate.id);
    assert.equal(state.template, 'ship-interior-vertical'); assert.ok(state.director, 'A genuine ordinary app deployment must enable the director.');
    if (state.director.eventSelected) break;
    check('A seed without an event remains quiet; choose another real mission through a fresh idle import', { campaignId: candidate.id, metrics: state.metrics });
  }
  assert.equal(state.director.eventSelected, true); assert.equal(state.contextualCastes, true); assert.equal(state.neuro, false);
  check('Real Command launch coexists with contextual enemy castes and a human operator', state);
  const lift = state.vertical.lifts[0]; assert.ok(lift);
  await page.keyboard.down('KeyD');
  try { await page.waitForFunction(x => { const e = globalThis.__ATF_GAME__; return e.player.x + e.player.w / 2 >= x - 18; }, lift.x + lift.w / 2); }
  finally { await page.keyboard.up('KeyD'); }
  await page.waitForTimeout(300); state = await snapshot(); assert.equal(state.player.alive, true);
  check('Keyboard travel reaches the actual lower elevator near a valid rear threshold', state.player);
  console.log(JSON.stringify({ waitingForWarningSeconds: state.director.firstWarningAt, elapsed: state.director.elapsed }));
  await page.waitForFunction(() => globalThis.__ATF_GAME__?.hordeDirectorV132?.phase === 'warning', null, { timeout: 150000, polling: 100 });
  await page.keyboard.press('KeyP'); const warned = await snapshot(); assert.equal(warned.paused, true);
  assert.equal(warned.director.emitted, 0); assert.ok(warned.director.warningRemaining > 0);
  await capture('01-warning-real-clock.png');
  check('After actual simulation time, a four-second warning precedes every delivered contact', warned);
  await page.waitForTimeout(450); const frozen = await snapshot(); assert.deepEqual(frozen.director, warned.director); assert.deepEqual(frozen.actors, warned.actors);
  check('Pause freezes warning time, population ledger and physical contacts', frozen.director);
  await page.locator('#mission-save-v86').click(); await page.getByText('Sauvegarde locale confirmée.', { exact: true }).last().waitFor();
  const saved = await snapshot(); assert.equal(saved.director.phase, 'warning');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('atf-v47-profile-1'))?.strategy?.currentOperation?.resumeState?.hordeDirectorV132);
  assert.ok(stored); assert.equal(stored.stamp, saved.director.stamp); assert.equal(stored.wave, saved.director.wave);
  check('The visible quick-save button commits the signed warning checkpoint', stored);
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 });
  if (await page.locator('#title-continue').isVisible()) await page.locator('#title-continue').click();
  await page.locator('[data-view="command"]').click(); await page.locator('#continue-operation').click(); await advanceInsertion();
  await page.keyboard.press('KeyP'); state = await snapshot(); assert.equal(state.resume.applied, true);
  assert.equal(state.director.stamp, saved.director.stamp); assert.equal(state.director.wave, saved.director.wave); assert.equal(state.director.emitted, saved.director.emitted);
  assert.ok(state.director.warningRemaining <= saved.director.warningRemaining && state.director.warningRemaining > 0);
  check('Reload restores the matching wave and remaining warning instead of issuing another wave', state);
  await page.keyboard.press('KeyP');
  await page.waitForFunction(() => globalThis.__ATF_GAME__.enemies.some(actor => actor.hordeV132 && actor.rearEntryV130?.phase === 'approach'), null, { timeout: 15000, polling: 50 });
  await page.keyboard.press('KeyP'); state = await snapshot();
  const rear = state.actors.find(actor => actor.entry.phase === 'approach'); assert.ok(rear); assert.equal(rear.dormant, true); assert.equal(rear.health, 1);
  await capture('02-background-approach.png'); check('The real admitted actor approaches from the rear plane while dormant', rear);
  await page.keyboard.press('KeyP');
  await page.waitForFunction(() => globalThis.__ATF_GAME__.enemies.some(actor => actor.hordeV132 && actor.rearEntryV130?.phase === 'active'), null, { timeout: 12000 });
  await page.keyboard.press('KeyP'); state = await snapshot();
  const active = state.actors.find(actor => actor.entry.phase === 'active'); assert.ok(active); assert.equal(active.dormant, false);
  assert.ok(state.metrics.emitted <= HORDE_DIRECTOR_V132.maxTotal && state.metrics.live <= HORDE_DIRECTOR_V132.maxLive);
  assert.ok(state.metrics.globalLive <= HORDE_DIRECTOR_V132.maxGlobalLive && state.metrics.stored <= HORDE_DIRECTOR_V132.maxStored);
  await capture('03-active-threshold.png'); check('A physical contact enters the playable plane within all population bounds', { actor: active, metrics: state.metrics });
  assert.equal(state.player.alive, true); assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.requestFailures, []);
  report.status = 'passed';
}
main().catch(async error => {
  report.status = 'failed'; report.error = { message: error.message, stack: error.stack };
  if (page) { report.lastState = await snapshot().catch(() => null); await page.screenshot({ path: join(output, 'failure.png'), fullPage: true }).catch(() => {}); }
  process.exitCode = 1;
}).finally(async () => {
  report.finishedAt = new Date().toISOString(); await fs.writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2));
  await browser?.close(); console.log(JSON.stringify({ status: report.status, checks: report.checks.length, error: report.error?.message, report: join(output, 'report.json') }));
});
