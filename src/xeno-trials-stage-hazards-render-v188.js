import { getXenoTrialsStageHazardViewV188 } from './xeno-trials-stage-hazards-v188.js';

/** Draw inside the same world transform as the fighters. Rear = transparent
 * warning/body effect before actors. Front = bounded floor outline afterwards.
 * No text, full-screen flash, opaque body overlay or extra animation clock.
 */
export function drawXenoTrialsStageHazardsV188(ctx, match, arena, { plane = 'rear', reducedMotion = false } = {}) {
  const view = getXenoTrialsStageHazardViewV188(match);
  if (!view || !view.zones.length || !['rear', 'front'].includes(plane)) return view;
  const zone = view.zones[0], width = zone.right - zone.left, floor = arena.floor;
  ctx.save(); ctx.strokeStyle = view.color; ctx.fillStyle = view.color; ctx.lineWidth = 2;
  if (plane === 'front') {
    ctx.globalAlpha = 1;
    ctx.strokeRect(zone.left, floor - 5, width, 5);
    ctx.fillRect(zone.left, floor + 3, width * (view.phase === 'warning' ? view.warningProgress : 1 - view.activeProgress), 3);
    // Fixed corner chevrons signal the exact damaging width with or without motion.
    for (const x of [zone.left, zone.right]) {
      ctx.beginPath(); ctx.moveTo(x - 5, floor + 13); ctx.lineTo(x, floor + 7); ctx.lineTo(x + 5, floor + 13); ctx.stroke();
    }
  } else {
    const warning = view.phase === 'warning', center = (zone.left + zone.right) / 2;
    const jitter = reducedMotion ? 0 : Math.sin(match.tick * .09) * 3;
    // Physical floor fixtures and steady warning lamps, never collision boxes.
    ctx.globalAlpha = .7; ctx.fillStyle = '#172327';
    ctx.fillRect(zone.left, floor - 4, width, 4);
    ctx.fillStyle = view.color; ctx.globalAlpha = warning ? .35 : .65;
    for (let x = zone.left + 5; x < zone.right - 3; x += 13) ctx.fillRect(x, floor - 4, 5, 3);
    for (const x of [zone.left + 3, zone.right - 3]) {
      ctx.beginPath(); ctx.moveTo(x - 3, floor - 9); ctx.lineTo(x, floor - 14); ctx.lineTo(x + 3, floor - 9); ctx.fill();
    }
    ctx.beginPath(); ctx.rect(zone.left, floor - zone.top, width, zone.top - zone.bottom); ctx.clip();
    if (view.kind === 'debris') {
      const descent = warning ? 0 : reducedMotion ? .78 : view.activeProgress;
      const y = floor - zone.top + 10 + (zone.top - 26) * descent;
      ctx.globalAlpha = warning ? .55 : .85;
      for (let i = 0; i < 3; i++) {
        const x = zone.left + width * (i + .5) / 3, radius = 9 + i * 2;
        ctx.beginPath(); ctx.moveTo(x - radius, y - 5 + i * 3); ctx.lineTo(x + 2, y - 11 + i * 3);
        ctx.lineTo(x + radius, y - 2 + i * 3); ctx.lineTo(x + radius * .6, y + 8 + i * 3);
        ctx.lineTo(x - radius * .7, y + 5 + i * 3); ctx.closePath(); ctx.fill();
      }
      if (!warning) {
        ctx.globalAlpha = .13;
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(center + (i - 1) * width * .21, floor - 9, width * .23, 15, 0, 0, Math.PI * 2); ctx.fill(); }
      }
    } else if (!warning && view.kind === 'steam') {
      for (let i = 0; i < 5; i++) {
        ctx.globalAlpha = .1 + (i % 2) * .035;
        ctx.beginPath(); ctx.ellipse(center + Math.sin(i * 2) * width * .18 + jitter,
          floor - zone.top * (i + .5) / 5, width * (.26 + i * .02), zone.top * .23, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = .3;
      for (let i = 0; i < 3; i++) {
        const x = zone.left + width * (i + .5) / 3;
        ctx.beginPath(); ctx.moveTo(x, floor); ctx.quadraticCurveTo(x + jitter + 8, floor - zone.top * .3, x - jitter, floor - zone.top * .65); ctx.stroke();
      }
    } else if (!warning && view.kind === 'arc') {
      ctx.globalAlpha = .8;
      for (let strand = 0; strand < 2; strand++) {
        ctx.beginPath(); ctx.moveTo(zone.left, floor - 5 - strand * 8);
        for (let i = 1; i <= 8; i++) ctx.lineTo(zone.left + width * i / 8,
          floor - 5 - strand * 8 - (i % 2 ? zone.top * .55 + jitter : 0));
        ctx.stroke();
      }
    } else if (!warning && view.kind === 'corrosive') {
      ctx.globalAlpha = .62; ctx.beginPath(); ctx.ellipse(center, floor - zone.top * .42, width * .5, zone.top * .55, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = .85;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(zone.left + width * (i + .5) / 4, floor - 3 - i % 2 * 2, 2, 0, Math.PI * 2); ctx.stroke(); }
    } else if (!warning && view.kind === 'cryo') {
      ctx.globalAlpha = .23;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(zone.left + width * (i + .5) / 4 + jitter,
        floor - zone.top * .4, width * .25, zone.top * .6, -.12, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = .7;
      for (let i = 0; i < 5; i++) {
        const x = zone.left + width * (i + .5) / 5;
        ctx.beginPath(); ctx.moveTo(x - 3, floor); ctx.lineTo(x, floor - 5 - i % 2 * 5); ctx.lineTo(x + 3, floor); ctx.stroke();
      }
    }
  }
  ctx.restore(); return view;
}
