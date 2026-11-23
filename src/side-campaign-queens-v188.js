// V188 — first side campaign « La Saison des Reines » (bible §13, §14, §19, §30;
// owner Q13/Q15: after Act V, campaign by campaign; spec 011). Pure rules and
// data (FR/EN), no DOM, no import.
// First lot: the campaign frame (call received at the Tantalus after the main
// campaign, briefing and acceptance, the route to Nacre-7 through the existing
// galaxy jump, mission order, return scenes, the Rask choice, the Arc 1 debrief)
// and Arc 1 « Sous la surface ».
// Second lot (owner decisions of 2026-11-23): Arc 2 « L'écho des canyons » on
// Echo Basin and Arc 3 « La Mère » on TR-0 (the 65th world, hidden until its
// arc), the reused chapters (Broodstorm, Le chant de la Reine-Mère, la
// Ruche-monde) locked until their place then freely replayable, the choices and
// the single nuanced ending of §14.8, the lineages of §14.3 and the onboard
// crisis of the seized egg. Story missions other than the chapters play on the
// existing level templates: no dedicated level yet (spec 011 « Reste »).
//
// The additive save field is `sideCampaignsV188` ({ schema, queens }); an older
// save simply has none. Mission completion is still recorded by the existing
// operation result (`galaxy.completedCampaignIds`); the campaign keeps its own
// list `queens.done` of the missions completed *while it is accepted*, so a
// chapter played before the campaign keeps its old record without skipping an arc.
// Titles, givers and objectives come from bible §14.4-§14.6; locks, delays, texts
// and rosters marked [PROPOSÉ] are recorded in bible §14.11.

const t = (fr, en) => Object.freeze({ fr, en });
const L = language => language === 'en' ? 'en' : 'fr';
const has = (list, id) => Array.isArray(list) && list.includes(id);
const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));

export const QUEENS_CAMPAIGN_ID_V188 = 'queens';
export const QUEENS_NACRE_WORLD_ID_V188 = 'world-31-nacre-7';
export const QUEENS_ECHO_WORLD_ID_V188 = 'world-27-echo-basin';
// TR-0, the Hive World: the project's 65th world (content-core-v50.js `TR0_WORLD_V188`), hidden until Arc 3.
export const QUEENS_TR0_WORLD_ID_V188 = 'world-65-tr-0';
export const COCYTE_WORLD_ID_V188 = 'world-05-lethe';
// The existing V131 chapter reused by Arc 1 (1.3 « Plongée HADAL » and 1.4 « La Reine des récifs »
// are its two halves: HADAL free swim, then MANTA-6 and the aquatic boss). Its worldId moved to Nacre-7
// (legacy-operation-state-v131.js), the old Ceto id stays valid for deployments already under way.
export const QUEENS_ABYSS_CHAPTER_ID_V188 = 'special-black-abyss-v131';
// Arc 2, 2.3 « Les nids sous les surplombs »: Broodstorm (Cheyenne, cliffs, winged Queen), moved from Acheron to Echo Basin.
export const QUEENS_BROODSTORM_CHAPTER_ID_V188 = 'special-broodstorm-v131';
// Arc 3, 3.3-3.4 « Les trois Chœurs » / « La Reine-Mère » and 3.5 « Le noyau »: moved from Cocyte to TR-0.
export const QUEENS_MOTHER_CHAPTER_ID_V188 = 'special-queen-mother-v131';
export const QUEENS_HIVE_WORLD_CHAPTER_ID_V188 = 'special-hive-world-v131';
export const QUEENS_CHAPTER_IDS_V188 = Object.freeze([QUEENS_ABYSS_CHAPTER_ID_V188, QUEENS_BROODSTORM_CHAPTER_ID_V188,
  QUEENS_MOTHER_CHAPTER_ID_V188, QUEENS_HIVE_WORLD_CHAPTER_ID_V188]);
// [PROPOSÉ] delays of the call (bible §13.7): by the QZ network, or relayed by a retaken Asphodèle.
export const QUEENS_CALL_DELAYS_V188 = Object.freeze({ qz: 9, relay: 2 });

const base = (id, name, objective, templateId, registerV188, summary, description, extra) => Object.freeze({
  id, pairId: null, mode: 'FRONTIER', name, source: 'Tantalus Frontier', worldId: QUEENS_NACRE_WORLD_ID_V188, objective,
  year: 2204, canon: 'project-continuity', routes: 2, templateId, registerV188, sideCampaignV188: QUEENS_CAMPAIGN_ID_V188,
  summary, description, ...extra
});

// —— Arc 1, story missions (§14.4). 1.3/1.4 are the existing chapter. ——
const main = (id, step, ...rest) => base(id, ...rest, { queensArcV188: 1, queensStepV188: step });
export const QUEENS_ARC1_MISSIONS_V188 = Object.freeze([
  main('queens-1-1-quai', '1.1', 'NACRE-7 · LE QUAI NOYÉ', 'rescue survivors', 'colony-multiroute', 'horror',
    'Sous-Récif ne répond plus. Atterrir sous la pluie, fouiller les plates-formes désertes et retrouver le Dr Ilse Navarre dans la salle des pompes.',
    'Les plates-formes sur pilotis de Sous-Récif sont désertes, les repas encore servis. Le détecteur reste muet : tout se passe sous l’eau. Retrouver les survivants et le Dr Navarre, retranchée dans la salle des pompes.'),
  main('queens-1-2-bassins', '1.2', 'NACRE-7 · LES BASSINS', 'restore atmospheric processing', 'ship-interior-vertical', 'tension',
    'Rétablir les pompes pour vider deux bassins d’élevage. Au fond : des œufs fixés comme des coraux, et des cocons dans les filets.',
    'Relancer la station de pompage de Sous-Récif, secteur par secteur, et vider deux bassins d’élevage. Le Dr Navarre guide depuis la salle des pompes. Ce que l’eau cachait remonte avec elle.'),
  main('queens-1-5-rask', '1.5', 'NACRE-7 · CE QUE RASK VOULAIT', 'hold the extraction zone', 'planet-exterior', 'action',
    'L’escouade de récupération du capitaine Rask a prélevé un œuf royal pendant le combat. La rattraper sur les plates-formes avant son départ.',
    'L’escouade Weyland-Yutani du capitaine Tobiah Rask tient la plate-forme d’envol avec un caisson : un œuf royal prélevé dans le fossé. Tenir la zone jusqu’à leur navette, puis décider du caisson.')
]);
// The ordered story line of Arc 1 (bible §14.4 rows 1.1 → 1.5).
export const QUEENS_ARC1_ORDER_V188 = Object.freeze(['queens-1-1-quai', 'queens-1-2-bassins', QUEENS_ABYSS_CHAPTER_ID_V188, 'queens-1-5-rask']);

// —— Arc 1 side missions (« Annexes de l'arc 1 »); ids from the bible ——
const side = (id, giver, ...rest) => base(id, ...rest, { queensArcV188: 1, queensSideV188: true, giverV188: giver });
export const QUEENS_ARC1_SIDE_V188 = Object.freeze([
  side('queens-a-navarre', 'Dr Ilse Navarre', 'NACRE-7 · LES CARNETS DE NAVARRE', 'recover black-box data', 'ship-interior-vertical', 'horror',
    'Récupérer les relevés du Dr Navarre dans le laboratoire inondé : elle a documenté l’adaptation récifale jour après jour.',
    'Le laboratoire de Navarre est sous l’eau jusqu’à mi-hauteur. Ses relevés sont restés dans les terminaux : l’adaptation récifale, jour après jour. Les ramener avant que l’eau ne monte encore.'),
  side('queens-a-filets', 'Un pêcheur survivant', 'NACRE-7 · LES FILETS', 'rescue survivors', 'planet-exterior', 'horror',
    'Remonter les filets d’élevage pour retrouver les disparus ; certains sont encore vivants dans des cocons.',
    'Un pêcheur de Sous-Récif a vu ses camarades disparaître dans les filets d’élevage. Les remonter un par un et ramener ceux qui vivent encore.'),
  side('queens-a-phare', 'Rook', 'NACRE-7 · LE PHARE DE SOUS-RÉCIF', 'restore atmospheric processing', 'planet-exterior', 'tension',
    'Rallumer la balise du phare pour guider les canots de survivants vers le quai.',
    'Le phare de Sous-Récif est éteint. Rétablir son alimentation et relancer la balise : les canots de survivants dérivent dans le noir.')
]);

// —— Arc 1 local contracts (« Locales (Nacre-7) »), replayable; ids are new ——
const local = (id, key, ...rest) => base(id, ...rest, { queensArcV188: 1, queensContractV188: key, replayableV188: true });
export const QUEENS_ARC1_CONTRACTS_V188 = Object.freeze([
  local('queens-l-bassin', 'pool', 'NACRE-7 · PURGE D’UN BASSIN', 'purge a reactor nest', 'ship-interior-vertical', 'action',
    'Purger un bassin d’élevage où la lignée récifale a niché.', 'Un bassin d’élevage abrite un nid de la lignée récifale, contre la machinerie de pompage. Le purger.'),
  local('queens-l-canots', 'boats', 'NACRE-7 · ESCORTE DES CANOTS', 'escort a colony convoy', 'planet-exterior', 'tension',
    'Escorter les canots de survivants jusqu’au quai.', 'Des canots de survivants accostent sous la pluie. Les escorter des pontons jusqu’au quai.'),
  local('queens-l-boites', 'recorders', 'NACRE-7 · BOÎTES NOIRES DES CHALUTIERS', 'recover black-box data', 'planet-exterior', 'tension',
    'Récupérer les boîtes noires des chalutiers échoués.', 'Les chalutiers de Sous-Récif se sont échoués contre les pilotis. Récupérer leurs boîtes noires.')
]);

// —— Arc 2, Echo Basin: « L'écho des canyons » (§14.5). 2.3 is the Broodstorm chapter. ——
const on = (worldId, arc) => Object.freeze({
  main: (id, step, ...rest) => base(id, ...rest, { worldId, queensArcV188: arc, queensStepV188: step }),
  side: (id, giver, ...rest) => base(id, ...rest, { worldId, queensArcV188: arc, queensSideV188: true, giverV188: giver }),
  local: (id, key, ...rest) => base(id, ...rest, { worldId, queensArcV188: arc, queensContractV188: key, replayableV188: true })
});
const echo = on(QUEENS_ECHO_WORLD_ID_V188, 2), tr0 = on(QUEENS_TR0_WORLD_ID_V188, 3);
export const QUEENS_ARC2_MISSIONS_V188 = Object.freeze([
  echo.main('queens-2-1-relais', '2.1', 'ECHO BASIN · RELAIS GORGE-SEIZE', 'defend the colony', 'colony-multiroute', 'tension',
    'Se poser sur une tour relais de Gorge-Seize. Les mineurs parlent de bruits dans la roche ; le détecteur de mouvement s’affole à cause des échos.',
    'Le dropship d’Orlov se pose sur une tour relais au-dessus des canyons rouges. Les mineurs de Gorge-Seize parlent de bruits dans la roche. Tenir le relais et apprendre à lire les faux signaux du détecteur : ici, l’écho ment.'),
  echo.main('queens-2-2-sol', '2.2', 'ECHO BASIN · LE SOL QUI S’OUVRE', 'escort a colony convoy', 'planet-exterior', 'action',
    'Escorter un convoi de mineurs vers la ville troglodyte. La lignée fouisseuse attaque par-dessous.',
    'Un convoi de mineurs doit rejoindre la ville troglodyte de Gorge-Seize. La lignée fouisseuse creuse la roche tendre et sort par le sol : surveiller les vibrations et garder le convoi sur les dalles renforcées.'),
  echo.main('queens-2-4-aire', '2.4', 'ECHO BASIN · LA REINE VOLANTE', 'track an apex specimen', 'planet-exterior', 'action',
    'Traquer la Reine aérienne jusqu’à son aire, au sommet d’une aiguille rocheuse.',
    'La Reine de la lignée aérienne s’est repliée sur son aire, au sommet d’une aiguille rocheuse. Monter jusqu’à elle par les corniches, dans le vent, et l’abattre au nid.'),
  echo.main('queens-2-5-carte', '2.5', 'ECHO BASIN · LA CARTE DES LIGNÉES', 'recover black-box data', 'ship-interior-vertical', 'tension',
    'Récupérer le registre de vol de la tour relais : des cargos sont passés ici six mois plus tôt, venant d’un monde absent des cartes civiles.',
    'Inez croise les données de Nacre-7 et d’Echo Basin : les deux lignées ont été déposées. Récupérer le registre de vol de la tour relais de Gorge-Seize pour savoir d’où venaient les cargos.')
]);
export const QUEENS_ARC2_ORDER_V188 = Object.freeze(['queens-2-1-relais', 'queens-2-2-sol', QUEENS_BROODSTORM_CHAPTER_ID_V188, 'queens-2-4-aire', 'queens-2-5-carte']);
export const QUEENS_ARC2_SIDE_V188 = Object.freeze([
  echo.side('queens-a-mineurs', 'Contremaître de Gorge-Seize', 'ECHO BASIN · LE PUITS 7', 'rescue survivors', 'ship-interior-vertical', 'horror',
    'Dix mineurs sont bloqués au fond du puits 7. Descendre, les retrouver, remonter avant que la lignée fouisseuse n’ouvre le puits.',
    'Le puits 7 de Gorge-Seize s’est refermé sur dix mineurs. Descendre par les échelles de service, les retrouver et les remonter avant que la roche ne s’ouvre sous eux.'),
  echo.side('queens-a-rask', 'Capitaine Tobiah Rask', 'ECHO BASIN · LA DETTE DE RASK', 'rescue survivors', 'planet-exterior', 'action',
    'L’escouade du capitaine Rask est piégée dans un canyon. Il demande de l’aide à ceux qui l’ont laissé partir.',
    'Le capitaine Tobiah Rask appelle sur une fréquence de la compagnie : son escouade de récupération est piégée dans un canyon d’Echo Basin. Les sortir de là. Rask sait d’où viennent les cargos.'),
  echo.side('queens-a-sorensen', 'Leila Sørensen', 'ECHO BASIN · LA ROUTE DES CRÊTES', 'escort a colony convoy', 'planet-exterior', 'tension',
    'Ouvrir une route par les crêtes pour éviter les canyons infestés.',
    'Leila Sørensen a tracé une route par les crêtes, au-dessus des canyons infestés. Mener la première colonne de mineurs jusqu’au relais par ce chemin.'),
  echo.side('queens-a-grue', 'Grue', 'ECHO BASIN · LES FERRAILLEURS', 'recover black-box data', 'planet-exterior', 'tension',
    'Récupérer les capteurs sismiques d’une épave Crucible échouée dans un canyon.',
    'Une épave du Crucible Salvage Compact gît au fond d’un canyon d’Echo Basin. Grue en veut les capteurs sismiques ; ils entendent les fouisseurs avant le détecteur de mouvement.')
]);
export const QUEENS_ARC2_CONTRACTS_V188 = Object.freeze([
  echo.local('queens-l-galerie', 'gallery', 'ECHO BASIN · SCELLER UNE GALERIE', 'seal the hive', 'ship-interior-vertical', 'action',
    'Sceller une galerie ouverte par la lignée fouisseuse.', 'Une galerie de la lignée fouisseuse débouche dans les niveaux bas de Gorge-Seize. La sceller.'),
  echo.local('queens-l-falaise', 'cliff', 'ECHO BASIN · PURGE DE NIDS DE FALAISE', 'purge a reactor nest', 'planet-exterior', 'action',
    'Purger des nids accrochés sous un surplomb.', 'Des nids de la lignée aérienne pendent sous un surplomb, au-dessus d’un relais. Les purger.'),
  echo.local('queens-l-chargeur', 'loader', 'ECHO BASIN · DÉGAGER UN CHARGEUR', 'secure the power loader', 'colony-multiroute', 'tension',
    'Dégager un chargeur bloqué sur une rampe de Gorge-Seize.', 'Un chargeur est resté bloqué sur une rampe de Gorge-Seize, entre deux éboulis. Le dégager et le ramener au dépôt.')
]);

// —— Arc 3, TR-0, la Ruche-monde: « La Mère » (§14.6). 3.3-3.4 and 3.5 are the two Red Hive chapters. ——
export const QUEENS_ARC3_MISSIONS_V188 = Object.freeze([
  tr0.main('queens-3-1-peau', '3.1', 'TR-0 · ATTERRISSAGE SUR LA PEAU', 'navigate the vent network', 'planet-exterior', 'horror',
    'Se poser sur une croûte de résine qui respire et trouver Base Ombelle. Tout bruit fait monter une alerte.',
    'Le dropship se pose sur une croûte de résine qui respire. Aucune mer, aucune forêt : la surface est vivante. Avancer sans bruit par les évents de la croûte et trouver l’ancienne station de recherche, Base Ombelle.'),
  tr0.main('queens-3-2-ombelle', '3.2', 'TR-0 · BASE OMBELLE', 'recover black-box data', 'ship-interior-vertical', 'horror',
    'Explorer la station de recherche abandonnée sous la résine et récupérer ses journaux.',
    'Base Ombelle est enfouie sous la résine. Descendre dans la station abandonnée de la compagnie et récupérer ses journaux et ses registres d’expédition : on saura ce qu’elle étudiait, et ce qu’elle envoyait.')
]);
export const QUEENS_ARC3_ORDER_V188 = Object.freeze(['queens-3-1-peau', 'queens-3-2-ombelle', QUEENS_MOTHER_CHAPTER_ID_V188, QUEENS_HIVE_WORLD_CHAPTER_ID_V188]);
export const QUEENS_ARC3_SIDE_V188 = Object.freeze([
  tr0.side('queens-a-ombelle', 'Inez Harlow', 'TR-0 · LE DERNIER CHERCHEUR', 'rescue survivors', 'ship-interior-vertical', 'horror',
    'Un chercheur de Base Ombelle a survécu dans une chambre froide. Le ramener vivant.',
    'Un chercheur de Base Ombelle a survécu dans une chambre froide, derrière trois portes soudées par la résine. Il sait où sont les registres d’expédition. Le ramener vivant.'),
  tr0.side('queens-a-echantillon', 'Inez Harlow / BISHOP-9', 'TR-0 · UN SPÉCIMEN POUR INEZ', 'capture a live organism', 'planet-exterior', 'tension',
    'Capturer un Praetorian vivant. Inez veut comprendre ; BISHOP-9 veut préserver.',
    'Capturer un Praetorian vivant à la surface de TR-0 et le ramener en caisson. Inez veut comprendre la lignée ; BISHOP-9 veut préserver le spécimen. Il faudra dire qui le garde.')
]);
export const QUEENS_ARC3_CONTRACTS_V188 = Object.freeze([]);

// —— The three arcs ——
const ARCS = Object.freeze([
  Object.freeze({ arc: 1, key: 'nacre', worldId: QUEENS_NACRE_WORLD_ID_V188, order: QUEENS_ARC1_ORDER_V188, sides: QUEENS_ARC1_SIDE_V188, contracts: QUEENS_ARC1_CONTRACTS_V188, arrivedKey: 'arrivedDay' }),
  Object.freeze({ arc: 2, key: 'echo', worldId: QUEENS_ECHO_WORLD_ID_V188, order: QUEENS_ARC2_ORDER_V188, sides: QUEENS_ARC2_SIDE_V188, contracts: QUEENS_ARC2_CONTRACTS_V188, arrivedKey: 'arrivedEchoDay' }),
  Object.freeze({ arc: 3, key: 'tr0', worldId: QUEENS_TR0_WORLD_ID_V188, order: QUEENS_ARC3_ORDER_V188, sides: QUEENS_ARC3_SIDE_V188, contracts: QUEENS_ARC3_CONTRACTS_V188, arrivedKey: 'arrivedTr0Day' })
]);
export const QUEENS_ARCS_V188 = ARCS;
const arcOfId = id => ARCS.find(arc => arc.order.includes(id) || arc.sides.some(entry => entry.id === id) || arc.contracts.some(entry => entry.id === id)) || null;
export const queensArcOfV188 = id => arcOfId(id)?.arc || null;

export const QUEENS_CAMPAIGNS_V188 = Object.freeze([...QUEENS_ARC1_MISSIONS_V188, ...QUEENS_ARC1_SIDE_V188, ...QUEENS_ARC1_CONTRACTS_V188,
  ...QUEENS_ARC2_MISSIONS_V188, ...QUEENS_ARC2_SIDE_V188, ...QUEENS_ARC2_CONTRACTS_V188, ...QUEENS_ARC3_MISSIONS_V188, ...QUEENS_ARC3_SIDE_V188]);
export const QUEENS_CAMPAIGN_IDS_V188 = Object.freeze(QUEENS_CAMPAIGNS_V188.map(entry => entry.id));
const BY_ID = new Map(QUEENS_CAMPAIGNS_V188.map(entry => [entry.id, entry]));
export const getQueensCampaignV188 = id => BY_ID.get(id) || null;
/** A mission of the campaign: its own missions and the chapters it reuses. */
export const isQueensCampaignV188 = campaign => {
  const id = typeof campaign === 'string' ? campaign : campaign?.id;
  return BY_ID.has(id) || QUEENS_CHAPTER_IDS_V188.includes(id);
};
export const QUEENS_CONTRACT_KEYS_V188 = Object.freeze(ARCS.flatMap(arc => arc.contracts.map(entry => entry.queensContractV188)));
// Missions recorded once in `queens.done`: the story line of each arc, then its side missions.
const RECORD_IDS = Object.freeze(ARCS.flatMap(arc => [...arc.order, ...arc.sides.map(entry => entry.id)]));

export const QUEENS_NAMES_EN_V188 = Object.freeze({
  'queens-1-1-quai': 'NACRE-7 · THE DROWNED QUAY', 'queens-1-2-bassins': 'NACRE-7 · THE PENS',
  'queens-1-5-rask': 'NACRE-7 · WHAT RASK WANTED', 'queens-a-navarre': 'NACRE-7 · NAVARRE’S NOTEBOOKS',
  'queens-a-filets': 'NACRE-7 · THE NETS', 'queens-a-phare': 'NACRE-7 · THE SOUS-RÉCIF LIGHTHOUSE',
  'queens-l-bassin': 'NACRE-7 · PURGE A PEN', 'queens-l-canots': 'NACRE-7 · BOAT ESCORT',
  'queens-l-boites': 'NACRE-7 · TRAWLER BLACK BOXES', [QUEENS_ABYSS_CHAPTER_ID_V188]: 'BLACK ABYSS · THALASSA-7',
  'queens-2-1-relais': 'ECHO BASIN · GORGE-SEIZE RELAY', 'queens-2-2-sol': 'ECHO BASIN · THE GROUND OPENS',
  'queens-2-4-aire': 'ECHO BASIN · THE FLYING QUEEN', 'queens-2-5-carte': 'ECHO BASIN · THE MAP OF THE LINEAGES',
  'queens-a-mineurs': 'ECHO BASIN · SHAFT 7', 'queens-a-rask': 'ECHO BASIN · RASK’S DEBT',
  'queens-a-sorensen': 'ECHO BASIN · THE RIDGE ROAD', 'queens-a-grue': 'ECHO BASIN · THE SCRAPPERS',
  'queens-l-galerie': 'ECHO BASIN · SEAL A GALLERY', 'queens-l-falaise': 'ECHO BASIN · CLIFF NEST PURGE',
  'queens-l-chargeur': 'ECHO BASIN · FREE A LOADER', [QUEENS_BROODSTORM_CHAPTER_ID_V188]: 'BROODSTORM · AIR CORRIDOR',
  'queens-3-1-peau': 'TR-0 · LANDING ON THE SKIN', 'queens-3-2-ombelle': 'TR-0 · OMBELLE BASE',
  'queens-a-ombelle': 'TR-0 · THE LAST RESEARCHER', 'queens-a-echantillon': 'TR-0 · A SPECIMEN FOR INEZ',
  [QUEENS_MOTHER_CHAPTER_ID_V188]: 'THE SONG OF THE QUEEN MOTHER', [QUEENS_HIVE_WORLD_CHAPTER_ID_V188]: 'TR-0 · THE HIVE WORLD'
});
const NAMES_FR = Object.freeze({ [QUEENS_ABYSS_CHAPTER_ID_V188]: 'ABYSSE NOIR · THALASSA-7', [QUEENS_BROODSTORM_CHAPTER_ID_V188]: 'BROODSTORM · CORRIDOR AÉRIEN',
  [QUEENS_MOTHER_CHAPTER_ID_V188]: 'LE CHANT DE LA REINE-MÈRE', [QUEENS_HIVE_WORLD_CHAPTER_ID_V188]: 'TR-0 · LA RUCHE-MONDE' });
export const queensCampaignNameV188 = (id, language = 'fr') => L(language) === 'en' ? QUEENS_NAMES_EN_V188[id] || id : getQueensCampaignV188(id)?.name || NAMES_FR[id] || id;
// The step labels of the arc panel; a chapter can cover two rows of the bible.
const STEP_LABELS = Object.freeze({
  'queens-1-1-quai': '1.1', 'queens-1-2-bassins': '1.2', [QUEENS_ABYSS_CHAPTER_ID_V188]: '1.3-1.4', 'queens-1-5-rask': '1.5',
  'queens-2-1-relais': '2.1', 'queens-2-2-sol': '2.2', [QUEENS_BROODSTORM_CHAPTER_ID_V188]: '2.3', 'queens-2-4-aire': '2.4', 'queens-2-5-carte': '2.5',
  'queens-3-1-peau': '3.1', 'queens-3-2-ombelle': '3.2', [QUEENS_MOTHER_CHAPTER_ID_V188]: '3.3-3.4', [QUEENS_HIVE_WORLD_CHAPTER_ID_V188]: '3.5'
});
const CHAPTER_STEP_TITLES = Object.freeze({
  [QUEENS_ABYSS_CHAPTER_ID_V188]: t('Plongée HADAL · La Reine des récifs (chapitre « Opération Abysse Noir »)', 'HADAL dive · The reef Queen (chapter "Operation Black Abyss")'),
  [QUEENS_BROODSTORM_CHAPTER_ID_V188]: t('Les nids sous les surplombs (chapitre « Broodstorm »)', 'The nests under the overhangs (chapter "Broodstorm")'),
  [QUEENS_MOTHER_CHAPTER_ID_V188]: t('Les trois Chœurs · La Reine-Mère (chapitre « Le chant de la Reine-Mère »)', 'The three Choirs · The Queen Mother (chapter "The Song of the Queen Mother")'),
  [QUEENS_HIVE_WORLD_CHAPTER_ID_V188]: t('Le noyau (chapitre « TR-0 · la Ruche-monde »)', 'The core (chapter "TR-0 · the Hive World")')
});
const ARC_TITLES = Object.freeze({
  1: t('Arc 1 · Nacre-7 : « Sous la surface »', 'Arc 1 · Nacre-7: "Beneath the surface"'),
  2: t('Arc 2 · Echo Basin : « L’écho des canyons »', 'Arc 2 · Echo Basin: "The echo of the canyons"'),
  3: t('Arc 3 · TR-0, la Ruche-monde : « La Mère »', 'Arc 3 · TR-0, the Hive World: "The Mother"')
});
// The arcs after the first, with the chapters they reuse (panel, dev tools).
export const QUEENS_LATER_ARCS_V188 = Object.freeze([
  Object.freeze({ arc: 2, worldId: QUEENS_ECHO_WORLD_ID_V188, title: ARC_TITLES[2], reuses: Object.freeze([QUEENS_BROODSTORM_CHAPTER_ID_V188]) }),
  Object.freeze({ arc: 3, worldId: QUEENS_TR0_WORLD_ID_V188, title: ARC_TITLES[3], reuses: Object.freeze([QUEENS_MOTHER_CHAPTER_ID_V188, QUEENS_HIVE_WORLD_CHAPTER_ID_V188]) })
]);

// —— Encounter rosters (game-ai: admissibility before generic logic; bible §14.3) ——
// The generic encounter selection would otherwise draw any caste of the catalogue for the world.
// Each of the campaign's own missions receives the castes of its lineage only; every id below has a
// behaviour the registry already resolves on the land templates (drone, ambusher, runner, acid,
// charger, exploder, guardian, royal). Castes that need a specialised runtime are NOT admitted:
//   · the aquatic Ceto reef predator (runtime « aquatic », swims) stays the boss of Abysse Noir;
//   · the winged Queen (flight) stays the boss of Broodstorm, the Queen Mother the boss of her chapter.
// [PROPOSÉ] rosters; the dedicated lineage variants (smooth carapace, gliding membranes…) are to be created.
export const QUEENS_REEF_LINEAGE_IDS_V188 = Object.freeze(['enemy-004-drone-big-chap', 'enemy-011-lurker', 'enemy-006-runner',
  'enemy-027-reef-stalker', 'enemy-028-reef-spitter']);
export const QUEENS_EXCLUDED_AQUATIC_IDS_V188 = Object.freeze(['enemy-051-ceto-reef-predator']);
// 1.5: Rask's Weyland-Yutani salvage squad (§14.1, §30.1 base `weyland-yutani-commando`).
export const QUEENS_RASK_SQUAD_IDS_V188 = Object.freeze(['enemy-043-weyland-yutani-commando']);
// Burrowing lineage (§14.3: Drone, Crusher, Burster): digs the soft rock, comes up through the ground.
export const QUEENS_BURROWER_LINEAGE_IDS_V188 = Object.freeze(['enemy-004-drone-big-chap', 'enemy-009-crusher', 'enemy-016-burster']);
// Aerial lineage (§14.3: Runner, Spitter, the winged Queen in Broodstorm): the walking castes only.
export const QUEENS_AERIAL_LINEAGE_IDS_V188 = Object.freeze(['enemy-006-runner', 'enemy-010-spitter']);
// 2.4 « La Reine volante » on a land template: the royal caste of the catalogue stands for the aerial
// Queen brought down at her eyrie [PROPOSÉ]. Her flight exists only in the Broodstorm chapter.
export const QUEENS_EYRIE_ROYAL_IDS_V188 = Object.freeze(['enemy-008-queen']);
// Mother lineage, Red Hive (§14.3: Praetorian, Queen, Queen Mother) with the Drone as its base caste [PROPOSÉ].
// The Queen and the Queen Mother are met in the two chapters, never on the generic templates.
export const QUEENS_MOTHER_LINEAGE_IDS_V188 = Object.freeze(['enemy-004-drone-big-chap', 'enemy-007-praetorian']);
export const QUEENS_LINEAGES_V188 = Object.freeze({
  reef: QUEENS_REEF_LINEAGE_IDS_V188, burrower: QUEENS_BURROWER_LINEAGE_IDS_V188, aerial: QUEENS_AERIAL_LINEAGE_IDS_V188, mother: QUEENS_MOTHER_LINEAGE_IDS_V188
});
// Which lineage(s) each Echo Basin mission meets (§14.5): the canyons floor is the burrowers', the cliffs the gliders'.
const ECHO_ROSTERS = Object.freeze({
  'queens-2-1-relais': ['burrower', 'aerial'], 'queens-2-2-sol': ['burrower'], 'queens-2-4-aire': ['aerial'], 'queens-2-5-carte': ['burrower', 'aerial'],
  'queens-a-mineurs': ['burrower'], 'queens-a-rask': ['burrower', 'aerial'], 'queens-a-sorensen': ['aerial'], 'queens-a-grue': ['burrower'],
  'queens-l-galerie': ['burrower'], 'queens-l-falaise': ['aerial'], 'queens-l-chargeur': ['burrower']
});
export function queensEncounterIdsV188(campaignId) {
  const campaign = BY_ID.get(campaignId);
  if (!campaign) return null; // the chapters keep their own specialised rosters
  if (campaign.queensArcV188 === 1) return campaignId === 'queens-1-5-rask' ? [...QUEENS_REEF_LINEAGE_IDS_V188, ...QUEENS_RASK_SQUAD_IDS_V188] : [...QUEENS_REEF_LINEAGE_IDS_V188];
  if (campaign.queensArcV188 === 2) {
    const ids = [...new Set((ECHO_ROSTERS[campaignId] || ['burrower']).flatMap(key => QUEENS_LINEAGES_V188[key]))];
    if (campaignId === 'queens-2-4-aire') ids.push(...QUEENS_EYRIE_ROYAL_IDS_V188);
    if (campaignId === 'queens-a-rask') ids.push(...QUEENS_RASK_SQUAD_IDS_V188); // his trapped squad shoots at anything [PROPOSÉ]
    return ids;
  }
  return [...QUEENS_MOTHER_LINEAGE_IDS_V188];
}
/** The lineage keys a mission meets (panel, bestiary, tests). */
export function queensLineagesOfV188(campaignId) {
  const campaign = BY_ID.get(campaignId);
  if (!campaign) return null;
  return campaign.queensArcV188 === 1 ? ['reef'] : campaign.queensArcV188 === 2 ? [...(ECHO_ROSTERS[campaignId] || ['burrower'])] : ['mother'];
}
/** The catalogue handed to the engine: the lineage for the campaign's own missions, the whole catalogue otherwise. */
export function queensEncounterCatalogV188(campaignId, enemies) {
  const ids = queensEncounterIdsV188(campaignId);
  if (!ids || !Array.isArray(enemies)) return enemies;
  const roster = enemies.filter(enemy => ids.includes(enemy?.id));
  return roster.length ? roster : enemies;
}

// —— Save field `sideCampaignsV188` ——
export const QUEENS_PHASES_V188 = Object.freeze(['call', 'accepted']);
export const QUEENS_RASK_CHOICES_V188 = Object.freeze(['release', 'seize', 'destroy']);
export const QUEENS_SPECIMEN_CHOICES_V188 = Object.freeze(['inez', 'bishop']);
// The seized egg's crisis (owner decision of 2026-11-23): the same hub crisis as the Interlude's
// (xenomorph, deck 2, quarantine room; story-campaign-v188.js `INTERLUDE_CRISIS_V188`), created through
// the hub crisis API handed in by the caller. Outcomes: the creature neutralised, or the team extracted.
export const QUEENS_EGG_CRISIS_V188 = Object.freeze({ kind: 'xenomorph', deck: 2, roomId: 'quarantine' });
export const QUEENS_EGG_CRISIS_OUTCOMES_V188 = Object.freeze(['neutralised', 'extracted']);
const BEAT_SCENE_IDS = Object.freeze(['echo-arrival', 'tr0-arrival', 'egg-crisis-alert', 'egg-crisis-after']);
const DEBRIEF_IDS = Object.freeze(['arc1-debrief', 'arc2-debrief', 'campaign-debrief']);
const SCENE_IDS = Object.freeze([...RECORD_IDS, ...BEAT_SCENE_IDS, ...DEBRIEF_IDS]);
export function createQueensV188() {
  return { phase: null, callDay: null, acceptedDay: null, arrivedDay: null, arrivedEchoDay: null, arrivedTr0Day: null,
    done: [], contracts: {}, raskEgg: null, specimen: null, eggCrisis: null, scenesSeen: [] };
}
export function createSideCampaignsV188() { return { schema: 188, queens: createQueensV188() }; }
const day = value => Number.isSafeInteger(value) && value >= 1 && value <= 1e6 ? value : null;
const orderDone = (state, arc) => arc.order.every(id => state.done.includes(id));
function queensArc1CompleteState(state) { return orderDone(state, ARCS[0]) && Boolean(state.raskEgg); }
const arcCompleteState = (state, arc) => arc.arc === 1 ? queensArc1CompleteState(state) : orderDone(state, arc);
/** An arc opens when the campaign is accepted (arc 1) or when the previous arc is complete. */
const arcOpenState = (state, arc) => state.phase === 'accepted' && (arc.arc === 1 || arcCompleteState(state, ARCS[arc.arc - 2]));
const eggCrisisPendingState = state => state.raskEgg === 'seize' && Boolean(state.arrivedTr0Day) && state.eggCrisis?.phase !== 'resolved';
function sceneAllowed(state, id) {
  if (id === 'arc1-debrief') return queensArc1CompleteState(state);
  if (id === 'arc2-debrief') return arcCompleteState(state, ARCS[1]);
  if (id === 'campaign-debrief') return arcCompleteState(state, ARCS[2]);
  if (id === 'echo-arrival') return Boolean(state.arrivedEchoDay);
  if (id === 'tr0-arrival') return Boolean(state.arrivedTr0Day);
  if (id === 'egg-crisis-alert') return Boolean(state.eggCrisis);
  if (id === 'egg-crisis-after') return state.eggCrisis?.phase === 'resolved';
  return state.done.includes(id);
}
export function normalizeQueensV188(raw) {
  const state = createQueensV188();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return state;
  state.phase = QUEENS_PHASES_V188.includes(raw.phase) ? raw.phase : null;
  state.callDay = state.phase ? day(raw.callDay) : null;
  const accepted = state.phase === 'accepted';
  state.acceptedDay = accepted ? day(raw.acceptedDay) : null;
  state.arrivedDay = accepted ? day(raw.arrivedDay) : null;
  state.done = accepted && Array.isArray(raw.done) ? RECORD_IDS.filter(id => raw.done.includes(id)) : [];
  if (accepted) for (const key of QUEENS_CONTRACT_KEYS_V188) {
    const value = Math.floor(Number(raw.contracts?.[key]));
    if (Number.isFinite(value) && value > 0) state.contracts[key] = Math.min(99, value);
  }
  // The choice exists only once « Ce que Rask voulait » was completed in the campaign.
  state.raskEgg = state.done.includes('queens-1-5-rask') && QUEENS_RASK_CHOICES_V188.includes(raw.raskEgg) ? raw.raskEgg : null;
  // An arrival is kept only for an arc that is open.
  state.arrivedEchoDay = arcOpenState(state, ARCS[1]) ? day(raw.arrivedEchoDay) : null;
  state.arrivedTr0Day = arcOpenState(state, ARCS[2]) ? day(raw.arrivedTr0Day) : null;
  state.specimen = state.done.includes('queens-a-echantillon') && QUEENS_SPECIMEN_CHOICES_V188.includes(raw.specimen) ? raw.specimen : null;
  // The crisis exists only for a seized egg, once the Tantalus has reached TR-0.
  const crisis = raw.eggCrisis;
  if (state.raskEgg === 'seize' && state.arrivedTr0Day && crisis && typeof crisis === 'object' && typeof crisis.crisisId === 'string' && /^[\w-]{1,120}$/.test(crisis.crisisId)) {
    const resolved = crisis.phase === 'resolved' && QUEENS_EGG_CRISIS_OUTCOMES_V188.includes(crisis.outcome);
    state.eggCrisis = resolved ? { phase: 'resolved', crisisId: crisis.crisisId, outcome: crisis.outcome } : { phase: 'alert', crisisId: crisis.crisisId, outcome: null };
  }
  state.scenesSeen = Array.isArray(raw.scenesSeen) ? SCENE_IDS.filter(id => raw.scenesSeen.includes(id) && sceneAllowed(state, id)) : [];
  return state;
}
export function normalizeSideCampaignsV188(raw) {
  const value = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  return { schema: 188, queens: normalizeQueensV188(value.queens) };
}
export const queensStateV188 = save => normalizeQueensV188(save?.sideCampaignsV188?.queens);
const write = (save, mutate) => {
  const all = normalizeSideCampaignsV188(save.sideCampaignsV188), state = all.queens;
  const result = mutate(state);
  if (result === false) return false;
  save.sideCampaignsV188 = normalizeSideCampaignsV188({ ...all, queens: state });
  return result ?? true;
};
const today = save => Math.max(1, Math.floor(Number(save?.clock?.day) || 1));
const shipWorld = save => save?.galaxy?.shipWorldIdV116 ?? save?.worldId;

// —— Routes: Echo Basin opens with Arc 2, TR-0 is revealed with Arc 3 (hidden until then) ——
/**
 * Opens the routes of the arcs that are open and records an arrival for an arc that opens while the
 * Tantalus already orbits its world. Idempotent; mutates the candidate save; true when something changed.
 * Called inside the transactions that can open an arc, and at the briefing table for saves made before this lot.
 */
export function syncQueensRoutesV188(save) {
  const state = queensStateV188(save), unlocked = save?.galaxy?.unlockedWorldIds;
  if (state.phase !== 'accepted' || !Array.isArray(unlocked)) return false;
  let changed = false;
  for (const arc of ARCS) {
    if (!arcOpenState(state, arc)) continue;
    if (!unlocked.includes(arc.worldId)) { unlocked.push(arc.worldId); changed = true; }
    if (!state[arc.arrivedKey] && shipWorld(save) === arc.worldId) { write(save, next => { next[arc.arrivedKey] = today(save); }); changed = true; }
  }
  return changed;
}
/** TR-0 stays off the galaxy map until the campaign reveals it (content-core-v50.js `hiddenUntilV188`). */
export const queensWorldHiddenV188 = (save, world) => Boolean(world?.hiddenUntilV188) && !has(save?.galaxy?.unlockedWorldIds, world.id);

// —— Unlock (§13.5: after the main campaign) and the call (§13.3 step 1, §13.7) ——
const act5Phase = save => save?.storyCampaignV188?.act5?.phase || null;
/** The main campaign is over once the Act V credits have played (story-act5-v188.js `act5CompleteV188`). */
export const mainCampaignCompleteV188 = save => act5Phase(save) === 'complete';
export const queensCallDueV188 = save => mainCampaignCompleteV188(save) && !queensStateV188(save).phase;
const relayReady = save => save?.asphodeleHubV188?.relayOnline === true || save?.asphodeleHubV188?.relayReady === true;
/** How old the call is when it reaches the Tantalus: relayed by a retaken Asphodèle's relay room, or by the QZ network. */
export function queensCallDelayV188(save, { relayRoomReady = relayReady(save) } = {}) {
  return has(save?.galaxy?.completedCampaignIds, 'station-s4') && relayRoomReady ? QUEENS_CALL_DELAYS_V188.relay : QUEENS_CALL_DELAYS_V188.qz;
}
const infestationValues = (save, worldId) => {
  const world = save?.galaxy?.worldState?.[worldId];
  return Number.isFinite(world?.infestation) ? { infestation: Math.round(world.infestation) } : {};
};
/** Records the call once; returns the travel message to file in the alert journal (or null). Mutates the candidate save. */
export function receiveQueensCallV188(save, options = {}) {
  if (!queensCallDueV188(save) || !save?.clock) return null;
  const now = today(save), delay = queensCallDelayV188(save, options);
  write(save, state => { state.phase = 'call'; state.callDay = now; });
  return { id: 'campaign-queens-call', kind: 'campaign', worldId: QUEENS_NACRE_WORLD_ID_V188, sentDay: Math.max(1, now - delay), receivedDay: now,
    phase: 'during', values: infestationValues(save, QUEENS_NACRE_WORLD_ID_V188) };
}
export const queensCallPendingV188 = save => queensStateV188(save).phase === 'call';
/** Acceptance (§13.3 step 1): opens the route to Nacre-7. Mutates the candidate save; true when accepted. */
export function acceptQueensCallV188(save) {
  if (!queensCallPendingV188(save)) return false;
  write(save, state => { state.phase = 'accepted'; state.acceptedDay = today(save); });
  // Opens the route; an ordinary arrival already in Nacre-7's orbit counts as the arrival.
  syncQueensRoutesV188(save);
  return true;
}
export const queensAcceptedV188 = save => queensStateV188(save).phase === 'accepted';

/**
 * The first arrival in an open arc's orbit, inside the jump settlement transaction (after
 * `deliverTravelMessagesV188`). Returns the travel message to add, or null. Mutates the candidate save.
 */
export function recordQueensArrivalV188(save, settlement) {
  const jump = save?.galaxy?.jumpV116;
  if (settlement?.status !== 'arrived' || jump?.phase !== 'arrived') return null;
  const arc = ARCS.find(entry => entry.worldId === jump.destinationId), state = queensStateV188(save);
  if (!arc || !arcOpenState(state, arc) || state[arc.arrivedKey]) return null;
  const now = today(save);
  write(save, next => { next[arc.arrivedKey] = now; });
  const suffix = arc.arc === 1 ? '' : `${arc.key}-`;
  return { id: `campaign-queens-arrival-${suffix}${jump.completedAt}`, kind: 'campaign', worldId: arc.worldId, sentDay: now, receivedDay: now,
    phase: 'after', values: infestationValues(save, arc.worldId) };
}

// —— The seized egg aboard (§14.8; owner decision of 2026-11-23) ——
// The risk is recorded with the choice (Arc 1). The crisis breaks out later, at a chosen moment
// [PROPOSÉ]: when the crew wakes from hypersleep in TR-0's orbit, at the opening of Arc 3. The egg,
// a royal one, answers the world of the Mother. It is the hub's own crisis (deck 2, quarantine): the
// player hunts the creature aboard with the existing hub systems, and Arc 3 waits for the outcome.
export const queensEggCrisisDueV188 = save => { const state = queensStateV188(save); return state.raskEgg === 'seize' && Boolean(state.arrivedTr0Day) && !state.eggCrisis; };
export const queensEggCrisisActiveV188 = save => queensStateV188(save).eggCrisis?.phase === 'alert';
const activeCrisis = save => { const crisis = save?.hub?.activeCrisis; return crisis && typeof crisis === 'object' ? crisis : null; };
/**
 * Starts the crisis through the hub crisis API (`createCrisis` is world-crisis-core.js `createHubCrisis`).
 * Another crisis still running aboard postpones it (the caller tries again). Mutates the candidate save.
 */
export function startQueensEggCrisisV188(save, createCrisis) {
  if (!queensEggCrisisDueV188(save) || typeof createCrisis !== 'function' || !save?.hub) return null;
  const running = activeCrisis(save);
  if (running && running.resolved !== true) return null;
  const crisis = createCrisis(save, { ...QUEENS_EGG_CRISIS_V188, force: true });
  if (!crisis?.id) return null;
  write(save, state => { state.eggCrisis = { phase: 'alert', crisisId: String(crisis.id), outcome: null }; });
  return crisis;
}
/** The hub reports the end of a crisis (`crisis:resolved` or `crisis:player-down`). True when it was the egg's. */
export function resolveQueensEggCrisisV188(save, crisisId, hubOutcome) {
  const state = queensStateV188(save);
  if (state.eggCrisis?.phase !== 'alert' || state.eggCrisis.crisisId !== crisisId) return false;
  const outcome = hubOutcome === 'resolved' ? 'neutralised' : 'extracted';
  return write(save, next => { next.eggCrisis = { phase: 'resolved', crisisId, outcome }; });
}
/**
 * Keeps a saved alert coherent with the hub (reload, tab closed during the alert): a crisis the hub
 * already closed is recorded with its outcome; a lost one is armed again. Returns 'resolved', 'rearmed' or null.
 */
export function reconcileQueensEggCrisisV188(save, createCrisis) {
  const state = queensStateV188(save);
  if (state.eggCrisis?.phase !== 'alert' || !save?.hub) return null;
  const running = activeCrisis(save), id = state.eggCrisis.crisisId;
  if (running?.id === id && running.resolved !== true) return null;
  const alerts = Array.isArray(save.galaxy?.alerts) ? save.galaxy.alerts : [];
  for (const hubOutcome of ['resolved', 'player-down'])
    if (alerts.some(alert => alert?.id === `alert-${id}-${hubOutcome}`)) return resolveQueensEggCrisisV188(save, id, hubOutcome) ? 'resolved' : null;
  if (running?.id === id && running.resolved === true) return resolveQueensEggCrisisV188(save, id, 'resolved') ? 'resolved' : null;
  if (running && running.resolved !== true || typeof createCrisis !== 'function') return null;
  const crisis = createCrisis(save, { ...QUEENS_EGG_CRISIS_V188, force: true });
  if (!crisis?.id) return null;
  write(save, next => { next.eggCrisis = { phase: 'alert', crisisId: String(crisis.id), outcome: null }; });
  return 'rearmed';
}

/** True when the briefing table has upkeep to run: a route to open, an arrival to record, or the egg's crisis to start or check. */
export function queensCampaignUpkeepDueV188(save) {
  const state = queensStateV188(save);
  if (state.phase !== 'accepted') return false;
  const unlocked = Array.isArray(save?.galaxy?.unlockedWorldIds) ? save.galaxy.unlockedWorldIds : [];
  return ARCS.some(arc => arcOpenState(state, arc) && (!unlocked.includes(arc.worldId) || !state[arc.arrivedKey] && shipWorld(save) === arc.worldId))
    || queensEggCrisisDueV188(save) || state.eggCrisis?.phase === 'alert';
}

// —— Mission locks ——
const grueAllied = save => save?.colonyMissionsV188?.grue === 'accept' || save?.asphodeleHubV188?.grue === 'accept';
/** Why a campaign mission cannot be launched yet, or null. */
export function queensLockReasonV188(save, campaignId) {
  if (!isQueensCampaignV188(campaignId)) return null;
  const state = queensStateV188(save);
  if (!mainCampaignCompleteV188(save) || !state.phase) return 'main';
  if (state.phase !== 'accepted') return 'call';
  const arc = arcOfId(campaignId), own = getQueensCampaignV188(campaignId);
  // Owner decision of 2026-11-23: a reused chapter is locked until its place in its arc, then freely
  // replayable from the operations registry, from any orbit. A replay does not advance the campaign.
  if (!own && state.done.includes(campaignId)) return null;
  if (!arcOpenState(state, arc)) return 'arc';
  if (shipWorld(save) !== arc.worldId) return arc.arc === 1 ? 'orbit' : `orbit-${arc.key}`;
  // The seized egg hatched aboard: Arc 3 waits for the crisis to end.
  if (arc.arc === 3 && eggCrisisPendingState(state)) return 'crisis';
  const index = arc.order.indexOf(campaignId);
  if (index > 0 && !state.done.includes(arc.order[index - 1])) return 'previous';
  // [PROPOSÉ] annexes and local contracts open with the arc's arrival mission (1.1, 2.1, 3.1).
  if (index < 0 && !state.done.includes(arc.order[0])) return arc.arc === 1 ? 'arrival' : `arrival-${arc.key}`;
  // §14.5: « La dette de Rask » needs a Rask who was let go with his case [PROPOSÉ: the egg left to him];
  // « Les ferrailleurs » needs Grue as an ally (colony or station pact).
  if (campaignId === 'queens-a-rask' && state.raskEgg !== 'release') return 'rask';
  if (campaignId === 'queens-a-grue' && !grueAllied(save)) return 'grue';
  // [PROPOSÉ] A story or side mission is played once in the campaign; the local contracts repeat.
  if (own && !own.replayableV188 && state.done.includes(campaignId)) return 'done';
  return null;
}
export function filterQueensCampaignsV188(save, campaigns) {
  const active = save?.strategy?.currentOperation?.campaignId;
  return campaigns.filter(campaign => campaign.id === active || !isQueensCampaignV188(campaign) || queensLockReasonV188(save, campaign.id) === null);
}
const LOCK_TEXT = Object.freeze({
  main: t('Ouvre après la campagne principale (Acte V terminé) : un appel arrivera au Tantalus.', 'Opens after the main campaign (Act V over): a call will reach the Tantalus.'),
  call: t('Répondez d’abord à l’appel de Nacre-7 (salle de briefing).', 'First answer the call from Nacre-7 (briefing room).'),
  arc: t('Ouvre avec la suite de « La Saison des Reines » : terminez d’abord l’arc précédent.', 'Opens later in "The Season of Queens": finish the previous arc first.'),
  orbit: t('Le Tantalus doit être en orbite de Nacre-7 : carte galactique, saut hyperspatial.', 'The Tantalus must be in orbit of Nacre-7: galaxy map, hyperspace jump.'),
  'orbit-echo': t('Le Tantalus doit être en orbite d’Echo Basin : carte galactique, saut hyperspatial.', 'The Tantalus must be in orbit of Echo Basin: galaxy map, hyperspace jump.'),
  'orbit-tr0': t('Le Tantalus doit être en orbite de TR-0 : carte galactique, saut hyperspatial.', 'The Tantalus must be in orbit of TR-0: galaxy map, hyperspace jump.'),
  crisis: t('Alerte biologique à bord : réglez d’abord la crise du pont de quarantaine du Tantalus.', 'Biological alert aboard: deal with the crisis on the Tantalus quarantine deck first.'),
  previous: t('Terminez d’abord la mission précédente de l’arc.', 'Finish the previous mission of the arc first.'),
  arrival: t('Ouvre après « Le quai noyé » (1.1).', 'Opens after "The Drowned Quay" (1.1).'),
  'arrival-echo': t('Ouvre après « Relais Gorge-Seize » (2.1).', 'Opens after "Gorge-Seize Relay" (2.1).'),
  'arrival-tr0': t('Ouvre après « Atterrissage sur la peau » (3.1).', 'Opens after "Landing on the Skin" (3.1).'),
  rask: t('Le capitaine Rask n’appelle que ceux qui l’ont laissé repartir avec son caisson.', 'Captain Rask only calls those who let him leave with his case.'),
  grue: t('Grue ne propose ce travail qu’à ses alliés.', 'Grue only offers this job to her allies.'),
  done: t('Mission déjà accomplie dans cette campagne.', 'Mission already completed in this campaign.')
});
export const queensLockTextV188 = (reason, language = 'fr') => LOCK_TEXT[reason]?.[L(language)] || '';

// —— Operation results ——
/** In the operation's resolution transaction. Mutates the candidate save; returns the change or null. */
export function applyQueensOperationResultV188(save, { success, campaignId } = {}) {
  if (!success || !isQueensCampaignV188(campaignId) || !queensAcceptedV188(save)) return null;
  const contract = getQueensCampaignV188(campaignId)?.queensContractV188;
  if (contract) {
    let count = 0;
    write(save, state => { count = state.contracts[contract] = Math.min(99, (state.contracts[contract] || 0) + 1); });
    return { kind: 'contract', key: contract, count };
  }
  const state = queensStateV188(save), arc = arcOfId(campaignId);
  if (state.done.includes(campaignId) || !arcOpenState(state, arc)) return null; // a replay, or a chapter played before its arc
  // A step counts only when the arc reaches it: a chapter resolved out of order is a replay.
  const index = arc.order.indexOf(campaignId);
  if (index > 0 && !state.done.includes(arc.order[index - 1])) return null;
  if (index < 0 && !state.done.includes(arc.order[0])) return null;
  write(save, next => { next.done = [...next.done, campaignId]; });
  // The last step of an arc opens the next one in the same transaction (route, TR-0 revealed).
  syncQueensRoutesV188(save);
  return { kind: 'step', id: campaignId, arc: arc.arc, arcComplete: orderDone(queensStateV188(save), arc) };
}

// —— Choices (§14.8) ——
export const queensRaskChoicePendingV188 = save => { const state = queensStateV188(save); return state.done.includes('queens-1-5-rask') && !state.raskEgg; };
export function chooseQueensRaskEggV188(save, choice) {
  if (!QUEENS_RASK_CHOICES_V188.includes(choice) || !queensRaskChoicePendingV188(save)) return false;
  write(save, state => { state.raskEgg = choice; });
  syncQueensRoutesV188(save); // Arc 1 is complete: the route to Echo Basin opens
  return true;
}
export const queensSpecimenChoicePendingV188 = save => { const state = queensStateV188(save); return state.done.includes('queens-a-echantillon') && !state.specimen; };
// [PROPOSÉ] immediate effects of the specimen choice (§14.8: « recherche + » / « confiance BISHOP + »).
export const QUEENS_SPECIMEN_EFFECTS_V188 = Object.freeze({ inez: Object.freeze({ research: 15 }), bishop: Object.freeze({ bishopLoyalty: 10 }) });
export function chooseQueensSpecimenV188(save, choice) {
  if (!QUEENS_SPECIMEN_CHOICES_V188.includes(choice) || !queensSpecimenChoicePendingV188(save)) return false;
  write(save, state => { state.specimen = choice; });
  const effect = QUEENS_SPECIMEN_EFFECTS_V188[choice];
  if (effect.research && save.galaxy?.resources) save.galaxy.resources.research = (Number(save.galaxy.resources.research) || 0) + effect.research;
  const bishop = effect.bishopLoyalty && Array.isArray(save.crew) ? save.crew.find(member => member?.id === 'crew-05-bishop-9') : null;
  if (bishop && Number.isFinite(bishop.loyalty)) bishop.loyalty = Math.max(0, Math.min(100, bishop.loyalty + effect.bishopLoyalty));
  return true;
}
/** Consequences recorded for later campaigns (§14.8, §14.10, §19). Derived from the save, never stored twice. */
export function queensConsequencesV188(save) {
  const state = queensStateV188(save), egg = state.raskEgg;
  return Object.freeze({
    // Seized: a piece of the QZ17 thread for campaign 5, and a biological risk aboard until the crisis has broken out and ended.
    qz17ThreadPiece: egg === 'seize', biologicalRiskAboard: egg === 'seize' && state.eggCrisis?.phase !== 'resolved',
    eggCrisisOutcome: state.eggCrisis?.outcome || null,
    // Released: Weyland-Yutani gains a specimen (difficulty +1 in campaign 5, not produced).
    companySpecimen: egg === 'release',
    // Rask saved (« La dette de Rask »): an informant for campaign 5 (not produced).
    raskInformant: state.done.includes('queens-a-rask'),
    // §19: the shipping registers of Base Ombelle, a piece of the QZ17 thread (3.2).
    ombelleRegisters: state.done.includes('queens-3-2-ombelle'),
    // The live Praetorian: Inez keeps it (anti-Queen weapon research unlocked, weapon itself not produced)
    // or BISHOP-9 does (the company will claim it later, not produced).
    antiQueenResearch: state.specimen === 'inez', specimenClaimedLater: state.specimen === 'bishop',
    // §14.10: Dr Navarre can be recruited once her notebooks are aboard and the campaign is over (recruitment not produced).
    navarreRecruitable: state.done.includes('queens-a-navarre') && arcCompleteState(state, ARCS[2]),
    lineagesExtinct: arcCompleteState(state, ARCS[2])
  });
}
export const queensArc1CompleteV188 = save => queensArc1CompleteState(queensStateV188(save));
export const queensArcCompleteV188 = (save, arc) => Boolean(ARCS[arc - 1]) && arcCompleteState(queensStateV188(save), ARCS[arc - 1]);
export const queensArcOpenV188 = (save, arc) => Boolean(ARCS[arc - 1]) && arcOpenState(queensStateV188(save), ARCS[arc - 1]);
/** The campaign is over: the three arcs are complete (the Red Hive destroyed). */
export const queensCampaignCompleteV188 = save => queensArcCompleteV188(save, 3);

// —— Return scenes, once each, at the briefing table (bible §14.4-§14.6; texts [PROPOSÉ]) ——
const EGG_AFTER = Object.freeze({
  neutralised: t('La créature est abattue au pont de quarantaine. BISHOP-9 incinère le caisson et ce qu’il contenait. Inez ne proteste pas. Le Tantalus garde ses dégâts, et la pièce du fil QZ17 reste au dossier : les relevés de l’œuf, pas l’œuf. TR-0 attend sous l’orbite.',
    'The creature is put down on the quarantine deck. BISHOP-9 incinerates the case and what it held. Inez does not object. The Tantalus keeps its damage, and the piece of the QZ17 thread stays on file: the egg’s readings, not the egg. TR-0 waits below the orbit.'),
  extracted: t('L’équipe a été évacuée du pont de quarantaine ; l’équipage a fini le travail au lance-flammes, section par section. Le Tantalus garde ses dégâts et ses blessés. La pièce du fil QZ17 reste au dossier : les relevés de l’œuf, pas l’œuf. TR-0 attend sous l’orbite.',
    'The team was evacuated from the quarantine deck; the crew finished the job with flamethrowers, section by section. The Tantalus keeps its damage and its wounded. The piece of the QZ17 thread stays on file: the egg’s readings, not the egg. TR-0 waits below the orbit.')
});
const scene = (slot, title, text) => Object.freeze({ slot, title, text });
export const QUEENS_SCENES_V188 = Object.freeze({
  'queens-1-1-quai': scene('queens-quay', t('Sous-Récif · la salle des pompes', 'Sous-Récif · the pump room'),
    t('Le Dr Ilse Navarre ouvre la porte de la salle des pompes au troisième appel. Onze survivants derrière elle. « Ils ne viennent pas par les plates-formes. Ils viennent d’en dessous. Les bassins d’élevage sont pleins de quelque chose qui n’est pas à nous. » Elle demande qu’on relance les pompes.',
      'Dr Ilse Navarre opens the pump-room door at the third call. Eleven survivors behind her. "They don’t come along the platforms. They come from below. The breeding pens are full of something that isn’t ours." She asks for the pumps to be restarted.')),
  'queens-1-2-bassins': scene('queens-pools', t('Sous-Récif · les bassins vidés', 'Sous-Récif · the drained pens'),
    t('Les deux bassins sont à sec. Sur les parois, des œufs fixés comme des coraux ; dans les filets, des cocons. Navarre relève les sondes : la lignée est venue de l’épave du Mariner’s Debt, coulée au bord du fossé. Le nid est là-bas, et la Reine avec lui.',
      'Both pens are dry. On the walls, eggs fixed like coral; in the nets, cocoons. Navarre reads the probes: the lineage came from the wreck of the Mariner’s Debt, sunk at the edge of the trench. The nest is down there, and the Queen with it.')),
  [QUEENS_ABYSS_CHAPTER_ID_V188]: scene('queens-trench', t('Le fossé · retour à la cloche', 'The trench · back at the bell'),
    t('La cloche remonte avec le MANTA-6 accroché à son câble. Le nid de l’épave est stabilisé, la Reine récifale a reculé dans le noir. Sur la plate-forme, une navette qui n’est pas la nôtre allume ses feux : le capitaine Rask et son escouade de récupération ont suivi la plongée.',
      'The bell comes up with MANTA-6 hooked to its cable. The wreck’s nest is stabilised, the reef Queen has drawn back into the dark. On the platform, a shuttle that isn’t ours lights up: Captain Rask and his salvage squad followed the dive.')),
  'queens-1-5-rask': scene('queens-rask', t('La plate-forme d’envol · le caisson', 'The landing platform · the case'),
    t('La zone est tenue. Le capitaine Tobiah Rask garde la main sur un caisson réfrigéré : un œuf royal, prélevé pendant le combat dans le fossé. « La compagnie paie l’observation, sergent. Personne ne vous demande de comprendre. » Le caisson est entre vous et sa navette.',
      'The zone is held. Captain Tobiah Rask keeps his hand on a refrigerated case: a royal egg, taken during the fight in the trench. "The company pays for observation, sergeant. Nobody asks you to understand." The case is between you and his shuttle.')),
  'queens-a-navarre': scene('queens-pools', t('Les carnets de Navarre', 'Navarre’s notebooks'),
    t('Quarante-deux jours de relevés. Carapace lisse, respiration en eau froide, chasse sous la surface : la lignée s’est adaptée à Sous-Récif plus vite qu’aucun modèle ne le prévoit. Inez les reçoit au laboratoire du Tantalus.',
      'Forty-two days of readings. Smooth carapace, cold-water breathing, hunting below the surface: the lineage adapted to Sous-Récif faster than any model predicts. Inez receives them in the Tantalus laboratory.')),
  'queens-a-filets': scene('queens-quay', t('Les filets', 'The nets'),
    t('Les filets sont remontés. Certains cocons étaient vides ; d’autres non. Les vivants sont à l’abri de la salle des pompes. Le pêcheur reste longtemps sur le ponton à regarder l’eau.',
      'The nets are up. Some cocoons were empty; others were not. The living are safe in the pump room. The fisherman stays a long time on the pontoon, watching the water.')),
  'queens-a-phare': scene('queens-quay', t('Le phare de Sous-Récif', 'The Sous-Récif lighthouse'),
    t('La balise tourne à nouveau. Trois canots accostent avant l’aube. Rook a branché le phare sur la fréquence du Tantalus : le prochain appel de Nacre-7 n’arrivera pas en retard.',
      'The beacon turns again. Three boats come alongside before dawn. Rook has patched the lighthouse into the Tantalus frequency: the next call from Nacre-7 will not arrive late.')),
  // —— Arc 2 ——
  'echo-arrival': scene('queens-canyon', t('Echo Basin · orbite', 'Echo Basin · orbit'),
    t('Le Tantalus sort d’hypersommeil au-dessus des canyons rouges d’Echo Basin. Les tours relais de Gorge-Seize émettent encore, par intermittence. Orlov prépare le dropship : « Du vent dans tous les canyons. On se posera sur une tour, pas au fond. »',
      'The Tantalus comes out of hypersleep above the red canyons of Echo Basin. The Gorge-Seize relay towers are still transmitting, on and off. Orlov readies the dropship: "Wind in every canyon. We land on a tower, not at the bottom."')),
  'queens-2-1-relais': scene('queens-canyon', t('Gorge-Seize · la tour relais', 'Gorge-Seize · the relay tower'),
    t('Le relais tient. Le contremaître de Gorge-Seize montre le détecteur de mouvement posé sur la console : il affiche douze contacts, il n’y a personne. « L’écho. On a cessé de le regarder. Ce qu’on écoute, c’est la roche. » Un convoi de mineurs attend de descendre vers la ville troglodyte.',
      'The relay holds. The Gorge-Seize foreman points at the motion tracker on the console: it shows twelve contacts, there is nobody. "The echo. We stopped watching it. What we listen to is the rock." A miners’ convoy is waiting to go down to the cave town.')),
  'queens-2-2-sol': scene('queens-canyon', t('La ville troglodyte', 'The cave town'),
    t('Le convoi est entré dans la ville troglodyte. Derrière lui, la piste est trouée de galeries fraîches : la lignée fouisseuse suit les vibrations. Au-dessus, un avant-poste appelle : quelque chose tombe des surplombs sur ses toits. Orlov fait chauffer le Cheyenne.',
      'The convoy is inside the cave town. Behind it, the track is riddled with fresh galleries: the burrowing lineage follows vibrations. Above, an outpost is calling: something is dropping from the overhangs onto its roofs. Orlov warms up the Cheyenne.')),
  [QUEENS_BROODSTORM_CHAPTER_ID_V188]: scene('queens-eyrie', t('Les surplombs · retour du Cheyenne', 'The overhangs · the Cheyenne returns'),
    t('Le transport de l’avant-poste est passé, les nids des falaises brûlent. La Reine ailée a décroché avant la fin et remonté le canyon vers l’aiguille. Sanaa Doyle la suit aux jumelles : « Elle ne fuit pas. Elle rentre chez elle. »',
      'The outpost’s transport got through, the cliff nests are burning. The winged Queen broke off before the end and flew up the canyon towards the needle. Sanaa Doyle follows her through binoculars: "She isn’t fleeing. She’s going home."')),
  'queens-2-4-aire': scene('queens-eyrie', t('L’aiguille · l’aire', 'The needle · the eyrie'),
    t('L’aire est silencieuse. La Reine aérienne est tombée au pied de son nid, les membranes repliées. Dans les alvéoles, des coquilles vides, toutes du même âge. Inez les compte deux fois : « Ils ont été posés ici en une seule fois. Ce nid n’a pas grandi. On l’a livré. »',
      'The eyrie is silent. The aerial Queen fell at the foot of her nest, membranes folded. In the cells, empty shells, all the same age. Inez counts them twice: "They were set down here all at once. This nest didn’t grow. It was delivered."')),
  'queens-2-5-carte': scene('queens-debrief', t('La carte des lignées', 'The map of the lineages'),
    t('Le registre de vol de la tour relais est lisible. Six mois plus tôt, trois cargos Weyland-Yutani ont fait escale à Gorge-Seize, soutes scellées, venant d’un monde absent des cartes civiles : désignation TR-0. Inez pose le registre à côté des relevés de Nacre-7. Les deux lignées ont été déposées. Elles viennent du même endroit.',
      'The relay tower’s flight log is readable. Six months earlier, three Weyland-Yutani freighters called at Gorge-Seize, holds sealed, coming from a world absent from civilian charts: designation TR-0. Inez lays the log beside the Nacre-7 readings. Both lineages were set down. They come from the same place.')),
  'queens-a-mineurs': scene('queens-canyon', t('Le puits 7', 'Shaft 7'),
    t('Dix mineurs sont remontés par les échelles de service. Le dernier referme la trappe derrière lui : au fond du puits, la roche s’est ouverte une minute après. Le contremaître inscrit le puits 7 sur la liste des puits fermés.',
      'Ten miners came up the service ladders. The last one shuts the hatch behind him: at the bottom of the shaft, the rock opened a minute later. The foreman writes shaft 7 on the list of closed shafts.')),
  'queens-a-rask': scene('queens-rask', t('La dette de Rask', 'Rask’s debt'),
    t('Quatre hommes de l’escouade sortent du canyon, et Rask le dernier. Il ne remercie pas. Il donne une suite de coordonnées. « Base Ombelle. C’est de là que partent les caissons. Je n’ai jamais dit ça, et vous ne m’avez jamais vu. » Il ajoute, plus bas : « Si vous y allez, ne faites pas de bruit. »',
      'Four men of the squad walk out of the canyon, and Rask last. He doesn’t say thank you. He gives a string of coordinates. "Ombelle Base. That’s where the cases ship from. I never said that, and you never saw me." He adds, lower: "If you go there, don’t make a sound."')),
  'queens-a-sorensen': scene('queens-canyon', t('La route des crêtes', 'The ridge road'),
    t('La première colonne est passée par les crêtes sans toucher le fond d’un canyon. Leila Sørensen plante la dernière balise et la regarde tenir dans le vent. « Plus long, plus froid, et personne dessous. C’est la bonne route. »',
      'The first column went along the ridges without touching a canyon floor. Leila Sørensen plants the last marker and watches it hold in the wind. "Longer, colder, and nobody underneath. It’s the right road."')),
  'queens-a-grue': scene('queens-canyon', t('Les ferrailleurs', 'The scrappers'),
    t('Les capteurs sismiques de l’épave Crucible sont à bord. Grue en garde deux et en laisse un à Gorge-Seize, posé à même la roche. Il sonne avant le détecteur de mouvement, et il ne ment pas.',
      'The seismic sensors from the Crucible wreck are aboard. Grue keeps two and leaves one at Gorge-Seize, set straight on the rock. It sounds before the motion tracker does, and it doesn’t lie.')),
  // —— Arc 3 ——
  'tr0-arrival': scene('queens-tr0', t('TR-0 · orbite', 'TR-0 · orbit'),
    t('Le Tantalus sort d’hypersommeil au-dessus d’un monde qu’aucune carte civile ne porte. Aucune mer, aucune forêt : une surface noire, veinée, qui bouge lentement. Les capteurs ne trouvent pas de sol nu. Inez regarde longtemps l’écran. « Ce n’est pas une ruche sur un monde. C’est le monde. »',
      'The Tantalus comes out of hypersleep above a world no civilian chart carries. No sea, no forest: a black, veined surface, moving slowly. The sensors find no bare ground. Inez looks at the screen for a long time. "It isn’t a hive on a world. It is the world."')),
  'egg-crisis-alert': scene('queens-egg-crisis', t('Alerte biologique · pont de quarantaine', 'Biological alert · quarantine deck'),
    t('L’alarme du pont 2 sonne avant la fin du réveil. Le caisson saisi à Sous-Récif est ouvert de l’intérieur ; l’œuf royal est vide. BISHOP-9 a scellé la quarantaine. « L’éclosion a commencé pendant l’hypersommeil. Elle a répondu à quelque chose : nous approchions de ce monde. » La créature est à bord. Rejoignez le pont de quarantaine du Tantalus : l’arc 3 attendra.',
      'The deck 2 alarm sounds before the wake-up is over. The case seized at Sous-Récif is open from the inside; the royal egg is empty. BISHOP-9 has sealed the quarantine. "The hatching began during hypersleep. It answered something: we were nearing this world." The creature is aboard. Go to the Tantalus quarantine deck: Arc 3 will wait.')),
  'egg-crisis-after': scene('queens-egg-crisis', t('Pont de quarantaine · après l’alerte', 'Quarantine deck · after the alert'),
    EGG_AFTER.neutralised), // the text follows the outcome: `queensSceneV188`
  'queens-3-1-peau': scene('queens-tr0', t('La peau · l’entrée de Base Ombelle', 'The skin · the way into Ombelle Base'),
    t('Sous la croûte, un sas aux couleurs de la compagnie, à demi pris dans la résine : Base Ombelle. Les évents se sont refermés derrière l’équipe. Orlov tient le dropship moteurs coupés : « Je ne redécolle que si vous le demandez. Ici, le bruit a un prix. »',
      'Under the crust, an airlock in company colours, half caught in resin: Ombelle Base. The vents closed behind the team. Orlov keeps the dropship engines off: "I only lift again if you ask. Noise has a price here."')),
  'queens-3-2-ombelle': scene('queens-ombelle', t('Base Ombelle · les registres', 'Ombelle Base · the registers'),
    t('Les journaux de Base Ombelle tiennent en une phrase : la station étudiait la Red Hive et expédiait ses œufs vers d’autres mondes du Reach, pour observer ce qu’ils deviendraient. Nacre-7. Echo Basin. Cocyte. Les cargos QZ17 partaient d’ici. Les données, elles, partaient vers une adresse de Khepri Forge. Sous la base, la radio capte un bourdonnement.',
      'The Ombelle Base logs come down to one sentence: the station studied the Red Hive and shipped its eggs to other worlds of the Reach, to observe what they would become. Nacre-7. Echo Basin. Cocyte. The QZ17 freighters left from here. The data went to an address on Khepri Forge. Under the base, the radio picks up a hum.')),
  [QUEENS_MOTHER_CHAPTER_ID_V188]: scene('queens-tr0', t('La salle royale · les balises', 'The royal chamber · the beacons'),
    t('Les trois Chœurs se sont tus l’un après l’autre, puis la Reine-Mère. Les balises de repli ont tenu jusqu’au dropship. Autour de la salle royale, la surface ne respire plus au même rythme : sans sa Mère, la ruche-monde s’affole. Il reste le noyau.',
      'The three Choirs fell silent one after another, then the Queen Mother. The fallback beacons held until the dropship. Around the royal chamber, the surface no longer breathes in time: without its Mother, the hive world is panicking. The core remains.')),
  [QUEENS_HIVE_WORLD_CHAPTER_ID_V188]: scene('queens-tr0', t('TR-0 · le sas', 'TR-0 · the airlock'),
    t('Les quatre organes sont détruits, le noyau neutralisé. Le sas s’est refermé sur l’équipe au moment où la croûte commençait à céder. Derrière le dropship, la surface s’affaisse sur des kilomètres.',
      'The four organs are destroyed, the core neutralised. The airlock closed on the team as the crust began to give. Behind the dropship, the surface is sinking for kilometres.')),
  'queens-a-ombelle': scene('queens-ombelle', t('Le dernier chercheur', 'The last researcher'),
    t('Le chercheur de Base Ombelle est à l’infirmerie du Tantalus. Il a tenu quatre mois dans une chambre froide. Il donne l’emplacement des registres d’expédition sans qu’on le lui demande, puis une seule phrase : « On ne les envoyait pas pour qu’ils meurent. On voulait savoir ce qu’ils apprendraient. »',
      'The Ombelle Base researcher is in the Tantalus infirmary. He held out for four months in a cold room. He gives the location of the shipping registers without being asked, then a single sentence: "We didn’t send them to die. We wanted to know what they would learn."')),
  'queens-a-echantillon': scene('queens-ombelle', t('Le caisson du Praetorian', 'The Praetorian’s case'),
    t('Le Praetorian est vivant, sanglé dans un caisson renforcé au hangar. Inez Harlow et BISHOP-9 attendent de part et d’autre.',
      'The Praetorian is alive, strapped into a reinforced case in the hangar. Inez Harlow and BISHOP-9 are waiting on either side of it.'))
});
/** A scene's title and text in one language (the crisis aftermath depends on its outcome). */
export function queensSceneV188(save, sceneId, language = 'fr') {
  const entry = QUEENS_SCENES_V188[sceneId], lang = L(language);
  if (!entry) return null;
  const text = sceneId === 'egg-crisis-after' ? (EGG_AFTER[queensStateV188(save).eggCrisis?.outcome] || EGG_AFTER.neutralised)[lang] : entry.text[lang];
  return Object.freeze({ slot: entry.slot, title: entry.title[lang], text });
}
/** The next scene to show at the briefing table, or null: mission returns in story order, arrivals, the egg crisis. */
export function queensReturnSceneDueV188(save) {
  const state = queensStateV188(save), unseen = id => !state.scenesSeen.includes(id);
  for (const arc of ARCS) {
    if (arc.arc === 2 && state.arrivedEchoDay && unseen('echo-arrival')) return 'echo-arrival';
    if (arc.arc === 3 && state.arrivedTr0Day && unseen('tr0-arrival')) return 'tr0-arrival';
    if (arc.arc === 3 && state.eggCrisis && unseen('egg-crisis-alert')) return 'egg-crisis-alert';
    if (arc.arc === 3 && state.eggCrisis?.phase === 'resolved' && unseen('egg-crisis-after')) return 'egg-crisis-after';
    const due = [...arc.order, ...arc.sides.map(entry => entry.id)].find(id => state.done.includes(id) && unseen(id));
    if (due) return due;
  }
  return null;
}
export function markQueensSceneSeenV188(save, sceneId) {
  if (!SCENE_IDS.includes(sceneId)) return false;
  return write(save, state => {
    if (state.scenesSeen.includes(sceneId) || !sceneAllowed(state, sceneId)) return false;
    state.scenesSeen = [...state.scenesSeen, sceneId];
  });
}
/**
 * The cinematic played before a scene (bible §14.7): CQ-02 closes 1.4, CQ-03 closes 2.4, CQ-04 opens
 * Arc 3 in TR-0's orbit, CQ-05 and CQ-06 come back with the two Red Hive chapters. [PROPOSÉ] CQ-05 is
 * dated « 3.3 » by the bible: the chapter covers 3.3-3.4 in one sortie, so it plays at its return.
 */
export const QUEENS_SCENE_CINEMATICS_V188 = Object.freeze({ [QUEENS_ABYSS_CHAPTER_ID_V188]: 'cin-cq-02', 'queens-2-4-aire': 'cin-cq-03',
  'tr0-arrival': 'cin-cq-04', [QUEENS_MOTHER_CHAPTER_ID_V188]: 'cin-cq-05', [QUEENS_HIVE_WORLD_CHAPTER_ID_V188]: 'cin-cq-06' });
export const QUEENS_CALL_CINEMATIC_V188 = 'cin-cq-01';

// —— Choice dialogs ——
export const QUEENS_RASK_DIALOG_V188 = Object.freeze({
  slot: 'queens-rask', title: t('L’œuf royal de Rask', 'Rask’s royal egg'),
  text: t('Le caisson de Rask contient un œuf royal de la lignée récifale. Le laisser partir, le saisir pour le Tantalus, ou le détruire sur la plate-forme. La décision ne pourra pas être reprise.',
    'Rask’s case holds a royal egg of the reef lineage. Let it go, seize it for the Tantalus, or destroy it on the platform. The decision cannot be taken back.'),
  options: Object.freeze({
    release: t('LE LAISSER PARTIR', 'LET IT GO'), seize: t('LE SAISIR', 'SEIZE IT'), destroy: t('LE DÉTRUIRE', 'DESTROY IT')
  }),
  results: Object.freeze({
    release: t('La navette de Rask décolle avec le caisson. Weyland-Yutani a son spécimen ; on le retrouvera plus tard, mieux préparé. Rask, lui, vous doit quelque chose.',
      'Rask’s shuttle lifts off with the case. Weyland-Yutani has its specimen; it will be met again later, better prepared. Rask, for his part, owes you one.'),
    seize: t('Le caisson est chargé dans le dropship sous la garde de Sanaa Doyle. Inez y voit une pièce du fil QZ17 ; BISHOP-9 parle de préservation. À bord du Tantalus, un œuf royal est un risque biologique.',
      'The case is loaded into the dropship under Sanaa Doyle’s guard. Inez sees a piece of the QZ17 thread in it; BISHOP-9 talks of preservation. Aboard the Tantalus, a royal egg is a biological risk.'),
    destroy: t('Le caisson brûle sur la plate-forme sous la pluie. Rask ne dit rien. Il n’y a plus rien à prélever à Sous-Récif.',
      'The case burns on the platform in the rain. Rask says nothing. There is nothing left to take at Sous-Récif.')
  })
});
export const QUEENS_SPECIMEN_DIALOG_V188 = Object.freeze({
  slot: 'queens-ombelle', title: t('Le Praetorian vivant', 'The live Praetorian'),
  text: t('Le Praetorian capturé sur TR-0 est en caisson au hangar. Inez Harlow veut l’étudier : comprendre la lignée, c’est savoir tuer ses Reines. BISHOP-9 veut le préserver, intact, sous sa garde. Il faut dire qui le garde. La décision ne pourra pas être reprise.',
    'The Praetorian captured on TR-0 is in a case in the hangar. Inez Harlow wants to study it: understanding the lineage means knowing how to kill its Queens. BISHOP-9 wants to preserve it, intact, in his keeping. Someone must say who keeps it. The decision cannot be taken back.'),
  options: Object.freeze({ inez: t('LE CONFIER À INEZ', 'GIVE IT TO INEZ'), bishop: t('LE CONFIER À BISHOP-9', 'GIVE IT TO BISHOP-9') }),
  results: Object.freeze({
    inez: t('Inez fait rouler le caisson jusqu’au laboratoire. En trois jours, elle sait ce qui traverse une carapace royale. La recherche du Tantalus progresse ; une arme contre les Reines devient possible.',
      'Inez has the case rolled to the laboratory. Within three days she knows what goes through a royal carapace. The Tantalus research advances; a weapon against Queens becomes possible.'),
    bishop: t('BISHOP-9 scelle le caisson en stase et en garde la clef. « Merci. Il ne lui arrivera rien. » Sa confiance grandit. La compagnie, tôt ou tard, viendra réclamer ce spécimen.',
      'BISHOP-9 seals the case in stasis and keeps the key. "Thank you. Nothing will happen to it." His trust grows. Sooner or later, the company will come and claim this specimen.')
  })
});
const CHOICES = Object.freeze([
  Object.freeze({ id: 'rask', dialog: QUEENS_RASK_DIALOG_V188, options: QUEENS_RASK_CHOICES_V188, pending: queensRaskChoicePendingV188, choose: chooseQueensRaskEggV188 }),
  Object.freeze({ id: 'specimen', dialog: QUEENS_SPECIMEN_DIALOG_V188, options: QUEENS_SPECIMEN_CHOICES_V188, pending: queensSpecimenChoicePendingV188, choose: chooseQueensSpecimenV188 })
]);
/** The decision waiting at the briefing table ({ id, dialog, options }) or null. */
export function queensPendingChoiceV188(save) {
  const choice = CHOICES.find(entry => entry.pending(save));
  return choice ? Object.freeze({ id: choice.id, dialog: choice.dialog, options: choice.options }) : null;
}
/** Records a pending decision. Mutates the candidate save; true when recorded. */
export function chooseQueensV188(save, choiceId, option) {
  const choice = CHOICES.find(entry => entry.id === choiceId);
  return Boolean(choice) && choice.choose(save, option);
}

export const QUEENS_CALL_DIALOG_V188 = Object.freeze({
  slot: 'queens-call', title: t('Appel reçu · La Saison des Reines', 'Call received · The Season of Queens'),
  text: t('Au laboratoire, Inez Harlow a comparé les œufs QZ17 récupérés à Cocyte : trois lignées distinctes, marquées par l’eau froide, la roche et l’altitude. Elles mènent à un même foyer, quelque part dans le Reach. Deux appels sont arrivés en retard : la colonie aquacole de Sous-Récif, sur Nacre-7, ne répond plus depuis le jour {sent} ; les relais d’Echo Basin signalent des « nids sur les falaises ». Ordre de l’Administration : localiser et détruire les Reines. La compagnie, elle, envoie une escouade de récupération « observer ».\nRoute : Nacre-7 · {fuel} unités de carburant · {days} jours en hypersommeil.',
    'In the laboratory, Inez Harlow compared the QZ17 eggs recovered on Cocyte: three distinct lineages, marked by cold water, rock and altitude. They lead to a single source, somewhere in the Reach. Two calls arrived late: the Sous-Récif aquaculture colony, on Nacre-7, has not answered since day {sent}; the Echo Basin relays report "nests on the cliffs". Administration order: locate and destroy the Queens. The company is sending a salvage squad to "observe".\nRoute: Nacre-7 · {fuel} fuel units · {days} days in hypersleep.'),
  options: Object.freeze({ accept: t('ACCEPTER LA RÉQUISITION', 'ACCEPT THE REQUISITION'), later: t('PLUS TARD', 'LATER') }),
  accepted: t('Réquisition acceptée. La route de Nacre-7 est ouverte : carte galactique, puis saut hyperspatial. Les missions de l’arc 1 se planifient depuis l’orbite de Nacre-7.',
    'Requisition accepted. The route to Nacre-7 is open: galaxy map, then hyperspace jump. Arc 1 missions are planned from Nacre-7’s orbit.')
});
export function queensCallTextV188(save, language = 'fr', { fuel = null, days = 14 } = {}) {
  const state = queensStateV188(save), lang = L(language);
  const callDay = state.callDay || today(save);
  return fill(QUEENS_CALL_DIALOG_V188.text[lang], { sent: Math.max(1, callDay - queensCallDelayV188(save)), fuel: fuel ?? '—', days });
}

// —— Debriefs: Arc 1, Arc 2, and the campaign's single ending nuanced by the choices (§14.8) ——
const DEBRIEF = Object.freeze({
  title: t('Retour au Tantalus · Arc 1, « Sous la surface »', 'Back aboard the Tantalus · Arc 1, "Beneath the surface"'),
  base: t('Compte rendu de Nacre-7. La lignée récifale est contenue : le nid du Mariner’s Debt est stabilisé, les bassins de Sous-Récif sont vidés. Inez classe les relevés : la lignée n’est pas arrivée par hasard. Les relais d’Echo Basin appellent toujours : la route d’Echo Basin est ouverte (carte galactique, saut hyperspatial).',
    'Nacre-7 debrief. The reef lineage is contained: the Mariner’s Debt nest is stabilised, the Sous-Récif pens are drained. Inez files the readings: the lineage did not arrive by chance. The Echo Basin relays are still calling: the route to Echo Basin is open (galaxy map, hyperspace jump).'),
  release: t('Le capitaine Rask est reparti avec l’œuf royal : la compagnie a son spécimen.', 'Captain Rask left with the royal egg: the company has its specimen.'),
  seize: t('L’œuf royal est sous scellés à bord : une pièce du fil QZ17, et un risque à surveiller.', 'The royal egg is sealed aboard: a piece of the QZ17 thread, and a risk to watch.'),
  destroy: t('L’œuf royal a brûlé à Sous-Récif.', 'The royal egg burned at Sous-Récif.'),
  navarre: t('Les carnets de Navarre sont au laboratoire.', 'Navarre’s notebooks are in the laboratory.')
});
const DEBRIEF2 = Object.freeze({
  title: t('Retour au Tantalus · Arc 2, « L’écho des canyons »', 'Back aboard the Tantalus · Arc 2, "The echo of the canyons"'),
  base: t('Compte rendu d’Echo Basin. La lignée fouisseuse a perdu ses galeries sous Gorge-Seize, la lignée aérienne sa Reine. Les deux lignées, comme celle de Nacre-7, ont été déposées par des cargos de la compagnie venus d’un monde absent des cartes civiles. Le Tantalus a maintenant ses coordonnées : TR-0 apparaît sur la carte galactique.',
    'Echo Basin debrief. The burrowing lineage has lost its galleries under Gorge-Seize, the aerial lineage its Queen. Both lineages, like the one on Nacre-7, were set down by company freighters from a world absent from civilian charts. The Tantalus now has its coordinates: TR-0 appears on the galaxy map.'),
  rask: t('Rask, sorti du canyon, a confirmé l’adresse : Base Ombelle. Il parlera encore, plus tard.', 'Rask, pulled out of the canyon, confirmed the address: Ombelle Base. He will talk again, later.'),
  seize: t('L’œuf royal saisi à Sous-Récif est toujours sous scellés à bord. BISHOP-9 note que sa température monte.', 'The royal egg seized at Sous-Récif is still sealed aboard. BISHOP-9 notes that its temperature is rising.'),
  ridge: t('La route des crêtes de Leila Sørensen tient.', 'Leila Sørensen’s ridge road holds.'),
  sensors: t('Les capteurs sismiques de Grue écoutent la roche de Gorge-Seize.', 'Grue’s seismic sensors are listening to the rock of Gorge-Seize.')
});
const ENDING = Object.freeze({
  title: t('Retour au Tantalus · La Saison des Reines', 'Back aboard the Tantalus · The Season of Queens'),
  base: t('Compte rendu de campagne. Les trois lignées sont éteintes : la Reine des récifs de Nacre-7, la Reine volante d’Echo Basin, la Reine-Mère de TR-0. La Red Hive est détruite avec son monde. Le compte rendu établit que Base Ombelle, station de recherche de la compagnie, expédiait des œufs vers les mondes du Reach pour observer leurs adaptations ; les cargos QZ17 partaient de là. Destinataire des données : une adresse de Khepri Forge.',
    'Campaign debrief. The three lineages are extinct: the reef Queen of Nacre-7, the flying Queen of Echo Basin, the Queen Mother of TR-0. The Red Hive is destroyed with its world. The debrief establishes that Ombelle Base, a company research station, shipped eggs to the worlds of the Reach to observe their adaptations; the QZ17 freighters left from there. Recipient of the data: an address on Khepri Forge.'),
  release: t('La compagnie garde l’œuf royal que Rask a emporté de Sous-Récif : une lignée n’est pas tout à fait éteinte.', 'The company keeps the royal egg Rask took from Sous-Récif: one lineage is not quite extinct.'),
  seizeNeutralised: t('L’œuf saisi a éclos à bord au-dessus de TR-0 ; la créature a été abattue au pont de quarantaine. Ses relevés restent au dossier QZ17.', 'The seized egg hatched aboard above TR-0; the creature was put down on the quarantine deck. Its readings stay in the QZ17 file.'),
  seizeExtracted: t('L’œuf saisi a éclos à bord au-dessus de TR-0 ; l’équipage a repris le pont de quarantaine au prix de dégâts et de blessés. Ses relevés restent au dossier QZ17.', 'The seized egg hatched aboard above TR-0; the crew retook the quarantine deck at the cost of damage and wounded. Its readings stay in the QZ17 file.'),
  destroy: t('L’œuf royal de Sous-Récif a brûlé sur sa plate-forme : il ne reste rien de la lignée récifale.', 'The Sous-Récif royal egg burned on its platform: nothing remains of the reef lineage.'),
  rask: t('Le capitaine Rask, sorti du canyon d’Echo Basin, reste joignable : un informateur dans la compagnie.', 'Captain Rask, pulled out of the Echo Basin canyon, can still be reached: an informant inside the company.'),
  researcher: t('Le dernier chercheur de Base Ombelle a témoigné : les registres d’expédition sont complets.', 'The last researcher of Ombelle Base has testified: the shipping registers are complete.'),
  inez: t('Inez Harlow garde le Praetorian vivant : la recherche d’une arme contre les Reines est ouverte.', 'Inez Harlow keeps the live Praetorian: research on a weapon against Queens is open.'),
  bishop: t('BISHOP-9 garde le Praetorian en stase. La compagnie le réclamera.', 'BISHOP-9 keeps the Praetorian in stasis. The company will claim it.'),
  navarre: t('Le Dr Ilse Navarre demande à embarquer : elle veut suivre ce que deviennent ces lignées.', 'Dr Ilse Navarre asks to come aboard: she wants to follow what becomes of these lineages.')
});
export const queensArc1DebriefDueV188 = save => queensArc1CompleteV188(save) && !queensStateV188(save).scenesSeen.includes('arc1-debrief');
export function queensArc1DebriefV188(save, language = 'fr') {
  const lang = L(language), state = queensStateV188(save);
  const lines = [DEBRIEF.base[lang]];
  if (state.raskEgg) lines.push(DEBRIEF[state.raskEgg][lang]);
  if (state.done.includes('queens-a-navarre')) lines.push(DEBRIEF.navarre[lang]);
  return Object.freeze({ slot: 'queens-debrief', title: DEBRIEF.title[lang], text: lines.join('\n') });
}
export function queensArc2DebriefV188(save, language = 'fr') {
  const lang = L(language), state = queensStateV188(save);
  const lines = [DEBRIEF2.base[lang]];
  if (state.done.includes('queens-a-rask')) lines.push(DEBRIEF2.rask[lang]);
  if (state.raskEgg === 'seize') lines.push(DEBRIEF2.seize[lang]);
  if (state.done.includes('queens-a-sorensen')) lines.push(DEBRIEF2.ridge[lang]);
  if (state.done.includes('queens-a-grue')) lines.push(DEBRIEF2.sensors[lang]);
  return Object.freeze({ slot: 'queens-debrief', title: DEBRIEF2.title[lang], text: lines.join('\n') });
}
/** The single ending of the campaign, nuanced by every choice (§14.8). */
export function queensCampaignDebriefV188(save, language = 'fr') {
  const lang = L(language), state = queensStateV188(save);
  const lines = [ENDING.base[lang]];
  if (state.raskEgg === 'release') lines.push(ENDING.release[lang]);
  if (state.raskEgg === 'destroy') lines.push(ENDING.destroy[lang]);
  if (state.raskEgg === 'seize') lines.push((state.eggCrisis?.outcome === 'extracted' ? ENDING.seizeExtracted : ENDING.seizeNeutralised)[lang]);
  if (state.done.includes('queens-a-rask')) lines.push(ENDING.rask[lang]);
  if (state.done.includes('queens-a-ombelle')) lines.push(ENDING.researcher[lang]);
  if (state.specimen) lines.push(ENDING[state.specimen][lang]);
  if (state.done.includes('queens-a-navarre')) lines.push(ENDING.navarre[lang]);
  return Object.freeze({ slot: 'queens-debrief', title: ENDING.title[lang], text: lines.join('\n') });
}
/** The debrief waiting at the briefing table ('arc1-debrief', 'arc2-debrief', 'campaign-debrief') or null. */
export function queensDebriefDueV188(save) {
  const state = queensStateV188(save), unseen = id => !state.scenesSeen.includes(id);
  if (queensArc1CompleteState(state) && unseen('arc1-debrief')) return 'arc1-debrief';
  if (arcCompleteState(state, ARCS[1]) && unseen('arc2-debrief')) return 'arc2-debrief';
  // The ending waits for every open decision and for the crisis aboard.
  if (arcCompleteState(state, ARCS[2]) && unseen('campaign-debrief') && !queensSpecimenChoicePendingV188(save) && !eggCrisisPendingState(state)) return 'campaign-debrief';
  return null;
}
export function queensDebriefV188(save, debriefId, language = 'fr') {
  return debriefId === 'arc1-debrief' ? queensArc1DebriefV188(save, language) : debriefId === 'arc2-debrief' ? queensArc2DebriefV188(save, language)
    : debriefId === 'campaign-debrief' ? queensCampaignDebriefV188(save, language) : null;
}

// —— Bestiary of the adaptations (§14.9 `ship-q-harlow`, §14.10): texts from §14.3 ——
const BESTIARY = Object.freeze([
  Object.freeze({ key: 'reef', arc: 1, name: t('Lignée récifale · Nacre-7', 'Reef lineage · Nacre-7'),
    text: t('Respiration en eau froide, carapace lisse, chasse sous la surface. Nids dans les coques immergées ; les œufs sont fixés comme des coraux. Castes relevées : Drone, Lurker, Runner.',
      'Cold-water breathing, smooth carapace, hunts below the surface. Nests in sunken hulls; the eggs are fixed like coral. Castes recorded: Drone, Lurker, Runner.') }),
  Object.freeze({ key: 'burrower', arc: 2, name: t('Lignée fouisseuse · Echo Basin', 'Burrowing lineage · Echo Basin'),
    text: t('Creuse la roche tendre, attaque par le sol. Galeries qui s’ouvrent sous les pieds ; le détecteur de mouvement est trompé par l’écho des canyons. Castes relevées : Drone, Crusher, Burster.',
      'Digs the soft rock, attacks through the ground. Galleries open underfoot; the motion tracker is fooled by the canyon echo. Castes recorded: Drone, Crusher, Burster.') }),
  Object.freeze({ key: 'aerial', arc: 2, name: t('Lignée aérienne · falaises d’Echo Basin', 'Aerial lineage · Echo Basin cliffs'),
    text: t('Membranes de planage, nids en hauteur. Attaques en piqué ; nids accrochés sous les surplombs. Castes relevées : Runner, Spitter, Reine volante.',
      'Gliding membranes, nests up high. Diving attacks; nests hung under the overhangs. Castes recorded: Runner, Spitter, flying Queen.') }),
  Object.freeze({ key: 'mother', arc: 3, name: t('Lignée Mère · Red Hive, TR-0', 'Mother lineage · Red Hive, TR-0'),
    text: t('Ruche qui a colonisé une biosphère entière. Surface vivante, organes, Chœurs. Castes relevées : Praetorian, Reine, Reine-Mère.',
      'A hive that colonised an entire biosphere. Living surface, organs, Choirs. Castes recorded: Praetorian, Queen, Queen Mother.') })
]);
/** The entries Inez has classified: needs her quest done (`unlocked`), one entry per lineage whose arc is complete. */
export function queensBestiaryV188(save, language = 'fr', { unlocked = false } = {}) {
  const lang = L(language), state = queensStateV188(save);
  if (!unlocked) return Object.freeze([]);
  return Object.freeze(BESTIARY.filter(entry => arcCompleteState(state, ARCS[entry.arc - 1])).map(entry => Object.freeze({ key: entry.key, name: entry.name[lang], text: entry.text[lang] })));
}

// —— Briefing-table panel ——
const PANEL = Object.freeze({
  heading: t('CAMPAGNE ANNEXE · LA SAISON DES REINES', 'SIDE CAMPAIGN · THE SEASON OF QUEENS'),
  locked: t('Hors d’atteinte', 'Out of reach'), call: t('Appel reçu', 'Call received'), accepted: t('Réquisition acceptée', 'Requisition accepted'),
  complete: t('Campagne terminée', 'Campaign complete'),
  side: t('Annexes', 'Side missions'), contracts: t('Contrats locaux accomplis', 'Local contracts done'),
  orbitHere: t('Le Tantalus est en orbite de {world}.', 'The Tantalus is in orbit of {world}.'),
  orbitAway: t('Route : carte galactique, saut vers {world} ({fuel} carburant · {days} jours en hypersommeil).', 'Route: galaxy map, jump to {world} ({fuel} fuel · {days} days in hypersleep).'),
  later: t('ouvre après l’arc précédent', 'opens after the previous arc'),
  arcDone: t('arc terminé', 'arc complete'),
  unknownWorld: t('Arc 3 · origine des lignées : monde inconnu', 'Arc 3 · origin of the lineages: unknown world'),
  egg: Object.freeze({ release: t('Œuf royal laissé à Rask', 'Royal egg left to Rask'), seize: t('Œuf royal saisi', 'Royal egg seized'), destroy: t('Œuf royal détruit', 'Royal egg destroyed') }),
  eggRisk: t('Risque biologique à bord : l’œuf royal est sous scellés au pont de quarantaine.', 'Biological risk aboard: the royal egg is sealed on the quarantine deck.'),
  eggAlert: t('ALERTE : l’œuf a éclos. Rejoignez le pont de quarantaine du Tantalus.', 'ALERT: the egg has hatched. Go to the Tantalus quarantine deck.'),
  eggOver: Object.freeze({ neutralised: t('Crise de l’œuf : créature abattue à bord.', 'Egg crisis: creature put down aboard.'), extracted: t('Crise de l’œuf : pont repris par l’équipage, dégâts à bord.', 'Egg crisis: deck retaken by the crew, damage aboard.') }),
  specimen: Object.freeze({ inez: t('Praetorian vivant confié à Inez', 'Live Praetorian given to Inez'), bishop: t('Praetorian vivant confié à BISHOP-9', 'Live Praetorian given to BISHOP-9') }),
  bestiary: t('Bestiaire des adaptations (Inez Harlow)', 'Bestiary of the adaptations (Inez Harlow)')
});
const WORLD_NAMES = Object.freeze({ [QUEENS_NACRE_WORLD_ID_V188]: 'Nacre-7', [QUEENS_ECHO_WORLD_ID_V188]: 'Echo Basin', [QUEENS_TR0_WORLD_ID_V188]: 'TR-0' });
/**
 * Player-facing summary for the briefing table. `fuel` is the jump cost to Nacre-7 and `fuelByWorld` the
 * cost per arc world (galaxy-jump-v115.js), if known; `bestiaryUnlocked` comes from the crew quest `ship-q-harlow`.
 * The top-level arc fields describe the current arc (the first open arc that is not complete).
 */
export function queensSnapshotV188(save, language = 'fr', { fuel = null, days = 14, fuelByWorld = null, bestiaryUnlocked = false } = {}) {
  const lang = L(language), state = queensStateV188(save);
  const complete = arcCompleteState(state, ARCS[2]);
  const status = !state.phase ? 'locked' : complete ? 'complete' : state.phase;
  const step = id => Object.freeze({ id, label: STEP_LABELS[id] || null, name: CHAPTER_STEP_TITLES[id]?.[lang] || queensCampaignNameV188(id, lang),
    done: state.done.includes(id), lock: state.done.includes(id) ? null : queensLockReasonV188(save, id) });
  const arcView = arc => {
    const open = arcOpenState(state, arc), done = arcCompleteState(state, arc);
    const steps = arc.order.map(step), next = steps.find(entry => !entry.done && !entry.lock) || null, blocked = steps.find(entry => !entry.done && entry.lock) || null;
    const cost = fuelByWorld?.[arc.worldId] ?? (arc.arc === 1 ? fuel : null), world = WORLD_NAMES[arc.worldId];
    return Object.freeze({ arc: arc.arc, worldId: arc.worldId, title: ARC_TITLES[arc.arc][lang], open, complete: done,
      steps: Object.freeze(steps), nextId: next?.id || null, blockedHint: !open || next ? null : blocked ? queensLockTextV188(blocked.lock, lang) : null,
      sides: Object.freeze(arc.sides.map(entry => step(entry.id))),
      contracts: Object.freeze(arc.contracts.map(entry => Object.freeze({ id: entry.id, name: queensCampaignNameV188(entry.id, lang), count: state.contracts[entry.queensContractV188] || 0 }))),
      orbit: open && !done ? (shipWorld(save) === arc.worldId ? fill(PANEL.orbitHere[lang], { world }) : fill(PANEL.orbitAway[lang], { world, fuel: cost ?? '—', days })) : null });
  };
  const arcs = ARCS.map(arcView), opened = arcs.filter(arc => arc.open);
  const current = opened.find(arc => !arc.complete) || opened.at(-1) || arcs[0];
  // An arc that is not open yet is announced by its title only; TR-0 is not named before Arc 2 reveals it.
  const later = arcs.filter(arc => !arc.open).map(arc => `${arc.arc === 3 && !arcCompleteState(state, ARCS[1]) ? PANEL.unknownWorld[lang] : arc.title} — ${PANEL.later[lang]}`);
  const notes = [];
  if (state.raskEgg) notes.push(`RASK · ${PANEL.egg[state.raskEgg][lang]}`);
  if (state.raskEgg === 'seize') notes.push(state.eggCrisis?.phase === 'resolved' ? PANEL.eggOver[state.eggCrisis.outcome][lang] : state.eggCrisis ? PANEL.eggAlert[lang] : PANEL.eggRisk[lang]);
  if (state.specimen) notes.push(PANEL.specimen[state.specimen][lang]);
  return Object.freeze({
    heading: PANEL.heading[lang], status, statusLabel: PANEL[status][lang], hint: !state.phase ? queensLockTextV188('main', lang) : null,
    arcs: Object.freeze(arcs), currentArc: current.arc, doneLabel: PANEL.arcDone[lang],
    arcTitle: current.title, steps: current.steps, nextId: current.nextId, blockedHint: current.blockedHint,
    sides: current.sides, sideLabel: PANEL.side[lang], contracts: current.contracts, contractsLabel: PANEL.contracts[lang], orbit: current.orbit,
    choice: state.raskEgg ? PANEL.egg[state.raskEgg][lang] : null, notes: Object.freeze(notes),
    arc1Complete: queensArc1CompleteState(state), campaignComplete: complete,
    later: Object.freeze(later), callPending: state.phase === 'call',
    bestiaryLabel: PANEL.bestiary[lang], bestiary: queensBestiaryV188(save, lang, { unlocked: bestiaryUnlocked })
  });
}

// —— Travel-message texts of the kind 'campaign' (travel-messages-v188.js reads them) ——
export const QUEENS_MESSAGE_TEXT_V188 = Object.freeze({
  call: Object.freeze({ from: t('Nacre-7 · colonie de Sous-Récif', 'Nacre-7 · Sous-Récif colony'),
    body: t('Appel daté du jour {sent}, reçu {delay} jours plus tard : « Ici Sous-Récif. Les bassins… quelque chose dans les bassins. Nous sommes dans la salle des pompes. » Infestation relevée : {infestation} %.',
      'Call dated day {sent}, received {delay} days later: "Sous-Récif here. The pens… something in the pens. We are in the pump room." Infestation reading: {infestation}%.') }),
  arrival: Object.freeze({ from: t('Nacre-7 · Dr Ilse Navarre', 'Nacre-7 · Dr Ilse Navarre'),
    body: t('Jour {sent}, à l’arrivée du Tantalus : « Si vous m’entendez, posez-vous au quai nord. Ne restez pas près de l’eau. » Infestation aujourd’hui : {nowInfestation} %.',
      'Day {sent}, as the Tantalus arrives: "If you can hear me, land at the north quay. Don’t stay near the water." Infestation today: {nowInfestation}%.') }),
  arrivalEcho: Object.freeze({ from: t('Echo Basin · relais de Gorge-Seize', 'Echo Basin · Gorge-Seize relay'),
    body: t('Jour {sent}, à l’arrivée du Tantalus : « Gorge-Seize à tout vaisseau. Des nids sur les falaises, des bruits dans la roche. Posez-vous sur une tour, pas dans un canyon. » Infestation aujourd’hui : {nowInfestation} %.',
      'Day {sent}, as the Tantalus arrives: "Gorge-Seize to any ship. Nests on the cliffs, noises in the rock. Land on a tower, not in a canyon." Infestation today: {nowInfestation}%.') }),
  arrivalTr0: Object.freeze({ from: t('TR-0 · balise automatique de Base Ombelle', 'TR-0 · Ombelle Base automatic beacon'),
    body: t('Jour {sent}, à l’arrivée du Tantalus : « Base Ombelle. Site fermé. Expéditions suspendues. Ne pas émettre en surface. » Le message tourne en boucle. Infestation aujourd’hui : {nowInfestation} %.',
      'Day {sent}, as the Tantalus arrives: "Ombelle Base. Site closed. Shipments suspended. Do not transmit on the surface." The message loops. Infestation today: {nowInfestation}%.') })
});
export const queensMessageVariantV188 = message => {
  const id = String(message?.id || '');
  return id.startsWith('campaign-queens-arrival-echo-') ? 'arrivalEcho' : id.startsWith('campaign-queens-arrival-tr0-') ? 'arrivalTr0'
    : id.startsWith('campaign-queens-arrival') ? 'arrival' : id.startsWith('campaign-queens-call') ? 'call' : null;
};
/** Shown with the jump's arrival text when the seized egg hatches (the hub alarm follows). */
export const QUEENS_EGG_CRISIS_NOTICE_V188 = t('ALERTE BIOLOGIQUE : le caisson de quarantaine est ouvert.', 'BIOLOGICAL ALERT: the quarantine case is open.');
