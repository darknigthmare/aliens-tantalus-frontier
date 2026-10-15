import { resolveCrewDefinitionV85, sanitizeRecruitProfileV85 } from './crew-recruitment-v85.js';
import { buildCrewConversationV120, renderCrewConversationV120, selectCrewConversationTopicV120 } from './crew-conversations-v120.js';

const record = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const list = value => Array.isArray(value) ? value : [];
const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const TOPICS = new Set(['readiness', 'background', 'anchor', 'approach', 'debrief', 'team', 'training', 'equipment']);
const KEY = /^v135-[0-9a-f]{16}-[0-9a-f]{1,5}$/;
export const MAX_CREW_CONVERSATION_MEMORIES_V135 = 256;

function absoluteHour(day, hour) {
  return Number.isInteger(day) && day >= 1 && day <= 100000
    && typeof hour === 'number' && Number.isFinite(hour) && hour >= 0 && hour <= 24 ? (day - 1) * 24 + hour : null;
}
function serviceRoster(crew, catalog) {
  const counts = new Map();
  for (const member of list(crew)) if (typeof member?.id === 'string') counts.set(member.id, (counts.get(member.id) || 0) + 1);
  return list(crew).filter(member => record(member) && counts.get(member.id) === 1 && !member.candidate && !member.archive
    && !(member.recruitV85 && !sanitizeRecruitProfileV85(member.recruitV85)))
    .map(member => resolveCrewDefinitionV85(member, catalog)).filter(Boolean);
}

// These short keys compare authored answer/evidence context. They are neither
// service receipts nor signatures proving an imported conversation happened.
function contextKey(crewId, topic) {
  const value = JSON.stringify([crewId, topic.id, topic.source, topic.answer, topic.evidence]);
  let left = 0x811c9dc5, right = 0x9e3779b9;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    left = Math.imul(left ^ code, 0x01000193) >>> 0;
    right = Math.imul(right ^ code, 0x85ebca6b) >>> 0;
  }
  return `v135-${left.toString(16).padStart(8, '0')}${right.toString(16).padStart(8, '0')}-${value.length.toString(16)}`;
}

/** A bounded reading ledger, never a fabricated relationship or service event.
 * Only current, validated live crew and known dossier topics survive import.
 * Old context keys remain useful to signal an actual changed dossier answer.
 */
export function normalizeCrewConversationMemoryV135(value, { crew = [], catalog = [], campaignCatalog = [], equipmentCatalog = [], clock } = {}) {
  const empty = { schema: 135, entries: [] };
  if (!record(value) || value.schema !== 135 || !Array.isArray(value.entries)) return empty;
  const roster = serviceRoster(crew, catalog);
  const conversations = new Map(roster.map(member => [member.id, buildCrewConversationV120(member, { roster, campaignCatalog, equipmentCatalog })]));
  const now = clock === undefined ? 2400000 : absoluteHour(clock?.day, clock?.hour);
  if (now === null) return empty;
  const entries = new Map();
  for (const raw of value.entries.slice(-MAX_CREW_CONVERSATION_MEMORIES_V135 * 8)) {
    if (!record(raw) || typeof raw.crewId !== 'string' || raw.crewId.length > 120 || !TOPICS.has(raw.topicId)
      || typeof raw.contextKey !== 'string' || !KEY.test(raw.contextKey)) continue;
    const conversation = conversations.get(raw.crewId);
    if (conversation?.mode !== 'service') continue;
    const first = absoluteHour(raw.firstDay, raw.firstHour), last = absoluteHour(raw.lastDay, raw.lastHour);
    if (first === null || last === null || first > last || last > now) continue;
    const entry = { crewId: raw.crewId, topicId: raw.topicId, contextKey: raw.contextKey,
      firstDay: raw.firstDay, firstHour: raw.firstHour, lastDay: raw.lastDay, lastHour: raw.lastHour };
    const key = `${entry.crewId}/${entry.topicId}`, previous = entries.get(key);
    if (!previous || last >= absoluteHour(previous.lastDay, previous.lastHour)) entries.set(key, entry);
  }
  return { schema: 135, entries: [...entries.values()]
    .sort((left, right) => absoluteHour(left.lastDay, left.lastHour) - absoluteHour(right.lastDay, right.lastHour)
      || left.crewId.localeCompare(right.crewId) || left.topicId.localeCompare(right.topicId))
    .slice(-MAX_CREW_CONVERSATION_MEMORIES_V135) };
}

/** Read-only presentation: displaying a default topic never records a visit. */
export function getCrewConversationRecallV135(memory, member, topic, { roster = [], clock } = {}) {
  if (!member || member.candidate || member.archive || member.status === 'deceased' || !TOPICS.has(topic?.id)
    || !list(roster).some(entry => entry?.id === member.id && !entry.candidate && !entry.archive && entry.status !== 'deceased')) return null;
  const normalized = normalizeCrewConversationMemoryV135(memory, { crew: roster, catalog: roster, clock });
  const entry = normalized.entries.find(item => item.crewId === member.id && item.topicId === topic.id);
  const key = contextKey(member.id, topic);
  return { state: !entry ? 'new' : entry.contextKey === key ? 'reviewed' : 'changed', contextKey: key,
    previous: entry ? { firstDay: entry.firstDay, firstHour: entry.firstHour, lastDay: entry.lastDay, lastHour: entry.lastHour } : null };
}

/** Run on a transaction candidate. Durable storage and owner checks belong to
 * commitCrewTransactionV85; the UI confirms only its accepted result.
 * Reopening identical context is a strict no-op, including its timestamps.
 */
export function rememberCrewConversationTopicV135(save, crewId, topicId, { catalog = [], campaignCatalog = [], equipmentCatalog = [] } = {}) {
  if (!record(save) || !TOPICS.has(topicId)) throw new Error('Sujet de liaison indisponible.');
  const now = absoluteHour(save.clock?.day, save.clock?.hour);
  if (now === null) throw new Error('Horloge de campagne indisponible.');
  if (save.strategy?.currentOperation || save.needsPlayerCreationV84 || save.onboardingV84 && save.onboardingV84.phase !== 'complete') {
    throw new Error('Reprenez les échanges après le retour à bord et la fin de l’accueil.');
  }
  const roster = serviceRoster(save.crew, catalog), member = roster.find(entry => entry.id === crewId && entry.status !== 'deceased');
  const conversation = member && buildCrewConversationV120(member, { roster, campaignCatalog, equipmentCatalog });
  const topic = conversation?.mode === 'service' && conversation.topics.find(entry => entry.id === topicId);
  if (!topic) throw new Error('Ce membre ne répond pas au canal de liaison actif.');
  const normalized = normalizeCrewConversationMemoryV135(save.crewConversationMemoryV135, { crew: save.crew, catalog, campaignCatalog, equipmentCatalog, clock: save.clock });
  const previous = normalized.entries.find(entry => entry.crewId === crewId && entry.topicId === topicId);
  const key = contextKey(crewId, topic), kind = !previous ? 'first' : previous.contextKey === key ? 'unchanged' : 'changed';
  if (kind !== 'unchanged') {
    const entry = { crewId, topicId, contextKey: key, firstDay: previous?.firstDay ?? save.clock.day,
      firstHour: previous?.firstHour ?? save.clock.hour, lastDay: save.clock.day, lastHour: save.clock.hour };
    const entries = normalized.entries.filter(item => item.crewId !== crewId || item.topicId !== topicId);
    entries.push(entry);
    save.crewConversationMemoryV135 = normalizeCrewConversationMemoryV135({ schema: 135, entries }, { crew: save.crew, catalog, campaignCatalog, equipmentCatalog, clock: save.clock });
  }
  return { ok: true, changed: kind !== 'unchanged', crewId, topicId, contextKey: key, kind, hours: 0, quote: {} };
}

const moment = (day, hour) => `jour ${day}, ${Math.floor(hour).toString().padStart(2, '0')}:${Math.floor((hour % 1) * 60 + 1e-7).toString().padStart(2, '0')}`;

export function renderCrewConversationWithMemoryV135(conversation, selectedId, recall, { showAnswer = false, status = '' } = {}) {
  const html = renderCrewConversationV120(conversation, selectedId);
  if (!html || conversation.mode !== 'service' || !recall) return html;
  const selected = selectCrewConversationTopicV120(conversation, selectedId);
  if (!selected) return html;
  const when = recall.previous && moment(recall.previous.lastDay, recall.previous.lastHour);
  const cue = recall.state === 'new' ? 'Sujet encore absent du carnet de liaison. Choisissez ce sujet pour conserver cet échange.'
    : recall.state === 'changed' ? `Le dossier a évolué depuis notre échange du ${when}. Choisissez ce sujet pour faire le point.`
      : `Nous avons déjà fait le point sur ce sujet — ${when}. Le dossier présenté ici est inchangé.`;
  const answer = recall.state === 'reviewed' && !showAnswer
    ? `<details data-v135-recall-answer><summary>Relire la réponse du dossier</summary><blockquote data-v120-conversation-answer>${esc(selected.answer)}</blockquote></details>`
    : `<blockquote aria-live="polite" aria-atomic="true" data-v120-conversation-answer>${esc(selected.answer)}</blockquote>`;
  return html.replace(/<blockquote aria-live="polite" aria-atomic="true" data-v120-conversation-answer>[\s\S]*?<\/blockquote>/,
    `<p data-v135-conversation-memory data-v135-recall-state="${recall.state}">${esc(cue)}</p>${answer}<p data-v135-conversation-status role="status" aria-live="polite">${esc(status)}</p>`);
}
