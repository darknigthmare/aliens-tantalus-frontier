import test from 'node:test';
import assert from 'node:assert/strict';
import { AFE2_ROSTER_V110, getAfe2RosterEntryV110 } from '../src/afe2-roster-v110.js';
import { getAlienBaseIdForProfile, getAlienBaseByLocalId, ALIEN_BASE_REGISTRY } from '../src/alien-base.js';
import { VEHICLE_CATALOG_ADDITIONS_V121 } from '../src/vehicle-catalog-additions-v121.js';
import { VEHICLE_CATALOG_ADDITIONS_V122 } from '../src/vehicle-catalog-additions-v122.js';
test('Tantalus uses the same immutable offline Alien_base snapshot',()=>{
  assert.equal(ALIEN_BASE_REGISTRY.records.length,88);
  assert.equal(ALIEN_BASE_REGISTRY.sources.length,19);
  assert.equal(ALIEN_BASE_REGISTRY.version,'0.1.0');
});
test('AFE2 original roster, statuses and profile IDs remain intact',()=>{
  assert.equal(AFE2_ROSTER_V110.length,35);
  assert.equal(getAfe2RosterEntryV110('egg').status,'shared-species');
  assert.equal(getAfe2RosterEntryV110('egg').profileId,'castes-film_ovomorphe_aliens_1986');
  assert.equal(getAfe2RosterEntryV110('egg').alienBaseId,'ab:organism:ovomorph');
  assert.equal(getAfe2RosterEntryV110('spitter').alienBaseId,'ab:organism:spitter-acm');
  assert.equal(getAfe2RosterEntryV110('siren').alienBaseId,null);
  assert.equal(getAfe2RosterEntryV110('siren').status,'missing');
});
test('vehicle reference bindings are sourced and never replace simulation values',()=>{
  const all=[...VEHICLE_CATALOG_ADDITIONS_V121,...VEHICLE_CATALOG_ADDITIONS_V122];
  for(const vehicle of all) {
    const reference=getAlienBaseByLocalId(vehicle.id);
    assert.ok(reference,'missing reference for '+vehicle.id);
    assert.equal(reference.kind,'vehicle');
    assert.equal(vehicle.statsPolicy.includes('original-project-tuning'),true);
  }
  assert.equal(getAlienBaseIdForProfile('castes-game_afe_prowler'),'ab:organism:prowler-afe');
});
