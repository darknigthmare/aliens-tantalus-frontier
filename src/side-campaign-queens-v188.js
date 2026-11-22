// V188 — first side campaign « La Saison des Reines » (bible §13, §14, §19, §30;
// owner Q13/Q15: after Act V, campaign by campaign; spec 011). Pure rules and
// data (FR/EN), no DOM. This lot delivers the campaign frame (call received at
// the Tantalus after the main campaign, briefing and acceptance, the route to
// Nacre-7 through the existing galaxy jump, mission order, return scenes, the
// Rask choice and the Arc 1 debrief) and Arc 1 « Sous la surface » end to end.
// Arcs 2 (Echo Basin) and 3 (TR-0) are listed for the panel only: they are not
// playable yet (bible §14.5, §14.6, spec 011 « Reste »).
//
// The additive save field is `sideCampaignsV188` ({ schema, queens }); an older
// save simply has none. Mission completion is still recorded by the existing
// operation result (`galaxy.completedCampaignIds`); the campaign keeps its own
// list `queens.done` of the missions completed *while it is accepted*, so a
// chapter played before the campaign (Opération Abysse Noir) keeps its old
// record without skipping the arc.
// Titles, givers and objectives come from bible §14.4; locks, delays, texts and
// rosters marked [PROPOSÉ] are recorded in bible §14.11.

const t = (fr, en) => Object.freeze({ fr, en });
const L = language => language === 'en' ? 'en' : 'fr';
const has = (list, id) => Array.isArray(list) && list.includes(id);
const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));

export const QUEENS_CAMPAIGN_ID_V188 = 'queens';
export const QUEENS_NACRE_WORLD_ID_V188 = 'world-31-nacre-7';
export const QUEENS_ECHO_WORLD_ID_V188 = 'world-27-echo-basin';
export const COCYTE_WORLD_ID_V188 = 'world-05-lethe';
// The existing V131 chapter reused by Arc 1 (1.3 « Plongée HADAL » and 1.4 « La Reine des récifs »
// are its two halves: HADAL free swim, then MANTA-6 and the aquatic boss). Its worldId moved to Nacre-7
// (legacy-operation-state-v131.js), the old Ceto id stays valid for deployments already under way.
export const QUEENS_ABYSS_CHAPTER_ID_V188 = 'special-black-abyss-v131';
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

export const QUEENS_CAMPAIGNS_V188 = Object.freeze([...QUEENS_ARC1_MISSIONS_V188, ...QUEENS_ARC1_SIDE_V188, ...QUEENS_ARC1_CONTRACTS_V188]);
export const QUEENS_CAMPAIGN_IDS_V188 = Object.freeze(QUEENS_CAMPAIGNS_V188.map(entry => entry.id));
const BY_ID = new Map(QUEENS_CAMPAIGNS_V188.map(entry => [entry.id, entry]));
export const getQueensCampaignV188 = id => BY_ID.get(id) || null;
/** A mission of the campaign: its own missions and the chapter it reuses. */
export const isQueensCampaignV188 = campaign => {
  const id = typeof campaign === 'string' ? campaign : campaign?.id;
  return BY_ID.has(id) || id === QUEENS_ABYSS_CHAPTER_ID_V188;
};
export const QUEENS_CONTRACT_KEYS_V188 = Object.freeze(QUEENS_ARC1_CONTRACTS_V188.map(entry => entry.queensContractV188));
const RECORD_IDS = Object.freeze([...QUEENS_ARC1_ORDER_V188, ...QUEENS_ARC1_SIDE_V188.map(entry => entry.id)]);

export const QUEENS_NAMES_EN_V188 = Object.freeze({
  'queens-1-1-quai': 'NACRE-7 · THE DROWNED QUAY', 'queens-1-2-bassins': 'NACRE-7 · THE PENS',
  'queens-1-5-rask': 'NACRE-7 · WHAT RASK WANTED', 'queens-a-navarre': 'NACRE-7 · NAVARRE’S NOTEBOOKS',
  'queens-a-filets': 'NACRE-7 · THE NETS', 'queens-a-phare': 'NACRE-7 · THE SOUS-RÉCIF LIGHTHOUSE',
  'queens-l-bassin': 'NACRE-7 · PURGE A PEN', 'queens-l-canots': 'NACRE-7 · BOAT ESCORT',
  'queens-l-boites': 'NACRE-7 · TRAWLER BLACK BOXES', [QUEENS_ABYSS_CHAPTER_ID_V188]: 'BLACK ABYSS · THALASSA-7'
});
const NAMES_FR = Object.freeze({ [QUEENS_ABYSS_CHAPTER_ID_V188]: 'ABYSSE NOIR · THALASSA-7' });
export const queensCampaignNameV188 = (id, language = 'fr') => L(language) === 'en' ? QUEENS_NAMES_EN_V188[id] || id : getQueensCampaignV188(id)?.name || NAMES_FR[id] || id;
// The step labels of the arc panel; the chapter covers rows 1.3 and 1.4.
const STEP_LABELS = Object.freeze({
  'queens-1-1-quai': '1.1', 'queens-1-2-bassins': '1.2', [QUEENS_ABYSS_CHAPTER_ID_V188]: '1.3-1.4', 'queens-1-5-rask': '1.5'
});
const CHAPTER_STEP_TITLE = t('Plongée HADAL · La Reine des récifs (chapitre « Opération Abysse Noir »)', 'HADAL dive · The reef Queen (chapter "Operation Black Abyss")');

// —— Arcs not playable in this lot (panel only, bible §14.5, §14.6) ——
export const QUEENS_LATER_ARCS_V188 = Object.freeze([
  Object.freeze({ arc: 2, worldId: QUEENS_ECHO_WORLD_ID_V188, title: t('Arc 2 · Echo Basin : « L’écho des canyons »', 'Arc 2 · Echo Basin: "The echo of the canyons"'),
    reuses: Object.freeze(['special-broodstorm-v131']) }),
  Object.freeze({ arc: 3, worldId: null, title: t('Arc 3 · TR-0, la Ruche-monde : « La Mère »', 'Arc 3 · TR-0, the Hive World: "The Mother"'),
    reuses: Object.freeze(['special-queen-mother-v131', 'special-hive-world-v131']) })
]);

// —— Encounter roster (game-ai: admissibility before generic logic) ——
// The reef lineage (§14.3: Drone, Lurker, Runner; §30.1: the reef castes of the catalogue). The
// generic encounter selection would otherwise draw any caste of the 528-entry catalogue for an
// orbital/hive world. The aquatic Ceto reef predator (runtime « aquatic », swims) is NOT admitted
// on these land templates: it stays the specialised boss of the chapter (legacy-operations-v131.js).
// [PROPOSÉ] roster; behaviours are those the registry already resolves (drone, ambusher, runner, acid).
export const QUEENS_REEF_LINEAGE_IDS_V188 = Object.freeze(['enemy-004-drone-big-chap', 'enemy-011-lurker', 'enemy-006-runner',
  'enemy-027-reef-stalker', 'enemy-028-reef-spitter']);
export const QUEENS_EXCLUDED_AQUATIC_IDS_V188 = Object.freeze(['enemy-051-ceto-reef-predator']);
// 1.5: Rask's Weyland-Yutani salvage squad (§14.1, §30.1 base `weyland-yutani-commando`).
export const QUEENS_RASK_SQUAD_IDS_V188 = Object.freeze(['enemy-043-weyland-yutani-commando']);
export function queensEncounterIdsV188(campaignId) {
  if (!BY_ID.has(campaignId)) return null;
  return campaignId === 'queens-1-5-rask' ? [...QUEENS_REEF_LINEAGE_IDS_V188, ...QUEENS_RASK_SQUAD_IDS_V188] : [...QUEENS_REEF_LINEAGE_IDS_V188];
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
const SCENE_IDS = Object.freeze([...RECORD_IDS, 'arc1-debrief']);
export function createQueensV188() {
  return { phase: null, callDay: null, acceptedDay: null, arrivedDay: null, done: [], contracts: {}, raskEgg: null, scenesSeen: [] };
}
export function createSideCampaignsV188() { return { schema: 188, queens: createQueensV188() }; }
const day = value => Number.isSafeInteger(value) && value >= 1 && value <= 1e6 ? value : null;
export function normalizeQueensV188(raw) {
  const state = createQueensV188();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return state;
  state.phase = QUEENS_PHASES_V188.includes(raw.phase) ? raw.phase : null;
  state.callDay = state.phase ? day(raw.callDay) : null;
  state.acceptedDay = state.phase === 'accepted' ? day(raw.acceptedDay) : null;
  state.arrivedDay = state.phase === 'accepted' ? day(raw.arrivedDay) : null;
  const accepted = state.phase === 'accepted';
  state.done = accepted && Array.isArray(raw.done) ? RECORD_IDS.filter(id => raw.done.includes(id)) : [];
  if (accepted) for (const key of QUEENS_CONTRACT_KEYS_V188) {
    const value = Math.floor(Number(raw.contracts?.[key]));
    if (Number.isFinite(value) && value > 0) state.contracts[key] = Math.min(99, value);
  }
  // The choice exists only once « Ce que Rask voulait » was completed in the campaign.
  state.raskEgg = state.done.includes('queens-1-5-rask') && QUEENS_RASK_CHOICES_V188.includes(raw.raskEgg) ? raw.raskEgg : null;
  state.scenesSeen = Array.isArray(raw.scenesSeen)
    ? SCENE_IDS.filter(id => raw.scenesSeen.includes(id) && (id === 'arc1-debrief' ? queensArc1CompleteState(state) : state.done.includes(id))) : [];
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
function queensArc1CompleteState(state) { return QUEENS_ARC1_ORDER_V188.every(id => state.done.includes(id)) && Boolean(state.raskEgg); }

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
/** Records the call once; returns the travel message to file in the alert journal (or null). Mutates the candidate save. */
export function receiveQueensCallV188(save, options = {}) {
  if (!queensCallDueV188(save) || !save?.clock) return null;
  const today = Math.max(1, Math.floor(Number(save.clock.day) || 1)), delay = queensCallDelayV188(save, options);
  write(save, state => { state.phase = 'call'; state.callDay = today; });
  const world = save.galaxy?.worldState?.[QUEENS_NACRE_WORLD_ID_V188];
  return { id: 'campaign-queens-call', kind: 'campaign', worldId: QUEENS_NACRE_WORLD_ID_V188, sentDay: Math.max(1, today - delay), receivedDay: today,
    phase: 'during', values: Number.isFinite(world?.infestation) ? { infestation: Math.round(world.infestation) } : {} };
}
export const queensCallPendingV188 = save => queensStateV188(save).phase === 'call';
/** Acceptance (§13.3 step 1): opens the route to Nacre-7. Mutates the candidate save; true when accepted. */
export function acceptQueensCallV188(save) {
  if (!queensCallPendingV188(save)) return false;
  const today = Math.max(1, Math.floor(Number(save.clock?.day) || 1));
  write(save, state => { state.phase = 'accepted'; state.acceptedDay = today; });
  const unlocked = save.galaxy?.unlockedWorldIds;
  if (Array.isArray(unlocked) && !unlocked.includes(QUEENS_NACRE_WORLD_ID_V188)) unlocked.push(QUEENS_NACRE_WORLD_ID_V188);
  // An ordinary arrival already in Nacre-7's orbit counts as the arrival.
  if ((save.galaxy?.shipWorldIdV116 ?? save.worldId) === QUEENS_NACRE_WORLD_ID_V188) write(save, state => { state.arrivedDay = today; });
  return true;
}
export const queensAcceptedV188 = save => queensStateV188(save).phase === 'accepted';

/**
 * The first arrival in Nacre-7's orbit after acceptance, inside the jump settlement transaction
 * (after `deliverTravelMessagesV188`). Returns the travel message to add, or null. Mutates the candidate save.
 */
export function recordQueensArrivalV188(save, settlement) {
  const jump = save?.galaxy?.jumpV116;
  if (settlement?.status !== 'arrived' || jump?.phase !== 'arrived' || jump.destinationId !== QUEENS_NACRE_WORLD_ID_V188) return null;
  const state = queensStateV188(save);
  if (state.phase !== 'accepted' || state.arrivedDay) return null;
  const today = Math.max(1, Math.floor(Number(save.clock?.day) || 1));
  write(save, next => { next.arrivedDay = today; });
  const world = save.galaxy?.worldState?.[QUEENS_NACRE_WORLD_ID_V188];
  return { id: `campaign-queens-arrival-${jump.completedAt}`, kind: 'campaign', worldId: QUEENS_NACRE_WORLD_ID_V188, sentDay: today, receivedDay: today,
    phase: 'after', values: Number.isFinite(world?.infestation) ? { infestation: Math.round(world.infestation) } : {} };
}

// —— Mission locks ——
const shipWorld = save => save?.galaxy?.shipWorldIdV116 ?? save?.worldId;
/** Why a campaign mission cannot be launched yet, or null. */
export function queensLockReasonV188(save, campaignId) {
  if (!isQueensCampaignV188(campaignId)) return null;
  const state = queensStateV188(save);
  if (!mainCampaignCompleteV188(save) || !state.phase) return 'main';
  if (state.phase !== 'accepted') return 'call';
  if (shipWorld(save) !== QUEENS_NACRE_WORLD_ID_V188) return 'orbit';
  const index = QUEENS_ARC1_ORDER_V188.indexOf(campaignId);
  if (index > 0 && !state.done.includes(QUEENS_ARC1_ORDER_V188[index - 1])) return 'previous';
  // [PROPOSÉ] annexes and local contracts open with the arrival mission (1.1).
  if (index < 0 && !state.done.includes('queens-1-1-quai')) return 'arrival';
  // [PROPOSÉ] A story or side mission is played once in the campaign; the local contracts repeat, and the
  // reused V131 chapter stays replayable as it was before the campaign (a replay no longer advances the arc).
  if (getQueensCampaignV188(campaignId) && !getQueensCampaignV188(campaignId).replayableV188 && state.done.includes(campaignId)) return 'done';
  return null;
}
export function filterQueensCampaignsV188(save, campaigns) {
  const active = save?.strategy?.currentOperation?.campaignId;
  return campaigns.filter(campaign => campaign.id === active || !isQueensCampaignV188(campaign) || queensLockReasonV188(save, campaign.id) === null);
}
const LOCK_TEXT = Object.freeze({
  main: t('Ouvre après la campagne principale (Acte V terminé) : un appel arrivera au Tantalus.', 'Opens after the main campaign (Act V over): a call will reach the Tantalus.'),
  call: t('Répondez d’abord à l’appel de Nacre-7 (salle de briefing).', 'First answer the call from Nacre-7 (briefing room).'),
  orbit: t('Le Tantalus doit être en orbite de Nacre-7 : carte galactique, saut hyperspatial.', 'The Tantalus must be in orbit of Nacre-7: galaxy map, hyperspace jump.'),
  previous: t('Terminez d’abord la mission précédente de l’arc.', 'Finish the previous mission of the arc first.'),
  arrival: t('Ouvre après « Le quai noyé » (1.1).', 'Opens after "The Drowned Quay" (1.1).'),
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
  const state = queensStateV188(save);
  if (state.done.includes(campaignId)) return null;
  // The chapter counts for the arc only when the arc reaches it (1.1 and 1.2 done): played out of order it is a replay.
  const index = QUEENS_ARC1_ORDER_V188.indexOf(campaignId);
  if (index > 0 && !state.done.includes(QUEENS_ARC1_ORDER_V188[index - 1])) return null;
  write(save, next => { next.done = [...next.done, campaignId]; });
  return { kind: 'step', id: campaignId, arcComplete: QUEENS_ARC1_ORDER_V188.every(id => queensStateV188(save).done.includes(id)) };
}

// —— The Rask choice (§14.8, 1.5) ——
export const queensRaskChoicePendingV188 = save => { const state = queensStateV188(save); return state.done.includes('queens-1-5-rask') && !state.raskEgg; };
export function chooseQueensRaskEggV188(save, choice) {
  if (!QUEENS_RASK_CHOICES_V188.includes(choice) || !queensRaskChoicePendingV188(save)) return false;
  return write(save, state => { state.raskEgg = choice; });
}
/** Consequences recorded for later campaigns (§14.8, §19). Derived from the choice, never stored twice. */
export function queensConsequencesV188(save) {
  const egg = queensStateV188(save).raskEgg;
  return Object.freeze({
    // Seized: a piece of the QZ17 thread for campaign 5, and a biological risk aboard [PROPOSÉ: recorded, no crisis yet].
    qz17ThreadPiece: egg === 'seize', biologicalRiskAboard: egg === 'seize',
    // Released: Weyland-Yutani gains a specimen (difficulty +1 in campaign 5, not produced).
    companySpecimen: egg === 'release'
  });
}
export const queensArc1CompleteV188 = save => queensArc1CompleteState(queensStateV188(save));

// —— Return scenes, once each, at the briefing table (bible §14.4; texts [PROPOSÉ]) ——
export const QUEENS_SCENES_V188 = Object.freeze({
  'queens-1-1-quai': Object.freeze({ slot: 'queens-quay', title: t('Sous-Récif · la salle des pompes', 'Sous-Récif · the pump room'),
    text: t('Le Dr Ilse Navarre ouvre la porte de la salle des pompes au troisième appel. Onze survivants derrière elle. « Ils ne viennent pas par les plates-formes. Ils viennent d’en dessous. Les bassins d’élevage sont pleins de quelque chose qui n’est pas à nous. » Elle demande qu’on relance les pompes.',
      'Dr Ilse Navarre opens the pump-room door at the third call. Eleven survivors behind her. "They don’t come along the platforms. They come from below. The breeding pens are full of something that isn’t ours." She asks for the pumps to be restarted.') }),
  'queens-1-2-bassins': Object.freeze({ slot: 'queens-pools', title: t('Sous-Récif · les bassins vidés', 'Sous-Récif · the drained pens'),
    text: t('Les deux bassins sont à sec. Sur les parois, des œufs fixés comme des coraux ; dans les filets, des cocons. Navarre relève les sondes : la lignée est venue de l’épave du Mariner’s Debt, coulée au bord du fossé. Le nid est là-bas, et la Reine avec lui.',
      'Both pens are dry. On the walls, eggs fixed like coral; in the nets, cocoons. Navarre reads the probes: the lineage came from the wreck of the Mariner’s Debt, sunk at the edge of the trench. The nest is down there, and the Queen with it.') }),
  [QUEENS_ABYSS_CHAPTER_ID_V188]: Object.freeze({ slot: 'queens-trench', title: t('Le fossé · retour à la cloche', 'The trench · back at the bell'),
    text: t('La cloche remonte avec le MANTA-6 accroché à son câble. Le nid de l’épave est stabilisé, la Reine récifale a reculé dans le noir. Sur la plate-forme, une navette qui n’est pas la nôtre allume ses feux : le capitaine Rask et son escouade de récupération ont suivi la plongée.',
      'The bell comes up with MANTA-6 hooked to its cable. The wreck’s nest is stabilised, the reef Queen has drawn back into the dark. On the platform, a shuttle that isn’t ours lights up: Captain Rask and his salvage squad followed the dive.') }),
  'queens-1-5-rask': Object.freeze({ slot: 'queens-rask', title: t('La plate-forme d’envol · le caisson', 'The landing platform · the case'),
    text: t('La zone est tenue. Le capitaine Tobiah Rask garde la main sur un caisson réfrigéré : un œuf royal, prélevé pendant le combat dans le fossé. « La compagnie paie l’observation, sergent. Personne ne vous demande de comprendre. » Le caisson est entre vous et sa navette.',
      'The zone is held. Captain Tobiah Rask keeps his hand on a refrigerated case: a royal egg, taken during the fight in the trench. "The company pays for observation, sergeant. Nobody asks you to understand." The case is between you and his shuttle.') }),
  'queens-a-navarre': Object.freeze({ slot: 'queens-pools', title: t('Les carnets de Navarre', 'Navarre’s notebooks'),
    text: t('Quarante-deux jours de relevés. Carapace lisse, respiration en eau froide, chasse sous la surface : la lignée s’est adaptée à Sous-Récif plus vite qu’aucun modèle ne le prévoit. Inez les reçoit au laboratoire du Tantalus.',
      'Forty-two days of readings. Smooth carapace, cold-water breathing, hunting below the surface: the lineage adapted to Sous-Récif faster than any model predicts. Inez receives them in the Tantalus laboratory.') }),
  'queens-a-filets': Object.freeze({ slot: 'queens-quay', title: t('Les filets', 'The nets'),
    text: t('Les filets sont remontés. Certains cocons étaient vides ; d’autres non. Les vivants sont à l’abri de la salle des pompes. Le pêcheur reste longtemps sur le ponton à regarder l’eau.',
      'The nets are up. Some cocoons were empty; others were not. The living are safe in the pump room. The fisherman stays a long time on the pontoon, watching the water.') }),
  'queens-a-phare': Object.freeze({ slot: 'queens-quay', title: t('Le phare de Sous-Récif', 'The Sous-Récif lighthouse'),
    text: t('La balise tourne à nouveau. Trois canots accostent avant l’aube. Rook a branché le phare sur la fréquence du Tantalus : le prochain appel de Nacre-7 n’arrivera pas en retard.',
      'The beacon turns again. Three boats come alongside before dawn. Rook has patched the lighthouse into the Tantalus frequency: the next call from Nacre-7 will not arrive late.') })
});
export function queensReturnSceneDueV188(save) {
  const state = queensStateV188(save);
  return [...QUEENS_ARC1_ORDER_V188, ...QUEENS_ARC1_SIDE_V188.map(entry => entry.id)].find(id => state.done.includes(id) && !state.scenesSeen.includes(id)) || null;
}
export function markQueensSceneSeenV188(save, sceneId) {
  if (!SCENE_IDS.includes(sceneId)) return false;
  return write(save, state => {
    if (state.scenesSeen.includes(sceneId)) return false;
    state.scenesSeen = [...state.scenesSeen, sceneId];
  });
}
/** The CQ-02 cinematic plays with the chapter's return scene (end of 1.4, bible §14.7). */
export const QUEENS_SCENE_CINEMATICS_V188 = Object.freeze({ [QUEENS_ABYSS_CHAPTER_ID_V188]: 'cin-cq-02' });
export const QUEENS_CALL_CINEMATIC_V188 = 'cin-cq-01';
export const queensArc1DebriefDueV188 = save => queensArc1CompleteV188(save) && !queensStateV188(save).scenesSeen.includes('arc1-debrief');

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
  const callDay = state.callDay || Math.max(1, Math.floor(Number(save?.clock?.day) || 1));
  return fill(QUEENS_CALL_DIALOG_V188.text[lang], { sent: Math.max(1, callDay - queensCallDelayV188(save)), fuel: fuel ?? '—', days });
}

const DEBRIEF = Object.freeze({
  title: t('Retour au Tantalus · Arc 1, « Sous la surface »', 'Back aboard the Tantalus · Arc 1, "Beneath the surface"'),
  base: t('Compte rendu de Nacre-7. La lignée récifale est contenue : le nid du Mariner’s Debt est stabilisé, les bassins de Sous-Récif sont vidés. Inez classe les relevés : la lignée n’est pas arrivée par hasard. Les relais d’Echo Basin appellent toujours ; la suite de la campagne (arc 2, Echo Basin) n’est pas encore jouable.',
    'Nacre-7 debrief. The reef lineage is contained: the Mariner’s Debt nest is stabilised, the Sous-Récif pens are drained. Inez files the readings: the lineage did not arrive by chance. The Echo Basin relays are still calling; the rest of the campaign (arc 2, Echo Basin) is not playable yet.'),
  release: t('Le capitaine Rask est reparti avec l’œuf royal : la compagnie a son spécimen.', 'Captain Rask left with the royal egg: the company has its specimen.'),
  seize: t('L’œuf royal est sous scellés à bord : une pièce du fil QZ17, et un risque à surveiller.', 'The royal egg is sealed aboard: a piece of the QZ17 thread, and a risk to watch.'),
  destroy: t('L’œuf royal a brûlé à Sous-Récif.', 'The royal egg burned at Sous-Récif.'),
  navarre: t('Les carnets de Navarre sont au laboratoire.', 'Navarre’s notebooks are in the laboratory.')
});
export function queensArc1DebriefV188(save, language = 'fr') {
  const lang = L(language), state = queensStateV188(save);
  const lines = [DEBRIEF.base[lang]];
  if (state.raskEgg) lines.push(DEBRIEF[state.raskEgg][lang]);
  if (state.done.includes('queens-a-navarre')) lines.push(DEBRIEF.navarre[lang]);
  return Object.freeze({ slot: 'queens-debrief', title: DEBRIEF.title[lang], text: lines.join('\n') });
}

// —— Briefing-table panel ——
const PANEL = Object.freeze({
  heading: t('CAMPAGNE ANNEXE · LA SAISON DES REINES', 'SIDE CAMPAIGN · THE SEASON OF QUEENS'),
  locked: t('Hors d’atteinte', 'Out of reach'), call: t('Appel reçu', 'Call received'), accepted: t('Réquisition acceptée', 'Requisition accepted'),
  arc1: t('Arc 1 · Nacre-7 : « Sous la surface »', 'Arc 1 · Nacre-7: "Beneath the surface"'),
  side: t('Annexes', 'Side missions'), contracts: t('Contrats locaux accomplis', 'Local contracts done'),
  orbitHere: t('Le Tantalus est en orbite de Nacre-7.', 'The Tantalus is in orbit of Nacre-7.'),
  orbitAway: t('Route : carte galactique, saut vers Nacre-7 ({fuel} carburant · {days} jours en hypersommeil).', 'Route: galaxy map, jump to Nacre-7 ({fuel} fuel · {days} days in hypersleep).'),
  later: t('à produire', 'to be produced'),
  egg: Object.freeze({ release: t('Œuf royal laissé à Rask', 'Royal egg left to Rask'), seize: t('Œuf royal saisi', 'Royal egg seized'), destroy: t('Œuf royal détruit', 'Royal egg destroyed') })
});
/** Player-facing summary for the briefing table. `fuel` is the jump cost to Nacre-7 (galaxy-jump-v115.js), if known. */
export function queensSnapshotV188(save, language = 'fr', { fuel = null, days = 14 } = {}) {
  const lang = L(language), state = queensStateV188(save);
  const status = !state.phase ? 'locked' : state.phase;
  const step = id => Object.freeze({ id, label: STEP_LABELS[id], name: id === QUEENS_ABYSS_CHAPTER_ID_V188 ? CHAPTER_STEP_TITLE[lang] : queensCampaignNameV188(id, lang),
    done: state.done.includes(id), lock: state.done.includes(id) ? null : queensLockReasonV188(save, id) });
  const steps = QUEENS_ARC1_ORDER_V188.map(step);
  const next = steps.find(entry => !entry.done && !entry.lock) || null, blocked = steps.find(entry => !entry.done && entry.lock) || null;
  return Object.freeze({
    heading: PANEL.heading[lang], status, statusLabel: PANEL[status][lang], hint: !state.phase ? queensLockTextV188('main', lang) : null,
    arcTitle: PANEL.arc1[lang], steps: Object.freeze(steps), nextId: next?.id || null,
    blockedHint: next ? null : blocked ? queensLockTextV188(blocked.lock, lang) : null,
    sides: Object.freeze(QUEENS_ARC1_SIDE_V188.map(entry => step(entry.id))), sideLabel: PANEL.side[lang],
    contracts: Object.freeze(QUEENS_ARC1_CONTRACTS_V188.map(entry => Object.freeze({ id: entry.id, name: queensCampaignNameV188(entry.id, lang), count: state.contracts[entry.queensContractV188] || 0 }))),
    contractsLabel: PANEL.contracts[lang],
    orbit: state.phase === 'accepted' ? (shipWorld(save) === QUEENS_NACRE_WORLD_ID_V188 ? PANEL.orbitHere[lang] : fill(PANEL.orbitAway[lang], { fuel: fuel ?? '—', days })) : null,
    choice: state.raskEgg ? PANEL.egg[state.raskEgg][lang] : null, arc1Complete: queensArc1CompleteState(state),
    later: Object.freeze(QUEENS_LATER_ARCS_V188.map(arc => `${arc.title[lang]} — ${PANEL.later[lang]}`)),
    callPending: state.phase === 'call'
  });
}

// —— Travel-message texts of the kind 'campaign' (travel-messages-v188.js reads them) ——
export const QUEENS_MESSAGE_TEXT_V188 = Object.freeze({
  call: Object.freeze({ from: t('Nacre-7 · colonie de Sous-Récif', 'Nacre-7 · Sous-Récif colony'),
    body: t('Appel daté du jour {sent}, reçu {delay} jours plus tard : « Ici Sous-Récif. Les bassins… quelque chose dans les bassins. Nous sommes dans la salle des pompes. » Infestation relevée : {infestation} %.',
      'Call dated day {sent}, received {delay} days later: "Sous-Récif here. The pens… something in the pens. We are in the pump room." Infestation reading: {infestation}%.') }),
  arrival: Object.freeze({ from: t('Nacre-7 · Dr Ilse Navarre', 'Nacre-7 · Dr Ilse Navarre'),
    body: t('Jour {sent}, à l’arrivée du Tantalus : « Si vous m’entendez, posez-vous au quai nord. Ne restez pas près de l’eau. » Infestation aujourd’hui : {nowInfestation} %.',
      'Day {sent}, as the Tantalus arrives: "If you can hear me, land at the north quay. Don’t stay near the water." Infestation today: {nowInfestation}%.') })
});
export const queensMessageVariantV188 = message => String(message?.id || '').startsWith('campaign-queens-arrival') ? 'arrival' : String(message?.id || '').startsWith('campaign-queens-call') ? 'call' : null;
