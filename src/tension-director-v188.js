// V188 — tension director, register-aware saves and motion-tracker false echoes
// (bible §53.3, §55.3, §55.7; values §56.4 [PROPOSÉ]). The director only gates
// and paces existing spawners; it never fabricates enemies.
import { missionRegisterProfileV188, resolveMissionRegisterV188, measureThreatV188,
  evaluateFreeSaveV188, evaluateTerminalSaveV188, SAVE_RULES_V188 } from './mission-register-v188.js';

export const TENSION_DIRECTOR_V188 = Object.freeze({
  schema: 188, peakAt: 85, relaxBelow: 30, decayPerSecond: 6,
  damageWeight: 1, nearbyPerEnemySecond: 4, nearbyCapPerSecond: 12, lowAmmoPerSecond: 5, lowAmmoRatio: .2,
  falseEcho: Object.freeze({ minGap: 45, maxGap: 90, quietContactSeconds: 15, seconds: 1.2,
    minDistance: 300, maxDistance: 600, revealDistance: 160, revealWindow: 8 }),
  falseEchoSources: Object.freeze(['ventilation', 'porte', 'machine'])
});

const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
const finite = (n, fallback = 0) => Number.isFinite(n) ? n : fallback;

export function createTensionStateV188(register = 'tension') {
  return { schema: 188, register, intensity: 0, phase: 'build', relaxRemaining: 0, peaks: 0 };
}

/** Pure step. Inputs: damage taken this step, enemies within the threat radius,
 * low ammunition flag, real contact flag. Returns the possibly changed phase. */
export function advanceTensionV188(state, { damage = 0, nearby = 0, lowAmmo = false } = {}, delta = 0) {
  const limits = TENSION_DIRECTOR_V188, profile = missionRegisterProfileV188(state.register);
  const dt = clamp(finite(delta), 0, .25);
  const rise = Math.max(0, finite(damage)) * limits.damageWeight
    + Math.min(limits.nearbyCapPerSecond, Math.max(0, finite(nearby)) * limits.nearbyPerEnemySecond) * dt
    + (lowAmmo ? limits.lowAmmoPerSecond * dt : 0);
  const fall = nearby > 0 || damage > 0 ? 0 : limits.decayPerSecond * dt;
  state.intensity = clamp(state.intensity + rise - fall, 0, 100);
  const previous = state.phase;
  if (state.phase === 'build' && state.intensity >= limits.peakAt) { state.phase = 'peak'; state.peaks++; }
  else if (state.phase === 'peak' && state.intensity < limits.relaxBelow) { state.phase = 'relax'; state.relaxRemaining = profile.relaxSeconds; }
  else if (state.phase === 'relax') {
    state.relaxRemaining = Math.max(0, state.relaxRemaining - dt);
    if (state.relaxRemaining === 0) state.phase = 'build';
  }
  return previous !== state.phase ? state.phase : null;
}

export function tensionAllowsSpawnV188(state) {
  const profile = missionRegisterProfileV188(state?.register);
  return profile.spawnMultiplier > 0 && state?.phase === 'build';
}

// Small deterministic generator so a mission replays the same false echoes.
export function seededRandomV188(seed) {
  let value = (Number(seed) >>> 0) || 0x9e3779b9;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function scheduleFalseEchoV188(now, random) {
  const { minGap, maxGap } = TENSION_DIRECTOR_V188.falseEcho;
  return now + minGap + (maxGap - minGap) * random();
}

export function withTensionDirectorV188(Base) {
  if (Base.tensionDirectorRuntimeV188) return Base;
  return class TensionDirectorV188 extends Base {
    static tensionDirectorRuntimeV188 = true;
    start(options = {}) {
      const campaign = options.campaign || options.missionPlan?.campaign || null;
      this.missionRegisterV188 = resolveMissionRegisterV188(campaign || options.campaignId);
      this.tensionV188 = createTensionStateV188(this.missionRegisterV188);
      this.lastDamageAtV188 = -Infinity; this.pendingDamageV188 = 0; this.lastRealContactAtV188 = 0;
      this.terminalSaveV188 = null; this.falseEchoV188 = null;
      const seed = String(campaign?.id || options.campaignId || '') + ':' + String(options.levelSeedId || options.seed || '');
      let hash = 2166136261; for (const char of seed) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
      this.falseEchoRandomV188 = seededRandomV188(hash >>> 0);
      this.nextFalseEchoAtV188 = scheduleFalseEchoV188(0, this.falseEchoRandomV188);
      return super.start(options);
    }
    missionElapsedV188() { return finite(this.mission?.elapsed); }
    damagePlayer(player, amount, options = {}) {
      const before = finite(player?.health);
      const result = super.damagePlayer(player, amount, options);
      const lost = before - finite(player?.health, before);
      if (player && player === this.player && lost > 0) { this.pendingDamageV188 += lost; this.lastDamageAtV188 = this.missionElapsedV188(); }
      if (lost > 0 && this.terminalSaveV188) this.cancelTerminalSaveV188('Sauvegarde interrompue : vous êtes attaqué.');
      return result;
    }
    // Horde waves wait for the build phase; a forbidden wave is retried in 2 s.
    beginHordeWarningV132() {
      if (this.tensionV188 && !tensionAllowsSpawnV188(this.tensionV188)) {
        const state = this.hordeDirectorV132; if (state) state.nextWave = state.elapsed + 2;
        return false;
      }
      return super.beginHordeWarningV132();
    }
    lowAmmoV188() {
      const actor = this.player; if (!actor) return false;
      const size = Math.max(1, finite(actor.magazineSize, 1));
      return finite(actor.ammo, size) / size < TENSION_DIRECTOR_V188.lowAmmoRatio
        && finite(actor.ammoReserve, size) < size * TENSION_DIRECTOR_V188.lowAmmoRatio;
    }
    update(delta) {
      const before = this.missionElapsedV188(), result = super.update(delta);
      const now = this.missionElapsedV188();
      if (!this.tensionV188 || !this.running || this.paused || this.mission?.state !== 'active' || !(now > before)) return result;
      const step = now - before;
      const threat = measureThreatV188(this.enemies, this.player);
      if (threat.near > 0 || threat.alerted > 0) this.lastRealContactAtV188 = now;
      const changed = advanceTensionV188(this.tensionV188, { damage: this.pendingDamageV188, nearby: threat.near, lowAmmo: this.lowAmmoV188() }, step);
      this.pendingDamageV188 = 0;
      if (changed) this.onEvent?.({ type: 'tension-phase-v188', phase: changed, register: this.missionRegisterV188,
        intensity: Math.round(this.tensionV188.intensity) });
      this.advanceTerminalSaveV188(step);
      this.advanceFalseEchoV188(now);
      return result;
    }
    // —— Motion tracker false echoes (horror / tension only) ——
    advanceFalseEchoV188(now) {
      const profile = missionRegisterProfileV188(this.missionRegisterV188), rules = TENSION_DIRECTOR_V188.falseEcho;
      const echo = this.falseEchoV188;
      if (echo) {
        if (!echo.revealed && this.player) {
          const px = finite(this.player.x) + finite(this.player.w) / 2, py = finite(this.player.y) + finite(this.player.h);
          if (now - echo.startedAt <= rules.revealWindow && Math.hypot(echo.x - px, echo.y - py) < rules.revealDistance) {
            echo.revealed = true; this.pushCaption?.('environment', `Écho : ${echo.source}.`);
            this.onEvent?.({ type: 'false-echo-revealed-v188', source: echo.source });
          }
        }
        if (now - echo.startedAt > rules.revealWindow) this.falseEchoV188 = null;
      }
      if (!profile.falseEchoes || this.falseEchoV188 || now < this.nextFalseEchoAtV188) return;
      if (now - this.lastRealContactAtV188 < rules.quietContactSeconds || !this.player) {
        this.nextFalseEchoAtV188 = now + 5; return;
      }
      const random = this.falseEchoRandomV188, sources = TENSION_DIRECTOR_V188.falseEchoSources;
      const direction = random() < .5 ? -1 : 1, distance = rules.minDistance + (rules.maxDistance - rules.minDistance) * random();
      const px = finite(this.player.x) + finite(this.player.w) / 2;
      this.falseEchoV188 = { id: `false-echo-v188-${Math.round(now * 10)}`, x: px + direction * distance,
        y: finite(this.player.y) + finite(this.player.h), startedAt: now,
        source: sources[Math.floor(random() * sources.length) % sources.length], revealed: false };
      this.nextFalseEchoAtV188 = scheduleFalseEchoV188(now, random);
      this.onEvent?.({ type: 'false-echo-v188', source: this.falseEchoV188.source });
    }
    motionTrackerSnapshotV160() {
      const model = super.motionTrackerSnapshotV160();
      const echo = this.falseEchoV188, rules = TENSION_DIRECTOR_V188.falseEcho;
      if (!model?.active || !echo || !this.player) return model;
      const age = this.missionElapsedV188() - echo.startedAt;
      if (age < 0 || age > rules.seconds) return model;
      const ox = finite(this.player.x) + finite(this.player.w) / 2, oy = finite(this.player.y) + finite(this.player.h);
      const dx = (echo.x - ox) * model.heading, dy = echo.y - oy, distance = Math.hypot(dx, dy);
      if (distance > model.range) return model;
      const contact = { id: echo.id, serial: 0, distance, dx, dy, depth: 0, bearing: Math.atan2(dy, dx),
        sector: dx < 0 ? 'rear' : 'front', age, x: echo.x, y: echo.y, alpha: clamp(1 - age / rules.seconds, 0, 1),
        currentMotion: true, concealed: false, sampledAt: echo.startedAt, falseEchoV188: true };
      const contacts = [...model.contacts, contact].sort((a, b) => a.distance - b.distance);
      return { ...model, contacts, nearestDistance: contacts[0].distance, currentMovement: true };
    }
    // —— Register-aware saves ——
    missionSavePolicyV188() {
      return evaluateFreeSaveV188({ register: this.missionRegisterV188, enemies: this.enemies, player: this.player,
        secondsSinceDamage: this.missionElapsedV188() - this.lastDamageAtV188 });
    }
    beginTerminalSaveV188() {
      const verdict = evaluateTerminalSaveV188({ register: this.missionRegisterV188, enemies: this.enemies,
        player: this.player, terminal: this.checkpoint });
      if (!verdict.allowed) return verdict;
      this.terminalSaveV188 = { remaining: SAVE_RULES_V188.terminalSeconds, total: SAVE_RULES_V188.terminalSeconds };
      this.pushCaption?.('mission', 'Terminal : sauvegarde en cours…');
      return verdict;
    }
    cancelTerminalSaveV188(message) {
      this.terminalSaveV188 = null;
      if (message) this.pushCaption?.('danger', message);
      this.onEvent?.({ type: 'terminal-save-cancelled-v188' });
    }
    advanceTerminalSaveV188(step) {
      const save = this.terminalSaveV188; if (!save) return;
      const threat = measureThreatV188(this.enemies, this.player);
      if (threat.near > 0 || threat.alerted > 0) return this.cancelTerminalSaveV188('Sauvegarde interrompue : menace à proximité.');
      save.remaining = Math.max(0, save.remaining - step);
      if (save.remaining === 0) { this.terminalSaveV188 = null; this.onEvent?.({ type: 'terminal-save-v188' }); }
    }
    // Placeholder save terminal at the secured checkpoint (Canvas primitives,
    // no bitmap): drawn in world space with the other mission objects.
    saveTerminalVisibleV188() {
      return Boolean(this.checkpoint && Number.isFinite(this.checkpoint.x) && Number.isFinite(this.checkpoint.y)
        && missionRegisterProfileV188(this.missionRegisterV188).save.terminal);
    }
    drawObjective(ctx) {
      super.drawObjective(ctx);
      if (!ctx || !this.saveTerminalVisibleV188()) return;
      const x = this.checkpoint.x, foot = this.checkpoint.y + finite(this.player?.h, 80), saving = Boolean(this.terminalSaveV188);
      const px = finite(this.player?.x) + finite(this.player?.w) / 2;
      const inReach = Math.hypot(px - x, finite(this.player?.y) - this.checkpoint.y) <= SAVE_RULES_V188.terminalReach;
      ctx.save();
      ctx.fillStyle = '#1c2622'; ctx.fillRect(x - 14, foot - 58, 28, 58);
      ctx.fillStyle = '#2e3b35'; ctx.fillRect(x - 18, foot - 62, 36, 8);
      const pulse = .55 + .45 * Math.sin(finite(this.animationTime) * (saving ? 9 : 3));
      ctx.fillStyle = saving ? `rgba(233,208,122,${pulse})` : `rgba(141,240,176,${pulse})`; ctx.fillRect(x - 10, foot - 50, 20, 14);
      ctx.fillStyle = '#0a110e'; ctx.fillRect(x - 8, foot - 30, 16, 3); ctx.fillRect(x - 8, foot - 24, 16, 3);
      if (inReach) { ctx.font = '11px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#8df0b0';
        ctx.fillText(saving ? 'SAUVEGARDE…' : 'TERMINAL · SAUVEGARDER', x, foot - 70); }
      ctx.restore();
    }
    drawHud(ctx) {
      super.drawHud(ctx);
      const save = this.terminalSaveV188; if (!save || !ctx) return;
      const width = 220, x = 24, y = 120, ratio = 1 - save.remaining / save.total;
      ctx.save(); ctx.fillStyle = 'rgba(4,10,8,.82)'; ctx.fillRect(x, y, width, 26);
      ctx.fillStyle = '#8df0b0'; ctx.fillRect(x + 3, y + 18, (width - 6) * ratio, 5);
      ctx.font = '11px monospace'; ctx.fillText('TERMINAL · SAUVEGARDE', x + 6, y + 13); ctx.restore();
    }
    getSnapshot() {
      return { ...super.getSnapshot(), tensionV188: this.tensionV188 ? { ...this.tensionV188 } : null,
        missionRegisterV188: this.missionRegisterV188 || null };
    }
  };
}
