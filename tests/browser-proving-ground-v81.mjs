import assert from 'node:assert/strict';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9226';
const baseUrl = new URL(process.env.BASE_URL || process.env.APP_URL || 'http://127.0.0.1:4176/');
const localHosts = new Set(['127.0.0.1', 'localhost', '::1']);
const targetKind = process.env.QA_TARGET || (localHosts.has(baseUrl.hostname) ? 'local' : 'canonical');
const outputDir = resolve(process.env.QA_OUTPUT || ('docs/references/v81-release-qa/browser-' + targetKind));
const reportPath = resolve(outputDir, 'proving-ground-v81-browser-report.json');
const failurePath = resolve(outputDir, 'proving-ground-v81-browser-failure.json');
const wait = (milliseconds) => new Promise((done) => setTimeout(done, milliseconds));

const expectedAssets = Object.freeze({
  '/assets/openai/hub/proving-ground/v81/proving-ground-target-cycle-v81.png': Object.freeze([2048, 1024]),
  '/assets/openai/hub/proving-ground/v81/proving-ground-impact-cycle-v81.png': Object.freeze([2048, 1024]),
  '/assets/openai/hub/proving-ground/v81/proving-ground-range-console-v81.png': Object.freeze([1024, 1024])
});
const allowedPlayerSheets = new Set([
  'player.echo9-marine.locomotion',
  'player.echo9-marine.combat',
  'player.echo9-marine.melee',
  'player.echo9-marine.interaction',
  'player.echo9-marine.tool-use'
]);

await mkdir(outputDir, { recursive: true });

const report = {
  ok: false,
  schema: 81,
  target: targetKind,
  baseUrl: baseUrl.href,
  startedAt: new Date().toISOString(),
  scope: [
    'Contexte Chromium et stockage entièrement isolés.',
    'Écran titre puis nouveau profil et reprises ouverts par événements CDP réels.',
    'Un fixture QA contrôlé place Echo-9 dans Armory, avant la porte authorée du Proving Ground.',
    'Depuis ce point, aucune téléportation ni mutation d’état de jeu pendant la qualification.',
    'Porte, console, marche, échelle, pad, visées, tirs et rechargements utilisent les entrées joueur réelles.',
    'Une reprise navigateur est effectuée pendant un projectile, puis une autre après qualification.',
    'La QA ne prétend ni parcourir tous les ponts du Tantalus, ni valider une campagne complète.'
  ],
  hooksUsed: [
    {
      id: 'armory-authored-door-start-fixture',
      reason: 'La route Bridge vers Armory traverse plusieurs salles et ascenseurs hors du périmètre de cette gate.',
      boundary: 'Pose initiale seulement, environ 140 px avant la zone d’interaction de la porte authorée.'
    },
    {
      id: 'player-identity-observer',
      reason: 'Échantillonne playerVisualV81 sans modifier le renderer ni les contrôles.',
      boundary: 'Observation périodique uniquement.'
    }
  ],
  screenshots: [],
  checks: {},
  identitySamples: []
};

let socket;
let browserContextId = null;
let targetId = null;
let pageSessionId = null;
let sequence = 0;
const pending = new Map();
const exceptions = [];
const consoleErrors = [];
const logErrors = [];
const failedRequests = [];
const httpErrors = [];
const provingResponses = [];
const requestUrls = new Map();

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

function pageExpression(pageFunction, args = []) {
  return '(' + pageFunction.toString() + ')(' + args.map((value) => JSON.stringify(value)).join(',') + ')';
}

async function callPage(pageFunction, ...args) {
  return evaluate(pageExpression(pageFunction, args));
}

async function until(expression, label, timeout = 20000, interval = 25) {
  const deadline = Date.now() + timeout;
  let lastValue = null;
  while (Date.now() < deadline) {
    try {
      lastValue = await evaluate(expression);
      if (lastValue) return lastValue;
    } catch (error) {
      lastValue = error.message;
    }
    await wait(interval);
  }
  throw new Error('Timeout V81: ' + label + '; dernière valeur=' + JSON.stringify(lastValue));
}

async function untilPage(pageFunction, label, args = [], timeout = 20000, interval = 25) {
  return until(pageExpression(pageFunction, args), label, timeout, interval);
}

const keyValues = Object.freeze({
  Enter: 'Enter',
  Escape: 'Escape',
  Space: ' ',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight'
});

function keyValue(code, explicitKey) {
  if (explicitKey != null) return explicitKey;
  return keyValues[code] || code.replace(/^Key/u, '').toLowerCase();
}

async function keyDown(code, explicitKey, modifiers = 0) {
  const key = keyValue(code, explicitKey);
  await command('Input.dispatchKeyEvent', { type: 'keyDown', code, key, modifiers });
}

async function keyUp(code, explicitKey, modifiers = 0) {
  const key = keyValue(code, explicitKey);
  await command('Input.dispatchKeyEvent', { type: 'keyUp', code, key, modifiers });
}

async function press(code, explicitKey, { modifiers = 0, holdMs = 50 } = {}) {
  await keyDown(code, explicitKey, modifiers);
  await wait(holdMs);
  await keyUp(code, explicitKey, modifiers);
  await wait(45);
}

async function holdUntil(code, explicitKey, predicate, label, timeout = 12000) {
  await keyDown(code, explicitKey);
  try {
    return await untilPage(predicate, label, [], timeout);
  } finally {
    await keyUp(code, explicitKey);
    await wait(90);
  }
}

async function click(selector) {
  const point = await callPage((requestedSelector) => {
    const element = document.querySelector(requestedSelector);
    const rect = element?.getBoundingClientRect();
    if (!element || !rect) return null;
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return {
      x,
      y,
      width: rect.width,
      height: rect.height,
      disabled: Boolean(element.disabled),
      hidden: Boolean(element.hidden),
      hit: hit === element || element.contains(hit),
      hitId: hit?.id || null
    };
  }, selector);
  assert.ok(point && point.width > 0 && point.height > 0, 'Élément invisible: ' + selector);
  assert.equal(point.hidden, false, 'Élément masqué: ' + selector);
  assert.equal(point.disabled, false, 'Élément désactivé: ' + selector);
  assert.equal(point.hit, true, 'Élément couvert: ' + selector + ' / ' + JSON.stringify(point));
  await command('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    button: 'left',
    buttons: 1,
    clickCount: 1,
    x: point.x,
    y: point.y
  });
  await command('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    button: 'left',
    buttons: 0,
    clickCount: 1,
    x: point.x,
    y: point.y
  });
  await wait(90);
  return point;
}

async function tap(selector) {
  const point = await callPage((requestedSelector) => {
    const element = document.querySelector(requestedSelector);
    const rect = element?.getBoundingClientRect();
    if (!element || !rect) return null;
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return {
      x,
      y,
      width: rect.width,
      height: rect.height,
      disabled: Boolean(element.disabled),
      hidden: Boolean(element.hidden),
      hit: hit === element || element.contains(hit)
    };
  }, selector);
  assert.ok(point && point.width > 0 && point.height > 0, 'Cible tactile invisible: ' + selector);
  assert.equal(point.hidden, false, 'Cible tactile masquée: ' + selector);
  assert.equal(point.disabled, false, 'Cible tactile désactivée: ' + selector);
  assert.equal(point.hit, true, 'Cible tactile couverte: ' + selector);
  await command('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ id: 1, x: point.x, y: point.y, radiusX: 3, radiusY: 3, force: 1 }]
  });
  await wait(70);
  await command('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await wait(90);
  return point;
}

async function capture(name) {
  const jpeg = name.endsWith('.jpg');
  const shot = await command('Page.captureScreenshot', {
    format: jpeg ? 'jpeg' : 'png',
    ...(jpeg ? { quality: 78 } : {}),
    captureBeyondViewport: false
  });
  const bytes = Buffer.from(shot.data, 'base64');
  await writeFile(resolve(outputDir, name), bytes);
  report.screenshots.push({ name, bytes: bytes.length });
  return name;
}

async function pageSnapshot() {
  return callPage(() => {
    const hub = globalThis.__ATF_HUB__;
    const saveSystem = globalThis.__ATF_V51__.saveSystem;
    const state = hub?.provingGroundStateV81;
    const operations = saveSystem.data.hub?.annexOperationsV71?.provingGround;
    const visual = hub?.player?.playerVisualV81 || null;
    return {
      titleVisible: !document.querySelector('#title-screen')?.hidden,
      activeView: document.querySelector('.view.active')?.dataset.panel || null,
      hubRunning: Boolean(hub?.running),
      roomId: hub?.currentAnnexV71?.()?.id || hub?.state?.roomId || null,
      activeAnnexId: hub?.currentAnnexV71?.()?.id || null,
      player: hub?.player ? {
        x: hub.player.x,
        y: hub.player.y,
        w: hub.player.w,
        h: hub.player.h,
        feet: hub.player.y + hub.player.h,
        facing: hub.player.facing,
        grounded: hub.player.grounded,
        climbing: hub.player.climbing,
        visual
      } : null,
      proving: state ? {
        phase: state.phase,
        sessionId: state.sessionId,
        currentTargetIndex: state.currentTargetIndex,
        target: state.targets[state.currentTargetIndex] || null,
        hits: state.hits,
        shots: state.shots,
        reloadCount: state.reloadCount,
        reload: state.reload,
        ammo: state.ammo,
        score: state.score,
        laneHits: state.laneHits,
        qualification: state.qualification,
        completionReceipt: state.completionReceipt,
        claimedReceiptIds: state.claimedReceiptIds
      } : null,
      projectileCount: hub?.provingProjectilesV81?.length || 0,
      impactCount: hub?.provingImpactsV81?.length || 0,
      savedProving: saveSystem.data.hub?.provingGroundV81 || null,
      operations: operations || null,
      playerSaveIdentityKeys: ['visualSheetId', 'spriteKey', 'visualForm', 'neuroVisualContract']
        .filter((key) => Object.hasOwn(saveSystem.data.player || {}, key))
    };
  });
}

async function installIdentityObserver(label) {
  return callPage((observerLabel) => {
    clearInterval(globalThis.__ATF_V81_IDENTITY_TIMER__);
    globalThis.__ATF_V81_IDENTITY_LOG__ = [];
    globalThis.__ATF_V81_IDENTITY_TIMER__ = setInterval(() => {
      const hub = globalThis.__ATF_HUB__;
      const visual = hub?.player?.playerVisualV81;
      if (!hub?.running || !visual?.sheetId) return;
      globalThis.__ATF_V81_IDENTITY_LOG__.push({
        observer: observerLabel,
        at: performance.now(),
        sheetId: visual.sheetId,
        fallback: Boolean(visual.fallback),
        reason: visual.reason || null,
        facing: visual.facing,
        roomId: hub.currentAnnexV71?.()?.id || hub.state?.roomId || null
      });
      if (globalThis.__ATF_V81_IDENTITY_LOG__.length > 2000) {
        globalThis.__ATF_V81_IDENTITY_LOG__.splice(0, 1000);
      }
    }, 16);
    return true;
  }, label);
}

async function collectIdentityObserver() {
  const samples = await callPage(() => {
    clearInterval(globalThis.__ATF_V81_IDENTITY_TIMER__);
    globalThis.__ATF_V81_IDENTITY_TIMER__ = null;
    return structuredClone(globalThis.__ATF_V81_IDENTITY_LOG__ || []);
  });
  report.identitySamples.push(...samples);
  return samples;
}

function assertIdentitySamples(samples, label) {
  assert.ok(samples.length > 0, 'Aucun échantillon identité joueur: ' + label);
  for (const sample of samples) {
    assert.ok(allowedPlayerSheets.has(sample.sheetId), 'Plaque joueur non autorisée: ' + JSON.stringify(sample));
    assert.doesNotMatch(sample.sheetId, /^(?:enemy|npc)\./u, 'Famille ennemie ou PNJ rendue pour le joueur.');
    assert.equal(sample.fallback, false, 'Fallback Canvas joueur visible: ' + JSON.stringify(sample));
    assert.equal(sample.reason, null, 'Dégradation visuelle joueur: ' + JSON.stringify(sample));
    assert.ok(sample.facing === -1 || sample.facing === 1, 'Facing joueur non normalisé: ' + JSON.stringify(sample));
  }
}

async function openTitleMenu() {
  await press('Enter', 'Enter');
  return untilPage(() => {
    const menu = document.querySelector('#title-menu');
    return menu && !menu.hidden && document.activeElement?.id === 'title-continue';
  }, 'menu titre ouvert et focus Continuer');
}

async function enterFreshHubFromTitle() {
  await openTitleMenu();
  await click('#title-new');
  assert.equal(await callPage(() => document.querySelector('#title-new').dataset.confirm), 'true');
  await click('#title-new');
  return untilPage(() => (
    globalThis.__ATF_HUB__?.running
    && document.querySelector('.view.active')?.dataset.panel === 'hub'
    && document.activeElement?.id === 'hub-canvas'
    && document.querySelector('#title-screen')?.hidden
  ), 'nouveau profil vers hub réel', [], 30000);
}

async function continueHubFromTitle() {
  await openTitleMenu();
  assert.equal(await callPage(() => document.querySelector('#title-continue').disabled), false);
  await click('#title-continue');
  return untilPage(() => (
    globalThis.__ATF_HUB__?.running
    && document.querySelector('.view.active')?.dataset.panel === 'hub'
    && document.activeElement?.id === 'hub-canvas'
    && document.querySelector('#title-screen')?.hidden
  ), 'Continuer vers hub réel', [], 30000);
}

async function reloadToTitle() {
  await command('Page.reload', { ignoreCache: true });
  return untilPage(() => (
    document.readyState === 'complete'
    && Boolean(globalThis.__ATF_V51__ && globalThis.__ATF_V61__ && globalThis.__ATF_HUB__)
    && !document.querySelector('#boot')
    && !document.querySelector('#title-screen')?.hidden
    && document.activeElement?.id === 'title-start'
  ), 'rechargement vers écran titre', [], 45000);
}

async function decodeProvingAssets() {
  return callPage(async () => {
    const hub = globalThis.__ATF_HUB__;
    const entries = [...hub.provingGroundImagesV81.values()];
    await Promise.all(entries.map(async (image) => {
      if (typeof image.decode === 'function') await image.decode();
    }));
    return entries.map((image) => {
      const source = image.currentSrc || image.src;
      return {
        path: new URL(source, location.href).pathname,
        complete: image.complete,
        width: image.naturalWidth,
        height: image.naturalHeight
      };
    }).sort((left, right) => left.path.localeCompare(right.path));
  });
}

async function fireCurrentTarget() {
  const before = await pageSnapshot();
  assert.equal(before.proving.phase, 'active');
  const lane = before.proving.target?.lane;
  assert.ok(['high', 'level', 'low'].includes(lane), 'Cible active sans angle: ' + JSON.stringify(before.proving.target));
  const framing = await callPage(async () => {
    const hub = globalThis.__ATF_HUB__;
    const { getProvingGroundTargetV81 } = await import('/src/tantalus-proving-ground-v81.js');
    const active = hub.provingGroundStateV81.targets[hub.provingGroundStateV81.currentTargetIndex];
    const target = getProvingGroundTargetV81(active.id);
    const cameraX = hub.annexCameraV71.x;
    return {
      targetId: target.id,
      cameraX,
      screenLeft: target.bounds.x - cameraX,
      screenRight: target.bounds.x + target.bounds.w - cameraX,
      playerLeft: hub.player.x - cameraX,
      playerRight: hub.player.x + hub.player.w - cameraX
    };
  });
  assert.equal(framing.targetId, before.proving.target.id);
  assert.ok(framing.screenLeft >= 0 && framing.screenRight <= 1280,
    'Cible active hors écran: ' + JSON.stringify(framing));
  assert.ok(framing.playerLeft >= 0 && framing.playerRight <= 1280,
    'Echo-9 hors écran: ' + JSON.stringify(framing));
  report.checks.targetFraming ??= [];
  report.checks.targetFraming.push(framing);
  const framingCapture = {
    'pg-v81-target-04-level-mid': '09a-target-04-mid-visible.jpg',
    'pg-v81-target-07-high-far': '09b-target-07-high-far-visible.jpg',
    'pg-v81-target-08-level-far': '09c-target-08-level-far-visible.jpg'
  }[framing.targetId];
  if (framingCapture) await capture(framingCapture);
  const aimCode = lane === 'high' ? 'KeyW' : lane === 'low' ? 'KeyS' : null;
  if (aimCode) await keyDown(aimCode, lane === 'high' ? 'w' : 's');
  try {
    await press('KeyF', 'f', { holdMs: 25 });
    await untilPage((expectedHits) => (
      globalThis.__ATF_HUB__.provingGroundStateV81.hits === expectedHits
    ), 'impact réel sur ' + before.proving.target.id, [before.proving.hits + 1], 3500, 12);
  } finally {
    if (aimCode) await keyUp(aimCode, lane === 'high' ? 'w' : 's');
  }
  const after = await pageSnapshot();
  assert.equal(after.proving.hits, before.proving.hits + 1);
  assert.equal(after.proving.ammo.magazine, before.proving.ammo.magazine - 1);
  return {
    targetId: before.proving.target.id,
    lane,
    hitsBefore: before.proving.hits,
    hitsAfter: after.proving.hits,
    shotsAfter: after.proving.shots,
    magazineAfter: after.proving.ammo.magazine,
    phaseAfter: after.proving.phase
  };
}

async function performReload(expectedCount, screenshotName) {
  const before = await pageSnapshot();
  assert.equal(before.proving.phase, 'active');
  assert.ok(before.proving.ammo.magazine < before.proving.ammo.capacity);
  await press('KeyR', 'r');
  const started = await untilPage(() => {
    const state = globalThis.__ATF_HUB__.provingGroundStateV81;
    return state.reload.active && {
      magazine: state.ammo.magazine,
      reserve: state.ammo.reserve,
      remainingSeconds: state.reload.remainingSeconds
    };
  }, 'rechargement M41A démarré');
  await capture(screenshotName);
  await untilPage((count) => {
    const state = globalThis.__ATF_HUB__.provingGroundStateV81;
    return !state.reload.active && state.reloadCount === count;
  }, 'rechargement M41A terminé', [expectedCount], 5000);
  const after = await pageSnapshot();
  assert.equal(after.proving.reloadCount, expectedCount);
  const transferred = Math.min(
    before.proving.ammo.capacity - before.proving.ammo.magazine,
    before.proving.ammo.reserve
  );
  assert.equal(after.proving.ammo.magazine, before.proving.ammo.magazine + transferred);
  assert.equal(after.proving.ammo.reserve, before.proving.ammo.reserve - transferred);
  return { before: before.proving.ammo, started, after: after.proving.ammo, reloadCount: after.proving.reloadCount };
}

try {
  const versionResponse = await fetch(endpoint + '/json/version');
  if (!versionResponse.ok) throw new Error('Endpoint CDP indisponible: HTTP ' + versionResponse.status);
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
      consoleErrors.push(message.params.args.map((argument) => argument.value || argument.description || argument.type).join(' '));
    }
    if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
      logErrors.push(message.params.entry.text);
    }
    if (message.method === 'Network.requestWillBeSent') {
      requestUrls.set(message.params.requestId, message.params.request.url);
    }
    if (message.method === 'Network.loadingFailed' && !message.params.canceled) {
      failedRequests.push({
        url: requestUrls.get(message.params.requestId) || null,
        type: message.params.type,
        error: message.params.errorText,
        blockedReason: message.params.blockedReason || null
      });
    }
    if (message.method === 'Network.responseReceived') {
      const response = message.params.response;
      const entry = { status: response.status, url: response.url, mimeType: response.mimeType };
      if (response.status >= 400) httpErrors.push(entry);
      if (response.url.includes('/assets/openai/hub/proving-ground/v81/')) provingResponses.push(entry);
    }
  });

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
  await command('Log.enable');
  await command('Network.setBypassServiceWorker', { bypass: true });
  await command('Network.setCacheDisabled', { cacheDisabled: true });
  await command('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 720,
    screenWidth: 1280,
    screenHeight: 720,
    deviceScaleFactor: 1,
    mobile: false
  });
  await command('Emulation.setTouchEmulationEnabled', { enabled: false });
  await command('Storage.clearDataForOrigin', {
    origin: baseUrl.origin,
    storageTypes: 'all'
  });

  const navigationUrl = new URL(baseUrl.href);
  navigationUrl.searchParams.set('qa', 'proving-ground-v81-' + targetKind + '-' + Date.now());
  await command('Page.navigate', { url: navigationUrl.href });
  await untilPage(() => (
    Boolean(globalThis.__ATF_V51__ && globalThis.__ATF_V61__ && globalThis.__ATF_HUB__)
    && !document.querySelector('#boot')
    && !document.querySelector('#title-screen')?.hidden
    && document.activeElement?.id === 'title-start'
  ), 'boot V81 sur écran titre', [], 45000);

  report.checks.pageHealth = await callPage(() => ({
    title: document.title,
    release: document.querySelector('meta[name="atf-release"]')?.content || null,
    bodyTextLength: document.body.innerText.trim().length,
    overlay: Boolean(document.querySelector('[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay')),
    titleVisible: !document.querySelector('#title-screen')?.hidden,
    startFocus: document.activeElement?.id
  }));
  assert.ok(report.checks.pageHealth.bodyTextLength > 100);
  assert.equal(report.checks.pageHealth.overlay, false);
  assert.equal(report.checks.pageHealth.titleVisible, true);
  assert.equal(report.checks.pageHealth.startFocus, 'title-start');
  assert.match(report.checks.pageHealth.title, /v81/iu);
  assert.match(report.checks.pageHealth.release || '', /^81\./u);
  await capture('01-title-v81.jpg');

  await enterFreshHubFromTitle();
  report.checks.titleToHub = await pageSnapshot();
  assert.equal(report.checks.titleToHub.activeView, 'hub');
  assert.equal(report.checks.titleToHub.hubRunning, true);
  assert.deepEqual(report.checks.titleToHub.playerSaveIdentityKeys, []);
  report.checks.playerSheetsReady = await untilPage(() => {
    const entries = [...(globalThis.__ATF_HUB__?.playerSheets?.entries?.() || [])];
    if (entries.length !== 5 || !entries.every(([, image]) => image.complete && image.naturalWidth === 1024 && image.naturalHeight === 1024)) return false;
    return entries.map(([imageKey, image]) => ({ imageKey, path: new URL(image.currentSrc || image.src, location.href).pathname, width: image.naturalWidth, height: image.naturalHeight }));
  }, 'cinq plaques Echo-9 prêtes', [], 30000);
  assert.equal(report.checks.playerSheetsReady.length, 5);
  await installIdentityObserver('pre-reload');
  await capture('02-fresh-hub.jpg');

  report.checks.armoryFixture = await callPage(async () => {
    const module = await import('/src/hub-v81-runtime.js');
    const hub = globalThis.__ATF_HUB__;
    const saveSystem = globalThis.__ATF_V51__.saveSystem;
    const proving = module.HUB_ANNEX_BY_ID_V71['proving-ground'];
    const deck = module.HUB_DECKS.findIndex((entry) => entry.id === proving.parentDeck);
    const room = module.HUB_DECKS[deck].rooms.find((entry) => entry.id === proving.parentRoomId);
    if (!proving || deck < 0 || !room) throw new Error('Route Armory vers Proving Ground absente');
    hub.stop(false);
    const commercial = structuredClone(module.createHubCommercialStateV71());
    saveSystem.data.hub = {
      ...saveSystem.data.hub,
      deck,
      roomId: room.id,
      positionX: room.xStart + 160,
      facing: 1,
      visited: [...new Set([...(saveSystem.data.hub.visited || []), room.id])],
      [module.HUB_ANNEX_STATE_KEY_V71]: commercial,
      [module.PROVING_GROUND_STATE_KEY_V81]: module.createProvingGroundSessionStateV81()
    };
    if (saveSystem.data.hub.annexOperationsV71?.provingGround) {
      Object.assign(saveSystem.data.hub.annexOperationsV71.provingGround, {
        nextOperationCharge: false,
        lastQualificationIdV81: null,
        qualificationReceiptIdsV81: [],
        qualificationsCompletedV81: 0,
        bestScoreV81: 0,
        powerLoaderCertified: false,
        advancedTutorialsComplete: false
      });
    }
    saveSystem.commit();
    globalThis.__ATF_V51__.showView('hub');
    await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
    const door = hub.getParentAnnexDoorV71(proving.id);
    if (!door) throw new Error('Porte authorée du Proving Ground introuvable dans Armory');
    const startX = Math.max(room.xStart + 24, door.interactionBounds.x - hub.player.w - 140);
    Object.assign(hub.player, {
      x: startX,
      y: door.bounds.y + door.bounds.h - hub.player.h,
      vx: 0,
      vy: 0,
      grounded: true,
      climbing: false,
      crouching: false,
      facing: 1
    });
    hub.state.positionX = Math.round(startX);
    hub.camera.x = Math.max(0, Math.min(5120 - 1280, startX - 640));
    hub.draw();
    hub.canvas.focus({ preventScroll: true });
    return {
      controlledFixture: true,
      deck: proving.parentDeck,
      roomId: room.id,
      annexId: proving.id,
      start: { x: hub.player.x, y: hub.player.y, feet: hub.player.y + hub.player.h },
      door: structuredClone(door),
      distanceToInteraction: door.interactionBounds.x - (hub.player.x + hub.player.w)
    };
  });
  assert.equal(report.checks.armoryFixture.roomId, 'armory');
  assert.equal(report.checks.armoryFixture.annexId, 'proving-ground');
  assert.ok(report.checks.armoryFixture.distanceToInteraction >= 100);

  await holdUntil('KeyD', 'd', () => (
    globalThis.__ATF_HUB__.nearestParentAnnexDoorV71()?.annexId === 'proving-ground'
  ), 'marche physique vers la porte Proving Ground');
  report.checks.parentDoorReached = await pageSnapshot();
  assert.equal(report.checks.parentDoorReached.activeAnnexId, null);
  await capture('03-armory-proving-door.jpg');
  await press('KeyE', 'e');
  await untilPage(() => (
    globalThis.__ATF_HUB__.currentAnnexV71?.()?.id === 'proving-ground'
    && !globalThis.__ATF_HUB__.annexTransitionV71
  ), 'entrée physique dans le Proving Ground', [], 5000);

  report.checks.enteredAnnex = await pageSnapshot();
  assert.equal(report.checks.enteredAnnex.activeAnnexId, 'proving-ground');
  assert.equal(report.checks.enteredAnnex.proving.phase, 'idle');
  assert.equal(Boolean(report.checks.enteredAnnex.operations?.nextOperationCharge), false);
  await untilPage(() => globalThis.__ATF_HUB__.getAssetReport().provingGroundAssetsReadyV81 === 3,
    'trois images Proving Ground prêtes', [], 30000);
  report.checks.assets = await decodeProvingAssets();
  assert.equal(report.checks.assets.length, 3);
  for (const asset of report.checks.assets) {
    const expected = expectedAssets[asset.path];
    assert.ok(expected, 'Asset Proving Ground inattendu: ' + asset.path);
    assert.equal(asset.complete, true);
    assert.deepEqual([asset.width, asset.height], expected);
  }
  await capture('04-proving-ground-entered.jpg');

  await holdUntil('KeyA', 'a', () => Boolean(globalThis.__ATF_HUB__.nearestAnnexStationV71()),
    'marche physique vers la console de sécurité', 15000);
  report.checks.stationReached = await pageSnapshot();
  assert.equal(report.checks.stationReached.proving.phase, 'idle');
  assert.equal(Boolean(report.checks.stationReached.operations?.nextOperationCharge), false);
  await press('KeyE', 'e');
  await untilPage(() => globalThis.__ATF_HUB__.provingGroundStateV81.phase === 'armed',
    'console E arme la qualification');
  report.checks.armed = await pageSnapshot();
  assert.equal(report.checks.armed.proving.ammo.magazine, 4);
  assert.equal(report.checks.armed.proving.ammo.reserve, 95);
  assert.equal(Boolean(report.checks.armed.operations?.nextOperationCharge), false);
  await capture('05-console-armed.jpg');

  await holdUntil('KeyD', 'd', () => {
    const hub = globalThis.__ATF_HUB__;
    const ladder = hub.currentAnnexV71()?.ladders?.[0];
    const center = hub.player.x + hub.player.w / 2;
    return Boolean(ladder && center >= ladder.x + 8 && center <= ladder.x + ladder.w - 8);
  }, 'marche réelle console vers échelle', 12000);
  await holdUntil('KeyW', 'w', () => {
    const hub = globalThis.__ATF_HUB__;
    const ladder = hub.currentAnnexV71()?.ladders?.[0];
    return Boolean(ladder && hub.player.y + hub.player.h <= ladder.top + 1);
  }, 'montée réelle de l’échelle vers passerelle', 5000);
  const ladderTop = await pageSnapshot();
  assert.ok(Math.abs(ladderTop.player.feet - 468) <= 2, 'Echo-9 n’est pas sur la passerelle: ' + JSON.stringify(ladderTop.player));

  await holdUntil('KeyA', 'a', () => (
    globalThis.__ATF_HUB__.provingGroundStateV81.phase === 'active'
  ), 'marche réelle sur le pad de tir', 5000);
  report.checks.courseStarted = await pageSnapshot();
  assert.equal(report.checks.courseStarted.proving.currentTargetIndex, 0);
  assert.equal(report.checks.courseStarted.proving.target.lane, 'level');
  assert.ok(Math.abs(report.checks.courseStarted.player.feet - 468) <= 2);
  assert.equal(Boolean(report.checks.courseStarted.operations?.nextOperationCharge), false);
  await capture('06-course-active.jpg');

  await press('KeyF', 'f', { holdMs: 10 });
  report.checks.midFlight = await untilPage(() => {
    const hub = globalThis.__ATF_HUB__;
    const state = hub.provingGroundStateV81;
    return hub.provingProjectilesV81.length > 0 && state.hits === 0 && {
      phase: state.phase,
      currentTargetIndex: state.currentTargetIndex,
      hits: state.hits,
      shots: state.shots,
      ammo: state.ammo,
      projectileCount: hub.provingProjectilesV81.length
    };
  }, 'projectile réel en vol avant reprise', [], 450, 5);
  assert.equal(report.checks.midFlight.shots, 1);
  assert.equal(report.checks.midFlight.ammo.magazine, 3);

  const preReloadIdentity = await collectIdentityObserver();
  assertIdentitySamples(preReloadIdentity, 'avant reprise');
  await reloadToTitle();
  await continueHubFromTitle();
  await installIdentityObserver('post-midflight-reload');
  report.checks.midFlightResume = await pageSnapshot();
  assert.equal(report.checks.midFlightResume.activeAnnexId, 'proving-ground');
  assert.equal(report.checks.midFlightResume.proving.phase, 'active');
  assert.equal(report.checks.midFlightResume.proving.currentTargetIndex, 0);
  assert.equal(report.checks.midFlightResume.proving.hits, 0);
  assert.equal(report.checks.midFlightResume.proving.shots, 1);
  assert.equal(report.checks.midFlightResume.proving.ammo.magazine, 3);
  assert.equal(report.checks.midFlightResume.projectileCount, 0);
  assert.equal(Object.hasOwn(report.checks.midFlightResume.savedProving || {}, 'projectiles'), false);
  assert.equal(Object.hasOwn(report.checks.midFlightResume.savedProving || {}, 'impacts'), false);
  assert.deepEqual(report.checks.midFlightResume.playerSaveIdentityKeys, []);
  await capture('07-resumed-without-projectile.jpg');

  report.checks.shots = [];
  report.checks.shots.push(await fireCurrentTarget());
  report.checks.shots.push(await fireCurrentTarget());
  report.checks.shots.push(await fireCurrentTarget());
  assert.equal((await pageSnapshot()).proving.ammo.magazine, 0);
  report.checks.reloadOne = await performReload(1, '08-mandatory-reload-one.jpg');

  for (let index = 0; index < 6; index += 1) {
    report.checks.shots.push(await fireCurrentTarget());
  }

  await untilPage(() => {
    const hub = globalThis.__ATF_HUB__;
    const state = hub.provingGroundStateV81;
    const operations = globalThis.__ATF_V51__.saveSystem.data.hub?.annexOperationsV71?.provingGround;
    return state.phase === 'completed'
      && state.hits === 9
      && state.claimedReceiptIds.includes(state.completionReceipt?.id)
      && operations?.nextOperationCharge === true;
  }, 'reçu, claim runtime et bonus stratégique V81', [], 5000);
  report.checks.completed = await pageSnapshot();
  assert.equal(report.checks.completed.proving.phase, 'completed');
  assert.equal(report.checks.completed.proving.hits, 9);
  assert.equal(report.checks.completed.proving.reloadCount, 1);
  assert.deepEqual(report.checks.completed.proving.laneHits, { high: 3, level: 3, low: 3 });
  assert.deepEqual(report.checks.shots.map((shot) => shot.lane), [
    'level', 'high', 'low', 'level', 'high', 'low', 'high', 'level', 'low'
  ]);
  assert.equal(report.checks.completed.proving.shots, 10);
  assert.equal(report.checks.completed.operations.nextOperationCharge, true);
  assert.equal(report.checks.completed.operations.qualificationsCompletedV81, 1);
  assert.equal(report.checks.completed.operations.powerLoaderCertified, false);
  assert.equal(report.checks.completed.operations.advancedTutorialsComplete, false);
  assert.ok(report.checks.completed.operations.qualificationReceiptIdsV81.includes(
    report.checks.completed.proving.completionReceipt.id
  ));
  assert.deepEqual(report.checks.completed.playerSaveIdentityKeys, []);
  await capture('10-qualified-receipt-and-bonus.jpg');

  const postCourseIdentity = await collectIdentityObserver();
  assertIdentitySamples(postCourseIdentity, 'qualification complète');
  const completionReceiptId = report.checks.completed.proving.completionReceipt.id;
  await reloadToTitle();
  await continueHubFromTitle();
  await installIdentityObserver('post-completion-reload');
  report.checks.completedResume = await pageSnapshot();
  assert.equal(report.checks.completedResume.proving.phase, 'completed');
  assert.equal(report.checks.completedResume.proving.completionReceipt.id, completionReceiptId);
  assert.equal(report.checks.completedResume.projectileCount, 0);
  assert.equal(report.checks.completedResume.operations.nextOperationCharge, true);
  assert.equal(report.checks.completedResume.operations.qualificationsCompletedV81, 1);
  assert.equal(report.checks.completedResume.operations.lastQualificationIdV81, completionReceiptId);
  assert.deepEqual(report.checks.completedResume.playerSaveIdentityKeys, []);
  assert.equal(Object.hasOwn(report.checks.completedResume.savedProving || {}, 'projectiles'), false);
  assert.equal(Object.hasOwn(report.checks.completedResume.savedProving || {}, 'impacts'), false);
  await capture('11-qualified-resume-stable.jpg');

  await command('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    screenWidth: 390,
    screenHeight: 844,
    deviceScaleFactor: 1,
    mobile: true
  });
  await command('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await callPage(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
  const mobileSelectors = [
    '[data-hub-control="aim-high"]',
    '[data-hub-control="aim-low"]',
    '[data-hub-control="reload"]',
    '[data-hub-control="fire"]',
    '[data-hub-control="interact"]'
  ];
  report.checks.mobileControls = await callPage((selectors) => ({
    viewport: { width: innerWidth, height: innerHeight },
    viewFlag: document.querySelector('.view[data-panel="hub"]')?.dataset.provingGroundActiveV81,
    controls: selectors.map((selector) => {
      const element = document.querySelector(selector);
      const rect = element?.getBoundingClientRect();
      const style = element ? getComputedStyle(element) : null;
      const x = rect ? rect.left + rect.width / 2 : -1;
      const y = rect ? rect.top + rect.height / 2 : -1;
      const hit = rect ? document.elementFromPoint(x, y) : null;
      return {
        selector,
        hidden: Boolean(element?.hidden),
        disabled: Boolean(element?.disabled),
        display: style?.display || null,
        rect: rect ? {
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height
        } : null,
        centerHit: Boolean(element && (hit === element || element.contains(hit)))
      };
    })
  }), mobileSelectors);
  assert.deepEqual(report.checks.mobileControls.viewport, { width: 390, height: 844 });
  assert.equal(report.checks.mobileControls.viewFlag, 'true');
  for (const control of report.checks.mobileControls.controls) {
    assert.equal(control.hidden, false, 'Contrôle mobile hidden: ' + control.selector);
    assert.equal(control.disabled, false, 'Contrôle mobile disabled: ' + control.selector);
    assert.notEqual(control.display, 'none', 'Contrôle mobile display none: ' + control.selector);
    assert.ok(control.rect.width >= 44 && control.rect.height >= 44, 'Cible tactile trop petite: ' + JSON.stringify(control));
    assert.ok(control.rect.left >= 0 && control.rect.top >= 0, 'Cible tactile hors viewport: ' + JSON.stringify(control));
    assert.ok(control.rect.right <= 390 && control.rect.bottom <= 844, 'Cible tactile rognée: ' + JSON.stringify(control));
    assert.equal(control.centerHit, true, 'Centre tactile couvert: ' + JSON.stringify(control));
  }
  await tap('[data-hub-control="aim-high"]');
  await tap('[data-hub-control="aim-low"]');
  await tap('[data-hub-control="reload"]');
  const afterMobileInputs = await pageSnapshot();
  assert.equal(afterMobileInputs.proving.phase, 'completed');
  assert.equal(afterMobileInputs.operations.qualificationsCompletedV81, 1);
  assert.equal(afterMobileInputs.operations.nextOperationCharge, true);
  await capture('12-mobile-controls-reachable.jpg');

  const finalIdentity = await collectIdentityObserver();
  assertIdentitySamples(finalIdentity, 'reprise et mobile');
  assert.ok(report.identitySamples.length >= 10, 'Échantillonnage identité insuffisant.');
  assert.ok(report.identitySamples.every((sample) => allowedPlayerSheets.has(sample.sheetId)));
  assert.ok(report.identitySamples.every((sample) => !/^(?:enemy|npc)\./u.test(sample.sheetId)));
  assert.ok(report.identitySamples.every((sample) => sample.fallback === false && sample.reason === null));

  const provingResponsePaths = [...new Set(provingResponses
    .filter((entry) => entry.status === 200)
    .map((entry) => new URL(entry.url).pathname))].sort();
  report.checks.networkAssets = {
    expected: Object.keys(expectedAssets).sort(),
    received200: provingResponsePaths
  };
  assert.deepEqual(provingResponsePaths, Object.keys(expectedAssets).sort());
  assert.deepEqual(exceptions, []);
  assert.deepEqual(consoleErrors, []);
  assert.deepEqual(logErrors, []);
  assert.deepEqual(failedRequests, []);
  assert.deepEqual(httpErrors, []);

  report.errors = {
    exceptions,
    consoleErrors,
    logErrors,
    failedRequests,
    httpErrors
  };
  report.finishedAt = new Date().toISOString();
  report.ok = true;
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
  await rm(failurePath, { force: true });
  await rm(resolve(outputDir, 'failure-v81.jpg'), { force: true });
  console.log(JSON.stringify({
    ok: report.ok,
    target: report.target,
    reportPath,
    screenshots: report.screenshots,
    checks: Object.keys(report.checks),
    identitySampleCount: report.identitySamples.length,
    errors: report.errors
  }, null, 2));
} catch (error) {
  report.failure = error.stack || String(error);
  report.errors = {
    exceptions,
    consoleErrors,
    logErrors,
    failedRequests,
    httpErrors
  };
  report.finishedAt = new Date().toISOString();
  try {
    report.lastState = await pageSnapshot();
    await capture('failure-v81.jpg');
  } catch {}
  await writeFile(failurePath, JSON.stringify(report, null, 2) + '\n');
  throw error;
} finally {
  try {
    await callPage(() => clearInterval(globalThis.__ATF_V81_IDENTITY_TIMER__));
  } catch {}
  try {
    if (targetId) await command('Target.closeTarget', { targetId }, { browser: true });
    if (browserContextId) await command('Target.disposeBrowserContext', { browserContextId }, { browser: true });
  } catch {}
  socket?.close();
}
