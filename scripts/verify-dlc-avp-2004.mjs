import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

// Executes the shipped bundle's simulation and host-exit functions.
// DOM, storage availability and navigation are explicit unit doubles;
// this suite does not claim browser, host-engine or complete-campaign coverage.
const bundlePath = resolve(process.argv[2] || 'src/dlc/avp-2004/index.html');
const bytes = readFileSync(bundlePath);
const html = bytes.toString('utf8');
const scripts = [...html.matchAll(/<script>\n([\s\S]*?)\n<\/script>/g)].map(match => match[1]);
const results = [];
function test(name, run) {
  try { run(); results.push({ name, ok: true }); }
  catch (error) { results.push({ name, ok: false, error: error.message }); }
}
const plain = value => JSON.parse(JSON.stringify(value));
test('All 30 inline scripts compile without remote dependencies', () => {
  assert.equal(scripts.length, 30);
  assert.equal(/<script[^>]+src\s*=/.test(html), false);
  assert.equal(/<link[^>]+rel=["']stylesheet["'][^>]+href\s*=/.test(html), false);
  scripts.forEach((code, i) => new vm.Script(code, { filename: 'avp-inline-' + i + '.js' }));
});
const sim = vm.createContext({});
for (let i = 0; i <= 16; i++) vm.runInContext(scripts[i], sim, { timeout: 1000 });
const D = sim.AVP_DATA;
const C = sim.AVP_CORE;
test('Shipped identity remains AVP 0.11 and its dedicated storage namespace', () => {
  assert.equal(D.version, '0.11.0');
  assert.equal(D.saveKey, 'atf.dlc.avp2004.v1');
  assert.equal(C.fresh().schema, 10);
});
test('Content counts preserve the recovered campaign rather than announcing v0.12', () => {
  assert.equal(D.rooms.length, 44);
  assert.equal(D.rooms.filter(room => !room.sceneOnly).length, 43);
  assert.equal(D.chapters.length, 19);
  assert.equal(D.operations.length, 17);
  assert.equal(D.codex.length, 188);
  assert.equal(D.fidelityAudit.length, 250);
  assert.equal(Object.keys(sim.AVP_ASSETS).length, 145);
});
test('Only two existing scene props receive self-contained PNG overrides', () => {
  const rasters = plain(sim.AVP_RASTER_ASSETS);
  assert.deepEqual(Object.keys(rasters).sort(), ['film-snowcat', 'whalebone']);
  for (const [id, asset] of Object.entries(rasters)) {
    assert.match(sim.AVP_ASSETS[id], /^<svg /, 'An SVG fallback remains available for ' + id);
    assert.match(asset.src, /^data:image\/png;base64,[A-Za-z0-9+/]+=*$/);
    const png = Buffer.from(asset.src.slice('data:image/png;base64,'.length), 'base64');
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16), asset.width);
    assert.equal(png.readUInt32BE(20), asset.height);
    assert.equal(png[25], 6, 'RGBA source transparency');
    assert.ok(asset.frame.every(Number.isInteger));
    const [x, y, w, h] = asset.frame;
    assert.ok(x >= 0 && y >= 0 && w > 0 && h > 0 && x + w <= asset.width && y + h <= asset.height);
    const [px, py] = asset.pivot;
    assert.ok(px >= x && px <= x + w && py >= y && py <= y + h);
    assert.ok(asset.fit.every(value => Number.isFinite(value) && value > 0));
  }
  const vehicle = D.filmProps.filter(prop => prop.asset === 'film-snowcat');
  assert.equal(vehicle.length, 1);
  assert.equal(vehicle[0].room, 'landing');
  assert.ok(D.rooms.find(room => room.id === 'station').props.some(prop => prop.asset === 'whalebone'));
  assert.equal(rasters['film-newborn'], undefined, 'The epilogue keeps its own creature artwork.');
});
test('All 104 door faces have reciprocal destinations', () => {
  const rooms = new Map(D.rooms.map(room => [room.id, room]));
  let faces = 0;
  for (const room of D.rooms) for (const door of room.doors) {
    const destination = rooms.get(door.to);
    assert.ok(destination && !destination.sceneOnly, 'Missing navigable destination: ' + door.id);
    const reverse = destination.doors.find(candidate => candidate.id === door.pair);
    assert.ok(reverse, 'Missing reciprocal face: ' + door.id);
    assert.equal(reverse.to, room.id);
    assert.equal(reverse.pair, door.id);
    faces++;
  }
  assert.equal(faces, 104);
});
test('All 43 navigable rooms are topologically reachable; epilogue is separate', () => {
  const rooms = new Map(D.rooms.map(room => [room.id, room]));
  const seen = new Set(['maru']);
  const queue = ['maru'];
  while (queue.length) for (const door of rooms.get(queue.shift()).doors) {
    if (!seen.has(door.to)) { seen.add(door.to); queue.push(door.to); }
  }
  assert.equal(seen.size, 43);
  assert.equal(seen.has('vessel'), false);
});
for (const mode of ['hybrid', 'classic']) for (const difficulty of ['expedition', 'survival']) {
  test('Actual simulation movement survives serialization: ' + mode + '/' + difficulty, () => {
    const game = new C.Game({ mode, difficulty });
    const initialX = game.s.player.x;
    for (let i = 0; i < 20; i++) game.tick(0.05, { dx: 1 });
    const before = JSON.parse(game.serialize());
    assert.ok(before.worldTime > 0 && before.player.x > initialX);
    const after = JSON.parse(new C.Game({ state: game.serialize() }).serialize());
    for (const key of ['room', 'chapter', 'player', 'inventory', 'mode', 'difficulty', 'worldTime', 'flags'])
      assert.deepEqual(after[key], before[key], key);
  });
}
test('Native Tantalus saves, unknown schemas and cinematic-room states are refused', () => {
  assert.throws(() => C.hydrate({ schema: 52, profile: 1 }));
  const saved = JSON.parse(new C.Game().serialize());
  assert.throws(() => C.hydrate({ ...saved, schema: 11 }));
  assert.throws(() => C.hydrate({ ...saved, dlc: 'another-campaign' }));
  assert.throws(() => C.hydrate({ ...saved, room: 'vessel' }));
});
const app = scripts.at(-1);
const modeExpression = /const hosted=([^\n]+);\n/.exec(app)?.[1];
test('Host mode uses only three exact installation paths plus legacy explicit host query', () => {
  assert.ok(modeExpression);
  const isHosted = (pathname, search = '') => vm.runInNewContext(modeExpression, { URLSearchParams, location: { pathname, search } });
  for (const path of ['/src/dlc/avp-2004/index.html', '/src/dlc/avp-2004/index', '/src/dlc/avp-2004/'])
    assert.equal(isHosted(path), true, path);
  for (const path of ['/AVP_2004_JOUER.html', '/src/dlc/avp-2004-copy/index.html', '/src/dlc/avp-2004/index.html/extra'])
    assert.equal(isHosted(path), false, path);
  assert.equal(isHosted('/legacy/index.html', '?host=tantalus'), true);
  assert.equal(isHosted('/legacy/index.html', '?host=other'), false);
});
test('Relative host-return URL resolves to the same-origin root', () => {
  assert.ok(html.includes('id="host-return"'));
  assert.equal(new URL('../../../', 'https://tantalus.example/src/dlc/avp-2004/index.html').href, 'https://tantalus.example/');
  assert.equal(new URL('../../../', 'https://tantalus.example/src/dlc/avp-2004/index').href, 'https://tantalus.example/');
});
const begin = app.indexOf('function returnToHost(){');
const end = app.indexOf("function pause(reason=''){", begin);
assert.ok(begin >= 0 && end > begin, 'Missing host return implementation');
const exitSource = app.slice(begin, end);
const lifecycleSource = /window\.addEventListener\('pagehide',[\s\S]*?(?=window\.addEventListener\('storage')/.exec(app)?.[0];
assert.ok(lifecycleSource, 'Missing page lifecycle implementation');
function fixture(overrides = {}) {
  const calls = { saves: 0, inputsCleared: 0, suspended: 0, exports: 0, pauses: 0, navigation: [], panel: null };
  const nodes = new Map([['host-return', { href: 'https://tantalus.example/' }]]);
  const events = {};
  const scope = {
    hosted: true, playing: true, paused: false, leavingHost: false, storageConflict: false,
    game: { dead: false },
    save: () => { calls.saves++; return true; },
    clearInputs: () => { calls.inputsCleared++; },
    audio: { ctx: { suspend: () => { calls.suspended++; return Promise.resolve(); } } },
    location: { assign: value => calls.navigation.push(value) },
    $: id => { if (!nodes.has(id)) nodes.set(id, {}); return nodes.get(id); },
    openPanel: (...args) => { calls.panel = args; },
    exportSave: () => { calls.exports++; },
    pause: () => { calls.pauses++; },
    window: { addEventListener: (type, handler) => { events[type] = handler; } },
    ...overrides
  };
  const context = vm.createContext(scope);
  vm.runInContext(exitSource + lifecycleSource, context, { timeout: 1000 });
  return { scope: context, calls, nodes, events, exit: () => vm.runInContext('returnToHost()', context, { timeout: 1000 }) };
}
test('Successful host exit saves once, pauses inputs/audio and navigates locally', () => {
  const f = fixture(); f.exit();
  assert.equal(f.calls.saves, 1);
  assert.equal(f.scope.paused, true);
  assert.equal(f.scope.leavingHost, true);
  assert.equal(f.calls.inputsCleared, 1);
  assert.equal(f.calls.suspended, 1);
  assert.deepEqual(f.calls.navigation, ['https://tantalus.example/']);
  f.events.pagehide();
  assert.equal(f.calls.saves, 1, 'Navigation must not produce a second save after input cleanup.');
});
test('Standalone host action is inert', () => {
  const f = fixture({ hosted: false }); f.exit();
  assert.equal(f.calls.saves, 0);
  assert.deepEqual(f.calls.navigation, []);
});
test('Leaving a failed expedition retains its last playable checkpoint', () => {
  const f = fixture({ game: { dead: true } }); f.exit();
  assert.equal(f.calls.saves, 0);
  assert.equal(f.calls.navigation.length, 1);
});
test('Quota failure offers export and stay before an explicit unsaved exit', () => {
  const f = fixture({ save: () => false }); f.exit();
  assert.equal(f.calls.navigation.length, 0);
  assert.equal(f.calls.panel[2], 'confirm');
  f.nodes.get('host-export').onclick();
  assert.equal(f.calls.exports, 1);
  f.nodes.get('host-stay').onclick();
  assert.equal(f.calls.pauses, 1);
  f.nodes.get('host-leave').onclick();
  assert.equal(f.calls.navigation.length, 1);
  assert.equal(f.scope.leavingHost, true);
});
test('Concurrent notebook conflict offers export without claiming a successful save', () => {
  const f = fixture({ storageConflict: true, save: () => false }); f.exit();
  assert.equal(f.calls.navigation.length, 0);
  assert.ok(f.calls.panel[1].includes('autre fenêtre'));
  assert.equal(typeof f.nodes.get('host-export').onclick, 'function');
});
test('Ordinary pagehide retains autosave; browser cache restoration retains pause access', () => {
  const f = fixture(); f.events.pagehide();
  assert.equal(f.calls.saves, 1);
  f.exit(); f.events.pageshow({ persisted: true });
  assert.equal(f.scope.leavingHost, false);
  assert.equal(f.calls.pauses, 1);
});
test('Both title and pause use the same save-aware host return', () => {
  assert.ok(app.includes("$('pause-host-return').onclick=returnToHost"));
  assert.ok(app.includes("$('host-return').onclick=e=>{e.preventDefault();returnToHost();}"));
});
const report = {
  suite: 'avp-host-bundle-contract', source: bundlePath,
  sha256: createHash('sha256').update(bytes).digest('hex'),
  method: 'Node VM: actual bundled simulation; host exit with explicit DOM/navigation/storage doubles. Not browser or full native-host verification.',
  passed: results.filter(result => result.ok).length,
  failed: results.filter(result => !result.ok).length,
  results
};
console.log(JSON.stringify(report, null, 2));
if (report.failed) process.exitCode = 1;
