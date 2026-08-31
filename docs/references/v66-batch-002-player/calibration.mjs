// Explain the scale already baked into the atlas; never rescale individual poses here.
export function clipScaleSummary(metadata, clipId) {
  const factor = metadata?.sourceScaleByClip?.[clipId];
  if (typeof factor !== 'number' || !Number.isFinite(factor) || factor <= 0) {
    return 'Facteur interclips : non renseigné';
  }
  const postGeneration = metadata.postGenerationScaleReview?.status === 'reviewed';
  const origin = postGeneration ? 'revue post-génération du profil' : metadata.scaleCalibrationReview ? 'revue de référence' : 'sans calibrage mesuré';
  return `Facteur interclips : ×${factor}\nOrigine : ${origin}`;
}
