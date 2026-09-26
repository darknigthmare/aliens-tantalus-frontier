import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// The normal title is checked first without fixtures. The two camera/event
// contracts are then exercised explicitly on the real presentation controller;
// they do not claim that a campaign mission or station was reached through play.
const base = process.env.APP_URL || 'http://127.0.0.1:4195';
const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9237';
const output = resolve(process.env.QA_OUTPUT || 'E:/CodexQA/AliensTantalus/v88-menu-20260923/runtime');
await mkdir(output, { recursive: true });
const version = await fetch(endpoint + '/json/version').then(r => r.json());
const socket = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }); });
const pending = new Map(); let sequence = 0, session, context;
const report = { ok: false, base, milestones: [], errors: [], screenshots: [], contextCoverage: 'explicit presentation contracts, not a full campaign/station journey' };
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
  await cdp('Page.navigate', { url: base + '/?qa-title-menu-v88=1' });
  await until('Boolean(globalThis.__ATF_V61__&&!document.querySelector("#boot")&&!document.querySelector("#title-screen").hidden)', 'real title boot');
  await ready(); await wait(1000);
  const initialSave = await evaluate('JSON.stringify(__ATF_V51__.saveSystem.data)');
  const initial = await inspect();
  assert.equal(initial.scene.viewpoint, 'exterior'); assert.equal(initial.foreground, 0); assert.equal(initial.debris, 0);
  assert.equal(initial.ships, 1); assert.equal(initial.animation, 'none'); assert.equal(initial.scene.missingAssetCount, 0);
  const approvedAngles = await evaluate('(async()=>{const {getTitleSceneShipAnglesV88}=await import("/src/title-scene-catalog-v79.js");return getTitleSceneShipAnglesV88(__ATF_V61__.snapshot().scene.shipId).map(a=>a.id)})()');
  assert.ok(approvedAngles.includes(initial.scene.shipAssetId));
  assert.equal(initial.scene.availableShipAngles, approvedAngles.length);
  report.milestones.push({ name: 'normal-exterior-no-frame-no-debris', initial });
  await capture('01-exterior-desktop');
  const motion = await evaluate(`new Promise(resolve=>{const samples=[];const ship=document.querySelector('#title-scene-v79 [data-role=orbitals]');const sample=t=>{const r=ship.getBoundingClientRect();samples.push({t,x:r.x,y:r.y});if(samples.length<121)requestAnimationFrame(sample);else resolve(samples)};requestAnimationFrame(sample)})`);
  const travel = Math.hypot(motion.at(-1).x-motion[0].x,motion.at(-1).y-motion[0].y);
  const maxStep = Math.max(...motion.slice(1).map((p,i)=>Math.hypot(p.x-motion[i].x,p.y-motion[i].y)));
  assert.ok(travel > .3, 'visible continuous flight'); assert.ok(maxStep < 2, 'no frame teleport');
  report.milestones.push({ name: '121-real-animation-frames', travel, maxStep, durationMs: motion.at(-1).t-motion[0].t });
  await evaluate('globalThis.__menuImageV88=document.querySelector("#title-scene-v79 [data-role=orbitals]")');
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await until('__ATF_V61__.snapshot().scene.mode==="static"', 'OS reduced motion');
  const frozen = await inspect(); await wait(750);
  assert.equal((await inspect()).transform, frozen.transform);
  assert.equal(await evaluate('globalThis.__menuImageV88===document.querySelector("#title-scene-v79 [data-role=orbitals]")'), true);
  report.milestones.push({ name: 'OS-reduced-motion-static-native-node-preserved', frozen });
  await capture('02-static-desktop');
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await until('__ATF_V61__.snapshot().scene.mode==="full"', 'motion resumed');
  await evaluate('__ATF_V61__.titleScreen.scene.setSceneContextV88({viewpoint:"station-observer",stationId:"qa-station-observer"})');
  await ready(); const station = await inspect();
  assert.ok(station.foreground > 0); assert.equal(station.debris, 0);
  report.milestones.push({ name: 'explicit-station-contract-only', station }); await capture('03-explicit-station-contract');
  await evaluate('__ATF_V61__.titleScreen.scene.setSceneContextV88({debris:{active:true,kind:"wreck-field",sourceType:"event",sourceId:"qa-confirmed-wreckage"}})');
  await ready(); const wreckage = await inspect();
  assert.equal(wreckage.foreground, 0); assert.ok(wreckage.debris > 0);
  report.milestones.push({ name: 'explicit-event-contract-only', wreckage }); await capture('04-explicit-event-contract');
  await evaluate('__ATF_V61__.titleScreen.scene.setSceneContextV88(null)');
  assert.equal(await evaluate('JSON.stringify(__ATF_V51__.saveSystem.data)'), initialSave);
  if (await evaluate('document.querySelector("#title-menu").hidden')) await click('#title-start');
  await click('#title-options');
  await until('document.querySelector("#title-screen").hidden', 'normal options navigation');
  const elapsed = await evaluate('__ATF_V61__.titleScreen.scene.flightClock.elapsed'); await wait(650);
  assert.equal(await evaluate('__ATF_V61__.titleScreen.scene.flightClock.elapsed'), elapsed);
  await click('#setting-title-preview-v87'); await ready();
  report.milestones.push({ name: 'real-options-navigation-stops-flight' });
  for (const size of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await cdp('Emulation.setDeviceMetricsOverride', { ...size, deviceScaleFactor: 1, mobile: false }); await wait(150);
    const result = await inspect(); assert.equal(result.overflow, false); assert.equal(result.foreground, 0); assert.equal(result.debris, 0);
    assert.ok(result.box.w > 0 && result.box.h > 0);
    report.milestones.push({ name: 'responsive-' + size.width, result }); await capture('05-exterior-' + size.width);
  }
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await evaluate('__ATF_V61__.titleScreen.scene.useFallback("qa-legacy-fallback")');
  await capture('06-legacy-fallback');
  report.milestones.push({ name: 'legacy-fallback-visually-inspected', asset: '/assets/openai/ui/title/tantalus-frontier-title-background-v61.png' });
  assert.deepEqual(report.errors, []); report.ok = true;
} catch (error) { report.failure = error.stack || String(error); process.exitCode = 1; await capture('failure').catch(()=>{}); }
finally {
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
  if (context) await cdp('Target.disposeBrowserContext', { browserContextId: context }, true).catch(()=>{});
  socket.close(); console.log(JSON.stringify({ ok: report.ok, milestones: report.milestones.length, errors: report.errors.length, failure: report.failure || null, output }));
}
