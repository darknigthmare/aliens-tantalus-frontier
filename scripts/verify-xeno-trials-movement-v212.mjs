import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, restoreXenoTrialsHordeMatchV180,
  setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105 as body } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsHurtBoundsV207 as hurt, hasXenoTrialsGroundTraversalV208 } from '../src/xeno-trials-moveset-v207.js';
import { hasXenoTrialsGroundTurnV210, XENO_TRIALS_TURN_TICKS_V210 } from '../src/xeno-trials-movement-v210.js';
import { getXenoTrialsAirHitV211, getXenoTrialsGroundRecoveryV211, XENO_TRIALS_GET_UP_V211 } from '../src/xeno-trials-defense-v211.js';
import { getXenoTrialsActiveActionAtlas, sampleXenoTrialsActionFrameV199, XENO_TRIALS_RUNTIME_ACTION_ATLASES } from '../src/xeno-trials-action-atlas-v199.js';
import { getXenoTrialsSpriteAtlasV188, sampleXenoTrialsSpriteAtlasV188 } from '../src/xeno-trials-sprite-atlas-v188.js';
import { getXenoTrialsSpriteAtlasV189, sampleXenoTrialsSpriteAtlasV189 } from '../src/xeno-trials-sprite-atlas-v189.js';
import { getXenoTrialsRuntimeSpriteAtlas, sampleXenoTrialsSpriteAtlasV191 } from '../src/xeno-trials-sprite-atlas-v191.js';
import { createXenoTrialsHordeCheckpointV186 } from '../src/xeno-trials-horde-checkpoint-v186.js';
import { XENO_TRIALS_HORDE_LIMITS_V180 } from '../src/xeno-trials-horde-v180.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';

const airIds = ['warrior', 'runner', 'prowler', 'queen', 'import-game-afe2-warden', 'ravager', 'chrysalis', 'razor-claws', 'synth-containment', 'smasher'];
const beforeV212 = ['warrior', 'runner', 'prowler', 'spitter'];
const groundIds = [...beforeV212, 'queen', 'crusher-acm', 'ravager', 'burster', 'defender', 'chrysalis', 'smasher',
  'user-brute', 'synth-trooper', 'synth-guard', 'import-game-afe2-warden'];
const pivots = ['queen', 'crusher-acm', 'ravager', 'defender', 'chrysalis', 'smasher'];
const step = (match, controls = {}, opponent = {}) => stepXenoTrialsMatchV96(match, dt, controls, opponent);
function advance(match, count, controls = {}, opponent = {}) {
  for (let tick = 0; tick < count; tick++) step(match, controls, opponent);
}
function fight(playerId, opponentId = 'runner', config = {}) {
  const match = createXenoTrialsMatchV96({ playerId, opponentId, ...config, introSeconds: 0, holdRoundTransition: true });
  const [player, target] = match.fighters;
  target.x += body(player).right + 12 - body(target).left;
  for (const other of match.fighters.slice(2)) other.x = -650;
  return match;
}
function breakGuard(match) {
  const [player] = match.fighters;
  player.stamina = 11; // Arrange a break, with real reach, windup and damage.
  step(match, { guard: true }, { heavy: true });
  for (let tick = 0; tick < 70 && !player.groundRecoveryV211; tick++) step(match, { guard: true });
  const cause = match.events.find(event => event.id === player.groundRecoveryV211?.breakId);
  assert.equal(cause?.type, 'guard-break');
  assert.equal(cause?.floorRecoveryV212, true);
  return cause;
}
function groundAtlas(actor) {
  const art = getXenoTrialsArtV96(actor.id, actor.variant);
  return [[getXenoTrialsSpriteAtlasV188(actor, art), sampleXenoTrialsSpriteAtlasV188],
    [getXenoTrialsSpriteAtlasV189(actor, art), sampleXenoTrialsSpriteAtlasV189],
    [getXenoTrialsRuntimeSpriteAtlas(actor, art), sampleXenoTrialsSpriteAtlasV191]]
    .find(([atlas]) => atlas?.frames.some(frame => frame.id === 'ko-ground'));
}

test('the exact ten airborne atlases have a native falling strike with one real impact and drawn frames', () => {
  const actual = XENO_TRIALS_RUNTIME_ACTION_ATLASES.filter(atlas => atlas.kind === 'air-combat').map(atlas => atlas.fighterId);
  assert.deepEqual([...actual].sort(), [...airIds].sort());
  for (const id of airIds) {
    const match = fight(id, 'queen'), [player, target] = match.fighters, definition = getXenoTrialsFighterV96(id);
    const spec = getXenoTrialsAirHitV211(definition), hp = target.hp;
    assert.equal(getXenoTrialsAirHitV211({ ...definition, profileId: 'unadmitted' }), null);
    step(match, { jump: true });
    for (let tick = 0; tick < 120 && player.vy >= 0; tick++) step(match);
    assert.ok(player.y > 0 && player.vy < 0, id);
    step(match, { light: true });
    assert.equal(player.attack?.kind, 'air-hit', id);
    assert.equal(player.stats.hits, 0, id);
    const atlas = getXenoTrialsActiveActionAtlas(player, getXenoTrialsArtV96(id, player.variant));
    assert.equal(sampleXenoTrialsActionFrameV199(atlas, player, { spec })?.frame.id, 'air-light-windup', id);
    assert.equal(sampleXenoTrialsActionFrameV199(atlas, player, { spec: { ...spec } }), null, 'an unadmitted spec cannot drive the keys');
    while (!player.stats.hits && player.attack && player.y > 0) step(match);
    assert.equal(player.stats.hits, 1, id);
    assert.ok(player.y > 0 && target.hp < hp, id);
    const frame = sampleXenoTrialsActionFrameV199(atlas, player, { spec })?.frame;
    assert.equal(frame?.id, 'air-light-impact', id);
    assert.equal(frame?.supportMode, 'free', id);
    advance(match, 110, { light: true });
    assert.equal(player.stats.hits, 1, id);
  }
});

test('15 admitted grounded keys scale only the hurt height and allow a living early rise', () => {
  for (const id of groundIds) {
    const match = fight(id), [player] = match.fighters, receipt = breakGuard(match);
    const height = body(player).height, width = body(player).width, hp = player.hp;
    advance(match, XENO_TRIALS_GET_UP_V211.opensAt);
    const pose = groundAtlas(player), cue = getXenoTrialsGroundRecoveryV211(match, player);
    assert.ok(pose && cue?.ready, id);
    const [atlas, sample] = pose, frame = sample(atlas, player, { cue })?.frame;
    assert.equal(frame?.id, 'ko-ground', id);
    assert.ok(frame.supports.length && player.y === 0 && player.hp > 0, id);
    const alphaHeight = frame.alphaBounds[3] - frame.alphaBounds[1];
    assert.ok(Math.abs(hurt(player).height - height * alphaHeight / atlas.referenceHeight) < 1e-9, id);
    assert.equal(body(player).width, width, id);
    step(match, { guard: true });
    assert.equal(match.events.at(-1).breakIdV211, receipt.id, id);
    advance(match, 10, { guard: true });
    assert.equal(player.groundRecoveryV211, undefined, id);
    assert.equal(player.hp, hp, id);
    assert.equal(hurt(player).height, height, id);
  }
});

test('six heavy pivots preserve their outgoing facing until completion; unsupported leaps become bounded floor travel', () => {
  for (const id of pivots) {
    const match = fight(id), [player, target] = match.fighters, definition = getXenoTrialsFighterV96(id);
    assert.ok(hasXenoTrialsGroundTurnV210(definition), id);
    assert.equal(hasXenoTrialsGroundTurnV210({ ...definition, profileId: 'copy' }), false);
    target.x = player.x - 600; // Place the new target behind the committed body.
    advance(match, XENO_TRIALS_TURN_TICKS_V210, { left: true, light: true });
    assert.equal(player.facing, 1, id);
    assert.equal(player.attack, null, id);
    step(match, { light: true });
    assert.equal(player.facing, -1, id);
    assert.equal(match.events.at(-1).type, 'turn-v210', id);
    assert.equal(player.attack, null, 'the held attack cannot carry through the pivot');
  }
  for (const id of ['crusher-acm', 'defender']) {
    const match = fight(id), [player, target] = match.fighters, start = player.x;
    assert.equal(hasXenoTrialsGroundTraversalV208(getXenoTrialsFighterV96(id)), true);
    target.x += 200;
    advance(match, 26, { jump: true });
    assert.equal(player.y, 0, id);
    assert.equal(player.vy, 0, id);
    assert.ok(player.x > start, id);
    assert.equal(match.events.filter(event => event.type === 'evade-v207').length, 1, id);
  }
});

test('horde recovery preserves its cause, input and resume ticks, and old V211 receipts stay supported', () => {
  for (const id of ['synth-guard', 'warrior']) {
    const progress = createXenoTrialsProgressV96();
    if (!progress.unlocked.includes(id)) progress.unlocked.push(id);
    const ticket = beginXenoTrialsV96(progress, { playerId: id, activityV119: { branch: 'horde', id: 'xth180-incoming-1' } });
    assert.ok(ticket.applied);
    const match = fight(id, 'runner', ticket.config);
    advance(match, XENO_TRIALS_HORDE_LIMITS_V180.spawnGraceTicks);
    breakGuard(match);
    advance(match, XENO_TRIALS_GET_UP_V211.opensAt);
    const saved = createXenoTrialsHordeCheckpointV186(getXenoTrialsSnapshotV96(match), ticket.config);
    assert.ok(saved);
    const stripped = structuredClone(saved.snapshot);
    delete stripped.fighters[0].groundRecoveryV211;
    assert.equal(createXenoTrialsHordeCheckpointV186(stripped, ticket.config), null);
    delete saved.snapshot.events.find(event => event.type === 'guard-break').floorRecoveryV212;
    const acceptedLegacy = createXenoTrialsHordeCheckpointV186(saved.snapshot, ticket.config);
    assert.equal(Boolean(acceptedLegacy), id === 'warrior');
    const resumed = restoreXenoTrialsHordeMatchV180(getXenoTrialsSnapshotV96(match));
    assert.ok(resumed);
    setXenoTrialsPausedV96(resumed, false);
    for (const state of [match, resumed]) advance(state, 15, { guard: true });
    assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match));
  }
});
