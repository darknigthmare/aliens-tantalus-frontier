/* Two-slot local save store. A failed write never discards the last valid slot.
 * FNV-1a detects accidental truncation; it is NOT cryptographic authentication.
 * The legacy v01-v03 key is read, never removed or overwritten.
 */
(function(root){'use strict';
const hash=text=>{let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return (h>>>0).toString(16).padStart(8,'0');};
class SaveStore{
 constructor(storage,base,validate){this.storage=storage;this.base=base;this.validate=validate;this.last=null;}
 decode(raw){if(raw===null)return null;const e=JSON.parse(raw);if(e.kind!=='rop-local-slot-v4'||!Number.isSafeInteger(e.seq)||e.seq<1||e.seq>1e12||typeof e.payload!=='string'||e.payload.length>1024*1024||hash(e.payload)!==e.checksum)throw Error('Copie locale tronquée ou altérée.');this.validate(e.payload);return e;}
 inspect(){
  const valid=[],invalid=[],missing=[];let denied=false;
  for(let slot=0;slot<2;slot++)try{const raw=this.storage.getItem(this.base+'.slot'+slot);if(raw===null){missing.push(slot);continue;}const e=this.decode(raw);valid.push({...e,slot});}catch(e){invalid.push(slot);if(e.name==='SecurityError')denied=true;}
  valid.sort((a,b)=>b.seq-a.seq);
  if(valid.length)return this.last={ok:true,payload:valid[0].payload,slot:valid[0].slot,seq:valid[0].seq,recovered:invalid.length>0,invalid,source:'slots'};
  let legacy=null;try{legacy=this.storage.getItem(this.base);if(legacy!==null)this.validate(legacy);}catch(e){if(legacy!==null)invalid.push('legacy');legacy=null;if(e.name==='SecurityError')denied=true;}
  if(legacy!==null)return this.last={ok:true,payload:legacy,slot:null,seq:0,recovered:invalid.length>0,invalid,source:'legacy'};
  return this.last={ok:false,payload:null,slot:null,seq:0,recovered:false,invalid,unavailable:denied,corrupt:invalid.length>0&&!denied,source:'none'};
 }
 write(payload){
  this.validate(payload);const before=this.inspect();
  if(before.corrupt)throw Error('Les copies illisibles sont conservées. Importez une partie ou commencez explicitement une nouvelle partie.');
  if(before.unavailable)throw Error('Stockage local non autorisé.');
  const slot=before.slot===0?1:0,seq=before.seq+1;
  if(seq>1e12)throw Error('Compteur local hors limite.');
  const envelope={kind:'rop-local-slot-v4',seq,checksum:hash(payload),payload};
  const raw=JSON.stringify(envelope);this.storage.setItem(this.base+'.slot'+slot,raw);
  const written=this.decode(this.storage.getItem(this.base+'.slot'+slot));if(!written||written.seq!==seq||written.payload!==payload)throw Error('Écriture locale non vérifiée.');
  return this.last={ok:true,payload,slot,seq,recovered:false,source:'slots'};
 }
 // Called only after an explicit new-game/import confirmation. Legacy is retained.
 replace(payload){this.validate(payload);const before=this.inspect();if(!before.corrupt)return this.write(payload);
  const raw=JSON.stringify({kind:'rop-local-slot-v4',seq:1,checksum:hash(payload),payload});
  this.storage.setItem(this.base+'.slot0',raw);this.decode(this.storage.getItem(this.base+'.slot0'));return this.inspect();
 }
}
const API={SaveStore,hash};root.ROP_PERSISTENCE=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
