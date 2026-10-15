import test from 'node:test';
import assert from 'node:assert/strict';
import { openSync, readSync, closeSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { PLAYER_BODY_RIG_ASSETS_V125 } from '../src/player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ASSETS_V126 } from '../src/player-modular-rig-v126.js';
import { PLAYER_COLONIAL_RIG_ASSETS_V129, PLAYER_COLONIAL_LEG_DEFINITIONS_V129 } from '../src/player-colonial-art-v129.js';
import { PLAYER_APPEARANCE_ITEMS_V126, PLAYER_APPEARANCE_PRESETS_V129,
  normalizePlayerAppearanceV126 } from '../src/player-appearance-v126.js';
import { PLAYER_TRANSIT_RIG_ASSETS_V128, resolvePlayerTransitRigV128 } from '../src/player-transit-rig-v128.js';
import { HUB_TRAVERSAL_PROFILES_V60 } from '../src/hub-v51-runtime.js';
import { resolveHubServiceProfileV139 } from '../src/hub-service-geometry-v139.js';
import { HUB_ANNEXES_V137 } from '../src/hub-annex-registry-v137.js';
import { getHubLadderMountV139 } from '../src/hub-support-planes-v139.js';
import { HubGame as ProductionHub } from '../src/hub-opening-v88.js';
import { createDefaultSave } from '../src/save.js';

const assets = [...PLAYER_BODY_RIG_ASSETS_V125, ...PLAYER_MODULAR_RIG_ASSETS_V126,
  ...PLAYER_TRANSIT_RIG_ASSETS_V128, ...PLAYER_COLONIAL_RIG_ASSETS_V129];
const images = new Map(assets.map(asset => [asset.imageKey, {
  complete: true, naturalWidth: asset.sourceWidth, naturalHeight: asset.sourceHeight
}]));
const medical = { id: 'medical-floor', x: 2820, top: 500, bottom: 624, w: 52 };
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const close = (a, b, message = '') => assert.ok(Math.abs(a - b) < 1e-6, `${message}: ${a} versus ${b}`);
const actorAt = (ladder, feet, patch = {}) => ({
  x: ladder.x - 22, y: feet - 92, w: 44, h: 92, facing: 1, alive: true,
  climbing: true, grounded: false, ladderId: ladder.id, vx: 0, vy: -185,
  costumeId: 'costume-001', health: 100, armor: 40, ammo: 24, ammoReserve: 64,
  shots: 0, stamina: 83, ...patch
});
function mounted(source, { annex = false, id = source.id } = {}) {
  const mount = getHubLadderMountV139(source, { centered: !annex });
  assert.ok(mount);
  const ladder = { ...source, id, x: source.x + (annex ? source.w / 2 : 0),
    rungTop: mount.rungTop, rungBottom: mount.rungBottom,
    rungSpacing: mount.rungSpacing, firstRung: mount.firstRung };
  return { mount, ladder };
}
function rig(ladder, feet, options = {}) {
  const { patch, ...rest } = options;
  return resolvePlayerTransitRigV128({ actor: actorAt(ladder, feet, patch), ladder,
    surface: 'hub', images, timeSeconds: 1, legDefinitions: PLAYER_COLONIAL_LEG_DEFINITIONS_V129,
    ...rest });
}
function assertPhysicalContacts(result, mount) {
  assert.equal(result.eligible, true);
  assert.equal(result.firing, false);
  for (const group of ['hands', 'feet']) {
    assert.ok(Object.values(result.contacts[group]).some(contact => contact.planted), `${group}: at least one support`);
    for (const side of ['near', 'far']) {
      const contact = result.contacts[group][side];
      assert.ok(!contact.reachClamped, `${group}.${side}: anatomical target remains reachable`);
      const limb = group === 'hands' ? result.arms[side] : result.legs[side];
      const actual = group === 'hands' ? limb.hand : limb.sole;
      close(actual.x, contact.point.x); close(actual.y, contact.point.y);
      if (contact.planted) {
        const rung = mount.rungs.find(entry => entry.index === contact.rungIndex);
        assert.ok(rung, `${group}.${side}: index ${contact.rungIndex} must be actually painted`);
        close(actual.y, rung.y, `${group}.${side}: exact painted rung centre`);
        assert.ok(actual.x >= rung.x && actual.x <= rung.x + rung.w, 'Support is inside the painted rung width');
      }
      if (group === 'hands') {
        close(distance(limb.shoulder, limb.elbow), limb.upper);
        close(distance(limb.elbow, limb.hand), limb.fore);
      } else {
        close(distance(limb.hip, limb.knee), limb.upper);
        close(distance(limb.knee, limb.ankle), limb.lower);
      }
    }
  }
}

test('the measured medical pull-up has genuine reachable grips above the physical landing', () => {
  const { mount, ladder } = mounted(medical);
  assert.equal(mount.physicalTop, 500); assert.equal(mount.physicalBottom, 624);
  assert.equal(mount.railTop, 412); assert.equal(mount.rungBottom, 599);
  assert.deepEqual(mount.rungs.filter(rung => rung.index < 0).map(rung => rung.y), [423, 445, 467, 489]);
  const result = rig(ladder, 543.8209999999999, { patch: { x: 2798.033343193594 } });
  assertPhysicalContacts(result, mount);
  assert.ok(Object.values(result.contacts.hands).some(contact => contact.planted && contact.rungIndex < 0),
    'The previously unsupported hands now use a real upper rung');
  assertPhysicalContacts(rig(ladder, 500), mount);
  assertPhysicalContacts(rig(ladder, 624), mount);
});

test('every retained main and annex ladder supports anatomical hands and feet throughout its physical travel', () => {
  const entries = [
    ...Object.entries(HUB_TRAVERSAL_PROFILES_V60).flatMap(([roomId, profile]) =>
      resolveHubServiceProfileV139(profile).ladders.map(source => ({ source, id: source.id || roomId }))),
    ...HUB_ANNEXES_V137.flatMap(annex => (annex.ladders || []).map((source, index) =>
      ({ source, annex: true, id: source.id || `${annex.id}:ladder:${index}` })))
  ];
  assert.ok(entries.length >= 40, 'Audit uses actual retained ship geometry');
  for (const entry of entries) {
    const { ladder, mount } = mounted(entry.source, entry);
    for (const facing of [-1, 1]) for (let sample = 0; sample <= 60; sample++) {
      const feet = ladder.top + (ladder.bottom - ladder.top) * sample / 60;
      assertPhysicalContacts(rig(ladder, feet, { patch: { facing } }), mount);
    }
  }
});

test('all wardrobe pieces and complete presets preserve the same supports in ascent, descent and hold', () => {
  const { mount, ladder } = mounted(medical);
  const appearances = [normalizePlayerAppearanceV126(),
    ...PLAYER_APPEARANCE_ITEMS_V126.map(item => normalizePlayerAppearanceV126({ schema: 126, slots: { [item.slot]: item.id } })),
    ...PLAYER_APPEARANCE_PRESETS_V129.map(preset => normalizePlayerAppearanceV126({ schema: 126, slots: preset.slots }))];
  for (const facing of [-1, 1]) for (const feet of [500, 525, 543.821, 575, 599, 611, 624]) {
    const base = rig(ladder, feet, { patch: { facing } });
    for (const appearance of appearances) for (const vy of [-185, 0, 185]) {
      const result = rig(ladder, feet, { appearance, patch: { facing, vy }, timeSeconds: vy ? 1 : 300 });
      assert.equal(result.ready, true);
      assert.deepEqual(result.contacts, base.contacts);
      assert.deepEqual(result.legs, base.legs);
      assertPhysicalContacts(result, mount);
    }
  }
});

test('a free limb has smooth takeoff and touchdown with bounded recovery speed', () => {
  const { ladder } = mounted(medical);
  const epsilon = .01;
  for (const feet of [555, 577, 599, 621]) {
    const before = rig(ladder, feet - epsilon).contacts.hands.near.point;
    const at = rig(ladder, feet).contacts.hands.near.point;
    const after = rig(ladder, feet + epsilon).contacts.hands.near.point;
    assert.ok(distance(before, at) / epsilon < .001, 'No hand jerk immediately before contact/release');
    assert.ok(distance(after, at) / epsilon < .001, 'No hand jerk immediately after contact/release');
  }
  let previous = null;
  for (let feet = 500; feet <= 624; feet += .125) {
    const result = rig(ladder, feet);
    if (previous) for (const group of ['hands', 'feet']) for (const side of ['near', 'far']) {
      assert.ok(distance(result.contacts[group][side].point, previous.contacts[group][side].point) / .125 < 2.45,
        `${group}.${side}: recovery speed stays below the former cubic peak of three body speeds`);
    }
    previous = result;
  }
});

test('unannotated ladders gain no invisible grips and invalid painted extents fail admission', () => {
  for (const rungTop of [NaN, Infinity, null, '412', 501]) {
    assert.equal(rig({ ...medical, rungTop }, 543.821).reason, 'ladder-unavailable');
  }
  for (const rungBottom of [NaN, Infinity, null, '599', 625, 510]) {
    assert.equal(rig({ ...medical, rungBottom }, 543.821).reason, 'ladder-unavailable');
  }
  const subject = actorAt(medical, 543.821);
  const before = structuredClone(subject);
  for (const vy of [-185, 0, 185]) {
    const result = resolvePlayerTransitRigV128({ actor: { ...subject, vy }, ladder: medical, images, surface: 'mission' });
    for (const group of ['hands', 'feet']) for (const contact of Object.values(result.contacts[group])) {
      if (contact.planted) assert.ok(contact.rungIndex >= 0 && contact.rungY > medical.top);
    }
  }
  assert.deepEqual(subject, before, 'Observation cannot change physics, resources or equipment');
});

function nativeClimbHost() {
  const root = fileURLToPath(new URL('../', import.meta.url)), events = new EventTarget();
  for (const method of ['addEventListener', 'removeEventListener']) globalThis[method] = events[method].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 0; naturalHeight = 0;
    set src(source) {
      this._src = source; let descriptor;
      try {
        descriptor = openSync(resolve(root, `.${new URL(source, 'http://fixture.invalid').pathname}`), 'r');
        const header = Buffer.alloc(32); readSync(descriptor, header, 0, 32, 0);
        if (header.subarray(1, 4).toString() === 'PNG') [this.naturalWidth, this.naturalHeight] = [header.readUInt32BE(16), header.readUInt32BE(20)];
        else if (header.subarray(0, 4).toString() === 'RIFF' && header.subarray(12, 16).toString() === 'VP8X') {
          this.naturalWidth = header.readUIntLE(24, 3) + 1; this.naturalHeight = header.readUIntLE(27, 3) + 1;
        }
      } catch {} finally { if (descriptor !== undefined) closeSync(descriptor); }
      queueMicrotask(() => { const event = new Event(this.naturalWidth ? 'load' : 'error'); this.dispatchEvent(event); this[`on${event.type}`]?.(event); });
    }
    get src() { return this._src; }
    async decode() { if (!this.naturalWidth) throw Error('Missing fixture image'); }
  };
  const ctx = new Proxy({ measureText: value => ({ width: String(value).length * 7 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }),
    getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })
  }, { get: (object, key) => key in object ? object[key] : () => {} });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const key = (type, code) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { code, repeat: false, ctrlKey: false, metaKey: false, altKey: false }); events.dispatchEvent(event);
  };
  return { canvas, key };
}

test('holding native W at the upper landing and S at the floor produces real support without a residual ladder impulse', async () => {
  const browser = nativeClimbHost(), save = createDefaultSave(); save.needsPlayerCreationV84 = false;
  const hub = new ProductionHub(browser.canvas, { onAction() {}, onPersist() {}, onStatus() {} });
  hub.start({ deck: 1, roomId: 'crew-quarters', positionX: 188, positionY: 532 }, { routineContextV62: { save } });
  try {
    for (let index = 0; index < 8; index++) await Promise.resolve();
    const ladder = hub.nearestTraversalLadder(); assert.equal(ladder.id, 'quarters-floor');
    const resolvedLandings = [], realResolve = hub.resolveVertical;
    hub.resolveVertical = function (previousBottom) {
      realResolve.call(this, previousBottom);
      if (this.player.grounded) resolvedLandings.push(this.player.y + this.player.h);
    };
    const step = () => hub.update(1 / 60);
    browser.key('keydown', 'KeyW'); for (let frame = 0; frame < 18; frame++) step();
    browser.key('keyup', 'KeyW'); step();
    const holdY = hub.player.y;
    for (let frame = 0; frame < 12; frame++) {
      step(); close(hub.player.y, holdY); assert.equal(hub.player.climbing, true); assert.equal(hub.player.vy, 0);
    }
    browser.key('keydown', 'KeyW');
    let reachedTop = false, supportedTopFrames = 0;
    for (let frame = 0; frame < 150; frame++) {
      step(); const feet = hub.player.y + hub.player.h;
      if (Math.abs(feet - ladder.top) < 1e-6) reachedTop = true;
      if (reachedTop) {
        close(feet, ladder.top, 'Holding up cannot launch a new arc above the landing');
        if (!hub.player.climbing) {
          assert.equal(hub.player.grounded, true); assert.equal(hub.player.vy, 0); supportedTopFrames++;
          assert.ok(hub.v51Platforms.some(platform => platform.y === feet
            && hub.player.x + hub.player.w > platform.x + 4 && hub.player.x < platform.x + platform.w - 4));
        }
      }
    }
    browser.key('keyup', 'KeyW');
    assert.ok(reachedTop && supportedTopFrames > 90); assert.ok(resolvedLandings.includes(ladder.top));
    browser.key('keydown', 'KeyS');
    let reachedBottom = false, supportedBottomFrames = 0;
    for (let frame = 0; frame < 150; frame++) {
      step(); const feet = hub.player.y + hub.player.h;
      if (Math.abs(feet - ladder.bottom) < 1e-6) reachedBottom = true;
      if (reachedBottom) {
        close(feet, ladder.bottom, 'Holding down cannot carry an old descent impulse past the floor');
        if (!hub.player.climbing) {
          assert.equal(hub.player.grounded, true); assert.equal(hub.player.vy, 0); supportedBottomFrames++;
        }
      }
    }
    browser.key('keyup', 'KeyS');
    assert.ok(reachedBottom && supportedBottomFrames > 90); assert.ok(resolvedLandings.includes(ladder.bottom));
    assert.equal(hub.jumpQueued, 0); assert.equal(hub.player.health, 100);
    // The ordinary jump still comes from the real control after support.
    browser.key('keydown', 'Space'); step(); browser.key('keyup', 'Space');
    assert.equal(hub.player.climbing, false); assert.equal(hub.player.grounded, false);
    assert.ok(hub.player.vy < -600); assert.ok(hub.player.y + hub.player.h < ladder.bottom);
  } finally { hub.stop(); }
});
