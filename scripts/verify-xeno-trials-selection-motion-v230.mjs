import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { XENO_TRIALS_FIGHTERS_V96 as roster } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_RESEARCH_FIGHTERS_V210 as research } from '../src/xeno-trials-research-v210.js';
import { getXenoTrialsPresentationPlateV230 } from '../src/xeno-trials-presentation-art-v230.js';
import { admitXenoTrialsSelectionPlateV230 as admit, createXenoTrialsSelectionMotionV230 as create,
  drawXenoTrialsSelectionVisualV230 as draw, getXenoTrialsSelectionSampleV230 as sample,
  getXenoTrialsSelectionVisualV230 as visual } from '../src/xeno-trials-selection-motion-v230.js';

const viewport = { width: 290, height: 180 };
const decoded = plate => ({ naturalWidth: plate.textureWidth, naturalHeight: plate.textureHeight });
const flush = () => new Promise(resolve => setImmediate(resolve));

function context() {
  const calls = [];
  return new Proxy({ calls, globalAlpha: 1 }, {
    get: (target, key) => target[key] ?? ((...argumentsList) => calls.push([key, ...argumentsList]))
  });
}

test('every selectable identity resolves its admitted art or actual atlas crop', () => {
  assert.equal(roster.length, 202);
  assert.equal(research.length, 15);
  for (const model of [...roster, ...research]) {
    for (const variant of model.variants.length ? model.variants : [null]) {
      const plate = visual(model.id, variant);
      assert.equal(plate?.profileId, model.profileId, model.id);
      assert.ok(existsSync(new URL('..' + plate.path, import.meta.url)), plate.path);
      const receipt = draw(context(), plate, decoded(plate), viewport, sample('select', 210));
      assert.equal(receipt?.id, model.id);
      assert.equal(receipt.variant, variant);
      assert.equal(receipt.canonExact, false);
      assert.equal(receipt.support[1], 166);
    }
  }
  assert.equal(visual('missing'), null);
});

test('articulated selection lifts the upper body while the original support point stays fixed', () => {
  const plate = visual('warrior');
  const context2d = context();
  const entrance = draw(context2d, plate, decoded(plate), viewport, sample('select', 110));
  const exit = draw(context2d, plate, decoded(plate), viewport, sample('exit', 110));
  assert.equal(entrance.mode, 'rig');
  assert.equal(exit.mode, 'rig');
  assert.deepEqual(entrance.support, exit.support);
  assert.ok(context2d.calls.some(([action]) => action === 'clip'));
  assert.notEqual(sample('select', 110).gesture, sample('exit', 110).gesture);
  assert.ok(sample('select', 110).slide < 0 && sample('exit', 110).slide > 0);
  assert.equal(sample('select', 0, true).opacity, 1);
  assert.equal(sample('exit', 0, true).opacity, 0);
});

test('an exact painted pose and each research crop describe the real read window', () => {
  const warrior = visual('warrior');
  const art = getXenoTrialsPresentationPlateV230('select', warrior.id, warrior.variant);
  const handDrawn = admit(warrior, art);
  assert.equal(handDrawn?.authoredPlate, true);
  assert.equal(admit(visual('runner'), art), null);
  assert.equal(admit(warrior, { ...art, variant: 'wrong' }), null);
  assert.equal(admit(warrior, { ...art, rootY: -1 }), null);
  assert.equal(draw(context(), handDrawn, decoded(handDrawn), viewport, sample('select', 150)).mode, 'drawn-plate');
  const researchCrop = visual('mire-v210-scorched');
  const ctx = context(), image = decoded(researchCrop);
  const entrance = draw(ctx, researchCrop, image, viewport, sample('select', 150));
  const exit = draw(ctx, researchCrop, image, viewport, sample('exit', 150));
  assert.equal(entrance.mode, 'atlas-crop');
  assert.ok(entrance.support[0] < exit.support[0]);
  assert.equal(entrance.support[1], exit.support[1]);
  assert.deepEqual(ctx.calls.filter(([type]) => type === 'scale'), [['scale', 1, 1], ['scale', 1, 1]]);
  assert.deepEqual(ctx.calls.find(([type]) => type === 'drawImage').slice(2, 6), researchCrop.source);
  assert.equal(draw(context(), researchCrop, { naturalWidth: 900, naturalHeight: 900 }, viewport, sample('select', 150)), null);
});

function host() {
  const frames = new Map(), listeners = new Map(), created = [];
  let frameId = 0;
  const doc = { hidden: false, defaultView: {
    requestAnimationFrame(fn) { const id = ++frameId; frames.set(id, fn); return id; },
    cancelAnimationFrame(id) { frames.delete(id); }
  }, addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: name => listeners.delete(name), createElement() {
      const ctx = context();
      const item = { dataset: {}, style: {}, hidden: true, getContext() { return ctx; }, setAttribute() {},
        remove() { this.parent = null; } };
      created.push(item);
      return item;
    } };
  const section = () => ({ isConnected: true, clientWidth: viewport.width, clientHeight: viewport.height,
    append(canvas) { this.canvas = canvas; canvas.parent = this; } });
  const tick = timestamp => {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach(fn => fn(timestamp));
  };
  return { doc, frames, listeners, created, section, tick };
}

test('replacement, rapid browsing, reduced motion and close retire old decodes and scheduled animation', async () => {
  const { doc, frames, listeners, created, section, tick } = host();
  const waterfall = [];
  let reduced = false;
  const motion = create({ document: doc, getReducedMotion: () => reduced,
    loadImage: (path, signal) => new Promise(resolve => waterfall.push({ path, signal, resolve })) });
  const first = section(), fallback = { style: {} };
  const choose = (id, host = first) => motion.sync([{ slot: 'player', id, facing: 1, host, fallback }]);
  choose('warrior');
  waterfall[0].resolve(decoded(visual('warrior')));
  await flush();
  tick(0);
  tick(32);
  assert.equal(motion.snapshot()[0].incoming.id, 'warrior');

  const remounted = section();
  choose('runner', remounted);
  assert.equal(created.length, 1);
  waterfall[1].resolve(decoded(visual('runner')));
  await flush();
  tick(48);
  const transition = motion.snapshot()[0];
  assert.equal(transition.outgoing.id, 'warrior');
  assert.equal(transition.incoming.id, 'runner');

  choose('defender', remounted);
  choose('smasher', remounted);
  assert.equal(waterfall[2].signal.aborted, true);
  waterfall[2].resolve(decoded(visual('defender')));
  waterfall[3].resolve(decoded(visual('smasher')));
  reduced = true;
  await flush();
  tick(64);
  assert.equal(motion.snapshot()[0].outgoing, null);
  assert.equal(motion.snapshot()[0].incoming.id, 'smasher');
  assert.equal(motion.snapshot()[0].phase, 'ready');
  assert.equal(frames.size, 0);
  assert.equal(remounted.canvas.parent, remounted);

  choose('predalien', remounted);
  doc.hidden = true;
  listeners.get('visibilitychange')();
  assert.equal(frames.size, 0);
  motion.stop();
  assert.equal(waterfall.at(-1).signal.aborted, true);
  assert.equal(listeners.size, 0);
  assert.equal(fallback.style.visibility, '');
  assert.equal(created[0].parent, null);
});

test('bad dimensions and a failed load retain the exact static DOM fallback', async () => {
  const { doc, frames, section, tick } = host();
  const target = section(), fallback = { style: { visibility: 'hidden' } };
  const motion = create({ document: doc, getPlate: getXenoTrialsPresentationPlateV230,
    loadImage: async path => {
      if (path.endsWith('warrior-select.png')) return { naturalWidth: 2, naturalHeight: 4 };
      throw new Error('Unavailable');
    } });
  motion.sync([{ slot: 'player', id: 'warrior', facing: 1, host: target, fallback }]);
  await flush();
  tick(10);
  assert.equal(target.canvas.hidden, true);
  assert.deepEqual(motion.snapshot(), []);
  assert.equal(fallback.style.visibility, '');
  assert.equal(frames.size, 0);
  motion.stop();
});
