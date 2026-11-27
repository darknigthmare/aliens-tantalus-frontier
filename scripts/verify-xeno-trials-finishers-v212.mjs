import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsRenderMetricsV110 } from '../src/xeno-trials-scale-v110.js';
import { activateXenoTrialsFinisherV207, advanceXenoTrialsFinisherV207, createXenoTrialsFinisherV207,
  getXenoTrialsFinisherViewV207, pauseXenoTrialsFinisherV207, skipXenoTrialsFinisherV207 } from '../src/xeno-trials-finishers-v207.js';
import { drawXenoTrialsNeutralFinisherV211 } from '../src/xeno-trials-finishers-v211.js';
import { drawXenoTrialsIsolationApproachV212 } from '../src/xeno-trials-finishers-v212.js';
import { XENO_TRIALS_SPRITE_ATLASES_V188 } from '../src/xeno-trials-sprite-atlas-v188.js';
import { XENO_TRIALS_SPRITE_ATLASES_V189 } from '../src/xeno-trials-sprite-atlas-v189.js';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsRigV154, getXenoTrialsRuntimeArticulatedRig, getXenoTrialsRuntimeDefenseRig } from '../src/xeno-trials-rig-v154.js';
import { drawXenoTrialsFloorLockTargetV207 } from '../src/xeno-trials-capture-v163.js';

const dt = 1 / 120;
const stageId = 'tantalus-bridge';
const textures = new Map(XENO_TRIALS_SPRITE_ATLASES_V188.map(({ texture }) =>
  [texture.path, { complete: true, naturalWidth: texture.width, naturalHeight: texture.height }]));

function finish({ stage = stageId, distance = 125, roundsToWin = 1, playerId = 'warrior', opponentId = 'defender',
  action = 'special', corner = false } = {}) {
  const match = createXenoTrialsMatchV96({ playerId, opponentId, stageId: stage,
    roundsToWin, seed: 96, introSeconds: 0, rulesV119: { initialHp: 1, noSpecial: action !== 'special' } });
  if (corner) for (let tick = 0; tick < 1900; tick++) stepXenoTrialsMatchV96(match, dt, { right: true }, { right: true });
  for (let frame = 0; frame < 1800 && match.phase === 'active'; frame++) {
    const [player, opponent] = match.fighters;
    const direction = opponent.x > player.x ? 1 : -1;
    const approach = getXenoTrialsBodyGapV105(player, opponent, direction) > distance && !player.attack;
    stepXenoTrialsMatchV96(match, dt, approach ? { [direction === 1 ? 'right' : 'left']: true } : { [action]: frame % 3 === 0 }, {});
  }
  assert.equal(match.roundWinner, 'player');
  return match;
}

function makeContext() {
  const calls = [];
  return new Proxy({ calls, globalAlpha: 1 }, {
    get: (object, key) => object[key] ?? ((...args) => calls.push([key, ...args]))
  });
}

test('V212 walks to a real beacon after a native victory, locks the sector at range and walks back', () => {
  const match = finish();
  const [player, target] = match.fighters;
  const before = structuredClone(match);
  const offer = createXenoTrialsFinisherV207(match, textures, false, true);
  assert.equal(offer.kind, 'seal');
  assert.deepEqual(offer.alternatives.map(choice => choice.kind), ['isolation-approach']);
  const active = activateXenoTrialsFinisherV207(offer, 'warrior::fin2');
  const metrics = getXenoTrialsRenderMetricsV110(player.id, player.variant);
  const sample = sequence => {
    const view = getXenoTrialsFinisherViewV207(sequence), context = makeContext();
    return { view, drawn: drawXenoTrialsIsolationApproachV212(context, player, view, metrics, textures),
      field: drawXenoTrialsNeutralFinisherV211(context, stageId, view, false), calls: context.calls };
  };
  const moving = advanceXenoTrialsFinisherV207(active, active.timing.approachMs / 2);
  const first = sample(moving);
  assert.ok(first.drawn.isolationApproachV212.x > player.x);
  assert.ok(first.drawn.isolationApproachV212.x < first.drawn.isolationApproachV212.destination);
  assert.match(first.drawn.spriteAtlasV188.frameId, /^walk-/);
  assert.ok(first.calls.some(([method, ...args]) => method === 'drawImage' && args.length === 9));
  assert.ok(first.calls.some(([method, ...args]) => method === 'ellipse' && args.length === 7));
  assert.equal(first.field, null);
  assert.equal(drawXenoTrialsIsolationApproachV212(makeContext(), target, first.view, metrics, textures), null);
  const paused = pauseXenoTrialsFinisherV207(moving, true);
  assert.deepEqual(sample(advanceXenoTrialsFinisherV207(paused, 400)).drawn, first.drawn);

  const engaged = sample(advanceXenoTrialsFinisherV207(active, active.timing.approachMs + 50));
  const step = engaged.drawn.isolationApproachV212;
  assert.equal(step.x, step.destination);
  assert.ok(step.x - player.x <= 64);
  assert.equal(step.stationary, true);
  assert.equal(engaged.field.fixtureId, step.fixtureId);
  assert.equal(engaged.field.targetX, target.x);
  assert.equal(engaged.field.contact, true);
  const returning = sample(advanceXenoTrialsFinisherV207(active, active.durationMs - active.timing.retreatMs / 2));
  assert.ok(returning.drawn.isolationApproachV212.x > player.x && returning.drawn.isolationApproachV212.x < step.x);
  assert.equal(returning.field, null);
  assert.equal(sample(advanceXenoTrialsFinisherV207(active, active.durationMs)).drawn, null);
  assert.equal(sample(skipXenoTrialsFinisherV207(active)).field, null);
  assert.deepEqual(match, before);
});

test('V212 cannot approach an unrelated beacon or walk with a missing exact atlas', () => {
  const nearby = finish({ distance: 80 });
  const justOutside = finish();
  const noBeacon = finish({ stage: 'xt179-hangar' });
  assert.deepEqual(createXenoTrialsFinisherV207(nearby, textures, false, true).alternatives.map(c => c.kind), ['isolation']);
  assert.deepEqual(createXenoTrialsFinisherV207(noBeacon, textures, false, true).alternatives, []);
  assert.deepEqual(createXenoTrialsFinisherV207(justOutside, new Map(), false, true).alternatives, []);
  assert.equal(createXenoTrialsFinisherV207(justOutside, textures, true, true), null);
  assert.equal(createXenoTrialsFinisherV207(finish({ roundsToWin: 2 }), textures, false, true), null);
});

const contactCases = [
  ['warrior', 'ravager', 34],
  ['warrior', 'crusher-acm', 18],
  ['synth-sniper', 'ravager', 18],
  ['synth-sniper', 'crusher-acm', 48],
  ['synth-heavy', 'crusher-acm', 18],
  ['import-joe-classic', 'ravager', 18],
  ['import-joe-classic', 'crusher-acm', 48],
  ['import-joe-tactical', 'crusher-acm', 48],
  ['import-engineer-armorsuit', 'ravager', 18],
  ['import-engineer-spacejokey', 'crusher-acm', 48],
  ['import-engineer-woman', 'ravager', 18],
  ['import-synth-jerri-1', 'ravager', 18],
  ['synth-enforcer', 'crusher-acm', 18],
  ['cryo-lurker', 'ravager', 18],
  ['cryo-lurker', 'crusher-acm', 48],
  ['cryo-reef-stalker', 'ravager', 18],
  ['user-black-fin', 'crusher-acm', 48],
  ['albino-six', 'ravager', 18],
  ['acid-combat-synth', 'crusher-acm', 48],
  ['cryo-combat-synth', 'crusher-acm', 34],
  ['synth-containment', 'ravager', 6],
  ['synth-containment', 'crusher-acm', 34],
  ['predalien', 'ravager', 18],
  ['predalien', 'crusher-acm', 6],
  ['user-red-horned', 'ravager', 6],
  ['user-red-horned', 'crusher-acm', 34],
  ['user-unclassified-multiarm', 'ravager', 6],
  ['user-unclassified-multiarm', 'crusher-acm', 48],
  ['armored-foundry-crusher', 'ravager', 6],
  ['armored-foundry-crusher', 'crusher-acm', 34],
  ['synth-peacekeeper', 'ravager', 34],
  ['synth-peacekeeper', 'crusher-acm', 6],
  ['armored-caravan-stalker', 'ravager', 6],
  ['armored-caravan-stalker', 'crusher-acm', 48],
  ['cryo-ripper', 'ravager', 6],
  ['cryo-ripper', 'crusher-acm', 6],
  ['user-renaissance', 'ravager', 6],
  ['user-renaissance', 'crusher-acm', 48],
  ['user-green-dome', 'ravager', 6, true],
  ['import-xeno-gorillaxeno', 'ravager', 18],
  ['import-xeno-gorillaxeno', 'crusher-acm', 48],
  ['afe2-engineer-hybrid', 'ravager', 6],
  ['afe2-engineer-hybrid', 'crusher-acm', 48]
];

test('43 newly measured contacts retain the native prone scale and exact roots of both fighters', () => {
  const images = new Map([...textures, ...XENO_TRIALS_SPRITE_ATLASES_V189.map(({ texture }) =>
    [texture.path, { complete: true, naturalWidth: texture.width, naturalHeight: texture.height }])]);
  for (const [playerId, opponentId, distance, corner] of contactCases) {
    const definition = getXenoTrialsFighterV96(playerId), art = getXenoTrialsArtV96(playerId);
    const rig = getXenoTrialsRuntimeArticulatedRig(definition, art) || getXenoTrialsRuntimeDefenseRig(definition, art)
      || getXenoTrialsRigV154(definition, art);
    images.set(rig.path, { complete: true, naturalWidth: rig.sourceWidth, naturalHeight: rig.sourceHeight });
    const match = finish({ playerId, opponentId, distance, corner, action: 'light' });
    const [attacker, target] = match.fighters;
    const offer = createXenoTrialsFinisherV207(match, images, false, true);
    assert.equal(offer.lock.revision, 212, `${playerId}/${opponentId}`);
    assert.equal(offer.lock.attacker, attacker);
    assert.equal(offer.lock.target, target);
    assert.equal(offer.lock.layout.rootX, target.x);
    assert.ok(offer.lock.contactGap < 8);
    const context = makeContext();
    const receipt = drawXenoTrialsFloorLockTargetV207(context, images.get(offer.lock.atlas.path), offer.lock, 1);
    assert.equal(receipt.visualRoot, target.x);
    assert.equal(receipt.frameId, 'ko-ground');
    assert.ok(context.calls.some(([method, ...args]) => method === 'drawImage' && args.length === 9));
  }
});
