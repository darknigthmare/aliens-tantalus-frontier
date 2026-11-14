// Regression tests, bug hunt "interaction priority" (2026-11-14).
// Owner decision: "the prompt is always right": E acts exactly on the target
// the visible prompt names; a pickup wins only when nearest or alone.
// Fixtures: scripts/engine-host-v188.mjs (production GameEngine, browser APIs
// stubbed). Injections: actor positions, drops/supplies/doors placed by hand,
// mission.objectives.boss set to allow the archive terminal.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fixture, host, prepare } from './engine-host-v188.mjs';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content-core-v50.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { HubGame as HubV52 } from '../src/hub-v52-runtime.js';
import { EN_CATALOG_V185 } from '../src/i18n-en-catalog-v185.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const SHIP = { ...CAMPAIGNS[0], templateId: 'ship-interior-vertical' };

async function templateFixture(templateId, seed = 7) {
  const browser = host(), events = [];
  const options = { world: WORLDS[0], campaign: CAMPAIGNS[0], weapon: WEAPONS[0], enemyCatalog: ENEMIES, equipment: [], crew: [], seed };
  options.missionLevel = buildMissionLevelV52({ ...options, templateId, levelSeeds: LEVEL_SEEDS });
  const engine = new GameEngine(browser.canvas, { onEvent: event => events.push(event) }); engine.start(options); await prepare(engine);
  engine.enemies = []; engine.squadActors = []; engine.hazards = []; engine.coopEnabled = false;
  return { engine, events };
}
function standAtDoor(engine, door) {
  const p = engine.player;
  p.x = door.x + door.w / 2 - p.w / 2 - 30; p.y = door.y + door.h - p.h; p.vy = 0; p.grounded = true;
  return p;
}
function isolate(engine) {
  engine.supplies = []; engine.drops = []; engine.vents = [];
  engine.powerNode = null; engine.archiveTerminal = null; engine.objective = null;
  if (engine.weaponPickup) engine.weaponPickup.taken = true;
  if (engine.toolPickup) engine.toolPickup.taken = true;
  if (engine.vehicle) engine.vehicle.active = false;
}

test('door named by the prompt wins over a nearby security badge that is farther away', async () => {
  const { engine } = await fixture({ campaign: SHIP, seed: 7 });
  isolate(engine);
  const door = engine.doors.find(entry => entry.id === 'dock-bulkhead'); door.lockedBy = null; door.open = false;
  const p = standAtDoor(engine, door);
  // Badge 70 px behind the marine: inside the old 100 px pickup reach, farther than the door centre (30 px).
  engine.drops = [{ id: 'qa-key', type: 'security-key', taken: false, x: p.x - 70, y: p.y + p.h - 20, w: 20, h: 20 }];
  assert.equal(engine.getInteractionPrompt(), 'E  ACTIONNER LA PORTE');
  assert.equal(engine.interact(p), true);
  assert.equal(door.open, true, 'first E press acts on the door');
  assert.equal(engine.drops[0].taken, false, 'the badge is left on the floor');
});

test('a pickup gets its own prompt and wins only when it is the nearest target', async () => {
  const { engine } = await fixture({ campaign: SHIP, seed: 7 });
  isolate(engine);
  const door = engine.doors.find(entry => entry.id === 'dock-bulkhead'); door.lockedBy = null; door.open = false;
  const p = standAtDoor(engine, door);
  engine.drops = [{ id: 'qa-key', type: 'security-key', taken: false, x: p.x + p.w / 2 - 10, y: p.y + p.h / 2 - 10, w: 20, h: 20 }];
  assert.equal(engine.getInteractionPrompt(), 'E  RÉCUPÉRER LE BADGE DE SÉCURITÉ');
  assert.equal(engine.interact(p), true);
  assert.equal(engine.drops[0].taken, true); assert.equal(door.open, false);
  // Alone, a supply crate is named and collected.
  engine.doors = []; engine.supplies = [{ id: 'qa-med', type: 'medkit', amount: 1, used: false, x: p.x, y: p.y + p.h - 42, w: 56, h: 42 }];
  assert.equal(engine.getInteractionPrompt(), 'E  RÉCUPÉRER UN MÉDIKIT');
  assert.equal(engine.interact(p), true); assert.equal(engine.supplies[0].used, true);
});

test('archive terminal with a supply crate nearby: one press extracts the archive', async () => {
  const { engine, events } = await fixture({ campaign: SHIP, seed: 7 });
  isolate(engine); engine.doors = [];
  const p = engine.player; p.x = 2000; p.y = 776 - p.h;
  engine.archiveTerminal = { id: 'qa-archive', x: p.x, y: p.y, w: p.w, h: p.h, recovered: false };
  engine.mission.objectives.boss = true;
  engine.supplies = [{ id: 'qa-ammo', type: 'ammo', amount: 24, used: false, x: p.x + 60, y: p.y + p.h - 42, w: 56, h: 42 }];
  assert.equal(engine.getInteractionPrompt(), 'E  EXTRAIRE LES ARCHIVES');
  assert.equal(engine.interact(p), true);
  assert.equal(engine.archiveTerminal.recovered, true);
  assert.equal(engine.supplies[0].used, false);
  assert.ok(events.some(event => event.type === 'archive-recovered'));
});

test('prompt and interact read one shared selection (no second priority list)', () => {
  const src = read('src/game-v51-runtime.js');
  const interact = src.slice(src.indexOf('  interact(actor = this.player) {'), src.indexOf('  performInteractionV188('));
  const prompt = src.slice(src.indexOf('  getInteractionPrompt(actor = this.player) {'), src.indexOf('  drawHud(ctx) {'));
  assert.match(interact, /selectInteractionTargetV188\(actor\)/); assert.match(prompt, /selectInteractionTargetV188\(actor\)/);
  assert.doesNotMatch(interact, /security-key/, 'no pickup is tested before the selection');
  for (const file of ['src/narrative-collectables-runtime-v68.js', 'src/narrative-evidence-v132.js', 'src/weapon-actions-v131.js',
    'src/weapon-magazine-recovery-runtime-v168.js', 'src/archive-relay-runtime-v122.js', 'src/forge-mission-runtime-v141.js']) {
    assert.match(read(file), /selectInteractionTargetV188|interactionCandidatesV188/, file);
  }
});

test('the V vehicle hint no longer hides the door E acts on (colony template)', async () => {
  const { engine } = await templateFixture('colony-multiroute');
  assert.equal(engine.vehicle.active, true, 'colony missions keep their M577');
  const door = engine.doors.find(entry => !entry.lockedBy) || engine.doors[0]; door.lockedBy = null; door.levelLocked = false;
  engine.supplies = []; engine.drops = []; engine.vents = [];
  const p = standAtDoor(engine, door);
  engine.vehicle.x = p.x - 40; engine.vehicle.y = p.y + p.h - engine.vehicle.h;
  const prompt = engine.getInteractionPrompt();
  assert.match(prompt, /^E\s/, prompt);
  const before = door.open; assert.equal(engine.interact(p), true); assert.notEqual(door.open, before);
});

test('ship template: no M577 on the command deck, no APC prompt inside the ship', async () => {
  const { engine } = await fixture({ campaign: SHIP, seed: 7 });
  assert.equal(engine.vehicle.active, false);
  assert.equal(engine.vehicle.deploymentStatus, 'not-in-template');
  const p = engine.player; p.x = 3500 - p.w / 2; p.y = 470 - p.h; // ship-aft-low, ship-command zone
  engine.doors = []; engine.supplies = []; engine.drops = [];
  assert.doesNotMatch(engine.getInteractionPrompt(), /PILOTER|M577/);
  const exterior = (await templateFixture('planet-exterior')).engine;
  assert.equal(exterior.vehicle.active, true, 'exterior missions keep their APC');
  // A resume that recorded the vehicle as active cannot re-enable it inside the ship.
  const state = engine.captureResumeState(); if (state.vehicle) state.vehicle.active = true;
  const resumed = (await fixture({ campaign: SHIP, seed: 7, options: { resumeState: state } })).engine;
  assert.equal(resumed.vehicle.active, false);
});

test('Forge doors use the native reach rule max(118, half closed frame + half marine + 12)', async () => {
  const { engine } = await fixture({ campaign: SHIP, seed: 7 });
  const wide = engine.doors.find(entry => entry.id === 'outer-airlock');
  const reach = engine.doorInteractionReachV188(wide, engine.player);
  assert.ok(reach > 118);
  assert.equal(engine.forgeDoorReachV188(wide, engine.player), reach);
  const src = read('src/forge-mission-runtime-v141.js');
  assert.doesNotMatch(src, /candidate\.w \/ 2\) < 118|door\.w \/ 2\) >= 118/, 'no fixed 118 px door reach remains');
});

test('hub hangar: standing at Maksim Orlov and facing him talks to him; the UD-4L stays reachable', () => {
  const maksim = { crewId: 'crew-08-maksim-orlov', name: 'Maksim Orlov', x: 600, w: 44, interaction: { label: 'Planifier l’embarquement dropship' } };
  const ud4l = { id: 'dropship-hangar-ud4l', description: 'Embarquer à bord de l’UD-4L avec Echo-9.', interactionPriority: 100,
    interactionBounds: { x: 451, y: 454, w: 240, h: 170 } };
  const stub = { player: { x: 560, w: 42, facing: 1 }, nearestInteraction: () => ud4l, nearestHubNpc: () => maksim };
  const choose = () => HubV52.prototype.hubInteractionChoiceV188.call(stub);
  assert.equal(choose().kind, 'npc', 'faced at arm’s length: talk');
  stub.player.facing = -1; assert.equal(choose().kind, 'physical', 'turned towards the hull centre: board');
  stub.player.x = 640; assert.equal(choose().kind, 'npc', 'Maksim nearer than the hull centre');
  stub.nearestHubNpc = () => null; assert.equal(choose().kind, 'physical');
  const src = read('src/hub-v52-runtime.js'), depth = read('src/hub-depth-runtime-v188.js');
  assert.equal((src.match(/this\.hubInteractionChoiceV188\(\)/g) || []).length, 2, 'interact and statusPrompt share the choice');
  assert.match(depth, /hubInteractionChoiceV188/);
});

test('new pickup prompts have reviewed English', () => {
  for (const key of ['E  RÉCUPÉRER UN MÉDIKIT', 'E  RÉCUPÉRER UNE PLAQUE DE BLINDAGE', 'E  RÉCUPÉRER DES MUNITIONS',
    'E  RÉCUPÉRER LE FUSIL M41A', 'E  RÉCUPÉRER LE CHALUMEAU', 'E  RÉCUPÉRER UNE FLÈCHE', 'E  RÉCUPÉRER UN HARPON',
    'E  RÉCUPÉRER LE BADGE DE SÉCURITÉ']) assert.ok(EN_CATALOG_V185[key], key);
});
