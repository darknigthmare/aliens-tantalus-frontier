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

export function createStoryCampaignV188() { return { schema: 188, debriefSeen: [], cinematicsSeen: [], m577Manifest: null, interlude: null }; }

export function normalizeStoryCampaignV188(raw) {
  const base = createStoryCampaignV188();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
  const seen = Array.isArray(raw.debriefSeen) ? raw.debriefSeen : [];
  base.debriefSeen = [...new Set(seen.filter(id => typeof id === 'string' && /^[a-z0-9-]{1,80}$/.test(id)))].slice(0, MAX_SEEN);
  const cinematics = Array.isArray(raw.cinematicsSeen) ? raw.cinematicsSeen : [];
  base.cinematicsSeen = [...new Set(cinematics.filter(id => typeof id === 'string' && /^cin-[a-z0-9-]{1,40}$/.test(id)))].slice(0, MAX_SEEN);
  base.m577Manifest = normalizeM577ManifestV188(raw.m577Manifest);
  base.interlude = normalizeInterludeV188(raw.interlude);
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
  if (story.interlude?.phase === 'alert' || story.interlude?.phase === 'choice') {
    const text = story.interlude.phase === 'alert'
      ? { fr: 'QUARANTAINE À BORD · Pont 2, salle de quarantaine : neutralisez la menace. Jun Park ne répond plus.', en: 'QUARANTINE ABOARD · Deck 2, quarantine room: neutralise the threat. Jun Park is not answering.' }
      : { fr: 'QUARANTAINE · Décidez du sort de la créature : la détruire ou la capturer pour Inez et BISHOP-9.', en: 'QUARANTINE · Decide the creature’s fate: destroy it or capture it for Inez and BISHOP-9.' };
    return Object.freeze({ step: 'interlude', objective: text[lang === 'en' ? 'en' : 'fr'], recommendedCampaignId: null, index: STORY_SLICE_STEPS_V188.length,
      relayComplete: (Array.isArray(save?.galaxy?.completedCampaignIds) ? save.galaxy.completedCampaignIds : []).includes(STORY_RELAY_CAMPAIGN_ID_V188) });
  }
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

// —— Act III: the M577 manifest (bible §5.3) ——
// The company order requires three sealed containers; Asha asks for seats for
// the C-12 workers. Six places in all; each container removes two.
export const M577_MANIFEST_V188 = Object.freeze({ seats: 6, maxContainers: 3, seatsPerContainer: 2 });
export function m577ManifestFromContainersV188(containers) {
  const count = Math.max(0, Math.min(M577_MANIFEST_V188.maxContainers, Math.floor(Number(containers) || 0)));
  return { containers: count, colonists: M577_MANIFEST_V188.seats - count * M577_MANIFEST_V188.seatsPerContainer, resolved: false };
}
export function normalizeM577ManifestV188(raw) {
  if (!raw || typeof raw !== 'object' || !Number.isInteger(raw.containers)) return null;
  return { ...m577ManifestFromContainersV188(raw.containers), resolved: raw.resolved === true };
}
/** Mutates the candidate save. Consequence (bible §5.3): the colonists brought
 * back join Port-Méridien's population once, when C-12 is completed. */
export function resolveM577ManifestV188(save, worldId) {
  const story = normalizeStoryCampaignV188(save?.storyCampaignV188), manifest = story.m577Manifest;
  if (!manifest || manifest.resolved) return false;
  const world = save?.galaxy?.worldState?.[worldId];
  if (world && Number.isFinite(world.population)) world.population += manifest.colonists;
  story.m577Manifest = { ...manifest, resolved: true }; save.storyCampaignV188 = story; return true;
}

// —— Interlude « Quarantaine » (bible §5.4) on the existing hub crisis system ——
export const INTERLUDE_PHASES_V188 = Object.freeze(['alert', 'choice', 'resolved']);
export const INTERLUDE_OUTCOMES_V188 = Object.freeze(['destroyed', 'captured']);
export const INTERLUDE_CRISIS_V188 = Object.freeze({ kind: 'xenomorph', deck: 2, roomId: 'quarantine' });
export const BISHOP_TRUST_DROP_V188 = 20; // about one NPC_TRUST_LEVELS_V62 band
export function normalizeInterludeV188(raw) {
  if (!raw || typeof raw !== 'object' || !INTERLUDE_PHASES_V188.includes(raw.phase)) return null;
  const crisisId = typeof raw.crisisId === 'string' && /^[a-z0-9-]{1,80}$/.test(raw.crisisId) ? raw.crisisId : null;
  const outcome = INTERLUDE_OUTCOMES_V188.includes(raw.outcome) ? raw.outcome : null;
  return { phase: raw.phase === 'resolved' && !outcome ? 'choice' : raw.phase, crisisId, outcome };
}
/** Starts after Act III's manifest is resolved: a container (or the quay patient) opened in quarantine. */
export function interludeDueV188(save) {
  const story = normalizeStoryCampaignV188(save?.storyCampaignV188);
  return Boolean(story.m577Manifest?.resolved && !story.interlude);
}
export function startInterludeV188(save, createCrisis) {
  if (!interludeDueV188(save) || typeof createCrisis !== 'function') return null;
  const crisis = createCrisis(save, { ...INTERLUDE_CRISIS_V188, force: true });
  if (!crisis?.id) return null;
  const story = normalizeStoryCampaignV188(save.storyCampaignV188);
  story.interlude = { phase: 'alert', crisisId: crisis.id, outcome: null }; save.storyCampaignV188 = story;
  return crisis;
}
export function interludeCrisisClearedV188(save, crisisId) {
  const story = normalizeStoryCampaignV188(save?.storyCampaignV188);
  if (story.interlude?.phase !== 'alert' || story.interlude.crisisId !== crisisId) return false;
  story.interlude = { ...story.interlude, phase: 'choice' }; save.storyCampaignV188 = story; return true;
}
/** Records the choice; BISHOP-9's trust drops one level once (CIN-41). */
export function resolveInterludeV188(save, outcome) {
  const story = normalizeStoryCampaignV188(save?.storyCampaignV188);
  if (story.interlude?.phase !== 'choice' || !INTERLUDE_OUTCOMES_V188.includes(outcome)) return false;
  story.interlude = { ...story.interlude, phase: 'resolved', outcome }; save.storyCampaignV188 = story;
  const bishop = save.crew?.find?.(member => member.id === 'crew-05-bishop-9');
  if (bishop && Number.isFinite(bishop.loyalty)) bishop.loyalty = Math.max(0, bishop.loyalty - BISHOP_TRUST_DROP_V188);
  return true;
}
