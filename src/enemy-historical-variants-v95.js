/** Optional art overlays, never replacement roster/caste identities.
 * The named Grey/Purple colours are documented by Xenopedia's Arachnoid page;
 * these project images and all combat tuning remain fan-made adaptations. */
export const ARACHNOID_PROFILE_ID_V95 = 'castes-game_avp_capcom_arachnoid';
export const ARACHNOID_VARIANT_REFERENCE_V95 = Object.freeze({
  url: 'https://avp.fandom.com/wiki/Arachnoid', checkedAt: '2026-09-26',
  verification: 'search-index-page-content; direct page returned HTTP 402',
  note: 'Grey (bleu-gris) et Purple : deux couleurs de la même caste. Aucun pouvoir ni avantage de statistiques ajouté.',
  canonExact: false
});
export const ENEMY_HISTORICAL_VARIANTS_V95 = Object.freeze({
  [ARACHNOID_PROFILE_ID_V95]: Object.freeze({
    defaultStateId: 'grey', baseStateLabel: 'Grey — bleu-gris',
    reference: ARACHNOID_VARIANT_REFERENCE_V95,
    states: Object.freeze([
      Object.freeze({ id: 'grey', stateId: 'grey', label: 'Grey — bleu-gris',
        path: '/assets/user/castes-v87/game_avp_capcom_arachnoid.png',
        filename: 'game_avp_capcom_arachnoid.png', imageKey: 'user-caste:game_avp_capcom_arachnoid',
        sourceWidth: 1536, sourceHeight: 1024, sourceFacing: 1,
        sha256: '84f47e12acfa88b5658a736863e4ad8b61a9b43bfa5cb61a34abe87649b2e3ee',
        alphaBounds: Object.freeze([207, 15, 1428, 1021]),
        reviewStatus: 'accepted', assetVerificationStatus: 'sha256-dimensions-alpha-verified',
        qualification: 'Historical static fan-made adaptation; white/checker/black composite reviewed, no animation claim.',
        provenance: 'fan-made-user-import-unchanged', canonExact: false }),
      Object.freeze({ id: 'purple', stateId: 'purple', label: 'Purple — violet',
        path: '/assets/openai/sprites/static-enemy-v95/arachnoid-purple-v95.png',
        filename: 'arachnoid-purple-v95.png', imageKey: 'user-caste:game_avp_capcom_arachnoid:purple-v95',
        sourceWidth: 1536, sourceHeight: 1024, sourceFacing: 1,
        sha256: '3d43d7bd98a470605ecb17d45ed11c7455bd4b160748515f32760fcdba679a72',
        alphaBounds: Object.freeze([206, 15, 1429, 1021]),
        reviewStatus: 'accepted-static-adaptation', assetVerificationStatus: 'sha256-dimensions-alpha-verified',
        qualification: 'Native static palette adaptation; white/checker/black composite reviewed, original tight framing preserved; not an exact Capcom sprite.',
        provenance: 'openai-native-palette-edit-from-historical-grey', canonExact: false })
    ])
  })
});
