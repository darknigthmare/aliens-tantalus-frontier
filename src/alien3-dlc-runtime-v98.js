import {
  ALIEN3_CAMPAIGN_ID_V98,
  ALIEN3_DEPTH_OCCLUDERS_V98,
  ALIEN3_DLC_CODEX_CATEGORIES_V98,
  ALIEN3_DLC_CODEX_EXTENSION_V98,
  ALIEN3_DLC_CODEX_TERMINALS_V98,
  ALIEN3_DLC_CODEX_V98,
  ALIEN3_HYBRID_DIRECTOR_PROFILES_V98,
  ALIEN3_LANE_SHIFT_SECONDS_V98,
  ALIEN3_V98_EVIDENCE_IDS,
  alien3CodexEntriesForCategoryV98,
  alien3DepthOccluderV98,
  alien3DirectorProfileForSectorV98,
  alien3DirectorProfileV98,
  alien3DlcCodexBatchV98,
  alien3DlcCodexEntryV98,
  alien3V98Grade,
  createAlien3StateV98,
  sanitizeAlien3StateV98
} from './alien3-dlc-v98.js';
import {
  ALIEN3_DEPTH_LANES_V97,
  ALIEN3_DLC_CODEX_V97,
  ALIEN3_HYBRID_SECTORS_V97,
  alien3DepthLaneV97
} from './alien3-dlc-v97.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const isRecord = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const center = (entity) => ({ x: (Number(entity?.x) || 0) + (Number(entity?.w) || 0) / 2, y: (Number(entity?.y) || 0) + (Number(entity?.h) || 0) / 2 });
const distance = (a, b) => Math.hypot(center(a).x - center(b).x, center(a).y - center(b).y);
const INTERACT_RANGE = 118;
const EXTENSION_IDS = new Set(ALIEN3_DLC_CODEX_EXTENSION_V98.map((entry) => entry.id));
const TERMINAL_IDS = new Set(ALIEN3_DLC_CODEX_TERMINALS_V98.map((entry) => entry.id));
const wrapLines = (text, maxChars = 78) => {
  const words = String(text || '').split(/\s+/).filter(Boolean); const lines = []; let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line); return lines;
};

function laneVisual(index) {
  const lower = Math.floor(clamp(index, 0, 2)); const upper = Math.ceil(clamp(index, 0, 2)); const t = clamp(index - lower, 0, 1);
  const a = ALIEN3_DEPTH_LANES_V97[lower] || ALIEN3_DEPTH_LANES_V97[1];
  const b = ALIEN3_DEPTH_LANES_V97[upper] || a;
  return {
    renderScale: a.renderScale + (b.renderScale - a.renderScale) * t,
    renderYOffset: a.renderYOffset + (b.renderYOffset - a.renderYOffset) * t,
    label: t < 0.5 ? a.label : b.label
  };
}

export function withAlien3DlcRuntimeV98(BaseEngine) {
  return class Alien3DlcRuntimeV98 extends BaseEngine {
    start(options = {}) {
      this.alien3ActiveV98 = String(options.campaign?.id || '') === ALIEN3_CAMPAIGN_ID_V98;
      this.alien3V98 = this.alien3ActiveV98 ? createAlien3StateV98() : null;
      this.pendingAlien3ResumeV98 = null;
      // V98 replaces V97's one-key timed codex reader with a persistent UI.
      this.alien3CodexInputBoundV97 = true;
      const snapshot = super.start(options);
      if (!this.isAlien3MissionV98()) return snapshot;
      if (this.pendingAlien3ResumeV98) this.alien3V98 = sanitizeAlien3StateV98(this.pendingAlien3ResumeV98);
      this.configureAlien3WorldV98();
      this.bindAlien3CodexInputV98();
      return { ...snapshot, ...this.getAlien3SnapshotV98() };
    }

    isAlien3MissionV98() { return Boolean(this.alien3ActiveV98 || this.isAlien3MissionV97?.()); }

    configureAlien3WorldV98() {
      this.alien3V98 ||= createAlien3StateV98();
      this.alien3CodexTerminalsV97 = ALIEN3_DLC_CODEX_TERMINALS_V98.map((entry) => ({ ...entry }));
      this.recoverAlien3EvidenceV98('hybrid-director-ready', { silent: true });
      this.syncAlien3DirectorProfileV98(true);
      this.syncAlien3CodexTerminalsV98();
      this.onEvent({ type: 'alien3-v98-director', action: 'runtime-ready', profiles: ALIEN3_HYBRID_DIRECTOR_PROFILES_V98.length, codex: ALIEN3_DLC_CODEX_V98.length, terminals: ALIEN3_DLC_CODEX_TERMINALS_V98.length });
      return this.alien3V98;
    }

    bindAlien3CodexInputV98() {
      if (this.alien3CodexInputBoundV98 || !globalThis.addEventListener) return;
      this.alien3CodexInputBoundV98 = true;
      globalThis.addEventListener('keydown', (event) => {
        if (!this.running || !this.isAlien3MissionV98() || this.paused || this.mission?.state !== 'active') return;
        if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
        if (typeof this.canRouteGameplayKey === 'function' && !this.canRouteGameplayKey(event)) return;
        if (event.code === 'KeyC') { event.preventDefault?.(); this.toggleAlien3CodexUiV98(); return; }
        if (!this.alien3V98?.codexUi?.open) return;
        if (event.code === 'BracketLeft') { event.preventDefault?.(); this.cycleAlien3CodexCategoryV98(-1); }
        else if (event.code === 'BracketRight') { event.preventDefault?.(); this.cycleAlien3CodexCategoryV98(1); }
        else if (event.code === 'Comma') { event.preventDefault?.(); this.cycleAlien3CodexPageV98(-1); }
        else if (event.code === 'Period') { event.preventDefault?.(); this.cycleAlien3CodexPageV98(1); }
        else if (event.code === 'KeyB') { event.preventDefault?.(); this.toggleAlien3CodexBookmarkV98(); }
      });
    }

    recoverAlien3EvidenceV98(id, { silent = false } = {}) {
      const state = this.alien3V98;
      if (!state || !ALIEN3_V98_EVIDENCE_IDS.includes(id) || state.evidenceRecovered.includes(id)) return false;
      state.evidenceRecovered.push(id);
      if (!silent) {
        this.onEvent({ type: 'alien3-v98-director', action: 'evidence', evidenceId: id, total: state.evidenceRecovered.length });
        this.onEvent({ type: 'objective-action', action: `alien3-v98:evidence:${id}` });
      }
      return true;
    }

    alien3CodexUnlockedV98() {
      if (!this.alien3V97 || !this.alien3V98) return [];
      return [...new Set([...(this.alien3V97.dlcCodex?.unlocked || []), ...(this.alien3V98.codexUi.extensionUnlocked || [])])];
    }
    alien3CodexViewedV98() {
      if (!this.alien3V97 || !this.alien3V98) return [];
      return [...new Set([...(this.alien3V97.dlcCodex?.viewed || []), ...(this.alien3V98.codexUi.extensionViewed || [])])];
    }

    unlockAlien3CodexExtensionV98(ids = []) {
      const state = this.alien3V98; if (!state) return [];
      const added = [];
      for (const id of ids) {
        if (!EXTENSION_IDS.has(id) || state.codexUi.extensionUnlocked.includes(id)) continue;
        state.codexUi.extensionUnlocked.push(id); added.push(id);
        this.onEvent({ type: 'alien3-v98-codex', action: 'unlocked', codexId: id, total: this.alien3CodexUnlockedV98().length });
      }
      if (this.alien3CodexUnlockedV98().length === ALIEN3_DLC_CODEX_V98.length) this.recoverAlien3EvidenceV98('codex-78-complete', { silent: true });
      return added;
    }

    syncAlien3CodexTerminalsV98() {
      const state = this.alien3V98; if (!state || !this.alien3V97) return;
      for (const id of this.alien3V97.dlcCodex?.terminalsRead || []) if (TERMINAL_IDS.has(id) && !state.codexUi.terminalsRead.includes(id)) state.codexUi.terminalsRead.push(id);
    }

    readAlien3CodexTerminalV97(terminal) {
      if (!this.isAlien3MissionV98() || !this.alien3V98 || terminal?.batch !== 'director-v98') {
        const result = super.readAlien3CodexTerminalV97(terminal);
        if (result && this.alien3V98) {
          this.syncAlien3CodexTerminalsV98();
          this.alien3V98.codexUi.currentId = this.alien3V97?.dlcCodex?.currentId || this.alien3V98.codexUi.currentId;
        }
        return result;
      }
      const ids = alien3DlcCodexBatchV98(terminal.batch); const added = this.unlockAlien3CodexExtensionV98(ids);
      if (!this.alien3V98.codexUi.terminalsRead.includes(terminal.id)) this.alien3V98.codexUi.terminalsRead.push(terminal.id);
      this.recoverAlien3EvidenceV98('codex-director-terminal');
      this.alien3V98.codexUi.currentId = ids.find((id) => !this.alien3V98.codexUi.extensionViewed.includes(id)) || added[0] || ids[0] || null;
      this.openAlien3CodexUiV98(this.alien3V98.codexUi.currentId);
      this.onEvent({ type: 'alien3-v98-codex', action: 'terminal', terminalId: terminal.id, unlocked: added.length });
      this.updateAlien3PerfectV98();
      return true;
    }

    alien3NearestCodexTerminalV97(actor = this.player) {
      if (!actor || !this.alien3V98) return super.alien3NearestCodexTerminalV97?.(actor) || null;
      return this.alien3CodexTerminalsV97.map((terminal) => ({ terminal, range: distance(actor, terminal) }))
        .filter(({ terminal, range }) => range <= INTERACT_RANGE && (this.alien3V97?.hybrid?.mode !== 'depth' || terminal.lane === this.alien3V97.hybrid.playerLane))
        .sort((a, b) => a.range - b.range)[0]?.terminal || null;
    }

    openAlien3CodexUiV98(preferredId = null) {
      const state = this.alien3V98; if (!state) return false;
      const unlocked = this.alien3CodexUnlockedV98(); if (!unlocked.length) return false;
      const candidate = preferredId && unlocked.includes(preferredId) ? preferredId : state.codexUi.currentId && unlocked.includes(state.codexUi.currentId) ? state.codexUi.currentId : unlocked[0];
      state.codexUi.open = true; state.codexUi.currentId = candidate; state.codexUi.uiOpens += 1; state.telemetry.codexUiOpens += 1;
      if (this.alien3V97?.dlcCodex) this.alien3V97.dlcCodex.openClock = 0;
      this.markAlien3CodexViewedV98(candidate); this.recoverAlien3EvidenceV98('codex-ui-opened', { silent: true });
      this.audio?.ui?.(); this.onEvent({ type: 'alien3-v98-codex', action: 'ui-open', codexId: candidate });
      return true;
    }
    closeAlien3CodexUiV98() {
      if (!this.alien3V98?.codexUi?.open) return false;
      this.alien3V98.codexUi.open = false; this.audio?.ui?.(); this.onEvent({ type: 'alien3-v98-codex', action: 'ui-close' }); return true;
    }
    toggleAlien3CodexUiV98() { return this.alien3V98?.codexUi?.open ? this.closeAlien3CodexUiV98() : this.openAlien3CodexUiV98(); }

    markAlien3CodexViewedV98(id) {
      if (!id || !this.alien3V98 || !this.alien3V97) return false;
      if (EXTENSION_IDS.has(id)) {
        if (!this.alien3V98.codexUi.extensionUnlocked.includes(id)) return false;
        if (!this.alien3V98.codexUi.extensionViewed.includes(id)) this.alien3V98.codexUi.extensionViewed.push(id);
      } else {
        if (!this.alien3V97.dlcCodex.unlocked.includes(id)) return false;
        if (!this.alien3V97.dlcCodex.viewed.includes(id)) this.alien3V97.dlcCodex.viewed.push(id);
      }
      if (this.alien3CodexViewedV98().length === ALIEN3_DLC_CODEX_V98.length) this.recoverAlien3EvidenceV98('codex-reading-complete', { silent: true });
      return true;
    }

    alien3CodexVisibleEntriesV98() {
      const unlocked = this.alien3CodexUnlockedV98();
      const category = this.alien3V98?.codexUi?.selectedCategory || 'TOUS';
      return alien3CodexEntriesForCategoryV98(category, unlocked);
    }

    cycleAlien3CodexPageV98(direction = 1) {
      const state = this.alien3V98; if (!state) return false;
      const entries = this.alien3CodexVisibleEntriesV98(); if (!entries.length) return false;
      let index = entries.findIndex((entry) => entry.id === state.codexUi.currentId); if (index < 0) index = direction < 0 ? 0 : -1;
      const next = entries[(index + (direction < 0 ? -1 : 1) + entries.length) % entries.length];
      state.codexUi.currentId = next.id; state.codexUi.pageChanges += 1; this.markAlien3CodexViewedV98(next.id);
      this.audio?.ui?.(); this.onEvent({ type: 'alien3-v98-codex', action: 'page', codexId: next.id, category: state.codexUi.selectedCategory }); return true;
    }

    cycleAlien3CodexCategoryV98(direction = 1) {
      const state = this.alien3V98; if (!state) return false;
      let index = ALIEN3_DLC_CODEX_CATEGORIES_V98.indexOf(state.codexUi.selectedCategory); if (index < 0) index = 0;
      for (let guard = 0; guard < ALIEN3_DLC_CODEX_CATEGORIES_V98.length; guard += 1) {
        index = (index + (direction < 0 ? -1 : 1) + ALIEN3_DLC_CODEX_CATEGORIES_V98.length) % ALIEN3_DLC_CODEX_CATEGORIES_V98.length;
        const category = ALIEN3_DLC_CODEX_CATEGORIES_V98[index];
        if (alien3CodexEntriesForCategoryV98(category, this.alien3CodexUnlockedV98()).length) {
          state.codexUi.selectedCategory = category; state.codexUi.categoryChanges += 1; state.telemetry.codexCategoryChanges += 1;
          const first = this.alien3CodexVisibleEntriesV98()[0]; if (first) { state.codexUi.currentId = first.id; this.markAlien3CodexViewedV98(first.id); }
          this.recoverAlien3EvidenceV98('codex-category-used', { silent: true }); this.audio?.ui?.();
          this.onEvent({ type: 'alien3-v98-codex', action: 'category', category }); return true;
        }
      }
      return false;
    }

    toggleAlien3CodexBookmarkV98() {
      const state = this.alien3V98; const id = state?.codexUi?.currentId; if (!state || !id) return false;
      const index = state.codexUi.bookmarks.indexOf(id);
      if (index >= 0) state.codexUi.bookmarks.splice(index, 1);
      else { if (state.codexUi.bookmarks.length >= 12) state.codexUi.bookmarks.shift(); state.codexUi.bookmarks.push(id); }
      state.codexUi.bookmarkChanges += 1; state.telemetry.codexBookmarks += 1; this.recoverAlien3EvidenceV98('codex-bookmark-used', { silent: true });
      this.audio?.ui?.(); this.onEvent({ type: 'alien3-v98-codex', action: 'bookmark', codexId: id, active: state.codexUi.bookmarks.includes(id) }); return true;
    }

    syncAlien3DirectorProfileV98(initial = false) {
      const state = this.alien3V98; const sectorId = this.alien3V97?.hybrid?.currentSectorId; if (!state || !sectorId) return null;
      const profile = alien3DirectorProfileForSectorV98(sectorId); const changed = state.director.currentProfileId !== profile.id;
      state.director.currentProfileId = profile.id;
      if (!state.director.profilesVisited.includes(profile.id)) state.director.profilesVisited.push(profile.id);
      if (changed && !initial) { state.director.profileChanges += 1; state.telemetry.directorProfileEvents += 1; this.onEvent({ type: 'alien3-v98-director', action: 'profile', profileId: profile.id, sectorId }); }
      if (state.director.profilesVisited.length === ALIEN3_HYBRID_DIRECTOR_PROFILES_V98.length) this.recoverAlien3EvidenceV98('all-camera-contracts', { silent: true });
      return profile;
    }

    shiftAlien3DepthLaneV97(direction = 0, actor = this.player) {
      if (!this.isAlien3MissionV98() || !this.alien3V98 || this.alien3V97?.hybrid?.mode !== 'depth' || actor !== this.player || !direction) return super.shiftAlien3DepthLaneV97(direction, actor);
      const director = this.alien3V98.director; if (director.laneShiftActive) return false;
      const previous = this.alien3V97.hybrid.playerLane; const next = Math.round(clamp(previous + Math.sign(direction), 0, 2)); if (next === previous) return false;
      director.laneFrom = previous; director.laneTo = next; director.laneBlend = 0; director.laneShiftSeconds = 0; director.laneShiftActive = true;
      this.onEvent({ type: 'alien3-v98-director', action: 'lane-shift-start', from: previous, to: next, duration: ALIEN3_LANE_SHIFT_SECONDS_V98 });
      this.audio?.tone?.(next < previous ? 360 : 250, 0.055, 'triangle', 0.035, next < previous ? 70 : -45);
      return true;
    }

    advanceAlien3LaneShiftV98(seconds) {
      const state = this.alien3V98; if (!state?.director?.laneShiftActive) return false;
      const d = state.director; d.laneShiftSeconds += seconds; d.laneBlend = clamp(d.laneShiftSeconds / ALIEN3_LANE_SHIFT_SECONDS_V98, 0, 1);
      if (d.laneBlend < 1) return true;
      d.laneShiftActive = false; const direction = Math.sign(d.laneTo - d.laneFrom);
      // Commit through V97 so its telemetry, evidence and canonical player lane remain authoritative.
      const committed = super.shiftAlien3DepthLaneV97(direction, this.player);
      d.laneBlend = 1; d.laneFrom = this.alien3V97.hybrid.playerLane; d.laneTo = d.laneFrom;
      if (committed) {
        state.telemetry.smoothLaneShifts += 1; this.recoverAlien3EvidenceV98('smooth-lane-shift', { silent: true });
        this.onEvent({ type: 'alien3-v98-director', action: 'lane-shift-complete', lane: this.alien3V97.hybrid.playerLane });
      }
      return committed;
    }

    currentAlien3PlayerRenderLaneV98() {
      const d = this.alien3V98?.director; if (!d?.laneShiftActive) return this.alien3V97?.hybrid?.playerLane ?? 1;
      return d.laneFrom + (d.laneTo - d.laneFrom) * clamp(d.laneBlend, 0, 1);
    }

    updateAlien3RunnerDepthV97(seconds = 0.016) {
      if (!this.isAlien3MissionV98() || !this.alien3V98) return super.updateAlien3RunnerDepthV97(seconds);
      const d = this.alien3V98.director;
      if (d.runnerTelegraphClock > 0) {
        d.runnerTelegraphClock = Math.max(0, d.runnerTelegraphClock - seconds);
        if (d.runnerTelegraphClock === 0 && this.alien3RunnerV88?.alive && this.alien3V97?.hybrid?.mode === 'depth') {
          this.alien3V97.hybrid.runnerLane = d.runnerTelegraphTo; this.alien3RunnerV88.hybridDepthLaneV97 = d.runnerTelegraphTo;
          this.recoverAlien3EvidenceV98('runner-depth-telegraph', { silent: true });
          this.onEvent({ type: 'alien3-v98-director', action: 'runner-lane-commit', from: d.runnerTelegraphFrom, to: d.runnerTelegraphTo });
        }
        return;
      }
      const before = this.alien3V97?.hybrid?.runnerLane ?? 1; const emit = this.onEvent; let v97Shift = null;
      this.onEvent = (event) => { if (event?.type === 'alien3-v97-runner-depth' && event.action === 'lane-shift') v97Shift = event; else emit(event); };
      try { super.updateAlien3RunnerDepthV97(seconds); } finally { this.onEvent = emit; }
      const after = this.alien3V97?.hybrid?.runnerLane ?? before;
      if (after !== before) {
        this.alien3V97.hybrid.runnerLane = before; if (this.alien3RunnerV88) this.alien3RunnerV88.hybridDepthLaneV97 = before;
        d.runnerTelegraphFrom = before; d.runnerTelegraphTo = after;
        d.runnerTelegraphClock = alien3DirectorProfileV98(d.currentProfileId).runnerTelegraph;
        d.telegraphRange = Number(v97Shift?.range) || 0; this.alien3V98.telemetry.runnerTelegraphs += 1;
        this.onEvent({ type: 'alien3-v98-director', action: 'runner-lane-telegraph', from: before, to: after, duration: d.runnerTelegraphClock, range: d.telegraphRange });
      } else if (v97Shift) emit(v97Shift);
    }

    updateAlien3DepthCoverV98(seconds) {
      const state = this.alien3V98; if (!state || this.alien3V97?.hybrid?.mode !== 'depth') { if (state) state.director.coverClock = 0; return null; }
      const x = center(this.player).x; const lane = this.alien3V97.hybrid.playerLane; const cover = alien3DepthOccluderV98(x, lane);
      if (!cover) { state.director.coverClock = Math.max(0, state.director.coverClock - seconds * 2); return null; }
      state.director.coverClock = Math.min(3, state.director.coverClock + seconds); state.director.coverLane = lane;
      if (!state.director.occludersUsed.includes(cover.id)) { state.director.occludersUsed.push(cover.id); state.telemetry.coverUses += 1; this.onEvent({ type: 'alien3-v98-director', action: 'depth-cover', coverId: cover.id, lane }); }
      if (lane === 0) this.recoverAlien3EvidenceV98('depth-cover-rear', { silent: true });
      if (lane === 2) this.recoverAlien3EvidenceV98('depth-cover-front', { silent: true });
      if (this.alien3V91?.hunter && Number.isFinite(this.alien3V91.hunter.heat)) this.alien3V91.hunter.heat = Math.max(0, this.alien3V91.hunter.heat - seconds * 2.4 * cover.concealment);
      return cover;
    }

    update(delta) {
      const result = super.update(delta);
      if (!this.isAlien3MissionV98() || !this.alien3V98 || this.mission?.state !== 'active') return result;
      const seconds = clamp(delta, 0, 0.25); this.syncAlien3DirectorProfileV98(); this.advanceAlien3LaneShiftV98(seconds); this.updateAlien3DepthCoverV98(seconds);
      if (this.alien3V97?.hybrid?.mode === 'depth') this.alien3V98.director.depthFrames += 1; else this.alien3V98.director.sideFrames += 1;
      if (this.alien3V98.director.depthFrames >= 120) this.recoverAlien3EvidenceV98('depth-composition-balanced', { silent: true });
      if (this.alien3V98.director.sideFrames >= 120) this.recoverAlien3EvidenceV98('side-composition-balanced', { silent: true });
      if (this.alien3V98.telemetry.runnerTelegraphs > 0 && this.alien3V97?.hybrid?.laneEvades > 0) this.recoverAlien3EvidenceV98('runner-transition-survived', { silent: true });
      this.syncAlien3CodexTerminalsV98(); this.updateAlien3PerfectV98(); return result;
    }

    applyAlien3DepthTransformV97(ctx, entity, laneIndex, draw) {
      if (!this.isAlien3MissionV98() || !this.alien3V98 || entity !== this.player || this.alien3V97?.hybrid?.mode !== 'depth') return super.applyAlien3DepthTransformV97(ctx, entity, laneIndex, draw);
      const visual = laneVisual(this.currentAlien3PlayerRenderLaneV98()); const c = center(entity); const baseline = (Number(entity.y) || 0) + (Number(entity.h) || 0);
      ctx.save(); ctx.translate(c.x, baseline + visual.renderYOffset); ctx.scale(visual.renderScale, visual.renderScale); ctx.translate(-c.x, -baseline);
      try { draw(); } finally { ctx.restore(); }
    }

    drawAlien3DepthOccludersV98(ctx) {
      if (!ctx || !this.alien3V98 || this.alien3V97?.hybrid?.mode !== 'depth') return;
      const sector = this.currentAlien3HybridSectorV97?.(); if (!sector) return;
      for (const cover of ALIEN3_DEPTH_OCCLUDERS_V98) {
        if (cover.x1 < sector.x0 || cover.x0 > sector.x1) continue;
        const lane = alien3DepthLaneV97(cover.lane); const y = 492 + lane.renderYOffset;
        ctx.save(); ctx.fillStyle = 'rgba(21,25,21,.80)'; ctx.strokeStyle = 'rgba(139,145,120,.32)';
        ctx.fillRect(cover.x0, y - 54, cover.x1 - cover.x0, 54); ctx.strokeRect(cover.x0 + .5, y - 53.5, cover.x1 - cover.x0 - 1, 53);
        ctx.fillStyle = 'rgba(177,163,112,.20)'; ctx.fillRect(cover.x0 + 8, y - 44, 24, 5); ctx.restore();
      }
    }

    drawAlien3RunnerTelegraphV98(ctx) {
      const state = this.alien3V98; const runner = this.alien3RunnerV88;
      if (!ctx || !state || !runner?.alive || state.director.runnerTelegraphClock <= 0 || this.alien3V97?.hybrid?.mode !== 'depth') return;
      const lane = alien3DepthLaneV97(state.director.runnerTelegraphTo); const c = center(runner); const pulse = 0.45 + Math.sin((Number(this.animationTime) || 0) * 18) * 0.18;
      ctx.save(); ctx.globalAlpha = clamp(pulse, .18, .7); ctx.strokeStyle = '#b88c65'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(c.x, (Number(runner.y) || 0) + (Number(runner.h) || 0) + lane.renderYOffset - 8, 54 * lane.renderScale, 14, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(184,140,101,.18)'; ctx.fillRect(c.x - 28, 366 + lane.index * 76, 56, 10); ctx.restore();
    }

    drawWorld(ctx) {
      super.drawWorld(ctx);
      if (!this.isAlien3MissionV98() || !ctx) return;
      this.drawAlien3DepthOccludersV98(ctx); this.drawAlien3RunnerTelegraphV98(ctx);
      const extra = ALIEN3_DLC_CODEX_TERMINALS_V98.find((entry) => entry.id === 'a3c-terminal-director-v98');
      if (extra && typeof this.drawAlien3CodexTerminalV97 === 'function') this.drawAlien3CodexTerminalV97(ctx, extra);
    }

    drawAlien3CodexUiV98(ctx) {
      const state = this.alien3V98; if (!state?.codexUi?.open) return;
      const unlocked = this.alien3CodexUnlockedV98(); const viewed = new Set(this.alien3CodexViewedV98());
      const entries = this.alien3CodexVisibleEntriesV98(); const current = alien3DlcCodexEntryV98(state.codexUi.currentId) || entries[0]; if (!current) return;
      const currentIndex = Math.max(0, entries.findIndex((entry) => entry.id === current.id)); const unread = unlocked.filter((id) => !viewed.has(id)).length;
      ctx.save(); ctx.fillStyle = 'rgba(1,3,3,.975)'; ctx.fillRect(64, 42, 1152, 622); ctx.strokeStyle = '#88744d'; ctx.lineWidth = 2; ctx.strokeRect(65, 43, 1150, 620);
      ctx.fillStyle = '#d9c78e'; ctx.font = 'bold 18px monospace'; ctx.fillText('CODEX ALIEN 3 // FIORINA 161', 88, 78);
      ctx.fillStyle = '#788d80'; ctx.font = '11px monospace'; ctx.fillText(`V98 HYBRID DIRECTOR · ${unlocked.length}/${ALIEN3_DLC_CODEX_V98.length} DÉBLOQUÉS · ${viewed.size} LUS · ${unread} NON LUS · ${state.codexUi.bookmarks.length} FAVORIS`, 88, 101);
      // Categories.
      ctx.fillStyle = 'rgba(9,13,12,.96)'; ctx.fillRect(86, 122, 190, 504); ctx.strokeStyle = '#38433b'; ctx.strokeRect(86.5, 122.5, 189, 503);
      ALIEN3_DLC_CODEX_CATEGORIES_V98.forEach((category, index) => {
        const y = 151 + index * 37; const active = category === state.codexUi.selectedCategory;
        if (active) { ctx.fillStyle = 'rgba(121,111,75,.28)'; ctx.fillRect(96, y - 20, 170, 28); }
        ctx.fillStyle = active ? '#e0cd94' : '#829186'; ctx.font = active ? 'bold 11px monospace' : '11px monospace'; ctx.fillText(category, 108, y);
      });
      // Entry rail.
      ctx.fillStyle = 'rgba(6,9,8,.96)'; ctx.fillRect(292, 122, 300, 504); ctx.strokeStyle = '#38433b'; ctx.strokeRect(292.5, 122.5, 299, 503);
      const start = Math.max(0, Math.min(entries.length - 10, currentIndex - 4));
      entries.slice(start, start + 10).forEach((entry, i) => {
        const y = 151 + i * 46; const active = entry.id === current.id; const isUnread = !viewed.has(entry.id); const mark = state.codexUi.bookmarks.includes(entry.id);
        if (active) { ctx.fillStyle = 'rgba(102,122,105,.24)'; ctx.fillRect(302, y - 22, 280, 37); }
        ctx.fillStyle = active ? '#d7d8bd' : '#9ca69e'; ctx.font = active ? 'bold 10px monospace' : '10px monospace'; ctx.fillText(`${mark ? '◆' : isUnread ? '●' : '·'} ${entry.title.slice(0, 31)}`, 312, y);
        ctx.fillStyle = '#5f7167'; ctx.font = '9px monospace'; ctx.fillText(entry.category, 328, y + 13);
      });
      // Detail.
      ctx.fillStyle = '#dfd3a6'; ctx.font = 'bold 17px monospace'; ctx.fillText(current.title, 620, 148);
      ctx.fillStyle = '#7d9185'; ctx.font = '11px monospace'; ctx.fillText(`${current.category} · PAGE ${currentIndex + 1}/${Math.max(1, entries.length)} · ${state.codexUi.bookmarks.includes(current.id) ? '◆ FAVORI' : 'B AJOUTER AUX FAVORIS'}`, 620, 172);
      ctx.fillStyle = '#b9b9aa'; ctx.font = '13px monospace'; wrapLines(current.body, 69).slice(0, 14).forEach((line, i) => ctx.fillText(line, 620, 214 + i * 24));
      ctx.fillStyle = '#68766d'; ctx.font = '10px monospace'; ctx.fillText('[ / ] CATÉGORIE    , / . PAGE    B FAVORI    C FERMER', 620, 604);
      ctx.fillText(`TERMINAUX ${state.codexUi.terminalsRead.length}/${ALIEN3_DLC_CODEX_TERMINALS_V98.length} · EXTENSION V98 ${state.codexUi.extensionUnlocked.length}/${ALIEN3_DLC_CODEX_EXTENSION_V98.length}`, 620, 624);
      ctx.restore();
    }

    drawHud(ctx) {
      super.drawHud(ctx);
      if (!this.isAlien3MissionV98() || !this.alien3V98 || !ctx) return;
      const d = this.alien3V98.director; const profile = alien3DirectorProfileV98(d.currentProfileId); const unlocked = this.alien3CodexUnlockedV98(); const viewed = this.alien3CodexViewedV98();
      ctx.save(); ctx.fillStyle = 'rgba(2,4,4,.93)'; ctx.fillRect(748, 574, 514, 86); ctx.strokeStyle = '#766d4f'; ctx.strokeRect(748.5, 574.5, 513, 85);
      ctx.fillStyle = '#d8cb9c'; ctx.font = '10px monospace'; ctx.fillText(`V98 DIRECTOR · ${profile.label} · ${profile.mode === 'depth' ? 'PROFONDEUR' : '2D TENSION'}`, 760, 594);
      const blend = d.laneShiftActive ? ` · SHIFT ${Math.round(d.laneBlend * 100)}%` : '';
      ctx.fillStyle = '#a7b09e'; ctx.fillText(`CAM ${d.profilesVisited.length}/${ALIEN3_HYBRID_DIRECTOR_PROFILES_V98.length} · COVER ${d.occludersUsed.length}/${ALIEN3_DEPTH_OCCLUDERS_V98.length}${blend}`, 760, 613);
      ctx.fillText(`CODEX ${unlocked.length}/${ALIEN3_DLC_CODEX_V98.length} · LUS ${viewed.length} · NON LUS ${Math.max(0, unlocked.length - viewed.length)} · C INTERFACE`, 760, 632);
      ctx.fillText(this.alien3V98.perfectArchive.perfect ? 'HYBRID DIRECTOR PARFAIT · S+++++++++' : `PREUVES ${this.alien3V98.evidenceRecovered.length}/${ALIEN3_V98_EVIDENCE_IDS.length} · FAVORIS ${this.alien3V98.codexUi.bookmarks.length}`, 760, 650);
      ctx.restore();
      this.drawAlien3CodexUiV98(ctx);
    }

    updateAlien3PerfectV98() {
      const state = this.alien3V98; if (!state) return;
      const unlocked = this.alien3CodexUnlockedV98(); const viewed = this.alien3CodexViewedV98();
      state.perfectArchive.inheritedV97 = Boolean(this.alien3V97?.perfectArchive?.perfect);
      state.perfectArchive.profilesComplete = state.director.profilesVisited.length === ALIEN3_HYBRID_DIRECTOR_PROFILES_V98.length;
      state.perfectArchive.smoothDepthComplete = state.telemetry.smoothLaneShifts >= 3 && state.telemetry.runnerTelegraphs >= 1
        && state.evidenceRecovered.includes('depth-cover-rear') && state.evidenceRecovered.includes('depth-cover-front');
      state.perfectArchive.codexUnlockComplete = unlocked.length === ALIEN3_DLC_CODEX_V98.length;
      state.perfectArchive.codexReadComplete = viewed.length === ALIEN3_DLC_CODEX_V98.length;
      state.perfectArchive.interfaceComplete = state.telemetry.codexUiOpens > 0 && state.telemetry.codexCategoryChanges > 0 && state.telemetry.codexBookmarks > 0;
      state.perfectArchive.compositionComplete = state.director.depthFrames >= 120 && state.director.sideFrames >= 120;
      const required = ALIEN3_V98_EVIDENCE_IDS.filter((id) => id !== 'perfect-hybrid-director');
      const ready = Object.entries(state.perfectArchive).filter(([key]) => key !== 'perfect').every(([, value]) => value === true)
        && required.every((id) => state.evidenceRecovered.includes(id));
      if (!state.perfectArchive.perfect && ready) {
        state.perfectArchive.perfect = true; this.recoverAlien3EvidenceV98('perfect-hybrid-director');
        this.onEvent({ type: 'alien3-v98-perfect', evidence: state.evidenceRecovered.length, codex: unlocked.length });
      }
    }

    computeAlien3AchievementsV98() {
      const state = this.alien3V98; if (!state) return [];
      const ids = [];
      if (state.director.profilesVisited.length === 9) ids.push('v98-nine-camera-contracts');
      if (state.telemetry.smoothLaneShifts >= 3) ids.push('v98-smooth-depth-traveller');
      if (state.telemetry.runnerTelegraphs >= 3) ids.push('v98-read-the-runner');
      if (state.director.occludersUsed.length >= 4) ids.push('v98-depth-cover-specialist');
      if (this.alien3CodexUnlockedV98().length === 78) ids.push('v98-codex-78');
      if (this.alien3CodexViewedV98().length === 78) ids.push('v98-codex-scholar');
      if (state.codexUi.bookmarks.length >= 3) ids.push('v98-curator');
      if (state.perfectArchive.perfect) ids.push('v98-hybrid-director-perfect');
      return ids;
    }

    completeAlien3MissionV89(actor = this.player) {
      if (!this.isAlien3MissionV98() || !this.alien3V98) return super.completeAlien3MissionV89(actor);
      const emit = this.onEvent; let completionEvent = null;
      this.onEvent = (event) => { if (event?.type === 'mission-complete') { completionEvent = event; return; } emit(event); };
      let completed = false; try { completed = super.completeAlien3MissionV89(actor); } finally { this.onEvent = emit; }
      if (!completed) return false;
      this.updateAlien3PerfectV98(); const state = this.alien3V98; state.achievementIds = this.computeAlien3AchievementsV98();
      const baseRewards = isRecord(this.mission.rewards) ? this.mission.rewards : {}; const unlocked = this.alien3CodexUnlockedV98(); const viewed = this.alien3CodexViewedV98();
      const grade = alien3V98Grade({
        gradeV97: baseRewards.mireGradeV97 || 'D', evidence: state.evidenceRecovered.length, profiles: state.director.profilesVisited.length,
        codex: unlocked.length, read: viewed.length, smoothShifts: state.telemetry.smoothLaneShifts, coverUses: state.telemetry.coverUses,
        uiActions: Number(state.telemetry.codexUiOpens > 0) + Number(state.telemetry.codexCategoryChanges > 0) + Number(state.telemetry.codexBookmarks > 0), perfect: state.perfectArchive.perfect
      });
      const gradeBonus = { 'S+++++++++': 2600, 'S++++++++': 2280, 'S+++++++': 1980, 'S++++++': 1710, 'S+++++': 1460, 'S++++': 1220, 'S+++': 980, 'S++': 760, 'S+': 560, S: 390, A: 260, B: 140, C: 60, D: 0 }[grade] || 0;
      this.mission.rewards = {
        ...baseRewards, credits: (Number(baseRewards.credits) || 0) + 380 + gradeBonus,
        alien3V98: true, mireGradeV98: grade, v98EvidenceRecovered: [...state.evidenceRecovered], v98Achievements: [...state.achievementIds],
        hybridDirectorV98: { profiles: [...state.director.profilesVisited], smoothLaneShifts: state.telemetry.smoothLaneShifts, runnerTelegraphs: state.telemetry.runnerTelegraphs, occludersUsed: [...state.director.occludersUsed] },
        dedicatedCodexV98: { unlocked, viewed, bookmarks: [...state.codexUi.bookmarks], terminalsRead: [...state.codexUi.terminalsRead], complete: unlocked.length === ALIEN3_DLC_CODEX_V98.length },
        perfectArchiveV98: { ...state.perfectArchive }
      };
      for (const achievementId of state.achievementIds) emit({ type: 'alien3-v98-achievement', achievementId });
      emit(completionEvent ? { ...completionEvent, rewards: this.mission.rewards } : { type: 'mission-complete', kills: Number(this.player?.kills) || 0, rewards: this.mission.rewards, extractedBy: 'primary' });
      return true;
    }

    getInteractionPrompt(actor = this.player) {
      if (!this.isAlien3MissionV98() || !this.alien3V98) return super.getInteractionPrompt(actor);
      const terminal = this.alien3NearestCodexTerminalV97(actor); if (terminal) return `E  ${terminal.label}`;
      if (this.alien3V98.codexUi.open) return 'CODEX ALIEN 3 · [/] CATÉGORIE · ,/. PAGE · B FAVORI · C FERMER';
      const base = super.getInteractionPrompt(actor); return base || 'C  CODEX ALIEN 3';
    }

    captureResumeState() {
      const base = super.captureResumeState();
      if (!this.isAlien3MissionV98() || !this.alien3V98) return base;
      return { ...base, specialOperation: { ...(isRecord(base.specialOperation) ? base.specialOperation : {}), alien3V98: sanitizeAlien3StateV98(this.alien3V98) } };
    }

    applyResumeState(rawState) {
      const source = rawState?.specialOperation?.alien3V98 || rawState?.alien3V98;
      const result = super.applyResumeState(rawState);
      if (!this.isAlien3MissionV98() || !result?.applied) return result;
      if (!isRecord(source) || Number(source.schema) !== 98) return result;
      this.alien3V98 = sanitizeAlien3StateV98(source); this.pendingAlien3ResumeV98 = this.alien3V98;
      this.syncAlien3CodexTerminalsV98(); this.updateAlien3PerfectV98();
      return { ...result, restored: (Number(result.restored) || 0) + 1, alien3DlcRestoredV98: true };
    }

    getAlien3SnapshotV98() {
      if (!this.isAlien3MissionV98() || !this.alien3V98) return { alien3V98: null };
      return { alien3V98: { ...sanitizeAlien3StateV98(this.alien3V98), directorProfileTotal: ALIEN3_HYBRID_DIRECTOR_PROFILES_V98.length, depthOccluderTotal: ALIEN3_DEPTH_OCCLUDERS_V98.length, dedicatedCodexTotal: ALIEN3_DLC_CODEX_V98.length, codexTerminalTotal: ALIEN3_DLC_CODEX_TERMINALS_V98.length, evidenceTotal: ALIEN3_V98_EVIDENCE_IDS.length, combinedCodexUnlocked: this.alien3CodexUnlockedV98().length, combinedCodexViewed: this.alien3CodexViewedV98().length } };
    }

    getGameplayReport() { const report = super.getGameplayReport(); return this.isAlien3MissionV98() ? { ...report, alien3V98: this.getAlien3SnapshotV98().alien3V98 } : report; }
    getSnapshot() { return { ...super.getSnapshot(), ...this.getAlien3SnapshotV98() }; }
  };
}
