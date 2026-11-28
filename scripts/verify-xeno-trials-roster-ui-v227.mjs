import assert from 'node:assert/strict';
import test from 'node:test';
import { XENO_TRIALS_FIGHTERS_V96 as fighters, getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsSimulationPowerV227 } from '../src/xeno-trials-power-v227.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsRosterPageV179, groupXenoTrialsRosterV227 } from '../src/xeno-trials-roster-v179.js';
import { filterXenoTrialsRosterV97, getXenoTrialsSelectionFamilyV119 } from '../src/xeno-trials-selection-v97.js';
import { XenoTrialsUiV96 } from '../src/xeno-trials-ui-v96.js';

const categories = ['xenomorph', 'synthetic', 'pathogen', 'hybrid', 'human', 'engineer', 'fauna', 'unknown'];

function terminal() {
  const elements = new Map();
  const el = key => {
    if (!elements.has(key)) elements.set(key, { value: '', innerHTML: '', textContent: '', hidden: false, disabled: false,
      querySelectorAll: () => [], querySelector: () => null, setAttribute() {} });
    return elements.get(key);
  };
  const progress = createXenoTrialsProgressV96();
  const ui = Object.create(XenoTrialsUiV96.prototype);
  const selects = new Proxy({}, { get: (_, key) => el(`select-${String(key)}`) });
  Object.assign(ui, { root: { ownerDocument: {}, querySelector: () => null }, form: { elements: selects }, el,
    active: true, selected: 'warrior', selectionStep: 'fighters', rosterPageV179: 0, rosterSelectionV179: null,
    rosterDrawerV227: undefined, rosterDrawerPagesV227: new Map(), getProgress: () => progress });
  return { ui, el, progress };
}

const cards = html => [...html.matchAll(/data-xt-fighter="([^"]+)"/g)].map(match => match[1]);
const powers = html => [...html.matchAll(/data-xt-power="([\d.]+)"/g)].map(match => Number(match[1]));
const openDrawer = html => /data-xt-roster-drawer="([^"]+)" open/.exec(html)?.[1];

test('classification partitions the 202 live IDs and the family filter uses the same single category', () => {
  const groups = groupXenoTrialsRosterV227(fighters);
  assert.deepEqual(groups.map(group => group.id), categories);
  const all = groups.flatMap(group => group.fighters.map(fighter => fighter.id));
  assert.equal(new Set(all).size, 202);
  assert.equal(all.length, fighters.length);
  for (const { id, fighters: group } of groups) {
    assert.ok(group.every(fighter => getXenoTrialsSelectionFamilyV119(fighter) === id));
    assert.deepEqual(filterXenoTrialsRosterV97(fighters, { family: id }), group);
  }
  assert.equal(groupXenoTrialsRosterV227(filterXenoTrialsRosterV97(fighters, { query: 'Predalien' }))
    .find(group => group.id === 'hybrid').fighters[0]?.id, 'predalien');
  assert.equal(filterXenoTrialsRosterV97(fighters, { query: 'Predalien', family: 'xenomorph' }).length, 0);
});

test('the live roster defaults to canonical ascending power while revealing the selected card in its forty-entry page', () => {
  const { ui, el, progress } = terminal();
  const before = structuredClone(progress);
  ui.renderRosterV227(progress, false);
  const html = el('roster').innerHTML;
  const ordered = groupXenoTrialsRosterV227(filterXenoTrialsRosterV97(fighters, { sort: 'power' }))[0].fighters;
  const page = getXenoTrialsRosterPageV179(ordered, { selectedId: ui.selected, revealSelected: true });
  assert.deepEqual(cards(html), page.fighters.map(row => row.id));
  assert.equal(cards(html).length, 40);
  assert.deepEqual(powers(html), cards(html).map(getXenoTrialsSimulationPowerV227));
  assert.deepEqual(powers(html), powers(html).toSorted((a, b) => a - b));
  assert.deepEqual([...html.matchAll(/data-xt-roster-drawer="([^"]+)"/g)].map(match => match[1]), categories);
  assert.equal(openDrawer(html), 'xenomorph');
  assert.match(html, /data-xt-fighter="warrior" aria-pressed="true"/);
  assert.deepEqual(progress, before);
});

test('collapse does not render any portraits and finding a filtered cross-family result opens only that category', () => {
  const { ui, el, progress } = terminal();
  ui.renderRosterV227(progress, false);
  ui.rosterDrawerV227 = null;
  ui.renderRosterV227(progress, false);
  assert.equal(cards(el('roster').innerHTML).length, 0);
  assert.equal(openDrawer(el('roster').innerHTML), undefined);
  assert.equal(el('roster-next').hidden, true);
  el('search').value = 'Predalien';
  ui.resetRosterPagesV227(true);
  ui.renderRosterV227(progress, false);
  assert.equal(openDrawer(el('roster').innerHTML), 'hybrid');
  assert.deepEqual(cards(el('roster').innerHTML), ['mire-v210-predalien-avpr', 'predalien']);
  assert.equal(ui.selected, 'warrior');
  el('search').value = 'no enemy matches this exact query';
  ui.resetRosterPagesV227(true);
  ui.renderRosterV227(progress, false);
  assert.equal(openDrawer(el('roster').innerHTML), undefined);
  assert.match(el('roster').innerHTML, /Votre sélection est conservée/);
  assert.equal(el('roster-selection').disabled, false);
});

test('a pending combat ticket keeps its visible selected card, disables every edit, and leaves owned/economy state unchanged', () => {
  const { ui, el, progress } = terminal();
  const locked = { ...progress, pending: { matchId: 'test-ticket', config: { playerId: 'warrior' } } };
  const before = structuredClone(locked);
  ui.renderRosterV227(locked, false);
  const html = el('roster').innerHTML;
  assert.match(html, /data-xt-fighter="warrior" aria-pressed="true" disabled/);
  assert.deepEqual([...html.matchAll(/<summary[^>]+aria-disabled="true"/g)].length, categories.length);
  for (const control of ['family', 'animation', 'reset-filters', 'roster-previous', 'roster-next', 'roster-selection', 'search', 'sort']) {
    assert.equal(el(control).disabled, true, control);
  }
  assert.ok(!/data-xt-unlock="[^"]+" >/.test(html));
  assert.deepEqual(locked, before);
});

test('the duel preview shows rule-adjusted health for both fighters, and keeps the source work on their dossiers', () => {
  const { ui, el } = terminal();
  ui.form.elements.opponentId.value = 'runner';
  ui.activityV119 = { branch: 'on-demand', id: 'on-demand', rules: { initialHp: 1 } };
  ui.renderPreviews();
  const html = el('portraits').innerHTML;
  assert.equal([...html.matchAll(/<dd>1 PV<\/dd>/g)].length, 2);
  for (const id of ['warrior', 'runner']) {
    const art = getXenoTrialsArtV96(id);
    assert.ok(art.work && html.includes(`DOSSIER : ${art.work}`));
  }
  ui.activityV119.rules = {};
  ui.renderPreviews();
  assert.doesNotMatch(el('portraits').innerHTML, /<dd>1 PV<\/dd>/);
});


test('assigned activity and pending ticket retain the actual target through a contradictory family filter', () => {
  const { ui, el, progress } = terminal();
  // A select refuses values absent from its options just like the native DOM.
  const select = ui.form.elements.opponentId;
  let html = '', value = '';
  const optionIds = () => [...html.matchAll(/<option value="([^"]+)"/g)].map(match => match[1]);
  Object.defineProperties(select, {
    innerHTML: { get: () => html, set: next => { html = next; value = optionIds()[0] || ''; } },
    value: { get: () => value, set: next => { value = optionIds().includes(next) ? next : ''; } },
  });
  ui.archiveAccessV207 = () => ({ available: true });
  ui.render = () => {};
  ui.branchV119 = 'challenges';
  ui.form.elements.opponentFamily.value = 'engineer';
  assert.equal(ui.chooseActivityV119('xt179-containment-contact'), true);
  assert.equal(ui.form.elements.opponentFamily.value, 'engineer');
  assert.equal(select.value, 'defender');
  assert.equal(optionIds().filter(id => id === 'defender').length, 1);
  assert.match(el('portraits').innerHTML, /data-slot="target"/);

  const ticket = beginXenoTrialsV96(progress, { playerId: 'warrior', activityV119: { branch: 'challenges', id: 'xt179-containment-contact' } });
  assert.equal(ticket.applied, true);
  ui.getProgress = () => ticket.state;
  ui.restorePendingSelection();
  assert.equal(ui.form.elements.opponentFamily.value, 'engineer');
  assert.equal(select.value, ticket.config.opponentId);
  ui.form.elements.opponentFamily.value = 'xenomorph';
  ui.restorePendingSelection();
  assert.equal(select.value, ticket.config.opponentId);
  assert.equal(optionIds().filter(id => id === 'defender').length, 1);
});
