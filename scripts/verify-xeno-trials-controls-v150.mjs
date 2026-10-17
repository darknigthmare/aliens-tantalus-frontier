import test from 'node:test';
import assert from 'node:assert/strict';
import { createXenoTrialsMatchV96 as create, stepXenoTrialsMatchV96 as step,
  nextXenoTrialsRoundV96 as next, setXenoTrialsPausedV96 as pause, XENO_TRIALS_STEP_V96 as DT
} from '../src/xeno-trials-engine-v96.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';

// Production engine/controller; deterministic browser API substitutes. These
// boundary fixtures are not a human playthrough or a claim about new artwork.
const WARDEN = 'import-game-afe2-warden';
const ACTIONS = ['left', 'right', 'jump', 'guard', 'light', 'heavy', 'special', 'super'];
function host(options = {}) {
  function target(extra = {}) {
    const listeners = new Map();
    return Object.assign({
      addEventListener(t, f) { if (!listeners.has(t)) listeners.set(t, new Set()); listeners.get(t).add(f); },
      removeEventListener(t, f) { listeners.get(t)?.delete(f); },
      emit(t, event = {}) {
        const e = { preventDefault() { this.prevented = true; }, stopPropagation() {}, ...event };
        for (const f of [...(listeners.get(t) || [])]) f(e);
        return e;
      }
    }, extra);
  }
  const win = target(), doc = target({ hidden: false, hasFocus: () => true });
  const ctx = new Proxy({ measureText: s => ({ width: String(s).length * 8 }),
    createLinearGradient: () => ({ addColorStop() {} }) }, { get: (o, k) => o[k] ?? (() => {}) });
  const canvas = target({ tagName: 'CANVAS', width: 1000, height: 560, setAttribute() {},
    getContext: () => ctx, focus() { doc.activeElement = this; }, closest: () => null });
  const root = target({ contains: b => b?.control === true });
  const queue = new Map(); let serial = 0, time = 0;
  const runtime = createXenoTrialsRuntimeV96({ canvas, window: win, document: doc, controlsRoot: root,
    config: { playerId: WARDEN, opponentId: 'warrior', seed: 149, roundSeconds: 99 },
    loadImage: async () => ({ naturalWidth: 1024, naturalHeight: 1024 }),
    requestAnimationFrame: f => { queue.set(++serial, f); return serial; },
    cancelAnimationFrame: n => queue.delete(n), ...options });
  function frame(n = 1) {
    for (let i = 0; i < n; i++) { time += 1000 / 120; const pending = [...queue.values()]; queue.clear(); pending.forEach(f => f(time)); }
  }
  return { runtime, win, doc, root, canvas, queue, frame,
    key(code, extra = {}, type = 'keydown') { return win.emit(type, { target: canvas, code, ...extra }); },
    async start() { assert.equal(await runtime.start(), true); for (let i = 0; i < 1200 && runtime.getState().presentation.blocksSimulation; i++) frame(); frame(); },
    button(action) { return { control: true, tagName: 'BUTTON', getAttribute: () => action,
      closest() { return this; }, captures: new Set(),
      setPointerCapture(id) { this.captures.add(id); }, releasePointerCapture(id) { this.captures.delete(id); } }; }
  };
}

for (const side of [0, 1]) for (const action of ACTIONS) {
  test(`round transition preserves release gate for ${action} on side ${side}`, () => {
    const m = create({ playerId: WARDEN, opponentId: WARDEN, introSeconds: 0,
      holdRoundTransition: true, roundsToWin: 3, seed: 149 });
    // Set only the clock to its boundary: the production timeout resolves the round.
    m.timeRemaining = DT;
    const a = side === 0 ? { [action]: true } : {}, b = side === 1 ? { [action]: true } : {};
    step(m, DT, a, b); assert.equal(m.phase, 'round-over');
    step(m, DT, a, b); assert.equal(m.fighters[side].rearmControls[action], true);
    assert.equal(next(m), true); assert.equal(m.round, 2);
    step(m, DT, a, b);
    const f = m.fighters[side];
    assert.equal(f.previousInput[action], false, 'Holding a presentation/intermission control is not a new press.');
    assert.equal(f.attack, null); assert.equal(f.guard, false); assert.equal(f.y, 0);
    step(m, DT, {}, {}); step(m, DT, a, b);
    assert.equal(f.previousInput[action], true, 'Physical release followed by a new press rearms normally.');
  });
}
test('pausing cannot clear an existing timer-lock release gate', () => {
  const m = create({ playerId: WARDEN, introSeconds: 0, rulesV119: { specialLockSeconds: 20 } });
  step(m, DT, { special: true }, {});
  assert.equal(m.fighters[0].rearmControls.special, true);
  assert.equal(m.fighters[0].previousInput.special, false);
  pause(m, true); pause(m, true);
  assert.equal(m.fighters[0].rearmControls.special, true);
  pause(m, false); m.timeRemaining = m.config.roundSeconds - 21;
  step(m, DT, { special: true }, {}); assert.equal(m.fighters[0].stats.specials, 0);
  step(m, DT, {}, {}); step(m, DT, { special: true }, {}); assert.equal(m.fighters[0].stats.specials, 1);
});
test('direct nextRound retains the end-of-round controls even before an intermission tick', () => {
  const m = create({ playerId: WARDEN, introSeconds: 0, holdRoundTransition: true });
  m.timeRemaining = DT; step(m, DT, { heavy: true }, {});
  assert.equal(m.phase, 'round-over'); assert.equal(next(m), true);
  step(m, DT, { heavy: true }, {}); assert.equal(m.fighters[0].attack, null);
});
test('release during the intermission does not leave a false blocked control', () => {
  const m = create({ playerId: WARDEN, introSeconds: 0, holdRoundTransition: true });
  m.timeRemaining = DT; step(m, DT, { light: true }, {}); step(m, DT, {}, {}); next(m);
  step(m, DT, { light: true }, {}); assert.equal(m.fighters[0].attack.kind, 'light');
});

for (const modifier of ['ctrlKey', 'metaKey', 'altKey']) for (const code of ['KeyL', 'KeyI', 'KeyP']) {
  test(`${modifier}+${code} remains a browser/OS shortcut, not combat input`, async () => {
    const h = host(); await h.start();
    const e = h.key(code, { [modifier]: true }); h.frame();
    const s = h.runtime.getState();
    assert.equal(e.prevented, undefined); assert.equal(s.paused, false);
    assert.equal(s.fighters[0].previousInput.special, false); assert.equal(s.fighters[0].previousInput.super, false);
    h.runtime.stop();
  });
}
test('modifier shortcuts still release an already held movement control', async () => {
  const h = host(); await h.start(); h.key('KeyD'); h.frame();
  assert.equal(h.runtime.getState().fighters[0].previousInput.right, true);
  h.key('KeyD', { ctrlKey: true }, 'keyup'); h.frame();
  assert.equal(h.runtime.getState().fighters[0].previousInput.right, false); h.runtime.stop();
});
for (const button of [1, 2]) test(`mouse button ${button} cannot activate a touch combat control`, async () => {
  const h = host(); await h.start(); const control = h.button('special');
  h.root.emit('pointerdown', { target: control, pointerId: 4, button, pointerType: 'mouse' }); h.frame();
  assert.equal(h.runtime.getState().fighters[0].stats.specials, 0); assert.equal(control.captures.size, 0); h.runtime.stop();
});
test('main mouse contact and secondary touch contacts remain valid independent inputs', async () => {
  const h = host(); await h.start(); const control = h.button('guard');
  h.root.emit('pointerdown', { target: control, pointerId: 1, button: 0, pointerType: 'mouse', isPrimary: true });
  h.root.emit('pointerdown', { target: control, pointerId: 2, button: 0, pointerType: 'touch', isPrimary: false }); h.frame();
  assert.equal(h.runtime.getState().fighters[0].guard, true);
  h.root.emit('pointerup', { pointerId: 1 }); h.frame(); assert.equal(h.runtime.getState().fighters[0].guard, true);
  h.root.emit('pointerup', { pointerId: 2 }); h.frame(); assert.equal(h.runtime.getState().fighters[0].guard, false); h.runtime.stop();
});
for (const order of [['Space', 'Enter'], ['Enter', 'Space']]) test(`same button owns independent keyboard holds ${order.join('/')}`, async () => {
  const h = host(); await h.start(); const control = h.button('guard');
  for (const code of order) h.root.emit('keydown', { target: control, code }); h.frame();
  h.root.emit('keyup', { target: control, code: order[0] }); h.frame();
  assert.equal(h.runtime.getState().fighters[0].guard, true);
  h.root.emit('keyup', { target: control, code: order[1] }); h.frame();
  assert.equal(h.runtime.getState().fighters[0].guard, false); h.runtime.stop();
});
test('a keyboard button release after focus has changed releases its original action', async () => {
  const h = host(); await h.start(); const guard = h.button('guard'), heavy = h.button('heavy');
  h.root.emit('keydown', { target: guard, code: 'Space' }); h.frame();
  h.root.emit('keyup', { target: heavy, code: 'Space' }); h.frame();
  assert.equal(h.runtime.getState().fighters[0].guard, false);
  assert.equal(h.runtime.getState().fighters[0].attack, null); h.runtime.stop();
});
test('focusout from buttons does not release the separate public setInput source', async () => {
  const h = host(); await h.start(); h.runtime.setInput('guard', true); h.frame();
  h.root.emit('focusout'); h.frame(); assert.equal(h.runtime.getState().fighters[0].guard, true);
  h.runtime.setInput('guard', false); h.frame(); assert.equal(h.runtime.getState().fighters[0].guard, false); h.runtime.stop();
});
test('resume invoked by an onState callback cannot schedule two loops', async () => {
  let h, armed = false, notified = false;
  h = host({ onState: () => { if (armed && !notified) { notified = true; h.runtime.resume(); } } });
  await h.start(); armed = true; h.frame(20);
  assert.equal(notified, true); assert.equal(h.queue.size, 1);
  h.frame(10); assert.equal(h.queue.size, 1); h.runtime.stop(); assert.equal(h.queue.size, 0);
});
test('concurrent start calls share one loading operation and one animation loop', async () => {
  const h = host(); const ready = await Promise.all([h.runtime.start(), h.runtime.start()]);
  assert.deepEqual(ready, [true, true]); assert.equal(h.queue.size, 1); h.runtime.stop();
});

test('release notification during presentation changes only edge flags, never simulation or resources', async () => {
  const { releaseXenoTrialsControlsV150: release } = await import('../src/xeno-trials-engine-v96.js');
  assert.equal(typeof release, 'function');
  const m = create({ playerId: WARDEN, introSeconds: 2 });
  for (const f of m.fighters) { f.rearmControls.light = true; f.previousInput.light = true; }
  const before = JSON.parse(JSON.stringify(m));
  assert.equal(release(m, 'player', {}), true);
  before.fighters[0].rearmControls.light = false; before.fighters[0].previousInput.light = false;
  assert.deepEqual(m, before); assert.equal(m.fighters[1].rearmControls.light, true);
  const unchanged = JSON.stringify(m);
  assert.equal(release(m, 'foreign', {}), false); assert.equal(JSON.stringify(m), unchanged);
});
test('release notification respects another source still holding the same action', async () => {
  const { releaseXenoTrialsControlsV150: release } = await import('../src/xeno-trials-engine-v96.js');
  const m = create({ playerId: WARDEN, introSeconds: 2 }); m.fighters[0].rearmControls.special = true;
  m.fighters[0].previousInput.special = true;
  release(m, 'player', { special: true }); assert.equal(m.fighters[0].rearmControls.special, true);
  release(m, 'player', {}); assert.equal(m.fighters[0].rearmControls.special, false);
});
test('release notification leaves a terminal result and its frozen inputs unchanged', async () => {
  const { releaseXenoTrialsControlsV150: release } = await import('../src/xeno-trials-engine-v96.js');
  const m = create({ playerId: WARDEN, introSeconds: 0, roundsToWin: 1 });
  m.fighters[1].hp = 1; m.timeRemaining = DT; step(m, DT, {}, {});
  assert.equal(m.phase, 'match-over'); const before = JSON.stringify(m);
  assert.equal(release(m, 'player', {}), false); assert.equal(JSON.stringify(m), before);
});
test('pause clears keyboard-button holds without retaining an orphaned virtual action', async () => {
  const h = host(); await h.start(); const control = h.button('guard');
  h.root.emit('keydown', { target: control, code: 'Enter' }); h.frame();
  h.runtime.pause(); assert.equal(h.queue.size, 0); h.runtime.resume(); h.frame(2);
  assert.equal(h.runtime.getState().fighters[0].guard, false); h.runtime.stop();
});
test('modified Enter on a combat button is not consumed or converted into an attack', async () => {
  const h = host(); await h.start(); const control = h.button('special');
  const e = h.root.emit('keydown', { target: control, code: 'Enter', altKey: true }); h.frame();
  assert.equal(e.prevented, undefined); assert.equal(h.runtime.getState().fighters[0].stats.specials, 0); h.runtime.stop();
});
test('all roster identities retain legal fresh light input after a held intermission is released', async () => {
  const { XENO_TRIALS_FIGHTERS_V96: roster } = await import('../src/xeno-trials-data-v96.js');
  assert.equal(roster.length, 189);
  for (const fighter of roster) {
    const m = create({ playerId: fighter.id, introSeconds: 0, holdRoundTransition: true });
    m.timeRemaining = DT; step(m, DT, { light: true }, {}); next(m);
    step(m, DT, { light: true }, {}); assert.equal(m.fighters[0].attack, null, fighter.id);
    step(m, DT, {}, {}); step(m, DT, { light: true }, {});
    assert.equal(m.fighters[0].attack?.kind, 'light', fighter.id);
  }
});

test('V150 tracker matches the unchanged roster and preserves the upstream feedback and declares review scope', async () => {
  const { readFileSync } = await import('node:fs'); const { createHash } = await import('node:crypto');
  const { spawnSync } = await import('node:child_process');
  const { XENO_TRIALS_FIGHTERS_V96: roster } = await import('../src/xeno-trials-data-v96.js');
  const root = new URL('../docs/forge/xeno-trials/', import.meta.url);
  const p = JSON.parse(readFileSync(new URL('progress-v150.json', root)));
  assert.equal(p.phase, 'engine-tested-review'); assert.equal(p.behaviorTests, 44); assert.equal(p.documentTests, 1);
  assert.equal(p.testNames.length, 44); assert.equal(p.changes.length, 8);
  assert.deepEqual(p.rosterIds, roster.map(f => f.id)); assert.equal(p.newSupers, 0); assert.equal(p.newCharacterAnimationClips, 0); assert.equal(p.approved1to1, 0);
  assert.equal(createHash('sha256').update(readFileSync(new URL('XENO_TRIALS_SUIVI_V149.xlsx', root))).digest('hex'), p.preservedPublishedV149.workbookSha256);
  const file = new URL(p.workbook, root);
  assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'), p.workbookSha256);
  const code = `import sys,zipfile,xml.etree.ElementTree as E
z=zipfile.ZipFile(sys.argv[1]);ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
w=E.fromstring(z.read('xl/workbook.xml'));assert len(w.find('s:sheets',ns))==7
r=E.fromstring(z.read('xl/worksheets/sheet1.xml'));cs={c.attrib['r']:c for c in r.findall('.//s:c',ns)}
assert [float(cs['E'+str(i)].find('s:v',ns).text) for i in range(7,14)]==[189,8,44,5,5,0,0]
for name in z.namelist():
 if name.startswith('xl/worksheets/sheet') and name.endswith('.xml'):
  assert not any(c.attrib.get('t')=='e' for c in E.fromstring(z.read(name)).findall('.//s:c',ns))
print('Workbook verified: seven sheets, seven correct cached counters, zero formula errors')`;
  const r = spawnSync('python3', ['-c', code, decodeURIComponent(file.pathname)], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr || r.stdout);
  const { isPublicDistributionPathV86: allowed } = await import('./verify-public-release-v86.mjs');
  for (const name of [p.workbook, 'progress-v150.json', 'V150-CONTROLS.md']) {
    assert.equal(allowed(`docs/forge/xeno-trials/${name}`), true);
    assert.equal(allowed(`docs/forge/xeno-trials/${name}`, { built: true }), false);
  }
  assert.equal(allowed('docs/forge/xeno-trials/unreviewed-v150.xlsx'), false);
});
