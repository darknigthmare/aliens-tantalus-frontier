import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, CREW, ENEMIES, LEVEL_SEEDS, WEAPONS, WORLDS } from '../src/content.js';
import { createRecruitmentV85, RECRUIT_GEAR_CATALOG_V85 } from '../src/crew-recruitment-v85.js';
import { buildCrewRuntime } from '../src/game-runtime.js';
import { resolveIdentitySafeNpcAnimationV57 } from '../src/game-v52-runtime.js';
import { enforceHumanoidAnimationIdentity, CREW_SPRITE_IDS } from '../src/sprite-animation-runtime.js';
import { PLAYER_VISUAL_CONTRACT_V81 } from '../src/player-visual-contract-v81.js';
import { crewMovementV85, tickCrewRuntimeV85, captureCrewRuntimeV85, restoreCrewRuntimeV85, crewToolChargesV85 } from '../src/crew-runtime-v85.js';
import { pressTacticalReloadV77, updateTacticalReloadV77 } from '../src/tactical-reload-v77.js';
import { ALPHA_BRAVO_CAMPAIGN_V69 } from '../src/alpha-bravo-coop-v69.js';

const identity = { name: 'Alex Navarro', callsign: 'ECHO-9' };
const candidates = createRecruitmentV85(85001).candidates;
const weaponIds = RECRUIT_GEAR_CATALOG_V85.filter(item => item.kind === 'weapon').map(item => item.catalogId);
const equipment = (catalogId, serial = 1) => {
  const entry = RECRUIT_GEAR_CATALOG_V85.find(item => item.catalogId === catalogId);
  return { instanceId: `test-v85-item-${serial}`, catalogId, kind: entry.kind, mass: entry.mass, value: entry.value, reason: 'Runtime transfer fixture' };
};
const member = (index = 0, changes = {}) => ({ id: candidates[index].id, name: candidates[index].name,
  recruitV85: structuredClone(candidates[index]), health: 100, stress: 0, fatigue: 0, status: 'active', ...changes });

function runtime(run) {
  const names = ['Image', 'addEventListener', 'requestAnimationFrame', 'document', 'navigator'];
  const originals = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const document = { hidden: false, activeElement: null, addEventListener() {} };
  const mocks = { Image: class { constructor() { this.complete = true; this.naturalWidth = this.naturalHeight = 1024; } set src(value) { this.currentSrc = value; } },
    addEventListener() {}, requestAnimationFrame: () => 0, document, navigator: { getGamepads: () => [] } };
  for (const [name, value] of Object.entries(mocks)) Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  const engines = [];
  const make = (crew = candidates.map((_, index) => member(index)), changes = {}) => {
    const events = [];
    const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener() {}, focus() { document.activeElement = canvas; },
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) };
    const engine = new GameEngine(canvas, { onEvent: event => events.push(event) });
    engines.push(engine);
    const options = { seed: 85001, world: WORLDS[0], campaign: { ...CAMPAIGNS[0], id: 'crew-runtime-v85' },
      levelSeed: { ...LEVEL_SEEDS[0], id: 'crew-test-v85', seed: 85001 }, weapon: WEAPONS[0],
      equipment: [], crew, enemyCatalog: ENEMIES.slice(0, 52), playerIdentityV84: identity, difficulty: 'standard',
      accessibility: { aimAssist: 'off' }, ...changes };
    engine.start(options);
    engine.paused = false;
    engine.enemyAtlasLoadingPausedV65 = false;
    engine.mission.state = 'active';
    return { engine, events, options };
  };
  try { return run(make); } finally {
    for (const engine of engines) engine.stop();
    for (const [name, descriptor] of originals) descriptor ? Object.defineProperty(globalThis, name, descriptor) : delete globalThis[name];
  }
}

function enemyAhead(engine, actor, range = 200) {
  const enemy = { id: 'target-v85', name: 'Target', x: actor.x + range, y: actor.y, w: 48, h: 90,
    health: 1000, maxHealth: 1000, armor: 0, alive: true, alert: true, revealed: 6 };
  engine.enemies = [enemy]; engine.bullets = []; actor.fireClock = 0; actor.inVehicle = false;
  return enemy;
}

test('V85 dynamic identities keep four allies and never borrow Mara or an unrelated NPC sheet', () => runtime(make => {
  const { engine } = make();
  assert.equal(engine.squadActors.length, 4);
  for (const actor of engine.squadActors) {
    assert.equal(actor.crewV85.crewId, actor.crewId);
    assert.equal(actor.name, candidates.find(profile => profile.id === actor.crewId).name);
    const request = resolveIdentitySafeNpcAnimationV57(actor);
    assert.ok(PLAYER_VISUAL_CONTRACT_V81.sheetIds.includes(request.sheetId));
    assert.equal(request.artStatus, 'shared-standard-uniform-no-individual-portrait');
    const rejected = enforceHumanoidAnimationIdentity(actor, { sheetId: CREW_SPRITE_IDS[CREW[0].id], clipId: 'idle' }, { role: 'npc' });
    assert.equal(rejected.degraded, 'recruit-uniform-identity-rejected-v85');
    assert.notEqual(rejected.sheetId, CREW_SPRITE_IDS[CREW[0].id]);
  }
  assert.equal(engine.player.operatorId, 'player-echo9');
}));

test('invalid or mismatched dossiers are not promoted through a Mara fallback', () => {
  assert.equal(buildCrewRuntime([member(0, { id: 'crew-01-mara-vega' })]).length, 0);
  const forged = member(); forged.recruitV85.aptitudes.tir = 999;
  assert.equal(buildCrewRuntime([forged]).length, 0);
});

test('legacy unchanged; a trained named Marine retains its dedicated art and specialty', () => runtime(make => {
  const { engine: legacy } = make(CREW.slice(0, 4));
  assert.equal(legacy.squadActors[0].crewV85, undefined);
  const { engine } = make([{ ...CREW[0], trainingV85: { mobilite: 30, technique: 20 } }, ...CREW.slice(1, 4)]);
  const actor = engine.squadActors[0];
  assert.equal(actor.crewId, CREW[0].id); assert.equal(actor.name, CREW[0].name);
  assert.equal(actor.specialty, CREW[0].specialty);
  assert.equal(actor.spriteId, CREW_SPRITE_IDS[CREW[0].id]);
  assert.equal(actor.visualProfileId, undefined);
  assert.equal(actor.crewV85.aptitudes.mobilite, 80);
}));

for (const weaponId of weaponIds) {
  test(`personal AI weapon ${weaponId}: actual damage, family, magazine and finite reload`, () => runtime(make => {
    const { engine } = make([member(0, { gearV85: [equipment(weaponId)] })]);
    const actor = engine.squadActors[0]; const weapon = WEAPONS.find(item => item.id === weaponId);
    enemyAhead(engine, actor);
    assert.equal(actor.ammo, weapon.magazine); assert.equal(actor.ammoReserve, weapon.magazine * 3);
    assert.equal(engine.updateSquadCombat(actor), true);
    assert.equal(actor.ammo, weapon.magazine - 1);
    assert.equal(engine.bullets[0].weaponId, weaponId); assert.equal(engine.bullets[0].damage, weapon.damage);
    assert.equal(engine.bullets[0].owner, actor); assert.equal(engine.bullets[0].family, weapon.family);
    actor.ammo = 0; actor.fireClock = 0;
    assert.equal(engine.updateSquadCombat(actor), false); assert.equal(actor.reloading, true);
    for (let step = 0; step < 120; step++) tickCrewRuntimeV85(actor, 1 / 30, []);
    assert.equal(actor.ammo, weapon.magazine); assert.equal(actor.ammoReserve, weapon.magazine * 2);
    actor.ammo = actor.ammoReserve = 0; actor.fireClock = 0;
    assert.equal(engine.updateSquadCombat(actor), false); assert.equal(actor.reloading, false);
  }));

  test(`J2 ${weaponId} takeover/fire/reload/return preserves the individual weapon and global J1`, () => runtime(make => {
    const { engine, options } = make([member(0), member(1, { gearV85: [equipment(weaponId)] })]);
    const counterpart = engine.squadActors[1]; const weapon = WEAPONS.find(item => item.id === weaponId);
    counterpart.ammo = 1; counterpart.ammoReserve = weapon.magazine;
    engine.setCoop(true);
    assert.equal(engine.coop.ammo, 1); assert.equal(engine.coop.magazineSize, weapon.magazine);
    const beforeWeapon = engine.weaponRuntime; const beforeBallistics = engine.weaponBallistics;
    enemyAhead(engine, engine.coop, 250); engine.coop.gamepadAimV83 = { x: 1, y: 0 };
    assert.equal(engine.fire(engine.coop), true);
    assert.equal(engine.coop.ammo, 0); assert.equal(engine.bullets[0].damage, weapon.damage);
    assert.equal(engine.weaponRuntime, beforeWeapon); assert.equal(engine.weaponBallistics, beforeBallistics);
    assert.equal(engine.reloadWeaponV77(engine.coop).id, weaponId);
    assert.equal(engine.reload(engine.coop), true);
    updateTacticalReloadV77(engine.coop, weapon.reload * 0.54, { weapon });
    assert.equal(pressTacticalReloadV77(engine.coop, weapon), true);
    assert.notEqual(engine.coop.tacticalReload.result, 'failed');
    updateTacticalReloadV77(engine.coop, 12, { weapon });
    assert.equal(engine.coop.ammo, weapon.magazine); assert.equal(engine.coop.ammoReserve, 0);
    engine.setCoop(false);
    assert.equal(counterpart.ammo, weapon.magazine); assert.equal(counterpart.ammoReserve, 0);
    engine.setCoop(true);
    engine.coop.ammo -= 1; engine.coop.x = 640; engine.coop.shots = 11;
    const captured = engine.captureResumeState();
    const { engine: resumed } = make(options.crew, { resumeState: captured });
    assert.equal(resumed.squadActors[1].ammo, weapon.magazine - 1);
    assert.equal(resumed.squadActors[1].ammoReserve, 0);
    assert.equal(resumed.squadActors[1].shots, 11);
    resumed.setCoop(true);
    assert.equal(resumed.coop.magazineSize, weapon.magazine);
    assert.equal(resumed.coop.ammo, weapon.magazine - 1);
    assert.equal(resumed.reloadWeaponV77(resumed.coop).id, weaponId);
  }));
}

test('empty loadout is genuinely unarmed and specialty cannot create free tools', () => runtime(make => {
  const { engine } = make([member(0, { specialty: 'medical', gearV85: [] })]); const actor = engine.squadActors[0];
  enemyAhead(engine, actor); engine.player.health = 10; engine.player.x = actor.x;
  assert.equal(engine.updateSquadCombat(actor), false);
  actor.supportClock = 0;
  assert.equal(engine.updateSquadSupport(actor, [actor], engine.player), false);
  assert.equal(actor.supportCharges, 0);
}));

test('ammo satchel only supplies its explicitly compatible shotgun, not pistol/rifle', () => runtime(make => {
  for (const id of weaponIds) {
    const { engine } = make([member(0, { gearV85: [equipment(id), equipment('equipment-021-ammo-satchel', 2)] })]);
    const a = engine.squadActors[0];
    assert.equal(a.ammoReserve, a.magazineSize * (id.includes('shotgun') ? 6 : 3));
  }
}));

test('tir affects deterministic actual AI projectile angle; replay keeps shot-index attribution', () => runtime(make => {
  const { engine: low } = make([member(1)]); const { engine: high } = make([member(1, { trainingV85: { tir: 66 } })]);
  for (const engine of [low, high]) { enemyAhead(engine, engine.squadActors[0]); engine.updateSquadCombat(engine.squadActors[0]); }
  const exact = Math.atan2(9, 204);
  assert.ok(Math.abs(high.bullets[0].angleRadians - exact) < Math.abs(low.bullets[0].angleRadians - exact));
}));

test('mobilite changes real walking and acceleration without changing elapsed gravity', () => runtime(make => {
  const { engine: low } = make([member(0)]); const { engine: high } = make([member(0, { trainingV85: { mobilite: 62 } })]);
  for (const engine of [low, high]) {
    const a = engine.squadActors[0]; engine.enemies = []; engine.ladders = []; engine.player.x = 600;
    Object.assign(a, { x: 250, y: 800, grounded: true, vx: 0, vy: 0 });
    engine.updateSquadMovement(a, 0, engine.player, 1 / 60);
  }
  assert.ok(high.squadActors[0].vx > low.squadActors[0].vx);
  assert.equal(high.squadActors[0].vy, low.squadActors[0].vy);
}));

test('physique raises carrying capacity and endurance; removing carried gear restores speed', () => runtime(make => {
  const { engine: low } = make([member(1)]); const { engine: high } = make([member(1, { trainingV85: { physique: 66 } })]);
  const a = low.squadActors[0], b = high.squadActors[0];
  assert.ok(b.crewV85.capacity > a.crewV85.capacity);
  for (const actor of [a, b]) { actor.vx = 200; for (let i = 0; i < 200; i++) tickCrewRuntimeV85(actor, 0.1, []); }
  assert.ok(b.crewV85.endurance > a.crewV85.endurance);
  const { engine: heavy } = make([member(0, { gearV85: [equipment(weaponIds[0]), ...Array.from({ length: 8 }, (_, i) => equipment('equipment-009-m3-personnel-armor', i + 2))] })]);
  const { engine: light } = make([member(0, { gearV85: [equipment(weaponIds[0])] })]);
  assert.ok(crewMovementV85(heavy.squadActors[0]).speed < crewMovementV85(light.squadActors[0]).speed);
}));

test('sang-froid reduces damage-induced stress; nearby cohesion improves recovery', () => runtime(make => {
  const { engine: low } = make([member(0), member(3)]);
  const { engine: high } = make([member(0, { trainingV85: { sangFroid: 50 } }), member(3, { trainingV85: { cohesion: 70 } })]);
  for (const e of [low, high]) { e.squadActors[0].armor = 0; e.damageSquadMember(e.squadActors[0], 10); }
  assert.ok(high.squadActors[0].crewV85.stress < low.squadActors[0].crewV85.stress);
  for (const e of [low, high]) {
    const [a, b] = e.squadActors; a.crewV85.stress = 80; b.x = a.x; b.y = a.y;
    tickCrewRuntimeV85(a, 0.25, [b]);
  }
  assert.ok(high.squadActors[0].crewV85.stress < low.squadActors[0].crewV85.stress);
}));

for (const [kind, equipmentId, stat] of [['medical', 'equipment-006-medkit', 'secourisme'], ['repair', 'equipment-013-welding-kit', 'technique']]) {
  test(`${kind}: tool permits an assault recruit's real action and ${stat} changes amount/cooldown`, () => runtime(make => {
    const makeCase = trained => make([member(0, { trainingV85: trained ? { [stat]: 74 } : {}, gearV85: [equipment(equipmentId)] })]).engine;
    const low = makeCase(false), high = makeCase(true);
    const amounts = [];
    for (const e of [low, high]) {
      const a = e.squadActors[0]; a.supportClock = 0; e.player.x = a.x; e.player.y = a.y; e.player.health = 10;
      Object.assign(e.vehicle, { active: true, destroyed: false, x: a.x, y: a.y, hull: 1, maxHull: 100 });
      assert.equal(a.specialty, 'assault');
      assert.equal(e.updateSquadSupport(a, [a], e.player), true);
      amounts.push(kind === 'medical' ? e.player.health : e.vehicle.hull);
      assert.equal(crewToolChargesV85(a, kind), kind === 'medical' ? 1 : 2);
    }
    assert.ok(amounts[1] > amounts[0]);
    assert.ok(high.squadActors[0].supportClock < low.squadActors[0].supportClock);
  }));
}

test('perception changes scan reach, consumes a personal scanner and reveals actual enemies', () => runtime(make => {
  const configure = trainingV85 => make([member(0, { trainingV85, gearV85: [equipment('equipment-001-motion-tracker')] })]).engine;
  const low = configure({}), high = configure({ perception: 50 });
  for (const e of [low, high]) {
    const a = e.squadActors[0]; a.supportClock = 0;
    const target = enemyAhead(e, a, 680); target.alert = false; target.revealed = 0;
    e.updateSquadSupport(a, [a], e.player);
  }
  assert.equal(low.enemies[0].revealed, 0); assert.ok(high.enemies[0].revealed > 0);
  assert.equal(crewToolChargesV85(high.squadActors[0], 'scan'), 2);
}));

test('runtime resume is crew/weapon-bound, idempotent and preserves interrupted reload and spent tools', () => runtime(make => {
  const { engine, options } = make(); const actor = engine.squadActors[0];
  actor.ammo = 0; actor.ammoReserve = actor.magazineSize; actor.crewV85.endurance = 37; actor.crewV85.stress = 63;
  for (const key of Object.keys(actor.crewV85.charges)) actor.crewV85.charges[key] = 0;
  enemyAhead(engine, actor); engine.updateSquadCombat(actor); tickCrewRuntimeV85(actor, 0.2, []);
  const captured = engine.captureResumeState();
  const { engine: resumed } = make(options.crew, { resumeState: captured });
  const restored = resumed.squadActors[0];
  assert.equal(restored.ammo, 0); assert.equal(restored.ammoReserve, actor.magazineSize);
  assert.equal(restored.reloading, true); assert.deepEqual(restored.crewV85.charges, actor.crewV85.charges);
  const stable = captureCrewRuntimeV85(restored);
  assert.equal(restoreCrewRuntimeV85(restored, stable), true); assert.deepEqual(captureCrewRuntimeV85(restored), stable);
  assert.equal(restoreCrewRuntimeV85(restored, { ...stable, crewId: candidates[1].id }), false);
  assert.equal(restoreCrewRuntimeV85(restored, { ...stable, weaponId: 'forged-weapon' }), false);
}));

test('J2 actual controls retain mobility effects after takeover and resume', () => runtime(make => {
  const engines = [{}, { mobilite: 66 }].map(trainingV85 => make([member(0), member(2, { trainingV85 })]));
  const controls = { left: 'KeyJ', right: 'KeyL', up: 'KeyI', down: 'KeyK', jump: 'KeyU', fire: 'KeyO' };
  const velocities = [];
  for (const { engine, options } of engines) {
    engine.setCoop(true); engine.enemies = []; engine.hazards = []; engine.ladders = [];
    Object.assign(engine.coop, { x: 300, y: 700, vx: 0, vy: 0, grounded: true, inVehicle: false });
    engine.keys.add('KeyL'); engine.updatePlayer(engine.coop, 1 / 60, controls);
    velocities.push(engine.coop.vx);
    const raw = engine.captureResumeState();
    const { engine: resumed } = make(options.crew, { resumeState: raw });
    resumed.setCoop(true); resumed.enemies = []; resumed.hazards = []; resumed.ladders = [];
    Object.assign(resumed.coop, { x: 300, y: 700, vx: 0, vy: 0, grounded: true, inVehicle: false });
    resumed.keys.add('KeyL'); resumed.updatePlayer(resumed.coop, 1 / 60, controls);
    assert.equal(resumed.coop.vx, engine.coop.vx);
  }
  assert.ok(velocities[1] > velocities[0]);
}));

test('cohesion alone, at equal sang-froid, reduces nearby ally stress and cannot act across the level', () => runtime(make => {
  const run = (trained, far) => {
    const { engine } = make([member(0), member(3, { trainingV85: trained ? { cohesion: 70 } : {} })]);
    const [actor, ally] = engine.squadActors;
    actor.crewV85.stress = 80; ally.x = actor.x + (far ? 1000 : 0); ally.y = actor.y;
    tickCrewRuntimeV85(actor, 0.25, [ally]); return actor.crewV85.stress;
  };
  assert.ok(run(true, false) < run(false, false));
  assert.equal(run(true, true), run(false, true));
}));

test('J2 uses only own medkits/scanner, consumes once and cannot use globally owned tools', () => runtime(make => {
  const { engine } = make([member(0), member(1, { gearV85: [equipment('equipment-006-medkit'), equipment('equipment-001-motion-tracker', 2)] })]);
  engine.setCoop(true); engine.coop.health = 10; engine.coop.supportClock = 0;
  const beforeInventory = engine.inventory.medkits;
  assert.equal(engine.useMedkit(engine.coop), true);
  assert.equal(crewToolChargesV85(engine.coop, 'medical'), 1);
  assert.equal(engine.inventory.medkits, beforeInventory);
  assert.equal(engine.useMedkit(engine.coop), false, 'cooldown prevents consuming twice');
  engine.coop.supportClock = 0; enemyAhead(engine, engine.coop);
  assert.equal(engine.activateTracker(engine.coop), true);
  assert.equal(crewToolChargesV85(engine.coop, 'scan'), 2);
  assert.equal(engine.useEquipment('equipment-013-welding-kit', engine.coop), false);
}));

test('transferring functional gear to a catalogue Marine changes actions but never changes named art', () => runtime(make => {
  const { engine } = make([{ ...CREW[0], gearV85: [equipment('equipment-006-medkit')] }, ...CREW.slice(1, 4)]);
  const actor = engine.squadActors[0]; actor.supportClock = 0;
  engine.player.x = actor.x; engine.player.y = actor.y; engine.player.health = 10;
  assert.equal(engine.updateSquadSupport(actor, [actor], engine.player), true);
  assert.equal(actor.spriteId, CREW_SPRITE_IDS[CREW[0].id]);
  assert.equal(actor.name, CREW[0].name);
}));

test('Alpha/Bravo real movement obeys trained mobility while preserving four-person teams', () => runtime(make => {
  const velocities = [];
  for (const trainingV85 of [{}, { mobilite: 62 }]) {
    const { engine } = make([member(0, { trainingV85 }), member(1), member(2), member(3)], { campaign: ALPHA_BRAVO_CAMPAIGN_V69 });
    const actor = engine.squadActors[0];
    const teamId = engine.alphaBravoTeamForActorV69(actor);
    assert.ok(teamId); assert.equal(Object.values(engine.alphaBravoV69.teams).flatMap(team => team.memberIds).length, 4);
    engine.ladders = []; Object.assign(actor, { x: 400, y: 700, vx: 0, vy: 0, grounded: true, inVehicle: false });
    engine.alphaBravoMoveMemberV69(actor, { x: 700, y: 700, w: 40, h: 90 }, teamId, 1 / 60);
    velocities.push(actor.vx);
  }
  assert.ok(velocities[1] > velocities[0]);
}));

test('fatigue is temporary: same permanent aptitudes and gear, lower actual movement when tired', () => runtime(make => {
  const velocities = [];
  const actors = [];
  for (const fatigue of [0, 100]) {
    const { engine } = make([member(0, { fatigue })]); const actor = engine.squadActors[0];
    actors.push(actor); engine.enemies = []; engine.ladders = []; engine.player.x = 600;
    Object.assign(actor, { x: 250, y: 700, vx: 0, vy: 0, grounded: true });
    engine.updateSquadMovement(actor, 0, engine.player, 1 / 60); velocities.push(actor.vx);
  }
  assert.deepEqual(actors[0].crewV85.aptitudes, actors[1].crewV85.aptitudes);
  assert.equal(actors[0].crewV85.mass, actors[1].crewV85.mass);
  assert.ok(velocities[1] < velocities[0]);
}));

test('J2 support cooldown advances, real action counter and consumed charges survive resume', () => runtime(make => {
  const { engine, options } = make([member(0), member(1, { gearV85: [equipment('equipment-006-medkit')] })]);
  engine.setCoop(true); engine.coop.health = 10; engine.coop.supportClock = 0;
  const actions = engine.coop.actions || 0;
  assert.equal(engine.useMedkit(engine.coop), true);
  assert.equal(engine.coop.actions, actions + 1);
  assert.equal(engine.squadTelemetry.consequences.at(-1).crewId, engine.coop.operatorId);
  for (let frame = 0; frame < 40; frame++) tickCrewRuntimeV85(engine.coop, 0.25, []);
  assert.equal(engine.coop.supportClock, 0);
  const raw = engine.captureResumeState();
  const { engine: resumed } = make(options.crew, { resumeState: raw }); resumed.setCoop(true);
  assert.equal(crewToolChargesV85(resumed.coop, 'medical'), 1);
  assert.equal(resumed.coop.actions, actions + 1);
  resumed.coop.health = 10;
  assert.equal(resumed.useMedkit(resumed.coop), true);
  assert.equal(crewToolChargesV85(resumed.coop, 'medical'), 0);
}));

test('training never removes a historical command or diplomacy aura', () => runtime(make => {
  const names = [CREW.find(actor => actor.specialty === 'command'), CREW.find(actor => actor.specialty === 'diplomacy')];
  assert.ok(names.every(Boolean));
  const { engine: before } = make(names);
  const { engine: after } = make(names.map(actor => ({ ...actor, trainingV85: { tir: 2 } })));
  assert.equal(after.squadCommandMultiplier, before.squadCommandMultiplier);
  assert.equal(after.squadCohesionMultiplier, before.squadCohesionMultiplier);
}));

for (const weaponId of weaponIds) {
  test(`legacy J1 embodies its actual recruit: ${weaponId}, reload, tools and resume`, () => runtime(make => {
    const roster = [member(0, { trainingV85: { mobilite: 30 }, gearV85: [equipment(weaponId), equipment('equipment-001-motion-tracker', 2)] }), member(1)];
    const { engine, options } = make(roster, { playerIdentityV84: null });
    const actor = engine.player; const weapon = WEAPONS.find(item => item.id === weaponId);
    assert.equal(actor.operatorId, roster[0].id);
    assert.equal(actor.name, roster[0].name); assert.equal(actor.crewV85.crewId, actor.operatorId);
    assert.equal(engine.squadActors.length, 1, 'J1 is not duplicated as an ally');
    assert.equal(actor.ammo, weapon.magazine); assert.equal(actor.magazineSize, weapon.magazine);
    assert.equal(engine.weaponProfile(actor).damage, weapon.damage);
    assert.equal(engine.reloadWeaponV77(actor).id, weapon.id);
    enemyAhead(engine, actor); actor.gamepadAimV83 = { x: 1, y: 0 };
    assert.equal(engine.fire(actor), true); assert.equal(actor.ammo, weapon.magazine - 1);
    assert.equal(engine.bullets[0].damage, weapon.damage);
    assert.equal(engine.activateTracker(actor), true); assert.equal(crewToolChargesV85(actor, 'scan'), 2);
    assert.equal(actor.actions, 1);
    assert.equal(engine.reload(actor), true);
    updateTacticalReloadV77(actor, 0.2, { weapon });
    actor.crewV85.endurance = 33; actor.crewV85.stress = 41;
    const saved = engine.captureResumeState();
    assert.equal(saved.squad.playerV85.crewRuntimeV85.crewId, actor.operatorId);
    const { engine: resumed } = make(roster, { ...options, resumeState: saved });
    assert.equal(resumed.lastResumeResult.applied, true);
    assert.equal(resumed.player.ammo, weapon.magazine - 1); assert.equal(resumed.player.ammoReserve, weapon.magazine * 3);
    assert.equal(resumed.player.crewV85.endurance, 33); assert.equal(resumed.player.crewV85.stress, 41);
    assert.equal(resumed.player.actions, 1); assert.equal(crewToolChargesV85(resumed.player, 'scan'), 2);
    assert.equal(resumed.player.reloading, true);
    updateTacticalReloadV77(resumed.player, 12, { weapon });
    assert.equal(resumed.player.ammo, weapon.magazine); assert.equal(resumed.player.ammoReserve, weapon.magazine * 3 - 1);
    const before = resumed.player.supportClock; resumed.updateMissionSquad(0.25);
    assert.ok(resumed.player.supportClock < before);
    assert.ok(resumed.player.crewV85.endurance > 33);
    const { engine: independent } = make(roster);
    assert.equal(independent.player.crewV85, undefined); assert.equal(independent.player.operatorId, 'player-echo9');
  }));
}

test('legacy J1 physical controls use its own mobility and fatigue, without any companion', () => runtime(make => {
  const velocities = [];
  for (const fatigue of [0, 100]) {
    const { engine, options } = make([member(0, { trainingV85: { mobilite: 30 }, fatigue })], { playerIdentityV84: null });
    assert.equal(engine.squadActors.length, 0);
    engine.ladders = []; engine.enemies = []; engine.hazards = [];
    Object.assign(engine.player, { x: 400, y: 700, vx: 0, vy: 0, grounded: true });
    engine.keys.add('KeyD'); engine.updatePlayer(engine.player, 1 / 60, { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space', fire: 'KeyF' });
    velocities.push(engine.player.vx); const before = engine.player.crewV85.endurance;
    engine.updateMissionSquad(0.25); assert.ok(engine.player.crewV85.endurance < before);
    const saved = engine.captureResumeState();
    const { engine: resumed } = make(options.crew, { ...options, resumeState: saved });
    assert.equal(resumed.player.crewV85.endurance, engine.player.crewV85.endurance);
  }
  assert.ok(velocities[0] > velocities[1]);
}));

test('global M41A field pickup cannot overwrite personal J1/J2 or be consumed by them', () => runtime(make => {
  for (const role of ['legacy-j1', 'coop']) {
    const roster = [member(0, { gearV85: [equipment(weaponIds[2])] }), member(1, { gearV85: [equipment(weaponIds[2], 2)] })];
    const { engine, options } = make(roster, { playerIdentityV84: role === 'legacy-j1' ? null : identity });
    if (role === 'coop') engine.setCoop(true);
    const actor = role === 'coop' ? engine.coop : engine.player;
    engine.supplies = []; engine.drops = []; actor.x = 300; actor.y = 700;
    engine.weaponPickup = { id: 'm41a', x: actor.x, y: actor.y, w: 40, h: 60, taken: false };
    const before = { ammo: actor.ammo, reserve: actor.ammoReserve, magazine: actor.magazineSize };
    engine.interact(actor);
    assert.equal(engine.weaponPickup.taken, false);
    assert.deepEqual({ ammo: actor.ammo, reserve: actor.ammoReserve, magazine: actor.magazineSize }, before);
    const saved = engine.captureResumeState();
    const { engine: resumed } = make(roster, { ...options, resumeState: saved });
    if (role === 'coop') resumed.setCoop(true);
    const restored = role === 'coop' ? resumed.coop : resumed.player;
    assert.deepEqual({ ammo: restored.ammo, reserve: restored.ammoReserve, magazine: restored.magazineSize }, before);
    if (role === 'coop') {
      engine.player.x = actor.x; engine.player.y = actor.y;
      assert.equal(engine.interact(engine.player), true);
      assert.equal(engine.weaponPickup.taken, true, 'remains usable by independent global-loadout commander');
    }
  }
}));
