import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getXenoTrialsFighterV96 as definition, XENO_TRIALS_FIGHTERS_V96 as roster } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96 as create, getXenoTrialsSnapshotV96 as snapshot,
  restoreXenoTrialsHordeMatchV180, setXenoTrialsPausedV96 as pause, stepXenoTrialsMatchV96 as step,
  XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 as body } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsCaptureViewV163 } from '../src/xeno-trials-capture-v163.js';
import { getXenoTrialsGrappleViewV153 } from '../src/xeno-trials-grapple-v153.js';
import { getXenoTrialsGroundGrabV212 as grabFor, getXenoTrialsGroundGrabPairV212 as pair,
  XENO_TRIALS_GROUND_GRAB_KIND_V212 as grabKind, XENO_TRIALS_GROUND_GRABS_V212 as grabs } from '../src/xeno-trials-grapple-v212.js';
import { createXenoTrialsDuelCheckpointV197 as checkpoint } from '../src/xeno-trials-duel-checkpoint-v197.js';
import { createXenoTrialsHordeCheckpointV186 } from '../src/xeno-trials-horde-checkpoint-v186.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';

const commando = 'import-game-dd-wy-commando';
const chord = { guard: true, heavy: true };
const guard = { guard: true };
const past = match => match.events.findLast(event => event.type === 'grapple-end-v153');
function place(match, gap = 4) {
  const [left, right] = match.fighters;
  right.x += body(left).right + gap - body(right).left;
  return match;
}
const duel = (options = {}, gap = 4) => place(create({ playerId: 'warrior', opponentId: commando,
  introSeconds: 0, holdRoundTransition: true, ...options }), gap);
function ticks(match, count, first = {}, second = {}) {
  for (let i = 0; i < count; i++) step(match, dt, first, second);
}
function capture(match, side = 0) {
  const from = match.fighters[side];
  ticks(match, 1, side ? {} : chord, side ? chord : {});
  assert.equal(from.attack?.kind, grabKind);
  while (from.attack && !match.grappleV153) ticks(match, 1);
  assert.ok(match.grappleV153);
}

test('34 exact Bible rows and 548 ordered matchup admissions preserve identity and actual floor contact', () => {
  const plan = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/xeno-trials-plan-v146.json', import.meta.url)));
  const rows = new Map(plan.tables['05_Moveset'].rows.filter(row => row[0].endsWith('::grab')).map(row => [row[0], row[1]]));
  assert.equal(grabs.length, 34);
  let count = 0;
  for (const grab of grabs) {
    const initiator = definition(grab.fighterId);
    assert.equal(rows.get(grab.id), initiator.id);
    assert.equal(grabFor(initiator), grab);
    assert.equal(grabFor({ ...initiator, profileId: 'borrowed' }), null);
    assert.equal(grab.canonExact, false);
    for (const receiver of roster) {
      if (!pair(initiator, receiver)) continue;
      count++;
      assert.equal(pair(initiator, { ...receiver, profileId: initiator.profileId + '-other' }), null);
      const match = duel({ playerId: initiator.id, opponentId: receiver.id });
      const [actor, target] = match.fighters, before = match.fighters.map(fighter => [fighter.x, fighter.y]);
      const stamina = actor.stamina;
      capture(match);
      assert.equal(match.grappleV153.grabIdV212, grab.id);
      assert.equal(match.grappleV153.target, 'opponent');
      assert.equal(actor.stamina, stamina - grab.spec.cost);
      assert.equal(actor.stats.hits, 1);
      assert.equal(actor.stats.specials, 1);
      assert.equal(target.attack, null);
      match.fighters.forEach((fighter, index) => {
        assert.ok(Math.abs(fighter.x - before[index][0]) < 1e-8);
        assert.equal(fighter.y, before[index][1]);
      });
    }
  }
  assert.equal(count, 548);
  assert.equal(pair(definition('royal-guard'), definition('synth-sniper')), null);
  assert.equal(grabFor(definition('prowler')), null);
  assert.equal(grabFor(definition('panther')), null);
});

test('both facings and both Arachnoid palettes use world bounds without importing the Prowler pose', () => {
  for (const variant of definition('arachnoid').variants) {
    for (const side of [0, 1]) {
      const match = duel(side ? { playerId: commando, opponentId: 'arachnoid', opponentVariant: variant }
        : { playerId: 'arachnoid', playerVariant: variant });
      capture(match, side);
      assert.equal(match.fighters[side].variant, variant);
      assert.equal(match.grappleV153.facingV212, side ? -1 : 1);
      assert.equal(getXenoTrialsCaptureViewV163(match, new Map()), null);
      assert.equal(getXenoTrialsGrappleViewV153(match).animation, 'existing-static-pose');
    }
  }
});

test('short range, frontal defense, timed parry and airborne targets deny a lock', () => {
  const whiff = duel({}, 9);
  ticks(whiff, 100, chord);
  assert.equal(whiff.grappleV153, undefined);
  assert.equal(whiff.fighters[0].stats.specials, 1);
  assert.equal(whiff.fighters[0].stats.hits, 0);
  const wrong = duel({ opponentId: 'queen' });
  ticks(wrong, 100, chord);
  assert.equal(wrong.grappleV153, undefined);
  assert.equal(wrong.fighters[0].stats.hits, 0);
  const airborne = duel();
  ticks(airborne, 100, chord, { jump: true });
  assert.equal(airborne.grappleV153, undefined);
  assert.equal(airborne.fighters[0].stats.hits, 0);
  const block = duel();
  ticks(block, 80, chord, guard);
  assert.equal(block.grappleV153, undefined);
  assert.equal(block.fighters[1].stats.blocks, 1);
  const parry = duel();
  ticks(parry, 1, chord);
  while (parry.fighters[0].attack.age + dt < grabFor(definition('warrior')).spec.startup) ticks(parry, 1);
  ticks(parry, 1, {}, { parry: true });
  assert.equal(parry.events.at(-1).type, 'parry-v208');
  assert.equal(parry.grappleV153, undefined);
  const interrupted = duel();
  ticks(interrupted, 70, chord, { light: true });
  assert.equal(interrupted.grappleV153, undefined);
  assert.equal(interrupted.fighters[0].stats.hits, 0);
});

test('a real guard break or a crouch keeps the receiver outside the standing hold', () => {
  const match = duel({ opponentId: 'synth-trooper' }), target = match.fighters[1];
  target.stamina = 2; // Low-endurance boundary before a native light guard break.
  ticks(match, 1, { light: true }, guard);
  ticks(match, 10, {}, guard);
  const recovery = target.groundRecoveryV211;
  assert.ok(recovery);
  assert.equal(match.events.at(-1).type, 'guard-break');
  ticks(match, 34);
  ticks(match, 8, { right: true });
  assert.ok(body(target).left - body(match.fighters[0]).right <= 8);
  ticks(match, 1, chord);
  assert.equal(match.fighters[0].attack?.kind, grabKind);
  ticks(match, 41);
  assert.equal(target.groundRecoveryV211, recovery);
  assert.equal(match.fighters[0].attack?.hit, false);
  assert.equal(match.grappleV153, undefined);

  const ducked = duel();
  ticks(ducked, 60, chord, { crouch: true });
  assert.equal(ducked.fighters[1].movesetV207.low, true);
  assert.equal(ducked.fighters[0].stats.hits, 0);
  assert.equal(ducked.grappleV153, undefined);
  const crouchedAttacker = duel();
  ticks(crouchedAttacker, 1, { ...chord, crouch: true });
  assert.equal(crouchedAttacker.fighters[0].attack, null);
});

test('guard plus heavy obeys restrictions and never produces a horde hold or ground-unit attack', () => {
  const forbidden = duel({ rulesV119: { noSpecial: true } });
  ticks(forbidden, 140, chord);
  assert.equal(forbidden.fighters[0].stats.specials, 0);
  const airborne = duel();
  ticks(airborne, 4, { jump: true });
  ticks(airborne, 100, chord);
  assert.ok(!airborne.events.some(event => event.kind === grabKind));
  const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'warrior',
    activityV119: { branch: 'horde', id: 'xth180-incoming-1' } }).config;
  const horde = create({ ...ticket, introSeconds: 0 });
  ticks(horde, 120, chord);
  assert.ok(!horde.events.some(event => event.kind === grabKind));
  assert.equal(horde.grappleV153, undefined);
  assert.ok(createXenoTrialsHordeCheckpointV186(snapshot(horde), ticket));
  const reference = duel();
  capture(reference);
  const forged = snapshot(horde);
  forged.grappleV153 = reference.grappleV153;
  assert.equal(restoreXenoTrialsHordeMatchV180(forged), null);
  delete forged.grappleV153;
  forged.events.push({ id: ++forged.serial, tick: forged.tick, type: 'attack', side: 'player',
    kind: grabKind, grabIdV212: 'warrior::grab', attackerInstanceV180: 'player' });
  assert.equal(createXenoTrialsHordeCheckpointV186(forged, ticket), null);
});

test('the target escapes by maintaining guard, or the hold schedules a finite timeout', () => {
  const match = duel(), grab = grabFor(definition('warrior'));
  capture(match);
  const [actor, target] = match.fighters, hp = target.hp;
  ticks(match, 10, {}, guard);
  ticks(match, 1);
  assert.equal(match.grappleV153.escapeProgress, 0);
  ticks(match, grab.escapeTicks - 1, {}, guard);
  assert.equal(match.grappleV153.escapeProgress, grab.escapeTicks - 1);
  ticks(match, 1, {}, guard);
  assert.equal(past(match).reason, 'escaped');
  assert.equal(past(match).grabIdV212, grab.id);
  assert.equal(target.stats.grappleEscapesV153, 1);
  assert.equal(target.hp, hp - grab.damage);
  assert.equal(actor.stats.grappleTicksV153, 1);
  const timeout = duel();
  capture(timeout);
  ticks(timeout, grab.durationTicks + 6);
  assert.equal(past(timeout).reason, 'timeout');
  assert.equal(timeout.fighters[0].stats.grappleTicksV153, 3);
  assert.equal(timeout.grappleV153, undefined);
  const separated = duel();
  capture(separated);
  separated.fighters[1].x += 64;
  ticks(separated, 1);
  assert.equal(past(separated).reason, 'separated');
  assert.equal(separated.grappleV153, undefined);
});

test('native CPU duel checkpoints preserve windup, hold and earned escape across replay', () => {
  const progress = createXenoTrialsProgressV96();
  const ticket = beginXenoTrialsV96(progress, { playerId: 'warrior', opponentId: commando, difficulty: 'easy' }).config;
  const match = duel(ticket);
  ticks(match, 10, chord, null);
  const windup = checkpoint(snapshot(match), ticket);
  assert.ok(windup);
  const badWindup = structuredClone(windup.snapshot);
  badWindup.events[0].grabIdV212 = 'grid::grab';
  assert.equal(checkpoint(badWindup, ticket), null);
  ticks(match, 73, {}, null);
  const saved = checkpoint(snapshot(match), ticket);
  assert.ok(saved?.snapshot.grappleV153?.escapeProgress > 0);
  for (const corrupt of [
    state => { state.grappleV153.facingV212 *= -1; },
    state => { state.grappleV153.nextDamageTick += 42; },
    state => { delete state.grappleV153.grabIdV212; },
    state => { delete state.grappleV153; },
    state => { state.fighters[1].groundRecoveryV211 = { tick: state.tick, breakId: state.serial, assistedAt: 0 }; },
    state => { state.events = state.events.filter(event => event.type !== 'grapple-start-v153'); },
    state => { state.fighters[1].x += 50; },
  ]) {
    const forged = structuredClone(saved.snapshot);
    corrupt(forged);
    assert.equal(checkpoint(forged, ticket), null);
  }
  const replay = JSON.parse(JSON.stringify(saved.snapshot));
  pause(replay, false);
  ticks(match, 100, {}, null);
  ticks(replay, 100, {}, null);
  assert.equal(past(match).reason, 'escaped');
  assert.deepEqual(snapshot(replay), snapshot(match));
});
