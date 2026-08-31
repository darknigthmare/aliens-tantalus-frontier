// Cette liste est remplie par le pipeline d'acceptation V65 seulement après
// génération, contrôle de la grille déclarée et enregistrement de sa provenance.
// Garder une entrée absente signifie explicitement « art en attente » : le
// runtime conserve alors le profil visuel V64/V56/V55 existant.
export const V65_READY_ENEMY_PROFILE_ASSETS = Object.freeze([
  Object.freeze({
    profileId: 'enemy-002-facehugger',
    path: '/assets/openai/sprites/normalized/enemy-profiles-v65/enemy-002-facehugger.webp',
    spriteKey: 'facehugger',
    clipSet: 'facehugger-action-v65',
    grid: Object.freeze({ columns: 4, rows: 8, cellWidth: 256, cellHeight: 256 }),
    pivot: 'creature-ground',
    hitbox: 'facehugger-ground',
    renderWidth: 112,
    renderHeight: 72,
    sourceFacing: 1,
    identityStatus: 'source-locked-adaptation',
    referenceStatus: 'CANON_REFERENCE_ADAPTATION',
    provider: 'openai-imagegen',
    promptId: 'V65_FACEHUGGER_IMAGEGEN',
    referenceUrls: Object.freeze(['https://necaonline.com/2016/05/aliens-foam-prop-replica-life-size-facehugger/']),
    identityVerified: true
  })
]);
