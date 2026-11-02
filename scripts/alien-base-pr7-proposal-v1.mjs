/** Repository tooling only. This unmerged reference proposal is never a
 * client import, canonical crosswalk, gameplay admission or 1:1 receipt. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';

const SOURCE_COMMIT='311f7a367825fc115ad45b3772255cdfb7cc056c';
const PINS=Object.freeze({
  "data/registry.json": {
    "sha256": "ce669770c760960a7d3b07be4c4e9531e2656d3967ae435c62fe0f692952c977",
    "gitBlobSha": "d5ce5b00c02b0ea128724664f158dfcd5140984e",
    "bytes": 51784
  },
  "dist/catalog.mjs": {
    "sha256": "9657d224c711cb6ecb7c66c9a823c0bbea6120067dd54111a66a11a7c3a85592",
    "gitBlobSha": "1ced2c32a54bb03a247fb50fb184e4ad0e1b2a77",
    "bytes": 51904
  },
  "schema/registry.schema.json": {
    "sha256": "d120efaa02dbd554dfd10d79b134b62a468c74fd9a345ccf500153e7318133f3",
    "gitBlobSha": "0771bfc2842ce0db9a1ae6343a22698f75341417",
    "bytes": 2568
  },
  "integrations/aliens-tantalus-frontier.json": {
    "sha256": "fd9ac11915681f9c9f569140bc38261ea0733ebfbb6c37141f37c578408ba8a0",
    "gitBlobSha": "9187f063f9451dd6332a7fcad95617c94d9417b1",
    "bytes": 576
  }
});
const SHA=/^[a-f0-9]{64}$/,BLOB=/^[a-f0-9]{40}$/;
const EGG='castes-film_ovomorphe_aliens_1986';
const manifestPath='docs/development/data/ALIEN_BASE_PR7_PROVENANCE_V1.json';
const registryPath='docs/development/data/ALIEN_BASE_PR7_REGISTRY_V1.json';
const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const check=(ok,message)=>{if(!ok)throw new TypeError('Alien_base PR7 proposal: '+message);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

/** Clone first. Recurse through children even if an ancestor was already
 * frozen: Object.freeze(array) does not freeze its record elements. */
export function freezeProposalDataV1(input){
  const value=structuredClone(input),seen=new WeakSet();
  const freeze=x=>{
    if(x===null||typeof x!=='object'||seen.has(x))return x;
    seen.add(x);for(const child of Object.values(x))freeze(child);
    return Object.freeze(x);
  };
  return freeze(value);
}

export function inspectAlienBasePr7ProposalV1({manifest,registryBytes}={}){
  check(record(manifest),'missing manifest');
  const metadata=freezeProposalDataV1(manifest);
  check(metadata.schema==='tantalus-alien-base-pr7-proposal-v1','unknown schema');
  check(metadata.sourceRepository==='darknigthmare/alien_base'&&metadata.sourceCommit===SOURCE_COMMIT,
    'unreviewed repository or commit');
  check(metadata.sourcePullRequest===7&&metadata.sourceState==='unmerged-conflicting','source cannot become active');
  check(metadata.proposalId==='alien-base-pr7-'+SOURCE_COMMIT,'unknown proposal identity');
  check(metadata.active===false&&metadata.gameplayAdmission===false&&metadata.canonExact===false
    &&metadata.visualFidelity1to1===false&&metadata.newProposedWeaponsClosed===0&&metadata.newQaRecipesClosed===0,
    'a reference proposal cannot admit content or close QA');
  check(metadata.sourceRegistryPath===registryPath,'unexpected registry path');
  check(record(metadata.sourcePins)&&same(Object.keys(metadata.sourcePins).sort(),Object.keys(PINS).sort()),'source pin set changed');
  for(const[path,expected]of Object.entries(PINS)){
    const pin=metadata.sourcePins[path];
    check(pin?.sha256===expected.sha256&&pin.gitBlobSha===expected.gitBlobSha&&pin.bytes===expected.bytes
      &&SHA.test(pin.sha256)&&BLOB.test(pin.gitBlobSha),'unreviewed source pin '+path);
  }
  check(Buffer.isBuffer(registryBytes)||typeof registryBytes==='string','missing original registry bytes');
  const raw=Buffer.isBuffer(registryBytes)?registryBytes:Buffer.from(registryBytes);
  check(raw.length===metadata.sourcePins['data/registry.json'].bytes
    &&createHash('sha256').update(raw).digest('hex')===PINS['data/registry.json'].sha256,'original source bytes changed');
  check(metadata.snapshotVersion==='0.1.1'&&metadata.expectedRecords===88&&metadata.expectedSources===22,'proposal counts changed');
  const source=JSON.parse(raw.toString('utf8'));
  check(source.schemaVersion===1&&source.version==='0.1.1'&&source.records?.length===88&&source.sources?.length===22,
    'source shape changed');
  const sourceIds=new Set(source.sources.map(x=>x.id)),records=new Map(),nativeBindings=new Map();
  check(sourceIds.size===22,'ambiguous source identity');
  for(const r of source.records){
    check(typeof r.id==='string'&&!records.has(r.id),'ambiguous record identity');records.set(r.id,r);
    check(r.review==='source-specific-check-required'&&Array.isArray(r.sourceIds)
      &&r.sourceIds.every(id=>sourceIds.has(id)),'unreviewed source status '+r.id);
    for(const localId of r.gameBindings?.['aliens-tantalus-frontier']||[]){
      check(typeof localId==='string'&&!nativeBindings.has(localId),'ambiguous native binding');
      nativeBindings.set(localId,r.id);
    }
  }
  check(Array.isArray(metadata.bindings)&&metadata.bindings.length===15&&nativeBindings.size===15,'binding coverage changed');
  const correction=metadata.classificationProposals;
  check(Array.isArray(correction)&&correction.length===1&&correction[0].sourceId==='ab:vehicle:m579'
    &&correction[0].field==='continuity'&&correction[0].original==='licensed-rpg'
    &&correction[0].proposed==='licensed-book','unreviewed classification correction');
  check(records.get('ab:vehicle:m579')?.sourceIds.includes('colonial-marines-tech-manual')
    &&source.sources.find(s=>s.id==='colonial-marines-tech-manual')?.medium==='licensed-book',
    'M579 reference-book classification is not established');
  const views=new Map();
  for(const binding of metadata.bindings){
    check(record(binding)&&!views.has(binding.localId)&&nativeBindings.get(binding.localId)===binding.proposedSourceId,
      'unknown or ambiguous local/shared binding');
    const original=records.get(binding.proposedSourceId);
    check(binding.canonicalTargetId===null&&binding.relation==='proposed-reference-only'
      &&same(binding.sourceIds,original.sourceIds),'unapproved crosswalk or source rewrite');
    check(binding.state===(binding.localId===EGG?'pending-work-specific-proof':'pending-authority-and-crosswalk'),
      'unapproved binding state');
    const reference=structuredClone(original),corrections=correction.filter(c=>c.sourceId===original.id);
    for(const c of corrections){check(reference[c.field]===c.original,'correction predecessor changed');reference[c.field]=c.proposed;}
    views.set(binding.localId,freezeProposalDataV1({...binding,reference,classificationProposals:corrections,
      active:false,gameplayAdmission:false,canonExact:false,visualFidelity1to1:false}));
  }
  check(views.size===nativeBindings.size&&[...nativeBindings.keys()].every(k=>views.has(k)),'missing native binding');
  const bindingList=freezeProposalDataV1([...views.values()]);
  const audit=freezeProposalDataV1({sourceCommit:SOURCE_COMMIT,bindings:15,activeBindings:0,
    pendingCrosswalks:15,workSpecificProofMissing:[EGG],newQaRecipesClosed:0,newProposedWeaponsClosed:0});
  return Object.freeze({metadata,audit,bindingList,
    getPendingProposal:localId=>typeof localId==='string'?views.get(localId)||null:null});
}

export function loadAlienBasePr7ProposalV1(root=resolve(dirname(fileURLToPath(import.meta.url)),'..')){
  return inspectAlienBasePr7ProposalV1({manifest:JSON.parse(readFileSync(resolve(root,manifestPath),'utf8')),
    registryBytes:readFileSync(resolve(root,registryPath))});
}
