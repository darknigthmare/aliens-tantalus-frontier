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
  await wait(70);
  await command('Input.dispatchKeyEvent', { type: 'keyUp', code, key: keyValue });
}

async function hold(code, keyValue, milliseconds) {
  await command('Input.dispatchKeyEvent', { type: 'keyDown', code, key: keyValue });
  await wait(milliseconds);
  await command('Input.dispatchKeyEvent', { type: 'keyUp', code, key: keyValue });
  await wait(140);
}

async function signature() {
  return evaluate(`(() => {
    const canvas = document.querySelector('#hub-canvas');
    const data = canvas.getContext('2d').getImageData(120, 160, 1040, 430).data;
    let hash = 2166136261;
    for (let offset = 0; offset < data.length; offset += 257) {
      hash ^= data[offset] + data[offset + 1] * 3 + data[offset + 2] * 7 + data[offset + 3] * 11;
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash;
  })()`);
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
    if (performance.now() - started > 8000) return reject(new Error('hub boot timeout'));
    requestAnimationFrame(check);
  };
  check();
})`);
await evaluate(`new Promise((resolve, reject) => {
  const started = performance.now();
  const check = () => {
    const report = globalThis.__ATF_HUB__?.getAssetReport();
    if (report?.readyAssetCount === 36) return resolve(report);
    if (performance.now() - started > 20000) return reject(new Error('modular asset timeout: ' + JSON.stringify(report)));
    setTimeout(check, 100);
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
    assets: hub.getAssetReport(),
    roomDimensions: [...hub.roomImages.values()].map((image) => [image.naturalWidth, image.naturalHeight]),
    parallaxDimensions: [...hub.farLayers.values()].map((image) => [image.naturalWidth, image.naturalHeight]),
    propDimensions: [...hub.propImages.values()].map((image) => [image.naturalWidth, image.naturalHeight]),
    crewSheet: { width: hub.crewSheet.naturalWidth, height: hub.crewSheet.naturalHeight },
    overlay: Boolean(document.querySelector('[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay')),
    textLength: document.body.innerText.trim().length
  };
})()`);
if (!desktop.appVisible || !desktop.hubActive || desktop.oldRoomButtons || desktop.canvas.width !== 1280 || desktop.canvas.sampledColors < 25 || desktop.snapshot.npcCount !== 4 || desktop.snapshot.obstacleCount !== 12 || desktop.assets.roomAssetsReady !== 16 || desktop.assets.parallaxAssetsReady !== 4 || desktop.assets.propAssetsReady !== 16 || desktop.assets.runtimeArtReady !== 9 || desktop.assets.modularAssetCount !== 36 || desktop.assets.readyAssetCount !== 36 || desktop.assets.totalReadyAssetCount !== 45 || desktop.roomDimensions.some(([width]) => !width) || desktop.parallaxDimensions.some(([width]) => !width) || desktop.propDimensions.some(([width]) => !width) || desktop.overlay || desktop.textLength < 6) throw new Error(`Desktop modular shell failed: ${JSON.stringify(desktop)}`);

await evaluate(`Object.assign(globalThis.__ATF_HUB__.player, { x: 120, y: 520, vx: 0, vy: 0 })`);
const beforeMove = await evaluate(`globalThis.__ATF_HUB__.getSnapshot()`);
await hold('KeyD', 'd', 260);
const afterMove = await evaluate(`globalThis.__ATF_HUB__.getSnapshot()`);
if (afterMove.x < beforeMove.x + 35 || afterMove.roomId !== 'bridge') throw new Error(`Physical movement failed: ${JSON.stringify({ beforeMove, afterMove })}`);

const groundedY = afterMove.y;
await command('Input.dispatchKeyEvent', { type: 'keyDown', code: 'KeyD', key: 'd' });
await command('Input.dispatchKeyEvent', { type: 'keyDown', code: 'Space', key: ' ' });
await wait(120);
const afterJump = await evaluate(`globalThis.__ATF_HUB__.getSnapshot()`);
if (afterJump.y >= groundedY - 18) throw new Error(`Jump failed: ${JSON.stringify({ groundedY, afterJump })}`);
await wait(820);
await command('Input.dispatchKeyEvent', { type: 'keyUp', code: 'KeyD', key: 'd' });
await command('Input.dispatchKeyEvent', { type: 'keyUp', code: 'Space', key: ' ' });
await wait(160);
const afterObstacle = await evaluate(`globalThis.__ATF_HUB__.getSnapshot()`);
if (afterObstacle.x < 315) throw new Error(`Obstacle traversal failed: ${JSON.stringify(afterObstacle)}`);

await evaluate(`Object.assign(globalThis.__ATF_HUB__.player, { x: 1160, y: 520, vx: 0, vy: 0 })`);
await wait(360);
const beforeDoor = await evaluate(`globalThis.__ATF_HUB__.getSnapshot()`);
const bridgeSignature = await signature();
if (beforeDoor.activeDoorState < 0.55) throw new Error(`Door did not open near the player: ${JSON.stringify(beforeDoor)}`);
await hold('KeyD', 'd', 720);
const afterRoom = await evaluate(`globalThis.__ATF_HUB__.getSnapshot()`);
const briefingSignature = await signature();
if (afterRoom.roomId !== 'briefing' || afterRoom.roomBackground === beforeDoor.roomBackground || briefingSignature === bridgeSignature || afterRoom.cameraX <= beforeDoor.cameraX) throw new Error(`Modular room transition failed: ${JSON.stringify({ beforeDoor, afterRoom, bridgeSignature, briefingSignature })}`);

await evaluate(`Object.assign(globalThis.__ATF_HUB__.player, { x: 2440, y: 520, vx: 0, vy: 0 })`);
await wait(260);
const beforeLift = await evaluate(`globalThis.__ATF_HUB__.getSnapshot()`);
await key('KeyS', 's');
await wait(220);
const afterLift = await evaluate(`globalThis.__ATF_HUB__.getSnapshot()`);
if (afterLift.deck !== 1 || afterLift.visited !== beforeLift.visited + 1 || afterLift.parallaxAssetsReady !== 4) throw new Error(`Lift traversal failed: ${JSON.stringify({ beforeLift, afterLift })}`);

await evaluate(`Object.assign(globalThis.__ATF_HUB__.player, { x: 2130, y: 520, vx: 0, vy: 0 })`);
await key('KeyE', 'e');
await wait(220);
const service = await evaluate(`(() => {
  const save = JSON.parse(localStorage.getItem('atf-v47-profile-1'));
  return { hour: save.clock.hour, morale: save.hub.systems.morale, restStamp: save.hub.services['service:rest'], active: document.querySelector('[data-panel="hub"]').classList.contains('active') };
})()`);
if (!service.active || service.hour <= 6 || service.restStamp === undefined) throw new Error(`Diegetic service failed: ${JSON.stringify(service)}`);

await evaluate(`globalThis.__ATF_HUB__.persist()`);
const serviceAfterPersist = await evaluate(`(() => { const save = JSON.parse(localStorage.getItem('atf-v47-profile-1')); return { hour: save.clock.hour, restStamp: save.hub.services['service:rest'] }; })()`);
if (serviceAfterPersist.restStamp !== 1 || serviceAfterPersist.hour !== 7.5) throw new Error(`Physical persistence overwrote service state: ${JSON.stringify(serviceAfterPersist)}`);

await evaluate(`Object.assign(globalThis.__ATF_HUB__.player, { x: 2440, y: 520, vx: 0, vy: 0 })`);
await key('KeyW', 'w');
await evaluate(`Object.assign(globalThis.__ATF_HUB__.player, { x: 840, y: 520, vx: 0, vy: 0 })`);
await key('KeyE', 'e');
await wait(220);
const routeOpened = await evaluate(`document.querySelector('[data-panel="galaxy"]').classList.contains('active')`);
if (!routeOpened) throw new Error('Bridge terminal did not open the galaxy surface.');
await evaluate(`document.querySelector('[data-view="hub"]').click()`);
await wait(520);

const desktopShot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
await writeFile('.qa-hub-desktop.png', Buffer.from(desktopShot.data, 'base64'));

await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true, screenWidth: 390, screenHeight: 844 });
await command('Page.reload', { ignoreCache: true });
await wait(3000);
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
    modularAssetCount: globalThis.__ATF_HUB__.getSnapshot().modularAssetCount,
    room: document.querySelector('#hub-room-label').textContent
  };
})()`);
if (mobile.width !== 390 || !mobile.hubActive || mobile.canvasWidth > 390 || mobile.canvasWidth < 300 || mobile.controlsDisplay === 'none' || mobile.controlCount !== 4 || !mobile.running || mobile.modularAssetCount !== 36) throw new Error(`Mobile hub failed: ${JSON.stringify(mobile)}`);
const mobileShot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
await writeFile('.qa-hub-mobile.png', Buffer.from(mobileShot.data, 'base64'));

if (exceptions.length || consoleErrors.length) throw new Error(`Browser errors: ${JSON.stringify({ exceptions, consoleErrors })}`);
socket.close();
console.log(JSON.stringify({ ok: true, desktop, beforeMove, afterMove, afterJump, afterObstacle, beforeDoor, afterRoom, bridgeSignature, briefingSignature, beforeLift, afterLift, service, serviceAfterPersist, routeOpened, mobile, exceptions, consoleErrors }, null, 2));
