// Source identities are separate from the 392 historical modular combinations.
// A documented outfit is not a certified 1:1 skin. Missing art cannot be equipped.
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const source = (work, url = null) => ({ work, url, status: url ? 'documented-primary-reference' : 'reference-pending' });
const costume = (slug, name, work, character, faction, era, type, layers, url = null, skinId = null) => freeze({
  id: `franchise-${slug}`, name, collection: 'franchise', body: 'human-a', bodyCompatibility: ['human-a', 'human-b', 'human-c', 'synthetic-a', 'synthetic-b'],
  sourceWork: work, sourceCharacter: character, sourceFaction: faction, faction, era, type,
  source: source(work, url), referenceStatus: url ? 'documented-primary-reference' : 'reference-pending',
  layers: { underLayer: layers[0], armorLayer: layers[1] || null, helmet: layers[2] || null,
    accessories: layers[3] || [], environmentSuit: type === 'environment-suit' ? name : null },
  skinId, visualStatus: skinId ? 'adapted-dedicated-atlas' : 'missing', exact: false,
  equipmentPolicy: 'cosmetic-only-no-inferred-bonuses', provenance: 'franchise-reference-project-adaptation',
  part: type, palette: 'source-outfit', wear: 'field',
  description: `${name} — référence ${character || faction}. ${skinId ? 'Planches dédiées adaptées au joueur ; fidélité exacte non certifiée.' : 'Visuel joueur dédié à produire ; non équipable pour le moment.'}`
});
const necaCrew = 'https://store.necaonline.com/blogs/behind-the-scenes/closer-look-alien-series-4-action-figures';
const necaMarine = 'https://store.necaonline.com/blogs/behind-the-scenes/behind-the-scenes-1st-look-hudson-hicks-and-warrior-alien-figures-coming-2013';
const afe = 'https://www.aliensfireteamelite.com/en/releasenotes/';
const afe4 = 'https://www.aliensfireteamelite.com/en/community/afe-season-4-announce/';
export const FRANCHISE_COSTUMES_V119 = freeze([
  costume('nostromo-crew', 'Combinaison d’équipage du Nostromo', 'Alien (1979)', 'Ripley / équipage', 'Weyland-Yutani', '2122', 'crew-coveralls', ['Combinaison utilitaire gris-bleu', null, null, ['Patch d’équipage', 'Ceinture']], necaCrew, 'player.nostromo-crew-v119'),
  costume('nostromo-dallas-compression', 'Combinaison de compression de Dallas', 'Alien (1979)', 'Dallas', 'Weyland-Yutani', '2122', 'environment-suit', ['Sous-combinaison', 'Enveloppe de pression', 'Casque amovible', ['Pack dorsal']], necaCrew),
  costume('nostromo-ripley-compression', 'Combinaison de compression de Ripley', 'Alien (1979)', 'Ripley', 'Weyland-Yutani', '2122', 'environment-suit', ['Sous-combinaison', 'Enveloppe de pression', 'Casque amovible'], necaCrew),
  costume('ripley-bomber', 'Blouson d’équipage de Ripley', 'Aliens (1986)', 'Ripley', 'civilian', '2179', 'crew-jacket', ['Combinaison bleue', 'Blouson bomber'], 'https://store.necaonline.com/collections/alien-collection/products/aliens-series-12-ripley-7-inch-scale-action-figure-bomber-jacket-version'),
  costume('hicks-combat', 'Tenue de combat de Hicks', 'Aliens (1986)', 'Hicks', 'uscm', '2179', 'combat-armor', ['Treillis colonial', 'Armure de combat', 'Casque', ['Harnais']], necaMarine),
  costume('hudson-combat', 'Tenue de combat de Hudson', 'Aliens (1986)', 'Hudson', 'uscm', '2179', 'combat-armor', ['Treillis colonial', 'Armure de combat', 'Casque', ['Harnais']], necaMarine),
  costume('vasquez-bdu', 'Treillis de Vasquez', 'Aliens (1986)', 'Vasquez', 'uscm', '2179', 'combat-uniform', ['BDU colonial', null, null, ['Bandeau']], 'https://store.necaonline.com/products/aliens-series-12-vasquez-7-inch-scale-action-figure-bdus'),
  costume('bishop-utility', 'Tenue utilitaire de Bishop', 'Aliens (1986)', 'Bishop', 'uscm', '2179', 'synthetic-uniform', ['Tenue utilitaire', null, null, []], 'https://store.necaonline.com/blogs/behind-the-scenes/closer-look-aliens-series-5-action-figures'),
  costume('fury-ripley', 'Uniforme de détention de Ripley', 'Alien 3 (1992)', 'Ripley', 'civilian', '2179', 'prison-uniform', ['Uniforme de détention'], 'https://propstore.com/product/alien-1992/ripleys-sigourney-weaver-prison-uniform-2/'),
  costume('fury-inmate', 'Tenue de détenu de Fury 161', 'Alien 3 (1992)', 'Détenus', 'civilian', '2179', 'prison-uniform', ['Tenue de détention']),
  costume('ripley8', 'Tenue de Ripley 8', 'Alien Resurrection (1997)', 'Ripley 8', 'civilian', '2381', 'civilian-uniform', ['Tenue civile']),
  costume('betty-crew', 'Tenue de contrebandier du Betty', 'Alien Resurrection (1997)', 'Équipage du Betty', 'civilian', '2381', 'crew-uniform', ['Tenue de bord']),
  costume('prometheus-expedition', 'Combinaison d’expédition du Prometheus', 'Prometheus (2012)', 'Équipe scientifique', 'Weyland', '2093', 'environment-suit', ['Sous-combinaison', 'Combinaison d’expédition', 'Casque', ['Pack dorsal']]),
  costume('david8', 'Uniforme de David 8', 'Prometheus (2012)', 'David', 'Weyland', '2093', 'synthetic-uniform', ['Uniforme de bord']),
  costume('covenant-expedition', 'Combinaison d’expédition du Covenant', 'Alien: Covenant (2017)', 'Équipe de colonisation', 'Weyland-Yutani', '2104', 'environment-suit', ['Tenue de colonisation', 'Combinaison d’expédition', 'Casque']),
  costume('walter', 'Uniforme de Walter', 'Alien: Covenant (2017)', 'Walter', 'Weyland-Yutani', '2104', 'synthetic-uniform', ['Uniforme de bord']),
  costume('amanda-working', 'Tenue de travail d’Amanda', 'Alien: Isolation (2014)', 'Amanda Ripley', 'civilian', '2137', 'crew-coveralls', ['Combinaison utilitaire']),
  costume('sevastopol-security', 'Uniforme de sécurité de Sevastopol', 'Alien: Isolation (2014)', 'Sécurité de station', 'Seegson', '2137', 'security-uniform', ['Uniforme de station', 'Protection de service']),
  costume('working-joe-uniform', 'Uniforme de maintenance Working Joe', 'Alien: Isolation (2014)', 'Working Joe', 'Seegson', '2137', 'synthetic-uniform', ['Tenue de maintenance']),
  costume('rain-jacket', 'Blouson de Rain', 'Alien: Romulus (2024)', 'Rain', 'civilian', '2142', 'civilian-jacket', ['Tenue de colonie', 'Blouson rouge'], 'https://www.motionpictures.org/2024/09/designed-to-shred-how-alien-romulus-costume-designer-carlos-rosario-stylized-horror/'),
  costume('rain-pressure', 'Combinaison spatiale de Rain', 'Alien: Romulus (2024)', 'Rain', 'civilian', '2142', 'environment-suit', ['Sous-combinaison', 'Combinaison en coton ciré', 'Casque', ['Pack dorsal']], 'https://www.caftcad.com/alien-romulus'),
  costume('romulus-hazmat', 'Tenue de récupération contaminée', 'Alien: Romulus (2024)', 'Équipe de récupération', 'Weyland-Yutani', '2142', 'environment-suit', ['Protection en latex', null, 'Casque'], 'https://www.caftcad.com/alien-romulus'),
  costume('andy-coveralls', 'Combinaison utilitaire d’Andy', 'Alien: Romulus (2024)', 'Andy', 'civilian', '2142', 'synthetic-uniform', ['Combinaison utilitaire'], 'https://nofilmschool.com/carlos-rosario-alien-romulus'),
  costume('navarro-jacket', 'Tenue d’aviatrice de Navarro', 'Alien: Romulus (2024)', 'Navarro', 'civilian', '2142', 'crew-jacket', ['Chemise hawaïenne', 'Blouson en cuir'], 'https://www.motionpictures.org/2024/09/designed-to-shred-how-alien-romulus-costume-designer-carlos-rosario-stylized-horror/'),
  costume('fireteam-nostromo-jacket', 'Veste d’équipage du Nostromo — kit colonial', 'Aliens: Fireteam Elite (2021)', 'Marine colonial', 'uscm', '2202', 'crew-jacket', ['Uniforme colonial', 'Veste d’équipage du Nostromo'], afe),
  costume('fireteam-flightsuit', 'Combinaison de vol coloniale', 'Aliens: Fireteam Elite (2021)', 'Marine colonial', 'uscm', '2202', 'flight-suit', ['Combinaison de vol'], afe),
  costume('fireteam-specialist', 'Tenue de spécialiste colonial', 'Aliens: Fireteam Elite (2021)', 'Marine colonial', 'uscm', '2202', 'combat-armor', ['Treillis colonial', 'Kit Specialist'], afe),
  costume('fireteam-ape-mk3', 'Combinaison APE Mk.3', 'Aliens: Fireteam Elite (2021)', 'Marine colonial', 'uscm', '2202', 'environment-suit', ['Sous-combinaison', 'Combinaison APE Mk.3', 'Casque'], afe4),
  costume('fireteam-seegson-maintenance', 'Combinaison de maintenance Seegson', 'Aliens: Fireteam Elite (2021)', 'Technicien', 'Seegson', '2202', 'crew-coveralls', ['Combinaison de maintenance'], afe4),
  costume('dark-descent-marine', 'Tenue de marine de Lethe', 'Aliens: Dark Descent (2023)', 'Marine colonial', 'uscm', '2198', 'combat-armor', ['Treillis colonial', 'Armure coloniale', 'Casque']),
  costume('dark-descent-technician', 'Tenue de technicien de Lethe', 'Aliens: Dark Descent (2023)', 'Technicien colonial', 'uscm', '2198', 'combat-armor', ['Treillis technique', 'Protection coloniale'])
]);
const byId = new Map(FRANCHISE_COSTUMES_V119.map(entry => [entry.id, entry]));
export function getAllCostumesV119(legacyCatalog = []) { return Object.freeze([...legacyCatalog, ...FRANCHISE_COSTUMES_V119]); }
export function getCostumeV119(id, legacyCatalog = []) { return typeof id === 'string' ? byId.get(id) || legacyCatalog.find(entry => entry.id === id) || null : null; }
export function canEquipCostumeV119(id, legacyCatalog = []) {
  const entry = getCostumeV119(id, legacyCatalog);
  return Boolean(entry && (entry.collection !== 'franchise' || (entry.skinId && entry.visualStatus === 'adapted-dedicated-atlas')));
}
export function sanitizeCostumeSelectionV119(id, legacyCatalog = []) { return canEquipCostumeV119(id, legacyCatalog) ? id : null; }
export function resolveCostumePanelV119({ legacyCatalog = [], selectedId = null, query = '', faction = 'all', era = 'all', type = 'all', availability = 'all' } = {}) {
  const all = getAllCostumesV119(legacyCatalog);
  const needle = String(query).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const entries = all.filter(entry => (faction === 'all' || entry.faction === faction)
    && (era === 'all' || entry.era === era) && (type === 'all' || (entry.type || entry.part) === type)
    && (availability === 'all' || (availability === 'ready') === canEquipCostumeV119(entry.id, legacyCatalog))
    && [entry.name, entry.sourceWork, entry.sourceCharacter, entry.part, entry.palette].filter(Boolean).join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(needle));
  const selected = getCostumeV119(selectedId, legacyCatalog);
  return freeze({ entries, selected, selectedId: sanitizeCostumeSelectionV119(selectedId, legacyCatalog),
    legacyCount: legacyCatalog.length, franchiseCount: FRANCHISE_COSTUMES_V119.length,
    readyFranchiseCount: FRANCHISE_COSTUMES_V119.filter(entry => canEquipCostumeV119(entry.id)).length,
    facets: { factions: [...new Set(all.map(entry => entry.faction).filter(Boolean))], eras: [...new Set(all.map(entry => entry.era).filter(Boolean))], types: [...new Set(all.map(entry => entry.type || entry.part).filter(Boolean))] } });
}
