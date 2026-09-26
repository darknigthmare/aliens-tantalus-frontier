import { ENEMY_USER_CREATIONS_V95 as USER_ADDITIONS } from '../src/enemy-user-creations-v95.js';
import { ENEMY_ADDITIONAL_POSES_V94 as ADDITIONAL } from '../src/enemy-additional-poses-v94.js';
import { ENEMY_DEDICATED_POSES_V97 } from '../src/enemy-dedicated-poses-v97.js';
import { ENEMY_STATIC_POSES_V96 as CURRENT_STATIC } from '../src/enemy-static-poses-v96.js';
const DEDICATED = ENEMY_DEDICATED_POSES_V97.filter(entry => entry.bioforgeEligible !== false);
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BIOFORGE_MAX_TOTAL_V87, BIOFORGE_TERRESTRIAL_ROSTER_V80,
  createBioforgeV80, validateBioforgeCompositionV87, configureBioforgeV80,
  startBioforgeSessionV80, advanceBioforgeSessionV80, recordBioforgeKillV80,
  finishBioforgeSessionV80, sanitizeBioforgeV80, buildBioforgePrintQueueV80,
  getBioforgeCapacityV87, appendBioforgeReinforcementsV87, cancelBioforgePendingV87,
  beginBioforgePurgeV80, completeBioforgePurgeV80, sanitizeBioforgeRuntimeV81
} from '../src/bioforge-session-v80.js';

const A = 'enemy-002-facehugger', B = 'enemy-006-runner', C = 'enemy-005-warrior';
const line = (lineId, profileId, quantity) => ({ lineId, profileId, quantity });
const three = [line('A', A, 6), line('B', B, 6), line('C', C, 6)];
const zero = { remainingEntities: 0, remainingProjectiles: 0, remainingHazards: 0, remainingEffects: 0, remainingTimers: 0 };
const clone = value => JSON.parse(JSON.stringify(value));
function ready(composition = three, maxConcurrent = 4) {
  let result = startBioforgeSessionV80(createBioforgeV80(), { composition, maxConcurrent }, { now: 100 });
  assert.equal(result.applied, true);
  result = advanceBioforgeSessionV80(result.state, { now: 101 });
  result = advanceBioforgeSessionV80(result.state, { now: 102 });
  assert.equal(result.session.phase, 'printing');
  return result;
}
const print = (state, now = 103, population) => advanceBioforgeSessionV80(state, { now, population });
const reload = state => sanitizeBioforgeV80(clone(state));

test('MIX separates allocation 48, concurrent 1..12 and budget12 from the admitted roster size', () => {
  assert.equal(BIOFORGE_MAX_TOTAL_V87, 48);
  assert.equal(BIOFORGE_TERRESTRIAL_ROSTER_V80.length, 11 + CURRENT_STATIC.length + DEDICATED.length);
  const valid = validateBioforgeCompositionV87({ composition: three, maxConcurrent: 4 });
  assert.equal(valid.ok, true); assert.equal(valid.totalQuantity, 18); assert.equal(valid.totalCost, 36);
  assert.equal(validateBioforgeCompositionV87({ composition: [line('A', C, 48)], maxConcurrent: 1 }).ok, true);
  for (const maxConcurrent of [0, 13, '4', 1.2, null])
    assert.equal(validateBioforgeCompositionV87({ composition: three, maxConcurrent }).ok, false);
  for (const composition of [[], null, [line('a', A, 49)], [line('a', A, 25), line('b', B, 24)],
    [line('a', A, '1')], [line('a', 'enemy-999-unvalidated', 1)], [line('a', A, 1), line('a', B, 1)],
    [line('__proto__', A, 1)], [line('constructor', A, 1)], [line('a b', A, 1)]])
    assert.equal(validateBioforgeCompositionV87({ composition }).ok, false, JSON.stringify(composition));
});

test('legacy configure/start accepts total18 and canonicalizes exactly one stable line', () => {
  const raw = createBioforgeV80(), before = clone(raw);
  const configured = configureBioforgeV80(raw, { profileId: A, quantity: 18, maxConcurrent: 2 });
  assert.equal(configured.applied, true);
  assert.deepEqual(configured.state.configuration.composition, [line('legacy-1', A, 18)]);
  const started = startBioforgeSessionV80(configured.state, null, { now: 0 });
  assert.equal(started.session.quantity, 18); assert.equal(started.session.maxConcurrent, 2);
  assert.deepEqual(raw, before);
  assert.deepEqual(reload(started.state), started.state);
});

test('round-robin unequal lines and repeated profiles retain line identity without silent merge', () => {
  const composition = [line('a', A, 3), line('b', B, 1), line('c', A, 2)];
  const queue = buildBioforgePrintQueueV80({ sessionId: 'bioforge-v80-s000000009', composition });
  assert.deepEqual(queue.map(entry => entry.lineId), ['a', 'b', 'c', 'a', 'c', 'a']);
  assert.deepEqual(queue.map(entry => entry.cost), [1, 2, 1, 1, 1, 1]);
  assert.equal(new Set(queue.map(entry => entry.id)).size, 6);
  assert.deepEqual(queue, buildBioforgePrintQueueV80({ sessionId: 'bioforge-v80-s000000009', composition }));
});

test('capacity blocks printing without consuming entry, timer or phase; a kill frees a real slot', () => {
  let result = ready();
  for (let i = 0; i < 4; i++) result = print(result.state, 103 + i);
  assert.deepEqual(result.session.queue.filter(entry => entry.printedAt !== null).map(entry => entry.lineId), ['A', 'B', 'C', 'A']);
  const before = clone(result.state), blocked = print(result.state, 99999);
  assert.equal(blocked.applied, false); assert.equal(blocked.reason, 'active-count-capacity');
  assert.deepEqual(blocked.state, before);
  result = recordBioforgeKillV80(result.state, result.session.aliveIds[0], { now: 107 });
  result = print(result.state, 108);
  assert.equal(result.event.lineId, 'B'); assert.equal(result.session.printedCount, 5);
  assert.equal(result.session.aliveIds.length, 4);
});

test('cost12 independently blocks the fifth warrior even with twelve concurrent slots', () => {
  let result = ready([line('heavy', C, 10)], 12);
  for (let i = 0; i < 4; i++) result = print(result.state, 103 + i);
  assert.equal(getBioforgeCapacityV87(result.session).activeCost, 12);
  assert.equal(print(result.state).reason, 'active-cost-capacity');
});

test('external descendants/reservations count conservatively and malformed population fails closed', () => {
  let result = print(ready().state);
  assert.equal(print(result.state, 104, { activeCount: 4, activeCost: 4 }).reason, 'active-count-capacity');
  assert.equal(print(result.state, 104, { activeCount: 1, activeCost: 11 }).reason, 'active-cost-capacity');
  assert.equal(print(result.state, 104, { activeCount: 1, activeCost: 1, reservedCount: 3, reservedCost: 3 }).reason, 'active-count-capacity');
  const projection = getBioforgeCapacityV87(result.session, { population: { activeCount: 0, activeCost: 0 } });
  assert.equal(projection.activeCount, 1); assert.equal(projection.activeCost, 1);
  for (const population of [null, {}, { activeCount: '1', activeCost: 0 }, { activeCount: 1, activeCost: -1 },
    { activeCount: 1, activeCost: 1, reservedCount: 0.5 }]) {
    const blocked = print(result.state, 105, population);
    assert.equal(blocked.reason, 'invalid-population'); assert.deepEqual(blocked.state, result.state);
  }
});

test('non-prefix cancellation survives reload; unprinted cancelled entries can never be killed', () => {
  let result = print(ready().state);
  const alive = [...result.session.aliveIds], old = clone(result.state);
  result = cancelBioforgePendingV87(result.state, { lineId: 'B', now: 104 });
  assert.equal(result.applied, true); assert.equal(result.event.cancelled, 6);
  assert.equal(result.session.quantity, 18); assert.deepEqual(result.session.aliveIds, alive);
  assert.deepEqual(old.activeSession.queue[1].status, 'queued');
  assert.deepEqual(reload(result.state), result.state);
  assert.equal(recordBioforgeKillV80(result.state, result.session.queue[1].id).reason, 'unknown-or-unprinted-specimen');
  result = print(result.state, 105);
  assert.equal(result.event.index, 2); assert.equal(result.event.lineId, 'C');
  assert.equal(result.session.printedCount, 2);
  result = recordBioforgeKillV80(result.state, result.event.specimenId, { now: 106 });
  assert.equal(result.applied, true); assert.equal(result.event.profileId, C);
  assert.deepEqual(reload(result.state), result.state);
});

test('cancel all only cancels waiting entries and transitions to combat with alive bodies untouched', () => {
  let result = print(ready().state);
  result = cancelBioforgePendingV87(result.state, { now: 104 });
  assert.equal(result.session.phase, 'combat'); assert.equal(result.session.cancelledIds.length, 17);
  assert.equal(result.session.aliveIds.length, 1); assert.equal(result.session.quantity, 18);
  assert.equal(cancelBioforgePendingV87(result.state).reason, 'no-pending-specimen');
  assert.equal(finishBioforgeSessionV80(result.state, { outcome: 'cleared' }).reason, 'batch-not-cleared');
});

test('append batches do not reorder old IDs and requests are atomic/idempotent across reload', () => {
  let result = print(ready([line('a', A, 3)], 2).state);
  const before = clone(result.state), oldQueue = clone(result.session.queue);
  const candidate = { composition: [line('b', B, 2), line('c', C, 2)] };
  result = appendBioforgeReinforcementsV87(result.state, candidate, { requestId: 'ui-request-1', now: 104 });
  assert.equal(result.applied, true); assert.equal(result.session.quantity, 7);
  assert.deepEqual(result.session.queue.slice(0, 3), oldQueue);
  assert.deepEqual(result.session.queue.map(entry => entry.lineId), ['a', 'a', 'a', 'b', 'c', 'b', 'c']);
  assert.deepEqual(before.activeSession.queue, oldQueue);
  assert.deepEqual(reload(result.state), result.state);
  const replay = appendBioforgeReinforcementsV87(reload(result.state), candidate, { requestId: 'ui-request-1', now: 99999 });
  assert.equal(replay.applied, true); assert.equal(replay.event.type, 'bioforge-reinforcements-replayed');
  assert.deepEqual(replay.state, result.state);
  const conflict = appendBioforgeReinforcementsV87(result.state, { composition: [line('b', B, 1)] }, { requestId: 'ui-request-1' });
  assert.equal(conflict.reason, 'reinforcement-request-conflict'); assert.deepEqual(conflict.state, result.state);
  assert.equal(appendBioforgeReinforcementsV87(result.state, candidate, { requestId: 'new-request' }).reason, 'duplicate-line-id');
});

test('cancelled and printed allocations consume quota48 forever; append never reuses their IDs', () => {
  let result = ready([line('first', A, 46)], 2);
  result = print(result.state);
  result = cancelBioforgePendingV87(result.state, { now: 104 });
  result = appendBioforgeReinforcementsV87(result.state, { composition: [line('last', B, 2)] }, { requestId: 'last-request', now: 105 });
  assert.equal(result.session.phase, 'printing'); assert.equal(result.session.quantity, 48);
  assert.equal(result.session.queue[46].id.endsWith('specimen-47'), true);
  assert.equal(result.session.queue[47].id.endsWith('specimen-48'), true);
  const blocked = appendBioforgeReinforcementsV87(result.state, { composition: [line('extra', A, 1)] }, { requestId: 'extra' });
  assert.equal(blocked.reason, 'composition-exceeds-total'); assert.deepEqual(blocked.state, result.state);
});

test('18 specimens clear by real capacity-sized waves; one history with per-profile actual records', () => {
  let result = ready(), clock = 103;
  while (getBioforgeCapacityV87(result.session).pending || result.session.aliveIds.length) {
    const capacity = getBioforgeCapacityV87(result.session);
    result = capacity.canPrint ? print(result.state, clock++)
      : recordBioforgeKillV80(result.state, result.session.aliveIds[0], { now: clock++ });
    assert.equal(result.applied, true);
    assert.ok(getBioforgeCapacityV87(result.session).activeCount <= 4);
    assert.ok(getBioforgeCapacityV87(result.session).activeCost <= 12);
    const state = reload(result.state); result = { ...result, state, session: state.activeSession };
  }
  assert.equal(finishBioforgeSessionV80(result.state, { outcome: 'cleared' }, { population: { activeCount: 1, activeCost: 1 } }).applied, false);
  assert.equal(finishBioforgeSessionV80(result.state, { outcome: 'cleared' }, { population: { activeCount: 0, activeCost: 0, reservedCount: 1 } }).applied, false);
  result = finishBioforgeSessionV80(result.state, { outcome: 'cleared', score: 360 }, { now: clock++ });
  assert.equal(result.applied, true); assert.equal(result.state.history.length, 1);
  assert.deepEqual(result.state.history[0].profileStats.map(row => [row.profileId, row.printed, row.kills, row.score]),
    [[A, 6, 6, 60], [B, 6, 6, 120], [C, 6, 6, 180]]);
  for (const id of [A, B, C]) {
    assert.equal(result.state.records[id].sessions, 1); assert.equal(result.state.records[id].kills, 6);
  }
  const before = clone(result.state.records);
  result = beginBioforgePurgeV80(result.state, 'done', { now: clock++ });
  result = completeBioforgePurgeV80(result.state, zero, { now: clock++ });
  assert.equal(result.state.history.length, 1); assert.deepEqual(result.state.records, before);
  assert.deepEqual(reload(result.state), result.state);
  assert.ok(result.session.queue.every(entry => entry.status === 'killed'));
});

test('unprinted profiles receive no records and cancelled lines retain accurate result counts', () => {
  let result = print(ready([line('a', A, 1), line('b', B, 2)]).state);
  result = cancelBioforgePendingV87(result.state, { now: 104 });
  result = recordBioforgeKillV80(result.state, result.session.aliveIds[0], { now: 105 });
  result = finishBioforgeSessionV80(result.state, { outcome: 'cleared', score: 99 }, { now: 106 });
  assert.equal(result.applied, true); assert.equal(result.state.records[A].printed, 1);
  assert.equal(result.state.records[B].sessions, 0); assert.equal(result.state.records[B].kills, 0);
  assert.equal(result.state.history[0].cancelled, 2);
  assert.deepEqual(result.state.history[0].profileStats[1], { profileId: B, quantity: 2, printed: 0, kills: 0, cancelled: 2, score: 0 });
});

test('failed session attributes failure only to an actually printed profile', () => {
  const result = finishBioforgeSessionV80(print(ready().state).state, { outcome: 'failed' }, { now: 104 });
  assert.equal(result.state.records[A].failures, 1); assert.equal(result.state.records[B].failures, 0);
  assert.equal(result.state.records[C].failures, 0);
});

test('corrupt canonical queue cannot recreate missing identities or accept profile/cost mutations', () => {
  const result = print(ready().state);
  for (const mutate of [
    root => root.activeSession.queue.splice(1, 1),
    root => root.activeSession.queue.push(clone(root.activeSession.queue[0])),
    root => { root.activeSession.queue[0].cost = 0; },
    root => { root.activeSession.queue[0].profileId = B; },
    root => { root.activeSession.queue[0].lineId = 'other'; },
    root => { root.activeSession.queue[0].index = 999; },
    root => { root.activeSession.queue[0].printedAt = null; },
    root => { root.activeSession.queue[0].cancelledAt = 103; },
    root => { root.activeSession.queueBatchesV87[0].lineIds.pop(); },
    root => { delete root.activeSession.queueBatchesV87; },
    root => { root.activeSession.maxConcurrent = 0; },
    root => { root.activeSession.queue[1].status = 'killed'; }
  ]) {
    const raw = clone(result.state); mutate(raw);
    const safe = reload(raw);
    assert.equal(safe.activeSession, null); assert.equal(safe.recovery.purgeRequired, true);
    assert.deepEqual(safe.rejectedSessionV87, raw.activeSession);
    assert.equal(startBioforgeSessionV80(safe).applied, false);
  }
});

test('MIX queue cardinality rejects foreign or missing entries without discarding the original payload', () => {
  const canonical = print(ready([line('one', A, 2)], 2).state).state;
  assert.deepEqual(reload(canonical), canonical);
  for (const mutate of [
    root => root.activeSession.queue.push({ ...clone(root.activeSession.queue[0]), id: 'foreign-specimen', index: 2 }),
    root => root.activeSession.queue.push(null),
    root => root.activeSession.queue.pop(),
    root => { root.activeSession.queue[1].id = 'foreign-specimen'; }
  ]) {
    const raw = clone(canonical); mutate(raw);
    const before = clone(raw), safe = sanitizeBioforgeV80(raw);
    assert.deepEqual(raw, before, 'validation must not mutate the imported ledger');
    assert.equal(safe.activeSession, null);
    assert.deepEqual(safe.recovery, { purgeRequired: true, reason: 'corrupt-active-session' });
    assert.deepEqual(safe.rejectedSessionV87, before.activeSession);
    assert.deepEqual(reload(safe), safe, 'repeated loading retains every rejected entry');
    assert.equal(startBioforgeSessionV80(safe).applied, false);
  }
});

test('future root/composition/session/history remains preserved and cannot be reset by purge', () => {
  for (const mutate of [root => { root.schema = 999; }, root => { root.configuration.mixSchemaV87 = 2; },
    root => { root.activeSession.mixSchemaV87 = 2; }, root => { root.history.push({ mixSchemaV87: 2, futurePayload: ['keep'] }); }]) {
    const raw = ready().state; mutate(raw);
    const safe = reload(raw);
    assert.equal(safe.recovery.purgeRequired, true); assert.ok(safe.unsupportedV87);
    assert.deepEqual(reload(safe), safe);
    assert.equal(startBioforgeSessionV80(safe).applied, false);
    assert.equal(completeBioforgePurgeV80(safe, zero).applied, false);
    assert.deepEqual(safe.unsupportedV87, raw);
  }
});

test('legacy printed/dead identities, timestamps and historical records migrate once without rebirth', () => {
  const modern = print(print(ready([line('legacy-1', A, 3)], 12).state).state, 104);
  const killed = recordBioforgeKillV80(modern.state, modern.session.queue[0].id, { now: 105 });
  const raw = clone(killed.state), old = raw.activeSession;
  for (const object of [raw.configuration, old]) {
    delete object.mixSchemaV87; delete object.composition;
  }
  delete old.queueBatchesV87; delete old.cancelledIds;
  for (const entry of old.queue) { delete entry.lineId; delete entry.cancelledAt; }
  raw.records[A].sessions = 7; raw.records[A].kills = 91;
  const migrated = reload(raw);
  assert.deepEqual(migrated.activeSession.queue.map(entry => [entry.id, entry.printedAt, entry.killedAt]),
    old.queue.map(entry => [entry.id, entry.printedAt, entry.killedAt]));
  assert.deepEqual(migrated.activeSession.aliveIds, old.aliveIds);
  assert.deepEqual(migrated.activeSession.killedIds, old.killedIds);
  assert.equal(migrated.records[A].sessions, 7); assert.equal(migrated.records[A].kills, 91);
  assert.deepEqual(reload(migrated), migrated);
});

test('physical snapshot absent stays legacy; invalid present remains marked across repeated sanitization', () => {
  const raw = { player: { x: 12, y: 600, facing: 1 }, phaseClock: 0, seed: 1 };
  assert.equal(Object.hasOwn(sanitizeBioforgeRuntimeV81(raw), 'physicalV87'), false);
  for (const invalid of [null, {}, { schema: 999 }]) {
    const runtime = sanitizeBioforgeRuntimeV81({ ...raw, physicalV87: invalid });
    assert.equal(runtime.physicalInvalidV87, true); assert.equal(runtime.physicalV87, null);
    assert.deepEqual(sanitizeBioforgeRuntimeV81(runtime), runtime);
  }
});

test('malformed killedIds never throws and cannot resurrect a queue entry with an actual death timestamp', () => {
  let result = print(ready().state);
  result = recordBioforgeKillV80(result.state, result.session.aliveIds[0], { now: 104 });
  const raw = clone(result.state); raw.activeSession.killedIds = {};
  const safe = reload(raw);
  assert.equal(safe.activeSession.queue[0].status, 'killed');
  assert.equal(safe.activeSession.killedIds.length, 1);
  assert.deepEqual(reload(safe), safe);
});

test('invalid current mixed history is preserved and blocked instead of silently disappearing', () => {
  let result = print(ready([line('only', A, 1)]).state);
  result = recordBioforgeKillV80(result.state, result.session.aliveIds[0], { now: 104 });
  result = finishBioforgeSessionV80(result.state, { outcome: 'cleared', score: 1 }, { now: 105 });
  const raw = clone(result.state); raw.history[0].profileStats[0].kills = 2;
  const safe = reload(raw);
  assert.equal(safe.recovery.reason, 'corrupt-history');
  assert.deepEqual(safe.invalidHistoryV87, raw.history);
  assert.deepEqual(reload(safe), safe);
  assert.equal(completeBioforgePurgeV80(safe, zero).applied, false);
});

test('recovery keeps the allocated serial even when a corrupted active queue is rejected', () => {
  const raw = ready().state; raw.serial = 0; raw.activeSession.queue.pop();
  let result = beginBioforgePurgeV80(raw, 'bad-queue', { now: 104 });
  assert.equal(result.state.serial, 1);
  result = completeBioforgePurgeV80(result.state, zero, { now: 105 });
  result = startBioforgeSessionV80(result.state, { profileId: A, quantity: 1 }, { now: 106 });
  assert.equal(result.applied, true); assert.equal(result.session.serial, 2);
});

test('forty-eight single-unit reinforcement batches preserve every ID and replay receipt', () => {
  let result = ready([line('first', A, 1)], 1);
  for (let index = 1; index < 48; index++) {
    result = appendBioforgeReinforcementsV87(result.state, { composition: [line(`line-${index}`, A, 1)] },
      { requestId: `request-${index}`, now: 103 + index });
    assert.equal(result.applied, true);
  }
  assert.equal(result.session.queue.length, 48); assert.equal(new Set(result.session.queue.map(entry => entry.id)).size, 48);
  assert.deepEqual(reload(result.state), result.state);
  const replay = appendBioforgeReinforcementsV87(result.state, { composition: [line('line-1', A, 1)] },
    { requestId: 'request-1', now: 99999 });
  assert.equal(replay.applied, true); assert.deepEqual(replay.state, result.state);
});
