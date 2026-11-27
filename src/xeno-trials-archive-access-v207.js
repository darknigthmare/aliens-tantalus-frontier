import { getArbiterArchiveAccessV191 } from './xeno-arbiter-protocols-v191.js';
import { XENO_TRIALS_CAMPAIGN_V119 } from './xeno-trials-modes-v119.js';

const accreditationIndex = XENO_TRIALS_CAMPAIGN_V119.findIndex(mission => mission.id === 'xt119-finale-1');
const requiredMissions = XENO_TRIALS_CAMPAIGN_V119.slice(0, accreditationIndex + 1);

/** The embedded terminal uses the Tantalus campaign’s proofs. The standalone
 * terminal authenticates its own operator through the native Trials campaign. */
export function getXenoTrialsArchiveAccessV207({ standaloneV207, trialsProgress, arbiterProgressV190, language } = {}) {
  if (standaloneV207 !== true) return getArbiterArchiveAccessV191(arbiterProgressV190);
  const victories = trialsProgress?.modesV119?.campaignCleared;
  const cleared = new Set(Array.isArray(victories) ? victories : []);
  const total = requiredMissions.length;
  const completed = requiredMissions.filter(mission => cleared.has(mission.id)).length;
  const available = total > 0 && completed === total;
  const copy = language === 'en'
    ? ['ARCHIVES AUTHENTICATED · ARBITER ACCESS GRANTED', 'ACCESS RESTRICTED · COMPLETE THE MIRE CAMPAIGN']
    : ['ARCHIVES AUTHENTIFIÉES · ACCÈS ARBITER AUTORISÉ', 'ACCÈS RESTREINT · TERMINEZ LA CAMPAGNE MIRE'];
  const notice = available ? copy[0] : `${copy[1]} (${completed}/${total})`;
  return { available, notice, completed, total };
}
