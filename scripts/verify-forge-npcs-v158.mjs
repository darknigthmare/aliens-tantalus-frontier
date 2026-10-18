/** Production Forge parser, editor operations, Mission and Ship engines.
 * Canvas/Image/RAF and browser event hosts are the declared V136 doubles. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { ForgeModel, parseProject, nativeTiles } from '../src/forge-model-v130.js';
import { FORGE_NPC_LIMITS_V158, FORGE_NPC_PRESETS_V158, forgeNpcActorsV158, drawForgeNpcsV158 } from '../src/forge-npcs-v158.js';
import { inspectForgeJourneyV141 } from '../src/forge-journey-admission-v141.js';
import { forgeNarrativeViewV156 } from '../src/forge-narrative-v156.js';
import { editForgeNarrativeV156, forgeNarrativeFieldsV156 } from '../src/forge-narrative-ui-v156.js';
import { captureAssemblyV133, normalizeAssemblyV133, stampAssemblyV133, editSelectionV133 } from '../src/forge-authoring-v133.js';
import { ForgeVersionStoreV136, compareForgeDocumentsV136 } from '../src/forge-versions-v136.js';
import { ForgeSaveSystemV62 } from '../src/forge-save-v62.js';
import { ForgePlaytestCheckpointStoreV157, inspectForgePlaytestCheckpointV157 } from '../src/forge-playtest-checkpoint-v157.js';
import { missionV136, hostV136 } from './forge-native-host-v136.mjs';
import { HubGame } from '../src/hub-v51-runtime.js';
import { withForgeShipRuntimeV141 } from '../src/forge-ship-runtime-v141.js';
import { withForgeDecorationV141 } from '../src/forge-decoration-v141.js';

const storage = () => { const data = new Map(); return { data, getItem: key => data.get(key) ?? null,
  setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key) }; };
function project(kind = 'mission') {
  const floor = kind === 'ship' ? 15 : 16;
  const room = id => ({ id, name: `Relais ${id}`, size: [32, 18], cells: [
    ...Array.from({ length: 32 }, (_, x) => ({ id: `${id}-f${x}`, x, y: floor, type: 'floor', layer: 'structure' })),
    { id: `${id}-spawn`, x: 1, y: floor - 1, type: 'spawn', layer: 'gameplay' },
    { id: `${id}-goal`, x: 28, y: floor - 1, type: 'objective', layer: 'gameplay' },
    { id: `${id}-door`, x: id === 'a' ? 12 : 2, y: floor - 1, type: 'door', layer: 'gameplay' },
    { id: `${id}-npc`, x: id === 'a' ? 4 : 6, y: floor - 1, type: 'npc', layer: 'gameplay', label: 'Relais de service',
      npc: { schema: 1, name: id === 'a' ? 'Agent du relais' : 'Responsable de relève', presetId: id === 'a' ? 'colonial-technician' : 'colonial-medic', facing: -1 },
      narrative: { schema: 1, title: 'Transmission de service', start: 'start', ...(id === 'a' ? { items: [{ id: 'badge', label: 'Badge du relais' }] } : {}), nodes: [
        { id: 'start', text: id === 'a' ? 'Remettez ce badge au relais suivant.' : 'Avez-vous le badge du relais ?', choices: [id === 'a'
          ? { id: 'take', label: 'Prendre le badge', next: 'done', rewardItemId: 'badge' }
          : { id: 'deliver', label: 'Remettre le badge', next: 'done', requiresItemId: 'badge', consumeRequiredItem: true, requiresPlaySeconds: 1, rewardObjectiveId: 'b-goal' }] },
        { id: 'done', text: 'Transmission enregistrée.', choices: [] }
      ] } }
  ] });
  return { schema: 3, kind, name: 'Personnages Forge V158', activeRoomId: 'a', rooms: [room('a'), room('b')], links: [
    { id: 'ab', from: { roomId: 'a', cellId: 'a-door' }, to: { roomId: 'b', cellId: 'b-door' }, bidirectional: true }
  ] };
}
const npcCell = (input, room = 'a') => input.rooms.find(entry => entry.id === room).cells.find(entry => entry.type === 'npc');
function runtime(t, kind = 'mission', input = project(kind)) {
  let fixture;
  if (kind === 'mission') fixture = missionV136({ editorProject: input, forgeJourneyV141: true });
  else {
    const host = hostV136(), actions = [], patches = [], engine = new (withForgeDecorationV141(withForgeShipRuntimeV141(HubGame)))(host.canvas,
      { onAction: event => actions.push(event), onPersist: patch => patches.push(patch) });
    engine.start({}, { editorProject: input, forgeJourneyV141: true }); fixture = { ...host, engine, actions, patches };
  }
  t.after(() => fixture.engine.stop());
  for (let frame = 0; frame < 30; frame++) fixture.engine.update(1 / 60);
  return fixture;
}
function walk(engine, until, direction = 1) {
  const code = direction > 0 ? 'KeyD' : 'KeyA'; engine.keys.add(code);
  for (let frame = 0; frame < 2200 && !until(); frame++) engine.update(1 / 60);
  engine.keys.delete(code); assert.ok(until(), `native walk stopped at ${engine.player.x}`);
}
function tap(fixture, code = 'KeyE') {
  for (const type of ['keydown', 'keyup']) { const event = new Event(type, { cancelable: true });
    Object.assign(event, { code, repeat: false, ctrlKey: false, altKey: false, metaKey: false }); fixture.events.dispatchEvent(event); }
}
const nearestNpc = (engine, kind) => kind === 'ship' ? engine.nearestForgeInteractionV141()?.type === 'npc'
  : Boolean(engine.forgeNarrativeNpcV158());
const nearestDoor = (engine, kind) => kind === 'ship' ? engine.nearestForgeInteractionV141()?.type === 'door'
  : Boolean(engine.forgeLinkedDoorV141());

test('V158 NPC cells are a strict authored identity with local atlas presets, not a legacy terminal/enemy', () => {
  const input = parseProject(project()), cell = npcCell(input);
  assert.equal(FORGE_NPC_LIMITS_V158.room, 16); assert.equal(FORGE_NPC_LIMITS_V158.project, 64);
  assert.equal(FORGE_NPC_PRESETS_V158.length, 3);
  assert.deepEqual(parseProject(JSON.stringify(input)), input);
  assert.equal(nativeTiles(input.rooms[0]).some(tile => tile.position === `${cell.x}:${cell.y}`), false);
  const report = inspectForgeJourneyV141(input); assert.equal(report.ok, true, report.errors.join(' '));
  assert.equal(report.counts.npc, 1); assert.equal(report.counts.terminal, 0); assert.equal(report.counts.enemy, 0);
  assert.equal(report.geometry.find(body => body.type === 'npc').h, 92);
  const model = new ForgeModel(input); model.transaction('Créer un PNJ', () => model.paint(8, 15, 'npc', 'gameplay'));
  assert.equal(model.room.cells.find(entry => entry.x === 8 && entry.y === 15).npc.name, 'Personnel');
});

test('V158 invalid NPC imports fail atomically without arbitrary resources, paths, code or decoration', () => {
  for (const mutate of [
    c => c.npc = null, c => c.npc.name = '', c => c.npc.name = 'a'.repeat(81), c => c.npc.name = 'Nom\nscript',
    c => c.npc.facing = 0, c => c.npc.facing = '1', c => c.npc.presetId = '/untrusted.png',
    c => c.npc.script = 'grantAmmo()', c => c.npc.health = 100, c => c.layer = 'background', c => c.type = 'terminal'
  ]) {
    const model = new ForgeModel(project()), before = structuredClone(model.data), bad = project(); mutate(npcCell(bad));
    assert.throws(() => model.load(bad), /Personnage Forge/); assert.deepEqual(model.data, before); assert.equal(model.history.length, 0);
  }
});

test('V158 NPC and story budgets apply across the complete project including assembly/copy operations', () => {
  const tooMany = project();
  for (let n = 0; n < 16; n++) tooMany.rooms[0].cells.push({ id: `extra-${n}`, x: n, y: 5, type: 'npc', layer: 'gameplay' });
  assert.throws(() => parseProject(tooMany), /16 PNJ/);
  const many = project(); many.rooms = Array.from({ length: 4 }, (_, n) => ({ id: `r${n}`, name: 'Personnel', size: [32, 18], cells: Array.from({ length: 16 }, (_, k) => ({
    ...structuredClone(npcCell(project())), id: `p${n}-${k}`, x: k, y: 8
  })) })); many.activeRoomId = 'r0'; many.links = [];
  assert.equal(parseProject(many).rooms.flatMap(room => room.cells).length, 64);
  many.rooms[0].cells.push({ id: 'extra-story', x: 30, y: 4, type: 'terminal', layer: 'gameplay', narrative: structuredClone(npcCell(project()).narrative) });
  assert.throws(() => parseProject(many), /64 terminaux\/PNJ/);
  delete many.rooms[0].cells.at(-1).narrative; many.rooms.push({ id: 'r4', name: 'Encore', size: [32, 18], cells: [{ id: 'p65', x: 4, y: 8, type: 'npc', layer: 'gameplay' }] });
  assert.throws(() => parseProject(many), /64 PNJ/);
});

test('V158 NPC edits, conversion, copying, assemblies, undo and V136 version diffs preserve the actual authored speaker and graph', () => {
  const model = new ForgeModel(project()), before = structuredClone(model.data), cell = npcCell(model.data);
  model.transaction('Renommer', () => { cell.npc.name = 'Relève du soir'; cell.npc.facing = 1; });
  assert.deepEqual(compareForgeDocumentsV136(before, model.data).changes[0].fields, ['npc']);
  model.undo(); assert.deepEqual(model.data, before); model.redo(); assert.equal(npcCell(model.data).npc.name, 'Relève du soir');
  const versions = new ForgeVersionStoreV136(storage()); versions.load(); versions.capture(model.data, 'Personnel');
  assert.deepEqual(JSON.parse(versions.export()).entries[0].project, model.data);
  const assembly = normalizeAssemblyV133(JSON.parse(JSON.stringify(captureAssemblyV133(model, ['a-npc'], 'Agent'))));
  const ids = stampAssemblyV133(model, assembly, 8, 15);
  assert.deepEqual(model.room.cells.find(entry => entry.id === ids[0]).npc, npcCell(model.data).npc);
  assert.equal(model.room.cells.find(entry => entry.id === ids[0]).narrative.nodes[0].choices[0].rewardItemId, 'badge');
  model.undo(); assert.equal(model.room.cells.some(entry => entry.id === ids[0]), false);
  editSelectionV133(model, ['a-npc'], 'type', 'terminal'); assert.equal(npcCell(model.data), undefined);
  const terminal = model.room.cells.find(entry => entry.id === 'a-npc'); assert.equal(terminal.npc, undefined); assert.ok(terminal.narrative);
  model.undo(); assert.equal(npcCell(model.data).npc.name, 'Relève du soir');
});

test('V158 real inspector dialogue operations remain transactional, escaped and independent of terminal side effects', () => {
  const input = project(); input.rooms = [input.rooms[0]]; input.links = [];
  const model = new ForgeModel(input), editor = { model, selected: () => [npcCell(model.data)], assertSelectionEditable() {}, edit: (label, fn) => model.transaction(label, fn) };
  editForgeNarrativeV156(editor, 'story-remove', () => ''); assert.match(forgeNarrativeFieldsV156(editor, npcCell(model.data)), /Ajouter un dialogue/);
  editForgeNarrativeV156(editor, 'story-create', () => ''); assert.match(forgeNarrativeFieldsV156(editor, npcCell(model.data)), /DIALOGUE DU PERSONNAGE/);
  editForgeNarrativeV156(editor, 'story-save', key => ({ 'story-node': 'briefing', 'story-title': '<img src=x>', 'story-text': '</textarea><script>bad()</script>',
    'story-choice-0-label': 'Répondre', 'story-choice-0-next': 'report' })[key] || '');
  const fields = forgeNarrativeFieldsV156(editor, npcCell(model.data)); assert.ok(fields.includes('&lt;script&gt;')); assert.ok(!fields.includes('<script>'));
  npcCell(model.data).locked = true; const before = structuredClone(model.data); assert.throws(() => editForgeNarrativeV156(editor, 'story-remove', () => ''), /Déverrouillez/); assert.deepEqual(model.data, before);
});

test('V158 workspace save/load/export keeps NPC data separate from the campaign profile', () => {
  const local = storage(); local.setItem('atf-v47-profile-1', 'exact-campaign');
  const store = new ForgeSaveSystemV62(local); store.load(); store.upsert({ ...project(), id: 'npc-project' });
  const again = new ForgeSaveSystemV62(local); again.load();
  assert.deepEqual(npcCell(again.data.projects[0]).npc, npcCell(parseProject(project())).npc);
  assert.equal(local.getItem('atf-v47-profile-1'), 'exact-campaign');
});

for (const kind of ['mission', 'ship']) {
  test(`V158 ${kind} PNJ feet use the real platform surface and refuse moving-lift support`, () => {
    const input = project(kind), room = input.rooms[0], cell = npcCell(input), support = room.cells.find(entry => entry.id === 'a-f4');
    support.type = 'platform'; const report = inspectForgeJourneyV141(input); assert.equal(report.ok, true, report.errors.join(' '));
    const body = report.geometry.find(shape => shape.cellId === cell.id), surface = report.geometry.find(shape => shape.cellId === support.id);
    assert.equal(body.y + body.h, surface.y);
    support.type = 'lift'; const rejected = inspectForgeJourneyV141(input); assert.equal(rejected.ok, false);
    assert.ok(rejected.issues.some(issue => issue.cellId === cell.id && issue.code === 'npc-body-support'));
  });

  test(`V158 ${kind} physics rejects floating, obstructed, hazardous and overlapping PNJ before replacing a real session`, t => {
    const fixture = runtime(t, kind), e = fixture.engine, owner = e.forgeSessionV141;
    for (const mutate of [
      p => p.rooms[0].cells.splice(p.rooms[0].cells.findIndex(cell => cell.id === 'a-f4'), 1),
      p => npcCell(p).y = 0,
      p => p.rooms[0].cells.push({ id: 'head-wall', type: 'wall', layer: 'structure', x: 4, y: kind === 'ship' ? 13 : 14 }),
      p => p.rooms[0].cells.push({ id: 'body-hazard', type: 'hazard', layer: 'structure', x: 4, y: kind === 'ship' ? 14 : 15 }),
      p => { npcCell(p).x = 1; npcCell(p).layer = 'structure'; }
    ]) {
      const bad = project(kind); mutate(bad); const report = inspectForgeJourneyV141(bad); assert.equal(report.ok, false, JSON.stringify(report.issues));
      assert.throws(() => kind === 'mission' ? e.start({ ...fixture.options, editorProject: bad, forgeJourneyV141: true }) : e.start({}, { editorProject: bad, forgeJourneyV141: true }), /refusé/);
      assert.equal(e.forgeSessionV141, owner); assert.equal(e.running, true);
    }
  });

  test(`V158 ${kind} native E talks to a real named human and preserves ordinary terminal/objective resources`, t => {
    const fixture = runtime(t, kind), e = fixture.engine;
    assert.equal(e.forgeNpcsV158.length, 1); assert.equal(e.enemies.length, 0);
    assert.equal(kind === 'ship' ? e.v51Terminals.length : Number(Boolean(e.powerNode)) + Number(Boolean(e.archiveTerminal)), 0);
    walk(e, () => nearestNpc(e, kind)); const prompt = kind === 'ship' ? e.statusPrompt() : e.getInteractionPrompt(); assert.match(prompt, /PARLER À AGENT DU RELAIS/);
    const inventory = structuredClone(e.inventory), health = e.player.health, x = e.player.x, clock = e.forgeSessionV141.narrativePlaySecondsV157;
    tap(fixture); assert.equal(e.forgeNarrativeOpenV156, 'a-npc');
    const view = forgeNarrativeViewV156(e.forgeSessionV141, 'a-npc'); assert.equal(view.speaker.name, 'Agent du relais');
    assert.equal(view.speaker.presetId, 'colonial-technician'); assert.equal(e.keys.size, 0);
    for (let n = 0; n < 60; n++) e.update(1 / 60);
    assert.equal(e.player.x, x); assert.equal(e.forgeSessionV141.narrativePlaySecondsV157, clock); assert.equal(e.fire(e.player), false);
    assert.equal(e.chooseForgeNarrativeV156('take').ok, true); assert.deepEqual(e.forgeSessionV141.narrativeInventoryV157, ['badge']);
    assert.deepEqual(e.inventory, inventory); assert.equal(e.player.health, health); assert.deepEqual(e.forgeSessionV141.completedObjectives, []);
    e.closeForgeNarrativeV156(); tap(fixture); assert.equal(forgeNarrativeViewV156(e.forgeSessionV141, 'a-npc').finished, true);
    assert.equal(e.chooseForgeNarrativeV156('take').ok, false); assert.deepEqual(e.forgeSessionV141.narrativeInventoryV157, ['badge']);
  });

  test(`V158 ${kind} prompt and E share physical line of sight instead of talking through a newly placed wall`, t => {
    const fixture = runtime(t, kind), e = fixture.engine; walk(e, () => nearestNpc(e, kind));
    const target = e.forgeNpcsV158[0], midpoint = (e.player.x + e.player.w / 2 + target.x + target.w / 2) / 2;
    const walls = kind === 'ship' ? e.v51Walls : e.walls;
    walls.push({ id: 'qa-sealed-partition', x: midpoint - 4, y: target.y - 5, w: 8, h: 110 });
    assert.equal(nearestNpc(e, kind), false); assert.doesNotMatch(kind === 'ship' ? e.statusPrompt() : e.getInteractionPrompt(), /PARLER/);
    tap(fixture); assert.equal(e.forgeNarrativeOpenV156 || null, null); assert.deepEqual(e.forgeSessionV141.narrativeV156 || [], []);
    walls.pop(); tap(fixture); assert.equal(e.forgeNarrativeOpenV156, 'a-npc');
  });

  test(`V158 ${kind} dialogue cursor and tokens survive physical room travel and JSON checkpoint reload with reconstructed PNJ`, async t => {
    const input = project(kind), first = runtime(t, kind, input), e = first.engine, local = storage(); local.setItem('campaign', 'untouched');
    walk(e, () => nearestNpc(e, kind)); tap(first); assert.equal(e.chooseForgeNarrativeV156('take').ok, true); e.closeForgeNarrativeV156();
    walk(e, () => nearestDoor(e, kind)); tap(first); assert.equal(e.forgeSessionV141.currentRoomId, 'b');
    assert.equal(e.forgeNpcsV158[0].cellId, 'b-npc'); walk(e, () => nearestNpc(e, kind)); tap(first);
    assert.equal(e.chooseForgeNarrativeV156('deliver').ok, true); e.closeForgeNarrativeV156();
    assert.deepEqual(e.forgeSessionV141.narrativeInventoryV157, []); assert.deepEqual(e.forgeSessionV141.completedObjectives, ['b-goal']);
    e.player.health = 37; if (kind === 'mission') { e.player.ammo = 2; e.player.ammoReserve = 3; }
    const checkpoint = new ForgePlaytestCheckpointStoreV157(local); await checkpoint.save(e);
    const raw = JSON.parse(JSON.stringify(checkpoint.raw())), inspected = await inspectForgePlaytestCheckpointV157(raw, input);
    assert.equal(Object.values(inspected.data.session.roomStates).some(room => 'forgeNpcsV158' in room || 'npcs' in room), false);
    const seconds = e.forgeSessionV141.narrativePlaySecondsV157; e.stop(); const next = runtime(t, kind, JSON.parse(JSON.stringify(input))), n = next.engine;
    assert.equal((await checkpoint.resume(n, input)).applied, true); assert.equal(n.player.health, 37);
    assert.equal(n.forgeNpcsV158[0].cellId, 'b-npc'); assert.equal(n.forgeNpcsV158[0].name, 'Responsable de relève');
    assert.equal(n.forgeSessionV141.narrativePlaySecondsV157, seconds); if (kind === 'mission') { assert.equal(n.player.ammo, 2); assert.equal(n.player.ammoReserve, 3); }
    tap(next); assert.equal(forgeNarrativeViewV156(n.forgeSessionV141, 'b-npc').finished, true); assert.equal(n.chooseForgeNarrativeV156('deliver').ok, false);
    n.closeForgeNarrativeV156(); walk(n, () => nearestDoor(n, kind), -1); tap(next); assert.equal(n.forgeSessionV141.currentRoomId, 'a');
    assert.equal(n.forgeNpcsV158[0].cellId, 'a-npc'); walk(n, () => nearestNpc(n, kind), -1); tap(next);
    assert.equal(forgeNarrativeViewV156(n.forgeSessionV141, 'a-npc').finished, true); assert.equal(n.chooseForgeNarrativeV156('take').ok, false);
    assert.deepEqual(n.forgeSessionV141.narrativeInventoryV157, []); assert.equal(local.getItem('campaign'), 'untouched');
  });

  test(`V158 ${kind} stopped or replaced sessions invalidate their old dialogue callbacks`, t => {
    const fixture = runtime(t, kind), e = fixture.engine; walk(e, () => nearestNpc(e, kind)); tap(fixture);
    const stale = e.chooseForgeNarrativeV156; e.stop();
    if (kind === 'mission') e.start(fixture.options); else e.start({}, { editorProject: project(kind), forgeJourneyV141: true });
    assert.equal(stale('take').reason, 'dialogue-closed'); assert.deepEqual(e.forgeSessionV141.narrativeV156 || [], []);
    assert.deepEqual(e.forgeSessionV141.narrativeInventoryV157 || [], []);
  });

  test(`V158 ${kind} a paused playtest refuses PNJ interaction before creating a story cursor`, t => {
    const fixture = runtime(t, kind), e = fixture.engine; walk(e, () => nearestNpc(e, kind));
    e.paused = true; const before = structuredClone(e.forgeSessionV141);
    assert.equal(e.interact(e.player), false); assert.equal(e.forgeNarrativeOpenV156 || null, null);
    assert.deepEqual(e.forgeSessionV141, before);
    e.paused = false; assert.equal(e.interact(e.player), true); assert.equal(e.forgeNarrativeOpenV156, 'a-npc');
  });

  test(`V158 ${kind} a checkpoint bound to a different speaker identity refuses before replacing resources or PNJ`, async t => {
    const fixture = runtime(t, kind), e = fixture.engine, store = new ForgePlaytestCheckpointStoreV157(storage()); await store.save(e);
    const before = e.forgeSessionV141, actors = e.forgeNpcsV158, health = e.player.health, changed = project(kind); npcCell(changed).npc.presetId = 'colonial-medic';
    await assert.rejects(store.resume(e, changed), /projet a changé/);
    assert.equal(e.forgeSessionV141, before); assert.equal(e.forgeNpcsV158, actors); assert.equal(e.player.health, health);
  });

  test(`V158 ${kind} renders the admitted colonial atlas at shared human stature and authored feet`, t => {
    const fixture = runtime(t, kind), e = fixture.engine, draws = drawForgeNpcsV158(e.canvas.getContext('2d'), e);
    assert.equal(draws.length, 1); assert.equal(draws[0].drawn, true); assert.equal(draws[0].geometry.standingHeight, 96.5);
    assert.equal(draws[0].geometry.pivot.y, e.forgeNpcsV158[0].y + 92);
    e.drawWorld(e.canvas.getContext('2d')); assert.equal(e.forgeNpcRenderV158[0].drawn, true);
    const authored = forgeNpcActorsV158(parseProject(project(kind)).rooms[0], kind); assert.deepEqual(e.forgeNpcsV158, authored);
  });
}

test('V158 real Mission gamepad opens PNJ dialogue, stops later actions and requires neutral before another press', t => {
  const fixture = runtime(t), e = fixture.engine; walk(e, () => nearestNpc(e, 'mission')); e.canvas.focus();
  const pad = (held = []) => ({ connected: true, mapping: 'standard', index: 0, id: 'qa-forge-npc-pad', axes: [0, 0, 0, 0],
    buttons: Array.from({ length: 17 }, (_, index) => ({ pressed: held.includes(index), value: held.includes(index) ? 1 : 0 })) });
  e.gamepadInputV77.poll([pad()]);
  const before = { ammo: e.player.ammo, health: e.player.health, inventory: structuredClone(e.inventory) };
  e.gamepadInputV77.poll([pad([3, 4, 5, 8, 11])]);
  assert.equal(e.forgeNarrativeOpenV156, 'a-npc'); assert.equal(e.paused, false); assert.equal(e.keys.size, 0);
  assert.deepEqual({ ammo: e.player.ammo, health: e.player.health, inventory: e.inventory }, before);
  e.gamepadInputV77.poll([pad([3, 9])]); assert.equal(e.paused, false); e.closeForgeNarrativeV156();
  e.gamepadInputV77.poll([pad([3, 9])]); assert.equal(e.forgeNarrativeOpenV156 || null, null); assert.equal(e.paused, false);
  e.gamepadInputV77.poll([pad()]); e.gamepadInputV77.poll([pad([3])]); assert.equal(e.forgeNarrativeOpenV156, 'a-npc');
});

test('V158 Mission PNJ share the native environment/player camera transform and still render when the Marine is in a vehicle', t => {
  const fixture = runtime(t), e = fixture.engine, ctx = e.canvas.getContext('2d'), stack = [], calls = [];
  let transform = { x: 0, y: 0 };
  ctx.save = () => stack.push({ ...transform }); ctx.restore = () => { transform = stack.pop() || { x: 0, y: 0 }; };
  ctx.translate = (x, y) => { transform.x += x; transform.y += y; };
  for (const [method, label] of [['drawFloors', 'environment'], ['drawForgeNpcsV158', 'npc'], ['drawActor', 'actor']]) {
    const native = e[method]; e[method] = function (...args) { calls.push({ label, transform: { ...transform }, actor: args[1] }); return native.apply(this, args); };
  }
  // Explicit presentation fixtures exercise the real production draw stack.
  // They never award resources, move an actor or replace a renderer.
  e.cameraShake = 1; assert.equal(e.accessibilityRuntime.reducedMotion, false);
  e.drawWorld(ctx);
  const environment = calls.find(call => call.label === 'environment'), npc = calls.find(call => call.label === 'npc'),
    marine = calls.find(call => call.label === 'actor' && call.actor === e.player);
  assert.ok(Math.abs(environment.transform.x) + Math.abs(environment.transform.y) > .01);
  assert.deepEqual(npc.transform, environment.transform); assert.deepEqual(marine.transform, environment.transform);
  assert.ok(calls.indexOf(environment) < calls.indexOf(npc)); assert.ok(calls.indexOf(npc) < calls.indexOf(marine));
  calls.length = 0; e.player.inVehicle = true; e.drawWorld(ctx);
  assert.equal(calls.filter(call => call.label === 'npc').length, 1);
  assert.equal(calls.some(call => call.label === 'actor' && call.actor === e.player), false);
  assert.equal(e.forgeNpcRenderV158[0].drawn, true);
});
