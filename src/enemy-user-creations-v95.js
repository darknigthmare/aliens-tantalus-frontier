import { USER_REFERENCE_ART_V95 } from './user-reference-art-v95.js';

const common = Object.freeze({
  family: 'enemy', biology: 'xenomorph', group: 'Références utilisateur',
  work: 'Lot AlienTentalus — adaptation de jeu non canonique',
  legacyCounterpartId: null, combatRole: 'melee',
  visualMode: 'static-pose', animationStatus: 'missing',
  identityStatus: 'user-reference-static-pose', referenceStatus: 'user-provided-qualified',
  identityVerified: false, canonExact: false,
  provenance: 'user-provided-reference-openai-integrated', sourceProvenance: 'user-provided',
  assetVerificationStatus: 'sha256-dimensions-alpha-verified',
  reviewStatus: 'accepted-static-adaptation', geometryStatus: 'project-adaptation',
  visualRevision: 95, automaticEncounter: true, encounterGroup: 'crossover',
  encounterWorldIds: Object.freeze([]), referenceUrls: Object.freeze([]),
  locomotion: 'ground', specializedBehaviorStatus: 'project-adaptation',
  health: 160, damage: 16, speed: 1.1, armor: 10, cost: 3
});
const aquatic = new Set([14, 48]);
const flying = new Set([36, 37, 45, 49]);
const massive = new Set([1, 5, 8, 19, 39, 40, 41, 42, 50, 69, 73, 76, 77]);
const mechanical = new Set([42, 43, 44, 64]);
const nonEnemies = new Set([2, 3, 4, 20, 34, 41, 51]);
// Hand-reviewed display sizes keep tall source portraits readable beside their colliders.
const reviewedRenderWidths = Object.freeze({ 14: 210, 16: 145, 32: 145, 49: 180, 50: 185, 52: 155, 53: 175, 56: 180, 59: 185, 60: 180, 61: 180, 64: 190 });
const reviewedBodyHeights = Object.freeze({ 13: 65, 24: 70, 33: 70, 54: 70, 55: 80, 63: 65 });
const profileId = art => 'pose-v95-user-' + ([51, 52].includes(art.sourceNumber) ? 'xeno-carrier' : art.slug);

// A visual state belongs to its parent: it never adds a population/discovery ID.
export const ENEMY_USER_CREATIONS_V95 = Object.freeze(USER_REFERENCE_ART_V95
  .filter(art => !nonEnemies.has(art.sourceNumber))
  .map(art => {
    const n = art.sourceNumber;
    const isAquatic = aquatic.has(n);
    const isFlying = flying.has(n);
    const isArmor = art.kind === 'armor';
    const large = massive.has(n);
    const renderWidth = reviewedRenderWidths[n] ?? (isAquatic ? 280 : isFlying ? 270 : large ? 290 : isArmor ? 250 : 230);
    const alternateNumber = n === 40 ? 41 : null;
    const states = alternateNumber ? USER_REFERENCE_ART_V95.filter(state => state.sourceNumber === alternateNumber).map(state => Object.freeze({
      ...state, id: 'pose-2', stateId: 'pose-2', label: 'Pose 2', renderWidth,
      renderHeight: renderWidth * state.sourceHeight / state.sourceWidth
    })) : [];
    return Object.freeze({
      ...common, ...art, id: profileId(art), profileId: profileId(art), basename: art.slug,
      biology: isArmor || n === 16 ? 'human' : mechanical.has(n) ? 'synthetic' : [1, 5, 19, 27, 32, 38].includes(n) ? 'fauna' : 'xenomorph',
      locomotion: isAquatic ? 'aquatic' : isFlying ? 'flying' : 'ground',
      encounterGroup: isAquatic ? 'cetoAquatic' : 'crossover',
      renderWidth, renderHeight: renderWidth * art.sourceHeight / art.sourceWidth,
      bodyWidth: isAquatic ? 112 : large ? 112 : isArmor || n === 16 ? 40 : 72,
      bodyHeight: reviewedBodyHeights[n] ?? (isAquatic ? 66 : large ? 105 : isArmor || n === 16 ? 120 : 102),
      health: large ? 290 : isArmor ? 135 : isFlying ? 125 : 160,
      damage: large ? 24 : 16, speed: large ? .85 : isFlying ? 1.35 : 1.1,
      armor: large ? 18 : isArmor ? 16 : 10, cost: large ? 5 : 3,
      states: Object.freeze(states),
      ...(n === 52 ? { defaultStateId: 'full', baseStateLabel: 'Chargé' } : {}),
      ...(n === 40 ? { defaultStateId: 'pose-1', baseStateLabel: 'Pose 1' } : {}),
      referenceNote: art.referenceNote + ' Déplacement, collision et statistiques adaptés au projet ; identité utilisateur non certifiée canonique.',
      // The documented arcade caste is distinct; the supplied illustration is
      // still qualified rather than silently replacing the historical Arachnoid.
      ...(n === 56 ? {
        group: 'Arcade', work: 'Alien vs. Predator — Capcom, arcade (1994) · adaptation visuelle utilisateur',
        combatRole: 'defensive-melee', health: 240, damage: 14, speed: .65, armor: 28, cost: 4,
        bodyWidth: 92, bodyHeight: 104,
        specializedBehaviorStatus: 'source-grounded-partial-v95',
        defenderGuardV95: Object.freeze({ residualDamageMultiplier: .55, minimumFrontDot: .5 }),
        specializedBehaviorV95: Object.freeze({
          id: 'defender-frontal-guard-v95', label: 'Garde frontale du Defender',
          runtimeScopes: Object.freeze(['campaign', 'bioforge']),
          summary: 'Mésosquelette renforcé : endurance et armure accrues, approche plus lente. Hors attaque et étourdissement, la garde réduit de 45 % les dégâts résiduels des balles venant du cône frontal de 120°. Attaquer de dos, au corps à corps, au feu ou à l’explosif contourne cette garde. Aucun écran protecteur pour les alliés.',
          sourceUrls: art.referenceUrls,
          adaptationNote: 'Defender d’Alien vs. Predator, arcade Capcom (1994), documenté par Xenopedia (source secondaire), distinct de l’Arachnoid et du Sentry du RPG. Pourcentage, cône et statistiques : réglages du projet, pas des valeurs canoniques. Illustration utilisateur quadrupède conservée, non certifiée conforme au sprite Capcom ; pose fixe, animations et posture de garde animée manquantes. Protection des œufs/juvéniles et collecte d’hôtes non simulées.'
        }),
        referenceNote: art.referenceNote + ' Endurance et armure renforcées, déplacement ralenti ; valeurs de jeu propres au projet.'
      } : {})
    });
  }));
