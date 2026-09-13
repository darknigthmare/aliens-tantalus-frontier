import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createDefaultSave, SAVE_PREFIX } from '../src/save.js';
import { createPlayerOnboardingV84, advancePlayerOnboardingV84 } from '../src/player-onboarding-v84.js';
import { CAMPAIGNS } from '../src/content.js';

// Prepare/run this script serially. It never launches Chrome or an HTTP server.
// Context isolation protects storage, not focus from another bringToFront call.
const base = new URL(process.env.APP_URL || 'http://127.0.0.1:4187/');
const output = resolve(process.env.QA_OUTPUT || 'C:/Users/chuck/Documents/Codex/2026-08-20/prend-la-conversation-chat-gpt-alien/qa-v86-placeables-source');
const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9236';
const calmFixture = process.env.QA_CALM_FIXTURE !== '0';
const equipmentIds = ['equipment-020-portable-sentry','equipment-024-cryo-mine','equipment-026-electroshock-trap','equipment-028-portable-quarantine'];
const sentryId = equipmentIds[0], storageKey = SAVE_PREFIX + '1';
const fixture = createDefaultSave(1);
fixture.needsPlayerCreationV84 = false;
fixture.onboardingV84 = createPlayerOnboardingV84({ name: 'QA Field Operator', callsign: 'QA-V86' });
for (const event of ['wake-confirmed', { type: 'medical-next', dialogueNode: 0 }, { type: 'medical-next', dialogueNode: 1 }, 'medical-complete', { type: 'briefing-next', dialogueNode: 0 }, { type: 'briefing-next', dialogueNode: 1 }, 'briefing-complete']) {
  const result = advancePlayerOnboardingV84(fixture.onboardingV84, event); assert.equal(result.ok, true); fixture.onboardingV84 = result.state;
}
fixture.settings.coop = true; fixture.settings.difficulty = 'story'; fixture.settings.aimAssist = 'off'; fixture.settings.reducedMotion = true;
fixture.player.equipmentIds = [...equipmentIds]; fixture.strategy.inventory.equipmentIds = [...new Set([...fixture.strategy.inventory.equipmentIds, ...equipmentIds])];
fixture.strategy.selectedVehicleId = null;
fixture.galaxy.resources.credits = 10000; fixture.hub.systems.supplies = 100;
const campaign = CAMPAIGNS.find(item => fixture.galaxy.unlockedWorldIds.includes(item.worldId) && !item.specialOperationId);
assert.ok(campaign); fixture.strategy.plannedCampaignId = campaign.id;
const report = { ok: false, base: base.href,
  scope: 'Isolated preboot save fixture: completed onboarding, four existing equipment families, coop enabled. All selection, confirmation, cancellation, pause, recovery, saving and resuming use native UI/keys. Optional UI-isolation fixture removes the initial enemy roster once on each mission start, including resume; combat is tested separately and is NOT certified by this UI scenario. No terrain, ally, player position or placement rule is altered. One explicit deployed-sentry fixture sets health37/ammo0 solely to test persistent empty/damaged recovery. No runtime business-method calls, no broad campaign claim, no B03 runtime or new orthographic-art claim.',
  fixture: { equipmentIds, campaignId: campaign.id, coop: true, identity: fixture.onboardingV84.identity, calmFixture }, checks: {}, screenshots: [], errors: [] };
await mkdir(output, { recursive: true });
const info = await fetch(endpoint + '/json/version').then(response => response.json());
const socket = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }); });
let seq = 0, session, context, mobile = false;
const pending = new Map();
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (pending.has(message.id)) { const job = pending.get(message.id); pending.delete(message.id); clearTimeout(job.timer); message.error ? job.reject(Error(message.error.message)) : job.resolve(message.result); }
  if (message.sessionId !== session) return;
  if (message.method === 'Runtime.exceptionThrown') report.errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') report.errors.push(message.params.args.map(arg => arg.value || arg.description).join(' '));
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) report.errors.push(`${message.params.response.status} ${message.params.response.url}`);
});
const cdp = (method, params = {}, browser = false) => new Promise((resolve, reject) => {
  const id = ++seq, timer = setTimeout(() => { pending.delete(id); reject(Error(`CDP timeout ${method}`)); }, 15000);
  pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params, ...(session && !browser ? { sessionId: session } : {}) }));
});
async function read(expression) {
  const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
const wait = ms => new Promise(ok => setTimeout(ok, ms));
async function until(expression, label, attempts = 150) {
  for (let attempt = 0; attempt < attempts; attempt++) { const result = await read(expression); if (result) return result; await wait(100); }
  throw Error(`Timed out: ${label}`);
}
async function key(code, down = true) {
  const value = code.startsWith('Key') ? code.slice(3).toLowerCase() : code;
  const windowsVirtualKeyCode = code.startsWith('Key') ? code.charCodeAt(3) : { Escape: 27, Enter: 13, Space: 32, Home: 36, ArrowDown: 40 }[code] || 0;
  await cdp('Input.dispatchKeyEvent', { type: down ? 'keyDown' : 'keyUp', key: value, code, windowsVirtualKeyCode });
}
async function tap(code) { await key(code); await wait(35); await key(code, false); await wait(75); }
async function click(selector) {
  await read(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({behavior:'instant',block:'center',inline:'nearest'})`);
  let prior = '', stable = 0;
  for (let attempt = 0; attempt < 30; attempt++) { await wait(50); const rect = await read(`JSON.stringify(document.querySelector(${JSON.stringify(selector)})?.getBoundingClientRect().toJSON())`); stable = rect === prior ? stable + 1 : 0; prior = rect; if (stable >= 3) break; }
  assert.ok(stable >= 3, `Unstable click target ${selector}`);
  const point = await read(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing '+${JSON.stringify(selector)});const r=e.getBoundingClientRect();if(!r.width||!r.height||e.disabled)throw Error('Unavailable '+${JSON.stringify(selector)});const x=r.x+r.width/2,y=r.y+r.height/2,h=document.elementFromPoint(x,y);if(h!==e&&!e.contains(h))throw Error('Obscured '+${JSON.stringify(selector)});return{x,y};})()`);
  if (mobile) { await cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] }); await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
  else { await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point }); await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', buttons: 1, clickCount: 1 }); await wait(35); await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', buttons: 0, clickCount: 1 }); }
  await wait(120);
}
async function operator(role) {
  const selector = '[data-placeable-operator]'; await click(selector); await tap('Home'); if (role === 'coop') await tap('ArrowDown'); await tap('Enter');
  await until(`document.querySelector('${selector}')?.value===${JSON.stringify(role)}`, 'native equipment operator select');
}
const save = '__ATF_V51__.saveSystem.data';
async function snapshot() {
  return read(`(()=>{const g=__ATF_GAME__;return {running:g.running,paused:g.paused,missionState:g.mission?.state,coopEnabled:g.coopEnabled,placeables:g.getPlaceablesSnapshotV86(),player:{id:g.player.crewId||g.player.operatorId,x:g.player.x,y:g.player.y,w:g.player.w,h:g.player.h},coop:{id:g.coop.crewId||g.coop.operatorId,x:g.coop.x,y:g.coop.y,w:g.coop.w,h:g.coop.h},equipment:[...g.equipmentActions.values()].map(e=>({id:e.id,remaining:e.remaining,uses:e.uses})),operationId:${save}.strategy.currentOperation?.id,resumeApplied:g.lastResumeResult?.applied};})()`);
}
const getInstance = (state, id) => state.placeables.instances.find(item => item.instanceId === id);
async function capture(name) {
  const target = name.startsWith('05-mobile') ? '#mission-equipment-controls' : '#game-canvas';
  await read(`document.querySelector(${JSON.stringify(target)})?.scrollIntoView({behavior:'instant',block:'center',inline:'nearest'})`);
  await wait(120);
  report.checks.layouts ||= {};
  report.checks.layouts[name] = await read('(()=>{const c=document.querySelector("#game-canvas").getBoundingClientRect(),d=document.querySelector("#mission-equipment-controls").getBoundingClientRect();return {innerWidth,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,dialogCount:document.querySelectorAll("dialog[open]").length,canvas:{x:c.x,y:c.y,w:c.width,h:c.height},dock:{x:d.x,y:d.y,w:d.width,h:d.height},dockOverlapsCanvas:d.width>0&&d.height>0&&d.left<c.right&&d.right>c.left&&d.top<c.bottom&&d.bottom>c.top};})()');
  assert.equal(report.checks.layouts[name].dockOverlapsCanvas, false, 'equipment dock does not intercept aiming over the canvas');
  const shot = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 82, captureBeyondViewport: false }); await writeFile(resolve(output, `${name}.jpg`), Buffer.from(shot.data, 'base64')); report.screenshots.push(`${name}.jpg`);
}
async function boot() {
  await until('globalThis.__ATF_GAME__ && globalThis.__ATF_V61__ && !document.querySelector("#boot")', 'boot', 450);
  assert.ok(await read('document.body.innerText.trim().length>0')); assert.equal(await read('!!document.querySelector(".vite-error-overlay,[data-nextjs-dialog]")'), false);
}
async function mission() {
  for (let step = 0; step < 24; step++) { if (await read('__ATF_GAME__.running')) break; await click('[data-insertion-action="advance"]'); }
  await until('__ATF_GAME__.running && !__ATF_GAME__.enemyAtlasLoadingPausedV65 && __ATF_GAME__.mission?.state==="active" && __ATF_GAME__.placeablesV86', 'mission running');
}
async function pause(value) { if (await read('__ATF_GAME__.paused') !== value) await tap('Escape'); assert.equal(await read('__ATF_GAME__.paused'), value); }
async function isolateUiScenario(label) {
  if (!calmFixture) return;
  report.fixture.combatIsolation ||= [];
  report.fixture.combatIsolation.push(await read(`(()=>{const g=__ATF_GAME__,removedIds=g.enemies.map(e=>e.id);g.enemies=[];return {label:${JSON.stringify(label)},removedIds,reason:'Explicit UI-only fixture: initial enemy roster removed once. Collision rules, platforms, NPCs and all controls stay real. Combat coverage is separate.'};})()`));
}
async function selectSentry(role = 'player') {
  await click(`[data-use-equipment="${sentryId}"]`);
  await until(`__ATF_GAME__.getPlaceablesSnapshotV86().previews.some(p=>p.actorCrewId===(__ATF_GAME__.${role}.crewId||__ATF_GAME__.${role}.operatorId))`, 'equipment preview');
  const current = await snapshot(), actor = role === 'coop' ? current.coop : current.player;
  return current.placeables.previews.find(p => p.actorCrewId === actor.id);
}
async function validPlayerPreview() {
  await selectSentry();
  const reasons = [];
  for (let step = 0; step < 18; step++) {
    const current = await snapshot(), preview = current.placeables.previews.find(p => p.actorCrewId === current.player.id);
    if (preview?.valid) return preview;
    reasons.push(preview?.reason || 'preview missing');
    // Walk/reorient with real controls; never move an actor or remove terrain through JS.
    // The insertion ledge is crowded and split by pits. Cross to the wider
    // right-hand platform with a normal jump; walking left falls off the level.
    if (step === 0 && current.player.x < 370) {
      await key('KeyD'); await tap('Space');
      try { await until('__ATF_GAME__.player.x>=410 || !__ATF_GAME__.player.alive', 'native approach to the first broad platform', 25); }
      finally { await key('KeyD', false); }
      await until('__ATF_GAME__.player.grounded && Math.abs(__ATF_GAME__.player.vx)<1', 'native landing', 30);
    } else {
      await key('KeyD'); await wait(100); await key('KeyD', false); await wait(150);
    }
    if (!(await snapshot()).placeables.previews.length) throw Error('Preview cancelled during native approach');
  }
  throw Error(`No valid placement found by bounded native movement: ${reasons.join(' | ')}`);
}
async function showNearby() {
  await until('document.querySelector(".placeable-nearby-v86 summary")', 'nearby equipment UI');
  if (!await read('document.querySelector(".placeable-nearby-v86").open')) await click('.placeable-nearby-v86 summary');
}

try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true));
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true);
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId, flatten: true }, true));
  for (const domain of ['Page','Runtime','Network']) await cdp(domain + '.enable');
  await cdp('Network.setBypassServiceWorker', { bypass: true }); await cdp('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, mobile: false, deviceScaleFactor: 1 });
  await cdp('Emulation.setFocusEmulationEnabled', { enabled: true });
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `if(location.origin===${JSON.stringify(base.origin)}&&!sessionStorage.getItem('qa-v86-fixture')){localStorage.setItem(${JSON.stringify(storageKey)},${JSON.stringify(JSON.stringify(fixture))});sessionStorage.setItem('qa-v86-fixture','1');}` });
  await cdp('Page.navigate', { url: new URL('?qa=placeables-v86', base).href }); await cdp('Page.bringToFront'); await boot();
  await click('#title-start'); await click('#title-continue'); await until('__ATF_HUB__.running', 'completed onboarding continues into hub');
  await click('#exit-hub'); await click('#continue-operation'); await mission(); await pause(true);
  const initial = await snapshot(); assert.equal(initial.coopEnabled, true);
  assert.equal(await read('document.querySelector("[data-placeable-operator]")?.value'), 'player', 'J1 remains the default after engine initialization');
  assert.deepEqual([...new Set(initial.placeables.instances.map(item => item.catalogId))].sort(), [...equipmentIds].sort());
  assert.ok(initial.placeables.instances.every(item => item.status === 'carried'));
  report.checks.initial = initial;
  report.checks.initialTerrain = await read('({platforms:__ATF_GAME__.platforms.filter(p=>p.x<900).map(({x,y,w,h})=>({x,y,w,h})),actors:__ATF_GAME__.placeableActorsV86().map(({crewId,x,y,w,h})=>({crewId,x,y,w,h}))})');
  await isolateUiScenario('initial mission');
  await pause(false);
  const preview = await validPlayerPreview();
  await capture('01-native-bitmap-preview');
  report.checks.preview = preview;
  await click('[data-placeable-action="confirm"]'); await until('__ATF_GAME__.placeableTasksV86.size===1', 'installation started');
  await key('KeyA'); await wait(100); await key('KeyA', false); await until('__ATF_GAME__.placeableTasksV86.size===0', 'movement cancels installation');
  let current = await snapshot(); assert.equal(getInstance(current, preview.instanceId).status, 'carried');
  assert.deepEqual(current.equipment, initial.equipment); report.checks.movementCancellation = true;
  const secondPreview = await validPlayerPreview(); await click('[data-placeable-action="confirm"]');
  await until('__ATF_GAME__.placeableTasksV86.size===1', 'second installation started'); await wait(250); await pause(true);
  const paused = await snapshot(); assert.equal(paused.placeables.tasks.length, 1);
  assert.ok(paused.placeables.tasks[0].elapsed < paused.placeables.tasks[0].duration);
  await wait(500); const frozen = await snapshot(); assert.equal(frozen.placeables.tasks[0].elapsed, paused.placeables.tasks[0].elapsed);
  assert.equal(getInstance(frozen, secondPreview.instanceId).status, 'carried'); assert.deepEqual(frozen.equipment, initial.equipment);
  report.checks.pauseFreezesWithoutConsumption = true;
  await pause(false); await until(`__ATF_GAME__.getPlaceablesSnapshotV86().instances.some(i=>i.instanceId===${JSON.stringify(secondPreview.instanceId)}&&i.status==='deployed')`, 'native installation completes', 100);
  current = await snapshot(); const installed = getInstance(current, secondPreview.instanceId);
  assert.equal(installed.onGround, true); assert.equal(installed.maxAmmo, 150);
  assert.equal(current.equipment.find(item => item.id === sentryId).remaining, initial.equipment.find(item => item.id === sentryId).remaining - 1);
  report.checks.installed = installed; await capture('02-native-installed-sentry');
  await pause(true);
  report.fixture.emptyDamagedSentry = await read(`(()=>{const i=__ATF_GAME__.placeablesV86.instances.find(i=>i.instanceId===${JSON.stringify(installed.instanceId)});if(!i||i.status!=='deployed')throw Error('Fixture target not deployed');const before={health:i.health,ammo:i.ammo};i.health=37;i.ammo=0;return{instanceId:i.instanceId,before,after:{health:i.health,ammo:i.ammo},reason:'Single explicit empty/damaged state to test native recovery without refilling'};})()`);
  await pause(false); await showNearby(); await click(`[data-placeable-recover="${installed.instanceId}"]`);
  await until(`__ATF_GAME__.getPlaceablesSnapshotV86().instances.some(i=>i.instanceId===${JSON.stringify(installed.instanceId)}&&i.status==='carried')`, 'native recovery completes', 100);
  current = await snapshot(); const recovered = getInstance(current, installed.instanceId);
  assert.equal(recovered.health, 37); assert.equal(recovered.ammo, 0); assert.equal(recovered.onGround, false);
  report.checks.recoveredWithoutRefill = recovered;
  const again = await validPlayerPreview(); assert.equal(again.instanceId, installed.instanceId, 'reuses the same recovered device');
  await click('[data-placeable-action="confirm"]');
  await until(`__ATF_GAME__.getPlaceablesSnapshotV86().instances.some(i=>i.instanceId===${JSON.stringify(installed.instanceId)}&&i.status==='deployed')`, 'native redeploy completes', 100);
  current = await snapshot(); assert.equal(getInstance(current, installed.instanceId).ammo, 0); assert.equal(getInstance(current, installed.instanceId).health, 37);
  assert.equal(current.equipment.find(item => item.id === sentryId).remaining, initial.equipment.find(item => item.id === sentryId).remaining - 1, 'redeploy does not consume a new item');
  await pause(true); await capture('03-empty-damaged-redeployed'); await click('#mission-save-v86');
  await until('document.querySelector(".toast-region")?.innerText.includes("Sauvegarde locale confirmée.")', 'manual mission save confirms through the shared handler');
  const saved = await read(`${save}.strategy.currentOperation.resumeState.placeablesV86`); assert.ok(saved);
  assert.equal(saved.instances.filter(item => item.instanceId === installed.instanceId).length, 1);
  report.checks.savedInstance = saved.instances.find(item => item.instanceId === installed.instanceId);
  await read('window.__qaOldDocumentV86=true'); await cdp('Page.reload', { ignoreCache: true });
  await until('typeof __qaOldDocumentV86==="undefined"&&globalThis.__ATF_GAME__&&!document.querySelector("#boot")', 'new document', 450); await boot();
  await click('#title-start'); await click('#title-continue');
  // Title Continue intentionally routes an existing operation to Operations,
  // not straight into the runtime. Resume with the native Commandement button.
  if (await read('__ATF_HUB__.running')) await click('#exit-hub');
  else await click('[data-view="command"]');
  await click('#continue-operation');
  await mission(); await pause(true); await isolateUiScenario('resumed mission'); current = await snapshot();
  const resumed = getInstance(current, installed.instanceId); assert.equal(resumed.health, 37); assert.equal(resumed.ammo, 0); assert.equal(resumed.onGround, true); assert.equal(resumed.status, 'deployed');
  assert.equal(current.placeables.instances.filter(item => item.instanceId === installed.instanceId).length, 1);
  assert.equal(current.placeables.instances.length, initial.placeables.instances.length); assert.equal(current.placeables.previews.length, 0); assert.equal(current.placeables.tasks.length, 0);
  report.checks.resumePreservesOneInstance = resumed; await capture('04-native-resumed-device');
  await pause(false); await operator('player'); await selectSentry('player'); await operator('coop'); await selectSentry('coop');
  current = await snapshot(); assert.equal(current.placeables.previews.length, 2);
  assert.equal(new Set(current.placeables.previews.map(item => item.instanceId)).size, 2);
  assert.deepEqual(new Set(current.placeables.previews.map(item => item.actorCrewId)), new Set([current.player.id,current.coop.id]));
  report.checks.j2IndependentPreview = current.placeables.previews;
  await click('[data-placeable-action="cancel"]'); await operator('player'); await click('[data-placeable-action="cancel"]');
  assert.equal((await snapshot()).placeables.previews.length, 0); await pause(true);
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, mobile: true, deviceScaleFactor: 1 });
  await cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 }); mobile = true; await wait(250);
  const geometry = await read('(()=>{const root=document.documentElement,d=document.querySelector("#mission-equipment-controls");return{innerWidth,clientWidth:root.clientWidth,scrollWidth:root.scrollWidth,items:d.querySelectorAll("[data-use-equipment]").length,buttons:[...d.querySelectorAll("button,select,summary")].map(e=>({text:e.textContent.trim().slice(0,30),w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))};})()');
  assert.equal(geometry.innerWidth, 390); assert.ok(geometry.scrollWidth <= geometry.clientWidth); assert.equal(geometry.items, 4);
  assert.ok(geometry.buttons.filter(button => button.w > 0).every(button => button.h >= 44));
  report.checks.mobile = geometry; await capture('05-mobile-equipment-dock');
  assert.deepEqual(report.errors, []); report.ok = true;
} catch (error) {
  report.failure = error.stack;
  report.failureSnapshot = await snapshot().catch(() => null);
  report.diagnostic = await read('({active:document.activeElement?.outerHTML.slice(0,300),text:document.querySelector("#mission-equipment-controls")?.innerText,body:document.body.innerText.slice(-1000)})').catch(() => null);
  await capture('failure').catch(() => {}); throw error;
} finally {
  await writeFile(resolve(output, 'placeables-v86-browser.json'), JSON.stringify(report, null, 2));
  if (context) await cdp('Target.disposeBrowserContext', { browserContextId: context }, true).catch(() => {});
  socket.close(); console.log(JSON.stringify({ ok: report.ok, base: report.base, checks: Object.keys(report.checks), errors: report.errors, failure: report.failure, report: resolve(output, 'placeables-v86-browser.json'), screenshots: report.screenshots }, null, 2));
}
