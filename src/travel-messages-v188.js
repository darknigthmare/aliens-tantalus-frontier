// V188 — messages received late during and after a hyperspace jump (bible
// §13.2 « Les messages suivent avec retard » : un appel reçu date déjà de
// plusieurs jours, la situation à l'arrivée est pire que le message ; §1.1 :
// les consignes de la compagnie arrivent toujours en retard et datées).
// Pure rules and texts (FR/EN), no DOM. Messages are generated once per jump,
// when its arrival is settled (`galaxy.jumpV116.completedAt` is the receipt),
// inside the same timed mutation as the 14 days of `galaxy-travel-v188.js`:
// the values they quote are those of the worlds *before* the simulation runs
// the days of travel, and the briefing table shows them beside today's values.
// The additive save field is `travelMessagesV188`. Delays and texts marked
// [PROPOSÉ] are recorded in bible §13.7.
import { JUMP_TRAVEL_DAYS_V188 } from './galaxy-travel-v188.js';

const t = (fr, en) => Object.freeze({ fr, en });
const L = language => language === 'en' ? 'en' : 'fr';
const has = (list, id) => Array.isArray(list) && list.includes(id);
const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));

export const TRAVEL_MESSAGE_KINDS_V188 = Object.freeze(['colony', 'asphodele', 'company', 'origin', 'destination']);
export const TRAVEL_MESSAGES_MAX_V188 = 30;
export const COCYTE_WORLD_ID_V188 = 'world-05-lethe';
// [PROPOSÉ] delays: by the QZ network a call loses days; through Asphodèle's relay room it loses fewer;
// the colony's own relay (Communications level 2) shortens the colony's own messages.
export const TRAVEL_DELAYS_V188 = Object.freeze({ qz: 6, relay: 2, company: 4, colonyRelay: 3, destination: 9, origin: 3 });

export function createTravelMessagesV188() { return { schema: 188, lastJumpAt: null, messages: [] }; }
const finite = (value, min, max) => { const number = Number(value); return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : null; };
export function normalizeTravelMessagesV188(raw) {
  const state = createTravelMessagesV188();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return state;
  state.lastJumpAt = Number.isSafeInteger(raw.lastJumpAt) ? raw.lastJumpAt : null;
  const list = Array.isArray(raw.messages) ? raw.messages : [];
  for (const entry of list) {
    if (!entry || typeof entry !== 'object' || !TRAVEL_MESSAGE_KINDS_V188.includes(entry.kind)) continue;
    const sentDay = finite(entry.sentDay, 1, 1e6), receivedDay = finite(entry.receivedDay, 1, 1e6);
    if (sentDay === null || receivedDay === null || receivedDay < sentDay) continue;
    const values = {};
    for (const key of ['infestation', 'stability', 'calls']) { const value = finite(entry.values?.[key], 0, 999); if (value !== null) values[key] = Math.round(value); }
    if (typeof entry.values?.tier === 'string' && /^[a-z]{1,16}$/.test(entry.values.tier)) values.tier = entry.values.tier;
    const worldId = typeof entry.worldId === 'string' && /^[a-z0-9-]{1,64}$/.test(entry.worldId) ? entry.worldId : null;
    state.messages.push({ id: typeof entry.id === 'string' ? entry.id.slice(0, 80) : `${entry.kind}-${sentDay}`, kind: entry.kind, worldId,
      sentDay: Math.floor(sentDay), receivedDay: Math.floor(receivedDay), phase: entry.phase === 'after' ? 'after' : 'during', values });
  }
  state.messages = state.messages.slice(-TRAVEL_MESSAGES_MAX_V188);
  return state;
}

const worldOf = (save, id) => save?.galaxy?.worldState?.[id] || null;
const relayReady = save => save?.asphodeleHubV188?.relayOnline === true || save?.asphodeleHubV188?.relayReady === true;
const colonyTier = save => {
  const sites = Object.values(save?.colonyV188?.sites || {});
  const atLeast = level => sites.filter(entry => Number(entry?.validated) >= level).length;
  return atLeast(2) >= 5 ? 'autonomous' : atLeast(1) >= 3 ? 'restored' : 'survival';
};

/**
 * Called once after `applyJumpTravelTimeV188` (the clock already holds the arrival day).
 * Mutates the candidate save; returns the messages added (empty when already delivered).
 * `relayReady` may be passed by the caller (the Asphodèle hub's predicate); it defaults to the saved flag.
 */
export function deliverTravelMessagesV188(save, settlement, { relayRoomReady = relayReady(save) } = {}) {
  const jump = save?.galaxy?.jumpV116;
  if (settlement?.status !== 'arrived' || jump?.phase !== 'arrived' || !Number.isSafeInteger(jump.completedAt) || !save.clock) return [];
  const state = normalizeTravelMessagesV188(save.travelMessagesV188);
  if (state.lastJumpAt === jump.completedAt) return [];
  const arrival = Math.max(1, Math.floor(Number(save.clock.day) || 1)), departure = Math.max(1, arrival - JUMP_TRAVEL_DAYS_V188);
  const origin = jump.originWorldId || null, destination = jump.destinationId || save.galaxy.shipWorldIdV116 || null;
  const done = save?.galaxy?.completedCampaignIds || [];
  const added = [];
  const push = (kind, worldId, sentDay, phase, values = {}) => {
    const sent = Math.max(1, Math.min(arrival, Math.floor(sentDay)));
    added.push({ id: `${kind}-${jump.completedAt}`, kind, worldId, sentDay: sent, receivedDay: arrival, phase, values });
  };
  const cocyte = worldOf(save, COCYTE_WORLD_ID_V188);
  // Port-Méridien keeps writing once the quay is held (P-3).
  if (save?.portMeridienV90?.phase === 'complete' && destination !== COCYTE_WORLD_ID_V188) {
    const delay = relayRoomReady ? TRAVEL_DELAYS_V188.relay : Number(save?.colonyV188?.sites?.comms?.validated) >= 2 ? TRAVEL_DELAYS_V188.colonyRelay : TRAVEL_DELAYS_V188.qz;
    push('colony', COCYTE_WORLD_ID_V188, arrival - delay, 'during', { infestation: cocyte?.infestation, stability: cocyte?.stability, tier: colonyTier(save) });
  }
  // A retaken Asphodèle relays the sector's calls (§13.1, §13.2).
  if (has(done, 'station-s4')) push('asphodele', COCYTE_WORLD_ID_V188, arrival - TRAVEL_DELAYS_V188.relay, 'during', { calls: 2 + (relayRoomReady ? 3 : 0) });
  // The company's directives always arrive late and dated (§1.1).
  push('company', null, departure + 1, 'during', {});
  // The world left behind went on without the Tantalus.
  if (origin && origin !== destination) push('origin', origin, departure + TRAVEL_DELAYS_V188.origin, 'after', { infestation: worldOf(save, origin)?.infestation, stability: worldOf(save, origin)?.stability });
  // The call from the destination is already old: the situation at arrival is worse than the message.
  if (destination) push('destination', destination, arrival - TRAVEL_DELAYS_V188.destination, 'after', { infestation: worldOf(save, destination)?.infestation, stability: worldOf(save, destination)?.stability });
  state.lastJumpAt = jump.completedAt;
  state.messages = [...state.messages, ...added];
  save.travelMessagesV188 = normalizeTravelMessagesV188(state);
  return added;
}

const TIER = Object.freeze({ survival: t('Survie', 'Survival'), restored: t('Rétablie', 'Restored'), autonomous: t('Autonome', 'Autonomous'), free: t('Libre', 'Free') });
const TEXT = Object.freeze({
  colony: Object.freeze({ from: t('Port-Méridien · Adèle Sarrazin', 'Port-Méridien · Adèle Sarrazin'),
    body: t('« Ici Port-Méridien, jour {sent}. Palier {tier}. Infestation autour du port : {infestation} %. On tient. Répondez quand vous pourrez. »',
      '"Port-Méridien here, day {sent}. Tier {tier}. Infestation around the port: {infestation}%. We are holding. Answer when you can."') }),
  asphodele: Object.freeze({ from: t('Station Asphodèle · salle des relais', 'Asphodèle station · relay room'),
    body: t('Asphodèle relaie {calls} appels du secteur, datés du jour {sent}. Ils attendront le retour du Tantalus.',
      'Asphodèle relays {calls} calls from the sector, dated day {sent}. They will wait for the Tantalus to return.') }),
  company: Object.freeze({ from: t('Weyland-Yutani · consigne', 'Weyland-Yutani · directive'),
    body: t('Consigne datée du jour {sent}, transmise par le réseau QZ : « Préserver le matériel sous scellés en transit. » Elle arrive avec {delay} jours de retard.',
      'Directive dated day {sent}, sent over the QZ network: "Preserve the sealed material in transit." It arrives {delay} days late.') }),
  origin: Object.freeze({ from: t('{world} · monde laissé derrière', '{world} · world left behind'),
    body: t('Bulletin du jour {sent} : infestation {infestation} %, stabilité {stability} %. Aujourd’hui : infestation {nowInfestation} %.',
      'Bulletin of day {sent}: infestation {infestation}%, stability {stability}%. Today: infestation {nowInfestation}%.') }),
  destination: Object.freeze({ from: t('{world} · appel reçu à l’arrivée', '{world} · call received on arrival'),
    body: t('Appel daté du jour {sent} : infestation {infestation} %. À l’arrivée, {delay} jours plus tard : {nowInfestation} %.',
      'Call dated day {sent}: infestation {infestation}%. On arrival, {delay} days later: {nowInfestation}%.') })
});
export const TRAVEL_MESSAGES_TEXT_V188 = Object.freeze({
  heading: t('MESSAGES REÇUS EN RETARD', 'MESSAGES RECEIVED LATE'),
  arrived: t('{n} messages reçus en retard pendant l’hypersommeil : voir le Commandement.', '{n} messages received late during hypersleep: see Command.'),
  during: t('PENDANT LE SAUT', 'DURING THE JUMP'), after: t('À L’ARRIVÉE', 'ON ARRIVAL'), late: t('RETARD +{delay} J', 'DELAY +{delay} D')
});

/** Display text for one message, in the current language; `worldName(id)` names a world. */
export function travelMessageTextV188(message, save, language = 'fr', worldName = id => id) {
  const lang = L(language), text = TEXT[message?.kind];
  if (!text) return null;
  const now = message.worldId ? worldOf(save, message.worldId) : null;
  const delay = message.receivedDay - message.sentDay;
  const values = { ...message.values, sent: message.sentDay, delay, world: message.worldId ? worldName(message.worldId) : '',
    tier: TIER[message.values?.tier]?.[lang] || message.values?.tier || '', nowInfestation: Number.isFinite(now?.infestation) ? Math.round(now.infestation) : '—',
    infestation: message.values?.infestation ?? '—', stability: message.values?.stability ?? '—' };
  return Object.freeze({ id: message.id, kind: message.kind, phase: message.phase, delay,
    from: fill(text.from[lang], values), body: fill(text.body[lang], values),
    label: `${TRAVEL_MESSAGES_TEXT_V188[message.phase === 'after' ? 'after' : 'during'][lang]} · ${fill(TRAVEL_MESSAGES_TEXT_V188.late[lang], { delay })}` });
}
/** Newest first, for the briefing table's alert list. */
export function travelMessagesListV188(save, language = 'fr', worldName, limit = 6) {
  return normalizeTravelMessagesV188(save?.travelMessagesV188).messages.slice().reverse().slice(0, limit)
    .map(message => travelMessageTextV188(message, save, language, worldName)).filter(Boolean);
}
export const travelArrivalNoticeV188 = (count, language = 'fr') => fill(TRAVEL_MESSAGES_TEXT_V188.arrived[L(language)], { n: count });
