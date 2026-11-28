import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, setXenoTrialsPausedV96,
  releaseXenoTrialsControlsV150, nextXenoTrialsRoundV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { XENO_TRIALS_FIGHTERS_V96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsAttackV147 } from '../src/xeno-trials-signatures-v147.js';
import { XENO_TRIALS_ATTACKS_V96 } from '../src/xeno-trials-combat-contract-v186.js';
import { getXenoTrialsBodyBoundsV105 } from '../src/xeno-trials-geometry-v105.js';
import { XENO_TRIALS_ASSISTS_V232 as rules, getXenoTrialsAssistActorsV232,
  getXenoTrialsAssistViewV232, getXenoTrialsAssistReadinessV232,
  askXenoTrialsAssistV232 } from '../src/xeno-trials-assists-v232.js';

// Explicit fixtures: exhibition identities, floor positions and initial meter.
// Every launch, guard, parry, damage receipt and interruption below runs through
// the public engine's real fixed-step entry point; no impact callback is mocked.
const sides = ['player', 'opponent'];
function fixture(slot = 0, overrides = {}) {
  const config = { playerId: 'warrior', opponentId: 'warrior', introSeconds: 0,
    roundsToWin: 2, roundSeconds: 180, holdRoundTransition: true,
    exhibitionV232: { mode: 'tag', assists: true, controls: 'local',
      playerTeam: [{ id: 'warrior' }, { id: 'warrior' }],
      opponentTeam: [{ id: 'warrior' }, { id: 'warrior' }] }, ...overrides };
  const match = createXenoTrialsMatchV96(config), side = sides[slot], enemySide = sides[1 - slot];
  const owner = match.fighters[slot], enemy = match.fighters[1 - slot];
  owner.x = slot ? 710 : 290; enemy.x = owner.x + (slot ? -1 : 1) * 210;
  owner.facing = slot ? -1 : 1; enemy.facing = -owner.facing;
  owner.superMeterV148 = 100;
  const bench = match.tagV232?.teams[side].members[1];
  const step = (own = {}, other = {}) => stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96,
    ...(slot ? [other, own] : [own, other]));
  const advance = (ticks, own = {}, other = {}) => { for (let n = 0; n < ticks; n++) step(own, other); };
  return { match, owner, enemy, bench, side, enemySide, slot, step, advance };
}
const stateOf = ({ match, side }) => match.assistsV232.sides[side];
function finish(f, other = {}) {
  let budget = rules.maximumTicks + 2;
  while (getXenoTrialsAssistActorsV232(f.match).length && budget-- > 0) f.step({}, other);
  assert.ok(budget > 0, 'the temporary reserve must leave in a finite number of native steps');
}

test('opt-in tag exhibition only, with all 202 source identities and statistics preserved', () => {
  assert.equal(XENO_TRIALS_FIGHTERS_V96.length, 202);
  const before = JSON.stringify(XENO_TRIALS_FIGHTERS_V96);
  for (const config of [{}, { exhibitionV232: { mode: 'duel', assists: true } },
    { exhibitionV232: { mode: 'tag', assists: false,
      playerTeam: [{ id: 'warrior' }, { id: 'warrior' }], opponentTeam: [{ id: 'warrior' }, { id: 'warrior' }] } },
    { activityV119: { branch: 'campaign', id: 'campaign-hive' }, exhibitionV232: fixture().match.config.exhibitionV232 },
    { practice: true, exhibitionV232: fixture().match.config.exhibitionV232 }]) {
    const match = createXenoTrialsMatchV96({ playerId: 'warrior', opponentId: 'warrior', introSeconds: 0, ...config });
    stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, { assist: true }, {});
    assert.equal(getXenoTrialsAssistViewV232(match), null);
    assert.deepEqual(getXenoTrialsAssistActorsV232(match), []);
  }
  assert.equal(JSON.stringify(XENO_TRIALS_FIGHTERS_V96), before);
  assert.equal(rules.canonExact, false);
});

test('both signed sides use one native grounded light and debit only the active meter once', () => {
  for (const slot of [0, 1]) {
    const f = fixture(slot), nativeLight = getXenoTrialsAttackV147(getXenoTrialsFighterV96(f.bench.id), 'light', XENO_TRIALS_ATTACKS_V96.light);
    const hpBefore = f.enemy.hp, benchStamina = f.bench.stamina;
    f.step({ assist: true });
    assert.equal(getXenoTrialsAssistActorsV232(f.match)[0], f.bench);
    const view = getXenoTrialsAssistViewV232(f.match).sides[f.side];
    assert.equal(view.actor.stage, 'entry');
    assert.equal(view.actor.x < f.owner.x, slot === 0);
    assert.equal(view.actor.memberInstanceId, f.bench.instanceIdV232);
    assert.match(view.actor.instanceId, new RegExp(`^assist-${f.side}-`));
    assert.equal(f.owner.superMeterV148, 75);
    let minimumStamina = f.bench.stamina;
    for (let tick = 0; tick < rules.maximumTicks; tick++) {
      f.step({ assist: true }); minimumStamina = Math.min(minimumStamina, f.bench.stamina);
    }
    const state = stateOf(f);
    assert.equal(state.stats.accepted, 1); assert.equal(state.stats.meterSpent, 25);
    assert.equal(state.stats.attacks, 1); assert.equal(state.stats.hits, 1);
    assert.equal(f.bench.stats.hits, 1); assert.equal(f.owner.stats.hits, 0);
    assert.equal(f.owner.stats.damage, 0); assert.equal(f.owner.superMeterV148, 75);
    assert.equal(f.enemy.hp, hpBefore - state.stats.damage);
    assert.equal(state.stats.damage, Math.round(nativeLight.damage * getXenoTrialsFighterV96(f.bench.id).power));
    assert.ok(minimumStamina <= benchStamina - nativeLight.cost);
    assert.equal(state.lastReceipt.reason, 'complete');
    assert.equal(state.lastReceipt.attackId > 0, true);
    assert.deepEqual(getXenoTrialsAssistActorsV232(f.match), []);
    assert.equal(f.bench.assistV232, undefined);
  }
});

test('native frontal guard chips, spends stamina and attributes the contact to the reserve', () => {
  for (const slot of [0, 1]) {
    const f = fixture(slot), hp = f.enemy.hp, endurance = f.enemy.stamina;
    f.step({ assist: true }, { guard: true }); finish(f, { guard: true });
    assert.equal(f.enemy.stats.blocks, 1);
    assert.equal(f.enemy.hp, hp - 1);
    assert.ok(f.enemy.stamina < endurance - 8);
    assert.equal(stateOf(f).stats.damage, 1);
    assert.equal(f.owner.stats.damage, 0);
    const event = f.match.events.find(row => row.type === 'block');
    assert.equal(event.attackerInstanceV232, f.bench.instanceIdV232);
    assert.equal(event.attackerAssistInstanceV232, stateOf(f).lastReceipt.instanceId);
  }
});

test('native parry catches the reserve light on both sides without manufactured hit damage', () => {
  for (const slot of [0, 1]) {
    const f = fixture(slot), hp = f.enemy.hp;
    f.step({ assist: true });
    while (f.match.tick < 18) f.step();
    f.step({}, { parry: true });
    while (getXenoTrialsAssistActorsV232(f.match).length) f.step({}, { parry: true });
    assert.equal(f.enemy.hp, hp);
    assert.equal(stateOf(f).stats.parriesReceived, 1);
    assert.equal(stateOf(f).stats.damage, 0);
    assert.equal(stateOf(f).stats.hits, 0);
    assert.equal(stateOf(f).lastReceipt.reason, 'parried');
    assert.equal(f.owner.superMeterV148, 75);
    assert.ok(f.match.events.some(row => row.type === 'parry-v208'));
  }
});

test('entry has a real hurtbox: native counterhit interrupts and leaves lost HP in reserve', () => {
  for (const slot of [0, 1]) {
    const f = fixture(slot), reserveHp = f.bench.hp, ownerHp = f.owner.hp, enemyHp = f.enemy.hp;
    f.step({ assist: true }, { light: true });
    for (let tick = 0; tick < 110; tick++) f.step({}, { light: true });
    assert.ok(f.bench.hp < reserveHp);
    assert.equal(f.owner.hp, ownerHp);
    assert.equal(f.enemy.hp, enemyHp);
    assert.equal(stateOf(f).stats.interruptions, 1);
    assert.equal(stateOf(f).stats.attacks, 0);
    assert.equal(stateOf(f).stats.damage, 0);
    assert.equal(stateOf(f).stats.receivedDamage, reserveHp - f.bench.hp);
    assert.equal(stateOf(f).lastReceipt.reason, 'interrupted');
    assert.equal(f.owner.superMeterV148, 75);
    assert.equal(f.bench.assistV232, undefined);
  }
});

test('native projectiles strike the first exposed reserve, with persistent signed ownership', () => {
  for (const slot of [0, 1]) {
    const enemySide = sides[1 - slot];
    const exhibitionV232 = { mode: 'tag', assists: true, controls: 'local',
      playerTeam: [{ id: 'warrior' }, { id: 'warrior' }],
      opponentTeam: [{ id: 'warrior' }, { id: 'warrior' }] };
    exhibitionV232[`${enemySide}Team`][0] = { id: 'xenoborg' };
    const f = fixture(slot, { exhibitionV232 });
    f.enemy.x = f.owner.x + f.owner.facing * 400;
    const reserveHp = f.bench.hp, ownerHp = f.owner.hp;
    f.step({}, { special: true });
    while (f.match.tick < 24) f.step({}, { special: true });
    f.step({ assist: true }, { special: true });
    f.advance(120, {}, { special: true });
    assert.ok(f.bench.hp < reserveHp);
    assert.equal(f.owner.hp, ownerHp);
    assert.equal(stateOf(f).stats.interruptions, 1);
    assert.equal(stateOf(f).stats.receivedDamage, reserveHp - f.bench.hp);
    assert.equal(stateOf(f).stats.damage, 0);
    const hit = f.match.events.find(row => row.type === 'hit' && row.targetInstanceV232 === f.bench.instanceIdV232);
    assert.equal(hit.attackerInstanceV232, f.enemy.instanceIdV232);
    assert.equal(hit.targetAssistInstanceV232, stateOf(f).lastReceipt.instanceId);
  }
});

test('simultaneous reserve entries can hit each other once, without passing through to active members', () => {
  const f = fixture(); f.enemy.superMeterV148 = 100;
  const otherBench = f.match.tagV232.teams.opponent.members[1];
  const hp = [f.owner.hp, f.enemy.hp], reserveHp = [f.bench.hp, otherBench.hp];
  f.step({ assist: true }, { assist: true }); f.advance(110);
  assert.deepEqual([f.owner.hp, f.enemy.hp], hp);
  assert.ok(f.bench.hp < reserveHp[0] && otherBench.hp < reserveHp[1]);
  assert.deepEqual([f.owner.superMeterV148, f.enemy.superMeterV148], [75, 75]);
  for (const side of sides) {
    const state = f.match.assistsV232.sides[side];
    assert.equal(state.stats.hits, 1); assert.equal(state.stats.interruptions, 1);
    assert.equal(state.stats.accepted, 1); assert.equal(state.stats.attacks, 1);
    assert.equal(state.lastReceipt.reason, 'interrupted');
  }
});

test('range and the fixed facing allow a true whiff; no target is damaged twice', () => {
  for (const slot of [0, 1]) {
    const f = fixture(slot); f.enemy.x += f.owner.facing * 700;
    const hp = f.enemy.hp;
    f.step({ assist: true }); finish(f);
    assert.equal(f.enemy.hp, hp);
    assert.equal(stateOf(f).stats.hits, 0);
    assert.equal(stateOf(f).stats.whiffs, 1);
    assert.equal(stateOf(f).stats.attacks, 1);
    assert.equal(f.owner.superMeterV148, 75);
    assert.ok(stateOf(f).lastReceipt.endedTick - stateOf(f).lastReceipt.bornTick < rules.maximumTicks);
  }
});

test('busy, airborne, KO, meter, tag and guard gates are free and consume a held attempt', () => {
  for (const mutate of [f => { f.owner.hp = 0; }, f => { f.bench.hp = 0; },
    f => { f.owner.y = 20; }, f => { f.owner.stun = 1; }, f => { f.owner.guard = true; },
    f => { f.owner.superMeterV148 = 24; }, f => { f.match.tagV232.teams[f.side].cooldown = 1; },
    f => { f.owner.attack = { kind: 'light', id: 1, age: 0, facing: f.owner.facing, hit: false }; }]) {
    const f = fixture(); mutate(f);
    assert.equal(getXenoTrialsAssistReadinessV232(f.match, f.side).ready, false);
  }
  const f = fixture();
  f.step({ tag: true, assist: true });
  assert.equal(stateOf(f).stats.accepted, 0);
  assert.equal(f.owner.superMeterV148, 100);
  f.advance(90, { assist: true });
  assert.equal(stateOf(f).stats.accepted, 0);
});

test('an assist chord cannot also start a new active action in the same fixed step', () => {
  for (const action of ['light', 'heavy', 'special', 'super', 'guard', 'parry', 'left', 'right', 'jump', 'crouch', 'evade', 'antiAir', 'signature2', 'signature3']) {
    const f = fixture();
    f.step({ assist: true, [action]: true });
    assert.equal(stateOf(f).stats.accepted, 0, action);
    assert.equal(stateOf(f).stats.meterSpent, 0, action);
    assert.equal(stateOf(f).stats.rejected, 1, action);
    assert.deepEqual(getXenoTrialsAssistActorsV232(f.match), [], action);
  }
});

test('held command cannot rearm at cooldown expiry, pause or blocked presentation', () => {
  const f = fixture();
  f.step({ assist: true });
  f.advance(rules.cooldownTicks + 10, { assist: true }, { guard: true });
  assert.equal(stateOf(f).stats.accepted, 1);
  f.step(); f.step({ assist: true }, { guard: true });
  assert.equal(stateOf(f).stats.accepted, 2);
  assert.equal(f.owner.superMeterV148, 50);
  setXenoTrialsPausedV96(f.match, true);
  assert.deepEqual(getXenoTrialsAssistActorsV232(f.match), []);
  const tick = f.match.tick;
  f.advance(30, { assist: true }); assert.equal(f.match.tick, tick);
  setXenoTrialsPausedV96(f.match, false);
  f.advance(rules.cooldownTicks + 10, { assist: true }, { guard: true });
  assert.equal(stateOf(f).stats.accepted, 2);
  releaseXenoTrialsControlsV150(f.match, f.side, {});
  f.step({ assist: true }, { guard: true });
  assert.equal(stateOf(f).stats.accepted, 3);
  assert.equal(f.owner.superMeterV148, 25);
});

test('reserve KO cancels physically and blocks any later paid deployment', () => {
  const f = fixture(); f.bench.hp = 1;
  f.step({ assist: true }, { light: true }); f.advance(90, {}, { light: true });
  assert.equal(f.bench.hp, 0);
  assert.equal(stateOf(f).stats.knockouts, 1);
  assert.equal(stateOf(f).lastReceipt.reason, 'reserve-ko');
  assert.equal(getXenoTrialsAssistReadinessV232(f.match, f.side).reason, 'reserve-ko');
  f.advance(rules.cooldownTicks); f.step({ assist: true });
  assert.equal(stateOf(f).stats.accepted, 1);
  assert.equal(f.owner.superMeterV148, 75);
});

test('bounded entry and withdrawal stay inside arena on both signed edges', () => {
  for (const slot of [0, 1]) {
    const f = fixture(slot);
    f.owner.x = slot ? 1800 : -800; f.enemy.x = f.owner.x + f.owner.facing * 600;
    f.step({ assist: true });
    let steps = 0;
    while (getXenoTrialsAssistActorsV232(f.match).length && steps++ < rules.maximumTicks) {
      const actor = getXenoTrialsAssistActorsV232(f.match)[0];
      assert.ok(actor.x >= -800 && actor.x <= 1800);
      assert.equal(getXenoTrialsBodyBoundsV105(actor).bottom, 0);
      f.step();
    }
    assert.ok(steps < rules.maximumTicks);
  }
});

test('CPU ask is deterministic and 30/60/120 Hz produce the same assist state', () => {
  const f = fixture();
  const a = Array.from({ length: 120 }, (_, tick) => { f.match.tick = tick; return askXenoTrialsAssistV232(f.match, f.side); });
  const b = Array.from({ length: 120 }, (_, tick) => { f.match.tick = tick; return askXenoTrialsAssistV232(f.match, f.side); });
  assert.deepEqual(a, b); assert.ok(a.some(Boolean));
  const snapshots = [30, 60, 120].map(hz => {
    const local = fixture();
    for (let frame = 0; frame < hz * 2; frame++) stepXenoTrialsMatchV96(local.match, 1 / hz, { assist: true }, {});
    return JSON.stringify({ assist: local.match.assistsV232,
      members: local.match.tagV232.teams.player.members, target: local.enemy, events: local.match.events });
  });
  assert.equal(snapshots[0], snapshots[1]); assert.equal(snapshots[1], snapshots[2]);
});

test('new rounds cancel actors, clear cooldown and preserve statistics and physical rearm', () => {
  const f = fixture(); f.step({ assist: true }); f.advance(100, { assist: true });
  const accepted = stateOf(f).stats.accepted;
  // Explicit lifecycle fixture: the public next-round entry is tested with the
  // same held input state produced above, without awarding a fabricated win.
  f.match.phase = 'round-over';
  assert.equal(nextXenoTrialsRoundV96(f.match), true);
  assert.equal(stateOf(f).cooldown, 0);
  assert.equal(stateOf(f).stats.accepted, accepted);
  assert.deepEqual(getXenoTrialsAssistActorsV232(f.match), []);
  f.match.fighters[0].superMeterV148 = 100;
  f.step({ assist: true });
  assert.equal(stateOf(f).stats.accepted, accepted);
});
