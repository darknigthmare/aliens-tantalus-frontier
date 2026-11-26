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
  const compiled = compileManifest(options.manifest || manifest(rows));
  const registry = {
    sprite(kind, key, state = 'idle', room = null, time = 0) {
      const entry = compiled.resolve(kind, key, state, room, time);
      const cycle = compiled.cycle(kind, key, state, room);
      return entry ? { entry, image: { id: entry.id }, ...(cycle ? { cycle: cycle.id } : {}) } : null;
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

test('Walter left-hand injury cannot become a right-hand injury through reflection', () => {
  for (const sourceFacing of [1, -1]) {
    const row = asset({ id: 'walter-injured', key: 'walter-injured', sourceFacing,
      path: '/assets/openai/sprites/alien-covenant-v011/walter-injured.png' });
    for (const facing of [1, -1]) {
      const h = harness([row], { profile: { id: 'walter-injured' } });
      const person = freeze({ ...actor(), id: 'synthetic-return', facing });
      h.renderer.human(person, 'walter');
      const images = h.commands.filter(command => command[0] === 'drawImage');
      if (facing === sourceFacing) {
        assert.equal(images.length, 1);
        assert.equal(h.inherited.length, 0);
        assert.ok(h.commands.some(command => command[0] === 'scale' && command[1] === 1));
      } else {
        assert.equal(images.length, 0);
        assert.equal(h.inherited[0][0], 'human');
        assert.equal(h.renderer.spriteDrawsV011.human, 0);
      }
    }
  }
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


function walkingManifest(key = 'daniels-work', rooms = ['cryo', 'service', 'cabin', 'funeralairlock', 'evaprep', 'bridge', 'comms']) {
  const folder = key === 'daniels-work' ? 'v012' : 'v013';
  const frames = Array.from({ length: 8 }, (_, index) => {
    const id = key + '-walk-' + String(index + 1).padStart(2, '0');
    return asset({ id, key, state: 'walk', logicalHeight: key === 'daniels-eva' ? 139 : 122,
      path: '/assets/openai/sprites/alien-covenant-' + folder + '/' + id + '.png', rooms });
  });
  return { schemaVersion: 1, release: key === 'daniels-work' ? '0.12.0' : '0.13.0', verified1to1: false,
    assets: [asset(), ...frames], cycles: [{
      id: key + '-walk', kind: 'human', key, state: 'walk',
      angularFrequency: 11, frames: frames.map(frame => frame.id)
    }] };
}

test('explicit walk cycle keeps the legacy idle binding and selects supplied phases by simulation time', () => {
  const raw = walkingManifest(), compiled = compileManifest(raw), period = 2 * Math.PI / 11;
  assert.equal(compiled.resolve('human', 'daniels-work', 'idle', 'cryo').id, 'daniels-work');
  assert.equal(compiled.cycles.length, 1);
  assert.equal(compiled.entries.length, 9);
  for (let index = 0; index < 8; index++) {
    const time = period * (index + .25) / 8;
    const current = compiled.resolve('human', 'daniels-work', 'walk', 'cryo', time);
    assert.equal(current.id, raw.cycles[0].frames[index]);
    assert.equal(compiled.resolve('human', 'daniels-work', 'walk', 'cryo', time + period).id, current.id);
  }
  assert.equal(compiled.resolve('human', 'daniels-work', 'walk', 'landing', 0), null);
  assert.equal(compiled.resolve('human', 'daniels-work', 'run', 'cryo', 0), null);
  assert.equal(compiled.resolve('human', 'daniels-work', 'walk', 'cryo', NaN), null);
  assert.throws(() => { compiled.cycles[0].frames.pop(); }, TypeError);
});

test('missing, shared, incompatible and implicit cycle phases cannot replace an admitted set', () => {
  const variants = [
    raw => raw.assets.pop(),
    raw => raw.cycles[0].frames.pop(),
    raw => { raw.cycles[0].frames[1] = raw.cycles[0].frames[0]; },
    raw => { raw.cycles[0].angularFrequency = 12; },
    raw => { raw.assets[1].heldGrip = [30, 50]; },
    raw => { raw.assets[1].sourceFacing = -1; },
    raw => { raw.assets[1].rooms = ['landing']; },
    raw => { raw.assets[1].key = 'walter'; },
    raw => raw.assets.push(asset({ id: 'extra-walk', state: 'walk',
      path: '/assets/openai/sprites/alien-covenant-v012/extra-walk.png' })),
    raw => raw.cycles.push({ ...raw.cycles[0], id: 'another-cycle' })
  ];
  const registry = createRegistry({ manifest: manifest(), ImageClass: null });
  for (const change of variants) {
    const raw = walkingManifest(); change(raw);
    assert.throws(() => registry.useManifest(raw));
    assert.equal(registry.entries().length, 1);
    assert.equal(registry.entry('human', 'daniels-work').id, 'daniels-work');
  }
  const raw = walkingManifest(); delete raw.cycles;
  assert.throws(() => compileManifest(raw), /complete declared cycle/);
  assert.throws(() => compileManifest({ ...walkingManifest(), release: '0.11.0' }), /cycles/);
});

test('all eight frames must decode before any cycle frame can draw', () => {
  const created = [];
  class ImageDouble { constructor() { created.push(this); } }
  const registry = createRegistry({ manifest: walkingManifest(), ImageClass: ImageDouble });
  assert.equal(registry.sprite('human', 'daniels-work', 'walk', 'cryo', .1), null);
  assert.equal(created.length, 8);
  for (const image of created.slice(0, 7)) {
    image.naturalWidth = 140; image.naturalHeight = 240; image.onload();
  }
  assert.equal(registry.sprite('human', 'daniels-work', 'walk', 'cryo', .1), null);
  assert.equal(registry.inspect().cycles[0].ready, false);
  created[7].naturalWidth = 140; created[7].naturalHeight = 240; created[7].onload();
  const ready = registry.sprite('human', 'daniels-work', 'walk', 'cryo', .1);
  assert.equal(ready.cycle, 'daniels-work-walk');
  assert.equal(registry.inspect().cycles[0].ready, true);
  assert.equal(registry.sprite('human', 'daniels-work', 'walk', 'cryo', .1).image, ready.image);
  created[7].onerror();
  assert.equal(registry.sprite('human', 'daniels-work', 'walk', 'cryo', .1), null);
});

test('cycle rendering reads a frozen simulation clock and preserves the engine and source geometry', () => {
  const raw = walkingManifest(), h = harness([], {
    manifest: raw, motion: { moving: true }, state: { time: .2 }, engine: { paused: true }
  });
  const before = JSON.stringify(h.engine), person = freeze(actor());
  h.renderer.human(person, 'daniels', true);
  h.renderer.human(person, 'daniels', true);
  const calls = h.commands.filter(row => row[0] === 'drawImage');
  assert.equal(calls.length, 2);
  assert.equal(calls[0][1].id, calls[1][1].id, 'Paused redraws keep the same supplied frame');
  assert.deepEqual(calls[0].slice(2), [10, 20, 100, 200, -30.5, -122, 61, 122]);
  assert.equal(h.inherited.length, 0);
  assert.equal(JSON.stringify(h.engine), before);
  assert.equal(h.renderer.spriteFrameDrawsV012[calls[0][1].id], 2);
});

test('walk cycle cannot cover blocked input, sprinting, weapons or special interactions', () => {
  const variants = [
    { motion: { moving: false } },
    { motion: { moving: true, run: true } },
    { state: { weapon: true } },
    { room: { crawl: true } },
    { engine: { grip: {} } },
    { engine: { work: {} } },
    { engine: { scanning: {} } },
    { engine: { healing: 1 } },
    { engine: { rotating: {} } },
    { engine: { detector: true } },
    { engine: { reloadTime: 1 } },
    { engine: { shoveCooldown: 2 } },
    { motion: { moving: true, crouch: true } },
    { engine: { dead: true } }
  ];
  for (const options of variants) {
    const h = harness([], { ...options, manifest: walkingManifest(),
      motion: { moving: true, ...options.motion } });
    h.renderer.human(actor(), 'daniels', true);
    assert.equal(h.commands.filter(row => row[0] === 'drawImage').length, 0);
    assert.equal(h.inherited[0][0], 'human');
  }
  const airborne = harness([], { manifest: walkingManifest(), motion: { moving: true } });
  airborne.renderer.human({ ...actor(), y: 3 }, 'daniels', true);
  assert.equal(airborne.inherited[0][0], 'human');
});

test('a V012 prop binds to the reviewed instance and room, without replacing its whole family', () => {
  const row = propAsset('identification', {
    key: 'shaw-f10-identification', rooms: ['shaw'],
    path: '/assets/openai/sprites/alien-covenant-v012/prop-identification.png'
  });
  const raw = { schemaVersion: 1, release: '0.12.0', assets: [row] };
  const approved = harness([], { manifest: raw, room: { id: 'shaw' } });
  approved.renderer.prop({ id: 'shaw-f10-identification', kind: 'identification', x: 100, w: 70, h: 80 });
  assert.equal(approved.commands.filter(command => command[0] === 'drawImage').length, 1);
  const other = harness([], { manifest: raw, room: { id: 'shaw' } });
  other.renderer.prop({ id: 'another-identification', kind: 'identification', x: 100, w: 70, h: 80 });
  assert.equal(other.inherited[0][0], 'prop');
  const wrongRoom = harness([], { manifest: raw, room: { id: 'cryo' } });
  wrongRoom.renderer.prop({ id: 'shaw-f10-identification', kind: 'identification', x: 100, w: 70, h: 80 });
  assert.equal(wrongRoom.inherited[0][0], 'prop');
});

const newPlayerCycles = [
  { key: 'daniels', room: 'landing', height: 122 },
  { key: 'daniels-eva', room: 'sailaccess', height: 139 },
  { key: 'david-young', room: 'whiteroom', height: 122, safePresentation: true }
];

for (const profile of newPlayerCycles) {
  test(profile.key + ': all eight clock phases render in both directions without changing simulation', () => {
    const raw = walkingManifest(profile.key, [profile.room]);
    for (const facing of [-1, 1]) for (let index = 0; index < 8; index++) {
      const h = harness([], { manifest: raw, profile: { id: profile.key },
        room: { id: profile.room, safePresentation: !!profile.safePresentation },
        motion: { moving: true }, state: { time: (index + .25) / 8 * 2 * Math.PI / 11 },
        engine: { paused: true } });
      const person = freeze({ ...actor(), facing }), before = JSON.stringify(h.engine);
      h.renderer.human(person, 'daniels', true);
      const calls = h.commands.filter(row => row[0] === 'drawImage');
      assert.equal(calls.length, 1);
      assert.equal(calls[0][1].id, raw.cycles[0].frames[index]);
      assert.equal(calls[0][9], profile.height);
      assert.ok(h.commands.some(row => row[0] === 'scale' && row[1] === facing && row[2] === 1));
      assert.equal(h.inherited.length, 0);
      assert.equal(JSON.stringify(h.engine), before);
      assert.equal(person.facing, facing);
    }
  });

  test(profile.key + ': unsupported motion, actor roles and action states keep the native renderer', () => {
    const raw = walkingManifest(profile.key, [profile.room]);
    const variants = [
      { motion: { moving: false } }, { motion: { run: true } }, { motion: { crouch: true } },
      { room: { crawl: true } }, { engine: { grip: {} } }, { engine: { work: {} } },
      { engine: { scanning: {} } }, { engine: { healing: 1 } }, { engine: { rotating: {} } },
      { engine: { detector: true } }, { engine: { reloadTime: 1 } },
      { engine: { shoveCooldown: 2 } }, { engine: { dead: true } },
      { person: { y: 12 } }, { person: { id: 'npc-fixture', phase: 'walk' } }
    ];
    if (!profile.safePresentation) variants.push({ state: { weapon: true } });
    for (const change of variants) {
      const h = harness([], { manifest: raw, profile: { id: profile.key },
        room: { id: profile.room, safePresentation: !!profile.safePresentation, ...change.room },
        motion: { moving: true, ...change.motion }, state: change.state,
        engine: change.engine });
      h.renderer.human({ ...actor(), ...change.person }, 'daniels', true);
      assert.equal(h.commands.filter(row => row[0] === 'drawImage').length, 0);
      assert.equal(h.inherited[0][0], 'human');
    }
    if (profile.safePresentation) {
      const h = harness([], { manifest: raw, profile: { id: profile.key },
        room: { id: profile.room, safePresentation: true }, motion: { moving: true },
        state: { weapon: true }, engine: { currentWeapon() { throw Error('Tableau must not select a weapon'); } } });
      h.renderer.human(actor(), 'daniels', true);
      assert.equal(h.commands.filter(row => row[0] === 'drawImage').length, 1);
      assert.equal(h.inherited.length, 0);
    }
  });

  test(profile.key + ': one failed phase disables this cycle without disabling a ready costume', () => {
    const work = walkingManifest(), added = walkingManifest(profile.key, [profile.room]);
    const raw = { ...work, release: '0.13.0',
      assets: [...work.assets, ...added.assets.slice(1)], cycles: [...work.cycles, ...added.cycles] };
    const created = [];
    class ImageDouble { constructor() { created.push(this); } }
    const registry = createRegistry({ manifest: raw, ImageClass: ImageDouble });
    registry.sprite('human', 'daniels-work', 'walk', 'cryo', .1);
    for (const image of created) {
      image.naturalWidth = 140; image.naturalHeight = 240; image.onload();
    }
    assert.ok(registry.sprite('human', 'daniels-work', 'walk', 'cryo', .1));
    registry.sprite('human', profile.key, 'walk', profile.room, .1);
    assert.equal(created.length, 16);
    for (const image of created.slice(8, 15)) {
      image.naturalWidth = 140; image.naturalHeight = 240; image.onload();
    }
    created[15].onerror();
    for (let phase = 0; phase < 8; phase++) {
      assert.equal(registry.sprite('human', profile.key, 'walk', profile.room, phase / 8 * 2 * Math.PI / 11), null);
    }
    assert.ok(registry.sprite('human', 'daniels-work', 'walk', 'cryo', .1));
    assert.equal(registry.inspect().cycles.find(row => row.key === profile.key).ready, false);
    assert.equal(registry.inspect().cycles.find(row => row.key === 'daniels-work').ready, true);
  });
}

test('new costume cycles reject foreign rooms, unsupplied order and cross-version image substitution', () => {
  for (const profile of newPlayerCycles) {
    const otherRoom = profile.key === 'david-young' ? 'landing' : 'whiteroom';
    const variants = [
      raw => { raw.release = '0.12.0'; },
      raw => { for (const row of raw.assets.slice(1)) row.rooms = [otherRoom]; },
      raw => { for (const row of raw.assets.slice(1)) row.rooms = ['filterduct']; },
      raw => { for (const row of raw.assets.slice(1)) row.rooms = null; },
      raw => { for (const row of raw.assets.slice(1)) row.rooms = [profile.room, profile.room]; },
      raw => { for (const row of raw.assets.slice(1)) row.path = row.path.replace('v013', 'v012'); },
      raw => { raw.cycles[0].frames.reverse(); },
      raw => { delete raw.cycles; }
    ];
    for (const change of variants) {
      const raw = walkingManifest(profile.key, [profile.room]); change(raw);
      assert.throws(() => compileManifest(raw));
    }
  }
});

