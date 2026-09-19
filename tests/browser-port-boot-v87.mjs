import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = process.env.APP_URL || 'http://127.0.0.1:4189';
const output = 'I:/CodexQA/AliensTantalus/v87-port-20260919';
await mkdir(output, { recursive: true });
const info = await fetch('http://127.0.0.1:9236/json/version').then(r => r.json());
const socket = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }); });
const pending = new Map(), errors = []; let seq = 0, session, context;
socket.addEventListener('message', e => { const m = JSON.parse(e.data), job = pending.get(m.id);
  if (job) { pending.delete(m.id); m.error ? job.reject(Error(m.error.message)) : job.resolve(m.result); }
  if (m.sessionId === session && m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
});
const cdp = (method, params = {}, browser = false) => new Promise((resolve, reject) => {
  const id = ++seq; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params, ...(!browser && session ? { sessionId: session } : {}) }));
});
const wait = ms => new Promise(r => setTimeout(r, ms));
async function read(expression) { const r = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; }
try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true));
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true);
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId, flatten: true }, true));
  await cdp('Runtime.enable'); await cdp('Page.enable'); await cdp('Network.enable'); await cdp('Network.setBypassServiceWorker', { bypass: true });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, mobile: false, deviceScaleFactor: 1 });
  await cdp('Page.navigate', { url: base });
  for (let i = 0; i < 120; i++) { if (await read('!!globalThis.__ATF_HUB__ && !document.querySelector("#boot")')) break; await wait(100); }
  const result = await read('({title:document.title, text:document.body.innerText.slice(0,1200),buttons:document.querySelectorAll("button").length, hub:!!globalThis.__ATF_HUB__})');
  const screenshot = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
  await writeFile(output + '/boot.jpg', Buffer.from(screenshot.data, 'base64'));
  console.log(JSON.stringify({ result, errors }, null, 2));
  assert.equal(result.hub, true); assert.ok(result.buttons > 0); assert.deepEqual(errors, []);
} finally { if (context) await cdp('Target.disposeBrowserContext', { browserContextId: context }, true); socket.close(); }
