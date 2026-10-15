/** Transverse bulkheads in a side-on ship cutaway. The portal lies in the
 * depth of the corridor; it is not a front-facing door pasted on its rear wall.
 * Door IDs, opening thresholds, player coordinates and automatic opening logic
 * remain native. A closed leaf now collides at its actual 16 px walk-rail
 * cross-section rather than treating the former front-facing bitmap as a wall. */
import { getHubDoorBounds } from './hub-profiles-v53.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = value => Math.max(0, Math.min(1, finite(value)));

/** A transverse leaf intersects the 2D walk rail at its physical thickness.
 * The old 208 px bitmap width represented the door's depth, not a solid wall
 * along the corridor. Opening triggers and contact distances stay unchanged. */
export function getHubBulkheadColliderV134(door, { floorY = 624 } = {}) {
  if (!door || door.lift || door.kind && door.kind !== 'bulkhead') return getHubDoorBounds(door);
  return { x: finite(door.x) - 8, y: finite(floorY, 624) - 198, w: 16, h: 198 };
}

export function hubBulkheadDepthGeometryV134(door, { floorY = 624, ceilingY = 132 } = {}) {
  if (!door || door.lift || door.kind && door.kind !== 'bulkhead') return null;
  const center = finite(door.x), floor = finite(floorY, 624), height = 198;
  const rear = { x: center - 38, floorY: floor - 24 }, near = { x: center + 19, floorY: floor + 12 };
  const progress = clamp(door.progress), clearance = clamp(progress / .82), leafHeight = height * (1 - clearance);
  const top = Math.min(finite(ceilingY, 132), floor - height - 48), rearTop = rear.floorY - height, nearTop = near.floorY - height;
  // The ship is shown as a cutaway. Only the short lintel above the actual
  // opening is solid; drawing the entire section up to the ceiling made a
  // narrow transverse wall read as a five-person-high freestanding cabinet.
  const lintelTop = Math.max(top, rearTop - 54);
  return {
    id: door.id, centerX: center, floorY: floor, ceilingY: top,
    height, rear: { ...rear, topY: rearTop }, near: { ...near, topY: nearTop },
    progress, clearance, leafHeight, collisionBounds: getHubBulkheadColliderV134(door, { floorY: floor }),
    bounds: { x: rear.x - 16, y: top, w: near.x - rear.x + 30, h: near.floorY + 12 - top },
    opening: [[rear.x, rearTop], [near.x, nearTop], [near.x, near.floorY], [rear.x, rear.floorY]],
    lintelTop, upperSection: 'open-cutaway-with-rear-ties',
    slabPolygon: [[rear.x - 16, lintelTop], [near.x + 14, lintelTop + 36], [near.x + 14, nearTop - 12], [rear.x - 16, rearTop - 12]],
    headerPolygon: [[rear.x - 16, rearTop - 12], [rear.x, rearTop - 16], [near.x + 14, nearTop - 12], [near.x, nearTop]],
    thresholdPolygon: [[rear.x - 16, rear.floorY], [rear.x, rear.floorY - 2], [near.x + 14, near.floorY], [near.x, near.floorY + 2]],
    leafPolygon: [[rear.x, rearTop], [near.x, nearTop], [near.x, nearTop + leafHeight], [rear.x, rearTop + leafHeight]],
    rearJambBounds: { x: rear.x - 16, y: rearTop - 12, w: 16, h: height + 12 },
    nearReturnBounds: { x: near.x, y: nearTop - 12, w: 14, h: height + 24 },
    foregroundWidth: 14, rearPlane: 'before-actors', nearPlane: 'after-actors', gameplayPlane: '2d',
    projection: 'transverse-depth-cutaway', assetSource: 'original-vector-architecture'
  };
}

function polygon(ctx, points, fill, stroke) {
  ctx.beginPath(); points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
}
function edge(ctx, points, color, width = 1) {
  ctx.beginPath(); points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
}

/** The rear jamb, ceiling section and threshold are drawn before personnel.
 * Only the narrow near return and the closed leaf can occlude an actor. */
export function drawHubBulkheadDepthV134(ctx, door, { phase = 'front', playerCenterX = null, floorY = 624, ceilingY = 132 } = {}) {
  const geometry = hubBulkheadDepthGeometryV134(door, { floorY, ceilingY });
  if (!ctx || !geometry || !['back', 'front', 'all'].includes(phase)) return false;
  const { rear, near, height, collisionBounds, leafHeight, centerX, progress } = geometry;
  ctx.save(); ctx.lineWidth = 1;
  if (phase === 'back' || phase === 'all') {
    // Two slender rear ties connect the lintel to the overhead beam. The open
    // section between them keeps neighbouring wall bays readable in cutaway.
    ctx.fillStyle = '#23383c';
    ctx.fillRect(rear.x - 13, geometry.ceilingY + 46, 5, Math.max(0, geometry.lintelTop - geometry.ceilingY - 46));
    ctx.fillRect(near.x + 5, geometry.ceilingY + 46, 5, Math.max(0, geometry.lintelTop + 36 - geometry.ceilingY - 46));
    polygon(ctx, geometry.slabPolygon, '#1e3033', '#526a6c');
    edge(ctx, [[rear.x - 9, geometry.lintelTop + 8], [near.x + 7, geometry.lintelTop + 44],
      [near.x + 7, near.topY - 20], [rear.x - 9, rear.topY - 20]], '#3b5357', 3);
    for (let y = geometry.lintelTop + 20; y < rear.topY - 24; y += 22) {
      edge(ctx, [[rear.x - 9, y], [near.x + 7, y + 36]], '#0f2125', 2);
      ctx.fillStyle = '#688180'; ctx.fillRect(rear.x - 10, y + 4, 3, 3);
    }
    // Far vertical jamb and reveal are behind the actor, not painted over it.
    ctx.fillStyle = '#253c3f'; ctx.fillRect(rear.x - 16, rear.topY - 12, 16, height + 12);
    ctx.fillStyle = '#68817f'; ctx.fillRect(rear.x - 4, rear.topY - 8, 4, height + 8);
    edge(ctx, [[rear.x, rear.topY], [near.x, near.topY]], '#88a4a0', 4);
    polygon(ctx, geometry.thresholdPolygon, '#4d6665', '#7a928c');
    // The walk rail crosses the depth projection exactly at the native x.
    // Two small threshold marks identify the same 16 px collision section.
    ctx.fillStyle = '#6e7050'; ctx.fillRect(collisionBounds.x - 4, floorY + 5, collisionBounds.w + 8, 3);
  }
  if (phase === 'front' || phase === 'all') {
    // This is a vertically retracting transverse panel, not a pair of front-
    // facing horizontal leaves. It is fully clear at the native .82 threshold.
    if (leafHeight > .1) {
      ctx.save(); polygon(ctx, geometry.opening); ctx.clip();
      polygon(ctx, geometry.leafPolygon, '#344a4c', '#718782');
      for (let y = 20; y < leafHeight; y += 24) edge(ctx, [[rear.x + 3, rear.topY + y],
        [near.x - 2, near.topY + y]], '#1b3235', 3);
      edge(ctx, [[rear.x, rear.topY + leafHeight - 3], [near.x, near.topY + leafHeight - 3]], '#aa9e65', 5);
      ctx.restore();
    }
    // Foreground steel is just the near jamb's actual thickness. The open
    // passage contains no black rectangle and no bitmap alpha fringe.
    ctx.fillStyle = '#182d31'; ctx.fillRect(near.x, near.topY - 12, geometry.foregroundWidth, height + 24);
    ctx.fillStyle = '#657c79'; ctx.fillRect(near.x, near.topY - 8, 3, height + 20);
    ctx.fillStyle = '#3a5355'; ctx.fillRect(near.x + 9, near.topY - 12, 5, height + 24);
    polygon(ctx, geometry.headerPolygon, '#354e51', '#6d8682');
    ctx.fillStyle = progress >= .82 ? '#85c4a1' : door.locked ? '#b76853' : '#c7ad6b';
    ctx.fillRect(near.x + 4, near.topY + 14, 5, 12);
    for (const y of [near.topY + 42, near.floorY - 26]) { ctx.fillStyle = '#7b8c7c'; ctx.fillRect(near.x + 5, y, 3, 3); }
    if (Number.isFinite(playerCenterX) && Math.abs(playerCenterX - centerX) < 520 && door.destinationLabel) {
      const label = door.destinationLabel;
      ctx.font = '700 10px ui-monospace, monospace';
      const width = Math.min(310, ctx.measureText(label).width + 18), y = Math.min(rear.topY, near.topY) - 39;
      ctx.fillStyle = 'rgba(2,8,7,.88)'; ctx.fillRect(centerX - width / 2, y, width, 18);
      ctx.strokeStyle = '#526b5d'; ctx.strokeRect(centerX - width / 2 + .5, y + .5, width - 1, 17);
      ctx.fillStyle = '#b7d1be'; ctx.textAlign = 'center'; ctx.fillText(label, centerX, y + 13); ctx.textAlign = 'left';
    }
  }
  ctx.restore(); return true;
}
