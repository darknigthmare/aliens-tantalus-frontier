import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getXenoTrialsArtV96 as art, getXenoTrialsFighterV96 as definition, XENO_TRIALS_FIGHTERS_V96 as roster } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96 as create, getXenoTrialsSnapshotV96 as snapshot, setXenoTrialsPausedV96 as pause,
  stepXenoTrialsMatchV96 as step, XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { XENO_TRIALS_ARENA_V105, getXenoTrialsBodyBoundsV105 as body, getXenoTrialsBodyGapV105 as gap } from '../src/xeno-trials-geometry-v105.js';
import { drawXenoTrialsGrappleV153, getXenoTrialsGrappleViewV153, XENO_TRIALS_GROUND_RELEASE_V218 } from '../src/xeno-trials-grapple-v153.js';
import { XENO_TRIALS_GROUND_GRAB_KIND_V212 as kind, XENO_TRIALS_GROUND_GRABS_V212, getXenoTrialsGroundGrabV212 as grabFor,
  getXenoTrialsGroundGrabPairV212 as pair } from '../src/xeno-trials-grapple-v212.js';
import { beginXenoTrialsV96, checkpointXenoTrialsDuelV197, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsRigV154 } from '../src/xeno-trials-rig-v154.js';

const commando = 'import-game-dd-wy-commando';
const combat = 'combat-synth', acid = 'acid-combat-synth', cryo = 'cryo-combat-synth', albino = 'albino-combat-synth';
const armor = 'armored-joe', joe = 'import-joe-battle', enforcer = 'synth-enforcer', guard = 'synth-guard', trooper = 'synth-trooper';
const pairs = [
  [guard, [guard, trooper, 'synth-sniper', combat, armor, 'import-joe-classic']],
  [combat, [guard, trooper, acid, cryo, albino, armor, joe, commando]],
  [enforcer, [combat, acid, cryo, albino, armor, joe, commando]],
  [acid, [combat, cryo, albino, enforcer, armor, joe, commando]],
  [cryo, [combat, acid, albino, enforcer, armor, joe, commando]],
  [albino, [combat, acid, cryo, enforcer, armor, joe, commando]]
];
const chord = { guard: true, heavy: true };
const end = match => match.events.findLast(event => event.type === 'grapple-end-v153');

function practice(source, target, side = 0, settings = {}) {
  const match = create({ playerId: side ? target : source, opponentId: side ? source : target, introSeconds: 0, ...settings });
  const actors = [match.fighters[side], match.fighters[1 - side]];
  const [from, to] = actors;
  const input = (first = {}, second = {}) => step(match, dt, ...(side ? [second, first] : [first, second]));
  while (gap(from, to, from.facing) > 5 && match.tick < 450) input(from.facing > 0 ? { right: true } : { left: true });
  assert.ok(match.tick < 450 && gap(from, to, from.facing) <= 5);
  return { match, actors, input };
}

function applyHold(match, from, input, guardOnly = {}) {
  input(chord, guardOnly);
  assert.equal(from.attack?.kind, kind);
  for (let tick = 0; tick < 90 && from.attack && !match.grappleV153; tick++) input({}, guardOnly);
}

test('the 42 new ordered pairs bind the Bible ground grab to exact native profiles and the six original source rigs', () => {
  const plan = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/xeno-trials-plan-v146.json', import.meta.url)));
  const rows = new Set(plan.tables['05_Moveset'].rows.map(row => row[0]));
  assert.equal(XENO_TRIALS_GROUND_GRABS_V212.length, 34);
  assert.equal(pairs.reduce((total, [, targets]) => total + targets.length, 0), 42);
  for (const [source, targets] of pairs) {
    const identity = definition(source), native = art(source), rig = getXenoTrialsRigV154(identity, native);
    const grab = grabFor(identity);
    assert.ok(rows.has(grab.id));
    assert.equal(grab.profileId, native.id);
    assert.equal(grab.canonExact, false);
    assert.equal(grab.animation, 'existing-static-pose');
    assert.ok(rig.contacts.handFar && rig.contacts.handNear);
    assert.ok(rig.contacts.footFar && rig.contacts.footNear);
    assert.equal(createHash('sha256').update(readFileSync(new URL('..' + rig.path, import.meta.url))).digest('hex'), rig.sourceSha256);
    assert.deepEqual(roster.filter(target => pair(identity, target)).map(target => target.id).sort(), [...targets].sort());
    assert.equal(grabFor({ ...identity, profileId: 'another-plate' }), null);
    for (const target of targets) assert.equal(pair(identity, { ...definition(target), profileId: 'another-plate' }), null);
  }
});

for (const [source, targets] of pairs) {
  for (const target of targets) {
    test(`${source} → ${target} has grounded contact, exact control ownership and a bounded escape in both directions`, () => {
      for (const side of [0, 1]) {
        const { match, actors: [from, to], input } = practice(source, target, side);
        const before = [from.x, to.x, to.hp, from.stamina];
        const grab = grabFor(definition(from.id));
        applyHold(match, from, input);
        const hold = match.grappleV153, view = getXenoTrialsGrappleViewV153(match);
        assert.ok(hold && view);
        assert.equal(hold.grabIdV212, grab.id);
        assert.equal(hold.attacker, from.side);
        assert.equal(hold.target, to.side);
        assert.equal(hold.facingV212, side ? -1 : 1);
        assert.deepEqual([from.x, to.x, from.y, to.y], [before[0], before[1], 0, 0]);
        assert.equal(from.stamina, before[3] - grab.spec.cost);
        assert.equal(before[2] - to.hp, grab.spec.damage);
        const line = [];
        const context = { save() {}, restore() {}, beginPath() {}, stroke() {}, fillRect() {}, fillText() {},
          moveTo(...point) { line.push(point); }, lineTo(...point) { line.push(point); } };
        const floor = XENO_TRIALS_ARENA_V105.floor;
        drawXenoTrialsGrappleV153(context, match, body, floor);
        assert.equal(line.length, 2);
        assert.equal(line[0][0], side ? body(from).left : body(from).right);
        assert.equal(line[1][0], side ? body(to).right : body(to).left);
        assert.equal(line[0][1], line[1][1]);
        assert.ok(line[0][1] < floor);
        for (let tick = 0; tick < grab.escapeTicks && match.grappleV153; tick++) input({}, { guard: true });
        assert.equal(end(match).reason, 'escaped');
        assert.equal(to.stats.grappleEscapesV153, 1);
        assert.equal(match.grappleV153, undefined);
      }
    });
  }
}

test('front guard, a non-admitted target and the no-special rule still reject the new holds', () => {
  const blocked = practice(combat, armor);
  applyHold(blocked.match, blocked.actors[0], blocked.input, { guard: true });
  assert.equal(blocked.match.grappleV153, undefined);
  assert.ok(blocked.match.events.some(event => event.type === 'block'));
  const mismatched = practice(guard, 'queen');
  applyHold(mismatched.match, mismatched.actors[0], mismatched.input);
  assert.equal(mismatched.match.grappleV153, undefined);
  assert.equal(mismatched.actors[0].stats.hits, 0);
  const restricted = practice(guard, trooper, 0, { rulesV119: { noSpecial: true } });
  restricted.input(chord);
  assert.equal(restricted.actors[0].attack, null);
});

const cpuTargets = new Map([[guard, armor], [combat, armor], [enforcer, combat], [acid, armor], [cryo, combat], [albino, commando]]);
for (const [source, target] of cpuTargets) {
  test(`${source} captures the live CPU, pauses, restores and releases through an ordinary V197 duel ticket`, () => {
    const owned = createXenoTrialsProgressV96();
    // Ownership fixture only. The duel starts at normal roots against the live CPU.
    if (!owned.unlocked.includes(source)) owned.unlocked.push(source);
    const ticket = beginXenoTrialsV96(owned, { playerId: source, opponentId: target, difficulty: 'easy' });
    assert.equal(ticket.applied, true);
    const match = create({ ...ticket.config, introSeconds: 0, holdRoundTransition: true });
    const [from, to] = match.fighters;
    while (!match.grappleV153 && !match.result && match.tick < 1300) {
      const direction = to.x >= from.x ? 1 : -1;
      step(match, dt, gap(from, to, direction) > 5 && !from.attack
        ? { [direction > 0 ? 'right' : 'left']: true } : { guard: true, heavy: match.tick % 4 === 0 });
    }
    const hold = match.grappleV153;
    assert.equal(hold?.grabIdV212, source + '::grab');
    while (match.tick < hold.bornTick + XENO_TRIALS_GROUND_RELEASE_V218.minimumHeldTicks) step(match, dt, {});
    pause(match, true);
    const frozen = snapshot(match);
    step(match, dt, chord);
    assert.deepEqual(snapshot(match), frozen);
    const checkpoint = checkpointXenoTrialsDuelV197(ticket.state, frozen);
    assert.equal(checkpoint.applied, true);
    const restored = normalizeXenoTrialsProgressV96(structuredClone(checkpoint.state));
    const resumed = restored.pending.duelCheckpointV197.snapshot;
    for (const duel of [match, resumed]) {
      pause(duel, false);
      step(duel, dt, {});
      step(duel, dt, chord);
      assert.equal(end(duel).reason, 'released');
    }
    assert.deepEqual(snapshot(match), snapshot(resumed));
    assert.equal(checkpointXenoTrialsDuelV197(restored, snapshot(resumed)).applied, true);
  });
}
