// V188 — safe zone at insertion (owner decision, 2026-11-14). Before it a marine
// who stood still at insertion died within 5–10 s on pair-001-mire,
// pair-001-frontier, cargo-brutal and alpha-bravo: awake patrols started
// 380–420 px away and closed in at once.
//
// Two guards, generic and mode missions only (never the story chapters' scripted
// encounters, the Forge playtests or a resumed mission):
// - placement: awake patrols start at least `radius` px from the insertion point
//   (compileMissionLevelActors in game-v52-level-runtime.js reads
//   this.insertionSafeZoneV188 while it places them);
// - grace: for `graceSeconds` of simulated mission time after control is given,
//   no enemy attack reaches the marine and no enemy closes the distance; a horde
//   warning due in that window waits for its end.
// Values recorded in docs/narrative/CAMPAGNE_PRINCIPALE.md §56.4.
import { STORY_ENDING_CHAPTERS_V188 } from './story-campaign-v188.js';

/** [PROPOSÉ] Safe radius (px, about 17.6 m at 51 px/m) and grace (s of mission time). */
export const INSERTION_SAFE_ZONE_V188 = Object.freeze({ schema: 188, radius: 900, graceSeconds: 4 });
/** Story chapters keep their authored encounters (QZ-17, QZ-18, APC, C-12, black cocoon). */
export const INSERTION_SAFE_ZONE_EXCLUDED_V188 = Object.freeze(['special-narrative-qz17', ...STORY_ENDING_CHAPTERS_V188]);

const finite = (n, fallback = 0) => Number.isFinite(n) ? n : fallback;
const centre = actor => ({ x: finite(actor?.x) + finite(actor?.w) / 2, y: finite(actor?.y) + finite(actor?.h) / 2 });

export function insertionSafeZoneAppliesV188(options = {}) {
  const id = options.campaign?.id || options.campaignId || '';
  return Boolean(options.missionLevel && !options.editorProject && !options.forgePlaytest && !options.forgeSessionV141
    && !INSERTION_SAFE_ZONE_EXCLUDED_V188.includes(id));
}

export function withInsertionSafeZoneV188(Base) {
  if (Base.insertionSafeZoneRuntimeV188) return Base;
  return class InsertionSafeZoneV188 extends Base {
    static insertionSafeZoneRuntimeV188 = true;
    start(options = {}) {
      const applies = insertionSafeZoneAppliesV188(options);
      // Read by compileMissionLevelActors during super.start().
      this.insertionSafeZoneV188 = applies ? { radius: INSERTION_SAFE_ZONE_V188.radius } : null;
      this.insertionGraceV188 = null; this.insertionGraceHeldV188 = 0; this.insertionGraceEnemyV188 = null;
      const result = super.start(options);
      if (applies && this.mission?.state === 'active' && this.lastResumeResult?.applied !== true) {
        this.insertionGraceV188 = { remaining: INSERTION_SAFE_ZONE_V188.graceSeconds, total: INSERTION_SAFE_ZONE_V188.graceSeconds };
      }
      return result;
    }
    // A resumed mission restores its own positions and pressure: no grace.
    applyResumeState(rawState) {
      const result = super.applyResumeState(rawState);
      if (result?.applied) this.insertionGraceV188 = null;
      return result;
    }
    insertionGraceActiveV188() { return finite(this.insertionGraceV188?.remaining) > 0; }
    update(delta) {
      const before = finite(this.mission?.elapsed), result = super.update(delta);
      const grace = this.insertionGraceV188, step = finite(this.mission?.elapsed) - before;
      if (grace && step > 0) {
        grace.remaining = Math.max(0, grace.remaining - step);
        if (grace.remaining === 0) {
          this.insertionGraceV188 = null;
          this.onEvent?.({ type: 'insertion-grace-ended-v188', held: this.insertionGraceHeldV188 });
        }
      }
      return result;
    }
    // Grace: the enemy may turn, animate and fall, but not close the distance;
    // any damage dealt to a marine during its own update is withheld.
    updateEnemy(enemy, delta) {
      if (!this.insertionGraceActiveV188() || !enemy?.alive || enemy.dormant) return super.updateEnemy(enemy, delta);
      const target = this.player, x = enemy.x, near = () => {
        const a = centre(enemy), b = centre(target); return Math.hypot(a.x - b.x, a.y - b.y);
      };
      const distance = target ? near() : Infinity;
      this.insertionGraceEnemyV188 = enemy;
      try { return super.updateEnemy(enemy, delta); }
      finally {
        this.insertionGraceEnemyV188 = null;
        if (target && Number.isFinite(x) && near() < distance) { enemy.x = x; if (Number.isFinite(enemy.vx)) enemy.vx = 0; }
      }
    }
    damagePlayer(actor, amount, options = {}) {
      if (this.insertionGraceActiveV188() && this.insertionGraceEnemyV188) { this.insertionGraceHeldV188++; return 0; }
      return super.damagePlayer(actor, amount, options);
    }
    beginHordeWarningV132() {
      const state = this.hordeDirectorV132;
      if (this.insertionGraceActiveV188() && state) { state.nextWave = state.elapsed + this.insertionGraceV188.remaining; return false; }
      return super.beginHordeWarningV132();
    }
    getSnapshot() {
      return { ...super.getSnapshot(), insertionGraceV188: this.insertionGraceV188 ? { ...this.insertionGraceV188 } : null };
    }
  };
}
