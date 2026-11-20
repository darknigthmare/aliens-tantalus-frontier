import { getXenoTrialsBodyBoundsV105 } from './xeno-trials-geometry-v105.js';

const colors = Object.freeze({ metal: '#1c2c32', edge: '#819a99', inactive: '#788e89', contact: '#edc98e',
  locked: '#ce8d76', ready: '#a9d8ca', charging: '#ecd199', open: '#9ce2b4' });

function drawCrate(ctx, x, y, width, height, lamp) {
  ctx.fillStyle = colors.metal; ctx.strokeStyle = colors.edge; ctx.lineWidth = 1.5;
  ctx.fillRect(x, y, width, height); ctx.strokeRect(x, y, width, height);
  ctx.fillStyle = '#0b171b'; ctx.fillRect(x + width * .20, y + 3, width * .60, height - 6);
  ctx.fillStyle = lamp;
  ctx.fillRect(x + 3, y + 3, 2, height - 6); ctx.fillRect(x + width - 5, y + 3, 2, height - 6);
  ctx.fillRect(x + width * .32, y + height * .55, width * .36, 2);
}

function drawStatusRail(ctx, x, y, width, fraction, lamp) {
  ctx.fillStyle = '#0b171b'; ctx.fillRect(x, y, width, 5);
  ctx.fillStyle = lamp; ctx.fillRect(x, y, width * fraction, 5);
}

function drawCarried(ctx, source, player, floor) {
  const body = getXenoTrialsBodyBoundsV105(player);
  const facing = player.facing === -1 ? -1 : 1;
  const width = Math.max(28, Math.min(46, body.width * .46));
  const x = body.center - facing * (body.width * .43 + width * .50);
  const y = floor - body.bottom - body.height * .53;
  ctx.strokeStyle = colors.contact; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(body.center, y); ctx.lineTo(x, y + 2); ctx.stroke();
  drawCrate(ctx, x - width / 2, y - 10, width, 22, colors.contact);
  return { id: source.id, x, y, width, facing, operatorX: player.x, elevation: player.y };
}

function drawDepot(ctx, depot, supplies, floor) {
  const x = depot.x, y = floor - 42;
  ctx.fillStyle = '#142125'; ctx.strokeStyle = colors.edge; ctx.lineWidth = 1.5;
  ctx.fillRect(x - 62, y, 124, 39); ctx.strokeRect(x - 62, y, 124, 39);
  ctx.fillStyle = colors.metal; ctx.fillRect(x - 60, y + 30, 120, 7);
  const slots = supplies.map((supply, index) => {
    const slotX = x + (index - (supplies.length - 1) / 2) * 35;
    ctx.strokeStyle = supply.delivered ? colors.open : colors.inactive;
    ctx.strokeRect(slotX - 13, y + 5, 26, 22);
    if (supply.delivered) drawCrate(ctx, slotX - 12, y + 6, 24, 20, colors.open);
    return { id: supply.id, x: slotX, occupied: supply.delivered };
  });
  const progress = depot.progress / depot.requiredTicks;
  if (progress > 0) drawStatusRail(ctx, x - 59, y - 9, 118, progress, colors.contact);
  return { x, slots, progress };
}

function drawAirlock(ctx, exit, floor, status, elapsedTicks, reducedMotion) {
  const x = exit.x, height = 118, y = floor - height;
  const phase = exit.completed ? 'open' : status !== 'active' || !exit.active ? 'locked' : exit.progress > 0 ? 'charging' : 'ready';
  const lamp = colors[phase], progress = exit.progress / exit.requiredTicks;
  const doorGap = phase === 'open' ? 58 : 0;
  const scanY = phase === 'charging' ? y + 23 + (reducedMotion ? 33 : (elapsedTicks % 48) / 47 * 66) : null;
  const box = { left: x - 62, right: x + 62, top: y, bottom: floor - 2 };

  ctx.save(); ctx.beginPath(); ctx.rect(box.left, box.top, 124, height - 2); ctx.clip();
  ctx.fillStyle = '#09151a'; ctx.strokeStyle = colors.edge; ctx.lineWidth = 2;
  ctx.fillRect(box.left, y, 124, height); ctx.strokeRect(box.left + 1, y + 1, 122, height - 4);
  ctx.fillStyle = colors.metal;
  ctx.fillRect(x - 52, y + 21, 52 - doorGap / 2, height - 23);
  ctx.fillRect(x + doorGap / 2, y + 21, 52 - doorGap / 2, height - 23);
  ctx.strokeStyle = lamp; ctx.strokeRect(x - 51, y + 22, 102, height - 26);
  for (const postX of [x - 56, x + 53]) {
    ctx.fillStyle = '#4d6266'; ctx.fillRect(postX, y + 20, 3, height - 22);
    ctx.fillStyle = lamp;
    for (let i = 0; i < 3; i++) ctx.fillRect(postX - 1, y + 39 + i * 19, 5, 5);
  }
  if (doorGap === 0) {
    ctx.fillStyle = '#081318'; ctx.fillRect(x - 2, y + 23, 4, height - 26);
    ctx.strokeStyle = lamp; ctx.lineWidth = 2;
    if (phase === 'locked') {
      ctx.beginPath(); ctx.moveTo(x - 8, y + 59); ctx.lineTo(x + 8, y + 75);
      ctx.moveTo(x + 8, y + 59); ctx.lineTo(x - 8, y + 75); ctx.stroke();
    } else {
      ctx.fillStyle = lamp; ctx.fillRect(x - 12, y + 63, 9, 5); ctx.fillRect(x + 3, y + 63, 9, 5);
    }
  }
  if (scanY !== null) {
    ctx.globalAlpha = .32; ctx.fillStyle = lamp; ctx.fillRect(x - 49, scanY, 98, 3); ctx.globalAlpha = 1;
  }
  drawStatusRail(ctx, x - 46, y + 8, 92, progress, lamp);
  ctx.restore();
  return { x, phase, progress, doorGap, scanY, box, reducedMotion };
}

/** Paint the real extraction ledger before the combatants. Props never own a
 * hitbox or advance the latch. Their positions survive pause or restoration. */
export function drawXenoTrialsExtractionV203(ctx, match, view, floor, reducedMotion) {
  const supplies = view.entities.filter(entity => entity.kind === 'supply');
  const depot = view.entities.find(entity => entity.kind === 'depot');
  const exit = view.entities.find(entity => entity.kind === 'exit');
  const staged = supplies.filter(entity => !entity.carried && !entity.delivered);
  const carried = supplies.find(entity => entity.carried);
  const player = match.fighters[0];
  ctx.save();
  for (const crate of staged) {
    const x = crate.x, y = floor - 31, progress = crate.progress / crate.requiredTicks;
    ctx.fillStyle = colors.inactive; ctx.fillRect(x - 26, floor - 7, 52, 5);
    drawCrate(ctx, x - 20, y, 40, 24, crate.active ? colors.contact : colors.inactive);
    if (progress > 0) drawStatusRail(ctx, x - 22, y - 9, 44, progress, colors.contact);
  }
  const depotView = drawDepot(ctx, depot, supplies, floor);
  const airlock = drawAirlock(ctx, exit, floor, view.status, match.operationV188.elapsedTicks, reducedMotion);
  const payload = carried && player ? drawCarried(ctx, carried, player, floor) : null;
  ctx.restore();
  return { staged: staged.map(entity => ({ id: entity.id, x: entity.x })), carried: payload, depot: depotView, airlock };
}
