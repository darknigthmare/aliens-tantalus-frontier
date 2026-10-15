import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES } from '../src/content.js';
import { LevelEditor } from '../src/editor.js';
import { ForgeSaveSystemV62 } from '../src/forge-save-v62.js';
import { compileEditorGridV136, constrainEditorRectV136, analyzeEditorSpatialV136, isolateForgeMissionOptionsV136 } from '../src/editor-spatial-v136.js';
import { buildObjectiveRuntime } from '../src/game-complete-core.js';
import { editorHostV140 } from './editor-native-host-v140.mjs';
import { inspectForgePlaytestV136 } from '../src/forge-playtest-v136.js';

const tile = (column, row, type) => ({ position: `${column}:${row}`, type });
const project = (tiles, size = [128, 72]) => ({ schema: 2, kind: 'mission', size, tiles });
const lane = () => project([...Array.from({ length: 128 }, (_, x) => tile(x, 70, 'floor')),
  tile(118, 69, 'spawn'), tile(126, 69, 'objective')]);

function host() {
  const events = new EventTarget();
  for (const key of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[key] = events[key].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 1024; naturalHeight = 1024;
    async decode() {}
    set src(value) { this._src = value; queueMicrotask(() => this.dispatchEvent(new Event('load'))); }
    get src() { return this._src; }
  };
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  const context = new Proxy({}, { get: (target, key) => target[key] ?? (() => {}) });
  const attributes = new Map();
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, style: {},
    getContext: () => context, focus() { document.activeElement = this; },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }),
    hasAttribute: key => attributes.has(key), setAttribute: (key, value) => attributes.set(key, value) });
  return canvas;
}
function runtime(t, authored = lane(), overrides = {}) {
  const engine = new GameEngine(host()), options = { world: WORLDS[0], campaign: CAMPAIGNS[0], weapon: WEAPONS[0],
    seed: 426, enemyCatalog: ENEMIES.slice(0, 1), crew: [], equipment: [], editorProject: authored, qaMode: true, testMode: true, ...overrides };
  engine.start(options); t.after(() => engine.stop());
  return { engine, options };
}

test('every maximum-grid far-edge cell compiles at its distinct physical position instead of disappearing after column64/row36', () => {
  const source = project([tile(64, 36, 'wall'), tile(127, 71, 'objective'), tile(126, 70, 'spawn')]);
  const grid = compileEditorGridV136(source);
  assert.deepEqual([grid.columns, grid.rows, grid.tileWidth, grid.tileHeight], [128, 72, 48.4375, 15]);
  assert.deepEqual(grid.tiles.map(({ position, x, y }) => ({ position, x, y })), [
    { position: '64:36', x: 3100, y: 540 }, { position: '127:71', x: 6151.5625, y: 1065 }, { position: '126:70', x: 6103.125, y: 1050 }]);
  assert.deepEqual(source.tiles[1], tile(127, 71, 'objective'));
});

test('maximum-grid runtime preserves all authored geometry, traversal links and far-edge interactions with usable bounds', t => {
  const authored = project([tile(118, 69, 'spawn'), tile(127, 71, 'objective'), tile(127, 70, 'floor'),
    tile(126, 71, 'wall'), tile(125, 71, 'platform'), tile(124, 71, 'door'), tile(123, 71, 'vent'),
    tile(122, 71, 'ladder'), tile(121, 0, 'lift'), tile(120, 71, 'enemy'), tile(119, 71, 'vehicle'),
    tile(118, 71, 'terminal'), tile(117, 71, 'terminal'), tile(116, 71, 'hazard')]);
  const { engine } = runtime(t, authored);
  assert.equal(engine.editorTileCount, authored.tiles.length); assert.equal(engine.editorTileCounts.floor, 1);
  assert.deepEqual(engine.getSnapshot().editorGridV136, { columns: 128, rows: 72, tileWidth: 48.4375, tileHeight: 15 });
  assert.equal(engine.walls[0].x, 126 * 48.4375); assert.equal(engine.walls[0].y, 1065);
  assert.equal(engine.hazards[0].x, 116 * 48.4375); assert.equal(engine.hazards[0].y, 1074.75);
  assert.equal(engine.platforms.find(entry => entry.floor).x, 127 * 48.4375);
  assert.ok(engine.ladders[0].bottom > engine.ladders[0].top); assert.equal(engine.ladders[0].bottom, 1080);
  assert.ok(engine.lifts[0].topY <= engine.lifts[0].baseY);
  for (const bounds of [engine.player, engine.objective, ...engine.doors, ...engine.enemies, engine.vehicle, engine.powerNode, engine.archiveTerminal]) {
    assert.ok(bounds.x >= 0 && bounds.y >= 0, JSON.stringify(bounds));
    assert.ok(bounds.x + bounds.w <= 6200 + .001 && bounds.y + bounds.h <= 1080 + .001, JSON.stringify(bounds));
  }
  assert.ok(engine.vents[0].targetX + engine.player.w <= 6200);
  assert.ok(engine.vents[0].targetY >= 0 && engine.vents[0].targetY + engine.player.h <= 1080);
});

test('large authored level supports real walking into the right camera bound and retains an actual checkpoint across resume', t => {
  const { engine, options } = runtime(t);
  const initialX = engine.player.x;
  engine.keys.add('KeyD');
  for (let frame = 0; frame < 180; frame++) engine.update(1 / 60);
  engine.keys.delete('KeyD');
  assert.ok(engine.player.x > initialX + 200); assert.ok(engine.player.x <= 6200 - engine.player.w);
  assert.equal(Math.round(engine.player.y + engine.player.h), 1050); assert.ok(engine.player.alive);
  assert.ok(engine.camera.x > 4910 && engine.camera.x <= 4920); assert.ok(engine.camera.y > 359 && engine.camera.y <= 360);
  const saved = engine.captureResumeState(), expected = { x: engine.player.x, y: engine.player.y };
  engine.stop(); engine.start({ ...options, resumeState: saved });
  assert.equal(engine.lastResumeResult.applied, true);
  assert.ok(Math.abs(engine.player.x - expected.x) < 1 && Math.abs(engine.player.y - expected.y) < 1);
  assert.ok(engine.checkpoint.x > 5600 && engine.checkpoint.y > 900);
});

test('reusing the production engine for a normal mission clears the previous Forge insertion and grid', t => {
  const { engine, options } = runtime(t);
  assert.ok(engine.player.x > 5600); engine.stop(); engine.start({ ...options, editorProject: null });
  assert.equal(engine.editorSpawn, null); assert.equal(engine.editorGridV136, null); assert.equal(engine.editorMode, false);
  assert.ok(engine.player.x < 500, `Forge spawn leaked into normal mission: ${engine.player.x}`);
  assert.equal(engine.objectiveRuntime.id, buildObjectiveRuntime(options.campaign.objective).id);
});

test('Forge options isolate authored geometry from every selected special campaign without mutating the original deployment', () => {
  const source = { campaign: { id: 'special-jeri-hive', name: 'Scénario externe', objective: 'Rescue survivors', specialOperationId: 'jeri-hive' },
    levelSeed: { seed: 7331, hazards: ['radiation'] }, missionLevel: { id: 'scripted-map' }, editorProject: lane(),
    vehicle: { id: 'selected-shuttle' }, neuroProfile: { id: 'external-body' }, apexDossier: { id: 'external-boss' } };
  const before = structuredClone(source), isolated = isolateForgeMissionOptionsV136(source);
  assert.deepEqual(source, before); assert.equal(isolated.campaign.id, 'forge-authored-v136'); assert.equal(isolated.campaign.name, 'PLAYTEST FORGE');
  assert.equal(isolated.missionLevel, null); assert.equal(isolated.vehicle, null); assert.equal(isolated.neuroProfile, null); assert.equal(isolated.apexDossier, null);
  assert.equal(isolated.levelSeed.seed, 7331); assert.deepEqual(isolated.levelSeed.hazards, []); assert.equal(isolated.editorProject, source.editorProject);
  const regular = { campaign: source.campaign }; assert.equal(isolateForgeMissionOptionsV136(regular), regular);
});

test('an authored mission has no reference-campaign survivors and completes only at its real objective with zero campaign rewards', t => {
  const { engine } = runtime(t);
  assert.equal(engine.objectiveRuntime.id, 'forge-authored-objective-v136'); assert.deepEqual(engine.objectiveNodes, []);
  assert.deepEqual(engine.objectiveRuntime.requirements, []); assert.equal(engine.missingObjectiveRequirement(), '');
  engine.interact(engine.player); assert.equal(engine.mission.state, 'active');
  engine.keys.add('KeyD'); for (let frame = 0; frame < 180; frame++) engine.update(1 / 60); engine.keys.delete('KeyD');
  engine.interact(engine.player); assert.equal(engine.mission.state, 'complete'); assert.equal(engine.objective.complete, true);
  for (const key of ['credits', 'salvage', 'intel', 'apex', 'cargo']) assert.equal(engine.mission.rewards[key], 0);
  assert.equal(engine.mission.rewards.scope, 'forge-playtest');
});

test('authored power/archive terminals retain their physical gates instead of inheriting an unrelated campaign objective', t => {
  const { engine } = runtime(t, project([...lane().tiles, tile(110, 69, 'terminal'), tile(112, 69, 'terminal')]));
  assert.deepEqual(engine.objectiveRuntime.requirements, ['power', 'archive']); assert.deepEqual(engine.objectiveNodes, []);
  assert.equal(engine.missingObjectiveRequirement(), 'ALIMENTATION AUXILIAIRE MANQUANTE');
});

test('selecting any admitted special campaign cannot substitute its scripted map, objectives or actor for the authored Forge mission', t => {
  const specials = CAMPAIGNS.filter(campaign => campaign.id.startsWith('special-'));
  assert.ok(specials.length >= 10);
  for (const campaign of specials) {
    const { engine } = runtime(t, lane(), { campaign });
    assert.equal(engine.campaign.id, 'forge-authored-v136', campaign.id);
    assert.equal(engine.editorTileCount, 130, campaign.id); assert.equal(engine.platforms.filter(entry => entry.floor).length, 128, campaign.id);
    assert.ok(engine.player.x > 5600 && engine.player.y > 900, campaign.id);
    assert.equal(engine.objectiveRuntime.id, 'forge-authored-objective-v136', campaign.id); assert.deepEqual(engine.objectiveNodes, [], campaign.id);
    assert.equal(engine.isHiveMissionV131?.(), false, campaign.id); assert.equal(engine.isLegacyMissionV131?.(), false, campaign.id);
    engine.stop();
  }
});

test('native Forge save/export/import does not lose maximum-grid geometry before the runtime compiler sees it', () => {
  const bytes = new Map(), storage = { getItem: key => bytes.get(key) ?? null, setItem: (key, value) => bytes.set(key, value) };
  const forge = new ForgeSaveSystemV62(storage); forge.load();
  forge.upsert({ ...lane(), id: 'large-lane', name: 'Chemin bas droit' });
  const saved = JSON.parse(forge.export()), reloaded = new ForgeSaveSystemV62(storage); reloaded.load();
  assert.deepEqual(saved.projects[0].size, [128, 72]);
  assert.deepEqual(compileEditorGridV136(reloaded.data.projects[0]), compileEditorGridV136(lane()));
});

test('clearance review distinguishes a supported insertion from a blocked full-height silhouette and an intentional drop', () => {
  const good = analyzeEditorSpatialV136(lane()); assert.deepEqual(good.issues, []);
  const blocked = analyzeEditorSpatialV136(project([...lane().tiles, tile(118, 65, 'wall')]));
  assert.ok(blocked.issues.some(issue => issue.code === 'spawn-obstructed'));
  const falling = analyzeEditorSpatialV136(project(lane().tiles.filter(entry => entry.type !== 'floor')));
  assert.ok(falling.issues.some(issue => issue.code === 'spawn-falling'));
  const footprint = good.footprints.find(entry => entry.type === 'spawn');
  assert.equal(footprint.w, 42); assert.equal(footprint.h, 92); assert.equal(footprint.y + footprint.h, 1050);
});

test('review identifies only the markers the mission actually consumes and does not certify route reachability', () => {
  const report = analyzeEditorSpatialV136(project([...lane().tiles, tile(119, 69, 'spawn'), tile(125, 69, 'objective'),
    tile(5, 5, 'terminal'), tile(6, 5, 'terminal'), tile(7, 5, 'terminal')]));
  assert.deepEqual(report.issues.map(issue => issue.code), ['extra-spawn', 'extra-objective', 'extra-terminal']);
  assert.match(report.note, /playtest reste nécessaire/); assert.equal(Object.hasOwn(report, 'reachable'), false);
  assert.equal(analyzeEditorSpatialV136({ ...lane(), kind: 'ship' }).supported, false);
});

test('preview follows resize/undo without modifying the authored file, undo stack or campaign data', t => {
  const { editor, paint } = editorHostV140(t); editor.load(lane());
  const exported = editor.serialize(), history = structuredClone(editor.history);
  const reviewed = inspectForgePlaytestV136(editor.model.data);
  assert.equal(reviewed.geometry.find(entry => entry.type === 'spawn').h, 92);
  assert.deepEqual(editor.serialize(), exported); assert.deepEqual(editor.history, history);
  paint(118, 65, 'wall', 'structure');
  assert.ok(inspectForgePlaytestV136(editor.model.data).issues.some(issue => issue.code === 'native-spawn-blocked'));
  editor.undo(); assert.equal(inspectForgePlaytestV136(editor.model.data).issues.some(issue => issue.code === 'native-spawn-blocked'), false);
});

test('invalid dimensions and physical object sizes fail before a misleading grid can be produced', () => {
  for (const size of [[129, 72], [128, 73], [64.1, 18], [0, 18]]) assert.throws(() => compileEditorGridV136(project([], size)));
  assert.throws(() => constrainEditorRectV136({ x: 1, y: 2, w: Infinity, h: 3 }));
  assert.throws(() => constrainEditorRectV136({ x: 1, y: 2, w: 6201, h: 3 }));
  assert.deepEqual(constrainEditorRectV136({ x: 6190, y: -50, w: 42, h: 92 }), { x: 6158, y: 0, w: 42, h: 92 });
});

test('rejecting a malformed Forge start leaves the already running production mission completely intact', t => {
  const { engine, options } = runtime(t), before = { player: engine.player, campaign: engine.campaign, platforms: engine.platforms,
    mission: engine.mission, camera: engine.camera, checkpoint: engine.checkpoint, identity: engine.resumeIdentity,
    signature: engine.expectedMissionSignatureV130 };
  for (const invalid of [{ kind: 'mission', objects: [] }, { ...lane(), size: [129, 72] },
    { ...lane(), tiles: [tile(128, 71, 'wall')] }]) {
    assert.throws(() => engine.start({ ...options, editorProject: invalid }));
    assert.equal(engine.running, true);
    for (const key of ['player', 'campaign', 'platforms', 'mission', 'camera', 'checkpoint']) assert.equal(engine[key], before[key], key);
    assert.equal(engine.resumeIdentity, before.identity); assert.equal(engine.expectedMissionSignatureV130, before.signature);
  }
});
