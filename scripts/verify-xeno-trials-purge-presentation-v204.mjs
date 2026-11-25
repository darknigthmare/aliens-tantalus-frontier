import test from 'node:test';
import assert from 'node:assert/strict';
import { ARBITER_OPERATIONS_V191 } from '../src/xeno-arbiter-protocols-v191.js';
import { XENO_TRIALS_OPERATIONS_V188, getXenoTrialsOperationV188 } from '../src/xeno-trials-operations-v188.js';
import { drawXenoTrialsOperationV188, getXenoTrialsOperationHudV188 } from '../src/xeno-trials-operation-presentation-v188.js';
import { getXenoTrialsStageHazardViewV188 } from '../src/xeno-trials-stage-hazards-v188.js';
import { getXenoTrialsBodyBoundsV105 } from '../src/xeno-trials-geometry-v105.js';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, restoreXenoTrialsHordeMatchV180,
  setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_ARENA_V96 as arena } from '../src/xeno-trials-engine-v96.js';
import { autoTranslateV185, useCatalogV185 } from '../src/i18n-auto-v185.js';
import { EN_CATALOG_V185, EN_PATTERNS_V185 } from '../src/i18n-en-catalog-v185.js';
import { setLanguageV185 } from '../src/i18n-v185.js';

function fixture(id = 'xto188-purge-1', playerId = 'warrior') {
  const entry = getXenoTrialsOperationV188(id);
  const match = createXenoTrialsMatchV96({ playerId, seed: 204, introSeconds: 0,
    activityV119: { branch: 'operations', id } });
  return { entry, match };
}

function advance(match, count, interact = false) {
  for (let i = 0; i < count; i++) stepXenoTrialsMatchV96(match, 1 / 120, { interact }, {});
}

function render(match, reducedMotion = false, plane = 'rear') {
  const calls = [];
  const ctx = new Proxy({}, { get(target, name) {
    return name in target ? target[name] : (...args) => calls.push({ name, args });
  } });
  const receipt = drawXenoTrialsOperationV188(ctx, match, arena, { plane, reducedMotion });
  return { scene: receipt?.purge, calls };
}

const hud = match => getXenoTrialsOperationHudV188(match).purgeV204;

test('the physically touched valve regrows and sealing it changes the next native pressure loss', () => {
  let { entry, match } = fixture();
  const valve = entry.objectives[1];
  // Spatial fixtures put the operator at the valve and then outside its reach.
  // The native command, growth, pressure cycle, integrity and clock stay live.
  match.fighters[0].x = valve.x;
  assert.deepEqual(hud(match).pressure, { open: 3, expectedLoss: 3, integrity: 100, remainingTicks: 240,
    seconds: 2, nextLossTick: 240, phase: 'building' });
  assert.equal(hud(match).work.id, valve.id);
  advance(match, 45, true);
  const partial = render(match).scene.vents[1];
  assert.equal(partial.charge, 45);
  assert.equal(partial.phase, 'partial');
  assert.equal(hud(match).work.percent, Math.floor(4500 / valve.requiredTicks));
  match.fighters[0].x = -550;
  advance(match, 194, false);
  const warning = hud(match);
  const regrown = render(match).scene.vents[1];
  assert.equal(regrown.charge, 34);
  assert.ok(regrown.gap > partial.gap);
  assert.equal(warning.pressure.phase, 'warning');
  assert.equal(warning.pressure.remainingTicks, 1);
  assert.equal(warning.pressure.expectedLoss, 3);

  assert.equal(setXenoTrialsPausedV96(match, true), true);
  const snapshot = getXenoTrialsSnapshotV96(match);
  advance(match, 400);
  assert.deepEqual(getXenoTrialsSnapshotV96(match), snapshot);
  const restored = restoreXenoTrialsHordeMatchV180(JSON.parse(JSON.stringify(snapshot)));
  assert.ok(restored?.paused);
  assert.deepEqual(hud(restored).pressure, warning.pressure);
  assert.deepEqual(render(restored).scene, render(match).scene);
  setXenoTrialsPausedV96(restored, false);
  match = restored;
  advance(match, 1);
  assert.equal(match.operationV188.integrity, 97);
  assert.equal(hud(match).pressure.nextLossTick, 480);

  match.fighters[0].x = valve.x;
  advance(match, valve.requiredTicks - regrown.charge, true);
  const sealed = render(match).scene.vents[1];
  assert.equal(sealed.phase, 'sealed');
  assert.equal(sealed.charge, valve.requiredTicks);
  assert.equal(sealed.gap, 0);
  assert.equal(sealed.plumeHeight, 0);
  assert.equal(hud(match).pressure.expectedLoss, 2);
  advance(match, 480 - match.tick);
  assert.equal(match.operationV188.integrity, 95);
});

test('escape markers clear the true hazard with either body facing, and a marked route avoids native damage', () => {
  const { match } = fixture('xto188-purge-1', 'queen');
  advance(match, 839);
  const hazard = getXenoTrialsStageHazardViewV188(match), zone = hazard.zones[0];
  assert.equal(hazard.phase, 'warning');
  assert.equal(hazard.startsTick, 840);
  const player = match.fighters[0];
  // Spatial fixture starts inside the exact authored damage volume.
  player.x = zone.left + 8;
  player.y = 0;
  const escape = hud(match).escape;
  assert.equal(escape.preferred, 'left');
  assert.deepEqual(escape.zone, zone);
  assert.equal(escape.routes.length, 2);
  for (const route of escape.routes) {
    for (const facing of [-1, 1]) {
      const bounds = getXenoTrialsBodyBoundsV105({ ...player, x: route.x, facing });
      assert.ok(route.direction === 'left' ? bounds.right < zone.left : bounds.left > zone.right);
    }
  }
  const safe = structuredClone(match);
  safe.fighters[0].x = escape.routes[0].x;
  assert.equal(hud(safe).escape, null);
  const above = structuredClone(match);
  above.fighters[0].y = zone.top;
  assert.equal(hud(above).escape, null);
  const receipt = render(match).scene;
  assert.deepEqual(receipt.escape, escape);
  assert.equal(render(match, false, 'front').scene, undefined);
  advance(match, 1);
  advance(safe, 1);
  assert.equal(match.stageHazardsV188.playerDamage, hazard.damage);
  assert.equal(safe.stageHazardsV188.playerDamage, 0);
});

test('the twelve Purge protocols keep rear machinery at authored conduit positions with a fixed reduced-motion plume', () => {
  const entries = [...XENO_TRIALS_OPERATIONS_V188, ...ARBITER_OPERATIONS_V191].filter(entry => entry.kind === 'purge');
  assert.equal(entries.length, 12);
  for (const entry of entries) {
    const { match } = fixture(entry.id), before = getXenoTrialsSnapshotV96(match);
    const { scene, calls } = render(match);
    assert.deepEqual(scene.vents.map(({ id, x }) => ({ id, x })), entry.objectives.map(({ id, x }) => ({ id, x })));
    assert.ok(scene.vents.every(vent => vent.clip.y + vent.clip.height === arena.floor));
    assert.ok(calls.some(({ name }) => name === 'clip'));
    assert.deepEqual(scene.pressure, hud(match).pressure);
    assert.deepEqual(getXenoTrialsSnapshotV96(match), before);
    advance(match, 30);
    assert.notEqual(render(match).scene.vents[0].sway, scene.vents[0].sway);
    const stationary = render(match, true).scene;
    assert.ok(stationary.vents.every(vent => vent.sway === 0));
    assert.equal(stationary.vents[0].plumeHeight, scene.vents[0].plumeHeight);
  }
  assert.equal(render(fixture('xto188-relay-1').match).scene, undefined);
});

test('a completed Purge keeps each valve sealed without stale pressure or escape warnings', () => {
  const { match, entry } = fixture();
  for (const valve of entry.objectives) {
    match.fighters[0].x = valve.x;
    advance(match, valve.requiredTicks, true);
  }
  assert.equal(match.result?.reason, 'operation-complete');
  assert.equal(hud(match), null);
  const { scene } = render(match);
  assert.equal(scene.pressure, null);
  assert.equal(scene.escape, null);
  assert.ok(scene.vents.every(vent => vent.phase === 'sealed' && vent.gap === 0 && vent.plumeHeight === 0));
});

test('the pressure and evacuation instructions use the current project language', () => {
  const alert = 'DANGER ANNONCÉ · ARC ÉLECTRIQUE · SORTIE DE ZONE · ←';
  assert.equal(autoTranslateV185(alert), alert);
  useCatalogV185({ EN_CATALOG_V185, EN_PATTERNS_V185 });
  setLanguageV185('en', { document: null, persist: false });
  try {
    assert.equal(autoTranslateV185('PRESSION DU CONFINEMENT'), 'CONTAINMENT PRESSURE');
    assert.equal(autoTranslateV185(alert), 'HAZARD WARNING · ELECTRICAL ARC · CLEAR THE HAZARD · ←');
  } finally { setLanguageV185('fr', { document: null, persist: false }); }
});
