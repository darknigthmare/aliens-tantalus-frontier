import test from 'node:test';
import assert from 'node:assert/strict';
import { ARBITER_PROGRAMS_V191 } from '../src/xeno-arbiter-protocols-v191.js';
import { getXenoTrialsArchiveAccessV207 } from '../src/xeno-trials-archive-access-v207.js';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { XENO_TRIALS_CAMPAIGN_V119 } from '../src/xeno-trials-modes-v119.js';
import { beginXenoTrialsV96, checkpointXenoTrialsDuelV197 } from '../src/xeno-trials-progress-v96.js';
import { createStandaloneTrialsStore, STANDALONE_TRIALS_STORAGE_KEY } from '../src/xeno-trials-standalone-save.js';

function browserStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test('a new standalone terminal uses the native starters and persists settings in its own slot', () => {
  const campaign = '{"schema":52,"sentinel":"campaign-profile"}';
  const storage = browserStorage({ campaign, 'atf-language-v185': 'fr' });
  const store = createStandaloneTrialsStore(storage);
  assert.equal(store.hasSave, false);
  assert.equal(storage.getItem(STANDALONE_TRIALS_STORAGE_KEY), null);
  assert.deepEqual(store.progress().unlocked, ['warrior', 'runner', 'arachnoid']);
  assert.equal(store.progress().credits, 150);
  assert.deepEqual(store.settings(), { language: 'fr', music: 65, effects: 75, reducedMotion: false });
  const copy = store.progress();
  copy.unlocked.pop();
  assert.equal(store.progress().unlocked.length, 3);
  store.commitSettings({ language: 'en', effects: 20, reducedMotion: true });
  const reloaded = createStandaloneTrialsStore(storage);
  assert.deepEqual(reloaded.settings(), { language: 'en', music: 65, effects: 20, reducedMotion: true });
  assert.equal(storage.getItem('campaign'), campaign);
  assert.equal(storage.getItem('atf-language-v185'), 'fr');
});

test('an actual campaign duel keeps its ticket and native checkpoint through a fresh store and transferable backup', () => {
  const storage = browserStorage();
  const store = createStandaloneTrialsStore(storage);
  const started = beginXenoTrialsV96(store.progress(), {
    playerId: 'warrior', activityV119: { branch: 'campaign', id: XENO_TRIALS_CAMPAIGN_V119[0].id },
  }, { standaloneV207: true });
  assert.equal(started.applied, true);
  store.commitProgress(started.state);
  assert.equal(createStandaloneTrialsStore(storage).progress().pending.matchId, started.config.matchId);
  const match = createXenoTrialsMatchV96({ ...started.config, introSeconds: 0, holdRoundTransition: true });
  for (let step = 0; step < 220; step += 1) {
    stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, { right: true, light: step % 20 === 0 });
  }
  const live = getXenoTrialsSnapshotV96(match);
  const transaction = checkpointXenoTrialsDuelV197(store.progress(), live);
  assert.equal(transaction.applied, true);
  store.commitProgress(transaction.state);
  const reloaded = createStandaloneTrialsStore(storage);
  assert.deepEqual(reloaded.progress().pending.duelCheckpointV197.snapshot, { ...live, paused: true, accumulator: 0 });
  const otherDevice = createStandaloneTrialsStore(browserStorage());
  otherDevice.importBackup(reloaded.exportBackup());
  assert.deepEqual(otherDevice.profile(), reloaded.profile());
  const damaged = JSON.parse(reloaded.exportBackup());
  damaged.progress.pending.duelCheckpointV197.snapshot.config.stageId = 'unrecognized-stage';
  assert.throws(() => otherDevice.importBackup(JSON.stringify(damaged)), /profile-checkpoint/);
  assert.deepEqual(otherDevice.profile(), reloaded.profile());
});

test('failed saves, incompatible imports and open tabs cannot overwrite valid stored progress', () => {
  const storage = browserStorage();
  const first = createStandaloneTrialsStore(storage);
  const second = createStandaloneTrialsStore(storage);
  first.commitSettings({ music: 35 });
  const stored = storage.getItem(STANDALONE_TRIALS_STORAGE_KEY);
  assert.throws(() => second.commitSettings({ music: 20 }), /profile-changed/);
  assert.equal(second.isCurrent(), false);
  assert.throws(() => second.importBackup(first.exportBackup()), /profile-changed/);
  assert.throws(() => first.importBackup(JSON.stringify({ schema: 52, progress: first.progress() })), /profile-format/);
  assert.equal(storage.getItem(STANDALONE_TRIALS_STORAGE_KEY), stored);
  storage.setItem = () => { throw new Error('quota'); };
  assert.throws(() => first.commitSettings({ music: 77 }), /quota/);
  assert.equal(first.settings().music, 35);
  assert.equal(storage.getItem(STANDALONE_TRIALS_STORAGE_KEY), stored);
});

test('an unreadable slot is preserved until a valid backup explicitly replaces it', () => {
  const storage = browserStorage({ [STANDALONE_TRIALS_STORAGE_KEY]: '{broken' });
  const damaged = createStandaloneTrialsStore(storage);
  assert.equal(damaged.issue, 'profile-unreadable');
  assert.throws(() => damaged.commitSettings({ music: 40 }), /profile-unreadable/);
  assert.throws(() => damaged.importBackup('invalid json'), SyntaxError);
  assert.equal(storage.getItem(STANDALONE_TRIALS_STORAGE_KEY), '{broken');
  const backup = createStandaloneTrialsStore(browserStorage());
  backup.commitSettings({ music: 20 });
  damaged.importBackup(backup.exportBackup());
  assert.equal(damaged.issue, null);
  assert.deepEqual(damaged.profile(), backup.profile());
});

test('every standalone Arbiter ticket requires completion of the MIRE campaign and uses the native ticket engine', () => {
  const store = createStandaloneTrialsStore(browserStorage());
  const progress = store.progress();
  const campaignIds = XENO_TRIALS_CAMPAIGN_V119.map(mission => mission.id);
  assert.equal(campaignIds.length, 19);
  progress.modesV119.campaignCleared = campaignIds.slice(1);
  const partial = getXenoTrialsArchiveAccessV207({ standaloneV207: true, trialsProgress: progress });
  assert.equal(partial.available, false);
  assert.equal(partial.completed, 18);
  for (const program of ARBITER_PROGRAMS_V191) {
    const config = { playerId: 'warrior', activityV119: { branch: program.branch, id: program.id } };
    assert.equal(beginXenoTrialsV96(progress, config, { standaloneV207: true }).reason, 'arbiter-archives-locked');
    const complete = { ...progress, modesV119: { ...progress.modesV119, campaignCleared: campaignIds } };
    assert.equal(beginXenoTrialsV96(complete, config).reason, 'arbiter-archives-locked');
    const started = beginXenoTrialsV96(complete, config, { standaloneV207: true });
    assert.equal(started.applied, true, program.id);
    assert.equal(started.config.stageId, program.stageId);
    store.commitProgress(started.state);
    const invalid = JSON.parse(store.exportBackup());
    invalid.progress.modesV119.campaignCleared = campaignIds.slice(1);
    assert.throws(() => store.importBackup(JSON.stringify(invalid)), /profile-archive/);
  }
});
