import test from 'node:test';
import assert from 'node:assert/strict';
import { VEHICLES } from '../src/content-core-v50.js';
import { shouldFlipSprite, SPRITE_GRID } from '../src/sprite-animation-runtime.js';
import {
  VEHICLE_VISUAL_CHASSIS_COUNT,
  VEHICLE_VISUAL_CLIP_SETS,
  VEHICLE_VISUAL_FITS,
  VEHICLE_VISUAL_HITBOXES,
  VEHICLE_VISUAL_KEYS,
  VEHICLE_VISUAL_PROFILE_COUNT,
  VEHICLE_VISUAL_PROFILE_IDS,
  VEHICLE_VISUAL_PROFILES,
  resolveVehicleVisualAnimation,
  resolveVehicleVisualClip,
  resolveVehicleVisualKey,
  resolveVehicleVisualProfile,
  resolveVehicleVisualVariant,
  vehicleVisualCoverageReport
} from '../src/vehicle-visual-runtime-v55.js';

const EXPECTED = Object.freeze({
  m577Command: Object.freeze({ baseId: 'vehicle-002-m577-command-apc', name: 'M577 Command APC', family: 'ground', sheetId: 'vehicle.m577-command-apc.action' }),
  m22a3Jackson: Object.freeze({ baseId: 'vehicle-004-m22a3-jackson-tank', name: 'M22A3 Jackson Tank', family: 'ground', sheetId: 'vehicle.m22a3-jackson-tank.action' }),
  p5000Loader: Object.freeze({ baseId: 'vehicle-007-p-5000-powered-work-loader', name: 'P-5000 Powered Work Loader', family: 'exosuit', sheetId: 'vehicle.p5000-powered-work-loader.action' }),
  ud4lCheyenne: Object.freeze({ baseId: 'vehicle-009-ud-4l-cheyenne-dropship', name: 'UD-4L Cheyenne Dropship', family: 'air', sheetId: 'vehicle.ud4l-cheyenne-dropship.action' })
});

test('le registre v55 expose quatre identités véhicule dédiées et aucune réutilisation générique', () => {
  assert.equal(VEHICLE_VISUAL_CHASSIS_COUNT, 4);
  assert.deepEqual(VEHICLE_VISUAL_KEYS, Object.keys(EXPECTED));
  assert.equal(new Set(Object.values(VEHICLE_VISUAL_PROFILES).map((entry) => entry.sheetId)).size, 4);
  assert.equal(new Set(Object.values(VEHICLE_VISUAL_PROFILES).map((entry) => entry.path)).size, 4);
  for (const [key, expected] of Object.entries(EXPECTED)) {
    const profile = VEHICLE_VISUAL_PROFILES[key];
    assert.equal(profile.catalogBaseId, expected.baseId);
    assert.equal(profile.catalogName, expected.name);
    assert.equal(profile.family, expected.family);
    assert.equal(profile.sheetId, expected.sheetId);
    assert.equal(profile.identityStatus, 'exact');
    assert.equal(profile.identityVerified, true);
    assert.equal(profile.fallbackSheetId, null);
    assert.equal(profile.fallbackReason, null);
    assert.ok(!profile.path.endsWith('/m577-apc-action-sheet.png'), key);
    assert.ok(profile.masterPath.endsWith('-action-sheet.png'), key);
  }
});

test('les 32 profils gardent le bon châssis mais seuls les quatre profils de base sont exacts', () => {
  assert.equal(VEHICLE_VISUAL_FITS.length, 8);
  assert.equal(VEHICLE_VISUAL_PROFILE_COUNT, 32);
  assert.equal(VEHICLE_VISUAL_PROFILE_IDS.length, 32);
  const covered = VEHICLES.filter((vehicle) => Object.values(EXPECTED).some((entry) => vehicle.name === entry.name || vehicle.name.startsWith(`${entry.name} — `)));
  assert.equal(covered.length, 32);

  for (const [key, expected] of Object.entries(EXPECTED)) {
    const variants = covered.filter((vehicle) => vehicle.name === expected.name || vehicle.name.startsWith(`${expected.name} — `));
    assert.equal(variants.length, 8, key);
    assert.deepEqual([...new Set(variants.map((vehicle) => vehicle.fit))], VEHICLE_VISUAL_FITS);
    for (const vehicle of variants) {
      const variant = resolveVehicleVisualVariant(vehicle);
      const profile = resolveVehicleVisualProfile(vehicle);
      assert.equal(resolveVehicleVisualKey(vehicle.id), key, vehicle.id);
      assert.equal(variant.visualKey, key, vehicle.id);
      assert.equal(variant.fit, vehicle.fit, vehicle.id);
      assert.equal(profile.key, key, vehicle.id);
      assert.equal(profile.sheetId, expected.sheetId, vehicle.id);
      const isBase = vehicle.id === expected.baseId;
      assert.equal(profile.identityStatus, isBase ? 'exact' : 'authored-family', vehicle.id);
      assert.equal(profile.approximate, !isBase, vehicle.id);
      assert.equal(profile.profileIdentityVerified, isBase, vehicle.id);
      if (isBase) assert.equal(profile.fallbackReason, null, vehicle.id);
      else assert.match(profile.fallbackReason, /équipements de fit/, vehicle.id);
      assert.equal(profile.fit, vehicle.fit, vehicle.id);
    }
    const inferredRecon = resolveVehicleVisualVariant({ name: expected.name, fit: 'Recon' });
    const catalogRecon = variants.find((vehicle) => vehicle.fit === 'Recon');
    assert.equal(inferredRecon.catalogId, catalogRecon.id, key);
    assert.equal(inferredRecon.catalogName, catalogRecon.name, key);
  }

  const report = vehicleVisualCoverageReport(covered);
  assert.equal(report.total, 32);
  assert.equal(report.dedicated, 32);
  assert.equal(report.unresolved, 0);
  assert.equal(report.exactProfileCount, 4);
  assert.equal(report.familyReuseProfileCount, 28);
  assert.equal(report.missingDedicatedProfileCount, 0);
  assert.equal(report.withoutExactBitmapProfileCount, 28);
  assert.deepEqual(report.byIdentityStatus, {
    exact: 4,
    'authored-family': 28,
    'missing-dedicated-art': 0
  });
  assert.deepEqual(report.byVisualKey, { m577Command: 8, m22a3Jackson: 8, p5000Loader: 8, ud4lCheyenne: 8 });
  assert.equal(report.genericM577Fallbacks, 0);
});

test('chaque plaque est face droite, dimensionnée et possède une hitbox valide', () => {
  for (const profile of Object.values(VEHICLE_VISUAL_PROFILES)) {
    assert.equal(profile.sourceFacing, 1, profile.key);
    assert.equal(shouldFlipSprite(profile, 1), false, profile.key);
    assert.equal(shouldFlipSprite(profile, -1), true, profile.key);
    assert.ok(profile.scale > 0, profile.key);
    assert.ok(profile.drawSize.width >= 150, profile.key);
    assert.ok(profile.drawSize.height >= 140, profile.key);
    assert.equal(profile.renderWidth, profile.drawSize.width);
    assert.equal(profile.renderHeight, profile.drawSize.height);
    assert.deepEqual(profile.pivotPoint, { kind: 'wheel-contact', x: 128, y: 240 });
    const hitbox = VEHICLE_VISUAL_HITBOXES[profile.hitbox];
    assert.equal(profile.hitboxBounds, hitbox);
    assert.ok(hitbox.x >= SPRITE_GRID.guard && hitbox.y >= 0, profile.key);
    assert.ok(hitbox.x + hitbox.width <= SPRITE_GRID.cellWidth - SPRITE_GRID.guard, profile.key);
    assert.ok(hitbox.y + hitbox.height <= SPRITE_GRID.cellHeight - SPRITE_GRID.guard, profile.key);
  }
});

test('les clipsets v55 couvrent exactement les seize cellules et résolvent les quatre états', () => {
  for (const profile of Object.values(VEHICLE_VISUAL_PROFILES)) {
    const clipSet = VEHICLE_VISUAL_CLIP_SETS[profile.clipSet];
    assert.ok(clipSet, profile.key);
    assert.equal(clipSet.clips.length, 4, profile.key);
    assert.deepEqual([...new Set(clipSet.clips.flatMap((clip) => clip.frames))].sort((a, b) => a - b), Array.from({ length: 16 }, (_, index) => index), profile.key);
    for (const clipId of Object.values(profile.clipRoles)) assert.equal(resolveVehicleVisualClip(profile, clipId)?.id, clipId, `${profile.key}:${clipId}`);

    assert.equal(resolveVehicleVisualAnimation(profile).clipId, profile.clipRoles.idle, profile.key);
    assert.equal(resolveVehicleVisualAnimation({ ...profile, vx: 30 }).clipId, profile.clipRoles.move, profile.key);
    assert.equal(resolveVehicleVisualAnimation({ ...profile, actionClock: 0.2 }).clipId, profile.clipRoles.action, profile.key);
    assert.equal(resolveVehicleVisualAnimation({ ...profile, hull: 20, maxHull: 100 }).clipId, profile.clipRoles.damage, profile.key);
    assert.equal(resolveVehicleVisualAnimation({ ...profile, destroyed: true }).clipId, profile.clipRoles.damage, profile.key);
  }
});

test('aucun véhicule inconnu ou M577 voisin ne retombe silencieusement sur le M577 générique', () => {
  const unresolved = [
    VEHICLES.find((vehicle) => vehicle.id === 'vehicle-001-m577-armored-personnel-carrier'),
    VEHICLES.find((vehicle) => vehicle.id === 'vehicle-003-m570-armored-personnel-carrier'),
    { id: 'vehicle-999-unknown-ground-carrier', name: 'Unknown Ground Carrier', family: 'ground' },
    { name: 'M577 Armored Personnel Carrier — Recon', family: 'ground', fit: 'Recon' }
  ];
  for (const source of unresolved) {
    assert.ok(source);
    assert.equal(resolveVehicleVisualKey(source), null);
    assert.equal(resolveVehicleVisualProfile(source), null);
    assert.equal(resolveVehicleVisualAnimation(source), null);
  }
  assert.equal(resolveVehicleVisualProfile({ id: 'vehicle-002-m577-command-apc' }).sheetId, 'vehicle.m577-command-apc.action');
  assert.notEqual(resolveVehicleVisualProfile({ id: 'vehicle-002-m577-command-apc' }).sheetId, 'vehicle.m577-apc.action');
});
