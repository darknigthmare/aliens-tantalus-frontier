import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { VEHICLES } from '../src/content-core-v50.js';
import { resolveVehicleVisualProfileV56 } from '../src/vehicle-visual-overrides-v56.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const gated = [
  {
    id: 'vehicle-003-m570-armored-personnel-carrier',
    name: 'M570 Series APC',
    seats: 13,
    status: 'BLOCKED_NO_PUBLISHED_SILHOUETTE',
    forbiddenAsset: 'm570-series-apc-action-sheet-v56.png'
  },
  {
    id: 'vehicle-006-m292-combat-buggy',
    name: 'M292 Self-Propelled Artillery',
    seats: 6,
    status: 'BLOCKED_SINGLE_LEFT_PROFILE',
    forbiddenAsset: 'm292-self-propelled-artillery-action-sheet-v56.png'
  },
  {
    id: 'vehicle-011-ad-19cd-dropship',
    name: 'AD-19D Bearcat VTOL Strikeship',
    seats: 4,
    status: 'BLOCKED_VARIANT_AND_REAR_GEOMETRY_UNRESOLVED',
    forbiddenAsset: 'ad-19d-bearcat-action-sheet-v56.png'
  }
];

test('v56 preserves save IDs while correcting the three misleading vehicle records', () => {
  for (const expected of gated) {
    const vehicle = VEHICLES.find((entry) => entry.id === expected.id);
    assert.ok(vehicle, expected.id);
    assert.equal(vehicle.name, expected.name);
    assert.equal(vehicle.seats.length, expected.seats);
    assert.equal(vehicle.referenceStatus, 'CANON_REFERENCE');
    assert.equal(vehicle.visualStatus, expected.status);
    assert.ok(vehicle.legacyCatalogName);
  }
});

test('v56 does not claim exact sheets for canon vehicles with insufficient geometry', () => {
  for (const expected of gated) {
    const vehicle = VEHICLES.find((entry) => entry.id === expected.id);
    const visual = resolveVehicleVisualProfileV56(vehicle);
    assert.equal(visual, null);
    assert.equal(existsSync(path.join(projectRoot, 'assets', 'openai', 'sprites', 'vehicles', expected.forbiddenAsset)), false);
  }
});
