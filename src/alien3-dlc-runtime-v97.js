import {
  ALIEN3_CAMPAIGN_ID_V97,
  ALIEN3_DEPTH_LANES_V97,
  ALIEN3_DLC_CODEX_BATCHES_V97,
  ALIEN3_DLC_CODEX_TERMINALS_V97,
  ALIEN3_DLC_CODEX_V97,
  ALIEN3_DLC_SCHEMA_V97,
  ALIEN3_HYBRID_SECTORS_V97,
  ALIEN3_V97_EVIDENCE_IDS,
  alien3DepthLaneV97,
  alien3DlcCodexBatchV97,
  alien3DlcCodexEntryV97,
  alien3HybridSectorV97,
  alien3V97Grade,
  createAlien3StateV97,
  sanitizeAlien3StateV97
} from './alien3-dlc-v97.js';

const INTERACT_RANGE = 188;
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const isRecord = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const center = (entity = {}) => ({ x: (Number(entity.x) || 0) + (Number(entity.w) || 0) / 2, y: (Number(entity.y) || 0) + (Number(entity.h) || 0) / 2 });
const distance = (a, b) => { if (!a || !b) return Infinity; const x = center(a); const y = center(b); return Math.hypot(x.x - y.x, x.y - y.y); };
const runnerSource = (source) => /runner|dragon|xenomorph/i.test(String(source || ''));

export const ALIEN3_PERSISTENT_EVENT_TYPES_V97 = Object.freeze(new Set([
  'alien3-v97-hybrid', 'alien3-v97-lane', 'alien3-v97-codex', 'alien3-v97-runner-depth',
  'alien3-v97-achievement', 'alien3-v97-perfect'
]));

const TERMINAL_EVIDENCE = Object.freeze({
  'a3c-terminal-eev': 'codex-arrival',
  'a3c-terminal-prison': 'codex-prison',
  'a3c-terminal-service': 'codex-hunt',
  'a3c-terminal-foundry': 'codex-foundry',
  'a3c-terminal-patna': 'codex-finale'
});

function wrapLines(text, max = 82) {
  const words = String(text || '').split(/\s+/).filter(Boolean); const lines = []; let line = '';
  for (const word of words) {
    if (!line) { line = word; continue; }
    if ((line.length + 1 + word.length) <= max) line += ` ${word}`;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line); return lines;
}

export function withAlien3DlcRuntimeV97(BaseEngine) {
  return class Alien3DlcRuntimeV97 extends BaseEngine {
    start(options = {}) {
      this.alien3ActiveV97 = String(options.campaign?.id || '') === ALIEN3_CAMPAIGN_ID_V97;
      this.alien3V97 = this.alien3ActiveV97 ? createAlien3StateV97() : null;
      this.pendingAlien3ResumeV97 = null;
      this.alien3CodexTerminalsV97 = [];
      this.bindAlien3CodexInputV97();
      const snapshot = super.start(options);
      if (!this.isAlien3MissionV97()) return snapshot;
      if (this.pendingAlien3ResumeV97) this.alien3V97 = sanitizeAlien3StateV97(this.pendingAlien3ResumeV97);
      this.configureAlien3WorldV97();
      return { ...snapshot, ...this.getAlien3SnapshotV97() };
    }

    isAlien3MissionV97() { return Boolean(this.alien3ActiveV97 || this.isAlien3MissionV96?.()); }

    bindAlien3CodexInputV97() {
      if (this.alien3CodexInputBoundV97 || !globalThis.addEventListener) return;
      this.alien3CodexInputBoundV97 = true;
      globalThis.addEventListener('keydown', (event) => {
        if (!this.running || !this.isAlien3MissionV97() || this.paused || this.mission?.state !== 'active') return;
        if (event.code !== 'KeyC' || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
        if (typeof this.canRouteGameplayKey === 'function' && !this.canRouteGameplayKey(event)) return;
        event.preventDefault?.();
        this.cycleAlien3DlcCodexV97(event.shiftKey ? -1 : 1);
      });
    }

    configureAlien3WorldV97() {
      this.alien3V97 ||= createAlien3StateV97();
      this.alien3CodexTerminalsV97 = ALIEN3_DLC_CODEX_TERMINALS_V97.map((entry) => ({ ...entry }));
      this.unlockAlien3DlcCodexV97(ALIEN3_DLC_CODEX_V97.slice(0, 6).map((entry) => entry.id), { silent: true });
      this.recoverAlien3EvidenceV97('hybrid-runtime-ready', { silent: true });
      this.syncAlien3HybridSectorV97(0, true);
      this.onEvent({ type: 'alien3-v97-hybrid', action: 'runtime-ready', sectors: ALIEN3_HYBRID_SECTORS_V97.length, lanes: ALIEN3_DEPTH_LANES_V97.length, dedicatedCodex: ALIEN3_DLC_CODEX_V97.length });
      return this.alien3V97;
    }

    alien3CodexTerminalV97(id) { return this.alien3CodexTerminalsV97.find((entry) => entry.id === id) || null; }

    unlockAlien3DlcCodexV97(ids = [], { silent = false } = {}) {
      const state = this.alien3V97; if (!state) return [];
      const unlocked = [];
      for (const id of ids) {
        if (!alien3DlcCodexEntryV97(id) || state.dlcCodex.unlocked.includes(id)) continue;
        state.dlcCodex.unlocked.push(id); unlocked.push(id); state.telemetry.codexUnlocks += 1;
        if (!silent) this.onEvent({ type: 'alien3-v97-codex', action: 'unlocked', codexId: id, total: state.dlcCodex.unlocked.length });
      }
      const ratio = state.dlcCodex.unlocked.length / ALIEN3_DLC_CODEX_V97.length;
      if (ratio >= 0.25) this.recoverAlien3EvidenceV97('codex-quarter', { silent: true });
      if (ratio >= 0.50) this.recoverAlien3EvidenceV97('codex-half', { silent: true });
      if (state.dlcCodex.unlocked.length === ALIEN3_DLC_CODEX_V97.length) {
        state.dlcCodex.complete = true; this.recoverAlien3EvidenceV97('codex-complete', { silent: true });
      }
      return unlocked;
    }

    recoverAlien3EvidenceV97(id, { silent = false } = {}) {
      const state = this.alien3V97;
      if (!state || !ALIEN3_V97_EVIDENCE_IDS.includes(id) || state.evidenceRecovered.includes(id)) return false;
      state.evidenceRecovered.push(id);
      if (!silent) {
        this.onEvent({ type: 'alien3-v97-hybrid', action: 'evidence', evidenceId: id, total: state.evidenceRecovered.length });
        this.onEvent({ type: 'objective-action', action: `alien3-v97:evidence:${id}` });
      }
      return true;
    }

    cycleAlien3DlcCodexV97(direction = 1, preferredId = null) {
      const state = this.alien3V97; if (!state || !state.dlcCodex.unlocked.length) return false;
      const entries = state.dlcCodex.unlocked.map(alien3DlcCodexEntryV97).filter(Boolean);
      if (!entries.length) return false;
      let index = preferredId ? entries.findIndex((entry) => entry.id === preferredId) : entries.findIndex((entry) => entry.id === state.dlcCodex.currentId);
      if (index < 0) index = direction < 0 ? 0 : -1;
      const next = preferredId && entries[index] ? entries[index] : entries[(index + (direction < 0 ? -1 : 1) + entries.length) % entries.length];
      state.dlcCodex.currentId = next.id; state.dlcCodex.category = next.category; state.dlcCodex.openClock = 12; state.dlcCodex.pagesOpened += 1;
      if (!state.dlcCodex.viewed.includes(next.id)) state.dlcCodex.viewed.push(next.id);
      this.audio?.ui?.();
      this.onEvent({ type: 'alien3-v97-codex', action: 'opened', codexId: next.id, category: next.category, viewed: state.dlcCodex.viewed.length });
      return true;
    }

    readAlien3CodexTerminalV97(terminal) {
      const state = this.alien3V97; if (!state || !terminal) return false;
      const batch = alien3DlcCodexBatchV97(terminal.batch); const newIds = this.unlockAlien3DlcCodexV97(batch);
      if (!state.dlcCodex.terminalsRead.includes(terminal.id)) state.dlcCodex.terminalsRead.push(terminal.id);
      state.dlcCodex.lastTerminalId = terminal.id; state.telemetry.codexTerminalUses += 1;
      const evidenceId = TERMINAL_EVIDENCE[terminal.id]; if (evidenceId) this.recoverAlien3EvidenceV97(evidenceId);
      const firstUnread = batch.find((id) => !state.dlcCodex.viewed.includes(id)) || newIds[0] || batch[0];
      if (firstUnread) this.cycleAlien3DlcCodexV97(1, firstUnread);
      this.onEvent({ type: 'alien3-v97-codex', action: 'terminal', terminalId: terminal.id, batch: terminal.batch, unlocked: newIds.length });
      this.updateAlien3PerfectV97();
      return true;
    }

    currentAlien3HybridSectorV97() { return alien3HybridSectorV97(center(this.player).x); }
    currentAlien3DepthLaneV97() { return alien3DepthLaneV97(this.alien3V97?.hybrid?.playerLane ?? 1); }

    syncAlien3HybridSectorV97(seconds = 0, initial = false) {
      const state = this.alien3V97; if (!state || !this.player) return null;
      const sector = this.currentAlien3HybridSectorV97(); const previous = state.hybrid.currentSectorId;
      if (!state.hybrid.visitedSectors.includes(sector.id)) state.hybrid.visitedSectors.push(sector.id);
      if (previous !== sector.id || initial) {
        const previousMode = state.hybrid.mode;
        state.hybrid.currentSectorId = sector.id; state.hybrid.mode = sector.mode; state.hybrid.transitionClock = initial ? 1.2 : 1.0;
        state.hybrid.lastTransitionReason = sector.reason;
        if (!initial) { state.hybrid.transitions += 1; state.telemetry.autoTransitions += 1; this.recoverAlien3EvidenceV97('automatic-view-transition', { silent: true }); }
        if (sector.mode === 'side') {
          state.hybrid.playerLane = 1; state.hybrid.runnerLane = 1;
          if (previousMode !== 'side' || initial) { state.telemetry.sideEntries += 1; this.recoverAlien3EvidenceV97('side-view-entered', { silent: true }); }
        } else {
          if (previousMode !== 'depth' || initial) { state.telemetry.depthEntries += 1; this.recoverAlien3EvidenceV97('depth-view-entered', { silent: true }); }
          state.hybrid.playerLane = Math.round(clamp(state.hybrid.playerLane ?? sector.defaultLane, 0, 2));
        }
        this.onEvent({ type: 'alien3-v97-hybrid', action: 'view-transition', sectorId: sector.id, mode: sector.mode, reason: sector.reason, automatic: !initial });
      }
      if (sector.mode === 'depth') state.hybrid.depthSeconds += Math.max(0, seconds);
      else state.hybrid.sideSeconds += Math.max(0, seconds);
      if (state.hybrid.visitedSectors.length === ALIEN3_HYBRID_SECTORS_V97.length) this.recoverAlien3EvidenceV97('all-hybrid-sectors', { silent: true });
      if (state.hybrid.depthSeconds >= 8 && state.hybrid.sideSeconds >= 8) this.recoverAlien3EvidenceV97('balanced-hybrid-time', { silent: true });
      state.hybrid.transitionClock = Math.max(0, state.hybrid.transitionClock - Math.max(0, seconds));
      state.dlcCodex.openClock = Math.max(0, state.dlcCodex.openClock - Math.max(0, seconds));
      return sector;
    }

    shiftAlien3DepthLaneV97(direction = 0, actor = this.player) {
      const state = this.alien3V97; if (!state || state.hybrid.mode !== 'depth' || actor !== this.player || !direction) return false;
      const previous = state.hybrid.playerLane; const next = Math.round(clamp(previous + Math.sign(direction), 0, 2));
      if (next === previous) return false;
      state.hybrid.playerLane = next; state.hybrid.laneChanges += 1; state.telemetry.laneShifts += 1; actor.hybridDepthLaneV97 = next;
      const lane = alien3DepthLaneV97(next);
      this.recoverAlien3EvidenceV97(next === 0 ? 'lane-rear-used' : next === 1 ? 'lane-mid-used' : 'lane-front-used', { silent: true });
      this.onEvent({ type: 'alien3-v97-lane', action: 'player-shift', lane: lane.id, index: next });
      this.audio?.tone?.(next < previous ? 380 : 260, 0.045, 'triangle', 0.035, next < previous ? 60 : -40);
      return true;
    }

    updatePlayer(player, delta, controls) {
      if (!this.isAlien3MissionV97() || !this.alien3V97 || player !== this.player || this.alien3V97.hybrid.mode !== 'depth') return super.updatePlayer(player, delta, controls);
      const upCodes = [...new Set([controls.up, 'ArrowUp'].filter(Boolean))]; const downCodes = [...new Set([controls.down, 'ArrowDown'].filter(Boolean))];
      const up = upCodes.some((code) => this.keys?.has?.(code)); const down = downCodes.some((code) => this.keys?.has?.(code));
      const dir = up && !down ? -1 : down && !up ? 1 : 0;
      if (dir === 0) this.alien3V97.hybrid.laneInputLatch = 0;
      else if (this.alien3V97.hybrid.laneInputLatch !== dir) {
        this.alien3V97.hybrid.laneInputLatch = dir; this.shiftAlien3DepthLaneV97(dir, player);
      }
      const removed = [];
      for (const code of [...upCodes, ...downCodes]) if (this.keys?.has?.(code)) { this.keys.delete(code); removed.push(code); }
      try { return super.updatePlayer(player, delta, controls); }
      finally {
        for (const code of removed) this.keys.add(code);
        player.crouching = false; player.hybridDepthLaneV97 = this.alien3V97.hybrid.playerLane;
      }
    }

    updateAlien3RunnerDepthV97(seconds = 0.016) {
      const state = this.alien3V97; const runner = this.alien3RunnerV88;
      if (!state || !runner?.alive || this.alien3V88?.runnerDefeated) return;
      runner.hybridDepthLaneV97 = state.hybrid.runnerLane;
      if (state.hybrid.mode !== 'depth') { state.hybrid.runnerLane = 1; runner.hybridDepthLaneV97 = 1; return; }
      state.hybrid.runnerLaneClock = Math.max(0, state.hybrid.runnerLaneClock - seconds);
      const dx = Math.abs(center(runner).x - center(this.player).x);
      if (state.hybrid.runnerLaneClock <= 0) {
        const previous = state.hybrid.runnerLane;
        const huntHeat = Number(this.alien3V91?.hunter?.heat) || 0;
        let next = previous;
        if (dx < 620 || huntHeat >= 58) next = state.hybrid.playerLane;
        else next = (previous + 1 + (state.telemetry.runnerLaneShifts % 2)) % 3;
        if (next !== previous) {
          state.hybrid.runnerLane = next; runner.hybridDepthLaneV97 = next; state.telemetry.runnerLaneShifts += 1; state.hybrid.runnerLaneTelegraph = 0.45;
          this.onEvent({ type: 'alien3-v97-runner-depth', action: 'lane-shift', from: previous, to: next, range: Math.round(dx) });
        }
        state.hybrid.runnerLaneClock = dx < 620 ? 1.15 : 1.75;
      }
      state.hybrid.runnerLaneTelegraph = Math.max(0, state.hybrid.runnerLaneTelegraph - seconds);
      if (dx < 430 && state.hybrid.runnerLane === state.hybrid.playerLane) this.recoverAlien3EvidenceV97('runner-lane-contact', { silent: true });
    }

    damagePlayer(actor, amount, options = {}) {
      if (this.isAlien3MissionV97() && this.alien3V97?.hybrid?.mode === 'depth' && actor === this.player && runnerSource(options?.source)) {
        if (this.alien3V97.hybrid.runnerLane !== this.alien3V97.hybrid.playerLane) {
          this.alien3V97.hybrid.laneEvades += 1; this.recoverAlien3EvidenceV97('runner-lane-evasion');
          this.onEvent({ type: 'alien3-v97-runner-depth', action: 'lane-evade', playerLane: this.alien3V97.hybrid.playerLane, runnerLane: this.alien3V97.hybrid.runnerLane });
          return 0;
        }
        this.alien3V97.hybrid.laneContacts += 1; this.recoverAlien3EvidenceV97('runner-lane-contact', { silent: true });
      }
      return super.damagePlayer(actor, amount, options);
    }

    alien3NearestCodexTerminalV97(actor = this.player) {
      if (!actor || !this.alien3V97) return null;
      return this.alien3CodexTerminalsV97.map((terminal) => ({ terminal, range: distance(actor, terminal) }))
        .filter(({ terminal, range }) => range <= INTERACT_RANGE && (this.alien3V97.hybrid.mode !== 'depth' || terminal.lane === this.alien3V97.hybrid.playerLane))
        .sort((a, b) => a.range - b.range)[0]?.terminal || null;
    }

    interact(actor = this.player) {
      if (!this.isAlien3MissionV97() || !this.alien3V97) return super.interact(actor);
      const terminal = this.alien3NearestCodexTerminalV97(actor);
      if (terminal) return this.readAlien3CodexTerminalV97(terminal);
      return super.interact(actor);
    }

    activateTracker(actor = this.player) {
      if (this.isAlien3MissionV97() && this.alien3V97 && (this.keys?.has?.('ShiftLeft') || this.keys?.has?.('ShiftRight'))) return this.cycleAlien3DlcCodexV97(1);
      return super.activateTracker(actor);
    }

    updateAlien3PerfectV97() {
      const state = this.alien3V97; if (!state) return;
      state.perfectArchive.inheritedV96 = Boolean(this.alien3V96?.perfectArchive?.perfect);
      state.perfectArchive.sectorsComplete = state.hybrid.visitedSectors.length === ALIEN3_HYBRID_SECTORS_V97.length;
      state.perfectArchive.lanesComplete = ['lane-rear-used', 'lane-mid-used', 'lane-front-used'].every((id) => state.evidenceRecovered.includes(id));
      state.perfectArchive.balanceComplete = state.hybrid.depthSeconds >= 8 && state.hybrid.sideSeconds >= 8;
      state.perfectArchive.codexComplete = state.dlcCodex.unlocked.length === ALIEN3_DLC_CODEX_V97.length;
      state.perfectArchive.runnerDepthComplete = state.hybrid.laneEvades > 0 && state.evidenceRecovered.includes('runner-lane-contact');
      const required = ALIEN3_V97_EVIDENCE_IDS.filter((id) => id !== 'perfect-hybrid-archive');
      const ready = Object.entries(state.perfectArchive).filter(([key]) => key !== 'perfect').every(([, value]) => value === true)
        && required.every((id) => state.evidenceRecovered.includes(id));
      if (!state.perfectArchive.perfect && ready) {
        state.perfectArchive.perfect = true; this.recoverAlien3EvidenceV97('perfect-hybrid-archive');
        this.onEvent({ type: 'alien3-v97-perfect', evidence: state.evidenceRecovered.length, codex: state.dlcCodex.unlocked.length });
      }
    }

    update(delta) {
      const result = super.update(delta);
      if (!this.isAlien3MissionV97() || !this.alien3V97 || this.mission?.state !== 'active') return result;
      const seconds = clamp(delta, 0, 0.25);
      this.syncAlien3HybridSectorV97(seconds);
      this.updateAlien3RunnerDepthV97(seconds);
      if (this.alien3V97.hybrid.mode === 'depth' && this.camera) {
        const lane = alien3DepthLaneV97(this.alien3V97.hybrid.playerLane);
        this.camera.y += (lane.renderYOffset * 0.12 - 0) * Math.min(1, seconds * 4);
      }
      this.updateAlien3PerfectV97();
      return result;
    }

    computeAlien3AchievementsV97() {
      const state = this.alien3V97; if (!state) return [];
      const ids = [];
      if (state.hybrid.visitedSectors.length === 9) ids.push('v97-nine-hybrid-sectors');
      if (['lane-rear-used', 'lane-mid-used', 'lane-front-used'].every((id) => state.evidenceRecovered.includes(id))) ids.push('v97-three-depth-planes');
      if (state.hybrid.laneEvades >= 3) ids.push('v97-depth-dodger');
      if (state.dlcCodex.terminalsRead.length === 5) ids.push('v97-five-codex-terminals');
      if (state.dlcCodex.unlocked.length === ALIEN3_DLC_CODEX_V97.length) ids.push('v97-dedicated-codex-complete');
      if (state.hybrid.depthSeconds >= 20 && state.hybrid.sideSeconds >= 20) ids.push('v97-hybrid-master');
      if (state.perfectArchive.perfect) ids.push('v97-hybrid-perfect');
      return [...new Set(ids)];
    }

    completeAlien3MissionV89(actor = this.player) {
      if (!this.isAlien3MissionV97() || !this.alien3V97) return super.completeAlien3MissionV89(actor);
      const emit = this.onEvent; let completionEvent = null;
      this.onEvent = (event) => { if (event?.type === 'mission-complete') { completionEvent = event; return; } emit(event); };
      let completed = false;
      try { completed = super.completeAlien3MissionV89(actor); } finally { this.onEvent = emit; }
      if (!completed) return false;
      this.updateAlien3PerfectV97();
      const state = this.alien3V97; state.achievementIds = this.computeAlien3AchievementsV97();
      const baseRewards = isRecord(this.mission.rewards) ? this.mission.rewards : {};
      const lanes = ['lane-rear-used', 'lane-mid-used', 'lane-front-used'].filter((id) => state.evidenceRecovered.includes(id)).length;
      const grade = alien3V97Grade({
        gradeV96: baseRewards.mireGradeV96 || 'D', evidence: state.evidenceRecovered.length, sectors: state.hybrid.visitedSectors.length,
        lanes, codex: state.dlcCodex.unlocked.length, transitions: state.hybrid.transitions, laneEvades: state.hybrid.laneEvades,
        balanced: state.hybrid.depthSeconds >= 8 && state.hybrid.sideSeconds >= 8, perfect: state.perfectArchive.perfect
      });
      const gradeBonus = { 'S++++++++': 2280, 'S+++++++': 1980, 'S++++++': 1710, 'S+++++': 1460, 'S++++': 1220, 'S+++': 980, 'S++': 760, 'S+': 560, S: 390, A: 260, B: 140, C: 60, D: 0 }[grade] || 0;
      this.mission.rewards = {
        ...baseRewards,
        credits: (Number(baseRewards.credits) || 0) + 340 + gradeBonus,
        alien3V97: true, mireGradeV97: grade,
        v97EvidenceRecovered: [...state.evidenceRecovered], v97Achievements: [...state.achievementIds],
        hybridViewV97: { sectors: [...state.hybrid.visitedSectors], transitions: state.hybrid.transitions, laneChanges: state.hybrid.laneChanges, laneEvades: state.hybrid.laneEvades, depthSeconds: Math.round(state.hybrid.depthSeconds), sideSeconds: Math.round(state.hybrid.sideSeconds) },
        dedicatedCodexV97: { unlocked: [...state.dlcCodex.unlocked], viewed: [...state.dlcCodex.viewed], terminalsRead: [...state.dlcCodex.terminalsRead], complete: state.dlcCodex.complete },
        perfectArchiveV97: { ...state.perfectArchive }
      };
      for (const achievementId of state.achievementIds) emit({ type: 'alien3-v97-achievement', achievementId });
      emit(completionEvent ? { ...completionEvent, rewards: this.mission.rewards }
        : { type: 'mission-complete', kills: Number(this.player?.kills) || 0, rewards: this.mission.rewards, extractedBy: 'primary' });
      return true;
    }

    getInteractionPrompt(actor = this.player) {
      if (!this.isAlien3MissionV97() || !this.alien3V97) return super.getInteractionPrompt(actor);
      const terminal = this.alien3NearestCodexTerminalV97(actor);
      if (terminal) return `E  ${terminal.label}`;
      if (this.alien3V97.hybrid.mode === 'depth') {
        const lane = alien3DepthLaneV97(this.alien3V97.hybrid.playerLane);
        return `PROFONDEUR · ${lane.label} · W/S OU ↑/↓ POUR CHANGER DE PLAN · C CODEX`;
      }
      return super.getInteractionPrompt(actor);
    }

    applyAlien3DepthTransformV97(ctx, entity, laneIndex, draw) {
      const lane = alien3DepthLaneV97(laneIndex); const c = center(entity); const baseline = (Number(entity.y) || 0) + (Number(entity.h) || 0);
      ctx.save(); ctx.translate(c.x, baseline + lane.renderYOffset); ctx.scale(lane.renderScale, lane.renderScale); ctx.translate(-c.x, -baseline);
      try { draw(); } finally { ctx.restore(); }
    }

    drawActor(ctx, actor) {
      if (!this.isAlien3MissionV97() || !this.alien3V97 || this.alien3V97.hybrid.mode !== 'depth' || actor !== this.player) return super.drawActor(ctx, actor);
      return this.applyAlien3DepthTransformV97(ctx, actor, this.alien3V97.hybrid.playerLane, () => super.drawActor(ctx, actor));
    }

    drawEnemy(ctx, enemy) {
      if (!this.isAlien3MissionV97() || !this.alien3V97 || this.alien3V97.hybrid.mode !== 'depth' || enemy !== this.alien3RunnerV88) return super.drawEnemy(ctx, enemy);
      return this.applyAlien3DepthTransformV97(ctx, enemy, this.alien3V97.hybrid.runnerLane, () => super.drawEnemy(ctx, enemy));
    }

    drawAlien3DepthUnderlayV97(ctx, sector) {
      if (!ctx || !sector || sector.mode !== 'depth') return;
      const x0 = sector.x0, x1 = sector.x1, width = x1 - x0; const floorY = 620; const vanishingY = 360;
      ctx.save();
      ctx.fillStyle = 'rgba(12,14,13,.22)'; ctx.fillRect(x0, 330, width, 330);
      for (const lane of ALIEN3_DEPTH_LANES_V97) {
        const y = 430 + lane.index * 76;
        ctx.fillStyle = lane.index === this.alien3V97.hybrid.playerLane ? 'rgba(122,137,103,.075)' : 'rgba(80,86,76,.035)';
        ctx.fillRect(x0, y - 32, width, 64);
        ctx.strokeStyle = lane.index === this.alien3V97.hybrid.playerLane ? 'rgba(170,184,146,.20)' : 'rgba(130,136,120,.09)';
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(112,120,105,.10)';
      for (let i = 0; i <= 8; i += 1) {
        const x = x0 + width * (i / 8); const target = x0 + width / 2 + (x - (x0 + width / 2)) * 0.25;
        ctx.beginPath(); ctx.moveTo(x, floorY); ctx.lineTo(target, vanishingY); ctx.stroke();
      }
      ctx.restore();
    }

    drawAlien3CodexTerminalV97(ctx, terminal) {
      ctx.save();
      const read = this.alien3V97.dlcCodex.terminalsRead.includes(terminal.id);
      ctx.fillStyle = read ? 'rgba(38,56,51,.92)' : 'rgba(37,43,38,.96)'; ctx.strokeStyle = read ? '#6e9786' : '#c1a76a'; ctx.lineWidth = 2;
      ctx.fillRect(terminal.x, terminal.y, terminal.w, terminal.h); ctx.strokeRect(terminal.x + 1, terminal.y + 1, terminal.w - 2, terminal.h - 2);
      ctx.fillStyle = read ? '#90b5a4' : '#d8c58c'; ctx.fillRect(terminal.x + 10, terminal.y + 10, terminal.w - 20, 9);
      ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(terminal.x + 14, terminal.y + 30, terminal.w - 28, 28);
      ctx.restore();
    }

    drawBackdrop(ctx) {
      super.drawBackdrop(ctx);
      if (!this.isAlien3MissionV97() || !this.alien3V97 || this.alien3V97.hybrid.mode !== 'depth' || !ctx) return;
      const lane = alien3DepthLaneV97(this.alien3V97.hybrid.playerLane); const shift = ((Number(this.camera?.x) || 0) * (0.02 + lane.index * 0.008)) % 120;
      ctx.save();
      const grad = ctx.createLinearGradient(0, 300, 0, 720); grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(24,29,24,.24)'); ctx.fillStyle = grad; ctx.fillRect(0, 260, 1280, 460);
      ctx.strokeStyle = 'rgba(155,163,139,.07)';
      for (let i = -2; i < 14; i += 1) { const x = i * 120 - shift; ctx.beginPath(); ctx.moveTo(640 + (x - 640) * 0.28, 350); ctx.lineTo(x, 720); ctx.stroke(); }
      ctx.restore();
    }

    drawWorld(ctx) {
      if (this.isAlien3MissionV97() && this.alien3V97 && ctx) this.drawAlien3DepthUnderlayV97(ctx, this.currentAlien3HybridSectorV97());
      super.drawWorld(ctx);
      if (!this.isAlien3MissionV97() || !this.alien3V97 || !ctx) return;
      for (const terminal of this.alien3CodexTerminalsV97) this.drawAlien3CodexTerminalV97(ctx, terminal);
    }

    drawAlien3DlcCodexOverlayV97(ctx) {
      const state = this.alien3V97; if (!state || state.dlcCodex.openClock <= 0) return;
      const entry = alien3DlcCodexEntryV97(state.dlcCodex.currentId); if (!entry) return;
      ctx.save();
      ctx.fillStyle = 'rgba(2,4,4,.95)'; ctx.fillRect(150, 112, 980, 390); ctx.strokeStyle = '#8b7a52'; ctx.lineWidth = 2; ctx.strokeRect(151, 113, 978, 388);
      ctx.fillStyle = '#d8c58c'; ctx.font = 'bold 16px monospace'; ctx.fillText('CODEX ALIEN 3 · FIORINA 161', 178, 146);
      ctx.fillStyle = '#738f83'; ctx.font = '11px monospace'; ctx.fillText(`${entry.category} · ${state.dlcCodex.unlocked.length}/${ALIEN3_DLC_CODEX_V97.length} DÉBLOQUÉS · ${state.dlcCodex.viewed.length} LUS · C SUIVANT · SHIFT+C PRÉCÉDENT`, 178, 170);
      ctx.fillStyle = '#e2d7ad'; ctx.font = 'bold 15px monospace'; ctx.fillText(entry.title, 178, 210);
      ctx.fillStyle = '#b8b9aa'; ctx.font = '12px monospace';
      const lines = wrapLines(entry.body, 104).slice(0, 9); lines.forEach((line, index) => ctx.fillText(line, 178, 244 + index * 22));
      ctx.fillStyle = '#6f786c'; ctx.font = '10px monospace'; ctx.fillText(`TERMINAUX ${state.dlcCodex.terminalsRead.length}/${ALIEN3_DLC_CODEX_TERMINALS_V97.length} · PAGE ${Math.max(1, state.dlcCodex.unlocked.indexOf(entry.id) + 1)}/${state.dlcCodex.unlocked.length}`, 178, 476);
      ctx.restore();
    }

    drawHud(ctx) {
      super.drawHud(ctx);
      if (!this.isAlien3MissionV97() || !this.alien3V97 || !ctx) return;
      const state = this.alien3V97; const sector = this.currentAlien3HybridSectorV97(); const lane = alien3DepthLaneV97(state.hybrid.playerLane);
      ctx.save(); ctx.fillStyle = 'rgba(3,4,4,.94)'; ctx.fillRect(18, 574, 520, 86); ctx.strokeStyle = sector.mode === 'depth' ? '#71836b' : '#826a52'; ctx.strokeRect(18.5, 574.5, 519, 85);
      ctx.font = '10px monospace'; ctx.fillStyle = '#d8d3ab'; ctx.fillText(`V97 · ${sector.mode === 'depth' ? 'PROFONDEUR' : '2D TENSION'} · ${sector.label} · ${sector.mode === 'depth' ? `PLAN ${lane.label}` : 'PLAN LATÉRAL'}`, 30, 594);
      ctx.fillStyle = '#aeb39d'; ctx.fillText(`SECTEURS ${state.hybrid.visitedSectors.length}/${ALIEN3_HYBRID_SECTORS_V97.length} · TRANSITIONS ${state.hybrid.transitions} · LANE SHIFT ${state.hybrid.laneChanges} · EVADES ${state.hybrid.laneEvades}`, 30, 613);
      ctx.fillText(`CODEX DLC ${state.dlcCodex.unlocked.length}/${ALIEN3_DLC_CODEX_V97.length} · TERMINAUX ${state.dlcCodex.terminalsRead.length}/5 · C OUVRIR`, 30, 632);
      ctx.fillText(state.perfectArchive.perfect ? 'ARCHIVE HYBRIDE PARFAITE' : `PREUVES ${state.evidenceRecovered.length}/${ALIEN3_V97_EVIDENCE_IDS.length} · RUNNER PLAN ${alien3DepthLaneV97(state.hybrid.runnerLane).label}`, 30, 650);
      if (state.hybrid.transitionClock > 0) {
        ctx.fillStyle = 'rgba(0,0,0,.72)'; ctx.fillRect(360, 70, 560, 58); ctx.strokeStyle = '#877554'; ctx.strokeRect(360.5, 70.5, 559, 57);
        ctx.fillStyle = '#dfce9e'; ctx.font = 'bold 12px monospace'; ctx.fillText(`${sector.mode === 'depth' ? 'VUE PROFONDEUR 2.5D' : 'VUE 2D LATÉRALE'} · ${sector.label}`, 382, 94);
        ctx.fillStyle = '#a9a99a'; ctx.font = '10px monospace'; ctx.fillText(sector.reason.toUpperCase(), 382, 114);
      }
      ctx.restore();
      this.drawAlien3DlcCodexOverlayV97(ctx);
    }

    captureResumeState() {
      const base = super.captureResumeState();
      if (!this.isAlien3MissionV97() || !this.alien3V97) return base;
      return { ...base, specialOperation: { ...(isRecord(base.specialOperation) ? base.specialOperation : {}), alien3V97: sanitizeAlien3StateV97(this.alien3V97) } };
    }

    applyResumeState(rawState) {
      const source = rawState?.specialOperation?.alien3V97 || rawState?.alien3V97;
      const result = super.applyResumeState(rawState);
      if (!this.isAlien3MissionV97() || !result?.applied) return result;
      if (!isRecord(source) || Number(source.schema) !== ALIEN3_DLC_SCHEMA_V97) return result;
      this.alien3V97 = sanitizeAlien3StateV97(source); this.pendingAlien3ResumeV97 = this.alien3V97;
      if (this.player) this.player.hybridDepthLaneV97 = this.alien3V97.hybrid.playerLane;
      if (this.alien3RunnerV88) this.alien3RunnerV88.hybridDepthLaneV97 = this.alien3V97.hybrid.runnerLane;
      this.updateAlien3PerfectV97();
      return { ...result, restored: (Number(result.restored) || 0) + 1, alien3DlcRestoredV97: true };
    }

    getAlien3SnapshotV97() {
      if (!this.isAlien3MissionV97() || !this.alien3V97) return { alien3V97: null };
      return { alien3V97: { ...sanitizeAlien3StateV97(this.alien3V97), hybridSectorTotal: ALIEN3_HYBRID_SECTORS_V97.length, depthLaneTotal: ALIEN3_DEPTH_LANES_V97.length, dedicatedCodexTotal: ALIEN3_DLC_CODEX_V97.length, codexTerminalTotal: ALIEN3_DLC_CODEX_TERMINALS_V97.length, evidenceTotal: ALIEN3_V97_EVIDENCE_IDS.length } };
    }

    getGameplayReport() { const report = super.getGameplayReport(); return this.isAlien3MissionV97() ? { ...report, alien3V97: this.getAlien3SnapshotV97().alien3V97 } : report; }
    getSnapshot() { return { ...super.getSnapshot(), ...this.getAlien3SnapshotV97() }; }
  };
}
