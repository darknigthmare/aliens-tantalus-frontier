import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadAlienBasePr7ProposalV1,inspectAlienBasePr7ProposalV1,freezeProposalDataV1} from './alien-base-pr7-proposal-v1.mjs';
const root=new URL('../',import.meta.url);
const manifest=()=>JSON.parse(readFileSync(new URL('docs/development/data/ALIEN_BASE_PR7_PROVENANCE_V1.json',root),'utf8'));
const bytes=()=>readFileSync(new URL('docs/development/data/ALIEN_BASE_PR7_REGISTRY_V1.json',root));
const load=()=>loadAlienBasePr7ProposalV1(root.pathname);
test('unmerged PR7 yields 15 exact pending proposals and zero active canonical or gameplay bindings',()=>{
  const result=load();assert.equal(result.bindingList.length,15);assert.equal(result.audit.activeBindings,0);
  assert.equal(result.audit.pendingCrosswalks,15);assert.equal(result.audit.newQaRecipesClosed,0);
  assert.equal(result.audit.newProposedWeaponsClosed,0);
  for(const row of result.bindingList){assert.equal(row.canonicalTargetId,null);assert.equal(row.active,false);
    assert.equal(row.gameplayAdmission,false);assert.equal(row.canonExact,false);assert.equal(row.visualFidelity1to1,false);}
});
test('Aliens 1986 egg remains work-specific pending and never becomes the source 1979 visual identity',()=>{
  const egg=load().getPendingProposal('castes-film_ovomorphe_aliens_1986');
  assert.equal(egg.state,'pending-work-specific-proof');assert.deepEqual(egg.reference.sourceIds,['alien-1979']);
  assert.equal(egg.active,false);assert.equal(egg.canonicalTargetId,null);
});
test('M579 proposed classification follows the technical reference book, preserving raw source bytes',()=>{
  const before=bytes(),r=load().getPendingProposal('vehicle-280-m579-daisycutter');
  assert.equal(r.reference.continuity,'licensed-book');assert.equal(r.classificationProposals[0].original,'licensed-rpg');
  assert.deepEqual(r.reference.sourceIds,['colonial-marines-tech-manual']);assert.deepEqual(bytes(),before);
});
test('unknown IDs, translated names, padded IDs and gameplay research names never resolve by resemblance',()=>{
  const r=load();for(const id of['Reine','queen','ab:organism:queen-1986','castes-film_queen_aliens_1986 ',
    'vehicle-280-anything','weapon-001-m41a-pulse-rifle','proposed-m41a3-burst-rifle',null,{}])assert.equal(r.getPendingProposal(id),null);
});
test('the loader clones and freezes nested records even below already frozen input arrays',()=>{
  const source=Object.freeze({records:Object.freeze([{nested:{name:'source'}}])}),copy=freezeProposalDataV1(source);
  assert.notEqual(copy,source);assert.notEqual(copy.records,source.records);
  assert.ok(Object.isFrozen(copy.records[0].nested));assert.throws(()=>{copy.records[0].nested.name='changed';},TypeError);
  assert.equal(source.records[0].nested.name,'source');source.records[0].nested.name='caller';
  assert.equal(copy.records[0].nested.name,'source');
  const result=load();assert.throws(()=>{result.bindingList[0].reference.sourceIds.push('invented');},TypeError);
  assert.throws(()=>{result.metadata.sourcePins['data/registry.json'].sha256='0'.repeat(64);},TypeError);
});
test('foreign commits, forged pins, changed bytes, duplicate bindings and active statuses fail without mutation',()=>{
  const changes=[m=>m.sourceCommit='0'.repeat(40),m=>m.active=true,m=>m.canonExact=true,m=>m.newQaRecipesClosed=1,
    m=>m.bindings[0].canonicalTargetId='caste.queen',m=>m.bindings[0].state='approved',
    m=>m.bindings[0].localId='enemy-008-queen',m=>m.bindings[0].proposedSourceId='ab:organism:queen-1986',
    m=>m.bindings[1]={...m.bindings[0]},m=>m.sourcePins['dist/catalog.mjs'].sha256='0'.repeat(64),
    m=>m.sourcePins['schema/registry.schema.json'].gitBlobSha='0'.repeat(40),
    m=>m.sourcePins['integrations/aliens-tantalus-frontier.json'].bytes=1,
    m=>m.expectedRecords=999,m=>m.classificationProposals[0].proposed='film'];
  for(const change of changes){const m=manifest();change(m);const before=structuredClone(m);
    assert.throws(()=>inspectAlienBasePr7ProposalV1({manifest:m,registryBytes:bytes()}),TypeError);assert.deepEqual(m,before);}
  const altered=Buffer.from(bytes());altered[altered.length-2]=32;
  assert.throws(()=>inspectAlienBasePr7ProposalV1({manifest:manifest(),registryBytes:altered}),TypeError);
});
