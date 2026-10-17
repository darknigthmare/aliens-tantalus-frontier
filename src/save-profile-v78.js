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
  hub: ['deck', 'roomId', 'positionX', 'facing', 'systems', 'visited', 'moduleIds'],
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

// A newer save must never be rewritten by an older migration. This is the
// persistence schema, NOT the application's V143/V144 release number.
export const SAVE_PAYLOAD_LIMITS_V144 = Object.freeze({ schema: 52, bytes: 16 * 1024 * 1024, depth: 64, nodes: 250000 });
const forbiddenKeysV144 = new Set(['__proto__', 'prototype', 'constructor']);
function payloadReasonV144(data) {
  if (!record(data)) return 'invalid-save-shape';
  if (Object.hasOwn(data, 'schema')) {
    const raw = data.schema;
    const schema = typeof raw === 'string' && /^\d+$/.test(raw) ? Number(raw) : raw;
    if (!Number.isSafeInteger(schema) || schema < 0) return 'invalid-schema';
    if (schema > SAVE_PAYLOAD_LIMITS_V144.schema) return 'future-schema';
  }
  // Iterative traversal bounds imported structures before recursive migration.
  // Unknown ordinary fields remain available to existing legacy migrations.
  const stack = [{ value: data, depth: 0 }];
  let visited = 0;
  while (stack.length) {
    const { value, depth } = stack.pop();
    if (++visited > SAVE_PAYLOAD_LIMITS_V144.nodes) return 'payload-too-complex';
    if (value === null || typeof value !== 'object') continue;
    if (depth > SAVE_PAYLOAD_LIMITS_V144.depth) return 'payload-too-deep';
    for (const key of Object.keys(value)) {
      if (forbiddenKeysV144.has(key)) return 'unsafe-key';
      stack.push({ value: value[key], depth: depth + 1 });
      if (visited + stack.length > SAVE_PAYLOAD_LIMITS_V144.nodes) return 'payload-too-complex';
    }
  }
  return isSavePayloadV78(data) ? null : 'invalid-save-shape';
}

export function inspectSaveSlotV78(raw) {
  if (raw === null || raw === undefined) return { status: 'empty', data: null, reason: null };
  if (typeof raw !== 'string') return { status: 'corrupt', data: null, reason: 'invalid-json' };
  if (raw.length > SAVE_PAYLOAD_LIMITS_V144.bytes || new TextEncoder().encode(raw).byteLength > SAVE_PAYLOAD_LIMITS_V144.bytes)
    return { status: 'corrupt', data: null, reason: 'payload-too-large' };
  let data;
  try { data = JSON.parse(raw); } catch { return { status: 'corrupt', data: null, reason: 'invalid-json' }; }
  const reason = payloadReasonV144(data);
  return reason ? { status: 'corrupt', data: null, reason } : { status: 'ready', data, reason: null };
}

export function parseImportedSaveV78(text) {
  const slot = typeof text === 'string' ? inspectSaveSlotV78(text) : null;
  if (slot?.status !== 'ready') throw new SaveProfileErrorV78('SAVE_IMPORT_INVALID', slot?.reason === 'future-schema'
    ? 'Cette sauvegarde nécessite une version plus récente du jeu. Le fichier original et la partie active sont conservés.'
    : 'Fichier de sauvegarde invalide ou trop volumineux. Aucune partie n’a été remplacée.');
  return slot.data;
}
