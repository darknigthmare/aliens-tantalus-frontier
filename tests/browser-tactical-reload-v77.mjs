import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:57239';
const appUrl = process.env.APP_URL || 'http://127.0.0.1:4176/';
const output = resolve(process.env.QA_OUTPUT || 'docs/references/v77-browser-qa');
const only = process.env.QA_ONLY || 'all';
assert.ok(['all', 'desktop', 'landscape', 'compact-landscape', 'vent'].includes(only), 'Unknown QA_ONLY scenario: ' + only);
await mkdir(output, { recursive: true });
const info = await fetch(endpoint + '/json/version').then(response => response.json());
const socket = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }); });
let sequence = 0, session, context, target;
const pending = new Map(), errors = [];
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (pending.has(message.id)) {
    const request = pending.get(message.id); pending.delete(message.id);
    message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args.map(argument => argument.value || argument.description).join(' '));
  if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') errors.push(message.params.entry.text);
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) errors.push('HTTP ' + message.params.response.status + ' ' + message.params.response.url);
});
function cdp(method, params = {}, browser = false) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params, ...(!browser && session ? { sessionId: session } : {}) }));
  });
}
async function evaluate(expression) {
  const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
async function until(expression, label, timeout = 15000) {
  const deadline = Date.now() + timeout;
  let value;
  while (Date.now() < deadline) {
    value = await evaluate(expression);
    if (value) return value;
    await wait(12);
  }
  throw new Error(label + ': ' + JSON.stringify(value) + '; ' + errors.join('\n'));
}
async function key(code, repeat = false) {
  const key = code.replace(/^Key/, '').toLowerCase();
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', code, key, autoRepeat: repeat });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', code, key });
}
async function probeTouchReload() {
  const point = await evaluate(`(() => {
    const button = document.querySelector('#mission-reload'), r = button.getBoundingClientRect();
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, width: r.width, height: r.height,
      hit: hit === button, hitElement: hit && { tag: hit.tagName, id: hit.id, className: hit.className },
      viewport: { width: innerWidth, height: innerHeight, coarse: matchMedia('(pointer: coarse)').matches },
      ancestors: [button, button.parentElement, button.parentElement.parentElement].map(element => {
        const style = getComputedStyle(element), box = element.getBoundingClientRect();
        return { tag: element.tagName, id: element.id, className: element.className, display: style.display,
          visibility: style.visibility, position: style.position, zIndex: style.zIndex, overflow: style.overflow,
          box: { x: box.x, y: box.y, width: box.width, height: box.height } };
      }) };
  })()`);
  report.touchProbe = point;
  assert.ok(point.width > 0 && point.height > 0 && point.hit, 'bouton tactile R inaccessible: ' + JSON.stringify(point));
  return point;
}
async function touchReload(point) {
  await cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: point.x, y: point.y, id: 1, radiusX: 2, radiusY: 2, force: 1 }] });
  await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
async function capture(name) {
  const result = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 68, captureBeyondViewport: false });
  const bytes = Buffer.from(result.data, 'base64');
  await writeFile(resolve(output, name), bytes);
  return { name, bytes: bytes.length };
}
async function snapshot() {
  return evaluate(`(() => {
    const game = globalThis.__ATF_GAME__, state = game.getSnapshot();
    return { player: state.player, coop: state.coop,
      playerClock: game.player.tacticalReload && { elapsed: game.player.tacticalReload.elapsed, completeAt: game.player.tacticalReload.completeAt, duration: game.player.tacticalReload.profile.duration, attemptAt: game.player.tacticalReload.attemptAt },
      coopClock: game.coop.tacticalReload && { elapsed: game.coop.tacticalReload.elapsed, completeAt: game.coop.tacticalReload.completeAt, duration: game.coop.tacticalReload.profile.duration, attemptAt: game.coop.tacticalReload.attemptAt },
      paint: globalThis.__QA_RELOAD_V77__.paint.slice(-12), events: globalThis.__QA_RELOAD_V77__.events.slice(-16) };
  })()`);
}
async function reset(coop = false) {
  return evaluate(`(() => {
    const game = globalThis.__ATF_GAME__, qa = globalThis.__QA_RELOAD_V77__;
    game.setCoop(${coop}); game.enemies = []; game.hazards = []; game.hostileProjectiles = [];
    game.paused = false; game.enemyAtlasLoadingPausedV65 = false;
    for (const actor of [game.player, game.coop]) Object.assign(actor, {
      alive: true, downed: false, inVehicle: false, health: actor.maxHealth, ammo: Math.min(7, actor.magazineSize - 1),
      ammoReserve: Math.max(61, actor.magazineSize * 2 + 3), tacticalReload: null, reloading: false, reloadClock: 0, actionClock: 0, fireClock: 0,
      x: qa.spawn.x + (actor.coop ? -48 : 0), y: qa.spawn.y, vx: 0, vy: 0
    });
    qa.paint = []; qa.events = []; qa.shots = []; game.clearGameplayInput(); game.canvas.focus();
    return { player: { ammo: game.player.ammo, reserve: game.player.ammoReserve, magazine: game.player.magazineSize },
      coop: { ammo: game.coop.ammo, reserve: game.coop.ammoReserve, magazine: game.coop.magazineSize } };
  })()`);
}
async function attemptAt(actor, fraction, action) {
  await until(`globalThis.__ATF_GAME__.${actor}.tacticalReload?.elapsed / globalThis.__ATF_GAME__.${actor}.tacticalReload?.profile.duration >= ${fraction}`, actor + ' timing target');
  await action();
}
async function layout() {
  return evaluate(`(async () => {
    const { getTacticalReloadLayoutV77 } = await import('/src/tactical-reload-hud-v77.js');
    const current = getTacticalReloadLayoutV77(globalThis.__ATF_GAME__);
    const canvas = globalThis.__ATF_GAME__.canvas, r = canvas.getBoundingClientRect();
    const overlays = [...document.querySelectorAll('#mission-log, .mission-touch-controls button, .game-toolbar button')].map(element => {
      const b = element.getBoundingClientRect(), s = getComputedStyle(element);
      return { id: element.id || element.dataset.missionKey || element.textContent.trim(), left: b.left, top: b.top, right: b.right, bottom: b.bottom,
        width: b.width, height: b.height, display: s.display, visibility: s.visibility, position: s.position, zIndex: s.zIndex,
        visible: b.width > 0 && b.height > 0 && s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity) !== 0 };
    }).filter(element => element.visible);
    const containers = ['.game-toolbar', '.mission-touch-controls'].map(selector => {
      const element = document.querySelector(selector), b = element.getBoundingClientRect(), s = getComputedStyle(element);
      return { selector, left: b.left, top: b.top, right: b.right, bottom: b.bottom, width: b.width, height: b.height,
        display: s.display, visibility: s.visibility, position: s.position, zIndex: s.zIndex };
    });
    const panels = current.boxes.map(({ index, css }) => {
      const left = r.left + css.x, top = r.top + css.y;
      const width = css.width, height = css.height;
      const hit = document.elementFromPoint(left + width / 2, top + height / 2);
      const samples = [[.05,.1],[.95,.1],[.5,.5],[.05,.9],[.95,.9]].map(([x,y]) => {
        const element = document.elementFromPoint(left + width*x, top + height*y);
        return { x: left + width*x, y: top + height*y, hitCanvas: element === canvas, id: element?.id || null };
      });
      return { index, left, top, right: left + width, bottom: top + height,
        visible: left >= 0 && top >= 0 && left + width <= innerWidth && top + height <= innerHeight,
        hitCanvas: hit === canvas && samples.every(sample => sample.hitCanvas), hitId: hit?.id || null, samples,
        visualOverlaps: overlays.filter(element => Math.min(left + width, element.right) > Math.max(left, element.left)
          && Math.min(top + height, element.bottom) > Math.max(top, element.top)) };
    });
    return { viewport: { width: innerWidth, height: innerHeight, coarse: matchMedia('(pointer: coarse)').matches, maxTouchPoints: navigator.maxTouchPoints },
      canvas: { left: r.left, top: r.top, width: r.width, height: r.height },
      approximateLabelPixels: current.font.title * current.scale, approximateHintPixels: current.font.body * current.scale,
      compact: current.compact, stacked: current.stacked, panels, overlays, containers };
  })()`);
}
const report = { ok: false, url: appUrl, requestedScenarios: only, keyboard: [], coop: [], screenshots: [], warnings: [],
  scope: 'Isolated controlled mission. Actual CDP keyboard and touch events, real running simulation clocks. Gamepad check uses simulated standard objects; no physical controller claim. Player art identity and dedicated branch animation are not validated.' };
try {
  ({ browserContextId: context } = await cdp('Target.createBrowserContext', {}, true));
  ({ targetId: target } = await cdp('Target.createTarget', { url: 'about:blank', browserContextId: context }, true));
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId: target, flatten: true }, true));
  await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable'); await cdp('Log.enable');
  await cdp('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp('Network.setBypassServiceWorker', { bypass: true });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, mobile: false, deviceScaleFactor: 1 });
  await cdp('Page.navigate', { url: appUrl + '?qa=tactical-reload-v77-' + Date.now() });
  await until('Boolean(globalThis.__ATF_GAME__ && globalThis.__ATF_V61__ && !document.querySelector("#boot") && /v77/.test(document.title))', 'V77 app initialization', 45000);
  report.setup = await evaluate(`(async () => {
    const content = await import('/src/content.js');
    const presentation = (await import('/src/tactical-reload-v77.js')).TACTICAL_RELOAD_PRESENTATION_V77;
    const game = globalThis.__ATF_GAME__;
    globalThis.__ATF_V61__.titleScreen.hide(); globalThis.__ATF_V51__.showView('play'); globalThis.__ATF_HUB__.stop();
    const world = content.WORLDS.find(entry => entry.biomes.includes('industrial')) || content.WORLDS[0];
    const requestedWeapon = ${JSON.stringify(process.env.QA_WEAPON_ID || '')};
    const weapon = requestedWeapon ? content.WEAPONS.find(entry => entry.id === requestedWeapon) : content.WEAPONS.find(entry => entry.id.includes('m41a')) || content.WEAPONS[0];
    if (!weapon) throw new Error('Requested catalogue weapon not found: ' + requestedWeapon);
    const options = { seed: 770077, world, crew: content.CREW, vehicle: content.VEHICLES.find(entry => entry.family === 'ground'),
      campaign: { ...content.CAMPAIGNS[0], id: 'browser-reload-v77', worldId: world.id, objective: 'restore atmospheric processing' },
      levelSeed: { ...content.LEVEL_SEEDS[0], id: 'browser-reload-level-v77', seed: 770077, worldId: world.id, objective: 'restore atmospheric processing' },
      enemyCatalog: content.ENEMIES.slice(0,52), weapon, difficulty: 'standard' };
    game.start(options);
    game.enemies = []; game.hazards = []; game.squadActors = []; game.hostileProjectiles = [];
    game.setCoop(false); game.paused = false; game.canvas.focus();
    const qa = globalThis.__QA_RELOAD_V77__ = { paint: [], events: [], shots: [], options, spawn: { x: game.player.x, y: game.player.y } };
    const oldEvent = game.onEvent;
    game.onEvent = event => {
      if (/^reload/.test(event.type)) qa.events.push({ ...event });
      if (event.type === 'shot') {
        const bullet = game.bullets.at(-1);
        if (bullet?.owner === game.player) qa.shots.push({ damage: bullet.damage, bonus: bullet.tacticalReloadBonusV77, ammo: game.player.ammo });
      }
      oldEvent(event);
    };
    const oldText = game.ctx.fillText.bind(game.ctx);
    game.ctx.fillText = (value, ...args) => {
      if (/RECHARGEMENT|RÉCUPÉRATION|CHARGEUR PARFAIT|SECONDE PRESSION|TIRS MAX/.test(String(value))) {
        qa.paint.push({ text: value, x: args[0], y: args[1], font: game.ctx.font }); if (qa.paint.length > 100) qa.paint.shift();
      }
      return oldText(value, ...args);
    };
    return { title: document.title, weaponId: weapon.id, weaponName: weapon.name, magazine: weapon.magazine, reload: weapon.reload, fireRate: weapon.fireRate, presentation };
  })()`);
  await until('globalThis.__ATF_GAME__.running && !globalThis.__ATF_GAME__.paused && !globalThis.__ATF_GAME__.enemyAtlasLoadingPausedV65', 'mission available');
  for (const result of ['all', 'desktop'].includes(only) ? ['normal', 'success', 'perfect', 'failed'] : []) {
    const inventory = await reset();
    await key('KeyR');
    await until('globalThis.__ATF_GAME__.player.tacticalReload?.phase === "reloading"', 'R starts reload');
    const state = await evaluate('({ successWindow: globalThis.__ATF_GAME__.player.tacticalReload.profile.successWindow, perfectWindow: globalThis.__ATF_GAME__.player.tacticalReload.profile.perfectWindow })');
    if (result === 'normal') {
      await attemptAt('player', 0.12, () => key('KeyR', true));
      assert.equal((await snapshot()).playerClock.attemptAt, null, 'held repeat must not submit timing');
    } else {
      const fraction = result === 'success' ? (state.successWindow[0] + state.perfectWindow[0]) / 2
        : result === 'perfect' ? (state.perfectWindow[0] + state.perfectWindow[1]) / 2 : 0.1;
      await attemptAt('player', fraction, () => key('KeyR'));
    }
    const attempted = await snapshot();
    assert.equal(attempted.player.tacticalReloadV77.result, result);
    if (attempted.player.tacticalReloadV77.phase === 'reloading') {
      assert.equal(attempted.player.ammo, inventory.player.ammo);
      assert.equal(attempted.player.ammoReserve, inventory.player.reserve);
    }
    await until(`globalThis.__QA_RELOAD_V77__.paint.some(entry => entry.text.includes(${JSON.stringify({ normal: 'RECHARGEMENT', success: 'RECHARGEMENT RÉUSSI', perfect: 'RECHARGEMENT PARFAIT', failed: 'RÉCUPÉRATION DU CHARGEUR' }[result])}))`, 'HUD result painted');
    report.screenshots.push(await capture('desktop-reload-' + result + '.jpg'));
    await until('globalThis.__ATF_GAME__.player.tacticalReload?.phase === "complete"', result + ' completion');
    const completed = await snapshot();
    assert.equal(completed.player.ammo, inventory.player.magazine);
    assert.equal(completed.player.ammo + completed.player.ammoReserve, inventory.player.ammo + inventory.player.reserve);
    assert.equal(completed.events.filter(event => event.type === 'reload-complete' && !event.coop).length, 1);
    assert.equal(completed.player.tacticalReloadV77.bonusRemaining, result === 'perfect' ? Math.min(3, inventory.player.magazine - inventory.player.ammo) : 0);
    if (result === 'success' || result === 'perfect') assert.ok(completed.playerClock.completeAt < completed.playerClock.duration);
    if (result === 'failed') assert.ok(completed.playerClock.completeAt > completed.playerClock.duration);
    report.keyboard.push({ result, inventory, attempted, completed });
    if (result === 'perfect') {
      for (let index = 0; index < 4; index += 1) {
        await until('globalThis.__ATF_GAME__.player.fireClock <= 0', 'weapon cadence available');
        await cdp('Input.dispatchKeyEvent', { type: 'keyDown', code: 'KeyF', key: 'f' });
        await until(`globalThis.__QA_RELOAD_V77__.shots.length >= ${index + 1}`, 'accepted real keyboard shot');
        await cdp('Input.dispatchKeyEvent', { type: 'keyUp', code: 'KeyF', key: 'f' });
      }
      const fired = await evaluate('({ shots: globalThis.__QA_RELOAD_V77__.shots, bonusRemaining: globalThis.__ATF_GAME__.player.tacticalReload.bonusRemaining, ammo: globalThis.__ATF_GAME__.player.ammo })');
      assert.equal(fired.shots.length, 4, 'one accepted shot per press');
      assert.deepEqual(fired.shots.map(shot => shot.bonus), [1.15, 1.15, 1.15, 1]);
      assert.deepEqual(fired.shots.map(shot => shot.damage), [fired.shots[3].damage * 1.15, fired.shots[3].damage * 1.15, fired.shots[3].damage * 1.15, fired.shots[3].damage]);
      assert.equal(fired.bonusRemaining, 0);
      assert.equal(fired.ammo, completed.player.ammo - 4);
      report.bonus = { weaponId: report.setup.weaponId, input: 'four real CDP keyboard F presses respecting actual cadence', ...fired };
    }
  }
  for (const viewport of [{ name: 'desktop', width: 1280, height: 720, mobile: false }, { name: 'landscape', width: 844, height: 390, mobile: true }, { name: 'compact-landscape', width: 480, height: 320, mobile: true }]) {
    if (only !== 'all' && only !== viewport.name) continue;
    await cdp('Emulation.setDeviceMetricsOverride', { width: viewport.width, height: viewport.height, screenWidth: viewport.width, screenHeight: viewport.height, mobile: viewport.mobile, deviceScaleFactor: 1 });
    await cdp('Emulation.setTouchEmulationEnabled', { enabled: viewport.mobile, maxTouchPoints: 5 });
    const inventory = await reset(true);
    // Measure and hit-test before the timed press; DOM inspection must not delay the real touch edge.
    const touchPoint = viewport.mobile ? await probeTouchReload() : null;
    const primaryAction = viewport.mobile ? () => touchReload(touchPoint) : () => key('KeyR');
    await primaryAction(); await key('KeyT');
    await until('globalThis.__ATF_GAME__.player.reloading && globalThis.__ATF_GAME__.coop.reloading', 'independent coop reload starts');
    const initial = await evaluate('({ attemptAt: globalThis.__ATF_GAME__.player.tacticalReload.attemptAt, perfectWindow: globalThis.__ATF_GAME__.player.tacticalReload.profile.perfectWindow })');
    assert.equal(initial.attemptAt, null, 'touch contact must not generate a duplicate attempt');
    await attemptAt('coop', 0.1, () => key('KeyT'));
    const window = initial.perfectWindow;
    // Chromium touch dispatch is delivered on a later compositor/input frame than key dispatch.
    // Aim at the start of the legitimate window, then assert the actual production attempt result.
    const targetFraction = viewport.mobile ? window[0] : (window[0] + window[1]) / 2;
    await attemptAt('player', targetFraction, primaryAction);
    const state = await snapshot();
    await until('globalThis.__QA_RELOAD_V77__.paint.some(entry => entry.text.startsWith("J2"))', 'coop HUD painted');
    const geometry = await layout();
    report.lastLayout = geometry;
    assert.equal(state.player.tacticalReloadV77.result, 'perfect');
    assert.equal(state.coop.tacticalReloadV77.result, 'failed');
    for (const panel of geometry.panels) {
      assert.ok(panel.visible && panel.hitCanvas, 'reload HUD clipped or obscured: ' + JSON.stringify(panel));
      assert.deepEqual(panel.visualOverlaps, [], 'reload HUD visually overlaps journal or touch controls: ' + JSON.stringify(panel));
    }
    assert.ok(geometry.approximateLabelPixels >= 12 && geometry.approximateHintPixels >= 11, 'reload text must remain readable in CSS pixels');
    if (geometry.approximateHintPixels < 10) report.warnings.push('Mobile canvas-scaled HUD hint is approximately ' + geometry.approximateHintPixels.toFixed(2) + ' CSS pixels; needs visual readability review.');
    report.screenshots.push(await capture('coop-reload-' + viewport.name + '.jpg'));
    report.coop.push({ viewport, inventory, state, geometry, targetFraction, input: viewport.mobile ? 'CDP touch contact for J1, keyboard T for J2' : 'keyboard R and T' });
    await until('globalThis.__ATF_GAME__.player.tacticalReload?.phase === "complete" && globalThis.__ATF_GAME__.coop.tacticalReload?.phase === "complete"', 'coop completions');
    const final = await snapshot();
    for (const actor of ['player', 'coop']) {
      assert.equal(final[actor].ammo, inventory[actor].magazine);
      assert.equal(final[actor].ammo + final[actor].ammoReserve, inventory[actor].ammo + inventory[actor].reserve);
    }
  }
  await reset(true);
  report.gamepad = await evaluate(`(() => {
    const game = globalThis.__ATF_GAME__;
    const descriptor = Object.getOwnPropertyDescriptor(navigator, 'getGamepads');
    const pads = [0,1].map(index => ({ index, id: 'QA simulated standard ' + index, mapping: 'standard', connected: true,
      axes: [0,0], buttons: Array.from({length:17}, () => ({pressed:false,value:0})) }));
    globalThis.__QA_RELOAD_V77__.padDescriptor = descriptor;
    globalThis.__QA_RELOAD_V77__.pads = pads;
    Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>pads});
    game.gamepadInputV77.slots = [null,null];
    pads[0].buttons[2].pressed = true;
    game.gamepadInputV77.poll();
    const heldConnectionIgnored = !game.player.reloading;
    pads[0].buttons[2].pressed = false; game.gamepadInputV77.poll();
    pads[0].buttons[2].pressed = true; pads[1].buttons[2].pressed = true; game.gamepadInputV77.poll();
    const bothStarted = game.player.reloading && game.coop.reloading;
    game.gamepadInputV77.poll();
    return { simulated: true, physicalControllerTested: false, heldConnectionIgnored, bothStarted,
      repeatedPollDidNotAttempt: game.player.tacticalReload.attemptAt === null && game.coop.tacticalReload.attemptAt === null };
  })()`);
  assert.equal(report.gamepad.heldConnectionIgnored, true); assert.equal(report.gamepad.bothStarted, true);
  assert.equal(report.gamepad.repeatedPollDidNotAttempt, true);
  await evaluate(`(() => {
    const descriptor = globalThis.__QA_RELOAD_V77__.padDescriptor;
    descriptor ? Object.defineProperty(navigator,'getGamepads',descriptor) : delete navigator.getGamepads;
    globalThis.__ATF_GAME__.gamepadInputV77.poll([]);
  })()`);
  if (['all', 'vent'].includes(only)) {
    report.vents = [];
    await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, mobile: false, deviceScaleFactor: 1 });
    await cdp('Emulation.setTouchEmulationEnabled', { enabled: false });
    for (const role of ['player', 'coop']) {
      const fixture = await evaluate(`(async () => {
        const game = globalThis.__ATF_GAME__, qa = globalThis.__QA_RELOAD_V77__;
        const content = await import('/src/content.js');
        const { buildMissionLevelV52 } = await import('/src/mission-levels-v52.js');
        const world = content.WORLDS[6] || content.WORLDS[0];
        const plan = buildMissionLevelV52({ campaign: { ...qa.options.campaign, worldId: world.id },
          world, levelSeeds: content.LEVEL_SEEDS, templateId: 'ship-interior-vertical', variant: 12 });
        game.stop(); game.start({ ...qa.options, seed: plan.levelSeed.seed, world: plan.world,
          campaign: plan.campaign, levelSeed: plan.levelSeed, missionLevel: plan });
        game.enemies = []; game.hazards = []; game.squadActors = []; game.hostileProjectiles = [];
        game.setCoop(${role === 'coop'}); game.inventory.cutter = true; game.canvas.focus();
        const actor = game.${role};
        Object.assign(actor, { ammo: 2, ammoReserve: 201 });
        qa.events = [];
        return { role: ${JSON.stringify(role)}, worldId: world.id, templateId: 'ship-interior-vertical',
          portalId: game.missionVentNetworkV62.entrances[0].id, ammo: actor.ammo, reserve: actor.ammoReserve };
      })()`);
      await until('globalThis.__ATF_GAME__.running && !globalThis.__ATF_GAME__.paused && !globalThis.__ATF_GAME__.enemyAtlasLoadingPausedV65', 'vent fixture active');
      const reloadKey = role === 'player' ? 'KeyR' : 'KeyT';
      await key(reloadKey);
      await until(`globalThis.__ATF_GAME__.${role}.reloading`, 'reload before vent');
      await attemptAt(role, 0.5, async () => {
        fixture.entry = await evaluate(`(() => {
          const game = globalThis.__ATF_GAME__, actor = game.${role};
          const portal = game.missionVentNetworkV62.entrances[0];
          const elapsed = actor.tacticalReload.elapsed;
          Object.assign(actor, { x: portal.worldPosition.x - actor.w / 2, y: portal.worldPosition.y - actor.h, grounded: true });
          const entered = Boolean(game.enterMissionVentV62(actor));
          return { entered, elapsed, phase: actor.tacticalReload.phase, reason: actor.tacticalReload.cancelReason,
            reloading: actor.reloading, attempt: actor.tacticalReload.attemptAt, ammo: actor.ammo, reserve: actor.ammoReserve };
        })()`);
      });
      assert.equal(fixture.entry.entered, true, 'validated nearby physical vent entry');
      assert.equal(fixture.entry.phase, 'cancelled'); assert.equal(fixture.entry.reason, 'vent-transit');
      assert.equal(fixture.entry.reloading, false); assert.equal(fixture.entry.attempt, null);
      await key(reloadKey);
      await until(`globalThis.__ATF_GAME__.${role}.tacticalReload.feedbackRemaining === 0`, 'vent cancel feedback expires');
      // Real simulation is allowed to run beyond the original perfect window; no clock assignment.
      await wait(1400);
      await key(reloadKey);
      fixture.final = await evaluate(`(() => {
        const game = globalThis.__ATF_GAME__, actor = game.${role};
        return { inVent: Boolean(actor.ventTransit), phase: actor.tacticalReload.phase, result: actor.tacticalReload.result,
          reloading: actor.reloading, attempt: actor.tacticalReload.attemptAt, bonus: actor.tacticalReload.bonusRemaining,
          ammo: actor.ammo, reserve: actor.ammoReserve, visible: game.getSnapshot().${role}.tacticalReloadV77.visible,
          directReloadRejected: game.reload(actor) === false, events: globalThis.__QA_RELOAD_V77__.events };
      })()`);
      assert.equal(fixture.final.inVent, true); assert.equal(fixture.final.phase, 'cancelled');
      assert.equal(fixture.final.reloading, false); assert.equal(fixture.final.attempt, null);
      assert.equal(fixture.final.bonus, 0); assert.equal(fixture.final.visible, false);
      assert.equal(fixture.final.directReloadRejected, true);
      assert.deepEqual([fixture.final.ammo, fixture.final.reserve], [fixture.ammo, fixture.reserve]);
      assert.equal(fixture.final.events.filter(event => event.type === 'reload-complete').length, 0);
      fixture.input = 'Real keyboard reload; controlled placement at an existing portal followed by the production proximity-validated enterMissionVentV62 method; not a walked campaign playthrough.';
      report.vents.push(fixture);
      if (role === 'player') report.screenshots.push(await capture('vent-reload-cancelled.jpg'));
    }
  }
  assert.deepEqual(errors, []);
  report.errors = errors; report.ok = true;
  await writeFile(resolve(output, 'tactical-reload-browser-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ok: report.ok, requestedScenarios: report.requestedScenarios, setup: report.setup,
    keyboard: report.keyboard.map(entry => ({ result: entry.result, attempt: entry.completed.playerClock.attemptAt, duration: entry.completed.playerClock.duration, completeAt: entry.completed.playerClock.completeAt })),
    bonus: report.bonus, coop: report.coop.map(entry => ({ viewport: entry.viewport, geometry: entry.geometry, input: entry.input })),
    gamepad: report.gamepad, vents: report.vents, warnings: report.warnings, screenshots: report.screenshots, errors }, null, 2));
} catch (error) {
  report.failure = error.stack; report.errors = errors;
  try { report.lastState = await snapshot(); } catch {}
  try { report.screenshots.push(await capture('failure.jpg')); await writeFile(resolve(output, 'tactical-reload-browser-failure.json'), JSON.stringify(report, null, 2) + '\n'); } catch {}
  throw error;
} finally {
  try { if (target) await cdp('Target.closeTarget', { targetId: target }, true); if (context) await cdp('Target.disposeBrowserContext', { browserContextId: context }, true); } catch {}
  socket.close();
}
