/**
 * Frontier Forge persistence is deliberately isolated from campaign profiles.
 *
 * V60/V61 stored Forge projects below `save.editor`. V62 copies those projects
 * once into this dedicated namespace, but never edits or removes the legacy
 * payload. Keeping the import marker in the Forge workspace makes the operation
 * idempotent even when a campaign profile is loaded several times.
 */

export const FORGE_SAVE_SCHEMA_V62 = 1;
export const FORGE_SAVE_KEY_V62 = 'atf-v62-frontier-forge-workspace';
export const FORGE_LEGACY_IMPORT_ID_V62 = 'campaign-editor-v60-v61';
export const LEGACY_CAMPAIGN_SAVE_PREFIX_V62 = 'atf-v47-profile-';

const FORGE_PROJECT_KINDS = new Set(['mission', 'ship']);
const FORGE_TILE_TYPES = new Set([
  'floor', 'platform', 'wall', 'door', 'vent', 'ladder', 'lift',
  'spawn', 'objective', 'enemy', 'vehicle', 'terminal', 'hazard'
]);
const MAX_PROJECTS = 256;
const MAX_TILES = 9216;

const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const clampInteger = (value, fallback, min, max) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(min, Math.min(max, Math.floor(parsed))) : fallback;
};
const cleanText = (value, fallback = '', maxLength = 120) => typeof value === 'string'
  ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength)
  : fallback;
const cleanId = (value, fallback) => {
  const cleaned = cleanText(value, '', 120)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || fallback;
};
const uniqueStrings = (values, max = 16) => [...new Set((Array.isArray(values) ? values : [])
  .map((value) => cleanText(value, '', 80))
  .filter(Boolean))].slice(0, max);

function sanitizeSize(value) {
  if (!Array.isArray(value)) return [32, 18];
  return [
    clampInteger(value[0], 32, 8, 128),
    clampInteger(value[1], 18, 8, 72)
  ];
}

function sanitizeTiles(value, size) {
  if (!Array.isArray(value)) return [];
  const [columns, rows] = size;
  const byPosition = new Map();
  for (const tile of value.slice(0, MAX_TILES)) {
    if (!isRecord(tile) || !FORGE_TILE_TYPES.has(tile.type)) continue;
    const match = typeof tile.position === 'string' && /^(\d{1,3}):(\d{1,3})$/.exec(tile.position);
    if (!match) continue;
    const x = Number(match[1]);
    const y = Number(match[2]);
    if (x < 0 || x >= columns || y < 0 || y >= rows) continue;
    byPosition.set(`${x}:${y}`, { position: `${x}:${y}`, type: tile.type });
  }
  return [...byPosition.values()];
}

function validationForTiles(tiles) {
  const counts = Object.fromEntries([...FORGE_TILE_TYPES].map((type) => [type, 0]));
  for (const tile of tiles) counts[tile.type] += 1;
  const errors = [];
  if (!counts.spawn) errors.push('Un point de spawn est requis.');
  if (!counts.objective) errors.push('Un objectif est requis.');
  if (!(counts.floor || counts.platform)) errors.push('Au moins un sol ou une plateforme est requis.');
  return { ok: errors.length === 0, errors, counts };
}

/** Pure project sanitizer used for local saves, imports and legacy copies. */
export function sanitizeForgeProjectV62(input, fallbackId = 'forge-project') {
  if (!isRecord(input)) return null;
  const kind = FORGE_PROJECT_KINDS.has(input.kind) ? input.kind : 'mission';
  const size = sanitizeSize(input.size);
  const tiles = sanitizeTiles(input.tiles, size);
  const id = cleanId(input.id, cleanId(fallbackId, 'forge-project'));
  const project = {
    schema: clampInteger(input.schema, 2, 1, 1000),
    id,
    name: cleanText(input.name, kind === 'ship' ? 'Plan de vaisseau' : 'Mission sans titre', 120),
    kind,
    size,
    tiles,
    validation: validationForTiles(tiles),
    updatedAt: clampInteger(input.updatedAt, 0, 0, Number.MAX_SAFE_INTEGER)
  };
  if (isRecord(input.legacyOrigin)) {
    project.legacyOrigin = {
      profile: clampInteger(input.legacyOrigin.profile, 1, 1, 3),
      projectId: cleanText(input.legacyOrigin.projectId, id, 120)
    };
  }
  return project;
}

export function createDefaultForgeSaveV62(now = Date.now()) {
  return {
    schema: FORGE_SAVE_SCHEMA_V62,
    projects: [],
    activeProjectId: null,
    imports: {},
    createdAt: clampInteger(now, 0, 0, Number.MAX_SAFE_INTEGER),
    updatedAt: clampInteger(now, 0, 0, Number.MAX_SAFE_INTEGER)
  };
}

/** Pure workspace sanitizer. Unknown fields never cross the persistence boundary. */
export function sanitizeForgeSaveV62(input, now = Date.now()) {
  const base = createDefaultForgeSaveV62(now);
  if (!isRecord(input)) return base;
  const projects = [];
  const usedIds = new Set();
  for (let index = 0; index < (Array.isArray(input.projects) ? input.projects.length : 0) && projects.length < MAX_PROJECTS; index += 1) {
    const project = sanitizeForgeProjectV62(input.projects[index], `forge-project-${index + 1}`);
    if (!project) continue;
    let id = project.id;
    let suffix = 2;
    while (usedIds.has(id)) {
      const suffixText = `-${suffix++}`;
      id = `${project.id.slice(0, 120 - suffixText.length)}${suffixText}`;
    }
    usedIds.add(id);
    projects.push(id === project.id ? project : { ...project, id });
  }
  const requestedActiveId = cleanId(input.activeProjectId, '');
  const activeProjectId = projects.some((project) => project.id === requestedActiveId)
    ? requestedActiveId
    : projects[0]?.id || null;
  const imports = {};
  if (isRecord(input.imports)) {
    for (const [rawId, rawEntry] of Object.entries(input.imports).slice(0, 16)) {
      if (!isRecord(rawEntry)) continue;
      const id = cleanId(rawId, 'legacy-import');
      imports[id] = {
        completed: Boolean(rawEntry.completed),
        completedAt: clampInteger(rawEntry.completedAt, 0, 0, Number.MAX_SAFE_INTEGER),
        profiles: uniqueStrings(rawEntry.profiles, 3),
        projectCount: clampInteger(rawEntry.projectCount, 0, 0, MAX_PROJECTS)
      };
    }
  }
  return {
    schema: FORGE_SAVE_SCHEMA_V62,
    projects,
    activeProjectId,
    imports,
    createdAt: clampInteger(input.createdAt, base.createdAt, 0, Number.MAX_SAFE_INTEGER),
    updatedAt: clampInteger(input.updatedAt, base.updatedAt, 0, Number.MAX_SAFE_INTEGER)
  };
}

/**
 * Pure, non-mutating one-time legacy copy.
 * `campaignSaves` accepts `{ profile, data }` records or raw save objects.
 */
export function copyLegacyCampaignProjectsV62(forgeInput, campaignSaves, now = Date.now()) {
  const forge = sanitizeForgeSaveV62(forgeInput, now);
  if (forge.imports[FORGE_LEGACY_IMPORT_ID_V62]?.completed) {
    return { save: forge, imported: 0, alreadyImported: true };
  }

  const profiles = [];
  const importedProjects = [];
  let preferredActiveId = null;
  const sources = Array.isArray(campaignSaves) ? campaignSaves : [];
  for (let sourceIndex = 0; sourceIndex < sources.length; sourceIndex += 1) {
    const wrapped = isRecord(sources[sourceIndex]) && Object.hasOwn(sources[sourceIndex], 'data');
    const data = wrapped ? sources[sourceIndex].data : sources[sourceIndex];
    if (!isRecord(data) || !isRecord(data.editor)) continue;
    const profile = clampInteger(wrapped ? sources[sourceIndex].profile : data.profile, sourceIndex + 1, 1, 3);
    const legacyProjects = Array.isArray(data.editor.projects) ? data.editor.projects : [];
    if (legacyProjects.length) profiles.push(String(profile));
    for (let projectIndex = 0; projectIndex < legacyProjects.length && importedProjects.length < MAX_PROJECTS; projectIndex += 1) {
      const original = legacyProjects[projectIndex];
      if (!isRecord(original)) continue;
      const originalId = cleanId(original?.id, `project-${projectIndex + 1}`);
      const importedId = `legacy-p${profile}-${originalId}`.slice(0, 120);
      const project = sanitizeForgeProjectV62({
        ...original,
        id: importedId,
        name: cleanText(original?.name, `Projet hérité P${profile}`, 120),
        legacyOrigin: { profile, projectId: original?.id || originalId }
      }, importedId);
      if (!project) continue;
      importedProjects.push(project);
      if (!preferredActiveId && data.editor.activeProjectId === original?.id) preferredActiveId = importedId;
    }
  }

  const seenOrigins = new Set(forge.projects
    .filter((project) => project.legacyOrigin)
    .map((project) => `${project.legacyOrigin.profile}:${project.legacyOrigin.projectId}`));
  const additions = [];
  for (const project of importedProjects) {
    const origin = `${project.legacyOrigin.profile}:${project.legacyOrigin.projectId}`;
    if (seenOrigins.has(origin)) continue;
    seenOrigins.add(origin);
    additions.push(project);
  }
  const combined = [...forge.projects, ...additions].slice(0, MAX_PROJECTS);
  const save = sanitizeForgeSaveV62({
    ...forge,
    projects: combined,
    activeProjectId: forge.activeProjectId || preferredActiveId || combined[0]?.id || null,
    imports: {
      ...forge.imports,
      [FORGE_LEGACY_IMPORT_ID_V62]: {
        completed: true,
        completedAt: clampInteger(now, 0, 0, Number.MAX_SAFE_INTEGER),
        profiles: uniqueStrings(profiles, 3),
        projectCount: additions.length
      }
    },
    updatedAt: now
  }, now);
  return { save, imported: additions.length, alreadyImported: false };
}

function safeParse(text) {
  try { return JSON.parse(text); } catch { return null; }
}

function readCampaignProfiles(storage) {
  const profiles = [];
  for (let profile = 1; profile <= 3; profile += 1) {
    try {
      const data = safeParse(storage?.getItem(`${LEGACY_CAMPAIGN_SAVE_PREFIX_V62}${profile}`) || '');
      if (data) profiles.push({ profile, data });
    } catch {
      // Storage may be unavailable in private browsing; Forge remains usable in memory.
    }
  }
  return profiles;
}

export class ForgeSaveSystemV62 {
  constructor(storage = globalThis.localStorage, key = FORGE_SAVE_KEY_V62) {
    this.storage = storage;
    this.key = key;
    this.data = createDefaultForgeSaveV62();
  }

  load({ campaignSaves = null, now = Date.now() } = {}) {
    let stored = null;
    try { stored = safeParse(this.storage?.getItem(this.key) || ''); } catch { stored = null; }
    const legacySources = campaignSaves || readCampaignProfiles(this.storage);
    const result = copyLegacyCampaignProjectsV62(stored, legacySources, now);
    this.data = result.save;
    this.commit(now);
    return { ...result, save: this.data };
  }

  commit(now = Date.now()) {
    this.data = sanitizeForgeSaveV62({ ...this.data, updatedAt: now }, now);
    try { this.storage?.setItem(this.key, JSON.stringify(this.data)); } catch { /* in-memory fallback */ }
    return this.data;
  }

  upsert(project, now = Date.now()) {
    const sanitized = sanitizeForgeProjectV62({ ...project, updatedAt: now });
    if (!sanitized) throw new Error('Projet Frontier Forge invalide.');
    const index = this.data.projects.findIndex((entry) => entry.id === sanitized.id);
    if (index >= 0) this.data.projects[index] = sanitized;
    else this.data.projects.push(sanitized);
    this.data.activeProjectId = sanitized.id;
    return this.commit(now);
  }

  setActive(projectId, now = Date.now()) {
    const id = cleanId(projectId, '');
    if (!this.data.projects.some((project) => project.id === id)) return false;
    this.data.activeProjectId = id;
    this.commit(now);
    return true;
  }

  remove(projectId, now = Date.now()) {
    const id = cleanId(projectId, '');
    const before = this.data.projects.length;
    this.data.projects = this.data.projects.filter((project) => project.id !== id);
    if (this.data.projects.length === before) return false;
    if (this.data.activeProjectId === id) this.data.activeProjectId = this.data.projects[0]?.id || null;
    this.commit(now);
    return true;
  }

  export() { return JSON.stringify(this.data, null, 2); }

  import(text, now = Date.now()) {
    const parsed = safeParse(text);
    if (!parsed) throw new Error('Fichier Frontier Forge invalide.');
    this.data = sanitizeForgeSaveV62(parsed, now);
    return this.commit(now);
  }
}
