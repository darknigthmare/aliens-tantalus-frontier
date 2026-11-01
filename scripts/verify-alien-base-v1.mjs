import test from 'node:test';
import assert from 'node:assert/strict';
import { SHARED_ALIEN_BASE_V1, resolveAlienBaseIdentityV1, summarizeAlienBaseCoverageV1 } from '../src/alien-base-bridge-v1.js';
import { ENEMIES, WEAPONS, VEHICLES, EQUIPMENT, FACTIONS, CREW } from '../src/content-core-v50.js';
import { AFE2_ROSTER_V110 } from '../src/afe2-roster-v110.js';
import { getEnemyCatalogPolicyV105 } from '../src/enemy-catalog-taxonomy-v105.js';
const local={enemies:ENEMIES,weapons:WEAPONS,vehicles:VEHICLES,equipment:EQUIPMENT,factions:FACTIONS,crew:CREW,afe2Roster:AFE2_ROSTER_V110};
test('all baseline local ids are preserved and resolve to stable canonical identity',()=>{
 for(const [group,list] of Object.entries(local)){
  const live=new Set(list.map(e=>e.id));
  for(const [id,record] of Object.entries(SHARED_ALIEN_BASE_V1.groups[group])){
   // Release-admitted append-only models are optional; the immutable base ranges are not.
   const number=Number(id.match(/^(?:enemy|weapon|vehicle|equipment)-(\d+)/)?.[1]||0);
   const isOptional=(group==='weapons'&&number>146)||(group==='vehicles'&&number>279);
   if(!isOptional)assert.ok(live.has(id),group+': unexpected local ID '+id);
   assert.equal(resolveAlienBaseIdentityV1(group,id)?.id,record.id);
  }
 }
});
test('catalog taxonomy carries the same shared identity without changing biology',()=>{
 const entry=ENEMIES.find(e=>e.id==='enemy-001-ovomorph');
 assert.ok(entry);
 const policy=getEnemyCatalogPolicyV105(entry);
 assert.equal(policy.sharedEntityId,'bio.xenomorph.ovomorph');
 assert.equal(policy.biology,'xenomorph');
});
test('foreign IDs and missing AFE2 entries fail closed',()=>{
 assert.equal(resolveAlienBaseIdentityV1('enemies','enemy-999999-unconfirmed'),null);
 for(const id of ['siren','gasbag','wey-yu-worker'])assert.equal(resolveAlienBaseIdentityV1('afe2Roster',id),null);
 assert.equal(SHARED_ALIEN_BASE_V1.statsPolicy,'local-gameplay-values-never-overwritten');
 assert.equal(summarizeAlienBaseCoverageV1().enemies,571);
});
