import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, WORLDS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content.js';
import { buildBlackCocoonLevelV121 } from '../src/black-cocoon-runtime-v121.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { createBlackCocoonStateV121, validateBlackCocoonStateV121 } from '../src/black-cocoon-state-v121.js';
import { resolveBlackCocoonPresentationV158, resolveBlackCocoonPlayerRigV158, resolveBlackCocoonResinLayoutV158,
  blackCocoonResinGeometryV158, drawBlackCocoonResinV158, BLACK_COCOON_PRESENTATION_V158 } from '../src/black-cocoon-presentation-v158.js';
import { SaveSystem, beginOperation, createDefaultSave, recordOperationResumeState, migrateSave } from '../src/save.js';
import { SPECIAL_OPERATIONS_V131, SPECIAL_OPERATION_COUNTS_V131 } from '../src/special-operations-v131.js';
import { verifyQueenMotherChoirRegistryContinuationV188 } from './audit-tantalus-priorities-v188.mjs';
import { BIOLOGICAL_ART_V188, biologicalArtAnchorV188, drawHumanResinSupportV188 } from '../src/biological-art-v188.js';

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
async function fixture(resumeState, campaignId = 'special-black-cocoon', onEvent = null) {
  const browser = host(), events = [], engine = new GameEngine(browser.canvas, { onEvent: event => { events.push(event); onEvent?.(event, engine); } });
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

test('QA terminal save resumes native time without E, then pauses the exact committed partial cut', async t => {
  const data = new Map(), storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key) };
  const system = new SaveSystem(storage); system.newGame(1);
  const subject = await fixture(undefined, 'special-black-cocoon', (event, engine) => {
    if (event.type !== 'terminal-save-v188') return;
    const candidate = structuredClone(system.data);
    assert.equal(recordOperationResumeState(candidate, engine.captureResumeState()), true);
    system.commit(candidate);
  }), e = subject.engine;
  system.data.galaxy.unlockedWorldIds.push(subject.options.world.id);
  const operation = beginOperation(system.data, subject.options.campaign, subject.options.world).operation;
  operation.missionLevelSignature = subject.options.missionLevel.signature; operation.levelSeedId = e.resumeIdentity.levelSeedId;
  system.commit(system.data);
  hold(subject, 'KeyE', 1.21); subject.key('keydown', 'KeyP'); subject.key('keyup', 'KeyP');
  const before = native(e), partial = { native: { cut: e.blackCocoonV121.cocoonProgress, freed: false },
    player: { health: e.player.health, ammo: e.player.ammo, reserve: e.player.ammoReserve, appearance: structuredClone(e.player.appearanceV126) } };
  let now = 0; const keys = [], clicks = [];
  const context = createContext({ assert, structuredClone, localStorage: storage, performance: { now: () => now },
    __ATF_GAME__: e, __ATF_V51__: { saveSystem: system } });
  const evaluate = (fn, arg) => runInContext('(' + fn.toString() + ')', context)(arg);
  const page = {
    evaluate: async (fn, arg) => structuredClone(evaluate(fn, arg)),
    locator: selector => ({
      click: async () => { assert.equal(selector, '#mission-save-v86'); clicks.push(selector);
        assert.equal(e.missionSavePolicyV188().mode, 'terminal'); assert.equal(e.beginTerminalSaveV188().allowed, true); },
      focus: async () => { assert.equal(selector, '#game-canvas'); subject.canvas.focus(); }
    }),
    keyboard: { press: async code => { keys.push(code); subject.key('keydown', code); subject.key('keyup', code); } },
    waitForFunction: async (fn, arg, options = {}) => {
      const deadline = now + (options.timeout || 45000);
      while (!evaluate(fn, arg) && now < deadline) { tick(e, 1 / 60); now += 1000 / 60; }
      assert.ok(evaluate(fn, arg), 'The actual terminal cannot commit while native time remains paused.');
    }
  };
  const source = readFileSync(new URL('./qa-black-cocoon-browser-v158.mjs', import.meta.url), 'utf8');
  const start = source.indexOf('async function savePartialCocoonAtTerminal(');
  assert.ok(start >= 0);
  const body = source.slice(start, source.indexOf('\nasync function main()', start));
  const helper = runInContext('(' + body + ')', context);
  try {
    const receipt = await helper(page, partial);
    assert.deepEqual(clicks, ['#mission-save-v86']); assert.deepEqual(keys, ['KeyP', 'KeyP']);
    assert.equal(e.paused, true); assert.deepEqual(native(e), before);
    assert.equal(e.blackCocoonV121.cocoonProgress, partial.native.cut); assert.equal(e.blackCocoonV121.freed, false);
    const saved = new SaveSystem(storage).load(1).strategy.currentOperation;
    assert.equal(saved.id, operation.id); assert.equal(saved.resumeState.specialOperation.blackCocoonV121.cocoonProgress, partial.native.cut);
    assert.equal(subject.events.filter(event => event.type === 'terminal-save-v188').length, 1);
    assert.equal(receipt.operationId, operation.id); assert.equal(receipt.started.total, 3);
    assert.ok(now >= 3000 && now < 45000);
    t.diagnostic('Actual JS QA helper, production Cocon runtime and SaveSystem. Declared DOM/Canvas/RAF/storage host; visible save click delegates to the observed native terminal branch, whose event commits the real captured checkpoint.');
  } finally { e.stop(); }
});

test('native Cocon terminal countdown stays pending during pause and cannot fabricate a receipt', async () => {
  const subject = await fixture(), e = subject.engine;
  hold(subject, 'KeyE', 1.21); subject.key('keydown', 'KeyP'); subject.key('keyup', 'KeyP');
  assert.equal(e.beginTerminalSaveV188().allowed, true);
  const pending = structuredClone(e.terminalSaveV188), cut = e.blackCocoonV121.cocoonProgress;
  tick(e, 45);
  assert.deepEqual(e.terminalSaveV188, pending); assert.equal(pending.remaining, 3);
  assert.equal(e.blackCocoonV121.cocoonProgress, cut);
  assert.equal(subject.events.some(event => event.type === 'terminal-save-v188'), false); e.stop();
});

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
  assert.equal(SPECIAL_OPERATION_COUNTS_V131.total, 22); assert.equal(SPECIAL_OPERATION_COUNTS_V131.playable, 22);
  assert.equal(SPECIAL_OPERATION_COUNTS_V131.partial, 20); assert.equal(SPECIAL_OPERATION_COUNTS_V131.effective, 2);
  const fiorina = SPECIAL_OPERATIONS_V131.filter(entry => entry.id === 'alien3-fiorina-161');
  assert.equal(fiorina.length, 1);
  assert.equal(fiorina[0].campaignId, 'special-alien3-fiorina-161');
  assert.equal(fiorina[0].implementationStatus, 'partial'); assert.equal(fiorina[0].canonExact, false);
  const registry = verifyQueenMotherChoirRegistryContinuationV188(SPECIAL_OPERATIONS_V131, SPECIAL_OPERATION_COUNTS_V131);
  assert.deepEqual(registry.currentCounts, { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 });
  assert.deepEqual(registry.changedIds, ['cargo-brutal', 'broodstorm', 'queen-mother-song'],
    'Guard presentation adds no registry change; Cargo alone changes the counts and the two historical queen debts stay distinct.');
  assert.equal(registry.unchangedOperations, 18);
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

test('human resin art: the empty support is a rear layer, while all nine native cut/release bands remain identical', () => {
  const path = BIOLOGICAL_ART_V188['human-resin-support'].path, bytes = readFileSync(new URL(`..${path}`, import.meta.url));
  const image = { src: path, complete: true, naturalWidth: bytes.readUInt32BE(16), naturalHeight: bytes.readUInt32BE(20) };
  const images = new Map([[path, image]]), anchor = { x: 700, groundY: 570 };
  for (const reducedMotion of [false, true]) for (const [progress, freed, elapsed, freedAtV158] of [[0, false, .2, null], [1.5, false, 2, null], [3.5, false, 4, null], [4, true, 5.3, 5], [4, true, 7, null]]) {
    const state = { operationId: 'black-cocoon', cocoonProgress: progress, freed, elapsed, freedAtV158 }, before = structuredClone(state);
    const presentation = resolveBlackCocoonPresentationV158(state, anchor, { reducedMotion }), a = host(), b = host();
    const geometry = drawBlackCocoonResinV158(a.ctx, presentation, { images, layer: 'front' });
    drawBlackCocoonResinV158(b.ctx, presentation, { layer: 'front' });
    assert.equal(geometry.bands.length, 9); assert.deepEqual(a.paths, b.paths, 'front bonds use their exact native geometry');
    assert.equal(a.drawings.length, 0, 'no baked foreground person or ties');
    drawBlackCocoonResinV158(a.ctx, presentation, { images, layer: 'back' });
    assert.deepEqual(a.drawings.map(item => item.path), [path]);
    const fit = drawHumanResinSupportV188(b.ctx, images, geometry); assert.ok(fit);
    assert.ok(Math.abs(biologicalArtAnchorV188(fit, 'ground')[1] - anchor.groundY) < 1e-9, 'unstroked bitmap roots meet the real floor');
    assert.deepEqual(state, before); assert.equal(a.stack.length, 0); assert.equal(b.stack.length, 0);
  }
  const hidden = resolveBlackCocoonPresentationV158({ operationId: 'black-cocoon', boarded: true }, anchor), subject = host();
  assert.equal(drawBlackCocoonResinV158(subject.ctx, hidden, { images, layer: 'back' }), null); assert.equal(subject.drawings.length, 0);
});

test('human resin art: production start loads only its support and drawing preserves native actor, injuries, equipment and save', async () => {
  const subject = await fixture(), e = subject.engine, path = BIOLOGICAL_ART_V188['human-resin-support'].path;
  assert.ok(e.images.get(path)?.naturalWidth > 0, 'prepared by the real production start');
  assert.equal(e.images.has(BIOLOGICAL_ART_V188['qz17-cradle-breached'].path), false);
  const state = payload(e), actor = native(e); e.drawActor(subject.ctx, e.player);
  assert.ok(subject.drawings.some(item => item.path === path)); assert.ok(e.player.blackCocoonVisualV158?.nativeBody);
  assert.equal(subject.drawings.some(item => item.path.includes('xeno-cocoon-front')), false);
  assert.deepEqual(payload(e), state); assert.deepEqual(native(e), actor);
  e.stop();
  const unrelated = await fixture(undefined, 'pair-001-mire');
  assert.equal(unrelated.engine.images.has(path), false); unrelated.engine.stop();
});

test('human resin layout follows the standing rig scale, clears the face and stays on the original wall after release', async () => {
  const subject = await fixture(), e = subject.engine, presentation = e.blackCocoonPresentationV158(), actor = e.player;
  const original = structuredClone(actor), state = payload(e);
  const layout = resolveBlackCocoonResinLayoutV158({ actor, presentation, images: e.images });
  assert.ok(layout.height > actor.h * .8 && layout.height < actor.h * 1.15, 'support is at native human scale');
  assert.ok(layout.headBounds && layout.detailScale < .8);
  const geometry = blackCocoonResinGeometryV158(presentation, layout);
  assert.equal(geometry.bands.length, 9);
  assert.ok(geometry.bands[0].y - 9.5 * layout.detailScale > layout.headBounds.y + layout.headBounds.height, 'the up-curve and stroke clear the whole face');
  const stable = result => ['height', 'width', 'bandTop', 'bandBottom', 'detailScale'].map(key => result[key]);
  for (const patch of [{ x: actor.x + 180, crouching: true, vx: -80 }, { y: actor.y - 50, grounded: false, vy: -100 }, { facing: -1, v52HurtClock: .7, downed: true }]) {
    const moved = { ...actor, ...patch }, released = { ...presentation, actorPose: false, freed: true, release: .6 };
    const later = resolveBlackCocoonResinLayoutV158({ actor: moved, presentation: released, images: e.images });
    assert.deepEqual(stable(later), stable(layout), 'player motion or injury cannot move/resize the mural residue');
    const residue = blackCocoonResinGeometryV158(released, later); assert.deepEqual(residue.anchor, presentation.anchor);
  }
  for (const cut of [0, .1, .4, .8, 1]) for (const release of [0, .2, .6, 1]) {
    const p = { ...presentation, cut, release };
    const old = blackCocoonResinGeometryV158(p), current = blackCocoonResinGeometryV158(p, layout);
    assert.deepEqual(current.bands.map(band => band.severed), old.bands.map(band => band.severed), 'all nine cut thresholds stay unchanged');
    if (release === 1) assert.ok(current.bands.every(band => Math.abs(band.y - (presentation.anchor.groundY - 4)) < 1e-9));
  }
  assert.deepEqual(actor, original); assert.deepEqual(payload(e), state); e.stop();
});
