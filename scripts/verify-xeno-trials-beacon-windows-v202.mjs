import test from 'node:test';
import assert from 'node:assert/strict';
import { ARBITER_OPERATIONS_V191 } from '../src/xeno-arbiter-protocols-v191.js';
import { XENO_TRIALS_OPERATIONS_V188, getXenoTrialsOperationViewV188 } from '../src/xeno-trials-operations-v188.js';
import { drawXenoTrialsOperationV188, getXenoTrialsOperationHudV188 } from '../src/xeno-trials-operation-presentation-v188.js';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, restoreXenoTrialsHordeMatchV180,
  setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_ARENA_V96 } from '../src/xeno-trials-engine-v96.js';
import { autoTranslateV185, useCatalogV185 } from '../src/i18n-auto-v185.js';
import { EN_CATALOG_V185, EN_PATTERNS_V185 } from '../src/i18n-en-catalog-v185.js';
import { setLanguageV185 } from '../src/i18n-v185.js';

function create(id = 'xto188-beacon-1') {
  return createXenoTrialsMatchV96({ playerId: 'warrior', seed: 202, introSeconds: 0,
    activityV119: { branch: 'operations', id } });
}
function secondBeacon() {
  const match = create();
  // Isolate a held command at actual physical contact. Reposition only the
  // actors, then let the native engine own the clock and beacon progress.
  match.fighters[0].x = 650;
  for (const [index, enemy] of match.fighters.slice(1).entries()) enemy.x = [100, 1000, 1320][index];
  return match;
}
function advance(match, count, interact = false) {
  for (let i = 0; i < count; i++) stepXenoTrialsMatchV96(match, 1 / 120, { interact }, {});
}
function canvas() {
  const calls = [];
  const ctx = new Proxy({}, { get(target, name) {
    return name in target ? target[name] : (...args) => calls.push({ name, args });
  } });
  return { ctx, calls };
}

test('physical contact selects the second beacon and the HUD asks to hold only during its native green window', () => {
  let match = secondBeacon();
  const closed = getXenoTrialsOperationHudV188(match);
  assert.equal(closed.target.id, 'beacon-2');
  assert.equal(closed.instruction, 'FENÊTRE FERMÉE · Balise 2');
  assert.deepEqual(closed.beaconWindow, { id: 'beacon-2', open: false, contact: true, remainingTicks: 210, seconds: 2 });
  advance(match, 209, true);
  assert.equal(match.operationV188.progress[1], 0);
  const before = getXenoTrialsOperationHudV188(match);
  assert.equal(before.beaconWindow.remainingTicks, 1);
  assert.equal(before.instruction, closed.instruction, 'the announcement remains stable within the same phase');

  assert.equal(setXenoTrialsPausedV96(match, true), true);
  const snapshot = getXenoTrialsSnapshotV96(match);
  advance(match, 60, true);
  assert.deepEqual(getXenoTrialsSnapshotV96(match), snapshot);
  const restored = restoreXenoTrialsHordeMatchV180(JSON.parse(JSON.stringify(snapshot)));
  assert.ok(restored?.paused);
  assert.deepEqual(getXenoTrialsOperationHudV188(restored).beaconWindow, before.beaconWindow);
  setXenoTrialsPausedV96(restored, false);
  match = restored;
  advance(match, 1);
  const opened = getXenoTrialsOperationHudV188(match);
  assert.equal(match.operationV188.elapsedTicks, 210);
  assert.equal(opened.instruction, 'FENÊTRE VERTE · Balise 2 · MAINTENEZ INTERAGIR');
  assert.deepEqual(opened.beaconWindow, { id: 'beacon-2', open: true, contact: true, remainingTicks: 240, seconds: 2 });
  advance(match, 108, true);
  assert.deepEqual(match.operationV188.completed, [false, true, false]);
  assert.equal(match.result, null);
  assert.equal(getXenoTrialsOperationHudV188(match).target.id, 'beacon-1');
});

test('the last green tick still charges, then the closed window decays and reports the actual next opening', () => {
  const match = secondBeacon();
  advance(match, 448);
  advance(match, 1, true);
  assert.equal(getXenoTrialsOperationHudV188(match).beaconWindow.remainingTicks, 1);
  assert.equal(match.operationV188.progress[1], 1);
  advance(match, 1, true);
  assert.equal(match.operationV188.elapsedTicks, 450);
  assert.equal(match.operationV188.progress[1], 0);
  const closed = getXenoTrialsOperationHudV188(match).beaconWindow;
  assert.equal(closed.open, false);
  assert.equal(closed.remainingTicks, 480);
  advance(match, 479);
  assert.equal(getXenoTrialsOperationHudV188(match).beaconWindow.remainingTicks, 1);
  advance(match, 1, true);
  assert.equal(match.operationV188.elapsedTicks, 930);
  assert.equal(match.operationV188.progress[1], 1);
  assert.equal(getXenoTrialsOperationHudV188(match).beaconWindow.open, true);
});

test('all base and Arbiter beacon presets expose accurate clock boundaries for each receiver', () => {
  const entries = [...XENO_TRIALS_OPERATIONS_V188, ...ARBITER_OPERATIONS_V191].filter(entry => entry.kind === 'beacon');
  assert.equal(entries.length, 12);
  for (const entry of entries) {
    const match = create(entry.id);
    for (const [index, objective] of entry.objectives.entries()) {
      const start = objective.windowStartTicks, end = start + objective.windowTicks;
      // Read-only view fixture for every authored first opening, closing and wrap.
      for (const [elapsedTicks, open, remaining] of [[start - 1, false, 1], [start, true, objective.windowTicks],
        [end - 1, true, 1], [end, false, objective.periodTicks - objective.windowTicks],
        [objective.periodTicks + start, true, objective.windowTicks]]) {
        match.operationV188.elapsedTicks = elapsedTicks;
        const beacon = getXenoTrialsOperationViewV188(match).entities[index];
        assert.equal(beacon.windowOpen, open, entry.id);
        assert.equal(beacon.windowRemainingTicks, remaining, entry.id);
      }
    }
  }
});

test('real receiver anchors emit bounded rear beams and freeze the shutter animation in reduced motion', () => {
  const match = secondBeacon();
  const render = (reducedMotion = false, plane = 'rear') => {
    const { ctx, calls } = canvas();
    const receipt = drawXenoTrialsOperationV188(ctx, match, XENO_TRIALS_ARENA_V96, { plane, reducedMotion });
    return { calls, beacons: receipt.beacons, second: receipt.beacons?.[1] };
  };
  const closed = render();
  assert.equal(closed.second.phase, 'closed');
  assert.equal(closed.second.x, 650);
  assert.ok(closed.second.clip.y + closed.second.clip.height < XENO_TRIALS_ARENA_V96.floor);
  assert.equal(closed.calls.some(call => call.name === 'fill'), false);
  advance(match, 210);
  const snapshot = getXenoTrialsSnapshotV96(match);
  const open = render(), still = render(true);
  assert.equal(open.second.phase, 'open');
  assert.equal(open.second.remainingTicks, 240);
  assert.equal(open.second.x, closed.second.x);
  assert.ok(open.calls.some(call => call.name === 'fill'));
  assert.equal(render(false, 'front').beacons, undefined);
  assert.deepEqual(getXenoTrialsSnapshotV96(match), snapshot);
  advance(match, 20);
  assert.ok(render().second.opening > open.second.opening);
  assert.equal(render(true).second.opening, still.second.opening);
  advance(match, 108, true);
  assert.equal(render().second.phase, 'synchronized');
  assert.equal(render().second.remainingTicks, 0);
  assert.equal(render(true).second.opening, render().second.opening);
});

test('window cues and compact contact controls use the active project language without countdown announcements', () => {
  const match = secondBeacon();
  const closed = getXenoTrialsOperationHudV188(match).instruction;
  advance(match, 210);
  const open = getXenoTrialsOperationHudV188(match).instruction;
  assert.equal(autoTranslateV185(closed), closed);
  useCatalogV185({ EN_CATALOG_V185, EN_PATTERNS_V185 });
  setLanguageV185('en', { document: null, persist: false });
  try {
    assert.equal(autoTranslateV185(`${closed} · 2 s`), 'WINDOW CLOSED · Beacon 2 · 2 s');
    assert.equal(autoTranslateV185(`${open} · 2 s`), 'GREEN WINDOW · Beacon 2 · HOLD INTERACT · 2 s');
    assert.equal(autoTranslateV185(`OPÉRATION ACTIVE · ${open}`), 'ACTIVE OPERATION · GREEN WINDOW · Beacon 2 · HOLD INTERACT');
  } finally { setLanguageV185('fr', { document: null, persist: false }); }
  assert.doesNotMatch(open, /\d\s*s$/);
  const escort = getXenoTrialsOperationHudV188(create('xto188-escort-1'));
  assert.equal(escort.beaconWindow, null);
  assert.match(escort.instruction, /MAINTENEZ INTERAGIR/);
});
