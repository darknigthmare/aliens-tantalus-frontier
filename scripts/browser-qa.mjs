import { writeFile } from 'node:fs/promises';

const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9225';
const appUrl = process.env.APP_URL || 'http://127.0.0.1:4173/';
const target = await fetch(`${endpoint}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' }).then(async (response) => {
  if (!response.ok) throw new Error(`Cannot create Chrome target: ${response.status}`);
  return response.json();
});
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });

let sequence = 0;
const pending = new Map();
const exceptions = [];
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id); pending.delete(message.id);
    message.error ? reject(new Error(message.error.message)) : resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text);
});
function command(method, params = {}) {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}
async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

await command('Page.enable');
await command('Runtime.enable');
await command('Page.navigate', { url: appUrl });
await new Promise((resolve) => setTimeout(resolve, 2500));
await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await evaluate('new Promise(resolve => setTimeout(resolve, 500))');
const shell = await evaluate(`({
  title: document.title,
  bootRemoved: !document.querySelector('#boot'),
  appVisible: !document.querySelector('#app').hidden,
  counts: [...document.querySelectorAll('#release-counts .metric b')].map(node => node.textContent.trim()),
  worlds: document.querySelectorAll('.world-node').length,
  campaigns: document.querySelectorAll('#campaign-list .catalog-card').length,
  editorTools: document.querySelectorAll('.tool-button').length
})`);
if (!shell.bootRemoved || !shell.appVisible || shell.worlds !== 64 || shell.campaigns !== 30 || shell.editorTools !== 13) throw new Error(`Shell QA failed: ${JSON.stringify(shell)}`);

await evaluate(`document.querySelector('[data-view="operations"]').click()`);
await evaluate('new Promise(resolve => setTimeout(resolve, 100))');
const operationsActive = await evaluate(`document.querySelector('[data-panel="operations"]').classList.contains('active')`);
if (!operationsActive) throw new Error('Operations navigation did not activate.');
await evaluate(`document.querySelector('[data-campaign-id]').click()`);
await evaluate('new Promise(resolve => setTimeout(resolve, 350))');
await evaluate(`new Promise((resolve, reject) => {
  const started = performance.now();
  const check = () => {
    const report = globalThis.__ATF_GAME__?.getAssetReport();
    if (globalThis.__ATF_GAME__?.getSnapshot().running && report?.missing.length === 0) return resolve(report);
    if (performance.now() - started > 20000) return reject(new Error('mission asset timeout: ' + JSON.stringify(report)));
    setTimeout(check, 100);
  };
  check();
})`);
const mission = await evaluate(`({ active: document.querySelector('[data-panel="play"]').classList.contains('active'), title: document.querySelector('#mission-title').textContent, canvasWidth: document.querySelector('#game-canvas').width, canvasCssWidth: Math.round(document.querySelector('#game-canvas').getBoundingClientRect().width), log: document.querySelector('#mission-log').textContent, missionMode: document.documentElement.classList.contains('mission-mode'), railDisplay: getComputedStyle(document.querySelector('.rail')).display, snapshot: globalThis.__ATF_GAME__.getSnapshot() })`);
if (!mission.active || !mission.missionMode || mission.railDisplay !== 'none' || mission.canvasWidth !== 1280 || mission.canvasCssWidth < 1200 || !mission.title.trim() || mission.snapshot.worldWidth !== 6200 || mission.snapshot.worldHeight !== 1080 || mission.snapshot.platformCount !== 16 || mission.snapshot.ladderCount !== 6 || mission.snapshot.doorCount !== 4 || mission.snapshot.assets.missing.length) throw new Error(`Mission launch failed: ${JSON.stringify(mission)}`);
const screenshot = await command('Page.captureScreenshot', { format: 'jpeg', quality: 76, captureBeyondViewport: false });
await writeFile('.qa-mission.jpg', Buffer.from(screenshot.data, 'base64'));
await evaluate(`Object.assign(globalThis.__ATF_GAME__.player, { x: 450, y: 838, vx: 0, vy: 0, grounded: true, climbing: false })`);
await command('Input.dispatchKeyEvent', { type: 'keyDown', code: 'KeyW', key: 'w' });
await new Promise((resolve) => setTimeout(resolve, 360));
await command('Input.dispatchKeyEvent', { type: 'keyUp', code: 'KeyW', key: 'w' });
await new Promise((resolve) => setTimeout(resolve, 80));
const climbed = await evaluate(`globalThis.__ATF_GAME__.getSnapshot()`);
if (!climbed.player.climbing || climbed.player.y >= 820) throw new Error(`Ladder traversal failed: ${JSON.stringify(climbed)}`);

await evaluate(`Object.assign(globalThis.__ATF_GAME__.player, { x: 1879, y: 630, vx: 0, vy: 0, grounded: true, climbing: false })`);
await command('Input.dispatchKeyEvent', { type: 'keyDown', code: 'KeyE', key: 'e' });
await new Promise((resolve) => setTimeout(resolve, 80));
await command('Input.dispatchKeyEvent', { type: 'keyUp', code: 'KeyE', key: 'e' });
await new Promise((resolve) => setTimeout(resolve, 120));
const powered = await evaluate(`globalThis.__ATF_GAME__.getSnapshot()`);
if (!powered.powerRestored) throw new Error(`Power gate failed: ${JSON.stringify(powered)}`);

await evaluate(`document.querySelector('#exit-mission').click()`);
const returned = await evaluate(`document.querySelector('[data-panel="hub"]').classList.contains('active')`);
if (!returned) throw new Error('Mission exit did not return to the Tantalus hub.');
if (exceptions.length) throw new Error(`Browser exceptions: ${exceptions.join(' | ')}`);
socket.close();
console.log(JSON.stringify({ ok: true, shell, mission, climbed, powered, exceptions }, null, 2));
