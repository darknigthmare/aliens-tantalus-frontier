/** Four genuinely new campaign paintings, authored with image generation from
 * existing project material references. Forty explicit media bindings reuse
 * them across campaigns in the same setting. These are project interpretations,
 * not copied screenshots, measured sets, new levels or 1:1 certifications. */
export const CAMPAIGN_ART_ASSETS_V180 = Object.freeze([
  Object.freeze({ id: 'acheron-colony', worldId: 'world-01-acheron-lv-426', label: 'Acheron / LV-426',
    path: '/assets/openai/campaign/v180/acheron-colony.webp',
    width: 1672, height: 941, bytes: 1872422, sha256: '51c21987bdcc73fb1d7744ba4bd42263cf7a37bb66e311632fa288b7de43729a',
    alt: 'Colonie industrielle sous un orage, blocs préfabriqués et conduites mouillées, processeur atmosphérique au loin.',
    designReference: 'Aliens (1986) · architecture industrielle et palette froide, interprétation du projet',
    referencePath: '/assets/openai/metroidvania/zones/planet-exterior/planet-approach-far.png',
    campaignIds: Object.freeze(['pair-001-frontier', 'pair-002-mire', 'pair-010-mire', 'pair-030-mire', 'pair-038-mire']) }),
  Object.freeze({ id: 'lv223-engineer-temple', worldId: 'world-02-lv-223', label: 'LV-223',
    path: '/assets/openai/campaign/v180/lv223-engineer-temple.webp',
    width: 1672, height: 941, bytes: 1722456, sha256: 'a2ea1f4807157deb2fd9c8d27f70beed1eee0963a7c04a8876ba443e53caed03',
    alt: 'Dôme monumental nervuré au-dessus de basaltes noirs, porte sombre en forme de serrure et brumes dans la vallée.',
    designReference: 'Prometheus (2012) · temple biomécanique et terrain volcanique, interprétation du projet',
    referencePath: '/assets/openai/metroidvania/zones/planet-exterior/planet-ruins-far.png',
    campaignIds: Object.freeze(['pair-002-frontier', 'pair-005-mire', 'pair-033-mire', 'pair-061-mire', 'pair-066-frontier']) }),
  Object.freeze({ id: 'fiorina-foundry', worldId: 'world-03-fiorina-161', label: 'Fiorina 161',
    path: '/assets/openai/campaign/v180/fiorina-foundry.webp',
    width: 1536, height: 1024, bytes: 1828972, sha256: '45b496e9b36a6485635ed9bf36cd7474c114d8c3bdc591e781a3375d25de2114',
    alt: 'Fonderie sombre sous une voûte haute, passerelles grillagées, conduites rouillées et fours éclairés en orange.',
    designReference: 'Alien 3 (1992) · fonderie carcérale et palette ocre, interprétation du projet',
    referencePath: '/assets/openai/metroidvania/zones/ship-engineering-far.png',
    campaignIds: Object.freeze(['pair-003-mire', 'pair-003-frontier', 'pair-031-mire', 'pair-059-mire', 'pair-067-frontier']) }),
  Object.freeze({ id: 'sevastopol-transit', worldId: 'world-04-sevastopol', label: 'Sevastopol',
    path: '/assets/openai/campaign/v180/sevastopol-transit.webp',
    width: 1672, height: 941, bytes: 1662130, sha256: '02dad0a86ad3992e1253f567bb2e8b11018d7a280ea16df71cc51a070a6d50f3',
    alt: 'Coursive rétroindustrielle aux panneaux crème et bruns, écrans cathodiques verts, sas capitonné et fenêtre sur une géante gazeuse.',
    designReference: 'Alien: Isolation · panneaux moulés, CRT et éclairages pratiques, interprétation du projet',
    referencePath: '/assets/openai/metroidvania/zones/colony-multiroute/colony-security-far.png',
    campaignIds: Object.freeze(['pair-004-frontier', 'pair-009-mire', 'pair-037-mire', 'pair-065-mire', 'pair-068-frontier']) })
]);

export const CAMPAIGN_ART_V180 = Object.freeze(CAMPAIGN_ART_ASSETS_V180.flatMap(asset =>
  asset.campaignIds.flatMap(campaignId => ['approach', 'deployment'].map(phaseKind => Object.freeze({
    id: `campaign-art-v180-${campaignId}-${phaseKind}`, assetId: asset.id,
    campaignId, worldId: asset.worldId, phaseKind, path: asset.path, type: 'image',
    alt: `${asset.label} · création du projet : ${asset.alt}`,
    credit: `${asset.label} · nouvelle illustration du projet`,
    provenance: 'openai-imagegen-project-interpretation', canonExact: false, newImage: true
  })))));
const byCampaignAndPhase = new Map(CAMPAIGN_ART_V180.map(entry => [`${entry.campaignId}:${entry.phaseKind}`, entry]));

export function resolveCampaignArtV180({ state, phase } = {}) {
  if (!state || typeof state !== 'object' || !Array.isArray(state.phases)
    || !Number.isInteger(state.currentIndex)) return null;
  const activePhase = state.phases[state.currentIndex];
  if (!activePhase || phase && phase.kind !== activePhase.kind) return null;
  const entry = byCampaignAndPhase.get(`${state.campaignId}:${activePhase.kind}`);
  return entry && entry.worldId === state.worldId ? entry : null;
}
