// V188 — Asphodèle station, part 3: the services of the reopened modules and the
// Crucible market (spec 007 follow-up; bible §7.3, §42.2; owner question Q30,
// recommended option A: the existing economy — credits and strategic resources
// of `save.galaxy.resources` — with a stock limited per cycle, no new currency).
// Pure rules on a candidate save, no DOM, no import of save.js (save.js imports
// this module for the Cheyenne fuel saving). Every value here is [PROPOSÉ] and
// recorded in bible §7.6.
//
// Anti-exploit contract of the market:
// - a cycle is one strategic day (`save.clock.day`); the clock only moves with
//   operations, care and construction, never with a trade;
// - each offer has a stock per cycle; a sold unit always earns less than a bought
//   unit costs (alloy: bought at 24 CR, sold at 12 CR), so no sequence of trades
//   gains anything;
// - a trade is refused before any change when the stock is spent, a resource is
//   short (structured `missingCosts`, the format of save.js refusals) or an
//   operation is under way; no resource ever goes below zero.

const t = (fr, en) => Object.freeze({ fr, en });
const pick = (pair, language) => pair?.[language === 'en' ? 'en' : 'fr'] || '';
const RESOURCE_KEYS = Object.freeze(['credits', 'alloy', 'fuel', 'medical', 'research', 'pathogen']);
const resourcesOf = save => save?.galaxy?.resources && typeof save.galaxy.resources === 'object' ? save.galaxy.resources : null;
const round = value => Math.round(value * 100) / 100;

/** The missing amounts, in the format of save.js `STRATEGIC_COST_MISSING` refusals. */
export function missingResourcesV188(save, cost = {}) {
  const resources = resourcesOf(save) || {};
  return Object.entries(cost).filter(([key, value]) => !(Number(resources[key]) >= value))
    .map(([key, value]) => ({ key, required: value, available: Math.max(0, Math.floor(Number(resources[key]) || 0)) }));
}
function pay(save, cost, gain) {
  const resources = resourcesOf(save);
  for (const [key, value] of Object.entries(cost)) resources[key] = round(Math.max(0, (Number(resources[key]) || 0) - value));
  for (const [key, value] of Object.entries(gain || {})) resources[key] = round(Math.min(999999999, (Number(resources[key]) || 0) + value));
}

// —— Crucible market (Q30 A) ——
const offer = (id, kind, cost, gain, stock, label) => Object.freeze({ id, kind, cost: Object.freeze(cost), gain: Object.freeze(gain), stock, label });
export const ASPHODELE_MARKET_OFFERS_V188 = Object.freeze([
  offer('buy-alloy', 'buy', { credits: 240 }, { alloy: 10 }, 3, t('Pièces de récupération', 'Salvaged parts')),
  offer('buy-fuel', 'buy', { credits: 200 }, { fuel: 8 }, 3, t('Cellules de carburant', 'Fuel cells')),
  offer('buy-medical', 'buy', { credits: 180 }, { medical: 3 }, 2, t('Trousses médicales', 'Medical kits')),
  offer('sell-alloy', 'sell', { alloy: 10 }, { credits: 120 }, 2, t('Revendre de l’alliage', 'Sell alloy'))
]);
export const ASPHODELE_MARKET_OFFER_IDS_V188 = Object.freeze(ASPHODELE_MARKET_OFFERS_V188.map(entry => entry.id));
export const getAsphodeleMarketOfferV188 = id => ASPHODELE_MARKET_OFFERS_V188.find(entry => entry.id === id) || null;

export function normalizeAsphodeleMarketV188(raw) {
  const day = Math.max(1, Math.floor(Number(raw?.day) || 1)), used = {};
  for (const id of ASPHODELE_MARKET_OFFER_IDS_V188) { const value = Math.floor(Number(raw?.used?.[id])); used[id] = Number.isFinite(value) ? Math.max(0, Math.min(99, value)) : 0; }
  return { day, used };
}
const today = save => Math.max(1, Math.floor(Number(save?.clock?.day) || 1));
/** Used counts of the current cycle: a record from another day counts as a new cycle. */
function usedToday(save) {
  const market = normalizeAsphodeleMarketV188(save?.asphodeleHubV188?.market);
  return market.day === today(save) ? market.used : normalizeAsphodeleMarketV188(null).used;
}
/** Stock of an offer this cycle: base stock, +1 per point of hub workforce on purchases (synthetic contracts). */
export function asphodeleOfferStockV188(entry, workforce = 0) {
  return entry.stock + (entry.kind === 'buy' ? Math.max(0, Math.floor(Number(workforce) || 0)) : 0);
}
export function asphodeleMarketViewV188(save, { workforce = 0 } = {}) {
  const used = usedToday(save);
  return Object.freeze(ASPHODELE_MARKET_OFFERS_V188.map(entry => {
    const stock = asphodeleOfferStockV188(entry, workforce), remaining = Math.max(0, stock - used[entry.id]);
    return Object.freeze({ id: entry.id, kind: entry.kind, cost: entry.cost, gain: entry.gain, stock, remaining,
      missing: missingResourcesV188(save, entry.cost), label: entry.label });
  }));
}
/**
 * One trade on a candidate save. `open` is the caller's verdict that the market
 * room is open (pact accepted). Returns { ok, offerId, remaining } or
 * { ok:false, reason, missingCosts? } with nothing changed.
 */
export function tradeAsphodeleMarketV188(save, offerId, { open = false, workforce = 0 } = {}) {
  const entry = getAsphodeleMarketOfferV188(offerId);
  if (!entry) return { ok: false, reason: 'unknown-offer' };
  if (!open) return { ok: false, reason: 'market-closed' };
  if (save?.strategy?.currentOperation) return { ok: false, reason: 'operation-active' };
  if (!resourcesOf(save)) return { ok: false, reason: 'unknown-offer' };
  const used = usedToday(save), stock = asphodeleOfferStockV188(entry, workforce);
  if (used[entry.id] >= stock) return { ok: false, reason: 'stock-spent' };
  const missingCosts = missingResourcesV188(save, entry.cost);
  if (missingCosts.length) return { ok: false, reason: 'resources', missingCosts };
  pay(save, entry.cost, entry.gain);
  const next = { ...used, [entry.id]: used[entry.id] + 1 };
  save.asphodeleHubV188 = { ...(save.asphodeleHubV188 || {}), market: { day: today(save), used: next } };
  return { ok: true, offerId: entry.id, remaining: stock - next[entry.id] };
}

// —— Repair hangar: Cheyenne overhaul (bible §42.2 « Améliorations du Cheyenne ») ——
// Each level saves one fuel unit per deployment (never below 1), read by save.js getOperationBrief.
export const CHEYENNE_UPGRADES_V188 = Object.freeze([
  Object.freeze({ level: 1, cost: Object.freeze({ credits: 600, alloy: 30 }), fuelSaving: 1, label: t('Révision des tuyères', 'Thruster overhaul') }),
  Object.freeze({ level: 2, cost: Object.freeze({ credits: 1000, alloy: 60, research: 8 }), fuelSaving: 2, label: t('Réservoirs auxiliaires', 'Auxiliary tanks') })
]);
export const normalizeCheyenneLevelV188 = raw => Math.max(0, Math.min(CHEYENNE_UPGRADES_V188.length, Math.floor(Number(raw) || 0)));
export const cheyenneFuelSavingV188 = save => CHEYENNE_UPGRADES_V188[normalizeCheyenneLevelV188(save?.asphodeleHubV188?.cheyenne) - 1]?.fuelSaving || 0;
export function nextCheyenneUpgradeV188(save) { return CHEYENNE_UPGRADES_V188[normalizeCheyenneLevelV188(save?.asphodeleHubV188?.cheyenne)] || null; }
export function upgradeCheyenneV188(save, { open = false } = {}) {
  if (!open) return { ok: false, reason: 'hangar-closed' };
  if (save?.strategy?.currentOperation) return { ok: false, reason: 'operation-active' };
  const next = nextCheyenneUpgradeV188(save);
  if (!next) return { ok: false, reason: 'complete' };
  const missingCosts = missingResourcesV188(save, next.cost);
  if (missingCosts.length) return { ok: false, reason: 'resources', missingCosts };
  pay(save, next.cost);
  save.asphodeleHubV188 = { ...(save.asphodeleHubV188 || {}), cheyenne: next.level };
  return { ok: true, level: next.level };
}

// —— Quarters: settling recruits and volunteer colonists (bible §7.3, §42.2) ——
export const QUARTERS_MORALE_V188 = 4;
export function settleQuartersV188(save, { open = false } = {}) {
  if (!open) return { ok: false, reason: 'quarters-closed' };
  if (save?.asphodeleHubV188?.quartersSettled === true) return { ok: false, reason: 'already-settled' };
  const systems = save?.hub?.systems;
  if (systems && Number.isFinite(systems.morale)) systems.morale = Math.min(100, systems.morale + QUARTERS_MORALE_V188);
  save.asphodeleHubV188 = { ...(save.asphodeleHubV188 || {}), quartersSettled: true };
  return { ok: true, morale: QUARTERS_MORALE_V188 };
}

// —— Station medbay: care of the most injured crew member (save.js treatCrewMember does the care) ——
export function medbayPatientV188(save) {
  const crew = Array.isArray(save?.crew) ? save.crew : [];
  return crew.filter(member => member && member.status !== 'deceased' && Number(member.health) < 100)
    .sort((a, b) => Number(a.health) - Number(b.health) || String(a.id).localeCompare(String(b.id)))[0] || null;
}

// —— Player-facing texts (FR/EN) ——
export const ASPHODELE_SERVICE_TEXT_V188 = Object.freeze({
  marketTitle: t('Comptoir Crucible', 'Crucible counter'),
  marketIntro: t('Les récupérateurs de Grue échangent contre des crédits du Tantalus. Stock renouvelé à chaque cycle (jour {day}).', 'Grue’s salvagers trade for Tantalus credits. Stock renewed every cycle (day {day}).'),
  marketDone: t('Échange conclu : {give} contre {get}. Reste {n} ce cycle.', 'Trade done: {give} for {get}. {n} left this cycle.'),
  stockSpent: t('Stock épuisé pour ce cycle : revenez après la prochaine opération.', 'Out of stock for this cycle: come back after the next operation.'),
  marketClosed: t('Le comptoir est fermé.', 'The counter is closed.'),
  operationActive: t('Indisponible : une opération est en cours.', 'Unavailable: an operation is under way.'),
  quartersTitle: t('Quartiers', 'Quarters'),
  quartersText: t('Registre des cabines : {crew} membres d’équipage à bord du Tantalus, {rescued} colons ramenés pendant la campagne. Des cabines superposées attendent les volontaires.', 'Cabin register: {crew} crew members aboard the Tantalus, {rescued} colonists brought back during the campaign. Bunk cabins wait for the volunteers.'),
  quartersSettle: t('INSTALLER LES VOLONTAIRES', 'SETTLE THE VOLUNTEERS'),
  quartersSettled: t('Les volontaires ont leurs cabines. Moral de l’équipage +{n}.', 'The volunteers have their cabins. Crew morale +{n}.'),
  quartersAlready: t('Les cabines sont attribuées ; les lumières individuelles s’allument une à une.', 'The cabins are assigned; the individual lights come on one by one.'),
  medbayTitle: t('Infirmerie de station', 'Station medbay'),
  medbayText: t('Le médecin de station prend en charge {name} (santé {health}). Un soin coûte 1 MÉDICAL et une heure.', 'The station doctor takes {name} (health {health}). Care costs 1 MEDICAL and one hour.'),
  medbayNone: t('Aucun blessé à bord : les lits restent faits.', 'No one is injured: the beds stay made.'),
  medbayTreat: t('SOIGNER', 'TREAT'),
  medbayDone: t('{name} est soigné(e) : santé {health}.', '{name} is treated: health {health}.'),
  scanner: t('Scanner de quarantaine : chaque arrivée par les quais passe ici. Aucune trace biologique sur les derniers passages. Infestation de la station : {infestation} %.', 'Quarantine scanner: every arrival through the quays passes here. No biological trace on the last passages. Station infestation: {infestation}%.'),
  barricade: t('Barricades d’Echo-8 : portes soudées, sacs de sable, une flèche à la craie vers les cabines des survivants. Le sergent Kessler a écrit l’heure, 05:52, et « on revient ».', 'Echo-8’s barricades: welded doors, sandbags, a chalk arrow to the survivors’ cabins. Sergeant Kessler wrote the time, 05:52, and "we’ll be back".'),
  nightTitle: t('Ronde de nuit', 'Night round'),
  nightText: t('Les ponts inférieurs passent en éclairage de secours au cycle de nuit. Rondes effectuées : {n}. Sécurité de la station : {security}/60.', 'The lower decks switch to emergency lighting during the night cycle. Rounds done: {n}. Station security: {security}/60.'),
  nightPlan: t('PLANIFIER L’INSPECTION DE NUIT', 'PLAN THE NIGHT INSPECTION'),
  repairTitle: t('Hangar de réparation', 'Repair hangar'),
  repairText: t('Les mécaniciens peuvent réviser le Cheyenne : {label} pour {cost}. Économie actuelle : {saving} carburant par déploiement.', 'The mechanics can overhaul the Cheyenne: {label} for {cost}. Current saving: {saving} fuel per deployment.'),
  repairComplete: t('Le Cheyenne est entièrement révisé : {saving} carburant économisé par déploiement.', 'The Cheyenne is fully overhauled: {saving} fuel saved per deployment.'),
  repairBuy: t('LANCER LA RÉVISION', 'START THE OVERHAUL'),
  repairDone: t('Révision terminée : niveau {level}, {saving} carburant économisé par déploiement.', 'Overhaul done: level {level}, {saving} fuel saved per deployment.'),
  stationStatus: t('Sécurité {security}/60 · infestation {infestation} % · main-d’œuvre {workforce}/3 · modules remis en pression {sections}', 'Security {security}/60 · infestation {infestation}% · workforce {workforce}/3 · modules repressurised {sections}')
});
export const asphodeleServiceTextV188 = (key, language = 'fr', values = {}) => pick(ASPHODELE_SERVICE_TEXT_V188[key], language).replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));
/** Refusal line of a service result, in FR or EN; `formatMissing` renders a structured shortage. */
export function asphodeleRefusalTextV188(result, language = 'fr', formatMissing = null) {
  if (result?.reason === 'resources' && typeof formatMissing === 'function') return formatMissing(result.missingCosts, language);
  return asphodeleServiceTextV188({ 'stock-spent': 'stockSpent', 'market-closed': 'marketClosed', 'operation-active': 'operationActive',
    'hangar-closed': 'marketClosed', 'quarters-closed': 'marketClosed', 'already-settled': 'quartersAlready', complete: 'repairComplete' }[result?.reason] || 'marketClosed', language,
  { saving: CHEYENNE_UPGRADES_V188[CHEYENNE_UPGRADES_V188.length - 1].fuelSaving });
}
export { RESOURCE_KEYS as ASPHODELE_RESOURCE_KEYS_V188 };
