// V188 mission debrief: what the extraction screen and the mission log show is
// what the hub actually paid, once. Pure helpers shared by app.js and the engine.

export const DEBRIEF_REWARD_KEYS_V188 = Object.freeze(['credits', 'alloy', 'research', 'pathogen']);

const round = value => Math.round((Number(value) || 0) * 100) / 100;

/** Strategic resources gained between two resource records (only the reward keys). */
export function paidRewardsV188(before = {}, after = {}) {
  return Object.fromEntries(DEBRIEF_REWARD_KEYS_V188.map(key => [key, Math.max(0, round((Number(after?.[key]) || 0) - (Number(before?.[key]) || 0)))]));
}

/**
 * One line naming the payment. French is the source text; the English catalog
 * carries the same template, so both languages read the real amounts.
 */
export function paidRewardsLineV188(paid, language = 'fr') {
  if (!paid) return '';
  const value = key => round(paid[key]);
  return language === 'en'
    ? `Paid to the Tantalus: +${value('credits')} CR · +${value('alloy')} alloy · +${value('research')} R&D · +${value('pathogen')} pathogen`
    : `Versé au Tantalus : +${value('credits')} CR · +${value('alloy')} alliage · +${value('research')} R&D · +${value('pathogen')} pathogène`;
}

/** The command journal logs an operation result under its campaign id; show the campaign name. */
export function strategyLogTitleV188(entry, campaigns = []) {
  return campaigns.find(campaign => campaign.id === entry?.title)?.name || entry?.title || '';
}
