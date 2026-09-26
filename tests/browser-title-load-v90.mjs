import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Fault-injection QA only: no art is approved and no saved/player data is edited.
const base = process.env.APP_URL || 'http://127.0.0.1:4195';
const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9243';
const output = resolve(process.env.QA_OUTPUT || 'E:/CodexQA/AliensTantalus/v90-menu-20260923/ship-load');
await mkdir(output, { recursive: true });
const version = await fetch(endpoint + '/json/version').then(r => r.json());
const socket = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }); });
let sequence = 0, session, context, fault = null, replacementPNG;
const pending = new Map();
const report = { ok: false, base, milestones: [], errors: [], injectedRequests: [], screenshots: [],
  coverage: 'Real reference and four admitted native views decoded and framed at desktop/mobile sizes; fault fixtures stay in memory. Quay objective is a display fixture, not a played mission.' };
function cdp(method, params = {}, browser = false) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(Error('CDP timeout ' + method)); }, 20000);
    pending.set(id, { resolve: v => { clearTimeout(timer); resolve(v); }, reject: e => { clearTimeout(timer); reject(e); } });
    socket.send(JSON.stringify({ id, method, params, ...(!browser && session ? { sessionId: session } : {}) }));
  });
}
socket.addEventListener('message', event => {
  const m = JSON.parse(event.data), p = pending.get(m.id);
  if (p) { pending.delete(m.id); m.error ? p.reject(Error(m.error.message)) : p.resolve(m.result); }
  if (m.sessionId !== session) return;
  if (m.method === 'Runtime.exceptionThrown') report.errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') report.errors.push(m.params.args.map(a => a.value || a.description).join(' '));
  if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) report.errors.push(m.params.response.status + ' ' + m.params.response.url);
  if (m.method === 'Fetch.requestPaused') {
    const { requestId, request } = m.params;
    const apply = fault && request.url.endsWith(fault.suffix);
    if (apply) report.injectedRequests.push({ type: fault.type, url: request.url });
    const action = !apply ? cdp('Fetch.continueRequest', { requestId })
      : fault.type === 'dimensions' ? cdp('Fetch.fulfillRequest', { requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'image/png' }], body: replacementPNG })
        : cdp('Fetch.failRequest', { requestId, errorReason: 'Failed' });
    action.catch(error => report.errors.push(String(error)));
  }
});
async function evaluate(expression) {
  const r = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(expression, label) {
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    try { if (await evaluate(expression)) return; }
    catch (error) { if (!/ReferenceError|context.*destroyed|Cannot find context/i.test(String(error))) throw error; }
    await wait(50);
  }
  throw Error('Timeout: ' + label);
}
async function capture(name) {
  const r = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 85, captureBeyondViewport: false });
  await writeFile(resolve(output, name + '.jpg'), Buffer.from(r.data, 'base64')); report.screenshots.push(name + '.jpg');
}
const boot = () => until('Boolean(globalThis.__ATF_V61__&&!document.querySelector("#boot")&&!document.querySelector("#title-screen").hidden)', 'real boot');
const ready = () => until('document.querySelector("#title-scene-v79 [data-role=orbitals]")?.dataset.assetStatus==="ready"&&!__ATF_V61__.snapshot().scene.fallbackVisible', 'reference ship decode');
const snapshot = () => evaluate('__ATF_V61__.snapshot().scene');
async function presentFixture(fixture) {
  return evaluate(`(()=>{const scene=__ATF_V61__.titleScreen.scene;scene.hide();scene.shipAngleAssets=[${JSON.stringify(fixture)}];scene.shipAngleAssetId=${JSON.stringify(fixture.id)};scene.angleShipId=${JSON.stringify(fixture.shipId)};scene.preservePlacementOnNextShowV87();scene.show(__ATF_V51__.saveSystem.data);return {placement:scene.placementId,elapsed:scene.flightClock.elapsed}})()`);
}
try {
  context = (await cdp('Target.createBrowserContext', {}, true)).browserContextId;
  const target = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true);
  session = (await cdp('Target.attachToTarget', { targetId: target.targetId, flatten: true }, true)).sessionId;
  for (const domain of ['Page', 'Runtime', 'Network']) await cdp(domain + '.enable');
  await cdp('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp('Network.setBypassServiceWorker', { bypass: true });
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: "try{sessionStorage.setItem('atf-title-angle-v88:uss-sulaco','orbitals-uss-sulaco-rear-quarter-v90')}catch{}" });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await cdp('Page.navigate', { url: base + '/?qa-title-load-v90=1' }); await boot(); await ready();
  const initialSave = await evaluate('JSON.stringify(__ATF_V51__.saveSystem.data)');
  const reference = await evaluate('(async()=>{const {TITLE_SHIP_ASSETS_V87}=await import("/src/title-scene-assets-v79.js");return TITLE_SHIP_ASSETS_V87.find(a=>a.shipId===__ATF_V61__.snapshot().scene.shipId)})()');
  replacementPNG = Buffer.from(await fetch(base + reference.src).then(r => r.arrayBuffer())).toString('base64');
  const first = await snapshot(); assert.equal(first.mode, 'static'); assert.equal(first.viewpoint, 'exterior'); assert.equal(first.debrisSource, null);
  report.milestones.push({ name: 'real-native-reference-decoded', scene: first }); await capture('01-native-reference');
  assert.ok(await evaluate('JSON.stringify(__ATF_V51__.saveSystem.data)') === initialSave, 'native presentation preserves current save');
  await cdp('Fetch.enable', { patterns: [{ urlPattern: '*assets/openai/ui/title/*/orbitals/*.png' }] });
  fault = { type: 'network', suffix: reference.src };
  await cdp('Page.reload', { ignoreCache: true }); await boot();
  await until('__ATF_V61__.snapshot().scene.fallbackVisible&&__ATF_V61__.snapshot().scene.shipAssetFailure?.recovery==="background"', 'explicit reference fallback');
  const missing = await snapshot(); assert.equal(missing.shipAssetFailure.recovery, 'background');
  // An uncreated profile is deliberately not persisted; reload creates fresh timestamps.
  // Compare presentation changes within that new timeline rather than fabricating persistence.
  const reloadedSave = await evaluate('JSON.stringify(__ATF_V51__.saveSystem.data)');
  await until('__ATF_V61__.titleScreen.scene.fallback.naturalWidth>0', 'fallback bitmap decoded');
  await evaluate('__ATF_V61__.titleScreen.openMenu()');
  assert.equal(await evaluate('__ATF_V61__.snapshot().state'), 'menu');
  report.milestones.push({ name: 'real-image-network-failure-has-visible-fallback-and-working-menu', scene: missing }); await capture('02-network-fallback');
  fault = null;
  await evaluate('(()=>{const s=__ATF_V61__.titleScreen.scene;s.hide();s.preservePlacementOnNextShowV87();s.show(__ATF_V51__.saveSystem.data)})()'); await ready();
  report.milestones.push({ name: 'reference-retries-successfully-on-return' });
  const fixture = { id: 'orbitals-qa-front-quarter-v88', runtimeId: 'title.v88.ship.qa.front-quarter', shipId: reference.shipId,
    angleId: 'front-quarter', src: '/assets/openai/ui/title/v88/orbitals/qa-front-quarter-v90.png', sha256: '1'.repeat(64),
    sourceWidth: 1024, sourceHeight: 768, hullRegistration: { x: 10, y: 20, width: 1000, height: 700, sourceWidth: 1024, sourceHeight: 768 },
    status: 'ready', viewAuthorship: 'native-authored-angle' };
  fault = { type: 'network', suffix: fixture.src }; const before = await presentFixture(fixture);
  await until('__ATF_V61__.snapshot().scene.shipAssetFailure?.recovery==="reference"', 'alternate fixture fails to native reference'); await ready();
  assert.equal((await snapshot()).shipAssetId, reference.id);
  assert.deepEqual(await evaluate('({placement:__ATF_V61__.titleScreen.scene.placementId,elapsed:__ATF_V61__.titleScreen.scene.flightClock.elapsed})'), before);
  report.milestones.push({ name: 'alternate-network-fault-fixture-preserves-native-reference-and-clock' });
  fault = { type: 'dimensions', suffix: fixture.src }; await presentFixture(fixture);
  await until('__ATF_V61__.snapshot().scene.shipAssetFailure?.reason==="dimensions"', 'wrong decoded dimensions rejected'); await ready();
  assert.equal((await snapshot()).shipAssetId, reference.id);
  report.milestones.push({ name: 'wrong-real-decoded-PNG-dimensions-fixture-rejected' }); await capture('03-alternate-fixture-recovered');
  assert.ok(await evaluate('JSON.stringify(__ATF_V51__.saveSystem.data)') === reloadedSave, 'strict save invariance within the reloaded timeline');
  assert.equal(await evaluate('document.querySelectorAll("#title-scene-v79 [data-role=foreground],#title-scene-v79 [data-role=debris]").length'), 0);
  assert.equal(report.injectedRequests.length, 3); assert.deepEqual(report.errors, []);
  report.milestones.push({ name: 'save-exterior-and-debris-contracts-unchanged' });
  // Menu wording fixture only; this does not claim to play the arrival quay.
  fault = null;
  await evaluate(`(async()=>{const {createPlayerOnboardingV84}=await import('/src/player-onboarding-v84.js');const {createPlayerOpeningV88}=await import('/src/player-opening-v88.js');const {createPortMeridienV90}=await import('/src/port-meridien-v90.js');const s=__ATF_V51__.saveSystem.data=structuredClone(__ATF_V51__.saveSystem.data);s.needsPlayerCreationV84=false;s.onboardingV84={...createPlayerOnboardingV84({name:'Alex Moreau',callsign:'FOX-9'}),phase:'complete'};s.openingV88={...createPlayerOpeningV88(),phase:'ready',qualificationId:'m41a-qualification-v81:session-1:qualification',freight:'energy'};s.portMeridienV90={...createPortMeridienV90(),phase:'triage',freight:'energy'};__ATF_V61__.titleScreen.scene.shipAngleAssets=[];__ATF_V61__.titleScreen.show();__ATF_V61__.titleScreen.openMenu()})()`);
  await ready();
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
  const fixtureSave = await evaluate('JSON.stringify(__ATF_V51__.saveSystem.data)');
  assert.equal(await evaluate('__ATF_V61__.snapshot().resumeContext.kind'), 'port-meridien');
  assert.equal(await evaluate(`(async()=>{const{getPortMeridienObjectiveV90}=await import('/src/port-meridien-v90.js');const s=__ATF_V51__.saveSystem.data;return document.querySelector('#title-resume-context-v89').textContent===getPortMeridienObjectiveV90(s.portMeridienV90,s.openingV88,s.onboardingV84).text})()`), true);
  assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'), true);
  await capture('04-quay-objective-mobile-display-fixture');
  assert.ok(await evaluate('JSON.stringify(__ATF_V51__.saveSystem.data)') === fixtureSave);
  report.milestones.push({ name: 'actual-quay-domain-objective-mobile-display-fixture-is-pure' });
  const admitted = await evaluate('(async()=>{const m=await import("/src/title-scene-angle-assets-v88.js");return m.TITLE_SHIP_ANGLE_ASSETS_V88.filter(a=>a.id.endsWith("-v90"))})()');
  assert.equal(admitted.length, 4);
  for (const asset of admitted) {
    await evaluate(`(()=>{const save=__ATF_V51__.saveSystem.data;save.presentation.titleScene={...save.presentation.titleScene,shipId:${JSON.stringify(asset.shipId)}};const s=__ATF_V61__.titleScreen.scene;s.hide();s.shipAngleAssets=undefined;s.shipAngleAssetId=${JSON.stringify(asset.id)};s.angleShipId=${JSON.stringify(asset.shipId)};s.placementId='starboard';s.preservePlacementOnNextShowV87();s.show(save)})()`);
    await ready();
    const preserved = await evaluate('JSON.stringify(__ATF_V51__.saveSystem.data)');
    for (const size of [{width:1280,height:720},{width:390,height:844}]) {
      await cdp('Emulation.setDeviceMetricsOverride', { ...size, deviceScaleFactor:1, mobile:false });
      const measured = await evaluate(`(()=>{const ship=document.querySelector('#title-scene-v79 [data-role=orbitals]'),img=ship.querySelector('img'),r=img.getBoundingClientRect();return {assetId:ship.dataset.assetId,width:img.naturalWidth,height:img.naturalHeight,ratio:r.width/r.height,x:r.x,y:r.y,right:r.right,bottom:r.bottom,opacity:getComputedStyle(ship).opacity,markings:ship.querySelectorAll('.title-ship-marking-v87').length,overflow:document.documentElement.scrollWidth>innerWidth}})()`);
      assert.equal(measured.assetId,asset.id); assert.equal(measured.width,1536); assert.equal(measured.height,1024);
      assert.ok(Math.abs(measured.ratio-1.5)<.005); assert.ok(measured.x>=0&&measured.right<=size.width+1&&measured.y>=0&&measured.bottom<=size.height+1);
      assert.equal(measured.markings,0); assert.equal(measured.overflow,false);
      await capture('05-'+asset.id+'-'+size.width);
    }
    assert.ok(await evaluate('JSON.stringify(__ATF_V51__.saveSystem.data)')===preserved);
    report.milestones.push({name:'admitted-native-view-desktop-mobile-'+asset.id});
  }
  assert.deepEqual(report.errors,[]); report.ok = true;
} catch (error) { report.failure = error.stack || String(error); process.exitCode = 1; await capture('failure').catch(()=>{}); }
finally {
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
  if (context) await cdp('Target.disposeBrowserContext', { browserContextId: context }, true).catch(()=>{});
  socket.close(); console.log(JSON.stringify({ ok: report.ok, milestones: report.milestones.length, errors: report.errors.length, failure: report.failure || null, output }));
}
