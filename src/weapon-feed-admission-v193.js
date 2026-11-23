/** Selective V193 admission. Mechanism comes from exact source identity,
 * never a renderer's box/drum label or documented-ammunition status.
 * All numbers remain catalogue gameplay values, not source measurements.
 */
import { WEAPONS } from './content-core-v50.js';
import { getSpecialFeedProfileV171 } from './weapon-special-feeds-v171.js';
export const WEAPON_FEED_ADMISSION_SCHEMA_V193=193;
const catalogue=new Map(WEAPONS.map(w=>[w.id,w]));
const validId=x=>typeof x==='string'&&/^weapon-\d{3}-[a-z0-9-]+$/.test(x);
const validCount=x=>Number.isSafeInteger(x)&&x>=0&&x<=99999;
const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const m41a='weapon-001-m41a-pulse-rifle',m56='weapon-005-m56-smartgun';
const source=(weaponId,baseWeaponId,feed,ammoType,sourceRow,ammoSource)=>Object.freeze({
  weaponId,baseWeaponId,feed,ammoType,detachable:feed==='box',
  mechanismSource:Object.freeze({path:'docs/arsenal/data/tantalus_arsenal_master_v1.csv',
    sourceWeaponId:baseWeaponId,field:'Alimentation',value:feed,row:sourceRow,media:'Aliens (1986)'}),
  ammunitionSourceKey:ammoSource,
  ammunitionSourceMedia:ammoSource==='m41a-manual'?'Alien vs. Predator (Atari Jaguar, 1994)'
    :'Alien: The Weyland-Yutani Report',
  variantPolicy:weaponId===baseWeaponId?'source-identity':'existing-project-finish-variant',
  sourceMeasured:false,canonExact:false,visualFidelity1to1:false
});
/** The CSV explicitly records M41A=box and M56=belt. These exact generated
 * finish IDs share their existing base mechanism (content-core-v50 and V124),
 * not separate sequel/media receipts. No name, modulo or prefix inference.
 */
/** V188 (owner decision A6, 23 Nov. 2026): model-specific evidence of a detachable magazine.
 * VP70: the CSV records `box` and `9mm (prop real)`; the film prop is a real Heckler & Koch VP70
 * (IMFDB actor page), a pistol fed by a detachable box magazine (IMFDB weapon page). Both are
 * secondary databases; the prop's own magazine was not inspected. The game capacity of each
 * finish stays the catalogue value [PROPOSÉ] — the real pistol's 18 rounds are not applied.
 * M4A3 and F44AA are NOT admitted: see docs/development/QUESTIONS_PROPRIETAIRE_V188.md (A6). */
const vp70='weapon-004-vp70-combat-pistol';
export const WEAPON_FEED_EVIDENCE_V188=Object.freeze({
  [vp70]:Object.freeze({model:'Heckler & Koch VP70',evidence:'real-firearm-prop-identified-by-secondary-database',
    identityUrl:'https://www.imfdb.org/wiki/William_Hope',mechanismUrl:'https://www.imfdb.org/wiki/Heckler_%26_Koch_VP70',
    documentedCapacity:18,documentedCapacityStatus:'real-pistol-general-specification-not-applied-to-game-capacity',
    propMagazineInspected:false})
});
const sourceV188=(weaponId,baseWeaponId,sourceRow)=>Object.freeze({
  weaponId,baseWeaponId,feed:'box',ammoType:'cased-9mm',detachable:true,
  mechanismSource:Object.freeze({path:'docs/arsenal/data/tantalus_arsenal_master_v1.csv',
    sourceWeaponId:baseWeaponId,field:'Alimentation',value:'box',row:sourceRow,media:'Aliens (1986)'}),
  ammunitionSourceKey:'real-firearm-prop',ammunitionSourceMedia:'Aliens (1986) — real Heckler & Koch VP70 prop',
  modelEvidenceV188:WEAPON_FEED_EVIDENCE_V188[baseWeaponId],
  variantPolicy:weaponId===baseWeaponId?'source-identity':'existing-project-finish-variant',
  sourceMeasured:false,canonExact:false,visualFidelity1to1:false
});
export const WEAPON_FEED_MECHANISMS_V193=Object.freeze([
  ...[m41a,'weapon-041-m41a-pulse-rifle-field','weapon-081-m41a-pulse-rifle-veteran',
    'weapon-121-m41a-pulse-rifle-prototype'].map(id=>source(id,m41a,'box','caseless',2,'m41a-manual')),
  ...[m56,'weapon-045-m56-smartgun-field','weapon-085-m56-smartgun-veteran',
    'weapon-125-m56-smartgun-prototype'].map(id=>source(id,m56,'belt','m250-caseless',6,'m56-report')),
  ...[vp70,'weapon-044-vp70-combat-pistol-field','weapon-084-vp70-combat-pistol-veteran',
    'weapon-124-vp70-combat-pistol-prototype'].map(id=>sourceV188(id,vp70,5))
]);
const mechanisms=new Map(WEAPON_FEED_MECHANISMS_V193.map(s=>[s.weaponId,s]));
export function getWeaponFeedMechanismV193(weaponId){
  const reviewed=mechanisms.get(weaponId);if(reviewed)return reviewed;
  const specialist=getSpecialFeedProfileV171(weaponId);
  return specialist?Object.freeze({weaponId,baseWeaponId:weaponId,feed:specialist.kind,
    ammoType:specialist.ammoType,detachable:false,sourceMeasured:false}):null;
}
const deny=(weaponId,reason)=>Object.freeze({schema:193,weaponId:validId(weaponId)?weaponId:null,
  detachable:false,feed:null,ammoType:null,reason,sourceMeasured:false,
  canonExact:false,visualFidelity1to1:false,fallback:'legacy-numeric'});
/** Optional extra arguments cannot supply or override a mechanism receipt. */
export function inspectDetachableFeedV193(weapon){
  const weaponId=weapon?.id;
  if(!record(weapon)||!validId(weaponId))return deny(weaponId,'invalid-weapon-identity');
  const known=catalogue.get(weaponId),mechanism=getWeaponFeedMechanismV193(weaponId);
  if(mechanism&&!mechanism.detachable)
    return deny(weaponId,'specialized-'+mechanism.feed+'-feed-pending-native-bridge');
  if(!known||!mechanism?.detachable)return deny(weaponId,'feed-mechanism-not-source-reviewed');
  if(weapon.family!==known.family||['sentry','melee','tool'].includes(weapon.family))
    return deny(weaponId,'not-a-portable-firearm');
  if(!validCount(weapon.magazine)||weapon.magazine<1||weapon.magazine!==known.magazine)
    return deny(weaponId,'invalid-legacy-capacity');
  return Object.freeze({...mechanism,schema:193,reason:'experimental-gameplay-adaptation',fallback:null});
}
export function canInitializeDetachableFeedV193(weapon,actor){
  const policy=inspectDetachableFeedV193(weapon);if(!policy.detachable)return policy;
  if(!record(actor)||!validCount(actor.ammo)||!validCount(actor.ammoReserve)
    ||!validCount(actor.magazineSize)||actor.magazineSize<1||actor.ammo>actor.magazineSize)
    return deny(weapon.id,'invalid-legacy-inventory');
  if(weapon.magazine!==actor.magazineSize)return deny(weapon.id,'mismatched-equipped-magazine-capacity');
  return policy;
}
