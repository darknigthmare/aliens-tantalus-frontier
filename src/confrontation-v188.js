// V188 — no-shooting audience: registry and save access (spec 010). Pure, no DOM.
// The rules are in confrontation-state-v188.js, the data entries in
// confrontation-entries-v188.js, the Canvas presentation in confrontation-ui-v188.js.
//
// API for other lots (e.g. station S2 / CASSIUS):
//   getConfrontationV188(id)                      → frozen definition or null
//   registerConfrontationV188(def)                → adds a validated data entry (throws on error)
//   confrontationPiecesV188(save, id, language)   → pieces of the audience, held or not, spent or not
//   confrontationStateV188(save, id)              → stored run (or null if never started)
//   startConfrontationV188(save, id)              → creates the run (mutates the candidate save)
//   playConfrontationMoveV188(save, id, pieceId)  → one exchange; pieceId null = silence (mutates)
//   confrontationOutcomeV188(save, id)            → 'won' | 'lost' | null
//   confrontationDecisionV188(save, id)           → def.outcomes[outcome] (the existing decision value) | null
//   confrontationViewV188(save, id, language)     → texts and gauges for a presentation
import { normalizeStoryCampaignV188 } from './story-campaign-v188.js';
import { storyDossierV188 } from './story-dossier-v188.js';
import { CONFRONTATION_ENTRIES_V188 } from './confrontation-entries-v188.js';
import { validateConfrontationDefinitionV188, createConfrontationRunV188, normalizeConfrontationRunV188, applyConfrontationMoveV188,
  confrontationWinnableV188, CONFRONTATION_GAINS_V188 } from './confrontation-state-v188.js';

export * from './confrontation-state-v188.js';
export { HALLORAN_QUAY_AUDIENCE_V188, CASSIUS_INTERROGATION_V188, CONFRONTATION_ENTRIES_V188 } from './confrontation-entries-v188.js';

const L = language => language === 'en' ? 'en' : 'fr';
const registry = new Map();

export function registerConfrontationV188(def) {
  const errors = validateConfrontationDefinitionV188(def);
  if (errors.length) throw new Error(`Confrontation ${def?.id || '?'}: ${errors.join('; ')}`);
  if (registry.has(def.id) && registry.get(def.id) !== def) throw new Error(`Confrontation ${def.id}: already registered`);
  registry.set(def.id, def); return def;
}
for (const entry of CONFRONTATION_ENTRIES_V188) registerConfrontationV188(entry);

export const getConfrontationV188 = id => registry.get(id) || null;
export const confrontationIdsV188 = () => [...registry.keys()];

/** Ids of the pieces of this audience held in the save (always read from the dossier, never granted). */
export function confrontationHeldIdsV188(save, id) {
  const def = getConfrontationV188(id); if (!def) return [];
  return storyDossierV188(save).pieces.filter(piece => piece.held && def.pieces.includes(piece.id)).map(piece => piece.id);
}

export function confrontationStateV188(save, id) {
  const def = getConfrontationV188(id); if (!def) return null;
  const raw = normalizeStoryCampaignV188(save?.storyCampaignV188).confrontationsV188?.[id];
  return raw ? normalizeConfrontationRunV188(raw, def) : null;
}
function writeRun(save, id, run) {
  const story = normalizeStoryCampaignV188(save.storyCampaignV188);
  story.confrontationsV188 = { ...(story.confrontationsV188 || {}), [id]: run };
  save.storyCampaignV188 = story;
}

/** Creates the run once. Mutates the candidate save; true when it changed. */
export function startConfrontationV188(save, id) {
  const def = getConfrontationV188(id);
  if (!def || !save || confrontationStateV188(save, id)) return false;
  writeRun(save, id, createConfrontationRunV188(def)); return true;
}

/** One exchange, saved at once (a reload resumes at the next round). Returns { result, status, ... } or null. */
export function playConfrontationMoveV188(save, id, pieceId = null) {
  const def = getConfrontationV188(id), run = confrontationStateV188(save, id);
  if (!def || !run) return null;
  const move = applyConfrontationMoveV188(def, run, pieceId, confrontationHeldIdsV188(save, id));
  if (!move) return null;
  writeRun(save, id, move.run);
  return Object.freeze({ result: move.result, piece: pieceId, status: move.run.status, ground: move.run.ground, credibility: move.run.credibility, round: move.run.round,
    gain: CONFRONTATION_GAINS_V188[move.result] });
}

export function confrontationOutcomeV188(save, id) {
  const status = confrontationStateV188(save, id)?.status;
  return status === 'won' || status === 'lost' ? status : null;
}
export function confrontationDecisionV188(save, id) {
  const outcome = confrontationOutcomeV188(save, id);
  return outcome ? getConfrontationV188(id).outcomes[outcome] : null;
}

export function confrontationPiecesV188(save, id, language = 'fr') {
  const def = getConfrontationV188(id); if (!def) return Object.freeze([]);
  const lang = L(language), run = confrontationStateV188(save, id), dossier = storyDossierV188(save, lang);
  return Object.freeze(def.pieces.map(pieceId => {
    const piece = dossier.pieces.find(entry => entry.id === pieceId);
    return Object.freeze({ id: pieceId, label: piece?.label || pieceId, source: piece?.source || null, held: Boolean(piece?.held), spent: Boolean(run?.spent.includes(pieceId)) });
  }));
}

/** Everything a presentation shows, from the save. `last` is the latest exchange with its reply. */
export function confrontationViewV188(save, id, language = 'fr') {
  const def = getConfrontationV188(id); if (!def) return null;
  const lang = L(language), run = confrontationStateV188(save, id) || createConfrontationRunV188(def);
  const current = def.rounds[run.round] || null, held = confrontationHeldIdsV188(save, id);
  const lastEntry = run.log[run.log.length - 1] || null;
  const reply = entry => {
    if (!entry) return null;
    const round = def.rounds[entry.round];
    return entry.result === 'decisive' ? `${round.replies?.decisive?.[lang] || ''} ${def.replies.decisive[lang]}`.trim() : def.replies[entry.result][lang];
  };
  return Object.freeze({
    id, title: def.title[lang], intro: def.intro[lang], interlocutor: def.interlocutor.name[lang], role: def.interlocutor.role?.[lang] || '',
    portrait: def.interlocutor.portrait, slot: def.interlocutor.slot || null, witness: def.witness?.name?.[lang] || null,
    status: run.status, round: run.round, rounds: def.rounds.length, ground: run.ground, target: def.target,
    credibility: run.credibility, credibilityMax: def.credibility,
    citation: current ? current.citation[lang] : null, source: current ? current.source[lang] : null,
    last: lastEntry ? Object.freeze({ ...lastEntry, reply: reply(lastEntry) }) : null,
    ending: run.status === 'open' ? null : def.endings[run.status][lang],
    winnable: confrontationWinnableV188(def, run, held),
    pieces: confrontationPiecesV188(save, id, lang)
  });
}
