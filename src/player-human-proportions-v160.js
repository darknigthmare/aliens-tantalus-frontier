/** Presentation measurements for the existing separated game artwork.
 * These are a project design envelope, not a film/anatomy certification.
 * The former .255 head scale made a helmet almost a quarter of the complete
 * standing silhouette. Head, helmet and mask share one smaller attachment.
 * Hip offsets represent depth in a side view, not two widely splayed legs.
 */
export const PLAYER_HUMAN_PROPORTIONS_V160 = Object.freeze({
  schema: 160,
  headAttachmentScale: .185,
  hips: Object.freeze({ near: -6, far: 6 }),
  soleFromAnkle: 9,
  servicePouchDrop: 16,
  servicePouchThighFraction: .53,
  sourceHipSpreadRatio: 12 / 21,
  status: 'existing-game-art-proportions-not-canonical-reference'
});


const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const point = (x, y) => ({ x, y });

const anchors = (neck, waist, cut, legBounds, family = 'compact') => ({
  neck: point(...neck), waist: point(...waist), cut: cut.map(p => point(...p)), legBounds, family
});
const idle = offset => anchors([146 + offset,108], [140 + offset,173],
  [[92 + offset,185],[181 + offset,185],[205 + offset,188]], [91 + offset,185,201 + offset,304], 'upright');
const walk = (offset, left, right) => anchors([176 + offset,418], [151 + offset,486],
  [[109 + offset,502],[146 + offset,500],[177 + offset,496],[201 + offset,508]], [left,496,right,613], 'forward');

/** The seam follows the waistband and raised thigh, not a fixed horizontal
 * crop through a crouched leg. All coordinates stay in the V125 source frame;
 * the supplied V125 matrix, feet, shoulders and IK lengths remain unchanged.
 */
export const PLAYER_MODULAR_SOURCE_ANCHORS_V160 = freeze({
  locomotion: [
    idle(0), idle(314), idle(628), idle(942),
    walk(0,60,241), walk(313,380,550), walk(627,690,868), walk(940,1008,1177),
    anchors([165,790],[136,855],[[90,875],[123,874],[152,859],[186,861],[201,875]],[99,859,197,928]),
    anchors([486,784],[449,848],[[378,864],[431,864],[463,855],[494,850],[520,860]],[382,850,515,927]),
    anchors([788,706],[753,776],[[699,795],[743,795],[773,779],[801,782],[825,795]],[704,779,820,878]),
    anchors([1107,746],[1075,813],[[1020,832],[1062,831],[1091,812],[1126,814],[1142,830]],[1025,812,1138,900]),
    anchors([161,1112],[128,1176],[[79,1193],[110,1193],[139,1182],[164,1163],[208,1167]],[85,1163,206,1237]),
    anchors([483,1101],[448,1164],[[380,1184],[418,1184],[454,1168],[478,1159],[522,1169]],[387,1159,520,1237])
  ],
  combat: { 3: anchors([1096,114],[1076,173],
    [[1007,190],[1055,189],[1084,190],[1116,185],[1148,199]],[1012,185,1145,295], 'forward') }
});


/** The true chest axis uses the same measured native neck and waist as the
 * modular drawing. Translation is deliberately absent: carrying the thorax
 * over planted feet must not change a weapon's admissible shoulder workspace.
 */
export function getPlayerTorsoAxisV160(matrix, anatomical, facing = 1) {
  if (!matrix || !anatomical?.neck || !anatomical?.waist) return null;
  const x = anatomical.waist.x - anatomical.neck.x;
  const y = anatomical.waist.y - anatomical.neck.y;
  const dx = matrix.a * x + matrix.c * y, dy = matrix.b * x + matrix.d * y;
  const length = Math.hypot(dx, dy);
  if (!(length > 1e-9) || !Number.isFinite(length)) return null;
  const down = point(dx / length, dy / length), f = facing < 0 ? -1 : 1;
  return freeze({ forward: point(f * down.y, -f * down.x), down });
}
