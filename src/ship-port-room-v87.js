import { SHIP_ANIMAL_ANNEX_V87 } from './ship-animal-habitat-v87.js';
import { PORT_ART_V87, drawPortVendorV87, drawPortPropV87, getPortPropBoundsV87 } from './ship-port-art-v87.js';
import { drawShipAnimalV87, SHIP_ANIMAL_ATLASES_V87 } from './ship-animal-art-v87.js';
import { canAccessPortCounterV87 } from './ship-port-state-v87.js';
import { SHIP_ANIMAL_ENCLOSURE_ASSET_V87, drawClosedShipAnimalPenV87, isShipAnimalEnclosureAtlasReadyV87 } from './ship-animal-enclosure-art-v87.js';
import { SHIP_ANIMAL_TERRARIUM_ASSET_V87, drawClosedShipTerrariumV87, isShipAnimalTerrariumAtlasReadyV87 } from './ship-animal-terrarium-art-v87.js';

const ROOT = '/assets/openai/ship-animals/v87';
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const portProps = [
  { id: 'port-counter', ...getPortPropBoundsV87('counter', { x: 480, width: 165, bottom: 624 }),
    asset: ROOT + '/port-props.png', collidable: false },
  { id: 'port-shelf', ...getPortPropBoundsV87('shelf', { x: 1825, width: 90, bottom: 624 }),
    asset: ROOT + '/port-props.png', collidable: false },
  { id: 'colonial-dossier-terminal', ...getPortPropBoundsV87('terminal', { x: 1947, width: 36, bottom: 624 }),
    asset: ROOT + '/port-props.png', collidable: false }
];
// The relay is a new, original LOCAL service rendezvous, not Gateway/Pioneer.
// Its visitor compartment is reached through a physical hangar gangway only.
export const SHIP_PORT_ANNEX_V87 = freeze({
  ...structuredClone(SHIP_ANIMAL_ANNEX_V87),
  id: 'frontier-civil-counter', name: 'Compagnons de la Frontière', shortName: 'COMPTOIR PORTUAIRE',
  world: { ...SHIP_ANIMAL_ANNEX_V87.world, width: 2560 },
  navigationKind: 'external-civil-compartment', parentDeck: 'engineering', parentRoomId: 'dropship-hangar',
  parentDoorBounds: { x: 40, y: 432, w: 118, h: 192 },
  entrance: { id: 'frontier-civil-counter-door', x: 144, y: 432, w: 118, h: 192, bidirectional: true },
  station: { id: 'frontier-civil-counter-service', label: 'Dossier d’adoption', action: 'ship-port:shop',
    description: 'Rencontrer les animaux et consulter leur dossier', persistent: true, singleStation: true,
    upgradeId: null, capabilities: ['animal-adoption'],
    bounds: Object.fromEntries(['x', 'y', 'w', 'h'].map(key => [key, portProps[0][key]])) },
  action: 'ship-port:shop', description: 'Comptoir du relais mobile pendant un rendez-vous civil local autorisé.',
  scope: 'original-civil-rendezvous', deferredFeatures: ['full-station-hub', 'interstellar-civil-routes'],
  platforms: [{ ...SHIP_ANIMAL_ANNEX_V87.platforms[0], id: 'frontier-civil-counter-floor', w: 2560 }],
  criteria: { ...structuredClone(SHIP_ANIMAL_ANNEX_V87.criteria), scale: {
    ...SHIP_ANIMAL_ANNEX_V87.criteria.scale, logicalWidth: 2560 } },
  props: portProps,
  artRoles: ['far', 'prop', 'door', 'vendor', 'moka', 'brume', 'luciole', 'noisette', 'cafe', 'tic', 'tac', 'enclosure', 'mica', 'terrarium'],
  art: { far: ROOT + '/habitat-wall.png', prop: ROOT + '/port-props.png', vendor: ROOT + '/port-vendor-atlas.png',
    moka: SHIP_ANIMAL_ATLASES_V87['animal-moka'].path, brume: SHIP_ANIMAL_ATLASES_V87['animal-brume'].path,
    luciole: SHIP_ANIMAL_ATLASES_V87['animal-luciole'].path,
    noisette: SHIP_ANIMAL_ATLASES_V87['animal-noisette'].path, cafe: SHIP_ANIMAL_ATLASES_V87['animal-cafe'].path,
    tic: SHIP_ANIMAL_ATLASES_V87['animal-tic'].path, tac: SHIP_ANIMAL_ATLASES_V87['animal-tac'].path,
    enclosure: SHIP_ANIMAL_ENCLOSURE_ASSET_V87,
    mica: SHIP_ANIMAL_ATLASES_V87['animal-mica'].path, terrarium: SHIP_ANIMAL_TERRARIUM_ASSET_V87,
    door: SHIP_ANIMAL_ANNEX_V87.art.door, alphaBounds: { door: [...SHIP_ANIMAL_ANNEX_V87.art.alphaBounds.door] } }
});

// Separate background-plane volumes; the human lane remains floor624 and
// meeting prompts stay at their stable shared delivery pickup coordinates.
export const SHIP_PORT_PENS_V87 = freeze({
  'offer-noisette-cafe': { species: 'rabbit', bounds: { x: 2015, y: 514, w: 230, h: 110 } },
  'offer-tic-tac': { species: 'rat', bounds: { x: 2305, y: 500, w: 230, h: 124 } }
});

// Renderer and rear-wall composition share these exact occupied bounds.
// They are signs only, with no station, collision or interaction footprint.
export const SHIP_PORT_SERVICE_SIGNS_V137 = freeze([
  { id: 'port-companions-service-sign', bounds: { x: 382, y: 244, w: 360, h: 68 },
    title: 'COMPAGNONS DE LA FRONTIÈRE', subtitle: 'RELAIS CIVIL MOBILE',
    services: 'ACCUEIL · DOSSIERS · TRANSPORT ACCOMPAGNÉ' },
  { id: 'port-shelter-service-sign', bounds: { x: 1910, y: 244, w: 390, h: 68 },
    title: 'REFUGE COLONIAL', subtitle: 'COMPTOIR D’ADOPTION',
    services: 'DUOS LIÉS · TRANSPORT ENSEMBLE' }
]);

// Fixed fittings use the measured atlas aspect ratio. The same real extents
// reserve their wall space and draw their sprite, including its hanging lamps.
export const SHIP_PORT_LIGHT_FITTINGS_V137 = freeze([
  { id: 'port-counter-light-fitting', kind: 'lamp',
    bounds: getPortPropBoundsV87('lamp', { x: 425, width: 310, bottom: 480 }) },
  { id: 'port-meeting-light-fitting', kind: 'lamp',
    bounds: getPortPropBoundsV87('lamp', { x: 1250, width: 310, bottom: 480 }) }
]);

export const SHIP_PORT_TERMINAL_V87 = freeze({
  ...getPortPropBoundsV87('terminal', { x: 0, width: 36, bottom: 624 }), centerX: 18
});
export const SHIP_PORT_MEETINGS_V87 = freeze([
  { animalId: 'animal-moka', offerId: 'offer-animal-moka', vendorId: 'station-shop', x: 990, name: 'Moka', imageRole: 'moka' },
  // Persisted deliveries bind their origin to this meeting; keep Brume's
  // historical x1435 so an already purchased companion remains collectible.
  { animalId: 'animal-brume', offerId: 'offer-animal-brume', vendorId: 'station-shop', x: 1435, name: 'Brume', imageRole: 'brume' },
  { animalId: 'animal-luciole', offerId: 'offer-animal-luciole', vendorId: 'station-shop', x: 1705, name: 'Luciole', imageRole: 'luciole' },
  { animalId: 'animal-noisette', offerId: 'offer-noisette-cafe', vendorId: 'colony-shelter', x: 2130, drawX: 2105, name: 'Noisette', imageRole: 'noisette' },
  { animalId: 'animal-cafe', offerId: 'offer-noisette-cafe', vendorId: 'colony-shelter', x: 2130, drawX: 2155, name: 'Café', imageRole: 'cafe' },
  { animalId: 'animal-tic', offerId: 'offer-tic-tac', vendorId: 'colony-shelter', x: 2420, drawX: 2402, name: 'Tic', imageRole: 'tic' },
  { animalId: 'animal-tac', offerId: 'offer-tic-tac', vendorId: 'colony-shelter', x: 2420, drawX: 2438, name: 'Tac', imageRole: 'tac' },
  { animalId: 'animal-mica', offerId: 'offer-animal-mica', vendorId: 'station-shop', x: 810, drawX:768, interactionRadius:60, name: 'Mica', imageRole: 'mica' }
]);
export const SHIP_PORT_VENDORS_V87 = freeze({
  'station-shop': { id: 'station-shop', name: 'Compagnons de la Frontière' },
  'colony-shelter': { id: 'colony-shelter', name: 'Refuge colonial · comptoir d’adoption' }
});

export function getShipPortInteractionV87(hub) {
  if (!hub?.player?.alive || hub.annexTransitionV71 || hub.editorPlaytest) return null;
  const roomId = hub.currentAnnexV71?.()?.id || hub.currentRoom?.()?.id;
  const x = hub.player.x + hub.player.w / 2;
  if (Math.abs(hub.player.y + hub.player.h - 624) > 12) return null;
  if (roomId === 'dropship-hangar' && Math.abs(x - SHIP_PORT_TERMINAL_V87.centerX) <= 65)
    return { action: 'ship-port:terminal', prompt: 'E — PUPITRE D’AMARRAGE CIVIL' };
  if (roomId !== SHIP_PORT_ANNEX_V87.id) return null;
  if (x >= 410 && x <= 755) return { action: 'ship-port:shop', vendorId: 'station-shop', prompt: 'E — PARLER À LA RESPONSABLE DU COMPTOIR' };
  if (x >= 1930 && x <= 2000) return { action: 'ship-port:shop', vendorId: 'colony-shelter', prompt: 'E — CONSULTER LE REFUGE COLONIAL' };
  const meeting = SHIP_PORT_MEETINGS_V87.filter(entry => Math.abs(x - entry.x) <= (entry.interactionRadius ?? 105))
    .sort((a,b) => Math.abs(x-a.x)-Math.abs(x-b.x))[0];
  const group = meeting && SHIP_PORT_MEETINGS_V87.filter(entry => entry.offerId === meeting.offerId);
  return meeting ? { action: 'ship-port:shop', animalId: meeting.animalId, offerId: meeting.offerId, vendorId: meeting.vendorId,
    prompt: 'E — RENCONTRER ' + group.map(entry => entry.name.toUpperCase()).join(' ET ') } : null;
}

export function drawShipPortRoomV87(ctx, images, save, time = 0, reducedMotion = false) {
  const props = images?.get('prop');
  drawPortPropV87(ctx, props, 'counter', { x: 480, width: 165, bottom: 624 });
  drawPortPropV87(ctx, props, 'shelf', { x: 1825, width: 90, bottom: 624 });
  drawPortPropV87(ctx, props, 'terminal', { x: 1947, width: 36, bottom: 624 });
  for (const fitting of SHIP_PORT_LIGHT_FITTINGS_V137)
    drawPortPropV87(ctx, props, fitting.kind, fitting.bounds);
  drawPortVendorV87(ctx, images?.get('vendor'), { x: 668, feetY: 624, facing: -1, time, reducedMotion });
  const drawnOffers = new Set();
  for (const meeting of SHIP_PORT_MEETINGS_V87) {
    const stock = save?.shipAnimalsV1?.stock?.[meeting.offerId];
    const pen = SHIP_PORT_PENS_V87[meeting.offerId], enclosure = images?.get('enclosure');
    const mica = meeting.animalId === 'animal-mica';
    const terrarium = images?.get('terrarium'), terrariumBounds = {x:750,y:536,w:120,h:88};
    // A supervised meeting space: its fence is behind the animal, not an
    // opaque foreground cage concealing the individual the player meets.
    if (!drawnOffers.has(meeting.offerId)) {
      if (mica) drawClosedShipTerrariumV87(ctx, terrarium, { bounds:terrariumBounds, layer:'back' });
      else if (pen) drawClosedShipAnimalPenV87(ctx, enclosure, { ...pen, layer: 'back' });
      else drawPortPropV87(ctx, props, 'gate', { x: meeting.x - 115, width: 230, bottom: 626 });
    }
    if (stock?.status === 'available' && (mica ? isShipAnimalTerrariumAtlasReadyV87(terrarium) : !pen || isShipAnimalEnclosureAtlasReadyV87(enclosure))) drawShipAnimalV87(ctx, images?.get(meeting.imageRole), {
      animalId: meeting.animalId, x: meeting.drawX ?? meeting.x, y: pen || mica ? 612 : 624, facing: -1, clipId: 'idle', elapsed: reducedMotion ? 0 : time
    });
    if (mica) drawClosedShipTerrariumV87(ctx, terrarium, { bounds:terrariumBounds, layer:'front' });
    // This is the vendor's visitor area, never a resident on the Tantalus.
    if (!drawnOffers.has(meeting.offerId)) {
      ctx.save(); ctx.font = '12px ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#c6d1c5';
      const names = SHIP_PORT_MEETINGS_V87.filter(entry => entry.offerId === meeting.offerId).map(entry => entry.name).join(' ET ');
      ctx.fillText(names + (stock?.status === 'sold' ? ' · CONTRAT SIGNÉ' : ' · RENCONTRE'), meeting.x, pen ? pen.bounds.y - 12 : 521); ctx.restore();
      drawnOffers.add(meeting.offerId);
    }
  }
  for (const pen of Object.values(SHIP_PORT_PENS_V87)) drawClosedShipAnimalPenV87(ctx, images?.get('enclosure'), { ...pen, layer: 'front' });
  // Service signs occupy the clear upper wall, above the equipment and lamps.
  // Their own backing keeps text readable over both windows and wall panels.
  ctx.save(); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  for (const sign of SHIP_PORT_SERVICE_SIGNS_V137) {
    const { x, y, w, h } = sign.bounds;
    ctx.fillStyle = '#132125'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#6b7e76'; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
    ctx.fillStyle = '#b6ad81'; ctx.fillRect(x + 1, y + 1, 3, h - 2);
    ctx.font = 'bold 13px ui-monospace, monospace'; ctx.fillStyle = '#e0e8da';
    ctx.fillText(sign.title, x + 16, y + 20);
    ctx.font = '11px ui-monospace, monospace'; ctx.fillStyle = '#c3d5c5';
    ctx.fillText(sign.subtitle, x + 16, y + 38);
    ctx.font = '10px ui-monospace, monospace'; ctx.fillStyle = '#b7c7c1';
    ctx.fillText(sign.services, x + 16, y + 56);
  }
  ctx.restore();
}

export function drawShipPortTerminalV87(ctx, image, save) {
  drawPortPropV87(ctx, image, 'terminal', SHIP_PORT_TERMINAL_V87);
  const phase = save?.shipPortV1?.phase || 'undocked';
  const access = canAccessPortCounterV87(save);
  ctx.save(); ctx.font = '10px ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#b6d3bd';
  ctx.fillText(access === true || access?.ok === true ? 'PASSERELLE DISPONIBLE' : phase.toUpperCase(), Math.max(128, SHIP_PORT_TERMINAL_V87.centerX), 418); ctx.restore();
}

export const SHIP_PORT_EXTRA_ART_V87 = PORT_ART_V87;
