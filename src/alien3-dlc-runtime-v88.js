import {
  ALIEN3_CAMPAIGN_ID_V88,
  ALIEN3_CAST_V88,
  ALIEN3_CHAPTERS_V88,
  ALIEN3_CODEX_V88,
  ALIEN3_DLC_SCHEMA_V88,
  ALIEN3_OPERATION_ID_V88,
  ALIEN3_PHASES_V88,
  alien3ChapterV88,
  alien3CodexEntryV88,
  createAlien3StateV88,
  sanitizeAlien3StateV88
} from './alien3-dlc-v88.js';

const WORLD_WIDTH = 6200;
const GROUND_Y = 510;
const STATION_W = 72;
const STATION_H = 72;
const INTERACT_RANGE = 155;
const RUNNER_TRAP_RANGE = 430;
const FLARE_RANGE = 470;
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const isRecord = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const center = (entity = {}) => ({ x: (Number(entity.x) || 0) + (Number(entity.w) || 0) / 2, y: (Number(entity.y) || 0) + (Number(entity.h) || 0) / 2 });
const distance = (a, b) => {
  if (!a || !b) return Infinity;
  const left = center(a);
  const right = center(b);
  return Math.hypot(left.x - right.x, left.y - right.y);
};
const text = (value, fallback = '', max = 160) => typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;

export const ALIEN3_PERSISTENT_EVENT_TYPES_V88 = Object.freeze(new Set([
  'alien3-phase',
  'alien3-evidence',
  'alien3-cache',
  'alien3-flare',
  'alien3-trap',
  'alien3-runner-state',
  'alien3-codex-unlocked',
  'alien3-company-refused',
  'alien3-finale'
]));

export const ALIEN3_STATIONS_V88 = Object.freeze([
  Object.freeze({ id: 'f161-eev-recorder', kind: 'evidence', phase: 'wreckage', x: 610, y: GROUND_Y - STATION_H, w: STATION_W, h: STATION_H, label: 'LECTEUR EEV' }),
  Object.freeze({ id: 'f161-autopsy', kind: 'autopsy', phase: 'infirmary', x: 1260, y: GROUND_Y - STATION_H, w: 84, h: STATION_H, label: 'TABLE D’AUTOPSIE' }),
  Object.freeze({ id: 'f161-bishop-memory', kind: 'bishop', phase: 'bishop', x: 3470, y: GROUND_Y - STATION_H, w: 88, h: STATION_H, label: 'INTERFACE BISHOP' }),
  Object.freeze({ id: 'f161-cache-infirmary', kind: 'cache', cacheId: 'infirmary', phase: 'trap-prep', x: 2900, y: GROUND_Y - 58, w: 62, h: 58, label: 'CHARGE INCENDIAIRE A' }),
  Object.freeze({ id: 'f161-cache-cellblock', kind: 'cache', cacheId: 'cellblock', phase: 'trap-prep', x: 3260, y: GROUND_Y - 58, w: 62, h: 58, label: 'CHARGE INCENDIAIRE B' }),
  Object.freeze({ id: 'f161-cache-service', kind: 'cache', cacheId: 'service', phase: 'trap-prep', x: 3820, y: 630 - 58, w: 62, h: 58, label: 'CHARGE INCENDIAIRE C' }),
  Object.freeze({ id: 'f161-fire-igniter', kind: 'igniter', phase: 'trap-prep', x: 4160, y: GROUND_Y - STATION_H, w: 82, h: STATION_H, label: 'MISE À FEU DES GALERIES' }),
  Object.freeze({ id: 'f161-mold-control', kind: 'mold', phase: 'leadworks', x: 4880, y: GROUND_Y - 86, w: 92, h: 86, label: 'VANNE DU MOULE' }),
  Object.freeze({ id: 'f161-sprinkler-control', kind: 'sprinkler', phase: 'molten-lead', x: 4520, y: 330 - STATION_H, w: 84, h: STATION_H, label: 'VANNE D’EXTINCTION' }),
  Object.freeze({ id: 'f161-company-contact', kind: 'company', phase: 'company', x: 5750, y: GROUND_Y - STATION_H, w: 90, h: STATION_H, label: 'ÉQUIPE DE RÉCUPÉRATION' }),
  Object.freeze({ id: 'f161-final-ledge', kind: 'finale', phase: 'finale', x: 5980, y: GROUND_Y - STATION_H, w: 90, h: STATION_H, label: 'PLATEFORME DU FOUR' })
]);

const RUNNER_PHASES = new Set(['first-blood', 'fire-maze', 'leadworks', 'molten-lead']);
const PHASE_CHECKPOINT_X = Object.freeze({
  wreckage: 200,
  infirmary: 1040,
  'first-blood': 1780,
  bishop: 3320,
  'trap-prep': 2920,
  'fire-maze': 4070,
  leadworks: 4380,
  'molten-lead': 4840,
  'thermal-shock': 5200,
  company: 5570,
  finale: 5870
});

const castById = (id) => ALIEN3_CAST_V88.find((entry) => entry.id === id) || null;

function sanitizeRunnerSnapshot(source) {
  if (!isRecord(source)) return null;
  return {
    id: text(source.id, 'f161-runner', 128),
    x: clamp(source.x, 0, WORLD_WIDTH),
    y: clamp(source.y, 0, 1080),
    health: clamp(source.health, 0, 5000),
    maxHealth: clamp(source.maxHealth || source.health || 720, 1, 5000),
    alive: source.alive !== false && Number(source.health) > 0,
    facing: Number(source.facing) < 0 ? -1 : 1,
    speed: clamp(source.speed, 0.1, 1000),
    damage: clamp(source.damage, 0, 1000)
  };
}

function phaseIndex(phase) {
  return Math.max(0, ALIEN3_PHASES_V88.indexOf(phase));
}

export function withAlien3DlcRuntimeV88(BaseEngine) {
  return class Alien3DlcRuntimeV88 extends BaseEngine {
    start(options = {}) {
      this.alien3ActiveV88 = String(options.campaign?.id || '') === ALIEN3_CAMPAIGN_ID_V88;
      this.alien3EnemyCatalogV88 = Array.isArray(options.enemyCatalog) ? [...options.enemyCatalog] : [];
      this.alien3V88 = this.alien3ActiveV88 ? createAlien3StateV88() : null;
      this.pendingAlien3ResumeV88 = null;
      this.pendingAlien3RunnerResumeV88 = null;
      this.alien3StationsV88 = [];
      this.alien3CastV88 = [];
      this.alien3RunnerV88 = null;
      this.alien3CodexOverlayClockV88 = 0;
      this.alien3EventThrottleV88 = 0;
      const snapshot = super.start(options);
      if (!this.isAlien3MissionV88()) return snapshot;
      if (this.pendingAlien3ResumeV88) this.alien3V88 = sanitizeAlien3StateV88(this.pendingAlien3ResumeV88);
      this.configureAlien3WorldV88({ restored: Boolean(this.lastResumeResult?.applied || this.pendingAlien3ResumeV88) });
      this.applyAlien3RunnerResumeV88(this.pendingAlien3RunnerResumeV88);
      this.syncAlien3MissionFlagsV88();
      this.onEvent({
        type: 'special-operation-started',
        operationId: ALIEN3_OPERATION_ID_V88,
        campaignId: ALIEN3_CAMPAIGN_ID_V88,
        phase: this.alien3V88.phase,
        archive: 'MIRE',
        location: 'Fiorina 161'
      });
      this.emitAlien3PhaseV88('resume-or-start');
      return { ...snapshot, ...this.getAlien3SnapshotV88() };
    }

    isAlien3MissionV88() {
      return Boolean(this.alien3ActiveV88
        || this.campaign?.id === ALIEN3_CAMPAIGN_ID_V88
        || this.missionPlan?.campaign?.id === ALIEN3_CAMPAIGN_ID_V88);
    }

    alien3StationV88(id) {
      return this.alien3StationsV88.find((entry) => entry.id === id) || null;
    }

    configureAlien3WorldV88({ restored = false } = {}) {
      const state = this.alien3V88 || createAlien3StateV88();
      this.alien3V88 = state;
      this.alien3StationsV88 = ALIEN3_STATIONS_V88.map((entry) => ({ ...entry }));
      this.alien3CastV88 = ALIEN3_CAST_V88.map((entry) => ({ ...entry }));

      // MIRE replays one archived protagonist, not the player's live Echo-9 squad.
      this.coopEnabled = false;
      if (this.coop) {
        this.coop.alive = false;
        this.coop.inVehicle = false;
        this.coop.x = -4000;
      }
      if (this.vehicle) {
        this.vehicle.active = false;
        this.vehicle.occupied = false;
        this.vehicle.driver = null;
        this.vehicle.passengers = [];
        this.vehicle.x = -4000;
      }

      // Remove the generic frontier loadout props created before the authored
      // Fiorina layer is applied. Medical supplies remain usable; firearms,
      // ammo crates, generic objective devices and the cutter are absent.
      if (this.weaponPickup) {
        this.weaponPickup.taken = true;
        this.weaponPickup.x = -4000;
      }
      if (this.toolPickup) {
        this.toolPickup.taken = true;
        this.toolPickup.x = -4000;
      }
      if (Array.isArray(this.supplies)) this.supplies = this.supplies.filter((entry) => entry?.type !== 'ammo');
      if (Array.isArray(this.objectiveNodes)) this.objectiveNodes.splice(0, this.objectiveNodes.length);
      if (this.archiveTerminal) {
        this.archiveTerminal.recovered = true;
        this.archiveTerminal.x = -4000;
      }
      if (this.powerNode) {
        this.powerNode.active = true;
        this.powerNode.x = -4000;
      }
      if (this.objective) {
        const extraction = this.missionLevelRuntime?.anchors?.extraction;
        Object.assign(this.objective, {
          id: 'f161-final-objective',
          x: extraction ? Number(extraction.x) - 43 : 5980,
          y: GROUND_Y - 96,
          w: 86,
          h: 96,
          complete: state.complete
        });
      }
      for (const door of this.doors || []) {
        if (/f161/i.test(door.id || '')) {
          door.open = true;
          door.lockedBy = null;
        }
      }
      // V51 creates a generic encounter before the V52 authored level is applied.
      // Fiorina deliberately contains a single hostile specimen, so discard the
      // inherited encounter and create/restore only the Runner below.
      if (Array.isArray(this.enemies)) this.enemies.splice(0, this.enemies.length);
      this.ensureAlien3RunnerV88(restored);
      this.updateAlien3CastStatusV88();
      return state;
    }

    ensureAlien3RunnerV88(restored = false) {
      const state = this.alien3V88;
      let runner = (this.enemies || []).find((enemy) => enemy?.alien3RunnerV88)
        || (state.runner.id ? (this.enemies || []).find((enemy) => enemy.id === state.runner.id) : null);
      if (!runner && typeof this.createEnemy === 'function') {
        const profile = this.alien3EnemyCatalogV88.find((entry) => (
          String(entry?.biology || '').toLowerCase() === 'xenomorph'
          && (String(entry?.caste || '').toLowerCase() === 'runner' || /\brunner\b/i.test(entry?.name || ''))
        )) || {
          id: 'enemy-006-runner', name: 'Runner', biology: 'xenomorph', caste: 'runner',
          health: 720, damage: 29, speed: 1.9, armor: 18
        };
        const startX = restored ? 1880 : 1780;
        runner = this.createEnemy(profile, (this.enemies || []).length, startX, GROUND_Y, { boss: true, keyCarrier: false });
        if (runner && Array.isArray(this.enemies) && !this.enemies.includes(runner)) this.enemies.push(runner);
      }
      if (!runner) return null;
      const baseSpeed = Number.isFinite(Number(runner.alien3BaseSpeedV88)) ? Number(runner.alien3BaseSpeedV88) : Math.max(1.65, Number(runner.speed) || 1.9);
      const baseDamage = Number.isFinite(Number(runner.alien3BaseDamageV88)) ? Number(runner.alien3BaseDamageV88) : Math.max(24, Number(runner.damage) || 29);
      Object.assign(runner, {
        alien3RunnerV88: true,
        alien3BaseSpeedV88: baseSpeed,
        alien3BaseDamageV88: baseDamage,
        name: 'Runner · Fiorina 161',
        biology: 'xenomorph',
        caste: 'runner',
        behavior: 'pursuit',
        isBoss: true,
        isRoyal: false,
        keyCarrier: false,
        alert: Boolean(state.runner.active),
        maxHealth: Math.max(720, Number(runner.maxHealth) || 0),
        damage: baseDamage,
        speed: state.moltenLeadApplied ? baseSpeed * 0.52 : baseSpeed
      });
      runner.health = state.runnerDefeated ? 0 : clamp(runner.health || runner.maxHealth, 1, runner.maxHealth);
      runner.alive = !state.runnerDefeated;
      runner.alien3DormantV88 = !state.runner.active || state.runnerDefeated;
      state.runner.id = runner.id;
      this.alien3RunnerV88 = runner;
      if (typeof this.initializeEnemyMissionNavigation === 'function') this.initializeEnemyMissionNavigation(runner);
      return runner;
    }

    updateAlien3CastStatusV88() {
      const state = this.alien3V88;
      if (!state) return;
      if (phaseIndex(state.phase) >= phaseIndex('first-blood')) state.survivors.clemens = false;
      if (phaseIndex(state.phase) >= phaseIndex('bishop')) state.survivors.andrews = false;
      if (phaseIndex(state.phase) >= phaseIndex('molten-lead')) state.survivors.dillon = false;
      if (phaseIndex(state.phase) >= phaseIndex('finale')) state.survivors.aaron = false;
      for (const actor of this.alien3CastV88) {
        if (actor.id === 'ripley' || actor.id === 'bishop') continue;
        if (Object.hasOwn(state.survivors, actor.id)) actor.status = state.survivors[actor.id] ? 'active' : 'deceased';
      }
    }

    syncAlien3MissionFlagsV88() {
      if (!this.isAlien3MissionV88() || !this.mission || !this.alien3V88) return;
      const state = this.alien3V88;
      this.mission.objectives.power = state.fireMazeIgnited;
      this.mission.objectives.route = phaseIndex(state.phase) >= phaseIndex('leadworks');
      this.mission.objectives.boss = state.runnerDefeated;
      this.mission.objectives.archive = state.bishopRecovered;
      this.mission.objectives.extract = state.complete;
      if (this.objective) this.objective.complete = state.complete;
    }

    unlockAlien3CodexV88(ids = []) {
      const state = this.alien3V88;
      if (!state) return [];
      const unlocked = [];
      for (const id of ids) {
        if (!alien3CodexEntryV88(id) || state.codexUnlocked.includes(id)) continue;
        state.codexUnlocked.push(id);
        unlocked.push(id);
        this.onEvent({ type: 'alien3-codex-unlocked', codexId: id });
      }
      return unlocked;
    }

    emitAlien3PhaseV88(reason = 'progress') {
      const state = this.alien3V88;
      if (!state) return;
      const chapter = alien3ChapterV88(state.phase);
      this.unlockAlien3CodexV88(chapter.codex || []);
      this.onEvent({
        type: 'alien3-phase',
        operationId: ALIEN3_OPERATION_ID_V88,
        phase: state.phase,
        chapter: chapter.number,
        title: chapter.title,
        objective: chapter.objective,
        synchronization: Math.round(state.synchronization),
        reason
      });
      // Existing app persistence already treats objective-action as durable.
      this.onEvent({ type: 'objective-action', action: `alien3:${state.phase}` });
    }

    advanceAlien3PhaseV88(nextPhase, reason = 'objective') {
      const state = this.alien3V88;
      if (!state || !ALIEN3_PHASES_V88.includes(nextPhase)) return false;
      const current = phaseIndex(state.phase);
      const target = phaseIndex(nextPhase);
      if (target < current) return false;
      if (target === current && state.phase === nextPhase) return false;
      state.phase = nextPhase;
      state.chapterIndex = target;
      state.phaseClock = 0;
      state.checkpointPhase = nextPhase;
      state.runner.active = RUNNER_PHASES.has(nextPhase) && !state.runnerDefeated;
      if (this.alien3RunnerV88) {
        this.alien3RunnerV88.alien3DormantV88 = !state.runner.active;
        this.alien3RunnerV88.alert = state.runner.active;
        this.alien3RunnerV88.speed = state.moltenLeadApplied
          ? this.alien3RunnerV88.alien3BaseSpeedV88 * 0.52
          : this.alien3RunnerV88.alien3BaseSpeedV88;
      }
      this.updateAlien3CastStatusV88();
      this.syncAlien3MissionFlagsV88();
      this.emitAlien3PhaseV88(reason);
      return true;
    }

    alien3NearestActiveStationV88(actor = this.player) {
      if (!actor || !this.alien3V88) return null;
      const state = this.alien3V88;
      const candidates = this.alien3StationsV88.filter((station) => {
        if (station.kind === 'cache') return state.phase === 'trap-prep' && !state.caches[station.cacheId];
        if (station.kind === 'igniter') return state.phase === 'trap-prep';
        return station.phase === state.phase;
      });
      return candidates
        .map((station) => ({ station, distance: distance(actor, station) }))
        .filter((entry) => entry.distance <= INTERACT_RANGE)
        .sort((a, b) => a.distance - b.distance)[0]?.station || null;
    }

    collectAlien3CacheV88(station, actor) {
      const state = this.alien3V88;
      if (!station?.cacheId || state.caches[station.cacheId]) return false;
      state.caches[station.cacheId] = true;
      state.flares = Math.min(12, state.flares + 2);
      state.fireMazeArmed = Object.values(state.caches).every(Boolean);
      actor.actionClock = Math.max(Number(actor.actionClock) || 0, 0.55);
      this.onEvent({ type: 'alien3-cache', cacheId: station.cacheId, flares: state.flares, armed: state.fireMazeArmed });
      this.onEvent({ type: 'objective-action', action: `alien3-cache:${station.cacheId}` });
      this.audio?.ui?.();
      return true;
    }

    interactAlien3V88(actor = this.player) {
      const state = this.alien3V88;
      if (!state || !actor) return false;
      const station = this.alien3NearestActiveStationV88(actor);
      if (!station) return false;
      actor.actionClock = Math.max(Number(actor.actionClock) || 0, 0.6);

      if (station.kind === 'evidence') {
        state.crashRecorderRead = true;
        this.unlockAlien3CodexV88(['sulaco-eev']);
        this.onEvent({ type: 'alien3-evidence', evidenceId: 'eev-recorder', location: 'Fiorina 161' });
        this.advanceAlien3PhaseV88('infirmary', 'eev-inspected');
        this.audio?.ui?.();
        return true;
      }
      if (station.kind === 'autopsy') {
        state.autopsyComplete = true;
        this.unlockAlien3CodexV88(['queen-embryo', 'f161-infirmary']);
        state.runner.active = true;
        state.runner.encounterCount += 1;
        if (this.alien3RunnerV88) {
          this.alien3RunnerV88.x = Math.max(1520, actor.x + 420);
          this.alien3RunnerV88.y = GROUND_Y - this.alien3RunnerV88.h;
          this.alien3RunnerV88.spawnX = this.alien3RunnerV88.x;
          this.alien3RunnerV88.alert = true;
          this.alien3RunnerV88.alien3DormantV88 = false;
        }
        this.onEvent({ type: 'alien3-evidence', evidenceId: 'autopsy', queenSignal: true });
        this.advanceAlien3PhaseV88('first-blood', 'autopsy-complete');
        this.audio?.alarm?.();
        return true;
      }
      if (station.kind === 'bishop') {
        state.bishopRecovered = true;
        state.runner.active = false;
        if (this.alien3RunnerV88) this.alien3RunnerV88.alien3DormantV88 = true;
        this.unlockAlien3CodexV88(['bishop-damaged']);
        this.onEvent({ type: 'alien3-evidence', evidenceId: 'bishop-memory', recovered: true });
        this.advanceAlien3PhaseV88('trap-prep', 'bishop-memory-recovered');
        this.audio?.ui?.();
        return true;
      }
      if (station.kind === 'cache') return this.collectAlien3CacheV88(station, actor);
      if (station.kind === 'igniter') {
        if (!state.fireMazeArmed) return typeof this.locked === 'function' ? this.locked('RÉCUPÉRER LES 3 CHARGES INCENDIAIRES') : false;
        state.fireMazeIgnited = true;
        state.runner.active = true;
        state.runner.encounterCount += 1;
        if (this.alien3RunnerV88) {
          this.alien3RunnerV88.alien3DormantV88 = false;
          this.alien3RunnerV88.alert = true;
        }
        this.onEvent({ type: 'alien3-trap', action: 'fire-maze-ignited' });
        if (typeof this.triggerMissionLevelEvent === 'function') this.triggerMissionLevelEvent('f161-fire-maze', 'alien3-v88');
        this.advanceAlien3PhaseV88('fire-maze', 'fire-maze-ignited');
        this.audio?.alarm?.();
        return true;
      }
      if (station.kind === 'mold') {
        if (!this.alien3RunnerV88?.alive) return typeof this.locked === 'function' ? this.locked('CIBLE RUNNER ABSENTE DU MOULE') : false;
        if (distance(this.alien3RunnerV88, station) > RUNNER_TRAP_RANGE) return typeof this.locked === 'function' ? this.locked('ATTIRER LE RUNNER DANS LE MOULE') : false;
        state.moltenLeadApplied = true;
        state.runner.trapDamageApplied = true;
        state.runner.active = true;
        this.alien3RunnerV88.speed = this.alien3RunnerV88.alien3BaseSpeedV88 * 0.52;
        this.alien3RunnerV88.staggerClock = Math.max(Number(this.alien3RunnerV88.staggerClock) || 0, 2.4);
        super.applyEnemyDamage(this.alien3RunnerV88, Math.max(1, this.alien3RunnerV88.maxHealth * 0.58), {
          owner: actor, kind: 'alien3-trap-molten-lead', x: center(this.alien3RunnerV88).x, y: center(this.alien3RunnerV88).y
        });
        this.onEvent({ type: 'alien3-trap', action: 'molten-lead', runnerHealth: Math.round(this.alien3RunnerV88.health) });
        this.advanceAlien3PhaseV88('molten-lead', 'molten-lead-applied');
        this.audio?.hit?.();
        return true;
      }
      if (station.kind === 'sprinkler') {
        if (!state.moltenLeadApplied) return typeof this.locked === 'function' ? this.locked('LE PLOMB DOIT ÊTRE DÉVERSÉ EN PREMIER') : false;
        state.thermalShockApplied = true;
        state.runner.thermalKillConfirmed = true;
        state.runner.active = false;
        if (this.alien3RunnerV88?.alive) {
          super.applyEnemyDamage(this.alien3RunnerV88, this.alien3RunnerV88.maxHealth * 4, {
            owner: actor, kind: 'alien3-trap-thermal-shock', x: center(this.alien3RunnerV88).x, y: center(this.alien3RunnerV88).y
          });
        }
        state.runnerDefeated = true;
        if (this.alien3RunnerV88) this.alien3RunnerV88.alien3DormantV88 = true;
        this.onEvent({ type: 'alien3-trap', action: 'thermal-shock', runnerDefeated: true });
        this.onEvent({ type: 'alien3-runner-state', state: 'neutralized' });
        this.advanceAlien3PhaseV88('thermal-shock', 'runner-neutralized');
        this.audio?.hit?.();
        return true;
      }
      if (station.kind === 'company') {
        if (!state.runnerDefeated) return typeof this.locked === 'function' ? this.locked('RUNNER TOUJOURS ACTIF') : false;
        state.companyRefused = true;
        state.synchronization = clamp(state.synchronization + 2, 0, 100);
        this.unlockAlien3CodexV88(['company-retrieval']);
        this.onEvent({ type: 'alien3-company-refused', canonRoute: true });
        this.advanceAlien3PhaseV88('finale', 'company-refused');
        this.audio?.ui?.();
        return true;
      }
      if (station.kind === 'finale') {
        if (!state.companyRefused) return typeof this.locked === 'function' ? this.locked('RÉSOUDRE LE CONTACT AVEC LA COMPAGNIE') : false;
        state.finaleCommitted = true;
        this.unlockAlien3CodexV88(['f161-final-record']);
        this.onEvent({ type: 'alien3-finale', canonRoute: true, synchronization: Math.round(state.synchronization) });
        return this.completeAlien3MissionV88(actor);
      }
      return false;
    }

    interact(actor = this.player) {
      if (!this.isAlien3MissionV88() || !this.alien3V88) return super.interact(actor);
      if (this.interactAlien3V88(actor)) return true;
      return super.interact(actor);
    }

    fire(actor = this.player) {
      if (!this.isAlien3MissionV88() || !this.alien3V88) return super.fire(actor);
      const state = this.alien3V88;
      if (!actor?.alive || this.mission?.state !== 'active') return false;
      if (state.flareCooldown > 0) return false;
      if (state.flares <= 0) return typeof this.locked === 'function' ? this.locked('AUCUNE ARME À FEU · TROUVER DES FLARES') : false;
      state.flares -= 1;
      state.flareCooldown = 1.15;
      actor.fireClock = Math.max(Number(actor.fireClock) || 0, 0.55);
      actor.actionClock = Math.max(Number(actor.actionClock) || 0, 0.5);
      const runner = this.alien3RunnerV88;
      const close = runner?.alive && distance(actor, runner) <= FLARE_RANGE;
      if (close) {
        runner.alert = true;
        runner.revealed = Math.max(Number(runner.revealed) || 0, 2.5);
        runner.staggerClock = Math.max(Number(runner.staggerClock) || 0, 0.42);
        runner.facing = center(runner).x < center(actor).x ? 1 : -1;
      }
      this.onEvent({ type: 'alien3-flare', remaining: state.flares, distracted: Boolean(close) });
      this.onEvent({ type: 'objective-action', action: 'alien3:flare' });
      this.audio?.ui?.();
      return true;
    }

    reload(actor = this.player) {
      if (this.isAlien3MissionV88()) return typeof this.locked === 'function' ? this.locked('CHRONIQUE FIORINA · AUCUN CHARGEUR DISPONIBLE') : false;
      return super.reload(actor);
    }

    toggleVehicle(actor = this.player) {
      if (this.isAlien3MissionV88()) return typeof this.locked === 'function' ? this.locked('AUCUN VÉHICULE OPÉRATIONNEL SUR FIORINA 161') : false;
      return super.toggleVehicle(actor);
    }

    useEquipment(equipmentId, actor = this.player) {
      if (this.isAlien3MissionV88() && /sentry|turret|mine|explosive|drone/i.test(String(equipmentId || ''))) {
        return typeof this.locked === 'function' ? this.locked('ARCHIVE MIRE · ÉQUIPEMENT MILITAIRE EXCLU') : false;
      }
      return super.useEquipment(equipmentId, actor);
    }

    activateTracker(actor = this.player) {
      if (!this.isAlien3MissionV88() || !this.alien3V88) return super.activateTracker(actor);
      const ids = this.alien3V88.codexUnlocked;
      if (!ids.length) return false;
      const current = ids.indexOf(this.alien3V88.currentCodexId);
      const id = ids[(current + 1 + ids.length) % ids.length];
      this.alien3V88.currentCodexId = id;
      if (!this.alien3V88.codexViewed.includes(id)) this.alien3V88.codexViewed.push(id);
      this.alien3CodexOverlayClockV88 = 6;
      const entry = alien3CodexEntryV88(id);
      this.onEvent({ type: 'alien3-evidence', evidenceId: `codex:${id}`, title: entry?.title || id });
      this.audio?.ui?.();
      return true;
    }

    applyEnemyDamage(enemy, amount, source = {}) {
      if (!this.isAlien3MissionV88() || enemy !== this.alien3RunnerV88) return super.applyEnemyDamage(enemy, amount, source);
      if (!String(source?.kind || '').startsWith('alien3-trap')) {
        if (this.alien3EventThrottleV88 <= 0) {
          this.alien3EventThrottleV88 = 1.25;
          this.onEvent({ type: 'alien3-runner-state', state: 'resisted-conventional-damage' });
        }
        return 0;
      }
      return super.applyEnemyDamage(enemy, amount, source);
    }

    updateEnemy(enemy, delta) {
      if (this.isAlien3MissionV88() && enemy === this.alien3RunnerV88 && (enemy.alien3DormantV88 || !this.alien3V88?.runner.active)) return;
      return super.updateEnemy(enemy, delta);
    }

    drawEnemy(ctx, enemy) {
      if (this.isAlien3MissionV88() && enemy === this.alien3RunnerV88 && enemy.alien3DormantV88 && this.alien3V88?.phase !== 'thermal-shock') return;
      return super.drawEnemy(ctx, enemy);
    }

    defeatEnemy(enemy, owner = this.player) {
      const alien3Runner = this.isAlien3MissionV88() && enemy === this.alien3RunnerV88;
      const result = super.defeatEnemy(enemy, owner);
      if (alien3Runner && this.alien3V88) {
        this.alien3V88.runnerDefeated = true;
        this.alien3V88.runner.active = false;
        enemy.alien3DormantV88 = true;
        this.syncAlien3MissionFlagsV88();
      }
      return result;
    }

    damagePlayer(actor, amount, options = {}) {
      const result = super.damagePlayer(actor, amount, options);
      if (this.isAlien3MissionV88() && this.alien3V88 && Number(amount) > 0) {
        this.alien3V88.synchronization = clamp(this.alien3V88.synchronization - Math.min(3, Number(amount) * 0.025), 0, 100);
      }
      return result;
    }

    update(delta) {
      const result = super.update(delta);
      if (!this.isAlien3MissionV88() || !this.alien3V88 || this.mission?.state !== 'active') return result;
      const seconds = clamp(delta, 0, 1);
      const state = this.alien3V88;
      state.phaseClock += seconds;
      state.totalClock += seconds;
      state.flareCooldown = Math.max(0, state.flareCooldown - seconds);
      this.alien3CodexOverlayClockV88 = Math.max(0, this.alien3CodexOverlayClockV88 - seconds);
      this.alien3EventThrottleV88 = Math.max(0, this.alien3EventThrottleV88 - seconds);

      if (state.phase === 'first-blood' && this.player?.x >= 2720) {
        state.runner.active = false;
        if (this.alien3RunnerV88) this.alien3RunnerV88.alien3DormantV88 = true;
        this.advanceAlien3PhaseV88('bishop', 'escaped-first-hunt');
      }
      if (state.phase === 'fire-maze' && this.player?.x >= 4320) {
        if (typeof this.triggerMissionLevelEvent === 'function') this.triggerMissionLevelEvent('f161-leadworks-awake', 'alien3-v88');
        this.advanceAlien3PhaseV88('leadworks', 'reached-leadworks');
      }
      if (state.phase === 'thermal-shock' && state.phaseClock >= 1.2 && state.runnerDefeated) this.advanceAlien3PhaseV88('company', 'runner-confirmed-dead');

      if (this.alien3RunnerV88) {
        this.alien3RunnerV88.alien3DormantV88 = !state.runner.active || state.runnerDefeated;
        this.alien3RunnerV88.alert = Boolean(state.runner.active && !state.runnerDefeated);
        if (state.moltenLeadApplied && this.alien3RunnerV88.alive) {
          this.alien3RunnerV88.speed = this.alien3RunnerV88.alien3BaseSpeedV88 * 0.52;
          this.alien3RunnerV88.hurtClock = Math.max(Number(this.alien3RunnerV88.hurtClock) || 0, 0.08);
        }
      }
      this.syncAlien3MissionFlagsV88();
      return result;
    }

    missingObjectiveRequirement(options = {}) {
      if (!this.isAlien3MissionV88() || !this.alien3V88) return super.missingObjectiveRequirement(options);
      const state = this.alien3V88;
      if (!state.bishopRecovered) return 'MÉMOIRE BISHOP NON RÉCUPÉRÉE';
      if (!state.fireMazeIgnited) return 'PIÈGE INCENDIAIRE NON ARMÉ';
      if (!state.runnerDefeated) return 'RUNNER ENCORE ACTIF';
      return '';
    }

    missingExtractionRequirement() {
      if (!this.isAlien3MissionV88() || !this.alien3V88) return super.missingExtractionRequirement();
      const state = this.alien3V88;
      if (!state.runnerDefeated) return 'RUNNER ENCORE ACTIF';
      if (!state.companyRefused) return 'CONTACT CORPORATIF NON RÉSOLU';
      if (!state.finaleCommitted) return 'RECONSTRUCTION MIRE NON SCELLÉE';
      return '';
    }

    completeAlien3MissionV88(actor = this.player) {
      const state = this.alien3V88;
      if (!state || state.complete || this.mission?.state !== 'active' || this.missingExtractionRequirement()) return false;
      this.mission.objectives.power = true;
      this.mission.objectives.route = true;
      this.mission.objectives.boss = true;
      this.mission.objectives.archive = true;
      const emit = this.onEvent;
      let completionEvent = null;
      this.onEvent = (event) => {
        if (event?.type === 'mission-complete') { completionEvent = event; return; }
        emit(event);
      };
      let completed = false;
      try {
        completed = super.completeMission(actor);
      } finally {
        this.onEvent = emit;
      }
      if (!completed) return false;
      state.complete = true;
      state.failed = false;
      this.mission.objectives.extract = true;
      if (this.objective) this.objective.complete = true;
      const baseRewards = isRecord(this.mission.rewards) ? this.mission.rewards : {};
      this.mission.rewards = {
        ...baseRewards,
        credits: (Number(baseRewards.credits) || 0) + 850,
        salvage: (Number(baseRewards.salvage) || 0) + 35,
        intel: (Number(baseRewards.intel) || 0) + 8,
        alien3Archive: true,
        mireSynchronization: Math.round(state.synchronization),
        runnerDefeated: true,
        canonRoute: true,
        codexUnlocked: [...state.codexUnlocked],
        survivingPrisoners: Object.values(state.survivors).filter(Boolean).length
      };
      emit(completionEvent
        ? { ...completionEvent, rewards: this.mission.rewards }
        : {
            type: 'mission-complete',
            kills: (Number(this.player?.kills) || 0) + (Number(this.coop?.kills) || 0),
            rewards: this.mission.rewards,
            objectiveId: ALIEN3_OPERATION_ID_V88,
            extractedBy: actor?.coop ? 'coop' : 'primary'
          });
      return true;
    }

    completeMission(actor = this.player) {
      if (this.isAlien3MissionV88()) return this.completeAlien3MissionV88(actor);
      return super.completeMission(actor);
    }

    restartFromCheckpoint() {
      const phase = this.alien3V88?.checkpointPhase;
      const result = super.restartFromCheckpoint();
      if (!result || !this.isAlien3MissionV88() || !this.alien3V88) return result;
      const x = PHASE_CHECKPOINT_X[phase] ?? 200;
      if (this.player) {
        this.player.x = x;
        this.player.y = GROUND_Y - this.player.h;
        this.player.vx = 0;
        this.player.vy = 0;
      }
      if (this.coop) {
        this.coop.x = Math.max(20, x - 58);
        this.coop.y = GROUND_Y - this.coop.h;
      }
      if (this.alien3RunnerV88?.alive) {
        this.alien3RunnerV88.x = Math.min(WORLD_WIDTH - this.alien3RunnerV88.w - 40, x + 620);
        this.alien3RunnerV88.y = GROUND_Y - this.alien3RunnerV88.h;
      }
      this.alien3V88.failed = false;
      this.syncAlien3MissionFlagsV88();
      return result;
    }

    phaseLabel() {
      if (!this.isAlien3MissionV88() || !this.alien3V88) return super.phaseLabel();
      const chapter = alien3ChapterV88(this.alien3V88.phase);
      return `CH. ${String(chapter.number).padStart(2, '0')} · ${chapter.title}`;
    }

    objectiveProgressText() {
      if (!this.isAlien3MissionV88() || !this.alien3V88) return super.objectiveProgressText();
      const state = this.alien3V88;
      if (state.phase === 'trap-prep') return `CHARGES ${Object.values(state.caches).filter(Boolean).length}/3 · FLARES ${state.flares}`;
      if (state.phase === 'leadworks') return this.alien3RunnerV88?.alive ? `ATTIRER LE RUNNER · DIST ${Math.round(distance(this.player, this.alien3RunnerV88))} m` : 'CIBLE PERDUE';
      if (state.phase === 'molten-lead') return 'PLOMB APPLIQUÉ · REJOINDRE LA VANNE HAUTE';
      if (state.phase === 'company') return 'ÉQUIPE CORPORATIVE EN APPROCHE';
      const chapter = alien3ChapterV88(state.phase);
      return chapter.objective;
    }

    getInteractionPrompt(actor = this.player) {
      if (!this.isAlien3MissionV88() || !this.alien3V88 || !actor) return super.getInteractionPrompt(actor);
      const station = this.alien3NearestActiveStationV88(actor);
      if (station) {
        if (station.kind === 'igniter' && !this.alien3V88.fireMazeArmed) {
          const count = Object.values(this.alien3V88.caches).filter(Boolean).length;
          return `E  ${station.label} · CHARGES ${count}/3`;
        }
        if (station.kind === 'mold' && this.alien3RunnerV88?.alive) return `E  DÉVERSER LE PLOMB · RUNNER ${Math.round(distance(this.alien3RunnerV88, station))}/${RUNNER_TRAP_RANGE}`;
        return `E  ${station.label}`;
      }
      if (this.alien3V88.phase === 'first-blood') return 'FUYEZ VERS LES GALERIES TECHNIQUES';
      if (this.alien3V88.phase === 'leadworks' && this.alien3V88.flares > 0) return `TIR  LANCER UN FLARE · ${this.alien3V88.flares} RESTANT(S)`;
      return super.getInteractionPrompt(actor);
    }

    drawAlien3StationV88(ctx, station) {
      if (!ctx || !station) return;
      const state = this.alien3V88;
      const used = station.kind === 'cache' && state.caches[station.cacheId]
        || station.kind === 'evidence' && state.crashRecorderRead
        || station.kind === 'autopsy' && state.autopsyComplete
        || station.kind === 'bishop' && state.bishopRecovered
        || station.kind === 'igniter' && state.fireMazeIgnited
        || station.kind === 'mold' && state.moltenLeadApplied
        || station.kind === 'sprinkler' && state.thermalShockApplied
        || station.kind === 'company' && state.companyRefused
        || station.kind === 'finale' && state.finaleCommitted;
      ctx.save();
      ctx.globalAlpha = used ? 0.34 : 1;
      ctx.fillStyle = station.kind === 'mold' || station.kind === 'sprinkler' ? '#6f4a24' : '#34322c';
      ctx.strokeStyle = used ? '#5f645d' : '#c08a47';
      ctx.lineWidth = 2;
      ctx.fillRect(station.x, station.y, station.w, station.h);
      ctx.strokeRect(station.x + 1, station.y + 1, station.w - 2, station.h - 2);
      ctx.fillStyle = used ? '#6e756d' : '#e6bd72';
      ctx.fillRect(station.x + 10, station.y + 12, station.w - 20, 8);
      if (station.kind === 'mold' && state.moltenLeadApplied) {
        ctx.fillStyle = '#d9963c';
        ctx.fillRect(station.x - 74, station.y + station.h - 13, station.w + 148, 13);
      }
      ctx.restore();
    }

    drawAlien3CastV88(ctx) {
      if (!ctx) return;
      for (const actor of this.alien3CastV88 || []) {
        if (actor.id === 'ripley' || actor.id === 'bishop' || actor.status !== 'active') continue;
        const base = castById(actor.id);
        if (!base) continue;
        ctx.save();
        ctx.globalAlpha = 0.82;
        ctx.fillStyle = '#2a2823';
        ctx.strokeStyle = '#98744c';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(actor.x, actor.y + 12, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(actor.x, actor.y + 22);
        ctx.lineTo(actor.x, actor.y + 70);
        ctx.moveTo(actor.x, actor.y + 38);
        ctx.lineTo(actor.x - 14, actor.y + 52);
        ctx.moveTo(actor.x, actor.y + 38);
        ctx.lineTo(actor.x + 14, actor.y + 52);
        ctx.stroke();
        ctx.fillStyle = '#d9c8ab';
        ctx.font = '10px monospace';
        ctx.fillText(actor.name.toUpperCase(), actor.x - 28, actor.y - 4);
        ctx.restore();
      }
    }

    drawWorld(ctx) {
      super.drawWorld(ctx);
      if (!this.isAlien3MissionV88() || !this.alien3V88 || !ctx) return;
      const state = this.alien3V88;
      for (const station of this.alien3StationsV88) this.drawAlien3StationV88(ctx, station);
      this.drawAlien3CastV88(ctx);
      if (state.fireMazeIgnited) {
        ctx.save();
        ctx.globalAlpha = 0.16 + Math.sin((Number(this.animationTime) || 0) * 8) * 0.04;
        ctx.fillStyle = '#bd5928';
        ctx.fillRect(3980, 410, 620, 100);
        ctx.restore();
      }
      if (state.moltenLeadApplied) {
        ctx.save();
        ctx.globalAlpha = 0.68;
        ctx.fillStyle = '#d9903b';
        ctx.fillRect(4740, 496, 390, 14);
        ctx.restore();
      }
    }

    drawHud(ctx) {
      super.drawHud(ctx);
      if (!this.isAlien3MissionV88() || !this.alien3V88 || !ctx) return;
      const state = this.alien3V88;
      const chapter = alien3ChapterV88(state.phase);
      const runnerDistance = this.alien3RunnerV88?.alive ? Math.round(distance(this.player, this.alien3RunnerV88)) : null;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 8, 7, .9)';
      ctx.fillRect(902, 82, 360, 104);
      ctx.strokeStyle = '#8e6135';
      ctx.strokeRect(902.5, 82.5, 359, 103);
      ctx.fillStyle = '#d6a65d';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('MIRE // FIORINA 161 // ALIEN³', 916, 103);
      ctx.fillStyle = '#e6d6b4';
      ctx.fillText(`CH ${String(chapter.number).padStart(2, '0')} · ${chapter.title}`.slice(0, 47), 916, 123);
      ctx.fillStyle = '#b9ad96';
      ctx.fillText(this.objectiveProgressText().slice(0, 49), 916, 143);
      ctx.fillText(`SYNC ${Math.round(state.synchronization)}% · FLARES ${state.flares}${runnerDistance == null ? '' : ` · RUNNER ${runnerDistance}m`}`, 916, 163);
      ctx.fillStyle = '#8f8068';
      ctx.fillText('TRACKER: ARCHIVES/CODEX', 916, 179);
      ctx.restore();

      if (this.alien3CodexOverlayClockV88 > 0 && state.currentCodexId) {
        const entry = alien3CodexEntryV88(state.currentCodexId);
        if (entry) {
          ctx.save();
          ctx.fillStyle = 'rgba(4, 7, 6, .94)';
          ctx.fillRect(84, 470, 760, 164);
          ctx.strokeStyle = '#85724e';
          ctx.strokeRect(84.5, 470.5, 759, 163);
          ctx.fillStyle = '#c9b27c';
          ctx.font = 'bold 12px monospace';
          ctx.fillText(`MIRE CODEX · ${entry.category} · ${entry.title}`.slice(0, 78), 104, 495);
          ctx.fillStyle = '#d3d6cd';
          ctx.font = '11px monospace';
          const words = entry.body.split(/\s+/);
          const lines = [];
          let line = '';
          for (const word of words) {
            const candidate = line ? `${line} ${word}` : word;
            if (candidate.length > 94) { lines.push(line); line = word; }
            else line = candidate;
          }
          if (line) lines.push(line);
          lines.slice(0, 6).forEach((value, index) => ctx.fillText(value, 104, 520 + index * 18));
          ctx.restore();
        }
      }
    }

    captureResumeState() {
      const base = super.captureResumeState();
      if (!this.isAlien3MissionV88() || !this.alien3V88) return base;
      const runner = this.alien3RunnerV88;
      return {
        ...base,
        specialOperation: {
          ...(isRecord(base.specialOperation) ? base.specialOperation : {}),
          operationId: ALIEN3_OPERATION_ID_V88,
          alien3V88: sanitizeAlien3StateV88(this.alien3V88),
          alien3RunnerV88: runner ? {
            id: runner.id,
            x: runner.x,
            y: runner.y,
            health: runner.health,
            maxHealth: runner.maxHealth,
            alive: runner.alive,
            facing: runner.facing,
            speed: runner.speed,
            damage: runner.damage
          } : null
        }
      };
    }

    applyAlien3RunnerResumeV88(source) {
      const saved = sanitizeRunnerSnapshot(source);
      const runner = this.alien3RunnerV88;
      if (!saved || !runner || saved.id !== runner.id) return false;
      Object.assign(runner, {
        x: saved.x,
        y: saved.y,
        spawnX: saved.x,
        health: saved.alive ? Math.max(1, Math.min(saved.health, saved.maxHealth)) : 0,
        maxHealth: saved.maxHealth,
        alive: saved.alive,
        facing: saved.facing,
        speed: this.alien3V88?.moltenLeadApplied ? runner.alien3BaseSpeedV88 * 0.52 : saved.speed,
        damage: saved.damage
      });
      if (typeof this.initializeEnemyMissionNavigation === 'function') this.initializeEnemyMissionNavigation(runner);
      return true;
    }

    applyResumeState(rawState) {
      const source = rawState?.specialOperation?.alien3V88 || rawState?.alien3V88;
      const runnerSource = rawState?.specialOperation?.alien3RunnerV88 || rawState?.alien3RunnerV88;
      const result = super.applyResumeState(rawState);
      if (!this.isAlien3MissionV88() || !result?.applied) return result;
      if (!isRecord(source) || Number(source.schema) !== ALIEN3_DLC_SCHEMA_V88) return result;
      this.alien3V88 = sanitizeAlien3StateV88(source);
      this.pendingAlien3ResumeV88 = this.alien3V88;
      this.pendingAlien3RunnerResumeV88 = sanitizeRunnerSnapshot(runnerSource);
      if (this.alien3RunnerV88) {
        this.applyAlien3RunnerResumeV88(this.pendingAlien3RunnerResumeV88);
        this.syncAlien3MissionFlagsV88();
      }
      return { ...result, restored: (Number(result.restored) || 0) + 1, alien3DlcRestoredV88: true };
    }

    getAlien3SnapshotV88() {
      if (!this.isAlien3MissionV88() || !this.alien3V88) return { alien3V88: null };
      const state = sanitizeAlien3StateV88(this.alien3V88);
      return {
        alien3V88: {
          ...state,
          chapter: alien3ChapterV88(state.phase),
          runner: {
            ...state.runner,
            alive: Boolean(this.alien3RunnerV88?.alive),
            health: Math.round(Number(this.alien3RunnerV88?.health) || 0),
            maxHealth: Math.round(Number(this.alien3RunnerV88?.maxHealth) || 0)
          },
          codexTotal: ALIEN3_CODEX_V88.length,
          codexUnlockedCount: state.codexUnlocked.length,
          authoredChapters: ALIEN3_CHAPTERS_V88.length
        }
      };
    }

    getGameplayReport() {
      const report = super.getGameplayReport();
      return this.isAlien3MissionV88() ? { ...report, alien3DlcV88: this.getAlien3SnapshotV88().alien3V88 } : report;
    }

    getSnapshot() {
      return { ...super.getSnapshot(), ...this.getAlien3SnapshotV88() };
    }
  };
}
