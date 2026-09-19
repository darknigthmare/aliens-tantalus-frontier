import test from 'node:test';
import assert from 'node:assert/strict';
import { HubGame } from '../src/hub-game.js';
import { ELECTRICAL_HAZARD_ART_V55 } from '../src/hub-art-runtime-v55.js';
import { resolvePlayerAnimation, resolveNpcAnimation, SpriteAnimationController } from '../src/sprite-animation-runtime.js';

const COMBAT = 'player.echo9-marine.combat';
const base = { alive: true, grounded: true, vx: 0, health: 100, v52HurtClock: 0, shockClock: 0 };
const crewId = 'recruit-v85-1234abcd-000001';
const actors = [
  { id: 'player:primary', identity: { operatorId: 'player-echo9' }, resolve: resolvePlayerAnimation },
  { id: 'player:coop', identity: { operatorId: 'player-bravo', coop: true }, resolve: resolvePlayerAnimation },
  { id: 'npc:' + crewId, identity: { crewId, visualProfileId: 'echo9-standard-v85',
    crewV85: { schema: 85, crewId, visualProfileId: 'echo9-standard-v85' } }, resolve: resolveNpcAnimation }
];

test('real hangar electrical damage produces living hurt frames, never the death sequence', () => {
  const context = { state: { deck: 3 }, hangarHazardCooldown: 0, roomChangePulse: 0, statusKey: '',
    player: { ...base, x: 1100, y: 532, w: 44, h: 92, maxHealth: 100, shockHits: 0 } };
  assert.equal(HubGame.prototype.applyHangarHazard.call(context), true);
  assert.equal(context.player.health, 100 - ELECTRICAL_HAZARD_ART_V55.damage);
  assert.equal(context.player.shockClock, ELECTRICAL_HAZARD_ART_V55.stunSeconds);
  assert.equal(context.player.v52HurtClock, 0, 'the hub actually owns a separate shock clock');
  assert.equal(context.player.alive, true);
  const request = resolvePlayerAnimation(context.player);
  assert.deepEqual(request, { sheetId: COMBAT, clipId: 'hurt' });
  const events = [], controller = new SpriteAnimationController({ onEvent: event => events.push(event) });
  assert.equal(controller.sample('hub:player:echo9', request, 1).frame, 12);
  for (const now of [1.2, 1.75, 2.25, 30]) {
    assert.equal(controller.sample('hub:player:echo9', request, now).frame, 13);
  }
  assert.deepEqual(events.map(event => event.event), ['state:hurt']);
});

for (const actor of actors) {
  test(actor.id + ': electrical hurt outranks action/locomotion, while authoritative death still wins', () => {
    for (const action of [{}, { reloading: true }, { v52FireClock: 1 }, { fireClock: 1 },
      { meleeClock: 1 }, { toolUseClock: 1 }, { interactionClock: 1, interactionKind: 'lift-carry' },
      { climbing: true }, { crouching: true }, { grounded: false }, { vx: 200 }]) {
      const living = Object.freeze({ ...base, ...actor.identity, ...action, shockClock: .8 });
      const request = actor.resolve(living);
      assert.equal(request.sheetId, COMBAT); assert.equal(request.clipId, 'hurt');
      assert.equal(actor.resolve({ ...living, alive: false }).clipId, 'death');
      assert.equal(living.shockClock, .8, 'animation resolution cannot consume gameplay time');
    }
  });
}

test('shock expiry resumes locomotion unless the independent injury clock remains active', () => {
  for (const actor of actors) {
    const person = { ...base, ...actor.identity, vx: 70 };
    assert.equal(actor.resolve({ ...person, shockClock: .01 }).clipId, 'hurt');
    for (const shockClock of [0, -1, undefined, NaN]) assert.equal(actor.resolve({ ...person, shockClock }).clipId, 'walk-run');
    assert.equal(actor.resolve({ ...person, shockClock: 0, v52HurtClock: .1 }).clipId, 'hurt');
    assert.equal(actor.resolve({ ...person, shockClock: .1, v52HurtClock: 0 }).clipId, 'hurt');
    assert.equal(actor.resolve({ ...person, shockClock: 0, v52HurtClock: 0 }).clipId, 'walk-run');
  }
});

test('J1 shock, J2 death and crew injury keep independent animation states and recovery', () => {
  const events = [], controller = new SpriteAnimationController({ onEvent: event => events.push(event) });
  const [j1, j2, npc] = actors;
  const shock = j1.resolve({ ...base, ...j1.identity, shockClock: 1.25 });
  const death = j2.resolve({ ...base, ...j2.identity, alive: false, shockClock: 1.25 });
  const injury = npc.resolve({ ...base, ...npc.identity, v52HurtClock: .4 });
  for (const [actor, request] of [[j1, shock], [j2, death], [npc, injury]]) {
    controller.sample(actor.id, request, 10); controller.sample(actor.id, request, 11);
  }
  assert.equal(controller.sample(j1.id, shock, 12).frame, 13);
  assert.equal(controller.sample(j2.id, death, 12).frame, 15);
  assert.equal(controller.sample(npc.id, injury, 12).frame, 13);
  const recovery = j1.resolve({ ...base, ...j1.identity });
  assert.equal(controller.sample(j1.id, recovery, 13).frame, 0);
  assert.equal(controller.sample(j2.id, death, 13).frame, 15);
  assert.equal(controller.sample(npc.id, injury, 13).frame, 13);
  assert.equal(controller.sample(j1.id, shock, 14).frame, 12, 'a new shock starts its own injury sequence');
  assert.deepEqual(events.filter(event => event.event === 'state:death-lock').map(event => event.entityId), [j2.id]);
});
