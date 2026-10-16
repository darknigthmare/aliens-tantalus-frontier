import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WEAPON_VISUAL_ASSETS_ALL_V63 } from '../src/weapon-visual-runtime-v63.js';
import { normalizePlayerAppearanceV126, PLAYER_APPEARANCE_SLOTS_V126, PLAYER_APPEARANCE_PRESETS_V129 } from '../src/player-appearance-v126.js';
import { PLAYER_MODULAR_RIG_ASSETS_V126 } from '../src/player-modular-rig-v126.js';
import { PLAYER_TRANSIT_RIG_ASSETS_V128 } from '../src/player-transit-rig-v128.js';
import { PLAYER_COLONIAL_RIG_ASSETS_V129 } from '../src/player-colonial-art-v129.js';
import { parseProject } from '../src/forge-model-v130.js';

// Optional visual smoke test: use an existing Playwright/Chromium installation.
// ATF_BASE_URL=https://preview.example ATF_PLAYER_QA_OUTPUT=/tmp/player-qa \
//   node scripts/qa-player-browser-v124.mjs
// It creates a fresh browser context and imports an editor plan through the UI.
// Browser evaluations only read the live runtime; no game/save state is injected.
const baseUrl = process.env.ATF_BASE_URL || 'http://127.0.0.1:4173';
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(process.env.ATF_PLAYER_QA_OUTPUT || join(tmpdir(), `atf-player-v124-${Date.now()}`));
const outputRelative = relative(repository, output);
if (!outputRelative || !outputRelative.startsWith('..') && !isAbsolute(outputRelative)) {
  throw new Error('ATF_PLAYER_QA_OUTPUT must be outside the repository; screenshots are review artifacts.');
}
await mkdir(output, { recursive: true });

async function playwrightModule() {
  const exportsOf = module => module.chromium ? module : module.default;
  if (process.env.ATF_PLAYWRIGHT_MODULE) return exportsOf(await import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href));
  try { return exportsOf(await import('playwright')); } catch (error) {
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) {
      const require = createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__player_qa__.cjs'));
      return require('playwright');
    }
    throw new Error('Install Playwright and Chromium in the QA environment before running this optional script.', { cause: error });
  }
}

const report = { schema: 129, baseUrl, startedAt: new Date().toISOString(), status: 'running',
  scenario: 'Production mission entered through Frontier Forge UI; isolated browser context.',
  checks: [], captures: [], pageErrors: [], requestFailures: [], weaponImageRequests: [], weaponImagePhases: [],
  appearanceImageRequests: [], appearanceImagePhases: [],
  limitations: ['No physical gamepad or mobile device is connected.',
    'The imported editor plans do not supply cover; physical cover interactions are covered by the production runtime integration suite.'] };
let browser, page;

try {
  const { chromium } = await playwrightModule();
  browser = await chromium.launch({ headless: process.env.ATF_HEADED !== '1',
    ...(process.env.ATF_CHROMIUM_EXECUTABLE ? { executablePath: process.env.ATF_CHROMIUM_EXECUTABLE } : {}) });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1, serviceWorkers: 'block' });
  page = await context.newPage();
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('requestfailed', request => report.requestFailures.push({ url: request.url(), failure: request.failure()?.errorText }));
  page.setDefaultTimeout(15000);
  // A replacement is an explicit UI confirmation, not an implicit file-input
  // side effect. Verify the exported document before launching its real runtime.
  const importPlan = async (plan, name) => {
    let unexpectedDialog = null;
    const confirmImport = async dialog => {
      if (dialog.type() === 'confirm' && dialog.message() === 'Remplacer le projet ouvert par ce fichier ? L’import reste annulable.') {
        await dialog.accept();
      } else {
        unexpectedDialog = `${dialog.type()}: ${dialog.message()}`;
        await dialog.dismiss();
      }
    };
    page.on('dialog', confirmImport);
    try {
      await page.locator('#editor-import').setInputFiles({ name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(plan)) });
      await page.waitForFunction(() => document.querySelector('#editor-import')?.value === '');
      assert.equal(unexpectedDialog, null, 'Only the expected Forge replacement confirmation may be accepted.');
      const downloading = page.waitForEvent('download');
      await page.locator('#editor-export').click();
      const download = await downloading, path = await download.path();
      assert.ok(path, 'The native Forge export must provide the imported document.');
      const exported = JSON.parse(await readFile(path, 'utf8'));
      assert.deepEqual(parseProject(exported), parseProject(plan), 'The playtest must use the requested plan, never a previous imported scene.');
      await download.delete();
    } finally {
      page.off('dialog', confirmImport);
    }
  };
  let requestPhase = 'boot';
  const catalogueImagePaths = new Set(Object.values(WEAPON_VISUAL_ASSETS_ALL_V63));
  const appearanceImagePaths = new Set([...PLAYER_MODULAR_RIG_ASSETS_V126, ...PLAYER_TRANSIT_RIG_ASSETS_V128,
    ...PLAYER_COLONIAL_RIG_ASSETS_V129].map(asset => asset.path));
  const network = await context.newCDPSession(page);
  await network.send('Network.enable');
  network.on('Network.requestWillBeSent', event => {
    const path = new URL(event.request.url).pathname;
    if (!catalogueImagePaths.has(path) && !appearanceImagePaths.has(path)) return;
    const frames = event.initiator?.stack?.callFrames || [];
    const entry = { phase: requestPhase, path, type: event.type,
      initiator: event.initiator?.type, functions: frames.slice(0, 6).map(frame => ({ name: frame.functionName,
        source: frame.url ? new URL(frame.url, baseUrl).pathname : null })) };
    if (catalogueImagePaths.has(path)) report.weaponImageRequests.push(entry);
    if (appearanceImagePaths.has(path)) report.appearanceImageRequests.push(entry);
  });

  const readLiveState = (includeCanvas = false) => {
    const engine = globalThis.__ATF_GAME__, actor = engine?.player;
    if (!engine || !actor) return null;
    const effects = engine.weaponEffectsV124;
    const descriptor = engine.weaponDescriptorV124?.(actor);
    return { running: engine.running, paused: engine.paused, loading: Boolean(engine.enemyAtlasLoadingPausedV65 || engine.userCasteLoadingV88),
      editorMode: engine.editorMode, phase: engine.mission?.state, elapsed: engine.animationTime,
      camera: { x: engine.camera?.x, y: engine.camera?.y },
      weapon: typeof descriptor === 'string' ? { id: descriptor } : { id: descriptor?.id, name: descriptor?.name },
      weaponRig: engine.playerWeaponRigSnapshotV125?.() || null,
      appearance: engine.playerAppearanceSnapshotV126?.() || null,
      coop: engine.coopEnabled && engine.coop ? { x: engine.coop.x, y: engine.coop.y, facing: engine.coop.facing,
        alive: engine.coop.alive, downed: engine.coop.downed, climbing: engine.coop.climbing,
        transit: engine.coop.playerTransitVisualV128 || null,
        w: engine.coop.w, h: engine.coop.h, grounded: engine.coop.grounded, health: engine.coop.health, maxHealth: engine.coop.maxHealth,
        ammo: engine.coop.ammo, ammoReserve: engine.coop.ammoReserve, shots: engine.coop.shots,
        fieldAction: engine.coop.fieldActionV124, placeableAction: engine.coop.placeableActionV124,
        action: engine.coop.playerActionVisualV127 || null,
        heldWeapon: engine.coop.heldWeaponVisualV125 || null, appearance: engine.coop.playerAppearanceVisualV126 || null } : null,
      resources: { medkits: engine.inventory?.medkits, trackerEnergy: engine.tracker?.energy, trackerPulses: engine.tracker?.pulses,
        equipment: [...(engine.equipmentActions?.values() || [])].map(item => ({ id: item.id, remaining: item.remaining, uses: item.uses })) },
      placeables: engine.getPlaceablesSnapshotV86?.() || null,
      enemies: (engine.enemies || []).map(enemy => ({ id: enemy.id, x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h,
        alive: enemy.alive, health: enemy.health })),
      pendingCycles: (engine.pendingWeaponCyclesV124 || []).map(event => ({ actorId: event.actorId, shotSerial: event.shotSerial, due: event.due })),
      effects: effects ? { ...engine.weaponEffectsSnapshotV124(),
        lights: effects.lights.map(light => ({ ...light, age: effects.time - light.bornAt })),
        casings: effects.casings.slice(-16).map(casing => ({ id: casing.id, weaponId: casing.weaponId,
          kind: casing.kind, casingKind: casing.casingKind, color: casing.color, x: casing.x, y: casing.y,
          vx: casing.vx, vy: casing.vy, angle: casing.angle, bornAt: casing.bornAt, resting: casing.resting,
          bounces: casing.bounces, supportKind: casing.supportKind })) } : null,
      ...(includeCanvas ? { canvasPng: document.querySelector('#game-canvas').toDataURL('image/png') } : {}),
      keys: [...(engine.keys || [])], player: { x: actor.x, y: actor.y, vx: actor.vx, vy: actor.vy,
        alive: actor.alive, downed: actor.downed, climbing: actor.climbing,
        transit: actor.playerTransitVisualV128 || null,
        w: actor.w, h: actor.h,
        grounded: actor.grounded, crouching: actor.crouching, aiming: actor.aimingV124, facing: actor.facing,
        health: actor.health, maxHealth: actor.maxHealth, ammo: actor.ammo, ammoReserve: actor.ammoReserve, shots: actor.shots,
        heldWeapon: actor.heldWeaponVisualV125 || null, aim: actor.combatAimV83,
        weaponMotion: actor.weaponRigMotionV125 ? { ...actor.weaponRigMotionV125 } : null,
        reloading: actor.reloading, movement: actor.movementV124, presentation: actor.playerPresentationV124,
        fieldAction: actor.fieldActionV124, placeableAction: actor.placeableActionV124,
        action: actor.playerActionVisualV127 || null, toolUseClock: actor.toolUseClock, meleeClock: actor.meleeClock,
        cover: actor.coverV124 ? { id: actor.coverV124.id, peeking: actor.coverV124.peeking } : null } };
  };
  const snapshot = () => page.evaluate(readLiveState);
  const capture = async (filename, label) => {
    await page.locator('#game-canvas').screenshot({ path: join(output, filename) });
    report.captures.push({ filename, label, state: await snapshot() });
  };
  const saveCanvasFrame = async (filename, label, frame) => {
    const { canvasPng, ...state } = frame;
    assert.ok(canvasPng?.startsWith('data:image/png;base64,'), 'The live canvas must be readable.');
    await writeFile(join(output, filename), Buffer.from(canvasPng.split(',')[1], 'base64'));
    report.captures.push({ filename, label, method: 'Read-only canvas framebuffer and runtime snapshot in one evaluation', state });
    return state;
  };
  const check = (label, evidence) => report.checks.push({ label, status: 'passed', evidence });
  const captureActorDetail = async (filename, label, role = 'player') => {
    const clip = await page.evaluate(role => {
      const engine = globalThis.__ATF_GAME__, actor = engine[role], canvas = document.querySelector('#game-canvas');
      const rect = canvas.getBoundingClientRect(), scaleX = rect.width / 1280, scaleY = rect.height / 720;
      const x = Math.max(0, rect.left + (actor.x - engine.camera.x - 70) * scaleX);
      const y = Math.max(0, rect.top + (actor.y - engine.camera.y - 35) * scaleY);
      return { x, y, width: Math.min((actor.w + 140) * scaleX, innerWidth - x),
        height: Math.min((actor.h + 65) * scaleY, innerHeight - y) };
    }, role);
    assert.ok(clip.width > 0 && clip.height > 0, 'The actor must be on screen for the detail capture.');
    await page.screenshot({ path: join(output, filename), clip });
    report.captures.push({ filename, label, method: 'Read-only browser screenshot cropped around the actual operator', role, state: await snapshot() });
  };
  const checkAppearance = (state, expected, role = 'player', label = 'Modular appearance') => {
    const operator = state.appearance?.operators.find(entry => entry.role === role);
    assert.ok(operator, `${label}: the actual operator has an observable selection.`);
    assert.equal(operator.visual.supported, true, `${label}: the current pose supports separated parts.`);
    assert.equal(operator.visual.ready, true, `${label}: required authored pages are ready.`);
    assert.equal(operator.visual.drawn, true, `${label}: the actual frame used the modular composition.`);
    assert.deepEqual(operator.visual.selected, operator.selected);
    if (expected) assert.deepEqual(operator.selected, expected, `${label}: the UI-selected kit reached this operator.`);
    for (const slot of PLAYER_APPEARANCE_SLOTS_V126) {
      const layers = operator.visual.layers.filter(layer => layer.slot === slot.id), itemId = operator.selected.slots[slot.id];
      if (itemId === null) assert.equal(layers.length, 0, `${label}: removed ${slot.id} has no rendered layer.`);
      else assert.ok(layers.length && layers.every(layer => layer.itemId === itemId), `${label}: ${slot.id} uses its own equipped piece.`);
    }
    assert.ok(state.appearance.images.retained <= 16, `${label}: the scene image cache stays within its bound.`);
    return operator;
  };
  const checkHeldPose = (state, label) => {
    const pose = state.player.heldWeapon;
    assert.ok(pose, `${label}: a real rendered held-weapon composition is required.`);
    assert.equal(pose.weaponId, state.weapon.id, `${label}: the rendered weapon must match the actual operator's weapon.`);
    assert.ok(Math.hypot(pose.nearHand.x - pose.grip.x, pose.nearHand.y - pose.grip.y) < 0.02, `${label}: hand remains on the grip.`);
    assert.ok(pose.nearReachError < 0.02 && pose.farReachError < 0.02, `${label}: arm targets remain reachable.`);
    assert.ok(state.weaponRig.images.retained <= state.weaponRig.images.limit, `${label}: weapon cache remains bounded.`);
    checkAppearance(state, null, 'player', label);
    return pose;
  };
  const checkActionPose = (state, kind, role = 'player') => {
    const actor = role === 'coop' ? state.coop : state.player;
    const operator = checkAppearance(state, role === 'coop' ? coopAppearance : primaryAppearance, role, `${role} ${kind}`);
    const action = actor.action || operator.visual.action;
    assert.equal(action?.kind, kind, 'The frame must contain the action actually accepted by the simulation.');
    assert.equal(action.firing, false); assert.equal(actor.heldWeapon, null, 'Working hands do not retain a second floating firearm.');
    assert.ok(action.progress >= 0 && action.progress <= 1);
    assert.ok(action.props.every(prop => prop.firing === false));
    return action;
  };
  const imagePhase = (label, state) => {
    report.weaponImagePhases.push({ label, requestPhase,
      requests: report.weaponImageRequests.filter(entry => entry.phase === requestPhase), cache: state?.weaponRig?.images || null });
    report.appearanceImagePhases.push({ label, requestPhase,
      requests: report.appearanceImageRequests.filter(entry => entry.phase === requestPhase), cache: state?.appearance?.images || null });
  };

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('#title-start').waitFor({ state: 'visible', timeout: 45000 });
  await page.locator('#title-start').click();
  await page.locator('#title-forge').waitFor({ state: 'visible', timeout: 45000 });
  await page.locator('#title-forge').click();
  await page.locator('#editor-canvas').waitFor({ state: 'visible' });
  const plan = { schema: 2, kind: 'mission', size: [32, 18], tiles: [
    ...Array.from({ length: 32 }, (_, column) => ({ position: `${column}:16`, type: 'floor' })),
    { position: '2:15', type: 'spawn' }, { position: '30:15', type: 'objective' },
    { position: '8:14', type: 'ladder' }, { position: '8:12', type: 'platform' },
    { position: '12:15', type: 'door' }, { position: '20:15', type: 'terminal' }
  ] };
  await importPlan(plan, 'player-v124-qa-stage.json');
  imagePhase('Before the first mission; armory catalogue has not been opened', await snapshot());
  requestPhase = 'first-forge-playtest';
  await page.locator('#editor-play').click();
  await page.locator('#game-canvas').waitFor({ state: 'visible' });
  await page.waitForFunction(() => {
    const engine = globalThis.__ATF_GAME__;
    return engine?.running && !engine.paused && !engine.enemyAtlasLoadingPausedV65 && !engine.userCasteLoadingV88
      && engine.player?.grounded && engine.player.heldWeaponVisualV125 && engine.player.playerAppearanceVisualV126?.drawn;
  }, null, { timeout: 45000 });
  const canvas = page.locator('#game-canvas');
  await canvas.focus(); await page.waitForTimeout(250);
  const initial = await snapshot(); assert.equal(initial.editorMode, true); assert.equal(initial.phase, 'active');
  checkHeldPose(initial, 'Initial deployment');
  await capture('01-idle.png', 'Idle in a production Forge playtest');
  check('Production playtest launched through the editor UI', initial);
  imagePhase('First active mission with its selected weapon', initial);

  await page.keyboard.down('KeyD'); await page.waitForTimeout(600);
  const running = await snapshot(); assert.ok(running.player.x > initial.player.x + 50);
  await capture('02-run.png', 'Running after a held movement key');
  await page.keyboard.up('KeyD'); await page.waitForTimeout(450);
  check('Movement advances the physical actor', { before: initial.player.x, after: running.player.x });

  await page.keyboard.down('KeyZ'); await page.waitForTimeout(150);
  const crouched = await snapshot(); assert.equal(crouched.player.crouching, true);
  await capture('03-crouch.png', 'Dedicated crouch input');
  await page.keyboard.down('ShiftLeft'); await page.keyboard.down('KeyD'); await page.waitForTimeout(300);
  const aimed = await snapshot();
  assert.equal(aimed.player.crouching, true); assert.equal(aimed.player.aiming, true);
  assert.equal(aimed.player.ammo, crouched.player.ammo); assert.ok(Math.abs(aimed.player.x - crouched.player.x) < 3);
  checkHeldPose(aimed, 'Crouched aim');
  await capture('04-crouch-aim.png', 'Stationary crouched aim');
  await page.keyboard.up('KeyD'); await page.keyboard.up('ShiftLeft'); await page.keyboard.up('KeyZ');
  check('Shift aiming preserves crouch without movement or ammo use', aimed.player);

  const beforeJump = await snapshot();
  await page.keyboard.down('Space');
  await page.waitForFunction(() => globalThis.__ATF_GAME__?.player?.vy < 0);
  const jumpStart = await snapshot(); assert.equal(jumpStart.player.grounded, false); assert.ok(jumpStart.player.vy < 0);
  await page.waitForTimeout(2600);
  const heldJump = await snapshot();
  assert.equal(heldJump.player.grounded, true); assert.ok(Math.abs(heldJump.player.y - beforeJump.player.y) < 1);
  await page.keyboard.up('Space');
  check('Holding jump through landing does not keep the actor bouncing', { launch: jumpStart.player, afterHold: heldJump.player });
  // Screenshot encoding can outlast a complete jump on a loaded CI runner.
  // A second real jump is paused through the keyboard so the image and state
  // both prove the airborne pose; the held-jump check above remains unpaused.
  await page.keyboard.down('Space');
  await page.waitForFunction(() => globalThis.__ATF_GAME__?.player?.vy < 0);
  await page.keyboard.press('KeyP');
  const frozenJump = await snapshot(); assert.equal(frozenJump.paused, true); assert.equal(frozenJump.player.grounded, false);
  await capture('05-jump.png', 'A second physical jump paused midair through the keyboard for inspection');
  await page.keyboard.up('Space'); await page.keyboard.press('KeyP');
  await page.waitForFunction(() => globalThis.__ATF_GAME__?.player?.grounded);

  const rect = await canvas.boundingBox();
  await page.mouse.move(rect.x + rect.width * 0.77, rect.y + rect.height * 0.45);
  const beforeAim = await snapshot();
  await page.mouse.down({ button: 'right' }); await page.waitForTimeout(250);
  assert.equal((await snapshot()).player.ammo, beforeAim.player.ammo);
  await saveCanvasFrame('06a-before-fire.png', 'Aimed scene immediately before the real shot, without muzzle lighting', await page.evaluate(readLiveState, true));
  await page.mouse.down({ button: 'left' });
  // The muzzle light lasts only milliseconds. Read the already drawn framebuffer
  // and the live effect clock together; neither the simulation nor canvas is edited.
  let firing;
  for (let attempt = 0; attempt < 8 && !firing; attempt++) {
    await page.waitForFunction(() => {
      const engine = globalThis.__ATF_GAME__, actor = engine?.player, visual = actor?.heldWeaponVisualV125;
      const runtime = engine?.weaponEffectsV124;
      return visual && visual.shotSerial === actor.shots && visual.timeSeconds === engine.animationTime
        && runtime?.lights.some(light => runtime.time - light.bornAt < light.duration * 0.5);
    }, null, { polling: 'raf', timeout: 10000 });
    const frame = await page.evaluate(readLiveState, true);
    // Pointer input may accept another shot between the wait and this read.
    // Certify that the framebuffer belongs to this exact simulation/shot too.
    if (frame.player.heldWeapon?.shotSerial === frame.player.shots
      && frame.player.heldWeapon?.timeSeconds === frame.elapsed
      && frame.effects?.lights.some(light => light.age >= 0 && light.age < light.duration * 0.8)) {
      firing = await saveCanvasFrame('06-fire.png', 'A real RMB/LMB shot with its live scene light and ejected case', frame);
    }
  }
  assert.ok(firing, 'A live muzzle flash must be captured, not inferred from past shot counters.');
  assert.ok(firing.player.shots > beforeAim.player.shots);
  assert.ok(firing.effects.counts.casings > 0);
  const firingPose = checkHeldPose(firing, 'Live shot');
  assert.ok(firing.effects.lights.some(light => Math.hypot(light.x - firingPose.muzzle.x, light.y - firingPose.muzzle.y) < 0.02),
    'The live rendered flash must follow the actual carried muzzle.');
  await page.mouse.up({ button: 'left' });
  const shotsAfterRelease = (await snapshot()).player.shots;
  await page.waitForTimeout(300);
  const aimOnly = await snapshot();
  assert.equal(aimOnly.player.aiming, true); assert.equal(aimOnly.player.shots, shotsAfterRelease);
  await page.mouse.up({ button: 'right' });
  check('RMB aim and LMB fire remain independent on press and release', { beforeAim: beforeAim.player, firing: firing.player, aimOnly: aimOnly.player });
  check('An accepted UI shot ejects a case and lights the actual rendered scene', { weapon: firing.weapon, effects: firing.effects });

  await canvas.focus(); await page.keyboard.press('KeyR');
  await page.waitForFunction(() => globalThis.__ATF_GAME__?.player?.reloading);
  await capture('07-reload.png', 'Timed tactical reload');
  await page.waitForFunction(() => !globalThis.__ATF_GAME__?.player?.reloading);
  assert.ok((await snapshot()).player.ammo > aimOnly.player.ammo);
  check('Reload completes on the live simulation clock', (await snapshot()).player);

  await page.waitForFunction(() => {
    const runtime = globalThis.__ATF_GAME__?.weaponEffectsV124;
    return runtime && runtime.lights.length === 0 && runtime.casings.some(casing => casing.resting);
  });
  await page.waitForTimeout(3000);
  const groundedCasings = await saveCanvasFrame('09-casings-ground.png', 'Spent cases remain on the physical floor after the muzzle light expires', await page.evaluate(readLiveState, true));
  assert.equal(groundedCasings.effects.counts.lights, 0);
  assert.ok(groundedCasings.effects.counts.resting > 0);
  assert.ok(groundedCasings.effects.casings.some(casing => casing.resting && casing.weaponId === firing.weapon.id));
  check('Spent cases settle and persist after the flash and reload', { weapon: groundedCasings.weapon, effects: groundedCasings.effects });

  await page.keyboard.down('KeyD');
  const otherTab = await context.newPage(); await otherTab.goto('about:blank'); await otherTab.bringToFront();
  await page.waitForTimeout(250);
  const focusState = await page.evaluate(() => ({ visibility: document.visibilityState, focused: document.hasFocus() }));
  const exposesFocusChange = focusState.visibility !== 'visible' || !focusState.focused;
  if (exposesFocusChange) await page.waitForFunction(() => globalThis.__ATF_GAME__?.paused, null, { timeout: 5000 });
  await page.bringToFront(); await page.keyboard.up('KeyD'); await otherTab.close();
  if (!exposesFocusChange) {
    report.limitations.push('This browser keeps document.hasFocus() true and visibilityState visible after bringToFront on another tab; physical focus loss is not validated in this run.');
    await canvas.focus(); await page.keyboard.down('KeyD'); await page.keyboard.press('KeyP');
  }
  const paused = await snapshot(); assert.equal(paused.paused, true); assert.equal(paused.keys.length, 0);
  await page.keyboard.up('KeyD');
  await capture('08-pause.png', exposesFocusChange ? 'Focus loss pauses and clears input' : 'Pause shortcut clears held movement');
  check(exposesFocusChange ? 'Switching browser tabs releases held movement and pauses' : 'Pause shortcut clears held movement', { ...paused, observedFocus: focusState });
  await canvas.focus(); await page.keyboard.press('KeyP');
  await page.waitForFunction(() => !globalThis.__ATF_GAME__?.paused);
  await page.locator('#retreat-mission').click();
  await page.locator('#editor-canvas').waitFor({ state: 'visible' });
  assert.equal((await snapshot()).running, false);
  check('Returning from the playtest stops the runtime', { editorVisible: true });

  // Change the campaign loadout through the armory UI in this disposable local
  // browser profile, then launch the same Forge plan again. Catalogue DOM image
  // requests are kept in their own phase and never counted as gameplay decoding.
  imagePhase('First playtest completed', groundedCasings);
  requestPhase = 'armory-ui-selection';
  await page.locator('#return-title').click();
  await page.locator('#title-start').click();
  await page.locator('#title-options').click();
  await page.locator('#nav [data-view="armory"]').click();
  await page.locator('#armory-search').fill('M37A2 Pump Shotgun');
  const selectedWeaponId = 'weapon-007-m37a2-pump-shotgun';
  await page.locator(`[data-procure-id="${selectedWeaponId}"]`).first().click();
  await page.locator(`[data-equip-id="${selectedWeaponId}"]`).first().click();
  await page.waitForFunction(id => [...document.querySelectorAll(`[data-equip-id="${id}"]`)].some(button => button.disabled), selectedWeaponId);
  const selectedSentryId = 'equipment-020-portable-sentry';
  await page.locator('#armory-kind').selectOption('equipment');
  await page.locator('#armory-search').fill('Portable Sentry');
  await page.locator(`[data-procure-id="${selectedSentryId}"]`).first().click();
  await page.locator(`[data-equip-id="${selectedSentryId}"]`).first().click();
  await page.waitForFunction(id => [...document.querySelectorAll(`[data-equip-id="${id}"]`)].some(button => button.disabled), selectedSentryId);
  imagePhase('Catalogue procurement and equipment selection; DOM requests are separate', await snapshot());

  // Each kit is equipped with real armory buttons. A separate owner tab and a
  // page reload prove both independence and actual durable storage. The preview
  // has its own image lifecycle; none of its requests count as gameplay loads.
  requestPhase = 'armory-appearance-ui';
  let primaryAppearance = normalizePlayerAppearanceV126({ schema: 126, slots: {
    helmet: 'helmet-patrol-v126', mask: 'mask-rebreather-v126', torso: 'torso-utility-v126',
    arms: 'arms-utility-v126', legs: 'legs-utility-v126', back: 'back-radio-v126'
  } });
  let coopAppearance = normalizePlayerAppearanceV126({ schema: 126, slots: {
    helmet: null, mask: null, torso: 'torso-marine-v126',
    arms: 'arms-marine-v126', legs: 'legs-utility-v126', back: null
  } });
  const panel = page.locator('#player-appearance-v126');
  const readPanelSelection = async owner => {
    const slots = await panel.locator(`[data-appearance-owner-v126="${owner}"][data-appearance-slot-v126][aria-pressed="true"]`)
      .evaluateAll(buttons => buttons.map(button => [button.dataset.appearanceSlotV126, button.dataset.appearanceItemV126 || null]));
    assert.equal(slots.length, 6, 'Exactly one UI choice is selected per appearance slot.');
    return { schema: 126, slots: Object.fromEntries(slots) };
  };
  const chooseOwner = async owner => {
    await panel.locator(`[data-appearance-owner-v126="${owner}"]:not([data-appearance-slot-v126]):not([data-appearance-preset-v129])`).click();
    await page.waitForFunction(() => document.querySelector('#player-appearance-preview-v126')?.dataset.appearanceReadyV126 === 'true');
  };
  const choosePiece = async (owner, slot, itemId) => {
    const selector = `[data-appearance-owner-v126="${owner}"][data-appearance-slot-v126="${slot}"][data-appearance-item-v126="${itemId || ''}"]`;
    await panel.locator(selector).click();
    await page.waitForFunction(selector => document.querySelector(selector)?.getAttribute('aria-pressed') === 'true', selector);
  };
  const choosePreset = async (owner, presetId) => {
    const preset = PLAYER_APPEARANCE_PRESETS_V129.find(entry => entry.id === presetId);
    assert.ok(preset, 'A real catalogue preset is required.');
    const selector = `[data-appearance-owner-v126="${owner}"][data-appearance-preset-v129="${presetId}"]`;
    await panel.locator(selector).click();
    await page.waitForFunction(selector => document.querySelector(selector)?.getAttribute('aria-pressed') === 'true'
      && document.querySelector('#player-appearance-preview-v126')?.dataset.appearanceReadyV126 === 'true', selector);
    const expected = normalizePlayerAppearanceV126({ schema: 126, slots: preset.slots });
    assert.deepEqual(await readPanelSelection(owner), expected);
    return expected;
  };
  const capturePreview = async (filename, label, owner) => {
    await page.waitForFunction(() => document.querySelector('#player-appearance-preview-v126')?.dataset.appearanceReadyV126 === 'true');
    const canvasPng = await page.locator('#player-appearance-preview-v126').evaluate(canvas => canvas.toDataURL('image/png'));
    assert.ok(canvasPng.startsWith('data:image/png;base64,'));
    await writeFile(join(output, filename), Buffer.from(canvasPng.split(',')[1], 'base64'));
    const facing = Number(await panel.locator('[data-appearance-facing-v126][aria-pressed="true"]').getAttribute('data-appearance-facing-v126'));
    report.captures.push({ filename, label, method: 'Read-only preview canvas framebuffer',
      state: { owner, selected: await readPanelSelection(owner), facing, ready: true } });
  };
  await chooseOwner('player');
  for (const [slot, itemId] of Object.entries(primaryAppearance.slots)) await choosePiece('player', slot, itemId);
  assert.deepEqual(await readPanelSelection('player'), primaryAppearance);
  await panel.locator('[data-appearance-facing-v126="1"]').click();
  await capturePreview('16-appearance-j1-right.png', 'J1 after six actual appearance selections, right-facing preview', 'player');
  check('All six J1 appearance slots can be equipped through the actual armory UI', primaryAppearance);
  await panel.locator('[data-appearance-facing-v126="-1"]').click();
  assert.equal(await panel.locator('[data-appearance-facing-v126="-1"]').getAttribute('aria-pressed'), 'true');
  await capturePreview('17-appearance-j1-left.png', 'The same six equipped pieces mirrored by the actual preview control', 'player');
  assert.deepEqual(await readPanelSelection('player'), primaryAppearance);
  check('The preview mirror control preserves the selected loadout', { selected: primaryAppearance, previewFacings: [1, -1] });

  const readCampaignInventory = () => page.evaluate(() => {
    const save = globalThis.__ATF_V51__.saveSystem.data;
    return { resources: { ...save.galaxy.resources }, weaponIds: [...save.player.weaponIds], equipmentIds: [...save.player.equipmentIds],
      ammo: { ...save.player.ammo }, appearance: save.player.appearanceV126, coopAppearance: save.player.coopAppearanceV126 };
  });
  const { appearance: priorAppearance, ...costumeInventory } = await readCampaignInventory();
  const costumeEvidence = [];
  await panel.locator('#player-appearance-animation-v127').selectOption('idle');
  for (const preset of PLAYER_APPEARANCE_PRESETS_V129) {
    const selected = await choosePreset('player', preset.id);
    for (const facing of [1, -1]) {
      await panel.locator(`[data-appearance-facing-v126="${facing}"]`).click();
      await capturePreview(`32-${preset.id}-${facing > 0 ? 'right' : 'left'}.png`,
        `Film-reference outfit selected through its actual armory button: ${preset.name || preset.label}, facing ${facing}`, 'player');
    }
    const { appearance: currentAppearance, ...afterCostume } = await readCampaignInventory();
    assert.deepEqual(afterCostume, costumeInventory, 'A costume preset must preserve resources, weapons, equipment, ammo and J2.');
    costumeEvidence.push({ presetId: preset.id, selected, facings: [1, -1], ready: true });
  }
  primaryAppearance = await choosePreset('player', 'uscm-hicks-v129');
  check('All four film-reference costumes render in both orientations through the real armory without changing equipment', costumeEvidence);
  const previewInventory = await readCampaignInventory();
  const previewModes = ['idle', 'walk', 'crouch', 'aim', 'reload', 'medical', 'deploy', 'interact', 'melee',
    'climb-up', 'climb-down', 'downed', 'death', 'revive'];
  const previewEvidence = [];
  for (const mode of previewModes) {
    await panel.locator('#player-appearance-animation-v127').selectOption(mode);
    await page.waitForFunction(mode => {
      const canvas = document.querySelector('#player-appearance-preview-v126');
      return canvas?.dataset.appearanceReadyV126 === 'true' && canvas.dataset.appearanceAnimationV127 === mode;
    }, mode);
    await page.waitForTimeout(mode === 'reload' ? 1000 : 250);
    assert.deepEqual(await readPanelSelection('player'), primaryAppearance);
    if (mode === 'walk') {
      const frame = await panel.locator('#player-appearance-preview-v126').evaluate(canvas => canvas.toDataURL('image/png'));
      // Two fixed-delay samples can land on the same repeating pose, or
      // before a busy browser has drawn again. Require a different real
      // framebuffer within a bounded interval; a frozen preview still fails.
      const changed = await page.waitForFunction(previous => {
        const canvas = document.querySelector('#player-appearance-preview-v126');
        if (canvas?.dataset.appearanceReadyV126 !== 'true' || canvas.dataset.appearanceAnimationV127 !== 'walk') return null;
        const current = canvas.toDataURL('image/png');
        return current !== previous ? current : null;
      }, frame, { polling: 'raf', timeout: 5000 });
      try { assert.notEqual(await changed.jsonValue(), frame, 'The selected walk preview must animate actual canvas pixels.'); }
      finally { await changed.dispose(); }
    }
    await capturePreview(`21-preview-${mode}.png`, `Actual animation selector: ${mode}, with the six selected J1 pieces`, 'player');
    previewEvidence.push({ mode, facing: -1, ready: true });
  }
  assert.deepEqual(await readCampaignInventory(), previewInventory, 'Inspecting an animation cannot spend or replace campaign equipment.');
  check('All fourteen animation preview modes draw the selected parts without altering campaign inventory', previewEvidence);

  await chooseOwner('coop');
  for (const [slot, itemId] of Object.entries(primaryAppearance.slots)) await choosePiece('coop', slot, itemId);
  for (const [slot, itemId] of Object.entries(coopAppearance.slots)) await choosePiece('coop', slot, itemId);
  assert.deepEqual(await readPanelSelection('coop'), coopAppearance);
  await panel.locator('[data-appearance-facing-v126="1"]').click();
  await capturePreview('18-appearance-j2.png', 'J2 prepared separately, with head, mask and back options removed', 'coop');
  await panel.screenshot({ path: join(output, '19-appearance-armory.png') });
  report.captures.push({ filename: '19-appearance-armory.png', label: 'Real six-slot armory with J2 selected',
    state: { owner: 'coop', selected: await readPanelSelection('coop') } });
  await chooseOwner('player');
  assert.deepEqual(await readPanelSelection('player'), primaryAppearance, 'J2 changes do not overwrite J1.');
  check('All six J2 slots are independent and optional pieces can be removed without altering J1',
    { player: primaryAppearance, coop: coopAppearance });
  await chooseOwner('coop');
  coopAppearance = await choosePreset('coop', 'uscm-smartgunner-v129');
  await capturePreview('33-vasquez-j2.png', 'Vasquez smartgunner pieces assigned only to J2 through the real preset button', 'coop');
  await panel.screenshot({ path: join(output, '34-colonial-armory.png') });
  report.captures.push({ filename: '34-colonial-armory.png', label: 'Actual colonial costume armory with independent J1 Hicks and J2 Vasquez selections',
    state: { player: primaryAppearance, coop: coopAppearance } });
  await chooseOwner('player');
  assert.deepEqual(await readPanelSelection('player'), primaryAppearance);
  check('J1 Hicks and J2 Vasquez remain independently equipped through the actual costume presets',
    { player: primaryAppearance, coop: coopAppearance });
  imagePhase('Actual appearance UI, its preview loads and separate owners', await snapshot());
  await page.locator('#nav [data-view="settings"]').click();
  await page.locator('#setting-coop').check();

  requestPhase = 'appearance-refresh-ui';
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#title-start').waitFor({ state: 'visible', timeout: 45000 });
  await page.locator('#title-start').click();
  await page.locator('#title-options').click();
  await page.locator('#nav [data-view="settings"]').click();
  assert.equal(await page.locator('#setting-coop').isChecked(), true, 'Local coop activation survives storage and reload.');
  await page.locator('#nav [data-view="armory"]').click();
  await chooseOwner('player'); assert.deepEqual(await readPanelSelection('player'), primaryAppearance);
  await chooseOwner('coop'); assert.deepEqual(await readPanelSelection('coop'), coopAppearance);
  check('Both appearance selections and coop activation survive a real page reload',
    { player: primaryAppearance, coop: coopAppearance, coopEnabled: true });
  imagePhase('Reloaded UI reads persisted selections before deployment', await snapshot());
  await page.locator('#return-title').click();
  await page.locator('#title-start').click();
  await page.locator('#title-forge').click();
  await importPlan(plan, 'player-v126-qa-stage.json');
  requestPhase = 'second-forge-playtest';
  await page.locator('#editor-play').click();
  await page.waitForFunction(id => {
    const engine = globalThis.__ATF_GAME__;
    return engine?.running && !engine.paused && engine.player?.grounded && engine.player.heldWeaponVisualV125?.weaponId === id
      && engine.player.playerAppearanceVisualV126?.drawn && engine.coopEnabled && engine.coop?.playerAppearanceVisualV126?.drawn;
  }, selectedWeaponId, { timeout: 45000 });
  await canvas.focus(); await page.waitForTimeout(250);
  const selected = await saveCanvasFrame('11-selected-shotgun.png', 'M37A2 selected through the armory and carried on the next real deployment', await page.evaluate(readLiveState, true));
  assert.equal(selected.weapon.id, selectedWeaponId); checkHeldPose(selected, 'Selected shotgun');
  checkAppearance(selected, primaryAppearance, 'player', 'J1 redeployment');
  checkAppearance(selected, coopAppearance, 'coop', 'J2 redeployment');
  assert.notEqual(selected.player.heldWeapon.path, initial.player.heldWeapon.path);
  imagePhase('Second mission after the actual UI weapon change', selected);
  check('Actual armory selection changes the held native image on the next deployment', { before: initial.weapon,
    after: selected.weapon, beforePath: initial.player.heldWeapon.path, afterPath: selected.player.heldWeapon.path });
  check('The next real Forge deployment renders both persisted six-slot kits on their own operators', selected.appearance);

  const selectedRect = await canvas.boundingBox();
  await page.mouse.move(selectedRect.x + selectedRect.width * 0.03, selectedRect.y + selectedRect.height * 0.4);
  await page.mouse.down({ button: 'right' }); await page.waitForTimeout(180);
  const mirrored = await saveCanvasFrame('12-shotgun-left-aim.png', 'Actual shotgun and both hands aim left', await page.evaluate(readLiveState, true));
  const mirroredPose = checkHeldPose(mirrored, 'Left-facing shotgun');
  assert.equal(mirrored.player.facing, -1); assert.ok(mirroredPose.muzzle.x < mirroredPose.grip.x);
  await page.mouse.move(selectedRect.x + selectedRect.width * 0.77, selectedRect.y + selectedRect.height * 0.18);
  await page.waitForTimeout(180);
  const diagonal = await saveCanvasFrame('13-shotgun-diagonal.png', 'The held shotgun and articulated hands follow diagonal mouse aim', await page.evaluate(readLiveState, true));
  checkHeldPose(diagonal, 'Diagonal shotgun'); assert.ok(diagonal.player.aim.y < -0.2);
  await page.keyboard.down('KeyD'); await page.waitForTimeout(300);
  const movingAim = await saveCanvasFrame('14-shotgun-moving-aim.png', 'Physical locomotion continues beneath the aimed gun and arms', await page.evaluate(readLiveState, true));
  await page.keyboard.up('KeyD');
  checkHeldPose(movingAim, 'Moving shotgun aim'); assert.ok(movingAim.player.x > diagonal.player.x + 10);
  check('Left, diagonal and moving aim keep the equipped gun and both hand targets connected',
    { mirrored: mirrored.player.heldWeapon, diagonal: diagonal.player.heldWeapon, moving: movingAim.player.heldWeapon });

  await page.keyboard.down('KeyZ'); await page.waitForTimeout(140);
  const customCrouch = await saveCanvasFrame('20-equipped-crouch-aim.png', 'Selected torso, arms, legs and optional gear remain composed in crouched aim', await page.evaluate(readLiveState, true));
  assert.equal(customCrouch.player.crouching, true); checkHeldPose(customCrouch, 'Equipped crouched aim');
  checkAppearance(customCrouch, primaryAppearance, 'player', 'Equipped crouched aim');
  await page.keyboard.up('KeyZ'); await page.waitForTimeout(120);
  check('The equipped parts remain composed and connected to the gun during crouched aim', customCrouch.appearance);

  await page.mouse.down({ button: 'left' });
  await page.waitForFunction(shots => globalThis.__ATF_GAME__?.player?.shots > shots, movingAim.player.shots);
  await page.mouse.up({ button: 'left' }); await page.mouse.up({ button: 'right' });
  await page.waitForTimeout(300); await page.keyboard.press('KeyR');
  await page.waitForFunction(() => globalThis.__ATF_GAME__?.player?.reloading);
  const reloadStart = await snapshot();
  await page.keyboard.down('KeyD'); await page.waitForTimeout(260);
  const movingReload = await saveCanvasFrame('15-shotgun-moving-reload.png', 'The actual timed reload moves its service hand while the operator walks', await page.evaluate(readLiveState, true));
  await page.keyboard.up('KeyD');
  const reloadPose = checkHeldPose(movingReload, 'Moving shotgun reload');
  assert.equal(movingReload.player.reloading, true); assert.ok(reloadPose.reloadProgress > 0 && reloadPose.reloadProgress < 1);
  assert.ok(movingReload.player.x > reloadStart.player.x + 10);
  assert.ok(movingReload.player.weaponMotion.distance > reloadStart.player.weaponMotion.distance);
  await page.waitForFunction(() => !globalThis.__ATF_GAME__?.player?.reloading);
  const completedReload = await snapshot(); checkHeldPose(completedReload, 'Completed shotgun reload');
  assert.ok(completedReload.player.ammo > movingReload.player.ammo);
  check('Reload service-hand progress and ground locomotion share the live simulation clock',
    { start: reloadStart.player, moving: movingReload.player, completed: completedReload.player });
  imagePhase('Second mission completed; gameplay cache remains bounded', completedReload);
  await page.locator('#retreat-mission').click();
  await page.locator('#editor-canvas').waitFor({ state: 'visible' });
  assert.equal((await snapshot()).running, false);

  // The editor's hazard damages both real operators. This supplies a valid
  // medical target without assigning health, action clocks or saved inventory.
  const actionPlan = { schema: 2, kind: 'mission', size: [32, 18], tiles: [
    ...Array.from({ length: 32 }, (_, column) => ({ position: `${column}:16`, type: 'floor' })),
    { position: '2:15', type: 'spawn' }, { position: '30:15', type: 'objective' },
    { position: '4:15', type: 'hazard' }
  ] };
  await importPlan(actionPlan, 'player-actions-v127-qa-stage.json');
  requestPhase = 'third-forge-actions';
  await page.locator('#editor-play').click();
  await page.waitForFunction(() => {
    const engine = globalThis.__ATF_GAME__;
    return engine?.running && !engine.paused && engine.player.grounded && engine.coopEnabled
      && engine.player.playerAppearanceVisualV126?.drawn && engine.coop.playerAppearanceVisualV126?.drawn;
  }, null, { timeout: 45000 });
  await canvas.focus();
  const freezeAction = async (role, kind, filename, label, { freeze = true } = {}) => {
    await page.waitForFunction(({ role, kind }) => {
      const actor = globalThis.__ATF_GAME__?.[role];
      return actor?.playerAppearanceVisualV126?.drawn && actor.playerActionVisualV127?.kind === kind;
    }, { role, kind });
    const live = await saveCanvasFrame(filename, label, await page.evaluate(readLiveState, true));
    checkActionPose(live, kind, role);
    // Combat can legitimately replace a short strike with a hurt pose while
    // an additional screenshot is encoding. Its synchronous framebuffer and
    // simulation snapshot above are the authoritative observation.
    if (!freeze) return live;
    await captureActorDetail(filename.replace('.png', '-detail.png'), `${label} — operator detail`, role);
    await canvas.focus(); await page.keyboard.press('KeyP');
    const frozen = await snapshot();
    assert.equal(frozen.paused, true); const action = checkActionPose(frozen, kind, role);
    await page.waitForTimeout(140);
    const still = await snapshot();
    assert.equal((role === 'coop' ? still.coop : still.player).action.elapsed, action.elapsed, 'Pause freezes the actual action pose.');
    await canvas.focus(); await page.keyboard.press('KeyP');
    return live;
  };
  const medicalEvidence = [];
  for (const role of ['player', 'coop']) {
    const initialActor = role === 'coop' ? (await snapshot()).coop : (await snapshot()).player;
    const right = role === 'coop' ? 'KeyL' : 'KeyD', left = role === 'coop' ? 'KeyJ' : 'KeyA';
    await canvas.focus(); await page.keyboard.down(right);
    await page.waitForFunction(({ role, health }) => globalThis.__ATF_GAME__?.[role]?.health < health,
      { role, health: initialActor.health }, { timeout: 10000 });
    await page.keyboard.up(right); await page.keyboard.down(left);
    await page.waitForFunction(role => {
      const engine = globalThis.__ATF_GAME__, actor = engine[role];
      return actor.x + actor.w < engine.hazards[0].x - 24;
    }, role);
    await page.keyboard.up(left);
    await page.waitForFunction(role => {
      const actor = globalThis.__ATF_GAME__[role];
      return actor.grounded && !(actor.v52HurtClock > 0) && !(actor.shockClock > 0);
    }, role);
    const wounded = await snapshot(), woundedActor = role === 'coop' ? wounded.coop : wounded.player;
    assert.ok(woundedActor.health < initialActor.health && woundedActor.health > 0);
    await page.keyboard.press(role === 'coop' ? 'KeyG' : 'KeyH');
    await page.waitForTimeout(280);
    const working = await freezeAction(role, 'medical', `22-${role}-medical.png`, `${role}: selected modular outfit during actual medical work`);
    assert.equal(working.resources.medkits, wounded.resources.medkits, 'Preparing medical work has not consumed a kit.');
    await page.locator('[data-placeable-operator]').selectOption(role);
    await page.locator('[data-placeable-action="cancel-field"]').click();
    await page.waitForFunction(role => !globalThis.__ATF_GAME__[role].fieldActionV124, role);
    const cancelled = await snapshot(), cancelledActor = role === 'coop' ? cancelled.coop : cancelled.player;
    assert.equal(cancelledActor.health, woundedActor.health); assert.equal(cancelled.resources.medkits, wounded.resources.medkits);
    assert.deepEqual(cancelled.resources.equipment, wounded.resources.equipment, 'Cancellation retains equipment charges.');
    await canvas.focus(); await page.keyboard.press(role === 'coop' ? 'KeyG' : 'KeyH');
    await page.waitForFunction(role => globalThis.__ATF_GAME__[role].fieldActionV124?.kind === 'medical', role);
    await page.waitForFunction(role => !globalThis.__ATF_GAME__[role].fieldActionV124, role);
    const completed = await snapshot(), healedActor = role === 'coop' ? completed.coop : completed.player;
    assert.ok(healedActor.health > woundedActor.health); assert.equal(completed.resources.medkits, wounded.resources.medkits - 1);
    assert.equal(healedActor.ammo, woundedActor.ammo); assert.equal(healedActor.ammoReserve, woundedActor.ammoReserve);
    await page.waitForFunction(role => !globalThis.__ATF_GAME__[role].playerActionVisualV127
      && globalThis.__ATF_GAME__[role].playerAppearanceVisualV126?.drawn, role);
    medicalEvidence.push({ role, wounded: woundedActor.health, healed: healedActor.health,
      medkitsBefore: wounded.resources.medkits, medkitsAfter: completed.resources.medkits,
      action: (role === 'coop' ? working.coop : working.player).action });
  }
  check('Both real operators keep their six selected parts during medical work, cancellation and completion', medicalEvidence);

  await canvas.focus(); const beforeTracker = await snapshot(); await page.keyboard.press('KeyQ');
  const tracker = await freezeAction('player', 'motion-tracker', '23-tracker.png', 'The independent motion tracker is held by the selected modular arms');
  assert.equal(tracker.resources.trackerPulses, beforeTracker.resources.trackerPulses + 1);
  assert.equal(tracker.player.ammo, beforeTracker.player.ammo);
  assert.ok(tracker.player.action.props.some(prop => prop.itemId === 'tool.motion-tracker'));
  await page.waitForFunction(() => !(globalThis.__ATF_GAME__.player.toolUseClock > 0));
  check('A real tracker command renders its own implement without spending firearm ammunition', tracker.player.action);

  const beginSentry = async role => {
    await page.locator('[data-placeable-operator]').selectOption(role);
    await page.locator(`[data-use-equipment="${selectedSentryId}"]`).click();
    const confirm = page.locator('[data-placeable-action="confirm"]');
    // Following squad members stay behind their leader. Face the free side
    // after stepping clear instead of attempting to install into the formation.
    await canvas.focus(); await page.keyboard.down(role === 'coop' ? 'KeyL' : 'KeyD');
    await page.waitForTimeout(55); await page.keyboard.up(role === 'coop' ? 'KeyL' : 'KeyD');
    await page.waitForTimeout(240);
    for (let attempt = 0; attempt < 8 && !await confirm.isEnabled(); attempt++) {
      await canvas.focus(); await page.keyboard.down(role === 'coop' ? 'KeyJ' : 'KeyA');
      await page.waitForTimeout(300); await page.keyboard.up(role === 'coop' ? 'KeyJ' : 'KeyA');
      await page.keyboard.down(role === 'coop' ? 'KeyL' : 'KeyD');
      await page.waitForTimeout(45); await page.keyboard.up(role === 'coop' ? 'KeyL' : 'KeyD');
      await page.waitForTimeout(240);
    }
    assert.equal(await confirm.isEnabled(), true, 'An installation needs a physically clear location.');
    const before = await snapshot();
    await confirm.click();
    return before;
  };
  const beforeDeployment = await beginSentry('player');
  await page.waitForTimeout(250);
  const deploying = await freezeAction('player', 'deploy', '24-j1-deploy.png', 'J1 kneels in the selected outfit to install the carried sentry');
  await page.locator('[data-placeable-action="cancel"]').click();
  await page.waitForFunction(() => !globalThis.__ATF_GAME__.player.placeableActionV124);
  const cancelledDeployment = await snapshot();
  assert.deepEqual(cancelledDeployment.placeables.instances, beforeDeployment.placeables.instances);
  assert.deepEqual(cancelledDeployment.resources.equipment, beforeDeployment.resources.equipment);
  assert.equal(cancelledDeployment.player.ammo, beforeDeployment.player.ammo);
  check('Cancelling the real installation keeps its carried object, ammo and equipment charges intact', deploying.player.action);

  // V132 gives each operator a personal bag. J2 acquires the exact physical
  // unit by folding J1's actual installation instead of sharing J1's stock.
  await page.locator('[data-placeable-operator]').selectOption('coop');
  assert.equal(await page.locator(`[data-use-equipment="${selectedSentryId}"]`).isDisabled(), true,
    'J2 cannot implicitly deploy a sentry from J1\'s personal bag.');
  const beforeTransferDeploy = await beginSentry('player');
  const transferredId = beforeTransferDeploy.placeables.previews[0].instanceId;
  await page.waitForFunction(id => globalThis.__ATF_GAME__.placeablesV86.instances.some(item => item.instanceId === id && item.status === 'deployed'), transferredId);
  const transferInstalledState = await snapshot();
  const transferInstalled = transferInstalledState.placeables.instances.find(item => item.instanceId === transferredId);
  assert.equal(transferInstalled.carrierCrewIdV132, 'player'); assert.equal(transferInstalled.sourceUseRecorded, true);
  const sourceBeforeTransfer = beforeTransferDeploy.resources.equipment.find(item => item.id === selectedSentryId);
  const sourceAfterTransferDeploy = transferInstalledState.resources.equipment.find(item => item.id === selectedSentryId);
  assert.equal(sourceAfterTransferDeploy.remaining, sourceBeforeTransfer.remaining - 1);
  assert.equal(sourceAfterTransferDeploy.uses, sourceBeforeTransfer.uses + 1);
  const approachCenter = transferInstalled.x + transferInstalled.w / 2 - 100;
  const coopCenter = transferInstalledState.coop.x + transferInstalledState.coop.w / 2;
  if (Math.abs(coopCenter - approachCenter) > 5) {
    const right = approachCenter > coopCenter, key = right ? 'KeyL' : 'KeyJ';
    await canvas.focus(); await page.keyboard.down(key);
    try {
      await page.waitForFunction(({ x, right }) => {
        const actor = globalThis.__ATF_GAME__.coop, center = actor.x + actor.w / 2;
        return right ? center >= x : center <= x;
      }, { x: approachCenter, right });
    } finally { await page.keyboard.up(key); }
  }
  await page.waitForFunction(() => {
    const actor = globalThis.__ATF_GAME__.coop;
    return actor.grounded && !(actor.v52HurtClock > 0) && !(actor.shockClock > 0);
  });
  await page.locator('[data-placeable-operator]').selectOption('coop');
  const transferRecoverButton = page.locator(`[data-placeable-recover="${transferredId}"]`);
  if (!await transferRecoverButton.isVisible()) await page.locator('.placeable-nearby-v86 > summary').click();
  await transferRecoverButton.click();
  await page.waitForFunction(id => globalThis.__ATF_GAME__.placeablesV86.instances.some(item => item.instanceId === id && item.status === 'carried'), transferredId);
  const transferredState = await snapshot(), transferred = transferredState.placeables.instances.find(item => item.instanceId === transferredId);
  assert.equal(transferred.carrierCrewIdV132, 'coop'); assert.equal(transferred.sourceUseRecorded, true);
  assert.equal(transferred.ammo, transferInstalled.ammo); assert.equal(transferred.health, transferInstalled.health);
  assert.equal(transferredState.placeables.instances.length, beforeTransferDeploy.placeables.instances.length);
  assert.equal(transferredState.placeables.instances.filter(item => item.instanceId === transferredId).length, 1);
  assert.equal(transferredState.placeables.instances.filter(item => item.catalogId === selectedSentryId && item.status === 'carried' && item.carrierCrewIdV132 === 'coop').length, 1);
  assert.deepEqual(transferredState.resources.equipment, transferInstalledState.resources.equipment);
  for (const role of ['player', 'coop']) {
    assert.equal(transferredState[role].ammo, transferInstalledState[role].ammo);
    assert.equal(transferredState[role].ammoReserve, transferInstalledState[role].ammoReserve);
  }
  check('Physical recovery transfers the same sentry from J1 to J2 without duplicating ownership or resources',
    { instanceId: transferredId, installed: transferInstalled, carried: transferred, source: sourceAfterTransferDeploy });

  // Leave the recovery reach and the acid-side edge before preparing J2's
  // installation. Its carried unit travels with it; no object is repositioned.
  const clearCoopCenter = Math.max(transferredState.coop.w / 2 + 20,
    Math.min(transferredState.player.x + transferredState.player.w / 2 - 220, transferInstalled.x - 180));
  await canvas.focus(); await page.keyboard.down('KeyJ');
  try {
    await page.waitForFunction(x => {
      const actor = globalThis.__ATF_GAME__.coop;
      return actor.x + actor.w / 2 <= x;
    }, clearCoopCenter);
  } finally { await page.keyboard.up('KeyJ'); }
  await page.waitForFunction(() => {
    const actor = globalThis.__ATF_GAME__.coop;
    return actor.alive && actor.grounded && !(actor.v52HurtClock > 0) && !(actor.shockClock > 0);
  });
  const beforeCoopDeploy = await beginSentry('coop');
  const deployedId = beforeCoopDeploy.placeables.previews[0].instanceId;
  assert.equal(deployedId, transferredId, 'J2 installs the physical sentry that it recovered from J1.');
  await page.waitForTimeout(250);
  const coopDeploy = await freezeAction('coop', 'deploy', '25-j2-deploy.png', 'J2 independently installs the carried equipment in its own outfit');
  await page.waitForFunction(id => globalThis.__ATF_GAME__.placeablesV86.instances.some(item => item.instanceId === id && item.status === 'deployed'), deployedId);
  const deployedState = await snapshot(), deployed = deployedState.placeables.instances.find(item => item.instanceId === deployedId);
  const recoverButton = page.locator(`[data-placeable-recover="${deployedId}"]`);
  if (!await recoverButton.isVisible()) await page.locator('.placeable-nearby-v86 > summary').click();
  await recoverButton.click();
  const recovering = await freezeAction('coop', 'recover', '26-j2-recover.png', 'J2 folds the same real sentry while retaining the modular outfit');
  await page.waitForFunction(id => globalThis.__ATF_GAME__.placeablesV86.instances.some(item => item.instanceId === id && item.status === 'carried'), deployedId);
  const recoveredState = await snapshot(), recovered = recoveredState.placeables.instances.find(item => item.instanceId === deployedId);
  assert.equal(recovered.ammo, deployed.ammo); assert.equal(recovered.health, deployed.health);
  assert.equal(recovered.carrierCrewIdV132, 'coop'); assert.equal(recovered.sourceUseRecorded, true);
  assert.deepEqual(recoveredState.resources.equipment, transferredState.resources.equipment, 'Reinstalling and folding the acquired unit do not consume another source charge.');
  assert.equal(recoveredState.coop.ammo, beforeCoopDeploy.coop.ammo);
  check('J2 installation and recovery preserve the physical sentry identity and its remaining resources',
    { instanceId: deployedId, deployAction: coopDeploy.coop.action, recoverAction: recovering.coop.action, deployed, recovered });
  imagePhase('Action scene after both operators used the modular renderer', recoveredState);
  await page.locator('#retreat-mission').click();
  await page.locator('#editor-canvas').waitFor({ state: 'visible' });

  // A separate editor encounter provides a real melee target; the medical and
  // equipment checks above remain free from enemy damage or friendly gunfire.
  const meleePlan = { ...actionPlan, tiles: actionPlan.tiles.filter(tile => tile.type !== 'hazard')
    .concat({ position: '2:14', type: 'enemy' }) };
  await importPlan(meleePlan, 'player-melee-v127-qa-stage.json');
  requestPhase = 'fourth-forge-melee';
  await page.locator('#editor-play').click();
  await page.waitForFunction(() => {
    const engine = globalThis.__ATF_GAME__, actor = engine?.player;
    return engine?.running && actor?.grounded && engine.canPerformGameplayAction(actor)
      && !(actor.fireClock > 0) && !actor.reloading && !(actor.toolUseClock > 0) && !(actor.interactionClock > 0)
      && engine.enemies.some(enemy => enemy.alive && Math.abs(enemy.x + enemy.w / 2 - actor.x - actor.w / 2) < 90
        && Math.abs(enemy.y + enemy.h / 2 - actor.y - actor.h / 2) < 94 && engine.enemyMeleePathClearV64(actor, enemy));
  }, null, { timeout: 20000 });
  // Use the explicit CQC control. F is a held, simulation-sampled trigger:
  // a zero-duration press may fall between frames or fire after a moving target
  // has left reach. Middle pointerdown requests melee immediately and cannot
  // substitute a bullet. The real enemy and all gameplay assertions remain.
  await canvas.focus(); const beforeMelee = await snapshot();
  await canvas.click({ button: 'middle', position: { x: 24, y: 24 } });
  await page.waitForFunction(() => globalThis.__ATF_GAME__.player.meleeClock > 0);
  const meleeKind = await page.evaluate(() => globalThis.__ATF_GAME__.player.meleeKind);
  const melee = await freezeAction('player', meleeKind, '27-real-melee.png', 'A real contextual melee strike with the selected independent clothing', { freeze: false });
  assert.equal(melee.player.ammo, beforeMelee.player.ammo); assert.equal(melee.player.shots, beforeMelee.player.shots);
  assert.ok(melee.player.action.props.length > 0);
  check('An accepted contextual melee attack uses the modular body and its own held implement without firearm ammo use', melee.player.action);
  await page.locator('#retreat-mission').click();
  await page.locator('#editor-canvas').waitFor({ state: 'visible' });

  // Real ladder and hazard geometry supplied through the same public editor
  // import. Every action below uses keyboard input; evaluations remain read-only.
  const transitPlan = { ...actionPlan, tiles: actionPlan.tiles.filter(tile => tile.type !== 'hazard')
    .concat({ position: '4:12', type: 'ladder' }, { position: '7:15', type: 'hazard' }) };
  await importPlan(transitPlan, 'player-transit-v128-qa-stage.json');
  requestPhase = 'fifth-forge-transit';
  await page.locator('#editor-play').click();
  await page.waitForFunction(() => {
    const engine = globalThis.__ATF_GAME__;
    return engine?.running && !engine.paused && engine.coopEnabled && engine.player.grounded
      && engine.player.playerAppearanceVisualV126?.drawn && engine.coop.playerAppearanceVisualV126?.drawn;
  }, null, { timeout: 45000 });
  const checkTransitPose = (state, kind, role = 'player') => {
    const actor = role === 'coop' ? state.coop : state.player;
    const operator = checkAppearance(state, role === 'coop' ? coopAppearance : primaryAppearance, role, `${role} ${kind}`);
    assert.equal(actor.transit?.kind, kind); assert.equal(actor.transit.drawn, true);
    assert.equal(actor.transit.firing, false); assert.equal(actor.heldWeapon, null);
    const layers = operator.visual.layers.filter(layer => layer.slot === 'legs');
    assert.equal(layers.length, 7);
    const legImageKey = operator.selected.slots.legs.endsWith('-v129') ? 'playerColonialLegsV129' : 'playerLegPartsV128';
    assert.ok(layers.every(layer => layer.imageKey === legImageKey));
    return actor.transit;
  };
  const walkTo = async (role, targetX) => {
    const initialX = await page.evaluate(role => { const actor = globalThis.__ATF_GAME__[role]; return actor.x + actor.w / 2; }, role);
    const right = targetX > initialX, key = role === 'coop' ? right ? 'KeyL' : 'KeyJ' : right ? 'KeyD' : 'KeyA';
    await canvas.focus(); await page.keyboard.down(key);
    await page.waitForFunction(({ role, targetX, right }) => {
      const actor = globalThis.__ATF_GAME__[role], center = actor.x + actor.w / 2;
      return right ? center >= targetX : center <= targetX;
    }, { role, targetX, right });
    await page.keyboard.up(key); await page.waitForTimeout(180);
  };
  const ladder = await page.evaluate(() => ({ ...globalThis.__ATF_GAME__.ladders[0] }));
  const ladderEvidence = [];
  for (const role of ['player', 'coop']) {
    await walkTo(role, ladder.x - 10);
    const up = role === 'coop' ? 'KeyI' : 'KeyW', down = role === 'coop' ? 'KeyK' : 'KeyS';
    await canvas.focus(); await page.keyboard.down(up);
    await page.waitForFunction(role => {
      const actor = globalThis.__ATF_GAME__[role], ladder = globalThis.__ATF_GAME__.ladders[0];
      return actor.climbing && actor.y + actor.h < ladder.bottom - 65
        && actor.playerTransitVisualV128?.drawn;
    }, role);
    await page.keyboard.up(up); await page.waitForTimeout(100);
    const climbing = await saveCanvasFrame(`28-${role}-ladder.png`, `${role}: real ladder with seven separate leg pieces`, await page.evaluate(readLiveState, true));
    const hold = checkTransitPose(climbing, 'climb', role); assert.equal(hold.phase, 'holding');
    assert.equal(hold.contacts.ladderId, ladder.id);
    const planted = [...Object.values(hold.contacts.feet), ...Object.values(hold.contacts.hands)].filter(contact => contact.planted);
    assert.ok(planted.length > 0);
    for (const contact of planted) assert.ok(Math.abs(contact.point.y - ladder.top - 11 - contact.rungIndex * 22) < .02);
    await page.waitForTimeout(180);
    const still = checkTransitPose(await snapshot(), 'climb', role);
    assert.deepEqual(still.contacts, hold.contacts, 'A stopped operator keeps the same real rung contacts.');
    await captureActorDetail(`28-${role}-ladder-detail.png`, `${role}: articulated legs on the actual ladder`, role);
    await canvas.focus(); await page.keyboard.down(down); await page.waitForTimeout(140);
    const descending = await saveCanvasFrame(`29-${role}-ladder-down.png`, `${role}: actual descent`, await page.evaluate(readLiveState, true));
    assert.equal(checkTransitPose(descending, 'climb', role).phase, 'descending');
    await page.keyboard.up(down); await page.keyboard.press(role === 'coop' ? 'KeyU' : 'Space');
    await page.waitForFunction(role => {
      const actor = globalThis.__ATF_GAME__[role];
      return !actor.climbing && actor.grounded && !actor.playerTransitVisualV128 && actor.playerAppearanceVisualV126?.drawn;
    }, role);
    checkAppearance(await snapshot(), role === 'coop' ? coopAppearance : primaryAppearance, role);
    ladderEvidence.push({ role, ladder, holding: hold, descending: (role === 'coop' ? descending.coop : descending.player).transit });
  }
  check('Both operators climb, hold actual rungs, descend and leave the ladder with their chosen seven leg parts', ladderEvidence);

  const hazard = await page.evaluate(() => ({ ...globalThis.__ATF_GAME__.hazards[0] }));
  // The rescuer waits just outside the hazard, within the real rescue range.
  await walkTo('coop', hazard.x - 60); await walkTo('player', hazard.x + 8);
  await page.waitForFunction(() => {
    const actor = globalThis.__ATF_GAME__.player;
    return actor.downed && actor.grounded && actor.playerTransitVisualV128?.phase === 'settled';
  }, null, { timeout: 45000 });
  const downed = await saveCanvasFrame('30-real-downed.png', 'Actual hazard incapacitates J1; selected pieces rest on the collision floor', await page.evaluate(readLiveState, true));
  const casualty = checkTransitPose(downed, 'downed');
  assert.equal(casualty.contacts.floorY, downed.player.y + downed.player.h);
  assert.equal(downed.player.alive, false); assert.equal(downed.coop.alive, true); assert.equal(downed.phase, 'active');
  await canvas.focus(); await page.keyboard.press('KeyP'); const pausedCasualty = await snapshot();
  await page.waitForTimeout(180);
  assert.deepEqual((await snapshot()).player.transit, pausedCasualty.player.transit, 'Pause freezes the actual casualty pose.');
  await page.keyboard.press('KeyP');
  check('A real hazard produces a grounded modular casualty while the cooperative mission stays active', casualty);
  await page.keyboard.press('KeyY');
  await page.waitForFunction(() => globalThis.__ATF_GAME__.player.playerTransitVisualV128?.kind === 'revive');
  const revived = await saveCanvasFrame('31-real-revive.png', 'J2 really revives J1; the same chosen pieces follow its rise', await page.evaluate(readLiveState, true));
  checkTransitPose(revived, 'revive'); assert.equal(revived.player.alive, true); assert.equal(revived.player.downed, false);
  assert.ok(revived.player.health > 0); assert.equal(revived.player.ammo, downed.player.ammo);
  await walkTo('player', hazard.x - 90);
  await page.waitForFunction(() => !globalThis.__ATF_GAME__.player.playerTransitVisualV128
    && globalThis.__ATF_GAME__.player.playerAppearanceVisualV126?.drawn);
  check('A keyboard rescue rises in the chosen kit and movement immediately restores ordinary locomotion', revived.player.transit);
  imagePhase('V128 ladder, casualty and rescue keep the scene image cache bounded', await snapshot());
  await page.locator('#retreat-mission').click();
  await page.locator('#editor-canvas').waitFor({ state: 'visible' });
  assert.equal((await snapshot()).running, false);
  assert.equal(report.pageErrors.length, 0, `Browser exceptions: ${report.pageErrors.join('; ')}`);
  assert.equal(report.requestFailures.length, 0, `Failed requests: ${report.requestFailures.map(entry => entry.url).join('; ')}`);
  report.status = 'passed';
} catch (error) {
  report.status = 'failed'; report.error = { message: error.message, stack: error.stack };
  if (page && !page.isClosed()) report.failureState = await page.evaluate(() => {
    const e = globalThis.__ATF_GAME__, p = e?.player;
    return e && p ? { running: e.running, paused: e.paused, loading: Boolean(e.enemyAtlasLoadingPausedV65 || e.userCasteLoadingV88),
      elapsed: e.animationTime, phase: e.mission?.state, keys: [...e.keys], focus: document.activeElement?.id,
      player: { x: p.x, y: p.y, vx: p.vx, vy: p.vy, grounded: p.grounded, alive: p.alive, downed: p.downed,
        health: p.health, aiming: p.aimingV124, movement: p.movementIntentV124, fireClock: p.fireClock,
        meleeClock: p.meleeClock, meleeKind: p.meleeKind, reloading: p.reloading, climbing: p.climbing,
        toolUseClock: p.toolUseClock, interactionClock: p.interactionClock, action: p.playerActionVisualV127 },
      enemies: (e.enemies || []).map(enemy => ({ id: enemy.id, x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h,
        alive: enemy.alive, dormant: enemy.dormant, health: enemy.health, plane: enemy.planeV130 || enemy.plane,
        rearEntry: enemy.rearEntryV130, contactClear: e.enemyMeleePathClearV64(p, enemy) })),
      fieldAction: p.fieldActionV124 || null, placeables: e.getPlaceablesSnapshotV86?.() || null,
      squad: e.getSquadDoctrineSnapshotV132?.() || null } : null;
  }).catch(() => null);
  if (page && !page.isClosed()) await page.screenshot({ path: join(output, 'failure.png'), fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  await writeFile(join(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await browser?.close();
  console.log(`Player browser QA ${report.status}: ${join(output, 'report.json')}`);
}
