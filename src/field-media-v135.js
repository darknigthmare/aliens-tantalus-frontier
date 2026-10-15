/** Real player-made photographs. Blobs stay local and never enter save JSON. */
export const FIELD_MEDIA_LIMITS_V135 = Object.freeze({ count: 12, bytes: 16 * 1024 * 1024, photoBytes: 4 * 1024 * 1024, dimension: 4096 });
export const FIELD_MEDIA_DATABASE_V135 = 'atf-field-media-v135';
const MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const SCENES = new Set(['hub', 'mission', 'cctv']);
const text = (value, limit = 120) => typeof value === 'string' ? value.trim().slice(0, limit) : '';
const identifier = value => typeof value === 'string' && /^[a-z0-9][a-z0-9_-]{0,119}$/iu.test(value) ? value : '';
const positiveInteger = value => Number.isSafeInteger(value) && value > 0;

export class FieldMediaErrorV135 extends Error {
  constructor(code, message, cause) {
    super(message); this.name = 'FieldMediaErrorV135'; this.code = code;
    if (cause) this.cause = cause;
  }
}
const error = (code, message, cause) => new FieldMediaErrorV135(code, message, cause);

export function normalizeFieldMediaOwnerV135(owner) {
  if (!owner || !Number.isInteger(owner.profile) || owner.profile < 1 || owner.profile > 3
    || !positiveInteger(owner.createdAt) || owner.createdAt > 8640000000000000
    || (owner.identityId !== undefined && owner.identityId !== '' && !/^[a-z0-9][a-z0-9_:-]{0,119}$/iu.test(owner.identityId))) {
    throw error('INVALID_OWNER', 'La chronologie de cette partie ne permet pas de conserver une photo.');
  }
  const normalized = { profile: owner.profile, createdAt: owner.createdAt, identityId: owner.identityId || '' };
  return Object.freeze({ ...normalized, ownerKey: JSON.stringify([normalized.profile, normalized.createdAt, normalized.identityId]) });
}

function assertCurrent(isCurrent) {
  if (!isCurrent()) throw error('STALE_OWNER', 'La partie a changé. La demande de photo a été annulée.');
}
function storageError(cause) {
  if (cause instanceof FieldMediaErrorV135) return cause;
  if (cause?.name === 'QuotaExceededError') return error('STORAGE_FULL', 'Le navigateur manque de place. Les photos déjà conservées restent intactes.', cause);
  return error('STORAGE_UNAVAILABLE', 'Le stockage local des photos est indisponible. Aucune photo existante n’a été remplacée.', cause);
}
function metadata(record) {
  const { blob, ...entry } = record;
  return Object.freeze(entry);
}
function validateStored(records, owner) {
  if (!Array.isArray(records) || records.length > FIELD_MEDIA_LIMITS_V135.count) throw error('STORAGE_INVALID', 'La galerie locale est illisible. Aucune photo n’a été modifiée.');
  for (const record of records) {
    if (record?.schema !== 135 || record.ownerKey !== owner.ownerKey || !/^photo-v135-[a-z0-9-]{1,80}$/iu.test(record.id || '')
      || !positiveInteger(record.byteLength) || record.byteLength > FIELD_MEDIA_LIMITS_V135.photoBytes
      || !(record.blob instanceof Blob) || record.blob.size !== record.byteLength || !MIME_TYPES.has(record.mimeType)
      || record.blob.type !== record.mimeType || !positiveInteger(record.width) || !positiveInteger(record.height)
      || record.width > FIELD_MEDIA_LIMITS_V135.dimension || record.height > FIELD_MEDIA_LIMITS_V135.dimension
      || !positiveInteger(record.capturedAt) || !SCENES.has(record.scene)) {
      throw error('STORAGE_INVALID', 'La galerie locale est illisible. Aucune photo n’a été modifiée.');
    }
  }
  if (records.reduce((total, record) => total + record.byteLength, 0) > FIELD_MEDIA_LIMITS_V135.bytes) {
    throw error('STORAGE_INVALID', 'La galerie locale dépasse sa capacité. Aucune photo n’a été modifiée.');
  }
}

/** A single read/write transaction checks limits and commits metadata + Blob. */
export function createIndexedDbFieldMediaStorageV135(indexedDB = globalThis.indexedDB) {
  let connection = null, opening = null, closed = false;
  function open() {
    if (closed) return Promise.reject(error('STORAGE_UNAVAILABLE', 'La galerie locale est fermée.'));
    if (connection) return Promise.resolve(connection);
    if (opening) return opening;
    if (!indexedDB?.open) return Promise.reject(error('STORAGE_UNAVAILABLE', 'Ce navigateur ne permet pas de conserver les photos localement.'));
    opening = new Promise((resolve, reject) => {
      let request, rejected = false;
      try { request = indexedDB.open(FIELD_MEDIA_DATABASE_V135, 1); } catch (cause) { reject(storageError(cause)); return; }
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('photos')) {
          const store = db.createObjectStore('photos', { keyPath: 'id' });
          store.createIndex('ownerKey', 'ownerKey', { unique: false });
        }
      };
      request.onerror = () => { rejected = true; reject(storageError(request.error)); };
      request.onblocked = () => { rejected = true; reject(error('STORAGE_BLOCKED', 'Fermez les anciens onglets du jeu pour ouvrir la galerie locale.')); };
      request.onsuccess = () => {
        if (rejected || closed) { request.result.close(); if (!rejected) reject(error('STORAGE_UNAVAILABLE', 'La galerie locale est fermée.')); return; }
        connection = request.result;
        connection.onversionchange = () => { connection?.close(); connection = null; };
        resolve(connection);
      };
    }).finally(() => { opening = null; });
    return opening;
  }
  return {
    async transact(ownerKey, mode, action, isCurrent) {
      const db = await open(); assertCurrent(isCurrent);
      return new Promise((resolve, reject) => {
        let transaction, result, failure;
        try {
          transaction = db.transaction('photos', mode);
          const store = transaction.objectStore('photos');
          // One extra result detects an overfull/corrupt gallery without unbounded reads.
          const request = store.index('ownerKey').getAll(ownerKey, FIELD_MEDIA_LIMITS_V135.count + 1);
          request.onsuccess = () => {
            try {
              assertCurrent(isCurrent);
              const mutation = action(request.result);
              assertCurrent(isCurrent);
              const write = mutation.add ? store.add(mutation.add) : mutation.deleteId ? store.delete(mutation.deleteId) : null;
              if (write) write.onsuccess = () => {
                try { assertCurrent(isCurrent); } catch (cause) { failure = cause; transaction.abort(); }
              };
              result = mutation.value;
            } catch (cause) { failure = cause; transaction.abort(); }
          };
          transaction.oncomplete = () => resolve(result);
          transaction.onabort = () => reject(storageError(failure || transaction.error));
          transaction.onerror = () => { /* Abort is the sole rejection path. */ };
        } catch (cause) { reject(storageError(cause)); }
      });
    },
    close() { closed = true; connection?.close(); connection = null; }
  };
}

async function validatePhoto(input, now) {
  const blob = input?.blob;
  if (!(blob instanceof Blob) || !MIME_TYPES.has(blob.type) || !positiveInteger(blob.size)
    || blob.size > FIELD_MEDIA_LIMITS_V135.photoBytes || !positiveInteger(input.width) || !positiveInteger(input.height)
    || input.width > FIELD_MEDIA_LIMITS_V135.dimension || input.height > FIELD_MEDIA_LIMITS_V135.dimension
    || !SCENES.has(input.scene)) {
    throw error('INVALID_PHOTO', 'La vue du jeu ne peut pas être conservée sous forme de photo.');
  }
  let bytes;
  try { bytes = new Uint8Array(await blob.slice(0, 16).arrayBuffer()); } catch (cause) { throw error('INVALID_PHOTO', 'La photo n’a pas pu être lue.', cause); }
  const validSignature = blob.type === 'image/png'
    ? [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)
    : blob.type === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
      : String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  if (!validSignature) throw error('INVALID_PHOTO', 'Le fichier produit par la vue du jeu n’est pas une photo reconnue.');
  const capturedAt = input.capturedAt ?? now();
  if (!positiveInteger(capturedAt) || capturedAt > 8640000000000000) throw error('INVALID_PHOTO', 'La date de la photo est invalide.');
  return { blob, mimeType: blob.type, byteLength: blob.size, width: input.width, height: input.height,
    capturedAt, scene: input.scene, location: text(input.location) || 'Vue du jeu', worldId: identifier(input.worldId) };
}

export function createFieldMediaRepositoryV135({ indexedDB = globalThis.indexedDB, storage,
  isOwnerCurrent = () => true, now = () => Date.now(), randomUUID = () => globalThis.crypto.randomUUID() } = {}) {
  const backend = storage || createIndexedDbFieldMediaStorageV135(indexedDB);
  async function transact(...args) {
    try { return await backend.transact(...args); } catch (cause) { throw storageError(cause); }
  }
  function context(rawOwner) {
    const owner = normalizeFieldMediaOwnerV135(rawOwner), isCurrent = () => isOwnerCurrent(rawOwner) === true;
    assertCurrent(isCurrent); return { owner, isCurrent };
  }
  return {
    async list(rawOwner) {
      const { owner, isCurrent } = context(rawOwner);
      const entries = await transact(owner.ownerKey, 'readonly', records => {
        validateStored(records, owner);
        return { value: records.slice().sort((a, b) => b.capturedAt - a.capturedAt || a.id.localeCompare(b.id)).map(record => Object.freeze({ ...record })) };
      }, isCurrent);
      assertCurrent(isCurrent); return entries;
    },
    async capture(rawOwner, input) {
      const { owner, isCurrent } = context(rawOwner), photo = await validatePhoto(input, now);
      assertCurrent(isCurrent);
      let id;
      try { id = `photo-v135-${randomUUID()}`; } catch (cause) { throw storageError(cause); }
      if (!/^photo-v135-[a-z0-9-]{1,80}$/iu.test(id)) throw error('INVALID_PHOTO', 'L’identifiant de la photo est invalide.');
      const record = Object.freeze({ schema: 135, id, ...owner, ...photo });
      return transact(owner.ownerKey, 'readwrite', records => {
        validateStored(records, owner);
        if (records.length >= FIELD_MEDIA_LIMITS_V135.count) throw error('PHOTO_LIMIT', 'La galerie contient déjà 12 photos. Supprimez une photo pour en conserver une autre.');
        if (records.reduce((total, entry) => total + entry.byteLength, 0) + record.byteLength > FIELD_MEDIA_LIMITS_V135.bytes) {
          throw error('BYTE_LIMIT', 'La galerie atteint sa limite de 16 Mio. Supprimez une photo pour libérer de la place.');
        }
        return { add: record, value: metadata(record) };
      }, isCurrent);
    },
    async remove(rawOwner, id) {
      const { owner, isCurrent } = context(rawOwner);
      if (!/^photo-v135-[a-z0-9-]{1,80}$/iu.test(id || '')) throw error('INVALID_PHOTO', 'La photo demandée est introuvable.');
      return transact(owner.ownerKey, 'readwrite', records => {
        validateStored(records, owner);
        const present = records.some(record => record.id === id);
        return present ? { deleteId: id, value: true } : { value: false };
      }, isCurrent);
    },
    close() { backend.close?.(); }
  };
}
