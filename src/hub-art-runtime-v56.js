const SOURCE_SIZE_V56 = Object.freeze({ width: 1774, height: 887 });
const TARGET_BOUNDS_V56 = Object.freeze({ x: 0, y: 0, w: 1280, h: 640 });

const visualLayer = (roomId, artKey, phase) => Object.freeze({
  id: `${artKey}-${phase}`,
  roomId,
  kind: 'visual-layer',
  phase,
  asset: `/assets/openai/hub/layers/${artKey}-${phase === 'back' ? 'overhead' : 'foreground'}.png`,
  sourceSize: SOURCE_SIZE_V56,
  renderBounds: TARGET_BOUNDS_V56,
  collidable: false
});

const roomContract = (roomId, artKey) => {
  const overhead = visualLayer(roomId, artKey, 'back');
  const foreground = visualLayer(roomId, artKey, 'front');
  return Object.freeze({
    release: 'v56',
    roomId,
    artKey,
    composition: 'modular',
    allowsMonolith: false,
    allowsFallback: false,
    overhead,
    foreground,
    renderStack: Object.freeze([overhead, Object.freeze({
      id: `${artKey}-actors`,
      roomId,
      kind: 'runtime-slot',
      phase: 'actors'
    }), foreground])
  });
};

const ROOM_ART_DEFINITIONS_V56 = Object.freeze([
  ['bridge', 'command-bridge'],
  ['briefing', 'command-briefing'],
  ['combat-information', 'command-cic'],
  ['cryo-bay', 'command-cryo'],
  ['crew-quarters', 'habitat-quarters'],
  ['mess', 'habitat-mess'],
  ['medical', 'habitat-medical'],
  ['science-lab', 'habitat-lab'],
  ['quarantine', 'industrial-quarantine'],
  ['armory', 'industrial-armory'],
  ['workshop', 'industrial-workshop'],
  ['vehicle-bay', 'industrial-vehicle-bay'],
  ['reactor', 'engineering-reactor'],
  ['life-support', 'engineering-life-support'],
  ['sensor-array', 'engineering-sensors']
]);

export const HUB_ROOM_ART_V56 = Object.freeze(Object.fromEntries(
  ROOM_ART_DEFINITIONS_V56.map(([roomId, artKey]) => [roomId, roomContract(roomId, artKey)])
));

export const HUB_ROOM_ART_COUNT_V56 = Object.keys(HUB_ROOM_ART_V56).length;

export const HUB_ROOM_ART_ASSETS_V56 = Object.freeze(
  Object.values(HUB_ROOM_ART_V56).flatMap((contract) => [
    contract.overhead.asset,
    contract.foreground.asset
  ])
);

export function resolveHubRoomArtV56(roomId) {
  return HUB_ROOM_ART_V56[String(roomId || '').trim()] || null;
}

export function requireHubRoomArtV56(roomId) {
  const contract = resolveHubRoomArtV56(roomId);
  if (!contract) throw new RangeError(`No v56 modular hub art contract for room: ${String(roomId)}`);
  return contract;
}
