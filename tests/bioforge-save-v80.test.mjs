import test from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultSave, migrateSave } from '../src/save.js';
import {
  BIOFORGE_SCHEMA_V80,
  advanceBioforgeSessionV80,
  beginBioforgePurgeV80,
  completeBioforgePurgeV80,
  sanitizeBioforgeRuntimeV81,
  startBioforgeSessionV80
} from '../src/bioforge-session-v80.js';

const ZERO_PURGE_REPORT_V80 = Object.freeze({
  remainingEntities: 0,
  remainingProjectiles: 0,
  remainingHazards: 0,
  remainingEffects: 0,
  remainingTimers: 0
});

test('la sauvegarde V80 possède une racine BIOFORGE séparée du hub et de la campagne', () => {
  const save = createDefaultSave();
  assert.equal(save.bioforgeV80.schema, BIOFORGE_SCHEMA_V80);
  assert.equal(save.bioforgeV80.activeSession, null);
  assert.equal(save.bioforgeV80.runtimeV81, null);
  assert.equal(Object.hasOwn(save.hub, 'bioforgeV80'), false);
  assert.doesNotMatch(JSON.stringify(save.hub.annexOperationsV71.bioforge), /spawn|enemy|quantity|printer/i);
});

test('le bloc runtimeV81 BIOFORGE normalise les bornes et refuse un facing non canonique', () => {
  assert.equal(sanitizeBioforgeRuntimeV81(null), null);
  const runtimeV81 = sanitizeBioforgeRuntimeV81({
    seed: 123,
    phaseClock: -4,
    transferStage: 99,
    player: { x: 99999, y: -50, facing: 'enemy' }
  });
  assert.deepEqual(runtimeV81, {
    schema: 81,
    seed: 123,
    phaseClock: 0,
    transferStage: 3,
    player: { x: 2880, y: 84, facing: 1 }
  });
  assert.equal(sanitizeBioforgeRuntimeV81({ player: { x: 1400, y: 510, facing: -1 } }).player.facing, -1);
});

test('un cycle BIOFORGE persiste sans modifier les ressources, opérations, équipage ou statistiques campagne', () => {
  const save = createDefaultSave();
  const strategicBefore = structuredClone({
    galaxy: save.galaxy,
    strategy: save.strategy,
    crew: save.crew,
    player: save.player,
    statistics: save.statistics,
    hub: save.hub
  });

  let receipt = startBioforgeSessionV80(save.bioforgeV80, {
    profileId: 'enemy-002-facehugger',
    quantity: 3
  }, { now: 100 });
  assert.equal(receipt.applied, true);
  receipt = advanceBioforgeSessionV80(receipt.state, { now: 110 });
  receipt = advanceBioforgeSessionV80(receipt.state, { now: 120 });
  receipt = advanceBioforgeSessionV80(receipt.state, { now: 130 });
  assert.equal(receipt.state.activeSession.printedCount, 1);
  receipt = beginBioforgePurgeV80(receipt.state, 'test-isolation', { now: 140 });
  assert.equal(receipt.state.recovery.purgeRequired, true);
  receipt = completeBioforgePurgeV80(receipt.state, ZERO_PURGE_REPORT_V80, { now: 150 });
  assert.equal(receipt.state.activeSession.phase, 'return');
  save.bioforgeV80 = receipt.state;

  assert.deepEqual({
    galaxy: save.galaxy,
    strategy: save.strategy,
    crew: save.crew,
    player: save.player,
    statistics: save.statistics,
    hub: save.hub
  }, strategicBefore);

  const restored = migrateSave(JSON.parse(JSON.stringify(save)), save.profile);
  assert.equal(restored.bioforgeV80.activeSession.phase, 'return');
  assert.equal(restored.bioforgeV80.lastSessionId, 'bioforge-v80-s000000001');
  assert.deepEqual(restored.galaxy, strategicBefore.galaxy);
  assert.deepEqual(restored.strategy, strategicBefore.strategy);
  assert.deepEqual(restored.crew, strategicBefore.crew);
  assert.deepEqual(restored.statistics, strategicBefore.statistics);
});

test('une session active forgée ou corrompue force une purge de récupération sûre', () => {
  const save = createDefaultSave();
  save.bioforgeV80.activeSession = {
    schema: BIOFORGE_SCHEMA_V80,
    id: 'forged-session',
    profileId: 'enemy-999-placeholder',
    quantity: 999
  };
  const restored = migrateSave(save, save.profile);
  assert.equal(restored.bioforgeV80.activeSession, null);
  assert.deepEqual(restored.bioforgeV80.recovery, {
    purgeRequired: true,
    reason: 'corrupt-active-session'
  });
});
