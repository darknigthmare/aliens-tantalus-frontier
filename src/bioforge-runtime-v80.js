import { GameEngine } from './game-production-runtime.js';
import { resolveCombatAimV83, readKeyboardCombatAimV83, resolveCombatMuzzleV83, buildCombatShotVectorsV83 } from './combat-aim-v83.js';
import { collectProjectileCollisionsV83 } from './projectile-collision-v83.js';
import { BIOFORGE_ASSETS_V80 } from './bioforge-assets-v80.js';
import {
  BIOFORGE_MAX_CONCURRENT_V80,
  BIOFORGE_PHASES_V80,
  advanceBioforgeSessionV80,
  beginBioforgePurgeV80,
  completeBioforgePurgeV80,
  createBioforgeV80,
  finishBioforgeSessionV80,
  getBioforgeRosterEntryV80,
  recordBioforgeKillV80,
  sanitizeBioforgeV80,
  startBioforgeSessionV80,
  validateBioforgeSelectionV80
} from './bioforge-session-v80.js';
import {
  BIOFORGE_LEVEL_SCHEMA_V80,
  BIOFORGE_MAX_SPAWNS_V80,
  BIOFORGE_VIEWPORT_V80,
  confineBioforgeSpecimenV80,
  createBioforgeLevelV80,
  isInsideBioforgeArenaV80,
  placeBioforgeSpecimenV80,
  syncBioforgeDoorsV80,
  validateBioforgeLevelV80
} from './bioforge-level-v80.js';
import {
  SPRITE_PIVOTS,
  SpriteAnimationController,
  resolvePlayerAnimation,
  resolveSpriteSheet
} from './sprite-animation-runtime.js';
import { drawPlayerSpriteV81, normalizePlayerFacingV81 } from './player-visual-contract-v81.js';

export const BIOFORGE_SEAL_SECONDS_V80 = 0.72;
export const BIOFORGE_PRINT_INTERVAL_SECONDS_V80 = 0.46;
export const BIOFORGE_RESULT_SECONDS_V80 = 0.55;
export const BIOFORGE_INTERACTION_RADIUS_V80 = 142;
export const BIOFORGE_FOREGROUND_ALPHA_V80 = 0.34;

const GRAVITY = 1900;
const PLAYER_SPEED = 245;
const PLAYER_JUMP_SPEED = 645;
const MAX_DELTA = 0.1;
const PHASE_SET = new Set(BIOFORGE_PHASES_V80);
const ACTIVE_PHASES = new Set(['sealing', 'printing', 'combat', 'result', 'purging']);
const isRecord = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const asList = (value) => Array.isArray(value) ? value : [];
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, Number(value) || 0));
const overlap = (left, right) => Boolean(left && right
  && left.x < right.x + right.w
  && left.x + left.w > right.x
  && left.y < right.y + right.h
  && left.y + left.h > right.y);
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const imageReady = (image) => Boolean(image?.complete && Number(image.naturalWidth || image.width) > 0);

function seeded(seed) {
  let state = (Number(seed) || 80) >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function editorSelection(editorProject) {
  if (!isRecord(editorProject)) return null;
  const sources = [
    editorProject.bioforge,
    editorProject.configuration?.bioforge,
    editorProject.runtime?.bioforge,
    editorProject.configuration,
    editorProject
  ];
  for (const source of sources) {
    if (!isRecord(source)) continue;
    const profileId = source.profileId || source.selectedProfileId || source.enemyProfileId;
    if (profileId != null || source.quantity != null) return { profileId, quantity: source.quantity };
  }
  return null;
}

export function resolveBioforgeConfigurationV80(options = {}) {
  const explicit = isRecord(options.configuration)
    ? options.configuration
    : options.profileId != null || options.quantity != null
      ? { profileId: options.profileId, quantity: options.quantity }
      : null;
  const candidate = explicit || editorSelection(options.editorProject);
  if (!candidate) return Object.freeze({ ok: false, reason: 'configuration-required', selection: null, source: null });
  const selection = validateBioforgeSelectionV80(candidate);
  return Object.freeze({
    ok: selection.ok,
    reason: selection.ok ? null : selection.errors[0] || 'invalid-selection',
    selection,
    source: explicit ? 'explicit' : 'editor-project'
  });
}

function normalizeAssetRegistry(registry) {
  const source = isRecord(registry) ? registry : {};
  return Object.entries(source).flatMap(([key, entry]) => {
    if (!isRecord(entry) || typeof entry.src !== 'string' || !entry.src.startsWith('/assets/')) return [];
    return [{ key, ...entry }];
  });
}

function assetImageKey(key) {
  return `bioforge:v80:${key}`;
}

function center(entity) {
  return { x: Number(entity?.x || 0) + Number(entity?.w || 0) / 2, y: Number(entity?.y || 0) + Number(entity?.h || 0) / 2 };
}

function purgeReport() {
  return {
    remainingEntities: 0,
    remainingProjectiles: 0,
    remainingHazards: 0,
    remainingEffects: 0,
    remainingTimers: 0
  };
}

export function resolveBioforgeBulkheadFrameV80(door = {}) {
  const progress = clamp(door.progress, 0, 1);
  const direction = door.visualDirection === 'closing' ? 'closing' : 'opening';
  if (door.open && progress >= 0.98) return 4;
  if (!door.open && progress <= 0.02) return door.locked === false ? 1 : 0;
  if (direction === 'closing') {
    if (progress > 0.55) return 5;
    if (progress > 0.15) return 6;
    return 0;
  }
  if (progress < 0.18) return 1;
  if (progress < 0.4) return 2;
  if (progress < 0.72) return 3;
  return 4;
}

export function withBioforgeRuntimeV80(BaseEngine = GameEngine) {
  return class BioforgeRuntimeMixinV80 extends BaseEngine {
    constructor(canvas, {
      audio,
      onEvent = () => {},
      onPersist = () => {},
      assets = BIOFORGE_ASSETS_V80,
      testMode = false,
      autoLoop = true,
      now = () => Date.now()
    } = {}) {
      super(canvas, { audio, onEvent });
      this.onBioforgePersistV80 = typeof onPersist === 'function' ? onPersist : () => {};
      this.bioforgeAssetsV80 = assets;
      this.bioforgeTestModeV80 = testMode === true;
      this.bioforgeAutoLoopV80 = autoLoop !== false;
      this.bioforgeNowV80 = typeof now === 'function' ? now : () => Date.now();
      this.bioforgeRootV80 = createBioforgeV80();
      this.bioforgeLevelV80 = createBioforgeLevelV80();
      this.bioforgePhaseClockV80 = 0;
      this.bioforgeSeedV80 = 80;
      this.bioforgeSourceV80 = null;
      this.bioforgeLastPurgeV80 = null;
      this.bioforgeLastErrorV80 = null;
      this.bioforgeReferencesV80 = {};
      this.bioforgeTimersV80 = new Map();
      this.bioforgeTransferStageV80 = 0;
      this.bioforgePreparedV80 = false;
    }

    emitBioforgeV80(event) {
      if (!event) return;
      this.onEvent?.(Object.freeze({ ...event, schema: 80, scope: 'bioforge' }));
    }

    persistBioforgeV80(event = null) {
      this.bioforgeRootV80.runtimeV81 = this.captureBioforgeRuntimeStateV81();
      const state = clone(this.bioforgeRootV80);
      this.onBioforgePersistV80(state, Object.freeze({ event: event ? clone(event) : null, snapshot: this.getBioforgeSnapshotV80() }));
      return state;
    }

    captureBioforgeRuntimeStateV81() {
      if (!this.player) return null;
      return {
        schema: 81,
        seed: this.bioforgeSeedV80,
        phaseClock: this.bioforgePhaseClockV80,
        transferStage: this.bioforgeTransferStageV80,
        player: {
          x: this.player.x,
          y: this.player.y,
          facing: normalizePlayerFacingV81(this.player.facing)
        }
      };
    }

    applyBioforgeOperationV80(operation, { persist = true } = {}) {
      if (!operation) return null;
      this.bioforgeRootV80 = operation.state;
      if (operation.event) this.emitBioforgeV80(operation.event);
      if (persist && operation.applied) this.persistBioforgeV80(operation.event);
      return operation;
    }

    initializeBioforgeWorldV80() {
      const level = this.bioforgeLevelV80 = createBioforgeLevelV80();
      const spawn = level.playerSpawn;
      this.world = null;
      this.campaign = null;
      this.editorMode = false;
      this.mission = { state: 'active', phase: 'bioforge', elapsed: 0, objectives: { bioforge: true } };
      this.camera = { x: clamp(spawn.x - 360, 0, level.world.width - level.viewport.width), y: 0 };
      this.player = typeof this.createPlayer === 'function'
        ? this.createPlayer(spawn.x, spawn.y, '#92d6a6', false)
        : { ...spawn, vx: 0, vy: 0, health: 100, armor: 50, ammo: 12, ammoReserve: 72, alive: true };
      Object.assign(this.player, spawn, {
        vx: 0,
        vy: 0,
        facing: spawn.facing,
        grounded: true,
        climbing: false,
        crouching: false,
        inVehicle: false,
        bioforgeOperatorV80: true
      });
      this.coop = null;
      this.coopEnabled = false;
      this.platforms = level.platforms.map((entry) => ({ ...entry }));
      this.ladders = level.ladders.map((entry) => ({ ...entry }));
      this.doors = level.doors.map((entry) => ({ ...entry, progress: 0 }));
      this.walls = [];
      this.lifts = [];
      this.covers = [];
      this.vents = [];
      this.supplies = [];
      this.enemies = [];
      this.bullets = [];
      this.hostileProjectiles = [];
      this.particles = [];
      this.drops = [];
      this.hazards = [];
      this.vehicle = null;
      this.weaponPickup = null;
      this.toolPickup = null;
      this.objective = null;
      this.powerNode = null;
      this.archiveTerminal = null;
      this.ventShortcut = null;
      this.checkpoint = null;
      this.squad = [];
      this.activeSquad = [];
      this.bioforgeReferencesV80 = {};
      this.bioforgeTimersV80 = new Map();
      this.bioforgeTransferStageV80 = 0;
      this.queueJump = 0;
      this.animationTime = 0;
      if (!this.bioforgePlayerAnimationV81) this.bioforgePlayerAnimationV81 = new SpriteAnimationController();
      else this.bioforgePlayerAnimationV81.reset('bioforge:player:echo9');
      this.paused = false;
      this.loadBioforgeAssetsV80();
      this.syncBioforgePhaseV80();
      return level;
    }

    loadBioforgeAssetsV80(registry = this.bioforgeAssetsV80) {
      const entries = normalizeAssetRegistry(registry);
      if (!this.images) this.images = new Map();
      if (typeof globalThis.Image === 'function') {
        for (const entry of entries) {
          const key = assetImageKey(entry.key);
          if (this.images.has(key)) continue;
          const image = new globalThis.Image();
          image.decoding = 'async';
          image.onload = () => {
            if (!this.running) this.draw();
          };
          image.onerror = () => this.emitBioforgeV80({ type: 'bioforge-asset-error', assetId: entry.id || entry.key, src: entry.src });
          image.src = entry.src;
          this.images.set(key, image);
        }
      }
      this.bioforgeAssetEntriesV80 = entries;
      return this.getBioforgeAssetReportV80();
    }

    prepare(rawState = null, { assets, testMode } = {}) {
      if (this.running) this.stopBioforgeEngineOnlyV80();
      if (assets) this.bioforgeAssetsV80 = assets;
      if (testMode != null) this.bioforgeTestModeV80 = testMode === true;
      this.bioforgeRootV80 = rawState ? sanitizeBioforgeV80(rawState?.bioforge || rawState?.state || rawState) : createBioforgeV80();
      this.initializeBioforgeWorldV80();
      this.bioforgePreparedV80 = true;
      this.running = false;
      this.draw();
      this.emitBioforgeV80({
        type: 'bioforge-runtime-prepared',
        resumeAvailable: Boolean(this.bioforgeRootV80.activeSession),
        recoveryRequired: Boolean(this.bioforgeRootV80.recovery?.purgeRequired)
      });
      return Object.freeze({
        ...this.getBioforgeSnapshotV80(),
        prepared: true,
        resumeAvailable: Boolean(this.bioforgeRootV80.activeSession)
      });
    }

    getBioforgeAssetReportV80() {
      const entries = asList(this.bioforgeAssetEntriesV80);
      const ready = entries.filter((entry) => imageReady(this.images?.get(assetImageKey(entry.key))));
      return Object.freeze({
        declared: entries.length,
        ready: ready.length,
        missing: Object.freeze(entries.filter((entry) => !ready.includes(entry)).map((entry) => entry.key)),
        proceduralFallback: this.bioforgeTestModeV80 && entries.length === 0,
        productionFallback: false
      });
    }

    start(options = {}) {
      if (this.running) this.purgeBioforgeV80('runtime-restart');
      const resumeEnvelope = options.resumeState || null;
      const embeddedRuntimeV81 = resumeEnvelope?.runtimeV81 || resumeEnvelope?.bioforge?.runtimeV81 || resumeEnvelope?.state?.runtimeV81 || null;
      this.bioforgeSeedV80 = Number.isFinite(Number(options.seed ?? resumeEnvelope?.seed ?? embeddedRuntimeV81?.seed)) ? Number(options.seed ?? resumeEnvelope?.seed ?? embeddedRuntimeV81?.seed) : 80;
      this.random = seeded(this.bioforgeSeedV80);
      this.bioforgePhaseClockV80 = Math.max(0, Number(options.phaseClock ?? resumeEnvelope?.phaseClock ?? embeddedRuntimeV81?.phaseClock) || 0);
      if (options.assets) this.bioforgeAssetsV80 = options.assets;
      if (options.testMode != null) this.bioforgeTestModeV80 = options.testMode === true;
      if (options.autoLoop != null) this.bioforgeAutoLoopV80 = options.autoLoop !== false;

      const rawResume = resumeEnvelope?.bioforge || resumeEnvelope?.state || resumeEnvelope || null;
      const hadRawActiveSession = isRecord(rawResume?.activeSession);
      const existingPreparedState = !rawResume && this.bioforgePreparedV80 && this.bioforgeRootV80?.activeSession
        ? this.bioforgeRootV80
        : null;
      this.bioforgeRootV80 = rawResume
        ? sanitizeBioforgeV80(rawResume)
        : existingPreparedState
          ? sanitizeBioforgeV80(existingPreparedState)
          : createBioforgeV80();
      this.initializeBioforgeWorldV80();
      this.bioforgePreparedV80 = true;

      if (hadRawActiveSession && !this.bioforgeRootV80.activeSession) {
        this.bioforgeRootV80.recovery = { purgeRequired: true, reason: 'invalid-resume-state' };
        const result = this.purgeBioforgeV80('invalid-resume-state');
        this.bioforgeLastErrorV80 = 'invalid-resume-state';
        this.emitBioforgeV80({ type: 'bioforge-invalid-resume-purged', reason: 'invalid-resume-state' });
        return { ...this.getBioforgeSnapshotV80(), started: false, purge: result };
      }

      const configuration = resolveBioforgeConfigurationV80(options);
      let session = this.bioforgeRootV80.activeSession;
      if (!session || session.phase === 'return') {
        if (!configuration.ok) throw new TypeError(`BIOFORGE V80: ${configuration.reason}`);
        const started = this.applyBioforgeOperationV80(startBioforgeSessionV80(
          this.bioforgeRootV80,
          { profileId: configuration.selection.profileId, quantity: configuration.selection.quantity },
          { now: this.bioforgeNowV80() }
        ));
        if (!started?.applied) throw new Error(`BIOFORGE V80: ${started?.reason || 'session-start-failed'}`);
        this.bioforgeSourceV80 = configuration.source;
        session = this.bioforgeRootV80.activeSession;
      } else {
        this.bioforgeSourceV80 = 'resume';
        if (configuration.ok && (configuration.selection.profileId !== session.profileId || configuration.selection.quantity !== session.quantity)) {
          throw new TypeError('BIOFORGE V80: resume-configuration-mismatch');
        }
      }

      if (!session || !PHASE_SET.has(session.phase)) {
        const result = this.purgeBioforgeV80('invalid-session-phase');
        return { ...this.getBioforgeSnapshotV80(), started: false, purge: result };
      }
      const runtimeV81 = this.bioforgeRootV80.runtimeV81 || embeddedRuntimeV81;
      this.bioforgeTransferStageV80 = clamp(Number(resumeEnvelope?.transferStage ?? runtimeV81?.transferStage) || 0, 0, 3);
      if (session.phase !== 'configuration') {
        Object.assign(this.player, this.bioforgeLevelV80.arenaPlayerSpawn, { vx: 0, vy: 0, grounded: true });
      }
      const restoredPlayer = resumeEnvelope?.player || runtimeV81?.player;
      if (isRecord(restoredPlayer)) {
        this.player.x = clamp(restoredPlayer.x, 0, this.bioforgeLevelV80.world.width - this.player.w);
        this.player.y = clamp(restoredPlayer.y, this.bioforgeLevelV80.world.ceilingY, this.bioforgeLevelV80.world.floorY - this.player.h);
        this.player.facing = normalizePlayerFacingV81(restoredPlayer.facing);
      }
      this.rebuildBioforgeSpecimensV80();
      this.syncBioforgePhaseV80();
      if (session.phase === 'purging') {
        const result = this.purgeBioforgeV80(session.purge?.reason || 'resume-purge');
        return { ...this.getBioforgeSnapshotV80(), started: false, purge: result };
      }
      if (session.phase === 'return') return { ...this.getBioforgeSnapshotV80(), started: false };

      this.running = true;
      this.paused = false;
      this.last = globalThis.performance?.now?.() || 0;
      const generation = this.loopGeneration = (this.loopGeneration || 0) + 1;
      if (this.bioforgeAutoLoopV80 && typeof globalThis.requestAnimationFrame === 'function') {
        globalThis.requestAnimationFrame((time) => this.loop(time, generation));
      }
      this.emitBioforgeV80({
        type: 'bioforge-runtime-ready',
        sessionId: session.id,
        profileId: session.profileId,
        quantity: session.quantity,
        phase: session.phase,
        source: this.bioforgeSourceV80
      });
      return { ...this.getBioforgeSnapshotV80(), started: true };
    }

    syncBioforgePhaseV80() {
      const phase = this.bioforgeRootV80.activeSession?.phase || (this.bioforgeRootV80.recovery?.purgeRequired ? 'purging' : 'configuration');
      syncBioforgeDoorsV80(this.bioforgeLevelV80, phase);
      for (const door of this.doors || []) {
        const source = this.bioforgeLevelV80.doors.find(({ id }) => id === door.id);
        if (source) {
          const wasOpen = Boolean(door.open);
          Object.assign(door, { open: source.open, locked: source.locked, reason: source.reason });
          if (!Number.isFinite(Number(door.progress))) door.progress = source.open ? 1 : 0;
          if (wasOpen !== source.open) door.visualDirection = source.open ? 'opening' : 'closing';
        }
      }
      if (phase === 'configuration') this.syncBioforgeTransferDoorsV80();
      if (this.mission) this.mission.phase = phase;
      return phase;
    }

    syncBioforgeTransferDoorsV80() {
      const openDoorId = this.bioforgeTransferStageV80 === 1
        ? 'control-seal'
        : this.bioforgeTransferStageV80 === 2
          ? 'inner-interlock'
          : this.bioforgeTransferStageV80 === 3
            ? 'arena-containment'
            : null;
      for (const door of this.doors || []) {
        const open = door.id === openDoorId;
        const wasOpen = Boolean(door.open);
        door.open = open;
        door.locked = !open;
        door.reason = door.open ? null : 'safety-interlock';
        if (!Number.isFinite(Number(door.progress))) door.progress = open ? 1 : 0;
        if (wasOpen !== open) door.visualDirection = open ? 'opening' : 'closing';
      }
      return openDoorId;
    }

    updateBioforgeDoorVisualsV80(delta, settle = false) {
      const speed = settle ? 1 : Math.min(1, clamp(delta, 0, MAX_DELTA) * 6.5);
      for (const door of this.doors || []) {
        const target = door.open ? 1 : 0;
        const previous = clamp(door.progress, 0, 1);
        if (previous === target) {
          door.visualDirection = null;
          continue;
        }
        door.visualDirection = target > previous ? 'opening' : 'closing';
        door.progress = previous + (target - previous) * speed;
        if (Math.abs(target - door.progress) < 0.015 || settle) {
          door.progress = target;
          door.visualDirection = null;
        }
      }
      return this.doors;
    }

    sealBioforgeArenaV80() {
      if (this.bioforgeRootV80.activeSession?.phase !== 'configuration' || this.bioforgeTransferStageV80 !== 3) return false;
      const arenaSpawn = this.bioforgeLevelV80.arenaPlayerSpawn;
      this.player.x = Math.max(this.player.x, arenaSpawn.x);
      this.player.y = arenaSpawn.y;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.grounded = true;
      this.bioforgeTransferStageV80 = 4;
      const operation = this.advanceBioforgePhaseV80();
      this.emitBioforgeV80({ type: 'bioforge-physical-transfer-completed', sessionId: this.bioforgeRootV80.activeSession?.id });
      return Boolean(operation?.applied);
    }

    rebuildBioforgeSpecimensV80() {
      this.enemies = [];
      const session = this.bioforgeRootV80.activeSession;
      if (!session) return 0;
      for (const entry of session.queue) {
        if (!session.aliveIds.includes(entry.id)) continue;
        this.spawnBioforgeSpecimenV80(entry.id, entry.index, { restored: true });
      }
      return this.enemies.length;
    }

    spawnBioforgeSpecimenV80(specimenId, index, { restored = false } = {}) {
      if (this.enemies.some((enemy) => enemy.id === specimenId)) return null;
      const session = this.bioforgeRootV80.activeSession;
      const roster = getBioforgeRosterEntryV80(session?.profileId);
      if (!session || !roster || index < 0 || index >= session.quantity || index >= BIOFORGE_MAX_SPAWNS_V80) return null;
      const source = {
        id: roster.profileId,
        name: roster.profileId,
        biology: 'xenomorph',
        health: 34 + roster.cost * 24,
        damage: 5 + roster.cost * 3,
        speed: 0.85 + roster.cost * 0.14,
        caste: 'bioforge-specimen'
      };
      const provisional = typeof this.createEnemy === 'function'
        ? this.createEnemy(source, index, 0, this.bioforgeLevelV80.world.floorY, { boss: false, keyCarrier: false })
        : { ...source, w: 52, h: 82, health: source.health, maxHealth: source.health };
      const placed = placeBioforgeSpecimenV80({
        ...provisional,
        id: specimenId,
        profileId: roster.profileId,
        sourceFacing: roster.sourceFacing,
        spriteKey: roster.spriteKey,
        clipSet: roster.clipSet,
        visualAssetPath: roster.path,
        isBoss: false,
        isRoyal: false,
        keyCarrier: false,
        reward: 0,
        dropsDisabledV80: true,
        alive: true,
        restored
      }, index, this.bioforgeLevelV80, this.player);
      if (!placed) return null;
      placed.attackClock = 0.5 + this.random() * 0.55;
      this.enemies.push(placed);
      this.bioforgeReferencesV80[specimenId] = placed;
      this.emitBioforgeV80({ type: 'bioforge-specimen-spawned', specimenId, profileId: roster.profileId, index, restored, facing: placed.facing });
      return placed;
    }

    advanceBioforgePhaseV80() {
      const operation = this.applyBioforgeOperationV80(advanceBioforgeSessionV80(this.bioforgeRootV80, { now: this.bioforgeNowV80() }));
      if (operation?.event?.type === 'bioforge-specimen-printed') {
        this.spawnBioforgeSpecimenV80(operation.event.specimenId, operation.event.index);
      }
      this.bioforgePhaseClockV80 = 0;
      this.syncBioforgePhaseV80();
      return operation;
    }

    update(delta) {
      this.gamepadInputV77?.poll();
      if (!this.running || this.paused || this.enemyAtlasLoadingPausedV65) return;
      const dt = clamp(delta, 0, MAX_DELTA);
      this.animationTime += dt;
      this.mission.elapsed += dt;
      this.bioforgePhaseClockV80 += dt;
      this.queueJump = Math.max(0, Number(this.queueJump || 0) - dt);
      this.updateBioforgeDoorVisualsV80(dt);
      this.updateBioforgePlayerV80(dt);
      const phase = this.bioforgeRootV80.activeSession?.phase;
      if (phase === 'sealing' && this.bioforgePhaseClockV80 >= BIOFORGE_SEAL_SECONDS_V80) this.advanceBioforgePhaseV80();
      else if (phase === 'printing' && this.bioforgePhaseClockV80 >= BIOFORGE_PRINT_INTERVAL_SECONDS_V80) this.advanceBioforgePhaseV80();
      else if (phase === 'combat') this.updateBioforgeCombatV80(dt);
      else if (phase === 'result' && this.bioforgePhaseClockV80 >= BIOFORGE_RESULT_SECONDS_V80) this.purgeBioforgeV80('session-complete');
      this.updateBioforgeCameraV80(dt);
    }

    updateBioforgePlayerV80(delta) {
      const actor = this.player;
      if (!actor?.alive) return;
      const locked = this.keys?.has?.('ShiftLeft');
      if (locked) actor.vx = 0;
      const left = !locked && (this.keys?.has?.('KeyA') || this.keys?.has?.('ArrowLeft'));
      const right = !locked && (this.keys?.has?.('KeyD') || this.keys?.has?.('ArrowRight'));
      const jump = this.keys?.has?.('Space') || this.queueJump > 0 || actor.jumpBuffer > 0;
      actor.jumpBuffer = Math.max(0, Number(actor.jumpBuffer || 0) - delta);
      const targetVx = (Number(right) - Number(left)) * PLAYER_SPEED;
      actor.vx += (targetVx - actor.vx) * Math.min(1, delta * (actor.grounded ? 16 : 8));
      if (actor.vx) actor.facing = Math.sign(actor.vx);
      if (jump && actor.grounded) {
        actor.vy = -PLAYER_JUMP_SPEED;
        actor.grounded = false;
        this.queueJump = 0;
        actor.jumpBuffer = 0;
      }
      actor.vy += GRAVITY * delta;
      const previous = { x: actor.x, y: actor.y, bottom: actor.y + actor.h };
      actor.x += actor.vx * delta;
      this.resolveBioforgeHorizontalV80(actor, previous.x);
      actor.y += actor.vy * delta;
      actor.grounded = false;
      this.resolveBioforgeVerticalV80(actor, previous.bottom);
      const bounds = this.bioforgeLevelV80.arenaBounds;
      if (ACTIVE_PHASES.has(this.bioforgeRootV80.activeSession?.phase)) {
        actor.x = clamp(actor.x, bounds.x, bounds.x + bounds.w - actor.w);
      } else {
        actor.x = clamp(actor.x, 0, this.bioforgeLevelV80.world.width - actor.w);
      }
      actor.y = clamp(actor.y, this.bioforgeLevelV80.world.ceilingY, this.bioforgeLevelV80.world.floorY - actor.h);
      actor.fireClock = Math.max(0, Number(actor.fireClock || 0) - delta);
      actor.actionClock = Math.max(0, Number(actor.actionClock || 0) - delta);
      if (this.keys?.has?.('KeyF')) this.fire(actor);
      if (this.bioforgeRootV80.activeSession?.phase === 'configuration'
        && this.bioforgeTransferStageV80 === 3
        && actor.x >= bounds.x + 8) this.sealBioforgeArenaV80();
    }

    resolveBioforgeHorizontalV80(actor, previousX) {
      for (const door of this.doors || []) {
        if (door.open || !overlap(actor, door)) continue;
        if (actor.x > previousX) actor.x = door.x - actor.w;
        else if (actor.x < previousX) actor.x = door.x + door.w;
        actor.vx = 0;
      }
    }

    resolveBioforgeVerticalV80(actor, previousBottom) {
      for (const platform of this.platforms || []) {
        const horizontal = actor.x + actor.w > platform.x + 3 && actor.x < platform.x + platform.w - 3;
        if (horizontal && actor.vy >= 0 && previousBottom <= platform.y + 10 && actor.y + actor.h >= platform.y) {
          actor.y = platform.y - actor.h;
          actor.vy = 0;
          actor.grounded = true;
          return platform;
        }
      }
      return null;
    }

    fire(actor = this.player) {
      if (!this.running || this.paused || this.enemyAtlasLoadingPausedV65 || this.bioforgeRootV80.activeSession?.phase !== 'combat'
        || !actor?.alive || Number(actor.fireClock || 0) > 0 || Number(actor.ammo || 0) <= 0) return false;
      actor.fireClock = 0.13;
      actor.actionClock = 0.22;
      actor.ammo -= 1;
      actor.shots = Number(actor.shots || 0) + 1;
      const aim = this.resolvePlayerCombatAimV83?.(actor) || resolveCombatAimV83({ ...readKeyboardCombatAimV83(this.keys), facing: actor.facing });
      actor.facing = aim.facing;
      const muzzle = resolveCombatMuzzleV83(actor, aim);
      const shot = buildCombatShotVectorsV83(aim)[0];
      this.bullets.push({
        id: `bioforge-shot-${actor.shots}`,
        x: muzzle.x,
        y: muzzle.y,
        w: 18,
        h: 5,
        vx: shot.vx,
        vy: shot.vy,
        angleRadians: shot.angleRadians,
        aimExplicitV83: aim.active,
        damage: 28,
        owner: actor,
        life: 1.4,
        hit: false,
        bioforgeProjectileV80: true
      });
      this.audio?.shot?.();
      this.emitBioforgeV80({ type: 'bioforge-shot', sessionId: this.bioforgeRootV80.activeSession?.id });
      return true;
    }

    updateBioforgeCombatV80(delta) {
      const bounds = this.bioforgeLevelV80.arenaBounds;
      for (const bullet of this.bullets) {
        const duration = Math.min(Math.max(0, delta), Math.max(0, bullet.life));
        const step = { x: bullet.vx * duration, y: (bullet.vy || 0) * duration };
        const boundaries = [
          { x: bounds.x - 32, y: bounds.y - 32, w: 32, h: bounds.h + 64 },
          { x: bounds.x + bounds.w, y: bounds.y - 32, w: 32, h: bounds.h + 64 },
          { x: bounds.x, y: bounds.y - 32, w: bounds.w, h: 32 },
          { x: bounds.x, y: bounds.y + bounds.h, w: bounds.w, h: 32 }
        ];
        const impact = collectProjectileCollisionsV83(bullet, step, { walls: boundaries, platforms: this.platforms, enemies: this.enemies })[0];
        bullet.x = impact?.x ?? bullet.x + step.x;
        bullet.y = impact?.y ?? bullet.y + step.y;
        bullet.life -= Math.max(0, delta);
        if (impact) {
          bullet.hit = true;
          if (impact.kind === 'enemy') {
            impact.target.health -= bullet.damage;
            if (impact.target.health <= 0) this.killBioforgeSpecimenV80(impact.target.id, 'combat');
          }
        }
      }
      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        const distance = center(this.player).x - center(enemy).x;
        enemy.facing = distance < 0 ? -1 : 1;
        enemy.vx = enemy.facing * Math.min(112, Number(enemy.speed) || 82);
        enemy.x += enemy.vx * delta;
        confineBioforgeSpecimenV80(enemy, this.bioforgeLevelV80);
        enemy.attackClock = Math.max(0, Number(enemy.attackClock || 0) - delta);
        if (overlap(enemy, this.player) && enemy.attackClock <= 0) {
          enemy.attackClock = 0.9;
          const damage = Math.max(1, Number(enemy.damage) || 8);
          const absorbed = Math.min(Number(this.player.armor || 0), damage * 0.5);
          this.player.armor -= absorbed;
          this.player.health -= damage - absorbed;
          if (this.player.health <= 0) {
            this.player.health = 0;
            this.player.alive = false;
            this.finishBioforgeV80('failed', 'operator-down');
            return;
          }
        }
      }
      this.bullets = this.bullets.filter((bullet) => !bullet.hit && bullet.life > 0
        && bullet.x >= bounds.x && bullet.x + bullet.w <= bounds.x + bounds.w
        && bullet.y >= bounds.y && bullet.y + bullet.h <= bounds.y + bounds.h);
      if (this.bioforgeRootV80.activeSession?.phase === 'combat' && this.enemies.every((enemy) => !enemy.alive)) {
        this.finishBioforgeV80('cleared', 'batch-cleared');
      }
    }

    killBioforgeSpecimenV80(specimenId, reason = 'qa') {
      const enemy = this.enemies.find((candidate) => candidate.id === specimenId && candidate.alive);
      if (!enemy) return false;
      const operation = this.applyBioforgeOperationV80(recordBioforgeKillV80(this.bioforgeRootV80, specimenId, { now: this.bioforgeNowV80() }));
      if (!operation?.applied) return false;
      enemy.health = 0;
      enemy.alive = false;
      enemy.vx = 0;
      enemy.vy = 0;
      delete this.bioforgeReferencesV80[specimenId];
      this.emitBioforgeV80({ type: 'bioforge-specimen-neutralized', specimenId, reason });
      return true;
    }

    finishBioforgeV80(outcome, reason = null, score = null) {
      const session = this.bioforgeRootV80.activeSession;
      const computedScore = score == null ? session?.killedIds?.length * 100 : score;
      const operation = this.applyBioforgeOperationV80(finishBioforgeSessionV80(
        this.bioforgeRootV80,
        { outcome, reason, score: computedScore },
        { now: this.bioforgeNowV80() }
      ));
      if (operation?.applied) {
        this.bioforgePhaseClockV80 = 0;
        this.syncBioforgePhaseV80();
      }
      return operation;
    }

    clearBioforgeRuntimeReferencesV80() {
      this.enemies = [];
      this.bullets = [];
      this.hostileProjectiles = [];
      this.particles = [];
      this.drops = [];
      this.hazards = [];
      this.bioforgeReferencesV80 = {};
      this.bioforgeTimersV80?.clear?.();
      if (Array.isArray(this.timers)) this.timers.length = 0;
      else this.timers?.clear?.();
      this.pendingTimers = [];
      this.pendingReferences = [];
      this.weaponPickup = null;
      this.toolPickup = null;
      this.vehicle = null;
      this.objective = null;
      this.powerNode = null;
      this.archiveTerminal = null;
      this.ventShortcut = null;
      this.coop = null;
      this.squad = [];
      this.activeSquad = [];
      this.keys?.clear?.();
      return purgeReport();
    }

    stopBioforgeEngineOnlyV80() {
      this.running = false;
      this.paused = false;
      if (typeof super.stop === 'function') super.stop();
      else this.loopGeneration = (this.loopGeneration || 0) + 1;
      return true;
    }

    purgeBioforgeV80(reason = 'manual-purge') {
      const began = beginBioforgePurgeV80(
        this.bioforgeRootV80,
        reason,
        { now: this.bioforgeNowV80() }
      );
      this.bioforgeRootV80 = began.state;
      const report = this.clearBioforgeRuntimeReferencesV80();
      this.stopBioforgeEngineOnlyV80();
      const completed = completeBioforgePurgeV80(
        this.bioforgeRootV80,
        report,
        { now: this.bioforgeNowV80() }
      );
      this.bioforgeRootV80 = completed.state;
      this.syncBioforgePhaseV80();
      this.bioforgeLastPurgeV80 = Object.freeze({ reason, report: Object.freeze(report), began: Boolean(began?.applied), completed: Boolean(completed?.applied) });
      this.updateBioforgeDoorVisualsV80(1, true);
      if (began?.event) this.emitBioforgeV80(began.event);
      if (completed?.event) this.emitBioforgeV80(completed.event);
      this.emitBioforgeV80({ type: 'bioforge-runtime-purged', reason, ...report, completed: Boolean(completed?.applied) });
      if (completed?.applied) this.emitBioforgeV80({ type: 'bioforge-return-ready', sessionId: this.bioforgeRootV80.activeSession?.id || null });
      this.persistBioforgeV80(completed?.event || began?.event || { type: 'bioforge-runtime-purged', reason });
      if (completed?.applied) this.draw();
      return this.bioforgeLastPurgeV80;
    }

    stop(options = {}) {
      const normalized = typeof options === 'boolean' ? { purge: options } : isRecord(options) ? options : {};
      const phase = this.bioforgeRootV80.activeSession?.phase;
      if (normalized.purge !== false && phase && phase !== 'return') return this.purgeBioforgeV80(normalized.reason || 'runtime-stop');
      this.stopBioforgeEngineOnlyV80();
      return true;
    }

    interact(actor = this.player) {
      if (!actor || !this.running) return false;
      if (this.bioforgeRootV80.activeSession?.phase === 'configuration') {
        const actorCenter = center(actor);
        const controlDoor = this.doors.find(({ id }) => id === 'control-seal');
        const innerDoor = this.doors.find(({ id }) => id === 'inner-interlock');
        const printer = this.bioforgeLevelV80.stations.find(({ type }) => type === 'printer');
        const near = (target) => target && Math.hypot(actorCenter.x - center(target).x, actorCenter.y - center(target).y) <= BIOFORGE_INTERACTION_RADIUS_V80;
        const nearDoor = (target) => target && Math.abs(actorCenter.x - center(target).x) <= BIOFORGE_INTERACTION_RADIUS_V80;
        if (this.bioforgeTransferStageV80 === 0 && nearDoor(controlDoor)) this.bioforgeTransferStageV80 = 1;
        else if (this.bioforgeTransferStageV80 === 1 && actorCenter.x > controlDoor.x && nearDoor(innerDoor)) this.bioforgeTransferStageV80 = 2;
        else if (this.bioforgeTransferStageV80 === 2 && actorCenter.x > innerDoor.x && near(printer)) this.bioforgeTransferStageV80 = 3;
        else return false;
        const openDoorId = this.syncBioforgeTransferDoorsV80();
        this.emitBioforgeV80({
          type: 'bioforge-airlock-step',
          sessionId: this.bioforgeRootV80.activeSession?.id,
          stage: this.bioforgeTransferStageV80,
          openDoorId
        });
        this.persistBioforgeV80({ type: 'bioforge-airlock-step', stage: this.bioforgeTransferStageV80, openDoorId });
        return true;
      }
      if (this.bioforgeRootV80.activeSession?.phase === 'combat') {
        this.emitBioforgeV80({ type: 'bioforge-exit-locked', reason: 'combat-active' });
        return false;
      }
      return false;
    }

    toggleVehicle() { return false; }

    updateBioforgeCameraV80(delta) {
      if (!this.camera || !this.player) return;
      const maximum = this.bioforgeLevelV80.world.width - BIOFORGE_VIEWPORT_V80.width;
      const target = clamp(this.player.x - 430, 0, maximum);
      this.camera.x += (target - this.camera.x) * Math.min(1, delta * 5.2);
      this.camera.y = 0;
    }

    getBioforgeIsolationReportV80() {
      const escapedEnemies = this.enemies.filter((enemy) => enemy.alive && !isInsideBioforgeArenaV80(enemy, this.bioforgeLevelV80));
      const arena = this.bioforgeLevelV80.arenaBounds;
      const escapedProjectiles = [...this.bullets, ...this.hostileProjectiles].filter((entry) =>
        ![entry.x, entry.y, entry.w, entry.h].every(Number.isFinite)
        || entry.x < arena.x || entry.x + entry.w > arena.x + arena.w
        || entry.y < arena.y || entry.y + entry.h > arena.y + arena.h);
      return Object.freeze({
        secure: escapedEnemies.length === 0 && escapedProjectiles.length === 0,
        escapedEnemyIds: Object.freeze(escapedEnemies.map(({ id }) => id)),
        escapedProjectileIds: Object.freeze(escapedProjectiles.map(({ id }) => id || 'anonymous')),
        exitLocked: Boolean(this.doors.find(({ id }) => id === 'arena-return')?.locked)
      });
    }

    captureBioforgeResumeStateV80() {
      const runtimeV81 = this.captureBioforgeRuntimeStateV81();
      this.bioforgeRootV80.runtimeV81 = runtimeV81;
      return {
        schema: 80,
        state: clone(this.bioforgeRootV80),
        seed: this.bioforgeSeedV80,
        phaseClock: this.bioforgePhaseClockV80,
        transferStage: this.bioforgeTransferStageV80,
        player: runtimeV81?.player ? clone(runtimeV81.player) : null
      };
    }

    getBioforgeSnapshotV80() {
      const session = this.bioforgeRootV80.activeSession;
      const validation = validateBioforgeLevelV80(this.bioforgeLevelV80);
      return Object.freeze({
        schema: 80,
        levelSchema: BIOFORGE_LEVEL_SCHEMA_V80,
        levelId: this.bioforgeLevelV80.id,
        running: Boolean(this.running),
        prepared: Boolean(this.bioforgePreparedV80),
        phase: session?.phase || (this.bioforgeRootV80.recovery?.purgeRequired ? 'purging' : 'configuration'),
        sessionId: session?.id || null,
        profileId: session?.profileId || null,
        quantity: session?.quantity || 0,
        printed: session?.printedCount || 0,
        kills: session?.killedIds?.length || 0,
        alive: this.enemies.filter((enemy) => enemy.alive).length,
        source: this.bioforgeSourceV80,
        transferStage: this.bioforgeTransferStageV80,
        world: Object.freeze({ ...this.bioforgeLevelV80.world }),
        viewport: Object.freeze({ ...this.bioforgeLevelV80.viewport }),
        doors: Object.freeze(this.doors.map(({ id, open, locked, reason }) => Object.freeze({ id, open: Boolean(open), locked: Boolean(locked), reason: reason || null }))),
        entities: Object.freeze({
          enemies: this.enemies.length,
          bullets: this.bullets.length,
          hostileProjectiles: this.hostileProjectiles.length,
          particles: this.particles.length,
          drops: this.drops.length,
          hazards: this.hazards.length,
          timers: Number(this.bioforgeTimersV80?.size || this.timers?.size || this.timers?.length || 0)
        }),
        isolation: this.getBioforgeIsolationReportV80(),
        assets: this.getBioforgeAssetReportV80(),
        levelValidation: validation,
        lastPurge: this.bioforgeLastPurgeV80,
        recovery: Object.freeze({ ...this.bioforgeRootV80.recovery })
      });
    }

    getBioforgeQaHooksV80() {
      return Object.freeze({
        step: (delta) => { this.update(delta); return this.getBioforgeSnapshotV80(); },
        advance: () => this.advanceBioforgePhaseV80(),
        kill: (specimenId) => this.killBioforgeSpecimenV80(specimenId, 'qa'),
        attemptEscape: (specimenId, x = -500) => {
          const enemy = this.enemies.find((candidate) => candidate.id === specimenId);
          if (!enemy) return null;
          enemy.x = x;
          confineBioforgeSpecimenV80(enemy, this.bioforgeLevelV80);
          return clone(enemy);
        },
        purge: (reason = 'qa-purge') => this.purgeBioforgeV80(reason),
        snapshot: () => this.getBioforgeSnapshotV80(),
        resume: () => this.captureBioforgeResumeStateV80()
      });
    }

    draw() {
      const ctx = this.ctx;
      if (!ctx) return;
      const scaleX = Number(this.canvas?.width || 1280) / BIOFORGE_VIEWPORT_V80.width;
      const scaleY = Number(this.canvas?.height || 720) / BIOFORGE_VIEWPORT_V80.height;
      ctx.save();
      ctx.scale(scaleX, scaleY);
      ctx.clearRect(0, 0, BIOFORGE_VIEWPORT_V80.width, BIOFORGE_VIEWPORT_V80.height);
      this.drawBioforgeBackdropV80(ctx);
      ctx.save();
      ctx.translate(-Number(this.camera?.x || 0), 0);
      this.drawBioforgeWorldV80(ctx, { includeActors: false });
      ctx.restore();
      this.drawBioforgeForegroundV80(ctx);
      ctx.save();
      ctx.translate(-Number(this.camera?.x || 0), 0);
      this.drawBioforgeActorsV80(ctx);
      this.drawBioforgePurgeV80(ctx);
      ctx.restore();
      this.drawBioforgeHudV80(ctx);
      ctx.restore();
    }

    drawBioforgeBackdropV80(ctx) {
      const far = this.images?.get(assetImageKey('far'));
      if (imageReady(far)) {
        const height = BIOFORGE_VIEWPORT_V80.height;
        const width = Number(far.naturalWidth || far.width) * (height / Number(far.naturalHeight || far.height));
        const offset = -((Number(this.camera?.x || 0) * 0.08) % width);
        for (let x = offset - width; x < BIOFORGE_VIEWPORT_V80.width + width; x += width) ctx.drawImage(far, x, 0, width, height);
        return;
      }
      if (this.bioforgeTestModeV80) {
        ctx.fillStyle = '#05090a';
        ctx.fillRect(0, 0, BIOFORGE_VIEWPORT_V80.width, BIOFORGE_VIEWPORT_V80.height);
      }
    }

    drawBioforgeWorldV80(ctx, { includeActors = true } = {}) {
      const mid = this.images?.get(assetImageKey('mid'));
      if (imageReady(mid)) {
        const height = BIOFORGE_VIEWPORT_V80.height;
        const width = Number(mid.naturalWidth || mid.width) * (height / Number(mid.naturalHeight || mid.height));
        for (let x = 0; x < this.bioforgeLevelV80.world.width; x += width) ctx.drawImage(mid, x, 0, width, height);
      }
      if (this.bioforgeTestModeV80 && !imageReady(mid)) this.drawBioforgeProceduralQaV80(ctx);
      this.drawBioforgeStationsV80(ctx);
      if (includeActors) this.drawBioforgeActorsV80(ctx);
    }

    drawBioforgeActorsV80(ctx) {
      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        ctx.save();
        ctx.shadowColor = 'rgba(166, 210, 116, .42)';
        ctx.shadowBlur = 7;
        super.drawEnemy?.(ctx, enemy);
        ctx.restore();
      }
      if (this.player?.alive) {
        ctx.save();
        ctx.shadowColor = 'rgba(145, 225, 184, .5)';
        ctx.shadowBlur = 9;
        this.drawBioforgePlayerV80(ctx);
        ctx.restore();
      }
      for (const bullet of this.bullets) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 224, 133, .82)';
        ctx.shadowBlur = 7;
        ctx.fillStyle = '#f5d87a';
        ctx.translate(bullet.x + bullet.w / 2, bullet.y + bullet.h / 2);
        ctx.rotate(Math.atan2(bullet.vy || 0, bullet.vx || 0));
        ctx.fillRect(-bullet.w / 2, -bullet.h / 2, bullet.w, bullet.h);
        ctx.restore();
      }
    }

    drawBioforgeProceduralQaV80(ctx) {
      ctx.fillStyle = '#111a19';
      for (const platform of this.platforms) ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
      for (const door of this.doors) {
        ctx.fillStyle = door.open ? '#426c54' : '#733e3e';
        ctx.fillRect(door.x, door.y, door.w, door.h);
      }
      ctx.fillStyle = '#d1a35f';
      ctx.font = '12px monospace';
      ctx.fillText('QA PROCEDURAL FALLBACK — TESTS UNIQUEMENT', 24, 42);
    }

    drawBioforgeStationsV80(ctx) {
      const printer = this.images?.get(assetImageKey('printer'));
      const station = this.bioforgeLevelV80.stations.find(({ type }) => type === 'printer');
      if (station && imageReady(printer)) {
        const height = 180;
        const width = Number(printer.naturalWidth || printer.width) * (height / Number(printer.naturalHeight || printer.height));
        ctx.drawImage(printer, station.x + station.w / 2 - width / 2, this.bioforgeLevelV80.world.floorY - height, width, height);
      }
      const bulkhead = this.images?.get(assetImageKey('bulkhead'));
      if (imageReady(bulkhead)) {
        const frameWidth = Number(this.bioforgeAssetsV80?.bulkhead?.atlas?.frameWidth) || bulkhead.naturalWidth / 4;
        const frameHeight = Number(this.bioforgeAssetsV80?.bulkhead?.atlas?.frameHeight) || bulkhead.naturalHeight / 2;
        for (const door of this.doors) {
          const frame = resolveBioforgeBulkheadFrameV80(door);
          const size = 180;
          ctx.drawImage(
            bulkhead,
            (frame % 4) * frameWidth,
            Math.floor(frame / 4) * frameHeight,
            frameWidth,
            frameHeight,
            door.x + door.w / 2 - size / 2,
            this.bioforgeLevelV80.world.floorY - size,
            size,
            size
          );
        }
      }
    }

    drawBioforgePurgeV80(ctx) {
      if (!this.bioforgeLastPurgeV80?.completed || this.bioforgeRootV80.activeSession?.phase !== 'return') return false;
      const purge = this.images?.get(assetImageKey('purge'));
      if (!imageReady(purge)) return false;
      const atlas = this.bioforgeAssetsV80?.purge?.atlas;
      const frameWidth = Number(atlas?.frameWidth) || Number(purge.naturalWidth || purge.width) / 4;
      const frameHeight = Number(atlas?.frameHeight) || Number(purge.naturalHeight || purge.height) / 2;
      const frame = 6;
      const size = 640;
      const arena = this.bioforgeLevelV80.arenaBounds;
      ctx.drawImage(
        purge,
        (frame % 4) * frameWidth,
        Math.floor(frame / 4) * frameHeight,
        frameWidth,
        frameHeight,
        arena.x + arena.w / 2 - size / 2,
        this.bioforgeLevelV80.world.floorY - size,
        size,
        size
      );
      return true;
    }

    drawBioforgePlayerV80(ctx) {
      const actor = this.player;
      if (!actor) return;
      const request = resolvePlayerAnimation(actor, false);
      const sample = this.bioforgePlayerAnimationV81?.sample('bioforge:player:echo9', request, this.animationTime, { emit: false });
      const sheet = sample?.sheet || resolveSpriteSheet('player.echo9-marine.locomotion');
      const render = drawPlayerSpriteV81(ctx, {
        sheet,
        image: this.images?.get(sheet?.imageKey),
        sample,
        pivot: SPRITE_PIVOTS[sheet?.pivot],
        entity: actor,
        surface: 'bioforge'
      });
      actor.playerVisualV81 = { schema: 81, sheetId: render.sheetId, fallback: render.fallback, reason: render.reason, facing: render.facing };
    }

    drawBioforgeForegroundV80(ctx) {
      const foreground = this.images?.get(assetImageKey('foreground'));
      if (imageReady(foreground)) {
        const height = BIOFORGE_VIEWPORT_V80.height;
        const width = Number(foreground.naturalWidth || foreground.width) * (height / Number(foreground.naturalHeight || foreground.height));
        const offset = -((Number(this.camera?.x || 0) * 1.08) % width);
        const previousAlpha = Number.isFinite(Number(ctx.globalAlpha)) ? Number(ctx.globalAlpha) : 1;
        ctx.save();
        ctx.globalAlpha = BIOFORGE_FOREGROUND_ALPHA_V80;
        for (let x = offset - width; x < BIOFORGE_VIEWPORT_V80.width + width; x += width) ctx.drawImage(foreground, x, 0, width, height);
        ctx.restore();
        ctx.globalAlpha = previousAlpha;
      }
    }

    drawBioforgeHudV80(ctx) {
      const snapshot = this.getBioforgeSnapshotV80();
      ctx.fillStyle = 'rgba(3,10,8,.82)';
      ctx.fillRect(18, 16, 470, 72);
      ctx.strokeStyle = snapshot.isolation.secure ? '#668b71' : '#c84e4e';
      ctx.strokeRect(18.5, 16.5, 470, 72);
      ctx.fillStyle = '#9be0ae';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`BIOFORGE · ${String(snapshot.phase).toUpperCase()}`, 34, 40);
      ctx.fillStyle = '#ccd9cc';
      ctx.font = '12px monospace';
      ctx.fillText(`${snapshot.profileId || 'AUCUN PROFIL'} · ${snapshot.printed}/${snapshot.quantity} IMPRIMÉS · ${snapshot.kills} NEUTRALISÉS`, 34, 64);
      if (snapshot.phase === 'configuration') {
        const instruction = [
          'REJOINDRE LE SAS A · E POUR OUVRIR',
          'TRAVERSER LE SAS A · E À L’INTERLOCK',
          'REJOINDRE LE PRINTER · E POUR ARMER',
          'ENTRER DANS L’ARÈNE · SCELLEMENT AUTOMATIQUE'
        ][Math.min(3, this.bioforgeTransferStageV80)] || 'TRANSFERT BIOFORGE';
        ctx.fillStyle = '#d8bd79';
        ctx.fillText(instruction, 34, 82);
      } else if (snapshot.phase === 'combat') {
        ctx.fillStyle = '#df8f7d';
        ctx.fillText('SORTIE VERROUILLÉE — CONFINEMENT ACTIF', 34, 82);
      }
    }
  };
}

const BioforgeGameEngineV80 = withBioforgeRuntimeV80(GameEngine);

export class BioforgeRuntimeV80 extends BioforgeGameEngineV80 {}

export function createBioforgeRuntimeV80(canvas, options = {}) {
  return new BioforgeRuntimeV80(canvas, options);
}

export { BIOFORGE_MAX_CONCURRENT_V80 };
