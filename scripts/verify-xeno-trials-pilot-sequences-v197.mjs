import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import {
  createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, nextXenoTrialsRoundV96, stepXenoTrialsMatchV96
} from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsPhysicalScaleV119 } from '../src/xeno-trials-physical-scale-v119.js';
import { createXenoTrialsPilotOutroV197, getXenoTrialsPilotSequenceV197 } from '../src/xeno-trials-pilot-sequences-v197.js';
import {
  beginXenoTrialsV96, createXenoTrialsProgressV96, settleXenoTrialsV96, unlockXenoTrialsFighterV96
} from '../src/xeno-trials-progress-v96.js';
import { drawXenoTrialsRigV154, getXenoTrialsRigV154 } from '../src/xeno-trials-rig-v154.js';
import {
  advanceXenoTrialsOutroV155, createXenoTrialsOutroV155, getXenoTrialsSequenceV155, skipXenoTrialsOutroV155
} from '../src/xeno-trials-sequences-v155.js';

const plan = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/progress-v149.json', import.meta.url)));
const pilots = plan.fighters.filter(fighter => fighter.super).map(fighter => fighter.id);
const rigFor = id => getXenoTrialsRigV154(getXenoTrialsFighterV96(id), getXenoTrialsArtV96(id));
const specification = { introSeconds: 0, holdRoundTransition: true, rulesV119: { initialHp: 1 } };
const absent = () => {};
const ctx = new Proxy({}, { get: () => absent });
const imageFor = rig => ({ naturalWidth: rig.sourceWidth, naturalHeight: rig.sourceHeight, complete: true });

// Both sides use normal engine inputs. No actor, position, health, time or
// verdict is assigned to obtain an actual two-round KO and normal settlement.
function winRound(match, jumpFrame = -1) {
  for (let frame = 0; frame < 240 && match.phase === 'active'; frame++) {
    stepXenoTrialsMatchV96(match, 1 / 60, { special: frame % 90 === 0 }, { jump: frame === jumpFrame });
  }
  assert.equal(match.roundWinner, 'player');
  assert.equal(match.roundReason, 'ko');
  assert.equal(match.fighters[1].hp, 0);
}

test('a legal mid-air KO settles only the visible body before the next round and after the verdict', () => {
  const id = 'import-game-afe2-harbinger', rig = rigFor(id), metrics = getXenoTrialsPhysicalScaleV119(id);
  const match = createXenoTrialsMatchV96({ playerId: 'spitter', opponentId: id, ...specification });
  winRound(match, 25);
  const first = match.fighters[1];
  const firstHeight = first.y;
  assert.ok(firstHeight > 0);
  const reducedRecovery = getXenoTrialsPilotSequenceV197(rig, match, first, null, null, true);
  assert.equal(reducedRecovery.clip, 'round-loss');
  assert.equal(reducedRecovery.contactV197, undefined);
  assert.equal(first.y, firstHeight);
  assert.equal(nextXenoTrialsRoundV96(match), true);
  assert.equal(match.fighters[1].y, 0);

  winRound(match, 25);
  const loser = match.fighters[1], before = getXenoTrialsSnapshotV96(match);
  assert.ok(loser.y > 0);
  const outro = skipXenoTrialsOutroV155(createXenoTrialsPilotOutroV197(match));
  const pose = getXenoTrialsPilotSequenceV197(rig, match, loser, null, outro);
  assert.equal(pose.contactV197.phase, 'settled');
  const sourceY = pose.contactV197.sourcePoint[1];
  const renderedContactY = 450 - loser.y + (sourceY - metrics.bottom * rig.sourceHeight) * metrics.height / rig.sourceHeight;
  assert.ok(Math.abs(renderedContactY - 450) < 1e-7);
  assert.ok(drawXenoTrialsRigV154(ctx, rig, imageFor(rig), pose, metrics, loser.x, 450 - loser.y, loser.facing));
  assert.deepEqual(getXenoTrialsSnapshotV96(match), before);
});

const modes = new Set();
for (const id of pilots) {
  test(`${id}: measured presentation, recoverable R1 and anatomy-specific terminal KO on real source plate`, () => {
    const rig = rigFor(id), metrics = getXenoTrialsPhysicalScaleV119(id);
    assert.ok(rig, id);
    assert.equal(getXenoTrialsSequenceV155(rig, 'intro'), null);
    const unlocked = unlockXenoTrialsFighterV96({ ...createXenoTrialsProgressV96(), credits: 10000 }, 'spitter');
    assert.equal(unlocked.applied, true);
    const ticket = beginXenoTrialsV96(unlocked.state, { playerId: 'spitter', opponentId: id, ...specification });
    assert.equal(ticket.applied, true);
    const match = createXenoTrialsMatchV96({ ...ticket.config, ...specification });
    const fighter = match.fighters[1], image = imageFor(rig);
    const render = (frame, facing = 1) => drawXenoTrialsRigV154(ctx, rig, image, frame, metrics, 600, 450, facing);
    const intro = elapsedMs => getXenoTrialsPilotSequenceV197(rig, match, fighter,
      { blocksSimulation: true, elapsedMs, fighterSlot: 1 }, null);
    const first = getXenoTrialsSnapshotV96(match);
    for (const elapsed of [175, 380, 590, 930, 1100]) {
      const pose = intro(elapsed);
      assert.equal(pose?.sequenceIdV197, `${id}::intro::v197`);
      assert.ok(render(pose, 1));
      assert.ok(render(pose, -1));
    }
    assert.equal(intro(0), null);
    assert.equal(intro(1200), null);
    assert.equal(getXenoTrialsPilotSequenceV197({ ...rig }, match, fighter, { blocksSimulation: true, elapsedMs: 380, fighterSlot: 1 }, null), null);
    assert.equal(getXenoTrialsPilotSequenceV197(rig, match, fighter, { blocksSimulation: true, elapsedMs: 380, fighterSlot: 0 }, null), null);
    assert.deepEqual(getXenoTrialsSnapshotV96(match), first);

    winRound(match);
    assert.equal(match.phase, 'round-over');
    stepXenoTrialsMatchV96(match, .25, {}, {});
    stepXenoTrialsMatchV96(match, .25, {}, {});
    const roundSnapshot = getXenoTrialsSnapshotV96(match);
    const recovering = getXenoTrialsPilotSequenceV197(rig, match, fighter, null, null);
    assert.equal(recovering?.clip, 'round-loss');
    assert.equal(recovering.terminalModeV197, undefined);
    assert.equal(createXenoTrialsPilotOutroV197(match), null);
    assert.ok(render(recovering));
    assert.deepEqual(getXenoTrialsSnapshotV96(match), roundSnapshot);
    assert.equal(nextXenoTrialsRoundV96(match), true);
    assert.equal(match.round, 2);
    assert.equal(match.fighters[1].hp, 1);
    assert.equal(getXenoTrialsPilotSequenceV197(rig, match, fighter, null, null), null, 'a previous-round fighter reference is stale');

    winRound(match);
    assert.equal(match.phase, 'match-over');
    const terminalFighter = match.fighters[1], terminalSnapshot = getXenoTrialsSnapshotV96(match);
    const normal = createXenoTrialsPilotOutroV197(match);
    assert.equal(normal.participants.length, 1);
    assert.equal(normal.participants[0].kind, 'outro-ko');
    const terminal = (outro, reduced = false) => getXenoTrialsPilotSequenceV197(rig, match, terminalFighter, null, outro, reduced);
    let playback = normal;
    for (let n = 0; n < 18; n++) {
      playback = advanceXenoTrialsOutroV155(playback, 100);
      const pose = terminal(playback);
      assert.equal(pose?.sequenceIdV197, `${id}::outro-ko::v197`);
      assert.ok(render(pose, n % 2 ? 1 : -1), 'bounded mesh retains native image through the fall');
    }
    assert.equal(playback.phase, 'complete');
    const down = terminal(playback);
    assert.ok(down.terminalModeV197);
    assert.equal(modes.has(down.terminalModeV197), false);
    modes.add(down.terminalModeV197);
    assert.equal(down.contactV197.phase, 'settled');
    assert.equal(down.contactV197.visualOnly, true);
    assert.equal(down.contactV197.sourcePoint[1], metrics.bottom * rig.sourceHeight);
    assert.deepEqual(terminal(skipXenoTrialsOutroV155(normal)).vertices, down.vertices);
    const reduced = createXenoTrialsPilotOutroV197(match, null, true);
    assert.equal(reduced.phase, 'complete');
    assert.deepEqual(terminal(reduced, true).vertices, down.vertices);
    assert.equal(advanceXenoTrialsOutroV155(playback, 100), playback);
    const paused = { ...normal, paused: true };
    assert.equal(advanceXenoTrialsOutroV155(paused, 100), paused);
    assert.equal(skipXenoTrialsOutroV155(paused), paused);
    assert.equal(terminal({ ...playback, terminalTick: match.tick + 1 }), null);
    assert.deepEqual(getXenoTrialsSnapshotV96(match), terminalSnapshot);
    const settlement = settleXenoTrialsV96(ticket.state, match.result);
    assert.equal(settlement.applied, true);
    assert.equal(settlement.state.ledger.length, 1);
    assert.equal(settleXenoTrialsV96(settlement.state, match.result).applied, false);
  });
}

test('legacy terminal timelines and non-KO verdicts keep their floor, contacts and result owners', () => {
  const id = pilots[0], historicalId = 'prowler', rig = rigFor(id);
  const match = createXenoTrialsMatchV96({ playerId: id, opponentId: historicalId, introSeconds: 0 });
  match.phase = 'match-over';
  match.result = { completed: true, winner: 'opponent', reason: 'time',
    matchId: match.config.matchId, durationTicks: match.tick };
  const historical = createXenoTrialsOutroV155(match), native = createXenoTrialsPilotOutroV197(match, historical);
  assert.deepEqual(native.participants[0], historical.participants[0]);
  assert.equal(native.participants[1].kind, 'outro-loss');
  const timePose = getXenoTrialsPilotSequenceV197(rig, match, match.fighters[0], null, { ...native, elapsedMs: 500 });
  assert.equal(timePose.clip, 'outro-loss');
  assert.equal(timePose.contactV197, undefined);
  assert.equal(timePose.terminalModeV197, undefined);
  match.result.reason = 'double-ko';
  assert.equal(createXenoTrialsPilotOutroV197(match, historical), historical);
  assert.equal(getXenoTrialsPilotSequenceV197(rig, match, match.fighters[0], null, native), null);
  match.result.reason = 'ko';
  match.result.durationTicks++;
  assert.equal(createXenoTrialsPilotOutroV197(match), null);
  assert.equal(pilots.length, 5);
});
