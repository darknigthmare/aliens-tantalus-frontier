// V188 — Asphodèle station front, part 2: the station side missions (bible
// §7.2 « Annexes ») and the replayable local contracts (§7.2 « Locales »),
// among them « Relais en dérive », which opens the relay room (§7.3, §42.2).
// Spec: specs/007-hub-asphodele/. Pure data and rules, no DOM, no import:
// `station-asphodele-v188.js` reads these locks for every campaign list, and
// `asphodele-hub-v188.js` reads the contract counters.
// Ids, titles, givers and objectives come from bible §7.2. Locks, registers and
// effects marked [PROPOSÉ] are recorded in bible §7.6.

const t = (fr, en) => Object.freeze({ fr, en });
const has = (list, id) => Array.isArray(list) && list.includes(id);
const completed = save => Array.isArray(save?.galaxy?.completedCampaignIds) ? save.galaxy.completedCampaignIds : [];
const cassiusOf = save => ['rewrite', 'restrain', 'erase'].includes(save?.stationV188?.cassius) ? save.stationV188.cassius : null;

export const ASPHODELE_WORLD_ID_V188 = 'world-05-lethe';
const base = (id, name, objective, registerV188, summary, description, extra) => Object.freeze({
  id, pairId: null, mode: 'FRONTIER', name, source: 'Tantalus Frontier', worldId: ASPHODELE_WORLD_ID_V188, objective,
  year: 2204, canon: 'project-continuity', routes: 2, templateId: 'ship-interior-vertical', registerV188,
  summary, description, ...extra
});

// —— Side missions (« Annexes », §7.2). Objectives are existing ones; the map is [PROPOSÉ]. ——
const side = (id, giver, name, objective, register, summary, description) =>
  base(id, name, objective, register, summary, description, { stationSideV188: true, giverV188: giver });
export const ASPHODELE_SIDE_MISSIONS_V188 = Object.freeze([
  side('station-a-echo8', 'ECHO-A · Tamsin Velez', 'ASPHODÈLE · LA DERNIÈRE RONDE D’ECHO-8', 'recover black-box data', 'horror',
    'Suivre les marques laissées par Echo-8 : barricades, caches de munitions, dernier enregistrement.',
    'Les marques à la craie d’Echo-8 mènent des barricades aux caches de munitions, puis au point où l’équipe a enregistré sa dernière liaison. Ramener l’enregistrement complet.'),
  side('station-a-grue', 'Grue', 'ASPHODÈLE · LE PACTE DE L’ANNEAU', 'board a drifting vessel', 'tension',
    'Les récupérateurs de Grue veulent garder l’anneau extérieur. Monter à bord de leur navette et négocier.',
    'La navette Crucible de Grue est amarrée à l’anneau. Traverser ses soutes, rejoindre Grue et revenir avec une réponse : le pacte se décide ensuite aux quais.'),
  side('station-a-journaux', 'Asha Mbaye', 'ASPHODÈLE · LES JOURNAUX DE L’ÉQUIPAGE', 'navigate the vent network', 'horror',
    'Rassembler les journaux personnels de l’équipage d’Asphodèle, dont ceux de l’administratrice Solène Ivarsson.',
    'Les journaux sont restés dans les cabines et les conduits où l’équipage s’est caché. Les récupérer pour les familles de Port-Méridien.'),
  side('station-a-hydro', 'Jun Park', 'ASPHODÈLE · LA SERRE', 'restore atmospheric processing', 'tension',
    'Remettre en route la serre hydroponique ; elle nourrira la colonie.',
    'Rétablir l’air, l’eau et la lumière de croissance de la serre, baie par baie, avec Jun Park à la radio.'),
  side('station-a-sonde', 'Rook', 'ASPHODÈLE · LA BALISE ROUGE', 'recover black-box data', 'tension',
    'Une balise UPP dérive près de la station. La récupérer sans incident diplomatique.',
    'La balise UPP dérive dans le champ de débris de l’anneau. Récupérer son enregistreur sans l’ouvrir et sans tirer sur ce qui la garde.'),
  side('station-a-cassius', 'Inez Harlow', 'ASPHODÈLE · CE QUE CASSIUS A VU', 'recover black-box data', 'horror',
    'Rejouer les caméras de CASSIUS de la nuit où la quarantaine a été déclenchée.',
    'Les archives vidéo de CASSIUS sont réparties sur les nœuds de la station. Les rassembler et les rejouer avec Inez Harlow.'),
  side('station-a-bishop', 'BISHOP-9', 'ASPHODÈLE · ACCÈS ADMINISTRATEUR', 'destroy a neuro-link relay', 'tension',
    'BISHOP-9 détient un code d’accès compagnie à CASSIUS. Couper la liaison administrateur qu’il protège.',
    'Le code de BISHOP-9 passe par une liaison administrateur cachée dans le moyeu. La couper, puis décider avec lui de ce que devient le code.')
]);
export const ASPHODELE_SIDE_IDS_V188 = Object.freeze(ASPHODELE_SIDE_MISSIONS_V188.map(entry => entry.id));
export const ASPHODELE_SIDE_NAMES_EN_V188 = Object.freeze({
  'station-a-echo8': 'ASPHODÈLE · ECHO-8’S LAST ROUND', 'station-a-grue': 'ASPHODÈLE · THE RING PACT',
  'station-a-journaux': 'ASPHODÈLE · THE CREW LOGS', 'station-a-hydro': 'ASPHODÈLE · THE GREENHOUSE',
  'station-a-sonde': 'ASPHODÈLE · THE RED BEACON', 'station-a-cassius': 'ASPHODÈLE · WHAT CASSIUS SAW',
  'station-a-bishop': 'ASPHODÈLE · ADMINISTRATOR ACCESS'
});

// —— Local contracts (« Locales (rejouables) », §7.2). Ids are new; each one repeats. ——
const contract = (id, key, name, objective, register, summary, description) =>
  base(id, name, objective, register, summary, description, { stationContractV188: key, replayableV188: true });
export const ASPHODELE_CONTRACTS_V188 = Object.freeze([
  contract('station-c-conduits', 'vents', 'CONTRAT · INSPECTION DES CONDUITS', 'navigate the vent network', 'tension',
    'Inspecter les conduits de la station. Sécurité de la station +.', 'Parcourir un secteur de conduits, relever les traces et refermer les grilles forcées.'),
  contract('station-c-relais', 'relay-drift', 'CONTRAT · RELAIS EN DÉRIVE', 'recover black-box data', 'tension',
    'Récupérer la boîte noire d’un relais QZ en dérive. Couverture du réseau +.', 'Un relais du réseau QZ a quitté son orbite. L’aborder, récupérer sa boîte noire et la ramener à la salle des relais d’Asphodèle.'),
  contract('station-c-epave', 'wreck', 'CONTRAT · ÉPAVE À PROXIMITÉ', 'board a drifting vessel', 'horror',
    'Aborder une épave proche de la station. Alliage, carburant.', 'Une épave dérive à portée de la station. L’aborder et ramener ce qui peut servir.'),
  contract('station-c-pression', 'module', 'CONTRAT · REMISE EN PRESSION D’UN MODULE', 'restore atmospheric processing', 'tension',
    'Remettre un module de la station en pression.', 'Un module de la station est encore à l’air libre. Rétablir sa pression, secteur par secteur.'),
  contract('station-c-nid', 'nest', 'CONTRAT · PURGE D’UN NID', 'purge a reactor nest', 'action',
    'Purger un nid installé dans la station. Infestation de la station −.', 'Un nid s’est formé près d’un réacteur de la station. Le purger avant qu’il ne s’étende.'),
  contract('station-c-synthetique', 'synthetic', 'CONTRAT · RÉCUPÉRER UN SYNTHÉTIQUE', 'recover a synthetic', 'tension',
    'Récupérer un synthétique de maintenance. Main-d’œuvre du hub +.', 'Un synthétique de maintenance d’Asphodèle s’est arrêté dans un secteur isolé. Le ramener.')
]);
export const ASPHODELE_CONTRACT_IDS_V188 = Object.freeze(ASPHODELE_CONTRACTS_V188.map(entry => entry.id));
export const ASPHODELE_CONTRACT_KEYS_V188 = Object.freeze(ASPHODELE_CONTRACTS_V188.map(entry => entry.stationContractV188));
export const ASPHODELE_CONTRACT_NAMES_EN_V188 = Object.freeze({
  'station-c-conduits': 'CONTRACT · VENT INSPECTION', 'station-c-relais': 'CONTRACT · DRIFTING RELAY',
  'station-c-epave': 'CONTRACT · NEARBY WRECK', 'station-c-pression': 'CONTRACT · REPRESSURISE A MODULE',
  'station-c-nid': 'CONTRACT · PURGE A NEST', 'station-c-synthetique': 'CONTRACT · RECOVER A SYNTHETIC'
});
/** « Relais en dérive » ×3 opens the relay room (§7.3, §42.2). */
export const RELAY_DRIFT_KEY_V188 = 'relay-drift';
export const RELAY_DRIFT_REQUIRED_V188 = 3;

// —— Night missions of the lower decks (bible §39.2, §42.2 « Ponts inférieurs · Missions de nuit ») ——
// `orig-asphodele-2` « Inspection de nuit » is the §39.2 local mission (type L, replayable); its
// id, title, required state (« Hub actif ») and objective come from the bible. It is planned
// from the lower decks' night board and counted under the additive key 'night'. The other
// §39.2 entries (types A and D) are not built here.
export const NIGHT_PATROL_KEY_V188 = 'night';
export const ASPHODELE_NIGHT_MISSIONS_V188 = Object.freeze([
  base('orig-asphodele-2', 'ASPHODÈLE · INSPECTION DE NUIT', 'navigate the vent network', 'horror',
    'Ronde dans les conduits des ponts inférieurs pendant le cycle de nuit.',
    'Seules les lampes de secours sont allumées. Parcourir les conduits des ponts inférieurs, derrière les barricades d’Echo-8, et relever ce qui s’y cache encore.',
    { stationNightV188: true, stationContractV188: NIGHT_PATROL_KEY_V188, replayableV188: true })
]);
export const ASPHODELE_NIGHT_NAMES_EN_V188 = Object.freeze({ 'orig-asphodele-2': 'ASPHODÈLE · NIGHT INSPECTION' });
const COUNTED = Object.freeze([...ASPHODELE_CONTRACTS_V188, ...ASPHODELE_NIGHT_MISSIONS_V188]);
const COUNTED_KEYS = Object.freeze(COUNTED.map(entry => entry.stationContractV188));
export const ASPHODELE_CAMPAIGNS_V188 = Object.freeze([...ASPHODELE_SIDE_MISSIONS_V188, ...ASPHODELE_CONTRACTS_V188, ...ASPHODELE_NIGHT_MISSIONS_V188]);
export const ASPHODELE_CAMPAIGN_IDS_V188 = Object.freeze(ASPHODELE_CAMPAIGNS_V188.map(entry => entry.id));
export const isAsphodeleCampaignV188 = campaign => ASPHODELE_CAMPAIGN_IDS_V188.includes(typeof campaign === 'string' ? campaign : campaign?.id);
export const asphodeleContractKeyV188 = id => COUNTED.find(entry => entry.id === id)?.stationContractV188 || null;

/**
 * Why a side mission or contract cannot be launched yet, or null.
 * [PROPOSÉ] every one opens with the hub, after S4 (the station is retaken);
 * « Ce que CASSIUS a vu » needs CASSIUS rewritten (restrained, its archives are
 * among the closed annexes, §7.2); « Accès administrateur » needs CASSIUS kept.
 */
export function asphodeleMissionLockReasonV188(save, campaignId) {
  if (!isAsphodeleCampaignV188(campaignId)) return null;
  if (!has(completed(save), 'station-s4')) return 'hub';
  if (campaignId === 'station-a-cassius' && cassiusOf(save) !== 'rewrite') return 'cassius-kept';
  if (campaignId === 'station-a-bishop' && (!cassiusOf(save) || cassiusOf(save) === 'erase')) return 'cassius-erased';
  return null;
}
const LOCK_TEXT = Object.freeze({
  hub: t('Ouvre quand la station Asphodèle est reprise (S4).', 'Opens once Asphodèle station is retaken (S4).'),
  'cassius-kept': t('Exige un CASSIUS aux priorités réécrites : ses caméras sont fermées sinon.', 'Needs CASSIUS with rewritten priorities: its cameras are closed otherwise.'),
  'cassius-erased': t('Sans CASSIUS, il n’y a plus d’accès administrateur à couper.', 'Without CASSIUS there is no administrator access left to cut.')
});
export const asphodeleMissionLockTextV188 = (reason, language = 'fr') => LOCK_TEXT[reason]?.[language === 'en' ? 'en' : 'fr'] || '';

// —— Contract counters: stored in the additive `asphodeleHubV188.contracts` field ——
const MAX_COUNT = 99;
export function normalizeContractCountsV188(raw) {
  const counts = {};
  for (const key of COUNTED_KEYS) {
    const value = Math.floor(Number(raw?.[key]));
    counts[key] = Number.isFinite(value) ? Math.max(0, Math.min(MAX_COUNT, value)) : 0;
  }
  return counts;
}
export function contractCountV188(save, key) { return normalizeContractCountsV188(save?.asphodeleHubV188?.contracts)[key] || 0; }

// —— Contract effects (bible §7.2 « Locales », column « Effet »); values [PROPOSÉ], bible §7.6 ——
// Two kinds, both additive and applied exactly once per counted success:
//  - derived from the counters (station security, station infestation, workforce, sections
//    repressurised): recomputed from `contracts`, so reading them never adds again;
//  - paid at resolution (wreck salvage, Cocyte infestation −) on the same candidate save as
//    the counter, in the same commit; the operation id guards a replayed resolution.
export const ASPHODELE_CONTRACT_EFFECTS_V188 = Object.freeze({
  vents: Object.freeze({ securityPerContract: 10 }),
  night: Object.freeze({ securityPerContract: 5 }),
  nest: Object.freeze({ stationInfestationPerContract: -10, cocyteInfestation: -3 }),
  synthetic: Object.freeze({ workforcePerContract: 1 }),
  wreck: Object.freeze({ resources: Object.freeze({ alloy: 12, fuel: 6 }) }),
  module: Object.freeze({ opensRepairHangarAt: 1 })
});
export const ASPHODELE_SECURITY_MAX_V188 = 60;
export const ASPHODELE_STATION_INFESTATION_START_V188 = 40;
export const ASPHODELE_WORKFORCE_MAX_V188 = 3;
/** The station indices moved by the contracts, recomputed from the counters (never stored). */
export function asphodeleStationIndicesV188(save) {
  const counts = normalizeContractCountsV188(save?.asphodeleHubV188?.contracts), effects = ASPHODELE_CONTRACT_EFFECTS_V188;
  return Object.freeze({
    security: Math.min(ASPHODELE_SECURITY_MAX_V188, counts.vents * effects.vents.securityPerContract + counts.night * effects.night.securityPerContract),
    infestation: Math.max(0, ASPHODELE_STATION_INFESTATION_START_V188 + counts.nest * effects.nest.stationInfestationPerContract),
    workforce: Math.min(ASPHODELE_WORKFORCE_MAX_V188, counts.synthetic * effects.synthetic.workforcePerContract),
    sections: counts.module, relays: counts[RELAY_DRIFT_KEY_V188], nights: counts.night, wrecks: counts.wreck
  });
}
/** Station security lowers the risk of station operations: −1 point per 10 security [PROPOSÉ]. */
export function asphodeleRiskReductionV188(save, campaignId) {
  return isAsphodeleCampaignV188(campaignId) ? Math.floor(asphodeleStationIndicesV188(save).security / 10) : 0;
}
const EFFECT_TEXT = Object.freeze({
  vents: t('Inspection des conduits : sécurité de la station +{n} ({v}/{max}).', 'Vent inspection: station security +{n} ({v}/{max}).'),
  night: t('Inspection de nuit : sécurité de la station +{n} ({v}/{max}).', 'Night inspection: station security +{n} ({v}/{max}).'),
  nest: t('Nid purgé : infestation de la station {v} %, infestation de Cocyte −{c}.', 'Nest purged: station infestation {v}%, Cocyte infestation −{c}.'),
  synthetic: t('Synthétique récupéré : main-d’œuvre du hub {v}/{max}, stock du marché +{v} par offre.', 'Synthetic recovered: hub workforce {v}/{max}, market stock +{v} per offer.'),
  wreck: t('Épave : +{alloy} alliage, +{fuel} carburant.', 'Wreck: +{alloy} alloy, +{fuel} fuel.'),
  module: t('Module remis en pression ({v}) : le hangar de réparation est sous pression.', 'Module repressurised ({v}): the repair hangar is pressurised.'),
  'relay-drift': t('Relais en dérive : {v}/3.', 'Drifting relays: {v}/3.')
});
/** The visible line of a counted contract (debrief toast, QZ board), in FR or EN. */
export function asphodeleContractEffectTextV188(save, key, language = 'fr') {
  const pair = EFFECT_TEXT[key]; if (!pair) return '';
  const indices = asphodeleStationIndicesV188(save), effects = ASPHODELE_CONTRACT_EFFECTS_V188;
  const values = { vents: { n: effects.vents.securityPerContract, v: indices.security, max: ASPHODELE_SECURITY_MAX_V188 },
    night: { n: effects.night.securityPerContract, v: indices.security, max: ASPHODELE_SECURITY_MAX_V188 },
    nest: { v: indices.infestation, c: -effects.nest.cocyteInfestation }, synthetic: { v: indices.workforce, max: ASPHODELE_WORKFORCE_MAX_V188 },
    wreck: effects.wreck.resources, module: { v: indices.sections }, 'relay-drift': { v: Math.min(RELAY_DRIFT_REQUIRED_V188, indices.relays) } }[key] || {};
  return pair[language === 'en' ? 'en' : 'fr'].replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));
}

/**
 * Called once per resolved operation (finalizeOperation, on the candidate save).
 * A successful station contract adds one to its counter and applies its resolution
 * effect. Returns the key or null. The candidate's `asphodeleHubV188` is only touched
 * for a counted contract. With `operationId`, a second call for the same operation
 * changes nothing (additive field `lastContractOpV188`).
 */
export function applyAsphodeleOperationResultV188(save, { success = false, campaignId = null, operationId = null } = {}) {
  const key = asphodeleContractKeyV188(campaignId);
  if (!success || !key || !save) return null;
  const hub = save.asphodeleHubV188 && typeof save.asphodeleHubV188 === 'object' ? save.asphodeleHubV188 : {};
  const guarded = typeof operationId === 'string' && operationId.length > 0;
  if (guarded && hub.lastContractOpV188 === operationId) return null;
  const counts = normalizeContractCountsV188(hub.contracts);
  counts[key] = Math.min(MAX_COUNT, counts[key] + 1);
  save.asphodeleHubV188 = { ...hub, contracts: counts, ...(guarded ? { lastContractOpV188: operationId } : {}) };
  const effect = ASPHODELE_CONTRACT_EFFECTS_V188[key], resources = save.galaxy?.resources;
  if (effect?.resources && resources && typeof resources === 'object')
    for (const [name, value] of Object.entries(effect.resources)) resources[name] = Math.min(999999999, Math.max(0, (Number(resources[name]) || 0) + value));
  const world = save.galaxy?.worldState?.[ASPHODELE_WORLD_ID_V188];
  if (effect?.cocyteInfestation && world && Number.isFinite(world.infestation)) world.infestation = Math.max(0, Math.min(100, world.infestation + effect.cocyteInfestation));
  return key;
}
