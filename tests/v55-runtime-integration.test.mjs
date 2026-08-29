import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { HubGame } from '../src/hub-v52-runtime.js';
import { DROPSHIP_HANGAR_ART_V55, ELECTRICAL_HAZARD_ART_V55 } from '../src/hub-art-runtime-v55.js';
import { CREW } from '../src/content-core-v50.js';
import { CAMPAIGNS, ENEMIES, LEVEL_SEEDS, VEHICLES, WEAPONS, WORLDS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import {
  SPRITE_SHEETS,
  SpriteAnimationController,
  resolveEnemyAnimation,
  resolveNpcAnimation,
  resolveVehicleAnimation
} from '../src/sprite-animation-runtime.js';

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1024;
    this.naturalHeight = 1024;
  }
  set src(value) { this.currentSrc = value; }
}

function mockContext(draws) {
  const gradient = { addColorStop() {} };
  const base = {
    measureText: (value) => ({ width: String(value).length * 8 }),
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    drawImage: (image) => draws.push(image?.currentSrc || 'unknown')
  };
  return new Proxy(base, {
    get: (target, key) => key in target ? target[key] : () => {},
    set: (target, key, value) => { target[key] = value; return true; }
  });
}

function withBrowserRuntime(run) {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame,
    performance: globalThis.performance
  };
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  globalThis.performance = { now: () => 1000 };
  try { return run(); }
  finally {
    Object.assign(globalThis, previous);
  }
}

test('les vingt plaques v55 sont réellement résolubles et échantillonnables', () => {
  const controller = new SpriteAnimationController();
  const enemies = [
    ['ovomorph', 'enemy.ovomorph.cycle'], ['chestburster', 'enemy.chestburster.action'],
    ['xenoPraetorian', 'enemy.xenomorph-praetorian.action'], ['xenoSpitter', 'enemy.xenomorph-spitter.action'],
    ['xenoCrusher', 'enemy.xenomorph-crusher.action'], ['xenoLurker', 'enemy.xenomorph-lurker.action'],
    ['xenoCarrier', 'enemy.xenomorph-carrier.action'], ['xenoRavager', 'enemy.xenomorph-ravager.action']
  ];
  for (const [spriteKey, sheetId] of enemies) {
    const request = resolveEnemyAnimation({ spriteKey, alive: true, attacking: true, facing: 1 });
    assert.equal(request.sheetId, sheetId);
    assert.ok(controller.sample(spriteKey, request, 0.2), spriteKey);
  }

  for (const member of CREW.slice(0, 8)) {
    const request = resolveNpcAnimation({ crewId: member.id, alive: true, fireClock: 0.5, grounded: true });
    assert.equal(request.sheetId, `npc.${member.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}.mission`.replace('bishop-9', 'bishop-9'));
    assert.ok(controller.sample(member.id, request, 0.2), member.id);
  }

  const vehicles = [
    ['vehicle-002-m577-command-apc', 'vehicle.m577-command-apc.action'],
    ['vehicle-004-m22a3-jackson-tank', 'vehicle.m22a3-jackson-tank.action'],
    ['vehicle-007-p-5000-powered-work-loader', 'vehicle.p5000-powered-work-loader.action'],
    ['vehicle-009-ud-4l-cheyenne-dropship', 'vehicle.ud4l-cheyenne-dropship.action']
  ];
  for (const [id, sheetId] of vehicles) {
    const request = resolveVehicleAnimation({ id, alive: true, maxHull: 300, hull: 300, vx: 30 });
    assert.equal(request.sheetId, sheetId);
    assert.ok(controller.sample(id, request, 0.2), id);
  }
  assert.equal(Object.keys(SPRITE_SHEETS).length, 191);
});

test('la sélection catalogue des quatre véhicules atteint leur bitmap dans le vrai GameEngine', () => withBrowserRuntime(() => {
  const world = WORLDS[0];
  const campaign = CAMPAIGNS.find((entry) => entry.worldId === world.id) || CAMPAIGNS[0];
  const missionLevel = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS, templateId: 'ship-interior-vertical' });
  const expected = new Map([
    ['vehicle-002-m577-command-apc', ['vehicle.m577-command-apc.action', '/assets/openai/sprites/normalized/vehicles/m577-command-apc-action-sheet.png']],
    ['vehicle-004-m22a3-jackson-tank', ['vehicle.m22a3-jackson-tank.action', '/assets/openai/sprites/normalized/vehicles/m22a3-jackson-tank-action-sheet.png']],
    ['vehicle-007-p-5000-powered-work-loader', ['vehicle.p5000-powered-work-loader.action', '/assets/openai/sprites/normalized/vehicles/p-5000-powered-work-loader-action-sheet.png']],
    ['vehicle-009-ud-4l-cheyenne-dropship', ['vehicle.ud4l-cheyenne-dropship.action', '/assets/openai/sprites/normalized/vehicles/ud-4l-cheyenne-dropship-action-sheet.png']]
  ]);

  for (const [vehicleId, [sheetId, bitmap]] of expected) {
    const draws = [];
    const context = mockContext(draws);
    const canvas = { width: 1280, height: 720, getContext: () => context, addEventListener() {} };
    const vehicle = VEHICLES.find((entry) => entry.id === vehicleId);
    assert.ok(vehicle, `${vehicleId}: catalogue`);
    const engine = new GameEngine(canvas, { onEvent() {} });
    engine.start({
      seed: missionLevel.levelSeed.seed,
      campaign,
      world,
      levelSeed: missionLevel.levelSeed,
      missionLevel,
      vehicle,
      weapon: WEAPONS[0],
      enemyCatalog: ENEMIES.slice(0, 16),
      crew: CREW.slice(0, 4)
    });
    assert.equal(engine.vehicle.id, vehicleId);
    assert.equal(resolveVehicleAnimation(engine.vehicle).sheetId, sheetId);
    engine.drawVehicle(context);
    assert.ok(draws.includes(bitmap), `${vehicleId}: bitmap runtime ${bitmap}`);
  }
}));

test('le vrai runtime hub dessine back puis acteurs puis foreground et applique le choc', () => withBrowserRuntime(() => {
  const draws = [];
  const context = mockContext(draws);
  const canvas = { width: 1280, height: 720, getContext: () => context, addEventListener() {} };
  const hub = new HubGame(canvas);
  hub.start({ deck: 3, roomId: 'dropship-hangar', positionX: 80 });
  let snapshot = hub.getSnapshot();
  assert.equal(snapshot.roomComposition, 'modular-v55');
  assert.equal(snapshot.roomBackground, null);
  assert.equal(snapshot.hubArtAssetsReady, 5);
  assert.ok(hub.obstacles.some((entry) => entry.role === 'dropship-hull'));
  assert.equal(hub.getAssetReport().npcMissionSpriteAssetsReady, 16);

  const hazard = ELECTRICAL_HAZARD_ART_V55.collisionBounds;
  Object.assign(hub.player, { x: hazard.x + 8, y: 624 - hub.player.h, vx: 0, vy: 0, grounded: true });
  hub.update(0.016);
  snapshot = hub.getSnapshot();
  assert.equal(snapshot.hubIntegrity, 78);
  assert.equal(snapshot.shockHits, 1);
  assert.ok(hub.player.shockClock > 1);

  const interactionRooms = [];
  const drawInteractionProp = hub.drawInteractionProp.bind(hub);
  hub.drawInteractionProp = (ctx, room) => { interactionRooms.push(room.id); return drawInteractionProp(ctx, room); };
  draws.length = 0;
  Object.assign(hub.npcs[0], { vx: 0, workClock: 1, alertClock: 0, alerted: false });
  hub.draw();

  const far = draws.indexOf('/assets/openai/hub/layers/engineering-hangar-far.png');
  const parallax = draws.findIndex((source, index) => index > far && source === '/assets/openai/hub/parallax/engineering-far.png');
  const overhead = draws.indexOf('/assets/openai/hub/layers/engineering-hangar-overhead.png');
  const booth = draws.indexOf('/assets/openai/hub/props/hangar-control-booth-v61.png');
  const mid = draws.indexOf('/assets/openai/hub/layers/engineering-hangar-mid.png');
  const dropship = draws.indexOf('/assets/openai/sprites/normalized/vehicles/ud-4l-cheyenne-dropship-action-sheet.png');
  const electrical = draws.indexOf('/assets/openai/metroidvania/props/electrical-arc-hazard.png');
  const missionNpc = draws.indexOf('/assets/openai/sprites/normalized/npcs/maksim-orlov-mission-sheet.png');
  const player = draws.indexOf('/assets/openai/sprites/normalized/player/echo9-marine-locomotion-sheet.png');
  const foreground = draws.lastIndexOf('/assets/openai/hub/layers/engineering-hangar-foreground.png');
  const monolith = draws.indexOf('/assets/openai/hub/rooms/engineering-hangar.png');
  assert.ok(far >= 0 && parallax > far && overhead > parallax, 'FAR puis parallaxe puis plafond');
  assert.ok(booth > overhead && mid > booth && dropship > mid && electrical > dropship, 'plafond puis booth puis MID puis UD-4L puis danger');
  assert.ok(missionNpc > electrical);
  assert.ok(player > missionNpc);
  assert.ok(foreground > player);
  assert.equal(monolith, -1);
  assert.equal(interactionRooms.includes('dropship-hangar'), false);

  let hangarParallaxPasses = 0;
  hub.drawViewportParallax = () => { hangarParallaxPasses += 1; };
  hub.drawRoomModule(context, hub.currentRoom(), hub.farLayers.get('/assets/openai/hub/parallax/engineering-far.png'));
  assert.equal(hangarParallaxPasses, 1, 'le viewport hangar ne repasse jamais au-dessus du véhicule');
}));

test('l interaction physique UD-4L prime sur un NPC et sur un lift concurrent', () => withBrowserRuntime(() => {
  const actions = [];
  const context = mockContext([]);
  const canvas = { width: 1280, height: 720, getContext: () => context, addEventListener() {} };
  const hub = new HubGame(canvas, { onAction: (event) => actions.push(event) });
  hub.start({ deck: 3, roomId: 'dropship-hangar', positionX: 520 });
  const bounds = DROPSHIP_HANGAR_ART_V55.dropship.interactionBounds;
  Object.assign(hub.player, {
    x: bounds.x + bounds.w / 2 - hub.player.w / 2,
    y: 624 - hub.player.h,
    vx: 0,
    vy: 0,
    grounded: true
  });
  const npc = hub.npcs.find((entry) => entry.roomId === 'dropship-hangar');
  Object.assign(npc, { x: hub.player.x, y: hub.player.y });
  let liftUses = 0;
  hub.nearestLift = () => ({ id: 'synthetic-overlap', x: hub.player.x + hub.player.w / 2 });
  hub.useLift = () => { liftUses += 1; };

  assert.equal(hub.nearestInteraction()?.id, DROPSHIP_HANGAR_ART_V55.dropship.id);
  assert.match(hub.statusPrompt(), /Embarquer à bord de l’UD-4L/);
  hub.interact();
  assert.equal(liftUses, 0, 'la priorité 100 interdit au lift de voler l interaction');
  assert.equal(actions.at(-1).id, DROPSHIP_HANGAR_ART_V55.dropship.id);
  assert.equal(actions.at(-1).vehicleId, 'vehicle-009-ud-4l-cheyenne-dropship');
  assert.equal(actions.at(-1).action, 'navigate:operations');
  assert.equal(actions.some((event) => event.type === 'hub:npc-interaction'), false);

  Object.assign(hub.player, { x: 760, y: 624 - hub.player.h });
  assert.equal(hub.nearestInteraction(), null, 'aucune ancienne zone bouton invisible hors de l appareil');
}));

test('le template vaisseau compile le danger électrique avec son contrat gameplay', () => {
  const world = WORLDS[0];
  const campaign = CAMPAIGNS.find((entry) => entry.worldId === world.id) || CAMPAIGNS[0];
  const plan = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS, templateId: 'ship-interior-vertical' });
  const electrical = plan.hazards.find((entry) => entry.kind === 'electrical');
  assert.ok(electrical);
  assert.equal(electrical.effect, 'shock');
  assert.equal(electrical.stun, 1.25);
  assert.ok(electrical.damage > 0);
});
