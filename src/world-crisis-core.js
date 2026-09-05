import { WORLDS } from './content.js';
import { consumeHubEscapePodMitigationV71 } from './hub-annex-services-v71.js';

export const CRISIS_KINDS = Object.freeze(['xenomorph', 'synthetic', 'pathogen']);
export const HUB_CRISIS_ACTIONS = Object.freeze({
  resolved: 'crisis:resolved',
  playerDown: 'crisis:player-down'
});

const CRISIS_ROUTES = Object.freeze({
  xenomorph: Object.freeze([
    Object.freeze({ deck: 2, roomId: 'quarantine' }),
    Object.freeze({ deck: 2, roomId: 'vehicle-bay' }),
    Object.freeze({ deck: 3, roomId: 'dropship-hangar' }),
    Object.freeze({ deck: 1, roomId: 'science-lab' })
  ]),
  synthetic: Object.freeze([
    Object.freeze({ deck: 0, roomId: 'combat-information' }),
    Object.freeze({ deck: 0, roomId: 'bridge' }),
    Object.freeze({ deck: 3, roomId: 'sensor-array' }),
    Object.freeze({ deck: 3, roomId: 'reactor' })
  ]),
  pathogen: Object.freeze([
    Object.freeze({ deck: 1, roomId: 'medical' }),
    Object.freeze({ deck: 1, roomId: 'science-lab' }),
    Object.freeze({ deck: 2, roomId: 'quarantine' }),
    Object.freeze({ deck: 3, roomId: 'life-support' })
  ])
});

const CRISIS_EFFECTS = Object.freeze({
  xenomorph: Object.freeze({
    resolved: Object.freeze({
      systems: Object.freeze({ hull: -2, security: 5, quarantine: 6, oxygen: -2, morale: 5, power: -1 }),
      resources: Object.freeze({ credits: 180, alloy: 4, medical: -1, research: 5, pathogen: 2 }),
      stress: 3,
      moduleDamage: 3
    }),
    playerDown: Object.freeze({
      systems: Object.freeze({ hull: -10, security: -9, quarantine: -8, oxygen: -6, morale: -12, power: -3 }),
      resources: Object.freeze({ credits: -220, alloy: -5, medical: -3, pathogen: 2 }),
      stress: 18,
      injuryDamage: 34,
      moduleDamage: 13
    })
  }),
  synthetic: Object.freeze({
    resolved: Object.freeze({
      systems: Object.freeze({ hull: -1, security: 7, quarantine: 2, oxygen: -1, morale: 4, power: -3 }),
      resources: Object.freeze({ credits: 260, alloy: 6, research: 7 }),
      stress: 2,
      moduleDamage: 5
    }),
    playerDown: Object.freeze({
      systems: Object.freeze({ hull: -7, security: -13, quarantine: -3, oxygen: -3, morale: -10, power: -12 }),
      resources: Object.freeze({ credits: -340, alloy: -8, fuel: -3, medical: -2, research: -3 }),
      stress: 16,
      injuryDamage: 29,
      moduleDamage: 16
    })
  }),
  pathogen: Object.freeze({
    resolved: Object.freeze({
      systems: Object.freeze({ hull: -1, security: 3, quarantine: 9, oxygen: -4, morale: 4, power: -1 }),
      resources: Object.freeze({ credits: 140, medical: -2, research: 8, pathogen: 4 }),
      stress: 4,
      moduleDamage: 2
    }),
    playerDown: Object.freeze({
      systems: Object.freeze({ hull: -4, security: -6, quarantine: -16, oxygen: -15, morale: -14, power: -4 }),
      resources: Object.freeze({ credits: -180, medical: -6, research: -2, pathogen: 5 }),
      stress: 20,
      injuryDamage: 38,
      moduleDamage: 11
    })
  })
});

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));
const round = (value, precision = 2) => {
  const factor = 10 ** precision;
  return Math.round((Number(value) || 0) * factor) / factor;
};
const clone = (value) => structuredClone(value);
const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function hashText(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function requireStrategicSave(save) {
  if (!isRecord(save) || !isRecord(save.hub) || !isRecord(save.galaxy) || !isRecord(save.clock)) {
    throw new Error('Sauvegarde stratégique invalide.');
  }
  if (!isRecord(save.hub.systems) || !isRecord(save.galaxy.worldState) || !isRecord(save.galaxy.resources)) {
    throw new Error('État du Tantalus ou de la galaxie incomplet.');
  }
}

function normalizeKind(value) {
  if (value === 'xeno' || value === 'alien') return 'xenomorph';
  if (value === 'android' || value === 'synth') return 'synthetic';
  if (value === 'infection' || value === 'spore') return 'pathogen';
  return CRISIS_KINDS.includes(value) ? value : null;
}

function absoluteHours(clock) {
  const day = Math.max(1, Math.floor(Number(clock?.day) || 1));
  const hour = Math.max(0, Number(clock?.hour) || 0);
  return (day - 1) * 24 + hour;
}

function clockAfter(clock, hours) {
  const total = Math.max(0, absoluteHours(clock) + Math.max(0, Number(hours) || 0));
  return {
    day: Math.floor(total / 24) + 1,
    hour: round(total % 24)
  };
}

function normalizeCrisis(crisis, fallback = {}) {
  const kind = normalizeKind(crisis?.kind ?? fallback.kind) || 'xenomorph';
  return {
    id: String(crisis?.id || fallback.id || `crisis-${kind}`),
    kind,
    count: Math.round(clamp(crisis?.count ?? fallback.count ?? 1, 1, 12)),
    deck: Math.round(clamp(crisis?.deck ?? fallback.deck ?? 0, 0, 3)),
    roomId: String(crisis?.roomId || fallback.roomId || CRISIS_ROUTES[kind][0].roomId),
    resolved: Boolean(crisis?.resolved ?? fallback.resolved)
  };
}

function availableWorlds(save) {
  const unlocked = new Set(Array.isArray(save.galaxy.unlockedWorldIds) ? save.galaxy.unlockedWorldIds : []);
  const candidates = WORLDS.filter((world) => unlocked.has(world.id) && isRecord(save.galaxy.worldState[world.id]));
  return candidates.length ? candidates : WORLDS.filter((world) => isRecord(save.galaxy.worldState[world.id]));
}

/**
 * Pure pressure snapshot used by crisis generation and UI previews.
 */
export function getHubCrisisPressure(save) {
  requireStrategicSave(save);
  const systems = save.hub.systems;
  const candidates = availableWorlds(save);
  const ranked = candidates.map((world) => ({
    world,
    infestation: clamp(save.galaxy.worldState[world.id]?.infestation),
    quarantine: clamp(save.galaxy.worldState[world.id]?.quarantine)
  })).sort((left, right) => right.infestation - left.infestation || left.world.id.localeCompare(right.world.id));
  const source = ranked[0] || { world: WORLDS[0], infestation: 0, quarantine: 0 };
  const averageInfestation = ranked.reduce((sum, entry) => sum + entry.infestation, 0) / Math.max(1, ranked.length);
  const averageQuarantine = ranked.reduce((sum, entry) => sum + entry.quarantine, 0) / Math.max(1, ranked.length);
  const time = absoluteHours(save.clock);
  const seed = `${save.profile || 1}:${time}:${source.world.id}:${round(source.infestation)}:${round(averageInfestation)}`;
  const nightWatch = (time % 24 < 6 || time % 24 >= 18) ? 7 : 0;
  const jitter = (kind) => hashText(`${seed}:${kind}`) % 9;
  const scores = {
    xenomorph: round(
      source.infestation * 0.92
      + Math.max(0, 78 - clamp(systems.security, 78)) * 0.64
      + Math.max(0, 74 - clamp(systems.hull, 74)) * 0.42
      + nightWatch
      + jitter('xenomorph')
    ),
    synthetic: round(
      Math.max(0, 88 - clamp(systems.security, 88)) * 1.18
      + Math.max(0, 82 - clamp(systems.power, 82)) * 0.92
      + Math.max(0, 70 - clamp(systems.morale, 70)) * 0.28
      + nightWatch * 0.45
      + jitter('synthetic')
    ),
    pathogen: round(
      averageInfestation * 0.42
      + source.infestation * 0.28
      + Math.max(0, 84 - clamp(systems.quarantine, 84)) * 1.08
      + Math.max(0, 88 - clamp(systems.oxygen, 88)) * 0.86
      + Math.max(0, 50 - averageQuarantine) * 0.2
      + jitter('pathogen')
    )
  };
  return Object.freeze({
    absoluteHours: time,
    sourceWorldId: source.world.id,
    infestation: source.infestation,
    averageInfestation: round(averageInfestation),
    averageQuarantine: round(averageQuarantine),
    scores: Object.freeze(scores)
  });
}

/**
 * Pure crisis derivation. The same save always produces the same crisis.
 */
export function deriveHubCrisis(save, options = {}) {
  requireStrategicSave(save);
  const current = isRecord(save.hub.activeCrisis) ? normalizeCrisis(save.hub.activeCrisis) : null;
  if (current && !current.resolved) return current;

  const pressure = getHubCrisisPressure(save);
  const requestedKind = normalizeKind(options.kind);
  const kind = requestedKind || [...CRISIS_KINDS]
    .sort((left, right) => pressure.scores[right] - pressure.scores[left] || left.localeCompare(right))[0];
  const score = pressure.scores[kind];
  const minimumScore = Math.max(0, Number(options.minimumScore ?? 68) || 0);
  if (!options.force && !requestedKind && score < minimumScore) return null;

  const previousId = current?.resolved ? current.id : '';
  const seed = `${save.profile || 1}:${pressure.absoluteHours}:${kind}:${pressure.sourceWorldId}:${previousId}`;
  const route = CRISIS_ROUTES[kind][hashText(`${seed}:route`) % CRISIS_ROUTES[kind].length];
  const count = Math.round(clamp(2 + Math.floor(score / 28) + (hashText(`${seed}:count`) % 3), 1, 12));
  const hourKey = String(Math.floor(pressure.absoluteHours * 4)).padStart(4, '0');
  const crisis = normalizeCrisis({
    id: `crisis-${hourKey}-${kind}-${hashText(seed).toString(36)}`,
    kind,
    count,
    deck: options.deck ?? route.deck,
    roomId: options.roomId ?? route.roomId,
    resolved: false
  });
  if (!options.force && current?.resolved && current.id === crisis.id) return null;
  return crisis;
}

/**
 * Explicit persistence adapter: writes the derived crisis to save.hub.activeCrisis.
 */
export function createHubCrisis(save, options = {}) {
  const crisis = deriveHubCrisis(save, options);
  if (crisis) save.hub.activeCrisis = clone(crisis);
  return crisis ? clone(crisis) : null;
}

/**
 * Immutable crisis creation variant.
 */
export function withHubCrisis(save, options = {}) {
  const nextSave = clone(save);
  const crisis = createHubCrisis(nextSave, options);
  return { save: nextSave, crisis };
}

function applyDeltas(target, deltas, maximum = Number.MAX_SAFE_INTEGER) {
  const changes = {};
  for (const [key, delta] of Object.entries(deltas)) {
    const before = Number(target[key]) || 0;
    const after = round(clamp(before + delta, 0, maximum));
    target[key] = after;
    changes[key] = { before, delta, after };
  }
  return changes;
}

function ensureModuleIntegrity(save) {
  if (!isRecord(save.hub.moduleIntegrity)) save.hub.moduleIntegrity = {};
  for (const moduleId of save.hub.moduleIds || []) {
    if (!Number.isFinite(Number(save.hub.moduleIntegrity[moduleId]))) save.hub.moduleIntegrity[moduleId] = 100;
  }
}

function crisisFromEvent(save, event) {
  const active = isRecord(save.hub.activeCrisis) ? normalizeCrisis(save.hub.activeCrisis) : null;
  const eventKind = normalizeKind(event?.kind);
  const eventId = typeof event?.crisisId === 'string' ? event.crisisId : typeof event?.id === 'string' ? event.id : null;
  if (active && active.resolved && (!eventId || eventId === active.id)) return { crisis: active, alreadyResolved: true };
  if (active && eventId && eventId !== active.id) return { crisis: active, mismatch: true };
  if (active) return { crisis: active };
  if (!eventKind && !eventId) return { crisis: null };
  return {
    crisis: normalizeCrisis({
      id: eventId || `crisis-event-${Math.floor(absoluteHours(save.clock) * 4)}`,
      kind: eventKind || 'xenomorph',
      count: event?.count || 1,
      deck: event?.deck ?? save.hub.deck,
      roomId: event?.roomId || save.hub.roomId,
      resolved: false
    })
  };
}

function addPersistentAlert(save, alert) {
  if (!Array.isArray(save.galaxy.alerts)) save.galaxy.alerts = [];
  const remaining = save.galaxy.alerts.filter((entry) => entry?.id !== alert.id);
  save.galaxy.alerts = [alert, ...remaining].slice(0, 256);
}

/**
 * Pure resolution planner compatible with HubGame events.
 */
export function planHubCrisisResolution(save, rawEvent = {}) {
  requireStrategicSave(save);
  const event = typeof rawEvent === 'string' ? { action: rawEvent } : rawEvent;
  const action = event?.action;
  if (action !== HUB_CRISIS_ACTIONS.resolved && action !== HUB_CRISIS_ACTIONS.playerDown) {
    return { handled: false, reason: 'unsupported-event', save: clone(save) };
  }

  const lookup = crisisFromEvent(save, event);
  if (!lookup.crisis) return { handled: false, reason: 'no-active-crisis', save: clone(save) };
  if (lookup.mismatch) return { handled: false, reason: 'crisis-mismatch', crisis: lookup.crisis, save: clone(save) };
  if (lookup.alreadyResolved) return { handled: false, reason: 'already-resolved', crisis: lookup.crisis, save: clone(save) };

  const nextSave = clone(save);
  const crisis = normalizeCrisis(lookup.crisis);
  const outcome = action === HUB_CRISIS_ACTIONS.resolved ? 'resolved' : 'player-down';
  const baseRule = CRISIS_EFFECTS[crisis.kind][outcome === 'resolved' ? 'resolved' : 'playerDown'];
  const evacuation = outcome === 'player-down'
    ? consumeHubEscapePodMitigationV71(nextSave)
    : { applied: false, injuryDamage: 0, stress: 0, moduleDamage: 0 };
  const rule = evacuation.applied
    ? {
        ...baseRule,
        injuryDamage: Math.max(0, baseRule.injuryDamage - evacuation.injuryDamage),
        stress: Math.max(0, baseRule.stress - evacuation.stress),
        moduleDamage: Math.max(0, baseRule.moduleDamage - evacuation.moduleDamage)
      }
    : baseRule;
  const systemChanges = applyDeltas(nextSave.hub.systems, rule.systems, 100);
  const resourceChanges = applyDeltas(nextSave.galaxy.resources, rule.resources);

  ensureModuleIntegrity(nextSave);
  const installedModules = (nextSave.hub.moduleIds || []).filter((id) => Object.hasOwn(nextSave.hub.moduleIntegrity, id));
  let moduleChange = null;
  if (installedModules.length) {
    const moduleId = installedModules[hashText(`${crisis.id}:${outcome}:module`) % installedModules.length];
    const before = clamp(nextSave.hub.moduleIntegrity[moduleId]);
    const after = round(clamp(before - rule.moduleDamage));
    nextSave.hub.moduleIntegrity[moduleId] = after;
    moduleChange = { moduleId, before, damage: rule.moduleDamage, after };
  }

  const selectedIds = Array.isArray(nextSave.strategy?.selectedCrewIds) ? nextSave.strategy.selectedCrewIds : [];
  let participants = (nextSave.crew || []).filter((member) => selectedIds.includes(member.id) && member.status !== 'deceased');
  if (!participants.length) participants = (nextSave.crew || []).filter((member) => member.status !== 'deceased').slice(0, 4);
  for (const member of participants) member.stress = round(clamp((member.stress || 0) + rule.stress));

  let injury = null;
  if (outcome === 'player-down' && participants.length) {
    const casualty = participants[hashText(`${crisis.id}:casualty`) % participants.length];
    casualty.health = round(Math.max(1, clamp((casualty.health || 100) - rule.injuryDamage)));
    casualty.status = 'injured';
    if (!Array.isArray(casualty.injuries)) casualty.injuries = [];
    const wound = {
      type: `${crisis.kind}-hub-trauma`,
      day: Math.max(1, Math.floor(Number(nextSave.clock.day) || 1)),
      severity: rule.injuryDamage
    };
    casualty.injuries.push(wound);
    injury = { crewId: casualty.id, ...wound, health: casualty.health };
    if (isRecord(nextSave.player)) {
      nextSave.player.health = round(Math.max(1, clamp((nextSave.player.health || 100) - Math.ceil(rule.injuryDamage * 0.72))));
      nextSave.player.armor = round(clamp((nextSave.player.armor || 0) - 24));
      nextSave.player.stress = round(clamp((nextSave.player.stress || 0) + rule.stress));
    }
  } else if (isRecord(nextSave.player)) {
    nextSave.player.stress = round(clamp((nextSave.player.stress || 0) + Math.max(1, Math.floor(rule.stress / 2))));
  }

  nextSave.hub.activeCrisis = { ...crisis, resolved: true };
  const alert = {
    id: `alert-${crisis.id}-${outcome}`,
    worldId: null,
    type: outcome === 'resolved' ? 'hub-crisis-resolved' : 'hub-crisis-player-down',
    severity: outcome === 'resolved' ? 'info' : 'critical',
    message: outcome === 'resolved'
      ? `Incident ${crisis.kind} contenu sur le pont ${crisis.deck + 1}.`
      : evacuation.applied
        ? `Équipe extraite par capsule pendant l'incident ${crisis.kind} sur le pont ${crisis.deck + 1} ; pertes amorties.`
        : `Équipe à terre pendant l'incident ${crisis.kind} sur le pont ${crisis.deck + 1}.`,
    day: Math.max(1, Math.floor(Number(nextSave.clock.day) || 1)),
    hour: round(nextSave.clock.hour)
  };
  addPersistentAlert(nextSave, alert);

  return {
    handled: true,
    outcome,
    crisis: clone(nextSave.hub.activeCrisis),
    effects: { systems: systemChanges, resources: resourceChanges, module: moduleChange, injury, evacuation },
    save: nextSave
  };
}

function replaceRoot(target, source) {
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, source);
  return target;
}

/**
 * Mutating event adapter intended for saveSystem.data.
 */
export function resolveHubCrisisEvent(save, event = {}) {
  const result = planHubCrisisResolution(save, event);
  if (!result.handled) return result;
  replaceRoot(save, result.save);
  return { ...result, save };
}

export const resolveHubCrisis = resolveHubCrisisEvent;

function defaultWorldState(world) {
  return {
    stability: world.stability,
    infestation: world.infestation,
    colonyLevel: 0,
    faction: world.faction,
    quarantine: 0,
    population: 500 + (world.danger * 713) % 28000
  };
}

function makeWorldAlert(world, state, populationLoss, clock, seed) {
  let type = null;
  let severity = 'warning';
  let message = '';
  if (state.population <= 0) {
    type = 'colony-lost';
    severity = 'critical';
    message = `${world.name} ne transmet plus aucun signe de population.`;
  } else if (state.infestation >= 80) {
    type = 'infestation-critical';
    severity = 'critical';
    message = `${world.name} dépasse le seuil d'infestation critique (${Math.round(state.infestation)}%).`;
  } else if (state.stability <= 20) {
    type = 'collapse-risk';
    severity = 'critical';
    message = `${world.name} approche l'effondrement politique et logistique.`;
  } else if (state.quarantine <= 15 && state.infestation >= 45) {
    type = 'containment-failure';
    message = `Le confinement de ${world.name} ne contient plus la propagation.`;
  } else if (populationLoss >= Math.max(5, Math.ceil(state.population * 0.002))) {
    type = 'casualty-spike';
    message = `${world.name} signale ${populationLoss} pertes civiles pendant ce cycle.`;
  }
  if (!type) return null;
  return {
    id: `alert-${type}-${world.id}-${hashText(`${seed}:${type}`).toString(36)}`,
    worldId: world.id,
    type,
    severity,
    message,
    day: clock.day,
    hour: clock.hour
  };
}

/**
 * Pure galactic simulation. By default the strategic clock advances too.
 */
export function simulateGalaxy(save, options = {}) {
  requireStrategicSave(save);
  const nextSave = clone(save);
  const hours = round(clamp(options.hours ?? 6, 0, 24 * 30));
  const startTime = absoluteHours(nextSave.clock);
  if (options.advanceClock !== false) nextSave.clock = clockAfter(nextSave.clock, hours);
  const endClock = clone(nextSave.clock);
  const ticks = hours / 6;
  const unlockedBefore = new Set(Array.isArray(nextSave.galaxy.unlockedWorldIds) ? nextSave.galaxy.unlockedWorldIds : []);
  const worldChanges = [];
  const generatedAlerts = [];

  for (const world of WORLDS) {
    const state = isRecord(nextSave.galaxy.worldState[world.id])
      ? nextSave.galaxy.worldState[world.id]
      : (nextSave.galaxy.worldState[world.id] = defaultWorldState(world));
    const before = {
      infestation: clamp(state.infestation),
      stability: clamp(state.stability),
      quarantine: clamp(state.quarantine),
      population: Math.max(0, Math.floor(Number(state.population) || 0))
    };
    const seed = `${world.id}:${startTime}:${hours}:${save.profile || 1}`;
    const jitter = ((hashText(seed) % 201) - 100) / 1000;
    const hubContainment = (clamp(nextSave.hub.systems.quarantine) - 50) / 100;
    const infestationGrowth = (
      world.danger * 0.075
      + before.infestation * 0.0085
      - before.quarantine * 0.0062
      + Math.max(0, 45 - before.stability) * 0.004
      + jitter
    ) * ticks;
    state.infestation = round(clamp(before.infestation + infestationGrowth));

    const stabilityDelta = (
      (45 - state.infestation) * 0.006
      + (Number(state.colonyLevel) || 0) * 0.025
      - world.danger * 0.038
      - Math.max(0, state.infestation - 65) * 0.011
    ) * ticks;
    state.stability = round(clamp(before.stability + stabilityDelta));

    const quarantineDelta = (
      hubContainment * 0.58
      + (state.infestation >= 55 ? 0.16 : -0.11)
      - world.danger * 0.008
      + jitter * 0.25
    ) * ticks;
    state.quarantine = round(clamp(before.quarantine + quarantineDelta));

    const mortalityRate = Math.max(0,
      Math.max(0, state.infestation - 32) * 0.000075
      + Math.max(0, 30 - state.stability) * 0.00006
      + world.danger * 0.000025
      - state.quarantine * 0.000025
    ) * ticks;
    const growthRate = state.infestation < 25 && state.stability > 60 ? 0.00018 * ticks : 0;
    const populationDelta = Math.round(before.population * (growthRate - mortalityRate));
    state.population = Math.max(0, before.population + populationDelta);
    const populationLoss = Math.max(0, before.population - state.population);

    const after = {
      infestation: state.infestation,
      stability: state.stability,
      quarantine: state.quarantine,
      population: state.population
    };
    if (Object.keys(after).some((key) => after[key] !== before[key])) worldChanges.push({ worldId: world.id, before, after });
    if (unlockedBefore.has(world.id)) {
      const alert = makeWorldAlert(world, state, populationLoss, endClock, seed);
      if (alert) generatedAlerts.push(alert);
    }
  }

  const completedRoutes = Array.isArray(nextSave.galaxy.completedCampaignIds) ? nextSave.galaxy.completedCampaignIds.length : 0;
  const stableColonies = [...unlockedBefore].filter((worldId) => {
    const state = nextSave.galaxy.worldState[worldId];
    return state && state.colonyLevel > 0 && state.stability >= 70 && state.infestation <= 35;
  }).length;
  const elapsedRoutes = Math.floor(Math.max(0, absoluteHours(endClock) - 24) / 72);
  const targetUnlocked = Math.min(WORLDS.length, 8 + completedRoutes + Math.floor(stableColonies / 2) + elapsedRoutes);
  const unlocks = [];
  const unlocked = new Set(unlockedBefore);
  for (const world of WORLDS) {
    if (unlocked.size >= targetUnlocked) break;
    if (unlocked.has(world.id)) continue;
    unlocked.add(world.id);
    unlocks.push({ worldId: world.id, name: world.name });
    generatedAlerts.push({
      id: `alert-route-${world.id}-${Math.floor(absoluteHours(endClock) * 4)}`,
      worldId: world.id,
      type: 'route-unlocked',
      severity: 'info',
      message: `Nouvelle route stabilisée vers ${world.name}.`,
      day: endClock.day,
      hour: endClock.hour
    });
  }
  nextSave.galaxy.unlockedWorldIds = WORLDS.filter((world) => unlocked.has(world.id)).map((world) => world.id);

  let crisis = null;
  const hasActiveCrisis = isRecord(nextSave.hub.activeCrisis) && !nextSave.hub.activeCrisis.resolved;
  if (options.generateCrisis !== false && !hasActiveCrisis) {
    crisis = deriveHubCrisis(nextSave, {
      force: Boolean(options.forceCrisis),
      kind: options.crisisKind,
      minimumScore: options.minimumCrisisScore
    });
    if (crisis) {
      nextSave.hub.activeCrisis = clone(crisis);
      const pressure = getHubCrisisPressure(nextSave);
      generatedAlerts.push({
        id: `alert-${crisis.id}`,
        worldId: pressure.sourceWorldId,
        type: 'hub-crisis',
        severity: 'critical',
        message: `Incident ${crisis.kind} actif sur le pont ${crisis.deck + 1} du Tantalus.`,
        day: endClock.day,
        hour: endClock.hour
      });
    }
  }

  const uniqueAlerts = [];
  const knownAlertIds = new Set();
  for (const alert of [...generatedAlerts.slice(0, 64), ...(Array.isArray(nextSave.galaxy.alerts) ? nextSave.galaxy.alerts : [])]) {
    if (!alert?.id || knownAlertIds.has(alert.id)) continue;
    knownAlertIds.add(alert.id);
    uniqueAlerts.push(alert);
    if (uniqueAlerts.length >= 256) break;
  }
  nextSave.galaxy.alerts = uniqueAlerts;

  return {
    save: nextSave,
    hours,
    clock: endClock,
    worldChanges,
    alerts: generatedAlerts.slice(0, 64),
    unlocks,
    crisis: crisis ? clone(crisis) : null
  };
}

/**
 * Mutating adapter for strategic turns and persistence.
 */
export function advanceGalaxy(save, options = {}) {
  const result = simulateGalaxy(save, options);
  replaceRoot(save, result.save);
  return { ...result, save };
}

export const advanceWorldSimulation = advanceGalaxy;
