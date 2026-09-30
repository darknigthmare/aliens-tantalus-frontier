import { applyEnemySpriteRevisionV92 } from './enemy-sprite-revisions-v92.js';

/** One reviewed native pose; immutable user originals and gameplay values are preserved. */
export const ENEMY_SPRITE_REVISIONS_V93 = Object.freeze([
  Object.freeze({
    profileId: 'castes-game_avp_capcom_chrysalis',
    path: '/assets/openai/sprites/static-enemy-v93/game_avp_capcom_chrysalis.png',
    imageKey: 'openai-static-v93:game_avp_capcom_chrysalis',
    sourceWidth: 1536, sourceHeight: 1024,
    renderWidth: 384, renderHeight: 256,
    pivot: Object.freeze({ x: .64, y: 851 / 1024 }), sourceFacing: 1,
    identityStatus: 'reference-guided-static-pose',
    provenance: 'openai-integrated-reference-guided',
    reviewStatus: 'accepted-static-adaptation',
    assetVerificationStatus: 'sha256-dimensions-alpha-verified',
    identityVerified: false, canonExact: false,
    visualRevision: 93,
    sha256: '616aeca6329e615cd42be6324d50de450d22b62d8950c7891acaf56e4a70abb7',
    referenceUrls: Object.freeze([
      'https://www.spriters-resource.com/arcade/alienvspredator/asset/55354/',
      'https://necaonline.com/2017/07/alien%e2%80%8b-vs-predator%e2%80%8b-arcade-appearance-aliens-assortment/'
    ]),
    referenceNote: 'Nouvelle pose comparée aux sprites Capcom 1994 : carapace or, corps gris-vert et genoux sans trou de figurine. NECA Arcade Appearance utilisé comme référence secondaire. Adaptation fan-made, pas extraction ni certification 1:1.'
  })
]);
const BY_ID = new Map(ENEMY_SPRITE_REVISIONS_V93.map(revision => [revision.profileId, revision]));

/** Exact IDs only. Earlier admitted revisions keep their own receipt and cache key. */
export function applyEnemySpriteRevisionV93(definition) {
  const revision = BY_ID.get(definition?.id);
  if (!revision) return applyEnemySpriteRevisionV92(definition);
  return Object.freeze({ ...definition, ...revision,
    originalPath: definition.path, originalImageKey: definition.imageKey,
    originalProvenance: definition.provenance
  });
}
