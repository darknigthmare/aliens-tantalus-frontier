const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};

/** Reviewed Image Gen original: one lateral elevation with folded nacelles.
 * The two alpha192 skid bottoms end at source y639 (exclusive); the alpha16
 * fringe ends at y641. Both hard feet, rather than the crop edge, meet 624. */
export const HUB_DROPSHIP_HANGAR_ART_V139 = freeze({
  schema: 139,
  actorId: 'dropship-hangar-ud4l',
  roomId: 'dropship-hangar',
  asset: '/assets/openai/hub/props/v139/dropship-hangar-side.png',
  admitted: true,
  width: 2172,
  height: 724,
  sha256: '1eeebed15f9bcb368bdef39b8c75951111a80b56fd45241e1161d4a2eeb7064b',
  projection: 'strict-side-elevation',
  sourceStatus: 'reviewed-original-dropship-side-elevation',
  alphaPolicy: 'original-rgba-unchanged',
  source: { x: 48, y: 83, w: 2076, h: 558 },
  alphaBounds: [48, 83, 2124, 641],
  footSourceY: 556,
  landingSupports: [
    { id: 'aft-skid', x0: 540, x1: 888, footSourceY: 556, lastRowOpaquePixels: 69 },
    { id: 'forward-skid', x0: 1374, x1: 1822, footSourceY: 556, lastRowOpaquePixels: 58 }
  ],
  // Tops are inset into measured alpha192 strips of this PNG. Every segment
  // remains a rear-plane one-way support so the walking lane stays traversable.
  supports: [
    { id: 'ud4l-hull-aft', role: 'dropship-hull', source: { x: 537, y: 157, w: 642, h: 340 } },
    { id: 'ud4l-hull-forward', role: 'dropship-hull', source: { x: 1287, y: 217, w: 500, h: 270 } },
    { id: 'ud4l-gear-aft', role: 'dropship-gear', source: { x: 552, y: 527, w: 300, h: 29 } },
    { id: 'ud4l-gear-forward', role: 'dropship-gear', source: { x: 1390, y: 527, w: 402, h: 29 } }
  ]
});

export function getHubDropshipHangarPlacementV139(room) {
  const art = HUB_DROPSHIP_HANGAR_ART_V139;
  if (room?.id !== art.roomId) return null;
  const start = Number.isFinite(room.xStart) ? room.xStart : 0;
  const scale = 720 / art.source.w, supportY = 624;
  const renderBounds = { x: start + 150, y: supportY - art.footSourceY * scale,
    w: art.source.w * scale, h: art.source.h * scale };
  const project = source => ({ x: renderBounds.x + source.x * scale, y: renderBounds.y + source.y * scale,
    w: source.w * scale, h: source.h * scale });
  const collisionSegments = art.supports.map(({ source, ...support }) => ({ ...support, ...project(source),
    actorId: art.actorId, physicalPlane: 'rear', collisionMode: 'one-way-top' }));
  const left = Math.min(...collisionSegments.map(part => part.x)), top = Math.min(...collisionSegments.map(part => part.y));
  const right = Math.max(...collisionSegments.map(part => part.x + part.w));
  const interactionY = renderBounds.y - 24;
  return { schema: 139, actorId: art.actorId, asset: art.asset, admitted: art.admitted,
    source: { ...art.source }, sourceRenderBounds: { x: 0, y: 0, w: art.source.w, h: art.source.h },
    renderBounds, projection: art.projection, artProjection: art.projection, view: 'strict-side',
    scaleX: scale, scaleY: scale, scale, supportY,
    opaqueFoot: { y: supportY, sourceY: art.footSourceY },
    landingSupports: art.landingSupports.map(support => ({ ...support,
      x0: renderBounds.x + support.x0 * scale, x1: renderBounds.x + support.x1 * scale, y: supportY })),
    collisionBounds: { x: left, y: top, w: right - left, h: supportY - top,
      physicalPlane: 'rear', collisionMode: 'one-way-top' },
    collisionSegments,
    interactionBounds: { x: renderBounds.x - 32, y: interactionY, w: renderBounds.w + 64, h: supportY - interactionY },
    physicalPlane: 'rear', collisionMode: 'one-way-top' };
}
