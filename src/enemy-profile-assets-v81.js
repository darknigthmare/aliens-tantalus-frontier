const crusherReferences = Object.freeze([
  'https://www.toyark.com/2018/09/24/hiya-toys-aliens-colonial-marines-raven-alien-and-crusher-alien-toyark-photo-shoot-317207'
]);
const spitterReferences = Object.freeze([
  'https://www.square-enix-shop.com/uk/play_arts.html'
]);

// These are accepted original project adaptations normalized from immutable
// OpenAI ImageGen source boards. Acceptance never means official or 1:1 pixels.
// The legacy promptId field exposes only a stable public asset identity.
export const V81_READY_ENEMY_PROFILE_ASSETS = Object.freeze([
  Object.freeze({
    profileId: 'enemy-009-crusher', wave: 'v81',
    path: '/assets/openai/sprites/normalized/enemy-profiles-v81/enemy-009-crusher.webp',
    spriteKey: 'xenoCrusher', clipSet: 'siege-action-v66',
    pivot: 'creature-ground', hitbox: 'enemy-009-crusher-body-v81',
    renderWidth: 320, renderHeight: 320, sourceFacing: 1,
    identityStatus: 'source-locked-project-adaptation', referenceStatus: 'CANON_REFERENCE_ADAPTATION',
    provider: 'openai-imagegen', promptId: 'enemy.profile.enemy-009-crusher.v81',
    referenceUrls: crusherReferences,
    identityVerified: true, reviewStatus: 'accepted', canonExact: false,
    normalizedSha256: 'ccac0fc3ad73aa0c7026ef13acedafe27fba6819d43b3226992406d4787b2e85'
  }),
  Object.freeze({
    profileId: 'enemy-010-spitter', wave: 'v81',
    path: '/assets/openai/sprites/normalized/enemy-profiles-v81/enemy-010-spitter.webp',
    spriteKey: 'xenoSpitter', clipSet: 'enemy-action-v66',
    pivot: 'creature-ground', hitbox: 'enemy-010-spitter-body-v81',
    renderWidth: 240, renderHeight: 240, sourceFacing: 1,
    identityStatus: 'source-locked-project-adaptation', referenceStatus: 'CANON_REFERENCE_ADAPTATION',
    provider: 'openai-imagegen', promptId: 'enemy.profile.enemy-010-spitter.v81',
    referenceUrls: spitterReferences,
    identityVerified: true, reviewStatus: 'accepted', canonExact: false,
    normalizedSha256: 'fc39cbfc4315950e43998c50b5014c6b29a3a912efe855694f7239a48636adea'
  })
]);
