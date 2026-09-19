import { getShipAnimalHabitatsV87 } from './ship-animal-habitat-v87.js';
export const SHIP_ANIMAL_TERRARIUM_ASSET_V87 = '/assets/openai/ship-animals/v87/terrarium-props.png';
export const SHIP_ANIMAL_TERRARIUM_HASH_V87 = 'e81e8aac0b7048797573e2d87936a092666716a967231c606a65e723ebfafaa7';
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
export const SHIP_ANIMAL_TERRARIUM_CROPS_V87 = freeze({
 back:[55,57,375,266],front:[444,57,376,266],hide:[871,190,262,129],warmingStone:[1193,268,308,51],
 water:[118,561,162,81],food:[459,575,168,66],climate:[761,480,215,159],carrier:[1071,395,430,255],
 ramp:[55,710,375,260],perch:[475,878,307,57],cleaning:[848,873,284,70],heatLamp:[1241,768,210,141]
});
export const SHIP_ANIMAL_TERRARIUM_PLACEMENT_V87 = freeze({
 habitatId:'mica-terrarium-v87',bounds:{x:1782,y:536,w:120,h:88},floorY:612,
 // Measured visible cork grip endpoints, not the outer bounding box.
 rampContactSource:[{x:61,y:938},{x:409,y:716}],
 rampContactWorld:[{x:1830,y:612},{x:1864,y:582}],
 supports:[{id:'inclined-branch',role:'ramp',bounds:{x:1829.4137931034484,y:581.1891891891892,w:36.63793103448276,h:35.13513513513514}},
   {id:'raised-perch',role:'perch',bounds:{x:1858,y:581.45,w:36,h:6.68}}]
});
const finite = n => typeof n === 'number' && Number.isFinite(n);
export function isShipAnimalTerrariumAtlasReadyV87(image) {
 return image?.complete === true && image.naturalWidth === 1536 && image.naturalHeight === 1024
  && String(image.currentSrc || image.src || '').split(/[?#]/)[0].endsWith(SHIP_ANIMAL_TERRARIUM_ASSET_V87);
}
function draw(ctx,image,role,b) { const [x,y,w,h]=SHIP_ANIMAL_TERRARIUM_CROPS_V87[role]; ctx.drawImage(image,x,y,w,h,b.x,b.y,b.w,b.h); }
/** Modular bitmap back, hardware, supports and genuinely transparent front pane. */
export function drawClosedShipTerrariumV87(ctx,image,{bounds,layer='back'}={}) {
 if(!isShipAnimalTerrariumAtlasReadyV87(image)||typeof ctx?.drawImage!=='function'||!['back','front'].includes(layer)
  ||!bounds||![bounds.x,bounds.y,bounds.w,bounds.h].every(finite)||bounds.w<=0||bounds.h<=12)return false;
 const [x,y,w,h]=SHIP_ANIMAL_TERRARIUM_CROPS_V87[layer],seam=layer==='back'?216:228;
 const floorY=bounds.y+bounds.h-12;
 ctx.drawImage(image,x,y,w,seam,bounds.x,bounds.y,bounds.w,floorY-bounds.y);
 ctx.drawImage(image,x,y+seam,w,h-seam,bounds.x,floorY,bounds.w,12);
 if(layer==='front')return true;
 const sx=bounds.w/120,sy=(bounds.h-12)/76;
 const local=(role,b)=>draw(ctx,image,role,{x:bounds.x+(b.x-1782)*sx,y:floorY+(b.y-612)*sy,w:b.w*sx,h:b.h*sy});
 local('hide',{x:1789,y:602,w:22,h:10});
 local('warmingStone',{x:1790,y:609,w:22,h:3});
 local('water',{x:1789,y:608,w:8,h:4});
 local('food',{x:1822,y:609,w:8,h:3});
 local('climate',{x:1789,y:549,w:12,h:9});
 local('heatLamp',{x:1870,y:546,w:14,h:9});
 for(const support of SHIP_ANIMAL_TERRARIUM_PLACEMENT_V87.supports)local(support.role,support.bounds);
 // The maintenance drawer sits beneath the inhabited volume.
 draw(ctx,image,'cleaning',{x:bounds.x+bounds.w*.3,y:floorY+4,w:bounds.w*.4,h:6});
 return true;
}
export function drawShipAnimalTerrariumV87(ctx,image,save,layer='back') {
 if(!isShipAnimalTerrariumAtlasReadyV87(image))return false;
 if(getShipAnimalHabitatsV87(save).some(h=>h.id===SHIP_ANIMAL_TERRARIUM_PLACEMENT_V87.habitatId&&h.installed))
  return drawClosedShipTerrariumV87(ctx,image,{bounds:SHIP_ANIMAL_TERRARIUM_PLACEMENT_V87.bounds,layer});
 return true;
}
export function drawShipMicaCarrierV87(ctx,image,bounds) {
 if(!isShipAnimalTerrariumAtlasReadyV87(image)||typeof ctx?.drawImage!=='function'||!bounds
  ||![bounds.x,bounds.width,bounds.bottom].every(finite)||bounds.width<=0)return false;
 const [x,y,w,h]=SHIP_ANIMAL_TERRARIUM_CROPS_V87.carrier,height=bounds.width*h/w;
 ctx.drawImage(image,x,y,w,h,bounds.x,bounds.bottom-height,bounds.width,height);return true;
}
