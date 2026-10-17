/** Explicit, bounded checkpoints of authoring documents. Never campaign or runtime saves. */
import { parseProject, clone } from './forge-model-v130.js';
export const FORGE_VERSIONS_KEY_V136 = 'atf-forge-document-versions-v136';
export const VERSION_LIMITS_V136 = Object.freeze({entries:32,bytes:8*1024*1024});
const bytes = text => new TextEncoder().encode(text).length;
const text = value => typeof value==='string'?value.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,100):'';
const idPattern = /^[a-z0-9][a-z0-9_-]{0,119}$/;
const fail = message => { throw new Error(message); };
export function parseForgeVersionsV136(raw) {
  if(typeof raw==='string') {if(bytes(raw)>VERSION_LIMITS_V136.bytes)fail('Archive de versions trop grande (8 Mio).');raw=JSON.parse(raw);}
  if(raw?.format!=='frontier-forge-versions'||raw.version!==1||!Array.isArray(raw.entries)||raw.entries.length>VERSION_LIMITS_V136.entries)
    fail('Archive de versions invalide (32 versions maximum).');
  const used=new Set();
  const entries=raw.entries.map(entry=>{
    if(!entry||!idPattern.test(entry.id)||typeof entry.id!=='string'||used.has(entry.id)||!text(entry.name)||!Number.isSafeInteger(entry.createdAt)||entry.createdAt<0)
      fail('Version : identifiant, nom ou date invalide.');
    used.add(entry.id);
    return {id:entry.id,name:text(entry.name),createdAt:entry.createdAt,sourceId:text(entry.sourceId),project:parseProject(entry.project)};
  });
  const result={format:'frontier-forge-versions',version:1,entries};
  if(bytes(JSON.stringify(result,null,2))>VERSION_LIMITS_V136.bytes)fail('Budget des versions dépassé (8 Mio). Exportez puis retirez une version.');
  return result;
}
const empty=()=>({format:'frontier-forge-versions',version:1,entries:[]});
const fresh=entries=>{const used=new Set(entries.map(e=>e.id));let n=1;while(used.has(`version-${n}`))n++;return `version-${n}`;};
export class ForgeVersionStoreV136 {
  constructor(storage) {this.storage=storage;this.data=empty();this.raw=null;this.protected=false;this.error='';this.revision=0;}
  load() {
    try {this.raw=this.storage?.getItem(FORGE_VERSIONS_KEY_V136)??null;this.data=this.raw===null?empty():parseForgeVersionsV136(this.raw);}
    catch(error){this.protected=true;this.error=`Versions protégées : ${error.message}`;}
    return this.data;
  }
  write(candidate) {
    const next=parseForgeVersionsV136(candidate);
    if(this.protected)fail('Archive protégée. Exportez les octets originaux ; aucune version n’a été écrasée.');
    if(!this.storage?.getItem||!this.storage?.setItem)fail('Stockage indisponible. Exportez le projet courant.');
    if(this.storage.getItem(FORGE_VERSIONS_KEY_V136)!==this.raw)fail('Versions modifiées dans un autre onglet. Exportez puis rechargez.');
    const encoded=JSON.stringify(next);
    this.storage.setItem(FORGE_VERSIONS_KEY_V136,encoded); // Publish memory only after durable write succeeds.
    this.raw=encoded;this.data=next;this.error='';this.revision++;return next;
  }
  capture(project,name,sourceId='',now=Date.now()) {
    if(!text(name))fail('Donnez un nom au point de restauration.');
    const entry={id:fresh(this.data.entries),name:text(name),createdAt:now,sourceId:text(sourceId),project:parseProject(project)};
    this.write({...this.data,entries:[...this.data.entries,entry]});return clone(entry);
  }
  get(id) {const entry=this.data.entries.find(e=>e.id===id);if(!entry)fail('Version introuvable.');return clone(entry);}
  remove(id) {if(!this.data.entries.some(e=>e.id===id))return false;this.write({...this.data,entries:this.data.entries.filter(e=>e.id!==id)});return true;}
  merge(raw) {const incoming=parseForgeVersionsV136(raw), entries=clone(this.data.entries);for(const entry of incoming.entries)entries.push({...entry,id:fresh(entries)});this.write({...this.data,entries});return incoming.entries.length;}
  export() {return JSON.stringify(this.data,null,2);}
}

/** Comparison is by stable room/cell/link IDs. Does not mutate either side. */
export function compareForgeDocumentsV136(beforeInput,afterInput) {
  const before=parseProject(beforeInput),after=parseProject(afterInput);
  const index=p=>({rooms:new Map(p.rooms.map(r=>[r.id,r])),cells:new Map(p.rooms.flatMap(r=>r.cells.map(c=>[c.id,{...c,roomId:r.id}]))),links:new Map(p.links.map(l=>[l.id,l]))});
  const a=index(before),b=index(after),changes=[];
  for(const kind of ['rooms','cells','links']) {
    for(const [id,old] of a[kind]) {
      const next=b[kind].get(id);
      if(!next){changes.push({kind,id,change:'removed'});continue;}
      const fields=kind==='rooms'?['name','size']:kind==='cells'?['roomId','x','y','type','layer','label','locked','decoration','narrative']:['from','to','bidirectional'];
      const changed=fields.filter(f=>JSON.stringify(old[f])!==JSON.stringify(next[f]));
      if(changed.length)changes.push({kind,id,change:'changed',fields:changed,before:Object.fromEntries(changed.map(f=>[f,clone(old[f])])),after:Object.fromEntries(changed.map(f=>[f,clone(next[f])]))});
    }
    for(const [id] of b[kind])if(!a[kind].has(id))changes.push({kind,id,change:'added'});
  }
  const metadata=['kind','name','activeRoomId'].filter(f=>before[f]!==after[f]);
  return {format:'frontier-forge-diff',version:1,from:before.name,to:after.name,metadata,
    identical:!changes.length&&!metadata.length,
    totals:Object.fromEntries(['rooms','cells','links'].map(kind=>[kind,Object.fromEntries(['added','removed','changed'].map(change=>[change,changes.filter(c=>c.kind===kind&&c.change===change).length]))])),changes};
}
