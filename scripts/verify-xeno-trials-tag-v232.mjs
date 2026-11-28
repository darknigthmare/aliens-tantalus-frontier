import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, nextXenoTrialsRoundV96,
  setXenoTrialsPausedV96, releaseXenoTrialsControlsV150, getXenoTrialsSnapshotV96 } from '../src/xeno-trials-engine-v96.js';
import { XENO_TRIALS_FIGHTERS_V96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_TAG_V232, normalizeXenoTrialsExhibitionV232, getXenoTrialsTagViewV232,
  reconnectXenoTrialsTagV232 } from '../src/xeno-trials-tag-v232.js';
import { getXenoTrialsBodyBoundsV105, resolveXenoTrialsBodiesV105 } from '../src/xeno-trials-geometry-v105.js';

// HP/position/timer injections below are explicit fixtures, not UI QA evidence.
const teamConfig = { mode: 'tag', controls: 'local', assists: false,
  playerTeam: [{ id: 'warrior' }, { id: 'runner' }],
  opponentTeam: [{ id: 'arachnoid', variant: 'purple' }, { id: 'defender' }] };
const create = (extra = {}) => createXenoTrialsMatchV96({ seed: 232, introSeconds: 0,
  holdRoundTransition: true, exhibitionV232: structuredClone(teamConfig), ...extra });
function advance(match, ticks, player = {}, opponent = {}) {
  for (let i = 0; i < ticks; i++) stepXenoTrialsMatchV96(match, 1 / 120, player, opponent);
}
function until(match, predicate, limit = 240, player = {}, opponent = {}) {
  for (let i = 0; i < limit && !predicate(); i++) advance(match, 1, player, opponent);
  assert.ok(predicate(), 'fixture reached the expected native transition');
}
const own = match => match.tagV232.teams.player;

test('exhibition is explicit, disjoint from activities, and canonical identities stay exact', () => {
  assert.equal(normalizeXenoTrialsExhibitionV232({}), null);
  for (const extra of [{ activityV119: { branch: 'campaign', id: 'xt119-certification-1' } },
    { activityV119: { branch: 'on-demand', id: 'on-demand' } }, { hordeV180: {} }, { operationV188: {} }, { practiceV207: {} }])
    assert.equal(normalizeXenoTrialsExhibitionV232({ exhibitionV232: teamConfig, ...extra }), null);
  assert.equal(normalizeXenoTrialsExhibitionV232({ exhibitionV232: { ...teamConfig,
    playerTeam: [{ id: 'warrior' }, { id: 'invented-queen' }] } }), null);
  assert.equal(normalizeXenoTrialsExhibitionV232({ exhibitionV232: { ...teamConfig,
    opponentTeam: [{ id: 'arachnoid', variant: 'invented' }, { id: 'runner' }] } }), null);
  for (const fighter of XENO_TRIALS_FIGHTERS_V96) for (const variant of fighter.variants.length ? fighter.variants : [null]) {
    const normalized = normalizeXenoTrialsExhibitionV232({ exhibitionV232: { ...teamConfig,
      playerTeam: [{ id: fighter.id, variant }, { id: 'warrior' }] } });
    assert.deepEqual(normalized.playerTeam[0], { id: fighter.id, variant });
  }
});

test('two native active slots, four persistent members, detached HUD and JSON reconnection', () => {
  const match = create(), fighters = match.fighters;
  assert.equal(fighters.length, 2); assert.equal(own(match).members.length, 2);
  assert.equal(own(match).members[0], fighters[0]);
  const view = getXenoTrialsTagViewV232(match); view.teams.player.members[0].hp = -99;
  assert.ok(match.fighters[0].hp > 0);
  const snapshot = getXenoTrialsSnapshotV96(match);
  reconnectXenoTrialsTagV232(snapshot);
  assert.equal(snapshot.fighters[0], snapshot.tagV232.teams.player.members[0]);
  assert.deepEqual(snapshot.config.exhibitionV232.playerTeam[0], { id: 'warrior', variant: null });
  assert.equal(match.fighters, fighters);
});

test('manual relay has a vulnerable windup and recovery, fixed floor pivot, and member resources', () => {
  const match = create(), fighters = match.fighters, first = fighters[0], bench = own(match).members[1];
  first.hp = 111; first.stamina = 39; first.superMeterV148 = 43;
  bench.hp = 117; bench.stamina = 56; bench.superMeterV148 = 21;
  const x = first.x, enemyX = fighters[1].x;
  advance(match, 1, { tag: true, light: true });
  assert.equal(own(match).activeIndex, 0); assert.equal(first.guard, false); assert.equal(first.attack, null);
  assert.equal(own(match).transition.stage, 'out');
  until(match, () => own(match).activeIndex === 1, 60, { tag: true, light: true });
  assert.equal(match.fighters, fighters); assert.equal(fighters[0], bench);
  assert.equal(bench.x, x); assert.equal(bench.y, 0); assert.equal(fighters[1].x, enemyX);
  assert.equal(first.hp, 111); assert.equal(first.stamina, 39); assert.equal(first.superMeterV148, 43);
  assert.equal(bench.hp, 117); assert.equal(bench.stamina, 56); assert.equal(bench.superMeterV148, 21);
  assert.equal(own(match).transition.stage, 'in');
  advance(match, 40, { tag: true, light: true });
  assert.equal(bench.attack, null, 'held offensive input must be released after the relay');
  advance(match, 1, {}); advance(match, 1, { light: true }); assert.equal(bench.attack?.kind, 'light');
});

test('cooldown expiry and held tag do not synthesize another press', () => {
  const match = create();
  advance(match, XENO_TRIALS_TAG_V232.cooldownTicks + 100, { tag: true });
  assert.equal(own(match).changes, 1); assert.equal(own(match).activeIndex, 1);
  advance(match, 1, {}); advance(match, 60, { tag: true });
  assert.equal(own(match).changes, 2); assert.equal(own(match).activeIndex, 0);
});

test('guard, stun, attacks, jump, traversal, parry and grapples reject a relay', () => {
  const setups = [f => { f.guard = true; }, f => { f.stun = .5; }, f => { f.y = 20; f.vy = 50; },
    f => { f.attack = { kind: 'light', age: 0, facing: 1, id: 1 }; },
    f => { f.movementV210 = { kind: 'ground-turn', tick: 1, direction: -1 }; },
    f => { f.parryV208 = { held: true, rearm: false, started: 1, readyTick: 50, openingId: 0 }; }];
  for (const setup of setups) {
    const match = create(); setup(match.fighters[0]); advance(match, 1, { tag: true });
    assert.equal(own(match).transition, null); assert.equal(own(match).changes, 0);
  }
  const match = create(); match.grappleV153 = { attacker: 'player', target: 'opponent', bornTick: 0,
    expiresTick: 999, nextDamageTick: 999, attackerX: 310, targetX: 690, escapeProgress: 0 };
  advance(match, 1, { tag: true }); assert.equal(own(match).changes, 0);
});

test('a larger reserve cannot push or cross the opponent through a manual relay', () => {
  const match = create({ exhibitionV232: { ...teamConfig, playerTeam: [{ id: 'runner' }, { id: 'queen' }] } });
  const [a, b] = match.fighters; a.x = 400; b.x = 401; resolveXenoTrialsBodiesV105(a, b);
  const before = [a.x, b.x]; advance(match, 1, { tag: true });
  assert.equal(own(match).transition, null); assert.deepEqual([a.x, b.x], before);
  assert.equal(getXenoTrialsTagViewV232(match).teams.player.status, 'space');
});

test('a native hit interrupts the vulnerable outgoing member without granting a free switch', () => {
  const match = create(); advance(match, 1, { tag: true });
  const a = match.fighters[0], b = match.fighters[1], body = getXenoTrialsBodyBoundsV105(a), before = a.hp;
  match.projectiles.push({ id: ++match.serial, owner: 'opponent', ownerMemberV232: b.instanceIdV232,
    x: body.right + 2, y: body.height / 2, direction: -1, life: 1,
    spec: { damage: 9, stun: .2, push: 0 }, power: 1 });
  advance(match, 1, { tag: true });
  assert.equal(a.hp, before - 9); assert.equal(own(match).transition, null);
  assert.equal(own(match).activeIndex, 0); assert.ok(own(match).cooldown > 0);
});

test('automatic KO relay preserves the reserve and defeats a side only after both deaths', () => {
  const match = create({ roundsToWin: 1 }), first = match.fighters[0], reserve = own(match).members[1];
  reserve.hp = 47; reserve.stamina = 62; first.hp = 0;
  advance(match, 1); assert.equal(own(match).activeIndex, 1); assert.equal(match.phase, 'active');
  assert.equal(match.fighters[0].hp, 47); assert.equal(match.fighters[0].stamina, 62);
  assert.equal(own(match).automaticChanges, 1);
  reserve.hp = 0; advance(match, 1);
  assert.equal(match.phase, 'match-over'); assert.equal(match.result.winner, 'opponent');
  assert.equal(match.result.exhibitionV232.mode, 'tag'); assert.equal(match.config.activityV119, undefined);
});

test('simultaneous knockout relays both surviving reserves on the same native step', () => {
  const match = create(); match.fighters.forEach(fighter => { fighter.hp = 0; }); advance(match, 1);
  assert.equal(own(match).activeIndex, 1); assert.equal(match.tagV232.teams.opponent.activeIndex, 1);
  assert.equal(match.phase, 'active'); assert.equal(match.fighters.length, 2);
});

test('timeout compares total team health rather than the active duel alone', () => {
  const match = create({ roundsToWin: 1 });
  own(match).members.forEach((member, index) => { member.hp = getXenoTrialsFighterV96(member.id).hp * (index ? 1 : .1); });
  match.tagV232.teams.opponent.members.forEach((member, index) => { member.hp = getXenoTrialsFighterV96(member.id).hp * (index ? .01 : .8); });
  match.timeRemaining = .001; advance(match, 1);
  assert.equal(match.result.reason, 'time'); assert.equal(match.result.winner, 'player');
});

test('next round resets all members while preserving their own meter, stats and release gates', () => {
  const match = create(), fighters = match.fighters, old = own(match).members;
  old[0].stats.damage = 41; old[1].stats.damage = 63; old[0].superMeterV148 = 33; old[1].superMeterV148 = 51;
  advance(match, 60, { tag: true, heavy: true });
  own(match).members.forEach(member => { member.hp = 0; }); advance(match, 1, { tag: true, heavy: true });
  assert.equal(match.phase, 'round-over'); assert.equal(nextXenoTrialsRoundV96(match), true);
  assert.equal(match.fighters, fighters); assert.equal(own(match).activeIndex, 0); assert.equal(own(match).cooldown, 0);
  own(match).members.forEach((member, index) => {
    assert.equal(member.hp, getXenoTrialsFighterV96(member.id).hp);
    assert.equal(member.stamina, getXenoTrialsFighterV96(member.id).stamina);
    assert.equal(member.stats.damage, index ? 63 : 41); assert.equal(member.superMeterV148, index ? 51 : 33);
  });
  advance(match, 1, { tag: true, heavy: true }); assert.equal(own(match).transition, null); assert.equal(match.fighters[0].attack, null);
  advance(match, 1, {}); advance(match, 1, { tag: true }); assert.ok(own(match).transition);
});

test('pause and intro require a physical release of held tag', () => {
  const intro = create({ introSeconds: .1 }); advance(intro, 30, { tag: true }); assert.equal(own(intro).changes, 0);
  advance(intro, 1, {}); advance(intro, 60, { tag: true }); assert.equal(own(intro).changes, 1);
  const match = create(); advance(match, 1, { tag: true }); setXenoTrialsPausedV96(match, true);
  const tick = match.tick; advance(match, 30, { tag: true }); assert.equal(match.tick, tick);
  releaseXenoTrialsControlsV150(match, 'player', {}); setXenoTrialsPausedV96(match, false);
  advance(match, 60, {}); assert.equal(own(match).changes, 1);
});

test('member-owned projectiles and acid are retired on relay with no inherited damage credit', () => {
  const match = create(); advance(match, 1, { tag: true });
  const id = match.fighters[0].instanceIdV232;
  match.projectiles.push({ id: ++match.serial, owner: 'player', ownerMemberV232: id, x: -600, y: 700,
    direction: 1, vx: 0, life: 10, spec: { damage: 99, stun: 0, push: 0 }, power: 1 });
  match.acidPoolsV152 = [{ id: ++match.serial, owner: 'player', ownerMemberV232: id,
    x: -500, left: -520, right: -480, height: 6, bornTick: 1, armedTick: 999, expiresTick: 9999 }];
  until(match, () => own(match).activeIndex === 1, 60, { tag: true });
  assert.equal(match.projectiles.length, 0); assert.equal(match.acidPoolsV152.length, 0);
  assert.equal(own(match).members[1].stats.damage, 0);
});

test('CPU remembers each member brain and makes the same low-health relay decision', () => {
  const run = () => {
    const match = create({ exhibitionV232: { ...teamConfig, controls: 'cpu' } });
    match.fighters[1].hp = 12; match.fighters[0].x = -500; match.fighters[1].x = 1000;
    advance(match, 180, {}, null); return match;
  };
  const a = run(), b = run(); assert.deepEqual(a, b);
  assert.equal(a.tagV232.teams.opponent.activeIndex, 1);
  assert.ok(a.tagV232.teams.opponent.brains[0].decisions > 0);
  assert.equal(a.opponentInputSourceV163, 'cpu');
});

test('legacy snapshots remain byte-identical to the V231 baseline combat traces', () => {
  const fixtures = [
    [{}, '221e69f6d1dd97f8d4e926749a8735c29cb2940c3013f231c825e2e85255b0d5'],
    [{ playerId: 'synth-trooper', opponentId: 'warrior', seed: 666 }, 'e20997bdb8c55d21ea8148e1828a1baa435695ad4bf6efe29516bd72a8b4b653'],
    [{ playerId: 'prowler', opponentId: 'import-game-dd-guardian', seed: 218 }, '3d5493cef275dd0eafe860f7c93b219c6d79a195a6456dc661e1ea8246b101e1']
  ];
  for (const [config, expected] of fixtures) {
    const match = createXenoTrialsMatchV96({ ...config, introSeconds: 0 });
    for (let tick = 0; tick < 1200; tick++) stepXenoTrialsMatchV96(match, 1 / 120, {
      right: tick < 90, light: tick % 91 < 4, heavy: tick % 137 < 4, special: tick % 239 < 4, guard: tick % 47 < 9 });
    assert.equal(createHash('sha256').update(JSON.stringify(match)).digest('hex'), expected);
    assert.equal(match.tagV232, undefined); assert.equal(match.config.exhibitionV232, undefined);
  }
});

test('fixed-step team simulation remains identical at 30, 60 and 120 render calls per second', () => {
  const run = hz => {
    const match = create({ exhibitionV232: { ...teamConfig, controls: 'cpu' } });
    for (let frame = 0; frame < hz * 8; frame++) {
      const second = Math.floor(frame / hz);
      stepXenoTrialsMatchV96(match, 1 / hz, { tag: second === 1 || second === 6,
        light: second === 3, right: second === 4 });
    }
    return getXenoTrialsSnapshotV96(match);
  };
  assert.deepEqual(run(30), run(60)); assert.deepEqual(run(60), run(120));
});
