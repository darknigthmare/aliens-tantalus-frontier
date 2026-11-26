/** Isolated save vault. Works with a Storage object or a deterministic test double.
 * Blocked storage is reported, not substituted with fabricated persistence.
 */
export class IsolationSaveVault{
 constructor(storage,key,validate){this.storage=storage;this.key=key;this.validate=validate;this.backupKey=key+'.backups.v1';this.preferenceKey=key+'.preferences.v1';this.memory=null;this.error=null;}
 valid(text){if(typeof text!=='string'||text.length>2e6)return false;try{return this.validate(text)===true;}catch{return false;}}
 get(key){try{return this.storage?.getItem(key)||null;}catch(e){this.error=String(e.message||e);return null;}}
 backups(){let value;try{value=JSON.parse(this.get(this.backupKey)||'[]');}catch{return[];}return Array.isArray(value)?value.filter(x=>this.valid(x)).slice(0,3):[];}
 read(){const raw=this.get(this.key);if(this.valid(raw)){this.memory=raw;return{text:raw,recovered:false,error:this.error};}const backup=this.backups()[0];if(backup){this.memory=backup;return{text:backup,recovered:true,error:this.error};}return{text:this.memory,recovered:false,error:this.error,corrupt:!!raw};}
 write(text){if(!this.valid(text))return{ok:false,error:'Sauvegarde invalide : écriture refusée.'};this.memory=text;
  try{if(!this.storage)throw Error('Stockage indisponible');const current=this.storage.getItem(this.key),prior=this.backups();const copies=[...(this.valid(current)&&current!==text?[current]:[]),...prior].filter((x,i,a)=>a.indexOf(x)===i&&x!==text).slice(0,3);
   // Preserve valid history before touching the current save. A quota failure does
   // not delete the last known good checkpoint.
   this.storage.setItem(this.backupKey,JSON.stringify(copies));this.storage.setItem(this.key,text);this.error=null;return{ok:true,backups:copies.length};
  }catch(e){this.error=String(e.message||e);return{ok:false,error:this.error};}
 }
 preferences(){let p={};try{p=JSON.parse(this.get(this.preferenceKey)||'{}')||{};}catch{}return{audio:p.audio===true,volume:typeof p.volume==='number'?Math.max(0,Math.min(100,p.volume)):45,captions:p.captions!==false,reduced:p.reduced!==false};}
 savePreferences(p){const clean={audio:p.audio===true,volume:Math.max(0,Math.min(100,Number(p.volume)||0)),captions:p.captions!==false,reduced:p.reduced!==false};try{this.storage?.setItem(this.preferenceKey,JSON.stringify(clean));return !!this.storage;}catch{return false;}}
}
