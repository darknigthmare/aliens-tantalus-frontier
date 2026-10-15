import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';
import { HUB_DECKS, HUB_WORLD } from '../src/hub-game.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';

// Journey four is a separate agent's actual browser journey, not a human study.
// Idle saves enter through the file picker. All runtime evaluations read only;
// navigation, focus, travel, dialogue, save and resume use native controls.
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.ATF_BASE_URL || 'http://127.0.0.1:4173';
const output = resolve(process.env.ATF_CONTROLS_QA_OUTPUT || join(tmpdir(), `atf-controls-v133-${Date.now()}`));
const relativeOutput = relative(repository, output);
if (!relativeOutput || !relativeOutput.startsWith('..') && !isAbsolute(relativeOutput)) throw Error('QA artifacts must remain outside the checkout.');
const scope = process.env.ATF_CONTROLS_QA_SCOPE || 'all';
const report = { status: 'running', journey: 4, startedAt: new Date().toISOString(), checks: [], captures: [],
  pageErrors: [], requestFailures: [], findings: [], notExercised: [], commandHeaders: [],
  method: 'Real Save picker, actual native keyboard/pointer/touch events, physical hub travel and backtracking, real dialogue/menu/save/reload. Globals are read only.',
  limits: ['One independent agent journey; no claim of four human testers.', 'Touch is Chromium emulation, not a physical mobile device.',
    'This checks focus, semantics, labels, target dimensions and reflow; it does not certify screen-reader or WCAG compliance.'] };
let browser, page, captureSerial = 0;
async function playwright() {
  if (process.env.ATF_PLAYWRIGHT_MODULE) return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
  try { return await import('playwright'); } catch (error) {
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__controls_qa__.cjs'))('playwright');
    throw Error('Use the existing Playwright/Chromium installation.', { cause: error });
  }
}
function observed() {
  const hub = globalThis.__ATF_HUB__, player = hub?.player, focused = document.activeElement;
  if (!hub || !player) return null;
  const lift = hub.nearestLift?.();
  return { running: hub.running, time: hub.animationTime, deck: hub.state.deck, roomId: hub.state.roomId,
    camera: { ...hub.camera }, keys: [...hub.keys], annex: hub.currentAnnexV71?.()?.id || null,
    player: { x: player.x, y: player.y, w: player.w, h: player.h, vx: player.vx, vy: player.vy,
      grounded: player.grounded, alive: player.alive, facing: player.facing, health: player.health,
      crouching: player.crouching, appearance: player.playerAppearanceVisualV126 ? {
        drawn: player.playerAppearanceVisualV126.drawn, ready: player.playerAppearanceVisualV126.ready,
        selected: structuredClone(player.playerAppearanceVisualV126.selected), humanVisual: structuredClone(player.playerAppearanceVisualV126.humanVisualV133),
        locomotion: player.playerLocomotionVisualV129 ? { mode: player.playerLocomotionVisualV129.mode, phase: player.playerLocomotionVisualV129.phase } : null } : null },
    doors: hub.doorStates.map(door => ({ id: door.id, x: door.x, lift: !!door.lift, roomId: door.roomId, progress: door.progress })),
    lift: lift ? { id: lift.id, x: lift.x, shaftId: lift.shaftId, destinations: structuredClone(lift.destinations) } : null,
    npcs: (hub.npcs || []).map(actor => ({ crewId: actor.crewId, x: actor.x, y: actor.y, w: actor.w, h: actor.h, workClock: actor.workClock })),
    projectiles: hub.projectiles?.length || 0,
    prompt: document.querySelector('#hub-prompt')?.textContent,
    focus: { id: focused?.id, tag: focused?.tagName, label: focused?.getAttribute('aria-label'), inDialogue: !!focused?.closest('#hub-dialogue'),
      documentHasFocus: document.hasFocus(), visibility: document.visibilityState },
    dialog: { hidden: document.querySelector('#hub-dialogue')?.hidden, modal: document.querySelector('#hub-dialogue')?.getAttribute('aria-modal'),
      backgroundInert: document.querySelector('#app')?.inert },
    ui: { station: document.documentElement.dataset.hubStation || null, titleVisible: !document.querySelector('#title-screen')?.hidden,
      activeView: document.querySelector('.view.active')?.dataset.panel } };
}
const snapshot = () => page.evaluate(observed);
const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem('atf-v47-profile-1')));
async function dialogueGeometry() {
  return page.evaluate(() => {
    const layer = document.querySelector('#hub-dialogue-layer'), panel = document.querySelector('#hub-dialogue'), focused = document.activeElement;
    const bounds = element => {
      const box = element.getBoundingClientRect(), style = getComputedStyle(element);
      return { x: box.x, y: box.y, w: box.width, h: box.height, right: box.right, bottom: box.bottom,
        scrollTop: element.scrollTop, scrollLeft: element.scrollLeft, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight,
        overflowX: style.overflowX, overflowY: style.overflowY, display: style.display, visibility: style.visibility, opacity: style.opacity };
    };
    const rect = panel.getBoundingClientRect(), focusRect = focused.getBoundingClientRect();
    const inViewport = box => box.width > 0 && box.height > 0 && box.left >= -1 && box.top >= -1 && box.right <= innerWidth + 1 && box.bottom <= innerHeight + 1;
    const focusHit = document.elementFromPoint(focusRect.x + focusRect.width / 2, focusRect.y + focusRect.height / 2);
    const panelHit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    return { viewport: { w: innerWidth, h: innerHeight }, selectors: { layer: '#hub-dialogue-layer', panel: '#hub-dialogue' },
      layer: bounds(layer), panel: bounds(panel), focus: { id: focused.id, tag: focused.tagName, text: focused.textContent?.trim(), ...bounds(focused) },
      page: { x: scrollX, y: scrollY, bodyScrollTop: document.body.scrollTop, rootScrollTop: document.documentElement.scrollTop },
      panelInViewport: inViewport(rect), panelReceivesHit: !!panelHit && panel.contains(panelHit),
      focusedActionVisible: focused.tagName === 'BUTTON' && panel.contains(focused) && !focused.disabled && inViewport(focusRect)
        && focusRect.left >= rect.left - 1 && focusRect.top >= rect.top - 1 && focusRect.right <= rect.right + 1 && focusRect.bottom <= rect.bottom + 1
        && (focusHit === focused || focused.contains(focusHit)),
      layerHidden: layer.hidden, panelHidden: panel.hidden, panelAriaHidden: panel.getAttribute('aria-hidden') };
  });
}
function visibleDialogue(geometry) {
  return !geometry.layerHidden && !geometry.panelHidden && geometry.panelAriaHidden !== 'true'
    && geometry.panel.display !== 'none' && geometry.panel.visibility === 'visible' && Number(geometry.panel.opacity) > 0
    && geometry.panelInViewport && geometry.panelReceivesHit && geometry.focusedActionVisible;
}
async function writeReport() { await fs.writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2)); }
async function capture(label, evidence = null, selector = null) {
  const filename = `${String(++captureSerial).padStart(2, '0')}-${label}.png`;
  await (selector ? page.locator(selector) : page).screenshot({ path: join(output, filename), ...(selector ? {} : { fullPage: true }) });
  report.captures.push({ filename, label, state: evidence || await snapshot() }); await writeReport(); return filename;
}
function check(condition, label, evidence) {
  report.checks.push({ label, passed: !!condition, evidence });
  if (!condition) report.findings.push({ label, evidence, capture: report.captures.at(-1)?.filename });
  console.log(JSON.stringify({ check: label, passed: !!condition }));
}
async function freshContext(options) {
  const context = await browser.newContext({ serviceWorkers: 'block', ...options });
  page = await context.newPage(); page.setDefaultTimeout(25000);
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), failure: request.failure()?.errorText }));
  return context;
}
async function importHubProfile(save, name) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 });
  await page.locator('#title-options').click();
  await page.locator('#save-import').setInputFiles({ name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).last().waitFor();
  // The Command button opens the actual ship, preserving the imported idle pose.
  await navigate('command'); await navigate('hub');
  await page.waitForFunction(() => { const h = globalThis.__ATF_HUB__; return h?.running && h.player?.grounded && h.player.playerAppearanceVisualV126?.drawn; }, null, { timeout: 45000 });
  await page.locator('#hub-canvas').focus(); return snapshot();
}
async function navigate(view) {
  if (await page.locator('#menu-toggle').isVisible() && !(await page.locator('.rail').getAttribute('class')).split(/\s+/).includes('open')) {
    await page.locator('#menu-toggle').click();
  }
  await page.locator(`[data-view="${view}"]`).click();
}
function idleProfile() { const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'hub'; return save; }
async function canvasKey(code) { await page.locator('#hub-canvas').focus(); await page.keyboard.press(code); await page.waitForTimeout(150); return snapshot(); }
async function touchHold(control, milliseconds = 500, { cancel = false } = {}) {
  const button = page.locator(`[data-hub-control="${control}"]`); await button.scrollIntoViewIfNeeded();
  const bounds = await button.boundingBox(); assert.ok(bounds, `Visible ${control} touch control required.`);
  const session = await page.context().newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2, radiusX: 4, radiusY: 4 }] });
  try { await page.waitForTimeout(milliseconds); } finally { await session.send('Input.dispatchTouchEvent', { type: cancel ? 'touchCancel' : 'touchEnd', touchPoints: [] }); await session.detach(); }
}
async function showActualSaveNotification() {
  await page.locator('#exit-hub').click();
  const geometry = await page.evaluate(() => {
    const header = document.querySelector('.topbar').getBoundingClientRect(), button = document.querySelector('#quick-save'), b = button.getBoundingClientRect();
    const hit = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
    return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      header: { x: header.x, y: header.y, w: header.width, h: header.height },
      save: { x: b.x, y: b.y, w: b.width, h: b.height, reachable: hit === button || button.contains(hit) } };
  });
  report.commandHeaders.push(geometry); await capture(`command-header-${geometry.width}`, null, '.topbar');
  await page.locator('#quick-save').click();
  await page.getByText('Sauvegarde locale confirmée.', { exact: true }).last().waitFor(); await navigate('hub');
  await page.waitForFunction(() => { const hub = globalThis.__ATF_HUB__; return hub?.running && hub.player?.grounded && hub.player.playerAppearanceVisualV126?.drawn; });
}
async function mobileJourney() {
  const context = await freshContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const save = idleProfile(), lift = buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, 0).find(door => door.lift && door.roomId === 'briefing');
  Object.assign(save.hub, { deck: 0, roomId: 'briefing', positionX: lift.x - 22, positionY: 532 });
  const initial = await importHubProfile(save, 'controls-idle-midship-checkpoint.json');
  assert.ok(initial.lift, 'The imported idle checkpoint must actually stand at the physical shaft.');
  await showActualSaveNotification();
  const buttons = await page.locator('[data-hub-control]').evaluateAll(items => items.filter(item => !item.hidden).map(item => {
    const box = item.getBoundingClientRect(); return { control: item.dataset.hubControl, label: item.getAttribute('aria-label'), w: box.width, h: box.height, x: box.x, y: box.y };
  }));
  const layout = await page.evaluate(() => ({ width: innerWidth, viewportWidth: visualViewport?.width, scrollWidth: document.documentElement.scrollWidth }));
  await capture('mobile-real-shaft-controls');
  check(buttons.every(button => button.label && button.w >= 44 && button.h >= 44), 'Visible mobile controls have names and at least 44px touch targets', { buttons, layout });
  check(layout.scrollWidth <= layout.width + 1, 'Portrait hub reflows without horizontal page overflow', layout);
  const hitTargets = await page.locator('[data-hub-control]').evaluateAll(items => items.filter(item => !item.hidden).map(item => {
    const b = item.getBoundingClientRect(), hit = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
    return { control: item.dataset.hubControl, reachable: hit === item || item.contains(hit), interceptedBy: hit?.id || hit?.className };
  }));
  check(hitTargets.every(target => target.reachable), 'Portrait status text leaves every real touch target reachable', hitTargets);
  const toastGeometry = [];
  for (const width of [390, 320]) {
    if (width !== 390) { await page.setViewportSize({ width, height: 568 }); await showActualSaveNotification(); await capture('portrait-320-controls'); }
    const spacing = await page.evaluate(() => {
      const readout = document.querySelector('.hub-level-readout').getBoundingClientRect();
      const buttons = [...document.querySelectorAll('[data-hub-control]')].filter(button => !button.hidden);
      const toasts = [...document.querySelectorAll('.toast')].map(toast => toast.getBoundingClientRect()).filter(box => box.width && box.height);
      return { width: innerWidth, readout: { x: readout.x, y: readout.y, w: readout.width, h: readout.height },
        toastRects: toasts.map(box => ({ x: box.x, y: box.y, w: box.width, h: box.height })),
        toastOverlaps: buttons.filter(button => { const b = button.getBoundingClientRect();
          return toasts.some(toast => b.left < toast.right && b.right > toast.left && b.top < toast.bottom && b.bottom > toast.top);
        }).map(button => button.dataset.hubControl),
        overlaps: buttons.filter(button => { const b = button.getBoundingClientRect();
          return b.left < readout.right && b.right > readout.left && b.top < readout.bottom && b.bottom > readout.top;
        }).map(button => button.dataset.hubControl) };
    });
    check(!spacing.overlaps.length, `${width}px portrait keeps the status readout spatially clear of every touch control`, spacing);
    toastGeometry.push({ width: spacing.width, rects: spacing.toastRects, overlaps: spacing.toastOverlaps });
  }
  check(toastGeometry.every(item => item.rects.length > 0 && !item.overlaps.length),
    'The actual save notification leaves all touch labels visually clear at both portrait widths', toastGeometry);
  check(report.commandHeaders.every(item => item.scrollWidth <= item.width + 1 && item.header.x >= -1 && item.header.x + item.header.w <= item.width + 1 && item.save.reachable),
    'Both portrait Command headers reflow and expose the native Save button without horizontal page overflow', structuredClone(report.commandHeaders));
  await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(200);
  await showActualSaveNotification();
  await capture('landscape-real-shaft-controls');
  const landscapeToast = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('[data-hub-control]')].filter(button => !button.hidden);
    const toasts = [...document.querySelectorAll('.toast')].map(toast => toast.getBoundingClientRect()).filter(box => box.width && box.height);
    return { width: innerWidth, height: innerHeight,
      rects: toasts.map(box => ({ x: box.x, y: box.y, w: box.width, h: box.height })),
      overlaps: buttons.filter(button => { const b = button.getBoundingClientRect();
        return toasts.some(toast => b.left < toast.right && b.right > toast.left && b.top < toast.bottom && b.bottom > toast.top);
      }).map(button => button.dataset.hubControl) };
  });
  check(landscapeToast.rects.length > 0 && !landscapeToast.overlaps.length && landscapeToast.rects.every(box =>
    box.x >= 0 && box.y >= 0 && box.x + box.w <= landscapeToast.width + 1 && box.y + box.h <= landscapeToast.height + 1),
  'An actual save notification remains visible in landscape without covering any touch label', landscapeToast);
  await page.locator('[data-hub-control="down"]').tap(); await page.waitForTimeout(150); const down = await snapshot();
  await capture('touch-down-deck', down); check(down.deck === 1, 'Actual S touch control changes to the next physical deck', { before: initial.deck, after: down.deck, lift: down.lift });
  if (down.deck !== 1) assert.equal((await canvasKey('KeyS')).deck, 1, 'The same physical lift must work with the real canvas keyboard.');
  await page.locator('[data-hub-control="up"]').tap(); await page.waitForTimeout(150); const up = await snapshot();
  await capture('touch-up-deck', up); check(up.deck === 0, 'Actual W touch control returns through the same physical shaft', { deck: up.deck, lift: up.lift });
  if (up.deck !== 0) assert.equal((await canvasKey('KeyW')).deck, 0);
  await page.locator('[data-hub-control="down"]').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  const nativeEnter = await snapshot(); await capture('native-button-enter', nativeEnter);
  check(nativeEnter.deck === 1 && nativeEnter.projectiles === initial.projectiles,
    'A focused movement button activates natively with Enter without firing a gun', nativeEnter);
  if (nativeEnter.deck !== 1) assert.equal((await canvasKey('KeyS')).deck, 1);
  await page.locator('[data-hub-control="up"]').focus(); await page.keyboard.press('Space'); await page.waitForTimeout(200);
  const nativeSpace = await snapshot(); await capture('native-button-space', nativeSpace);
  check(nativeSpace.deck === 0 && nativeSpace.player.grounded,
    'A focused movement button activates natively with Space without issuing a gameplay jump', nativeSpace);
  if (nativeSpace.deck !== 0) assert.equal((await canvasKey('KeyW')).deck, 0);
  const beforeRight = await snapshot(); await touchHold('right', 350); await page.waitForTimeout(250); const releasedRight = await snapshot();
  await page.waitForTimeout(300); const settledRight = await snapshot(); await capture('touch-release-settled', settledRight);
  check(settledRight.player.x > beforeRight.player.x + 15 && !settledRight.keys.includes('KeyD') && Math.abs(settledRight.player.x - releasedRight.player.x) < 3,
    'A held native touch walks and its release leaves no remembered movement', { before: beforeRight.player, after: settledRight.player, keys: settledRight.keys });
  await touchHold('left', 200, { cancel: true }); await page.waitForTimeout(300);
  const cancelled = await snapshot(); await page.waitForTimeout(250); const afterCancel = await snapshot(); await capture('native-touch-cancel', afterCancel);
  check(!cancelled.keys.includes('KeyA') && Math.abs(afterCancel.player.x - cancelled.player.x) < 2,
    'A real browser touch cancellation releases the held control without retained drift', { cancelled, afterCancel });
  await context.close();
}
async function walkTo(x, { jumpAtObstacle = false } = {}) {
  const initial = await snapshot(), center = initial.player.x + initial.player.w / 2, right = x > center, code = right ? 'KeyD' : 'KeyA';
  if (Math.abs(x - center) < 10) return initial;
  await page.locator('#hub-canvas').focus(); await page.keyboard.down(code);
  let previous = center, stalled = 0;
  try {
    for (let attempt = 0; attempt < 120; attempt++) {
      await page.waitForTimeout(150); const state = await snapshot(), position = state.player.x + state.player.w / 2;
      if (right ? position >= x - 8 : position <= x + 8) return state;
      stalled = Math.abs(position - previous) < 2 ? stalled + 1 : 0; previous = position;
      if (stalled >= 5) {
        await capture('physical-route-obstruction', state);
        if (!jumpAtObstacle) throw Error(`Physical walking route stops at ${Math.round(position)} before ${Math.round(x)}.`);
        report.findings.push({ label: 'A hub backtracking route requires jumping over a physical obstacle', evidence: { position, target: x }, capture: report.captures.at(-1).filename });
        await page.keyboard.press('Space'); stalled = 0;
      }
    }
    throw Error(`Physical travel did not reach ${Math.round(x)}.`);
  } finally {
    await page.keyboard.up(code);
    await page.waitForFunction(() => Math.abs(globalThis.__ATF_HUB__.player.vx) < .4, null, { timeout: 5000 });
  }
}
async function desktopJourney() {
  const context = await freshContext({ viewport: { width: 1600, height: 1000 } });
  const initial = await importHubProfile(idleProfile(), 'controls-idle-human-hub-profile.json'), originalSave = await stored();
  await capture('desktop-human-start', initial);
  check(initial.focus.id === 'hub-canvas' && initial.player.alive && initial.player.grounded, 'The real hub launches a focused living human on the physical floor', initial);
  const npcX = initial.npcs[0]?.x + initial.npcs[0]?.w / 2; assert.ok(Number.isFinite(npcX));
  await walkTo(npcX); await canvasKey('KeyE');
  await page.locator('#hub-dialogue').waitFor({ state: 'visible' }); const dialogue = await snapshot();
  const openedGeometry = await dialogueGeometry(); await capture('dialogue-native-focus', { ...dialogue, geometry: openedGeometry });
  check(!dialogue.running && dialogue.focus.inDialogue && dialogue.dialog.modal === 'true' && dialogue.dialog.backgroundInert && visibleDialogue(openedGeometry),
    'A real conversation pauses the hub and opens a visible modal with a reachable focused action', { dialogue, geometry: openedGeometry });
  let tabContained = true;
  const tabGeometry = [];
  for (let n = 0; n < 32; n++) {
    await page.keyboard.press(n % 3 === 0 ? 'Shift+Tab' : 'Tab');
    const geometry = await dialogueGeometry(); tabGeometry.push({ key: n % 3 === 0 ? 'Shift+Tab' : 'Tab', ...geometry });
    tabContained &&= (await snapshot()).focus.inDialogue && visibleDialogue(geometry);
  }
  await page.keyboard.down('KeyD'); await page.waitForTimeout(250); await page.keyboard.up('KeyD');
  const paused = await snapshot(); await capture('dialogue-keyboard-contained', { ...paused, geometry: tabGeometry.at(-1) });
  check(tabContained && paused.time === dialogue.time && paused.player.x === dialogue.player.x,
    'Thirty-two native Tab steps keep the modal and focused action visible while gameplay remains paused', { paused, tabGeometry });
  await page.setViewportSize({ width: 320, height: 568 });
  const portraitGeometry = await dialogueGeometry(); await capture('dialogue-portrait-320-open', { state: await snapshot(), geometry: portraitGeometry });
  const portraitTabs = [];
  for (let n = 0; n < 32; n++) {
    await page.keyboard.press(n % 3 === 0 ? 'Shift+Tab' : 'Tab');
    portraitTabs.push({ key: n % 3 === 0 ? 'Shift+Tab' : 'Tab', ...await dialogueGeometry() });
  }
  const portraitPaused = await snapshot(); await capture('dialogue-portrait-320-keyboard', { state: portraitPaused, geometry: portraitTabs.at(-1) });
  check(visibleDialogue(portraitGeometry) && portraitTabs.every(visibleDialogue)
    && portraitPaused.time === dialogue.time && portraitPaused.player.x === dialogue.player.x,
    'At 320px the same real dialogue remains visible and every native Tab focus is reachable without advancing gameplay', { opened: portraitGeometry, portraitTabs });
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.keyboard.press('Escape'); await page.waitForTimeout(150); const closed = await snapshot();
  await capture('escape-focus-return', closed);
  check(closed.running && closed.focus.id === 'hub-canvas' && closed.dialog.hidden && !closed.dialog.backgroundInert,
    'Escape closes only the conversation and restores actual canvas focus and control', closed);
  const lift = closed.doors.find(door => door.lift && door.roomId === 'briefing'); assert.ok(lift);
  await walkTo(lift.x, { jumpAtObstacle: true }); const atLift = await snapshot(); await capture('walked-to-midship-lift', atLift);
  check(atLift.roomId === 'briefing' && atLift.lift?.id === lift.id && atLift.doors.some(door => !door.lift && door.progress > .05),
    'Actual travel crosses a physical bulkhead and reaches the median shaft', atLift);
  await canvasKey('KeyS'); const habitat = await snapshot(); await capture('habitat-arrival', habitat);
  check(habitat.deck === 1 && habitat.lift?.shaftId === atLift.lift.shaftId, 'Canvas S uses the physical shaft to reach Habitat', habitat);
  await walkTo(habitat.player.x + habitat.player.w / 2 - 180, { jumpAtObstacle: true });
  await walkTo(habitat.lift.x, { jumpAtObstacle: true }); await canvasKey('KeyS');
  const armoryX = await page.evaluate(() => {
    const hub = globalThis.__ATF_HUB__, bounds = hub.currentRoom().propInteractionBounds, center = bounds.x + bounds.w / 2;
    // Approach a free side of the same physical counter. A person at its
    // center legitimately advertises their own conversation on the E prompt.
    return [center - 170, center + 170, bounds.x + 20, bounds.x + bounds.w - 20, center]
      .find(x => x >= bounds.x && x <= bounds.x + bounds.w && hub.npcs.every(npc => Math.abs(x - npc.x - npc.w / 2) > 145)) ?? center;
  });
  await walkTo(armoryX, { jumpAtObstacle: true }); await canvasKey('KeyE');
  await page.locator('#hub-dialogue').waitFor({ state: 'visible' }); await page.locator('#hub-dialogue-continue').click();
  await page.locator('[data-panel="armory"].station-overlay').waitFor({ state: 'visible' });
  const station = await snapshot(); await capture('physical-armory-station-focus', station);
  const closeFocused = await page.locator('[data-panel="armory"] [data-close-hub-station]').evaluate(button => document.activeElement === button);
  await page.keyboard.down('KeyD'); await page.waitForTimeout(250); await page.keyboard.up('KeyD'); const stationStill = await snapshot();
  check(station.ui.station === 'armory' && !station.running && closeFocused && stationStill.time === station.time && stationStill.player.x === station.player.x,
    'The physical Armory station freezes the same actor and initially focuses its Return button', { station, stationStill });
  await page.keyboard.press('Escape'); await page.waitForTimeout(150); const stationClosed = await snapshot(); await capture('station-escape-same-pose', stationClosed);
  check(stationClosed.running && !stationClosed.ui.station && stationClosed.focus.id === 'hub-canvas' && stationClosed.player.x === station.player.x,
    'Escape closes the station and restores canvas focus at the same reached physical pose', stationClosed);
  await walkTo(habitat.lift.x, { jumpAtObstacle: true }); await canvasKey('KeyW'); await canvasKey('KeyW'); const returned = await snapshot();
  await capture('same-shaft-return', returned); check(returned.deck === 0 && returned.roomId === 'briefing', 'Backtracking and canvas W return through the same median shaft', returned);
  await walkTo(1500, { jumpAtObstacle: true }); await page.locator('#hub-canvas').focus();
  await page.keyboard.down('KeyA'); await page.waitForTimeout(100); const beforeExit = await snapshot();
  await page.locator('#exit-hub').focus(); await page.keyboard.press('Enter'); await page.locator('[data-panel="command"]').waitFor({ state: 'visible' });
  const afterExit = await snapshot(); await capture('native-exit-command', afterExit);
  check(!afterExit.running && afterExit.ui.activeView === 'command' && !afterExit.keys.includes('KeyA'),
    'Native Enter exits to Command and clears the held movement key before its physical keyup', { beforeExit, afterExit });
  await page.keyboard.up('KeyA');
  await page.locator('#quick-save').click(); await page.getByText('Sauvegarde locale confirmée.', { exact: true }).last().waitFor();
  const committed = await stored();
  check(Math.abs(committed.hub.positionX - afterExit.player.x) <= 1 && committed.hub.roomId === afterExit.roomId && committed.hub.deck === afterExit.deck,
    'The visible Save button durably commits the reached hub pose', committed.hub);
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 });
  await page.locator('#title-continue').click();
  if (!await page.evaluate(() => !!globalThis.__ATF_HUB__?.running)) await navigate('hub');
  await page.waitForFunction(() => globalThis.__ATF_HUB__?.running && globalThis.__ATF_HUB__.player?.grounded);
  const resumed = await snapshot(); await capture('reloaded-same-human-pose', resumed);
  check(resumed.deck === afterExit.deck && resumed.roomId === afterExit.roomId && Math.abs(resumed.player.x - afterExit.player.x) <= 1,
    'Reload and the real Continue flow restore the same reached pose', resumed);
  const originalPage = page; await page.locator('#hub-canvas').focus(); await page.keyboard.down('KeyA'); await page.waitForTimeout(180);
  const otherPage = await context.newPage(); await otherPage.goto('about:blank'); await otherPage.bringToFront(); await originalPage.waitForTimeout(250);
  const unfocused = await originalPage.evaluate(observed);
  await originalPage.bringToFront(); const blurred = await originalPage.evaluate(observed);
  await originalPage.keyboard.up('KeyA'); await otherPage.close(); page = originalPage;
  await page.waitForTimeout(350); const released = await snapshot(); await page.waitForTimeout(250); const settled = await snapshot();
  await capture('focus-loss-released', settled);
  if (!unfocused.focus.documentHasFocus || unfocused.focus.visibility === 'hidden') {
    check(!blurred.keys.includes('KeyA') && settled.keys.length === 0 && Math.abs(settled.player.x - released.player.x) < 2,
      'An actual browser focus loss discards a held movement key before keyup and does not retain drift on return', { unfocused, blurred, released, settled });
  } else {
    report.notExercised.push({ label: 'OS window blur / background tab input loss', reason: 'Headless bringToFront kept the original document focused and visible.', evidence: unfocused.focus });
    check(settled.keys.length === 0 && Math.abs(settled.player.x - released.player.x) < 2,
      'Physical keyboard release stops movement without retained drift; OS blur remains explicitly unexercised', { released, settled });
  }
  const finalSave = await stored();
  check(finalSave.player.name === originalSave.player.name && !finalSave.strategy.currentOperation
    && JSON.stringify(finalSave.galaxy.resources) === JSON.stringify(originalSave.galaxy.resources),
    'Hub control and resume checks create no campaign, free resource or identity change', { player: finalSave.player.name, resources: finalSave.galaxy.resources });
  await context.close();
}
async function main() {
  await fs.mkdir(output, { recursive: true }); const module = await playwright(), { chromium } = module.chromium ? module : module.default;
  browser = await chromium.launch({ headless: true, ...(process.env.ATF_CHROMIUM_EXECUTABLE ? { executablePath: process.env.ATF_CHROMIUM_EXECUTABLE } : {}) });
  if (scope !== 'desktop') await mobileJourney(); if (scope !== 'touch') await desktopJourney();
  assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.requestFailures, []);
  report.status = report.findings.length ? 'findings' : 'passed'; if (report.findings.length) process.exitCode = 1;
}
await main().catch(async error => {
  report.status = 'failed'; report.error = { message: error.message, stack: error.stack }; process.exitCode = 1;
  if (page && !page.isClosed()) { report.failureState = await snapshot().catch(() => null); await capture('failure', report.failureState).catch(() => {}); }
}).finally(async () => {
  report.finishedAt = new Date().toISOString(); await writeReport(); await browser?.close();
  console.log(JSON.stringify({ status: report.status, checks: report.checks.length, failures: report.checks.filter(check => !check.passed).length,
    findings: report.findings.length, error: report.error?.message, report: join(output, 'report.json') }));
});
