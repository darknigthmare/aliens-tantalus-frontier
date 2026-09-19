import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { HubGame } from '../src/hub-onboarding-v84.js';
import { HUB_WORLD, buildHubObstacleGeometryV87 } from '../src/hub-game.js';
import { buildHubTraversalGeometryV87, HUB_TRAVERSAL_ART_FILES } from '../src/hub-v51-runtime.js';
import { ELECTRICAL_HAZARD_ART_V55 } from '../src/hub-art-runtime-v55.js';

function withHub(run) {
  const names = ['Image', 'addEventListener', 'requestAnimationFrame', 'matchMedia'];
  const previous = Object.fromEntries(names.map(name => [name, globalThis[name]]));
  globalThis.Image = class {
    constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; }
    set src(value) { this.currentSrc = value; }
  };
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  globalThis.matchMedia = () => ({ matches: false });
  const trace = { images: [], clips: [], rectangles: [] };
  const ctx = new Proxy({ measureText: value => ({ width: String(value).length * 8 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }),
    drawImage: (...args) => trace.images.push(args), rect: (...args) => trace.clips.push(args),
    fillRect: (...args) => trace.rectangles.push(args) }, { get: (target, key) => key in target ? target[key] : () => {} });
  try {
    const hub = new HubGame({ width: 1280, height: 720, getContext: () => ctx, addEventListener() {}, focus() {} });
    hub.start({ deck: 3, roomId: 'dropship-hangar', positionX: 99 });
    return run(hub, ctx, trace);
  } finally { Object.assign(globalThis, previous); }
}

test('maintenance gantries connect both rooms and clear the unchanged flightline and reactor prop', () => {
  const geometry = buildHubTraversalGeometryV87(3);
  const upper = geometry.platforms.find(item => item.id === 'hangar-observation');
  const balcony = geometry.platforms.find(item => item.id === 'reactor-high');
  const lower = geometry.platforms.find(item => item.id === 'reactor-low');
  const egress = geometry.ladders.find(item => item.id === 'reactor-service-egress');
  const reactor = buildHubObstacleGeometryV87(3).find(item => item.roomId === 'reactor');
  assert.equal(upper.x + upper.w, HUB_WORLD.roomWidth);
  assert.equal(balcony.x, upper.x + upper.w);
  assert.ok(Math.abs(upper.y - balcony.y) <= 12);
  assert.ok(upper.y < ELECTRICAL_HAZARD_ART_V55.collisionBounds.y);
  assert.ok(lower.x < reactor.x && lower.x + lower.w > reactor.x + reactor.w);
  assert.ok(lower.y < reactor.y);
  assert.equal(egress.top, lower.y); assert.equal(egress.bottom, HUB_WORLD.floorY);
  assert.ok(egress.x > reactor.x + reactor.w + 22);
  assert.ok(egress.x < 2372 - 52, 'egress does not capture the lift interaction');
  assert.deepEqual(ELECTRICAL_HAZARD_ART_V55.collisionBounds, { x: 1040, y: 550, w: 236, h: 74 });
  assert.equal(ELECTRICAL_HAZARD_ART_V55.activeByDefault, true);
});

test('real inputs reach the lift and return without damage, teleport, hazard removal or precision jumps', () => withHub(hub => {
  const x = () => hub.player.x + hub.player.w / 2;
  const feet = () => hub.player.y + hub.player.h;
  const jump = () => hub.setControl('jump', true);
  let frames = 0;
  function travel(keys, reached, limit = 15) {
    hub.keys = new Set(keys);
    let elapsed = 0;
    while (!reached() && elapsed++ < limit * 60) {
      const before = { x: hub.player.x, y: hub.player.y };
      hub.update(1 / 60); frames++;
      assert.equal(hub.player.health, 100, 'pedestrian route must not touch the electrical arc');
      assert.equal(hub.player.alive, true); assert.equal(hub.state.deck, 3);
      // Ladder centering is a 12/s tween inside a 52px capture radius, plus
      // ordinary momentum: allow that bounded alignment, never a respawn snap.
      assert.ok(Math.abs(hub.player.x - before.x) <= 16, 'continuous horizontal motion ' + JSON.stringify({ before, x: hub.player.x, keys }));
      assert.ok(Math.abs(hub.player.y - before.y) <= 12.1, 'continuous climbing, stepping and landing');
    }
    assert.ok(reached(), keys.join('+') + ' stopped at ' + JSON.stringify({ x: x(), feet: feet() }));
  }
  // This is the real port-exit spawn. No player pose is assigned below.
  travel(['KeyD'], () => x() >= 160);
  travel(['KeyW'], () => feet() <= 370.01);
  jump(); travel(['KeyD'], () => x() >= 300);
  travel(['KeyD'], () => x() >= 1380);
  travel(['KeyC', 'KeyD'], () => x() >= 1590); // existing service duct, not a deleted collider
  travel(['KeyD'], () => x() >= 2260);
  travel(['KeyS'], () => feet() >= 624);
  jump(); travel(['KeyD'], () => x() >= 2372 && hub.player.grounded);
  assert.equal(hub.nearestLift()?.id, 'engineering:hub-midship-lift');

  travel(['KeyA'], () => x() <= 2300);
  travel(['KeyW'], () => feet() <= 502.01);
  jump(); travel(['KeyA'], () => x() <= 2180 && hub.player.grounded);
  travel(['KeyA'], () => x() <= 1840);
  travel(['KeyW'], () => feet() <= 382.01);
  jump(); travel(['KeyA'], () => x() <= 1740 && hub.player.grounded);
  travel(['KeyA'], () => x() <= 1600);
  travel(['KeyC', 'KeyA'], () => x() <= 1380);
  travel(['KeyA'], () => x() <= 250);
  travel(['KeyC', 'KeyA'], () => x() <= 160);
  travel(['KeyS'], () => feet() >= 624);
  jump(); travel(['KeyA'], () => x() <= 121 && hub.player.grounded);
  assert.equal(hub.currentRoom().id, 'dropship-hangar');
  assert.ok(frames > 1000, 'the route is simulated over real game time, not a snap');
}));

test('extended platforms and egress ladder render existing bitmap segments at their collision bounds', () => withHub((hub, ctx, trace) => {
  for (const id of ['hangar-observation', 'reactor-high', 'reactor-low']) {
    const platform = hub.v51Platforms.find(item => item.id === id);
    trace.images.length = 0; trace.clips.length = 0; trace.rectangles.length = 0;
    hub.drawTraversalPlatform(ctx, platform);
    const offset = platform.art === 'catwalk' ? 55 : 18;
    const height = platform.art === 'catwalk' ? 90 : 84;
    assert.deepEqual(trace.clips, [[platform.x, platform.y - offset, platform.w, height]]);
    assert.ok(trace.images.length > 0);
    assert.ok(trace.images.every(call => call.length === 9 && call[0].currentSrc === HUB_TRAVERSAL_ART_FILES[platform.art]));
    assert.deepEqual(trace.rectangles, [], 'no invisible CSS/canvas replacement walkway');
    assert.ok(existsSync(fileURLToPath(new URL('..' + HUB_TRAVERSAL_ART_FILES[platform.art], import.meta.url))));
  }
  const ladder = hub.v51Ladders.find(item => item.id === 'reactor-service-egress');
  trace.images.length = 0; trace.clips.length = 0;
  hub.drawTraversalLadder(ctx, ladder);
  assert.deepEqual(trace.clips, [[ladder.x - ladder.w / 2, ladder.top, ladder.w, ladder.bottom - ladder.top]]);
  assert.ok(trace.images.every(call => call.length === 9 && call[0].currentSrc === HUB_TRAVERSAL_ART_FILES.ladder));
}));

test('unchanged electrical hazard still damages actors who enter the flightline at ground level', () => withHub(hub => {
  // Separate negative-control fixture, never used to claim route accessibility.
  Object.assign(hub.player, { x: 1100, y: 624 - hub.player.h, shockClock: 0, invulnerability: 0 });
  hub.update(1 / 60);
  assert.equal(hub.player.health, 100 - ELECTRICAL_HAZARD_ART_V55.damage);
  assert.ok(hub.player.shockClock > 0);
}));
