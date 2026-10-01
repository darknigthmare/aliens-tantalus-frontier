/** Project-authored 2D combat contracts. No simulation balance is canon. */
export const SYNTH_TRIAL_ATTACKS_V110 = Object.freeze({
  flame: Object.freeze({ cost: 38, damage: 10, reach: 190, startup: .4, active: .56, recovery: .6, stun: .06, push: 3, interval: .14 }),
  detonation: Object.freeze({ cost: 38, damage: 180, reach: 150, startup: .45, active: .62, recovery: .4, stun: .5, push: 50, chargeDuration: .48 }),
  shield: Object.freeze({ cost: 30, damage: 22, reach: 68, startup: .16, active: .14, recovery: .36, stun: .45, push: 45 })
});
export function getSynthTrialAttackV110(definition, kind, fallback) {
  return kind === 'special' ? SYNTH_TRIAL_ATTACKS_V110[definition?.special] || fallback : fallback;
}
/** Rectangle/cone overlap in coordinates independent of canvas orientation. */
export function synthConeHitsV110(originX, originY, facing, range, target) {
  const near = facing > 0 ? target.left - originX : originX - target.right;
  const far = facing > 0 ? target.right - originX : originX - target.left;
  if (far < 0 || near > range) return false;
  const halfHeight = 12 + Math.min(range, Math.max(0, far)) * .22;
  return target.bottom <= originY + halfHeight && target.top >= originY - halfHeight;
}
export const SYNTH_CAMPAIGN_CONTRACTS_V110 = Object.freeze({
  flame: Object.freeze({ kind: 'synth-flame', label: 'Volcan — jet de flamme', windup: .55, cooldown: 1.8,
    range: 230, radius: 230, damageScale: 1.1, preferredRange: 170, visualDuration: .3 }),
  detonation: Object.freeze({ kind: 'synth-detonation', label: 'Surcharge — éloignez-vous', windup: .75, cooldown: 1.2,
    range: 105, radius: 160, damageScale: 2, chargeSpeed: 2.1 }),
  shield: Object.freeze({ kind: 'synth-shield', label: 'Frappe de matraque', windup: .35, cooldown: 1.1,
    range: 82, radius: 88, damageScale: 1 })
});

/** Canvas combat feedback; not a replacement or edit of the native sprite. */
export function drawSynthConeV110(ctx, x, y, facing, range, alpha = .65) {
  ctx.save(); ctx.globalAlpha = alpha;
  const gradient = ctx.createLinearGradient(x, y, x + facing * range, y);
  gradient.addColorStop(0, '#fff2ad'); gradient.addColorStop(.45, '#ffb447'); gradient.addColorStop(1, '#ef502a55');
  ctx.fillStyle = gradient; ctx.beginPath(); ctx.moveTo(x, y - 8);
  ctx.lineTo(x + facing * range, y - 12 - range * .22);
  ctx.lineTo(x + facing * range, y + 12 + range * .22); ctx.lineTo(x, y + 8); ctx.closePath(); ctx.fill(); ctx.restore();
}
