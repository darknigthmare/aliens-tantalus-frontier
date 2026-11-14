// Regression tests, bug hunt P2 "audio après cinématique, validation des réglages, langue, réactivité" (2026-11-14).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as audioModule from '../src/audio.js';
import * as saveModule from '../src/save.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const appSource = read('src/app.js');
const functionBody = (source, name) => {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} exists`);
  const next = source.indexOf('\nfunction ', start + 10);
  return source.slice(start, next < 0 ? undefined : next);
};
const silentDirector = () => new audioModule.AudioDirector({ fetchImpl: null, AudioContextCtor: null, AudioCtor: null });
const memoryStorage = () => {
  const map = new Map();
  return { getItem: key => map.has(key) ? map.get(key) : null, setItem: (key, value) => map.set(key, String(value)),
    removeItem: key => map.delete(key), key: index => [...map.keys()][index] ?? null, get length() { return map.size; } };
};

// —— 1. Audio mood after a story cinematic ——
test('cinematic audio: a mission keeps its live alert/boss mood after a cinematic, other views take their own scene', () => {
  const { cinematicReturnSceneV188 } = audioModule;
  assert.equal(typeof cinematicReturnSceneV188, 'function');
  for (const mood of ['alert', 'boss', 'calm', 'mission'])
    assert.equal(cinematicReturnSceneV188({ viewBefore: 'play', viewAfter: 'play', sceneBefore: mood, viewScene: 'mission' }), mood);
  // The mission ended during the cinematic: the new view decides.
  assert.equal(cinematicReturnSceneV188({ viewBefore: 'play', viewAfter: 'command', sceneBefore: 'boss', viewScene: 'menu' }), 'menu');
  // Hub and briefing keep the view scene (the ending theme can replace the briefing theme).
  assert.equal(cinematicReturnSceneV188({ viewBefore: 'operations', viewAfter: 'operations', sceneBefore: 'briefing', viewScene: 'ending' }), 'ending');
  assert.equal(cinematicReturnSceneV188({ viewBefore: 'play', viewAfter: 'play', sceneBefore: null, viewScene: 'mission' }), 'mission');
});

test('cinematic audio: restoring the mood does not cut the effects that are still playing', () => {
  const director = silentDirector();
  assert.equal(typeof director.restoreMoodV188, 'function');
  director.setMusicMoodV188('boss');
  const sceneBefore = director.scene;
  director.setMusicMoodV188('travel'); // the cinematic's own music
  let stopped = 0; const stopEffects = director.stopEffects.bind(director);
  director.stopEffects = () => { stopped += 1; stopEffects(); };
  director.restoreMoodV188(audioModule.cinematicReturnSceneV188({ viewBefore: 'play', viewAfter: 'play', sceneBefore, viewScene: 'mission' }));
  assert.equal(director.scene, 'boss');
  assert.equal(stopped, 0, 'mission effects survive the end of the cinematic');
  // A cinematic without music only faded the track: the same mood is resumed, still without a cut.
  director.stopMusic(0.6); director.restoreMoodV188('boss');
  assert.equal(director.scene, 'boss'); assert.equal(stopped, 0);
});

test('cinematic audio: playStoryCinematicV188 captures the scene before and restores it through the mood path', () => {
  const body = functionBody(appSource, 'playStoryCinematicV188');
  assert.doesNotMatch(body, /audio\.setScene\(viewAudioSceneV188\(activeView\)\)/, 'no blind reset to the plain mission scene');
  assert.match(body, /sceneBefore = audio\.scene/);
  assert.match(body, /audio\.restoreMoodV188\(cinematicReturnSceneV188\(/);
});

// —— 2. Settings validation in migrateSave ——
test('settings: invalid closed choices and volumes fall back to their defaults', () => {
  const base = saveModule.createDefaultSave(1).settings;
  const save = saveModule.createDefaultSave(1);
  Object.assign(save.settings, { music: 7, effects: 'loud', quality: 'ultra', contrast: 42, difficulty: 'godmode', language: 'de',
    colorblindV188: 'sepia', textScaleV188: 9, customDifficultyV188: { enemyHealth: 99, enemyDamage: 'x' } });
  const migrated = saveModule.migrateSave(save, 1).settings;
  assert.equal(migrated.music, 1, 'volume clamped to 1');
  assert.equal(migrated.effects, base.effects);
  assert.equal(migrated.quality, base.quality);
  assert.equal(migrated.contrast, base.contrast);
  assert.equal(migrated.difficulty, base.difficulty);
  assert.equal(migrated.language, base.language);
  assert.equal(migrated.colorblindV188, 'off');
  assert.equal(migrated.textScaleV188, 1);
  assert.equal(migrated.customDifficultyV188.enemyHealth, 1);
  assert.equal(migrated.customDifficultyV188.enemyDamage, 1);
  const negative = saveModule.migrateSave({ ...save, settings: { ...save.settings, music: -3, effects: null } }, 1).settings;
  assert.equal(negative.music, 0); assert.equal(negative.effects, base.effects, 'null is not read as a muted volume');
});

test('settings: every valid value is kept unchanged, byte for byte, while its invalid neighbour is repaired', () => {
  const save = saveModule.createDefaultSave(1);
  Object.assign(save.settings, { music: 0.35, effects: 0, quality: 'low', contrast: 'high', difficulty: 'custom', language: 'en',
    colorblindV188: 'tritanopia', textScaleV188: 1.3, customDifficultyV188: { enemyHealth: 1.5, enemyDamage: .75, enemySpeed: 1.2,
      spawnMultiplier: 2, ammoFound: .5, alertFrequency: 1.25 } });
  const once = saveModule.migrateSave(save, 1);
  assert.equal(JSON.stringify(once.settings), JSON.stringify(save.settings));
  assert.equal(JSON.stringify(saveModule.migrateSave(once, 1).settings), JSON.stringify(once.settings), 'idempotent');
  for (const difficulty of ['story', 'standard', 'nightmare', 'custom'])
    assert.equal(saveModule.migrateSave({ ...save, settings: { ...save.settings, difficulty } }, 1).settings.difficulty, difficulty);
  const mixed = saveModule.migrateSave({ ...save, settings: { ...save.settings, contrast: 'neon' } }, 1).settings;
  assert.equal(JSON.stringify({ ...mixed, contrast: 'high' }), JSON.stringify(save.settings), 'only the invalid key changes');
  assert.equal(mixed.contrast, 'standard');
});

test('settings: a commit of an invalid value from the settings screen is normalised as well', () => {
  const system = new saveModule.SaveSystem(memoryStorage());
  system.commit({ settings: { ...system.data.settings, quality: 'medium', music: Infinity } });
  assert.equal(system.data.settings.quality, 'high');
  assert.equal(system.data.settings.music, 0.45);
});

// —— 3. Save language mirrors the localStorage language ——
test('language: the save field follows the chosen language; localStorage stays the source of truth', () => {
  const { syncSaveLanguageV188 } = saveModule;
  assert.equal(typeof syncSaveLanguageV188, 'function');
  const storage = memoryStorage();
  const system = new saveModule.SaveSystem(storage);
  assert.equal(system.data.settings.language, 'fr');
  assert.equal(syncSaveLanguageV188(system, 'en'), true);
  assert.equal(system.data.settings.language, 'en');
  assert.equal(storage.getItem('atf-language-v185'), null, 'the language key is written only by i18n-v185');
  assert.equal(syncSaveLanguageV188(system, 'en'), false, 'no redundant commit');
  assert.equal(syncSaveLanguageV188(system, 'xx'), false);
  system.recoveryNeeded = { profile: 1 };
  assert.equal(syncSaveLanguageV188(system, 'fr'), false, 'a profile in recovery is never written');
  assert.equal(system.data.settings.language, 'en');
  const handler = appSource.slice(appSource.indexOf("byId('language-select-v185')"), appSource.indexOf('LANGUAGE_EVENT_V185, () =>'));
  assert.match(handler, /syncSaveLanguageV188\(saveSystem, language\)/, 'the language select mirrors its choice into the save');
});
