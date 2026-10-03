import { SAVE_SCHEMA } from './save.js';
import { isSavePayloadV78, assertSaveProfileIdV78 } from './save-profile-v78.js';

export const CLOUD_MAX_BYTES_V119 = 2097152;
// Stable gameplay comparison: a save notification or migration's wall-clock
// timestamp is not a new timeline. Profile is excluded for explicit keep-both.
export function canonicalSaveV119(payload) {
  const canonical = (value, root = false) => {
    if (Array.isArray(value)) return value.map(v => canonical(v));
    if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort()
      .filter(key => !root || !['updatedAt', 'release', 'migratedFrom', 'profile'].includes(key))
      .map(key => [key, canonical(value[key])]));
    return value;
  };
  return JSON.stringify(canonical(payload, true));
}
export function validateCloudPayloadV119(payload) {
  const serialized = JSON.stringify(payload);
  if (!serialized || new TextEncoder().encode(serialized).length > CLOUD_MAX_BYTES_V119) throw new Error('Sauvegarde distante trop volumineuse.');
  const inspect = (value, depth = 0) => {
    if (depth > 40) throw new Error('Sauvegarde distante trop imbriquée.');
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if (['__proto__', 'prototype', 'constructor', 'access_token', 'refresh_token', 'service_role'].includes(key)) throw new Error('Champ distant interdit.');
      inspect(child, depth + 1);
    }
  };
  inspect(payload);
  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  if (!isSavePayloadV78(payload) || !record(payload.player) || !record(payload.hub)
    || !Number.isInteger(payload.schema) || payload.schema < 1 || payload.schema > SAVE_SCHEMA
    || typeof payload.release !== 'string' || payload.release.length > 80
    || !Number.isFinite(payload.createdAt) || payload.createdAt < 0) throw new Error('Sauvegarde distante invalide ou version incompatible.');
  return structuredClone(payload);
}
export async function saveChecksumV119(payload, crypto = globalThis.crypto) {
  const bytes = new TextEncoder().encode(canonicalSaveV119(payload));
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
export async function validateCloudRowV119(row, userId) {
  if (!row || row.user_id !== userId || !Number.isSafeInteger(Number(row.revision)) || Number(row.revision) < 1
    || !/^[a-f0-9]{64}$/.test(row.checksum)) throw new Error('Enveloppe distante invalide.');
  const slot = assertSaveProfileIdV78(row.slot);
  const payload = validateCloudPayloadV119(row.payload);
  if (row.save_schema !== payload.schema || row.release_version !== payload.release
    || await saveChecksumV119(payload) !== row.checksum) throw new Error('Sauvegarde distante corrompue : empreinte invalide.');
  return { ...row, slot, revision: Number(row.revision), payload };
}
export function classifySavePairV119(localChecksum, remote, base) {
  if (!remote) return localChecksum ? 'upload' : 'empty';
  if (!localChecksum) return 'cloud-ready';
  if (localChecksum === remote.checksum) return 'synced';
  if (!base) return 'conflict';
  if (remote.checksum === base.checksum && remote.revision === base.revision) return 'upload';
  if (localChecksum === base.checksum) return 'cloud-ready';
  return 'conflict';
}
