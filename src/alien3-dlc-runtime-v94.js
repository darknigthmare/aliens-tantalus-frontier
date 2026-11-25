import {
  ALIEN3_CAMPAIGN_ID_V94,
  ALIEN3_CODEX_V94,
  ALIEN3_DLC_SCHEMA_V94,
  ALIEN3_FIDELITY_BEATS_V94,
  ALIEN3_RECONSTRUCTION_PROFILES_V94,
  ALIEN3_V94_EVIDENCE_IDS,
  ALIEN3_V94_STATIONS,
  alien3V94CodexEntry,
  alien3V94Grade,
  alien3V94Profile,
  createAlien3StateV94,
  sanitizeAlien3StateV94
} from './alien3-dlc-v94.js';

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

export const ALIEN3_PERSISTENT_EVENT_TYPES_V94 = Object.freeze(new Set([
  'alien3-v94-profile', 'alien3-v94-fidelity', 'alien3-v94-battery', 'alien3-v94-social',
  'alien3-v94-runner-pov', 'alien3-v94-chase', 'alien3-v94-workprint', 'alien3-v94-final-transmission',
  'alien3-v94-achievement', 'alien3-v94-perfect'
]));

function evidenceCodex(id, state) {
  const direct = {
    'flight-recorder-chain': ['f161-v94-flight-chain'],
    'prison-faith': ['f161-v94-faith'],
    'wreckage-confrontation': ['f161-v94-wreckage'],
    'battery-cell-a': ['f161-v94-battery-duty'],
    'battery-cell-b': ['f161-v94-battery-duty'],
    'battery-duty': ['f161-v94-battery-duty'],
    'golic-cache': ['f161-v94-golic-cache'],
    'runner-pov': ['f161-v94-runner-pov'],
    'workprint-company-message': ['f161-v94-company-message'],
    'workprint-golic-release': ['f161-v94-golic-workprint'],
    'improvised-chase': ['f161-v94-improvise'],
    'manual-sprinklers': ['f161-v94-sprinkler'],
    'ripley-last-stand': ['f161-v94-suicidal-ripley'],
    'company-camera-block': ['f161-v94-camera-block'],
    'finale-order': ['f161-v94-final-order'],
    'final-transmission': ['f161-v94-final-transmission'],
    'perfect-fidelity-run': ['f161-v94-perfect']
  };
  if (id === 'profile-selected') {
    return ['f161-v94-profile', ...(state?.profile?.id === 'workprint' ? ['f161-v94-workprint'] : [])];
  }
  return direct[id] || [];
}

function nearestPlatformY(engine, x, fallback = 510) {
  const platforms = Array.isArray(engine?.platforms) ? engine.platforms : [];
  const candidates = platforms.filter((entry) => {
    const start = Number(entry?.x) || 0;
    const end = start + (Number(entry?.w) || 0);
    return x >= start - 32 && x <= end + 32 && Number.isFinite(Number(entry?.y));
  });
  if (!candidates.length) return fallback;
  return candidates.sort((a, b) => Math.abs(Number(a.y) - fallback) - Math.abs(Number(b.y) - fallback))[0].y;
}

export function withAlien3DlcRuntimeV94(BaseEngine) {
  return class Alien3DlcRuntimeV94 extends BaseEngine {
    start(options = {}) {
      this.alien3ActiveV94 = String(options.campaign?.id || '') === ALIEN3_CAMPAIGN_ID_V94;
      this.alien3V94 = this.alien3ActiveV94 ? createAlien3StateV94() : null;
      this.pendingAlien3ResumeV94 = null;
      this.alien3StationsV94 = [];
      const snapshot = super.start(options);
      if (!this.isAlien3MissionV94()) return snapshot;
      if (this.pendingAlien3ResumeV94) this.alien3V94 = sanitizeAlien3StateV94(this.pendingAlien3ResumeV94);
      this.configureAlien3WorldV94();
      return { ...snapshot, ...this.getAlien3SnapshotV94() };
    }

    isAlien3MissionV94() {
      return Boolean(this.alien3ActiveV94 || this.isAlien3MissionV93?.());
    }

    configureAlien3WorldV94() {
      this.alien3V94 ||= createAlien3StateV94();
      this.alien3StationsV94 = ALIEN3_V94_STATIONS.map((entry) => ({ ...entry }));
      // V94 remplace les deux terminaux de coupe V89 par trois profils Fidelity.
      if (Array.isArray(this.alien3StationsV89)) this.alien3StationsV89 = this.alien3StationsV89.filter((entry) => entry.kind !== 'cut');
      this.syncAlien3ProfileV94();
      this.updateAlien3PerfectV94();
      this.onEvent({ type: 'alien3-v94-fidelity', action: 'runtime-ready', profiles: ALIEN3_RECONSTRUCTION_PROFILES_V94.length, stations: this.alien3StationsV94.length });
      return this.alien3V94;
    }

    alien3StationV94(id) {
      return this.alien3StationsV94.find((entry) => entry.id === id) || null;
    }

    unlockAlien3CodexV94(ids = []) {
      const state = this.alien3V94;
      if (!state) return [];
      const unlocked = [];
      for (const id of ids) {
        if (!alien3V94CodexEntry(id) || state.codexUnlocked.includes(id)) continue;
        state.codexUnlocked.push(id);
        unlocked.push(id);
        this.onEvent({ type: 'alien3-v94-fidelity', action: 'codex-unlocked', codexId: id });
      }
      return unlocked;
    }

    recoverAlien3EvidenceV94(id, { silent = false } = {}) {
      const state = this.alien3V94;
      if (!state || !ALIEN3_V94_EVIDENCE_IDS.includes(id) || state.evidenceRecovered.includes(id)) return false;
      state.evidenceRecovered.push(id);
      this.unlockAlien3CodexV94(evidenceCodex(id, state));
      if (!silent) {
        this.onEvent({ type: 'alien3-v94-fidelity', evidenceId: id, total: state.evidenceRecovered.length });
        this.onEvent({ type: 'objective-action', action: `alien3-v94:evidence:${id}` });
      }
      return true;
    }

    markAlien3FidelityBeatV94(id) {
      const state = this.alien3V94;
      if (!state || state.fidelity.beats[id] || !ALIEN3_FIDELITY_BEATS_V94.some((entry) => entry.id === id)) return false;
      state.fidelity.beats[id] = true;
      state.fidelity.beatCount += 1;
      state.telemetry.fidelityBeats += 1;
      return true;
    }

    syncAlien3ProfileV94() {
      const state = this.alien3V94;
      if (!state) return;
      if (this.alien3V88?.crashRecorderRead) state.profile.locked = true;
      if (!state.profile.selected && state.profile.locked) {
        state.profile.id = this.alien3V89?.cut === 'assembly' ? 'assembly' : 'theatrical';
        state.profile.baseCut = alien3V94Profile(state.profile.id).baseCut;
        state.profile.selected = true;
        this.recoverAlien3EvidenceV94('profile-selected', { silent: true });
      }
    }

    setAlien3ProfileV94(profileId, actor = this.player) {
      const state = this.alien3V94;
      const profile = alien3V94Profile(profileId);
      if (!state || state.profile.locked || this.alien3V88?.crashRecorderRead) return false;
      if (typeof this.setAlien3ArchiveCutV89 === 'function') {
        const changed = this.setAlien3ArchiveCutV89(profile.baseCut, actor);
        if (!changed && this.alien3V89?.cut !== profile.baseCut) return false;
      }
      state.profile.id = profile.id;
      state.profile.baseCut = profile.baseCut;
      state.profile.selected = true;
      this.unlockAlien3CodexV94(['f161-v94-profile', ...(profile.id === 'workprint' ? ['f161-v94-workprint'] : [])]);
      this.recoverAlien3EvidenceV94('profile-selected');
      this.onEvent({ type: 'alien3-v94-profile', profileId: profile.id, baseCut: profile.baseCut, label: profile.label });
      this.audio?.ui?.();
      return true;
    }

    alien3V94StationVisible(station) {
      const state = this.alien3V94;
      const phase = this.alien3V88?.phase || 'wreckage';
      if (!state || !station) return false;
      if (station.kind === 'profile') return phase === 'wreckage' && !state.profile.locked;
      if (station.kind === 'flight-analysis') return Boolean(this.alien3V88?.crashRecorderRead) && !state.fidelity.flightRecorderAnalyzed;
      if (station.kind === 'faith') return ['infirmary', 'first-blood', 'bishop'].includes(phase) && !state.fidelity.faithObserved;
      if (station.kind === 'battery-cell') return phase === 'trap-prep' && state.profile.id !== 'theatrical' && !state.batteryDuty.cells[station.cellId];
      if (station.kind === 'battery-junction') return phase === 'trap-prep' && state.profile.id !== 'theatrical' && state.batteryDuty.tested >= 2 && !state.batteryDuty.complete;
      if (station.kind === 'golic-cache') return state.profile.id === 'workprint' && ['bishop', 'trap-prep', 'fire-maze'].includes(phase) && !state.fidelity.golicCacheFound;
      if (station.kind === 'chase-reroute') return ['leadworks', 'molten-lead'].includes(phase) && state.chase.reroutes < 3;
      if (station.kind === 'final-transmission') return phase === 'finale'
        && Boolean(this.alien3V93?.company?.witnessConfirmed)
        && !state.fidelity.finalTransmission;
      return false;
    }

    alien3NearestStationV94(actor = this.player) {
      if (!actor || !this.alien3V94) return null;
      return this.alien3StationsV94
        .filter((station) => this.alien3V94StationVisible(station))
        .map((station) => ({ station, range: distance(actor, station) }))
        .filter((entry) => entry.range <= INTERACT_RANGE)
        .sort((a, b) => a.range - b.range)[0]?.station || null;
    }

    startAlien3WreckageConfrontationV94() {
      const state = this.alien3V94;
      if (!state || state.fidelity.wreckageStarted || state.fidelity.wreckageResolved) return false;
      state.fidelity.wreckageStarted = true;
      state.fidelity.wreckageClock = 7;
      this.onEvent({
        type: 'alien3-v94-social',
        action: 'wreckage-confrontation',
        nonGraphic: true,
        objective: 'reach-safe-zone'
      });
      return true;
    }

    resolveAlien3WreckageConfrontationV94(success = true) {
      const state = this.alien3V94;
      if (!state || state.fidelity.wreckageResolved) return false;
      state.fidelity.wreckageResolved = true;
      state.fidelity.wreckageClock = 0;
      state.fidelity.dillonIntervention = true;
      state.social.trustRipley = clamp(state.social.trustRipley + (success ? 10 : 3), 0, 100);
      state.social.discipline = clamp(state.social.discipline + 6, 0, 100);
      if (!success && this.alien3V88) this.alien3V88.synchronization = clamp((Number(this.alien3V88.synchronization) || 100) - 3, 0, 100);
      this.recoverAlien3EvidenceV94('wreckage-confrontation');
      this.markAlien3FidelityBeatV94('wreckage');
      this.onEvent({ type: 'alien3-v94-social', action: 'dillon-intervention', success, trust: Math.round(state.social.trustRipley) });
      return true;
    }

    updateAlien3WreckageConfrontationV94(seconds) {
      const state = this.alien3V94;
      if (!state || !this.player || !this.alien3V88) return;
      const phase = this.alien3V88.phase;
      if (!state.fidelity.wreckageStarted && !state.fidelity.wreckageResolved && ['infirmary', 'first-blood'].includes(phase)) {
        const point = { x: 818, y: 628, w: 4, h: 4 };
        if (distance(this.player, point) <= 185) this.startAlien3WreckageConfrontationV94();
      }
      if (!state.fidelity.wreckageStarted || state.fidelity.wreckageResolved) return;
      state.fidelity.wreckageClock = Math.max(0, state.fidelity.wreckageClock - seconds);
      if ((Number(this.player.x) || 0) >= 1030) this.resolveAlien3WreckageConfrontationV94(true);
      else if (state.fidelity.wreckageClock <= 0) this.resolveAlien3WreckageConfrontationV94(false);
    }

    updateAlien3ForensicsV94() {
      const state = this.alien3V94;
      if (!state || !this.alien3V88) return;
      if (state.fidelity.flightRecorderAnalyzed && this.alien3V88.bishopRecovered && !state.fidelity.bishopCrossChecked) {
        state.fidelity.bishopCrossChecked = true;
        state.fidelity.forensicsComplete = true;
        state.social.trustRipley = clamp(state.social.trustRipley + 6, 0, 100);
        this.recoverAlien3EvidenceV94('flight-recorder-chain');
        this.onEvent({ type: 'alien3-v94-fidelity', action: 'forensics-cross-check', complete: true });
      }
    }

    updateAlien3SocialV94(seconds) {
      const state = this.alien3V94;
      if (!state) return;
      if (this.alien3V93?.routines?.boardRead && this.alien3V93.routines.avoidableCasualties === 0) {
        state.social.trustRipley = clamp(state.social.trustRipley + seconds * 0.12, 0, 100);
      }
      if (this.alien3V90?.prisonerPlan && this.alien3V88?.phase === 'fire-maze' && state.social.faith >= 60) {
        const relief = seconds * (0.2 + state.social.faith / 260);
        this.alien3V90.prisonerPlan.panic = Math.max(0, this.alien3V90.prisonerPlan.panic - relief);
        state.social.panicRelief = clamp(state.social.panicRelief + relief, 0, 100);
      }
      if (state.fidelity.faithObserved && state.fidelity.wreckageResolved && state.social.trustRipley >= 45) {
        this.unlockAlien3CodexV94(['f161-v94-social-trust']);
      }
      state.telemetry.trustPeak = Math.max(state.telemetry.trustPeak, state.social.trustRipley);
      state.telemetry.faithPeak = Math.max(state.telemetry.faithPeak, state.social.faith);
    }

    updateAlien3RunnerPovV94(seconds) {
      const state = this.alien3V94;
      const runner = this.alien3RunnerV88;
      if (!state || !runner?.alive || !this.player || !this.alien3V88?.runner?.active || this.alien3V88.runnerDefeated) return;
      state.chase.runnerPovClock = Math.max(0, state.chase.runnerPovClock - seconds);
      const range = distance(this.player, runner);
      state.chase.closestRunnerRange = Math.min(state.chase.closestRunnerRange, range);
      if (range <= 340 && state.chase.runnerPovClock <= 0) {
        state.chase.runnerPovClock = 1.15;
        state.chase.runnerPovPulses += 1;
        state.telemetry.runnerPovPulses += 1;
        this.recoverAlien3EvidenceV94('runner-pov', { silent: true });
        this.onEvent({ type: 'alien3-v94-runner-pov', range: Math.round(range), pulses: state.chase.runnerPovPulses });
      }
      if (state.profile.id === 'workprint' && ['leadworks', 'molten-lead'].includes(this.alien3V88.phase) && range <= 150 && !state.fidelity.ripleyLastStand) {
        state.fidelity.ripleyLastStand = true;
        this.recoverAlien3EvidenceV94('ripley-last-stand');
        state.telemetry.workprintBeats += 1;
        this.onEvent({ type: 'alien3-v94-workprint', action: 'ripley-last-stand', range: Math.round(range) });
      }
    }

    updateAlien3WorkprintV94() {
      const state = this.alien3V94;
      if (!state || state.profile.id !== 'workprint') return;
      if (this.alien3V91?.companyDirective?.messageSent && !state.fidelity.companyMessageVariant) {
        state.fidelity.companyMessageVariant = true;
        this.recoverAlien3EvidenceV94('workprint-company-message', { silent: true });
        state.telemetry.workprintBeats += 1;
        this.onEvent({ type: 'alien3-v94-workprint', action: 'company-message-variant' });
      }
      if (this.alien3V89?.assembly?.golicReleased && !state.fidelity.golicWorkprintSeen) {
        state.fidelity.golicWorkprintSeen = true;
        this.recoverAlien3EvidenceV94('workprint-golic-release', { silent: true });
        state.telemetry.workprintBeats += 1;
        this.onEvent({ type: 'alien3-v94-workprint', action: 'golic-release-variant' });
      }
      if (this.alien3V88?.runnerDefeated && !state.fidelity.manualSprinklers) {
        state.fidelity.manualSprinklers = true;
        this.recoverAlien3EvidenceV94('manual-sprinklers', { silent: true });
        state.telemetry.workprintBeats += 1;
      }
      if (this.alien3V93?.company?.parleyResolved && !state.fidelity.cameraBlocked) {
        state.fidelity.cameraBlocked = true;
        this.recoverAlien3EvidenceV94('company-camera-block', { silent: true });
        state.telemetry.workprintBeats += 1;
      }
      if (this.alien3V88?.phase === 'finale' && this.alien3V93?.company?.witnessConfirmed && !state.fidelity.finaleOrderLogged) {
        state.fidelity.finaleOrderLogged = true;
        this.recoverAlien3EvidenceV94('finale-order', { silent: true });
        state.telemetry.workprintBeats += 1;
      }
    }

    interactAlien3V94(actor = this.player) {
      const state = this.alien3V94;
      if (!state || !actor) return false;
      const station = this.alien3NearestStationV94(actor);
      if (!station) return false;
      state.telemetry.interactions += 1;
      actor.actionClock = Math.max(Number(actor.actionClock) || 0, 0.5);

      if (station.kind === 'profile') return this.setAlien3ProfileV94(station.profileId, actor);

      if (station.kind === 'flight-analysis') {
        state.fidelity.flightRecorderAnalyzed = true;
        this.updateAlien3ForensicsV94();
        this.onEvent({ type: 'alien3-v94-fidelity', action: 'flight-recorder-analyzed' });
        this.audio?.ui?.();
        return true;
      }

      if (station.kind === 'faith') {
        state.fidelity.faithObserved = true;
        state.social.faith = clamp(state.social.faith + 18, 0, 100);
        state.social.trustRipley = clamp(state.social.trustRipley + 5, 0, 100);
        state.social.discipline = clamp(state.social.discipline + 4, 0, 100);
        this.recoverAlien3EvidenceV94('prison-faith');
        this.markAlien3FidelityBeatV94('faith');
        this.onEvent({ type: 'alien3-v94-social', action: 'faith-observed', faith: Math.round(state.social.faith) });
        this.audio?.ui?.();
        return true;
      }

      if (station.kind === 'battery-cell') {
        if (state.batteryDuty.cells[station.cellId]) return false;
        state.batteryDuty.cells[station.cellId] = true;
        state.batteryDuty.tested = Object.values(state.batteryDuty.cells).filter(Boolean).length;
        state.telemetry.batteryChecks += 1;
        this.recoverAlien3EvidenceV94(station.cellId === 'A' ? 'battery-cell-a' : 'battery-cell-b');
        this.onEvent({ type: 'alien3-v94-battery', action: 'cell-tested', cellId: station.cellId, tested: state.batteryDuty.tested });
        this.audio?.ui?.();
        return true;
      }

      if (station.kind === 'battery-junction') {
        if (state.batteryDuty.tested < 2) return this.locked?.(`CELLULES VALIDÉES ${state.batteryDuty.tested}/2`) ?? false;
        state.batteryDuty.junctionPowered = true;
        state.batteryDuty.complete = true;
        this.recoverAlien3EvidenceV94('battery-duty');
        this.markAlien3FidelityBeatV94('battery');
        this.onEvent({ type: 'alien3-v94-battery', action: 'junction-powered', complete: true });
        this.audio?.ui?.();
        return true;
      }

      if (station.kind === 'golic-cache') {
        state.fidelity.golicCacheFound = true;
        this.recoverAlien3EvidenceV94('golic-cache');
        this.markAlien3FidelityBeatV94('golic-cache');
        this.onEvent({ type: 'alien3-v94-workprint', action: 'golic-cache-recovered' });
        this.audio?.ui?.();
        return true;
      }

      if (station.kind === 'chase-reroute') {
        const sectors = ['A', 'B', 'C'];
        const index = Math.min(2, state.chase.reroutes);
        const sector = sectors[index];
        state.chase.sectors[sector] = true;
        state.chase.reroutes += 1;
        state.chase.activeSector = sectors[Math.min(2, index + 1)];
        state.telemetry.reroutes += 1;
        const runner = this.alien3RunnerV88;
        if (runner?.alive) {
          const targetX = [4560, 4920, 5300][index];
          const groundY = nearestPlatformY(this, targetX, 510);
          runner.x = clamp(targetX, 0, WORLD_WIDTH - (Number(runner.w) || 90));
          runner.y = groundY - (Number(runner.h) || 90);
          runner.alert = true;
        }
        if (state.chase.reroutes >= 3) {
          state.chase.improvised = true;
          this.recoverAlien3EvidenceV94('improvised-chase');
          this.markAlien3FidelityBeatV94('improvise');
        }
        this.onEvent({ type: 'alien3-v94-chase', action: 'reroute', sector, reroutes: state.chase.reroutes, complete: state.chase.improvised });
        this.audio?.ui?.();
        return true;
      }

      if (station.kind === 'final-transmission') {
        state.fidelity.finalTransmission = true;
        this.recoverAlien3EvidenceV94('final-transmission');
        this.markAlien3FidelityBeatV94('transmission');
        this.updateAlien3PerfectV94();
        this.onEvent({ type: 'alien3-v94-final-transmission', profile: state.profile.id, evidence: state.evidenceRecovered.length });
        this.audio?.ui?.();
        return true;
      }
      return false;
    }

    interact(actor = this.player) {
      if (!this.isAlien3MissionV94() || !this.alien3V94) return super.interact(actor);
      if (this.interactAlien3V94(actor)) return true;

      // Assembly / Workprint : Battery Duty doit être terminé avant la mise à feu.
      if (this.alien3V88?.phase === 'trap-prep' && this.alien3V94.profile.id !== 'theatrical' && !this.alien3V94.batteryDuty.complete) {
        const legacy = typeof this.alien3NearestActiveStationV88 === 'function' ? this.alien3NearestActiveStationV88(actor) : null;
        if (legacy?.kind === 'igniter') return this.locked?.(`BATTERY DUTY ${this.alien3V94.batteryDuty.tested}/2`) ?? false;
      }

      // V94 ajoute la transmission haute avant de fermer définitivement l'archive.
      if (this.alien3V88?.phase === 'finale' && !this.alien3V94.fidelity.finalTransmission) {
        const legacy = typeof this.alien3NearestActiveStationV88 === 'function' ? this.alien3NearestActiveStationV88(actor) : null;
        if (legacy?.kind === 'finale') return this.locked?.('SCELLER LA DERNIÈRE TRANSMISSION MIRE') ?? false;
      }

      const runnerWasDefeated = Boolean(this.alien3V88?.runnerDefeated);
      const result = super.interact(actor);
      if (!runnerWasDefeated && this.alien3V88?.runnerDefeated && this.alien3V94.profile.id === 'workprint' && !this.alien3V94.fidelity.manualSprinklers) {
        this.alien3V94.fidelity.manualSprinklers = true;
        this.recoverAlien3EvidenceV94('manual-sprinklers');
      }
      return result;
    }

    updateAlien3PerfectV94() {
      const state = this.alien3V94;
      if (!state) return;
      const batteryRequired = state.profile.id !== 'theatrical';
      state.perfectArchive.inheritedV93 = Boolean(this.alien3V93?.archivePerfect?.perfect);
      state.perfectArchive.profileComplete = state.profile.selected;
      state.perfectArchive.forensicsComplete = state.fidelity.forensicsComplete;
      state.perfectArchive.batteryComplete = !batteryRequired || state.batteryDuty.complete;
      state.perfectArchive.socialComplete = state.fidelity.faithObserved && state.fidelity.wreckageResolved && state.social.trustRipley >= 45;
      state.perfectArchive.chaseComplete = state.chase.improvised;
      state.perfectArchive.transmissionComplete = state.fidelity.finalTransmission;
      const allButPerfect = ALIEN3_V94_EVIDENCE_IDS.filter((id) => id !== 'perfect-fidelity-run')
        .every((id) => state.evidenceRecovered.includes(id) || (
          state.profile.id !== 'workprint'
          && ['golic-cache', 'workprint-company-message', 'workprint-golic-release', 'manual-sprinklers', 'ripley-last-stand', 'company-camera-block', 'finale-order'].includes(id)
        ));
      const ready = state.perfectArchive.inheritedV93
        && state.perfectArchive.profileComplete
        && state.perfectArchive.forensicsComplete
        && state.perfectArchive.batteryComplete
        && state.perfectArchive.socialComplete
        && state.perfectArchive.chaseComplete
        && state.perfectArchive.transmissionComplete
        && allButPerfect;
      if (!state.perfectArchive.perfect && ready) {
        state.perfectArchive.perfect = true;
        this.recoverAlien3EvidenceV94('perfect-fidelity-run');
        this.onEvent({ type: 'alien3-v94-perfect', profile: state.profile.id, evidence: state.evidenceRecovered.length });
      }
    }

    update(delta) {
      const result = super.update(delta);
      if (!this.isAlien3MissionV94() || !this.alien3V94 || this.mission?.state !== 'active') return result;
      const seconds = clamp(delta, 0, 0.25);
      this.syncAlien3ProfileV94();
      this.updateAlien3WreckageConfrontationV94(seconds);
      this.updateAlien3ForensicsV94();
      this.updateAlien3SocialV94(seconds);
      this.updateAlien3RunnerPovV94(seconds);
      this.updateAlien3WorkprintV94();
      this.updateAlien3PerfectV94();
      return result;
    }

    computeAlien3AchievementsV94() {
      const state = this.alien3V94;
      if (!state) return [];
      const ids = [];
      if (state.profile.id === 'workprint') ids.push('v94-workprint-reconstructed');
      if (state.fidelity.forensicsComplete) ids.push('v94-forensic-chain');
      if (state.profile.id === 'theatrical' || state.batteryDuty.complete) ids.push('v94-battery-duty');
      if (state.social.trustRipley >= 60 && state.fidelity.faithObserved) ids.push('v94-trust-of-fiorina');
      if (state.chase.improvised) ids.push('v94-improvise');
      if (state.chase.runnerPovPulses >= 1) ids.push('v94-red-trace');
      if (state.fidelity.finalTransmission) ids.push('v94-final-transmission');
      if (state.perfectArchive.perfect) ids.push('v94-fidelity-perfect');
      return [...new Set(ids)];
    }

    completeAlien3MissionV89(actor = this.player) {
      if (!this.isAlien3MissionV94() || !this.alien3V94) return super.completeAlien3MissionV89(actor);
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
      this.updateAlien3PerfectV94();
      const state = this.alien3V94;
      state.achievementIds = this.computeAlien3AchievementsV94();
      const baseRewards = isRecord(this.mission.rewards) ? this.mission.rewards : {};
      const social = (state.social.faith + state.social.trustRipley + state.social.discipline) / 3;
      const grade = alien3V94Grade({
        gradeV93: baseRewards.mireGradeV93 || 'D',
        evidence: state.evidenceRecovered.length,
        fidelityBeats: state.fidelity.beatCount,
        batteryComplete: state.profile.id === 'theatrical' || state.batteryDuty.complete,
        forensicsComplete: state.fidelity.forensicsComplete,
        social,
        perfect: state.perfectArchive.perfect
      });
      const gradeBonus = { 'S+++++': 1250, 'S++++': 980, 'S+++': 760, 'S++': 560, 'S+': 410, S: 290, A: 190, B: 100, C: 40, D: 0 }[grade] || 0;
      this.mission.rewards = {
        ...baseRewards,
        credits: (Number(baseRewards.credits) || 0) + 210 + gradeBonus,
        alien3V94: true,
        mireGradeV94: grade,
        reconstructionProfileV94: state.profile.id,
        v94EvidenceRecovered: [...state.evidenceRecovered],
        v94CodexUnlocked: [...state.codexUnlocked],
        v94Achievements: [...state.achievementIds],
        fidelityV94: {
          beats: state.fidelity.beatCount,
          forensics: state.fidelity.forensicsComplete,
          batteryDuty: state.batteryDuty.complete,
          faith: Math.round(state.social.faith),
          trustRipley: Math.round(state.social.trustRipley),
          reroutes: state.chase.reroutes,
          runnerPovPulses: state.chase.runnerPovPulses
        },
        perfectArchiveV94: { ...state.perfectArchive }
      };
      for (const achievementId of state.achievementIds) emit({ type: 'alien3-v94-achievement', achievementId });
      emit(completionEvent
        ? { ...completionEvent, rewards: this.mission.rewards }
        : { type: 'mission-complete', kills: Number(this.player?.kills) || 0, rewards: this.mission.rewards, extractedBy: 'primary' });
      return true;
    }

    getInteractionPrompt(actor = this.player) {
      if (!this.isAlien3MissionV94() || !this.alien3V94) return super.getInteractionPrompt(actor);
      const station = this.alien3NearestStationV94(actor);
      if (station) return `E  ${station.label}`;
      if (this.alien3V94.fidelity.wreckageStarted && !this.alien3V94.fidelity.wreckageResolved) return `REJOINDRE LA ZONE SÛRE · ${this.alien3V94.fidelity.wreckageClock.toFixed(1)} S`;
      if (this.alien3V88?.phase === 'trap-prep' && this.alien3V94.profile.id !== 'theatrical' && !this.alien3V94.batteryDuty.complete) return `BATTERY DUTY ${this.alien3V94.batteryDuty.tested}/2`;
      if (this.alien3V88?.phase === 'finale' && !this.alien3V94.fidelity.finalTransmission) return 'SCELLER LA TRANSMISSION MIRE';
      return super.getInteractionPrompt(actor);
    }

    drawAlien3StationV94(ctx, station) {
      if (!ctx || !station) return;
      ctx.save();
      ctx.fillStyle = station.kind === 'profile' ? 'rgba(28,38,42,.95)'
        : station.kind.startsWith('battery') ? 'rgba(64,56,34,.94)'
          : station.kind === 'golic-cache' ? 'rgba(46,39,34,.94)'
            : 'rgba(39,44,41,.94)';
      ctx.strokeStyle = station.kind === 'profile' ? '#7ca4ad'
        : station.kind.startsWith('battery') ? '#c1a760'
          : '#9e8a68';
      ctx.lineWidth = 2;
      ctx.fillRect(station.x, station.y, station.w, station.h);
      ctx.strokeRect(station.x + 1, station.y + 1, station.w - 2, station.h - 2);
      ctx.fillStyle = '#d9c58f';
      ctx.fillRect(station.x + 9, station.y + 10, Math.max(8, station.w - 18), 7);
      ctx.restore();
    }

    drawWorld(ctx) {
      super.drawWorld(ctx);
      if (!this.isAlien3MissionV94() || !this.alien3V94 || !ctx) return;
      for (const station of this.alien3StationsV94) {
        if (this.alien3V94StationVisible(station)) this.drawAlien3StationV94(ctx, station);
      }
    }

    drawHud(ctx) {
      super.drawHud(ctx);
      if (!this.isAlien3MissionV94() || !this.alien3V94 || !ctx) return;
      const state = this.alien3V94;
      if (state.chase.runnerPovClock > 0) {
        const alpha = clamp(state.chase.runnerPovClock / 1.15, 0, 1) * 0.16;
        ctx.save();
        ctx.fillStyle = `rgba(125,12,8,${alpha})`;
        ctx.fillRect(0, 0, 1280, 720);
        ctx.strokeStyle = `rgba(210,55,40,${Math.min(.36, alpha * 2.1)})`;
        ctx.lineWidth = 4;
        ctx.strokeRect(8, 8, 1264, 704);
        ctx.restore();
      }
      ctx.save();
      ctx.fillStyle = 'rgba(4,5,4,.94)';
      ctx.fillRect(902, 570, 360, 76);
      ctx.strokeStyle = '#6d5d43';
      ctx.strokeRect(902.5, 570.5, 359, 75);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#ddc892';
      ctx.fillText(`V94 · ${state.profile.id.toUpperCase()} · PREUVES ${state.evidenceRecovered.length}/${ALIEN3_V94_EVIDENCE_IDS.length}`, 914, 589);
      ctx.fillStyle = '#aaa38f';
      ctx.fillText(`FORENSIC ${state.fidelity.forensicsComplete ? 'OK' : '—'} · BATTERIES ${state.batteryDuty.tested}/2 · FOI ${Math.round(state.social.faith)} · CONFIANCE ${Math.round(state.social.trustRipley)}`, 914, 608);
      ctx.fillText(`CHASE ${state.chase.reroutes}/3 · POV ${state.chase.runnerPovPulses} · TRANSMISSION ${state.fidelity.finalTransmission ? 'SCELLÉE' : '—'}`, 914, 627);
      ctx.fillText(state.perfectArchive.perfect ? 'ARCHIVE FIDELITY PARFAITE' : `BEATS ${state.fidelity.beatCount}/${ALIEN3_FIDELITY_BEATS_V94.length}`, 914, 642);
      ctx.restore();
    }

    captureResumeState() {
      const base = super.captureResumeState();
      if (!this.isAlien3MissionV94() || !this.alien3V94) return base;
      return {
        ...base,
        specialOperation: {
          ...(isRecord(base.specialOperation) ? base.specialOperation : {}),
          alien3V94: sanitizeAlien3StateV94(this.alien3V94)
        }
      };
    }

    applyResumeState(rawState) {
      const source = rawState?.specialOperation?.alien3V94 || rawState?.alien3V94;
      const result = super.applyResumeState(rawState);
      if (!this.isAlien3MissionV94() || !result?.applied) return result;
      if (!isRecord(source) || Number(source.schema) !== ALIEN3_DLC_SCHEMA_V94) return result;
      this.alien3V94 = sanitizeAlien3StateV94(source);
      this.pendingAlien3ResumeV94 = this.alien3V94;
      this.syncAlien3ProfileV94();
      this.updateAlien3PerfectV94();
      return { ...result, restored: (Number(result.restored) || 0) + 1, alien3DlcRestoredV94: true };
    }

    getAlien3SnapshotV94() {
      if (!this.isAlien3MissionV94() || !this.alien3V94) return { alien3V94: null };
      return {
        alien3V94: {
          ...sanitizeAlien3StateV94(this.alien3V94),
          codexTotal: ALIEN3_CODEX_V94.length,
          evidenceTotal: ALIEN3_V94_EVIDENCE_IDS.length,
          beatTotal: ALIEN3_FIDELITY_BEATS_V94.length,
          stationTotal: ALIEN3_V94_STATIONS.length,
          profileTotal: ALIEN3_RECONSTRUCTION_PROFILES_V94.length
        }
      };
    }

    getGameplayReport() {
      const report = super.getGameplayReport();
      return this.isAlien3MissionV94() ? { ...report, alien3V94: this.getAlien3SnapshotV94().alien3V94 } : report;
    }

    getSnapshot() {
      return { ...super.getSnapshot(), ...this.getAlien3SnapshotV94() };
    }
  };
}
