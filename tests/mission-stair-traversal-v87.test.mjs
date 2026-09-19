import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { buildMissionLevelV52, MISSION_TEMPLATE_IDS_V52 } from '../src/mission-levels-v52.js';
import { CAMPAIGNS, WORLDS, LEVEL_SEEDS, WEAPONS } from '../src/content.js';

const CONTROLS = {
  player: { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space', fire: 'KeyF' },
  coop: { left: 'KeyJ', right: 'KeyL', up: 'KeyI', down: 'KeyK', jump: 'KeyU', fire: 'KeyO' }
};
const PROBLEM_EDGES = ['planet-e02', 'planet-e05', 'planet-e06'];

function walkToX(engine, actor, controls, targetX) {
  const direction = Math.sign(targetX - actor.x - actor.w / 2);
  if (!direction) return;
  engine.keys = new Set([direction > 0 ? controls.right : controls.left]);
  let frame = 0;
  while (direction * (actor.x + actor.w / 2 - targetX) < 0 && frame < 1000) {
    engine.updatePlayer(actor, 1 / 60, controls);
    assert.equal(actor.health, 100, 'an approach must not fall into the void');
    assert.equal(actor.climbing, false, 'walking alone must never select a vertical branch');
    frame += 1;
  }
  assert.ok(frame < 1000, 'walk to the physical connector must complete');
  engine.keys.clear();
}

for (const role of ['player', 'coop']) {
  for (const edgeId of ['planet-e12', 'planet-e17']) {
    for (const reverse of [false, true]) {
      test(role + ': parcours physique complet du puits ' + edgeId + (reverse ? ' retour' : ' aller'), () => withEngine((engine, plan) => {
        const edge = plan.graph.edges.find((entry) => entry.id === edgeId);
        assert.equal(edge.kind, 'ladder');
        const from = plan.graph.nodes.find((node) => node.id === (reverse ? edge.to : edge.from));
        const to = plan.graph.nodes.find((node) => node.id === (reverse ? edge.from : edge.to));
        const ladder = engine.ladders.find((entry) => entry.id === edgeId);
        const actor = engine[role];
        const controls = CONTROLS[role];
        const platformIds = engine.platforms.map((platform) => platform.id);
        Object.assign(actor, {
          x: from.x - actor.w / 2, y: from.y - actor.h, vx: 0, vy: 0,
          alive: true, health: 100, grounded: true, climbing: false, inVehicle: false,
          jumpBuffer: 0, coyoteTime: 0, crewV85: null, hazardKind: null, hazardClock: 0,
          ladderId: null, ladderDetachClock: 0
        });
        walkToX(engine, actor, controls, ladder.x);
        assert.ok(Math.abs(actor.y + actor.h - from.y) <= 10,
          'the approach remains on its authored storey');
        const up = to.y < from.y;
        const destinationFoot = up ? ladder.top : ladder.bottom;
        engine.keys = new Set([up ? controls.up : controls.down]);
        let landed = false;
        for (let frame = 0; frame < 240; frame += 1) {
          const before = actor.y;
          engine.updatePlayer(actor, 1 / 60, controls);
          assert.ok(Math.abs(actor.y - before) <= 185 / 60 + 0.001,
            'the connector is climbed frame by frame, never a room teleport');
          if (!actor.climbing && Math.abs(actor.y + actor.h - destinationFoot) < 0.001) {
            landed = true;
            break;
          }
        }
        assert.equal(landed, true);
        assert.equal(actor.grounded, true);
        engine.keys.clear();
        walkToX(engine, actor, controls, to.x);
        for (let settle = 0; settle < 30; settle += 1) engine.updatePlayer(actor, 1 / 60, controls);
        assert.ok(Math.abs(actor.y + actor.h - to.y) <= 10,
          'both the approach and the exit connect to the intended destination node');
        assert.equal(actor.grounded, true);
        assert.equal(actor.health, 100);
        assert.deepEqual(engine.platforms.map((platform) => platform.id), platformIds);
      }));
    }
  }
}

test('la balise offre deux puits distincts et conserve les trois routes nommees', () => {
  const plan = build('planet-exterior');
  const ridge = plan.geometry.ladders.find((entry) => entry.id === 'planet-e12');
  const cave = plan.geometry.ladders.find((entry) => entry.id === 'planet-e17');
  assert.ok(Math.abs(ridge.x - cave.x) > 92, 'ladder grab ranges must not overlap at the junction');
  assert.deepEqual(plan.graph.routes.map((entry) => entry.id), [
    'planet-surface-route', 'planet-ridge-route', 'planet-cave-route'
  ]);
  assert.equal(plan.graph.edges.find((entry) => entry.id === 'planet-e06').kind, 'slope');
});

function build(templateId, variant = 87) {
  return buildMissionLevelV52({
    campaign: CAMPAIGNS[0], world: WORLDS[0], levelSeeds: LEVEL_SEEDS, templateId, variant
  });
}

function stairSurfaces(plan, edge) {
  const from = plan.graph.nodes.find((node) => node.id === edge.from);
  const to = plan.graph.nodes.find((node) => node.id === edge.to);
  return [
    plan.geometry.platforms.find((platform) => platform.nodeId === from.id),
    ...plan.geometry.platforms.filter((platform) => platform.edgeId === edge.id)
      .sort((left, right) => left.x - right.x),
    plan.geometry.platforms.find((platform) => platform.nodeId === to.id)
  ];
}

function assertPhysicalStairs(plan) {
  for (const edge of plan.graph.edges.filter((entry) => ['walk', 'slope', 'airlock', 'gate'].includes(entry.kind))) {
    const surfaces = stairSurfaces(plan, edge);
    for (let index = 1; index < surfaces.length; index += 1) {
      const previous = surfaces[index - 1];
      const next = surfaces[index];
      assert.ok(previous && next, edge.id + ': both authored endpoint surfaces are required');
      assert.ok(Math.abs(next.y - previous.y) <= 10,
        edge.id + ': each physical riser must be walkable in both directions');
      assert.ok(next.x <= previous.x + previous.w,
        edge.id + ': a lone bridge elsewhere is not proof of a connected walk route');
    }
  }
}

test('les trois gabarits bornent chaque marche a 10 px et raccordent toutes les surfaces', () => {
  for (const templateId of MISSION_TEMPLATE_IDS_V52) {
    for (let variant = 0; variant < 24; variant += 1) assertPhysicalStairs(build(templateId, variant));
  }
});

test('le controle physique rejette une marche trop haute ou un pont manquant meme si un autre pont subsiste', () => {
  const plan = structuredClone(build('planet-exterior'));
  const step = plan.geometry.platforms.find((platform) => platform.edgeId === 'planet-e02');
  step.y += 30;
  assert.throws(() => assertPhysicalStairs(plan), /physical riser/);
  const broken = structuredClone(build('planet-exterior'));
  const bridges = broken.geometry.platforms.filter((platform) => platform.edgeId === 'planet-e02');
  broken.geometry.platforms = broken.geometry.platforms.filter((platform) => platform.edgeId !== 'planet-e02' || platform.id === bridges[0].id);
  assert.throws(() => assertPhysicalStairs(broken), /physical riser|connected walk route/);
});

function withEngine(run) {
  const previous = {
    Image: globalThis.Image, addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame
  };
  globalThis.Image = class {
    constructor() { this.complete = true; this.naturalWidth = 1600; this.naturalHeight = 900; }
    set src(value) { this.currentSrc = value; }
  };
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try {
    const plan = build('planet-exterior');
    const engine = new GameEngine({
      width: 1280, height: 720, getContext: () => ({}), addEventListener() {}
    }, { onEvent() {} });
    engine.start({
      seed: plan.levelSeed.seed, campaign: plan.campaign, world: plan.world,
      levelSeed: plan.levelSeed, missionLevel: plan, weapon: WEAPONS[0],
      enemyCatalog: [], equipment: [], crew: [], vehicle: null, difficulty: 'standard'
    });
    engine.coopEnabled = true;
    // Only combat and interactable obstacles are neutralized. Every authored
    // platform and its real production collision resolver stay in this test.
    engine.enemies = [];
    engine.squadActors = [];
    engine.hazards = [];
    engine.covers = [];
    engine.walls = [];
    for (const door of engine.doors) { door.open = true; door.progress = 1; }
    run(engine, plan);
  } finally { Object.assign(globalThis, previous); }
}

for (const role of ['player', 'coop']) {
  for (const edgeId of PROBLEM_EDGES) {
    for (const reverse of [false, true]) {
      test(role + ': marche reelle sans saut sur ' + edgeId + (reverse ? ' retour' : ' aller'), () => withEngine((engine, plan) => {
        const edge = plan.graph.edges.find((entry) => entry.id === edgeId);
        const from = plan.graph.nodes.find((node) => node.id === (reverse ? edge.to : edge.from));
        const to = plan.graph.nodes.find((node) => node.id === (reverse ? edge.from : edge.to));
        const actor = engine[role];
        const direction = Math.sign(to.x - from.x);
        const controls = CONTROLS[role];
        const platformIds = engine.platforms.map((platform) => platform.id);
        Object.assign(actor, {
          x: from.x - actor.w / 2, y: from.y - actor.h, vx: 0, vy: 0,
          alive: true, health: 100, grounded: true, climbing: false, inVehicle: false,
          jumpBuffer: 0, coyoteTime: 0, crewV85: null, hazardKind: null, hazardClock: 0,
          ladderId: null, ladderDetachClock: 0
        });
        engine.keys = new Set([direction > 0 ? controls.right : controls.left]);
        let frame = 0;
        while (direction * (actor.x + actor.w / 2 - to.x) < 0 && frame < 900) {
          engine.updatePlayer(actor, 1 / 60, controls);
          assert.equal(actor.health, 100, 'walking must not fall into the void and return to a checkpoint');
          assert.equal(actor.climbing, false);
          frame += 1;
        }
        assert.ok(frame < 900, 'the real actor must reach the target node without jump or teleport');
        engine.keys.clear();
        for (let settle = 0; settle < 30; settle += 1) engine.updatePlayer(actor, 1 / 60, controls);
        assert.ok(Math.abs(actor.y + actor.h - to.y) <= 10,
          'destination foot height ' + (actor.y + actor.h) + ' must remain within one authored riser of ' + to.y);
        assert.equal(actor.grounded, true);
        assert.deepEqual(engine.platforms.map((platform) => platform.id), platformIds,
          'the route must be playable with every original platform collider present');
      }));
    }
  }
}
