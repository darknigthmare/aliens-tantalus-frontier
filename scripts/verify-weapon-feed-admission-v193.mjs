import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WEAPONS } from '../src/content-core-v50.js';
import { getWeaponPresentationProfileV124 } from '../src/weapon-presentation-profiles-v124.js';
import {
 WEAPON_FEED_ADMISSION_SCHEMA_V193, inspectDetachableFeedV193,
 canInitializeDetachableFeedV193
} from '../src/weapon-feed-admission-v193.js';
const named = id => WEAPONS.find(x => x.id === id);
const owner = (weapon, ammo=12, reserve=42) =>
 ({ ammo,ammoReserve:reserve,magazineSize:weapon.magazine });
const machine=Object.freeze([
 ['weapon-005-m56-smartgun','belt'],
 ['weapon-006-m240-incinerator-unit','tank'],
 ['weapon-007-m37a2-pump-shotgun','tube'],
 ['weapon-011-m83-sadar','single'],
 ['weapon-021-357-magnum-revolver','cylinder']
]);
test('V193 official M41A feed is the only proven sample in this test; pilot remains explicitly an adaptation',()=>{
 const w=named('weapon-001-m41a-pulse-rifle');
 assert.ok(w);
 const result=canInitializeDetachableFeedV193(w,owner(w));
 assert.equal(result.schema,WEAPON_FEED_ADMISSION_SCHEMA_V193);
 assert.equal(result.detachable,true);
 assert.equal(result.feed,'box');
 assert.equal(result.ammoType,'caseless');
 assert.equal(result.canonExact,false);
 assert.equal(result.visualFidelity1to1,false);
 assert.equal(result.sourceMeasured,false);
});
test('V193 every specialist model rejects fake detachable feed even when its presentation says drum',()=>{
 for(const [id,kind] of machine){
  const w=named(id);
  assert.ok(w,id);
  const result=canInitializeDetachableFeedV193(w,owner(w));
  assert.equal(result.detachable,false,id);
  assert.equal(result.reason,'specialized-'+kind+'-feed-pending-native-bridge',id);
  assert.equal(result.fallback,'legacy-numeric',id);
 }
 const smart=named(machine[0][0]),presentation=getWeaponPresentationProfileV124(smart);
 assert.equal(presentation.reload.feed,'drum');
 assert.equal(inspectDetachableFeedV193(smart).detachable,false,
   'drum-shaped game HUD does not override actual M56 belt mechanism');
});
test('V193 non-detachable cells, tanks and launcher feed silhouettes are never box magazines',()=>{
 const w={id:'weapon-999-prototype',name:'Research Prototype',family:'energy',magazine:12};
 for(const feed of ['tube','cylinder','belt','tank','cell','single']){
  const result=inspectDetachableFeedV193(w,{profile:{ammunition:'energy',reload:{feed}}});
  assert.equal(result.detachable,false,feed);
  assert.equal(result.reason,'non-detachable-'+feed,feed);
 }
});
test('V193 invalid actor capacity, rounds and identity fail closed without changing ammo',()=>{
 const w=named('weapon-001-m41a-pulse-rifle');
 const actor=owner(w,18,60),before=JSON.stringify(actor);
 assert.equal(canInitializeDetachableFeedV193(w,{...actor,magazineSize:30}).detachable,false);
 assert.equal(canInitializeDetachableFeedV193(w,{...actor,ammo:-1}).detachable,false);
 assert.equal(canInitializeDetachableFeedV193(w,{...actor,ammo:999999}).detachable,false);
 assert.equal(canInitializeDetachableFeedV193(w,{...actor,ammoReserve:NaN}).detachable,false);
 assert.equal(canInitializeDetachableFeedV193({...w,id:'unknown'},actor).detachable,false);
 assert.equal(JSON.stringify(actor),before);
});
test('V193 source-only profiles reject melee tools, cases and unknown ammo',()=>{
 const example={id:'weapon-998-test',name:'Test',family:'ballistic',magazine:25};
 assert.equal(inspectDetachableFeedV193({...example,family:'melee'},
   {profile:{ammunition:'cased',reload:{feed:'box'}}}).detachable,false);
 assert.equal(inspectDetachableFeedV193(example,
   {profile:{ammunition:'none',reload:{feed:'box'}}}).detachable,false);
 assert.equal(inspectDetachableFeedV193(example,
   {profile:{ammunition:'cased',reload:{feed:'none'}}}).detachable,false);
});
test('V193 production gate is used only on opt-in physical magazine initialization',()=>{
 const source=readFileSync(new URL('../src/game-production-runtime.js',import.meta.url),'utf8');
 assert.match(source,/if \(this.experimentalPhysicalMagazinesV167\) this.initializeWeaponFeedsV167\(\)/);
 assert.match(source,/const policy = canInitializeDetachableFeedV193\(descriptor, actor\)/);
 assert.match(source,/if \(!policy.detachable\) continue/);
 assert.doesNotMatch(source,/\['box', 'drum', 'belt', 'cell', 'tank'\]\.includes\(feed\)/);
});

test('V193 entire existing catalog is read-only inspected, never promoted to canon 1:1',()=>{
 const stats={total:0,accepted:0,denied:0,nonDetachable:0};
 for(const weapon of WEAPONS) {
   const actor={ammo:Math.min(5,weapon.magazine),ammoReserve:24,magazineSize:weapon.magazine};
   const result=canInitializeDetachableFeedV193(weapon,actor);
   stats.total++;
   assert.equal(result.canonExact,false,weapon.id);
   assert.equal(result.visualFidelity1to1,false,weapon.id);
   if(result.detachable){
     stats.accepted++;
     assert.ok(['box','drum'].includes(result.feed),weapon.id);
   }else{
     stats.denied++;
     if(/specialized-|non-detachable-/.test(result.reason))stats.nonDetachable++;
   }
 }
 assert.equal(stats.total,WEAPONS.length);
 assert.ok(stats.total>=146);
 assert.ok(stats.accepted>=1);
 assert.ok(stats.denied>=5);
 assert.ok(stats.nonDetachable>=5);
 assert.equal(stats.accepted+stats.denied,stats.total);
});
test('V193 source work and similar weapon naming never unlock an unadmitted sequel ID',()=>{
 const source = {id:'weapon-999-l56a3-smartgun',name:'L56A3 Smartgun',magazine:100,
   family:'smart',provenance:'research-only'};
 const original=JSON.stringify(source);
 const guarded=inspectDetachableFeedV193(source,
   {profile:{ammunition:'caseless',reload:{feed:'belt'}}});
 assert.equal(guarded.detachable,false);
 assert.equal(guarded.canonExact,false);
 assert.equal(JSON.stringify(source),original);
});

test('V193 source identity is required: fabricated box presentation alone never authorizes migration',()=>{
 const existing=named('weapon-001-m41a-pulse-rifle');
 assert.equal(inspectDetachableFeedV193(existing, {profile:{
   weaponId:existing.id,ammunition:'caseless',reload:{feed:'box'}
 }}).reason,'feed-mechanism-not-source-reviewed');
 assert.equal(inspectDetachableFeedV193(existing,{profile:{
   weaponId:'weapon-123-another-model',ammunition:'caseless',reload:{feed:'box'},
   evidence:{catalogueMatch:true,status:'documented-ammunition'}
 }}).detachable,false);
 const inferred=WEAPONS.find(w=>w.name.toLowerCase().includes('pulse rifle')
   && w.id!==existing.id
   && getWeaponPresentationProfileV124(w)?.evidence?.status!=='documented-ammunition');
 assert.ok(inferred,'must have a similar but not source-reviewed pulse family');
 const denied=inspectDetachableFeedV193(inferred);
 assert.equal(denied.detachable,false);
 assert.equal(denied.reason,'feed-mechanism-not-source-reviewed');
});
