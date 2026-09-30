import { USER_REFERENCE_ART_V95 } from './user-reference-art-v95.js';
/** Equipment identities remain separate from the four corresponding human-enemy profiles. */
export const USER_EQUIPMENT_ART_V95 = Object.freeze(USER_REFERENCE_ART_V95
  .filter(art => [2, 3, 4, 28, 29, 30, 31].includes(art.sourceNumber))
  .map(art => Object.freeze({
    ...art, id: 'item-v95-user-' + art.slug,
    profileId: art.kind === 'armor' ? 'pose-v95-user-' + art.slug : null,
    reviewStatus: 'accepted-static-adaptation',
    assetVerificationStatus: 'sha256-dimensions-alpha-verified',
    provenance: 'user-provided-reference-openai-integrated', sourceProvenance: 'user-provided',
    animationStatus: 'missing', visualMode: 'static-pose', canonExact: false, identityVerified: false,
    referenceUrls: Object.freeze([])
  })));
