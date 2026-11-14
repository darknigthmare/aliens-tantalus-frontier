// V188 — floor objects of the depth rooms (hub, quay, QZ-17 holds), drawn in primitives:
// placeholders, no generated image. Shared by hub-depth-runtime-v188.js and mission-depth-v188.js.
/** Crates, carts, sealed containers and pallets drawn in primitives (placeholders, no generated image). */
export function drawDepthPropV188(ctx, prop, box) {
  const { x, y, w, h } = box;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h + 2, w * .55, 6, 0, 0, Math.PI * 2); ctx.fill(); // contact shadow
  if (prop.kind === 'container') { // sealed QZ17 freight containers (CIN-31), 10-ft ISO side-on; prop.stack of them
    const count = Math.max(1, prop.stack || 1), unit = h / count;
    for (let i = 0; i < count; i++) drawSealedContainerV188(ctx, x, y + h - (i + 1) * unit, w, unit, prop.labels?.[i] || '');
    ctx.restore(); return;
  }
  if (prop.kind === 'pallet') { // a 1.2 m pallet of loose crates, strapped
    ctx.fillStyle = '#5a4630'; ctx.fillRect(x, y + h - 8, w, 8); ctx.fillStyle = '#2a2016'; for (let px = x + 6; px < x + w - 4; px += 14) ctx.fillRect(px, y + h - 8, 6, 8);
    ctx.fillStyle = '#4a4434'; ctx.fillRect(x + 2, y + 10, w * .55, h - 18); ctx.fillStyle = '#3f3a2c'; ctx.fillRect(x + w * .55 + 4, y + 18, w * .45 - 6, h - 26);
    ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(x + 2, y + 10, w * .55, 3);
    ctx.fillStyle = '#d06b2a'; ctx.fillRect(x, y + h * .45, w, 3); // strap
    ctx.fillStyle = '#c9a54a'; ctx.font = '700 8px monospace'; ctx.fillText('QZ17', x + 6, y + 26);
    ctx.restore(); return;
  }
  if (prop.kind === 'drum') { // three fuel drums
    for (let i = 0; i < 3; i++) { const dx = x + i * (w / 3), dw = w / 3 - 4;
      ctx.fillStyle = i % 2 ? '#5a3a2a' : '#4b3326'; ctx.fillRect(dx, y + 6, dw, h - 6);
      ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(dx, y + 6, dw, 3); ctx.fillStyle = '#2a1d16'; ctx.fillRect(dx, y + h * .45, dw, 3);
      ctx.fillStyle = '#d9b44a'; ctx.fillRect(dx + 3, y + h * .6, dw - 6, 6); }
    ctx.restore(); return;
  }
  if (prop.kind === 'cart') {
    ctx.fillStyle = '#2d3536'; ctx.fillRect(x, y + h - 18, w, 10); // bed
    ctx.fillStyle = '#5b6466'; ctx.fillRect(x + 4, y + h - 46, w * .45, 28); ctx.fillStyle = '#c9a54a'; ctx.fillRect(x + 4, y + h - 40, w * .45, 4); // canister
    ctx.fillStyle = '#121617'; for (const wx of [x + 10, x + w - 16]) { ctx.beginPath(); ctx.arc(wx, y + h - 4, 6, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#3a4344'; ctx.fillRect(x + w - 6, y + h - 40, 4, 26); // handle
  } else {
    const rows = h > 70 ? 2 : 1, rowH = h / rows;
    for (let r = 0; r < rows; r++) {
      const ry = y + h - (r + 1) * rowH, inset = r * 6;
      ctx.fillStyle = r ? '#4a4434' : '#3f3a2c'; ctx.fillRect(x + inset, ry, w - inset * 2, rowH - 2);
      ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(x + inset, ry, w - inset * 2, 4); // top edge light
      ctx.strokeStyle = '#1e1b14'; ctx.lineWidth = 2; ctx.strokeRect(x + inset + 3, ry + 3, w - inset * 2 - 6, rowH - 8);
      ctx.beginPath(); ctx.moveTo(x + inset + 3, ry + 3); ctx.lineTo(x + w - inset - 3, ry + rowH - 5); ctx.stroke(); // brace
      ctx.fillStyle = '#c9a54a'; ctx.font = '700 9px monospace'; ctx.fillText(r ? 'QZ' : `CARGO ${prop.id.endsWith('west') ? '07' : '12'}`, x + inset + 8, ry + rowH / 2 + 3);
    }
  }
  ctx.restore();
}

/** One 10-ft ISO container seen from its long side: corrugations, top and bottom rails, corner castings, seal. */
function drawSealedContainerV188(ctx, x, y, w, h, label) {
  ctx.fillStyle = '#3a3226'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#2a241b'; for (let rx = x + 10; rx < x + w - 8; rx += 9) ctx.fillRect(rx, y + 9, 3, h - 18); // corrugations
  ctx.fillStyle = '#4a4031'; ctx.fillRect(x, y, w, 8); ctx.fillRect(x, y + h - 9, w, 9); // top and bottom rails
  ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = '#1b1712'; for (const [cx, cy] of [[x, y], [x + w - 10, y], [x, y + h - 10], [x + w - 10, y + h - 10]]) ctx.fillRect(cx, cy, 10, 10); // corner castings
  ctx.strokeStyle = '#e9d07a'; ctx.lineWidth = 3; ctx.strokeRect(x + 5, y + 5, w - 10, h - 10); // CIN-31 seal band
  ctx.fillStyle = '#e9d07a'; ctx.fillRect(x + w - 30, y + 5, 6, h - 10); // seal strap at the door end
  ctx.fillStyle = '#b8332b'; ctx.fillRect(x + w - 33, y + h / 2 - 6, 12, 12); // seal tag
  ctx.fillStyle = '#0f0d09'; ctx.fillRect(x + w / 2 - 44, y + h / 2 - 16, 72, 28);
  ctx.fillStyle = '#e9d07a'; ctx.font = '700 14px monospace'; ctx.textAlign = 'center'; ctx.fillText('QZ17', x + w / 2 - 8, y + h / 2 + 1);
  ctx.font = '700 9px monospace'; if (label) ctx.fillText(label.replace(/^QZ17/, ''), x + w / 2 - 8, y + h / 2 + 10);
  ctx.textAlign = 'left';
}

/** The hold floor: tie-down rails with lashing rings, and the empty bay of the missing container. */
export function drawDepthHoldFloorV188(ctx, section) {
  ctx.save();
  ctx.fillStyle = 'rgba(160,168,170,.22)';
  for (const lane of [36, 76]) {
    ctx.fillRect(section.x0 + 6, section.floorY + lane, section.x1 - section.x0 - 12, 2);
    for (let x = section.x0 + 20; x < section.x1 - 10; x += 48) ctx.fillRect(x - 3, section.floorY + lane - 2, 6, 6);
  }
  const bay = section.bay;
  if (bay) {
    const top = section.floorY - bay.z1, bottom = section.floorY - Math.max(section.zMin, bay.z0);
    ctx.strokeStyle = 'rgba(233,208,122,.55)'; ctx.lineWidth = 2; ctx.setLineDash?.([8, 6]); ctx.strokeRect(bay.x, top, bay.w, bottom - top); ctx.setLineDash?.([]);
    ctx.strokeStyle = '#d06b2a'; ctx.lineWidth = 3; ctx.beginPath(); // lashing straps cut, still on their rings
    for (const [sx, dx] of [[bay.x + 4, 18], [bay.x + bay.w - 4, -20]]) { ctx.moveTo(sx, top + 2); ctx.lineTo(sx + dx, top + 14); ctx.moveTo(sx, bottom - 2); ctx.lineTo(sx + dx * .8, bottom - 12); }
    ctx.stroke();
    ctx.fillStyle = 'rgba(233,208,122,.6)'; ctx.font = '700 12px monospace'; ctx.textAlign = 'center'; ctx.fillText(bay.label, bay.x + bay.w / 2, (top + bottom) / 2 + 4); ctx.textAlign = 'left';
  }
  ctx.restore();
}
