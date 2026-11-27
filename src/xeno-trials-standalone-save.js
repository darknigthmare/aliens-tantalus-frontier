import { normalizeLanguageV185 } from './i18n-v185.js';
import { getArbiterProgramV191 } from './xeno-arbiter-protocols-v191.js';
import { getXenoTrialsArchiveAccessV207 } from './xeno-trials-archive-access-v207.js';
import { createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96 } from './xeno-trials-progress-v96.js';

export const STANDALONE_TRIALS_STORAGE_KEY = 'atf:xeno-trials:standalone:v1';
export const STANDALONE_TRIALS_SAVE_LIMIT = 1024 * 1024;
const SAVE_FORMAT = 'atf-xeno-trials-standalone';
const SAVE_SCHEMA = 1;
const DEFAULT_SETTINGS = Object.freeze({ language: 'fr', music: 65, effects: 75, reducedMotion: false });
const COUNTERS = ['serial', 'credits', 'xp', 'wins', 'losses', 'draws'];
const record = value => value != null && typeof value === 'object' && !Array.isArray(value);
const copy = value => JSON.parse(JSON.stringify(value));
const volume = (value, fallback) => Number.isInteger(value) && value >= 0 && value <= 100 ? value : fallback;
const fits = source => typeof source === 'string' && source.length <= STANDALONE_TRIALS_SAVE_LIMIT
  && new TextEncoder().encode(source).byteLength <= STANDALONE_TRIALS_SAVE_LIMIT;

function normalizeSettings(value) {
  return {
    language: normalizeLanguageV185(value.language),
    music: volume(value.music, DEFAULT_SETTINGS.music),
    effects: volume(value.effects, DEFAULT_SETTINGS.effects),
    reducedMotion: value.reducedMotion === true,
  };
}

function createProfile() {
  return {
    format: SAVE_FORMAT,
    schema: SAVE_SCHEMA,
    progress: normalizeXenoTrialsProgressV96(createXenoTrialsProgressV96()),
    settings: { ...DEFAULT_SETTINGS },
  };
}

function normalizeProfile(value) {
  if (!record(value) || value.format !== SAVE_FORMAT || value.schema !== SAVE_SCHEMA
    || !record(value.progress) || value.progress.schema !== 96 || !record(value.settings)
    || !COUNTERS.every(key => Number.isInteger(value.progress[key]) && value.progress[key] >= 0)
    || !Array.isArray(value.progress.unlocked) || !Array.isArray(value.progress.ledger)
    || !record(value.progress.modesV119) || (value.progress.pending != null && !record(value.progress.pending))) {
    throw new Error('profile-format');
  }

  const progress = normalizeXenoTrialsProgressV96(value.progress);
  const pending = value.progress.pending;
  if ((pending && !progress.pending)
    || (pending?.checkpointV186 && !progress.pending.checkpointV186)
    || (pending?.duelCheckpointV197 && !progress.pending.duelCheckpointV197)) {
    throw new Error('profile-checkpoint');
  }
  if (getArbiterProgramV191(progress.pending?.config.activityV119?.id)
    && !getXenoTrialsArchiveAccessV207({ standaloneV207: true, trialsProgress: progress }).available) {
    throw new Error('profile-archive');
  }

  return { format: SAVE_FORMAT, schema: SAVE_SCHEMA, progress, settings: normalizeSettings(value.settings) };
}

function parseProfile(source) {
  if (!fits(source)) throw new Error('profile-size');
  return normalizeProfile(JSON.parse(source));
}

/** Owns the standalone slot. Game transactions become visible only after the browser stores them. */
export function createStandaloneTrialsStore(storage) {
  let raw = null;
  let profile = createProfile();
  let issue = null;
  try {
    raw = storage.getItem(STANDALONE_TRIALS_STORAGE_KEY);
    if (raw !== null) profile = parseProfile(raw);
  } catch {
    issue = raw === null ? 'storage-unavailable' : 'profile-unreadable';
  }

  function assertCurrent() {
    if (storage?.getItem(STANDALONE_TRIALS_STORAGE_KEY) !== raw) {
      issue = 'profile-changed';
      throw new Error(issue);
    }
  }

  function save(next) {
    assertCurrent();
    const serialized = JSON.stringify(next);
    if (!fits(serialized)) throw new Error('profile-size');
    storage.setItem(STANDALONE_TRIALS_STORAGE_KEY, serialized);
    raw = serialized;
    profile = next;
    issue = null;
  }

  function requireProfile() {
    if (issue) throw new Error(issue);
  }

  return {
    get issue() { return issue; },
    get hasSave() { return raw !== null; },
    isCurrent() {
      try { assertCurrent(); return true; } catch { return false; }
    },
    profile: () => copy(profile),
    progress: () => copy(profile.progress),
    settings: () => ({ ...profile.settings }),
    commitProgress(progress) {
      requireProfile();
      save(normalizeProfile({ ...profile, progress }));
    },
    commitSettings(settings) {
      requireProfile();
      save({ ...profile, settings: normalizeSettings({ ...profile.settings, ...settings }) });
    },
    exportBackup() {
      requireProfile();
      return JSON.stringify(profile);
    },
    importBackup(source) {
      save(parseProfile(source));
    },
  };
}
