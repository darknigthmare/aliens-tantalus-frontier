import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ALIEN_BASE_SNAPSHOT_INFO_V1,
  ALIEN_BASE_ENTITIES_V1,
  ALIEN_BASE_WEAPONS_V1,
  ALIEN_BASE_MASTER_ENTITIES_V1,
  ALIEN_BASE_MASTER_LINKS_V1,
  resolveAlienBaseMasterEntityV1,
  resolveAlienBaseIdentityProposalV1,
  resolveAlienBaseDossierV1,
  resolveAlienBaseWeaponReferenceV1,
  resolveAlienBaseGameMappingV1,
  resolveAlienBaseRegistryV2CandidateV1,
  ALIEN_BASE_REGISTRY_V2_SOURCE_REVIEW_V1,
  auditAlienBaseBridgeV1
} from '../src/alien-base-bridge-v1.js';
import { WEAPONS, ENEMIES, VEHICLES, EQUIPMENT, CREW } from '../src/content-core-v50.js';
import { renderAlienBaseSnapshotV1 } from './sync-alien-base-v1.mjs';
import { exportTantalusInventoryV1 } from './export-alien-base-tantalus-v1.mjs';
import { CatalogWorkbenchV62 } from '../src/catalog-ui-v62.js';

test('Alien_base snapshot is deterministic, checked and reference-only', () => {
  assert.equal(ALIEN_BASE_ENTITIES_V1.length, 46);
  assert.equal(ALIEN_BASE_WEAPONS_V1.length, 200);
  assert.equal(ALIEN_BASE_MASTER_ENTITIES_V1.length, 84);
  assert.equal(ALIEN_BASE_MASTER_LINKS_V1.length, 45);
  const proposed=ALIEN_BASE_WEAPONS_V1.filter(x=>x.admission==='research-only');
  assert.equal(proposed.length, 129);
  assert.ok(proposed.every(x=>x.id.startsWith('proposed-')));
  assert.ok(ALIEN_BASE_WEAPONS_V1.every(x=>x.damage===undefined&&x.fireRate===undefined));
  assert.ok(ALIEN_BASE_ENTITIES_V1.every(x=>x.visualFidelity==='not-1to1-certified'));
  const reproduction=renderAlienBaseSnapshotV1(
    {schemaVersion:'1.0.0',sourceRevision:ALIEN_BASE_SNAPSHOT_INFO_V1.gameCatalogBaselineCommit,entries:ALIEN_BASE_ENTITIES_V1},
    {schemaVersion:'1.0.0',entries:ALIEN_BASE_WEAPONS_V1},
    {schemaVersion:1,entities:ALIEN_BASE_MASTER_ENTITIES_V1},
    {schemaVersion:1,links:ALIEN_BASE_MASTER_LINKS_V1}
  );
  const actual=readFileSync(new URL('../src/alien-base-snapshot-v1.js',import.meta.url),'utf8');
  assert.equal(reproduction,actual);
});

test('Exact canonical and local ID mapping; no near-name guessing', () => {
  const queen=resolveAlienBaseDossierV1('enemy-008-queen');
  assert.equal(queen?.name,'Queen');
  assert.equal(resolveAlienBaseDossierV1(queen.id),queen);
  assert.equal(resolveAlienBaseDossierV1('caste.queen'),null, 'Pending master link must not become a reverse alias');
  assert.equal(resolveAlienBaseMasterEntityV1('enemy-008-queen'),null);
  assert.equal(resolveAlienBaseMasterEntityV1(queen.id),null);
  assert.equal(resolveAlienBaseMasterEntityV1('caste.queen')?.name,'Reine');
  assert.equal(resolveAlienBaseGameMappingV1('enemy-008-queen')?.masterId,null);
  assert.equal(resolveAlienBaseGameMappingV1('enemy-008-queen')?.candidateMasterId,'caste.queen');
  assert.equal(resolveAlienBaseIdentityProposalV1('enemy-008-queen')?.status,'source-version-review-pending');
  assert.equal(resolveAlienBaseMasterEntityV1('ab:faction:union-of-progressive-peoples-alien-franchise'),null);
  assert.equal(resolveAlienBaseDossierV1('queen-official-unverified'),null);
  const loader=resolveAlienBaseDossierV1('vehicle-007-p-5000-powered-work-loader');
  assert.equal(loader?.kind,'vehicle');
  assert.ok(loader.traits.includes('piloted-exoskeleton'));
  assert.equal(resolveAlienBaseDossierV1('enemy-041-working-joe')?.kind,'synthetic');
  assert.equal(resolveAlienBaseDossierV1('enemy-571-predalien')?.name,'Predalien');
});

test('V2 branch candidates use 38 exact local IDs, no automatic canon or gameplay transfer', () => {
  assert.equal(ALIEN_BASE_REGISTRY_V2_SOURCE_REVIEW_V1.prNumber,21);
  assert.equal(ALIEN_BASE_REGISTRY_V2_SOURCE_REVIEW_V1.commit,'d2ff9fef4df40934f35796b9fe361e65315d1ac2');
  assert.equal(ALIEN_BASE_REGISTRY_V2_SOURCE_REVIEW_V1.status,'unmerged-source-review-pending');
  assert.equal(ALIEN_BASE_REGISTRY_V2_SOURCE_REVIEW_V1.approvedCanonicalIdentityMerges,0);
  const queen=resolveAlienBaseRegistryV2CandidateV1('enemy-008-queen');
  assert.equal(queen?.registryV2CandidateId,'bio.xenomorph.queen');
  assert.equal(queen.legacyMasterCandidateId,'caste.queen');
  assert.equal(queen.approvedCanonicalIdentity,false);
  assert.equal(queen.autoMergeStats,false);
  assert.equal(queen.visualFidelityCertified,false);
  assert.equal(resolveAlienBaseMasterEntityV1('enemy-008-queen'),null);
  const drone=resolveAlienBaseRegistryV2CandidateV1('enemy-004-drone-big-chap');
  assert.equal(drone.registryV2CandidateId,'bio.xenomorph.big-chap');
  assert.equal(drone.legacyMasterCandidateId,'caste.drone');
  assert.notEqual(drone.registryV2CandidateId,'bio.xenomorph.drone','preserve film phenotype split');
  for (const local of ['weapon-147-ocap-91-volcan','weapon-190-type-95-combat-pistol','vehicle-282-covenant-terraforming-truck','personnel-archive-ellen-ripley','siren','gasbag','wey-yu-worker']) {
    assert.equal(resolveAlienBaseRegistryV2CandidateV1(local),null,'never guess missing binding: '+local);
  }
  const mapping=resolveAlienBaseGameMappingV1('enemy-008-queen');
  assert.equal(mapping.candidateRegistryV2Id,'bio.xenomorph.queen');
  assert.equal(mapping.candidateRegistryV2Status,'unmerged-source-review-pending');
  assert.equal(mapping.canonicalIdentityApproved,false);
  assert.equal(auditAlienBaseBridgeV1().registryV2CandidateLocalBindings,38);
  assert.equal(auditAlienBaseBridgeV1().registryV2ApprovedCanonicalAliases,0);
  assert.throws(()=>{queen.registryV2CandidateId='bio.xenomorph.drone'},TypeError);
});

test('A proposed weapon stays documentary, not purchasable or a new game ID', () => {
  const id='proposed-m41a3-burst-rifle';
  const note=resolveAlienBaseWeaponReferenceV1(id);
  assert.equal(note?.admission,'research-only');
  assert.equal(WEAPONS.some(x=>x.id===id),false);
  const mapped=resolveAlienBaseGameMappingV1(id);
  assert.equal(mapped.researchOnly,true);
  assert.equal(mapped.runtimePresent,false);
  assert.equal(resolveAlienBaseGameMappingV1('weapon-001-m41a-pulse-rifle')?.runtimePresent,true);
});

test('Bridge never renumbers or overlays simulation data', () => {
  const before=WEAPONS.map(x=>[x.id,x.damage,x.magazine]);
  const original=ENEMIES.map(x=>[x.id,x.health,x.damage]);
  const count=[WEAPONS.length, ENEMIES.length, VEHICLES.length,EQUIPMENT.length,CREW.length];
  const report=auditAlienBaseBridgeV1();
  assert.equal(report.curatedDossiers,46);
  assert.equal(report.masterEntities,84);
  assert.equal(report.masterLinks,45);
  assert.equal(report.unlinkedDossiers,1);
  assert.equal(report.researchOnlyWeapons,129);
  assert.deepEqual(WEAPONS.map(x=>[x.id,x.damage,x.magazine]),before);
  assert.deepEqual(ENEMIES.map(x=>[x.id,x.health,x.damage]),original);
  assert.deepEqual([WEAPONS.length, ENEMIES.length, VEHICLES.length,EQUIPMENT.length,CREW.length],count);
});

test('Outbound Tantalus audit separates source identity from game tuning', () => {
  const out=exportTantalusInventoryV1();
  assert.equal(out.schemaVersion,'1.0.0');
  assert.equal(out.catalogues.weapons.length,WEAPONS.length);
  assert.equal(out.catalogues.enemies.length,ENEMIES.length);
  assert.equal(out.catalogues.afe2Roster.length,35);
  assert.equal(out.catalogues.weapons[0].identity.id,WEAPONS[0].id);
  assert.equal(out.catalogues.weapons[0].identity.damage,undefined);
  assert.equal(out.catalogues.weapons[0].gameplayTuning.damage,WEAPONS[0].damage);
});

test('In-game catalogue displays reference without inventing a canon or a playable item', () => {
  const rendered = [];
  const doc = { createElement(tag) {
    return { tagName:tag, className:'', textContent:'', dataset:{}, children:[],
      append(...items) { this.children.push(...items); } };
  } };
  const context = { document:doc, detail:{append(x){rendered.push(x);}},
    renderSection:CatalogWorkbenchV62.prototype.renderSection };
  const render = CatalogWorkbenchV62.prototype.renderAlienBaseReferenceV1;
  render.call(context,{id:'enemy-008-queen',catalog:'enemies'});
  assert.equal(rendered.length,1);
  assert.equal(rendered[0].dataset.sectionKind,'shared-alien-base-v1');
  assert.ok(rendered[0].children.some(x=>x.textContent.includes('Aliens (1986)')));
  assert.equal(rendered[0].children.some(x=>/1:1|Alien_base|schema|caste\.queen|source-version-review-pending/.test(x.textContent)),false, 'Player dossier must not show developer implementation notes');
  context.developerModeV110=true; render.call(context,{id:'enemy-008-queen',catalog:'enemies'});
  assert.equal(rendered[1].dataset.identityLinkStatus,'source-version-review-pending');
  assert.ok(rendered[1].children.some(x=>x.textContent.includes('1:1')));
  assert.equal(rendered[1].dataset.registryV2CandidateId,'bio.xenomorph.queen');
  assert.ok(rendered[1].children.some(x=>x.textContent.includes('Registre v2 (PR ouverte')));
  render.call(context,{id:'no-common-entry',catalog:'enemies'});
  assert.equal(rendered.length,2, 'unknown references must not show fake canon');
});
