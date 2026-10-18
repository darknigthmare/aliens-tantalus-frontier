import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Test the actual expression shipped in the browser journey, not a duplicate.
// VM and JSHandle substitutes isolate serialization; Chromium remains required
// to validate the real canvas. No production engine state is edited by this test.
const source = readFileSync(new URL('./qa-player-browser-v124.mjs', import.meta.url), 'utf8');
const start = source.indexOf('const observeActionFrameV150 = ');
const end = source.indexOf('\n  const capture = ', start);
assert.ok(start >= 0 && end > start);
const expression = source.slice(start + 'const observeActionFrameV150 = '.length, end).trim().replace(/;$/, '');
const transitStart = source.indexOf('const observeTransitFrameV157 = ');
const transitEnd = source.indexOf('\n  const walkTo = ', transitStart);
assert.ok(transitStart >= 0 && transitEnd > transitStart);
const transitExpression = source.slice(transitStart + 'const observeTransitFrameV157 = '.length, transitEnd).trim().replace(/;$/, '');
function fixture(actor, fail = false, observationExpression = expression, beforeJsonValue = () => {}) {
  const context = { __ATF_GAME__: { player: actor }, intruded: false };
  let disposed = 0, sampled;
  function reader(includeCanvas) {
    return { canvasPng: includeCanvas ? 'data:image/png;base64,fixture' : null,
      player: globalThis.__ATF_GAME__.player };
  }
  const page = { waitForFunction(body, arg, options) {
    assert.equal(typeof body, 'string');
    assert.equal(options.polling, 'raf'); assert.equal(options.timeout, 15000);
    sampled = runInNewContext(body, context, { timeout: 1000 });
    return Promise.resolve({ jsonValue: async () => {
      beforeJsonValue();
      if (fail) throw new Error('serialization failure');
      return sampled;
    }, dispose: async () => { disposed++; } });
  } };
  return { observe: new Function('page', 'readLiveState', `return (${observationExpression});`)(page, reader),
    context, get disposed() { return disposed; }, get sampled() { return sampled; } };
}
const actor = () => ({ meleeClock: .2, meleeKind: 'rifle-bash', health: 90,
  playerAppearanceVisualV126: { drawn: true }, playerActionVisualV127: { kind: 'rifle-bash', elapsed: .1 } });

test('observer expression returns false, not a truthy function, until a drawn melee exists', async () => {
  for (const state of [null, { ...actor(), meleeClock: 0 },
    { ...actor(), playerActionVisualV127: { kind: 'medical' } },
    { ...actor(), playerAppearanceVisualV126: { drawn: false } }]) {
    const h = fixture(state);
    assert.equal(await h.observe('player', 'contextual-melee'), false);
    assert.equal(h.disposed, 1);
  }
});
test('accepted melee frame and actor values are detached in the same observation', async () => {
  const current = actor(), h = fixture(current);
  const result = await h.observe('player', 'contextual-melee');
  assert.equal(typeof result, 'object'); assert.equal(result.canvasPng, 'data:image/png;base64,fixture');
  assert.equal(result.player.health, 90); assert.equal(result.player.playerActionVisualV127.kind, 'rifle-bash');
  current.health = 0; current.playerActionVisualV127.kind = 'hurt';
  assert.equal(result.player.health, 90); assert.equal(result.player.playerActionVisualV127.kind, 'rifle-bash');
  assert.equal(h.disposed, 1);
});
test('observer encodes its role and action as data rather than executable expression text', async () => {
  const h = fixture(actor());
  assert.equal(await h.observe('player"}; globalThis.intruded = true; //', 'contextual-melee'), false);
  assert.equal(h.context.intruded, false); assert.equal(h.disposed, 1);
});
test('failed handle serialization still disposes the observation handle', async () => {
  const h = fixture(actor(), true);
  await assert.rejects(h.observe('player', 'contextual-melee'), /serialization failure/);
  assert.equal(h.disposed, 1);
});
test('accepted drawn revive remains detached when a real hurt pose supersedes it before handle serialization', async () => {
  const current = { ...actor(), alive: true, downed: false, health: 35,
    playerActionVisualV127: null, playerTransitVisualV128: { kind: 'revive', drawn: true, progress: .1 } };
  const h = fixture(current, false, transitExpression, () => {
    current.health = 33.345;
    current.playerTransitVisualV128 = null;
    current.playerActionVisualV127 = { kind: 'hurt', elapsed: .02 };
  });
  const result = await h.observe('player', 'revive');
  assert.equal(current.playerTransitVisualV128, null);
  assert.equal(current.playerActionVisualV127.kind, 'hurt');
  assert.equal(result.canvasPng, 'data:image/png;base64,fixture');
  assert.equal(result.player.health, 35);
  assert.equal(result.player.playerTransitVisualV128.kind, 'revive');
  assert.equal(result.player.playerTransitVisualV128.drawn, true);
  assert.equal(result.player.playerActionVisualV127, null);
  assert.equal(h.disposed, 1);
});
