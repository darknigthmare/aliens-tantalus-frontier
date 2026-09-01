import { createHash } from 'node:crypto';

// Future batches contain twenty profiles; FIRST_BATCH_IDS remains the immutable pilot.
export const BATCH_SIZE = 20;
export const SOURCE_GRID = Object.freeze({ columns: 4, rows: 2, frameCount: 8 });
export const BASELINE_PROFILE_ID = 'enemy-002-facehugger';
export const FIRST_BATCH_IDS = Object.freeze(['enemy-001-ovomorph', 'enemy-003-chestburster', 'enemy-004-drone-big-chap', 'enemy-005-warrior', 'enemy-006-runner']);
export const contentHash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const clip = (id, motion, fps = 10, loop = false) => Object.freeze({ id, motion, fps, loop, frameCount: 8 });
const idle = clip('idle', 'Subtle breathing and alert motion; all eight poses stay grounded.', 6, true);
const move = clip('move', 'One complete locomotion cycle with contact, passing and recovery poses; no translation across cells.', 12, true);
const death = clip('death', 'Lethal impact, loss of support, fall and terminal motionless body; never reuse this for nonlethal hurt.', 10);
const attack = (motion) => clip('attack', `${motion} Eight chronological poses: anticipation, wind-up, extension, contact, follow-through and recovery.`, 12);

const contracts = {
  egg: [clip('sealed', 'Living sealed egg: four closed fleshy lobes, subtle organic pulse, no hatching and no walking.', 6, true), clip('opening', 'Four top lobes separate progressively to reveal the interior; egg remains intact and stationary.', 8), clip('hatch', 'The opened egg membrane and four lips flex through the release and settle while the root stays stationary. Do not draw a parasite on this sheet: the Facehugger is a separate runtime actor.', 10), clip('destroyed', 'Egg ruptures and collapses into permanently destroyed remains, not an opened living egg.', 10)],
  parasite: [idle, clip('move', 'Eight-legged low scuttle, paired finger contacts and trailing tail; never bipedal locomotion.', 12, true), attack('Coil, finger push-off, airborne attachment lunge and landing, long tail trailing.'), death],
  juvenile: [idle, { ...move, motion: 'Serpentine wriggle driven by the long tail. Limb presence must match the design lock exactly: the selected 1979 Chestburster is limbless; never invent arms or adult legs.' }, attack('Low juvenile bite and body snap; preserve the locked juvenile anatomy, never grow extra limbs.'), death],
  biped: [idle, move, attack('Bipedal claw or inner-jaw strike preserving the exact locked design.'), death],
  quadruped: [idle, { ...move, motion: 'Low four-legged running cycle with diagonal contacts, compression and extension; do not become bipedal.' }, attack('Quadruped crouch, pounce or bite, then four-foot recovery.'), death],
  royal: [idle, move, attack('Heavy royal forelimb strike with the locked crown, small inner arms and tail retained.'), death, clip('tail-strike', 'Anticipate, sweep the long tail through the hit phase, then recover without changing body proportions.', 12)],
  siege: [idle, move, attack('Heavy body charge with lowered armored head; weight transfer, contact and recovery.'), death, clip('charge', 'Grounded acceleration and braking, armored impact posture; no teleport or airborne sprint.', 12)],
  ranged: [idle, move, attack('Acid-spit anticipation, throat expansion, forward spit release and recoil; projectile is a separate runtime effect.'), death],
  carrier: [idle, move, attack('Body brace and release of carried parasites, retaining the carrier back structures.'), death, clip('release', 'One staged release from the locked carrier anatomy, no unrelated creature morph.', 10)],
  explosive: [idle, move, attack('Body inflation and terminal acid detonation preparation; the final damage is separate from movement.'), death],
  tentacle: [idle, { ...move, motion: 'Tentacle-driven low crawl, preserve the locked number and attachment of appendages.' }, attack('Tentacles reach, grapple and retract without adding limbs.'), death],
  synthetic: [idle, move, attack('Mechanical humanoid grapple or melee; preserve uniform, synthetic face and limb count.'), death, clip('hurt', 'Nonlethal mechanical recoil and recovery while remaining alive.', 10)],
  armed: [idle, move, attack('Shoulder and aim the exact locked weapon, fire and recoil, then return to ready; no weapon redesign.'), death, clip('reload', 'One complete weapon-specific reload: remove magazine, insert replacement, operate action and resume ready.', 10)],
  controller: [idle, move, attack('Use the exact controller device and brace; do not substitute claws or alien anatomy.'), death, clip('command', 'Deliberate command gesture and device operation, then recovery.', 8)],
  aquatic: [idle, { ...move, motion: 'Swimming propulsion with the locked fins and tail; consistent side view, no walking legs added.' }, attack('Aquatic forward bite or lunge and swimming recovery.'), death],
  fauna: [idle, { ...move, motion: 'Locomotion matches the species and reference limb count; no xenomorph anatomy added.' }, attack('Species-specific bite, tusk or claw action with anticipation and recovery.'), death],
};
export const ANIMATION_CONTRACTS = Object.freeze(Object.fromEntries(Object.entries(contracts).map(([id, clips]) => [id, Object.freeze(clips.map(Object.freeze))])));

// An animation family is not permission to invent anatomy or weapon mechanisms.
const ARCHETYPE_CLIP_OVERRIDES = Object.freeze({
  Praetorian: Object.freeze({
    attack: attack('Heavy Praetorian forelimb strike using exactly two main arms; retain the locked crown silhouette and full tail. Do not add small inner arms or a second arm pair.'),
  }),
  'Caravan Stalker': Object.freeze({
    attack: attack('Quadruped frontier stalker crouches, briefly rears on its hind legs for a claw or inner-jaw strike, then returns to four-foot recovery. Do not make its base locomotion bipedal.'),
  }),
  Xenoborg: Object.freeze({
    attack: attack('Brace the body and aim its permanently grafted forearm laser cannons, discharge, recoil and recover. Cannons remain fused to the arms in every pose; no handheld gun, shoulder-fired rifle or detachable magazine.'),
    reload: clip('reload', 'One complete capacitor recharge and heat-venting cycle in the grafted forearm laser cannons: cooling vents open, charge builds, vents close, return to ready. No magazine removal, ammunition insertion or handheld gun.', 10),
  }),
});

export function animationContractFor(profile) {
  const contract = ANIMATION_CONTRACTS[profile.animationFamily];
  if (!contract) throw new Error(`Unknown animation family: ${profile.animationFamily}`);
  const overrides = ARCHETYPE_CLIP_OVERRIDES[profile.archetype];
  return overrides ? Object.freeze(contract.map((spec) => overrides[spec.id] || spec)) : contract;
}

// Canonical archetype names, never the content table's cyclic behavior field.
const FAMILY_BY_ARCHETYPE = Object.freeze({
  'Ovomorph': 'egg', 'Facehugger': 'parasite', 'Chestburster': 'juvenile',
  'Drone / Big Chap': 'biped', 'Warrior': 'biped', 'Runner': 'quadruped',
  'Praetorian': 'royal', 'Queen': 'royal', 'Crusher': 'siege', 'Spitter': 'ranged',
  'Lurker': 'quadruped', 'Carrier': 'carrier', 'Ravager': 'biped', 'Boiler': 'explosive',
  'Prowler': 'quadruped', 'Burster': 'explosive', 'Monica Line': 'biped', 'Specimen Six Line': 'biped',
  'Red Xenomorph': 'biped', 'K-Series Yellow Xenomorph': 'biped', 'Neuro-Xeno Drone': 'biped',
  'Xenoborg': 'armed', 'ATARAX Ripper': 'biped', 'Ripper Queen': 'royal', 'Foundry Drone': 'biped',
  'Foundry Crusher': 'siege', 'Reef Stalker': 'quadruped', 'Reef Spitter': 'ranged',
  'Siege Royal': 'royal', 'Pale Crucible Hunter': 'biped', 'Dust Runner': 'quadruped',
  'Salvage Hive Brute': 'siege', 'Arcology Lurker': 'quadruped', 'Caravan Stalker': 'quadruped',
  'Trilobite Echo': 'tentacle', 'Deacon Line': 'biped', 'Neomorph': 'biped', 'Protomorph': 'biped',
  'Abomination': 'biped', 'Pathogen Mimic': 'biped', 'Working Joe': 'synthetic',
  'Combat Synthetic': 'armed', 'Weyland-Yutani Commando': 'armed', 'UPP Vanguard': 'armed',
  'Seegson Security': 'armed', 'Colonial Raider': 'armed', 'ATARAX Controller': 'controller',
  'Cult Host': 'biped', 'Wild Boar Host': 'fauna', 'Korari Stalker': 'fauna',
  'Ceto Reef Predator': 'aquatic', 'Tantalus Tunnel Vermin': 'fauna',
  'Newborn': 'biped', 'Offspring': 'biped', 'Predalien': 'royal',
});

export function normalizeEnemyIdentity(source) {
  if (!/^enemy-\d{3}-[a-z0-9-]+$/.test(source?.id || '') || !source.name) throw new Error('Invalid enemy identity.');
  const modifier = source.modifier || 'Standard';
  const prefix = modifier === 'Standard' ? '' : `${modifier} `;
  const archetype = prefix && source.name.startsWith(prefix) ? source.name.slice(prefix.length) : source.name;
  if (!Object.hasOwn(FAMILY_BY_ARCHETYPE, archetype)) throw new Error(`Animation family needs explicit review: ${archetype}`);
  return { profileId: source.id, name: source.name, archetype, modifier, biology: source.biology, caste: source.caste, provenance: source.provenance, animationFamily: FAMILY_BY_ARCHETYPE[archetype] };
}

export function reviewedReference(source) {
  if (!source || source.status !== 'reviewed' || !String(source.designLock || '').trim() || !String(source.reviewer || '').trim() || !String(source.reviewedAt || '').trim()) return null;
  const urls = source.urls;
  const localPaths = source.localPaths || [];
  if (!Array.isArray(urls) || urls.some((url) => !/^https:\/\/[^\s]+$/.test(url))) return null;
  if (!Array.isArray(localPaths) || localPaths.some((entry) => {
    if (typeof entry !== 'string' || !entry.trim()) return true;
    const normalized = entry.replaceAll('\\', '/');
    return normalized.startsWith('/') || /^[a-z]:\//i.test(normalized) || normalized.split('/').includes('..');
  })) return null;
  if (!urls.length && !localPaths.length) return null;
  if (source.canonExact === true) throw new Error('Reference review is not a certification of pixel-exact generation.');
  const sourceScaleByClip = source.sourceScaleByClip || {};
  if (!sourceScaleByClip || typeof sourceScaleByClip !== 'object' || Array.isArray(sourceScaleByClip) || Object.entries(sourceScaleByClip).some(([key, value]) => !/^[a-z][a-z-]+$/.test(key) || typeof value !== 'number' || !Number.isFinite(value) || value <= 0)) throw new Error('Reviewed source clip scales must be explicit finite positive numbers.');
  const scaleCalibrationReview = source.scaleCalibrationReview || null;
  if (Object.keys(sourceScaleByClip).length && (!String(scaleCalibrationReview?.note || '').trim() || !String(scaleCalibrationReview?.reviewer || '').trim() || !String(scaleCalibrationReview?.reviewedAt || '').trim() || !Array.isArray(scaleCalibrationReview?.evidencePaths) || !scaleCalibrationReview.evidencePaths.length)) throw new Error('Manual inter-clip scale calibration requires a reviewed measurement note and evidence paths.');
  return { status: 'reviewed', urls: [...urls], localPaths: [...localPaths], designLock: source.designLock, reviewer: source.reviewer, reviewedAt: source.reviewedAt, canonExact: false, sourceScaleByClip: { ...sourceScaleByClip }, scaleCalibrationReview };
}

export function makeGenerationPrompt(profile, clipSpec, reference) {
  const design = reference?.designLock || 'BLOCKED: exact subject references and a reviewed design lock must be supplied before generation.';
  return [
    `Create ONE production sprite sheet of ${profile.name} for Aliens: Tantalus Frontier, animation ${clipSpec.id}.`,
    `Identity lock: ${design}`,
    `Archetype ${profile.archetype}; modifier ${profile.modifier}. This profile has its own authored source; do not silently reuse or recolor another profile.`,
    `Animation: ${clipSpec.motion}`,
    'Exactly eight individually authored chronological poses, four columns by two rows, strict row-major order. One character per cell. Each pose wholly inside its cell with generous equal gutters.',
    'Strict gameplay side view facing RIGHT, no camera rotation, no perspective change. Retain identical skull, limbs, materials, colors, outfit and proportions across all poses and all clips.',
    'Use one consistent physical scale and ground contact line. Full body and entire tail or weapon visible, no cut limbs, no cell overlap, no labels or grid lines, no logo, no UI.',
    'True transparent RGBA background if available; otherwise a perfectly flat pure magenta background, no shadow, checkerboard or scenery. No interpolation or duplicates.',
    'Preserve the supplied reference design as closely as possible; the output remains subject to visual review, not a guaranteed 1:1 replica.',
  ].join('\n');
}
