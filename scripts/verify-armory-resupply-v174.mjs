import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
 ARMORY_RESUPPLY_CATALOG_V174, quoteArmoryResupplyV174,
 purchaseArmoryResupplyV174, renderArmoryResupplyV174
} from '../src/armory-resupply-v174.js';
const fixture=()=>({schema:52,profile:1,clock:{day:1,hour:1},
 player:{ammo:{primary:300,secondary:72,grenades:4}},
 strategy:{serial:7,log:[],unlockedResearchIds:[],currentOperation:null},
 galaxy:{resources:{credits:550}},statistics:{procurements:2}});
test('V174 only offers three explicitly sized physical-world-neutral resupply lots',()=>{
 assert.deepEqual(ARMORY_RESUPPLY_CATALOG_V174.map(x=>[x.id,x.quantity,x.credits]),[
  ['supply-primary-60',60,120],['supply-secondary-24',24,90],['supply-grenade-2',2,220]
 ]);
 assert.ok(ARMORY_RESUPPLY_CATALOG_V174.every(x=>!('magazineId'in x)&&!('weaponId'in x)));
});
test('V174 purchases deduct exact credits and add only requested source inventory',()=>{
 const s=fixture();let result=purchaseArmoryResupplyV174(s,'supply-primary-60');
 assert.equal(result.ok,true);assert.equal(result.receipt,'armory-v174:8:supply-primary-60');
 assert.deepEqual(s.player.ammo,{primary:360,secondary:72,grenades:4});
 assert.equal(s.galaxy.resources.credits,430);
 assert.equal(s.statistics.procurements,3);
 assert.equal(s.strategy.serial,8);
 assert.equal(s.strategy.log[0].id,result.receipt);
});
test('V174 pricing honors existing logistics discount, round-to-tens',()=>{
 const s=fixture();s.strategy.unlockedResearchIds.push('ship-logistics');
 assert.equal(quoteArmoryResupplyV174(s,'supply-primary-60').credits,110);
 assert.equal(quoteArmoryResupplyV174(s,'supply-grenade-2').credits,190);
 const r=purchaseArmoryResupplyV174(s,'supply-grenade-2');
 assert.equal(r.quote.credits,190);assert.equal(s.galaxy.resources.credits,360);
});
test('V174 operation lock and insufficient credits fail without any mutation',()=>{
 const s=fixture();
 s.strategy.currentOperation={id:'mission'};
 let before=structuredClone(s);
 assert.throws(()=>purchaseArmoryResupplyV174(s,'supply-primary-60'),/verrouillé/);
 assert.deepEqual(s,before);
 s.strategy.currentOperation=null;s.galaxy.resources.credits=5;
 before=structuredClone(s);
 assert.throws(()=>purchaseArmoryResupplyV174(s,'supply-primary-60'),/insuffisants/);
 assert.deepEqual(s,before);
});
test('V174 rejects unknown product, maximum capacity and corrupt amount without payment',()=>{
 const s=fixture();
 const before=structuredClone(s);assert.throws(()=>purchaseArmoryResupplyV174(s,'proposed-db-48-daittyo-heavy-rifle'),/inconnue/);
 assert.deepEqual(s,before);
 s.player.ammo.primary=999960;
 assert.throws(()=>purchaseArmoryResupplyV174(s,'supply-primary-60'),/Capacité/);
 assert.equal(s.galaxy.resources.credits,550);
 s.player.ammo.primary=-1;
 assert.equal(quoteArmoryResupplyV174(s,'supply-primary-60'),null);
});
test('V174 two explicit user actions generate two independent transactions, never a free receipt',()=>{
 const s=fixture();const a=purchaseArmoryResupplyV174(s,'supply-secondary-24');
 const b=purchaseArmoryResupplyV174(s,'supply-secondary-24');
 assert.notEqual(a.receipt,b.receipt);assert.equal(s.player.ammo.secondary,120);
 assert.equal(s.galaxy.resources.credits,370);
 assert.equal(s.strategy.log.length,2);
});
test('V174 never renders game-only weapon candidates or untrusted purchase IDs',()=>{
 const html=renderArmoryResupplyV174(fixture());
 assert.equal((html.match(/data-armory-resupply-v174=/g)||[]).length,3);
 assert.match(html,/Lot de munitions principales/);
 assert.doesNotMatch(html,/data-procure|data-equip|weapon-\d{3}|proposed-/);
});
test('V174 actual production armory uses SaveSystem transaction and keeps V170 research read-only',()=>{
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 assert.match(app,/renderArmoryResupplyV174\(saveSystem\.data\)/);
 assert.match(app,/runTimedMutation\(\(\) => purchaseArmoryResupplyV174/);
 assert.match(app,/armory-fidelity-mount-v170/);
 assert.match(app,/renderWeaponFidelityDossiersV170\(\)/);
 assert.match(app,/procureCatalogItem\(saveSystem\.data/);
});
