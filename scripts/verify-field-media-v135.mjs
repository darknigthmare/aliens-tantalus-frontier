import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FIELD_MEDIA_LIMITS_V135, FieldMediaErrorV135, normalizeFieldMediaOwnerV135,
  createFieldMediaRepositoryV135, createIndexedDbFieldMediaStorageV135 } from '../src/field-media-v135.js';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jR3sAAAAASUVORK5CYII=', 'base64');
const owner = (profile = 1, createdAt = 1700000000000, identityId = `${profile}:${createdAt}:primary`) => ({ profile, createdAt, identityId, epoch: 1, timeline: createdAt });
const frame = (size = PNG.length, overrides = {}) => ({ blob: new Blob([PNG, new Uint8Array(Math.max(0, size - PNG.length))], { type: 'image/png' }),
  width: 1280, height: 720, scene: 'hub', location: 'Passerelle', worldId: 'world-01', ...overrides });

/** Failure-injectable transactional backend; production uses native IndexedDB. */
function fixture() {
  const rows = new Map(); let queue = Promise.resolve(), serial = 0;
  const backend = {
    failCommit: null, beforeRead: null,
    transact(key, mode, action, isCurrent) {
      const operation = queue.then(async () => {
        if (backend.beforeRead) await backend.beforeRead();
        if (!isCurrent()) throw new FieldMediaErrorV135('STALE_OWNER', 'stale');
        const records = [...rows.values()].filter(record => record.ownerKey === key).map(record => structuredClone(record));
        const mutation = action(records);
        if (!isCurrent()) throw new FieldMediaErrorV135('STALE_OWNER', 'stale');
        if (mode === 'readwrite' && backend.failCommit) throw backend.failCommit;
        if (mutation.add) {
          if (rows.has(mutation.add.id)) throw Object.assign(new Error('duplicate id'), { name: 'ConstraintError' });
          rows.set(mutation.add.id, structuredClone(mutation.add));
        }
        if (mutation.deleteId) rows.delete(mutation.deleteId);
        return mutation.value;
      });
      queue = operation.catch(() => {}); return operation;
    }
  };
  let current = owner();
  const repository = createFieldMediaRepositoryV135({ storage: backend, now: () => 1800000000000, randomUUID: () => `test-${++serial}`,
    isOwnerCurrent: requested => requested.profile === current.profile && requested.createdAt === current.createdAt
      && requested.identityId === current.identityId && requested.epoch === current.epoch });
  return { repository, backend, rows, current: () => current, setOwner: next => { current = next; } };
}
const code = expected => cause => cause instanceof FieldMediaErrorV135 && cause.code === expected;

test('owners distinguish profile, saved timeline and operator without tying a photo to the current world', () => {
  const first = normalizeFieldMediaOwnerV135(owner());
  assert.equal(first.ownerKey, normalizeFieldMediaOwnerV135({ ...owner(), worldId: 'elsewhere', epoch: 99 }).ownerKey);
  for (const other of [owner(2), owner(1, 1700000000001), owner(1, 1700000000000, 'another-operator')]) {
    assert.notEqual(first.ownerKey, normalizeFieldMediaOwnerV135(other).ownerKey);
  }
  for (const invalid of [null, {}, owner(0), owner(4), owner(1, 0), owner(1, NaN), owner(1, 1.5), owner(1, 1, '../remote'), owner(1, 1, 'https://remote')]) {
    assert.throws(() => normalizeFieldMediaOwnerV135(invalid), code('INVALID_OWNER'));
  }
});

test('capture preserves actual image bytes with bounded contextual metadata and no Blob in returned save metadata', async () => {
  const { repository, current } = fixture();
  const photo = await repository.capture(current(), frame(PNG.length, { location: '<script>not markup</script>', worldId: 'world-03' }));
  assert.equal(photo.blob, undefined); assert.equal(photo.byteLength, PNG.length); assert.equal(photo.mimeType, 'image/png');
  assert.equal(photo.capturedAt, 1800000000000); assert.equal(photo.location, '<script>not markup</script>');
  assert.ok(!JSON.stringify(photo).includes('base64')); assert.equal(photo.worldId, 'world-03');
  const [stored] = await repository.list(current());
  assert.deepEqual(Buffer.from(await stored.blob.arrayBuffer()), PNG);
  assert.equal(stored.id, photo.id); assert.equal(stored.width, 1280); assert.equal(stored.scene, 'hub');
});

test('rejects arbitrary media, remote strings, empty bytes, invalid raster signatures, dimensions and timestamps before any write', async () => {
  const { repository, current, rows } = fixture();
  const invalidFrames = [frame(0, { blob: 'https://remote/image.png' }), frame(0, { blob: new Blob([], { type: 'image/png' }) }),
    frame(0, { blob: new Blob([PNG], { type: 'image/svg+xml' }) }), frame(0, { blob: new Blob(['<html>'], { type: 'image/png' }) }),
    frame(0, { width: 0 }), frame(0, { height: 4097 }), frame(0, { width: 1.5 }), frame(0, { scene: 'historical-recording' }),
    frame(0, { capturedAt: 0 }), frame(0, { capturedAt: Infinity }), frame(FIELD_MEDIA_LIMITS_V135.photoBytes + 1)];
  for (const input of invalidFrames) await assert.rejects(repository.capture(current(), input), code('INVALID_PHOTO'));
  assert.equal(rows.size, 0);
});

test('concurrent captures respect the 12-photo bound without discarding any earlier photograph', async () => {
  const { repository, current } = fixture();
  const results = await Promise.allSettled(Array.from({ length: 15 }, () => repository.capture(current(), frame())));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 12);
  assert.ok(results.filter(result => result.status === 'rejected').every(result => result.reason.code === 'PHOTO_LIMIT'));
  const photos = await repository.list(current()); assert.equal(photos.length, 12);
  assert.equal(new Set(photos.map(photo => photo.id)).size, 12);
  await assert.rejects(repository.capture(current(), frame()), code('PHOTO_LIMIT'));
  assert.deepEqual((await repository.list(current())).map(photo => photo.id), photos.map(photo => photo.id));
});

test('the byte limit is atomic and lets the player free only the selected photo before retrying', async () => {
  const { repository, current } = fixture(), size = FIELD_MEDIA_LIMITS_V135.photoBytes;
  const photos = [];
  for (let index = 0; index < 4; index += 1) photos.push(await repository.capture(current(), frame(size)));
  await assert.rejects(repository.capture(current(), frame()), code('BYTE_LIMIT'));
  assert.equal((await repository.list(current())).reduce((sum, photo) => sum + photo.byteLength, 0), FIELD_MEDIA_LIMITS_V135.bytes);
  assert.equal(await repository.remove(current(), photos[1].id), true);
  await repository.capture(current(), frame());
  assert.equal((await repository.list(current())).length, 4);
  assert.ok((await repository.list(current())).some(photo => photo.id === photos[0].id));
});

test('profiles, imported new timelines and operators cannot read or delete one another’s photos', async () => {
  const f = fixture(), original = f.current(), photo = await f.repository.capture(original, frame());
  for (const next of [owner(2), owner(1, original.createdAt + 1), owner(1, original.createdAt, 'other-operator')]) {
    f.setOwner(next); assert.deepEqual(await f.repository.list(next), []);
    assert.equal(await f.repository.remove(next, photo.id), false);
  }
  f.setOwner(original); assert.equal((await f.repository.list(original)).length, 1);
  assert.equal(await f.repository.remove(original, photo.id), true);
  assert.equal(await f.repository.remove(original, photo.id), false);
});

test('a storage quota failure rolls the new metadata and Blob back together and preserves all previous photos', async () => {
  const f = fixture(), photo = await f.repository.capture(f.current(), frame());
  f.backend.failCommit = Object.assign(new Error('quota'), { name: 'QuotaExceededError' });
  await assert.rejects(f.repository.capture(f.current(), frame()), code('STORAGE_FULL'));
  await assert.rejects(f.repository.remove(f.current(), photo.id), code('STORAGE_FULL'));
  f.backend.failCommit = null;
  const entries = await f.repository.list(f.current()); assert.deepEqual(entries.map(entry => entry.id), [photo.id]);
  assert.deepEqual(Buffer.from(await entries[0].blob.arrayBuffer()), PNG);
});

test('switching profiles while bytes are being read cancels capture before its transaction', async () => {
  const f = fixture(), original = f.current();
  let finishRead;
  const blob = new Blob([PNG], { type: 'image/png' });
  blob.slice = () => ({ arrayBuffer: () => new Promise(resolve => { finishRead = () => resolve(PNG.buffer.slice(PNG.byteOffset, PNG.byteOffset + PNG.byteLength)); }) });
  const pending = f.repository.capture(original, frame(0, { blob }));
  f.setOwner(owner(2)); finishRead(); await assert.rejects(pending, code('STALE_OWNER'));
  assert.equal(f.rows.size, 0);
});

test('a stale queued delete and a stale queued capture cannot mutate the previous owner even when the profile number returns', async () => {
  const f = fixture(), original = f.current(), photo = await f.repository.capture(original, frame());
  let release; f.backend.beforeRead = () => new Promise(resolve => { release = resolve; });
  const deletion = f.repository.remove(original, photo.id);
  await Promise.resolve(); f.setOwner({ ...original, epoch: 3 }); release();
  await assert.rejects(deletion, code('STALE_OWNER')); f.backend.beforeRead = null;
  assert.equal(f.rows.size, 1);
  await assert.rejects(f.repository.capture(original, frame()), code('STALE_OWNER'));
  assert.equal(f.rows.size, 1);
});

test('corrupt local records are reported and never silently purged or counted as valid capacity', async () => {
  const f = fixture(), photo = await f.repository.capture(f.current(), frame());
  f.rows.set(photo.id, { ...f.rows.get(photo.id), byteLength: 1 });
  await assert.rejects(f.repository.list(f.current()), code('STORAGE_INVALID'));
  await assert.rejects(f.repository.capture(f.current(), frame()), code('STORAGE_INVALID'));
  await assert.rejects(f.repository.remove(f.current(), photo.id), code('STORAGE_INVALID'));
  assert.equal(f.rows.size, 1);
});

test('missing and blocked IndexedDB fail explicitly; no in-memory fake persistence is substituted', async () => {
  const missing = createFieldMediaRepositoryV135({ indexedDB: null });
  await assert.rejects(missing.list(owner()), code('STORAGE_UNAVAILABLE'));
  let request;
  const storage = createIndexedDbFieldMediaStorageV135({ open() { request = {}; queueMicrotask(() => request.onblocked()); return request; } });
  await assert.rejects(storage.transact('owner', 'readonly', () => ({ value: [] }), () => true), code('STORAGE_BLOCKED'));
  let closed = false; request.result = { close() { closed = true; } }; request.onsuccess(); assert.equal(closed, true);
  storage.close(); await assert.rejects(storage.transact('owner', 'readonly', () => ({ value: [] }), () => true), code('STORAGE_UNAVAILABLE'));
});
