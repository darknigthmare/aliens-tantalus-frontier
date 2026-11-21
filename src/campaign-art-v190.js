/** One new painting of the physical AB-40 recovery. Its six arc associations
 * are setting metadata, not six new pictures or six reconstructed scenes.
 * The insertion resolver shows it only during the recovery mission. */
const campaignIds = Object.freeze([
  'special-arbiter-01-freight',
  'special-arbiter-02-gallery',
  'special-arbiter-03-custody',
  'special-arbiter-04-arbitration',
  'special-arbiter-05-isolation',
  'special-arbiter-06-local'
]);

export const CAMPAIGN_ART_ASSETS_V190 = Object.freeze([
  Object.freeze({
    id: 'arbiter-recovery', worldId: 'world-05-lethe', label: 'ARBITER / AB-40',
    path: '/assets/openai/campaign/xeno-arbiter-v190/arbiter-recovery.png',
    width: 1672, height: 941, bytes: 2266447,
    sha256: '7a166494b72948ea997fc0fb20e951b4ab2154046e4656e277e794c3ce9ec431',
    alt: 'Echo-9 examine un appareil à écran ambre récupéré auprès d’un cadre mort, dans une galerie vitrée donnant sur des rails de confinement.',
    credit: 'ARBITER / AB-40 · illustration originale du projet',
    provenance: 'openai-imagegen-project-interpretation',
    designReference: 'Matériaux rétro-industriels et équipement Echo-9 du projet ; galerie corporate originale.',
    canonExact: false, newImage: true, campaignIds
  })
]);

export const CAMPAIGN_ART_V190 = Object.freeze(['approach', 'deployment'].map(phaseKind => Object.freeze({
  id: `campaign-art-v190-special-arbiter-03-custody-${phaseKind}`,
  assetId: 'arbiter-recovery', campaignId: 'special-arbiter-03-custody',
  worldId: 'world-05-lethe', phaseKind,
  path: CAMPAIGN_ART_ASSETS_V190[0].path, type: 'image',
  alt: CAMPAIGN_ART_ASSETS_V190[0].alt,
  credit: CAMPAIGN_ART_ASSETS_V190[0].credit,
  provenance: CAMPAIGN_ART_ASSETS_V190[0].provenance,
  canonExact: false, newImage: true
})));

/** Arc overview only: the caller keeps the illustration-of-the-arc label.
 * Resolving art never records evidence, possession or mission completion. */
export function getXenoArbiterCampaignArtV190(campaignId) {
  return campaignIds.includes(campaignId) ? CAMPAIGN_ART_ASSETS_V190[0] : null;
}

export function resolveCampaignArtV190({ state, phase } = {}) {
  if (!state || typeof state !== 'object' || !Array.isArray(state.phases)
    || !Number.isInteger(state.currentIndex) || state.worldId !== 'world-05-lethe') return null;
  const active = state.phases[state.currentIndex];
  if (!active || phase && phase.kind !== active.kind) return null;
  return CAMPAIGN_ART_V190.find(entry => entry.campaignId === state.campaignId
    && entry.phaseKind === active.kind) || null;
}
