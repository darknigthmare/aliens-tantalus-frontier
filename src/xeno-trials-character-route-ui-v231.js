import { XENO_TRIALS_CHARACTER_ROUTES_BRANCH_V231 as branch,
  resolveXenoTrialsCharacterRouteChapterV231 } from './xeno-trials-character-routes-v231.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
export const routeTextV231 = (entry, key, language) => language === 'en' ? entry[key + 'En'] || entry[key] : entry[key];

export function displayXenoTrialsRouteEntryV231(entry, language = 'fr') {
  if (!entry) return entry;
  const display = { ...entry };
  for (const key of ['title', 'briefing', 'act', 'supervisor', 'event'])
    display[key] = display[key + 'En'] = routeTextV231(entry, key, language);
  if (entry.open === false) {
    const english = language === 'en';
    display.title = display.titleEn = english ? 'Sealed reading' : 'Relevé scellé';
    display.act = display.actEn = english ? 'MIRE / SEALED DOSSIER' : 'MIRE / DOSSIER SCELLÉ';
    display.briefing = display.briefingEn = english ? 'Validate the previous chapter to open this dossier.' : 'Validez le chapitre précédent pour ouvrir ce dossier.';
    display.opponentId = display.stageId = null;
    display.event = display.eventEn = '';
  }
  return display;
}

export function routeRuleTextV231(french, language) {
  return language !== 'en' ? french : french.replace('Aucun spécial', 'No specials')
    .replace('Spéciaux verrouillés pendant 20 s', 'Specials locked for 20 s')
    .replace('1 PV au départ', 'Start at 1 HP').replace(/Survivre (\d+) s/g, 'Survive $1 s')
    .replace(/(\d+) secondes par manche/g, '$1 seconds per round')
    .replace('Deux manches gagnantes · Règles standard', 'Win two rounds · Standard rules');
}

/** A loan is checked against the open authored chapter, never the card label
 * or an arbitrary forced-player flag. Permanent ownership remains separate. */
export function canUseXenoTrialsCharacterRouteFighterV231(state, id, activity) {
  if (state?.unlocked?.includes(id)) return true;
  if (activity?.branch !== branch) return false;
  const chapter = resolveXenoTrialsCharacterRouteChapterV231(activity.id, state?.modesV119);
  return Boolean(chapter && chapter.forcedPlayerId === id && activity.forcedPlayerId === id);
}

export function renderXenoTrialsCharacterRouteStoryV231(view, language = 'fr', image = '') {
  if (!view) return '';
  const english = language === 'en';
  const text = key => escape(routeTextV231(view, key, language));
  const logs = view.chapters.filter(chapter => chapter.cleared).map(chapter =>
    `<li><strong>${escape(routeTextV231(chapter, 'act', language))}</strong><p>${escape(routeTextV231(chapter, 'event', language))}</p></li>`).join('');
  return `<div class="xt-briefing-identity" data-xt-route-story="${view.id}">
    <p class="eyebrow">MIRE / ${english ? 'SPECIMEN ROUTE' : 'PARCOURS DU SPÉCIMEN'}</p>
    <h2>${text('label')}</h2>${image}
    <p>${view.completed ? english ? 'Permanent MIRE authorization. Big Chap is available in the roster.' : 'Autorisation permanente MIRE. Big Chap est disponible dans le registre.'
      : english ? 'Big Chap is assigned to these trials on loan. Complete the route to retain its authorization.' : 'Big Chap est prêté pour ces épreuves. Terminez le parcours pour conserver son autorisation.'}</p>
    <strong>${view.clearedCount} / ${view.chapters.length} ${english ? 'READINGS VALIDATED' : 'RELEVÉS VALIDÉS'}</strong>
  </div><div class="xt-briefing-orders">
    <h3>${view.completed ? english ? 'Epilogue' : 'Épilogue' : english ? 'Prologue' : 'Prologue'}</h3>
    <p>${text(view.completed ? 'epilogue' : 'prologue')}</p>
    ${view.completed ? `<details><summary>${english ? 'Read the prologue' : 'Relire le prologue'}</summary><p>${text('prologue')}</p></details>` : ''}
    ${logs ? `<details open><summary>${english ? 'Observation log' : 'Journal d’observation'}</summary><ol>${logs}</ol></details>` : ''}
  </div>`;
}
