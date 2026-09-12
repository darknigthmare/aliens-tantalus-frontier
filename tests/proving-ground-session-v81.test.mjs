import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PROVING_GROUND_DURATION_SECONDS_V81,
  PROVING_GROUND_INITIAL_MAGAZINE_V81,
  PROVING_GROUND_INITIAL_RESERVE_V81,
  PROVING_GROUND_RELOAD_SECONDS_V81,
  PROVING_GROUND_STATE_KEY_V81,
  abortProvingGroundSessionV81,
  armProvingGroundSessionV81,
  beginProvingGroundSessionV81,
  claimProvingGroundCompletionV81,
  createProvingGroundSessionStateV81,
  fireProvingGroundShotV81,
  getCurrentProvingGroundTargetV81,
  registerProvingGroundTargetHitV81,
  requestProvingGroundReloadV81,
  tickProvingGroundSessionV81
} from '../src/proving-ground-session-v81.js';

function tickFor(state, seconds) {
  let next = state;
  for (let remaining = seconds; remaining > 0; remaining -= 0.05) {
    next = tickProvingGroundSessionV81(next, Math.min(0.05, remaining));
  }
  return next;
}

function hitCurrent(state) {
  const target = getCurrentProvingGroundTargetV81(state);
  assert.ok(target);
  const fired = fireProvingGroundShotV81(state, target.lane);
  assert.equal(fired.fired, true);
  const hit = registerProvingGroundTargetHitV81(fired.state, target.id);
  assert.equal(hit.applied, true);
  return hit.state;
}

test('la session V81 est armée puis commence uniquement avec son chargeur local M41A', () => {
  const idle = createProvingGroundSessionStateV81({
    weaponId: 'forged',
    projectiles: [{ x: 1 }],
    ammo: { magazine: 999, reserve: 999 }
  });
  assert.equal(idle.phase, 'idle');
  assert.equal(idle.weaponId, 'M41A Pulse Rifle');
  assert.equal(Object.hasOwn(idle, 'projectiles'), false);

  const armed = armProvingGroundSessionV81(idle);
  assert.equal(armed.phase, 'armed');
  assert.equal(armed.sessionId, 'm41a-qualification-v81:session-1');
  assert.equal(armed.currentTargetIndex, -1);

  const active = beginProvingGroundSessionV81(armed);
  assert.equal(active.phase, 'active');
  assert.equal(active.targets.length, 9);
  assert.equal(active.targets.filter((target) => target.status === 'active').length, 1);
  assert.equal(active.ammo.magazine, PROVING_GROUND_INITIAL_MAGAZINE_V81);
  assert.equal(active.ammo.reserve, PROVING_GROUND_INITIAL_RESERVE_V81);
  assert.equal(active.remainingSeconds, PROVING_GROUND_DURATION_SECONDS_V81);
  assert.equal(PROVING_GROUND_STATE_KEY_V81, 'provingGroundV81');
});
test('quatre cartouches imposent une recharge manuelle complète avant les cinq dernières cibles', () => {
  let state = beginProvingGroundSessionV81(armProvingGroundSessionV81());
  for (let index = 0; index < 4; index += 1) state = hitCurrent(state);
  assert.equal(state.ammo.magazine, 0);
  assert.equal(state.hits, 4);
  const empty = fireProvingGroundShotV81(state, 'level');
  assert.equal(empty.fired, false);
  assert.equal(empty.reason, 'empty-magazine');

  const reload = requestProvingGroundReloadV81(state);
  assert.equal(reload.started, true);
  state = tickFor(reload.state, PROVING_GROUND_RELOAD_SECONDS_V81 - 0.05);
  assert.equal(state.reload.active, true);
  assert.equal(state.reloadCount, 0);
  state = tickFor(state, 0.06);
  assert.equal(state.reload.active, false);
  assert.equal(state.reloadCount, 1);
  assert.equal(state.ammo.magazine, PROVING_GROUND_INITIAL_RESERVE_V81);
  assert.equal(state.ammo.reserve, 0);

  while (state.phase === 'active') state = hitCurrent(state);
  assert.equal(state.phase, 'completed');
  assert.equal(state.hits, 9);
  assert.equal(state.laneHits.high, 3);
  assert.equal(state.laneHits.level, 3);
  assert.equal(state.laneHits.low, 3);
  assert.ok(state.completionReceipt);
  assert.deepEqual(state.completionReceipt.bonus, { nextOperationCharge: true });
  assert.equal(state.completionReceipt.powerLoaderCertified, false);
  assert.equal(state.completionReceipt.advancedTutorialsComplete, false);
});

test('le reçu final est réclamable une seule fois et une session insuffisante ne produit aucun bonus', () => {
  let state = beginProvingGroundSessionV81(armProvingGroundSessionV81());
  for (let index = 0; index < 4; index += 1) state = hitCurrent(state);
  state = requestProvingGroundReloadV81(state).state;
  state = tickFor(state, PROVING_GROUND_RELOAD_SECONDS_V81 + 0.01);
  while (state.phase === 'active') state = hitCurrent(state);
  const receiptId = state.completionReceipt.id;
  const claimed = claimProvingGroundCompletionV81(state, receiptId);
  assert.equal(claimed.applied, true);
  assert.equal(claimed.receipt.idempotencyKey, receiptId);
  const duplicate = claimProvingGroundCompletionV81(claimed.state, receiptId);
  assert.equal(duplicate.applied, false);
  assert.equal(duplicate.duplicate, true);
  assert.deepEqual(duplicate.state.claimedReceiptIds, [receiptId]);

  let failed = beginProvingGroundSessionV81(armProvingGroundSessionV81(claimed.state));
  failed = tickFor(failed, PROVING_GROUND_DURATION_SECONDS_V81);
  assert.equal(failed.phase, 'failed');
  assert.equal(failed.completionReceipt, null);
  assert.equal(claimProvingGroundCompletionV81(failed, receiptId).applied, false);
});

test('timeout, abandon et sanitizer ne fabriquent ni cible touchée ni certification', () => {
  let state = beginProvingGroundSessionV81(armProvingGroundSessionV81());
  state = tickFor(state, 5.6);
  assert.equal(state.currentTargetIndex, 1);
  assert.equal(state.targets[0].status, 'missed');
  assert.equal(state.targets[1].status, 'active');
  assert.equal(state.hits, 0);

  const aborted = abortProvingGroundSessionV81(state);
  assert.equal(aborted.phase, 'aborted');
  assert.equal(aborted.completionReceipt, null);
  assert.equal(aborted.qualification.qualified, false);
  assert.ok(aborted.targets.every((target) => target.status === 'queued'));

  const forged = createProvingGroundSessionStateV81({
    phase: 'completed',
    sessionOrdinal: 3,
    reloadCount: 0,
    targets: Array.from({ length: 9 }, (_, index) => ({
      id: `forged-${index}`,
      lane: 'level',
      status: 'hit'
    })),
    completionReceipt: { bonus: { nextOperationCharge: true } },
    powerLoaderCertified: true,
    advancedTutorialsComplete: true
  });
  assert.equal(forged.phase, 'failed');
  assert.equal(forged.hits, 0);
  assert.equal(forged.completionReceipt, null);
  assert.equal(Object.hasOwn(forged, 'powerLoaderCertified'), false);
});

test('la reprise JSON conserve cible, munitions et recharge mais jamais les projectiles', () => {
  let state = beginProvingGroundSessionV81(armProvingGroundSessionV81());
  state = hitCurrent(state);
  state = hitCurrent(state);
  state = requestProvingGroundReloadV81(state).state;
  state = tickFor(state, 0.4);
  const stored = JSON.parse(JSON.stringify({
    ...state,
    projectiles: [{ x: 900, vx: 860 }],
    impacts: [{ x: 900 }]
  }));
  const restored = createProvingGroundSessionStateV81(stored);
  assert.equal(restored.phase, 'active');
  assert.equal(restored.currentTargetIndex, 2);
  assert.deepEqual(restored.targets.map((target) => target.status).slice(0, 4), ['hit', 'hit', 'active', 'queued']);
  assert.equal(restored.ammo.magazine, 2);
  assert.equal(restored.ammo.reserve, 95);
  assert.equal(restored.reload.active, true);
  assert.ok(restored.reload.remainingSeconds < PROVING_GROUND_RELOAD_SECONDS_V81);
  assert.equal(Object.hasOwn(restored, 'projectiles'), false);
  assert.equal(Object.hasOwn(restored, 'impacts'), false);
});
