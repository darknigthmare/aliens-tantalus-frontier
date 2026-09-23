import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// No fixtures and no writes through exposed game APIs: only native mouse/key input.
// Snapshots and localStorage are read solely to verify the visible options transaction.
const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9237';
const base = process.env.APP_URL || 'http://127.0.0.1:4195';
const output = resolve(process.env.QA_OUTPUT || 'E:/CodexQA/AliensTantalus/v87-ships-halo-20260920/options');
await mkdir(output, { recursive: true });
const version = await fetch(endpoint + '/json/version').then(response => response.json());
const socket = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }); });
let sequence = 0, session, context;
const pending = new Map();
const report = { ok: false, url: base, fixture: 'none; empty isolated browser context', ships: [], names: [], sizes: [], errors: [], screenshots: [] };
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data), request = pending.get(message.id);
  if (request) { pending.delete(message.id); message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result); }
  if (message.sessionId !== session) return;
  if (message.method === 'Runtime.exceptionThrown') report.errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') report.errors.push(message.params.args.map(arg => arg.value || arg.description).join(' '));
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) report.errors.push(message.params.response.status + ' ' + message.params.response.url);
});
function cdp(method, params = {}, browser = false) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 20000);
    pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } });
    socket.send(JSON.stringify({ id, method, params, ...(!browser && session ? { sessionId: session } : {}) }));
  });
}
async function evaluate(expression) {
  const response = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
  return response.result.value;
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(expression, label, timeout = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeout) { if (await evaluate(expression)) return; await wait(60); }
  throw new Error('Timeout: ' + label);
}
async function key(code, modifiers = 0) {
  const values = { Home: ['Home', 36], ArrowDown: ['ArrowDown', 40], Enter: ['Enter', 13], Tab: ['Tab', 9], KeyA: ['a', 65], Escape: ['Escape', 27] };
  const [key, windowsVirtualKeyCode] = values[code];
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', code, key, windowsVirtualKeyCode, modifiers });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', code, key, windowsVirtualKeyCode, modifiers });
}
async function click(selector) {
  // Scrolling an existing control into view is a normal browser action, not a state fixture.
  await evaluate(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'})`);
  await wait(80);
  const point = await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e?.getBoundingClientRect();if(!r)return null;const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height,hit:hit===e||e.contains(hit),disabled:e.disabled};})()`);
  assert.ok(point?.w && point?.h && point.hit && !point.disabled, 'Control inaccessible: ' + selector + ' ' + JSON.stringify(point));
  await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, x: point.x, y: point.y });
  await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, x: point.x, y: point.y });
}
async function capture(name) {
  const image = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 84, captureBeyondViewport: false });
  await writeFile(resolve(output, name + '.jpg'), Buffer.from(image.data, 'base64'));
  report.screenshots.push(name + '.jpg');
}
const snapshot = () => evaluate('structuredClone(__ATF_V51__.saveSystem.data)');
const rawStorage = () => evaluate('JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])))');
function gameplay(save) {
  const clone = structuredClone(save);
  delete clone.presentation; delete clone.updatedAt; delete clone.migratedFrom;
  // SYSTÈME is an active app view: elapsed playtime advances independently of the option.
  // All other statistics and all campaign/resource/identity domains remain exact.
  if (clone.statistics) delete clone.statistics.playSeconds;
  return clone;
}
async function titleReady() {
  await until('Boolean(globalThis.__ATF_V61__ && !document.querySelector("#boot") && !document.querySelector("#title-screen").hidden)', 'title boot');
  await until('[...document.querySelectorAll("#title-scene-v79 img")].every(i=>i.complete&&i.naturalWidth>0)', 'title art loaded');
  await until('[...document.querySelectorAll("#title-scene-v79 [data-renderer=image]")].every(e=>e.dataset.assetStatus==="ready")', 'title load events processed');
}
async function reloadTitle() {
  // Prove a new document, independent of a CDP load event that may be missed by
  // the transport. A still-ready outgoing page cannot satisfy a new timeOrigin.
  const previousTimeOrigin = await evaluate('performance.timeOrigin');
  await cdp('Page.reload', { ignoreCache: true });
  await until(`performance.timeOrigin!==${JSON.stringify(previousTimeOrigin)} && Boolean(globalThis.__ATF_V61__)`, 'new reload document');
  await titleReady();
}
async function openOptions() {
  if (await evaluate('document.querySelector("#title-menu").hidden')) await click('#title-start');
  await click('#title-options');
  await until('document.querySelector("#title-screen").hidden && document.querySelector("#setting-title-ship-v87").getBoundingClientRect().height>0', 'options visible');
}
async function selectShip(shipId) {
  const index = await evaluate(`[...document.querySelector('#setting-title-ship-v87').options].findIndex(o=>o.value===${JSON.stringify(shipId)})`);
  assert.ok(index >= 1, 'Known visible ship option: ' + shipId);
  await click('#setting-title-ship-v87');
  await key('Home');
  for (let n = 0; n < index; n++) await key('ArrowDown');
  await key('Enter'); await key('Tab');
  await until(`__ATF_V51__.saveSystem.data.presentation.titleScene.shipId===${JSON.stringify(shipId)}`, 'ship option persisted');
}
async function renameShip(name) {
  await click('#setting-title-ship-name-v87');
  await key('KeyA', 2);
  await cdp('Input.insertText', { text: name });
  await key('Tab');
}
async function inspectOptionsLayout() {
  const layout = await evaluate(`(()=>{const grid=document.querySelector('.settings-grid');const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,right:r.right,w:r.width};};return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,grid:rect(grid),columns:getComputedStyle(grid).gridTemplateColumns,overflowX:getComputedStyle(grid).overflowX,panels:[...grid.children].map(e=>({label:e.querySelector('h3')?.textContent,box:rect(e),overflowX:getComputedStyle(e).overflowX,controls:[...e.querySelectorAll('input,select,button')].filter(c=>!c.hidden&&getComputedStyle(c).display!=='none'&&c.type!=='file').map(c=>({id:c.id,box:rect(c)}))}))};})()`);
  assert.ok(layout.scrollWidth <= layout.width, 'Options horizontal overflow: ' + JSON.stringify(layout));
  assert.ok(!['hidden','clip'].includes(layout.overflowX), 'Grid overflow must be solved, not hidden');
  for (const panel of layout.panels) {
    assert.ok(!['hidden','clip'].includes(panel.overflowX), 'Panel must not clip its controls');
    assert.ok(panel.box.x >= -.5 && panel.box.right <= layout.width + .5, 'Panel is inside viewport: ' + panel.label);
    for (const control of panel.controls) {
      assert.ok(control.box.w > 0 && control.box.x >= panel.box.x -.5 && control.box.right <= panel.box.right + .5,
        'Native control stays inside its panel: ' + control.id);
    }
  }
  return layout;
}
async function inspectTitle(shipId, shipName = null) {
  await titleReady();
  const result = await evaluate(`(()=>{const ships=[...document.querySelectorAll('#title-scene-v79 [data-role="orbitals"]')];const e=ships[0],i=e?.querySelector('img'),m=e?.querySelector('.title-ship-marking-v87');const box=n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};};return {snapshot:__ATF_V61__.snapshot(),count:ships.length,src:i?.getAttribute('src'),image:i?box(i):null,natural:i?{w:i.naturalWidth,h:i.naturalHeight}:null,mark:m?{text:m.textContent,box:box(m),visibility:getComputedStyle(m).visibility}:null,ship:e?box(e):null,overflow:document.documentElement.scrollWidth>innerWidth};})()`);
  assert.equal(result.count, 1);
  assert.equal(result.snapshot.scene.shipId, shipId);
  assert.equal(result.snapshot.scene.missingAssetCount, 0);
  assert.equal(result.snapshot.scene.fallbackVisible, false);
  assert.ok(result.src.endsWith('/' + shipId + '-reference-v87.png'));
  assert.ok(Math.abs(result.image.w / result.image.h - result.natural.w / result.natural.h) < .001);
  assert.equal(result.overflow, false);
  if (shipName) {
    assert.equal(result.mark?.text, shipName);
    assert.equal(result.mark.visibility, 'visible');
    assert.ok(result.mark.box.w > 0 && result.mark.box.h > 0);
    for (const axis of ['x', 'y']) assert.ok(result.mark.box[axis] >= result.ship[axis]);
    assert.ok(result.mark.box.x + result.mark.box.w <= result.ship.x + result.ship.w + .1);
    assert.ok(result.mark.box.y + result.mark.box.h <= result.ship.y + result.ship.h + .1);
  } else assert.equal(result.mark, null);
  return result;
}
try {
  context = (await cdp('Target.createBrowserContext', {}, true)).browserContextId;
  const target = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true);
  session = (await cdp('Target.attachToTarget', { targetId: target.targetId, flatten: true }, true)).sessionId;
  for (const domain of ['Page', 'Runtime', 'Network']) await cdp(domain + '.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: base + '/?qa-title-options-v87=1' });
  await titleReady();
  const initial = await snapshot();
  await capture('00-title-before');
  await openOptions();
  report.desktopOptions = await inspectOptionsLayout();
  const options = await evaluate('[...document.querySelector("#setting-title-ship-v87").options].map(o=>({id:o.value,label:o.textContent})).filter(o=>o.id)');
  assert.deepEqual(options.map(o => o.id), ['uss-sulaco','uscss-nostromo','narcissus','ud4l-cheyenne','usm-auriga','prometheus']);
  for (const option of options) {
    await selectShip(option.id);
    assert.equal(await evaluate('document.querySelector("#setting-title-ship-name-v87").disabled'), option.id !== 'uss-sulaco');
    await click('#quick-save');
    assert.deepEqual(gameplay(await snapshot()), gameplay(initial), 'Visual ship must not change gameplay: ' + option.id);
    await click('#setting-title-preview-v87');
    const beforeReload = await inspectTitle(option.id, option.id === 'uss-sulaco' ? 'TANTALUS' : null);
    await capture('ship-' + option.id);
    await reloadTitle();
    const afterReload = await inspectTitle(option.id, option.id === 'uss-sulaco' ? 'TANTALUS' : null);
    assert.equal((await snapshot()).presentation.titleScene.shipId, option.id);
    assert.deepEqual(gameplay(await snapshot()), gameplay(initial), 'Reload must not change gameplay: ' + option.id);
    report.ships.push({ option, beforeReload, afterReload });
    await openOptions();
  }
  await selectShip('uss-sulaco');
  for (const name of ['SULACO', 'TANTALUS']) {
    await renameShip(name);
    await until(`__ATF_V51__.saveSystem.data.presentation.titleScene.shipName===${JSON.stringify(name)}`, 'name persisted');
    await click('#quick-save');
    await click('#setting-title-preview-v87');
    const beforeReload = await inspectTitle('uss-sulaco', name);
    await capture('name-' + name.toLowerCase());
    await reloadTitle();
    const afterReload = await inspectTitle('uss-sulaco', name);
    report.names.push({ name, beforeReload, afterReload });
    await openOptions();
  }
  const beforeInvalid = await snapshot(), storageBeforeInvalid = await rawStorage();
  await renameShip('<img src=x onerror=1>');
  await until('document.querySelector("#toast-region").textContent.includes("Nom de coque invalide")', 'HTML name rejected');
  assert.deepEqual(await snapshot(), beforeInvalid, 'Invalid name must not mutate the active profile');
  assert.equal(await rawStorage(), storageBeforeInvalid, 'Invalid name must not write any local profile');
  assert.equal(await evaluate('document.querySelectorAll("img[src=x], svg[onload], [onerror]").length'), 0);
  assert.equal(await evaluate('document.querySelector("#setting-title-ship-name-v87").value'), 'TANTALUS');
  report.invalidName = { rejected: true, profileAndStorageUnchanged: true, noInjection: true };
  await capture('invalid-name-rejected');
  for (const size of [{width:390,height:844},{width:844,height:390}]) {
    await cdp('Emulation.setDeviceMetricsOverride', { ...size, deviceScaleFactor: 1, mobile: false });
    await selectShip('uscss-nostromo');
    await selectShip('uss-sulaco');
    await renameShip(size.width === 390 ? 'SULACO' : 'TANTALUS');
    const chosenName = size.width === 390 ? 'SULACO' : 'TANTALUS';
    await until(`__ATF_V51__.saveSystem.data.presentation.titleScene.shipName===${JSON.stringify(chosenName)}`, 'mobile name persisted');
    await capture('options-' + size.width);
    const optionsLayout = await inspectOptionsLayout();
    await click('#setting-title-preview-v87');
    const title = await inspectTitle('uss-sulaco', chosenName);
    await capture('title-' + size.width);
    await reloadTitle();
    const reloaded = await inspectTitle('uss-sulaco', chosenName);
    await openOptions();
    report.sizes.push({ size, optionsLayout, title, reloaded, accessible: true });
  }
  assert.deepEqual(gameplay(await snapshot()), gameplay(initial));
  assert.deepEqual(report.errors, []);
  report.ok = true;
} catch (error) {
  report.failure = error.stack || String(error);
  await capture('failure').catch(() => {});
  process.exitCode = 1;
} finally {
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
  if (context) await cdp('Target.disposeBrowserContext', { browserContextId: context }, true).catch(() => {});
  socket.close();
  console.log(JSON.stringify({ ok: report.ok, ships: report.ships.length, names: report.names.length, sizes: report.sizes.length, errors: report.errors.length, failure: report.failure || null, output }));
}
