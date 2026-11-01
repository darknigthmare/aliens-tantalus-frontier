import { APP_RELEASE_V143 } from './release-info-v143.js';
import { buildMireCampaignsV143, validateMireCampaignsV143 } from './mire-settings-v143.js';
import { WORLDS } from './content-core-v50.js';
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
import { ARCHIVE_RELAY_CAMPAIGN_V122 } from './archive-relay-state-v122.js';
import { NEW_SPECIAL_CAMPAIGNS_V131, validateSpecialOperationsV131 } from './special-operations-v131.js';

export * from './content-core-v50.js';

export const CAMPAIGNS = Object.freeze([...buildCampaignsWithSpecialOperationsV67(buildMireCampaignsV143(CORE_CAMPAIGNS, WORLDS)), BLACK_COCOON_CAMPAIGN_V121, APC_CONVOY_CAMPAIGN_V121, C12_HORDE_CAMPAIGN_V121, ARCHIVE_RELAY_CAMPAIGN_V122, ...NEW_SPECIAL_CAMPAIGNS_V131]);
export const CONTENT_COUNTS = Object.freeze({ ...CORE_CONTENT_COUNTS, campaigns: CAMPAIGNS.length });
export const CONTENT_TARGETS = Object.freeze({ ...CORE_CONTENT_TARGETS, campaigns: 455 });

export function validateContent() {
  const core = validateCoreContent();
  const failures = [...core.failures, ...validateMireCampaignsV143(CAMPAIGNS, WORLDS).failures];
  if (CONTENT_COUNTS.campaigns !== CONTENT_TARGETS.campaigns) failures.push(`campaigns: ${CONTENT_COUNTS.campaigns} != ${CONTENT_TARGETS.campaigns}`);
  if (new Set(CAMPAIGNS.map((campaign) => campaign.id)).size !== CAMPAIGNS.length) failures.push('CAMPAIGNS: duplicate ids');
  failures.push(...validateSpecialOperationsV131(CAMPAIGNS).failures);
  return { ok: failures.length === 0, failures, counts: CONTENT_COUNTS };
}

export const RELEASE = Object.freeze({
  ...PREVIOUS_RELEASE,
  version: APP_RELEASE_V143.displayVersion,
  releaseVersion: APP_RELEASE_V143.version,
  buildId: APP_RELEASE_V143.buildId,
  sourceCommit: APP_RELEASE_V143.sourceCommit,
  subtitle: 'Frontière — archives cohérentes et publication vérifiable',
  sourceVersion: APP_RELEASE_V143.sourceVersion
});
