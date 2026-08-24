import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import test from 'node:test';

import { VEHICLES } from '../src/content.js';
import { getV55VehiclePhysicalProfile } from '../src/game-v52-runtime.js';
import {
  SPRITE_CLIP_SETS,
  SPRITE_GRID,
  SPRITE_HITBOXES,
  SPRITE_SHEETS,
  resolveVehicleAnimation
} from '../src/sprite-animation-runtime.js';
import {
  VEHICLE_VISUAL_CHASSIS_COUNT_V56,
  VEHICLE_VISUAL_FITS_V56,
  VEHICLE_VISUAL_PROFILE_COUNT_V56,
  VEHICLE_VISUAL_PROFILES_V56,
  resolveVehicleVisualProfileV56
} from '../src/vehicle-visual-overrides-v56.js';

const localPath = (webPath) => `.${webPath}`;
const baseId = (profile) =>
  `vehicle-${String(profile.baseNumber).padStart(3, '0')}-${profile.catalogSlug}`;

test('the twenty-eight v56 chassis resolve to dedicated verified sheets and four runtime states', async () => {
  assert.equal(VEHICLE_VISUAL_CHASSIS_COUNT_V56, 28);
  assert.equal(VEHICLE_VISUAL_PROFILE_COUNT_V56, 224);
  assert.equal(VEHICLE_VISUAL_FITS_V56.length, 8);

  const sheetIds = new Set();
  for (const profile of Object.values(VEHICLE_VISUAL_PROFILES_V56)) {
    const vehicle = VEHICLES.find((entry) => entry.id === baseId(profile));
    assert.ok(vehicle, baseId(profile));

    const visual = resolveVehicleVisualProfileV56(vehicle);
    assert.ok(visual, vehicle.id);
    const canonExact = profile.referenceStatus === 'CANON_REFERENCE';
    const expectedIdentity = canonExact ? 'exact'
      : profile.referenceStatus === 'PROJECT_ORIGINAL' ? 'project-original' : 'project-adaptation';
    assert.equal(visual.identityStatus, expectedIdentity);
    assert.equal(visual.identityVerified, true);
    assert.equal(visual.canonExact, canonExact);
    assert.equal(visual.referenceStatus, profile.referenceStatus);
    assert.equal(visual.approximate, false);
    assert.equal(visual.sheetId, profile.sheetId);

    const sheet = SPRITE_SHEETS[profile.sheetId];
    assert.ok(sheet, profile.sheetId);
    assert.equal(sheet.family, 'vehicle');
    assert.equal(sheet.clipSet, 'vehicle-action-v56');
    assert.ok(SPRITE_HITBOXES[sheet.hitbox]);
    assert.deepEqual(
      SPRITE_CLIP_SETS[sheet.clipSet].map((clip) => clip.id),
      ['idle', 'move', 'action', 'damage']
    );
    await access(localPath(profile.rawPath));
    await access(localPath(profile.path));

    assert.equal(resolveVehicleAnimation(vehicle).clipId, 'idle');
    assert.equal(resolveVehicleAnimation({ ...vehicle, vx: 20 }).clipId, 'move');
    assert.equal(resolveVehicleAnimation({ ...vehicle, actionClock: 0.3 }).clipId, 'action');
    assert.equal(resolveVehicleAnimation({ ...vehicle, destroyed: true }).clipId, 'damage');
    sheetIds.add(profile.sheetId);
  }
  assert.equal(sheetIds.size, 28);
});

test('fit variants are explicit authored-family reuse while fake ids cannot borrow reference names', () => {
  for (const profile of Object.values(VEHICLE_VISUAL_PROFILES_V56)) {
    const reconId = `vehicle-${String(profile.baseNumber + 36).padStart(3, '0')}-${profile.catalogSlug}-recon`;
    const vehicle = VEHICLES.find((entry) => entry.id === reconId);
    assert.ok(vehicle, reconId);
    const visual = resolveVehicleVisualProfileV56(vehicle);
    assert.equal(visual.identityStatus, 'authored-family');
    assert.equal(visual.identityVerified, false);
    assert.equal(visual.approximate, true);
    assert.match(visual.fallbackReason, /reuses the dedicated/);
    assert.equal(resolveVehicleAnimation(vehicle).sheetId, profile.sheetId);
  }

  assert.equal(resolveVehicleVisualProfileV56({
    id: 'vehicle-999-faux',
    name: 'M40 Ridgeway Heavy Tank'
  }), null);
  assert.equal(resolveVehicleAnimation({
    id: 'vehicle-999-faux',
    name: 'M40 Ridgeway Heavy Tank'
  }), null);
});

test('all twenty-eight v56 sheets drive physical dimensions from their dedicated hitboxes', () => {
  for (const profile of Object.values(VEHICLE_VISUAL_PROFILES_V56)) {
    const vehicle = VEHICLES.find((entry) => entry.id === baseId(profile));
    const physical = getV55VehiclePhysicalProfile(vehicle);
    assert.ok(physical, vehicle.id);
    assert.equal(physical.sheetId, profile.sheetId);
    assert.equal(physical.hitboxId, profile.hitbox);
    const hitbox = SPRITE_HITBOXES[profile.hitbox];
    assert.equal(physical.width, hitbox.width * profile.renderWidth / SPRITE_GRID.cellWidth);
    assert.equal(physical.height, hitbox.height * profile.renderHeight / SPRITE_GRID.cellHeight);
    assert.ok(physical.width > 70, vehicle.id);
    assert.ok(physical.height > 30, vehicle.id);
  }
});
