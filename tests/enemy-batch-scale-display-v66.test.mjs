import test from 'node:test';
import assert from 'node:assert/strict';
import { clipScaleSummary } from '../docs/references/v66-batch-002-player/calibration.mjs';

test('review player exposes the baked per-clip calibration without claiming acceptance', () => {
  const metadata = {sourceScaleByClip:{idle:1,attack:1.858278},postGenerationScaleReview:{status:'reviewed'}};
  assert.match(clipScaleSummary(metadata,'attack'), /×1\.858278/);
  assert.match(clipScaleSummary(metadata,'idle'), /×1\nOrigine : revue post-génération du profil/);
  assert.doesNotMatch(clipScaleSummary(metadata,'attack'), /accepté|intégré/);
  assert.equal(metadata.sourceScaleByClip.attack,1.858278);
});

test('review player does not invent a calibration for legacy or unknown clips', () => {
  assert.match(clipScaleSummary({sourceScaleByClip:{idle:1}},'idle'), /sans calibrage mesuré/);
  assert.match(clipScaleSummary({sourceScaleByClip:{attack:2},scaleCalibrationReview:{}},'attack'), /revue de référence/);
  for (const factor of [undefined,null,'1',0,-1,NaN,Infinity]) {
    assert.equal(clipScaleSummary({sourceScaleByClip:{idle:factor}},'idle'),'Facteur interclips : non renseigné');
  }
});
