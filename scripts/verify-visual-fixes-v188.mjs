// V188 graphics audit fixes (2026-11-15), items 12–17. Production engine through
// engine-host-v188.mjs and a recording 2D context; positions are placed by injection
// where stated (player at a hold, at the checkpoint). Rendering only: no rule, id or save
// format is exercised as changed.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fixture, host } from './engine-host-v188.mjs';
import { CAMPAIGNS, WORLDS, LEVEL_SEEDS } from '../src/content-core-v50.js';
import { buildMissionLevelV52, selectMissionTemplateV52 } from '../src/mission-levels-v52.js';
import { ALIEN_SURVIVAL_CAMPAIGN_V70 } from '../src/alien-survival-systems-v70.js';
import { QZ17_CAMPAIGN_ID_V188 } from '../src/mission-depth-v188.js';
import { DEPTH_HOLD_DECK_SLOT_V188, DEPTH_HOLD_DECK_FILES_PRESENT_V188, depthHoldDeckGeometryV188, deckSeamTopXV188,
  drawDepthHoldDeckV188, drawFootprintShadowV188, isHoldFloorPlatformV188 } from '../src/depth-hold-deck-v188.js';
import { placeWorldLabelV188, labelSpriteBoxV188 } from '../src/world-label-layout-v188.js';
import { ENEMY_DEDICATED_POSES_V99, drawEnemyDedicatedPoseV99 } from '../src/enemy-dedicated-poses-v99.js';
import { missionPoseStatureV188, missionPoseStatureScaleV188 } from '../src/enemy-mission-stature-v188.js';
import { defringeStraightAlphaV188, fadeEdgeHazeV188, mattedLayerV188, withMissionLayerMatteV188 } from '../src/mission-layer-matte-v188.js';
import { drawHubCirculationV137, getHubCirculationPlanV137, withHubCirculationV137 } from '../src/hub-circulation-v137.js';
import { drawShipPortTerminalV87 } from '../src/ship-port-room-v87.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/** Recording 2D context: every call with its arguments, the fill style at the time, and a translation stack. */
function recorder() {
  const calls = [], stack = [];
  const state = { globalAlpha: 1, fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '10px monospace', textAlign: 'left', tx: 0, ty: 0, sx: 1, sy: 1 };
  const gradient = kind => ({ kind, stops: [], addColorStop(at, color) { this.stops.push([at, color]); } });
  const api = {
    save() { stack.push({ ...state }); calls.push({ name: 'save' }); },
    restore() { assert.ok(stack.length, 'balanced save/restore'); Object.assign(state, stack.pop()); calls.push({ name: 'restore' }); },
    translate(x, y) { state.tx += x * state.sx; state.ty += y * state.sy; calls.push({ name: 'translate', args: [x, y] }); },
    scale(x, y) { state.sx *= x; state.sy *= y; calls.push({ name: 'scale', args: [x, y] }); },
    measureText: value => ({ width: String(value).length * 7 }),
    createLinearGradient: (...args) => { calls.push({ name: 'createLinearGradient', args }); return gradient('linear'); },
    createRadialGradient: (...args) => { calls.push({ name: 'createRadialGradient', args }); return gradient('radial'); },
    getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })
  };
  const ctx = new Proxy(state, {
    get(target, key) {
      if (key in api) return api[key];
      if (key in target) return target[key];
      return (...args) => { calls.push({ name: key, args, fillStyle: target.fillStyle, alpha: target.globalAlpha, tx: target.tx, ty: target.ty, sx: target.sx, sy: target.sy }); };
    },
    set(target, key, value) { target[key] = value; return true; }
  });
  return { ctx, calls, balanced: () => assert.equal(stack.length, 0) };
}

const worldOf = campaign => WORLDS.find(world => world.id === campaign.worldId) || WORLDS[0];
const QZ17 = { id: QZ17_CAMPAIGN_ID_V188, templateId: 'ship-interior-vertical', worldId: 'world-05-lethe' };
const FREIGHTER = CAMPAIGNS.find(campaign => !campaign.specialOperationId && selectMissionTemplateV52({ campaign, world: worldOf(campaign) }) === 'ship-interior-vertical');
async function mission(campaign, extra = {}) {
  const world = worldOf(campaign);
  const missionLevel = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS, templateId: campaign.templateId || null });
  return fixture({ campaign, seed: 7, options: { world, missionLevel }, ...extra });
}

// —— 12. Depth hold deck ——
test('12: every hold draws a deck over its depth band, right after the hold floor platform, under objects and actors', async () => {
  assert.deepEqual(DEPTH_HOLD_DECK_FILES_PRESENT_V188, [], 'placeholder slot until art is produced');
  assert.match(DEPTH_HOLD_DECK_SLOT_V188.path, /^\/assets\/depth-holds\/v188\/hold-deck-plating\.png$/);
  for (const campaign of [QZ17, FREIGHTER, ALIEN_SURVIVAL_CAMPAIGN_V70]) {
    const { engine } = await mission(campaign);
    const section = engine.missionDepthSectionV188;
    assert.ok(section, `${campaign.id}: a hold`);
    // Injection: the player stands in the hold, the camera on it.
    Object.assign(engine.player, { x: section.x0 + 170, y: section.floorY - engine.player.h, vy: 0, depthZ: -30 });
    engine.camera.x = section.x0 - 100; engine.camera.y = section.floorY - 500;
    const order = [];
    for (const name of ['drawPlatform', 'drawHazard', 'drawActor', 'drawObjective']) {
      const original = engine[name];
      engine[name] = function (...args) { order.push({ name, platform: name === 'drawPlatform' ? args[1] : null, at: rec.calls.length }); return original.apply(this, args); };
    }
    const rec = recorder(); engine.ctx = rec.ctx; engine.draw(); rec.balanced();
    const g = depthHoldDeckGeometryV188(section);
    assert.equal(g.top, section.floorY); assert.equal(g.front, section.floorY - section.zMin);
    const deckFills = rec.calls.filter(call => call.name === 'fillRect' && call.args[1] === g.top && call.args[3] === g.depth);
    assert.ok(deckFills.length >= 1, `${campaign.id}: deck plating covers floorY … floorY + depth`);
    const covered = deckFills.reduce((sum, call) => sum + call.args[2], 0);
    assert.ok(covered >= section.x1 - section.x0 - 1, `${campaign.id}: plating spans the hold (${covered})`);
    const floors = order.filter(entry => entry.name === 'drawPlatform' && isHoldFloorPlatformV188(section, entry.platform));
    assert.ok(floors.length >= 1);
    const firstDeck = rec.calls.indexOf(deckFills[0]);
    assert.ok(firstDeck > floors[0].at, 'drawn after the floor truss');
    const actor = order.find(entry => entry.name === 'drawActor');
    assert.ok(actor && firstDeck < actor.at, 'before the actors');
    for (const hazard of order.filter(entry => entry.name === 'drawHazard')) assert.ok(hazard.at > firstDeck, 'acid and hazards land on the deck');
    if (campaign === ALIEN_SURVIVAL_CAMPAIGN_V70) assert.ok(order.some(entry => entry.name === 'drawHazard'), 'Lethe: the initial acid pool is drawn');
    // Seams meet the vanishing point: a seam through the hold centre is vertical, outer seams lean inward.
    assert.equal(deckSeamTopXV188(g, g.vanishX), g.vanishX);
    assert.ok(deckSeamTopXV188(g, g.x0) > g.x0 && deckSeamTopXV188(g, g.x1) < g.x1);
    // Every object stands on the deck, and its contact shadow covers its footprint depth.
    for (const entry of section.containers) {
      const base = section.floorY - entry.z;
      assert.ok(base > g.top && base <= g.front, `${entry.id}: base ${base} on the deck ${g.top}…${g.front}`);
      const shadow = drawFootprintShadowV188(recorder().ctx, section, entry);
      assert.equal(shadow.yBack, section.floorY - Math.min(section.zMax, entry.footprint.z1));
      assert.equal(shadow.yFront, section.floorY - Math.max(section.zMin, entry.footprint.z0));
      assert.ok(shadow.yBack <= base && base <= shadow.yFront + 1e-9, `${entry.id}: the shadow spans the base`);
      const ellipses = rec.calls.filter(call => call.name === 'ellipse' && Math.abs(call.args[0] - shadow.cx) < 1e-9 && Math.abs(call.args[1] - (shadow.yBack + shadow.yFront) / 2) < 1e-9);
      assert.equal(ellipses.length, 1, `${entry.id}: footprint shadow drawn once`);
    }
  }
});

test('12: the deck is clipped to each floor platform and drawn only once per frame', () => {
  const section = { id: 'probe', x0: 100, x1: 700, floorY: 500, zMin: -80, zMax: 0 };
  const rec = recorder();
  assert.equal(drawDepthHoldDeckV188(rec.ctx, section, { clipX0: 0, clipX1: 300 }), 'primitive');
  const clip = rec.calls.find(call => call.name === 'rect');
  assert.deepEqual(clip.args, [100, 499, 200, 80 + 8 + 22 + 1]);
  assert.equal(drawDepthHoldDeckV188(recorder().ctx, section, { clipX0: 800, clipX1: 900 }), null, 'outside the hold');
  assert.equal(isHoldFloorPlatformV188(section, { x: 0, w: 400, y: 500 }), true);
  assert.equal(isHoldFloorPlatformV188(section, { x: 0, w: 400, y: 380 }), false, 'an upper deck');
  const src = read('src/mission-depth-v188.js');
  assert.match(src, /frame\.deckDrawn = true/);
  assert.doesNotMatch(src, /rgba\(0,0,0,\.22\)/, 'the old void gradient is gone');
});

// —— 13. Save-terminal prompt ——
test('13: the save-terminal prompt never covers the marine or the squad at spawn, and keeps a backing plate', async () => {
  for (const campaign of [QZ17, FREIGHTER, CAMPAIGNS.find(entry => entry.id === 'pair-001-frontier')]) {
    const { engine } = await mission(campaign);
    if (!engine.saveTerminalVisibleV188()) continue;
    // Injection: the player at the checkpoint, as at spawn, with a squad marine on the terminal.
    Object.assign(engine.player, { x: engine.checkpoint.x - engine.player.w / 2, y: engine.checkpoint.y });
    engine.squadActors = [engine.player, { x: engine.checkpoint.x + 20, y: engine.checkpoint.y, w: 42, h: 92, alive: true }];
    const rec = recorder();
    engine.drawObjective(rec.ctx); rec.balanced();
    const label = engine.saveTerminalPromptV188;
    assert.ok(label, `${campaign.id}: prompt drawn`);
    for (const actor of engine.squadActors) assert.equal(overlaps(label.plate, labelSpriteBoxV188(actor)), false, `${campaign.id}: plate clear of a sprite`);
    const text = rec.calls.find(call => call.name === 'fillText' && call.args[0] === 'TERMINAL · SAUVEGARDER');
    assert.ok(text); assert.equal(text.args[2], label.baseline);
    const plate = rec.calls.find(call => call.name === 'fillRect' && call.args[0] === label.plate.x && call.args[1] === label.plate.y);
    assert.ok(plate && /rgba\(4,10,8/.test(plate.fillStyle), 'dark plate behind the text');
    assert.ok(rec.calls.indexOf(plate) < rec.calls.indexOf(text));
  }
});

test('13: label placement raises over stacked sprites and stays put when nothing is covered', () => {
  const free = placeWorldLabelV188({ x: 100, preferredBaseline: 300, textWidth: 140, actors: [{ x: 400, y: 260, w: 42, h: 92 }] });
  assert.equal(free.raisedBy, 0);
  const actors = [{ x: 80, y: 250, w: 42, h: 92 }, { x: 110, y: 180, w: 42, h: 60 }];
  const raised = placeWorldLabelV188({ x: 100, preferredBaseline: 300, textWidth: 140, actors });
  for (const actor of actors) assert.equal(overlaps(raised.plate, labelSpriteBoxV188(actor)), false);
  assert.ok(raised.raisedBy > 0);
});

// —— 14. Oversize systemic variants ——
test('14: the Acid-Blooded K-Series of pair-001 is a rival-hive warrior variant drawn at its base caste stature', () => {
  const pose = ENEMY_DEDICATED_POSES_V99.find(entry => entry.profileId === 'enemy-176-acid-blooded-k-series-yellow-xenomorph');
  const stature = missionPoseStatureV188(pose);
  assert.equal(stature.caste, 'rival-hive', 'not a royal or boss caste');
  assert.equal(stature.from, 268); assert.equal(stature.to, 156); assert.equal(stature.referenceId, 'enemy-020-k-series-yellow-xenomorph');
  const rec = recorder(), image = { complete: true, naturalWidth: pose.sourceWidth, naturalHeight: pose.sourceHeight, src: pose.path };
  const actor = { id: `${pose.profileId}:0`, x: 1176, y: 562, w: 52, h: 74, alive: true, facing: 1 };
  assert.equal(drawEnemyDedicatedPoseV99(rec.ctx, actor, image, { statureScale: missionPoseStatureScaleV188(pose) }), true);
  const draw = rec.calls.find(call => call.name === 'drawImage');
  const visible = draw.args[4] * (pose.alphaBounds[3] - pose.alphaBounds[1]) / pose.sourceHeight;
  assert.ok(Math.abs(visible - 156) < 1e-6, `visible ${visible}`);
  // Without the option the historical size is kept (other callers, catalogue checks).
  const legacy = recorder(); drawEnemyDedicatedPoseV99(legacy.ctx, actor, image);
  assert.equal(legacy.calls.find(call => call.name === 'drawImage').args[4], pose.renderHeight);
  assert.deepEqual([actor.w, actor.h], [52, 74], 'hitbox unchanged');
});

test('14: queens keep their silhouettes; only oversize non-royal creature poses shrink, none grows', () => {
  for (const pose of ENEMY_DEDICATED_POSES_V99) {
    const result = missionPoseStatureV188(pose);
    assert.ok(result.scale > 0 && result.scale <= 1, pose.profileId);
    if (result.caste === 'royal') assert.equal(result.scale, 1, `${pose.profileId}: royal kept`);
  }
  const shrunk = ENEMY_DEDICATED_POSES_V99.filter(pose => missionPoseStatureV188(pose).scale < 1);
  assert.equal(shrunk.length, 25);
  assert.match(read('src/game-v51-runtime.js'), /statureScale: missionPoseStatureScaleV188\(dedicatedPose\)/);
});

// —— 15. Planet cover-layer matte ——
test('15: pale matte edges take the rock colour and painted edge haze feathers out; opaque rock is untouched', () => {
  const width = 12, height = 1, data = new Uint8ClampedArray(width * 4);
  const px = (i, r, g, b, a) => data.set([r, g, b, a], i * 4);
  for (let i = 0; i < 6; i++) px(i, 60, 62, 64, 255); // dark rock
  px(6, 200, 205, 210, 255); px(7, 205, 208, 212, 255); // pale painted fog, opaque, at the edge
  px(8, 190, 190, 190, 120); // pale matte fringe pixel
  for (let i = 9; i < 12; i++) px(i, 0, 0, 0, 0);
  const corrected = defringeStraightAlphaV188(data, width, height, { radius: 2 });
  assert.equal(corrected, 1);
  assert.ok(data[8 * 4] > 190 || data[8 * 4] < 190, 'fringe recoloured from its more opaque neighbours');
  const faded = fadeEdgeHazeV188(data, width, height, { reach: 6 });
  assert.ok(faded >= 2);
  assert.ok(data[7 * 4 + 3] < 255 && data[6 * 4 + 3] < 255 && data[7 * 4 + 3] < data[6 * 4 + 3], 'haze fades towards the edge');
  for (let i = 0; i < 6; i++) assert.equal(data[i * 4 + 3], 255, 'dark rock stays opaque');
});

test('15: the planet mid and foreground layers are replaced by a matted copy; the source image is never modified', () => {
  const image = { complete: true, naturalWidth: 3, naturalHeight: 1, src: '/assets/fixture.png', missionCoverContractV62: { targetAspect: 3 } };
  const pixels = new Uint8ClampedArray([60, 60, 60, 255, 200, 200, 200, 255, 0, 0, 0, 0]);
  const documentRef = { createElement: () => { const canvas = { getContext: () => ({ drawImage() {}, getImageData: () => ({ data: pixels }), putImageData() {} }) }; return canvas; } };
  assert.equal(mattedLayerV188(image, { schedule: null, documentRef }), null, 'first request: processed, original still returned');
  const copy = mattedLayerV188(image, { schedule: null, documentRef });
  assert.ok(copy?.mattedV188); assert.equal(copy.naturalWidth, 3); assert.deepEqual(copy.missionCoverContractV62, image.missionCoverContractV62);
  assert.equal(image.mattedV188, undefined);
  class Base { constructor(template) { this.missionLevelRuntime = { templateId: template }; } missionLevelLayerImage() { return image; } }
  const Matte = withMissionLayerMatteV188(Base);
  assert.equal(new Matte('planet-exterior').missionLevelLayerImage('foreground'), copy);
  assert.equal(new Matte('planet-exterior').missionLevelLayerImage('far'), image, 'the opaque sky layer is left alone');
  assert.equal(new Matte('colony-multiroute').missionLevelLayerImage('foreground'), image, 'other templates unchanged');
  assert.match(read('src/game-production-runtime.js'), /withMissionLayerMatteV188\(withMissionDepthRoomsV188\(/);
});

// —— 16. Colony upper-wall seam ——
test('16: zone fog is drawn as feathered wisps, never as hard 120 × 14 translucent rectangles', async () => {
  const colony = CAMPAIGNS.find(entry => entry.id === 'pair-001-frontier');
  const { engine } = await mission(colony);
  const zone = engine.missionLevelRuntime.biomeZones.find(entry => entry.visual?.fog);
  assert.ok(zone, 'a fogged zone in the colony');
  const rec = recorder(); engine.drawWorld(rec.ctx); rec.balanced();
  assert.equal(rec.calls.filter(call => call.name === 'fillRect' && call.args[2] === 120 && call.args[3] === 14).length, 0);
  const wisps = rec.calls.filter(call => call.name === 'fillRect' && call.args.join() === '-1,-1,2,2' && call.sx === 72 && call.sy === 11);
  assert.equal(wisps.length, Math.ceil(zone.w / 190));
  const gradient = rec.calls.find(call => call.name === 'createRadialGradient');
  assert.deepEqual(gradient.args, [0, 0, 0, 0, 0, 1]);
});

// —— 17. Hub hangar labels over ladders ——
test('17: circulation labels can be deferred, and the hub draws them after its ladders', async () => {
  const { HUB_DECKS } = await import('../src/hub-game.js');
  const { buildHubTraversalGeometryV87 } = await import('../src/hub-v51-runtime.js');
  const deckIndex = HUB_DECKS.findIndex(deck => deck.rooms.some(room => room.id === 'dropship-hangar'));
  const geometry = buildHubTraversalGeometryV87(deckIndex), room = HUB_DECKS[deckIndex].rooms.find(entry => entry.id === 'dropship-hangar');
  const platform = geometry.platforms.find(entry => entry.id === 'hangar-observation');
  const options = { room, ladders: geometry.ladders, vents: geometry.vents, platforms: geometry.platforms, phase: 'back' };
  assert.ok(getHubCirculationPlanV137(platform, options).destinations.some(entry => entry.label === 'GAINE DE SERVICE'));
  const inline = recorder(); drawHubCirculationV137(inline.ctx, platform, options);
  assert.ok(inline.calls.some(call => call.name === 'fillText' && call.args[0] === 'GAINE DE SERVICE'), 'historical default unchanged');
  const deferred = recorder(); drawHubCirculationV137(deferred.ctx, platform, { ...options, labels: false });
  assert.ok(!deferred.calls.some(call => call.name === 'fillText'));

  // The production hub composes the circulation mixin in app.js (a browser module); it is applied here the same way.
  const { HubGame: HubGameV88 } = await import('../src/hub-opening-v88.js');
  const HubGame = withHubCirculationV137(HubGameV88);
  const { createDefaultSave } = await import('../src/save.js');
  const browser = host(), save = createDefaultSave(); save.needsPlayerCreationV84 = false;
  const hub = new HubGame(browser.canvas, { onAction() {}, onPersist() {}, onStatus() {} });
  hub.start({ deck: deckIndex, roomId: 'dropship-hangar', positionX: room.xStart + 300, positionY: 532 }, { routineContextV62: { save } });
  for (let index = 0; index < 8; index++) await Promise.resolve();
  const rec = recorder(), marks = [];
  const ladder = hub.drawTraversalLadder;
  hub.drawTraversalLadder = function (...args) { marks.push(rec.calls.length); return ladder.apply(this, args); };
  hub.drawTraversal(rec.ctx); rec.balanced();
  const lastLadder = Math.max(...marks);
  const labels = rec.calls.map((call, index) => ({ call, index })).filter(entry => entry.call.name === 'fillText' && entry.call.args[0] === 'GAINE DE SERVICE');
  assert.ok(labels.length >= 1, 'the hangar vent label is drawn');
  for (const label of labels) assert.ok(label.index > lastLadder, 'label after every ladder');
  hub.stop();

  const port = recorder(); drawShipPortTerminalV87(port.ctx, null, save);
  const text = port.calls.find(call => call.name === 'fillText');
  const plate = port.calls.find(call => call.name === 'fillRect' && call.fillStyle === '#14272d');
  assert.ok(plate && port.calls.indexOf(plate) < port.calls.indexOf(text), 'gangway status on a plate');
  assert.ok(plate.args[2] >= text.args[0].length * 7, 'the plate covers the text');
});

test('new modules are cached by the service worker', () => {
  const sw = read('sw.js');
  for (const path of ['depth-hold-deck-v188.js', 'world-label-layout-v188.js', 'enemy-mission-stature-v188.js', 'mission-layer-matte-v188.js'])
    assert.ok(sw.includes(`'/src/${path}'`), path);
});
