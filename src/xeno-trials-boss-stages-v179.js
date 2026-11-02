/** Forty additional simulation arenas, using forty different project backdrops.
 * These are authored arena settings, not new illustrations or canonical locations.
 * The historical six stages and the common physical combat plane stay unchanged.
 * motionBaseStageId names the existing scenery animation used by each setting.
 */
const scenes = [
  ['ship-habitation', 'Coursive habitée', 'metroidvania/zones/ship-habitation-far.png', 'containment-deck'],
  ['ship-extraction', 'Sas d’extraction', 'metroidvania/zones/ship-extraction-far.png', 'tantalus-cargo'],
  ['ship-engineering', 'Passage des machines', 'metroidvania/zones/ship-engineering-far.png', 'reactor-ring'],
  ['ship-docking', 'Amarrage extérieur', 'metroidvania/zones/ship-docking-far.png', 'tantalus-cargo'],
  ['planet-surface', 'Plaine balayée', 'metroidvania/zones/planet-exterior/planet-surface-far.png', 'planet-surface'],
  ['planet-ruins', 'Ruines du plateau', 'metroidvania/zones/planet-exterior/planet-ruins-far.png', 'planet-surface'],
  ['planet-ridge', 'Crête rocheuse', 'metroidvania/zones/planet-exterior/planet-ridge-far.png', 'planet-surface'],
  ['planet-evac', 'Périmètre d’évacuation', 'metroidvania/zones/planet-exterior/planet-evac-far.png', 'planet-surface'],
  ['planet-caves', 'Cavernes profondes', 'metroidvania/zones/planet-exterior/planet-caves-far.png', 'hive-vault'],
  ['planet-approach', 'Approche des falaises', 'metroidvania/zones/planet-exterior/planet-approach-far.png', 'planet-surface'],
  ['colony-utility', 'Conduits de la colonie', 'metroidvania/zones/colony-multiroute/colony-utility-far.png', 'reactor-ring'],
  ['colony-security', 'Poste de sécurité', 'metroidvania/zones/colony-multiroute/colony-security-far.png', 'containment-deck'],
  ['colony-landing', 'Aire d’atterrissage', 'metroidvania/zones/colony-multiroute/colony-landing-far.png', 'tantalus-cargo'],
  ['colony-habitat', 'Habitat abandonné', 'metroidvania/zones/colony-multiroute/colony-habitat-far.png', 'hive-vault'],
  ['colony-civic', 'Centre de la colonie', 'metroidvania/zones/colony-multiroute/colony-civic-far.png', 'containment-deck'],
  ['colony-approach', 'Route de la colonie', 'metroidvania/zones/colony-multiroute/colony-approach-far.png', 'planet-surface'],
  ['workshop', 'Atelier industriel', 'hub/layers/industrial-workshop-far.png', 'reactor-ring'],
  ['vehicle-bay', 'Baie des véhicules', 'hub/layers/industrial-vehicle-bay-far.png', 'tantalus-cargo'],
  ['quarantine', 'Cellule de quarantaine', 'hub/layers/industrial-quarantine-far.png', 'containment-deck'],
  ['armory', 'Réserve d’armement', 'hub/layers/industrial-armory-far.png', 'containment-deck'],
  ['quarters', 'Quartiers isolés', 'hub/layers/habitat-quarters-far.png', 'containment-deck'],
  ['mess', 'Réfectoire évacué', 'hub/layers/habitat-mess-far.png', 'tantalus-cargo'],
  ['medical', 'Bloc médical', 'hub/layers/habitat-medical-far.png', 'containment-deck'],
  ['laboratory', 'Laboratoire sous scellés', 'hub/layers/habitat-lab-far.png', 'containment-deck'],
  ['sensors', 'Salle des capteurs', 'hub/layers/engineering-sensors-far.png', 'tantalus-bridge'],
  ['reactor', 'Cœur des machines', 'hub/layers/engineering-reactor-far.png', 'reactor-ring'],
  ['life-support', 'Circuits de survie', 'hub/layers/engineering-life-support-far.png', 'reactor-ring'],
  ['hangar', 'Hangar de maintenance', 'hub/layers/engineering-hangar-far.png', 'tantalus-cargo'],
  ['cryo', 'Chambre cryogénique', 'hub/layers/command-cryo-far.png', 'containment-deck'],
  ['cic', 'Centre des opérations', 'hub/layers/command-cic-far.png', 'tantalus-bridge'],
  ['briefing', 'Salle de préparation', 'hub/layers/command-briefing-far.png', 'tantalus-bridge'],
  ['bridge', 'Poste de commandement', 'hub/layers/command-bridge-far.png', 'tantalus-bridge'],
  ['synthetic-bay', 'Baie des synthétiques', 'hub/annexes/v71/synthetic-bay/far.webp', 'containment-deck'],
  ['proving-ground', 'Champ d’évaluation', 'hub/annexes/v71/proving-ground/far.webp', 'containment-deck'],
  ['morgue', 'Morgue sous confinement', 'hub/annexes/v71/morgue/far.webp', 'hive-vault'],
  ['archives', 'Archives MIRE', 'hub/annexes/v71/mire-archives/far.webp', 'tantalus-bridge'],
  ['logistics', 'Annexe logistique', 'hub/annexes/v71/logistics/far.webp', 'tantalus-cargo'],
  ['escape-pods', 'Baie des capsules', 'hub/annexes/v71/escape-pods/far.webp', 'tantalus-cargo'],
  ['arrival', 'Sas d’arrivée', 'hub/annexes/v71/arrival-airlock/far.webp', 'containment-deck'],
  ['bioforge', 'Anneau Bioforge', 'hub/annexes/v71/bioforge/far.webp', 'hive-vault']
];
const palettes = Object.freeze({
  'containment-deck': ['#101d24', '#72b8bd', '#23343c'],
  'reactor-ring': ['#241a18', '#d69058', '#42302c'],
  'hive-vault': ['#191b23', '#aa8bbd', '#302b38'],
  'tantalus-bridge': ['#101d24', '#74d9e7', '#23343c'],
  'tantalus-cargo': ['#241d18', '#e2b56b', '#352d25'],
  'planet-surface': ['#1b2425', '#b3d39b', '#2d3431']
});

export const XENO_TRIALS_BOSS_STAGES_V179 = Object.freeze(scenes.map(([slug, label, asset, motionBaseStageId]) => {
  const [background, accent, floor] = palettes[motionBaseStageId];
  return Object.freeze({ id: `xt179-${slug}`, label: `${label} / Simulation`,
    background, accent, floor, backdrop: `/assets/openai/${asset}`, motionBaseStageId,
    stageRevision: 179, assetStatus: 'existing-project-backdrop',
    canonStatus: 'original-tantalus-simulation', canonExact: false, affectsCombat: false });
}));

const stages = new Map(XENO_TRIALS_BOSS_STAGES_V179.map(stage => [stage.id, stage]));
export function getXenoTrialsBossStageV179(id) { return stages.get(id) || null; }
