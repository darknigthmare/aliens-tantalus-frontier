import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96 as create, stepXenoTrialsMatchV96 as step,
  getXenoTrialsSnapshotV96 as snapshot, setXenoTrialsPausedV96 as pause,
  releaseXenoTrialsControlsV150 as release, XENO_TRIALS_STEP_V96 as DT } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 as body } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsFighterV96 as definition } from '../src/xeno-trials-data-v96.js';
import { normalizeXenoTrialsTeamV208 as normalize, getXenoTrialsTeamReadinessV208 as readiness,
  getXenoTrialsAssistActorsV208 as assists } from '../src/xeno-trials-team-v208.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';

const team = { mode: 'laboratory', playerIds: ['warrior', 'runner'], opponentIds: ['arachnoid', 'defender'] };
const config = { teamV208: team, seed: 208, introSeconds: 0, roundSeconds: 120 };
const fight = options => create({ ...config, ...options });
function advance(match, count, player = {}, opponent = {}) {
  for (let i = 0; i < count; i++) step(match, DT, player, opponent);
}
function contact(match, gap = 16) {
  const [player, opponent] = match.fighters;
  opponent.x += body(player).right + gap - body(opponent).left;
  return [player, opponent];
}
function shot(match, owner, target, damage = 20) {
  const box = body(target);
  match.projectiles.push({ id: ++match.serial, owner, x: box.left - 1, y: (box.top + box.bottom) / 2,
    direction: 1, life: 1, spec: { damage, push: 0, stun: .15 }, power: 1, style: 'pulse' });
}

test('team contract requires two valid distinct members per side and remains isolated from evaluations', () => {
  assert.deepEqual(normalize(team), team);
  for (const invalid of [null, { ...team, mode: 'ranked' }, { ...team, playerIds: ['warrior', 'warrior'] },
    { ...team, opponentIds: ['defender', 'missing'] }, { ...team, playerIds: ['runner'] }]) assert.equal(normalize(invalid), null);
  assert.throws(() => fight({ teamV208: { ...team, mode: 'ranked' } }));
  assert.throws(() => fight({ activityV119: { branch: 'on-demand', id: 'on-demand' } }));
  const match = fight();
  assert.equal(match.fighters.length, 2);
  assert.equal(match.teamV208.reserve.player.id, 'runner');
  assert.equal(match.config.roundsToWin, 1);
  const ordinary = create({ playerId: 'warrior', opponentId: 'runner' });
  assert.equal(ordinary.teamV208, undefined);
  assert.equal(ordinary.config.teamV208, undefined);
});

test('manual relay keeps each member health and stats and consumes native stamina', () => {
  const match = fight(), player = match.fighters[0], reserve = match.teamV208.reserve.player;
  player.hp = 46; player.stats.hits = 3; reserve.hp = 31; reserve.stamina = 42;
  const stamina = player.stamina;
  advance(match, 1, { tag: true });
  assert.equal(match.fighters[0], reserve);
  assert.equal(match.teamV208.reserve.player, player);
  assert.equal(reserve.hp, 31); assert.equal(player.hp, 46);
  assert.equal(player.stats.hits, 3); assert.equal(player.stamina, stamina - 12);
  assert.ok(reserve.stamina >= 42 && reserve.stamina < 43);
  assert.equal(match.teamV208.tags.player, 1);
  assert.equal(match.teamV208.tagCooldown.player, 480);
  assert.ok(reserve.stun > 0);
});

test('holding relay cannot retrigger after its cooldown; physical release rearms it', () => {
  const match = fight();
  advance(match, 520, { tag: true });
  assert.equal(match.teamV208.tags.player, 1);
  advance(match, 1); advance(match, 1, { tag: true });
  assert.equal(match.teamV208.tags.player, 2);
  assert.equal(match.fighters[0].id, 'warrior');
});

test('relay observes airborne, stun, attack, grapple, projectile and stamina gates', () => {
  for (const block of [m => { m.fighters[0].y = 10; }, m => { m.fighters[0].stun = .3; },
    m => { m.fighters[0].attack = {}; }, m => { m.grappleV153 = {}; },
    m => { m.projectiles.push({ owner: 'player' }); }, m => { m.fighters[0].stamina = 11; }]) {
    const match = fight(); block(match); assert.equal(readiness(match, 'player').tag, false);
  }
});

test('assistance approaches through the native engine, makes one real light contact, then withdraws', () => {
  const match = fight(), [player, target] = contact(match), hp = target.hp;
  const reserve = match.teamV208.reserve.player;
  advance(match, 1, { assist: true });
  assert.equal(assists(match)[0], reserve);
  advance(match, 155);
  assert.equal(reserve.stats.hits, 1);
  assert.ok(target.hp < hp);
  assert.equal(player.stats.hits, 0);
  advance(match, 2);
  assert.deepEqual(assists(match), []);
  assert.equal(match.teamV208.assists.player, 1);
  assert.equal(readiness(match, 'player').assist, false);
});

test('guard blocks the native assist contact and a remote target receives no automatic damage', () => {
  const guarded = fight(), [, target] = contact(guarded), hp = target.hp;
  advance(guarded, 1, { assist: true }, { guard: true });
  advance(guarded, 158, {}, { guard: true });
  assert.equal(target.stats.blocks, 1);
  assert.ok(hp - target.hp > 0 && hp - target.hp <= 3);
  const far = fight(); far.fighters[1].x = 930;
  const remoteHp = far.fighters[1].hp;
  advance(far, 1, { assist: true }); advance(far, 160);
  assert.equal(far.fighters[1].hp, remoteHp);
  assert.equal(far.teamV208.reserve.player.stats.hits, 0);
});

test('an exposed assistant receives a native projectile hit and keeps the damage on reserve', () => {
  const match = fight(); advance(match, 1, { assist: true });
  const reserve = match.teamV208.reserve.player, hp = reserve.hp;
  shot(match, 'opponent', reserve); advance(match, 1);
  assert.equal(reserve.hp, hp - 20);
  advance(match, 160);
  assert.equal(match.teamV208.reserve.player.hp, hp - 20);
});

test('a dead reserve cannot assist, relay or revive', () => {
  const match = fight(); match.teamV208.reserve.player.hp = 0;
  advance(match, 1, { tag: true, assist: true });
  assert.deepEqual(readiness(match, 'player'), { tag: false, assist: false });
  assert.equal(match.teamV208.reserve.player.hp, 0);
  assert.equal(match.teamV208.tags.player + match.teamV208.assists.player, 0);
});

test('native member KO relays a wounded partner before the team can lose', () => {
  const match = fight(), [player] = contact(match);
  player.hp = 1; match.teamV208.reserve.player.hp = 37;
  advance(match, 1, {}, { light: true }); advance(match, 50);
  assert.equal(match.fighters[0].id, 'runner'); assert.equal(match.fighters[0].hp, 37);
  assert.equal(match.result, null); assert.equal(match.teamV208.automaticRelays.player, 1);
  match.fighters[0].hp = 0; advance(match, 1);
  assert.equal(match.result.winner, 'opponent');
  assert.equal(match.result.teamV208.mode, 'laboratory');
});

test('timeout includes both team health fractions', () => {
  const match = fight();
  match.fighters[0].hp = definition(match.fighters[0].id).hp * .2;
  match.fighters[1].hp = definition(match.fighters[1].id).hp * .9;
  match.teamV208.reserve.opponent.hp = 0;
  match.timeRemaining = DT; advance(match, 1);
  assert.equal(match.result.reason, 'time');
  assert.equal(match.result.winner, 'player');
});

test('simultaneous elimination of both teams remains a draw', () => {
  const match = fight();
  for (const actor of [...match.fighters, ...Object.values(match.teamV208.reserve)]) actor.hp = 0;
  advance(match, 1);
  assert.equal(match.result.reason, 'double-ko'); assert.equal(match.result.winner, 'draw');
});

test('pause freezes reserve timers and requires release after a held relay', () => {
  const match = fight(); advance(match, 1, { tag: true }); pause(match, true);
  const frozen = snapshot(match); advance(match, 100, { tag: true });
  assert.deepEqual(snapshot(match), frozen);
  pause(match, false); advance(match, 520, { tag: true });
  assert.equal(match.teamV208.tags.player, 1);
  release(match, 'player', {}); advance(match, 1, { tag: true });
  assert.equal(match.teamV208.tags.player, 2);
});

test('fixed team simulation is identical at 30, 60 and 120 Hz', () => {
  const states = [30, 60, 120].map(hz => {
    const match = fight();
    for (let frame = 0; frame < hz * 6; frame++) {
      const t = frame / hz;
      step(match, 1 / hz, { tag: t >= .2 && t < .4, assist: t >= 1 && t < 1.2 }, {});
    }
    return snapshot(match);
  });
  assert.deepEqual(states[0], states[1]); assert.deepEqual(states[1], states[2]);
});

test('CPU relay follows visible health and finite deterministic decision ticks', () => {
  const match = fight(); match.fighters[1].hp = 10;
  advance(match, 125, {}, null);
  assert.equal(match.teamV208.tags.opponent, 1);
  assert.equal(match.fighters[1].id, 'defender');
  assert.equal(match.teamV208.reserve.opponent.hp, 10);
});

test('acid cadence is independent for the lead and the exposed partner', () => {
  const match = fight(); advance(match, 1, { assist: true });
  const player = match.fighters[0], reserve = match.teamV208.reserve.player;
  const hp = [player.hp, reserve.hp];
  match.acidPoolsV152 = [{ id: ++match.serial, owner: 'opponent', x: 500,
    left: 0, right: 1000, height: 6, bornTick: 0, armedTick: 0, expiresTick: 400 }];
  advance(match, 1);
  assert.deepEqual([player.hp, reserve.hp], hp.map(value => value - 4));
  advance(match, 10);
  assert.deepEqual([player.hp, reserve.hp], hp.map(value => value - 4));
});

test('a projectile keeps the original member attribution after an automatic relay', () => {
  const match = fight(), shooter = match.fighters[0], target = match.fighters[1];
  shot(match, 'player', target);
  const projectile = match.projectiles[0];
  projectile.ownerMemberV208 = shooter.teamSlotV208;
  projectile.x = body(target).left - 40;
  shooter.hp = 0; advance(match, 1);
  assert.equal(match.fighters[0].id, 'runner');
  advance(match, 20);
  assert.equal(shooter.stats.hits, 1);
  assert.equal(match.fighters[0].stats.hits, 0);
});

function browserHost(options = {}) {
  function target(extra = {}) {
    const listeners = new Map();
    return Object.assign({ addEventListener(t, f) { if (!listeners.has(t)) listeners.set(t, new Set()); listeners.get(t).add(f); },
      removeEventListener(t, f) { listeners.get(t)?.delete(f); },
      emit(t, event = {}) { for (const f of [...(listeners.get(t) || [])]) f({ preventDefault() {}, stopPropagation() {}, ...event }); } }, extra);
  }
  const win = target(), doc = target({ hidden: false, hasFocus: () => true });
  const ctx = new Proxy({ measureText: value => ({ width: String(value).length * 8 }),
    createLinearGradient: () => ({ addColorStop() {} }) }, { get: (object, key) => object[key] ?? (() => {}) });
  const canvas = target({ tagName: 'CANVAS', width: 1000, height: 560, setAttribute() {},
    getContext: () => ctx, focus() { doc.activeElement = this; }, closest: () => null });
  const queue = new Map(); let serial = 0, time = 0;
  const runtime = createXenoTrialsRuntimeV96({ canvas, window: win, document: doc, config,
    loadImage: async () => ({ naturalWidth: 1024, naturalHeight: 1024 }),
    requestAnimationFrame: callback => { queue.set(++serial, callback); return serial; },
    cancelAnimationFrame: id => queue.delete(id), ...options });
  const frame = (count = 1) => { for (let i = 0; i < count; i++) { time += 1000 / 120;
    const callbacks = [...queue.values()]; queue.clear(); callbacks.forEach(callback => callback(time)); } };
  return { runtime, frame, key: (code, type = 'keydown') => win.emit(type, { target: canvas, code }),
    async start() { assert.equal(await runtime.start(), true);
      for (let i = 0; i < 1200 && runtime.getState().presentation.blocksSimulation; i++) frame(); frame(); } };
}

test('runtime binds R and H and keeps a laboratory out of resumable checkpoints', async () => {
  let checkpoints = 0;
  const h = browserHost({ onCheckpoint() { checkpoints++; } });
  await h.start();
  h.key('KeyR'); h.frame(); h.key('KeyR', 'keyup');
  assert.equal(h.runtime.getState().fighters[0].id, 'runner');
  h.frame(30); h.key('KeyH'); h.frame(); h.key('KeyH', 'keyup');
  assert.equal(h.runtime.getState().teamV208.assists.player, 1);
  h.frame(650); h.runtime.saveCheckpoint(); h.runtime.stop();
  assert.equal(checkpoints, 0);
});
