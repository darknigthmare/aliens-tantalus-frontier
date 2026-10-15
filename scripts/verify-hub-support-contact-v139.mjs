import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getHubContactShadowV139, drawHubContactShadowV116 } from '../src/hub-depth-presentation-v116.js';
import { HubGame as HubBase } from '../src/hub-game.js';
import { HubGame as HubOpening } from '../src/hub-v51-runtime.js';
import { withHubTrainingV132, createHubLoaderTrainingV132 } from '../src/hub-training-v132.js';

const actorAt = footY => ({ x: 2800, y: footY - 92, w: 44, h: 92, grounded: true, climbing: false });

test('a supported person casts the same contact shadow on each actual deck, including the medical and maintenance landings', () => {
  for (const supportY of [624, 500, 498, 426, 376]) {
    const actor = actorAt(supportY), before = structuredClone(actor), model = getHubContactShadowV139(actor, supportY);
    assert.equal(model.supportY, supportY); assert.equal(model.footY, supportY);
    assert.equal(model.y, supportY + 2); assert.equal(model.x, actor.x + actor.w / 2);
    assert.equal(model.radiusX, 44 * .62); assert.equal(model.radiusY, 3);
    assert.equal(model.collidable, false); assert.deepEqual(actor, before);
  }
});

test('a high landing never projects a false contact on the lower deck', () => {
  for (const supportY of [500, 426, 376]) {
    assert.equal(getHubContactShadowV139(actorAt(supportY), 624), null);
    assert.ok(getHubContactShadowV139(actorAt(supportY), supportY));
  }
});

test('climbing, falling, duct transit and mounted bodies have no ground-contact ellipse', () => {
  for (const state of [{ climbing: true }, { grounded: false }, { ventTransit: { active: true } }, { inVehicle: true }]) {
    assert.equal(getHubContactShadowV139({ ...actorAt(624), ...state }, 624), null);
  }
  for (const actor of [null, { ...actorAt(624), w: 0 }, { ...actorAt(624), x: Number.NaN }]) {
    assert.equal(getHubContactShadowV139(actor, 624), null);
  }
});

test('the actual painter uses the observed support and restores the canvas; disabled or unsupported contacts paint nothing', () => {
  const calls = []; let depth = 0;
  const ctx = { save() { depth++; }, restore() { depth--; }, beginPath() {}, fill() {}, ellipse(...args) { calls.push(args); } };
  const model = drawHubContactShadowV116(ctx, actorAt(426), 426);
  assert.deepEqual(calls, [[2822, 428, 27.28, 3, 0, 0, Math.PI * 2]]);
  assert.equal(model.supportY, 426); assert.equal(depth, 0);
  for (const [actor, support, enabled] of [[actorAt(426), 624, true], [actorAt(426), 426, false], [{ ...actorAt(426), climbing: true }, 426, true]]) {
    assert.equal(drawHubContactShadowV116(ctx, actor, support, enabled), null);
  }
  assert.equal(calls.length, 1); assert.equal(depth, 0);
});

test('the legacy crouch wrapper cannot manufacture grounded support during an airborne render', () => {
  const original = HubBase.prototype.drawPlayer;
  const actor = { ...actorAt(470), grounded: false, crouching: true, vx: 83 };
  const before = structuredClone(actor), observed = [];
  try {
    // Exercise the real V51 wrapper. Replacing only its base painter isolates
    // the observed actor state from browser image loading and canvas concerns.
    HubBase.prototype.drawPlayer = function () {
      observed.push({ grounded: this.player.grounded, vx: this.player.vx,
        shadow: getHubContactShadowV139(this.player, this.player.y + this.player.h) });
    };
    HubOpening.prototype.drawPlayer.call({ player: actor }, {});
    assert.deepEqual(observed, [{ grounded: false, vx: 0, shadow: null }]);
    assert.deepEqual(actor, before, 'Drawing restores the physical actor exactly');
  } finally {
    HubBase.prototype.drawPlayer = original;
  }
});

test('a failed crouch paint restores the original simulation velocity and support state', () => {
  const original = HubBase.prototype.drawPlayer, failure = new Error('isolated paint failure');
  const actor = { ...actorAt(500), grounded: false, crouching: true, vx: -61 };
  const before = structuredClone(actor);
  try {
    HubBase.prototype.drawPlayer = function () {
      assert.equal(this.player.grounded, false); assert.equal(this.player.vx, 0);
      throw failure;
    };
    assert.throws(() => HubOpening.prototype.drawPlayer.call({ player: actor }, {}), error => error === failure);
    assert.deepEqual(actor, before);
  } finally {
    HubBase.prototype.drawPlayer = original;
  }
});

test('the mounted training painter replaces a previous walking shadow with the current real omission', () => {
  const Training = withHubTrainingV132(class {}), subject = Object.create(Training.prototype);
  const course = createHubLoaderTrainingV132(), actor = actorAt(624);
  course.mounted = true;
  actor.supportShadowV139 = { schema: 139, drawn: true, contactY: 624, frameTime: 1 };
  const before = structuredClone(actor); let depth = 0;
  subject.ctx = new Proxy({ save() { depth++; }, restore() { depth--; } },
    { get: (target, key) => key in target ? target[key] : () => {} });
  Object.assign(subject, { hubTrainingV132: { active: true, course }, player: actor,
    animationTime: 9, keys: new Set(), trainingImageV132: null,
    drawPlayer() { assert.fail('A mounted operator cannot acquire a walking shadow'); } });
  subject.draw();
  assert.deepEqual(actor.supportShadowV139, { schema: 139, drawn: false, contactY: null,
    frameTime: 9, omittedReason: 'vehicle-mounted' });
  assert.deepEqual({ ...actor, supportShadowV139: before.supportShadowV139 }, before);
  assert.equal(depth, 0);
});
