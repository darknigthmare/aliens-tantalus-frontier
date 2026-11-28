import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsDuelCheckpointV197, normalizeXenoTrialsDuelCheckpointV197 } from '../src/xeno-trials-duel-checkpoint-v197.js';
import { getXenoTrialsSnapshotV96, setXenoTrialsPausedV96, stepXenoTrialsMatchV96,
  XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsUnlockCostV96 } from '../src/xeno-trials-progress-v96.js';
import { XENO_TRIALS_RECRUITS_V230 } from '../src/xeno-trials-recruits-v230.js';

// These synthetic matches were generated and admitted by the native V230
// engine from a git archive. Keep the source receipts byte-identical.
const baseline = '012fc8237fef4dbc81c9649719db1fe2fdc3e08e';
const directory = new URL('../docs/forge/xeno-trials/', import.meta.url);
const striker = 'mire-v210-striker';
const recruitFile = 'recruit-checkpoints-v230.json';
const strikerFile = 'striker-active-checkpoints-v230.json';
const fixtures = new Map([
  [recruitFile, 'd4069116dfadccc7e71b159e1c0afb19d7d478c7eac3a0034d87138c3971000b'],
  [strikerFile, '28fdbb32f4ef7b69593fbc17ac099314d60f643647146aa2c5c4e9e3b6d8513e'],
].map(([file, sha256]) => [file, { bytes: readFileSync(new URL(file, directory)), sha256 }]));

function replay(ticket, checkpoint, label) {
  const original = checkpoint.snapshot;
  const loaded = normalizeXenoTrialsDuelCheckpointV197(checkpoint, ticket);
  assert.ok(loaded, label);
  assert.deepEqual(loaded, checkpoint, label);

  const states = [0, 1].map(() => {
    const match = structuredClone(loaded.snapshot);
    assert.equal(setXenoTrialsPausedV96(match, false), true, label);
    for (let tick = 0; tick < 90; tick++) stepXenoTrialsMatchV96(match, dt, {}, null);
    const reparked = createXenoTrialsDuelCheckpointV197(getXenoTrialsSnapshotV96(match), ticket);
    assert.ok(reparked, label);
    assert.equal(reparked.matchId, checkpoint.matchId, label);
    assert.equal(reparked.tick, checkpoint.tick + 90, label);
    return reparked.snapshot;
  });
  const [after, repeated] = states;
  assert.deepEqual(after, repeated, label);
  for (const [index, fighter] of after.fighters.entries()) {
    const previous = original.fighters[index];
    const previousOther = original.fighters[1 - index], other = after.fighters[1 - index];
    assert.equal(fighter.id, previous.id, label);
    assert.equal(fighter.hp, previous.hp - (other.stats.damage - previousOther.stats.damage), label);
  }
  assert.deepEqual(loaded.snapshot, original, label);
  return after;
}

test('native V230 checkpoint fixture bytes match the two pinned source receipts', () => {
  for (const [file, { bytes, sha256 }] of fixtures) {
    assert.equal(createHash('sha256').update(bytes).digest('hex'), sha256, `${baseline} ${file}`);
  }
});

test('all thirteen former MIRE profiles and Striker in the other seat resume their V230 tickets', () => {
  const entries = JSON.parse(fixtures.get(recruitFile).bytes);
  const expected = [...XENO_TRIALS_RECRUITS_V230.map(fighter => [fighter.id, 'queen']), ['queen', striker]];
  assert.equal(expected.length, 14);
  assert.deepEqual(entries.map(({ ticket }) => [ticket.playerId, ticket.opponentId]), expected);
  assert.deepEqual(XENO_TRIALS_RECRUITS_V230.map(fighter => getXenoTrialsUnlockCostV96(fighter.id)),
    [300, 300, 300, 180, 600, 900, 900, 900, 900, 300, 180, 300, 300]);
  for (const { ticket, checkpoint } of entries) {
    const label = `${ticket.playerId} vs ${ticket.opponentId}`;
    assert.equal(checkpoint.tick, 1, label);
    for (const fighter of checkpoint.snapshot.fighters) {
      assert.equal(fighter.hp, getXenoTrialsFighterV96(fighter.id).hp, label);
      if (XENO_TRIALS_RECRUITS_V230.some(recruit => recruit.id === fighter.id)) assert.equal(fighter.superMeterV148, undefined, label);
    }
    replay(ticket, checkpoint, label);
  }
});

test('six V230 Striker commitments resume without a second charge or resolved impact', () => {
  const entries = JSON.parse(fixtures.get(strikerFile).bytes);
  const expected = [
    ['signature2', 1, 'signature-2', false, 0],
    ['signature2', 27, 'signature-2', true, 29],
    ['signature3', 1, 'signature-3', false, 0],
    ['signature3', 34, 'signature-3', true, 33],
    ['special', 1, 'special', false, 0],
    ['special', 42, 'special', true, 35],
  ];
  assert.equal(entries.length, expected.length);
  assert.equal(getXenoTrialsFighterV96(striker).hp, 185);
  assert.equal(getXenoTrialsUnlockCostV96(striker), 300);
  for (const [index, { ticket, checkpoint, control, frames }] of entries.entries()) {
    const [historicControl, historicFrames, kind, hit, damage] = expected[index];
    const label = `${striker} ${control} at tick ${frames}`;
    assert.deepEqual([control, frames, checkpoint.tick], [historicControl, historicFrames, historicFrames], label);
    assert.equal(ticket.playerId, striker, label);
    const [previous, previousTarget] = checkpoint.snapshot.fighters;
    assert.equal(previous.attack.kind, kind, label);
    assert.equal(previous.attack.hit, hit, label);
    assert.equal(previous.stats.damage, damage, label);
    assert.equal(previous.stats.specials, 1, label);

    const receipts = events => events.filter(event => event.side === 'player' && event.type === 'attack');
    const resumed = replay(ticket, checkpoint, label);
    const [fighter, target] = resumed.fighters;
    assert.equal(fighter.stats.specials, previous.stats.specials, label);
    assert.ok(fighter.stamina >= previous.stamina, label);
    assert.equal(receipts(checkpoint.snapshot.events).length, 1, label);
    assert.deepEqual(receipts(resumed.events), receipts(checkpoint.snapshot.events), label);
    if (hit) {
      assert.equal(fighter.stats.hits, previous.stats.hits, label);
      assert.equal(target.hp, previousTarget.hp, label);
    }
  }
});
