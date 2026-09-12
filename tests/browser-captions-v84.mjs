import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = process.env.APP_URL || 'http://127.0.0.1:4176/';
const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9226';
const output = resolve(process.env.QA_OUTPUT || 'docs/references/v84-captions-qa');
await mkdir(output, { recursive: true });
const info = await fetch(endpoint + '/json/version').then(response => response.json());
const socket = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((accept, reject) => { socket.addEventListener('open', accept, { once: true }); socket.addEventListener('error', reject, { once: true }); });
let sequence = 0, session, context;
const pending = new Map(), errors = [];
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (pending.has(message.id)) {
    const operation = pending.get(message.id); pending.delete(message.id);
    if (message.error) operation.reject(Error(message.error.message)); else operation.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) errors.push(message.params.response.status + ' ' + message.params.response.url);
});
const cdp = (method, params = {}, browser = false) => new Promise((resolve, reject) => {
  const id = ++sequence; pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params, ...(session && !browser ? { sessionId: session } : {}) }));
});
async function evaluate(expression) {
  const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
async function until(expression) {
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    const result = await evaluate(expression);
    if (result) return result;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw Error('Timeout: ' + expression);
}
const report = { ok: false, scope: 'Actual application CSS and mission caption events; isolated browser storage; authored mission setup; no campaign completion claim.', layouts: [], screenshots: [], errors };
async function screenshot(name) {
  const result = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 82, captureBeyondViewport: false });
  await writeFile(resolve(output, name + '.jpg'), Buffer.from(result.data, 'base64'));
  report.screenshots.push(name + '.jpg');
}
const separated = (a, b) => a.right <= b.left + 0.5 || b.right <= a.left + 0.5 || a.bottom <= b.top + 0.5 || b.bottom <= a.top + 0.5;

try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true));
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true);
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId, flatten: true }, true));
  for (const domain of ['Page', 'Runtime', 'Network']) await cdp(domain + '.enable');
  await cdp('Network.setBypassServiceWorker', { bypass: true });
  await cdp('Emulation.setFocusEmulationEnabled', { enabled: true });
  await cdp('Page.navigate', { url: base + '?qa=captions-v84' });
  await until('globalThis.__ATF_GAME__ && globalThis.__ATF_V61__ && !document.querySelector("#boot")');
  await evaluate(`(async () => {
    const c = await import('/src/content.js'), game = __ATF_GAME__;
    __ATF_V61__.titleScreen.hide(); __ATF_V51__.showView('play'); __ATF_HUB__.stop();
    const world = c.WORLDS.find(entry => entry.biomes.includes('industrial')) || c.WORLDS[0];
    game.start({ seed: 840084, world, crew: c.CREW, campaign: { ...c.CAMPAIGNS[0], id: 'qa-caption-v84', objective: 'Revenir au sas.', worldId: world.id },
      levelSeed: { ...c.LEVEL_SEEDS[0], id: 'qa-caption-v84', worldId: world.id, objective: 'Revenir au sas.' }, enemyCatalog: [],
      weapon: c.WEAPONS.find(weapon => weapon.id.includes('m41a')) || c.WEAPONS[0], aimAssist: 'off' });
    game.enemies = []; game.hazards = []; game.hostileProjectiles = []; game.squadActors = [];
    Object.assign(game.player, { x: 500, y: 820, vx: 0, vy: 0, ammo: 99, fireClock: 0, reloading: false });
    game.canvas.focus(); document.documentElement.dataset.subtitles = 'on';
  })()`);
  await until('__ATF_GAME__.running && !__ATF_GAME__.enemyAtlasLoadingPausedV65');
  for (const [name, width, height, mobile] of [
    ['desktop', 1280, 720, false], ['mobile-landscape', 844, 390, true],
    ['mobile-portrait', 390, 844, true], ['small-landscape', 480, 320, true], ['small-portrait', 320, 568, true]
  ]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height, mobile, deviceScaleFactor: 1 });
    await cdp('Emulation.setTouchEmulationEnabled', { enabled: mobile, maxTouchPoints: 5 });
    await evaluate(`(() => { const g = __ATF_GAME__; g.mission.elapsed += 20; g.pushCaption('dialogue', 'MARA : Rétablissez le courant, puis rejoignez le sas. Je couvre votre retraite.'); })()`);
    await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
    const layout = await evaluate(`(() => {
      const box = element => { const r = element.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
      const log = document.querySelector('#mission-log'), style = getComputedStyle(log), canvas = document.querySelector('#game-canvas');
      return { viewport: [innerWidth, innerHeight], canvas: box(canvas), caption: box(log), text: log.textContent,
        captionDisplay: style.display, captionFont: parseFloat(style.fontSize), ariaLive: log.getAttribute('aria-live'),
        controls: [...document.querySelectorAll('.mission-touch-controls button')].map(button => {
          const r = box(button); return { ...r, hit: !r.width || document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === button };
        }) };
    })()`);
    report.layouts.push({ name, ...layout });
    assert.notEqual(layout.captionDisplay, 'none', name + ': captions enabled');
    assert.ok(layout.captionFont >= 12, name + ': readable caption size');
    assert.equal(layout.ariaLive, 'polite');
    assert.ok(layout.text.includes('Je couvre votre retraite.'), name + ': full dialogue preserved');
    assert.ok(Math.abs(layout.canvas.width / layout.canvas.height - 16 / 9) < 0.01, name + ': pointer projection aspect');
    assert.ok(separated(layout.caption, layout.canvas), name + ': caption outside playable canvas');
    assert.ok(layout.caption.top >= 0 && layout.caption.bottom <= height + 0.5 && layout.caption.left >= 0 && layout.caption.right <= width + 0.5, name + ': caption inside viewport');
    if (mobile) for (const button of layout.controls) {
      assert.ok(button.width >= 44 && button.height >= 44 && button.hit, name + ': accessible touch target');
      assert.ok(separated(layout.caption, button), name + ': caption does not cover controls');
    }
    await screenshot(name);
  }
  await evaluate(`__ATF_GAME__.pushCaption('dialogue', 'TRANSMISSION : ' + 'Gardez le sas fermé, je répète : attendez mon signal. '.repeat(12))`);
  report.longDialogue = await evaluate(`(() => { const log = document.querySelector('#mission-log'); return { length: log.textContent.length, overflow: getComputedStyle(log).overflowY, pointerEvents: getComputedStyle(log).pointerEvents, scrollHeight: log.scrollHeight, clientHeight: log.clientHeight }; })()`);
  assert.ok(report.longDialogue.length > 500);
  assert.equal(report.longDialogue.overflow, 'auto');
  assert.equal(report.longDialogue.pointerEvents, 'auto');
  await evaluate(`document.documentElement.dataset.subtitles = 'off'`);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('#mission-log')).display`), 'none');
  await evaluate(`document.documentElement.dataset.subtitles = 'on'`);
  assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('#mission-log')).display`), 'none');
  assert.deepEqual(errors, []);
  report.ok = true;
} catch (error) {
  report.failure = error.stack;
  await screenshot('failure').catch(() => {});
  throw error;
} finally {
  await writeFile(resolve(output, 'captions-v84-browser.json'), JSON.stringify(report, null, 2));
  if (context) await cdp('Target.disposeBrowserContext', { browserContextId: context }, true).catch(() => {});
  socket.close();
  console.log(JSON.stringify(report, null, 2));
}
