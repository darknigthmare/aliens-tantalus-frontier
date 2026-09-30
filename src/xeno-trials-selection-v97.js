import { getXenoTrialsUnlockCostV96 } from './xeno-trials-progress-v96.js';

// Search tolerates French accents and typographic dashes without rewriting displayed names.
const searchText = value => String(value).normalize('NFD').replace(/\p{M}/gu, '')
  .toLocaleLowerCase('fr').replace(/[-\u2010-\u2015\u2212]+/gu, ' ').trim().replace(/\s+/gu, ' ');

export function filterXenoTrialsRosterV97(fighters, { family = 'all', role = 'all', ownership = 'all', sort = 'catalog', query = '', unlocked = [], factionRoster = null } = {}) {
  const text = searchText(query);
  const owned = new Set(unlocked);
  const faction = Array.isArray(factionRoster) ? new Set(factionRoster) : null;
  const result = fighters.filter(f => (family === 'all' || f.family === family) && (role === 'all' || f.role === role)
    && (!faction || faction.has(f.id))
    && (ownership === 'all' || (ownership === 'owned') === owned.has(f.id)) && (!text || searchText(f.label).includes(text)));
  if (sort === 'name') result.sort((a, b) => a.label.localeCompare(b.label, 'fr'));
  if (sort === 'health') result.sort((a, b) => b.hp - a.hp || a.label.localeCompare(b.label, 'fr'));
  if (sort === 'speed') result.sort((a, b) => b.speed - a.speed || a.label.localeCompare(b.label, 'fr'));
  if (sort === 'cost') result.sort((a, b) => getXenoTrialsUnlockCostV96(a.id) - getXenoTrialsUnlockCostV96(b.id) || a.label.localeCompare(b.label, 'fr'));
  return result;
}
