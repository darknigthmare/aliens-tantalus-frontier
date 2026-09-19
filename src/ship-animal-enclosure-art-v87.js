import { getShipAnimalHabitatsV87 } from './ship-animal-habitat-v87.js';

export const SHIP_ANIMAL_ENCLOSURE_ASSET_V87 = '/assets/openai/ship-animals/v87/enclosure-props.png';
export const SHIP_ANIMAL_ENCLOSURE_HASH_V87 = '5ae6fc780db5f1bf57ab40a74514c7c01135b64c1d1233cb0979857f2d14ba23';
const frozen = values => Object.freeze(Object.fromEntries(Object.entries(values).map(([k,v])=>[k,Object.freeze(v)])));
export const SHIP_ANIMAL_ENCLOSURE_CROPS_V87 = frozen({
  rabbitBack: [18,209,497,260], ratBack: [529,178,478,291],
  rabbitFront: [18,672,497,255], ratFront: [529,643,478,284],
  carrier: [1022,134,508,334],
  hideLarge: [1076,560,188,140], hideSmall: [1313,578,150,116],
  food: [1108,733,126,80], water: [1320,732,130,81],
  hygiene: [1069,846,185,96], tunnel: [1287,844,186,94]
});
export const SHIP_ANIMAL_ENCLOSURE_PLACEMENTS_V87 = Object.freeze([
  Object.freeze({ habitatId: 'noisette-cafe-pen-v87', species: 'rabbit', bounds: Object.freeze({x:928,y:542,w:170,h:82}) }),
  Object.freeze({ habitatId: 'tic-tac-pen-v87', species: 'rat', bounds: Object.freeze({x:1454,y:548,w:136,h:76}) })
]);
const finite = n => typeof n === 'number' && Number.isFinite(n);
export function isShipAnimalEnclosureAtlasReadyV87(image) {
  return image?.complete === true && image.naturalWidth === 1536 && image.naturalHeight === 1024
    && String(image.currentSrc || image.src || '').split(/[?#]/)[0].endsWith(SHIP_ANIMAL_ENCLOSURE_ASSET_V87);
}
const validBounds = b => b && [b.x,b.y,b.w,b.h].every(finite) && b.w > 0 && b.h > 12;
/** Two bitmap slices align the visible inner floor with the durable paw plane.
 * Both panels remain behind the human lane; the grille does not block the corridor. */
export function drawClosedShipAnimalPenV87(ctx, image, {species, layer, bounds} = {}) {
  if (!isShipAnimalEnclosureAtlasReadyV87(image) || typeof ctx?.drawImage !== 'function'
    || !['rabbit','rat'].includes(species) || !['back','front'].includes(layer) || !validBounds(bounds)) return false;
  const source = SHIP_ANIMAL_ENCLOSURE_CROPS_V87[species + (layer === 'back' ? 'Back' : 'Front')];
  const [x,y,w,h] = source, seam = (layer === 'back' ? 420 : 875) - y;
  const floorY = bounds.y + bounds.h - 12;
  ctx.drawImage(image,x,y,w,seam,bounds.x,bounds.y,bounds.w,floorY-bounds.y);
  ctx.drawImage(image,x,y+seam,w,h-seam,bounds.x,floorY,bounds.w,12);
  return true;
}
export function drawShipAnimalEnclosuresV87(ctx, image, save, layer = 'back') {
  if (!isShipAnimalEnclosureAtlasReadyV87(image)) return false;
  const installed = new Set(getShipAnimalHabitatsV87(save).filter(h=>h.installed).map(h=>h.id));
  for (const entry of SHIP_ANIMAL_ENCLOSURE_PLACEMENTS_V87) {
    if (installed.has(entry.habitatId)) drawClosedShipAnimalPenV87(ctx,image,{...entry,layer});
  }
  return true;
}
export function drawShipBondedCarrierV87(ctx, image, bounds) {
  if (!isShipAnimalEnclosureAtlasReadyV87(image) || typeof ctx?.drawImage !== 'function'
    || !bounds || ![bounds.x,bounds.width,bounds.bottom].every(finite) || bounds.width <= 0) return false;
  const [x,y,w,h] = SHIP_ANIMAL_ENCLOSURE_CROPS_V87.carrier;
  const height = bounds.width * h/w;
  ctx.drawImage(image,x,y,w,h,bounds.x,bounds.bottom-height,bounds.width,height);
  return true;
}
