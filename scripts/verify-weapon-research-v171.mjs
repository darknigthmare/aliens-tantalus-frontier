import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WEAPON_RESEARCH_INDEX_V171, validateWeaponResearchIndexV171,
  getWeaponResearchIndexV171, renderWeaponResearchIndexV171 } from '../src/weapon-research-index-v171.js';
import { ARMORY_ART_ADMISSIONS_V171, isArmoryArtAdmittedV171, isArmoryStorefrontImageReadyV172 } from '../src/hub-armory-storefront-v169.js';
const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
const keys = ['P0','P1','P2'];
test('V171 follows exactly 129 source-only proposed weapons in the historical source list',()=>{
 const source=read('docs/arsenal/data/tantalus_weapon_evidence_backlog_v170.csv');
 const list=[...source.matchAll(/(?:^|\n)(proposed-[a-z0-9-]+),/g)].map(x=>x[1]);
 assert.equal(list.length,129);
 assert.deepEqual(WEAPON_RESEARCH_INDEX_V171.map(x=>x.id),list);
 assert.deepEqual(keys.map(x=>getWeaponResearchIndexV171({priority:x}).length),[14,27,88]);
});
test('V171 references only stable researched IDs, never new purchasable catalog weapons',()=>{
 const status=validateWeaponResearchIndexV171();
 assert.equal(status.valid,true);
 assert.equal(status.proposed,129);
 assert.equal(status.media,28);
 assert.equal(status.p0,14);
 assert.equal(status.p1,27);
 assert.equal(status.p2,88);
 assert.ok(status.plausibleExactNameMatches>=0);
 assert.ok(WEAPON_RESEARCH_INDEX_V171.every(x=>x.admission==='RESEARCH_ONLY' && x.canonExact===false));
});
test('V171 groups all 129 research identities by their exact media without sacrificing source URLs',()=>{
 const grouped=new Set(WEAPON_RESEARCH_INDEX_V171.map(row=>row.work));
 assert.equal(grouped.size,28);
 for(const work of grouped) {
  const rows=getWeaponResearchIndexV171({work});
  assert.equal(rows.every(x=>x.work===work),true);
  assert.equal(rows.length,WEAPON_RESEARCH_INDEX_V171.filter(x=>x.work===work).length);
 }
 const html=renderWeaponResearchIndexV171();
 assert.match(html,/id="armory-research-v171"/);
 assert.equal((html.match(/data-research-id=/g)||[]).length,129);
 assert.doesNotMatch(html,/\bdata-(?:procure|purchase|equip|sell)-/);
 assert.match(html,/NON ACHETABLE/);
 assert.match(html,/rel="noopener noreferrer"/);
});
test('V171 refuses forged 1:1 releases, duplicate IDs and invalid URLs in research rows',()=>{
 const invalid=structuredClone(WEAPON_RESEARCH_INDEX_V171);
 invalid[0].canonExact=true;
 assert.equal(validateWeaponResearchIndexV171(invalid).valid,false);
 invalid[0].canonExact=false;
 invalid[1].id=invalid[0].id;
 assert.equal(validateWeaponResearchIndexV171(invalid).valid,false);
 invalid[1].id=WEAPON_RESEARCH_INDEX_V171[1].id;
 invalid[2].sourceUrl='javascript:alert(1)';
 assert.equal(validateWeaponResearchIndexV171(invalid).valid,false);
});
test('V172 shipped storefront art still requires real image readiness before contact',()=>{
 assert.deepEqual(Object.values(ARMORY_ART_ADMISSIONS_V171),[true,true,true]);
 for(const variant of ['tantalus','colony','station'])
  assert.equal(isArmoryArtAdmittedV171(variant),true);
 assert.equal(isArmoryArtAdmittedV171('../unsafe'),false);
 assert.equal(isArmoryStorefrontImageReadyV172(null),false);
 assert.equal(isArmoryStorefrontImageReadyV172({complete:false,naturalWidth:1448,naturalHeight:1086}),false);
 assert.equal(isArmoryStorefrontImageReadyV172({complete:true,naturalWidth:1024,naturalHeight:1024}),false);
 assert.equal(isArmoryStorefrontImageReadyV172({complete:true,naturalWidth:1448,naturalHeight:1086}),true);
 const scene=read('src/hub-armory-scene-v169.js');
 const port=read('src/hub-port-meridien-v90.js');
 assert.match(scene,/if \(!isArmoryArtAdmittedV171\(variant\)/);
 assert.match(scene,/!isArmoryStorefrontImageReadyV172\(this.armoryStorefrontImagesV169/);
 assert.match(port,/if \(isArmoryArtAdmittedV171\('colony'\)/);
 assert.match(port,/!isArmoryStorefrontImageReadyV172\(this.portArmoryImageV169\)/);
});
test('V171 unified archives are wired into the existing transactional armory',()=>{
 const source=read('src/weapon-fidelity-ledger-v170.js');
 assert.match(source,/renderWeaponResearchIndexV171/);
 const app=read('src/app.js');
 assert.match(app,/renderWeaponFidelityDossiersV170/);
 assert.match(app,/procureCatalogItem\(saveSystem.data/);
 assert.match(app,/openHubStation\('armory'\)/);
});
