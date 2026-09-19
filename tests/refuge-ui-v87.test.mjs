import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { RefugeUiV87, prepareRefugePhotoV87, REFUGE_PHOTO_INPUT_LIMIT_V87 } from '../src/refuge-ui-v87.js';
import { RefugePersonalStoreV87, createRefugePersonalStateV87, REFUGE_PERSONAL_MAX_PHOTO_BYTES_V87 } from '../src/refuge-personal-state-v87.js';

const JPEG = 'data:image/jpeg;base64,/9j/4AAEAAD/2Q==';
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6kQAAAABJRU5ErkJggg==';
const file = (extra = {}) => ({ type: 'image/png', size: 100, name: 'portrait.png', ...extra });
const state = (extra = {}) => ({ ...createRefugePersonalStateV87(), ...extra });
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };

// This DOM double checks modal interaction/privacy, not native layout, focus trapping or real image decoding.
function documentDouble() {
  const document = { activeElement: null, canvases: [], canvasResult: JPEG, draws: [] };
  class Element {
    constructor(tag) {
      this.tagName = tag.toUpperCase(); this.children = []; this.dataset = {}; this.attributes = new Map(); this.events = new Map();
      this.open = false; this.hidden = false; this.disabled = false; this.isConnected = true; this.textContent = ''; this.value = '';
    }
    set innerHTML(value) { throw new Error(`Unsafe HTML assignment: ${value}`); }
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
    click() { if (!this.disabled) this.fire('click'); }
    focus() { document.activeElement = this; }
    showModal() { this.open = true; }
    close() { this.open = false; this.fire('close'); }
    getContext(kind) {
      assert.equal(kind, '2d');
      return { fillStyle: '', fillRect: (...args) => document.draws.push(['fillRect', ...args]),
        drawImage: (...args) => document.draws.push(['drawImage', ...args]) };
    }
    toDataURL(...args) { document.draws.push(['toDataURL', ...args]); return document.canvasResult; }
  }
  document.createElement = tag => { const node = new Element(tag); if (tag === 'canvas') document.canvases.push(node); return node; };
  document.body = new Element('body'); return document;
}

function harness(options = {}) {
  const document = documentDouble(), saves = []; let closes = 0;
  const ui = new RefugeUiV87({ documentRef: document, onSave: patch => { saves.push(patch); return { ok: true }; },
    onClose: () => { closes++; }, ...options });
  return { ui, document, saves, get closes() { return closes; } };
}

function photoHarness(width = 1000, height = 500, extra = {}) {
  let closes = 0, decodes = 0; const calls = [], bitmap = { width, height, close: () => { closes++; } };
  const context = { fillStyle: null, fillRect: (...args) => calls.push(['fillRect', ...args]), drawImage: (...args) => calls.push(['drawImage', ...args]) };
  const canvas = { width: 0, height: 0, getContext: kind => { assert.equal(kind, '2d'); return context; },
    toDataURL: (...args) => { calls.push(['toDataURL', ...args]); return JPEG; } };
  return { bitmap, canvas, context, calls, get closes() { return closes; }, get decodes() { return decodes; },
    options: { createBitmap: async value => { decodes++; calls.push(['decode', value]); return bitmap; }, createCanvas: () => canvas, ...extra } };
}

function installLocalImageEnvironment(t, document, createBitmap) {
  const originals = ['document', 'createImageBitmap'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  Object.defineProperty(globalThis, 'document', { value: document, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'createImageBitmap', { value: createBitmap, configurable: true, writable: true });
  t.after(() => { for (const [key, descriptor] of originals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
  } });
}
function privateDomValues(node) {
  return [node.textContent, node.value, ...node.attributes.values(), ...node.children.flatMap(privateDomValues)].filter(value => typeof value === 'string').join('\n');
}

test('photo preparation accepts only declared PNG/JPEG/WebP files with bounded positive integer size', async () => {
  const h = photoHarness();
  for (const value of [null, file({ type: 'image/svg+xml' }), file({ type: 'text/html' }), file({ type: 'image/gif' }),
    file({ type: 'image/jpg' }), file({ size: 0 }), file({ size: -1 }), file({ size: 1.5 }), file({ size: NaN }),
    file({ size: '100' }), file({ size: REFUGE_PHOTO_INPUT_LIMIT_V87 + 1 })]) {
    await assert.rejects(prepareRefugePhotoV87(value, h.options), /PNG, JPEG ou WebP.*8 Mo/);
  }
  assert.equal(h.decodes, 0);
  for (const type of ['image/png', 'image/jpeg', 'image/webp']) {
    assert.equal(await prepareRefugePhotoV87(file({ type, size: REFUGE_PHOTO_INPUT_LIMIT_V87 }), h.options), JPEG);
  }
  assert.equal(h.decodes, 3); assert.equal(REFUGE_PHOTO_INPUT_LIMIT_V87, 8 * 1024 * 1024);
});

test('photo is locally re-encoded to JPEG 0.88, background filled first, source metadata never copied', async () => {
  const h = photoHarness(1200, 800), input = file({ exif: 'GPS private', arrayBuffer: () => { throw new Error('No raw forwarding'); } });
  assert.equal(await prepareRefugePhotoV87(input, h.options), JPEG);
  assert.equal(h.canvas.width, 384); assert.equal(h.canvas.height, 256);
  assert.equal(h.context.fillStyle, '#171919');
  assert.deepEqual(h.calls, [['decode', input], ['fillRect', 0, 0, 384, 256], ['drawImage', h.bitmap, 0, 0, 384, 256], ['toDataURL', 'image/jpeg', .88]]);
  assert.equal(h.closes, 1);
});

for (const [width, height, expectedWidth, expectedHeight] of [
  [800, 1200, 256, 384], [64, 32, 64, 32], [1, 8192, 1, 384], [8192, 1, 384, 1], [6000, 4000, 384, 256]
]) test(`dimensions ${width}×${height} remain within exact side/pixel bounds and preserve aspect without upscaling`, async () => {
  const h = photoHarness(width, height); await prepareRefugePhotoV87(file(), h.options);
  assert.equal(h.canvas.width, expectedWidth); assert.equal(h.canvas.height, expectedHeight); assert.equal(h.closes, 1);
});

test('oversized or malformed decoded dimensions are rejected and their bitmap is always closed', async () => {
  for (const [width, height] of [[8193, 1], [1, 8193], [6001, 4000], [0, 100], [100, 0], [-1, 100], [2.5, 4], [NaN, 4], [4, Infinity]]) {
    const h = photoHarness(width, height);
    await assert.rejects(prepareRefugePhotoV87(file(), h.options), /24 mégapixels.*8192/);
    assert.equal(h.closes, 1); assert.equal(h.calls.some(call => call[0] === 'drawImage'), false);
  }
});

test('missing decoder, failed decoding and invalid bitmap are explicit failures', async () => {
  await assert.rejects(prepareRefugePhotoV87(file(), { createBitmap: null }), /traitement local/);
  for (const name of ['InvalidStateError', 'EncodingError']) {
    await assert.rejects(prepareRefugePhotoV87(file(), { createBitmap: async () => { throw Object.assign(new Error('decode'), { name }); } }), /Fichier image illisible.*précédent est conservé/);
  }
  await assert.rejects(prepareRefugePhotoV87(file(), { createBitmap: async () => null }));
});

test('all canvas/context/drawing/encoding failures release the decoded bitmap', async () => {
  for (const stage of ['canvas', 'context', 'draw', 'encoding', 'result-type', 'result-mime', 'result-size']) {
    const h = photoHarness();
    if (stage === 'canvas') h.options.createCanvas = () => { throw new Error('canvas failed'); };
    if (stage === 'context') h.canvas.getContext = () => null;
    if (stage === 'draw') h.context.drawImage = () => { throw new Error('draw failed'); };
    if (stage === 'encoding') h.canvas.toDataURL = () => { throw Object.assign(new Error('encode'), { name: 'EncodingError' }); };
    if (stage === 'result-type') h.canvas.toDataURL = () => null;
    if (stage === 'result-mime') h.canvas.toDataURL = () => PNG;
    if (stage === 'result-size') h.canvas.toDataURL = () => 'data:image/jpeg;base64,' + 'A'.repeat(800000);
    await assert.rejects(prepareRefugePhotoV87(file(), h.options), undefined, stage); assert.equal(h.closes, 1, stage);
  }
});

test('a normalized JPEG cannot be declared ready when it exceeds the private-store byte limit', async () => {
  const h = photoHarness(), bytes = Buffer.alloc(REFUGE_PERSONAL_MAX_PHOTO_BYTES_V87 + 1);
  bytes[0] = 255; bytes[1] = 216; bytes[bytes.length - 2] = 255; bytes[bytes.length - 1] = 217;
  h.canvas.toDataURL = () => 'data:image/jpeg;base64,' + bytes.toString('base64');
  await assert.rejects(prepareRefugePhotoV87(file(), h.options)); assert.equal(h.closes, 1);
});

test('JPEG output validation rejects malformed base64 and MIME spoofing before the UI previews it', async () => {
  for (const result of ['data:image/jpeg;base64,', 'data:image/jpeg;base64,%%%=',
    'data:image/jpeg;base64,AAAA', PNG.replace('image/png', 'image/jpeg'), JPEG + '\n']) {
    const h = photoHarness(); h.canvas.toDataURL = () => result;
    await assert.rejects(prepareRefugePhotoV87(file(), h.options)); assert.equal(h.closes, 1);
  }
  const h = photoHarness(), bytes = Buffer.alloc(REFUGE_PERSONAL_MAX_PHOTO_BYTES_V87);
  bytes[0] = 255; bytes[1] = 216; bytes[bytes.length - 2] = 255; bytes[bytes.length - 1] = 217;
  h.canvas.toDataURL = () => 'data:image/jpeg;base64,' + bytes.toString('base64');
  assert.equal(await prepareRefugePhotoV87(file(), h.options), h.canvas.toDataURL()); assert.equal(h.closes, 1);
});

test('modal controls expose labels, local-only notice and accessible status without unsafe HTML', () => {
  const { ui, document } = harness(); assert.equal(ui.dialog.tagName, 'DIALOG'); assert.equal(document.body.children[0], ui.dialog);
  assert.equal(ui.dialog.getAttribute('aria-labelledby'), ui.heading.id); assert.equal(ui.dialog.getAttribute('aria-describedby'), ui.description.id);
  assert.equal(ui.error.getAttribute('role'), 'alert'); assert.equal(ui.photoStatus.getAttribute('role'), 'status');
  assert.equal(ui.name.maxLength, 80); assert.equal(ui.dedication.maxLength, 2000); assert.equal(ui.file.accept, 'image/png,image/jpeg,image/webp');
  assert.match(privateDomValues(ui.dialog), /Aucun envoi sur Internet/); assert.match(privateDomValues(ui.dialog), /pas inclus dans l.export/);
});

test('portrait draft remains local until explicit save and emits only the three editable fields', () => {
  const h = harness(), { ui } = h; const original = Object.freeze(state({ name: 'Avant', dedication: 'Mémoire', photoDataUrl: PNG, lightOn: true }));
  assert.equal(ui.open({ state: original }), true); assert.equal(ui.form.hidden, false); assert.equal(ui.reading.hidden, true);
  ui.name.value = 'Après'; ui.dedication.value = 'Nouvelle dédicace'; ui.removeButton.click();
  assert.equal(ui.draftPhoto, null); assert.equal(ui.preview.getAttribute('src'), null); assert.equal(h.saves.length, 0);
  assert.equal(original.name, 'Avant'); assert.equal(original.photoDataUrl, PNG);
  assert.equal(ui.save(), true); assert.deepEqual(h.saves, [{ name: 'Après', dedication: 'Nouvelle dédicace', photoDataUrl: null }]);
  assert.equal(h.closes, 1); assert.equal(ui.isOpen, false);
});

test('terminal mode renders literal text and cannot save or accidentally persist its displayed state', () => {
  const h = harness(), { ui } = h; const text = '<img src=x onerror=alert(1)>', dedication = '<script>alert(1)</script> & <b>souvenir</b>';
  ui.open({ mode: 'terminal', state: state({ name: text, dedication }) });
  assert.equal(ui.form.hidden, true); assert.equal(ui.reading.hidden, false); assert.equal(ui.readName.textContent, text); assert.equal(ui.readText.textContent, dedication);
  assert.equal(ui.save(), false); assert.equal(h.saves.length, 0); ui.close();
  ui.open({ mode: 'portrait', state: state({ name: text, dedication }) });
  assert.equal(ui.name.value, text); assert.equal(ui.dedication.value, dedication);
  ui.showError(text); assert.equal(ui.error.textContent, text); ui.close();
});

test('keyboard typing is stopped at the dialog without canceling text defaults; submit is prevented', () => {
  const h = harness(), { ui, document } = h, previous = document.createElement('button'); previous.focus();
  ui.open({ state: state() }); assert.equal(document.activeElement, ui.name);
  for (const type of ['keydown', 'keyup']) {
    const event = ui.dialog.fire(type, { key: 'd' }); assert.equal(event.stopped, true); assert.equal(event.prevented, false);
  }
  ui.name.value = 'Nom'; const submitted = ui.form.fire('submit'); assert.equal(submitted.prevented, true);
  assert.equal(h.saves.length, 1); assert.equal(document.activeElement, previous);
});

test('escape, native close and explicit close notify once and restore focus only when requested', () => {
  const h = harness(), { ui, document } = h, previous = document.createElement('button'); previous.focus(); ui.open({ state: state() });
  const cancel = ui.dialog.fire('cancel'); assert.equal(cancel.prevented, true); assert.equal(cancel.stopped, true);
  assert.equal(ui.isOpen, false); assert.equal(h.closes, 1); assert.equal(document.activeElement, previous); ui.close(); assert.equal(h.closes, 1);
  ui.open({ state: state() }); ui.dialog.close(); assert.equal(h.closes, 2); assert.equal(ui.isOpen, false);
  ui.open({ state: state() }); const active = document.activeElement; ui.close({ notify: false, restoreFocus: false });
  assert.equal(h.closes, 2); assert.equal(document.activeElement, active);
});

test('read-only error blocks form mutations/import/save and focuses the return control', async () => {
  const h = harness(), { ui, document } = h; ui.open({ state: state({ name: 'Ancien', photoDataUrl: PNG }), error: 'Données futures : lecture bloquée.' });
  assert.equal(document.activeElement, ui.closeButton); assert.equal(ui.name.disabled, true); assert.equal(ui.dedication.disabled, true);
  assert.equal(ui.file.disabled, true); assert.equal(ui.removeButton.disabled, true); assert.equal(ui.saveButton.disabled, true);
  ui.removeButton.click(); assert.equal(ui.draftPhoto, PNG); assert.equal(await ui.importPhoto(file()), false);
  assert.equal(ui.save(), false); assert.equal(h.saves.length, 0); ui.close();
});

test('quota refusal preserves persisted data and the user draft remains editable instead of being falsely acknowledged', () => {
  const rows = new Map(); let full = false; const storage = { getItem: key => rows.get(key) ?? null,
    setItem: (key, value) => { if (full) throw Object.assign(new Error('Quota'), { name: 'QuotaExceededError' }); rows.set(key, value); }, removeItem: key => rows.delete(key) };
  const personal = new RefugePersonalStoreV87({ storage }), owner = { profileId: 'qa', gameId: 'one' };
  const before = personal.commit(owner, { name: 'Avant', dedication: 'Conservée', photoDataUrl: PNG }).state;
  const h = harness({ onSave: patch => personal.commit(owner, patch) }); h.ui.open({ state: before });
  h.ui.name.value = 'Après'; h.ui.dedication.value = 'Brouillon privé'; h.ui.draftPhoto = JPEG; h.ui.refreshPhoto(); full = true;
  assert.equal(h.ui.save(), false); assert.equal(h.ui.isOpen, true); assert.equal(h.ui.error.hidden, false);
  assert.equal(h.ui.name.value, 'Après'); assert.equal(h.ui.dedication.value, 'Brouillon privé'); assert.equal(h.ui.draftPhoto, JPEG);
  assert.equal(h.closes, 0); assert.deepEqual(personal.load(owner).state, before); full = false;
  assert.equal(h.ui.save(), true); assert.equal(personal.load(owner).state.name, 'Après');
});

test('unexpected save callback exception is surfaced locally while preserving draft and modal', () => {
  const h = harness({ onSave: () => { throw new Error('Stockage inaccessible'); } }); h.ui.open({ state: state() }); h.ui.dedication.value = 'À conserver';
  assert.doesNotThrow(() => assert.equal(h.ui.save(), false)); assert.equal(h.ui.isOpen, true);
  assert.equal(h.ui.dedication.value, 'À conserver'); assert.equal(h.ui.error.hidden, false); assert.equal(h.closes, 0); h.ui.close();
});

test('successful asynchronous decode modifies only the current draft and locks duplicate saves/imports until complete', async t => {
  const h = harness(), pending = deferred(); let calls = 0, closed = 0;
  installLocalImageEnvironment(t, h.document, () => { calls++; return pending.promise; });
  h.ui.open({ state: state({ photoDataUrl: PNG }) }); h.ui.file.value = 'C:\\fakepath\\portrait.png';
  const importing = h.ui.importPhoto(file()); assert.equal(h.ui.pending, true); assert.equal(h.ui.saveButton.disabled, true);
  assert.equal(h.ui.file.disabled, true); assert.equal(h.ui.removeButton.disabled, true); assert.equal(h.ui.closeButton.disabled, false);
  assert.equal(h.ui.save(), false); assert.equal(await h.ui.importPhoto(file()), false); assert.equal(calls, 1);
  pending.resolve({ width: 768, height: 384, close: () => { closed++; } }); assert.equal(await importing, true);
  assert.equal(closed, 1); assert.equal(h.ui.pending, false); assert.equal(h.ui.file.value, ''); assert.equal(h.ui.draftPhoto, JPEG);
  assert.equal(h.ui.preview.src, JPEG); assert.equal(h.ui.saveButton.disabled, false); assert.equal(h.saves.length, 0);
  assert.equal(h.document.canvases[0].width, 384); assert.equal(h.document.canvases[0].height, 192); h.ui.close();
});

test('file input change uses local decode and malformed images retain the previous draft', async t => {
  const h = harness(); installLocalImageEnvironment(t, h.document, async () => { throw Object.assign(new Error('decode'), { name: 'InvalidStateError' }); });
  h.ui.open({ state: state({ photoDataUrl: PNG }) }); h.ui.file.files = [file()]; h.ui.file.value = 'C:\\fakepath\\bad.png';
  h.ui.file.fire('change'); await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.ui.pending, false); assert.equal(h.ui.draftPhoto, PNG); assert.equal(h.ui.preview.src, PNG); assert.equal(h.ui.file.value, '');
  assert.match(h.ui.error.textContent, /Fichier image illisible.*précédent est conservé/); assert.equal(h.saves.length, 0); h.ui.close();
});

test('closed imports and canceled file selection perform no decode or local mutation', async t => {
  const h = harness(); let calls = 0; installLocalImageEnvironment(t, h.document, async () => { calls++; throw new Error('Not expected'); });
  assert.equal(await h.ui.importPhoto(file()), false); h.ui.open({ state: state({ photoDataUrl: PNG }) });
  assert.equal(await h.ui.importPhoto(undefined), false); h.ui.file.files = []; h.ui.file.fire('change');
  assert.equal(calls, 0); assert.equal(h.ui.draftPhoto, PNG); assert.equal(h.ui.error.hidden, true); assert.equal(h.saves.length, 0); h.ui.close();
});

test('cancel while decode is pending purges private DOM and late success cannot restore the photo', async t => {
  const h = harness(), pending = deferred(); let closed = 0; installLocalImageEnvironment(t, h.document, () => pending.promise);
  h.ui.open({ state: state({ name: 'Privé', dedication: 'Dédicace secrète', photoDataUrl: PNG }) }); const importing = h.ui.importPhoto(file());
  h.ui.dialog.fire('cancel'); assert.equal(h.ui.isOpen, false); assert.equal(h.ui.pending, false); assert.equal(h.ui.draftPhoto, null);
  assert.equal(h.ui.preview.getAttribute('src'), null); assert.equal(h.ui.name.value, ''); assert.equal(h.ui.dedication.value, '');
  pending.resolve({ width: 512, height: 512, close: () => { closed++; } }); assert.equal(await importing, false);
  assert.equal(closed, 1); assert.equal(h.ui.preview.getAttribute('src'), null); assert.equal(h.ui.draftPhoto, null); assert.equal(h.saves.length, 0);
});

test('old decode completion cannot clear a newer session pending flag or replace its draft', async t => {
  const h = harness(), first = deferred(), second = deferred(); let count = 0;
  installLocalImageEnvironment(t, h.document, () => ++count === 1 ? first.promise : second.promise);
  h.ui.open({ state: state({ name: 'Premier' }) }); const oldImport = h.ui.importPhoto(file()); h.ui.close({ notify: false });
  h.ui.open({ state: state({ name: 'Deuxième', photoDataUrl: PNG }) }); const newImport = h.ui.importPhoto(file());
  first.resolve({ width: 200, height: 200, close() {} }); assert.equal(await oldImport, false);
  assert.equal(h.ui.pending, true); assert.equal(h.ui.name.value, 'Deuxième'); assert.equal(h.ui.draftPhoto, PNG);
  second.resolve({ width: 200, height: 200, close() {} }); assert.equal(await newImport, true);
  assert.equal(h.ui.pending, false); assert.equal(h.ui.draftPhoto, JPEG); h.ui.close();
});

test('old failed decode cannot expose an error in a reopened terminal session', async t => {
  const h = harness(), pending = deferred(); installLocalImageEnvironment(t, h.document, () => pending.promise);
  h.ui.open({ state: state() }); const importing = h.ui.importPhoto(file()); h.ui.close();
  h.ui.open({ mode: 'terminal', state: state({ dedication: 'Nouveau propriétaire' }) });
  pending.reject(new Error('Ancienne erreur privée')); assert.equal(await importing, false);
  assert.equal(h.ui.mode, 'terminal'); assert.equal(h.ui.error.hidden, true); assert.equal(h.ui.readText.textContent, 'Nouveau propriétaire'); h.ui.close();
});

test('close purges all personal text, photo references and error excerpts from the closed DOM', () => {
  const h = harness(), secret = 'SENTINEL_DEDICACE_PRIVEE';
  h.ui.open({ state: state({ name: 'SENTINEL_NOM_PRIVE', dedication: secret, photoDataUrl: PNG }) });
  h.ui.showError('Erreur concernant ' + secret); h.ui.close();
  assert.doesNotMatch(privateDomValues(h.ui.dialog), /SENTINEL_|data:image\//);
  assert.equal(h.ui.draftPhoto, null); assert.equal(h.ui.previousFocus, null); assert.equal(h.ui.file.value, '');
});

test('native modal opening failure must purge the private draft and never leave a hidden photo in DOM', () => {
  const h = harness(); h.ui.dialog.showModal = () => { throw new Error('Dialog unavailable'); };
  assert.equal(h.ui.open({ state: state({ name: 'SENTINEL_NOM_PRIVE', dedication: 'SENTINEL_DEDICACE', photoDataUrl: PNG }) }), false);
  assert.equal(h.ui.isOpen, false); assert.equal(h.ui.draftPhoto, null);
  assert.doesNotMatch(privateDomValues(h.ui.dialog), /SENTINEL_|data:image\//); assert.equal(h.closes, 0);
});

test('invalid mode or missing native dialog support cannot open or save', () => {
  const h = harness(); assert.equal(h.ui.open({ mode: 'unknown', state: state() }), false);
  assert.equal(h.ui.open({ state: null }), false); h.ui.dialog.showModal = undefined;
  assert.equal(h.ui.open({ state: state() }), false); assert.equal(h.ui.isOpen, false); assert.equal(h.ui.save(), false); assert.equal(h.saves.length, 0);
});

test('photo/UI module has no upload, object URL, raw HTML or game-save serialization path', () => {
  const source = readFileSync(new URL('../src/refuge-ui-v87.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|createObjectURL|innerHTML|outerHTML|insertAdjacentHTML|SaveSystem|localStorage/);
});
