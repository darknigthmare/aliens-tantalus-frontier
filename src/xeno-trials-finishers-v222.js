import { XENO_TRIALS_ARENA_V105, getXenoTrialsBodyBoundsV105 } from './xeno-trials-geometry-v105.js';

const stages = new Set(['containment-deck', 'reactor-ring', 'tantalus-bridge', 'tantalus-cargo']);
const targets = new Set(['queen', 'smasher', 'chrysalis', 'defender', 'user-brute', 'synth-heavy',
  'combat-synth', 'synth-automated-powerloader', 'xenoborg', 'mecha', 'mecha-2', 'mechanoid']);
const timing = Object.freeze({ approachMs: 380, holdMs: 660, retreatMs: 320 });
const { floor } = XENO_TRIALS_ARENA_V105;
const threshold = 8;

/** Track a fallen specimen through the unmarked gap between the two existing
 * isolation fixtures. Only post-verdict selection can drive their indicators. */
export function getXenoTrialsCrossScanV222(match, attacker, target, fixtures) {
  const stageId = match.config.stageId;
  if (!stages.has(stageId) || match.result.stageId !== stageId || !targets.has(target.id) || fixtures.length !== 2) return null;
  const [first, second] = fixtures;
  const source = getXenoTrialsBodyBoundsV105(attacker), body = getXenoTrialsBodyBoundsV105(target);
  const left = first.right, right = second.left;
  if (body.center < left + threshold || body.center > right - threshold
    || target.x < left || target.x > right || Math.abs(source.center - body.center) > 236) return null;
  return { id: `${attacker.id}::fin2`, kind: 'isolation', timing,
    lock: { neutral: true, attacker, target, crossScanV222: { fixtures: [first, second], left, right, center: body.center } } };
}

export function drawXenoTrialsCrossScanV222(ctx, view) {
  const { lock, gain, contact } = view;
  const { fixtures, left, right, center } = lock.crossScanV222;
  const heads = [left + (center - left) * gain, right - (right - center) * gain];
  ctx.save();
  ctx.strokeStyle = '#a9d2d7';
  ctx.lineWidth = 2;
  ctx.globalAlpha *= .8 * gain;
  for (const [index, head] of heads.entries()) {
    const origin = index === 0 ? left - 4.5 : right + 4.5;
    ctx.beginPath();
    ctx.moveTo(origin, floor - 4);
    ctx.lineTo(head, floor - 4);
    ctx.lineTo(head, floor - 14);
    ctx.stroke();
  }
  if (contact) {
    ctx.fillStyle = '#a9d2d7';
    ctx.fillRect(center - 6, floor - 18, 12, 3);
  }
  ctx.restore();
  return { targetId: lock.target.id, targetX: lock.target.x, left, right, floor, contact,
    crossScanV222: { fixtureIds: fixtures.map(fixture => fixture.id), center, heads } };
}
