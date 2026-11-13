import test from 'node:test';
import assert from 'node:assert/strict';
import { XENO_TRIALS_STAGE_HAZARDS_V188 as definitions, getXenoTrialsStageHazardV188 as definition,
  createXenoTrialsStageHazardsV188 as createHazards, validateXenoTrialsStageHazardsV188 as validate,
  isXenoTrialsStageHazardsForwardV188 as forward, getXenoTrialsStageHazardViewV188 as view,
  stepXenoTrialsStageHazardsV188 as stepHazards } from '../src/xeno-trials-stage-hazards-v188.js';
import { drawXenoTrialsStageHazardsV188 as draw } from '../src/xeno-trials-stage-hazards-render-v188.js';
import { XENO_TRIALS_BOSS_STAGES_V179 as stages } from '../src/xeno-trials-boss-stages-v179.js';
import { XENO_TRIALS_FIGHTERS_V96 as fighters, getXenoTrialsFighterV96 as fighterDefinition } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105 as bounds, getXenoTrialsGeometryV105 as geometry,
  XENO_TRIALS_ARENA_V105 as arena } from '../src/xeno-trials-geometry-v105.js';
import { createXenoTrialsMatchV96 as create, stepXenoTrialsMatchV96 as step, getXenoTrialsSnapshotV96 as snapshot,
  setXenoTrialsPausedV96 as pause, restoreXenoTrialsHordeMatchV180 as restore } from '../src/xeno-trials-engine-v96.js';
import { XENO_TRIALS_OPERATIONS_V188 as operations } from '../src/xeno-trials-operations-v188.js';

// Explicit collision boundary fixture: direct hazard unit checks prepare one
// canonical native body at a schedule boundary. HP changes are supplied through
// the engine-shaped callback. These forty checks are not forty browser runs.
function fixture(entry, fighterId = 'warrior') {
  const actor = { id: fighterId, side: 'player', x: entry.anchors[0], y: 0, facing: 1, hp: 200 };
  actor.x += entry.anchors[0] - bounds(actor).center;
  return { config: { stageId: entry.stageId, operationV188: { id: 'xto188-collision-fixture' } },
    operationV188: { operationId: 'xto188-collision-fixture', status: 'active' },
    stageHazardsV188: createHazards(entry.stageId, 188, 0), fighters: [actor], tick: 0, phase: 'active', paused: false, result: null };
}
const receive = hit => { hit.to.hp = Math.max(0, hit.to.hp - hit.damage); };
const hitAt = (match, tick, events = []) => {
  match.tick = tick;
  return stepHazards(match, bounds, arena, receive, (type, details) => events.push({ type, ...details }));
};
const nativeTick = (match, input = {}) => step(match, 1 / 120, input, {});
const firstActive = entry => entry.graceTicks + entry.warningTicks;
const native = entry => create({ playerId: 'warrior', activityV119: { branch: 'operations', id: operations.find(op => op.stageId === entry.stageId).id }, seed: 188, introSeconds: 0 });

test('forty exact stage settings have five distinct physical families and no historical arena is enabled', () => {
  assert.equal(definitions.length, 40); assert.equal(new Set(definitions.map(entry => entry.stageId)).size, 40);
  assert.deepEqual(definitions.map(entry => entry.stageId), stages.map(stage => stage.id));
  assert.deepEqual(new Set(definitions.map(entry => entry.kind)), new Set(['steam', 'arc', 'debris', 'corrosive', 'cryo']));
  for (const id of ['containment-deck', 'reactor-ring', 'planet-surface', 'xt179-unknown', '__proto__']) {
    assert.equal(definition(id), null); assert.equal(createHazards(id, 188), null);
  }
  assert.equal(createHazards(stages[0].id, NaN), null);
  assert.equal(createHazards(stages[0].id, 188, -1), null);
  assert.ok(Object.isFrozen(definitions) && definitions.every(entry => Object.isFrozen(entry.anchors)));
});

for (const entry of definitions) test(`${entry.stageId}: warning, native geometry contact, bounded cadence and both escape lanes`, () => {
  const match = fixture(entry), initialHp = match.fighters[0].hp, events = [];
  assert.equal(hitAt(match, entry.graceTicks, events), 0);
  assert.equal(view(match).phase, 'warning'); assert.equal(view(match).remainingTicks, entry.warningTicks);
  assert.equal(view(match).zones[0].right - view(match).zones[0].left, entry.width);
  assert.equal(match.fighters[0].hp, initialHp);
  hitAt(match, firstActive(entry) - 1, events); assert.equal(match.fighters[0].hp, initialHp);
  assert.equal(hitAt(match, firstActive(entry), events), 1);
  assert.equal(match.fighters[0].hp, initialHp - entry.damage);
  assert.equal(match.stageHazardsV188.playerDamage, entry.damage);
  assert.equal(match.stageHazardsV188.totalDamage, entry.damage);
  assert.equal(match.stageHazardsV188.contacts, 1);
  assert.equal(hitAt(match, firstActive(entry), events), 0, 'a repeated native tick never replays contact');
  assert.equal(hitAt(match, firstActive(entry) + Math.min(119, entry.activeTicks - 1), events), 0);
  if (entry.activeTicks > 120) {
    assert.equal(hitAt(match, firstActive(entry) + 120, events), 1);
    assert.equal(match.stageHazardsV188.playerDamage, entry.damage * 2);
  }
  const after = match.fighters[0].hp;
  assert.equal(hitAt(match, firstActive(entry) + entry.activeTicks, events), 0);
  assert.equal(match.fighters[0].hp, after); assert.equal(view(match).phase, 'idle');
  assert.equal(events.filter(event => event.type === 'stage-hazard-warning-v188').length, 1);
  assert.equal(events.filter(event => event.type === 'stage-hazard-active-v188').length, 1);
  assert.ok(validate(match.stageHazardsV188, { stageId: entry.stageId, seed: 188, tick: match.tick }));
  for (const direction of [-1, 1]) {
    const dodge = fixture(entry), actor = dodge.fighters[0], body = bounds(actor);
    actor.x += direction * ((entry.width + body.width) / 2 + 1);
    assert.equal(hitAt(dodge, firstActive(entry)), 0);
    assert.equal(actor.hp, initialHp, 'either lateral edge is physically outside the damaging body interval');
  }
});

test('all 189 admitted body widths and native speeds can clear every warned strip with a 0.6 second reaction allowance', () => {
  assert.equal(fighters.length, 189);
  for (const entry of definitions) for (const fighter of fighters) {
    const shape = geometry(fighter.id), distance = (shape.width + entry.width) / 2 + 2;
    assert.ok(fighter.speed * (entry.warningTicks / 120 - .6) > distance,
      `${entry.stageId}/${fighter.id}: ${distance} units must fit the actual warning travel budget`);
    for (const anchor of entry.anchors) {
      assert.ok(anchor - entry.width / 2 - shape.width > arena.left);
      assert.ok(anchor + entry.width / 2 + shape.width < arena.right);
    }
  }
});

test('low electrical, corrosive and cryogenic bands have real vertical escape; tall steam and debris require lateral clearance', () => {
  for (const entry of definitions) {
    const match = fixture(entry), actor = match.fighters[0];
    actor.y = entry.height;
    assert.equal(hitAt(match, firstActive(entry)), 0);
    actor.y = entry.height - 1;
    assert.equal(hitAt(match, firstActive(entry) + 1), 1);
    if (['arc', 'corrosive', 'cryo'].includes(entry.kind)) {
      const maximumJump = fighterDefinition(actor.id).jump ** 2 / (2 * 1450);
      assert.ok(maximumJump > entry.height + 10);
    }
  }
});

test('hazards stay disabled for ordinary duels and both historical horde generations, paused matches and terminal objectives', () => {
  for (const branch of [{}, { activityV119: { branch: 'horde', id: 'xth180-incoming-1' } }, { activityV119: { branch: 'horde', id: 'xth186-incoming-1' } }]) {
    const match = create({ ...branch, seed: 188, introSeconds: 0 });
    for (let i = 0; i < 8; i++) nativeTick(match);
    assert.equal(match.stageHazardsV188, undefined); assert.equal(view(match), null);
  }
  for (const status of ['completed', 'failed']) {
    const match = fixture(definitions[0]); match.operationV188.status = status;
    assert.equal(hitAt(match, firstActive(definitions[0])), 0); assert.equal(view(match), null);
  }
  const match = fixture(definitions[0]); match.paused = true;
  const before = structuredClone(match.stageHazardsV188);
  assert.equal(hitAt(match, firstActive(definitions[0])), 0);
  assert.deepEqual(match.stageHazardsV188, before);
  match.paused = false; match.config.operationV188.id = 'another-ticket';
  assert.equal(hitAt(match, firstActive(definitions[0])), 0);
});

test('real accepted HP loss is recorded separately per player and all actors, clipped at death without fictitious combat stats', () => {
  const match = fixture(definitions[0]), player = match.fighters[0];
  match.fighters.push({ ...player, side: 'opponent', instanceIdV180: 'horde-1', hp: 3 });
  assert.equal(hitAt(match, firstActive(definitions[0])), 2);
  assert.equal(match.stageHazardsV188.playerDamage, 6); assert.equal(match.stageHazardsV188.totalDamage, 9);
  assert.equal(match.fighters[1].hp, 0);
  hitAt(match, match.tick + 1);
  assert.ok(match.stageHazardsV188.nextHits.every(entry => entry.actorId !== 'horde-1'));
  const immune = fixture(definitions[0]); immune.tick = firstActive(definitions[0]);
  assert.equal(stepHazards(immune, bounds, arena, () => {}), 0);
  assert.equal(immune.stageHazardsV188.contacts, 0); assert.deepEqual(immune.stageHazardsV188.nextHits, []);
});

test('strict restoration rejects foreign stages/seeds, injected tuning, unbounded or prototype cadence keys and damage rollback', () => {
  const match = fixture(definitions[0]); hitAt(match, firstActive(definitions[0]));
  const state = match.stageHazardsV188, context = { stageId: definitions[0].stageId, seed: 188, tick: match.tick };
  assert.ok(validate(state, context));
  for (const change of [{ stageId: stages[1].id }, { seed: 189 }, { contacts: -1 }, { totalDamage: 90000 },
    { playerDamage: 7 }, { lastTick: match.tick + 1 }, { width: 999 },
    { nextHits: [{ actorId: '__proto__', tick: 900 }] }, { nextHits: [{ actorId: 'horde-0', tick: 900 }] },
    { nextHits: [{ actorId: 'player', tick: 900 }, { actorId: 'player', tick: 901 }] },
    { nextHits: [{ actorId: 'player', tick: match.tick + 121 }] },
    { nextHits: [{ actorId: 'player', tick: firstActive(definitions[0]) - 1 + 120 }] }]) {
    assert.equal(validate({ ...state, ...change }, context), false, JSON.stringify(change));
  }
  const copy = JSON.parse(JSON.stringify(state)); assert.deepEqual(copy, state); assert.ok(forward(state, copy));
  assert.equal(forward(state, { ...copy, playerDamage: 0 }), false);
  assert.equal(forward(state, { ...copy, contacts: 0 }), false);
  assert.equal(forward(state, { ...copy, lastTick: state.lastTick - 1 }), false);
  assert.equal(forward({}, {}), false);
});

test('native engine walk reaches a steam contact, exact JSON restoration keeps its cadence, and a true pause freezes it', () => {
  const entry = definitions[0], match = native(entry), player = match.fighters[0];
  const hp = player.hp;
  // Actual native controls; direct neutral opponent orders are the declared
  // pressure fixture. No HP, timer, wave, result or operation state is injected.
  while (match.tick < firstActive(entry)) {
    const distance = entry.anchors[0] - bounds(player).center;
    nativeTick(match, Math.abs(distance) < fighterDefinition(player.id).speed / 120 ? {} : distance > 0 ? { right: true } : { left: true });
  }
  assert.equal(player.hp, hp - entry.damage); assert.equal(match.stageHazardsV188.playerDamage, entry.damage);
  assert.ok(match.events.some(event => event.type === 'stage-hazard-warning-v188'));
  assert.ok(match.events.some(event => event.type === 'stage-hazard-contact-v188'));
  assert.equal(player.stats.damage, 0); assert.equal(match.hordeV180.opponentStats.damage, 0);
  pause(match, true); const saved = snapshot(match), copy = restore(saved);
  assert.ok(copy); assert.deepEqual(snapshot(copy), saved);
  for (let i = 0; i < 60; i++) nativeTick(match, { right: true });
  assert.deepEqual(snapshot(match), saved);
  pause(match, false); pause(copy, false);
  for (let i = 0; i < 160; i++) { nativeTick(match); nativeTick(copy); }
  assert.deepEqual(snapshot(copy), snapshot(match));
});

test('the largest admitted native body can leave the steam warning through actual movement without taking a hazard hit', () => {
  const entry = definitions[0], match = create({ playerId: 'import-xeno-titan-queen-nolegs', seed: 188,
    activityV119: { branch: 'operations', id: operations.find(op => op.stageId === entry.stageId).id }, introSeconds: 0 });
  const hp = match.fighters[0].hp;
  while (match.tick < firstActive(entry) + entry.activeTicks) nativeTick(match, { left: true });
  assert.equal(match.stageHazardsV188.playerDamage, 0); assert.equal(match.fighters[0].hp, hp);
  assert.ok(bounds(match.fighters[0]).right < entry.anchors[0] - entry.width / 2);
});

function recordingContext() {
  const calls = [], stack = []; let alpha = 1;
  const context = { calls,
    save() { stack.push(alpha); }, restore() { alpha = stack.pop(); },
    get globalAlpha() { return alpha; }, set globalAlpha(value) { alpha = value; },
    beginPath() {}, closePath() {}, moveTo() {}, lineTo() {}, quadraticCurveTo() {}, rect() {}, clip() {},
    ellipse() {}, arc() {}, stroke() {}, fill() {},
    fillRect(...args) { calls.push({ kind: 'fillRect', args, alpha }); },
    strokeRect(...args) { calls.push({ kind: 'strokeRect', args, alpha }); }
  };
  return context;
}
test('rear effects stay transparent, front cues remain under the feet, and reduced motion retains every exact damaging boundary', () => {
  for (const entry of definitions) for (const reducedMotion of [false, true]) {
    const match = fixture(entry); match.tick = firstActive(entry);
    const rear = recordingContext(), front = recordingContext();
    assert.equal(draw(rear, match, arena, { plane: 'rear', reducedMotion }).phase, 'active');
    assert.equal(draw(front, match, arena, { plane: 'front', reducedMotion }).phase, 'active');
    assert.ok(rear.calls.every(call => call.args.every(Number.isFinite) && call.alpha <= .9));
    assert.ok(front.calls.every(call => call.args[1] >= arena.floor - 5));
    assert.ok(front.calls.some(call => call.kind === 'strokeRect' && call.args[2] === entry.width));
    assert.equal(rear.globalAlpha, 1); assert.equal(front.globalAlpha, 1);
  }
});
