import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { buildMissionLevelV52, MISSION_TEMPLATE_IDS_V52 } from '../src/mission-levels-v52.js';
import { CAMPAIGNS, WORLDS, LEVEL_SEEDS, WEAPONS } from '../src/content.js';

const CONTROLS = Object.freeze({
  player: { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space', fire: 'KeyF' },
  coop: { left: 'KeyJ', right: 'KeyL', up: 'KeyI', down: 'KeyK', jump: 'KeyU', fire: 'KeyO' }
});
const DT = 1 / 60;

function withEngine(templateId, run) {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame
  };
  globalThis.Image = class {
    constructor() { this.complete = true; this.naturalWidth = 1600; this.naturalHeight = 900; }
    set src(value) { this.currentSrc = value; }
  };
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try {
    const plan = buildMissionLevelV52({
      campaign: CAMPAIGNS[0], world: WORLDS[0], levelSeeds: LEVEL_SEEDS, templateId, variant: 87
    });
    const engine = new GameEngine({
      width: 1280, height: 720, getContext: () => ({}), addEventListener() {}
    }, { onEvent() {} });
    engine.start({
      seed: plan.levelSeed.seed, campaign: plan.campaign, world: plan.world,
      levelSeed: plan.levelSeed, missionLevel: plan, weapon: WEAPONS[0],
      enemyCatalog: [], equipment: [], crew: [], vehicle: null, difficulty: 'standard'
    });
    engine.coopEnabled = true;
    engine.doors.forEach((door) => { door.open = true; door.progress = 1; });
    engine.hazards = [];
    engine.covers = [];
    engine.walls = [];
    engine.enemies = [];
    engine.squadActors = [];
    run(engine, plan);
  } finally { Object.assign(globalThis, previous); }
}

function place(actor, ladder, footY, climbing = false) {
  Object.assign(actor, {
    x: ladder.x - actor.w / 2, y: footY - actor.h, vx: 0, vy: 0,
    alive: true, health: 100, grounded: !climbing, climbing, inVehicle: false,
    ladderId: climbing ? ladder.id : null, ladderDetachClock: 0,
    jumpBuffer: 0, coyoteTime: 0, crewV85: null, hazardKind: null, hazardClock: 0
  });
}

function climb(engine, actor, controls, key, targetFoot) {
  engine.keys = new Set([key]);
  let reached = false;
  for (let frame = 0; frame < 240; frame += 1) {
    const before = actor.y;
    engine.updatePlayer(actor, DT, controls);
    assert.ok(Math.abs(actor.y - before) <= 185 * DT + 0.001,
      'a ladder traversal must integrate movement, never teleport between storeys');
    if (Math.abs(actor.y + actor.h - targetFoot) < 0.001 && !actor.climbing) {
      reached = true;
      break;
    }
  }
  assert.equal(reached, true, 'the requested landing must be reached and release climbing');
}

for (const templateId of MISSION_TEMPLATE_IDS_V52) {
  for (const role of ['player', 'coop']) {
    test(`${templateId}: ${role} monte, descend et quitte chaque palier sans saut`, () => withEngine(templateId, (engine, plan) => {
      const authoredLadders = [...engine.ladders];
      const actor = engine[role];
      const controls = CONTROLS[role];
      for (const ladder of authoredLadders) {
        // Isolate this connector for its two landing contracts; chains are exercised below.
        engine.ladders = [ladder];
        for (const direction of ['up', 'down']) {
          const start = direction === 'up' ? ladder.bottom : ladder.top;
          const target = direction === 'up' ? ladder.top : ladder.bottom;
          place(actor, ladder, start);
          climb(engine, actor, controls, controls[direction], target);
          assert.equal(actor.grounded, true, ladder.id + ': landing is supported by authored geometry');
          assert.equal(actor.vy, 0);
          assert.equal(actor.ladderId, null);
          const startX = actor.x;
          const landingNode = plan.graph.nodes.find((node) => (
            [ladder.fromNodeId, ladder.toNodeId].includes(node.id) && node.y === target
          ));
          const exitDirection = Math.sign(landingNode.x - ladder.x) || 1;
          engine.keys = new Set([exitDirection > 0 ? controls.right : controls.left]);
          for (let frame = 0; frame < 50; frame += 1) engine.updatePlayer(actor, DT, controls);
          assert.equal(actor.climbing, false, ladder.id + ': walking does not magnetize the actor to the ladder');
          assert.ok((actor.x - startX) * exitDirection > 140, ladder.id + ': ordinary walking follows the authored approach');
        }
      }
    }));
  }
}

for (const role of ['player', 'coop']) {
  test(role + ': les deux echelles du puits se traversent dans les deux sens sans capture anticipee', () => withEngine('ship-interior-vertical', (engine) => {
    const actor = engine[role];
    const controls = CONTROLS[role];
    const lower = engine.ladders.find((ladder) => ladder.id === 'ship-e19');
    const upper = engine.ladders.find((ladder) => ladder.id === 'ship-e20');
    assert.ok(lower && upper);
    assert.equal(lower.top, upper.bottom);
    // Keep their real source order: the old find() always picked the lower ladder.
    place(actor, lower, lower.bottom);
    climb(engine, actor, controls, controls.up, upper.top);
    assert.equal(actor.grounded, true);
    place(actor, upper, upper.top);
    climb(engine, actor, controls, controls.down, lower.bottom);
    assert.equal(actor.grounded, true);
    place(actor, upper, upper.bottom);
    assert.equal(engine.nearestLadder(actor, -1).id, upper.id);
    assert.equal(engine.nearestLadder(actor, 1).id, lower.id);
  }));

  test(role + ': pause a mi-echelle, saut de degagement et chute gardent une physique continue', () => withEngine('planet-exterior', (engine) => {
    const actor = engine[role];
    const controls = CONTROLS[role];
    const ladder = engine.ladders[0];
    engine.ladders = [ladder];
    place(actor, ladder, (ladder.top + ladder.bottom) / 2, true);
    engine.keys.clear();
    const stationaryY = actor.y;
    for (let frame = 0; frame < 30; frame += 1) engine.updatePlayer(actor, DT, controls);
    assert.equal(actor.y, stationaryY);
    assert.equal(actor.climbing, true);
    engine.keys = new Set([controls.up, controls.jump]);
    engine.updatePlayer(actor, DT, controls);
    assert.equal(actor.climbing, false);
    assert.equal(actor.grounded, false);
    assert.equal(actor.vy, -470);
    const jumpStartY = actor.y;
    for (let frame = 0; frame < 8; frame += 1) {
      const before = actor.y;
      engine.updatePlayer(actor, DT, controls);
      assert.equal(actor.climbing, false, 'a jump must not immediately regrab the ladder');
      assert.ok(Math.abs(actor.y - before) <= 470 * DT + 0.001);
    }
    assert.ok(actor.y < jumpStartY - 20);
    place(actor, ladder, (ladder.top + ladder.bottom) / 2, true);
    actor.x += 100;
    engine.keys.clear();
    const fallStartY = actor.y;
    engine.updatePlayer(actor, DT, controls);
    assert.equal(actor.climbing, false);
    assert.ok(actor.vy > 0);
    assert.ok(actor.y > fallStartY);
  }));
}

test('J1 et J2 utilisent leurs intentions verticales independantes sur un palier commun', () => withEngine('ship-interior-vertical', (engine) => {
  const lower = engine.ladders.find((ladder) => ladder.id === 'ship-e19');
  const upper = engine.ladders.find((ladder) => ladder.id === 'ship-e20');
  place(engine.player, upper, upper.bottom);
  place(engine.coop, lower, lower.top);
  engine.keys = new Set([CONTROLS.player.up, CONTROLS.coop.down]);
  const y1 = engine.player.y;
  const y2 = engine.coop.y;
  engine.updatePlayer(engine.player, DT, CONTROLS.player);
  engine.updatePlayer(engine.coop, DT, CONTROLS.coop);
  assert.equal(engine.player.ladderId, upper.id);
  assert.equal(engine.coop.ladderId, lower.id);
  assert.ok(engine.player.y < y1);
  assert.ok(engine.coop.y > y2);
}));

test('une extremite sans plancher ne cree pas de sol invisible', () => withEngine('planet-exterior', (engine) => {
  const ladder = engine.ladders[0];
  engine.ladders = [ladder];
  engine.platforms = [];
  const actor = engine.player;
  place(actor, ladder, ladder.top + 1, true);
  engine.keys = new Set([CONTROLS.player.up]);
  engine.updatePlayer(actor, DT, CONTROLS.player);
  assert.equal(actor.climbing, false);
  assert.equal(actor.grounded, false);
  assert.equal(actor.y + actor.h, ladder.top);
  engine.keys.clear();
  engine.updatePlayer(actor, DT, CONTROLS.player);
  assert.ok(actor.y + actor.h > ladder.top);
}));
