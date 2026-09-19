// Personal remembrance belongs only to this browser, never to the game save or its exports.
export const REFUGE_PERSONAL_SCHEMA_V87 = 1;
export const REFUGE_PERSONAL_STORAGE_PREFIX_V87 = 'atf.private.refuge.v87:';
export const REFUGE_PERSONAL_MAX_NAME_LENGTH_V87 = 80;
export const REFUGE_PERSONAL_MAX_DEDICATION_LENGTH_V87 = 2000;
export const REFUGE_PERSONAL_MAX_OWNER_LENGTH_V87 = 256;
export const REFUGE_PERSONAL_MAX_PHOTO_BYTES_V87 = 512 * 1024;
export const REFUGE_PERSONAL_MAX_PHOTO_DATA_URL_LENGTH_V87 = 4 * Math.ceil(REFUGE_PERSONAL_MAX_PHOTO_BYTES_V87 / 3) + 32;
const MAX_RECORD_LENGTH = REFUGE_PERSONAL_MAX_PHOTO_DATA_URL_LENGTH_V87 + 8192;
const STATE_KEYS = ['schema', 'revision', 'name', 'dedication', 'photoDataUrl', 'lightOn'];
const PATCH_KEYS = ['name', 'dedication', 'photoDataUrl', 'lightOn'];
const own = (value, key) => Object.hasOwn(value, key);
const record = value => Boolean(value && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value)));
const keysAre = (value, keys, exact = true) => record(value)
  && Reflect.ownKeys(value).every(key => typeof key === 'string' && keys.includes(key)
    && own(Object.getOwnPropertyDescriptor(value, key), 'value'))
  && (!exact || keys.every(key => own(value, key)));

function invalid(code) {
  const error = new TypeError(code);
  error.name = 'RefugePersonalValidationErrorV87';
  error.code = code;
  throw error;
}
const errorCode = (error, fallback) => typeof error?.code === 'string' ? error.code : fallback;
const quotaError = error => ['QuotaExceededError', 'NS_ERROR_DOM_QUOTA_REACHED'].includes(error?.name)
  || [22, 1014].includes(error?.code);

function checkedOwner(owner) {
  if (!keysAre(owner, ['profileId', 'gameId'])) invalid('invalid-owner');
  for (const value of [owner.profileId, owner.gameId]) {
    if (typeof value !== 'string' || !value.trim() || value.length > REFUGE_PERSONAL_MAX_OWNER_LENGTH_V87
      || /[\u0000-\u001f\u007f]/.test(value)) invalid('invalid-owner');
    try { encodeURIComponent(value); } catch { invalid('invalid-owner'); }
  }
  return { profileId: owner.profileId, gameId: owner.gameId };
}

/** Both owner components are escaped independently; delimiters cannot collide. */
export function refugePersonalStorageKeyV87(owner) {
  const checked = checkedOwner(owner);
  return REFUGE_PERSONAL_STORAGE_PREFIX_V87 + encodeURIComponent(checked.profileId) + ':' + encodeURIComponent(checked.gameId);
}

// The UI must decode/re-encode an imported image locally and bound its dimensions first.
// This domain performs byte, MIME, canonical base64 and container-signature guards; it is not an image codec.
function checkPhoto(photo) {
  if (photo === null) return;
  if (typeof photo !== 'string') invalid('invalid-photo');
  if (photo.length > REFUGE_PERSONAL_MAX_PHOTO_DATA_URL_LENGTH_V87) invalid('photo-too-large');
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(photo);
  if (!match || match[2].length % 4 !== 0) invalid('invalid-photo');
  let bytes;
  try {
    bytes = atob(match[2]);
    if (btoa(bytes) !== match[2]) invalid('invalid-photo');
  } catch { invalid('invalid-photo'); }
  if (bytes.length > REFUGE_PERSONAL_MAX_PHOTO_BYTES_V87) invalid('photo-too-large');
  const byte = index => bytes.charCodeAt(index);
  const mime = match[1];
  if (mime === 'png' && !(bytes.length >= 33 && bytes.startsWith('\x89PNG\r\n\x1a\n')
    && bytes.slice(12, 16) === 'IHDR')) invalid('invalid-photo');
  if (mime === 'jpeg' && !(bytes.length >= 4 && byte(0) === 255 && byte(1) === 216
    && byte(bytes.length - 2) === 255 && byte(bytes.length - 1) === 217)) invalid('invalid-photo');
  if (mime === 'webp') {
    const size = byte(4) + byte(5) * 256 + byte(6) * 65536 + byte(7) * 16777216;
    if (!(bytes.length >= 20 && bytes.startsWith('RIFF') && bytes.slice(8, 12) === 'WEBP'
      && ['VP8 ', 'VP8L', 'VP8X'].includes(bytes.slice(12, 16)) && size === bytes.length - 8)) invalid('invalid-photo');
  }
}

function checkFields(value) {
  if (typeof value.name !== 'string' || value.name.length > REFUGE_PERSONAL_MAX_NAME_LENGTH_V87
    || /[\u0000-\u001f\u007f]/.test(value.name)) invalid('invalid-name');
  if (typeof value.dedication !== 'string' || value.dedication.length > REFUGE_PERSONAL_MAX_DEDICATION_LENGTH_V87
    || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value.dedication)) invalid('invalid-dedication');
  if (typeof value.lightOn !== 'boolean') invalid('invalid-light');
  checkPhoto(value.photoDataUrl);
}

/** New state is unnamed. Invalid or future supplied states throw, never silently reset. */
export function createRefugePersonalStateV87(raw) {
  if (raw === undefined) return { schema: 1, revision: 0, name: '', dedication: '', photoDataUrl: null, lightOn: false };
  if (record(raw) && Number.isInteger(raw.schema) && raw.schema > REFUGE_PERSONAL_SCHEMA_V87) invalid('future-schema');
  if (!keysAre(raw, STATE_KEYS) || raw.schema !== REFUGE_PERSONAL_SCHEMA_V87
    || !Number.isSafeInteger(raw.revision) || raw.revision < 0) invalid('invalid-state');
  checkFields(raw);
  return { schema: 1, revision: raw.revision, name: raw.name, dedication: raw.dedication,
    photoDataUrl: raw.photoDataUrl, lightOn: raw.lightOn };
}

function response(ok, code, state = null, changed = false) {
  return { ok, code, state: state ? createRefugePersonalStateV87(state) : null, changed };
}

/** Synchronous local-only store, with no cache, network, game-save or export dependency. */
export class RefugePersonalStoreV87 {
  #storage;

  constructor(options = {}) {
    try {
      const storage = own(options, 'storage') ? options.storage : globalThis.localStorage;
      this.#storage = storage && ['getItem', 'setItem', 'removeItem'].every(key => typeof storage[key] === 'function')
        ? storage : null;
    } catch { this.#storage = null; }
  }

  #read(owner) {
    let key, checked;
    try { checked = checkedOwner(owner); key = refugePersonalStorageKeyV87(checked); }
    catch { return response(false, 'invalid-owner'); }
    if (!this.#storage) return response(false, 'storage-unavailable');
    let raw;
    try { raw = this.#storage.getItem(key); }
    catch { return response(false, 'storage-read-failed'); }
    if (raw === null) return { ...response(true, 'empty', createRefugePersonalStateV87()), raw, key, owner: checked };
    if (typeof raw !== 'string' || raw.length > MAX_RECORD_LENGTH) return response(false, 'corrupt-storage');
    let envelope;
    try { envelope = JSON.parse(raw); } catch { return response(false, 'corrupt-storage'); }
    try {
      if (record(envelope) && Number.isInteger(envelope.schema) && envelope.schema > 1) invalid('future-schema');
      if (!keysAre(envelope, ['schema', 'owner', 'state']) || envelope.schema !== 1) invalid('corrupt-storage');
      const storedOwner = checkedOwner(envelope.owner);
      if (storedOwner.profileId !== checked.profileId || storedOwner.gameId !== checked.gameId) invalid('owner-mismatch');
      const state = createRefugePersonalStateV87(envelope.state);
      return { ...response(true, 'loaded', state), raw, key, owner: checked };
    } catch (error) { return response(false, errorCode(error, 'corrupt-storage')); }
  }

  load(owner) {
    const current = this.#read(owner);
    return response(current.ok, current.code, current.state);
  }

  // Web Storage failures are atomic. Also recover an injected adapter that writes then throws,
  // but never overwrite an unrelated value written by another owner/tab during a failure.
  #failedWrite(previous, attempted, code) {
    let actual;
    try { actual = this.#storage.getItem(previous.key); }
    catch { return response(false, 'storage-readback-failed'); }
    if (actual === previous.raw) return response(false, code, previous.state);
    if (actual !== attempted) return response(false, 'storage-write-conflict');
    try {
      if (previous.raw === null) this.#storage.removeItem(previous.key);
      else this.#storage.setItem(previous.key, previous.raw);
    } catch { /* Verify the old bytes even when an adapter throws after restoring them. */ }
    try {
      return this.#storage.getItem(previous.key) === previous.raw
        ? response(false, code, previous.state) : response(false, 'rollback-failed');
    } catch { return response(false, 'rollback-failed'); }
  }

  commit(owner, patch) {
    const previous = this.#read(owner);
    if (!previous.ok) return response(false, previous.code);
    let next;
    try {
      if (!keysAre(patch, PATCH_KEYS, false)) invalid('invalid-patch');
      next = createRefugePersonalStateV87({ ...previous.state, ...patch });
    } catch (error) { return response(false, errorCode(error, 'invalid-patch'), previous.state); }
    if (PATCH_KEYS.every(key => previous.state[key] === next[key])) return response(true, 'unchanged', previous.state);
    if (previous.state.revision === Number.MAX_SAFE_INTEGER) return response(false, 'revision-exhausted', previous.state);
    next.revision++;
    const serialized = JSON.stringify({ schema: 1, owner: previous.owner, state: next });
    try { this.#storage.setItem(previous.key, serialized); }
    catch (error) {
      return this.#failedWrite(previous, serialized, quotaError(error) ? 'quota-exceeded' : 'storage-write-failed');
    }
    let actual;
    try { actual = this.#storage.getItem(previous.key); }
    catch { return response(false, 'storage-readback-failed'); }
    if (actual !== serialized) return response(false,
      actual === previous.raw ? 'storage-verification-failed' : 'storage-write-conflict',
      actual === previous.raw ? previous.state : null);
    return response(true, 'committed', next, true);
  }

  removePhoto(owner) { return this.commit(owner, { photoDataUrl: null }); }
}
