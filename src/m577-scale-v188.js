// V188 — the M577 to scale in the APC missions (owner decision 2026-11-22, bible §5.11
// « Course du convoi », docs/development/QUESTIONS_PROPRIETAIRE_V188.md). Pure: no DOM.
//
// Project scale: 1 m ≈ 51 px (creature-scale-v188.js; marine 1.8 m = 92 px, Queen 4.8 m = 245 px).
// Length of the M577 [À VÉRIFIER]: 8.8 m, the owner's figure, drawn 449 px (8.8 × 51). No project
// document measures the film vehicle; the outside figures disagree and none cites a primary source:
//   - AvP Central, « M577 APC » (Janno Vares, 2026): 9.22 m turret stowed, 8.58 m turret raised;
//   - Weyland-Yutani fan wiki, « APC »: about 7 m;
//   - the 1:12 production miniature (Propstore lot 6, cited in ACT5_ART_QA_20261117.md) is the
//     project's morphology reference (two road wheels per flank, side door between them, low wedge
//     hull, rear roof turret with two barrels, nose mount), not a measurement.
// Height and hitbox [PROPOSÉ]: a 2.2 m hull (112 px) for collisions, 140 px drawn with the turret;
// wheels, ground clearance, hitch and turret points below are project placements.
// Fidelity: documented appearance = the morphology above (Aliens, 1986); adapted = the Canvas
// placeholder, the hitch for the Act V trailers; to define = the mission sprite (named slot below,
// none requested while absent). Nothing here claims a 1:1 reproduction.

const freeze = Object.freeze;
export const M577_VEHICLE_ID_V188 = 'vehicle-001-m577-armored-personnel-carrier';
export const M577_SCALE_V188 = freeze({
  schema: 188, status: 'À VÉRIFIER', pixelsPerMetre: 51, metres: 8.8, w: 449, h: 112, drawnHeight: 140,
  clearance: 22, wheelRadius: 30, wheels: freeze([.2, .7]), hitchHeight: 24, turret: freeze({ x0: .16, x1: .4, barrels: .56 }),
  legacy: freeze({ w: 190, h: 104, sheetId: 'vehicle.m577-apc.action' }),
  sources: freeze([
    freeze({ id: 'owner-2026-11-22', kind: 'owner', note: '≈ 8.8 m ≈ 450 px (question to the owner, decision of 2026-11-22)' }),
    freeze({ id: 'avpcentral-m577', kind: 'fan-reference', url: 'https://www.avpcentral.com/m577-apc', note: '9.22 m (turret stowed) / 8.58 m (turret raised), unattributed' }),
    freeze({ id: 'weyland-wiki-apc', kind: 'fan-reference', url: 'https://weyland.fandom.com/wiki/APC', note: 'about 7 m, unattributed' }),
    freeze({ id: 'propstore-lot-6', kind: 'morphology', url: 'https://propstore.com/product/aliens-1986/lot-6-light-up-remote-controlled-photo-matched-1-12th-scale-apc-model-miniature-and-collection-of-production-materials/', note: 'production miniature: wheels, door, turret; no length used' })
  ])
});
/** The missions whose vehicle is the M577 itself (Act III convoy and its lanes, Act V race). */
export const M577_SCALE_CAMPAIGNS_V188 = freeze(['special-apc-convoy', 'act5-last-run', 'act5-depot-queen']);
export const m577ScaleCampaignV188 = id => M577_SCALE_CAMPAIGNS_V188.includes(typeof id === 'string' ? id : id?.id);

/** Named art slot; a Canvas placeholder is drawn until the file exists (no request while absent). */
export const M577_MISSION_SLOT_V188 = freeze({
  id: 'm577-mission-side-scale', width: 449, height: 140, present: false, path: '/assets/vehicles/v188/m577-mission-side-scale.png',
  purpose: 'Mission M577 side view at project scale (8.8 m ≈ 449 px), wheels on the feet line; facing right, flipped by the engine.',
  brief: 'Documented morphology (Aliens, 1986, production miniature): long low wedge hull, two road wheels per flank, side door between them, low rear roof turret with two parallel barrels, squat nose mount. Transparent background, no ground shadow. Rear hitch at 24 px above the feet line. To produce; Canvas placeholder meanwhile.'
});

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
/** Sets the hitbox to scale, feet and horizontal centre kept unless `anchorX` (left edge) is given. Mutates. */
export function applyM577MissionScaleV188(vehicle, { anchorX = null } = {}) {
  if (!vehicle) return vehicle;
  const S = M577_SCALE_V188, feet = finite(vehicle.y) + finite(vehicle.h, S.legacy.h), centre = finite(vehicle.x) + finite(vehicle.w, S.legacy.w) / 2;
  vehicle.w = S.w; vehicle.h = S.h;
  vehicle.x = Number.isFinite(anchorX) ? anchorX : centre - S.w / 2;
  vehicle.y = feet - S.h; vehicle.m577ScaleV188 = true;
  vehicle.spriteHitbox = m577HitboxRuntimeV188(vehicle);
  return vehicle;
}
/** Collision box of the scaled hull (the whole length, the 2.2 m hull height). Same shape as a sprite hitbox runtime. */
export function m577HitboxRuntimeV188(vehicle) {
  const local = { x: 2, y: 0, w: finite(vehicle?.w, M577_SCALE_V188.w) - 4, h: finite(vehicle?.h, M577_SCALE_V188.h) };
  return { id: 'm577-scale-v188', sheetId: null, local, world: { x: finite(vehicle?.x) + local.x, y: finite(vehicle?.y) + local.y, w: local.w, h: local.h } };
}
/** World points of the scaled vehicle: rear hitch, turret, nose, wheel centres, driver seat. facing 1 = nose right. */
export function m577AnchorsV188(vehicle) {
  const S = M577_SCALE_V188, w = finite(vehicle?.w, S.w), x = finite(vehicle?.x), feet = finite(vehicle?.y) + finite(vehicle?.h, S.h);
  const facing = finite(vehicle?.facing, 1) < 0 ? -1 : 1, at = u => facing > 0 ? x + u * w : x + (1 - u) * w;
  return {
    feet, facing, rearHitch: { x: at(0), y: feet - S.hitchHeight }, nose: { x: at(1), y: feet - 60 },
    turret: { x: at((S.turret.x0 + S.turret.x1) / 2), y: feet - S.drawnHeight + 14 }, muzzle: { x: at(S.turret.barrels), y: feet - S.drawnHeight + 12 },
    seat: { x: at(.84), y: feet - 70 }, wheels: S.wheels.map(u => ({ x: at(u), y: feet - S.wheelRadius }))
  };
}

/** Canvas placeholder: wheels on the feet line `footY`, from x to x + w, nose towards `facing`. */
export function drawM577ScaledPlaceholderV188(ctx, x, footY, facing = 1, { w = M577_SCALE_V188.w, wheelTurn = 0, hurt = 0, turretRecoil = 0 } = {}) {
  const S = M577_SCALE_V188, k = w / S.w, H = S.drawnHeight;
  ctx.save(); ctx.translate(x + w / 2, footY); ctx.scale(facing < 0 ? -k : k, k); ctx.translate(-S.w / 2, 0);
  ctx.lineWidth = 2; ctx.strokeStyle = '#191c16';
  // Long low wedge hull: flat rear, long roof, sloped glacis to the nose (right).
  ctx.fillStyle = hurt > 0 ? '#4b4433' : '#3d4434';
  ctx.beginPath(); ctx.moveTo(2, -S.clearance); ctx.lineTo(2, -104); ctx.lineTo(18, -112); ctx.lineTo(330, -112); ctx.lineTo(392, -92);
  ctx.lineTo(S.w - 4, -60); ctx.lineTo(S.w - 2, -S.clearance - 6); ctx.lineTo(S.w - 22, -S.clearance); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Sloped cockpit glazing in the nose.
  ctx.fillStyle = '#1b2427'; ctx.beginPath(); ctx.moveTo(336, -106); ctx.lineTo(384, -90); ctx.lineTo(380, -80); ctx.lineTo(334, -96); ctx.closePath(); ctx.fill();
  // Lower skirt line and armour seams.
  ctx.fillStyle = '#323829'; ctx.fillRect(4, -S.clearance - 14, S.w - 30, 10);
  ctx.strokeStyle = '#2a2f24'; ctx.beginPath(); for (const sx of [70, 150, 270, 330]) { ctx.moveTo(sx, -110); ctx.lineTo(sx, -S.clearance - 14); } ctx.stroke();
  // Side door between the two road wheels.
  ctx.fillStyle = '#596049'; ctx.strokeStyle = '#1e211b';
  ctx.beginPath(); ctx.moveTo(176, -S.clearance - 16); ctx.lineTo(176, -92); ctx.lineTo(184, -100); ctx.lineTo(240, -100); ctx.lineTo(248, -92); ctx.lineTo(248, -S.clearance - 16); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Rear roof turret (two parallel barrels pointing forward) and the squat nose mount.
  const t0 = S.turret.x0 * S.w, t1 = S.turret.x1 * S.w, bx = S.turret.barrels * S.w - turretRecoil * 6;
  ctx.fillStyle = '#323829'; ctx.beginPath(); ctx.moveTo(t0, -112); ctx.lineTo(t0 + 10, -H + 6); ctx.lineTo(t1 - 8, -H + 6); ctx.lineTo(t1, -112); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#1e211b'; ctx.fillRect(t1 - 10, -H + 10, bx - t1 + 10, 4); ctx.fillRect(t1 - 10, -H + 18, bx - t1 + 10, 4);
  ctx.fillStyle = '#2b3026'; ctx.fillRect(S.w - 44, -70, 26, 16); ctx.fillStyle = '#1e211b'; ctx.fillRect(S.w - 20, -66, 16, 3); ctx.fillRect(S.w - 20, -60, 16, 3);
  // Rear hitch (Act V trailers) at the hitch height.
  ctx.fillStyle = '#8a8f7a'; ctx.fillRect(-6, -S.hitchHeight - 4, 10, 8);
  // Two road wheels per flank, tyres touching the feet line.
  for (const u of S.wheels) {
    const cx = u * S.w, cy = -S.wheelRadius;
    ctx.fillStyle = '#1f221c'; ctx.beginPath(); ctx.arc(cx, cy, S.wheelRadius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#454b3f'; ctx.beginPath(); ctx.arc(cx, cy, S.wheelRadius * .45, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2c3127'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(wheelTurn) * S.wheelRadius * .8, cy + Math.sin(wheelTurn) * S.wheelRadius * .8); ctx.stroke();
    ctx.lineWidth = 2;
    // Flat armoured wheel cover above the tyre.
    ctx.fillStyle = '#353b2d'; ctx.fillRect(cx - S.wheelRadius - 6, cy - S.wheelRadius - 8, (S.wheelRadius + 6) * 2, 8);
  }
  ctx.restore();
}
