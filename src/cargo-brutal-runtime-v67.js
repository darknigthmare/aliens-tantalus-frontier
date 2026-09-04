import {
  CARGO_BRUTAL_PROP_CELLS_V67,
  CARGO_BRUTAL_PROPS_SHEET_V67,
  CARGO_BRUTAL_SURVIVORS_SHEET_V67,
  CARGO_BRUTAL_VISUAL_REGISTRY_V67,
  resolveCargoBrutalSurvivorFrameV67
} from './cargo-brutal-visuals-v67.js';

const WORLD_WIDTH = 6200;
const DEFAULT_MAIN_DECK_Y = 470;
const CARGO_OPERATION_ID = 'cargo-brutal';
const CARGO_CAMPAIGN_ID = 'special-cargo-brutal';
const LOADER_ID = 'vehicle-007-p-5000-powered-work-loader';
const MAX_CARGO_WAVE_ENEMIES = 48;
const CARGO_WAVE_BIOLOGIES_V67 = new Set(['xenomorph', 'hybrid']);

export const CARGO_BRUTAL_STRATEGIC_BONUS_V67 = Object.freeze({ credits: 300, alloy: 45 });

export const CARGO_BRUTAL_PHASES_V67 = Object.freeze([
  'restore-power',
  'mount-loader',
  'clear-route',
  'escort-convoy',
  'retrieve-core',
  'carry-core',
  'matriarch',
  'extract'
]);

const PHASE_LABELS = Object.freeze({
  'restore-power': 'RÉTABLIR LA PUISSANCE DE SOUTE',
  'mount-loader': 'RÉACTIVER LE P-5000',
  'clear-route': 'DÉGAGER LE COULOIR CARGO',
  'escort-convoy': 'ESCORTER LES SURVIVANTS',
  'retrieve-core': 'RÉCUPÉRER LE NOYAU LOURD',
  'carry-core': 'INSTALLER LE NOYAU',
  matriarch: 'ABATTRE LA MATRIARCHE DE SOUTE',
  extract: 'EXTRAIRE LE CONVOI ET LE P-5000'
});

const DEFAULT_OBSTACLES = Object.freeze([
  Object.freeze({ id: 'cargo-block-alpha', x: 1450, y: DEFAULT_MAIN_DECK_Y - 156, w: 238, h: 156, hits: 0, requiredHits: 3, cleared: false }),
  Object.freeze({ id: 'cargo-block-bravo', x: 1840, y: DEFAULT_MAIN_DECK_Y - 132, w: 214, h: 132, hits: 0, requiredHits: 2, cleared: false }),
  Object.freeze({ id: 'cargo-block-charlie', x: 2140, y: DEFAULT_MAIN_DECK_Y - 168, w: 252, h: 168, hits: 0, requiredHits: 3, cleared: false })
]);

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const isRecord = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const center = (entity = {}) => ({ x: (Number(entity.x) || 0) + (Number(entity.w) || 0) / 2, y: (Number(entity.y) || 0) + (Number(entity.h) || 0) / 2 });
const distance = (left, right) => {
  const a = center(left);
  const b = center(right);
  return Math.hypot(a.x - b.x, a.y - b.y);
};
const isImageReady = (image) => Boolean(image && image.complete && (image.naturalWidth || image.width));

function boolean(value, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function integer(value, fallback, min, max) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.round(clamp(numeric, min, max)) : fallback;
}

function defaultObstacleState() {
  return DEFAULT_OBSTACLES.map((obstacle) => ({ ...obstacle }));
}

function cargoWaveText(value, fallback = '', maxLength = 180) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, maxLength) : fallback;
}

function isCargoWaveEnemyV67(enemy) {
  return typeof enemy?.waveTag === 'string' && enemy.waveTag.startsWith('cargo:');
}

function sanitizeCargoWaveEnemyV67(source, index = 0) {
  if (!isRecord(source)) return null;
  const id = cargoWaveText(source.id);
  if (!id) return null;
  const profileId = cargoWaveText(source.profileId, id.includes(':') ? id.slice(0, id.lastIndexOf(':')) : 'cargo-drone', 120);
  const maxHealth = clamp(source.maxHealth ?? source.health ?? 80, 1, 5000);
  const alive = source.alive !== false && source.captured !== true && Number(source.health ?? maxHealth) > 0;
  const waveTag = cargoWaveText(source.waveTag, `cargo:restored-${index + 1}`, 120);
  return {
    id,
    profileId,
    waveTag: waveTag.startsWith('cargo:') ? waveTag : `cargo:restored-${index + 1}`,
    name: cargoWaveText(source.name, 'Xenomorph Cargo Stalker', 120),
    biology: cargoWaveText(source.biology, 'xenomorph', 60),
    caste: cargoWaveText(source.caste, 'standard', 60),
    behavior: cargoWaveText(source.behavior, '', 80),
    x: clamp(source.x, 0, WORLD_WIDTH),
    y: clamp(source.y, 0, 1080),
    groundY: clamp(source.groundY ?? ((Number(source.y) || 0) + (Number(source.h) || 90)), 0, 1080),
    w: clamp(source.w, 8, 640),
    h: clamp(source.h, 8, 640),
    facing: Number(source.facing) < 0 ? -1 : 1,
    alive,
    captured: Boolean(source.captured),
    alert: Boolean(source.alert),
    revealed: clamp(source.revealed, 0, 120),
    health: alive ? clamp(source.health ?? maxHealth, 1, maxHealth) : 0,
    maxHealth,
    armor: clamp(source.armor, 0, 1000),
    damage: clamp(source.damage, 0, 1000),
    speed: clamp(source.speed, 0, 1000),
    deathClock: clamp(source.deathClock, 0, 30),
    attackClock: clamp(source.attackClock, 0, 120),
    rangedClock: clamp(source.rangedClock, 0, 120),
    staggerClock: clamp(source.staggerClock, 0, 30),
    hurtClock: clamp(source.hurtClock, 0, 30),
    pounceClock: clamp(source.pounceClock, 0, 30)
  };
}

function captureCargoWaveEnemiesV67(enemies) {
  return (Array.isArray(enemies) ? enemies : [])
    .filter(isCargoWaveEnemyV67)
    .slice(0, MAX_CARGO_WAVE_ENEMIES)
    .map((enemy, index) => sanitizeCargoWaveEnemyV67({
      ...enemy,
      profileId: enemy.cargoProfileIdV67
    }, index))
    .filter(Boolean);
}

function sanitizeCargoWaveEnemiesV67(source) {
  return (Array.isArray(source) ? source : [])
    .slice(0, MAX_CARGO_WAVE_ENEMIES)
    .map(sanitizeCargoWaveEnemyV67)
    .filter(Boolean)
    .filter((enemy, index, entries) => entries.findIndex((candidate) => candidate.id === enemy.id) === index);
}

export function createCargoBrutalStateV67() {
  const obstacles = defaultObstacleState();
  return {
    schema: 67,
    operationId: CARGO_OPERATION_ID,
    phase: CARGO_BRUTAL_PHASES_V67[0],
    complete: false,
    failureReason: null,
    powerRestored: false,
    loaderMounted: false,
    obstacles,
    obstacleTarget: obstacles.length,
    obstaclesCleared: 0,
    convoy: {
      id: 'cargo-survivor-convoy',
      x: 2520,
      y: DEFAULT_MAIN_DECK_Y - 92,
      w: 210,
      h: 92,
      startX: 2520,
      targetX: 3340,
      active: false,
      complete: false,
      health: 100,
      maxHealth: 100,
      progress: 0,
      wavesSpawned: 0,
      survivors: 3
    },
    core: {
      id: 'cargo-reactor-core',
      x: 3580,
      y: DEFAULT_MAIN_DECK_Y - 82,
      w: 88,
      h: 82,
      retrieved: false,
      carried: false,
      installed: false
    },
    installNode: {
      id: 'cargo-core-coupling',
      x: 4300,
      y: DEFAULT_MAIN_DECK_Y - 108,
      w: 92,
      h: 108,
      active: false
    },
    matriarch: {
      id: null,
      x: 4740,
      y: DEFAULT_MAIN_DECK_Y - 170,
      w: 224,
      h: 170,
      active: false,
      defeated: false,
      phase: 0,
      reinforcements: 0
    },
    loader: {
      id: LOADER_ID,
      hydraulics: 100,
      maxHydraulics: 100,
      heat: 0,
      overheated: false,
      strikeCooldown: 0,
      destroyed: false
    }
  };
}

export function sanitizeCargoBrutalStateV67(rawState) {
  const fallback = createCargoBrutalStateV67();
  if (!isRecord(rawState) || Number(rawState.schema) !== 67) return fallback;
  const phase = CARGO_BRUTAL_PHASES_V67.includes(rawState.phase) ? rawState.phase : fallback.phase;
  const sourceObstacles = Array.isArray(rawState.obstacles) ? rawState.obstacles : [];
  const requestedCleared = integer(rawState.obstaclesCleared, 0, 0, fallback.obstacleTarget);
  const obstacles = fallback.obstacles.map((base, index) => {
    const source = sourceObstacles.find((entry) => entry?.id === base.id) || sourceObstacles[index] || {};
    const hits = integer(source.hits, index < requestedCleared ? base.requiredHits : 0, 0, base.requiredHits);
    return {
      ...base,
      hits,
      cleared: boolean(source.cleared, index < requestedCleared) || hits >= base.requiredHits
    };
  });
  const clearedFromObstacles = obstacles.filter((obstacle) => obstacle.cleared).length;
  const obstaclesCleared = Math.max(requestedCleared, clearedFromObstacles);
  for (let index = 0; index < obstaclesCleared; index += 1) {
    obstacles[index].hits = obstacles[index].requiredHits;
    obstacles[index].cleared = true;
  }
  const convoySource = isRecord(rawState.convoy) ? rawState.convoy : {};
  const coreSource = isRecord(rawState.core) ? rawState.core : {};
  const installSource = isRecord(rawState.installNode) ? rawState.installNode : {};
  const matriarchSource = isRecord(rawState.matriarch) ? rawState.matriarch : {};
  const loaderSource = isRecord(rawState.loader) ? rawState.loader : {};
  const convoyMaxHealth = integer(convoySource.maxHealth, fallback.convoy.maxHealth, 1, 1000);
  const loaderMaxHydraulics = integer(loaderSource.maxHydraulics, fallback.loader.maxHydraulics, 1, 1000);
  return {
    ...fallback,
    phase,
    complete: boolean(rawState.complete),
    failureReason: rawState.failureReason ? String(rawState.failureReason).slice(0, 96) : null,
    powerRestored: boolean(rawState.powerRestored),
    loaderMounted: boolean(rawState.loaderMounted),
    obstacles,
    obstacleTarget: obstacles.length,
    obstaclesCleared,
    convoy: {
      ...fallback.convoy,
      active: boolean(convoySource.active),
      complete: boolean(convoySource.complete),
      health: clamp(convoySource.health ?? fallback.convoy.health, 0, convoyMaxHealth),
      maxHealth: convoyMaxHealth,
      progress: clamp(convoySource.progress, 0, 1),
      wavesSpawned: integer(convoySource.wavesSpawned, 0, 0, 3),
      survivors: integer(convoySource.survivors, fallback.convoy.survivors, 0, 3)
    },
    core: {
      ...fallback.core,
      retrieved: boolean(coreSource.retrieved),
      carried: boolean(coreSource.carried),
      installed: boolean(coreSource.installed)
    },
    installNode: {
      ...fallback.installNode,
      active: boolean(installSource.active, boolean(coreSource.installed))
    },
    matriarch: {
      ...fallback.matriarch,
      id: matriarchSource.id ? String(matriarchSource.id) : null,
      active: boolean(matriarchSource.active),
      defeated: boolean(matriarchSource.defeated),
      phase: integer(matriarchSource.phase, 0, 0, 3),
      reinforcements: integer(matriarchSource.reinforcements, 0, 0, 2)
    },
    loader: {
      ...fallback.loader,
      hydraulics: clamp(loaderSource.hydraulics ?? fallback.loader.hydraulics, 0, loaderMaxHydraulics),
      maxHydraulics: loaderMaxHydraulics,
      heat: clamp(loaderSource.heat, 0, 100),
      overheated: boolean(loaderSource.overheated),
      strikeCooldown: clamp(loaderSource.strikeCooldown, 0, 10),
      destroyed: boolean(loaderSource.destroyed)
    }
  };
}

function createSurvivorActors(state) {
  return [
    ['cargo-survivor-shaw', 'Dr. Imani Shaw'],
    ['cargo-survivor-ruiz', 'Dockmaster Ruiz'],
    ['cargo-survivor-kessler', 'Tech Kessler']
  ].map(([id, name], index) => ({
    id,
    crewId: id,
    name,
    role: index === 0 ? 'Medical survivor' : 'Cargo survivor',
    specialty: index === 0 ? 'medical' : index === 1 ? 'engineering' : 'operations',
    species: 'human',
    action: 'evacuation',
    x: state.convoy.x + index * 48,
    y: state.convoy.y + state.convoy.h - 88,
    w: 38,
    h: 88,
    vx: 0,
    vy: 0,
    facing: 1,
    grounded: true,
    crouching: false,
    climbing: false,
    alive: true,
    downed: false,
    health: state.convoy.health,
    maxHealth: state.convoy.maxHealth,
    armor: 0,
    maxArmor: 40,
    fireClock: 0,
    supportClock: 0,
    workClock: 0,
    alertClock: 0,
    hazardClock: 0,
    stuckClock: 0,
    rallyClock: 0,
    supportCharges: 0,
    kills: 0,
    shots: 0,
    actions: 0,
    damageTaken: 0,
    squadMember: true,
    formationIndex: index
  }));
}

export function withCargoBrutalRuntimeV67(BaseEngine) {
  return class CargoBrutalRuntimeV67 extends BaseEngine {
    start(options = {}) {
      this.cargoBrutalActiveV67 = String(options.campaign?.id || '') === CARGO_CAMPAIGN_ID;
      this.cargoBrutalEnemyCatalogV67 = Array.isArray(options.enemyCatalog) ? [...options.enemyCatalog] : [];
      this.cargoBrutalV67 = this.cargoBrutalActiveV67 ? createCargoBrutalStateV67() : null;
      this.pendingCargoBrutalResumeV67 = null;
      const loaderPose = this.cargoBrutalLoaderPoseFromResumeV67(options.resumeState);
      const snapshot = super.start(options);
      if (!this.isCargoBrutalV67()) return snapshot;
      this.loadCargoBrutalVisualsV67();
      this.configureCargoBrutalWorldV67({
        restored: Boolean(this.lastResumeResult?.applied || this.pendingCargoBrutalResumeV67),
        loaderPose
      });
      this.syncCargoBrutalWorldV67();
      this.onEvent({
        type: 'special-operation-started',
        operationId: CARGO_OPERATION_ID,
        campaignId: CARGO_CAMPAIGN_ID,
        phase: this.cargoBrutalV67.phase,
        issuedVehicleId: LOADER_ID,
        insertion: 'on-foot'
      });
      return { ...snapshot, ...this.getCargoBrutalSnapshotV67() };
    }

    isCargoBrutalV67() {
      return Boolean(this.cargoBrutalActiveV67
        || this.campaign?.id === CARGO_CAMPAIGN_ID
        || this.missionPlan?.campaign?.id === CARGO_CAMPAIGN_ID);
    }

    loadCargoBrutalVisualsV67() {
      if (!this.images || typeof globalThis.Image !== 'function') return false;
      for (const entry of Object.values(CARGO_BRUTAL_VISUAL_REGISTRY_V67)) {
        if (this.images.has(entry.imageKey)) continue;
        const image = new globalThis.Image();
        image.decoding = 'async';
        image.src = entry.path;
        this.images.set(entry.imageKey, image);
      }
      return true;
    }

    cargoBrutalMainDeckYV67() {
      const candidates = [
        this.missionLevelRuntime?.anchors?.spawn?.y,
        this.missionLevelRuntime?.anchors?.power?.y,
        this.missionLevelRuntime?.anchors?.extraction?.y
      ].map(Number).filter(Number.isFinite);
      return candidates.length ? Math.max(...candidates) : DEFAULT_MAIN_DECK_Y;
    }

    cargoBrutalSurfaceAtV67(entity = {}, { preferredY = this.cargoBrutalMainDeckYV67() } = {}) {
      const width = Math.max(1, Number(entity.w) || 1);
      const centerX = (Number(entity.x) || 0) + width / 2;
      const surfaces = (this.platforms || []).filter((platform) => (
        platform?.kind !== 'lift'
        && Number.isFinite(Number(platform?.x))
        && Number.isFinite(Number(platform?.y))
        && Number(platform?.w) > 0
        && centerX >= Number(platform.x) - 2
        && centerX <= Number(platform.x) + Number(platform.w) + 2
      ));
      return surfaces.sort((left, right) => {
        const vertical = Math.abs(Number(left.y) - preferredY) - Math.abs(Number(right.y) - preferredY);
        if (vertical) return vertical;
        return Number(right.w) - Number(left.w);
      })[0] || null;
    }

    placeCargoEntityOnSurfaceV67(entity, { preferredY = this.cargoBrutalMainDeckYV67() } = {}) {
      if (!entity) return null;
      const surface = this.cargoBrutalSurfaceAtV67(entity, { preferredY });
      const surfaceY = surface ? Number(surface.y) : preferredY;
      entity.y = surfaceY - Math.max(1, Number(entity.h) || 1);
      entity.groundY = surfaceY;
      entity.cargoSurfaceIdV67 = surface?.id || null;
      return surface;
    }

    cargoBrutalLoaderPoseFromResumeV67(rawState) {
      const source = rawState?.vehicle;
      if (!isRecord(source) || source.id !== LOADER_ID) return null;
      const x = Number(source.x);
      const y = Number(source.y);
      return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
    }

    restoreCargoBrutalLoaderPoseV67(pose, { reset = false } = {}) {
      if (!this.vehicle) return false;
      if (reset) {
        this.vehicle.x = 820;
        this.vehicle.facing = 1;
        this.vehicle.driver = null;
        this.vehicle.passengers = [];
        this.vehicle.occupied = false;
        for (const actor of [this.player, this.coop]) if (actor) actor.inVehicle = false;
      } else if (pose && Number.isFinite(Number(pose.x))) {
        const width = Math.max(1, Number(this.vehicle.w) || 1);
        const levelWidth = Math.max(width, Number(this.missionLevelBounds?.width) || WORLD_WIDTH);
        this.vehicle.x = clamp(Number(pose.x), 0, levelWidth - width);
      }
      const surface = this.cargoBrutalSurfaceAtV67(this.vehicle);
      const savedFootY = Number(pose?.y) + Math.max(1, Number(this.vehicle.h) || 1);
      const savedPoseSupported = Boolean(
        pose
        && Number.isFinite(savedFootY)
        && (!this.missionLevelRuntime || (surface && Math.abs(savedFootY - Number(surface.y)) <= 4))
      );
      if (savedPoseSupported) {
        this.vehicle.y = Number(pose.y);
        this.vehicle.groundY = this.vehicle.y;
        this.vehicle.cargoSurfaceIdV67 = surface?.id || null;
      } else {
        this.placeCargoEntityOnSurfaceV67(this.vehicle);
        // V52 conserve le sommet du véhicule dans groundY lors de son recalibrage.
        this.vehicle.groundY = this.vehicle.y;
      }
      return true;
    }

    resolveCargoBrutalGeometryV67() {
      const state = this.cargoBrutalV67;
      if (!state) return false;
      const preferredY = this.cargoBrutalMainDeckYV67();
      if (this.powerNode) {
        Object.assign(this.powerNode, { x: 470, w: 62, h: 82, active: state.powerRestored });
        this.placeCargoEntityOnSurfaceV67(this.powerNode, { preferredY });
      }
      for (const obstacle of state.obstacles) this.placeCargoEntityOnSurfaceV67(obstacle, { preferredY });
      this.placeCargoEntityOnSurfaceV67(state.convoy, { preferredY });
      this.placeCargoEntityOnSurfaceV67(state.core, { preferredY });
      this.placeCargoEntityOnSurfaceV67(state.installNode, { preferredY });
      this.placeCargoEntityOnSurfaceV67(state.matriarch, { preferredY });
      if (this.objective) {
        const extraction = this.missionLevelRuntime?.anchors?.extraction;
        Object.assign(this.objective, {
          id: 'cargo-extraction',
          x: extraction ? Number(extraction.x) - 43 : 5700,
          w: 86,
          h: 96,
          complete: state.complete
        });
        this.placeCargoEntityOnSurfaceV67(this.objective, { preferredY });
      }
      return true;
    }

    configureCargoBrutalWorldV67({ restored = false, loaderPose = null } = {}) {
      const state = this.cargoBrutalV67 || createCargoBrutalStateV67();
      this.cargoBrutalV67 = state;
      this.resolveCargoBrutalGeometryV67();
      if (this.vehicle) {
        Object.assign(this.vehicle, {
          id: LOADER_ID,
          name: 'P-5000 Powered Work Loader',
          missionIssued: true,
          active: true,
          cargoBrutal: true
        });
        if (!restored || loaderPose) this.restoreCargoBrutalLoaderPoseV67(loaderPose, { reset: !restored });
      }
      for (const door of this.doors || []) {
        door.open = true;
        door.lockedBy = null;
      }
      if (this.archiveTerminal) this.archiveTerminal.recovered = true;
      if (this.objectiveState) this.objectiveState.complete = false;
      this.cargoSurvivorsV67 = createSurvivorActors(state);

      let matriarch = (this.enemies || []).find((enemy) => enemy.id === state.matriarch.id)
        || (this.enemies || []).find((enemy) => enemy.isBoss);
      if (!matriarch && typeof this.createEnemy === 'function') {
        matriarch = this.createEnemy({
          id: 'cargo-matriarch',
          name: 'Matriarche de Soute',
          biology: 'xenomorph',
          caste: 'royal',
          health: 780,
          damage: 34,
          speed: 1.45
        }, (this.enemies || []).length, state.matriarch.x, state.matriarch.groundY, { boss: true, keyCarrier: false });
        if (Array.isArray(this.enemies) && !this.enemies.includes(matriarch)) this.enemies.push(matriarch);
      }
      if (matriarch) {
        const baseDamage = Number.isFinite(Number(matriarch.cargoBaseDamageV67))
          ? Number(matriarch.cargoBaseDamageV67)
          : Math.max(30, Number(matriarch.damage) || 0);
        const baseSpeed = Number.isFinite(Number(matriarch.cargoBaseSpeedV67))
          ? Number(matriarch.cargoBaseSpeedV67)
          : Math.max(1, Number(matriarch.speed) || 100);
        state.matriarch.id = matriarch.id;
        Object.assign(matriarch, {
          name: 'Matriarche de Soute',
          isBoss: true,
          isRoyal: true,
          biology: 'xenomorph',
          caste: 'royal',
          spriteKey: 'xenoQueen',
          visualImageKey: 'xenoQueen',
          visualSheetId: 'enemy.xenomorph-queen.combat',
          visualIdentityStatus: 'shared-production-asset',
          visualApproximation: true,
          cargoMatriarchV67: true,
          x: state.matriarch.x,
          y: state.matriarch.y,
          w: Math.max(120, Number(matriarch.w) || state.matriarch.w),
          h: Math.max(150, Number(matriarch.h) || state.matriarch.h),
          maxHealth: Math.max(780, Number(matriarch.maxHealth) || 0),
          cargoBaseDamageV67: baseDamage,
          cargoBaseSpeedV67: baseSpeed,
          alert: state.matriarch.active
        });
        this.applyCargoMatriarchPhaseStatsV67(matriarch, state.matriarch.phase);
        matriarch.health = state.matriarch.defeated ? 0 : clamp(matriarch.health || matriarch.maxHealth, 1, matriarch.maxHealth);
        matriarch.alive = !state.matriarch.defeated;
        matriarch.cargoDormantV67 = !state.matriarch.active;
      }
      this.cargoMatriarchV67 = matriarch || null;
      if (this.cargoMatriarchV67) {
        const surface = this.placeCargoEntityOnSurfaceV67(this.cargoMatriarchV67);
        this.cargoMatriarchV67.spawnX = this.cargoMatriarchV67.x;
        this.cargoMatriarchV67.cargoSurfaceIdV67 = surface?.id || null;
        if (typeof this.initializeEnemyMissionNavigation === 'function') this.initializeEnemyMissionNavigation(this.cargoMatriarchV67);
        state.matriarch.y = this.cargoMatriarchV67.y;
        state.matriarch.groundY = this.cargoMatriarchV67.y + this.cargoMatriarchV67.h;
        state.matriarch.cargoSurfaceIdV67 = surface?.id || null;
      }
      this.syncCargoBrutalAliasesV67();
      return state;
    }

    applyCargoMatriarchPhaseStatsV67(boss = this.cargoMatriarchV67, phase = this.cargoBrutalV67?.matriarch?.phase || 0) {
      if (!boss) return false;
      const baseDamage = Number.isFinite(Number(boss.cargoBaseDamageV67))
        ? Number(boss.cargoBaseDamageV67)
        : Math.max(30, Number(boss.damage) || 0);
      const baseSpeed = Number.isFinite(Number(boss.cargoBaseSpeedV67))
        ? Number(boss.cargoBaseSpeedV67)
        : Math.max(1, Number(boss.speed) || 100);
      const bonusTiers = Math.max(0, integer(phase, 0, 0, 3) - 1);
      boss.cargoBaseDamageV67 = baseDamage;
      boss.cargoBaseSpeedV67 = baseSpeed;
      boss.damage = bonusTiers ? Math.min(52, baseDamage + bonusTiers * 5) : baseDamage;
      boss.speed = bonusTiers ? Math.min(220, baseSpeed * (1.12 ** bonusTiers)) : baseSpeed;
      return true;
    }

    syncCargoBrutalAliasesV67() {
      const state = this.cargoBrutalV67;
      if (!state) return;
      this.cargoObstaclesV67 = state.obstacles;
      this.cargoConvoyV67 = state.convoy;
      this.cargoCoreV67 = state.core;
      this.cargoCoreInstallV67 = state.installNode;
      if (this.cargoMatriarchV67) state.matriarch.id = this.cargoMatriarchV67.id;
    }

    syncCargoBrutalWorldV67() {
      if (!this.isCargoBrutalV67() || !this.cargoBrutalV67) return;
      const state = this.cargoBrutalV67;
      this.syncCargoBrutalAliasesV67();
      if (this.powerNode) this.powerNode.active = state.powerRestored;
      if (this.mission) {
        this.mission.phase = state.phase;
        this.mission.objectives.power = state.powerRestored;
        this.mission.objectives.route = state.obstaclesCleared >= state.obstacleTarget && state.convoy.complete;
        this.mission.objectives.boss = state.matriarch.defeated;
        this.mission.objectives.archive = state.core.installed;
        this.mission.objectives.extract = state.complete;
      }
      if (this.objective) this.objective.complete = state.complete;
      if (this.vehicle) {
        state.loader.destroyed = Boolean(this.vehicle.destroyed);
        this.placeCargoEntityOnSurfaceV67(this.vehicle);
        this.vehicle.groundY = this.vehicle.y;
      }
      const convoySpan = state.convoy.targetX - state.convoy.startX;
      state.convoy.x = state.convoy.startX + convoySpan * state.convoy.progress;
      this.placeCargoEntityOnSurfaceV67(state.convoy);
      if (state.core.carried && this.vehicle) {
        state.core.x = this.vehicle.x + this.vehicle.w * 0.56 - state.core.w / 2;
        state.core.y = this.vehicle.y - state.core.h * 0.48;
      } else if (state.core.installed) {
        state.core.x = state.installNode.x + (state.installNode.w - state.core.w) / 2;
        state.core.y = state.installNode.y - state.core.h * 0.18;
      } else this.placeCargoEntityOnSurfaceV67(state.core);
      state.installNode.active = state.core.installed;
      if (this.cargoMatriarchV67) {
        this.cargoMatriarchV67.cargoDormantV67 = !state.matriarch.active;
        this.cargoMatriarchV67.alert = state.matriarch.active;
        if (state.matriarch.defeated) {
          this.cargoMatriarchV67.alive = false;
          this.cargoMatriarchV67.health = 0;
        }
      }
      this.syncCargoConvoySurvivorsV67({ emit: false });
      this.updateCargoSurvivorActorsV67();
    }

    syncCargoConvoySurvivorsV67({ emit = true } = {}) {
      const convoy = this.cargoBrutalV67?.convoy;
      if (!convoy) return 0;
      const previous = integer(convoy.survivors, 3, 0, 3);
      const healthRatio = clamp(convoy.health / Math.max(1, convoy.maxHealth), 0, 1);
      const healthCapacity = healthRatio <= 0 ? 0 : Math.max(1, Math.ceil(healthRatio * 3));
      convoy.survivors = Math.min(previous, healthCapacity);
      if (emit && convoy.survivors < previous) {
        this.emitCargoObjectiveV67('convoy-casualty', {
          lost: previous - convoy.survivors,
          survivors: convoy.survivors,
          health: Math.round(convoy.health)
        });
      }
      return convoy.survivors;
    }

    updateCargoSurvivorActorsV67() {
      const state = this.cargoBrutalV67;
      if (!state || !Array.isArray(this.cargoSurvivorsV67)) return;
      const aliveCount = state.convoy.health <= 0 ? 0 : state.convoy.survivors;
      for (const [index, survivor] of this.cargoSurvivorsV67.entries()) {
        survivor.x = state.convoy.x + index * 50;
        this.placeCargoEntityOnSurfaceV67(survivor);
        survivor.health = clamp(state.convoy.health, 0, survivor.maxHealth);
        survivor.alive = index < aliveCount;
        survivor.downed = !survivor.alive;
        survivor.action = state.convoy.complete ? 'secured' : state.convoy.active ? 'evacuation' : 'waiting';
      }
    }

    emitCargoObjectiveV67(action, detail = {}) {
      this.onEvent({
        type: 'objective-action',
        objectiveId: CARGO_OPERATION_ID,
        operationId: CARGO_OPERATION_ID,
        action,
        phase: this.cargoBrutalV67?.phase || null,
        ...detail
      });
    }

    advanceCargoBrutalPhaseV67(nextPhase = null, detail = {}) {
      const state = this.cargoBrutalV67;
      if (!state || state.complete || this.mission?.state !== 'active') return false;
      const currentIndex = CARGO_BRUTAL_PHASES_V67.indexOf(state.phase);
      const resolved = nextPhase || CARGO_BRUTAL_PHASES_V67[currentIndex + 1];
      const nextIndex = CARGO_BRUTAL_PHASES_V67.indexOf(resolved);
      if (nextIndex < 0 || nextIndex !== currentIndex + 1) return false;
      const previous = state.phase;
      state.phase = resolved;
      if (this.mission) this.mission.phase = resolved;
      this.emitCargoObjectiveV67('phase-complete', { completedPhase: previous, nextPhase: resolved, ...detail });
      return true;
    }

    strikeCargoObstacleV67(actor = this.player) {
      const state = this.cargoBrutalV67;
      if (!state || state.phase !== 'clear-route' || !actor?.inVehicle || this.vehicle?.driver !== actor) return false;
      const obstacle = state.obstacles.find((candidate) => !candidate.cleared && distance(this.vehicle, candidate) <= 270);
      if (!obstacle) return false;
      if (state.loader.hydraulics < 8) return typeof this.locked === 'function' ? this.locked('PRESSION HYDRAULIQUE INSUFFISANTE') : false;
      obstacle.hits += 1;
      state.loader.hydraulics = Math.max(0, state.loader.hydraulics - 8);
      state.loader.heat = Math.min(100, state.loader.heat + 9);
      this.emitCargoObjectiveV67('cargo-obstacle-struck', { obstacleId: obstacle.id, hits: obstacle.hits, requiredHits: obstacle.requiredHits });
      if (obstacle.hits >= obstacle.requiredHits) {
        obstacle.cleared = true;
        state.obstaclesCleared = state.obstacles.filter((candidate) => candidate.cleared).length;
        this.emitCargoObjectiveV67('cargo-obstacle-cleared', { obstacleId: obstacle.id, cleared: state.obstaclesCleared, target: state.obstacleTarget });
        if (state.obstaclesCleared >= state.obstacleTarget) this.advanceCargoBrutalPhaseV67('escort-convoy');
      }
      if (typeof this.setInteractionAnimation === 'function') this.setInteractionAnimation(actor, 'force-interact', 0.62);
      this.audio?.ui?.();
      return true;
    }

    cargoBrutalInteractV67(actor = this.player) {
      const state = this.cargoBrutalV67;
      if (!this.isCargoBrutalV67() || !state || !actor?.alive || this.mission?.state !== 'active') return false;
      const actorSurface = actor.inVehicle && this.vehicle ? this.vehicle : actor;
      if (state.phase === 'restore-power' && this.powerNode && distance(actor, this.powerNode) <= 155) {
        state.powerRestored = true;
        this.powerNode.active = true;
        if (this.mission) this.mission.objectives.power = true;
        if (typeof this.setInteractionAnimation === 'function') this.setInteractionAnimation(actor, 'control-use', 0.8);
        this.advanceCargoBrutalPhaseV67('mount-loader', { powerNodeId: this.powerNode.id });
        this.audio?.ui?.();
        return true;
      }
      if (state.phase === 'mount-loader' && this.vehicle && distance(actor, this.vehicle) <= 220) return this.toggleVehicle(actor);
      if (state.phase === 'clear-route' && actor.inVehicle && this.strikeCargoObstacleV67(actor)) return true;
      const cargoDoor = this.cargoBrutalDoorNearLoaderV67(actor);
      if (cargoDoor) return this.openCargoBrutalDoorV67(actor, cargoDoor);
      if (state.phase === 'escort-convoy' && distance(actorSurface, state.convoy) <= 270) {
        if (!actor.inVehicle || this.vehicle?.driver !== actor) return typeof this.locked === 'function' ? this.locked('P-5000 REQUIS POUR L’ESCORTE') : false;
        if (!state.convoy.active) {
          state.convoy.active = true;
          this.emitCargoObjectiveV67('convoy-started', { survivors: state.convoy.survivors });
          this.spawnCargoWaveV67(2, 'convoy-start');
        }
        return true;
      }
      if (state.phase === 'retrieve-core' && distance(actorSurface, state.core) <= 250) {
        if (!actor.inVehicle || this.vehicle?.driver !== actor) return typeof this.locked === 'function' ? this.locked('GRIFFES DU P-5000 REQUISES') : false;
        state.core.retrieved = true;
        state.core.carried = true;
        this.advanceCargoBrutalPhaseV67('carry-core', { coreId: state.core.id });
        this.audio?.ui?.();
        return true;
      }
      if (state.phase === 'carry-core' && distance(actorSurface, state.installNode) <= 270) {
        if (!state.core.carried || !actor.inVehicle || this.vehicle?.driver !== actor) return false;
        state.core.carried = false;
        state.core.installed = true;
        state.installNode.active = true;
        state.matriarch.active = true;
        state.matriarch.phase = 1;
        if (this.cargoMatriarchV67) {
          this.cargoMatriarchV67.cargoDormantV67 = false;
          this.cargoMatriarchV67.alert = true;
          this.cargoMatriarchV67.alive = true;
          this.cargoMatriarchV67.health = this.cargoMatriarchV67.maxHealth;
        }
        this.advanceCargoBrutalPhaseV67('matriarch', { coreId: state.core.id, bossId: state.matriarch.id });
        this.spawnCargoWaveV67(2, 'matriarch-awakening');
        this.audio?.alarm?.();
        return true;
      }
      if (state.phase === 'extract' && this.objective && distance(actorSurface, this.objective) <= 180) {
        const missing = this.missingCargoBrutalRequirementV67();
        if (missing) return typeof this.locked === 'function' ? this.locked(missing) : false;
        return this.completeCargoBrutalMissionV67(actor);
      }
      return false;
    }

    cargoBrutalDoorNearLoaderV67(actor = this.player) {
      if (!actor?.inVehicle || this.vehicle?.driver !== actor) return null;
      return (this.doors || [])
        .filter((door) => door && (door.open !== true || Number(door.progress) < 0.82))
        .filter((door) => distance(this.vehicle, door) <= 250)
        .sort((left, right) => distance(this.vehicle, left) - distance(this.vehicle, right))[0] || null;
    }

    openCargoBrutalDoorV67(actor = this.player, door = this.cargoBrutalDoorNearLoaderV67(actor)) {
      if (!door || !actor?.inVehicle || this.vehicle?.driver !== actor) return false;
      const requirement = typeof this.doorRequirement === 'function' ? this.doorRequirement(door) : '';
      if (requirement) return typeof this.locked === 'function' ? this.locked(requirement) : false;
      door.open = true;
      if (typeof this.setInteractionAnimation === 'function') this.setInteractionAnimation(actor, 'force-interact', 0.7);
      this.onEvent({ type: 'door', doorId: door.id, open: true, operationId: CARGO_OPERATION_ID, vehicleId: LOADER_ID });
      this.emitCargoObjectiveV67('cargo-door-opened', { doorId: door.id, vehicleId: LOADER_ID });
      this.audio?.ui?.();
      return true;
    }

    interact(actor = this.player) {
      if (!this.isCargoBrutalV67()) return super.interact(actor);
      if (this.cargoBrutalInteractV67(actor)) return true;
      return super.interact(actor);
    }

    toggleVehicle(actor = this.player) {
      if (!this.isCargoBrutalV67()) return super.toggleVehicle(actor);
      const state = this.cargoBrutalV67;
      if (!state?.powerRestored) return typeof this.locked === 'function' ? this.locked('RÉTABLIR LA PUISSANCE AVANT LE P-5000') : false;
      const wasMounted = Boolean(actor?.inVehicle);
      const changed = super.toggleVehicle(actor);
      if (changed && !wasMounted && actor?.inVehicle && !state.loaderMounted) {
        state.loaderMounted = true;
        if (state.phase === 'mount-loader') this.advanceCargoBrutalPhaseV67('clear-route', { vehicleId: LOADER_ID });
      }
      return changed;
    }

    update(delta) {
      super.update(delta);
      if (!this.isCargoBrutalV67() || !this.cargoBrutalV67 || this.mission?.state !== 'active') return;
      const state = this.cargoBrutalV67;
      const step = Math.max(0, Number(delta) || 0);
      state.loader.strikeCooldown = Math.max(0, state.loader.strikeCooldown - step);
      state.loader.heat = Math.max(0, state.loader.heat - step * (state.loader.overheated ? 24 : 12));
      state.loader.hydraulics = Math.min(state.loader.maxHydraulics, state.loader.hydraulics + step * 4.5);
      if (state.loader.overheated && state.loader.heat <= 35) state.loader.overheated = false;
      if (!state.loaderMounted && state.powerRestored && this.vehicle?.driver) {
        state.loaderMounted = true;
        if (state.phase === 'mount-loader') this.advanceCargoBrutalPhaseV67('clear-route', { vehicleId: LOADER_ID });
      }
      if (state.convoy.active && !state.convoy.complete) this.updateCargoConvoyV67(step);
      if (state.matriarch.active && !state.matriarch.defeated) this.updateCargoMatriarchPhasesV67();
      if (this.vehicle?.destroyed && !state.complete) this.failCargoBrutalV67('p-5000-loader-détruit');
      if (state.convoy.active && state.convoy.health <= 0 && !state.convoy.complete) this.failCargoBrutalV67('convoi-survivants-perdu');
      this.syncCargoBrutalWorldV67();
    }

    updateCargoConvoyV67(delta) {
      const state = this.cargoBrutalV67;
      const convoy = state.convoy;
      const closeToLoader = this.vehicle && !this.vehicle.destroyed && distance(this.vehicle, convoy) <= 520;
      const hostiles = (this.enemies || []).filter((enemy) => enemy.alive && !enemy.cargoDormantV67 && distance(enemy, convoy) <= 310);
      if (hostiles.length) convoy.health = Math.max(0, convoy.health - delta * (4 + hostiles.length * 2.4));
      this.syncCargoConvoySurvivorsV67();
      if (closeToLoader && hostiles.length === 0) convoy.progress = Math.min(1, convoy.progress + delta / 10.5);
      const waveThresholds = [0.2, 0.52, 0.8];
      while (convoy.wavesSpawned < waveThresholds.length && convoy.progress >= waveThresholds[convoy.wavesSpawned]) {
        const wave = convoy.wavesSpawned + 1;
        convoy.wavesSpawned = wave;
        this.spawnCargoWaveV67(2 + wave, `convoy-${wave}`);
      }
      if (convoy.progress >= 1 && !convoy.complete) {
        convoy.complete = true;
        convoy.active = false;
        this.emitCargoObjectiveV67('convoy-secured', { health: Math.round(convoy.health), survivors: convoy.survivors });
        if (state.phase === 'escort-convoy') this.advanceCargoBrutalPhaseV67('retrieve-core');
      }
    }

    spawnCargoWaveV67(count, tag) {
      if (!this.cargoBrutalV67 || typeof this.createEnemy !== 'function') return 0;
      const catalog = this.cargoBrutalEnemyCatalogV67.filter((entry) => (
        CARGO_WAVE_BIOLOGIES_V67.has(String(entry?.biology || '').toLowerCase())
        && entry?.caste !== 'royal'
        && !/queen|reine/i.test(entry?.name || '')
      ));
      const sourcePool = catalog.length ? catalog : [{ id: 'cargo-drone', name: 'Xenomorph Cargo Stalker', biology: 'xenomorph', health: 84, damage: 13, speed: 1.35 }];
      const origin = this.cargoBrutalV67.convoy.x;
      let spawned = 0;
      for (let index = 0; index < count; index += 1) {
        const source = sourcePool[(index + (this.enemies?.length || 0)) % sourcePool.length];
        const side = index % 2 ? 1 : -1;
        const x = clamp(origin + side * (330 + index * 95), 120, WORLD_WIDTH - 160);
        const surface = this.cargoBrutalSurfaceAtV67({ x, w: 64 });
        const enemy = this.createEnemy(
          source,
          (this.enemies || []).length,
          x,
          surface?.y || this.cargoBrutalMainDeckYV67(),
          { boss: false, keyCarrier: false }
        );
        if (!enemy) continue;
        enemy.alert = true;
        enemy.waveTag = `cargo:${tag}`;
        enemy.cargoProfileIdV67 = source.id || 'cargo-drone';
        enemy.cargoSurfaceIdV67 = surface?.id || null;
        if (typeof this.initializeEnemyMissionNavigation === 'function') this.initializeEnemyMissionNavigation(enemy);
        if (Array.isArray(this.enemies) && !this.enemies.includes(enemy)) this.enemies.push(enemy);
        spawned += 1;
      }
      if (spawned) this.onEvent({ type: 'objective-wave', objectiveId: CARGO_OPERATION_ID, wave: tag, count: spawned });
      return spawned;
    }

    restoreCargoWaveEnemiesV67(rawEntries, { applyState = true } = {}) {
      const entries = sanitizeCargoWaveEnemiesV67(rawEntries);
      if (!Array.isArray(this.enemies)) this.enemies = [];
      const savedIds = new Set(entries.map((entry) => entry.id));
      const kept = [];
      const keptWaveIds = new Set();
      for (const enemy of this.enemies) {
        if (!isCargoWaveEnemyV67(enemy)) {
          kept.push(enemy);
          continue;
        }
        if (!savedIds.has(enemy.id) || keptWaveIds.has(enemy.id)) continue;
        keptWaveIds.add(enemy.id);
        kept.push(enemy);
      }
      this.enemies.splice(0, this.enemies.length, ...kept);

      const enemiesById = new Map(this.enemies.map((enemy) => [enemy.id, enemy]));
      for (const entry of entries) {
        let enemy = enemiesById.get(entry.id);
        if (!enemy && typeof this.createEnemy === 'function') {
          const catalogProfile = this.cargoBrutalEnemyCatalogV67.find((candidate) => candidate?.id === entry.profileId);
          const profile = catalogProfile || {
            id: entry.profileId,
            name: entry.name,
            biology: entry.biology,
            caste: entry.caste,
            health: entry.maxHealth,
            damage: entry.damage,
            speed: entry.speed,
            armor: entry.armor
          };
          enemy = this.createEnemy(profile, this.enemies.length, entry.x, entry.groundY, { boss: false, keyCarrier: false });
          if (!enemy) continue;
          enemy.id = entry.id;
          if (!this.enemies.includes(enemy)) this.enemies.push(enemy);
          enemiesById.set(entry.id, enemy);
        }
        if (!enemy) continue;
        enemy.waveTag = entry.waveTag;
        enemy.cargoProfileIdV67 = entry.profileId;
        if (!applyState) continue;
        Object.assign(enemy, {
          name: entry.name,
          biology: entry.biology,
          caste: entry.caste,
          x: entry.x,
          spawnX: entry.x,
          y: entry.y,
          groundY: entry.groundY,
          w: entry.w,
          h: entry.h,
          facing: entry.facing,
          alive: entry.alive,
          captured: entry.captured,
          alert: entry.alert,
          revealed: entry.revealed,
          health: entry.health,
          maxHealth: entry.maxHealth,
          armor: entry.armor,
          damage: entry.damage,
          speed: entry.speed,
          deathClock: entry.alive ? 0 : entry.deathClock,
          attackClock: entry.attackClock,
          rangedClock: entry.rangedClock,
          staggerClock: entry.staggerClock,
          hurtClock: entry.hurtClock,
          pounceClock: entry.pounceClock,
          isBoss: false,
          keyCarrier: false
        });
        if (entry.behavior) enemy.behavior = entry.behavior;
        const surface = this.placeCargoEntityOnSurfaceV67(enemy, { preferredY: entry.groundY });
        enemy.spawnX = enemy.x;
        enemy.cargoSurfaceIdV67 = surface?.id || null;
        if (typeof this.initializeEnemyMissionNavigation === 'function') this.initializeEnemyMissionNavigation(enemy);
      }
      return entries.length;
    }

    updateCargoMatriarchPhasesV67() {
      const state = this.cargoBrutalV67;
      const boss = this.cargoMatriarchV67;
      if (!boss?.alive) return;
      const ratio = clamp(boss.health / Math.max(1, boss.maxHealth), 0, 1);
      const targetPhase = ratio > 0.66 ? 1 : ratio > 0.33 ? 2 : 3;
      if (targetPhase <= state.matriarch.phase) return;
      state.matriarch.phase = targetPhase;
      state.matriarch.reinforcements = Math.min(2, state.matriarch.reinforcements + 1);
      this.applyCargoMatriarchPhaseStatsV67(boss, targetPhase);
      this.spawnCargoWaveV67(targetPhase + 1, `matriarch-phase-${targetPhase}`);
      this.emitCargoObjectiveV67('matriarch-phase', { bossPhase: targetPhase, health: Math.round(boss.health) });
    }

    updateVehicleDriver(player, delta, controls) {
      if (!this.isCargoBrutalV67() || !this.cargoBrutalV67) return super.updateVehicleDriver(player, delta, controls);
      const previousX = Number(this.vehicle?.x) || 0;
      const carrying = this.cargoBrutalV67.core.carried;
      const result = super.updateVehicleDriver(player, carrying ? delta * 0.58 : delta, controls);
      const obstacle = this.cargoBrutalV67.obstacles.find((candidate) => !candidate.cleared);
      if (obstacle && this.vehicle) {
        const previousRight = previousX + this.vehicle.w;
        const currentRight = this.vehicle.x + this.vehicle.w;
        if (previousRight <= obstacle.x + 12 && currentRight > obstacle.x + 12) {
          this.vehicle.x = obstacle.x - this.vehicle.w;
          this.vehicle.vx = 0;
        } else if (previousX >= obstacle.x + obstacle.w - 12 && this.vehicle.x < obstacle.x + obstacle.w - 12) {
          this.vehicle.x = obstacle.x + obstacle.w;
          this.vehicle.vx = 0;
        }
      }
      if (this.vehicle) {
        this.placeCargoEntityOnSurfaceV67(this.vehicle);
        this.vehicle.groundY = this.vehicle.y;
        for (const rider of [this.player, this.coop]) {
          if (!rider?.inVehicle) continue;
          rider.y = this.vehicle.y + 10;
        }
      }
      return result;
    }

    fire(actor = this.player) {
      if (!this.isCargoBrutalV67() || !this.cargoBrutalV67 || !actor?.inVehicle || this.vehicle?.driver !== actor) return super.fire(actor);
      const state = this.cargoBrutalV67;
      if (state.core.carried) return typeof this.locked === 'function' ? this.locked('GRIFFES OCCUPÉES PAR LE NOYAU') : false;
      if (state.loader.overheated || state.loader.strikeCooldown > 0 || state.loader.hydraulics < 6) return false;
      if (state.phase === 'clear-route' && this.strikeCargoObstacleV67(actor)) return true;
      const candidates = (this.enemies || []).filter((enemy) => enemy.alive && !enemy.cargoDormantV67 && distance(this.vehicle, enemy) <= 260);
      const target = candidates.sort((left, right) => distance(this.vehicle, left) - distance(this.vehicle, right))[0];
      if (!target) return false;
      state.loader.strikeCooldown = 0.48;
      state.loader.hydraulics = Math.max(0, state.loader.hydraulics - 6);
      state.loader.heat = Math.min(100, state.loader.heat + 18);
      state.loader.overheated = state.loader.heat >= 100;
      actor.fireClock = Math.max(Number(actor.fireClock) || 0, 0.48);
      actor.actionClock = Math.max(Number(actor.actionClock) || 0, 0.4);
      this.applyEnemyDamage(target, state.matriarch.phase >= 3 && target === this.cargoMatriarchV67 ? 104 : 124, {
        owner: actor,
        kind: 'p-5000-hydraulic-claw',
        x: target.x + target.w / 2,
        y: target.y + target.h / 2
      });
      this.audio?.hit?.();
      this.onEvent({ type: 'loader-strike', targetId: target.id, heat: Math.round(state.loader.heat), hydraulics: Math.round(state.loader.hydraulics) });
      return true;
    }

    applyEnemyDamage(enemy, amount, source = {}) {
      if (this.isCargoBrutalV67() && enemy === this.cargoMatriarchV67 && !this.cargoBrutalV67?.matriarch.active) return 0;
      return super.applyEnemyDamage(enemy, amount, source);
    }

    updateEnemy(enemy, delta) {
      if (this.isCargoBrutalV67() && enemy === this.cargoMatriarchV67 && !this.cargoBrutalV67?.matriarch.active) return;
      return super.updateEnemy(enemy, delta);
    }

    drawEnemy(ctx, enemy) {
      if (this.isCargoBrutalV67() && enemy === this.cargoMatriarchV67 && !this.cargoBrutalV67?.matriarch.active) return;
      return super.drawEnemy(ctx, enemy);
    }

    defeatEnemy(enemy, owner) {
      const cargoBoss = this.isCargoBrutalV67() && enemy === this.cargoMatriarchV67;
      const result = super.defeatEnemy(enemy, owner);
      if (cargoBoss && this.cargoBrutalV67 && !this.cargoBrutalV67.matriarch.defeated) {
        this.cargoBrutalV67.matriarch.active = false;
        this.cargoBrutalV67.matriarch.defeated = true;
        this.cargoBrutalV67.matriarch.phase = 3;
        if (this.cargoBrutalV67.phase === 'matriarch') this.advanceCargoBrutalPhaseV67('extract', { bossId: enemy.id });
      }
      return result;
    }

    damageVehicle(amount, source = 'enemy') {
      const result = super.damageVehicle(amount, source);
      if (this.isCargoBrutalV67() && this.cargoBrutalV67 && this.vehicle?.destroyed && !this.cargoBrutalV67.complete) {
        this.cargoBrutalV67.loader.destroyed = true;
        this.failCargoBrutalV67('p-5000-loader-détruit');
      }
      return result;
    }

    failCargoBrutalV67(reason) {
      const state = this.cargoBrutalV67;
      if (!state || state.complete || this.mission?.state !== 'active') return false;
      state.failureReason = reason;
      this.emitCargoObjectiveV67('cargo-failed', { reason });
      return typeof this.failMission === 'function' ? this.failMission(reason) : false;
    }

    missingCargoBrutalRequirementV67() {
      const state = this.cargoBrutalV67;
      if (!state?.powerRestored) return 'PUISSANCE DE SOUTE HORS LIGNE';
      if (!state.loaderMounted) return 'P-5000 NON RÉACTIVÉ';
      if (state.obstaclesCleared < state.obstacleTarget) return `CARGO À DÉGAGER ${state.obstaclesCleared}/${state.obstacleTarget}`;
      if (!state.convoy.complete) return 'CONVOI NON SÉCURISÉ';
      if (!state.core.installed) return 'NOYAU LOURD NON INSTALLÉ';
      if (!state.matriarch.defeated) return 'MATRIARCHE DE SOUTE ENCORE ACTIVE';
      if (!this.vehicle || this.vehicle.destroyed || distance(this.vehicle, this.objective) > 520) return 'RAMENER LE P-5000 À L’EXTRACTION';
      return '';
    }

    missingObjectiveRequirement(options = {}) {
      if (this.isCargoBrutalV67()) return this.missingCargoBrutalRequirementV67(options);
      return super.missingObjectiveRequirement(options);
    }

    missingExtractionRequirement() {
      if (this.isCargoBrutalV67()) return this.missingCargoBrutalRequirementV67();
      return super.missingExtractionRequirement();
    }

    completeCargoBrutalMissionV67(actor = this.player) {
      const state = this.cargoBrutalV67;
      if (!state || state.complete || this.mission?.state !== 'active' || this.missingCargoBrutalRequirementV67()) return false;
      const enrichRewards = (rewards = {}) => ({
        ...rewards,
        credits: (Number(rewards.credits) || 0) + CARGO_BRUTAL_STRATEGIC_BONUS_V67.credits,
        salvage: (Number(rewards.salvage) || 0) + CARGO_BRUTAL_STRATEGIC_BONUS_V67.alloy,
        strategicBonus: { ...CARGO_BRUTAL_STRATEGIC_BONUS_V67 },
        cargoBrutal: true,
        issuedVehicleId: LOADER_ID,
        convoyHealth: Math.round(state.convoy.health),
        survivorsExtracted: state.convoy.survivors,
        coreRecovered: true,
        matriarchDefeated: true
      });
      const emit = this.onEvent;
      let completionEvent = null;
      this.onEvent = (event) => {
        if (event?.type === 'mission-complete') {
          completionEvent = event;
          return;
        }
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
      state.failureReason = null;
      this.mission.rewards = enrichRewards(this.mission.rewards);
      this.mission.objectives.extract = true;
      if (this.objective) this.objective.complete = true;
      this.emitCargoObjectiveV67('cargo-complete', { survivors: state.convoy.survivors, convoyHealth: Math.round(state.convoy.health) });
      emit(completionEvent
        ? { ...completionEvent, rewards: this.mission.rewards }
        : {
            type: 'mission-complete',
            kills: (Number(this.player?.kills) || 0) + (Number(this.coop?.kills) || 0),
            rewards: this.mission.rewards,
            objectiveId: this.objectiveRuntime?.id || CARGO_OPERATION_ID,
            extractedBy: actor?.coop ? 'coop' : 'primary'
          });
      return true;
    }

    completeMission(actor = this.player) {
      if (this.isCargoBrutalV67()) return this.completeCargoBrutalMissionV67(actor);
      return super.completeMission(actor);
    }

    restartFromCheckpoint() {
      const cargoFailure = this.isCargoBrutalV67() && this.mission?.state === 'failed';
      const result = super.restartFromCheckpoint();
      if (!cargoFailure || !result || !this.cargoBrutalV67) return result;
      const state = this.cargoBrutalV67;
      state.failureReason = null;
      if (state.loader.destroyed && this.vehicle) {
        state.loader.destroyed = false;
        this.vehicle.destroyed = false;
        this.vehicle.active = true;
        this.vehicle.hull = Math.max(1, this.vehicle.maxHull * 0.45);
      }
      if (state.convoy.health <= 0) {
        state.convoy.health = state.convoy.maxHealth * 0.5;
        state.convoy.active = false;
        state.convoy.survivors = Math.max(1, state.convoy.survivors);
      }
      this.syncCargoBrutalWorldV67();
      return result;
    }

    phaseLabel() {
      if (this.isCargoBrutalV67() && this.cargoBrutalV67) return PHASE_LABELS[this.cargoBrutalV67.phase] || 'CARGO BRUTAL';
      return super.phaseLabel();
    }

    objectiveProgressText() {
      if (!this.isCargoBrutalV67() || !this.cargoBrutalV67) return super.objectiveProgressText();
      const state = this.cargoBrutalV67;
      if (state.phase === 'clear-route') return `OBSTACLES ${state.obstaclesCleared}/${state.obstacleTarget} · HYD ${Math.round(state.loader.hydraulics)}%`;
      if (state.phase === 'escort-convoy') return `CONVOI ${Math.round(state.convoy.progress * 100)}% · INTÉGRITÉ ${Math.round(state.convoy.health)}%`;
      if (state.phase === 'carry-core') return `NOYAU EN CHARGE · MOBILITÉ 58%`;
      if (state.phase === 'matriarch') return `MATRIARCHE PHASE ${state.matriarch.phase}/3`;
      return this.missingCargoBrutalRequirementV67() || 'EXTRACTION DISPONIBLE';
    }

    getInteractionPrompt(actor = this.player) {
      if (!this.isCargoBrutalV67() || !this.cargoBrutalV67 || !actor) return super.getInteractionPrompt(actor);
      const state = this.cargoBrutalV67;
      const surface = actor.inVehicle && this.vehicle ? this.vehicle : actor;
      if (state.phase === 'restore-power' && distance(actor, this.powerNode) <= 155) return 'E  RÉTABLIR LA PUISSANCE DE SOUTE';
      if (state.phase === 'mount-loader' && distance(actor, this.vehicle) <= 220) return 'V / E  MONTER DANS LE P-5000';
      const obstacle = state.obstacles.find((candidate) => !candidate.cleared && distance(surface, candidate) <= 270);
      if (state.phase === 'clear-route' && obstacle) return `E / TIR  DÉPLACER ${obstacle.id.toUpperCase()} · ${obstacle.hits}/${obstacle.requiredHits}`;
      const cargoDoor = this.cargoBrutalDoorNearLoaderV67(actor);
      if (cargoDoor) return cargoDoor.open ? 'E  ATTENDRE L’OUVERTURE DU SAS CARGO' : 'E  ACTIONNER LA PORTE DE SOUTE';
      if (state.phase === 'escort-convoy' && distance(surface, state.convoy) <= 270 && !state.convoy.active) return 'E  LANCER L’ESCORTE DES SURVIVANTS';
      if (state.phase === 'retrieve-core' && distance(surface, state.core) <= 250) return 'E  SAISIR LE NOYAU AVEC LES GRIFFES';
      if (state.phase === 'carry-core' && distance(surface, state.installNode) <= 270) return 'E  COUPLER LE NOYAU';
      if (state.phase === 'extract' && distance(surface, this.objective) <= 180) return this.missingCargoBrutalRequirementV67() || 'E  CONFIRMER L’EXTRACTION CARGO';
      return super.getInteractionPrompt(actor);
    }

    drawCargoBitmapCellV67(ctx, imageKey, target, columns = 1, rows = 1, column = 0, row = 0, alpha = 1) {
      const image = this.images?.get(imageKey);
      if (!ctx || !target || !isImageReady(image)) return false;
      const sourceWidth = (image.naturalWidth || image.width) / columns;
      const sourceHeight = (image.naturalHeight || image.height) / rows;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(image, column * sourceWidth, row * sourceHeight, sourceWidth, sourceHeight, target.x, target.y, target.w, target.h);
      ctx.restore();
      return true;
    }

    drawCargoVisualCellV67(ctx, sheet, target, cell, alpha = 1) {
      if (!sheet || !cell) return false;
      return this.drawCargoBitmapCellV67(
        ctx,
        sheet.imageKey,
        target,
        sheet.columns,
        sheet.rows,
        cell.column,
        cell.row,
        alpha
      );
    }

    drawCargoPropFallbackV67(ctx, target, kind, alpha = 1) {
      if (!ctx || !target) return false;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = kind === 'convoy-capsule' ? '#344b43' : kind.startsWith('core') || kind.startsWith('coupler') ? '#645d39' : '#4a4d43';
      ctx.strokeStyle = kind.endsWith('-on') ? '#78d7c4' : '#c7b66c';
      ctx.lineWidth = 2;
      ctx.fillRect(target.x, target.y, target.w, target.h);
      ctx.strokeRect(target.x + 1, target.y + 1, Math.max(0, target.w - 2), Math.max(0, target.h - 2));
      ctx.beginPath();
      ctx.moveTo(target.x + target.w * 0.2, target.y + target.h * 0.5);
      ctx.lineTo(target.x + target.w * 0.8, target.y + target.h * 0.5);
      ctx.stroke();
      ctx.restore();
      return true;
    }

    drawCargoPropV67(ctx, target, kind, alpha = 1) {
      const cell = CARGO_BRUTAL_PROP_CELLS_V67[kind];
      if (this.drawCargoVisualCellV67(ctx, CARGO_BRUTAL_PROPS_SHEET_V67, target, cell, alpha)) return true;
      return this.drawCargoPropFallbackV67(ctx, target, kind, alpha);
    }

    drawCargoSurvivorFallbackV67(ctx, survivor, alpha = 1) {
      if (!ctx || !survivor) return false;
      const centerX = survivor.x + survivor.w / 2;
      const top = survivor.y + 8;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = survivor.id === 'cargo-survivor-shaw' ? '#d7ddd8' : survivor.id === 'cargo-survivor-ruiz' ? '#c8a64b' : '#60796f';
      ctx.beginPath();
      ctx.arc(centerX, top + 9, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#17221f';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(centerX, top + 18);
      ctx.lineTo(centerX, survivor.y + survivor.h - 22);
      ctx.moveTo(centerX, top + 34);
      ctx.lineTo(centerX + survivor.facing * 16, top + 50);
      ctx.moveTo(centerX, survivor.y + survivor.h - 22);
      ctx.lineTo(centerX - 10, survivor.y + survivor.h);
      ctx.moveTo(centerX, survivor.y + survivor.h - 22);
      ctx.lineTo(centerX + 10, survivor.y + survivor.h);
      ctx.stroke();
      ctx.restore();
      return true;
    }

    drawCargoSurvivorV67(ctx, survivor) {
      const frame = resolveCargoBrutalSurvivorFrameV67(survivor);
      if (!frame) return false;
      const alpha = survivor.alive ? 1 : survivor.downed ? 0.72 : 0.38;
      const motionBob = frame.action === 'evacuation' && !this.accessibilityRuntime?.reducedMotion
        ? Math.sin((Math.max(0, Number(this.animationTime) || 0) + survivor.formationIndex * 0.17) * 12) * 1.5
        : 0;
      const visual = {
        x: survivor.x + survivor.w / 2 - 36,
        y: survivor.y + survivor.h - 108 + motionBob,
        w: 72,
        h: 108
      };
      const drawn = this.drawCargoVisualCellV67(ctx, CARGO_BRUTAL_SURVIVORS_SHEET_V67, visual, frame, alpha);
      if (!drawn) this.drawCargoSurvivorFallbackV67(ctx, survivor, alpha);
      if (survivor.alive) {
        ctx.fillStyle = 'rgba(2,8,6,.82)';
        ctx.fillRect(survivor.x - 2, survivor.y - 17, survivor.w + 4, 5);
        ctx.fillStyle = survivor.health < survivor.maxHealth * 0.35 ? '#d06d62' : '#79c995';
        ctx.fillRect(survivor.x - 2, survivor.y - 17, (survivor.w + 4) * (survivor.health / survivor.maxHealth), 5);
      }
      return true;
    }

    drawWorld(ctx) {
      super.drawWorld(ctx);
      if (!this.isCargoBrutalV67() || !this.cargoBrutalV67 || !ctx) return;
      const state = this.cargoBrutalV67;
      for (const obstacle of state.obstacles) this.drawCargoPropV67(ctx, obstacle, obstacle.id, obstacle.cleared ? 0.22 : 1);
      this.drawCargoPropV67(ctx, state.core, state.core.installed ? 'core-on' : 'core-off');
      this.drawCargoPropV67(ctx, state.installNode, state.installNode.active ? 'coupler-on' : 'coupler-off');
      this.drawCargoPropV67(ctx, state.convoy, 'convoy-capsule');
      for (const survivor of this.cargoSurvivorsV67 || []) this.drawCargoSurvivorV67(ctx, survivor);
      ctx.save();
      ctx.strokeStyle = state.convoy.health < 35 ? '#d45d55' : '#83c99a';
      ctx.lineWidth = 2;
      ctx.strokeRect(state.convoy.x - 14, state.convoy.y - 10, state.convoy.w + 28, state.convoy.h + 6);
      ctx.fillStyle = 'rgba(3, 10, 8, .82)';
      ctx.fillRect(state.convoy.x - 14, state.convoy.y - 26, state.convoy.w + 28, 12);
      ctx.fillStyle = '#83c99a';
      ctx.fillRect(state.convoy.x - 14, state.convoy.y - 26, (state.convoy.w + 28) * state.convoy.health / state.convoy.maxHealth, 12);
      ctx.restore();
    }

    drawHud(ctx) {
      super.drawHud(ctx);
      if (!this.isCargoBrutalV67() || !this.cargoBrutalV67 || !ctx) return;
      const state = this.cargoBrutalV67;
      ctx.save();
      ctx.fillStyle = 'rgba(3, 9, 8, .9)';
      ctx.fillRect(914, 94, 348, 72);
      ctx.strokeStyle = '#9e8e58';
      ctx.strokeRect(914.5, 94.5, 347, 71);
      ctx.fillStyle = '#dcc77b';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('CARGO BRUTAL · P-5000', 928, 113);
      ctx.fillStyle = '#c7d5ca';
      ctx.fillText(this.phaseLabel().slice(0, 43), 928, 132);
      ctx.fillStyle = '#9eb2a4';
      ctx.fillText(this.objectiveProgressText().slice(0, 45), 928, 151);
      ctx.restore();
    }

    captureResumeState() {
      const base = super.captureResumeState();
      if (!this.isCargoBrutalV67() || !this.cargoBrutalV67) return base;
      return {
        ...base,
        specialOperation: {
          ...(isRecord(base.specialOperation) ? base.specialOperation : {}),
          operationId: CARGO_OPERATION_ID,
          cargoBrutalV67: sanitizeCargoBrutalStateV67(this.cargoBrutalV67),
          cargoWaveEnemiesV67: captureCargoWaveEnemiesV67(this.enemies)
        }
      };
    }

    applyResumeState(rawState) {
      const cargoSource = rawState?.specialOperation?.cargoBrutalV67 || rawState?.cargoBrutalV67;
      const cargoWaveEnemies = rawState?.specialOperation?.cargoWaveEnemiesV67 || rawState?.cargoWaveEnemiesV67;
      if (this.isCargoBrutalV67() && isRecord(cargoSource) && Number(cargoSource.schema) === 67) {
        this.restoreCargoWaveEnemiesV67(cargoWaveEnemies, { applyState: false });
      }
      const result = super.applyResumeState(rawState);
      if (!this.isCargoBrutalV67() || !result?.applied) return result;
      if (!isRecord(cargoSource) || Number(cargoSource.schema) !== 67) return result;
      this.cargoBrutalV67 = sanitizeCargoBrutalStateV67(cargoSource);
      this.pendingCargoBrutalResumeV67 = this.cargoBrutalV67;
      this.restoreCargoWaveEnemiesV67(cargoWaveEnemies, { applyState: true });
      if (this.powerNode && this.vehicle && this.objective) {
        if (!this.cargoMatriarchV67) this.configureCargoBrutalWorldV67({ restored: true });
        this.syncCargoBrutalWorldV67();
      }
      return { ...result, restored: (Number(result.restored) || 0) + 1, specialOperationRestored: true };
    }

    getCargoBrutalSnapshotV67() {
      if (!this.isCargoBrutalV67() || !this.cargoBrutalV67) return { cargoBrutalV67: null };
      const state = sanitizeCargoBrutalStateV67(this.cargoBrutalV67);
      return {
        cargoBrutalV67: {
          ...state,
          issuedVehicleId: LOADER_ID,
          insertion: 'on-foot',
          physicalSurfaces: {
            obstacles: state.obstacles.length,
            convoy: true,
            core: true,
            installNode: true,
            boss: Boolean(this.cargoMatriarchV67)
          }
        }
      };
    }

    getGameplayReport() {
      const report = super.getGameplayReport();
      return this.isCargoBrutalV67() ? { ...report, specialOperation: this.getCargoBrutalSnapshotV67().cargoBrutalV67 } : report;
    }

    getSnapshot() {
      return { ...super.getSnapshot(), ...this.getCargoBrutalSnapshotV67() };
    }
  };
}
