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
/** Film prop lineage is separate from a game firing-mode ruleset.
 * Royal Armouries identifies a 1986 M41A prop that was also refurbished
 * for Alien 3. Not every movie prop had a working internal Remington
 * launcher or an illuminated counter. A museum photograph of a modified
 * survivor cannot, by itself, certify the 1986 on-screen paint/attachments.
 */
export const M41A_PROP_LINEAGE_V192=Object.freeze({
  primaryFilm:'Aliens (1986)',
  laterFilm:'Alien 3 (1992)',
  evidence:'https://royalarmouries.org/objects-and-stories/stories/m-41a-aliens-pulse-rifle',
  laterReusedOrRefurbished:true,
  internalLauncherOnAllProps:false,
  ammoCounterOnAllProps:false,
  filmedRevisionPaintVerified:false,
  nativeTantalusArt1to1Verified:false,
  renderableEvidenceAvailable:false
});

const CAP=16, RECEIPTS=1024, EVENTS=48;
const id=x=>typeof x==='string' && x.length>0 && x.length<=90 && /^[A-Za-z0-9:_-]+$/.test(x);
const rounds=x=>Number.isSafeInteger(x) && x>=0 && x<=10000;
const deep=x=>JSON.parse(JSON.stringify(x));
const remember=(s,x)=>{
  if(s.receipts.includes(x) || !id(x)) return false;
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
    ||(s.spent===1&&s.chamber!==0)
    ||typeof s.needsPump!=='boolean'||s.needsPump!==(s.spent===1)
    ||!['primary','launcher'].includes(s.mode)
    ||!Array.isArray(s.receipts)||s.receipts.length>RECEIPTS
    ||!s.receipts.every(x=>id(x) && x.length<=120)
    ||new Set(s.receipts).size!==s.receipts.length
    ||!Array.isArray(s.events)||s.events.length>EVENTS
    ||!s.events.every(e=>e&&id(e.type)&&id(e.receipt)&&rounds(e.count)))return false;
  if(s.pending!==null){
    const tx=s.pending;
    const prefix=s.weaponInstanceId+':reload:';
    const receipt=typeof tx?.id==='string'&&tx.id.startsWith(prefix)
      ? tx.id.slice(prefix.length):'';
    if(!tx||!id(tx.id)||!id(receipt)
      ||!id('reload:'+receipt)||!id('cancel:'+receipt)
      ||s.receipts.includes('reload:'+receipt)
      ||s.receipts.includes('cancel:'+receipt)
      ||!rounds(tx.planned)||tx.planned<1||!rounds(tx.inserted)
      ||tx.inserted>tx.planned||!Number.isFinite(tx.progress)
      ||tx.progress<0||tx.progress>=1
      ||tx.inserted!==Math.floor(tx.progress*tx.planned+1e-9)
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
    ||mode===s.mode||!id(receipt)||!id('mode:'+receipt)
    ||!remember(s,'mode:'+receipt))return false;
  s.mode=mode;log(s,'mode-switched',receipt);return true;
}
/** 2026-09-17 AFE2 notes specify that switching between primary and
 * underbarrel fire modes DURING a reload cancels that reload, rather than
 * rejecting the switch. This is an opt-in game-specific rule. It is not
 * claimed to describe the film prop, nor is it automatically live in Tantalus.
 * No extra rounds, fake cases, client events or animation cues are created.
 * https://www.daybreakgames.com/press/afe2/article/afe2-91726-patchnotes
 */
export const AFE2_UNDERBARREL_SWAP_V190=Object.freeze({
  sourceWork:'Aliens: Fireteam Elite 2 (2026)',
  sourceUrl:'https://www.daybreakgames.com/press/afe2/article/afe2-91726-patchnotes',
  behavior:'cancel-current-reload-before-mode-switch',
  gameplayStatus:'source-grounded-optional-pure-contract',
  playableInTantalus:false, exactVisuals:false
});
/** One accepted mode request owns exactly one cancellation and one mode
 * change. The old reload's already-inserted rounds remain physically loaded;
 * unused reserve rounds are not charged or credited back.
 *
 * Return null on invalid inputs BEFORE mutation, including forged pending
 * state, the wrong game policy or a duplicate receipt. Legacy switch behavior
 * is unchanged: without the explicit AFE2 policy, pending reloads stay locked.
 */
export function switchM41AModeV190(s,mode,receipt,{ruleset='tantalus'}={}){
  if(!validateUnderbarrelV174(s)||!['primary','launcher'].includes(mode)
    ||mode===s.mode||!id(receipt)||!id('mode:'+receipt)
    ||s.receipts.includes('mode:'+receipt))return null;
  const changingReload=s.pending!==null;
  if(changingReload&&ruleset!=='afe2-2026')return null;
  let cancelled=null;
  if(changingReload){
    const prefix=s.weaponInstanceId+':reload:';
    if(!s.pending.id.startsWith(prefix))return null;
    const pendingReceipt=s.pending.id.slice(prefix.length);
    if(!id(pendingReceipt)||s.receipts.includes('cancel:'+pendingReceipt))return null;
    cancelled={receipt:pendingReceipt,inserted:s.pending.inserted,
      remaining:s.pending.planned-s.pending.inserted};
    if(!cancelM41AUnderbarrelReloadV174(s,pendingReceipt))return null;
  }
  if(!setM41AModeV174(s,mode,receipt))return null;
  return {mode,receipt,previousReloadCancelled:cancelled!==null,
    interruptedReload:cancelled,loaded:s.chamber+s.tube,reserve:s.reserve,
    sourceScope:changingReload?'afe2-2026-source-behavior':'standard-mode-change'};
}
/** AFE2's September 2026 source says auto firemode-switch is optional and
 * requires ammunition on the other firemode. This pure reader never changes
 * the live actor, starts a reload, pumps a chamber or emits a projectile.
 * An explicit accepted player/system action is still required by the host.
 */
export function getAFE2UnderbarrelAutoIntentV191(s,{
  primaryLoaded,primaryReserve=0,autoSwitchWhenEmpty=false,autoReload=false
}={}){
  if(!validateUnderbarrelV174(s)||!rounds(primaryLoaded)||!rounds(primaryReserve)
    ||typeof autoSwitchWhenEmpty!=='boolean'||typeof autoReload!=='boolean')return null;
  const readyLauncher=s.chamber===1&&!s.needsPump;
  const launcherEmpty=s.tube+s.chamber===0;
  if(s.pending)return {action:'none',reason:'reload-in-progress',mode:s.mode};
  if(autoSwitchWhenEmpty&&s.mode==='primary'&&primaryLoaded===0&&readyLauncher)
    return {action:'switch',mode:'launcher',reason:'primary-empty-launcher-chambered'};
  if(autoSwitchWhenEmpty&&s.mode==='launcher'&&launcherEmpty&&primaryLoaded>0)
    return {action:'switch',mode:'primary',reason:'launcher-empty-primary-ready'};
  if(autoReload&&s.mode==='launcher'&&launcherEmpty&&s.reserve>0)
    return {action:'reload',mode:'launcher',reason:'launcher-reserve-available'};
  if(autoReload&&s.mode==='primary'&&primaryLoaded===0&&primaryReserve>0)
    return {action:'reload',mode:'primary',reason:'primary-reserve-available'};
  return {action:'none',mode:s.mode,reason:s.needsPump?'manual-pump-required':
    launcherEmpty&&primaryLoaded===0?'both-feeds-empty':'no-authorized-auto-action'};
}
export function fireM41AUnderbarrelV174(s,receipt){
  if(!validateUnderbarrelV174(s)||s.mode!=='launcher'||s.pending
    ||s.needsPump||s.chamber!==1||!id(receipt)
    ||s.receipts.includes('fire:'+receipt)||!id('fire:'+receipt))return null;
  s.chamber=0;s.spent=1;s.needsPump=true;
  remember(s,'fire:'+receipt);log(s,'launcher-projectile-accepted',receipt,1);
  return {type:'launcher-projectile',receipt,caliber:'30mm',roundsRemaining:s.tube,
    pumpRequired:true,spentCaseEvidence:'UNVERIFIED_NO_CASING_SPAWN'};
}
export function pumpM41AUnderbarrelV174(s,receipt){
  if(!validateUnderbarrelV174(s)||s.mode!=='launcher'||s.pending||!s.needsPump
    ||!id(receipt)||s.receipts.includes('pump:'+receipt)||!id('pump:'+receipt))return null;
  s.needsPump=false;s.spent=0;
  if(s.tube){s.tube--;s.chamber=1;}
  remember(s,'pump:'+receipt);log(s,'pump-mechanism-cycled',receipt,1);
  return {type:'launcher-cycled',chamber:s.chamber,tube:s.tube,
    spentCaseEvidence:'UNVERIFIED_NO_CASING_SPAWN'};
}
export function beginM41AUnderbarrelReloadV174(s,receipt){
  if(!validateUnderbarrelV174(s)||s.mode!=='launcher'||s.needsPump||s.pending
    ||!id(receipt)||s.receipts.includes('reload:'+receipt)
    ||s.receipts.includes('cancel:'+receipt)||!id('reload:'+receipt)
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
