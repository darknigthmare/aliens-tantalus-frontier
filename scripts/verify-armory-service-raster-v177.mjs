import test from 'node:test';
import assert from 'node:assert/strict';
import { withHubArmoryStorefrontV169 } from '../src/hub-armory-scene-v169.js';
import { getHubRoomServiceDetailPlanV165 } from '../src/hub-room-service-details-v165.js';
import { ARMORY_ART_CANVAS_V169, getArmoryStorefrontPlanV169 } from '../src/hub-armory-storefront-v169.js';

/** This test uses the actual production V165 service plan and actual V169
 * layered draw path. Its minimal recording canvas makes no reference to
 * GitHub's browser fixture or cached screenshot pixels. */
const room = { id: 'armory', xStart: 0 };
const wall = getHubRoomServiceDetailPlanV165(room, {
  spatial: {
    bounds: { x: 0, y: 0, w: 1280, h: 624 },
    planes: { ceilingY: 140, walkY: 624 },
    projection: { kind: '2d', dxPerY: 0 },
    reservations: []
  }, items: []
});
const admitted = () => ({ complete: true,
  naturalWidth: ARMORY_ART_CANVAS_V169.w, naturalHeight: ARMORY_ART_CANVAS_V169.h });
const make = (image = admitted(), details = wall) => {
  const calls = [];
  const ctx = {
    fillStyle: '', globalAlpha: 1,
    save() { calls.push({ type: 'save' }); },
    restore() { calls.push({ type: 'restore' }); },
    drawImage(...args) { calls.push({ type: 'image', args }); },
    beginPath() {}, rect() {}, clip() {},
    fillRect(x, y, w, h) { calls.push({ type: 'rect', color: this.fillStyle, x, y, w, h }); },
    fillText(...args) { calls.push({ type: 'text', args, color: this.fillStyle }); }
  };
  class ExistingHub {
    constructor() { this.animationTime = 12.5; this.reducedMotion = true; this.editorPlaytest = false;
      this.hubRoomLifeRenderedV136 = new Map([['armory', { serviceDetailsV165: details }]]);
      this.armoryStorefrontImagesV169 = new Map([['tantalus', image]]);
    }
    drawRoomModule() { calls.push({ type: 'native' }); return 'existing architecture'; }
  }
  const instance = new (withHubArmoryStorefrontV169(ExistingHub))();
  return { ctx, instance, calls };
};

test('V177 physical rear wall ARM01 is painted AFTER V169 decorative storefront, never hidden behind it', () => {
  assert.equal(wall?.items?.length, 1);
  assert.equal(wall.items[0].code, 'ARM 01');
  const { ctx, instance, calls } = make();
  assert.equal(instance.drawRoomModule(ctx, room, null), 'existing architecture');
  const images = calls.flatMap((entry, i) => entry.type === 'image' ? [i] : []);
  const code = calls.flatMap((entry, i) => entry.type === 'rect'
    && entry.color === '#b1b6a3' && entry.w > 30 ? [i] : []);
  assert.ok(images.length > 0, 'V169 storefront is really painted');
  assert.equal(code.length, 1, 'exactly one V165 code plate is repainted above V169');
  assert.ok(code[0] > images.at(-1), 'native ARM01 must own topmost layer');
  assert.equal(instance.armoryServiceRepaintV177?.paintedIds?.[0], 'armory-wall-service-v165');
});

test('V177 missing art never produces phantom service repaint or any new geometry', () => {
  const { ctx, instance, calls } = make(null);
  assert.equal(instance.drawRoomModule(ctx, room, null), 'existing architecture');
  assert.equal(calls.filter(entry => entry.type === 'image').length, 0);
  assert.equal(calls.filter(entry => entry.type === 'rect').length, 0);
  assert.equal(instance.armoryServiceRepaintV177, undefined);
});

test('V177 rejected original fixture remains rejected, not recreated as a floating prop', () => {
  const plan = { schema:165,roomId:'armory', items:[], omitted:[{
    role:'secure-issue-lighting-and-test-circuit-isolation',
    reason:'occupied-authored-service-bay',intentional:false
  }] };
  const { ctx, instance, calls } = make(admitted(),plan);
  instance.drawRoomModule(ctx, room, null);
  assert.equal(calls.filter(entry=>entry.type==='image').length,
    getArmoryStorefrontPlanV169('armory').assets.length);
  assert.equal(calls.filter(entry=>entry.type==='rect').length,0);
  assert.equal(instance.armoryServiceRepaintV177,undefined);
});

test('V177 unchanged room IDs, art statuses and no collision creation', () => {
  assert.equal(wall.items[0].collidable,false);
  assert.equal(wall.items[0].interactive,false);
  assert.equal(getArmoryStorefrontPlanV169('armory').collision,'none');
  assert.equal(getArmoryStorefrontPlanV169('armory').sourceStatus,
    'project-visual-adaptation-not-1to1');
});
