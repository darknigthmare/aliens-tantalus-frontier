import { XENO_TRIALS_SIGNATURES_V209 } from './xeno-trials-signature-kit-v209.js';
import { XENO_TRIALS_SIGNATURES_V210 } from './xeno-trials-signature-kit-v210.js';
import { XENO_TRIALS_SIGNATURES_V211 } from './xeno-trials-signature-kit-v211.js';
import { XENO_TRIALS_RESEARCH_SIGNATURES_V210 } from './xeno-trials-research-v210.js';

export const XENO_TRIALS_SIGNATURE_KINDS_V208 = Object.freeze(['signature-2', 'signature-3']);

// V146 candidate rows adapted to this arena. Timing, damage and displacement
// are original balance, and the existing in-game art stays authoritative.
const tail = { cost: 32, damage: 34, reach: 139, startup: .32, active: .12, recovery: .53, stun: .32, push: 51 };
const bite = { cost: 22, damage: 37, reach: 30, startup: .13, active: .07, recovery: .48, stun: .30, push: 17, groundedTargetV208: true };
const lowBite = { ...bite, cost: 26, damage: 32, contactBandV207: 'low' };
const strike = { cost: 24, damage: 26, reach: 60, startup: .16, active: .09, recovery: .43, stun: .24, push: 24 };
const shove = { cost: 34, damage: 32, reach: 76, startup: .24, active: .11, recovery: .57, stun: .36, push: 57 };
const slam = { cost: 38, damage: 42, reach: 70, startup: .44, active: .14, recovery: .68, stun: .37, push: 35, contactHeightRatioV151: .55 };
const drive = { cost: 37, damage: 30, reach: 65, startup: .23, active: .17, recovery: .57, stun: .30, push: 37, approachV208: 305 };
const leap = { cost: 36, damage: 36, reach: 71, startup: .26, active: .23, recovery: .59, stun: .32, push: 34, approachV208: 300, liftV208: 205 };
const disengage = { cost: 27, damage: 24, reach: 57, startup: .16, active: .10, recovery: .50, stun: .21, push: 19, retreatV208: 195 };

const queue = [2, 'Percussion caudale', 'Tail strike',
  'Balayage long après une anticipation exposée. Sauter par-dessus ou punir la récupération.',
  'Long sweep with an exposed windup. Jump above it or punish its recovery.',
  { ...tail, contactHeightRatioV151: .62 }];
const morsure = [2, 'Morsure au sol', 'Grounded bite',
  'Frappe basse au contact. Garde basse ou saut pour la contrer.',
  'Low strike at biting distance. Crouch guard or jump to counter it.', lowBite];
const percussion = [2, 'Percussion lourde', 'Heavy percussion',
  'Contact court et fort recul. La préparation laisse le temps de quitter l’allonge.',
  'Close strike with strong pushback. Its windup gives you time to back out.',
  { ...shove, startup: .35, cost: 36, damage: 39, reach: 62 }];
const coupJoe = [2, 'Coup direct', 'Straight strike',
  'Coup court et rapide après lequel le synthétique doit se réarmer.',
  'Quick close strike followed by a synthetic recovery.',
  { ...strike, reach: 51, damage: 28, recovery: .47 }];
const rushRavager = [2, 'Assaut de mêlée', 'Melee assault',
  'L’avant-bras accompagne une ruée bornée. Le recul adverse peut faire tomber le coup court.',
  'An arm blade leads a bounded rush. Back away to make it fall short.',
  { ...drive, approachV208: 265 }];
const finishRavager = [3, 'Enchaînement lourd', 'Heavy follow-through',
  'Retombée lourde sur l’arc bas de l’avant-bras. Une seule touche par cible.',
  'Heavy downswing along the arm blade’s lower arc. One impact per target.', slam];
const corne = [2, 'Coup de tête court', 'Short headbutt',
  'Percussion à partir des appuis. La cible garde une fenêtre pour bloquer.',
  'A planted headbutt that gives the target time to guard.',
  { ...shove, reach: 51, startup: .21, push: 61 }];

const authored = [
  ['warrior', 'castes-film_warrior_aliens_1986', [
    queue,
    [3, 'Morsure interne', 'Inner jaw bite',
      'À portée de mâchoire et sur cible au sol. La récupération peut être punie.',
      'Requires a grounded target at biting distance. Its recovery can be punished.', bite]
  ]],
  ['runner', 'castes-film_runner_alien3_1992', [morsure]],
  ['albino-runner', 'enemy-058-albino-runner', [morsure]],
  ['armored-runner', 'enemy-110-armored-runner', [morsure]],
  ['acid-runner', 'enemy-162-acid-blooded-runner', [morsure]],
  ['cryo-runner', 'enemy-214-cryo-adapted-runner', [morsure]],
  ['drive-v123-creature-alien3-runner', 'pose-v123-drive-creature-alien3-runner', [morsure]],
  ['arachnoid', 'castes-game_avp_capcom_arachnoid', [
    [2, 'Frappe rapprochée', 'Close strike',
      'Une percussion courte et rapide à la sortie d’un déplacement.',
      'A short, quick impact out of movement.', { ...strike, startup: .12, reach: 44, recovery: .36 }]
  ]],
  ['defender', 'pose-v95-user-xeno-defender', [
    [3, 'Percussion courte', 'Short bash',
      'Une percussion plantée à courte portée, qui repousse sans charger.',
      'A planted short-range bash that pushes without charging.', { ...shove, reach: 52, cost: 29 }]
  ]],
  ['grid', 'castes-film_grid_avp_2004', [queue]],
  ['razor-claws', 'castes-game_avp_capcom_razor_claws', [
    [2, 'Approche en bond', 'Leaping approach',
      'Un bond bref engage les griffes et quitte le sol pendant la fenêtre active.',
      'A short leap brings the claws in and leaves the floor during the active window.',
      { ...leap, liftV208: 190, reach: 65, damage: 31 }],
    [3, 'Rafale de griffes', 'Claw flurry',
      'Un enchaînement bref, résolu en un contact rapproché par cible.',
      'A quick follow-up resolved as one close impact per target.',
      { ...strike, cost: 30, damage: 32, active: .17, recovery: .54, reach: 51 }]
  ]],
  ['smasher', 'castes-game_avp_capcom_smasher', [corne]],
  ['predalien', 'castes-game_predalien_avp2_primal_hunt', [
    [2, 'Bond offensif', 'Offensive leap',
      'Bond bref, direction verrouillée. Sortir du front du saut ou garder.',
      'Short leap with locked facing. Leave its front arc or guard.', leap]
  ]],
  ['xenoborg', 'castes-game_xenoborg_avp1999', [
    [3, 'Impact de châssis', 'Chassis impact',
      'Le châssis avance à hauteur fixe avant de repousser la cible.',
      'The chassis advances at a fixed height before pushing the target.',
      { ...drive, approachV208: 225, startup: .29, damage: 34, push: 53 }]
  ]],
  ['royal-guard', 'castes-game_avp_capcom_royal_guard', [
    [2, 'Frappe en avancée', 'Advancing strike',
      'Une avancée courte étend la frappe. Se décaler hors de l’axe engagé.',
      'A short advance extends the strike. Move away from the committed direction.',
      { ...drive, reach: 89, approachV208: 220, damage: 35 }]
  ]],
  ['stalker-arcade', 'castes-game_avp_capcom_stalker', [
    [2, 'Bond d’approche', 'Approach leap',
      'Approche aérienne brève, plus lente à récupérer que la ruée.',
      'Short aerial approach with longer recovery than the rush.',
      { ...leap, startup: .29, liftV208: 230, damage: 28 }],
    [3, 'Retrait rapide', 'Quick withdrawal',
      'Contact bref puis retrait pendant la récupération, direction verrouillée.',
      'Brief contact followed by withdrawal during recovery, with locked facing.', disengage]
  ]],
  ['ravager', 'castes-game_avp_extinction_ravager', [rushRavager, finishRavager]],
  ['albino-ravager', 'enemy-065-albino-ravager', [rushRavager, finishRavager]],
  ['armored-ravager', 'enemy-117-armored-ravager', [rushRavager, finishRavager]],
  ['acid-ravager', 'enemy-169-acid-blooded-ravager', [rushRavager, finishRavager]],
  ['cryo-ravager', 'enemy-221-cryo-adapted-ravager', [rushRavager, finishRavager]],
  ['gorilla', 'pose-v94-kenner-gorilla', [
    [3, 'Percussion au sol', 'Ground percussion',
      'Double contact vers le sol, sans onde à distance. Sauter hors de l’arc bas.',
      'Both arms strike down without a ranged shockwave. Jump out of the low arc.',
      { ...slam, reach: 64, contactBandV207: 'low' }]
  ]],
  ['drive-v123-kenner-gorilla', 'pose-v123-drive-kenner-gorilla', [
    [3, 'Percussion au sol', 'Ground percussion',
      'La percussion couvre le sol devant le spécimen. Le saut écarte les appuis de l’attaque.',
      'The strike covers the floor in front of the specimen. Jump to clear its arc.',
      { ...slam, reach: 59, contactBandV207: 'low' }]
  ]],
  ['rhino', 'pose-v94-kenner-rhino', [corne]],
  ['drive-v123-neca-rhino-kenner-orange-v14', 'pose-v123-drive-neca-rhino-kenner-orange-v14', [corne]],
  ['drive-v123-neca-rhino-kenner-version2-blue-v14', 'pose-v123-drive-neca-rhino-kenner-version2-blue-v14', [corne]],
  ['synth-trooper', 'pose-v94-afe-synth-trooper', [
    [3, 'Coup de crosse', 'Buttstock strike',
      'Percussion avec l’arme déjà équipée. Une frappe de contact à portée courte.',
      'Strike with the weapon already equipped. A close-range contact attack.',
      { ...strike, reach: 45, startup: .14, push: 34 }]
  ]],
  ['synth-guard', 'pose-v94-afe-synth-guard', [
    [2, 'Réponse rapprochée', 'Close response',
      'Répondre à proximité par un contact rapide, à la différence d’une charge.',
      'Answer at close range with a quick hit instead of a charge.',
      { ...strike, reach: 45, cost: 23, damage: 29 }]
  ]],
  ['import-game-dd-wy-commando', 'pose-v106-import-game-dd-wy-commando', [
    [2, 'Coup de crosse', 'Buttstock strike',
      'Alternative de mêlée avec la crosse visible. Le contact doit être proche.',
      'A melee option with the visible buttstock. Requires close contact.',
      { ...strike, reach: 52, cost: 27, push: 38 }]
  ]],
  ['synth-containment', 'pose-v110-afe-synth-containment', [
    [3, 'Matraque au contact', 'Close baton strike',
      'Frappe avec la matraque. Le châssis reste exposé pendant le geste.',
      'A baton strike. The chassis stays exposed during the action.',
      { ...strike, reach: 61, damage: 32, startup: .18 }]
  ]],
  ['synth-peacekeeper', 'pose-v112-afe2-peacekeeper', [
    [2, 'Contact local', 'Close contact',
      'Interception de proximité, avec davantage de recul que la frappe rapide.',
      'A close-range interception with more pushback than the quick attack.',
      { ...shove, reach: 49, damage: 26, startup: .18, cost: 28 }]
  ]],
  ['afe2-spider', 'pose-v113-afe2-spider', [
    [2, 'Contact de patte', 'Leg tap',
      'La patte frappe près du sol. Garde basse ou saut pour contrer le contact.',
      'The leg strikes near the floor. Crouch guard or jump to counter it.',
      { ...strike, contactBandV207: 'low', reach: 69, cost: 28 }]
  ]],
  ['synth-automated-powerloader', 'pose-v116-automated-powerloader', [
    [2, 'Balayage industriel', 'Industrial sweep',
      'L’allonge latérale balaie le front à hauteur de pince. Récupération prononcée.',
      'A wide sweep in front of the rig at claw height. Long recovery.',
      { ...tail, contactHeightRatioV151: .61, reach: 112, cost: 37, recovery: .62 }],
    [3, 'Poussée de châssis', 'Chassis shove',
      'Courte poussée qui ouvre l’espace. Le châssis ne change pas de dimension.',
      'A short shove that opens space. The chassis keeps its original size.',
      { ...drive, approachV208: 180, push: 64, reach: 61, startup: .28 }]
  ]],
  ['armored-joe', 'enemy-145-armored-working-joe', [coupJoe]],
  ['albino-joe', 'enemy-093-albino-working-joe', [coupJoe]],
  ['acid-joe', 'enemy-197-acid-blooded-working-joe', [coupJoe]],
  ['cryo-joe', 'enemy-249-cryo-adapted-working-joe', [coupJoe]],
  ['import-joe-classic', 'pose-v103-import-synth-workingjoe-classic', [coupJoe]],
  ['import-joe-battle', 'pose-v103-import-synth-workingjoe-battle', [coupJoe]],
  ['import-joe-hazmat', 'pose-v103-import-synth-workingjoe-hazmat', [coupJoe]],
  ['import-joe-tactical', 'pose-v103-import-synth-workingjoe-tactical', [coupJoe]],
  ['drive-v123-game-working-joe-hazard', 'pose-v123-drive-game-working-joe-hazard', [coupJoe]],
  ['drive-v123-game-working-joe-standard', 'pose-v123-drive-game-working-joe-standard', [coupJoe]],
  ['import-engineer-armorsuit', 'pose-v105-import-engineer-armorsuit', [percussion]],
  ['import-engineer-battlesuit', 'pose-v106-import-engineer-battlesuit', [percussion]],
  ['import-engineer-behemotsuit', 'pose-v106-import-engineer-behemotsuit', [percussion]],
  ['import-engineer-ceremonialsuit', 'pose-v106-import-engineer-ceremonialsuit', [percussion]],
  ['import-engineer-mala-kak', 'pose-v106-import-engineer-mala-kak', [percussion]],
  ['import-engineer-respirator', 'pose-v106-import-engineer-respirator', [percussion]],
  ['import-engineer-suit-open', 'pose-v106-import-engineer-suit-open', [percussion]],
  ['import-engineer-wararmor', 'pose-v106-import-engineer-wararmor', [percussion]],
  ['import-engineer-woman', 'pose-v106-import-engineer-woman', [percussion]],
  ['drive-v123-creature-prometheus-engineer-biosuit', 'pose-v123-drive-creature-prometheus-engineer-biosuit', [percussion]],
  ['import-wy-covenant-david', 'pose-v106-import-wy-covenant-david', [
    [2, 'Coup court', 'Short strike',
      'Une frappe ramassée à la portée du bras suivie d’une courte sortie.',
      'A compact strike at arm’s length followed by a short exit.',
      { ...disengage, reach: 42, cost: 22, retreatV208: 135 }]
  ]],
  ['drive-v123-creature-resurrection-newborn-v2', 'pose-v123-drive-creature-resurrection-newborn-v2', [
    [2, 'Frappe du bras', 'Arm blow',
      'L’allonge du bras à courte distance, avec une poursuite lourde.',
      'A close strike at full arm extension with heavy follow-through.',
      { ...shove, startup: .28, reach: 94, recovery: .58, push: 44 }]
  ]],
  ['import-game-afe2-warden', 'pose-v106-import-game-afe2-warden', [
    [2, 'Frappe renversante', 'Knockback strike',
      'Percussion de proximité avec fort recul. La projection acide reste sur Spécial.',
      'Close strike with strong knockback. Acid projection remains on Special.',
      { ...shove, startup: .36, reach: 97, push: 73, stun: .48, cost: 39 }]
  ]],
  ['drive-v123-afe-runner', 'pose-v123-drive-afe-runner', [
    [2, 'Griffure en avancée', 'Advancing rake',
      'Griffure pendant une courte accélération à hauteur basse.',
      'A rake during a short, low acceleration.',
      { ...drive, contactBandV207: 'low', approachV208: 325, startup: .22, damage: 27 }]
  ]],
  ['drive-v123-fte-pathogen-brute-profile-v13', 'pose-v123-drive-fte-pathogen-brute-profile-v13', [
    [2, 'Frappe des deux bras', 'Two-arm strike',
      'Un contact lourd des deux bras au sol. Les ondes restent sur Spécial.',
      'A heavy double-arm contact at floor level. Shockwaves remain on Special.',
      { ...slam, reach: 95 }]
  ]],
  ['drive-v123-fte-pathogen-queen-right-v13', 'pose-v123-drive-fte-pathogen-queen-right-v13', [
    [2, 'Percussion lourde', 'Heavy percussion',
      'Le membre muté frappe devant le corps dans un arc bas, sans émettre d’acide.',
      'The mutated limb strikes in a low forward arc without releasing acid.',
      { ...slam, reach: 103, push: 47 }]
  ]],
  ['drive-v123-fte-pathogen-runner-nodules-v13', 'pose-v123-drive-fte-pathogen-runner-nodules-v13', [
    [2, 'Assaut de contact', 'Contact assault',
      'Le spécimen avance rapidement pendant le contact. La cible peut briser l’axe du départ.',
      'The specimen advances rapidly during contact. The target can leave the starting direction.',
      { ...drive, approachV208: 350, reach: 63, startup: .21 }],
    [3, 'Réception lourde', 'Heavy landing',
      'Une réception vers le sol depuis les appuis. La portée reste brève.',
      'A heavy plant aimed toward the floor. Its reach stays short.',
      { ...slam, reach: 55, startup: .30, damage: 33, contactBandV207: 'low' }]
  ]]
];

export const XENO_TRIALS_SIGNATURES_V208 = Object.freeze(authored.flatMap(([fighterId, profileId, moves]) =>
  moves.map(([slot, label, labelEn, description, descriptionEn, spec]) => Object.freeze({
    id: fighterId + '::sig' + slot, fighterId, profileId, kind: 'signature-' + slot, label, labelEn, description, descriptionEn,
    spec: Object.freeze({ groundedOnly: true, cooldown: 1.35, ...spec })
  }))));

const byId = new Map([
  ...XENO_TRIALS_SIGNATURES_V208, ...XENO_TRIALS_SIGNATURES_V209, ...XENO_TRIALS_SIGNATURES_V210,
  ...XENO_TRIALS_SIGNATURES_V211,
  ...XENO_TRIALS_RESEARCH_SIGNATURES_V210,
].map(move => [move.id, move]));

export function getXenoTrialsAlternateSignatureV208(definition, kind) {
  if (!definition || !XENO_TRIALS_SIGNATURE_KINDS_V208.includes(kind)) return null;
  const move = byId.get(definition.id + '::sig' + kind.at(-1));
  return move && move.profileId === definition.profileId ? move : null;
}

export function getXenoTrialsAlternateProjectileV211(definition, signatureId) {
  const move = byId.get(signatureId);
  return move?.spec.projectileStyleV211 && move.fighterId === definition?.id && move.profileId === definition.profileId
    ? move : null;
}

export function validXenoTrialsAlternateProjectileV211(match, fighter, projectile, move, groups) {
  const { spec } = move;
  const wave = move.style === 'ground-wave';
  const receiptId = projectile.groupIdV147 + 1;
  const flight = (spec.reach / spec.projectileSpeed - projectile.life) * 120;
  const flightTicks = Math.round(flight);
  // The first windup tick includes acceptance, and the launch tick includes travel.
  const actionTick = match.tick - flightTicks - Math.ceil(spec.startup * 120) + 2;
  const group = projectile.groupIdV147 + ':' + (wave ? projectile.direction : 0);
  if (!Array.isArray(match.events) || !(fighter.stats.specials > 0) || projectile.id <= receiptId || actionTick < 1 || flightTicks < 1
    || Math.abs(flight - flightTicks) > 1e-7 || projectile.vx * projectile.direction <= 0 || groups.has(group)
    || wave && (projectile.y !== spec.projectileHeight / 2 || projectile.vy !== 0)) return false;
  const receipt = match.events.find(event => event?.id === receiptId);
  if (receipt ? receipt.type !== 'attack' || receipt.kind !== move.kind || receipt.signatureIdV208 !== move.id
    || receipt.side !== fighter.side || receipt.tick !== actionTick
    || match.hordeV180 && receipt.attackerInstanceV180 !== (fighter.instanceIdV180 || 'player')
    : match.events.length !== 32 || !(receiptId < match.events[0]?.id) || !(actionTick <= match.events[0]?.tick)) return false;
  groups.add(group);
  return true;
}

export function validXenoTrialsSignatureActionV208(attack, spec, horde = false) {
  if (!XENO_TRIALS_SIGNATURE_KINDS_V208.includes(attack.kind)) return true;
  const launched = spec.liftV208 && attack.age >= spec.startup ? true : undefined;
  const projectile = Boolean(spec.projectileStyleV211);
  return attack.emitted === (projectile && attack.age >= spec.startup) && attack.launchedV147 === launched
    && (!projectile || !attack.hit && attack.hitTargetsV180 === undefined)
    && (attack.age >= spec.startup || !attack.hit && !attack.hitTargetsV180?.length)
    && (!spec.detonationV210 || attack.age < spec.startup + spec.chargeDuration
      && !attack.hit && attack.hitTargetsV180 === undefined)
    && Object.keys(attack).every(key => ['kind', 'age', 'hit', 'emitted', 'facing', 'id', 'launchedV147'].includes(key)
      || horde && key === 'hitTargetsV180');
}

export function validXenoTrialsSignatureEventV208(event, hasFighter) {
  if (['xeno-detonation', 'synth-detonation'].includes(event.type) && event.signatureIdV208 !== undefined) {
    const move = byId.get(event.signatureIdV208);
    return Boolean(move?.spec.detonationV210 && move.kind === event.kind && hasFighter(move.fighterId));
  }
  if (event.type !== 'attack') return event.signatureIdV208 === undefined;
  if (event.signatureIdV208 === undefined && !XENO_TRIALS_SIGNATURE_KINDS_V208.includes(event.kind)) return true;
  const move = byId.get(event.signatureIdV208);
  return Boolean(move && move.kind === event.kind && hasFighter(move.fighterId));
}
