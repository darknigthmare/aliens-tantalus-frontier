import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createDefaultSave, recruitCandidateV85, assignCrewMember, SAVE_PREFIX } from '../src/save.js';
import { createPlayerOnboardingV84, advancePlayerOnboardingV84 } from '../src/player-onboarding-v84.js';
import { CAMPAIGNS, WEAPONS } from '../src/content.js';

// Independent storage/context: never attach to another QA agent's page.
const base = new URL(process.env.APP_URL || 'http://127.0.0.1:4185/');
const output = resolve(process.env.QA_OUTPUT || 'docs/references/v85-release-qa/crew-runtime');
await mkdir(output, { recursive: true });
const report = { ok: false, base: base.href, scope: 'Explicit fixture: completed onboarding, four recruits hired and assigned through save actions before app boot. Native UI deploys the mission, changes coop setting and resumes; actual CDP keyboard fires, reloads and heals. One declared J2 injury fixture tests a medkit without waiting for random damage. No business calls through Runtime.evaluate; no claim of full campaign or individually drawn recruits.', checks: {}, screenshots: [], errors: [] };
const fixture = createDefaultSave(1);
fixture.needsPlayerCreationV84 = false;
fixture.onboardingV84 = createPlayerOnboardingV84({ name: 'QA Mission Operator', callsign: 'SMOKE-85' });
for (const event of ['wake-confirmed', { type: 'medical-next', dialogueNode: 0 }, { type: 'medical-next', dialogueNode: 1 }, 'medical-complete', { type: 'briefing-next', dialogueNode: 0 }, { type: 'briefing-next', dialogueNode: 1 }, 'briefing-complete']) {
  const progress = advancePlayerOnboardingV84(fixture.onboardingV84, event);
  assert.equal(progress.ok, true); fixture.onboardingV84 = progress.state;
}
fixture.galaxy.resources.credits = 10000; fixture.hub.systems.supplies = 100;
fixture.settings.coop = false; fixture.settings.difficulty = 'story'; fixture.settings.aimAssist = 'off'; fixture.settings.reducedMotion = true;
fixture.strategy.selectedVehicleId = null;
const candidates = structuredClone(fixture.recruitmentV85.candidates);
for (const candidate of candidates) assert.equal(recruitCandidateV85(fixture, candidate.id).ok, true);
const originalIds = [...fixture.strategy.selectedCrewIds];
for (const id of originalIds.slice(1)) assignCrewMember(fixture, id);
assignCrewMember(fixture, candidates[0].id); assignCrewMember(fixture, originalIds[0]);
for (const candidate of candidates.slice(1)) assignCrewMember(fixture, candidate.id);
const campaign = CAMPAIGNS.find(item => fixture.galaxy.unlockedWorldIds.includes(item.worldId) && !item.specialOperationId);
assert.ok(campaign); fixture.strategy.plannedCampaignId = campaign.id;
report.fixture = { identity: fixture.onboardingV84.identity, campaignId: campaign.id, resources: { credits: 10000, supplies: 100 },
  sourceActions: ['recruitCandidateV85 x4', 'assignCrewMember x8'], selectedCrewIds: fixture.strategy.selectedCrewIds,
  candidates: candidates.map(item => ({ id: item.id, name: item.name, gear: item.gear.map(gear => gear.catalogId) })) };

const info = await fetch((process.env.CDP_ENDPOINT || 'http://127.0.0.1:9235') + '/json/version').then(response => response.json());
const socket = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }); });
let seq = 0, session, context;
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
async function until(expression, label, attempts = 200) {
  for (let attempt = 0; attempt < attempts; attempt++) { const result = await read(expression); if (result) return result; await wait(100); }
  throw Error(`Timed out: ${label}`);
}
async function key(code, down = true) {
  const key = code.startsWith('Key') ? code.slice(3).toLowerCase() : code.startsWith('Shift') ? 'Shift' : code;
  const windowsVirtualKeyCode = code.startsWith('Key') ? code.charCodeAt(3) : { Escape: 27, Enter: 13, Space: 32, ShiftLeft: 16, ShiftRight: 16 }[code] || 0;
  await cdp('Input.dispatchKeyEvent', { type: down ? 'keyDown' : 'keyUp', key, code, windowsVirtualKeyCode });
}
async function tap(code) { await key(code); await wait(35); await key(code, false); await wait(65); }
async function click(selector) {
  await read(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({behavior:'instant',block:'center'})`);
  await wait(120);
  const point = await read(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing '+${JSON.stringify(selector)});const r=e.getBoundingClientRect();if(!r.width||!r.height||e.disabled)throw Error('Unavailable '+${JSON.stringify(selector)});const x=r.x+r.width/2,y=r.y+r.height/2,h=document.elementFromPoint(x,y);if(h!==e&&!e.contains(h))throw Error('Obscured '+${JSON.stringify(selector)});return {x,y};})()`);
  await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point });
  await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', buttons: 1, clickCount: 1 });
  await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', buttons: 0, clickCount: 1 }); await wait(100);
}
async function capture(name) { const shot = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 82, captureBeyondViewport: false }); await writeFile(resolve(output, name + '.jpg'), Buffer.from(shot.data, 'base64')); report.screenshots.push(name + '.jpg'); }
const save = '__ATF_V51__.saveSystem.data';
async function boot() {
  await until('globalThis.__ATF_GAME__ && globalThis.__ATF_V61__ && !document.querySelector("#boot")', 'boot');
  // Read-only DOM observer: damage/subtitle events legitimately replace the
  // deployment footer before the native pause. Keep the actual rendered notice.
  await read(`if(!window.__qaMissionLogObserverV85){window.__qaMissionLogHistoryV85=[];const log=document.querySelector('#mission-log');window.__qaMissionLogObserverV85=new MutationObserver(()=>{__qaMissionLogHistoryV85.push(log.textContent);if(__qaMissionLogHistoryV85.length>100)__qaMissionLogHistoryV85.shift();});__qaMissionLogObserverV85.observe(log,{childList:true,characterData:true,subtree:true});}`);
  await wait(150);
}
async function reloadPage() { await read('window.__qaOldDocumentV85=true'); await cdp('Page.reload', { ignoreCache: true }); await until('typeof __qaOldDocumentV85 === "undefined" && globalThis.__ATF_GAME__ && !document.querySelector("#boot")', 'new document'); await boot(); }
async function mission() {
  for (let step = 0; step < 24; step++) {
    if (await read('__ATF_GAME__.running')) break;
    await click('[data-insertion-action="advance"]');
  }
  await until('__ATF_GAME__.running && !__ATF_GAME__.enemyAtlasLoadingPausedV65 && __ATF_GAME__.mission?.state === "active"', 'native mission running');
  await tap('Escape'); assert.equal(await read('__ATF_GAME__.paused'), true);
}
async function snapshot() {
  return read(`(()=>{const g=__ATF_GAME__;const actor=a=>({id:a.crewId||a.operatorId,name:a.name,callsign:a.callsign,health:a.health,maxHealth:a.maxHealth,ammo:a.ammo,reserve:a.ammoReserve,magazine:a.magazineSize,shots:a.shots||0,actions:a.actions||0,x:a.x,y:a.y,spriteId:a.spriteId||a.visualSheetId,individual:a.crewV85?{crewId:a.crewV85.crewId,weaponId:a.crewV85.weaponRuntime?.id,visualProfileId:a.crewV85.visualProfileId,artStatus:a.crewV85.artStatus,charges:{...a.crewV85.charges},aptitudes:{...a.crewV85.aptitudes},endurance:a.crewV85.endurance,stress:a.crewV85.stress}:null});return {running:g.running,paused:g.paused,coopEnabled:g.coopEnabled,missionLog:document.querySelector('#mission-log').textContent,deploymentLog:__qaMissionLogHistoryV85.findLast(text=>text.startsWith('ESCOUADE DÉPLOYÉE')),player:actor(g.player),coop:actor(g.coop),allies:g.squadActors.map(actor),activeAllyIds:g.activeSquadActors().map(a=>a.crewId),resumeApplied:g.lastResumeResult?.applied,operationId:${save}.strategy.currentOperation?.id,manifestIds:${save}.strategy.currentOperation?.crewManifestV85?.map(a=>a.id)};})()`);
}
async function configureCoopAndResume(enabled) {
  await reloadPage();
  report.checks[enabled ? 'persistedBeforeCoop' : 'persistedBeforeAi'] = await read(`${save}.strategy.currentOperation.resumeState.squad`);
  await click('#title-start'); await click('#title-options');
  if (await read('document.querySelector("#setting-coop").checked') !== enabled) await click('#setting-coop');
  assert.equal(await read(`${save}.settings.coop`), enabled);
  await click('[data-view="command"]'); await click('#continue-operation'); await mission();
}
try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true));
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true);
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId, flatten: true }, true));
  for (const domain of ['Page', 'Runtime', 'Network']) await cdp(domain + '.enable');
  await cdp('Network.setBypassServiceWorker', { bypass: true }); await cdp('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, mobile: false, deviceScaleFactor: 1 });
  await cdp('Emulation.setFocusEmulationEnabled', { enabled: true });
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `if(location.origin===${JSON.stringify(base.origin)}&&!sessionStorage.getItem('qa-v85-crew-fixture')){localStorage.setItem(${JSON.stringify(SAVE_PREFIX + '1')},${JSON.stringify(JSON.stringify(fixture))});sessionStorage.setItem('qa-v85-crew-fixture','1');}` });
  await cdp('Page.navigate', { url: base.href + '?qa=crew-runtime-v85' }); await cdp('Page.bringToFront'); await boot();
  await click('#title-start'); await click('#title-continue'); await until('__ATF_HUB__.running', 'hub');
  await click('#exit-hub'); await click('#continue-operation'); await mission();
  report.checks.initial = await snapshot();
  assert.equal(report.checks.initial.player.id, 'player-echo9'); assert.equal(report.checks.initial.player.individual, null);
  assert.equal(report.checks.initial.allies.length, 4);
  assert.match(report.checks.initial.deploymentLog, /4 alliés IA physiques/);
  for (const actor of report.checks.initial.allies) {
    assert.equal(actor.name, candidates.find(item => item.id === actor.id)?.name);
    assert.equal(actor.individual.crewId, actor.id); assert.equal(actor.individual.visualProfileId, 'echo9-standard-v85');
    assert.equal(actor.individual.artStatus, 'shared-standard-uniform-no-individual-portrait');
    assert.ok(actor.spriteId.startsWith('player.echo9-marine.'), 'declared common uniform, not another named NPC');
    assert.equal(actor.magazine, WEAPONS.find(item => item.id === actor.individual.weaponId).magazine);
  }
  assert.equal(new Set(report.checks.initial.allies.map(actor => actor.individual.weaponId)).size, 3);
  assert.deepEqual(report.checks.initial.manifestIds, candidates.map(item => item.id));
  await capture('01-native-four-recruits');
  console.log('V85 mission: four distinct recruits, three actual weapon contracts, explicit common uniform.');
  await configureCoopAndResume(true);
  report.checks.takeover = await snapshot();
  const before = report.checks.initial.allies[1], coop = report.checks.takeover.coop;
  assert.equal(coop.id, before.id); assert.equal(coop.individual.weaponId, before.individual.weaponId);
  assert.equal(coop.ammo, before.ammo); assert.equal(coop.reserve, before.reserve);
  assert.equal(report.checks.takeover.activeAllyIds.includes(coop.id), false);
  assert.equal(report.checks.takeover.activeAllyIds.length, 3);
  assert.match(report.checks.takeover.deploymentLog, /3 alliés IA physiques/);
  // Instrumentation-only observer; the genuine fire method remains untouched.
  await read(`window.__qaShotsV85=[];window.__qaLastBulletV85=new WeakSet();window.__qaObserverV85=setInterval(()=>{for(const b of __ATF_GAME__.bullets||[]){if(__qaLastBulletV85.has(b))continue;__qaLastBulletV85.add(b);__qaShotsV85.push({weaponId:b.weaponId||b.owner?.crewV85?.weaponRuntime?.id,damage:b.damage,ownerId:b.owner?.crewId||b.owner?.operatorId,vx:b.vx,vy:b.vy});}},10);`);
  await tap('Escape'); await key('ShiftRight'); await key('KeyI'); await key('KeyO');
  await until(`__ATF_GAME__.coop.ammo < ${coop.ammo}`, 'J2 native pistol fire');
  for (const code of ['KeyO', 'KeyI', 'ShiftRight']) await key(code, false);
  await tap('Escape');
  report.checks.fired = await snapshot(); report.checks.projectiles = await read('__qaShotsV85');
  assert.ok(report.checks.projectiles.some(shot => shot.ownerId === coop.id && shot.vy < 0));
  assert.equal(report.checks.fired.coop.individual.weaponId, coop.individual.weaponId);
  await tap('Escape'); await tap('KeyT');
  await until('__ATF_GAME__.coop.reloading', 'J2 reload started');
  await until('!__ATF_GAME__.coop.reloading', 'J2 reload completed', 80);
  await tap('Escape'); report.checks.reloaded = await snapshot();
  assert.equal(report.checks.reloaded.coop.ammo, coop.magazine);
  assert.equal(report.checks.reloaded.coop.reserve, coop.reserve - (coop.ammo - report.checks.fired.coop.ammo));
  // Explicit injury fixture only; healing itself must come from native KeyG.
  report.fixture.injury = await read(`(()=>{const a=__ATF_GAME__.coop;a.health=Math.max(1,a.maxHealth-35);a.supportClock=0;return {crewId:a.operatorId,health:a.health,maxHealth:a.maxHealth,reason:'Bounded medkit input test, not campaign damage'};})()`);
  await tap('Escape'); await tap('KeyG'); await tap('Escape');
  report.checks.healed = await snapshot();
  assert.ok(report.checks.healed.coop.health > report.fixture.injury.health);
  const remaining = actor => Object.values(actor.individual.charges).reduce((a, b) => a + b, 0);
  assert.equal(remaining(report.checks.healed.coop), remaining(report.checks.reloaded.coop) - 1);
  assert.ok(report.checks.healed.coop.actions > report.checks.reloaded.coop.actions);
  await capture('02-native-coop-fire-reload-medkit');
  await configureCoopAndResume(false); report.checks.returnedToAi = await snapshot();
  const returned = report.checks.returnedToAi.allies.find(actor => actor.id === coop.id);
  const persisted = report.checks.persistedBeforeAi.members.find(actor => actor.crewId === coop.id);
  assert.equal(persisted.crewRuntimeV85.ammo, report.checks.healed.coop.ammo);
  assert.equal(persisted.crewRuntimeV85.ammoReserve, report.checks.healed.coop.reserve);
  assert.deepEqual(persisted.crewRuntimeV85.charges, report.checks.healed.coop.individual.charges);
  assert.equal(persisted.shots, report.checks.healed.coop.shots);
  assert.equal(persisted.actions, report.checks.healed.coop.actions);
  // The live IA can fire during the bounded native launch -> Escape window.
  // Account for those real shots; never freeze/remove enemies to force equality.
  const postResumeShots = returned.shots - persisted.shots;
  assert.ok(postResumeShots >= 0 && postResumeShots <= 5);
  assert.equal(returned.ammo + postResumeShots, persisted.crewRuntimeV85.ammo);
  assert.equal(returned.reserve, report.checks.healed.coop.reserve);
  assert.deepEqual(returned.individual.charges, report.checks.healed.coop.individual.charges);
  assert.ok(returned.actions >= report.checks.healed.coop.actions);
  report.checks.postResumeShots = postResumeShots;
  assert.equal(report.checks.returnedToAi.activeAllyIds.length, 4); assert.equal(report.checks.returnedToAi.resumeApplied, true);
  assert.match(report.checks.returnedToAi.deploymentLog, /4 alliés IA physiques/);
  await capture('03-native-resume-back-to-ai');
  assert.deepEqual(report.errors, []); report.ok = true;
} catch (error) { report.failure = error.stack; await capture('failure').catch(() => {}); throw error; }
finally { await writeFile(resolve(output, 'crew-runtime-v85-browser.json'), JSON.stringify(report, null, 2)); if (context) await cdp('Target.disposeBrowserContext', { browserContextId: context }, true).catch(() => {}); socket.close(); console.log(JSON.stringify({ ok: report.ok, base: report.base, checks: Object.keys(report.checks), errors: report.errors, failure: report.failure, report: resolve(output, 'crew-runtime-v85-browser.json'), screenshots: report.screenshots }, null, 2)); }
