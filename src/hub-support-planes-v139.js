import { getHubRoomPresentationV119 } from './hub-room-presentation-v119.js';

/** Shared architectural section. Native positions are the real foot/support
 * lines; depth only describes how a supported surface continues toward the
 * viewer. It never changes a collider, a saved position or an actor's feet. */
export const HUB_SUPPORT_STANDARD_V139 = Object.freeze({
  walkY: 624, serviceDepth: 24, deckDepth: 8, dxPerY: 19 / 12,
  gameplayPlane: '2d', supportEdge: 'native-rear-edge', projection: 'parallel-oblique'
});

export function getHubSupportPlanesV139(room, { depthEnabled = true } = {}) {
  const standard = HUB_SUPPORT_STANDARD_V139;
  const walkY = Number.isFinite(room?.world?.floorY) ? room.world.floorY : standard.walkY;
  const authoredPresentationMode = getHubRoomPresentationV119(room).presentationMode;
  const presentationMode = getHubRoomPresentationV119(room, depthEnabled).presentationMode;
  const depth = authoredPresentationMode === '2.5d' ? standard.serviceDepth : 0;
  const visibleDepth = presentationMode === '2.5d';
  return {
    presentationMode, authoredPresentationMode, walkY, rearServiceY: walkY - depth,
    projectionDxPerY: visibleDepth ? standard.dxPerY : 0,
    serviceDepthX: -depth * standard.dxPerY, serviceDepthY: -depth,
    deckDepth: visibleDepth ? standard.deckDepth : 0,
    supportEdge: standard.supportEdge, gameplayPlane: standard.gameplayPlane,
    coordinatePolicy: 'preserve-native-support-and-feet'
  };
}

/** A real ladder continues above the landing so an adult can finish the
 * pull-up. The same finite grid is consumed by painting, reservations and the
 * hub rig; native top/bottom remain the unchanged physical travel endpoints. */
export function getHubLadderMountV139(ladder, { centered = true } = {}) {
  if (!ladder || ![ladder.x, ladder.top, ladder.bottom].every(Number.isFinite) || !(ladder.bottom > ladder.top)) return null;
  const width = Math.max(42, Math.min(52, Number.isFinite(ladder.w) ? ladder.w : 52));
  const left = ladder.x - (centered ? width / 2 : 0);
  const rungSpacing = 22, firstRung = 11, railTop = ladder.top - 88, rungOriginY = ladder.top + firstRung;
  const firstIndex = Math.ceil((railTop - rungOriginY) / rungSpacing);
  const lastIndex = Math.ceil((ladder.bottom - 5 - rungOriginY) / rungSpacing) - 1;
  return {
    left, width, physicalTop: ladder.top, physicalBottom: ladder.bottom,
    railTop, railBottom: ladder.bottom, rungTop: railTop, rungSpacing, firstRung, rungOriginY,
    rungBottom: rungOriginY + lastIndex * rungSpacing,
    rungs: Array.from({ length: Math.max(0, lastIndex - firstIndex + 1) }, (_, offset) => {
      const index = firstIndex + offset;
      return { index, y: rungOriginY + index * rungSpacing, x: left + 6, w: width - 12 };
    }),
    visualBounds: { x: left - 5, y: railTop, w: width + 9, h: ladder.bottom - railTop },
    geometryPreserved: true
  };
}
