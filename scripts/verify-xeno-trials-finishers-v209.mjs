import assert from 'node:assert/strict';
import test from 'node:test';
import { XENO_TRIALS_CAPTURE_ATLASES_V163 } from '../src/xeno-trials-capture-data-v163.js';
import { sampleXenoTrialsFloorLockV207 } from '../src/xeno-trials-capture-v163.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { activateXenoTrialsFinisherV207, advanceXenoTrialsFinisherV207, createXenoTrialsFinisherV207,
  getXenoTrialsFinisherStateV207, getXenoTrialsFinisherViewV207, skipXenoTrialsFinisherV207 } from '../src/xeno-trials-finishers-v207.js';
import { drawXenoTrialsFinisherFixturesV209, getXenoTrialsFinisherFixturesV209 } from '../src/xeno-trials-finishers-v209.js';
import { getXenoTrialsBodyGapV105, XENO_TRIALS_ARENA_V105 } from '../src/xeno-trials-geometry-v105.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { drawXenoTrialsRigV154, XENO_TRIALS_RIGS_V154, XENO_TRIALS_ARTICULATED_RIGS_V197, XENO_TRIALS_ARTICULATED_RIGS_V199,
  XENO_TRIALS_ARTICULATED_RIGS_V201, XENO_TRIALS_DEFENSE_RIGS_V204 } from '../src/xeno-trials-rig-v154.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { getXenoTrialsStageHazardV188 } from '../src/xeno-trials-stage-hazards-v188.js';

const cultist = 'dd-darwin-era-cultist', commando = 'import-game-dd-wy-commando', guardian = 'import-game-dd-guardian';
const steamStage = 'xt179-ship-engineering', cryoStage = 'xt190-specimen-transfer';
const floor = XENO_TRIALS_ARENA_V105.floor;
const dt = 1 / 120;
const textures = new Map([...XENO_TRIALS_CAPTURE_ATLASES_V163, ...XENO_TRIALS_RIGS_V154,
  ...XENO_TRIALS_ARTICULATED_RIGS_V197, ...XENO_TRIALS_ARTICULATED_RIGS_V199, ...XENO_TRIALS_ARTICULATED_RIGS_V201,
  ...XENO_TRIALS_DEFENSE_RIGS_V204].map(source =>
  [source.path, { complete: true, naturalWidth: source.sourceWidth, naturalHeight: source.sourceHeight }]));

function playerInput(match, tick) {
  const [player, opponent] = match.fighters;
  const direction = player.x < opponent.x ? 1 : -1;
  if (getXenoTrialsBodyGapV105(player, opponent, direction) > 6 && !player.attack)
    return direction > 0 ? { right: true } : { left: true };
  return { light: tick % 3 === 0 };
}

function nativeDuel({ playerId = 'prowler', opponentId = cultist, stageId, corner = false, destination = null }) {
  // Native simulation and one-hit rules. Direct opponent controls deterministically
  // position both actors without moving roots outside the engine.
  const match = createXenoTrialsMatchV96({ playerId, opponentId, stageId, seed: 96, introSeconds: 0,
    roundsToWin: 1, rulesV119: { initialHp: 1 } });
  if (corner) for (let tick = 0; tick < 3000; tick++) stepXenoTrialsMatchV96(match, dt, { right: true }, { right: true });
  if (destination !== null) for (let tick = 0; tick < 2000 && match.fighters[1].x < destination; tick++)
    stepXenoTrialsMatchV96(match, dt, {}, { right: true });
  for (let tick = 0; tick < 1500 && match.phase === 'active'; tick++) stepXenoTrialsMatchV96(match, dt, playerInput(match, tick), {});
  assert.equal(match.result?.winner, 'player');
  return match;
}

function canvas(record = false) {
  const calls = [];
  return new Proxy({ globalAlpha: 1, calls, measureText: text => ({ width: String(text).length * 8 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) },
  { get: (object, key) => object[key] ?? ((...args) => { if (record) calls.push([key, ...args]); }) });
}
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function renderedRig(lock, gain) {
  return drawXenoTrialsRigV154(canvas(), lock.rig, textures.get(lock.rig.path), sampleXenoTrialsFloorLockV207(lock, gain),
    lock.attackerMetrics, lock.attacker.x, floor, lock.attacker.facing);
}

test('15 exact V209 pairings plant a paw, knuckle or boot and preserve every other measured support', () => {
  const pairs = [
    ['user-skeletal-quadruped', 'paw', [[cultist, false], [commando, true]]],
    ['albino-runner', 'paw', [[cultist, false], [commando, true], [guardian, true]]],
    ['cryo-lurker', 'paw', [[cultist, false], [commando, true]]],
    ['cryo-burster', 'paw', [[cultist, true]]],
    ['import-xeno-gorillaxeno', 'knuckle', [[cultist, false], [commando, true]]],
    ['combat-synth', 'boot', [[cultist, true]]],
    ['albino-combat-synth', 'boot', [[cultist, false], [commando, true]]],
    ['import-synth-eloise', 'boot', [[cultist, false], [commando, true]]]
  ];
  for (const [playerId, kind, targets] of pairs) for (const [opponentId, corner] of targets) {
    const match = nativeDuel({ playerId, opponentId, corner });
    const terminal = structuredClone(match);
    const offer = createXenoTrialsFinisherV207(match, textures);
    assert.equal(offer?.id, playerId + '::fin1', playerId + '/' + opponentId);
    assert.equal(offer.kind, kind);
    const { lock } = offer;
    const rest = renderedRig(lock, 0), lift = renderedRig(lock, .5), hold = renderedRig(lock, 1);
    assert.equal(hold?.clip, kind + '-lock-v209');
    assert.equal(lock.layout.rootX, match.fighters[1].x);
    assert.equal(lock.layout.ground, floor);
    assert.ok(lift.contacts[lock.contactKey][1] < rest.contacts[lock.contactKey][1] - 5);
    assert.ok(distance(hold.contacts[lock.contactKey], lock.targetAnchor) < 1e-6);
    assert.equal(lock.supportKeys.length, kind === 'boot' ? 1 : 3);
    for (const key of lock.supportKeys) for (const frame of [lift, hold])
      assert.ok(distance(frame.contacts[key], rest.contacts[key]) <= 1.5);
    assert.deepEqual(match, terminal);
    const incomplete = new Map(textures);
    incomplete.delete(lock.rig.path);
    assert.equal(createXenoTrialsFinisherV207(match, incomplete), null);
    assert.equal(createXenoTrialsFinisherV207(match, textures, true), null);
  }
  assert.equal(createXenoTrialsFinisherV207(nativeDuel({ playerId: 'cryo-burster', opponentId: guardian, corner: true }), textures), null);
  assert.equal(createXenoTrialsFinisherV207(nativeDuel({ playerId: 'combat-synth' }), textures), null);
});

test('steam and cryogenic fixtures are drawn from setup, with one measured hardware choice and one contact choice', () => {
  for (const [stageId, kind] of [[steamStage, 'steam'], [cryoStage, 'cryo']]) {
    const source = getXenoTrialsStageHazardV188(stageId);
    const fixtures = getXenoTrialsFinisherFixturesV209(stageId);
    const idle = canvas(true);
    assert.equal(fixtures.length, 2);
    for (const [index, fixture] of fixtures.entries()) {
      assert.equal(fixture.kind, source.kind);
      assert.equal(fixture.source, source.id);
      assert.equal((fixture.left + fixture.right) / 2, source.anchors[index]);
      assert.equal(fixture.right - fixture.left, source.width);
    }
    assert.deepEqual(drawXenoTrialsFinisherFixturesV209(idle, stageId, null).map(fixture => fixture.active), [false, false]);
    assert.ok(idle.calls.some(([operation, x]) => operation === 'fillRect' && x === fixtures[1].left - 8));
    const match = nativeDuel({ stageId, destination: fixtures[1].left + 39 });
    const offer = createXenoTrialsFinisherV207(match, textures);
    assert.equal(offer?.kind, kind);
    assert.deepEqual(getXenoTrialsFinisherStateV207(offer).alternatives, [{ id: 'prowler::fin1', kind: 'claw' }]);
    assert.equal(activateXenoTrialsFinisherV207(offer, 'unoffered'), offer);
    for (const chosen of ['prowler::fin1', 'prowler::fin2']) {
      const playing = activateXenoTrialsFinisherV207(offer, chosen);
      assert.equal(playing.id, chosen);
      assert.equal(activateXenoTrialsFinisherV207(playing, 'prowler::fin1'), playing);
      const contact = getXenoTrialsFinisherViewV207(advanceXenoTrialsFinisherV207(playing, playing.timing.approachMs + 20));
      assert.equal(contact.contact, true);
      const pad = drawXenoTrialsFinisherFixturesV209(canvas(true), stageId, contact);
      assert.deepEqual(pad.map(fixture => fixture.active), [false, chosen === 'prowler::fin2']);
      if (chosen === 'prowler::fin2') {
        assert.equal(playing.lock.fixture, fixtures[1]);
        assert.equal(playing.lock.targetAnchor, fixtures[1].pads[0]);
        assert.ok(distance(renderedRig(playing.lock, 1).contacts.handFar, playing.lock.targetAnchor) <= 5);
      }
      const skip = getXenoTrialsFinisherViewV207(skipXenoTrialsFinisherV207(playing));
      assert.ok(drawXenoTrialsFinisherFixturesV209(canvas(), stageId, skip).every(fixture => !fixture.active));
    }
    assert.equal(createXenoTrialsFinisherV207({ ...match, tick: match.tick + 1 }, textures), null);
    assert.equal(createXenoTrialsFinisherV207(nativeDuel({ stageId }), textures)?.id, 'prowler::fin1');
  }
  assert.deepEqual(getXenoTrialsFinisherFixturesV209('xt179-vehicle-bay'), []);
});

async function runRuntime(stageId, alternate) {
  const profile = createXenoTrialsProgressV96();
  profile.unlocked.push('prowler');
  const ticket = beginXenoTrialsV96(profile, { playerId: 'prowler', opponentId: cultist, stageId, difficulty: 'easy',
    activityV119: { branch: 'on-demand', id: 'on-demand', rules: { initialHp: 1 } } });
  assert.ok(ticket.applied);
  // Native runtime and CPU with decoded-image dimensions, Canvas and RAF doubles.
  const listeners = new Map(), frames = new Map(), context = canvas();
  const display = { tagName: 'CANVAS', width: 1000, height: 560, getContext: () => context, focus() {} };
  const host = { addEventListener: (type, handler) => listeners.set(type, handler), removeEventListener: type => listeners.delete(type) };
  const focusListeners = new Map();
  const document = { hidden: false, hasFocus: () => true,
    addEventListener: (type, handler) => focusListeners.set(type, handler), removeEventListener: type => focusListeners.delete(type) };
  let progress = ticket.state, now = 0, serial = 0, verdicts = 0;
  const runtime = createXenoTrialsRuntimeV96({ canvas: display, window: host, document,
    config: ticket.config, loadImage: async path => textures.get(path) || { complete: true, naturalWidth: 1024, naturalHeight: 1024 },
    requestAnimationFrame(callback) { frames.set(++serial, callback); return serial; },
    cancelAnimationFrame(id) { frames.delete(id); },
    onResult(result) {
      const settled = settleXenoTrialsV96(progress, result);
      assert.ok(settled.applied);
      progress = settled.state;
      verdicts++;
    }
  });
  function frame(ms = 1000 * dt) {
    now += ms;
    for (const [id, callback] of [...frames]) if (frames.delete(id)) callback(now);
  }
  try {
    assert.equal(await runtime.start(), true);
    assert.deepEqual(runtime.getState().finisherFixturesV208.map(fixture => fixture.active), [false, false]);
    let round = 0, startTick = 0;
    for (let step = 0; step < 3000; step++) {
      const state = runtime.getState();
      if (state.phase === 'match-over') break;
      if (state.phase === 'active' && !state.presentation.blocksSimulation) {
        if (state.round !== round) { round = state.round; startTick = state.tick; }
        const roundTick = state.tick - startTick;
        const gap = getXenoTrialsBodyGapV105(...state.fighters);
        const input = roundTick < 3 ? { left: true } : roundTick < 146 && gap > 13 ? {} : playerInput(state, state.tick);
        for (const action of ['left', 'right', 'light']) runtime.setInput(action, Boolean(input[action]));
      }
      frame();
    }
    const offered = runtime.getState();
    assert.equal(offered.finisherV207?.id, 'prowler::fin2', stageId + ' ' + JSON.stringify(offered.result));
    assert.equal(offered.canActivateFinisherV207, true);
    assert.equal(verdicts, 1);
    const focus = name => {
      const target = { closest: selector => selector.split(', ').includes('[data-xt="' + name + '"]') ? target : null };
      focusListeners.get('focusin')({ target });
    };
    focus('finisher');
    assert.equal(runtime.getState().paused, false);
    focus('finisher-alternative');
    assert.equal(runtime.getState().paused, false);
    focus('outside-combat');
    assert.equal(runtime.getState().paused, true);
    assert.equal(runtime.activateFinisher(), false);
    assert.equal(runtime.resume(), true);
    if (alternate) assert.equal(runtime.activateFinisher('prowler::fin1'), true);
    else listeners.get('keydown')({ code: 'KeyF', target: display, preventDefault() {} });
    for (let i = 0; i < 5; i++) frame(120);
    const hold = runtime.getState();
    assert.equal(hold.finisherV207.id, alternate ? 'prowler::fin1' : 'prowler::fin2');
    assert.equal(hold.finisherV207.phase, 'playing');
    assert.equal(hold.finisherFixturesV208.filter(fixture => fixture.active).length, Number(!alternate));
    assert.ok(hold.rigViewsV154.some(row => row.finisherV207?.role === 'attacker' && row.finisherV207.contact));
    assert.equal(runtime.skipSequence(), true);
    assert.equal(runtime.activateFinisher(), false);
    assert.ok(runtime.getState().finisherFixturesV208.every(fixture => !fixture.active));
    assert.deepEqual(runtime.getState().result, offered.result);
    assert.equal(verdicts, 1);
    assert.equal(progress.ledger.length, 1);
  } finally { runtime.stop(); }
}

test('the native runtime reaches both V209 installations and settles one verdict whether the player picks F or contact', async () => {
  await runRuntime(steamStage, true);
  await runRuntime(cryoStage, false);
});
