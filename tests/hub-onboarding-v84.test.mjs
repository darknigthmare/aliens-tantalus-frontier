import test from 'node:test';
import assert from 'node:assert/strict';
import { HubGame, HUB_DECKS, HUB_WORLD, ONBOARDING_SPAWN_V84 } from '../src/hub-onboarding-v84.js';
import { HubGame as PreviousHub } from '../src/hub-v81-runtime.js';
import { createPlayerOnboardingV84, advancePlayerOnboardingV84 } from '../src/player-onboarding-v84.js';
import { getHubDoorBounds } from '../src/hub-profiles-v53.js';

const DAVID = 'crew-10-david-8r';
const TAMSIN = 'crew-02-tamsin-velez';
const stateAt = (phase) => {
  let state = createPlayerOnboardingV84({ name: 'Alex Moreau', callsign: 'FOX-9' });
  const events = ['wake-confirmed', { type: 'medical-next', dialogueNode: 0 }, { type: 'medical-next', dialogueNode: 1 },
    'medical-complete', { type: 'briefing-next', dialogueNode: 0 }, { type: 'briefing-next', dialogueNode: 1 }, 'briefing-complete'];
  for (const event of events) {
    if (state.phase === phase) break;
    state = advancePlayerOnboardingV84(state, event).state;
  }
  return state;
};
const overlaps = (a, b) => !!b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function contactFixture(phase = 'medical') {
  const hub = Object.create(HubGame.prototype);
  const x = phase === 'briefing' ? 1590 : 4290;
  const roomId = phase === 'briefing' ? 'briefing' : 'cryo-bay';
  const npc = { crewId: phase === 'briefing' ? TAMSIN : DAVID, x, y: 532, w: 44, h: 92, alive: true, roomId };
  Object.assign(hub, {
    onboardingV84: stateAt(phase), state: { deck: 0 }, running: true, editorPlaytest: false,
    player: { x: x - 80, y: 532, w: 44, h: 92, alive: true, vx: 0, vy: 0, health: 31 },
    npcs: [npc], doorStates: [], v51Doors: [], isAnnexActiveV71: () => false
  });
  return hub;
}

class MockImage {
  constructor() { this.complete = true; this.naturalWidth = 1920; this.naturalHeight = 720; }
  set src(value) { this.currentSrc = value; }
}
function withRuntime(run) {
  const previous = { Image: globalThis.Image, addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame, matchMedia: globalThis.matchMedia };
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  globalThis.matchMedia = () => ({ matches: false });
  try { return run(); } finally { Object.assign(globalThis, previous); }
}
function actualHub(onboarding = stateAt('wake'), hour = 9) {
  const context = new Proxy({
    measureText: (value) => ({ width: String(value).length * 8 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} })
  }, { get: (target, key) => key in target ? target[key] : () => {}, set: (target, key, value) => { target[key] = value; return true; } });
  const hub = new HubGame({ width: 1280, height: 720, getContext: () => context, addEventListener() {}, focus() {} });
  hub.start({ ...ONBOARDING_SPAWN_V84 }, { onboardingV84: onboarding, routineContextV62: { clock: { day: 1, hour } } });
  return hub;
}

test('the saved V84 wake spawn is within the actual cryo room, outside bitmap and physical cryopod', () => withRuntime(() => {
  const hub = actualHub();
  const room = HUB_DECKS[0].rooms.find((entry) => entry.id === 'cryo-bay');
  assert.equal(ONBOARDING_SPAWN_V84.positionX, 4560);
  assert.equal(hub.player.x, 4560);
  assert.equal(hub.state.deck, 0);
  assert.equal(hub.currentRoom().id, room.id);
  assert.ok(hub.player.x >= room.xStart && hub.player.x + hub.player.w <= room.xEnd);
  assert.equal(hub.player.y + hub.player.h, HUB_WORLD.floorY);
  assert.equal(overlaps(hub.player, room.propRenderBounds), false);
  assert.equal(overlaps(hub.player, room.propCollisionBounds), false);
  assert.ok(room.propRenderBounds.x - hub.player.x - hub.player.w >= 24);
  assert.deepEqual(hub.onboardingContactV84(), { phase: 'wake', action: 'hub:onboarding-wake' });
  assert.equal(hub.player.name, 'Alex Moreau');
  assert.equal(hub.player.callsign, 'FOX-9');
  assert.equal(hub.player.operatorId, 'player-echo9');
  assert.equal(hub.npcs.find((npc) => npc.crewId === 'crew-01-mara-vega')?.name, 'Mara Vega');
}));

test('welcoming staff are anchored exactly once across all decks despite work/break/routing schedules', () => withRuntime(() => {
  for (const hour of [2, 6.5, 9, 12.5, 17]) {
    const hub = actualHub(stateAt('medical'), hour);
    const all = HUB_DECKS.flatMap((_, deck) => hub.createNpcs(deck).map((npc) => ({ ...npc, actualDeck: deck })));
    const previous = HUB_DECKS.flatMap((_, deck) => PreviousHub.prototype.createNpcs.call(hub, deck));
    assert.deepEqual(all.map((npc) => npc.crewId).sort(), previous.map((npc) => npc.crewId).sort());
    for (const [crewId, roomId] of [[DAVID, 'cryo-bay'], [TAMSIN, 'briefing']]) {
      const matches = all.filter((npc) => npc.crewId === crewId);
      assert.equal(matches.length, 1, `${crewId} at ${hour}`);
      const npc = matches[0];
      assert.equal(npc.actualDeck, 0);
      assert.equal(npc.roomId, roomId);
      assert.equal(npc.routinePhaseV62, 'onboarding-post');
      assert.equal(npc.y + npc.h, HUB_WORLD.floorY);
      assert.equal(npc.mobile, false);
      assert.equal(npc.vx, 0);
      assert.equal(npc.min, npc.x);
      assert.equal(npc.max, npc.x);
    }
  }
}));

test('onboarding posts keep the two NPC bodies clear of the room props and table', () => withRuntime(() => {
  const hub = actualHub(stateAt('medical'));
  for (const crewId of [DAVID, TAMSIN]) {
    const npc = hub.npcs.find((entry) => entry.crewId === crewId);
    const room = HUB_DECKS[0].rooms.find((entry) => entry.id === npc.roomId);
    assert.equal(overlaps(npc, room.propRenderBounds), false, `${npc.name} overlaps the visible prop`);
    assert.equal(overlaps(npc, room.propCollisionBounds), false, `${npc.name} overlaps the collider`);
  }
}));

test('Tamsin keeps a clear post and approach lane away from other scheduled NPCs, props and door bitmaps', () => withRuntime(() => {
  for (const hour of [2, 6, 6.5, 9, 12.5, 17]) {
    const hub = actualHub(stateAt('briefing'), hour);
    const tamsin = hub.npcs.find((npc) => npc.crewId === TAMSIN);
    const room = HUB_DECKS[0].rooms.find((entry) => entry.id === 'briefing');
    assert.equal(tamsin.x, 1470);
    for (const npc of hub.npcs.filter((entry) => entry.crewId !== TAMSIN && entry.alive !== false)) {
      assert.equal(overlaps(tamsin, npc), false, `${hour}h: Tamsin overlaps ${npc.name}`);
    }
    const scenery = [room.propRenderBounds, room.propCollisionBounds,
      ...hub.doorStates.map(getHubDoorBounds), ...(hub.v51Doors || []), ...(hub.v51Walls || [])];
    for (const obstacle of scenery) assert.equal(overlaps(tamsin, obstacle), false, `${hour}h: blocked post`);
    for (const offset of [-80, 80]) {
      const approach = { ...hub.player, x: tamsin.x + offset, y: HUB_WORLD.floorY - hub.player.h };
      assert.ok(approach.x >= room.xStart && approach.x + approach.w <= room.xEnd);
      for (const obstacle of scenery) assert.equal(overlaps(approach, obstacle), false, `${hour}h: blocked approach ${offset}`);
      Object.assign(hub.player, approach);
      assert.equal(hub.onboardingContactV84()?.crewId, TAMSIN, `${hour}h: inaccessible approach ${offset}`);
    }
  }
}));

test('complete, legacy and editor modes return the inherited NPC roster unchanged', () => withRuntime(() => {
  for (const onboarding of [null, stateAt('complete')]) {
    const hub = actualHub(onboarding);
    assert.equal(hub.onboardingActiveV84(), false);
    for (let deck = 0; deck < HUB_DECKS.length; deck += 1) assert.deepEqual(hub.createNpcs(deck), PreviousHub.prototype.createNpcs.call(hub, deck));
  }
  const hub = actualHub(stateAt('medical'));
  hub.editorPlaytest = true;
  assert.equal(hub.onboardingActiveV84(), false);
  for (let deck = 0; deck < HUB_DECKS.length; deck += 1) assert.deepEqual(hub.createNpcs(deck), PreviousHub.prototype.createNpcs.call(hub, deck));
}));

test('finishing onboarding restores normal routines without duplicate actors or resetting player position', () => withRuntime(() => {
  const hub = actualHub(stateAt('briefing'), 9);
  const position = { x: hub.player.x, y: hub.player.y };
  hub.setOnboardingV84(stateAt('complete'));
  assert.deepEqual({ x: hub.player.x, y: hub.player.y }, position);
  assert.equal(hub.onboardingActiveV84(), false);
  const withoutRenderSample = (npc) => { const copy = { ...npc }; delete copy.v52Animation; return copy; };
  assert.deepEqual(hub.npcs.map(withoutRenderSample), PreviousHub.prototype.createNpcs.call(hub, 0));
  const all = HUB_DECKS.flatMap((_, deck) => hub.createNpcs(deck));
  assert.equal(new Set(all.map((npc) => npc.crewId)).size, all.length);
  assert.equal(all.some((npc) => npc.routinePhaseV62 === 'onboarding-post'), false);
}));

for (const phase of ['medical', 'briefing']) {
  test(`${phase} contact needs the matching room, named living NPC and close horizontal/vertical position`, () => {
    const hub = contactFixture(phase);
    const expected = phase === 'medical' ? DAVID : TAMSIN;
    assert.equal(hub.onboardingContactV84().crewId, expected);
    const before = structuredClone(hub.onboardingV84);
    assert.equal(hub.onboardingContactV84().action, 'hub:onboarding-dialogue');
    assert.deepEqual(hub.onboardingV84, before, 'finding a contact must not advance the dialogue');
    const initial = { ...hub.player };
    hub.player.x = hub.npcs[0].x - 118;
    assert.equal(hub.onboardingContactV84(), null);
    Object.assign(hub.player, initial, { y: initial.y - 64 });
    assert.equal(hub.onboardingContactV84(), null);
    Object.assign(hub.player, initial);
    hub.npcs[0].alive = false;
    assert.equal(hub.onboardingContactV84(), null);
    hub.npcs[0].alive = true;
    hub.npcs[0].crewId = 'crew-01-mara-vega';
    assert.equal(hub.onboardingContactV84(), null);
  });
}

test('wrong deck, wrong room, dead player, annex, editor, complete and legacy state cannot trigger prologue', () => {
  for (const patch of [
    (hub) => { hub.state.deck = 1; }, (hub) => { hub.player.x = 200; },
    (hub) => { hub.player.alive = false; }, (hub) => { hub.isAnnexActiveV71 = () => true; },
    (hub) => { hub.editorPlaytest = true; }, (hub) => { hub.onboardingV84 = stateAt('complete'); },
    (hub) => { hub.onboardingV84 = null; }
  ]) {
    const hub = contactFixture();
    patch(hub);
    assert.equal(hub.onboardingContactV84(), null);
  }
});

test('wake confirmation only exists by the cryopod, not anywhere in the cryo room', () => {
  const hub = contactFixture('wake');
  hub.player.x = ONBOARDING_SPAWN_V84.positionX;
  assert.equal(hub.onboardingContactV84()?.action, 'hub:onboarding-wake');
  hub.player.x = 4000;
  assert.equal(hub.currentRoom().id, 'cryo-bay');
  assert.equal(hub.onboardingContactV84(), null);
});

test('a closed or still-opening physical door blocks conversation until 82 percent travel', () => {
  const hub = contactFixture();
  const door = { x: 4260, y: 500, w: 30, h: 124, open: false, progress: 0 };
  hub.v51Doors = [door];
  assert.equal(hub.onboardingContactV84(), null);
  door.open = true;
  door.progress = 0.2;
  assert.equal(hub.onboardingContactV84(), null, 'an open command is not yet a physically open doorway');
  door.progress = 0.82;
  assert.equal(hub.onboardingContactV84()?.crewId, DAVID);
  door.open = false;
  door.progress = 0;
  door.x = 4500;
  assert.equal(hub.onboardingContactV84()?.crewId, DAVID, 'a door beyond the two speakers is irrelevant');
});

test('interact dispatches only the physical onboarding action and otherwise delegates unchanged', (t) => {
  let inherited = 0;
  t.mock.method(PreviousHub.prototype, 'interact', () => { inherited += 1; return 'legacy'; });
  const hub = contactFixture();
  const actions = [];
  hub.onAction = (action) => actions.push(action);
  const before = structuredClone(hub.onboardingV84);
  hub.interact();
  assert.equal(actions.length, 1);
  assert.equal(actions[0].crewId, DAVID);
  assert.equal(inherited, 0);
  assert.deepEqual(hub.onboardingV84, before);
  hub.player.x = 200;
  assert.equal(hub.interact(), 'legacy');
  assert.equal(inherited, 1);
  hub.running = false;
  hub.interact();
  assert.equal(inherited, 1);
});

test('wake holds movement without healing, then medical returns to actual inherited gameplay updates', (t) => {
  const updates = [];
  t.mock.method(PreviousHub.prototype, 'update', (delta) => updates.push(delta));
  const hub = contactFixture('wake');
  Object.assign(hub, { animationTime: 1, jumpQueued: 1, emitStatus() {} });
  Object.assign(hub.player, { x: 4560, vx: 200, vy: -100 });
  hub.update(0.1);
  assert.equal(hub.animationTime, 1.1);
  assert.equal(hub.player.x, 4560);
  assert.equal(hub.player.vx, 0);
  assert.equal(hub.player.vy, 0);
  assert.equal(hub.player.health, 31);
  assert.equal(hub.jumpQueued, 0);
  assert.deepEqual(updates, []);
  hub.onboardingV84 = stateAt('medical');
  hub.update(0.2);
  assert.deepEqual(updates, [0.2]);
});

test('onboarding gates only its lifts/fire and delegates their original behavior after completion or for legacy', (t) => {
  const calls = [];
  t.mock.method(PreviousHub.prototype, 'useLift', (...args) => { calls.push(['lift', ...args]); return 'lift-result'; });
  t.mock.method(PreviousHub.prototype, 'fire', (...args) => { calls.push(['fire', ...args]); return 'fire-result'; });
  const hub = contactFixture();
  assert.equal(hub.useLift(1), false);
  assert.equal(hub.fire('test'), false);
  assert.deepEqual(calls, []);
  for (const onboarding of [stateAt('complete'), null]) {
    hub.onboardingV84 = onboarding;
    assert.equal(hub.useLift(1), 'lift-result');
    assert.equal(hub.fire('test'), 'fire-result');
  }
  assert.deepEqual(calls, [['lift', 1], ['fire', 'test'], ['lift', 1], ['fire', 'test']]);
});
