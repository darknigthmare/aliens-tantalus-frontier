import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Private UI smoke, not a full gameplay journey. Real DOM listeners and native images.
const base = process.env.APP_URL || 'http://127.0.0.1:4197';
const output = resolve(process.env.QA_OUTPUT || 'E:/CodexQA/AliensTantalus/v90-campaign-20260923/catalog-browser-private');
await mkdir(output, { recursive: true });
const info = await fetch(`http://127.0.0.1:${process.env.QA_CDP_PORT || 9239}/json/version`).then(r => r.json());
const ws = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok, fail) => { ws.addEventListener('open', ok, { once: true }); ws.addEventListener('error', fail, { once: true }); });
let serial = 0, session, context;
const pending = new Map(), errors = [], report = { ok: false, base, browser: info.Browser,
  scope: 'Private fresh save fixture. Real catalog and BIOFORGE UI listeners exercised via DOM input/change events; native images, links and desktop/mobile layout verified. Not a full keyboard journey or lab combat verification.', checks: [], screenshots: [], errors };
ws.addEventListener('message', event => {
  const m = JSON.parse(event.data), job = pending.get(m.id);
  if (job) { clearTimeout(job.timer); pending.delete(m.id); m.error ? job.reject(Error(m.error.message)) : job.resolve(m.result); }
  if (m.sessionId !== session) return;
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value || a.description).join(' '));
  if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) errors.push(`${m.params.response.status} ${m.params.response.url}`);
});
function cdp(method, params = {}, browser = false) { return new Promise((resolveJob, reject) => {
  const id = ++serial, timer = setTimeout(() => { pending.delete(id); reject(Error('Timeout ' + method)); }, 30000);
  pending.set(id, { resolve: resolveJob, reject, timer }); ws.send(JSON.stringify({ id, method, params, ...(session && !browser ? { sessionId: session } : {}) }));
}); }
async function read(expression) {
  const r = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}
async function until(expression, timeout = 45000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) { const r = await read(expression); if (r) return r; await new Promise(ok => setTimeout(ok, 80)); }
  throw Error('Condition timed out: ' + expression);
}
async function capture(name) {
  const r = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 92, captureBeyondViewport: false });
  await writeFile(resolve(output, name + '.jpg'), Buffer.from(r.data, 'base64')); report.screenshots.push(name + '.jpg');
}
try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true));
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true);
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId, flatten: true }, true));
  for (const domain of ['Page', 'Runtime', 'Network']) await cdp(domain + '.enable');
  await cdp('Network.setBypassServiceWorker', { bypass: true });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, mobile: false, deviceScaleFactor: 1 });
  await cdp('Page.navigate', { url: base + '/?qa=catalog-behaviors-v90' });
  await until('globalThis.__ATF_V51__&&globalThis.__ATF_V61__&&!document.querySelector("#boot")');
  assert.ok(await read('document.body.innerText.length>100&&!document.querySelector(".vite-error-overlay,[data-nextjs-dialog]")'));
  await capture('boot');
  await read(`(async()=>{const {createDefaultSave}=await import('/src/save.js');
    const s=createDefaultSave();s.onboardingV84=null;s.openingV88=null;s.openingExerciseV89=null;s.needsPlayerCreationV84=false;s.scene='hub';s.shipPortV1=null;
    __ATF_V51__.saveSystem.commit(s);__ATF_V61__.titleScreen.hide();__ATF_V51__.renderAll();__ATF_V51__.showView('bestiary');})()`);
  const definitions = await read(`import('/src/enemy-user-campaign-v88.js').then(m=>m.ENEMY_USER_CAMPAIGN_V88.filter(d=>d.specializedBehaviorV90||d.specializedBehaviorV89).map(d=>({id:d.id,behavior:d.specializedBehaviorV90||d.specializedBehaviorV89})))`);
  assert.equal(definitions.length,5);
  for (const d of definitions) {
    await read(`(()=>{const q=document.querySelector('#enemy-search');q.value=${JSON.stringify(d.id)};q.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    const result = await until(`(()=>{const root=document.querySelector('#enemy-catalog-detail'),section=root?.querySelector('[data-combat-behavior]'),img=root?.querySelector('[data-visual-mode="static-pose"] img');return section?.dataset.combatBehavior===${JSON.stringify(d.behavior.id)}&&img?.complete&&img.naturalWidth?{id:${JSON.stringify(d.id)},text:root.textContent,link:section.querySelector('a')?.href,fit:getComputedStyle(img).objectFit}:null})()`);
    assert.ok(result.text.includes(d.behavior.label)); assert.match(result.text,/animations manquantes/); assert.match(result.text,/fidélité canonique non certifiée/);
    assert.doesNotMatch(result.text,/source-grounded-partial-v90/); assert.equal(result.fit,'contain'); assert.match(result.link,/^https:\/\/www\.aliensfireteamelite\.com\//);
    report.checks.push({surface:'encyclopedia',...result});
  }
  await read("document.querySelector('#enemy-catalog-detail [data-combat-behavior]').scrollIntoView({block:'center',behavior:'instant'})");
  await capture('encyclopedia-runner-behavior');
  await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,mobile:false,deviceScaleFactor:1});
  await read("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))");
  await read("document.querySelector('#enemy-catalog-detail [data-combat-behavior]').scrollIntoView({block:'center',inline:'nearest',behavior:'instant'})");
  // The mobile rail has a 200ms transform transition after viewport changes.
  // Wait for actual hit-testing, not merely for a layout frame or scrollWidth.
  await until("(()=>{const a=document.querySelector('#enemy-catalog-detail [data-combat-behavior] a'),r=a.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===a})()",2000);
  report.checks.push(await read("(()=>{const e=document.querySelector('#enemy-catalog-detail [data-combat-behavior]'),r=e.getBoundingClientRect(),a=e.querySelector('a'),b=a.getBoundingClientRect();return {surface:'encyclopedia-mobile',x:r.x,y:r.y,width:r.width,height:r.height,linkY:b.y,linkX:b.x,linkVisible:document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)===a}})()"));
  assert.equal(report.checks.at(-1).linkVisible,true,'Source link must actually be reachable in the mobile viewport');
  assert.ok(await read('document.documentElement.scrollWidth<=innerWidth+1')); await capture('encyclopedia-mobile');
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,mobile:false,deviceScaleFactor:1});
  await read("__ATF_V51__.showView('settings');__ATF_BIOFORGE_V80__.open()");
  for (const d of definitions) {
    await read(`(()=>{const q=document.querySelector('#bioforge-profile-v80');q.value=${JSON.stringify(d.id)};q.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    const result = await until(`(()=>{const note=document.querySelector('#bioforge-mission-behavior-v90');return !note?.hidden&&note?.dataset.missionBehavior===${JSON.stringify(d.behavior.id)}?{id:${JSON.stringify(d.id)},note:note.innerText,cost:document.querySelector('#bioforge-cost-v80').innerText,link:note.querySelector('a')?.href}:null})()`);
    assert.ok(result.note.includes(d.behavior.label)); assert.match(result.note,/Non reproduit dans le labo simplifié/); assert.match(result.cost,/Pose fixe · animations manquantes · comportement labo simplifié/);
    assert.match(result.link,/^https:\/\/www\.aliensfireteamelite\.com\//); report.checks.push({surface:'bioforge',...result});
  }
  await read("document.querySelector('#bioforge-mission-behavior-v90').scrollIntoView({block:'center',behavior:'instant'})"); await capture('bioforge-runner-mission-only');
  await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,mobile:false,deviceScaleFactor:1});
  await read("document.querySelector('#bioforge-mission-behavior-v90').scrollIntoView({block:'center',behavior:'instant'})");
  assert.ok(await read('document.documentElement.scrollWidth<=innerWidth+1')); await capture('bioforge-mobile-mission-only');
  await read("const q=document.querySelector('#bioforge-profile-v80');q.value='enemy-005-warrior';q.dispatchEvent(new Event('change',{bubbles:true}))");
  assert.equal(await read("document.querySelector('#bioforge-mission-behavior-v90').hidden"),true);
  assert.deepEqual(errors, []); report.ok = true;
} catch (e) { report.failure = { message: e.message }; try { await capture('failure'); } catch {} throw e;
} finally {
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
  try { if (context) await cdp('Target.disposeBrowserContext', { browserContextId: context }, true); } catch {}
  ws.close();
}
console.log(JSON.stringify({ ok: report.ok, checks: report.checks.length, screenshots: report.screenshots.length, output }));
