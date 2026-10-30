/**
 * V171 non-detachable and specialist-feed weapon contract.
 * Transitional pure model: not installed in live GameEngine until weapon-specific
 * source/animation QA is approved. Never treat tank, cylinder, tube or belt as
 * an ordinary detachable-box magazine. Numerical values are project tests.
 */
export const WEAPON_SPECIAL_FEED_SCHEMA_V171 = 171;
const MAX_RECEIPTS=2048;
const kinds=new Set(['tube','cylinder','belt','tank','cell','single']);
const id=s=>typeof s==='string'&&/^[a-zA-Z0-9:_-]{1,140}$/.test(s);
const qty=n=>Number.isSafeInteger(n)&&n>=0&&n<=100000;
const clean=x=>JSON.parse(JSON.stringify(x));
const spec=(id,kind,ammo,casePolicy,limits,note)=>Object.freeze({
  weaponId:id,kind,ammoType:ammo,casePolicy,limits:Object.freeze(limits),
  sourceMeasured:false,projectPolicy:'mechanism-simulation-awaiting-native-QA',note
});
/** Only these explicitly identified catalogue IDs may instantiate the contract.
 * No blanket feed guesses for sequel guns or variants.
 */
export const WEAPON_SPECIAL_FEED_PROFILES_V171=Object.freeze([
  spec('weapon-007-m37a2-pump-shotgun','tube','shotgun-shell','pump-eject',['1-per-cycle'],'Needs visible pump stroke; measured source cadence still required'),
  spec('weapon-021-357-magnum-revolver','cylinder','revolver-cartridge','reload-eject',['retained-cases'],'Revolver holds fired cases until explicit unload, not every shot'),
  spec('weapon-005-m56-smartgun','belt','m250-caseless','no-metal-shell',['belt-box','harness'],'Caseless source ammunition; belt/harness is distinct from box-magazine'),
  spec('weapon-006-m240-incinerator-unit','tank','fuel','no-metal-shell',['tank-pressure'],'Fuel consumption and pressure require authored FX and source validation'),
  spec('weapon-011-m83-sadar','single','anti-armor-rocket','no-metal-shell',['single-tube'],'One rocket per cycle; do not simulate rifle magazine or brass ejection')
]);
const map=new Map(WEAPON_SPECIAL_FEED_PROFILES_V171.map(x=>[x.weaponId,x]));
export function getSpecialFeedProfileV171(weaponId){return map.get(weaponId)||null;}
const seen=xs=>new Set(xs).size===xs.length;
export function validateSpecialFeedV171(s){
 if(!s||s.schema!==171||!id(s.ownerId)||!id(s.weaponInstanceId)||!id(s.weaponDefinitionId)
  ||!kinds.has(s.kind)||!qty(s.capacity)||s.capacity<1||s.capacity>9999
  ||!qty(s.loaded)||s.loaded>s.capacity||!qty(s.reserve)||!qty(s.spentCases)
  ||s.spentCases>s.capacity||typeof s.needsCycle!=='boolean'
  ||!Array.isArray(s.receipts)||s.receipts.length>MAX_RECEIPTS||!s.receipts.every(id)||!seen(s.receipts)
  ||!qty(s.serial)||s.serial>100000||!Array.isArray(s.events)||s.events.length>48
  ||!s.events.every(e=>e&&id(e.type)&&id(e.receipt)))return false;
 const profile=map.get(s.weaponDefinitionId);
 if(!profile||profile.kind!==s.kind)return false;
 if((s.kind!=='tube'&&s.needsCycle)||(s.kind!=='tube'&&s.kind!=='cylinder'&&s.spentCases!==0))return false;
 const tx=s.pending;
 if(tx!==null){
  if(!tx||!id(tx.id)||tx.id.indexOf(s.weaponInstanceId+':reload:')!==0
   ||!qty(tx.planned)||!qty(tx.inserted)||tx.inserted>tx.planned
   ||!Number.isFinite(tx.progress)||tx.progress<0||tx.progress>1
   ||!['active','ejected','inserting'].includes(tx.phase))return false;
 }
 return true;
}
const remember=(s,receipt)=>{
 if(s.receipts.includes(receipt))return false;
 s.receipts.push(receipt);if(s.receipts.length>MAX_RECEIPTS)s.receipts.shift();
 return true;
};
const event=(s,type,receipt,units=0)=>{
 s.events.push({type,receipt,units});
 if(s.events.length>48)s.events.shift();
};
export function createSpecialFeedV171({ownerId,weaponInstanceId,weaponDefinitionId,loaded,reserve,capacity}={}){
 const profile=map.get(weaponDefinitionId);
 if(!profile||!id(ownerId)||!id(weaponInstanceId)||!qty(loaded)||!qty(reserve)
   ||!qty(capacity)||capacity<1||capacity>9999||loaded>capacity
   ||profile.kind==='single'&&capacity!==1)return null;
 const s={schema:171,ownerId,weaponInstanceId,weaponDefinitionId,
  kind:profile.kind,capacity,loaded,reserve,spentCases:0,needsCycle:false,
  pending:null,serial:0,receipts:[],events:[]};
 return validateSpecialFeedV171(s)?s:null;
}
export function fireSpecialFeedV171(s,receipt){
 if(!validateSpecialFeedV171(s)||!id(receipt)||s.pending!==null||s.needsCycle
   ||s.loaded===0||s.receipts.includes('fire:'+receipt))return null;
 s.loaded--;remember(s,'fire:'+receipt);
 event(s,'accepted-shot',receipt,1);
 if(s.kind==='tube'){s.needsCycle=true;s.spentCases++;event(s,'spent-case-in-chamber',receipt,1);}
 else if(s.kind==='cylinder'){s.spentCases++;event(s,'case-retained-in-cylinder',receipt,1);}
 else if(s.kind==='belt')event(s,'caseless-belt-consumption',receipt,1);
 else if(s.kind==='tank')event(s,'fuel-unit-consumed',receipt,1);
 else if(s.kind==='cell')event(s,'cell-energy-consumed',receipt,1);
 else if(s.kind==='single')event(s,'projectile-launched',receipt,1);
 return {receipt,loaded:s.loaded,reserve:s.reserve,casePolicy:map.get(s.weaponDefinitionId).casePolicy,
  shellEjected:false,requiresCycle:s.needsCycle};
}
export function cycleSpecialFeedV171(s,receipt){
 if(!validateSpecialFeedV171(s)||s.kind!=='tube'||!s.needsCycle
   ||s.pending!==null||!id(receipt)||s.receipts.includes('cycle:'+receipt))return null;
 s.needsCycle=false;s.spentCases=Math.max(0,s.spentCases-1);
 remember(s,'cycle:'+receipt);event(s,'pump-shell-ejected',receipt,1);
 return {ejected:1,needsCycle:false};
}
export function beginSpecialReloadV171(s,receipt){
 if(!validateSpecialFeedV171(s)||s.pending||!id(receipt)
   ||s.receipts.includes('reload:'+receipt)||s.receipts.includes('cancel:'+receipt)
   ||s.loaded>=s.capacity||s.reserve===0||s.needsCycle)return false;
 // Preserve the starting live-round count, but reserve is never credited
 // from another source; interruption changes only observed steps.
 const amount=Math.min(s.capacity-s.loaded,s.reserve);
 const txId=s.weaponInstanceId+':reload:'+receipt;
 if(txId.length>140)return false;
 s.pending={id:txId,planned:amount,inserted:0,progress:0,phase:'active'};
 return true;
}
export function advanceSpecialReloadV171(s,receipt,progress){
 if(!validateSpecialFeedV171(s)||!s.pending||s.pending.id!==s.weaponInstanceId+':reload:'+receipt
   ||!Number.isFinite(progress)||progress<s.pending.progress||progress<0||progress>1)return false;
 const tx=s.pending;
 if(s.kind==='tube'){
   // Round-by-round insertion is visible and durable; partial reloads keep
   // only the rounds already inserted when interrupted.
   const desired=Math.min(tx.planned,Math.floor(progress*tx.planned+1e-9));
   const delta=desired-tx.inserted;
   if(delta>0){s.loaded+=delta;s.reserve-=delta;tx.inserted+=delta;tx.phase='inserting';event(s,'individual-shell-inserted',receipt,delta);}
 }else if(s.kind==='cylinder'){
   if(progress>=0.32&&tx.phase==='active'){
      if(s.spentCases){event(s,'cylinder-case-ejection',receipt,s.spentCases);s.spentCases=0;}
      tx.phase='ejected';
   }
   if(progress>=0.78&&tx.inserted===0){
      s.loaded+=tx.planned;s.reserve-=tx.planned;tx.inserted=tx.planned;tx.phase='inserting';
      event(s,'cylinder-rounds-loaded',receipt,tx.planned);
   }
 }else if(s.kind==='belt'||s.kind==='tank'||s.kind==='cell'){
   // Existing partially loaded feed is not discarded or refilled for free.
   // One explicit transfer from reserve after a completed replacement beat.
   if(progress>=0.45&&tx.phase==='active') {tx.phase='ejected';event(s,'old-feed-safe-isolation',receipt);}
   if(progress>=0.88&&tx.inserted===0){
     s.loaded+=tx.planned;s.reserve-=tx.planned;tx.inserted=tx.planned;
     tx.phase='inserting';event(s,s.kind==='belt'?'linked-belt-fed':s.kind==='tank'?'fuel-tank-replenished':'cell-charged',receipt,tx.planned);
   }
 }else if(s.kind==='single'&&progress>=0.90&&tx.inserted===0){
   s.loaded++;s.reserve--;tx.inserted=1;tx.phase='inserting';event(s,'single-projectile-chambered',receipt,1);
 }
 tx.progress=progress;
 if(progress===1){
   remember(s,'reload:'+receipt);event(s,'reload-complete',receipt,tx.inserted);s.pending=null;
 }
 return validateSpecialFeedV171(s);
}
export function cancelSpecialReloadV171(s,receipt){
 if(!validateSpecialFeedV171(s)||!s.pending||s.pending.id!==s.weaponInstanceId+':reload:'+receipt)return false;
 s.pending=null;remember(s,'cancel:'+receipt);event(s,'reload-interrupted',receipt);
 return true;
}
export function specialFeedTotalV171(s){
 return validateSpecialFeedV171(s)?s.loaded+s.reserve:null;
}
export function captureSpecialFeedV171(s){
 return validateSpecialFeedV171(s)?clean(s):null;
}
export function restoreSpecialFeedV171(raw,{ownerId=null,weaponDefinitionId=null,expectedTotal=null}={}){
 if(!validateSpecialFeedV171(raw)||(ownerId!==null&&raw.ownerId!==ownerId)
   ||(weaponDefinitionId!==null&&raw.weaponDefinitionId!==weaponDefinitionId)
   ||(expectedTotal!==null&&specialFeedTotalV171(raw)!==expectedTotal))return null;
 return clean(raw);
}
