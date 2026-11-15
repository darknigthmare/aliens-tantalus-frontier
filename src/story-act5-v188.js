// V188 — Act V « Non viable », war council, final choice, final missions,
// endings and epilogue (bible §5.6-§5.8, §5.7.1; owner answers Q1-Q5 and Q12
// by default, docs/development/QUESTIONS_PROPRIETAIRE_V188.md; spec 006).
// Pure rules and texts (FR/EN), no DOM. What other records already hold is read
// from them (missions done, crew loyalty, the QZ17 dossier, CASSIUS, the M577
// manifest, the colony); the Act's own decisions live in the additive
// `storyCampaignV188.act5` (story-act5-state-v188.js). Values and lines marked
// [PROPOSÉ] are recorded in bible §5.11.
import { normalizeStoryCampaignV188, storyEndingReachedV188, deriveStoryCampaignV188 } from './story-campaign-v188.js';
import { storyDossierV188, finalChoiceOptionsV188, resolveFinalChoiceV188, FINAL_OPTIONS_V188, ENDINGS_V188 } from './story-dossier-v188.js';
import { asphodeleRetakenV188, normalizeStationV188, kesslerTagRecoveredV188 } from './station-asphodele-v188.js';
import { colonyRescuedV188, colonyTierV188 } from './colony-reconstruction-v188.js';
import { createAct5V188, normalizeAct5V188, ACT5_DRIFT_RELAYS_NEEDED_V188, ACT5_OPTION_IDS_V188 } from './story-act5-state-v188.js';

export * from './story-act5-state-v188.js';

const t = (fr, en) => Object.freeze({ fr, en });
const L = language => language === 'en' ? 'en' : 'fr';
const completed = save => Array.isArray(save?.galaxy?.completedCampaignIds) ? save.galaxy.completedCampaignIds : [];
const crewMember = (save, id) => Array.isArray(save?.crew) ? save.crew.find(member => member?.id === id) || null : null;
const loyaltyOf = (save, id) => Number(crewMember(save, id)?.loyalty) || 0;

export const ACT5_WORLD_ID_V188 = 'world-05-lethe'; // Cocyte: the depot, the road, Port-Méridien
// Trust bands of NPC_TRUST_LEVELS_V62 (npc-dialogue-v62.js): « operationnel » from 55, « solide » from 75.
export const ACT5_VEGA_THRESHOLD_V188 = 55;
export const ACT5_SOLID_TRUST_V188 = 75;
export const ACT5_STANDOFF_PIECES_V188 = 5; // Q4 A: the same threshold as « Transmettre »
export const ACT5_LATE_COLONISTS_V188 = 4; // [PROPOSÉ] people in the late colonists' trailer (bridge, §5.6 step 5)
export const ACT5_BRIDGE_SECONDS_V188 = 15; // [PROPOSÉ] Q2 A: timed, without pause
export const ACT5_BRIDGE_DEFAULT_V188 = 'freight'; // [PROPOSÉ] no answer in time: the rear coupling (freight) gives way
export const ACT5_CEDE_STRESS_V188 = 10; // [PROPOSÉ] « Céder » without restitution costs the crew's morale (§5.7.1)

// —— Missions (Q1 A adapted: built from the existing mission templates, see spec 006 research) ——
const mission = (id, name, objective, templateId, registerV188, summary, description) => Object.freeze({
  id, pairId: null, mode: 'FRONTIER', name, source: 'Tantalus Frontier', worldId: ACT5_WORLD_ID_V188, objective,
  year: 2204, canon: 'project-continuity', routes: 2, templateId, registerV188, act5V188: true, summary, description
});
export const ACT5_CAMPAIGNS_V188 = Object.freeze([
  // The station's local contract « Relais en dérive » (§7.2), the condition of the relay room (§5.7.1).
  mission('act5-drift-relay', 'ASPHODÈLE · RELAIS EN DÉRIVE', 'recover black-box data', 'ship-interior-vertical', 'tension',
    'Récupérer la boîte noire d’un relais du réseau QZ qui dérive près d’Asphodèle. Trois relais rouvrent la salle des relais.',
    'Un relais du réseau QZ dérive feux éteints autour d’Asphodèle. Rétablir son énergie et copier sa boîte noire : chaque relais récupéré rend une liaison à la salle des relais de la station.'),
  mission('act5-last-run', 'NON VIABLE · DERNIER DÉPART', 'escort a colony convoy', 'planet-exterior', 'action',
    'Le M577 quitte le complexe sous la pluie avec les derniers ouvriers. La ruche du dépôt coupe la route du port.',
    'Escorter le convoi du complexe vers Port-Méridien. À mi-parcours, un pont cède : il faudra lâcher une remorque, celle du fret ou celle des colons en retard.'),
  mission('act5-depot-queen', 'NON VIABLE · LA REINE DU DÉPÔT', 'track an apex specimen', 'planet-exterior', 'action',
    'La Reine du dépôt, nourrie par les livraisons QZ17, poursuit le convoi.',
    'Suivre la Reine au détecteur de mouvement et l’arrêter avant qu’elle n’atteigne la route du port.'),
  mission('act5-port-walls', 'NON VIABLE · LES PORTES DU PORT', 'defend the colony', 'colony-multiroute', 'action',
    'Arrivée aux murs de Port-Méridien : tenir la nuit, puis faire face à l’équipe de récupération au quai.',
    'Le convoi débouche sous les murs du port. Tenir les portes jusqu’à l’aube ; l’équipe de récupération de la compagnie attend au quai.'),
  mission('act5-evacuation', 'NON VIABLE · L’ÉVACUATION', 'hold the extraction zone', 'colony-multiroute', 'action',
    'Le dépôt est cédé : tenir la zone d’embarquement pendant que la compagnie prend le contrôle.',
    'Tenir la zone d’embarquement de Port-Méridien jusqu’au dernier départ négocié avec la compagnie.')
]);
export const ACT5_NAMES_EN_V188 = Object.freeze({ 'act5-drift-relay': 'ASPHODÈLE · DRIFTING RELAY', 'act5-last-run': 'NON-VIABLE · LAST DEPARTURE',
  'act5-depot-queen': 'NON-VIABLE · THE DEPOT QUEEN', 'act5-port-walls': 'NON-VIABLE · THE PORT GATES', 'act5-evacuation': 'NON-VIABLE · THE EVACUATION' });
export const ACT5_CAMPAIGN_IDS_V188 = Object.freeze(ACT5_CAMPAIGNS_V188.map(entry => entry.id));
export const ACT5_DRIFT_RELAY_ID_V188 = 'act5-drift-relay';
export const isAct5CampaignV188 = campaign => ACT5_CAMPAIGN_IDS_V188.includes(typeof campaign === 'string' ? campaign : campaign?.id);

/** The final missions, in order, for a decided option. */
export function act5MissionPathV188(option) {
  if (!ACT5_OPTION_IDS_V188.includes(option)) return Object.freeze([]);
  return Object.freeze(['act5-last-run', 'act5-depot-queen', option === 'cede' ? 'act5-evacuation' : 'act5-port-walls']);
}

// —— State ——
export const act5StateV188 = save => normalizeStoryCampaignV188(save?.storyCampaignV188).act5 || createAct5V188();
function writeAct5(save, mutate) {
  const story = normalizeStoryCampaignV188(save.storyCampaignV188), state = story.act5 || createAct5V188();
  const result = mutate(state);
  if (result === false) return false;
  const normalized = normalizeAct5V188(state);
  if (normalized) story.act5 = normalized; else delete story.act5;
  save.storyCampaignV188 = story; return result ?? true;
}

/** Act V opens after the four Cocyte chapters, once Act IV's return (CIN-51) is read and no Interlude step is pending. */
export function act5OpenV188(save) {
  const story = normalizeStoryCampaignV188(save?.storyCampaignV188);
  return storyEndingReachedV188(save) && story.debriefSeen.includes('special-black-cocoon')
    && !['alert', 'choice'].includes(story.interlude?.phase);
}
export function relayRoomOpenV188(save) { return asphodeleRetakenV188(save) && act5StateV188(save).driftRelays >= ACT5_DRIFT_RELAYS_NEEDED_V188; }
/** The options of the war council, with the relay room read from the drift relays. */
export const act5FinalOptionsV188 = save => finalChoiceOptionsV188(save, { asphodeleRetaken: asphodeleRetakenV188(save), relayRoomOpen: relayRoomOpenV188(save) });

/** Why an Act V mission cannot be launched yet, or null. */
export function act5LockReasonV188(save, campaignId) {
  if (!isAct5CampaignV188(campaignId)) return null;
  if (campaignId === ACT5_DRIFT_RELAY_ID_V188) return asphodeleRetakenV188(save) ? null : 'station';
  const state = act5StateV188(save), done = completed(save);
  if (!state.decision) return 'council';
  const path = act5MissionPathV188(state.decision.option), index = path.indexOf(campaignId);
  if (index < 0) return 'path';
  if (done.includes(campaignId)) return null; // replay, without story effect
  if (state.phase !== 'final') return 'path';
  if (index > 0 && !done.includes(path[index - 1])) return 'previous';
  return null;
}
export function filterAct5CampaignsV188(save, campaigns) {
  const active = save?.strategy?.currentOperation?.campaignId;
  return campaigns.filter(campaign => campaign.id === active || !isAct5CampaignV188(campaign) || act5LockReasonV188(save, campaign.id) === null);
}
const LOCKS = Object.freeze({
  station: t('Reprenez d’abord la station Asphodèle (S4).', 'First retake Asphodèle station (S4).'),
  council: t('Tenez d’abord le conseil de guerre à la table tactique.', 'First hold the war council at the tactical table.'),
  path: t('Cette mission ne fait pas partie de la ligne décidée au conseil.', 'This mission is not part of the line decided at the council.'),
  previous: t('Terminez d’abord la mission précédente de l’Acte V.', 'First finish the previous Act V mission.')
});
export const act5LockTextV188 = (reason, language = 'fr') => LOCKS[reason]?.[L(language)] || '';

/** The next final mission to play, or null. */
export function act5NextMissionV188(save) {
  const state = act5StateV188(save);
  if (state.phase !== 'final' || !state.decision) return null;
  return act5MissionPathV188(state.decision.option).find(id => !completed(save).includes(id)) || null;
}
export const act5FinalMissionsDoneV188 = save => {
  const state = act5StateV188(save);
  return Boolean(state.decision) && act5MissionPathV188(state.decision.option).every(id => completed(save).includes(id));
};

// —— War council (§5.6 step 1) ——
export const ACT5_ADVISORS_V188 = Object.freeze([
  Object.freeze({ advantage: 'turrets', crewId: 'crew-07-sanaa-doyle', name: 'Sanaa Doyle',
    line: t('« Mes tourelles du quai nord ont encore leurs bandes. Je les démonte et je les monte sur le mur. »', '"My north-quay turrets still have their belts. I’ll strip them and mount them on the wall."'),
    effect: t('Munitions +120 au départ de chaque mission finale', 'Ammunition +120 at the start of each final mission') }),
  Object.freeze({ advantage: 'armour', crewId: 'crew-16-cal-mercer', name: 'Cal Mercer',
    line: t('« Je renforce tout ce qui roule et tout ce qui marche. Le M577 d’abord, vos plaques ensuite. »', '"I’ll reinforce everything that rolls and everything that walks. The M577 first, your plates next."'),
    effect: t('Blindage porté à 100 au départ de chaque mission finale', 'Armour raised to 100 at the start of each final mission') }),
  Object.freeze({ advantage: 'window', crewId: 'crew-08-maksim-orlov', name: 'Maksim Orlov',
    line: t('« Je vous tiens une fenêtre au-dessus du pont. Six secondes de plus, pas une de moins. »', '"I’ll hold you a window over the bridge. Six more seconds, not one less."'),
    effect: t('Décision du pont : +6 secondes', 'Bridge decision: +6 seconds') }),
  Object.freeze({ advantage: 'route', crewId: 'crew-15-leila-s-rensen', name: 'Leila Sørensen',
    line: t('« Il y a un sentier de maintenance sous le pont. Si on lâche les colons, je les ramène à pied. »', '"There’s a maintenance path under the bridge. If we drop the colonists, I’ll walk them back."'),
    effect: t('Colons en retard : 2 sur 4 rejoignent le port si leur remorque est lâchée', 'Late colonists: 2 of 4 reach the port if their trailer is dropped') })
]);
const COUNCIL_TEXT = Object.freeze({
  title: t('Conseil de guerre', 'War council'),
  situation: t('HALLORAN · « Au titre de la charte, Port-Méridien est déclarée non viable, avec effet à l’arrivée de l’équipe de récupération de la compagnie. Ses commandos sécuriseront les actifs du dépôt et de la colonie. » Privée de livraisons, la ruche du dépôt sort vers la surface et coupe la route du complexe au port.',
    'HALLORAN · "Under the charter, Port-Méridien is declared non-viable, effective on the arrival of the company recovery team. Its commandos will secure the assets of the depot and the colony." Deprived of deliveries, the depot hive breaks out to the surface and cuts the road from the complex to the port.'),
  noAdvice: t('n’a pas encore assez confiance pour proposer un avantage (confiance solide).', 'does not trust Echo-9 enough yet to offer an advantage (solid trust).'),
  cassiusKept: t('CASSIUS · « Je confirmerai les ordres de livraison devant le représentant Halloran. Mes journaux sont horodatés. »', 'CASSIUS · "I will confirm the delivery orders before representative Halloran. My logs are time-stamped."'),
  cassiusErased: t('CASSIUS est effacé : personne ne confirmera les ordres devant Halloran ; il reste la copie faite en S2.', 'CASSIUS is erased: no one will confirm the orders before Halloran; the copy made in S2 remains.'),
  origin03: t('ECHO-9 · « Une saisie de l’ICC se fait sur pièces. J’ai appris à les présenter chez les Marshals. »', 'ECHO-9 · "An ICC referral is made on evidence. I learned to present it with the Marshals."'),
  origin10: t('ECHO-9 · « J’ai porté leur badge. Halloran ne bluffe jamais sur une clause ; il bluffe sur les délais. »', 'ECHO-9 · "I wore their badge. Halloran never bluffs about a clause; he bluffs about deadlines."'),
  recommend: t('Echo-9 recommande une ligne à la capitaine Vega. Elle la suivra si sa confiance envers l’escouade est au moins « opérationnelle » ; sinon elle décidera seule selon le dossier.',
    'Echo-9 recommends a line to Captain Vega. She will follow it if her trust in the squad is at least "operational"; otherwise she decides alone from the file.')
});
const OPTION_TEXT = Object.freeze({
  transmit: t('Protéger la colonie et envoyer le dossier à l’ICC et aux Marshals coloniaux depuis la salle des relais d’Asphodèle.', 'Protect the colony and send the file to the ICC and the Colonial Marshals from Asphodèle’s relay room.'),
  hold: t('Bloquer l’équipe de récupération, sans canal sûr pour le dossier.', 'Block the recovery team, with no safe channel for the file.'),
  cede: t('Laisser la compagnie récupérer le dépôt et négocier l’évacuation.', 'Let the company recover the depot and negotiate the evacuation.'),
  restitution: t('Halloran parle de « restitution » : avec 2 conteneurs ou plus à bord, céder ne coûte aucun moral à l’équipage.', 'Halloran calls it "restitution": with 2 or more containers aboard, ceding costs the crew no morale.'),
  noRestitution: t('Sans conteneur à rendre, céder pèse sur le moral de l’équipage.', 'With no container to hand back, ceding weighs on the crew’s morale.'),
  recovery: t('Halloran exige aussi la créature capturée : tenir la colonie déclenche une tentative de récupération à bord du Tantalus.', 'Halloran also demands the captured creature: holding the colony triggers a recovery attempt aboard the Tantalus.'),
  transmitClosed: t('« Transmettre » n’est pas ouvert :', '"Transmit" is not open:'),
  needRetake: t('Asphodèle n’est pas reprise (S4)', 'Asphodèle is not retaken (S4)'),
  needRelays: t('salle des relais fermée', 'relay room closed'),
  needPieces: t('dossier inférieur à 5 pièces', 'file below 5 pieces')
});

/** Everything the council dialog shows, read from the current save. */
export function act5CouncilV188(save, language = 'fr') {
  const lang = L(language), state = act5StateV188(save), { dossier, options } = act5FinalOptionsV188(save);
  const advisors = ACT5_ADVISORS_V188.map(entry => {
    const present = Boolean(crewMember(save, entry.crewId)) && crewMember(save, entry.crewId).status !== 'dead';
    const solid = present && loyaltyOf(save, entry.crewId) >= ACT5_SOLID_TRUST_V188;
    return Object.freeze({ crewId: entry.crewId, name: entry.name, advantage: entry.advantage, offered: solid,
      text: solid ? `${entry.name.toUpperCase()} · ${entry.line[lang]} — ${entry.effect[lang]}` : `${entry.name} ${COUNCIL_TEXT.noAdvice[lang]}` });
  });
  const extra = [], cassius = normalizeStationV188(save?.stationV188).cassius, origin = save?.player?.originV188;
  if (cassius === 'rewrite' || cassius === 'restrain') extra.push(COUNCIL_TEXT.cassiusKept[lang]);
  if (cassius === 'erase') extra.push(COUNCIL_TEXT.cassiusErased[lang]);
  if (origin === 'origin-03') extra.push(COUNCIL_TEXT.origin03[lang]);
  if (origin === 'origin-10') extra.push(COUNCIL_TEXT.origin10[lang]);
  const closed = [];
  if (!options.some(option => option.id === 'transmit')) {
    if (!asphodeleRetakenV188(save)) closed.push(OPTION_TEXT.needRetake[lang]);
    if (!relayRoomOpenV188(save)) closed.push(`${OPTION_TEXT.needRelays[lang]} (${state.driftRelays}/${ACT5_DRIFT_RELAYS_NEEDED_V188})`);
    if (dossier.count < 5) closed.push(`${OPTION_TEXT.needPieces[lang]} (${dossier.count}/${dossier.total})`);
  }
  const list = options.map(option => {
    const notes = [];
    if (option.id === 'cede') notes.push(option.restitution ? OPTION_TEXT.restitution[lang] : OPTION_TEXT.noRestitution[lang]);
    if (option.id === 'hold' && option.recoveryAttemptAboard) notes.push(OPTION_TEXT.recovery[lang]);
    return Object.freeze({ id: option.id, label: FINAL_OPTIONS_V188[option.id].label[lang], description: OPTION_TEXT[option.id][lang],
      ending: ENDINGS_V188[option.ending][lang], notes: Object.freeze(notes) });
  });
  const vega = loyaltyOf(save, 'crew-01-mara-vega');
  return Object.freeze({ title: COUNCIL_TEXT.title[lang], situation: COUNCIL_TEXT.situation[lang], advisors: Object.freeze(advisors),
    extra: Object.freeze(extra), recommend: COUNCIL_TEXT.recommend[lang], dossier, options: Object.freeze(list),
    transmitClosed: closed.length ? `${OPTION_TEXT.transmitClosed[lang]} ${closed.join(' ; ')}.` : null,
    vegaLoyalty: vega, vegaFollows: vega >= ACT5_VEGA_THRESHOLD_V188 });
}

/** Opens the council once Act V is due. Mutates the candidate save; true when it changed. */
export function startAct5CouncilV188(save) {
  if (!act5OpenV188(save) || act5StateV188(save).phase) return false;
  return writeAct5(save, state => { state.phase = 'council'; });
}

const DECISION_TEXT = Object.freeze({
  follows: t('VEGA · « D’accord. On fait comme tu dis. »', 'VEGA · "All right. We do it your way."'),
  decides: t('VEGA · « Je t’ai entendu. Je décide seule. »', 'VEGA · "I heard you. I’m deciding alone."'),
  line: t('Ligne retenue :', 'Line chosen:'),
  ending: t('Elle mène à la fin', 'It leads to the ending'),
  next: t('Prochaine mission : « Dernier départ ».', 'Next mission: "Last departure".')
});
/** Records the decision once (§5.7.1). Mutates the candidate save; returns the frozen decision or null. */
export function decideAct5V188(save, recommended, language = 'fr') {
  const lang = L(language), state = act5StateV188(save);
  if (state.phase !== 'council' || !ACT5_OPTION_IDS_V188.includes(recommended)) return null;
  const { dossier, options } = act5FinalOptionsV188(save);
  if (!options.some(option => option.id === recommended)) return null;
  const resolved = resolveFinalChoiceV188(save, recommended, { asphodeleRetaken: asphodeleRetakenV188(save), relayRoomOpen: relayRoomOpenV188(save) });
  const chosen = options.find(option => option.id === resolved.option) || {};
  const council = act5CouncilV188(save, lang);
  const decision = { option: resolved.option, ending: resolved.ending, decidedBy: resolved.decidedBy, dossierCount: dossier.count,
    signerEstablished: dossier.signerEstablished, restitution: chosen.restitution === true, recoveryAttempt: chosen.recoveryAttemptAboard === true };
  writeAct5(save, next => {
    next.phase = 'final'; next.recommended = recommended; next.decision = decision;
    next.advantages = council.advisors.filter(entry => entry.offered).map(entry => entry.advantage);
  });
  // [PROPOSÉ] Ceding without restitution weighs on the crew's morale (stress), once.
  if (decision.option === 'cede' && !decision.restitution && Array.isArray(save.crew)) {
    for (const member of save.crew) if (member && Number.isFinite(Number(member.stress))) member.stress = Math.min(100, Number(member.stress) + ACT5_CEDE_STRESS_V188);
  }
  const text = `${decision.decidedBy === 'echo-9' ? DECISION_TEXT.follows[lang] : DECISION_TEXT.decides[lang]} ${DECISION_TEXT.line[lang]} ${FINAL_OPTIONS_V188[decision.option].label[lang]}. ${DECISION_TEXT.ending[lang]} ${lang === 'en' ? `"${ENDINGS_V188[decision.ending][lang]}"` : `« ${ENDINGS_V188[decision.ending][lang]} »`}. ${DECISION_TEXT.next[lang]}`;
  return Object.freeze({ ...decision, text });
}

// —— Final missions: launch advantages, the bridge, completion ——
/** [PROPOSÉ] advisors' effects at the launch of a final mission. Mutates the save; returns what was applied. */
export function applyAct5LaunchAdvantagesV188(save, campaignId) {
  const state = act5StateV188(save);
  if (state.phase !== 'final' || !state.decision || !act5MissionPathV188(state.decision.option).includes(campaignId) || !save?.player) return [];
  const applied = [];
  if (state.advantages.includes('turrets') && save.player.ammo && typeof save.player.ammo === 'object') {
    save.player.ammo.primary = (Number(save.player.ammo.primary) || 0) + 120; applied.push('turrets');
  }
  if (state.advantages.includes('armour')) { save.player.armor = Math.max(Number(save.player.armor) || 0, 100); applied.push('armour'); }
  return applied;
}

export const act5BridgeDueV188 = (save, campaignId) => campaignId === 'act5-last-run' && act5StateV188(save).phase === 'final' && !act5StateV188(save).bridge;
export const act5BridgeSecondsV188 = save => ACT5_BRIDGE_SECONDS_V188 + (act5StateV188(save).advantages.includes('window') ? 6 : 0);
export const ACT5_BRIDGE_TEXT_V188 = Object.freeze({
  title: t('Le pont cède', 'The bridge gives way'),
  text: t('Le tablier s’affaisse sous la deuxième remorque. Cal : « Je ne passe pas avec les deux ! » Il faut en lâcher une, maintenant.',
    'The deck sags under the second trailer. Cal: "I can’t make it with both!" One has to go, now.'),
  options: Object.freeze({ freight: t('LÂCHER LE FRET', 'DROP THE FREIGHT'), colonists: t('LÂCHER LES COLONS EN RETARD', 'DROP THE LATE COLONISTS') }),
  results: Object.freeze({
    freight: t('La remorque de fret tombe dans le ravin. Les colons en retard sont à bord.', 'The freight trailer falls into the ravine. The late colonists are aboard.'),
    colonists: t('La remorque des colons se détache. Le fret de la compagnie passe.', 'The colonists’ trailer breaks loose. The company freight goes through.'),
    timeout: t('Personne n’a décidé : l’attelage arrière, celui du fret, cède seul.', 'Nobody decided: the rear coupling, the freight’s, gives way on its own.'),
    route: t('Leila redescend par le sentier de maintenance : deux colons rejoindront le port à pied.', 'Leila goes back down the maintenance path: two colonists will reach the port on foot.')
  })
});
/** Records the bridge choice once. Mutates the candidate save. */
export function chooseAct5BridgeV188(save, choice, { timedOut = false } = {}) {
  if (!act5BridgeDueV188(save, 'act5-last-run')) return false;
  const value = timedOut ? ACT5_BRIDGE_DEFAULT_V188 : choice;
  if (!['freight', 'colonists'].includes(value)) return false;
  return writeAct5(save, state => { state.bridge = value; state.bridgeTimedOut = Boolean(timedOut); });
}
/** Late colonists who still reach the port. */
export function act5LateColonistsSavedV188(save) {
  const state = act5StateV188(save);
  if (state.bridge === 'freight') return ACT5_LATE_COLONISTS_V188;
  if (state.bridge === 'colonists') return state.advantages.includes('route') ? 2 : 0;
  return 0;
}

/** In the operation resolution (finalizeOperation candidate). Returns what changed, or null. */
export function applyAct5OperationResultV188(save, { success, campaignId } = {}) {
  if (!success || !isAct5CampaignV188(campaignId)) return null;
  if (campaignId === ACT5_DRIFT_RELAY_ID_V188) {
    if (!asphodeleRetakenV188(save) || act5StateV188(save).driftRelays >= ACT5_DRIFT_RELAYS_NEEDED_V188) return null;
    writeAct5(save, state => { state.driftRelays += 1; });
    const relays = act5StateV188(save).driftRelays;
    return Object.freeze({ kind: 'drift-relay', relays, needed: ACT5_DRIFT_RELAYS_NEEDED_V188, relayRoomOpen: relays >= ACT5_DRIFT_RELAYS_NEEDED_V188 });
  }
  // The convoy reached the port without the choice being shown (no checkpoint reached): the default applies.
  if (campaignId === 'act5-last-run' && act5BridgeDueV188(save, campaignId)) { chooseAct5BridgeV188(save, null, { timedOut: true }); return Object.freeze({ kind: 'bridge-default' }); }
  return null;
}

// —— Standoff at the quay (§5.6 step 8, Q4 A) and the move to the ending ——
export const ACT5_STANDOFF_TEXT_V188 = Object.freeze({
  title: t('Le quai', 'The quay'),
  transmitted: t('Au quai, l’officier des commandos reçoit un appel. L’ICC est saisie depuis Asphodèle : ordre de se retirer. Personne n’a tiré.',
    'At the quay, the commando officer takes a call. The ICC has been referred from Asphodèle: order to withdraw. Nobody fired.'),
  withdrawn: t('Au quai, Echo-9 lit le dossier, pièce par pièce, devant les commandos. À la cinquième, leur officier demande des ordres. Il reçoit celui de se retirer.',
    'At the quay, Echo-9 reads the file, piece by piece, to the commandos. At the fifth, their officer asks for orders. He is told to withdraw.'),
  held: t('Au quai, le dossier ne suffit pas à faire reculer les commandos. Ils restent devant les portes jusqu’à l’aube ; personne ne tire.',
    'At the quay, the file is not enough to make the commandos back down. They stay at the gates until dawn; nobody fires.'),
  recovery: t('Pendant la nuit, une équipe de la compagnie tente de récupérer la créature à bord du Tantalus. L’équipage la repousse au sas du laboratoire.',
    'During the night, a company team tries to recover the creature aboard the Tantalus. The crew pushes it back at the laboratory airlock.')
});
export function act5StandoffOutcomeV188(save) {
  const state = act5StateV188(save);
  if (!state.decision || state.decision.option === 'cede') return null;
  if (state.decision.option === 'transmit') return 'transmitted';
  return storyDossierV188(save).count >= ACT5_STANDOFF_PIECES_V188 ? 'withdrawn' : 'held';
}

/** What the briefing table should do next for Act V, or null. */
export function act5TableActionV188(save) {
  const state = act5StateV188(save);
  if (!state.phase) return act5OpenV188(save) ? 'start-council' : null;
  if (state.phase === 'council') return 'council';
  if (state.phase === 'final') {
    if (!act5FinalMissionsDoneV188(save)) return null;
    return state.decision.option === 'cede' ? 'to-ending' : 'standoff';
  }
  if (state.phase === 'ending') return 'ending';
  if (state.phase === 'credits') return 'credits';
  return null;
}
/** After the last final mission: records the standoff (if any) and moves to the ending. Mutates the candidate save. */
export function advanceAct5ToEndingV188(save) {
  const action = act5TableActionV188(save);
  if (action !== 'standoff' && action !== 'to-ending') return null;
  const standoff = act5StandoffOutcomeV188(save);
  writeAct5(save, state => { state.standoff = standoff; state.phase = 'ending'; });
  return Object.freeze({ standoff });
}
export const finishAct5EndingV188 = save => act5StateV188(save).phase === 'ending' && writeAct5(save, state => { state.phase = 'epilogue'; });

// —— Endings (§5.7) ——
export const ACT5_ENDING_CINEMATICS_V188 = Object.freeze({ 'relay-speaks': 'cin-90-relay', 'freight-first': 'cin-90-freight', 'living-without-proof': 'cin-90-living' });
const ENDING_TEXT = Object.freeze({
  'relay-speaks': t('Le dossier part vers l’ICC et les Marshals coloniaux depuis Asphodèle.', 'The file leaves Asphodèle for the ICC and the Colonial Marshals.'),
  autonomous: t('Palier « Autonome » : la clause de non-viabilité tombe. Port-Méridien garde sa charte.', '"Autonomous" tier: the non-viability clause falls. Port-Méridien keeps its charter.'),
  suspended: t('La colonie n’est pas « Autonome » : sa charte est suspendue en attente d’enquête.', 'The colony is not "Autonomous": its charter is suspended pending an inquiry.'),
  'freight-first': t('La colonie passe sous administration de la compagnie. Inez Harlow démissionne. Le dossier est classé « incident technique ».',
    'The colony passes under company administration. Inez Harlow resigns. The file is closed as a "technical incident".'),
  'living-without-proof': t('La colonie tient cette nuit-là, mais la clause s’applique. La capitaine Vega est relevée à l’arrivée.',
    'The colony holds that night, but the clause applies. Captain Vega is relieved on arrival.')
});
export function act5EndingSummaryV188(save, language = 'fr') {
  const lang = L(language), state = act5StateV188(save);
  if (!state.decision) return null;
  const ending = state.decision.ending, tier = colonyTierV188(save?.colonyV188), lines = [ENDING_TEXT[ending][lang]];
  if (ending === 'relay-speaks') lines.push(tier === 'autonomous' ? ENDING_TEXT.autonomous[lang] : ENDING_TEXT.suspended[lang]);
  if (state.standoff) lines.push(ACT5_STANDOFF_TEXT_V188[state.standoff][lang]);
  if (state.decision.recoveryAttempt && state.decision.option === 'hold') lines.push(ACT5_STANDOFF_TEXT_V188.recovery[lang]);
  return Object.freeze({ ending, title: ENDINGS_V188[ending][lang], cinematic: ACT5_ENDING_CINEMATICS_V188[ending], lines: Object.freeze(lines),
    charterKept: ending === 'relay-speaks' && tier === 'autonomous', tier });
}
/** CIN-61: the real sum of the campaign's rescues (quay civilians, M577 colonists, late colonists). */
export function act5RollCallV188(save) { return colonyRescuedV188(save) + act5LateColonistsSavedV188(save); }

// —— Epilogue (§5.8, Q5 A: playable aboard the Tantalus, fixed shots elsewhere) ——
export const ACT5_ORIGIN_RETURN_LINES_V188 = Object.freeze({ // bible §2.4.2, « Retour » line of each origin
  'origin-01': t('« Cette fois, quelqu’un écrit le vrai rapport. »', '"This time, someone writes the real report."'),
  'origin-02': t('« Une colonie, ça tient par ses gens. Pas par ses murs. »', '"A colony holds because of its people. Not its walls."'),
  'origin-03': t('« Un dossier ne sauve personne. Mais il empêche de recommencer. »', '"A file saves no one. But it stops it happening again."'),
  'origin-04': t('« Je regarderai toujours ce qu’il y a dans les caisses. »', '"I’ll always check what’s in the crates."'),
  'origin-05': t('« Le processeur tourne. Ils respireront demain aussi. »', '"The processor’s running. They’ll breathe tomorrow too."'),
  'origin-06': t('« Personne n’est venu pour nous. Moi, je suis venu. »', '"No one came for us. I came."'),
  'origin-07': t('« Ma dette est payée. La leur aussi, j’espère. »', '"My debt’s paid. Theirs too, I hope."'),
  'origin-08': t('« Noor tient le registre. Je tiens la liste de ceux qu’on a sauvés. »', '"Noor keeps the register. I keep the list of the ones we saved."'),
  'origin-09': t('« Un jour, je reprendrai les commandes. Pas aujourd’hui. »', '"Someday I’ll fly again. Not today."'),
  'origin-10': t('« J’ai ouvert les caisses, cette fois. »', '"This time, I opened the crates."'),
  'origin-11': t('« Deux drapeaux. Les mêmes bureaux. »', '"Two flags. Same offices."'),
  'origin-12': t('« Ce qu’on récupère ici, on le garde pour eux. »', '"What we salvage here, we keep for them."'),
  'origin-13': t('« Plus aucun message ne reste en attente. Pas sur ma ligne. »', '"No message stays on hold. Not on my line."'),
  'origin-14': t('« Ma peine est finie. Je reste quand même. »', '"My sentence is over. I’m staying anyway."'),
  'origin-15': t('« Il a tenu. On lui doit au moins une révision complète. »', '"It held. We owe it a full service at least."'),
  'origin-16': t('« Inez a raison. On ne conclut pas. On rapporte. »', '"Inez is right. We don’t conclude. We report."'),
  'origin-17': t('« Ma mère aurait fait pareil. Je crois. »', '"My mother would’ve done the same. I think."'),
  'origin-18': t('« Tout le convoi est arrivé. C’est rare. »', '"The whole convoy made it. That’s rare."'),
  'origin-19': t('« Je ne me suis pas caché, cette fois. »', '"I didn’t hide this time."'),
  'origin-20': t('« Je ne sais toujours pas d’où je viens. Je sais où je vais. »', '"I still don’t know where I’m from. I know where I’m going."')
});
// [PROPOSÉ] one last line per crew member and ending (§5.8 « chaque personnage a une réplique finale selon la fin »).
const line3 = (relay, freight, living) => Object.freeze({ 'relay-speaks': relay, 'freight-first': freight, 'living-without-proof': living });
export const ACT5_CREW_EPILOGUE_V188 = Object.freeze({
  'crew-01-mara-vega': line3(t('« Le rapport est parti. Pour une fois, je signe sans relire. »', '"The report has gone out. For once, I sign without rereading."'),
    t('« J’ai obéi. Je m’en souviendrai plus longtemps qu’eux. »', '"I obeyed. I’ll remember it longer than they will."'),
    t('« Ils me relèvent demain. Cette nuit, la colonie a tenu. Ça me suffit. »', '"They relieve me tomorrow. Tonight, the colony held. That’s enough for me."')),
  'crew-09-inez-harlow': line3(t('« Chaque pièce tient. Je n’ai rien eu à arrondir. »', '"Every piece holds. I didn’t have to round anything off."'),
    t('« Ma démission est sur le bureau de Vega. Mes notes, je les garde. »', '"My resignation is on Vega’s desk. My notes, I keep."'),
    t('« Sans preuve, ce n’est qu’une histoire. Je continuerai à écrire. »', '"Without proof, it’s only a story. I’ll keep writing."')),
  'crew-06-rook': line3(t('« Le relais a parlé. Treize minutes de retard, rattrapées en une nuit. »', '"The relay spoke. Thirteen minutes late, made up in one night."'),
    t('« Ils ont coupé la ligne. J’ai gardé la piste. »', '"They cut the line. I kept the track."'),
    t('« J’ai fait l’appel deux fois. Le compte est juste. »', '"I called the roll twice. The count is right."')),
  'crew-10-david-8r': line3(t('« On ne nous déclarera pas non viables. Pas cette fois. »', '"They won’t declare us non-viable. Not this time."'),
    t('« Ils reprennent ce qu’ils ont acheté. Ils ne m’ont pas acheté. »', '"They take back what they bought. They didn’t buy me."'),
    t('« La clause s’applique aux colonies. Pas aux gens qui s’en souviennent. »', '"The clause applies to colonies. Not to the people who remember them."')),
  'crew-05-bishop-9': line3(t('« Mes journaux sont au dossier. Personne ne m’a demandé de les effacer. »', '"My logs are in the file. Nobody asked me to erase them."'),
    t('« La directive de préservation est satisfaite. Je ne sais pas si je le suis. »', '"The preservation directive is satisfied. I don’t know whether I am."'),
    t('« J’ai répondu quand on m’a interrogé. C’était la bonne méthode. »', '"I answered when I was asked. It was the right method."')),
  'crew-04-noor-okafor': line3(t('« Contrôle biologique : négatif, pour tout le monde. Je l’écris. »', '"Biological screening: negative, for everyone. I’m writing it down."'),
    t('« La compagnie veut mon registre. Elle aura une copie. »', '"The company wants my register. It’ll get a copy."'),
    t('« Les blessés de la nuit sont stables. Le reste n’est pas de mon ressort. »', '"Last night’s wounded are stable. The rest isn’t my department."')),
  'crew-08-maksim-orlov': line3(t('« Plan de vol déposé. Destination : la suite. »', '"Flight plan filed. Destination: whatever comes next."'),
    t('« Je pilote ce qu’on me dit. Pas ce que je pense. »', '"I fly what I’m told. Not what I think."'),
    t('« La fenêtre a tenu. Le reste aussi, à peu près. »', '"The window held. Everything else did too, more or less."')),
  'crew-12-asha-mbaye': line3(t('« Les familles recevront les noms. Tous les noms. »', '"The families will receive the names. All the names."'),
    t('« On a négocié des places. Pas assez. »', '"We negotiated seats. Not enough."'),
    t('« Ils sont vivants. On trouvera la preuve plus tard. »', '"They’re alive. We’ll find the proof later."'))
});
export const act5CrewEpilogueIdsV188 = save => Object.keys(ACT5_CREW_EPILOGUE_V188).filter(id => crewMember(save, id) && crewMember(save, id).status !== 'dead');
export function act5CrewEpilogueLineV188(save, crewId, language = 'fr') {
  const state = act5StateV188(save);
  if (!['epilogue', 'credits', 'complete'].includes(state.phase) || !state.decision || !act5CrewEpilogueIdsV188(save).includes(crewId)) return null;
  return ACT5_CREW_EPILOGUE_V188[crewId][state.decision.ending][L(language)];
}
export function markAct5EpilogueTalkV188(save, crewId) {
  if (!act5CrewEpilogueLineV188(save, crewId) || act5StateV188(save).epilogueTalked.includes(crewId)) return false;
  return writeAct5(save, state => { state.epilogueTalked = [...state.epilogueTalked, crewId]; });
}

/** The ECHO-8 locker label (§5.8, §7.4): the tag brought back from S3, or the post freed. */
export function act5LockerLabelV188(save, language = 'fr') {
  return kesslerTagRecoveredV188(save) ? (L(language) === 'en' ? 'RETURN CONFIRMED' : 'RETOUR CONFIRMÉ') : (L(language) === 'en' ? 'POST VACATED' : 'POSTE LIBÉRÉ');
}

const EPILOGUE_TEXT = Object.freeze({
  cassius: Object.freeze({
    rewrite: line3(t('CASSIUS reste au service d’Asphodèle, « les vivants d’abord ».', 'CASSIUS stays in Asphodèle’s service, "the living first".'),
      t('La compagnie retrouve un accès administrateur : CASSIUS est repris.', 'The company regains administrator access: CASSIUS is taken back.'),
      t('CASSIUS garde la station ; la compagnie réclame son accès administrateur.', 'CASSIUS keeps the station; the company demands its administrator access.')),
    restrain: line3(t('CASSIUS, bridé, tient les fonctions de base d’Asphodèle.', 'CASSIUS, restrained, runs Asphodèle’s basic functions.'),
      t('CASSIUS, bridé, ne sert plus personne ; la compagnie le remplacera.', 'CASSIUS, restrained, serves no one now; the company will replace it.'),
      t('CASSIUS, bridé, tient les fonctions de base d’Asphodèle.', 'CASSIUS, restrained, runs Asphodèle’s basic functions.')),
    erase: line3(t('Asphodèle fonctionne à la main. Ses archives sont perdues, sauf ce qui a été copié.', 'Asphodèle runs by hand. Its archives are lost, except what was copied.'),
      t('Asphodèle fonctionne à la main, en attendant l’équipe de la compagnie.', 'Asphodèle runs by hand, waiting for the company team.'),
      t('Asphodèle fonctionne à la main.', 'Asphodèle runs by hand.'))
  }),
  silent: t('Asphodèle n’a pas été reprise : la station tourne toujours, feux éteints.', 'Asphodèle was not retaken: the station still turns, lights out.'),
  dossier: t('Dossier QZ17 :', 'QZ17 file:'),
  signer: t('Le signataire du badge est établi. Reste non prouvé :', 'The badge signer is established. Still unproven:'),
  signerAll: t('Le signataire du badge est établi ; toutes les pièces sont au dossier.', 'The badge signer is established; every piece is in the file.'),
  noSigner: t('Le signataire du badge reste non établi.', 'The badge signer remains unestablished.'),
  captured: t('La créature capturée reste en cellule au laboratoire du Tantalus.', 'The captured creature stays in its cell in the Tantalus laboratory.'),
  destroyed: t('La créature de la quarantaine a été détruite ; il n’en reste que les notes d’Inez.', 'The quarantine creature was destroyed; only Inez’s notes remain.'),
  rollCall: t('Arrivés à Port-Méridien :', 'Arrived at Port-Méridien:'),
  solid: t('Membres de l’équipage en confiance solide :', 'Crew members with solid trust:'),
  vegaRelieved: t('Mara Vega est relevée de son commandement.', 'Mara Vega is relieved of her command.'),
  inezResigned: t('Inez Harlow quitte le Tantalus.', 'Inez Harlow leaves the Tantalus.'),
  cryo: t('Le Tantalus se prépare à repartir : la baie cryo rouvre ses caissons.', 'The Tantalus prepares to leave: the cryo bay reopens its pods.'),
  locker: t('Casier ECHO-8 :', 'ECHO-8 locker:')
});
/** Every epilogue fact, each from recorded state: CASSIUS, the colony, crew trust, the dossier, the locker, Echo-9's line. */
export function act5EpilogueV188(save, language = 'fr') {
  const lang = L(language), state = act5StateV188(save);
  if (!state.decision) return null;
  const ending = state.decision.ending, summary = act5EndingSummaryV188(save, lang), dossier = storyDossierV188(save, lang);
  const facts = [];
  facts.push({ id: 'colony', text: summary.lines[0] + (summary.lines[1] && ending === 'relay-speaks' ? ` ${summary.lines[1]}` : '') });
  facts.push({ id: 'roll-call', text: `${EPILOGUE_TEXT.rollCall[lang]} ${act5RollCallV188(save)}.` });
  const cassius = normalizeStationV188(save?.stationV188).cassius;
  facts.push({ id: 'cassius', text: !asphodeleRetakenV188(save) ? EPILOGUE_TEXT.silent[lang] : cassius ? EPILOGUE_TEXT.cassius[cassius][ending][lang] : EPILOGUE_TEXT.silent[lang] });
  const missing = dossier.pieces.filter(piece => !piece.held).map(piece => piece.label);
  facts.push({ id: 'dossier', text: `${EPILOGUE_TEXT.dossier[lang]} ${dossier.count}/${dossier.total}. ${dossier.signerEstablished ? (missing.length ? `${EPILOGUE_TEXT.signer[lang]} ${missing.join(', ')}.` : EPILOGUE_TEXT.signerAll[lang]) : EPILOGUE_TEXT.noSigner[lang]}` });
  const solid = Array.isArray(save?.crew) ? save.crew.filter(member => member?.status !== 'dead' && Number(member?.loyalty) >= ACT5_SOLID_TRUST_V188).length : 0;
  facts.push({ id: 'crew', text: `${EPILOGUE_TEXT.solid[lang]} ${solid}.${ending === 'living-without-proof' ? ` ${EPILOGUE_TEXT.vegaRelieved[lang]}` : ''}${ending === 'freight-first' ? ` ${EPILOGUE_TEXT.inezResigned[lang]}` : ''}` });
  const outcome = normalizeStoryCampaignV188(save?.storyCampaignV188).interlude?.outcome;
  if (outcome) facts.push({ id: 'creature', text: EPILOGUE_TEXT[outcome][lang] });
  facts.push({ id: 'cryo', text: EPILOGUE_TEXT.cryo[lang] });
  facts.push({ id: 'locker', text: `${EPILOGUE_TEXT.locker[lang]} ${act5LockerLabelV188(save, lang)}.` });
  const origin = ACT5_ORIGIN_RETURN_LINES_V188[save?.player?.originV188] || ACT5_ORIGIN_RETURN_LINES_V188['origin-20'];
  facts.push({ id: 'echo-9', text: `ECHO-9 · ${origin[lang]}` });
  return Object.freeze(facts.map(fact => Object.freeze(fact)));
}
/** Reading the ECHO-8 locker in the epilogue ends it (then the credits play). Mutates the candidate save. */
export function finishAct5EpilogueV188(save) {
  if (act5StateV188(save).phase !== 'epilogue') return false;
  return writeAct5(save, state => { state.lockerRead = true; state.phase = 'credits'; });
}
export const finishAct5CreditsV188 = save => act5StateV188(save).phase === 'credits' && writeAct5(save, state => { state.phase = 'complete'; });
/** After the credits: free play continues on the same save (§45.2 « Continuer »). */
export const act5CompleteV188 = save => act5StateV188(save).phase === 'complete';

// —— Credits (same style as the opening credit, intro-sequence-v188.js) ——
export const ACT5_CREDITS_V188 = Object.freeze([
  Object.freeze({ by: t('A fan game by', 'A fan game by'), name: 'Darknigthmare' }),
  Object.freeze({ by: t('D’après', 'Based on'), name: 'Alien (1979) · Aliens (1986)' }),
  Object.freeze({ by: t('Projet non officiel, sans affiliation', 'Unofficial project, no affiliation'), name: 'ALIENS: TANTALUS FRONTIER' })
]);

/** Everything the Act V cinematics draw (counts and labels come from the save). */
export function act5CinematicContextV188(save, language = 'fr') {
  const lang = L(language), summary = act5EndingSummaryV188(save, lang), epilogue = act5EpilogueV188(save, lang);
  return Object.freeze({ rollCall: act5RollCallV188(save), lockerLabel: act5LockerLabelV188(save, lang), asphodeleRetaken: asphodeleRetakenV188(save),
    endingTitle: summary?.title || '', endingLines: summary?.lines || [], epilogue: epilogue ? epilogue.map(fact => fact.text) : [],
    credits: ACT5_CREDITS_V188.map(entry => Object.freeze({ by: entry.by[lang], name: entry.name })) });
}

// —— Objective (hub and briefing table) ——
const OBJECTIVE = Object.freeze({
  council: t('ACTE V · Non viable : salle de briefing, table tactique. Tenez le conseil de guerre.', 'ACT V · Non-viable: briefing room, tactical table. Hold the war council.'),
  final: t('ACTE V · Préparez « {0} » à la table tactique (★), puis déployez.', 'ACT V · Prepare "{0}" at the tactical table (★), then deploy.'),
  quay: t('ACTE V · Retour au quai : salle de briefing, table tactique.', 'ACT V · Back to the quay: briefing room, tactical table.'),
  ending: t('ACTE V · Salle de briefing, table tactique : la fin de la campagne.', 'ACT V · Briefing room, tactical table: the end of the campaign.'),
  epilogue: t('ÉPILOGUE · Parlez à l’équipage, puis rejoignez le casier d’Echo-8 en baie cryo (pont 0).', 'EPILOGUE · Talk to the crew, then go to the Echo-8 locker in the cryo bay (deck 0).'),
  credits: t('ÉPILOGUE · Salle de briefing, table tactique : générique.', 'EPILOGUE · Briefing room, tactical table: credits.')
});
export function act5ObjectiveV188(save, language = 'fr') {
  const lang = L(language), state = act5StateV188(save), action = act5TableActionV188(save);
  if (action === 'start-council' || action === 'council') return { objective: OBJECTIVE.council[lang], recommendedCampaignId: null };
  if (state.phase === 'final') {
    const next = act5NextMissionV188(save);
    if (!next) return { objective: OBJECTIVE.quay[lang], recommendedCampaignId: null };
    const name = lang === 'en' ? ACT5_NAMES_EN_V188[next] : ACT5_CAMPAIGNS_V188.find(entry => entry.id === next).name;
    return { objective: OBJECTIVE.final[lang].replace('{0}', name), recommendedCampaignId: next };
  }
  if (state.phase === 'ending') return { objective: OBJECTIVE.ending[lang], recommendedCampaignId: null };
  if (state.phase === 'epilogue') return { objective: OBJECTIVE.epilogue[lang], recommendedCampaignId: null };
  if (state.phase === 'credits') return { objective: OBJECTIVE.credits[lang], recommendedCampaignId: null };
  return null;
}
/** deriveStoryCampaignV188 extended with Act V; the first-hour steps are unchanged. */
export function deriveStoryWithAct5V188(save, options = {}) {
  const base = deriveStoryCampaignV188(save, options);
  if (base.step === 'interlude' || !(act5OpenV188(save) || act5StateV188(save).phase)) return base;
  const lang = options.language || 'fr', act5 = act5ObjectiveV188(save, lang);
  if (!act5) return base; // complete: free play, no story objective
  const current = save?.strategy?.currentOperation?.campaignId || null;
  const objective = current && current !== act5.recommendedCampaignId ? null : act5.objective;
  return Object.freeze({ ...base, step: 'act5', objective, recommendedCampaignId: act5.recommendedCampaignId ?? null, act5Phase: act5StateV188(save).phase || 'due' });
}

/** Briefing-table panel. */
export function act5SnapshotV188(save, language = 'fr') {
  const lang = L(language), state = act5StateV188(save), open = act5OpenV188(save) || Boolean(state.phase);
  const path = state.decision ? act5MissionPathV188(state.decision.option) : [];
  const name = id => lang === 'en' ? ACT5_NAMES_EN_V188[id] : ACT5_CAMPAIGNS_V188.find(entry => entry.id === id)?.name;
  return Object.freeze({ open, phase: state.phase, driftRelays: state.driftRelays, relaysNeeded: ACT5_DRIFT_RELAYS_NEEDED_V188, relayRoomOpen: relayRoomOpenV188(save),
    decision: state.decision ? Object.freeze({ ...state.decision, label: FINAL_OPTIONS_V188[state.decision.option].label[lang], endingTitle: ENDINGS_V188[state.decision.ending][lang] }) : null,
    steps: Object.freeze(path.map(id => Object.freeze({ id, name: name(id), done: completed(save).includes(id) }))),
    bridge: state.bridge, standoff: state.standoff, complete: state.phase === 'complete' });
}
