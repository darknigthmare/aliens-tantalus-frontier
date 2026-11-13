// V188 — storyCampaign: the first-hour vertical slice as one campaign state
// (bible §53.1, §11). The existing step machines stay the source of truth
// (onboardingV84, openingV88, openingExerciseV89, portMeridienV90, operations).
// This module derives the current step from them and persists only what no
// other record holds: which story debriefs the player has opened.
import { currentLanguageV185 } from './i18n-v185.js';

export const STORY_RELAY_CAMPAIGN_ID_V188 = 'special-archive-relay';
export const STORY_SLICE_STEPS_V188 = Object.freeze(['creation', 'wake', 'ship', 'port', 'briefing', 'qz18', 'debrief', 'next']);
const MAX_SEEN = 32;

const TEXT = Object.freeze({
  briefing: {
    fr: 'BRIEFING · Port-Méridien attend des réponses. Salle de briefing, table tactique : préparez « Le dernier relais » (QZ-18), puis déployez.',
    en: 'BRIEFING · Port-Méridien wants answers. Briefing room, tactical table: prepare "The Last Relay" (QZ-18), then deploy.'
  },
  qz18: {
    fr: 'ACTE II · QZ-18 : reconstituez le dossier du relais et revenez à bord.',
    en: 'ACT II · QZ-18: rebuild the relay case file and return aboard.'
  },
  debrief: {
    fr: 'COMPTE RENDU · Salle de briefing, table tactique : lisez le dossier de QZ-18 et la suite recommandée.',
    en: 'DEBRIEF · Briefing room, tactical table: read the QZ-18 case file and the recommended next step.'
  },
  next: {
    fr: 'COCYTE · Salle de briefing, table tactique : poursuivez la campagne avec le chapitre recommandé (★).',
    en: 'COCYTE · Briefing room, tactical table: continue the campaign with the recommended chapter (★).'
  }
});

export function createStoryCampaignV188() { return { schema: 188, debriefSeen: [], cinematicsSeen: [] }; }

export function normalizeStoryCampaignV188(raw) {
  const base = createStoryCampaignV188();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
  const seen = Array.isArray(raw.debriefSeen) ? raw.debriefSeen : [];
  base.debriefSeen = [...new Set(seen.filter(id => typeof id === 'string' && /^[a-z0-9-]{1,80}$/.test(id)))].slice(0, MAX_SEEN);
  const cinematics = Array.isArray(raw.cinematicsSeen) ? raw.cinematicsSeen : [];
  base.cinematicsSeen = [...new Set(cinematics.filter(id => typeof id === 'string' && /^cin-[a-z0-9-]{1,40}$/.test(id)))].slice(0, MAX_SEEN);
  return base;
}

/** Mutates the given candidate save. Returns true when it changed. */
export function markStoryCinematicSeenV188(save, cinematicId) {
  if (!save || typeof cinematicId !== 'string' || !/^cin-[a-z0-9-]{1,40}$/.test(cinematicId)) return false;
  const state = normalizeStoryCampaignV188(save.storyCampaignV188);
  if (state.cinematicsSeen.includes(cinematicId)) { save.storyCampaignV188 = state; return false; }
  state.cinematicsSeen = [...state.cinematicsSeen, cinematicId].slice(-MAX_SEEN);
  save.storyCampaignV188 = state; return true;
}

/** Mutates the given candidate save. Returns true when it changed. */
export function markStoryDebriefSeenV188(save, campaignId) {
  if (!save || typeof campaignId !== 'string') return false;
  const state = normalizeStoryCampaignV188(save.storyCampaignV188);
  if (state.debriefSeen.includes(campaignId)) { save.storyCampaignV188 = state; return false; }
  state.debriefSeen = [...state.debriefSeen, campaignId].slice(-MAX_SEEN);
  save.storyCampaignV188 = state; return true;
}

const phase = value => value && typeof value === 'object' ? value.phase : null;

/** Derived, never stored: the current step of the first hour. */
export function deriveStoryCampaignV188(save, { language = null } = {}) {
  const lang = language || (() => { try { return currentLanguageV185(); } catch { return 'fr'; } })();
  const pick = key => TEXT[key][lang === 'en' ? 'en' : 'fr'];
  const story = normalizeStoryCampaignV188(save?.storyCampaignV188);
  const completed = Array.isArray(save?.galaxy?.completedCampaignIds) ? save.galaxy.completedCampaignIds : [];
  const current = save?.strategy?.currentOperation || null;
  const result = (step, objective = null, recommendedCampaignId = null) => Object.freeze({ step, objective, recommendedCampaignId,
    index: STORY_SLICE_STEPS_V188.indexOf(step), relayComplete: completed.includes(STORY_RELAY_CAMPAIGN_ID_V188) });
  if (!save || save.needsPlayerCreationV84) return result('creation');
  if (save.onboardingV84 && phase(save.onboardingV84) !== 'complete') return result('wake');
  const opening = phase(save.openingV88);
  if (save.openingV88 && !['ready', 'deployed', 'complete'].includes(opening)) return result('ship');
  if (save.portMeridienV90 && phase(save.portMeridienV90) !== 'complete') return result('port');
  if (current?.campaignId === STORY_RELAY_CAMPAIGN_ID_V188) return result('qz18', pick('qz18'), STORY_RELAY_CAMPAIGN_ID_V188);
  if (!completed.includes(STORY_RELAY_CAMPAIGN_ID_V188)) {
    // Only the default route: a player already engaged elsewhere keeps control.
    return result('briefing', current ? null : pick('briefing'), STORY_RELAY_CAMPAIGN_ID_V188);
  }
  if (!story.debriefSeen.includes(STORY_RELAY_CAMPAIGN_ID_V188)) return result('debrief', current ? null : pick('debrief'), STORY_RELAY_CAMPAIGN_ID_V188);
  // After QZ-18, the chronological Act I (QZ-17) is recommended until it is done.
  const actOne = 'special-narrative-qz17';
  return result('next', current ? null : pick('next'), completed.includes(actOne) ? null : actOne);
}

// The four playable Cocyte chapters (bible §5, Lethe continuity V163). Until a
// dedicated Act V exists, finishing all four is the current end of the story.
export const STORY_ENDING_CHAPTERS_V188 = Object.freeze(['special-archive-relay', 'special-apc-convoy', 'special-c12-horde', 'special-black-cocoon']);
export function storyEndingReachedV188(save) {
  const completed = Array.isArray(save?.galaxy?.completedCampaignIds) ? save.galaxy.completedCampaignIds : [];
  return STORY_ENDING_CHAPTERS_V188.every(id => completed.includes(id));
}
