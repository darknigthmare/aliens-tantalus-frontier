import { crewMovementV85 } from './crew-runtime-v85.js';
import {
  ALPHA_BRAVO_CAMPAIGN_ID_V69,
  ALPHA_BRAVO_OPERATION_ID_V69,
  ALPHA_BRAVO_ORDERS_V69,
  ALPHA_BRAVO_SCHEMA_V69,
  ALPHA_BRAVO_SELECTIONS_V69,
  ALPHA_BRAVO_TASK_DEFINITIONS_V69,
  ALPHA_BRAVO_TEAM_IDS_V69,
  alphaBravoScoreV69,
  alphaBravoStateIsOperationalV69,
  buildAlphaBravoResolutionPayloadV69,
  clampAlphaBravoV69,
  createAlphaBravoStateV69,
  deriveAlphaBravoPhaseV69,
  sanitizeAlphaBravoStateV69
} from './alpha-bravo-coop-v69.js';
import {
  ALPHA_BRAVO_CONSOLE_SHEET_V69,
  resolveAlphaBravoConsoleCellV69
} from './alpha-bravo-visuals-v69.js';

const DEFAULT_WORLD_WIDTH = 6200;
const DEFAULT_WORLD_HEIGHT = 1080;
const GRAVITY = 1900;
const SPLIT_TASK_RADIUS = 172;
const JOINT_TASK_RADIUS = 205;
const STATION_WIDTH = 76;
const STATION_HEIGHT = 86;
const INSERTION_SURFACE_EDGE_PADDING = 10;
const INSERTION_ENEMY_GAP = 28;
const INSERTION_SLOT_STRIDE = 92;

export const ALPHA_BRAVO_INSERTION_SAFE_RADIUS_V69 = 760;

export const ALPHA_BRAVO_TASK_ATLAS_V69 = ALPHA_BRAVO_CONSOLE_SHEET_V69;

const asList = (value) => Array.isArray(value) ? value : [];
const isRecord = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const actorCrewId = (actor) => String(actor?.crewId || actor?.operatorId || '').trim();
const center = (entity = {}) => ({
  x: (Number(entity.x) || 0) + (Number(entity.w) || 0) / 2,
  y: (Number(entity.y) || 0) + (Number(entity.h) || 0) / 2
});
const distance = (left, right) => {
  const a = center(left);
  const b = center(right);
  return Math.hypot(a.x - b.x, a.y - b.y);
};
const minimumDistance = (entity, others) => asList(others).reduce(
  (minimum, other) => Math.min(minimum, distance(entity, other)),
  Number.POSITIVE_INFINITY
);
const overlapsWithGap = (left, right, gap = 0) => (
  Number(left?.x) < Number(right?.x) + Number(right?.w) + gap
  && Number(left?.x) + Number(left?.w) + gap > Number(right?.x)
  && Number(left?.y) < Number(right?.y) + Number(right?.h) + gap
  && Number(left?.y) + Number(left?.h) + gap > Number(right?.y)
);
const finiteDelta = (delta) => clampAlphaBravoV69(delta, 0, 0.1);
const boundedText = (value, fallback = '', maximum = 128) => {
  const source = typeof value === 'string' ? value.trim() : '';
  return (source || fallback).slice(0, maximum);
};

function cloneTask(task) {
  return task ? { ...task } : null;
}

function taskDefinition(taskId) {
  return ALPHA_BRAVO_TASK_DEFINITIONS_V69.find((entry) => entry.id === taskId) || null;
}

export function withAlphaBravoCoopRuntimeV69(BaseEngine) {
  return class AlphaBravoCoopRuntimeV69 extends BaseEngine {
    start(options = {}) {
      this.alphaBravoActiveV69 = String(options.campaign?.id || '') === ALPHA_BRAVO_CAMPAIGN_ID_V69;
      this.alphaBravoConfiguredV69 = false;
      this.alphaBravoPendingResumeV69 = null;
      this.alphaBravoAwaitingPingV69 = false;
      this.alphaBravoStationActorsV69 = [];
      this.alphaBravoMetricBucketsV69 = new Map();
      this.alphaBravoTaskProgressBucketsV69 = new Map();
      this.alphaBravoInsertionSecuredV69 = false;
      this.alphaBravoInsertionSecurityV69 = null;
      this.alphaBravoDeploymentOperationIdV69 = boundedText(
        options.strategicBriefing?.id || options.operation?.id,
        ALPHA_BRAVO_OPERATION_ID_V69
      );
      this.alphaBravoV69 = this.alphaBravoActiveV69
        ? createAlphaBravoStateV69({
            crewIds: asList(options.crew).map((member) => member?.id),
            crewMetrics: options.crew,
            deploymentOperationId: this.alphaBravoDeploymentOperationIdV69
          })
        : null;

      const snapshot = super.start(options);
      if (!this.isAlphaBravoMissionV69()) return snapshot;

      const pending = this.alphaBravoPendingResumeV69;
      const pendingMatchesDeployment = !pending?.deploymentOperationId
        || pending.deploymentOperationId === this.alphaBravoDeploymentOperationIdV69;
      this.alphaBravoV69 = pending && pendingMatchesDeployment
        ? this.normalizeAlphaBravoStateV69(pending)
        : this.normalizeAlphaBravoStateV69(this.alphaBravoV69);
      this.alphaBravoPendingResumeV69 = null;
      this.alphaBravoConfiguredV69 = true;
      this.loadAlphaBravoVisualsV69();
      this.configureAlphaBravoWorldV69();
      this.secureAlphaBravoInsertionV69({
        resumed: Boolean(options.resumeState && this.lastResumeResult?.applied)
      });
      this.syncAlphaBravoActorsV69();
      if (this.mission?.objectives) this.mission.objectives.alphaBravo = Boolean(this.alphaBravoV69.certified);
      if (pending && this.lastResumeResult) {
        this.lastResumeResult = {
          ...this.lastResumeResult,
          alphaBravoRestoredV69: pendingMatchesDeployment,
          alphaBravoReasonV69: pendingMatchesDeployment ? null : 'deployment-mismatch'
        };
      }
      this.onEvent?.({
        type: 'special-operation-started',
        operationId: ALPHA_BRAVO_OPERATION_ID_V69,
        deploymentOperationId: this.alphaBravoDeploymentOperationIdV69,
        campaignId: ALPHA_BRAVO_CAMPAIGN_ID_V69,
        fireteams: ALPHA_BRAVO_TEAM_IDS_V69.map((id) => ({ id, memberIds: [...this.alphaBravoV69.teams[id].memberIds] })),
        taskCount: this.alphaBravoV69.tasks.length
      });
      return { ...snapshot, ...this.getAlphaBravoSnapshotV69() };
    }

    isAlphaBravoMissionV69() {
      return Boolean(
        this.alphaBravoActiveV69
        || this.campaign?.id === ALPHA_BRAVO_CAMPAIGN_ID_V69
        || this.missionPlan?.campaign?.id === ALPHA_BRAVO_CAMPAIGN_ID_V69
      );
    }

    alphaBravoWorldBoundsV69() {
      return {
        width: clampAlphaBravoV69(this.missionLevelBounds?.width || DEFAULT_WORLD_WIDTH, 960, 20000),
        height: clampAlphaBravoV69(this.missionLevelBounds?.height || DEFAULT_WORLD_HEIGHT, 540, 6000)
      };
    }

    isIndependentAlphaBravoCommanderV84(actor = this.player) {
      return Boolean(actor && actor === this.player
        && this.playerIdentityV84?.id === 'player-echo9'
        && actorCrewId(actor) === this.playerIdentityV84.id);
    }

    alphaBravoCommandTeamsForTaskV84(task) {
      return this.alphaBravoSelectedTeamsV69()
        .filter((teamId) => task?.fireteamId === 'joint' || task?.fireteamId === teamId);
    }

    alphaBravoCrewIdsV69() {
      const ids = [];
      const push = (value) => {
        const id = boundedText(value, '', 96);
        if (id && !ids.includes(id) && ids.length < 4) ids.push(id);
      };
      // The independent V84 commander is a fifth physical actor, not a fifth
      // member of the two pairs or a substitute for a manifested Marine.
      if (!this.isIndependentAlphaBravoCommanderV84()) push(actorCrewId(this.player));
      for (const actor of asList(this.squadActors)) push(actorCrewId(actor));
      for (const member of asList(this.crewRuntime).filter((entry) => entry?.status === 'active')) push(member.id);
      return ids;
    }

    alphaBravoCrewMetricsV69() {
      const actors = this.alphaBravoAllActorsV69();
      const actorsById = new Map(actors.map((actor) => [actorCrewId(actor), actor]));
      return this.alphaBravoCrewIdsV69().map((crewId) => {
        const source = asList(this.crewRuntime).find((member) => member?.id === crewId) || {};
        const actor = actorsById.get(crewId) || {};
        return { crewId, stress: source.stress, health: actor.health ?? source.health };
      });
    }

    normalizeAlphaBravoStateV69(source) {
      const bounds = this.alphaBravoWorldBoundsV69();
      return sanitizeAlphaBravoStateV69(source, {
        crewIds: this.alphaBravoCrewIdsV69(),
        crewMetrics: this.alphaBravoCrewMetricsV69(),
        deploymentOperationId: this.alphaBravoDeploymentOperationIdV69,
        worldWidth: bounds.width,
        worldHeight: bounds.height
      });
    }

    alphaBravoAllActorsV69() {
      const values = [this.player, this.coopEnabled ? this.coop : null, ...asList(this.squadActors)].filter(Boolean);
      const seen = new Set();
      return values.filter((actor) => {
        const id = actorCrewId(actor);
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    }

    alphaBravoActorForCrewIdV69(crewId) {
      const id = boundedText(crewId, '', 96);
      if (!id) return null;
      if (actorCrewId(this.player) === id) return this.player;
      if (this.coopEnabled && actorCrewId(this.coop) === id) return this.coop;
      return asList(this.squadActors).find((actor) => actorCrewId(actor) === id) || null;
    }

    alphaBravoTeamForCrewIdV69(crewId) {
      if (!this.alphaBravoV69) return null;
      return ALPHA_BRAVO_TEAM_IDS_V69.find((id) => this.alphaBravoV69.teams[id].memberIds.includes(crewId)) || null;
    }

    alphaBravoTeamForActorV69(actor) {
      return this.alphaBravoTeamForCrewIdV69(actorCrewId(actor));
    }

    alphaBravoTeamActorsV69(teamId) {
      const team = this.alphaBravoV69?.teams?.[teamId];
      return team ? team.memberIds.map((crewId) => this.alphaBravoActorForCrewIdV69(crewId)).filter(Boolean) : [];
    }

    syncAlphaBravoActorsV69() {
      if (!this.alphaBravoV69) return 0;
      let tagged = 0;
      for (const teamId of ALPHA_BRAVO_TEAM_IDS_V69) {
        const team = this.alphaBravoV69.teams[teamId];
        for (const [pairIndex, crewId] of team.memberIds.entries()) {
          const actor = this.alphaBravoActorForCrewIdV69(crewId);
          if (!actor) continue;
          actor.alphaBravoTeamV69 = teamId;
          actor.alphaBravoPairIndexV69 = pairIndex;
          actor.alphaBravoHumanControlledV69 = actor === this.player || (this.coopEnabled && actor === this.coop);
          tagged += 1;
        }
      }
      return tagged;
    }

    loadAlphaBravoVisualsV69() {
      if (!this.images || typeof globalThis.Image !== 'function') return false;
      if (this.images.has(ALPHA_BRAVO_CONSOLE_SHEET_V69.imageKey)) return true;
      const image = new globalThis.Image();
      image.decoding = 'async';
      image.src = ALPHA_BRAVO_CONSOLE_SHEET_V69.path;
      this.images.set(ALPHA_BRAVO_CONSOLE_SHEET_V69.imageKey, image);
      return true;
    }

    alphaBravoSurfaceCandidatesV69() {
      return asList(this.platforms)
        .map((platform, index) => ({ platform, index }))
        .filter(({ platform }) => platform?.kind !== 'lift'
          && Number.isFinite(Number(platform?.x))
          && Number.isFinite(Number(platform?.y))
          && Number(platform?.w) >= 90);
    }

    alphaBravoSurfaceForPointV69(x, preferredY = null) {
      const candidates = this.alphaBravoSurfaceCandidatesV69();
      if (!candidates.length) return null;
      const horizontal = candidates.filter(({ platform }) => x >= Number(platform.x) && x <= Number(platform.x) + Number(platform.w));
      const pool = horizontal.length ? horizontal : candidates;
      return pool.sort((left, right) => {
        const leftCenter = Number(left.platform.x) + Number(left.platform.w) / 2;
        const rightCenter = Number(right.platform.x) + Number(right.platform.w) / 2;
        const leftScore = Math.abs(leftCenter - x) + (Number.isFinite(preferredY) ? Math.abs(Number(left.platform.y) - preferredY) * 0.55 : 0);
        const rightScore = Math.abs(rightCenter - x) + (Number.isFinite(preferredY) ? Math.abs(Number(right.platform.y) - preferredY) * 0.55 : 0);
        return leftScore - rightScore;
      })[0] || null;
    }

    alphaBravoEnemySurfaceV69(enemy, tolerance = 3) {
      if (!enemy) return null;
      const x = Number(enemy.x);
      const y = Number(enemy.y);
      const width = Math.max(1, Number(enemy.w) || 1);
      const height = Math.max(1, Number(enemy.h) || 1);
      if (![x, y, width, height].every(Number.isFinite)) return null;
      const footY = y + height;
      return this.alphaBravoSurfaceCandidatesV69()
        .filter(({ platform }) => (
          x >= Number(platform.x) - 2
          && x + width <= Number(platform.x) + Number(platform.w) + 2
          && Math.abs(footY - Number(platform.y)) <= tolerance
        ))
        .sort((left, right) => (
          Math.abs(footY - Number(left.platform.y)) - Math.abs(footY - Number(right.platform.y))
          || Number(left.platform.x) - Number(right.platform.x)
          || left.index - right.index
        ))[0] || null;
    }

    alphaBravoInsertionCandidatesV69(enemy) {
      const bounds = this.alphaBravoWorldBoundsV69();
      const width = Math.max(1, Number(enemy?.w) || 1);
      const height = Math.max(1, Number(enemy?.h) || 1);
      const candidates = [];
      const seen = new Set();
      const surfaces = [...this.alphaBravoSurfaceCandidatesV69()].sort((left, right) => (
        Number(left.platform.x) - Number(right.platform.x)
        || Number(left.platform.y) - Number(right.platform.y)
        || boundedText(left.platform.id, '', 96).localeCompare(boundedText(right.platform.id, '', 96))
        || left.index - right.index
      ));
      for (const { platform, index } of surfaces) {
        const surfaceX = Number(platform.x);
        const surfaceY = Number(platform.y);
        const surfaceWidth = Number(platform.w);
        if (![surfaceX, surfaceY, surfaceWidth].every(Number.isFinite)) continue;
        if (surfaceY < height || surfaceY > bounds.height) continue;
        const minimumX = Math.max(0, surfaceX + INSERTION_SURFACE_EDGE_PADDING);
        const maximumX = Math.min(
          bounds.width - width,
          surfaceX + surfaceWidth - width - INSERTION_SURFACE_EDGE_PADDING
        );
        if (maximumX < minimumX) continue;
        const span = maximumX - minimumX;
        const slotCount = Math.max(1, Math.ceil(span / Math.max(INSERTION_SLOT_STRIDE, width + INSERTION_ENEMY_GAP)));
        for (let slot = 0; slot <= slotCount; slot += 1) {
          const x = minimumX + span * slot / slotCount;
          const key = `${Math.round(x * 1000)}:${Math.round(surfaceY * 1000)}`;
          if (seen.has(key)) continue;
          seen.add(key);
          candidates.push({
            x,
            y: surfaceY - height,
            w: width,
            h: height,
            groundY: surfaceY,
            surface: platform,
            surfaceId: platform.id || `platform-${index}`,
            order: candidates.length
          });
        }
      }
      return candidates;
    }

    secureAlphaBravoInsertionV69({ resumed = false } = {}) {
      if (!this.isAlphaBravoMissionV69() || !this.alphaBravoV69) return { applied: false, reason: 'inactive', moved: 0 };
      if (resumed) {
        this.alphaBravoInsertionSecuredV69 = true;
        const report = Object.freeze({ applied: false, reason: 'resume-preserved', moved: 0, contacts: asList(this.enemies).length });
        this.alphaBravoInsertionSecurityV69 = report;
        return report;
      }
      if (this.alphaBravoInsertionSecuredV69) return this.alphaBravoInsertionSecurityV69;
      this.alphaBravoInsertionSecuredV69 = true;

      const operators = this.alphaBravoAllActorsV69().filter((actor) => (
        Number.isFinite(Number(actor?.x))
        && Number.isFinite(Number(actor?.y))
        && Number(actor?.w) > 0
        && Number(actor?.h) > 0
      ));
      const contacts = asList(this.enemies);
      const occupied = [];
      let moved = 0;

      for (const enemy of contacts) {
        if (!enemy || !Number.isFinite(Number(enemy.x)) || !Number.isFinite(Number(enemy.y))) continue;
        const currentSurface = this.alphaBravoEnemySurfaceV69(enemy);
        const currentSafe = minimumDistance(enemy, operators) >= ALPHA_BRAVO_INSERTION_SAFE_RADIUS_V69;
        const currentClear = occupied.every((other) => !overlapsWithGap(enemy, other, INSERTION_ENEMY_GAP));
        if (currentSurface && currentSafe && currentClear) {
          occupied.push(enemy);
          continue;
        }

        const safeCandidates = this.alphaBravoInsertionCandidatesV69(enemy).filter((candidate) => (
          minimumDistance(candidate, operators) >= ALPHA_BRAVO_INSERTION_SAFE_RADIUS_V69
        ));
        const clearCandidates = safeCandidates.filter((candidate) => (
          occupied.every((other) => !overlapsWithGap(candidate, other, INSERTION_ENEMY_GAP))
        ));
        const pool = clearCandidates.length ? clearCandidates : safeCandidates;
        const selected = pool.sort((left, right) => {
          const leftDisplacement = Math.hypot(left.x - enemy.x, left.y - enemy.y);
          const rightDisplacement = Math.hypot(right.x - enemy.x, right.y - enemy.y);
          const leftSeparation = minimumDistance(left, occupied);
          const rightSeparation = minimumDistance(right, occupied);
          return leftDisplacement - rightDisplacement
            || rightSeparation - leftSeparation
            || left.order - right.order;
        })[0];
        if (!selected) continue;

        enemy.x = selected.x;
        enemy.y = selected.y;
        enemy.spawnX = selected.x;
        enemy.groundY = selected.groundY;
        enemy.vx = 0;
        enemy.vy = 0;
        enemy.alert = false;
        enemy.attacking = false;
        enemy.pendingMelee = false;
        enemy.pendingMeleeTargetId = null;
        enemy.attackWindupClock = 0;
        enemy.attackAnimationClock = 0;
        enemy.alphaBravoInsertionRelocatedV69 = true;
        enemy.alphaBravoInsertionSurfaceV69 = selected.surfaceId;
        if (selected.surface?.zoneId) enemy.levelZoneId = selected.surface.zoneId;
        if (typeof this.initializeEnemyMissionNavigation === 'function') this.initializeEnemyMissionNavigation(enemy);
        occupied.push(enemy);
        moved += 1;
      }

      const unsafe = contacts.filter((enemy) => minimumDistance(enemy, operators) < ALPHA_BRAVO_INSERTION_SAFE_RADIUS_V69).length;
      const unsupported = contacts.filter((enemy) => !this.alphaBravoEnemySurfaceV69(enemy, 4)).length;
      const minimumOperatorDistance = contacts.length && operators.length
        ? Math.min(...contacts.map((enemy) => minimumDistance(enemy, operators)))
        : null;
      const report = Object.freeze({
        applied: true,
        reason: null,
        moved,
        contacts: contacts.length,
        safeRadius: ALPHA_BRAVO_INSERTION_SAFE_RADIUS_V69,
        minimumOperatorDistance,
        unsafe,
        unsupported
      });
      this.alphaBravoInsertionSecurityV69 = report;
      this.onEvent?.({ type: 'alpha-bravo-insertion-secured', operationId: ALPHA_BRAVO_OPERATION_ID_V69, ...report });
      return report;
    }

    configureAlphaBravoWorldV69() {
      if (!this.alphaBravoV69) return [];
      const bounds = this.alphaBravoWorldBoundsV69();
      const reservedPositions = [];
      this.alphaBravoStationActorsV69 = ALPHA_BRAVO_TASK_DEFINITIONS_V69.map((definition) => {
        const idealX = bounds.width * definition.normalizedX;
        const surfaceEntry = this.alphaBravoSurfaceForPointV69(idealX);
        const surface = surfaceEntry?.platform;
        const minimumX = surface ? Number(surface.x) + 12 : 12;
        const maximumX = surface
          ? Number(surface.x) + Number(surface.w) - STATION_WIDTH - 12
          : bounds.width - STATION_WIDTH - 12;
        let x = clampAlphaBravoV69(idealX - STATION_WIDTH / 2, minimumX, Math.max(minimumX, maximumX));
        for (const usedX of reservedPositions) {
          if (Math.abs(x - usedX) < STATION_WIDTH * 1.5) x = clampAlphaBravoV69(x + STATION_WIDTH * 1.7, minimumX, Math.max(minimumX, maximumX));
        }
        reservedPositions.push(x);
        const groundY = surface ? Number(surface.y) : Math.min(bounds.height - 40, 704);
        return {
          id: `alpha-bravo-station:${definition.id}`,
          taskId: definition.id,
          fireteamId: definition.fireteamId,
          label: definition.label,
          x,
          y: groundY - STATION_HEIGHT,
          w: STATION_WIDTH,
          h: STATION_HEIGHT,
          groundY,
          surfaceIdV69: surface?.id || `platform-${surfaceEntry?.index ?? 'fallback'}`
        };
      });
      for (const teamId of ALPHA_BRAVO_TEAM_IDS_V69) {
        const ping = this.alphaBravoV69.pings[teamId];
        if (ping) this.alphaBravoV69.pings[teamId] = this.anchorAlphaBravoPingV69(ping, teamId);
      }
      return this.alphaBravoStationActorsV69;
    }

    alphaBravoTaskStateV69(taskId) {
      return asList(this.alphaBravoV69?.tasks).find((task) => task.id === taskId) || null;
    }

    alphaBravoStationV69(taskId) {
      return asList(this.alphaBravoStationActorsV69).find((station) => station.taskId === taskId) || null;
    }

    selectAlphaBravoFireteamV69(team) {
      if (!this.isAlphaBravoMissionV69() || !this.alphaBravoV69 || !ALPHA_BRAVO_SELECTIONS_V69.includes(team)) return false;
      this.alphaBravoV69.selectedTeam = team;
      this.alphaBravoAwaitingPingV69 = false;
      this.onEvent?.({ type: 'fireteam-selected', operationId: ALPHA_BRAVO_OPERATION_ID_V69, teamId: team });
      return true;
    }

    alphaBravoSelectedTeamsV69(requested = this.alphaBravoV69?.selectedTeam) {
      if (requested === 'all') return [...ALPHA_BRAVO_TEAM_IDS_V69];
      return ALPHA_BRAVO_TEAM_IDS_V69.includes(requested) ? [requested] : [];
    }

    reserveAlphaBravoTaskV69(teamId, taskId, { emit = true } = {}) {
      if (!this.isAlphaBravoMissionV69() || !this.alphaBravoV69 || !ALPHA_BRAVO_TEAM_IDS_V69.includes(teamId)) return false;
      const team = this.alphaBravoV69.teams[teamId];
      const task = this.alphaBravoTaskStateV69(taskId);
      if (!task || task.complete || !task.available) return false;
      if (task.fireteamId !== teamId && task.fireteamId !== 'joint') return false;
      if (task.fireteamId === 'joint') {
        const splitComplete = this.alphaBravoV69.tasks.slice(0, 2).every((entry) => entry.complete);
        if (!splitComplete) return false;
        task.reservedBy = 'joint';
        for (const id of ALPHA_BRAVO_TEAM_IDS_V69) this.alphaBravoV69.teams[id].reservedTask = task.id;
      } else {
        if (task.reservedBy && task.reservedBy !== teamId) return false;
        const conflicting = this.alphaBravoV69.tasks.find((entry) => !entry.complete && entry.reservedBy === teamId && entry.id !== task.id && entry.fireteamId !== 'joint');
        if (conflicting) return false;
        task.reservedBy = teamId;
        team.reservedTask = task.id;
      }
      this.alphaBravoV69.telemetry.reservations += 1;
      if (emit) this.onEvent?.({
        type: 'fireteam-task-reserved',
        operationId: ALPHA_BRAVO_OPERATION_ID_V69,
        teamId,
        taskId: task.id,
        exclusive: true
      });
      return true;
    }

    issueAlphaBravoOrderV69(order) {
      if (!this.isAlphaBravoMissionV69() || !this.alphaBravoV69 || !ALPHA_BRAVO_ORDERS_V69.includes(order)) return false;
      const teams = this.alphaBravoSelectedTeamsV69();
      if (!teams.length) return false;
      if (order === 'move' && teams.some((teamId) => !this.alphaBravoV69.pings[teamId])) {
        this.beginAlphaBravoPingV69();
        return false;
      }
      for (const teamId of teams) {
        const team = this.alphaBravoV69.teams[teamId];
        if (order === 'focus') {
          const taskId = this.alphaBravoV69.phase === 'joint-hold'
            ? 'joint-certification'
            : teamId === 'alpha' ? 'alpha-relay' : 'bravo-perimeter';
          this.reserveAlphaBravoTaskV69(teamId, taskId);
        }
        team.order = order;
        team.orderSequence += 1;
        team.lastOrderAt = Number(this.mission?.elapsed) || 0;
        this.alphaBravoV69.telemetry.ordersIssued += 1;
        this.onEvent?.({
          type: 'fireteam-order',
          operationId: ALPHA_BRAVO_OPERATION_ID_V69,
          teamId,
          order,
          sequence: team.orderSequence,
          taskId: team.reservedTask,
          ping: cloneTask(this.alphaBravoV69.pings[teamId])
        });
      }
      this.alphaBravoAwaitingPingV69 = false;
      return true;
    }

    beginAlphaBravoPingV69() {
      if (!this.isAlphaBravoMissionV69() || !this.alphaBravoV69) return false;
      this.alphaBravoAwaitingPingV69 = true;
      this.onEvent?.({ type: 'fireteam-ping-armed', operationId: ALPHA_BRAVO_OPERATION_ID_V69, teamId: this.alphaBravoV69.selectedTeam });
      return true;
    }

    cancelAlphaBravoPingV69() {
      if (!this.alphaBravoAwaitingPingV69) return false;
      this.alphaBravoAwaitingPingV69 = false;
      this.onEvent?.({ type: 'fireteam-ping-cancelled', operationId: ALPHA_BRAVO_OPERATION_ID_V69 });
      return true;
    }

    anchorAlphaBravoPingV69(source, teamId) {
      const bounds = this.alphaBravoWorldBoundsV69();
      const x = clampAlphaBravoV69(source?.x, 0, bounds.width);
      const preferredY = Number.isFinite(Number(source?.y)) ? clampAlphaBravoV69(source.y, 0, bounds.height) : null;
      const surfaceEntry = this.alphaBravoSurfaceForPointV69(x, preferredY);
      const surface = surfaceEntry?.platform;
      const anchoredX = surface
        ? clampAlphaBravoV69(x, Number(surface.x) + 8, Number(surface.x) + Number(surface.w) - 8)
        : x;
      return {
        id: `alpha-bravo-ping-${teamId}`,
        teamId,
        x: anchoredX,
        y: surface ? Number(surface.y) : clampAlphaBravoV69(preferredY ?? 704, 0, bounds.height),
        surfaceId: surface?.id || `platform-${surfaceEntry?.index ?? 'fallback'}`,
        placedAt: Number(this.mission?.elapsed) || 0
      };
    }

    placeAlphaBravoPingV69({ x, y, normalizedX, normalizedY, teamId = null } = {}) {
      if (!this.isAlphaBravoMissionV69() || !this.alphaBravoV69) return false;
      const bounds = this.alphaBravoWorldBoundsV69();
      const canvasWidth = Math.max(1, Number(this.canvas?.width) || 1280);
      const canvasHeight = Math.max(1, Number(this.canvas?.height) || 720);
      const hasNormalizedX = Number.isFinite(Number(normalizedX));
      const hasNormalizedY = Number.isFinite(Number(normalizedY));
      const worldX = hasNormalizedX
        ? (Number(this.camera?.x) || 0) + clampAlphaBravoV69(normalizedX, 0, 1) * canvasWidth
        : Number.isFinite(Number(x)) ? Number(x) : (Number(this.camera?.x) || 0) + canvasWidth / 2;
      const worldY = hasNormalizedY
        ? (Number(this.camera?.y) || 0) + clampAlphaBravoV69(normalizedY, 0, 1) * canvasHeight
        : Number.isFinite(Number(y)) ? Number(y) : (Number(this.camera?.y) || 0) + canvasHeight / 2;
      const requested = teamId && ALPHA_BRAVO_SELECTIONS_V69.includes(teamId) ? teamId : this.alphaBravoV69.selectedTeam;
      const teams = this.alphaBravoSelectedTeamsV69(requested);
      if (!teams.length) return false;
      const placed = [];
      for (const id of teams) {
        const ping = this.anchorAlphaBravoPingV69({ x: clampAlphaBravoV69(worldX, 0, bounds.width), y: clampAlphaBravoV69(worldY, 0, bounds.height) }, id);
        this.alphaBravoV69.pings[id] = ping;
        this.alphaBravoV69.telemetry.pingsPlaced += 1;
        placed.push(ping);
        this.onEvent?.({ type: 'fireteam-ping', operationId: ALPHA_BRAVO_OPERATION_ID_V69, ...ping });
      }
      this.alphaBravoAwaitingPingV69 = false;
      return requested === 'all' ? placed : placed[0];
    }

    alphaBravoMovementTargetV69(member, teamId) {
      const team = this.alphaBravoV69?.teams?.[teamId];
      if (!team) return null;
      if (team.order === 'hold') return null;
      if (team.order === 'move') return this.alphaBravoV69.pings[teamId];
      if (team.order === 'focus') return this.alphaBravoStationV69(team.reservedTask);
      const ownActors = this.alphaBravoTeamActorsV69(teamId).filter((actor) => actor?.alive && !actor.downed && actor !== member);
      const human = ownActors.find((actor) => actor === this.player || (this.coopEnabled && actor === this.coop));
      if (human) return human;
      const firstPairActor = this.alphaBravoActorForCrewIdV69(team.memberIds[0]);
      if (firstPairActor && firstPairActor !== member && firstPairActor.alive) return firstPairActor;
      const globalHuman = this.player?.alive ? this.player : this.coopEnabled && this.coop?.alive ? this.coop : null;
      return globalHuman && globalHuman !== member ? globalHuman : null;
    }

    alphaBravoIntegrateVerticalV69(member, delta) {
      if (!member || member.inVehicle) return;
      const beforeBottom = (Number(member.y) || 0) + (Number(member.h) || 0);
      member.vy = (Number(member.vy) || 0) + GRAVITY * delta;
      member.y = (Number(member.y) || 0) + member.vy * delta;
      member.grounded = false;
      if (typeof this.resolveVertical === 'function') this.resolveVertical(member, beforeBottom);
      const bounds = this.alphaBravoWorldBoundsV69();
      member.y = clampAlphaBravoV69(member.y, -Math.max(1, Number(member.h) || 1), bounds.height + 100);
    }

    alphaBravoMoveMemberV69(member, target, teamId, delta) {
      const individual = crewMovementV85(member);
      const frame = finiteDelta(delta);
      const team = this.alphaBravoV69.teams[teamId];
      if (!target) {
        member.vx = (Number(member.vx) || 0) * Math.max(0, 1 - frame * 13);
        member.climbing = false;
        this.alphaBravoIntegrateVerticalV69(member, frame);
        return false;
      }
      const memberIndex = Math.max(0, team.memberIds.indexOf(actorCrewId(member)));
      const targetCenter = (Number(target.x) || 0) + (Number(target.w) || 0) / 2;
      const targetBottom = (Number(target.y) || 0) + (Number(target.h) || 0);
      const pairOffset = (memberIndex ? 1 : -1) * (target.taskId ? 44 : 64);
      const desiredX = targetCenter + pairOffset - (Number(member.w) || 40) / 2;
      const gapX = desiredX - (Number(member.x) || 0);
      const gapY = targetBottom - ((Number(member.y) || 0) + (Number(member.h) || 0));
      const ladder = typeof this.findSquadLadder === 'function' ? this.findSquadLadder(member, desiredX, targetBottom) : null;
      if (ladder && Math.abs(gapY) > 80) {
        const ladderGap = Number(ladder.x) - ((Number(member.x) || 0) + (Number(member.w) || 0) / 2);
        if (Math.abs(ladderGap) < 38) {
          member.climbing = true;
          member.x += ladderGap * Math.min(1, frame * 10);
          member.vx = 0;
          member.vy = Math.sign(gapY) * 170 * individual.climb;
          member.y = clampAlphaBravoV69(member.y + member.vy * frame, Number(ladder.top) - member.h + 8, Number(ladder.bottom) - member.h);
          member.grounded = false;
          return true;
        }
      }
      member.climbing = false;
      const performance = this.alphaBravoPerformanceV69(teamId);
      const speed = (team.order === 'rally' ? 238 : team.order === 'move' ? 220 : 202) * performance * individual.speed;
      const stopDistance = target.taskId ? 24 : 38;
      const desiredVelocity = Math.abs(gapX) > stopDistance ? Math.sign(gapX) * speed : 0;
      member.vx = (Number(member.vx) || 0) + (desiredVelocity - (Number(member.vx) || 0)) * Math.min(1, frame * (member.grounded ? 11 : 7) * individual.acceleration);
      if (Math.abs(member.vx) > 4) member.facing = Math.sign(member.vx);
      const beforeX = Number(member.x) || 0;
      const bounds = this.alphaBravoWorldBoundsV69();
      member.x = clampAlphaBravoV69(beforeX + member.vx * frame, 0, Math.max(0, bounds.width - (Number(member.w) || 40)));
      if (typeof this.resolveHorizontal === 'function') this.resolveHorizontal(member, beforeX);
      const travelled = Math.abs((Number(member.x) || 0) - beforeX);
      const blocked = travelled < Math.max(0.35, Math.abs(member.vx * frame) * 0.16) && Math.abs(gapX) > 70;
      member.stuckClock = blocked ? (Number(member.stuckClock) || 0) + frame : Math.max(0, (Number(member.stuckClock) || 0) - frame * 2);
      if (member.grounded && (member.stuckClock > 0.28 || gapY < -95)) {
        member.vy = -520 * individual.jump;
        member.grounded = false;
        member.stuckClock = 0;
      }
      this.alphaBravoIntegrateVerticalV69(member, frame);
      return true;
    }

    updateSquadMovement(member, index, leader, delta) {
      if (!this.isAlphaBravoMissionV69() || !this.alphaBravoV69) return super.updateSquadMovement(member, index, leader, delta);
      if (member === this.player || member === this.coop) return false;
      const teamId = this.alphaBravoTeamForActorV69(member);
      if (!teamId) return super.updateSquadMovement(member, index, leader, delta);
      const target = this.alphaBravoMovementTargetV69(member, teamId);
      return this.alphaBravoMoveMemberV69(member, target, teamId, delta);
    }

    alphaBravoPerformanceV69(teamId) {
      const team = this.alphaBravoV69?.teams?.[teamId];
      if (!team) return 1;
      return clampAlphaBravoV69(0.72 + team.cohesion * 0.0045 - team.stress * 0.003, 0.58, 1.22);
    }

    alphaBravoIncomingDamageScaleV69(actor) {
      const team = this.alphaBravoV69?.teams?.[this.alphaBravoTeamForActorV69(actor)];
      if (!team) return 1;
      return clampAlphaBravoV69(1.1 - team.cohesion * 0.003 + team.stress * 0.0025, 0.82, 1.35);
    }

    updateSquadCombat(member) {
      if (!this.isAlphaBravoMissionV69() || !this.alphaBravoV69) return super.updateSquadCombat(member);
      const teamId = this.alphaBravoTeamForActorV69(member);
      if (!teamId) return super.updateSquadCombat(member);
      const multiplier = this.alphaBravoPerformanceV69(teamId);
      const previousCommand = Number(this.squadCommandMultiplier) || 1;
      const bulletCount = asList(this.bullets).length;
      this.squadCommandMultiplier = previousCommand * multiplier;
      try {
        const fired = super.updateSquadCombat(member);
        if (fired) {
          for (const bullet of asList(this.bullets).slice(bulletCount)) {
            if (bullet?.owner === member) bullet.damage = Math.max(1, (Number(bullet.damage) || 1) * multiplier);
          }
        }
        return fired;
      } finally {
        this.squadCommandMultiplier = previousCommand;
      }
    }

    recordAlphaBravoDamageV69(actor, damage) {
      if (!this.alphaBravoV69 || damage <= 0) return;
      const crewId = actorCrewId(actor);
      const member = this.alphaBravoV69.crewState.find((entry) => entry.crewId === crewId);
      const teamId = member?.fireteamId;
      const team = teamId ? this.alphaBravoV69.teams[teamId] : null;
      if (!member || !team) return;
      member.damageTaken = clampAlphaBravoV69(member.damageTaken + damage, 0, 100000);
      member.stress = clampAlphaBravoV69(member.stress + damage * 0.34, 0, 100);
      team.stress = clampAlphaBravoV69(team.stress + damage * 0.22, 0, 100);
      team.cohesion = clampAlphaBravoV69(team.cohesion - damage * 0.08, 0, 100);
      this.alphaBravoV69.telemetry.damageEvents += 1;
      const ratio = clampAlphaBravoV69((Number(actor.health) || 0) / Math.max(1, Number(actor.maxHealth) || 100), 0, 1);
      const injuries = [];
      if (ratio <= 0.7) injuries.push('impact-trauma');
      if (ratio <= 0.4) injuries.push('critical-trauma');
      if (actor.downed || actor.alive === false || ratio === 0) injuries.push('incapacitated');
      for (const injury of injuries) {
        if (member.injuries.includes(injury)) continue;
        member.injuries.push(injury);
        this.onEvent?.({ type: 'fireteam-injury', operationId: ALPHA_BRAVO_OPERATION_ID_V69, teamId, crewId, injury });
      }
    }

    damageSquadMember(member, amount, options = {}) {
      if (!this.isAlphaBravoMissionV69() || !this.alphaBravoV69) return super.damageSquadMember(member, amount, options);
      const before = Number(member?.health) || 0;
      const result = super.damageSquadMember(member, (Number(amount) || 0) * this.alphaBravoIncomingDamageScaleV69(member), options);
      this.recordAlphaBravoDamageV69(member, Math.max(0, before - (Number(member?.health) || 0)));
      return result;
    }

    damagePlayer(actor, amount, options = {}) {
      if (!this.isAlphaBravoMissionV69() || !this.alphaBravoV69 || actor?.squadMember) return super.damagePlayer(actor, amount, options);
      const before = Number(actor?.health) || 0;
      const result = super.damagePlayer(actor, (Number(amount) || 0) * this.alphaBravoIncomingDamageScaleV69(actor), options);
      this.recordAlphaBravoDamageV69(actor, Math.max(0, before - (Number(actor?.health) || 0)));
      return result;
    }

    updateAlphaBravoTeamMetricsV69(delta) {
      if (!this.alphaBravoV69) return;
      const frame = finiteDelta(delta);
      for (const teamId of ALPHA_BRAVO_TEAM_IDS_V69) {
        const team = this.alphaBravoV69.teams[teamId];
        const actors = this.alphaBravoTeamActorsV69(teamId);
        const living = actors.filter((actor) => actor?.alive && !actor.downed);
        const health = actors.length
          ? actors.reduce((sum, actor) => sum + clampAlphaBravoV69((Number(actor.health) || 0) / Math.max(1, Number(actor.maxHealth) || 100), 0, 1), 0) / actors.length
          : 0;
        const pairDistance = living.length === 2 ? distance(living[0], living[1]) : 1200;
        const pressure = asList(this.enemies).filter((enemy) => enemy?.alive && enemy?.alert && living.some((actor) => distance(actor, enemy) <= 620)).length;
        const incapacitated = actors.filter((actor) => !actor?.alive || actor?.downed).length;
        const separated = pairDistance > 520;
        const completedTask = this.alphaBravoV69.tasks.some((task) => task.complete && task.fireteamId === teamId);
        const targetStress = clampAlphaBravoV69(8 + (1 - health) * 54 + pressure * 8 + incapacitated * 25 + (separated ? 22 : 0), 0, 100);
        const distancePenalty = pairDistance <= 210 ? 0 : pairDistance <= 520 ? (pairDistance - 210) * 0.07 : 32;
        const injuryCount = this.alphaBravoV69.crewState.filter((entry) => entry.fireteamId === teamId).reduce((sum, entry) => sum + entry.injuries.length, 0);
        const targetCohesion = clampAlphaBravoV69(86 - distancePenalty - targetStress * 0.17 - incapacitated * 22 - injuryCount * 3 + (completedTask ? 7 : 0), 0, 100);
        const stressRate = targetStress > team.stress ? 0.72 : 0.12;
        const cohesionRate = targetCohesion > team.cohesion ? 0.16 : 0.5;
        team.stress = clampAlphaBravoV69(team.stress + (targetStress - team.stress) * Math.min(1, frame * stressRate), 0, 100);
        team.cohesion = clampAlphaBravoV69(team.cohesion + (targetCohesion - team.cohesion) * Math.min(1, frame * cohesionRate), 0, 100);
        if (separated) this.alphaBravoV69.telemetry.secondsSeparated += frame;
        else if (living.length === 2) this.alphaBravoV69.telemetry.secondsTogether += frame;
        for (const member of this.alphaBravoV69.crewState.filter((entry) => entry.fireteamId === teamId)) {
          member.stress = clampAlphaBravoV69(member.stress + (team.stress - member.stress) * Math.min(1, frame * 0.22), 0, 100);
        }
        const bucket = `${Math.round(team.cohesion / 10)}:${Math.round(team.stress / 10)}`;
        if (this.alphaBravoMetricBucketsV69.get(teamId) !== bucket) {
          this.alphaBravoMetricBucketsV69.set(teamId, bucket);
          this.onEvent?.({ type: 'fireteam-cohesion', operationId: ALPHA_BRAVO_OPERATION_ID_V69, teamId, cohesion: Math.round(team.cohesion), stress: Math.round(team.stress) });
        }
      }
    }

    alphaBravoTaskReadyActorsV69(task) {
      const station = this.alphaBravoStationV69(task?.id);
      if (!station || !task) return [];
      const requiredTeams = task.fireteamId === 'joint' ? ALPHA_BRAVO_TEAM_IDS_V69 : [task.fireteamId];
      const result = [];
      const radius = task.fireteamId === 'joint' ? JOINT_TASK_RADIUS : SPLIT_TASK_RADIUS;
      for (const teamId of requiredTeams) {
        const actors = this.alphaBravoTeamActorsV69(teamId);
        if (actors.length !== 2 || actors.some((actor) => !actor.alive || actor.downed || actor.inVehicle || distance(actor, station) > radius)) return [];
        result.push(...actors);
      }
      return result;
    }

    completeAlphaBravoTaskV69(task) {
      if (!task || task.complete) return false;
      task.progress = 1;
      task.complete = true;
      task.completedAt = Number(this.mission?.elapsed) || 0;
      this.alphaBravoV69.telemetry.tasksCompleted += 1;
      this.onEvent?.({
        type: 'fireteam-task-complete',
        operationId: ALPHA_BRAVO_OPERATION_ID_V69,
        taskId: task.id,
        teamId: task.fireteamId,
        completedAt: task.completedAt
      });
      const phase = deriveAlphaBravoPhaseV69(this.alphaBravoV69.tasks);
      if (phase === 'joint-hold') {
        const joint = this.alphaBravoTaskStateV69('joint-certification');
        joint.available = true;
        joint.reservedBy = 'joint';
        for (const teamId of ALPHA_BRAVO_TEAM_IDS_V69) {
          const team = this.alphaBravoV69.teams[teamId];
          team.reservedTask = joint.id;
          team.order = 'focus';
          team.orderSequence += 1;
        }
        this.onEvent?.({ type: 'fireteam-joint-hold', operationId: ALPHA_BRAVO_OPERATION_ID_V69, taskId: joint.id });
      }
      this.alphaBravoV69.phase = phase;
      if (phase === 'certified') {
        this.alphaBravoV69.certified = true;
        this.alphaBravoV69.completedAt = Number(this.mission?.elapsed) || 0;
        if (this.mission?.objectives) this.mission.objectives.alphaBravo = true;
        const certificate = this.buildAlphaBravoResolutionPayloadV69();
        this.onEvent?.({ type: 'fireteam-certified', operationId: ALPHA_BRAVO_OPERATION_ID_V69, certificate });
      }
      return true;
    }

    updateAlphaBravoTasksV69(delta) {
      if (!this.alphaBravoV69 || this.alphaBravoV69.certified) return;
      const frame = finiteDelta(delta);
      for (const task of this.alphaBravoV69.tasks) {
        if (task.complete || !task.available || !task.reservedBy) continue;
        const definition = taskDefinition(task.id);
        const orderedTeams = task.fireteamId === 'joint' ? ALPHA_BRAVO_TEAM_IDS_V69 : [task.fireteamId];
        if (orderedTeams.some((teamId) => !['focus', 'hold'].includes(this.alphaBravoV69.teams[teamId].order))) continue;
        const ready = this.alphaBravoTaskReadyActorsV69(task);
        const expectedCount = task.fireteamId === 'joint' ? 4 : 2;
        if (ready.length !== expectedCount) continue;
        const efficiency = orderedTeams.reduce((sum, teamId) => sum + this.alphaBravoPerformanceV69(teamId), 0) / orderedTeams.length;
        task.progress = clampAlphaBravoV69(task.progress + frame * efficiency / definition.duration, 0, 1);
        const progressPercent = Math.round(task.progress * 100);
        const progressBucket = Math.floor(progressPercent / 10);
        if (task.progress < 1 && this.alphaBravoTaskProgressBucketsV69.get(task.id) !== progressBucket) {
          this.alphaBravoTaskProgressBucketsV69.set(task.id, progressBucket);
          this.onEvent?.({
            type: 'fireteam-task-progress',
            operationId: ALPHA_BRAVO_OPERATION_ID_V69,
            taskId: task.id,
            teamId: task.fireteamId,
            progress: Math.round(task.progress * 1000) / 1000,
            progressPercent
          });
        }
        for (const actor of ready) {
          actor.workClock = Math.max(Number(actor.workClock) || 0, 0.24);
          actor.vx = (Number(actor.vx) || 0) * 0.35;
        }
        if (task.progress >= 1) this.completeAlphaBravoTaskV69(task);
      }
    }

    update(delta) {
      const result = super.update(delta);
      if (this.isAlphaBravoMissionV69() && this.alphaBravoV69 && this.mission?.state === 'active') {
        this.syncAlphaBravoActorsV69();
        this.updateAlphaBravoTeamMetricsV69(delta);
        this.updateAlphaBravoTasksV69(delta);
      }
      return result;
    }

    setCoop(enabled) {
      const previous = Boolean(this.coopEnabled);
      const result = super.setCoop(enabled);
      if (this.isAlphaBravoMissionV69() && this.alphaBravoV69) {
        this.syncAlphaBravoActorsV69();
        if (previous !== Boolean(this.coopEnabled)) this.onEvent?.({
          type: 'fireteam-hot-join',
          operationId: ALPHA_BRAVO_OPERATION_ID_V69,
          enabled: Boolean(this.coopEnabled),
          crewId: actorCrewId(this.coop),
          humanControlled: Boolean(this.coopEnabled)
        });
      }
      return result;
    }

    alphaBravoNearestStationV69(actor, { includeComplete = false } = {}) {
      if (!actor || !this.alphaBravoV69) return null;
      return asList(this.alphaBravoStationActorsV69)
        .map((station) => ({ station, task: this.alphaBravoTaskStateV69(station.taskId), distance: distance(actor, station) }))
        .filter((entry) => entry.distance <= 170 && entry.task?.available && (includeComplete || !entry.task.complete))
        .sort((left, right) => left.distance - right.distance)[0] || null;
    }

    interact(actor = this.player) {
      if (!this.isAlphaBravoMissionV69() || !this.alphaBravoV69) return super.interact(actor);
      const nearby = this.alphaBravoNearestStationV69(actor);
      if (!nearby) return super.interact(actor);
      if (this.isIndependentAlphaBravoCommanderV84(actor)) {
        if (!this.running || this.paused || !actor.alive || actor.downed) return false;
        const teams = this.alphaBravoCommandTeamsForTaskV84(nearby.task);
        if (!teams.length) {
          this.onEvent?.({ type: 'fireteam-task-denied', operationId: ALPHA_BRAVO_OPERATION_ID_V69,
            taskId: nearby.task.id, teamId: this.alphaBravoV69.selectedTeam, reservedFor: nearby.task.fireteamId });
          return false;
        }
        let ordered = false;
        for (const teamId of teams) {
          if (!this.reserveAlphaBravoTaskV69(teamId, nearby.task.id)) continue;
          const team = this.alphaBravoV69.teams[teamId];
          team.order = 'focus';
          team.reservedTask = nearby.task.id;
          team.orderSequence += 1;
          team.lastOrderAt = Number(this.mission?.elapsed) || 0;
          this.alphaBravoV69.telemetry.ordersIssued += 1;
          this.onEvent?.({ type: 'fireteam-order', operationId: ALPHA_BRAVO_OPERATION_ID_V69,
            teamId, order: 'focus', sequence: team.orderSequence, taskId: nearby.task.id,
            issuedBy: this.playerIdentityV84.id });
          ordered = true;
        }
        // A command is not a task participant: only the two/four real Marines
        // can advance the existing physical task and certification contracts.
        if (ordered) actor.workClock = Math.max(Number(actor.workClock) || 0, 0.32);
        return ordered;
      }
      const teamId = this.alphaBravoTeamForActorV69(actor);
      if (!teamId) return false;
      const { task } = nearby;
      if (task.fireteamId !== teamId && task.fireteamId !== 'joint') {
        this.onEvent?.({ type: 'fireteam-task-denied', operationId: ALPHA_BRAVO_OPERATION_ID_V69, taskId: task.id, teamId, reservedFor: task.fireteamId });
        return false;
      }
      if (!this.reserveAlphaBravoTaskV69(teamId, task.id)) {
        if (task.reservedBy !== teamId && task.reservedBy !== 'joint') return false;
      }
      this.alphaBravoV69.teams[teamId].order = 'focus';
      this.alphaBravoV69.teams[teamId].reservedTask = task.id;
      actor.workClock = Math.max(Number(actor.workClock) || 0, 0.32);
      return true;
    }

    getInteractionPrompt(actor = this.player) {
      if (!this.isAlphaBravoMissionV69() || !this.alphaBravoV69) return super.getInteractionPrompt(actor);
      const nearby = this.alphaBravoNearestStationV69(actor);
      if (!nearby) return super.getInteractionPrompt(actor);
      if (this.isIndependentAlphaBravoCommanderV84(actor)) {
        const { task } = nearby;
        const teams = this.alphaBravoCommandTeamsForTaskV84(task);
        if (!teams.length) return `SÉLECTIONNEZ LE BINÔME ${task.fireteamId.toUpperCase()}`;
        const ready = this.alphaBravoTaskReadyActorsV69(task).length;
        const expected = task.fireteamId === 'joint' ? 4 : 2;
        return `E  ORDONNER ${teams.join(' / ').toUpperCase()} · MARINES EN POSITION ${ready}/${expected}`;
      }
      const teamId = this.alphaBravoTeamForActorV69(actor);
      const task = nearby.task;
      if (task.fireteamId !== 'joint' && task.fireteamId !== teamId) return `RÉSERVÉ AU BINÔME ${task.fireteamId.toUpperCase()}`;
      if (!task.reservedBy) return `E  RÉSERVER — ${taskDefinition(task.id)?.label || task.id}`;
      const ready = this.alphaBravoTaskReadyActorsV69(task).length;
      const expected = task.fireteamId === 'joint' ? 4 : 2;
      return ready === expected
        ? `MAINTENIR LA POSITION · ${Math.round(task.progress * 100)}%`
        : `E  RALLIER LE BINÔME · ${ready}/${expected}`;
    }

    missingAlphaBravoRequirementV69() {
      if (!this.alphaBravoV69) return 'DOCTRINE ALPHA / BRAVO NON INITIALISÉE';
      if (!alphaBravoStateIsOperationalV69(this.alphaBravoV69)) return `DÉPLOIEMENT INCOMPLET · ${this.alphaBravoCrewIdsV69().length}/4 OPÉRATEURS`;
      const alpha = this.alphaBravoTaskStateV69('alpha-relay');
      const bravo = this.alphaBravoTaskStateV69('bravo-perimeter');
      const joint = this.alphaBravoTaskStateV69('joint-certification');
      if (!alpha?.complete) return `RELAIS ALPHA ${Math.round((alpha?.progress || 0) * 100)}%`;
      if (!bravo?.complete) return `PÉRIMÈTRE BRAVO ${Math.round((bravo?.progress || 0) * 100)}%`;
      if (!joint?.complete || !this.alphaBravoV69.certified) return `CERTIFICATION CONJOINTE ${Math.round((joint?.progress || 0) * 100)}%`;
      return null;
    }

    missingExtractionRequirement() {
      const inherited = super.missingExtractionRequirement();
      if (!this.isAlphaBravoMissionV69()) return inherited;
      return this.missingAlphaBravoRequirementV69() || inherited;
    }

    phaseLabel() {
      if (!this.isAlphaBravoMissionV69() || !this.alphaBravoV69) return super.phaseLabel();
      if (this.alphaBravoV69.phase === 'joint-hold') return 'TENIR LA BORNE DE CERTIFICATION';
      if (this.alphaBravoV69.phase === 'certified') return 'EXTRAIRE LES DEUX BINÔMES';
      return 'SÉCURISER LES POSTES ALPHA / BRAVO';
    }

    objectiveProgressText() {
      if (!this.isAlphaBravoMissionV69() || !this.alphaBravoV69) return super.objectiveProgressText();
      const tasks = this.alphaBravoV69.tasks;
      return tasks.map((task) => `${taskDefinition(task.id)?.shortLabel || task.id} ${Math.round(task.progress * 100)}%`).join(' · ');
    }

    buildAlphaBravoResolutionPayloadV69() {
      return buildAlphaBravoResolutionPayloadV69(this.alphaBravoV69, this.alphaBravoAllActorsV69(), {
        deploymentOperationId: this.alphaBravoDeploymentOperationIdV69
      });
    }

    completeMission(actor = this.player) {
      if (!this.isAlphaBravoMissionV69()) return super.completeMission(actor);
      if (this.missingAlphaBravoRequirementV69()) return false;
      const payload = this.buildAlphaBravoResolutionPayloadV69();
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
      if (this.mission) this.mission.rewards = {
        ...(isRecord(this.mission.rewards) ? this.mission.rewards : {}),
        alphaBravoDoctrine: payload
      };
      emit?.(completionEvent
        ? { ...completionEvent, rewards: this.mission?.rewards }
        : {
            type: 'mission-complete',
            rewards: this.mission?.rewards,
            objectiveId: this.objectiveRuntime?.id || ALPHA_BRAVO_OPERATION_ID_V69,
            extractedBy: actor?.coop ? 'coop' : 'primary'
          });
      return true;
    }

    alphaBravoTaskVisualStateV69(task) {
      if (task.complete) return 'complete';
      if (!task.reservedBy) return 'idle';
      if (this.alphaBravoTaskReadyActorsV69(task).length === (task.fireteamId === 'joint' ? 4 : 2)) return 'working';
      return 'reserved';
    }

    drawAlphaBravoStationFallbackV69(ctx, station, task) {
      const teamColor = station.fireteamId === 'alpha' ? '#6fdb9a' : station.fireteamId === 'bravo' ? '#e6b75c' : '#8fd3c7';
      const state = this.alphaBravoTaskVisualStateV69(task);
      ctx.save();
      ctx.fillStyle = '#192421';
      ctx.strokeStyle = teamColor;
      ctx.lineWidth = 2;
      ctx.fillRect(station.x, station.y + 8, station.w, station.h - 8);
      ctx.strokeRect(station.x + 1, station.y + 9, station.w - 2, station.h - 10);
      ctx.fillStyle = state === 'complete' ? teamColor : '#263c36';
      ctx.fillRect(station.x + 12, station.y + 19, station.w - 24, 24);
      ctx.strokeStyle = '#aec9bd';
      ctx.beginPath();
      ctx.moveTo(station.x + 17, station.y + 52);
      ctx.lineTo(station.x + station.w - 17, station.y + 52);
      ctx.stroke();
      ctx.fillStyle = '#0d1513';
      ctx.fillRect(station.x + 8, station.y + station.h - 10, station.w - 16, 4);
      ctx.fillStyle = teamColor;
      ctx.fillRect(station.x + 8, station.y + station.h - 10, (station.w - 16) * task.progress, 4);
      ctx.restore();
    }

    drawAlphaBravoStationV69(ctx, station) {
      const task = this.alphaBravoTaskStateV69(station.taskId);
      if (!ctx || !task) return false;
      const image = this.images?.get(ALPHA_BRAVO_CONSOLE_SHEET_V69.imageKey);
      const ready = Boolean(image?.complete && (image.naturalWidth || image.width) > 0 && (image.naturalHeight || image.height) > 0);
      let renderedFromAtlas = false;
      if (ready) {
        const state = this.alphaBravoTaskVisualStateV69(task);
        const teamRows = station.fireteamId === 'joint' ? ALPHA_BRAVO_TEAM_IDS_V69 : [station.fireteamId];
        const cells = teamRows.map((teamId) => resolveAlphaBravoConsoleCellV69(teamId, state));
        const sw = (image.naturalWidth || image.width) / ALPHA_BRAVO_CONSOLE_SHEET_V69.columns;
        const sh = (image.naturalHeight || image.height) / ALPHA_BRAVO_CONSOLE_SHEET_V69.rows;
        if (cells.every(Boolean)) {
          const ratio = Math.min((station.w + 24) / (sw * cells.length), (station.h + 20) / sh);
          const dw = sw * ratio;
          const dh = sh * ratio;
          const startX = station.x + station.w / 2 - (dw * cells.length) / 2;
          cells.forEach((cell, index) => {
            ctx.drawImage(image, cell.column * sw, cell.row * sh, sw, sh, startX + dw * index, station.groundY - dh, dw, dh);
          });
          renderedFromAtlas = true;
        }
      }
      if (!renderedFromAtlas) this.drawAlphaBravoStationFallbackV69(ctx, station, task);
      const color = task.complete ? '#7ce4a0' : station.fireteamId === 'bravo' ? '#e6b75c' : '#73d5ad';
      const pulse = this.accessibilityRuntime?.reducedMotion ? 0 : Math.sin((Number(this.animationTime) || 0) * 4 + station.x * 0.01) * 2;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.88;
      ctx.beginPath();
      ctx.moveTo(station.x + station.w / 2, station.y - 14 - pulse);
      ctx.lineTo(station.x + station.w / 2 + 7, station.y - 7 - pulse);
      ctx.lineTo(station.x + station.w / 2, station.y - pulse);
      ctx.lineTo(station.x + station.w / 2 - 7, station.y - 7 - pulse);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return true;
    }

    drawAlphaBravoPingV69(ctx, ping) {
      if (!ctx || !ping) return false;
      const color = ping.teamId === 'alpha' ? '#68e0a0' : '#f1bd5e';
      const pulse = this.accessibilityRuntime?.reducedMotion ? 0 : Math.sin((Number(this.animationTime) || 0) * 5.4) * 4;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.72;
      ctx.beginPath();
      ctx.moveTo(ping.x, ping.y - 82 - pulse);
      ctx.lineTo(ping.x, ping.y - 10);
      ctx.stroke();
      ctx.translate(ping.x, ping.y - 88 - pulse);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-7, -7, 14, 14);
      ctx.strokeRect(-12, -12, 24, 24);
      ctx.restore();
      return true;
    }

    drawWorld(ctx) {
      super.drawWorld(ctx);
      if (!this.isAlphaBravoMissionV69() || !this.alphaBravoV69 || !ctx) return;
      for (const station of this.alphaBravoStationActorsV69) this.drawAlphaBravoStationV69(ctx, station);
      for (const teamId of ALPHA_BRAVO_TEAM_IDS_V69) this.drawAlphaBravoPingV69(ctx, this.alphaBravoV69.pings[teamId]);
    }

    drawHud(ctx) {
      super.drawHud(ctx);
      if (!this.isAlphaBravoMissionV69() || !this.alphaBravoV69 || !ctx) return;
      const state = this.alphaBravoV69;
      const x = 902;
      const y = 160;
      const width = 360;
      ctx.save();
      ctx.fillStyle = 'rgba(3, 10, 8, .91)';
      ctx.strokeStyle = state.certified ? '#76d9a0' : '#8abdae';
      ctx.lineWidth = 1;
      ctx.fillRect(x, y, width, 148);
      ctx.strokeRect(x + 0.5, y + 0.5, width - 1, 147);
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#d9cf99';
      ctx.fillText('DOCTRINE ALPHA / BRAVO', x + 12, y + 18);
      for (const [index, teamId] of ALPHA_BRAVO_TEAM_IDS_V69.entries()) {
        const team = state.teams[teamId];
        const rowY = y + 40 + index * 34;
        ctx.fillStyle = teamId === 'alpha' ? '#77dda5' : '#e9b960';
        ctx.fillText(`${teamId.toUpperCase()} · ${team.order.toUpperCase()}`, x + 12, rowY);
        ctx.fillStyle = '#c5d2ca';
        ctx.fillText(`C ${Math.round(team.cohesion)}  S ${Math.round(team.stress)}`, x + 220, rowY);
        ctx.fillStyle = '#1d2d27';
        ctx.fillRect(x + 12, rowY + 7, 326, 4);
        ctx.fillStyle = teamId === 'alpha' ? '#6dcc99' : '#d9aa54';
        ctx.fillRect(x + 12, rowY + 7, 326 * clampAlphaBravoV69(team.cohesion / 100, 0, 1), 4);
      }
      const activeTask = state.tasks.find((task) => !task.complete && task.available) || state.tasks.at(-1);
      ctx.fillStyle = '#becbc3';
      ctx.fillText(`${taskDefinition(activeTask.id)?.shortLabel || activeTask.id} · ${Math.round(activeTask.progress * 100)}%`, x + 12, y + 114);
      ctx.fillStyle = '#22342d';
      ctx.fillRect(x + 12, y + 124, 326, 6);
      ctx.fillStyle = state.certified ? '#7de2a4' : '#72c7ac';
      ctx.fillRect(x + 12, y + 124, 326 * activeTask.progress, 6);
      ctx.fillStyle = '#93a89d';
      ctx.font = '10px monospace';
      ctx.fillText(this.alphaBravoAwaitingPingV69 ? 'PING ARMÉ · CLIQUEZ DANS LE MONDE' : '1/2/3 GROUPES · C PING · B/N/M ORDRES', x + 12, y + 143);
      ctx.restore();
    }

    captureResumeState() {
      const base = super.captureResumeState();
      if (!this.isAlphaBravoMissionV69() || !this.alphaBravoV69) return base;
      const normalized = this.normalizeAlphaBravoStateV69(this.alphaBravoV69);
      normalized.deploymentOperationId = this.alphaBravoDeploymentOperationIdV69;
      return {
        ...base,
        specialOperation: {
          ...(isRecord(base?.specialOperation) ? base.specialOperation : {}),
          operationId: ALPHA_BRAVO_OPERATION_ID_V69,
          alphaBravoV69: normalized
        }
      };
    }

    applyResumeState(rawState) {
      const source = rawState?.specialOperation?.alphaBravoV69 || rawState?.alphaBravoV69;
      const result = super.applyResumeState(rawState);
      if (!this.isAlphaBravoMissionV69() || !result?.applied || !isRecord(source)) return result;
      if (Number(source.schema) !== ALPHA_BRAVO_SCHEMA_V69) return { ...result, alphaBravoRestoredV69: false, alphaBravoReasonV69: 'schema-mismatch' };
      if (source.deploymentOperationId && source.deploymentOperationId !== this.alphaBravoDeploymentOperationIdV69) {
        return { ...result, alphaBravoRestoredV69: false, alphaBravoReasonV69: 'deployment-mismatch' };
      }
      this.alphaBravoPendingResumeV69 = source;
      if (this.alphaBravoConfiguredV69) {
        this.alphaBravoV69 = this.normalizeAlphaBravoStateV69(source);
        this.configureAlphaBravoWorldV69();
        this.syncAlphaBravoActorsV69();
      }
      return { ...result, restored: (Number(result.restored) || 0) + 1, specialOperationRestored: true, alphaBravoRestoredV69: true };
    }

    getAlphaBravoUiStateV69() {
      if (!this.isAlphaBravoMissionV69() || !this.alphaBravoV69) return { active: false };
      const state = this.alphaBravoV69;
      return {
        active: true,
        schema: ALPHA_BRAVO_SCHEMA_V69,
        phase: state.phase,
        certified: state.certified,
        score: alphaBravoScoreV69(state),
        selectedTeam: state.selectedTeam,
        ...(this.isIndependentAlphaBravoCommanderV84() ? { commanderV84: {
          id: this.playerIdentityV84.id, name: this.playerIdentityV84.name,
          callsign: this.playerIdentityV84.callsign, role: 'independent-commander',
          countsTowardCertification: false
        } } : {}),
        awaitingPing: Boolean(this.alphaBravoAwaitingPingV69),
        extractionBlocked: Boolean(this.missingAlphaBravoRequirementV69()),
        prompt: this.missingAlphaBravoRequirementV69() || 'CERTIFICATION ACQUISE · EXTRACTION DISPONIBLE',
        teams: ALPHA_BRAVO_TEAM_IDS_V69.map((id) => {
          const team = state.teams[id];
          return {
            id,
            label: `BINÔME ${id.toUpperCase()}`,
            members: team.memberIds.map((crewId) => {
              const actor = this.alphaBravoActorForCrewIdV69(crewId);
              const crew = state.crewState.find((entry) => entry.crewId === crewId);
              return {
                crewId,
                name: actor?.name || asList(this.crewRuntime).find((entry) => entry.id === crewId)?.name || crewId,
                alive: Boolean(actor?.alive && !actor?.downed),
                human: actor === this.player || Boolean(this.coopEnabled && actor === this.coop),
                health: Math.round(clampAlphaBravoV69(actor?.health, 0, actor?.maxHealth || 100)),
                stress: Math.round(crew?.stress || 0),
                injuries: [...asList(crew?.injuries)]
              };
            }),
            order: team.order,
            cohesion: Math.round(team.cohesion),
            stress: Math.round(team.stress),
            reservedTask: team.reservedTask,
            ping: cloneTask(state.pings[id])
          };
        }),
        tasks: state.tasks.map((task) => {
          const station = this.alphaBravoStationV69(task.id);
          const readyActors = this.alphaBravoTaskReadyActorsV69(task);
          return {
            ...task,
            label: taskDefinition(task.id)?.label || task.id,
            progressPercent: Math.round(task.progress * 100),
            physical: station ? { x: Math.round(station.x), y: Math.round(station.y), w: station.w, h: station.h, surfaceId: station.surfaceIdV69 } : null,
            nearbyMemberIds: readyActors.map(actorCrewId)
          };
        }),
        pings: {
          alpha: cloneTask(state.pings.alpha),
          bravo: cloneTask(state.pings.bravo)
        },
        controls: {
          teams: [...ALPHA_BRAVO_SELECTIONS_V69],
          orders: [...ALPHA_BRAVO_ORDERS_V69],
          pingAvailable: true,
          cancelPingAvailable: Boolean(this.alphaBravoAwaitingPingV69)
        }
      };
    }

    getAlphaBravoSnapshotV69() {
      if (!this.isAlphaBravoMissionV69() || !this.alphaBravoV69) return {};
      const state = this.normalizeAlphaBravoStateV69(this.alphaBravoV69);
      return {
        alphaBravoV69: {
          ...state,
          operational: alphaBravoStateIsOperationalV69(state),
          extractionBlocked: Boolean(this.missingAlphaBravoRequirementV69()),
          score: alphaBravoScoreV69(state),
          physicalStations: this.alphaBravoStationActorsV69.map((station) => ({ ...station }))
        }
      };
    }

    getGameplayReport() {
      const report = super.getGameplayReport();
      return this.isAlphaBravoMissionV69()
        ? { ...report, alphaBravoDoctrine: this.getAlphaBravoSnapshotV69().alphaBravoV69 }
        : report;
    }

    getSnapshot() {
      return { ...super.getSnapshot(), ...this.getAlphaBravoSnapshotV69() };
    }
  };
}
