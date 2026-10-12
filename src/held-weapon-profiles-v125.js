import { WEAPONS } from './content-core-v50.js';
import { resolveWeaponVisualProfileV63 } from './weapon-visual-runtime-v63.js';
import { USER_EQUIPMENT_V95 } from './user-equipment-v95.js';
import { getWeaponPresentationProfileV124 } from './weapon-presentation-profiles-v124.js';

const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
};
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const point = (x, y) => ({ x, y });
const pixelPivot = (pixels, art) => pixels ? point(pixels[0] / art.sourceWidth, pixels[1] / art.sourceHeight) : null;

/** These are visible silhouette / standing human height ratios, not real-world
 * dimensions. Native pickup widths include very different transparent padding
 * and must not determine a held weapon's size. Uniform scaling preserves art. */
export const HELD_WEAPON_SIZE_RATIOS_V125 = freeze({
  pistol: .24, smg: .38, rifle: .48, shotgun: .52, heavy: .62, launcher: .56,
  bow: .64, melee: .42, tool: .32, throwable: .13, deployable: 0
});

/** Supplemental anchors are visual measurements/tuning on the admitted PNGs.
 * Existing grip/muzzle metadata is retained except the explicitly reviewed
 * points below. Support and service ports are approximations of visible parts;
 * they do not certify a mechanism, caliber or exact production-prop geometry.
 * Pixel coordinates refer to the WHOLE native image, never an atlas cell.
 * `bore` is the native barrel/projectile axis, NOT the grip-to-muzzle vector. */
const ANCHORS = freeze({
  1: { support: [1270, 503], reload: [735, 665], eject: [925, 308] },
  2: { support: [1090, 540], reload: [800, 720], eject: [965, 356] },
  3: { reload: [333, 840], eject: [713, 232] },
  4: { reload: [257, 964], eject: [680, 329] },
  5: { support: [1110, 238], reload: [957, 537], eject: [932, 302], bore: [1, .125] },
  6: { support: [1100, 437], reload: [700, 684] },
  7: { support: [970, 533], reload: [520, 510], eject: [450, 365] },
  8: { support: [1150, 547], reload: [940, 835], eject: [934, 366] },
  9: { support: [1040, 550], reload: [800, 691], eject: [755, 377] },
  10: { support: [970, 555], reload: [480, 430] },
  11: { support: [1100, 616], reload: [820, 564] },
  12: { support: [1030, 616], reload: [1260, 420] },
  13: { support: [1200, 505], reload: [1070, 612] },
  // A hand grenade has no gun barrel; this anchor denotes the throw origin.
  14: { bore: [0, -1], axisMeaning: 'throw-origin', sizeAxis: 'height' },
  15: { portable: false, note: 'Complete deployed tripod artwork; no handheld adaptation exists.' },
  16: { grip: [343, 437], support: [1120, 195], reload: [715, 636], eject: [720, 328] },
  17: { support: [1160, 491], reload: [815, 694] },
  18: { support: [1160, 540], reload: [890, 749] },
  19: { support: [975, 570], reload: [760, 751] },
  20: { grip: [356, 558], muzzle: [1628, 277], reload: [825, 655], eject: [710, 281] },
  21: { reload: [670, 371], eject: [670, 371] },
  22: { support: [1020, 571], reload: [640, 548] },
  23: { grip: [585, 855], muzzle: [634, 736], support: [389, 736], reload: [389, 736],
    sizeAxis: 'height', bore: [1, 0], axisMeaning: 'arrow-rest' },
  24: { support: [885, 594], reload: [840, 384] },
  25: { grip: [407, 447], muzzle: [1901, 348], support: [883, 526], reload: [758, 400] },
  26: { support: [1350, 340], ratio: .80, axisMeaning: 'implement-axis' },
  27: { ratio: .20, axisMeaning: 'implement-axis' },
  28: { ratio: .30, axisMeaning: 'implement-axis', portability: 'wrist-mounted' },
  29: { ratio: .31, support: [932, 544], reload: [620, 863] },
  30: { ratio: .38, sizeAxis: 'height', bore: [0, -1], axisMeaning: 'implement-axis' },
  31: { ratio: .48, sizeAxis: 'height', support: [505, 800], bore: [0, -1], axisMeaning: 'implement-axis' },
  32: { ratio: .26, axisMeaning: 'implement-axis' },
  33: { ratio: .35, axisMeaning: 'implement-axis' },
  34: { support: [1110, 542], reload: [745, 720] },
  35: { reload: [360, 864] },
  36: { support: [1010, 607], reload: [645, 756] },
  37: { support: [1070, 575], reload: [806, 672] },
  38: { reload: [720, 612] },
  39: { support: [930, 550], reload: [658, 660] },
  40: { support: [897, 530], reload: [565, 712] },
  147: { support: [1410, 473], reload: [794, 473], ratio: .58 },
  148: { support: [1120, 560], reload: [682, 668] },
  149: { support: [1040, 460], reload: [672, 390] },
  150: { support: [968, 300], reload: [775, 577] },
  151: { support: [1130, 519], reload: [831, 738] },
  152: { support: [1128, 510], reload: [893, 703] },
  153: { support: [1020, 500], reload: [690, 688] },
  154: { support: [1057, 534], reload: [780, 674] },
  155: { support: [1096, 521], reload: [822, 723] },
  156: { support: [952, 588], reload: [670, 728] },
  157: { support: [960, 504], reload: [610, 595] },
  158: { reload: [638, 851] },
  159: { support: [1050, 496], reload: [687, 609] },
  160: { support: [1120, 547], reload: [883, 684] },
  161: { support: [1020, 547], reload: [729, 624] },
  162: { support: [1080, 501], reload: [786, 664] },
  163: { support: [1130, 481], reload: [733, 589] },
  164: { reload: [1100, 820], eject: [748, 303] },
  165: { support: [1210, 479], reload: [860, 458], eject: [861, 328] },
  166: { support: [1150, 462], reload: [804, 550] },
  167: { reload: [527, 661] },
  168: { support: [1150, 556], reload: [897, 738] },
  169: { support: [1120, 514], reload: [845, 694] },
  170: { reload: [694, 366], eject: [694, 366] },
  190: { reload: [296, 841], eject: [773, 357] },
  171: { support: [1280, 430], reload: [880, 541], ratio: .47 },
  172: { support: [1260, 470], reload: [894, 640] },
  173: { reload: [943, 616], ratio: .29 },
  174: { support: [1110, 500], reload: [839, 654] },
  175: { support: [1570, 530], reload: [1280, 569] },
  176: { support: [1330, 545], reload: [1070, 758] },
  177: { reload: [955, 631], ratio: .28 }
});

const USER_ANCHORS = freeze({
  'item-v95-user-engineer-acid-proto': { type: 'rifle', support: [304, 655], reload: [698, 713], bore: [-1, 0], ratio: .51 },
  'item-v95-user-engineer-bone-gun': { type: 'pistol', reload: [375, 873], bore: [1, 0], ratio: .29 },
  'item-v95-user-engineer-bone-rifle': { type: 'rifle', support: [842, 687], reload: [584, 716], bore: [1, 0], ratio: .51 }
});

function heldType(weapon, art, override) {
  if (override.type) return override.type;
  const number = art.baseNumber;
  if (number === 15) return 'deployable';
  if (number === 14) return 'throwable';
  if (number === 23) return 'bow';
  if ([26, 27, 28, 30, 31, 32, 33].includes(number)) return 'melee';
  if (number === 29) return 'tool';
  if (['sidearm', 'pistol'].includes(art.category)) return 'pistol';
  if (art.category === 'smg') return 'smg';
  if (art.category === 'shotgun') return 'shotgun';
  if ([5, 16, 18, 147, 150, 161, 166, 175].includes(number)) return 'heavy';
  if (weapon.family === 'explosive') return 'launcher';
  return 'rifle';
}

function makeProfile(weapon, art, origin) {
  if (!art || art.visualMode !== 'static-pose' || !art.sourceWidth || !art.sourceHeight || !Array.isArray(art.alphaBounds)) return null;
  const override = origin === 'user-equipment-v95' ? USER_ANCHORS[weapon.id] || {} : ANCHORS[art.baseNumber] || {};
  const type = heldType(weapon, art, override);
  const sourceFacing = art.sourceFacing === -1 || art.sourceFacing === 'left' ? -1 : 1;
  const [left, top, right, bottom] = art.alphaBounds;
  const gripPivot = pixelPivot(override.grip, art) || art.gripPivot;
  const muzzlePivot = pixelPivot(override.muzzle, art) || art.muzzlePivot;
  if (!gripPivot || !muzzlePivot) return null;
  const grip = point(gripPivot.x * art.sourceWidth, gripPivot.y * art.sourceHeight);
  const muzzle = point(muzzlePivot.x * art.sourceWidth, muzzlePivot.y * art.sourceHeight);
  const inside = (x, y) => [clamp(x, left, right), clamp(y, top, bottom)];
  const handedness = ['pistol', 'throwable'].includes(type) || [27, 28, 30, 32, 33].includes(art.baseNumber) ? 'one' : 'two';
  const support = override.support || inside(grip.x + (muzzle.x - grip.x) * .56, muzzle.y + (bottom - top) * .30);
  const reload = override.reload || inside(grip.x + sourceFacing * (right - left) * .12, bottom - (bottom - top) * .12);
  const eject = override.eject || inside(grip.x + (muzzle.x - grip.x) * .26, muzzle.y + (bottom - top) * .07);
  const bore = override.bore || [sourceFacing, 0];
  const length = Math.hypot(...bore);
  const effects = getWeaponPresentationProfileV124(weapon);
  const portable = override.portable !== false && type !== 'deployable';
  return freeze({
    schema: 125, id: weapon.id, weaponId: weapon.id, name: weapon.name,
    canonicalName: art.canonicalName || weapon.canonicalName || weapon.name,
    family: weapon.family, origin, imageKey: art.imageKey, path: art.path,
    sourceWidth: art.sourceWidth, sourceHeight: art.sourceHeight,
    alphaBounds: [...art.alphaBounds], alphaBoundsThreshold: art.alphaBoundsThreshold || 16,
    sourceFacing, sha256: art.sha256 || null,
    visualMode: 'static-pose', sourceLayout: 'native-full-canvas', sheetId: null,
    type, portability: override.portability || (portable ? 'portable' : 'deployable'), portable, handedness,
    sizeRatio: override.ratio || HELD_WEAPON_SIZE_RATIOS_V125[type], sizeAxis: override.sizeAxis || 'width',
    gripPivot: { ...gripPivot }, muzzlePivot: { ...muzzlePivot },
    supportPivot: handedness === 'two' ? pixelPivot(support, art) : null,
    reloadPivot: effects.reload.feed === 'none' ? null : pixelPivot(reload, art),
    ejectionPivot: effects.casing ? pixelPivot(eject, art) : null,
    boreAxis: point(bore[0] / length, bore[1] / length),
    axisMeaning: override.axisMeaning || (['melee', 'tool'].includes(type) ? 'implement-axis' : 'bore-axis'),
    reload: effects.reload, casing: effects.casing,
    evidence: {
      identity: origin === 'catalogue' ? 'exact-admitted-catalogue-id' : 'exact-admitted-user-equipment-id',
      sourcePixels: 'existing-admitted-native-png',
      primaryAnchors: override.grip || override.muzzle ? 'visually-reviewed-native-pixels-v125' : 'existing-native-manifest-pivots',
      secondaryAnchors: 'visual-presentation-approximation',
      dimensions: 'standing-human-relative-game-tuning', canonExact: false,
      note: override.note || 'Native art is preserved; arm contacts, service ports and held scale are presentation tuning, not certified prop geometry.'
    }
  });
}

// The old visual resolver deliberately wraps historical finish numbers. Always
// perform exact catalogue admission BEFORE asking it for art: an unknown slug
// such as weapon-176-wrong-slug must not become V112 Heavy Pulse by modulo 40.
export const HELD_WEAPON_PROFILES_V125 = freeze([
  ...WEAPONS.map(weapon => makeProfile(weapon, resolveWeaponVisualProfileV63(weapon), 'catalogue')),
  ...USER_EQUIPMENT_V95.filter(item => item.kind === 'weapon').map(weapon => makeProfile(weapon, weapon, 'user-equipment-v95'))
].filter(Boolean));
const byId = new Map(HELD_WEAPON_PROFILES_V125.map(profile => [profile.weaponId, profile]));
const sidearmBase = byId.get(WEAPONS.find(weapon => weapon.name === 'M4A3 Service Pistol')?.id);
export const HELD_WEAPON_FALLBACKS_V125 = freeze({
  sidearm: sidearmBase ? { ...sidearmBase, fallbackFor: 'sidearm',
    evidence: { ...sidearmBase.evidence, identity: 'explicit-runtime-sidearm-art-assignment',
      note: 'The generic issued sidearm explicitly uses M4A3 art; weapon statistics and saved catalogue identity are unchanged.' } } : null
});

/** Real catalogue/user-equipment IDs only. No name lookup, numeric shorthand,
 * suffix or arbitrary image path can impersonate an admitted weapon. The one
 * explicit generic sidearm assignment is reviewed game presentation policy. */
export function resolveHeldWeaponProfileV125(descriptor = null) {
  if (typeof descriptor === 'string') return byId.get(descriptor) || (descriptor === 'sidearm' ? HELD_WEAPON_FALLBACKS_V125.sidearm : null);
  if (!descriptor || typeof descriptor !== 'object' || Array.isArray(descriptor)) return null;
  if (descriptor === HELD_WEAPON_FALLBACKS_V125.sidearm) return descriptor;
  if (descriptor.mode === 'apc-turret') return null;
  const id = descriptor.id || descriptor.weaponId || descriptor.catalogId;
  if (typeof id === 'string' && id) return byId.get(id) || (id === 'sidearm' ? HELD_WEAPON_FALLBACKS_V125.sidearm : null);
  return descriptor.mode === 'sidearm' || descriptor.family === 'sidearm' || descriptor.name === 'sidearm'
    ? HELD_WEAPON_FALLBACKS_V125.sidearm : null;
}
