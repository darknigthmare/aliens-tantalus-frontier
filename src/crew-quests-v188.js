// V188 — first Tantalus crew quests (bible §8.1; owner Q9: DAVID-8R, Harlow,
// Rook and Vega, the quests that feed the QZ17 dossier and Act V). They are
// offered in the existing hub conversation (`npc-dialogue-v62.js`) and leave
// its six rapport choices untouched. Rule of §8: no reward before proof — an
// analysis quest pays only when its last step is answered from the evidence,
// DAVID-8R's only when three components were brought back from missions.
// Pure rules and texts (FR/EN); the additive save field is `crewQuestsV188`.
// Values marked [PROPOSÉ] are recorded in bible §8.4.
import { markStationIntroHeardV188, STATION_WORLD_ID_V188 } from './station-asphodele-v188.js';
import { CREW_QUESTS_TANTALUS_V188 } from './crew-quests-tantalus-v188.js';
import { addColonyPopulationV188, advanceColonySiteV188 } from './colony-missions-v188.js';
import { QUEENS_CREW_QUESTS_V188 } from './queens-crew-quests-v188.js';

const t = (fr, en) => Object.freeze({ fr, en });
const has = (list, id) => Array.isArray(list) && list.includes(id);
const completed = save => Array.isArray(save?.galaxy?.completedCampaignIds) ? save.galaxy.completedCampaignIds : [];
const option = (id, label, correct = false) => Object.freeze({ id, label, correct });
const step = (prompt, options, explain) => Object.freeze({ prompt, options: Object.freeze(options), explain });

export const DAVID_COMPONENTS_NEEDED_V188 = 3;

export const CREW_QUESTS_V188 = Object.freeze([
  Object.freeze({
    id: 'ship-rook', crewId: 'crew-06-rook', giver: 'Rook', slot: 'echo8-recording', kind: 'analysis',
    title: t('Six heures', 'Six Hours'), after: t('Après l’Acte II', 'After Act II'),
    where: t('Rook, à son poste de capteurs ou dans sa ronde à bord.', 'Rook, at his sensor post or on his rounds aboard.'),
    offer: t('« J’ai perdu le signal d’Echo-8 à la sixième heure. J’ai gardé la piste. Aide-moi à la nettoyer, seconde par seconde. »',
      '"I lost Echo-8’s signal at the sixth hour. I kept the track. Help me clean it, second by second."'),
    available: save => has(completed(save), 'special-archive-relay'),
    steps: Object.freeze([
      step(t('5:58:12. Sous la voix du sergent Kessler, un battement régulier, toutes les quatre secondes. Le détecteur d’Echo-8, enregistré sur la même piste, reste muet. Rook : « Ventilation, ou autre chose ? »',
        '5:58:12. Under Sergeant Kessler’s voice, a steady beat, every four seconds. Echo-8’s motion tracker, recorded on the same track, stays silent. Rook: "Ventilation, or something else?"'),
      [option('vents', t('La ventilation : le détecteur ne voit rien bouger.', 'Ventilation: the tracker sees nothing move.'), true),
        option('creature', t('Une créature dans le conduit.', 'A creature in the duct.'))],
      t('Rook : « Le détecteur ne ment pas sur ce qui bouge. C’est la ventilation de la station. Retenu. »', 'Rook: "The tracker doesn’t lie about what moves. It’s the station’s ventilation. Noted."')),
      step(t('5:59:40. Kessler : « Survivants barricadés au pont inférieur. On ressort par le sas 3. » Le plan d’Asphodèle de Rook ne montre qu’un sas 3, côté laboratoire de transit.',
        '5:59:40. Kessler: "Survivors barricaded on the lower deck. We’re going out through airlock 3." Rook’s plan of Asphodèle shows only one airlock 3, on the transit laboratory side.'),
      [option('lab', t('Echo-8 sortait par le laboratoire de transit.', 'Echo-8 was leaving through the transit laboratory.'), true),
        option('control', t('Echo-8 remontait vers le pont de contrôle.', 'Echo-8 was heading back up to the control deck.'))],
      t('Rook : « Le laboratoire, donc. Là où les conteneurs passaient. »', 'Rook: "The laboratory, then. Where the containers went through."')),
      step(t('6:00:07. La liaison coupe. Juste avant : le journal de la station, enregistré en fond, annonce « sas 3 verrouillé, consigne de quarantaine » à 6:00:05. Puis plus rien.',
        '6:00:07. The link cuts out. Just before: the station log, recorded in the background, announces "airlock 3 locked, quarantine order" at 6:00:05. Then nothing.'),
      [option('sealed', t('CASSIUS a scellé le sas derrière eux.', 'CASSIUS sealed the airlock behind them.'), true),
        option('radio', t('Echo-8 a coupé sa radio.', 'Echo-8 switched off its radio.'))],
      t('Rook : « Ce n’était pas une panne. La station a fermé la porte. »', 'Rook: "It wasn’t a fault. The station closed the door."'))
    ]),
    // Completion plays « Six heures de silence » (station-intro-silence, Calme, aboard).
    completion: t('SIX HEURES DE SILENCE · Rook rejoue la piste entière, sans rien couper. Orlov rapproche le dropship. Sur l’écran des capteurs, la station Asphodèle tourne lentement, feux éteints ; une navette Crucible est amarrée à l’anneau extérieur ; le dropship d’Echo-8 est toujours au sas. La première mission de la station est ouverte au Commandement.',
      'SIX HOURS OF SILENCE · Rook replays the whole track, cutting nothing. Orlov brings the dropship closer. On the sensor screen, Asphodèle station turns slowly, lights out; a Crucible shuttle is docked to the outer ring; Echo-8’s dropship is still at the airlock. The first station mission is open at Command.'),
    reward: Object.freeze({ loyalty: 5 })
  }),
  Object.freeze({
    id: 'ship-vega', crewId: 'crew-01-mara-vega', giver: 'Mara Vega', slot: 'order-documents', kind: 'analysis',
    title: t('La ligne de commandement', 'The Chain of Command'), after: t('Après l’Acte II', 'After Act II'),
    where: t('La capitaine Vega, au Commandement ou sur sa ronde.', 'Captain Vega, at Command or on her rounds.'),
    offer: t('« J’ai deux papiers qui me donnent des ordres. Lis-les avec moi. Je veux savoir où ils se contredisent avant d’avoir à choisir. »',
      '"I have two papers giving me orders. Read them with me. I want to know where they contradict each other before I have to choose."'),
    available: save => has(completed(save), 'special-archive-relay'),
    steps: Object.freeze([
      step(t('Ordre de l’Administration coloniale, article 2 : « Protéger la population de Cocyte et rendre compte de l’incident. » Consigne de la compagnie, point 4 : « Le fret QZ17 garde la priorité sur le réseau jusqu’à nouvel ordre. »',
        'Colonial Administration order, article 2: "Protect the population of Cocyte and report on the incident." Company directive, item 4: "QZ17 freight keeps priority on the network until further notice."'),
      [option('network', t('Le réseau : les appels de la colonie attendent derrière le fret.', 'The network: the colony’s calls wait behind the freight.'), true),
        option('schedule', t('Le calendrier de la mission.', 'The mission schedule.')),
        option('squad', t('Le commandement de l’escouade.', 'Command of the squad.'))],
      t('Vega : « Le 18:43 de QZ-18. C’est exactement ça. »', 'Vega: "QZ-18’s 18:43. That’s exactly it."')),
      step(t('Ordre, article 5 : « Le Tantalus peut réquisitionner les moyens civils et industriels de Cocyte. » Consigne, point 7 : « Aucun matériel de la compagnie ne quitte le dépôt sans accord du représentant. »',
        'Order, article 5: "The Tantalus may requisition the civil and industrial means of Cocyte." Directive, item 7: "No company equipment leaves the depot without the representative’s agreement."'),
      [option('depot', t('Le M577, les conteneurs et tout ce qui dort au dépôt.', 'The M577, the containers and everything sleeping in the depot.'), true),
        option('rations', t('Les rations de l’équipage.', 'The crew’s rations.'))],
      t('Vega : « Donc chaque conteneur à bord est une pièce que la compagnie réclamera. »', 'Vega: "So every container aboard is a piece the company will claim."')),
      step(t('Vega : « Si on m’oblige à choisir, sur quelle ligne je me tiens ? » Il n’y a pas de mauvaise réponse ; elle retiendra la vôtre.',
        'Vega: "If I’m forced to choose, which line do I stand on?" There is no wrong answer; she will remember yours.'),
      [option('administration', t('L’ordre de l’Administration : c’est lui qui a envoyé le Tantalus.', 'The Administration’s order: it is what sent the Tantalus.'), true),
        option('company', t('La consigne de la compagnie : c’est elle qui paie le voyage.', 'The company directive: it pays for the voyage.'), true)],
      t('Vega replie les deux feuilles et les range dans la même poche.', 'Vega folds both sheets and puts them in the same pocket.'))
    ]),
    completion: t('LA LIGNE DE COMMANDEMENT · Vega a marqué les deux contradictions. Elle s’en souviendra au moment de décider pour la colonie.',
      'THE CHAIN OF COMMAND · Vega has marked both contradictions. She will remember them when the time comes to decide for the colony.'),
    // [PROPOSÉ] +10 loyalty when she stands on the Administration's order, +4 otherwise (Act V: she follows Echo-9 from 55).
    reward: Object.freeze({ loyalty: 10, loyaltyByAnswer: Object.freeze({ company: 4 }) })
  }),
  Object.freeze({
    id: 'ship-harlow', crewId: 'crew-09-inez-harlow', giver: 'Inez Harlow', slot: 'seal-fragment', kind: 'analysis',
    title: t('Le sceau', 'The Seal'), after: t('Après l’Acte I', 'After Act I'),
    where: t('Inez Harlow, au laboratoire ou sur sa ronde.', 'Inez Harlow, at the laboratory or on her rounds.'),
    offer: t('« Tu as ramené de QZ-17 la preuve de la piste que tu as suivie. Je veux l’analyser avec toi : résidu, film, numéro de lot. »',
      '"You brought back from QZ-17 the evidence of the lead you followed. I want to analyse it with you: residue, film, batch number."'),
    available: save => has(completed(save), 'special-narrative-qz17')
      && (has(save?.narrativeArchives?.unlockedFlags, 'qz17-maintenance-bypass') || has(save?.narrativeArchives?.unlockedFlags, 'qz17-quarantine-lock')),
    steps: Object.freeze([
      step(t('Sous le joint du sceau QZ17-04 : une protéine non humaine et un film de résine. Le film couvre la face interne du joint, pas la face externe.',
        'Under the seal of QZ17-04: a non-human protein and a film of resin. The film covers the inner face of the seal, not the outer one.'),
      [option('inside', t('Ouvert de l’intérieur : quelque chose a poussé.', 'Opened from the inside: something pushed.'), true),
        option('outside', t('Ouvert de l’extérieur, au quai.', 'Opened from the outside, at the quay.'))],
      t('Inez : « Personne n’a forcé ce conteneur. Il s’est ouvert tout seul. »', 'Inez: "Nobody forced this container. It opened by itself."')),
      step(t('Le numéro de lot est gravé sous le sceau, avec un tampon de contrôle : « ASPHODÈLE · TRANSIT VÉRIFIÉ ».',
        'The batch number is engraved under the seal, with an inspection stamp: "ASPHODÈLE · TRANSIT VERIFIED".'),
      [option('station', t('Le conteneur est passé par le laboratoire de transit d’Asphodèle.', 'The container went through Asphodèle’s transit laboratory.'), true),
        option('depot', t('Il vient directement du dépôt.', 'It came straight from the depot.'))],
      t('Inez : « Asphodèle l’a contrôlé, et l’a laissé descendre. »', 'Inez: "Asphodèle inspected it, and let it go down."'))
    ]),
    completion: t('LE SCEAU · L’analyse d’Inez est versée au laboratoire. Le conteneur QZ17-04 s’est ouvert de l’intérieur après un contrôle à Asphodèle.',
      'THE SEAL · Inez’s analysis goes to the laboratory. Container QZ17-04 opened from the inside after an inspection on Asphodèle.'),
    // [PROPOSÉ] research and trust, paid once.
    reward: Object.freeze({ loyalty: 5, research: 6 })
  }),
  Object.freeze({
    id: 'ship-david', crewId: 'crew-10-david-8r', giver: 'DAVID-8R', slot: 'david-memory', kind: 'components',
    title: t('Mémoire récupérée', 'Recovered Memory'), after: t('Après l’Acte I', 'After Act I'),
    where: t('DAVID-8R, à son poste ou sur sa ronde.', 'DAVID-8R, at his post or on his rounds.'),
    offer: t('« Un secteur de ma mémoire est vide. Trois composants de relais suffiraient à le restaurer. On en trouve sur les postes de Cocyte. »',
      '"One sector of my memory is empty. Three relay components would restore it. They can be found at the posts on Cocyte."'),
    available: save => has(completed(save), 'special-narrative-qz17'),
    // [PROPOSÉ] adaptation of « trois composants trouvés en mission »: one per successful operation on Cocyte once accepted.
    components: DAVID_COMPONENTS_NEEDED_V188,
    completion: t('MÉMOIRE RÉCUPÉRÉE · DAVID-8R : « J’ai servi au poste de relais QZ-9, sous l’autorité d’Asphodèle. Mon dernier ordre était d’effacer les journaux de priorité. Je ne sais pas si je l’ai exécuté. » Une note est jointe au dossier QZ17, hors décompte.',
      'RECOVERED MEMORY · DAVID-8R: "I served at relay post QZ-9, under Asphodèle’s authority. My last order was to erase the priority logs. I do not know whether I carried it out." A note is attached to the QZ17 file, outside the count.'),
    reward: Object.freeze({ loyalty: 5 })
  })
]);
// V188 colony and crew lot: the twelve other quests of §8.1 (crew-quests-tantalus-v188.js), same rules.
// V188 spec 011 (bible §14.9): the three quests tied to « La Saison des Reines » (queens-crew-quests-v188.js),
// appended last: a second quest for Doyle, Orlov and Harlow, offered after the campaign's Arc 2.
export const CREW_QUESTS_ALL_V188 = Object.freeze([...CREW_QUESTS_V188, ...CREW_QUESTS_TANTALUS_V188, ...QUEENS_CREW_QUESTS_V188]);
export const CREW_QUEST_IDS_V188 = Object.freeze(CREW_QUESTS_ALL_V188.map(quest => quest.id));
const QUEST = new Map(CREW_QUESTS_ALL_V188.map(quest => [quest.id, quest]));
export const getCrewQuestV188 = id => QUEST.get(id) || null;

export function createCrewQuestsV188() { return { schema: 188, quests: {} }; }
export function normalizeCrewQuestsV188(raw) {
  const base = createCrewQuestsV188();
  if (!raw || typeof raw !== 'object' || !raw.quests || typeof raw.quests !== 'object' || Array.isArray(raw.quests)) return base;
  for (const quest of CREW_QUESTS_ALL_V188) {
    const entry = raw.quests[quest.id];
    if (!entry || typeof entry !== 'object' || !['active', 'done'].includes(entry.stage)) continue;
    const steps = quest.steps?.length || 0;
    const normalized = { stage: entry.stage, step: Math.max(0, Math.min(steps, Math.floor(Number(entry.step) || 0))) };
    if (quest.kind === 'components') normalized.components = Math.max(0, Math.min(quest.components, Math.floor(Number(entry.components) || 0)));
    if (typeof entry.answer === 'string' && /^[a-z-]{1,24}$/.test(entry.answer)) normalized.answer = entry.answer;
    // A gated quest remembers the proof value seen at acceptance (a receipt id or a service window).
    if (quest.gate && (typeof entry.mark === 'string' || Number.isFinite(entry.mark))) normalized.mark = String(entry.mark).slice(0, 120);
    base.quests[quest.id] = normalized;
  }
  return base;
}

const stateOf = (save, id) => normalizeCrewQuestsV188(save?.crewQuestsV188).quests[id] || null;
const markOf = (quest, save) => { const value = quest.gate?.mark(save); return value === null || value === undefined || value === '' ? null : String(value).slice(0, 120); };
/** A gated quest (Velez: a new range qualification; Kwan: the reactor repaired) shows its readings only after the proof. */
export function crewQuestGateOpenV188(save, id) {
  const quest = getCrewQuestV188(id), state = stateOf(save, id);
  if (!quest?.gate) return true;
  const mark = markOf(quest, save);
  return Boolean(state && mark && mark !== (state.mark ?? null));
}

/** One line per quest the crew member can talk about now (offered, active or ready to turn in). */
export function crewQuestActionsV188(save, crewId, language = 'fr') {
  const lang = language === 'en' ? 'en' : 'fr';
  return CREW_QUESTS_ALL_V188.filter(quest => quest.crewId === crewId).map(quest => {
    const state = stateOf(save, quest.id);
    if (state?.stage === 'done') return null;
    if (!state && !quest.available(save)) return null;
    const ready = quest.kind === 'components' && state && state.components >= quest.components;
    const progress = quest.kind === 'components' && state ? ` (${state.components}/${quest.components})` : '';
    const gated = state && quest.gate && !crewQuestGateOpenV188(save, quest.id);
    return Object.freeze({ id: quest.id, title: quest.title[lang], action: !state ? 'accept' : ready ? 'turn-in' : quest.kind === 'components' || gated ? 'wait' : 'continue',
      label: `${lang === 'en' ? 'QUEST' : 'QUÊTE'} · ${quest.title[lang]}${progress}` });
  }).filter(Boolean);
}

export function acceptCrewQuestV188(save, id) {
  const quest = getCrewQuestV188(id);
  if (!quest || !save || stateOf(save, id) || !quest.available(save)) return false;
  if (save.strategy?.currentOperation) return false;
  const state = normalizeCrewQuestsV188(save.crewQuestsV188);
  state.quests[id] = quest.kind === 'components' ? { stage: 'active', step: 0, components: 0 } : { stage: 'active', step: 0 };
  if (quest.gate) { const mark = markOf(quest, save); if (mark) state.quests[id].mark = mark; }
  save.crewQuestsV188 = state; return true;
}

/** The current step of an active analysis quest, or null. */
export function crewQuestStepV188(save, id, language = 'fr') {
  const lang = language === 'en' ? 'en' : 'fr', quest = getCrewQuestV188(id), state = stateOf(save, id);
  if (!quest || quest.kind !== 'analysis' || state?.stage !== 'active' || !crewQuestGateOpenV188(save, id)) return null;
  const current = quest.steps[state.step];
  if (!current) return null;
  return Object.freeze({ index: state.step, total: quest.steps.length, prompt: current.prompt[lang],
    options: current.options.map(entry => Object.freeze({ id: entry.id, label: entry.label[lang] })) });
}

const addOwned = (save, key, id) => {
  const inventory = save?.strategy?.inventory;
  if (!id || !inventory) return false;
  if (!Array.isArray(inventory[key])) inventory[key] = [];
  if (inventory[key].includes(id)) return false;
  inventory[key].push(id); return true;
};
function grantReward(save, quest, answer) {
  const reward = quest.reward || {};
  const loyalty = reward.loyaltyByAnswer?.[answer] ?? reward.loyalty ?? 0;
  const member = Array.isArray(save.crew) ? save.crew.find(entry => entry.id === quest.crewId) : null;
  if (member && loyalty) member.loyalty = Math.max(0, Math.min(100, (Number(member.loyalty) || 0) + loyalty));
  if (reward.research && save.galaxy?.resources) save.galaxy.resources.research = (Number(save.galaxy.resources.research) || 0) + reward.research;
  if (quest.id === 'ship-rook') markStationIntroHeardV188(save);
  // V188 colony and crew lot [PROPOSÉ]: colony, inventory and ship effects of §8.1.
  const population = reward.population ? addColonyPopulationV188(save, reward.population) : 0;
  const site = reward.colonySite ? advanceColonySiteV188(save, reward.colonySite, { build: true }) : null;
  const equipment = addOwned(save, 'equipmentIds', reward.equipment) ? reward.equipment : null;
  const weapon = addOwned(save, 'weaponIds', reward.weapon) ? reward.weapon : null;
  if (reward.crewStress && Array.isArray(save.crew)) for (const entry of save.crew) if (entry && Number.isFinite(Number(entry.stress))) entry.stress = Math.max(0, Math.min(100, Number(entry.stress) + reward.crewStress));
  if (reward.shipOxygen && save.hub?.systems && Number.isFinite(save.hub.systems.oxygen)) save.hub.systems.oxygen = Math.min(100, save.hub.systems.oxygen + reward.shipOxygen);
  return Object.freeze({ loyalty: member ? loyalty : 0, research: reward.research || 0, population, site, equipment, weapon });
}
const completionText = (quest, save, lang) => (quest.completionFor?.(save) || quest.completion)[lang];

/** Mutates the candidate save. A wrong reading costs nothing and keeps the step. */
export function answerCrewQuestStepV188(save, id, optionId, language = 'fr') {
  const lang = language === 'en' ? 'en' : 'fr', quest = getCrewQuestV188(id);
  const all = normalizeCrewQuestsV188(save?.crewQuestsV188), state = all.quests[id];
  if (!quest || quest.kind !== 'analysis' || state?.stage !== 'active') return { ok: false, reason: 'not-active' };
  if (!crewQuestGateOpenV188(save, id)) return { ok: false, reason: 'gated' };
  const current = quest.steps[state.step], chosen = current?.options.find(entry => entry.id === optionId);
  if (!chosen) return { ok: false, reason: 'unknown-option' };
  if (!chosen.correct) return { ok: true, correct: false, done: false,
    explain: lang === 'en' ? 'The evidence does not support this reading. Look again.' : 'Les éléments ne soutiennent pas cette lecture. Relisez.' };
  state.step += 1;
  const done = state.step >= quest.steps.length;
  if (done) { state.stage = 'done'; state.answer = optionId; }
  save.crewQuestsV188 = all;
  // The completion is read before the reward (BISHOP-9 answers from the trust earned so far).
  const completion = done ? completionText(quest, save, lang) : null;
  const reward = done ? grantReward(save, quest, optionId) : null;
  return { ok: true, correct: true, done, explain: current.explain[lang], completion, reward };
}

/** DAVID-8R: turn in the three components. Mutates the candidate save. */
export function turnInCrewQuestV188(save, id, language = 'fr') {
  const lang = language === 'en' ? 'en' : 'fr', quest = getCrewQuestV188(id);
  const all = normalizeCrewQuestsV188(save?.crewQuestsV188), state = all.quests[id];
  if (!quest || quest.kind !== 'components' || state?.stage !== 'active') return { ok: false, reason: 'not-active' };
  if (state.components < quest.components) return { ok: false, reason: 'missing-components' };
  state.stage = 'done'; save.crewQuestsV188 = all;
  return { ok: true, done: true, completion: completionText(quest, save, lang), reward: grantReward(save, quest, null) };
}

/** After an operation: a success brings back one item to each active collection quest it matches
 * (DAVID-8R and most others: an operation on Cocyte; Jun Park: a mission in a vent network). */
export function applyCrewQuestOperationResultV188(save, { success, worldId, objective = null, campaignId = null } = {}) {
  if (!success) return null;
  const all = normalizeCrewQuestsV188(save?.crewQuestsV188), changed = [], context = Object.freeze({ worldId, objective, campaignId });
  for (const quest of CREW_QUESTS_ALL_V188.filter(entry => entry.kind === 'components')) {
    const state = all.quests[quest.id];
    const matches = quest.collectWhen ? quest.collectWhen(context) : worldId === STATION_WORLD_ID_V188;
    if (matches && state?.stage === 'active' && state.components < quest.components) { state.components += 1; changed.push({ id: quest.id, components: state.components, needed: quest.components }); }
  }
  if (changed.length) save.crewQuestsV188 = all;
  return changed.length ? changed : null;
}

export const davidMemoryRestoredV188 = save => stateOf(save, 'ship-david')?.stage === 'done';
/** A finished quest that carries an epilogue line (ECHO-A, §8.1) adds it to the epilogue conversation.
 * `act5Phase` is passed by the caller (story-act5-v188.js), so this module does not import the Act. */
export function crewQuestEpilogueLineV188(save, crewId, language = 'fr', act5Phase = null) {
  if (!['epilogue', 'credits', 'complete'].includes(act5Phase)) return null;
  const quest = CREW_QUESTS_ALL_V188.find(entry => entry.crewId === crewId && entry.epilogueLine && stateOf(save, entry.id)?.stage === 'done');
  return quest ? quest.epilogueLine[language === 'en' ? 'en' : 'fr'] : null;
}
/** Notes the briefing table shows for finished quests whose effect is a clue (Kwan). */
export function crewQuestNotesV188(save, language = 'fr') {
  const lang = language === 'en' ? 'en' : 'fr', notes = [];
  if (stateOf(save, 'ship-kwan')?.stage === 'done') notes.push(lang === 'en' ? 'Interlude clue (Kwan): a preservation unit runs at night on the quarantine deck.' : 'Indice de l’Interlude (Kwan) : un caisson de conservation tourne la nuit au pont de quarantaine.');
  if (stateOf(save, 'ship-echo-a')?.stage === 'done') notes.push(lang === 'en' ? 'ECHO-A will speak in the epilogue.' : 'ECHO-A parlera à l’épilogue.');
  // A finished quest can carry its own note (`doneNote`, queens-crew-quests-v188.js).
  for (const quest of CREW_QUESTS_ALL_V188) if (quest.doneNote && stateOf(save, quest.id)?.stage === 'done') notes.push(quest.doneNote[lang]);
  return notes;
}
/** True when a quest is finished (the bestiary of the adaptations opens with `ship-q-harlow`). */
export const crewQuestDoneV188 = (save, id) => stateOf(save, id)?.stage === 'done';

/** Briefing-table list: every quest with its state and where to find its giver. */
export function crewQuestsSnapshotV188(save, language = 'fr') {
  const lang = language === 'en' ? 'en' : 'fr';
  return Object.freeze(CREW_QUESTS_ALL_V188.map(quest => {
    const state = stateOf(save, quest.id), offered = !state && quest.available(save);
    const status = state?.stage === 'done' ? 'done' : state ? 'active' : offered ? 'offered' : 'locked';
    const progress = quest.kind === 'components' && state ? `${state.components}/${quest.components}`
      : quest.kind === 'analysis' && state?.stage === 'active' ? `${state.step}/${quest.steps.length}` : null;
    return Object.freeze({ id: quest.id, giver: quest.giver, title: quest.title[lang], status, progress,
      where: quest.where[lang], after: quest.after[lang] });
  }));
}
