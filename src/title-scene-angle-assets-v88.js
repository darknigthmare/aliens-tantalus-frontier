// Only genuinely authored and visually reviewed camera views may be registered.
// Side-profile scaling or mirroring is not a new camera angle.
// V90 entries are reference-reviewed fan-made reconstructions, not canon-exact scans.
const nativeViewV90 = (shipId, angleId, basename, sha256, referenceUrls) => Object.freeze({
  id: `orbitals-${shipId}-${angleId}-v90`, runtimeId: `title.v90.ship.${shipId}.${angleId}`,
  shipId, angleId, src: `/assets/openai/ui/title/v90/orbitals/${basename}.png`, sha256,
  sourceWidth: 1536, sourceHeight: 1024,
  hullRegistration: Object.freeze({ x: 0, y: 0, width: 1536, height: 1024, sourceWidth: 1536, sourceHeight: 1024 }),
  namePlate: null, status: 'ready', viewAuthorship: 'native-authored-angle',
  fidelityStatus: 'fan-made-reference-reviewed', canonExact: false,
  provenance: Object.freeze({ generator: 'integrated-imagegen', reviewedAt: '2026-09-23',
    pixelPolicy: 'native-unchanged', referenceUrls: Object.freeze(referenceUrls) })
});

export const TITLE_SHIP_ANGLE_ASSETS_V88 = Object.freeze([
  nativeViewV90('uss-sulaco', 'rear-quarter', 'uss-sulaco-rear-quarter',
    'd51ae784410770796eac90f74e91e8a21953e0dd6e9b3e40137033c739a37ec4',
    ['https://modelermagic.com/wp-content/uploads/2009/02/kg_sulaco-studio-model-001.jpg',
      'https://modelermagic.com/wp-content/uploads/2009/02/kg_sulaco-studio-model-006.jpg',
      'https://modelermagic.com/wp-content/uploads/2009/02/kg_sulaco-studio-model-045.jpg']),
  nativeViewV90('narcissus', 'front-quarter', 'narcissus-front-quarter',
    '45c5e7ec10d2a172b1d384ecb915df9eec44957d6d6094c46f2188bc2678de4d',
    ['https://dennisvideo1138-1a506.kxcdn.com/Alien/Narcissus%20front.jpg',
      'https://dennisvideo1138-1a506.kxcdn.com/Alien/Narcissus%20side.jpg']),
  nativeViewV90('narcissus', 'side-quarter', 'narcissus-side-depth',
    'e3c5f824755e64f2d6f1fb68cea04551616b29286832a43286667e1004d4b88f',
    ['https://dennisvideo1138-1a506.kxcdn.com/Alien/Narcissus%20front.jpg',
      'https://dennisvideo1138-1a506.kxcdn.com/Alien/Narcissus%20side.jpg']),
  nativeViewV90('uscss-nostromo', 'front-quarter', 'nostromo-threequarter',
    '19962822bb10544e474ac75746cc6d3ce5180d5ac4832d5c14b8596af63b0998',
    ['https://dennisvideo1138-1a506.kxcdn.com/Alien/Nostromo%20Simon%20Deering%20shot.jpg'])
]);
