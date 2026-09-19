import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { RefugeControllerV87 } from '../src/refuge-controller-v87.js';
import { REFUGE_STATIONS_V87, SHIP_REFUGE_ANNEX_V87, getRefugeInteractionV87 } from '../src/refuge-room-v87.js';
import { RefugePersonalStoreV87, createRefugePersonalStateV87, refugePersonalStorageKeyV87 } from '../src/refuge-personal-state-v87.js';

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6kQAAAABJRU5ErkJggg==';
const JPEG = 'data:image/jpeg;base64,/9j/4AAEAAD/2Q==';
const quota = () => Object.assign(new Error('Quota local plein'), { name: 'QuotaExceededError' });
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };

// Positions here are explicit unit fixtures at authored anchors, not a claimed keyboard traversal.
// Native focus/layout, real decoding and the full application lifecycle remain browser integration gates.
function documentDouble() {
  const listeners = new Map();
  const document = { activeElement: null, hidden: false, images: [], canvases: [],
    defaultView: { addEventListener(type, callback) { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push(callback); },
      removeEventListener(type, callback) { listeners.set(type, (listeners.get(type) || []).filter(value => value !== callback)); } },
    dispatchStorage(key) { for (const callback of listeners.get('storage') || []) callback({ key }); } };
  class Element {
    constructor(tag) {
      this.tagName = tag.toUpperCase(); this.children = []; this.dataset = {}; this.attributes = new Map(); this.events = new Map();
      this.open = false; this.hidden = false; this.disabled = false; this.isConnected = true; this.textContent = ''; this.value = '';
    }
    set innerHTML(value) { throw new Error(`Unsafe markup: ${value}`); }
    set src(value) { this.setAttribute('src', value); }
    get src() { return this.getAttribute('src') || ''; }
    append(...nodes) { this.children.push(...nodes); }
    setAttribute(key, value) { this.attributes.set(key, String(value)); }
    getAttribute(key) { return this.attributes.get(key) ?? null; }
    removeAttribute(key) { this.attributes.delete(key); }
    addEventListener(type, callback) { if (!this.events.has(type)) this.events.set(type, []); this.events.get(type).push(callback); }
    fire(type, extra = {}) {
      const event = { type, prevented: false, stopped: false, preventDefault() { this.prevented = true; }, stopPropagation() { this.stopped = true; }, ...extra };
      for (const callback of this.events.get(type) || []) callback(event); return event;
    }
    focus() { document.activeElement = this; }
    showModal() { this.open = true; }
    close() { this.open = false; this.fire('close'); }
    getContext() { return { fillRect() {}, drawImage() {} }; }
    toDataURL() { return JPEG; }
  }
  document.createElement = tag => { const node = new Element(tag); if (tag === 'img') document.images.push(node); if (tag === 'canvas') document.canvases.push(node); return node; };
  document.body = new Element('body'); return document;
}

class MemoryStorage {
  rows = new Map(); writes = 0; full = false;
  getItem(key) { return this.rows.get(key) ?? null; }
  setItem(key, value) { this.writes++; if (this.full) throw quota(); this.rows.set(key, String(value)); }
  removeItem(key) { this.rows.delete(key); }
}

function harness({ storage = new MemoryStorage(), profile = 'profile-a', data } = {}) {
  const document = documentDouble(), toasts = [], counters = { pauses: 0, resumes: 0, draws: 0, status: 0 };
  const saveSystem = { storage, profile, data: data || { createdAt: 1789900000000,
    onboardingV84: { identity: { id: 'echo-9' } }, galaxy: { resources: { credits: 1000, medical: 10 } },
    memorial: [{ operatorId: 'military-only', name: 'Marine souvenir' }], operations: { completed: ['old-campaign'] } } };
  let active = true;
  const hub = { running: true, refuge: true, annexTransitionV71: null, editorPlaytest: false,
    player: { x: 400, y: 560, w: 44, h: 64, alive: true, vx: 20, vy: 10 }, cameraX: 71,
    keys: new Set(['KeyD']), jumpQueued: .14, statusKey: 'old', refugeMovementLockedV87: false, pauseError: null,
    isRefugeActiveV87() { return this.refuge; }, currentAnnexV71() { return this.refuge ? SHIP_REFUGE_ANNEX_V87 : null; },
    currentRoom() { return { id: this.refuge ? SHIP_REFUGE_ANNEX_V87.id : 'crew-quarters' }; },
    pause() { counters.pauses++; if (this.pauseError) throw this.pauseError; this.running = false; this.keys.clear(); return true; },
    resume() { counters.resumes++; this.running = true; return true; }, draw() { counters.draws++; }, emitStatus() { counters.status++; } };
  const controller = new RefugeControllerV87({ hub, saveSystem, isActive: () => active, toast: value => toasts.push(value), documentRef: document });
  return { controller, hub, document, storage, saveSystem, counters, toasts,
    get active() { return active; }, set active(value) { active = value; },
    place(action) { const station = REFUGE_STATIONS_V87.find(value => value.action === action); assert.ok(station, action);
      hub.player.x = station.centerX - hub.player.w / 2; hub.player.y = 624 - hub.player.h; return getRefugeInteractionV87(hub); },
    act(action) { return controller.handle(this.place(action)); } };
}
function domText(node) { return [node.textContent, node.value, ...node.attributes.values(), ...node.children.flatMap(domText)].filter(value => typeof value === 'string').join('\n'); }
const recordBytes = h => h.storage.getItem(refugePersonalStorageKeyV87(h.controller.owner()));

test('controller hooks, stable owner and neutral snapshot contain no personal content or invented identity', () => {
  const h = harness(), { controller, hub } = h;
  assert.deepEqual(controller.owner(), { profileId: 'profile-a', gameId: '1789900000000:echo-9' });
  assert.equal(typeof hub.onRefugeTickV87, 'function'); assert.equal(typeof hub.getRefugePresentationV87, 'function');
  assert.deepEqual(hub.getRefugeSnapshotV87(), { active: true, modal: false, contemplating: false, greetingRemaining: 0,
    personalRevision: 0, hasPhoto: false, storageError: false });
  assert.equal(h.storage.writes, 0); h.saveSystem.data.onboardingV84 = null;
  assert.equal(controller.owner().gameId, '1789900000000:legacy');
});

test('all five real station anchors dispatch their own interaction without modifying campaign or military memorial', () => {
  const h = harness(), before = structuredClone(h.saveSystem.data);
  assert.equal(REFUGE_STATIONS_V87.length, 5);
  for (const action of ['refuge:portrait', 'refuge:terminal']) {
    assert.equal(h.act(action), true); assert.equal(h.controller.ui.mode, action.slice(7)); h.controller.ui.close();
  }
  assert.equal(h.act('refuge:light'), true); assert.equal(h.controller.state.lightOn, true);
  assert.equal(h.act('refuge:hologram'), true); assert.equal(h.controller.greetingRemaining, 2);
  assert.equal(h.act('refuge:contemplate'), true); assert.equal(h.controller.contemplating, true);
  assert.deepEqual(h.saveSystem.data, before); assert.equal(h.counters.pauses, 2); assert.equal(h.counters.resumes, 2);
  h.controller.close();
});

test('an invented action or a station outside real proximity cannot be invoked', () => {
  const h = harness(); h.place('refuge:portrait');
  assert.equal(h.controller.handle({ action: 'refuge:light' }), false);
  assert.equal(h.controller.handle({ action: 'refuge:buy' }), false);
  h.hub.player.x = 130; assert.equal(h.controller.handle({ action: 'refuge:portrait' }), false);
  h.place('refuge:portrait'); h.hub.player.y -= 13; assert.equal(h.controller.handle({ action: 'refuge:portrait' }), false);
  assert.equal(h.storage.writes, 0); assert.equal(h.counters.pauses, 0);
});

test('inactive view, other room, dead actor, transition, editor and stopped hub block station interaction', () => {
  for (const change of [h => { h.active = false; }, h => { h.hub.refuge = false; }, h => { h.hub.player.alive = false; },
    h => { h.hub.annexTransitionV71 = {}; }, h => { h.hub.editorPlaytest = true; }, h => { h.hub.running = false; }]) {
    const h = harness(); h.place('refuge:light'); change(h);
    assert.equal(h.controller.handle({ action: 'refuge:light' }), false); assert.equal(h.storage.writes, 0);
  }
});

test('portrait and terminal pause the actual controller path, clear queued motion and resume once on close', () => {
  for (const action of ['refuge:portrait', 'refuge:terminal']) {
    const h = harness(); h.place(action); const position = { x: h.hub.player.x, y: h.hub.player.y, w: h.hub.player.w, h: h.hub.player.h, cameraX: h.hub.cameraX };
    assert.equal(h.controller.handle({ action }), true); assert.equal(h.hub.running, false); assert.equal(h.hub.keys.size, 0);
    assert.equal(h.hub.jumpQueued, 0); assert.equal(h.hub.player.vx, 0); assert.equal(h.hub.player.vy, 0);
    assert.deepEqual({ x: h.hub.player.x, y: h.hub.player.y, w: h.hub.player.w, h: h.hub.player.h, cameraX: h.hub.cameraX }, position);
    assert.equal(h.controller.handle({ action }), false); h.controller.ui.close(); h.controller.ui.close();
    assert.equal(h.counters.pauses, 1); assert.equal(h.counters.resumes, 1); assert.equal(h.hub.running, true); assert.equal(h.controller.modalOwner, null);
  }
});

test('pause persistence failure leaves the hub running and does not open an unacknowledged modal', () => {
  const h = harness(); h.hub.pauseError = quota(); assert.equal(h.act('refuge:portrait'), false);
  assert.equal(h.hub.running, true); assert.equal(h.controller.ui.isOpen, false); assert.equal(h.controller.modalOwner, null);
  assert.equal(h.counters.pauses, 1); assert.equal(h.counters.resumes, 0); assert.match(h.toasts.at(-1), /Pause non enregistrée/);
  assert.equal(h.storage.writes, 0); h.hub.pauseError = null; assert.equal(h.act('refuge:portrait'), true); h.controller.ui.close();
});

test('native modal failure resumes the hub and purges private draft instead of leaving it frozen', () => {
  const h = harness(); h.controller.store.commit(h.controller.owner(), { name: 'SENTINEL_PRIVATE', dedication: 'SENTINEL_DEDICATION', photoDataUrl: PNG });
  h.controller.ui.dialog.showModal = () => { throw new Error('No modal'); };
  assert.equal(h.act('refuge:portrait'), false); assert.equal(h.hub.running, true); assert.equal(h.controller.modalOwner, null);
  assert.equal(h.counters.pauses, 1); assert.equal(h.counters.resumes, 1);
  assert.doesNotMatch(domText(h.controller.ui.dialog), /SENTINEL_|data:image\//);
});

test('LED is persisted only in the owner private store, without resources or campaign changes', () => {
  const h = harness(), before = structuredClone(h.saveSystem.data);
  assert.equal(h.act('refuge:light'), true); assert.equal(h.controller.state.lightOn, true); assert.equal(h.storage.writes, 1);
  const fresh = harness({ storage: h.storage, data: structuredClone(h.saveSystem.data) }); fresh.controller.refreshOwner();
  assert.equal(fresh.controller.state.lightOn, true); assert.equal(fresh.act('refuge:light'), true);
  assert.equal(new RefugePersonalStoreV87({ storage: h.storage }).load(h.controller.owner()).state.lightOn, false);
  assert.deepEqual(h.saveSystem.data, before); assert.deepEqual(fresh.saveSystem.data, before);
});

test('LED quota failure has no false glow, draw, debit or successful notification', () => {
  const h = harness(), before = structuredClone(h.saveSystem.data); h.controller.refreshOwner(); h.storage.full = true;
  assert.equal(h.act('refuge:light'), false); assert.equal(h.controller.state.lightOn, false); assert.equal(recordBytes(h), null);
  assert.equal(h.counters.draws, 0); assert.match(h.toasts.at(-1), /Espace local insuffisant/);
  assert.doesNotMatch(h.toasts.at(-1), /allumée/); assert.deepEqual(h.saveSystem.data, before);
});

test('greeting is transient, active-time bounded and never saved or rewarded', () => {
  const h = harness(), before = structuredClone(h.saveSystem.data);
  assert.equal(h.act('refuge:hologram'), true); assert.equal(h.controller.greetingRemaining, 2);
  h.hub.onRefugeTickV87(100); assert.equal(h.controller.greetingRemaining, 1.75);
  h.hub.onRefugeTickV87(-1); h.hub.onRefugeTickV87(NaN); assert.equal(h.controller.greetingRemaining, 1.75);
  h.document.hidden = true; h.hub.onRefugeTickV87(1000); assert.equal(h.controller.greetingRemaining, 1.75); h.document.hidden = false;
  h.hub.running = false; h.hub.onRefugeTickV87(1000); assert.equal(h.controller.greetingRemaining, 1.75); h.hub.running = true;
  h.act('refuge:terminal'); h.hub.onRefugeTickV87(.2); assert.equal(h.controller.greetingRemaining, 1.75); h.controller.ui.close();
  for (let i = 0; i < 10; i++) h.hub.onRefugeTickV87(.25);
  assert.equal(h.controller.greetingRemaining, 0); assert.equal(h.storage.writes, 0); assert.deepEqual(h.saveSystem.data, before);
  assert.equal(h.act('refuge:hologram'), true); h.controller.close(); assert.equal(h.controller.greetingRemaining, 0);
});

test('contemplation locks only movement and releases on a real movement key or E interaction', () => {
  const h = harness(); h.place('refuge:contemplate'); const pose = { x: h.hub.player.x, y: h.hub.player.y, w: h.hub.player.w, h: h.hub.player.h };
  assert.equal(h.act('refuge:contemplate'), true); assert.equal(h.controller.contemplating, true); assert.equal(h.hub.refugeMovementLockedV87, true);
  assert.equal(h.hub.keys.size, 0); assert.equal(h.hub.jumpQueued, 0); assert.equal(h.hub.player.vx, 0); assert.equal(h.hub.player.vy, 0);
  h.hub.keys.add('KeyR'); h.controller.tick(.1); assert.equal(h.controller.contemplating, true);
  h.hub.keys.add('KeyD'); h.controller.tick(.1); assert.equal(h.controller.contemplating, false); assert.equal(h.hub.refugeMovementLockedV87, false);
  assert.equal(h.act('refuge:contemplate'), true); assert.equal(h.controller.handle({ action: 'refuge:contemplate' }), true);
  assert.equal(h.controller.contemplating, false); assert.equal(h.hub.refugeMovementLockedV87, false); assert.equal(h.controller.cancelContemplation(), false);
  assert.deepEqual({ x: h.hub.player.x, y: h.hub.player.y, w: h.hub.player.w, h: h.hub.player.h }, pose); assert.equal(h.storage.writes, 0);
});

test('leaving the room, dying or leaving the active view clears transient greeting and movement lock', () => {
  for (const change of [h => { h.hub.refuge = false; }, h => { h.hub.player.alive = false; }, h => { h.active = false; }]) {
    const h = harness(); h.act('refuge:hologram'); h.act('refuge:contemplate'); change(h); h.controller.tick(.2);
    assert.equal(h.controller.contemplating, false); assert.equal(h.controller.greetingRemaining, 0); assert.equal(h.hub.refugeMovementLockedV87, false);
    assert.deepEqual(h.controller.presentation(), {}); assert.equal(h.controller.snapshot().active, false);
  }
});

test('portrait commit succeeds for its captured owner/revision and updates no campaign data', () => {
  const h = harness(), before = structuredClone(h.saveSystem.data); h.act('refuge:portrait');
  h.controller.ui.name.value = 'Souvenir'; h.controller.ui.dedication.value = 'Merci'; h.controller.ui.draftPhoto = PNG;
  assert.equal(h.controller.ui.save(), true); assert.equal(h.controller.ui.isOpen, false); assert.equal(h.counters.resumes, 1);
  assert.equal(h.controller.store.load(h.controller.owner()).state.name, 'Souvenir'); assert.equal(h.controller.state.photoDataUrl, PNG);
  assert.match(h.toasts.at(-1), /enregistré sur cet appareil/); assert.deepEqual(h.saveSystem.data, before);
});

test('changed profile, creation identity or operator identity rejects the stale modal and never resumes another owner', () => {
  for (const change of [h => { h.saveSystem.profile = 'profile-b'; }, h => { h.saveSystem.data.createdAt++; },
    h => { h.saveSystem.data.onboardingV84.identity.id = 'another-operator'; }]) {
    const h = harness(), oldOwner = h.controller.owner(); h.act('refuge:portrait'); h.controller.ui.name.value = 'Old private draft'; change(h);
    assert.equal(h.controller.ui.save(), false); assert.match(h.controller.ui.error.textContent, /profil a changé/);
    assert.equal(h.storage.getItem(refugePersonalStorageKeyV87(oldOwner)), null); assert.equal(recordBytes(h), null);
    h.controller.ui.close(); assert.equal(h.counters.resumes, 0); assert.equal(h.hub.running, false);
  }
});

test('another tab revision prevents overwriting even after the controller refreshes its presentation cache', () => {
  const h = harness(); h.act('refuge:portrait'); h.controller.ui.name.value = 'Stale draft';
  const external = new RefugePersonalStoreV87({ storage: h.storage }); external.commit(h.controller.owner(), { name: 'Other tab' });
  h.document.dispatchStorage(refugePersonalStorageKeyV87(h.controller.owner())); assert.equal(h.controller.state.name, 'Other tab');
  assert.equal(h.controller.ui.save(), false); assert.match(h.controller.ui.error.textContent, /autre onglet/);
  assert.equal(external.load(h.controller.owner()).state.name, 'Other tab'); assert.equal(h.controller.ui.name.value, 'Stale draft');
  h.controller.ui.close(); h.act('refuge:portrait'); assert.equal(h.controller.ui.name.value, 'Other tab'); h.controller.ui.close();
});

test('quota during portrait commit keeps the old store and current draft, emits no success and does not resume', () => {
  const h = harness(); h.controller.store.commit(h.controller.owner(), { dedication: 'Avant', photoDataUrl: PNG });
  h.act('refuge:portrait'); const before = recordBytes(h); h.controller.ui.dedication.value = 'Brouillon'; h.controller.ui.draftPhoto = JPEG;
  h.storage.full = true; assert.equal(h.controller.ui.save(), false); assert.equal(recordBytes(h), before);
  assert.equal(h.controller.ui.dedication.value, 'Brouillon'); assert.equal(h.controller.ui.draftPhoto, JPEG);
  assert.match(h.controller.ui.error.textContent, /Espace local insuffisant/); assert.equal(h.counters.resumes, 0); assert.equal(h.toasts.length, 0);
  assert.equal(h.controller.state.dedication, 'Avant'); h.controller.ui.close();
});

test('future and corrupt stored data are explicitly read-only and never reset by portrait or LED', () => {
  for (const raw of ['{bad json', JSON.stringify({ schema: 2, privateFuture: 'preserve me' })]) {
    const h = harness(); h.storage.rows.set(refugePersonalStorageKeyV87(h.controller.owner()), raw);
    assert.equal(h.act('refuge:portrait'), true); assert.equal(h.controller.ui.readOnly, true); assert.equal(h.controller.ui.error.hidden, false);
    assert.equal(h.controller.ui.save(), false); h.controller.ui.close(); assert.equal(h.act('refuge:light'), false);
    assert.equal(recordBytes(h), raw); assert.equal(h.storage.writes, 0); assert.equal(h.controller.state.name, '');
    assert.equal(h.controller.snapshot().storageError, true);
  }
});

test('storage clear event purges cached photo/text while unrelated keys and other owners do not replace them', () => {
  const h = harness(), owner = h.controller.owner();
  h.controller.store.commit(owner, { name: 'Owner A', dedication: 'Private A', photoDataUrl: PNG }); h.controller.refreshOwner();
  const image = h.document.images.at(-1); image.onload(); assert.equal(h.controller.photoImage, image);
  const other = { profileId: 'other', gameId: owner.gameId }; h.controller.store.commit(other, { name: 'Other secret' });
  const draws = h.counters.draws; h.document.dispatchStorage('some-unrelated-key'); assert.equal(h.counters.draws, draws);
  h.document.dispatchStorage(refugePersonalStorageKeyV87(other)); assert.equal(h.controller.state.name, 'Owner A');
  h.storage.rows.clear(); h.document.dispatchStorage(null);
  assert.deepEqual(h.controller.state, createRefugePersonalStateV87()); assert.equal(h.controller.photoImage, null);
  assert.equal(h.controller.photoSource, null); assert.equal(h.controller.snapshot().hasPhoto, false); assert.equal(h.controller.error, '');
});

test('same profile with a new game identity loads neutral remembrance while preserving old owner bytes', () => {
  const h = harness(); h.controller.store.commit(h.controller.owner(), { name: 'Old game', photoDataUrl: PNG }); h.controller.refreshOwner();
  const oldOwner = h.controller.owner(), before = recordBytes(h); h.controller.close(); h.saveSystem.data.createdAt++;
  h.controller.refreshOwner(); assert.equal(h.controller.state.name, ''); assert.equal(h.controller.photoImage, null); assert.equal(recordBytes(h), null);
  assert.equal(h.storage.getItem(refugePersonalStorageKeyV87(oldOwner)), before);
});

test('late portrait image callbacks after close cannot restore an old image, draw or expose an old error', () => {
  const h = harness(); h.controller.store.commit(h.controller.owner(), { photoDataUrl: PNG }); h.controller.refreshOwner();
  const pendingImage = h.document.images.at(-1), draws = h.counters.draws; h.controller.close(); pendingImage.onload(); pendingImage.onerror();
  assert.equal(h.controller.photoImage, null); assert.equal(h.controller.error, ''); assert.equal(h.counters.draws, draws);
  assert.equal(h.controller.snapshot().hasPhoto, false);
});

test('failed photo decoding reports an error without deleting saved private data', () => {
  const h = harness(); h.controller.store.commit(h.controller.owner(), { photoDataUrl: PNG }); h.controller.refreshOwner();
  const before = recordBytes(h); h.document.images.at(-1).onerror();
  assert.equal(h.controller.photoImage, null); assert.match(h.controller.error, /ne peut pas être affichée.*conservé/);
  assert.equal(recordBytes(h), before); assert.equal(h.controller.snapshot().storageError, true);
});

test('profile lifecycle close cancels pending photo work, purges private DOM and cannot write or resume a new owner', async t => {
  const h = harness(), work = deferred(); let closes = 0;
  const originals = ['document', 'createImageBitmap'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  Object.defineProperty(globalThis, 'document', { value: h.document, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'createImageBitmap', { value: () => work.promise, configurable: true, writable: true });
  t.after(() => { for (const [key, descriptor] of originals) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; } });
  const oldOwner = h.controller.owner(); h.controller.store.commit(oldOwner, { name: 'SENTINEL_NAME', dedication: 'SENTINEL_DEDICATION', photoDataUrl: PNG });
  h.act('refuge:portrait'); const importing = h.controller.ui.importPhoto({ type: 'image/png', size: 100 });
  h.controller.close(); h.saveSystem.profile = 'new-profile'; h.hub.running = true;
  work.resolve({ width: 200, height: 100, close() { closes++; } }); assert.equal(await importing, false);
  assert.equal(closes, 1); assert.equal(h.counters.resumes, 0); assert.equal(h.controller.ui.isOpen, false); assert.equal(h.controller.ui.draftPhoto, null);
  assert.doesNotMatch(domText(h.controller.ui.dialog), /SENTINEL_|data:image\//); assert.equal(recordBytes(h), null);
  assert.equal(h.controller.store.load(oldOwner).state.name, 'SENTINEL_NAME'); assert.equal(h.controller.snapshot().hasPhoto, false);
});

test('public snapshot remains metadata-only before and after lifecycle cleanup; game export has no remembrance', () => {
  const h = harness(); h.controller.store.commit(h.controller.owner(), { name: 'SENTINEL_NAME', dedication: 'SENTINEL_DEDICATION', photoDataUrl: PNG });
  h.controller.refreshOwner(); const snapshot = h.hub.getRefugeSnapshotV87();
  assert.deepEqual(Object.keys(snapshot).sort(), ['active', 'contemplating', 'greetingRemaining', 'hasPhoto', 'modal', 'personalRevision', 'storageError'].sort());
  assert.equal(snapshot.hasPhoto, true); assert.doesNotMatch(JSON.stringify(snapshot), /SENTINEL_|data:image|photoDataUrl|dedication/);
  assert.doesNotMatch(JSON.stringify(h.saveSystem.data), /SENTINEL_|data:image|photoDataUrl|dedication/);
  h.controller.close(); assert.equal(h.controller.snapshot().hasPhoto, false); assert.equal(h.controller.snapshot().personalRevision, 0);
  assert.equal(h.controller.snapshot().storageError, false); assert.equal(h.controller.ownerStamp, null); assert.equal(h.controller.modalOwner, null);
});

test('controller has no upload, raw HTML, direct game mutation or clock-based personal lifecycle', () => {
  const source = readFileSync(new URL('../src/refuge-controller-v87.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|innerHTML|outerHTML|insertAdjacentHTML|Date\.now\(|saveSystem\.data\s*=/);
});
