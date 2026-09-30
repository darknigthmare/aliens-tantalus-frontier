import { ENEMY_IMPORT_ADMISSIONS_V103 } from './enemy-import-admissions-v103.js';
import { ENEMY_IMPORT_ADMISSIONS_V105 } from './enemy-import-admissions-v105.js';
import { ENEMY_IMPORT_ADMISSIONS_V106 } from './enemy-import-admissions-v106.js';
import { USER_SPECIMEN_ART_V106 } from './user-specimens-v106.js';
import { ENEMY_SPRITE_REVISIONS_V92 } from './enemy-sprite-revisions-v92.js';
import { ENEMY_SPRITE_REVISIONS_V93 } from './enemy-sprite-revisions-v93.js';

const existing = new Map([
  ['reference-v100-altered-smasher', ENEMY_SPRITE_REVISIONS_V92[0]],
  ['reference-v100-altered-chrysalis', ENEMY_SPRITE_REVISIONS_V93[0]]
]);

// Only actual reviewed derivatives are linked. Originals never become sprites.
export function getReferenceAdaptationV106(referenceId) {
  const previous = existing.get(referenceId);
  if (previous) return Object.freeze({ status: 'existing-combat-pose',
    art: Object.freeze({ ...previous, reviewNote: 'Pose préexistante réutilisée pour ce personnage ; cet original reste conservé séparément. ' + previous.referenceNote }),
    profileId: previous.profileId });
  for (const [revision, entries] of [[103, ENEMY_IMPORT_ADMISSIONS_V103], [105, ENEMY_IMPORT_ADMISSIONS_V105], [106, ENEMY_IMPORT_ADMISSIONS_V106]]) {
    const art = entries.find(entry => entry.referenceId === referenceId);
    if (art) return Object.freeze({ status: 'combat-pose', art, profileId: `pose-v${revision}-import-${art.slug}` });
  }
  const art = USER_SPECIMEN_ART_V106.find(entry => entry.referenceId === referenceId);
  if (art) return Object.freeze({ status: 'confinement-pose', art, profileId: null });
  return Object.freeze({ status: 'reference-only', art: null, profileId: null });
}
