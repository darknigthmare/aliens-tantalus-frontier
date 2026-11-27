import { XENO_TRIALS_RESEARCH_V209, getXenoTrialsResearchEvaluationV209, getXenoTrialsResearchFighterV209,
  getXenoTrialsResearchArtV209, getXenoTrialsResearchAssetsV209 } from './xeno-trials-research-v209.js';
import { XENO_TRIALS_RESEARCH_MEDIA_V210 } from './xeno-trials-research-media-v210.js';

const [specimenSheet, guardSheet] = XENO_TRIALS_RESEARCH_MEDIA_V210;
const low = { contactBandV207: 'low' };
const high = { contactBandV207: 'anti-air' };
const move = (label, labelEn, description, numbers, extra = {}) => {
  const [cost, damage, reach, startup, active, recovery, stun, push] = numbers;
  return { label, labelEn, description, spec: { cost, damage, reach, startup, active, recovery, stun, push,
    groundedOnly: true, cooldown: 1.4, ...extra } };
};

// Original MIRE models. The dossier names index research targets. Every
// silhouette, tournament move and balance value is a project interpretation.
const definitions = [
  {
    key: 'SCORCHED', slug: 'scorched', label: 'Scorched', source: 'Alien: Romulus',
    briefing: 'Enchaîner frappe basse et retrait, ou intercepter une entrée aérienne.',
    texture: specimenSheet, bounds: [167, 12, 505, 492], root: 378, body: [47, 139], stature: 157,
    hp: 192, speed: 264, special: 'tail', role: 'agile', stage: 'xt192-renaissance-cryo-chamber', opponent: 'warrior',
    attacks: [
      move('Retour de cendre', 'Ash Reversal', 'Un retrait bref suit le balayage bas.', [26, 25, 82, .25, .11, .45, .24, 26], { ...low, retreatV208: 92 }),
      move('Accroc de crête', 'Crest Snag', 'Une pointe haute intercepte le saut devant le spécimen.', [25, 27, 55, .16, .09, .43, .29, 24], high),
    ],
  },
  {
    key: 'PREDALIEN-AVPR', slug: 'predalien-avpr', label: 'Predalien AVPR', source: 'Aliens vs. Predator: Requiem',
    briefing: 'Enfoncer la ligne avec le plastron. La frappe d’ancrage laisse une récupération longue.',
    texture: specimenSheet, bounds: [784, 8, 1415, 491], root: 1157, body: [80, 162], stature: 179,
    hp: 279, speed: 178, special: 'ram', role: 'tank', family: 'hybrid', stage: 'xt179-quarantine', opponent: 'predalien',
    attacks: [
      move('Percussion de plastron', 'Chestplate Drive', 'L’épaule avance au contact dans le sens du départ.', [39, 42, 65, .37, .16, .68, .39, 55], { approachV208: 245 }),
      move('Ancrage brisé', 'Anchor Break', 'Un coup lourd vise les appuis d’une cible au sol.', [45, 49, 53, .51, .13, .76, .45, 41], { ...low, groundedTargetV208: true }),
    ],
  },
  {
    key: 'SIREN', slug: 'siren', label: 'Siren', source: 'AFE2',
    briefing: 'Faire monter la pression à courte portée, puis punir l’approche au sol.',
    texture: specimenSheet, bounds: [151, 523, 591, 992], root: 384, body: [46, 132], stature: 154,
    hp: 175, speed: 238, special: 'slash', role: 'balanced', stage: 'xt190-specimen-transfer', opponent: 'runner',
    attacks: [
      move('Résonance courte', 'Short Resonance', 'Un mouvement haut du thorax frappe dans un arc rapproché.', [31, 29, 83, .31, .16, .59, .40, 40], high),
      move('Contretemps', 'Counterbeat', 'Une frappe basse se termine par un retrait bref.', [23, 21, 72, .19, .10, .35, .20, 29], { ...low, retreatV208: 107 }),
    ],
  },
  {
    key: 'STRIKER', slug: 'striker', label: 'Striker', source: 'AFE2',
    briefing: 'Accélérer au contact et récupérer derrière un balayage rasant.',
    texture: specimenSheet, bounds: [782, 654, 1506, 996], root: 1180, body: [77, 69], stature: 99,
    hp: 185, speed: 314, special: 'pounce', role: 'agile', stage: 'xt179-workshop', opponent: 'runner',
    attacks: [
      move('Pointe de foulée', 'Leading Stride', 'Une foulée engagée parcourt le sol pendant la fenêtre de contact.', [28, 29, 63, .22, .16, .49, .25, 32], { approachV208: 340 }),
      move('Fauche du coureur', 'Runner Sweep', 'Les appuis bas balayent la cible au sol. La fin de mouvement reste exposée.', [32, 33, 94, .28, .10, .58, .26, 26], { ...low, groundedTargetV208: true }),
    ],
  },
  {
    key: 'PRAETORIAN-AVP', slug: 'praetorian-avp', label: 'Praetorian · AVP', source: 'AVP',
    briefing: 'Faire reculer l’adversaire avec l’épaule, puis couvrir le sol avec la queue.',
    texture: guardSheet, bounds: [34, 23, 496, 559], root: 341, body: [71, 162], stature: 174,
    hp: 272, speed: 172, special: 'ram', role: 'tank', stage: 'xt179-ship-docking', opponent: 'royal-guard',
    attacks: [
      move('Barrage d’épaule', 'Shoulder Barricade', 'Le buste s’engage brièvement et déplace l’adversaire.', [36, 34, 74, .28, .14, .61, .33, 62], { approachV208: 175 }),
      move('Queue d’arrêt', 'Stopping Tail', 'La queue balaie loin au sol après un départ lisible.', [35, 36, 125, .38, .12, .67, .32, 46], low),
    ],
  },
  {
    key: 'PRAETORIAN-AFE', slug: 'praetorian-afe', label: 'Praetorian · AFE', source: 'AFE',
    briefing: 'Prendre du terrain d’un seul élan, avec un contre haut lent.',
    texture: guardSheet, bounds: [659, 33, 1228, 561], root: 982, body: [76, 147], stature: 156,
    hp: 254, speed: 202, special: 'pounce', role: 'tank', stage: 'xt192-lv895-engineer-ruins', opponent: 'prowler',
    attacks: [
      move('Marche de brèche', 'Breach Approach', 'Une avance verrouillée couvre la distance à l’entrée.', [38, 35, 84, .33, .18, .65, .34, 48], { approachV208: 287 }),
      move('Front de crête', 'Crest Front', 'La crête monte dans un volume haut devant le corps.', [34, 31, 68, .26, .13, .60, .36, 35], high),
    ],
  },
  {
    key: 'PRAETORIAN-AFE2', slug: 'praetorian-afe2', label: 'Praetorian · AFE2', source: 'AFE2',
    briefing: 'Retenir la ligne avec un recul court et repousser les tentatives de saut.',
    texture: guardSheet, bounds: [44, 619, 484, 1228], root: 322, body: [60, 165], stature: 179,
    hp: 241, speed: 202, special: 'tail', role: 'tank', stage: 'xt190-specimen-transfer', opponent: 'import-game-afe2-warden',
    attacks: [
      move('Fermeture de garde', 'Guard Closure', 'La frappe au corps se termine par un recul rapide.', [31, 30, 94, .31, .14, .54, .29, 41], { retreatV208: 115 }),
      move('Montée de verrou', 'Lock Lift', 'Une interception haute et courte protège le bord du secteur.', [29, 33, 59, .20, .10, .48, .35, 38], high),
    ],
  },
];

const byKey = new Map();
const fighters = new Map();
const artById = new Map();
const signatures = [];
for (const row of definitions) {
  const id = 'mire-v210-' + row.slug, profileId = 'design-v210-' + row.slug;
  const [left, top, right, bottom] = row.bounds;
  const width = right - left, height = bottom - top;
  const family = row.family ?? 'xenomorph';
  const model = Object.freeze({
    id: profileId, profileId, path: row.texture.path, sourceFacing: 1, sourceWidth: width, sourceHeight: height,
    sourceRectV209: Object.freeze([left, top, width, height]), alphaBounds: Object.freeze([0, 0, width, height]),
    pivot: Object.freeze({ x: (row.root - left) / width, y: 1 }),
    renderWidth: row.stature * width / height, renderHeight: row.stature,
    bodyWidth: row.body[0], bodyHeight: row.body[1], biology: family, sourceWork: 'MIRE · Interprétation originale',
  });
  fighters.set(id, Object.freeze({ id, profileId, label: row.label, role: row.role, hp: row.hp, speed: row.speed,
    stamina: 100, jump: row.role === 'tank' ? 500 : 570, width: row.body[0], height: row.body[1],
    power: 1, reach: 1, special: row.special, family, variants: Object.freeze([]), artStatus: 'original-mire-model', canonExact: false }));
  artById.set(id, model);
  byKey.set(row.key, Object.freeze({ id: row.key, label: row.label, source: row.source, briefing: row.briefing,
    fighterId: id, kind: 'duel', originalModel: true, stage: row.stage, opponent: row.opponent }));
  row.attacks.forEach((attack, index) => {
    const slot = index + 2;
    signatures.push(Object.freeze({ ...attack, id: id + '::sig' + slot, fighterId: id,
      profileId, kind: 'signature-' + slot, spec: Object.freeze(attack.spec) }));
  });
}

export const XENO_TRIALS_RESEARCH_SIGNATURES_V210 = Object.freeze(signatures);
export const XENO_TRIALS_RESEARCH_FIGHTERS_V210 = Object.freeze([
  ...XENO_TRIALS_RESEARCH_V209.flatMap(dossier => dossier.fighterId ? [getXenoTrialsResearchFighterV209(dossier.fighterId)] : []),
  ...fighters.values(),
]);
export const XENO_TRIALS_RESEARCH_V210 = Object.freeze(XENO_TRIALS_RESEARCH_V209.map(dossier => {
  if (dossier.id === 'PRAETORIAN') return Object.freeze({ ...dossier,
    briefing: 'Quatre évaluations. Trois modèles MIRE séparés sont associés aux dossiers d’édition.',
    editions: Object.freeze(['AVP', 'AFE', 'AFE2'].map(edition => byKey.get('PRAETORIAN-' + edition))) });
  return byKey.get(dossier.id) ?? dossier;
}));

export const getXenoTrialsResearchFighterV210 = id => fighters.get(id) ?? getXenoTrialsResearchFighterV209(id);
export const getXenoTrialsResearchArtV210 = id => artById.get(id) ?? getXenoTrialsResearchArtV209(id);
export const getXenoTrialsResearchAssetsV210 = () => [
  ...getXenoTrialsResearchAssetsV209(), ...XENO_TRIALS_RESEARCH_MEDIA_V210.map(asset => asset.path),
];

export function getXenoTrialsResearchEvaluationV210(id) {
  const dossier = byKey.get(id);
  if (!dossier) return getXenoTrialsResearchEvaluationV209(id);
  return { playerId: dossier.fighterId, opponentId: dossier.opponent, stageId: dossier.stage,
    difficulty: 'normal', roundSeconds: 60, roundsToWin: 1, behavior: 'cpu' };
}

/** The image plate stays rooted at its sole. Read the simulation clock for
 * each small deformation and let collision continue to use its native body. */
export function getXenoTrialsResearchPoseV210(fighter, art, { spec, moving, tick, reducedMotion }) {
  if (!fighter || artById.get(fighter.id) !== art || reducedMotion || !Number.isFinite(tick)) return null;
  if (fighter.hp <= 0) return { lean: -.23, height: .68 };
  if (fighter.stun > 0) return { lean: .11, height: .95 };
  if (fighter.guard || fighter.movesetV207?.low) return { lean: .06, height: .93 };
  const attack = fighter.attack;
  if (attack && spec && Number.isFinite(attack.age)) {
    if (attack.age < spec.startup) {
      const charge = attack.age / spec.startup;
      return { lean: .13 * charge, height: 1 - .05 * charge };
    }
    if (attack.age < spec.startup + spec.active) {
      const sweep = spec.contactBandV207 === 'low', reach = spec.approachV208 ? .24 : .16;
      return { lean: -reach, height: sweep ? .88 : 1.025 };
    }
    const fade = Math.max(0, 1 - (attack.age - spec.startup - spec.active) / spec.recovery);
    return { lean: -.13 * fade, height: 1 - .035 * fade };
  }
  const cycle = Math.sin(tick * (moving ? .29 : .055));
  return { lean: moving ? -.07 + cycle * .035 : cycle * .012, height: 1 + cycle * (moving ? .035 : .013) };
}
