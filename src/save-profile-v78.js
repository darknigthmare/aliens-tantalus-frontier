export const SAVE_PROFILE_IDS_V78 = Object.freeze([1, 2, 3]);
export const SAVE_SELECTED_PROFILE_KEY_V78 = 'atf-v78-selected-profile';

export class SaveProfileErrorV78 extends Error {
  constructor(code, message, { profile = null, cause = null } = {}) {
    super(message);
    this.name = 'SaveProfileErrorV78';
    this.code = code;
    this.profile = profile;
    if (cause) this.cause = cause;
  }
}

export function assertSaveProfileIdV78(value) {
  const profile = typeof value === 'string' && /^[123]$/.test(value.trim()) ? Number(value.trim()) : value;
  if (!Number.isInteger(profile) || !SAVE_PROFILE_IDS_V78.includes(profile)) {
    throw new SaveProfileErrorV78('SAVE_PROFILE_INVALID', 'Profil invalide : choisissez un emplacement entier de 1 à 3.');
  }
  return profile;
}

const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const sections = {
  player: ['name', 'health', 'armor', 'stress', 'weaponIds', 'equipmentIds', 'ammo'],
  hub: ['deck', 'roomId', 'positionX', 'systems', 'visited', 'moduleIds'],
  galaxy: ['resources', 'worldState', 'unlockedWorldIds'],
  statistics: ['kills', 'deaths', 'campaigns', 'playSeconds', 'shots'],
  clock: ['day', 'hour'],
  settings: ['difficulty', 'quality', 'contrast', 'aimAssist', 'screenShake', 'coop', 'reducedMotion', 'subtitles', 'effects', 'music'],
  strategy: ['serial', 'currentOperation', 'lastOperation', 'plannedCampaignId', 'selectedCrewIds', 'log'],
  narrativeArchives: ['schema', 'discovered', 'readIds', 'playedIds']
};

// Migration tolerates incomplete legacy saves, but JSON syntax alone is not
// proof that a selected file is a save. A real persistent section is required.
export function isSavePayloadV78(value) {
  return record(value) && (Object.entries(sections).some(([key, fields]) => record(value[key])
    && fields.some((field) => Object.hasOwn(value[key], field) && value[key][field] !== null))
    || Array.isArray(value.crew) && value.crew.some((member) => record(member) && typeof member.id === 'string' && member.id.length > 0));
}

export function inspectSaveSlotV78(raw) {
  if (raw === null || raw === undefined) return { status: 'empty', data: null, reason: null };
  let data;
  try { data = JSON.parse(raw); } catch { return { status: 'corrupt', data: null, reason: 'invalid-json' }; }
  return isSavePayloadV78(data)
    ? { status: 'ready', data, reason: null }
    : { status: 'corrupt', data: null, reason: 'invalid-save-shape' };
}

export function parseImportedSaveV78(text) {
  const slot = typeof text === 'string' ? inspectSaveSlotV78(text) : null;
  if (slot?.status !== 'ready') throw new SaveProfileErrorV78('SAVE_IMPORT_INVALID', 'Fichier de sauvegarde invalide. Aucune partie n’a été remplacée.');
  return slot.data;
}
