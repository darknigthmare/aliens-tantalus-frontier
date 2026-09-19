import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = process.env.APP_URL || 'http://127.0.0.1:4193';
const output = resolve(process.env.QA_OUTPUT || 'I:/CodexQA/AliensTantalus/v87-refuge-20260919', process.env.QA_RUN || 'browser-01');
await mkdir(output, { recursive: true });
const info = await fetch('http://127.0.0.1:' + (process.env.QA_CDP_PORT || '9237') + '/json/version').then(r => r.json());
const socket = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }); });
let sequence = 0, session, context; const pending = new Map(), errors = [], requests = [], pressed = new Set();
socket.addEventListener('message', event => {
  const msg = JSON.parse(event.data), job = pending.get(msg.id);
  if (job) { pending.delete(msg.id); clearTimeout(job.timer); msg.error ? job.reject(Error(msg.error.message)) : job.resolve(msg.result); }
  if (msg.sessionId !== session) return;
  if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push(msg.params.args.map(a => a.value || a.description).join(' '));
  if (msg.method === 'Network.responseReceived' && msg.params.response.status >= 400) errors.push(msg.params.response.status + ' ' + msg.params.response.url);
  if (msg.method === 'Network.requestWillBeSent') requests.push({ method: msg.params.request.method, url: msg.params.request.url });
});
function cdp(method, params = {}, browser = false) { return new Promise((resolve, reject) => {
  const id = ++sequence, timer = setTimeout(() => { pending.delete(id); reject(Error('CDP timeout ' + method)); }, 30000);
  pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params, ...(session && !browser ? { sessionId: session } : {}) }));
}); }
async function read(expression) { const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text); return result.result.value; }
const wait = ms => new Promise(r => setTimeout(r, ms));
async function until(expression, label, timeout = 30000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) { const result = await read(expression); if (result) return result; await wait(90); }
  throw Error('Timeout ' + label);
}
async function key(code, down) {
  const special = { Space: [' ', 32], Enter: ['Enter', 13], Escape: ['Escape', 27], Tab: ['Tab', 9] };
  const [value, virtual] = special[code] || [code.slice(3).toLowerCase(), code.slice(3).charCodeAt(0)];
  await cdp('Input.dispatchKeyEvent', { type: down ? 'keyDown' : 'keyUp', key: value, code, windowsVirtualKeyCode: virtual });
  down ? pressed.add(code) : pressed.delete(code);
}
async function press(code) { await key(code, true); await wait(60); await key(code, false); await wait(120); }
async function click(selector) {
  let box;
  for (let attempt = 0; attempt < 10; attempt++) {
    box = await read(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el||el.disabled)return null;const r=el.getBoundingClientRect(),d=el.closest('dialog')?.getBoundingClientRect();return r.width&&r.height?{x:r.x+r.width/2,y:r.y+r.height/2,top:Math.max(0,d?.top||0),bottom:Math.min(innerHeight,d?.bottom||innerHeight)}:null})()`);
    assert.ok(box, 'Visible enabled control ' + selector);
    if (box.y > box.top + 12 && box.y < box.bottom - 12) break;
    await cdp('Input.dispatchMouseEvent', { type: 'mouseWheel', x: box.x, y: Math.max(box.top + 30, box.bottom - 50), deltaX: 0, deltaY: box.y >= box.bottom - 12 ? 320 : -320 });
    await wait(180);
  }
  assert.ok(box.y > box.top && box.y < box.bottom, 'Unclipped control ' + selector);
  await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x: box.x, y: box.y, button: 'left', clickCount: 1 });
  await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x: box.x, y: box.y, button: 'left', clickCount: 1 }); await wait(150);
}
const poseExpression = `(()=>{const h=__ATF_HUB__;return {x:h.player.x+h.player.w/2,left:h.player.x,feet:h.player.y+h.player.h,vx:h.player.vx,grounded:h.player.grounded,deck:h.state.deck,room:h.currentAnnexV71()?.id||h.currentRoom().id,health:h.player.health,running:h.running,transition:h.annexTransitionV71,prompt:h.statusPrompt(),refuge:h.getRefugeSnapshotV87(),hidden:document.hidden};})()`;
const snapshot = () => read(poseExpression);
const report = { ok: false, base, browser: info.Browser, scope: 'One explicit initial fixture: completed onboarding, player at x280 in habitat crew quarters. Every later movement, interaction, photo edit, pause/save, reload and exit uses actual keyboard/mouse and normal RAF. Photo is a synthetic generated prop atlas, never a personal user image.', checks: {}, path: [], screenshots: [], errors };
function milestone(name, data) { report.checks[name] = data; console.log(JSON.stringify({ stage: name, data })); }
async function capture(name) { const r = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 88, captureBeyondViewport: false });
  await writeFile(resolve(output, name + '.jpg'), Buffer.from(r.data, 'base64')); report.screenshots.push(name + '.jpg'); }
async function walk(target, label) {
  const start = await snapshot(), direction = start.x < target ? 1 : -1, code = direction > 0 ? 'KeyD' : 'KeyA';
  await key(code, true); let reached = false;
  try {
    const deadline = Date.now() + 18000;
    while (Date.now() < deadline) {
      await wait(70); const state = await snapshot(); assert.equal(state.health, 100, label + ' health');
      if (direction > 0 ? state.x >= target : state.x <= target) { reached = true; break; }
      assert.equal(state.running, true, label + ' runtime');
    }
  } finally { await key(code, false); await wait(180); }
  assert.ok(reached, 'Physical path reached ' + label); const end = await snapshot(); report.path.push({ label, start, end }); return end;
}
const personalExpression = `(()=>{const k=Object.keys(localStorage).find(k=>k.startsWith('atf.private.refuge.v87:'));return k?JSON.parse(localStorage.getItem(k)).state:null})()`;
const safePersonalExpression = `(()=>{const p=${personalExpression};return p?{name:p.name,dedication:p.dedication,lightOn:p.lightOn,revision:p.revision,photoPrefix:p.photoDataUrl?.slice(0,23),photoLength:p.photoDataUrl?.length}:null})()`;
try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true));
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true);
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId, flatten: true }, true));
  for (const domain of ['Page', 'Runtime', 'Network']) await cdp(domain + '.enable');
  await cdp('Network.setBypassServiceWorker', { bypass: true });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, mobile: false, deviceScaleFactor: 1 });
  await cdp('Page.navigate', { url: base + '/?qa=refuge-v87' }); await cdp('Page.bringToFront');
  await until('globalThis.__ATF_HUB__&&globalThis.__ATF_V51__&&!document.querySelector("#boot")', 'boot');
  milestone('boot', await read('({title:document.title,text:document.body.innerText.length,overlay:!!document.querySelector(".vite-error-overlay,[data-nextjs-dialog]")})'));
  assert.ok(report.checks.boot.text > 100 && !report.checks.boot.overlay); await capture('00-title');
  milestone('fixture', await read(`(()=>{const s=__ATF_V51__.saveSystem;__ATF_V61__.titleScreen.hide();__ATF_V51__.showView('settings');const hub=structuredClone(s.data.hub);for(const k of ['hubCommercialV71','hubExpansionV71','commercialV71'])if(hub[k]){hub[k].activeAnnexId=null;hub[k].returnContext=null;}s.commit({onboardingV84:null,needsPlayerCreationV84:false,scene:'hub',hub:{...hub,deck:1,roomId:'crew-quarters',positionX:280,facing:1}});__ATF_V51__.showView('hub');__ATF_HUB__.canvas.focus();return {resources:structuredClone(s.data.galaxy.resources),createdAt:s.data.createdAt};})()`));
  await wait(500); await walk(432, 'quarters to physical REFUGE door');
  milestone('parentDoor', await snapshot()); await capture('01-parent-door'); await press('KeyE');
  await until('__ATF_HUB__.isRefugeActiveV87()&&!__ATF_HUB__.annexTransitionV71', 'enter REFUGE');
  await until('[...__ATF_HUB__.getAnnexAssetGroupV71("personal-refuge").values()].every(i=>i.complete&&i.naturalWidth>0)', 'REFUGE art');
  milestone('art', await read('Object.fromEntries([...__ATF_HUB__.getAnnexAssetGroupV71("personal-refuge")].map(([k,v])=>[k,{width:v.naturalWidth,height:v.naturalHeight}]))'));
  await capture('02-room-entry');
  if (process.env.QA_GUTCHECK_ONLY === '1') { assert.deepEqual(errors, []); report.ok = true; }
  else {
    // Read-only instrumentation of actual canvas source rectangles; actor state is untouched.
    await read(`(async()=>{const {REFUGE_ART_V87:a}=await import('/src/refuge-art-v87.js'),ctx=__ATF_HUB__.ctx,draw=ctx.drawImage;globalThis.__QA_REFUGE_DRAW__={frames:{},count:0,maxPivotError:0,maxScaleError:0};ctx.drawImage=function(...args){if(args.length===9&&String(args[0]?.src).endsWith(a.hologram.path)){const f=a.hologram.frames.find(f=>f.x===args[1]&&f.y===args[2]&&f.w===args[3]&&f.h===args[4]);if(f){const q=__QA_REFUGE_DRAW__,s=a.hologram.worldScale;q.count++;q.frames[f.index]=(q.frames[f.index]||0)+1;q.maxPivotError=Math.max(q.maxPivotError,Math.abs(args[5]+f.pivotX*s),Math.abs(args[6]+f.pivotY*s));q.maxScaleError=Math.max(q.maxScaleError,Math.abs(args[7]/f.w-s),Math.abs(args[8]/f.h-s));}}return draw.apply(this,args);};return true;})()`);
    await walk(444, 'portrait'); await press('KeyE'); await until('document.querySelector("dialog.refuge-v87")?.open', 'portrait opens');
    const paused = await snapshot(); assert.equal(paused.running, false);
    await cdp('Input.insertText', { text: 'REFUGE QA <img src=x>' });
    await click('[name=refuge-dedication]'); await cdp('Input.insertText', { text: 'Dédicace de test locale.\nNi récompense ni envoi réseau.' });
    await key('KeyD', true); await wait(250); await key('KeyD', false); assert.equal((await snapshot()).left, paused.left);
    const { root } = await cdp('DOM.getDocument'); const { nodeId } = await cdp('DOM.querySelector', { nodeId: root.nodeId, selector: '[name=refuge-photo]' });
    const requestStart = requests.length;
    await cdp('DOM.setFileInputFiles', { nodeId, files: [process.env.QA_PHOTO || resolve('assets/openai/refuge/v87/refuge-props-atlas.png')] });
    await until('document.querySelector("dialog.refuge-v87 img")?.complete&&document.querySelector("dialog.refuge-v87 img")?.naturalWidth>0&&!document.querySelector("[data-refuge-action=save]").disabled', 'local photo decode');
    milestone('photoDecoded', await read('({width:document.querySelector("dialog.refuge-v87 img").naturalWidth,height:document.querySelector("dialog.refuge-v87 img").naturalHeight,prefix:document.querySelector("dialog.refuge-v87 img").src.slice(0,23),network:performance.getEntriesByType("resource").filter(r=>r.initiatorType==="fetch").length})'));
    assert.ok(report.checks.photoDecoded.width <= 384); assert.equal(report.checks.photoDecoded.prefix, 'data:image/jpeg;base64,');
    milestone('photoNetworkRequests', requests.slice(requestStart).filter(r=>/^https?:/.test(r.url)));
    assert.deepEqual(report.checks.photoNetworkRequests, []); await capture('03-local-portrait');
    await click('[data-refuge-action=save]'); await until('!document.querySelector("dialog.refuge-v87").open&&__ATF_HUB__.running', 'save local portrait and resume');
    milestone('privateSaved', await read(safePersonalExpression)); assert.equal(report.checks.privateSaved.name, 'REFUGE QA <img src=x>');
    milestone('publicSnapshotPrivacy', await read('(()=>{const s=JSON.stringify(__ATF_V51__.snapshot());return {hasName:s.includes("REFUGE QA"),hasPhoto:s.includes("data:image/jpeg;base64,")}})()'));
    assert.deepEqual(report.checks.publicSnapshotPrivacy, { hasName: false, hasPhoto: false }); await capture('04-portrait-in-room');
    await walk(860, 'terminal'); await press('KeyE'); await until('document.querySelector("dialog.refuge-v87")?.open', 'terminal opens');
    milestone('terminal', await read('({name:document.querySelector(".refuge-v87__reading h3").textContent,text:document.querySelector(".refuge-v87__reading p").textContent,injected:document.querySelectorAll(".refuge-v87__reading img").length})'));
    assert.equal(report.checks.terminal.name, report.checks.privateSaved.name); assert.equal(report.checks.terminal.injected, 0);
    await capture('05-terminal'); await press('Escape'); await until('__ATF_HUB__.running&&!document.querySelector("dialog.refuge-v87").open', 'Escape closes terminal');
    await walk(1082, 'LED'); await press('KeyE'); assert.equal(await read(personalExpression + '.lightOn'), true);
    await capture('06-light-on'); await press('KeyE'); assert.equal(await read(personalExpression + '.lightOn'), false);
    await press('KeyE'); assert.equal(await read(personalExpression + '.lightOn'), true);
    await walk(1325, 'hologram'); await press('KeyE'); await wait(550); await capture('07-greeting');
    await until('Object.keys(__QA_REFUGE_DRAW__.frames).length===32', 'all 32 actual hologram poses', 17000);
    milestone('actualHologramDraws', await read('structuredClone(__QA_REFUGE_DRAW__)'));
    assert.ok(report.checks.actualHologramDraws.count > 300); assert.ok(report.checks.actualHologramDraws.maxPivotError < 1e-6); assert.ok(report.checks.actualHologramDraws.maxScaleError < 1e-6);
    await walk(1640, 'contemplation'); await press('KeyE'); const contemplative = await snapshot(); assert.equal(contemplative.refuge.contemplating, true);
    await wait(850); assert.equal((await snapshot()).left, contemplative.left); await capture('08-contemplation');
    await press('KeyA'); assert.equal((await snapshot()).refuge.contemplating, false);
    // Opening the physical terminal saves through hub.pause, without moving the live visitor.
    await walk(860, 'save boundary at terminal'); const beforeSave = await snapshot(); await press('KeyE');
    await until('document.querySelector("dialog.refuge-v87")?.open', 'save while still in REFUGE'); const afterSave = await snapshot();
    assert.equal(afterSave.left, beforeSave.left); assert.equal(afterSave.room, 'personal-refuge');
    milestone('saveProjection', await read('(()=>{const h=__ATF_V51__.saveSystem.data.hub,c=h.hubCommercialV71||h.hubExpansionV71||h.commercialV71;return {deck:h.deck,roomId:h.roomId,positionX:h.positionX,activeAnnexId:c.activeAnnexId,returnContext:c.returnContext}})()'));
    assert.equal(report.checks.saveProjection.roomId, 'crew-quarters'); assert.equal(report.checks.saveProjection.activeAnnexId, null);
    assert.ok(report.checks.saveProjection.positionX >= 380 && report.checks.saveProjection.positionX <= 498);
    await press('Escape'); const origin = await read('performance.timeOrigin'); await cdp('Page.reload', { ignoreCache: true });
    await until('performance.timeOrigin!==' + origin + '&&globalThis.__ATF_HUB__&&globalThis.__ATF_V51__&&!document.querySelector("#boot")', 'reload');
    await click('#title-start'); await click('#title-continue'); await until('__ATF_HUB__.running', 'continue');
    milestone('reloadedParentDoor', await snapshot()); assert.equal(report.checks.reloadedParentDoor.room, 'crew-quarters');
    assert.ok(report.checks.reloadedParentDoor.left >= 380 && report.checks.reloadedParentDoor.left <= 498); await capture('09-reload-parent-door');
    await press('KeyE'); await until('__ATF_HUB__.isRefugeActiveV87()&&!__ATF_HUB__.annexTransitionV71', 'reenter after load');
    await walk(444, 'portrait persisted'); await press('KeyE'); await until('document.querySelector("dialog.refuge-v87")?.open', 'persisted portrait');
    milestone('afterReloadPrivate', await read(safePersonalExpression)); assert.equal(report.checks.afterReloadPrivate.name, report.checks.privateSaved.name); assert.equal(report.checks.afterReloadPrivate.lightOn, true);
    assert.equal(await read('document.querySelector("[name=refuge-name]").value'), report.checks.privateSaved.name);
    await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, mobile: true, deviceScaleFactor: 1 }); await wait(300);
    milestone('compactDialog', await read('(()=>{const d=document.querySelector("dialog.refuge-v87"),r=d.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:innerWidth,height:innerHeight,scrollWidth:d.scrollWidth,clientWidth:d.clientWidth}})()'));
    const compact = report.checks.compactDialog; assert.ok(compact.left >= 0 && compact.right <= compact.width); assert.ok(compact.top >= 0 && compact.bottom <= compact.height); assert.ok(compact.scrollWidth <= compact.clientWidth + 1);
    await capture('10-compact-portrait'); await click('[data-refuge-action=close]'); await until('__ATF_HUB__.running', 'compact close returns to play');
    await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, mobile: false, deviceScaleFactor: 1 });
    await walk(202, 'physical exit'); await press('KeyE'); await until('!__ATF_HUB__.isAnnexActiveV71()&&!__ATF_HUB__.annexTransitionV71', 'exit REFUGE');
    milestone('exit', await snapshot()); assert.equal(report.checks.exit.room, 'crew-quarters'); assert.ok(Math.abs(report.checks.exit.left - report.checks.reloadedParentDoor.left) <= 1);
    milestone('resourcesUnchanged', await read('structuredClone(__ATF_V51__.saveSystem.data.galaxy.resources)')); assert.deepEqual(report.checks.resourcesUnchanged, report.checks.fixture.resources);
    await walk(704, 'adjacent animal-care door'); await press('KeyE'); await until('__ATF_HUB__.currentAnnexV71()?.id==="animal-care"&&!__ATF_HUB__.annexTransitionV71', 'neighbor door remains reachable');
    await capture('11-neighbor-animal-care'); assert.deepEqual(errors, []); report.ok = true;
  }
} catch (error) { report.failure = error.stack; process.exitCode = 1; console.error(error); try { report.lastState = await snapshot(); await capture('failure'); } catch {} }
finally {
  for (const code of pressed) await key(code, false).catch(() => {});
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
  if (context) await cdp('Target.disposeBrowserContext', { browserContextId: context }, true).catch(() => {});
  socket.close(); console.log(JSON.stringify({ ok: report.ok, output, checks: Object.keys(report.checks), errors, failure: report.failure, lastState: report.lastState }, null, 2));
}
