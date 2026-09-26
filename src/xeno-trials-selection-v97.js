export function filterXenoTrialsRosterV97(fighters, { family = 'all', role = 'all', ownership = 'all', sort = 'catalog', query = '', unlocked = [] } = {}) {
  const text = String(query).trim().toLocaleLowerCase('fr');
  const owned = new Set(unlocked);
  const result = fighters.filter(f => (family === 'all' || f.family === family) && (role === 'all' || f.role === role)
    && (ownership === 'all' || (ownership === 'owned') === owned.has(f.id)) && (!text || f.label.toLocaleLowerCase('fr').includes(text)));
  if (sort === 'name') result.sort((a, b) => a.label.localeCompare(b.label, 'fr'));
  if (sort === 'health') result.sort((a, b) => b.hp - a.hp || a.label.localeCompare(b.label, 'fr'));
  if (sort === 'speed') result.sort((a, b) => b.speed - a.speed || a.label.localeCompare(b.label, 'fr'));
  return result;
}
