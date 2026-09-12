import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BIOFORGE_DEFAULT_PROFILE_ID_V80,
  BIOFORGE_HISTORY_LIMIT_V80,
  BIOFORGE_MAX_BUDGET_V80,
  BIOFORGE_MAX_CONCURRENT_V80,
  BIOFORGE_PHASES_V80,
  BIOFORGE_ROOT_KEY_V80,
  BIOFORGE_SCHEMA_V80,
  BIOFORGE_TERRESTRIAL_PROFILE_IDS_V80,
  BIOFORGE_TERRESTRIAL_ROSTER_V80,
  advanceBioforgeSessionV80,
  beginBioforgePurgeV80,
  bioforgeSessionIdV80,
  buildBioforgePrintQueueV80,
  completeBioforgePurgeV80,
  configureBioforgeV80,
  createBioforgeV80,
  finishBioforgeSessionV80,
  getBioforgeMaximumQuantityV80,
  getBioforgeRosterEntryV80,
  migrateBioforgeV80,
  recordBioforgeKillV80,
  sanitizeBioforgeV80,
  startBioforgeSessionV80,
  validateBioforgePurgeReportV80,
  validateBioforgeSelectionV80
} from '../src/bioforge-session-v80.js';

const ZERO_PURGE_REPORT = Object.freeze({
  remainingEntities: 0,
  remainingProjectiles: 0,
  remainingHazards: 0,
  remainingEffects: 0,
  remainingTimers: 0
});

function startSession(profileId = 'enemy-002-facehugger', quantity = 2, now = 1_000) {
  return startBioforgeSessionV80(
    createBioforgeV80(),
    { profileId, quantity },
    { now }
  );
}

function printBatch(profileId = 'enemy-002-facehugger', quantity = 2, now = 1_000) {
  let result = startSession(profileId, quantity, now);
  result = advanceBioforgeSessionV80(result.state, { now: now + 1 });
  result = advanceBioforgeSessionV80(result.state, { now: now + 2 });
  for (let index = 0; index < quantity; index += 1) {
    result = advanceBioforgeSessionV80(result.state, { now: now + 3 + index });
  }
  return result;
}

test('V80 expose une racine séparée et toutes les phases contractuelles', () => {
  assert.equal(BIOFORGE_ROOT_KEY_V80, 'bioforgeV80');
  assert.equal(BIOFORGE_SCHEMA_V80, 80);
  assert.deepEqual(BIOFORGE_PHASES_V80, [
    'configuration',
    'sealing',
    'printing',
    'combat',
    'result',
    'purging',
    'return'
  ]);
});

test('le roster terrestre est strict, validé et sans fallback legacy', () => {
  assert.equal(BIOFORGE_TERRESTRIAL_PROFILE_IDS_V80.length, 11);
  assert.equal(BIOFORGE_TERRESTRIAL_ROSTER_V80.length, 11);
  assert.equal(new Set(BIOFORGE_TERRESTRIAL_PROFILE_IDS_V80).size, 11);
  assert.equal(BIOFORGE_TERRESTRIAL_PROFILE_IDS_V80.includes('enemy-051-ceto-reef-predator'), false);

  for (const profile of BIOFORGE_TERRESTRIAL_ROSTER_V80) {
    assert.equal(profile.terrestrial, true);
    assert.equal(profile.identityVerified, true);
    assert.notEqual(profile.spriteKey, 'legacy');
    assert.match(profile.path, /^\/assets\/openai\/sprites\/normalized\//);
    assert.equal(getBioforgeRosterEntryV80(profile.profileId), profile);
  }
  assert.equal(getBioforgeRosterEntryV80('enemy-999-placeholder'), null);
});

test('la validation refuse types, quantités et profils hors contrat', () => {
  assert.deepEqual(
    validateBioforgeSelectionV80({ profileId: 'enemy-002-facehugger', quantity: 12 }),
    {
      ok: true,
      errors: [],
      profile: getBioforgeRosterEntryV80('enemy-002-facehugger'),
      profileId: 'enemy-002-facehugger',
      quantity: 12,
      unitCost: 1,
      totalCost: 12,
      maximumQuantity: 12
    }
  );
  assert.equal(validateBioforgeSelectionV80({ profileId: 'enemy-002-facehugger', quantity: '2' }).ok, false);
  assert.equal(validateBioforgeSelectionV80({ profileId: 'enemy-002-facehugger', quantity: 0 }).ok, false);
  assert.equal(validateBioforgeSelectionV80({ profileId: 'enemy-999-placeholder', quantity: 1 }).ok, false);
  assert.equal(validateBioforgeSelectionV80({ profileId: 'enemy-004-drone-big-chap', quantity: 5 }).ok, false);
});

test('le coût pondéré respecte budget 12 et plafond simultané 12', () => {
  assert.equal(BIOFORGE_MAX_BUDGET_V80, 12);
  assert.equal(BIOFORGE_MAX_CONCURRENT_V80, 12);
  assert.equal(getBioforgeMaximumQuantityV80('enemy-002-facehugger'), 12);
  assert.equal(getBioforgeMaximumQuantityV80('enemy-001-ovomorph'), 6);
  assert.equal(getBioforgeMaximumQuantityV80('enemy-004-drone-big-chap'), 4);
  assert.equal(getBioforgeMaximumQuantityV80('enemy-999-placeholder'), 0);
});

test('la file déterministe produit des IDs stables et refuse une session invalide', () => {
  assert.equal(bioforgeSessionIdV80(7), 'bioforge-v80-s000000007');
  const queue = buildBioforgePrintQueueV80({
    sessionId: 'bioforge-v80-s000000007',
    profileId: 'enemy-002-facehugger',
    quantity: 2
  });
  assert.deepEqual(queue.map(({ id, index, status }) => ({ id, index, status })), [
    { id: 'bioforge-v80-s000000007:specimen-01', index: 0, status: 'queued' },
    { id: 'bioforge-v80-s000000007:specimen-02', index: 1, status: 'queued' }
  ]);
  assert.equal(Object.isFrozen(queue), true);
  assert.equal(Object.isFrozen(queue[0]), true);
  assert.deepEqual(buildBioforgePrintQueueV80({
    sessionId: 'legacy-7',
    profileId: 'enemy-002-facehugger',
    quantity: 2
  }), []);
});

test('la création et la configuration sont autonomes et ne mutent pas la source', () => {
  const root = createBioforgeV80();
  assert.equal(root.schema, 80);
  assert.equal(root.activeSession, null);
  assert.deepEqual(root.configuration, {
    profileId: BIOFORGE_DEFAULT_PROFILE_ID_V80,
    quantity: 1,
    unitCost: 3,
    budget: 3
  });
  assert.equal(Object.keys(root.records).length, 11);

  const configured = configureBioforgeV80(root, {
    profileId: 'enemy-001-ovomorph',
    quantity: 6
  });
  assert.equal(configured.applied, true);
  assert.deepEqual(configured.state.configuration, {
    profileId: 'enemy-001-ovomorph',
    quantity: 6,
    unitCost: 2,
    budget: 12
  });
  assert.equal(root.configuration.profileId, BIOFORGE_DEFAULT_PROFILE_ID_V80);
});

test('le démarrage alloue une série et une session déterministes', () => {
  const first = startSession('enemy-002-facehugger', 2, 2_000);
  assert.equal(first.applied, true);
  assert.equal(first.event.type, 'bioforge-session-started');
  assert.equal(first.session.id, 'bioforge-v80-s000000001');
  assert.equal(first.session.phase, 'configuration');
  assert.equal(first.session.budget, 2);
  assert.deepEqual(first.session.queue.map((entry) => entry.id), [
    'bioforge-v80-s000000001:specimen-01',
    'bioforge-v80-s000000001:specimen-02'
  ]);

  const finished = finishBioforgeSessionV80(first.state, { outcome: 'aborted' }, { now: 2_001 });
  const purging = beginBioforgePurgeV80(finished.state, 'test-cycle', { now: 2_002 });
  const returned = completeBioforgePurgeV80(purging.state, ZERO_PURGE_REPORT, { now: 2_003 });
  const second = startBioforgeSessionV80(returned.state, null, { now: 2_004 });
  assert.equal(second.session.id, 'bioforge-v80-s000000002');
});

test('advance traverse sealing puis printing et imprime une entité par appel', () => {
  let result = startSession('enemy-002-facehugger', 2, 3_000);
  result = advanceBioforgeSessionV80(result.state, { now: 3_001 });
  assert.equal(result.event.type, 'bioforge-sealing-started');
  assert.equal(result.session.phase, 'sealing');

  result = advanceBioforgeSessionV80(result.state, { now: 3_002 });
  assert.equal(result.event.type, 'bioforge-printer-ready');
  assert.equal(result.session.phase, 'printing');

  result = advanceBioforgeSessionV80(result.state, { now: 3_003 });
  assert.equal(result.event.type, 'bioforge-specimen-printed');
  assert.equal(result.event.specimenId, 'bioforge-v80-s000000001:specimen-01');
  assert.equal(result.event.remaining, 1);
  assert.equal(result.session.phase, 'printing');
  assert.deepEqual(result.session.aliveIds, ['bioforge-v80-s000000001:specimen-01']);

  result = advanceBioforgeSessionV80(result.state, { now: 3_004 });
  assert.equal(result.event.specimenId, 'bioforge-v80-s000000001:specimen-02');
  assert.equal(result.event.remaining, 0);
  assert.equal(result.session.phase, 'combat');
  assert.equal(result.session.aliveIds.length, 2);
});

test('les éliminations ne ciblent que les spécimens imprimés et sont idempotentes', () => {
  let result = printBatch('enemy-002-facehugger', 2, 4_000);
  const firstId = result.session.queue[0].id;
  const secondId = result.session.queue[1].id;

  const unknown = recordBioforgeKillV80(result.state, 'bioforge-v80-s000000001:specimen-99');
  assert.equal(unknown.applied, false);
  assert.equal(unknown.reason, 'unknown-or-unprinted-specimen');

  result = recordBioforgeKillV80(result.state, firstId, { now: 4_010 });
  assert.equal(result.applied, true);
  assert.equal(result.event.batchCleared, false);
  assert.deepEqual(result.session.killedIds, [firstId]);
  assert.deepEqual(result.session.aliveIds, [secondId]);

  const duplicate = recordBioforgeKillV80(result.state, firstId, { now: 4_011 });
  assert.equal(duplicate.applied, false);
  assert.equal(duplicate.reason, 'kill-already-recorded');
});

test('un résultat cleared exige le lot entier et alimente historique et records', () => {
  let result = printBatch('enemy-003-chestburster', 2, 5_000);
  const premature = finishBioforgeSessionV80(result.state, { outcome: 'cleared', score: 400 }, { now: 5_010 });
  assert.equal(premature.applied, false);
  assert.equal(premature.reason, 'batch-not-cleared');

  for (const specimen of result.session.queue) {
    result = recordBioforgeKillV80(result.state, specimen.id, { now: 5_011 + specimen.index });
  }
  result = finishBioforgeSessionV80(result.state, { outcome: 'cleared', score: 400 }, { now: 5_020 });
  assert.equal(result.applied, true);
  assert.equal(result.session.phase, 'result');
  assert.equal(result.state.history.length, 1);
  assert.equal(result.state.history[0].durationMs, 20);
  assert.deepEqual(
    {
      sessions: result.state.records['enemy-003-chestburster'].sessions,
      clears: result.state.records['enemy-003-chestburster'].clears,
      printed: result.state.records['enemy-003-chestburster'].printed,
      kills: result.state.records['enemy-003-chestburster'].kills,
      bestScore: result.state.records['enemy-003-chestburster'].bestScore
    },
    { sessions: 1, clears: 1, printed: 2, kills: 2, bestScore: 400 }
  );
});

test('failed et aborted restent terminables sans faux clear', () => {
  const started = startSession('enemy-005-warrior', 1, 6_000);
  const failed = finishBioforgeSessionV80(
    started.state,
    { outcome: 'failed', reason: 'containment-breach', score: 12 },
    { now: 6_100 }
  );
  assert.equal(failed.applied, true);
  assert.equal(failed.session.result.outcome, 'failed');
  assert.equal(failed.state.records['enemy-005-warrior'].failures, 1);
  assert.equal(failed.state.history[0].printed, 0);
});

test('la purge exige cinq compteurs entiers à zéro puis retourne proprement', () => {
  let result = printBatch('enemy-002-facehugger', 1, 7_000);
  result = finishBioforgeSessionV80(result.state, { outcome: 'failed' }, { now: 7_010 });
  result = beginBioforgePurgeV80(result.state, 'post-combat', { now: 7_011 });
  assert.equal(result.session.phase, 'purging');
  assert.equal(result.state.recovery.purgeRequired, true);

  assert.equal(validateBioforgePurgeReportV80({}).ok, false);
  assert.equal(validateBioforgePurgeReportV80({ ...ZERO_PURGE_REPORT, remainingTimers: '0' }).ok, false);
  const occupied = completeBioforgePurgeV80(
    result.state,
    { ...ZERO_PURGE_REPORT, remainingEntities: 1 },
    { now: 7_012 }
  );
  assert.equal(occupied.applied, false);
  assert.equal(occupied.reason, 'containment-not-empty');

  result = completeBioforgePurgeV80(result.state, ZERO_PURGE_REPORT, { now: 7_013 });
  assert.equal(result.applied, true);
  assert.equal(result.session.phase, 'return');
  assert.equal(result.state.recovery.purgeRequired, false);
  assert.deepEqual(result.session.aliveIds, []);
  assert.equal(result.session.queue[0].status, 'purged');
});

test('une session corrompue impose une purge de récupération avant redémarrage', () => {
  const corrupt = sanitizeBioforgeV80({
    schema: 80,
    activeSession: { forged: true }
  });
  assert.equal(corrupt.activeSession, null);
  assert.deepEqual(corrupt.recovery, {
    purgeRequired: true,
    reason: 'corrupt-active-session'
  });
  assert.equal(startBioforgeSessionV80(corrupt).reason, 'purge-required');

  const begun = beginBioforgePurgeV80(corrupt, 'corruption-recovery');
  assert.equal(begun.event.type, 'bioforge-recovery-purge-started');
  const completed = completeBioforgePurgeV80(begun.state, ZERO_PURGE_REPORT);
  assert.equal(completed.event.type, 'bioforge-recovery-purge-completed');
  const restarted = startBioforgeSessionV80(
    completed.state,
    { profileId: 'enemy-002-facehugger', quantity: 1 },
    { now: 8_000 }
  );
  assert.equal(restarted.applied, true);
});

test('sanitize reconstruit la file canonique et filtre les IDs injectés', () => {
  let result = startSession('enemy-002-facehugger', 2, 9_000);
  result = advanceBioforgeSessionV80(result.state, { now: 9_001 });
  result = advanceBioforgeSessionV80(result.state, { now: 9_002 });
  result = advanceBioforgeSessionV80(result.state, { now: 9_003 });

  const tampered = structuredClone(result.state);
  const firstId = tampered.activeSession.queue[0].id;
  tampered.activeSession.killedIds = [firstId, 'foreign-id', firstId];
  tampered.activeSession.queue.push({ id: 'foreign-id', status: 'alive' });
  tampered.records.legacy = { sessions: 999 };

  const safe = migrateBioforgeV80(tampered);
  assert.equal(safe.activeSession.queue.length, 2);
  assert.deepEqual(safe.activeSession.killedIds, [firstId]);
  assert.equal(safe.activeSession.queue[0].status, 'killed');
  assert.equal(safe.activeSession.queue[1].status, 'queued');
  assert.equal(Object.hasOwn(safe.records, 'legacy'), false);
});

test('historique et records sont bornés même avec une sauvegarde hostile', () => {
  const profileId = 'enemy-002-facehugger';
  const raw = createBioforgeV80();
  raw.history = Array.from({ length: BIOFORGE_HISTORY_LIMIT_V80 + 20 }, (_, index) => {
    const serial = index + 1;
    return {
      sessionId: bioforgeSessionIdV80(serial),
      serial,
      profileId,
      quantity: 1,
      outcome: 'cleared',
      printed: 1,
      kills: 1,
      score: serial,
      startedAt: serial * 10,
      completedAt: serial * 10 + 5
    };
  });
  raw.records[profileId] = {
    sessions: 'corrupt',
    clears: -20,
    failures: Number.POSITIVE_INFINITY,
    kills: 99,
    bestScore: 9_999_999_999
  };

  const safe = sanitizeBioforgeV80(raw);
  assert.equal(safe.history.length, BIOFORGE_HISTORY_LIMIT_V80);
  assert.equal(safe.history[0].serial, 21);
  assert.equal(safe.history.at(-1).serial, 84);
  assert.equal(safe.serial, 84);
  assert.equal(safe.records[profileId].sessions, 0);
  assert.equal(safe.records[profileId].clears, 0);
  assert.equal(safe.records[profileId].failures, 0);
  assert.equal(safe.records[profileId].kills, 99);
  assert.equal(safe.records[profileId].bestScore, 1_000_000);
});

test('les actions dédiées protègent les transitions terminales', () => {
  const combat = printBatch('enemy-002-facehugger', 1, 10_000);
  const advanceCombat = advanceBioforgeSessionV80(combat.state);
  assert.equal(advanceCombat.applied, false);
  assert.equal(advanceCombat.reason, 'combat-requires-dedicated-action');
  const invalidOutcome = finishBioforgeSessionV80(combat.state, { outcome: 'victory' });
  assert.equal(invalidOutcome.applied, false);
  assert.equal(invalidOutcome.reason, 'invalid-outcome');
  const noPurge = completeBioforgePurgeV80(combat.state, ZERO_PURGE_REPORT);
  assert.equal(noPurge.applied, false);
  assert.equal(noPurge.reason, 'purge-not-started');
});
