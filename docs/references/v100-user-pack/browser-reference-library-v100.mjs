import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Isolated native-browser QA. No public deployment or campaign-completion claim.
const base = process.env.APP_URL || 'http://127.0.0.1:4308';
const output = resolve(process.env.QA_OUTPUT || '.qa/v100-browser');
const phase = process.env.QA_PHASE || 'full';
await mkdir(output, { recursive: true });
const info = await fetch('http://127.0.0.1:9266/json/version').then(r => r.json());
const ws = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok, fail) => { ws.addEventListener('open', ok, { once: true }); ws.addEventListener('error', fail, { once: true }); });
let sequence = 0, session, context;
const pending = new Map(), errors = [], responses = [], networkFailures = [], storageEvents = [];
const report = { ok: false, phase, base, browser: info.Browser, checks: {}, errors, networkFailures, scope: [
  'New isolated browser context. The normal browser profile and its saves are untouched.',
  'Default-save fixture skips onboarding only in this disposable context; access to Xénobiologie is clicked normally.',
  'Filtering, selection, pagination and related-view changes use native CDP mouse and keyboard input.',
  'DOM and save observations are read-only; no campaign/combat values injected beyond the explicit onboarding fixture.',
  'Service worker bypassed; this checks local source UI, not deployed or offline behavior.'
] };
ws.addEventListener('message', event => {
  const m = JSON.parse(event.data), p = pending.get(m.id);
  if (p) { pending.delete(m.id); clearTimeout(p.timer); m.error ? p.fail(Error(m.error.message)) : p.ok(m.result); }
  if (m.sessionId !== session) return;
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value || a.description).join(' '));
  if (m.method === 'Network.responseReceived') { const r = m.params.response; responses.push({ url: r.url, status: r.status }); if (r.status >= 400) errors.push(r.status + ' ' + r.url); }
  if (m.method === 'Network.loadingFailed') networkFailures.push(m.params);
  if (m.method?.startsWith('DOMStorage.domStorage')) storageEvents.push({ method: m.method, params: m.params });
});
function cdp(method, params = {}, browser = false) { return new Promise((ok, fail) => {
  const id = ++sequence, timer = setTimeout(() => { pending.delete(id); fail(Error('Timeout ' + method)); }, 30000);
  pending.set(id, { ok, fail, timer }); ws.send(JSON.stringify({ id, method, params, ...(!browser && session ? { sessionId: session } : {}) }));
}); }
async function read(expression) { const r = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; }
const wait = ms => new Promise(ok => setTimeout(ok, ms));
async function until(expression, label, timeout = 30000) { const end = Date.now() + timeout; while (Date.now() < end) { const result = await read(expression); if (result) return result; await wait(80); } throw Error('Timeout: ' + label); }
const special = { Home: ['Home',36], ArrowDown: ['ArrowDown',40], Enter: ['Enter',13], Tab: ['Tab',9], Space: [' ',32], Backspace: ['Backspace',8], Escape: ['Escape',27], KeyA: ['a',65] };
async function press(code, modifiers = 0) { const [key, windowsVirtualKeyCode] = special[code]; for (const type of ['keyDown','keyUp']) await cdp('Input.dispatchKeyEvent', { type, key, code, modifiers, windowsVirtualKeyCode }); }
async function click(selector) {
  await read(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'center',behavior:'instant'})`); await wait(60);
  const box = await read(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled)return null;const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,h=document.elementFromPoint(x,y);return {x,y,w:r.width,h:r.height,hit:h===e||e.contains(h)};})()`);
  assert.ok(box?.w && box?.h && box.hit, 'Clickable ' + selector + ' ' + JSON.stringify(box));
  await cdp('Input.dispatchMouseEvent', { type:'mousePressed',x:box.x,y:box.y,button:'left',buttons:1,clickCount:1 });
  await cdp('Input.dispatchMouseEvent', { type:'mouseReleased',x:box.x,y:box.y,button:'left',buttons:0,clickCount:1 }); await wait(80);
}
async function choose(selector, value, rerenders = false) {
  const index = await read(`[...document.querySelector(${JSON.stringify(selector)}).options].findIndex(o=>o.value===${JSON.stringify(value)})`);
  assert.ok(index >= 0, 'Option exists: ' + value); await click(selector); await press('Home');
  for(let i=0;i<index;i++) await press('ArrowDown');
  await press('Enter'); await press('Tab');
  // Related-view selection recreates this menu at its placeholder; callers verify the selected detail instead.
  if (!rerenders) assert.equal(await read(`document.querySelector(${JSON.stringify(selector)}).value`),value);
}
async function fill(selector, value) { await click(selector); await press('KeyA',2); await press('Backspace'); if(value) await cdp('Input.insertText',{text:value}); await press('Tab'); await wait(80); }
async function capture(name) {
  // Wait for pixels in the current viewport, not only the image header/naturalWidth.
  const imagePaint=await read(`(async()=>{const images=[...document.images].filter(i=>{const r=i.getBoundingClientRect();if(!(r.width>0&&r.height>0&&r.bottom>0&&r.right>0&&r.top<innerHeight&&r.left<innerWidth))return false;const x=(Math.max(0,r.left)+Math.min(innerWidth,r.right))/2,y=(Math.max(0,r.top)+Math.min(innerHeight,r.bottom))/2;return document.elementFromPoint(x,y)===i});return Promise.race([Promise.all(images.map(async i=>{try{await i.decode();return {src:i.currentSrc,decoded:true}}catch(e){return {src:i.currentSrc,error:String(e)}}})),new Promise(ok=>setTimeout(()=>ok({timeout:true,images:images.map(i=>({src:i.currentSrc,complete:i.complete,width:i.naturalWidth}))}),8000))]);})()`);
  (report.captureImageReadiness ||= {})[name]=imagePaint;
  // Headless mobile rAF can be suspended; screenshot itself provides the compositor synchronization.
  await wait(120);
  const r = await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false}); await writeFile(resolve(output,name+'.png'),Buffer.from(r.data,'base64'));
}
function check(name, result) { report.checks[name]=result; console.log(JSON.stringify({check:name,ok:true})); }
const q = s => JSON.stringify(s), root = '#user-reference-library-v100';
const count = () => read(`document.querySelector('[data-reference-count]').textContent`);
const detail = () => read(`({id:document.querySelector('[data-reference-detail]').dataset.referenceId,text:document.querySelector('[data-reference-detail]').innerText,src:document.querySelector('[data-reference-detail] img')?.currentSrc,decoded:document.querySelector('[data-reference-detail] img')?.naturalWidth>0})`);
const saved = () => read('JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])))');
try {
  ({browserContextId:context}=await cdp('Target.createBrowserContext',{},true));
  const {targetId}=await cdp('Target.createTarget',{url:'about:blank',browserContextId:context},true);
  ({sessionId:session}=await cdp('Target.attachToTarget',{targetId,flatten:true},true));
  for(const domain of ['Page','Runtime','Network','DOMStorage']) await cdp(domain+'.enable');
  await cdp('Network.setBypassServiceWorker',{bypass:true});
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await cdp('Page.navigate',{url:base+'/?qa=xeno-trials-v96'});
  await until('globalThis.__ATF_V51__&&globalThis.__ATF_V61__&&!document.querySelector("#boot")','application boot',60000);
  const boot=await read('({title:document.title,bodyLength:document.body.innerText.length,overlay:!!document.querySelector(".vite-error-overlay,[data-nextjs-dialog],#webpack-dev-server-client-overlay"),buttons:[...document.querySelectorAll("button")].filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height).map(e=>({text:e.innerText,view:e.dataset.view}))})');
  assert.ok(boot.bodyLength>100&&!boot.overlay&&boot.buttons.length);check('boot',boot);await capture('00-boot');
  if(phase!=='boot') {
    await read(`(async()=>{const {createDefaultSave}=await import('/src/save.js');const s=createDefaultSave();s.onboardingV84=null;s.openingV88=null;s.portMeridienV90=null;s.needsPlayerCreationV84=false;s.shipPortV1=null;s.scene='hub';__ATF_V51__.saveSystem.commit(s);__ATF_V61__.titleScreen.hide();__ATF_V51__.showView('settings');})()`);
    await click('[data-view="bestiary"]');
    await until(`document.querySelector(${q(root)})?.getBoundingClientRect().width>0`,'library access');
    assert.match(await count(),/^108 \/ 108 images/); assert.equal(await read('document.querySelectorAll("[data-reference-entry]").length'),24);
    await until('document.querySelector("[data-reference-detail] img").naturalWidth>0','first original');
    check('nativeNavigationAndInitialCount',{count:await count(),initial:await detail()});
    await read(`document.querySelector(${q(root)}).scrollIntoView({block:'start',behavior:'instant'});window.scrollBy(0,-90)`);await capture('01-desktop-library');
    await wait(250);const beforeSave=await saved(),storageStart=storageEvents.length;
    await fill('[data-reference-search]','introuvable v100 zzz');
    assert.match(await count(),/^0 \/ 108 images/);assert.match((await detail()).text,/Aucune image/);
    await click('[data-reference-reset]');assert.match(await count(),/^108 \/ 108 images/);
    check('emptySearchAndReset',{zeroResults:true,reset:await count()});
    await choose('[data-reference-filter="biology"]','xenomorph');
    await choose('[data-reference-filter="lineage"]','Blueluminescent');
    assert.match(await count(),/^6 \/ 108 images/);
    const blue=await read('[...document.querySelectorAll("[data-reference-entry]")].map(e=>({id:e.dataset.referenceEntry,name:e.innerText}))');assert.equal(blue.length,6);
    await click('[data-reference-entry="pack-v100-xeno-blueluminescent-egg"]');
    await until('document.querySelector("[data-reference-detail] img").naturalWidth>0','blue egg original');
    assert.match((await detail()).text,/PAS UN NOUVEAU SPRITE DE COMBAT/);assert.match((await detail()).text,/enemy-001-ovomorph/);
    check('blueSixStages',{entries:blue,egg:await detail()});await capture('02-blue-six');
    await choose('select[aria-label="Autre image de cette lignée"]','pack-v100-xeno-blueluminescent-queen',true);
    assert.equal((await detail()).id,'pack-v100-xeno-blueluminescent-queen');assert.match(await count(),/^108 \/ 108 images/);
    check('linkedViewAcrossFilters',await detail());
    await click('[data-reference-reset]');await choose('[data-reference-filter="biology"]','synthetic');
    assert.match(await count(),/^9 \/ 108 images/);
    const allSyntheticCount=await count();
    await choose('[data-reference-filter="sourceBatch"]','270926');
    assert.match(await count(),/^8 \/ 108 images/);await click('[data-reference-entry="pack-v100-wy-covenant-david"]');
    assert.match((await detail()).text,/Synthétiques/);assert.match((await detail()).text,/Weyland-Yutani/);
    check('syntheticsAndSeparateFaction',{allSyntheticCount,packCount:await count(),david:await detail()});
    await click('[data-reference-reset]');await click('[data-reference-altered]');
    const alteredCards=await read('[...document.querySelectorAll("[data-reference-entry] small")].map(e=>e.innerText)');assert.ok(alteredCards.every(t=>t.includes('Altered')));
    await fill('[data-reference-search]','Working Joe Classic');await click('[data-reference-entry="pack-v100-synth-workingjoe-classic"]');
    const parent=await read('document.querySelector("[data-reference-parent]").dataset.referenceParent');assert.equal(parent,'enemy-041-working-joe');
    await click('[data-reference-parent]');
    const parentText=await read('document.querySelector("#enemy-catalog-detail").innerText');assert.match(parentText,/Working Joe/i);
    check('alteredParentNavigation',{parent,parentText});
    await click('[data-reference-reset]');await choose('[data-reference-filter="lineage"]','Cocoon / Romulus');
    assert.match(await count(),/^3 \/ 108 images/);await click('[data-reference-entry="pack-v100-xeno-cocoon-front"]');
    await choose('select[aria-label="Autre image de cette lignée"]','pack-v100-xeno-cocoon-side',true);assert.equal((await detail()).id,'pack-v100-xeno-cocoon-side');
    check('cocoonViewsRetained',{frontAndSideSelected:true,side:await detail()});
    await fill('[data-reference-search]','Offspring Adult');await click('[data-reference-entry="pack-v100-xeno-offspring-adult"]');
    const offspring=await detail();assert.match(offspring.text,/ailé/);assert.match(offspring.text,/pas une|Ne pas déclarer|non démontrée/);check('explicitIdentityWarnings',offspring);
    await click('[data-reference-reset]');const pages=[await count()];
    for(const expected of [48,72,96,108]){await click('[data-reference-more]');assert.equal(await read('document.querySelectorAll("[data-reference-entry]").length'),expected);pages.push(await count());}
    assert.equal(await read('document.querySelector("[data-reference-more]").hidden'),true);check('pagination',pages);
    const sources=await read('[...document.querySelectorAll("[data-reference-entry] img")].map(i=>i.src)');assert.equal(new Set(sources).size,108);
    const decoded=[];
    for(let i=0;i<sources.length;i+=8){decoded.push(...await read(`Promise.all(${JSON.stringify(sources.slice(i,i+8))}.map(src=>new Promise(resolve=>{const image=new Image();image.onload=async()=>{try{await image.decode();resolve({src,width:image.naturalWidth,height:image.naturalHeight,decoded:true})}catch(e){resolve({src,error:String(e)})}};image.onerror=()=>resolve({src,error:'image-load-error'});image.src=src;})))`));}
    assert.equal(decoded.length,108);assert.ok(decoded.every(x=>x.decoded&&x.width&&x.height));check('allOriginalsBrowserDecoded',decoded);
    await click('[data-reference-reset]');
    assert.equal(await saved(),beforeSave,'Filters, navigation and pagination must preserve localStorage exactly');
    const filterStorageEvents=storageEvents.slice(storageStart);assert.deepEqual(filterStorageEvents,[],'No local/session storage rewrites during library use');check('noSaveWrites',{byteIdentical:true,storageEvents:filterStorageEvents.length});
    await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    await read(`document.querySelector(${q(root)}).scrollIntoView({block:'start',behavior:'instant'});window.scrollBy(0,-90)`);await wait(150);
    const mobile=await read(`({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,library:document.querySelector(${q(root)}).getBoundingClientRect().toJSON(),controls:[...document.querySelectorAll(${q(root+' input, '+root+' select, '+root+' button')})].filter(e=>e.getBoundingClientRect().width>0).map(e=>({tag:e.tagName,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right,width:e.getBoundingClientRect().width}))})`);
    assert.ok(mobile.scrollWidth<=mobile.viewport+1);assert.ok(mobile.controls.every(x=>x.left>=-1&&x.right<=mobile.viewport+1));check('mobileNoHorizontalOverflow',mobile);await capture('03-mobile-library');
    await choose('[data-reference-filter="lineage"]','Blueluminescent');assert.match(await count(),/^6 \/ 108 images/);
    await read('document.querySelector("[data-reference-count]").scrollIntoView({block:"start",behavior:"instant"});window.scrollBy(0,-90)');await capture('05-mobile-cards');
    await click('[data-reference-entry="pack-v100-xeno-blueluminescent-queen"]');await until('document.querySelector("[data-reference-detail] img").naturalWidth>0','mobile queen');
    await read('document.querySelector("[data-reference-detail]").scrollIntoView({block:"start",behavior:"instant"});window.scrollBy(0,-90)');await wait(100);await capture('04-mobile-detail');
    const mobileDetail=await read('({id:document.querySelector("[data-reference-detail]").dataset.referenceId,fit:getComputedStyle(document.querySelector("[data-reference-detail] img")).objectFit,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,link:document.querySelector("[data-reference-detail] a").href})');assert.equal(mobileDetail.fit,'contain');assert.ok(mobileDetail.scrollWidth<=mobileDetail.viewport+1);check('mobileSelectionAndWholeOriginal',mobileDetail);
    await click('[data-reference-reset]');assert.equal(await saved(),beforeSave);check('mobileSaveUnchanged',{byteIdentical:true});
  }
  assert.deepEqual(errors,[]);const realNetworkFailures=networkFailures.filter(x=>!x.canceled&&x.errorText!=='net::ERR_ABORTED');assert.deepEqual(realNetworkFailures,[]);report.ok=true;
} catch(error) { report.failure=error.stack;try{await capture('failure-'+phase);}catch{}throw error; }
finally { report.responses=responses;report.storageEvents=storageEvents;await writeFile(resolve(output,'browser-'+phase+'.json'),JSON.stringify(report,null,2));if(context)await cdp('Target.disposeBrowserContext',{browserContextId:context},true).catch(()=>{});ws.close(); }
