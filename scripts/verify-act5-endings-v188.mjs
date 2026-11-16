// V188 spec 006: Act V « Non viable », war council, final choice, final missions,
// the three endings, the epilogue and the after-campaign state. Access, each
// ending reachable, the epilogue from earlier choices, save round trip, resume
// at each step, old saves and FR/EN. Fixtures are built here from createDefaultSave.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { CAMPAIGNS, validateContent } from '../src/content.js';
import { selectMissionTemplateV52 } from '../src/mission-levels-v52.js';
import { resolveMissionRegisterV188 } from '../src/mission-register-v188.js';
import { normalizeStoryCampaignV188 } from '../src/story-campaign-v188.js';
import { storyDossierV188 } from '../src/story-dossier-v188.js';
import { CINEMATICS_V188, cinematicDurationV188, drawCinematicFrameV188 } from '../src/story-cinematics-v188.js';
import { ACT5_SLOTS_V188, ACT5_SLOT_IDS_V188, ACT5_FILES_PRESENT_V188, Act5AssetLoaderV188 } from '../src/act5-slots-v188.js';
import {
  ACT5_CAMPAIGNS_V188, ACT5_CAMPAIGN_IDS_V188, ACT5_NAMES_EN_V188, act5OpenV188, act5StateV188, act5LockReasonV188, act5LockTextV188,
  filterAct5CampaignsV188, act5MissionPathV188, startAct5CouncilV188, act5CouncilV188, decideAct5V188, applyAct5LaunchAdvantagesV188,
  act5BridgeDueV188, act5BridgeSecondsV188, chooseAct5BridgeV188, act5LateColonistsSavedV188, applyAct5OperationResultV188, act5TableActionV188,
  advanceAct5ToEndingV188, act5EndingSummaryV188, finishAct5EndingV188, act5RollCallV188, act5EpilogueV188, act5CrewEpilogueLineV188,
  markAct5EpilogueTalkV188, act5LockerLabelV188, finishAct5EpilogueV188, finishAct5CreditsV188, act5CompleteV188, act5ObjectiveV188,
  deriveStoryWithAct5V188, act5SnapshotV188, act5CinematicContextV188, normalizeAct5V188, ACT5_ADVISORS_V188, ACT5_CREW_EPILOGUE_V188,
  ACT5_ORIGIN_RETURN_LINES_V188, ACT5_BRIDGE_TEXT_V188, ACT5_STANDOFF_TEXT_V188, ACT5_CREDITS_V188, ACT5_ENDING_CINEMATICS_V188, act5NextMissionV188
} from '../src/story-act5-v188.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const roundTrip = save => migrateSave(JSON.parse(JSON.stringify(save)));
const complete = (save, id) => { if (!save.galaxy.completedCampaignIds.includes(id)) save.galaxy.completedCampaignIds.push(id); };
const loyalty = (save, id, value) => { save.crew.find(member => member.id === id).loyalty = value; };
const FOUR = ['special-archive-relay', 'special-apc-convoy', 'special-c12-horde', 'special-black-cocoon'];
const STATION = ['station-s1', 'station-s2', 'station-s3', 'station-s4'];
// The relay room belongs to the Asphodèle hub (asphodeleRelayReadyV188, merged separately): finalChoiceOptionsV188
// reads it by default. These tests pass it through the `context` override, as the council and decision allow.
const RELAY_READY = new WeakSet();
const ctxOf = save => RELAY_READY.has(save) ? { relayRoomOpen: true } : {};
const decide = (save, recommended, language = 'fr') => decideAct5V188(save, recommended, language, ctxOf(save));
const council = (save, language = 'fr') => act5CouncilV188(save, language, ctxOf(save));

/** A save at the Act V threshold (4 dossier pieces: Interlude, Act IV, CASSIUS + Act I's lead with `five`; Act II with `six`). */
function threshold({ station = true, cassius = 'rewrite', relays = 0, outcome = 'captured', containers = 1, vega = 60, five = false, six = false } = {}) {
  const save = createDefaultSave();
  for (const id of FOUR) complete(save, id);
  if (station) for (const id of STATION) complete(save, id);
  const story = normalizeStoryCampaignV188(save.storyCampaignV188);
  story.debriefSeen.push('special-black-cocoon');
  story.m577Manifest = { containers, colonists: 6 - containers * 2, resolved: true };
  story.interlude = { phase: 'resolved', crisisId: 'crisis-test', outcome };
  save.storyCampaignV188 = story;
  if (station) save.stationV188 = { schema: 188, introHeard: true, cassius, scenesSeen: ['s1', 's3', 's4'] };
  if (five) save.narrativeArchives = { ...save.narrativeArchives,
    discovered: { ...save.narrativeArchives.discovered, 'qz17-pda-loading-chief': { id: 'qz17-pda-loading-chief' }, 'qz17-email-logistics-denial': { id: 'qz17-email-logistics-denial' } },
    unlockedFlags: ['qz17-maintenance-bypass'] };
  // six: also Act II's verdict with Rook's signature (the 18:43 priority piece); read before any migration.
  if (six) { save.archiveRelayArchivesV122 = { case: { verdict: 'delayed-distress' } }; save.storyCampaignV188.cinematicsSeen.push('cin-20-rook'); }
  loyalty(save, 'crew-01-mara-vega', vega);
  if (relays) RELAY_READY.add(save);
  return save;
}
/** Plays the final missions of the decided line (success each time, resolution like finalizeOperation). */
function playFinal(save, { bridge = 'freight' } = {}) {
  for (const id of act5MissionPathV188(act5StateV188(save).decision.option)) {
    assert.equal(act5LockReasonV188(save, id), null, `${id} unlocked in order`);
    if (id === 'act5-last-run' && bridge) assert.equal(chooseAct5BridgeV188(save, bridge), true);
    applyAct5OperationResultV188(save, { success: true, campaignId: id });
    complete(save, id);
  }
}
function toEnding(save, recommended, options) {
  assert.equal(startAct5CouncilV188(save), true);
  const decision = decide(save, recommended);
  assert.ok(decision, `decision for ${recommended}`);
  playFinal(save, options);
  assert.ok(['standoff', 'to-ending'].includes(act5TableActionV188(save)));
  advanceAct5ToEndingV188(save);
  return decision;
}

// —— Content, loading and art slots ——
test('content: five Act V missions on Cocyte from existing templates, registers, ids unchanged elsewhere', () => {
  assert.deepEqual(ACT5_CAMPAIGN_IDS_V188, ['act5-last-run', 'act5-depot-queen', 'act5-port-walls', 'act5-evacuation']);
  assert.equal(validateContent().ok, true);
  assert.equal(CAMPAIGNS.length, 496); // + orig-asphodele-2 (spec 007 follow-up), + 19 Port-Méridien missions and contracts
  for (const campaign of ACT5_CAMPAIGNS_V188) {
    assert.ok(CAMPAIGNS.some(entry => entry.id === campaign.id), campaign.id);
    assert.equal(selectMissionTemplateV52({ campaign }), campaign.templateId, campaign.id);
    assert.equal(resolveMissionRegisterV188(campaign), campaign.registerV188);
    assert.equal(campaign.worldId, 'world-05-lethe');
  }
  for (const id of [...FOUR, ...STATION, 'special-narrative-qz17']) assert.ok(CAMPAIGNS.some(entry => entry.id === id), id);
  const sw = read('sw.js');
  for (const module of ['story-act5-state-v188.js', 'story-act5-v188.js', 'act5-slots-v188.js']) assert.ok(sw.includes(`'/src/${module}'`), module);
  assert.match(read('index.html'), /id="act5-panel-v188"/);
});

test('art slots: every Act V slot has a brief, draws a primitive placeholder, requests nothing until committed', () => {
  assert.equal(ACT5_SLOTS_V188.length, 15); assert.deepEqual(ACT5_FILES_PRESENT_V188, []);
  const ctx = new Proxy({ measureText: value => ({ width: String(value).length * 9 }), createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) },
    { get: (object, key) => key in object ? object[key] : () => {} });
  const loader = new Act5AssetLoaderV188({ ImageCtor: class { constructor() { throw new Error('no request expected'); } } });
  assert.deepEqual(loader.preload(), []);
  for (const entry of ACT5_SLOTS_V188) {
    assert.ok(entry.brief.length > 40 && entry.purpose && entry.path.startsWith('/assets/act5/v188/'), entry.id);
    assert.equal(loader.draw(ctx, entry.id, entry.width, entry.height, { language: 'en', context: { rollCall: 7, lockerLabel: 'X' }, progress: .5 }), 'primitive');
  }
  assert.throws(() => loader.draw(ctx, 'nope', 10, 10), /Unknown Act V art slot/);
});

test('cinematics: CIN-60 30 s, CIN-61 45 s, the three CIN-90 endings 60 s, epilogue and credits draw from the save', () => {
  assert.equal(cinematicDurationV188('cin-60'), 30); assert.equal(cinematicDurationV188('cin-61'), 45);
  for (const id of Object.values(ACT5_ENDING_CINEMATICS_V188)) { assert.ok(CINEMATICS_V188[id], id); assert.equal(cinematicDurationV188(id), 60); assert.equal(CINEMATICS_V188[id].music, 'ending'); }
  assert.ok(CINEMATICS_V188['cin-92'] && CINEMATICS_V188['cin-99-credits']);
  const texts = [];
  const ctx = new Proxy({ measureText: value => ({ width: String(value).length * 9 }), createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }),
    fillText(value) { texts.push(String(value)); } }, { get: (object, key) => key in object ? object[key] : () => {} });
  const save = threshold({ relays: 3, five: true }); toEnding(save, 'transmit');
  const act5 = act5CinematicContextV188(save, 'en');
  drawCinematicFrameV188(ctx, 'cin-90-relay', 50, { language: 'en', context: { act5 } });
  assert.ok(texts.includes('The relay speaks')); assert.ok(texts.some(text => /ICC/.test(text)));
  texts.length = 0; drawCinematicFrameV188(ctx, 'cin-99-credits', 2, { language: 'en', context: { act5 } });
  assert.ok(texts.some(text => /D.?A.?R.?K/.test(text)), 'credits open on the intro credit (Darknigthmare)');
  assert.equal(ACT5_CREDITS_V188[0].name, 'Darknigthmare');
});

// —— Access conditions ——
test('access: Act V opens after the four Cocyte chapters and Act IV’s return, never during the Interlude', () => {
  const save = createDefaultSave();
  assert.equal(act5OpenV188(save), false); assert.equal(act5TableActionV188(save), null);
  for (const id of FOUR) complete(save, id);
  assert.equal(act5OpenV188(save), false, 'CIN-51 return not read yet');
  const story = normalizeStoryCampaignV188(save.storyCampaignV188); story.debriefSeen.push('special-black-cocoon'); story.interlude = { phase: 'choice', crisisId: 'c', outcome: null };
  save.storyCampaignV188 = story;
  assert.equal(act5OpenV188(save), false, 'Interlude choice pending');
  story.interlude = { phase: 'resolved', crisisId: 'c', outcome: 'destroyed' }; save.storyCampaignV188 = story;
  assert.equal(act5OpenV188(save), true); assert.equal(act5TableActionV188(save), 'start-council');
  assert.equal(deriveStoryWithAct5V188(save, { language: 'fr' }).step, 'act5');
});

test('access: final missions are locked until the council, then follow the decided line in order', () => {
  const save = threshold();
  for (const id of ACT5_CAMPAIGN_IDS_V188) assert.equal(act5LockReasonV188(save, id), 'council', id);
  assert.equal(filterAct5CampaignsV188(save, ACT5_CAMPAIGNS_V188).length, 0);
  startAct5CouncilV188(save); decide(save, 'hold');
  assert.equal(act5LockReasonV188(save, 'act5-last-run'), null);
  assert.equal(act5LockReasonV188(save, 'act5-depot-queen'), 'previous');
  assert.equal(act5LockReasonV188(save, 'act5-evacuation'), 'path');
  assert.equal(act5NextMissionV188(save), 'act5-last-run');
  assert.equal(deriveStoryWithAct5V188(save, { language: 'en' }).recommendedCampaignId, 'act5-last-run');
  // A running final mission stays listed so that it can be resumed.
  save.strategy.currentOperation = { campaignId: 'act5-depot-queen' };
  assert.ok(filterAct5CampaignsV188(save, ACT5_CAMPAIGNS_V188).some(entry => entry.id === 'act5-depot-queen'));
  for (const reason of ['council', 'path', 'previous']) assert.notEqual(act5LockTextV188(reason, 'en'), act5LockTextV188(reason, 'fr'));
});

test('access: « Transmettre » needs Asphodèle retaken, the relay room (Asphodèle hub) and 5 pieces', () => {
  const noStation = threshold({ station: false, five: true, relays: 3 });
  assert.equal(council(noStation).options.some(option => option.id === 'transmit'), false);
  assert.match(council(noStation, 'en').transmitClosed, /not retaken/);
  const save = threshold({ five: true });
  assert.equal(storyDossierV188(save).count, 5);
  assert.deepEqual(council(save).options.map(option => option.id), ['hold', 'cede'], 'relay room not ready (default of finalChoiceOptionsV188 in this base)');
  assert.match(council(save, 'en').transmitClosed, /relay room closed/);
  RELAY_READY.add(save);
  assert.deepEqual(council(save).options.map(option => option.id), ['transmit', 'hold', 'cede']);
  assert.equal(council(save, 'en').transmitClosed, null);
  const short = threshold({ relays: 3 }); // 4 pieces only
  assert.equal(storyDossierV188(short).count, 3);
  assert.equal(council(short).options.some(option => option.id === 'transmit'), false);
  // The Act does not decide the relay room itself: no Act V mission or save field opens it.
  assert.equal(read('src/story-act5-v188.js').includes('relayRoomOpen:'), false);
});

// —— Council and the three endings ——
test('council: solid-trust advisors offer their advantage; CASSIUS and origin lines; nothing granted by the dialog', () => {
  const save = threshold({ cassius: 'rewrite' });
  save.player.originV188 = 'origin-03';
  loyalty(save, 'crew-07-sanaa-doyle', 80); loyalty(save, 'crew-16-cal-mercer', 74);
  const view = council(save, 'fr');
  assert.deepEqual(view.advisors.filter(entry => entry.offered).map(entry => entry.advantage), ['turrets']);
  assert.ok(view.extra.some(line => /CASSIUS/.test(line))); assert.ok(view.extra.some(line => /Marshals/.test(line)));
  assert.equal(act5StateV188(save).phase, null, 'reading the council writes nothing');
  assert.equal(ACT5_ADVISORS_V188.length, 4);
  const erased = threshold({ cassius: 'erase' });
  assert.match(council(erased, 'en').extra.join(' '), /erased/);
});

test('ending « Le relais parle »: Transmit followed by Vega, ICC referral at the quay', () => {
  const save = threshold({ relays: 3, five: true });
  const decision = toEnding(save, 'transmit');
  assert.equal(decision.ending, 'relay-speaks'); assert.equal(decision.decidedBy, 'echo-9');
  assert.equal(act5StateV188(save).standoff, 'transmitted');
  const summary = act5EndingSummaryV188(save, 'en');
  assert.equal(summary.cinematic, 'cin-90-relay'); assert.match(summary.lines.join(' '), /suspended pending an inquiry/);
  assert.equal(summary.charterKept, false);
});

test('ending « Les vivants, sans preuve »: Hold; the quay is won with 5 pieces (Q4 A), not below', () => {
  const strong = threshold({ five: true });
  toEnding(strong, 'hold');
  assert.equal(act5StateV188(strong).decision.ending, 'living-without-proof'); assert.equal(act5StateV188(strong).standoff, 'withdrawn');
  const weak = threshold();
  toEnding(weak, 'hold');
  assert.equal(act5StateV188(weak).standoff, 'held');
  assert.equal(act5StateV188(weak).decision.recoveryAttempt, true, 'captured creature: recovery attempt aboard');
  assert.match(act5EndingSummaryV188(weak, 'en').lines.join(' '), /recover the creature/);
});

test('ending « Le fret d’abord »: Cede; restitution with 2+ containers, otherwise the crew pays in morale', () => {
  const restitution = threshold({ containers: 2 });
  const stress = restitution.crew.map(member => member.stress);
  toEnding(restitution, 'cede');
  assert.equal(act5StateV188(restitution).decision.ending, 'freight-first'); assert.equal(act5StateV188(restitution).decision.restitution, true);
  assert.deepEqual(restitution.crew.map(member => member.stress), stress);
  assert.equal(act5StateV188(restitution).standoff, null, 'no quay standoff when the depot is ceded');
  assert.deepEqual(act5MissionPathV188('cede'), ['act5-last-run', 'act5-depot-queen', 'act5-evacuation']);
  const plain = threshold({ containers: 1 });
  const before = plain.crew.map(member => member.stress);
  startAct5CouncilV188(plain); decide(plain, 'cede');
  assert.ok(plain.crew.every((member, index) => member.stress === Math.min(100, before[index] + 10)));
});

test('Vega decides below 55 loyalty: 5+ pieces without a safe channel → hold; below 5 → cede (freight first)', () => {
  const withFile = threshold({ vega: 40, five: true });
  startAct5CouncilV188(withFile);
  const a = decide(withFile, 'cede');
  assert.equal(a.decidedBy, 'vega'); assert.equal(a.option, 'hold'); assert.equal(a.ending, 'living-without-proof');
  const withChannel = threshold({ vega: 40, five: true, relays: 3 });
  startAct5CouncilV188(withChannel); assert.equal(decide(withChannel, 'hold').option, 'transmit');
  const thin = threshold({ vega: 40 });
  startAct5CouncilV188(thin); const b = decide(thin, 'hold');
  assert.equal(b.option, 'cede'); assert.equal(b.ending, 'freight-first');
  assert.equal(decide(thin, 'hold'), null, 'decided once');
});

// —— Final missions ——
test('final missions: advisors’ effects at launch, the timed bridge (+6 s with Orlov), default on timeout, late colonists', () => {
  const save = threshold();
  loyalty(save, 'crew-07-sanaa-doyle', 90); loyalty(save, 'crew-16-cal-mercer', 90); loyalty(save, 'crew-08-maksim-orlov', 90); loyalty(save, 'crew-15-leila-s-rensen', 90);
  startAct5CouncilV188(save); decide(save, 'hold');
  assert.deepEqual(act5StateV188(save).advantages, ['turrets', 'armour', 'window', 'route']);
  save.player.ammo.primary = 10; save.player.armor = 20;
  assert.deepEqual(applyAct5LaunchAdvantagesV188(save, 'act5-last-run'), ['turrets', 'armour']);
  assert.equal(save.player.ammo.primary, 130); assert.equal(save.player.armor, 100);
  assert.deepEqual(applyAct5LaunchAdvantagesV188(save, 'special-apc-convoy'), []);
  assert.equal(act5BridgeSecondsV188(save), 21);
  assert.equal(act5BridgeDueV188(save, 'act5-last-run'), true);
  assert.equal(chooseAct5BridgeV188(save, 'colonists'), true);
  assert.equal(chooseAct5BridgeV188(save, 'freight'), false, 'asked once');
  assert.equal(act5LateColonistsSavedV188(save), 2, 'Leila’s route');
  const timeout = threshold(); startAct5CouncilV188(timeout); decide(timeout, 'hold');
  assert.equal(act5BridgeSecondsV188(timeout), 15);
  assert.equal(chooseAct5BridgeV188(timeout, null, { timedOut: true }), true);
  assert.equal(act5StateV188(timeout).bridge, 'freight'); assert.equal(act5StateV188(timeout).bridgeTimedOut, true);
  const skipped = threshold(); startAct5CouncilV188(skipped); decide(skipped, 'hold');
  assert.equal(applyAct5OperationResultV188(skipped, { success: true, campaignId: 'act5-last-run' }).kind, 'bridge-default');
  assert.equal(act5StateV188(skipped).bridge, 'freight');
});

// —— Epilogue and after the campaign ——
test('epilogue reflects CASSIUS, the colony, crew trust, the dossier, the locker, the creature and Echo-9’s origin', () => {
  const kept = threshold({ relays: 3, five: true, six: true, cassius: 'rewrite' });
  kept.player.originV188 = 'origin-13';
  toEnding(kept, 'transmit', { bridge: 'freight' });
  finishAct5EndingV188(kept);
  const facts = Object.fromEntries(act5EpilogueV188(kept, 'en').map(fact => [fact.id, fact.text]));
  assert.match(facts.cassius, /the living first/); assert.match(facts.dossier, /6\/7/); assert.match(facts.dossier, /badge signer is established/);
  assert.match(facts.locker, /RETURN CONFIRMED/); assert.match(facts.creature, /captured creature/); assert.match(facts['echo-9'], /No message stays on hold/);
  assert.equal(act5RollCallV188(kept), 4 + 4, 'M577 colonists (1 container: 4 seats) + the 4 late colonists; the quay civilians count only after P-3');
  const erased = threshold({ cassius: 'erase', outcome: 'destroyed' });
  erased.galaxy.completedCampaignIds = erased.galaxy.completedCampaignIds.filter(id => id !== 'station-s3');
  toEnding(erased, 'cede', { bridge: 'colonists' }); finishAct5EndingV188(erased);
  const other = Object.fromEntries(act5EpilogueV188(erased, 'en').map(fact => [fact.id, fact.text]));
  assert.match(other.cassius, /by hand/); assert.match(other.colony, /company administration/); assert.match(other.crew, /Inez Harlow leaves/);
  assert.match(other.locker, /POST VACATED/); assert.match(other.creature, /destroyed/); assert.match(other.dossier, /not|unestablished/);
  assert.match(other['echo-9'], /I still don’t know/, 'missing origin falls back to origin-20');
  assert.equal(act5RollCallV188(erased), 4, 'the late colonists were dropped at the bridge');
  const living = threshold(); toEnding(living, 'hold'); finishAct5EndingV188(living);
  assert.match(act5EpilogueV188(living, 'fr').find(fact => fact.id === 'crew').text, /Vega est relevée/);
  // Crew last lines follow the ending; talking is recorded once.
  assert.notEqual(act5CrewEpilogueLineV188(kept, 'crew-01-mara-vega', 'en'), act5CrewEpilogueLineV188(living, 'crew-01-mara-vega', 'en'));
  assert.equal(markAct5EpilogueTalkV188(kept, 'crew-06-rook'), true); assert.equal(markAct5EpilogueTalkV188(kept, 'crew-06-rook'), false);
  assert.equal(act5LockerLabelV188(kept, 'fr'), 'RETOUR CONFIRMÉ'); assert.equal(act5LockerLabelV188(erased, 'fr'), 'POSTE LIBÉRÉ');
});

test('after the campaign: epilogue → credits → complete; free play continues, missions replay without story effect', () => {
  const save = threshold(); toEnding(save, 'hold');
  assert.equal(act5TableActionV188(save), 'ending');
  assert.equal(finishAct5EpilogueV188(save), false, 'not before the ending');
  assert.equal(finishAct5EndingV188(save), true); assert.match(act5ObjectiveV188(save, 'en').objective, /EPILOGUE/);
  assert.equal(finishAct5EpilogueV188(save), true); assert.equal(act5TableActionV188(save), 'credits');
  assert.equal(finishAct5CreditsV188(save), true); assert.equal(act5CompleteV188(save), true);
  assert.equal(act5TableActionV188(save), null); assert.equal(act5ObjectiveV188(save, 'en'), null);
  assert.equal(deriveStoryWithAct5V188(save, { language: 'en' }).objective, null, 'no story objective in free play');
  assert.equal(act5LockReasonV188(save, 'act5-last-run'), null, 'a finished final mission can be replayed');
  const bridge = act5StateV188(save).bridge;
  applyAct5OperationResultV188(save, { success: true, campaignId: 'act5-last-run' });
  assert.equal(act5StateV188(save).bridge, bridge); assert.equal(act5StateV188(save).phase, 'complete');
  assert.equal(act5SnapshotV188(save, 'en').complete, true);
});

// —— Save round trip, resume, old saves ——
test('save round trip: act5 is additive under storyCampaignV188 and survives migrateSave; bad values are sanitised', () => {
  const save = threshold();
  startAct5CouncilV188(save); decide(save, 'hold'); chooseAct5BridgeV188(save, 'colonists');
  const after = roundTrip(save);
  assert.deepEqual(after.storyCampaignV188.act5, act5StateV188(save));
  assert.equal(after.storyCampaignV188.schema, 188); assert.ok(Array.isArray(after.storyCampaignV188.debriefSeen));
  const forged = normalizeAct5V188({ phase: 'ending', decision: { option: 'nope' }, advantages: ['turrets', 'laser'], bridge: 'both', epilogueTalked: ['crew-06-rook', 'x'] });
  assert.equal(forged.phase, 'council', 'a phase past the council needs its decision');
  assert.deepEqual(forged.advantages, ['turrets']); assert.equal(forged.bridge, null); assert.deepEqual(forged.epilogueTalked, ['crew-06-rook']);
  assert.equal(normalizeAct5V188({}), null); assert.equal(normalizeAct5V188('x'), null);
});

test('resume at each step: council, final missions, quay, ending, epilogue and credits survive a reload', () => {
  const save = threshold({ relays: 3, five: true });
  startAct5CouncilV188(save);
  assert.equal(act5TableActionV188(roundTrip(save)), 'council', 'reload during the council re-opens it, no decision kept');
  decide(save, 'transmit');
  let resumed = roundTrip(save);
  assert.equal(act5NextMissionV188(resumed), 'act5-last-run'); assert.equal(act5BridgeDueV188(resumed, 'act5-last-run'), true);
  chooseAct5BridgeV188(save, 'freight');
  resumed = roundTrip(save); assert.equal(act5BridgeDueV188(resumed, 'act5-last-run'), false, 'reload in the mission: the bridge is not asked twice');
  complete(save, 'act5-last-run'); complete(save, 'act5-depot-queen');
  assert.equal(act5NextMissionV188(roundTrip(save)), 'act5-port-walls');
  complete(save, 'act5-port-walls');
  assert.equal(act5TableActionV188(roundTrip(save)), 'standoff');
  advanceAct5ToEndingV188(save);
  assert.equal(act5TableActionV188(roundTrip(save)), 'ending', 'reload during CIN-61 or the ending replays it');
  finishAct5EndingV188(save);
  assert.equal(act5StateV188(roundTrip(save)).phase, 'epilogue');
  finishAct5EpilogueV188(save);
  assert.equal(act5TableActionV188(roundTrip(save)), 'credits', 'reload during the credits replays them');
  finishAct5CreditsV188(save);
  assert.equal(act5StateV188(roundTrip(save)).phase, 'complete');
});

test('old saves: no act5 key, same story shape, the council is simply due at the threshold', () => {
  const old = createDefaultSave(); delete old.storyCampaignV188;
  const migrated = roundTrip(old);
  assert.equal('act5' in migrated.storyCampaignV188, false);
  assert.deepEqual(normalizeStoryCampaignV188([1]), { schema: 188, debriefSeen: [], cinematicsSeen: [], beatsSeen: [], m577Manifest: null, interlude: null });
  const v188 = threshold(); delete v188.storyCampaignV188.act5;
  const loaded = roundTrip(v188);
  assert.equal(act5TableActionV188(loaded), 'start-council');
  assert.deepEqual(loaded.galaxy.completedCampaignIds.slice(0, 4), FOUR);
  assert.equal(loaded.stationV188.cassius, 'rewrite');
});

// —— Wiring and i18n ——
test('wiring: the briefing table, mission lists, launch, resolution, hub conversation, locker and cinematic context', () => {
  const app = read('src/app.js');
  assert.match(app, /if \(stationReturnOnViewV188\(\)\) return;\n {2}\/\/ V188 spec 006[^\n]*\n {2}if \(act5OnViewV188\(\)\) return;/);
  assert.match(app, /act5LockReasonV188\(saveSystem\.data, campaign\.id\)/);
  assert.match(app, /applyAct5LaunchAdvantagesV188\(saveSystem\.data, campaign\.id\)/);
  assert.match(app, /applyAct5OperationResultV188\(candidate, \{ success: resolvedSuccess, campaignId: operation\.campaignId \}\)/);
  assert.match(app, /if \(event\.type === 'checkpoint'\) queueMicrotask\(maybeOpenAct5BridgeV188\);/);
  assert.match(app, /if \(act5LockerOnReadV188\(\)\) return true;/);
  assert.match(app, /data-act5-epilogue-v188|act5EpilogueV188 = event\.detail\.crewId/);
  assert.match(app, /act5: act5CinematicContextV188\(saveSystem\.data/);
  assert.equal((app.match(/filterUnlockedCampaignsV188\(saveSystem\.data, CAMPAIGNS\)/g) || []).length, 0, 'every list goes through unlockedCampaignsV188');
});

test('i18n: every Act V text exists in FR and EN; campaign texts are in the EN catalog', () => {
  const both = value => { assert.ok(value.fr && value.en, JSON.stringify(value)); assert.notEqual(value.fr, value.en); };
  for (const entry of ACT5_ADVISORS_V188) { both(entry.line); both(entry.effect); }
  for (const lines of Object.values(ACT5_CREW_EPILOGUE_V188)) for (const line of Object.values(lines)) both(line);
  for (const line of Object.values(ACT5_ORIGIN_RETURN_LINES_V188)) both(line);
  assert.equal(Object.keys(ACT5_ORIGIN_RETURN_LINES_V188).length, 20);
  both(ACT5_BRIDGE_TEXT_V188.title); both(ACT5_BRIDGE_TEXT_V188.text);
  for (const value of [...Object.values(ACT5_BRIDGE_TEXT_V188.options), ...Object.values(ACT5_BRIDGE_TEXT_V188.results)]) both(value);
  for (const key of ['transmitted', 'withdrawn', 'held', 'recovery']) both(ACT5_STANDOFF_TEXT_V188[key]);
  for (const id of ['cin-60', 'cin-61', 'cin-90-relay', 'cin-90-freight', 'cin-90-living', 'cin-92', 'cin-99-credits']) both(CINEMATICS_V188[id].title);
  const save = threshold({ relays: 3, five: true });
  for (const language of ['fr', 'en']) {
    const view = council(save, language);
    assert.ok(view.situation && view.recommend && view.options.every(option => option.label && option.description && option.ending));
  }
  assert.notEqual(council(save, 'en').situation, council(save, 'fr').situation);
  toEnding(save, 'transmit'); finishAct5EndingV188(save);
  const fr = act5EpilogueV188(save, 'fr').map(fact => fact.text), en = act5EpilogueV188(save, 'en').map(fact => fact.text);
  assert.equal(fr.length, en.length); assert.ok(fr.every((text, index) => text !== en[index] || /^ECHO/.test(text) === false));
  const catalog = read('src/i18n-en-catalog-v185.js');
  for (const campaign of ACT5_CAMPAIGNS_V188) {
    for (const text of [campaign.name, campaign.summary, campaign.description]) assert.ok(catalog.includes(JSON.stringify(text)), text);
    assert.ok(catalog.includes(JSON.stringify(ACT5_NAMES_EN_V188[campaign.id])), ACT5_NAMES_EN_V188[campaign.id]);
  }
  assert.ok(catalog.includes(JSON.stringify('Acte V · Non viable')));
});
