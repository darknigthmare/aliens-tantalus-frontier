import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9226';
const appUrl = process.env.APP_URL || 'http://127.0.0.1:4176/';
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const browserInfo = await fetch(`${endpoint}/json/version`).then(async (response) => {
  if (!response.ok) throw new Error(`Chrome CDP indisponible : HTTP ${response.status}`);
  return response.json();
});
const socket = new WebSocket(browserInfo.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let browserContextId = null;
let targetId = null;
let pageSessionId = null;
let sequence = 0;
const pending = new Map();
const exceptions = [];
const consoleErrors = [];
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const request = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') {
    exceptions.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  }
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
    consoleErrors.push(message.params.args.map((argument) => argument.value || argument.description || argument.type).join(' '));
  }
});

function command(method, params = {}, { browser = false } = {}) {
  const id = ++sequence;
  const payload = { id, method, params };
  if (pageSessionId && !browser) payload.sessionId = pageSessionId;
  socket.send(JSON.stringify(payload));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await command('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  }
  return result.result.value;
}

async function waitFor(expression, label, timeout = 15000) {
  const started = Date.now();
  let lastValue = null;
  while (Date.now() - started < timeout) {
    try {
      lastValue = await evaluate(expression);
      if (lastValue) return lastValue;
    } catch (error) {
      lastValue = error.message;
    }
    await wait(100);
  }
  throw new Error(`${label}; dernière valeur : ${JSON.stringify(lastValue)}`);
}

async function press(code, key, modifiers = 0) {
  await command('Input.dispatchKeyEvent', { type: 'keyDown', code, key, modifiers });
  await command('Input.dispatchKeyEvent', { type: 'keyUp', code, key, modifiers });
  await wait(80);
}

async function clickCenter(selector) {
  const point = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    const rect = element?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return null;
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  })()`);
  assert.ok(point, `zone cliquable absente : ${selector}`);
  await command('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y });
  await command('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
  await command('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
}

async function capture(name) {
  const image = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  const destination = join(tmpdir(), name);
  await writeFile(destination, Buffer.from(image.data, 'base64'));
  return { destination, bytes: Buffer.byteLength(image.data, 'base64') };
}

async function openArmoryDialogue() {
  await evaluate(`(() => {
    const hub = globalThis.__ATF_HUB__;
    hub.onAction({ action: 'navigate:armory', roomId: 'armory' });
    return true;
  })()`);
  return waitFor(
    `(() => {
      const layer = document.querySelector('#hub-dialogue-layer');
      return layer && !layer.hidden && document.activeElement?.id === 'hub-dialogue-continue';
    })()`,
    'dialogue armurerie non ouvert'
  );
}

const report = { ok: false, screenshots: [] };
try {
  ({ browserContextId } = await command('Target.createBrowserContext', {}, { browser: true }));
  ({ targetId } = await command('Target.createTarget', {
    url: 'about:blank',
    browserContextId
  }, { browser: true }));
  ({ sessionId: pageSessionId } = await command('Target.attachToTarget', {
    targetId,
    flatten: true
  }, { browser: true }));
  await command('Page.enable');
  await command('Runtime.enable');
  await command('Network.enable');
  await command('Network.setCacheDisabled', { cacheDisabled: true });
  await command('Network.setBypassServiceWorker', { bypass: true });
  await command('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    mobile: false
  });
  await command('Page.navigate', { url: `${appUrl}?qa=hub-dialogue-v76-${Date.now()}` });
  await waitFor(
    `Boolean(globalThis.__ATF_V51__ && globalThis.__ATF_V61__ && !document.querySelector('#boot'))`,
    'application non initialisée',
    20000
  );
  await evaluate(`(() => {
    const title = globalThis.__ATF_V61__.titleScreen;
    if (!title.root.hidden) title.hide();
    globalThis.__ATF_V51__.showView('hub');
    return true;
  })()`);
  await waitFor(`globalThis.__ATF_HUB__?.getSnapshot().running === true`, 'hub non démarré');

  await openArmoryDialogue();
  await waitFor(
    `(() => {
      const portrait = document.querySelector('#hub-dialogue-image');
      return portrait?.complete && portrait.naturalWidth > 0 && portrait.naturalHeight > 0;
    })()`,
    'portrait armurerie non chargé',
    20000
  );
  const desktop = await evaluate(`(() => {
    const layer = document.querySelector('#hub-dialogue-layer');
    const dialog = document.querySelector('#hub-dialogue');
    const veil = document.querySelector('.hub-dialogue-veil');
    const cancel = document.querySelector('#hub-dialogue-cancel');
    const portrait = document.querySelector('#hub-dialogue-image');
    const dialogRect = dialog.getBoundingClientRect();
    const cancelRect = cancel.getBoundingClientRect();
    const hit = document.elementFromPoint(cancelRect.left + cancelRect.width / 2, cancelRect.top + cancelRect.height / 2);
    return {
      layerAtBody: layer.parentElement === document.body,
      layerPosition: getComputedStyle(layer).position,
      layerZ: getComputedStyle(layer).zIndex,
      dialogPosition: getComputedStyle(dialog).position,
      veilZ: getComputedStyle(veil).zIndex,
      hitInsideDialog: Boolean(hit?.closest('#hub-dialogue')),
      hitId: hit?.id || null,
      focusId: document.activeElement?.id || null,
      appInert: document.querySelector('#app').inert,
      appAriaHidden: document.querySelector('#app').getAttribute('aria-hidden'),
      hubRunning: globalThis.__ATF_HUB__.getSnapshot().running,
      portrait: {
        src: portrait.currentSrc || portrait.src,
        complete: portrait.complete,
        naturalWidth: portrait.naturalWidth,
        naturalHeight: portrait.naturalHeight,
        className: portrait.className
      },
      rect: { left: dialogRect.left, top: dialogRect.top, right: dialogRect.right, bottom: dialogRect.bottom }
    };
  })()`);
  assert.equal(desktop.layerAtBody, true);
  assert.equal(desktop.layerPosition, 'fixed');
  assert.equal(desktop.layerZ, '90');
  assert.equal(desktop.dialogPosition, 'relative');
  assert.equal(desktop.veilZ, '0');
  assert.equal(desktop.hitInsideDialog, true);
  assert.equal(desktop.hitId, 'hub-dialogue-cancel');
  assert.equal(desktop.focusId, 'hub-dialogue-continue');
  assert.equal(desktop.appInert, true);
  assert.equal(desktop.appAriaHidden, 'true');
  assert.equal(desktop.hubRunning, false);
  assert.match(desktop.portrait.src, /sanaa-doyle-armory-v61\.png$/u);
  assert.equal(desktop.portrait.complete, true);
  assert.ok(desktop.portrait.naturalWidth > 0 && desktop.portrait.naturalHeight > 0);

  await press('Tab', 'Tab');
  assert.equal(await evaluate(`document.activeElement?.id`), 'hub-dialogue-cancel');
  await press('Tab', 'Tab', 8);
  assert.equal(await evaluate(`document.activeElement?.id`), 'hub-dialogue-continue');
  report.screenshots.push(await capture('alien-tantalus-hub-dialogue-v76-desktop.png'));

  await clickCenter('#hub-dialogue-cancel');
  await waitFor(
    `document.querySelector('#hub-dialogue-layer').hidden && globalThis.__ATF_HUB__.getSnapshot().running && document.activeElement?.id === 'hub-canvas'`,
    'clic Annuler sans fermeture/reprise/focus canvas'
  );

  await openArmoryDialogue();
  await press('Escape', 'Escape');
  await waitFor(
    `document.querySelector('#hub-dialogue-layer').hidden && globalThis.__ATF_HUB__.getSnapshot().running && document.activeElement?.id === 'hub-canvas'`,
    'Échap sans fermeture/reprise/focus canvas'
  );

  await command('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    screenWidth: 390,
    screenHeight: 844,
    deviceScaleFactor: 1,
    mobile: true
  });
  await openArmoryDialogue();
  const mobile = await evaluate(`(() => {
    const dialog = document.querySelector('#hub-dialogue');
    const portrait = document.querySelector('.hub-dialogue-portrait');
    const button = document.querySelector('#hub-dialogue-cancel');
    const rect = dialog.getBoundingClientRect();
    const portraitRect = portrait.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const hit = document.elementFromPoint(buttonRect.left + buttonRect.width / 2, buttonRect.top + buttonRect.height / 2);
    return {
      viewport: { width: innerWidth, height: innerHeight },
      rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom },
      portrait: { width: portraitRect.width, height: portraitRect.height },
      hitInsideDialog: Boolean(hit?.closest('#hub-dialogue')),
      focusId: document.activeElement?.id || null
    };
  })()`);
  assert.deepEqual(mobile.viewport, { width: 390, height: 844 });
  assert.ok(mobile.rect.left >= 0 && mobile.rect.top >= 0);
  assert.ok(mobile.rect.right <= 390 && mobile.rect.bottom <= 844);
  assert.ok(mobile.portrait.width > 0 && mobile.portrait.height > 0);
  assert.equal(mobile.hitInsideDialog, true);
  assert.equal(mobile.focusId, 'hub-dialogue-continue');
  report.screenshots.push(await capture('alien-tantalus-hub-dialogue-v76-mobile.png'));
  await press('Escape', 'Escape');
  await waitFor(`document.querySelector('#hub-dialogue-layer').hidden`, 'fermeture mobile absente');

  await command('Emulation.setDeviceMetricsOverride', {
    width: 844, height: 390, screenWidth: 844, screenHeight: 390,
    deviceScaleFactor: 1, mobile: true
  });
  await openArmoryDialogue();
  const landscape = await evaluate(`(() => {
    const dialog = document.querySelector('#hub-dialogue');
    const copy = document.querySelector('.hub-dialogue-copy');
    const button = document.querySelector('#hub-dialogue-cancel');
    const rect = dialog.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const hit = document.elementFromPoint(buttonRect.left + buttonRect.width / 2, buttonRect.top + buttonRect.height / 2);
    return {
      viewport: { width: innerWidth, height: innerHeight },
      rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom },
      button: { top: buttonRect.top, bottom: buttonRect.bottom },
      overflowY: getComputedStyle(dialog).overflowY,
      scrollHeight: dialog.scrollHeight, clientHeight: dialog.clientHeight,
      copyScrollHeight: copy.scrollHeight, copyClientHeight: copy.clientHeight,
      hitId: hit?.id || null, focusId: document.activeElement?.id || null
    };
  })()`);
  report.screenshots.push(await capture('alien-tantalus-hub-dialogue-v76-landscape.png'));
  console.log(JSON.stringify({ landscape }, null, 2));
  assert.deepEqual(landscape.viewport, { width: 844, height: 390 });
  assert.ok(landscape.rect.left >= 0 && landscape.rect.top >= 0);
  assert.ok(landscape.rect.right <= 844 && landscape.rect.bottom <= 390);
  assert.equal(landscape.hitId, 'hub-dialogue-cancel');
  assert.ok(landscape.button.top >= landscape.rect.top && landscape.button.bottom <= landscape.rect.bottom);
  assert.equal(landscape.focusId, 'hub-dialogue-continue');
  await clickCenter('#hub-dialogue-cancel');
  await waitFor(`document.querySelector('#hub-dialogue-layer').hidden && globalThis.__ATF_HUB__.getSnapshot().running`, 'fermeture paysage absente');
  const npcViews = [];
  for (const viewport of [
    { name: 'desktop', width: 1280, height: 720, mobile: false },
    { name: 'mobile', width: 390, height: 844, mobile: true },
    { name: 'landscape', width: 844, height: 390, mobile: true }
  ]) {
  await command('Emulation.setDeviceMetricsOverride', { width: viewport.width, height: viewport.height,
    screenWidth: viewport.width, screenHeight: viewport.height, mobile: viewport.mobile, deviceScaleFactor: 1 });
  await evaluate(`globalThis.__ATF_HUB__.onAction({ type: 'hub:npc-interaction', action: 'npc:talk', crewId: 'crew-01-mara-vega' })`);
  await waitFor(`document.querySelector('#hub-dialogue-choices button:not(:disabled)') === document.activeElement`, 'dialogue PNJ paysage non ouvert');
  await waitFor(`document.querySelector('#hub-dialogue-image').complete && document.querySelector('#hub-dialogue-image').naturalWidth > 0`, 'sprite portrait PNJ absent');
  const npcLandscape = await evaluate(`(() => {
    const dialog = document.querySelector('#hub-dialogue');
    const button = document.querySelector('#hub-dialogue-cancel');
    const rect = dialog.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    return { overflowY: getComputedStyle(dialog).overflowY,
      scrollHeight: dialog.scrollHeight, clientHeight: dialog.clientHeight,
      rect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom },
      button: { top: buttonRect.top, bottom: buttonRect.bottom },
      choiceCount: document.querySelectorAll('#hub-dialogue-choices button').length,
      portrait: (() => {
        const image = document.querySelector('#hub-dialogue-image');
        const imageRect = image.getBoundingClientRect();
        const panelRect = image.parentElement.getBoundingClientRect();
        return { src: image.currentSrc, width: image.naturalWidth, height: image.naturalHeight,
          clipPath: getComputedStyle(image).clipPath,
          cellWidth: imageRect.width / 4, cellHeight: imageRect.height / 4,
          centerX: imageRect.left + imageRect.width / 8, panelHeight: panelRect.height,
          panelWidth: panelRect.width,
          panelCenterX: panelRect.left + panelRect.width / 2 };
      })() };
  })()`);
  console.log(JSON.stringify({ npcLandscape }, null, 2));
  report.screenshots.push(await capture(`alien-tantalus-hub-dialogue-v76-npc-${viewport.name}.png`));
  assert.ok(npcLandscape.rect.top >= 0 && npcLandscape.rect.bottom <= viewport.height);
  assert.ok(npcLandscape.rect.left >= 0 && npcLandscape.rect.right <= viewport.width);
  assert.equal(npcLandscape.choiceCount, 6);
  assert.equal(npcLandscape.portrait.width, 1024);
  assert.equal(npcLandscape.portrait.height, 1024);
  assert.equal(npcLandscape.portrait.clipPath, 'inset(0px 75% 75% 0px)');
  assert.ok(Math.abs(npcLandscape.portrait.cellWidth - npcLandscape.portrait.cellHeight) < 1);
  assert.ok(npcLandscape.portrait.cellWidth >= 64 && npcLandscape.portrait.cellHeight >= 64, 'cellule de portrait invisible');
  assert.ok(Math.abs(npcLandscape.portrait.centerX - npcLandscape.portrait.panelCenterX) < 1);
  assert.ok(npcLandscape.portrait.cellWidth <= npcLandscape.portrait.panelWidth + 1);
  assert.ok(npcLandscape.portrait.cellHeight <= npcLandscape.portrait.panelHeight + 1);
  if (npcLandscape.scrollHeight > npcLandscape.clientHeight) assert.match(npcLandscape.overflowY, /auto|scroll/);
  await press('Tab', 'Tab', 8);
  const wrappedFocus = await evaluate(`(() => {
    const target = document.activeElement;
    const rect = target.getBoundingClientRect();
    const dialogRect = document.querySelector('#hub-dialogue').getBoundingClientRect();
    return { id: target.id, top: rect.top, bottom: rect.bottom,
      visible: rect.top >= dialogRect.top && rect.bottom <= dialogRect.bottom };
  })()`);
  console.log(JSON.stringify({ viewport: viewport.name, wrappedFocus }));
  assert.equal(wrappedFocus.id, 'hub-dialogue-cancel');
  assert.equal(wrappedFocus.visible, true, 'le retour Maj+Tab doit rendre Annuler visible');
  await press('Tab', 'Tab');
  assert.equal(await evaluate(`document.activeElement === document.querySelector('#hub-dialogue-choices button:not(:disabled)')`), true);
  await evaluate(`document.querySelector('#hub-dialogue').scrollTop = 0`);
  if (npcLandscape.scrollHeight > npcLandscape.clientHeight) {
    await command('Input.dispatchMouseEvent', { type: 'mouseWheel',
      x: npcLandscape.rect.right - 50, y: npcLandscape.rect.bottom - 50, deltaX: 0, deltaY: 950 });
    await waitFor(`document.querySelector('#hub-dialogue').scrollTop > 0`, 'défilement utilisateur PNJ inopérant');
  }
  report.screenshots.push(await capture(`alien-tantalus-hub-dialogue-v76-npc-${viewport.name}-scrolled.png`));
  await clickCenter('#hub-dialogue-cancel');
  await waitFor(`document.querySelector('#hub-dialogue-layer').hidden && globalThis.__ATF_HUB__.getSnapshot().running`, 'Annuler PNJ paysage inaccessible');
  npcViews.push({ viewport, ...npcLandscape, wrappedFocus });
  }

  assert.deepEqual(exceptions, []);
  assert.deepEqual(consoleErrors, []);
  report.ok = true;
  report.desktop = desktop;
  report.mobile = mobile;
  report.landscape = landscape;
  report.npcViews = npcViews;
  report.exceptions = exceptions;
  report.consoleErrors = consoleErrors;
  console.log(JSON.stringify(report, null, 2));
  if (process.env.REPORT_PATH) await writeFile(process.env.REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
} finally {
  try {
    if (targetId) await command('Target.closeTarget', { targetId }, { browser: true });
    if (browserContextId) await command('Target.disposeBrowserContext', { browserContextId }, { browser: true });
  } catch {}
  socket.close();
}
