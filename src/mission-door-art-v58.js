export const MISSION_DOOR_ATLAS_V58 = '/assets/openai/metroidvania/props/mission-door-states-v58.png';

export const MISSION_DOOR_ATLAS_GRID_V58 = Object.freeze({
  width: 2048,
  height: 2048,
  columns: 2,
  rows: 4,
  cellWidth: 1024,
  cellHeight: 512,
  closedColumn: 0,
  openColumn: 1
});

const crop = (x, y, w, h) => Object.freeze({ x, y, w, h });

export const MISSION_DOOR_ART_V58 = Object.freeze({
  'ship-bulkhead': Object.freeze({ row: 0, sourceBounds: crop(284, 24, 456, 464) }),
  'colony-gate': Object.freeze({ row: 1, sourceBounds: crop(24, 47, 976, 418) }),
  'security-shutter': Object.freeze({ row: 2, sourceBounds: crop(62, 24, 899, 464) }),
  'pressure-airlock': Object.freeze({ row: 3, sourceBounds: crop(208, 24, 607, 464) })
});

export function resolveMissionDoorArtV58(door = {}) {
  const visualRole = MISSION_DOOR_ART_V58[door.visualRole] ? door.visualRole : 'ship-bulkhead';
  const profile = MISSION_DOOR_ART_V58[visualRole];
  const open = Boolean(door.open || Number(door.progress) >= 0.82);
  const column = open ? MISSION_DOOR_ATLAS_GRID_V58.openColumn : MISSION_DOOR_ATLAS_GRID_V58.closedColumn;
  return Object.freeze({
    ...profile,
    visualRole,
    open,
    column,
    imageKey: 'missionDoorStatesV58',
    asset: MISSION_DOOR_ATLAS_V58,
    source: Object.freeze({
      x: column * MISSION_DOOR_ATLAS_GRID_V58.cellWidth + profile.sourceBounds.x,
      y: profile.row * MISSION_DOOR_ATLAS_GRID_V58.cellHeight + profile.sourceBounds.y,
      w: profile.sourceBounds.w,
      h: profile.sourceBounds.h
    })
  });
}
