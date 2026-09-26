import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Isolated QA storage. Real options navigation precedes clearly labelled state fixtures.
const base = process.env.APP_URL || 'http://127.0.0.1:4195';
const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9243';
const output = resolve(process.env.QA_OUTPUT || 'E:/CodexQA/AliensTantalus/v89-menu-20260923/runtime');
await mkdir(output, { recursive: true });
const version = await fetch(endpoint + '/json/version').then(r => r.json());
const socket = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }); });
const pending = new Map(); let sequence = 0, session, context;
const report = { ok: false, base, milestones: [], errors: [], screenshots: [], contextCoverage: 'real title/options navigation; saved-objective display fixtures are not a played campaign' };
socket.addEventListener('message', event => {
  const m = JSON.parse(event.data), p = pending.get(m.id);
  if (p) { pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
  if (m.sessionId !== session) return;
  if (m.method === 'Runtime.exceptionThrown') report.errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') report.errors.push(m.params.args.map(a => a.value || a.description).join(' '));
  if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) report.errors.push(m.params.response.status + ' ' + m.params.response.url);
});
function cdp(method, params = {}, browser = false) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(Error('CDP timeout ' + method)); }, 20000);
    pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } });
    socket.send(JSON.stringify({ id, method, params, ...(!browser && session ? { sessionId: session } : {}) }));
  });
}
async function evaluate(expression) {
  const r = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(expression, label) {
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) { if (await evaluate(expression)) return; await wait(70); }
  throw Error('Timeout: ' + label);
}
async function capture(name) {
  const r = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 85, captureBeyondViewport: false });
  await writeFile(resolve(output, name + '.jpg'), Buffer.from(r.data, 'base64'));
  report.screenshots.push(name + '.jpg');
}
const ready = () => until('[...document.querySelectorAll("#title-scene-v79 img")].every(i=>i.complete&&i.naturalWidth>0)&&[...document.querySelectorAll("#title-scene-v79 [data-renderer=image]")].every(e=>e.dataset.assetStatus==="ready")', 'native title images');
const inspect = () => evaluate(`(()=>{const root=document.querySelector('#title-scene-v79'),ship=root.querySelector('[data-role=orbitals]'),r=ship.getBoundingClientRect();return {scene:__ATF_V61__.snapshot().scene,foreground:root.querySelectorAll('[data-role=foreground]').length,debris:root.querySelectorAll('[data-role=debris]').length,ships:root.querySelectorAll('[data-role=orbitals]').length,transform:getComputedStyle(ship).transform,animation:getComputedStyle(ship).animationName,opacity:getComputedStyle(ship).opacity,box:{x:r.x,y:r.y,w:r.width,h:r.height},overflow:document.documentElement.scrollWidth>innerWidth}})()`);
async function click(selector) {
  const p = await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...p });
  await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...p });
}
try {
  context = (await cdp('Target.createBrowserContext', {}, true)).browserContextId;
  const target = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true);
  session = (await cdp('Target.attachToTarget', { targetId: target.targetId, flatten: true }, true)).sessionId;
  for (const domain of ['Page', 'Runtime', 'Network']) await cdp(domain + '.enable');
  await cdp('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: base + '/?qa-title-menu-v89=1' });
  await until('Boolean(globalThis.__ATF_V61__&&!document.querySelector("#boot")&&!document.querySelector("#title-screen").hidden)', 'real title boot');
  await ready();
  const initialSave = await evaluate('JSON.stringify(__ATF_V51__.saveSystem.data)');
  await click('#title-start');
  await until('__ATF_V61__.snapshot().state==="menu"', 'title menu');
  assert.equal(await evaluate('document.querySelector("#title-continue").getAttribute("aria-describedby")'), 'title-resume-context-v89');
  assert.ok(await evaluate('document.querySelector("#title-resume-context-v89").textContent.length>20'));
  const initial = await inspect();
  assert.equal(initial.foreground, 0); assert.equal(initial.debris, 0); assert.equal(initial.overflow, false);
  report.milestones.push({ name: 'real-menu-context-accessible-exterior', initial });
  await capture('01-real-menu');
  await click('#title-options');
  await until('document.querySelector("#title-screen").hidden', 'options open');
  const phase = await evaluate('__ATF_V61__.titleScreen.scene.flightClock.elapsed');
  await wait(350);
  assert.equal(await evaluate('__ATF_V61__.titleScreen.scene.flightClock.elapsed'), phase);
  await click('#setting-title-preview-v87');
  await until('__ATF_V61__.snapshot().state==="menu"&&document.activeElement.id==="title-options"', 'same-profile options focus restored');
  assert.equal(await evaluate('JSON.stringify(__ATF_V51__.saveSystem.data)'), initialSave, 'title and options navigation are presentation-only');
  report.milestones.push({ name: 'real-options-return-menu-focus-and-save-invariance' });
  await capture('02-options-return');
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await until('__ATF_V61__.snapshot().scene.mode==="static"', 'reduced motion');
  const frozen = await inspect(); await wait(350);
  assert.equal((await inspect()).transform, frozen.transform);
  report.milestones.push({ name: 'reduced-motion-remains-static' });

  // Display fixture only: no stage is claimed as reached through gameplay.
  await evaluate("(async()=>{const {createPlayerOnboardingV84}=await import('/src/player-onboarding-v84.js');const {createPlayerOpeningV88}=await import('/src/player-opening-v88.js');const save=__ATF_V51__.saveSystem.data=structuredClone(__ATF_V51__.saveSystem.data);save.needsPlayerCreationV84=false;save.onboardingV84={...createPlayerOnboardingV84({name:'Alex Moreau',callsign:'FOX-9'}),phase:'complete'};save.openingV88={...createPlayerOpeningV88(),phase:'qualification'};save.openingExerciseV89=null;__ATF_V61__.titleScreen.show();__ATF_V61__.titleScreen.openMenu();})()");
  const fixtureSave = await evaluate('JSON.stringify(__ATF_V51__.saveSystem.data)');
  assert.equal(await evaluate('__ATF_V61__.snapshot().resumeContext.kind'), 'opening');
  for (const size of [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 320, height: 568 }]) {
    await cdp('Emulation.setDeviceMetricsOverride', { ...size, deviceScaleFactor: 1, mobile: false }); await wait(100);
    await evaluate('__ATF_V61__.titleScreen.focusButton(document.querySelector("#title-options"))');
    const layout = await evaluate("(()=>{const root=document.querySelector('#title-screen'),hint=document.querySelector('#title-resume-context-v89');return {width:innerWidth,scroll:document.documentElement.scrollWidth,titleScroll:root.scrollWidth,hint:hint.textContent,description:document.querySelector('#title-continue').getAttribute('aria-describedby'),hintSize:{w:hint.getBoundingClientRect().width,h:hint.getBoundingClientRect().height},options:{top:document.querySelector('#title-options').getBoundingClientRect().top,bottom:document.querySelector('#title-options').getBoundingClientRect().bottom},foreground:document.querySelectorAll('#title-scene-v79 [data-role=foreground]').length,debris:document.querySelectorAll('#title-scene-v79 [data-role=debris]').length}})()");
    assert.ok(layout.scroll <= size.width && layout.titleScroll <= size.width);
    assert.ok(layout.hintSize.w > 0 && layout.hintSize.h > 0);
    assert.ok(layout.options.top >= 0 && layout.options.bottom <= size.height + 1, 'focused action remains visible');
    assert.equal(layout.foreground, 0); assert.equal(layout.debris, 0);
    report.milestones.push({ name: 'long-objective-display-fixture-' + size.width, layout });
    await capture('03-long-objective-' + size.width);
  }
  assert.equal(await evaluate('JSON.stringify(__ATF_V51__.saveSystem.data)'), fixtureSave);
  for (const phase of ['pending', 'console', 'return']) {
    await evaluate("(()=>{const save=__ATF_V51__.saveSystem.data;save.openingExerciseV89={schema:89,phase:" + JSON.stringify(phase) + ",sessionId:'m41a-qualification-v81:session-1'};__ATF_V61__.titleScreen.show();__ATF_V61__.titleScreen.openMenu()})()");
    assert.equal(await evaluate('__ATF_V61__.snapshot().resumeContext.kind'), 'exercise');
    assert.equal(await evaluate("(async()=>{const {getOpeningExerciseObjectiveV89}=await import('/src/opening-exercise-v89.js');const s=__ATF_V51__.saveSystem.data;return document.querySelector('#title-resume-context-v89').textContent===getOpeningExerciseObjectiveV89(s.openingExerciseV89,s.openingV88,s.onboardingV84).text})()"), true);
  }
  report.milestones.push({ name: 'V89-exercise-display-fixtures-pending-console-return-priority' });
  await capture('04-exercise-return');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await click('#title-options');
  await evaluate('__ATF_V51__.saveSystem.data={...__ATF_V51__.saveSystem.data,createdAt:__ATF_V51__.saveSystem.data.createdAt+1}');
  await click('#setting-title-preview-v87');
  await until('__ATF_V61__.snapshot().state==="idle"&&document.activeElement.id==="title-start"', 'replaced timeline invalidates deferred options focus');
  report.milestones.push({ name: 'timeline-replacement-display-fixture-invalidates-focus' });
  assert.deepEqual(report.errors, []); report.ok = true;
} catch (error) { report.failure = error.stack || String(error); process.exitCode = 1; await capture('failure').catch(()=>{}); }
finally {
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
  if (context) await cdp('Target.disposeBrowserContext', { browserContextId: context }, true).catch(()=>{});
  socket.close(); console.log(JSON.stringify({ ok: report.ok, milestones: report.milestones.length, errors: report.errors.length, failure: report.failure || null, output }));
}
