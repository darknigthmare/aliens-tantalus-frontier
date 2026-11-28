import { getXenoTrialsRecruitV230 } from './xeno-trials-recruits-v230.js';
import { getXenoTrialsUnlockCostV96 } from './xeno-trials-progress-v96.js';
import { compareXenoTrialsSimulationPowerV227 } from './xeno-trials-power-v227.js';

// Search tolerates French accents and typographic dashes without rewriting displayed names.
const searchText = value => String(value).normalize('NFD').replace(/\p{M}/gu, '')
  .toLocaleLowerCase('fr').replace(/[-\u2010-\u2015\u2212]+/gu, ' ').trim().replace(/\s+/gu, ' ');

export function filterXenoTrialsRosterV97(fighters, { family = 'all', role = 'all', ownership = 'all', sort = 'catalog', query = '', unlocked = [], factionRoster = null } = {}) {
  const text = searchText(query);
  const owned = new Set(unlocked);
  const faction = Array.isArray(factionRoster) ? new Set(factionRoster) : null;
  const result = fighters.filter(f => (family === 'all' || getXenoTrialsSelectionFamilyV119(f) === family) && (role === 'all' || f.role === role)
    && (!faction || faction.has(f.id))
    && (ownership === 'all' || (ownership === 'owned') === owned.has(f.id)) && (!text || searchText([f.label, getXenoTrialsRecruitV230(f.id)?.label, getXenoTrialsRecruitV230(f.id)?.labelEn].filter(Boolean).join(' ')).includes(text)));
  if (sort === 'name') result.sort((a, b) => a.label.localeCompare(b.label, 'fr'));
  if (sort === 'health') result.sort((a, b) => b.hp - a.hp || a.label.localeCompare(b.label, 'fr'));
  if (sort === 'speed') result.sort((a, b) => b.speed - a.speed || a.label.localeCompare(b.label, 'fr'));
  if (sort === 'cost') result.sort((a, b) => getXenoTrialsUnlockCostV96(a.id) - getXenoTrialsUnlockCostV96(b.id) || a.label.localeCompare(b.label, 'fr'));
  if (sort === 'power') result.sort(compareXenoTrialsSimulationPowerV227);
  if (sort === 'power-desc') result.sort((a, b) => -compareXenoTrialsSimulationPowerV227(a, b));
  return result;
}

export const XENO_TRIALS_SELECTION_FAMILIES_V119 = Object.freeze([
  ['all', 'TOUS'], ['xenomorph', 'XÉNOMORPHES'], ['synthetic', 'SYNTHÉTIQUES / MACHINES'], ['pathogen', 'PATHOGÈNES'],
  ['hybrid', 'HYBRIDES'], ['human', 'HUMAINS'], ['engineer', 'ENGINEERS'], ['fauna', 'FAUNE'], ['unknown', 'À DÉFINIR']
].map(([id, label]) => Object.freeze({ id, label })));
export function getXenoTrialsSelectionFamilyV119(fighter) {
  if (!fighter) return 'unknown';
  if (/predalien/.test(fighter.id)) return 'hybrid';
  if (/unclassified|flesh-experiment|renaissance/.test(fighter.id)) return 'unknown';
  return ['xenomorph', 'pathogen', 'synthetic', 'human', 'engineer', 'fauna', 'hybrid'].includes(fighter.family) ? fighter.family : 'unknown';
}

export function getXenoTrialsOpponentCandidatesV119(fighters, faction, family = 'all') {
  return fighters.filter(fighter => family === 'all'
    ? faction.roster.includes(fighter.id)
    : getXenoTrialsSelectionFamilyV119(fighter) === family);
}
