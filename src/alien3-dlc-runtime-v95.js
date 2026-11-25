import {
  ALIEN3_CAMPAIGN_ID_V95,
  ALIEN3_CODEX_V95,
  ALIEN3_DLC_SCHEMA_V95,
  ALIEN3_HUNT_PATTERNS_V95,
  ALIEN3_V95_EVIDENCE_IDS,
  ALIEN3_V95_STATIONS,
  alien3V95CodexEntry,
  alien3V95Grade,
  alien3V95HuntPattern,
  createAlien3StateV95,
  sanitizeAlien3StateV95
} from './alien3-dlc-v95.js';

const WORLD_WIDTH = 6200;
const INTERACT_RANGE = 178;
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const isRecord = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const center = (entity = {}) => ({ x: (Number(entity.x) || 0) + (Number(entity.w) || 0) / 2, y: (Number(entity.y) || 0) + (Number(entity.h) || 0) / 2 });
const distance = (a, b) => {
  if (!a || !b) return Infinity;
  const left = center(a); const right = center(b);
  return Math.hypot(left.x - right.x, left.y - right.y);
};
const activePrisoners = (engine) => (Array.isArray(engine?.alien3PrisonersV89) ? engine.alien3PrisonersV89 : [])
  .filter((entry) => ['active', 'wounded'].includes(entry?.status));

export const ALIEN3_PERSISTENT_EVENT_TYPES_V95 = Object.freeze(new Set([
  'alien3-v95-hunt', 'alien3-v95-autonomy', 'alien3-v95-resource', 'alien3-v95-chase-lock',
  'alien3-v95-checksum', 'alien3-v95-achievement', 'alien3-v95-perfect'
]));

const EVIDENCE_CODEX = Object.freeze({
  'living-hunt-ready': ['f161-v95-living-hunt'],
  'cell-overwatch-seen': ['f161-v95-cell-overwatch'],
  'service-cutoff-seen': ['f161-v95-service-cutoff'],
  'drain-return-seen': ['f161-v95-drain-return'],
  'foundry-feint-seen': ['f161-v95-foundry-feint'],
  'prisoner-autonomy': ['f161-v95-prisoner-autonomy'],
  'buddy-assist': ['f161-v95-buddy-system'],
  'panic-threshold': ['f161-v95-panic-break'],
  'shelter-cell-used': ['f161-v95-shelters'],
  'shelter-service-used': ['f161-v95-shelters'],
  'triage-overflow': ['f161-v95-triage-overflow'],
  'resource-pressure': ['f161-v95-resource-pressure'],
  'bait-switch': ['f161-v95-bait-switch'],
  'pressure-alcove': ['f161-v95-pressure-alcove'],
  'clean-evade': ['f161-v95-clean-evade'],
  'adaptive-chase-lock': ['f161-v95-adaptive-chase'],
  'hunt-telemetry': ['f161-v95-hunt-telemetry'],
  'zero-breaks': ['f161-v95-zero-breaks'],
  'checksum-final': ['f161-v95-checksum'],
  'perfect-living-hunt': ['f161-v95-perfect', 'f161-v95-one-runner']
});
const PATTERN_EVIDENCE = Object.freeze({
  'cell-overwatch': 'cell-overwatch-seen',
  'service-cutoff': 'service-cutoff-seen',
  'drain-return': 'drain-return-seen',
  'foundry-feint': 'foundry-feint-seen'
});

function nearestPlatformY(engine, x, fallback = 510) {
  const candidates = (Array.isArray(engine?.platforms) ? engine.platforms : []).filter((entry) => {
    const start = Number(entry?.x) || 0;
    const end = start + (Number(entry?.w) || 0);
    return x >= start - 32 && x <= end + 32 && Number.isFinite(Number(entry?.y));
  });
  if (!candidates.length) return fallback;
  return candidates.sort((a, b) => Math.abs(Number(a.y) - fallback) - Math.abs(Number(b.y) - fallback))[0].y;
}

function profileOrder(profileId) {
  if (profileId === 'assembly') return ['service-cutoff', 'drain-return', 'cell-overwatch', 'foundry-feint'];
  if (profileId === 'workprint') return ['drain-return', 'cell-overwatch', 'service-cutoff', 'foundry-feint'];
  return ['cell-overwatch', 'service-cutoff', 'drain-return', 'foundry-feint'];
}

export function withAlien3DlcRuntimeV95(BaseEngine) {
  return class Alien3DlcRuntimeV95 extends BaseEngine {
    start(options = {}) {
      this.alien3ActiveV95 = String(options.campaign?.id || '') === ALIEN3_CAMPAIGN_ID_V95;
      this.alien3V95 = this.alien3ActiveV95 ? createAlien3StateV95() : null;
      this.pendingAlien3ResumeV95 = null;
      this.alien3StationsV95 = [];
      const snapshot = super.start(options);
      if (!this.isAlien3MissionV95()) return snapshot;
      if (this.pendingAlien3ResumeV95) this.alien3V95 = sanitizeAlien3StateV95(this.pendingAlien3ResumeV95);
      this.configureAlien3WorldV95();
      return { ...snapshot, ...this.getAlien3SnapshotV95() };
    }

    isAlien3MissionV95() {
      return Boolean(this.alien3ActiveV95 || this.isAlien3MissionV94?.());
    }

    configureAlien3WorldV95() {
      this.alien3V95 ||= createAlien3StateV95();
      this.alien3StationsV95 = ALIEN3_V95_STATIONS.map((entry) => ({ ...entry }));
      this.syncAlien3HuntOrderV95();
      this.recoverAlien3EvidenceV95('living-hunt-ready', { silent: true });
      this.trackAlien3RunnerIdentityV95();
      this.updateAlien3PerfectV95();
      this.onEvent({ type: 'alien3-v95-hunt', action: 'runtime-ready', patterns: ALIEN3_HUNT_PATTERNS_V95.length, stations: this.alien3StationsV95.length });
      return this.alien3V95;
    }

    alien3StationV95(id) {
      return this.alien3StationsV95.find((entry) => entry.id === id) || null;
    }

    unlockAlien3CodexV95(ids = []) {
      const state = this.alien3V95;
      if (!state) return [];
      const unlocked = [];
      for (const id of ids) {
        if (!alien3V95CodexEntry(id) || state.codexUnlocked.includes(id)) continue;
        state.codexUnlocked.push(id);
        unlocked.push(id);
        this.onEvent({ type: 'alien3-v95-hunt', action: 'codex-unlocked', codexId: id });
      }
      return unlocked;
    }

    recoverAlien3EvidenceV95(id, { silent = false } = {}) {
      const state = this.alien3V95;
      if (!state || !ALIEN3_V95_EVIDENCE_IDS.includes(id) || state.evidenceRecovered.includes(id)) return false;
      state.evidenceRecovered.push(id);
      this.unlockAlien3CodexV95(EVIDENCE_CODEX[id] || []);
      if (!silent) {
        this.onEvent({ type: 'alien3-v95-hunt', action: 'evidence', evidenceId: id, total: state.evidenceRecovered.length });
        this.onEvent({ type: 'objective-action', action: `alien3-v95:evidence:${id}` });
      }
      return true;
    }

    syncAlien3HuntOrderV95() {
      const state = this.alien3V95;
      if (!state || state.hunt.encounters > 0) return;
      const profileId = this.alien3V94?.profile?.id || 'theatrical';
      state.hunt.order = profileOrder(profileId);
    }

    trackAlien3RunnerIdentityV95() {
      const state = this.alien3V95;
      const runner = this.alien3RunnerV88;
      if (!state || !runner?.id) return;
      if (!state.telemetry.uniqueRunnerIds.includes(runner.id)) state.telemetry.uniqueRunnerIds.push(String(runner.id));
      if (state.telemetry.uniqueRunnerIds.length === 1 && state.hunt.encounters >= 4) this.unlockAlien3CodexV95(['f161-v95-one-runner']);
    }

    ensureAlien3PrisonerMindsV95() {
      const state = this.alien3V95;
      if (!state) return;
      for (const [index, actor] of activePrisoners(this).entries()) {
        state.autonomy.minds[actor.id] ||= {
          stress: actor.status === 'wounded' ? 58 : 22 + (index % 4) * 5,
          fatigue: actor.status === 'wounded' ? 48 : 12 + (index % 3) * 6,
          courage: clamp(72 - (index % 5) * 6, 38, 82),
          frozenClock: 0,
          assistCooldown: 0,
          state: actor.status === 'wounded' ? 'wounded' : 'steady',
          transferred: false
        };
      }
      state.autonomy.initialized = true;
    }

    alien3V95StationVisible(station) {
      const state = this.alien3V95;
      const phase = this.alien3V88?.phase || 'wreckage';
      if (!state || !station) return false;
      if (station.kind === 'autonomy-board') return ['trap-prep', 'fire-maze', 'leadworks'].includes(phase) && !state.autonomy.boardRead;
      if (station.kind === 'shelter') return ['trap-prep', 'fire-maze', 'leadworks'].includes(phase) && !state.autonomy.shelters[station.shelterId];
      if (station.kind === 'triage') return ['trap-prep', 'fire-maze', 'leadworks'].includes(phase) && !state.autonomy.triageExtended;
      if (station.kind === 'hunt-log') return state.hunt.observed.includes(station.patternId) && !state.evidenceRecovered.includes(PATTERN_EVIDENCE[station.patternId]);
      if (station.kind === 'bait-switch') return ['leadworks', 'molten-lead'].includes(phase) && !state.resources.baitSwitchUsed;
      if (station.kind === 'pressure-alcove') return ['leadworks', 'molten-lead'].includes(phase) && !state.resources.pressureAlcoveUsed;
      if (station.kind === 'chase-observer') return ['leadworks', 'molten-lead', 'thermal-shock'].includes(phase)
        && !state.finalChase.lockArmed && Boolean(this.alien3V94?.chase?.improvised) && state.hunt.encounters >= 3;
      if (station.kind === 'checksum') return phase === 'finale' && Boolean(this.alien3V94?.fidelity?.finalTransmission)
        && state.finalChase.lockArmed && !state.finalChase.checksumFinal;
      return false;
    }

    alien3NearestStationV95(actor = this.player) {
      if (!actor || !this.alien3V95) return null;
      return this.alien3StationsV95
        .filter((station) => this.alien3V95StationVisible(station))
        .map((station) => ({ station, range: distance(actor, station) }))
        .filter((entry) => entry.range <= INTERACT_RANGE)
        .sort((a, b) => a.range - b.range)[0]?.station || null;
    }

    addAlien3ResourcePressureV95(amount, action) {
      const state = this.alien3V95;
      if (!state) return;
      state.resources.pressure = clamp(state.resources.pressure + Number(amount || 0), 0, 100);
      state.resources.economyScore = clamp(100 - state.resources.pressure, 0, 100);
      state.telemetry.resourcePressurePeak = Math.max(state.telemetry.resourcePressurePeak, state.resources.pressure);
      if (state.resources.pressure >= 12) this.recoverAlien3EvidenceV95('resource-pressure', { silent: true });
      this.onEvent({ type: 'alien3-v95-resource', action, pressure: Math.round(state.resources.pressure), economy: Math.round(state.resources.economyScore) });
    }

    useAlien3ShelterV95(shelterId) {
      const state = this.alien3V95;
      if (!state || !['cell', 'service'].includes(shelterId) || state.autonomy.shelters[shelterId]) return false;
      this.ensureAlien3PrisonerMindsV95();
      state.autonomy.shelters[shelterId] = true;
      state.resources.shelterUses += 1;
      for (const mind of Object.values(state.autonomy.minds)) {
        mind.stress = clamp(mind.stress - 18, 0, 100);
        mind.fatigue = clamp(mind.fatigue - 8, 0, 100);
      }
      this.addAlien3ResourcePressureV95(8, `shelter-${shelterId}`);
      this.recoverAlien3EvidenceV95(shelterId === 'cell' ? 'shelter-cell-used' : 'shelter-service-used');
      return true;
    }

    triggerAlien3HuntCycleV95({ force = false } = {}) {
      const state = this.alien3V95;
      const runner = this.alien3RunnerV88;
      const phase = this.alien3V88?.phase;
      if (!state || !runner?.alive || this.alien3V88?.runnerDefeated || !this.alien3V88?.runner?.active) return false;
      if (state.hunt.activePatternId || (!force && state.hunt.cooldown > 0)) return false;
      this.syncAlien3HuntOrderV95();
      const order = state.hunt.order;
      let pattern = alien3V95HuntPattern(order[state.hunt.index % order.length]);
      if (!force && !pattern.phases.includes(phase)) {
        pattern = ALIEN3_HUNT_PATTERNS_V95.find((entry) => entry.phases.includes(phase) && !state.hunt.observed.includes(entry.id))
          || ALIEN3_HUNT_PATTERNS_V95.find((entry) => entry.phases.includes(phase))
          || null;
      }
      if (!pattern) return false;
      const heat = Number(this.alien3V91?.hunter?.heat) || Number(this.alien3V89?.director?.tension) || 0;
      if (!force && heat < pattern.heat) return false;
      if (!force && distance(this.player, runner) < 760) return false;

      const runnerId = String(runner.id || 'runner-fiorina');
      if (!state.telemetry.uniqueRunnerIds.includes(runnerId)) state.telemetry.uniqueRunnerIds.push(runnerId);
      const platformY = nearestPlatformY(this, pattern.x, pattern.y + (Number(runner.h) || 90));
      runner.x = clamp(pattern.x - (Number(runner.w) || 90) / 2, 20, WORLD_WIDTH - (Number(runner.w) || 90) - 20);
      runner.y = Math.min(pattern.y, platformY - (Number(runner.h) || 90));
      runner.alert = true;
      state.hunt.activePatternId = pattern.id;
      state.hunt.lastPatternId = pattern.id;
      state.hunt.patternClock = 5.2;
      state.hunt.cooldown = 8.5;
      state.hunt.minRange = distance(this.player, runner);
      state.hunt.encounters += 1;
      state.hunt.index += 1;
      if (!state.hunt.observed.includes(pattern.id)) state.hunt.observed.push(pattern.id);
      state.telemetry.huntTriggers += 1;
      this.recoverAlien3EvidenceV95(PATTERN_EVIDENCE[pattern.id], { silent: true });
      this.onEvent({ type: 'alien3-v95-hunt', action: 'pattern-start', patternId: pattern.id, style: pattern.style, encounters: state.hunt.encounters });
      this.trackAlien3RunnerIdentityV95();
      return true;
    }

    resolveAlien3HuntCycleV95() {
      const state = this.alien3V95;
      if (!state?.hunt.activePatternId) return false;
      const clean = state.hunt.minRange > 320;
      if (clean) {
        state.hunt.cleanEvades += 1;
        state.telemetry.huntEvades += 1;
        this.recoverAlien3EvidenceV95('clean-evade', { silent: true });
      } else {
        state.hunt.contacts += 1;
        state.telemetry.huntContacts += 1;
      }
      this.onEvent({ type: 'alien3-v95-hunt', action: 'pattern-resolved', patternId: state.hunt.activePatternId, clean, minRange: Math.round(state.hunt.minRange) });
      state.hunt.activePatternId = null;
      state.hunt.patternClock = 0;
      state.hunt.minRange = 9999;
      if (state.hunt.observed.length >= ALIEN3_HUNT_PATTERNS_V95.length) {
        state.hunt.validated = true;
        this.recoverAlien3EvidenceV95('hunt-telemetry', { silent: true });
        if (state.telemetry.uniqueRunnerIds.length === 1) this.unlockAlien3CodexV95(['f161-v95-one-runner']);
      }
      return true;
    }

    updateAlien3HuntCycleV95(seconds) {
      const state = this.alien3V95;
      const runner = this.alien3RunnerV88;
      if (!state || !runner?.alive || this.alien3V88?.runnerDefeated) return;
      state.hunt.cooldown = Math.max(0, state.hunt.cooldown - seconds);
      if (state.hunt.activePatternId) {
        state.hunt.patternClock = Math.max(0, state.hunt.patternClock - seconds);
        state.hunt.minRange = Math.min(state.hunt.minRange, distance(this.player, runner));
        if (state.hunt.patternClock <= 0) this.resolveAlien3HuntCycleV95();
        return;
      }
      const phase = this.alien3V88?.phase;
      if (!['first-blood', 'bishop', 'trap-prep', 'fire-maze', 'leadworks', 'molten-lead'].includes(phase)) return;
      this.triggerAlien3HuntCycleV95();
    }

    updateAlien3PrisonerAutonomyV95(seconds) {
      const state = this.alien3V95;
      if (!state?.autonomy.boardRead) return;
      this.ensureAlien3PrisonerMindsV95();
      const runner = this.alien3RunnerV88;
      const globalPanic = Number(this.alien3V90?.prisonerPlan?.panic) || 0;
      const prisoners = activePrisoners(this);
      let steady = 0; let shaken = 0; let frozen = 0;
      for (const actor of prisoners) {
        const mind = state.autonomy.minds[actor.id];
        if (!mind) continue;
        mind.assistCooldown = Math.max(0, mind.assistCooldown - seconds);
        mind.frozenClock = Math.max(0, mind.frozenClock - seconds);
        const runnerRange = runner?.alive ? distance(actor, runner) : 9999;
        const pressure = runnerRange < 220 ? 24 : runnerRange < 480 ? 11 : runnerRange < 800 ? 3.5 : -4;
        const panicFactor = globalPanic * 0.018;
        const courageFactor = (mind.courage - 50) * 0.025;
        mind.stress = clamp(mind.stress + seconds * (pressure + panicFactor - courageFactor), 0, 100);
        mind.fatigue = clamp(mind.fatigue + seconds * (this.alien3V88?.phase === 'fire-maze' ? 2.2 : 0.65), 0, 100);

        if (actor.status === 'wounded') {
          mind.state = state.autonomy.triageExtended ? 'wounded' : 'shaken';
          if (state.autonomy.triageExtended && !mind.transferred) {
            const targetX = 3600;
            const dx = targetX - Number(actor.x || 0);
            actor.x = clamp(Number(actor.x || 0) + Math.sign(dx) * Math.min(Math.abs(dx), seconds * 42), 30, WORLD_WIDTH - 30);
            if (Math.abs(targetX - actor.x) < 28) {
              mind.transferred = true;
              mind.state = 'triage';
              mind.stress = Math.min(mind.stress, 38);
              state.autonomy.safeTransfers += 1;
              state.telemetry.triageTransfers += 1;
              this.onEvent({ type: 'alien3-v95-autonomy', action: 'triage-transfer', prisonerId: actor.id, count: state.autonomy.safeTransfers });
            }
          }
          shaken += 1;
          continue;
        }

        if (mind.frozenClock > 0) {
          mind.state = 'frozen';
          frozen += 1;
          continue;
        }
        if (mind.stress >= 88) {
          mind.frozenClock = 2.2;
          mind.state = 'frozen';
          state.autonomy.breakdowns += 1;
          state.autonomy.zeroBreaks = false;
          state.telemetry.breakdowns += 1;
          this.recoverAlien3EvidenceV95('panic-threshold', { silent: true });
          this.onEvent({ type: 'alien3-v95-autonomy', action: 'freeze', prisonerId: actor.id, stress: Math.round(mind.stress) });
          frozen += 1;
          continue;
        }
        if (mind.stress >= 62) { mind.state = 'shaken'; shaken += 1; }
        else { mind.state = 'steady'; steady += 1; }
        if (mind.stress >= 70) this.recoverAlien3EvidenceV95('panic-threshold', { silent: true });
      }

      // Buddy AI: un détenu stable aide le compagnon le plus secoué à proximité.
      for (const target of prisoners) {
        const targetMind = state.autonomy.minds[target.id];
        if (!targetMind || targetMind.stress < 64 || targetMind.frozenClock > 0 || targetMind.assistCooldown > 0) continue;
        const helper = prisoners.find((candidate) => {
          if (candidate.id === target.id) return false;
          const mind = state.autonomy.minds[candidate.id];
          return mind && mind.state === 'steady' && mind.stress <= 45 && mind.assistCooldown <= 0 && distance(candidate, target) <= 260;
        });
        if (!helper) continue;
        const helperMind = state.autonomy.minds[helper.id];
        targetMind.stress = clamp(targetMind.stress - 24, 0, 100);
        targetMind.assistCooldown = 8;
        helperMind.assistCooldown = 6;
        state.autonomy.buddyAssists += 1;
        state.telemetry.buddyAssists += 1;
        this.recoverAlien3EvidenceV95('buddy-assist', { silent: true });
        this.onEvent({ type: 'alien3-v95-autonomy', action: 'buddy-assist', helperId: helper.id, prisonerId: target.id, assists: state.autonomy.buddyAssists });
        break;
      }
      state.autonomy.steady = steady;
      state.autonomy.shaken = shaken;
      state.autonomy.frozen = frozen;
      if (state.autonomy.breakdowns === 0) state.autonomy.zeroBreaks = true;
    }

    interactAlien3V95(actor = this.player) {
      const state = this.alien3V95;
      if (!state || !actor) return false;
      const station = this.alien3NearestStationV95(actor);
      if (!station) return false;
      state.telemetry.interactions += 1;
      actor.actionClock = Math.max(Number(actor.actionClock) || 0, 0.5);

      if (station.kind === 'autonomy-board') {
        state.autonomy.boardRead = true;
        this.ensureAlien3PrisonerMindsV95();
        this.recoverAlien3EvidenceV95('prisoner-autonomy');
        this.onEvent({ type: 'alien3-v95-autonomy', action: 'board-read', prisoners: Object.keys(state.autonomy.minds).length });
        this.audio?.ui?.(); return true;
      }
      if (station.kind === 'shelter') {
        const used = this.useAlien3ShelterV95(station.shelterId);
        if (used) this.audio?.ui?.();
        return used;
      }
      if (station.kind === 'triage') {
        state.autonomy.triageExtended = true;
        this.recoverAlien3EvidenceV95('triage-overflow');
        this.addAlien3ResourcePressureV95(6, 'triage-overflow');
        this.audio?.ui?.(); return true;
      }
      if (station.kind === 'hunt-log') {
        const evidenceId = PATTERN_EVIDENCE[station.patternId];
        if (!state.hunt.observed.includes(station.patternId)) return false;
        this.recoverAlien3EvidenceV95(evidenceId);
        this.audio?.ui?.(); return true;
      }
      if (station.kind === 'bait-switch') {
        state.resources.baitSwitchUsed = true;
        this.addAlien3ResourcePressureV95(11, 'bait-switch');
        state.hunt.cooldown = 0;
        this.recoverAlien3EvidenceV95('bait-switch');
        this.onEvent({ type: 'alien3-v95-resource', action: 'bait-switch-armed' });
        this.audio?.ui?.(); return true;
      }
      if (station.kind === 'pressure-alcove') {
        state.resources.pressureAlcoveUsed = true;
        this.ensureAlien3PrisonerMindsV95();
        for (const mind of Object.values(state.autonomy.minds)) mind.stress = clamp(mind.stress - 16, 0, 100);
        if (this.alien3V91?.hunter) this.alien3V91.hunter.heat = Math.max(0, Number(this.alien3V91.hunter.heat || 0) - 12);
        this.addAlien3ResourcePressureV95(7, 'pressure-alcove');
        this.recoverAlien3EvidenceV95('pressure-alcove');
        this.audio?.ui?.(); return true;
      }
      if (station.kind === 'chase-observer') {
        if (!this.alien3V94?.chase?.improvised || state.hunt.encounters < 3) return this.locked?.('VALIDER 3 CYCLES DE CHASSE + REROUTAGES V94') ?? false;
        state.finalChase.lockArmed = true;
        state.finalChase.checksumReady = true;
        this.recoverAlien3EvidenceV95('adaptive-chase-lock');
        this.onEvent({ type: 'alien3-v95-chase-lock', encounters: state.hunt.encounters, patterns: state.hunt.observed.length });
        this.audio?.ui?.(); return true;
      }
      if (station.kind === 'checksum') {
        if (!state.finalChase.lockArmed || !this.alien3V94?.fidelity?.finalTransmission) return this.locked?.('CHASE LOCK + TRANSMISSION V94 REQUIS') ?? false;
        state.finalChase.checksumFinal = true;
        if (state.autonomy.zeroBreaks) this.recoverAlien3EvidenceV95('zero-breaks', { silent: true });
        this.recoverAlien3EvidenceV95('checksum-final');
        this.updateAlien3PerfectV95();
        this.onEvent({ type: 'alien3-v95-checksum', patterns: state.hunt.observed.length, economy: Math.round(state.resources.economyScore), zeroBreaks: state.autonomy.zeroBreaks });
        this.audio?.ui?.(); return true;
      }
      return false;
    }

    interact(actor = this.player) {
      if (!this.isAlien3MissionV95() || !this.alien3V95) return super.interact(actor);
      if (this.interactAlien3V95(actor)) return true;
      if (this.alien3V88?.phase === 'finale' && !this.alien3V95.finalChase.checksumFinal) {
        const legacy = typeof this.alien3NearestActiveStationV88 === 'function' ? this.alien3NearestActiveStationV88(actor) : null;
        if (legacy?.kind === 'finale') return this.locked?.('VALIDER LE CHECKSUM MIRE V95') ?? false;
      }
      return super.interact(actor);
    }

    updateAlien3PerfectV95() {
      const state = this.alien3V95;
      if (!state) return;
      state.perfectArchive.inheritedV94 = Boolean(this.alien3V94?.perfectArchive?.perfect);
      state.perfectArchive.huntComplete = state.hunt.observed.length === ALIEN3_HUNT_PATTERNS_V95.length && state.hunt.validated;
      state.perfectArchive.autonomyComplete = state.autonomy.boardRead && state.autonomy.triageExtended && state.autonomy.buddyAssists >= 1 && state.autonomy.zeroBreaks;
      state.perfectArchive.resourceComplete = state.resources.economyScore >= 60 && state.resources.baitSwitchUsed && state.resources.pressureAlcoveUsed;
      state.perfectArchive.chaseComplete = state.finalChase.lockArmed;
      state.perfectArchive.checksumComplete = state.finalChase.checksumFinal;
      const requiredEvidence = ALIEN3_V95_EVIDENCE_IDS.filter((id) => !['perfect-living-hunt'].includes(id));
      const ready = state.perfectArchive.inheritedV94
        && state.perfectArchive.huntComplete
        && state.perfectArchive.autonomyComplete
        && state.perfectArchive.resourceComplete
        && state.perfectArchive.chaseComplete
        && state.perfectArchive.checksumComplete
        && requiredEvidence.every((id) => state.evidenceRecovered.includes(id));
      if (!state.perfectArchive.perfect && ready) {
        state.perfectArchive.perfect = true;
        this.recoverAlien3EvidenceV95('perfect-living-hunt');
        this.onEvent({ type: 'alien3-v95-perfect', evidence: state.evidenceRecovered.length, patterns: state.hunt.observed.length });
      }
    }

    update(delta) {
      const result = super.update(delta);
      if (!this.isAlien3MissionV95() || !this.alien3V95 || this.mission?.state !== 'active') return result;
      const seconds = clamp(delta, 0, 0.25);
      this.syncAlien3HuntOrderV95();
      this.trackAlien3RunnerIdentityV95();
      this.updateAlien3HuntCycleV95(seconds);
      this.updateAlien3PrisonerAutonomyV95(seconds);
      this.updateAlien3PerfectV95();
      return result;
    }

    computeAlien3AchievementsV95() {
      const state = this.alien3V95;
      if (!state) return [];
      const ids = [];
      if (state.hunt.observed.length === ALIEN3_HUNT_PATTERNS_V95.length) ids.push('v95-four-hunts-one-runner');
      if (state.hunt.cleanEvades >= 2) ids.push('v95-ghost-of-fiorina');
      if (state.autonomy.buddyAssists >= 1) ids.push('v95-no-one-left-alone');
      if (state.autonomy.zeroBreaks) ids.push('v95-hold-together');
      if (state.resources.economyScore >= 70) ids.push('v95-industrial-discipline');
      if (state.finalChase.checksumFinal) ids.push('v95-checksum-sealed');
      if (state.perfectArchive.perfect) ids.push('v95-living-hunt-perfect');
      return [...new Set(ids)];
    }

    completeAlien3MissionV89(actor = this.player) {
      if (!this.isAlien3MissionV95() || !this.alien3V95) return super.completeAlien3MissionV89(actor);
      const emit = this.onEvent;
      let completionEvent = null;
      this.onEvent = (event) => {
        if (event?.type === 'mission-complete') { completionEvent = event; return; }
        emit(event);
      };
      let completed = false;
      try { completed = super.completeAlien3MissionV89(actor); }
      finally { this.onEvent = emit; }
      if (!completed) return false;
      this.updateAlien3PerfectV95();
      const state = this.alien3V95;
      state.achievementIds = this.computeAlien3AchievementsV95();
      const baseRewards = isRecord(this.mission.rewards) ? this.mission.rewards : {};
      const grade = alien3V95Grade({
        gradeV94: baseRewards.mireGradeV94 || 'D',
        evidence: state.evidenceRecovered.length,
        huntPatterns: state.hunt.observed.length,
        cleanEvades: state.hunt.cleanEvades,
        zeroBreaks: state.autonomy.zeroBreaks,
        economy: state.resources.economyScore,
        checksum: state.finalChase.checksumFinal,
        perfect: state.perfectArchive.perfect
      });
      const gradeBonus = { 'S++++++': 1560, 'S+++++': 1320, 'S++++': 1080, 'S+++': 850, 'S++': 650, 'S+': 480, S: 330, A: 220, B: 120, C: 50, D: 0 }[grade] || 0;
      this.mission.rewards = {
        ...baseRewards,
        credits: (Number(baseRewards.credits) || 0) + 260 + gradeBonus,
        alien3V95: true,
        mireGradeV95: grade,
        v95EvidenceRecovered: [...state.evidenceRecovered],
        v95CodexUnlocked: [...state.codexUnlocked],
        v95Achievements: [...state.achievementIds],
        livingHuntV95: {
          encounters: state.hunt.encounters,
          patterns: [...state.hunt.observed],
          cleanEvades: state.hunt.cleanEvades,
          contacts: state.hunt.contacts,
          uniqueRunnerIds: [...state.telemetry.uniqueRunnerIds]
        },
        prisonerAutonomyV95: {
          buddyAssists: state.autonomy.buddyAssists,
          breakdowns: state.autonomy.breakdowns,
          safeTransfers: state.autonomy.safeTransfers,
          zeroBreaks: state.autonomy.zeroBreaks
        },
        resourceEconomyV95: Math.round(state.resources.economyScore),
        perfectArchiveV95: { ...state.perfectArchive }
      };
      for (const achievementId of state.achievementIds) emit({ type: 'alien3-v95-achievement', achievementId });
      emit(completionEvent
        ? { ...completionEvent, rewards: this.mission.rewards }
        : { type: 'mission-complete', kills: Number(this.player?.kills) || 0, rewards: this.mission.rewards, extractedBy: 'primary' });
      return true;
    }

    getInteractionPrompt(actor = this.player) {
      if (!this.isAlien3MissionV95() || !this.alien3V95) return super.getInteractionPrompt(actor);
      const station = this.alien3NearestStationV95(actor);
      if (station) return `E  ${station.label}`;
      if (this.alien3V95.hunt.activePatternId) return `RUNNER · ${alien3V95HuntPattern(this.alien3V95.hunt.activePatternId).label}`;
      if (this.alien3V88?.phase === 'finale' && !this.alien3V95.finalChase.checksumFinal) return 'VALIDER LE CHECKSUM MIRE V95';
      return super.getInteractionPrompt(actor);
    }

    drawAlien3StationV95(ctx, station) {
      if (!ctx || !station) return;
      ctx.save();
      ctx.fillStyle = station.kind === 'checksum' ? 'rgba(28,42,42,.95)'
        : station.kind.includes('hunt') || station.kind === 'bait-switch' ? 'rgba(55,37,31,.94)'
          : 'rgba(43,46,36,.94)';
      ctx.strokeStyle = station.kind === 'checksum' ? '#86afb0' : station.kind.includes('hunt') ? '#b36d59' : '#9ca171';
      ctx.lineWidth = 2;
      ctx.fillRect(station.x, station.y, station.w, station.h);
      ctx.strokeRect(station.x + 1, station.y + 1, station.w - 2, station.h - 2);
      ctx.fillStyle = '#d8d0a7';
      ctx.fillRect(station.x + 9, station.y + 10, Math.max(8, station.w - 18), 7);
      ctx.restore();
    }

    drawWorld(ctx) {
      super.drawWorld(ctx);
      if (!this.isAlien3MissionV95() || !this.alien3V95 || !ctx) return;
      for (const station of this.alien3StationsV95) if (this.alien3V95StationVisible(station)) this.drawAlien3StationV95(ctx, station);
    }

    drawHud(ctx) {
      super.drawHud(ctx);
      if (!this.isAlien3MissionV95() || !this.alien3V95 || !ctx) return;
      const state = this.alien3V95;
      ctx.save();
      ctx.fillStyle = 'rgba(4,5,4,.94)';
      ctx.fillRect(902, 486, 360, 78);
      ctx.strokeStyle = '#596a50';
      ctx.strokeRect(902.5, 486.5, 359, 77);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#d5d9b1';
      ctx.fillText(`V95 · HUNT ${state.hunt.observed.length}/${ALIEN3_HUNT_PATTERNS_V95.length} · ÉVASIONS ${state.hunt.cleanEvades} · CONTACTS ${state.hunt.contacts}`, 914, 505);
      ctx.fillStyle = '#aaaF95';
      ctx.fillText(`DÉTENUS STABLES ${state.autonomy.steady} · SECOUÉS ${state.autonomy.shaken} · GELÉS ${state.autonomy.frozen} · AIDES ${state.autonomy.buddyAssists}`, 914, 524);
      ctx.fillText(`ÉCONOMIE ${Math.round(state.resources.economyScore)} · CHASE LOCK ${state.finalChase.lockArmed ? 'OK' : '—'} · CHECKSUM ${state.finalChase.checksumFinal ? 'OK' : '—'}`, 914, 543);
      ctx.fillText(state.perfectArchive.perfect ? 'ARCHIVE LIVING HUNT PARFAITE' : `PREUVES ${state.evidenceRecovered.length}/${ALIEN3_V95_EVIDENCE_IDS.length}`, 914, 558);
      ctx.restore();
    }

    captureResumeState() {
      const base = super.captureResumeState();
      if (!this.isAlien3MissionV95() || !this.alien3V95) return base;
      return {
        ...base,
        specialOperation: {
          ...(isRecord(base.specialOperation) ? base.specialOperation : {}),
          alien3V95: sanitizeAlien3StateV95(this.alien3V95)
        }
      };
    }

    applyResumeState(rawState) {
      const source = rawState?.specialOperation?.alien3V95 || rawState?.alien3V95;
      const result = super.applyResumeState(rawState);
      if (!this.isAlien3MissionV95() || !result?.applied) return result;
      if (!isRecord(source) || Number(source.schema) !== ALIEN3_DLC_SCHEMA_V95) return result;
      this.alien3V95 = sanitizeAlien3StateV95(source);
      this.pendingAlien3ResumeV95 = this.alien3V95;
      this.syncAlien3HuntOrderV95();
      this.updateAlien3PerfectV95();
      return { ...result, restored: (Number(result.restored) || 0) + 1, alien3DlcRestoredV95: true };
    }

    getAlien3SnapshotV95() {
      if (!this.isAlien3MissionV95() || !this.alien3V95) return { alien3V95: null };
      return {
        alien3V95: {
          ...sanitizeAlien3StateV95(this.alien3V95),
          codexTotal: ALIEN3_CODEX_V95.length,
          evidenceTotal: ALIEN3_V95_EVIDENCE_IDS.length,
          huntPatternTotal: ALIEN3_HUNT_PATTERNS_V95.length,
          stationTotal: ALIEN3_V95_STATIONS.length
        }
      };
    }

    getGameplayReport() {
      const report = super.getGameplayReport();
      return this.isAlien3MissionV95() ? { ...report, alien3V95: this.getAlien3SnapshotV95().alien3V95 } : report;
    }

    getSnapshot() {
      return { ...super.getSnapshot(), ...this.getAlien3SnapshotV95() };
    }
  };
}
