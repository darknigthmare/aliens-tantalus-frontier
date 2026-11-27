import { getXenoTrialsBodyBoundsV105 } from './xeno-trials-geometry-v105.js';
import { XENO_TRIALS_OPERATION_LIMITS_V188 } from './xeno-trials-operations-v188.js';
import { getXenoTrialsStageHazardViewV188 } from './xeno-trials-stage-hazards-v188.js';

const warningTicks = 48;
const clearance = 12;

function getEscape(match, arena) {
  const hazard = getXenoTrialsStageHazardViewV188(match);
  const zone = hazard?.zones[0], player = match.fighters?.[0];
  if (!zone || !player || player.hp <= 0) return null;
  const body = getXenoTrialsBodyBoundsV105(player);
  // Use precisely the environmental contact volume and collider. Marker X is
  // a reachable operator pivot clear of the band even if the fighter turns.
  if (body.right <= zone.left || body.left >= zone.right || body.bottom >= zone.top || body.top <= zone.bottom) return null;
  const turned = getXenoTrialsBodyBoundsV105({ ...player, facing: player.facing === -1 ? 1 : -1 });
  const front = Math.max(body.right, turned.right) - player.x;
  const back = player.x - Math.min(body.left, turned.left);
  const routes = [
    { direction: 'left', x: zone.left - front - clearance },
    { direction: 'right', x: zone.right + back + clearance }
  ].filter(route => route.x >= arena.left && route.x <= arena.right)
    .sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x));
  if (!routes.length) return null;
  return { hazardId: hazard.id, phase: hazard.phase, zone: { ...zone }, preferred: routes[0].direction, routes };
}

/** Read the same cadence as the operation step. The forecast is for the
 * currently open conduits and therefore changes immediately when one seals. */
export function getXenoTrialsPurgeTelemetryV204(match, view, arena) {
  if (view.kind !== 'purge' || view.status !== 'active') return null;
  const state = match.operationV188;
  const { purgePressureTicks, ticksPerSecond } = XENO_TRIALS_OPERATION_LIMITS_V188;
  const open = view.entities.filter(vent => vent.kind === 'vent' && !vent.completed).length;
  const expectedLoss = view.decompressionV224?.pressureLoss ?? open;
  const remainingTicks = purgePressureTicks - state.elapsedTicks % purgePressureTicks;
  const pressure = view.decompressionV224 && expectedLoss === 0 ? null : { open, expectedLoss: Math.min(view.integrity, expectedLoss), integrity: view.integrity,
    remainingTicks, seconds: Math.ceil(remainingTicks * 10 / ticksPerSecond) / 10,
    nextLossTick: state.lastTick + remainingTicks,
    phase: remainingTicks <= warningTicks ? 'warning' : 'building' };
  return { pressure, escape: getEscape(match, arena) };
}

function drawValve(ctx, entity, floor, elapsed, pressure, reducedMotion) {
  const { x } = entity, y = floor - 40, progress = entity.progress / entity.requiredTicks;
  const phase = entity.completed ? 'sealed' : progress > 0 ? 'partial' : 'open';
  const gap = entity.completed ? 0 : 20 * (1 - progress);
  const plumeHeight = gap > 0 ? 19 + gap * (pressure?.phase === 'warning' ? 2.7 : 1.6) : 0;
  const sway = plumeHeight > 0 && !reducedMotion ? Math.sin(elapsed * .065) * 6 : 0;
  const color = entity.completed ? '#a6d8a5' : pressure?.phase === 'warning' ? '#f0a47c' : '#d5b487';
  const clip = { x: x - 58, y: floor - 126, width: 116, height: 126 };
  ctx.save();
  ctx.beginPath(); ctx.rect(clip.x, clip.y, clip.width, clip.height); ctx.clip();
  ctx.fillStyle = '#19282d'; ctx.strokeStyle = '#748a88'; ctx.lineWidth = 1.5;
  ctx.fillRect(x - 47, y - 17, 94, 33); ctx.strokeRect(x - 47, y - 17, 94, 33);
  ctx.fillRect(x - 34, y, 68, 37); ctx.strokeRect(x - 34, y, 68, 37);
  ctx.fillStyle = '#081319'; ctx.fillRect(x - 23, y + 5, 46, 19);
  if (gap > 0) {
    ctx.fillStyle = color; ctx.globalAlpha = .16;
    ctx.beginPath(); ctx.moveTo(x - gap / 2, y + 5); ctx.lineTo(x - gap * .9 + sway, y - plumeHeight);
    ctx.lineTo(x + gap * .9 + sway, y - plumeHeight); ctx.lineTo(x + gap / 2, y + 5); ctx.closePath(); ctx.fill();
  }
  ctx.globalAlpha = 1; ctx.fillStyle = '#41565b';
  const blade = (42 - gap) / 2;
  ctx.fillRect(x - 21, y + 7, blade, 15); ctx.fillRect(x + gap / 2, y + 7, blade, 15);
  ctx.fillStyle = color;
  ctx.fillRect(x - 28, y + 28, 5, 4); ctx.fillRect(x + 23, y + 28, 5, 4);
  ctx.fillRect(x - 17, y + 29, 34 * progress, 3);
  if (!entity.completed && pressure) {
    const fraction = 1 - pressure.remainingTicks / XENO_TRIALS_OPERATION_LIMITS_V188.purgePressureTicks;
    ctx.fillRect(x - 41, y - 12, 82 * fraction, 3);
  }
  ctx.restore();
  return { id: entity.id, x, phase, progress, charge: entity.progress, gap, plumeHeight, sway, clip };
}

function drawEscape(ctx, escape, floor) {
  ctx.save(); ctx.lineWidth = 2; ctx.strokeStyle = '#a8dbc9';
  for (const { direction, x } of escape.routes) {
    const sign = direction === 'left' ? -1 : 1;
    ctx.globalAlpha = direction === escape.preferred ? .88 : .45;
    ctx.beginPath(); ctx.moveTo(x, floor - 13); ctx.lineTo(x, floor - 40);
    ctx.moveTo(x - sign * 9, floor - 28); ctx.lineTo(x + sign * 8, floor - 28);
    ctx.lineTo(x, floor - 36); ctx.moveTo(x + sign * 8, floor - 28); ctx.lineTo(x, floor - 20); ctx.stroke();
  }
  ctx.restore();
}

/** Valve housings, fumes and escape signs belong to the world-space rear
 * plane. The separate physical hazard renderer still owns the true band. */
export function drawXenoTrialsPurgeV204(ctx, match, view, arena, reducedMotion) {
  const telemetry = getXenoTrialsPurgeTelemetryV204(match, view, arena);
  const pressure = telemetry?.pressure ?? null, escape = telemetry?.escape ?? null;
  const vents = view.entities.filter(entity => entity.kind === 'vent')
    .map(entity => drawValve(ctx, entity, arena.floor, match.operationV188.elapsedTicks, pressure, reducedMotion));
  if (escape) drawEscape(ctx, escape, arena.floor);
  return { pressure, vents, escape, reducedMotion };
}
