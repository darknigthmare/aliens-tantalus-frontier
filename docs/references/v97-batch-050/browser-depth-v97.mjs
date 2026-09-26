import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
// Read-only app verification in a fresh CDP browser context. Node 22+ required.
// PowerShell example:
// $env:APP_URL='http://127.0.0.1:4307'; $env:QA_OUTPUT='E:/CodexQA/AliensTantalus/v97-depth-built'
// node docs/references/v97-batch-050/browser-depth-v97.mjs
const appUrl = (process.env.APP_URL || 'http://127.0.0.1:4306').replace(/\/+$/, '');
const pageUrl = new URL('depth-lab-v97.html', appUrl + '/').href;
const cdpUrl = (process.env.CDP_URL || 'http://127.0.0.1:9266').replace(/\/+$/, '');
const out = process.env.QA_OUTPUT || 'E:/CodexQA/AliensTantalus/v97-depth-lab';
await mkdir(out, { recursive: true });
const info = await fetch(cdpUrl + '/json/version').then(r => r.json());
const ws = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok, fail) => { ws.addEventListener('open', ok, { once: true }); ws.addEventListener('error', fail, { once: true }); });
let seq = 0, session, context; const pending = new Map(), errors = [], network = [];
const report = { ok: false, baseUrl: appUrl, pageUrl, cdpUrl, outputDirectory: out, browser: info.Browser, checks: {}, errors };
ws.addEventListener('message', e => { const m = JSON.parse(e.data), p = pending.get(m.id); if (p) { pending.delete(m.id); clearTimeout(p.timer); m.error ? p.fail(Error(m.error.message)) : p.ok(m.result); }
  if (m.sessionId !== session) return;
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value || a.description).join(' '));
  if (m.method === 'Network.responseReceived') { network.push({ url: m.params.response.url, status: m.params.response.status }); if (m.params.response.status >= 400) errors.push(m.params.response.status + ' ' + m.params.response.url); }
});
function cdp(method, params = {}, browser = false) { return new Promise((ok, fail) => { const id = ++seq, timer = setTimeout(() => { pending.delete(id); fail(Error('Timeout ' + method)); }, 15000); pending.set(id, { ok, fail, timer }); ws.send(JSON.stringify({ id, method, params, ...(!browser && session ? { sessionId: session } : {}) })); }); }
async function read(expression) { const r = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; }
const wait = ms => new Promise(ok => setTimeout(ok, ms));
async function until(expression) { const deadline = Date.now() + 30000; while (Date.now() < deadline) { const r = await read(expression); if (r) return r; await wait(100); } throw Error('Timeout condition ' + expression); }
async function shot(name) { const r = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); await writeFile(out + '/' + name + '.png', Buffer.from(r.data, 'base64')); }
async function click(selector) { await read(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`); const p = await read(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`); await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', ...p, button: 'left', buttons: 1, clickCount: 1 }); await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', ...p, button: 'left', buttons: 0, clickCount: 1 }); await wait(70); }
async function key(code, down = true) { const keys = { Home: ['Home', 36], End: ['End', 35], ArrowDown: ['ArrowDown', 40], Enter: ['Enter', 13], Tab: ['Tab', 9], Space: [' ', 32] }; const [key, n] = keys[code] || [code.slice(3).toLowerCase(), code.slice(3).charCodeAt(0)]; await cdp('Input.dispatchKeyEvent', { type: down ? 'keyDown' : 'keyUp', key, code, windowsVirtualKeyCode: n }); }
async function press(code) { await key(code); await key(code, false); }
async function select(selector, value) { const index = await read(`[...document.querySelector(${JSON.stringify(selector)}).options].findIndex(o=>o.value===${JSON.stringify(value)})`); assert.ok(index >= 0); await click(selector); await press('Home'); for (let n = 0; n < index; n++) await press('ArrowDown'); await press('Enter'); await press('Tab'); await wait(100); assert.equal(await read(`document.querySelector(${JSON.stringify(selector)}).value`), value); }
const S = '__ATF_DEPTH_LAB_V97__.snapshot()';
try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true)); const { targetId } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true);
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId, flatten: true }, true));
  for (const d of ['Page', 'Runtime', 'Network']) await cdp(d + '.enable');
  await cdp('Network.setBypassServiceWorker', { bypass: true });
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `window.__qaStorage=[];for(const k of ['getItem','setItem','removeItem','clear']){const old=Storage.prototype[k];Storage.prototype[k]=function(...a){__qaStorage.push(k);return old.apply(this,a)}}` });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1080, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: pageUrl }); await cdp('Page.bringToFront');
  await until(`window.__ATF_DEPTH_LAB_V97__&&${S}.loaded===${S}.expected`); await wait(200);
  const loaded = await read(S); assert.equal(loaded.loaded, 11); report.checks.loaded = loaded; await shot('01-command-compare');
  await click('[data-mode="2.5d"]'); await click('#depth-stage'); const before = await read(S); await key('KeyD'); await wait(350); await key('KeyD', false); const after = await read(S); assert.ok(after.x > before.x + 50); report.checks.keyboard = { before: before.x, after: after.x };
  await click('#depth-range'); await press('Home'); await wait(80); const near = await read(S); await press('End'); await wait(80); const far = await read(S); assert.equal(near.depth, 0); assert.equal(far.depth, 1); assert.ok(near.projection25d.scale > far.projection25d.scale); assert.equal(near.projection2d.scale, far.projection2d.scale); report.checks.projection = { near, far };
  await click('#demo-button'); await wait(150); await click('#pause-button'); const paused = await read(S); await wait(200); assert.deepEqual(await read(S), paused); report.checks.pause = true; await click('#pause-button');
  for (const zone of ['tantalus-cargo', 'cargo-brutal', 'hive-world']) { await select('#zone-select', zone); await click('[data-mode="compare"]'); await shot('zone-' + zone); assert.equal((await read(S)).zoneId, zone); }
  await select('#actor-select', 'siege-royal'); await click('#pause-button'); await shot('02-hive-siege-compare');
  await click('#reset-button'); assert.equal((await read(S)).demo, false); assert.equal((await read(S)).paused, false);
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true }); await wait(150);
  await read('window.scrollTo(0,0)'); await shot('03-mobile-compare');
  const layout = await read(`({w:innerWidth,scroll:document.documentElement.scrollWidth,controls:[...document.querySelectorAll('[data-move]')].map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))})`);
  assert.ok(layout.scroll <= layout.w + 1); assert.ok(layout.controls.every(b => b.w >= 44 && b.h >= 44)); report.checks.mobile = layout;
  await read(`document.querySelector('[data-move="right"]').scrollIntoView({block:'center',behavior:'instant'})`);
  const p = await read(`(()=>{const r=document.querySelector('[data-move="right"]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`), start = await read(S);
  await cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1, radiusX: 6, radiusY: 6, force: 1 }] }); await wait(350);
  await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); const touched = await read(S); assert.ok(touched.x > start.x + 50); await wait(150); assert.equal((await read(S)).x, touched.x); report.checks.touch = { from: start.x, to: touched.x, released: true }; await shot('04-mobile-controls');
  report.checks.storageCalls = await read('__qaStorage'); assert.deepEqual(report.checks.storageCalls, []);
  assert.ok(network.every(r => !/\/src\/(?:save|game|app)\b/.test(r.url))); report.checks.campaignModules = false;
  assert.deepEqual(errors, []); report.ok = true;
} catch (error) { report.failure = error.stack; await shot('failure').catch(() => {}); throw error; }
finally { report.network = network; await writeFile(out + '/report.json', JSON.stringify(report, null, 2)); if (context) await cdp('Target.disposeBrowserContext', { browserContextId: context }, true).catch(() => {}); ws.close(); }
console.log(JSON.stringify({ ok: report.ok, checks: Object.keys(report.checks), output: out }));
