import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';
import { emptyAudioManifestV77 } from '../src/audio-assets-v77.js';

const baseUrl = process.env.ATF_BASE_URL || 'http://127.0.0.1:4173';
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(process.env.ATF_AUDIO_QA_OUTPUT || join(tmpdir(), `atf-audio-v132-${Date.now()}`));
const relativeOutput = relative(repository, output);
if (!relativeOutput || !relativeOutput.startsWith('..') && !isAbsolute(relativeOutput)) throw new Error('Audio QA output must be outside the repository');
async function playwrightModule() {
  if (process.env.ATF_PLAYWRIGHT_MODULE) return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
  try { return await import('playwright'); } catch (error) {
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__audio_qa__.cjs'))('playwright');
    throw error;
  }
}
const report = { startedAt: new Date().toISOString(), checks: [], pageErrors: [], requestFailures: [] };
let browser, page;
const check = (label, evidence) => report.checks.push({ label, evidence });
const snapshot = () => page.evaluate(() => {
  const audio = globalThis.__ATF_AUDIO_V77__;
  return audio ? { unlock: audio.unlockStatus, scene: audio.scene, status: audio.musicStatus,
    effects: [...audio.effectBuffers].map(([id, buffer]) => ({ id, duration: buffer.duration, channels: buffer.numberOfChannels })),
    music: [...audio.musicVoices].map(voice => ({ scene: voice.scene, stopping: voice.stopping,
      paused: voice.audio.paused, time: voice.audio.currentTime, duration: voice.audio.duration })),
    volumes: { ...audio.volumes }, voices: audio.effectVoices.size, timers: audio.timers.size } : null;
});
async function playing(scene) {
  await page.waitForFunction(scene => [...globalThis.__ATF_AUDIO_V77__.musicVoices]
    .some(voice => voice.scene === scene && !voice.stopping && !voice.audio.paused
      && Number.isFinite(voice.audio.duration) && voice.audio.currentTime > .1), scene);
  const state = await snapshot(); assert.equal(state.scene, scene); assert.equal(state.status, 'playing');
  assert(state.music.some(voice => voice.scene === scene && Math.abs(voice.duration - 24) < .05));
  check(`Actual ${scene} music decodes and advances after a user gesture`, state);
}
async function main() {
  await fs.mkdir(output, { recursive: true });
  const module = await playwrightModule(), { chromium } = module.chromium ? module : module.default;
  browser = await chromium.launch({ headless: true, ...(process.env.ATF_CHROMIUM_EXECUTABLE ? { executablePath: process.env.ATF_CHROMIUM_EXECUTABLE } : {}) });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, serviceWorkers: 'block' });
  page = await context.newPage(); page.setDefaultTimeout(25000);
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('#title-start').click({ timeout: 45000 }); await page.locator('#title-options').click();
  await playing('menu');
  await page.waitForFunction(() => globalThis.__ATF_AUDIO_V77__.effectBuffers.size === 5);
  check('Five real effects decode into reusable audio buffers', (await snapshot()).effects);
  await page.locator('#setting-music').focus(); await page.keyboard.press('Home');
  await page.waitForFunction(() => globalThis.__ATF_AUDIO_V77__.volumes.music === 0 && !globalThis.__ATF_AUDIO_V77__.musicVoices.size);
  check('The music slider releases the actual media when muted', await snapshot());
  await page.keyboard.press('End'); await playing('menu');
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'command';
  await page.locator('#save-import').setInputFiles({ name: 'audio-qa-profile.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).waitFor();
  await page.locator('[data-view="hub"]').click(); await playing('hub');
  await page.locator('#exit-hub').click(); await page.locator('#command-mission-v110').selectOption('pair-004-frontier');
  await page.locator('#operation-launch').click();
  for (let i = 0; i < 16; i++) {
    if (await page.evaluate(() => !!globalThis.__ATF_GAME__?.running)) break;
    const advance = page.locator('[data-insertion-action="advance"]'); if (await advance.isVisible()) await advance.click();
    await page.waitForTimeout(350);
  }
  await playing('mission'); await page.waitForTimeout(700);
  const state = await snapshot(); assert.equal(state.music.length, 1); assert.equal(state.music[0].scene, 'mission');
  check('Scene transitions retire preceding music and keep one active loop', state);
  await page.screenshot({ path: join(output, 'mission-audio.png'), fullPage: true });
  const fallbackContext = await browser.newContext({ serviceWorkers: 'block' });
  const fallbackPage = await fallbackContext.newPage();
  await fallbackPage.route('**/assets/audio/manifest.json', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify(emptyAudioManifestV77()) }));
  await fallbackPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await fallbackPage.locator('#title-start').click({ timeout: 45000 }); await fallbackPage.locator('#title-options').click();
  await fallbackPage.waitForFunction(() => globalThis.__ATF_AUDIO_V77__?.musicStatus === 'silent-missing');
  const fallback = await fallbackPage.evaluate(() => ({ status: globalThis.__ATF_AUDIO_V77__.musicStatus,
    context: globalThis.__ATF_AUDIO_V77__.context.state, effects: globalThis.__ATF_AUDIO_V77__.effectBuffers.size }));
  assert.equal(fallback.context, 'running'); assert.equal(fallback.effects, 0);
  check('Missing optional banks preserve the existing synthesizer and silence fallback', fallback);
  await fallbackContext.close(); assert.equal(report.pageErrors.length, 0); assert.equal(report.requestFailures.length, 0);
  report.status = 'passed';
}
main().catch(async error => { report.status = 'failed'; report.error = { message: error.message, stack: error.stack }; process.exitCode = 1;
  if (page) report.lastState = await snapshot().catch(() => null);
}).finally(async () => { await fs.mkdir(output, { recursive: true }); await fs.writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2));
  await browser?.close(); console.log(JSON.stringify({ status: report.status, checks: report.checks.length, report: join(output, 'report.json'), error: report.error?.message })); });
