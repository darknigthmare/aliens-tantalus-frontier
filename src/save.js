import { CREW, RELEASE, WORLDS } from './content.js';

export const SAVE_SCHEMA = 51;
export const SAVE_PREFIX = 'atf-v47-profile-';
export const LEGACY_KEYS = [
  'ALIENS_INFESTATION_BLACKOUT_SAVE',
  'BLACKOUT_REFORGED_SAVE',
  'ALIENS_TANTALUS_FRONTIER_SAVE',
  'atf-save-v41',
  'atf-save-v43',
  'atf-save-v45'
];

export const MAX_SQUAD_SIZE = 4;

export const COMMAND_ACTIONS = Object.freeze([
  {
    id: 'frontier-recon', name: 'Reconnaissance longue port\u00e9e', hours: 3, risk: 12,
    cost: { power: 4, credits: 160 },
    description: 'Cartographier une nouvelle route et produire des donn\u00e9es de recherche.'
  },
  {
    id: 'salvage-run', name: 'R\u00e9cup\u00e9ration industrielle', hours: 5, risk: 24,
    cost: { fuel: 4, supplies: 3 },
    description: 'D\u00e9tacher une navette pour r\u00e9cup\u00e9rer cr\u00e9dits et alliages dans une \u00e9pave.'
  },
  {
    id: 'research-cycle', name: 'Cycle laboratoire MIRE', hours: 6, risk: 8,
    cost: { power: 5, credits: 220 },
    description: 'Convertir les archives et pr\u00e9l\u00e8vements en points de recherche exploitables.'
  },
  {
    id: 'colony-relief', name: 'Soutien \u00e0 la colonie active', hours: 4, risk: 18,
    cost: { fuel: 3, medical: 2, supplies: 4 },
    description: 'Stabiliser le monde s\u00e9lectionn\u00e9 et contenir localement son infestation.'
  },
  {
    id: 'crew-rotation', name: 'Rotation et r\u00e9cup\u00e9ration Echo-9', hours: 8, risk: 4,
    cost: { medical: 2, supplies: 5 },
    description: 'Soigner les blessures l\u00e9g\u00e8res et r\u00e9duire stress et fatigue de toute l\u2019\u00e9quipe.'
  }
]);

export const RESEARCH_PROJECTS = Object.freeze([
  {
    id: 'motion-analysis', name: 'Analyse pr\u00e9dictive des mouvements', hours: 8,
    cost: { credits: 520, research: 14 },
    description: 'Le tracker et les capteurs r\u00e9duisent le risque de chaque op\u00e9ration de 8 points.'
  },
  {
    id: 'trauma-protocol', name: 'Protocole trauma de campagne', hours: 10,
    cost: { credits: 640, research: 18, medical: 2 },
    description: 'Les soins gagnent en efficacit\u00e9 et les pertes en mission sont moins s\u00e9v\u00e8res.'
  },
  {
    id: 'xeno-containment', name: 'Confinement x\u00e9nobiologique', hours: 12,
    cost: { credits: 780, research: 22, pathogen: 2 },
    description: 'Une victoire r\u00e9duit davantage l\u2019infestation et am\u00e9liore la quarantaine.'
  },
  {
    id: 'vehicle-doctrine', name: 'Doctrine v\u00e9hicules combin\u00e9s', hours: 12,
    cost: { credits: 860, research: 20, alloy: 10 },
    description: 'Un v\u00e9hicule affect\u00e9 r\u00e9duit le risque et le co\u00fbt en carburant des op\u00e9rations.'
  },
  {
    id: 'ship-logistics', name: 'Logistique du Tantalus', hours: 14,
    cost: { credits: 950, research: 26, alloy: 14 },
    description: 'Les acquisitions d\u2019armes, d\u2019\u00e9quipements et de v\u00e9hicules co\u00fbtent 15% moins cher.'
  }
]);

const DEFAULT_WEAPONS = ['weapon-001-m41a-pulse-rifle', 'weapon-003-m4a3-service-pistol'];
const DEFAULT_EQUIPMENT = ['equipment-001-motion-tracker', 'equipment-006-medkit'];
const DEFAULT_VEHICLES = ['vehicle-001-m577-armored-personnel-carrier'];

function createStrategyState() {
  return {
    serial: 0,
    selectedCrewIds: CREW.slice(0, MAX_SQUAD_SIZE).map((member) => member.id),
    inventory: {
      weaponIds: [...DEFAULT_WEAPONS],
      equipmentIds: [...DEFAULT_EQUIPMENT],
      vehicleIds: [...DEFAULT_VEHICLES]
    },
    selectedVehicleId: DEFAULT_VEHICLES[0],
    selectedNeuroProfileId: null,
    selectedApexDossierId: null,
    plannedCampaignId: null,
    unlockedResearchIds: [],
    currentOperation: null,
    lastOperation: null,
    log: []
  };
}

export function createDefaultSave(profile = 1) {
  return {
    schema: SAVE_SCHEMA,
    release: RELEASE.version,
    profile,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    clock: { day: 1, hour: 6 },
    scene: 'title',
    worldId: WORLDS[0].id,
    campaignId: null,
    levelSeedId: 'level-001',
    difficulty: 'standard',
    player: {
      name: 'Mara Vega',
      classId: 'commander',
      health: 100,
      armor: 50,
      stress: 0,
      weaponIds: ['weapon-001-m41a-pulse-rifle', 'weapon-003-m4a3-service-pistol'],
      equipmentIds: ['equipment-001-motion-tracker', 'equipment-006-medkit'],
      costumeId: 'costume-001',
      ammo: { primary: 420, secondary: 96, grenades: 4 }
    },
    crew: CREW.map((member) => ({
      id: member.id,
      status: member.status,
      health: member.health,
      stress: member.stress,
      fatigue: member.fatigue,
      loyalty: member.loyalty,
      missions: member.missions,
      kills: member.kills,
      injuries: []
    })),
    hub: {
      deck: 0,
      positionX: 180,
      roomId: 'bridge',
      visited: ['bridge'],
      systems: { hull: 100, power: 92, oxygen: 100, security: 76, quarantine: 64, morale: 72, supplies: 78, research: 0 },
      services: {},
      moduleIds: ['module-001', 'module-002', 'module-003'],
      activeCrisis: null
    },
    galaxy: {
      unlockedWorldIds: WORLDS.slice(0, 8).map((world) => world.id),
      completedCampaignIds: [],
      worldState: Object.fromEntries(WORLDS.map((world) => [world.id, {
        stability: world.stability,
        infestation: world.infestation,
        colonyLevel: 0,
        faction: world.faction,
        quarantine: 0,
        population: 500 + (world.danger * 713) % 28000
      }])),
      alerts: [],
      diplomacyWindows: {},
      resources: { credits: 3200, alloy: 80, fuel: 64, medical: 22, research: 0, pathogen: 0 }
    },
    strategy: createStrategyState(),
    editor: { projects: [], activeProjectId: null },
    memorial: [],
    settings: {
      language: 'fr',
      difficulty: 'standard',
      quality: 'high',
      screenShake: 0.7,
      contrast: 'standard',
      subtitles: true,
      reducedMotion: false,
      aimAssist: 'standard',
      music: 0.45,
      effects: 0.7,
      coop: false
    },
    statistics: { playSeconds: 0, kills: 0, shots: 0, hits: 0, deaths: 0, rescues: 0, rooms: 0, campaigns: 0, strategicActions: 0, research: 0, procurements: 0, retreats: 0 }
  };
}

const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const CREW_STATUSES = new Set(['active', 'injured', 'recovering', 'missing', 'captured', 'deceased']);
const numberBetween = (value, fallback, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : fallback;
};
const stringList = (value, fallback = []) => Array.isArray(value)
  ? [...new Set(value.filter((entry) => typeof entry === 'string' && entry.length <= 120))]
  : [...fallback];
const mergeNumbers = (base, candidate, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const source = isRecord(candidate) ? candidate : {};
  return Object.fromEntries(Object.entries(base).map(([key, fallback]) => [key, numberBetween(source[key], fallback, min, max)]));
};

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const rarityFactor = (rarity) => ({ common: 1, uncommon: 1.22, rare: 1.58, epic: 2, legendary: 2.6 }[rarity] || 1.15);

function ensureStrategy(save) {
  if (!isRecord(save.strategy)) save.strategy = createStrategyState();
  return save.strategy;
}

export function advanceStrategicClock(save, hours) {
  const next = Math.max(0, (save.clock.day - 1) * 24 + save.clock.hour + Math.max(0, Number(hours) || 0));
  save.clock.day = Math.floor(next / 24) + 1;
  save.clock.hour = Math.round((next % 24) * 100) / 100;
  return save.clock;
}

export function getStrategicValue(save, key) {
  if (Object.hasOwn(save.galaxy.resources, key)) return save.galaxy.resources[key];
  if (Object.hasOwn(save.hub.systems, key)) return save.hub.systems[key];
  return 0;
}

function changeStrategicValue(save, key, delta) {
  const target = Object.hasOwn(save.galaxy.resources, key) ? save.galaxy.resources
    : Object.hasOwn(save.hub.systems, key) ? save.hub.systems : null;
  if (!target) throw new Error('Ressource strategique inconnue : ' + key);
  const maximum = target === save.hub.systems ? 100 : 999999999;
  target[key] = Math.round(clamp(target[key] + delta, 0, maximum) * 100) / 100;
  return target[key];
}

export function canAfford(save, cost = {}) {
  return Object.entries(cost).every(([key, value]) => getStrategicValue(save, key) >= value);
}

export function missingStrategicCosts(save, cost = {}) {
  return Object.entries(cost)
    .filter(([key, value]) => getStrategicValue(save, key) < value)
    .map(([key, value]) => ({ key, required: value, available: getStrategicValue(save, key) }));
}

function payStrategicCost(save, cost = {}) {
  if (!canAfford(save, cost)) {
    const missing = missingStrategicCosts(save, cost).map(({ key, required, available }) => key + ' ' + available + '/' + required).join(', ');
    throw new Error('Ressources insuffisantes : ' + missing);
  }
  for (const [key, value] of Object.entries(cost)) changeStrategicValue(save, key, -value);
}

function deterministicRoll(save, key) {
  const strategy = ensureStrategy(save);
  const input = key + ':' + strategy.serial + ':' + save.clock.day + ':' + save.clock.hour + ':' + save.profile;
  let hash = 2166136261;
  for (const character of input) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 100 + 1;
}

function addStrategyLog(save, entry) {
  const strategy = ensureStrategy(save);
  strategy.log.unshift({ id: 'strategy-' + Date.now() + '-' + strategy.serial, day: save.clock.day, hour: save.clock.hour, ...entry });
  strategy.log = strategy.log.slice(0, 40);
}

function hasResearch(save, id) {
  return ensureStrategy(save).unlockedResearchIds.includes(id);
}

export function executeStrategicAction(save, actionId) {
  const action = COMMAND_ACTIONS.find((entry) => entry.id === actionId);
  if (!action) throw new Error('Action strategique inconnue.');
  const strategy = ensureStrategy(save);
  if (strategy.currentOperation) throw new Error('Une operation est deja en cours.');
  payStrategicCost(save, action.cost);
  strategy.serial += 1;
  const roll = deterministicRoll(save, action.id);
  const incident = roll <= action.risk;
  let result = '';
  if (action.id === 'frontier-recon') {
    const nextWorld = WORLDS.find((world) => !save.galaxy.unlockedWorldIds.includes(world.id));
    const research = incident ? 4 : 9;
    changeStrategicValue(save, 'research', research);
    save.hub.systems.research = clamp(save.hub.systems.research + (incident ? 3 : 7));
    if (nextWorld && !incident) {
      save.galaxy.unlockedWorldIds.push(nextWorld.id);
      result = nextWorld.name + ' ajoute au reseau ; 9 points de recherche acquis.';
    } else if (nextWorld) {
      save.hub.systems.security = clamp(save.hub.systems.security - 3);
      result = 'Interferences hostiles : route non stabilisee, 4 points de recherche recuperes.';
    } else result = 'Reseau complet ; ' + research + ' points de recherche consolides.';
  }
  if (action.id === 'salvage-run') {
    const credits = incident ? 180 : 620;
    const alloy = incident ? 6 : 22;
    const fuel = incident ? 1 : 5;
    changeStrategicValue(save, 'credits', credits);
    changeStrategicValue(save, 'alloy', alloy);
    changeStrategicValue(save, 'fuel', fuel);
    if (incident) save.hub.systems.hull = clamp(save.hub.systems.hull - 4);
    result = incident
      ? 'Collision pendant extraction : +' + credits + ' credits, +' + alloy + ' alliage, +' + fuel + ' carburant, coque -4%.'
      : 'Epave securisee : +' + credits + ' credits, +' + alloy + ' alliage et +' + fuel + ' carburant.';
  }
  if (action.id === 'research-cycle') {
    const research = incident ? 6 : 13;
    changeStrategicValue(save, 'research', research);
    save.hub.systems.research = clamp(save.hub.systems.research + (incident ? 4 : 9));
    if (incident) save.hub.systems.quarantine = clamp(save.hub.systems.quarantine - 2);
    result = incident ? 'Echantillon instable : +' + research + ' recherche, quarantaine -2%.'
      : 'Cycle MIRE valide : +' + research + ' recherche et laboratoire +9%.';
  }
  if (action.id === 'colony-relief') {
    const worldState = save.galaxy.worldState[save.worldId] || save.galaxy.worldState[WORLDS[0].id];
    worldState.stability = clamp(worldState.stability + (incident ? 2 : 9));
    worldState.infestation = clamp(worldState.infestation - (incident ? 1 : 5));
    worldState.quarantine = clamp(worldState.quarantine + (incident ? 2 : 8));
    if (incident) for (const member of save.crew.filter((entry) => strategy.selectedCrewIds.includes(entry.id))) member.stress = clamp(member.stress + 4);
    result = incident ? 'Convoi attaque : stabilite +2, infestation -1.' : 'Soutien livre : stabilite +9, infestation -5, quarantaine +8.';
  }
  if (action.id === 'crew-rotation') {
    const healing = hasResearch(save, 'trauma-protocol') ? 28 : 20;
    for (const member of save.crew.filter((entry) => !['deceased', 'missing', 'captured'].includes(entry.status))) {
      member.health = clamp(member.health + healing);
      member.stress = clamp(member.stress - 24);
      member.fatigue = clamp(member.fatigue - 30);
      if (['injured', 'recovering'].includes(member.status) && member.health >= 70) member.status = 'active';
    }
    save.hub.systems.morale = clamp(save.hub.systems.morale + (incident ? 3 : 7));
    result = 'Rotation terminee : sante +' + healing + ', stress -24, fatigue -30.';
  }
  advanceStrategicClock(save, action.hours);
  save.statistics.strategicActions += 1;
  addStrategyLog(save, { type: 'command', title: action.name, risk: action.risk, incident, result });
  return { ok: true, action, incident, roll, result };
}

export function completeResearchProject(save, projectId) {
  const project = RESEARCH_PROJECTS.find((entry) => entry.id === projectId);
  if (!project) throw new Error('Projet de recherche inconnu.');
  const strategy = ensureStrategy(save);
  if (strategy.currentOperation) throw new Error('Recherche indisponible pendant une operation.');
  if (strategy.unlockedResearchIds.includes(project.id)) throw new Error('Projet deja termine.');
  payStrategicCost(save, project.cost);
  strategy.serial += 1;
  strategy.unlockedResearchIds.push(project.id);
  advanceStrategicClock(save, project.hours);
  save.statistics.research += 1;
  save.hub.systems.research = clamp(save.hub.systems.research + 12);
  if (project.id === 'xeno-containment') save.hub.systems.quarantine = clamp(save.hub.systems.quarantine + 10);
  if (project.id === 'ship-logistics') save.hub.systems.supplies = clamp(save.hub.systems.supplies + 8);
  const result = project.name + ' termine et applique au runtime strategique.';
  addStrategyLog(save, { type: 'research', title: project.name, risk: 0, incident: false, result });
  return { ok: true, project, result };
}

export function getProcurementQuote(save, kind, item) {
  if (!item?.id) throw new Error('Entree de catalogue invalide.');
  const discount = hasResearch(save, 'ship-logistics') ? 0.85 : 1;
  const factor = rarityFactor(item.rarity);
  if (kind === 'weapon') return { credits: Math.ceil(((140 + item.damage * 8 + item.magazine * 2 + item.penetration * 3) * factor * discount) / 10) * 10 };
  if (kind === 'equipment') return { credits: Math.ceil(((100 + item.charges * 80 + item.mass * 30) * factor * discount) / 10) * 10 };
  if (kind === 'vehicle') return {
    credits: Math.ceil(((900 + item.hull * 10 + item.speed * 5 + item.seats.length * 100) * discount) / 10) * 10,
    alloy: Math.max(4, Math.ceil(((item.hull + item.armor) / 20) * discount))
  };
  throw new Error('Type acquisition inconnu.');
}

export function procureCatalogItem(save, kind, item) {
  const strategy = ensureStrategy(save);
  if (strategy.currentOperation) throw new Error('Acquisition indisponible pendant une operation.');
  const inventoryKey = kind + 'Ids';
  if (!Array.isArray(strategy.inventory[inventoryKey])) throw new Error('Inventaire inconnu.');
  if (strategy.inventory[inventoryKey].includes(item.id)) throw new Error('Materiel deja acquis.');
  const quote = getProcurementQuote(save, kind, item);
  payStrategicCost(save, quote);
  strategy.inventory[inventoryKey].push(item.id);
  strategy.serial += 1;
  advanceStrategicClock(save, kind === 'vehicle' ? 2 : 0.5);
  save.statistics.procurements += 1;
  addStrategyLog(save, { type: 'procurement', title: item.name, risk: 0, incident: false, result: item.name + ' ajoute a inventaire.' });
  return { ok: true, item, quote };
}

export function equipCatalogItem(save, kind, itemId) {
  const strategy = ensureStrategy(save);
  if (strategy.currentOperation) throw new Error('Dotation verrouillee pendant une operation.');
  const inventoryKey = kind + 'Ids';
  if (!strategy.inventory[inventoryKey]?.includes(itemId)) throw new Error('Materiel non acquis.');
  const loadoutKey = kind === 'weapon' ? 'weaponIds' : kind === 'equipment' ? 'equipmentIds' : null;
  if (!loadoutKey) throw new Error('Type de dotation inconnu.');
  const current = save.player[loadoutKey].filter((id) => strategy.inventory[inventoryKey].includes(id) && id !== itemId);
  save.player[loadoutKey] = [...current.slice(-1), itemId];
  addStrategyLog(save, { type: 'loadout', title: 'Dotation modifiee', risk: 0, incident: false, result: itemId + ' affecte a Mara Vega.' });
  return [...save.player[loadoutKey]];
}

export function selectStrategicVehicle(save, vehicleId) {
  const strategy = ensureStrategy(save);
  if (strategy.currentOperation) throw new Error('Vehicule verrouille pendant une operation.');
  if (!strategy.inventory.vehicleIds.includes(vehicleId)) throw new Error('Vehicule non acquis.');
  strategy.selectedVehicleId = vehicleId;
  addStrategyLog(save, { type: 'loadout', title: 'Vehicule affecte', risk: 0, incident: false, result: vehicleId + ' prepare pour la prochaine operation.' });
  return vehicleId;
}

export function assignCrewMember(save, crewId) {
  const strategy = ensureStrategy(save);
  if (strategy.currentOperation) throw new Error('Escouade verrouillee pendant une operation.');
  const member = save.crew.find((entry) => entry.id === crewId);
  if (!member) throw new Error('Membre Echo-9 inconnu.');
  if (strategy.selectedCrewIds.includes(crewId)) {
    if (strategy.selectedCrewIds.length <= 1) throw new Error('Escouade minimale : un membre.');
    strategy.selectedCrewIds = strategy.selectedCrewIds.filter((id) => id !== crewId);
    return { assigned: false, crewId };
  }
  if (member.status !== 'active') throw new Error('Membre inapte au deploiement.');
  if (strategy.selectedCrewIds.length >= MAX_SQUAD_SIZE) throw new Error('Escouade limitee a ' + MAX_SQUAD_SIZE + ' membres.');
  strategy.selectedCrewIds.push(crewId);
  return { assigned: true, crewId };
}

export function treatCrewMember(save, crewId) {
  const strategy = ensureStrategy(save);
  if (strategy.currentOperation) throw new Error('Soins indisponibles pendant une operation.');
  const member = save.crew.find((entry) => entry.id === crewId);
  if (!member || member.status === 'deceased') throw new Error('Membre non traitable.');
  payStrategicCost(save, { medical: 1 });
  const healing = hasResearch(save, 'trauma-protocol') ? 42 : 30;
  member.health = clamp(member.health + healing);
  member.stress = clamp(member.stress - 12);
  member.fatigue = clamp(member.fatigue - 15);
  if (['injured', 'recovering'].includes(member.status) && member.health >= 70) member.status = 'active';
  strategy.serial += 1;
  advanceStrategicClock(save, 1);
  addStrategyLog(save, { type: 'medical', title: 'Traitement individuel', risk: 0, incident: false, result: crewId + ' stabilise : sante +' + healing + '.' });
  return member;
}

export function applyCostume(save, costumeId) {
  if (ensureStrategy(save).currentOperation) throw new Error('Combinaison verrouillee pendant une operation.');
  if (typeof costumeId !== 'string' || !costumeId) throw new Error('Combinaison invalide.');
  save.player.costumeId = costumeId;
  addStrategyLog(save, { type: 'loadout', title: 'Combinaison appliquee', risk: 0, incident: false, result: costumeId + ' devient la tenue active.' });
  return costumeId;
}

export function getOperationBrief(save, campaign, world) {
  const strategy = ensureStrategy(save);
  const selectedCrew = save.crew.filter((member) => strategy.selectedCrewIds.includes(member.id) && member.status === 'active');
  const state = save.galaxy.worldState[world.id] || world;
  const averageStress = selectedCrew.reduce((sum, member) => sum + member.stress, 0) / Math.max(1, selectedCrew.length);
  const averageFatigue = selectedCrew.reduce((sum, member) => sum + member.fatigue, 0) / Math.max(1, selectedCrew.length);
  let risk = 10 + world.danger * 4 + state.infestation * 0.28 + averageStress * 0.16 + averageFatigue * 0.12 - Math.max(0, campaign.routes - 1) * 1.5;
  if (hasResearch(save, 'motion-analysis')) risk -= 8;
  if (strategy.selectedVehicleId && hasResearch(save, 'vehicle-doctrine')) risk -= 7;
  risk = Math.round(clamp(risk, 5, 95));
  let fuel = 2 + Math.ceil(world.danger / 3);
  if (strategy.selectedVehicleId && hasResearch(save, 'vehicle-doctrine')) fuel = Math.max(1, fuel - 1);
  const cost = { fuel, supplies: 3 + Math.ceil(world.danger / 2) };
  if (world.atmosphere !== 'breathable') cost.medical = 1;
  const reward = { credits: 420 + world.danger * 85 + Math.max(0, campaign.routes - 1) * 35, research: 4 + Math.ceil(world.danger / 2), alloy: 4 + Math.ceil(world.danger / 2) };
  return {
    risk,
    hours: Math.round((0.75 + world.danger * 0.2) * 100) / 100,
    cost,
    reward,
    crewIds: selectedCrew.map((member) => member.id),
    ready: save.galaxy.unlockedWorldIds.includes(world.id) && selectedCrew.length > 0 && canAfford(save, cost),
    worldUnlocked: save.galaxy.unlockedWorldIds.includes(world.id)
  };
}

export function beginOperation(save, campaign, world) {
  const strategy = ensureStrategy(save);
  if (strategy.currentOperation?.campaignId === campaign.id) {
    const operation = strategy.currentOperation;
    operation.costumeId ??= save.player.costumeId || null;
    operation.neuroProfileId ??= strategy.selectedNeuroProfileId || null;
    operation.apexDossierId ??= strategy.selectedApexDossierId || null;
    operation.difficulty ??= save.settings?.difficulty || save.difficulty || 'standard';
    operation.resumeState ??= null;
    return { ok: true, resumed: true, operation };
  }
  if (strategy.currentOperation) throw new Error('Une autre operation est deja en cours.');
  const brief = getOperationBrief(save, campaign, world);
  if (!brief.worldUnlocked) throw new Error('Route verrouillee : effectuez une reconnaissance.');
  if (!brief.crewIds.length) throw new Error('Aucun membre actif dans escouade.');
  payStrategicCost(save, brief.cost);
  strategy.serial += 1;
  advanceStrategicClock(save, brief.hours);
  for (const member of save.crew.filter((entry) => brief.crewIds.includes(entry.id))) {
    member.fatigue = clamp(member.fatigue + 10 + world.danger);
    member.stress = clamp(member.stress + Math.ceil(brief.risk / 10));
    member.missions += 1;
  }
  strategy.currentOperation = {
    id: 'operation-' + strategy.serial + '-' + campaign.id,
    campaignId: campaign.id,
    worldId: world.id,
    startedDay: save.clock.day,
    startedHour: save.clock.hour,
    risk: brief.risk,
    cost: structuredClone(brief.cost),
    reward: structuredClone(brief.reward),
    crewIds: [...brief.crewIds],
    weaponIds: [...save.player.weaponIds],
    equipmentIds: [...save.player.equipmentIds],
    vehicleId: strategy.selectedVehicleId,
    costumeId: save.player.costumeId || null,
    neuroProfileId: strategy.selectedNeuroProfileId || null,
    apexDossierId: strategy.selectedApexDossierId || null,
    difficulty: save.settings?.difficulty || save.difficulty || 'standard',
    resumeState: null,
    flags: {}
  };
  strategy.plannedCampaignId = campaign.id;
  addStrategyLog(save, { type: 'operation', title: campaign.name, risk: brief.risk, incident: false, result: 'Deploiement lance vers ' + world.name + '.' });
  return { ok: true, resumed: false, brief, operation: strategy.currentOperation };
}



const sanitizeResumeNumber = (value, fallback = 0, min = 0, max = 999999) => numberBetween(value, fallback, min, max);
const sanitizeResumeEntity = (candidate, fields) => {
  if (!isRecord(candidate)) return null;
  return Object.fromEntries(fields.flatMap(([key, fallback, min, max]) => {
    if (typeof fallback === 'boolean') return [[key, Boolean(candidate[key])]];
    if (typeof fallback === 'string') return [[key, typeof candidate[key] === 'string' ? candidate[key].slice(0, 120) : fallback]];
    return [[key, sanitizeResumeNumber(candidate[key], fallback, min, max)]];
  }));
};

const sanitizeNativeResumeValue = (value, depth = 0) => {
  if (depth > 8 || value === undefined || typeof value === 'function') return null;
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.slice(0, 180);
  if (typeof value === 'number') return Number.isFinite(value) ? Math.max(-999999999, Math.min(999999999, value)) : 0;
  if (Array.isArray(value)) return value.slice(0, 256).map((entry) => sanitizeNativeResumeValue(entry, depth + 1));
  if (!isRecord(value)) return null;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => /^[a-zA-Z0-9_-]{1,80}$/.test(key))
    .slice(0, 256)
    .map(([key, entry]) => [key, sanitizeNativeResumeValue(entry, depth + 1)]));
};

const sanitizeNativeOperationResumeState = (candidate) => {
  const sanitized = sanitizeNativeResumeValue(candidate);
  if (!isRecord(sanitized) || Number(sanitized.schema) !== 1 || !isRecord(sanitized.identity)) return null;
  sanitized.schema = 1;
  return sanitized;
};

export function sanitizeOperationResumeState(candidate) {
  if (!isRecord(candidate)) return null;
  if (Number(candidate.schema) === 1) return sanitizeNativeOperationResumeState(candidate);
  const checkpoint = sanitizeResumeEntity(candidate.checkpoint, [
    ['id', 'checkpoint', 0, 0], ['x', 0, 0, 6200], ['y', 0, 0, 1080]
  ]);
  const player = sanitizeResumeEntity(candidate.player, [
    ['x', 160, 0, 6200], ['y', 838, 0, 1080], ['health', 100, 0, 300], ['armor', 50, 0, 300],
    ['ammo', 0, 0, 9999], ['ammoReserve', 0, 0, 99999], ['weapon', 'rifle', 0, 0],
    ['alive', true, 0, 0], ['downed', false, 0, 0], ['kills', 0, 0, 999999]
  ]);
  const mission = sanitizeResumeEntity(candidate.mission, [
    ['elapsed', 0, 0, 999999], ['retries', 0, 0, 9999], ['casualties', 0, 0, 9999], ['phase', 'restore-power', 0, 0]
  ]);
  const objectives = isRecord(candidate.objectives)
    ? Object.fromEntries(Object.entries(candidate.objectives).slice(0, 32).map(([key, value]) => [key.slice(0, 80), Boolean(value)]))
    : {};
  const inventory = isRecord(candidate.inventory)
    ? Object.fromEntries(Object.entries(candidate.inventory).slice(0, 32).map(([key, value]) => [
      key.slice(0, 80),
      typeof value === 'boolean' ? value : sanitizeResumeNumber(value, 0, 0, 999999)
    ]))
    : {};
  const sanitizeRuntimeList = (value, limit, map) => Array.isArray(value) ? value.filter(isRecord).slice(0, limit).map(map) : [];
  const doors = sanitizeRuntimeList(candidate.doors, 64, (entry, index) => ({
    id: typeof entry.id === 'string' ? entry.id.slice(0, 120) : 'door-' + index,
    open: Boolean(entry.open),
    progress: sanitizeResumeNumber(entry.progress, entry.open ? 1 : 0, 0, 1)
  }));
  const vents = sanitizeRuntimeList(candidate.vents, 64, (entry, index) => ({
    id: typeof entry.id === 'string' ? entry.id.slice(0, 120) : 'vent-' + index,
    open: Boolean(entry.open)
  }));
  const equipment = sanitizeRuntimeList(candidate.equipment, 32, (entry, index) => ({
    id: typeof entry.id === 'string' ? entry.id.slice(0, 120) : 'equipment-' + index,
    remaining: sanitizeResumeNumber(entry.remaining, 0, 0, 999),
    uses: sanitizeResumeNumber(entry.uses, 0, 0, 999)
  }));
  const supplies = sanitizeRuntimeList(candidate.pickups?.supplies, 64, (entry, index) => ({
    id: typeof entry.id === 'string' ? entry.id.slice(0, 120) : 'supply-' + index,
    used: Boolean(entry.used)
  }));
  return {
    checkpoint,
    player,
    mission,
    objectives,
    inventory,
    doors,
    vents,
    equipment,
    pickups: {
      weaponTaken: Boolean(candidate.pickups?.weaponTaken),
      toolTaken: Boolean(candidate.pickups?.toolTaken),
      archiveRecovered: Boolean(candidate.pickups?.archiveRecovered),
      powerActive: Boolean(candidate.pickups?.powerActive),
      supplies
    }
  };
}

export function recordOperationResumeState(save, candidate) {
  const operation = ensureStrategy(save).currentOperation;
  if (!operation) return false;
  operation.resumeState = sanitizeOperationResumeState(candidate);
  return Boolean(operation.resumeState);
}

export function resolveOperationDeployment(save, {
  crewCatalog = CREW,
  weaponCatalog = [],
  equipmentCatalog = [],
  vehicleCatalog = [],
  costumeCatalog = [],
  neuroProfileCatalog = [],
  apexDossierCatalog = []
} = {}) {
  const operation = ensureStrategy(save).currentOperation;
  if (!operation) return null;
  const crewIds = stringList(operation.crewIds);
  const weaponIds = stringList(operation.weaponIds);
  const equipmentIds = stringList(operation.equipmentIds);
  const vehicleId = typeof operation.vehicleId === 'string' ? operation.vehicleId : null;
  const costumeId = typeof operation.costumeId === 'string' ? operation.costumeId : null;
  const neuroProfileId = typeof operation.neuroProfileId === 'string' ? operation.neuroProfileId : null;
  const apexDossierId = typeof operation.apexDossierId === 'string' ? operation.apexDossierId : null;
  const crew = crewIds.map((id) => ({
    ...crewCatalog.find((entry) => entry.id === id),
    ...save.crew.find((entry) => entry.id === id)
  })).filter((entry) => entry.id);
  const weapons = weaponIds.map((id) => weaponCatalog.find((entry) => entry.id === id)).filter(Boolean);
  const equipment = equipmentIds.map((id) => equipmentCatalog.find((entry) => entry.id === id)).filter(Boolean);
  const vehicle = vehicleId ? vehicleCatalog.find((entry) => entry.id === vehicleId) || null : null;
  const costume = costumeId ? costumeCatalog.find((entry) => entry.id === costumeId) || null : null;
  const neuroProfile = neuroProfileId ? neuroProfileCatalog.find((entry) => entry.id === neuroProfileId) || null : null;
  const apexDossier = apexDossierId ? apexDossierCatalog.find((entry) => entry.id === apexDossierId) || null : null;
  return {
    operation,
    crewIds,
    weaponIds,
    equipmentIds,
    vehicleId,
    costumeId,
    neuroProfileId,
    apexDossierId,
    difficulty: typeof operation.difficulty === 'string' ? operation.difficulty : 'standard',
    resumeState: operation.resumeState ? structuredClone(operation.resumeState) : null,
    crew,
    weapons,
    weapon: weapons.at(-1) || null,
    equipment,
    vehicle,
    costume,
    neuroProfile,
    apexDossier,
    missing: {
      crewIds: crewIds.filter((id) => !crew.some((entry) => entry.id === id)),
      weaponIds: weaponIds.filter((id) => !weapons.some((entry) => entry.id === id)),
      equipmentIds: equipmentIds.filter((id) => !equipment.some((entry) => entry.id === id)),
      vehicleId: vehicleId && !vehicle ? vehicleId : null,
      costumeId: costumeId && !costume ? costumeId : null,
      neuroProfileId: neuroProfileId && !neuroProfile ? neuroProfileId : null,
      apexDossierId: apexDossierId && !apexDossier ? apexDossierId : null
    }
  };
}

export function recordOperationFlag(save, flag, value = true) {
  const operation = ensureStrategy(save).currentOperation;
  if (!operation) return false;
  operation.flags[flag] = value;
  return true;
}

export function resolveOperation(save, { success, kills = 0, reason = success ? 'objective' : 'failure' } = {}) {
  const strategy = ensureStrategy(save);
  const operation = strategy.currentOperation;
  if (!operation) return { ok: false, reason: 'no-operation' };
  const worldState = save.galaxy.worldState[operation.worldId];
  const containment = hasResearch(save, 'xeno-containment');
  let result = '';
  if (success) {
    for (const [key, value] of Object.entries(operation.reward)) changeStrategicValue(save, key, value);
    changeStrategicValue(save, 'pathogen', Math.max(1, Math.ceil(kills / 5)));
    worldState.stability = clamp(worldState.stability + 8);
    worldState.infestation = clamp(worldState.infestation - (containment ? 11 : 7));
    worldState.quarantine = clamp(worldState.quarantine + (containment ? 8 : 4));
    if (worldState.stability >= 70 && worldState.infestation <= 35) worldState.colonyLevel = Math.min(100, worldState.colonyLevel + 1);
    if (!save.galaxy.completedCampaignIds.includes(operation.campaignId)) save.galaxy.completedCampaignIds.push(operation.campaignId);
    const crew = save.crew.filter((member) => operation.crewIds.includes(member.id));
    crew.forEach((member, index) => {
      member.kills += Math.floor(kills / Math.max(1, crew.length)) + (index < kills % Math.max(1, crew.length) ? 1 : 0);
      member.stress = clamp(member.stress + Math.ceil(operation.risk / 12));
    });
    save.statistics.campaigns += 1;
    result = 'Objectif accompli : stabilite +8, infestation -' + (containment ? 11 : 7) + ', recompenses transferees.';
  } else {
    worldState.stability = clamp(worldState.stability - (reason === 'retreat' ? 2 : 6));
    worldState.infestation = clamp(worldState.infestation + (reason === 'retreat' ? 2 : 7));
    const lead = save.crew.find((member) => operation.crewIds.includes(member.id) && member.status !== 'deceased');
    if (lead) {
      const damage = hasResearch(save, 'trauma-protocol') ? 24 : 38;
      lead.health = clamp(lead.health - damage);
      lead.stress = clamp(lead.stress + 18);
      lead.injuries.push({ type: reason === 'retreat' ? 'combat-stress' : 'mission-trauma', day: save.clock.day, severity: damage });
      if (lead.health <= 0) {
        lead.status = 'deceased';
        save.memorial.push({ crewId: lead.id, day: save.clock.day, campaignId: operation.campaignId, reason });
      } else lead.status = 'injured';
    }
    for (const member of save.crew.filter((entry) => operation.crewIds.includes(entry.id) && entry !== lead)) member.stress = clamp(member.stress + 9);
    if (reason === 'retreat') save.statistics.retreats += 1;
    result = reason === 'retreat' ? 'Retraite : stabilite -2, infestation +2.' : 'Echec : stabilite -6, infestation +7 et un operateur blesse.';
  }
  strategy.lastOperation = { ...structuredClone(operation), success: Boolean(success), reason, result, completedDay: save.clock.day, completedHour: save.clock.hour };
  strategy.currentOperation = null;
  addStrategyLog(save, { type: 'operation-result', title: operation.campaignId, risk: operation.risk, incident: !success, result });
  return { ok: true, success: Boolean(success), result, operation: strategy.lastOperation };
}

export function getStrategySnapshot(save) {
  const strategy = ensureStrategy(save);
  return structuredClone({
    clock: save.clock,
    resources: save.galaxy.resources,
    systems: save.hub.systems,
    selectedCrewIds: strategy.selectedCrewIds,
    inventory: strategy.inventory,
    selectedVehicleId: strategy.selectedVehicleId,
    plannedCampaignId: strategy.plannedCampaignId,
    unlockedResearchIds: strategy.unlockedResearchIds,
    currentOperation: strategy.currentOperation,
    lastOperation: strategy.lastOperation,
    log: strategy.log
  });
}

export function migrateSave(input, profile = 1) {
  const base = createDefaultSave(profile);
  if (!isRecord(input)) return base;
  const migrated = structuredClone(base);
  const source = structuredClone(input);

  const player = isRecord(source.player) ? source.player : {};
  Object.assign(migrated.player, player);
  migrated.player.name = typeof player.name === 'string' ? player.name.slice(0, 80) : base.player.name;
  for (const key of ['health', 'armor', 'stress']) migrated.player[key] = numberBetween(player[key], base.player[key], 0, 100);
  migrated.player.weaponIds = stringList(player.weaponIds, base.player.weaponIds);
  migrated.player.equipmentIds = stringList(player.equipmentIds, base.player.equipmentIds);
  migrated.player.ammo = mergeNumbers(base.player.ammo, player.ammo, 0, 999999);

  const hub = isRecord(source.hub) ? source.hub : {};
  Object.assign(migrated.hub, hub);
  migrated.hub.deck = Math.floor(numberBetween(hub.deck, base.hub.deck, 0, 3));
  const sourceSchema = Number(source.schema);
  const legacyHubPosition = numberBetween(hub.positionX, base.hub.positionX, 40, 5030);
  const v50HubPosition = sourceSchema === 48 ? legacyHubPosition * 2
    : sourceSchema === 49 ? legacyHubPosition * (4 / 3) : legacyHubPosition;
  migrated.hub.positionX = numberBetween(v50HubPosition, base.hub.positionX, 40, 5030);
  migrated.hub.roomId = typeof hub.roomId === 'string' && /^[a-z0-9-]{1,40}$/.test(hub.roomId) ? hub.roomId : base.hub.roomId;
  migrated.hub.systems = mergeNumbers(base.hub.systems, hub.systems, 0, 100);
  migrated.hub.services = Object.fromEntries(Object.entries(isRecord(hub.services) ? hub.services : {})
    .filter(([key, value]) => /^service:[a-z-]{1,32}$/.test(key) && Number.isFinite(Number(value)))
    .map(([key, value]) => [key, Math.max(0, Math.floor(Number(value)))]));
  migrated.hub.visited = stringList(hub.visited, base.hub.visited).filter((id) => /^[a-z0-9-]{1,40}$/.test(id));
  migrated.hub.moduleIds = stringList(hub.moduleIds, base.hub.moduleIds);

  const galaxy = isRecord(source.galaxy) ? source.galaxy : {};
  Object.assign(migrated.galaxy, galaxy);
  migrated.galaxy.resources = mergeNumbers(base.galaxy.resources, galaxy.resources, 0, 999999999);
  migrated.galaxy.unlockedWorldIds = stringList(galaxy.unlockedWorldIds, base.galaxy.unlockedWorldIds);
  migrated.galaxy.completedCampaignIds = stringList(galaxy.completedCampaignIds, base.galaxy.completedCampaignIds);
  const worldState = isRecord(galaxy.worldState) ? galaxy.worldState : {};
  migrated.galaxy.worldState = Object.fromEntries(Object.entries(base.galaxy.worldState).map(([id, fallback]) => {
    const candidate = isRecord(worldState[id]) ? worldState[id] : {};
    return [id, {
      ...fallback,
      stability: numberBetween(candidate.stability, fallback.stability, 0, 100),
      infestation: numberBetween(candidate.infestation, fallback.infestation, 0, 100),
      colonyLevel: Math.floor(numberBetween(candidate.colonyLevel, fallback.colonyLevel, 0, 100)),
      faction: typeof candidate.faction === 'string' ? candidate.faction.slice(0, 80) : fallback.faction,
      quarantine: numberBetween(candidate.quarantine, fallback.quarantine, 0, 100),
      population: Math.floor(numberBetween(candidate.population, fallback.population, 0, 999999999))
    }];
  }));
  migrated.galaxy.alerts = Array.isArray(galaxy.alerts) ? galaxy.alerts.filter(isRecord).slice(0, 256) : base.galaxy.alerts;
  migrated.galaxy.diplomacyWindows = Object.fromEntries(Object.entries(isRecord(galaxy.diplomacyWindows) ? galaxy.diplomacyWindows : {})
    .filter(([worldId, absoluteHour]) => Object.hasOwn(base.galaxy.worldState, worldId) && Number.isFinite(Number(absoluteHour)))
    .map(([worldId, absoluteHour]) => [worldId, Math.max(0, Number(absoluteHour))]));

  const clock = isRecord(source.clock) ? source.clock : {};
  const day = Math.floor(numberBetween(clock.day, base.clock.day, 1, 100000));
  const hour = numberBetween(clock.hour, base.clock.hour, 0, 2400000);
  const absoluteHours = (day - 1) * 24 + hour;
  migrated.clock = { day: Math.floor(absoluteHours / 24) + 1, hour: Math.round((absoluteHours % 24) * 100) / 100 };

  for (const key of ['scene', 'worldId', 'levelSeedId', 'difficulty']) {
    if (typeof source[key] === 'string') migrated[key] = source[key].slice(0, 120);
  }
  if (typeof source.campaignId === 'string' || source.campaignId === null) migrated.campaignId = source.campaignId;

  const importedCrew = Array.isArray(source.crew) ? source.crew.filter(isRecord) : [];
  migrated.crew = base.crew.map((fallback, index) => {
    const candidate = importedCrew.find((member) => member.id === fallback.id) || importedCrew[index] || {};
    return {
      ...fallback,
      ...candidate,
      id: fallback.id,
      status: CREW_STATUSES.has(candidate.status) ? candidate.status : fallback.status,
      health: numberBetween(candidate.health, fallback.health, 0, 100),
      stress: numberBetween(candidate.stress, fallback.stress, 0, 100),
      fatigue: numberBetween(candidate.fatigue, fallback.fatigue, 0, 100),
      loyalty: numberBetween(candidate.loyalty, fallback.loyalty, 0, 100),
      missions: Math.floor(numberBetween(candidate.missions, fallback.missions, 0, 999999)),
      kills: Math.floor(numberBetween(candidate.kills, fallback.kills, 0, 999999)),
      injuries: Array.isArray(candidate.injuries) ? candidate.injuries.slice(0, 64) : fallback.injuries
    };
  });

  const strategy = isRecord(source.strategy) ? source.strategy : {};
  const inventory = isRecord(strategy.inventory) ? strategy.inventory : {};
  const knownCrewIds = new Set(base.crew.map((member) => member.id));
  const selectedCrewIds = stringList(strategy.selectedCrewIds, base.strategy.selectedCrewIds).filter((id) => knownCrewIds.has(id)).slice(0, MAX_SQUAD_SIZE);
  const weaponIds = [...new Set([...base.strategy.inventory.weaponIds, ...migrated.player.weaponIds, ...stringList(inventory.weaponIds)])];
  const equipmentIds = [...new Set([...base.strategy.inventory.equipmentIds, ...migrated.player.equipmentIds, ...stringList(inventory.equipmentIds)])];
  const vehicleIds = [...new Set([...base.strategy.inventory.vehicleIds, ...stringList(inventory.vehicleIds)])];
  const sanitizeValues = (candidate) => isRecord(candidate)
    ? Object.fromEntries(Object.entries(candidate).slice(0, 24).map(([key, value]) => [key.slice(0, 60), numberBetween(value, 0, 0, 999999999)]))
    : {};
  const sanitizeOperation = (candidate) => {
    if (!isRecord(candidate) || typeof candidate.campaignId !== 'string' || typeof candidate.worldId !== 'string') return null;
    return {
      id: typeof candidate.id === 'string' ? candidate.id.slice(0, 180) : 'migrated-operation',
      campaignId: candidate.campaignId.slice(0, 120),
      worldId: candidate.worldId.slice(0, 120),
      startedDay: Math.floor(numberBetween(candidate.startedDay, migrated.clock.day, 1, 100000)),
      startedHour: numberBetween(candidate.startedHour, migrated.clock.hour, 0, 24),
      risk: numberBetween(candidate.risk, 50, 0, 100),
      cost: sanitizeValues(candidate.cost),
      reward: sanitizeValues(candidate.reward),
      crewIds: stringList(candidate.crewIds).filter((id) => knownCrewIds.has(id)).slice(0, MAX_SQUAD_SIZE),
      weaponIds: stringList(candidate.weaponIds).slice(0, 8),
      equipmentIds: stringList(candidate.equipmentIds).slice(0, 8),
      vehicleId: typeof candidate.vehicleId === 'string' ? candidate.vehicleId.slice(0, 120) : null,
      costumeId: typeof candidate.costumeId === 'string' ? candidate.costumeId.slice(0, 120) : null,
      neuroProfileId: typeof candidate.neuroProfileId === 'string' ? candidate.neuroProfileId.slice(0, 120) : null,
      apexDossierId: typeof candidate.apexDossierId === 'string' ? candidate.apexDossierId.slice(0, 120) : null,
      difficulty: ['story', 'standard', 'nightmare'].includes(candidate.difficulty) ? candidate.difficulty : 'standard',
      resumeState: sanitizeOperationResumeState(candidate.resumeState),
      flags: isRecord(candidate.flags) ? Object.fromEntries(Object.entries(candidate.flags).slice(0, 32).map(([key, value]) => [key.slice(0, 60), Boolean(value)])) : {}
    };
  };
  migrated.strategy = {
    serial: Math.floor(numberBetween(strategy.serial, base.strategy.serial, 0, 999999999)),
    selectedCrewIds: selectedCrewIds.length ? selectedCrewIds : [...base.strategy.selectedCrewIds],
    inventory: { weaponIds, equipmentIds, vehicleIds },
    selectedVehicleId: typeof strategy.selectedVehicleId === 'string' && vehicleIds.includes(strategy.selectedVehicleId)
      ? strategy.selectedVehicleId : vehicleIds[0] || null,
    selectedNeuroProfileId: typeof strategy.selectedNeuroProfileId === 'string' ? strategy.selectedNeuroProfileId.slice(0, 120) : null,
    selectedApexDossierId: typeof strategy.selectedApexDossierId === 'string' ? strategy.selectedApexDossierId.slice(0, 120) : null,
    plannedCampaignId: typeof strategy.plannedCampaignId === 'string' ? strategy.plannedCampaignId.slice(0, 120) : null,
    unlockedResearchIds: stringList(strategy.unlockedResearchIds).filter((id) => RESEARCH_PROJECTS.some((project) => project.id === id)),
    currentOperation: sanitizeOperation(strategy.currentOperation),
    lastOperation: isRecord(strategy.lastOperation) ? {
      ...sanitizeOperation(strategy.lastOperation),
      success: Boolean(strategy.lastOperation.success),
      reason: typeof strategy.lastOperation.reason === 'string' ? strategy.lastOperation.reason.slice(0, 60) : 'migrated',
      result: typeof strategy.lastOperation.result === 'string' ? strategy.lastOperation.result.slice(0, 500) : ''
    } : null,
    log: Array.isArray(strategy.log) ? strategy.log.filter(isRecord).slice(0, 40).map((entry, index) => ({
      id: typeof entry.id === 'string' ? entry.id.slice(0, 180) : 'migrated-log-' + index,
      day: Math.floor(numberBetween(entry.day, migrated.clock.day, 1, 100000)),
      hour: numberBetween(entry.hour, migrated.clock.hour, 0, 24),
      type: typeof entry.type === 'string' ? entry.type.slice(0, 40) : 'legacy',
      title: typeof entry.title === 'string' ? entry.title.slice(0, 180) : 'Archive',
      risk: numberBetween(entry.risk, 0, 0, 100),
      incident: Boolean(entry.incident),
      result: typeof entry.result === 'string' ? entry.result.slice(0, 500) : ''
    })) : []
  };

  const editor = isRecord(source.editor) ? source.editor : {};
  migrated.editor = { ...base.editor, ...editor, projects: Array.isArray(editor.projects) ? editor.projects.filter(isRecord).slice(0, 128) : base.editor.projects };
  migrated.memorial = Array.isArray(source.memorial) ? source.memorial.filter(isRecord).slice(0, 512) : base.memorial;
  const settings = isRecord(source.settings) ? source.settings : {};
  migrated.settings = { ...base.settings, ...settings };
  for (const key of ['subtitles', 'reducedMotion', 'coop']) migrated.settings[key] = typeof settings[key] === 'boolean' ? settings[key] : base.settings[key];
  migrated.settings.screenShake = numberBetween(settings.screenShake, base.settings.screenShake, 0, 1);
  const aimAssist = settings.aimAssist;
  migrated.settings.aimAssist = ['off', 'standard', 'high'].includes(aimAssist)
    ? aimAssist
    : Number.isFinite(Number(aimAssist))
      ? Number(aimAssist) <= 0 ? 'off' : Number(aimAssist) >= 0.6 ? 'high' : 'standard'
      : base.settings.aimAssist;
  const statistics = isRecord(source.statistics) ? source.statistics : {};
  migrated.statistics = mergeNumbers(base.statistics, statistics, 0, 999999999);

  migrated.schema = SAVE_SCHEMA;
  migrated.release = RELEASE.version;
  migrated.profile = Math.max(1, Math.min(3, Math.floor(Number(profile) || 1)));
  migrated.createdAt = numberBetween(source.createdAt, base.createdAt, 0);
  migrated.updatedAt = Date.now();
  const previousVersion = typeof source.release === 'string' ? source.release : typeof source.version === 'string' ? source.version : null;
  migrated.migratedFrom = previousVersion || `schema-${Number.isFinite(Number(source.schema)) ? source.schema : 'legacy'}`;
  return migrated;
}

const safeParse = (text) => {
  try { return JSON.parse(text); } catch { return null; }
};

export class SaveSystem {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage;
    this.profile = 1;
    this.data = createDefaultSave(this.profile);
  }

  key(profile = this.profile) { return `${SAVE_PREFIX}${profile}`; }

  listProfiles() {
    return [1, 2, 3].map((profile) => {
      const data = safeParse(this.storage?.getItem(this.key(profile)) || '');
      return data ? {
        profile,
        updatedAt: data.updatedAt,
        release: data.release,
        worldId: data.worldId,
        campaigns: data.statistics?.campaigns || 0,
        playSeconds: data.statistics?.playSeconds || 0
      } : { profile, empty: true };
    });
  }

  discoverLegacy() {
    for (const key of LEGACY_KEYS) {
      const candidate = safeParse(this.storage?.getItem(key) || '');
      if (candidate) return { key, data: candidate };
    }
    return null;
  }

  load(profile = 1) {
    this.profile = Math.max(1, Math.min(3, Number(profile) || 1));
    const current = safeParse(this.storage?.getItem(this.key()) || '');
    if (current) {
      this.data = migrateSave(current, this.profile);
      return this.data;
    }
    const legacy = this.discoverLegacy();
    this.data = migrateSave(legacy?.data, this.profile);
    if (legacy) this.data.migratedFromKey = legacy.key;
    return this.data;
  }

  newGame(profile = 1) {
    this.profile = profile;
    this.data = createDefaultSave(profile);
    this.commit();
    return this.data;
  }

  commit(patch = null) {
    if (patch && typeof patch === 'object') this.data = migrateSave({ ...this.data, ...patch }, this.profile);
    this.data.updatedAt = Date.now();
    this.storage?.setItem(this.key(), JSON.stringify(this.data));
    globalThis.dispatchEvent?.(new CustomEvent('atf:saved', { detail: { profile: this.profile, updatedAt: this.data.updatedAt } }));
    return this.data;
  }

  delete(profile = this.profile) {
    this.storage?.removeItem(this.key(profile));
    if (profile === this.profile) this.data = createDefaultSave(profile);
  }

  export() {
    return JSON.stringify(this.data, null, 2);
  }

  import(text, profile = this.profile) {
    const parsed = safeParse(text);
    if (!parsed) throw new Error('Fichier de sauvegarde invalide.');
    this.profile = profile;
    this.data = migrateSave(parsed, profile);
    this.commit();
    return this.data;
  }
}
