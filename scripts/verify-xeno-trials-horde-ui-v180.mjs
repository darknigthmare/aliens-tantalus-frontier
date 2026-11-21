import test from 'node:test';
import assert from 'node:assert/strict';
import { XenoTrialsUiV96 } from '../src/xeno-trials-ui-v96.js';
import { createXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { resolveXenoTrialsActivityV119 } from '../src/xeno-trials-modes-v119.js';
import { XENO_TRIALS_HORDE_PROTOCOLS_V180 as protocols, XENO_TRIALS_HORDE_PROTOCOLS_V186 as currentProtocols } from '../src/xeno-trials-horde-v180.js';
import { getXenoTrialsHordeBriefingV180, getXenoTrialsHordeViewV180 } from '../src/xeno-trials-horde-ui-v180.js';

// DOM doubles exercise the production UI methods. Snapshot fixtures below test
// display ownership only; they are not claims of completed browser combat.
function host() {
  const elements = new Map(), attributes = new Map();
  const element = key => {
    if (!elements.has(key)) {
      let text = '';
      const attrs = new Map();
      elements.set(key, { value: '', innerHTML: '', textWrites: 0, hidden: false, disabled: false,
        get textContent() { return text; }, set textContent(value) { text = value; this.textWrites++; },
        addEventListener() {}, setAttribute(name, value) { attrs.set(name, value); }, getAttribute: name => attrs.get(name),
        focus() { this.focused = true; } });
    }
    return elements.get(key);
  };
  element('form').elements = new Proxy({}, { get: (_, key) => element(`form-${String(key)}`) });
  const root = { innerHTML: '', ownerDocument: { hidden: false, hasFocus: () => true },
    querySelector: selector => element(selector.match(/data-xt="([^"]+)"/)?.[1] || 'super-control'),
    addEventListener() {}, setAttribute: (key, value) => attributes.set(key, value), getAttribute: key => attributes.get(key),
    removeAttribute: key => attributes.delete(key) };
  const progress = createXenoTrialsProgressV96();
  class DisplayUi extends XenoTrialsUiV96 { updateOpponents() {} restorePendingSelection() {} render() {} }
  const ui = new DisplayUi({ root, getProgress: () => progress, canCommit: () => true, onCommit() {}, onReturn() {} });
  ui.active = true;
  return { ui, root, element, progress };
}

function snapshot() {
  const match = createXenoTrialsMatchV96({ playerId: 'warrior', opponentId: 'runner', introSeconds: 0 });
  match.hordeV180 = { wave: 1, waveCount: 2, alive: 3, remaining: 2, totalRemaining: 12,
    totalKills: 0, totalEnemies: 12, concurrent: 3, maxConcurrent: 8, phase: 'active' };
  match.fighters.push({ ...match.fighters[1], id: 'prowler', instanceIdV180: 'enemy-2' },
    { ...match.fighters[1], id: 'arachnoid', instanceIdV180: 'enemy-3' });
  return match;
}

test('all forty horde dossiers expose their actual low health, population and concurrency', () => {
  assert.equal(protocols.length, 40);
  for (const protocol of protocols) {
    const activity = resolveXenoTrialsActivityV119({ branch: 'horde', id: protocol.id });
    const view = getXenoTrialsHordeBriefingV180(activity);
    assert.equal(view.waves, protocol.waves.length);
    assert.equal(view.total, protocol.totalEnemies);
    assert.equal(view.minimum, Math.min(...protocol.waves.map(wave => wave.hp)));
    assert.equal(view.maximum, Math.max(...protocol.waves.map(wave => wave.hp)));
    assert.equal(view.simultaneous, Math.max(...protocol.waves.map(wave => wave.concurrent)));
    assert.ok(view.minimum >= 15 && view.maximum <= 35);
    assert.ok(view.simultaneous >= 3 && view.simultaneous <= 8);
  }
  assert.equal(getXenoTrialsHordeBriefingV180({ branch: 'challenges', id: 'xte179-incoming-1' }), null);
});

test('the horde program opens a bounded page of its eighty entries and keeps its native activity identity', () => {
  const h = host();
  assert.equal(h.ui.chooseBranchV119('horde'), true);
  h.ui.renderActivitiesV119(h.ui.state());
  assert.equal(currentProtocols.length, 80);
  assert.equal((h.element('activity-board').innerHTML.match(/data-xt-horde="true"/g) || []).length, 12);
  assert.match(h.element('activity-count').textContent, /^80 PROTOCOLES/u);
  assert.equal((h.element('activity-board').innerHTML.match(/data-xt-event=/g) || []).length, 0);
  assert.ok(h.element('activity-count').textContent.includes('CONTACTS SIMULTANÉS'));
  assert.equal(h.ui.chooseActivityV119(protocols[0].id), true);
  assert.deepEqual(h.ui.activityV119, { branch: 'horde', id: protocols[0].id });
  assert.equal(h.ui.confirmFighters(), true);
  assert.equal(h.ui.selectionStep, 'arena');
});

test('a multiple-enemy snapshot has one operator health bar and aggregate horde telemetry', () => {
  const h = host(), state = snapshot(), before = JSON.stringify(state);
  h.ui.updateMatch(state);
  assert.equal(h.element('opponent-vitals').hidden, true);
  assert.equal(h.element('horde-hud').hidden, false);
  assert.equal(h.element('horde-alive').textContent, '3');
  assert.equal(h.element('horde-remaining').textContent, '2');
  assert.equal(h.element('horde-kills').textContent, '0 / 12 NEUTRALISÉS');
  assert.equal(h.element('horde-progress').max, 12);
  assert.equal(h.element('round').textContent, 'VAGUE 1 / 2');
  assert.equal(h.element('next').hidden, true);
  assert.equal(h.element('taunt').hidden, true);
  assert.equal(h.root.getAttribute('data-xt-mode'), 'horde');
  assert.equal(h.element('player-name').textContent, 'Warrior');
  assert.equal(JSON.stringify(state), before, 'the HUD must never alter combat or rewards');
});

test('intermission and final victory remain renderable with the operator as the only fighter', () => {
  const h = host(), state = snapshot();
  state.fighters = state.fighters.slice(0, 1);
  state.hordeV180.alive = 0; state.hordeV180.remaining = 0; state.hordeV180.phase = 'intermission';
  h.ui.updateMatch(state);
  assert.ok(h.element('horde-phase').textContent.includes('RENFORTS EN APPROCHE'));
  state.phase = 'match-over'; state.hordeV180.phase = 'complete'; state.result = { winner: 'player' };
  state.hordeV180.totalKills = 12;
  h.ui.updateMatch(state);
  assert.equal(h.element('horde-phase').textContent, 'SECTEUR SÉCURISÉ');
  assert.equal(h.element('horde-progress').value, 12);
  assert.equal(h.element('pause').disabled, true);
});

test('live announcements change by wave and phase, without narrating every kill or arrival', () => {
  const h = host(), state = snapshot();
  h.ui.updateMatch(state);
  const announcements = h.element('horde-announcement').textWrites, statuses = h.element('status').textWrites;
  state.hordeV180.totalKills = 1; state.hordeV180.alive = 2;
  h.ui.updateMatch(state);
  assert.equal(h.element('horde-announcement').textWrites, announcements);
  assert.equal(h.element('status').textWrites, statuses);
  assert.equal(h.element('horde-kills').textContent, '1 / 12 NEUTRALISÉS');
  state.hordeV180.wave = 2;
  h.ui.updateMatch(state);
  assert.equal(h.element('horde-announcement').textWrites, announcements + 1);
  state.paused = true;
  h.ui.updateMatch(state);
  assert.equal(h.element('horde-phase').textContent, 'PAUSE');
  assert.equal(h.element('resume-overlay').focused, true);
});

test('returning to an ordinary duel restores both health bars and clears horde telemetry', () => {
  const h = host(); h.ui.updateMatch(snapshot());
  const duel = createXenoTrialsMatchV96({ playerId: 'warrior', opponentId: 'runner', introSeconds: 0 });
  h.ui.updateMatch(duel);
  assert.equal(h.element('opponent-vitals').hidden, false);
  assert.equal(h.element('horde-hud').hidden, true);
  assert.equal(h.element('horde-announcement').textContent, '');
  assert.equal(h.root.getAttribute('data-xt-mode'), 'duel');
  assert.equal(h.element('opponent-name').textContent, 'Runner');
});

test('an absent or malformed telemetry input never produces NaN counters', () => {
  assert.equal(getXenoTrialsHordeViewV180(null), null);
  assert.equal(getXenoTrialsHordeViewV180({}), null);
  const view = getXenoTrialsHordeViewV180({ hordeV180: { wave: NaN, waveCount: Infinity,
    alive: -1, totalKills: 4, totalEnemies: 2 } });
  assert.deepEqual([view.wave, view.waveCount, view.alive, view.kills, view.total], [1, 1, 0, 4, 4]);
  assert.ok(!view.status.includes('NaN'));
});
