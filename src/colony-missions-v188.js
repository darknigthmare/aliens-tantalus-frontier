// V188 — Port-Méridien colony front, missions (bible §6.2, §6.3, §43; owner
// Q25 A: C1 then C5 first; the other missions follow the same pattern).
// Pure data and rules, no DOM. Mission completion is read from
// `galaxy.completedCampaignIds` (single source of truth); the additive save
// field `colonyMissionsV188` only holds what no other record does: which
// missions already paid their colony reward (exactly once), the return scenes
// already shown, the two decisions (C4, « Le prix de Grue »), the contract
// counters and the population brought by quests and annexes.
// C5 « La nuit des murs » is played as the Act V mission `act5-port-walls`
// (bible §5.6 step 7: « la course débouche sur C5 »); its id is kept.
// Ids, titles, givers, objectives and registers come from bible §6.2 and §0.3.
// Locks, sites, rewards and texts marked [PROPOSÉ] are recorded in bible §6.4.
import { normalizeColonyV188, colonyTierV188, COLONY_WORLD_ID_V188, COLONY_STABILITY_PER_LEVEL_V188, COLONY_SITE_IDS_V188 } from './colony-reconstruction-v188.js';

const t = (fr, en) => Object.freeze({ fr, en });
const L = language => language === 'en' ? 'en' : 'fr';
const has = (list, id) => Array.isArray(list) && list.includes(id);
const completed = save => Array.isArray(save?.galaxy?.completedCampaignIds) ? save.galaxy.completedCampaignIds : [];
const TIER_RANK = Object.freeze({ survival: 0, restored: 1, autonomous: 2, free: 3 });

export const COLONY_C5_CAMPAIGN_ID_V188 = 'act5-port-walls';
const base = (id, name, objective, templateId, registerV188, siteV188, summary, description, extra) => Object.freeze({
  id, pairId: null, mode: 'FRONTIER', name, source: 'Tantalus Frontier', worldId: COLONY_WORLD_ID_V188, objective,
  year: 2204, canon: 'project-continuity', routes: 2, templateId, registerV188, colonyFrontV188: true, siteV188,
  summary, description, ...extra
});

// —— Main missions C1-C4 (« Principales », §6.2). C5 is `act5-port-walls`. ——
const main = (id, ...rest) => base(id, ...rest, { colonyMainV188: true });
export const COLONY_MAIN_MISSIONS_V188 = Object.freeze([
  main('colony-c1', 'PORT-MÉRIDIEN · TENIR LE PORT', 'defend the colony', 'colony-multiroute', 'action', 'walls',
    'Le conteneur QZ17-04 s’est ouvert dans l’entrepôt du quai. Contenir la zone, évacuer l’infirmerie de Lucia Ferro, souder les sas.',
    'L’infestation part de l’entrepôt du quai. Tenir les rues du port le temps d’évacuer l’infirmerie de Lucia Ferro, puis souder les sas derrière les derniers civils.'),
  main('colony-c2', 'PORT-MÉRIDIEN · L’AIR DU PORT', 'restore atmospheric processing', 'ship-interior-vertical', 'tension', 'atmosphere',
    'Le processeur atmosphérique tombe : des drones ont niché dans sa chaleur. Descendre avec Jun Park, purger le nid, relancer le processeur.',
    'Descendre dans les niveaux techniques du processeur atmosphérique, Jun Park à la radio. Le nid tient la chaleur des échangeurs : le purger, puis relancer le traitement de l’air.'),
  main('colony-c3', 'PORT-MÉRIDIEN · LE CONVOI DES RESCAPÉS', 'rescue survivors', 'colony-multiroute', 'horror', 'infirmary',
    'Les ouvriers ramenés par le M577 arrivent. L’un d’eux porte un embryon : le repérer sans panique et l’amener à Noor avant l’éclosion.',
    'Contrôle biologique de chaque arrivant, un par un. L’un d’eux porte un embryon. Le trouver sans déclencher de panique et le conduire au bloc de Noor Okafor avant l’éclosion.'),
  main('colony-c4', 'PORT-MÉRIDIEN · LE CULTE DU PORT', 'navigate the vent network', 'colony-multiroute', 'tension', 'habitat',
    'Des colons convertis ouvrent les sas la nuit et livrent des « élus » aux galeries. Enquêter, puis décider de leur sort.',
    'La nuit, des sas s’ouvrent de l’intérieur. Suivre les conduits jusqu’au lieu de réunion des convertis, relever les preuves, puis revenir décider : Marshals, exil ou médiation d’Adèle Sarrazin.')
]);

// —— Side missions (« Annexes », §6.2) ——
const side = (id, giver, ...rest) => base(id, ...rest, { colonySideV188: true, giverV188: giver });
export const COLONY_SIDE_MISSIONS_V188 = Object.freeze([
  side('colony-a-quai', 'Tomas Wren', 'PORT-MÉRIDIEN · CE QUE LE QUAI A VU', 'escort a colony convoy', 'colony-multiroute', 'tension', 'docks',
    'Protéger Tomas Wren pendant qu’il récupère ses carnets de quai. Il témoignera sur les conteneurs QZ17.',
    'Les carnets du contremaître Wren sont restés dans la capitainerie du quai. L’escorter à travers les entrepôts, puis jusqu’au Tantalus, avec les carnets.'),
  side('colony-a-ferro', 'Lucia Ferro', 'PORT-MÉRIDIEN · LES INTOXICATIONS', 'rescue survivors', 'colony-multiroute', 'horror', 'infirmary',
    'Les dossiers de Lucia Ferro parlent de « malaises » après des nuits au quai. Retrouver les patients sortis de l’infirmerie.',
    'Suivre la liste de sortie de l’infirmerie, logement par logement. Les patients ne sont pas rentrés chez eux.'),
  side('colony-a-abri', 'Adèle Sarrazin', 'PORT-MÉRIDIEN · L’ABRI DU PROCESSEUR', 'escort a colony convoy', 'colony-multiroute', 'tension', 'habitat',
    'Escorter les familles vers l’abri pressurisé pendant une alerte. Pas d’arme lourde dans les zones civiles.',
    'L’alerte sonne dans les quartiers familiaux. Conduire les familles jusqu’à l’abri pressurisé du processeur, sans arme lourde au milieu des civils.'),
  side('colony-a-seegson', 'Jun Park', 'PORT-MÉRIDIEN · PIÈCES SEEGSON', 'recover a synthetic', 'colony-multiroute', 'tension', 'power',
    'Récupérer du matériel Seegson dans un entrepôt abandonné ; un synthétique de service y est bloqué sur une ancienne consigne.',
    'L’entrepôt Seegson du port est fermé depuis la quarantaine. Récupérer les pièces de générateur et ramener le synthétique de service qui garde encore la porte.'),
  side('colony-a-balise', 'Rook', 'PORT-MÉRIDIEN · LA BALISE DU HAMEAU', 'recover black-box data', 'planet-exterior', 'horror', 'comms',
    'Rétablir une balise de colonie isolée pour retrouver les fermes éloignées.',
    'La balise du hameau ne répond plus. Rejoindre le mât sous la pluie, relever son enregistreur et relancer l’émission vers les fermes.'),
  side('colony-a-crucible', 'Grue', 'PORT-MÉRIDIEN · LE PRIX DE GRUE', 'board a drifting vessel', 'ship-interior-vertical', 'calm', 'docks',
    'Les récupérateurs de Grue proposent des alliages contre un accès au quai. Monter à bord, écouter l’offre.',
    'La navette de Grue s’est posée au bout du quai. Traverser ses soutes jusqu’à Grue ; la réponse se donne ensuite à la table de Port-Méridien.'),
  side('colony-a-converti', 'Un colon', 'PORT-MÉRIDIEN · MON FRÈRE EST PARTI', 'navigate the vent network', 'colony-multiroute', 'horror', 'habitat',
    'Retrouver un jeune converti avant qu’il ne descende dans les galeries. Change l’issue du « Culte du port ».',
    'Un colon a vu son frère partir avec les convertis. Le suivre dans les conduits et le ramener avant les galeries.')
]);

// —— Local contracts (« Locales (rejouables) », §6.2). Ids are new; each one repeats. ——
const contract = (id, key, name, objective, templateId, register, site, summary, description, extra = {}) =>
  base(id, name, objective, templateId, register, site, summary, description, { colonyContractV188: key, replayableV188: true, ...extra });
export const COLONY_CONTRACTS_V188 = Object.freeze([
  contract('colony-l-reservoir', 'reservoir', 'PORT-MÉRIDIEN · PURGE DU RÉSERVOIR', 'purge a reactor nest', 'colony-multiroute', 'action', 'power',
    'Purger le nid installé près du réservoir et du réacteur du port. Infestation −, chantier Énergie.', 'Un nid s’est formé dans la chaleur du réservoir, contre le réacteur du port. Le purger.', { defensiveV188: true, infestationV188: -3 }),
  contract('colony-l-moissonneurs', 'harvesters', 'PORT-MÉRIDIEN · ESCORTE DES MOISSONNEURS', 'escort a colony convoy', 'planet-exterior', 'tension', 'habitat',
    'Escorter les moissonneurs jusqu’aux serres extérieures et retour. Population +, chantier Habitat.', 'Les moissonneurs sortent vers les serres extérieures. Les escorter à l’aller et au retour.', { populationV188: 1 }),
  contract('colony-l-murs', 'walls', 'PORT-MÉRIDIEN · RONDE DES MURS', 'defend the colony', 'colony-multiroute', 'action', 'walls',
    'Faire la ronde des murs et repousser ce qui gratte aux sas. Chantier Murs et sas.', 'La nuit, quelque chose gratte aux sas du mur nord. Faire la ronde et tenir.', { defensiveV188: true }),
  contract('colony-l-filtres', 'filters', 'PORT-MÉRIDIEN · FILTRES DU PROCESSEUR', 'restore atmospheric processing', 'ship-interior-vertical', 'tension', 'atmosphere',
    'Changer les filtres du processeur atmosphérique. Chantier Processeur.', 'Les filtres du processeur saturent. Descendre les changer, secteur par secteur.'),
  contract('colony-l-peripherie', 'outskirts', 'PORT-MÉRIDIEN · RÉCUPÉRATION EN PÉRIPHÉRIE', 'recover black-box data', 'planet-exterior', 'tension', 'comms',
    'Récupérer les boîtes noires des relais de périphérie. Alliage, crédits, chantier Communications.', 'Les relais de périphérie ont gardé leurs boîtes noires. Les récupérer avant la nuit.', { resourcesV188: Object.freeze({ credits: 120, alloy: 12 }) }),
  contract('colony-l-disparus', 'missing', 'PORT-MÉRIDIEN · RECHERCHE DE DISPARUS', 'rescue survivors', 'colony-multiroute', 'horror', 'infirmary',
    'Chercher les colons disparus et les ramener à l’infirmerie. Population +, chantier Infirmerie.', 'Des colons ne sont pas rentrés. Les chercher dans les quartiers fermés et les ramener à l’infirmerie.', { populationV188: 1 }),
  contract('colony-l-chargeur', 'loader', 'PORT-MÉRIDIEN · CHARGEUR BLOQUÉ', 'secure the power loader', 'colony-multiroute', 'tension', 'docks',
    'Dégager un chargeur bloqué sur le quai. Chantier Quais.', 'Un chargeur est resté bloqué au milieu du quai. Le dégager et le ramener au dépôt.'),
  contract('colony-l-ouverture', 'breach', 'PORT-MÉRIDIEN · SCELLER UNE OUVERTURE', 'seal the hive', 'colony-multiroute', 'action', 'walls',
    'Sceller une ouverture de la ruche sous le port. Infestation −, chantier Murs et sas.', 'Une ouverture de la ruche s’est creusée sous un entrepôt. La sceller.', { defensiveV188: true, infestationV188: -3 })
]);

export const COLONY_CAMPAIGNS_V188 = Object.freeze([...COLONY_MAIN_MISSIONS_V188, ...COLONY_SIDE_MISSIONS_V188, ...COLONY_CONTRACTS_V188]);
export const COLONY_CAMPAIGN_IDS_V188 = Object.freeze(COLONY_CAMPAIGNS_V188.map(entry => entry.id));
export const COLONY_CONTRACT_KEYS_V188 = Object.freeze(COLONY_CONTRACTS_V188.map(entry => entry.colonyContractV188));
const BY_ID = new Map(COLONY_CAMPAIGNS_V188.map(entry => [entry.id, entry]));
export const getColonyCampaignV188 = id => BY_ID.get(id) || null;
export const isColonyCampaignV188 = campaign => BY_ID.has(typeof campaign === 'string' ? campaign : campaign?.id);
/** The missions that validate a site level (colony missions and C5). */
export const isColonyLocalMissionV188 = id => isColonyCampaignV188(id) || id === COLONY_C5_CAMPAIGN_ID_V188;

export const COLONY_NAMES_EN_V188 = Object.freeze({
  'colony-c1': 'PORT-MÉRIDIEN · HOLD THE PORT', 'colony-c2': 'PORT-MÉRIDIEN · THE PORT’S AIR',
  'colony-c3': 'PORT-MÉRIDIEN · THE SURVIVORS’ CONVOY', 'colony-c4': 'PORT-MÉRIDIEN · THE PORT CULT',
  'colony-a-quai': 'PORT-MÉRIDIEN · WHAT THE QUAY SAW', 'colony-a-ferro': 'PORT-MÉRIDIEN · THE POISONINGS',
  'colony-a-abri': 'PORT-MÉRIDIEN · THE PROCESSOR SHELTER', 'colony-a-seegson': 'PORT-MÉRIDIEN · SEEGSON PARTS',
  'colony-a-balise': 'PORT-MÉRIDIEN · THE HAMLET BEACON', 'colony-a-crucible': 'PORT-MÉRIDIEN · GRUE’S PRICE',
  'colony-a-converti': 'PORT-MÉRIDIEN · MY BROTHER IS GONE',
  'colony-l-reservoir': 'PORT-MÉRIDIEN · RESERVOIR PURGE', 'colony-l-moissonneurs': 'PORT-MÉRIDIEN · HARVESTER ESCORT',
  'colony-l-murs': 'PORT-MÉRIDIEN · WALL ROUND', 'colony-l-filtres': 'PORT-MÉRIDIEN · PROCESSOR FILTERS',
  'colony-l-peripherie': 'PORT-MÉRIDIEN · OUTSKIRTS SALVAGE', 'colony-l-disparus': 'PORT-MÉRIDIEN · SEARCH FOR THE MISSING',
  'colony-l-chargeur': 'PORT-MÉRIDIEN · STUCK LOADER', 'colony-l-ouverture': 'PORT-MÉRIDIEN · SEAL AN OPENING',
  [COLONY_C5_CAMPAIGN_ID_V188]: 'C5 · THE NIGHT OF THE WALLS'
});
export const COLONY_C5_NAME_V188 = t('C5 · LA NUIT DES MURS', 'C5 · THE NIGHT OF THE WALLS');
export const colonyCampaignNameV188 = (id, language = 'fr') => id === COLONY_C5_CAMPAIGN_ID_V188 ? COLONY_C5_NAME_V188[L(language)]
  : L(language) === 'en' ? COLONY_NAMES_EN_V188[id] || id : getColonyCampaignV188(id)?.name || id;

// —— Save field `colonyMissionsV188` ——
const RECORD_IDS = Object.freeze([...COLONY_CAMPAIGN_IDS_V188.filter(id => !getColonyCampaignV188(id).replayableV188), COLONY_C5_CAMPAIGN_ID_V188]);
export const COLONY_C4_CHOICES_V188 = Object.freeze(['marshals', 'exile', 'mediation']);
export const COLONY_GRUE_CHOICES_V188 = Object.freeze(['accept', 'refuse']);
export const COLONY_POPULATION_MAX_V188 = 12;
export function createColonyMissionsV188() { return { schema: 188, rewarded: [], scenesSeen: [], c4: null, grue: null, contracts: {}, population: 0 }; }
export function normalizeColonyMissionsV188(raw) {
  const state = createColonyMissionsV188();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return state;
  const ids = list => Array.isArray(list) ? [...new Set(list.filter(id => RECORD_IDS.includes(id)))] : [];
  state.rewarded = ids(raw.rewarded); state.scenesSeen = ids(raw.scenesSeen).filter(id => state.rewarded.includes(id));
  state.c4 = COLONY_C4_CHOICES_V188.includes(raw.c4) ? raw.c4 : null;
  state.grue = COLONY_GRUE_CHOICES_V188.includes(raw.grue) ? raw.grue : null;
  for (const key of COLONY_CONTRACT_KEYS_V188) {
    const value = Math.floor(Number(raw.contracts?.[key]));
    if (Number.isFinite(value) && value > 0) state.contracts[key] = Math.min(99, value);
  }
  const population = Math.floor(Number(raw.population));
  state.population = Number.isFinite(population) ? Math.max(0, Math.min(COLONY_POPULATION_MAX_V188, population)) : 0;
  return state;
}
const stateOf = save => normalizeColonyMissionsV188(save?.colonyMissionsV188);
function write(save, mutate) {
  const state = stateOf(save), result = mutate(state);
  if (result === false) return false;
  save.colonyMissionsV188 = normalizeColonyMissionsV188(state);
  return result ?? true;
}
/** People added by quests, annexes and contracts (used by the active-site limit, not by the Act V roll call). */
export const colonyPopulationBonusV188 = save => stateOf(save).population;
export function addColonyPopulationV188(save, amount) {
  if (!save || !(amount > 0)) return 0;
  let added = 0;
  write(save, state => { const before = state.population; state.population = Math.min(COLONY_POPULATION_MAX_V188, before + amount); added = state.population - before; });
  return added;
}
export const colonyMissionRewardedV188 = (save, id) => stateOf(save).rewarded.includes(id);
export const colonyContractCountV188 = (save, key) => stateOf(save).contracts[key] || 0;
/** Q25 A: once C1 is done, only a local mission validates a site level (bible §6.3). */
export const colonyLocalValidationV188 = save => has(completed(save), 'colony-c1');
/** Wren's testimony, piece 7 of the QZ17 file (bible §5.7, §6.2). */
export const wrenTestimonyRecoveredV188 = save => has(completed(save), 'colony-a-quai');

// —— Access ——
const tierRank = save => TIER_RANK[colonyTierV188(save?.colonyV188)] ?? 0;
const MAIN_LOCKS = Object.freeze({
  'colony-c1': Object.freeze({ act: 'special-narrative-qz17', previous: null }),
  'colony-c2': Object.freeze({ act: 'special-archive-relay', previous: 'colony-c1' }),
  'colony-c3': Object.freeze({ act: 'special-apc-convoy', previous: 'colony-c2' }),
  'colony-c4': Object.freeze({ act: 'special-black-cocoon', previous: 'colony-c3' })
});
/**
 * Why a colony mission cannot be launched yet, or null.
 * [PROPOSÉ] C1-C4 follow the acts of §6.2 and each other; the annexes open at the
 * « Rétablie » tier (§6.3), except Wren's (after C1: the container opened on his
 * quay) and « Mon frère est parti » (between C3 and C4, it changes C4); in the
 * « Survie » tier only the defensive contracts are offered (§6.3 « Paliers »).
 */
export function colonyLockReasonV188(save, campaignId) {
  const campaign = getColonyCampaignV188(campaignId);
  if (!campaign) return null;
  const done = completed(save);
  if (campaign.colonyMainV188) {
    const lock = MAIN_LOCKS[campaignId];
    if (!done.includes(lock.act)) return `act:${lock.act}`;
    if (lock.previous && !done.includes(lock.previous)) return 'previous';
    return null;
  }
  if (!done.includes('colony-c1')) return 'c1';
  if (campaign.colonySideV188) {
    if (campaignId === 'colony-a-quai') return null;
    if (campaignId === 'colony-a-converti') {
      if (done.includes('colony-a-converti')) return null;
      if (done.includes('colony-c4')) return 'too-late';
      if (!done.includes('colony-c3')) return 'c3';
      return null;
    }
    return tierRank(save) >= 1 ? null : 'tier';
  }
  return campaign.defensiveV188 || tierRank(save) >= 1 ? null : 'defensive';
}
export function filterColonyCampaignsV188(save, campaigns) {
  const active = save?.strategy?.currentOperation?.campaignId;
  return campaigns.filter(campaign => campaign.id === active || !isColonyCampaignV188(campaign) || colonyLockReasonV188(save, campaign.id) === null);
}
const ACT_NAMES = Object.freeze({
  'special-narrative-qz17': t('l’Acte I (QZ-17)', 'Act I (QZ-17)'), 'special-archive-relay': t('l’Acte II (QZ-18)', 'Act II (QZ-18)'),
  'special-apc-convoy': t('le convoi du M577 (Acte III)', 'the M577 convoy (Act III)'), 'special-black-cocoon': t('l’Acte IV (Cocon noir)', 'Act IV (Black Cocoon)')
});
const LOCK_TEXT = Object.freeze({
  previous: t('Terminez d’abord la mission précédente de Port-Méridien.', 'Finish the previous Port-Méridien mission first.'),
  c1: t('Ouvre après « Tenir le port » (C1).', 'Opens after "Hold the Port" (C1).'),
  c3: t('Ouvre après « Le convoi des rescapés » (C3).', 'Opens after "The Survivors’ Convoy" (C3).'),
  'too-late': t('Trop tard : le culte du port a déjà été jugé.', 'Too late: the port cult has already been judged.'),
  tier: t('Ouvre quand Port-Méridien est « Rétablie » (3 chantiers au niveau 1).', 'Opens once Port-Méridien is "Restored" (3 sites at level 1).'),
  defensive: t('En « Survie », seuls les contrats défensifs sont proposés.', 'In "Survival", only defensive contracts are offered.')
});
export function colonyLockTextV188(reason, language = 'fr') {
  const lang = L(language);
  if (typeof reason === 'string' && reason.startsWith('act:')) {
    const act = ACT_NAMES[reason.slice(4)];
    return lang === 'en' ? `Opens after ${act?.en || reason.slice(4)}.` : `Ouvre après ${act?.fr || reason.slice(4)}.`;
  }
  return LOCK_TEXT[reason]?.[lang] || '';
}

// —— Rewards (applied once per mission, on the candidate save, in finalizeOperation) ——
const adjustWorld = (save, { stability = 0, infestation = 0, quarantine = 0 } = {}) => {
  const world = save?.galaxy?.worldState?.[COLONY_WORLD_ID_V188];
  if (!world) return;
  if (stability && Number.isFinite(world.stability)) world.stability = Math.max(0, Math.min(100, world.stability + stability));
  if (infestation && Number.isFinite(world.infestation)) world.infestation = Math.max(0, Math.min(100, world.infestation + infestation));
  if (quarantine && Number.isFinite(world.quarantine)) world.quarantine = Math.max(0, Math.min(100, world.quarantine + quarantine));
};
const addResources = (save, resources) => {
  if (!resources || !save?.galaxy?.resources) return;
  for (const [key, value] of Object.entries(resources)) save.galaxy.resources[key] = Math.round(((Number(save.galaxy.resources[key]) || 0) + value) * 100) / 100;
};
/** Validates the site's pending level; with `build`, a site with nothing pending gains (and validates) its next level. */
export function advanceColonySiteV188(save, siteId, { build = false } = {}) {
  if (!COLONY_SITE_IDS_V188.includes(siteId) || !save) return null;
  const colony = normalizeColonyV188(save.colonyV188), site = colony.sites[siteId];
  if (site.invested > site.validated) site.validated += 1;
  else if (build && site.invested < 3) { site.invested += 1; site.validated += 1; }
  else return null;
  save.colonyV188 = colony;
  adjustWorld(save, { stability: COLONY_STABILITY_PER_LEVEL_V188 });
  return Object.freeze({ site: siteId, level: site.validated });
}
// [PROPOSÉ] once-only rewards on top of the site level (bible §6.4).
const ONCE_REWARDS = Object.freeze({
  'colony-c1': Object.freeze({ world: Object.freeze({ infestation: -4 }) }),
  'colony-c2': Object.freeze({ world: Object.freeze({ stability: 2 }) }),
  'colony-c3': Object.freeze({ world: Object.freeze({ quarantine: -3 }) }),
  'colony-c4': Object.freeze({}),
  'colony-a-quai': Object.freeze({}),
  'colony-a-ferro': Object.freeze({ resources: Object.freeze({ research: 4 }) }),
  'colony-a-abri': Object.freeze({ world: Object.freeze({ stability: 4 }) }),
  'colony-a-seegson': Object.freeze({ resources: Object.freeze({ alloy: 30 }) }),
  'colony-a-balise': Object.freeze({ population: 2 }),
  'colony-a-crucible': Object.freeze({}),
  'colony-a-converti': Object.freeze({ population: 1 }),
  [COLONY_C5_CAMPAIGN_ID_V188]: Object.freeze({ world: Object.freeze({ stability: 5 }) })
});

/**
 * Called once per resolved operation (finalizeOperation, on the candidate save).
 * A successful colony mission pays its colony reward once; a contract repeats
 * (validation of its site, its own effect). Returns what changed, or null.
 */
export function applyColonyMissionResultV188(save, { success = false, campaignId = null } = {}) {
  if (!success || !save || !isColonyLocalMissionV188(campaignId)) return null;
  const campaign = getColonyCampaignV188(campaignId);
  if (campaign?.replayableV188) {
    const key = campaign.colonyContractV188;
    write(save, state => { state.contracts[key] = Math.min(99, (state.contracts[key] || 0) + 1); });
    const site = advanceColonySiteV188(save, campaign.siteV188);
    if (campaign.infestationV188) adjustWorld(save, { infestation: campaign.infestationV188 });
    if (campaign.resourcesV188) addResources(save, campaign.resourcesV188);
    const population = campaign.populationV188 ? addColonyPopulationV188(save, campaign.populationV188) : 0;
    return Object.freeze({ kind: 'contract', campaignId, key, site, population });
  }
  if (colonyMissionRewardedV188(save, campaignId)) return Object.freeze({ kind: 'replay', campaignId });
  write(save, state => { state.rewarded.push(campaignId); });
  const siteId = campaignId === COLONY_C5_CAMPAIGN_ID_V188 ? 'walls' : campaign.siteV188;
  const site = advanceColonySiteV188(save, siteId, { build: Boolean(campaign?.colonyMainV188) });
  const reward = ONCE_REWARDS[campaignId] || {};
  if (reward.world) adjustWorld(save, reward.world);
  if (reward.resources) addResources(save, reward.resources);
  const population = reward.population ? addColonyPopulationV188(save, reward.population) : 0;
  return Object.freeze({ kind: 'reward', campaignId, site, population });
}

// —— C5 « La nuit des murs »: the walls set the difficulty (§6.2), once per launch ——
export function colonyWallsLevelV188(save) { return normalizeColonyV188(save?.colonyV188).sites.walls.validated; }
/** [PROPOSÉ] Sas soudés +40 munitions ; mur nord : blindage 60 ; tourelles sentinelles : +80 munitions. */
export function colonyC5LaunchBonusV188(level) {
  const value = Math.max(0, Math.min(3, Math.floor(Number(level) || 0)));
  return Object.freeze({ level: value, ammo: (value >= 1 ? 40 : 0) + (value >= 3 ? 80 : 0), armour: value >= 2 ? 60 : 0 });
}
export function applyColonyC5LaunchV188(save, campaignId) {
  if (campaignId !== COLONY_C5_CAMPAIGN_ID_V188 || !save?.player) return null;
  const bonus = colonyC5LaunchBonusV188(colonyWallsLevelV188(save));
  if (!bonus.ammo && !bonus.armour) return bonus;
  if (bonus.ammo && save.player.ammo && typeof save.player.ammo === 'object') save.player.ammo.primary = (Number(save.player.ammo.primary) || 0) + bonus.ammo;
  if (bonus.armour) save.player.armor = Math.max(Number(save.player.armor) || 0, bonus.armour);
  return bonus;
}

// —— Decisions: C4 (§6.2) and « Le prix de Grue » ——
export const colonyC4DecisionPendingV188 = save => has(completed(save), 'colony-c4') && !stateOf(save).c4;
export const colonyGrueDecisionPendingV188 = save => has(completed(save), 'colony-a-crucible') && !stateOf(save).grue;
/** [PROPOSÉ] effects; the mediation needs the brother brought back (« Mon frère est parti » changes C4). */
export const COLONY_C4_EFFECTS_V188 = Object.freeze({
  marshals: Object.freeze({ world: Object.freeze({ stability: 4, quarantine: 2 }), population: 0 }),
  exile: Object.freeze({ world: Object.freeze({ stability: 2, infestation: 3 }), population: 0 }),
  mediation: Object.freeze({ world: Object.freeze({ stability: 6 }), population: 2 })
});
export const COLONY_GRUE_EFFECTS_V188 = Object.freeze({
  accept: Object.freeze({ resources: Object.freeze({ alloy: 60 }), world: Object.freeze({ stability: -2 }) }),
  refuse: Object.freeze({ resources: null, world: Object.freeze({ stability: 2 }) })
});
export function colonyC4OptionsV188(save) {
  return COLONY_C4_CHOICES_V188.filter(choice => choice !== 'mediation' || has(completed(save), 'colony-a-converti'));
}
/** Mutates the candidate save once. Returns the effect or null. */
export function chooseColonyC4V188(save, choice) {
  if (!colonyC4DecisionPendingV188(save) || !colonyC4OptionsV188(save).includes(choice)) return null;
  write(save, state => { state.c4 = choice; });
  const effect = COLONY_C4_EFFECTS_V188[choice];
  adjustWorld(save, effect.world);
  if (effect.population) addColonyPopulationV188(save, effect.population);
  return effect;
}
export function chooseColonyGrueV188(save, choice) {
  if (!colonyGrueDecisionPendingV188(save) || !COLONY_GRUE_CHOICES_V188.includes(choice)) return null;
  write(save, state => { state.grue = choice; });
  const effect = COLONY_GRUE_EFFECTS_V188[choice];
  adjustWorld(save, effect.world); addResources(save, effect.resources);
  return effect;
}

// —— Return scenes (shown once at the briefing table, after the reward) ——
export const COLONY_SCENES_V188 = Object.freeze({
  'colony-c1': Object.freeze({ slot: 'colony-quay-warehouse', title: t('Port-Méridien · les sas soudés', 'Port-Méridien · the welded airlocks'),
    text: t('Les sas de l’entrepôt sont soudés ; l’infirmerie de Lucia Ferro est passée derrière le mur. Dans l’entrepôt scellé reste le conteneur QZ17-04, ouvert de l’intérieur. Tomas Wren demande à parler à Echo-9 : il a tenu des carnets sur chaque conteneur arrivé au quai. Les sites de la colonie ne seront plus validés que par des missions locales.',
      'The warehouse airlocks are welded; Lucia Ferro’s infirmary is behind the wall. Inside the sealed warehouse stands container QZ17-04, opened from the inside. Tomas Wren asks to speak to Echo-9: he kept notebooks on every container that reached the quay. Colony sites will now only be validated by local missions.') }),
  'colony-c2': Object.freeze({ slot: 'colony-processor', title: t('Port-Méridien · le processeur relancé', 'Port-Méridien · the processor restarted'),
    text: t('Le processeur reprend son souffle. Jun Park reste longtemps assis au pied de l’échangeur, casque ouvert. Asha Mbaye ouvre la table de reconstruction aux référents de la colonie.',
      'The processor breathes again. Jun Park sits for a long time at the foot of the exchanger, helmet open. Asha Mbaye opens the reconstruction table to the colony’s leads.') }),
  'colony-c3': Object.freeze({ slot: 'colony-screening', title: t('Port-Méridien · le contrôle biologique', 'Port-Méridien · the biological screening'),
    text: t('L’ouvrier est sur la table de Noor Okafor avant l’éclosion. Personne dans la file n’a compris pourquoi on l’avait fait passer devant. Noor demande un vrai bloc d’isolement.',
      'The worker is on Noor Okafor’s table before the hatching. Nobody in the queue understood why he was taken ahead. Noor asks for a real isolation theatre.') }),
  'colony-c4': Object.freeze({ slot: 'colony-cult', title: t('Port-Méridien · les convertis', 'Port-Méridien · the converts'),
    text: t('Les preuves sont sur la table : les sas ouverts de l’intérieur, la liste des « élus », la route vers les galeries. Adèle Sarrazin attend une décision.',
      'The evidence is on the table: airlocks opened from the inside, the list of the "chosen", the route to the galleries. Adèle Sarrazin awaits a decision.') }),
  'colony-a-quai': Object.freeze({ slot: 'wren-notebooks', title: t('Témoignage de Tomas Wren', 'Tomas Wren’s testimony'),
    text: t('Wren pose ses carnets sur la table. « Chaque conteneur QZ17 arrivait avec deux bordereaux. Celui du quai disait “matériel de forage”. L’autre, sous scellé, je n’avais pas le droit de l’ouvrir. Les nuits où ils arrivaient, le relais du port passait en priorité fret. J’ai noté les heures. » Le témoignage est versé au dossier QZ17.',
      'Wren lays his notebooks on the table. "Every QZ17 container came with two waybills. The quay one said ‘drilling equipment’. The other, under seal, I wasn’t allowed to open. On the nights they arrived, the port relay switched to freight priority. I wrote down the times." The testimony goes into the QZ17 file.') }),
  'colony-a-ferro': Object.freeze({ slot: 'colony-screening', title: t('Les intoxications', 'The poisonings'),
    text: t('Les « malaises » de Lucia Ferro avaient tous une cicatrice au même endroit. Les patients retrouvés passent au contrôle biologique. Ses dossiers rejoignent ceux de l’infirmerie.',
      'Lucia Ferro’s "fainting spells" all had a scar in the same place. The patients found go through biological screening. Her files join the infirmary’s.') }),
  'colony-a-abri': Object.freeze({ slot: 'colony-processor', title: t('L’abri du processeur', 'The processor shelter'),
    text: t('Les familles ont passé l’alerte dans l’abri pressurisé, sans un tir dans les rues. Adèle note les noms à l’entrée et à la sortie : ce sont les mêmes.',
      'The families waited out the alert in the pressurised shelter, without a shot in the streets. Adèle writes the names at the entrance and at the exit: they are the same.') }),
  'colony-a-seegson': Object.freeze({ slot: 'colony-quay-warehouse', title: t('Pièces Seegson', 'Seegson parts'),
    text: t('Le synthétique de service répète sa consigne : « Entrepôt fermé jusqu’à inventaire. » Jun Park fait l’inventaire avec lui. Les pièces de générateur partent au chantier Énergie.',
      'The service synthetic repeats its order: "Warehouse closed until inventory." Jun Park does the inventory with it. The generator parts go to the Power site.') }),
  'colony-a-balise': Object.freeze({ slot: 'colony-beacon', title: t('La balise du hameau', 'The hamlet beacon'),
    text: t('La balise émet de nouveau. Deux fermes répondent dans la nuit ; leurs familles descendront au port.',
      'The beacon is transmitting again. Two farms answer in the night; their families will come down to the port.') }),
  'colony-a-crucible': Object.freeze({ slot: 'colony-quay-warehouse', title: t('Le prix de Grue', 'Grue’s price'),
    text: t('Grue : « Soixante unités d’alliage, et mes gars gardent le bout du quai. Personne ne regarde ce qu’on décharge. » La réponse se donne ici.',
      'Grue: "Sixty units of alloy, and my people keep the end of the quay. Nobody looks at what we unload." The answer is given here.') }),
  'colony-a-converti': Object.freeze({ slot: 'colony-cult', title: t('Mon frère est parti', 'My brother is gone'),
    text: t('Le garçon est ramené avant les galeries. Il ne parle pas, mais il connaît les noms des autres. Adèle pourra s’en servir si l’on choisit la médiation.',
      'The boy is brought back before the galleries. He does not speak, but he knows the others’ names. Adèle can use them if mediation is chosen.') }),
  [COLONY_C5_CAMPAIGN_ID_V188]: Object.freeze({ slot: 'colony-walls', title: t('C5 · La nuit des murs', 'C5 · The night of the walls'),
    text: t('Les murs ont tenu jusqu’à l’aube. Sanaa Doyle compte les impacts sur le mur nord ; les sas soudés n’ont pas cédé.',
      'The walls held until dawn. Sanaa Doyle counts the impacts on the north wall; the welded airlocks did not give way.') })
});
export function colonyReturnSceneDueV188(save) {
  const state = stateOf(save);
  return state.rewarded.find(id => !state.scenesSeen.includes(id) && COLONY_SCENES_V188[id]) || null;
}
export function markColonySceneSeenV188(save, id) {
  if (!COLONY_SCENES_V188[id]) return false;
  return write(save, state => { if (!state.rewarded.includes(id) || state.scenesSeen.includes(id)) return false; state.scenesSeen.push(id); });
}
export const COLONY_DECISION_TEXT_V188 = Object.freeze({
  c4: Object.freeze({ title: t('Le culte du port · décision', 'The port cult · decision'),
    text: t('Les convertis sont rassemblés au quai. Adèle Sarrazin : « Ce sont nos gens. Ce qu’on décide ce soir, la colonie s’en souviendra. »',
      'The converts are gathered at the quay. Adèle Sarrazin: "They are our people. Whatever we decide tonight, the colony will remember."'),
    options: Object.freeze({ marshals: t('LES REMETTRE AUX MARSHALS', 'HAND THEM TO THE MARSHALS'), exile: t('LES EXILER', 'EXILE THEM'), mediation: t('MÉDIATION D’ADÈLE', 'ADÈLE’S MEDIATION') }),
    results: Object.freeze({
      marshals: t('Les Marshals coloniaux emmènent les meneurs. La colonie dort mieux ; la quarantaine se resserre.', 'The Colonial Marshals take the leaders away. The colony sleeps better; the quarantine tightens.'),
      exile: t('Les convertis partent vers les hameaux. Certains n’y arriveront pas ; d’autres retrouveront les galeries.', 'The converts leave for the hamlets. Some will not get there; others will find the galleries again.'),
      mediation: t('Adèle parle avec chacun, le garçon ramené à côté d’elle. Deux familles restent et reprennent un quartier.', 'Adèle talks with each of them, the boy who was brought back beside her. Two families stay and take back a quarter.')
    }) }),
  grue: Object.freeze({ title: t('Le prix de Grue · réponse', 'Grue’s price · answer'),
    text: t('Accepter l’offre de Grue, ou la refuser et chercher l’alliage ailleurs.', 'Accept Grue’s offer, or refuse it and look for alloy elsewhere.'),
    options: Object.freeze({ accept: t('ACCEPTER : ALLIAGE CONTRE LE QUAI', 'ACCEPT: ALLOY FOR THE QUAY'), refuse: t('REFUSER', 'REFUSE') }),
    results: Object.freeze({
      accept: t('Soixante unités d’alliage arrivent au dépôt. Le bout du quai appartient à Grue ; les colons le remarquent.', 'Sixty units of alloy reach the depot. The end of the quay belongs to Grue; the colonists notice.'),
      refuse: t('Grue repart sans rancune affichée. La colonie garde son quai.', 'Grue leaves without visible resentment. The colony keeps its quay.')
    }) })
});

// —— Briefing-table snapshot (colony table) ——
export function colonyMissionsSnapshotV188(save, language = 'fr') {
  const lang = L(language), state = stateOf(save), done = completed(save);
  const row = (id, campaign) => {
    const lock = campaign ? colonyLockReasonV188(save, id) : null;
    return Object.freeze({ id, name: colonyCampaignNameV188(id, lang), done: done.includes(id), rewarded: state.rewarded.includes(id),
      lock: done.includes(id) ? null : lock, lockText: !done.includes(id) && lock ? colonyLockTextV188(lock, lang) : null,
      site: id === COLONY_C5_CAMPAIGN_ID_V188 ? 'walls' : campaign?.siteV188 || null, giver: campaign?.giverV188 || null });
  };
  const main = [...COLONY_MAIN_MISSIONS_V188.map(entry => row(entry.id, entry)), row(COLONY_C5_CAMPAIGN_ID_V188, null)];
  const sides = COLONY_SIDE_MISSIONS_V188.map(entry => row(entry.id, entry));
  const contracts = COLONY_CONTRACTS_V188.map(entry => Object.freeze({ ...row(entry.id, entry), count: state.contracts[entry.colonyContractV188] || 0 }));
  return Object.freeze({ main: Object.freeze(main), sides: Object.freeze(sides), contracts: Object.freeze(contracts),
    c4: state.c4, grue: state.grue, population: state.population, localValidation: colonyLocalValidationV188(save),
    wallsBonus: colonyC5LaunchBonusV188(colonyWallsLevelV188(save)), wren: wrenTestimonyRecoveredV188(save) });
}
