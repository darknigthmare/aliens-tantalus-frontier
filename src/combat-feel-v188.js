// V188 — firing feel pass (bible §53.3, P0-5). Small, measurable feedback
// added on top of the existing recoil pose, muzzle light, stagger and sound:
// a camera kick per accepted shot, a hit marker at the impact, a short
// knockback on ordinary enemies and a kill confirmation. Every camera effect
// is scaled by the player's screen-shake setting (0 with reduced motion).

export const COMBAT_FEEL_V188 = Object.freeze({
  schema: 188, shotKick: .18, shotKickCap: .22, killKick: .3,
  knockbackPx: 4, knockbackPerDamage: .3, hitMarkerSeconds: .09
});

const finite = (n, fallback = 0) => Number.isFinite(n) ? n : fallback;

export function knockbackDistanceV188(enemy, damage) {
  if (!enemy || enemy.isBoss || enemy.alive === false || enemy.climbing || enemy.ventTransit || enemy.dormant
    || enemy.hordeV132 && enemy.rearEntryV130 && enemy.rearEntryV130.phase !== 'active' || enemy.grounded === false) return 0;
  return Math.min(COMBAT_FEEL_V188.knockbackPx, Math.max(0, finite(damage)) * COMBAT_FEEL_V188.knockbackPerDamage);
}

export function withCombatFeelV188(Base) {
  if (Base.combatFeelRuntimeV188) return Base;
  return class CombatFeelV188 extends Base {
    static combatFeelRuntimeV188 = true;
    start(options = {}) {
      this.combatFeelV188Enabled = options.combatFeelV188 !== false;
      this.hitMarkerV188 = null;
      this.combatFeelMetricsV188 = { shots: 0, kicks: 0, hitMarkers: 0, knockbackPx: 0, killKicks: 0 };
      return super.start(options);
    }
    shakeScaleV188() {
      const runtime = this.accessibilityRuntime;
      return runtime?.reducedMotion ? 0 : finite(runtime?.screenShake, .65);
    }
    fire(player) {
      const before = this.bullets?.length ?? 0, result = super.fire(player);
      if (!this.combatFeelV188Enabled || result !== true || player !== this.player || (this.bullets?.length ?? 0) <= before) return result;
      const metrics = this.combatFeelMetricsV188; metrics.shots++;
      const kick = Math.min(COMBAT_FEEL_V188.shotKickCap, COMBAT_FEEL_V188.shotKick * this.shakeScaleV188());
      if (kick > 0) { this.cameraShake = Math.max(finite(this.cameraShake), kick); metrics.kicks++; }
      return result;
    }
    applyEnemyDamage(enemy, rawDamage, source = {}) {
      const wasAlive = Boolean(enemy?.alive), damage = super.applyEnemyDamage(enemy, rawDamage, source);
      if (!this.combatFeelV188Enabled || !(damage > 0) || !enemy) return damage;
      const metrics = this.combatFeelMetricsV188, fromPlayer = source.owner === this.player || source.owner === this.coop;
      if (fromPlayer) {
        this.hitMarkerV188 = { x: finite(source.x, enemy.x + enemy.w / 2), y: finite(source.y, enemy.y + enemy.h / 2),
          remaining: COMBAT_FEEL_V188.hitMarkerSeconds, kill: wasAlive && !enemy.alive };
        metrics.hitMarkers++;
      }
      if (fromPlayer && enemy.alive) {
        const push = knockbackDistanceV188(enemy, damage);
        if (push > 0) {
          const direction = finite(source.vx) !== 0 ? Math.sign(source.vx) : Math.sign(enemy.x - finite(source.owner?.x, enemy.x)) || 1;
          enemy.x += direction * push; metrics.knockbackPx += push;
        }
      }
      if (fromPlayer && wasAlive && !enemy.alive) {
        const kick = COMBAT_FEEL_V188.killKick * this.shakeScaleV188();
        if (kick > 0) { this.cameraShake = Math.max(finite(this.cameraShake), kick); metrics.killKicks++; }
      }
      return damage;
    }
    update(delta) {
      if (this.hitMarkerV188 && Number.isFinite(delta) && !this.paused) {
        this.hitMarkerV188.remaining -= delta; if (this.hitMarkerV188.remaining <= 0) this.hitMarkerV188 = null;
      }
      return super.update(delta);
    }
    drawHud(ctx) {
      super.drawHud(ctx);
      const marker = this.hitMarkerV188; if (!marker || !ctx) return;
      const x = marker.x - finite(this.camera?.x), y = marker.y - finite(this.camera?.y), r = marker.kill ? 9 : 6;
      ctx.save(); ctx.strokeStyle = marker.kill ? '#e9d07a' : '#f1f5ee'; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(x - r, y - r); ctx.lineTo(x - r / 2, y - r / 2); ctx.moveTo(x + r, y - r); ctx.lineTo(x + r / 2, y - r / 2);
      ctx.moveTo(x - r, y + r); ctx.lineTo(x - r / 2, y + r / 2); ctx.moveTo(x + r, y + r); ctx.lineTo(x + r / 2, y + r / 2);
      ctx.stroke(); ctx.restore();
    }
  };
}
