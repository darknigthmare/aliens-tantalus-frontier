import { XENO_TRIALS_ARENA_V105, XENO_TRIALS_CONTACT_GAP_V105, getXenoTrialsBodyBoundsV105 } from './xeno-trials-geometry-v105.js';
import { getXenoTrialsRenderMetricsV110 } from './xeno-trials-scale-v110.js';
import { getXenoTrialsFinisherFixturesV210 } from './xeno-trials-finishers-v210.js';
import { getXenoTrialsFinisherGaitV212 } from './xeno-trials-finishers-v212.js';

const maximumRetreat = 108;
const clearance = 8;
const { floor, left: arenaLeft, right: arenaRight } = XENO_TRIALS_ARENA_V105;

/** A victor already on the perimeter moves out of the device's footprint.
 * The scenery responds after the approach, while both engine roots stay put. */
export function getXenoTrialsFixtureWithdrawalV221(match, attacker, target, images) {
  const stageId = match.config.stageId;
  if (match.result.stageId !== stageId) return null;
  const fixtures = getXenoTrialsFinisherFixturesV210(stageId);
  if (!fixtures.length) return null;
  const direction = Math.sign(target.x - attacker.x);
  if (!direction || attacker.facing !== direction) return null;
  const source = getXenoTrialsBodyBoundsV105(attacker), body = getXenoTrialsBodyBoundsV105(target);
  const gap = direction > 0 ? body.left - source.right : source.left - body.right;
  if (gap < XENO_TRIALS_CONTACT_GAP_V105 - 1e-6) return null;
  const fixture = fixtures.find(value => target.x >= value.left && target.x <= value.right
    && body.center >= value.left && body.center <= value.right);
  if (!fixture) return null;
  const edge = direction > 0 ? source.right : source.left;
  const [padX] = fixture.pads[direction > 0 ? 0 : 1];
  const travel = (edge - padX) * direction + clearance;
  if (travel <= clearance + 2 || travel > maximumRetreat) return null;
  const offset = -direction * travel, destination = attacker.x + offset;
  if (source.left + offset < arenaLeft || source.right + offset > arenaRight) return null;
  const gait = getXenoTrialsFinisherGaitV212(attacker, images, true);
  if (!gait) return null;
  const metrics = getXenoTrialsRenderMetricsV110(attacker.id, attacker.variant);
  const frames = gait.atlas.frames.filter(frame => frame.id === 'idle' || frame.id.startsWith('walk-'));
  const supported = frames.every(frame => {
    const pose = gait.layout(gait.atlas, frame, metrics, { x: destination, y: floor, facing: direction });
    return pose?.supports.length && pose.supports.every(([x, y]) => x >= arenaLeft && x <= arenaRight && Math.abs(y - floor) <= 6);
  });
  if (!supported) return null;
  const travelMs = Math.max(250, Math.round(travel * 9));
  return { id: `${attacker.id}::fin2`, kind: fixture.kind,
    timing: { approachMs: travelMs, holdMs: 570, retreatMs: travelMs },
    lock: { neutral: true, attacker, target, fixture, approachV212: { offset, gait },
      withdrawalV221: { padX, destination } } };
}
