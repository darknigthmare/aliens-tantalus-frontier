import { HUB_ANNEX_STATION_ATLAS_V139, getHubAnnexStationCellV139 } from './hub-annex-station-atlas-v139.js';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};

/** The original frontal station atlas already supplies complete cabinets.
 * These four reviewed parts replace the legacy main-deck consoles, whose
 * visible desk tops implied a different projection from their 2D rooms.
 * Coordinates are relative to the admitted crop, never a resized screenshot.
 * The control strip is occupied equipment, not an empty display shelf. */
export const HUB_CONSOLE_STATIONS_V142 = freeze({
  bridge: { cellId: 'logistics', surface: { x: 4, y: 111, w: 316, h: 4 } },
  'combat-information': { cellId: 'proving-ground', surface: { x: 12, y: 139, w: 328, h: 4 } },
  'sensor-array': { cellId: 'cctv', surface: { x: 8, y: 143, w: 320, h: 4 } },
  'science-lab': { cellId: 'synthetic-bay', surface: { x: 6, y: 124, w: 341, h: 4 } }
});

export function getHubConsoleStationCellV142(roomId) {
  const definition = Object.hasOwn(HUB_CONSOLE_STATIONS_V142, roomId) ? HUB_CONSOLE_STATIONS_V142[roomId] : null;
  const original = definition && getHubAnnexStationCellV139(definition.cellId);
  if (!original || !HUB_ANNEX_STATION_ATLAS_V139.admitted) return null;
  return freeze({
    ...original,
    id: `main-${roomId}-console-v142`,
    asset: HUB_ANNEX_STATION_ATLAS_V139.asset,
    sourceCellId: original.id,
    usefulSurfaceSource: { ...definition.surface },
    occupiedSource: [{ ...definition.surface }],
    sourceStatus: 'reviewed-original-frontal-main-deck-console',
    stationSupportV142: 'opaque-foot-on-native-floor',
    workHeight: 40
  });
}
