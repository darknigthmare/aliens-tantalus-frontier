import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9226';
const baseUrl = new URL(process.env.BASE_URL || process.env.APP_URL || 'http://127.0.0.1:4176/');
const localHosts = new Set(['127.0.0.1', 'localhost', '::1']);
const targetKind = process.env.QA_TARGET
  || (localHosts.has(baseUrl.hostname) ? 'local' : 'canonical');
const outputDir = resolve(
  process.env.QA_OUTPUT
    || `docs/references/v80-release-qa/browser-${targetKind}`
);
const reportPath = resolve(outputDir, 'bioforge-v80-browser-report.json');
const expectedBioforgeAssets = Object.freeze({
  '/assets/openai/bioforge/v80/far/bioforge-far-industrial-shell-v80.png': [1920, 720],
  '/assets/openai/bioforge/v80/mid/bioforge-mid-process-modules-v80.png': [1920, 720],
  '/assets/openai/bioforge/v80/foreground/bioforge-foreground-service-frame-v80.png': [1920, 720],
  '/assets/openai/bioforge/v80/props/bioforge-tissue-printer-v80.png': [1024, 1024],
  '/assets/openai/bioforge/v80/props/bioforge-bulkhead-cycle-v80.png': [2048, 1024],
  '/assets/openai/bioforge/v80/vfx/bioforge-purge-cycle-v80.png': [2048, 1024]
});
const wait = (milliseconds) => new Promise((done) => setTimeout(done, milliseconds));

await mkdir(outputDir, { recursive: true });

const report = {
  ok: false,
  schema: 80,
  target: targetKind,
  baseUrl: baseUrl.href,
  startedAt: new Date().toISOString(),
  scope: [
    'Contexte Chromium et stockage isolés.',
    'Configuration et boutons pilotés par événements CDP réels.',
    'Transfert contrôle -> double SAS -> imprimante -> arène piloté au clavier, sans téléportation.',
    'Un tir est déclenché par un vrai pointerdown sur le canvas.',
    'Les hooks QA ne servent qu’à tester le confinement et à neutraliser rapidement les survivants.',
    'Le probe x12 utilise des hooks QA pour accélérer ses phases et mesure seulement 120 updates logiques.',
    'Aucune simulation ni revendication de prise en charge manette.',
    'Ce test ne prétend pas constituer un playthrough de campagne.'
  ],
  hooksUsed: [
    'attemptEscape: injection hors limites puis confinement immédiat',
    'kill: neutralisation des survivants après le tir réel',
    'step: une frame pour constater le résultat après neutralisation',
    'advance: progression accélérée du probe isolé au budget maximal x12',
    'purge: nettoyage atomique du probe isolé x12'
  ],
  screenshots: [],
  checks: {}
};

let socket;
let sequence = 0;
let browserContextId = null;
let targetId = null;
let pageSessionId = null;
const pending = new Map();
const exceptions = [];
const consoleErrors = [];
const logErrors = [];
const failedRequests = [];
const httpErrors = [];
const bioforgeResponses = [];

function command(method, params = {}, { browser = false } = {}) {
  const id = ++sequence;
  const payload = { id, method, params };
  if (pageSessionId && !browser) payload.sessionId = pageSessionId;
  socket.send(JSON.stringify(payload));
  return new Promise((resolveCommand, rejectCommand) => {
    pending.set(id, { resolve: resolveCommand, reject: rejectCommand });
  });
}

async function evaluate(expression) {
  const reply = await command('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (reply.exceptionDetails) {
    throw new Error(reply.exceptionDetails.exception?.description || reply.exceptionDetails.text);
  }
  return reply.result.value;
}

async function until(expression, label, timeout = 20000) {
  const deadline = Date.now() + timeout;
  let lastValue = null;
  while (Date.now() < deadline) {
    lastValue = await evaluate(expression);
    if (lastValue) return lastValue;
    await wait(45);
  }
  throw new Error(`Timeout BIOFORGE: ${label}; dernière valeur=${JSON.stringify(lastValue)}`);
}

const KEY_VALUES = Object.freeze({
  Space: ' ',
  Enter: 'Enter',
  Tab: 'Tab',
  Home: 'Home',
  ArrowDown: 'ArrowDown',
  ArrowUp: 'ArrowUp',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  ControlLeft: 'Control'
});

function keyValue(code, explicit) {
  if (explicit != null) return explicit;
  return KEY_VALUES[code] || code.replace(/^Key/, '').toLowerCase();
}

async function press(code, explicitKey, { modifiers = 0, holdMs = 65 } = {}) {
  const key = keyValue(code, explicitKey);
  await command('Input.dispatchKeyEvent', { type: 'keyDown', code, key, modifiers });
  await wait(holdMs);
  await command('Input.dispatchKeyEvent', { type: 'keyUp', code, key, modifiers });
}

async function holdUntil(code, explicitKey, expression, label, timeout = 7000) {
  const key = keyValue(code, explicitKey);
  await command('Input.dispatchKeyEvent', { type: 'keyDown', code, key });
  try {
    return await until(expression, label, timeout);
  } finally {
    await command('Input.dispatchKeyEvent', { type: 'keyUp', code, key });
    await wait(90);
  }
}

async function click(selector) {
  const point = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    const rect = element?.getBoundingClientRect();
    if (!element || !rect) return null;
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return {
      x, y, width: rect.width, height: rect.height,
      disabled: Boolean(element.disabled),
      hit: hit === element || element.contains(hit),
      hitId: hit?.id || null
    };
  })()`);
  assert.ok(point && point.width > 0 && point.height > 0, `Élément invisible: ${selector}`);
  assert.equal(point.disabled, false, `Élément désactivé: ${selector}`);
  assert.equal(point.hit, true, `Élément masqué au point d'action: ${selector} / ${JSON.stringify(point)}`);
  await command('Input.dispatchMouseEvent', {
    type: 'mousePressed', button: 'left', buttons: 1, clickCount: 1, x: point.x, y: point.y
  });
  await command('Input.dispatchMouseEvent', {
    type: 'mouseReleased', button: 'left', buttons: 0, clickCount: 1, x: point.x, y: point.y
  });
  await wait(80);
  return point;
}

async function touchPoint(selector) {
  return evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    const rect = element?.getBoundingClientRect();
    if (!element || !rect) return null;
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { x, y, width: rect.width, height: rect.height, disabled: Boolean(element.disabled),
      hit: hit === element || element.contains(hit), hitId: hit?.id || null };
  })()`);
}

async function tap(selector) {
  const point = await touchPoint(selector);
  assert.ok(point && point.width > 0 && point.height > 0, `Cible tactile invisible: ${selector}`);
  assert.equal(point.disabled, false, `Cible tactile désactivée: ${selector}`);
  assert.equal(point.hit, true, `Cible tactile masquée: ${selector} / ${JSON.stringify(point)}`);
  await command('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ id: 1, x: point.x, y: point.y, radiusX: 2, radiusY: 2, force: 1 }]
  });
  await command('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await wait(160);
  return point;
}

async function touchHoldUntil(selector, expression, label, timeout = 7000) {
  const point = await touchPoint(selector);
  assert.ok(point && point.width > 0 && point.height > 0, `Cible tactile invisible: ${selector}`);
  assert.equal(point.disabled, false, `Cible tactile désactivée: ${selector}`);
  assert.equal(point.hit, true, `Cible tactile masquée: ${selector} / ${JSON.stringify(point)}`);
  await command('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ id: 2, x: point.x, y: point.y, radiusX: 3, radiusY: 3, force: 1 }]
  });
  try {
    return await until(expression, label, timeout);
  } finally {
    await command('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await wait(120);
  }
}

async function selectWithKeyboard(selector, value) {
  const optionIndex = await evaluate(`(() => {
    const select = document.querySelector(${JSON.stringify(selector)});
    return [...select.options].findIndex((option) => option.value === ${JSON.stringify(value)});
  })()`);
  assert.ok(optionIndex >= 0, `Option absente de ${selector}: ${value}`);
  await click(selector);
  await press('Home');
  for (let index = 0; index < optionIndex; index += 1) await press('ArrowDown');
  await press('Enter');
  await press('Tab');
  const selected = await evaluate(`document.querySelector(${JSON.stringify(selector)}).value`);
  assert.equal(selected, value, `Sélection clavier non appliquée dans ${selector}`);
  return selected;
}

async function replaceNumberInput(selector, value) {
  await click(selector);
  const minimum = await evaluate(`Number(document.querySelector(${JSON.stringify(selector)}).min || 0)`);
  for (let index = 0; index < 16; index += 1) await press('ArrowDown', 'ArrowDown', { holdMs: 18 });
  for (let entered = minimum; entered < Number(value); entered += 1) await press('ArrowUp', 'ArrowUp', { holdMs: 18 });
  await press('Tab');
  const entered = await evaluate(`document.querySelector(${JSON.stringify(selector)}).value`);
  assert.equal(entered, String(value), `Valeur clavier non appliquée dans ${selector}`);
  return entered;
}

async function capture(name) {
  const shot = await command('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false
  });
  const bytes = Buffer.from(shot.data, 'base64');
  await writeFile(resolve(outputDir, name), bytes);
  report.screenshots.push({ name, bytes: bytes.length });
  return name;
}

async function strategicFingerprint() {
  return evaluate(`(() => {
    const save = globalThis.__ATF_V51__.saveSystem.data;
    return structuredClone({
      clock: save.clock,
      worldId: save.worldId,
      campaignId: save.campaignId,
      player: save.player,
      crew: save.crew,
      hubSystems: save.hub?.systems,
      galaxy: save.galaxy,
      strategy: save.strategy,
      narrativeArchives: save.narrativeArchives,
      alphaBravoDoctrine: save.alphaBravoDoctrine,
      alienSurvivalSystems: save.alienSurvivalSystems,
      editor: save.editor,
      memorial: save.memorial,
      statistics: save.statistics
    });
  })()`);
}

async function physicalState() {
  return evaluate(`(() => {
    const runtime = globalThis.__ATF_BIOFORGE_V80__.runtime;
    const snapshot = runtime.getBioforgeSnapshotV80();
    return {
      x: runtime.player?.x,
      y: runtime.player?.y,
      grounded: runtime.player?.grounded,
      facing: runtime.player?.facing,
      phase: snapshot.phase,
      transferStage: snapshot.transferStage,
      openDoors: snapshot.doors.filter((door) => door.open).map((door) => door.id),
      lockedDoors: snapshot.doors.filter((door) => door.locked).map((door) => door.id)
    };
  })()`);
}

async function actionVisibility() {
  return evaluate(`(() => {
    const inspect = (selector) => {
      const element = document.querySelector(selector);
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      const visible = !element.hidden && style.display !== 'none' && style.visibility !== 'hidden'
        && Number(style.opacity) > 0 && box.width > 0 && box.height > 0;
      const x = box.left + box.width / 2;
      const y = box.top + box.height / 2;
      const hit = visible ? document.elementFromPoint(x, y) : null;
      return {
        hidden: element.hidden,
        disabled: Boolean(element.disabled),
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        visible,
        centerHit: visible ? hit === element || element.contains(hit) : false,
        rect: { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height }
      };
    };
    const snapshot = globalThis.__ATF_BIOFORGE_V80__.runtime.getBioforgeSnapshotV80();
    return {
      phase: snapshot.phase,
      running: snapshot.running,
      sessionActive: document.querySelector('#bioforge-ui-v80').dataset.sessionActive,
      start: inspect('#bioforge-start-v80'),
      purge: inspect('#bioforge-purge-v80'),
      return: inspect('#bioforge-return-v80')
    };
  })()`);
}

try {
  const versionResponse = await fetch(`${endpoint}/json/version`);
  if (!versionResponse.ok) throw new Error(`Endpoint CDP indisponible: HTTP ${versionResponse.status}`);
  const browserVersion = await versionResponse.json();
  socket = new WebSocket(browserVersion.webSocketDebuggerUrl);
  await new Promise((resolveSocket, rejectSocket) => {
    socket.addEventListener('open', resolveSocket, { once: true });
    socket.addEventListener('error', rejectSocket, { once: true });
  });

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const request = pending.get(message.id);
      pending.delete(message.id);
      message.error
        ? request.reject(new Error(message.error.message))
        : request.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') {
      exceptions.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    }
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      consoleErrors.push(message.params.args.map((arg) => arg.value || arg.description || arg.type).join(' '));
    }
    if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
      logErrors.push(message.params.entry.text);
    }
    if (message.method === 'Network.loadingFailed' && !message.params.canceled) {
      failedRequests.push({
        type: message.params.type,
        error: message.params.errorText,
        url: message.params.blockedReason || null
      });
    }
    if (message.method === 'Network.responseReceived') {
      const response = message.params.response;
      const entry = { status: response.status, url: response.url, mimeType: response.mimeType };
      if (response.status >= 400) httpErrors.push(entry);
      if (response.url.includes('/assets/openai/bioforge/v80/')) bioforgeResponses.push(entry);
    }
  });

  ({ browserContextId } = await command('Target.createBrowserContext', {}, { browser: true }));
  ({ targetId } = await command('Target.createTarget', {
    url: 'about:blank', browserContextId
  }, { browser: true }));
  ({ sessionId: pageSessionId } = await command('Target.attachToTarget', {
    targetId, flatten: true
  }, { browser: true }));

  await command('Page.enable');
  await command('Runtime.enable');
  await command('Network.enable');
  await command('Log.enable');
  await command('Network.setBypassServiceWorker', { bypass: true });
  await command('Network.setCacheDisabled', { cacheDisabled: true });
  await command('Emulation.setDeviceMetricsOverride', {
    width: 1280, height: 720, screenWidth: 1280, screenHeight: 720,
    deviceScaleFactor: 1, mobile: false
  });
  await command('Emulation.setTouchEmulationEnabled', { enabled: false });
  await command('Storage.clearDataForOrigin', {
    origin: baseUrl.origin,
    storageTypes: 'all'
  });

  const navigationUrl = new URL(baseUrl.href);
  navigationUrl.searchParams.set('qa', `bioforge-v80-${targetKind}-${Date.now()}`);
  await command('Page.navigate', { url: navigationUrl.href });
  await until(
    `Boolean(globalThis.__ATF_V51__ && globalThis.__ATF_V61__ && globalThis.__ATF_BIOFORGE_V80__ && !document.querySelector('#boot'))`,
    'boot V80',
    45000
  );

  report.checks.pageHealth = await evaluate(`(() => ({
    title: document.title,
    release: document.querySelector('meta[name="atf-release"]')?.content || null,
    bodyTextLength: document.body.innerText.trim().length,
    overlay: Boolean(document.querySelector('[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay')),
    bioforgeCss: [...document.styleSheets].some((sheet) => String(sheet.href || '').includes('bioforge-v80.css'))
  }))()`);
  assert.ok(report.checks.pageHealth.bodyTextLength > 100, 'Shell HTML vide ou incomplet.');
  assert.equal(report.checks.pageHealth.overlay, false, 'Overlay d’erreur détecté au boot.');
  assert.equal(report.checks.pageHealth.bioforgeCss, true, 'bioforge-v80.css non chargé.');

  await evaluate(`(() => {
    globalThis.__ATF_V80_BROWSER_EVENTS__ = [];
    const runtime = globalThis.__ATF_BIOFORGE_V80__.runtime;
    if (!runtime.__bioforgeBrowserQaWrappedV80) {
      const forward = runtime.onEvent;
      runtime.onEvent = (event) => {
        globalThis.__ATF_V80_BROWSER_EVENTS__.push(structuredClone(event));
        forward?.(event);
      };
      runtime.__bioforgeBrowserQaWrappedV80 = true;
    }
    globalThis.__ATF_V61__.titleScreen.hide();
    document.querySelector('#app').hidden = false;
    globalThis.__ATF_BIOFORGE_V80__.open();
    return true;
  })()`);

  const initial = await until(`(() => {
    const api = globalThis.__ATF_BIOFORGE_V80__;
    const runtime = api.runtime.getBioforgeSnapshotV80();
    const root = document.querySelector('#bioforge-ui-v80');
    if (!root.classList.contains('active') || runtime.assets.ready !== 6) return null;
    return {
      activePanel: document.querySelector('.view.active')?.dataset.panel,
      bioforgeMode: document.documentElement.classList.contains('bioforge-mode'),
      runtime,
      uiPhase: root.dataset.phase,
      profileCount: document.querySelector('#bioforge-profile-v80').options.length,
      canvasFocusTarget: document.querySelector('#bioforge-canvas-v80').tabIndex,
      preview: {
        src: document.querySelector('#bioforge-profile-preview-v80').getAttribute('src'),
        alt: document.querySelector('#bioforge-profile-preview-v80').alt
      }
    };
  })()`, 'niveau et six assets BIOFORGE prêts', 45000);
  assert.equal(initial.activePanel, 'bioforge');
  assert.equal(initial.bioforgeMode, true);
  assert.equal(initial.runtime.prepared, true);
  assert.equal(initial.runtime.running, false);
  assert.equal(initial.runtime.phase, 'configuration');
  assert.equal(initial.runtime.levelValidation.valid, true);
  assert.equal(initial.runtime.levelValidation.roomCount, 6);
  assert.equal(initial.runtime.levelValidation.doorCount, 5);
  assert.equal(initial.runtime.levelValidation.spawnCount, 12);
  assert.equal(initial.runtime.assets.declared, 6);
  assert.equal(initial.runtime.assets.ready, 6);
  assert.deepEqual(initial.runtime.assets.missing, []);
  assert.equal(initial.runtime.assets.proceduralFallback, false);
  assert.equal(initial.runtime.assets.productionFallback, false);
  assert.equal(initial.profileCount, 11);
  assert.equal(initial.canvasFocusTarget, 0);
  report.checks.initial = initial;

  const decodedAssets = await evaluate(`(() => {
    const runtime = globalThis.__ATF_BIOFORGE_V80__.runtime;
    return [...runtime.images.values()]
      .filter((image) => String(image.currentSrc || image.src || '').includes('/assets/openai/bioforge/v80/'))
      .map((image) => {
        const url = new URL(image.currentSrc || image.src, location.href);
        return { path: url.pathname, complete: image.complete, width: image.naturalWidth, height: image.naturalHeight };
      })
      .sort((left, right) => left.path.localeCompare(right.path));
  })()`);
  assert.equal(decodedAssets.length, 6, `Nombre d’images BIOFORGE décodées incorrect: ${JSON.stringify(decodedAssets)}`);
  for (const asset of decodedAssets) {
    const expected = expectedBioforgeAssets[asset.path];
    assert.ok(expected, `Image BIOFORGE inattendue: ${asset.path}`);
    assert.equal(asset.complete, true, `Image non décodée: ${asset.path}`);
    assert.deepEqual([asset.width, asset.height], expected, `Dimensions inattendues: ${asset.path}`);
  }
  report.checks.decodedAssets = decodedAssets;

  const canvasAudit = await evaluate(`(() => {
    const runtime = globalThis.__ATF_BIOFORGE_V80__.runtime;
    runtime.draw();
    const canvas = document.querySelector('#bioforge-canvas-v80');
    const rect = canvas.getBoundingClientRect();
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    const colors = new Set();
    let litSamples = 0;
    for (let y = 8; y < canvas.height; y += 32) {
      for (let x = 8; x < canvas.width; x += 32) {
        const offset = (y * canvas.width + x) * 4;
        const r = pixels[offset], g = pixels[offset + 1], b = pixels[offset + 2], a = pixels[offset + 3];
        colors.add([r, g, b, a].join(':'));
        if (a && r + g + b > 20) litSamples += 1;
      }
    }
    return {
      intrinsic: { width: canvas.width, height: canvas.height },
      css: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
      sampledColors: colors.size,
      litSamples
    };
  })()`);
  assert.deepEqual(canvasAudit.intrinsic, { width: 1280, height: 720 });
  assert.ok(canvasAudit.css.width >= 1260 && canvasAudit.css.height >= 700, `Canvas desktop trop petit: ${JSON.stringify(canvasAudit)}`);
  assert.ok(canvasAudit.sampledColors >= 18 && canvasAudit.litSamples >= 100, `Canvas sans rendu visuel substantiel: ${JSON.stringify(canvasAudit)}`);
  report.checks.canvas = canvasAudit;
  await capture('01-bioforge-configuration-desktop.png');

  const strategicBefore = await strategicFingerprint();
  await selectWithKeyboard('#bioforge-profile-v80', 'enemy-002-facehugger');
  await replaceNumberInput('#bioforge-quantity-v80', 2);
  const selection = await until(`(() => {
    const profile = document.querySelector('#bioforge-profile-v80');
    const quantity = document.querySelector('#bioforge-quantity-v80');
    const preview = document.querySelector('#bioforge-profile-preview-v80');
    const thumbnail = document.querySelector('#bioforge-profile-thumbnail-v80');
    const thumbnailStyle = getComputedStyle(thumbnail);
    const thumbnailRect = thumbnail.getBoundingClientRect();
    return profile.value === 'enemy-002-facehugger' && quantity.value === '2' && preview.complete && preview.naturalWidth > 0
      ? { profileId: profile.value, quantity: Number(quantity.value), maximum: Number(quantity.max),
          preview: { src: preview.getAttribute('src'), width: preview.naturalWidth, height: preview.naturalHeight, alt: preview.alt },
          thumbnail: {
            backgroundImage: thumbnailStyle.backgroundImage,
            backgroundSize: thumbnailStyle.backgroundSize,
            backgroundPosition: thumbnailStyle.backgroundPosition,
            atlasColumns: Number(thumbnail.dataset.atlasColumns),
            atlasRows: Number(thumbnail.dataset.atlasRows),
            atlasFrame: Number(thumbnail.dataset.atlasFrame),
            width: thumbnailRect.width,
            height: thumbnailRect.height
          },
          cost: document.querySelector('#bioforge-cost-v80').textContent.trim() }
      : null;
  })()`, 'sélection Facehugger x2');
  assert.equal(selection.profileId, 'enemy-002-facehugger');
  assert.equal(selection.quantity, 2);
  assert.ok(selection.maximum >= 2);
  assert.match(selection.preview.alt, /Facehugger/i);
  assert.match(selection.thumbnail.backgroundImage, /enemy-002-facehugger/i);
  assert.equal(selection.thumbnail.backgroundSize, '400% 800%');
  assert.equal(selection.thumbnail.backgroundPosition, '0% 0%');
  assert.deepEqual(
    [selection.thumbnail.atlasColumns, selection.thumbnail.atlasRows, selection.thumbnail.atlasFrame],
    [4, 8, 0]
  );
  assert.ok(selection.thumbnail.width >= 90 && selection.thumbnail.height >= 74);
  assert.match(selection.cost, /CHARGE\s+2\/12/i);
  report.checks.selection = selection;
  const configurationActions = await actionVisibility();
  assert.equal(configurationActions.sessionActive, 'false');
  assert.ok(configurationActions.start.visible && configurationActions.start.centerHit && !configurationActions.start.disabled);
  assert.ok(configurationActions.return.visible && configurationActions.return.centerHit && !configurationActions.return.disabled);
  assert.ok(configurationActions.purge.visible && configurationActions.purge.centerHit && configurationActions.purge.disabled);
  report.checks.actionVisibility = { configuration: configurationActions };

  await click('#bioforge-start-v80');
  const started = await until(`(() => {
    const runtime = globalThis.__ATF_BIOFORGE_V80__.runtime;
    const snapshot = runtime.getBioforgeSnapshotV80();
    return snapshot.running && snapshot.phase === 'configuration'
      ? { snapshot, focusId: document.activeElement?.id || null,
          profileDisabled: document.querySelector('#bioforge-profile-v80').disabled,
          quantityDisabled: document.querySelector('#bioforge-quantity-v80').disabled }
      : null;
  })()`, 'session Facehugger x2 démarrée');
  assert.equal(started.snapshot.profileId, 'enemy-002-facehugger');
  assert.equal(started.snapshot.quantity, 2);
  assert.equal(started.focusId, 'bioforge-canvas-v80');
  assert.equal(started.profileDisabled, true);
  assert.equal(started.quantityDisabled, true);
  report.checks.started = started;
  const activeActions = await actionVisibility();
  assert.equal(activeActions.sessionActive, 'true');
  assert.equal(activeActions.start.visible, false);
  assert.equal(activeActions.return.visible, false);
  assert.ok(activeActions.purge.visible && activeActions.purge.centerHit && !activeActions.purge.disabled);
  report.checks.actionVisibility.active = activeActions;
  await capture('02-bioforge-session-armed-desktop.png');

  const groundY = await evaluate(`globalThis.__ATF_BIOFORGE_V80__.runtime.player.y`);
  await press('Space', ' ', { holdMs: 85 });
  const jump = await until(`(() => {
    const player = globalThis.__ATF_BIOFORGE_V80__.runtime.player;
    return player.y < ${Number(groundY) - 12} ? { y: player.y, grounded: player.grounded } : null;
  })()`, 'saut clavier réel', 2500);
  assert.equal(jump.grounded, false);
  await until(`(() => {
    const player = globalThis.__ATF_BIOFORGE_V80__.runtime.player;
    return player.grounded && player.y >= ${Number(groundY) - 1};
  })()`, 'atterrissage après saut', 3500);
  report.checks.jump = { groundY, ...jump };

  const transfer = [];
  await holdUntil('KeyD', 'd', `globalThis.__ATF_BIOFORGE_V80__.runtime.player.x >= 345`, 'approche du sas A');
  await press('KeyE', 'e');
  await until(`globalThis.__ATF_BIOFORGE_V80__.runtime.getBioforgeSnapshotV80().transferStage === 1`, 'ouverture du sas A');
  transfer.push(await physicalState());

  await holdUntil('KeyD', 'd', `globalThis.__ATF_BIOFORGE_V80__.runtime.player.x >= 555`, 'traversée du sas A');
  await press('KeyE', 'e');
  await until(`globalThis.__ATF_BIOFORGE_V80__.runtime.getBioforgeSnapshotV80().transferStage === 2`, 'ouverture du sas B');
  transfer.push(await physicalState());

  await holdUntil('KeyD', 'd', `globalThis.__ATF_BIOFORGE_V80__.runtime.player.x >= 1020`, 'approche physique de l’imprimante');
  await press('KeyE', 'e');
  await until(`globalThis.__ATF_BIOFORGE_V80__.runtime.getBioforgeSnapshotV80().transferStage === 3`, 'armement de l’imprimante');
  transfer.push(await physicalState());
  await capture('03-bioforge-printer-armed-desktop.png');

  await holdUntil(
    'KeyD',
    'd',
    `globalThis.__ATF_BIOFORGE_V80__.runtime.getBioforgeSnapshotV80().phase === 'sealing'`,
    'entrée physique dans l’arène et scellement',
    8000
  );
  transfer.push(await physicalState());
  assert.deepEqual(transfer.map((entry) => entry.transferStage), [1, 2, 3, 4]);
  assert.deepEqual(transfer[0].openDoors, ['control-seal']);
  assert.deepEqual(transfer[1].openDoors, ['inner-interlock']);
  assert.deepEqual(transfer[2].openDoors, ['arena-containment']);
  assert.equal(transfer[3].phase, 'sealing');
  assert.ok(transfer[3].x >= 1300, `Joueur hors arène après transfert: ${JSON.stringify(transfer[3])}`);
  assert.ok(transfer[0].x < transfer[1].x && transfer[1].x < transfer[2].x && transfer[2].x < transfer[3].x);
  report.checks.physicalTransfer = transfer;

  const combat = await until(`(() => {
    const runtime = globalThis.__ATF_BIOFORGE_V80__.runtime;
    const snapshot = runtime.getBioforgeSnapshotV80();
    if (snapshot.phase !== 'combat' || snapshot.printed !== 2 || snapshot.alive !== 2) return null;
    return {
      snapshot,
      player: { x: runtime.player.x, y: runtime.player.y, health: runtime.player.health, armor: runtime.player.armor,
        ammo: runtime.player.ammo, shots: runtime.player.shots || 0, facing: runtime.player.facing },
      specimens: runtime.enemies.map((enemy) => ({
        id: enemy.id, profileId: enemy.profileId, x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h,
        facing: enemy.facing, alive: enemy.alive, contained: enemy.bioforgeContainedV80,
        boss: enemy.isBoss, royal: enemy.isRoyal, keyCarrier: enemy.keyCarrier
      }))
    };
  })()`, 'impression séquentielle de deux Facehuggers et combat', 12000);
  assert.equal(combat.snapshot.isolation.secure, true);
  assert.equal(combat.snapshot.isolation.exitLocked, true);
  assert.equal(combat.specimens.length, 2);
  assert.ok(combat.specimens.every((enemy) => enemy.profileId === 'enemy-002-facehugger'));
  assert.ok(combat.specimens.every((enemy) => enemy.alive && enemy.contained && !enemy.boss && !enemy.royal && !enemy.keyCarrier));
  assert.ok(combat.specimens.every((enemy) => enemy.facing === -1), `Orientation ennemie incohérente: ${JSON.stringify(combat.specimens)}`);
  report.checks.combat = combat;

  const actorReadability = await evaluate(`(async () => {
    const { BIOFORGE_FOREGROUND_ALPHA_V80 } = await import('/src/bioforge-runtime-v80.js');
    const runtime = globalThis.__ATF_BIOFORGE_V80__.runtime;
    const canvas = document.querySelector('#bioforge-canvas-v80');
    const ctx = canvas.getContext('2d');
    const cameraX = Number(runtime.camera?.x || 0);
    const actorRects = [
      {
        id: 'player',
        kind: 'player',
        x: runtime.player.x + runtime.player.w / 2 - 73 / 2 - cameraX,
        y: runtime.player.y + runtime.player.h - 98 * (240 / 256),
        w: 73,
        h: 98
      },
      ...runtime.enemies.filter((enemy) => enemy.alive).map((enemy) => ({
        id: enemy.id,
        kind: 'enemy',
        x: enemy.x + enemy.w / 2 - 112 / 2 - cameraX,
        y: enemy.y + enemy.h - 72 * (240 / 256),
        w: 112,
        h: 72
      }))
    ];
    const paintOrder = [];
    const foregroundPainter = runtime.drawBioforgeForegroundV80;
    const actorPainter = runtime.drawBioforgeActorsV80;
    runtime.drawBioforgeForegroundV80 = function auditedForeground(context) {
      paintOrder.push('foreground');
      return foregroundPainter.call(this, context);
    };
    runtime.drawBioforgeActorsV80 = function auditedActors(context) {
      paintOrder.push('actors');
      return actorPainter.call(this, context);
    };
    runtime.draw();
    runtime.drawBioforgeForegroundV80 = foregroundPainter;
    runtime.drawBioforgeActorsV80 = actorPainter;
    const withActors = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    runtime.drawBioforgeActorsV80 = () => {};
    runtime.draw();
    const withoutActors = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    runtime.drawBioforgeActorsV80 = actorPainter;
    runtime.draw();
    const samples = actorRects.map((rect) => {
      const left = Math.max(0, Math.floor(rect.x - 10));
      const top = Math.max(0, Math.floor(rect.y - 10));
      const right = Math.min(canvas.width, Math.ceil(rect.x + rect.w + 10));
      const bottom = Math.min(canvas.height, Math.ceil(rect.y + rect.h + 10));
      let changedPixels = 0;
      let maxChannelDelta = 0;
      let cumulativeDelta = 0;
      for (let y = top; y < bottom; y += 1) {
        for (let x = left; x < right; x += 1) {
          const offset = (y * canvas.width + x) * 4;
          const delta = Math.abs(withActors[offset] - withoutActors[offset])
            + Math.abs(withActors[offset + 1] - withoutActors[offset + 1])
            + Math.abs(withActors[offset + 2] - withoutActors[offset + 2])
            + Math.abs(withActors[offset + 3] - withoutActors[offset + 3]);
          if (delta > 12) changedPixels += 1;
          cumulativeDelta += delta;
          maxChannelDelta = Math.max(maxChannelDelta,
            Math.abs(withActors[offset] - withoutActors[offset]),
            Math.abs(withActors[offset + 1] - withoutActors[offset + 1]),
            Math.abs(withActors[offset + 2] - withoutActors[offset + 2]),
            Math.abs(withActors[offset + 3] - withoutActors[offset + 3]));
        }
      }
      const sampledPixels = Math.max(0, right - left) * Math.max(0, bottom - top);
      return {
        ...rect,
        clippedRect: { left, top, right, bottom },
        sampledPixels,
        changedPixels,
        changedRatio: sampledPixels ? changedPixels / sampledPixels : 0,
        maxChannelDelta,
        averageRgbaDelta: sampledPixels ? cumulativeDelta / sampledPixels : 0
      };
    });
    return {
      method: 'Différence de pixels d’une même frame avec/sans compositeur d’acteurs, dans leurs rectangles écran; ne juge pas la qualité artistique.',
      foregroundAlpha: BIOFORGE_FOREGROUND_ALPHA_V80,
      paintOrder,
      samples
    };
  })()`);
  assert.equal(actorReadability.foregroundAlpha, 0.34);
  assert.ok(actorReadability.paintOrder.indexOf('foreground') >= 0);
  assert.ok(actorReadability.paintOrder.indexOf('actors') > actorReadability.paintOrder.indexOf('foreground'));
  assert.equal(actorReadability.samples.length, 3);
  assert.ok(actorReadability.samples.every((sample) => sample.sampledPixels > 0
    && sample.changedPixels >= 24 && sample.changedRatio >= 0.002 && sample.maxChannelDelta >= 12),
  `Contribution visuelle d’acteur insuffisante: ${JSON.stringify(actorReadability)}`);
  report.checks.actorReadability = actorReadability;
  await capture('04-bioforge-combat-desktop.png');

  const beforeShot = await evaluate(`(() => {
    const player = globalThis.__ATF_BIOFORGE_V80__.runtime.player;
    return { ammo: player.ammo, shots: player.shots || 0 };
  })()`);
  await click('#bioforge-canvas-v80');
  const afterShot = await until(`(() => {
    const runtime = globalThis.__ATF_BIOFORGE_V80__.runtime;
    const player = runtime.player;
    return (player.shots || 0) > ${Number(beforeShot.shots)}
      ? { ammo: player.ammo, shots: player.shots || 0, bullets: runtime.bullets.length }
      : null;
  })()`, 'tir réel pointerdown', 2500);
  assert.equal(afterShot.shots, beforeShot.shots + 1);
  assert.equal(afterShot.ammo, beforeShot.ammo - 1);
  report.checks.realShot = { before: beforeShot, after: afterShot };

  const acceleratedResolution = await evaluate(`(() => {
    const runtime = globalThis.__ATF_BIOFORGE_V80__.runtime;
    const qa = runtime.getBioforgeQaHooksV80();
    const live = runtime.enemies.filter((enemy) => enemy.alive);
    const confinementProbe = live[0]
      ? { id: live[0].id, result: qa.attemptEscape(live[0].id, -900) }
      : null;
    const killed = runtime.enemies.filter((enemy) => enemy.alive).map((enemy) => ({ id: enemy.id, applied: qa.kill(enemy.id) }));
    qa.step(0.016);
    return {
      confinementProbe,
      killed,
      arenaX: runtime.bioforgeLevelV80.arenaBounds.x,
      snapshot: runtime.getBioforgeSnapshotV80()
    };
  })()`);
  assert.ok(acceleratedResolution.confinementProbe, 'Aucun spécimen disponible pour le test de confinement.');
  assert.ok(acceleratedResolution.confinementProbe.result.x >= acceleratedResolution.arenaX);
  assert.ok(acceleratedResolution.killed.length >= 1 && acceleratedResolution.killed.every((entry) => entry.applied));
  assert.equal(acceleratedResolution.snapshot.phase, 'result');
  assert.equal(acceleratedResolution.snapshot.isolation.secure, true);
  report.checks.acceleratedResolution = acceleratedResolution;
  await capture('05-bioforge-result-desktop.png');

  const returnedState = await until(`(() => {
    const api = globalThis.__ATF_BIOFORGE_V80__;
    const runtime = api.runtime.getBioforgeSnapshotV80();
    const saved = api.snapshot().state;
    return runtime.phase === 'return' && !runtime.running
      ? { runtime, saved, ui: {
          phase: document.querySelector('#bioforge-ui-v80').dataset.phase,
          returnDisabled: document.querySelector('#bioforge-return-v80').disabled,
          purgeDisabled: document.querySelector('#bioforge-purge-v80').disabled,
          status: document.querySelector('#bioforge-status-v80').textContent.trim()
        } }
      : null;
  })()`, 'purge automatique et retour autorisé', 5000);
  assert.equal(returnedState.runtime.printed, 2);
  assert.equal(returnedState.runtime.kills, 2);
  assert.equal(returnedState.runtime.alive, 0);
  assert.equal(returnedState.runtime.isolation.secure, true);
  assert.equal(returnedState.runtime.isolation.exitLocked, false);
  assert.equal(returnedState.runtime.lastPurge.completed, true);
  assert.deepEqual(returnedState.runtime.entities, {
    enemies: 0,
    bullets: 0,
    hostileProjectiles: 0,
    particles: 0,
    drops: 0,
    hazards: 0,
    timers: 0
  });
  assert.equal(returnedState.saved.activeSession.phase, 'return');
  assert.equal(returnedState.saved.activeSession.profileId, 'enemy-002-facehugger');
  assert.equal(returnedState.saved.activeSession.quantity, 2);
  assert.equal(returnedState.ui.phase, 'return');
  assert.equal(returnedState.ui.returnDisabled, false);
  assert.equal(returnedState.ui.purgeDisabled, true);
  report.checks.atomicPurge = returnedState;
  const returnActions = await actionVisibility();
  assert.equal(returnActions.sessionActive, 'false');
  assert.ok(returnActions.start.visible && returnActions.start.centerHit && !returnActions.start.disabled);
  assert.ok(returnActions.return.visible && returnActions.return.centerHit && !returnActions.return.disabled);
  assert.ok(returnActions.purge.visible && returnActions.purge.centerHit && returnActions.purge.disabled);
  report.checks.actionVisibility.return = returnActions;
  await capture('06-bioforge-purge-complete-desktop.png');

  const strategicAfter = await strategicFingerprint();
  assert.deepEqual(
    strategicAfter,
    strategicBefore,
    'BIOFORGE a modifié la campagne, l’équipage, les ressources, les systèmes du hub ou les statistiques.'
  );
  report.checks.strategicIsolation = { unchanged: true, fingerprint: strategicAfter };

  await click('#bioforge-return-v80');
  const actualReturn = await until(`(() => {
    const activePanel = document.querySelector('.view.active')?.dataset.panel;
    const hub = globalThis.__ATF_HUB__.getSnapshot();
    return activePanel === 'hub' && hub.running
      ? { activePanel, hubRunning: hub.running, bioforgeMode: document.documentElement.classList.contains('bioforge-mode') }
      : null;
  })()`, 'bouton réel retour vers le hub');
  assert.equal(actualReturn.bioforgeMode, false);
  report.checks.actualReturn = actualReturn;
  const primaryEventTypes = await evaluate(`globalThis.__ATF_V80_BROWSER_EVENTS__.map((event) => event.type)`);
  assert.equal(primaryEventTypes.filter((type) => type === 'bioforge-airlock-step').length, 3);
  assert.equal(primaryEventTypes.filter((type) => type === 'bioforge-specimen-printed').length, 2);
  report.checks.primaryEventTypes = primaryEventTypes;
  const primaryCombatTransition = await evaluate(`(() => {
    const printed = globalThis.__ATF_V80_BROWSER_EVENTS__.filter((event) => event.type === 'bioforge-specimen-printed');
    return printed.at(-1) || null;
  })()`);
  assert.equal(primaryCombatTransition.phase, 'combat');
  assert.equal(primaryCombatTransition.remaining, 0);
  report.checks.primaryCombatTransition = primaryCombatTransition;

  await command('Emulation.setDeviceMetricsOverride', {
    width: 390, height: 844, screenWidth: 390, screenHeight: 844,
    deviceScaleFactor: 1, mobile: true
  });
  await command('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await evaluate(`globalThis.__ATF_BIOFORGE_V80__.open()`);
  await until(`document.querySelector('#bioforge-ui-v80').classList.contains('active')`, 'réouverture mobile BIOFORGE');
  await evaluate(`new Promise((resolveFrame) => requestAnimationFrame(() => requestAnimationFrame(resolveFrame)))`);

  const mobile = await evaluate(`(() => {
    const root = document.querySelector('#bioforge-ui-v80');
    const shell = document.querySelector('.bioforge-level-shell');
    const canvas = document.querySelector('#bioforge-canvas-v80');
    const terminal = document.querySelector('.bioforge-terminal-v80');
    const controls = document.querySelector('.bioforge-touch-v80');
    const rect = (element) => {
      const box = element.getBoundingClientRect();
      return { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height };
    };
    const buttons = [...controls.querySelectorAll('button')].map((button) => {
      const box = button.getBoundingClientRect();
      const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return { id: button.id || null, label: button.getAttribute('aria-label'),
        box: rect(button), hit: hit === button || button.contains(hit) };
    });
    return {
      viewport: { width: innerWidth, height: innerHeight },
      phase: root.dataset.phase,
      root: rect(root), shell: rect(shell), canvas: rect(canvas), terminal: rect(terminal), controls: rect(controls), buttons,
      controlDisplay: getComputedStyle(controls).display,
      terminalOverflowY: getComputedStyle(terminal).overflowY,
      terminalScrollHeight: terminal.scrollHeight,
      terminalClientHeight: terminal.clientHeight,
      horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      assets: globalThis.__ATF_BIOFORGE_V80__.runtime.getBioforgeSnapshotV80().assets
    };
  })()`);
  assert.deepEqual(mobile.viewport, { width: 390, height: 844 });
  assert.equal(mobile.phase, 'return');
  assert.equal(mobile.controlDisplay, 'grid');
  assert.equal(mobile.buttons.length, 7);
  assert.ok(mobile.shell.left >= -1 && mobile.shell.right <= 391 && mobile.shell.top >= 0 && mobile.shell.bottom <= 844);
  assert.ok(mobile.canvas.left >= -1 && mobile.canvas.right <= 391 && mobile.canvas.width >= 380);
  assert.ok(mobile.terminal.left >= 0 && mobile.terminal.right <= 390 && mobile.terminal.top >= 0 && mobile.terminal.bottom <= 844);
  assert.ok(mobile.controls.left >= 0 && mobile.controls.right <= 390 && mobile.controls.top >= 0 && mobile.controls.bottom <= 844);
  assert.ok(mobile.buttons.every((button) => button.box.left >= 0 && button.box.right <= 390
    && button.box.top >= 0 && button.box.bottom <= 844 && button.box.width >= 36 && button.box.height >= 36 && button.hit));
  assert.ok(mobile.horizontalOverflow <= 1, `Débordement horizontal mobile: ${mobile.horizontalOverflow}px`);
  if (mobile.terminalScrollHeight > mobile.terminalClientHeight) assert.match(mobile.terminalOverflowY, /auto|scroll/);
  assert.equal(mobile.assets.ready, 6);
  assert.deepEqual(mobile.assets.missing, []);
  report.checks.mobile390x844 = mobile;
  await capture('07-bioforge-return-mobile-390x844.png');

  await tap('#bioforge-start-v80');
  const touchStarted = await until(`(() => {
    const runtime = globalThis.__ATF_BIOFORGE_V80__.runtime;
    const snapshot = runtime.getBioforgeSnapshotV80();
    return snapshot.running && snapshot.phase === 'configuration'
      ? { x: runtime.player.x, profileId: snapshot.profileId, quantity: snapshot.quantity }
      : null;
  })()`, 'démarrage tactile d’une session de contrôle');
  assert.equal(touchStarted.profileId, 'enemy-002-facehugger');
  assert.equal(touchStarted.quantity, 2);
  await touchHoldUntil(
    '[data-bioforge-key="KeyD"]',
    `globalThis.__ATF_BIOFORGE_V80__.runtime.player.x >= 345`,
    'déplacement tactile jusqu’au sas A'
  );
  const touchMoved = await physicalState();
  assert.ok(touchMoved.x >= touchStarted.x + 150, `Déplacement tactile trop faible: ${JSON.stringify({ touchStarted, touchMoved })}`);
  await tap('#bioforge-interact-v80');
  const touchInteracted = await until(`(() => {
    const snapshot = globalThis.__ATF_BIOFORGE_V80__.runtime.getBioforgeSnapshotV80();
    return snapshot.transferStage === 1
      ? { transferStage: snapshot.transferStage, openDoors: snapshot.doors.filter((door) => door.open).map((door) => door.id) }
      : null;
  })()`, 'interaction tactile avec le sas A');
  assert.deepEqual(touchInteracted.openDoors, ['control-seal']);
  await tap('#bioforge-purge-v80');
  const touchPurged = await until(`(() => {
    const snapshot = globalThis.__ATF_BIOFORGE_V80__.runtime.getBioforgeSnapshotV80();
    return snapshot.phase === 'return' && !snapshot.running ? snapshot : null;
  })()`, 'purge tactile de la session de contrôle');
  assert.equal(touchPurged.lastPurge.completed, true);
  assert.deepEqual(touchPurged.entities, {
    enemies: 0, bullets: 0, hostileProjectiles: 0, particles: 0, drops: 0, hazards: 0, timers: 0
  });
  report.checks.touchContract = {
    input: 'CDP touchStart/touchEnd réels sur les contrôles expédiés',
    started: touchStarted,
    moved: touchMoved,
    interacted: touchInteracted,
    purge: touchPurged
  };

  const budgetProbe = await evaluate(`(() => {
    const runtime = globalThis.__ATF_BIOFORGE_V80__.runtime;
    const start = runtime.start({
      configuration: { profileId: 'enemy-002-facehugger', quantity: 12 },
      resumeState: runtime.bioforgeRootV80,
      autoLoop: false,
      seed: 80120
    });
    const controlDoor = runtime.doors.find((door) => door.id === 'control-seal');
    const innerDoor = runtime.doors.find((door) => door.id === 'inner-interlock');
    const printer = runtime.bioforgeLevelV80.stations.find((station) => station.type === 'printer');
    Object.assign(runtime.player, { x: controlDoor.x - runtime.player.w - 10, y: 528, vx: 0, vy: 0, grounded: true });
    const transferA = runtime.interact();
    Object.assign(runtime.player, { x: innerDoor.x - runtime.player.w - 45, y: 528, vx: 0, vy: 0, grounded: true });
    const transferB = runtime.interact();
    Object.assign(runtime.player, { x: printer.x - 20, y: 528, vx: 0, vy: 0, grounded: true });
    const transferPrinter = runtime.interact();
    Object.assign(runtime.player, { x: runtime.bioforgeLevelV80.arenaBounds.x + 8, y: 528, vx: 0, vy: 0, grounded: true });
    runtime.update(0.016);
    const qa = runtime.getBioforgeQaHooksV80();
    const advances = [qa.advance()?.event?.type];
    for (let index = 0; index < 12; index += 1) advances.push(qa.advance()?.event?.type);
    runtime.player.health = 1_000_000;
    runtime.player.armor = 1_000_000;
    const beforeFrames = runtime.getBioforgeSnapshotV80();
    const frameCount = 120;
    const measuredAt = performance.now();
    for (let frame = 0; frame < frameCount; frame += 1) runtime.update(1 / 120);
    const elapsedMs = performance.now() - measuredAt;
    const afterFrames = runtime.getBioforgeSnapshotV80();
    const purge = qa.purge('browser-budget-probe');
    const afterPurge = runtime.getBioforgeSnapshotV80();
    return {
      scope: 'simulation logique de 120 updates; positionnement fixture; aucune revendication FPS ou rendu',
      start: { started: start.started, profileId: start.profileId, quantity: start.quantity },
      transfer: { control: transferA, inner: transferB, printer: transferPrinter },
      advances,
      frameCount,
      elapsedMs,
      averageUpdateMs: elapsedMs / frameCount,
      beforeFrames,
      afterFrames,
      purge,
      afterPurge,
      residualReferences: Object.keys(runtime.bioforgeReferencesV80).length
    };
  })()`);
  assert.deepEqual(budgetProbe.start, { started: true, profileId: 'enemy-002-facehugger', quantity: 12 });
  assert.deepEqual(budgetProbe.transfer, { control: true, inner: true, printer: true });
  assert.equal(budgetProbe.advances[0], 'bioforge-printer-ready');
  assert.equal(budgetProbe.advances.filter((type) => type === 'bioforge-specimen-printed').length, 12);
  assert.equal(budgetProbe.beforeFrames.phase, 'combat');
  assert.equal(budgetProbe.beforeFrames.printed, 12);
  assert.equal(budgetProbe.beforeFrames.alive, 12);
  assert.equal(budgetProbe.afterFrames.phase, 'combat');
  assert.equal(budgetProbe.afterFrames.alive, 12);
  assert.equal(budgetProbe.afterFrames.isolation.secure, true);
  assert.ok(Number.isFinite(budgetProbe.elapsedMs) && budgetProbe.elapsedMs >= 0);
  assert.ok(Number.isFinite(budgetProbe.averageUpdateMs) && budgetProbe.averageUpdateMs >= 0);
  assert.equal(budgetProbe.purge.completed, true);
  assert.equal(budgetProbe.afterPurge.phase, 'return');
  assert.deepEqual(budgetProbe.afterPurge.entities, {
    enemies: 0, bullets: 0, hostileProjectiles: 0, particles: 0, drops: 0, hazards: 0, timers: 0
  });
  assert.equal(budgetProbe.residualReferences, 0);
  report.checks.maximumBudget12 = budgetProbe;

  const strategicAfterAllProbes = await strategicFingerprint();
  assert.deepEqual(strategicAfterAllProbes, strategicBefore, 'Les probes tactile/budget ont modifié l’état stratégique.');
  report.checks.strategicIsolationAfterAllProbes = { unchanged: true };

  const eventTypes = await evaluate(`globalThis.__ATF_V80_BROWSER_EVENTS__.map((event) => event.type)`);
  for (const requiredEvent of [
    'bioforge-runtime-ready',
    'bioforge-airlock-step',
    'bioforge-physical-transfer-completed',
    'bioforge-printer-ready',
    'bioforge-specimen-printed',
    'bioforge-session-result',
    'bioforge-purge-started',
    'bioforge-runtime-purged',
    'bioforge-return-ready'
  ]) assert.ok(eventTypes.includes(requiredEvent), `Événement runtime absent: ${requiredEvent}`);
  assert.ok(eventTypes.filter((type) => type === 'bioforge-airlock-step').length >= 7);
  assert.ok(eventTypes.filter((type) => type === 'bioforge-specimen-printed').length >= 14);
  report.checks.eventTypes = eventTypes;

  const responseByPath = new Map();
  for (const response of bioforgeResponses) {
    const path = new URL(response.url).pathname;
    if (!responseByPath.has(path)) responseByPath.set(path, response);
  }
  const assetResponses = [...responseByPath.entries()]
    .map(([path, response]) => ({ path, status: response.status, mimeType: response.mimeType }))
    .sort((left, right) => left.path.localeCompare(right.path));
  assert.equal(assetResponses.length, 6, `Réponses réseau BIOFORGE incomplètes: ${JSON.stringify(assetResponses)}`);
  assert.ok(assetResponses.every((entry) => expectedBioforgeAssets[entry.path] && entry.status === 200 && entry.mimeType === 'image/png'));
  report.checks.assetResponses = assetResponses;

  const meaningfulHttpErrors = httpErrors.filter((entry) => !/\/favicon\.ico(?:\?|$)/i.test(entry.url));
  const meaningfulConsoleErrors = consoleErrors.filter((entry) => !/favicon\.ico/i.test(entry));
  const meaningfulLogErrors = logErrors.filter((entry) => !/favicon\.ico/i.test(entry));
  assert.deepEqual(exceptions, [], `Exceptions navigateur: ${JSON.stringify(exceptions)}`);
  assert.deepEqual(meaningfulConsoleErrors, [], `console.error navigateur: ${JSON.stringify(meaningfulConsoleErrors)}`);
  assert.deepEqual(meaningfulLogErrors, [], `Log.error navigateur: ${JSON.stringify(meaningfulLogErrors)}`);
  assert.deepEqual(failedRequests, [], `Requêtes échouées: ${JSON.stringify(failedRequests)}`);
  assert.deepEqual(meaningfulHttpErrors, [], `Réponses HTTP en erreur: ${JSON.stringify(meaningfulHttpErrors)}`);

  report.exceptions = exceptions;
  report.consoleErrors = meaningfulConsoleErrors;
  report.logErrors = meaningfulLogErrors;
  report.failedRequests = failedRequests;
  report.httpErrors = meaningfulHttpErrors;
  report.ok = true;
  report.finishedAt = new Date().toISOString();
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({
    ok: report.ok,
    target: report.target,
    baseUrl: report.baseUrl,
    screenshots: report.screenshots,
    physicalTransfer: report.checks.physicalTransfer,
    combat: report.checks.combat,
    atomicPurge: report.checks.atomicPurge.runtime,
    strategicIsolation: report.checks.strategicIsolation.unchanged,
    mobile: report.checks.mobile390x844.viewport,
    errors: {
      exceptions: report.exceptions.length,
      console: report.consoleErrors.length,
      log: report.logErrors.length,
      failedRequests: report.failedRequests.length,
      http: report.httpErrors.length
    },
    reportPath
  }, null, 2));
} catch (error) {
  report.ok = false;
  report.finishedAt = new Date().toISOString();
  report.failure = error?.stack || String(error);
  report.exceptions = exceptions;
  report.consoleErrors = consoleErrors;
  report.logErrors = logErrors;
  report.failedRequests = failedRequests;
  report.httpErrors = httpErrors;
  try {
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  } catch {}
  throw error;
} finally {
  if (socket?.readyState === WebSocket.OPEN) {
    try {
      if (targetId) await command('Target.closeTarget', { targetId }, { browser: true });
      if (browserContextId) await command('Target.disposeBrowserContext', { browserContextId }, { browser: true });
    } catch {}
    socket.close();
  }
}
