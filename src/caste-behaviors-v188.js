// V188 — caste-specific behaviours (bible §53.3, P1-1), added after the
// existing registry decides eligibility (enemy-behavior-registry-v119):
// - drone (stalker, environment darkness/vents): backs off from a weapon
//   pointed at it, then comes back — a project adaptation of "fuit la lumière";
// - runner (pouncer, "flank-and-pounce"): holds while watched, dashes when the
//   player looks away — the side-view reading of "contournement";
// - ambusher (pouncer, "stalk-and-pounce"): stays still until close, so the
//   motion tracker cannot see it, then lunges.
// - drone ceiling ambush: under the underside of a real platform above.
// Movement only ever reverts to a position the
// base AI already held, or adds a bounded step on the current support.

export const CASTE_BEHAVIORS_V188 = Object.freeze({
  schema: 188,
  drone: Object.freeze({ watchedDistance: 240, retreatSpeed: 70, retreatSeconds: .6, cooldown: 3 }),
  runner: Object.freeze({ minDistance: 140, maxDistance: 360, holdSeconds: 1.2, dashFactor: 1.4, dashSeconds: .5 }),
  ambusher: Object.freeze({ triggerDistance: 200, lungeFactor: 1.6, lungeSeconds: .5 }),
  // Ceiling: one drone in three clings under a real platform 200-420 px above
  // its floor, motionless (invisible to the tracker), and drops on the player.
  ceiling: Object.freeze({ minHeight: 200, maxHeight: 420, dropReach: 90, everyNth: 3 })
});

const finite = (n, fallback = 0) => Number.isFinite(n) ? n : fallback;
const centerX = actor => finite(actor?.x) + finite(actor?.w) / 2;

/** Awareness from the existing AI: alert flag, a non-patrol tactics mode, or
 * a recent reveal (damage, light, noise). An unaware enemy keeps its base AI. */
export function enemyAwareV188(enemy) {
  const mode = enemy?.tacticsV130?.mode;
  return Boolean(enemy?.alert || mode && mode !== 'patrol' || enemy?.revealed > 0);
}

export function casteBehaviorIdV188(enemy) {
  if (!enemy || enemy.isBoss || enemy.hordeV132) return null;
  const id = enemy.behaviorProfileV119?.id;
  return ['drone', 'runner', 'ambusher'].includes(id) ? id : null;
}

/** True when the player faces the enemy within the given distance. */
export function playerWatchesV188(player, enemy, distance) {
  if (!player || player.alive === false) return false;
  const dx = centerX(enemy) - centerX(player);
  if (Math.abs(dx) > distance || Math.abs(finite(enemy.y) + finite(enemy.h) - finite(player.y) - finite(player.h)) > 120) return false;
  return Math.sign(dx) === (player.facing < 0 ? -1 : 1);
}

export function withCasteBehaviorsV188(Base) {
  if (Base.casteBehaviorsRuntimeV188) return Base;
  return class CasteBehaviorsV188 extends Base {
    static casteBehaviorsRuntimeV188 = true;
    drawEnemy(ctx, enemy) {
      if (enemy?.casteV188?.mode !== 'ceiling' || !ctx?.save) return super.drawEnemy(ctx, enemy);
      const cy = finite(enemy.y) + finite(enemy.h) / 2;
      ctx.save(); ctx.translate(0, cy * 2); ctx.scale(1, -1);
      try { return super.drawEnemy(ctx, enemy); } finally { ctx.restore(); }
    }
    supportBoundsV188(enemy) {
      const foot = finite(enemy.y) + finite(enemy.h), x = centerX(enemy);
      const surface = (Array.isArray(this.platforms) ? this.platforms : []).find(p => !p.lift && Math.abs(finite(p.y) - foot) < 4
        && x >= p.x && x <= p.x + p.w);
      return surface ? { min: surface.x, max: surface.x + surface.w - finite(enemy.w) } : null;
    }
    stepOnSupportV188(enemy, dx) {
      const bounds = this.supportBoundsV188(enemy); if (!bounds || !dx) return 0;
      const next = Math.max(bounds.min, Math.min(bounds.max, enemy.x + dx)), moved = next - enemy.x;
      enemy.x = next; return moved;
    }
    start(options = {}) {
      const result = super.start(options);
      this.attachCeilingDronesV188();
      return result;
    }
    ceilingAnchorV188(enemy) {
      const rules = CASTE_BEHAVIORS_V188.ceiling, foot = finite(enemy.y) + finite(enemy.h), x = centerX(enemy);
      return (Array.isArray(this.platforms) ? this.platforms : []).filter(p => !p.lift && x >= p.x + 8 && x <= p.x + p.w - 8)
        .map(p => ({ p, height: foot - (finite(p.y) + finite(p.h, 0)) }))
        .filter(({ height }) => height >= rules.minHeight + finite(enemy.h) && height <= rules.maxHeight + finite(enemy.h))
        .sort((a, b) => a.height - b.height)[0]?.p || null;
    }
    attachCeilingDronesV188() {
      let index = 0;
      for (const enemy of Array.isArray(this.enemies) ? this.enemies : []) {
        if (casteBehaviorIdV188(enemy) !== 'drone' || !enemy.alive || enemy.dormant) continue;
        if (index++ % CASTE_BEHAVIORS_V188.ceiling.everyNth !== 0) continue;
        const anchor = this.ceilingAnchorV188(enemy); if (!anchor) continue;
        enemy.casteV188 = { mode: 'ceiling', clock: 0, cooldown: 0, triggered: false, floorY: enemy.y };
        enemy.y = finite(anchor.y) + finite(anchor.h, 0); enemy.vx = 0; enemy.vy = 0; enemy.grounded = false;
        (this.casteStatsV188 ||= { drone: 0, runner: 0, ambusher: 0, ceiling: 0 }).ceiling = (this.casteStatsV188.ceiling || 0) + 1;
      }
    }
    updateEnemy(enemy, delta) {
      if (enemy?.casteV188?.mode === 'ceiling') {
        const player = this.player, rules = CASTE_BEHAVIORS_V188.ceiling;
        const below = player && finite(player.y) > finite(enemy.y) && Math.abs(centerX(player) - centerX(enemy)) <= rules.dropReach;
        if (enemy.alive && !below && !(enemy.hurtClock > 0)) { enemy.vx = 0; enemy.vy = 0; return undefined; }
        enemy.casteV188.mode = 'idle'; enemy.alert = true; enemy.revealed = Math.max(finite(enemy.revealed), 1);
        this.onEvent?.({ type: 'ceiling-drop-v188', enemyId: enemy.id });
        this.pushCaption?.('danger', 'Au plafond !');
      }
      const caste = casteBehaviorIdV188(enemy), beforeX = enemy?.x;
      const result = super.updateEnemy(enemy, delta);
      if (!caste || !enemy.alive || enemy.dormant || !Number.isFinite(delta) || delta <= 0 || enemy.attacking || enemy.pendingMelee
        || enemy.staggerClock > 0 || enemy.grounded === false || !this.player) return result;
      const state = enemy.casteV188 ||= { mode: 'idle', clock: 0, cooldown: 0, triggered: false };
      state.clock = Math.max(0, state.clock - delta); state.cooldown = Math.max(0, state.cooldown - delta);
      const rules = CASTE_BEHAVIORS_V188[caste], player = this.player, away = Math.sign(centerX(enemy) - centerX(player)) || 1;
      const distance = Math.abs(centerX(enemy) - centerX(player)), stats = this.casteStatsV188 ||= { drone: 0, runner: 0, ambusher: 0 };
      if (caste === 'drone') {
        if (state.mode !== 'retreat' && state.cooldown === 0 && enemyAwareV188(enemy) && playerWatchesV188(player, enemy, rules.watchedDistance)) {
          state.mode = 'retreat'; state.clock = rules.retreatSeconds; state.cooldown = rules.cooldown; stats.drone++;
        }
        if (state.mode === 'retreat') {
          enemy.x = beforeX; this.stepOnSupportV188(enemy, away * rules.retreatSpeed * delta);
          if (state.clock === 0) state.mode = 'idle';
        }
      } else if (caste === 'runner') {
        const watched = enemyAwareV188(enemy) && distance >= rules.minDistance && distance <= rules.maxDistance && playerWatchesV188(player, enemy, rules.maxDistance);
        if (state.mode === 'idle' && watched) { state.mode = 'hold'; state.clock = rules.holdSeconds; stats.runner++; }
        if (state.mode === 'hold') {
          enemy.x = beforeX;
          if (!playerWatchesV188(player, enemy, rules.maxDistance) || state.clock === 0) { state.mode = 'dash'; state.clock = rules.dashSeconds; }
        } else if (state.mode === 'dash') {
          this.stepOnSupportV188(enemy, (enemy.x - beforeX) * (rules.dashFactor - 1));
          if (state.clock === 0) { state.mode = 'idle'; state.cooldown = 2; }
        }
      } else if (caste === 'ambusher') {
        if (!state.triggered && (distance <= rules.triggerDistance || enemy.hurtClock > 0)) {
          state.triggered = true; state.mode = 'lunge'; state.clock = rules.lungeSeconds; stats.ambusher++;
        }
        if (!state.triggered) enemy.x = beforeX;
        else if (state.mode === 'lunge') {
          this.stepOnSupportV188(enemy, (enemy.x - beforeX) * (rules.lungeFactor - 1));
          if (state.clock === 0) state.mode = 'idle';
        }
      }
      return result;
    }
  };
}
