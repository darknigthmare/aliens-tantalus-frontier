import {
  ALIEN_SURVIVAL_CAMPAIGN_ID_V70,
  ALIEN_SURVIVAL_DOOR_DEFINITIONS_V70,
  ALIEN_SURVIVAL_OPERATION_ID_V70,
  ALIEN_SURVIVAL_POWER_CIRCUIT_IDS_V70,
  ALIEN_SURVIVAL_REQUIRED_MECHANICS_V70,
  ALIEN_SURVIVAL_ROOM_IDS_V70,
  ALIEN_SURVIVAL_SAFE_OXYGEN_V70,
  ALIEN_SURVIVAL_SAFE_PRESSURE_V70,
  ALIEN_SURVIVAL_SCHEMA_V70,
  buildAlienSurvivalResolutionPayloadV70,
  createAlienSurvivalStateV70,
  deriveAlienSurvivalPhaseV70,
  getAlienSurvivalMechanicsV70,
  sanitizeAlienSurvivalStateV70,
  simulateRoomPressureV70,
  validateAlienSurvivalCompletionV70
} from './alien-survival-systems-v70.js';
import {
  ALIEN_SURVIVAL_SYSTEMS_SHEET_V70,
  resolveAlienSurvivalReusedAssetV70,
  resolveAlienSurvivalSystemCellV70
} from './alien-survival-visuals-v70.js';

export const ALIEN_SURVIVAL_INTERACTION_RADIUS_V70 = 158;
export const ALIEN_SURVIVAL_WELD_SECONDS_V70 = 1.6;
export const ALIEN_SURVIVAL_ACID_DAMAGE_INTERVAL_V70 = 0.72;
export const ALIEN_SURVIVAL_WELDABLE_DOOR_ID_V70 = 'cargo-bulkhead';
export const ALIEN_SURVIVAL_INSERTION_SAFE_RADIUS_V70 = 760;

export const ALIEN_SURVIVAL_STATION_LAYOUT_V70 = freezeDeep([
  { id: 'survival-power-breaker', type: 'power', roomId: 'ship-engineering', label: 'RÉPARTITEUR DE PUISSANCE', fraction: 0.72 },
  { id: 'survival-cctv-console', type: 'cctv', roomId: 'ship-habitation', label: 'CONSOLE CCTV', fraction: 0.52 },
  { id: 'survival-pressure-valve', type: 'pressure', roomId: 'ship-extraction', label: 'VANNE D’ÉGALISATION', fraction: 0.28 },
  { id: 'survival-engineering-auth', type: 'self-destruct', authorizationId: 'engineering', roomId: 'ship-engineering', label: 'CLÉ RÉACTEUR', fraction: 0.35 },
  { id: 'survival-command-auth', type: 'self-destruct', authorizationId: 'command', roomId: 'ship-command', label: 'CLÉ PASSERELLE', fraction: 0.38 }
]);

const STATION_WIDTH = 72;
const STATION_HEIGHT = 82;
const WELD_RANGE = 176;
const PRESSURE_DAMAGE_THRESHOLD = 35;
const AIRLOCK_SAFE_DIFFERENCE = 12;
const MAX_ACID_POOLS = 48;
const POWER_PRESETS = Object.freeze([
  Object.freeze(['security', 'cctv']),
  Object.freeze(['life-support', 'security']),
  Object.freeze(['life-support', 'cctv'])
]);

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freezeDeep(child);
  return value;
}

const asList = (value) => Array.isArray(value) ? value : [];
const isRecord = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, Number.isFinite(Number(value)) ? Number(value) : minimum));
const rounded = (value, precision = 6) => {
  const multiplier = 10 ** precision;
  return Math.round((Number(value) + Number.EPSILON) * multiplier) / multiplier;
};
const boundedText = (value, fallback = '', maximum = 128) => {
  const normalized = typeof value === 'string' ? value.trim() : '';
  return (normalized || fallback).slice(0, maximum);
};
const boundedIdentifier = (value, fallback = ALIEN_SURVIVAL_OPERATION_ID_V70) => {
  const normalized = boundedText(value, fallback, 96).toLowerCase().replace(/[^a-z0-9:-]+/g, '-').replace(/^-|-$/g, '');
  return normalized || fallback;
};
const finiteDelta = (value) => clamp(value, 0, 30);
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

function centerDistance(left, right) {
  if (!left || !right) return Infinity;
  return Math.hypot(
    (Number(left.x) || 0) + (Number(left.w) || 0) / 2 - ((Number(right.x) || 0) + (Number(right.w) || 0) / 2),
    (Number(left.y) || 0) + (Number(left.h) || 0) / 2 - ((Number(right.y) || 0) + (Number(right.h) || 0) / 2)
  );
}

function overlaps(left, right) {
  if (!left || !right) return false;
  return left.x < right.x + right.w
    && left.x + left.w > right.x
    && left.y < right.y + right.h
    && left.y + left.h > right.y;
}

function actionResult(ok, reason = null, extras = {}) {
  return { ok: Boolean(ok), applied: Boolean(ok && extras.applied !== false), reason, ...extras };
}

function difficultyId(options, engine) {
  const candidate = boundedText(
    options?.difficulty?.id || options?.difficultyId || options?.strategicBriefing?.difficulty || engine?.difficultyRuntime?.id || engine?.difficulty,
    'standard',
    24
  ).toLowerCase();
  return ['story', 'standard', 'nightmare'].includes(candidate) ? candidate : 'standard';
}

function actorMovementRequested(engine, controls = {}) {
  const keys = engine?.keys;
  if (!keys?.has) return false;
  return [controls.left, controls.right, controls.up, controls.down, controls.jump]
    .filter(Boolean)
    .some((code) => keys.has(code));
}

function xenomorphEnemy(enemy) {
  const identity = `${enemy?.biology || ''} ${enemy?.species || ''} ${enemy?.family || ''} ${enemy?.behavior || ''} ${enemy?.id || ''}`;
  return /xeno|alien|facehugger|chestburster|ovomorph|praetorian|runner|drone|warrior/i.test(identity)
    && !/synthetic|android|human|mercenary/i.test(identity);
}

function stationCellId(station, state) {
  if (station.type === 'power') {
    const active = ALIEN_SURVIVAL_POWER_CIRCUIT_IDS_V70.find((id) => state.power.routes[id]);
    return active === 'life-support' ? 'life-support-powered'
      : active === 'security' ? 'security-powered'
        : active === 'cctv' ? 'cctv-powered' : 'power-distributor-off';
  }
  if (station.type === 'cctv') return 'cctv-console';
  if (station.type === 'pressure') return 'pressure-valve';
  return state.selfDestruct.armed ? 'self-destruct-armed' : 'power-distributor-off';
}

export function withAlienSurvivalRuntimeV70(BaseEngine) {
  return class AlienSurvivalRuntimeV70 extends BaseEngine {
    start(options = {}) {
      this.alienSurvivalActiveV70 = String(options.campaign?.id || '') === ALIEN_SURVIVAL_CAMPAIGN_ID_V70;
      this.alienSurvivalConfiguredV70 = false;
      this.alienSurvivalPendingResumeV70 = null;
      this.alienSurvivalStationsV70 = [];
      this.alienSurvivalCameraFeedsV70 = [];
      this.alienSurvivalWorldActionV70 = null;
      this.alienSurvivalActionActorV70 = null;
      this.alienSurvivalCctvActorV70 = null;
      this.alienSurvivalCameraBeforeCctvV70 = null;
      this.alienSurvivalPressureEventsV70 = new Set();
      this.alienSurvivalAcidPersistenceEventsV70 = new Set();
      this.alienSurvivalCountdownBucketV70 = null;
      this.alienSurvivalInsertionSecurityV70 = null;
      this.alienSurvivalDifficultyV70 = difficultyId(options, this);
      this.alienSurvivalDeploymentOperationIdV70 = boundedIdentifier(
        options.strategicBriefing?.id || options.operation?.id,
        ALIEN_SURVIVAL_OPERATION_ID_V70
      );
      this.alienSurvivalV70 = this.alienSurvivalActiveV70
        ? createAlienSurvivalStateV70({
            deploymentOperationId: this.alienSurvivalDeploymentOperationIdV70,
            difficulty: this.alienSurvivalDifficultyV70,
            requiredFeedIds: ALIEN_SURVIVAL_ROOM_IDS_V70
          })
        : null;

      const snapshot = super.start(options);
      if (!this.isAlienSurvivalMissionV70()) return snapshot;

      const pending = this.alienSurvivalPendingResumeV70;
      const pendingMatchesDeployment = !pending?.deploymentOperationId
        || pending.deploymentOperationId === this.alienSurvivalDeploymentOperationIdV70;
      this.alienSurvivalV70 = pending && pendingMatchesDeployment
        ? this.normalizeAlienSurvivalStateV70(pending)
        : this.normalizeAlienSurvivalStateV70(this.alienSurvivalV70);
      this.alienSurvivalPendingResumeV70 = null;
      this.alienSurvivalConfiguredV70 = true;
      this.configureAlienSurvivalWorldV70();
      this.ensureAlienSurvivalInsertionClearanceV70();
      this.loadAlienSurvivalVisualsV70();
      if (pending && this.lastResumeResult) {
        this.lastResumeResult = {
          ...this.lastResumeResult,
          alienSurvivalRestoredV70: pendingMatchesDeployment,
          alienSurvivalReasonV70: pendingMatchesDeployment ? null : 'deployment-mismatch'
        };
      }
      this.onEvent?.({
        type: 'alien-survival-started',
        operationId: ALIEN_SURVIVAL_OPERATION_ID_V70,
        deploymentOperationId: this.alienSurvivalDeploymentOperationIdV70,
        campaignId: ALIEN_SURVIVAL_CAMPAIGN_ID_V70,
        roomCount: this.alienSurvivalV70.rooms.length,
        stationCount: this.alienSurvivalStationsV70.length
      });
      return { ...(isRecord(snapshot) ? snapshot : {}), ...this.getAlienSurvivalSnapshotV70() };
    }

    isAlienSurvivalMissionV70() {
      return Boolean(
        this.alienSurvivalActiveV70
        || this.campaign?.id === ALIEN_SURVIVAL_CAMPAIGN_ID_V70
        || this.missionPlan?.campaign?.id === ALIEN_SURVIVAL_CAMPAIGN_ID_V70
      );
    }

    alienSurvivalPhysicalDoorsV70() {
      const ids = new Set(ALIEN_SURVIVAL_DOOR_DEFINITIONS_V70.map((door) => door.id));
      return asList(this.doors).filter((door) => ids.has(door?.id));
    }

    normalizeAlienSurvivalStateV70(source) {
      const physicalIds = this.alienSurvivalPhysicalDoorsV70().map((door) => door.id);
      return sanitizeAlienSurvivalStateV70(source, {
        deploymentOperationId: this.alienSurvivalDeploymentOperationIdV70,
        difficulty: this.alienSurvivalDifficultyV70,
        roomIds: ALIEN_SURVIVAL_ROOM_IDS_V70,
        doorDefinitions: ALIEN_SURVIVAL_DOOR_DEFINITIONS_V70,
        doorIds: physicalIds.length ? physicalIds : undefined,
        requiredFeedIds: ALIEN_SURVIVAL_ROOM_IDS_V70
      });
    }

    alienSurvivalZoneV70(roomId) {
      return asList(this.missionLevelRuntime?.biomeZones).find((zone) => zone.id === roomId) || null;
    }

    alienSurvivalSurfacesV70(roomId) {
      return asList(this.platforms)
        .filter((platform) => platform?.kind !== 'lift'
          && platform?.zoneId === roomId
          && Number.isFinite(Number(platform.x))
          && Number.isFinite(Number(platform.y))
          && Number(platform.w) >= STATION_WIDTH + 20)
        .sort((left, right) => Number(left.x) - Number(right.x) || Number(left.y) - Number(right.y));
    }

    alienSurvivalPhysicalPointV70(roomId, fraction = 0.5, width = STATION_WIDTH, height = STATION_HEIGHT) {
      const zone = this.alienSurvivalZoneV70(roomId);
      const zoneX = Number(zone?.x) || 0;
      const zoneWidth = Math.max(120, Number(zone?.w) || (Number(this.missionLevelBounds?.width) || 6200) / 6);
      const idealX = zoneX + zoneWidth * clamp(fraction, 0.08, 0.92);
      const surfaces = this.alienSurvivalSurfacesV70(roomId);
      const containing = surfaces.filter((surface) => idealX >= surface.x && idealX <= surface.x + surface.w);
      const surface = (containing.length ? containing : surfaces)
        .sort((left, right) => Math.abs(left.x + left.w / 2 - idealX) - Math.abs(right.x + right.w / 2 - idealX))[0] || null;
      const minimumX = Number(surface?.x) || zoneX;
      const maximumX = surface
        ? Number(surface.x) + Number(surface.w) - width
        : zoneX + zoneWidth - width;
      const x = clamp(idealX - width / 2, minimumX, Math.max(minimumX, maximumX));
      const groundY = Number(surface?.y) || Math.min(Number(this.missionLevelBounds?.height) || 720, 704);
      return {
        x,
        y: groundY - height,
        w: width,
        h: height,
        groundY,
        surfaceId: surface?.id || null,
        roomId
      };
    }

    alienSurvivalInsertionAnchorV70() {
      const player = this.player;
      const checkpoint = this.checkpoint;
      if (!player || checkpoint?.id !== 'insertion') return null;
      const distanceFromCheckpoint = Math.hypot(
        (Number(player.x) || 0) - (Number(checkpoint.x) || 0),
        (Number(player.y) || 0) - (Number(checkpoint.y) || 0)
      );
      if (distanceFromCheckpoint > 180) return null;
      return {
        x: Number(checkpoint.x) || 0,
        y: Number(checkpoint.y) || 0,
        w: Math.max(1, Number(player.w) || 42),
        h: Math.max(1, Number(player.h) || 92)
      };
    }

    ensureAlienSurvivalInsertionClearanceV70(reason = 'mission-start') {
      if (!this.isAlienSurvivalMissionV70() || !this.alienSurvivalV70) return { applied: false, reason: 'inactive' };
      const anchor = this.alienSurvivalInsertionAnchorV70();
      if (!anchor) return { applied: false, reason: 'away-from-insertion' };

      const contacts = asList(this.enemies).filter((enemy) => enemy?.alive);
      const unsafeContacts = contacts.filter((enemy) => centerDistance(enemy, anchor) < ALIEN_SURVIVAL_INSERTION_SAFE_RADIUS_V70);
      const occupied = contacts.filter((enemy) => !unsafeContacts.includes(enemy));
      const relocationSlots = [0.12, 0.3, 0.48, 0.66, 0.84];
      let movedEnemies = 0;

      for (const [index, enemy] of unsafeContacts.entries()) {
        const width = Math.max(18, Number(enemy.w) || 72);
        const height = Math.max(18, Number(enemy.h) || 88);
        let selected = null;
        for (let offset = 0; offset < relocationSlots.length; offset += 1) {
          const fraction = relocationSlots[(index + offset) % relocationSlots.length];
          const candidate = this.alienSurvivalPhysicalPointV70('ship-engineering', fraction, width, height);
          const blocked = occupied.some((other) => {
            const horizontalGap = Math.abs((candidate.x + width / 2) - ((Number(other.x) || 0) + (Number(other.w) || 0) / 2));
            const verticalGap = Math.abs(candidate.groundY - (Number(other.groundY) || (Number(other.y) || 0) + (Number(other.h) || 0)));
            return horizontalGap < (width + (Number(other.w) || 72)) / 2 + 28 && verticalGap < Math.max(height, Number(other.h) || 88);
          });
          if (!blocked) {
            selected = candidate;
            break;
          }
        }
        selected ||= this.alienSurvivalPhysicalPointV70('ship-habitation', relocationSlots[index % relocationSlots.length], width, height);
        Object.assign(enemy, {
          x: selected.x,
          y: selected.y,
          spawnX: selected.x,
          groundY: selected.groundY,
          vx: 0,
          vy: 0,
          alert: false,
          attacking: false,
          pendingMelee: false,
          pendingMeleeTargetId: null,
          attackWindupClock: 0,
          attackAnimationClock: 0,
          attackClock: Math.max(1.2, Number(enemy.attackClock) || 0),
          rangedClock: Math.max(1.2, Number(enemy.rangedClock) || 0),
          revealed: 0,
          levelZoneId: selected.roomId,
          alienSurvivalInsertionRelocatedV70: true
        });
        this.initializeEnemyMissionNavigation?.(enemy);
        occupied.push(enemy);
        movedEnemies += 1;
      }

      const unsafePools = this.alienSurvivalV70.acidPools.filter((pool) => pool.active && centerDistance(pool, anchor) < ALIEN_SURVIVAL_INSERTION_SAFE_RADIUS_V70);
      for (const [index, pool] of unsafePools.entries()) {
        const point = this.alienSurvivalPhysicalPointV70('ship-cargo', 0.45 + (index % 3) * 0.18, pool.w, pool.h);
        pool.x = rounded(point.x);
        pool.y = rounded(point.groundY - pool.h);
        pool.roomId = 'ship-cargo';
        pool.relocatedFromInsertion = true;
      }

      const projectilesBefore = asList(this.hostileProjectiles).length;
      this.hostileProjectiles = asList(this.hostileProjectiles).filter((projectile) => centerDistance(projectile, anchor) >= ALIEN_SURVIVAL_INSERTION_SAFE_RADIUS_V70);
      const remainingUnsafe = contacts.filter((enemy) => centerDistance(enemy, anchor) < ALIEN_SURVIVAL_INSERTION_SAFE_RADIUS_V70).length;
      const report = Object.freeze({
        applied: true,
        reason,
        safeRadius: ALIEN_SURVIVAL_INSERTION_SAFE_RADIUS_V70,
        movedEnemies,
        movedAcidPools: unsafePools.length,
        clearedProjectiles: projectilesBefore - this.hostileProjectiles.length,
        remainingUnsafe
      });
      this.alienSurvivalInsertionSecurityV70 = report;
      this.onEvent?.({ type: 'alien-survival-insertion-secured', operationId: ALIEN_SURVIVAL_OPERATION_ID_V70, ...report });
      return report;
    }

    configureAlienSurvivalWorldV70() {
      if (!this.alienSurvivalV70) return false;
      this.alienSurvivalStationsV70 = ALIEN_SURVIVAL_STATION_LAYOUT_V70.map((definition) => ({
        ...definition,
        ...this.alienSurvivalPhysicalPointV70(definition.roomId, definition.fraction)
      }));
      this.alienSurvivalCameraFeedsV70 = ALIEN_SURVIVAL_ROOM_IDS_V70.map((roomId, index) => ({
        id: roomId,
        label: this.alienSurvivalZoneV70(roomId)?.label || roomId,
        ...this.alienSurvivalPhysicalPointV70(roomId, index % 2 ? 0.66 : 0.34, 48, 72)
      }));

      for (const stateDoor of this.alienSurvivalV70.doors) {
        const physical = asList(this.doors).find((door) => door.id === stateDoor.id);
        if (!physical) continue;
        physical.alienSurvivalDoorV70 = true;
        physical.lockedBy = null;
        physical.levelLocked = false;
        physical.open = stateDoor.welded ? false : Boolean(stateDoor.open);
        physical.progress = physical.open ? 1 : 0;
        physical.survivalWeldedV70 = stateDoor.welded;
        physical.survivalWeldIntegrityV70 = stateDoor.weldIntegrity;
      }

      const kitPoint = this.alienSurvivalPhysicalPointV70('ship-cargo', 0.32, 58, 48);
      const weldingVisual = resolveAlienSurvivalReusedAssetV70('welding-kit');
      this.toolPickup = {
        ...(isRecord(this.toolPickup) ? this.toolPickup : {}),
        id: 'welding-kit',
        visualSheetId: weldingVisual?.sheetId || 'equipment.welding-kit.use',
        imageKey: weldingVisual?.imageKey || null,
        ...kitPoint,
        taken: Boolean(this.inventory?.cutter || this.toolPickup?.taken),
        alienSurvivalWeldingKitV70: true
      };
      this.alienSurvivalWeldingKitV70 = this.toolPickup;

      for (const hazard of asList(this.hazards)) {
        if (hazard.kind === 'vacuum' && hazard.zoneId === 'ship-cargo') hazard.active = false;
      }
      if (!this.alienSurvivalV70.acidPools.length) this.createAlienSurvivalInitialAcidV70();
      this.alienSurvivalAcidAgeTicksV70 = new Map(this.alienSurvivalV70.acidPools.map((pool) => [pool.id, Math.round(pool.ageSeconds * 60)]));
      this.alienSurvivalCountdownTicksV70 = Math.round(this.alienSurvivalV70.selfDestruct.remainingSeconds * 60);
      this.alienSurvivalV70.cctv.active = false;
      this.alienSurvivalCctvActorV70 = null;
      this.alienSurvivalWorldActionV70 = null;
      this.alienSurvivalActionActorV70 = null;
      if (this.powerNode) this.powerNode.active = true;
      if (this.mission?.objectives) {
        Object.assign(this.mission.objectives, {
          power: true,
          route: true,
          boss: true,
          archive: true,
          alienSurvival: false
        });
      }
      this.syncAlienSurvivalDoorStateV70();
      this.alienSurvivalV70.phase = deriveAlienSurvivalPhaseV70(this.alienSurvivalV70);
      return true;
    }

    loadAlienSurvivalVisualsV70() {
      if (!this.images || typeof globalThis.Image !== 'function') return false;
      if (this.images.has(ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.imageKey)) return true;
      const image = new globalThis.Image();
      image.decoding = 'async';
      image.src = ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.path;
      this.images.set(ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.imageKey, image);
      return true;
    }

    alienSurvivalStationV70(idOrType) {
      return this.alienSurvivalStationsV70.find((station) => station.id === idOrType || station.type === idOrType) || null;
    }

    alienSurvivalNearestStationV70(actor, type = null) {
      return this.alienSurvivalStationsV70
        .filter((station) => !type || station.type === type)
        .map((station) => ({ station, distance: centerDistance(actor, station) }))
        .filter((entry) => entry.distance <= ALIEN_SURVIVAL_INTERACTION_RADIUS_V70)
        .sort((left, right) => left.distance - right.distance)[0]?.station || null;
    }

    alienSurvivalPhysicalDoorV70(doorId) {
      return asList(this.doors).find((door) => door.id === doorId) || null;
    }

    alienSurvivalStateDoorV70(doorId) {
      return this.alienSurvivalV70?.doors.find((door) => door.id === doorId) || null;
    }

    alienSurvivalAlternateRouteAvailableV70() {
      return asList(this.missionLevelRuntime?.graph?.routes).length >= 2
        || asList(this.routeRuntime?.routes).length >= 2
        || asList(this.vents).some((vent) => vent?.authoredNetworkV62 || vent?.id);
    }

    alienSurvivalRoomForActorV70(actor = this.player) {
      if (!actor || !this.alienSurvivalV70) return null;
      const taggedId = boundedText(actor.levelZoneId || actor.zoneId);
      let room = this.alienSurvivalV70.rooms.find((entry) => entry.id === taggedId);
      if (!room && actor === this.player) {
        room = this.alienSurvivalV70.rooms.find((entry) => entry.id === this.missionLevelVisualState?.activeZoneId);
      }
      if (!room) {
        const centerX = (Number(actor.x) || 0) + (Number(actor.w) || 0) / 2;
        const zones = asList(this.missionLevelRuntime?.biomeZones)
          .filter((zone) => centerX >= Number(zone.x) && centerX <= Number(zone.x) + Number(zone.w))
          .sort((left, right) => Number(left.w) - Number(right.w));
        room = this.alienSurvivalV70.rooms.find((entry) => entry.id === zones[0]?.id);
      }
      if (!room) {
        const nodes = asList(this.missionLevelRuntime?.graph?.nodes);
        const nearest = nodes.sort((left, right) => Math.abs(Number(left.x) - Number(actor.x)) - Math.abs(Number(right.x) - Number(actor.x)))[0];
        room = this.alienSurvivalV70.rooms.find((entry) => entry.id === nearest?.zoneId);
      }
      return room || this.alienSurvivalV70.rooms[0] || null;
    }

    syncAlienSurvivalDoorStateV70() {
      if (!this.alienSurvivalV70) return 0;
      let synced = 0;
      for (const stateDoor of this.alienSurvivalV70.doors) {
        const physical = this.alienSurvivalPhysicalDoorV70(stateDoor.id);
        if (!physical) continue;
        if (stateDoor.welded) {
          physical.open = false;
          physical.progress = 0;
          physical.levelLocked = true;
          physical.survivalWeldedV70 = true;
          physical.survivalWeldIntegrityV70 = stateDoor.weldIntegrity;
        } else {
          stateDoor.open = Boolean(physical.open);
          physical.survivalWeldedV70 = false;
          if (this.alienSurvivalV70.power.routes.security && physical.id === 'aft-bulkhead') physical.levelLocked = false;
        }
        synced += 1;
      }
      return synced;
    }

    collectAlienSurvivalWeldingKitV70(actor = this.player) {
      const kit = this.alienSurvivalWeldingKitV70;
      if (!actor?.alive || !kit || kit.taken || centerDistance(actor, kit) > 120) return actionResult(false, 'welding-kit-unavailable');
      kit.taken = true;
      if (this.inventory) this.inventory.cutter = true;
      this.setInteractionAnimation?.(actor, 'ground-interact', 0.65);
      this.onEvent?.({ type: 'alien-survival-welding-kit', operationId: ALIEN_SURVIVAL_OPERATION_ID_V70, actor: actor.coop ? 'coop' : 'primary' });
      return actionResult(true, null, { message: 'Kit de soudure récupéré.' });
    }

    setAlienSurvivalPowerRouteV70(circuitId, enabled, actor = this.player) {
      if (!this.isAlienSurvivalMissionV70() || !this.alienSurvivalV70) return actionResult(false, 'inactive');
      const id = boundedText(circuitId).toLowerCase();
      if (!ALIEN_SURVIVAL_POWER_CIRCUIT_IDS_V70.includes(id)) return actionResult(false, 'unknown-circuit');
      const station = this.alienSurvivalStationV70('power');
      if (!actor?.alive || centerDistance(actor, station) > ALIEN_SURVIVAL_INTERACTION_RADIUS_V70) return actionResult(false, 'physical-console-required');
      const nextEnabled = Boolean(enabled);
      if (this.alienSurvivalV70.power.routes[id] === nextEnabled) return actionResult(true, null, { applied: false, message: 'Circuit déjà configuré.' });
      const activeCount = ALIEN_SURVIVAL_POWER_CIRCUIT_IDS_V70.filter((candidate) => this.alienSurvivalV70.power.routes[candidate]).length;
      if (nextEnabled && activeCount >= this.alienSurvivalV70.power.capacity) return actionResult(false, 'power-capacity-exceeded');
      if (!nextEnabled && id === 'cctv' && this.alienSurvivalV70.cctv.active) this.closeAlienSurvivalCctvV70({ force: true });
      this.alienSurvivalV70.power.routes[id] = nextEnabled;
      this.alienSurvivalV70.power.rerouteCount += 1;
      if (!this.alienSurvivalV70.power.everRouted.includes(id)) this.alienSurvivalV70.power.everRouted.push(id);
      this.alienSurvivalV70.phase = deriveAlienSurvivalPhaseV70(this.alienSurvivalV70);
      this.setInteractionAnimation?.(actor, 'control-use', 0.55);
      this.onEvent?.({
        type: 'alien-survival-power-routed',
        operationId: ALIEN_SURVIVAL_OPERATION_ID_V70,
        circuitId: id,
        enabled: nextEnabled,
        routes: { ...this.alienSurvivalV70.power.routes },
        capacity: this.alienSurvivalV70.power.capacity
      });
      return actionResult(true, null, { message: `${id.toUpperCase()} ${nextEnabled ? 'alimenté' : 'coupé'}.` });
    }

    cycleAlienSurvivalPowerPresetV70(actor = this.player) {
      const station = this.alienSurvivalStationV70('power');
      if (!actor?.alive || centerDistance(actor, station) > ALIEN_SURVIVAL_INTERACTION_RADIUS_V70) return actionResult(false, 'physical-console-required');
      const current = ALIEN_SURVIVAL_POWER_CIRCUIT_IDS_V70.filter((id) => this.alienSurvivalV70.power.routes[id]).sort().join(':');
      const index = POWER_PRESETS.findIndex((preset) => [...preset].sort().join(':') === current);
      const preset = POWER_PRESETS[(index + 1) % POWER_PRESETS.length];
      for (const circuitId of ALIEN_SURVIVAL_POWER_CIRCUIT_IDS_V70) this.alienSurvivalV70.power.routes[circuitId] = preset.includes(circuitId);
      this.alienSurvivalV70.power.rerouteCount += 1;
      for (const circuitId of preset) if (!this.alienSurvivalV70.power.everRouted.includes(circuitId)) this.alienSurvivalV70.power.everRouted.push(circuitId);
      if (!preset.includes('cctv') && this.alienSurvivalV70.cctv.active) this.closeAlienSurvivalCctvV70({ force: true });
      this.setInteractionAnimation?.(actor, 'control-use', 0.65);
      this.onEvent?.({ type: 'alien-survival-power-routed', operationId: ALIEN_SURVIVAL_OPERATION_ID_V70, preset: [...preset], routes: { ...this.alienSurvivalV70.power.routes }, capacity: 2 });
      this.alienSurvivalV70.phase = deriveAlienSurvivalPhaseV70(this.alienSurvivalV70);
      return actionResult(true, null, { preset: [...preset], message: `Distribution : ${preset.join(' + ')}.` });
    }

    visitAlienSurvivalCctvFeedV70(feedId) {
      const id = boundedText(feedId);
      if (!this.alienSurvivalCameraFeedsV70.some((feed) => feed.id === id)) return false;
      this.alienSurvivalV70.cctv.selectedFeedId = id;
      if (!this.alienSurvivalV70.cctv.visitedFeedIds.includes(id)) {
        this.alienSurvivalV70.cctv.visitedFeedIds.push(id);
        this.onEvent?.({
          type: 'alien-survival-cctv-feed-visited',
          operationId: ALIEN_SURVIVAL_OPERATION_ID_V70,
          feedId: id,
          visited: this.alienSurvivalV70.cctv.visitedFeedIds.length,
          required: this.alienSurvivalV70.cctv.requiredFeedIds.length
        });
      }
      this.alienSurvivalV70.cctv.scanComplete = this.alienSurvivalV70.cctv.requiredFeedIds
        .every((requiredId) => this.alienSurvivalV70.cctv.visitedFeedIds.includes(requiredId));
      this.alienSurvivalV70.phase = deriveAlienSurvivalPhaseV70(this.alienSurvivalV70);
      return true;
    }

    openAlienSurvivalCctvV70(actor = this.player) {
      if (!this.isAlienSurvivalMissionV70() || !this.alienSurvivalV70) return actionResult(false, 'inactive');
      const station = this.alienSurvivalStationV70('cctv');
      if (!actor?.alive || centerDistance(actor, station) > ALIEN_SURVIVAL_INTERACTION_RADIUS_V70) return actionResult(false, 'physical-console-required');
      if (!this.alienSurvivalV70.power.routes.cctv) return actionResult(false, 'cctv-power-required');
      if (this.alienSurvivalV70.cctv.active) return actionResult(true, null, { applied: false, message: 'CCTV déjà ouverte.' });
      this.alienSurvivalV70.cctv.active = true;
      this.alienSurvivalCctvActorV70 = actor;
      this.alienSurvivalCameraBeforeCctvV70 = this.camera ? { x: this.camera.x, y: this.camera.y } : null;
      const feedId = this.alienSurvivalV70.cctv.selectedFeedId || this.alienSurvivalCameraFeedsV70[0]?.id;
      this.visitAlienSurvivalCctvFeedV70(feedId);
      this.setInteractionAnimation?.(actor, 'control-use', 0.7);
      this.onEvent?.({ type: 'alien-survival-cctv-opened', operationId: ALIEN_SURVIVAL_OPERATION_ID_V70, feedId });
      return actionResult(true, null, { feedId, message: 'CCTV ouverte. Le monde reste actif.' });
    }

    cycleAlienSurvivalCctvV70(direction = 1) {
      if (!this.alienSurvivalV70?.cctv.active) return actionResult(false, 'cctv-not-open');
      const feeds = this.alienSurvivalCameraFeedsV70;
      if (!feeds.length) return actionResult(false, 'no-cctv-feeds');
      const current = Math.max(0, feeds.findIndex((feed) => feed.id === this.alienSurvivalV70.cctv.selectedFeedId));
      const offset = Number(direction) < 0 ? -1 : 1;
      const next = feeds[(current + offset + feeds.length) % feeds.length];
      this.visitAlienSurvivalCctvFeedV70(next.id);
      return actionResult(true, null, { feedId: next.id, message: `Flux CCTV : ${next.label}.` });
    }

    closeAlienSurvivalCctvV70(options = {}) {
      if (!this.alienSurvivalV70?.cctv.active && !options.force) return actionResult(false, 'cctv-not-open');
      this.alienSurvivalV70.cctv.active = false;
      this.alienSurvivalCctvActorV70 = null;
      if (this.camera && this.alienSurvivalCameraBeforeCctvV70) Object.assign(this.camera, this.alienSurvivalCameraBeforeCctvV70);
      this.alienSurvivalCameraBeforeCctvV70 = null;
      this.onEvent?.({ type: 'alien-survival-cctv-closed', operationId: ALIEN_SURVIVAL_OPERATION_ID_V70 });
      return actionResult(true, null, { message: 'CCTV fermée.' });
    }

    applyAlienSurvivalCctvCameraV70() {
      if (!this.alienSurvivalV70?.cctv.active || !this.camera) return false;
      const feed = this.alienSurvivalCameraFeedsV70.find((entry) => entry.id === this.alienSurvivalV70.cctv.selectedFeedId);
      if (!feed) return false;
      const width = Number(this.canvas?.width) || 1280;
      const height = Number(this.canvas?.height) || 720;
      const worldWidth = Number(this.missionLevelBounds?.width) || 6200;
      const worldHeight = Number(this.missionLevelBounds?.height) || 1080;
      this.camera.x = clamp(feed.x + feed.w / 2 - width / 2, 0, Math.max(0, worldWidth - width));
      this.camera.y = clamp(feed.y + feed.h / 2 - height / 2, 0, Math.max(0, worldHeight - height));
      return true;
    }

    beginAlienSurvivalWeldV70(doorId = ALIEN_SURVIVAL_WELDABLE_DOOR_ID_V70, actor = this.player) {
      if (!this.isAlienSurvivalMissionV70() || !this.alienSurvivalV70 || this.mission?.state !== 'active') return actionResult(false, 'inactive');
      const id = boundedText(doorId, ALIEN_SURVIVAL_WELDABLE_DOOR_ID_V70);
      const stateDoor = this.alienSurvivalStateDoorV70(id);
      const physicalDoor = this.alienSurvivalPhysicalDoorV70(id);
      if (id !== ALIEN_SURVIVAL_WELDABLE_DOOR_ID_V70 || !stateDoor || !physicalDoor) return actionResult(false, 'door-not-weldable');
      if (!actor?.alive || centerDistance(actor, physicalDoor) > WELD_RANGE) return actionResult(false, 'physical-door-required');
      if (!this.inventory?.cutter && !this.alienSurvivalWeldingKitV70?.taken) return actionResult(false, 'welding-kit-required');
      if (!this.alienSurvivalV70.cctv.scanComplete) return actionResult(false, 'cctv-scan-required');
      if (!this.alienSurvivalAlternateRouteAvailableV70()) return actionResult(false, 'alternate-route-required');
      if (stateDoor.welded && stateDoor.weldIntegrity > 0) return actionResult(false, 'door-already-welded');
      if (this.alienSurvivalWorldActionV70) return actionResult(false, 'world-action-in-progress');
      const previousOpen = Boolean(physicalDoor.open);
      physicalDoor.open = false;
      physicalDoor.progress = 0;
      this.alienSurvivalActionActorV70 = actor;
      this.alienSurvivalWorldActionV70 = {
        id: `weld:${id}`, type: 'weld-door', targetId: id, label: 'SOUDURE DE LA CLOISON CARGO',
        progress: 0, durationSeconds: ALIEN_SURVIVAL_WELD_SECONDS_V70, canExecute: true, nearby: true,
        blockedReason: '', previousOpen, startedHealth: Number(actor.health) || 0,
        startedX: Number(actor.x) || 0, startedY: Number(actor.y) || 0
      };
      this.setToolAnimation?.(actor, 'welding-kit', ALIEN_SURVIVAL_WELD_SECONDS_V70);
      this.onEvent?.({ type: 'alien-survival-weld-started', operationId: ALIEN_SURVIVAL_OPERATION_ID_V70, doorId: id });
      return actionResult(true, null, { message: 'Soudure engagée. Restez immobile.' });
    }

    cancelAlienSurvivalActionV70(reason = 'user-cancelled') {
      const action = this.alienSurvivalWorldActionV70;
      if (!action) return actionResult(false, 'no-world-action');
      if (action.type === 'weld-door' && action.progress < 1) {
        const physicalDoor = this.alienSurvivalPhysicalDoorV70(action.targetId);
        if (physicalDoor) {
          physicalDoor.open = Boolean(action.previousOpen);
          physicalDoor.progress = physicalDoor.open ? 1 : 0;
        }
      }
      this.alienSurvivalWorldActionV70 = null;
      this.alienSurvivalActionActorV70 = null;
      this.onEvent?.({ type: 'alien-survival-weld-cancelled', operationId: ALIEN_SURVIVAL_OPERATION_ID_V70, doorId: action.targetId, reason });
      return actionResult(true, null, { message: `Soudure annulée · ${reason}.` });
    }

    completeAlienSurvivalWeldV70(action = this.alienSurvivalWorldActionV70) {
      if (!action || action.type !== 'weld-door' || !this.alienSurvivalV70) return false;
      const stateDoor = this.alienSurvivalStateDoorV70(action.targetId);
      const physicalDoor = this.alienSurvivalPhysicalDoorV70(action.targetId);
      if (!stateDoor || !physicalDoor) return false;
      stateDoor.open = false;
      stateDoor.welded = true;
      stateDoor.weldIntegrity = 100;
      stateDoor.weldCompletedAt = Number(this.mission?.elapsed) || this.alienSurvivalV70.elapsedSeconds;
      if (!this.alienSurvivalV70.welding.completedDoorIds.includes(stateDoor.id)) this.alienSurvivalV70.welding.completedDoorIds.push(stateDoor.id);
      Object.assign(physicalDoor, { open: false, progress: 0, levelLocked: true, survivalWeldedV70: true, survivalWeldIntegrityV70: 100 });
      const engineering = this.alienSurvivalV70.rooms.find((room) => room.id === 'ship-engineering');
      if (engineering) engineering.breachRate = 0;
      this.alienSurvivalWorldActionV70 = null;
      this.alienSurvivalActionActorV70 = null;
      this.alienSurvivalV70.phase = deriveAlienSurvivalPhaseV70(this.alienSurvivalV70);
      this.onEvent?.({ type: 'alien-survival-door-welded', operationId: ALIEN_SURVIVAL_OPERATION_ID_V70, doorId: stateDoor.id, integrity: 100 });
      return true;
    }

    updateAlienSurvivalWorldActionV70(seconds) {
      const action = this.alienSurvivalWorldActionV70;
      const actor = this.alienSurvivalActionActorV70;
      if (!action || action.type !== 'weld-door') return false;
      const door = this.alienSurvivalPhysicalDoorV70(action.targetId);
      if (!actor?.alive || !door) return this.cancelAlienSurvivalActionV70('actor-unavailable').ok;
      if (centerDistance(actor, door) > WELD_RANGE) return this.cancelAlienSurvivalActionV70('out-of-range').ok;
      if ((Number(actor.health) || 0) + 1e-6 < action.startedHealth) return this.cancelAlienSurvivalActionV70('damage-interrupted').ok;
      if (Math.hypot((Number(actor.x) || 0) - action.startedX, (Number(actor.y) || 0) - action.startedY) > 28) return this.cancelAlienSurvivalActionV70('movement-interrupted').ok;
      const duration = Math.max(0.1, Number(action.durationSeconds) || ALIEN_SURVIVAL_WELD_SECONDS_V70);
      action.progress = clamp(action.progress + Math.max(0, Number(seconds) || 0) / duration, 0, 1);
      action.nearby = true;
      actor.vx = 0;
      this.setToolAnimation?.(actor, 'welding-kit', Math.max(0.12, duration * (1 - action.progress)));
      return action.progress >= 1 ? this.completeAlienSurvivalWeldV70(action) : true;
    }

    cycleAlienSurvivalAirlockV70(actor = this.player) {
      if (!this.isAlienSurvivalMissionV70() || !this.alienSurvivalV70) return actionResult(false, 'inactive');
      const station = this.alienSurvivalStationV70('pressure');
      if (!actor?.alive || centerDistance(actor, station) > ALIEN_SURVIVAL_INTERACTION_RADIUS_V70) return actionResult(false, 'physical-valve-required');
      if (!this.alienSurvivalV70.power.routes.security) return actionResult(false, 'security-power-required');
      const stateDoor = this.alienSurvivalStateDoorV70('outer-airlock');
      const physicalDoor = this.alienSurvivalPhysicalDoorV70('outer-airlock');
      if (!stateDoor || !physicalDoor) return actionResult(false, 'airlock-unavailable');
      const roomById = new Map(this.alienSurvivalV70.rooms.map((room) => [room.id, room]));
      const chamber = roomById.get(stateDoor.fromRoomId) || roomById.get(stateDoor.toRoomId);
      const innerDoor = this.alienSurvivalStateDoorV70('aft-bulkhead');
      const interiorRoomId = innerDoor
        ? [innerDoor.fromRoomId, innerDoor.toRoomId].find((roomId) => roomId !== chamber?.id && roomById.has(roomId))
        : null;
      const interior = roomById.get(interiorRoomId);
      if (!chamber || !interior) return actionResult(false, 'pressure-state-unavailable');
      const difference = Math.abs(interior.pressure - chamber.pressure);
      const alreadyEqualized = this.alienSurvivalV70.pressure.equalizedDoorIds.includes(stateDoor.id);
      const chamberSafe = difference <= AIRLOCK_SAFE_DIFFERENCE
        && chamber.pressure >= ALIEN_SURVIVAL_SAFE_PRESSURE_V70
        && chamber.oxygen >= ALIEN_SURVIVAL_SAFE_OXYGEN_V70
        && chamber.breachRate <= 0;
      let equalized = false;
      if (!stateDoor.open && (!alreadyEqualized || !chamberSafe)) {
        const pressure = rounded(interior.pressure);
        const oxygen = rounded(interior.oxygen);
        Object.assign(chamber, { pressure, oxygen, breachRate: 0 });
        equalized = true;
        if (!this.alienSurvivalV70.pressure.equalizedDoorIds.includes(stateDoor.id)) this.alienSurvivalV70.pressure.equalizedDoorIds.push(stateDoor.id);
        this.alienSurvivalV70.pressure.stabilizedRoomIds = this.alienSurvivalV70.rooms
          .filter((room) => room.pressure >= ALIEN_SURVIVAL_SAFE_PRESSURE_V70 && room.oxygen >= ALIEN_SURVIVAL_SAFE_OXYGEN_V70 && room.breachRate <= 0)
          .map((room) => room.id);
        this.alienSurvivalPressureEventsV70.add(stateDoor.id);
        this.onEvent?.({ type: 'alien-survival-pressure-equalized', operationId: ALIEN_SURVIVAL_OPERATION_ID_V70, doorId: stateDoor.id, pressure, controlled: true });
      } else {
        stateDoor.open = !stateDoor.open;
        physicalDoor.open = stateDoor.open;
        physicalDoor.progress = stateDoor.open ? 1 : 0;
        if (!stateDoor.open) {
          this.alienSurvivalV70.pressure.equalizedDoorIds = this.alienSurvivalV70.pressure.equalizedDoorIds.filter((doorId) => doorId !== stateDoor.id);
          this.alienSurvivalPressureEventsV70.delete(stateDoor.id);
        }
      }
      this.setInteractionAnimation?.(actor, 'force-interact', 0.72);
      this.alienSurvivalV70.phase = deriveAlienSurvivalPhaseV70(this.alienSurvivalV70);
      this.onEvent?.({ type: 'alien-survival-airlock-cycled', operationId: ALIEN_SURVIVAL_OPERATION_ID_V70, doorId: stateDoor.id, open: Boolean(stateDoor.open), equalized, pressureDifference: equalized ? 0 : rounded(difference) });
      return actionResult(true, null, { open: Boolean(stateDoor.open), equalized, message: equalized ? 'Pressions égalisées. Actionnez de nouveau la vanne pour ouvrir.' : `Sas ${stateDoor.open ? 'ouvert' : 'fermé'}.` });
    }

    alienSurvivalActorIdV70(actor, index = 0) {
      if (actor === this.player) return 'primary';
      if (actor === this.coop) return 'coop';
      return boundedIdentifier(actor?.crewId || actor?.id, `squad-${index + 1}`);
    }

    alienSurvivalActorsV70() {
      return [...new Set([this.player, this.coopEnabled ? this.coop : null, ...asList(this.squadActors)].filter((actor) => actor?.alive))];
    }

    alienSurvivalActorPressureProtectedV70(actor) {
      const profile = `${actor?.equipment?.suit || ''} ${actor?.suit || ''} ${actor?.armorType || ''} ${actor?.toolId || ''}`;
      return Boolean(actor?.pressureSuit || actor?.vacuumProtected || /pressure|vacuum|eva/i.test(profile));
    }

    updateAlienSurvivalDecompressionV70(seconds) {
      if (!(seconds > 0)) return;
      if (!(this.alienSurvivalDecompressionClocksV70 instanceof Map)) this.alienSurvivalDecompressionClocksV70 = new Map();
      for (const [index, actor] of this.alienSurvivalActorsV70().entries()) {
        const id = this.alienSurvivalActorIdV70(actor, index);
        const room = this.alienSurvivalRoomForActorV70(actor);
        if (!room || room.pressure >= PRESSURE_DAMAGE_THRESHOLD || this.alienSurvivalActorPressureProtectedV70(actor)) {
          this.alienSurvivalDecompressionClocksV70.set(id, 0);
          continue;
        }
        const clock = (this.alienSurvivalDecompressionClocksV70.get(id) || 0) + seconds;
        if (clock >= 1) this.damagePlayer?.(actor, Math.max(2, (PRESSURE_DAMAGE_THRESHOLD - room.pressure) * 0.12), { bypassCover: true, source: 'decompression' });
        this.alienSurvivalDecompressionClocksV70.set(id, clock % 1);
      }
    }

    updateAlienSurvivalPressureV70(delta) {
      if (!this.alienSurvivalV70) return 0;
      this.syncAlienSurvivalDoorStateV70();
      const previousTicks = Number(this.alienSurvivalV70.pressure.simulatedTicks) || 0;
      this.alienSurvivalV70 = simulateRoomPressureV70(this.alienSurvivalV70, this.alienSurvivalPhysicalDoorsV70(), finiteDelta(delta));
      const processedTicks = Math.max(0, (Number(this.alienSurvivalV70.pressure.simulatedTicks) || 0) - previousTicks);
      const seconds = processedTicks / 60;
      this.alienSurvivalV70.elapsedSeconds = rounded((Number(this.alienSurvivalV70.pressure.simulatedTicks) || 0) / 60);
      const activeRoom = this.alienSurvivalRoomForActorV70(this.player);
      if (activeRoom) activeRoom.visited = true;
      for (const doorId of this.alienSurvivalV70.pressure.equalizedDoorIds) {
        if (this.alienSurvivalPressureEventsV70.has(doorId)) continue;
        this.alienSurvivalPressureEventsV70.add(doorId);
        this.onEvent?.({ type: 'alien-survival-pressure-equalized', operationId: ALIEN_SURVIVAL_OPERATION_ID_V70, doorId, controlled: false });
      }
      this.updateAlienSurvivalDecompressionV70(seconds);
      return seconds;
    }

    createAlienSurvivalAcidPoolV70({ id, roomId, sourceEnemyId = null, x, y, w = 96, h = 22, intensity = 1, corrosion = 4.8 } = {}) {
      if (!this.alienSurvivalV70 || this.alienSurvivalV70.acidPools.length >= MAX_ACID_POOLS) return null;
      const poolId = boundedIdentifier(id, '');
      const canonicalRoom = this.alienSurvivalV70.rooms.find((room) => room.id === roomId);
      if (!poolId || !canonicalRoom || this.alienSurvivalV70.acidPools.some((pool) => pool.id === poolId)) return null;
      const pool = {
        id: poolId,
        roomId: canonicalRoom.id,
        sourceEnemyId: sourceEnemyId ? boundedIdentifier(sourceEnemyId, null) : null,
        x: rounded(Number(x) || 0), y: rounded(Number(y) || 0),
        w: clamp(w, 4, 1024), h: clamp(h, 4, 1024),
        intensity: clamp(intensity, 0.1, 1), corrosion: clamp(corrosion, 0, 100),
        ageSeconds: 0,
        createdAt: Number(this.mission?.elapsed) || this.alienSurvivalV70.elapsedSeconds,
        active: true,
        persistent: true
      };
      this.alienSurvivalV70.acidPools.push(pool);
      this.onEvent?.({ type: 'alien-survival-acid-created', operationId: ALIEN_SURVIVAL_OPERATION_ID_V70, poolId, roomId: pool.roomId, sourceEnemyId: pool.sourceEnemyId });
      return pool;
    }

    createAlienSurvivalInitialAcidV70() {
      if (!this.alienSurvivalV70 || this.alienSurvivalV70.acidPools.some((pool) => pool.id === 'acid-pool:initial-cargo')) return null;
      const point = this.alienSurvivalPhysicalPointV70('ship-cargo', 0.62, 112, 20);
      return this.createAlienSurvivalAcidPoolV70({
        id: 'acid-pool:initial-cargo', roomId: 'ship-cargo', x: point.x, y: point.groundY - 20,
        w: 112, h: 20, intensity: 0.72, corrosion: 3.2
      });
    }

    createAlienSurvivalAcidFromEnemyV70(enemy) {
      if (!enemy || !xenomorphEnemy(enemy)) return null;
      const sourceId = boundedIdentifier(enemy.id, `enemy-${this.alienSurvivalV70?.acidPools?.length || 0}`);
      const room = this.alienSurvivalRoomForActorV70(enemy);
      if (!room) return null;
      return this.createAlienSurvivalAcidPoolV70({
        id: `acid-pool:${sourceId}`,
        sourceEnemyId: sourceId,
        roomId: room.id,
        x: (Number(enemy.x) || 0) + (Number(enemy.w) || 72) * 0.12,
        y: (Number(enemy.y) || 0) + (Number(enemy.h) || 90) - 20,
        w: Math.max(64, (Number(enemy.w) || 72) * 0.92), h: 22,
        intensity: enemy.isBoss ? 1 : 0.82,
        corrosion: enemy.isBoss ? 8 : 5.4
      });
    }

    defeatEnemy(enemy, owner = this.player) {
      const wasAlive = Boolean(enemy?.alive);
      const biological = wasAlive && xenomorphEnemy(enemy);
      const result = super.defeatEnemy(enemy, owner);
      if (biological && !enemy?.alive) this.createAlienSurvivalAcidFromEnemyV70(enemy);
      return result;
    }

    updateAlienSurvivalAcidV70(seconds) {
      if (!this.alienSurvivalV70 || !(seconds > 0)) return;
      if (!(this.alienSurvivalAcidDamageClocksV70 instanceof Map)) this.alienSurvivalAcidDamageClocksV70 = new Map();
      for (const pool of this.alienSurvivalV70.acidPools) {
        if (!pool.active) continue;
        const previousAge = pool.ageSeconds;
        const processedTicks = Math.max(0, Math.round(seconds * 60));
        if (!(this.alienSurvivalAcidAgeTicksV70 instanceof Map)) this.alienSurvivalAcidAgeTicksV70 = new Map();
        const ageTicks = Math.max(0, this.alienSurvivalAcidAgeTicksV70.get(pool.id) ?? Math.round(pool.ageSeconds * 60)) + processedTicks;
        this.alienSurvivalAcidAgeTicksV70.set(pool.id, ageTicks);
        pool.ageSeconds = rounded(ageTicks / 60);
        this.alienSurvivalV70.acid.maxPersistenceSeconds = Math.max(this.alienSurvivalV70.acid.maxPersistenceSeconds, pool.ageSeconds);
        if (previousAge < 1 && pool.ageSeconds >= 1 && !this.alienSurvivalAcidPersistenceEventsV70.has(pool.id)) {
          this.alienSurvivalAcidPersistenceEventsV70.add(pool.id);
          this.onEvent?.({ type: 'alien-survival-acid-persisted', operationId: ALIEN_SURVIVAL_OPERATION_ID_V70, poolId: pool.id, ageSeconds: pool.ageSeconds });
        }
        for (const [index, actor] of this.alienSurvivalActorsV70().entries()) {
          const feet = { x: actor.x + actor.w * 0.12, y: actor.y + actor.h - 18, w: actor.w * 0.76, h: 18 };
          const key = `${pool.id}:${this.alienSurvivalActorIdV70(actor, index)}`;
          if (!overlaps(pool, feet)) {
            this.alienSurvivalAcidDamageClocksV70.set(key, 0);
            continue;
          }
          this.alienSurvivalV70.acid.encountered = true;
          const clock = (this.alienSurvivalAcidDamageClocksV70.get(key) || 0) + seconds;
          if (clock >= ALIEN_SURVIVAL_ACID_DAMAGE_INTERVAL_V70) {
            const hits = Math.floor(clock / ALIEN_SURVIVAL_ACID_DAMAGE_INTERVAL_V70);
            this.damagePlayer?.(actor, hits * 4.5 * pool.intensity, { bypassCover: true, source: 'persistent-acid' });
          }
          this.alienSurvivalAcidDamageClocksV70.set(key, clock % ALIEN_SURVIVAL_ACID_DAMAGE_INTERVAL_V70);
        }
        for (const stateDoor of this.alienSurvivalV70.doors.filter((door) => door.welded)) {
          const physicalDoor = this.alienSurvivalPhysicalDoorV70(stateDoor.id);
          if (!physicalDoor || !overlaps(pool, physicalDoor)) continue;
          const previousIntegrity = stateDoor.weldIntegrity;
          stateDoor.weldIntegrity = rounded(Math.max(0, stateDoor.weldIntegrity - pool.corrosion * seconds));
          physicalDoor.survivalWeldIntegrityV70 = stateDoor.weldIntegrity;
          if (Math.floor(previousIntegrity / 10) !== Math.floor(stateDoor.weldIntegrity / 10) || stateDoor.weldIntegrity <= 0) {
            this.onEvent?.({ type: 'alien-survival-weld-corroded', operationId: ALIEN_SURVIVAL_OPERATION_ID_V70, doorId: stateDoor.id, poolId: pool.id, integrity: stateDoor.weldIntegrity });
          }
          if (stateDoor.weldIntegrity <= 0) {
            stateDoor.welded = false;
            stateDoor.open = true;
            Object.assign(physicalDoor, { survivalWeldedV70: false, levelLocked: false, open: true, progress: 1 });
            const engineering = this.alienSurvivalV70.rooms.find((room) => room.id === 'ship-engineering');
            if (engineering) engineering.breachRate = Math.max(engineering.breachRate, 7.5);
          }
        }
      }
    }

    missingAlienSurvivalPreDestructRequirementV70() {
      if (!this.alienSurvivalV70) return 'SYSTÈMES DE SURVIE NON INITIALISÉS';
      const mechanics = getAlienSurvivalMechanicsV70(this.alienSurvivalV70);
      if (!mechanics['power-routing']) return 'RÉPARTITION DE PUISSANCE NON VALIDÉE';
      if (!mechanics['security-cameras']) return 'SCAN CCTV INCOMPLET';
      if (!mechanics['weldable-doors']) return 'CLOISON CARGO NON SOUDÉE';
      const welded = this.alienSurvivalStateDoorV70(ALIEN_SURVIVAL_WELDABLE_DOOR_ID_V70);
      if (!welded?.welded || welded.weldIntegrity <= 0) return 'SOUDURE CARGO COMPROMISE';
      if (!mechanics['room-pressure']) return 'SAS D’EXTRACTION NON ÉGALISÉ';
      if (!mechanics['persistent-acid']) return 'RISQUE ACIDE NON OBSERVÉ';
      return null;
    }

    authorizeAlienSurvivalSelfDestructV70(stationId, actor = this.player) {
      if (!this.isAlienSurvivalMissionV70() || !this.alienSurvivalV70) return actionResult(false, 'inactive');
      const station = this.alienSurvivalStationV70(stationId) || this.alienSurvivalNearestStationV70(actor, 'self-destruct');
      if (!station || station.type !== 'self-destruct') return actionResult(false, 'authorization-station-required');
      if (!actor?.alive || centerDistance(actor, station) > ALIEN_SURVIVAL_INTERACTION_RADIUS_V70) return actionResult(false, 'physical-authorization-required');
      if (!this.alienSurvivalV70.power.routes.security) return actionResult(false, 'security-power-required');
      const missing = this.missingAlienSurvivalPreDestructRequirementV70();
      if (missing) return actionResult(false, 'survival-prerequisites-required', { message: missing });
      const authorizationId = station.authorizationId;
      if (!['engineering', 'command'].includes(authorizationId)) return actionResult(false, 'unknown-authorization');
      if (this.alienSurvivalV70.selfDestruct.authorizations[authorizationId]) return actionResult(true, null, { applied: false, message: `${station.label} déjà autorisée.` });
      this.alienSurvivalV70.selfDestruct.authorizations[authorizationId] = true;
      this.alienSurvivalV70.selfDestruct.authorizedAt[authorizationId] = Number(this.mission?.elapsed) || this.alienSurvivalV70.elapsedSeconds;
      this.setInteractionAnimation?.(actor, 'control-use', 0.82);
      this.onEvent?.({ type: 'alien-survival-self-destruct-authorized', operationId: ALIEN_SURVIVAL_OPERATION_ID_V70, stationId: station.id, authorizationId });
      return actionResult(true, null, { stationId: station.id, authorizationId, message: `${station.label} autorisée.` });
    }

    armAlienSurvivalSelfDestructV70(actor = this.player) {
      if (!this.isAlienSurvivalMissionV70() || !this.alienSurvivalV70) return actionResult(false, 'inactive');
      const station = this.alienSurvivalStationV70('survival-command-auth');
      if (!actor?.alive || centerDistance(actor, station) > ALIEN_SURVIVAL_INTERACTION_RADIUS_V70) return actionResult(false, 'command-key-required');
      if (!this.alienSurvivalV70.power.routes.security) return actionResult(false, 'security-power-required');
      const missing = this.missingAlienSurvivalPreDestructRequirementV70();
      if (missing) return actionResult(false, 'survival-prerequisites-required', { message: missing });
      const authorizations = this.alienSurvivalV70.selfDestruct.authorizations;
      if (!authorizations.engineering || !authorizations.command) return actionResult(false, 'double-authorization-required');
      if (this.alienSurvivalV70.selfDestruct.armed) return actionResult(true, null, { applied: false, message: 'Auto-destruction déjà armée.' });
      const system = this.alienSurvivalV70.selfDestruct;
      system.armed = true;
      system.armedAt = Number(this.mission?.elapsed) || this.alienSurvivalV70.elapsedSeconds;
      system.remainingSeconds = system.durationSeconds;
      this.alienSurvivalCountdownTicksV70 = Math.round(system.durationSeconds * 60);
      system.expired = false;
      this.alienSurvivalCountdownBucketV70 = Math.ceil(system.remainingSeconds);
      if (this.missionLevelVisualState) this.missionLevelVisualState.emergency = true;
      this.setInteractionAnimation?.(actor, 'control-use', 1);
      this.alienSurvivalV70.phase = deriveAlienSurvivalPhaseV70(this.alienSurvivalV70);
      this.onEvent?.({ type: 'alien-survival-self-destruct-armed', operationId: ALIEN_SURVIVAL_OPERATION_ID_V70, durationSeconds: system.durationSeconds });
      return actionResult(true, null, { remainingSeconds: system.remainingSeconds, message: `Auto-destruction armée · ${system.durationSeconds} secondes.` });
    }

    updateAlienSurvivalSelfDestructV70(seconds) {
      const system = this.alienSurvivalV70?.selfDestruct;
      if (!system?.armed || system.expired || !(seconds > 0)) return false;
      const processedTicks = Math.max(0, Math.round(seconds * 60));
      const stateTicks = Math.max(0, Math.round(system.remainingSeconds * 60));
      if (!Number.isInteger(this.alienSurvivalCountdownTicksV70) || Math.abs(this.alienSurvivalCountdownTicksV70 - stateTicks) > 1) this.alienSurvivalCountdownTicksV70 = stateTicks;
      this.alienSurvivalCountdownTicksV70 = Math.max(0, this.alienSurvivalCountdownTicksV70 - processedTicks);
      system.remainingSeconds = rounded(this.alienSurvivalCountdownTicksV70 / 60);
      const bucket = Math.ceil(system.remainingSeconds);
      if (bucket !== this.alienSurvivalCountdownBucketV70) {
        this.alienSurvivalCountdownBucketV70 = bucket;
        this.onEvent?.({ type: 'alien-survival-self-destruct-tick', operationId: ALIEN_SURVIVAL_OPERATION_ID_V70, remainingSeconds: system.remainingSeconds, seconds: bucket });
      }
      if (system.remainingSeconds > 0) return true;
      system.expired = true;
      this.alienSurvivalV70.phase = 'failed';
      this.closeAlienSurvivalCctvV70({ force: true });
      if (this.alienSurvivalWorldActionV70) this.cancelAlienSurvivalActionV70('self-destruct-expired');
      this.onEvent?.({ type: 'alien-survival-self-destruct-expired', operationId: ALIEN_SURVIVAL_OPERATION_ID_V70 });
      this.failMission?.('self-destruct-expired');
      return true;
    }

    updatePlayer(actor, delta, controls) {
      if (!this.isAlienSurvivalMissionV70() || !this.alienSurvivalV70) return super.updatePlayer(actor, delta, controls);
      if (actor === this.alienSurvivalActionActorV70 && this.alienSurvivalWorldActionV70) {
        if (actorMovementRequested(this, controls)) {
          this.cancelAlienSurvivalActionV70('movement-interrupted');
          return super.updatePlayer(actor, delta, controls);
        }
        actor.vx = 0;
        return super.updatePlayer(actor, delta, {});
      }
      if (actor === this.alienSurvivalCctvActorV70 && this.alienSurvivalV70.cctv.active) {
        actor.vx = 0;
        return super.updatePlayer(actor, delta, {});
      }
      return super.updatePlayer(actor, delta, controls);
    }

    updateObjectiveRuntime(delta) {
      if (!this.isAlienSurvivalMissionV70()) return super.updateObjectiveRuntime(delta);
      // This operation owns its deadline: the countdown starts only after both
      // physical authorization keys arm the self-destruct. The generic
      // "escape the quarantine" timer must never fail the mission beforehand.
      const runtime = this.objectiveRuntime;
      if (runtime?.requirements?.includes('route')
        && (Number(this.inventory?.securityKeys) > 0 || asList(this.vents).some((vent) => vent?.open))
        && this.mission?.objectives) {
        this.mission.objectives.route = true;
      }
      return this.objectiveState;
    }

    update(delta) {
      const result = super.update(delta);
      if (!this.isAlienSurvivalMissionV70() || !this.alienSurvivalV70 || this.mission?.state !== 'active') return result;
      const seconds = this.updateAlienSurvivalPressureV70(delta);
      this.updateAlienSurvivalWorldActionV70(seconds);
      this.updateAlienSurvivalAcidV70(seconds);
      this.updateAlienSurvivalSelfDestructV70(seconds);
      this.alienSurvivalV70.phase = deriveAlienSurvivalPhaseV70(this.alienSurvivalV70);
      this.applyAlienSurvivalCctvCameraV70();
      return result;
    }

    interact(actor = this.player) {
      if (!this.isAlienSurvivalMissionV70() || !this.alienSurvivalV70) return super.interact(actor);
      if (this.alienSurvivalV70.cctv.active && actor === this.alienSurvivalCctvActorV70) return this.cycleAlienSurvivalCctvV70(1).ok;
      if (this.collectAlienSurvivalWeldingKitV70(actor).ok) return true;
      const station = this.alienSurvivalNearestStationV70(actor);
      if (station?.type === 'power') return this.cycleAlienSurvivalPowerPresetV70(actor).ok;
      if (station?.type === 'cctv') return this.openAlienSurvivalCctvV70(actor).ok;
      if (station?.type === 'pressure') return this.cycleAlienSurvivalAirlockV70(actor).ok;
      if (station?.type === 'self-destruct') {
        const authorizationId = station.authorizationId;
        const authorized = this.alienSurvivalV70.selfDestruct.authorizations[authorizationId];
        if (station.id === 'survival-command-auth' && authorized
          && this.alienSurvivalV70.selfDestruct.authorizations.engineering
          && this.alienSurvivalV70.selfDestruct.authorizations.command
          && !this.alienSurvivalV70.selfDestruct.armed) return this.armAlienSurvivalSelfDestructV70(actor).ok;
        return this.authorizeAlienSurvivalSelfDestructV70(station.id, actor).ok;
      }
      const nearbyDoor = asList(this.doors)
        .map((door) => ({ door, distance: centerDistance(actor, door) }))
        .filter((entry) => entry.distance <= WELD_RANGE)
        .sort((left, right) => left.distance - right.distance)[0]?.door;
      if (nearbyDoor?.id === ALIEN_SURVIVAL_WELDABLE_DOOR_ID_V70 && this.alienSurvivalV70.cctv.scanComplete) return this.beginAlienSurvivalWeldV70(nearbyDoor.id, actor).ok;
      if (nearbyDoor?.id === 'outer-airlock') return false;
      return super.interact(actor);
    }

    getInteractionPrompt(actor = this.player) {
      if (!this.isAlienSurvivalMissionV70() || !this.alienSurvivalV70) return super.getInteractionPrompt(actor);
      if (this.alienSurvivalWorldActionV70) return `SOUDURE ${Math.round(this.alienSurvivalWorldActionV70.progress * 100)}% · DÉPLACEZ-VOUS POUR ANNULER`;
      if (this.alienSurvivalV70.cctv.active && actor === this.alienSurvivalCctvActorV70) return 'E  FLUX CCTV SUIVANT · COMMANDES DU PANNEAU POUR FERMER';
      const kit = this.alienSurvivalWeldingKitV70;
      if (kit && !kit.taken && centerDistance(actor, kit) <= 120) return 'E  RÉCUPÉRER LE KIT DE SOUDURE';
      const station = this.alienSurvivalNearestStationV70(actor);
      if (station?.type === 'power') return `E  REROUTER LA PUISSANCE · ${ALIEN_SURVIVAL_POWER_CIRCUIT_IDS_V70.filter((id) => this.alienSurvivalV70.power.routes[id]).join(' + ') || 'AUCUN'}`;
      if (station?.type === 'cctv') return this.alienSurvivalV70.power.routes.cctv ? 'E  OUVRIR LA CCTV · LE MONDE RESTE ACTIF' : 'ALIMENTATION CCTV REQUISE';
      if (station?.type === 'pressure') return this.alienSurvivalV70.power.routes.security ? 'E  ACTIONNER LA VANNE D’ÉGALISATION' : 'ALIMENTATION SÉCURITÉ REQUISE';
      if (station?.type === 'self-destruct') {
        const authorizationId = station.authorizationId;
        if (station.id === 'survival-command-auth'
          && this.alienSurvivalV70.selfDestruct.authorizations.engineering
          && this.alienSurvivalV70.selfDestruct.authorizations.command
          && !this.alienSurvivalV70.selfDestruct.armed) return 'E  ARMER L’AUTO-DESTRUCTION';
        return this.alienSurvivalV70.selfDestruct.authorizations[authorizationId] ? `${station.label} · AUTORISÉE` : `E  AUTORISER · ${station.label}`;
      }
      const door = asList(this.doors).find((candidate) => centerDistance(actor, candidate) <= WELD_RANGE);
      if (door?.id === ALIEN_SURVIVAL_WELDABLE_DOOR_ID_V70) {
        const stateDoor = this.alienSurvivalStateDoorV70(door.id);
        if (stateDoor?.welded) return `CLOISON SOUDÉE · INTÉGRITÉ ${Math.ceil(stateDoor.weldIntegrity)}%`;
        if (!this.inventory?.cutter) return 'KIT DE SOUDURE REQUIS';
        if (!this.alienSurvivalV70.cctv.scanComplete) return 'SCAN CCTV REQUIS AVANT SOUDURE';
        return 'E  SOUDER LA CLOISON CARGO';
      }
      if (door?.id === 'outer-airlock') return 'UTILISER LA VANNE D’ÉGALISATION';
      return super.getInteractionPrompt(actor);
    }

    doorRequirement(door) {
      if (this.isAlienSurvivalMissionV70() && door?.id === ALIEN_SURVIVAL_WELDABLE_DOOR_ID_V70 && this.alienSurvivalStateDoorV70(door.id)?.welded) return 'CLOISON SOUDÉE · ROUTE DE SERVICE DISPONIBLE';
      if (this.isAlienSurvivalMissionV70() && door?.id === 'outer-airlock') return 'UTILISER LA VANNE D’ÉGALISATION';
      return super.doorRequirement(door);
    }

    missingAlienSurvivalRequirementV70() {
      if (!this.alienSurvivalV70) return 'SYSTÈMES DE SURVIE NON INITIALISÉS';
      if (this.alienSurvivalV70.selfDestruct.expired) return 'AUTO-DESTRUCTION ARRIVÉE À TERME';
      const preDestruct = this.missingAlienSurvivalPreDestructRequirementV70();
      if (preDestruct) return preDestruct;
      const system = this.alienSurvivalV70.selfDestruct;
      if (!system.authorizations.engineering) return 'AUTORISATION RÉACTEUR MANQUANTE';
      if (!system.authorizations.command) return 'AUTORISATION PASSERELLE MANQUANTE';
      if (!system.armed) return 'AUTO-DESTRUCTION NON ARMÉE';
      const airlock = this.alienSurvivalStateDoorV70('outer-airlock');
      if (!this.alienSurvivalV70.pressure.equalizedDoorIds.includes('outer-airlock')) return 'SAS D’EXTRACTION NON ÉGALISÉ';
      if (!airlock?.open) return 'SAS EXTÉRIEUR FERMÉ';
      return null;
    }

    missingExtractionRequirement() {
      if (!this.isAlienSurvivalMissionV70()) return super.missingExtractionRequirement();
      return this.missingAlienSurvivalRequirementV70() || super.missingExtractionRequirement();
    }

    phaseLabel() {
      if (!this.isAlienSurvivalMissionV70() || !this.alienSurvivalV70) return super.phaseLabel();
      return {
        'restore-power': 'REROUTER LA PUISSANCE', 'security-scan': 'INSPECTER LES SIX FLUX CCTV',
        'contain-breach': 'SOUDER ET ÉGALISER LES SAS', 'authorize-destruct': 'VALIDER LES DEUX CLÉS PHYSIQUES',
        escape: 'REJOINDRE L’EXTRACTION', extracted: 'EXTRACTION CONFIRMÉE', failed: 'AUTO-DESTRUCTION'
      }[this.alienSurvivalV70.phase] || 'SYSTÈMES DE SURVIE';
    }

    objectiveProgressText() {
      if (!this.isAlienSurvivalMissionV70() || !this.alienSurvivalV70) return super.objectiveProgressText();
      const mechanics = getAlienSurvivalMechanicsV70(this.alienSurvivalV70);
      const done = ALIEN_SURVIVAL_REQUIRED_MECHANICS_V70.filter((id) => mechanics[id]).length;
      const suffix = this.alienSurvivalV70.selfDestruct.armed ? ` · T-${Math.ceil(this.alienSurvivalV70.selfDestruct.remainingSeconds)} S` : '';
      return `SYSTÈMES ${done}/${ALIEN_SURVIVAL_REQUIRED_MECHANICS_V70.length}${suffix}`;
    }

    buildAlienSurvivalResolutionPayloadV70() {
      return buildAlienSurvivalResolutionPayloadV70(this.alienSurvivalV70, { deploymentOperationId: this.alienSurvivalDeploymentOperationIdV70 });
    }

    completeMission(actor = this.player) {
      if (!this.isAlienSurvivalMissionV70()) return super.completeMission(actor);
      if (this.missingAlienSurvivalRequirementV70()) return false;
      const emit = this.onEvent;
      let completionEvent = null;
      this.onEvent = (event) => {
        if (event?.type === 'mission-complete') {
          completionEvent = event;
          return;
        }
        emit?.(event);
      };
      let completed = false;
      try {
        completed = super.completeMission(actor);
      } finally {
        this.onEvent = emit;
      }
      if (!completed) return false;
      this.alienSurvivalV70.extracted = true;
      this.alienSurvivalV70.completedAt = Number(this.mission?.elapsed) || this.alienSurvivalV70.elapsedSeconds;
      this.alienSurvivalV70.phase = 'extracted';
      if (this.mission?.objectives) this.mission.objectives.alienSurvival = true;
      const payload = this.buildAlienSurvivalResolutionPayloadV70();
      if (this.mission) this.mission.rewards = { ...(isRecord(this.mission.rewards) ? this.mission.rewards : {}), alienSurvivalSystems: payload };
      emit?.(completionEvent
        ? { ...completionEvent, rewards: this.mission?.rewards }
        : { type: 'mission-complete', rewards: this.mission?.rewards, objectiveId: this.objectiveRuntime?.id || ALIEN_SURVIVAL_OPERATION_ID_V70, extractedBy: actor?.coop ? 'coop' : 'primary' });
      return true;
    }

    restartFromCheckpoint() {
      if (this.alienSurvivalV70?.selfDestruct?.expired) return false;
      const result = super.restartFromCheckpoint();
      if (!result || !this.isAlienSurvivalMissionV70()) return result;
      this.closeAlienSurvivalCctvV70({ force: true });
      if (this.alienSurvivalWorldActionV70) this.cancelAlienSurvivalActionV70('checkpoint-restart');
      this.ensureAlienSurvivalInsertionClearanceV70('checkpoint-restart');
      return result;
    }

    drawAlienSurvivalStationFallbackV70(ctx, station) {
      ctx.save();
      ctx.fillStyle = '#111c1a';
      ctx.strokeStyle = station.type === 'self-destruct' ? '#d37a63' : '#6eb49b';
      ctx.lineWidth = 2;
      ctx.fillRect(station.x, station.y, station.w, station.h);
      ctx.strokeRect(station.x + 1, station.y + 1, station.w - 2, station.h - 2);
      ctx.fillStyle = '#75d3a8';
      ctx.fillRect(station.x + 12, station.y + 18, station.w - 24, 20);
      ctx.restore();
    }

    drawAlienSurvivalStationV70(ctx, station) {
      if (!ctx || !station || !this.alienSurvivalV70) return false;
      const cell = resolveAlienSurvivalSystemCellV70(stationCellId(station, this.alienSurvivalV70));
      const image = this.images?.get(ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.imageKey);
      const ready = Boolean(image?.complete && (image.naturalWidth || image.width) > 0 && (image.naturalHeight || image.height) > 0);
      if (ready && cell) {
        const sheet = ALIEN_SURVIVAL_SYSTEMS_SHEET_V70;
        const guard = sheet.guard || 0;
        const sx = cell.column * sheet.cellWidth + guard;
        const sy = cell.row * sheet.cellHeight + guard;
        const sw = sheet.cellWidth - guard * 2;
        const sh = sheet.cellHeight - guard * 2;
        const renderHeight = station.h + 22;
        const renderWidth = Math.min(station.w + 28, renderHeight * (sw / sh));
        ctx.drawImage(image, sx, sy, sw, sh, station.x + station.w / 2 - renderWidth / 2, station.groundY - renderHeight, renderWidth, renderHeight);
      } else this.drawAlienSurvivalStationFallbackV70(ctx, station);
      ctx.save();
      ctx.font = '700 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = station.type === 'self-destruct' ? '#efaa8c' : '#b5d7c9';
      ctx.fillText(station.label, station.x + station.w / 2, station.y - 8);
      ctx.restore();
      return true;
    }

    drawAlienSurvivalWeldV70(ctx) {
      const door = this.alienSurvivalStateDoorV70(ALIEN_SURVIVAL_WELDABLE_DOOR_ID_V70);
      const physical = this.alienSurvivalPhysicalDoorV70(ALIEN_SURVIVAL_WELDABLE_DOOR_ID_V70);
      if (!door?.welded || !physical) return false;
      const cell = resolveAlienSurvivalSystemCellV70('airlock-welding');
      const image = this.images?.get(ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.imageKey);
      const ready = Boolean(image?.complete && (image.naturalWidth || image.width) > 0 && cell);
      if (ready) {
        const sheet = ALIEN_SURVIVAL_SYSTEMS_SHEET_V70;
        const guard = sheet.guard || 0;
        ctx.save();
        ctx.globalAlpha = 0.7 + 0.3 * clamp(door.weldIntegrity / 100, 0, 1);
        ctx.drawImage(image, cell.column * sheet.cellWidth + guard, cell.row * sheet.cellHeight + guard, sheet.cellWidth - guard * 2, sheet.cellHeight - guard * 2, physical.x - 18, physical.y + physical.h * 0.12, physical.w + 36, physical.h * 0.76);
        ctx.restore();
      }
      return true;
    }

    drawWorld(ctx) {
      super.drawWorld(ctx);
      if (!this.isAlienSurvivalMissionV70() || !this.alienSurvivalV70 || !ctx) return;
      for (const pool of this.alienSurvivalV70.acidPools) this.drawHazard?.(ctx, { ...pool, kind: 'acid', damage: 0 });
      for (const station of this.alienSurvivalStationsV70) this.drawAlienSurvivalStationV70(ctx, station);
      this.drawAlienSurvivalWeldV70(ctx);
    }

    drawHud(ctx) {
      super.drawHud(ctx);
      if (!this.isAlienSurvivalMissionV70() || !this.alienSurvivalV70 || !ctx) return;
      const state = this.alienSurvivalV70;
      const room = this.alienSurvivalRoomForActorV70(this.player) || state.rooms[0];
      const routes = ALIEN_SURVIVAL_POWER_CIRCUIT_IDS_V70.filter((id) => state.power.routes[id]);
      const welded = this.alienSurvivalStateDoorV70(ALIEN_SURVIVAL_WELDABLE_DOOR_ID_V70);
      ctx.save();
      ctx.fillStyle = 'rgba(3, 9, 9, .9)';
      ctx.strokeStyle = state.selfDestruct.armed ? '#d9654f' : '#648f80';
      ctx.fillRect(892, 112, 366, 112);
      ctx.strokeRect(892.5, 112.5, 365, 111);
      ctx.font = '700 11px monospace';
      ctx.fillStyle = '#d7cf9b';
      ctx.fillText('MU/TH/UR · SYSTÈMES DU SECTEUR', 906, 132);
      ctx.fillStyle = room.pressure < PRESSURE_DAMAGE_THRESHOLD ? '#f08d70' : '#b9d8ca';
      ctx.fillText(`${room.id.toUpperCase()} · ${room.pressure.toFixed(1)} kPa · O₂ ${Math.round(room.oxygen)}%`, 906, 153);
      ctx.fillStyle = '#9fb8ad';
      ctx.fillText(`ÉNERGIE ${routes.length}/${state.power.capacity} · ${routes.join(' + ') || 'HORS LIGNE'}`, 906, 174);
      ctx.fillText(`CCTV ${state.cctv.visitedFeedIds.length}/${state.cctv.requiredFeedIds.length} · SOUDURE ${Math.ceil(welded?.weldIntegrity || 0)}%`, 906, 195);
      ctx.fillStyle = '#91a79d';
      ctx.fillText(this.objectiveProgressText(), 906, 214);
      if (state.cctv.active) {
        ctx.fillStyle = 'rgba(1, 8, 7, .82)';
        ctx.fillRect(18, 612, 410, 30);
        ctx.strokeStyle = '#79bca4';
        ctx.strokeRect(18.5, 612.5, 409, 29);
        ctx.fillStyle = '#bfe4d4';
        ctx.fillText(`CCTV LIVE · ${state.cctv.selectedFeedId?.toUpperCase()} · SIMULATION ACTIVE`, 32, 632);
      }
      if (state.selfDestruct.armed) {
        ctx.font = '900 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = state.selfDestruct.remainingSeconds <= 15 ? '#ff604a' : '#e98c66';
        ctx.fillText(`AUTO-DESTRUCTION · T-${Math.ceil(state.selfDestruct.remainingSeconds)} S`, 640, 126);
        ctx.textAlign = 'left';
      }
      ctx.restore();
    }

    captureResumeState() {
      const base = super.captureResumeState();
      if (!this.isAlienSurvivalMissionV70() || !this.alienSurvivalV70) return base;
      this.syncAlienSurvivalDoorStateV70();
      const normalized = this.normalizeAlienSurvivalStateV70(this.alienSurvivalV70);
      return {
        ...base,
        specialOperation: {
          ...(isRecord(base?.specialOperation) ? base.specialOperation : {}),
          operationId: ALIEN_SURVIVAL_OPERATION_ID_V70,
          alienSurvivalV70: normalized
        }
      };
    }

    applyResumeState(rawState) {
      const source = rawState?.specialOperation?.alienSurvivalV70 || rawState?.alienSurvivalV70;
      const result = super.applyResumeState(rawState);
      if (!this.isAlienSurvivalMissionV70() || !isRecord(source) || (isRecord(result) && result.applied === false)) return result;
      if (Number(source.schema) !== ALIEN_SURVIVAL_SCHEMA_V70
        || source.operationId !== ALIEN_SURVIVAL_OPERATION_ID_V70
        || source.campaignId !== ALIEN_SURVIVAL_CAMPAIGN_ID_V70) {
        return { ...(isRecord(result) ? result : {}), alienSurvivalRestoredV70: false, alienSurvivalReasonV70: 'schema-or-identity-mismatch' };
      }
      if (source.deploymentOperationId && source.deploymentOperationId !== this.alienSurvivalDeploymentOperationIdV70) {
        return { ...(isRecord(result) ? result : {}), alienSurvivalRestoredV70: false, alienSurvivalReasonV70: 'deployment-mismatch' };
      }
      this.alienSurvivalPendingResumeV70 = clone(source);
      if (this.alienSurvivalConfiguredV70) {
        this.alienSurvivalV70 = this.normalizeAlienSurvivalStateV70(source);
        this.configureAlienSurvivalWorldV70();
      }
      return {
        ...(isRecord(result) ? result : {}), applied: result !== false,
        restored: (Number(result?.restored) || 0) + 1,
        specialOperationRestored: true,
        alienSurvivalRestoredV70: true
      };
    }

    getAlienSurvivalUiStateV70(actor = this.player) {
      if (!this.isAlienSurvivalMissionV70() || !this.alienSurvivalV70) return { active: false };
      const state = this.alienSurvivalV70;
      const room = this.alienSurvivalRoomForActorV70(actor) || state.rooms[0];
      const powerStation = this.alienSurvivalStationV70('power');
      const cctvStation = this.alienSurvivalStationV70('cctv');
      const nearestAuthorization = this.alienSurvivalNearestStationV70(actor, 'self-destruct');
      const preDestruct = this.missingAlienSurvivalPreDestructRequirementV70();
      const atPower = centerDistance(actor, powerStation) <= ALIEN_SURVIVAL_INTERACTION_RADIUS_V70;
      const atCctv = centerDistance(actor, cctvStation) <= ALIEN_SURVIVAL_INTERACTION_RADIUS_V70;
      const authorizations = state.selfDestruct.authorizations;
      const authorizationAvailable = Boolean(nearestAuthorization && state.power.routes.security && !preDestruct);
      return {
        active: true,
        phase: state.phase,
        room: { id: room.id, pressure: room.pressure, oxygen: room.oxygen, breached: room.breachRate > 0 || room.pressure < ALIEN_SURVIVAL_SAFE_PRESSURE_V70 },
        rooms: state.rooms.map((entry) => ({ id: entry.id, pressure: entry.pressure, oxygen: entry.oxygen, breached: entry.breachRate > 0 })),
        power: {
          capacity: state.power.capacity,
          routes: { ...state.power.routes },
          rerouteCount: state.power.rerouteCount,
          availableAtConsole: atPower,
          blockedReason: atPower ? '' : 'Approchez-vous du répartiteur physique.'
        },
        doors: state.doors.map((door) => {
          const physical = this.alienSurvivalPhysicalDoorV70(door.id);
          const nearby = centerDistance(actor, physical) <= WELD_RANGE;
          const canWeld = door.id === ALIEN_SURVIVAL_WELDABLE_DOOR_ID_V70 && !door.welded && Boolean(this.inventory?.cutter) && state.cctv.scanComplete && this.alienSurvivalAlternateRouteAvailableV70();
          const blockedReason = door.id !== ALIEN_SURVIVAL_WELDABLE_DOOR_ID_V70 ? 'Porte non soudable.'
            : door.welded ? 'Cloison déjà soudée.'
              : !this.inventory?.cutter ? 'Kit de soudure requis.'
                : !state.cctv.scanComplete ? 'Scan CCTV requis.'
                  : !nearby ? 'Approchez-vous de la cloison cargo.' : '';
          return { id: door.id, label: door.id.replaceAll('-', ' ').toUpperCase(), welded: door.welded, weldIntegrity: door.weldIntegrity, canWeld, nearby, blockedReason };
        }),
        cctv: {
          active: state.cctv.active,
          selectedFeedId: state.cctv.selectedFeedId,
          visitedFeedIds: [...state.cctv.visitedFeedIds],
          requiredFeedIds: [...state.cctv.requiredFeedIds],
          scanComplete: state.cctv.scanComplete,
          availableAtConsole: atCctv && state.power.routes.cctv,
          blockedReason: !atCctv ? 'Approchez-vous de la console CCTV.' : !state.power.routes.cctv ? 'Alimentation CCTV requise.' : ''
        },
        selfDestruct: {
          engineeringAuthorized: authorizations.engineering,
          commandAuthorized: authorizations.command,
          armed: state.selfDestruct.armed,
          remaining: state.selfDestruct.remainingSeconds,
          expired: state.selfDestruct.expired,
          canAuthorize: authorizationAvailable,
          canArm: Boolean(nearestAuthorization?.id === 'survival-command-auth' && authorizationAvailable && authorizations.engineering && authorizations.command),
          stationId: nearestAuthorization?.id || '',
          blockedReason: preDestruct || (!state.power.routes.security ? 'Alimentation sécurité requise.' : !nearestAuthorization ? 'Approchez-vous d’une clé physique.' : 'Double autorisation physique requise.')
        },
        acid: { activePoolCount: state.acidPools.filter((pool) => pool.active).length, totalPoolCount: state.acidPools.length },
        worldAction: this.alienSurvivalWorldActionV70 ? clone(this.alienSurvivalWorldActionV70) : null,
        interactionPrompt: this.getInteractionPrompt(actor) || 'Déplacez-vous jusqu’à un système physique pour agir.',
        status: this.mission?.failureReason || this.missingAlienSurvivalRequirementV70() || 'Tous les systèmes de survie sont opérationnels.'
      };
    }

    getAlienSurvivalStateV70(actor = this.player) {
      return this.getAlienSurvivalUiStateV70(actor);
    }

    getAlienSurvivalSnapshotV70() {
      if (!this.isAlienSurvivalMissionV70() || !this.alienSurvivalV70) return {};
      const state = this.normalizeAlienSurvivalStateV70(this.alienSurvivalV70);
      return {
        alienSurvivalV70: {
          ...state,
          mechanics: getAlienSurvivalMechanicsV70(state),
          validation: validateAlienSurvivalCompletionV70(state, { deploymentOperationId: this.alienSurvivalDeploymentOperationIdV70 }),
          extractionBlocked: Boolean(this.missingAlienSurvivalRequirementV70()),
          insertionSecurity: this.alienSurvivalInsertionSecurityV70 ? clone(this.alienSurvivalInsertionSecurityV70) : null,
          physicalStations: this.alienSurvivalStationsV70.map((station) => ({ ...station })),
          cameraFeeds: this.alienSurvivalCameraFeedsV70.map((feed) => ({ ...feed }))
        }
      };
    }

    getGameplayReport() {
      const report = super.getGameplayReport();
      return this.isAlienSurvivalMissionV70()
        ? { ...report, alienSurvivalSystems: this.getAlienSurvivalSnapshotV70().alienSurvivalV70 }
        : report;
    }

    getSnapshot() {
      return { ...super.getSnapshot(), ...this.getAlienSurvivalSnapshotV70() };
    }
  };
}
