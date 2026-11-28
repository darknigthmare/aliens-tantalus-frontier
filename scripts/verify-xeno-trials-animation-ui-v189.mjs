import test from 'node:test';
import assert from 'node:assert/strict';
import { XenoTrialsUiV96 } from '../src/xeno-trials-ui-v96.js';
import { XENO_TRIALS_FIGHTERS_V96 as fighters, getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsRuntimeAnimationCoverage } from '../src/xeno-trials-animation-coverage-v199.js';
import { groupXenoTrialsRosterV227, XENO_TRIALS_ROSTER_PAGE_SIZE_V179 } from '../src/xeno-trials-roster-v179.js';
import { publicXenoSpritePathAdmissionV189, verifyXenoSpriteAdmissionsV189 } from './public-xeno-sprite-admissions-v189.mjs';
import { getXenoTrialsSpriteAtlasV189 } from '../src/xeno-trials-sprite-atlas-v189.js';
import { createXenoTrialsReactionObserverV186, getXenoTrialsReactionProfileV186 } from '../src/xeno-trials-reactions-v186.js';

// Minimal DOM paint targets below are declared doubles. Actual UI filtering,
// roster paging and progress normalization remain the production functions.
function terminal() {
  const elements = new Map(), attrs = new Map(), progress = createXenoTrialsProgressV96();
  const el = key => {
    if (!elements.has(key)) elements.set(key, { value: '', hidden: false, disabled: false, textContent: '', innerHTML: '',
      setAttribute() {}, replaceChildren() {}, append() {}, focus() {}, addEventListener() {} });
    return elements.get(key);
  };
  const selects = new Proxy({}, { get: (_, key) => key === Symbol.iterator ? function* () {} : el('select-' + String(key)) });
  const ui = Object.create(XenoTrialsUiV96.prototype);
  Object.assign(ui, { root: { ownerDocument: { hasFocus: () => true }, setAttribute: (k, v) => attrs.set(k, v), querySelector: () => el('control') },
    form: { elements: selects }, el, runtime: null, active: true, selected: 'warrior', selectionStep: 'fighters',
    branchV119: 'horde', activityV119: null, rosterPageV179: 0, rosterSelectionV179: 'warrior', audioEnabledV189: true,
    rosterDrawerV227: 'xenomorph', rosterDrawerPagesV227: new Map(),
    getProgress: () => progress, renderActivitiesV119() {}, renderPreviews() {} });
  return { ui, el, progress };
}

test('the animation filter uses admitted gestures, clamps an old page and preserves the selected specimen and economy', () => {
  const h = terminal(), before = JSON.stringify(h.progress);
  const selected = fighters.find(fighter => !getXenoTrialsRuntimeAnimationCoverage(fighter.id).hasDrawnGestures).id;
  h.ui.selected = h.ui.rosterSelectionV179 = selected; h.ui.rosterPageV179 = 4;
  h.el('animation').value = 'drawn'; h.el('sort').value = 'catalog'; h.ui.render();
  const shownIds = () => [...h.el('roster').innerHTML.matchAll(/data-xt-fighter="([^"]+)"/g)].map(match => match[1]);
  const visible = fighters.filter(fighter => getXenoTrialsRuntimeAnimationCoverage(fighter.id).hasDrawnGestures);
  const groups = groupXenoTrialsRosterV227(visible).filter(group => group.fighters.length);
  const admitted = groups[0].fighters.map(fighter => fighter.id);
  const size = XENO_TRIALS_ROSTER_PAGE_SIZE_V179, lastPage = Math.max(0, Math.ceil(admitted.length / size) - 1);
  assert.equal(h.ui.rosterPageV179, Math.min(4, lastPage));
  assert.deepEqual(shownIds(), admitted.slice(h.ui.rosterPageV179 * size, (h.ui.rosterPageV179 + 1) * size));
  const seen = [];
  for (let page = 0; page <= lastPage; page++) {
    h.ui.rosterPageV179 = page;
    h.ui.render();
    seen.push(...shownIds());
  }
  assert.deepEqual(seen, admitted);
  for (const group of groups.slice(1)) {
    h.ui.rosterDrawerV227 = group.id;
    for (let page = 0; page * size < group.fighters.length; page++) {
      h.ui.rosterPageV179 = page;
      h.ui.render();
      seen.push(...shownIds());
    }
  }
  assert.deepEqual(seen, groups.flatMap(group => group.fighters.map(fighter => fighter.id)));
  assert.equal(h.ui.selected, selected); assert.ok(!seen.includes(selected));
  assert.equal(JSON.stringify(h.progress), before);
});

test('all 202 admitted specimens remain reachable in category batches of at most forty after returning to the complete catalog', () => {
  const h = terminal(), before = JSON.stringify(h.progress), seen = [];
  h.el('animation').value = 'all';
  h.el('sort').value = 'catalog';
  for (const group of groupXenoTrialsRosterV227(fighters)) {
    h.ui.rosterDrawerV227 = group.id;
    for (let page = 0; page * XENO_TRIALS_ROSTER_PAGE_SIZE_V179 < group.fighters.length; page++) {
      h.ui.rosterPageV179 = page; h.ui.render();
      const ids = [...h.el('roster').innerHTML.matchAll(/data-xt-fighter="([^"]+)"/g)].map(match => match[1]);
      assert.ok(ids.length <= 40); seen.push(...ids);
    }
  }
  assert.deepEqual(seen, groupXenoTrialsRosterV227(fighters).flatMap(group => group.fighters.map(fighter => fighter.id)));
  assert.equal(new Set(seen).size, 202);
  assert.equal(JSON.stringify(h.progress), before);
});

test('eight exact new sprite paths are admitted without opening candidate names or sibling directories', async () => {
  const base = 'assets/openai/sprites/xeno-trials-v189';
  for (const [kind, ids] of [['combat', ['queen', 'crusher-acm', 'ravager', 'burster']], ['motion', ['warrior', 'runner', 'prowler', 'spitter']]])
    for (const id of ids) assert.equal(publicXenoSpritePathAdmissionV189(`${base}/${id}-${kind}-sheet.png`), true);
  for (const name of ['queen-motion-sheet.png', 'warrior-combat-sheet.png', 'candidate.png', 'nested/queen-combat-sheet.png', '../queen-combat-sheet.png'])
    assert.equal(publicXenoSpritePathAdmissionV189(`${base}/${name}`), false);
  assert.equal(publicXenoSpritePathAdmissionV189(base, { directory: true }), true);
  assert.equal(await verifyXenoSpriteAdmissionsV189(process.cwd()), 8);
});

test('drawn combat admissions receive native-state hurt and defeated views without becoming fictitious V186 meshes', () => {
  for (const id of ['queen', 'crusher-acm', 'ravager', 'burster']) {
    // Declared state-change fixtures isolate the presentation observer. Browser
    // QA separately establishes actual hits and KOs without modifying HP.
    const actor = { id, side: 'opponent', instanceIdV180: 'horde-1', x: 500, y: 0,
      facing: -1, hp: 100, guard: false, stun: 0, hitFlash: 0, attack: null };
    const match = { tick: 1, round: 1, phase: 'active', fighters: [actor], hordeV180: { totalKills: 0 } };
    const extra = fighter => getXenoTrialsSpriteAtlasV189(fighter, getXenoTrialsArtV96(fighter.id))?.kind === 'combat';
    assert.ok(extra(actor));
    const observer = createXenoTrialsReactionObserverV186({ canObserve: extra });
    observer.refresh(match); observer(match, actor);
    match.tick++; actor.hp = 90; actor.hitFlash = .15;
    const before = JSON.stringify(match); assert.equal(observer(match, actor)?.state, 'hurt');
    assert.equal(JSON.stringify(match), before);
    match.tick++; match.fighters = []; match.hordeV180.totalKills = 1; observer.refresh(match);
    const ghosts = observer.getDefeated(match); assert.equal(ghosts.length, 1); assert.equal(ghosts[0].cue.state, 'ko');
    assert.equal(ghosts[0].fighter.id, id); assert.equal(ghosts[0].fighter.hp, 0);
    assert.ok(ghosts[0].cue.progress < 1);
    observer.clear(); assert.equal(observer.getDefeated(match).length, 0);
    if (id !== 'burster') {
      assert.equal(getXenoTrialsReactionProfileV186(id), null);
      const legacy = createXenoTrialsReactionObserverV186();
      assert.equal(legacy(match, actor), null, 'Default V186 admission remains unchanged');
    }
  }
});
