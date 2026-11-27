import assert from 'node:assert/strict';
import test from 'node:test';
import { XENO_TRIALS_CAPTURE_ATLASES_V163 } from '../src/xeno-trials-capture-data-v163.js';
import { sampleXenoTrialsFloorLockV207 } from '../src/xeno-trials-capture-v163.js';
import { createXenoTrialsMatchV96, nextXenoTrialsRoundV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { activateXenoTrialsFinisherV207, advanceXenoTrialsFinisherV207, createXenoTrialsFinisherV207,
  getXenoTrialsFinisherViewV207, pauseXenoTrialsFinisherV207, skipXenoTrialsFinisherV207 } from '../src/xeno-trials-finishers-v207.js';
import { drawXenoTrialsFinisherFixturesV208, getXenoTrialsFinisherFixturesV208 } from '../src/xeno-trials-finishers-v208.js';
import { getXenoTrialsBodyGapV105, XENO_TRIALS_ARENA_V105 } from '../src/xeno-trials-geometry-v105.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { drawXenoTrialsRigV154, XENO_TRIALS_RIGS_V154 } from '../src/xeno-trials-rig-v154.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { getXenoTrialsStageHazardV188 } from '../src/xeno-trials-stage-hazards-v188.js';

const cultist = 'dd-darwin-era-cultist';
const commando = 'import-game-dd-wy-commando';
const guardian = 'import-game-dd-guardian';
const stageIds = ['xt179-reactor', 'xt179-ship-extraction'];
const dt = 1 / 120;
const textures = new Map([...XENO_TRIALS_CAPTURE_ATLASES_V163, ...XENO_TRIALS_RIGS_V154].map(source =>
  [source.path, { complete: true, naturalWidth: source.sourceWidth, naturalHeight: source.sourceHeight }]));

function playerInput(match, tick) {
  const [player, opponent] = match.fighters;
  const right = player.x < opponent.x;
  const gap = getXenoTrialsBodyGapV105(player, opponent, right ? 1 : -1);
  return gap > 6 && !player.attack ? { [right ? 'right' : 'left']: true } : { light: tick % 3 === 0 };
}

function fixedOpponentDuel({ playerId = 'prowler', opponentId = cultist, stageId, corner = false, destination = null }) {
  // The fixture uses the normal 1 PV rule and direct opponent input. Every
  // position, finishing hit, verdict and aftermath is produced by the engine.
  const match = createXenoTrialsMatchV96({ playerId, opponentId, stageId, seed: 96, introSeconds: 0,
    roundsToWin: 1, rulesV119: { initialHp: 1 } });
  if (corner) for (let tick = 0; tick < 1500; tick++) stepXenoTrialsMatchV96(match, dt, { right: true }, { right: true });
  if (destination !== null) for (let tick = 0; tick < 600 && match.fighters[1].x < destination; tick++)
    stepXenoTrialsMatchV96(match, dt, {}, { right: true });
  for (let tick = 0; tick < 1000 && match.phase === 'active'; tick++) stepXenoTrialsMatchV96(match, dt, playerInput(match, tick), {});
  assert.equal(match.result?.winner, 'player');
  return match;
}

function canvas(record = true) {
  const calls = [];
  return new Proxy({ globalAlpha: 1, calls, measureText: text => ({ width: String(text).length * 8 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) },
  { get: (object, key) => object[key] ?? ((...args) => { if (record) calls.push([key, ...args]); }) });
}

function renderedRig(lock, gain) {
  return drawXenoTrialsRigV154(canvas(), lock.rig, textures.get(lock.rig.path), sampleXenoTrialsFloorLockV207(lock, gain),
    lock.attackerMetrics, lock.attacker.x, XENO_TRIALS_ARENA_V105.floor, lock.attacker.facing);
}

function reactorTicket() {
  const progress = createXenoTrialsProgressV96();
  progress.unlocked.push('prowler');
  const ticket = beginXenoTrialsV96(progress, { playerId: 'prowler', opponentId: cultist, stageId: stageIds[0],
    difficulty: 'easy', activityV119: { branch: 'on-demand', id: 'on-demand', rules: { initialHp: 1 } } });
  assert.ok(ticket.applied);
  return ticket;
}

test('three exact boot pairings lift one shoe, keep the other supported and plant on the drawn target', () => {
  const pairs = [[cultist, commando, false, 'footNear'], [cultist, guardian, true, 'footNear'], [commando, cultist, true, 'footFar']];
  for (const [playerId, opponentId, corner, key] of pairs) {
    const match = fixedOpponentDuel({ playerId, opponentId, corner });
    const terminal = structuredClone(match);
    const finisher = createXenoTrialsFinisherV207(match, textures);
    assert.equal(finisher?.id, `${playerId}::fin1`);
    assert.equal(finisher?.kind, 'boot');
    const { lock } = finisher;
    const idle = renderedRig(lock, 0), lifted = renderedRig(lock, .5), planted = renderedRig(lock, 1);
    assert.equal(planted?.clip, 'boot-lock-v208');
    assert.equal(lock.contactKey, key);
    assert.equal(lock.target.x, lock.layout.rootX);
    assert.ok(lifted.contacts[key][1] < idle.contacts[key][1] - 5);
    const other = key === 'footNear' ? 'footFar' : 'footNear';
    for (const pose of [lifted, planted]) assert.ok(Math.hypot(...pose.contacts[other].map((n, index) => n - idle.contacts[other][index])) <= 1.5);
    assert.ok(Math.hypot(...planted.contacts[key].map((n, index) => n - lock.targetAnchor[index])) < 1e-6);
    assert.deepEqual(match, terminal);
  }
  assert.equal(createXenoTrialsFinisherV207(fixedOpponentDuel({ playerId: commando, opponentId: cultist }), textures), null, 'distant shoe');
  assert.equal(createXenoTrialsFinisherV207(fixedOpponentDuel({ playerId: guardian, opponentId: cultist, corner: true }), textures), null, 'unadmitted attacker');
});

test('both authorized stage circuits are already painted at their native anchors and respond only during measured claw contact', () => {
  for (const stageId of stageIds) {
    const fixtures = getXenoTrialsFinisherFixturesV208(stageId);
    const hazard = getXenoTrialsStageHazardV188(stageId);
    const idleCanvas = canvas();
    assert.equal(fixtures.length, 2);
    fixtures.forEach((fixture, i) => {
      assert.equal(fixture.source, hazard.id);
      assert.equal((fixture.left + fixture.right) / 2, hazard.anchors[i]);
      assert.equal(fixture.right - fixture.left, hazard.width);
    });
    assert.ok(drawXenoTrialsFinisherFixturesV208(idleCanvas, stageId, null).every(fixture => !fixture.active));
    assert.ok(idleCanvas.calls.some(([method, x]) => method === 'fillRect' && x === fixtures[0].left - 8));
    const match = fixedOpponentDuel({ stageId, destination: fixtures[0].left + 39 });
    const sequence = createXenoTrialsFinisherV207(match, textures);
    assert.equal(sequence?.id, 'prowler::fin2');
    const { lock } = sequence;
    const attack = activateXenoTrialsFinisherV207(sequence);
    assert.equal(lock.fixture, fixtures[0]);
    assert.equal(lock.targetAnchor, fixtures[0].pads[0]);
    assert.ok(lock.layout.contacts.hips[0] > lock.fixture.left && lock.layout.contacts.hips[0] < lock.fixture.right);
    assert.equal(lock.layout.rootX, match.fighters[1].x);
    const rest = getXenoTrialsFinisherViewV207(attack);
    const hold = getXenoTrialsFinisherViewV207(advanceXenoTrialsFinisherV207(attack, attack.timing.approachMs + 25));
    const skipped = getXenoTrialsFinisherViewV207(skipXenoTrialsFinisherV207(attack));
    assert.equal(rest.contact, false);
    assert.equal(hold.contact, true);
    assert.equal(skipped.contact, false);
    const paw = renderedRig(lock, hold.gain);
    assert.equal(paw?.clip, 'circuit-lock-v208');
    assert.ok(Math.hypot(...paw.contacts.handFar.map((n, i) => n - lock.targetAnchor[i])) <= 5);
    assert.deepEqual(drawXenoTrialsFinisherFixturesV208(canvas(), stageId, hold).map(fixture => fixture.active), [true, false]);
    assert.deepEqual(drawXenoTrialsFinisherFixturesV208(canvas(), stageId, skipped).map(fixture => fixture.active), [false, false]);
    assert.deepEqual(drawXenoTrialsFinisherFixturesV208(canvas(), 'containment-deck', hold), []);
  }
  const ordinary = fixedOpponentDuel({ stageId: 'xt179-reactor' });
  assert.equal(createXenoTrialsFinisherV207(ordinary, textures)?.id, 'prowler::fin1');
  assert.equal(createXenoTrialsFinisherV207(ordinary, textures, true), null);
  assert.equal(createXenoTrialsFinisherV207(ordinary, new Map()), null);
});

test('a real CPU duel can be won over a circuit, with voluntary control detached from the saved result', () => {
  const ticket = reactorTicket();
  const match = createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0 });
  let roundTick = 0, sawIntermediate = false;
  for (let tick = 0; tick < 1700 && match.phase !== 'match-over'; tick++) {
    const gap = getXenoTrialsBodyGapV105(...match.fighters);
    const input = roundTick < 6 ? { left: true } : roundTick < 156 && gap > 13 ? {} : playerInput(match, tick);
    roundTick++;
    stepXenoTrialsMatchV96(match, dt, input);
    if (match.phase === 'round-over') {
      sawIntermediate = true;
      assert.equal(createXenoTrialsFinisherV207(match, textures), null);
      nextXenoTrialsRoundV96(match);
      roundTick = 0;
    }
  }
  assert.ok(sawIntermediate);
  assert.equal(match.opponentInputSourceV163, 'cpu');
  const terminal = structuredClone(match);
  const offer = createXenoTrialsFinisherV207(match, textures);
  assert.equal(offer?.kind, 'circuit');
  assert.equal(offer.phase, 'offered');
  assert.equal(getXenoTrialsFinisherViewV207(offer), null);
  const transaction = settleXenoTrialsV96(ticket.state, match.result);
  assert.ok(transaction.applied);
  const playing = activateXenoTrialsFinisherV207(offer);
  const paused = pauseXenoTrialsFinisherV207(playing, true);
  assert.equal(advanceXenoTrialsFinisherV207(paused, 610), paused);
  assert.equal(activateXenoTrialsFinisherV207(playing), playing);
  const complete = advanceXenoTrialsFinisherV207(playing, playing.durationMs);
  assert.equal(complete.phase, 'complete');
  assert.equal(getXenoTrialsFinisherViewV207(complete).contact, false);
  assert.deepEqual(match, terminal);
  assert.equal(transaction.state.ledger.length, 1);
  assert.equal(settleXenoTrialsV96(transaction.state, match.result).applied, false);
});

test('the runtime paints the reactor from first load and F lights exactly one circuit after the saved verdict', async () => {
  const listeners = new Map(), frames = new Map();
  const context = canvas(false);
  const display = { tagName: 'CANVAS', width: 1000, height: 560, getContext: () => context, focus() {} };
  const host = { addEventListener: (type, handler) => listeners.set(type, handler), removeEventListener: type => listeners.delete(type) };
  const ticket = reactorTicket();
  let now = 0, serial = 0, verdicts = 0;
  let progress = ticket.state;
  const runtime = createXenoTrialsRuntimeV96({ canvas: display, window: host, document: { hidden: false, hasFocus: () => true },
    config: ticket.config,
    loadImage: async path => textures.get(path) || { complete: true, naturalWidth: 1024, naturalHeight: 1024 },
    requestAnimationFrame(callback) { frames.set(++serial, callback); return serial; },
    cancelAnimationFrame(id) { frames.delete(id); },
    onResult(result) {
      const settlement = settleXenoTrialsV96(progress, result);
      assert.ok(settlement.applied);
      progress = settlement.state;
      verdicts++;
    }
  });
  const frame = (ms = 1000 * dt) => {
    now += ms;
    for (const [id, callback] of [...frames]) if (frames.delete(id)) callback(now);
  };
  try {
    assert.equal(await runtime.start(), true);
    assert.deepEqual(runtime.getState().finisherFixturesV208.map(fixture => fixture.active), [false, false]);
    let round = 0, startTick = 0;
    for (let i = 0; i < 2200; i++) {
      const state = runtime.getState();
      if (state.phase === 'match-over') break;
      if (state.phase === 'active' && !state.presentation.blocksSimulation) {
        if (state.round !== round) { round = state.round; startTick = state.tick; }
        const roundTick = state.tick - startTick;
        const gap = getXenoTrialsBodyGapV105(...state.fighters);
        const input = roundTick < 6 ? { left: true } : roundTick < 156 && gap > 13 ? {} : playerInput(state, state.tick);
        for (const action of ['left', 'right', 'light']) runtime.setInput(action, Boolean(input[action]));
      }
      frame();
    }
    const offered = runtime.getState();
    assert.equal(offered.finisherV207?.id, 'prowler::fin2');
    assert.equal(offered.canActivateFinisherV207, true);
    assert.equal(verdicts, 1);
    listeners.get('keydown')({ code: 'KeyF', target: display, preventDefault() {} });
    for (let i = 0; i < 5; i++) frame(120);
    const hold = runtime.getState();
    assert.equal(hold.finisherV207.phase, 'playing');
    assert.deepEqual(hold.finisherFixturesV208.filter(fixture => fixture.active).map(fixture => fixture.id), [offered.finisherV207.fixtureId]);
    assert.ok(hold.rigViewsV154.some(rig => rig.finisherV207?.role === 'attacker' && rig.finisherV207.contact));
    assert.equal(runtime.skipSequence(), true);
    assert.ok(runtime.getState().finisherFixturesV208.every(fixture => !fixture.active));
    assert.deepEqual(runtime.getState().result, offered.result);
    assert.equal(verdicts, 1);
    assert.equal(progress.ledger.length, 1);
  } finally { runtime.stop(); }
});
