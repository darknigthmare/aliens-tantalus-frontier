// Native, reviewed RGBA cells. Presentation only; the existing stills and
// combat colliders remain the source of identity and physical simulation.
const cell = (index, bounds, hipX) => ({
  id: `walk-${index}`, rect: [index % 2 * 627, Math.floor(index / 2) * 627, 627, 627],
  alphaBounds: bounds, pivot: { x: hipX / 627, y: bounds[3] / 627 }
});
const pose = (name, profileId, sha256, sourcePoseSha256, sourceFacing, referenceHeight, bounds, hips) => ({
  id: `animation-v122-${name}-walk`, profileId,
  path: `/assets/openai/sprites/animated-import-v122/${name}-walk.png`,
  sha256, sourcePoseSha256, sourceWidth: 1254, sourceHeight: 1254,
  sourceFacing, referenceHeight, reviewStatus: 'accepted-multi-pose-adaptation',
  posesVerified: true, alphaVerified: true, alphaBoundsThreshold: 16,
  label: 'Marche : 4 poses adaptées ; autres actions fixes', canonExact: false,
  reviewNote: 'Quatre silhouettes de marche distinctes adaptées du visuel projet ; appuis et phases approximatifs, pas une animation complète ni une fidélité canonique 1:1 certifiée. Blanc/noir/bleu/damier contrôlés ; aucun pixel transformé après génération.',
  frames: bounds.map((b, i) => cell(i, b, hips[i])),
  clips: { move: { frames: ['walk-0', 'walk-1', 'walk-2', 'walk-3'], fps: 6, loop: true } }
});
export const ENEMY_IMPORT_ANIMATION_DATA_V122 = [
  pose('synth-incinerator', 'pose-v110-afe-synth-incinerator',
    '70cb1a78b6abdc1821192b16028e4021dc7f3380b566e6aec8174635b921fc8f',
    '003f9f4c65c2c7ff4f32c0f82bfc8b08ad19ab8893f1abaa6fd27f628db92318', 1, 596,
    [[105,21,624,626],[105,19,596,618],[84,10,622,600],[108,9,606,598]], [325,329,330,342]),
  pose('synth-containment', 'pose-v110-afe-synth-containment',
    'e14c7873202afa8877b50c745636fc1b1cea45ffaf4f9e7f63ce9a71f3ab547d',
    'd065df84b529a30469df39215cb97d0d9b74b2323148f124d6ba6b04c2531bc2', 1, 474,
    [[192,124,492,607],[189,135,458,611],[188,86,511,554],[196,89,462,558]], [314,321,326,332]),
  pose('synth-enforcer', 'pose-v111-afe-synth-enforcer',
    'a626d526f1f50cbd4f858fe297027453dfc8dce9c374adff3f9a74ad781e520d',
    '028ef6780368173b86af8774c45f0c74856002b730afed8e8e4e7071bcacfe25', -1, 591,
    [[65,20,578,617],[36,23,547,618],[49,18,602,602],[32,16,443,607]], [367,346,365,355])
];
