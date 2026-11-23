// Developer tools (spec 012; shipped hidden, see scripts/build-dev-tools-v188.mjs): coherent save fixtures for the
// hidden scene launcher. Every fixture starts from createDefaultSave() and only moves
// forward through the game's own rules:
//  - prologue steps are reached with the real advance* functions (onboarding, opening,
//    exercise, Port-Méridien) and the proving-ground receipt they require;
//  - a campaign is marked done only when the game's launch gates (station, Act V,
//    colony, Saison des Reines, world route) would let it start at that point, then the
//    same pure result functions the debrief transaction calls are applied;
//  - decisions (M577 manifest, Interlude, CASSIUS, C4, Grue, council, Rask, quay hearing,
//    endings, the live Praetorian) go through their own mutators; a hyperspace jump through
//    prepare/confirm; the seized egg's crisis through the hub crisis API and the hub's own event.
// The result is migrated (migrateSave) and checked with the save slot validator
// (inspectSaveSlotV78). What is not simulated is declared in `injections` (no resource
// rewards are paid for skipped missions; Act I evidence is recorded as found).
import { createDefaultSave, migrateSave } from '../src/save.js';
import { inspectSaveSlotV78 } from '../src/save-profile-v78.js';
import { CAMPAIGNS, WORLDS } from '../src/content.js';
import { createPlayerOnboardingV84, advancePlayerOnboardingV84 } from '../src/player-onboarding-v84.js';
import { createPlayerOpeningV88, advancePlayerOpeningV88, OPENING_POSTS_V88 } from '../src/player-opening-v88.js';
import { createOpeningExerciseV89 } from '../src/opening-exercise-v89.js';
import { createPortMeridienV90, PORT_PHASES_V90, PORT_RECEIPT_V90 } from '../src/port-meridien-v90.js';
import { applyProvingGroundQualificationV81, PROVING_GROUND_COURSE_ID_V81 } from '../src/hub-annex-services-v71.js';
import { markStoryDebriefSeenV188, normalizeStoryCampaignV188, startInterludeV188, interludeCrisisClearedV188, rescueJunParkV188,
  resolveInterludeV188, INTERLUDE_JUN_VENT_NODE_V188, deriveStoryCampaignV188, m577ManifestFromContainersV188 } from '../src/story-campaign-v188.js';
import { createHubCrisis, resolveHubCrisisEvent } from '../src/world-crisis-core.js';
import { filterUnlockedCampaignsV188, stationLockReasonV188, markStationIntroHeardV188, chooseCassiusV188, cassiusChoicePendingV188,
  stationReturnSceneDueV188, markStationSceneSeenV188 } from '../src/station-asphodele-v188.js';
import { filterAct5CampaignsV188, act5LockReasonV188, startAct5CouncilV188, decideAct5V188, act5StateV188, chooseAct5BridgeV188,
  act5BridgeDueV188, advanceAct5ToEndingV188, finishAct5EndingV188, finishAct5EpilogueV188, finishAct5CreditsV188,
  startAct5AudienceV188, applyAct5OperationResultV188, act5TableActionV188 } from '../src/story-act5-v188.js';
import { filterColonyCampaignsV188, colonyLockReasonV188, applyColonyMissionResultV188, chooseColonyC4V188, colonyC4DecisionPendingV188,
  colonyGrueDecisionPendingV188, chooseColonyGrueV188, colonyReturnSceneDueV188, markColonySceneSeenV188 } from '../src/colony-missions-v188.js';
import { filterQueensCampaignsV188, queensLockReasonV188, applyQueensOperationResultV188, receiveQueensCallV188, acceptQueensCallV188,
  recordQueensArrivalV188, queensReturnSceneDueV188, markQueensSceneSeenV188, chooseQueensRaskEggV188, queensRaskChoicePendingV188,
  queensCallDueV188, QUEENS_NACRE_WORLD_ID_V188, QUEENS_ARC1_ORDER_V188, QUEENS_ARC2_ORDER_V188, QUEENS_ECHO_WORLD_ID_V188, QUEENS_TR0_WORLD_ID_V188,
  queensSpecimenChoicePendingV188, chooseQueensSpecimenV188, queensEggCrisisDueV188, startQueensEggCrisisV188, resolveQueensEggCrisisV188,
  queensArcCompleteV188 } from '../src/side-campaign-queens-v188.js';
import { applyAsphodeleOperationResultV188 } from '../src/asphodele-missions-v188.js';
import { applyColonyOperationResultV188, investColonySiteV188, colonyTierV188, normalizeColonyV188, COLONY_SITE_IDS_V188 } from '../src/colony-reconstruction-v188.js';
import { COLONY_CAMPAIGNS_V188 } from '../src/colony-missions-v188.js';
import { applyCrewQuestOperationResultV188 } from '../src/crew-quests-v188.js';
import { boardAsphodeleV188, bringRelayOnlineV188, gruePactPendingV188, chooseGruePactV188, getAsphodeleRoomV188, doorLockV188,
  resolveAsphodeleHubV188 } from '../src/asphodele-hub-v188.js';
import { getCommandMissionsV110 } from '../src/player-surfaces-v110.js';
import { prepareJumpV116, confirmJumpV115, JUMP_CHARGE_MS_V116 } from '../src/galaxy-jump-v115.js';
import { startConfrontationV188 } from '../src/confrontation-v188.js';

export const DEV_FIXTURE_SCHEMA_V188 = 188;
export const DEV_LETHE_WORLD_V188 = 'world-05-lethe';
export const DEV_NOW_V188 = Date.UTC(2204, 0, 1, 6); // fixed clock: fixtures are reproducible

const clone = value => structuredClone(value);
const completed = save => save.galaxy.completedCampaignIds;
const campaign = id => CAMPAIGNS.find(entry => entry.id === id) || null;
const world = id => WORLDS.find(entry => entry.id === id) || null;

/** The launch gates of `launchCampaign` (app.js) on a save without an active operation, plus the
 * Command list filter chain (unlockedCampaignsV188 + getCommandMissionsV110). null = launchable. */
export function devCampaignBlockV188(save, id) {
  const entry = campaign(id);
  if (!entry) return 'unknown-campaign';
  const station = stationLockReasonV188(save, id); if (station) return `station:${station}`;
  const act5 = act5LockReasonV188(save, id); if (act5) return `act5:${act5}`;
  const colony = colonyLockReasonV188(save, id); if (colony) return `colony:${colony}`;
  const queens = queensLockReasonV188(save, id); if (queens) return `queens:${queens}`;
  const offered = filterQueensCampaignsV188(save, filterColonyCampaignsV188(save, filterAct5CampaignsV188(save, filterUnlockedCampaignsV188(save, [entry]))));
  if (!offered.length) return 'filtered';
  if (!getCommandMissionsV110(save, offered).length) return 'route';
  if (save.strategy?.currentOperation) return 'operation';
  return null;
}

// —— Base profiles ——
/** A veteran profile: the prologue markers stay absent (the migration's legacy path: "old
 * campaigns are never forced through a new tutorial"), docked over Cocyte. */
export function devVeteranSaveV188({ language = 'fr', difficulty = 'standard' } = {}) {
  const save = createDefaultSave(1);
  save.needsPlayerCreationV84 = false;
  save.scene = 'hub';
  save.worldId = DEV_LETHE_WORLD_V188; save.galaxy.shipWorldIdV116 = DEV_LETHE_WORLD_V188;
  save.settings.language = language === 'en' ? 'en' : 'fr';
  save.settings.difficulty = ['story', 'standard', 'nightmare', 'custom'].includes(difficulty) ? difficulty : 'standard';
  save.difficulty = save.settings.difficulty === 'custom' ? 'standard' : save.settings.difficulty;
  Object.assign(save.hub, { deck: 3, roomId: 'dropship-hangar', positionX: 470, facing: 1, visited: ['bridge', 'dropship-hangar'] });
  return save;
}

const IDENTITY = Object.freeze({ id: 'player-echo9', name: 'Echo Neuf', callsign: 'ECHO-9' });
/** A new timeline exactly as SaveSystem.newPlayerTimelineV84 writes it (cryo bay, every prologue marker at its start). */
export function devNewTimelineSaveV188(options = {}) {
  const save = devVeteranSaveV188(options);
  const onboarding = createPlayerOnboardingV84(IDENTITY);
  if (!onboarding) throw new Error('fixture: identity refused');
  save.onboardingV84 = onboarding;
  save.openingV88 = createPlayerOpeningV88();
  save.openingExerciseV89 = createOpeningExerciseV89();
  save.portMeridienV90 = createPortMeridienV90();
  Object.assign(save.player, { name: onboarding.identity.name, callsign: onboarding.identity.callsign, operatorId: onboarding.identity.id, classId: 'marine' });
  Object.assign(save.hub, { deck: 0, roomId: 'cryo-bay', positionX: 4560, facing: -1, visited: ['cryo-bay'] });
  save.worldId = WORLDS[0].id; save.galaxy.shipWorldIdV116 = WORLDS[0].id;
  return save;
}

// —— Prologue (bible §4): real advance functions ——
const ONBOARDING_EVENTS = Object.freeze({
  medical: ['wake-confirmed'],
  briefing: ['wake-confirmed', { type: 'medical-next', dialogueNode: 0 }, { type: 'medical-next', dialogueNode: 1 }, 'medical-complete'],
  complete: ['wake-confirmed', { type: 'medical-next', dialogueNode: 0 }, { type: 'medical-next', dialogueNode: 1 }, 'medical-complete',
    { type: 'briefing-next', dialogueNode: 0 }, { type: 'briefing-next', dialogueNode: 1 }, 'briefing-complete']
});
function advanceOnboarding(save, phase) {
  for (const event of ONBOARDING_EVENTS[phase] || []) {
    const result = advancePlayerOnboardingV84(save.onboardingV84, event);
    if (!result.ok) throw new Error(`fixture: onboarding ${phase} refused (${result.reason})`);
    save.onboardingV84 = result.state;
  }
}
const QUALIFICATION_ID = 'm41a-qualification-v81:session-1:qualification';
function advanceOpening(save, phase) {
  const steps = ['berth', 'armory', 'qualification', 'relay', 'signal', 'manifest', 'ready'];
  const target = steps.indexOf(phase);
  const evidence = extra => ({ onboardingComplete: true, physicalContact: true, ...extra });
  for (let index = 0; index < target; index += 1) {
    const current = save.openingV88.phase, post = OPENING_POSTS_V88[current];
    let events;
    if (current === 'berth') events = [['berth', evidence({ roomId: post.roomId })]];
    else if (current === 'armory') events = [['armory', evidence({ roomId: post.roomId, weaponIds: save.player.weaponIds })]];
    else if (current === 'qualification') {
      // The firing-pad receipt the proving ground writes (hub-annex-services-v71.js) is the qualification proof.
      const receipt = applyProvingGroundQualificationV81(save, { schemaVersion: 81, type: 'proving-ground-qualification', courseId: PROVING_GROUND_COURSE_ID_V81,
        qualified: true, bonus: { nextOperationCharge: true }, id: QUALIFICATION_ID, score: 3 });
      if (!receipt.applied) throw new Error(`fixture: proving-ground receipt refused (${receipt.reason})`);
      save.openingExerciseV89 = { schema: 89, phase: 'complete', sessionId: 'm41a-qualification-v81:session-1' };
      events = [['qualified', { onboardingComplete: true, qualificationId: QUALIFICATION_ID,
        qualificationReceiptIds: save.hub.annexOperationsV71.provingGround.qualificationReceiptIdsV81 }]];
    } else if (current === 'relay') events = [['relay', evidence({ roomId: post.roomId, relaySeconds: 3 })]];
    else if (current === 'signal') events = [0, 1, 2].map(node => [{ type: 'signal-next', node }, evidence({ roomId: post.roomId })]);
    else if (current === 'manifest') events = [[{ type: 'freight', freight: 'medical' }, evidence({ roomId: post.roomId })]];
    for (const [event, proof] of events) {
      const result = advancePlayerOpeningV88(save.openingV88, event, proof);
      if (!result.ok) throw new Error(`fixture: opening ${current} refused (${result.reason})`);
      save.openingV88 = result.state;
    }
  }
}
/** Port-Méridien (P-3) phases are written in the shape normalizePortMeridienV90 accepts at that phase. */
function portAt(phase) {
  const state = createPortMeridienV90();
  const index = PORT_PHASES_V90.indexOf(phase);
  if (index < 0) throw new Error(`fixture: unknown port phase ${phase}`);
  return { ...state, phase, revision: index, freight: index >= 1 ? 'medical' : null, receipt: phase === 'complete' ? PORT_RECEIPT_V90 : null };
}
const HUB_POSE = Object.freeze({
  'cryo-bay': { deck: 0, roomId: 'cryo-bay', positionX: 4560, facing: -1 },
  'crew-quarters': { deck: 1, roomId: 'crew-quarters', positionX: 950, facing: 1 },
  armory: { deck: 2, roomId: 'armory', positionX: 1505, facing: 1 },
  reactor: { deck: 3, roomId: 'reactor', positionX: 1500, facing: 1 },
  bridge: { deck: 0, roomId: 'bridge', positionX: 900, facing: 1 },
  'dropship-hangar': { deck: 3, roomId: 'dropship-hangar', positionX: 470, facing: 1 },
  briefing: { deck: 0, roomId: 'briefing', positionX: 1780, facing: 1 }
});
export const DEV_PROLOGUE_STEPS_V188 = Object.freeze([
  { id: 'p1-wake', fr: 'P-1 · Réveil en cryostase', en: 'P-1 · Cryosleep wake', onboarding: null, room: 'cryo-bay', step: 'wake' },
  { id: 'p1-medical', fr: 'P-1 · Accueil DAVID-8R', en: 'P-1 · DAVID-8R welcome', onboarding: 'medical', room: 'cryo-bay', step: 'wake' },
  { id: 'p1-briefing', fr: 'P-1 · Consignes de Velez', en: 'P-1 · Velez instructions', onboarding: 'briefing', room: 'briefing', step: 'wake' },
  { id: 'p2-berth', fr: 'P-2 · Couchette', en: 'P-2 · Berth', onboarding: 'complete', opening: 'berth', room: 'crew-quarters', step: 'ship' },
  { id: 'p2-armory', fr: 'P-2 · Armurerie', en: 'P-2 · Armory', onboarding: 'complete', opening: 'armory', room: 'armory', step: 'ship' },
  { id: 'p2-qualification', fr: 'P-2 · Qualification au pas de tir', en: 'P-2 · Firing-pad qualification', onboarding: 'complete', opening: 'qualification', room: 'armory', step: 'ship' },
  { id: 'p2-exercise-console', fr: 'P-2 · Exercice interrompu · console', en: 'P-2 · Interrupted drill · console', onboarding: 'complete', opening: 'qualification', exercise: 'console', room: 'armory', step: 'ship' },
  { id: 'p2-exercise-return', fr: 'P-2 · Exercice interrompu · retour au pas de tir', en: 'P-2 · Interrupted drill · back to the pad', onboarding: 'complete', opening: 'qualification', exercise: 'return', room: 'armory', step: 'ship' },
  { id: 'p2-relay', fr: 'P-2 · Relais du réacteur', en: 'P-2 · Reactor relay', onboarding: 'complete', opening: 'relay', room: 'reactor', step: 'ship' },
  { id: 'p2-signal', fr: 'P-2 · Signal de détresse', en: 'P-2 · Distress signal', onboarding: 'complete', opening: 'signal', room: 'bridge', step: 'ship' },
  { id: 'p2-manifest', fr: 'P-2 · Fret de secours', en: 'P-2 · Relief freight', onboarding: 'complete', opening: 'manifest', room: 'dropship-hangar', step: 'ship' },
  ...['pending', 'unload', 'carry', 'triage', 'power', 'escort', 'report'].map(phase => ({ id: `p3-${phase}`,
    fr: `P-3 · Quai des vivants · ${phase}`, en: `P-3 · Quay of the living · ${phase}`, onboarding: 'complete', opening: 'ready', port: phase,
    // Once boarded, the hub is the Port-Méridien quay (hub-port-meridien-v90.js); the ship pose stays the drop hangar.
    room: phase === 'pending' ? 'briefing' : 'dropship-hangar', landRoom: phase === 'pending' ? null : 'port-meridien-quay', step: 'port' })),
  { id: 'p3-complete', fr: 'Fin du prologue · briefing QZ-18', en: 'End of prologue · QZ-18 briefing', onboarding: 'complete', opening: 'ready', port: 'complete', room: 'briefing', step: 'briefing' }
]);
export function devPrologueSaveV188(stepId, options = {}) {
  const step = DEV_PROLOGUE_STEPS_V188.find(entry => entry.id === stepId);
  if (!step) throw new Error(`fixture: unknown prologue step ${stepId}`);
  const save = devNewTimelineSaveV188(options);
  if (step.onboarding) advanceOnboarding(save, step.onboarding);
  if (step.opening) advanceOpening(save, step.opening);
  // The interrupted drill (opening-exercise-v89.js) is mid-way on the session the firing pad opened.
  if (step.exercise) save.openingExerciseV89 = { schema: 89, phase: step.exercise, sessionId: 'm41a-qualification-v81:session-1' };
  if (step.port) save.portMeridienV90 = portAt(step.port);
  Object.assign(save.hub, HUB_POSE[step.room], { visited: [...new Set([...save.hub.visited, HUB_POSE[step.room].roomId])] });
  return save;
}

// —— Campaign progression ——
const MAIN_ORDER = Object.freeze(['special-archive-relay', 'special-narrative-qz17', 'special-apc-convoy', 'special-c12-horde', 'special-black-cocoon']);
const STATION_MAIN = Object.freeze(['station-s1', 'station-s2', 'station-s3', 'station-s4']);
const COLONY_MAIN = Object.freeze(['colony-c1', 'colony-c2', 'colony-c3', 'colony-c4']);

// A choice set to false is left pending (the launcher entry opens on that decision).
function applyPendingDecisions(save, choices) {
  if (choices.cassius !== false && cassiusChoicePendingV188(save)) chooseCassiusV188(save, choices.cassius || 'rewrite');
  if (choices.c4 !== false && colonyC4DecisionPendingV188(save)) chooseColonyC4V188(save, choices.c4 || 'quarantine');
  if (choices.colonyGrue !== false && colonyGrueDecisionPendingV188(save)) chooseColonyGrueV188(save, choices.colonyGrue || 'accept');
  if (choices.grue !== false && gruePactPendingV188(save)) chooseGruePactV188(save, choices.grue || 'accept');
  if (choices.rask !== false && queensRaskChoicePendingV188(save)) chooseQueensRaskEggV188(save, choices.rask || 'destroy');
  if (choices.specimen !== false && queensSpecimenChoicePendingV188(save)) chooseQueensSpecimenV188(save, choices.specimen || 'inez');
  if (choices.scenes === false) return;
  // Return scenes are read (as after a debrief): they would otherwise reopen over the target.
  for (let guard = 0; guard < 24; guard += 1) {
    const station = stationReturnSceneDueV188(save), colony = colonyReturnSceneDueV188(save), queens = queensReturnSceneDueV188(save);
    if (!station && !colony && !queens) break;
    if (station) markStationSceneSeenV188(save, station);
    if (colony) markColonySceneSeenV188(save, colony);
    if (queens) markQueensSceneSeenV188(save, queens);
  }
}

/** Local contracts repeat (station, colony, Nacre-7) as in the game; other missions count once. */
export const devRepeatableCampaignV188 = id => Boolean(campaign(id)?.replayableV188) || /^(?:station-c-|colony-l-|queens-l-)/.test(id);

/** Marks one campaign done if, and only if, the game would let it start now. */
export function devCompleteCampaignV188(save, id, ledger, choices = {}) {
  if (completed(save).includes(id) && !devRepeatableCampaignV188(id)) return;
  const block = devCampaignBlockV188(save, id);
  if (block) throw new Error(`fixture: ${id} is not launchable yet (${block})`);
  // Act III's manifest is signed before the convoy leaves (app.js launchCampaign).
  if (id === 'special-apc-convoy' && !normalizeStoryCampaignV188(save.storyCampaignV188).m577Manifest) {
    const story = normalizeStoryCampaignV188(save.storyCampaignV188);
    story.m577Manifest = m577ManifestFromContainersV188(choices.containers ?? 2); save.storyCampaignV188 = story;
  }
  if (!completed(save).includes(id)) completed(save).push(id);
  ledger.completed.push(id);
  const operationId = `operation-dev-${ledger.completed.length}-${id}`;
  const worldId = campaign(id).worldId;
  applyColonyMissionResultV188(save, { success: true, campaignId: id });
  applyColonyOperationResultV188(save, { success: true, worldId });
  applyCrewQuestOperationResultV188(save, { success: true, worldId, objective: campaign(id).objective || null, campaignId: id });
  applyAsphodeleOperationResultV188(save, { success: true, campaignId: id, operationId });
  if (id === 'act5-last-run' && act5BridgeDueV188(save, id)) chooseAct5BridgeV188(save, choices.bridge || 'freight');
  applyAct5OperationResultV188(save, { success: true, campaignId: id });
  applyQueensOperationResultV188(save, { success: true, campaignId: id });
  markStoryDebriefSeenV188(save, id);
  if (id === 'special-apc-convoy') {
    const story = normalizeStoryCampaignV188(save.storyCampaignV188);
    if (story.m577Manifest && !story.m577Manifest.resolved) { story.m577Manifest = { ...story.m577Manifest, resolved: true }; save.storyCampaignV188 = story; }
  }
  if (id === 'special-archive-relay' && choices.stationIntro !== false) markStationIntroHeardV188(save);
  applyPendingDecisions(save, choices);
}

/** Interlude (bible §5.4): CIN-40's crisis, cleared, Jun rescued, then the choice. */
function playInterlude(save, upTo = 'resolved', outcome = 'destroyed') {
  const crisis = startInterludeV188(save, createHubCrisis);
  if (!crisis) throw new Error('fixture: Interlude not due');
  if (upTo === 'alert') return;
  // The crisis is resolved by the hub; the record is the same one world-crisis writes on success.
  save.hub.activeCrisis = { ...save.hub.activeCrisis, resolved: true };
  interludeCrisisClearedV188(save, crisis.id);
  rescueJunParkV188(save, INTERLUDE_JUN_VENT_NODE_V188);
  if (upTo === 'choice') return;
  resolveInterludeV188(save, outcome);
  save.hub.activeCrisis = null;
}

/** Milestones of the main campaign in the bible's chronology (§3), cumulative. */
export const DEV_MILESTONES_V188 = Object.freeze(['act2', 'act1', 'act3', 'interlude', 'act4', 'stations', 'colony', 'council', 'act5-final', 'act5-done', 'complete']);
function progress(save, milestone, ledger, choices = {}) {
  const level = DEV_MILESTONES_V188.indexOf(milestone);
  const at = name => level >= DEV_MILESTONES_V188.indexOf(name);
  const done = id => devCompleteCampaignV188(save, id, ledger, choices);
  if (at('act2')) done('special-archive-relay');
  if (at('act1')) {
    done('special-narrative-qz17');
    // Act I evidence collected in the QZ-17 holds (declared): the two archive entries of the PDA/email contradiction.
    const archives = save.narrativeArchives;
    archives.discovered = { ...archives.discovered, 'qz17-pda-loading-chief': { id: 'qz17-pda-loading-chief' }, 'qz17-email-logistics-denial': { id: 'qz17-email-logistics-denial' } };
    ledger.injections.add('act1-evidence');
  }
  if (at('act3')) { done('station-s1'); done('colony-c1'); done('colony-a-quai'); done('special-apc-convoy'); done('special-c12-horde'); }
  if (at('interlude')) playInterlude(save, 'resolved', choices.interlude || 'destroyed');
  if (at('act4')) { done('station-s2'); done('colony-c2'); done('special-black-cocoon'); }
  if (at('stations')) { done('station-s3'); done('station-s4'); if (choices.relay) openRelayRoom(save, ledger); }
  if (at('colony')) { done('colony-c3'); done('colony-c4'); }
  if (at('council')) startAct5CouncilV188(save);
  if (at('act5-final')) {
    if (!decideAct5V188(save, choices.line || 'hold', save.settings.language)) throw new Error('fixture: council decision refused');
    if (act5StateV188(save).phase !== 'final') throw new Error('fixture: council did not reach the final missions');
  }
  if (at('act5-done')) for (const id of act5Path(save)) done(id);
  if (at('complete')) {
    if (act5TableActionV188(save) === 'audience') ledger.injections.add('quay-hearing-default-outcome');
    advanceAct5ToEndingV188(save); finishAct5EndingV188(save); finishAct5EpilogueV188(save); finishAct5CreditsV188(save);
  }
}
const act5Path = save => {
  const option = act5StateV188(save).decision?.option;
  return ['act5-last-run', 'act5-depot-queen', option === 'cede' ? 'act5-evacuation' : 'act5-port-walls'];
};

/** Relay room online (spec 007): three « Relais en dérive » contracts, then the transmission bays. */
function openRelayRoom(save, ledger) {
  for (let count = 0; count < 3; count += 1) devCompleteCampaignV188(save, 'station-c-relais', ledger);
  bringRelayOnlineV188(save);
}

/** Port-Méridien tiers (bible §6.3): sites are paid with investColonySiteV188 and validated by the
 * local contract of that site, as the game requires after C1. Resources are topped up (declared). */
function buildColonyTier(save, ledger, tier) {
  const rank = id => ['survival', 'restored', 'autonomous', 'free'].indexOf(id);
  for (let guard = 0; guard < 40 && rank(colonyTierV188(save.colonyV188)) < rank(tier); guard += 1) {
    const sites = normalizeColonyV188(save.colonyV188).sites;
    const siteId = COLONY_SITE_IDS_V188.filter(id => sites[id].invested < 2 && sites[id].invested === sites[id].validated)
      .sort((a, b) => sites[a].invested - sites[b].invested)
      .find(id => COLONY_CAMPAIGNS_V188.some(entry => entry.replayableV188 && entry.siteV188 === id && !devCampaignBlockV188(save, entry.id)));
    if (!siteId) break;
    const resources = save.galaxy.resources;
    Object.assign(resources, { credits: Math.max(resources.credits, 4000), alloy: Math.max(resources.alloy, 200), research: Math.max(resources.research, 40) });
    ledger.injections.add('colony-resources-topped-up');
    const paid = investColonySiteV188(save, siteId);
    if (!paid.ok) throw new Error(`fixture: colony site ${siteId} refused (${paid.reason})`);
    const contract = COLONY_CAMPAIGNS_V188.find(entry => entry.replayableV188 && entry.siteV188 === siteId && !devCampaignBlockV188(save, entry.id));
    devCompleteCampaignV188(save, contract.id, ledger);
  }
  if (rank(colonyTierV188(save.colonyV188)) < rank(tier)) throw new Error(`fixture: colony tier ${tier} not reached`);
}

// —— Saison des Reines (spec 011) ——
function queensCall(save, ledger, upTo) {
  if (!queensCallDueV188(save)) save.clock.day = Math.max(save.clock.day, 120); // the call arrives days after the epilogue
  if (!receiveQueensCallV188(save)) throw new Error('fixture: Nacre-7 call not due');
  if (upTo === 'call') return;
  acceptQueensCallV188(save);
  if (upTo === 'accepted') return;
  const destination = world(QUEENS_NACRE_WORLD_ID_V188);
  save.galaxy.resources.fuel = Math.max(save.galaxy.resources.fuel, 40);
  prepareJumpV116(save, destination, WORLDS, DEV_NOW_V188);
  if (upTo === 'travel') return;
  const settlement = confirmJumpV115(save, destination, WORLDS, DEV_NOW_V188 + JUMP_CHARGE_MS_V116);
  recordQueensArrivalV188(save, settlement);
  ledger.injections.add('jump-fuel-topped-up');
}
// A later jump of the campaign (Echo Basin, TR-0): the real prepare/confirm, at a later fixed clock value.
function queensJump(save, ledger, worldId, leg) {
  const destination = world(worldId), now = DEV_NOW_V188 + leg * 10 * JUMP_CHARGE_MS_V116;
  save.galaxy.resources.fuel = Math.max(save.galaxy.resources.fuel, 40);
  prepareJumpV116(save, destination, WORLDS, now);
  const settlement = confirmJumpV115(save, destination, WORLDS, now + JUMP_CHARGE_MS_V116);
  if (settlement?.status !== 'arrived') throw new Error(`fixture: jump to ${worldId} refused`);
  recordQueensArrivalV188(save, settlement);
  ledger.injections.add('jump-fuel-topped-up');
}
/**
 * Arc 2 (`arc` 2): Arc 1 finished with its decision, the Tantalus in Echo Basin's orbit.
 * Arc 3 (`arc` 3): Arc 2 finished too, the Tantalus in TR-0's orbit. With a seized egg the crisis breaks
 * out on arrival (hub crisis API); `egg` 'alert' leaves it running, otherwise the hub's own
 * `crisis:resolved` event (or `crisis:player-down` for `egg` 'extracted') ends it.
 */
function queensArc(save, ledger, arc, choices, egg) {
  for (const id of QUEENS_ARC1_ORDER_V188) devCompleteCampaignV188(save, id, ledger, choices);
  if (!queensArcCompleteV188(save, 1)) throw new Error('fixture: Arc 1 needs its decision before Arc 2');
  queensJump(save, ledger, QUEENS_ECHO_WORLD_ID_V188, 1);
  if (arc < 3) return;
  for (const id of QUEENS_ARC2_ORDER_V188) devCompleteCampaignV188(save, id, ledger, choices);
  queensJump(save, ledger, QUEENS_TR0_WORLD_ID_V188, 2);
  if (!queensEggCrisisDueV188(save)) return;
  const crisis = startQueensEggCrisisV188(save, createHubCrisis);
  if (!crisis) throw new Error('fixture: the egg crisis did not start');
  if (egg === 'alert') return;
  const result = resolveHubCrisisEvent(save, { action: egg === 'extracted' ? 'crisis:player-down' : 'crisis:resolved', kind: crisis.kind, crisisId: crisis.id });
  if (!result.handled || !resolveQueensEggCrisisV188(save, result.crisis.id, result.outcome)) throw new Error('fixture: the egg crisis did not end');
  ledger.injections.add('egg-crisis-hub-event');
}

/** Builds the save for a launch descriptor (see dev-catalog-v188.js). */
export function buildDevSaveV188(launch, options = {}) {
  const ledger = { completed: [], injections: new Set() };
  const choices = launch.choices || {};
  let save;
  if (launch.base === 'default') {
    save = createDefaultSave(1);
    save.settings.language = options.language === 'en' ? 'en' : 'fr';
    if (launch.kind === 'title' || launch.kind === 'creator') save.scene = 'title';
  } else if (launch.base === 'prologue') save = devPrologueSaveV188(launch.step, options);
  else save = devVeteranSaveV188(options);
  if (launch.milestone) progress(save, launch.milestone, ledger, choices);
  if (launch.relay && !choices.relay) openRelayRoom(save, ledger);
  if (launch.colonyTier) buildColonyTier(save, ledger, launch.colonyTier);
  for (const id of launch.before || []) devCompleteCampaignV188(save, id, ledger, choices);
  if (launch.interlude) playInterlude(save, launch.interlude, choices.interlude || 'destroyed');
  if (launch.queens) queensCall(save, ledger, launch.queens);
  if (launch.queensArc) queensArc(save, ledger, launch.queensArc, choices, launch.queensEgg);
  if (launch.queensBefore) for (const id of launch.queensBefore) devCompleteCampaignV188(save, id, ledger, choices);
  // Scenes and debriefs already read at the table, so the entry opens on the one it names.
  for (const id of launch.queensSeen || []) if (!markQueensSceneSeenV188(save, id)) throw new Error(`fixture: scene ${id} is not due`);
  if (launch.act5Phase === 'audience') { startAct5AudienceV188(save); }
  if (launch.act5Phase === 'ending' || launch.act5Phase === 'epilogue' || launch.act5Phase === 'credits') {
    advanceAct5ToEndingV188(save);
    if (launch.act5Phase !== 'ending') finishAct5EndingV188(save);
    if (launch.act5Phase === 'credits') finishAct5EpilogueV188(save);
  }
  if (launch.confrontation) startConfrontationV188(save, launch.confrontation);
  if (launch.worldId) {
    // A campaign on another world: the route is opened as a reconnaissance would, and the Tantalus is in that system.
    if (!save.galaxy.unlockedWorldIds.includes(launch.worldId)) { save.galaxy.unlockedWorldIds.push(launch.worldId); ledger.injections.add('world-route-opened'); }
  }
  if (launch.asphodele) {
    if (!boardAsphodeleV188(save)) throw new Error('fixture: the UD-4L cannot board Asphodèle');
    const room = getAsphodeleRoomV188(launch.asphodele);
    if (!room || doorLockV188(save, room.id, null)) throw new Error(`fixture: Asphodèle room ${launch.asphodele} is locked`);
    save.asphodeleHubV188 = { ...save.asphodeleHubV188, roomId: room.id, x: Math.max(24, room.doors[0].x - 22), z: 0,
      visited: [...new Set([...(save.asphodeleHubV188.visited || []), room.id])] };
  }
  if (launch.hub) {
    Object.assign(save.hub, launch.hub, { visited: [...new Set([...save.hub.visited, launch.hub.roomId])] });
  }
  if (launch.kind === 'view' || launch.kind === 'mission' || launch.kind === 'range') save.scene = 'hub';
  if (launch.campaignId && (launch.kind === 'mission' || launch.kind === 'range')) {
    const block = devCampaignBlockV188(save, launch.campaignId);
    if (block) throw new Error(`fixture: target ${launch.campaignId} blocked (${block})`);
    save.strategy.plannedCampaignId = launch.campaignId;
  }
  const migrated = migrateSave(clone(save), 1);
  const inspection = inspectSaveSlotV78(JSON.stringify(migrated));
  if (inspection.status !== 'ready') throw new Error(`fixture: save validator refused (${inspection.status})`);
  return { save: migrated, completed: ledger.completed, injections: [...ledger.injections].sort(), inspection: inspection.status };
}

/** Facts a test (or the launcher's info line) checks on a built save. */
export function devFixtureFactsV188(save) {
  const story = normalizeStoryCampaignV188(save.storyCampaignV188);
  return {
    step: deriveStoryCampaignV188(save, { language: 'fr' }).step,
    scene: save.scene,
    room: save.hub?.roomId || null,
    asphodele: resolveAsphodeleHubV188(save),
    act5: act5StateV188(save),
    interlude: story.interlude?.phase || null,
    completed: [...save.galaxy.completedCampaignIds]
  };
}
export { MAIN_ORDER as DEV_MAIN_ORDER_V188, STATION_MAIN as DEV_STATION_MAIN_V188, COLONY_MAIN as DEV_COLONY_MAIN_V188, QUEENS_ARC1_ORDER_V188 };

// —— Dev session (what the launcher hands to the isolated game page) ——
export const DEV_SESSION_KEY_V188 = 'atf-dev-session-v188';
export const DEV_PROFILE_KEY_V188 = 'atf-v47-profile-1';
export const DEV_SELECTED_PROFILE_KEY_V188 = 'atf-v78-selected-profile';
export const DEV_LANGUAGE_KEY_V188 = 'atf-language-v185';
/** The whole isolated storage of a session: profile 1 (the fixture), the selected-profile
 * marker and the language. Nothing from the player's own localStorage is copied. */
export function buildDevSessionV188(entry, { language = 'fr', difficulty = 'standard', toggles = {} } = {}) {
  if (entry.blocked) throw new Error(`fixture: ${entry.id} is not available (${entry.blocked})`);
  const built = buildDevSaveV188(entry.launch, { language, difficulty });
  const storage = { [DEV_PROFILE_KEY_V188]: JSON.stringify(built.save), [DEV_SELECTED_PROFILE_KEY_V188]: '1', [DEV_LANGUAGE_KEY_V188]: language === 'en' ? 'en' : 'fr' };
  return { schema: DEV_FIXTURE_SCHEMA_V188, entryId: entry.id, sceneId: entry.sceneId, launch: entry.launch, toggles: { ...toggles },
    storage, initialStorage: { ...storage }, completed: built.completed, injections: built.injections, inspection: built.inspection };
}
