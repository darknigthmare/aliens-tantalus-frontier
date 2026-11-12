import test from 'node:test';
import assert from 'node:assert/strict';
import { ORIGINS_V188, CONNECTED_ORIGIN_ABILITIES_V188 } from '../src/run-options-v188.js';
import { fixture } from './engine-host-v188.mjs';

const withOrigin = originV188 => fixture({ options: { originV188 } });
// The prototype just above the run-options layer: stubbing it isolates the hook.
function parentOfRunOptions(engine) {
  let proto = Object.getPrototypeOf(engine);
  while (proto && !Object.hasOwn(proto.constructor, 'runOptionsRuntimeV188')) proto = Object.getPrototypeOf(proto);
  assert.ok(proto, 'run-options layer present'); return Object.getPrototypeOf(proto);
}
function stub(engine, name, implementation, body) {
  const proto = parentOfRunOptions(engine), original = proto[name]; proto[name] = implementation;
  try { return body(); } finally { proto[name] = original; }
}

test('every origin ability 01-19 is connected; origin-20 has none', () => {
  assert.deepEqual(CONNECTED_ORIGIN_ABILITIES_V188, ORIGINS_V188.map(o => o.id).filter(id => id !== 'origin-20'));
});

test('origin-01 narrows multi-pellet spread only during an alert', async () => {
  const { engine } = await withOrigin('origin-01');
  stub(engine, 'weaponActionProfileV131', () => ({ spread: .3 }), () => {
    engine.enemies = []; assert.equal(engine.weaponActionProfileV131(engine.player).spread, .3);
    engine.enemies = [{ id: 'a', x: engine.player.x + 100, y: engine.player.y, w: 40, h: 60, alive: true, alert: true }];
    assert.ok(Math.abs(engine.weaponActionProfileV131(engine.player).spread - .255) < 1e-12);
  });
  engine.stop();
});

test('origin-02 cuts the survivor convoy health loss by 25%; origin-04 speeds the power loader by 10%', async () => {
  const { engine } = await withOrigin('origin-02');
  engine.cargoBrutalV67 = { convoy: { health: 100 } };
  stub(engine, 'updateCargoConvoyV67', function () { this.cargoBrutalV67.convoy.health -= 8; }, () => engine.updateCargoConvoyV67(.1));
  assert.equal(engine.cargoBrutalV67.convoy.health, 94); engine.stop();
  const loader = await withOrigin('origin-04'); const l = loader.engine; let seen = null;
  l.vehicle = { id: 'vehicle-007-p-5000-powered-work-loader', runtimeSpeed: 200 };
  stub(l, 'updateVehicleDriver', function () { seen = this.vehicle.runtimeSpeed; }, () => l.updateVehicleDriver(l.player, .1, {}));
  assert.ok(Math.abs(seen - 220) < 1e-9); assert.equal(l.vehicle.runtimeSpeed, 200, 'restored after the step'); l.stop();
});

test('origin-05 and origin-15 shorten power transfer and field repair by 20%', async () => {
  const { engine } = await withOrigin('origin-05');
  const seen = []; const proto = Object.getPrototypeOf(Object.getPrototypeOf(engine));
  void proto; const real = engine.isFieldActionBusyV124?.bind(engine);
  engine.isFieldActionBusyV124 = () => false; engine.fieldActionsV124 = new Map();
  engine.beginFieldActionV124(engine.player, { kind: 'power-transfer', duration: 1.5 });
  seen.push(engine.fieldActionsV124.get(engine.player)?.duration);
  assert.equal(seen[0], 1.25); void real; engine.stop();
  const repair = await withOrigin('origin-15'); repair.engine.isFieldActionBusyV124 = () => false; repair.engine.fieldActionsV124 = new Map();
  repair.engine.beginFieldActionV124(repair.engine.player, { kind: 'field-repair', duration: 2.1 });
  assert.equal(repair.engine.fieldActionsV124.get(repair.engine.player).duration, 2.1 / 1.2); repair.engine.stop();
});

test('origin-06 adds the secured checkpoint to the navigation map', async () => {
  const { engine } = await withOrigin('origin-06');
  engine.checkpoint = { id: 'insertion', x: engine.player.x, y: engine.player.y };
  const map = engine.missionNavigationMapV121();
  if (map) { assert.ok(map.sheltersV188 >= 1); assert.ok(map.goals.some(goal => goal.id === 'shelter-checkpoint')); }
  const plain = await withOrigin('origin-20'); const other = plain.engine.missionNavigationMapV121();
  if (other) assert.equal(other.goals.some(goal => String(goal.id).startsWith('shelter-')), false);
  engine.stop(); plain.engine.stop();
});

test('origin-09 extends a timed escape by 10 s', async () => {
  const { engine } = await withOrigin('origin-09');
  stub(engine, 'configureObjectiveRuntime', function () { this.objectiveRuntime = Object.freeze({ action: 'escape', timeLimit: 105 }); },
    () => engine.configureObjectiveRuntime());
  assert.equal(engine.objectiveRuntime.timeLimit, 115); engine.stop();
});

test('origin-10 opens one security door once; origin-14 opens one tool-locked vent without the torch', async () => {
  const { engine } = await withOrigin('origin-10');
  const p = engine.player, door = { id: 'sec-1', x: p.x + 40, y: p.y, w: 30, h: 120, open: false, lockedBy: 'security' };
  const second = { ...door, id: 'sec-2' };
  engine.doors = [door, second]; engine.mission.objectives.route = false;
  assert.ok(engine.doorRequirement(door));
  engine.interact(p);
  assert.equal(engine.companyDoorClaimV188, 'sec-1'); assert.equal(engine.doorRequirement(door), '');
  assert.ok(engine.doorRequirement(second), 'only one door per mission'); engine.stop();
  const tools = await withOrigin('origin-14'); const t = tools.engine, q = t.player;
  t.doors = []; t.inventory.cutter = false;
  const vent = { id: 'v', x: q.x + 20, y: q.y, w: 40, h: 40, requiresTool: true, open: false, targetX: q.x + 300, targetY: q.y };
  t.vents = [vent]; let cutterDuringInteract = null;
  stub(t, 'interact', function () { cutterDuringInteract = this.inventory.cutter; return true; }, () => t.interact(q));
  assert.equal(cutterDuringInteract, true, 'the base vent rule sees a torch for this one vent');
  assert.equal(t.inventory.cutter, false, 'no torch is kept'); assert.equal(t.toolFreeUsedV188, true);
  cutterDuringInteract = null; stub(t, 'interact', function () { cutterDuringInteract = this.inventory.cutter; return true; }, () => t.interact(q));
  assert.equal(cutterDuringInteract, false, 'only once per mission');
  t.stop();
});

test('origin-12 adds 10% (at least +1) to a supply crate; origin-17 speeds squad members only', async () => {
  const { engine } = await withOrigin('origin-12');
  const supply = { id: 's', type: 'ammo', amount: 30, used: false }, before = engine.player.ammoReserve;
  engine.collectSupply(engine.player, supply);
  assert.equal(supply.amount, 33); assert.equal(engine.player.ammoReserve, before + 33); engine.stop();
  const squad = await withOrigin('origin-17'); const s = squad.engine;
  stub(s, 'squadCarrySpeedScaleV132', () => 1, () => {
    assert.equal(s.squadCarrySpeedScaleV132({ squadMember: true }), 1.15); assert.equal(s.squadCarrySpeedScaleV132(s.player), 1);
  });
  s.stop();
});

test('origin-19 adds 10% damage under a low ceiling only', async () => {
  const { engine } = await withOrigin('origin-19');
  const p = engine.player, enemy = { id: 'e', x: p.x + 50, y: p.y, w: 40, h: 60, alive: true, health: 1000, maxHealth: 1000, armor: 0, revealed: 0 };
  engine.platforms = [{ x: p.x - 50, y: p.y - 200, w: 200, h: 20 }];
  const open = engine.applyEnemyDamage(enemy, 100, { owner: p });
  engine.platforms = [{ x: p.x - 50, y: p.y - 80, w: 200, h: 20 }];
  const narrow = engine.applyEnemyDamage(enemy, 100, { owner: p });
  assert.equal(engine.narrowCorridorV188(), true); assert.ok(Math.abs(narrow / open - 1.1) < 1e-9, `${narrow} vs ${open}`);
  engine.stop();
});

test('origin-07 and origin-08 scale duct movement and rescue duration', async () => {
  const { engine } = await withOrigin('origin-07');
  let got = null; stub(engine, 'updateMissionVentPlayerV62', (actor, delta) => { got = delta; }, () => engine.updateMissionVentPlayerV62(engine.player, .1));
  assert.ok(Math.abs(got - .115) < 1e-12); engine.stop();
  const medic = await withOrigin('origin-08'); const m = medic.engine;
  stub(m, 'reserveSquadRescueV132', function () { this.squadDoctrineV132 = { tasks: [{ kind: 'rescue', duration: 2.4 }] }; return { applied: true, reserved: true }; },
    () => m.reserveSquadRescueV132(m.player, {}, 'rescue'));
  assert.equal(m.squadDoctrineV132.tasks[0].duration, 2); m.stop();
});

import { ORIGIN_CLUES_V188 } from '../src/run-options-v188.js';
import { ARCHIVE_RELAY_CAMPAIGN_V122, ARCHIVE_RELAY_DOCUMENT_IDS_V122 } from '../src/archive-relay-state-v122.js';
import { buildArchiveRelayLevelV122, ARCHIVE_RELAY_PROPS_V122 } from '../src/archive-relay-runtime-v122.js';
import { CAMPAIGNS, WORLDS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content.js';
import { GameEngine } from '../src/game-production-runtime.js';
import { host, prepare } from './engine-host-v188.mjs';
import { createDefaultSave, beginOperation, resolveOperation } from '../src/save.js';

test('origin-03 [PROPOSÉ]: every QZ-18 piece has a cross-checking clue in both languages; the first piece read shows it once', async () => {
  for (const id of ARCHIVE_RELAY_DOCUMENT_IDS_V122) {
    assert.ok(ORIGIN_CLUES_V188[id]?.fr.startsWith('Procès-verbal'), id); assert.ok(ORIGIN_CLUES_V188[id].en.startsWith('Report'), id);
  }
  const world = WORLDS.find(entry => entry.id === ARCHIVE_RELAY_CAMPAIGN_V122.worldId);
  const level = buildArchiveRelayLevelV122({ campaign: ARCHIVE_RELAY_CAMPAIGN_V122, world, levelSeeds: LEVEL_SEEDS, seed: 160 });
  const browser = host(), events = [], engine = new GameEngine(browser.canvas, { onEvent: event => events.push(event) });
  engine.start({ campaign: ARCHIVE_RELAY_CAMPAIGN_V122, world, missionLevel: level, levelSeed: level.levelSeed, weapon: WEAPONS[0],
    enemyCatalog: ENEMIES, equipment: [], crew: [], seed: 160, originV188: 'origin-03' });
  await prepare(engine);
  const prop = ARCHIVE_RELAY_PROPS_V122.pda;
  Object.assign(engine.player, { x: prop.x - engine.player.w / 2, y: prop.groundY - engine.player.h, vx: 0, vy: 0, grounded: true, climbing: false });
  assert.equal(engine.interact(), true, 'the real PDA station opens');
  const [first] = engine.getArchiveRelayReaderV122().documents.map(doc => doc.id);
  assert.equal(engine.markArchiveRelayReadV122(first).applied, true);
  assert.equal(engine.giveOriginClueV188('engineering-clock'), false, 'one clue per mission');
  const clues = events.filter(event => event.type === 'origin-clue-v188');
  assert.equal(clues.length, 1); assert.equal(clues[0].documentId, first); assert.equal(clues[0].text, ORIGIN_CLUES_V188[first].fr);
  engine.stop();
});

test('origin-11 [PROPOSÉ]: +10% damage with a UPP primary weapon only', async () => {
  const upp = WEAPONS.find(weapon => /Type 88/.test(weapon.name));
  assert.ok(upp, 'a UPP weapon exists in the catalogue');
  const { engine } = await fixture({ options: { originV188: 'origin-11', weapon: upp } });
  assert.equal(engine.uppWeaponV188, true);
  const enemy = () => ({ id: 'e', x: 0, y: 0, w: 40, h: 60, alive: true, health: 1000, maxHealth: 1000, armor: 0, revealed: 0 });
  engine.player.weaponMode = 'primary';
  const primary = engine.applyEnemyDamage(enemy(), 100, { owner: engine.player });
  engine.player.weaponMode = 'secondary';
  const sidearm = engine.applyEnemyDamage(enemy(), 100, { owner: engine.player });
  assert.ok(Math.abs(primary / sidearm - 1.1) < 1e-9, `${primary} vs ${sidearm}`);
  engine.stop();
  const plain = await fixture({ options: { originV188: 'origin-11', weapon: WEAPONS[0] } });
  assert.equal(plain.engine.uppWeaponV188, false); plain.engine.stop();
});

test('origin-16 [PROPOSÉ]: the real resolveOperation adds exactly one biological sample after a successful mission', () => {
  const run = origin => {
    const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.player.originV188 = origin;
    const campaign = CAMPAIGNS.find(entry => !entry.id.startsWith('special-') && save.galaxy.unlockedWorldIds.includes(entry.worldId));
    const world = WORLDS.find(entry => entry.id === campaign.worldId);
    beginOperation(save, campaign, world);
    const before = save.galaxy.resources.pathogen;
    const outcome = resolveOperation(save, { success: true, kills: 10 });
    return { ok: outcome.ok, success: outcome.success, gained: save.galaxy.resources.pathogen - before };
  };
  const biologist = run('origin-16'), other = run('origin-20');
  assert.equal(biologist.ok, true); assert.equal(other.ok, true);
  assert.equal(biologist.gained - other.gained, 1);
});
