import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import { activateXenoTrialsFinisherV207, advanceXenoTrialsFinisherV207, createXenoTrialsFinisherV207,
  getXenoTrialsFinisherViewV207, pauseXenoTrialsFinisherV207, skipXenoTrialsFinisherV207 } from '../src/xeno-trials-finishers-v207.js';
import { drawXenoTrialsNeutralFinisherV211 } from '../src/xeno-trials-finishers-v211.js';
import { XENO_TRIALS_FIGHTERS_V96, getXenoTrialsFighterV96, getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsRuntimeArticulatedRig, getXenoTrialsRuntimeDefenseRig } from '../src/xeno-trials-rig-v154.js';
import { XENO_TRIALS_SPRITE_ATLASES_V188 } from '../src/xeno-trials-sprite-atlas-v188.js';
import { XENO_TRIALS_SPRITE_ATLASES_V189 } from '../src/xeno-trials-sprite-atlas-v189.js';
import { XENO_TRIALS_SPRITE_ATLASES_V191 } from '../src/xeno-trials-sprite-atlas-v191.js';
import { XENO_TRIALS_STAGE_EVENT_PROFILES_V211 } from '../src/xeno-trials-stage-events-v211.js';

const dt = 1 / 120;
const contactPairs = [
  ['synth-sniper', 'user-brute', true], ['synth-sniper', 'prowler', true],
  ['synth-heavy', 'ravager', true], ['import-joe-classic', 'user-brute', true], ['import-joe-classic', 'prowler', true],
  ['import-joe-tactical', 'ravager'], ['import-engineer-armorsuit', 'crusher-acm'],
  ['import-engineer-spacejokey', 'ravager'], ['import-engineer-woman', 'crusher-acm'],
  ['import-synth-jerri-1', 'crusher-acm'], ['synth-enforcer', 'ravager', true],
  ['xenoborg', 'crusher-acm', true], ['xenoborg', 'ravager'], ['stalker-arcade', 'crusher-acm', true], ['stalker-arcade', 'ravager'],
  ['user-black-fin', 'ravager'], ['grid', 'crusher-acm'], ['grid', 'ravager', true],
  ['royal-guard', 'crusher-acm', true], ['royal-guard', 'ravager'], ['albino-six', 'crusher-acm'],
  ['acid-combat-synth', 'ravager'], ['cryo-combat-synth', 'ravager']
];

function duel(playerId, opponentId, { corner = false, stageId = 'containment-deck', roundsToWin = 1 } = {}) {
  const match = createXenoTrialsMatchV96({ playerId, opponentId, stageId, seed: 96, introSeconds: 0,
    roundsToWin, rulesV119: { initialHp: 1, noSpecial: true } });
  if (corner) for (let tick = 0; tick < 1900; tick++) stepXenoTrialsMatchV96(match, dt, { right: true }, { right: true });
  for (let tick = 0; tick < 1800 && match.phase === 'active'; tick++) {
    const [attacker, target] = match.fighters;
    const direction = Math.sign(target.x - attacker.x) || 1;
    const input = getXenoTrialsBodyGapV105(attacker, target, direction) > 6 && !attacker.attack
      ? { [direction > 0 ? 'right' : 'left']: true } : { light: tick % 3 === 0 };
    stepXenoTrialsMatchV96(match, dt, input, {});
  }
  assert.equal(match.roundWinner, 'player', `${playerId}/${opponentId}`);
  return match;
}

function canvas() {
  const calls = [];
  return new Proxy({ calls, globalAlpha: 1 }, {
    get: (object, key) => object[key] ?? ((...args) => calls.push([key, ...args]))
  });
}

test('V211 enables 23 new mesh-measured contact pairings without replacing original finishers', () => {
  const decoded = (width, height) => ({ complete: true, naturalWidth: width, naturalHeight: height });
  const textures = new Map([...XENO_TRIALS_SPRITE_ATLASES_V188, ...XENO_TRIALS_SPRITE_ATLASES_V189,
    ...XENO_TRIALS_SPRITE_ATLASES_V191].map(({ texture }) => [texture.path, decoded(texture.width, texture.height)]));
  for (const [playerId, targetId, corner] of contactPairs) {
    const actor = getXenoTrialsFighterV96(playerId), art = getXenoTrialsArtV96(playerId);
    const rig = getXenoTrialsRuntimeArticulatedRig(actor, art) || getXenoTrialsRuntimeDefenseRig(actor, art);
    textures.set(rig.path, decoded(rig.sourceWidth, rig.sourceHeight));
    const match = duel(playerId, targetId, { corner });
    const original = createXenoTrialsFinisherV207(match, textures);
    assert.equal(original?.id.endsWith('::fin1') || false, false, `${playerId}/${targetId}`);
    const finisher = createXenoTrialsFinisherV207(match, textures, false, true);
    assert.equal(finisher.id, `${playerId}::fin1`);
    assert.equal(finisher.lock.revision, 211);
    assert.equal(finisher.lock.layout.frame.id, 'ko-ground');
    assert.equal(finisher.lock.target, match.fighters[1]);
    assert.ok(finisher.lock.contactGap <= 8);

    const withoutPlate = new Map(textures);
    withoutPlate.delete(finisher.lock.atlas.path);
    const fallback = createXenoTrialsFinisherV207(match, withoutPlate, false, true);
    assert.equal(fallback.kind, 'seal');
    assert.equal(fallback.lock.target, match.fighters[1]);
  }
});

test('an ordinary eligible terminal KO admits the neutralizing control for every historic identity', () => {
  // Use the native match loop for each verdict. Instance roots, time, result and HP are earned.
  for (const { id } of XENO_TRIALS_FIGHTERS_V96) {
    const match = duel(id, id === 'warrior' ? 'runner' : 'warrior');
    const result = structuredClone(match.result);
    const offer = createXenoTrialsFinisherV207(match, new Map(), false, true);
    assert.equal(offer.id, `${id}::fin1`);
    assert.equal(offer.kind, 'seal');
    const running = activateXenoTrialsFinisherV207(offer);
    assert.equal(advanceXenoTrialsFinisherV207(running, running.durationMs).phase, 'complete');
    assert.deepEqual(match.result, result);
  }
});

test('floor devices are visible before a KO, then engage only the eligible lane without contact or another settlement', () => {
  for (const { stageId } of XENO_TRIALS_STAGE_EVENT_PROFILES_V211) {
    const match = duel('synth-heavy', 'warrior', { stageId });
    const before = structuredClone(match);
    const offer = createXenoTrialsFinisherV207(match, new Map(), false, true);
    const idle = canvas();
    assert.equal(drawXenoTrialsNeutralFinisherV211(idle, stageId, null, false), null);
    assert.equal(idle.calls.filter(([kind]) => kind === 'fillRect').length, 8);
    const running = activateXenoTrialsFinisherV207(offer, 'synth-heavy::fin2');
    const held = advanceXenoTrialsFinisherV207(running, running.timing.approachMs + 1);
    assert.equal(held.kind, 'isolation', stageId);
    const effect = drawXenoTrialsNeutralFinisherV211(canvas(), stageId, getXenoTrialsFinisherViewV207(held), false);
    assert.equal(effect.targetX, match.fighters[1].x);
    assert.equal(effect.contact, true);
    assert.match(effect.fixtureId, new RegExp(`^${stageId}-mire-isolation-`));
    const paused = pauseXenoTrialsFinisherV207(held, true);
    assert.equal(advanceXenoTrialsFinisherV207(paused, 100), paused);
    const skipped = skipXenoTrialsFinisherV207(held);
    assert.equal(drawXenoTrialsNeutralFinisherV211(canvas(), stageId, getXenoTrialsFinisherViewV207(skipped), false), null);
    assert.equal(createXenoTrialsFinisherV207(match, new Map(), true, true), null);
    assert.equal(createXenoTrialsFinisherV207({ ...match, tick: match.tick + 1 }, new Map(), false, true), null);
    assert.deepEqual(match, before);
  }
  const corner = duel('synth-heavy', 'warrior', { corner: true });
  assert.deepEqual(createXenoTrialsFinisherV207(corner, new Map(), false, true).alternatives, []);
  const first = duel('synth-heavy', 'warrior', { roundsToWin: 2 });
  assert.equal(createXenoTrialsFinisherV207(first, new Map(), false, true), null);
});
