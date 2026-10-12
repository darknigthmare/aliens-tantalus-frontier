import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WEAPON_VISUAL_ASSETS_ALL_V63 } from '../src/weapon-visual-runtime-v63.js';

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
  if (process.env.ATF_PLAYWRIGHT_MODULE) return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
  try { return await import('playwright'); } catch (error) {
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) {
      const require = createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__player_qa__.cjs'));
      return require('playwright');
    }
    throw new Error('Install Playwright and Chromium in the QA environment before running this optional script.', { cause: error });
  }
}

const report = { schema: 125, baseUrl, startedAt: new Date().toISOString(), status: 'running',
  scenario: 'Production mission entered through Frontier Forge UI; isolated browser context.',
  checks: [], captures: [], pageErrors: [], requestFailures: [], weaponImageRequests: [], weaponImagePhases: [],
  limitations: ['No physical gamepad or mobile device is connected.',
    'Cover, medical cancellation and deployable persistence are covered separately by the production runtime integration suite; the imported editor plan does not supply cover.'] };
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
  let requestPhase = 'boot';
  const catalogueImagePaths = new Set(Object.values(WEAPON_VISUAL_ASSETS_ALL_V63));
  const network = await context.newCDPSession(page);
  await network.send('Network.enable');
  network.on('Network.requestWillBeSent', event => {
    const path = new URL(event.request.url).pathname;
    if (!catalogueImagePaths.has(path)) return;
    const frames = event.initiator?.stack?.callFrames || [];
    report.weaponImageRequests.push({ phase: requestPhase, path, type: event.type,
      initiator: event.initiator?.type, functions: frames.slice(0, 6).map(frame => ({ name: frame.functionName,
        source: frame.url ? new URL(frame.url, baseUrl).pathname : null })) });
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
      effects: effects ? { ...engine.weaponEffectsSnapshotV124(),
        lights: effects.lights.map(light => ({ ...light, age: effects.time - light.bornAt })),
        casings: effects.casings.slice(-16).map(casing => ({ id: casing.id, weaponId: casing.weaponId,
          kind: casing.kind, casingKind: casing.casingKind, color: casing.color, x: casing.x, y: casing.y,
          vx: casing.vx, vy: casing.vy, angle: casing.angle, bornAt: casing.bornAt, resting: casing.resting,
          bounces: casing.bounces, supportKind: casing.supportKind })) } : null,
      ...(includeCanvas ? { canvasPng: document.querySelector('#game-canvas').toDataURL('image/png') } : {}),
      keys: [...(engine.keys || [])], player: { x: actor.x, y: actor.y, vx: actor.vx, vy: actor.vy,
        w: actor.w, h: actor.h,
        grounded: actor.grounded, crouching: actor.crouching, aiming: actor.aimingV124, facing: actor.facing,
        health: actor.health, ammo: actor.ammo, ammoReserve: actor.ammoReserve, shots: actor.shots,
        heldWeapon: actor.heldWeaponVisualV125 || null, aim: actor.combatAimV83,
        weaponMotion: actor.weaponRigMotionV125 ? { ...actor.weaponRigMotionV125 } : null,
        reloading: actor.reloading, movement: actor.movementV124, presentation: actor.playerPresentationV124,
        fieldAction: actor.fieldActionV124, cover: actor.coverV124 ? { id: actor.coverV124.id, peeking: actor.coverV124.peeking } : null } };
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
  const checkHeldPose = (state, label) => {
    const pose = state.player.heldWeapon;
    assert.ok(pose, `${label}: a real rendered held-weapon composition is required.`);
    assert.equal(pose.weaponId, state.weapon.id, `${label}: the rendered weapon must match the actual operator's weapon.`);
    assert.ok(Math.hypot(pose.nearHand.x - pose.grip.x, pose.nearHand.y - pose.grip.y) < 0.02, `${label}: hand remains on the grip.`);
    assert.ok(pose.nearReachError < 0.02 && pose.farReachError < 0.02, `${label}: arm targets remain reachable.`);
    assert.ok(state.weaponRig.images.retained <= state.weaponRig.images.limit, `${label}: weapon cache remains bounded.`);
    return pose;
  };
  const imagePhase = (label, state) => report.weaponImagePhases.push({ label, requestPhase,
    requests: report.weaponImageRequests.filter(entry => entry.phase === requestPhase), cache: state?.weaponRig?.images || null });

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
  await page.locator('#editor-import').setInputFiles({ name: 'player-v124-qa-stage.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(plan)) });
  imagePhase('Before the first mission; armory catalogue has not been opened', await snapshot());
  requestPhase = 'first-forge-playtest';
  await page.locator('#editor-play').click();
  await page.locator('#game-canvas').waitFor({ state: 'visible' });
  await page.waitForFunction(() => {
    const engine = globalThis.__ATF_GAME__;
    return engine?.running && !engine.paused && !engine.enemyAtlasLoadingPausedV65 && !engine.userCasteLoadingV88
      && engine.player?.grounded && engine.player.heldWeaponVisualV125;
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
      const runtime = globalThis.__ATF_GAME__?.weaponEffectsV124;
      return runtime?.lights.some(light => runtime.time - light.bornAt < light.duration * 0.5);
    }, null, { polling: 'raf', timeout: 10000 });
    const frame = await page.evaluate(readLiveState, true);
    if (frame.effects?.lights.some(light => light.age >= 0 && light.age < light.duration * 0.8)) {
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
  imagePhase('Catalogue procurement and equipment selection; DOM requests are separate', await snapshot());
  await page.locator('#return-title').click();
  await page.locator('#title-start').click();
  await page.locator('#title-forge').click();
  requestPhase = 'second-forge-playtest';
  await page.locator('#editor-play').click();
  await page.waitForFunction(id => {
    const engine = globalThis.__ATF_GAME__;
    return engine?.running && !engine.paused && engine.player?.grounded && engine.player.heldWeaponVisualV125?.weaponId === id;
  }, selectedWeaponId, { timeout: 45000 });
  await canvas.focus(); await page.waitForTimeout(250);
  const selected = await saveCanvasFrame('11-selected-shotgun.png', 'M37A2 selected through the armory and carried on the next real deployment', await page.evaluate(readLiveState, true));
  assert.equal(selected.weapon.id, selectedWeaponId); checkHeldPose(selected, 'Selected shotgun');
  assert.notEqual(selected.player.heldWeapon.path, initial.player.heldWeapon.path);
  imagePhase('Second mission after the actual UI weapon change', selected);
  check('Actual armory selection changes the held native image on the next deployment', { before: initial.weapon,
    after: selected.weapon, beforePath: initial.player.heldWeapon.path, afterPath: selected.player.heldWeapon.path });

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
  assert.equal(report.pageErrors.length, 0, `Browser exceptions: ${report.pageErrors.join('; ')}`);
  report.status = 'passed';
} catch (error) {
  report.status = 'failed'; report.error = { message: error.message, stack: error.stack };
  if (page && !page.isClosed()) await page.screenshot({ path: join(output, 'failure.png'), fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  await writeFile(join(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await browser?.close();
  console.log(`Player browser QA ${report.status}: ${join(output, 'report.json')}`);
}
