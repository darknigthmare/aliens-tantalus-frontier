import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import * as snapshot from '../src/alien-base-snapshot-v1.js';
import { ALIEN_BASE_SOURCE_AUTHORITY_V1, renderAlienBaseSnapshotV1, syncAlienBaseV1 } from './sync-alien-base-v1.mjs';
import { exportTantalusInventoryV1 } from './export-alien-base-tantalus-v1.mjs';
import { VEHICLES } from '../src/content-core-v50.js';
import { resolveAlienBaseMasterEntityV1, resolveAlienBaseDossierV1, resolveAlienBaseIdentityProposalV1, resolveAlienBaseGameMappingV1, auditAlienBaseBridgeV1 } from '../src/alien-base-bridge-v1.js';

const inputs = () => structuredClone([
  {schemaVersion:'1.0.0',sourceRevision:snapshot.ALIEN_BASE_SNAPSHOT_INFO_V1.gameCatalogBaselineCommit,entries:snapshot.ALIEN_BASE_ENTITIES_V1},
  {schemaVersion:'1.0.0',entries:snapshot.ALIEN_BASE_WEAPONS_V1},
  {schemaVersion:1,entities:snapshot.ALIEN_BASE_MASTER_ENTITIES_V1},
  {schemaVersion:1,links:snapshot.ALIEN_BASE_MASTER_LINKS_V1}
]);

const rejected = [
  ['traits string cannot reach codex join', x=>x[0].entries[0].traits='egg-stage', /traits must be an array/],
  ['sourceLinks string cannot reach codex map', x=>x[0].entries[0].sourceLinks='https://example.com/', /sourceLinks must be an array/],
  ['traits objects cannot import nested values', x=>x[0].entries[0].traits=[{damage:999}], /traits\[0\].*string/],
  ['gameRefs rejects arbitrary nested fields', x=>x[0].entries[0].gameRefs.unreviewed={damage:999}, /gameRefs.unreviewed is not allowed/],
  ['gameRefs rejects another consumer namespace', x=>x[0].entries[0].gameRefs.otherGame=['invented'], /gameRefs.otherGame is not allowed/],
  ['local alias cannot target two dossiers', x=>x[0].entries[1].gameRefs.tantalus.push(x[0].entries[0].gameRefs.tantalus[0]), /Ambiguous local alias/],
  ['local aliases must be strings', x=>x[0].entries[0].gameRefs.tantalus=[{}], /gameRefs.tantalus\[0\].*string/],
  ['duplicate dossier rejected', x=>x[0].entries[1].id=x[0].entries[0].id, /duplicate id/],
  ['top-level combat field rejected', x=>x[0].entries[0].health=999, /health is not allowed/],
  ['source-link fields are closed', x=>x[0].entries[0].sourceLinks=[{url:'https://example.com/',level:'reference-to-review',damage:999}], /damage is not allowed/],
  ['source-link evidence cannot auto-approve', x=>x[0].entries[0].sourceLinks=[{url:'https://example.com/',level:'canon-verified'}], /level is unreviewed/],
  ['unsafe reference credentials rejected', x=>x[0].entries[0].sourceLinks=[{url:'https://user:pass@example.com/',level:'reference-to-review'}], /public HTTPS reference/],
  ['reference query payload rejected', x=>x[0].entries[0].sourceLinks=[{url:'https://example.com/?unreviewed=value',level:'reference-to-review'}], /public HTTPS reference/],
  ['duplicate weapon rejected', x=>x[1].entries[1].id=x[1].entries[0].id, /duplicate id/],
  ['proposed weapon cannot become admitted', x=>x[1].entries.find(w=>w.id.startsWith('proposed-')).admission='identity-in-project-catalogue', /admission is unreviewed/],
  ['proposed weapon status cannot claim runtime admission', x=>x[1].entries.find(w=>w.id.startsWith('proposed-')).gameStatus='En catalogue (identité)', /gameStatus has an unsupported value/],
  ['weapon missing-evidence shape enforced', x=>x[1].entries.find(w=>w.id.startsWith('proposed-')).missing={ready:true}, /missing.*string/],
  ['duplicate master ID rejected', x=>x[2].entities[1].id=x[2].entities[0].id, /duplicate id/],
  ['master source cannot dangle', x=>x[2].entities[0].sourceIds=['unknown-source'], /unknown source/],
  ['master source scope must match', x=>x[2].entities[0].canonScope='project_original', /canonScope contradicts/],
  ['master review cannot silently approve canon', x=>x[2].entities[0].review='canon-verified', /review is unreviewed/],
  ['universal stats policy rejected', x=>x[2].entities[0].statPolicy='import-combat-stats', /statPolicy is unreviewed/],
  ['duplicate master target rejected', x=>x[3].links[1].sharedEntityId=x[3].links[0].sharedEntityId, /Ambiguous master target/],
  ['crosswalk game IDs must match the dossier', x=>x[3].links[0].gameRecordIds=['wrong-game-id'], /gameRecordIds contradicts/],
  ['unknown link target rejected', x=>x[3].links[0].sharedEntityId='caste.invented', /unknown entity/],
  ['relation enum rejected', x=>x[3].links[0].relation='exact-canon-confirmed', /relation has an unsupported value/],
  ['pending status cannot silently become approved', x=>x[3].links[0].status='verified', /status is unreviewed/],
  ['stats merge cannot be enabled', x=>x[3].links[0].autoMergeStats=true, /autoMergeStats is unreviewed/],
  ['invented source revision rejected', x=>x[0].sourceRevision='0'.repeat(40), /sourceRevision is unreviewed/],
  ['mislabelled source repository rejected', x=>x[0].sourceRepo='darknigthmare/alien_base', /sourceRepo is unreviewed/],
  ['shape-valid unreviewed content still requires a source review', x=>x[0].entries[0].name='Different identity', /Reviewed projection .* is unreviewed/]
];
for(const [name,mutate,reason]of rejected)test('Reviewed Alien_base import: '+name,()=>{const x=inputs();mutate(x);assert.throws(()=>renderAlienBaseSnapshotV1(...x),reason);});

test('Direct snapshot imports recursively freeze records and authority, including nested arrays',()=>{
  let inspected=0;const inspect=value=>{if(value&&typeof value==='object'){assert.equal(Object.isFrozen(value),true);inspected++;Object.values(value).forEach(inspect);}};
  Object.values(snapshot).forEach(inspect);inspect(ALIEN_BASE_SOURCE_AUTHORITY_V1);assert.ok(inspected>500);
  const queen=resolveAlienBaseDossierV1('enemy-008-queen');assert.throws(()=>queen.name='Changed',TypeError);assert.throws(()=>queen.traits.push('Changed'),TypeError);
  assert.throws(()=>snapshot.ALIEN_BASE_SNAPSHOT_INFO_V1.sourceFiles[0].sha256='0'.repeat(64),TypeError);
  assert.equal(queen.name,'Queen');
});

test('Every source-version-pending link remains an unactivated proposal',()=>{
  for(const link of snapshot.ALIEN_BASE_MASTER_LINKS_V1){
    const proposal=resolveAlienBaseIdentityProposalV1(link.dossierId);assert.equal(proposal,link);assert.equal(proposal.status,'source-version-review-pending');
    assert.equal(resolveAlienBaseMasterEntityV1(link.dossierId),null);
    assert.equal(resolveAlienBaseDossierV1(link.sharedEntityId),null);
    assert.equal(resolveAlienBaseMasterEntityV1(link.sharedEntityId)?.id,link.sharedEntityId);
    for(const local of link.gameRecordIds){const mapping=resolveAlienBaseGameMappingV1(local);assert.equal(mapping.masterId,null);assert.equal(mapping.dossierId,link.dossierId);assert.equal(mapping.canonicalIdentityApproved,false);assert.equal(mapping.candidateMasterId,link.sharedEntityId);assert.equal(mapping.identityLinkStatus,link.status);assert.equal(mapping.identityLinkRelation,link.relation);}
  }
  const report=auditAlienBaseBridgeV1();assert.equal(report.pendingMasterLinks,45);assert.equal(report.activeMasterAliases,0);
  assert.equal(resolveAlienBaseIdentityProposalV1('ab:faction:union-of-progressive-peoples-alien-franchise'),null);
});

test('Source provenance distinguishes upstream Git ref from game catalogue ref and four independent raw hashes',()=>{
  const info=snapshot.ALIEN_BASE_SNAPSHOT_INFO_V1;
  assert.equal(info.upstreamCommit,'284e9da402b5be0da3f561459ea96224e9d59b6c');
  assert.equal(info.gameCatalogBaselineCommit,'d41b5fc120da2e7a5938308f9d3c852d20e53cc5');assert.notEqual(info.upstreamCommit,info.gameCatalogBaselineCommit);
  assert.equal(info.sourceCommit,undefined);assert.equal(info.sourceRepo,'darknigthmare/alien_base');
  assert.deepEqual(info.sourceFiles,[
    {path:'catalog/entities-v1.json',sha256:'78a27e5a0391ac829a36eff9a9bb6a8b5a7dc72ce1ca40c231d30a3251514534'},
    {path:'catalog/weapons-v1.json',sha256:'d2299c96c3cf8dd1eff566b131203e7c398c00c35cff8dc0401b176f0fdd3425'},
    {path:'data/catalog.v1.json',sha256:'c224b2ee7cd3368b59a43d24db6b9aa1c2d09e538cb9f4227f62e60bae660548'},
    {path:'links/tantalus-entity-links.v1.json',sha256:'80274744c38de5e966b33c2f209a9a4d3c8e37013c099326d3de5bd3e9938f4c'}
  ]);
});

test('Offline sync refuses unreviewed raw source bytes before replacing an existing output',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'atf-alien-import-'));
  try {
    const source=inputs();
    for(let i=0;i<source.length;i++){const path=join(dir,ALIEN_BASE_SOURCE_AUTHORITY_V1.files[i].path);await mkdir(dirname(path),{recursive:true});await writeFile(path,JSON.stringify(source[i]));}
    const out=join(dir,'retained.js');await writeFile(out,'RETAIN EXISTING OUTPUT\n');
    await assert.rejects(syncAlienBaseV1({basePath:dir,outputPath:out}),/Source bytes catalog\/entities-v1.json is unreviewed/);
    assert.equal(await readFile(out,'utf8'),'RETAIN EXISTING OUTPUT\n');
  }finally{await rm(dir,{recursive:true,force:true});}
});

test('Outbound documentary export and live catalogues share no mutable object references in either direction',()=>{
  const first=exportTantalusInventoryV1(), second=exportTantalusInventoryV1();
  const vehicle=VEHICLES.find(row=>Array.isArray(row.actions)&&row.actions.length);
  const exported=first.catalogues.vehicles.find(row=>row.identity.id===vehicle.id);
  const independent=second.catalogues.vehicles.find(row=>row.identity.id===vehicle.id);
  assert.deepEqual(exported.gameplayTuning.actions,vehicle.actions);
  assert.notEqual(exported.gameplayTuning.actions,vehicle.actions);
  assert.notEqual(exported.gameplayTuning.actions,independent.gameplayTuning.actions);
  const original=structuredClone(vehicle.actions), originalExport=structuredClone(exported.gameplayTuning.actions);
  exported.gameplayTuning.actions.push('export-only-change');
  assert.deepEqual(vehicle.actions,original);assert.deepEqual(independent.gameplayTuning.actions,original);
  try {vehicle.actions.push('live-only-change');assert.deepEqual(exported.gameplayTuning.actions,[...originalExport,'export-only-change']);}
  finally {vehicle.actions.splice(0,vehicle.actions.length,...original);}
  assert.deepEqual(vehicle.actions,original);
});
