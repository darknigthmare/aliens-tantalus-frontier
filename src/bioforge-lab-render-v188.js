// V188 — Bioforge containment-lab presentation (spec 013). Canvas primitives
// stand behind the named slots of bioforge-lab-layout-v188.js until art exists;
// the shipped V80 PNGs (backdrop, process modules, printer, bulkhead and purge
// atlases) are still drawn by the V80 runtime. Liquids, bubbles, mist, frost and
// embers go through the V188 VFX pool. Presentation only: nothing here moves an
// actor, changes a collider or writes a save. Strings are French source text,
// translated on the canvas by the V185 catalogue.
import { createVfxPoolV188, spawnVfxParticleV188, stepVfxPoolV188, drawVfxParticlesV188 } from './vfx-v188.js';
import { signalColorV188 } from './colorblind-palette-v188.js';
import {
  BIOFORGE_LAB_ZONES_V188, BIOFORGE_LAB_PROPS_V188, BIOFORGE_OBSERVATION_GALLERY_V188,
  BIOFORGE_EXIT_DECON_SECONDS_V188, getBioforgeLabZoneV188
} from './bioforge-lab-layout-v188.js';

export const BIOFORGE_LAB_VFX_CAP_V188 = 160;
export const BIOFORGE_LAB_FOREGROUND_ALPHA_V188 = 0.18;
const VIEW_W = 1280;
const STEEL = '#1b2422', STEEL_DARK = '#0d1312', STEEL_EDGE = '#3c4a46', PLATE = '#26312e';
const PARTITION_W = 150;

export function createBioforgeLabVfxV188() { return createVfxPoolV188({ cap: BIOFORGE_LAB_VFX_CAP_V188, decalCap: 0 }); }

const visible = (x, w, cameraX, margin = 40) => x + w >= cameraX - margin && x <= cameraX + VIEW_W + margin;

function rect(ctx, fill, x, y, w, h) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
function frame(ctx, stroke, x, y, w, h, width = 2) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.strokeRect(x + .5, y + .5, w - 1, h - 1); }
function hazard(ctx, x, y, w, h) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  rect(ctx, '#2b2414', x, y, w, h); ctx.fillStyle = '#b08a2e';
  for (let i = -h; i < w; i += 16) { ctx.beginPath(); ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + 8, y + h); ctx.lineTo(x + i + 8 + h, y); ctx.lineTo(x + i + h, y); ctx.fill(); }
  ctx.restore();
}
function label(ctx, text, x, y, { size = 11, color = '#cfe2d4', align = 'left', bold = false } = {}) {
  ctx.font = `${bold ? 'bold ' : ''}${size}px monospace`; ctx.textAlign = align; ctx.fillStyle = color; ctx.fillText(text, x, y); ctx.textAlign = 'left';
}

/** Structural ceiling, floor slab and the enclosed shells of human-scale rooms. */
function drawShells(ctx, view) {
  const { level, cameraX } = view;
  const { ceilingY, floorY, width } = level.world;
  const left = Math.max(0, cameraX - 40), right = Math.min(width, cameraX + VIEW_W + 40);
  rect(ctx, STEEL_DARK, left, 0, right - left, ceilingY);
  rect(ctx, STEEL_EDGE, left, ceilingY - 4, right - left, 4);
  rect(ctx, '#121917', left, floorY, right - left, 720 - floorY);
  rect(ctx, '#4a5753', left, floorY, right - left, 3);
  ctx.fillStyle = '#1f2826';
  for (let x = Math.floor(left / 48) * 48; x < right; x += 48) ctx.fillRect(x, floorY + 10, 30, 4);
  for (const zone of BIOFORGE_LAB_ZONES_V188) {
    if (!visible(zone.x, zone.w, cameraX)) continue;
    if (zone.ceilingY != null) {
      // Solid mass above the visual ceiling, then a lit back wall at human scale.
      rect(ctx, '#111816', zone.x, ceilingY, zone.w, zone.ceilingY - ceilingY);
      ctx.fillStyle = '#1a2321';
      for (let y = ceilingY + 26; y < zone.ceilingY - 20; y += 44) ctx.fillRect(zone.x, y, zone.w, 6);
      rect(ctx, STEEL_EDGE, zone.x, zone.ceilingY - 10, zone.w, 10);
      // Back wall; an observation window is left clear so the V80 process modules show through.
      const pane = BIOFORGE_LAB_PROPS_V188.find(prop => prop.zoneId === zone.id && prop.slot === 'bioforge-lab-observation-window');
      ctx.save(); ctx.globalAlpha = .9; ctx.fillStyle = PLATE; ctx.beginPath();
      ctx.rect(zone.x, zone.ceilingY, zone.w, floorY - zone.ceilingY);
      if (pane) ctx.rect(pane.x, pane.y, pane.w, pane.h);
      ctx.fill('evenodd'); ctx.restore();
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1;
      for (let x = zone.x + 40; x < zone.x + zone.w; x += 58) { ctx.beginPath(); ctx.moveTo(x + .5, zone.ceilingY); ctx.lineTo(x + .5, floorY); ctx.stroke(); }
      rect(ctx, 'rgba(0,0,0,.28)', zone.x, floorY - 46, zone.w, 46);
    }
  }
}

function drawZoneLight(ctx, zone, view) {
  const { level } = view;
  const top = zone.ceilingY ?? level.world.ceilingY + 40;
  const cx = zone.x + zone.w / 2;
  let color = zone.light;
  if (zone.id === 'containment-cell' && ['combat', 'printing', 'sealing'].includes(view.phase)) color = '#d0503c';
  if (zone.id === 'exit-decon' && view.exitDecon?.active) color = '#7fe0e8';
  const gradient = ctx.createLinearGradient ? ctx.createLinearGradient(0, top, 0, level.world.floorY) : null;
  ctx.save();
  ctx.globalAlpha = view.reducedMotion ? .14 : .18;
  if (gradient) { gradient.addColorStop(0, color); gradient.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gradient; }
  else ctx.fillStyle = color;
  const spread = Math.min(zone.w / 2 - 6, 170);
  ctx.beginPath(); ctx.moveTo(cx - 24, top); ctx.lineTo(cx + 24, top); ctx.lineTo(cx + spread, level.world.floorY); ctx.lineTo(cx - spread, level.world.floorY); ctx.closePath(); ctx.fill();
  ctx.restore();
  rect(ctx, color, cx - 26, top, 52, 4);
}

// Hanging zone sign, centred on the free span between the bulkhead partitions and
// drawn after them so a partition never hides it.
function drawSign(ctx, zone, view) {
  const doorAt = (x) => view.doors.some(door => Math.abs(door.x + door.w / 2 - x) < 1);
  const left = zone.x + (doorAt(zone.x) ? PARTITION_W / 2 : 0), right = zone.x + zone.w - (doorAt(zone.x + zone.w) ? PARTITION_W / 2 : 0);
  const w = Math.max(150, Math.min(220, right - left - 8));
  const x = Math.max(zone.x + 4, Math.min(zone.x + zone.w - w - 4, (left + right) / 2 - w / 2));
  const y = zone.ceilingY != null ? zone.ceilingY - 46 : zone.id === 'containment-cell' ? BIOFORGE_OBSERVATION_GALLERY_V188.y + BIOFORGE_OBSERVATION_GALLERY_V188.h + 16 : view.level.world.ceilingY + 16;
  rect(ctx, 'rgba(6,12,10,.9)', x, y, w, 34); frame(ctx, zone.light, x, y, w, 34, 1);
  label(ctx, zone.label, x + w / 2, y + 15, { size: 11, color: '#e4efe6', bold: true, align: 'center' });
  label(ctx, zone.detail, x + w / 2, y + 28, { size: 9, color: zone.light, align: 'center' });
}

function drawPartitions(ctx, view) {
  const { level, cameraX } = view;
  const { ceilingY, floorY } = level.world;
  for (const door of view.doors) {
    const cx = door.x + door.w / 2, x = cx - PARTITION_W / 2;
    if (!visible(x, PARTITION_W, cameraX)) continue;
    // The 40×536 collider now reads as a full-height bulkhead: wall mass above
    // the door leaf (V80 bulkhead atlas, 180 px) down to the lintel.
    const lintel = floorY - 168;
    rect(ctx, STEEL, x, ceilingY, PARTITION_W, lintel - ceilingY);
    rect(ctx, STEEL_EDGE, x, ceilingY, 6, lintel - ceilingY); rect(ctx, STEEL_EDGE, x + PARTITION_W - 6, ceilingY, 6, lintel - ceilingY);
    ctx.fillStyle = '#28332f';
    for (let y = ceilingY + 30; y < lintel - 20; y += 60) ctx.fillRect(x + 14, y, PARTITION_W - 28, 22);
    hazard(ctx, x, lintel - 14, PARTITION_W, 14);
    const state = door.open ? 'bioforge-door-open' : 'bioforge-door-locked';
    rect(ctx, signalColorV188(state), cx - 18, lintel - 34, 36, 8);
  }
}

function drawCatwalks(ctx, view) {
  const { level, cameraX } = view;
  for (const platform of view.platforms) {
    if (platform.floor || !visible(platform.x, platform.w, cameraX)) continue;
    rect(ctx, '#2c3532', platform.x, platform.y, platform.w, platform.h);
    ctx.fillStyle = '#151c1a';
    for (let x = platform.x + 4; x < platform.x + platform.w - 4; x += 10) ctx.fillRect(x, platform.y + 5, 5, platform.h - 9);
    rect(ctx, '#56645f', platform.x, platform.y, platform.w, 3);
    ctx.strokeStyle = '#4b5955'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(platform.x, platform.y - 34); ctx.lineTo(platform.x + platform.w, platform.y - 34);
    for (let x = platform.x; x <= platform.x + platform.w; x += 48) { ctx.moveTo(x, platform.y); ctx.lineTo(x, platform.y - 34); }
    ctx.stroke();
    rect(ctx, 'rgba(6,12,10,.85)', platform.x + platform.w / 2 - 74, platform.y + platform.h + 4, 148, 15);
    label(ctx, 'PASSERELLE · SPÉCIMENS', platform.x + platform.w / 2, platform.y + platform.h + 15, { size: 9, color: '#c9b27a', align: 'center' });
  }
  for (const ladder of view.ladders) {
    if (!visible(ladder.x, ladder.w, cameraX)) continue;
    ctx.strokeStyle = '#59675f'; ctx.lineWidth = 3; ctx.beginPath();
    ctx.moveTo(ladder.x + 8, ladder.top); ctx.lineTo(ladder.x + 8, ladder.bottom);
    ctx.moveTo(ladder.x + ladder.w - 8, ladder.top); ctx.lineTo(ladder.x + ladder.w - 8, ladder.bottom);
    for (let y = ladder.top + 14; y < ladder.bottom; y += 18) { ctx.moveTo(ladder.x + 8, y); ctx.lineTo(ladder.x + ladder.w - 8, y); }
    ctx.stroke();
  }
}

function drawGallery(ctx, view) {
  const g = BIOFORGE_OBSERVATION_GALLERY_V188;
  if (!visible(g.x, g.w, view.cameraX)) return;
  rect(ctx, '#0a1110', g.x - 10, g.y - 10, g.w + 20, g.h + 20);
  rect(ctx, '#132320', g.x, g.y, g.w, g.h);
  // Observers: anonymous placeholders (Inez / BISHOP-9 presence is to define).
  ctx.fillStyle = '#0b1514';
  for (const ox of [g.x + 180, g.x + 238, g.x + 720]) {
    ctx.beginPath(); ctx.arc(ox, g.y + g.h - 74, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(ox - 11, g.y + g.h - 64, 22, 64);
  }
  rect(ctx, '#2a3633', g.x, g.y + g.h - 26, g.w, 26);
  ctx.save(); ctx.globalAlpha = .22; rect(ctx, '#8fc9c0', g.x, g.y, g.w, g.h);
  ctx.globalAlpha = .12; ctx.fillStyle = '#e6fffa';
  for (let x = g.x + 30; x < g.x + g.w; x += 110) { ctx.beginPath(); ctx.moveTo(x, g.y); ctx.lineTo(x + 36, g.y); ctx.lineTo(x - 20, g.y + g.h); ctx.lineTo(x - 56, g.y + g.h); ctx.fill(); }
  ctx.restore();
  ctx.fillStyle = STEEL_EDGE;
  for (let x = g.x; x <= g.x + g.w; x += 110) ctx.fillRect(x - 4, g.y, 8, g.h);
  frame(ctx, '#56645f', g.x, g.y, g.w, g.h, 4);
}

function specimenSilhouette(ctx, cx, bottom, scale) {
  ctx.fillStyle = 'rgba(14,30,20,.82)';
  ctx.beginPath(); ctx.ellipse(cx + 6 * scale, bottom - 92 * scale, 12 * scale, 7 * scale, -.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx, bottom - 64 * scale, 9 * scale, 22 * scale, .25, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(14,30,20,.82)'; ctx.lineWidth = 3 * scale; ctx.beginPath();
  ctx.moveTo(cx - 2 * scale, bottom - 44 * scale); ctx.quadraticCurveTo(cx - 18 * scale, bottom - 20 * scale, cx + 4 * scale, bottom - 10 * scale);
  ctx.moveTo(cx + 4 * scale, bottom - 46 * scale); ctx.lineTo(cx + 12 * scale, bottom - 22 * scale); ctx.stroke();
}

function drawTank(ctx, prop, tank, view) {
  const { x, y, w, h } = prop;
  const cap = 16, glassTop = y + cap, glassBottom = y + h - cap;
  rect(ctx, STEEL, x - 4, y, w + 8, cap); rect(ctx, STEEL, x - 4, y + h - cap, w + 8, cap);
  rect(ctx, '#0b1614', x, glassTop, w, glassBottom - glassTop);
  const liquid = tank.state === 'stasis' ? '#4fae6a' : tank.state === 'configured' ? '#7fb79a' : null;
  if (liquid) {
    const level = glassTop + 10;
    ctx.save(); ctx.globalAlpha = .5; rect(ctx, liquid, x, level, w, glassBottom - level); ctx.restore();
    specimenSilhouette(ctx, x + w / 2, glassBottom - 4, .95);
  } else if (tank.state === 'drained') {
    ctx.save(); ctx.globalAlpha = .4; rect(ctx, '#4fae6a', x, glassBottom - 8, w, 8); ctx.restore();
  }
  ctx.save(); ctx.globalAlpha = .16; rect(ctx, '#e6fff2', x + 6, glassTop, 6, glassBottom - glassTop); ctx.restore();
  frame(ctx, '#6f8f84', x, glassTop, w, glassBottom - glassTop, 2);
  rect(ctx, liquid ? '#8fe0a6' : '#4b5955', x + w / 2 - 6, y + 5, 12, 5);
  // Plate: profile and count, or the empty state.
  rect(ctx, 'rgba(6,12,10,.9)', x - 6, y - 30, w + 12, 26); frame(ctx, '#4b5955', x - 6, y - 30, w + 12, 26, 1);
  const name = tank.name ? String(tank.name).toUpperCase().slice(0, 10) : 'CUVE VIDE';
  label(ctx, name, x + w / 2, y - 19, { size: 8, color: '#dbe8dc', align: 'center' });
  const status = tank.state === 'stasis' ? `EN STASE ×${tank.waiting}` : tank.state === 'configured' ? `PRÉVU ×${tank.waiting}`
    : tank.state === 'drained' ? 'IMPRIMÉE' : '—';
  label(ctx, status, x + w / 2, y - 8, { size: 8, color: liquid ? '#8fe0a6' : '#9aa7a2', align: 'center' });
}

function drawProp(ctx, prop, view) {
  const { x, y, w, h } = prop, t = view.time;
  switch (prop.slot) {
    case 'bioforge-lab-cryo-drawers': {
      rect(ctx, '#1d2a30', x, y, w, h); frame(ctx, '#5f7c88', x, y, w, h, 2);
      for (let row = 0; row < 5; row++) for (let col = 0; col < 3; col++) {
        const dx = x + 8 + col * 44, dy = y + 10 + row * 40;
        rect(ctx, '#2b3d45', dx, dy, 38, 32); frame(ctx, '#7c9aa6', dx, dy, 38, 32, 1);
        rect(ctx, '#c9e6f2', dx + 14, dy + 13, 10, 3);
        rect(ctx, (row + col) % 3 ? '#4fae6a' : '#d8a24a', dx + 30, dy + 4, 4, 4);
      }
      ctx.save(); ctx.globalAlpha = .18; rect(ctx, '#e8f8ff', x, y, w, 18); ctx.restore();
      break;
    }
    case 'bioforge-lab-monitor-wall':
      for (let i = 0; i < 3; i++) {
        const mx = x + i * 38;
        rect(ctx, '#0a1413', mx, y, 34, 30); frame(ctx, '#3f5650', mx, y, 34, 30, 1);
        ctx.fillStyle = '#6fd49a';
        for (let line = 0; line < 4; line++) ctx.fillRect(mx + 4, y + 5 + line * 6, 8 + ((i * 7 + line * 5 + Math.floor(t * 2)) % 20), 2);
      }
      rect(ctx, '#0a1413', x + 10, y + 38, 92, 32); frame(ctx, '#3f5650', x + 10, y + 38, 92, 32, 1);
      label(ctx, String(view.phase || 'CONFIGURATION').toUpperCase().slice(0, 12), x + 56, y + 58, { size: 9, color: '#8fe0a6', align: 'center' });
      break;
    case 'bioforge-lab-observation-window':
      // A clear bay onto the lab: the V80 process modules show through the glass.
      rect(ctx, STEEL, x - 8, y - 8, w + 16, 8); rect(ctx, STEEL, x - 8, y + h, w + 16, 10);
      rect(ctx, STEEL, x - 8, y, 8, h); rect(ctx, STEEL, x + w, y, 8, h);
      ctx.save(); ctx.globalAlpha = .16; rect(ctx, '#9fe6d0', x, y, w, h); ctx.restore();
      rect(ctx, STEEL_EDGE, x + w / 2 - 2, y, 4, h);
      break;
    case 'bioforge-lab-control-console':
    case 'bioforge-lab-purge-console':
    case 'bioforge-lab-return-console': {
      const accent = prop.slot.endsWith('purge-console') ? '#ff9a4a' : prop.slot.endsWith('return-console') ? '#7fd8d0' : '#8fe0a6';
      rect(ctx, '#1e2826', x, y + 22, w, h - 22); frame(ctx, '#55655f', x, y + 22, w, h - 22, 2);
      rect(ctx, '#0a1413', x + 6, y, w - 12, 26); frame(ctx, accent, x + 6, y, w - 12, 26, 1);
      ctx.fillStyle = accent; for (let i = 0; i < 3; i++) ctx.fillRect(x + 12, y + 6 + i * 6, (w - 30) * (.4 + .6 * ((i + Math.floor(t * 3)) % 3) / 2), 2);
      rect(ctx, accent, x + w - 14, y + 30, 6, 6);
      break;
    }
    case 'bioforge-lab-admission-board': {
      rect(ctx, '#0a1413', x, y, w, h); frame(ctx, '#e0b060', x, y, w, h, 2);
      label(ctx, 'FILE D’ADMISSION', x + 8, y + 15, { size: 10, color: '#e0b060', bold: true });
      const rows = Array.isArray(view.board) ? view.board : [];
      if (!rows.length) label(ctx, 'AUCUNE LIGNE', x + 8, y + 34, { size: 9, color: '#9aa7a2' });
      rows.slice(0, 4).forEach((row, index) => {
        const ry = y + 32 + index * 15;
        label(ctx, String(row.name || '—').toUpperCase().slice(0, 13), x + 8, ry, { size: 9, color: '#dbe8dc' });
        label(ctx, row.state === 'configured' ? `×${row.waiting}` : `${row.printed}/${row.printed + row.waiting}`, x + w - 8, ry, { size: 9, color: row.waiting ? '#8fe0a6' : '#9aa7a2', align: 'right' });
      });
      break;
    }
    case 'bioforge-lab-pressure-gauge': {
      rect(ctx, '#1e2826', x, y, w, h); frame(ctx, '#7a6a3a', x, y, w, h, 2);
      ctx.strokeStyle = '#e0b060'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + w / 2, y + 34, 20, Math.PI, 0); ctx.stroke();
      const angle = Math.PI + (view.stage >= 1 ? .8 + .2 * Math.sin(t * 3) : .2) * Math.PI;
      ctx.beginPath(); ctx.moveTo(x + w / 2, y + 34); ctx.lineTo(x + w / 2 + Math.cos(angle) * 18, y + 34 + Math.sin(angle) * 18); ctx.stroke();
      rect(ctx, view.stage >= 1 && Math.floor(t * 2) % 2 ? '#e0b060' : '#4a3d1c', x + 10, y + h - 18, 12, 8);
      rect(ctx, '#4a3d1c', x + w - 22, y + h - 18, 12, 8);
      label(ctx, 'kPa', x + w / 2, y + 56, { size: 9, color: '#e0b060', align: 'center' });
      break;
    }
    case 'bioforge-lab-decon-nozzles':
      rect(ctx, STEEL_EDGE, x, y, w, 8);
      for (let nx = x + 10; nx < x + w; nx += 30) { rect(ctx, '#7c9aa6', nx, y + 8, 10, 10); rect(ctx, '#bfe8ff', nx + 3, y + 18, 4, 3); }
      rect(ctx, '#0c1514', x + 10, view.level.world.floorY - 6, w - 20, 6);
      break;
    case 'bioforge-lab-purge-vents':
      for (let vx = x; vx < x + w; vx += 220) { rect(ctx, '#1e2826', vx, y, 90, h); ctx.fillStyle = '#0a0f0e'; for (let i = 0; i < 6; i++) ctx.fillRect(vx + 6 + i * 14, y + 6, 8, h - 12); }
      break;
    case 'bioforge-lab-incinerator': {
      rect(ctx, '#241a14', x, y, w, h); frame(ctx, '#8a5a3a', x, y, w, h, 3);
      const glow = view.egress ? .55 + .25 * Math.sin(t * 4) : .2;
      ctx.save(); ctx.globalAlpha = glow; ctx.fillStyle = '#ff7a2a'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 26, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.strokeStyle = '#5a3a26'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 30, 0, Math.PI * 2); ctx.stroke();
      label(ctx, 'INCINÉRATEUR', x + w / 2, y - 6, { size: 9, color: '#ffb27a', align: 'center' });
      break;
    }
    case 'bioforge-lab-dissection-table':
      rect(ctx, '#7f8c88', x, y, w, 8); rect(ctx, '#3c4a46', x + 8, y + 8, 6, h - 8); rect(ctx, '#3c4a46', x + w - 14, y + 8, 6, h - 8);
      rect(ctx, '#2b3633', x + 4, y + h - 18, w - 8, 6);
      ctx.fillStyle = '#c9d4c8'; ctx.beginPath(); ctx.ellipse(x + w / 2, y - 4, 26, 5, 0, 0, Math.PI * 2); ctx.fill();
      break;
    case 'bioforge-lab-scanner-arm':
      rect(ctx, '#3c4a46', x + w / 2 - 4, y, 8, h - 34); rect(ctx, '#55655f', x, y + h - 34, w, 22);
      ctx.save(); ctx.globalAlpha = .18 + .1 * Math.sin(t * 5); ctx.fillStyle = '#9fe6d0';
      ctx.beginPath(); ctx.moveTo(x + 4, y + h - 12); ctx.lineTo(x + w - 4, y + h - 12); ctx.lineTo(x + w + 20, y + h + 26); ctx.lineTo(x - 20, y + h + 26); ctx.fill(); ctx.restore();
      break;
    case 'bioforge-lab-exit-shower': {
      frame(ctx, '#4f6f6c', x, y, w, h, 3); rect(ctx, STEEL_EDGE, x, y, w, 10);
      for (let nx = x + 12; nx < x + w - 6; nx += 24) rect(ctx, '#bfe8ff', nx, y + 10, 8, 6);
      rect(ctx, '#0c1514', x + 6, view.level.world.floorY - 6, w - 12, 6);
      const decon = view.exitDecon;
      if (decon && (decon.active || decon.complete)) {
        const ratio = decon.complete ? 1 : decon.clock / BIOFORGE_EXIT_DECON_SECONDS_V188;
        rect(ctx, 'rgba(6,12,10,.9)', x + 8, y + 20, w - 16, 12);
        rect(ctx, decon.complete ? '#8fe0a6' : '#7fd8d0', x + 10, y + 22, (w - 20) * ratio, 8);
      }
      break;
    }
    default: break;
  }
}

/** World-space back layer: drawn after the V80 process modules, before actors. */
export function drawBioforgeLabBackV188(ctx, view) {
  if (!ctx || !view?.level) return 0;
  ctx.save();
  drawShells(ctx, view);
  if (visible(BIOFORGE_OBSERVATION_GALLERY_V188.x, BIOFORGE_OBSERVATION_GALLERY_V188.w, view.cameraX)) drawGallery(ctx, view);
  let drawn = 0;
  for (const zone of BIOFORGE_LAB_ZONES_V188) if (visible(zone.x, zone.w, view.cameraX)) drawZoneLight(ctx, zone, view);
  for (const prop of BIOFORGE_LAB_PROPS_V188) {
    if (!visible(prop.x, prop.w, view.cameraX)) continue;
    if (prop.slot === 'bioforge-lab-stasis-tank') drawTank(ctx, prop, view.tanks?.[prop.tankIndex] || { state: 'empty' }, view);
    else drawProp(ctx, prop, view);
    drawn++;
  }
  drawCatwalks(ctx, view);
  ctx.restore();
  return drawn;
}

/** Partition walls above the V80 bulkhead leaves (drawn after the leaves), then zone signs. */
export function drawBioforgeLabPartitionsV188(ctx, view) {
  if (!ctx || !view?.level) return;
  ctx.save(); drawPartitions(ctx, view);
  for (const zone of BIOFORGE_LAB_ZONES_V188) if (visible(zone.x, zone.w, view.cameraX)) drawSign(ctx, zone, view);
  ctx.restore();
}

/** World-space front layer: VFX particles and the interaction prompt. */
export function drawBioforgeLabFrontV188(ctx, view) {
  if (!ctx || !view?.level) return;
  if (view.vfx) drawVfxParticlesV188(ctx, view.vfx, { x: view.cameraX, y: 0, w: VIEW_W, h: 720 }, { reducedMotion: view.reducedMotion });
  const prompt = view.prompt;
  if (prompt) {
    ctx.save();
    ctx.font = 'bold 12px monospace';
    const width = Math.max(120, (ctx.measureText?.(prompt.prompt)?.width || prompt.prompt.length * 7) + 20);
    const x = Math.max(view.cameraX + 8, Math.min(view.cameraX + VIEW_W - width - 8, prompt.x - width / 2));
    const y = view.level.world.floorY - 178;
    rect(ctx, 'rgba(4,10,8,.9)', x, y, width, 24); frame(ctx, '#d8bd79', x, y, width, 24, 1);
    label(ctx, prompt.prompt, x + width / 2, y + 16, { size: 12, color: '#f2dfa6', align: 'center', bold: true });
    ctx.restore();
  }
}

/** Screen-space caption for a lab report (bottom right: the terminal occupies the left side). */
export function drawBioforgeLabCaptionV188(ctx, caption) {
  if (!ctx || !caption?.text) return;
  ctx.save();
  ctx.font = '13px monospace';
  const width = Math.min(820, (ctx.measureText?.(caption.text)?.width || caption.text.length * 8) + 32);
  const x = VIEW_W - 24 - width;
  rect(ctx, 'rgba(3,10,8,.9)', x, 640, width, 34); frame(ctx, '#7fd8d0', x, 640, width, 34, 1);
  label(ctx, caption.text, x + 16, 662, { size: 13, color: '#dff3ea' });
  ctx.restore();
}

/** Ambient emitters through the VFX pool; called only while the scene runs. */
export function stepBioforgeLabAmbienceV188(pool, dt, view, random = Math.random) {
  if (!pool || !(dt > 0)) return;
  const rate = view.reducedMotion ? .3 : 1;
  const emit = (perSecond) => random() < perSecond * rate * dt;
  for (const prop of BIOFORGE_LAB_PROPS_V188) {
    if (prop.slot !== 'bioforge-lab-stasis-tank') continue;
    const tank = view.tanks?.[prop.tankIndex];
    if (!tank || !['stasis', 'configured'].includes(tank.state) || !visible(prop.x, prop.w, view.cameraX)) continue;
    if (emit(7)) spawnVfxParticleV188(pool, 'bubble', prop.x + 8 + random() * (prop.w - 16), prop.y + prop.h - 22, (random() - .5) * 6, -20 - random() * 20, 1.1, 3 + random() * 3);
  }
  const drawers = BIOFORGE_LAB_PROPS_V188.find(prop => prop.id === 'cryo-drawers');
  if (visible(drawers.x, drawers.w, view.cameraX) && emit(2.2)) spawnVfxParticleV188(pool, 'steam', drawers.x + 10 + random() * (drawers.w - 20), drawers.y + 30 + random() * 160, 6 + random() * 8, 18, 1.4, 14);
  if (view.entryMist > 0) {
    const nozzles = BIOFORGE_LAB_PROPS_V188.find(prop => prop.id === 'decon-nozzles');
    for (let i = 0; i < 2; i++) if (emit(16)) spawnVfxParticleV188(pool, 'steam', nozzles.x + random() * nozzles.w, nozzles.y + 22, (random() - .5) * 18, 90 + random() * 50, 1.6, 22 + random() * 12);
  }
  if (view.exitDecon?.active) {
    const shower = BIOFORGE_LAB_PROPS_V188.find(prop => prop.id === 'exit-shower');
    for (let i = 0; i < 2; i++) if (emit(18)) spawnVfxParticleV188(pool, 'steam', shower.x + 8 + random() * (shower.w - 16), shower.y + 18, (random() - .5) * 14, 100 + random() * 60, 1.6, 22 + random() * 12);
  }
  if (view.egress) {
    const hatch = BIOFORGE_LAB_PROPS_V188.find(prop => prop.id === 'incinerator-hatch');
    if (emit(3)) spawnVfxParticleV188(pool, 'ember', hatch.x + hatch.w / 2 + (random() - .5) * 30, hatch.y + hatch.h / 2, (random() - .5) * 16, -30 - random() * 30, 1.2, 3);
  }
  stepVfxPoolV188(pool, dt);
}

export function bioforgeLabZoneLabelV188(x) { return getBioforgeLabZoneV188(x)?.label || null; }
