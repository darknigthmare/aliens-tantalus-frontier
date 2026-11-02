/** Offline projection of one reviewed Alien_base source artifact.
 * Updating this V1 input manifest requires a new source review, not an automatic sync. */
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ENTITY_FIELDS = ['id','kind','name','sourceWork','continuity','gameRefs','traits','status','visualFidelity','sourceLinks','note'];
const WEAPON_FIELDS = ['id','name','work','media','manufacturer','family','role','identityEvidence','gameStatus','admission','visualFidelity','sourceUrl','missing'];
const MASTER_FIELDS = ['id','type','name','sourceIds','canonScope','statPolicy','review','notes'];
const LINK_FIELDS = ['dossierId','sharedEntityId','gameRecordIds','relation','status','autoMergeStats'];
const WEAPON_SOURCE_FIELDS = ['evidenceRank','feed','ammoClaim','capacityClaim','visualRef','spriteSheet','statsPolicy'];
const deepFreeze = value => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    if (!Object.isFrozen(value)) Object.freeze(value);
  }
  return value;
};
export const ALIEN_BASE_SOURCE_AUTHORITY_V1 = deepFreeze({
  repository: 'darknigthmare/alien_base',
  upstreamCommit: '284e9da402b5be0da3f561459ea96224e9d59b6c',
  gameCatalogRepository: 'darknigthmare/aliens-tantalus-frontier',
  gameCatalogBaselineCommit: 'd41b5fc120da2e7a5938308f9d3c852d20e53cc5',
  files: [
    {path:'catalog/entities-v1.json', sha256:'78a27e5a0391ac829a36eff9a9bb6a8b5a7dc72ce1ca40c231d30a3251514534', projectedSha256:'2b1186104d49505e2d2fe8f73ae71393ced71bc8312ebbce6ddae05e94a464ae'},
    {path:'catalog/weapons-v1.json', sha256:'d2299c96c3cf8dd1eff566b131203e7c398c00c35cff8dc0401b176f0fdd3425', projectedSha256:'4a31626be9ad46b762e2af9dfafbe33e3f7b7a17b6ae054850b43eabe736e789'},
    {path:'data/catalog.v1.json', sha256:'c224b2ee7cd3368b59a43d24db6b9aa1c2d09e538cb9f4227f62e60bae660548', projectedSha256:'554a7164cd7e45b23cfe5cdf5c51beff53df61232ede622f176bad6d06084e97'},
    {path:'links/tantalus-entity-links.v1.json', sha256:'80274744c38de5e966b33c2f209a9a4d3c8e37013c099326d3de5bd3e9938f4c', projectedSha256:'4de68854f7086e3d93ca03f776ce165879466b3a479f10a657a64d8c4efa8e34'}
  ]
});
const digest = value => createHash('sha256').update(value).digest('hex');
const canonical = value => Array.isArray(value) ? '[' + value.map(canonical).join(',') + ']'
  : value && typeof value === 'object' ? '{' + Object.keys(value).sort().map(key => JSON.stringify(key)+':'+canonical(value[key])).join(',') + '}'
    : JSON.stringify(value);
const fail = message => { throw new TypeError('Alien_base: ' + message); };
const exact = (actual, expected, path) => { if (actual !== expected) fail(path + ' is unreviewed'); };
const object = (value, required, optional, path) => {
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype,null].includes(Object.getPrototypeOf(value))) fail(path+' must be an object');
  for (const key of Object.keys(value)) if (![...required,...optional].includes(key)) fail(path+'.'+key+' is not allowed');
  for (const key of required) if (!Object.hasOwn(value,key)) fail(path+'.'+key+' is required');
};
const string = (value, path, pattern) => {
  if (typeof value !== 'string' || !value.trim() || value.length > 4000 || /[\u0000-\u001f\u007f]/.test(value) || (pattern && !pattern.test(value))) fail(path+' must be a valid string');
};
const enumeration = (value, values, path) => { if (!values.includes(value)) fail(path+' has an unsupported value'); };
const array = (value, path) => { if (!Array.isArray(value)) fail(path+' must be an array'); };
const strings = (value, path, pattern) => {
  array(value,path); value.forEach((item,i)=>string(item,path+'['+i+']',pattern));
  if (new Set(value).size !== value.length) fail(path+' contains duplicates');
};
const https = (value, path) => {
  string(value,path); let url;
  try { url = new URL(value); } catch { fail(path+' must be an HTTPS reference'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) fail(path+' must be a public HTTPS reference without credentials/query/fragment');
};
const ids = (rows, field, path) => {
  array(rows,path); const values=rows.map(row=>row?.[field]);
  if (new Set(values).size !== values.length) fail(path+' contains duplicate '+field);
};
const select = (row, fields) => Object.fromEntries(fields.map(field=>[field,structuredClone(row[field])]));
const LOCAL_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DOSSIER_ID = /^ab:[a-z]+:[a-z0-9-]+$/;
const MASTER_ID = /^[a-z0-9_]+[.][a-z0-9_]+$/;
const SOURCE_IDS = ['alien1979','aliens1986','alien3','alienres','avp2004','avpr2007','prometheus2012','covenant2017','romulus2024','predator1987','predator2','prey2022','avpextinction','acm2013','alienisolation','fireteamelite','bloodarena','alienearth2025','tantalus2026'];
const SOURCE_SCOPES = Object.freeze({alien1979:'film',aliens1986:'film',alien3:'film',alienres:'film',avp2004:'crossover',avpr2007:'crossover',prometheus2012:'film',covenant2017:'film',romulus2024:'film',predator1987:'predator',predator2:'predator',prey2022:'predator',avpextinction:'expanded',acm2013:'expanded',alienisolation:'expanded',fireteamelite:'expanded',bloodarena:'original_game',alienearth2025:'series',tantalus2026:'project_original'});
const RELATIONS = ['reviewed-identity-alias','same-object-different-game-classification','specific-variant-of','project-original-record'];

/** Check nested types before enforcing the reviewed projection's independent hashes. */
export function validateAlienBaseInputsV1(entityFile, weaponFile, masterFile, linkFile) {
  object(entityFile,['schemaVersion','sourceRevision','entries'],['sourceRepo','scope'],'entities');
  object(weaponFile,['schemaVersion','entries'],['sourceRepo','sourceRevision','sourcePath','total','disclaimer'],'weapons');
  object(masterFile,['schemaVersion','entities'],['version','owner','description','sources'],'master');
  object(linkFile,['schemaVersion','links'],['masterCatalog','detailCatalog','description','linked','pending','pendingDetails'],'links');
  exact(entityFile.schemaVersion,'1.0.0','entities.schemaVersion'); exact(weaponFile.schemaVersion,'1.0.0','weapons.schemaVersion');
  exact(masterFile.schemaVersion,1,'master.schemaVersion'); exact(linkFile.schemaVersion,1,'links.schemaVersion');
  exact(entityFile.sourceRevision,ALIEN_BASE_SOURCE_AUTHORITY_V1.gameCatalogBaselineCommit,'entities.sourceRevision');
  for (const [file,path] of [[entityFile,'entities'],[weaponFile,'weapons']]) {
    if (Object.hasOwn(file,'sourceRepo')) exact(file.sourceRepo,ALIEN_BASE_SOURCE_AUTHORITY_V1.gameCatalogRepository,path+'.sourceRepo');
    if (Object.hasOwn(file,'sourceRevision')) exact(file.sourceRevision,ALIEN_BASE_SOURCE_AUTHORITY_V1.gameCatalogBaselineCommit,path+'.sourceRevision');
  }
  for (const [file,key] of [[entityFile,'scope'],[weaponFile,'disclaimer'],[masterFile,'version'],[masterFile,'description'],[linkFile,'description']]) if (Object.hasOwn(file,key)) string(file[key],key);
  if (Object.hasOwn(weaponFile,'sourcePath')) exact(weaponFile.sourcePath,'docs/arsenal/data/tantalus_arsenal_master_v1.csv','weapons.sourcePath');
  if (Object.hasOwn(masterFile,'owner')) exact(masterFile.owner,'alien_base','master.owner');
  if (Object.hasOwn(linkFile,'masterCatalog')) exact(linkFile.masterCatalog,'data/catalog.v1.json','links.masterCatalog');
  if (Object.hasOwn(linkFile,'detailCatalog')) exact(linkFile.detailCatalog,'catalog/entities-v1.json','links.detailCatalog');
  ids(entityFile.entries,'id','entities.entries'); ids(weaponFile.entries,'id','weapons.entries'); ids(masterFile.entities,'id','master.entities'); ids(linkFile.links,'dossierId','links.links');
  const aliases=new Set(), dossiers=new Map(), masters=new Set(), masterTargets=new Set();
  for (const [i,row] of entityFile.entries.entries()) {
    const path='entities['+i+']'; object(row,ENTITY_FIELDS,[],path);
    string(row.id,path+'.id',DOSSIER_ID); string(row.name,path+'.name'); string(row.sourceWork,path+'.sourceWork'); string(row.note,path+'.note');
    enumeration(row.kind,['organism','synthetic','vehicle','equipment','weapon','faction','character'],path+'.kind');
    enumeration(row.continuity,['work-identified','tantalus-original'],path+'.continuity');
    exact(row.status,'documentary-identity-not-playable-proof',path+'.status'); exact(row.visualFidelity,'not-1to1-certified',path+'.visualFidelity');
    object(row.gameRefs,['tantalus'],[],path+'.gameRefs'); strings(row.gameRefs.tantalus,path+'.gameRefs.tantalus',LOCAL_ID);
    for(const id of row.gameRefs.tantalus) {if(aliases.has(id)) fail('Ambiguous local alias '+id); aliases.add(id);}
    strings(row.traits,path+'.traits'); array(row.sourceLinks,path+'.sourceLinks');
    const urls=new Set(); for(const source of row.sourceLinks) {
      object(source,['url','level'],[],path+'.sourceLinks'); https(source.url,path+'.sourceLinks.url'); exact(source.level,'reference-to-review',path+'.sourceLinks.level');
      if(urls.has(source.url)) fail(path+'.sourceLinks contains duplicate URL');urls.add(source.url);
    }
    dossiers.set(row.id,row);
  }
  for (const [i,row] of weaponFile.entries.entries()) {
    const path='weapons['+i+']'; object(row,WEAPON_FIELDS,WEAPON_SOURCE_FIELDS,path);
    string(row.id,path+'.id',/^(?:weapon-[0-9]+|proposed)-[a-z0-9-]+$/);
    for(const key of ['name','work','media','manufacturer','family','role','identityEvidence','gameStatus']) string(row[key],path+'.'+key);
    exact(row.visualFidelity,'not-1to1-certified',path+'.visualFidelity'); https(row.sourceUrl,path+'.sourceUrl');
    enumeration(row.admission,['research-only','identity-in-project-catalogue'],path+'.admission');
    exact(row.admission,row.id.startsWith('proposed-')?'research-only':'identity-in-project-catalogue',path+'.admission');
    enumeration(row.gameStatus,row.admission==='research-only'?['À intégrer / rapprocher','Recherche uniquement — ne pas publier']:['En catalogue (identité)'],path+'.gameStatus');
    enumeration(row.identityEvidence,['Référence identifiée','Identité secondaire, contrôle requis','Création Tantalus','Hypothèse / à vérifier','Aperçu / à confirmer'],path+'.identityEvidence');
    if(row.missing!==null)string(row.missing,path+'.missing');
    exact(row.missing,row.admission==='research-only'?'Rechercher preuve + asset':null,path+'.missing');
    for(const key of WEAPON_SOURCE_FIELDS) if(Object.hasOwn(row,key)) {
      if(['visualRef','spriteSheet'].includes(key)){if(row[key]!==null)https(row[key],path+'.'+key);}
      else string(row[key],path+'.'+key);
    }
    if(Object.hasOwn(row,'evidenceRank'))enumeration(row.evidenceRank,['A','B','P','R','C'],path+'.evidenceRank');
    if(Object.hasOwn(row,'statsPolicy'))exact(row.statsPolicy,'Référence source ≠ stats de gameplay',path+'.statsPolicy');
  }
  if(Object.hasOwn(masterFile,'sources')) {
    object(masterFile.sources,SOURCE_IDS,[],'master.sources');
    for(const [id,row]of Object.entries(masterFile.sources)) {
      object(row,['title','year','medium','scope'],[],'source.'+id);string(row.title,'source.title');
      if(!Number.isInteger(row.year)||row.year<1900||row.year>2100)fail('source.year must be a publication year');
      enumeration(row.medium,['film','video_game','fan_game','television_series'],'source.medium');
      exact(row.scope,SOURCE_SCOPES[id],'source.'+id+'.scope');
    }
  }
  for (const [i,row] of masterFile.entities.entries()) {
    const path='master['+i+']'; object(row,MASTER_FIELDS,['externalReference'],path);
    string(row.id,path+'.id',MASTER_ID);string(row.name,path+'.name');string(row.notes,path+'.notes');strings(row.sourceIds,path+'.sourceIds');
    if(!row.sourceIds.length||row.sourceIds.some(id=>!SOURCE_IDS.includes(id)))fail(path+'.sourceIds has an unknown source');
    enumeration(row.type,['species','life_stage','caste','creature','faction','corporation','character','weapon','equipment','vehicle','ship','location'],path+'.type');
    enumeration(row.canonScope,['film','predator','crossover','expanded','series','project_original'],path+'.canonScope');
    if(row.sourceIds.some(id=>SOURCE_SCOPES[id]!==row.canonScope))fail(path+'.canonScope contradicts its source');
    exact(row.statPolicy,'no_universal_gameplay_stats',path+'.statPolicy');exact(row.review,'media_appearance_to_verify_per_variant',path+'.review');
    if(Object.hasOwn(row,'externalReference'))https(row.externalReference,path+'.externalReference');masters.add(row.id);
  }
  for (const [i,row] of linkFile.links.entries()) {
    const path='links['+i+']';object(row,LINK_FIELDS,[],path);string(row.dossierId,path+'.dossierId',DOSSIER_ID);string(row.sharedEntityId,path+'.sharedEntityId',MASTER_ID);
    if(!dossiers.has(row.dossierId)||!masters.has(row.sharedEntityId))fail(path+' references an unknown entity');
    if(masterTargets.has(row.sharedEntityId))fail('Ambiguous master target '+row.sharedEntityId);masterTargets.add(row.sharedEntityId);
    strings(row.gameRecordIds,path+'.gameRecordIds',LOCAL_ID);
    if(JSON.stringify(row.gameRecordIds)!==JSON.stringify(dossiers.get(row.dossierId).gameRefs.tantalus))fail(path+'.gameRecordIds contradicts its dossier');
    enumeration(row.relation,RELATIONS,path+'.relation');exact(row.status,'source-version-review-pending',path+'.status');exact(row.autoMergeStats,false,path+'.autoMergeStats');
  }
  if(Object.hasOwn(weaponFile,'total'))exact(weaponFile.total,weaponFile.entries.length,'weapons.total');
  if(Object.hasOwn(linkFile,'linked'))exact(linkFile.linked,linkFile.links.length,'links.linked');
  if(Object.hasOwn(linkFile,'pending'))exact(linkFile.pending,entityFile.entries.length-linkFile.links.length,'links.pending');
  if(Object.hasOwn(linkFile,'pendingDetails')) {
    array(linkFile.pendingDetails,'links.pendingDetails');
    const pending=entityFile.entries.filter(x=>!linkFile.links.some(l=>l.dossierId===x.id)).map(x=>x.id);
    if(linkFile.pendingDetails.length!==pending.length)fail('links.pendingDetails count differs');
    for(const row of linkFile.pendingDetails) {object(row,['dossierId','name','reason'],[],'links.pendingDetails');if(!pending.includes(row.dossierId))fail('Unknown pending dossier');string(row.name,'pending.name');string(row.reason,'pending.reason');}
  }
  const projected=[entityFile.entries.map(x=>select(x,ENTITY_FIELDS)),weaponFile.entries.map(x=>select(x,WEAPON_FIELDS)),masterFile.entities.map(x=>select(x,MASTER_FIELDS)),linkFile.links.map(x=>select(x,LINK_FIELDS))];
  for(let i=0;i<projected.length;i++)exact(digest(canonical(projected[i])),ALIEN_BASE_SOURCE_AUTHORITY_V1.files[i].projectedSha256,'Reviewed projection '+ALIEN_BASE_SOURCE_AUTHORITY_V1.files[i].path);
  return projected;
}

export function renderAlienBaseSnapshotV1(entityFile, weaponFile, masterFile, linkFile) {
  const [entries,weapons,masterEntities,masterLinks]=validateAlienBaseInputsV1(entityFile,weaponFile,masterFile,linkFile);
  const info={schemaVersion:'1.0.0',sourceRepo:ALIEN_BASE_SOURCE_AUTHORITY_V1.repository,
    upstreamCommit:ALIEN_BASE_SOURCE_AUTHORITY_V1.upstreamCommit,
    gameCatalogRepository:ALIEN_BASE_SOURCE_AUTHORITY_V1.gameCatalogRepository,
    gameCatalogBaselineCommit:ALIEN_BASE_SOURCE_AUTHORITY_V1.gameCatalogBaselineCommit,
    sourceFiles:ALIEN_BASE_SOURCE_AUTHORITY_V1.files.map(({path,sha256})=>({path,sha256})),
    projectedCount:{entities:entries.length,weapons:weapons.length,masterEntities:masterEntities.length,masterLinks:masterLinks.length},
    identityLinkPolicy:'Pending source-version crosswalks are proposals, never automatic master aliases.',
    description:'Static reviewed documentary projection; not gameplay stats or a 1:1 certificate.'};
  return ['/** Generated by scripts/sync-alien-base-v1.mjs from four reviewed Alien_base files.',
    ' * Documentary metadata only; pending identity links are not activated.',
    ' * Game runtime, save IDs, stats and AI remain owned by Tantalus. */',
    'const freezeAlienBaseSnapshotV1 = value => { if (value && typeof value === \'object\') { Object.values(value).forEach(freezeAlienBaseSnapshotV1); if (!Object.isFrozen(value)) Object.freeze(value); } return value; };',
    'export const ALIEN_BASE_SNAPSHOT_INFO_V1 = freezeAlienBaseSnapshotV1('+JSON.stringify(info,null,2)+');',
    'export const ALIEN_BASE_ENTITIES_V1 = freezeAlienBaseSnapshotV1('+JSON.stringify(entries,null,2)+');',
    'export const ALIEN_BASE_WEAPONS_V1 = freezeAlienBaseSnapshotV1('+JSON.stringify(weapons,null,2)+');',
    'export const ALIEN_BASE_MASTER_ENTITIES_V1 = freezeAlienBaseSnapshotV1('+JSON.stringify(masterEntities,null,2)+');',
    'export const ALIEN_BASE_MASTER_LINKS_V1 = freezeAlienBaseSnapshotV1('+JSON.stringify(masterLinks,null,2)+');',''].join('\n');
}

/** Verify actual raw input hashes before writing a client artifact. */
export async function syncAlienBaseV1({basePath='../alien_base',outputPath='src/alien-base-snapshot-v1.js',check=false}={}) {
  const raw=await Promise.all(ALIEN_BASE_SOURCE_AUTHORITY_V1.files.map(row=>readFile(resolve(basePath,row.path))));
  for(let i=0;i<raw.length;i++)exact(digest(raw[i]),ALIEN_BASE_SOURCE_AUTHORITY_V1.files[i].sha256,'Source bytes '+ALIEN_BASE_SOURCE_AUTHORITY_V1.files[i].path);
  const inputs=raw.map(bytes=>JSON.parse(bytes));const desired=renderAlienBaseSnapshotV1(...inputs);const output=resolve(outputPath);
  if(check){if(await readFile(output,'utf8')!==desired)fail('snapshot out of sync');}else await writeFile(output,desired,'utf8');
  return {entities:inputs[0].entries.length,weapons:inputs[1].entries.length,master:inputs[2].entities.length,links:inputs[3].links.length,check,output,upstreamCommit:ALIEN_BASE_SOURCE_AUTHORITY_V1.upstreamCommit};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  const args=process.argv.slice(2),options={};
  for(let i=0;i<args.length;i++) {
    if(args[i]==='--check'){if(options.check)fail('duplicate --check');options.check=true;}
    else if(['--base','--out'].includes(args[i])){const key=args[i]==='--base'?'basePath':'outputPath';if(options[key]||!args[i+1]||args[i+1].startsWith('--'))fail('missing or duplicate '+args[i]);options[key]=args[++i];}
    else fail('unsupported argument '+args[i]);
  }
  console.log(JSON.stringify(await syncAlienBaseV1(options)));
}
