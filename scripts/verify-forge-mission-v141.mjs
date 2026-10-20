/** Production GameEngine; only DOM, Image and RAF are the declared V136 doubles.
 * Navigation uses native movement and actual keyboard E routing. Node fixtures
 * set explicit combat/loot states where combat randomness is not under test. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { missionV136 } from './forge-native-host-v136.mjs';
import { forgeBoxesOverlapV141 } from '../src/forge-journey-v141.js';
import { EQUIPMENT } from '../src/content.js';

function room(id, { doorX = 6, goalX = 3, spawnX = 1, terminals = false, enemy = false, size = [32, 18] } = {}) {
  const cell = (suffix, x, y, type, layer = 'gameplay') => ({ id: `${id}-${suffix}`, x, y, type, layer });
  const [columns, rows] = size;
  return { id, name: `Salle ${id.toUpperCase()}`, size, cells: [
    ...Array.from({ length: columns }, (_, x) => cell(`floor-${x}`, x, rows - 2, 'floor', 'structure')),
    cell('spawn', spawnX, rows - 3, 'spawn'), cell('goal', goalX, rows - 3, 'objective'), cell('door', doorX, rows - 3, 'door'),
    ...(terminals ? [cell('power', 8, rows - 3, 'terminal'), cell('archive', 10, rows - 3, 'terminal')] : []),
    ...(enemy ? [cell('enemy', 16, rows - 3, 'enemy')] : [])
  ] };
}

const project = ({ oneWay = false, extra = false, terminals = false, enemy = false } = {}) => ({ schema: 3, kind: 'mission', name: 'V141 traversal', activeRoomId: 'a',
  rooms: [room('a'), room('b', { doorX: 2, goalX: 5, terminals, enemy }), ...(extra ? [room('c')] : [])],
  links: [{ id: 'ab', from: { roomId: 'a', cellId: 'a-door' }, to: { roomId: 'b', cellId: 'b-door' }, bidirectional: !oneWay }] });
function start(t, input = project(), extra = {}) {
  const runtime = missionV136({ editorProject: input, forgeJourneyV141: true, ...extra });
  t.after(() => runtime.engine.stop()); return runtime;
}
function walk(engine, direction, until, frames = 1600) {
  const key = direction > 0 ? 'KeyD' : 'KeyA'; engine.keys.add(key);
  for (let index = 0; index < frames && !until(); index++) engine.update(1 / 60);
  engine.keys.delete(key); assert.ok(until(), `native walk ${key} reached its target at ${engine.player.x}`);
}
function key(runtime, code = 'KeyE') {
  for (const type of ['keydown', 'keyup']) {
    const event = new Event(type, { cancelable: true }); Object.defineProperties(event, { code: { value: code }, repeat: { value: false } });
    runtime.events.dispatchEvent(event);
  }
}
function reachDoor(runtime) { walk(runtime.engine, 1, () => Boolean(runtime.engine.forgeLinkedDoorV141())); }
function reachGoal(runtime, direction = 1) {
  walk(runtime.engine, direction, () => Math.abs(runtime.engine.player.x + 21 - runtime.engine.objective.x - runtime.engine.objective.w / 2) < 85);
}
function assertSafe(engine) {
  assert.ok(engine.player.grounded); assert.equal(engine.player.y + engine.player.h, 960);
  assert.ok(engine.player.x >= 0 && engine.player.x + engine.player.w <= 6200);
  for (const solid of [...engine.walls, ...engine.platforms, ...engine.doors.filter(door => !door.open)]) assert.equal(forgeBoxesOverlapV141(engine.player, solid), false);
}

test('V141 is explicitly activated; V140 direct schema3 retains the existing single-room behavior', t => {
  const { engine } = missionV136({ editorProject: project() }); t.after(() => engine.stop());
  assert.equal(engine.forgeSessionV141, null); assert.equal(engine.forgeActiveRoomIdV141, null);
});

test('native walking and keyboard E change rooms without restarting or refilling the Marine', t => {
  const input = project(), before = structuredClone(input), runtime = start(t, input), { engine } = runtime;
  const player = engine.player, coop = engine.coop, mission = engine.mission, inventory = engine.inventory,
    equipment = engine.equipmentActions, generation = engine.loopGeneration;
  Object.assign(player, { health: 63, armor: 17, ammo: 3, ammoReserve: 29 });
  reachDoor(runtime); const elapsed = engine.mission.elapsed; key(runtime);
  assert.equal(engine.forgeActiveRoomIdV141, 'b'); assert.equal(engine.loopGeneration, generation);
  assert.equal(engine.player, player); assert.equal(engine.coop, coop); assert.equal(engine.mission, mission);
  assert.equal(engine.inventory, inventory); assert.equal(engine.equipmentActions, equipment);
  for (const [field, value] of Object.entries({ health: 63, armor: 17, ammo: 3, ammoReserve: 29 })) assert.equal(player[field], value);
  assert.equal(mission.elapsed, elapsed); assert.equal(mission.state, 'active'); assertSafe(engine);
  assert.equal(engine.doors[0].open, true); assert.equal(engine.forgeSessionV141.transitions, 1);
  assert.ok(runtime.messages.some(event => event.type === 'forge-room-transition')); assert.deepEqual(input, before);
});

test('an obstructed destination refuses atomically, including room state, position and RNG', t => {
  const runtime = start(t), { engine } = runtime; reachDoor(runtime);
  // A mobile/runtime obstruction appears after static admission, as in combat.
  const destination = engine.prepareForgeMissionRoomV141('b');
  destination.walls.push({ id: 'dynamic-obstruction', x: 0, y: 800, w: 1600, h: 160 });
  engine.forgeSessionV141.roomStates.b = destination;
  const player = structuredClone(engine.player), mission = structuredClone(engine.mission), platforms = engine.platforms,
    doors = engine.doors, enemies = engine.enemies, random = engine.random, session = structuredClone(engine.forgeSessionV141);
  key(runtime);
  assert.deepEqual(engine.player, player); assert.deepEqual(engine.mission, mission);
  assert.equal(engine.platforms, platforms); assert.equal(engine.doors, doors); assert.equal(engine.enemies, enemies); assert.equal(engine.random, random);
  assert.deepEqual(engine.forgeSessionV141, session); assert.equal(engine.doors[0].open, false);
  assert.ok(runtime.messages.some(event => event.type === 'locked' && /ARRIVÉE/.test(event.requirement)));
});

test('door, terminal, dead enemies and taken loot stay local across a round trip', t => {
  const runtime = start(t, project({ terminals: true, enemy: true })), { engine } = runtime;
  reachDoor(runtime); key(runtime); assert.equal(engine.forgeActiveRoomIdV141, 'b');
  // Explicit Node combat/loot fixtures; no actor teleportation is needed.
  engine.enemies[0].alive = false; engine.enemies[0].health = 0; engine.enemies[0].deathClock = 4;
  engine.drops.push({ id: 'local-loot', type: 'security-key', x: 3900, y: 920, w: 24, h: 24, taken: true });
  walk(engine, 1, () => engine.player.x > engine.powerNode.x - 90); key(runtime); assert.equal(engine.powerNode.active, true);
  engine.update(1); walk(engine, 1, () => engine.player.x > engine.archiveTerminal.x - 90); key(runtime); assert.equal(engine.archiveTerminal.recovered, true);
  walk(engine, -1, () => Boolean(engine.forgeLinkedDoorV141())); key(runtime); assert.equal(engine.forgeActiveRoomIdV141, 'a');
  assert.equal(engine.powerNode, null); assert.equal(engine.enemies.length, 0); assert.equal(engine.drops.length, 0);
  key(runtime); assert.equal(engine.forgeActiveRoomIdV141, 'b'); assertSafe(engine);
  assert.equal(engine.powerNode.active, true); assert.equal(engine.archiveTerminal.recovered, true);
  assert.equal(engine.enemies[0].alive, false); assert.equal(engine.enemies[0].health, 0);
  assert.equal(engine.drops.find(drop => drop.id === 'local-loot').taken, true); assert.equal(engine.doors[0].open, true);
});

test('every reachable objective is required, disconnected objectives are excluded and extraction requires confirmation', t => {
  const runtime = start(t, project({ extra: true })), { engine } = runtime;
  assert.deepEqual(engine.forgeRequiredObjectivesV141, ['a-goal', 'b-goal']);
  reachGoal(runtime); key(runtime); assert.equal(engine.mission.state, 'active'); assert.equal(engine.objective.complete, true);
  assert.equal(engine.completeMission(engine.player), false); key(runtime); assert.equal(engine.mission.state, 'active');
  reachDoor(runtime); key(runtime); reachGoal(runtime); key(runtime);
  assert.equal(engine.mission.state, 'active'); assert.deepEqual(engine.forgeSessionV141.completedObjectives, ['a-goal', 'b-goal']);
  key(runtime); assert.equal(engine.mission.state, 'complete'); assert.equal(engine.mission.rewards.scope, 'forge-playtest');
  for (const key of ['credits', 'salvage', 'intel', 'apex', 'cargo']) assert.equal(engine.mission.rewards[key], 0);
});

test('one-way departure refuses a stranded unfinished source goal, then accepts the completed linear journey', t => {
  const runtime = start(t, project({ oneWay: true })), { engine } = runtime; reachDoor(runtime); key(runtime);
  assert.equal(engine.forgeActiveRoomIdV141, 'a'); assert.equal(engine.forgeSessionV141.transitions, 0);
  reachGoal(runtime, -1); key(runtime); assert.deepEqual(engine.forgeSessionV141.completedObjectives, ['a-goal']);
  reachDoor(runtime); key(runtime); assert.equal(engine.forgeActiveRoomIdV141, 'b'); assert.equal(engine.forgeLinkedDoorV141(), null);
  reachGoal(runtime); key(runtime); key(runtime); assert.equal(engine.mission.state, 'complete');
});

test('a malformed flagged project is rejected before the live Mission is changed', t => {
  const runtime = start(t), { engine } = runtime, before = { player: engine.player, mission: engine.mission, session: engine.forgeSessionV141 };
  const input = project(); input.links[0].to.cellId = 'b-goal';
  assert.throws(() => engine.start({ ...runtime.options, editorProject: input }));
  for (const [field, value] of Object.entries(before)) assert.equal(engine[field === 'session' ? 'forgeSessionV141' : field], value);
  assert.equal(engine.running, true);
});

test('cooperative actors arrive on separate supported footprints with their wounds and ammunition intact', t => {
  const runtime = start(t), { engine } = runtime; engine.setCoop(true);
  Object.assign(engine.coop, { health: 41, armor: 7, ammo: 2, ammoReserve: 11 });
  const coop = engine.coop; reachDoor(runtime); key(runtime);
  assert.equal(engine.forgeActiveRoomIdV141, 'b'); assert.equal(engine.coop, coop); assertSafe(engine);
  assert.equal(coop.y + coop.h, 960); assert.equal(coop.grounded, true); assert.equal(forgeBoxesOverlapV141(engine.player, coop), false);
  for (const [field, value] of Object.entries({ health: 41, armor: 7, ammo: 2, ammoReserve: 11 })) assert.equal(coop[field], value);
});

test('a busy teammate refuses the whole transition without cancelling their task', t => {
  const runtime = start(t), { engine } = runtime; engine.setCoop(true); reachDoor(runtime);
  const task = { type: 'deploy', instanceId: 'node-busy-fixture' };
  engine.placeableTasksV86.set('coop', task); const before = structuredClone(engine.player); key(runtime);
  assert.equal(engine.forgeActiveRoomIdV141, 'a'); assert.deepEqual(engine.player, before); assert.equal(engine.placeableTasksV86.get('coop'), task);
});

test('native bullets are frozen in their room and restore their real operator owner on return', t => {
  const runtime = start(t), { engine } = runtime; reachDoor(runtime);
  // At interaction range the closed door correctly withdraws a forward gun.
  // Use the native directional lock to fire into the clear space above it.
  engine.keys.add('ShiftLeft'); engine.keys.add('KeyW');
  engine.resolvePlayerCombatAimV83(engine.player);
  const held = engine.resolvePlayerWeaponPoseV125(engine.player, engine.player.combatAimV83,
    { requireReady: false, shotPreviewV160: true });
  assert.equal(held.armReachV160.feasible, true); assert.equal(held.weaponWithdrawalV160, undefined);
  const ammo = engine.player.ammo; assert.equal(engine.fire(engine.player), true); assert.equal(engine.player.ammo, ammo - 1);
  assert.equal(engine.bullets.at(-1).vx, 0); assert.ok(engine.bullets.at(-1).vy < 0);
  engine.keys.delete('ShiftLeft'); engine.keys.delete('KeyW');
  assert.ok(engine.bullets.some(bullet => bullet.owner === engine.player)); const sourceBullets = engine.bullets.length;
  key(runtime); assert.equal(engine.bullets.length, 0); assert.equal(engine.player.ammo, ammo - 1);
  key(runtime); assert.equal(engine.forgeActiveRoomIdV141, 'a'); assert.equal(engine.bullets.length, sourceBullets);
  assert.ok(engine.bullets.every(bullet => bullet.owner === engine.player));
});

test('deployed equipment stays in its room while carried equipment and consumed charges follow the Marine', t => {
  const equipment = ['Portable Sentry', 'Ammo Satchel'].map(name => EQUIPMENT.find(item => item.name === name));
  assert.ok(equipment.every(Boolean));
  const runtime = start(t, project(), { equipment }), { engine } = runtime;
  engine.update(1 / 60);
  const sentry = engine.placeablesV86.instances.find(item => item.name === 'Portable Sentry'); assert.ok(sentry);
  const carried = engine.placeablesV86.instances.find(item => item.name === 'Ammo Satchel'); assert.ok(carried);
  assert.equal(engine.useEquipment(sentry.catalogId), true); assert.equal(engine.confirmPlaceableV86(), true);
  engine.updateEquipmentDeployments(3); assert.equal(sentry.status, 'deployed'); sentry.ammo = 17;
  const state = engine.equipmentActions.get(sentry.catalogId), remaining = state.remaining;
  reachDoor(runtime); key(runtime);
  assert.equal(engine.placeablesV86.instances.some(item => item.instanceId === sentry.instanceId), false);
  assert.equal(engine.placeablesV86.instances.find(item => item.instanceId === carried.instanceId), carried);
  assert.equal(state.remaining, remaining); key(runtime);
  const restored = engine.placeablesV86.instances.find(item => item.instanceId === sentry.instanceId);
  assert.equal(restored.status, 'deployed'); assert.equal(restored.ammo, 17); assert.equal(state.remaining, remaining);
});

test('a transit entry without a goal reaches a destination without an unused insertion marker', t => {
  const input = project({ oneWay: true }); input.rooms[0].cells = input.rooms[0].cells.filter(cell => cell.type !== 'objective');
  input.rooms[1].cells = input.rooms[1].cells.filter(cell => cell.type !== 'spawn');
  const runtime = start(t, input), { engine } = runtime; assert.equal(engine.objective, null);
  reachDoor(runtime); key(runtime); assert.equal(engine.forgeActiveRoomIdV141, 'b'); assertSafe(engine);
  reachGoal(runtime); key(runtime); key(runtime); assert.equal(engine.mission.state, 'complete');
});

test('single-room V141 validates its objective before a separate extraction confirmation', t => {
  const input = project(); input.rooms = [input.rooms[0]]; input.links = [];
  const runtime = start(t, input), { engine } = runtime; reachGoal(runtime); key(runtime);
  assert.equal(engine.objective.complete, true); assert.equal(engine.mission.state, 'active');
  key(runtime); assert.equal(engine.mission.state, 'complete');
});

test('flagged startup uses a local narrative ledger and never resumes a campaign checkpoint', t => {
  const narrativeArchiveSave = { narrativeArchives: {}, progression: { missions: 7 } }, before = structuredClone(narrativeArchiveSave); let writes = 0;
  const runtime = start(t, project(), { narrativeArchiveSave, onNarrativeArchivesChange: () => writes++,
    resumeState: { schema: 1, player: { health: 1, ammo: 0 }, mission: { state: 'complete' } } });
  assert.deepEqual(narrativeArchiveSave, before); assert.notEqual(runtime.engine.evidenceSaveV132, narrativeArchiveSave);
  assert.equal(writes, 0); assert.equal(runtime.engine.lastResumeResult.reason, 'not-requested'); assert.equal(runtime.engine.mission.state, 'active');
});

for (const size of [[64, 36], [128, 72]]) test(`mixed-grid journey uses the native destination support at ${size}`, t => {
  const input = project(); input.rooms[1] = room('b', { size, doorX: 3, goalX: 8 });
  const runtime = start(t, input), { engine } = runtime; reachDoor(runtime); key(runtime);
  assert.equal(engine.forgeActiveRoomIdV141, 'b'); assert.equal(engine.editorGridV136.columns, size[0]);
  assert.equal(engine.player.y + engine.player.h, (size[1] - 2) * 1080 / size[1]);
  assert.equal(engine.player.grounded, true);
  assert.equal(engine.platforms.some(surface => surface.y === engine.player.y + engine.player.h
    && surface.x <= engine.player.x + engine.player.w && surface.x + surface.w >= engine.player.x), true);
});

test('Forge HUD reports the current room and global goals while native combat resources stay intact', t => {
  const runtime = start(t), { engine } = runtime, before = structuredClone(engine.player), labels = [];
  const context = engine.canvas.getContext('2d'), original = context.fillText;
  context.fillText = (text, x, y) => labels.push({ text, x, y });
  try { engine.drawHud(context); } finally { context.fillText = original; }
  assert.deepEqual(engine.player, before);
  assert.deepEqual(engine.getForgeMissionHudV141(), { location:'SALLE · Salle A',objectives:'OBJECTIFS GLOBAUX 0/2',context:'PARCOURS FORGE · SESSION',progress:0 });
  assert.equal(labels.filter(label => label.x === 34 && label.y === 81).at(-1).text, 'SALLE · Salle A');
  assert.ok(labels.some(label => label.text === 'OBJECTIFS GLOBAUX 0/2'));
  assert.ok(labels.some(label => label.text === 'PARCOURS FORGE · SESSION'));
});

for (const kind of ['door','objective','terminal']) test(`a real wall between the Marine and a nearby ${kind} blocks E`, t => {
  const input = project();
  if (kind === 'terminal') {
    input.rooms[0].cells = input.rooms[0].cells.filter(cell => cell.type !== 'objective');
    input.rooms[0].cells.push({id:'a-power',x:4,y:15,type:'terminal',layer:'gameplay'});
  }
  const runtime = start(t,input), {engine} = runtime;
  if (kind === 'door') reachDoor(runtime);
  else if (kind === 'objective') reachGoal(runtime);
  else walk(engine,1,()=>Math.abs(engine.player.x+21-engine.powerNode.x-engine.powerNode.w/2)<85);
  const target = kind === 'door' ? engine.doors[0] : kind === 'objective' ? engine.objective : engine.powerNode;
  const middle = (engine.player.x+engine.player.w/2+target.x+target.w/2)/2;
  engine.walls.push({id:'node-fixture-divider',x:middle-4,y:0,w:8,h:960});
  const before = structuredClone(engine.forgeSessionV141); key(runtime);
  assert.equal(engine.forgeActiveRoomIdV141,'a'); assert.deepEqual(engine.forgeSessionV141,before);
  if (kind === 'terminal') assert.equal(engine.powerNode.active,false);
  assert.ok(runtime.messages.some(event=>event.type==='locked'&&/CLOISON/.test(event.requirement)));
});
