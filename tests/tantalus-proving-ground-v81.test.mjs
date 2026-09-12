import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PROVING_GROUND_AIM_VECTORS_V81,
  PROVING_GROUND_FIRING_PAD_V81,
  PROVING_GROUND_TARGETS_V81,
  PROVING_GROUND_WORLD_V81,
  getProvingGroundAimVectorV81,
  getProvingGroundTargetV81,
  validateProvingGroundLayoutV81
} from '../src/tantalus-proving-ground-v81.js';

test('le parcours V81 expose exactement neuf cibles déterministes sur trois hauteurs', () => {
  assert.equal(PROVING_GROUND_TARGETS_V81.length, 9);
  assert.deepEqual(PROVING_GROUND_TARGETS_V81.map((target) => target.order), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(
    PROVING_GROUND_TARGETS_V81.reduce((lanes, target) => ({
      ...lanes,
      [target.lane]: (lanes[target.lane] || 0) + 1
    }), {}),
    { level: 3, high: 3, low: 3 }
  );
  assert.equal(new Set(PROVING_GROUND_TARGETS_V81.map((target) => target.id)).size, 9);
  assert.equal(validateProvingGroundLayoutV81().valid, true);
});
test('les neuf hitboxes restent dans le stand et sur leur rayon de tir canonique', () => {
  for (const target of PROVING_GROUND_TARGETS_V81) {
    const { bounds } = target;
    assert.ok(bounds.x >= 0 && bounds.y >= 0, target.id);
    assert.ok(bounds.x + bounds.w <= PROVING_GROUND_WORLD_V81.width, target.id);
    assert.ok(bounds.y + bounds.h <= PROVING_GROUND_WORLD_V81.floorY, target.id);
    const vector = getProvingGroundAimVectorV81(target.lane);
    assert.ok(Math.abs(Math.hypot(vector.x, vector.y) - 1) < 1e-12, target.id);
    const centerX = bounds.x + bounds.w / 2;
    const centerY = bounds.y + bounds.h / 2;
    const rayY = PROVING_GROUND_FIRING_PAD_V81.muzzle.y
      + (centerX - PROVING_GROUND_FIRING_PAD_V81.muzzle.x) * vector.y / vector.x;
    assert.ok(Math.abs(centerY - rayY) <= 1, target.id);
    assert.equal(getProvingGroundTargetV81(target.id), target);
  }
  assert.ok(PROVING_GROUND_FIRING_PAD_V81.x >= 740);
  assert.ok(PROVING_GROUND_FIRING_PAD_V81.x + PROVING_GROUND_FIRING_PAD_V81.w <= 1160);
  assert.equal(PROVING_GROUND_FIRING_PAD_V81.surfaceY, 468);
});

test('les tirs haut, horizontal et bas sont normalisés sans modifier le contrat gelé', () => {
  assert.ok(getProvingGroundAimVectorV81('high').y < 0);
  assert.equal(getProvingGroundAimVectorV81('level').y, 0);
  assert.ok(getProvingGroundAimVectorV81('low').y > 0);
  assert.ok(getProvingGroundAimVectorV81('high', -1).x < 0);
  assert.ok(Object.isFrozen(PROVING_GROUND_TARGETS_V81));
  assert.ok(PROVING_GROUND_TARGETS_V81.every((target) => Object.isFrozen(target) && Object.isFrozen(target.bounds)));
  assert.ok(Object.isFrozen(PROVING_GROUND_AIM_VECTORS_V81));

  const forged = [...PROVING_GROUND_TARGETS_V81.slice(0, 8)];
  assert.equal(validateProvingGroundLayoutV81(forged).valid, false);
  assert.ok(validateProvingGroundLayoutV81(forged).errors.includes('target-count'));
});
