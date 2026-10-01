/** V113 native-alpha observational adaptations, not certified source-game models.
 * Physical sizes and specialized source-game abilities remain explicitly unverified. */
const spiderBounds = Object.freeze([14, 188, 1523, 912]);
const spiderScale = 76 / (spiderBounds[3] - spiderBounds[1]);
const familyRows = [
  {
    slug: 'igniter', name: 'Igniter', fighterId: 'afe2-igniter', width: 1024, height: 1536,
    bounds: [23, 32, 1008, 1506], pivotX: 661, display: 170, body: [62, 155],
    sha256: '555d13ccdebedc07ba850b196fa39c063593ff1506ab35553e27ef83c2423ae6',
    family: 'Peacekeeper / Igniter', referenceUrls: ['https://avp.fandom.com/wiki/Igniter'],
    health: 295, damage: 23, speed: .72, armor: 24, cost: 5,
    combatRole: 'melee', rangedBehavior: 'melee', combatWeapon: 'flamethrower',
    role: 'tank', trialSpeed: 170, power: 1.05, reach: 1.05, special: 'flame',
    behavior: 'project-authored-telegraphed-flame-cone-campaign-bioforge-and-trials',
    note: 'Description Xenopedia : automate humanoïde robuste de la famille Peacekeeper avec lance-flammes. Aucune vue propre de l’Igniter observée. Le Peacekeeper V112 généré sert de référence de famille ; arme, tuyau et réservoir sont reconstruits et non certifiés. Campagne et Bioforge emploient un cône de flammes annoncé, limité et réglé pour le projet par un contrat dédié ; Trials emploie le spécial lance-flammes. Ce comportement simplifié n’est pas une reproduction complète d’AFE2, ni une identification de l’arme comme OCAP-91 Volcan.'
  },
  {
    slug: 'bombardier', name: 'Bombardier', fighterId: 'afe2-bombardier', width: 1024, height: 1536,
    bounds: [38, 49, 1008, 1500], pivotX: 638, display: 170, body: [62, 155],
    sha256: 'a7eee87701bd47c18287ef264196e3eb8479a289e357e208460bc690db28bcd4',
    family: 'Peacekeeper / Igniter / Bombardier', referenceUrls: ['https://avp.fandom.com/wiki/Igniter#Bombardier'],
    health: 285, damage: 26, speed: .7, armor: 22, cost: 5,
    combatRole: 'ranged', rangedBehavior: 'shooter', combatWeapon: 'grenade-launcher',
    role: 'ranged', trialSpeed: 165, power: 1.12, reach: 1, special: 'pulse',
    behavior: 'simplified-straight-projectile-not-source-grenade-physics',
    note: 'Description Xenopedia : variante de l’Igniter avec lance-grenades et bande rouge sur la partie centrale haute du carénage. Aucune vue propre du Bombardier observée. Châssis issu de l’interprétation Peacekeeper V112 ; lanceur et tambour reconstruits. Les tirs utilisent un projectile de simulation droit : aucune balistique ni explosion de grenade AFE2 certifiée.'
  },
  {
    slug: 'huntsman', name: 'Huntsman', fighterId: 'afe2-huntsman', width: 1536, height: 1024,
    bounds: [18, 152, 1523, 918], pivotX: 784, display: 92, body: [90, 76],
    sha256: 'fa9be46b17c1f80a98e4085cc1a749b3256bc4149de2028824042f4dcfbd05fc',
    family: 'Spider / Huntsman', referenceUrls: ['https://www.avpcentral.com/bulwark', 'https://avp.fandom.com/wiki/Spider_(automaton)'],
    health: 165, damage: 18, speed: 1.12, armor: 14, cost: 3,
    combatRole: 'ranged', rangedBehavior: 'shooter', combatWeapon: 'unverified-ranged-emitter',
    role: 'ranged', trialSpeed: 215, power: .94, reach: .95, special: 'pulse',
    behavior: 'provisional-ground-ranged-role-no-certified-wall-traversal',
    note: 'AVP Central décrit une version renforcée du même châssis Spider, préférant murs et plafonds et tirant des explosifs antiémeute ; Xenopedia la décrit comme variante sniper. Ce conflit reste ouvert. Aucune vue propre observée : illustration dérivée du Spider V113, armure renforcée et émetteur entièrement reconstruits. Rôle au sol et projectile générique provisoires ; pas de marche murale ni identité visuelle certifiée.'
  }
];

function familyProfile(row) {
  const id = `pose-v113-afe2-${row.slug}`, basename = `game-afe2-${row.slug}`;
  const bounds = Object.freeze(row.bounds), scale = row.display / (bounds[3] - bounds[1]);
  return Object.freeze({
    id, profileId: id, basename, name: row.name, family: 'enemy', group: 'Synthétiques',
    biology: 'synthetic', mechanical: true, faction: 'Weyland-Yutani', lineage: `Combat automaton — ${row.family}`,
    stage: 'manufactured-unit', kind: 'organism', caste: 'synthetic', arenaEligible: true,
    work: 'Aliens: Fireteam Elite 2 — interprétation de famille', filename: `${basename}.png`,
    path: `/assets/openai/sprites/static-game-v113/${basename}.png`, imageKey: `openai-static-game-v113:${basename}`,
    sourceWidth: row.width, sourceHeight: row.height, sourceFacing: -1, alphaBounds: bounds,
    pivot: Object.freeze({ x: row.pivotX / row.width, y: bounds[3] / row.height }), sha256: row.sha256,
    reviewStatus: 'accepted-static-adaptation', visualRevision: 113,
    health: row.health, damage: row.damage, speed: row.speed, armor: row.armor, cost: row.cost,
    renderWidth: row.width * scale, renderHeight: row.height * scale, targetOpaqueHeight: row.display,
    bodyWidth: row.body[0], bodyHeight: row.body[1], combatRole: row.combatRole,
    rangedBehavior: row.rangedBehavior, combatWeapon: row.combatWeapon, acid: 0,
    locomotion: 'ground', groundContact: true, automaticEncounter: true, encounterGroup: 'fireteam',
    encounterWorldIds: Object.freeze([]), bioforgeEligible: true, states: Object.freeze([]),
    referenceUrls: Object.freeze(row.referenceUrls), sourceReferenceId: `afe2-${row.slug}-family-v113`,
    relationship: 'family-based-project-interpretation', visualMode: 'static-pose', animationStatus: 'missing', frames: 1,
    identityStatus: 'family-based-project-interpretation', referenceStatus: 'family-based-project-interpretation',
    identityVerified: false, canonExact: false, geometryStatus: 'project-adaptation', physicalSize: null,
    provenance: 'reference-openai-integrated', sourceProvenance: 'published-family-description-and-generated-project-parent',
    assetVerificationStatus: 'sha256-dimensions-alpha-verified', specializedBehaviorStatus: row.behavior,
    sizeBasis: 'project-display-and-collision-tuning-not-physical-measurement',
    referenceNote: `${row.note} PNG natif copié sans retouche, vérifié sur blanc et noir sans halo visible. Pose fixe en trois-quarts : appuis arrière surélevés, appui le plus bas au sol. Taille, collisions et statistiques de projet, pas des mesures canoniques. Aucune fidélité 1:1 certifiée.`
  });
}

export const ENEMY_AFE2_ADAPTATIONS_V113 = Object.freeze([Object.freeze({
  id: 'pose-v113-afe2-spider', profileId: 'pose-v113-afe2-spider', basename: 'game-afe2-spider',
  name: 'Spider', family: 'enemy', group: 'Synthétiques', biology: 'synthetic',
  faction: 'Weyland-Yutani', lineage: 'Combat automaton — Spider',
  stage: 'manufactured-unit', kind: 'organism', caste: 'synthetic', arenaEligible: true,
  work: 'Aliens: Fireteam Elite 2 — adaptation observationnelle', filename: 'game-afe2-spider.png',
  path: '/assets/openai/sprites/static-game-v113/game-afe2-spider.png',
  imageKey: 'openai-static-game-v113:game-afe2-spider', sourceWidth: 1536, sourceHeight: 1024,
  sourceFacing: -1, alphaBounds: spiderBounds,
  // The shell center anchors X. The lowest native pad anchors Y; no pixels cropped.
  pivot: Object.freeze({ x: 780 / 1536, y: 912 / 1024 }),
  sha256: '117374e254ba63b1904465597a1adc33626c20c79148c0fed16ea8fbceb6852f',
  reviewStatus: 'accepted-static-adaptation', visualRevision: 113,
  health: 110, damage: 14, speed: 1.35, armor: 8, cost: 2,
  renderWidth: 1536 * spiderScale, renderHeight: 1024 * spiderScale, targetOpaqueHeight: 76,
  bodyWidth: 76, bodyHeight: 62, combatRole: 'melee', rangedBehavior: 'melee', acid: 0,
  combatWeapon: 'mechanical-contact', mechanical: true,
  locomotion: 'ground', groundContact: true, automaticEncounter: true, encounterGroup: 'fireteam',
  encounterWorldIds: Object.freeze([]), bioforgeEligible: true, states: Object.freeze([]),
  referenceUrls: Object.freeze(['https://www.avpcentral.com/bulwark', 'https://www.avpcentral.com/images/bulwark/spider-crawler.webp']),
  sourceReferenceId: 'afe2-spider-screenshot-v113', relationship: 'source-game-adaptation',
  visualMode: 'static-pose', animationStatus: 'missing', frames: 1,
  identityStatus: 'observational-project-adaptation', referenceStatus: 'observed-screenshot-attached',
  identityVerified: false, canonExact: false, geometryStatus: 'project-adaptation', physicalSize: null,
  provenance: 'reference-openai-integrated', sourceProvenance: 'published-game-screenshot-secondary-caption',
  assetVerificationStatus: 'sha256-dimensions-alpha-verified',
  specializedBehaviorStatus: 'simplified-ground-contact-project-adaptation',
  sizeBasis: 'project-display-and-collision-tuning-not-physical-measurement',
  referenceNote: 'Adaptation guidée par une vraie capture AFE2 publiée et légendée Spider par AVP Central, jointe à la génération. Carapace compacte sombre, capteur frontal ambré vertical segmenté et plaque jaune basse conservés ; pattes partiellement masquées par un Marine et géométrie des faces cachées reconstruites. Le rendu métallique Peacekeeper sert uniquement de référence de style. PNG natif inchangé, contrôlé sur blanc et noir sans halo visible. Pose fixe en trois-quarts : les appuis arrière sont surélevés et le patin le plus bas définit le sol. Déplacement au sol simplifié, pas de marche murale certifiée. Taille et statistiques de simulation, pas de mesures canoniques ; aucune fidélité 1:1 certifiée.'
}), ...familyRows.map(familyProfile)]);

export const XENO_TRIALS_AFE2_V113 = Object.freeze([Object.freeze({
  id: 'afe2-spider', profileId: 'pose-v113-afe2-spider', label: 'Spider — adaptation',
  role: 'agile', hp: 110, speed: 245, power: .82, reach: .9,
  special: 'dash', factionId: 'rival-lab'
}), ...familyRows.map(row => Object.freeze({
  id: row.fighterId, profileId: `pose-v113-afe2-${row.slug}`, label: `${row.name} — interprétation`,
  role: row.role, hp: row.health, speed: row.trialSpeed, power: row.power, reach: row.reach,
  special: row.special, factionId: 'rival-lab'
}))]);


