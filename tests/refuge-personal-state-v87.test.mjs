import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  REFUGE_PERSONAL_STORAGE_PREFIX_V87, REFUGE_PERSONAL_MAX_NAME_LENGTH_V87,
  REFUGE_PERSONAL_MAX_DEDICATION_LENGTH_V87, REFUGE_PERSONAL_MAX_OWNER_LENGTH_V87,
  REFUGE_PERSONAL_MAX_PHOTO_BYTES_V87, createRefugePersonalStateV87,
  refugePersonalStorageKeyV87, RefugePersonalStoreV87
} from '../src/refuge-personal-state-v87.js';

const owner = (profileId = 'profile-a', gameId = '1789900000000:echo-9') => ({ profileId, gameId });
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6kQAAAABJRU5ErkJggg==';
const encode = (mime, bytes) => `data:image/${mime};base64,` + Buffer.from(bytes).toString('base64');
// Container fixtures exercise the domain guard, not UI image decoding or pixel normalization.
const JPEG = encode('jpeg', [255, 216, 255, 224, 0, 4, 0, 0, 255, 217]);
const webp = (size = 24) => {
  const bytes = Buffer.alloc(size); bytes.write('RIFF'); bytes.writeUInt32LE(size - 8, 4);
  bytes.write('WEBPVP8 ', 8); return encode('webp', bytes);
};
const quota = () => Object.assign(new Error('full'), { name: 'QuotaExceededError' });
class MemoryStorage {
  data = new Map(); writes = 0; removes = 0; beforeWrite = null;
  getItem(key) { return this.data.get(key) ?? null; }
  setItem(key, value) { this.writes++; this.beforeWrite?.(key, value); this.data.set(key, String(value)); }
  removeItem(key) { this.removes++; this.data.delete(key); }
}
function setup() { const storage = new MemoryStorage(); return { storage, store: new RefugePersonalStoreV87({ storage }) }; }
const stored = (storage, currentOwner = owner()) => storage.getItem(refugePersonalStorageKeyV87(currentOwner));
function seed(storage, value, currentOwner = owner()) {
  storage.data.set(refugePersonalStorageKeyV87(currentOwner), typeof value === 'string' ? value : JSON.stringify(value));
}
const envelope = (state = createRefugePersonalStateV87(), currentOwner = owner()) => ({ schema: 1, owner: currentOwner, state });

test('neutral state invents no name, dates, photo, reward or military memorial and is a fresh clone', () => {
  const state = createRefugePersonalStateV87();
  assert.deepEqual(state, { schema: 1, revision: 0, name: '', dedication: '', photoDataUrl: null, lightOn: false });
  assert.notEqual(createRefugePersonalStateV87(state), state);
  const frozen = Object.freeze({ ...state, name: 'Mémoire' });
  assert.deepEqual(createRefugePersonalStateV87(frozen), frozen);
});

test('missing local state is readable but never automatically persisted', () => {
  const { store, storage } = setup();
  assert.deepEqual(store.load(owner()), { ok: true, code: 'empty', state: createRefugePersonalStateV87(), changed: false });
  assert.equal(storage.writes, 0); assert.equal(storage.data.size, 0);
});

test('name, dedication, photograph and LED survive reconstruction of the store', () => {
  const { store, storage } = setup(); const patch = { name: 'Mon compagnon', dedication: 'Merci.\nToujours ici.', photoDataUrl: PNG, lightOn: true };
  const result = store.commit(owner(), Object.freeze(patch));
  assert.equal(result.ok, true); assert.equal(result.code, 'committed'); assert.equal(result.changed, true);
  assert.deepEqual(result.state, { ...createRefugePersonalStateV87(), ...patch, revision: 1 });
  assert.deepEqual(new RefugePersonalStoreV87({ storage }).load(owner()).state, result.state);
  assert.equal(storage.writes, 1);
  const raw = JSON.parse(stored(storage)); assert.deepEqual(raw.owner, owner()); assert.equal(raw.schema, 1);
});

test('profile and game identity isolate three independent personal records', () => {
  const { store, storage } = setup();
  const owners = [owner(), owner('profile-b'), owner('profile-a', '1789900000001:echo-9')];
  owners.forEach((value, index) => assert.equal(store.commit(value, { name: `Nom ${index}` }).ok, true));
  owners.forEach((value, index) => assert.equal(store.load(value).state.name, `Nom ${index}`));
  assert.equal(storage.data.size, 3); assert.equal(store.load(owner('new-profile')).state.name, '');
});

test('key escaping prevents owner delimiter collisions and accepts the integration game stamp', () => {
  assert.notEqual(refugePersonalStorageKeyV87(owner('a:b', 'c')), refugePersonalStorageKeyV87(owner('a', 'b:c')));
  assert.notEqual(refugePersonalStorageKeyV87(owner('%3A', 'c')), refugePersonalStorageKeyV87(owner(':', 'c')));
  assert.ok(refugePersonalStorageKeyV87(owner('profil été', '1789900000000:' + 'i'.repeat(200))).startsWith(REFUGE_PERSONAL_STORAGE_PREFIX_V87));
  assert.ok(REFUGE_PERSONAL_MAX_OWNER_LENGTH_V87 >= 220);
});

test('invalid owner causes no storage reads or writes', () => {
  const { store, storage } = setup();
  for (const value of [null, {}, owner('', 'x'), owner('a', ''), owner('a', 123), owner('a', 'x'.repeat(257)),
    owner('a', 'bad\nidentity'), owner('a', '\ud800'), { ...owner(), extra: 'x' }]) {
    assert.equal(store.load(value).code, 'invalid-owner'); assert.equal(store.commit(value, { name: 'x' }).code, 'invalid-owner');
  }
  assert.equal(storage.writes, 0); assert.equal(storage.data.size, 0);
});

test('owner copied from another envelope is rejected without exposing that profile state', () => {
  const { store, storage } = setup(); const raw = envelope({ ...createRefugePersonalStateV87(), name: 'Secret' }, owner('other'));
  seed(storage, raw); const before = stored(storage);
  assert.deepEqual(store.load(owner()), { ok: false, code: 'owner-mismatch', state: null, changed: false });
  assert.equal(store.commit(owner(), { name: 'replacement' }).ok, false); assert.equal(stored(storage), before);
});

test('patch merges against freshly read state, not a stale per-instance cache', () => {
  const { store, storage } = setup(); const second = new RefugePersonalStoreV87({ storage });
  store.load(owner()); second.commit(owner(), { dedication: 'Persistante' });
  const result = store.commit(owner(), { lightOn: true });
  assert.equal(result.state.dedication, 'Persistante'); assert.equal(result.state.lightOn, true); assert.equal(result.state.revision, 2);
});

test('repeated commits and clearing an absent photo are idempotent without revision churn', () => {
  const { store, storage } = setup();
  assert.equal(store.removePhoto(owner()).code, 'unchanged'); assert.equal(storage.data.size, 0);
  const first = store.commit(owner(), { name: 'Souvenir' });
  const again = store.commit(owner(), { name: 'Souvenir' });
  assert.equal(again.code, 'unchanged'); assert.equal(again.changed, false); assert.deepEqual(again.state, first.state);
  assert.equal(storage.writes, 1);
});

test('removePhoto preserves text and light and never removes another owner record', () => {
  const { store, storage } = setup(); store.commit(owner(), { name: 'Nom', dedication: 'Texte', photoDataUrl: PNG, lightOn: true });
  store.commit(owner('other'), { photoDataUrl: PNG });
  const result = store.removePhoto(owner());
  assert.deepEqual(result.state, { schema: 1, revision: 2, name: 'Nom', dedication: 'Texte', photoDataUrl: null, lightOn: true });
  assert.equal(store.load(owner('other')).state.photoDataUrl, PNG); assert.equal(storage.removes, 0);
});

test('returned objects cannot mutate persisted or subsequent loaded state', () => {
  const { store } = setup(); const value = store.commit(owner(), { name: 'Stable' }); value.state.name = 'Muté';
  const read = store.load(owner()); assert.equal(read.state.name, 'Stable'); read.state.name = 'Encore';
  assert.equal(store.load(owner()).state.name, 'Stable');
});

test('factory rejects corrupt, incomplete, future and unknown fields rather than sanitizing them away', () => {
  for (const value of [null, [], 'text', {}, { ...createRefugePersonalStateV87(), schema: 0 },
    { ...createRefugePersonalStateV87(), revision: -1 }, { ...createRefugePersonalStateV87(), revision: 1.5 },
    { ...createRefugePersonalStateV87(), bonus: 1 }]) {
    assert.throws(() => createRefugePersonalStateV87(value), error => error.code === 'invalid-state');
  }
  assert.throws(() => createRefugePersonalStateV87({ schema: 2, personalFuture: 'preserve' }), error => error.code === 'future-schema');
});

for (const [label, raw, code] of [
  ['invalid JSON', '{missing', 'corrupt-storage'], ['JSON null', 'null', 'corrupt-storage'],
  ['extra envelope field', { ...envelope(), unexpected: 1 }, 'corrupt-storage'],
  ['future envelope', { ...envelope(), schema: 2, future: 'preserved' }, 'future-schema'],
  ['future state', envelope({ schema: 2, future: 'preserved' }), 'future-schema'],
  ['corrupt state', envelope({ ...createRefugePersonalStateV87(), revision: '1' }), 'invalid-state'],
  ['corrupt photo', envelope({ ...createRefugePersonalStateV87(), photoDataUrl: 'https://example.org/photo.png' }), 'invalid-photo']
]) test(`${label} remains byte-for-byte untouched and blocks editing/removal`, () => {
  const { store, storage } = setup(); seed(storage, raw); const before = stored(storage);
  for (const result of [store.load(owner()), store.commit(owner(), { name: 'No overwrite' }), store.removePhoto(owner())]) {
    assert.equal(result.ok, false); assert.equal(result.code, code); assert.equal(result.state, null);
  }
  assert.equal(stored(storage), before); assert.equal(storage.writes, 0);
});

test('oversized stored records are refused before parsing and kept for recovery', () => {
  const { store, storage } = setup(); const raw = ' '.repeat(800000); seed(storage, raw);
  assert.equal(store.load(owner()).code, 'corrupt-storage'); assert.equal(stored(storage), raw);
});

test('patch disallows schema, owner, rewards, inherited objects, symbols and accessors', () => {
  const { store, storage } = setup();
  for (const patch of [null, [], 'text', { schema: 1 }, { revision: 0 }, { owner: owner() }, { bonus: 1 },
    { name: 'x', [Symbol('unknown')]: true }, Object.create({ name: 'x' }),
    Object.defineProperty({}, 'name', { enumerable: true, get: () => { throw new Error('must not execute'); } }),
    JSON.parse('{"__proto__":{"polluted":true}}')]) {
    assert.equal(store.commit(owner(), patch).code, 'invalid-patch');
  }
  assert.equal(storage.writes, 0); assert.equal({}.polluted, undefined);
});

test('text is literal data, including HTML-looking content; module has no HTML or network side effects', () => {
  const { store } = setup(); const name = '<img src=x onerror=alert(1)>';
  const dedication = '<script>alert(1)</script>\n& <b>souvenir</b>\t';
  const result = store.commit(owner(), { name, dedication });
  assert.equal(result.ok, true); assert.equal(result.state.name, name); assert.equal(result.state.dedication, dedication);
  const source = readFileSync(new URL('../src/refuge-personal-state-v87.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /innerHTML|outerHTML|insertAdjacentHTML|document\.|fetch\(|XMLHttpRequest|SaveSystem|import\s/);
  // The UI must use textContent/value, never interpret these fields as markup.
});

test('text and LED validations reject, never truncate or coerce', () => {
  const { store, storage } = setup();
  for (const [patch, code] of [[{ name: 'x'.repeat(REFUGE_PERSONAL_MAX_NAME_LENGTH_V87 + 1) }, 'invalid-name'],
    [{ name: 'line\nbreak' }, 'invalid-name'], [{ name: 123 }, 'invalid-name'],
    [{ dedication: 'x'.repeat(REFUGE_PERSONAL_MAX_DEDICATION_LENGTH_V87 + 1) }, 'invalid-dedication'],
    [{ dedication: 'bad\u0000text' }, 'invalid-dedication'], [{ lightOn: 'true' }, 'invalid-light']]) {
    assert.equal(store.commit(owner(), patch).code, code);
  }
  assert.equal(storage.writes, 0);
  assert.equal(store.commit(owner(), { name: 'x'.repeat(80), dedication: 'x'.repeat(2000) }).ok, true);
});

test('only bounded canonical base64 PNG, JPEG and WebP container signatures are accepted', () => {
  const { store } = setup();
  for (const photoDataUrl of [PNG, JPEG, webp()]) assert.equal(store.commit(owner(), { photoDataUrl }).ok, true);
  for (const photoDataUrl of ['', 'https://example.org/photo.png', 'blob:local', 'data:image/svg+xml;base64,PHN2Zy8+',
    'data:text/html;base64,PHNjcmlwdD4=', PNG.replace('image/png', 'image/jpeg'), PNG + '\n',
    PNG.replace(';base64,', ';charset=utf-8;base64,'), 'data:image/png;base64,AAAA=',
    'data:image/png;base64,AAAA', 'data:image/png;base64,%%%%', encode('webp', Buffer.from('RIFFxxxxxxxxWEBPVP8 ')),
    PNG.replace(';base64,', ','), 'data:image/jpeg;base64,/9n=']) {
    const result = store.commit(owner(), { photoDataUrl }); assert.equal(result.ok, false, photoDataUrl.slice(0, 60));
    assert.equal(result.code, 'invalid-photo');
  }
});

test('decoded photo limit is exact, and oversized imports do not replace the previous photograph', () => {
  const { store, storage } = setup();
  const accepted = store.commit(owner(), { photoDataUrl: webp(REFUGE_PERSONAL_MAX_PHOTO_BYTES_V87) });
  assert.equal(accepted.ok, true); const before = stored(storage);
  const refused = store.commit(owner(), { photoDataUrl: webp(REFUGE_PERSONAL_MAX_PHOTO_BYTES_V87 + 1) });
  assert.equal(refused.code, 'photo-too-large'); assert.equal(refused.state.photoDataUrl, accepted.state.photoDataUrl);
  assert.equal(stored(storage), before);
});

test('quota failure preserves the old bytes, state and revision, including photo', () => {
  const { store, storage } = setup(); const beforeState = store.commit(owner(), { name: 'Avant', photoDataUrl: PNG }).state;
  const before = stored(storage); storage.beforeWrite = () => { throw quota(); };
  const result = store.commit(owner(), { name: 'Après', photoDataUrl: null });
  assert.equal(result.ok, false); assert.equal(result.code, 'quota-exceeded'); assert.equal(result.changed, false);
  assert.deepEqual(result.state, beforeState); assert.equal(stored(storage), before);
});

test('initial quota failure never manufactures a persisted neutral record or false success', () => {
  const { store, storage } = setup(); storage.beforeWrite = () => { throw quota(); };
  const result = store.commit(owner(), { name: 'Texte' });
  assert.equal(result.code, 'quota-exceeded'); assert.equal(result.state.revision, 0); assert.equal(storage.data.size, 0);
});

test('non-atomic adapter that writes then throws is rolled back to the exact previous record', () => {
  const { store, storage } = setup(); store.commit(owner(), { name: 'Avant', photoDataUrl: PNG }); const before = stored(storage);
  storage.setItem = (key, value) => { storage.data.set(key, value); throw quota(); };
  const result = store.commit(owner(), { name: 'Après' });
  assert.equal(result.code, 'quota-exceeded'); assert.equal(result.changed, false); assert.equal(result.state.name, 'Avant');
  assert.equal(stored(storage), before);
});

test('failed first adapter write is removed on rollback without affecting another profile', () => {
  const { store, storage } = setup(); store.commit(owner('other'), { name: 'Autre' }); const other = stored(storage, owner('other'));
  storage.setItem = (key, value) => { storage.data.set(key, value); throw new Error('adapter failed'); };
  const result = store.commit(owner(), { name: 'Après' });
  assert.equal(result.code, 'storage-write-failed'); assert.equal(stored(storage), null); assert.equal(storage.removes, 1);
  assert.equal(stored(storage, owner('other')), other);
});

test('rollback failure is explicit and never returns proposed data as successful state', () => {
  const { store, storage } = setup();
  storage.setItem = (key, value) => { storage.data.set(key, value); throw quota(); };
  storage.removeItem = () => { throw new Error('blocked'); };
  const result = store.commit(owner(), { name: 'Not acknowledged' });
  assert.deepEqual(result, { ok: false, code: 'rollback-failed', state: null, changed: false });
});

test('a conflicting adapter write is not overwritten by rollback', () => {
  const { store, storage } = setup(); const otherBytes = JSON.stringify(envelope({ ...createRefugePersonalStateV87(), name: 'Autre onglet' }));
  storage.setItem = key => { storage.data.set(key, otherBytes); throw new Error('concurrent'); };
  const result = store.commit(owner(), { name: 'Stale write' });
  assert.equal(result.code, 'storage-write-conflict'); assert.equal(result.state, null); assert.equal(stored(storage), otherBytes);
});

test('silent write failures are not acknowledged as successful commits', () => {
  const { store, storage } = setup(); storage.setItem = () => {};
  assert.equal(store.commit(owner(), { lightOn: true }).code, 'storage-verification-failed');
  assert.equal(stored(storage), null);
});

test('storage unavailability, read exceptions and ambiguous readback are explicit failures', () => {
  assert.equal(new RefugePersonalStoreV87({ storage: null }).load(owner()).code, 'storage-unavailable');
  const { store, storage } = setup(); storage.getItem = () => { throw new Error('denied'); };
  assert.equal(store.load(owner()).code, 'storage-read-failed');
  assert.equal(store.commit(owner(), { name: 'No write' }).code, 'storage-read-failed'); assert.equal(storage.writes, 0);
  const second = setup(); let readCount = 0;
  second.storage.getItem = key => { if (++readCount > 1) throw new Error('lost access'); return second.storage.data.get(key) ?? null; };
  const result = second.store.commit(owner(), { name: 'Uncertain' });
  assert.equal(result.code, 'storage-readback-failed'); assert.equal(result.ok, false); assert.equal(result.state, null);
});

test('revision exhaustion preserves the saved record instead of wrapping or resetting', () => {
  const { store, storage } = setup(); seed(storage, envelope({ ...createRefugePersonalStateV87(), revision: Number.MAX_SAFE_INTEGER }));
  const before = stored(storage); assert.equal(store.commit(owner(), { name: 'No wrap' }).code, 'revision-exhausted');
  assert.equal(stored(storage), before); assert.equal(storage.writes, 0);
});
