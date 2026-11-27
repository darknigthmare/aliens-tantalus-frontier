import assert from 'node:assert/strict';
import test from 'node:test';
import { XENO_TRIALS_CAPTURE_ATLASES_V163 } from '../src/xeno-trials-capture-data-v163.js';
import { drawXenoTrialsFloorLockTargetV207, sampleXenoTrialsFloorLockV207 } from '../src/xeno-trials-capture-v163.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { activateXenoTrialsFinisherV207, advanceXenoTrialsFinisherV207, createXenoTrialsFinisherV207,
  getXenoTrialsFinisherViewV207, skipXenoTrialsFinisherV207 } from '../src/xeno-trials-finishers-v207.js';
import { drawXenoTrialsFinisherFixturesV210, getXenoTrialsFinisherFixturesV210 } from '../src/xeno-trials-finishers-v210.js';
import { getXenoTrialsBodyGapV105, XENO_TRIALS_ARENA_V105 } from '../src/xeno-trials-geometry-v105.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { drawXenoTrialsRigV154, XENO_TRIALS_RIGS_V154, XENO_TRIALS_ARTICULATED_RIGS_V197, XENO_TRIALS_ARTICULATED_RIGS_V199,
  XENO_TRIALS_ARTICULATED_RIGS_V201, XENO_TRIALS_DEFENSE_RIGS_V203, XENO_TRIALS_DEFENSE_RIGS_V204 } from '../src/xeno-trials-rig-v154.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { XENO_TRIALS_SPRITE_ATLASES_V189 } from '../src/xeno-trials-sprite-atlas-v189.js';
import { getXenoTrialsStageHazardV188 } from '../src/xeno-trials-stage-hazards-v188.js';

const cultist = 'dd-darwin-era-cultist', ravager = 'ravager', crusher = 'crusher-acm';
const dock = 'xt179-ship-docking', quarantine = 'xt179-quarantine', dt = 1 / 120, floor = XENO_TRIALS_ARENA_V105.floor;
const decoded = (width, height) => ({ complete: true, naturalWidth: width, naturalHeight: height });
const textures = new Map([...XENO_TRIALS_CAPTURE_ATLASES_V163, ...XENO_TRIALS_RIGS_V154,
  ...XENO_TRIALS_ARTICULATED_RIGS_V197, ...XENO_TRIALS_ARTICULATED_RIGS_V199, ...XENO_TRIALS_ARTICULATED_RIGS_V201,
  ...XENO_TRIALS_DEFENSE_RIGS_V203, ...XENO_TRIALS_DEFENSE_RIGS_V204].map(source => [source.path, decoded(source.sourceWidth, source.sourceHeight)]));
for (const { texture } of XENO_TRIALS_SPRITE_ATLASES_V189) textures.set(texture.path, decoded(texture.width, texture.height));
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function playerInput(match, tick) {
  const [player, opponent] = match.fighters;
  const direction = player.x < opponent.x ? 1 : -1;
  if (getXenoTrialsBodyGapV105(player, opponent, direction) > 6 && !player.attack)
    return direction > 0 ? { right: true } : { left: true };
  return { light: tick % 3 === 0 };
}

function duel({ playerId, opponentId = cultist, corner = false, stageId, destination = null }) {
  // The same input pipeline supplies the two fighters; the one-hit configuration
  // shortens each native encounter to its terminal contact.
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

function drawnPose(lock, gain = 1) {
  return drawXenoTrialsRigV154(canvas(), lock.rig, textures.get(lock.rig.path), sampleXenoTrialsFloorLockV207(lock, gain),
    lock.attackerMetrics, lock.attacker.x, floor, lock.attacker.facing);
}

test('17 native caste pairings use the actual prone atlas, facing and roots of Ravager or Crusher', () => {
  const pairs = [
    ['prowler', ravager], ['user-skeletal-quadruped', ravager], ['albino-runner', ravager], ['cryo-burster', ravager],
    ['combat-synth', ravager], ['albino-combat-synth', ravager], ['import-synth-eloise', ravager],
    ['user-rhino', crusher], ['user-bulbous-quadruped', crusher], ['user-spiker', crusher], ['user-spiker', ravager, true],
    ['armored-red', ravager], ['armored-red', crusher, true], ['armored-joe', ravager], ['albino-crusher', crusher],
    ['import-game-afe2-exploder', ravager], ['afe2-huntsman', ravager]
  ];
  for (const [playerId, opponentId, corner] of pairs) {
    const match = duel({ playerId, opponentId, corner });
    const snapshot = structuredClone(match);
    const offer = createXenoTrialsFinisherV207(match, textures);
    assert.equal(offer?.id, playerId + '::fin1', playerId + '/' + opponentId);
    const { lock } = offer, image = textures.get(lock.atlas.path), ctx = canvas(true);
    const target = drawXenoTrialsFloorLockTargetV207(ctx, image, lock, 1);
    const atlas = XENO_TRIALS_SPRITE_ATLASES_V189.find(source => source.fighterId === opponentId && source.kind === 'combat');
    assert.equal(target.groundPlate, true);
    assert.equal(target.sourcePath, atlas.texture.path);
    assert.equal(target.sourceSha256, atlas.texture.sha256);
    assert.equal(target.frameId, 'ko-ground');
    assert.equal(target.facing, match.fighters[1].facing);
    assert.equal(target.visualRoot, match.fighters[1].x);
    assert.equal(target.floor, floor);
    assert.ok(ctx.calls.some(([operation, drawn, ...coordinates]) => operation === 'drawImage' && drawn === image
      && coordinates.length === 8 && coordinates.slice(0, 4).every((value, index) => value === lock.layout.frame.rect[index])));
    const rest = drawnPose(lock, 0), contact = drawnPose(lock);
    assert.ok(distance(contact.contacts[lock.contactKey], lock.targetAnchor) <= (offer.kind === 'claw' ? 8 : 1e-6));
    for (const key of lock.supportKeys || []) assert.ok(distance(contact.contacts[key], rest.contacts[key]) <= 1.5);
    assert.deepEqual(match, snapshot);
    const incompatible = new Map(textures).set(lock.atlas.path, decoded(image.naturalWidth + 1, image.naturalHeight));
    assert.equal(createXenoTrialsFinisherV207(match, incompatible), null);
    assert.equal(createXenoTrialsFinisherV207(match, textures, true), null);
  }
  assert.equal(createXenoTrialsFinisherV207(duel({ playerId: 'prowler', opponentId: crusher }), textures), null);
});

test('six native environmental pairings select the matching quay or quarantine actuator after the KO', () => {
  const cases = [[dock, 'shutter', [['combat-synth', 49], ['albino-combat-synth', 43], ['import-synth-eloise', 46]]],
    [quarantine, 'drain', [['albino-runner', 43], ['cryo-burster', 49], ['user-skeletal-quadruped', 46]]]];
  for (const [stageId, kind, actors] of cases) {
    const source = getXenoTrialsStageHazardV188(stageId), fixtures = getXenoTrialsFinisherFixturesV210(stageId);
    assert.equal(fixtures.length, 2);
    const fromSetup = drawXenoTrialsFinisherFixturesV210(canvas(), stageId, null);
    assert.deepEqual(fromSetup.map(item => item.active), [false, false]);
    for (const [index, fixture] of fixtures.entries()) {
      assert.equal(fixture.source, source.id);
      assert.equal((fixture.left + fixture.right) / 2, source.anchors[index]);
      assert.equal(fixture.right - fixture.left, source.width);
    }
    for (const [playerId, offset] of actors) {
      const fixture = fixtures.find(item => item.x > 700);
      const match = duel({ playerId, stageId, destination: fixture.left + offset });
      const offer = createXenoTrialsFinisherV207(match, textures);
      assert.equal(offer?.id, playerId + '::fin2', playerId);
      assert.equal(offer.kind, kind);
      assert.equal(offer.lock.fixture.id, fixture.id);
      const playing = activateXenoTrialsFinisherV207(offer);
      const contact = getXenoTrialsFinisherViewV207(advanceXenoTrialsFinisherV207(playing, playing.timing.approachMs + 30));
      assert.ok(contact.contact);
      assert.ok(distance(drawnPose(offer.lock).contacts[offer.lock.contactKey], fixture.pads[0]) <= 5);
      assert.deepEqual(drawXenoTrialsFinisherFixturesV210(canvas(), stageId, contact).filter(item => item.active).map(item => item.id), [fixture.id]);
      const skipped = getXenoTrialsFinisherViewV207(skipXenoTrialsFinisherV207(playing));
      assert.ok(drawXenoTrialsFinisherFixturesV210(canvas(), stageId, skipped).every(item => !item.active));
      assert.equal(createXenoTrialsFinisherV207({ ...match, result: { ...match.result, playerId: 'prowler' } }, textures), null);
    }
    assert.equal(createXenoTrialsFinisherV207(duel({ playerId: 'prowler', stageId }), textures)?.kind, 'claw');
  }
});

async function runRuntime({ playerId, opponentId, stageId, wait, kind, alternate = false }) {
  const profile = createXenoTrialsProgressV96();
  profile.unlocked.push(playerId);
  const ticket = beginXenoTrialsV96(profile, { playerId, opponentId, stageId, difficulty: 'easy',
    activityV119: { branch: 'on-demand', id: 'on-demand', rules: { initialHp: 1 } } });
  assert.ok(ticket.applied);
  // Real runtime, keyboard handlers, native CPU and result transaction. The
  // DOM, animation scheduler, decoded images and Canvas are test doubles.
  const windowEvents = new Map(), documentEvents = new Map(), frames = new Map(), context = canvas();
  const eventTarget = events => ({ addEventListener: (type, handler) => events.set(type, handler), removeEventListener: type => events.delete(type) });
  const display = { tagName: 'CANVAS', width: 1000, height: 560, getContext: () => context, focus() {} };
  const document = { ...eventTarget(documentEvents), hidden: false, hasFocus: () => true };
  let progress = ticket.state, now = 0, serial = 0, verdicts = 0;
  const runtime = createXenoTrialsRuntimeV96({ canvas: display, window: eventTarget(windowEvents), document, config: ticket.config,
    loadImage: async path => textures.get(path) || decoded(1024, 1024),
    requestAnimationFrame(callback) { frames.set(++serial, callback); return serial; },
    cancelAnimationFrame(id) { frames.delete(id); },
    onResult(result) {
      const settled = settleXenoTrialsV96(progress, result);
      assert.ok(settled.applied);
      progress = settled.state;
      verdicts++;
    }
  });
  const frame = (ms = 1000 * dt) => {
    now += ms;
    for (const [id, callback] of [...frames]) if (frames.delete(id)) callback(now);
  };
  const focus = name => {
    const target = { closest: selector => selector.split(', ').includes('[data-xt="' + name + '"]') ? target : null };
    documentEvents.get('focusin')({ target });
  };
  try {
    assert.equal(await runtime.start(), true);
    assert.ok(runtime.getState().finisherFixturesV208.every(fixture => !fixture.active));
    let round = 0, startTick = 0;
    for (let step = 0; step < 3200; step++) {
      const state = runtime.getState();
      if (state.phase === 'match-over') break;
      if (state.phase === 'active' && !state.presentation.blocksSimulation) {
        if (state.round !== round) { round = state.round; startTick = state.tick; }
        const roundTick = state.tick - startTick;
        const gap = getXenoTrialsBodyGapV105(...state.fighters);
        const input = roundTick < 18 ? { left: true } : roundTick < wait && gap > 13 ? {} : playerInput(state, state.tick);
        for (const action of ['left', 'right', 'light']) runtime.setInput(action, Boolean(input[action]));
      }
      frame();
    }
    const offered = runtime.getState();
    assert.equal(offered.finisherV207?.kind, kind, stageId + ' ' + JSON.stringify(offered.result));
    assert.equal(offered.canActivateFinisherV207, true);
    assert.equal(verdicts, 1);
    focus('finisher');
    assert.equal(runtime.getState().paused, false);
    if (alternate) {
      assert.deepEqual(offered.finisherV207.alternatives, [{ id: playerId + '::fin1', kind: 'boot' }]);
      focus('outside-combat');
      assert.equal(runtime.getState().paused, true);
      assert.equal(runtime.resume(), true);
      focus('finisher-alternative');
      assert.equal(runtime.getState().paused, false);
      assert.equal(runtime.activateFinisher(offered.finisherV207.alternatives[0].id), true);
    } else windowEvents.get('keydown')({ code: 'KeyF', target: display, preventDefault() {} });
    for (let i = 0; i < 5; i++) frame(120);
    const hold = runtime.getState();
    assert.equal(hold.finisherV207.phase, 'playing');
    assert.equal(hold.finisherV207.kind, alternate ? 'boot' : kind);
    assert.ok(hold.rigViewsV154.some(row => row.finisherV207?.role === 'attacker' && row.finisherV207.contact));
    if (kind === 'claw') assert.ok(hold.rigViewsV154.some(row => row.finisherV207?.role === 'target' && row.groundPlate && row.frameId === 'ko-ground'));
    assert.deepEqual(hold.finisherFixturesV208.filter(fixture => fixture.active).map(fixture => fixture.id),
      !alternate && kind === 'shutter' ? [offered.finisherV207.fixtureId] : []);
    assert.equal(runtime.skipSequence(), true);
    assert.ok(runtime.getState().finisherFixturesV208.every(fixture => !fixture.active));
    assert.deepEqual(runtime.getState().result, offered.result);
    assert.equal(verdicts, 1);
    assert.equal(progress.ledger.length, 1);
  } finally { runtime.stop(); }
}

test('CPU duels exercise a newly supported prone target and both offered dock actions without a second verdict', async () => {
  await runRuntime({ playerId: 'prowler', opponentId: ravager, stageId: 'containment-deck', wait: 48, kind: 'claw' });
  await runRuntime({ playerId: 'albino-combat-synth', opponentId: cultist, stageId: dock, wait: 150, kind: 'shutter' });
  await runRuntime({ playerId: 'albino-combat-synth', opponentId: cultist, stageId: dock, wait: 150, kind: 'shutter', alternate: true });
});
