// V188 — in-level dropship handover: named visual slots and their Canvas
// PLACEHOLDER fallbacks (no generated image). Each visual of the in-level
// insertion and extraction goes through one slot, so a later bitmap can replace
// a fallback without touching the engine layer
// (src/mission-dropship-handover-v188.js). The out-of-level cinematic keeps its
// own slots in src/insertion-asset-slots-v188.js; these ids never overlap.
//
// Slot shape (shared with insertion-asset-slots-v188.js):
//   { id, purpose, width, height, layer, brief } + a draw fallback here.
// `reuse` names an existing, reviewed project bitmap drawn instead of the
// fallback when it is loaded (the hub hangar UD-4L side elevation, V139).
//
// Scale (project contract): 1 m ≈ 51 px; a marine is 44×92 px.
// Sources for the look, documented appearance only, never "1:1":
// - UD-4L Cheyenne, Aliens (1986): twin tail booms with fins, chin gun turret
//   under the nose, rear loading ramp, skid landing gear, vectored engine
//   downwash; carries the M577 in its belly bay and lowers it on a hoist.
// - M577 APC, Aliens (1986): long angular six-wheeled hull with sloped glacis,
//   a low roof turret with twin guns, rear/side troop doors.
// The proportions below are a project ADAPTATION of that appearance; the exact
// silhouettes remain TO BE DEFINED by the reviewed images another tool produces.
import { HUB_DROPSHIP_HANGAR_ART_V139 } from './hub-dropship-hangar-art-v139.js';

export const LEVEL_DROPSHIP_SCALE_V188 = Object.freeze({
  pxPerMetre: 51, marine: Object.freeze({ w: 44, h: 92 }),
  // About 17 m long → 870 px. The ship is wider than the free space behind an
  // insertion point in most levels and wider than the 1280 px view minus the
  // marines' lane: it is drawn at true scale and allowed to run off-screen or
  // past the level edge rather than being scaled down (sprites are never scaled).
  ud4l: Object.freeze({ lengthM: 17, length: 870, height: 234 }),
  // The project M577 keeps its existing 190×104 mission hitbox; the placeholder
  // is drawn a little longer than the hitbox, like the existing sprite.
  m577: Object.freeze({ w: 236, h: 104 })
});

const freeze = value => Object.freeze(value);
const slot = (id, purpose, width, height, layer, brief, extra = {}) => freeze({ id, purpose, width, height, layer, brief, ...extra });

export const LEVEL_DROPSHIP_SLOTS_V188 = freeze([
  slot('level-ud4l-hull', 'UD-4L Cheyenne hull in the level, landing, holding and lifting', 870, 234, 'world-behind-actors',
    'Strict side elevation, nose on the left of the image, skids at the bottom edge. Twin tail booms with fins, chin gun turret under the nose, engine nacelles, landing skids. Transparent background, same scale as the hub hangar art (17 m ≈ 870 px).',
    { reuse: HUB_DROPSHIP_HANGAR_ART_V139.asset }),
  slot('level-ud4l-ramp', 'Rear loading ramp under the tail, hinged at the troop bay floor', 130, 56, 'world-behind-actors',
    'Ramp plate, side view, hinge on the right; ribbed walking surface and two hydraulic struts. Drawn rotated by the engine from closed to open.'),
  slot('level-ud4l-interior-glow', 'Troop bay light seen through the open ramp', 120, 70, 'world-behind-actors',
    'Warm red cabin light falling out of the open bay onto the ramp.'),
  slot('level-ud4l-downwash', 'Engine downwash: dust, rain spray or airless debris kicked up at touchdown', 640, 120, 'world-front',
    'Particle sprites: ochre dust puffs (atmosphere), wind-driven spray (rain), ballistic grey regolith chips without billowing (airless).'),
  slot('level-ud4l-ramp-status', 'Ramp status beacon, colour-blind safe (shape and blink pattern, not colour alone)', 18, 18, 'world-front',
    'Hollow chevrons flashing while the ramp moves; one steady filled bar when it is down and safe to walk.'),
  slot('level-m577-transport', 'M577 APC lowered from the belly hoist when it is not the player\'s mission vehicle', 236, 104, 'world-behind-actors',
    'Strict side view, angular six-wheeled hull, sloped glacis, low roof turret with twin barrels, rear troop door. Transparent background.'),
  slot('level-m577-hoist', 'Belly hoist cables holding the M577 while it is lowered or raised', 120, 160, 'world-behind-actors',
    'Two steel cables and a spreader bar.'),
  slot('level-docking-collar', 'Docking collar and airlock hatch on the back wall (ship interiors, stations)', 150, 196, 'world-behind-actors',
    'Thick circular-to-square collar ring with clamp teeth, two hatch leaves that slide apart, hazard striping, inner airlock darkness.'),
  slot('level-docking-status', 'Airlock seal status, colour-blind safe (shape-coded)', 20, 20, 'world-front',
    'Hollow triangle while sealing or cycling; filled square once sealed and the hatch is open.'),
  slot('level-covering-fire', 'Chin gun covering fire during boarding: tracers, muzzle flash, impact sparks', 4, 4, 'world-front',
    'Short bright tracer dashes and a star-shaped muzzle flash; impact sparks at the target.'),
  slot('level-handover-letterbox', 'Letterbox bars while control is withheld', 1280, 92, 'screen',
    'Plain black bars, 2.39:1 framing, same height as the story cinematics (LETTERBOX_V188).')
]);

export function levelDropshipSlotV188(id) {
  return LEVEL_DROPSHIP_SLOTS_V188.find(entry => entry.id === id) || null;
}

// —— Ship geometry in its own frame ——
// Local frame: x = 0 at the tail tip, +x towards the nose; y = 0 at the skid
// bottoms, negative upwards. Measured on the V139 hangar bitmap
// (source crop 2076×558, skids at crop y 556), scaled to 870 px.
const HULL_ART = HUB_DROPSHIP_HANGAR_ART_V139;
const S = LEVEL_DROPSHIP_SCALE_V188.ud4l.length / HULL_ART.source.w;
const local = (cx, cy) => ({ x: Math.round(cx * S), y: Math.round((cy - HULL_ART.footSourceY) * S) });
export const UD4L_FRAME_V188 = freeze({
  scale: S,
  length: LEVEL_DROPSHIP_SCALE_V188.ud4l.length,
  height: Math.round(HULL_ART.source.h * S),
  hinge: freeze(local(602, 429)),     // troop bay floor at the rear (ramp hinge)
  rampLength: 130,
  belly: freeze(local(1000, 470)),    // belly bay, M577 hoist point
  chinGun: freeze(local(2040, 470)),  // chin turret muzzle
  nacelles: freeze([local(820, 250), local(1060, 250)]) // exhaust under the nacelles (downwash sources)
});
/** Ramp angle when it rests on the ground (from the hinge height and its length). */
export const UD4L_RAMP_OPEN_ANGLE_V188 = Math.asin(Math.min(1, -UD4L_FRAME_V188.hinge.y / UD4L_FRAME_V188.rampLength));
/** Where the ramp foot meets the ground, along +x from the tail tip (local frame). */
export const UD4L_RAMP_FOOT_V188 = UD4L_FRAME_V188.hinge.x - Math.round(Math.cos(UD4L_RAMP_OPEN_ANGLE_V188) * UD4L_FRAME_V188.rampLength);

/** World → ship frame: `dir` is the side the ramp opens to (+1 right, −1 left). */
export function ud4lToWorldV188(ship, point) {
  return { x: ship.tailX - ship.dir * point.x, y: ship.groundY - (ship.lift || 0) + point.y };
}

const ready = image => Boolean(image && image.complete !== false && image.naturalWidth > 0);

// —— Fallback drawings (placeholders) ——
function drawUd4lHullFallback(ctx) {
  const L = UD4L_FRAME_V188.length;
  ctx.fillStyle = '#3b4136'; ctx.strokeStyle = '#1b1f19'; ctx.lineWidth = 2;
  // Fuselage: blunt nose (right), troop bay, tapering into the twin booms (left).
  ctx.beginPath();
  ctx.moveTo(L - 4, -78); ctx.lineTo(L - 40, -128); ctx.lineTo(L - 190, -150); ctx.lineTo(330, -150);
  ctx.lineTo(170, -140); ctx.lineTo(60, -132); ctx.lineTo(60, -112); ctx.lineTo(180, -100);
  ctx.lineTo(240, -40); ctx.lineTo(L - 230, -34); ctx.lineTo(L - 60, -46); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Twin booms (side view: the near boom; the far one is a darker offset) and fins.
  ctx.fillStyle = '#2b3029'; ctx.fillRect(14, -126, 190, 12);
  ctx.fillStyle = '#353b32'; ctx.fillRect(4, -122, 210, 14);
  ctx.beginPath(); ctx.moveTo(10, -122); ctx.lineTo(40, -230); ctx.lineTo(96, -230); ctx.lineTo(110, -122); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(12, -108); ctx.lineTo(30, -66); ctx.lineTo(82, -66); ctx.lineTo(100, -108); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Engine nacelles on stub wings.
  ctx.fillStyle = '#4a5143';
  for (const [x, w] of [[290, 150], [420, 120]]) { ctx.beginPath(); ctx.ellipse(x + w / 2, -170, w / 2, 26, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  // Cockpit glazing and the chin gun turret.
  ctx.fillStyle = '#6f8b8e'; ctx.beginPath(); ctx.moveTo(L - 44, -122); ctx.lineTo(L - 110, -138); ctx.lineTo(L - 120, -112); ctx.lineTo(L - 40, -100); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#22261f'; ctx.beginPath(); ctx.arc(UD4L_FRAME_V188.chinGun.x - 18, -34, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(UD4L_FRAME_V188.chinGun.x - 16, -38, 34, 5); ctx.fillRect(UD4L_FRAME_V188.chinGun.x - 16, -30, 34, 5);
  // Hull number and panel lines.
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1;
  for (const x of [330, 470, 620]) { ctx.beginPath(); ctx.moveTo(x, -146); ctx.lineTo(x, -40); ctx.stroke(); }
  ctx.fillStyle = '#c9c0a2'; ctx.font = '700 34px monospace'; ctx.fillText('01', 520, -70);
}
function drawUd4lGearFallback(ctx, extended) {
  const skid = -10 - 26 * (1 - extended); // skid top: on the ground when extended, tucked when retracted
  ctx.strokeStyle = '#1d211b'; ctx.lineWidth = 6; ctx.fillStyle = '#262a24';
  for (const [a, b] of [[226, 372], [576, 762]]) {
    ctx.beginPath(); ctx.moveTo(a + 30, -36); ctx.lineTo(a + 40, skid); ctx.moveTo(b - 30, -36); ctx.lineTo(b - 44, skid); ctx.stroke();
    ctx.fillRect(a, skid, b - a, 10);
  }
}

/** UD-4L hull (bitmap reuse, else primitives). ship = { tailX, groundY, lift, dir, gear } */
export function drawUd4lHullV188(ctx, ship, { image = null } = {}) {
  ctx.save();
  ctx.translate(ship.tailX, ship.groundY - (ship.lift || 0));
  ctx.scale(-ship.dir, 1); // local +x (towards the nose) runs away from the ramp side
  if (ready(image)) {
    const { x, y, w, h } = HULL_ART.source;
    // The bitmap has its tail on the left (local +x already runs to its right).
    ctx.drawImage(image, x, y, w, h, 0, -HULL_ART.footSourceY * S, w * S, h * S);
  } else {
    drawUd4lHullFallback(ctx);
    drawUd4lGearFallback(ctx, ship.gear ?? 1);
  }
  ctx.restore();
}

/** Ramp: open = 0 (closed against the belly) … 1 (resting on the ground). */
export function drawUd4lRampV188(ctx, ship, open) {
  const f = UD4L_FRAME_V188, hinge = ud4lToWorldV188(ship, f.hinge);
  // Closed, the plate stands up from the hinge and forms the rear wall of the bay.
  const closed = -1.35, angle = closed + (UD4L_RAMP_OPEN_ANGLE_V188 - closed) * Math.max(0, Math.min(1, open));
  ctx.save();
  if (open > .05) { // the bay light spills out as the ramp drops
    const glow = ctx.createLinearGradient?.(hinge.x, hinge.y - 60, hinge.x + ship.dir * 110, hinge.y + 40);
    if (glow) { glow.addColorStop(0, `rgba(196,64,44,${.55 * open})`); glow.addColorStop(1, 'rgba(196,64,44,0)'); ctx.fillStyle = glow; }
    else ctx.fillStyle = `rgba(196,64,44,${.3 * open})`;
    ctx.beginPath(); ctx.moveTo(hinge.x, hinge.y - 70); ctx.lineTo(hinge.x + ship.dir * 26, hinge.y - 70); ctx.lineTo(hinge.x + ship.dir * 26, hinge.y); ctx.lineTo(hinge.x, hinge.y); ctx.closePath(); ctx.fill();
  }
  ctx.translate(hinge.x, hinge.y); ctx.scale(ship.dir, 1); ctx.rotate(angle);
  ctx.fillStyle = '#2f342c'; ctx.fillRect(0, -3, f.rampLength, 8);
  ctx.fillStyle = '#4a5045'; for (let x = 8; x < f.rampLength - 4; x += 14) ctx.fillRect(x, -4, 6, 2);
  ctx.strokeStyle = '#1a1d18'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(10, 5); ctx.lineTo(42, 22 * (1 - open) + 6); ctx.stroke();
  ctx.restore();
}

/** Shape-coded status (colour is a second cue, never the only one). state: 'moving'|'safe'|'idle' */
export function drawStatusBeaconV188(ctx, x, y, state, time, { reducedMotion = false } = {}) {
  ctx.save();
  if (state === 'safe') {
    ctx.fillStyle = '#e8f0e0'; ctx.fillRect(x - 8, y - 3, 16, 6);           // one steady bar
    ctx.strokeStyle = '#2f8a63'; ctx.lineWidth = 2; ctx.strokeRect(x - 9, y - 4, 18, 8);
  } else if (state === 'moving') {
    const on = reducedMotion || Math.floor(time * 4) % 2 === 0;
    ctx.strokeStyle = on ? '#ffd166' : 'rgba(255,209,102,.3)'; ctx.lineWidth = 2;  // hollow chevrons, blinking
    for (const dx of [-5, 3]) { ctx.beginPath(); ctx.moveTo(x + dx, y - 6); ctx.lineTo(x + dx + 5, y); ctx.lineTo(x + dx, y + 6); ctx.stroke(); }
  }
  ctx.restore();
}

/** M577 placeholder, side view, facing = +1 (nose right) or −1. Feet at y. */
export function drawM577TransportV188(ctx, x, y, facing = 1, { wheelTurn = 0 } = {}) {
  const { w, h } = LEVEL_DROPSHIP_SCALE_V188.m577;
  ctx.save(); ctx.translate(x + w / 2, y); ctx.scale(facing, 1); ctx.translate(-w / 2, 0);
  ctx.fillStyle = '#3d4434'; ctx.strokeStyle = '#191c16'; ctx.lineWidth = 2;
  ctx.beginPath(); // angular hull: sloped glacis at the nose (right), flat rear door
  ctx.moveTo(4, -22); ctx.lineTo(4, -78); ctx.lineTo(150, -84); ctx.lineTo(196, -74); ctx.lineTo(w - 2, -40); ctx.lineTo(w - 6, -22); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#323829'; ctx.fillRect(70, -100, 70, 18); ctx.strokeRect(70, -100, 70, 18);  // low roof turret
  ctx.fillStyle = '#1e211b'; ctx.fillRect(140, -96, 46, 4); ctx.fillRect(140, -89, 46, 4);      // twin barrels
  ctx.fillStyle = '#596049'; ctx.fillRect(10, -70, 22, 40);                                      // rear troop door
  ctx.fillStyle = '#1f221c';
  for (let i = 0; i < 6; i++) { const cx = 30 + i * 35; ctx.beginPath(); ctx.arc(cx, -14, 14, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#454b3f'; ctx.beginPath(); ctx.moveTo(cx, -14); ctx.lineTo(cx + Math.cos(wheelTurn) * 10, -14 + Math.sin(wheelTurn) * 10); ctx.stroke(); }
  ctx.restore();
}

export function drawHoistV188(ctx, from, to) {
  ctx.save(); ctx.strokeStyle = '#8b9187'; ctx.lineWidth = 2;
  for (const dx of [-40, 40]) { ctx.beginPath(); ctx.moveTo(from.x + dx * .5, from.y); ctx.lineTo(to.x + dx, to.y); ctx.stroke(); }
  ctx.fillStyle = '#5b6157'; ctx.fillRect(to.x - 50, to.y - 4, 100, 6); ctx.restore();
}

/** Docking collar on the back wall. seal, open in 0..1; feet line at floorY. */
export function drawDockingCollarV188(ctx, x, floorY, { seal = 0, open = 0, time = 0, reducedMotion = false } = {}) {
  const w = 150, h = 196, top = floorY - h, cx = x;
  ctx.save();
  ctx.fillStyle = '#05080a'; ctx.fillRect(cx - 48, top + 30, 96, h - 30);                       // airlock interior
  ctx.fillStyle = 'rgba(160,190,200,.12)'; ctx.fillRect(cx - 40, top + 40, 80, h - 46);
  // Hatch leaves slide apart.
  const leaf = 48 * (1 - open);
  ctx.fillStyle = '#4a5158'; ctx.fillRect(cx - 48, top + 30, leaf, h - 30); ctx.fillRect(cx + 48 - leaf, top + 30, leaf, h - 30);
  ctx.fillStyle = '#d6b44c'; for (let y = top + 40; y < floorY - 10; y += 22) { ctx.fillRect(cx - 48 + leaf - 6, y, 6, 10); ctx.fillRect(cx + 48 - leaf, y + 11, 6, 10); }
  // Collar ring with clamp teeth that close as it seals.
  ctx.strokeStyle = '#6d757c'; ctx.lineWidth = 14; ctx.strokeRect(cx - w / 2 + 7, top + 7, w - 14, h - 7);
  ctx.fillStyle = '#9aa2a8';
  for (let i = 0; i < 6; i++) { const y = top + 20 + i * 30, reach = 6 + 10 * seal; ctx.fillRect(cx - w / 2, y, reach, 8); ctx.fillRect(cx + w / 2 - reach, y, reach, 8); }
  // Seal status: hollow triangle while sealing/cycling, filled square when open.
  const sx = cx, sy = top - 14;
  if (open >= 1) { ctx.fillStyle = '#e8f0e0'; ctx.fillRect(sx - 7, sy - 7, 14, 14); ctx.strokeStyle = '#2f8a63'; ctx.lineWidth = 2; ctx.strokeRect(sx - 8, sy - 8, 16, 16); }
  else { const on = reducedMotion || Math.floor(time * 3) % 2 === 0; ctx.strokeStyle = on ? '#ffd166' : 'rgba(255,209,102,.35)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sx, sy - 8); ctx.lineTo(sx + 8, sy + 7); ctx.lineTo(sx - 8, sy + 7); ctx.closePath(); ctx.stroke(); }
  ctx.restore();
}

/** Downwash particles (world space). kind: 'dust' | 'rain' | 'debris' | 'spark'. */
export function drawDownwashParticlesV188(ctx, particles) {
  ctx.save();
  for (const p of particles) {
    const a = Math.max(0, Math.min(1, p.life / p.max));
    if (p.kind === 'dust') { ctx.fillStyle = `rgba(150,128,96,${.35 * a})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1.6 - a * .6), 0, Math.PI * 2); ctx.fill(); }
    else if (p.kind === 'rain') { ctx.strokeStyle = `rgba(170,200,215,${.55 * a})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * .03, p.y - p.vy * .03); ctx.stroke(); }
    else if (p.kind === 'spark') { ctx.fillStyle = `rgba(255,214,140,${a})`; ctx.fillRect(p.x - 1, p.y - 1, 3, 3); }
    else { ctx.fillStyle = `rgba(120,124,128,${a})`; ctx.fillRect(p.x, p.y, p.r, p.r * .7); }
  }
  ctx.restore();
}

/** Covering fire: one tracer from the chin gun to a target point, with a star flash. */
export function drawCoveringFireV188(ctx, from, to, phase) {
  ctx.save();
  const t0 = phase, t1 = Math.min(1, phase + .18);
  ctx.strokeStyle = 'rgba(255,226,150,.95)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(from.x + (to.x - from.x) * t0, from.y + (to.y - from.y) * t0);
  ctx.lineTo(from.x + (to.x - from.x) * t1, from.y + (to.y - from.y) * t1); ctx.stroke();
  if (phase < .25) { ctx.fillStyle = 'rgba(255,240,190,.9)'; ctx.beginPath();
    for (let i = 0; i < 8; i++) { const r = i % 2 ? 4 : 11, a = i * Math.PI / 4; ctx[i ? 'lineTo' : 'moveTo'](from.x + Math.cos(a) * r, from.y + Math.sin(a) * r); }
    ctx.closePath(); ctx.fill(); }
  ctx.restore();
}

/** Screen-space letterbox (amount 0..1 of the cinematic bar height). */
export function drawHandoverLetterboxV188(ctx, amount, { width = 1280, height = 720, bar = 92 } = {}) {
  const h = Math.round(bar * Math.max(0, Math.min(1, amount)));
  if (h <= 0) return;
  ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, width, h); ctx.fillRect(0, height - h, width, h); ctx.restore();
}
