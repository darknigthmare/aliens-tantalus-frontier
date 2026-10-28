import test from 'node:test';
import assert from 'node:assert/strict';
import { HubGame } from '../src/hub-v81-runtime.js';
import { createAnnexNpcsV141 } from '../src/hub-annex-npc-life-v141.js';

function scene(phase = 'idle') {
  const npc = createAnnexNpcsV141([{ roomId: 'proving-ground', crewId: 'crew-02-tamsin-velez',
    targetX: 850, duty: 'range-safety-inspection' }], new Map())[0];
  assert.ok(npc);
  const calls = [], hub = Object.create(HubGame.prototype);
  Object.assign(hub, { running: true, annexTransitionV71: null, hubDoorClosingV142: null,
    annexStateReadOnlyV87: false, provingGroundStateV81: { phase },
    state: { deck: 2, roomId: 'armory' }, player: { x: npc.x + 84, y: 532, w: 44, h: 92 },
    isProvingGroundActiveV81: () => true, isAnnexActiveV71: () => true,
    currentAnnexV71: () => ({ id: 'proving-ground' }),
    nearestAnnexExitV71: () => null, nearestAnnexStationV71: () => null,
    prioritizedParentAnnexDoorV133: () => null, getCompanionInteractionV87: () => null,
    nearestAnnexNpcV141: () => npc,
    interactWithAnnexNpcV141: actor => { calls.push({ type: 'crew', actor }); return actor; },
    armProvingGroundV81: () => { calls.push({ type: 'qualification' }); return true; } });
  return { hub, npc, calls };
}

test('the actual range dispatcher delegates an idle or finished watch interaction to the same Tamsin body', () => {
  for (const phase of ['idle', 'completed', 'failed', 'aborted']) {
    const { hub, npc, calls } = scene(phase), before = structuredClone(npc);
    hub.interact();
    assert.equal(calls.length, 1); assert.equal(calls[0].type, 'crew');
    assert.equal(calls[0].actor, npc); assert.deepEqual(npc, before);
    assert.equal(hub.provingGroundStateV81.phase, phase);
  }
});

test('qualification controls retain priority and a live range never opens the crew dialogue', () => {
  for (const phase of ['armed', 'active']) {
    const { hub, calls } = scene(phase); hub.interact();
    assert.deepEqual(calls, []); assert.equal(hub.provingGroundStateV81.phase, phase);
  }
  const { hub, calls } = scene(); hub.nearestAnnexStationV71 = () => ({ annexId: 'proving-ground' });
  hub.interact(); assert.deepEqual(calls, [{ type: 'qualification' }]);
});

test('an inactive engine or a covered player doorway cannot dispatch a crew conversation', () => {
  for (const blocked of [{ running: false }, { annexTransitionV71: { phase: 'covering' } },
    { hubDoorClosingV142: true }, { annexStateReadOnlyV87: true }]) {
    const { hub, calls } = scene(); Object.assign(hub, blocked); hub.interact();
    assert.deepEqual(calls, []);
  }
});
