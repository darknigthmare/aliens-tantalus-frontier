import test from 'node:test';
import assert from 'node:assert/strict';
import { ARBITER_OPERATIONS_V191 } from '../src/xeno-arbiter-protocols-v191.js';
import { XENO_TRIALS_OPERATIONS_V188, getXenoTrialsOperationV188 } from '../src/xeno-trials-operations-v188.js';
import { drawXenoTrialsOperationV188, getXenoTrialsOperationHudV188 } from '../src/xeno-trials-operation-presentation-v188.js';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, restoreXenoTrialsHordeMatchV180,
  setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_ARENA_V96 as arena } from '../src/xeno-trials-engine-v96.js';
import { autoTranslateV185, useCatalogV185 } from '../src/i18n-auto-v185.js';
import { EN_CATALOG_V185, EN_PATTERNS_V185 } from '../src/i18n-en-catalog-v185.js';
import { setLanguageV185 } from '../src/i18n-v185.js';

function fixture(id = 'xto188-extraction-1') {
  const entry = getXenoTrialsOperationV188(id);
  const match = createXenoTrialsMatchV96({ playerId: 'warrior', seed: 203, introSeconds: 0,
    activityV119: { branch: 'operations', id } });
  return { entry, match };
}

function advance(match, count, controls = {}) {
  for (let i = 0; i < count; i++) stepXenoTrialsMatchV96(match, 1 / 120, controls, {});
}

// Declare contact-position fixtures where needed. The native clock, commands,
// progress, ledger and results stay authoritative; CPU inputs are neutral.
function at(match, x, count) {
  match.fighters[0].x = x;
  advance(match, count, { interact: true });
}

function render(match, reducedMotion = false, plane = 'rear') {
  const calls = [];
  const ctx = new Proxy({}, { get(target, name) {
    return name in target ? target[name] : (...args) => calls.push({ name, args });
  } });
  const receipt = drawXenoTrialsOperationV188(ctx, match, arena, { plane, reducedMotion });
  return { scene: receipt?.extraction, calls };
}

test('pickup follows physical contact, removes its origin prop, and carries the same crate through motion and restore', () => {
  let { entry, match } = fixture();
  const crate = entry.objectives[1];
  match.fighters[0].x = crate.x;
  const initial = render(match).scene;
  assert.deepEqual(initial.staged.map(object => object.id), entry.objectives.map(object => object.id));
  assert.equal(initial.carried, null);
  assert.equal(initial.airlock.phase, 'locked');
  assert.equal(initial.airlock.doorGap, 0);

  at(match, crate.x, 12);
  const work = getXenoTrialsOperationHudV188(match).extractionWorkV203;
  assert.deepEqual(work, { id: crate.id, kind: 'supply', contact: true, progress: 12, requiredTicks: 36, percent: 33 });
  advance(match, crate.requiredTicks - 12, { interact: true });
  assert.equal(match.operationV188.carrying, 1);
  const taken = render(match).scene;
  assert.equal(taken.carried.id, crate.id);
  assert.ok(!taken.staged.some(object => object.id === crate.id));
  assert.equal(taken.depot.slots[1].occupied, false);
  assert.equal(getXenoTrialsOperationHudV188(match).target.id, 'depot');
  const front = render(match, false, 'front');
  assert.equal(front.scene, undefined);
  assert.ok(!front.calls.some(({ name, args }) => name === 'moveTo' && args[0] === crate.x - crate.radius && args[1] === arena.floor + 9));

  advance(match, 18, { left: true, jump: true });
  const moved = render(match).scene.carried;
  assert.ok(moved.elevation > 0);
  assert.equal(moved.operatorX, match.fighters[0].x);
  assert.notEqual(moved.operatorX, taken.carried.operatorX);
  assert.equal(taken.carried.y - moved.y, moved.elevation);
  assert.equal(moved.facing, match.fighters[0].facing);

  assert.equal(setXenoTrialsPausedV96(match, true), true);
  const snapshot = getXenoTrialsSnapshotV96(match);
  advance(match, 60, { interact: true });
  assert.deepEqual(getXenoTrialsSnapshotV96(match), snapshot);
  const restored = restoreXenoTrialsHordeMatchV180(JSON.parse(JSON.stringify(snapshot)));
  assert.ok(restored?.paused);
  assert.deepEqual(render(restored).scene, render(match).scene);
  assert.equal(setXenoTrialsPausedV96(restored, false), true);
  match = restored;
  advance(match, 180);
  at(match, entry.depot.x, entry.depot.requiredTicks);
  const delivered = render(match).scene;
  assert.equal(delivered.carried, null);
  assert.ok(!delivered.staged.some(object => object.id === crate.id));
  assert.ok(delivered.depot.slots[1].occupied);
  assert.equal(delivered.airlock.phase, 'locked');
});

test('depot slots and the rear airlock obey the ledger, held interaction, reset, and actual terminal opening', () => {
  const { entry, match } = fixture();
  at(match, entry.exit.x, entry.exit.requiredTicks);
  assert.equal(match.operationV188.exitTicks, 0);
  assert.equal(render(match).scene.airlock.phase, 'locked');
  for (const [index, crate] of entry.objectives.entries()) {
    at(match, crate.x, crate.requiredTicks);
    at(match, entry.depot.x, 24);
    assert.equal(render(match).scene.depot.progress, .4);
    const work = getXenoTrialsOperationHudV188(match).extractionWorkV203;
    assert.equal(work.kind, 'depot');
    assert.equal(work.percent, 40);
    assert.equal(render(match).scene.depot.slots[index].occupied, false);
    at(match, entry.depot.x, entry.depot.requiredTicks - 24);
    assert.equal(render(match).scene.depot.slots[index].occupied, true);
    assert.equal(render(match).scene.depot.slots.filter(slot => slot.occupied).length, index + 1);
  }
  const ready = render(match).scene.airlock;
  assert.equal(ready.phase, 'ready');
  assert.equal(ready.doorGap, 0);
  assert.equal(match.result, null);
  at(match, entry.exit.x, 24);
  const before = getXenoTrialsSnapshotV96(match);
  const charge = render(match).scene.airlock, fixed = render(match, true).scene.airlock;
  assert.equal(charge.phase, 'charging');
  assert.equal(charge.progress, 24 / entry.exit.requiredTicks);
  assert.equal(charge.doorGap, 0);
  assert.equal(getXenoTrialsOperationHudV188(match).extractionWorkV203.kind, 'exit');
  assert.ok(charge.box.bottom < arena.floor);
  assert.deepEqual(getXenoTrialsSnapshotV96(match), before);

  advance(match, 2, { interact: true });
  assert.equal(render(match, true).scene.airlock.scanY, fixed.scanY);
  assert.notEqual(render(match).scene.airlock.scanY, charge.scanY);
  advance(match, 1);
  assert.equal(render(match).scene.airlock.phase, 'ready');
  assert.equal(render(match).scene.airlock.progress, 0);

  at(match, entry.exit.x, entry.exit.requiredTicks - 1);
  assert.equal(render(match).scene.airlock.phase, 'charging');
  assert.equal(render(match).scene.airlock.doorGap, 0);
  assert.equal(match.result, null);
  advance(match, 1, { interact: true });
  assert.equal(match.result?.reason, 'operation-complete');
  const open = render(match).scene.airlock;
  assert.equal(open.phase, 'open');
  assert.equal(open.progress, 1);
  assert.ok(open.doorGap > 0);
  assert.equal(open.scanY, null);
  assert.equal(getXenoTrialsOperationHudV188(match).extractionWorkV203, null);
});

test('all base and Arbiter extraction props share their actual canonically authored anchors', () => {
  const entries = [...XENO_TRIALS_OPERATIONS_V188, ...ARBITER_OPERATIONS_V191].filter(entry => entry.kind === 'extraction');
  assert.equal(entries.length, 12);
  for (const entry of entries) {
    const { match } = fixture(entry.id);
    const before = getXenoTrialsSnapshotV96(match);
    const { scene, calls } = render(match);
    assert.deepEqual(scene.staged, entry.objectives.map(({ id, x }) => ({ id, x })), entry.id);
    assert.equal(scene.airlock.x, entry.exit.x, entry.id);
    assert.equal(scene.depot.x, entry.depot.x, entry.id);
    assert.equal(scene.depot.slots.filter(slot => slot.occupied).length, 0, entry.id);
    assert.ok(calls.some(({ name, args }) => name === 'rect' && args[0] === scene.airlock.box.left));
    assert.deepEqual(getXenoTrialsSnapshotV96(match), before, entry.id);
  }
  assert.equal(render(fixture('xto188-relay-1').match).scene, undefined);
});

test('the extraction work percentage stays out of the stable announcement and translates in the compact HUD', () => {
  const { entry, match } = fixture();
  at(match, entry.objectives[1].x, 12);
  const view = getXenoTrialsOperationHudV188(match);
  const amount = ` · ${view.extractionWorkV203.percent} %`;
  assert.doesNotMatch(view.instruction, /%/);
  assert.equal(autoTranslateV185(view.instruction) + autoTranslateV185(amount), 'Caisson 2 · MAINTENEZ INTERAGIR · 33 %');
  useCatalogV185({ EN_CATALOG_V185, EN_PATTERNS_V185 });
  setLanguageV185('en', { document: null, persist: false });
  try { assert.equal(autoTranslateV185(view.instruction) + autoTranslateV185(amount), 'Crate 2 · HOLD INTERACT · 33 %'); }
  finally { setLanguageV185('fr', { document: null, persist: false }); }
});
