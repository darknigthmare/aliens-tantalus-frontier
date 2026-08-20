import { writeFile } from 'node:fs/promises';

const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9223';
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
const mission = await evaluate(`({ active: document.querySelector('[data-panel="play"]').classList.contains('active'), title: document.querySelector('#mission-title').textContent, canvasWidth: document.querySelector('#game-canvas').width, log: document.querySelector('#mission-log').textContent })`);
if (!mission.active || mission.canvasWidth !== 1280 || !mission.title.trim()) throw new Error(`Mission launch failed: ${JSON.stringify(mission)}`);
const screenshot = await command('Page.captureScreenshot', { format: 'jpeg', quality: 76, captureBeyondViewport: false });
await writeFile('.qa-mission.jpg', Buffer.from(screenshot.data, 'base64'));
await evaluate(`document.querySelector('#exit-mission').click()`);
const returned = await evaluate(`document.querySelector('[data-panel="hub"]').classList.contains('active')`);
if (!returned) throw new Error('Mission exit did not return to the Tantalus hub.');
if (exceptions.length) throw new Error(`Browser exceptions: ${exceptions.join(' | ')}`);
socket.close();
console.log(JSON.stringify({ ok: true, shell, mission, exceptions }, null, 2));
