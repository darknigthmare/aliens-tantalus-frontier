import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';

// Ordinary imported idle profiles enter through the real Save file picker.
// One fixture begins with a wounded colleague and a deceased reservist, with
// no completed operations, fabricated service events or conversation entries.
// Only visible controls change the game or storage. Browser evaluations read
// persisted records, image pixels and runtime observations; they never call a
// gameplay action, alter an actor or inject a completed objective.
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.ATF_BASE_URL || 'http://127.0.0.1:4173';
const output = resolve(process.env.ATF_CONTINUATION_QA_OUTPUT || join(tmpdir(), `atf-continuation-v135-${Date.now()}`));
const outputRelative = relative(repository, output);
if (!outputRelative || !outputRelative.startsWith('..') && !isAbsolute(outputRelative)) throw Error('QA evidence must remain outside the checkout.');
const report = { status: 'running', startedAt: new Date().toISOString(), checks: [], pageErrors: [], requestFailures: [],
  method: 'Actual Save file picker for disclosed idle fixtures; live crew controls, native profile creation, real hub canvas photographs and archive controls; storage and runtime observations only.' };
let browser, page;
async function playwright() {
  if (process.env.ATF_PLAYWRIGHT_MODULE) return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
  try { return await import('playwright'); } catch (error) {
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__continuation_qa__.cjs'))('playwright');
    throw Error('An existing Playwright and Chromium installation is required.', { cause: error });
  }
}
function check(label, evidence) { report.checks.push({ label, evidence }); }
const saved = (profile = 1) => page.evaluate(slot => JSON.parse(localStorage.getItem(`atf-v47-profile-${slot}`) || 'null'), profile);
const memory = async (profile = 1) => (await saved(profile))?.crewConversationMemoryV135?.entries || [];
const gallery = () => page.locator('#field-media-archives-v135');
const dossier = () => page.locator('#crew-dossier-v85');
async function view(name) {
  const button = page.locator(`[data-view="${name}"]`);
  if (!await button.isVisible()) await page.locator('#menu-toggle').click();
  await button.click(); await page.locator(`[data-panel="${name}"].active`).waitFor();
}
async function importIdle(profile, wounded = false) {
  const fixture = createDefaultSave(profile);
  fixture.needsPlayerCreationV84 = false; fixture.scene = 'command';
  if (wounded) {
    fixture.crew[0].health = 55;
    fixture.crew[4].status = 'deceased'; fixture.crew[4].health = 0;
  }
  await view('settings');
  await page.locator('#save-import').setInputFiles({ name: `continuation-idle-profile-${profile}.json`, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).last().waitFor();
  return fixture;
}
async function openMember(id, tab = 'active') {
  await view('crew'); await page.locator(`#crew-list .crew-tabs-v85 [data-v85-tab="${tab}"]`).click();
  await page.locator(`#crew-list [data-v85-open="${id}"]`).click(); await dossier().waitFor({ state: 'visible' });
}
async function closeMember() {
  await dossier().locator('[data-v85-close]').click(); await dossier().waitFor({ state: 'hidden' });
}
async function reloadToSettings() {
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#title-start').click({ timeout: 45000 }); await page.locator('#title-options').click();
}
async function readPhotos() {
  return page.evaluate(async () => {
    if (!(await indexedDB.databases()).some(entry => entry.name === 'atf-field-media-v135')) return [];
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('atf-field-media-v135', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result, transaction = db.transaction('photos', 'readonly'), all = transaction.objectStore('photos').getAll();
        all.onerror = () => { db.close(); reject(all.error); };
        all.onsuccess = () => { const rows = all.result.map(({ blob, ...metadata }) => ({ ...metadata, blobSize: blob?.size, blobType: blob?.type })); db.close(); resolve(rows); };
      };
    });
  });
}
async function verifyConversation() {
  const initial = await importIdle(1, true), crewId = initial.crew[0].id, memorialId = initial.crew[4].id;
  report.fixture = { woundedCrewId: crewId, woundedHealth: 55, memorialCrewId: memorialId, missionResults: 0, importedConversationEntries: 0 };
  await openMember(crewId);
  assert.deepEqual(await memory(), []);
  const readiness = () => dossier().locator('[data-v120-conversation-topic="readiness"]');
  const before = await saved(), initialAnswer = await dossier().locator('[data-v120-conversation-answer]').innerText();
  await readiness().click();
  await page.waitForFunction(id => JSON.parse(localStorage.getItem('atf-v47-profile-1') || 'null')?.crewConversationMemoryV135?.entries?.some(entry => entry.crewId === id && entry.topicId === 'readiness'), crewId);
  const first = await memory(), entry = first.find(item => item.crewId === crewId && item.topicId === 'readiness');
  assert.equal(first.length, 1); assert.ok(entry.contextKey);
  const after = await saved(); assert.deepEqual(after.crew, before.crew); assert.deepEqual(after.clock, before.clock);
  assert.deepEqual(after.galaxy.resources, before.galaxy.resources);
  for (const key of ['serial', 'currentOperation', 'lastOperation', 'log', 'inventory', 'selectedCrewIds']) assert.deepEqual(after.strategy[key], before.strategy[key]);
  assert.equal(await page.evaluate(() => document.activeElement?.dataset.v120ConversationTopic), 'readiness');
  check('Opening a live dossier is read-only; explicitly choosing a topic persists its context without changing crew, clock, resources, operation results or inventory', entry);
  await readiness().click(); assert.deepEqual(await memory(), first);
  await closeMember(); await openMember(crewId); await readiness().click(); assert.deepEqual(await memory(), first);
  check('Repeated clicks and reopening the same topic preserve the exact ledger and timestamps', first);
  await dossier().locator(`[data-v85-action="treat"][data-v85-id="${crewId}"]`).click();
  await page.waitForFunction(id => JSON.parse(localStorage.getItem('atf-v47-profile-1') || 'null')?.crew.find(member => member.id === id)?.health > 55, crewId);
  const treated = await saved(); assert.equal(treated.galaxy.resources.medical, before.galaxy.resources.medical - 1);
  assert.deepEqual(await memory(), first, 'A medical action must not manufacture an explicit conversation read.');
  assert.notEqual(await dossier().locator('[data-v120-conversation-answer]').innerText(), initialAnswer);
  await readiness().click();
  const changed = await memory(), nextEntry = changed.find(item => item.crewId === crewId && item.topicId === 'readiness');
  assert.equal(changed.length, 1); assert.notEqual(nextEntry.contextKey, entry.contextKey);
  check('A paid native medical action changes the actual readiness answer; the new context is recorded only after an explicit topic click', { before: entry, after: nextEntry, health: treated.crew.find(item => item.id === crewId).health });
  await page.screenshot({ path: join(output, '01-crew-context.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await readiness().click(); const bounds = await dossier().boundingBox();
  assert.ok(bounds.x >= -1 && bounds.x + bounds.width <= 391); assert.ok(bounds.y >= -1 && bounds.y + bounds.height <= 845);
  await page.screenshot({ path: join(output, '02-mobile-crew.png'), fullPage: true });
  await page.keyboard.press('Tab'); assert.equal(await page.evaluate(() => Boolean(document.querySelector('#crew-dossier-v85')?.contains(document.activeElement))), true);
  check('The crew dossier fits a 390px viewport and keeps native keyboard focus inside the modal', bounds);
  await page.setViewportSize({ width: 1600, height: 1000 }); await closeMember();
  await page.locator('#crew-list .crew-tabs-v85 [data-v85-tab="candidates"]').click();
  const candidate = page.locator('#crew-list [data-v85-member] [data-v85-open]').first(); assert.ok(await candidate.count());
  await candidate.click(); const candidateTopic = dossier().locator('[data-v120-conversation-topic]').first();
  await candidateTopic.click(); assert.deepEqual(await memory(), changed); await closeMember();
  await openMember(memorialId, 'reserve');
  assert.equal(await dossier().locator('[data-v120-conversation-topic]').count(), 0);
  assert.equal(await dossier().locator('[data-v135-conversation-memory]').count(), 0); assert.deepEqual(await memory(), changed);
  check('Candidate interviews and a disclosed memorial fixture cannot enter the live conversation ledger', { candidateTopics: true, memorialTopics: 0, entries: changed.length });
  await closeMember(); await reloadToSettings();
  await openMember(crewId); await readiness().click(); assert.deepEqual(await memory(), changed);
  await closeMember(); check('An actual reload preserves the same reviewed context without another entry', changed);
  return { crewId, entries: changed };
}
async function captureHubPhoto() {
  await view('hub'); await page.locator('#hub-canvas').waitFor({ state: 'visible' });
  await page.waitForFunction(() => globalThis.__ATF_HUB__?.running && globalThis.__ATF_HUB__?.player?.health > 0);
  await page.waitForTimeout(350);
  const before = await saved(); await page.locator('[data-panel="hub"] [data-field-media-capture-v135]').click();
  await page.waitForFunction(async () => {
    if (!(await indexedDB.databases()).some(entry => entry.name === 'atf-field-media-v135')) return false;
    return new Promise(resolve => { const request = indexedDB.open('atf-field-media-v135', 1); request.onerror = () => resolve(false); request.onsuccess = () => {
      const db = request.result, count = db.transaction('photos', 'readonly').objectStore('photos').count(); count.onsuccess = () => { db.close(); resolve(count.result > 0); }; count.onerror = () => { db.close(); resolve(false); };
    }; });
  });
  await page.waitForFunction(() => document.querySelector('[data-field-media-status-v135]')?.textContent.includes('Photo conservée'));
  const rows = await readPhotos(); report.captureRows = rows; assert.equal(rows.length, 1); const record = rows[0];
  assert.equal(record.schema, 135); assert.equal(record.profile, 1); assert.ok(record.blobSize > 1000); assert.equal(record.mimeType, record.blobType);
  assert.ok(record.width > 0 && record.height > 0); assert.equal(record.scene, 'hub');
  const after = await saved(); assert.deepEqual(after.crewConversationMemoryV135, before.crewConversationMemoryV135);
  assert.deepEqual(after.galaxy.resources, before.galaxy.resources); assert.deepEqual(after.statistics, before.statistics);
  check('The visible hub capture button stores a real bounded image Blob without an evidence reward or conversation write', record);
  await page.locator('#exit-hub').click(); await view('archives');
  await gallery().locator(`[data-field-media-open-v135="${record.id}"]`).click();
  const image = gallery().locator('[data-field-media-image-v135]'); await image.waitFor();
  await image.evaluate(async element => { await element.decode(); });
  const pixels = await image.evaluate(element => {
    const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 36;
    const context = canvas.getContext('2d'); context.drawImage(element, 0, 0, canvas.width, canvas.height);
    const rgba = context.getImageData(0, 0, canvas.width, canvas.height).data, colors = new Set(); let opaque = 0;
    for (let i = 0; i < rgba.length; i += 4) { if (rgba[i + 3]) opaque++; colors.add(`${rgba[i]},${rgba[i+1]},${rgba[i+2]}`); }
    return { naturalWidth: element.naturalWidth, naturalHeight: element.naturalHeight, opaquePixels: opaque, distinctColors: colors.size };
  });
  assert.equal(pixels.naturalWidth, record.width); assert.equal(pixels.naturalHeight, record.height); assert.ok(pixels.opaquePixels > 1000); assert.ok(pixels.distinctColors > 16);
  await page.screenshot({ path: join(output, '03-local-photo.png'), fullPage: true });
  check('Archives open and decode the actual stored photograph with visible nonempty image content', pixels);
  await gallery().locator('[data-field-media-close-v135]').click();
  assert.equal(await page.evaluate(() => document.activeElement?.dataset.fieldMediaOpenV135), record.id);
  check('Closing a photograph restores focus to its native opening control', { id: record.id });
  await reloadToSettings(); await view('archives');
  await gallery().locator(`[data-field-media-open-v135="${record.id}"]`).click();
  await gallery().locator('[data-field-media-image-v135]').evaluate(async element => { await element.decode(); });
  assert.equal((await readPhotos()).find(item => item.id === record.id).blobSize, record.blobSize);
  check('Reload reopens the same locally stored image and byte count', { id: record.id, bytes: record.blobSize });
  await page.setViewportSize({ width: 390, height: 844 });
  const bounds = await gallery().locator('[data-field-media-image-v135]').boundingBox();
  assert.ok(bounds.x >= -1 && bounds.x + bounds.width <= 391);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); assert.ok(overflow <= 1, `Mobile page overflow: ${overflow}px`);
  await page.screenshot({ path: join(output, '04-mobile-photo.png'), fullPage: true });
  check('The photograph and archive controls fit the mobile viewport without horizontal overflow', bounds);
  await page.setViewportSize({ width: 1600, height: 1000 });
  return record;
}
async function verifyIsolationAndDelete(conversation, photo) {
  await view('settings'); await page.locator('[data-profile="2"]').click();
  await page.locator('#player-creator-v84').waitFor({ state: 'visible' });
  await page.locator('#player-name-v84').fill('QA Second Marine'); await page.locator('#player-callsign-v84').fill('QA-TWO');
  await page.locator('#player-creator-form-v84 button[type="submit"]').click();
  await page.locator('#player-creator-v84').waitFor({ state: 'hidden' });
  // A new character is in the physical onboarding level; the real title
  // System option remains the supported path to importing an idle fixture.
  await reloadToSettings();
  await importIdle(2); assert.deepEqual(await memory(2), []);
  await view('archives'); assert.equal(await gallery().locator('[data-field-media-item-v135]').count(), 0);
  assert.ok((await readPhotos()).some(item => item.id === photo.id), 'Switching profiles must retain the other owner’s bytes.');
  await openMember(conversation.crewId); await dossier().locator('[data-v120-conversation-topic="readiness"]').click();
  const secondMemory = await memory(2); assert.equal(secondMemory.length, 1);
  assert.deepEqual(await memory(1), conversation.entries); await closeMember();
  check('A genuinely created second profile sees no first-profile photographs or conversation reads and writes only its own ledger', { firstEntries: (await memory(1)).length, secondEntries: secondMemory.length });
  await view('settings'); await page.locator('[data-profile="1"]').click();
  assert.deepEqual(await memory(1), conversation.entries); await view('archives');
  await gallery().locator(`[data-field-media-open-v135="${photo.id}"]`).click();
  await gallery().locator('[data-field-media-image-v135]').evaluate(async element => { await element.decode(); });
  check('Returning through the real profile picker restores the original private photograph and conversation ledger', { id: photo.id, profile: 1 });
  await gallery().locator(`[data-field-media-delete-v135="${photo.id}"]`).click();
  await gallery().locator(`[data-field-media-item-v135="${photo.id}"]`).waitFor({ state: 'detached' });
  assert.equal((await readPhotos()).some(item => item.id === photo.id), false);
  assert.deepEqual(await memory(2), secondMemory); assert.deepEqual(await memory(1), conversation.entries);
  await reloadToSettings(); await view('archives'); assert.equal(await gallery().locator('[data-field-media-item-v135]').count(), 0);
  check('Native deletion removes the photo bytes and remains deleted after reload, without altering either conversation ledger', { deletedId: photo.id });
}
async function main() {
  await fs.mkdir(output, { recursive: true }); const module = await playwright(), { chromium } = module.chromium ? module : module.default;
  browser = await chromium.launch({ headless: true, ...(process.env.ATF_CHROMIUM_EXECUTABLE ? { executablePath: process.env.ATF_CHROMIUM_EXECUTABLE } : {}) });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, serviceWorkers: 'block' });
  page = await context.newPage(); page.setDefaultTimeout(25000);
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 }); await page.locator('#title-options').click();
  const conversation = await verifyConversation(), photo = await captureHubPhoto(); await verifyIsolationAndDelete(conversation, photo);
  assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.requestFailures, []); report.status = 'passed';
}
await main().catch(async error => {
  report.status = 'failed'; report.error = { message: error.message, stack: error.stack }; process.exitCode = 1;
  if (page) { report.persisted = await saved().catch(() => null); report.lastDom = await page.evaluate(async () => ({ url: location.href, view: document.querySelector('.view.active')?.dataset.panel,
    photoStatus: document.querySelector('[data-field-media-status-v135]')?.textContent, databases: (await indexedDB.databases()).map(entry => entry.name) })).catch(() => null);
    await page.screenshot({ path: join(output, 'failure.png'), fullPage: true }).catch(() => {}); }
}).finally(async () => {
  report.finishedAt = new Date().toISOString(); await fs.mkdir(output, { recursive: true }); await fs.writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2));
  await browser?.close(); console.log(JSON.stringify({ status: report.status, checks: report.checks.length, error: report.error?.message, report: join(output, 'report.json') }));
});
