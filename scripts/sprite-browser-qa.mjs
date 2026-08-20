import { writeFile } from 'node:fs/promises';

const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9225';
const appUrl = process.env.APP_URL || 'http://127.0.0.1:4173/';
const target = await fetch(`${endpoint}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' }).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let sequence = 0;
const pending = new Map();
const runtimeErrors = [];
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails?.exception?.description || message.params.exceptionDetails?.text);
  if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') runtimeErrors.push(message.params.entry.text);
  if (!message.id || !pending.has(message.id)) return;
  const request = pending.get(message.id);
  pending.delete(message.id);
  message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
});

function command(method, params = {}) {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

await command('Page.enable');
await command('Runtime.enable');
await command('Log.enable');
await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await command('Page.navigate', { url: appUrl });
await new Promise((resolve) => setTimeout(resolve, 1400));

const expression = `(async () => {
  document.querySelector('[data-view="codex"]').click();
  await new Promise(resolve => setTimeout(resolve, 200));
  const images = [...document.querySelectorAll('#art-bible img')];
  for (const image of images) {
    image.loading = 'eager';
    image.scrollIntoView({ block: 'center' });
    if (!image.complete) await new Promise((resolve, reject) => { image.addEventListener('load', resolve, { once: true }); image.addEventListener('error', reject, { once: true }); });
    if (image.decode) await image.decode().catch(() => {});
  }
  scrollTo(0, 0);
  const newSheets = images.filter(image => /animation-sheet/.test(image.src));
  const pixelChecks = [];
  for (const image of newSheets) {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    const corners = [[0, 0], [canvas.width - 1, 0], [0, canvas.height - 1], [canvas.width - 1, canvas.height - 1]].map(([x, y]) => context.getImageData(x, y, 1, 1).data[3]);
    pixelChecks.push({ file: image.src.split('/').at(-1), width: image.naturalWidth, height: image.naturalHeight, cornerAlpha: corners });
  }
  return {
    title: document.title,
    bootRemoved: !document.querySelector('#boot'),
    appVisible: !document.querySelector('#app').hidden,
    activePanel: document.querySelector('.view.active')?.dataset.panel,
    auditCards: document.querySelectorAll('.postulate-audit article').length,
    auditText: document.querySelector('.postulate-audit')?.innerText,
    artCards: document.querySelectorAll('#art-bible article').length,
    images: images.map(image => ({ file: image.src.split('/').at(-1), complete: image.complete, width: image.naturalWidth, height: image.naturalHeight })),
    waveLabel: document.querySelector('#sprite-wave-count')?.textContent,
    styleLoaded: [...document.styleSheets].some(sheet => sheet.href?.endsWith('/sprite-gallery.css')),
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    pixelChecks
  };
})()`;

const evaluated = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
if (evaluated.exceptionDetails) throw new Error(evaluated.exceptionDetails.exception?.description || evaluated.exceptionDetails.text);
const report = { ...evaluated.result.value, runtimeErrors };

const screenshot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
await writeFile('.qa-sprite-gallery.png', Buffer.from(screenshot.data, 'base64'));

const failures = [];
if (!report.bootRemoved || !report.appVisible || report.activePanel !== 'codex') failures.push('application/codex not visible');
if (report.auditCards !== 4 || !report.auditText.includes('27/27')) failures.push('parity audit missing');
if (report.artCards !== 12 || report.images.length !== 12) failures.push('visual gallery incomplete');
if (!report.images.every((image) => image.complete && image.width > 0 && image.height > 0)) failures.push('image failed to load');
if (report.waveLabel !== '8 PLAQUES · 128 CELLULES') failures.push('wave count mismatch');
if (!report.styleLoaded || report.horizontalOverflow > 1) failures.push('layout/style failure');
if (!report.pixelChecks.every((image) => image.width === 1024 && image.height === 1024 && image.cornerAlpha.every((alpha) => alpha === 0))) failures.push('sprite dimensions/alpha failure');
if (runtimeErrors.length) failures.push('runtime errors');

socket.close();
console.log(JSON.stringify({ ok: failures.length === 0, failures, ...report }, null, 2));
if (failures.length) process.exitCode = 1;
