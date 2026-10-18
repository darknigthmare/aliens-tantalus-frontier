import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, WORLDS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content.js';
import { buildBlackCocoonLevelV121 } from '../src/black-cocoon-runtime-v121.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { createBlackCocoonStateV121, validateBlackCocoonStateV121 } from '../src/black-cocoon-state-v121.js';
import { resolveBlackCocoonPresentationV158, resolveBlackCocoonPlayerRigV158,
  blackCocoonResinGeometryV158, drawBlackCocoonResinV158, BLACK_COCOON_PRESENTATION_V158 } from '../src/black-cocoon-presentation-v158.js';
import { beginOperation, createDefaultSave, recordOperationResumeState, migrateSave } from '../src/save.js';
import { SPECIAL_OPERATIONS_V131, SPECIAL_OPERATION_COUNTS_V131 } from '../src/special-operations-v131.js';

// Real production composition and shipped raster dimensions; only the browser
// host is supplied. Tests neither substitute an engine method nor grant progress.
const dimensions = new Map();
function host() {
  const bus = new EventTarget(), drawings = [], paths = [], stack = [];
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = bus[name].bind(bus);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 0; naturalHeight = 0;
    set src(path) {
      this._src = path; let size = dimensions.get(path);
      if (!size) try {
        const bytes = readFileSync(new URL(`..${new URL(path, 'http://qa.invalid').pathname}`, import.meta.url));
        if (bytes.subarray(1, 4).toString() === 'PNG') size = [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
        else if (bytes.subarray(0, 4).toString() === 'RIFF') {
          for (let offset = 12; offset + 8 < bytes.length;) {
            const chunk = bytes.subarray(offset, offset + 4).toString(), length = bytes.readUInt32LE(offset + 4), data = offset + 8;
            if (chunk === 'VP8X') size = [bytes.readUIntLE(data + 4, 3) + 1, bytes.readUIntLE(data + 7, 3) + 1];
            if (chunk === 'VP8L') { const bits = bytes.readUInt32LE(data + 1); size = [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1]; }
            if (chunk === 'VP8 ') size = [bytes.readUInt16LE(data + 6) & 0x3fff, bytes.readUInt16LE(data + 8) & 0x3fff];
            if (size) break; offset = data + length + (length & 1);
          }
        }
        if (size) dimensions.set(path, size);
      } catch {}
      [this.naturalWidth, this.naturalHeight] = size || [0, 0];
      queueMicrotask(() => { const event = new Event(size ? 'load' : 'error'); this.dispatchEvent(event); this[`on${event.type}`]?.(event); });
    }
    get src() { return this._src; }
    async decode() { if (!this.naturalWidth) throw Error('Missing real raster: ' + this.src); }
  };
  const gradient = { addColorStop() {} };
  const ctx = new Proxy({ globalAlpha: 1, save() { stack.push(this.globalAlpha); }, restore() { assert.ok(stack.length); this.globalAlpha = stack.pop(); },
    drawImage(image, ...args) { assert.ok(image.naturalWidth > 0); drawings.push({ path: image.src, args }); },
    moveTo(...args) { paths.push(['moveTo', ...args]); }, bezierCurveTo(...args) { paths.push(['bezierCurveTo', ...args]); },
    measureText: text => ({ width: String(text).length * 7 }), createLinearGradient: () => gradient, createRadialGradient: () => gradient },
  { get: (target, name) => name in target ? target[name] : () => {} });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const key = (type, code) => { const event = new Event(type, { cancelable: true });
    Object.assign(event, { code, repeat: false, ctrlKey: false, metaKey: false, altKey: false }); bus.dispatchEvent(event); };
  return { canvas, ctx, key, drawings, paths, stack };
}
async function fixture(resumeState, campaignId = 'special-black-cocoon') {
  const browser = host(), events = [], engine = new GameEngine(browser.canvas, { onEvent: event => events.push(event) });
  const campaign = CAMPAIGNS.find(value => value.id === campaignId), world = WORLDS.find(value => value.id === campaign.worldId);
  const options = { campaign, world, weapon: WEAPONS[0], enemyCatalog: ENEMIES, equipment: [], crew: [], seed: 158121,
    missionLevel: (campaignId === 'special-black-cocoon' ? buildBlackCocoonLevelV121 : buildMissionLevelV52)(
      { campaign, world, levelSeeds: LEVEL_SEEDS }), resumeState };
  engine.start(options);
  for (let i = 0; i < 40; i++) await Promise.resolve();
  await Promise.all((engine.getVisibleEnemyAtlasSheetsV65?.() || []).map(sheet => engine.ensureEnemyAtlas?.(sheet)));
  for (let i = 0; i < 40; i++) await Promise.resolve();
  engine.refreshEnemyAtlasAvailabilityV65?.();
  return { ...browser, events, engine, options };
}
function tick(engine, seconds) {
  for (let left = seconds; left > 1e-9;) { const dt = Math.min(1 / 60, left); engine.update(dt); left -= dt; }
}
function hold(subject, code, seconds) { subject.key('keydown', code); tick(subject.engine, seconds); subject.key('keyup', code); }
const payload = engine => JSON.parse(JSON.stringify(engine.captureResumeState()));
const native = engine => { const actor = engine.player; return { x: actor.x, y: actor.y, health: actor.health,
  ammo: actor.ammo, reserve: actor.ammoReserve, inventory: structuredClone(engine.inventory), coop: engine.coopEnabled }; };

test('real captured insertion keeps identity/resources/physical body while native kit and resin animate', async () => {
  const subject = await fixture(), e = subject.engine;
  assert.equal(e.hasBlackCocoonPresentationV158(), true);
  const before = native(e), initial = e.blackCocoonPresentationV158();
  assert.equal(initial.phase, 'awakening'); assert.equal(initial.cut, 0);
  hold(subject, 'KeyD', .4); assert.deepEqual(native(e), before, 'A bound actor cannot move or acquire equipment.');
  const state = payload(e), rig = resolveBlackCocoonPlayerRigV158({ actor: e.player, presentation: e.blackCocoonPresentationV158(), images: e.images });
  assert.equal(rig.eligible, true, rig.reason); assert.equal(rig.ready, true, rig.reason);
  for (const side of ['near', 'far']) assert.ok(rig.arms[side].reachError <= .01);
  e.drawWorld(subject.ctx); assert.ok(e.player.blackCocoonVisualV158?.nativeBody);
  assert.ok(subject.drawings.length > 0); assert.equal(subject.drawings.some(item => item.path.includes('xeno-cocoon-front')), false);
  assert.ok(subject.paths.length > 20); assert.equal(subject.stack.length, 0);
  assert.deepEqual(payload(e), state, 'Drawing cannot advance native progress, clocks, release or inventory.');
  e.stop();
});

test('quiet native E needs four seconds and cuts distinct anchored strands before freeing, never a visual timer', async () => {
  const subject = await fixture(), e = subject.engine, original = native(e);
  hold(subject, 'KeyE', 1.5); const first = e.blackCocoonPresentationV158();
  assert.equal(e.blackCocoonV121.freed, false); assert.ok(first.cut > .36 && first.cut < .39);
  const geometry = blackCocoonResinGeometryV158(first);
  assert.ok(geometry.bands.some(band => band.severed > 0)); assert.ok(geometry.bands.some(band => band.severed === 0));
  const interruptedProgress = e.blackCocoonV121.cocoonProgress;
  tick(e, .5); assert.equal(e.blackCocoonV121.cocoonProgress, interruptedProgress);
  hold(subject, 'KeyE', 2.45); assert.equal(e.blackCocoonV121.freed, false);
  hold(subject, 'KeyE', .1); assert.equal(e.blackCocoonV121.freed, true);
  assert.ok(Number.isFinite(e.blackCocoonV121.freedAtV158));
  assert.equal(e.blackCocoonV121.equipmentRecovered, false); assert.deepEqual(native(e), original);
  const anchor = e.blackCocoonPresentationV158().anchor;
  hold(subject, 'KeyD', .4); assert.ok(e.player.x > original.x + 5, 'Release immediately restores ordinary locomotion.');
  assert.deepEqual(e.blackCocoonPresentationV158().anchor, anchor, 'Residue stays at its original support.');
  tick(e, .6); assert.equal(e.blackCocoonPresentationV158().phase, 'settled');
  assert.equal(e.blackCocoonPresentationV158().actorPose, false); e.stop();
});

test('native force release is faster and noisy; presentation never grants coop or invulnerability', async () => {
  const subject = await fixture(), e = subject.engine;
  hold(subject, 'KeyF', 1.9); assert.equal(e.blackCocoonV121.freed, false); assert.ok(e.blackCocoonV121.noise > 0);
  hold(subject, 'KeyF', .15); assert.equal(e.blackCocoonV121.freed, true);
  e.setCoop(true); assert.equal(e.coopEnabled, false);
  const health = e.player.health; e.damagePlayer(e.player, 5, { ignoreArmor: true });
  assert.ok(e.player.health < health, 'Resin presentation cannot grant damage immunity.'); e.stop();
});

test('pause freezes wake/cut/release and reduced motion retains semantic cuts without decorative oscillation', async () => {
  const subject = await fixture(), e = subject.engine;
  hold(subject, 'KeyE', 1); e.togglePause(); const saved = payload(e), presentation = e.blackCocoonPresentationV158();
  tick(e, 3); assert.deepEqual(payload(e), saved); assert.deepEqual(e.blackCocoonPresentationV158(), presentation);
  e.togglePause(); hold(subject, 'KeyE', 3.05); e.togglePause(); const released = e.blackCocoonPresentationV158();
  tick(e, 3); assert.deepEqual(e.blackCocoonPresentationV158(), released);
  const reduced = resolveBlackCocoonPresentationV158(e.blackCocoonV121, e.blackCocoonPropsV121.cocoon, { reducedMotion: true });
  assert.equal(reduced.cut, released.cut); assert.equal(reduced.release, released.release);
  assert.ok(blackCocoonResinGeometryV158(reduced).bands.every(band => band.sway === 0)); e.stop();
});

test('strategic JSON migration restores partial cut and release at native time without refunds or a second escape', async () => {
  const subject = await fixture(), e = subject.engine;
  hold(subject, 'KeyE', 1.75);
  const save = createDefaultSave(); save.galaxy.unlockedWorldIds.push(subject.options.world.id);
  const operation = beginOperation(save, subject.options.campaign, subject.options.world).operation;
  operation.missionLevelSignature = subject.options.missionLevel.signature; operation.levelSeedId = e.resumeIdentity.levelSeedId;
  assert.equal(recordOperationResumeState(save, e.captureResumeState()), true);
  const migrated = migrateSave(JSON.parse(JSON.stringify(save))), expected = e.blackCocoonPresentationV158();
  const resumed = await fixture(migrated.strategy.currentOperation.resumeState), r = resumed.engine;
  assert.equal(r.lastResumeResult.applied, true, r.lastResumeResult.reason);
  assert.deepEqual(r.blackCocoonPresentationV158(), { ...expected, working: false, forced: false, phase: 'bound' });
  assert.deepEqual(native(r), native(e)); hold(resumed, 'KeyE', 2.3); assert.equal(r.blackCocoonV121.freed, true);
  tick(r, .2); const released = payload(r), visual = r.blackCocoonPresentationV158();
  const again = await fixture(released); assert.equal(again.engine.lastResumeResult.applied, true);
  assert.deepEqual(again.engine.blackCocoonPresentationV158(), visual);
  assert.equal(again.engine.blackCocoonPresentationV158().actorPose, false);
  assert.deepEqual(native(again.engine), native(r)); e.stop(); r.stop(); again.engine.stop();
});

test('incompatible release timestamps are rejected before actor/world mutation; older freed saves settle', async () => {
  const subject = await fixture(), e = subject.engine; hold(subject, 'KeyE', 4.05);
  const valid = payload(e), before = payload(e);
  for (const invalid of [-1, e.blackCocoonV121.elapsed + 1, '0', {}, Infinity]) {
    const raw = structuredClone(valid); raw.specialOperation.blackCocoonV121.freedAtV158 = invalid;
    assert.equal(e.applyResumeState(raw).applied, false); assert.deepEqual(payload(e), before);
  }
  const old = structuredClone(valid); delete old.specialOperation.blackCocoonV121.freedAtV158;
  assert.equal(e.applyResumeState(old).applied, true);
  assert.equal(e.blackCocoonPresentationV158().phase, 'settled');
  const captured = createBlackCocoonStateV121(); captured.freedAtV158 = 0;
  assert.equal(validateBlackCocoonStateV121(captured).valid, false);
  assert.equal(BLACK_COCOON_PRESENTATION_V158.canonExact, false); e.stop();
});

test('native hurt/downed and other campaigns retain their ordinary body and action priority', async () => {
  const subject = await fixture(), e = subject.engine;
  const health = e.player.health;
  e.damagePlayer(e.player, 5, { ignoreArmor: true }); assert.ok(e.player.health < health);
  const rig = resolveBlackCocoonPlayerRigV158({ actor: e.player, presentation: e.blackCocoonPresentationV158(), images: e.images });
  assert.equal(rig.eligible, false); assert.equal(rig.reason, 'native-body-priority');
  assert.equal(e.blackCocoonV121.freed, false); e.stop();
  const ordinary = await fixture(undefined, 'pair-001-mire');
  assert.equal(ordinary.engine.hasBlackCocoonPresentationV158(), false);
  assert.equal(ordinary.engine.getSnapshot().blackCocoonPresentationV158, undefined);
  assert.equal(resolveBlackCocoonPresentationV158({ operationId: 'broodstorm' }, { x: 10, groundY: 20 }), null);
  ordinary.engine.stop();
});

test('a cut opens continuously at its threshold rather than popping a strap end across the body', () => {
  const state = createBlackCocoonStateV121(), anchor = { x: 200, groundY: 570 };
  state.cocoonProgress = (.08 - 1e-6) * 4;
  const before = blackCocoonResinGeometryV158(resolveBlackCocoonPresentationV158(state, anchor));
  state.cocoonProgress = (.08 + 1e-6) * 4;
  const after = blackCocoonResinGeometryV158(resolveBlackCocoonPresentationV158(state, anchor));
  for (const key of ['leftTip', 'rightTip', 'y', 'sag']) assert.ok(Math.abs(before.bands[0][key] - after.bands[0][key]) < .001, key);
  state.cocoonProgress = 4; state.freed = true; state.freedAtV158 = 0; state.elapsed = 1;
  const settled = blackCocoonResinGeometryV158(resolveBlackCocoonPresentationV158(state, anchor));
  assert.deepEqual(settled.anchor, anchor);
  assert.ok(settled.bands.every(band => Math.abs(band.y - (anchor.groundY - 4)) < .001));
});

test('the registry records procedural binding separately from the unfinished bitmap corpus and wider campaign', () => {
  const operation = SPECIAL_OPERATIONS_V131.find(entry => entry.id === 'black-cocoon');
  assert.equal(operation.implementationStatus, 'partial'); assert.equal(operation.canonExact, false);
  assert.equal(operation.playable, true);
  assert.deepEqual(operation.remainingMechanics, ['dedicated-cocoon-bitmap-corpus', 'extended-survivor-campaign']);
  assert.equal(BLACK_COCOON_PRESENTATION_V158.animationStatus, 'dedicated-procedural-animation');
  assert.equal(BLACK_COCOON_PRESENTATION_V158.canonExact, false);
  assert.equal(SPECIAL_OPERATION_COUNTS_V131.total, 21); assert.equal(SPECIAL_OPERATION_COUNTS_V131.playable, 21);
  assert.equal(SPECIAL_OPERATION_COUNTS_V131.partial, 20); assert.equal(SPECIAL_OPERATION_COUNTS_V131.effective, 1);
});

test('actual Canvas paths, control points, round strokes and base fill never sink through the support while resin falls', () => {
  const anchor = { x: 200, groundY: 570 }, strokes = [], fills = []; let path = [];
  const ctx = { lineWidth: 1, save() {}, restore() {}, beginPath() { path = []; }, closePath() {},
    moveTo(x, y) { path.push({ x, y }); }, lineTo(x, y) { path.push({ x, y }); },
    bezierCurveTo(x1, y1, x2, y2, x3, y3) { path.push({ x: x1, y: y1 }, { x: x2, y: y2 }, { x: x3, y: y3 }); },
    ellipse(x, y, rx, ry) { fills.push({ x, y, rx, ry }); }, fill() {},
    stroke() { strokes.push({ lineWidth: this.lineWidth, path: structuredClone(path) }); } };
  for (const elapsed of [0, .05, .2, .4, .7, .89, .9, 1, 100]) {
    const state = { ...createBlackCocoonStateV121(), cocoonProgress: 4, freed: true, freedAtV158: 0, elapsed };
    const presentation = resolveBlackCocoonPresentationV158(state, anchor);
    for (const height of [80, 146, 240]) for (const layer of ['back', 'front']) {
      drawBlackCocoonResinV158(ctx, presentation, { height, layer });
    }
  }
  assert.ok(strokes.length > 300);
  for (const stroke of strokes) for (const p of stroke.path) {
    assert.ok(p.y + stroke.lineWidth / 2 <= anchor.groundY - .49,
      `drawn control/point ${p.y} plus half stroke ${stroke.lineWidth / 2} crosses support ${anchor.groundY}`);
  }
  for (const ellipse of fills) assert.ok(ellipse.y + ellipse.ry < anchor.groundY);
});

test('release keeps native empty hands until the real nearby bag is recovered, with no resource grant or weapon swap', async () => {
  const subject = await fixture(), e = subject.engine, before = native(e);
  hold(subject, 'KeyE', 4.05); assert.equal(e.blackCocoonV121.freed, true);
  e.drawActor(subject.ctx, e.player);
  assert.equal(e.player.heldWeaponVisualV125, null, 'A selected firearm cannot appear before its bag is recovered.');
  assert.equal(e.blackCocoonV121.equipmentRecovered, false);
  assert.equal(subject.drawings.some(item => item.path.includes('m41a-pulse-rifle-native')), false);
  const bag = e.blackCocoonPropsV121.equipment;
  subject.key('keydown', 'KeyD');
  for (let i = 0; i < 600 && e.player.x + e.player.w / 2 < bag.x - 65; i++) tick(e, 1 / 60);
  subject.key('keyup', 'KeyD'); assert.ok(Math.abs(e.player.x + e.player.w / 2 - bag.x) < 90);
  hold(subject, 'KeyE', .05); assert.equal(e.blackCocoonV121.equipmentRecovered, true);
  e.drawActor(subject.ctx, e.player); assert.equal(e.player.heldWeaponVisualV125?.weaponId, WEAPONS[0].id);
  assert.equal(e.player.ammo, before.ammo); assert.equal(e.player.ammoReserve, before.reserve);
  assert.deepEqual(e.inventory, before.inventory); e.stop();
});
