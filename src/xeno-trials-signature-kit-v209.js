// Working adaptations of V146 slots B and C. Profile keys bind each
// application to the corresponding arena rig. Related rigs can share a
// movement, while the authored capabilities stay tied to their own entries.

const brace = { cost: 29, damage: 32, reach: 53, startup: .29, active: .10, recovery: .52, stun: .32, push: 53 };
const advance = { cost: 33, damage: 31, reach: 63, startup: .25, active: .15, recovery: .56, stun: .31, push: 42, approachV208: 240 };
const withdraw = { cost: 24, damage: 23, reach: 51, startup: .13, active: .08, recovery: .50, stun: .20, push: 11, retreatV208: 175 };
const close = { cost: 29, damage: 36, reach: 35, startup: .24, active: .10, recovery: .56, stun: .38, push: 21, groundedTargetV208: true };
const sweep = { cost: 28, damage: 28, reach: 81, startup: .23, active: .13, recovery: .46, stun: .26, push: 32, contactBandV207: 'low' };
const leap = { cost: 34, damage: 31, reach: 55, startup: .25, active: .21, recovery: .55, stun: .29, push: 30, approachV208: 276, liftV208: 168 };

const runnerTurn = [3, 'Virage quadrupède', 'Quadruped turn',
  'Crochetez au ras du sol et reprenez de la distance. La direction reste verrouillée pendant le contact.',
  'Cut low across the floor and open space. The direction stays locked through contact.',
  { ...sweep, reach: 65, cost: 25, startup: .20, retreatV208: 148 }];
const arachnoidLanding = [3, 'Réception basse', 'Low landing',
  'Approche courte puis frappe sur les appuis bas. La cible peut sauter par-dessus.',
  'A short approach followed by a low strike. The target can jump above it.',
  { ...sweep, reach: 49, startup: .28, active: .17, approachV208: 145, groundedTargetV208: true }];
const defenderReset = [2, 'Retour de carapace', 'Carapace response',
  'Percussion très courte après l’abaissement de la carapace. Le recul dégage le contact.',
  'A point-blank bash as the carapace lowers. Pushback opens space.',
  { ...brace, startup: .18, reach: 39, cost: 25, damage: 24, push: 59 }];
const gridEscape = [3, 'Dégagement de queue', 'Tail disengage',
  'Frappe de queue en retrait. La frappe vise le front engagé, puis le corps recule.',
  'A tail strike on withdrawal. It hits the committed front, then the body backs out.',
  { ...withdraw, reach: 86, cost: 29, recovery: .57, retreatV208: 205 }];
const acidSpacing = [3, 'Repli de distance', 'Spacing withdrawal',
  'Un contact léger rend de l’espace avant la reprise des tirs.',
  'A light contact makes room before ranged pressure resumes.',
  { ...withdraw, reach: 59, retreatV208: 214 }];
const prowlerPounce = [2, 'Bond rasant', 'Shallow pounce',
  'Bond frontal avec les appuis antérieurs. La montée est brève et la réception exposée.',
  'A forward leap led by the forelimbs. A shallow arc with an exposed landing.',
  { ...leap, approachV208: 332, liftV208: 128, reach: 62 }];
const prowlerExit = [3, 'Décrochement', 'Breakaway',
  'Griffure rapprochée puis retrait rapide, que le contact réussisse ou échoue.',
  'A close rake followed by a quick retreat on contact or on a miss.',
  { ...withdraw, startup: .11, active: .10, reach: 47, retreatV208: 238 }];
const chrysalisReset = [3, 'Sortie de charge', 'Charge exit',
  'Les avant-bras repoussent au sol, puis les appuis freinent en retrait.',
  'The forearms push along the floor, then the body brakes back.',
  { ...advance, reach: 49, approachV208: 160, retreatV208: 125, recovery: .62 }];
const heavyBrake = [3, 'Freinage sur appuis', 'Planted brake',
  'Impact bas puis recul bref sur les mêmes appuis, sans changer de direction au contact.',
  'Low impact followed by a short retreat on the same stance, with facing locked.',
  { ...sweep, reach: 58, startup: .32, push: 50, approachV208: 138, retreatV208: 102 }];
const predalienClasp = [3, 'Accrochage rapproché', 'Close hook',
  'Les bras crochètent la cible au niveau du torse. Portée très courte.',
  'The arms hook the torso at point-blank range.',
  { ...close, reach: 41, damage: 41, recovery: .63 }];
const royalWithdrawal = [3, 'Recul en couverture', 'Covered retreat',
  'Attaque de couverture paresseuse à mi-distance, puis retrait sur les appuis arrière.',
  'A deliberate covering strike at mid-range followed by a planted withdrawal.',
  { ...withdraw, startup: .26, active: .12, reach: 106, damage: 29, cost: 31, retreatV208: 128 }];

const queenClamp = [2, 'Étreinte des grands bras', 'Great-arm clamp',
  'Les grands bras convergent devant le thorax. La cible doit être au sol et à proximité.',
  'The great arms converge in front of the thorax. Requires a point-blank grounded target.',
  { ...close, reach: 50, cost: 37, damage: 45, startup: .38, recovery: .70, stun: .44 }];
const queenAdvance = [3, 'Avancée menaçante', 'Menacing advance',
  'Pression au sol de la reine avec forte poussée. La préparation et la récupération sont longues.',
  'Planted forward pressure with strong pushback and long windup and recovery.',
  { ...advance, reach: 98, approachV208: 179, startup: .39, recovery: .68, push: 77, cost: 39 }];
const wallCrusher = [2, 'Impact d’épaule', 'Shoulder impact',
  'Charge d’épaule courte qui repousse fortement. Les limites normales de l’arène freinent la charge.',
  'A short shoulder charge that pushes hard. Normal arena bounds stop the charge.',
  { ...advance, reach: 66, cost: 39, damage: 39, approachV208: 258, startup: .35, push: 78, recovery: .65 }];
const gorillaClasp = [2, 'Étreinte des avant-bras', 'Forearm clasp',
  'Les bras massifs convergent à bout portant. Un saut déjoue la fermeture.',
  'The massive forearms close at point-blank range. A jump escapes the clasp.',
  { ...close, reach: 45, startup: .31, cost: 35, damage: 39, push: 30 }];
const pantherLow = [2, 'Crochet au sol', 'Low hook',
  'Le quadrupède crochette devant ses pattes. Garde basse pour absorber le choc.',
  'The quadruped hooks in front of its paws. Crouch guard absorbs the blow.',
  { ...sweep, reach: 52, startup: .17, approachV208: 209, groundedTargetV208: true }];
const mantisPincer = [2, 'Fermeture des pinces', 'Pincer close',
  'Les deux pinces convergent à contact. Le délai court laisse punir le retour.',
  'Both pincers close at contact range. Its return leaves a punish window.',
  { ...close, reach: 54, startup: .20, cost: 27, damage: 33, recovery: .59 }];
const mantisFold = [3, 'Retrait replié', 'Folded retreat',
  'Un balayage bas couvre le repli des pinces.',
  'A low sweep covers the pincer withdrawal.',
  { ...sweep, reach: 64, cost: 26, damage: 22, recovery: .54, retreatV208: 189 }];
const trooperStep = [2, 'Pas tactique', 'Tactical step',
  'Un contrôle d’avant-bras accompagne un pas court. La technique demande le contact.',
  'A forearm check accompanies a short step. Requires close contact.',
  { ...advance, reach: 46, cost: 25, damage: 24, startup: .18, approachV208: 133 }];
const synthSpacing = [3, 'Pas de dégagement', 'Spacing step',
  'Un contact court précède le pas de recul. Le châssis garde ses appuis au sol.',
  'A short impact precedes a backward step. The chassis stays grounded.',
  { ...withdraw, reach: 51, retreatV208: 153 }];
const synthSniperSpacing = [3, 'Repli du tireur', 'Marksman withdrawal',
  'Le porteur crée une courte ouverture à portée de bras puis se replie.',
  'The marksman creates an opening at arm’s length, then steps back.',
  { ...withdraw, reach: 47, startup: .16, damage: 26, retreatV208: 186 }];
const synthHeavyBrace = [2, 'Appui du porteur', 'Heavy brace',
  'Le châssis fixe ses appuis et intercepte à portée courte. Recul important au contact.',
  'The chassis plants its stance and intercepts at close range. Strong pushback on contact.',
  { ...brace, reach: 58, startup: .36, damage: 35, recovery: .65, push: 63 }];
const joeWalk = [3, 'Marche implacable', 'Relentless advance',
  'Pression lente à portée de bras. L’appui reste au sol et la récupération laisse une riposte.',
  'Slow pressure at arm’s length. It stays grounded and can be punished on recovery.',
  { ...advance, startup: .36, approachV208: 125, reach: 49, recovery: .61, push: 60 }];
const stalkerExit = [3, 'Retrait du Lurker', 'Lurker withdrawal',
  'Court contrôle au ras du sol, puis recul. Le saut adverse évite la touche.',
  'A short low check before withdrawal. A rival jump escapes the strike.',
  { ...withdraw, contactBandV207: 'low', reach: 64, retreatV208: 215 }];
const stalkerLeap = [2, 'Bond de contact', 'Contact leap',
  'Bond borné avec contact des membres avant. Le recul adverse peut faire manquer le bond.',
  'A short committed leap led by the forelimbs. Back up to make it miss.',
  { ...leap, reach: 63, startup: .28, approachV208: 244 }];
const engineerPress = [3, 'Projection au contact', 'Contact projection',
  'Les bras repoussent une cible au sol. La prise de distance empêche le contact.',
  'The arms drive a grounded target back. Leaving close range defeats it.',
  { ...close, cost: 35, damage: 34, startup: .30, reach: 53, push: 80, recovery: .65 }];
const jerriClasp = [2, 'Appui des mains', 'Two-hand contact',
  'Les mains referment le contact devant le synthétique. Le choc reste local.',
  'The synthetic closes both hands in front. The impact stays local.',
  { ...close, reach: 42, cost: 25, startup: .22, damage: 32 }];
const apeCover = [2, 'Défense rapprochée', 'Close defence',
  'Frappe d’avant-bras en combinaison, avec fort recul à portée courte.',
  'A suited forearm strike with strong pushback at close range.',
  { ...brace, reach: 40, cost: 25, startup: .22, push: 64 }];
const bulwarkTurn = [3, 'Réorientation du châssis', 'Chassis reorientation',
  'Le châssis frappe à hauteur de patte, cale ses appuis et repart en retrait.',
  'The chassis strikes at leg height, braces, and steps back.',
  { ...sweep, reach: 63, cost: 28, startup: .31, push: 49, retreatV208: 118 }];
const harbingerLeap = [2, 'Bond d’interception', 'Intercept leap',
  'Le multi-membres s’engage haut dans l’axe du départ. Une cible tassée peut échapper au sommet de l’arc.',
  'The multi-limbed fighter commits to a high forward arc. A crouched target can evade the crest.',
  { ...leap, cost: 37, approachV208: 225, liftV208: 252, reach: 74, recovery: .61 }];
const synthRearm = [3, 'Retour en garde', 'Guard reset',
  'Un contact d’avant-bras permet de sortir à courte portée avant de reprendre la garde.',
  'A forearm check opens room to exit, then return to guard.',
  { ...withdraw, cost: 25, damage: 24, recovery: .48, retreatV208: 148 }];
const guardianMarch = [3, 'Avancée lourde', 'Heavy advance',
  'Pas lourd et impact de l’avant-bras à courte distance. Le porteur garde le même équipement.',
  'A heavy step and close forearm impact using the same equipment.',
  { ...advance, startup: .32, approachV208: 125, reach: 53, recovery: .64, push: 59 }];
const coolingStep = [3, 'Recul de refroidissement', 'Cooling retreat',
  'Le porteur repousse au contact puis décroche. Le mouvement garde l’arme abaissée.',
  'The unit checks at contact and backs out with its weapon lowered.',
  { ...withdraw, reach: 44, startup: .18, recovery: .58, retreatV208: 177, push: 30 }];
const shieldCheck = [2, 'Heurt du bouclier', 'Shield check',
  'Percussion frontale courte avec le bouclier. Elle ouvre de l’espace avant un retour exposé.',
  'A short frontal strike with the shield. It opens space before an exposed return.',
  { ...brace, startup: .22, reach: 46, push: 75, cost: 33 }];
const enforcerSpacing = [3, 'Retrait mécanique', 'Mechanical retreat',
  'Contrôle d’avant-bras et retrait sur les appuis. La cible peut sortir de la portée initiale.',
  'A forearm check followed by a planted retreat. The target can leave its initial reach.',
  { ...withdraw, reach: 50, cost: 26, retreatV208: 193 }];
const spiderTurn = [3, 'Pivot multipode', 'Multi-leg pivot',
  'Le châssis contrôle son front au ras du sol puis libère l’allonge.',
  'The chassis checks its front near the ground, then retracts.',
  { ...sweep, reach: 52, startup: .19, damage: 23, active: .09, retreatV208: 176 }];
const chassisSpacing = [3, 'Repositionnement de châssis', 'Chassis reposition',
  'Une légère percussion sur les appuis précède le repositionnement.',
  'A light planted impact precedes repositioning.',
  { ...withdraw, startup: .23, damage: 22, reach: 55, retreatV208: 154 }];
const huntsmanAdvance = [2, 'Approche de châssis', 'Chassis approach',
  'Pas d’approche fixe suivi d’un contact du châssis. Une garde frontale peut interrompre l’ouverture.',
  'A fixed forward step followed by chassis contact. Frontal guard can absorb it.',
  { ...advance, reach: 56, startup: .27, approachV208: 164, damage: 27 }];
const platformDrive = [2, 'Poussée de plateforme', 'Platform push',
  'La plateforme se déplace à hauteur fixe et pousse seulement au contact.',
  'The platform moves at a fixed height and pushes only on contact.',
  { ...advance, reach: 45, startup: .30, damage: 26, cost: 28, approachV208: 197, push: 62 }];
const cultistExit = [3, 'Retrait défensif', 'Defensive withdrawal',
  'Le cultiste intercepte devant lui, puis reprend de la distance.',
  'The cultist checks ahead, then steps back to open space.',
  { ...withdraw, reach: 46, damage: 22, startup: .12, retreatV208: 163 }];
const runnerLowPass = [3, 'Franchissement bas', 'Low crossing',
  'Le quadrupède avance au ras du sol. Un saut laisse passer la griffure.',
  'The quadruped travels along the floor. Jump to clear the rake.',
  { ...sweep, approachV208: 305, reach: 58, startup: .24, recovery: .54, groundedTargetV208: true }];
const newbornApproach = [3, 'Avancée hésitante', 'Hesitant approach',
  'Anticipation longue puis pas bref et frappe du bras à portée de poitrine.',
  'A long windup followed by a short step and a chest-level arm blow.',
  { ...advance, approachV208: 119, reach: 74, startup: .44, damage: 36, recovery: .63 }];
const offspringReach = [2, 'Préhension rapprochée', 'Close reach',
  'Les longs bras se ferment devant le torse. La touche exige une cible au sol.',
  'The long arms close in front of the torso. Contact requires a grounded target.',
  { ...close, reach: 61, startup: .34, damage: 43, recovery: .67 }];
const offspringApproach = [3, 'Avancée suspendue', 'Suspended approach',
  'Un pas lent et une percussion de la paume couvrent l’approche.',
  'A slow step and a palm strike cover the approach.',
  { ...advance, approachV208: 159, reach: 78, startup: .39, recovery: .61, damage: 32 }];
const pathogenStalkerLeap = [2, 'Bond à membres multiples', 'Multi-limb leap',
  'Bond court mené par les membres avant. La cible peut reculer hors de l’axe du départ.',
  'A short leap led by the forelimbs. The target can back away from the starting line.',
  { ...leap, reach: 70, liftV208: 216, approachV208: 262, cost: 38, damage: 34, startup: .31 }];
const pathogenStalkerExit = [3, 'Décrochement pathogène', 'Pathogen breakaway',
  'Les appendices couvrent le repli par un contact latéral court.',
  'The limbs cover the withdrawal with a short side strike.',
  { ...withdraw, reach: 68, startup: .19, recovery: .61, retreatV208: 194, cost: 29 }];
const snakeCoil = [2, 'Enroulement du corps', 'Body coil',
  'Le corps près du sol se resserre à bout portant. La garde basse amortit le contact.',
  'The low body coils at point-blank range. Crouch guard absorbs the contact.',
  { ...close, contactBandV207: 'low', reach: 43, startup: .29, push: 40, damage: 31 }];
const snakeFront = [3, 'Frappe du corps antérieur', 'Forebody strike',
  'Le corps antérieur avance à hauteur fixe et balaie les appuis adverses.',
  'The forebody advances at a fixed height and sweeps the target’s stance.',
  { ...sweep, approachV208: 217, reach: 76, startup: .32, recovery: .59, damage: 34, push: 42 }];
const combatClinch = [2, 'Saisie au contact', 'Contact clamp',
  'Le synthétique désarmé ferme ses bras puis repousse à courte portée.',
  'The unarmed synthetic closes its arms and pushes back at close range.',
  { ...close, reach: 36, startup: .27, push: 68, recovery: .60 }];
const engineerHeavy = [2, 'Percussion du torse', 'Torso strike',
  'L’Engineer projette son poids dans une percussion plantée à courte portée.',
  'The Engineer commits its weight to a planted short-range strike.',
  { ...brace, startup: .34, reach: 64, damage: 39, cost: 36, recovery: .62 }];

// Existing project designs with locally described limbs and stance. These
// address the Bible's silhouette-movement slot, without proposing extra powers.
const lowHunterStride = [2, 'Rase-sol', 'Low stride',
  'Les appuis avant entraînent une avancée basse et brève. Contrez-la en sautant.',
  'The front limbs lead a short, low advance. Jump to counter it.',
  { ...sweep, reach: 60, startup: .21, approachV208: 229, groundedTargetV208: true }];
const fastHunterStep = [2, 'Bond des appuis avant', 'Forelimb hop',
  'Un bond court se termine sur les appuis avant. Le contact garde un seul axe.',
  'A short hop ends on the forelimbs. The strike stays on one axis.',
  { ...leap, liftV208: 142, reach: 57, startup: .21, approachV208: 297, damage: 29 }];
const heavyBodyStep = [2, 'Avancée de masse', 'Mass advance',
  'La créature s’engage par les épaules et repousse au niveau du corps.',
  'The creature commits its shoulders and pushes at body height.',
  { ...advance, startup: .35, approachV208: 214, reach: 69, cost: 36, recovery: .64, push: 63 }];
const crestedStep = [2, 'Pas sous crête', 'Crested stride',
  'Un pas mesuré amène un contact frontal sous la crête. Punissez la récupération.',
  'A measured step brings a frontal contact under the crest. Punish the recovery.',
  { ...advance, startup: .28, approachV208: 172, reach: 67, damage: 30, recovery: .58 }];
const hornedDrive = [2, 'Poussée de corne', 'Horn drive',
  'La corne suit une avancée basse dans l’axe engagé. Le contact repousse la cible.',
  'The horn leads a low advance with locked facing and pushes on contact.',
  { ...advance, approachV208: 216, reach: 58, startup: .32, damage: 35, push: 68 }];
const bipedeStride = [2, 'Foulée d’interception', 'Intercept stride',
  'La foulée du bipède mène à un contact frontal de l’avant-bras.',
  'The biped steps in and intercepts with a forearm.',
  { ...advance, reach: 58, startup: .20, approachV208: 179, damage: 27 }];
const spinedRamp = [2, 'Épaulement épineux', 'Spined shoulder',
  'Le contact se fait sous les épines à portée d’épaule. Le quadrupède garde ses appuis bas.',
  'The spines cover a shoulder contact at close range. The quadruped stays low.',
  { ...sweep, startup: .24, reach: 65, approachV208: 181, damage: 32 }];
const unitAdvance = [2, 'Pas d’interdiction', 'Blocking advance',
  'L’unité synthétique avance sur des appuis rigides et frappe du bras à courte portée.',
  'The synthetic unit advances on a rigid stance and strikes with its arm at close range.',
  { ...advance, approachV208: 119, reach: 50, startup: .26, push: 57 }];
const mechanicalStride = [2, 'Avancée mécanique', 'Mechanical advance',
  'Le châssis avance à hauteur constante. Le choc suit une anticipation lisible.',
  'The chassis advances at a fixed height. Impact follows a visible windup.',
  { ...advance, approachV208: 167, reach: 61, startup: .33, cost: 34, recovery: .61 }];
const clawStride = [2, 'Griffure en foulée', 'Striding rake',
  'La foulée porte un seul contact frontal des griffes par cible.',
  'The stride commits to one frontal claw contact.',
  { ...advance, approachV208: 275, reach: 63, startup: .22, active: .12, damage: 32, push: 27 }];
const armoredSweep = [2, 'Pas de balayage blindé', 'Armoured sweep step',
  'Les appuis portent un balayage au ras du sol. La masse ralentit le retour.',
  'A planted step leads into a low sweep. The mass slows the recovery.',
  { ...sweep, approachV208: 136, reach: 96, startup: .32, recovery: .62, damage: 35, push: 51 }];
const longBodyStride = [2, 'Avancée en appui bas', 'Low planted advance',
  'L’avancée cesse après une pression basse du corps. La cible peut quitter le front.',
  'The advance ends with a low body check. The target can leave the front.',
  { ...sweep, approachV208: 207, reach: 87, startup: .31, damage: 33, push: 47 }];

const authored = [
  ['runner', 'castes-film_runner_alien3_1992', [runnerTurn]],
  ['albino-runner', 'enemy-058-albino-runner', [runnerTurn]],
  ['armored-runner', 'enemy-110-armored-runner', [runnerTurn]],
  ['acid-runner', 'enemy-162-acid-blooded-runner', [runnerTurn]],
  ['cryo-runner', 'enemy-214-cryo-adapted-runner', [runnerTurn]],
  ['drive-v123-creature-alien3-runner', 'pose-v123-drive-creature-alien3-runner', [runnerTurn]],
  ['arachnoid', 'castes-game_avp_capcom_arachnoid', [arachnoidLanding]],
  ['defender', 'pose-v95-user-xeno-defender', [defenderReset]],
  ['grid', 'castes-film_grid_avp_2004', [gridEscape]],
  ['spitter', 'castes-game_acm_spitter', [acidSpacing]],
  ['drive-v123-afe-spitter', 'pose-v123-drive-afe-spitter', [acidSpacing]],
  ['prowler', 'castes-game_afe_prowler', [prowlerPounce, prowlerExit]],
  ['drive-v123-afe-prowler', 'pose-v123-drive-afe-prowler', [prowlerPounce, prowlerExit]],
  ['chrysalis', 'castes-game_avp_capcom_chrysalis', [chrysalisReset]],
  ['smasher', 'castes-game_avp_capcom_smasher', [heavyBrake]],
  ['predalien', 'castes-game_predalien_avp2_primal_hunt', [predalienClasp]],
  ['royal-guard', 'castes-game_avp_capcom_royal_guard', [royalWithdrawal]],
  ['queen', 'castes-film_queen_aliens_1986', [queenClamp, queenAdvance]],
  ['acid-queen', 'enemy-164-acid-blooded-queen', [queenClamp, queenAdvance]],
  ['drive-v123-creature-aliens-queen-mobile', 'pose-v123-drive-creature-aliens-queen-mobile', [queenClamp, queenAdvance]],
  ['crusher-acm', 'castes-game_acm_crusher', [wallCrusher, heavyBrake]],
  ['albino-crusher', 'enemy-061-albino-crusher', [wallCrusher, heavyBrake]],
  ['cryo-crusher', 'enemy-217-cryo-adapted-crusher', [wallCrusher, heavyBrake]],
  ['acid-crusher', 'enemy-165-acid-blooded-crusher', [wallCrusher, heavyBrake]],
  ['drive-v123-acm-crusher', 'pose-v123-drive-acm-crusher', [wallCrusher, heavyBrake]],
  ['gorilla', 'pose-v94-kenner-gorilla', [gorillaClasp]],
  ['drive-v123-kenner-gorilla', 'pose-v123-drive-kenner-gorilla', [gorillaClasp]],
  ['rhino', 'pose-v94-kenner-rhino', [heavyBrake]],
  ['drive-v123-neca-rhino-kenner-orange-v14', 'pose-v123-drive-neca-rhino-kenner-orange-v14', [heavyBrake]],
  ['drive-v123-neca-rhino-kenner-version2-blue-v14', 'pose-v123-drive-neca-rhino-kenner-version2-blue-v14', [heavyBrake]],
  ['panther', 'pose-v94-kenner-panther', [pantherLow]],
  ['drive-v123-neca-panther-kenner-tribute-v14', 'pose-v123-drive-neca-panther-kenner-tribute-v14', [pantherLow]],
  ['mantis', 'pose-v96-kenner-mantis', [mantisPincer, mantisFold]],
  ['synth-trooper', 'pose-v94-afe-synth-trooper', [trooperStep]],
  ['synth-guard', 'pose-v94-afe-synth-guard', [synthSpacing]],
  ['synth-sniper', 'pose-v94-afe-synth-sniper', [synthSniperSpacing]],
  ['synth-heavy', 'pose-v94-afe-synth-heavy', [synthHeavyBrace]],
  ['armored-joe', 'enemy-145-armored-working-joe', [joeWalk]],
  ['albino-joe', 'enemy-093-albino-working-joe', [joeWalk]],
  ['acid-joe', 'enemy-197-acid-blooded-working-joe', [joeWalk]],
  ['cryo-joe', 'enemy-249-cryo-adapted-working-joe', [joeWalk]],
  ['import-joe-classic', 'pose-v103-import-synth-workingjoe-classic', [joeWalk]],
  ['import-joe-battle', 'pose-v103-import-synth-workingjoe-battle', [joeWalk]],
  ['import-joe-hazmat', 'pose-v103-import-synth-workingjoe-hazmat', [joeWalk]],
  ['import-joe-tactical', 'pose-v103-import-synth-workingjoe-tactical', [joeWalk]],
  ['drive-v123-game-working-joe-hazard', 'pose-v123-drive-game-working-joe-hazard', [joeWalk]],
  ['drive-v123-game-working-joe-standard', 'pose-v123-drive-game-working-joe-standard', [joeWalk]],
  ['acid-lurker', 'enemy-167-acid-blooded-lurker', [stalkerLeap, stalkerExit]],
  ['cryo-lurker', 'enemy-219-cryo-adapted-lurker', [stalkerLeap, stalkerExit]],
  ['import-engineer-armorsuit', 'pose-v105-import-engineer-armorsuit', [engineerPress]],
  ['import-engineer-battlesuit', 'pose-v106-import-engineer-battlesuit', [engineerPress]],
  ['import-engineer-behemotsuit', 'pose-v106-import-engineer-behemotsuit', [engineerPress]],
  ['import-engineer-ceremonialsuit', 'pose-v106-import-engineer-ceremonialsuit', [engineerPress]],
  ['import-engineer-mala-kak', 'pose-v106-import-engineer-mala-kak', [engineerPress]],
  ['import-engineer-original-space-jokey-variant', 'pose-v106-import-engineer-original-space-jokey-variant', [engineerHeavy, engineerPress]],
  ['import-engineer-respirator', 'pose-v106-import-engineer-respirator', [engineerPress]],
  ['import-engineer-spacejokey', 'pose-v106-import-engineer-spacejokey', [engineerHeavy, engineerPress]],
  ['import-engineer-suit-open', 'pose-v106-import-engineer-suit-open', [engineerPress]],
  ['import-engineer-wararmor', 'pose-v106-import-engineer-wararmor', [engineerPress]],
  ['import-engineer-woman', 'pose-v106-import-engineer-woman', [engineerPress]],
  ['drive-v123-creature-prometheus-engineer-biosuit', 'pose-v123-drive-creature-prometheus-engineer-biosuit', [engineerPress]],
  ['drive-v123-prometheus-engineer-chair-suit-v16', 'pose-v123-drive-prometheus-engineer-chair-suit-v16', [engineerHeavy, engineerPress]],
  ['import-synth-jerri-1', 'pose-v106-import-synth-jerri-1', [jerriClasp]],
  ['import-synth-jerri-2', 'pose-v106-import-synth-jerri-2', [jerriClasp]],
  ['import-wy-apesuit', 'pose-v106-import-wy-apesuit', [apeCover]],
  ['import-game-afe2-bulwark', 'pose-v106-import-game-afe2-bulwark', [bulwarkTurn]],
  ['import-game-dd-wy-commando', 'pose-v106-import-game-dd-wy-commando', [synthSpacing]],
  ['import-game-afe2-harbinger', 'pose-v106-import-game-afe2-harbinger', [harbingerLeap]],
  ['import-game-dd-synthetic', 'pose-v106-import-game-dd-synthetic', [synthRearm]],
  ['import-game-dd-guardian', 'pose-v106-import-game-dd-guardian', [guardianMarch]],
  ['synth-incinerator', 'pose-v110-afe-synth-incinerator', [coolingStep]],
  ['synth-containment', 'pose-v110-afe-synth-containment', [shieldCheck]],
  ['synth-enforcer', 'pose-v111-afe-synth-enforcer', [trooperStep, enforcerSpacing]],
  ['synth-peacekeeper', 'pose-v112-afe2-peacekeeper', [synthSpacing]],
  ['afe2-spider', 'pose-v113-afe2-spider', [spiderTurn]],
  ['afe2-igniter', 'pose-v113-afe2-igniter', [coolingStep]],
  ['afe2-bombardier', 'pose-v113-afe2-bombardier', [chassisSpacing]],
  ['afe2-huntsman', 'pose-v113-afe2-huntsman', [huntsmanAdvance]],
  ['synth-good-boy', 'pose-v116-sunspot-good-boy', [platformDrive]],
  ['dd-darwin-era-cultist', 'pose-v118-dd-darwin-era-cultist', [cultistExit]],
  ['drive-v123-afe-runner', 'pose-v123-drive-afe-runner', [runnerLowPass]],
  ['drive-v123-creature-resurrection-newborn-v2', 'pose-v123-drive-creature-resurrection-newborn-v2', [newbornApproach]],
  ['drive-v123-creature-romulus-offspring', 'pose-v123-drive-creature-romulus-offspring', [offspringReach, offspringApproach]],
  ['drive-v123-fte-pathogen-stalker-profile-v13', 'pose-v123-drive-fte-pathogen-stalker-profile-v13', [pathogenStalkerLeap, pathogenStalkerExit]],
  ['drive-v123-neca-snake-series13-v14', 'pose-v123-drive-neca-snake-series13-v14', [snakeCoil, snakeFront]],
  ['drive-v123-game-combat-synthetic-avp2', 'pose-v123-drive-game-combat-synthetic-avp2', [combatClinch, synthSpacing]],
  ['combat-synth', 'enemy-146-armored-combat-synthetic', [unitAdvance]],
  ['albino-combat-synth', 'enemy-094-albino-combat-synthetic', [unitAdvance]],
  ['acid-combat-synth', 'enemy-198-acid-blooded-combat-synthetic', [unitAdvance]],
  ['cryo-combat-synth', 'enemy-250-cryo-adapted-combat-synthetic', [unitAdvance]],
  ['mecha', 'pose-v95-user-xeno-mecha', [mechanicalStride]],
  ['mecha-2', 'pose-v95-user-xeno-mecha-2', [mechanicalStride]],
  ['mechanoid', 'pose-v95-user-xeno-mechanoid', [mechanicalStride]],
  ['albino-ripper', 'enemy-075-albino-atarax-ripper', [clawStride]],
  ['armored-ripper', 'enemy-127-armored-atarax-ripper', [clawStride]],
  ['cryo-ripper', 'enemy-231-cryo-adapted-atarax-ripper', [clawStride]],
  ['acid-ripper', 'enemy-179-acid-blooded-atarax-ripper', [clawStride]],
  ['armored-ripper-queen', 'enemy-128-armored-ripper-queen', [armoredSweep]],
  ['cryo-ripper-queen', 'enemy-232-cryo-adapted-ripper-queen', [armoredSweep]],
  ['acid-ripper-queen', 'enemy-180-acid-blooded-ripper-queen', [armoredSweep]],
  ['cryo-foundry-crusher', 'enemy-234-cryo-adapted-foundry-crusher', [heavyBodyStep]],
  ['armored-foundry-crusher', 'enemy-130-armored-foundry-crusher', [heavyBodyStep]],
  ['acid-foundry-crusher', 'enemy-182-acid-blooded-foundry-crusher', [heavyBodyStep]],
  ['cryo-reef-stalker', 'enemy-235-cryo-adapted-reef-stalker', [fastHunterStep]],
  ['armored-reef-stalker', 'enemy-131-armored-reef-stalker', [fastHunterStep]],
  ['cryo-pale-hunter', 'enemy-238-cryo-adapted-pale-crucible-hunter', [clawStride]],
  ['armored-pale-hunter', 'enemy-134-armored-pale-crucible-hunter', [clawStride]],
  ['cryo-dust-runner', 'enemy-239-cryo-adapted-dust-runner', [lowHunterStride]],
  ['armored-dust-runner', 'enemy-135-armored-dust-runner', [lowHunterStride]],
  ['cryo-salvage-brute', 'enemy-240-cryo-adapted-salvage-hive-brute', [heavyBodyStep]],
  ['armored-salvage-brute', 'enemy-136-armored-salvage-hive-brute', [heavyBodyStep]],
  ['cryo-caravan-stalker', 'enemy-242-cryo-adapted-caravan-stalker', [clawStride]],
  ['armored-caravan-stalker', 'enemy-138-armored-caravan-stalker', [clawStride]],
  ['user-antilope', 'pose-v95-user-xeno-antilope', [fastHunterStep]],
  ['user-brute', 'pose-v95-user-xeno-brute', [heavyBodyStep]],
  ['user-carrier', 'pose-v95-user-xeno-carrier', [longBodyStride]],
  ['user-spiker', 'pose-v95-user-xeno-spiker', [clawStride]],
  ['user-warrior-red', 'pose-v95-user-xeno-warrior-red', [bipedeStride]],
  ['user-phantera-black', 'pose-v95-user-xeno-phantera-black', [fastHunterStep]],
  ['user-rhino', 'pose-v95-user-xeno-rhino', [hornedDrive]],
  ['user-chameleon', 'pose-v95-user-xeno-chameleon', [longBodyStride]],
  ['user-chameleon-2', 'pose-v95-user-xeno-chameleon-2', [lowHunterStride]],
  ['user-trex-king', 'pose-v95-user-xeno-trex-king', [heavyBodyStep]],
  ['user-trex-queen', 'pose-v95-user-xeno-trex-queen', [crestedStep]],
  ['user-big-xeno', 'pose-v95-user-xeno-big-xeno-1', [heavyBodyStep]],
  ['user-pale-spined', 'pose-v95-user-quadrupede-pale-epineux', [spinedRamp]],
  ['user-tiger-biped', 'pose-v95-user-bipede-tigre', [bipedeStride]],
  ['user-raised-crest', 'pose-v95-user-bipede-crete-relevee', [crestedStep]],
  ['user-bulbous-quadruped', 'pose-v95-user-quadrupede-bulbeux', [heavyBodyStep]],
  ['user-black-bone-raptor', 'pose-v95-user-rapace-noir-os', [fastHunterStep]],
  ['user-blue-violet-biped', 'pose-v95-user-bipede-bleu-violet', [bipedeStride]],
  ['user-skeletal-quadruped', 'pose-v95-user-quadrupede-squelettique', [lowHunterStride]],
  ['user-red-horned', 'pose-v95-user-quadrupede-rouge-corne', [hornedDrive]],
  ['user-open-crest', 'pose-v95-user-bipede-crete-ajouree', [crestedStep]],
  ['user-green-dome', 'pose-v95-user-bipede-dome-verdoyant', [bipedeStride]],
  ['user-violet-lobes', 'pose-v95-user-quadrupede-lobes-violets', [lowHunterStride]],
  ['user-green-vesicles', 'pose-v95-user-quadrupede-vesicules-vertes', [longBodyStride]],
  ['user-black-dome', 'pose-v95-user-quadrupede-dome-noir', [lowHunterStride]],
  ['user-black-fin', 'pose-v95-user-quadrupede-nageoire-noire', [fastHunterStep]],
  ['user-orange-biped', 'pose-v95-user-bipede-brun-orange', [bipedeStride]],
  ['user-unclassified-multiarm', 'pose-v95-user-xeno-caste-to-define', [clawStride]],
  ['user-flesh-experiment', 'pose-v95-user-xeno-experiment-flesh', [heavyBodyStep]],
  ['user-renaissance', 'pose-v95-user-xeno-experiment-renaissance', [clawStride]],
  ['import-blue-drone', 'pose-v103-import-xeno-blueluminescent-drone', [bipedeStride]],
  ['import-blue-queen', 'pose-v103-import-xeno-blueluminescent-queen', [crestedStep]],
  ['armored-red', 'enemy-123-armored-red-xenomorph', [armoredSweep]],
  ['acid-k-series', 'enemy-176-acid-blooded-k-series-yellow-xenomorph', [longBodyStride]],
  ['armored-k-series', 'enemy-124-armored-k-series-yellow-xenomorph', [armoredSweep]],
  ['ultramorph', 'pose-v95-user-xeno-ultramorph', [crestedStep]],
  ['import-alien-king-from-alien-extemrination', 'pose-v106-import-alien-king-from-alien-extemrination', [heavyBodyStep]],
  ['import-green-alien-king', 'pose-v106-import-green-alien-king', [crestedStep]],
  ['import-xeno-gorillaxeno', 'pose-v106-import-xeno-gorillaxeno', [heavyBodyStep]],
  ['import-xeno-titan-queen-nolegs', 'pose-v113-import-xeno-titan-queen-nolegs', [longBodyStride]],
  ['import-xeno-spacejokeygiant', 'pose-v106-import-xeno-spacejokeygiant', [crestedStep]]
];

export const XENO_TRIALS_SIGNATURES_V209 = Object.freeze(authored.flatMap(([fighterId, profileId, moves]) =>
  moves.map(([slot, label, labelEn, description, descriptionEn, spec]) => Object.freeze({
    id: fighterId + '::sig' + slot, fighterId, profileId, kind: 'signature-' + slot, label, labelEn, description, descriptionEn,
    spec: Object.freeze({ groundedOnly: true, cooldown: 1.35, ...spec })
  }))));
