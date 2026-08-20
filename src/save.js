import { CREW, RELEASE, WORLDS } from './content.js';

export const SAVE_SCHEMA = 47;
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
      roomId: 'bridge',
      visited: ['bridge', 'briefing'],
      systems: { hull: 100, power: 92, oxygen: 100, security: 76, quarantine: 64, morale: 72, supplies: 78, research: 0 },
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

export function migrateSave(input, profile = 1) {
  const base = createDefaultSave(profile);
  if (!input || typeof input !== 'object') return base;
  const migrated = structuredClone(base);
  const source = structuredClone(input);

  if (source.player) Object.assign(migrated.player, source.player);
  if (source.hub) {
    Object.assign(migrated.hub, source.hub);
    migrated.hub.systems = { ...base.hub.systems, ...(source.hub.systems || {}) };
  }
  if (source.galaxy) {
    Object.assign(migrated.galaxy, source.galaxy);
    migrated.galaxy.resources = { ...base.galaxy.resources, ...(source.galaxy.resources || {}) };
    migrated.galaxy.worldState = { ...base.galaxy.worldState, ...(source.galaxy.worldState || {}) };
  }
  for (const key of ['clock', 'scene', 'worldId', 'campaignId', 'levelSeedId', 'difficulty', 'crew', 'editor', 'memorial', 'settings', 'statistics']) {
    if (source[key] !== undefined) migrated[key] = source[key];
  }
  migrated.settings = { ...base.settings, ...(source.settings || {}) };
  migrated.statistics = { ...base.statistics, ...(source.statistics || {}) };
  migrated.schema = SAVE_SCHEMA;
  migrated.release = RELEASE.version;
  migrated.profile = profile;
  migrated.updatedAt = Date.now();
  migrated.migratedFrom = source.release || source.version || `schema-${source.schema ?? 'legacy'}`;
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
