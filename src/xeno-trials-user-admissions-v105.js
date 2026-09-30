import { USER_REFERENCE_ART_V95 } from './user-reference-art-v95.js';
import { getEnemyStaticPoseV96 } from './enemy-static-poses-v96.js';

/** Existing, accepted user cutouts only. This table adds arena selections, not
 * species, artwork, animation or canonical abilities. Preserve V95 source IDs.
 * Numbers are project duel tuning; the original campaign data stays unchanged. */
const selections = [
  [15, 'user-open-crest', 'Bipède à crête ajourée — référence 15', 'balanced', 225, 220, 1, 1.05, 'tail', 'hive'],
  [18, 'user-green-dome', 'Bipède à dôme verdoyant — référence 18', 'balanced', 220, 225, 1, 1, 'tail', 'hive'],
  [21, 'user-violet-lobes', 'Quadrupède à lobes violets — référence 21', 'balanced', 225, 225, 1, 1, 'pounce', 'pursuit'],
  [22, 'user-green-vesicles', 'Quadrupède à vésicules vertes — référence 22', 'balanced', 230, 215, 1, 1.05, 'tail', 'containment'],
  [23, 'user-black-dome', 'Quadrupède à dôme noir — référence 23', 'agile', 195, 275, 1, .95, 'pounce', 'pursuit'],
  [24, 'user-black-fin', 'Quadrupède à nageoire noire — référence 24', 'agile', 185, 285, .98, .95, 'pounce', 'pursuit'],
  [26, 'user-orange-biped', 'Bipède brun-orange — référence 26', 'balanced', 220, 230, 1, 1, 'tail', 'hive'],
  [53, 'user-unclassified-multiarm', 'Xeno à caste indéterminée — référence 53', 'balanced', 225, 215, 1.04, 1.05, 'slash', 'hive'],
  [59, 'user-flesh-experiment', 'Expérience Flesh — référence 59', 'balanced', 230, 205, 1.04, 1, 'ram', 'rival-lab'],
  [61, 'user-renaissance', 'Expérience Renaissance — référence 61', 'balanced', 230, 210, 1.04, 1.05, 'slash', 'rival-lab']
];

// A standing pose does not establish an autonomous combatant. Keep this source
// in its existing consumers, but do not infer a new arena caste from its name.
export const XENO_TRIALS_DEFERRED_USER_V105 = Object.freeze([
  Object.freeze({ sourceNumber: 60, profileId: 'pose-v95-user-xeno-experiment-flesh-bursting-host',
    reason: 'Hôte transformé : autonomie et identité de combattant non établies par la référence.' })
]);

export const XENO_TRIALS_USER_ADMISSIONS_V105 = Object.freeze(selections.map(row => {
  const [sourceNumber, id, label, role, hp, speed, power, reach, special, factionId] = row;
  const source = USER_REFERENCE_ART_V95.find(art => art.sourceNumber === sourceNumber);
  const profileId = source && `pose-v95-user-${source.slug}`;
  const art = getEnemyStaticPoseV96(profileId);
  if (!source || !art || art.path !== source.path || art.sha256 !== source.sha256
    || art.reviewStatus !== 'accepted-static-adaptation' || art.animationStatus !== 'missing'
    || art.biology !== 'xenomorph' || art.locomotion !== 'ground'
    || art.groundContact === false || art.bioforgeEligible === false
    || !Array.isArray(art.alphaBounds) || art.alphaBounds.length !== 4
    || ![art.sourceWidth, art.sourceHeight, art.bodyWidth, art.bodyHeight].every(n => n > 0)
    || ![-1, 1].includes(art.sourceFacing) || !art.pivot
    || !(art.pivot.x > 0 && art.pivot.x < 1 && art.pivot.y > 0 && art.pivot.y <= 1))
    throw new Error(`V105 requires an accepted terrestrial user cutout: ${sourceNumber}`);
  return Object.freeze({ id, profileId, label, role, hp, speed, power, reach, special, factionId,
    sourceNumber, path: art.path, sha256: art.sha256,
    sourceWidth: art.sourceWidth, sourceHeight: art.sourceHeight,
    alphaBounds: art.alphaBounds, pivot: art.pivot, sourceFacing: art.sourceFacing,
    bodyWidth: art.bodyWidth, bodyHeight: art.bodyHeight,
    animationStatus: 'missing', reviewStatus: 'accepted-static-adaptation', canonExact: false,
    sourcePreserved: true, geometryStatus: 'existing-v95-project-adaptation',
    admissionNote: 'Illustration utilisateur terrestre déjà admise ; sélection de duel ajoutée sans nouvelle caste canonique ni pouvoir spécialisé. PNG natif inchangé.' });
}));
