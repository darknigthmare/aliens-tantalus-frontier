import { SHIP_ANIMAL_ANNEX_V87 } from './ship-animal-habitat-v87.js';
import { PORT_ART_V87, drawPortVendorV87, drawPortPropV87, getPortPropBoundsV87 } from './ship-port-art-v87.js';
import { drawShipAnimalV87, SHIP_ANIMAL_ATLASES_V87 } from './ship-animal-art-v87.js';
import { canAccessPortCounterV87 } from './ship-port-state-v87.js';

const ROOT = '/assets/openai/ship-animals/v87';
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const portProps = [
  { id: 'port-counter', ...getPortPropBoundsV87('counter', { x: 480, width: 165, bottom: 624 }),
    asset: ROOT + '/port-props.png', collidable: false },
  { id: 'port-shelf', ...getPortPropBoundsV87('shelf', { x: 1825, width: 90, bottom: 624 }),
    asset: ROOT + '/port-props.png', collidable: false }
];
// The relay is a new, original LOCAL service rendezvous, not Gateway/Pioneer.
// Its visitor compartment is reached through a physical hangar gangway only.
export const SHIP_PORT_ANNEX_V87 = freeze({
  ...structuredClone(SHIP_ANIMAL_ANNEX_V87),
  id: 'frontier-civil-counter', name: 'Compagnons de la Frontière', shortName: 'COMPTOIR PORTUAIRE',
  navigationKind: 'external-civil-compartment', parentDeck: 'engineering', parentRoomId: 'dropship-hangar',
  parentDoorBounds: { x: 40, y: 432, w: 118, h: 192 },
  entrance: { id: 'frontier-civil-counter-door', x: 144, y: 432, w: 118, h: 192, bidirectional: true },
  station: { id: 'frontier-civil-counter-service', label: 'Dossier d’adoption', action: 'ship-port:shop',
    description: 'Rencontrer les animaux et consulter leur dossier', persistent: true, singleStation: true,
    upgradeId: null, capabilities: ['animal-adoption'],
    bounds: Object.fromEntries(['x', 'y', 'w', 'h'].map(key => [key, portProps[0][key]])) },
  action: 'ship-port:shop', description: 'Comptoir du relais mobile pendant un rendez-vous civil local autorisé.',
  scope: 'original-civil-rendezvous', deferredFeatures: ['full-station-hub', 'interstellar-civil-routes'],
  platforms: [{ ...SHIP_ANIMAL_ANNEX_V87.platforms[0], id: 'frontier-civil-counter-floor' }],
  props: portProps,
  artRoles: ['far', 'prop', 'door', 'vendor', 'moka', 'brume', 'luciole'],
  art: { far: ROOT + '/habitat-wall.png', prop: ROOT + '/port-props.png', vendor: ROOT + '/port-vendor-atlas.png',
    moka: SHIP_ANIMAL_ATLASES_V87['animal-moka'].path, brume: SHIP_ANIMAL_ATLASES_V87['animal-brume'].path,
    luciole: SHIP_ANIMAL_ATLASES_V87['animal-luciole'].path,
    door: SHIP_ANIMAL_ANNEX_V87.art.door, alphaBounds: { door: [...SHIP_ANIMAL_ANNEX_V87.art.alphaBounds.door] } }
});

export const SHIP_PORT_TERMINAL_V87 = freeze({
  ...getPortPropBoundsV87('terminal', { x: 0, width: 36, bottom: 624 }), centerX: 18
});
export const SHIP_PORT_MEETINGS_V87 = freeze([
  { animalId: 'animal-moka', offerId: 'offer-animal-moka', x: 990, name: 'Moka', imageRole: 'moka' },
  // Persisted deliveries bind their origin to this meeting; keep Brume's
  // historical x1435 so an already purchased companion remains collectible.
  { animalId: 'animal-brume', offerId: 'offer-animal-brume', x: 1435, name: 'Brume', imageRole: 'brume' },
  { animalId: 'animal-luciole', offerId: 'offer-animal-luciole', x: 1705, name: 'Luciole', imageRole: 'luciole' }
]);

export function getShipPortInteractionV87(hub) {
  if (!hub?.player?.alive || hub.annexTransitionV71 || hub.editorPlaytest) return null;
  const roomId = hub.currentAnnexV71?.()?.id || hub.currentRoom?.()?.id;
  const x = hub.player.x + hub.player.w / 2;
  if (Math.abs(hub.player.y + hub.player.h - 624) > 12) return null;
  if (roomId === 'dropship-hangar' && Math.abs(x - SHIP_PORT_TERMINAL_V87.centerX) <= 65)
    return { action: 'ship-port:terminal', prompt: 'E — PUPITRE D’AMARRAGE CIVIL' };
  if (roomId !== SHIP_PORT_ANNEX_V87.id) return null;
  if (x >= 410 && x <= 755) return { action: 'ship-port:shop', prompt: 'E — PARLER À LA RESPONSABLE DU COMPTOIR' };
  const meeting = SHIP_PORT_MEETINGS_V87.find(entry => Math.abs(x - entry.x) <= 105);
  return meeting ? { action: 'ship-port:shop', animalId: meeting.animalId,
    prompt: 'E — RENCONTRER ' + meeting.name.toUpperCase() } : null;
}

export function drawShipPortRoomV87(ctx, images, save, time = 0, reducedMotion = false) {
  const props = images?.get('prop');
  drawPortPropV87(ctx, props, 'counter', { x: 480, width: 165, bottom: 624 });
  drawPortPropV87(ctx, props, 'shelf', { x: 1825, width: 90, bottom: 624 });
  drawPortPropV87(ctx, props, 'lamp', { x: 425, width: 310, bottom: 480 });
  drawPortPropV87(ctx, props, 'lamp', { x: 1250, width: 310, bottom: 480 });
  drawPortVendorV87(ctx, images?.get('vendor'), { x: 668, feetY: 624, facing: -1, time, reducedMotion });
  for (const meeting of SHIP_PORT_MEETINGS_V87) {
    const stock = save?.shipAnimalsV1?.stock?.[meeting.offerId];
    // A supervised meeting space: its fence is behind the animal, not an
    // opaque foreground cage concealing the individual the player meets.
    drawPortPropV87(ctx, props, 'gate', { x: meeting.x - 115, width: 230, bottom: 626 });
    if (stock?.status === 'available') drawShipAnimalV87(ctx, images?.get(meeting.imageRole), {
      animalId: meeting.animalId, x: meeting.x, y: 624, facing: -1, clipId: 'idle', elapsed: reducedMotion ? 0 : time
    });
    // This is the vendor's visitor area, never a resident on the Tantalus.
    ctx.save(); ctx.font = '12px ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#c6d1c5';
    ctx.fillText(meeting.name + (stock?.status === 'sold' ? ' · CONTRAT SIGNÉ' : ' · RENCONTRE'), meeting.x, 521); ctx.restore();
  }
  ctx.save(); ctx.font = '12px ui-monospace, monospace'; ctx.fillStyle = '#d0d8c7';
  ctx.fillText('COMPAGNONS DE LA FRONTIÈRE · RELAIS CIVIL MOBILE', 360, 410);
  ctx.fillText('ACCUEIL · DOSSIERS · TRANSPORT ACCOMPAGNÉ', 360, 430); ctx.restore();
}

export function drawShipPortTerminalV87(ctx, image, save) {
  drawPortPropV87(ctx, image, 'terminal', SHIP_PORT_TERMINAL_V87);
  const phase = save?.shipPortV1?.phase || 'undocked';
  const access = canAccessPortCounterV87(save);
  ctx.save(); ctx.font = '10px ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#b6d3bd';
  ctx.fillText(access === true || access?.ok === true ? 'PASSERELLE DISPONIBLE' : phase.toUpperCase(), Math.max(128, SHIP_PORT_TERMINAL_V87.centerX), 418); ctx.restore();
}

export const SHIP_PORT_EXTRA_ART_V87 = PORT_ART_V87;
