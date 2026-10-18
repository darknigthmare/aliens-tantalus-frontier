/** Production Mission/Ship classes. Only DOM, Canvas, Image and RAF use the
 * declared V136 host doubles; persistence crosses actual JSON and fresh engines. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { missionV136, hostV136 } from './forge-native-host-v136.mjs';
import { HubGame } from '../src/hub-v51-runtime.js';
import { withForgeShipRuntimeV141 } from '../src/forge-ship-runtime-v141.js';
import { CREW, EQUIPMENT, VEHICLES } from '../src/content.js';
import { openForgeNarrativeV156, chooseForgeNarrativeV156 } from '../src/forge-narrative-v156.js';
import { FORGE_CHECKPOINT_STORAGE_KEY_V157, FORGE_CHECKPOINT_LIMITS_V157, ForgePlaytestCheckpointStoreV157,
  encodeForgeCheckpointGraphV157, decodeForgeCheckpointGraphV157, captureForgePlaytestCheckpointV157,
  inspectForgePlaytestCheckpointV157, prepareForgePlaytestCheckpointV157, applyForgePlaytestCheckpointV157 } from '../src/forge-playtest-checkpoint-v157.js';
import { mountForgePlaytestCheckpointUIV157 } from '../src/forge-playtest-checkpoint-ui-v157.js';

function project(kind = 'mission', { story = false, enemies = false } = {}) {
  const room = (id, entry) => ({ id, name: id.toUpperCase(), size: [32, 18], cells: [
    ...Array.from({ length: 32 }, (_, x) => ({ id: `${id}-f${x}`, x, y: kind === 'mission' ? 16 : 15, type: 'floor', layer: 'structure' })),
    ...(entry ? [{ id: `${id}-spawn`, x: 2, y: kind === 'mission' ? 15 : 14, type: 'spawn', layer: 'gameplay' }] : []),
    { id: `${id}-goal`, x: 20, y: kind === 'mission' ? 15 : 14, type: 'objective', layer: 'gameplay' },
    { id: `${id}-door`, x: entry ? 6 : 2, y: kind === 'mission' ? 15 : 14, type: 'door', layer: 'gameplay' },
    ...(story && entry ? [{ id: `${id}-terminal`, x: 10, y: kind === 'mission' ? 15 : 14, type: 'terminal', layer: 'gameplay', narrative: {
      schema: 1, title: 'Checkpoint local', start: 'brief', items: [{ id: 'local-key', label: 'Clé du laboratoire' }], nodes: [
        { id: 'brief', text: 'Un registre local.', choices: [{ id: 'accept', label: 'Prendre la clé', next: 'end', rewardItemId: 'local-key', rewardObjectiveId: 'a-goal' }] },
        { id: 'end', text: 'Clé enregistrée.', choices: [] }
      ] } }] : []),
    ...(enemies ? [{ id: `${id}-enemy`, x: 28, y: kind === 'mission' ? 15 : 14, type: 'enemy', layer: 'gameplay' }] : [])
  ] });
  return { schema: 3, kind, name: 'Checkpoint V157', activeRoomId: 'a', rooms: [room('a', true), room('b', false)], links: [
    { id: 'ab', from: { roomId: 'a', cellId: 'a-door' }, to: { roomId: 'b', cellId: 'b-door' }, bidirectional: true }
  ] };
}
function mission(t, input = project(), extra = {}) {
  const fixture = missionV136({ editorProject: input, forgeJourneyV141: true, ...extra });
  t.after(() => fixture.engine.stop());
  for (let index = 0; index < 30; index++) fixture.engine.update(1 / 60);
  return fixture;
}
function ship(t, input = project('ship')) {
  const host = hostV136(), actions = [], patches = [];
  const engine = new (withForgeShipRuntimeV141(HubGame))(host.canvas, {
    onAction: event => actions.push(event), onPersist: patch => patches.push(patch) });
  engine.start({}, { editorProject: input, forgeJourneyV141: true });
  t.after(() => engine.stop(false)); return { ...host, engine, actions, patches };
}
function walk(engine, until, direction = 1) {
  const key = direction > 0 ? 'KeyD' : 'KeyA'; engine.keys.add(key);
  for (let index = 0; index < 2200 && !until(); index++) engine.update(1 / 60);
  engine.keys.delete(key); assert.ok(until(), `native walk stopped at ${engine.player.x}`);
}
const storage = () => { const data = new Map(); return { data, getItem: key => data.get(key) ?? null,
  setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key) }; };
const canonical = value => JSON.stringify(value, (_, item) => item && typeof item === 'object' && !Array.isArray(item)
  ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
async function reseal(raw, mutate) {
  const envelope = JSON.parse(raw); mutate(envelope.payload);
  envelope.integrity = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical(envelope.payload))))]
    .map(value => value.toString(16).padStart(2, '0')).join('');
  return JSON.stringify(envelope);
}

test('JSON reload preserves actual Mission wounds, rounds, inventory, elapsed time and active projectile owner', async t => {
  const input = project(), first = mission(t, input), e = first.engine;
  Object.assign(e.player, { health: 52, armor: 13, ammo: 3, ammoReserve: 9 });
  Object.assign(e.inventory, { medkits: 0, salvage: 17, intel: 4, securityKeys: 1 });
  assert.equal(e.fire(e.player), true);
  const elapsed = e.mission.elapsed, x = e.player.x, raw = await captureForgePlaytestCheckpointV157(e);
  e.stop(); const next = mission(t, JSON.parse(JSON.stringify(input))), n = next.engine, livePlayer = n.player;
  const eventsBefore = next.messages.length;
  const prepared = await prepareForgePlaytestCheckpointV157(n, JSON.parse(JSON.stringify(raw)), input);
  assert.equal(n.player.health, 100); assert.equal(n.player, livePlayer);
  assert.equal(applyForgePlaytestCheckpointV157(n, prepared).applied, true);
  assert.equal(n.player, livePlayer); assert.equal(n.player.health, 52); assert.equal(n.player.armor, 13);
  assert.equal(n.player.ammo, 2); assert.equal(n.player.ammoReserve, 9); assert.equal(n.player.x, x);
  assert.deepEqual(n.inventory, { medkits: 0, salvage: 17, intel: 4, securityKeys: 1, cutter: false });
  assert.equal(n.mission.elapsed, elapsed); assert.equal(n.mission.state, 'active'); assert.equal(n.mission.rewards, null);
  assert.ok(n.bullets.length); assert.ok(n.bullets.every(bullet => bullet.owner === n.player));
  assert.deepEqual(next.messages.slice(eventsBefore).filter(event => event.type !== 'user-equipment-ready-v95'), [],
    'native drawing may announce equipment readiness; restore emits no reward, extraction or campaign event');
});

test('native Mission RNG continues exactly instead of restarting its seed', async t => {
  const first = mission(t), raw = await captureForgePlaytestCheckpointV157(first.engine);
  const expected = Array.from({ length: 12 }, () => first.engine.random());
  first.engine.stop(); const next = mission(t);
  applyForgePlaytestCheckpointV157(next.engine, await prepareForgePlaytestCheckpointV157(next.engine, raw));
  assert.deepEqual(Array.from({ length: 12 }, () => next.engine.random()), expected);
});

test('real linked rooms, killed enemies, taken drops and objectives survive a stopped Mission', async t => {
  const input = project('mission', { enemies: true }), first = mission(t, input), e = first.engine;
  e.enemies[0].alive = false; e.enemies[0].health = 0;
  e.drops.push({ id: 'old-key', type: 'security-key', x: 5000, y: 920, w: 24, h: 24, taken: true });
  e.forgeSessionV141.completedObjectives.push('a-goal'); e.objective.complete = true;
  walk(e, () => Boolean(e.forgeLinkedDoorV141())); e.interact(); assert.equal(e.forgeActiveRoomIdV141, 'b');
  const raw = await captureForgePlaytestCheckpointV157(e); first.engine.stop();
  const next = mission(t, input), n = next.engine;
  applyForgePlaytestCheckpointV157(n, await prepareForgePlaytestCheckpointV157(n, raw));
  assert.equal(n.forgeActiveRoomIdV141, 'b'); assert.equal(n.forgeSessionV141.transitions, 1);
  assert.deepEqual(n.forgeSessionV141.completedObjectives, ['a-goal']);
  n.interact(); assert.equal(n.forgeActiveRoomIdV141, 'a');
  assert.equal(n.enemies[0].alive, false); assert.equal(n.enemies[0].health, 0);
  assert.equal(n.drops.find(drop => drop.id === 'old-key').taken, true); assert.equal(n.objective.complete, true);
});

test('new narrative item, history and play clock survive JSON without replaying a reward', async t => {
  const input = project('mission', { story: true }), first = mission(t, input), e = first.engine;
  openForgeNarrativeV156(e.forgeSessionV141, 'a-terminal');
  assert.equal(chooseForgeNarrativeV156(e.forgeSessionV141, 'a-terminal', 'accept').ok, true);
  e.forgeSessionV141.narrativePlaySecondsV157 = 27.125;
  const raw = await captureForgePlaytestCheckpointV157(e); e.stop(); const next = mission(t, input), n = next.engine;
  applyForgePlaytestCheckpointV157(n, await prepareForgePlaytestCheckpointV157(n, raw));
  assert.deepEqual(n.forgeSessionV141.narrativeInventoryV157, ['local-key']);
  assert.equal(n.forgeSessionV141.narrativePlaySecondsV157, 27.125);
  assert.equal(n.forgeSessionV141.narrativeV156[0].nodeId, 'end');
  assert.deepEqual(n.forgeSessionV141.completedObjectives, ['a-goal']);
  assert.equal(chooseForgeNarrativeV156(n.forgeSessionV141, 'a-terminal', 'accept').ok, false);
});

test('Ship reload preserves wounds, rooms, terminals and objectives without invoking persistence', async t => {
  const input = project('ship', { story: true }), first = ship(t, input), e = first.engine;
  e.player.health = 47; e.v51Terminals[0].activated = true;
  e.forgeSessionV141.completedObjectives.push('a-goal'); e.v51Objectives[0].complete = true;
  const raw = await captureForgePlaytestCheckpointV157(e); e.stop(false);
  const next = ship(t, input), n = next.engine, count = next.patches.length;
  const result = applyForgePlaytestCheckpointV157(n, await prepareForgePlaytestCheckpointV157(n, raw));
  assert.equal(result.kind, 'ship'); assert.equal(n.player.health, 47); assert.equal(n.v51Terminals[0].activated, true);
  assert.equal(n.v51Objectives[0].complete, true); assert.equal(next.patches.length, count); assert.equal(next.actions.length, 0);
});

test('crew resources and shared actor keys remain bound to the new live crew', async t => {
  const input = project(), extra = { crew: CREW.slice(0, 3) }, first = mission(t, input, extra), e = first.engine;
  const member = e.squadActors[0]; Object.assign(member, { health: 39, armor: 8, supportCharges: 0, supportClock: 6 });
  e.weaponThermalV131.set(member, new Map([['crew-fixture', { heat: .5, warm: 1.5 }]]));
  const raw = await captureForgePlaytestCheckpointV157(e); e.stop(); const next = mission(t, input, extra), n = next.engine;
  applyForgePlaytestCheckpointV157(n, await prepareForgePlaytestCheckpointV157(n, raw));
  assert.equal(n.squadActors[0].health, 39); assert.equal(n.squadActors[0].armor, 8);
  assert.equal(n.squadActors[0].supportCharges, 0); assert.equal(n.squadActors[0].supportClock, 6);
  assert.equal(n.weaponThermalV131.get(n.squadActors[0]).get('crew-fixture').warm, 1.5);
  assert.equal(n.weaponThermalV131.has(member), false);
});

test('equipment charges, carried equipment and deployed equipment survive without replenishment', async t => {
  const equipment = ['Portable Sentry', 'Ammo Satchel'].map(name => EQUIPMENT.find(item => item.name === name));
  assert.ok(equipment.every(Boolean)); const input = project(), first = mission(t, input, { equipment }), e = first.engine;
  const sentry = e.placeablesV86.instances.find(item => item.name === 'Portable Sentry');
  assert.equal(e.useEquipment(sentry.catalogId), true); assert.equal(e.confirmPlaceableV86(), true); e.updateEquipmentDeployments(3);
  sentry.ammo = 7; const charges = e.equipmentActions.get(sentry.catalogId).remaining;
  const raw = await captureForgePlaytestCheckpointV157(e); e.stop(); const next = mission(t, input, { equipment }), n = next.engine;
  applyForgePlaytestCheckpointV157(n, await prepareForgePlaytestCheckpointV157(n, raw));
  assert.equal(n.equipmentActions.get(sentry.catalogId).remaining, charges);
  assert.equal(n.placeablesV86.instances.find(item => item.instanceId === sentry.instanceId).ammo, 7);
  assert.equal(n.placeablesV86.instances.filter(item => item.instanceId === sentry.instanceId).length, 1);
});

test('corrupt JSON, wrong schema, mismatched project and altered payload leave the active test untouched', async t => {
  const input = project(), { engine: e } = mission(t, input), raw = await captureForgePlaytestCheckpointV157(e);
  const owner = e.forgeSessionV141, player = e.player, platforms = e.platforms, before = structuredClone(e.player);
  const changed = structuredClone(input); changed.rooms[0].name = 'Plan modifié';
  const malformed = JSON.parse(raw); malformed.payload.savedAt++;
  for (const [candidate, plan] of [['{broken', input], [JSON.stringify({ ...JSON.parse(raw), schema: 999 }), input], [raw, changed], [JSON.stringify(malformed), input]]) {
    await assert.rejects(prepareForgePlaytestCheckpointV157(e, candidate, plan));
    assert.equal(e.forgeSessionV141, owner); assert.equal(e.player, player); assert.equal(e.platforms, platforms); assert.deepEqual(e.player, before);
  }
});

test('changing a terminal story or active entry also rejects the old checkpoint', async t => {
  const input = project('mission', { story: true }), { engine: e } = mission(t, input), raw = await captureForgePlaytestCheckpointV157(e);
  const modified = structuredClone(input); modified.rooms[0].cells.find(cell => cell.narrative).narrative.nodes[0].text += ' New';
  await assert.rejects(inspectForgePlaytestCheckpointV157(raw, modified), /projet a changé/);
  const swapped = structuredClone(input); swapped.activeRoomId = 'b';
  await assert.rejects(inspectForgePlaytestCheckpointV157(raw, swapped));
});

test('different actual equipment refuses before replacing the fresh loadout', async t => {
  const first = mission(t), raw = await captureForgePlaytestCheckpointV157(first.engine); first.engine.stop();
  const next = mission(t, project(), { equipment: EQUIPMENT.slice(0, 1) }), before = next.engine.equipmentActions;
  await assert.rejects(prepareForgePlaytestCheckpointV157(next.engine, raw), /équipe ou équipement/);
  assert.equal(next.engine.equipmentActions, before);
});

test('an authored default vehicle resumes without refill while campaign vehicle selections remain isolated', async t => {
  const input = project(); input.rooms[0].cells.push({ id: 'authored-vehicle', x: 24, y: 15, type: 'vehicle', layer: 'gameplay' });
  const [vehicleA, vehicleB] = VEHICLES.slice(0, 2); assert.notEqual(vehicleA.id, vehicleB.id);
  const first = mission(t, input, { vehicle: vehicleA }), original = first.engine;
  // Production isolateForgeMissionOptionsV136 deliberately ignores selected
  // campaign vehicles. Do not manufacture an A→B Forge path that does not exist.
  assert.equal(original.selectedVehicleRuntime.id, 'vehicle-runtime-m577');
  Object.assign(original.vehicle, { hull: 31, fuel: 12, turretAmmo: 3, turretReserve: 4 });
  const raw = await captureForgePlaytestCheckpointV157(original); original.stop();
  const changed = mission(t, input, { vehicle: vehicleB }), e = changed.engine;
  const owner = e.forgeSessionV141, physical = e.vehicle, selected = e.selectedVehicleRuntime, handling = e.vehicleHandling,
    before = structuredClone(e.vehicle), player = structuredClone(e.player);
  assert.equal(selected.id, original.selectedVehicleRuntime.id);
  assert.deepEqual(selected, original.selectedVehicleRuntime);
  const prepared = await prepareForgePlaytestCheckpointV157(e, raw, input);
  assert.equal(e.forgeSessionV141, owner); assert.equal(e.vehicle, physical); assert.deepEqual(e.vehicle, before); assert.deepEqual(e.player, player);
  applyForgePlaytestCheckpointV157(e, prepared);
  assert.equal(e.vehicle.id, selected.id); assert.equal(e.selectedVehicleRuntime, selected); assert.equal(e.vehicleHandling, handling);
  assert.equal(e.vehicle.hull, 31); assert.equal(e.vehicle.fuel, 12); assert.equal(e.vehicle.turretAmmo, 3); assert.equal(e.vehicle.turretReserve, 4);
  e.stop(); const matching = mission(t, input, { vehicle: vehicleA }), next = matching.engine;
  applyForgePlaytestCheckpointV157(next, await prepareForgePlaytestCheckpointV157(next, raw, input));
  assert.equal(next.vehicle.id, original.selectedVehicleRuntime.id); assert.equal(next.selectedVehicleRuntime.id, original.selectedVehicleRuntime.id);
  assert.equal(next.vehicle.hull, 31); assert.equal(next.vehicle.fuel, 12); assert.equal(next.vehicle.turretAmmo, 3); assert.equal(next.vehicle.turretReserve, 4);
  assert.equal(next.vehicleHandling.family, handling.family);
});

test('airborne, unsupported, downed, narrative-open, busy deployment and finished tests refuse an explicit save', async t => {
  const { engine: e } = mission(t), first = e.forgeSessionV141;
  for (const mutate of [() => { e.player.grounded = false; }, () => { e.player.y -= 100; }, () => { e.player.downed = true; },
    () => { e.forgeNarrativeOpenV156 = 'busy'; }, () => { e.placeableTasksV86.set('player', {}); },
    () => { e.mission.state = 'complete'; }]) {
    const actor = structuredClone(e.player), state = e.mission.state;
    mutate(); await assert.rejects(captureForgePlaytestCheckpointV157(e)); assert.equal(e.forgeSessionV141, first);
    Object.assign(e.player, actor); e.mission.state = state; e.forgeNarrativeOpenV156 = null; e.placeableTasksV86.clear();
  }
});

test('world coordinates must remain supported when a checkpoint is prepared', async t => {
  const { engine: e } = mission(t), raw = await captureForgePlaytestCheckpointV157(e);
  const modified = await reseal(raw, payload => {
    const data = decodeForgeCheckpointGraphV157(payload.graph, new Map([['player', e.player], ['coop', e.coop]]));
    data.actors.find(entry => entry.id === 'player').state.y = 30;
    payload.graph = encodeForgeCheckpointGraphV157(data, new Map([[e.player, 'player'], [e.coop, 'coop']]));
  });
  const before = e.player.y; await assert.rejects(prepareForgePlaytestCheckpointV157(e, modified), /appui sûr/); assert.equal(e.player.y, before);
});

test('strict graph codec preserves cycles, Maps, Sets and shared operator owners across JSON', () => {
  const actor = {}, nextActor = {}, graph = { owners: new Map([[actor, new Set([actor])]]), projectile: { owner: actor } };
  graph.self = graph;
  const encoded = JSON.stringify(encodeForgeCheckpointGraphV157(graph, new Map([[actor, 'player']])));
  assert.equal(encoded.includes('forgeOperatorRefV141'), false);
  const result = decodeForgeCheckpointGraphV157(JSON.parse(encoded), new Map([['player', nextActor]]));
  assert.equal(result.self, result); assert.equal(result.projectile.owner, nextActor); assert.equal(result.owners.get(nextActor).has(nextActor), true);
});

test('prototype keys, executable functions, unknown operators, excessive graph and non-finite numbers are refused', () => {
  assert.throws(() => encodeForgeCheckpointGraphV157({ execute() {} }));
  assert.throws(() => encodeForgeCheckpointGraphV157({ value: Infinity }));
  assert.throws(() => encodeForgeCheckpointGraphV157(JSON.parse('{"__proto__":{"polluted":true}}')));
  assert.throws(() => decodeForgeCheckpointGraphV157({ value: ['operator', 'intruder'], nodes: [] }));
  assert.throws(() => decodeForgeCheckpointGraphV157({ value: ['ref', 0], nodes: [['object', [['__proto__', ['value', true]]]]] }));
  assert.throws(() => decodeForgeCheckpointGraphV157({ value: ['value', null], nodes: Array(FORGE_CHECKPOINT_LIMITS_V157.nodes + 1).fill(null) }));
  assert.equal({}.polluted, undefined);
});

test('prepare/apply tokens are tied to their owner session and consumed once', async t => {
  const { engine: e } = mission(t), raw = await captureForgePlaytestCheckpointV157(e), prepared = await prepareForgePlaytestCheckpointV157(e, raw);
  applyForgePlaytestCheckpointV157(e, prepared); assert.throws(() => applyForgePlaytestCheckpointV157(e, prepared), /périmée/);
  const second = await prepareForgePlaytestCheckpointV157(e, raw); e.forgeSessionV141 = { ...e.forgeSessionV141 };
  assert.throws(() => applyForgePlaytestCheckpointV157(e, second), /périmée/);
});

test('recomputed integrity cannot admit wrong session types, malformed rooms, invalid inventory or equipment charges', async t => {
  const { engine: e } = mission(t), raw = await captureForgePlaytestCheckpointV157(e), owner = e.forgeSessionV141;
  const operators = new Map([['player', e.player], ['coop', e.coop]]), references = new Map([[e.player, 'player'], [e.coop, 'coop']]);
  for (const mutate of [data => { data.session.kind = 'ship'; }, data => { data.session.schema = 999; },
    data => { data.session.narrativeV156 = {}; }, data => { data.session.roomStates.a.enemies = 'bad'; },
    data => { data.session.roomStates.a.doors[0].progress = 4; }, data => { data.globals.inventory.medkits = -1; },
    data => { data.globals.equipmentActions = new Map([['intruder', { remaining: 999, uses: 0 }]]); },
    data => { data.globals.mission.objectives.power = 'yes'; }, data => { data.globals.mission.rewards = { credits: 999 }; },
    data => { data.globals.squadDoctrineV132 = { tasks: {}, carries: [] }; },
    data => { data.globals.squadDoctrineV132 = { tasks: [], carries: [] }; },
    data => { data.globals.tracker.energy = 10000; }, data => { delete data.globals.weaponThermalV131; },
    data => { data.actors[0].state.actionClock = {}; }]) {
    const candidate = await reseal(raw, payload => {
      const data = decodeForgeCheckpointGraphV157(payload.graph, operators); mutate(data);
      payload.graph = encodeForgeCheckpointGraphV157(data, references);
    });
    await assert.rejects(prepareForgePlaytestCheckpointV157(e, candidate));
    assert.equal(e.forgeSessionV141, owner); assert.equal(e.player.health, 100);
  }
});

test('a failing production room adapter rolls back room/session/resources/actors and retains the checkpoint', async t => {
  const { engine: e } = mission(t), raw = await captureForgePlaytestCheckpointV157(e);
  e.player.health = 19; e.inventory.medkits = 0;
  const prepared = await prepareForgePlaytestCheckpointV157(e, raw), owner = e.forgeSessionV141, platforms = e.platforms,
    inventory = e.inventory, actor = structuredClone(e.player), apply = e.applyForgeCheckpointRoomV157;
  e.keys.add('KeyD');
  e.applyForgeCheckpointRoomV157 = function (runtime) { apply.call(this, runtime); this.player.health = 1; this.keys.clear(); throw new Error('adapter refusal fixture'); };
  assert.throws(() => applyForgePlaytestCheckpointV157(e, prepared), /adapter refusal/);
  assert.equal(e.forgeSessionV141, owner); assert.equal(e.platforms, platforms); assert.equal(e.inventory, inventory);
  assert.deepEqual(e.player, actor); assert.equal(e.keys.has('KeyD'), true); assert.equal(prepared.consumed, false);
  e.applyForgeCheckpointRoomV157 = apply;
  assert.equal(applyForgePlaytestCheckpointV157(e, prepared).applied, true);
});

test('recomputed integrity cannot enlarge the native magazine', async t => {
  const { engine: e } = mission(t), raw = await captureForgePlaytestCheckpointV157(e);
  const candidate = await reseal(raw, payload => {
    const data = decodeForgeCheckpointGraphV157(payload.graph, new Map([['player', e.player], ['coop', e.coop]]));
    Object.assign(data.actors.find(entry => entry.id === 'player').state, { magazineSize: 10000, ammo: 10000 });
    payload.graph = encodeForgeCheckpointGraphV157(data, new Map([[e.player, 'player'], [e.coop, 'coop']]));
  });
  const ammo = e.player.ammo; await assert.rejects(prepareForgePlaytestCheckpointV157(e, candidate), /arme enregistrée/);
  assert.equal(e.player.ammo, ammo); assert.equal(e.player.magazineSize, e.weaponRuntime.magazine);
});

test('recomputed integrity cannot remove or move an authored wall in any saved room', async t => {
  const input = project(); input.rooms[0].cells.push({ id: 'authored-wall', x: 18, y: 15, type: 'wall', layer: 'structure' });
  const { engine: e } = mission(t, input), raw = await captureForgePlaytestCheckpointV157(e), walls = e.walls;
  for (const mutate of [state => { state.walls = []; }, state => { state.walls[0].x += 100; }]) {
    const candidate = await reseal(raw, payload => {
      const data = decodeForgeCheckpointGraphV157(payload.graph, new Map([['player', e.player], ['coop', e.coop]]));
      mutate(data.session.roomStates.a);
      payload.graph = encodeForgeCheckpointGraphV157(data, new Map([[e.player, 'player'], [e.coop, 'coop']]));
    });
    await assert.rejects(prepareForgePlaytestCheckpointV157(e, candidate), /géométrie du plan modifiée/);
    assert.equal(e.walls, walls); assert.equal(e.walls.length, 1);
  }
});

test('recomputed integrity cannot replace a native projectile owner with a copied Marine', async t => {
  const { engine: e } = mission(t); assert.equal(e.fire(e.player), true);
  const raw = await captureForgePlaytestCheckpointV157(e), candidate = await reseal(raw, payload => {
    const data = decodeForgeCheckpointGraphV157(payload.graph, new Map([['player', e.player], ['coop', e.coop]]));
    data.session.roomStates.a.bullets[0].owner = { ...e.player };
    payload.graph = encodeForgeCheckpointGraphV157(data, new Map([[e.player, 'player'], [e.coop, 'coop']]));
  });
  await assert.rejects(prepareForgePlaytestCheckpointV157(e, candidate), /propriétaire copié/);
  assert.equal(e.bullets[0].owner, e.player);
});

test('local store uses one explicit Forge key, survives reload and never touches campaign or author documents', async t => {
  const local = storage(); local.setItem('campaign', 'unchanged'); local.setItem('forge-author', 'unchanged');
  const { engine: e } = mission(t), store = new ForgePlaytestCheckpointStoreV157(local);
  assert.equal(store.raw(), null); await store.save(e); assert.equal(local.data.size, 3);
  assert.ok(local.data.has(FORGE_CHECKPOINT_STORAGE_KEY_V157));
  const reloaded = new ForgePlaytestCheckpointStoreV157(local); assert.equal(await reloaded.read(project()), store.raw());
  reloaded.clear(); assert.equal(reloaded.raw(), null); assert.equal(local.getItem('campaign'), 'unchanged'); assert.equal(local.getItem('forge-author'), 'unchanged');
});

test('quota and storage errors do not confirm a save or erase the older checkpoint', async t => {
  const local = storage(), { engine: e } = mission(t), store = new ForgePlaytestCheckpointStoreV157(local);
  await store.save(e); const older = store.raw(); local.setItem = () => { throw new Error('QuotaExceededError'); };
  await assert.rejects(store.save(e), /enregistrement local impossible/); assert.equal(store.raw(), older);
  local.getItem = () => { throw new Error('SecurityError'); }; assert.throws(() => store.raw(), /inaccessible/);
});

// Small DOM host double only for UI wiring; gameplay above uses production.
class Node extends EventTarget {
  constructor(tag) { super(); this.tag = tag; this.children = []; this.dataset = {}; this.attributes = {}; }
  append(node) { this.children.push(node); } setAttribute(key, value) { this.attributes[key] = value; }
  remove() { this.removed = true; }
  querySelector(selector) { const action = selector.match(/="([^"]+)"/)?.[1]; const all = node => node.children.flatMap(child => [child, ...all(child)]); return all(this).find(node => node.dataset.forgeCheckpointV157 === action); }
}
test('checkpoint UI keeps routing in its callback, announces refusals and disables unavailable actions', async t => {
  const root = new Node('main'), doc = { createElement: tag => new Node(tag) }, local = storage(), { engine: e } = mission(t);
  const store = new ForgePlaytestCheckpointStoreV157(local), routed = [], messages = [];
  const ui = mountForgePlaytestCheckpointUIV157({ document: doc, roots: [root], store, getProject: () => project(), getEngine: () => e,
    resumePlaytest: async request => { routed.push(request); return store.resume(e, request.project); }, onMessage: (text, error) => messages.push({ text, error }) });
  t.after(() => ui.destroy());
  assert.equal(root.children[0].querySelector('[data-forge-checkpoint-v157="resume"]').disabled, true);
  assert.equal(await ui.run('save'), true); assert.equal(routed.length, 0);
  assert.equal(root.children[0].querySelector('[data-forge-checkpoint-v157="resume"]').disabled, false);
  e.player.health = 11; assert.equal(await ui.run('resume'), true); assert.equal(routed.length, 1); assert.equal(e.player.health, 100);
  assert.equal(routed[0].checkpoint.project.kind, 'mission'); assert.ok(routed[0].raw);
  local.setItem(store.key, '{broken'); assert.equal(await ui.run('resume'), false); assert.equal(routed.length, 1);
  assert.equal(messages.at(-1).error, true); assert.equal(await ui.run('clear'), true); assert.equal(store.raw(), null);
});

test('UI ticks never reread the checkpoint; explicit actions, failures and matching cross-tab storage changes refresh presence', async t => {
  const root = new Node('main'), eventTarget = new EventTarget(), doc = { defaultView: eventTarget, createElement: tag => new Node(tag) },
    local = storage(), { engine: e } = mission(t), store = new ForgePlaytestCheckpointStoreV157(local);
  // The interval remains responsible for engine/visibility changes, but never
  // copies the potentially 4 MiB checkpoint during ordinary frames or menus.
  local.setItem(store.key, 'x'.repeat(FORGE_CHECKPOINT_LIMITS_V157.bytes));
  let reads = 0, tick; const raw = store.raw.bind(store), previousInterval = globalThis.setInterval;
  store.raw = () => { reads++; return raw(); };
  globalThis.setInterval = callback => { tick = callback; return 0; };
  let visible = false;
  const ui = mountForgePlaytestCheckpointUIV157({ document: doc, roots: [root], store, getProject: () => project(), getEngine: () => e,
    isVisible: () => visible, resumePlaytest: request => store.resume(e, request.project) });
  globalThis.setInterval = previousInterval; t.after(() => ui.destroy());
  const resume = root.children[0].querySelector('[data-forge-checkpoint-v157="resume"]');
  assert.equal(reads, 1); assert.equal(resume.disabled, false);
  for (let index = 0; index < 20; index++) tick();
  visible = true; ui.refresh(); for (let index = 0; index < 20; index++) tick();
  assert.equal(reads, 1, 'neither hidden nor visible ticks copy the large record');
  assert.equal(await ui.run('clear'), true); assert.equal(resume.disabled, true);
  const clearedReads = reads; for (let index = 0; index < 10; index++) tick(); assert.equal(reads, clearedReads);
  assert.equal(await ui.run('save'), true); assert.equal(resume.disabled, false);
  const savedReads = reads; for (let index = 0; index < 10; index++) tick(); assert.equal(reads, savedReads);
  local.removeItem(store.key); assert.equal(await ui.run('resume'), false);
  assert.equal(resume.disabled, true, 'a failed action also notices an externally removed record');
  const failedReads = reads;
  const signal = key => { const event = new Event('storage'); Object.defineProperty(event, 'key', { value: key }); eventTarget.dispatchEvent(event); };
  local.setItem(store.key, 'external-record'); signal('unrelated-campaign-key'); assert.equal(reads, failedReads);
  signal(store.key); assert.equal(reads, failedReads + 1); assert.equal(resume.disabled, false);
  local.removeItem(store.key); signal(null); assert.equal(resume.disabled, true);
  ui.destroy(); const destroyedReads = reads; signal(store.key); tick(); assert.equal(reads, destroyedReads);
});
