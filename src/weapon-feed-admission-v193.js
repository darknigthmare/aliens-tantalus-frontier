/**
 * V193 native safeguard: an image/presentation feed is not proof of a
 * detachable box magazine. Only an explicitly compatible equipped firearm
 * may be migrated from legacy numeric rounds into the physical V167 pilot.
 * Specialized weapon cycles remain on the legacy path until native QA.
 */
import { getWeaponPresentationProfileV124 } from './weapon-presentation-profiles-v124.js';
import { getSpecialFeedProfileV171 } from './weapon-special-feeds-v171.js';
export const WEAPON_FEED_ADMISSION_SCHEMA_V193=193;
const PORTABLE=Object.freeze(['box','drum']);
const NON_DETACHABLE=Object.freeze(['tube','cylinder','belt','tank','cell','single']);
const validId=x=>typeof x==='string'&&/^weapon-\d{3}-[a-z0-9-]+$/.test(x);
const validCount=x=>Number.isSafeInteger(x)&&x>=0&&x<=99999;
const deny=(weaponId,reason)=>Object.freeze({
 schema:193,weaponId:validId(weaponId)?weaponId:null,detachable:false,
 feed:null,ammoType:null,reason,sourceMeasured:false,
 canonExact:false,visualFidelity1to1:false,fallback:'legacy-numeric'
});
/** Read-only inspection with an optional explicit test profile. */
export function inspectDetachableFeedV193(weapon,{profile=null}={}){
 const weaponId=weapon?.id;
 if(!weapon||Array.isArray(weapon)||!validId(weaponId))
   return deny(weaponId,'invalid-weapon-identity');
 const specialist=getSpecialFeedProfileV171(weaponId);
 if(specialist) return deny(weaponId,'specialized-'+specialist.kind+'-feed-pending-native-bridge');
 const presentation=profile||getWeaponPresentationProfileV124(weapon);
 if(!presentation?.reload) return deny(weaponId,'no-presentation-feed');
 if(!presentation.evidence?.catalogueMatch
   || presentation.evidence?.status!=='documented-ammunition'
   || presentation.weaponId!==weaponId)
   return deny(weaponId,'feed-mechanism-not-source-reviewed');
 const feed=presentation.reload.feed;
 if(NON_DETACHABLE.includes(feed))return deny(weaponId,'non-detachable-'+feed);
 if(!PORTABLE.includes(feed))return deny(weaponId,'unsupported-feed-'+String(feed));
 if(['sentry','melee','tool'].includes(weapon.family))return deny(weaponId,'not-a-portable-firearm');
 if(!validCount(weapon.magazine)||weapon.magazine<1)
   return deny(weaponId,'invalid-legacy-capacity');
 const ammoType=String(presentation.ammunition||'').trim();
 if(!ammoType||ammoType==='none'||ammoType.length>140||/\s/.test(ammoType))
   return deny(weaponId,'unknown-ammunition-identity');
 return Object.freeze({schema:193,weaponId,detachable:true,feed,ammoType,
  reason:'experimental-gameplay-adaptation',sourceMeasured:false,
  canonExact:false,visualFidelity1to1:false,fallback:null});
}
/** A wrong gun, owner magazine size, malformed reserve or non-detachable
 * source never changes actor.ammo; the caller only mirrors on success. */
export function canInitializeDetachableFeedV193(weapon,actor,opts={}){
 const policy=inspectDetachableFeedV193(weapon,opts);
 if(!policy.detachable)return policy;
 if(!actor||!validCount(actor.ammo)||!validCount(actor.ammoReserve)
   ||!validCount(actor.magazineSize)||actor.magazineSize<1
   ||actor.ammo>actor.magazineSize)return deny(weapon.id,'invalid-legacy-inventory');
 if(weapon.magazine!==actor.magazineSize)
   return deny(weapon.id,'mismatched-equipped-magazine-capacity');
 return policy;
}
