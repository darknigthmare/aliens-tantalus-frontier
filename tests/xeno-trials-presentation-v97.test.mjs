import test from 'node:test';
import assert from 'node:assert/strict';
import { XENO_PRESENTATION_V97, createXenoPresentationV97, getXenoPresentationViewV97,
  advanceXenoPresentationV97 } from '../src/xeno-trials-presentation-v97.js';

const advance = (state, milliseconds) => {
  while (milliseconds > 0) { const dt = Math.min(milliseconds, 100); state = advanceXenoPresentationV97(state, dt); milliseconds -= dt; }
  return state;
};

test('V97 presentation follows both 1200ms portraits, 3000ms countdown and 650ms fight signal', () => {
  assert.deepEqual(XENO_PRESENTATION_V97, { introMs: 1200, countdownMs: 3000, fightMs: 650, maxStepMs: 100 });
  let state = createXenoPresentationV97();
  assert.equal(getXenoPresentationViewV97(state).fighterSlot, 0);
  state = advance(state, 1199); assert.equal(state.phase, 'intro-player');
  state = advance(state, 1); assert.equal(state.phase, 'intro-opponent');
  assert.equal(getXenoPresentationViewV97(state).fighterSlot, 1);
  state = advance(state, 1200); assert.equal(state.phase, 'countdown');
  state = advance(state, 3000); assert.equal(state.phase, 'fight');
  assert.equal(getXenoPresentationViewV97(state).blocksSimulation, false);
  state = advance(state, 649); assert.equal(state.phase, 'fight');
  state = advance(state, 1); assert.equal(state.phase, 'active');
  assert.equal(getXenoPresentationViewV97(state).blocksSimulation, false);
  assert.equal(advanceXenoPresentationV97(state, 100), state);
});

test('V97 countdown announces 3, 2, 1 and never announces zero', () => {
  let state = createXenoPresentationV97(2);
  for (const [dt, expected] of [[0, 3], [999, 3], [1, 2], [999, 2], [1, 1], [999, 1]]) {
    state = advance(state, dt); const view = getXenoPresentationViewV97(state);
    assert.equal(view.countdown, expected); assert.equal(view.blocksSimulation, true); assert.equal(view.fighterSlot, null);
  }
  state = advance(state, 1); assert.equal(state.phase, 'fight'); assert.equal(getXenoPresentationViewV97(state).countdown, null);
});

test('V97 later rounds skip portraits but retain their full blocking countdown', () => {
  for (const round of [2, 3, 4, 5]) {
    const initial = createXenoPresentationV97(round), before = structuredClone(initial);
    assert.deepEqual(initial, { phase: 'countdown', elapsedMs: 0, round });
    const later = advance(initial, 2900); assert.equal(later.phase, 'countdown'); assert.equal(later.round, round);
    assert.deepEqual(initial, before); assert.equal(advance(later, 100).phase, 'fight');
  }
});

test('V97 pause freezes every presentation phase at its exact elapsed position', () => {
  for (const phase of ['intro-player', 'intro-opponent', 'countdown', 'fight', 'active']) {
    const state = { phase, elapsedMs: 412, round: 1 }, before = structuredClone(state);
    for (let i = 0; i < 100; i++) assert.equal(advanceXenoPresentationV97(state, 100, true), state);
    assert.deepEqual(state, before);
  }
});

test('V97 invalid clock deltas are ignored and stalls cannot skip presentation', () => {
  const state = createXenoPresentationV97();
  for (const dt of [0, -1, NaN, Infinity, -Infinity, undefined, null, '100']) assert.equal(advanceXenoPresentationV97(state, dt), state);
  const next = advanceXenoPresentationV97(state, 100000);
  assert.deepEqual(next, { phase: 'intro-player', elapsedMs: 100, round: 1 });
  assert.equal(state.elapsedMs, 0); assert.notEqual(next, state);
  const view = getXenoPresentationViewV97(next); view.elapsedMs = -1; assert.equal(next.elapsedMs, 100);
});
