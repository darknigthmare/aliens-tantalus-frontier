import {
  ALIEN3_CAMPAIGN_ID_V93,
  ALIEN3_CODEX_V93,
  ALIEN3_DLC_SCHEMA_V93,
  ALIEN3_HISTORICAL_BEATS_V93,
  ALIEN3_PRISONER_ROUTINE_ROLES_V93,
  ALIEN3_RUNNER_PERCHES_V93,
  ALIEN3_V93_EVIDENCE_IDS,
  ALIEN3_V93_STATIONS,
  alien3V93CodexEntry,
  alien3V93Grade,
  createAlien3StateV93,
  sanitizeAlien3StateV93
} from './alien3-dlc-v93.js';
import { ALIEN3_V89_EVIDENCE_IDS } from './alien3-dlc-v89.js';
import { ALIEN3_V90_EVIDENCE_IDS } from './alien3-dlc-v90.js';
import { ALIEN3_V91_EVIDENCE_IDS } from './alien3-dlc-v91.js';
import { ALIEN3_V92_EVIDENCE_IDS } from './alien3-dlc-v92.js';

const WORLD_WIDTH = 6200;
const INTERACT_RANGE = 178;
const PHASE_ORDER = Object.freeze(['wreckage', 'infirmary', 'first-blood', 'bishop', 'trap-prep', 'fire-maze', 'leadworks', 'molten-lead', 'thermal-shock', 'company', 'finale']);
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const isRecord = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const phaseIndex = (phase) => Math.max(0, PHASE_ORDER.indexOf(phase));
const center = (entity = {}) => ({ x: (Number(entity.x) || 0) + (Number(entity.w) || 0) / 2, y: (Number(entity.y) || 0) + (Number(entity.h) || 0) / 2 });
const distance = (a, b) => {
  if (!a || !b) return Infinity;
  const left = center(a); const right = center(b);
  return Math.hypot(left.x - right.x, left.y - right.y);
};

export const ALIEN3_PERSISTENT_EVENT_TYPES_V93 = Object.freeze(new Set([
  'alien3-v93-historical-beat', 'alien3-v93-routine', 'alien3-v93-runner-perch', 'alien3-v93-runner-drop',
  'alien3-v93-company', 'alien3-v93-evidence', 'alien3-v93-achievement', 'alien3-v93-perfect-archive'
]));

function activePrisoners(engine) {
  return (Array.isArray(engine?.alien3PrisonersV89) ? engine.alien3PrisonersV89 : [])
    .filter((entry) => ['active', 'wounded'].includes(entry.status));
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

function evidenceCodex(id) {
  const map = {
    'murphy-sequence': ['f161-v93-murphy-sequence'],
    'tunnel-sequence': ['f161-v93-tunnel-sequence'],
    'clemens-sequence': ['f161-v93-clemens-sequence'],
    'andrews-sequence': ['f161-v93-andrews-sequence'],
    'prisoner-routines': ['f161-v93-prisoner-routines'],
    'prisoner-risk': ['f161-v93-prisoner-risk'],
    'runner-perches': ['f161-v93-runner-perches'],
    'runner-learning': ['f161-v93-runner-learning'],
    'company-parley': ['f161-v93-company-parley'],
    'cage-deployment': ['f161-v93-cage-deployment'],
    'aaron-charge': ['f161-v93-aaron-charge'],
    'morse-wound': ['f161-v93-morse-wound'],
    'seamless-cinematics': ['f161-v93-seamless-cinematics'],
    'perfect-archive-run': ['f161-v93-perfect-archive-run']
  };
  return map[id] || [];
}

export function withAlien3DlcRuntimeV93(BaseEngine) {
  return class Alien3DlcRuntimeV93 extends BaseEngine {
    start(options = {}) {
      this.alien3ActiveV93 = String(options.campaign?.id || '') === ALIEN3_CAMPAIGN_ID_V93;
      this.alien3V93 = this.alien3ActiveV93 ? createAlien3StateV93() : null;
      this.pendingAlien3ResumeV93 = null;
      this.alien3StationsV93 = [];
      this.alien3V93OverlayClock = 0;
      this.alien3V93OverlayId = null;
      const snapshot = super.start(options);
      if (!this.isAlien3MissionV93()) return snapshot;
      if (this.pendingAlien3ResumeV93) this.alien3V93 = sanitizeAlien3StateV93(this.pendingAlien3ResumeV93);
      this.configureAlien3WorldV93();
      return { ...snapshot, ...this.getAlien3SnapshotV93() };
    }

    isAlien3MissionV93() {
      return Boolean(this.alien3ActiveV93 || this.isAlien3MissionV92?.());
    }

    configureAlien3WorldV93() {
      this.alien3V93 ||= createAlien3StateV93();
      this.alien3StationsV93 = ALIEN3_V93_STATIONS.map((entry) => ({ ...entry }));
      this.updateAlien3ArchivePerfectV93();
      this.onEvent({ type: 'alien3-v93-company', action: 'runtime-ready', stations: this.alien3StationsV93.length, evidence: ALIEN3_V93_EVIDENCE_IDS.length });
      return this.alien3V93;
    }

    alien3StationV93(id) {
      return this.alien3StationsV93.find((entry) => entry.id === id) || null;
    }

    unlockAlien3CodexV93(ids = []) {
      const state = this.alien3V93;
      if (!state) return [];
      const unlocked = [];
      for (const id of ids) {
        if (!alien3V93CodexEntry(id) || state.codexUnlocked.includes(id)) continue;
        state.codexUnlocked.push(id);
        unlocked.push(id);
        this.onEvent({ type: 'alien3-v93-evidence', action: 'codex-unlocked', codexId: id });
      }
      return unlocked;
    }

    recoverAlien3EvidenceV93(id, { silent = false } = {}) {
      const state = this.alien3V93;
      if (!state || !ALIEN3_V93_EVIDENCE_IDS.includes(id) || state.evidenceRecovered.includes(id)) return false;
      state.evidenceRecovered.push(id);
      this.unlockAlien3CodexV93(evidenceCodex(id));
      if (!silent) {
        this.onEvent({ type: 'alien3-v93-evidence', evidenceId: id, total: state.evidenceRecovered.length });
        this.onEvent({ type: 'objective-action', action: `alien3-v93:evidence:${id}` });
      }
      return true;
    }

    showAlien3CinematicV93(title, subtitle, beatId, focusX = Number(this.player?.x) || 0) {
      const state = this.alien3V93;
      if (!state) return false;
      state.cinematic.clock = 2.2;
      state.cinematic.title = String(title || '').slice(0, 120);
      state.cinematic.subtitle = String(subtitle || '').slice(0, 220);
      state.cinematic.beatId = beatId || null;
      state.cinematic.focusX = clamp(focusX, 0, WORLD_WIDTH);
      state.cinematic.cardsShown += 1;
      state.telemetry.cinematicCards += 1;
      if (state.cinematic.cardsShown >= ALIEN3_HISTORICAL_BEATS_V93.length) this.recoverAlien3EvidenceV93('seamless-cinematics', { silent: true });
      return true;
    }

    triggerAlien3HistoricalBeatV93(beat) {
      const state = this.alien3V93;
      if (!state || !beat || state.historical.triggered[beat.id]) return false;
      state.historical.triggered[beat.id] = true;
      state.historical.count += 1;
      state.historical.lastBeatId = beat.id;
      state.telemetry.historicalBeats += 1;
      this.recoverAlien3EvidenceV93(beat.evidenceId);
      this.showAlien3CinematicV93(beat.title, beat.subtitle, `history:${beat.id}`, beat.x);
      if (this.alien3V91?.hunter) this.alien3V91.hunter.heat = clamp(this.alien3V91.hunter.heat + 8, 0, 100);
      this.onEvent({ type: 'alien3-v93-historical-beat', beatId: beat.id, title: beat.title });
      return true;
    }

    updateAlien3HistoricalBeatsV93() {
      if (!this.alien3V93 || !this.player || !this.alien3V88) return;
      const phase = this.alien3V88.phase;
      for (const beat of ALIEN3_HISTORICAL_BEATS_V93) {
        if (this.alien3V93.historical.triggered[beat.id] || !beat.phases.includes(phase)) continue;
        const point = { x: beat.x - 1, y: beat.y - 1, w: 2, h: 2 };
        if (distance(this.player, point) <= beat.radius) this.triggerAlien3HistoricalBeatV93(beat);
      }
    }

    alien3V93StationVisible(station) {
      const phase = this.alien3V88?.phase || 'wreckage';
      const state = this.alien3V93;
      if (!state || !station) return false;
      if (station.kind === 'routine-board') return ['trap-prep', 'fire-maze', 'leadworks'].includes(phase) && !state.routines.boardRead;
      if (station.kind === 'parley') return phase === 'company' && !state.company.parleyResolved;
      if (station.kind === 'aaron') return phase === 'finale' && state.company.parleyResolved && !state.company.aaronCharge;
      if (station.kind === 'morse') return phase === 'finale' && state.company.parleyResolved && !state.company.morseWound;
      if (station.kind === 'witness') return phase === 'finale' && state.company.morseWound && !state.company.witnessConfirmed;
      return false;
    }

    alien3NearestStationV93(actor = this.player) {
      if (!actor || !this.alien3V93) return null;
      return this.alien3StationsV93
        .filter((station) => this.alien3V93StationVisible(station))
        .map((station) => ({ station, range: distance(actor, station) }))
        .filter((entry) => entry.range <= INTERACT_RANGE)
        .sort((a, b) => a.range - b.range)[0]?.station || null;
    }

    assignAlien3PrisonerRoutinesV93() {
      const state = this.alien3V93;
      if (!state) return false;
      const roster = activePrisoners(this);
      if (!roster.length) return false;
      state.routines.boardRead = true;
      state.routines.assignments = {};
      let activeRoles = 0;
      for (const [index, actor] of roster.entries()) {
        const role = ALIEN3_PRISONER_ROUTINE_ROLES_V93[index % ALIEN3_PRISONER_ROUTINE_ROLES_V93.length];
        state.routines.assignments[actor.id] = role.id;
        actor.alien3RoutineRoleV93 = role.id;
        actor.alien3RoutineTargetXV93 = role.targetX;
        actor.alien3ExposureV93 = 0;
        activeRoles = Math.max(activeRoles, (index % ALIEN3_PRISONER_ROUTINE_ROLES_V93.length) + 1);
      }
      state.routines.activeRoles = activeRoles;
      state.telemetry.routineRoleChanges += roster.length;
      this.recoverAlien3EvidenceV93('prisoner-routines');
      this.onEvent({ type: 'alien3-v93-routine', action: 'assigned', count: roster.length, roles: activeRoles });
      return true;
    }

    updateAlien3PrisonerRoutinesV93(seconds) {
      const state = this.alien3V93;
      if (!state?.routines.boardRead || !this.alien3V88 || !['trap-prep', 'fire-maze', 'leadworks'].includes(this.alien3V88.phase)) return;
      const runner = this.alien3RunnerV88;
      for (const actor of activePrisoners(this)) {
        const roleId = state.routines.assignments[actor.id];
        const role = ALIEN3_PRISONER_ROUTINE_ROLES_V93.find((entry) => entry.id === roleId) || null;
        const targetX = actor.status === 'wounded' ? 3490 : Number(actor.alien3RoutineTargetXV93 ?? role?.targetX);
        if (Number.isFinite(targetX)) {
          const before = Number(actor.x) || 0;
          const step = Math.sign(targetX - before) * Math.min(Math.abs(targetX - before), seconds * (actor.status === 'wounded' ? 34 : 58));
          actor.x = clamp(before + step, 40, WORLD_WIDTH - (Number(actor.w) || 38) - 40);
          actor.facing = step < 0 ? -1 : step > 0 ? 1 : actor.facing;
          state.telemetry.routineDistance += Math.abs(step);
          if (Math.abs(targetX - actor.x) < 12) state.routines.successes += seconds * 0.05;
        }
        if (!runner?.alive || this.alien3V88?.runnerDefeated || actor.status !== 'active') continue;
        const range = distance(actor, runner);
        if (range <= 170) actor.alien3ExposureV93 = (Number(actor.alien3ExposureV93) || 0) + seconds;
        else actor.alien3ExposureV93 = Math.max(0, (Number(actor.alien3ExposureV93) || 0) - seconds * 1.6);
        if (actor.alien3ExposureV93 >= 0.8) this.recoverAlien3EvidenceV93('prisoner-risk', { silent: true });
        if (actor.alien3ExposureV93 < 2.8 || state.routines.woundedByExposure.includes(actor.id)) continue;
        actor.status = 'wounded';
        state.routines.woundedByExposure.push(actor.id);
        state.routines.avoidableCasualties += 1;
        state.routines.failures += 1;
        if (this.alien3V89?.prisoners) this.alien3V89.prisoners[actor.id] = 'wounded';
        this.onEvent({ type: 'alien3-v93-routine', action: 'exposure-wound', prisonerId: actor.id, avoidableCasualties: state.routines.avoidableCasualties });
      }
      state.archivePerfect.zeroAvoidableCasualties = state.routines.avoidableCasualties === 0;
    }

    updateAlien3RunnerMindV93(seconds) {
      const state = this.alien3V93;
      const runner = this.alien3RunnerV88;
      const player = this.player;
      if (!state || !runner?.alive || !player || !this.alien3V88?.runner?.active || this.alien3V88?.runnerDefeated) return;
      const mind = state.runnerMind;
      mind.perchCooldown = Math.max(0, mind.perchCooldown - seconds);
      mind.sampleClock += seconds;
      const speed = Math.abs(Number(player.vx) || 0);
      if (player.crouching) mind.crouchTime += seconds;
      else if (speed >= 150) mind.sprintTime += seconds;
      else if (speed <= 12) mind.stationaryTime += seconds;
      mind.lastPlayerX = Number(player.x) || mind.lastPlayerX;
      if (mind.sampleClock >= 1) {
        mind.sampleClock = 0;
        const values = [
          ['stealth', mind.crouchTime],
          ['sprint', mind.sprintTime],
          ['static', mind.stationaryTime]
        ].sort((a, b) => b[1] - a[1]);
        const total = mind.crouchTime + mind.sprintTime + mind.stationaryTime;
        mind.learnedStyle = total >= 2 && values[0][1] >= values[1][1] + 0.35 ? values[0][0] : 'mixed';
        mind.predictionStrength = clamp(total * 3 + (this.alien3V91?.hunter?.heat || 0) * 0.35, 0, 100);
        if (mind.learnedStyle !== 'mixed' && mind.predictionStrength >= 15) this.recoverAlien3EvidenceV93('runner-learning', { silent: true });
      }
      if (mind.perchClock > 0) {
        mind.perchClock = Math.max(0, mind.perchClock - seconds);
        if (mind.perchClock > 0) return;
        const perch = ALIEN3_RUNNER_PERCHES_V93.find((entry) => entry.id === mind.perchId);
        const groundY = nearestPlatformY(this, perch?.x || runner.x, 510);
        runner.y = groundY - (Number(runner.h) || 90);
        runner.alert = true;
        mind.drops += 1;
        mind.perchCooldown = 12;
        state.telemetry.runnerDrops += 1;
        this.recoverAlien3EvidenceV93('runner-perches', { silent: true });
        this.onEvent({ type: 'alien3-v93-runner-drop', perchId: mind.perchId, learnedStyle: mind.learnedStyle, drops: mind.drops });
        mind.perchId = null;
        return;
      }
      const allowedPhase = ['first-blood', 'bishop', 'fire-maze', 'leadworks'].includes(this.alien3V88.phase);
      const heat = Number(this.alien3V91?.hunter?.heat) || 0;
      const runnerRange = distance(player, runner);
      if (!allowedPhase || mind.perchCooldown > 0 || runnerRange < 950 || heat < 18 || heat > 82) return;
      const cameraX = Number(this.camera?.x) || Math.max(0, Number(player.x) - 430);
      const cameraRight = cameraX + 1280;
      const candidates = ALIEN3_RUNNER_PERCHES_V93.filter((entry) => entry.x < cameraX - 150 || entry.x > cameraRight + 150);
      const directional = mind.learnedStyle === 'sprint'
        ? candidates.sort((a, b) => Math.abs(a.x - (player.x + Math.sign(player.vx || 1) * 700)) - Math.abs(b.x - (player.x + Math.sign(player.vx || 1) * 700)))
        : candidates.sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x));
      const perch = directional[0];
      if (!perch) return;
      runner.x = clamp(perch.x - (Number(runner.w) || 90) / 2, 20, WORLD_WIDTH - (Number(runner.w) || 90) - 20);
      runner.y = perch.y;
      runner.spawnX = runner.x;
      runner.alert = false;
      mind.perchId = perch.id;
      mind.perchClock = mind.learnedStyle === 'static' ? 1.5 : mind.learnedStyle === 'sprint' ? 1.9 : 2.3;
      mind.offscreenRepositions += 1;
      state.telemetry.runnerPerches += 1;
      this.recoverAlien3EvidenceV93('runner-perches', { silent: true });
      this.onEvent({ type: 'alien3-v93-runner-perch', perchId: perch.id, learnedStyle: mind.learnedStyle, predictionStrength: mind.predictionStrength });
    }

    updateEnemy(enemy, delta) {
      if (this.isAlien3MissionV93() && enemy === this.alien3RunnerV88 && this.alien3V93?.runnerMind?.perchClock > 0) return;
      return super.updateEnemy(enemy, delta);
    }

    interactAlien3V93(actor = this.player) {
      const state = this.alien3V93;
      const station = this.alien3NearestStationV93(actor);
      if (!state || !station || !actor) return false;
      actor.actionClock = Math.max(Number(actor.actionClock) || 0, 0.55);
      if (station.kind === 'routine-board') return this.assignAlien3PrisonerRoutinesV93();
      if (station.kind === 'parley') {
        state.company.parleyStarted = true;
        state.company.parleyResolved = true;
        state.company.cageDeployed = true;
        state.telemetry.companyInteractions += 1;
        this.recoverAlien3EvidenceV93('company-parley');
        this.recoverAlien3EvidenceV93('cage-deployment');
        if (this.alien3V91?.companyDirective) this.alien3V91.companyDirective.cageInspected = true;
        this.showAlien3CinematicV93('PATNA · POURPARLERS', 'La Compagnie propose la récupération. La cage est déjà prête.', 'company-parley', station.x);
        this.onEvent({ type: 'alien3-v93-company', action: 'parley-resolved', cageDeployed: true });
        return true;
      }
      if (station.kind === 'aaron') {
        state.company.aaronCharge = true;
        state.telemetry.companyInteractions += 1;
        if (this.alien3V91?.company) this.alien3V91.company.aaronLastStand = true;
        if (this.alien3V89?.company) this.alien3V89.company.aaronDefiant = true;
        this.recoverAlien3EvidenceV93('aaron-charge');
        this.showAlien3CinematicV93('AARON · DERNIER REFUS', 'La chaîne administrative se brise une dernière fois.', 'aaron-charge', station.x);
        this.onEvent({ type: 'alien3-v93-company', action: 'aaron-charge' });
        return true;
      }
      if (station.kind === 'morse') {
        state.company.morseWound = true;
        state.telemetry.companyInteractions += 1;
        if (this.alien3V89?.company) this.alien3V89.company.morseWounded = true;
        this.alien3V89?.syncAlien3PrisonerRosterV89?.();
        this.recoverAlien3EvidenceV93('morse-wound');
        this.showAlien3CinematicV93('MORSE · BLESSÉ', 'Le dernier témoin reste vivant, mais il ne quitte pas Fiorina libre.', 'morse-wound', station.x);
        this.onEvent({ type: 'alien3-v93-company', action: 'morse-wound' });
        return true;
      }
      if (station.kind === 'witness') {
        state.company.witnessConfirmed = true;
        state.telemetry.companyInteractions += 1;
        if (this.alien3V91?.company) this.alien3V91.company.morseCustody = true;
        this.showAlien3CinematicV93('DÉPOSITION MORSE', 'La fermeture de Fiorina possède désormais un témoin humain identifié.', 'witness', station.x);
        this.onEvent({ type: 'alien3-v93-company', action: 'witness-confirmed' });
        return true;
      }
      return false;
    }

    interact(actor = this.player) {
      if (!this.isAlien3MissionV93() || !this.alien3V93) return super.interact(actor);
      if (this.interactAlien3V93(actor)) return true;
      return super.interact(actor);
    }

    updateAlien3ArchivePerfectV93() {
      const state = this.alien3V93;
      if (!state) return;
      const inheritedComplete = (this.alien3V89?.evidenceRecovered?.length || 0) >= ALIEN3_V89_EVIDENCE_IDS.length
        && (this.alien3V90?.evidenceRecovered?.length || 0) >= ALIEN3_V90_EVIDENCE_IDS.length
        && (this.alien3V91?.evidenceRecovered?.length || 0) >= ALIEN3_V91_EVIDENCE_IDS.length
        && (this.alien3V92?.evidenceRecovered?.length || 0) >= ALIEN3_V92_EVIDENCE_IDS.length;
      state.archivePerfect.inheritedComplete = inheritedComplete;
      state.archivePerfect.historicalComplete = state.historical.count >= ALIEN3_HISTORICAL_BEATS_V93.length;
      state.archivePerfect.zeroAvoidableCasualties = state.routines.avoidableCasualties === 0;
      state.archivePerfect.finaleComplete = Boolean(state.company.parleyResolved && state.company.aaronCharge && state.company.morseWound && state.company.witnessConfirmed);
      const v93Complete = ALIEN3_V93_EVIDENCE_IDS.filter((id) => id !== 'perfect-archive-run').every((id) => state.evidenceRecovered.includes(id));
      const finaleReady = Boolean(this.alien3V88?.runnerDefeated) && phaseIndex(this.alien3V88?.phase) >= phaseIndex('finale');
      if (!state.archivePerfect.perfect && inheritedComplete && state.archivePerfect.historicalComplete && state.archivePerfect.zeroAvoidableCasualties && state.archivePerfect.finaleComplete && v93Complete && finaleReady) {
        state.archivePerfect.perfect = true;
        this.recoverAlien3EvidenceV93('perfect-archive-run');
        this.onEvent({ type: 'alien3-v93-perfect-archive', evidence: state.evidenceRecovered.length });
      }
    }

    update(delta) {
      const result = super.update(delta);
      if (!this.isAlien3MissionV93() || !this.alien3V93 || this.mission?.state !== 'active') return result;
      const seconds = clamp(delta, 0, 0.25);
      this.alien3V93OverlayClock = Math.max(0, this.alien3V93OverlayClock - seconds);
      this.alien3V93.cinematic.clock = Math.max(0, this.alien3V93.cinematic.clock - seconds);
      this.updateAlien3HistoricalBeatsV93();
      this.updateAlien3PrisonerRoutinesV93(seconds);
      this.updateAlien3RunnerMindV93(seconds);
      this.updateAlien3ArchivePerfectV93();
      return result;
    }

    computeAlien3AchievementsV93() {
      const state = this.alien3V93;
      if (!state) return [];
      const ids = [];
      if (state.historical.count === ALIEN3_HISTORICAL_BEATS_V93.length) ids.push('v93-four-historical-beats');
      if (state.routines.boardRead && state.routines.activeRoles === ALIEN3_PRISONER_ROUTINE_ROLES_V93.length) ids.push('v93-living-cast');
      if (state.routines.avoidableCasualties === 0 && state.routines.boardRead) ids.push('v93-zero-avoidable-loss');
      if (state.runnerMind.drops >= 1) ids.push('v93-ceiling-hunter');
      if (state.company.parleyResolved && state.company.aaronCharge && state.company.morseWound) ids.push('v93-company-face-to-face');
      if (state.company.witnessConfirmed) ids.push('v93-last-witness');
      if (state.archivePerfect.perfect) ids.push('v93-archive-perfect');
      return [...new Set(ids)];
    }

    completeAlien3MissionV89(actor = this.player) {
      if (!this.isAlien3MissionV93() || !this.alien3V93) return super.completeAlien3MissionV89(actor);
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
      this.updateAlien3ArchivePerfectV93();
      const state = this.alien3V93;
      state.achievementIds = this.computeAlien3AchievementsV93();
      const baseRewards = isRecord(this.mission.rewards) ? this.mission.rewards : {};
      const grade = alien3V93Grade({
        gradeV92: baseRewards.mireGradeV92 || 'D',
        evidence: state.evidenceRecovered.length,
        avoidableCasualties: state.routines.avoidableCasualties,
        historical: state.historical.count,
        perfect: state.archivePerfect.perfect
      });
      const gradeBonus = { 'S++++': 980, 'S+++': 760, 'S++': 560, 'S+': 410, S: 290, A: 190, B: 100, C: 40, D: 0 }[grade] || 0;
      this.mission.rewards = {
        ...baseRewards,
        credits: (Number(baseRewards.credits) || 0) + 175 + gradeBonus,
        alien3V93: true,
        mireGradeV93: grade,
        v93EvidenceRecovered: [...state.evidenceRecovered],
        v93CodexUnlocked: [...state.codexUnlocked],
        v93Achievements: [...state.achievementIds],
        livingCastV93: {
          historicalBeats: state.historical.count,
          routineRoles: state.routines.activeRoles,
          avoidableCasualties: state.routines.avoidableCasualties,
          safeTransfers: state.routines.safeTransfers
        },
        runnerMindV93: {
          learnedStyle: state.runnerMind.learnedStyle,
          predictionStrength: Math.round(state.runnerMind.predictionStrength),
          perches: state.telemetry.runnerPerches,
          drops: state.runnerMind.drops
        },
        companyFinaleV93: { ...state.company },
        archivePerfectV93: { ...state.archivePerfect }
      };
      for (const achievementId of state.achievementIds) emit({ type: 'alien3-v93-achievement', achievementId });
      emit(completionEvent
        ? { ...completionEvent, rewards: this.mission.rewards }
        : { type: 'mission-complete', kills: Number(this.player?.kills) || 0, rewards: this.mission.rewards, extractedBy: 'primary' });
      return true;
    }

    getInteractionPrompt(actor = this.player) {
      if (!this.isAlien3MissionV93() || !this.alien3V93) return super.getInteractionPrompt(actor);
      const station = this.alien3NearestStationV93(actor);
      if (station) return `E  ${station.label}`;
      return super.getInteractionPrompt(actor);
    }

    drawAlien3StationV93(ctx, station) {
      if (!ctx || !station) return;
      ctx.save();
      ctx.fillStyle = station.kind === 'parley' ? 'rgba(38,48,47,.95)' : station.kind === 'routine-board' ? 'rgba(53,47,37,.94)' : 'rgba(48,43,36,.94)';
      ctx.strokeStyle = station.kind === 'parley' ? '#9bb0a9' : '#ab8d59';
      ctx.lineWidth = 2;
      ctx.fillRect(station.x, station.y, station.w, station.h);
      ctx.strokeRect(station.x + 1, station.y + 1, station.w - 2, station.h - 2);
      ctx.fillStyle = '#d5bf88';
      ctx.fillRect(station.x + 9, station.y + 10, Math.max(8, station.w - 18), 8);
      ctx.restore();
    }

    drawAlien3PerchesV93(ctx) {
      if (!ctx || !this.alien3V93) return;
      ctx.save();
      ctx.strokeStyle = 'rgba(105,94,76,.2)';
      ctx.lineWidth = 2;
      for (const perch of ALIEN3_RUNNER_PERCHES_V93) {
        ctx.beginPath(); ctx.moveTo(perch.x - 75, perch.y + 82); ctx.lineTo(perch.x + 75, perch.y + 82); ctx.stroke();
      }
      ctx.restore();
    }

    drawWorld(ctx) {
      super.drawWorld(ctx);
      if (!this.isAlien3MissionV93() || !this.alien3V93 || !ctx) return;
      this.drawAlien3PerchesV93(ctx);
      for (const station of this.alien3StationsV93) if (this.alien3V93StationVisible(station)) this.drawAlien3StationV93(ctx, station);
    }

    drawHud(ctx) {
      super.drawHud(ctx);
      if (!this.isAlien3MissionV93() || !this.alien3V93 || !ctx) return;
      const state = this.alien3V93;
      ctx.save();
      ctx.fillStyle = 'rgba(4,5,4,.94)';
      ctx.fillRect(902, 484, 360, 82);
      ctx.strokeStyle = '#6e593c';
      ctx.strokeRect(902.5, 484.5, 359, 81);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#dbc48b';
      ctx.fillText(`V93 · RUNNER ${state.runnerMind.learnedStyle.toUpperCase()} ${Math.round(state.runnerMind.predictionStrength)}% · PERCHOIRS ${state.telemetry.runnerPerches}`, 914, 504);
      ctx.fillStyle = '#a99d82';
      ctx.fillText(`BEATS ${state.historical.count}/${ALIEN3_HISTORICAL_BEATS_V93.length} · RÔLES ${state.routines.activeRoles}/${ALIEN3_PRISONER_ROUTINE_ROLES_V93.length} · PERTES ÉVIT. ${state.routines.avoidableCasualties}`, 914, 522);
      ctx.fillText(`PATNA ${state.company.parleyResolved ? 'PARLEY' : '—'} · AARON ${state.company.aaronCharge ? 'OK' : '—'} · MORSE ${state.company.witnessConfirmed ? 'TÉMOIN' : state.company.morseWound ? 'BLESSÉ' : '—'}`, 914, 540);
      ctx.fillText(`PREUVES ${state.evidenceRecovered.length}/${ALIEN3_V93_EVIDENCE_IDS.length} · ${state.archivePerfect.perfect ? 'ARCHIVE PARFAITE' : 'ARCHIVE EN COURS'}`, 914, 558);
      ctx.restore();

      if (state.cinematic.clock > 0 && state.cinematic.title) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,.75)';
        ctx.fillRect(0, 0, 1280, 26);
        ctx.fillRect(0, 694, 1280, 26);
        ctx.fillStyle = 'rgba(5,5,4,.94)';
        ctx.fillRect(156, 104, 968, 72);
        ctx.strokeStyle = '#7c6745';
        ctx.strokeRect(156.5, 104.5, 967, 71);
        ctx.fillStyle = '#dfc991';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(state.cinematic.title.slice(0, 94), 176, 130);
        ctx.fillStyle = '#bbb9ab';
        ctx.font = '10px monospace';
        ctx.fillText(state.cinematic.subtitle.slice(0, 145), 176, 154);
        ctx.restore();
      }
    }

    captureResumeState() {
      const base = super.captureResumeState();
      if (!this.isAlien3MissionV93() || !this.alien3V93) return base;
      return {
        ...base,
        specialOperation: {
          ...(isRecord(base.specialOperation) ? base.specialOperation : {}),
          alien3V93: sanitizeAlien3StateV93(this.alien3V93)
        }
      };
    }

    applyResumeState(rawState) {
      const source = rawState?.specialOperation?.alien3V93 || rawState?.alien3V93;
      const result = super.applyResumeState(rawState);
      if (!this.isAlien3MissionV93() || !result?.applied) return result;
      if (!isRecord(source) || Number(source.schema) !== ALIEN3_DLC_SCHEMA_V93) return result;
      this.alien3V93 = sanitizeAlien3StateV93(source);
      this.pendingAlien3ResumeV93 = this.alien3V93;
      this.updateAlien3ArchivePerfectV93();
      return { ...result, restored: (Number(result.restored) || 0) + 1, alien3DlcRestoredV93: true };
    }

    getAlien3SnapshotV93() {
      if (!this.isAlien3MissionV93() || !this.alien3V93) return { alien3V93: null };
      return {
        alien3V93: {
          ...sanitizeAlien3StateV93(this.alien3V93),
          codexTotal: ALIEN3_CODEX_V93.length,
          evidenceTotal: ALIEN3_V93_EVIDENCE_IDS.length,
          historicalTotal: ALIEN3_HISTORICAL_BEATS_V93.length,
          perchTotal: ALIEN3_RUNNER_PERCHES_V93.length,
          roleTotal: ALIEN3_PRISONER_ROUTINE_ROLES_V93.length,
          physicalStations: this.alien3StationsV93.length
        }
      };
    }

    getGameplayReport() {
      const report = super.getGameplayReport();
      return this.isAlien3MissionV93() ? { ...report, alien3V93: this.getAlien3SnapshotV93().alien3V93 } : report;
    }

    getSnapshot() {
      return { ...super.getSnapshot(), ...this.getAlien3SnapshotV93() };
    }
  };
}
