import { CAMPAIGNS } from './content.js';
import { createInfestationExposureV62 } from './infestation-chain-v62.js';

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));
const add = (target, key, amount, maximum = 100) => {
  if (!amount) return;
  target[key] = Math.round(clamp((target[key] ?? 0) + amount, 0, maximum) * 100) / 100;
};

const OBJECTIVE_EFFECTS = Object.freeze({
  'rescue survivors': { action: 'evacuation', world: { stability: 5, population: 160 }, hub: { morale: 3 } },
  'restore atmospheric processing': { action: 'atmosphere', world: { stability: 4, population: 80 }, hub: { power: 3, oxygen: 5 } },
  'seal the hive': { action: 'containment', world: { infestation: -6, quarantine: 4 }, hub: { quarantine: 2 } },
  'recover black-box data': { action: 'archive', resources: { research: 6 }, hub: { research: 4 } },
  'escort a colony convoy': { action: 'convoy', world: { stability: 4, population: 100 }, hub: { supplies: 4 } },
  'purge a reactor nest': { action: 'reactor-purge', world: { infestation: -7 }, hub: { power: 2, quarantine: 2 } },
  'board a drifting vessel': { action: 'boarding', resources: { alloy: 6 }, hub: { supplies: 2 } },
  'hold the extraction zone': { action: 'holdout', world: { stability: 4 }, hub: { supplies: 3, morale: 2 } },
  'track an apex specimen': { action: 'apex-trace', resources: { research: 5, pathogen: 2 }, hub: { research: 3 } },
  'recover a synthetic': { action: 'synthetic-recovery', resources: { research: 4 }, hub: { security: 3 } },
  'capture a live organism': { action: 'live-capture', resources: { research: 7, pathogen: 4 }, hub: { quarantine: -2, research: 4 } },
  'destroy a neuro-link relay': { action: 'relay-sabotage', world: { infestation: -3 }, hub: { security: 5 } },
  'defend the colony': { action: 'colony-defense', world: { stability: 6, population: 120 }, hub: { morale: 3 } },
  'navigate the vent network': { action: 'route-mapping', resources: { research: 3 }, hub: { security: 2 } },
  'secure the power loader': { action: 'vehicle-recovery', resources: { alloy: 5 }, hub: { supplies: 3 } },
  'escape the quarantine': { action: 'quarantine-escape', world: { quarantine: 5 }, hub: { morale: 2, quarantine: 3 } }
});

function pairedCampaign(campaign) {
  if (!campaign?.pairId) return null;
  return CAMPAIGNS.find((entry) => entry.pairId === campaign.pairId && entry.id !== campaign.id) || null;
}

function causalExposureFor(consequence, worldState = {}) {
  const infestation = clamp(worldState.infestation);
  const common = {
    id: `operation-return:${consequence.id}`,
    campaignId: consequence.campaignId,
    worldId: consequence.worldId,
    label: `${consequence.action} · retour opérationnel`,
    estimatedThreats: Math.max(1, Math.min(6, Math.ceil(infestation / 24)))
  };
  if (consequence.action === 'live-capture') return { ...common, type: 'live-specimen', severity: 82 + infestation * 0.12 };
  if (consequence.action === 'boarding' && (infestation >= 28 || !consequence.success)) return { ...common, type: 'wreck-salvage', severity: 38 + infestation * 0.38 };
  if (consequence.action === 'evacuation' && infestation >= 42) return { ...common, type: 'survivor-evacuation', severity: 30 + infestation * 0.34 };
  if (consequence.action === 'vehicle-recovery' && infestation >= 48) return { ...common, type: 'contaminated-equipment', severity: 34 + infestation * 0.4 };
  if (consequence.action === 'apex-trace' && consequence.success) return { ...common, type: 'pathogen-sample', kind: 'pathogen', severity: 44 + infestation * 0.22 };
  if (consequence.action === 'synthetic-recovery' && !consequence.success) return { ...common, type: 'synthetic-intrusion', kind: 'synthetic', severity: 64 };
  if (consequence.action === 'quarantine-escape' && !consequence.success) return { ...common, type: 'airlock-breach', severity: 76 + infestation * 0.16 };
  if (consequence.action === 'route-mapping' && !consequence.success) return { ...common, type: 'vent-breach', severity: 68 + infestation * 0.18 };
  return null;
}

export function buildCampaignConsequence(campaign = {}, world = {}, { success = true, completedCampaignIds = [] } = {}) {
  const objective = String(campaign.objective || '').toLowerCase();
  const base = OBJECTIVE_EFFECTS[objective] || { action: 'frontier-security', world: { stability: 2 }, hub: { security: 1 } };
  const pair = pairedCampaign(campaign);
  const archiveId = campaign.mode === 'FRONTIER' ? pair?.id : campaign.id;
  const mireArchiveRecovered = campaign.mode === 'FRONTIER' && Boolean(archiveId && completedCampaignIds.includes(archiveId));
  const sign = success ? 1 : -1;
  const worldDelta = Object.fromEntries(Object.entries(base.world || {}).map(([key, value]) => [key, value * sign]));
  const hubDelta = Object.fromEntries(Object.entries(base.hub || {}).map(([key, value]) => [key, value * sign]));
  const resourceDelta = Object.fromEntries(Object.entries(base.resources || {}).map(([key, value]) => [key, success ? value : -Math.ceil(value / 2)]));

  if (campaign.mode === 'MIRE') {
    resourceDelta.research = (resourceDelta.research || 0) + (success ? 4 : 1);
    hubDelta.research = (hubDelta.research || 0) + (success ? 2 : -1);
  }
  if (mireArchiveRecovered && success) {
    worldDelta.stability = (worldDelta.stability || 0) + 3;
    worldDelta.infestation = (worldDelta.infestation || 0) - 2;
    resourceDelta.research = (resourceDelta.research || 0) + 2;
  }
  if (!success) {
    worldDelta.stability = (worldDelta.stability || 0) - 2;
    worldDelta.infestation = (worldDelta.infestation || 0) + 3;
    hubDelta.morale = (hubDelta.morale || 0) - 2;
  }

  return Object.freeze({
    id: `${campaign.id || 'campaign'}:${success ? 'success' : 'failure'}`,
    campaignId: String(campaign.id || ''),
    pairId: campaign.pairId ?? null,
    pairedCampaignId: pair?.id || null,
    mode: String(campaign.mode || 'FRONTIER'),
    source: String(campaign.source || 'Tantalus Frontier'),
    canon: String(campaign.canon || 'project-continuity'),
    objective,
    action: base.action,
    success: Boolean(success),
    mireArchiveRecovered,
    worldId: String(world.id || campaign.worldId || ''),
    worldDelta: Object.freeze(worldDelta),
    hubDelta: Object.freeze(hubDelta),
    resourceDelta: Object.freeze(resourceDelta),
    unlockCampaignId: campaign.mode === 'MIRE' && success ? pair?.id || null : null,
    unlockWorldId: campaign.mode === 'MIRE' && success ? pair?.worldId || null : null
  });
}

export function applyCampaignConsequence(save, campaign, world, result = {}) {
  if (!save?.galaxy?.worldState || !save?.hub?.systems || !save?.galaxy?.resources) throw new Error('Sauvegarde stratégique invalide.');
  const consequence = buildCampaignConsequence(campaign, world, {
    success: Boolean(result.success),
    completedCampaignIds: save.galaxy.completedCampaignIds || []
  });
  const worldState = save.galaxy.worldState[consequence.worldId];
  if (!worldState) throw new Error(`Monde de conséquence inconnu: ${consequence.worldId}`);
  for (const [key, value] of Object.entries(consequence.worldDelta)) add(worldState, key, value, key === 'population' ? 999999999 : 100);
  for (const [key, value] of Object.entries(consequence.hubDelta)) add(save.hub.systems, key, value);
  for (const [key, value] of Object.entries(consequence.resourceDelta)) add(save.galaxy.resources, key, value, 999999999);
  if (consequence.unlockWorldId && !save.galaxy.unlockedWorldIds.includes(consequence.unlockWorldId)) save.galaxy.unlockedWorldIds.push(consequence.unlockWorldId);
  if (!Array.isArray(save.galaxy.alerts)) save.galaxy.alerts = [];
  const alert = {
    id: `consequence-${consequence.id}-${save.clock.day}-${save.clock.hour}`,
    type: 'campaign-consequence',
    severity: consequence.success ? 'resolved' : 'critical',
    worldId: consequence.worldId,
    campaignId: consequence.campaignId,
    pairId: consequence.pairId,
    action: consequence.action,
    source: consequence.source,
    canon: consequence.canon,
    message: `${consequence.action} · ${consequence.success ? 'conséquence Frontier appliquée' : 'retombées hostiles appliquées'}`,
    day: save.clock.day,
    hour: save.clock.hour
  };
  save.galaxy.alerts = [alert, ...save.galaxy.alerts.filter((entry) => entry?.id !== alert.id)].slice(0, 256);
  const exposureEvent = causalExposureFor(consequence, worldState);
  const exposure = exposureEvent ? createInfestationExposureV62(save, exposureEvent) : null;
  return { consequence, alert, exposure };
}

export { OBJECTIVE_EFFECTS };
