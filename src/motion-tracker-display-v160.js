// Device-like screen, not a generated art replacement. Visual cues reference
// the official Alien:Isolation manual, explicitly adapted to this2D world.
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const mono = 'ui-monospace, monospace';
const validBounds = bounds => bounds && [bounds.x, bounds.y, bounds.width, bounds.height].every(Number.isFinite)
  && bounds.width > 0 && bounds.height > 0;
const overlaps = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x
  && a.y < b.y + b.height && a.y + a.height > b.y;

/** Logical screen bounds around the visible body, rather than its narrower
 * collider. The current physical foot keeps this read-only projection current. */
export function motionTrackerActorBoundsV160(actor, camera = {}) {
  if (!actor || ![actor.x, actor.y, actor.w, actor.h].every(Number.isFinite)) return null;
  const visual = actor.playerAppearanceVisualV126?.humanVisualV133;
  const height = Number.isFinite(visual?.poseHeight) && visual.poseHeight > 0 ? visual.poseHeight : Math.max(140, actor.h);
  const width = Math.max(actor.w, height * .8), pad = 10;
  return { x: actor.x + actor.w / 2 - width / 2 - pad - (Number.isFinite(camera.x) ? camera.x : 0),
    y: actor.y + actor.h - height - pad - (Number.isFinite(camera.y) ? camera.y : 0),
    width: width + pad * 2, height: height + pad * 2 };
}

export function motionTrackerLayoutV160({ viewportWidth = 1280, vehicle = false, actorScreenBounds = null } = {}) {
  const viewport = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 1280;
  const compact = viewport < 900;
  // Compact coordinates are CSS pixels. They use a separate composition, not
  // a scaled-down desktop instrument with illegibly small text.
  const scale = compact ? 1280 / viewport : clamp(1280 / viewport, 1, 2.65);
  const designWidth = compact ? 176 : 240, designHeight = compact ? 82 : 220;
  const width = designWidth * scale, height = designHeight * scale, margin = compact ? 8 * scale : 18;
  const layout = { x: 1280 - margin - width, y: compact || vehicle ? 112 : 18,
    width, height, scale, compact, designWidth, designHeight };
  if (compact && validBounds(actorScreenBounds)) {
    // Consult the body already drawn this frame. Keep the radar above it where
    // that fits; on a high platform the opposite corner can remain clear.
    const gap = 6 * scale, minimumY = 4 * scale;
    layout.y = Math.max(minimumY, Math.min(layout.y, actorScreenBounds.y - gap - height));
    if (overlaps(layout, actorScreenBounds)) {
      const opposite = { ...layout, x: margin };
      if (!overlaps(opposite, actorScreenBounds)) layout.x = opposite.x;
      else {
        // A high, camera-centred body may span both compact corners. Keep the
        // instrument below its feet when that full composition still fits.
        const below = { ...layout, y: actorScreenBounds.y + actorScreenBounds.height + gap };
        if (below.y >= minimumY && below.y + below.height <= 720
          && !overlaps(below, actorScreenBounds)) layout.y = below.y;
      }
    }
  }
  layout.y = clamp(layout.y, 0, Math.max(0, 720 - height));
  layout.x = clamp(layout.x, 0, Math.max(0, 1280 - width));
  return layout;
}

function drawCompactTracker(ctx, model, reduced) {
  ctx.fillStyle = '#302d21'; ctx.fillRect(0, 0, 176, 82);
  ctx.strokeStyle = '#8f9870'; ctx.lineWidth = 1; ctx.strokeRect(.5, .5, 175, 81);
  ctx.fillStyle = '#101c10'; ctx.fillRect(6, 19, 164, 47);
  ctx.fillStyle = '#d5ddad'; ctx.font = `700 11px ${mono}`; ctx.textAlign = 'left';
  ctx.fillText('M314 · DOTATION', 8, 13);
  ctx.font = `10px ${mono}`; ctx.textAlign = 'right'; ctx.fillText(`${Math.round(model.range)} u`, 168, 13);
  const cx = 43, cy = 63, radius = 32, start = -Math.PI * 5 / 6, end = -Math.PI / 6;
  ctx.strokeStyle = '#486d35';
  for (const fraction of [.33, .66, 1]) {
    ctx.beginPath(); ctx.arc(cx, cy, radius * fraction, start, end); ctx.stroke();
  }
  ctx.strokeStyle = '#9bcf64'; ctx.beginPath(); ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(start) * radius, cy + Math.sin(start) * radius);
  ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(end) * radius, cy + Math.sin(end) * radius); ctx.stroke();
  if (!reduced) {
    ctx.strokeStyle = '#b5f18b'; ctx.beginPath();
    ctx.arc(cx, cy, radius * Math.max(.015, model.sweep), start, end); ctx.stroke();
  }
  ctx.textAlign = 'center'; ctx.font = `10px ${mono}`; ctx.fillStyle = '#94bd6c';
  ctx.fillText(model.heading < 0 ? 'AVANT ←' : 'AVANT →', cx, 28);
  ctx.fillStyle = '#e4fcb5'; ctx.beginPath(); ctx.arc(cx, cy, 1.6, 0, Math.PI * 2); ctx.fill();
  const sectors = new Set();
  for (const contact of model.contacts) {
    if (contact.sector !== 'front') { sectors.add(contact.sector); continue; }
    const ratio = clamp(contact.distance / Math.max(1, model.range), 0, 1);
    ctx.globalAlpha = .22 + .78 * contact.alpha; ctx.fillStyle = '#d9ffb3'; ctx.beginPath();
    ctx.arc(cx + Math.sin(contact.bearing) * radius * ratio, cy - Math.cos(contact.bearing) * radius * ratio,
      contact.currentMotion ? 2.4 : 1.7, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  }
  const sectorLabels = { front: 'DEVANT', above: 'HAUT', rear: 'ARRIÈRE', below: 'BAS', depth: 'AUTRE PLAN' };
  const nearest = model.nearestDistance === null ? '—' : `~${Math.round(model.nearestDistance / 5) * 5}`;
  ctx.textAlign = 'left'; ctx.fillStyle = '#d9ffb3'; ctx.font = `700 14px ${mono}`;
  ctx.fillText(`${nearest} u`, 88, 36);
  ctx.font = `11px ${mono}`; ctx.fillText(sectorLabels[model.contacts[0]?.sector] || 'BALAYAGE', 88, 50);
  // All occupied off-cone sectors stay visible even when the nearest echo is
  // in front. The symbols are spatial indicators, with no inferred IFF.
  for (const [index, [sector, symbol]] of [['above', '↑'], ['rear', '←'], ['below', '↓'], ['depth', '↕']].entries()) {
    ctx.fillStyle = sectors.has(sector) ? '#dcffbd' : '#526b43'; ctx.font = `700 11px ${mono}`;
    ctx.fillText(symbol, 89 + index * 19, 63);
  }
  ctx.textAlign = 'left'; ctx.fillStyle = '#c5df9c'; ctx.font = `10px ${mono}`;
  ctx.fillText(model.currentMovement ? 'MOUVEMENT' : model.contacts.length ? 'ÉCHO' : 'BALAYAGE', 8, 77);
  ctx.textAlign = 'right'; ctx.fillStyle = '#a5bc88'; ctx.fillText('PORTÉE RELATIVE', 168, 77);
}

export function drawMotionTrackerDisplayV160(ctx, model, options = {}) {
  if (!model?.active || !ctx) return false;
  const layout = motionTrackerLayoutV160(options), reduced = Boolean(options.reducedMotion);
  ctx.save();
  try {
    ctx.translate(layout.x, layout.y); ctx.scale(layout.scale, layout.scale);
    if (layout.compact) { drawCompactTracker(ctx, model, reduced); return true; }
    ctx.fillStyle = '#302d21'; ctx.fillRect(0, 0, 240, 220);
    ctx.strokeStyle = '#8f9870'; ctx.lineWidth = 1; ctx.strokeRect(.5, .5, 239, 219);
    ctx.fillStyle = '#101c10'; ctx.fillRect(9, 25, 222, 169);
    ctx.fillStyle = '#d5ddad'; ctx.font = `700 11px ${mono}`; ctx.textAlign = 'left';
    ctx.fillText('M314 · DOTATION', 12, 17);
    ctx.fillStyle = '#b5ce85'; ctx.font = `10px ${mono}`;
    ctx.textAlign = 'right'; ctx.fillText(`${Math.round(model.range)} u`, 227, 17);
    const cx = 120, cy = 158, radius = 104, start = -Math.PI * 5 / 6, end = -Math.PI / 6;
    ctx.lineWidth = 1; ctx.strokeStyle = '#486d35';
    for (const fraction of [.33, .66, 1]) {
      ctx.beginPath(); ctx.arc(cx, cy, radius * fraction, start, end); ctx.stroke();
    }
    ctx.strokeStyle = '#9bcf64'; ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(start) * radius, cy + Math.sin(start) * radius);
    ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(end) * radius, cy + Math.sin(end) * radius); ctx.stroke();
    for (const angle of [-Math.PI * 2 / 3, -Math.PI / 2, -Math.PI / 3]) {
      ctx.strokeStyle = '#41672f'; ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius); ctx.stroke();
    }
    if (!reduced) {
      ctx.strokeStyle = '#b5f18b'; ctx.lineWidth = 1.6; ctx.beginPath();
      ctx.arc(cx, cy, radius * Math.max(.015, model.sweep), start, end); ctx.stroke();
    }
    ctx.fillStyle = '#94bd6c'; ctx.font = `9px ${mono}`; ctx.textAlign = 'center';
    ctx.fillText(model.heading < 0 ? 'AVANT ←' : 'AVANT →', cx, 40);
    ctx.fillStyle = '#e4fcb5'; ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fill();
    const sectors = new Set();
    for (const contact of model.contacts) {
      if (contact.sector !== 'front') { sectors.add(contact.sector); continue; }
      const ratio = clamp(contact.distance / Math.max(1, model.range), 0, 1);
      const x = cx + Math.sin(contact.bearing) * radius * ratio;
      const y = cy - Math.cos(contact.bearing) * radius * ratio;
      ctx.globalAlpha = .22 + .78 * contact.alpha;
      ctx.fillStyle = '#d9ffb3'; ctx.beginPath(); ctx.arc(x, y, contact.currentMotion ? 3.2 : 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    // Only coarse sectors outside the forward fan. Neither a species nor a
    // friendly/hostile colour is inferred from the simulation's actor class.
    const labels = [['above', 'HAUT', 46], ['rear', 'ARRIÈRE', 120], ['below', 'BAS', 194]];
    for (const [sector, label, x] of labels) {
      ctx.strokeStyle = sectors.has(sector) ? '#d9ffb3' : '#38532c'; ctx.lineWidth = sectors.has(sector) ? 3 : 1;
      ctx.beginPath(); ctx.arc(x, 151, 22, Math.PI * .12, Math.PI * .88); ctx.stroke();
      ctx.fillStyle = sectors.has(sector) ? '#dcffbd' : '#6c8b54'; ctx.font = `8px ${mono}`; ctx.fillText(label, x, 184);
    }
    ctx.font = `700 13px ${mono}`; ctx.textAlign = 'left'; ctx.fillStyle = '#d9ffb3';
    const nearest = model.nearestDistance === null ? '—' : `~${Math.round(model.nearestDistance / 5) * 5}`;
    ctx.fillText(`${nearest} u`, 17, 210);
    ctx.textAlign = 'right'; ctx.font = `9px ${mono}`;
    ctx.fillText(sectors.has('depth') ? 'HORS PLAN' : model.currentMovement ? 'MOUVEMENT' : model.contacts.length ? 'ÉCHO' : 'BALAYAGE', 226, 207);
    ctx.fillStyle = '#91aa74'; ctx.font = `8px ${mono}`; ctx.fillText('PORTÉE RELATIVE', 226, 218);
    for (const [x, y] of [[4, 4], [233, 4], [4, 213], [233, 213]]) {
      ctx.fillStyle = '#a29e7d'; ctx.fillRect(x, y, 3, 3);
    }
  } finally { ctx.restore(); }
  return true;
}
