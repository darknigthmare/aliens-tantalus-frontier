import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createDefaultSave, SAVE_PREFIX } from '../src/save.js';

const base = new URL(process.env.APP_URL || 'http://127.0.0.1:4185/');
const output = resolve(process.env.QA_OUTPUT || 'docs/references/v85-release-qa/recruitment');
const layoutOnly = process.env.QA_LAYOUT_ONLY === '1';
await mkdir(output, { recursive: true });
const info = await fetch((process.env.CDP_ENDPOINT || 'http://127.0.0.1:9235') + '/json/version').then(response => response.json());
const socket = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }); });
let seq = 0, session, context, mobile = false;
const pending = new Map(), errors = [];
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (pending.has(message.id)) { const job = pending.get(message.id); pending.delete(message.id); clearTimeout(job.timeout); message.error ? job.reject(Error(message.error.message)) : job.resolve(message.result); }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args.map(arg => arg.value || arg.description).join(' '));
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) errors.push(`${message.params.response.status} ${message.params.response.url}`);
});
const cdp = (method, params = {}, browser = false) => new Promise((resolve, reject) => {
  const id = ++seq;
  const timeout = setTimeout(() => { pending.delete(id); reject(Error(`CDP timeout ${method}`)); }, 15000);
  pending.set(id, { resolve, reject, timeout });
  socket.send(JSON.stringify({ id, method, params, ...(session && !browser ? { sessionId: session } : {}) }));
});
async function evaluate(expression) {
  const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
const wait = ms => new Promise(ok => setTimeout(ok, ms));
async function until(expression, label, attempts = 150) {
  for (let attempt = 0; attempt < attempts; attempt += 1) { const value = await evaluate(expression); if (value) return value; await wait(100); }
  throw Error(`${label}: ${errors.join('\n')}`);
}
async function key(code, down = true, modifiers = 0) {
  const virtualKey = { Escape: 27, Tab: 9, Enter: 13, Home: 36, End: 35, ArrowDown: 40, ArrowUp: 38, Space: 32 }[code] || 0;
  await cdp('Input.dispatchKeyEvent', { type: down ? 'keyDown' : 'keyUp', code, key: code === 'Space' ? ' ' : code, windowsVirtualKeyCode: virtualKey, modifiers });
}
async function tap(code, modifiers = 0) { await key(code, true, modifiers); await wait(45); await key(code, false, modifiers); await wait(60); }
async function click(selector, { disabled = false } = {}) {
  await evaluate(`(() => {const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing element '+${JSON.stringify(selector)});e.scrollIntoView({behavior:'instant',block:'center',inline:'nearest'});})()`);
  // Focus restoration can initiate a CSS smooth scroll after a dialog closes.
  // Wait for stable geometry; never retry a business-action click.
  let previous = '', stable = 0;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await wait(50);
    const rect = await evaluate(`JSON.stringify(document.querySelector(${JSON.stringify(selector)})?.getBoundingClientRect().toJSON())`);
    stable = rect === previous ? stable + 1 : 0; previous = rect;
    if (stable >= 4) break;
  }
  assert.ok(stable >= 4, `Unstable click target ${selector}`);
  const point = await evaluate(`(() => { const e=document.querySelector(${JSON.stringify(selector)});const r=e.getBoundingClientRect();if(!r.width||!r.height)throw Error('Hidden element '+${JSON.stringify(selector)});if(e.disabled&&!${disabled})throw Error('Disabled element '+${JSON.stringify(selector)});const x=Math.max(1,Math.min(innerWidth-1,r.x+r.width/2)),y=Math.max(1,Math.min(innerHeight-1,r.y+r.height/2));const hit=document.elementFromPoint(x,y);if(hit!==e&&!e.contains(hit))throw Error('Obscured '+${JSON.stringify(selector)}+' by '+hit?.outerHTML.slice(0,160));return{x,y};})()`);
  if (mobile) { await cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] }); await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
  else { await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point }); await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', buttons: 1, clickCount: 1 }); await wait(40); await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', buttons: 0, clickCount: 1 }); }
  await wait(140);
}
async function selectOption(selector, value) {
  const index = await evaluate(`Array.from(document.querySelector(${JSON.stringify(selector)}).options).findIndex(option=>option.value===${JSON.stringify(value)})`);
  assert.ok(index >= 0, `option ${value}`);
  await click(selector); await tap('Home');
  for (let step = 0; step < index; step += 1) await tap('ArrowDown');
  await tap('Enter');
  await until(`document.querySelector(${JSON.stringify(selector)})?.value===${JSON.stringify(value)}`, 'native select value');
}
const data = '__ATF_V51__.saveSystem.data';
const storageKey = SAVE_PREFIX + '1';
const report = { ok: false, base: base.href, scope: 'One explicitly seeded legacy fixture before boot. Every recruitment, assignment, training, transfer and refused refresh is a real mouse/touch/keyboard action; application state reads are assertions only. Shared uniform/individual portrait debt remains.', checks: {}, screenshots: [], errors };
async function capture(name) {
  report.checks.layouts ||= {};
  report.checks.layouts[name] = await evaluate(`(()=>{const root=document.documentElement;return{innerWidth,clientWidth:root.clientWidth,scrollWidth:root.scrollWidth,scrollX,visualViewport:{width:visualViewport?.width,offsetLeft:visualViewport?.offsetLeft,offsetTop:visualViewport?.offsetTop},overflow:[...document.querySelectorAll('body *')].map(e=>({e,r:e.getBoundingClientRect()})).filter(({e,r})=>r.width>0&&r.height>0&&r.right>root.clientWidth+1&&getComputedStyle(e).position!=='fixed').slice(0,20).map(({e,r})=>({tag:e.tagName,id:e.id,class:e.className,left:r.left,right:r.right,width:r.width,text:e.textContent.trim().slice(0,50)}))}})()`);
  const shot = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 80, captureBeyondViewport: false }); await writeFile(resolve(output, `${name}.jpg`), Buffer.from(shot.data, 'base64')); report.screenshots.push(`${name}.jpg`);
}
async function boot() { await until('globalThis.__ATF_V61__ && globalThis.__ATF_V51__ && !document.querySelector("#boot")', 'boot', 450); await wait(250); }
async function enterCrew() {
  await click('#title-start'); await click('#title-continue');
  await until('__ATF_HUB__.running', 'legacy continues into hub');
  assert.equal(await evaluate(`${data}.onboardingV84`), null);
  assert.equal(await evaluate('document.querySelector("#player-creator-v84").open'), false);
  await click('#exit-hub'); await click('[data-view="crew"]');
  await until('document.querySelector("[data-v85-tab=active]")', 'Echo-9 navigation');
}
async function reload() {
  await evaluate('window.__qaOldDocumentV85=true'); await cdp('Page.reload', { ignoreCache: true });
  await until('typeof __qaOldDocumentV85==="undefined" && globalThis.__ATF_V61__ && !document.querySelector("#boot")', 'new document');
  await boot(); await enterCrew();
}
async function stored() { return evaluate(`localStorage.getItem(${JSON.stringify(storageKey)})`); }
async function state() { return evaluate(`({credits:${data}.galaxy.resources.credits,supplies:${data}.hub.systems.supplies,clock:${data}.clock,candidates:${data}.recruitmentV85.candidates,crew:${data}.crew,selected:${data}.strategy.selectedCrewIds,statistics:${data}.statistics})`); }
async function closeDossier() { await click('#crew-dossier-v85 [data-v85-close]'); await until('!document.querySelector("#crew-dossier-v85").open', 'dossier closes'); }

try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true));
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true);
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId, flatten: true }, true));
  for (const domain of ['Page', 'Runtime', 'Network']) await cdp(domain + '.enable');
  await cdp('Network.setBypassServiceWorker', { bypass: true });
  await cdp('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, mobile: false, deviceScaleFactor: 1 });
  await cdp('Emulation.setFocusEmulationEnabled', { enabled: true });
  const fixture = createDefaultSave(1);
  delete fixture.needsPlayerCreationV84; delete fixture.onboardingV84; delete fixture.recruitmentV85;
  fixture.player.name = 'QA Legacy Operator'; fixture.statistics.campaigns = 3;
  fixture.crew[0].missions = 17; fixture.crew[0].kills = 23;
  report.fixture = { purpose: 'Legacy migration and preserved campaign markers, never live user storage', profile: 1, day: fixture.clock.day, hour: fixture.clock.hour, credits: fixture.galaxy.resources.credits, campaigns: 3, missingFields: ['needsPlayerCreationV84', 'onboardingV84', 'recruitmentV85'] };
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `if(location.origin===${JSON.stringify(base.origin)}&&!sessionStorage.getItem('qa-v85-fixture-installed')){localStorage.setItem(${JSON.stringify(storageKey)},${JSON.stringify(JSON.stringify(fixture))});sessionStorage.setItem('qa-v85-fixture-installed','1');}` });
  await cdp('Page.navigate', { url: new URL('?qa=recruitment-v85', base).href }); await cdp('Page.bringToFront'); await boot();
  report.checks.server = await evaluate('({title:document.title,content:document.body.innerText.length,overlay:!!document.querySelector(".vite-error-overlay,[data-nextjs-dialog]")})');
  assert.ok(report.checks.server.content > 0); assert.equal(report.checks.server.overlay, false);
  await enterCrew(); await capture('01-active-legacy'); report.checks.legacyNoPrologue = true;
  await click('[data-v85-tab="candidates"]');
  const initial = await state(); assert.equal(initial.candidates.length, 4);
  assert.equal(await evaluate('document.querySelectorAll("[data-v85-member]").length'), 4);
  if (layoutOnly) {
    report.scope = 'Read-only responsive layout diagnosis after an explicitly seeded legacy fixture; no recruitment, training or transfer action performed.';
    await capture('layout-desktop');
    await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, mobile: true, deviceScaleFactor: 1 });
    await wait(300); await capture('layout-mobile');
    assert.deepEqual(errors, []); report.ok = true;
  } else {
  const first = initial.candidates[0], second = initial.candidates[1];
  await capture('02-four-candidates');
  await click(`[data-v85-open="${first.id}"]`);
  await until('document.querySelector("#crew-dossier-v85").open', 'candidate dossier');
  assert.ok(await evaluate(`document.querySelector('#crew-dossier-title-v85').textContent.includes(${JSON.stringify(first.name)})`));
  await selectOption('[data-v85-compare]', 'crew-01-mara-vega');
  const comparison = await evaluate('Array.from(document.querySelectorAll(".crew-aptitudes-v85 article")).map(e=>({stat:e.querySelector("strong").textContent,delta:e.querySelector(".crew-delta-v85")?.textContent}))');
  assert.equal(comparison.find(row => row.stat === 'Technique').delta, '(+24)');
  report.checks.comparison = comparison; await capture('03-causal-comparison');
  await click(`#crew-dossier-v85 [data-v85-action="recruit"][data-v85-id="${first.id}"]`);
  let current = await state(); assert.equal(current.credits, initial.credits - 600);
  assert.equal(current.crew.find(member => member.id === first.id).recruitV85.name, first.name);
  assert.equal(current.candidates.length, 3); await closeDossier();
  await click(`[data-v85-action="recruit"][data-v85-id="${second.id}"]`);
  current = await state(); assert.equal(current.credits, initial.credits - 1200);
  assert.equal(current.crew.find(member => member.id === second.id).recruitV85.name, second.name);
  assert.equal(current.candidates.length, 2);
  report.checks.recruited = [{ id: first.id, name: first.name }, { id: second.id, name: second.name }];
  const remaining = JSON.stringify(current.candidates);
  await reload(); await click('[data-v85-tab="candidates"]');
  current = await state(); assert.equal(JSON.stringify(current.candidates), remaining);
  assert.equal(current.crew.filter(member => [first.id, second.id].includes(member.id)).length, 2);
  report.checks.poolAndHiresSurviveReload = true;
  await click('[data-v85-tab="active"]'); await click('[data-v85-action="assign"][data-v85-id="crew-01-mara-vega"]');
  await click('[data-v85-tab="reserve"]');
  assert.ok(await evaluate(`document.querySelector('[data-v85-member="${first.id}"]')`));
  await click(`[data-v85-action="assign"][data-v85-id="${first.id}"]`);
  current = await state(); assert.ok(current.selected.includes(first.id)); assert.ok(!current.selected.includes('crew-01-mara-vega')); assert.equal(current.selected.length, 4);
  report.checks.reserveAssignment = true;
  await click('[data-v85-tab="active"]'); await click(`[data-v85-open="${first.id}"]`);
  const beforeTraining = await state();
  await click(`[data-v85-action="train"][data-v85-id="${first.id}"][data-v85-aptitude="technique"]`);
  current = await state();
  assert.equal(current.crew.find(member => member.id === first.id).trainingV85.technique, 2);
  assert.equal(current.credits, beforeTraining.credits - 80);
  assert.equal((current.clock.day - 1) * 24 + current.clock.hour - ((beforeTraining.clock.day - 1) * 24 + beforeTraining.clock.hour), 4);
  assert.equal(current.supplies, beforeTraining.supplies - 1);
  assert.equal(current.crew.find(member => member.id === first.id).recruitV85.aptitudes.technique, 74);
  report.checks.training = { gain: 2, hours: 4, credits: 80, supplies: 1 };
  await capture('04-trained-recruit');
  const item = first.gear[1];
  await selectOption('#crew-transfer-1-v85', second.id);
  await click(`[data-v85-action="transfer"][data-v85-item="${item.instanceId}"]`);
  current = await state();
  assert.equal(current.crew.find(member => member.id === first.id).gearV85.some(gear => gear.instanceId === item.instanceId), false);
  assert.equal(current.crew.find(member => member.id === second.id).gearV85.filter(gear => gear.instanceId === item.instanceId).length, 1);
  assert.equal(current.crew.flatMap(member => member.gearV85 || []).filter(gear => gear.instanceId === item.instanceId).length, 1);
  assert.equal(current.crew.find(member => member.id === first.id).recruitV85.gear.filter(gear => gear.instanceId === item.instanceId).length, 1, 'historical issue record is not a second current inventory');
  report.checks.transfer = { instanceId: item.instanceId, from: first.id, to: second.id };
  await closeDossier(); await click('[data-v85-tab="candidates"]');
  const beforeRefused = await stored();
  assert.equal(await evaluate('document.querySelector("[data-v85-action=refresh]").disabled'), true);
  await click('[data-v85-action="refresh"]', { disabled: true });
  assert.equal(await stored(), beforeRefused); assert.equal(JSON.stringify((await state()).candidates), remaining);
  report.checks.refreshBeforeDeadlineRefused = true;
  await reload(); await click('[data-v85-tab="reserve"]'); await click(`[data-v85-open="${second.id}"]`);
  assert.ok(await evaluate(`document.querySelector('#crew-dossier-v85').textContent.includes(${JSON.stringify(item.instanceId)})`));
  report.checks.transferSurvivesReload = true; await closeDossier();
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, mobile: true, deviceScaleFactor: 1 });
  await cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 }); mobile = true;
  await click('[data-v85-tab="candidates"]');
  const third = (await state()).candidates[0];
  await click(`[data-v85-open="${third.id}"]`);
  const mobileGeometry = await evaluate('(()=>{const d=document.querySelector("#crew-dossier-v85"),r=d.getBoundingClientRect(),b=d.querySelector(".crew-dossier-body-v85");return{width:innerWidth,height:innerHeight,inside:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,scrollable:b.scrollHeight>b.clientHeight,buttons:[...d.querySelectorAll("button,select")].filter(e=>!e.disabled).map(e=>({text:e.textContent.trim().slice(0,30),height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width}))}})()');
  assert.equal(mobileGeometry.inside, true); assert.equal(mobileGeometry.scrollable, true);
  assert.ok(mobileGeometry.buttons.every(button => button.height >= 44 && button.width >= 44));
  await capture('05-mobile-dossier-top');
  const focus = [];
  for (let count = 0; count < 8; count += 1) { await tap('Tab'); focus.push(await evaluate('({contained:document.querySelector("#crew-dossier-v85").contains(document.activeElement),active:document.activeElement?.outerHTML.slice(0,180),documentFocused:document.hasFocus()})')); }
  report.checks.mobile = { ...mobileGeometry, focusContained: focus.every(entry => entry.contained), focusSequence: focus };
  await cdp('Input.synthesizeScrollGesture', { x: 190, y: 520, yDistance: -650, speed: 1200, gestureSourceType: 'touch' });
  await wait(180);
  assert.ok(await evaluate('document.querySelector(".crew-dossier-body-v85").scrollTop>0'));
  await capture('06-mobile-dossier-scroll');
  report.checks.mobile.realTouchScroll = true;
  await tap('Escape'); assert.equal(await evaluate('document.querySelector("#crew-dossier-v85").open'), false);
  assert.equal(await evaluate(`document.activeElement?.dataset.v85Open===${JSON.stringify(third.id)}`), true);
  report.checks.escapeRestoresFocus = true;
  await click(`[data-v85-open="${third.id}"]`);
  const beforeQuotaBytes = await stored();
  const beforeQuotaState = await evaluate(`JSON.stringify(${data})`);
  await evaluate(`window.__qaStorageSetV85=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key===${JSON.stringify(storageKey)})throw Error('QA quota write refusal');return __qaStorageSetV85.call(this,key,value)}`);
  await click(`#crew-dossier-v85 [data-v85-action="recruit"][data-v85-id="${third.id}"]`);
  assert.equal(await evaluate('document.querySelector("#crew-dossier-v85").open'), true);
  assert.equal(await stored(), beforeQuotaBytes);
  assert.equal(await evaluate(`JSON.stringify(${data})`), beforeQuotaState);
  assert.ok(await evaluate('document.querySelector("#crew-dossier-v85 .crew-action-status-v85").textContent.includes("Sauvegarde")'));
  report.checks.quotaPreservesCampaignAndDialog = true; await capture('07-mobile-write-refusal');
  await evaluate('Storage.prototype.setItem=__qaStorageSetV85');
  await tap('Escape');
  const final = await state();
  assert.equal(final.statistics.campaigns, 3);
  assert.equal(final.crew.find(member => member.id === 'crew-01-mara-vega').missions, 17);
  assert.equal(final.crew.find(member => member.id === 'crew-01-mara-vega').kills, 23);
  assert.ok(focus.every(entry => entry.contained), 'keyboard focus remains in the modal dossier');
  assert.equal(mobileGeometry.width, 390, 'mobile layout viewport must not expand beyond the emulated device');
  for (const [name, layout] of Object.entries(report.checks.layouts)) assert.ok(layout.scrollWidth <= layout.clientWidth, `Horizontal overflow in ${name}: ${layout.scrollWidth} > ${layout.clientWidth}`);
  assert.deepEqual(errors, []); report.ok = true;
  }
} catch (error) {
  report.failure = error.stack;
  report.diagnostic = await evaluate('({active:document.activeElement?.outerHTML.slice(0,400),readyState:document.readyState,dialog:document.querySelector("#crew-dossier-v85")?.open,text:document.querySelector("#crew-dossier-v85")?.innerText.slice(-1500),body:document.body.innerText.slice(-1600),recentRequests:performance.getEntriesByType("resource").slice(-12).map(e=>({name:e.name,duration:e.duration}))})').catch(() => null);
  await capture('failure').catch(() => {}); throw error;
} finally {
  await evaluate('if(window.__qaStorageSetV85)Storage.prototype.setItem=__qaStorageSetV85').catch(() => {});
  await writeFile(resolve(output, layoutOnly ? 'layout-v85-browser.json' : 'recruitment-v85-browser.json'), JSON.stringify(report, null, 2));
  if (context) await cdp('Target.disposeBrowserContext', { browserContextId: context }, true).catch(() => {});
  socket.close(); console.log(JSON.stringify(report, null, 2));
}
