import test from 'node:test';
import assert from 'node:assert/strict';
import { getCatalogGameplayScaleV72, getCatalogMarineReferenceV72 } from '../src/catalog-scale-v72.js';
import { getCatalogEntryV62, getHumanSizeComparisonV62 } from '../src/catalog-runtime-v62.js';

test('V72 facehugger and queen use one world scale, never individual square fitting', () => {
  const face = getCatalogGameplayScaleV72(getCatalogEntryV62('enemy-002-facehugger').visual, 0.5);
  const queen = getCatalogGameplayScaleV72(getCatalogEntryV62('enemy-008-queen').visual, 0.5);
  assert.equal(face.width, 56);
  assert.equal(face.height, 36);
  assert.equal(queen.width, 224);
  assert.equal(queen.height, 170);
  assert.equal(queen.height / face.height, 340 / 72);
  assert.notEqual(face.width, face.height, 'the facehugger must not be stretched to a square');
  assert.equal(face.groundOffset, face.height / 16);
  assert.equal(queen.groundOffset, queen.height / 16);
});

test('V72 catalogue dimensions are renderer pixels, never fabricated canon metres', () => {
  const marine = getCatalogGameplayScaleV72(getCatalogMarineReferenceV72(), 0.65);
  assert.equal(marine.worldHeight, 148);
  assert.equal(marine.source, 'runtime-render-dimensions-not-canon-metres');
  assert.equal(getHumanSizeComparisonV62('enemy-008-queen'), null);
  assert.equal(getCatalogGameplayScaleV72(null), null);
  assert.equal(getCatalogGameplayScaleV72(getCatalogMarineReferenceV72(), -1), null);
  assert.equal(getCatalogEntryV62('enemy-002-facehugger').visual.renderHeight, 72);
});
