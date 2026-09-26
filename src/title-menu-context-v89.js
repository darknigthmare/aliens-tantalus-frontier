import { getPlayerOnboardingObjectiveV84 } from './player-onboarding-v84.js';
import { getPlayerOpeningObjectiveV88 } from './player-opening-v88.js';
import { getOpeningExerciseObjectiveV89 } from './opening-exercise-v89.js';
import { getPortMeridienObjectiveV90 } from './port-meridien-v90.js';

// Read-only presentation adapter. Existing domain objectives own their wording
// and phase order; the title neither advances them nor infers an orbital camera.
export function resolveTitleMenuContextV89(save = {}) {
  const ordinaryLabel = save?.statistics?.playSeconds > 0 ? 'CONTINUER' : 'ENTRER SUR LE TANTALUS';
  const model = (kind, summary, continueLabel = ordinaryLabel) => Object.freeze({ kind, summary, continueLabel });
  if (save?.needsPlayerCreationV84 === true) return model('character-creation',
    'Créez le personnage de ce profil pour commencer à bord du Tantalus.', 'CRÉER MON PERSONNAGE');
  const welcome = getPlayerOnboardingObjectiveV84(save?.onboardingV84);
  if (welcome && !welcome.completed) return model('welcome', welcome.text, 'REPRENDRE L’ACCUEIL');
  const opening = getPlayerOpeningObjectiveV88(save?.openingV88, save?.onboardingV84);
  const exercise = opening && getOpeningExerciseObjectiveV89(save?.openingExerciseV89, save?.openingV88, save?.onboardingV84);
  if (exercise) return model('exercise', exercise.text, 'REPRENDRE L’EXERCICE');
  const quay = opening && getPortMeridienObjectiveV90(save?.portMeridienV90, save?.openingV88, save?.onboardingV84);
  if (quay) return model('port-meridien', quay.text, quay.phase === 'pending' ? 'REJOINDRE LE QUAI' : 'REPRENDRE LE QUAI');
  if (opening && opening.phase !== 'deployed') return model('opening', opening.text, 'REPRENDRE LA PRISE DE POSTE');
  if (save?.strategy?.currentOperation) return model('operation', opening?.text
    || 'Une opération est engagée. Retrouvez sa préparation ou son point sauvegardé depuis le déploiement.', 'REPRENDRE L’OPÉRATION');
  if (save?.scene === 'mission') return model('operation-route', 'Retrouvez votre déploiement dans les opérations.');
  return model('ship', 'Reprenez votre partie à bord du Tantalus.');
}

// An immutable timeline stamp survives a settings transaction, unlike object
// identity; missing ownership evidence must never restore a previous menu state.
export function titleMenuOwnerV89(save) {
  return Number.isInteger(save?.profile) && save.profile > 0
    && Number.isFinite(save?.createdAt) && save.createdAt > 0
    ? Object.freeze({ profile: save.profile, createdAt: save.createdAt }) : null;
}

export function sameTitleMenuOwnerV89(owner, save) {
  const current = titleMenuOwnerV89(save);
  return Boolean(owner && current && owner.profile === current.profile && owner.createdAt === current.createdAt);
}
