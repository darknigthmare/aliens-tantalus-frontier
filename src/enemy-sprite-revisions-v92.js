/** Reviewed visual-only revisions. Original user PNGs remain immutable. */
export const ENEMY_SPRITE_REVISIONS_V92 = Object.freeze([
  Object.freeze({
    profileId: 'castes-game_avp_capcom_smasher',
    path: '/assets/openai/sprites/static-enemy-v92/game_avp_capcom_smasher.png',
    imageKey: 'openai-static-v92:game_avp_capcom_smasher',
    sourceWidth: 1536, sourceHeight: 1024,
    renderWidth: 318, renderHeight: 212,
    pivot: Object.freeze({ x: .60, y: 894 / 1024 }), sourceFacing: 1,
    identityStatus: 'reference-guided-static-pose',
    provenance: 'openai-integrated-reference-guided',
    reviewStatus: 'accepted-static-adaptation',
    assetVerificationStatus: 'sha256-dimensions-alpha-verified',
    identityVerified: false, canonExact: false,
    visualRevision: 92,
    sha256: '0efaa9b6afe6f817567725d7aae0b57c15093d1f68a8e480bb34ede566c7dee8',
    referenceUrls: Object.freeze(['https://www.spriters-resource.com/arcade/alienvspredator/asset/52835/']),
    referenceNote: 'Pose comparée aux sprites du jeu Capcom 1994, conservés dans une archive secondaire. Côtes crâniennes présentes mais moins saillantes ; adaptation fan-made, pas extraction originale ni certification 1:1.'
  })
]);
const BY_ID = new Map(ENEMY_SPRITE_REVISIONS_V92.map(revision => [revision.profileId, revision]));

/** Never alter identity, combat values, collision, encounter selection or save keys. */
export function applyEnemySpriteRevisionV92(definition) {
  const revision = BY_ID.get(definition?.id);
  if (!revision) return definition;
  return Object.freeze({ ...definition, ...revision,
    originalPath: definition.path, originalImageKey: definition.imageKey,
    originalProvenance: definition.provenance
  });
}
