import { CREW, RELEASE, WORLDS } from './content.js';

export const SAVE_SCHEMA = 50;
export const SAVE_PREFIX = 'atf-v47-profile-';
export const LEGACY_KEYS = [
  'ALIENS_INFESTATION_BLACKOUT_SAVE',
  'BLACKOUT_REFORGED_SAVE',
  'ALIENS_TANTALUS_FRONTIER_SAVE',
  'atf-save-v41',
  'atf-save-v43',
  'atf-save-v45'
];

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
      resources: { credits: 3200, alloy: 80, fuel: 64, medical: 22, research: 0, pathogen: 0 }
    },
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
      aimAssist: 0.3,
      music: 0.45,
      effects: 0.7,
      coop: false
    },
    statistics: { playSeconds: 0, kills: 0, shots: 0, hits: 0, deaths: 0, rescues: 0, rooms: 0, campaigns: 0 }
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

  const editor = isRecord(source.editor) ? source.editor : {};
  migrated.editor = { ...base.editor, ...editor, projects: Array.isArray(editor.projects) ? editor.projects.filter(isRecord).slice(0, 128) : base.editor.projects };
  migrated.memorial = Array.isArray(source.memorial) ? source.memorial.filter(isRecord).slice(0, 512) : base.memorial;
  const settings = isRecord(source.settings) ? source.settings : {};
  migrated.settings = { ...base.settings, ...settings };
  for (const key of ['subtitles', 'reducedMotion', 'coop']) migrated.settings[key] = typeof settings[key] === 'boolean' ? settings[key] : base.settings[key];
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
