import {
  CAMPAIGNS as CORE_CAMPAIGNS,
  CONTENT_COUNTS as CORE_CONTENT_COUNTS,
  CONTENT_TARGETS as CORE_CONTENT_TARGETS,
  RELEASE as PREVIOUS_RELEASE,
  validateContent as validateCoreContent
} from './content-core-v50.js';
import { buildCampaignsWithSpecialOperationsV67 } from './special-operations-v67.js';
import { BLACK_COCOON_CAMPAIGN_V121 } from './black-cocoon-state-v121.js';
import { APC_CONVOY_CAMPAIGN_V121 } from './apc-convoy-state-v121.js';
import { C12_HORDE_CAMPAIGN_V121 } from './c12-horde-state-v121.js';

export * from './content-core-v50.js';

export const CAMPAIGNS = Object.freeze([...buildCampaignsWithSpecialOperationsV67(CORE_CAMPAIGNS), BLACK_COCOON_CAMPAIGN_V121, APC_CONVOY_CAMPAIGN_V121, C12_HORDE_CAMPAIGN_V121]);
export const CONTENT_COUNTS = Object.freeze({ ...CORE_CONTENT_COUNTS, campaigns: CAMPAIGNS.length });
export const CONTENT_TARGETS = Object.freeze({ ...CORE_CONTENT_TARGETS, campaigns: 443 });

export function validateContent() {
  const core = validateCoreContent();
  const failures = [...core.failures];
  if (CONTENT_COUNTS.campaigns !== CONTENT_TARGETS.campaigns) failures.push(`campaigns: ${CONTENT_COUNTS.campaigns} != ${CONTENT_TARGETS.campaigns}`);
  if (new Set(CAMPAIGNS.map((campaign) => campaign.id)).size !== CAMPAIGNS.length) failures.push('CAMPAIGNS: duplicate ids');
  return { ok: failures.length === 0, failures, counts: CONTENT_COUNTS };
}

export const RELEASE = Object.freeze({
  ...PREVIOUS_RELEASE,
  version: '86.0.0',
  subtitle: 'Équipements physiques, placement ancré, récupération et dotations persistantes',
  sourceVersion: '51.0.0'
});
