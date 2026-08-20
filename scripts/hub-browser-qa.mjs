import { writeFile } from 'node:fs/promises';

const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9225';
const appUrl = process.env.APP_URL || 'http://127.0.0.1:4173/';
const target = await fetch(`${endpoint}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' }).then(async (response) => {
  if (!response.ok) throw new Error(`Cannot create Chrome target: ${response.status}`);
  return response.json();
});
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let sequence = 0;
const pending = new Map();
const exceptions = [];
const consoleErrors = [];
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const request = pending.get(message.id);
    pending.delete(message.id);
    message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') consoleErrors.push(message.params.args.map((arg) => arg.value || arg.description).join(' '));
});

function command(method, params = {}) {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function key(code, keyValue = code) {
  await command('Input.dispatchKeyEvent', { type: 'keyDown', code, key: keyValue });
  await wait(60);
  await command('Input.dispatchKeyEvent', { type: 'keyUp', code, key: keyValue });
}

async function hold(code, keyValue, milliseconds) {
  await command('Input.dispatchKeyEvent', { type: 'keyDown', code, key: keyValue });
  await wait(milliseconds);
  await command('Input.dispatchKeyEvent', { type: 'keyUp', code, key: keyValue });
  await wait(120);
}

await command('Page.enable');
await command('Runtime.enable');
await command('Network.enable');
await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 980, deviceScaleFactor: 1, mobile: false });
await command('Storage.clearDataForOrigin', { origin: new URL(appUrl).origin, storageTypes: 'all' });
await command('Page.navigate', { url: appUrl });
await wait(2300);
await evaluate(`new Promise((resolve, reject) => {
  const started = performance.now();
  const check = () => {
    if (globalThis.__ATF_HUB__?.getSnapshot().running && !document.querySelector('#boot')) return resolve(true);
    if (performance.now() - started > 6000) return reject(new Error('hub boot timeout'));
    requestAnimationFrame(check);
  };
  check();
})`);

const desktop = await evaluate(`(() => {
  const hub = globalThis.__ATF_HUB__;
  const canvas = document.querySelector('#hub-canvas');
  const context = canvas.getContext('2d');
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const colors = new Set();
  for (let offset = 0; offset < pixels.length; offset += 4096) colors.add(pixels[offset] + ':' + pixels[offset + 1] + ':' + pixels[offset + 2]);
  return {
    title: document.title,
    appVisible: !document.querySelector('#app').hidden,
    hubActive: document.querySelector('[data-panel="hub"]').classList.contains('active'),
    oldRoomButtons: document.querySelectorAll('.room-button').length,
    canvas: { width: canvas.width, height: canvas.height, cssWidth: Math.round(canvas.getBoundingClientRect().width), sampledColors: colors.size },
    snapshot: hub.getSnapshot(),
    backgrounds: hub.backgrounds.map((image) => ({ width: image.naturalWidth, height: image.naturalHeight })),
    crewSheet: { width: hub.crewSheet.naturalWidth, height: hub.crewSheet.naturalHeight },
    propsSheet: { width: hub.propsSheet.naturalWidth, height: hub.propsSheet.naturalHeight },
    overlay: Boolean(document.querySelector('[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay')),
    textLength: document.body.innerText.trim().length
  };
})()`);
if (!desktop.appVisible || !desktop.hubActive || desktop.oldRoomButtons || desktop.canvas.width !== 1280 || desktop.canvas.sampledColors < 25 || desktop.snapshot.npcCount !== 4 || desktop.backgrounds.some((image) => !image.width) || desktop.overlay || desktop.textLength < 500) throw new Error(`Desktop shell failed: ${JSON.stringify(desktop)}`);

await evaluate(`Object.assign(globalThis.__ATF_HUB__.player, { x: 180, y: 520, vx: 0, vy: 0 })`);
const beforeMove = await evaluate(`globalThis.__ATF_HUB__.getSnapshot()`);
await hold('KeyD', 'd', 1000);
const afterMove = await evaluate(`globalThis.__ATF_HUB__.getSnapshot()`);
if (afterMove.x < beforeMove.x + 180) throw new Error(`Physical movement failed: ${JSON.stringify({ beforeMove, afterMove })}`);
const groundedY = afterMove.y;
await command('Input.dispatchKeyEvent', { type: 'keyDown', code: 'KeyD', key: 'd' });
await command('Input.dispatchKeyEvent', { type: 'keyDown', code: 'Space', key: ' ' });
await wait(60);
const afterJump = await evaluate(`globalThis.__ATF_HUB__.getSnapshot()`);
if (afterJump.y >= groundedY - 15) throw new Error(`Jump failed: ${JSON.stringify({ groundedY, afterJump })}`);
await wait(850);
await command('Input.dispatchKeyEvent', { type: 'keyUp', code: 'KeyD', key: 'd' });
await command('Input.dispatchKeyEvent', { type: 'keyUp', code: 'Space', key: ' ' });
await wait(120);
let afterObstacle = await evaluate(`globalThis.__ATF_HUB__.getSnapshot()`);
if (afterObstacle.x < 625) {
  await command('Input.dispatchKeyEvent', { type: 'keyDown', code: 'KeyD', key: 'd' });
  await command('Input.dispatchKeyEvent', { type: 'keyDown', code: 'Space', key: ' ' });
  await wait(900);
  await command('Input.dispatchKeyEvent', { type: 'keyUp', code: 'KeyD', key: 'd' });
  await command('Input.dispatchKeyEvent', { type: 'keyUp', code: 'Space', key: ' ' });
  await wait(120);
  afterObstacle = await evaluate(`globalThis.__ATF_HUB__.getSnapshot()`);
}
if (afterObstacle.x < 625) throw new Error(`Obstacle traversal failed: ${JSON.stringify(afterObstacle)}`);
await wait(450);

await evaluate(`Object.assign(globalThis.__ATF_HUB__.player, { x: 1245, y: 520, vx: 0, vy: 0 })`);
await key('KeyS', 's');
await wait(180);
const afterLift = await evaluate(`globalThis.__ATF_HUB__.getSnapshot()`);
if (afterLift.deck !== 1 || afterLift.visited !== afterObstacle.visited + 1) throw new Error(`Lift traversal failed: ${JSON.stringify({ afterObstacle, afterLift })}`);

await evaluate(`Object.assign(globalThis.__ATF_HUB__.player, { x: 1050, y: 520, vx: 0, vy: 0 })`);
await key('KeyE', 'e');
await wait(180);
const service = await evaluate(`(() => {
  const save = JSON.parse(localStorage.getItem('atf-v47-profile-1'));
  return { hour: save.clock.hour, morale: save.hub.systems.morale, restStamp: save.hub.services['service:rest'], active: document.querySelector('[data-panel="hub"]').classList.contains('active') };
})()`);
if (!service.active || service.hour <= 6 || service.restStamp === undefined) throw new Error(`Diegetic service failed: ${JSON.stringify(service)}`);

await evaluate(`(() => { globalThis.__ATF_HUB__.state.services = { 'service:rest': 0 }; globalThis.__ATF_HUB__.persist(); })()`);
const serviceAfterPersist = await evaluate(`(() => { const save = JSON.parse(localStorage.getItem('atf-v47-profile-1')); return { hour: save.clock.hour, restStamp: save.hub.services['service:rest'] }; })()`);
if (serviceAfterPersist.restStamp !== 1 || serviceAfterPersist.hour !== 7.5) throw new Error(`Physical persistence overwrote service state: ${JSON.stringify(serviceAfterPersist)}`);

await evaluate(`Object.assign(globalThis.__ATF_HUB__.player, { x: 1245, y: 520, vx: 0, vy: 0 })`);
await key('KeyW', 'w');
await evaluate(`Object.assign(globalThis.__ATF_HUB__.player, { x: 410, y: 520, vx: 0, vy: 0 })`);
await key('KeyE', 'e');
await wait(180);
const routeOpened = await evaluate(`document.querySelector('[data-panel="galaxy"]').classList.contains('active')`);
if (!routeOpened) throw new Error('Bridge terminal did not open the galaxy surface.');
await evaluate(`document.querySelector('[data-view="hub"]').click()`);
await wait(450);

const desktopShot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
await writeFile('.qa-hub-desktop.png', Buffer.from(desktopShot.data, 'base64'));

await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true, screenWidth: 390, screenHeight: 844 });
await command('Page.reload', { ignoreCache: true });
await wait(2300);
const mobile = await evaluate(`(() => {
  const canvas = document.querySelector('#hub-canvas');
  const controls = document.querySelector('.hub-touch-controls');
  return {
    width: innerWidth,
    hubActive: document.querySelector('[data-panel="hub"]').classList.contains('active'),
    canvasWidth: Math.round(canvas.getBoundingClientRect().width),
    controlsDisplay: getComputedStyle(controls).display,
    controlCount: controls.querySelectorAll('button').length,
    running: globalThis.__ATF_HUB__.getSnapshot().running,
    room: document.querySelector('#hub-room-label').textContent
  };
})()`);
if (mobile.width !== 390 || !mobile.hubActive || mobile.canvasWidth > 390 || mobile.canvasWidth < 300 || mobile.controlsDisplay === 'none' || mobile.controlCount !== 4 || !mobile.running) throw new Error(`Mobile hub failed: ${JSON.stringify(mobile)}`);
const mobileShot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
await writeFile('.qa-hub-mobile.png', Buffer.from(mobileShot.data, 'base64'));

if (exceptions.length || consoleErrors.length) throw new Error(`Browser errors: ${JSON.stringify({ exceptions, consoleErrors })}`);
socket.close();
console.log(JSON.stringify({ ok: true, desktop, afterMove, afterJump, afterObstacle, afterLift, service, serviceAfterPersist, routeOpened, mobile, exceptions, consoleErrors }, null, 2));
