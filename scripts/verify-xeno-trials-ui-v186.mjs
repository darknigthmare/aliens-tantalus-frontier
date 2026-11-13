import test from 'node:test';
import assert from 'node:assert/strict';
import { XenoTrialsUiV96 } from '../src/xeno-trials-ui-v96.js';
import { getXenoTrialsProgramPageV186 } from '../src/xeno-trials-programs-v186.js';
import { XENO_TRIALS_HORDE_PROTOCOLS_V186 as protocols } from '../src/xeno-trials-horde-v180.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, getXenoTrialsSnapshotV96 } from '../src/xeno-trials-engine-v96.js';
import { createXenoTrialsProgressV96, beginXenoTrialsV96, normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';

// Minimal DOM controls below are declared doubles. Native activity, checkpoint
// transactions and engine snapshots are retained, with no save/game mutations
// supplied by a paint or by an announcement counter.
function host() {
  const elements = new Map(), attributes = new Map();
  const el = key => {
    if (!elements.has(key)) elements.set(key, { value: '', hidden: false, disabled: false, innerHTML: '', textContent: '',
      writes: [], addEventListener() {}, setAttribute() {}, focus() {} });
    return elements.get(key);
  };
  el('form').elements = new Proxy({}, { get: (_, key) => el(`form-${String(key)}`) });
  const root = { innerHTML: '', ownerDocument: { hidden: false, hasFocus: () => true },
    querySelector: selector => el(selector.match(/data-xt="([^"]+)"/)?.[1] || 'super-control'),
    addEventListener() {}, setAttribute: (key, value) => attributes.set(key, value),
    getAttribute: key => attributes.get(key), removeAttribute: key => attributes.delete(key) };
  let state = createXenoTrialsProgressV96(), writable = true, failWrite = false, commits = 0;
  class Ui extends XenoTrialsUiV96 { updateOpponents() {} restorePendingSelection() {} render() {} }
  const ui = new Ui({ root, getProgress: () => state, canCommit: () => writable,
    onCommit(next) { if (failWrite) throw new Error('storage fixture'); state = next; commits++; }, onReturn() {} });
  ui.active = true;
  return { ui, el, get state() { return state; }, get commits() { return commits; },
    setState(next) { state = next; }, setWritable(value) { writable = value; }, setFailWrite(value) { failWrite = value; } };
}
function ticketSnapshot(h) {
  const started = beginXenoTrialsV96(h.state, { playerId: 'warrior', activityV119: { branch: 'horde', id: protocols[0].id } });
  assert.equal(started.applied, true); h.setState(started.state);
  const match = createXenoTrialsMatchV96({ ...started.config, introSeconds: 0 });
  for (let tick = 0; tick < 12; tick++) stepXenoTrialsMatchV96(match, 1 / 120, {}, {});
  return getXenoTrialsSnapshotV96(match);
}

test('all eighty protocol identities remain reachable exactly once across bounded pages and both forty-entry filters', () => {
  const before = JSON.stringify(protocols), ids = [];
  for (let page = 0; page < 7; page++) {
    const result = getXenoTrialsProgramPageV186(protocols, { page });
    assert.ok(result.entries.length <= 12); assert.equal(result.total, 80);
    ids.push(...result.entries.map(entry => entry.id));
  }
  assert.deepEqual(ids, protocols.map(entry => entry.id)); assert.equal(new Set(ids).size, 80);
  for (const kind of ['standard', 'boss']) {
    const all = [];
    for (let page = 0; page < 4; page++) {
      const result = getXenoTrialsProgramPageV186(protocols, { page, kind });
      assert.equal(result.total, 40); all.push(...result.entries);
    }
    assert.equal(all.length, 40); assert.ok(all.every(entry => Boolean(entry.bossFinaleV186) === (kind === 'boss')));
  }
  assert.equal(getXenoTrialsProgramPageV186(protocols, { page: Infinity }).page, 0);
  assert.equal(getXenoTrialsProgramPageV186([], { page: 4 }).start, 0);
  assert.equal(JSON.stringify(protocols), before);
});

test('the native terminal filter and next-page controls expose boss dossiers without losing their activity IDs', () => {
  const h = host(); assert.equal(h.ui.chooseBranchV119('horde'), true);
  h.el('program-filter').value = 'boss'; h.ui.renderActivitiesV119(h.ui.state());
  assert.match(h.el('program-page').textContent, /1 \/ 4/u);
  assert.ok(h.el('activity-board').innerHTML.includes(protocols[40].id));
  assert.ok(!h.el('activity-board').innerHTML.includes(`data-xt-activity="${protocols[0].id}"`));
  h.el('program-next').onclick(); assert.match(h.el('program-page').textContent, /2 \/ 4/u);
  assert.equal(h.ui.chooseActivityV119(protocols[52].id), true);
  assert.deepEqual(h.ui.activityV119, { branch: 'horde', id: protocols[52].id });
});

test('checkpoint UI commits a native snapshot, persists the last stop before closing, and never writes from a stale owner', () => {
  const h = host(), snapshot = ticketSnapshot(h), generation = h.ui.generation;
  assert.equal(h.ui.persistCheckpointV186(snapshot, generation), true);
  assert.ok(h.state.pending.checkpointV186); assert.match(h.el('checkpoint-status').textContent, /VAGUE 1 \/ 2/u);
  const saved = normalizeXenoTrialsProgressV96(h.state); assert.equal(saved.credits, 150);
  const commits = h.commits;
  assert.equal(h.ui.persistCheckpointV186(snapshot, generation - 1), false);
  h.setWritable(false); assert.equal(h.ui.persistCheckpointV186(snapshot, generation), false); assert.equal(h.commits, commits);
  h.setWritable(true);
  h.ui.runtime = { stop() { assert.equal(h.ui.active, true); h.ui.persistCheckpointV186(snapshot, generation); } };
  h.ui.close(); assert.equal(h.ui.active, false); assert.equal(h.ui.generation, generation + 1);
  assert.equal(h.commits, commits + 1);
});

test('checkpoint write failure is explicit and retains the durable ticket and economy', () => {
  const h = host(), snapshot = ticketSnapshot(h), before = structuredClone(h.state);
  h.setFailWrite(true); assert.equal(h.ui.persistCheckpointV186(snapshot, h.ui.generation), false);
  assert.match(h.el('checkpoint-status').textContent, /Reprise non sauvegardée/u);
  assert.equal(h.el('retry-checkpoint').hidden, false);
  assert.equal(h.el('retry-checkpoint-overlay').hidden, false);
  assert.deepEqual(h.state, before); assert.equal(h.commits, 0);
  h.ui.updateMatch({ ...snapshot, paused: true, resumedV186: true, checkpointV186: { saved: false } });
  assert.match(h.el('checkpoint-status').textContent, /Reprise non sauvegardée/u);
  let retried = 0;
  h.ui.runtime = { saveCheckpoint() { retried++; return h.ui.persistCheckpointV186(snapshot, h.ui.generation); } };
  h.setFailWrite(false); h.el('retry-checkpoint').onclick();
  assert.equal(retried, 1); assert.equal(h.el('retry-checkpoint').hidden, true);
  assert.equal(h.el('retry-checkpoint-overlay').hidden, true);
  assert.ok(h.state.pending.checkpointV186);
});

test('an explicit restart clears only its checkpoint and launches the unchanged saved ticket', () => {
  const h = host(), snapshot = ticketSnapshot(h);
  assert.equal(h.ui.persistCheckpointV186(snapshot, h.ui.generation), true);
  const config = structuredClone(h.state.pending.config); let launched;
  h.ui.launch = value => { launched = value; };
  h.el('restart-from-start').onclick();
  assert.equal(h.state.pending.checkpointV186, undefined);
  assert.deepEqual(h.state.pending.config, config); assert.deepEqual(launched, config);
  assert.equal(h.state.credits, 150);
});

test('the boss HUD reads native rank/health and announces phase changes without narrating every damage tick', () => {
  const h = host(), protocol = protocols[40];
  const match = createXenoTrialsMatchV96({ playerId: 'warrior', introSeconds: 0, activityV119: { branch: 'horde', id: protocol.id } });
  // Explicit display fixture: this prepares only the finale view. The native
  // engine and boss suites separately exercise reaching and defeating it.
  match.hordeV180.wave = protocol.bossFinaleV186.wave; match.hordeV180.waveSpawned = 1;
  match.fighters = [match.fighters[0], { ...match.fighters[1], id: protocol.bossFinaleV186.fighterId,
    hp: 120, enemyRankV186: 'boss', bossIdV186: protocol.bossFinaleV186.fighterId }];
  h.ui.updateMatch(match);
  assert.equal(h.el('boss-hud').hidden, false); assert.equal(h.el('boss-hp').max, 140); assert.equal(h.el('boss-hp').value, 120);
  assert.equal(h.el('boss-phase').textContent, 'CONTACT MAJEUR ACTIF');
  const announcement = h.el('horde-announcement').textContent;
  match.fighters[1].hp = 100; h.ui.updateMatch(match);
  assert.equal(h.el('boss-hp').value, 100); assert.equal(h.el('horde-announcement').textContent, announcement);
  match.fighters = match.fighters.slice(0, 1); h.ui.updateMatch(match);
  assert.equal(h.el('boss-phase').textContent, 'CONTACT MAJEUR NEUTRALISÉ');
  assert.notEqual(h.el('horde-announcement').textContent, announcement);
});
