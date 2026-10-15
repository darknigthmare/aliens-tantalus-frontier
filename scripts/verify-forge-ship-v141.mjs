import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HubGame as NativeHub } from '../src/hub-opening-v88.js';
import { withHubTrainingV132 } from '../src/hub-training-v132.js';
import { withHubAuthoredCompositionV133 } from '../src/hub-authored-composition-v133.js';
import { withHubRoomParallaxV134 } from '../src/hub-room-parallax-v134.js';
import { withHubSpatialDesignV136 } from '../src/hub-spatial-design-v136.js';
import { withHubRoomDressingV134 } from '../src/hub-room-dressing-v134.js';
import { withHubRoomLifeV136 } from '../src/hub-room-life-v136.js';
import { withHubNpcLifeV136 } from '../src/npc-life-v136.js';
import { withHubCirculationV137 } from '../src/hub-circulation-v137.js';
import { withHubRoomIdentityV137 } from '../src/hub-room-identity-v137.js';
import { withHubDestinationSignsV138 } from '../src/hub-destination-signage-runtime-v138.js';
import { withForgeShipRuntimeV141, FORGE_SHIP_BOUNDS_V141 } from '../src/forge-ship-runtime-v141.js';
import { withForgeDecorationV141 } from '../src/forge-decoration-v141.js';
import { forgeBoxesOverlapV141, captureForgeRoomV141 } from '../src/forge-journey-v141.js';

// Exact application composition. DOM, unavailable bitmap decoding, Canvas and
// RAF are the only doubles: actor movement, keys, geometry, combat and callbacks
// execute the production classes without replacing their methods.
const PreviousHub = [withHubTrainingV132, withHubAuthoredCompositionV133, withHubRoomParallaxV134,
  withHubSpatialDesignV136, withHubRoomDressingV134, withHubRoomLifeV136, withHubNpcLifeV136,
  withHubCirculationV137, withHubRoomIdentityV137, withHubDestinationSignsV138]
  .reduce((Game, decorate) => decorate(Game), NativeHub);
const ProductionHub = withForgeDecorationV141(withForgeShipRuntimeV141(PreviousHub));
const box = value => Object.fromEntries(['x', 'y', 'w', 'h'].map(key => [key, value[key]]));

function host() {
  const events = new EventTarget(), texts = [], frames = [];
  for (const key of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[key] = events[key].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.Image = class extends EventTarget { complete = false; naturalWidth = 0; naturalHeight = 0; };
  globalThis.requestAnimationFrame = callback => { frames.push(callback); return frames.length; };
  globalThis.cancelAnimationFrame = () => {};
  const ctx = new Proxy({ fillText: value => texts.push(String(value)),
    measureText: value => ({ width: String(value).length * 8 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) },
  { get: (target, key) => target[key] ?? (() => {}), set: (target, key, value) => (target[key] = value, true) });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, style: {}, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const key = (type, code) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { code, repeat: false, ctrlKey: false, altKey: false, metaKey: false });
    events.dispatchEvent(event);
  };
  return { canvas, key, texts, frames };
}

export function shipProjectV141({ bidirectional = true, blocked = false, hazard = false, enemy = false,
  objectiveInEntry = true, destinationSize = [32, 18] } = {}) {
  const room = (id, size) => ({ id, name: `Salle ${id.toUpperCase()}`, size, cells: [] });
  const a = room('a', [32, 18]), b = room('b', destinationSize);
  const add = (room, id, x, y, type) => room.cells.push({ id: `${room.id}-${id}`, x, y, type,
    layer: ['floor', 'wall', 'door', 'platform'].includes(type) ? 'structure' : 'gameplay' });
  for (const r of [a, b]) for (let x = 0; x < r.size[0]; x++) add(r, `floor-${x}`, x, r.size[1] - 3, 'floor');
  add(a, 'spawn', 1, 14, 'spawn');
  if (objectiveInEntry) add(a, 'objective', 3, 14, 'objective');
  add(a, 'terminal', 5, 14, 'terminal');
  add(a, 'local-door', 7, 14, 'door');
  add(a, 'exit', 11, 14, 'door');
  if (hazard) add(a, 'hazard', 4, 14, 'hazard');
  if (enemy) add(a, 'enemy', 9, 14, 'enemy');
  add(b, 'exit', 2, b.size[1] - 4, 'door');
  add(b, 'objective', Math.min(5, b.size[0] - 2), b.size[1] - 4, 'objective');
  if (blocked) for (const x of [0, 1, 2, 3, 4]) for (let y = b.size[1] - 7; y < b.size[1] - 3; y++) {
    if (x === 2 && y === b.size[1] - 4) continue;
    add(b, `block-${x}-${y}`, x, y, 'wall');
  }
  return { schema: 3, kind: 'ship', name: 'Forge ship V141', activeRoomId: 'a', rooms: [a, b], links: [
    { id: 'sas-ab', from: { roomId: 'a', cellId: 'a-exit' }, to: { roomId: 'b', cellId: 'b-exit' }, bidirectional }
  ] };
}

function fixture(t, project = shipProjectV141(), hubState = {}, options = {}) {
  const browser = host(), actions = [], patches = [], statuses = [], ticks = { refuge: 0, companion: 0 };
  const campaign = { hub: structuredClone(hubState), clock: { day: 8, hour: 17 }, resources: { credits: 123 },
    opening: { phase: 'berth' }, missions: ['live-operation'] }, before = structuredClone(campaign);
  const engine = new ProductionHub(browser.canvas, { onAction: event => actions.push(structuredClone(event)),
    onPersist: patch => patches.push(structuredClone(patch)), onStatus: status => statuses.push(structuredClone(status)) });
  engine.onRefugeTickV87 = () => ticks.refuge++;
  engine.onCompanionTickV87 = () => ticks.companion++;
  engine.start(campaign.hub, { editorProject: project, forgeJourneyV141: true, ...options });
  t.after(() => engine.stop(false));
  return { ...browser, engine, actions, patches, statuses, ticks, campaign, before };
}
function tick(subject, seconds) {
  for (let elapsed = 0; elapsed < seconds - 1e-9; elapsed += 1 / 60) subject.engine.update(Math.min(1 / 60, seconds - elapsed));
}
function tap(subject, code) { subject.key('keydown', code); subject.key('keyup', code); }
function walkTo(subject, x) {
  const start = subject.engine.player.x, code = x >= start ? 'KeyD' : 'KeyA', direction = x >= start ? 1 : -1;
  subject.key('keydown', code);
  let frame = 0;
  while ((x - subject.engine.player.x) * direction > 2 && frame++ < 1800) subject.engine.update(1 / 60);
  subject.key('keyup', code);
  tick(subject, .05);
  assert.ok(Math.abs(subject.engine.player.x - x) < 28, `Marine stopped at ${subject.engine.player.x}, target ${x}`);
}
function clearLocalDoor(subject) {
  walkTo(subject, 1090);
  tap(subject, 'KeyE');
  assert.equal(subject.engine.v51Doors.find(door => door.id === 'a-local-door').open, true);
  tick(subject, .4);
}
function goToExit(subject) { clearLocalDoor(subject); walkTo(subject, 1740); }
function validateEntryObjective(subject) {
  if (subject.engine.v51Terminals.some(terminal => !terminal.activated)) { walkTo(subject, 840); tap(subject, 'KeyE'); }
  walkTo(subject, 520); tap(subject, 'KeyE');
}

test('full stack isolates campaign crises, annexes, commercial routines and companion ticks while preserving health', t => {
  const hubState = { playerHealth: 67, deck: 2, roomId: 'armory', visited: ['armory'],
    activeCrisis: { id: 'live-crisis', kind: 'synthetic', count: 9 },
    commercialV71: { schema: 71, registryVersion: 137, activeAnnexId: 'morgue' },
    ventTransitV62: { actor: { id: 'live-vent' } }, npcRoutineState: { schema: 62, entries: {} } };
  const source = shipProjectV141(), original = structuredClone(source);
  const subject = fixture(t, source, hubState, { routineContextV62: { crisis: hubState.activeCrisis, clock: { day: 8, hour: 17 } } });
  assert.equal(subject.engine.player.health, 67);
  assert.equal(subject.engine.isAnnexActiveV71(), false);
  assert.equal(subject.engine.currentAnnexV71(), null);
  assert.equal(subject.engine.crisis, null);
  assert.equal(subject.engine.enemies.length, 0);
  assert.equal(subject.engine.npcs.length, 0);
  assert.equal(subject.engine.doorStates.length, 0);
  assert.deepEqual(subject.engine.getNpcRoutineResolutionsV62(), []);
  tick(subject, 2);
  assert.deepEqual(subject.ticks, { refuge: 0, companion: 0 });
  assert.deepEqual(subject.campaign, subject.before);
  assert.deepEqual(source, original);
  assert.ok(subject.patches.every(patch => patch.forgeSessionV141 && !('commercialV71' in patch) && !('npcRoutineState' in patch)));
  assert.ok(subject.statuses.every(status => status.deckName === 'FRONTIER FORGE' && status.roomId === 'a'));
  assert.equal(subject.actions.length, 0);
});

test('objectives require E and source room remains authoritative past the historical 1280px room boundary', t => {
  const subject = fixture(t);
  walkTo(subject, 520);
  tick(subject, .2);
  assert.equal(subject.engine.v51Objectives[0].complete, false);
  assert.match(subject.engine.statusPrompt(), /OBJECTIF VERROUILLÉ.*TERMINAUX/);
  tap(subject, 'KeyE');
  assert.equal(subject.engine.v51Objectives[0].complete, false, 'E cannot bypass the room terminal.');
  assert.equal(subject.actions.at(-1).action, 'editor:objective-locked');
  walkTo(subject, 840); tap(subject, 'KeyE');
  assert.equal(subject.engine.v51Terminals[0].activated, true);
  walkTo(subject, 520);
  assert.match(subject.engine.statusPrompt(), /E — VALIDER/);
  tap(subject, 'KeyE');
  assert.equal(subject.engine.v51Objectives[0].complete, true);
  goToExit(subject);
  assert.ok(subject.engine.player.x > 1280);
  assert.equal(subject.engine.currentRoom().id, 'a');
  assert.equal(subject.engine.state.roomId, 'a');
  assert.equal(subject.engine.forgeSessionV141.transitions, 0);
});

test('every terminal in the current room must be activated before its objective can complete', t => {
  const project = shipProjectV141();
  project.rooms[0].cells.push({ id: 'a-second-terminal', x: 4, y: 14, type: 'terminal', layer: 'gameplay' });
  const subject = fixture(t, project);
  walkTo(subject, 700); tap(subject, 'KeyE');
  assert.equal(subject.engine.v51Terminals.find(terminal => terminal.id === 'a-second-terminal').activated, true);
  assert.equal(subject.engine.v51Terminals.find(terminal => terminal.id === 'a-terminal').activated, false);
  walkTo(subject, 520); tap(subject, 'KeyE');
  assert.equal(subject.engine.v51Objectives[0].complete, false);
  assert.deepEqual(subject.actions.at(-1).terminalIds, ['a-terminal']);
  walkTo(subject, 840); tap(subject, 'KeyE');
  walkTo(subject, 520); tap(subject, 'KeyE');
  assert.equal(subject.engine.v51Objectives[0].complete, true);
});

for (const type of ['door', 'terminal', 'objective']) {
  test(`a close ${type} behind an actual wall cannot be activated through the partition`, t => {
    const project = shipProjectV141();
    const a = project.rooms[0];
    a.size = [128, 72]; a.cells = [];
    const add = (id, x, y, kind, layer = 'gameplay') => a.cells.push({ id, x, y, type: kind, layer });
    for (let x = 0; x < 128; x++) add(`a-floor-${x}`, x, 69, 'floor', 'structure');
    add('a-spawn', 5, 68, 'spawn');
    add('a-objective', type === 'objective' ? 8 : 20, 68, 'objective');
    if (type === 'terminal') add('a-terminal', 8, 68, 'terminal');
    add('a-exit', type === 'door' ? 8 : 30, 68, 'door', 'structure');
    for (let y = 59; y < 69; y++) add(`a-partition-${y}`, 7, y, 'wall', 'structure');
    const subject = fixture(t, project);
    walkTo(subject, 236);
    assert.ok(subject.engine.player.x + 44 <= 280 + .01, 'The production collider stops the body at the real wall.');
    const before = structuredClone(subject.engine.forgeSessionV141), actions = subject.actions.length;
    tap(subject, 'KeyE');
    assert.equal(subject.engine.nearestForgeInteractionV141(), null);
    assert.doesNotMatch(subject.engine.statusPrompt(), /ACTIONNER|ACTIVER|VALIDER|REJOINDRE|OBJECTIF VERROUILLÉ/,
      'The visible prompt cannot advertise an interaction blocked by the wall.');
    assert.equal(subject.actions.length, actions);
    assert.deepEqual(subject.engine.forgeSessionV141, before);
    assert.equal(subject.engine.v51Doors.find(door => door.id === 'a-exit').open, false);
    assert.ok(subject.engine.v51Terminals.every(terminal => !terminal.activated));
    assert.equal(subject.engine.v51Objectives[0].complete, false);
    assert.equal(subject.engine.forgeActiveRoomIdV141, 'a');
  });
}

test('keyboard sas traversal preserves the same loop, actor, health, terminal, door and objective state across return', t => {
  const subject = fixture(t, shipProjectV141({ hazard: true }), { playerHealth: 90 });
  validateEntryObjective(subject);
  walkTo(subject, 840); tap(subject, 'KeyE');
  assert.equal(subject.engine.v51Terminals[0].activated, true);
  assert.ok(subject.engine.player.health < 90, 'The native hazard actually damages the Marine.');
  goToExit(subject);
  const actor = subject.engine.player, token = subject.engine.loopToken, frames = subject.frames.length;
  const health = actor.health, time = subject.engine.animationTime;
  tap(subject, 'KeyE');
  assert.equal(subject.engine.forgeActiveRoomIdV141, 'b');
  assert.equal(subject.engine.player, actor);
  assert.equal(subject.engine.loopToken, token);
  assert.equal(subject.frames.length, frames);
  assert.equal(subject.engine.animationTime, time);
  assert.equal(subject.engine.player.health, health);
  assert.equal(subject.engine.player.w, 44); assert.equal(subject.engine.player.h, 92);
  assert.equal(subject.engine.player.y + subject.engine.player.h, 600);
  assert.ok(!subject.engine.v51Walls.some(wall => forgeBoxesOverlapV141(actor, wall)));
  tap(subject, 'KeyE');
  assert.equal(subject.engine.forgeActiveRoomIdV141, 'a');
  assert.equal(subject.engine.forgeSessionV141.transitions, 2);
  assert.equal(subject.engine.v51Objectives[0].complete, true);
  assert.equal(subject.engine.v51Terminals[0].activated, true);
  assert.equal(subject.engine.v51Doors.find(door => door.id === 'a-local-door').open, true);
  assert.equal(subject.engine.player.health, health);
  assert.deepEqual(subject.campaign, subject.before);
});

test('living destination occupants refuse E atomically without opening source sas or consuming health', t => {
  const subject = fixture(t, shipProjectV141(), { playerHealth: 73 });
  validateEntryObjective(subject); goToExit(subject);
  // Declared Node scenario state: eight native 52×76 living bodies occupy
  // every arrival candidate after static admission. No engine method is mocked.
  const target = subject.engine.buildForgeShipRoomV141('b');
  target.enemies = [158, 210, 262, 314, 442, 494, 546, 598].map((x, index) => subject.engine.createEnemy({
    id: `b-roaming-${index}`, kind: 'xenomorph', x, y: 524, w: 52, h: 76
  }, index, 'editor'));
  captureForgeRoomV141(subject.engine.forgeSessionV141, 'b', {
    doors: target.doors, terminals: target.terminals, objectives: target.objectives,
    enemies: target.enemies, projectiles: [], hazardClock: 0
  });
  const snapshot = { player: structuredClone(subject.engine.player), session: structuredClone(subject.engine.forgeSessionV141),
    doors: structuredClone(subject.engine.v51Doors), camera: structuredClone(subject.engine.camera), patches: subject.patches.length,
    token: subject.engine.loopToken, time: subject.engine.animationTime };
  tap(subject, 'KeyE');
  assert.equal(subject.engine.forgeActiveRoomIdV141, 'a');
  assert.deepEqual(subject.engine.player, snapshot.player);
  assert.deepEqual(subject.engine.forgeSessionV141, snapshot.session);
  assert.deepEqual(subject.engine.v51Doors, snapshot.doors);
  assert.deepEqual(subject.engine.camera, snapshot.camera);
  assert.equal(subject.patches.length, snapshot.patches);
  assert.equal(subject.engine.loopToken, snapshot.token);
  assert.equal(subject.engine.animationTime, snapshot.time);
  assert.match(subject.engine.statusPrompt(), /ARRIVÉE OBSTRUÉE/);
  assert.equal(subject.actions.at(-1).action, 'editor:room-transition-refused');
});

test('static wall or missing floor rejects a replacement journey before the running actor, loop and session can change', t => {
  const subject = fixture(t);
  validateEntryObjective(subject);
  const before = { player: structuredClone(subject.engine.player), session: structuredClone(subject.engine.forgeSessionV141),
    doors: structuredClone(subject.engine.v51Doors), token: subject.engine.loopToken, patches: subject.patches.length,
    frameCount: subject.frames.length, time: subject.engine.animationTime };
  const unsupported = shipProjectV141();
  unsupported.rooms[1].cells = unsupported.rooms[1].cells.filter(cell => cell.type !== 'floor');
  for (const invalid of [shipProjectV141({ blocked: true }), unsupported]) {
    assert.throws(() => subject.engine.start({ playerHealth: 99 }, {
      editorProject: invalid, forgeJourneyV141: true
    }), /refusé/);
    assert.deepEqual(subject.engine.player, before.player);
    assert.deepEqual(subject.engine.forgeSessionV141, before.session);
    assert.deepEqual(subject.engine.v51Doors, before.doors);
    assert.equal(subject.engine.loopToken, before.token);
    assert.equal(subject.engine.animationTime, before.time);
    assert.equal(subject.patches.length, before.patches);
    assert.equal(subject.frames.length, before.frameCount);
    assert.equal(subject.engine.running, true);
  }
});

test('one-way departure waits for objectives it would strand and never invents a return link', t => {
  const subject = fixture(t, shipProjectV141({ bidirectional: false }));
  goToExit(subject); tap(subject, 'KeyE');
  assert.equal(subject.engine.forgeActiveRoomIdV141, 'a');
  assert.equal(subject.engine.forgeTransitionRefusalV141.reason, 'unfinished-objectives-behind-one-way-link');
  validateEntryObjective(subject);
  walkTo(subject, 1740); tap(subject, 'KeyE');
  assert.equal(subject.engine.forgeActiveRoomIdV141, 'b');
  tap(subject, 'KeyE');
  assert.equal(subject.engine.forgeActiveRoomIdV141, 'b');
  assert.equal(subject.engine.forgeSessionV141.transitions, 1);
});

test('transit destination needs no spawn and a different grid resolves the actual supported 44×92 arrival', t => {
  const subject = fixture(t, shipProjectV141({ destinationSize: [64, 36], objectiveInEntry: false }));
  goToExit(subject); tap(subject, 'KeyE');
  assert.equal(subject.engine.forgeActiveRoomIdV141, 'b');
  assert.deepEqual([subject.engine.compiledProject.grid.cols, subject.engine.compiledProject.grid.rows], [64, 36]);
  assert.equal(subject.engine.player.y + subject.engine.player.h, 660);
  assert.ok(subject.engine.player.x >= 24 && subject.engine.player.x + 44 <= FORGE_SHIP_BOUNDS_V141.width - 24);
  assert.equal(subject.engine.useGlobalFloor, false);
  tick(subject, .5);
  assert.equal(subject.engine.player.y + 92, 660);
});

test('native projectile kills remain dead and retain their health and identity when re-entering the authored room', t => {
  const subject = fixture(t, shipProjectV141({ enemy: true }));
  validateEntryObjective(subject); clearLocalDoor(subject);
  for (let shot = 0; shot < 6; shot++) { tap(subject, 'KeyF'); tick(subject, .24); }
  tick(subject, .5);
  const enemy = subject.engine.enemies[0];
  assert.equal(enemy.id, 'a-enemy');
  assert.equal(enemy.alive, false);
  assert.ok(enemy.health <= 0);
  const dead = structuredClone(enemy);
  walkTo(subject, 1740); tap(subject, 'KeyE'); tap(subject, 'KeyE');
  assert.equal(subject.engine.forgeActiveRoomIdV141, 'a');
  assert.deepEqual(subject.engine.enemies[0], dead);
});

test('all reachable objectives complete once and snapshots and persistence patches cannot alias the live session', t => {
  const subject = fixture(t);
  validateEntryObjective(subject); goToExit(subject); tap(subject, 'KeyE');
  walkTo(subject, 840); tap(subject, 'KeyE');
  assert.equal(subject.engine.forgeSessionV141.complete, true);
  assert.deepEqual(subject.engine.forgeSessionV141.completedObjectives, ['a-objective', 'b-objective']);
  tap(subject, 'KeyE');
  assert.equal(subject.actions.filter(event => event.action === 'editor:project-complete').length, 1);
  const snapshot = subject.engine.getSnapshot();
  snapshot.forgeJourneyV141.completedObjectives.length = 0;
  snapshot.forgeJourneyV141.roomStates.b.objectives[0].complete = false;
  subject.patches.at(-1).forgeSessionV141.roomStates.b.objectives[0].complete = false;
  assert.equal(subject.engine.v51Objectives[0].complete, true);
  assert.equal(subject.engine.forgeSessionV141.completedObjectives.length, 2);
});

test('paused Forge freezes physics and E interactions, and zero-health entry cannot revive the Marine', t => {
  const subject = fixture(t);
  const before = box(subject.engine.player), session = structuredClone(subject.engine.forgeSessionV141);
  subject.engine.pause(); subject.key('keydown', 'KeyD'); tick(subject, 2); tap(subject, 'KeyE'); subject.key('keyup', 'KeyD');
  assert.deepEqual(box(subject.engine.player), before);
  assert.deepEqual(subject.engine.forgeSessionV141, session);
  subject.engine.resume(); walkTo(subject, 520);
  assert.ok(subject.engine.player.x > before.x);
  const down = fixture(t, shipProjectV141(), { playerHealth: 0 });
  assert.equal(down.engine.player.health, 0);
  assert.equal(down.engine.player.alive, false);
  tap(down, 'KeyE');
  assert.equal(down.engine.forgeSessionV141.transitions, 0);
});

test('legacy direct Forge and native campaign starts preserve their historical behavior without the V141 opt-in', t => {
  const subject = fixture(t, shipProjectV141(), { playerHealth: 62 }, { forgeJourneyV141: false });
  assert.equal(subject.engine.forgeSessionV141, null);
  assert.equal(subject.engine.editorPlaytest, true);
  assert.equal(subject.engine.currentRoom().id, 'bridge');
  assert.ok(subject.engine.npcs.length > 0);
  walkTo(subject, 520);
  assert.equal(subject.engine.v51Objectives[0].complete, true, 'Legacy direct Forge retains its historical objective contact.');
  subject.engine.persist();
  assert.ok(subject.patches.some(patch => patch.npcRoutineState));
  subject.engine.stop(false);
  subject.engine.start({ deck: 0, roomId: 'bridge', playerHealth: 62, activeCrisis: { id: 'native-crisis', kind: 'synthetic', count: 2 } });
  assert.equal(subject.engine.forgeSessionV141, null);
  assert.equal(subject.engine.editorPlaytest, false);
  assert.equal(subject.engine.crisis.active, true);
  assert.equal(subject.engine.enemies.filter(enemy => enemy.source === 'crisis').length, 2);
  assert.equal(subject.engine.player.health, 62);
  assert.ok(subject.engine.npcs.length > 0);
});
