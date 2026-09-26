import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { ENEMY_EXPANSION_ASSETS_V96 as POSES } from '../src/enemy-expansion-assets-v96.js';
import { ENEMY_EXPANSION_CANDIDATES_V96 as CANDIDATES } from '../src/enemy-expansion-candidates-v96.js';
import { ENEMY_STATIC_POSES_V95 } from '../src/enemy-static-poses-v95.js';
import { auditPngBuffer } from '../docs/references/v91-enemy-only/audit-candidate-png.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
test('V96 only admits two measured expansion images, leaving research candidates passive', () => {
  assert.deepEqual(POSES.map(d => d.id), ['pose-v96-film-hammerpede', 'pose-v96-kenner-mantis']);
  for (const d of POSES) {
    assert.ok(CANDIDATES.some(c => c.id === d.id && c.runtimeActive === false && !c.path));
    assert.equal(ENEMY_STATIC_POSES_V95.some(p => p.id === d.id), false);
    assert.equal(d.id, d.profileId);
    assert.equal(d.canonExact, false); assert.equal(d.identityVerified, false);
    assert.equal(d.animationStatus, 'missing'); assert.equal(d.visualMode, 'static-pose');
    assert.equal(d.locomotion, 'ground'); assert.equal(d.automaticEncounter, false);
    assert.equal(Object.isFrozen(d), true); assert.equal(Object.isFrozen(d.pivot), true);
    assert.ok(d.bodyWidth > 0 && d.bodyHeight > 0 && d.bodyWidth < d.renderWidth);
    assert.ok(d.bodyHeight < d.renderHeight);
    assert.ok(Math.abs(d.renderWidth / d.renderHeight - d.sourceWidth / d.sourceHeight) < 1e-12);
    assert.ok(d.pivot.x > 0 && d.pivot.x < 1);
    assert.equal(d.pivot.y, d.alphaBounds[3] / d.sourceHeight);
    assert.ok(d.referenceNote.includes('1:1'));
    assert.ok(d.referenceUrls.some(u => u.includes('necaonline.com')));
  }
  assert.equal(POSES[0].biology, 'pathogen'); assert.equal(POSES[0].encounterGroup, 'engineer');
  assert.equal(POSES[1].group, 'Figurines'); assert.equal(POSES[1].encounterGroup, 'engineered');
});

for (const d of POSES) test(`V96 ${d.name}: native bytes, real alpha, geometry and exact private receipt`, async () => {
  const bytes = await readFile(join(root, d.path));
  const a = auditPngBuffer(bytes);
  const receipt = JSON.parse(await readFile(join(root, `docs/references/v96-xeno-trials/generation-${d.id}.json`), 'utf8'));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), d.sha256);
  assert.equal(a.width, d.sourceWidth); assert.equal(a.height, d.sourceHeight);
  assert.deepEqual(a.bboxAlphaAtLeast16, d.alphaBounds);
  assert.equal(a.alphaMin, 0); assert.ok(a.alphaMax >= 240);
  assert.ok(a.alpha0 / a.totalPixels > .25 && a.alpha0 / a.totalPixels < .95);
  for (const margin of Object.values(a.marginsAlphaAtLeast16)) assert.ok(margin >= 6);
  assert.equal(receipt.output.sha256, d.sha256);
  assert.deepEqual(receipt.output.transforms, []);
  assert.equal(receipt.output.copiedByteIdentical, true);
  assert.equal(receipt.transparentBackground, true);
  assert.equal(receipt.runtimeContract.animation, false);
  assert.ok(receipt.prompt.length > 500);
  assert.equal(createHash('sha256').update(receipt.prompt).digest('hex'), receipt.promptSha256);
  assert.ok(receipt.visualReferences.inspectedUrls.length > 0);
});
