import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ForgeModel, serializeProject } from '../src/forge-model-v130.js';
import { inspectForgePlaytestV136, admittedForgeProjectV136 } from '../src/forge-playtest-v136.js';
import { missionV136, hostV136 } from './forge-native-host-v136.mjs';
import { CAMPAIGNS } from '../src/content.js';
import { compileShipProject } from '../src/hub-v51-runtime.js';
import { HubGame as NativeHub } from '../src/hub-opening-v88.js';
import { withHubTrainingV132 } from '../src/hub-training-v132.js';
import { withHubAuthoredCompositionV133 } from '../src/hub-authored-composition-v133.js';
import { withHubRoomParallaxV134 } from '../src/hub-room-parallax-v134.js';
import { withHubSpatialDesignV136 } from '../src/hub-spatial-design-v136.js';
import { withHubRoomDressingV134 } from '../src/hub-room-dressing-v134.js';
import { withHubRoomLifeV136 } from '../src/hub-room-life-v136.js';
import { withHubNpcLifeV136 } from '../src/npc-life-v136.js';
import { withHubCirculationV137 } from '../src/hub-circulation-v137.js';
import { withHubRoomIdentityV137 } from '../src/hub-room-identity-v137.js';
import { withHubDestinationSignsV138 } from '../src/hub-destination-signage-runtime-v138.js';

// Same production hub composition as app.js. Only browser APIs are doubled;
// compiler, start, gravity, movement, objective contacts and callbacks are real.
const ProductionHub = [withHubTrainingV132, withHubAuthoredCompositionV133, withHubRoomParallaxV134,
  withHubSpatialDesignV136, withHubRoomDressingV134, withHubRoomLifeV136, withHubNpcLifeV136,
  withHubCirculationV137, withHubRoomIdentityV137, withHubDestinationSignsV138]
  .reduce((Game, decorate) => decorate(Game), NativeHub);
const tile = (x, y, type) => ({ position: `${x}:${y}`, type });
const rect = object => Object.fromEntries(['x', 'y', 'w', 'h'].map(key => [key, object[key]]));

function lane(kind = 'mission', size = [128, 72], { farEdge = false, detailed = false } = {}) {
  const [columns, rows] = size;
  const tiles = [...Array.from({ length: columns }, (_, x) => tile(x, rows - 2, 'floor')),
    tile(farEdge ? columns - 1 : columns - 10, rows - 3, 'spawn'),
    tile(columns - 3, rows - 3, 'objective')];
  if (detailed) tiles.push(tile(columns - 2, 0, 'door'), tile(columns - 4, rows - 1, 'platform'),
    tile(columns - 6, rows - 5, 'wall'), tile(columns - 7, rows - 3, 'hazard'),
    tile(columns - 8, rows - 3, 'terminal'), tile(columns - 9, rows - 3, 'terminal'),
    tile(columns - 11, rows - 3, 'enemy'), tile(columns - 12, rows - 5, 'ladder'),
    tile(columns - 13, rows - 5, 'lift'), tile(columns - 13, rows - 6, 'lift'));
  const model = new ForgeModel({ schema: 2, kind, size, tiles });
  model.data.name = 'Plan natif V140';
  return model;
}

function shipRuntime(t, input, state = {}) {
  const { canvas } = hostV136(), patches = [], actions = [];
  const campaign = { hub: structuredClone(state), progression: { missions: 7 } }, before = structuredClone(campaign);
  const sandbox = structuredClone(campaign);
  // These tests exercise physics and admission, not a simulated art renderer.
  globalThis.Image = class extends EventTarget { complete = false; naturalWidth = 0; naturalHeight = 0; };
  // app.js routes Forge hub patches to forgePlaytest.hubState. The first
  // room/routine callback is transient sandbox data, not a campaign write.
  const engine = new ProductionHub(canvas, { onPersist: patch => {
    patches.push(structuredClone(patch)); sandbox.hub = { ...sandbox.hub, ...structuredClone(patch) };
  }, onAction: event => actions.push(event) });
  engine.start(sandbox.hub, { editorProject: input });
  engine.update(1 / 60);
  const startupPatches = patches.length;
  assert.ok(startupPatches > 0); assert.equal(sandbox.hub.npcRoutineState.schema, 62);
  t.after(() => engine.stop(false));
  return { engine, patches, startupPatches, campaign, before, sandbox, actions };
}

function campaignUnchanged(runtime) {
  assert.equal(runtime.patches.length, runtime.startupPatches, 'Travel within the same authored room cannot add campaign persistence callbacks.');
  assert.deepEqual(runtime.campaign, runtime.before);
  assert.notEqual(runtime.sandbox.hub, runtime.campaign.hub);
}

for (const size of [[32, 18], [64, 36], [128, 72]]) {
  test(`Mission inspector agrees with production geometry, bounded insertion and top door at ${size}`, t => {
    const model = lane('mission', size, { farEdge: true, detailed: true });
    const before = structuredClone(model.data), report = inspectForgePlaytestV136(model.data);
    assert.equal(report.ok, true, report.errors.join(' '));
    const { engine } = missionV136({ editorProject: admittedForgeProjectV136(model.data) });
    t.after(() => engine.stop());
    const actual = { floor: engine.platforms.filter(p => p.floor), platform: engine.platforms.filter(p => !p.floor && p.kind !== 'lift'),
      wall: engine.walls, door: engine.doors, hazard: engine.hazards, lift: engine.lifts };
    for (const [type, objects] of Object.entries(actual)) {
      assert.deepEqual(report.geometry.filter(g => g.type === type).map(rect), objects.map(rect), type);
    }
    assert.deepEqual(rect(report.geometry.find(g => g.type === 'spawn')), rect(engine.player));
    assert.equal(engine.doors[0].y, 0); assert.equal(engine.doors[0].h, Math.max(132, 1080 / size[1] * 2.6));
    assert.equal(engine.editorTileCount, model.room.cells.length);
    assert.equal(engine.editorGridV136.columns, size[0]); assert.equal(engine.editorGridV136.rows, size[1]);
    if (size[0] === 128) assert.equal(engine.player.x, 6200 - 42);
    assert.deepEqual(model.data, before);
  });

  test(`Ship inspector uses the production compiler, bounded insertion and grouped vertical access at ${size}`, t => {
    const model = lane('ship', size, { farEdge: true, detailed: true });
    const report = inspectForgePlaytestV136(model.data), input = admittedForgeProjectV136(model.data);
    assert.equal(report.ok, true, report.errors.join(' '));
    const compiled = compileShipProject(input), runtime = shipRuntime(t, input), { engine } = runtime;
    for (const [type, field] of [['floor', 'floors'], ['platform', 'platforms'], ['wall', 'walls'], ['door', 'doors'], ['hazard', 'hazards']]) {
      assert.deepEqual(report.geometry.filter(g => g.type === type).map(rect), compiled[field].map(rect), type);
    }
    assert.deepEqual(engine.v51Walls.map(rect), compiled.walls.map(rect));
    assert.deepEqual(engine.v51Doors.map(rect), compiled.doors.map(rect));
    assert.deepEqual(engine.v51Platforms.map(rect), [...compiled.floors, ...compiled.platforms].map(rect));
    assert.deepEqual(rect(report.geometry.find(g => g.type === 'spawn')), rect(engine.player));
    assert.equal(engine.player.w, 44); assert.equal(engine.player.h, 92);
    assert.equal(engine.v51Ladders.filter(l => l.type === 'lift').length, 1);
    const lift = compiled.lifts[0];
    assert.deepEqual(rect(report.geometry.find(g => g.type === 'lift')),
      { x: lift.x - lift.w / 2, y: lift.top, w: lift.w, h: lift.bottom - lift.top });
    assert.equal(engine.v51Doors[0].y, 0); assert.ok(engine.v51Doors[0].h >= 116);
    engine.update(1 / 60);
    campaignUnchanged(runtime);
  });
}

test('a modern active room overrides forged transient tiles in inspector, admission and both production engines', t => {
  for (const kind of ['mission', 'ship']) {
    const model = lane(kind);
    model.transaction('second room', () => {
      model.addRoom();
      const target = lane(kind).room;
      model.room.size = [...target.size];
      model.room.cells = target.cells.map(cell => ({ ...cell, id: `active-${cell.id}` }));
    });
    const authored = { ...serializeProject(model.data), size: [8, 8], tiles: [tile(0, 0, 'wall')], validation: { ok: false } };
    const before = structuredClone(authored), report = inspectForgePlaytestV136(authored);
    const admitted = admittedForgeProjectV136(authored);
    assert.equal(report.ok, true); assert.deepEqual(report.grid, [128, 72]);
    assert.equal(report.roomId, model.room.id); assert.equal(admitted.tiles.length, 130);
    assert.ok(report.issues.some(issue => issue.code === 'native-active-room-only'));
    const { engine } = kind === 'mission' ? missionV136({ editorProject: admitted }) : shipRuntime(t, admitted);
    if (kind === 'mission') {
      t.after(() => engine.stop()); assert.equal(engine.editorTileCount, 130);
      assert.equal(engine.editorGridV136.columns, 128); assert.equal(engine.campaign.id, 'forge-authored-v136');
    } else assert.equal(engine.compiledProject.grid.cols, 128);
    assert.deepEqual(rect(report.geometry.find(g => g.type === 'spawn')), rect(engine.player));
    assert.deepEqual(authored, before);
  }
});

test('both production engines compile raw modern rooms with absent or forged legacy previews', t => {
  for (const kind of ['mission', 'ship']) for (const preview of ['absent', 'forged']) {
    const source = lane(kind).data;
    const input = preview === 'absent' ? source : { ...source, size: [8, 8],
      tiles: [tile(0, 0, 'wall')], validation: { ok: true } };
    const before = structuredClone(input), report = inspectForgePlaytestV136(input);
    assert.equal(report.ok, true);
    const { engine } = kind === 'mission' ? missionV136({ editorProject: input }) : shipRuntime(t, input);
    if (kind === 'mission') {
      t.after(() => engine.stop());
      assert.equal(engine.editorMode, true, `${kind}/${preview}`);
      assert.equal(engine.editorTileCount, 130, `${kind}/${preview}`);
      assert.deepEqual([engine.editorGridV136.columns, engine.editorGridV136.rows], [128, 72]);
      assert.equal(engine.campaign.id, 'forge-authored-v136');
    } else {
      assert.equal(engine.editorPlaytest, true, `${kind}/${preview}`);
      assert.equal(engine.compiledProject.floors.length, 128, `${kind}/${preview}`);
      assert.deepEqual([engine.compiledProject.grid.cols, engine.compiledProject.grid.rows], [128, 72]);
    }
    assert.deepEqual(rect(report.geometry.find(g => g.type === 'spawn')), rect(engine.player), `${kind}/${preview}`);
    assert.deepEqual(input, before, `${kind}/${preview}`);
  }
});

test('an admitted modern Mission physically completes its own objective with no reference conditions or campaign rewards', t => {
  const input = admittedForgeProjectV136(lane().data), before = structuredClone(input);
  const specialCampaigns = CAMPAIGNS.filter(c => c.id.startsWith('special-')).slice(0, 3);
  assert.equal(specialCampaigns.length, 3);
  for (const campaign of specialCampaigns) {
    const { engine } = missionV136({ editorProject: input, campaign }); t.after(() => engine.stop());
    assert.equal(engine.campaign.id, 'forge-authored-v136'); assert.equal(engine.objectiveRuntime.id, 'forge-authored-objective-v136');
    assert.deepEqual(engine.objectiveRuntime.requirements, []); assert.deepEqual(engine.objectiveNodes, []);
    engine.interact(engine.player); assert.equal(engine.mission.state, 'active');
    const initial = engine.player.x;
    engine.keys.add('KeyD'); for (let frame = 0; frame < 180; frame++) engine.update(1 / 60); engine.keys.delete('KeyD');
    assert.ok(engine.player.x > initial + 200); assert.equal(engine.player.alive, true);
    engine.interact(engine.player); assert.equal(engine.mission.state, 'complete'); assert.equal(engine.objective.complete, true);
    for (const key of ['credits', 'salvage', 'intel', 'apex', 'cargo']) assert.equal(engine.mission.rewards[key], 0);
    assert.equal(engine.mission.rewards.scope, 'forge-playtest');
    engine.stop();
  }
  assert.deepEqual(input, before);
});

test('an admitted modern Ship physically walks into its authored objective while campaign data stays outside the sandbox', t => {
  const input = admittedForgeProjectV136(lane('ship').data), before = structuredClone(input);
  const runtime = shipRuntime(t, input), { engine, actions } = runtime;
  const initial = engine.player.x;
  assert.equal(engine.v51Objectives[0].complete, false);
  engine.keys.add('KeyD'); for (let frame = 0; frame < 180; frame++) engine.update(1 / 60); engine.keys.delete('KeyD');
  assert.ok(engine.player.x > initial + 200); assert.equal(engine.player.alive, true);
  assert.equal(engine.v51Objectives[0].complete, true);
  assert.equal(actions.filter(event => event.action === 'editor:objective-complete').length, 1);
  campaignUnchanged(runtime); assert.deepEqual(input, before);
});

test('Ship context caveat corresponds to the real inherited crisis, without claiming mission-style isolation', t => {
  const model = lane('ship'), report = inspectForgePlaytestV136(model.data);
  const runtime = shipRuntime(t, admittedForgeProjectV136(model.data),
    { activeCrisis: { id: 'forge-crisis-fixture', kind: 'synthetic', count: 1 } });
  const { engine } = runtime;
  assert.ok(report.issues.some(issue => issue.code === 'native-ship-context'));
  assert.equal(engine.crisis.active, true); assert.equal(engine.enemies.filter(enemy => enemy.source === 'crisis').length, 1);
  engine.update(1 / 60); campaignUnchanged(runtime);
});

test('a malformed modern document is rejected before a live production Mission can change', t => {
  const { engine, options } = missionV136({ editorProject: admittedForgeProjectV136(lane().data) });
  t.after(() => engine.stop());
  const before = { player: engine.player, mission: engine.mission, platforms: engine.platforms,
    campaign: engine.campaign, identity: engine.resumeIdentity };
  const invalid = { ...lane().data, activeRoomId: 'missing-active-room' };
  assert.throws(() => admittedForgeProjectV136(invalid));
  assert.throws(() => engine.start({ ...options, editorProject: invalid }));
  assert.equal(engine.running, true);
  for (const key of ['player', 'mission', 'platforms', 'campaign']) assert.equal(engine[key], before[key]);
  assert.equal(engine.resumeIdentity, before.identity);
});
