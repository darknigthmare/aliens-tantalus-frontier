import {
  ALIEN3_CAMPAIGN_ID_V91,
  ALIEN3_CODEX_V91,
  ALIEN3_DLC_SCHEMA_V91,
  ALIEN3_FOUNDRY_PISTONS_V91,
  ALIEN3_V91_EVIDENCE_IDS,
  ALIEN3_V91_STATIONS,
  alien3V91CodexEntry,
  alien3V91Grade,
  createAlien3StateV91,
  sanitizeAlien3StateV91
} from './alien3-dlc-v91.js';
import { ALIEN3_RUNNER_AMBUSH_ANCHORS_V89 } from './alien3-dlc-v89.js';

const WORLD_WIDTH = 6200;
const INTERACT_RANGE = 174;
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const isRecord = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const center = (entity = {}) => ({ x: (Number(entity.x) || 0) + (Number(entity.w) || 0) / 2, y: (Number(entity.y) || 0) + (Number(entity.h) || 0) / 2 });
const distance = (a, b) => {
  if (!a || !b) return Infinity;
  const left = center(a); const right = center(b);
  return Math.hypot(left.x - right.x, left.y - right.y);
};
const PHASE_ORDER = Object.freeze(['wreckage', 'infirmary', 'first-blood', 'bishop', 'trap-prep', 'fire-maze', 'leadworks', 'molten-lead', 'thermal-shock', 'company', 'finale']);
const phaseIndex = (phase) => Math.max(0, PHASE_ORDER.indexOf(phase));

export const ALIEN3_PERSISTENT_EVENT_TYPES_V91 = Object.freeze(new Set([
  'alien3-v91-beat', 'alien3-v91-company-directive', 'alien3-v91-golic-chain',
  'alien3-v91-piston', 'alien3-v91-hunter', 'alien3-v91-prisoner-ai',
  'alien3-v91-evidence', 'alien3-v91-achievement'
]));

function nearestPlatformY(engine, x, fallback = 510) {
  const platforms = Array.isArray(engine?.platforms) ? engine.platforms : [];
  const candidates = platforms.filter((entry) => {
    const start = Number(entry?.x) || 0;
    const end = start + (Number(entry?.w) || 0);
    return x >= start - 28 && x <= end + 28 && Number.isFinite(Number(entry?.y));
  });
  if (!candidates.length) return fallback;
  return candidates.sort((a, b) => Math.abs(Number(a.y) - fallback) - Math.abs(Number(b.y) - fallback))[0].y;
}

function phaseMatches(station, phase) {
  return !Array.isArray(station?.phases) || station.phases.includes(phase);
}

export function withAlien3DlcRuntimeV91(BaseEngine) {
  return class Alien3DlcRuntimeV91 extends BaseEngine {
    start(options = {}) {
      this.alien3ActiveV91 = String(options.campaign?.id || '') === ALIEN3_CAMPAIGN_ID_V91;
      this.alien3V91 = this.alien3ActiveV91 ? createAlien3StateV91() : null;
      this.pendingAlien3ResumeV91 = null;
      this.alien3StationsV91 = [];
      this.alien3V91OverlayClock = 0;
      this.alien3V91OverlayId = null;
      this.alien3V91LastFinaleStage = 'idle';
      const snapshot = super.start(options);
      if (!this.isAlien3MissionV91()) return snapshot;
      if (this.pendingAlien3ResumeV91) this.alien3V91 = sanitizeAlien3StateV91(this.pendingAlien3ResumeV91);
      this.configureAlien3WorldV91();
      return { ...snapshot, ...this.getAlien3SnapshotV91() };
    }

    isAlien3MissionV91() {
      return Boolean(this.alien3ActiveV91 || this.isAlien3MissionV90?.());
    }

    configureAlien3WorldV91() {
      const state = this.alien3V91 || createAlien3StateV91();
      this.alien3V91 = state;
      this.alien3StationsV91 = ALIEN3_V91_STATIONS.map((entry) => ({ ...entry }));
      this.updateAlien3PrisonerMetricsV91();
      this.onEvent({ type: 'alien3-v91-beat', action: 'runtime-ready', evidence: ALIEN3_V91_EVIDENCE_IDS.length, pistons: ALIEN3_FOUNDRY_PISTONS_V91.length });
      return state;
    }

    alien3StationV91(id) {
      return this.alien3StationsV91.find((entry) => entry.id === id) || null;
    }

    unlockAlien3CodexV91(ids = []) {
      const state = this.alien3V91;
      if (!state) return [];
      const unlocked = [];
      for (const id of ids) {
        if (!alien3V91CodexEntry(id) || state.codexUnlocked.includes(id)) continue;
        state.codexUnlocked.push(id);
        unlocked.push(id);
        this.onEvent({ type: 'alien3-v91-evidence', action: 'codex-unlocked', codexId: id });
      }
      return unlocked;
    }

    recoverAlien3EvidenceV91(id, { silent = false } = {}) {
      const state = this.alien3V91;
      if (!state || !ALIEN3_V91_EVIDENCE_IDS.includes(id) || state.evidenceRecovered.includes(id)) return false;
      state.evidenceRecovered.push(id);
      if (Object.hasOwn(state.historicalBeats, id)) state.historicalBeats[id] = true;
      if (!silent) {
        this.onEvent({ type: 'alien3-v91-evidence', evidenceId: id, total: state.evidenceRecovered.length });
        this.onEvent({ type: 'objective-action', action: `alien3-v91:evidence:${id}` });
      }
      return true;
    }

    showAlien3BeatV91(title, subtitle, beatId) {
      if (!this.alien3V91) return false;
      Object.assign(this.alien3V91.presentation, { cardClock: 3.2, title: String(title || '').slice(0, 100), subtitle: String(subtitle || '').slice(0, 220), beatId: String(beatId || '').slice(0, 100) || null });
      this.onEvent({ type: 'alien3-v91-beat', action: 'presentation', beatId, title });
      return true;
    }

    bumpAlien3NoiseV90(amount, reason = 'action') {
      const result = super.bumpAlien3NoiseV90(amount, reason);
      if (this.isAlien3MissionV91() && this.alien3V91 && this.player) {
        const hunter = this.alien3V91.hunter;
        hunter.heat = clamp(hunter.heat + Number(amount || 0) * 0.58, 0, 100);
        hunter.lastNoiseX = Number(this.player.x) || hunter.lastNoiseX;
      }
      return result;
    }

    alien3V91StationVisible(station) {
      const state = this.alien3V91;
      const v88 = this.alien3V88;
      const v89 = this.alien3V89;
      const v90 = this.alien3V90;
      if (!state || !v88 || !station) return false;
      const phase = v88.phase;
      if (station.kind === 'beat') {
        if (!phaseMatches(station, phase) || state.evidenceRecovered.includes(station.evidenceId)) return false;
        if (station.evidenceId === 'patna-cage') return phase === 'company' && Boolean(v89?.company?.visible);
        if (station.evidenceId === 'bishop-two') return phaseIndex(phase) >= phaseIndex('company');
        if (station.evidenceId === 'morse-custody') return phase === 'finale';
        return true;
      }
      if (station.kind === 'company-message') return v89?.cut === 'assembly' && phase === 'fire-maze' && v89.assembly.wasteTankTrapped && !state.companyDirective.messageSent;
      if (station.kind === 'rally') return phase === 'fire-maze' && !v90?.firePlan?.accidentResolved && (Number(v90?.prisonerPlan?.panic) || 0) >= 40;
      if (station.kind === 'piston') return phase === 'leadworks' && Boolean(v90?.leadworks?.moldReady) && !state.foundryChase.ready;
      return false;
    }

    alien3NearestStationV91(actor = this.player) {
      if (!actor || !this.alien3V91) return null;
      return this.alien3StationsV91
        .filter((station) => this.alien3V91StationVisible(station))
        .map((station) => ({ station, range: distance(actor, station) }))
        .filter((entry) => entry.range <= INTERACT_RANGE)
        .sort((a, b) => a.range - b.range)[0]?.station || null;
    }

    interactAlien3V91(actor = this.player) {
      const state = this.alien3V91;
      if (!state || !actor) return false;
      const station = this.alien3NearestStationV91(actor);
      if (!station) return false;
      actor.actionClock = Math.max(Number(actor.actionClock) || 0, 0.55);

      if (station.kind === 'beat') {
        state.stats.beatInteractions += 1;
        this.unlockAlien3CodexV91([station.codexId]);
        this.recoverAlien3EvidenceV91(station.evidenceId);
        if (station.evidenceId === 'patna-cage') {
          state.companyDirective.cageInspected = true;
          state.stats.companyInspections += 1;
        }
        if (station.evidenceId === 'bishop-two') {
          state.company.bishopTwoConfirmed = true;
          state.stats.companyInspections += 1;
        }
        if (station.evidenceId === 'morse-custody') state.company.morseCustody = true;
        this.alien3V91OverlayId = station.codexId;
        this.alien3V91OverlayClock = 6;
        this.showAlien3BeatV91(station.label, alien3V91CodexEntry(station.codexId)?.body || 'Archive actualisée.', station.evidenceId);
        this.audio?.ui?.();
        return true;
      }

      if (station.kind === 'rally') {
        state.prisonerAI.rallyCount += 1;
        if (this.alien3V90?.prisonerPlan) {
          this.alien3V90.prisonerPlan.panic = clamp(this.alien3V90.prisonerPlan.panic - 28, 0, 100);
          this.alien3V90.prisonerPlan.morale = clamp(this.alien3V90.prisonerPlan.morale + 16, 0, 100);
        }
        this.bumpAlien3NoiseV90(5, 'dillon-rally');
        this.onEvent({ type: 'alien3-v91-prisoner-ai', action: 'rally', count: state.prisonerAI.rallyCount, panic: Math.round(this.alien3V90?.prisonerPlan?.panic || 0) });
        this.audio?.ui?.();
        return true;
      }

      if (station.kind === 'company-message') {
        state.companyDirective.messageSent = true;
        state.companyDirective.destructionDenied = true;
        state.companyDirective.golicChainArmed = true;
        state.stats.beatInteractions += 1;
        this.unlockAlien3CodexV91(['f161-company-message']);
        this.recoverAlien3EvidenceV91('company-message');
        this.showAlien3BeatV91('DIRECTIVE REÇUE', 'La Compagnie exige que le spécimen soit conservé. Le confinement n’est plus une fin durable.', 'company-message');
        this.onEvent({ type: 'alien3-v91-company-directive', destructionDenied: true, assembly: true });
        this.audio?.alarm?.();
        return true;
      }

      if (station.kind === 'piston') {
        const chase = state.foundryChase;
        const expected = ALIEN3_FOUNDRY_PISTONS_V91[chase.sequenceIndex];
        if (!expected || station.id !== expected.id) {
          chase.wrongOrder += 1;
          this.onEvent({ type: 'alien3-v91-piston', action: 'wrong-order', pistonId: station.id, expectedId: expected?.id || null });
          return this.locked?.(`SÉQUENCE FONDERIE · ACTIVER ${expected?.label || 'LE PROCHAIN PISTON'}`) ?? false;
        }
        chase.pistons[station.id] = true;
        chase.sequenceIndex += 1;
        chase.funnelPressure = clamp(chase.sequenceIndex / ALIEN3_FOUNDRY_PISTONS_V91.length * 100, 0, 100);
        chase.ready = chase.sequenceIndex >= ALIEN3_FOUNDRY_PISTONS_V91.length;
        chase.runnerFunnelConfirmed = chase.ready;
        state.stats.pistonActions += 1;
        if (this.alien3V89?.director) {
          this.alien3V89.director.tension = Math.max(82, Number(this.alien3V89.director.tension) || 0);
          this.alien3V89.director.mode = 'hunt';
        }
        this.bumpAlien3NoiseV90(22, `piston-${station.order + 1}`);
        const targetAnchor = ALIEN3_RUNNER_AMBUSH_ANCHORS_V89[Math.min(ALIEN3_RUNNER_AMBUSH_ANCHORS_V89.length - 1, 3 + station.order)];
        if (this.alien3RunnerV88?.alive && targetAnchor) {
          this.alien3RunnerV88.x = clamp(targetAnchor.x, 20, WORLD_WIDTH - (Number(this.alien3RunnerV88.w) || 90) - 20);
          const floorY = nearestPlatformY(this, targetAnchor.x, targetAnchor.y + (Number(this.alien3RunnerV88.h) || 90));
          this.alien3RunnerV88.y = floorY - (Number(this.alien3RunnerV88.h) || 90);
          this.alien3RunnerV88.alert = true;
          if (typeof this.initializeEnemyMissionNavigation === 'function') this.initializeEnemyMissionNavigation(this.alien3RunnerV88);
        }
        if (chase.ready) {
          this.unlockAlien3CodexV91(['f161-piston-maze']);
          this.recoverAlien3EvidenceV91('piston-maze');
          this.showAlien3BeatV91('CORRIDOR DE RABATTEMENT OUVERT', 'Les trois pistons sont synchronisés. Attirez maintenant le Runner dans le moule.', 'piston-maze');
        }
        this.onEvent({ type: 'alien3-v91-piston', action: 'cycled', pistonId: station.id, index: chase.sequenceIndex, total: ALIEN3_FOUNDRY_PISTONS_V91.length, ready: chase.ready });
        this.audio?.ui?.();
        return true;
      }
      return false;
    }

    updateAlien3AssemblyV89(seconds) {
      if (this.isAlien3MissionV91() && this.alien3V91 && this.alien3V89?.cut === 'assembly'
          && this.alien3V89.assembly.wasteTankTrapped && !this.alien3V89.assembly.golicReleased
          && !this.alien3V91.companyDirective.messageSent) {
        this.alien3V89.assembly.releaseClock = 0;
        return;
      }
      return super.updateAlien3AssemblyV89(seconds);
    }

    interact(actor = this.player) {
      if (!this.isAlien3MissionV91() || !this.alien3V91) return super.interact(actor);
      if (this.interactAlien3V91(actor)) return true;
      if (this.alien3V88?.phase === 'leadworks' && this.alien3V90?.leadworks?.moldReady && !this.alien3V91.foundryChase.ready) {
        const mold = this.alien3StationV88?.('f161-mold-control');
        if (mold && distance(actor, mold) <= INTERACT_RANGE) {
          const next = ALIEN3_FOUNDRY_PISTONS_V91[this.alien3V91.foundryChase.sequenceIndex];
          return this.locked?.(`CORRIDOR DE RABATTEMENT INCOMPLET · ${next?.label || 'PISTONS'}`) ?? false;
        }
      }
      if (this.alien3V88?.phase === 'finale') {
        const ledge = this.alien3StationV88?.('f161-final-ledge');
        if (ledge && distance(actor, ledge) <= INTERACT_RANGE && !this.alien3V89?.finale?.started) {
          this.alien3V91.company.aaronLastStand = true;
          this.alien3V91.company.morseCustody = true;
          this.unlockAlien3CodexV91(['f161-aaron-last-stand', 'f161-morse-custody']);
          this.recoverAlien3EvidenceV91('aaron-last-stand');
          this.recoverAlien3EvidenceV91('morse-custody', { silent: true });
        }
      }
      return super.interact(actor);
    }

    updateAlien3HunterV91(seconds) {
      const state = this.alien3V91;
      const runner = this.alien3RunnerV88;
      const v88 = this.alien3V88;
      if (!state || !runner?.alive || !v88 || !this.player) return;
      const hunter = state.hunter;
      hunter.interceptCooldown = Math.max(0, hunter.interceptCooldown - seconds);
      const sensoryNoise = Number(this.alien3V90?.sensory?.noise) || 0;
      const routePressure = Number(this.alien3V90?.sensory?.repeatedRoutePressure) || 0;
      hunter.heat = clamp(Math.max(hunter.heat - seconds * 6.5, sensoryNoise * 0.58 + routePressure * 1.8), 0, 100);
      hunter.heatPeak = Math.max(Number(hunter.heatPeak) || 0, hunter.heat);
      hunter.lastPlayerX = Number(this.player.x) || hunter.lastPlayerX;
      const zoneId = this.missionLevelVisualState?.activeZoneId || null;
      if (zoneId) hunter.zoneHeat[zoneId] = clamp((Number(hunter.zoneHeat[zoneId]) || 0) + seconds * (0.5 + hunter.heat * 0.025), 0, 100);
      const previousTier = hunter.pressureTier;
      hunter.pressureTier = hunter.heat >= 76 ? 'intercept' : hunter.heat >= 48 ? 'hunt' : hunter.heat >= 20 ? 'alert' : 'quiet';
      if (previousTier !== hunter.pressureTier) this.onEvent({ type: 'alien3-v91-hunter', action: 'pressure-tier', tier: hunter.pressureTier, heat: Math.round(hunter.heat) });
      if (!v88.runner?.active || v88.runnerDefeated) return;

      const runnerRange = distance(this.player, runner);
      if (hunter.pressureTier === 'alert' && runnerRange > 950) {
        hunter.hiddenClock += seconds;
        if (hunter.hiddenClock >= 5.5) {
          hunter.hiddenClock = 0;
          hunter.shadowPasses += 1;
          state.stats.shadowPasses += 1;
          this.onEvent({ type: 'alien3-v91-hunter', action: 'shadow-pass', zoneId, count: hunter.shadowPasses });
        }
      } else hunter.hiddenClock = Math.max(0, hunter.hiddenClock - seconds * 0.5);

      if (hunter.pressureTier !== 'intercept' || hunter.interceptCooldown > 0 || runnerRange < 1050) return;
      const cameraX = Number(this.camera?.x) || Math.max(0, Number(this.player.x) - 430);
      const cameraRight = cameraX + 1280;
      const direction = Math.sign((Number(this.player.x) || 0) - (Number(hunter.lastNoiseX) || 0)) || 1;
      const anchors = ALIEN3_RUNNER_AMBUSH_ANCHORS_V89
        .filter((entry) => entry.x < cameraX - 120 || entry.x > cameraRight + 120)
        .sort((a, b) => {
          const aheadA = direction > 0 ? a.x >= this.player.x : a.x <= this.player.x;
          const aheadB = direction > 0 ? b.x >= this.player.x : b.x <= this.player.x;
          if (aheadA !== aheadB) return aheadA ? -1 : 1;
          return Math.abs(a.x - this.player.x) - Math.abs(b.x - this.player.x);
        });
      const anchor = anchors[0];
      if (!anchor) return;
      runner.x = clamp(anchor.x, 20, WORLD_WIDTH - (Number(runner.w) || 90) - 20);
      const floorY = nearestPlatformY(this, anchor.x, anchor.y + (Number(runner.h) || 90));
      runner.y = floorY - (Number(runner.h) || 90);
      runner.spawnX = runner.x;
      runner.alert = true;
      hunter.predictions += 1;
      hunter.interceptCooldown = 11;
      hunter.lastInterceptAnchorId = anchor.id;
      state.stats.predictiveAmbushes += 1;
      if (typeof this.initializeEnemyMissionNavigation === 'function') this.initializeEnemyMissionNavigation(runner);
      if (!state.evidenceRecovered.includes('runner-heatmap')) {
        this.unlockAlien3CodexV91(['f161-runner-heatmap']);
        this.recoverAlien3EvidenceV91('runner-heatmap');
      }
      this.onEvent({ type: 'alien3-v91-hunter', action: 'predictive-intercept', anchorId: anchor.id, predictions: hunter.predictions, heat: Math.round(hunter.heat) });
    }

    updateAlien3PrisonerMetricsV91() {
      const state = this.alien3V91;
      if (!state) return;
      const actors = Array.isArray(this.alien3PrisonersV89) ? this.alien3PrisonersV89 : [];
      state.prisonerAI.assignedCount = actors.filter((entry) => ['active', 'wounded'].includes(entry.status)).length;
      state.prisonerAI.movingCount = actors.filter((entry) => ['active', 'wounded'].includes(entry.status) && Math.abs(Number(entry.facing) || 0) > 0).length;
      state.prisonerAI.panicPeak = Math.max(state.prisonerAI.panicPeak, Number(this.alien3V90?.prisonerPlan?.panic) || 0);
      state.prisonerAI.chaseTeamsActive = this.alien3V88?.phase === 'leadworks' && !this.alien3V88?.runnerDefeated;
    }

    update(delta) {
      const golicBefore = Boolean(this.alien3V89?.assembly?.golicReleased);
      const finaleBefore = this.alien3V89?.finale?.stage || 'idle';
      const result = super.update(delta);
      if (!this.isAlien3MissionV91() || !this.alien3V91 || this.mission?.state !== 'active') return result;
      const seconds = clamp(delta, 0, 1);
      this.alien3V91.presentation.cardClock = Math.max(0, this.alien3V91.presentation.cardClock - seconds);
      this.alien3V91OverlayClock = Math.max(0, this.alien3V91OverlayClock - seconds);
      this.updateAlien3HunterV91(seconds);
      this.updateAlien3PrisonerMetricsV91();

      if (!golicBefore && this.alien3V89?.assembly?.golicReleased) {
        this.unlockAlien3CodexV91(['f161-golic-escape-chain']);
        this.recoverAlien3EvidenceV91('golic-escape-chain');
        this.showAlien3BeatV91('CONFINEMENT ROMPU', 'Golic a ouvert l’accès au spécimen après la directive de conservation.', 'golic-escape-chain');
        this.onEvent({ type: 'alien3-v91-golic-chain', released: true, messageSent: this.alien3V91.companyDirective.messageSent });
      }

      const finaleAfter = this.alien3V89?.finale?.stage || 'idle';
      if (finaleAfter !== finaleBefore) {
        if (['aaron-last-stand', 'furnace', 'complete'].includes(finaleAfter)) {
          this.alien3V91.company.aaronLastStand = true;
          this.unlockAlien3CodexV91(['f161-aaron-last-stand']);
          this.recoverAlien3EvidenceV91('aaron-last-stand', { silent: true });
        }
        if (finaleAfter === 'complete') {
          this.alien3V91.company.morseCustody = true;
          this.unlockAlien3CodexV91(['f161-morse-custody']);
          this.recoverAlien3EvidenceV91('morse-custody', { silent: true });
        }
        this.alien3V91LastFinaleStage = finaleAfter;
      }
      return result;
    }

    computeAlien3AchievementsV91() {
      const state = this.alien3V91;
      if (!state) return [];
      const ids = [];
      if (state.evidenceRecovered.length === ALIEN3_V91_EVIDENCE_IDS.length) ids.push('v91-archive-complete');
      if (state.foundryChase.ready && state.foundryChase.wrongOrder === 0) ids.push('v91-piston-discipline');
      if (state.hunter.predictions >= 1) ids.push('v91-read-the-hunt');
      if (this.alien3V89?.cut === 'assembly' && state.companyDirective.messageSent && this.alien3V89.assembly.golicReleased) ids.push('v91-assembly-causal-chain');
      if (state.companyDirective.cageInspected && state.company.bishopTwoConfirmed && state.company.aaronLastStand && state.company.morseCustody) ids.push('v91-company-exposed');
      if ((Number(this.alien3V90?.prisonerPlan?.panic) || 0) < 30) ids.push('v91-hold-the-line');
      return [...new Set(ids)];
    }

    completeAlien3MissionV89(actor = this.player) {
      if (!this.isAlien3MissionV91() || !this.alien3V91) return super.completeAlien3MissionV89(actor);
      const emit = this.onEvent;
      let completionEvent = null;
      this.onEvent = (event) => {
        if (event?.type === 'mission-complete') { completionEvent = event; return; }
        emit(event);
      };
      let completed = false;
      try {
        completed = super.completeAlien3MissionV89(actor);
      } finally {
        this.onEvent = emit;
      }
      if (!completed) return false;
      const state = this.alien3V91;
      state.achievementIds = this.computeAlien3AchievementsV91();
      const baseRewards = isRecord(this.mission.rewards) ? this.mission.rewards : {};
      const grade = alien3V91Grade({
        gradeV90: baseRewards.mireGradeV90 || 'D',
        evidence: state.evidenceRecovered.length,
        wrongOrder: state.foundryChase.wrongOrder,
        predictiveAmbushes: state.hunter.predictions
      });
      const gradeBonus = { 'S++': 520, 'S+': 380, S: 270, A: 180, B: 90, C: 35, D: 0 }[grade] || 0;
      this.mission.rewards = {
        ...baseRewards,
        credits: (Number(baseRewards.credits) || 0) + 120 + gradeBonus,
        alien3V91: true,
        mireGradeV91: grade,
        v91EvidenceRecovered: [...state.evidenceRecovered],
        v91CodexUnlocked: [...state.codexUnlocked],
        v91Achievements: [...state.achievementIds],
        foundryChase: {
          pistons: state.foundryChase.sequenceIndex,
          wrongOrder: state.foundryChase.wrongOrder,
          runnerFunnelConfirmed: state.foundryChase.runnerFunnelConfirmed
        },
        hunterDirectorV91: {
          predictions: state.hunter.predictions,
          shadowPasses: state.hunter.shadowPasses,
          heatPeak: Math.round(state.hunter.heatPeak),
          finalTier: state.hunter.pressureTier
        },
        companyChainV91: {
          messageSent: state.companyDirective.messageSent,
          cageInspected: state.companyDirective.cageInspected,
          bishopTwoConfirmed: state.company.bishopTwoConfirmed,
          aaronLastStand: state.company.aaronLastStand,
          morseCustody: state.company.morseCustody
        }
      };
      for (const achievementId of state.achievementIds) emit({ type: 'alien3-v91-achievement', achievementId });
      emit(completionEvent
        ? { ...completionEvent, rewards: this.mission.rewards }
        : { type: 'mission-complete', kills: Number(this.player?.kills) || 0, rewards: this.mission.rewards, extractedBy: 'primary' });
      return true;
    }

    getInteractionPrompt(actor = this.player) {
      if (!this.isAlien3MissionV91() || !this.alien3V91) return super.getInteractionPrompt(actor);
      const station = this.alien3NearestStationV91(actor);
      if (station) {
        if (station.kind === 'piston') return `E  ${station.label} · ${this.alien3V91.foundryChase.sequenceIndex}/${ALIEN3_FOUNDRY_PISTONS_V91.length}`;
        return `E  ${station.label}`;
      }
      if (this.alien3V88?.phase === 'fire-maze' && this.alien3V89?.cut === 'assembly' && this.alien3V89.assembly.wasteTankTrapped && !this.alien3V91.companyDirective.messageSent) return 'RETOURNER AUX COMMUNICATIONS · CONTACTER LA COMPAGNIE';
      if (this.alien3V88?.phase === 'leadworks' && this.alien3V90?.leadworks?.moldReady && !this.alien3V91.foundryChase.ready) {
        const next = ALIEN3_FOUNDRY_PISTONS_V91[this.alien3V91.foundryChase.sequenceIndex];
        return `CORRIDOR DE RABATTEMENT · ${next?.label || 'PRÊT'}`;
      }
      return super.getInteractionPrompt(actor);
    }

    drawAlien3V91Station(ctx, station) {
      if (!ctx || !station) return;
      ctx.save();
      ctx.fillStyle = station.kind === 'piston' ? 'rgba(70,48,28,.92)' : station.kind === 'company-message' ? 'rgba(30,39,38,.94)' : 'rgba(45,41,34,.9)';
      ctx.strokeStyle = station.kind === 'piston' ? '#c28a45' : '#8f7b57';
      ctx.lineWidth = 2;
      ctx.fillRect(station.x, station.y, station.w, station.h);
      ctx.strokeRect(station.x + 1, station.y + 1, station.w - 2, station.h - 2);
      ctx.fillStyle = '#d3bc86';
      ctx.fillRect(station.x + 8, station.y + 9, Math.max(8, station.w - 16), 7);
      if (station.kind === 'piston') {
        const active = Boolean(this.alien3V91?.foundryChase?.pistons?.[station.id]);
        ctx.fillStyle = active ? '#b8cf8d' : '#6d5e47';
        ctx.fillRect(station.x + 12, station.y + 27, Math.max(6, station.w - 24), 9);
      }
      ctx.restore();
    }

    drawAlien3V91WorldDetails(ctx) {
      if (!ctx || !this.alien3V91) return;
      ctx.save();
      // Murphy fan / upper service shaft.
      ctx.strokeStyle = 'rgba(151,143,117,.45)';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(2976, 290, 34, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 4; i += 1) {
        const angle = (Number(this.animationTime) || 0) * 0.8 + i * Math.PI / 2;
        ctx.beginPath(); ctx.moveTo(2976, 290); ctx.lineTo(2976 + Math.cos(angle) * 28, 290 + Math.sin(angle) * 28); ctx.stroke();
      }
      // Patna confinement cage appears with the Company.
      if (this.alien3V89?.company?.visible) {
        ctx.strokeStyle = 'rgba(201,211,204,.52)';
        ctx.lineWidth = 2;
        ctx.strokeRect(5888, 392, 96, 116);
        for (let x = 5898; x < 5980; x += 14) { ctx.beginPath(); ctx.moveTo(x, 394); ctx.lineTo(x, 506); ctx.stroke(); }
      }
      ctx.restore();
    }

    drawWorld(ctx) {
      super.drawWorld(ctx);
      if (!this.isAlien3MissionV91() || !this.alien3V91 || !ctx) return;
      for (const station of this.alien3StationsV91) if (this.alien3V91StationVisible(station)) this.drawAlien3V91Station(ctx, station);
      this.drawAlien3V91WorldDetails(ctx);
    }

    drawHud(ctx) {
      super.drawHud(ctx);
      if (!this.isAlien3MissionV91() || !this.alien3V91 || !ctx) return;
      const state = this.alien3V91;
      ctx.save();
      ctx.fillStyle = 'rgba(5,6,5,.91)';
      ctx.fillRect(902, 320, 360, 68);
      ctx.strokeStyle = '#79613f';
      ctx.strokeRect(902.5, 320.5, 359, 67);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#ddc58b';
      ctx.fillText(`V91 · PRESSION ${state.hunter.pressureTier.toUpperCase()} ${Math.round(state.hunter.heat)}% · INTERCEPTS ${state.hunter.predictions}`, 914, 340);
      ctx.fillStyle = '#a99a79';
      ctx.fillText(`PISTONS ${state.foundryChase.sequenceIndex}/${ALIEN3_FOUNDRY_PISTONS_V91.length} · DIRECTIVE ${state.companyDirective.messageSent ? 'OK' : '—'} · PREUVES ${state.evidenceRecovered.length}/${ALIEN3_V91_EVIDENCE_IDS.length}`, 914, 358);
      ctx.fillText(`DÉTENUS ACTIFS ${state.prisonerAI.assignedCount} · PANIQUE MAX ${Math.round(state.prisonerAI.panicPeak)}%`, 914, 376);
      ctx.restore();

      if (state.presentation.cardClock > 0 && state.presentation.title) {
        ctx.save();
        ctx.fillStyle = 'rgba(5,5,4,.94)';
        ctx.fillRect(150, 186, 980, 72);
        ctx.strokeStyle = '#7e6741';
        ctx.strokeRect(150.5, 186.5, 979, 71);
        ctx.fillStyle = '#dfc98f';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(state.presentation.title.slice(0, 90), 170, 210);
        ctx.fillStyle = '#b8b7aa';
        ctx.font = '10px monospace';
        ctx.fillText(state.presentation.subtitle.slice(0, 145), 170, 235);
        ctx.restore();
      }

      if (this.alien3V91OverlayClock > 0 && this.alien3V91OverlayId) {
        const entry = alien3V91CodexEntry(this.alien3V91OverlayId);
        if (entry) {
          ctx.save();
          ctx.fillStyle = 'rgba(4,5,4,.97)';
          ctx.fillRect(92, 490, 790, 118);
          ctx.strokeStyle = '#7f6944';
          ctx.strokeRect(92.5, 490.5, 789, 117);
          ctx.fillStyle = '#d9bf7e';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(`MIRE V91 · ${entry.category} · ${entry.title}`.slice(0, 92), 112, 514);
          ctx.fillStyle = '#c9cbc2';
          ctx.font = '10px monospace';
          const words = entry.body.split(/\s+/); const lines = []; let line = '';
          for (const word of words) { const candidate = line ? `${line} ${word}` : word; if (candidate.length > 105) { if (line) lines.push(line); line = word; } else line = candidate; }
          if (line) lines.push(line);
          lines.slice(0, 4).forEach((value, index) => ctx.fillText(value, 112, 538 + index * 17));
          ctx.restore();
        }
      }
    }

    captureResumeState() {
      const base = super.captureResumeState();
      if (!this.isAlien3MissionV91() || !this.alien3V91) return base;
      return {
        ...base,
        specialOperation: {
          ...(isRecord(base.specialOperation) ? base.specialOperation : {}),
          alien3V91: sanitizeAlien3StateV91(this.alien3V91)
        }
      };
    }

    applyResumeState(rawState) {
      const source = rawState?.specialOperation?.alien3V91 || rawState?.alien3V91;
      const result = super.applyResumeState(rawState);
      if (!this.isAlien3MissionV91() || !result?.applied) return result;
      if (!isRecord(source) || Number(source.schema) !== ALIEN3_DLC_SCHEMA_V91) return result;
      this.alien3V91 = sanitizeAlien3StateV91(source);
      this.pendingAlien3ResumeV91 = this.alien3V91;
      if (this.alien3StationsV91?.length) this.updateAlien3PrisonerMetricsV91();
      return { ...result, restored: (Number(result.restored) || 0) + 1, alien3DlcRestoredV91: true };
    }

    getAlien3SnapshotV91() {
      if (!this.isAlien3MissionV91() || !this.alien3V91) return { alien3V91: null };
      const state = sanitizeAlien3StateV91(this.alien3V91);
      return {
        alien3V91: {
          ...state,
          codexTotal: ALIEN3_CODEX_V91.length,
          evidenceTotal: ALIEN3_V91_EVIDENCE_IDS.length,
          pistonTotal: ALIEN3_FOUNDRY_PISTONS_V91.length,
          physicalStations: this.alien3StationsV91.length
        }
      };
    }

    getGameplayReport() {
      const report = super.getGameplayReport();
      return this.isAlien3MissionV91() ? { ...report, alien3V91: this.getAlien3SnapshotV91().alien3V91 } : report;
    }

    getSnapshot() {
      return { ...super.getSnapshot(), ...this.getAlien3SnapshotV91() };
    }
  };
}
