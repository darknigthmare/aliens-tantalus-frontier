/** M41A integrated 30mm pump launcher, independent of the 10mm rifle feed.
 *
 * Physical evidence: the Royal Armouries houses a film M41A prop and quotes
 * the 10mm rifle with an over-and-under 30mm pump-action grenade launcher:
 * https://royalarmouries.org/objects-and-stories/stories/m-41a-aliens-pulse-rifle
 *
 * Note: the museum does NOT certify Tantalus' tube capacity, timing, weight,
 * weapon damage, spent 30mm cases or animations. No 1:1 game admission.
 * This pure, opt-in secondary-feed model does not modify actor.ammo.
 */
export const M41A_UNDERBARREL_SCHEMA_V174 = 174;
export const M41A_UNDERBARREL_HOST_V174 = 'weapon-001-m41a-pulse-rifle';
export const M41A_UNDERBARREL_SOURCE_V174 =
  'https://royalarmouries.org/objects-and-stories/stories/m-41a-aliens-pulse-rifle';
const CAP=16, RECEIPTS=1024, EVENTS=48;
const id=x=>typeof x==='string' && x.length>0 && x.length<=90 && /^[A-Za-z0-9:_-]+$/.test(x);
const rounds=x=>Number.isSafeInteger(x) && x>=0 && x<=10000;
const deep=x=>JSON.parse(JSON.stringify(x));
const remember=(s,x)=>{
  if(s.receipts.includes(x) || x.length>120) return false;
  s.receipts.push(x);
  if(s.receipts.length>RECEIPTS)s.receipts.shift();
  return true;
};
const log=(s,type,receipt,count=0)=>{
  s.events.push({type,receipt,count});
  if(s.events.length>EVENTS)s.events.shift();
};
export function validateUnderbarrelV174(s) {
  if (!s||s.schema!==174||!id(s.ownerId)||!id(s.weaponInstanceId)
    ||s.hostWeaponId!==M41A_UNDERBARREL_HOST_V174
    ||!rounds(s.capacity)||s.capacity<1||s.capacity>CAP
    ||!rounds(s.tube)||!rounds(s.chamber)||s.chamber>1
    ||s.tube+s.chamber>s.capacity
    ||!rounds(s.reserve)||!rounds(s.spent)||s.spent>1
    ||typeof s.needsPump!=='boolean'||s.needsPump!==(s.spent===1)
    ||!['primary','launcher'].includes(s.mode)
    ||!Array.isArray(s.receipts)||s.receipts.length>RECEIPTS
    ||!s.receipts.every(x=>id(x) && x.length<=120)
    ||new Set(s.receipts).size!==s.receipts.length
    ||!Array.isArray(s.events)||s.events.length>EVENTS
    ||!s.events.every(e=>e&&id(e.type)&&id(e.receipt)&&rounds(e.count)))return false;
  if(s.pending!==null){
    const tx=s.pending;
    if(!tx||!id(tx.id)||!tx.id.startsWith(s.weaponInstanceId+':reload:')
      ||!rounds(tx.planned)||tx.planned<1||!rounds(tx.inserted)
      ||tx.inserted>tx.planned||!Number.isFinite(tx.progress)
      ||tx.progress<0||tx.progress>=1
      ||tx.planned>s.reserve+tx.inserted
      ||tx.planned>s.capacity-s.tube-s.chamber+tx.inserted
      ||s.needsPump)return false;
  }
  return true;
}
export function createM41AUnderbarrelV174({ownerId,weaponInstanceId,
  tube=0,chamber=0,reserve=0,capacity=4,mode='primary'}={}){
  // capacity=4 is only a tunable Tantalus starting profile, not an
  // automatically sourced film measurement.
  const s={schema:174,ownerId,weaponInstanceId,
    hostWeaponId:M41A_UNDERBARREL_HOST_V174,capacity,tube,chamber,reserve,
    spent:0,needsPump:false,mode,pending:null,receipts:[],events:[]};
  return validateUnderbarrelV174(s)?s:null;
}
export function setM41AModeV174(s,mode,receipt){
  if(!validateUnderbarrelV174(s)||s.pending||!['primary','launcher'].includes(mode)
    ||mode===s.mode||!id(receipt)||!remember(s,'mode:'+receipt))return false;
  s.mode=mode;log(s,'mode-switched',receipt);return true;
}
export function fireM41AUnderbarrelV174(s,receipt){
  if(!validateUnderbarrelV174(s)||s.mode!=='launcher'||s.pending
    ||s.needsPump||s.chamber!==1||!id(receipt)
    ||s.receipts.includes('fire:'+receipt)||('fire:'+receipt).length>120)return null;
  s.chamber=0;s.spent=1;s.needsPump=true;
  remember(s,'fire:'+receipt);log(s,'launcher-projectile-accepted',receipt,1);
  return {type:'launcher-projectile',receipt,caliber:'30mm',roundsRemaining:s.tube,
    pumpRequired:true,spentCaseEvidence:'UNVERIFIED_NO_CASING_SPAWN'};
}
export function pumpM41AUnderbarrelV174(s,receipt){
  if(!validateUnderbarrelV174(s)||s.mode!=='launcher'||s.pending||!s.needsPump
    ||!id(receipt)||s.receipts.includes('pump:'+receipt)||('pump:'+receipt).length>120)return null;
  s.needsPump=false;s.spent=0;
  if(s.tube){s.tube--;s.chamber=1;}
  remember(s,'pump:'+receipt);log(s,'pump-mechanism-cycled',receipt,1);
  return {type:'launcher-cycled',chamber:s.chamber,tube:s.tube,
    spentCaseEvidence:'UNVERIFIED_NO_CASING_SPAWN'};
}
export function beginM41AUnderbarrelReloadV174(s,receipt){
  if(!validateUnderbarrelV174(s)||s.mode!=='launcher'||s.needsPump||s.pending
    ||!id(receipt)||s.receipts.includes('reload:'+receipt)
    ||s.receipts.includes('cancel:'+receipt)
    ||s.tube+s.chamber>=s.capacity||s.reserve===0)return false;
  const idTx=s.weaponInstanceId+':reload:'+receipt;
  if(!id(idTx))return false;
  s.pending={id:idTx,planned:Math.min(s.reserve,s.capacity-s.tube-s.chamber),
    inserted:0,progress:0};
  return true;
}
export function advanceM41AUnderbarrelReloadV174(s,receipt,progress){
  if(!validateUnderbarrelV174(s)||!id(receipt)||!s.pending
    ||s.pending.id!==s.weaponInstanceId+':reload:'+receipt
    ||!Number.isFinite(progress)||progress<s.pending.progress||progress>1||progress<0)return false;
  const tx=s.pending,desired=Math.min(tx.planned,Math.floor(progress*tx.planned+1e-9));
  const delta=desired-tx.inserted;
  if(delta>0){s.tube+=delta;s.reserve-=delta;tx.inserted+=delta;log(s,'grenade-inserted',receipt,delta);}
  tx.progress=progress;
  if(progress===1){
    if(!remember(s,'reload:'+receipt))return false;
    log(s,'reload-complete',receipt,tx.inserted);s.pending=null;
  }
  return validateUnderbarrelV174(s);
}
export function cancelM41AUnderbarrelReloadV174(s,receipt){
  if(!validateUnderbarrelV174(s)||!id(receipt)||!s.pending
    ||s.pending.id!==s.weaponInstanceId+':reload:'+receipt)return false;
  s.pending=null;remember(s,'cancel:'+receipt);
  log(s,'reload-interrupted',receipt);return true;
}
export function M41AAmmoHudV174(s,{primaryLoaded,primaryReserve}={}){
  if(!validateUnderbarrelV174(s)||!rounds(primaryLoaded)||!rounds(primaryReserve))return null;
  return {schema:174,selected:s.mode,primary:{loaded:primaryLoaded,reserve:primaryReserve,
    empty:primaryLoaded===0,canFire:primaryLoaded>0},
    launcher:{loaded:s.chamber+s.tube,chambered:s.chamber===1,
      reserve:s.reserve,empty:s.chamber+s.tube===0,
      redCounter:s.mode==='launcher'&&s.chamber+s.tube===0,
      needsPump:s.needsPump},
    // The primary weapon never becomes empty just because its launcher is.
    primaryOutOfAmmo:primaryLoaded===0,
    sourceStatus:'project-dual-feed-contract-not-native-1to1'};
}
export function captureM41AUnderbarrelV174(s) {
  return validateUnderbarrelV174(s)?deep(s):null;
}
export function restoreM41AUnderbarrelV174(raw,{ownerId=null,instanceId=null,
  expectedTotal=null}={}){
  if(!validateUnderbarrelV174(raw)||(ownerId!==null&&raw.ownerId!==ownerId)
    ||(instanceId!==null&&raw.weaponInstanceId!==instanceId)
    ||(expectedTotal!==null&&raw.chamber+raw.tube+raw.reserve!==expectedTotal))return null;
  return deep(raw);
}
