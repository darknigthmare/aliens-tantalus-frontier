// Arena adaptations from the existing models and V146 dossiers. An admitted
// attack belongs to one fighter/profile pair and never grants an implied
// ability to a related model. Tuning values are original arena data.
const brace = { cost: 29, damage: 30, reach: 55, startup: .26, active: .12, recovery: .49, stun: .27, push: 39 };
const pursuit = { cost: 31, damage: 29, reach: 60, startup: .23, active: .16, recovery: .55, stun: .28, push: 39, approachV208: 242 };
const catchNear = { cost: 28, damage: 36, reach: 42, startup: .29, active: .11, recovery: .58, stun: .38, push: 28, groundedTargetV208: true };
const sweepLow = { cost: 28, damage: 28, reach: 78, startup: .24, active: .13, recovery: .50, stun: .24, push: 31, contactBandV207: 'low' };
const retreat = { cost: 23, damage: 23, reach: 57, startup: .14, active: .09, recovery: .52, stun: .19, push: 16, retreatV208: 183 };
const burst = { cost: 42, damage: 84, reach: 115, startup: .36, active: .46, chargeDuration: .29, chargeSpeed: 325,
  recovery: .58, stun: .42, push: 41, cooldown: 2.2, detonationV210: true };

const unstable = [2, 'Appui instable', 'Unsteady approach',
  'Approche engagée du Boiler, puis coup de corps. Sortir du front avant le contact.',
  'Committed Boiler approach into a body check. Leave the front before contact.',
  { ...pursuit, startup: .28, damage: 26, approachV208: 215, recovery: .61 }];
const boilerBurst = [3, 'Rupture à bout portant', 'Point-blank rupture',
  'Rompt le corps après une brève charge. Le porteur est perdu même sans contact.',
  'Ruptures its body after a short charge. The carrier is lost even on a miss.',
  { ...burst, cost: 38, damage: 93, reach: 122, startup: .42, chargeDuration: .31 }];
const bursterBreak = [2, 'Rupture d’appui', 'Stance break',
  'Percute à courte portée après un appui brusque. Le retour laisse une ouverture de mêlée.',
  'Short-range impact after a sharp step. Its return leaves a melee opening.',
  { ...brace, cost: 26, reach: 43, startup: .17, damage: 32, approachV208: 170, recovery: .54 }];
const sixStride = [2, 'Franchissement de la lignée Six', 'Six-line crossing',
  'Foulée basse suivie d’un crochet. Garde basse ou retrait.',
  'A low stride into a hooking strike. Use low guard or pull back.',
  { ...sweepLow, reach: 59, startup: .19, approachV208: 245, groundedTargetV208: true }];
const monicaCross = [2, 'Percée basse de Monica', 'Monica low entry',
  'Pression basse à partir des appuis avant. Long retour exposé.',
  'Low pressure off the forelimbs. The long recovery leaves an opening.',
  { ...sweepLow, reach: 55, startup: .18, active: .16, recovery: .59, approachV208: 263 }];
const eloiseStrike = [2, 'Percussion mécanique', 'Mechanical percussion',
  'Poussée courte et stable du châssis, suivie d’un freinage.',
  'A short, planted chassis check followed by braking.',
  { ...brace, reach: 47, damage: 37, push: 54, recovery: .59 }];
const eloiseReset = [3, 'Retour mécanique', 'Mechanical reset',
  'Frappe de couverture puis remise à distance sur appuis arrière.',
  'A covering strike followed by a planted withdrawal.',
  { ...retreat, reach: 62, startup: .21, retreatV208: 134, push: 37 }];
const rogueClasp = [2, 'Fermeture royale', 'Royal clasp',
  'Les bras convergent sur une cible au sol et toute proche. Sauter pour dégager le contact.',
  'The arms close on a point-blank grounded target. Jump clear to avoid contact.',
  { ...catchNear, reach: 55, cost: 38, damage: 44, startup: .37, recovery: .67, stun: .46 }];
const rogueCharge = [3, 'Charge royale', 'Royal charge',
  'Charge au sol à direction verrouillée. La préparation longue annonce le choc.',
  'Planted charge with locked facing. A long windup telegraphs the impact.',
  { ...pursuit, cost: 41, reach: 76, startup: .39, active: .20, approachV208: 252, damage: 40, push: 74, recovery: .69 }];
const synthCadence = [3, 'Rupture de cadence', 'Cadence break',
  'Un heurt rapproché coupe le rythme de tir et ouvre le recul du Warden synthétique.',
  'A close check breaks the synthetic Warden’s firing rhythm and creates room to retreat.',
  { ...retreat, cost: 30, reach: 51, startup: .20, push: 41, retreatV208: 142 }];
const closeExploder = [2, 'Explosion serrée', 'Tight detonation',
  'Détonation rapide à portée serrée. Le porteur est détruit même lorsque la cible sort du rayon.',
  'A fast, tight blast. The carrier is destroyed even when the target leaves its radius.',
  { ...burst, cost: 36, damage: 88, reach: 101, startup: .27, chargeDuration: .21, chargeSpeed: 355 }];
const broadExploder = [3, 'Rupture étendue', 'Broad rupture',
  'Charge plus lente et rayon plus large. Interrompre le porteur avant la rupture.',
  'Slower charge and wider blast. Interrupt the carrier before it ruptures.',
  { ...burst, cost: 51, reach: 157, damage: 106, startup: .52, chargeDuration: .36, chargeSpeed: 260, recovery: .67 }];
const armedDetonator = [2, 'Surcharge immédiate', 'Immediate overload',
  'Arme une surcharge serrée avec peu d’élan. Le châssis est perdu à la détonation.',
  'Arms a tight overload with little travel. The chassis is lost when it detonates.',
  { ...burst, cost: 39, damage: 103, reach: 105, startup: .30, chargeDuration: .18, chargeSpeed: 297 }];
const drivenDetonator = [3, 'Surcharge en course', 'Driving overload',
  'Prolonge la course avant la détonation. Le verrouillage de direction rend le côté vulnérable.',
  'Extends the run before detonation. Locked facing leaves the flank open.',
  { ...burst, cost: 48, damage: 119, reach: 134, startup: .45, active: .60, chargeDuration: .45, chargeSpeed: 389, recovery: .65 }];
const hybridClasp = [2, 'Accrochage hybride', 'Hybrid hook',
  'Attaque au contact avec les membres avant. Portée courte et retour exposé.',
  'A point-blank attack using the forelimbs, with a vulnerable return.',
  { ...catchNear, reach: 45, cost: 32, startup: .31, stun: .40 }];
const hybridMove = [3, 'Décalage hybride', 'Hybrid slip',
  'Pression au sol et décrochage après le contact ou l’échec.',
  'Planted pressure followed by a withdrawal on contact or a miss.',
  { ...retreat, reach: 64, startup: .25, active: .12, damage: 30, approachV208: 116, retreatV208: 151 }];
const tecsekClasp = [3, 'Blocage des appuis', 'Footing check',
  'Heurt au contact qui verrouille les appuis du châssis pendant l’engagement.',
  'A point-blank check that plants the chassis through contact.',
  { ...catchNear, reach: 56, startup: .27, push: 39, damage: 32, recovery: .56 }];
const popperBurst = [2, 'Rupture de contact', 'Contact rupture',
  'Détonation à rayon court. Le porteur est perdu même si la cible s’échappe.',
  'Short-radius detonation. The carrier is lost even if the target gets away.',
  { ...burst, cost: 35, damage: 68, reach: 94, startup: .28, chargeDuration: .22, chargeSpeed: 348 }];

const carapace = [2, 'Arrêt de carapace', 'Carapace stop',
  'L’avant de la carapace repousse la cible après un bref arrêt des appuis.',
  'The forward carapace pushes the target after a brief planted stop.',
  { ...brace, cost: 33, reach: 62, startup: .34, push: 62, damage: 30 }];
const bulwarkShove = [2, 'Déport du Bulwark', 'Bulwark displacement',
  'Heurt du châssis et déplacement de la cible le long du sol.',
  'Chassis impact drives the target back along the floor.',
  { ...pursuit, cost: 38, reach: 53, startup: .34, approachV208: 140, push: 79, groundedTargetV208: true }];
const harbingerClamp = [3, 'Retombée engagée', 'Committed landing',
  'Bond bas et choc frontal qui exige une cible au sol. La retombée laisse une fenêtre de riposte.',
  'A shallow leap into a frontal check against a grounded target. The landing leaves a punish window.',
  { ...catchNear, cost: 37, reach: 63, startup: .28, active: .18, approachV208: 289, liftV208: 108, recovery: .64 }];
const guardianCheck = [2, 'Heurt de couverture', 'Cover check',
  'Pression du corps en couverture. L’engagement rend la retraite momentanément impossible.',
  'Covered body pressure. Retreat is briefly unavailable once committed.',
  { ...brace, cost: 33, damage: 33, startup: .30, reach: 70, push: 57, recovery: .56 }];
const incineratorSweep = [2, 'Balayage du porteur', 'Carrier sweep',
  'Balayage limité au voisinage du châssis. L’axe reste fixe pendant le contact.',
  'A sweep limited to the area next to the chassis. Its axis stays fixed through contact.',
  { ...sweepLow, reach: 49, startup: .30, active: .10, contactBandV207: 'low', push: 39 }];
const platformCheck = [3, 'Calage de plateforme', 'Platform check',
  'Touche à courte distance avec un recul bref de la plateforme.',
  'Short-distance contact with a brief platform withdrawal.',
  { ...retreat, reach: 48, startup: .19, push: 30, retreatV208: 123 }];

const clawWithdraw = [3, 'Griffe en décrochage', 'Withdrawal rake',
  'Crochet des griffes puis retrait. Punir la sortie si le contact manque.',
  'Claw hook into a retreat. Punish the withdrawal if it misses.',
  { ...retreat, reach: 65, retreatV208: 217, cost: 27 }];
const armoredCheck = [3, 'Recul de carapace', 'Carapace withdrawal',
  'Coup du corps à faible avance, puis retour sur les appuis.',
  'A short body check followed by a return to footing.',
  { ...brace, reach: 61, startup: .28, active: .10, retreatV208: 127, push: 52 }];
const lowWithdrawal = [3, 'Décalage bas', 'Low displacement',
  'Contact au ras du sol puis retrait. Garder bas ou passer derrière le front.',
  'Floor-level contact then withdrawal. Guard low or move behind the front.',
  { ...sweepLow, reach: 66, startup: .20, damage: 25, retreatV208: 158 }];
const longRecoil = [3, 'Retrait du corps long', 'Long-body withdrawal',
  'Pression basse des appuis avant puis recul. Le contact reste frontal.',
  'Low pressure off the forelimbs into withdrawal. Contact remains frontal.',
  { ...sweepLow, reach: 95, startup: .30, active: .13, recovery: .58, retreatV208: 112, push: 40 }];
const groundedMass = [3, 'Appui de masse', 'Mass check',
  'Pression frontale par les appuis et la masse, avec un temps de retour mesuré.',
  'Front-facing pressure with planted footing and measured recovery.',
  { ...catchNear, cost: 35, reach: 64, startup: .34, push: 63, damage: 38 }];
const chassisReturn = [3, 'Retour du châssis', 'Chassis return',
  'Après un contact bref, le châssis retrouve ses appuis en reculant.',
  'After brief contact the chassis resets its footing with a withdrawal.',
  { ...retreat, cost: 28, reach: 63, startup: .25, active: .13, push: 42, retreatV208: 132 }];

const authored = [
  ['boiler', 'castes-game_acm_boiler', [unstable, boilerBurst]],
  ['acid-boiler', 'enemy-170-acid-blooded-boiler', [unstable, boilerBurst]],
  ['cryo-boiler', 'enemy-222-cryo-adapted-boiler', [unstable, boilerBurst]],
  ['drive-v123-acm-boiler', 'pose-v123-drive-acm-boiler', [unstable, boilerBurst]],
  ['burster', 'castes-game_afe_burster', [bursterBreak]],
  ['albino-burster', 'enemy-068-albino-burster', [bursterBreak]],
  ['cryo-burster', 'enemy-224-cryo-adapted-burster', [bursterBreak]],
  ['acid-burster', 'enemy-172-acid-blooded-burster', [bursterBreak]],
  ['drive-v123-afe-burster', 'pose-v123-drive-afe-burster', [bursterBreak]],
  ['albino-six', 'enemy-070-albino-specimen-six-line', [sixStride]],
  ['cryo-monica', 'enemy-225-cryo-adapted-monica-line', [monicaCross]],
  ['import-synth-eloise', 'pose-v106-import-synth-eloise', [eloiseStrike, eloiseReset]],
  ['import-xeno-kingrogue', 'pose-v106-import-xeno-kingrogue', [rogueClasp, rogueCharge]],
  ['drive-v123-comic-rogue-king', 'pose-v123-drive-comic-rogue-king', [rogueClasp, rogueCharge]],
  ['import-game-afe-synth-warden', 'pose-v106-import-game-afe-synth-warden', [synthCadence]],
  ['import-game-afe2-exploder', 'pose-v106-import-game-afe2-exploder', [closeExploder, broadExploder]],
  ['synth-detonator', 'pose-v110-afe-synth-detonator', [armedDetonator, drivenDetonator]],
  ['afe2-engineer-hybrid', 'pose-v112-afe2-engineer-hybrid', [hybridClasp, hybridMove]],
  ['synth-tecsek', 'pose-v116-tecsek', [tecsekClasp]],
  ['drive-v123-fte-pathogen-popper-profile-v13', 'pose-v123-drive-fte-pathogen-popper-profile-v13', [popperBurst]],
  ['chrysalis', 'castes-game_avp_capcom_chrysalis', [carapace]],
  ['import-game-afe2-bulwark', 'pose-v106-import-game-afe2-bulwark', [bulwarkShove]],
  ['import-game-afe2-harbinger', 'pose-v106-import-game-afe2-harbinger', [harbingerClamp]],
  ['import-game-dd-guardian', 'pose-v106-import-game-dd-guardian', [guardianCheck]],
  ['synth-incinerator', 'pose-v110-afe-synth-incinerator', [incineratorSweep]],
  ['synth-good-boy', 'pose-v116-sunspot-good-boy', [platformCheck]],
  ['albino-ripper', 'enemy-075-albino-atarax-ripper', [clawWithdraw]],
  ['armored-ripper', 'enemy-127-armored-atarax-ripper', [clawWithdraw]],
  ['acid-ripper', 'enemy-179-acid-blooded-atarax-ripper', [clawWithdraw]],
  ['cryo-ripper', 'enemy-231-cryo-adapted-atarax-ripper', [clawWithdraw]],
  ['cryo-pale-hunter', 'enemy-238-cryo-adapted-pale-crucible-hunter', [clawWithdraw]],
  ['armored-pale-hunter', 'enemy-134-armored-pale-crucible-hunter', [clawWithdraw]],
  ['cryo-caravan-stalker', 'enemy-242-cryo-adapted-caravan-stalker', [clawWithdraw]],
  ['armored-caravan-stalker', 'enemy-138-armored-caravan-stalker', [clawWithdraw]],
  ['armored-foundry-crusher', 'enemy-130-armored-foundry-crusher', [armoredCheck]],
  ['acid-foundry-crusher', 'enemy-182-acid-blooded-foundry-crusher', [armoredCheck]],
  ['cryo-foundry-crusher', 'enemy-234-cryo-adapted-foundry-crusher', [armoredCheck]],
  ['cryo-dust-runner', 'enemy-239-cryo-adapted-dust-runner', [lowWithdrawal]],
  ['armored-dust-runner', 'enemy-135-armored-dust-runner', [lowWithdrawal]],
  ['user-skeletal-quadruped', 'pose-v95-user-quadrupede-squelettique', [lowWithdrawal]],
  ['user-black-dome', 'pose-v95-user-quadrupede-dome-noir', [lowWithdrawal]],
  ['user-violet-lobes', 'pose-v95-user-quadrupede-lobes-violets', [lowWithdrawal]],
  ['user-carrier', 'pose-v95-user-xeno-carrier', [longRecoil]],
  ['user-chameleon', 'pose-v95-user-xeno-chameleon', [longRecoil]],
  ['user-green-vesicles', 'pose-v95-user-quadrupede-vesicules-vertes', [longRecoil]],
  ['user-trex-king', 'pose-v95-user-xeno-trex-king', [groundedMass]],
  ['user-trex-queen', 'pose-v95-user-xeno-trex-queen', [groundedMass]],
  ['import-green-alien-king', 'pose-v106-import-green-alien-king', [groundedMass]],
  ['cryo-combat-synth', 'enemy-250-cryo-adapted-combat-synthetic', [chassisReturn]],
  ['acid-combat-synth', 'enemy-198-acid-blooded-combat-synthetic', [chassisReturn]],
  ['albino-combat-synth', 'enemy-094-albino-combat-synthetic', [chassisReturn]],
  ['combat-synth', 'enemy-146-armored-combat-synthetic', [chassisReturn]],
];

export const XENO_TRIALS_SIGNATURES_V210 = Object.freeze(authored.flatMap(([fighterId, profileId, moves]) =>
  moves.map(([slot, label, labelEn, description, descriptionEn, spec]) => Object.freeze({
    id: fighterId + '::sig' + slot, fighterId, profileId, kind: 'signature-' + slot, label, labelEn, description, descriptionEn,
    spec: Object.freeze({ groundedOnly: true, cooldown: 1.35, ...spec }),
  }))));
