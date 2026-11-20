import test from 'node:test';
import assert from 'node:assert/strict';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, restoreXenoTrialsHordeMatchV180,
  setXenoTrialsPausedV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsHordeViewV180 } from '../src/xeno-trials-horde-ui-v180.js';
import { drawXenoTrialsReinforcementV201, getXenoTrialsReinforcementV201 } from '../src/xeno-trials-reinforcements-v201.js';
import { autoTranslateV185, useCatalogV185 } from '../src/i18n-auto-v185.js';
import { EN_CATALOG_V185, EN_PATTERNS_V185 } from '../src/i18n-en-catalog-v185.js';
import { setLanguageV185 } from '../src/i18n-v185.js';

const create = (protocol = 'xth180-incoming-1', extra = {}) => createXenoTrialsMatchV96({
  playerId: 'warrior', seed: 180, introSeconds: 0, activityV119: { branch: 'horde', id: protocol }, ...extra
});
const advance = (match, count, player = {}, cpu = {}) => {
  for (let i = 0; i < count; i++) stepXenoTrialsMatchV96(match, 1 / 120, player, cpu);
};
const nearestControls = match => {
  const [player, ...enemies] = match.fighters;
  const nearest = enemies.sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
  return { left: nearest?.x < player.x, right: nearest?.x > player.x,
    heavy: match.tick % 180 === 0, light: match.tick % 180 === 90 };
};
function playToIntermission() {
  const match = create();
  while (match.tick < 3600 && match.hordeV180.phase !== 'intermission' && !match.result) {
    advance(match, 1, nearestControls(match), null);
  }
  assert.equal(match.hordeV180.phase, 'intermission');
  assert.equal(match.hordeV180.totalKills, 5);
  return match;
}

test('the next-wave cue follows real damage, the durable intermission tick and the actual spawn batch', () => {
  const match = playToIntermission();
  const before = getXenoTrialsReinforcementV201(match);
  assert.deepEqual(before, { kind: 'wave', phase: 'incoming', wave: 2, arrivalTick: match.hordeV180.nextWaveTick,
    remainingTicks: 120, contacts: 4, major: false, label: 'RENFORTS EN APPROCHE · VAGUE 2 / 2 · 1 s' });
  assert.equal(match.fighters.length, 1);
  assert.deepEqual(getXenoTrialsHordeViewV180(match).reinforcement, before);
  assert.match(getXenoTrialsHordeViewV180(match).announcement, /Vague 2 sur 2/);

  assert.equal(setXenoTrialsPausedV96(match, true), true);
  advance(match, 75);
  assert.deepEqual(getXenoTrialsReinforcementV201(match), before);
  assert.equal(getXenoTrialsHordeViewV180(match).reinforcement, null);
  const restored = restoreXenoTrialsHordeMatchV180(getXenoTrialsSnapshotV96(match));
  assert.ok(restored?.paused);
  assert.deepEqual(getXenoTrialsReinforcementV201(restored), before);
  assert.equal(setXenoTrialsPausedV96(restored, false), true);
  advance(restored, 119);
  assert.equal(restored.fighters.length, 1);
  assert.equal(getXenoTrialsReinforcementV201(restored).remainingTicks, 1);
  advance(restored, 1);
  const onArrival = getXenoTrialsReinforcementV201(restored);
  assert.equal(onArrival.phase, 'arrived');
  assert.equal(onArrival.arrivalTick, restored.tick);
  const spawned = restored.fighters.filter(fighter => fighter.spawnTickV180 === restored.tick);
  assert.equal(spawned.length, onArrival.contacts);
  assert.ok(spawned.every(fighter => fighter.hp > 0 && fighter.hp <= 35));
  advance(restored, 48);
  assert.equal(getXenoTrialsReinforcementV201(restored), null);
});

test('a replacement forecast requires a vacant place and remaining reserve and hits the actual replacement tick', () => {
  const match = create();
  const [player, target] = match.fighters;
  // Spatial fixture and neutral CPU. The heavy attack and the death are native.
  player.x = 0;
  target.facing = -1;
  target.x = getXenoTrialsBodyBoundsV105(player).right + target.x - getXenoTrialsBodyBoundsV105(target).left + 5;
  assert.equal(getXenoTrialsReinforcementV201(match), null, 'the three live initial actors already occupy the cap');
  while (match.tick < 71 && !match.hordeV180.totalKills) advance(match, 1, { heavy: true });
  assert.equal(match.hordeV180.totalKills, 1);
  assert.equal(player.stats.hits, 1);
  const before = getXenoTrialsReinforcementV201(match);
  assert.equal(before?.kind, 'replacement');
  assert.equal(before.phase, 'incoming');
  assert.equal(before.contacts, 1);
  const noReserve = { ...match, hordeV180: { ...match.hordeV180, remaining: 0 } };
  assert.equal(getXenoTrialsReinforcementV201(noReserve), null);
  advance(match, before.remainingTicks - 1);
  assert.equal(match.hordeV180.alive, 2);
  assert.equal(getXenoTrialsReinforcementV201(match).remainingTicks, 1);
  advance(match, 1);
  const arrived = getXenoTrialsReinforcementV201(match);
  assert.equal(arrived.phase, 'arrived');
  assert.equal(arrived.arrivalTick, before.arrivalTick);
  assert.equal(match.fighters.find(fighter => fighter.spawnTickV180 === arrived.arrivalTick)?.maxHpV180, 15);
  assert.equal(match.hordeV180.alive, 3);
  advance(match, 30);
  assert.equal(getXenoTrialsReinforcementV201(match), null);
});

test('the boss finale lights signal the real major slot and operation stages reuse the same director', () => {
  const boss = create('xth186-incoming-1');
  // Clear troops with a declared health fixture to reach the canonical boss
  // slot quickly. The director owns all intermissions and the boss spawn.
  while (boss.tick < 1200 && boss.hordeV180.wavesCleared < 2) {
    for (const enemy of boss.fighters.slice(1)) enemy.hp = 0;
    advance(boss, 1);
  }
  const pending = getXenoTrialsReinforcementV201(boss);
  assert.equal(pending.phase, 'incoming');
  assert.equal(pending.major, true);
  assert.equal(pending.contacts, 3);
  advance(boss, pending.remainingTicks);
  const arrived = getXenoTrialsReinforcementV201(boss);
  assert.equal(arrived.major, true);
  assert.equal(arrived.phase, 'arrived');
  assert.equal(boss.fighters.filter(fighter => fighter.enemyRankV186 === 'boss' && fighter.spawnTickV180 === arrived.arrivalTick).length, 1);

  const operation = create(null, { activityV119: { branch: 'operations', id: 'xto188-escort-1' } });
  assert.ok(operation.operationV188);
  while (operation.tick < 500 && operation.hordeV180.phase !== 'intermission') {
    for (const enemy of operation.fighters.slice(1)) enemy.hp = 0;
    advance(operation, 1);
  }
  assert.equal(getXenoTrialsHordeViewV180(operation).reinforcement?.phase, 'incoming');
  assert.equal(getXenoTrialsReinforcementV201({ ...operation, result: { winner: 'player' } }), null);
});

test('the rear clip, two parallax depths and reduced-motion shutter stay independent of combat state', () => {
  const match = playToIntermission();
  const makeCanvas = () => {
    const calls = [];
    return { calls, context: new Proxy({}, { get: (_target, method) => (...args) => calls.push([method, ...args]) }) };
  };
  const initial = getXenoTrialsSnapshotV96(match);
  const center = { center: 500, floor: 450 }, panned = { center: 600, floor: 450 };
  const normal = makeCanvas(), turned = makeCanvas();
  const a = drawXenoTrialsReinforcementV201(normal.context, match, center);
  const b = drawXenoTrialsReinforcementV201(turned.context, match, panned);
  assert.deepEqual(b.fixtures.map((x, index) => a.fixtures[index] - x), [24, 24]);
  assert.deepEqual(b.windows.map((x, index) => a.windows[index] - x), [12, 12]);
  assert.ok(normal.calls.some(([method, x, y, w, h]) => method === 'rect' && [x, y, w, h].join(',') === '0,0,1000,342'));
  assert.ok(a.clipBottom < center.floor);
  assert.ok(normal.calls.some(([method]) => method === 'fill')); // projected dual beam
  assert.ok(normal.calls.filter(([method]) => method === 'strokeRect').length === 2);
  assert.deepEqual(getXenoTrialsSnapshotV96(match), initial);

  const stillA = makeCanvas(), stillB = makeCanvas(), next = makeCanvas();
  const stationary = drawXenoTrialsReinforcementV201(stillA.context, match, center, true);
  advance(match, 60);
  const moving = drawXenoTrialsReinforcementV201(next.context, match, center);
  const unchanged = drawXenoTrialsReinforcementV201(stillB.context, match, center, true);
  assert.equal(unchanged.remainingTicks, 60);
  assert.equal(stationary.opening, unchanged.opening);
  assert.deepEqual(stillB.calls, stillA.calls);
  assert.ok(moving.opening > a.opening);
  assert.equal(drawXenoTrialsReinforcementV201(makeCanvas().context, { ...match, phase: 'match-over' }, center), null);
  assert.equal(drawXenoTrialsReinforcementV201(makeCanvas().context, { ...match, presentation: { blocksSimulation: true } }, center), null);
  assert.equal(drawXenoTrialsReinforcementV201(makeCanvas().context, create(null, { activityV119: undefined }), center), null);
});

test('visible reinforcement labels translate through the production French and English dispatch', () => {
  const label = getXenoTrialsReinforcementV201(playToIntermission()).label;
  assert.equal(autoTranslateV185(label), label);
  useCatalogV185({ EN_CATALOG_V185, EN_PATTERNS_V185 });
  setLanguageV185('en', { document: null, persist: false });
  try { assert.equal(autoTranslateV185(label), 'REINFORCEMENTS INCOMING · WAVE 2 / 2 · 1 s'); }
  finally { setLanguageV185('fr', { document: null, persist: false }); }
});
