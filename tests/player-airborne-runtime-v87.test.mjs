import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { getAnimationEntityKeyV57 } from '../src/game-v52-runtime.js';
import { HubGame } from '../src/hub-onboarding-v84.js';
import { HubGame as BaseHub } from '../src/hub-game.js';
import { BioforgeRuntimeV80 } from '../src/bioforge-runtime-v80.js';
import { SpriteAnimationController, resolveSpriteSheet } from '../src/sprite-animation-runtime.js';
import { CAMPAIGNS, CREW, ENEMIES, LEVEL_SEEDS, VEHICLES, WEAPONS, WORLDS } from '../src/content.js';

function withEnvironment(run) {
  const names = ['Image', 'addEventListener', 'requestAnimationFrame', 'document', 'navigator', 'matchMedia'];
  const previous = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const globals = {
    Image: class { constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; } set src(value) { this.currentSrc = value; } },
    addEventListener() {}, requestAnimationFrame: () => 0, matchMedia: () => ({ matches: false }),
    document: { hidden: false, activeElement: null, addEventListener() {} }, navigator: { getGamepads: () => [] }
  };
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  const images = [], samples = [];
  const ctx = new Proxy({ drawImage: (...args) => images.push(args), measureText: value => ({ width: String(value).length * 8 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) },
  { get: (target, key) => key in target ? target[key] : () => {} });
  const canvas = { width: 1280, height: 720, getContext: () => ctx, addEventListener() {}, focus() {} };
  try { return run({ canvas, ctx, images, samples }); }
  finally { for (const [key, descriptor] of previous) descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key]; }
}

function observe(controller, output) {
  const original = controller.sample.bind(controller);
  controller.sample = (...args) => { const result = original(...args); output.push(result); return result; };
}

function withMission(run) {
  return withEnvironment(environment => {
    const events = [], engine = new GameEngine(environment.canvas, { onEvent: event => events.push(event) });
    const world = WORLDS.find(entry => entry.biomes.includes('industrial')) || WORLDS[0];
    engine.start({ seed: 770077, world, crew: CREW, vehicle: VEHICLES.find(entry => entry.family === 'ground'),
      campaign: { ...CAMPAIGNS[0], id: 'air-v87', worldId: world.id, objective: 'restore atmospheric processing' },
      levelSeed: { ...LEVEL_SEEDS[0], id: 'air-level-v87', seed: 770077, worldId: world.id, objective: 'restore atmospheric processing' },
      enemyCatalog: ENEMIES.slice(0, 52), weapon: { ...WEAPONS[0], magazine: 30, reload: 1.45 }, difficulty: 'standard' });
    engine.enemies = []; engine.hazards = []; engine.setCoop(true);
    for (let step = 0; step < 10; step++) engine.update(.01);
    events.length = 0;
    try { return run({ ...environment, engine, events }); } finally { engine.stop(); }
  });
}

for (const role of ['player', 'coop']) {
  test(`${role}: real mission jump never draws reception in flight and emits physical edges once`, () => withMission(({ engine, events, ctx, samples }) => {
    const actor = engine[role], other = engine[role === 'player' ? 'coop' : 'player'];
    const initial = { x: actor.x, y: actor.y, w: actor.w, h: actor.h };
    const entityId = getAnimationEntityKeyV57(role === 'player' ? 'player' : 'coop', actor, role === 'player' ? 'primary' : 'secondary');
    observe(engine.spriteAnimation, samples);
    engine.keys.add(role === 'player' ? 'Space' : 'KeyU');
    engine.update(.01); engine.keys.clear();
    let landed = false;
    for (let step = 1; step <= 90; step++) {
      if (step > 1) engine.update(.01);
      const animation = actor.v52Animation;
      engine.drawActor(ctx, actor);
      const drawn = samples.at(-1);
      assert.equal(drawn.clip.id, animation.clipId, 'real draw and update agree at the same simulation time');
      assert.equal(drawn.frame, animation.frame);
      assert.equal(actor.w, initial.w); assert.equal(actor.h, initial.h); assert.equal(actor.x, initial.x);
      assert.equal(other.grounded, true, 'the other local player does not inherit airborne state');
      if (!actor.grounded) {
        assert.ok([9, 10].includes(drawn.frame)); assert.notEqual(drawn.clip.id, 'land');
        if (step === 26) { assert.equal(actor.vy, -171); assert.equal(drawn.clip.id, 'rise'); assert.equal(drawn.frame, 9); }
      } else {
        assert.equal(drawn.clip.id, 'land'); assert.equal(drawn.frame, 11);
        assert.equal(actor.y, initial.y); landed = true; break;
      }
    }
    assert.equal(landed, true);
    const physicalEvents = events.filter(event => event.source === 'physical-state-v87' && event.entityId === entityId);
    assert.deepEqual(physicalEvents.map(event => event.event), ['jump:impulse', 'jump:apex', 'ground:contact']);
    engine.update(.11); engine.drawActor(ctx, actor);
    assert.equal(samples.at(-1).clip.id, 'idle');
  }));
}

test('real mission injury during descent resumes fall without a new impulse/apex', () => withMission(({ engine, events }) => {
  const actor = engine.player;
  engine.keys.add('Space'); engine.update(.01); engine.keys.clear();
  for (let step = 0; step < 42; step++) engine.update(.01);
  assert.ok(actor.vy > 0); assert.equal(actor.v52Animation.clipId, 'fall');
  engine.damagePlayer(actor, 1, { bypassCover: true });
  engine.update(.01); assert.equal(actor.v52Animation.clipId, 'hurt');
  actor.v52HurtClock = 0; // Explicit diagnostic: terminate only the injury, not physics.
  engine.update(.01); assert.equal(actor.v52Animation.clipId, 'fall'); assert.equal(actor.v52Animation.frame, 10);
  assert.equal(events.filter(event => event.event === 'jump:impulse').length, 1);
  assert.equal(events.filter(event => event.event === 'jump:apex').length, 1);
}));

test('real hub controls and actual draw keep landing separate from airborne poses', () => withEnvironment(({ canvas, ctx, samples }) => {
  const hub = new HubGame(canvas);
  try {
    hub.start({ deck: 3, roomId: 'dropship-hangar', positionX: 99 });
    observe(hub.playerAnimationV81, samples);
    for (let index = 0; index < 10; index++) { hub.update(.01); hub.drawPlayer(ctx); }
    const initial = { x: hub.player.x, y: hub.player.y, w: hub.player.w, h: hub.player.h };
    hub.setControl('jump', true); hub.update(.01); hub.setControl('jump', false); hub.drawPlayer(ctx);
    let landed = false;
    for (let index = 0; index < 100; index++) {
      hub.update(.01); hub.drawPlayer(ctx);
      const drawn = samples.at(-1);
      assert.equal(hub.player.w, initial.w); assert.equal(hub.player.h, initial.h);
      if (!hub.player.grounded) { assert.ok([9, 10].includes(drawn.frame)); assert.notEqual(drawn.clip.id, 'land'); }
      else { assert.equal(drawn.clip.id, 'land'); assert.equal(drawn.frame, 11); landed = true; break; }
    }
    assert.equal(landed, true);
    assert.deepEqual(samples.flatMap(sample => sample.motionV87?.events || []), ['jump:impulse', 'jump:apex', 'ground:contact']);
    hub.update(.11); hub.drawPlayer(ctx); assert.equal(samples.at(-1).clip.id, 'idle');
  } finally { hub.stop(); }
}));

test('actual hub draw reseeds a different annex even when the actor coordinates are identical', () => withEnvironment(({ ctx }) => {
  let annexId = 'animal-care';
  const image = { complete: true, naturalWidth: 1024, naturalHeight: 1024 };
  const player = { alive: true, grounded: false, climbing: false, vx: 0, vy: 200, x: 100, y: 100, w: 44, h: 92, facing: 1 };
  const context = { player, state: { deck: 1 }, animationTime: 1, currentAnnexV71: () => ({ id: annexId }),
    playerAnimationV81: new SpriteAnimationController(), playerSheets: new Map([['playerSheet', image]]), playerSheet: image };
  BaseHub.prototype.drawPlayer.call(context, ctx);
  annexId = 'refuge'; context.animationTime = 1.1; player.grounded = true; player.vy = 0;
  BaseHub.prototype.drawPlayer.call(context, ctx);
  assert.equal(context.playerAnimationV81.snapshot()[0].motionV87.phase, 'grounded');
  assert.match(context.playerAnimationV81.snapshot()[0].signature, /:idle$/);
}));

test('actual BIOFORGE player draw receives physical state and reserves frame11 for contact', () => withEnvironment(({ ctx, samples }) => {
  const sheet = resolveSpriteSheet('player.echo9-marine.locomotion');
  const image = { complete: true, naturalWidth: 1024, naturalHeight: 1024 };
  const actor = { alive: true, grounded: false, climbing: false, vx: 0, vy: 200, x: 100, y: 100, w: 44, h: 92, facing: 1 };
  const context = { player: actor, animationTime: 1, images: new Map([[sheet.imageKey, image]]), bioforgePlayerAnimationV81: new SpriteAnimationController() };
  observe(context.bioforgePlayerAnimationV81, samples);
  BioforgeRuntimeV80.prototype.drawBioforgePlayerV80.call(context, ctx);
  assert.equal(samples.at(-1).frame, 10); assert.equal(samples.at(-1).clip.id, 'fall');
  context.animationTime = 1.1; actor.grounded = true; actor.vy = 0;
  BioforgeRuntimeV80.prototype.drawBioforgePlayerV80.call(context, ctx);
  assert.equal(samples.at(-1).frame, 11); assert.equal(samples.at(-1).clip.id, 'land');
  assert.equal(actor.playerVisualV81.fallback, false);
}));

test('real successful checkpoint restart resets J1/J2 even at the same coordinates and frozen time; rejection does not', () => withMission(({ engine, ctx }) => {
  engine.checkpoint.x = engine.player.x; engine.checkpoint.y = engine.player.y;
  engine.coop.x = engine.checkpoint.x - 52;
  for (const actor of [engine.player, engine.coop]) { actor.grounded = false; actor.vy = 200; }
  engine.animationTime = 1; engine.updateSpriteAnimationEvents();
  for (const actor of [engine.player, engine.coop]) { actor.grounded = true; actor.vy = 0; }
  engine.animationTime = 1.1; engine.updateSpriteAnimationEvents();
  const ids = [getAnimationEntityKeyV57('player', engine.player, 'primary'), getAnimationEntityKeyV57('coop', engine.coop, 'secondary')];
  for (const id of ids) assert.equal(engine.spriteAnimation.playerAirStatesV87.get(id).phase, 'land');
  const previous = ids.map(id => engine.spriteAnimation.playerAirStatesV87.get(id));
  assert.equal(engine.restartFromCheckpoint(), false);
  ids.forEach((id, index) => assert.equal(engine.spriteAnimation.playerAirStatesV87.get(id), previous[index]));
  const coordinates = [engine.player, engine.coop].map(actor => [actor.x, actor.y]);
  engine.mission.state = 'failed';
  assert.equal(engine.restartFromCheckpoint(), true);
  for (const id of ids) assert.equal(engine.spriteAnimation.playerAirStatesV87.has(id), false);
  assert.deepEqual([engine.player, engine.coop].map(actor => [actor.x, actor.y]), coordinates);
  engine.animationTime = 1.11;
  for (const actor of [engine.player, engine.coop]) engine.drawActor(ctx, actor);
  for (const id of ids) assert.equal(engine.spriteAnimation.playerAirStatesV87.get(id).phase, 'grounded');
}));

test('real lethal electrical hazard resets hub presentation without inventing a death or landing', () => withEnvironment(({ ctx, samples }) => {
  const image = { complete: true, naturalWidth: 1024, naturalHeight: 1024 };
  const player = { alive: true, grounded: false, climbing: false, vx: 0, vy: 200, x: 1100, y: 532, w: 44, h: 92,
    facing: 1, health: 1, maxHealth: 100, shockHits: 0, shockClock: 0 };
  const context = { player, state: { deck: 3 }, animationTime: 1, hangarHazardCooldown: 0, roomChangePulse: 0,
    obstacles: [], playerAnimationV81: new SpriteAnimationController(), playerSheets: new Map(), playerSheet: image };
  observe(context.playerAnimationV81, samples);
  BaseHub.prototype.drawPlayer.call(context, ctx);
  assert.equal(context.playerAnimationV81.playerAirStatesV87.size, 1);
  assert.equal(BaseHub.prototype.applyHangarHazard.call(context), true);
  assert.equal(player.alive, true); assert.equal(player.health, 100);
  assert.equal(player.x, 96); assert.equal(player.y, 532);
  assert.equal(context.playerAnimationV81.playerAirStatesV87.size, 0);
  context.animationTime = 1.01; BaseHub.prototype.drawPlayer.call(context, ctx);
  assert.equal(samples.at(-1).clip.id, 'hurt'); assert.deepEqual(samples.at(-1).motionV87.events, []);
  BaseHub.prototype.resolveVertical.call(context, player.y + player.h);
  player.shockClock = 0; context.animationTime = 1.02; BaseHub.prototype.drawPlayer.call(context, ctx);
  assert.equal(samples.at(-1).clip.id, 'idle'); assert.deepEqual(samples.at(-1).motionV87.events, []);
}));

test('real BIOFORGE seal resets a short same-session transfer, while a rejected seal preserves presentation', () => withEnvironment(({ ctx, samples }) => {
  const sheet = resolveSpriteSheet('player.echo9-marine.locomotion');
  const image = { complete: true, naturalWidth: 1024, naturalHeight: 1024 };
  const player = { alive: true, grounded: false, climbing: false, vx: 0, vy: 200, x: 100, y: 280, w: 44, h: 92, facing: 1 };
  const context = { player, animationTime: 1, images: new Map([[sheet.imageKey, image]]), bioforgePlayerAnimationV81: new SpriteAnimationController(),
    bioforgeRootV80: { activeSession: { id: 'test-session', phase: 'configuration' } }, bioforgeTransferStageV80: 2,
    bioforgeLevelV80: { arenaPlayerSpawn: { x: 100, y: 300 } }, advanceBioforgePhaseV80: () => ({ applied: true }), emitBioforgeV80() {} };
  observe(context.bioforgePlayerAnimationV81, samples);
  BioforgeRuntimeV80.prototype.drawBioforgePlayerV80.call(context, ctx);
  const previous = context.bioforgePlayerAnimationV81.playerAirStatesV87.get('bioforge:player:echo9');
  assert.equal(BioforgeRuntimeV80.prototype.sealBioforgeArenaV80.call(context), false);
  assert.equal(context.bioforgePlayerAnimationV81.playerAirStatesV87.get('bioforge:player:echo9'), previous);
  context.bioforgeTransferStageV80 = 3;
  assert.equal(BioforgeRuntimeV80.prototype.sealBioforgeArenaV80.call(context), true);
  assert.equal(player.y, 300); assert.equal(player.grounded, true);
  assert.equal(context.bioforgePlayerAnimationV81.playerAirStatesV87.size, 0);
  context.animationTime = 1.01; BioforgeRuntimeV80.prototype.drawBioforgePlayerV80.call(context, ctx);
  assert.equal(samples.at(-1).clip.id, 'idle'); assert.deepEqual(samples.at(-1).motionV87.events, []);
}));
