import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { DLC_EXPEDITIONS, expeditionById, DlcMenu } from '../src/dlc-menu.js';
import { TitleScreenController } from '../src/title-screen-v61.js';

// Controllers use a declared DOM/RAF host; browser QA covers real navigation.
class NodeFixture extends EventTarget {
  constructor(tag, document) {
    super(); this.tagName = tag.toUpperCase(); this.ownerDocument = document;
    this.children = []; this.dataset = {}; this.attributes = {}; this.hidden = false;
    this.disabled = false; this.textContent = ''; this.open = false;
    this.classList = { add() {}, remove() {} };
  }
  append(...nodes) { for (const node of nodes) { node.parent = this; this.children.push(node); } }
  setAttribute(name, value) { this.attributes[name] = value; }
  focus() { this.ownerDocument.activeElement = this; }
  scrollIntoView() {}
  click() { if (!this.disabled) { const event = new Event('click'); event.detail = 1; this.dispatchEvent(event); } }
  showModal() { this.open = true; }
  close() { this.open = false; }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(node => node !== this); }
}
function documentFixture() {
  const document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  document.createElement = tag => new NodeFixture(tag, document);
  document.head = document.createElement('head'); document.body = document.createElement('body');
  document.documentElement = document.createElement('html'); return document;
}
const key = (code, extra = {}) => ({ code, preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {}, ...extra });
const pad = (pressed = []) => ({ index: 0, id: 'fixture-pad', mapping: 'standard', connected: true, axes: [0, 0],
  buttons: Array.from({ length: 16 }, (_, index) => ({ pressed: pressed.includes(index), value: pressed.includes(index) ? 1 : 0 })) });
function titleFixture(t, { dlc = true, recovery = null, handler = true } = {}) {
  const names = ['document', 'addEventListener', 'removeEventListener', 'requestAnimationFrame', 'cancelAnimationFrame'];
  const descriptors = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const target = new EventTarget(), frames = new Map(); let serial = 0;
  const document = documentFixture();
  Object.assign(globalThis, { document, addEventListener: target.addEventListener.bind(target), removeEventListener: target.removeEventListener.bind(target),
    requestAnimationFrame: callback => { frames.set(++serial, callback); return serial; }, cancelAnimationFrame: id => frames.delete(id) });
  const ids = ['title-start', 'title-menu', 'title-continue', 'title-new', 'title-forge', 'title-options',
    'title-profile-status', 'title-live-status', 'title-recovery-warning', 'title-resume-context-v89', ...(dlc ? ['title-dlc'] : [])];
  const nodes = new Map(ids.map(id => { const node = document.createElement('button'); node.id = id; return [id, node]; }));
  const root = document.createElement('section'); root.querySelector = selector => nodes.get(selector.slice(1)) || null;
  const save = { profile: 1, createdAt: 100, statistics: { playSeconds: 12 }, clock: { day: 2, hour: 8 }, scene: 'hub' };
  const original = JSON.stringify(save); let opens = 0, continues = 0;
  const title = new TitleScreenController({ root, app: document.createElement('main'), getSave: () => save,
    getRecoveryStatus: () => recovery, onDlc: handler ? () => { opens++; } : undefined, onContinue: () => { continues++; } });
  t.after(() => {
    title.dispose(); assert.equal(JSON.stringify(save), original, 'title navigation preserves the campaign');
    for (const [name, descriptor] of descriptors) descriptor ? Object.defineProperty(globalThis, name, descriptor) : delete globalThis[name];
  });
  title.show(); title.openMenu();
  return { title, document, nodes, get opens() { return opens; }, get continues() { return continues; } };
}

test('only installed AVP can be selected; unknown IDs never navigate', async () => {
  assert.equal(DLC_EXPEDITIONS.length, 1);
  assert.deepEqual(expeditionById('avp-2004'), { id: 'avp-2004', title: 'AVP · Sous la glace', version: '0.11.0', href: '/src/dlc/avp-2004/index.html' });
  assert.ok(Object.isFrozen(DLC_EXPEDITIONS) && Object.isFrozen(DLC_EXPEDITIONS[0]));
  const document = documentFixture(); let launched = 0;
  const menu = new DlcMenu({ documentRef: document, windowRef: {}, onLaunch: () => launched++ }); menu.open();
  for (const id of ['covenant', '../save', 'https://example.com', null]) assert.equal(await menu.launch(id), false);
  assert.equal(launched, 0); menu.destroy();
});
test('gallery keyboard navigation, close and reopen preserve one dialog', () => {
  const document = documentFixture(); let closed = 0;
  const menu = new DlcMenu({ documentRef: document, windowRef: {}, onLaunch() {}, onClose: () => closed++ });
  menu.open(); menu.open(); assert.equal(document.body.children.length, 1); assert.equal(document.activeElement, menu.playButton);
  menu.handleKeydown(key('Tab')); assert.equal(document.activeElement, menu.backButton);
  menu.handleKeydown(key('Tab')); assert.equal(document.activeElement, menu.playButton);
  menu.handleKeydown(key('End')); assert.equal(document.activeElement, menu.backButton);
  menu.handleKeydown(key('Home')); assert.equal(document.activeElement, menu.playButton);
  menu.handleKeydown(key('Escape')); assert.equal(closed, 1); assert.equal(menu.dialog.open, false);
  menu.open({ language: 'en' }); assert.equal(menu.heading.textContent, 'Expansions'); assert.equal(document.activeElement, menu.playButton);
  menu.destroy(); assert.equal(document.body.children.length, 0); assert.equal(document.head.children.length, 0);
});
test('launch is single-shot and failed navigation stays recoverable', async () => {
  const document = documentFixture(); let launches = 0, resolve;
  const menu = new DlcMenu({ documentRef: document, windowRef: {}, onLaunch: () => { launches++; return new Promise(done => { resolve = done; }); } });
  menu.open(); const pending = menu.launch('avp-2004');
  assert.equal(await menu.launch('avp-2004'), false); assert.equal(menu.close(), false);
  resolve(); assert.equal(await pending, true); assert.equal(launches, 1); menu.destroy();
  const failure = new DlcMenu({ documentRef: document, windowRef: {}, onLaunch: () => { throw new Error('fixture navigation failure'); } });
  failure.open(); assert.equal(await failure.launch('avp-2004'), false);
  assert.equal(failure.playButton.disabled, false); assert.equal(failure.backButton.disabled, false);
  assert.match(failure.status.textContent, /Réessayez/); assert.equal(failure.close(), true); failure.destroy();
});
test('gallery gamepad ignores held activation and stops polling on close', async () => {
  const document = documentFixture(), frames = new Map(); let serial = 0, launches = 0;
  const windowRef = { navigator: { getGamepads: () => [] }, requestAnimationFrame: callback => { frames.set(++serial, callback); return serial; }, cancelAnimationFrame: id => frames.delete(id) };
  const menu = new DlcMenu({ documentRef: document, windowRef, onLaunch: () => launches++ });
  menu.open(); menu.pollGamepads([pad([0])]); assert.equal(launches, 0);
  menu.pollGamepads([pad()]); menu.pollGamepads([pad([13])]); assert.equal(document.activeElement, menu.backButton);
  menu.pollGamepads([pad()]); menu.pollGamepads([pad([0])]); assert.equal(menu.isOpen, false); assert.equal(frames.size, 0); assert.equal(launches, 0);
  menu.open(); menu.pollGamepads([pad()]); menu.pollGamepads([pad([0])]); menu.pollGamepads([pad([0])]);
  await Promise.resolve(); assert.equal(launches, 1); menu.destroy(); assert.equal(frames.size, 0);
});
test('Extensions joins native keyboard navigation without triggering Continue', t => {
  const fixture = titleFixture(t);
  fixture.title.handleKeydown(key('ArrowDown')); fixture.title.handleKeydown(key('ArrowDown'));
  assert.equal(fixture.document.activeElement.id, 'title-dlc'); fixture.title.handleKeydown(key('Enter'));
  assert.equal(fixture.opens, 1); assert.equal(fixture.continues, 0);
  assert.equal(fixture.title.root.hidden, false, 'title stays visible during lazy loading');
  fixture.title.handleKeydown(key('ArrowDown')); assert.equal(fixture.document.activeElement.id, 'title-forge');
});
test('native gamepad selects Extensions once, even during save recovery', t => {
  const fixture = titleFixture(t, { recovery: { profile: 1 } }); fixture.title.pollGamepads([pad()]);
  assert.equal(fixture.document.activeElement.id, 'title-new');
  fixture.title.pollGamepads([pad([13])]); fixture.title.pollGamepads([pad()]); assert.equal(fixture.document.activeElement.id, 'title-dlc');
  fixture.title.pollGamepads([pad([0])]); fixture.title.pollGamepads([pad([0])]);
  assert.equal(fixture.opens, 1); assert.equal(fixture.continues, 0);
});
test('historical title fixtures retain their four menu buttons and handlers', t => {
  const fixture = titleFixture(t, { dlc: false });
  assert.deepEqual(fixture.title.menuButtons().map(button => button.id), ['title-continue', 'title-new', 'title-forge', 'title-options']);
  assert.equal(fixture.title.getSnapshot().dlcAvailable, false);
  fixture.title.handleKeydown(key('Enter')); assert.equal(fixture.continues, 1); assert.equal(fixture.opens, 0);
});
test('an absent optional extension handler is harmless', t => {
  const fixture = titleFixture(t, { handler: false });
  assert.equal(fixture.title.getSnapshot().dlcAvailable, false);
  fixture.title.openDlc(); assert.equal(fixture.opens, 0); assert.equal(fixture.title.state, 'menu');
});

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
function hostLaunchFixture(fail = false) {
  const body = read('src/app.js').match(/onLaunch: \(entry\) => \{([\s\S]*?)\n      \}\n    \}\);/)?.[1];
  assert.ok(body, 'production launch callback is present');
  const calls = [], context = { standaloneContext: null,
    hubEngine: { stop: commit => calls.push(['hub', commit]) }, engine: { stop: () => calls.push(['engine']) },
    bioforgeRuntimeV80: { stop: options => calls.push(['bioforge', options]) }, xenoTrialsUiV96: { close: () => calls.push(['trials']) },
    audio: { setScene: scene => calls.push(['audioScene', scene]), stopEffects: () => calls.push(['effects']), stopMusic: duration => calls.push(['music', duration]) },
    globalThis: { location: { assign: href => { calls.push(['navigate', href]); if (fail) throw new Error('navigation blocked'); } } } };
  return { launch: runInNewContext(`(entry) => {${body}\n}`, context), calls, context };
}
test('real host callback stops runtimes before navigating without committing a profile', () => {
  const { launch, calls, context } = hostLaunchFixture(); launch(expeditionById('avp-2004'));
  assert.equal(context.standaloneContext, 'dlc');
  assert.deepEqual(calls.map(call => call[0]), ['hub', 'engine', 'bioforge', 'trials', 'audioScene', 'effects', 'music', 'navigate']);
  assert.equal(calls[0][1], false, 'hub shutdown cannot save the native profile');
  assert.equal(calls[2][1].purge, false, 'laboratory population is preserved');
  assert.equal(calls.at(-1)[1], expeditionById('avp-2004').href);
});
test('failed host navigation restores its context and menu audio', () => {
  const { launch, calls, context } = hostLaunchFixture(true);
  assert.throws(() => launch(expeditionById('avp-2004')), /navigation blocked/);
  assert.equal(context.standaloneContext, null); assert.deepEqual(calls.at(-1), ['audioScene', 'menu']);
});
test('real unload handler skips native autosave when leaving for the expedition', () => {
  const body = read('src/app.js').match(/globalThis\.addEventListener\('beforeunload', \(\) => \{([\s\S]*?)\n  \}\);/)?.[1];
  assert.ok(body, 'production unload callback is present');
  const calls = [], context = { standaloneContext: 'dlc', disposePlayerAppearancePreviewV126: () => calls.push('preview'), audio: { dispose: () => calls.push('audio') } };
  Object.defineProperty(context, 'saveSystem', { get() { throw new Error('Native save must not be accessed.'); } });
  runInNewContext(`(() => {${body}\n})()`, context); assert.deepEqual(calls, ['preview', 'audio']);
});
