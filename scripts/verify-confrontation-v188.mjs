// V188 spec 010: « Face-à-face sans tir, audience à choix de pièces ». Rules,
// data entries (Halloran, CASSIUS), persistence (additive, round trip, older
// saves, resume), Act V wiring (quay → act5.standoff), app wiring and the
// Canvas stage. Fixtures are built here from createDefaultSave; the dossier
// pieces are set through the records they are read from (no piece is injected).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { normalizeStoryCampaignV188 } from '../src/story-campaign-v188.js';
import { DOSSIER_PIECES_V188, storyDossierV188 } from '../src/story-dossier-v188.js';
import {
  CONFRONTATION_ENTRIES_V188, HALLORAN_QUAY_AUDIENCE_V188, CASSIUS_INTERROGATION_V188, validateConfrontationDefinitionV188,
  createConfrontationRunV188, applyConfrontationMoveV188, normalizeConfrontationRunV188, normalizeConfrontationsV188, bestReachableGroundV188,
  confrontationWinnableV188, registerConfrontationV188, getConfrontationV188, confrontationIdsV188, startConfrontationV188, playConfrontationMoveV188,
  confrontationStateV188, confrontationOutcomeV188, confrontationDecisionV188, confrontationViewV188, confrontationPiecesV188, confrontationHeldIdsV188
} from '../src/confrontation-v188.js';
import { startAct5CouncilV188, decideAct5V188, act5MissionPathV188, chooseAct5BridgeV188, applyAct5OperationResultV188, act5TableActionV188,
  advanceAct5ToEndingV188, act5StateV188, act5AudienceDueV188, startAct5AudienceV188, ACT5_AUDIENCE_ID_V188, ACT5_STANDOFF_IDS_V188 } from '../src/story-act5-v188.js';
import { drawConfrontationStageV188, CONFRONTATION_STAGE_V188 } from '../src/confrontation-ui-v188.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const roundTrip = save => migrateSave(JSON.parse(JSON.stringify(save)));
const complete = (save, id) => { if (!save.galaxy.completedCampaignIds.includes(id)) save.galaxy.completedCampaignIds.push(id); };
const H = HALLORAN_QUAY_AUDIENCE_V188, C = CASSIUS_INTERROGATION_V188;
const subsets = list => list.reduce((all, item) => all.concat(all.map(set => [...set, item])), [[]]);

/** A save at the Act V threshold with the chosen dossier pieces (read from their real records). */
function threshold({ pieces = [], vega = 60 } = {}) {
  const save = createDefaultSave();
  for (const id of ['special-archive-relay', 'special-apc-convoy', 'special-c12-horde']) complete(save, id);
  const story = normalizeStoryCampaignV188(save.storyCampaignV188);
  story.debriefSeen.push('special-black-cocoon');
  story.m577Manifest = { containers: 1, colonists: 4, resolved: true };
  story.interlude = pieces.includes('bishop-directive') ? { phase: 'resolved', crisisId: 'crisis-test', outcome: 'destroyed' } : null;
  save.storyCampaignV188 = story;
  complete(save, 'special-black-cocoon'); // the Act V threshold needs Act IV; it is also the « depot-cradles » piece
  for (const id of ['station-s1', 'station-s3', 'station-s4']) complete(save, id);
  if (pieces.includes('cassius-orders')) complete(save, 'station-s2');
  save.stationV188 = { schema: 188, introHeard: true, cassius: 'rewrite', scenesSeen: ['s1', 's3', 's4'] };
  const discovered = { ...save.narrativeArchives.discovered }, flags = [];
  if (pieces.includes('pda-email')) Object.assign(discovered, { 'qz17-pda-loading-chief': { id: 'qz17-pda-loading-chief' }, 'qz17-email-logistics-denial': { id: 'qz17-email-logistics-denial' } });
  if (pieces.includes('seal-or-cradle')) flags.push('qz17-maintenance-bypass');
  save.narrativeArchives = { ...save.narrativeArchives, discovered, unlockedFlags: flags };
  if (pieces.includes('priority-1843')) { save.archiveRelayArchivesV122 = { case: { verdict: 'delayed-distress' } }; save.storyCampaignV188.cinematicsSeen.push('cin-20-rook'); }
  if (pieces.includes('wren-testimony')) complete(save, 'colony-a-quai');
  save.crew.find(member => member.id === 'crew-01-mara-vega').loyalty = vega;
  return save;
}
/** Decides « Tenir » (or another line) and plays the final missions. */
function toQuay(save, line = 'hold') {
  assert.equal(startAct5CouncilV188(save), true);
  assert.ok(decideAct5V188(save, line, 'fr', line === 'transmit' ? { relayRoomOpen: true, asphodeleRetaken: true } : {}));
  for (const id of act5MissionPathV188(act5StateV188(save).decision.option)) {
    if (id === 'act5-last-run') chooseAct5BridgeV188(save, 'freight');
    applyAct5OperationResultV188(save, { success: true, campaignId: id }); complete(save, id);
  }
  return save;
}
const decisiveRound = (def, piece) => def.rounds.findIndex(round => round.counters[piece] === 'decisive');

test('data entries are valid, FR and EN, and only use pieces of the QZ17 dossier', () => {
  const known = new Set(DOSSIER_PIECES_V188.map(piece => piece.id));
  assert.deepEqual(confrontationIdsV188(), ['act5-halloran-quay', 'station-s2-cassius']);
  for (const def of CONFRONTATION_ENTRIES_V188) {
    assert.deepEqual(validateConfrontationDefinitionV188(def), [], def.id);
    for (const piece of def.pieces) assert.ok(known.has(piece), `${def.id}: ${piece}`);
    for (const round of def.rounds) { assert.match(round.citation.fr, /«/); assert.match(round.citation.en, /"/); }
  }
  assert.equal(H.pieces.length, 7);
  assert.ok(!C.pieces.includes('cassius-orders'), 'S2 is where the CASSIUS orders are recovered: not presentable to CASSIUS');
  assert.deepEqual(H.outcomes, { won: 'withdrawn', lost: 'held' });
  for (const value of Object.values(H.outcomes)) assert.ok(ACT5_STANDOFF_IDS_V188.includes(value), 'feeds an existing standoff id');
  // Every Halloran round cites a clause, an article, a protocol or a rule: the company « cite » (§1.3).
  assert.ok(H.rounds.every(round => /clause|article|protocole|charte|délégation|règlement|manifeste/i.test(round.source.fr)));
  assert.match(H.interlocutor.name.fr, /DIRECTRICE HALLORAN/, 'bible §2.3: Directrice Halloran');
});

test('validator rejects broken entries and the registry refuses duplicates', () => {
  assert.ok(validateConfrontationDefinitionV188(null).length);
  const broken = { ...H, id: 'Bad Id', target: 99, rounds: [{ ...H.rounds[0], counters: { 'unknown-piece': 'decisive' } }] };
  const errors = validateConfrontationDefinitionV188(broken).join(' | ');
  assert.match(errors, /id/); assert.match(errors, /target/); assert.match(errors, /unknown-piece/);
  const twice = { ...H, id: 'twice-decisive', rounds: [H.rounds[0], { ...H.rounds[1], counters: { 'priority-1843': 'decisive' } }], target: 2 };
  assert.match(validateConfrontationDefinitionV188(twice).join(' '), /decisive in two rounds/);
  assert.throws(() => registerConfrontationV188({ ...H }), /already registered/);
  assert.throws(() => registerConfrontationV188(broken));
  assert.equal(getConfrontationV188('act5-halloran-quay'), H);
});

test('rules: decisive +2 and spent, partial +1 and spent, wrong costs credibility and is not spent, silence costs nothing', () => {
  const all = H.pieces;
  let run = createConfrontationRunV188(H);
  assert.deepEqual({ ground: run.ground, credibility: run.credibility, round: run.round, status: run.status }, { ground: 0, credibility: 3, round: 0, status: 'open' });
  let move = applyConfrontationMoveV188(H, run, 'priority-1843', all); // clause 14 ← 18:43 priority
  assert.equal(move.result, 'decisive'); run = move.run; assert.equal(run.ground, 2); assert.deepEqual(run.spent, ['priority-1843']); assert.equal(run.round, 1);
  assert.equal(applyConfrontationMoveV188(H, run, 'priority-1843', all), null, 'a spent piece cannot be presented again');
  move = applyConfrontationMoveV188(H, run, 'wren-testimony', all); // manifest ← Wren: off the point
  assert.equal(move.result, 'wrong'); run = move.run; assert.equal(run.credibility, 2); assert.equal(run.ground, 2); assert.ok(!run.spent.includes('wren-testimony'));
  move = applyConfrontationMoveV188(H, run, 'depot-cradles', all); // seals ← cradles: partial
  assert.equal(move.result, 'partial'); run = move.run; assert.equal(run.ground, 3); assert.ok(run.spent.includes('depot-cradles'));
  move = applyConfrontationMoveV188(H, run, null, all);
  assert.equal(move.result, 'silence'); run = move.run; assert.equal(run.ground, 3); assert.equal(run.credibility, 2); assert.equal(run.round, 4);
  assert.equal(applyConfrontationMoveV188(H, run, 'pda-email', []), null, 'a piece that is not held cannot be presented');
  assert.equal(applyConfrontationMoveV188(H, run, 'not-a-piece', all), null);
});

test('rules: credibility at 0 loses at once; reaching the target wins at once; the last round passing loses', () => {
  let run = createConfrontationRunV188(H);
  for (let i = 0; i < 3; i += 1) run = applyConfrontationMoveV188(H, run, 'bishop-directive', H.pieces).run; // off the point at clauses 1-3
  assert.equal(run.status, 'lost'); assert.equal(run.credibility, 0);
  assert.equal(applyConfrontationMoveV188(H, run, null, H.pieces), null, 'a concluded hearing refuses moves');
  run = createConfrontationRunV188(H);
  for (const round of H.rounds.slice(0, 5)) {
    const piece = Object.keys(round.counters).find(id => round.counters[id] === 'decisive');
    run = applyConfrontationMoveV188(H, run, piece, H.pieces).run;
  }
  assert.equal(run.ground, 10); assert.equal(run.status, 'won'); assert.equal(run.round, 5, 'won at the fifth piece, before the last clauses');
  run = createConfrontationRunV188(H);
  for (let i = 0; i < H.rounds.length; i += 1) run = applyConfrontationMoveV188(H, run, null, H.pieces).run;
  assert.equal(run.status, 'lost'); assert.equal(run.credibility, 3);
});

test('Halloran: the Q4 A threshold is kept as a bound — winnable with 5 pieces or more, never below (all 128 dossiers)', () => {
  for (const held of subsets(H.pieces)) {
    const winnable = confrontationWinnableV188(H, createConfrontationRunV188(H), held);
    assert.equal(winnable, held.length >= 5, `${held.join(',') || 'none'}`);
    if (held.length >= 5) assert.ok(held.every(piece => decisiveRound(H, piece) >= 0), 'each piece is decisive somewhere');
  }
  assert.equal(bestReachableGroundV188(H, createConfrontationRunV188(H), H.pieces), 14);
});

test('CASSIUS: three decisive pieces win; the right moment matters (a piece spent as partial is gone)', () => {
  const decisive = C.pieces.filter(piece => decisiveRound(C, piece) >= 0);
  assert.equal(decisive.length, 5);
  for (const held of subsets(C.pieces)) {
    const strong = held.filter(piece => decisive.includes(piece)).length;
    const winnable = confrontationWinnableV188(C, createConfrontationRunV188(C), held);
    if (strong >= 3) assert.equal(winnable, true, held.join(','));
    if (strong <= 1) assert.equal(winnable, false, held.join(','));
  }
  // Exactly three decisive pieces: using one of them as a partial early leaves the hearing unwinnable.
  const held = ['seal-or-cradle', 'priority-1843', 'bishop-directive'];
  let run = createConfrontationRunV188(C);
  run = applyConfrontationMoveV188(C, run, 'seal-or-cradle', held).run; // Q-1 decisive
  run = applyConfrontationMoveV188(C, run, 'priority-1843', held).run; // P-2 decisive
  assert.equal(confrontationWinnableV188(C, run, held), true);
  const early = applyConfrontationMoveV188(C, createConfrontationRunV188(C), null, held).run; // silence on Q-1: seal's moment passed
  assert.equal(confrontationWinnableV188(C, early, held), false);
});

test('persistence: additive under storyCampaignV188, round trip through migrateSave, older saves, hostile data', () => {
  const fresh = createDefaultSave();
  assert.equal(fresh.storyCampaignV188.confrontationsV188, undefined, 'a new save has no hearing');
  assert.equal(roundTrip(fresh).storyCampaignV188.confrontationsV188, undefined, 'an older save gains nothing');
  const save = threshold({ pieces: ['pda-email', 'priority-1843'] });
  assert.equal(confrontationStateV188(save, H.id), null);
  assert.equal(startConfrontationV188(save, H.id), true); assert.equal(startConfrontationV188(save, H.id), false, 'started once');
  assert.equal(playConfrontationMoveV188(save, H.id, 'priority-1843').result, 'decisive');
  assert.equal(playConfrontationMoveV188(save, H.id, 'seal-or-cradle'), null, 'a piece not in the save cannot be presented');
  const loaded = roundTrip(save);
  assert.deepEqual(confrontationStateV188(loaded, H.id), confrontationStateV188(save, H.id), 'a reload resumes at the next clause');
  assert.equal(confrontationStateV188(loaded, H.id).round, 1);
  assert.equal(normalizeConfrontationsV188('x'), null); assert.equal(normalizeConfrontationsV188({ 'Bad Key': {} }), null);
  const hostile = normalizeConfrontationRunV188({ status: 'won', round: 99, ground: -4, credibility: 50, spent: ['__proto__', 'pda-email', 'pda-email'],
    log: [{ round: 0, piece: 'pda-email', result: 'silence' }, { round: 0, piece: null, result: 'silence' }, { round: 0, piece: 'x y', result: 'wrong' }] }, H);
  assert.equal(hostile.round, 7); assert.equal(hostile.ground, 0); assert.equal(hostile.credibility, 3); assert.deepEqual(hostile.spent, ['pda-email']);
  assert.equal(hostile.log.length, 1, 'only consistent log entries are kept');
  assert.equal(normalizeConfrontationRunV188({ status: 'open', credibility: 0 }, H).status, 'lost');
  assert.equal(normalizeConfrontationRunV188({ status: 'open', ground: 10, credibility: 2, round: 5 }, H).status, 'won');
  // The save validator is unchanged: src/save.js does not mention the hearing.
  assert.doesNotMatch(read('src/save.js'), /confrontation/i);
});

test('Act V: « Tenir » opens the quay hearing; won → withdrawn, lost → held, even with 5 pieces', () => {
  const five = ['pda-email', 'seal-or-cradle', 'priority-1843', 'bishop-directive', 'depot-cradles'];
  const save = toQuay(threshold({ pieces: five }));
  assert.equal(act5TableActionV188(save), 'audience'); assert.equal(act5AudienceDueV188(save), true);
  assert.equal(startAct5AudienceV188(save), true);
  assert.deepEqual(confrontationHeldIdsV188(save, ACT5_AUDIENCE_ID_V188).sort(), [...five].sort());
  for (const round of H.rounds) {
    if (confrontationOutcomeV188(save, ACT5_AUDIENCE_ID_V188)) break;
    const piece = Object.keys(round.counters).find(id => round.counters[id] === 'decisive' && five.includes(id)) || null;
    playConfrontationMoveV188(save, ACT5_AUDIENCE_ID_V188, piece);
  }
  assert.equal(confrontationOutcomeV188(save, ACT5_AUDIENCE_ID_V188), 'won');
  assert.equal(confrontationDecisionV188(save, ACT5_AUDIENCE_ID_V188), 'withdrawn');
  assert.equal(act5AudienceDueV188(save), false); assert.equal(act5TableActionV188(save), 'standoff');
  assert.equal(advanceAct5ToEndingV188(save).standoff, 'withdrawn'); assert.equal(act5StateV188(save).phase, 'ending');

  const lost = toQuay(threshold({ pieces: five }));
  startAct5AudienceV188(lost);
  // pda-email: off the point at clause 14 (credibility -1), decisive at the manifest, then spent (refused).
  for (let i = 0; i < 3; i += 1) playConfrontationMoveV188(lost, ACT5_AUDIENCE_ID_V188, 'pda-email');
  const state = confrontationStateV188(lost, ACT5_AUDIENCE_ID_V188);
  assert.equal(state.status, 'open', 'pda-email was decisive at the manifest clause'); assert.equal(state.credibility, 2);
  while (confrontationStateV188(lost, ACT5_AUDIENCE_ID_V188).status === 'open') playConfrontationMoveV188(lost, ACT5_AUDIENCE_ID_V188, null);
  assert.equal(confrontationOutcomeV188(lost, ACT5_AUDIENCE_ID_V188), 'lost');
  assert.equal(advanceAct5ToEndingV188(lost).standoff, 'held', 'the outcome, not the count, decides once the hearing was played');
});

test('Act V: below 5 pieces the hearing cannot be won; « Transmettre » and « Céder » have no hearing; resume mid-hearing', () => {
  const weak = toQuay(threshold({ pieces: ['pda-email', 'priority-1843'] }));
  startAct5AudienceV188(weak);
  assert.equal(confrontationViewV188(weak, ACT5_AUDIENCE_ID_V188, 'en').winnable, false);
  const cede = toQuay(threshold({ pieces: ['pda-email'] }), 'cede');
  assert.equal(act5TableActionV188(cede), 'to-ending'); assert.equal(act5AudienceDueV188(cede), false); assert.equal(startAct5AudienceV188(cede), false);
  const all = ['pda-email', 'seal-or-cradle', 'priority-1843', 'bishop-directive', 'depot-cradles', 'cassius-orders', 'wren-testimony'];
  const transmit = toQuay(threshold({ pieces: all }), 'transmit');
  assert.equal(act5StateV188(transmit).decision.option, 'transmit');
  assert.equal(act5TableActionV188(transmit), 'standoff'); assert.equal(act5AudienceDueV188(transmit), false);
  // Resume: two exchanges, reload, the view shows the third clause and the spent pieces.
  const resume = toQuay(threshold({ pieces: all }));
  startAct5AudienceV188(resume);
  playConfrontationMoveV188(resume, ACT5_AUDIENCE_ID_V188, 'priority-1843'); playConfrontationMoveV188(resume, ACT5_AUDIENCE_ID_V188, 'pda-email');
  const loaded = roundTrip(resume);
  assert.equal(act5TableActionV188(loaded), 'audience');
  const view = confrontationViewV188(loaded, ACT5_AUDIENCE_ID_V188, 'fr');
  assert.equal(view.round, 2); assert.equal(view.ground, 4); assert.match(view.citation, /Article 3/);
  assert.deepEqual(view.pieces.filter(piece => piece.spent).map(piece => piece.id).sort(), ['pda-email', 'priority-1843']);
  assert.equal(startAct5AudienceV188(loaded), true, 'reopening resumes, it does not restart');
  assert.equal(confrontationStateV188(loaded, ACT5_AUDIENCE_ID_V188).round, 2);
  assert.equal(storyDossierV188(resume).count, 7, 'the hearing grants and removes no piece (fixture read before migration, like spec 006)');
});

test('view texts exist in FR and EN; the stage draws without throwing, with and without reduced motion', () => {
  const save = toQuay(threshold({ pieces: ['pda-email', 'seal-or-cradle', 'priority-1843', 'bishop-directive', 'depot-cradles'] }));
  startAct5AudienceV188(save);
  playConfrontationMoveV188(save, ACT5_AUDIENCE_ID_V188, 'wren-testimony'); // not held: refused
  playConfrontationMoveV188(save, ACT5_AUDIENCE_ID_V188, 'priority-1843');
  for (const lang of ['fr', 'en']) {
    const view = confrontationViewV188(save, ACT5_AUDIENCE_ID_V188, lang);
    for (const key of ['title', 'intro', 'interlocutor', 'citation', 'source']) assert.ok(view[key], `${lang}.${key}`);
    assert.ok(view.last.reply.length > 10);
    const pieces = confrontationPiecesV188(save, ACT5_AUDIENCE_ID_V188, lang);
    assert.equal(pieces.find(piece => piece.id === 'wren-testimony').held, false);
    const calls = []; const ctx = new Proxy({ measureText: text => ({ width: String(text).length * 9 }), createRadialGradient: () => ({ addColorStop() {} }) },
      { get: (target, key) => key in target ? target[key] : (...args) => { calls.push([key, args]); }, set: () => true });
    for (const reducedMotion of [false, true]) assert.equal(drawConfrontationStageV188(ctx, view, { language: lang, time: 1.3, reveal: .4, reducedMotion }).ground, 2);
    const texts = calls.filter(([key]) => key === 'fillText').map(([, args]) => args[0]).join(' ');
    assert.match(texts, lang === 'en' ? /GROUND 2\/10/ : /TERRAIN 2\/10/);
  }
  assert.deepEqual(CONFRONTATION_STAGE_V188, { width: 960, height: 360 });
  const cassiusView = { ...confrontationViewV188(save, 'station-s2-cassius', 'en') };
  assert.equal(cassiusView.portrait, 'core-eye'); assert.equal(cassiusView.status, 'open');
});

test('wiring: app imports the hearing, the table action opens it, the shell caches the modules', () => {
  const app = read('src/app.js');
  assert.match(app, /import \{ confrontationViewV188, playConfrontationMoveV188 \} from '\.\/confrontation-v188\.js';/);
  assert.match(app, /import \{ openConfrontationDialogV188 \} from '\.\/confrontation-ui-v188\.js';/);
  assert.match(app, /if \(action === 'audience'\) \{ openAct5AudienceV188\(\); return true; \}/);
  assert.match(app, /startAct5AudienceV188\(candidate\)/);
  assert.match(app, /act5AudienceDueV188\(saveSystem\.data\)/);
  const sw = read('sw.js');
  for (const file of ['confrontation-state-v188.js', 'confrontation-entries-v188.js', 'confrontation-v188.js', 'confrontation-ui-v188.js']) assert.ok(sw.includes(`'/src/${file}'`), file);
  const ui = read('src/confrontation-ui-v188.js');
  assert.match(ui, /roundSeconds = 0/, 'no time limit by default');
  assert.match(ui, /event\.key === 'Escape'\) \{ event\.preventDefault\(\); return; \}/);
  assert.doesNotMatch(read('src/confrontation-entries-v188.js'), /import /, 'entries are pure data');
});
