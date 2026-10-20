/** Game-presentation joint envelope, not a claim of measured film anatomy.
 * Flexion is zero at a straight elbow. Keep service hands outside the folded
 * elbow's inner reach as well as inside the arm's maximum reach.
 */
export const PLAYER_ARM_FLEXION_LIMITS_V160 = Object.freeze({
  minFlexionDegrees: 5, maxFlexionDegrees: 145
});
export const PLAYER_ARM_SHOULDER_LIMITS_V160 = Object.freeze({
  minDegrees: -90, maxDegrees: 150
});

const EPSILON = 1e-7;
const point = (x, y) => ({ x, y });
const validPoint = value => Number.isFinite(value?.x) && Number.isFinite(value?.y);
const distance = (first, second) => Math.hypot(first.x - second.x, first.y - second.y);
const squaredDistance = (first, second) => (first.x - second.x) ** 2 + (first.y - second.y) ** 2;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const radians = degrees => degrees * Math.PI / 180;
const normalized = (value, fallback) => validPoint(value) && Math.hypot(value.x, value.y) > EPSILON
  ? point(value.x / Math.hypot(value.x, value.y), value.y / Math.hypot(value.x, value.y)) : fallback;

export function getPlayerArmAxesV160(axes, facing = 1) {
  return { forward: normalized(axes?.forward, point(facing < 0 ? -1 : 1, 0)),
    down: normalized(axes?.down, point(0, 1)) };
}

export function getPlayerArmJointAnglesV160(shoulder, target, lengths, axes = null, facing = 1, bend = 1) {
  if (!validPoint(shoulder) || !validPoint(target) || !getPlayerArmReachV160(lengths)) return null;
  const basis = getPlayerArmAxesV160(axes, facing), dx = target.x - shoulder.x, dy = target.y - shoulder.y;
  const length = Math.hypot(dx, dy), upper = lengths.upper, fore = lengths.fore;
  const flexion = Math.acos(clamp((length ** 2 - upper ** 2 - fore ** 2) / (2 * upper * fore), -1, 1));
  const elbowOffset = Math.atan2(fore * Math.sin(flexion), upper + fore * Math.cos(flexion));
  let shoulderAngle = Math.atan2(dx * basis.down.x + dy * basis.down.y,
    dx * basis.forward.x + dy * basis.forward.y) + elbowOffset * (bend < 0 ? -1 : 1);
  while (shoulderAngle > Math.PI) shoulderAngle -= Math.PI * 2;
  while (shoulderAngle < -Math.PI) shoulderAngle += Math.PI * 2;
  return { shoulderDegrees: shoulderAngle * 180 / Math.PI, flexionDegrees: flexion * 180 / Math.PI,
    shoulder: shoulderAngle, flexion };
}

export function getPlayerArmReachV160(lengths, limits = PLAYER_ARM_FLEXION_LIMITS_V160) {
  const upper = lengths?.upper, fore = lengths?.fore;
  if (!(Number.isFinite(upper) && upper > 0 && Number.isFinite(fore) && fore > 0)) return null;
  const minimumFlexion = clamp(Number.isFinite(limits?.minFlexionDegrees) ? limits.minFlexionDegrees : 5, 0, 175);
  const maximumFlexion = clamp(Number.isFinite(limits?.maxFlexionDegrees) ? limits.maxFlexionDegrees : 145, minimumFlexion, 175);
  const at = degrees => Math.sqrt(Math.max(0, upper ** 2 + fore ** 2 + 2 * upper * fore * Math.cos(degrees * Math.PI / 180)));
  return { min: at(maximumFlexion), max: at(minimumFlexion),
    minFlexionDegrees: minimumFlexion, maxFlexionDegrees: maximumFlexion };
}

function circleIntersections(first, second) {
  const dx = second.center.x - first.center.x, dy = second.center.y - first.center.y;
  const length = Math.hypot(dx, dy), a = first.radius, b = second.radius;
  if (length < EPSILON || length > a + b + EPSILON || length < Math.abs(a - b) - EPSILON) return [];
  const along = (a * a - b * b + length * length) / (2 * length);
  const heightSquared = a * a - along * along;
  if (heightSquared < -EPSILON) return [];
  const height = Math.sqrt(Math.max(0, heightSquared)), ux = dx / length, uy = dy / length;
  const middle = point(first.center.x + ux * along, first.center.y + uy * along);
  return [point(middle.x - uy * height, middle.y + ux * height),
    point(middle.x + uy * height, middle.y - ux * height)];
}

function circleLineIntersections(circle, line) {
  const n = line.normal, norm = Math.hypot(n.x, n.y);
  const signed = (line.offset - n.x * circle.center.x - n.y * circle.center.y) / norm;
  if (Math.abs(signed) > circle.radius + EPSILON) return [];
  const middle = point(circle.center.x + n.x / norm * signed, circle.center.y + n.y / norm * signed);
  const tangent = Math.sqrt(Math.max(0, circle.radius ** 2 - signed ** 2));
  return [point(middle.x - n.y / norm * tangent, middle.y + n.x / norm * tangent),
    point(middle.x + n.y / norm * tangent, middle.y - n.x / norm * tangent)];
}

/** Nearest rigid-weapon translation admitted by every arm contact. A feasible
 * boundary consists of circular arcs; its closest point is an arc projection
 * or an intersection of two boundaries. Enumerating these candidates avoids
 * oscillating projections between the inner holes of several reach annuli.
 * No source image, limb length, shoulder or muzzle is distorted.
 */
export function nearestReachableWeaponGripV160(desired, constraints = [], facing = 1, obstaclePlanes = []) {
  if (!validPoint(desired)) return null;
  const bands = constraints.filter(band => validPoint(band?.center) && Number.isFinite(band.min)
    && Number.isFinite(band.max) && band.max > 0 && band.min >= 0 && band.min <= band.max);
  // Every obstacle half-plane uses its outward collision normal and admits
  // n·grip >= offset. It retracts the full rigid receiver on the safe side.
  const lines = obstaclePlanes.filter(line => validPoint(line?.normal) && Number.isFinite(line.offset)
    && Math.hypot(line.normal.x, line.normal.y) > EPSILON);
  const violation = value => Math.max(bands.reduce((maximum, band) => {
    const length = distance(value, band.center);
    const joints = band.lengths && getPlayerArmJointAnglesV160(band.center, value, band.lengths, band.axes, facing, band.bend);
    const shoulderError = joints ? Math.max(PLAYER_ARM_SHOULDER_LIMITS_V160.minDegrees - joints.shoulderDegrees,
      joints.shoulderDegrees - PLAYER_ARM_SHOULDER_LIMITS_V160.maxDegrees, 0) * Math.PI / 180 * band.lengths.upper : 0;
    return Math.max(maximum, band.min - length, length - band.max, shoulderError, 0);
  }, 0), ...lines.map(line => Math.max(0,
    (line.offset - line.normal.x * value.x - line.normal.y * value.y) / Math.hypot(line.normal.x, line.normal.y))));
  if (violation(desired) <= EPSILON) return { grip: point(desired.x, desired.y), feasible: true, error: 0 };
  const circles = bands.flatMap(band => [band.min, band.max].filter(radius => radius > EPSILON)
    .map(radius => ({ center: band.center, radius })));
  // At a shoulder limit the upper arm ends at a fixed anatomical point;
  // the reachable wrist boundary is an arc of the forearm-length circle.
  for (const band of bands) if (band.lengths) {
    const axes = getPlayerArmAxesV160(band.axes, facing);
    for (const angle of Object.values(PLAYER_ARM_SHOULDER_LIMITS_V160).map(radians)) circles.push({
      center: point(band.center.x + band.lengths.upper * (Math.cos(angle) * axes.forward.x + Math.sin(angle) * axes.down.x),
        band.center.y + band.lengths.upper * (Math.cos(angle) * axes.forward.y + Math.sin(angle) * axes.down.y)),
      radius: band.lengths.fore
    });
  }
  const candidates = [];
  for (const circle of circles) {
    const dx = desired.x - circle.center.x, dy = desired.y - circle.center.y, length = Math.hypot(dx, dy);
    if (length > EPSILON) candidates.push(point(circle.center.x + dx * circle.radius / length,
      circle.center.y + dy * circle.radius / length));
    else for (const [x, y] of [[facing < 0 ? -1 : 1, 0], [0, 1], [0, -1], [facing < 0 ? 1 : -1, 0]])
      candidates.push(point(circle.center.x + x * circle.radius, circle.center.y + y * circle.radius));
  }
  for (let first = 0; first < circles.length; first++) for (let second = first + 1; second < circles.length; second++)
    candidates.push(...circleIntersections(circles[first], circles[second]));
  for (const line of lines) {
    const n = line.normal, normSquared = n.x ** 2 + n.y ** 2;
    const amount = (line.offset - n.x * desired.x - n.y * desired.y) / normSquared;
    candidates.push(point(desired.x + n.x * amount, desired.y + n.y * amount));
    for (const circle of circles) candidates.push(...circleLineIntersections(circle, line));
  }
  for (let first = 0; first < lines.length; first++) for (let second = first + 1; second < lines.length; second++) {
    const a = lines[first], b = lines[second], determinant = a.normal.x * b.normal.y - a.normal.y * b.normal.x;
    if (Math.abs(determinant) > EPSILON) candidates.push(point(
      (a.offset * b.normal.y - a.normal.y * b.offset) / determinant,
      (a.normal.x * b.offset - a.offset * b.normal.x) / determinant));
  }
  const admitted = candidates.filter(value => violation(value) <= EPSILON);
  if (admitted.length) {
    admitted.sort((first, second) => squaredDistance(first, desired) - squaredDistance(second, desired));
    return { grip: admitted[0], feasible: true, error: 0 };
  }
  // An impossible authored contact stays explicitly observable. Choose the
  // least violating finite candidate; callers never silently lengthen an arm.
  candidates.push(point(desired.x, desired.y));
  candidates.sort((first, second) => violation(first) - violation(second)
    || squaredDistance(first, desired) - squaredDistance(second, desired));
  return { grip: candidates[0], feasible: false, error: violation(candidates[0]) };
}

/** A reload hand may travel between two reachable contacts whose straight
 * segment cuts through its own shoulder. Interpolate actual shoulder and
 * elbow angles, keeping the entire path inside their joint envelopes.
 */
export function interpolatePlayerArmTargetV160(from, to, progress, shoulder, lengths, facing = 1, axes = null, bend = 1) {
  const reach = getPlayerArmReachV160(lengths);
  const t = clamp(Number.isFinite(progress) ? progress : 0, 0, 1);
  if (!validPoint(from) || !validPoint(to) || !validPoint(shoulder) || !reach)
    return validPoint(from) && validPoint(to) ? point(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t) : null;
  // A little interior clearance keeps floating-point rounding out of the IK
  // clamp at the exact endpoint, without changing anatomical bone lengths.
  const safe = { min: reach.min + .001, max: reach.max - .001 };
  const band = { center: shoulder, ...safe, lengths, axes, bend };
  const start = nearestReachableWeaponGripV160(from, [band], facing).grip;
  const end = nearestReachableWeaponGripV160(to, [band], facing).grip;
  const first = getPlayerArmJointAnglesV160(shoulder, start, lengths, axes, facing, bend);
  const last = getPlayerArmJointAnglesV160(shoulder, end, lengths, axes, facing, bend);
  const upperAngle = first.shoulder + (last.shoulder - first.shoulder) * t;
  const flexion = first.flexion + (last.flexion - first.flexion) * t;
  const direction = bend < 0 ? -1 : 1;
  const forward = lengths.upper * Math.cos(upperAngle) + lengths.fore * Math.cos(upperAngle - flexion * direction);
  const down = lengths.upper * Math.sin(upperAngle) + lengths.fore * Math.sin(upperAngle - flexion * direction);
  const basis = getPlayerArmAxesV160(axes, facing);
  return point(shoulder.x + basis.forward.x * forward + basis.down.x * down,
    shoulder.y + basis.forward.y * forward + basis.down.y * down);
}
