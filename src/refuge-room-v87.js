import { REFUGE_ART_V87, REFUGE_PROPS_LAYOUT_V87, REFUGE_PROP_RECTS_V87 } from './refuge-art-v87.js';
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const finite = value => typeof value === 'number' && Number.isFinite(value);

export const REFUGE_STATIONS_V87 = freeze([
  { id: 'refuge-portrait-station', action: 'refuge:portrait', centerX: 444, range: 78, prompt: 'E — PERSONNALISER LE PORTRAIT' },
  { id: 'refuge-terminal-station', action: 'refuge:terminal', centerX: 860, range: 78, prompt: 'E — LIRE LA DÉDICACE' },
  { id: 'refuge-light-station', action: 'refuge:light', centerX: 1082, range: 72, prompt: 'E — LUMIÈRE DU SOUVENIR' },
  { id: 'refuge-hologram-station', action: 'refuge:hologram', centerX: 1325, range: 85, prompt: 'E — SALUER LA SIMULATION FÉLINE' },
  { id: 'refuge-contemplation-station', action: 'refuge:contemplate', centerX: 1640, range: 90, prompt: 'E — CONTEMPLER LA VUE SIMULÉE' }
]);
const portrait = REFUGE_PROPS_LAYOUT_V87.find(prop => prop.kind === 'portrait');
export const SHIP_REFUGE_ANNEX_V87 = freeze({
  id: 'personal-refuge', name: 'REFUGE', shortName: 'REFUGE', kind: 'physical-annex', navigationKind: 'personal-refuge-annex',
  parentDeck: 'habitat', parentRoomId: 'crew-quarters', entranceSide: 'west', entranceLocalX: 144,
  // Clear ground lane between the floor ladder x210 and the animal-care door
  // x645..763. The quarters bunk collider x809..983 is not touched or disabled.
  parentDoorBounds: { x: 380, y: 520, w: 118, h: 104 },
  entrance: { id: 'personal-refuge-door', x: 144, y: 520, w: 118, h: 104, bidirectional: true },
  world: { width: 1920, height: 720, floorY: 624, floorHeight: 96, playerClearanceWidth: 112, playerClearanceHeight: 104 },
  station: { id: 'refuge-portrait-station', label: 'Portrait personnel', action: 'refuge:portrait',
    description: 'Personnaliser localement un nom, une dédicace et une photo choisie.', persistent: true, singleStation: true,
    upgradeId: null, capabilities: ['personal-memorial'], bounds: { x: portrait.x, y: portrait.y, w: portrait.w, h: portrait.h } },
  action: 'refuge:portrait', scope: 'private-personal-memorial', description: 'Une salle calme et personnalisable, sans identité personnelle présumée.',
  implementedFeatures: ['modular-dedicated-bitmap-props','five-physical-interaction-anchors','generic-feline-hologram','independent-window-parallax'],
  deferredFeatures: ['faithful-personal-cat-likeness-without-user-reference'],
  normalHubCreaturesVisible: false, combatDisabled: true, isolatedLevelTarget: null,
  platforms: [{ id: 'personal-refuge-floor', x: 0, y: 624, w: 1920, h: 96, role: 'floor' }],
  ladders: [], colliders: [], props: REFUGE_PROPS_LAYOUT_V87,
  artRoles: Object.keys(REFUGE_ART_V87),
  art: { ...Object.fromEntries(Object.entries(REFUGE_ART_V87).map(([role,value]) => [role,value.path])),
    alphaBounds: { prop: REFUGE_PROP_RECTS_V87.portrait, door: REFUGE_PROP_RECTS_V87.door } },
  criteria: {
    scale: { logicalWidth: 1920, logicalHeight: 720, floorY: 624, minimumWalkableWidth: 1536,
      minimumCeilingHeight: 432, minimumEntranceClearance: 112, requiredPerspectiveLayers: 3 },
    density: { minimumProps: 8, maximumProps: 10, minimumColliders: 0, maximumColliderCoverageRatio: .32, requiredInteractiveStations: 5 }
  }
});

export function getRefugeInteractionV87(hub) {
  const player = hub?.player;
  if (!player?.alive || hub.annexTransitionV71 || hub.editorPlaytest) return null;
  const roomId = hub.currentAnnexV71?.()?.id || hub.currentRoom?.()?.id;
  if (roomId !== SHIP_REFUGE_ANNEX_V87.id || ![player.x,player.y,player.w,player.h].every(finite)
    || player.w <= 0 || player.h <= 0 || Math.abs(player.y+player.h-624) > 12) return null;
  const x = player.x+player.w/2;
  // The actual west exit always owns its interaction range and spawn lane.
  if (x <= 300 || x > 1920) return null;
  const station = REFUGE_STATIONS_V87.filter(value => Math.abs(x-value.centerX) <= value.range)
    .sort((a,b) => Math.abs(x-a.centerX)-Math.abs(x-b.centerX))[0];
  return station ? { action: station.action, stationId: station.id, prompt: station.prompt } : null;
}
