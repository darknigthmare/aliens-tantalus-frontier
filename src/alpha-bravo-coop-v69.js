export const ALPHA_BRAVO_SCHEMA_V69 = 69;
export const ALPHA_BRAVO_OPERATION_ID_V69 = 'alpha-bravo-coop';
export const ALPHA_BRAVO_CAMPAIGN_ID_V69 = 'special-alpha-bravo-doctrine';

export const ALPHA_BRAVO_TEAM_IDS_V69 = Object.freeze(['alpha', 'bravo']);
export const ALPHA_BRAVO_SELECTIONS_V69 = Object.freeze(['alpha', 'bravo', 'all']);
export const ALPHA_BRAVO_ORDERS_V69 = Object.freeze(['follow', 'move', 'hold', 'focus', 'rally']);

export const ALPHA_BRAVO_TASK_DEFINITIONS_V69 = Object.freeze([
  Object.freeze({
    id: 'alpha-relay',
    fireteamId: 'alpha',
    label: 'RELAIS TACTIQUE ALPHA',
    shortLabel: 'RELAIS',
    phase: 'split-objectives',
    duration: 4.5,
    normalizedX: 0.3
  }),
  Object.freeze({
    id: 'bravo-perimeter',
    fireteamId: 'bravo',
    label: 'PÉRIMÈTRE BRAVO',
    shortLabel: 'PÉRIMÈTRE',
    phase: 'split-objectives',
    duration: 4.5,
    normalizedX: 0.62
  }),
  Object.freeze({
    id: 'joint-certification',
    fireteamId: 'joint',
    label: 'BORNE DE CERTIFICATION CONJOINTE',
    shortLabel: 'CERTIFICATION',
    phase: 'joint-hold',
    duration: 6,
    normalizedX: 0.84
  })
]);

export const ALPHA_BRAVO_CAMPAIGN_V69 = Object.freeze({
  id: ALPHA_BRAVO_CAMPAIGN_ID_V69,
  name: 'DOCTRINE ALPHA / BRAVO',
  pairId: null,
  mode: 'FRONTIER',
  worldId: 'world-05-lethe',
  objective: 'defend the colony',
  year: 2204,
  canon: 'project-continuity',
  routes: 5,
  templateId: 'colony-multiroute',
  source: 'Tantalus Special Operations',
  summary: 'Deux binômes accomplissent des tâches réservées avant une certification conjointe sous pression.',
  minimumCrew: 4,
  specialOperationId: ALPHA_BRAVO_OPERATION_ID_V69
});

const INJURY_IDS = Object.freeze(['impact-trauma', 'critical-trauma', 'incapacitated']);

export const clampAlphaBravoV69 = (value, min, max) => {
  const numeric = Number(value);
  return Math.max(min, Math.min(max, Number.isFinite(numeric) ? numeric : min));
};

const isRecord = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const asList = (value) => Array.isArray(value) ? value : [];
const text = (value, fallback = '', maximum = 128) => {
  const normalized = typeof value === 'string' ? value.trim() : '';
  return (normalized || fallback).slice(0, maximum);
};

function uniqueCrewIds(crewIds) {
  const result = [];
  for (const candidate of asList(crewIds)) {
    const crewId = text(typeof candidate === 'string' ? candidate : candidate?.crewId || candidate?.id, '', 96);
    if (crewId && !result.includes(crewId)) result.push(crewId);
    if (result.length === 4) break;
  }
  return result;
}

function canonicalTeamMembers(crewIds) {
  return {
    alpha: crewIds.slice(0, 2),
    bravo: crewIds.slice(2, 4)
  };
}

function crewMetricById(crewMetrics) {
  return new Map(asList(crewMetrics).map((entry) => [text(entry?.crewId || entry?.id, '', 96), entry]));
}

function initialCrewState(crewIds, metrics) {
  const teams = canonicalTeamMembers(crewIds);
  return crewIds.map((crewId) => {
    const metric = metrics.get(crewId) || {};
    const fireteamId = teams.alpha.includes(crewId) ? 'alpha' : 'bravo';
    return {
      crewId,
      fireteamId,
      stress: clampAlphaBravoV69(metric.stress, 0, 100),
      damageTaken: 0,
      injuries: []
    };
  });
}

function initialTeamState(id, memberIds, crewState) {
  const memberStress = crewState.filter((entry) => entry.fireteamId === id).map((entry) => entry.stress);
  return {
    id,
    memberIds: [...memberIds],
    order: 'follow',
    cohesion: memberIds.length === 2 ? 72 : 30,
    stress: memberStress.length ? memberStress.reduce((total, value) => total + value, 0) / memberStress.length : 0,
    reservedTask: null,
    orderSequence: 0,
    lastOrderAt: 0
  };
}

function initialTasks() {
  return ALPHA_BRAVO_TASK_DEFINITIONS_V69.map((definition) => ({
    id: definition.id,
    fireteamId: definition.fireteamId,
    progress: 0,
    complete: false,
    reservedBy: null,
    available: definition.phase === 'split-objectives',
    completedAt: null
  }));
}

export function deriveAlphaBravoPhaseV69(tasks = []) {
  const byId = new Map(asList(tasks).map((task) => [task?.id, task]));
  const splitComplete = ['alpha-relay', 'bravo-perimeter'].every((id) => Boolean(byId.get(id)?.complete));
  if (!splitComplete) return 'split-objectives';
  return byId.get('joint-certification')?.complete ? 'certified' : 'joint-hold';
}

export function createAlphaBravoStateV69({
  crewIds = [],
  crewMetrics = [],
  deploymentOperationId = ALPHA_BRAVO_OPERATION_ID_V69,
  worldWidth = 6200,
  worldHeight = 1080
} = {}) {
  const rosterIds = uniqueCrewIds(crewIds);
  const teamMembers = canonicalTeamMembers(rosterIds);
  const crewState = initialCrewState(rosterIds, crewMetricById(crewMetrics));
  return {
    schema: ALPHA_BRAVO_SCHEMA_V69,
    operationId: ALPHA_BRAVO_OPERATION_ID_V69,
    campaignId: ALPHA_BRAVO_CAMPAIGN_ID_V69,
    deploymentOperationId: text(deploymentOperationId, ALPHA_BRAVO_OPERATION_ID_V69, 128),
    selectedTeam: 'alpha',
    phase: 'split-objectives',
    certified: false,
    completedAt: null,
    worldWidth: clampAlphaBravoV69(worldWidth, 960, 20000),
    worldHeight: clampAlphaBravoV69(worldHeight, 540, 6000),
    teams: {
      alpha: initialTeamState('alpha', teamMembers.alpha, crewState),
      bravo: initialTeamState('bravo', teamMembers.bravo, crewState)
    },
    crewState,
    tasks: initialTasks(),
    pings: { alpha: null, bravo: null },
    telemetry: {
      ordersIssued: 0,
      pingsPlaced: 0,
      reservations: 0,
      tasksCompleted: 0,
      secondsTogether: 0,
      secondsSeparated: 0,
      damageEvents: 0
    }
  };
}

function sanitizePing(source, teamId, worldWidth, worldHeight) {
  if (!isRecord(source)) return null;
  const x = Number(source.x);
  const y = Number(source.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return {
    id: `alpha-bravo-ping-${teamId}`,
    teamId,
    x: clampAlphaBravoV69(x, 0, worldWidth),
    y: clampAlphaBravoV69(y, 0, worldHeight),
    surfaceId: text(source.surfaceId, '', 96) || null,
    placedAt: clampAlphaBravoV69(source.placedAt, 0, 100000000)
  };
}

function sanitizeInjuries(source) {
  return [...new Set(asList(source).map((entry) => text(entry, '', 40)).filter((entry) => INJURY_IDS.includes(entry)))];
}

function sanitizeTelemetry(source) {
  const fallback = createAlphaBravoStateV69().telemetry;
  const record = isRecord(source) ? source : {};
  return Object.fromEntries(Object.keys(fallback).map((key) => [key, clampAlphaBravoV69(record[key], 0, key.startsWith('seconds') ? 1000000 : 999999)]));
}

export function sanitizeAlphaBravoStateV69(rawState, {
  crewIds = [],
  crewMetrics = [],
  deploymentOperationId = ALPHA_BRAVO_OPERATION_ID_V69,
  worldWidth = 6200,
  worldHeight = 1080
} = {}) {
  const fallback = createAlphaBravoStateV69({ crewIds, crewMetrics, deploymentOperationId, worldWidth, worldHeight });
  if (!isRecord(rawState) || Number(rawState.schema) !== ALPHA_BRAVO_SCHEMA_V69) return fallback;
  if (rawState.campaignId && rawState.campaignId !== ALPHA_BRAVO_CAMPAIGN_ID_V69) return fallback;

  const savedCrewById = new Map(asList(rawState.crewState).map((entry) => [text(entry?.crewId, '', 96), entry]));
  fallback.crewState = fallback.crewState.map((entry) => {
    const saved = savedCrewById.get(entry.crewId) || {};
    return {
      ...entry,
      stress: clampAlphaBravoV69(saved.stress ?? entry.stress, 0, 100),
      damageTaken: clampAlphaBravoV69(saved.damageTaken, 0, 100000),
      injuries: sanitizeInjuries(saved.injuries)
    };
  });

  const rawTeams = isRecord(rawState.teams) ? rawState.teams : {};
  for (const teamId of ALPHA_BRAVO_TEAM_IDS_V69) {
    const source = isRecord(rawTeams[teamId]) ? rawTeams[teamId] : {};
    const team = fallback.teams[teamId];
    team.order = ALPHA_BRAVO_ORDERS_V69.includes(source.order) ? source.order : 'follow';
    team.cohesion = clampAlphaBravoV69(source.cohesion ?? team.cohesion, 0, 100);
    team.stress = clampAlphaBravoV69(source.stress ?? team.stress, 0, 100);
    team.orderSequence = Math.round(clampAlphaBravoV69(source.orderSequence, 0, 999999));
    team.lastOrderAt = clampAlphaBravoV69(source.lastOrderAt, 0, 100000000);
  }

  const rawTaskById = new Map(asList(rawState.tasks).map((task) => [task?.id, task]));
  fallback.tasks = fallback.tasks.map((task) => {
    const source = rawTaskById.get(task.id) || {};
    const progress = clampAlphaBravoV69(source.progress, 0, 1);
    const reservedBy = task.fireteamId === 'joint'
      ? (source.reservedBy === 'joint' ? 'joint' : null)
      : (source.reservedBy === task.fireteamId ? task.fireteamId : null);
    return {
      ...task,
      progress,
      complete: progress >= 1,
      reservedBy,
      completedAt: progress >= 1 ? clampAlphaBravoV69(source.completedAt, 0, 100000000) : null
    };
  });

  const splitComplete = fallback.tasks.slice(0, 2).every((task) => task.complete);
  const joint = fallback.tasks.find((task) => task.id === 'joint-certification');
  joint.available = splitComplete;
  if (!splitComplete) {
    joint.progress = 0;
    joint.complete = false;
    joint.reservedBy = null;
    joint.completedAt = null;
  } else if (joint.reservedBy && joint.reservedBy !== 'joint') joint.reservedBy = null;

  for (const teamId of ALPHA_BRAVO_TEAM_IDS_V69) {
    const team = fallback.teams[teamId];
    const requested = text(rawTeams[teamId]?.reservedTask, '', 96);
    const task = fallback.tasks.find((entry) => entry.id === requested && (entry.fireteamId === teamId || entry.fireteamId === 'joint'));
    team.reservedTask = task?.reservedBy === teamId || task?.reservedBy === 'joint' ? task.id : null;
  }

  fallback.phase = deriveAlphaBravoPhaseV69(fallback.tasks);
  fallback.certified = fallback.phase === 'certified';
  fallback.completedAt = fallback.certified ? clampAlphaBravoV69(rawState.completedAt, 0, 100000000) : null;
  fallback.selectedTeam = ALPHA_BRAVO_SELECTIONS_V69.includes(rawState.selectedTeam) ? rawState.selectedTeam : 'alpha';
  fallback.pings = {
    alpha: sanitizePing(rawState.pings?.alpha, 'alpha', fallback.worldWidth, fallback.worldHeight),
    bravo: sanitizePing(rawState.pings?.bravo, 'bravo', fallback.worldWidth, fallback.worldHeight)
  };
  fallback.telemetry = sanitizeTelemetry(rawState.telemetry);
  return fallback;
}

export function alphaBravoStateIsOperationalV69(state) {
  return Boolean(
    state?.schema === ALPHA_BRAVO_SCHEMA_V69
    && state?.campaignId === ALPHA_BRAVO_CAMPAIGN_ID_V69
    && state?.teams?.alpha?.memberIds?.length === 2
    && state?.teams?.bravo?.memberIds?.length === 2
    && new Set([...state.teams.alpha.memberIds, ...state.teams.bravo.memberIds]).size === 4
  );
}

export function alphaBravoScoreV69(state) {
  const teams = ALPHA_BRAVO_TEAM_IDS_V69.map((id) => state?.teams?.[id]).filter(Boolean);
  const cohesion = teams.length ? teams.reduce((sum, team) => sum + clampAlphaBravoV69(team.cohesion, 0, 100), 0) / teams.length : 0;
  const stress = teams.length ? teams.reduce((sum, team) => sum + clampAlphaBravoV69(team.stress, 0, 100), 0) / teams.length : 100;
  const injuries = asList(state?.crewState).reduce((sum, member) => sum + asList(member?.injuries).length, 0);
  const completion = asList(state?.tasks).filter((task) => task.complete).length * 8;
  return Math.round(clampAlphaBravoV69(46 + completion + cohesion * 0.38 - stress * 0.28 - injuries * 3, 0, 100));
}

export function buildAlphaBravoResolutionPayloadV69(state, crewActors = [], {
  deploymentOperationId = state?.deploymentOperationId || ALPHA_BRAVO_OPERATION_ID_V69
} = {}) {
  const actorsById = new Map(asList(crewActors).map((actor) => [text(actor?.crewId || actor?.operatorId, '', 96), actor]));
  const crewState = asList(state?.crewState);
  return {
    schema: ALPHA_BRAVO_SCHEMA_V69,
    certified: Boolean(state?.certified && deriveAlphaBravoPhaseV69(state.tasks) === 'certified'),
    operationId: text(deploymentOperationId, ALPHA_BRAVO_OPERATION_ID_V69, 128),
    campaignId: ALPHA_BRAVO_CAMPAIGN_ID_V69,
    score: alphaBravoScoreV69(state),
    tasks: ALPHA_BRAVO_TASK_DEFINITIONS_V69.map((definition) => {
      const task = asList(state?.tasks).find((entry) => entry?.id === definition.id);
      return { id: definition.id, fireteamId: definition.fireteamId, complete: Boolean(task?.complete) };
    }),
    crewResults: crewState.map((member) => {
      const actor = actorsById.get(member.crewId) || {};
      const maximum = Math.max(1, Number(actor.maxHealth) || 100);
      return {
        crewId: member.crewId,
        health: Math.round(clampAlphaBravoV69(actor.health ?? maximum, 0, maximum)),
        stress: Math.round(clampAlphaBravoV69(member.stress, 0, 100)),
        injuries: sanitizeInjuries(member.injuries)
      };
    })
  };
}
