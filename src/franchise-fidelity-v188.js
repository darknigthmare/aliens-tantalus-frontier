// V188 — franchise-documented behaviours missing from the generic missions (owner request
// "fidélité franchise 1:1", 2026-11-15). This layer never claims a 1:1 reproduction: each rule
// names what the films show and what the project adapts. Sources and values are recorded in
// docs/narrative/CAMPAGNE_PRINCIPALE.md §56.4 (gameplay gaps V188).
//
// - Acid blood (Alien, 1979: the facehugger's blood eats through two decks; Aliens, 1986:
//   "acid for blood", Hudson's warning, the drone's blood burning a marine's armour): a
//   xenomorph killed outside the Lethe survival operation — which already lays its own
//   persistent pools (alien-survival-runtime-v70.js) — leaves a short acid pool where it falls.
//   It uses the existing hazard rule (applyHazards: feet overlap, damage cooldown), so cover,
//   armour and accessibility settings apply as for any acid floor. In a depth hold the pool lies
//   at the creature's depth (mission-depth-v188.js burns within the attack band).
// - Smartgun tracking (Aliens, 1986: the M56's articulated arm and head-mounted sight steer the
//   burst onto a target the gunner indicates): with an M56 the player's rifle salvo bends
//   towards the nearest awake, visible enemy inside a cone around the aim. The gunner still
//   chooses the direction and fires; no target is chosen behind them or through a wall.
//
// The motion tracker (motion-tracker-v160.js: 900 px ≈ 17.6 m, ping interval 0.2–1.2 s by
// distance) and the M41A (99-round magazine, two-digit counter) were already checked against
// the films: no rule changes here; see §56.4 for the recorded gaps.
import { enemySightClearV130 } from './enemy-tactics-v130.js';

/** [PROPOSÉ] Acid pool of a dead xenomorph: lifetime (s), damage per contact tick, size, at most `cap` at once. */
export const ACID_BLOOD_V188 = Object.freeze({ seconds: 6, damage: 5, minWidth: 48, widthScale: .8, height: 14, cap: 6 });
/** [PROPOSÉ] M56 tracking: half cone (radians, 25°) around the gunner's aim and reach (px ≈ 13.7 m). */
export const SMARTGUN_TRACKING_V188 = Object.freeze({ cone: 25 * Math.PI / 180, reach: 700 });

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
export const acidBloodEnemyV188 = enemy => Boolean(enemy && /xenomorph/i.test(String(enemy.biology || '')) && !/egg|ovomorph/i.test(String(enemy.behavior || '')));
export function smartgunWeaponV188(weapon) {
  const name = String(weapon?.name || weapon?.id || '');
  return /smartgun|\bM56\b/i.test(name) || (weapon?.category === 'smart' && !/disc/i.test(name));
}

export function withFranchiseFidelityV188(Base) {
  if (Base.franchiseFidelityV188) return Base;
  return class FranchiseFidelityV188 extends Base {
    static franchiseFidelityV188 = true;

    // —— Acid blood ——
    defeatEnemy(enemy, owner = this.player) {
      const biological = Boolean(enemy?.alive) && acidBloodEnemyV188(enemy);
      const result = super.defeatEnemy(enemy, owner);
      // The Lethe survival operation keeps its own persistent pools.
      if (biological && enemy.alive === false && !this.alienSurvivalV70 && Array.isArray(this.hazards)) this.layAcidBloodV188(enemy);
      return result;
    }
    layAcidBloodV188(enemy) {
      const rules = ACID_BLOOD_V188, w = Math.max(rules.minWidth, finite(enemy.w, 60) * rules.widthScale);
      const id = `acid-blood:${enemy.id}`;
      if (this.hazards.some(hazard => hazard.id === id)) return null;
      const own = this.hazards.filter(hazard => hazard.acidBloodV188);
      if (own.length >= rules.cap) this.hazards.splice(this.hazards.indexOf(own[0]), 1);
      const pool = { id, kind: 'acid', x: finite(enemy.x) + finite(enemy.w) / 2 - w / 2, y: finite(enemy.y) + finite(enemy.h) - rules.height,
        w, h: rules.height, damage: rules.damage, active: true, acidBloodV188: { until: finite(this.mission?.elapsed) + rules.seconds } };
      if (Number.isFinite(enemy.depthZ) && enemy.depthZ !== 0) pool.depthZ = enemy.depthZ;
      this.hazards.push(pool);
      this.onEvent?.({ type: 'acid-blood-splash-v188', enemyId: enemy.id, x: pool.x + w / 2, y: pool.y + pool.h, depthZ: pool.depthZ ?? 0 });
      return pool;
    }
    update(delta) {
      const result = super.update(delta);
      if (Array.isArray(this.hazards) && this.hazards.some(hazard => hazard.acidBloodV188)) {
        const now = finite(this.mission?.elapsed);
        this.hazards = this.hazards.filter(hazard => !hazard.acidBloodV188 || hazard.acidBloodV188.until > now);
      }
      return result;
    }

    // —— Smartgun tracking ——
    fire(player) {
      const count = this.bullets?.length || 0, result = super.fire(player);
      if (!player || player.inVehicle || player.weaponMode !== 'rifle' || !smartgunWeaponV188(this.weapon)) return result;
      const fresh = (this.bullets || []).slice(count).filter(bullet => finite(bullet.vx) || finite(bullet.vy));
      if (!fresh.length) return result;
      const origin = { x: finite(player.x) + finite(player.w) / 2, y: finite(player.y) + 36 };
      const aim = Math.atan2(finite(fresh[0].vy), finite(fresh[0].vx));
      const target = this.smartgunTargetV188(player, origin, aim);
      if (!target) return result;
      const angle = Math.atan2(finite(target.y) + finite(target.h) * .45 - origin.y, finite(target.x) + finite(target.w) / 2 - origin.x);
      for (const bullet of fresh) {
        const speed = Math.hypot(finite(bullet.vx), finite(bullet.vy)), turn = angle - aim;
        const own = Math.atan2(finite(bullet.vy), finite(bullet.vx)) + turn; // a spread keeps its shape around the tracked line
        bullet.vx = Math.cos(own) * speed; bullet.vy = Math.sin(own) * speed;
        if (Number.isFinite(bullet.angleRadians)) bullet.angleRadians = own;
        bullet.smartgunTrackV188 = target.id;
      }
      this.onEvent?.({ type: 'smartgun-track-v188', enemyId: target.id, angle });
      return result;
    }
    smartgunTargetV188(player, origin, aim) {
      const rules = SMARTGUN_TRACKING_V188;
      return (this.enemies || []).filter(enemy => enemy?.alive && !enemy.dormant && !enemy.ventTransit).map(enemy => {
        const dx = finite(enemy.x) + finite(enemy.w) / 2 - origin.x, dy = finite(enemy.y) + finite(enemy.h) * .45 - origin.y;
        const distance = Math.hypot(dx, dy), off = Math.abs(Math.atan2(Math.sin(Math.atan2(dy, dx) - aim), Math.cos(Math.atan2(dy, dx) - aim)));
        return { enemy, distance, off };
      }).filter(entry => entry.distance <= rules.reach && entry.off <= rules.cone && enemySightClearV130(this, player, entry.enemy))
        .sort((a, b) => a.off - b.off || a.distance - b.distance)[0]?.enemy || null;
    }
  };
}
