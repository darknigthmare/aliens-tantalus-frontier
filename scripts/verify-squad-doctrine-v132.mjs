import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GameEngine as ProductionEngine } from '../src/game-production-runtime.js';
import { withSquadDoctrineV132 } from '../src/squad-doctrine-v132.js';
import { renderSquadCommandMarkupV132 } from '../src/squad-command-ui-v132.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, LEVEL_SEEDS, CREW } from '../src/content.js';

const Engine = ProductionEngine.prototype.getSquadCommandModelV132 ? ProductionEngine : withSquadDoctrineV132(ProductionEngine);
const controls = { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space', fire: 'KeyF' };
const coopControls = { left: 'KeyJ', right: 'KeyL', up: 'KeyI', down: 'KeyK', jump: 'KeyU', fire: 'KeyO' };
const personal = (member, suffix = '') => ({ ...member, gearV85: [
  { instanceId: `squad-rifle-${member.id}${suffix}`, kind: 'weapon', catalogId: 'weapon-001-m41a-pulse-rifle' },
  { instanceId: `squad-medical-${member.id}${suffix}`, kind: 'equipment', catalogId: 'equipment-006-medkit' }
] });
function make(overrides = {}) {
  const bus = new EventTarget(); for (const key of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[key] = bus[key].bind(bus);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.Image = class extends EventTarget { complete = true; naturalWidth = 1024; naturalHeight = 1024; async decode() {} set src(value) { this._src = value; queueMicrotask(() => this.dispatchEvent(new Event('load'))); } get src() { return this._src; } };
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  const ctx = new Proxy({}, { get: (target, property) => property in target ? target[property] : () => {} });
  const canvas = Object.assign(new EventTarget(), { getContext: () => ctx, focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const events = [], engine = new Engine(canvas, { onEvent: event => events.push(event) });
  const level = buildMissionLevelV52({ templateId: 'ship-interior-vertical', levelSeeds: LEVEL_SEEDS, world: WORLDS[0], campaign: CAMPAIGNS[0] });
  const options = { world: WORLDS[0], campaign: CAMPAIGNS[0], weapon: WEAPONS[0], enemyCatalog: ENEMIES.slice(0, 1), equipment: [],
    crew: CREW.slice(0, 4).map(member => personal(member)), seed: 13246, missionLevel: level,
    strategicBriefing: { id: 'normal-deployment-132' }, ...overrides };
  engine.start(options); engine.enemies = []; engine.hazards = []; engine.enemyAtlasLoadingPausedV65 = false;
  engine.userCasteLoadingV88 = false;
  if (!overrides.resumeState && engine.squadDoctrineV132) engine.squadDoctrineV132.doctrine = 'defensive';
  const key = (type, code) => { const event = new Event(type, { cancelable: true }); Object.assign(event, { code, repeat: false, ctrlKey: false, altKey: false, metaKey: false }); bus.dispatchEvent(event); };
  motion(engine, .2);
  return { engine, events, options, key };
}
function motion(engine, seconds, rate = 60) {
  for (let time = 0; time < seconds - 1e-9;) { const delta = Math.min(1 / rate, seconds - time); engine.animationTime += delta;
    engine.updateLifts(delta); engine.updatePlayer(engine.player, delta, controls);
    if (engine.coopEnabled) engine.updatePlayer(engine.coop, delta, coopControls);
    engine.updateMissionSquad(delta); time += delta;
  }
}
function down(actor) { Object.assign(actor, { health: 0, alive: false, downed: true, bleedOut: 18, vx: 0, vy: 0, grounded: true, climbing: false }); }
function localTarget(engine) { return engine.squadActors.find(actor => actor.alive && Math.abs(actor.x - engine.player.x) <= 104); }
function beginCarry(engine, helperId = null) {
  const target = localTarget(engine); assert.ok(target, 'Manifest provides a local original human.'); down(target);
  const response = engine.performSquadActionV132('carry', { targetId: `crew:${target.crewId}`, helperId }); assert.equal(response.applied, true, response.reason);
  const original = { x: target.x, y: target.y }; motion(engine, .8);
  assert.equal(engine.squadDoctrineV132.carries.length, 1); assert.ok(Math.abs(target.x - original.x) <= 1.1, 'Acquisition never snaps a body.');
  motion(engine, .5); return target;
}

test('transverse doctrine activates on a real standard briefing and excludes special/editor/neuro scenarios', () => {
  const { engine } = make(); assert.equal(engine.getSquadCommandModelV132().schema, 132); assert.equal(engine.squadDoctrineV132.roster.length, 3);
  assert.deepEqual(Object.values(engine.squadDoctrineV132.assignments), ['alpha', 'alpha', 'bravo']); engine.stop();
  for (const overrides of [{ campaign: { ...CAMPAIGNS[0], id: 'special-custom-test' } }, { squadDoctrineV132: false }, { neuroProfile: { id: 'test' } }, { editorProject: { kind: 'mission', objects: [] } }]) {
    const { engine } = make(overrides); assert.equal(engine.getSquadCommandModelV132(), null); engine.stop();
  }
});

test('orders, groups and formation slots physically move without distant rally injection', () => {
  const { engine } = make(); const member = engine.squadActors[0];
  assert.equal(engine.performSquadActionV132('formation', 'column').applied, true);
  assert.equal(engine.performSquadActionV132('select-team', 'alpha').applied, true);
  assert.equal(engine.performSquadActionV132('order', 'hold').applied, true); const position = member.x; motion(engine, .4); assert.equal(member.x, position);
  assert.equal(engine.performSquadActionV132('order', 'move').reason, 'marker');
  const platform = engine.platforms.find(surface => member.x >= surface.x && member.x <= surface.x + surface.w && surface.kind !== 'lift');
  assert.equal(engine.performSquadActionV132('marker', { x: platform.x + 60, y: platform.y - engine.player.h }).applied, true);
  assert.equal(engine.performSquadActionV132('order', 'move').applied, true);
  const before = member.x; motion(engine, 1 / 60); assert.ok(Math.abs(member.x - before) <= 192 / 60 + .1);
  engine.player.x += 1300; engine.performSquadActionV132('order', 'rally'); const distant = member.x; motion(engine, 1 / 60);
  assert.ok(Math.abs(member.x - distant) <= 4, 'Rally never teleports an original member.'); engine.stop();
});

test('ammunition transfers conserve magazine and reserve totals and respect compatible issue capacity', () => {
  const { engine, events } = make(), target = localTarget(engine); target.ammoReserve -= 20;
  const rounds = engine.player.ammoReserve + target.ammoReserve, magazine = engine.player.ammo;
  const result = engine.performSquadActionV132('share-ammo', `crew:${target.crewId}`); assert.equal(result.amount, 12);
  assert.equal(engine.player.ammoReserve + target.ammoReserve, rounds); assert.equal(engine.player.ammo, magazine);
  assert.equal(events.at(-1).type, 'squad-resource-transferred-v132');
  const before = engine.captureResumeState(); engine.paused = true; assert.equal(engine.performSquadActionV132('share-ammo', `crew:${target.crewId}`).applied, false);
  assert.equal(engine.player.ammoReserve, before.player.ammoReserve); engine.paused = false;
  target.crewV85.weaponRuntime = { ...target.crewV85.weaponRuntime, id: 'foreign-ammunition' };
  assert.equal(engine.performSquadActionV132('share-ammo', `crew:${target.crewId}`).reason, 'incompatible'); engine.stop();
});

test('medical transfer moves one actual matching item charge and cannot turn a global kit into two kits', () => {
  const { engine } = make(), target = localTarget(engine), source = engine.player;
  const sourceKey = source.crewV85.gear.find(item => item.function === 'medical').instanceId;
  const targetKey = target.crewV85.gear.find(item => item.function === 'medical').instanceId;
  target.crewV85.charges[targetKey]--; const before = source.crewV85.charges[sourceKey] + target.crewV85.charges[targetKey];
  assert.equal(engine.performSquadActionV132('share-medical', `crew:${target.crewId}`).applied, true);
  assert.equal(source.crewV85.charges[sourceKey] + target.crewV85.charges[targetKey], before);
  assert.equal(engine.performSquadActionV132('share-medical', `crew:${target.crewId}`).reason, 'full');
  source.crewV85.personalEquipment = false; assert.equal(engine.performSquadActionV132('share-medical', `crew:${target.crewId}`).reason, 'incompatible'); engine.stop();
});

test('rescue is reserved, timed, local and spends exactly once at commit', () => {
  const { engine, events } = make(), target = localTarget(engine); down(target);
  const item = engine.player.crewV85.gear.find(item => item.function === 'medical'), initial = engine.player.crewV85.charges[item.instanceId];
  assert.equal(engine.revive(engine.player, target), true); assert.equal(target.alive, false);
  assert.equal(engine.reserveSquadRescueV132(engine.squadActors[1], target).reason, 'reserved');
  motion(engine, 2); assert.equal(target.downed, true); assert.equal(engine.player.crewV85.charges[item.instanceId], initial);
  motion(engine, .5); assert.equal(target.alive, true); assert.equal(engine.player.crewV85.charges[item.instanceId], initial - 1);
  assert.equal(events.filter(event => event.type === 'squad-revived').length, 1); assert.equal(engine.revive(engine.player, target), false); engine.stop();
});

test('impact, leaving range and empty issue interrupt a reservation without spending medical resources', () => {
  for (const change of ['impact', 'range', 'empty']) {
    const { engine } = make(), target = localTarget(engine); down(target);
    assert.equal(engine.reserveSquadRescueV132(engine.player, target).applied, true);
    const key = engine.player.crewV85.gear.find(item => item.function === 'medical').instanceId;
    const remaining = engine.player.crewV85.charges[key]; motion(engine, .3);
    if (change === 'impact') engine.player.damageTaken += 1;
    if (change === 'range') target.x += 240;
    if (change === 'empty') engine.player.crewV85.charges[key] = 0;
    motion(engine, .1); assert.equal(engine.squadDoctrineV132.tasks.length, 0); assert.equal(target.downed, true);
    if (change !== 'empty') assert.equal(engine.player.crewV85.charges[key], remaining); engine.stop();
  }
});

test('pause and atlas loading freeze orders, reservations and carrying physics', () => {
  for (const flag of ['paused', 'enemyAtlasLoadingPausedV65', 'userCasteLoadingV88']) {
    const { engine } = make(), target = beginCarry(engine); engine[flag] = true;
    const before = [engine.player.x, engine.player.y, target.x, target.y, target.bleedOut, engine.squadDoctrineV132.telemetry.distanceCarried];
    engine.keys.add('KeyD'); motion(engine, .3);
    assert.deepEqual([engine.player.x, engine.player.y, target.x, target.y, target.bleedOut, engine.squadDoctrineV132.telemetry.distanceCarried], before);
    assert.equal(engine.performSquadActionV132('drop').applied, false); engine.stop();
  }
});

test('original downed body follows weighted keyboard movement with occupied hands and no climbing shortcut', () => {
  const { engine, key } = make(), identityPlayer = engine.player, target = beginCarry(engine), original = target;
  const before = engine.player.x, bodyBefore = target.x; key('keydown', 'KeyD'); motion(engine, .7); key('keyup', 'KeyD');
  assert.equal(engine.player, identityPlayer); assert.equal(engine.squadActors.find(member => member.crewId === original.crewId), original);
  assert.ok(engine.player.x > before + 40 && engine.player.x < before + 100);
  assert.ok(target.x > bodyBefore); assert.equal(engine.fire(engine.player), false); assert.equal(engine.reload(engine.player), false);
  key('keydown', 'Space'); key('keydown', 'KeyW'); motion(engine, .1); key('keyup', 'Space'); key('keyup', 'KeyW');
  assert.equal(engine.player.climbing, false); assert.equal(engine.player.vy, 0); assert.equal(target.downed, true); engine.stop();
});

test('a carried hull stops at walls and a safe drop releases into gravity at the original location', () => {
  const { engine, key } = make(), target = beginCarry(engine); const wall = { id: 'carry-wall', x: target.x + target.w + 30, y: target.y - 50, w: 30, h: 200 };
  engine.walls.push(wall); key('keydown', 'KeyD'); motion(engine, 1.2); key('keyup', 'KeyD');
  assert.ok(target.x + target.w <= wall.x + .001); assert.ok(engine.player.x + engine.player.w <= wall.x + .001);
  const position = { x: target.x, y: target.y }; assert.equal(engine.performSquadActionV132('drop').applied, true);
  assert.equal(target.x, position.x); assert.equal(target.y, position.y); motion(engine, .3);
  assert.equal(target.x, position.x); assert.ok(target.y >= position.y); assert.equal(target.grounded, true); assert.equal(target.carriedByV132, null); engine.stop();
});

test('assisted carrying requires an original nearby living helper and gives a finite physical benefit', () => {
  const { engine, key } = make(); key('keydown', 'KeyA'); motion(engine, .3); key('keyup', 'KeyA'); motion(engine, .2);
  const target = localTarget(engine), helper = engine.squadActors.find(member => member !== target && Math.abs(member.x - engine.player.x) <= 112);
  assert.ok(helper); down(target);
  assert.equal(engine.reserveSquadRescueV132(engine.player, target, 'carry', `crew:${helper.crewId}`).applied, true); motion(engine, 1.3);
  assert.equal(engine.squadCarrySpeedScaleV132(engine.player), .68); helper.x -= 500;
  assert.equal(engine.squadCarrySpeedScaleV132(engine.player), .52); engine.stop();
});

test('legacy saves migrate idle and matching carrying saves restore atomically without refilling kits', () => {
  const fixture = make(), target = beginCarry(fixture.engine), raw = fixture.engine.captureResumeState();
  assert.equal(fixture.engine.validateSquadResumeV132(raw).valid, true);
  const resumed = make({ resumeState: raw }); assert.equal(resumed.engine.lastResumeResult.applied, true);
  assert.equal(resumed.engine.player.carryingV132, `crew:${target.crewId}`); assert.equal(resumed.engine.squadDoctrineV132.carries.length, 1);
  const medical = fixture.engine.player.crewV85.gear.find(item => item.function === 'medical').instanceId;
  assert.equal(resumed.engine.player.crewV85.charges[medical], fixture.engine.player.crewV85.charges[medical]);
  const legacy = structuredClone(raw); delete legacy.squadDoctrineV132;
  assert.equal(resumed.engine.applyResumeState(legacy).applied, true); assert.equal(resumed.engine.squadDoctrineV132.carries.length, 0);
  fixture.engine.stop(); resumed.engine.stop();
});

test('foreign worlds, malformed reservations and carry offsets are rejected before any actor/resource/time mutation', () => {
  const { engine } = make(); beginCarry(engine); const original = engine.captureResumeState();
  for (const mutate of [raw => { raw.squadDoctrineV132.token += 'foreign'; }, raw => { raw.squadDoctrineV132.carries[0].dx += 30; },
    raw => { raw.squadDoctrineV132.carries[0].targetId = 'crew:foreign'; }, raw => { raw.squadDoctrineV132.carries.push(raw.squadDoctrineV132.carries[0]); },
    raw => { raw.squadDoctrineV132.assignments.foreign = 'alpha'; }]) {
    const invalid = structuredClone(original); mutate(invalid); invalid.player.health = 3; invalid.player.ammoReserve = 0;
    assert.equal(engine.applyResumeState(invalid).applied, false); assert.deepEqual(engine.captureResumeState(), original);
  }
  engine.stop();
});

test('command markup follows reasons, uses French labels and escapes operator names', () => {
  const { engine } = make(); engine.squadActors[0].name = '<script>stranger</script>';
  let model = engine.getSquadCommandModelV132(), html = renderSquadCommandMarkupV132(model);
  assert.ok(html.includes('&lt;script&gt;')); assert.ok(!html.includes('<script>')); assert.ok(html.includes('Secourir'));
  engine.paused = true; model = engine.getSquadCommandModelV132(); html = renderSquadCommandMarkupV132(model);
  assert.equal(model.canAct, false); assert.ok(html.includes(' disabled')); assert.equal(engine.openSquadCommandV132(), true); engine.stop();
});

test('keyboard carry boards a real elevator and the original casualty travels by its exact displacement', () => {
  const { engine, key } = make(), target = beginCarry(engine), lift = engine.lifts[0];
  key('keydown', 'KeyD');
  for (let frame = 0; frame < 260 && engine.player.x + engine.player.w / 2 < lift.x + lift.w / 2; frame++) motion(engine, 1 / 60);
  key('keyup', 'KeyD'); motion(engine, .2);
  assert.ok(Math.abs(engine.player.y + engine.player.h - lift.y) < .001);
  const actorY = engine.player.y, bodyY = target.y, floor = lift.y;
  const saves = [], originalEvent = engine.onEvent;
  engine.onEvent = event => { if (['lift-arrived-v130', 'lift-blocked-v130'].includes(event.type)) saves.push(engine.captureResumeState()); originalEvent(event); };
  key('keydown', 'KeyE'); key('keyup', 'KeyE'); assert.equal(lift.stateV130, 'moving');
  motion(engine, 3); assert.equal(lift.y, lift.stops[1].y);
  assert.ok(Math.abs(engine.player.y - actorY - (lift.y - floor)) < .001);
  assert.ok(Math.abs(target.y - bodyY - (lift.y - floor)) < .001);
  assert.ok(saves.length); for (const save of saves) assert.equal(engine.validateSquadResumeV132(save).valid, true, 'Event capture contains actual matching original body coordinates.');
  engine.stop();
});

test('a lifted casualty, higher than the carrier, stops the cabin at a ceiling without body overlap', () => {
  const { engine, key } = make(), target = beginCarry(engine), lift = engine.lifts[0]; key('keydown', 'KeyD');
  for (let frame = 0; frame < 260 && engine.player.x + engine.player.w / 2 < lift.x + lift.w / 2; frame++) motion(engine, 1 / 60);
  key('keyup', 'KeyD'); motion(engine, .2);
  const ceiling = { id: 'body-only-ceiling', x: target.x, y: target.y - 45, w: target.w, h: 20 };
  engine.walls.push(ceiling); key('keydown', 'KeyE'); key('keyup', 'KeyE'); motion(engine, .5);
  assert.equal(lift.stateV130, 'blocked'); assert.equal(lift.blockedByV130, ceiling.id);
  assert.ok(target.y >= ceiling.y + ceiling.h - .001); assert.ok(engine.player.y > target.y);
  engine.walls = engine.walls.filter(wall => wall !== ceiling); motion(engine, 3); assert.equal(lift.y, lift.stops[1].y); engine.stop();
});

test('a normal Alpha group follows the real ladder route to the upper storey in bounded steps', () => {
  const { engine } = make(), member = engine.squadActors[0];
  const ladder = engine.ladders.find(item => item.id.includes('service-ladder'));
  assert.ok(ladder);
  const lower = engine.platforms.find(platform => ladder.x >= platform.x && ladder.x <= platform.x + platform.w && Math.abs(platform.y - ladder.bottom) < 2);
  const upper = engine.platforms.find(platform => ladder.x >= platform.x && ladder.x <= platform.x + platform.w && Math.abs(platform.y - ladder.top) < 2);
  // This fixture puts an authored actor at the local connector entrance; every
  // ascent frame uses production navigation rather than a position injection.
  Object.assign(member, { x: ladder.x - member.w / 2, y: lower.y - member.h, grounded: true });
  engine.squadDoctrineV132.selectedTeam = 'alpha';
  assert.equal(engine.performSquadActionV132('marker', { x: ladder.x - engine.player.w / 2, y: upper.y - engine.player.h }).applied, true);
  assert.equal(engine.performSquadActionV132('order', 'move').applied, true);
  let climbed = false;
  for (let frame = 0; frame < 330; frame++) { const before = member.y; motion(engine, 1 / 60);
    assert.ok(Math.abs(member.y - before) <= 3, 'A ladder step is finite.'); climbed ||= member.levelNavigation?.mode === 'ladder';
    if (member.y + member.h <= upper.y + 1) break;
  }
  assert.ok(climbed); assert.ok(Math.abs(member.y + member.h - upper.y) <= 1); engine.stop();
});

test('a downed J2 can be carried without identity reassignment, unsafe drops or bleed-out suspension', () => {
  const { engine } = make(); engine.setCoop(true);
  // Co-op insertion is authored near J1; no actor identity or issue is replaced.
  const original = engine.coop; motion(engine, .3); down(original);
  const response = engine.performSquadActionV132('carry', 'coop'); assert.equal(response.applied, true, response.reason);
  motion(engine, 1.3); assert.equal(engine.coop, original); assert.equal(engine.player.carryingV132, 'coop');
  assert.ok(original.bleedOut < 18); engine.hazards.push({ kind: 'acid', active: true, x: original.x - 30, y: original.y, w: 100, h: original.h + 50 });
  assert.equal(engine.performSquadActionV132('drop').reason, 'drop');
  original.bleedOut = .05; motion(engine, .1); assert.equal(original.downed, false); assert.equal(engine.squadDoctrineV132.carries.length, 0); engine.stop();
});

test('missions with no authored plan or no companion preserve legacy solo and co-op controls', () => {
  for (const overrides of [{ missionLevel: null }, { crew: [] }, { crew: [CREW[0]] }]) {
    const { engine } = make(overrides); assert.equal(engine.getSquadCommandModelV132(), null);
    engine.setCoop(true); Object.assign(engine.coop, { x: engine.player.x + 45, y: engine.player.y }); down(engine.coop);
    assert.equal(engine.revive(engine.player, engine.coop), true); assert.equal(engine.coop.alive, true); engine.stop();
  }
});

test('three original crew members walk out of insertion-edge support and board without blocking or teleporting a human lift', () => {
  const { engine, key } = make({ crew: CREW.slice(0, 4) }), lift = engine.lifts[0], initial = engine.squadActors.map(actor => actor.x);
  key('keydown', 'KeyD');
  for (let frame = 0; frame < 200 && engine.player.x + engine.player.w / 2 < lift.x + lift.w / 2; frame++) {
    const before = engine.squadActors.map(actor => actor.x); motion(engine, 1 / 60);
    engine.squadActors.forEach((actor, index) => assert.ok(Math.abs(actor.x - before[index]) <= 4, 'Traversal must walk rather than set boarding coordinates.'));
  }
  key('keyup', 'KeyD'); motion(engine, .2);
  assert.ok(engine.squadActors.every((actor, index) => actor.x > initial[index] + 10));
  key('keydown', 'KeyE'); key('keyup', 'KeyE'); motion(engine, 4.5);
  assert.equal(lift.stateV130, 'idle'); assert.equal(lift.y, 504); assert.equal(engine.player.y + engine.player.h, 504);
  assert.ok(engine.squadActors.some(actor => actor.y + actor.h < 510)); engine.stop();
});

test('native save sanitizer keeps assignments, hold anchors, finite transfers and a pending medical reservation', async () => {
  const { sanitizeOperationResumeState } = await import('../src/save.js');
  const { engine, options } = make(), target = localTarget(engine);
  target.ammoReserve -= 20; engine.performSquadActionV132('share-ammo', `crew:${target.crewId}`);
  engine.performSquadActionV132('order', 'hold'); down(target); engine.reserveSquadRescueV132(engine.player, target); motion(engine, .4);
  const raw = engine.captureResumeState(), sanitized = sanitizeOperationResumeState(raw);
  assert.deepEqual(sanitized.squadDoctrineV132.assignments, raw.squadDoctrineV132.assignments);
  assert.deepEqual(sanitized.squadDoctrineV132.holds, raw.squadDoctrineV132.holds);
  assert.equal(engine.validateSquadResumeV132(sanitized).valid, true);
  const restored = make({ ...options, resumeState: sanitized }).engine;
  assert.equal(restored.lastResumeResult.applied, true); assert.equal(restored.squadDoctrineV132.tasks.length, 1);
  assert.equal(restored.player.ammoReserve, engine.player.ammoReserve); motion(restored, 2.2);
  assert.equal(restored.squadActors.find(actor => actor.crewId === target.crewId).alive, true);
  engine.stop(); restored.stop();
});

test('medical save reservations require their original real issue and reject foreign worlds before mutation', () => {
  const { engine } = make(), target = localTarget(engine); down(target); engine.reserveSquadRescueV132(engine.player, target); motion(engine, .4);
  const raw = engine.captureResumeState();
  for (const corrupt of [state => { state.squadDoctrineV132.tasks[0].medicalSource.ownerId = 'foreign'; },
    state => { const issue = state.squadDoctrineV132.tasks[0].medicalSource; state.squad.playerV85.crewRuntimeV85.charges[issue.instanceId] = 0; },
    state => { state.identity.worldId = 'foreign-world'; }]) {
    const invalid = structuredClone(raw); corrupt(invalid); invalid.player.health = 7;
    assert.equal(engine.applyResumeState(invalid).applied, false); assert.deepEqual(engine.captureResumeState(), raw);
  }
  engine.stop();
});

test('death and rescue event callbacks capture reconciled terminal reservations with original body identities', () => {
  const { engine } = make(); beginCarry(engine); const saves = [], originalEvent = engine.onEvent;
  engine.onEvent = event => { originalEvent(event); if (event.type === 'player-down') saves.push(engine.captureResumeState()); };
  const original = engine.player; engine.downPlayer(engine.player, 'qa-carry-impact');
  assert.equal(engine.player, original); assert.equal(engine.squadDoctrineV132.carries.length, 0);
  assert.ok(saves.length); assert.equal(engine.validateSquadResumeV132(saves[0]).valid, true);
  engine.stop();
});

test('native V88 deferred restore inside start retains the previously restored doctrine rather than resetting defaults', () => {
  const { engine, options } = make({ userCasteCampaignV88: true });
  engine.performSquadActionV132('formation', 'column'); engine.performSquadActionV132('doctrine', 'discreet'); engine.performSquadActionV132('order', 'hold');
  const saved = engine.captureResumeState(), resumed = make({ ...options, resumeState: saved }).engine;
  assert.equal(resumed.lastResumeResult.applied, true); assert.equal(resumed.squadDoctrineV132.formation, 'column');
  assert.equal(resumed.squadDoctrineV132.doctrine, 'discreet'); assert.equal(resumed.squadDoctrineV132.teams.alpha.order, 'hold');
  assert.deepEqual(resumed.squadDoctrineV132.holds, engine.squadDoctrineV132.holds); engine.stop(); resumed.stop();
});
