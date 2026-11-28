import assert from 'node:assert/strict';
import test from 'node:test';
import { XENO_TRIALS_BIG_CHAP_ROUTE_V231 as route, XENO_TRIALS_CHARACTER_ROUTES_BRANCH_V231 as branch,
  getXenoTrialsCharacterRouteViewV231 } from '../src/xeno-trials-character-routes-v231.js';
import { canUseXenoTrialsCharacterRouteFighterV231 as canUseFighter, displayXenoTrialsRouteEntryV231 as displayChapter,
  renderXenoTrialsCharacterRouteStoryV231 as story, routeRuleTextV231, routeTextV231 } from '../src/xeno-trials-character-route-ui-v231.js';
import { getXenoTrialsRuleTextV119, resolveXenoTrialsActivityV119 } from '../src/xeno-trials-modes-v119.js';
import { createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';

const { chapters, fighterId } = route;
const first = chapters[0], final = chapters.at(-1);
const cleared = count => ({ characterRoutesClearedV231: chapters.slice(0, count).map(chapter => chapter.id) });
const routeView = count => getXenoTrialsCharacterRouteViewV231(route.id, cleared(count));

test('the route story shows the localized prologue and reveals only validated observation logs', () => {
  const empty = story(routeView(0));
  assert.match(empty, /data-xt-route-story="big-chap"/);
  assert.ok(empty.includes(route.label));
  assert.ok(empty.includes(route.prologue));
  assert.match(empty, /0 \/ 4 RELEVÉS VALIDÉS/);
  assert.doesNotMatch(empty, /<ol>|Épilogue/);
  const midway = story(routeView(2), 'en');
  assert.ok(midway.includes(route.labelEn));
  assert.ok(midway.includes(route.prologueEn));
  assert.match(midway, /2 \/ 4 READINGS VALIDATED/);
  assert.equal(midway.match(/<li>/g)?.length, 2);
  for (const [index, chapter] of chapters.entries()) {
    assert.equal(midway.includes(chapter.eventEn), index < 2);
    assert.equal(routeTextV231(chapter, 'briefing', 'en'), chapter.briefingEn);
  }
  assert.ok(!midway.includes(route.epilogueEn));
  assert.equal(story(null), '');
});

test('the full log reveals the epilogue and permanent-roster authorization only after chapter four', () => {
  const almost = story(routeView(3), 'fr'), complete = story(routeView(4), 'fr');
  for (const text of [final.event, route.epilogue, 'Relire le prologue']) {
    assert.ok(!almost.includes(text));
    assert.ok(complete.includes(text));
  }
  assert.match(almost, /Big Chap est prêté pour ces épreuves/);
  assert.match(complete, /Autorisation permanente MIRE\. Big Chap est disponible dans le registre\./);
  assert.doesNotMatch(complete, /Big Chap est prêté|Terminez le parcours/);
  assert.equal(complete.match(/<li>/g)?.length, 4);
  const englishBeforeFinal = story(routeView(3), 'en');
  const english = story(routeView(4), 'en');
  assert.match(englishBeforeFinal, /Big Chap is assigned to these trials on loan/);
  assert.match(english, /Permanent MIRE authorization\. Big Chap is available in the roster\./);
  assert.doesNotMatch(english, /on loan|Complete the route to retain/);
  assert.match(english, /4 \/ 4 READINGS VALIDATED/);
  assert.match(english, /Epilogue/);
  assert.match(english, /permanent roster/);
  assert.equal(english.match(/<li>/g)?.length, 4);
  assert.ok(english.includes(route.epilogueEn));
  assert.ok(english.includes(route.prologueEn));
});

test('the selector loans only the assigned Big Chap in an open chapter without adding roster ownership', () => {
  const state = createXenoTrialsProgressV96();
  const initial = structuredClone(state);
  const authored = resolveXenoTrialsActivityV119({ branch, id: first.id }, state.modesV119);
  assert.equal(canUseFighter(state, fighterId, authored), true);
  assert.equal(canUseFighter(state, fighterId, { ...authored, forcedPlayerId: 'warrior' }), false);
  assert.equal(canUseFighter(state, fighterId, { ...authored, id: final.id }), false);
  assert.equal(canUseFighter(state, fighterId, { ...authored, branch: 'campaign' }), false);
  assert.equal(canUseFighter(state, 'mire-v209-six', { ...authored, forcedPlayerId: 'mire-v209-six' }), false);
  assert.equal(canUseFighter(state, fighterId, null), false);
  assert.equal(canUseFighter(state, 'warrior', null), true);
  assert.deepEqual(state, initial);
  const beforeFinal = { ...state, modesV119: cleared(3) };
  assert.equal(canUseFighter(beforeFinal, fighterId, resolveXenoTrialsActivityV119({ branch, id: final.id }, beforeFinal.modesV119)), true);
  assert.equal(canUseFighter({ ...state, unlocked: [...state.unlocked, fighterId] }, fighterId, null), true);
});

test('story text is escaped and the provided admitted illustration appears in the illustration slot', () => {
  const view = routeView(1);
  const untrustedText = '<b>"journal" & test</b>';
  const image = '<img src="/assets/demo.png" alt="">';
  const result = story({ ...view, label: untrustedText, chapters: [{ ...first, cleared: true, event: untrustedText }] }, 'fr', image);
  assert.ok(result.includes(image));
  assert.doesNotMatch(result, /<b>/);
  assert.equal(result.match(/&lt;b&gt;&quot;journal&quot; &amp; test&lt;\/b&gt;/g)?.length, 2);
});

test('sealed readings expose no future identity or narrative and open briefings localize without changing rules', () => {
  const { chapters: [opened, ...sealed] } = routeView(0);
  for (const locale of ['fr', 'en']) for (const chapter of sealed) {
    const presentation = displayChapter(chapter, locale);
    assert.equal(presentation.id, chapter.id);
    assert.equal(presentation.rules, chapter.rules);
    assert.equal(presentation.opponentId, null);
    assert.equal(presentation.stageId, null);
    assert.equal(presentation.event, '');
    assert.notEqual(presentation.briefing, routeTextV231(chapter, 'briefing', locale));
    assert.notEqual(presentation.title, routeTextV231(chapter, 'title', locale));
  }
  const english = displayChapter(opened, 'en');
  for (const key of ['title', 'briefing', 'act', 'supervisor', 'event']) assert.equal(english[key], opened[key + 'En']);
  assert.equal(english.stageId, opened.stageId);
  assert.equal(english.opponentId, opened.opponentId);
  assert.equal(english.rules, opened.rules);
  assert.equal(opened.title, first.title);
  assert.equal(routeRuleTextV231(getXenoTrialsRuleTextV119(opened.rules), 'en'), 'No specials · 60 seconds per round');
  assert.equal(routeRuleTextV231(getXenoTrialsRuleTextV119(chapters[2].rules), 'en'), 'Survive 30 s');
});
