const rect = (x, y, w, h) => Object.freeze({ x, y, w, h });
const point = (x, y, pivot) => Object.freeze({ x, y, pivot });

export const HUB_ART_LEVEL_V55 = Object.freeze({
  width: 1280,
  height: 720,
  floorY: 624
});

export const HUB_ART_RENDER_PHASES_V55 = Object.freeze(['back', 'actors', 'front']);

const HANGAR_OVERHEAD_V55 = Object.freeze({
  id: 'dropship-hangar-overhead',
  kind: 'visual-layer',
  phase: 'back',
  asset: '/assets/openai/hub/layers/engineering-hangar-overhead.png',
  sourceSize: Object.freeze({ width: 1774, height: 887 }),
  sourceCrop: rect(17, 106, 1736, 531),
  renderBounds: rect(0, 0, 1280, 392),
  anchor: point(640, 0, 'top-center'),
  collidable: false
});

const UD4L_DROPSHIP_V55 = Object.freeze({
  id: 'dropship-hangar-ud4l',
  kind: 'vehicle-sprite',
  phase: 'back',
  asset: '/assets/openai/sprites/normalized/vehicles/ud-4l-cheyenne-dropship-action-sheet.png',
  sheet: Object.freeze({ columns: 4, rows: 4, cellWidth: 256, cellHeight: 256 }),
  sourceCell: Object.freeze({ column: 0, row: 0 }),
  sourceOpaqueBounds: rect(21, 153, 213, 87),
  renderBounds: rect(380, 412, 520, 212),
  anchor: point(640, 624, 'bottom-center'),
  collisionBounds: rect(420, 526, 440, 98),
  interactionBounds: rect(536, 486, 208, 138)
});

export const ELECTRICAL_HAZARD_ART_V55 = Object.freeze({
  id: 'dropship-hangar-electrical-arc',
  kind: 'electrical',
  phase: 'back',
  asset: '/assets/openai/metroidvania/props/electrical-arc-hazard.png',
  sourceSize: Object.freeze({ width: 1774, height: 887 }),
  sourceCrop: rect(120, 377, 1536, 364),
  renderBounds: rect(864, 548, 320, 76),
  anchor: point(1024, 624, 'bottom-center'),
  collisionBounds: rect(906, 550, 236, 74),
  damage: 22,
  stunSeconds: 1.25,
  damageIntervalSeconds: 0.75,
  activeByDefault: true
});

const HANGAR_ACTORS_V55 = Object.freeze({
  id: 'dropship-hangar-actors',
  kind: 'runtime-slot',
  phase: 'actors'
});

const HANGAR_FOREGROUND_V55 = Object.freeze({
  id: 'dropship-hangar-foreground',
  kind: 'visual-layer',
  phase: 'front',
  asset: '/assets/openai/hub/layers/engineering-hangar-foreground.png',
  sourceSize: Object.freeze({ width: 1774, height: 887 }),
  sourceCrop: rect(12, 600, 1747, 240),
  renderBounds: rect(0, 548, 1280, 172),
  anchor: point(640, 720, 'bottom-center'),
  collidable: false
});

/**
 * Composition physique autonome du hangar. Elle exclut volontairement toute
 * image de salle monolithique et toute substitution CSS/canvas : chaque passe
 * référence son bitmap dédié ou, pour les acteurs, un emplacement runtime.
 */
export const DROPSHIP_HANGAR_ART_V55 = Object.freeze({
  release: 'v55',
  roomId: 'dropship-hangar',
  composition: 'modular',
  allowsMonolith: false,
  allowsFallback: false,
  level: HUB_ART_LEVEL_V55,
  renderPhases: HUB_ART_RENDER_PHASES_V55,
  overhead: HANGAR_OVERHEAD_V55,
  dropship: UD4L_DROPSHIP_V55,
  electricalHazard: ELECTRICAL_HAZARD_ART_V55,
  actors: HANGAR_ACTORS_V55,
  foreground: HANGAR_FOREGROUND_V55,
  renderStack: Object.freeze([
    HANGAR_OVERHEAD_V55,
    UD4L_DROPSHIP_V55,
    ELECTRICAL_HAZARD_ART_V55,
    HANGAR_ACTORS_V55,
    HANGAR_FOREGROUND_V55
  ])
});

export const HUB_ART_ASSETS_V55 = Object.freeze([
  HANGAR_OVERHEAD_V55.asset,
  UD4L_DROPSHIP_V55.asset,
  ELECTRICAL_HAZARD_ART_V55.asset,
  HANGAR_FOREGROUND_V55.asset
]);

export function isInsideHubArtLevelV55(bounds) {
  if (!bounds) return false;
  return Number.isFinite(bounds.x) && Number.isFinite(bounds.y)
    && Number.isFinite(bounds.w) && Number.isFinite(bounds.h)
    && bounds.w > 0 && bounds.h > 0
    && bounds.x >= 0 && bounds.y >= 0
    && bounds.x + bounds.w <= HUB_ART_LEVEL_V55.width
    && bounds.y + bounds.h <= HUB_ART_LEVEL_V55.height;
}

export function requireHubArtRuntimeV55(roomId) {
  if (roomId !== DROPSHIP_HANGAR_ART_V55.roomId) {
    throw new RangeError(`No v55 modular hub art contract for room: ${String(roomId)}`);
  }
  return DROPSHIP_HANGAR_ART_V55;
}
