'use strict';
// Unit fixtures here replace Canvas, Image and the parent renderer.
// Gameplay and real PNG decoding are exercised separately by the historical
// pilots and browser QA; these tests make no claim about film likeness.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { compileManifest, createRegistry } = require('../dlc/covenant/sprite-registry-v011.js');
const rendererSource = fs.readFileSync(path.join(__dirname, '../dlc/covenant/sprite-art-v011.js'), 'utf8');

function asset(overrides = {}) {
  return {
    id: 'daniels-work', kind: 'human', key: 'daniels-work', state: 'idle',
    path: '/assets/openai/sprites/alien-covenant-v011/daniels-work.png',
    width: 140, height: 240, bytes: 100, sha256: 'a'.repeat(64),
    alphaBounds: [10, 20, 110, 220], alphaThreshold: 32,
    anchor: [60, 220], logicalHeight: 122, sourceFacing: 1,
    verified1to1: false, ...overrides
  };
}
function manifest(assets = [asset()]) {
  return { schemaVersion: 1, release: '0.11.0', verified1to1: false, assets };
}
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freeze(child);
  }
  return value;
}

test('manifest admits exact state and optional room only', () => {
  const compiled = compileManifest(manifest([asset({ rooms: ['cryo'] })]));
  assert.equal(compiled.resolve('human', 'daniels-work', 'idle', 'cryo').id, 'daniels-work');
  assert.equal(compiled.resolve('human', 'daniels-work', 'walk', 'cryo'), null);
  assert.equal(compiled.resolve('human', 'daniels-work', 'idle', 'cargo'), null);
  assert.equal(compiled.resolve('creature', 'daniels-work', 'idle', 'cryo'), null);
  assert.throws(() => { compiled.entries[0].anchor[0] = 12; }, TypeError);
});

test('unsafe path, duplicate identity/state and invalid geometry are rejected', () => {
  const invalid = [
    { path: 'https://example.invalid/daniels-work.png' },
    { path: '/assets/openai/sprites/alien-covenant-v011/../outside.png' },
    { id: '../outside' }, { key: '' }, { state: 'anything' },
    { width: 0 }, { height: 9000 }, { bytes: 0 }, { sha256: 'unverified' },
    { alphaBounds: [0, 0, 150, 240] }, { alphaBounds: [20, 20, 10, 220] },
    { anchor: [1, 220] }, { logicalHeight: NaN }, { sourceFacing: 0 },
    { verified1to1: true }, { rooms: ['../cargo'] }, { heldGrip: [1, Infinity] }
  ];
  for (const change of invalid) assert.throws(() => compileManifest(manifest([asset(change)])));
  assert.throws(() => compileManifest(manifest([asset(), asset()])), /identity/);
  assert.throws(() => compileManifest(manifest([
    asset(), asset({ id: 'other', path: '/assets/openai/sprites/alien-covenant-v011/other.png' })
  ])), /Duplicate visual state/);
});

test('failed manifest replacement leaves the last admitted set intact', () => {
  const registry = createRegistry({ manifest: manifest(), ImageClass: null });
  assert.throws(() => registry.useManifest(manifest([asset({ verified1to1: true })])));
  assert.equal(registry.entries().length, 1);
  assert.equal(registry.entry('human', 'daniels-work').id, 'daniels-work');
});

test('loading is lazy, exact decode dimensions are required, and images are reused', () => {
  const created = [];
  class ImageDouble {
    constructor() { created.push(this); }
  }
  const registry = createRegistry({ manifest: manifest(), ImageClass: ImageDouble });
  assert.equal(created.length, 0);
  assert.equal(registry.sprite('human', 'daniels-work', 'walk'), null);
  assert.equal(created.length, 0);
  assert.equal(registry.sprite('human', 'daniels-work'), null);
  assert.equal(created.length, 1);
  assert.equal(created[0].src, asset().path);
  created[0].naturalWidth = 140; created[0].naturalHeight = 240; created[0].onload();
  assert.equal(registry.sprite('human', 'daniels-work').image, created[0]);
  assert.equal(registry.sprite('human', 'daniels-work').image, created[0]);
  assert.equal(created.length, 1);
});

test('wrong image size or image failure remains a visible fallback signal', () => {
  const created = [];
  class ImageDouble { constructor() { created.push(this); } }
  const registry = createRegistry({ manifest: manifest(), ImageClass: ImageDouble });
  registry.sprite('human', 'daniels-work');
  created[0].naturalWidth = 141; created[0].naturalHeight = 240; created[0].onload();
  assert.equal(registry.sprite('human', 'daniels-work'), null);
  assert.equal(registry.inspect().images[0].status, 'invalid-size');
  registry.useManifest(manifest());
  registry.sprite('human', 'daniels-work');
  created[1].onerror();
  assert.equal(registry.sprite('human', 'daniels-work'), null);
  assert.equal(registry.inspect().images[0].status, 'unavailable');
});

test('network error resolves to zero sprites without replacing Canvas', async () => {
  const registry = createRegistry({ ImageClass: null, fetcher: async () => ({ ok: false }) });
  assert.equal(await registry.load(), 0);
  assert.equal(registry.inspect().status, 'unavailable');
  assert.equal(registry.sprite('human', 'daniels-work'), null);
});

test('concurrent manifest loads share one request and valid inline data avoids fetch', async () => {
  let requests = 0;
  const fetcher = async () => { requests++; return { ok: true, json: async () => manifest() }; };
  const registry = createRegistry({ ImageClass: null, fetcher });
  assert.deepEqual(await Promise.all([registry.load(), registry.load()]), [1, 1]);
  assert.equal(requests, 1);
  const inline = createRegistry({ manifest: manifest(), ImageClass: null, fetcher });
  assert.equal(await inline.load(), 1);
  assert.equal(requests, 1);
});

function harness(rows = [], options = {}) {
  const commands = [], inherited = [];
  const profile = { id: 'daniels-work', build: 1, gun: null, ...options.profile };
  const engine = {
    room: { id: 'cryo', exits: [], props: [], ...options.room },
    state: { weapon: false, hidden: false, sequence: null, ...options.state },
    motion: { moving: false, run: false, crouch: false, ...options.motion },
    appearance: () => profile, currentWeapon: () => ({ id: 'beretta' }),
    done: () => false, ...options.engine
  };
  const compiled = compileManifest(manifest(rows));
  const registry = {
    sprite(kind, key, state = 'idle', room = null) {
      const entry = compiled.resolve(kind, key, state, room);
      return entry ? { entry, image: { id: entry.id } } : null;
    }
  };
  const context2d = new Proxy({}, {
    get(_target, method) { return (...args) => commands.push([method, ...args]); },
    set() { return true; }
  });
  class Parent {
    constructor(canvas, E) { this.c = context2d; this.engine = E; this.W = 1440; }
    project(x) { return { x, y: 420, s: 1 }; }
    propPoint(o) { return this.project(o.x); }
    ellipse(...args) { commands.push(['ellipse', ...args]); }
    line(...args) { commands.push(['line', ...args]); }
    poly(...args) { commands.push(['poly', ...args]); }
    human(...args) { inherited.push(['human', ...args]); }
    creature(...args) { inherited.push(['creature', ...args]); }
    gun(...args) { inherited.push(['gun', ...args]); }
    prop(...args) { inherited.push(['prop', ...args]); }
  }
  const context = { CovenantRenderer: Parent, CovenantSpritesV011: registry };
  vm.runInNewContext(rendererSource, context, { filename: 'sprite-art-v011.js' });
  freeze(engine); freeze(profile);
  return { renderer: new context.CovenantRenderer({}, engine), engine, commands, inherited };
}
const actor = () => ({ x: 100, z: 0.5, y: 0, facing: 1, phase: 'idle' });
const creature = (phase = 'idle') => ({
  id: 'neo-test', kind: 'neomorph', x: 100, z: 0.5, y: 0,
  facing: 1, phase, alive: true, stun: 0
});
const creatureAsset = (state = 'idle') => asset({
  id: state === 'attack' ? 'neomorph-attack' : 'neomorph',
  path: '/assets/openai/sprites/alien-covenant-v011/' + (state === 'attack' ? 'neomorph-attack' : 'neomorph') + '.png',
  kind: 'creature', key: 'neomorph', state, logicalHeight: 176
});
const propAsset = (key, overrides = {}) => asset({
  id: 'prop-' + key, path: '/assets/openai/sprites/alien-covenant-v011/prop-' + key + '.png',
  kind: 'prop', key, logicalHeight: 100, ...overrides
});

test('neutral human uses meaningful alpha bounds and anchors feet at the ground', () => {
  const h = harness([asset()]);
  h.renderer.human(actor());
  const call = h.commands.find(row => row[0] === 'drawImage');
  assert.deepEqual(call.slice(2), [10, 20, 100, 200, -30.5, -122, 61, 122]);
  assert.equal(h.inherited.length, 0);
  assert.equal(h.renderer.spriteDrawsV011.human, 1);
});

test('facing reflection does not mutate actor or engine', () => {
  const h = harness([asset()]);
  const a = freeze({ ...actor(), facing: -1 });
  const before = JSON.stringify(h.engine);
  h.renderer.human(a);
  assert.ok(h.commands.some(row => row[0] === 'scale' && row[1] === -1 && row[2] === 1));
  assert.equal(JSON.stringify(h.engine), before);
  assert.equal(a.facing, -1);
});

test('moving and armed characters do not borrow a neutral free-hands pose', () => {
  const walking = harness([asset()]);
  walking.renderer.human(actor(), 'daniels', true);
  assert.equal(walking.inherited[0][0], 'human');
  const armed = harness([asset()], { state: { weapon: true } });
  armed.renderer.human(actor());
  assert.equal(armed.inherited[0][0], 'human');
  const noGrip = harness([asset({ state: 'armed' })], { state: { weapon: true } });
  noGrip.renderer.human(actor());
  assert.equal(noGrip.inherited[0][0], 'human');
});

test('crawl, airborne, hidden and death states retain original behavior', () => {
  for (const options of [{ room: { crawl: true } }, { engine: { dead: true } }, { engine: { scanning: true } }]) {
    const h = harness([asset()], options); h.renderer.human(actor());
    assert.equal(h.inherited[0][0], 'human');
  }
  const airborne = harness([asset()]); airborne.renderer.human({ ...actor(), y: 20 });
  assert.equal(airborne.inherited[0][0], 'human');
  const hidden = harness([asset()], { state: { hidden: true } }); hidden.renderer.human(actor());
  assert.equal(hidden.inherited.length, 0);
  assert.equal(hidden.commands.length, 0);
});

test('airborne attack image appears only during lunge; windup keeps native telegraph', () => {
  const h = harness([creatureAsset(), creatureAsset('attack')]);
  h.renderer.creature(creature('windup'));
  assert.equal(h.inherited[0][0], 'creature');
  assert.equal(h.commands.filter(row => row[0] === 'drawImage').length, 0);
  h.renderer.creature(creature('lunge'));
  assert.equal(h.commands.find(row => row[0] === 'drawImage')[1].id, 'neomorph-attack');
  assert.equal(h.renderer.spriteDrawsV011.creature, 1);
});

test('creature movement, death, stun and scripted sequence remain procedural', () => {
  for (const enemy of [
    creature('chase'), { ...creature(), alive: false }, { ...creature(), stun: 1 },
    creature('captured'), creature('retreated')
  ]) {
    const h = harness([creatureAsset()]); h.renderer.creature(freeze(enemy));
    assert.equal(h.inherited[0][0], 'creature');
    assert.equal(h.renderer.spriteDrawsV011.creature, 0);
  }
  const scripted = harness([creatureAsset()], { state: { sequence: { enemy: 'neo-test' } } });
  scripted.renderer.creature(creature());
  assert.equal(scripted.inherited[0][0], 'creature');
});

test('a real weapon footprint is fitted without stretching its aspect ratio', () => {
  const row = asset({ id: 'weapon-beretta', kind: 'weapon', key: 'beretta',
    path: '/assets/openai/sprites/alien-covenant-v011/weapon-beretta.png' });
  const h = harness([row]); h.renderer.gun('beretta');
  const call = h.commands.find(value => value[0] === 'drawImage');
  assert.equal(call[8] / call[9], 100 / 200);
  assert.equal(h.renderer.spriteDrawsV011.weapon, 1);
});

test('tabletop object keeps a support and live mechanisms remain native', () => {
  const h = harness([propAsset('flute'), propAsset('crane')]);
  h.renderer.prop({ id: 'flute-room', kind: 'flute', x: 100, w: 120, h: 100 });
  assert.ok(h.commands.some(row => row[0] === 'poly'));
  assert.ok(h.commands.some(row => row[0] === 'drawImage' && row[1].id === 'prop-flute'));
  h.renderer.prop({ id: 'crane-room', kind: 'crane', x: 100, w: 120, h: 100 });
  assert.equal(h.inherited.at(-1)[0], 'prop');
});

test('open cryopod cannot replace a closed colonist capsule in another room', () => {
  const image = propAsset('cryopod', { rooms: ['cryo'] });
  const h = harness([image], { room: { id: 'colonistvault' } });
  h.renderer.prop({ id: 'vault-pod', kind: 'cryopod', x: 100, w: 120, h: 100 });
  assert.equal(h.inherited[0][0], 'prop');
  assert.equal(h.renderer.spriteDrawsV011.prop, 0);
});

test('suppressed props and burning lander do not reappear through sprite overrides', () => {
  const h = harness([propAsset('lander')], { room: { exits: [{ id: 'door-a' }] } });
  h.renderer.prop({ id: 'lander-prop', kind: 'lander', x: 100, w: 120, h: 100, renderSuppressedByExit: 'door-a' });
  assert.equal(h.inherited.length, 0); assert.equal(h.commands.length, 0);
  const burning = harness([propAsset('lander')], { room: { id: 'burning' } });
  burning.renderer.prop({ id: 'lander-prop', kind: 'lander', x: 100, w: 120, h: 100 });
  assert.equal(burning.inherited[0][0], 'prop');
});

test('console PNGs cannot mask functional panels or navigation displays', () => {
  const h = harness([propAsset('console'), propAsset('navigationdisplay')]);
  for (const kind of ['console', 'navigationdisplay']) {
    h.renderer.prop({ id: kind + '-bridge', kind, x: 100, w: 120, h: 100 });
  }
  assert.equal(h.inherited.filter(row => row[0] === 'prop').length, 2);
  assert.equal(h.renderer.spriteDrawsV011.prop, 0);
});
