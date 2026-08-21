import {
  APEX_DOSSIERS,
  ENEMIES,
  FACTIONS,
  NEURO_XENO_PROFILES,
  SHIP_MODULES
} from './content.js';
import { advanceStrategicClock } from './save.js';

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));
const findModule = (moduleId) => SHIP_MODULES.find((module) => module.id === moduleId);
const absoluteStrategicHours = (clock) => (Math.max(1, Number(clock?.day) || 1) - 1) * 24 + Math.max(0, Number(clock?.hour) || 0);
const DIPLOMACY_COOLDOWN_HOURS = 12;

export function ensureAdvancedState(save) {
  if (!save?.strategy || !save?.galaxy || !save?.hub || !save?.player) throw new Error('Sauvegarde stratégique invalide.');
  if (!Object.hasOwn(save.strategy, 'selectedNeuroProfileId')) save.strategy.selectedNeuroProfileId = null;
  if (!Object.hasOwn(save.strategy, 'selectedApexDossierId')) save.strategy.selectedApexDossierId = null;
  if (!save.galaxy.diplomacyWindows || typeof save.galaxy.diplomacyWindows !== 'object' || Array.isArray(save.galaxy.diplomacyWindows)) save.galaxy.diplomacyWindows = {};
  if (!save.galaxy.factionStanding || typeof save.galaxy.factionStanding !== 'object') {
    save.galaxy.factionStanding = Object.fromEntries(FACTIONS.map((faction) => [faction.id, 0]));
  }
  if (!save.hub.moduleIntegrity || typeof save.hub.moduleIntegrity !== 'object') {
    save.hub.moduleIntegrity = Object.fromEntries((save.hub.moduleIds || []).map((id) => [id, 100]));
  }
  return save;
}

export function getShipModuleEffects(save) {
  ensureAdvancedState(save);
  const installed = (save.hub.moduleIds || []).map(findModule).filter(Boolean);
  const effects = { morale: 0, security: 0, research: 0, repair: 0, healing: 0, detection: 0 };
  let powerLoad = 0;
  for (const module of installed) {
    const integrity = clamp(save.hub.moduleIntegrity[module.id] ?? 100) / 100;
    const output = module.level * integrity;
    powerLoad += module.power;
    for (const effect of module.effects || []) effects[effect] = Math.round(((effects[effect] || 0) + output) * 100) / 100;
  }
  const powerCapacity = Math.round(36 + clamp(save.hub.systems.power) * 1.35);
  return {
    installed,
    effects,
    powerLoad,
    powerCapacity,
    sparePower: powerCapacity - powerLoad,
    operational: installed.filter((module) => (save.hub.moduleIntegrity[module.id] ?? 100) > 0).length
  };
}

export function getModuleQuote(module) {
  if (!module?.id) throw new Error('Module inconnu.');
  return {
    credits: 260 + module.level * 210 + module.power * 18,
    alloy: 3 + module.level * 3 + Math.ceil(module.power / 4)
  };
}

export function installShipModule(save, moduleId) {
  ensureAdvancedState(save);
  const module = findModule(moduleId);
  if (!module) throw new Error('Module inconnu.');
  if (save.hub.moduleIds.includes(module.id)) throw new Error('Module déjà installé.');
  const summary = getShipModuleEffects(save);
  if (summary.sparePower < module.power) throw new Error('Puissance disponible insuffisante.');
  const quote = getModuleQuote(module);
  if (save.galaxy.resources.credits < quote.credits || save.galaxy.resources.alloy < quote.alloy) throw new Error('Ressources insuffisantes.');
  save.galaxy.resources.credits -= quote.credits;
  save.galaxy.resources.alloy -= quote.alloy;
  save.hub.moduleIds.push(module.id);
  save.hub.moduleIntegrity[module.id] = 100;
  return { module, quote, summary: getShipModuleEffects(save) };
}

export function repairShipModule(save, moduleId) {
  ensureAdvancedState(save);
  const module = findModule(moduleId);
  if (!module || !save.hub.moduleIds.includes(moduleId)) throw new Error('Module non installé.');
  const integrity = clamp(save.hub.moduleIntegrity[moduleId] ?? 100);
  const missing = 100 - integrity;
  if (!missing) return { module, repaired: 0, cost: 0 };
  const repaired = Math.min(35, missing);
  const cost = Math.max(1, Math.ceil(repaired / 8));
  if (save.galaxy.resources.alloy < cost) throw new Error('Alliage insuffisant.');
  save.galaxy.resources.alloy -= cost;
  save.hub.moduleIntegrity[moduleId] = integrity + repaired;
  save.hub.systems.hull = clamp(save.hub.systems.hull + Math.min(5, repaired / 7));
  return { module, repaired, cost, integrity: save.hub.moduleIntegrity[moduleId] };
}

export function damageInstalledModules(save, amount, seed = 0) {
  ensureAdvancedState(save);
  const installed = (save.hub.moduleIds || []).filter((id) => findModule(id));
  if (!installed.length) return null;
  const id = installed[Math.abs(Math.trunc(seed)) % installed.length];
  const previous = clamp(save.hub.moduleIntegrity[id] ?? 100);
  save.hub.moduleIntegrity[id] = clamp(previous - Math.max(1, amount));
  return { moduleId: id, previous, integrity: save.hub.moduleIntegrity[id] };
}

export function selectNeuroProfile(save, profileId) {
  ensureAdvancedState(save);
  if (save.strategy.currentOperation) throw new Error('Profil Neuro-Xeno verrouillé pendant une opération.');
  const profile = NEURO_XENO_PROFILES.find((entry) => entry.id === profileId);
  if (!profile) throw new Error('Profil Neuro-Xeno inconnu.');
  if (!profile.playerClassCompatible) throw new Error('Ce spécimen refuse l’interface joueur.');
  const enemy = ENEMIES.find((entry) => entry.id === profile.enemyId);
  if (!enemy) throw new Error('Spécimen lié introuvable.');
  save.strategy.selectedNeuroProfileId = profile.id;
  save.player.classId = 'neuro-xeno-controller';
  save.player.neuroProfileId = profile.id;
  return { profile, enemy };
}

export function clearNeuroProfile(save) {
  ensureAdvancedState(save);
  if (save.strategy.currentOperation) throw new Error('Profil Neuro-Xeno verrouillé pendant une opération.');
  save.strategy.selectedNeuroProfileId = null;
  save.player.neuroProfileId = null;
  save.player.classId = 'commander';
}

export function createNeuroRuntime(profile, enemy, seed = 1) {
  if (!profile?.playerClassCompatible || !enemy) throw new Error('Interface Neuro-Xeno incompatible.');
  const stability = clamp(112 - profile.controlDifficulty * 0.72, 28, 96);
  return {
    profileId: profile.id,
    enemyId: enemy.id,
    harness: profile.harness,
    failureMode: profile.failureMode,
    signalRange: profile.signalRange,
    controlDifficulty: profile.controlDifficulty,
    signal: 100,
    stability,
    strain: 0,
    seed: Math.abs(Math.trunc(seed)) || 1,
    controlled: true,
    failure: null
  };
}

export function advanceNeuroRuntime(runtime, { distance = 0, seconds = 1, attacking = false, countermeasure = false } = {}) {
  if (!runtime.controlled) return runtime;
  const rangePressure = Math.max(0, distance - runtime.signalRange) / Math.max(1, runtime.signalRange);
  const difficultyPressure = runtime.controlDifficulty / 100;
  const drain = seconds * (0.45 + rangePressure * 9 + difficultyPressure * (attacking ? 2.4 : 0.9));
  runtime.strain = clamp(runtime.strain + drain * (attacking ? 1.4 : 0.55));
  runtime.signal = clamp(runtime.signal - drain + (countermeasure ? seconds * 8 : 0));
  runtime.stability = clamp(runtime.stability - drain * 0.28 + (countermeasure ? seconds * 5 : 0));
  if (runtime.signal <= 0 || runtime.stability <= 0) {
    runtime.controlled = false;
    runtime.failure = runtime.failureMode;
  }
  return runtime;
}

export function selectApexDossier(save, dossierId) {
  ensureAdvancedState(save);
  if (save.strategy.currentOperation) throw new Error('Dossier Apex verrouillé pendant une opération.');
  const dossier = APEX_DOSSIERS.find((entry) => entry.id === dossierId);
  if (!dossier) throw new Error('Dossier Apex inconnu.');
  save.strategy.selectedApexDossierId = dossier.id;
  return { dossier, enemy: ENEMIES.find((entry) => entry.id === dossier.enemyId) };
}

export function getSelectedAdvancedLoadout(save) {
  ensureAdvancedState(save);
  const neuroProfile = NEURO_XENO_PROFILES.find((entry) => entry.id === save.strategy.selectedNeuroProfileId) || null;
  const apexDossier = APEX_DOSSIERS.find((entry) => entry.id === save.strategy.selectedApexDossierId) || null;
  return {
    neuroProfile,
    neuroEnemy: neuroProfile ? ENEMIES.find((entry) => entry.id === neuroProfile.enemyId) || null : null,
    apexDossier,
    apexEnemy: apexDossier ? ENEMIES.find((entry) => entry.id === apexDossier.enemyId) || null : null,
    modules: getShipModuleEffects(save)
  };
}

export function performDiplomacy(save, world, stance = 'aid') {
  ensureAdvancedState(save);
  if (save.strategy.currentOperation) throw new Error('Diplomatie indisponible pendant une opération.');
  const state = save.galaxy.worldState[world?.id];
  if (!state) throw new Error('Monde inconnu.');
  if (!save.galaxy.unlockedWorldIds.includes(world.id)) throw new Error('Route diplomatique verrouillée.');
  const now = absoluteStrategicHours(save.clock);
  const previousWindow = Math.max(0, Number(save.galaxy.diplomacyWindows[world.id]) || 0);
  if (previousWindow > now) throw new Error(`Canal diplomatique indisponible pendant encore ${Math.ceil(previousWindow - now)} h.`);

  const faction = FACTIONS.find((entry) => entry.name === state.faction || entry.id === state.faction) || FACTIONS[0];
  const effects = {
    aid: { credits: -260, supplies: -4, fuel: 0, standing: 8, stability: 6, infestation: -1, hours: 6 },
    quarantine: { credits: -180, supplies: -2, fuel: 0, standing: -2, stability: -1, infestation: -6, hours: 8 },
    trade: { credits: 220, supplies: 3, fuel: 2, standing: 3, stability: 2, infestation: 0, hours: 4 }
  }[stance];
  if (!effects) throw new Error('Position diplomatique inconnue.');
  if (effects.credits < 0 && save.galaxy.resources.credits + effects.credits < 0) throw new Error('Crédits insuffisants.');
  if (effects.supplies < 0 && save.hub.systems.supplies + effects.supplies < 0) throw new Error('Ravitaillement insuffisant.');

  save.galaxy.resources.credits = Math.min(999999999, Math.max(0, save.galaxy.resources.credits + effects.credits));
  save.hub.systems.supplies = clamp(save.hub.systems.supplies + effects.supplies);
  save.galaxy.resources.fuel = Math.min(999999999, Math.max(0, save.galaxy.resources.fuel + effects.fuel));
  save.galaxy.factionStanding[faction.id] = clamp((save.galaxy.factionStanding[faction.id] || 0) + effects.standing, -100, 100);
  state.stability = clamp(state.stability + effects.stability);
  state.infestation = clamp(state.infestation + effects.infestation);
  state.quarantine = clamp((state.quarantine || 0) + (stance === 'quarantine' ? 9 : stance === 'aid' ? 2 : 0));

  advanceStrategicClock(save, effects.hours);
  const completedAt = absoluteStrategicHours(save.clock);
  const availableAt = completedAt + DIPLOMACY_COOLDOWN_HOURS;
  save.galaxy.diplomacyWindows[world.id] = availableAt;
  save.strategy.serial = (Number(save.strategy.serial) || 0) + 1;
  save.strategy.log.unshift({
    id: `diplomacy-${world.id}-${save.strategy.serial}`,
    day: save.clock.day,
    hour: save.clock.hour,
    type: 'diplomacy',
    title: `${stance.toUpperCase()} · ${world.name}`,
    risk: 0,
    incident: false,
    result: `${effects.hours} h engagées ; prochain canal à H+${DIPLOMACY_COOLDOWN_HOURS}.`
  });
  save.strategy.log = save.strategy.log.slice(0, 40);
  return { faction, stance, effects, state, standing: save.galaxy.factionStanding[faction.id], hours: effects.hours, availableAt };
}
