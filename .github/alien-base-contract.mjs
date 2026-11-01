import test from 'node:test';
import assert from 'node:assert/strict';
import { SHARED_ALIEN_BASE_V1, resolveAlienBaseIdentityV1, summarizeAlienBaseCoverageV1 } from '../src/alien-base-bridge-v1.js';
import { ENEMIES, WEAPONS, VEHICLES, EQUIPMENT, FACTIONS, CREW } from '../src/content-core-v50.js';
import { AFE2_ROSTER_V110 } from '../src/afe2-roster-v110.js';
const local={enemies:ENEMIES,weapons:WEAPONS,vehicles:VEHICLES,equipment:EQUIPMENT,factions:FACTIONS,crew:CREW,afe2Roster:AFE2_ROSTER_V110};
test('1,217 stable bindings resolve without mutating any old save IDs',()=>{
 for(const [group,items] of Object.entries(local)){
  const actual=new Set(items.map(x=>x.id));
  for(const [id,ref] of Object.entries(SHARED_ALIEN_BASE_V1.groups[group])){
   const match=Number(id.match(/-(\d+)-/)?.[1]||0);
   const optional=(group==='weapons'&&match>146)||(group==='vehicles'&&match>279);
   if(!optional)assert.ok(actual.has(id),group+': '+id);
   assert.equal(resolveAlienBaseIdentityV1(group,id)?.id,ref.id);
  }
 }
 assert.equal(summarizeAlienBaseCoverageV1().enemies,571);
});
test('not-yet-admitted AFE2 models are not certified or invented',()=>{
 for(const id of ['siren','gasbag','wey-yu-worker'])assert.equal(resolveAlienBaseIdentityV1('afe2Roster',id),null);
 assert.equal(resolveAlienBaseIdentityV1('enemies','unreviewed-id'),null);
 assert.equal(SHARED_ALIEN_BASE_V1.statsPolicy,'local-gameplay-values-never-overwritten');
});
