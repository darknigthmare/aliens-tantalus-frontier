import { WORLDS } from './content.js';
import {
  CRISIS_KINDS,
  deriveHubCrisis as deriveCoreCrisis,
  planHubCrisisResolution,
  resolveHubCrisisEvent as resolveCoreHubCrisisEvent,
  HUB_CRISIS_ACTIONS
} from './world-crisis-core.js';
import { simulateGalaxy as simulateCoreGalaxy } from './world-crisis-core.js';
import {
  advanceInfestationChainV62,
  createInfestationExposureV62,
  deriveCausalHubCrisisV62,
  getInfestationHudStateV62,
  normalizeInfestationChainV62,
  planInfestationAdvanceV62
} from './infestation-chain-v62.js';

export { CRISIS_KINDS, HUB_CRISIS_ACTIONS, planHubCrisisResolution, getInfestationHudStateV62 };

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));
const round = (value) => Math.round(value * 100) / 100;

function hashText(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function absoluteHours(clock = {}) {
  return (Math.max(1, Number(clock.day) || 1) - 1) * 24 + clamp(clock.hour, 0, 24);
}

function availableWorlds(save) {
  const unlocked = new Set(Array.isArray(save.galaxy?.unlockedWorldIds) ? save.galaxy.unlockedWorldIds : []);
  const known = WORLDS.filter((world) => unlocked.has(world.id) && save.galaxy?.worldState?.[world.id]);
  return known.length ? known : WORLDS.filter((world) => save.galaxy?.worldState?.[world.id]);
}

export function getHubCrisisPressure(save) {
  if (!save?.hub?.systems || !save?.galaxy?.worldState) throw new Error('Sauvegarde stratégique invalide.');
  const systems = save.hub.systems;
  const ranked = availableWorlds(save).map((world) => ({
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
  const scores = Object.freeze({
    xenomorph: round(source.infestation * 0.92 + Math.max(0, 78 - clamp(systems.security)) * 0.64 + Math.max(0, 74 - clamp(systems.hull)) * 0.42 + nightWatch + jitter('xenomorph')),
    synthetic: round(Math.max(0, 88 - clamp(systems.security)) * 1.18 + Math.max(0, 82 - clamp(systems.power)) * 0.92 + Math.max(0, 70 - clamp(systems.morale)) * 0.28 + nightWatch * 0.45 + jitter('synthetic')),
    pathogen: round(averageInfestation * 0.42 + source.infestation * 0.28 + Math.max(0, 84 - clamp(systems.quarantine)) * 1.08 + Math.max(0, 88 - clamp(systems.oxygen)) * 0.86 + Math.max(0, 50 - averageQuarantine) * 0.2 + jitter('pathogen'))
  });
  return Object.freeze({
    absoluteHours: time,
    sourceWorldId: source.world.id,
    infestation: source.infestation,
    averageInfestation: round(averageInfestation),
    averageQuarantine: round(averageQuarantine),
    scores
  });
}

export function deriveHubCrisis(save, options = {}) {
  const current = save?.hub?.activeCrisis;
  if (current && !current.resolved) return deriveCoreCrisis(save, options);
  return deriveCausalHubCrisisV62(save);
}

export function createHubCrisis(save, options = {}) {
  if (options.sourceEvent) createInfestationExposureV62(save, {
    ...options.sourceEvent,
    kind: options.kind || options.sourceEvent.kind
  });
  if (options.advanceInfestation) advanceInfestationChainV62(save, options.advanceInfestation === true ? {} : options.advanceInfestation);
  const crisis = deriveHubCrisis(save, options);
  if (crisis) save.hub.activeCrisis = structuredClone(crisis);
  return crisis;
}

export function withHubCrisis(save, options = {}) {
  const nextSave = structuredClone(save);
  const crisis = createHubCrisis(nextSave, options);
  return { save: nextSave, crisis };
}

export function resolveHubCrisisEvent(save, event = {}) {
  const result = resolveCoreHubCrisisEvent(save, event);
  if (!result.handled) return result;
  const chain = normalizeInfestationChainV62(save?.hub?.infestationChain);
  if (chain && chain.stage === 'infestation') {
    chain.resolved = true;
    chain.updatedAtHours = absoluteHours(save.clock);
    chain.containment.resolved = result.outcome === 'resolved';
    chain.containment.failed = result.outcome !== 'resolved';
    chain.history.push({
      stage: 'infestation',
      atHours: chain.updatedAtHours,
      reason: result.outcome === 'resolved' ? 'Infestation neutralisée dans le niveau physique' : 'Intervention échouée, secteur condamné'
    });
    save.hub.infestationChain = chain;
  }
  return { ...result, save };
}

export const resolveHubCrisis = resolveHubCrisisEvent;

function unlockEmergencyRoutes(result, sourceSave, hours) {
  if (hours < 12 || result.unlocks.length >= 2) return result;
  const critical = Object.values(sourceSave.galaxy.worldState).some((state) => Number(state?.infestation) >= 85 || Number(state?.stability) <= 18);
  if (!critical) return result;
  const unlocked = new Set(result.save.galaxy.unlockedWorldIds);
  const additions = WORLDS.filter((world) => !unlocked.has(world.id)).slice(0, 2 - result.unlocks.length);
  for (const world of additions) {
    result.save.galaxy.unlockedWorldIds.push(world.id);
    result.unlocks.push(world.id);
    result.alerts.push({
      id: `alert-emergency-route-${world.id}-${result.clock.day}-${result.clock.hour}`,
      worldId: world.id,
      type: 'emergency-route',
      severity: 'warning',
      message: `Route d'urgence ouverte vers ${world.name}.`,
      day: result.clock.day,
      hour: result.clock.hour
    });
  }
  return result;
}

export function simulateGalaxy(save, options = {}) {
  const hours = Math.max(0, Number(options.hours ?? 6) || 0);
  const result = simulateCoreGalaxy(save, { ...options, generateCrisis: false });
  unlockEmergencyRoutes(result, save, hours);
  if (options.sourceEvent) createInfestationExposureV62(result.save, {
    ...options.sourceEvent,
    kind: options.crisisKind || options.sourceEvent.kind
  });
  const active = result.save.hub.activeCrisis && !result.save.hub.activeCrisis.resolved ? result.save.hub.activeCrisis : null;
  let crisis = active;
  if (options.generateCrisis !== false && !active) {
    const infestation = planInfestationAdvanceV62(result.save);
    result.save = infestation.save;
    crisis = infestation.crisis;
  }
  if (crisis && !active) {
    result.save.hub.activeCrisis = structuredClone(crisis);
    const hud = getInfestationHudStateV62(result.save);
    const alert = {
      id: `alert-${crisis.id}`,
      worldId: result.save.hub.infestationChain?.source?.worldId || null,
      type: 'hub-crisis',
      severity: 'critical',
      message: hud.locationKnown
        ? `Rupture de confinement confirmée sur le pont ${crisis.deck + 1} du Tantalus.`
        : 'MU/TH/UR confirme une rupture de confinement dont la localisation reste incertaine.',
      day: result.clock.day,
      hour: result.clock.hour
    };
    result.alerts.push(alert);
    result.save.galaxy.alerts = [alert, ...(result.save.galaxy.alerts || []).filter((entry) => entry?.id !== alert.id)].slice(0, 256);
  }
  return { ...result, crisis: crisis ? structuredClone(crisis) : null };
}

export function advanceGalaxy(save, options = {}) {
  const result = simulateGalaxy(save, options);
  for (const key of Object.keys(save)) delete save[key];
  Object.assign(save, result.save);
  return { ...result, save };
}

export const advanceWorldSimulation = advanceGalaxy;
