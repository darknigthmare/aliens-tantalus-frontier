// Original MIRE adaptations of the research silhouettes and admitted attacks.
// The model and its edition are part of each admission.
export const XENO_TRIALS_MIRE_MOVE_EVIDENCE_V231 = 'original-mire-simulation';

const low = { contactBandV207: 'low' };
const high = { contactBandV207: 'anti-air' };
const ground = { groundedTargetV208: true };
const lowGround = { ...low, ...ground };
const advance = speed => ({ approachV208: speed });
const retreat = speed => ({ retreatV208: speed });
const firstSuper = hordeTargetsV209 => ({ hordeTargetsV209, hardCpuV211: true });

function move(label, labelEn, description, descriptionEn, numbers, extra = {}) {
  const [cost, damage, reach, startup, active, recovery, stun, push] = numbers;
  const spec = Object.freeze({ cost, damage, reach, startup, active, recovery, stun, push, ...extra });
  return Object.freeze([label, labelEn, description, descriptionEn, spec]);
}

const signatures = [
  ['mire-v209-bigchap', 'v209-big-chap',
    move('Queue de coursive', 'Corridor tail', 'La queue balaie les appuis. Sauter ou garder bas.', 'The tail sweeps the legs. Jump or guard low.',
      [32, 33, 121, .32, .13, .57, .30, 47], lowGround),
    move('Morsure de seuil', 'Threshold bite', 'Les mâchoires frappent une cible au sol à très courte portée.', 'The jaws strike a grounded target at very short range.',
      [25, 37, 36, .18, .09, .58, .31, 21], ground)],
  ['mire-v209-deacon', 'castes-film_deacon_2012',
    move('Entrée des griffes', 'Claw entry', 'Une courte avancée prolonge une frappe de l’avant-bras.', 'A short advance extends a forearm strike.',
      [28, 28, 59, .22, .13, .50, .24, 30], advance(221)),
    move('Griffe de retrait', 'Withdrawing claw', 'Un contact bref précède un pas en arrière.', 'Brief contact precedes a step back.',
      [24, 24, 50, .15, .10, .51, .22, 18], retreat(155))],
  ['mire-v209-neomorph', 'castes-film_neomorph_2017',
    move('Bond d’interception', 'Intercepting leap', 'Un bond court suit l’axe engagé. La réception laisse une ouverture.', 'A short leap follows the committed lane. Landing leaves an opening.',
      [34, 31, 58, .24, .22, .57, .28, 32], { ...advance(280), liftV208: 183 }),
    move('Griffes des appuis', 'Ankle rake', 'Les griffes rabattues prennent les appuis au sol.', 'A downward rake catches grounded legs.',
      [31, 32, 66, .28, .12, .59, .29, 35], lowGround)],
  ['mire-v209-praetorian', 'v209-praetorian-comparison',
    move('Butoir de comparaison', 'Comparison brace', 'Une percussion d’épaule sans prise d’élan restaure la distance.', 'A planted shoulder check restores space.',
      [34, 35, 68, .34, .11, .60, .33, 62]),
    move('Queue de barrage', 'Barricade tail', 'L’allonge de la queue barre le passage à mi-hauteur.', 'A long tail stroke bars the lane at mid height.',
      [36, 36, 112, .37, .13, .64, .34, 49], { contactHeightRatioV151: .62 })],
  ['mire-v209-six', 'v209-six-line',
    move('Queue en poursuite', 'Pursuit tail', 'La queue suit une courte avancée sur la ligne au sol.', 'A tail strike follows a short grounded advance.',
      [32, 30, 90, .25, .14, .55, .27, 37], { ...lowGround, ...advance(165) }),
    move('Pointe en retrait', 'Retreating tip', 'Une pointe courte du bras précède le repli.', 'A short arm strike precedes the retreat.',
      [26, 27, 52, .18, .10, .50, .25, 23], retreat(147))],
  ['mire-v209-blight', 'castes-game_pathogen_blight',
    move('Projection de lisière', 'Perimeter spit', 'Un jet acide suit la hauteur visée au départ et peut être esquivé.', 'A single acid shot follows its launch angle and can be dodged.',
      [34, 29, 390, .42, .10, .53, .24, 27], { projectileStyleV211: 'aimed-acid', projectileSpeed: 405, cooldown: 1.9 }),
    move('Contact de dégagement', 'Clearing contact', 'Une griffe courte dégage assez d’espace pour reculer.', 'A short claw strike creates space to withdraw.',
      [27, 24, 52, .20, .11, .53, .23, 27], retreat(149))],
];

export const XENO_TRIALS_RECRUIT_SIGNATURES_V231 = Object.freeze(signatures.flatMap(([fighterId, profileId, ...moves]) =>
  moves.map(([label, labelEn, description, descriptionEn, spec], index) => {
    const slot = index + 2;
    return Object.freeze({
      id: `${fighterId}::sig${slot}`, fighterId, profileId, kind: `signature-${slot}`, label, labelEn, description, descriptionEn,
      evidence: XENO_TRIALS_MIRE_MOVE_EVIDENCE_V231, canonExact: false, style: spec.projectileStyleV211 || 'physical',
      spec: Object.freeze({ groundedOnly: true, cooldown: 1.35, ...spec }),
    });
  })));

export const XENO_TRIALS_RECRUIT_SUPER_RECIPES_V231 = Object.freeze([
  ['mire-v209-bigchap', 'v209-big-chap',
    move('Arc de la coursive', 'Corridor arc', 'Un arc de queue prend plusieurs appuis avec un départ long. Garde basse ou saut.', 'A long tail windup sweeps multiple grounded targets. Guard low or jump.',
      [48, 59, 122, .40, .17, .91, .38, 56], { ...lowGround, ...firstSuper(2) }),
    move('Mâchoires de reprise', 'Jaw counter', 'La parade ouvre une morsure au contact sur l’assaillant au sol.', 'The parry opens a bite against the grounded attacker.',
      [32, 45, 52, .16, .09, .71, .33, 30], ground)],
  ['mire-v210-scorched', 'design-v210-scorched',
    move('Sillage de cendre', 'Ashen trail', 'Un arc de queue bas finit en retrait après le contact.', 'A low tail arc ends with a retreat after contact.',
      [44, 53, 102, .34, .18, .86, .36, 43], { ...lowGround, ...retreat(116), ...firstSuper(2) }),
    move('Revers du dôme', 'Dome counter', 'Une percussion haute de la tête intercepte l’assaillant après la parade.', 'A high head strike catches the attacker after a parry.',
      [31, 39, 63, .18, .11, .70, .34, 36], high)],
  ['mire-v209-deacon', 'castes-film_deacon_2012',
    move('Percée des avant-bras', 'Forearm breach', 'Les avant-bras entrent dans la ligne avec un seul contact par cible.', 'The forearms drive down the lane with one impact per target.',
      [45, 55, 69, .34, .19, .88, .38, 48], { ...advance(185), ...firstSuper(1) }),
    move('Griffe de sortie', 'Exit rake', 'Une griffe au contact précède un retrait après la parade.', 'A close claw strike sets up a retreat after a parry.',
      [30, 40, 62, .16, .11, .72, .30, 33], retreat(138))],
  ['mire-v209-neomorph', 'castes-film_neomorph_2017',
    move('Double griffe rasante', 'Low double rake', 'Les deux griffes rabattues produisent un seul contact par cible au sol.', 'Both raking claws resolve one impact per grounded target.',
      [46, 55, 80, .35, .19, .87, .34, 45], { ...lowGround, ...advance(163), ...firstSuper(2) }),
    move('Retour d’avant-bras', 'Forearm return', 'L’avant-bras revient vite au contact avant que le spécimen se retire.', 'The forearm returns to contact before the creature withdraws.',
      [29, 38, 59, .15, .12, .71, .31, 29], retreat(174))],
  ['mire-v210-predalien-avpr', 'design-v210-predalien-avpr',
    move('Traversée de plastron', 'Chestplate drive', 'Le plastron avance sur une ligne fixe après une anticipation lourde.', 'The chestplate follows a fixed lane after a heavy windup.',
      [55, 67, 76, .46, .23, .99, .46, 77], { ...advance(223), ...firstSuper(2) }),
    move('Heurt des mandibules', 'Mandible check', 'Une frappe des mandibules repousse l’assaillant à courte distance.', 'A short mandible strike pushes the attacker back.',
      [39, 48, 55, .22, .12, .79, .39, 57], ground)],
  ['mire-v209-praetorian', 'v209-praetorian-comparison',
    move('Mur de comparaison', 'Comparison wall', 'L’épaule abat une percussion lourde sur des appuis fixes.', 'A heavy shoulder check lands from a planted stance.',
      [52, 64, 81, .47, .17, .99, .43, 80], firstSuper(2)),
    move('Butée de comparaison', 'Comparison stop', 'Le buste repousse l’assaillant sans prendre d’élan.', 'The torso pushes the attacker away without a charge.',
      [38, 47, 74, .20, .12, .79, .37, 67])],
  ['mire-v210-praetorian-avp', 'design-v210-praetorian-avp',
    move('Barrage caudal AVP', 'AVP tail barricade', 'La queue couvre une large bande au sol. Le départ laisse le temps de sauter.', 'The tail covers a wide grounded lane. Jump during windup.',
      [52, 61, 137, .49, .16, .97, .42, 66], { ...lowGround, ...firstSuper(3) }),
    move('Épaule d’arrêt AVP', 'AVP shoulder stop', 'Un contact d’épaule arrête l’assaillant devant le spécimen.', 'A shoulder check stops the attacker in front of the creature.',
      [37, 45, 72, .21, .13, .77, .36, 62])],
  ['mire-v210-praetorian-afe', 'design-v210-praetorian-afe',
    move('Front de brèche AFE', 'AFE breach front', 'La crête avance à mi-hauteur dans la direction verrouillée.', 'The crest advances at mid height along the committed direction.',
      [51, 62, 85, .38, .22, .92, .42, 59], { ...advance(180), ...firstSuper(2) }),
    move('Crête de reprise AFE', 'AFE crest reprise', 'Un revers haut remonte vers le buste de l’assaillant.', 'A high sweep rises toward the attacker’s torso.',
      [36, 45, 73, .20, .11, .76, .38, 48], high)],
  ['mire-v210-praetorian-afe2', 'design-v210-praetorian-afe2',
    move('Verrou de transit AFE2', 'AFE2 transit lock', 'Un coup de queue à mi-hauteur précède un court retour sur les appuis.', 'A mid-height tail strike precedes a short step back.',
      [49, 58, 109, .40, .18, .93, .40, 56], { ...retreat(120), ...firstSuper(2) }),
    move('Rabattement AFE2', 'AFE2 closing sweep', 'Un contact bas sur l’assaillant se termine par un repli.', 'A low strike on the attacker ends with a retreat.',
      [35, 43, 84, .19, .12, .75, .35, 41], { ...lowGround, ...retreat(102) })],
  ['mire-v209-six', 'v209-six-line',
    move('Traverse de poursuite', 'Pursuit crossing', 'Une avance brève porte la queue devant le spécimen, sans corriger la direction.', 'A short advance brings the tail forward without steering.',
      [46, 56, 96, .34, .20, .86, .38, 51], { ...advance(183), ...firstSuper(2) }),
    move('Crochet de lignée', 'Lineage hook', 'Un crochet bas dégage la sortie après la parade.', 'A low hook creates an exit after the parry.',
      [32, 42, 73, .17, .11, .72, .34, 36], { ...lowGround, ...retreat(133) })],
  ['mire-v210-siren', 'design-v210-siren',
    move('Coup de pied d’arrêt', 'Stopping kick', 'Le spécimen avance brièvement et percute du pied à courte distance.', 'The creature advances briefly and delivers a close-range kick.',
      [47, 54, 84, .38, .18, .89, .39, 59], { ...advance(134), ...firstSuper(2) }),
    move('Croc-en-jambe de repli', 'Withdrawing leg sweep', 'La jambe accroche les appuis de l’assaillant puis le spécimen se retire.', 'The leg sweeps the attacker’s footing before withdrawal.',
      [30, 39, 68, .16, .11, .70, .29, 34], { ...lowGround, ...retreat(118) })],
  ['mire-v210-striker', 'design-v210-striker',
    move('Balayage de masse', 'Heavy arm sweep', 'Une avancée lourde engage un large balayage des bras devant le spécimen.', 'A heavy forward step commits a wide arm sweep in front of the creature.',
      [53, 65, 94, .47, .20, .97, .45, 73], { ...advance(140), ...firstSuper(2) }),
    move('Bras de butée', 'Planted arm check', 'Un revers du bras repousse l’assaillant en conservant les appuis.', 'A planted arm check pushes back the attacker.',
      [39, 46, 76, .21, .13, .79, .38, 64])],
  ['mire-v209-blight', 'castes-game_pathogen_blight',
    move('Dégagement du Blight', 'Blight clearance', 'Un coup du corps à courte portée réouvre la ligne de tir.', 'A close body check reopens the firing lane.',
      [43, 52, 71, .37, .17, .85, .36, 55], { ...retreat(149), ...firstSuper(1) }),
    move('Repli de lisière', 'Perimeter withdrawal', 'Une griffe au contact repousse l’assaillant avant le repli.', 'A close claw pushes the attacker away before retreating.',
      [31, 40, 64, .17, .11, .72, .31, 41], retreat(161))],
].map(recipe => Object.freeze(recipe)));
