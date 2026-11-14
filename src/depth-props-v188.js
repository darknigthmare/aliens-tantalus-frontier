// V188 — floor objects of the depth rooms (hub, quay, QZ-17 holds), drawn in primitives:
// placeholders, no generated image. Shared by hub-depth-runtime-v188.js and mission-depth-v188.js.
/** Crates and a cart drawn in primitives (placeholders, no generated image). */
export function drawDepthPropV188(ctx, prop, box) {
  const { x, y, w, h } = box;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h + 2, w * .55, 6, 0, 0, Math.PI * 2); ctx.fill(); // contact shadow
  if (prop.kind === 'container') { // sealed QZ17 freight container (CIN-31): ribs, yellow seal band, stencil
    ctx.fillStyle = '#3a3226'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(x, y, w, 4);
    ctx.fillStyle = '#2a241b'; for (let rx = x + 8; rx < x + w - 4; rx += 12) ctx.fillRect(rx, y + 6, 3, h - 10);
    ctx.strokeStyle = '#e9d07a'; ctx.lineWidth = 3; ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
    ctx.fillStyle = '#e9d07a'; ctx.fillRect(x + w / 2 - 3, y + 4, 6, h - 8);
    ctx.fillStyle = '#0f0d09'; ctx.fillRect(x + w / 2 - 20, y + h / 2 - 9, 40, 16);
    ctx.fillStyle = '#e9d07a'; ctx.font = '700 11px monospace'; ctx.textAlign = 'center'; ctx.fillText('QZ17', x + w / 2, y + h / 2 + 3); ctx.textAlign = 'left';
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
