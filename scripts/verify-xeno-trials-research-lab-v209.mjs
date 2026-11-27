import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { createXenoTrialsResearchLabV209, getXenoTrialsResearchLabAssetsV209, getXenoTrialsResearchLabViewV209,
  setXenoTrialsResearchLabPausedV209, stepXenoTrialsResearchLabV209 } from '../src/xeno-trials-research-lab-v209.js';
import { beginXenoTrialsV96, completeXenoTrialsResearchLabV209, createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';

const frame = (lab, input = {}) => stepXenoTrialsResearchLabV209(lab, 1 / 120, input);
const hold = (lab, input, duration) => { for (let tick = 0; tick < duration; tick++) frame(lab, input); };
function moveTo(lab, x) {
  while (lab.phase === 'active' && Math.abs(lab.position - x) > 2) frame(lab, { [lab.position < x ? 'right' : 'left']: true });
}

test('Ovomorph requires three physical sensor holds and penalizes remaining in its central watch zone', () => {
  const lab = createXenoTrialsResearchLabV209('OVOMORPH');
  for (const [index, x] of [205, 398, 810].entries()) {
    moveTo(lab, x);
    hold(lab, { interact: true }, 54);
    assert.equal(lab.stage, index + 1);
  }
  assert.equal(lab.phase, 'complete');
  const fail = createXenoTrialsResearchLabV209('OVOMORPH');
  moveTo(fail, 500);
  hold(fail, {}, 190);
  assert.equal(fail.phase, 'retry');
  assert.equal(fail.reason, 'wake');
});

test('Cocon samples only from a nearby station during an open scanner window', () => {
  const lab = createXenoTrialsResearchLabV209('ROMULUS-COCOON');
  hold(lab, { interact: true }, 300);
  assert.equal(lab.stage, 0);
  for (const [index, x] of [230, 485, 760].entries()) {
    moveTo(lab, x);
    while (getXenoTrialsResearchLabViewV209(lab).scannerOpen) frame(lab);
    hold(lab, { interact: true }, 250);
    assert.equal(lab.stage, index + 1);
  }
  assert.equal(lab.phase, 'complete');
});

test('Tadpole echo stops before closed gates and each actuator requires a fresh input', () => {
  const lab = createXenoTrialsResearchLabV209('TADPOLE');
  hold(lab, {}, 300);
  assert.equal(lab.echo, 283);
  moveTo(lab, 236);
  frame(lab, { interact: true });
  assert.equal(lab.stage, 1);
  while (lab.position < 516) frame(lab, { interact: true, right: true });
  assert.equal(lab.stage, 1);
  frame(lab);
  frame(lab, { interact: true });
  assert.equal(lab.stage, 2);
  moveTo(lab, 746);
  frame(lab, { interact: true });
  assert.equal(lab.stage, 3);
  assert.equal(lab.phase, 'active');
  hold(lab, {}, 540);
  assert.equal(lab.phase, 'complete');
  assert.ok(lab.echo >= 944);
});

test('pause freezes physical coordinates and time, and expiry cannot create a saved observation', () => {
  const lab = createXenoTrialsResearchLabV209('TADPOLE');
  hold(lab, { right: true }, 30);
  assert.equal(setXenoTrialsResearchLabPausedV209(lab, true), true);
  const paused = getXenoTrialsResearchLabViewV209(lab);
  hold(lab, { interact: true, right: true }, 300);
  assert.deepEqual(getXenoTrialsResearchLabViewV209(lab), paused);
  assert.equal(setXenoTrialsResearchLabPausedV209(lab, false), true);
  hold(lab, {}, 8400);
  assert.equal(lab.reason, 'timeout');
  assert.equal(setXenoTrialsResearchLabPausedV209(lab, true), false);
});

test('progress admits exact lab IDs, keeps them outside the rated balance and ships named assets', () => {
  const original = normalizeXenoTrialsProgressV96(createXenoTrialsProgressV96());
  const saved = completeXenoTrialsResearchLabV209(original, 'OVOMORPH');
  assert.deepEqual(saved.state, { ...original, practiceLabsClearedV209: ['OVOMORPH'] });
  assert.equal(completeXenoTrialsResearchLabV209(saved.state, 'OVOMORPH').applied, false);
  assert.equal(completeXenoTrialsResearchLabV209(saved.state, 'FACEHUGGER').applied, false);
  const pending = beginXenoTrialsV96(original, { playerId: 'warrior', opponentId: 'runner' });
  assert.equal(completeXenoTrialsResearchLabV209(pending.state, 'TADPOLE').applied, false);
  const assets = getXenoTrialsResearchLabAssetsV209();
  assert.equal(assets.length, 2);
  assert.ok(assets.every(asset => existsSync(new URL(`..${asset}`, import.meta.url))));
});
