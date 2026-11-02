/** First campaign illustration batch: forty presentation bindings, twenty
 * Frontier campaigns and two insertion phases each. These are existing OpenAI
 * project paintings, selected for atmosphere; they do not reconstruct franchise
 * locations or replace the native level, collisions, objective or story shots.
 * No additional image, canonical fidelity or completed campaign is claimed. */
const zone = name => `/assets/openai/metroidvania/zones/${name}-far.png`;
const planet = name => zone(`planet-exterior/planet-${name}`);
const colony = name => zone(`colony-multiroute/colony-${name}`);
const ship = name => zone(`ship-${name}`);

// Explicit campaign/world pairs keep an illustration from leaking into an
// unrelated MIRE reconstruction or another campaign that shares a world.
const campaigns = [
  ['001', 'world-01-acheron-lv-426', 'Acheron / LV-426',
    planet('approach'), 'Plaine rocheuse sous un ciel orageux', colony('habitat'), 'Coursive habitée d’une colonie industrielle'],
  ['002', 'world-02-lv-223', 'LV-223',
    planet('ridge'), 'Crêtes minérales et horizon désertique', planet('ruins'), 'Vestiges monumentaux sur une plaine obscure'],
  ['003', 'world-03-fiorina-161', 'Fiorina 161',
    planet('caves'), 'Accès rocheux d’un réseau souterrain', ship('engineering'), 'Volumes industriels et équipements techniques'],
  ['004', 'world-04-sevastopol', 'Sevastopol',
    ship('docking'), 'Paroi d’amarrage orbitale', ship('habitation'), 'Coursive de vie dans une station isolée'],
  ['005', 'world-05-lethe', 'Lethe',
    colony('approach'), 'Sas d’accès d’une colonie frontière', colony('landing'), 'Zone industrielle de débarquement'],
  ['006', 'world-06-lv-895', 'LV-895',
    planet('ruins'), 'Vestiges dispersés dans un paysage rocheux', colony('utility'), 'Installations de service d’une colonie'],
  ['007', 'world-07-katanga', 'Katanga',
    ship('docking'), 'Infrastructure orbitale d’amarrage', ship('engineering'), 'Espace de maintenance d’un vaisseau industriel'],
  ['008', 'world-08-pioneer-station', 'Pioneer Station',
    ship('command'), 'Vue spatiale encadrée par la structure d’une passerelle', ship('extraction'), 'Vue orbitale au bord d’une structure de vaisseau'],
  ['009', 'world-09-purdan', 'Purdan',
    planet('ridge'), 'Horizon accidenté d’un monde colonial', planet('ruins'), 'Reliefs et vestiges en terrain découvert'],
  ['010', 'world-10-ceto', 'Ceto',
    colony('approach'), 'Accès clos d’une installation coloniale', colony('utility'), 'Galerie de service d’une installation minière'],
  ['011', 'world-11-freya-s-prospect', 'Freya’s Prospect',
    colony('landing'), 'Infrastructure industrielle de débarquement', colony('utility'), 'Galerie technique d’une colonie minière'],
  ['012', 'world-12-jackson-s-star', 'Jackson’s Star',
    planet('approach'), 'Plaine sombre sous une tempête', colony('civic'), 'Infrastructure civile d’une colonie industrielle'],
  ['013', 'world-13-renaissance-station', 'Renaissance Station',
    ship('docking'), 'Anneau d’amarrage d’une station orbitale', colony('security'), 'Poste sécurisé et éclairages d’alarme'],
  ['014', 'world-14-usm-auriga', 'USM Auriga',
    ship('command'), 'Vue spatiale depuis une structure de passerelle', ship('engineering'), 'Coursive technique d’un vaisseau-laboratoire'],
  ['015', 'world-15-uscss-nostromo', 'USCSS Nostromo',
    ship('docking'), 'Masse d’un quai orbital dans le vide', ship('cargo'), 'Volumes de fret d’un remorqueur industriel'],
  ['016', 'world-16-sulaco-drift', 'Sulaco Drift',
    ship('extraction'), 'Horizon orbital vu depuis une structure de vaisseau', ship('cargo'), 'Panneaux et volumes d’une soute technique'],
  ['017', 'world-17-gateway-station', 'Gateway Station',
    ship('docking'), 'Quais d’un complexe orbital', ship('command'), 'Vue spatiale encadrée par une structure de passerelle'],
  ['018', 'world-18-new-galveston', 'New Galveston',
    colony('approach'), 'Accès industriel d’une ville-colonie', colony('civic'), 'Secteur civil et infrastructures coloniales'],
  ['019', 'world-19-new-albion', 'New Albion',
    colony('civic'), 'Volumes d’une colonie densément bâtie', colony('utility'), 'Galerie de service d’un réseau souterrain'],
  ['020', 'world-20-lv-1201', 'LV-1201',
    planet('ruins'), 'Vestiges monumentaux dans la pénombre', colony('security'), 'Poste sécurisé d’une installation corporative']
];

export const CAMPAIGN_ART_V179 = Object.freeze(campaigns.flatMap(
  ([serial, worldId, worldLabel, approach, approachAlt, deployment, deploymentAlt]) =>
    [['approach', approach, approachAlt], ['deployment', deployment, deploymentAlt]].map(([phaseKind, path, description]) => Object.freeze({
      id: `campaign-art-v179-${serial}-${phaseKind}`,
      campaignId: `pair-${serial}-frontier`, worldId, phaseKind, path,
      type: 'image', alt: `${worldLabel} · illustration d’ambiance : ${description}.`,
      credit: `${worldLabel} · illustration d’ambiance du projet`,
      provenance: 'existing-openai-project-art', canonExact: false, newImage: false
    }))));
const byCampaignAndPhase = new Map(CAMPAIGN_ART_V179.map(entry => [`${entry.campaignId}:${entry.phaseKind}`, entry]));

/** The host retains its existing resolver for phases outside this explicit lot.
 * Resolving a visual is read-only and never writes a progression receipt. */
export function resolveCampaignArtV179({ state, phase } = {}) {
  if (!state || typeof state !== 'object' || !Array.isArray(state.phases)
    || !Number.isInteger(state.currentIndex)) return null;
  const activePhase = state.phases[state.currentIndex];
  if (!activePhase || phase && phase.kind !== activePhase.kind) return null;
  const entry = byCampaignAndPhase.get(`${state.campaignId}:${activePhase.kind}`);
  return entry && entry.worldId === state.worldId ? entry : null;
}
