import assert from 'node:assert/strict';
import test from 'node:test';
import { XENO_TRIALS_CAPTURE_ATLASES_V163 } from '../src/xeno-trials-capture-data-v163.js';
import { XENO_TRIALS_RIGS_V154 } from '../src/xeno-trials-rig-v154.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { createXenoTrialsFinisherV207 } from '../src/xeno-trials-finishers-v207.js';
import { getXenoTrialsBodyBoundsV105 } from '../src/xeno-trials-geometry-v105.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';

const dt = 1 / 120;
const names = { cultist: 'dd-darwin-era-cultist', commando: 'import-game-dd-wy-commando', guardian: 'import-game-dd-guardian' };
const textures = new Map([...XENO_TRIALS_CAPTURE_ATLASES_V163, ...XENO_TRIALS_RIGS_V154].map(source =>
  [source.path, { complete: true, naturalWidth: source.sourceWidth, naturalHeight: source.sourceHeight }]));

function approach(fighters) {
  const [player, enemy] = fighters;
  const a = getXenoTrialsBodyBoundsV105(player), b = getXenoTrialsBodyBoundsV105(enemy);
  const forward = enemy.x >= player.x;
  return (forward ? b.left - a.right : a.left - b.right) > 6 && !player.attack ? forward ? 'right' : 'left' : null;
}

function directDuel(opponentId, corner = false, attack = 'light', roundsToWin = 1) {
  // Both fighters use public movement inputs. A 1 HP test rule shortens the
  // duel and the fixed opponent input isolates the chosen contact geometry.
  const match = createXenoTrialsMatchV96({ playerId: 'prowler', opponentId, introSeconds: 0,
    roundsToWin, rulesV119: { initialHp: 1 }, seed: 96 });
  if (corner) for (let tick = 0; tick < 1500; tick++) stepXenoTrialsMatchV96(match, dt, { right: true }, { right: true });
  for (let tick = 0; tick < 600 && match.phase === 'active'; tick++) {
    const direction = approach(match.fighters);
    stepXenoTrialsMatchV96(match, dt, direction ? { [direction]: true } : { [attack]: tick % 3 === 0 }, {});
  }
  return match;
}

test('Prowler may secure three measured floor targets only after a terminal, grounded, close KO', () => {
  for (const [name, fighter] of Object.entries(names)) {
    const match = directDuel(fighter, name !== 'cultist');
    assert.equal(match.result?.winner, 'player');
    const original = structuredClone(match);
    const offered = createXenoTrialsFinisherV207(match, textures);
    assert.equal(offered?.phase, 'offered', name);
    assert.ok(offered.lock.contactGap <= 8, name);
    assert.equal(offered.lock.layout.rootX, match.fighters[1].x);
    assert.equal(offered.lock.layout.contacts.floorSupport[1], 450);
    assert.deepEqual(match, original);
    assert.equal(createXenoTrialsFinisherV207(match, new Map()), null);
    assert.equal(createXenoTrialsFinisherV207(match, textures, true), null);
  }
  assert.equal(createXenoTrialsFinisherV207(directDuel(names.cultist, false, 'light', 2), textures), null, 'intermediate KO');
  assert.equal(createXenoTrialsFinisherV207(directDuel(names.cultist, false, 'heavy'), textures), null, 'out of reach');
  assert.equal(createXenoTrialsFinisherV207(directDuel('warrior'), textures), null, 'unadmitted anatomy');
});

function harness({ reducedMotion = false } = {}) {
  // The engine, terminal clock, result transaction, keyboard and Canvas
  // drawing entry points are real. RAF and decoded texture sizes are doubles.
  const profile = createXenoTrialsProgressV96();
  profile.unlocked.push('prowler');
  const ticket = beginXenoTrialsV96(profile, { playerId: 'prowler', opponentId: names.cultist, difficulty: 'easy',
    activityV119: { branch: 'on-demand', id: 'on-demand', rules: { initialHp: 1 } } });
  assert.ok(ticket.applied);
  let progress = ticket.state, verdicts = 0;
  const listeners = new Map();
  const host = {
    addEventListener(type, listener) { listeners.set(type, listener); },
    removeEventListener(type) { listeners.delete(type); }
  };
  const context = new Proxy({ globalAlpha: 1, measureText: text => ({ width: text.length * 8 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) },
  { get: (target, key) => target[key] ?? (() => {}) });
  const canvas = { tagName: 'CANVAS', width: 1000, height: 560, getContext: () => context, focus() {} };
  const frames = new Map();
  let time = 0, serial = 0;
  const runtime = createXenoTrialsRuntimeV96({ canvas, window: host, document: { hidden: false, hasFocus: () => true },
    config: ticket.config, reducedMotion,
    requestAnimationFrame(callback) { frames.set(++serial, callback); return serial; },
    cancelAnimationFrame(id) { frames.delete(id); },
    loadImage: async path => textures.get(path) || { complete: true, naturalWidth: 1024, naturalHeight: 1024 },
    onResult(result) {
      const settlement = settleXenoTrialsV96(progress, result);
      assert.ok(settlement.applied);
      progress = settlement.state;
      verdicts++;
    }
  });
  const frame = (delta = 1000 * dt) => {
    time += delta;
    for (const [id, callback] of [...frames]) if (frames.delete(id)) callback(time);
  };
  const key = (code, type = 'keydown', repeat = false) => listeners.get(type)?.({ code, target: canvas, repeat, preventDefault() {} });
  async function win() {
    assert.equal(await runtime.start(), true);
    let intermission = false, held = null;
    for (let frameIndex = 0; frameIndex < 1600; frameIndex++) {
      const state = runtime.getState();
      if (state.phase === 'match-over') {
        assert.ok(intermission);
        assert.equal(state.result.winner, 'player');
        return state;
      }
      if (state.phase === 'round-over') intermission = true;
      assert.equal(state.canActivateFinisherV207, false);
      const playing = state.phase === 'active' && !state.presentation.blocksSimulation;
      const direction = playing && approach(state.fighters);
      const wanted = direction ? direction === 'right' ? 'ArrowRight' : 'ArrowLeft' : null;
      if (wanted !== held) {
        if (held) key(held, 'keyup');
        if (wanted) key(wanted);
        held = wanted;
      }
      const attack = playing && !wanted && frameIndex % 3 === 0;
      if (attack) key('KeyJ');
      frame();
      if (attack) key('KeyJ', 'keyup');
    }
    assert.fail('Native CPU duel did not finish within the fixture budget');
  }
  return { runtime, key, frame, win, receipt: () => ({ progress, verdicts }) };
}

test('the opt-in controller renders actual contact, freezes on pause and settles exactly once', async () => {
  const fixture = harness();
  const { frame, key, runtime, receipt } = fixture;
  const result = await fixture.win();
  assert.equal(result.finisherV207?.phase, 'offered');
  assert.equal(result.canActivateFinisherV207, true);
  assert.equal(receipt().verdicts, 1);
  const ledger = structuredClone(receipt());
  key('KeyF', 'keydown', true);
  assert.equal(runtime.getState().finisherV207.phase, 'offered');
  key('KeyF');
  assert.equal(runtime.activateFinisher(), false);
  frame(100); frame(120); frame(200);
  const active = runtime.getState();
  assert.equal(active.finisherV207.phase, 'playing');
  const player = active.rigViewsV154.find(view => view.finisherV207?.role === 'attacker');
  const target = active.rigViewsV154.find(view => view.finisherV207?.role === 'target');
  assert.ok(player?.finisherV207.contact && target?.finisherV207.contact);
  assert.equal(target.visualRoot, result.fighters[1].x);
  const [x, y] = player.contacts.handFar, [anchorX, anchorY] = target.finisherV207.anchor;
  assert.ok(Math.hypot(x - anchorX, y - anchorY) <= 8);
  key('KeyP');
  frame(500);
  assert.deepEqual(runtime.getState().finisherV207, { ...active.finisherV207, paused: true });
  key('KeyP');
  assert.equal(runtime.skipSequence(), true);
  assert.equal(runtime.getState().finisherV207.phase, 'complete');
  assert.equal(runtime.getState().finisherV207.skipped, true);
  assert.deepEqual(runtime.getState().result, result.result);
  assert.deepEqual(runtime.getState().fighters, result.fighters);
  assert.deepEqual(receipt(), ledger);
  assert.equal(runtime.activateFinisher(), false);
  runtime.stop();
});

test('declining or using reduced motion keeps the single ordinary verdict', async () => {
  const normal = harness();
  assert.equal((await normal.win()).canActivateFinisherV207, true);
  for (let i = 0; i < 30; i++) normal.frame(200);
  assert.equal(normal.runtime.getState().finisherV207.phase, 'declined');
  assert.equal(normal.runtime.activateFinisher(), false);
  assert.equal(normal.receipt().verdicts, 1);
  normal.runtime.stop();

  const reduced = harness({ reducedMotion: true });
  assert.equal((await reduced.win()).finisherV207, null);
  assert.equal(reduced.runtime.activateFinisher(), false);
  assert.deepEqual(reduced.receipt(), normal.receipt());
  reduced.runtime.stop();
});

test('the optional hold ends on the same floor plate and releases the claw without restarting the outro', async () => {
  const fixture = harness();
  const result = await fixture.win();
  assert.equal(fixture.runtime.activateFinisher(), true);
  for (let i = 0; i < 12; i++) fixture.frame(120);
  const end = fixture.runtime.getState();
  assert.equal(end.finisherV207.phase, 'complete');
  assert.equal(end.finisherV207.skipped, false);
  assert.equal(end.exitV157, null);
  const player = end.rigViewsV154.find(view => view.finisherV207?.role === 'attacker');
  const target = end.rigViewsV154.find(view => view.finisherV207?.role === 'target');
  assert.equal(player?.finisherV207.contact, false);
  assert.equal(target?.visualRoot, result.fighters[1].x);
  assert.deepEqual(end.fighters, result.fighters);
  assert.equal(fixture.receipt().verdicts, 1);
  fixture.runtime.stop();
});
