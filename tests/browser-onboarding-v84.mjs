import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const base = process.env.APP_URL || 'http://127.0.0.1:4176/';
const output = resolve(process.env.QA_OUTPUT || 'docs/references/v84-release-qa/onboarding');
await mkdir(output, { recursive: true });
const info = await fetch((process.env.CDP_ENDPOINT || 'http://127.0.0.1:9226') + '/json/version').then(r => r.json());
const socket = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }); });
let seq = 0, session, context;
const pending = new Map(), errors = [];
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (pending.has(message.id)) { const job = pending.get(message.id); pending.delete(message.id); message.error ? job.reject(Error(message.error.message)) : job.resolve(message.result); }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args.map(a => a.value || a.description).join(' '));
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) errors.push(message.params.response.status + ' ' + message.params.response.url);
});
const cdp = (method, params = {}, browser = false) => new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params, ...(session && !browser ? { sessionId: session } : {}) })); });
async function evaluate(expression) { const r = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; }
const wait = ms => new Promise(ok => setTimeout(ok, ms));
async function until(expression, label) { for (let i = 0; i < 200; i++) { const v = await evaluate(expression); if (v) return v; await wait(100); } throw Error(label + ' ' + errors.join('\n')); }
async function key(code, down = true) { const virtualKey = code === 'Escape' ? 27 : code === 'Space' ? 32 : code.startsWith('Key') ? code.charCodeAt(3) : 0; await cdp('Input.dispatchKeyEvent', { type: down ? 'keyDown' : 'keyUp', code, key: code === 'Space' ? ' ' : code.startsWith('Key') ? code.slice(3).toLowerCase() : code, windowsVirtualKeyCode: virtualKey }); }
async function tap(code) { await key(code); await wait(75); await key(code, false); }
async function click(selector) {
  const p = await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}); if(!e)throw Error('Missing element');e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();if(!r.width||!r.height)throw Error('Hidden element: '+${JSON.stringify(selector)});return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', ...p, button: 'left', buttons: 1, clickCount: 1 });
  await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', ...p, button: 'left', buttons: 0, clickCount: 1 });
  await wait(120);
}
async function type(selector, text) { await click(selector); await cdp('Input.insertText', { text }); }
async function capture(name) { const r = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 78, captureBeyondViewport: false }); await writeFile(resolve(output, name + '.jpg'), Buffer.from(r.data, 'base64')); report.screenshots.push(name + '.jpg'); }
const state = '__ATF_V51__.saveSystem.data.onboardingV84';
const report = { ok: false, base, scope: 'Fresh isolated storage; native title/form/keyboard input and actual cryo-to-briefing movement. No teleport or direct phase mutation. Sprite wake animation is not certified.', screenshots: [], checks: {}, errors };
async function boot() { await until('globalThis.__ATF_V61__ && !document.querySelector("#boot")', 'boot'); await wait(250); }
async function reload() { await evaluate('window.__qaOldDocumentV84=true'); await cdp('Page.reload', { ignoreCache: true }); await until('typeof __qaOldDocumentV84 === "undefined" && globalThis.__ATF_V61__ && !document.querySelector("#boot")', 'new document boot'); await boot(); }
async function enter() { await click('#title-start'); await click('#title-continue'); }
try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true));
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true);
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId, flatten: true }, true));
  for (const domain of ['Page', 'Runtime', 'Network']) await cdp(domain + '.enable');
  await cdp('Network.setBypassServiceWorker', { bypass: true });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, mobile: false, deviceScaleFactor: 1 });
  await cdp('Emulation.setFocusEmulationEnabled', { enabled: true });
  await cdp('Page.navigate', { url: base + '?qa=onboarding-v84' }); await cdp('Page.bringToFront'); await boot();
  const original = await evaluate('localStorage.getItem("atf-v47-profile-1")');
  await enter(); await until('document.querySelector("#player-creator-v84").open', 'creator');
  await type('#player-name-v84', 'Alex Moreau'); await type('#player-callsign-v84', 'ECHO-17'); await capture('01-creator');
  await tap('Escape');
  assert.equal(await evaluate('localStorage.getItem("atf-v47-profile-1")'), original);
  assert.equal(await evaluate('document.querySelector("#player-creator-v84").open'), false);
  report.checks.cancelPreservesBytes = true;
  await click('#title-continue'); await type('#player-name-v84', 'Alex Moreau'); await type('#player-callsign-v84', 'ECHO-17');
  await click('#player-creator-v84 button[type="submit"]');
  await until(`${state}?.phase === 'wake' && __ATF_HUB__.running`, 'cryo wake');
  report.checks.spawn = await evaluate('({player:__ATF_V51__.saveSystem.data.player,room:__ATF_HUB__.currentRoom().id,x:__ATF_HUB__.player.x,crew:__ATF_HUB__.npcs.map(n=>n.crewId)})');
  assert.equal(report.checks.spawn.room, 'cryo-bay'); assert.equal(report.checks.spawn.player.name, 'Alex Moreau');
  await capture('02-cryo'); await tap('KeyE'); await until(`${state}.phase === 'medical'`, 'wake confirmed');
  await key('KeyA'); await until('__ATF_HUB__.player.x < 4370', 'walk to DAVID'); await key('KeyA', false); await tap('KeyE');
  await until('!document.querySelector("#hub-dialogue-continue").hidden && document.querySelector("#hub-dialogue-text").textContent.includes("DAVID")', 'welcoming staff');
  await click('#hub-dialogue-continue'); assert.equal(await evaluate(`${state}.dialogueNode`), 1); await capture('03-welcome');
  const savedX = await evaluate('__ATF_V51__.saveSystem.data.hub.positionX');
  await reload(); await enter();
  await until('__ATF_HUB__.running', 'resume');
  assert.equal(await evaluate(`${state}.dialogueNode`), 1); assert.equal(await evaluate('__ATF_HUB__.player.x'), savedX);
  await tap('KeyE'); await click('#hub-dialogue-continue'); await click('#hub-dialogue-continue');
  await until(`${state}.phase === 'briefing' && __ATF_HUB__.running`, 'briefing objective');
  report.checks.midDialogueReload = true;
  const route = [];
  await key('KeyA');
  let previous = Infinity, stuck = 0;
  for (let i = 0; i < 200; i++) {
    const pose = await evaluate('({x:__ATF_HUB__.player.x,y:__ATF_HUB__.player.y,room:__ATF_HUB__.currentRoom().id,contact:__ATF_HUB__.onboardingContactV84()?.crewId})');
    route.push(pose);
    if (pose.contact === 'crew-02-tamsin-velez') break;
    if (Math.abs(pose.x - previous) < 2) stuck++; else stuck = 0;
    if (stuck >= 3) { await tap('KeyE'); await tap('Space'); stuck = 0; }
    previous = pose.x;
    await wait(200);
  }
  await key('KeyA', false); report.checks.route = route;
  assert.equal(await evaluate('__ATF_HUB__.onboardingContactV84()?.crewId'), 'crew-02-tamsin-velez', 'real corridor route reaches briefing');
  await tap('KeyE'); await capture('04-briefing');
  for (let i = 0; i < 3; i++) await click('#hub-dialogue-continue');
  assert.equal(await evaluate(`${state}.phase`), 'complete');
  report.checks.complete = await evaluate(state);
  await capture('05-complete');
  await reload(); await enter();
  assert.equal(await evaluate(`${state}.phase`), 'complete'); report.checks.completedReload = true;
  await click('#exit-hub'); await click('#return-title'); await click('#title-start');
  const completedBytes = await evaluate('localStorage.getItem("atf-v47-profile-1")');
  await click('#title-new'); await click('#title-new');
  await until('document.querySelector("#player-creator-v84").open', 'replacement draft');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, mobile: true, deviceScaleFactor: 1 });
  await type('#player-name-v84', 'Jules Carter'); await type('#player-callsign-v84', 'ECHO-18');
  await capture('06-mobile-creator');
  report.checks.mobileCreator = await evaluate('(()=>{const d=document.querySelector("#player-creator-v84"),r=d.getBoundingClientRect();return {inside:r.x>=0&&r.right<=innerWidth&&r.y>=0&&r.bottom<=innerHeight,scrollable:d.scrollHeight>=d.clientHeight};})()');
  assert.equal(report.checks.mobileCreator.inside, true);
  await evaluate('window.__qaStorageSetV84=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){if(k==="atf-v47-profile-1")throw Error("QA write failure");return __qaStorageSetV84.call(this,k,v)}');
  await click('#player-creator-v84 button[type="submit"]');
  assert.equal(await evaluate('document.querySelector("#player-creator-v84").open'), true);
  assert.equal(await evaluate('localStorage.getItem("atf-v47-profile-1")'), completedBytes);
  assert.equal(await evaluate('__ATF_V51__.saveSystem.data.player.name'), 'Alex Moreau');
  assert.ok(await evaluate('document.querySelector("#player-creator-error-v84").textContent.includes("Sauvegarde")'));
  report.checks.writeFailurePreservesCompletedCampaign = true;
  await evaluate('Storage.prototype.setItem=__qaStorageSetV84');
  await click('[data-creator-cancel-v84]');
  assert.equal(await evaluate('localStorage.getItem("atf-v47-profile-1")'), completedBytes);
  report.checks.cancelCompletedCampaignPreservesBytes = true;
  assert.deepEqual(errors, []); report.ok = true;
} catch (error) { report.failure = error.stack; report.diagnostic = await evaluate('globalThis.__ATF_HUB__ ? ({x:__ATF_HUB__.player?.x,y:__ATF_HUB__.player?.y,room:__ATF_HUB__.state?.roomId,state:__ATF_V51__.saveSystem.data.onboardingV84,dialog:document.querySelector("#hub-dialogue-text")?.textContent}) : null').catch(() => null); await capture('failure').catch(() => {}); throw error; }
finally { await writeFile(resolve(output, 'onboarding-v84-browser.json'), JSON.stringify(report, null, 2)); if (context) await cdp('Target.disposeBrowserContext', { browserContextId: context }, true).catch(() => {}); socket.close(); console.log(JSON.stringify(report, null, 2)); }
