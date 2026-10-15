import { getPlayerColonialTorsoV129 } from './player-colonial-art-v129.js';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const point = (x, y) => ({ x, y });

/** A bounded imagegen edit of the V129 Hudson torso. The historical source
 * documents twelve calendar cells; no reference photograph is available in
 * this environment. Placement, paint, inscriptions and wearer insignia remain
 * UNVERIFIED. This original PNG does not establish an exact film costume. */
export const PLAYER_COLONIAL_REFERENCES_V141 = freeze([
  { id: 'harris-bdu-historical-v141', kind: 'historical-documentation-metadata',
    url: 'https://harryharris.com/bdu.htm', imageAvailable: false,
    verification: 'UNVERIFIED', documentedFeature: 'Calendar: three columns, four rows.',
    limitation: 'Inherited V129 documentation only; no source photo or HTTP verification acquired.' },
  { id: 'hudson-v129-native-art', kind: 'existing-generated-adaptation',
    paths: ['/assets/openai/sprites/player/colonial-v129/uscm-torso-right-v129.png',
      '/assets/openai/sprites/player/colonial-v129/uscm-torso-left-v129.png'],
    verification: 'inspected-native-sprite',
    limitation: 'Game artwork is a style/layout reference, not evidence of film accuracy.' }
]);

export const PLAYER_COLONIAL_RIG_ASSETS_V141 = freeze([{
  id: 'player.echo9-marine.colonial-v141.hudson-torso-candidate',
  kind: 'hudson-torso-candidate', rigType: 'echo9',
  imageKey: 'playerColonialHudsonTorsoCandidateV141',
  path: '/assets/openai/sprites/player/v141/hudson-torso-candidate-v141.png',
  sourceWidth: 1536, sourceHeight: 1024, width: 1536, height: 1024,
  sha256: '7089fb04de1587661f6bb53a89647cdd6fe01d0e183e4da0191a87165dfb43de',
  exact: false, sourceWork: 'Aliens (1986)', provenance: 'existing-game-art-adaptation',
  visualStatus: 'documented-feature-adaptation-unverified-placement',
  admission: 'reviewed-adapted-variant', sourceFacing: 0,
  imageEditsAfterGeneration: false,
  unverified: ['reference-photograph', 'calendar-placement', 'paint-colors',
    'all-inscription-shapes', 'wearer-insignia', 'screen-used-costume-identity']
}]);
const asset = PLAYER_COLONIAL_RIG_ASSETS_V141[0];
const torso = (bounds, near, far, waist, neckAperture, armAperture) => ({ asset, part: {
  // Bounds measured at alpha >= 128 in the unmodified original RGBA PNG.
  // The crop includes three native pixels of antialiasing margin. It does not
  // assume equally sized imagegen cells or resample a source image.
  alphaBounds: bounds, alphaBoundsThreshold: 128, width: bounds[2] - bounds[0],
  source: { x: bounds[0] - 3, y: bounds[1] - 3,
    width: bounds[2] - bounds[0] + 6, height: bounds[3] - bounds[1] + 6 },
  joints: { near: point(...near), far: point(...far), waist: point(...waist) },
  apertures: { neck: point(...neckAperture), arm: point(...armAperture) },
  pivotMethod: 'V129 corresponding anatomical landmarks normalized within measured native silhouette',
  pivotStatus: 'corresponding-anatomical-landmarks'
} });
/** This module intentionally adds a separate ID. V129 presets and their five
 * canonical PNGs are retained; the shared resolver admits the adapted variant. */
export const PLAYER_COLONIAL_TORSOS_V141 = freeze({
  'torso-hudson-calendar-v141': {
    right: {
      upright: torso([30,11,505,471], [120.086,214.224], [432.658,184.015], [283.879,433.925], [315,60], [98,200]),
      forward: torso([562,23,1049,484], [651.563,227.889], [966.405,204.354], [816.707,446.622], [870,75], [644,221]),
      compact: torso([1075,77,1525,501], [1159.202,255.598], [1449.080,222.878], [1306.902,458.736], [1360,125], [1160,278])
    },
    left: {
      upright: torso([40,500,528,955], [448.788,699.159], [105.067,672.768], [283.293,918.072], [240,550], [430,690]),
      forward: torso([547,511,1027,965], [945.358,711.725], [617.381,690.170], [784.889,928.626], [710,575], [936,702]),
      compact: torso([1053,553,1512,978], [1432.584,741.443], [1122.994,717.387], [1287.211,940.579], [1220,605], [1426,754])
    }
  }
});
export const getPlayerColonialTorsoV141 = (id, facing = 1, family = 'upright') =>
  PLAYER_COLONIAL_TORSOS_V141[id]?.[facing < 0 ? 'left' : 'right']?.[family] || null;
export const getPlayerColonialTorsoWithVariantsV141 = (id, facing = 1, family = 'upright') =>
  getPlayerColonialTorsoV141(id, facing, family) || getPlayerColonialTorsoV129(id, facing, family);
