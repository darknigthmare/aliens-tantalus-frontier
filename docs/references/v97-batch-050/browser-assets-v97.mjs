import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ENEMY_DEDICATED_BATCH_V97 as poses } from '../../../src/enemy-dedicated-batch-v97.js';

// Read-only browser composition for visual QA. Source PNG pixels are never edited.
const base = process.env.APP_URL || 'http://127.0.0.1:4306';
const output = resolve(process.env.QA_OUTPUT || 'E:/CodexQA/AliensTantalus/v97-assets-20260927');
await mkdir(output, { recursive: true });
const info = await fetch('http://127.0.0.1:9266/json/version').then(r => r.json());
const ws = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok, fail) => { ws.addEventListener('open', ok, { once: true }); ws.addEventListener('error', fail, { once: true }); });
let sequence = 0, session, context;
const pending = new Map(), errors = [], assets = [];
ws.addEventListener('message', event => {
  const m = JSON.parse(event.data), request = pending.get(m.id);
  if (request) { pending.delete(m.id); clearTimeout(request.timer); m.error ? request.fail(Error(m.error.message)) : request.ok(m.result); }
  if (m.sessionId === session && m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text);
});
function cdp(method, params = {}, browser = false) { return new Promise((ok, fail) => {
  const id = ++sequence, timer = setTimeout(() => { pending.delete(id); fail(Error('Timeout ' + method)); }, 30000);
  pending.set(id, { ok, fail, timer }); ws.send(JSON.stringify({ id, method, params, ...(!browser && session ? { sessionId: session } : {}) }));
}); }
async function read(expression) {
  const r = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}
let ok = false;
try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true));
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true);
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId, flatten: true }, true));
  for (const domain of ['Page', 'Runtime', 'Network']) await cdp(domain + '.enable');
  await cdp('Network.setBypassServiceWorker', { bypass: true });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1320, deviceScaleFactor: 1, mobile: false });
  for (const pose of poses) {
    const response = await fetch(base + pose.path);
    assert.equal(response.status, 200, pose.path);
    assert.match(response.headers.get('content-type'), /^image\/png/);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(createHash('sha256').update(bytes).digest('hex'), pose.sha256);
    assets.push({ path: pose.path, status: 200, sha256: pose.sha256 });
  }
  const { frameTree: { frame: { id: frameId } } } = await cdp('Page.getFrameTree');
  for (let start = 0; start < poses.length; start += 16) {
    const group = poses.slice(start, start + 16);
    const html = `<!doctype html><html><meta charset="utf-8"><style>body{margin:0;background:#0e1619;color:#fff;font:13px system-ui}main{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:10px}figure{margin:0;height:310px;background:repeating-conic-gradient(#667077 0% 25%,#aab0b4 0% 50%) 50%/24px 24px;border:1px solid #678;display:flex;flex-direction:column}img{width:100%;height:275px;object-fit:contain}figcaption{background:#10191e;flex:1;padding:6px}</style><main>${group.map(p => `<figure><img src="${base + p.path}"><figcaption>${p.name} · ${p.profileId.split('-')[1]} · pose fixe</figcaption></figure>`).join('')}</main></html>`;
    await cdp('Page.setDocumentContent', { frameId, html });
    const rendered = await read(`Promise.all([...document.images].map(i=>i.decode().then(()=>({src:i.src,w:i.naturalWidth,h:i.naturalHeight}))))`);
    assert.equal(rendered.length, group.length);
    rendered.forEach((image, i) => assert.deepEqual([image.w, image.h], [group[i].sourceWidth, group[i].sourceHeight]));
    const shot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(resolve(output, `native-contact-${1 + start / 16}.png`), Buffer.from(shot.data, 'base64'));
  }
  assert.deepEqual(errors, []); ok = true;
  console.log(JSON.stringify({ ok, assets: assets.length, contactSheets: Math.ceil(poses.length / 16) }));
} finally {
  await writeFile(resolve(output, 'native-http-and-browser.json'), JSON.stringify({ ok, base, assets, errors }, null, 2));
  if (context) await cdp('Target.disposeBrowserContext', { browserContextId: context }, true).catch(() => {});
  ws.close();
}
