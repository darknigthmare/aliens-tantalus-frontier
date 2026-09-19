import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SPRITE_CLIP_SETS,
  SpriteAnimationController,
  resolveNpcAnimation,
  resolvePlayerAnimation,
  resolveSpriteClip,
  resolveVerifiedPlayerCombat
} from '../src/sprite-animation-runtime.js';
import { hasCrewUniformV85 } from '../src/crew-runtime-v85.js';

const COMBAT = 'player.echo9-marine.combat';
const BASE = { alive: true, grounded: true, vx: 0, v52HurtClock: 0 };
const crewId = 'recruit-v85-1234abcd-000001';
const crew = {
  crewId,
  visualProfileId: 'echo9-standard-v85',
  crewV85: { schema: 85, crewId, visualProfileId: 'echo9-standard-v85' }
};
const actors = [
  { id: 'player:primary', actor: { operatorId: 'player-echo9' }, resolve: resolvePlayerAnimation },
  { id: 'player:coop', actor: { operatorId: 'player-bravo', coop: true }, resolve: resolvePlayerAnimation },
  { id: `npc:${crewId}`, actor: crew, resolve: resolveNpcAnimation }
];

test('living and dead Echo-9 clips use disjoint terminal states; legacy inspection remains compatible', () => {
  const hurt = resolveSpriteClip(COMBAT, 'hurt');
  const death = resolveSpriteClip(COMBAT, 'death');
  assert.deepEqual(hurt.frames, [12, 13]);
  assert.deepEqual(death.frames, [13, 14, 15]);
  assert.equal(hurt.loop, false);
  assert.equal(death.loop, false);
  assert.deepEqual(hurt.events.map(event => event.type), ['state:hurt']);
  assert.deepEqual(death.events, [{ frame: 15, type: 'state:death-lock' }]);
  assert.deepEqual(resolveVerifiedPlayerCombat('hurt-death'), { sheetId: COMBAT, clipId: 'hurt-death' });
  assert.deepEqual(resolveSpriteClip(COMBAT, 'hurt-death').frames, [12, 13, 14, 15]);
  assert.deepEqual(SPRITE_CLIP_SETS['player-combat']
    .filter(clip => clip.events.some(event => event.type === 'state:death-lock'))
    .map(clip => clip.id), ['death']);
  assert.equal(hasCrewUniformV85(crew), true, 'fixture must exercise the declared shared uniform');
});

for (const fixture of actors) {
  test(`${fixture.id}: sustained injury never samples a fallen frame or locks a living actor`, () => {
    const events = [];
    const controller = new SpriteAnimationController({ onEvent: event => events.push(event) });
    // Competing actions and a stale zero-health value cannot override the authoritative alive flag.
    const actor = { ...BASE, ...fixture.actor, health: 0, v52HurtClock: 0.42,
      reloading: true, v52FireClock: 1, meleeClock: 1, toolUseClock: 1, interactionClock: 1 };
    const request = fixture.resolve(actor);
    assert.equal(request.sheetId, COMBAT);
    assert.equal(request.clipId, 'hurt');
    assert.equal(controller.sample(fixture.id, request, 10).frame, 12);
    for (const now of [10.2, 10.42, 11, 40]) {
      const sample = controller.sample(fixture.id, request, now);
      assert.equal(sample.frame, 13);
      assert.equal(sample.complete, true);
      assert.ok(sample.frame < 14);
    }
    assert.equal(controller.sample(fixture.id, { ...request, frame: 15 }, 41).frame, 13,
      'an explicit corpse frame is outside the injury clip and must be rejected');
    assert.deepEqual(events.map(event => event.event), ['state:hurt']);
    assert.ok(events.every(event => event.frame < 14));
  });

  test(`${fixture.id}: recovery resets the injury, and death starts its own one-shot sequence`, () => {
    const events = [];
    const controller = new SpriteAnimationController({ onEvent: event => events.push(event) });
    const actor = { ...BASE, ...fixture.actor, v52HurtClock: 0.42 };
    assert.equal(controller.sample(fixture.id, fixture.resolve(actor), 1).frame, 12);
    assert.equal(controller.sample(fixture.id, fixture.resolve(actor), 1.5).frame, 13);
    actor.v52HurtClock = 0;
    const recovery = fixture.resolve(actor);
    assert.equal(recovery.clipId, 'idle');
    assert.equal(controller.sample(fixture.id, recovery, 2).frame, 0);
    actor.v52HurtClock = 0.42;
    assert.equal(controller.sample(fixture.id, fixture.resolve(actor), 3).frame, 12);
    controller.sample(fixture.id, fixture.resolve(actor), 30);
    assert.equal(events.filter(event => event.event === 'state:death-lock').length, 0);
    assert.equal(events.filter(event => event.event === 'state:hurt').length, 2);
    actor.alive = false;
    const dead = fixture.resolve(actor);
    assert.equal(dead.clipId, 'death', 'death takes priority over a remaining injury clock');
    const first = controller.sample(fixture.id, dead, 31);
    assert.equal(first.frame, 13, 'changing clip resets elapsed time even after a long injury');
    assert.equal(first.elapsed, 0);
    assert.deepEqual(first.events, []);
    assert.equal(controller.sample(fixture.id, dead, 31.16).frame, 14);
    const final = controller.sample(fixture.id, dead, 31.32);
    assert.equal(final.frame, 15);
    assert.equal(final.complete, true);
    for (const now of [31.32, 32, 60]) assert.equal(controller.sample(fixture.id, dead, now).frame, 15);
    assert.deepEqual(events.filter(event => event.event === 'state:death-lock')
      .map(({ entityId, clipId, frame }) => ({ entityId, clipId, frame })),
    [{ entityId: fixture.id, clipId: 'death', frame: 15 }]);
  });
}

test('J1, J2 and shared-uniform crew keep independent injury and death clocks', () => {
  const events = [];
  const controller = new SpriteAnimationController({ onEvent: event => events.push(event) });
  const [j1, j2, npc] = actors;
  const hurtJ1 = j1.resolve({ ...BASE, ...j1.actor, v52HurtClock: 1 });
  const deadJ2 = j2.resolve({ ...BASE, ...j2.actor, alive: false });
  const hurtNpc = npc.resolve({ ...BASE, ...npc.actor, v52HurtClock: 1 });
  for (const [fixture, request] of [[j1, hurtJ1], [j2, deadJ2], [npc, hurtNpc]]) {
    controller.sample(fixture.id, request, 10);
    controller.sample(fixture.id, request, 11);
  }
  assert.equal(controller.sample(j1.id, hurtJ1, 12).frame, 13);
  assert.equal(controller.sample(j2.id, deadJ2, 12).frame, 15);
  assert.equal(controller.sample(npc.id, hurtNpc, 12).frame, 13);
  controller.sample(j1.id, j1.resolve({ ...BASE, ...j1.actor }), 13);
  assert.equal(controller.sample(j2.id, deadJ2, 13).frame, 15);
  assert.equal(controller.sample(npc.id, hurtNpc, 13).frame, 13);
  assert.deepEqual(events.filter(event => event.event === 'state:death-lock').map(event => event.entityId), [j2.id]);
});
