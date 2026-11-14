import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { AUDIO_CUES_V188, AUDIO_CUE_IDS_V188, renderAudioCueV188, cueForGameEventV188, casteCueV188,
  surfaceCueV188, shotCueV188, FOOTSTEP_STRIDE_V188 } from '../src/audio-cues-v188.js';
import { AUDIO_SLOTS_V77, AUDIO_MUSIC_FALLBACK_V184, normalizeAudioManifestV77 } from '../src/audio-assets-v77.js';
import { AudioDirector } from '../src/audio.js';
import { encodeWaveV132 } from './generate-audio-v132.mjs';
import { fixture, tick } from './engine-host-v188.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('the 40 cues follow the bible §56.4 families and extend the V184 slots', () => {
  assert.equal(AUDIO_CUES_V188.length, 41); assert.equal(new Set(AUDIO_CUE_IDS_V188).size, 41);
  assert.equal(AUDIO_CUE_IDS_V188.at(-1), 'container-knock', 'Act III extra cue (bible §5.3)');
  const families = {}; for (const cue of AUDIO_CUES_V188) families[cue.family] = (families[cue.family] || 0) + 1;
  assert.deepEqual(families, { tracker: 4, step: 5, door: 5, airlock: 2, lift: 2, alarm: 3, ambience: 4, cry: 8, weapon: 8 });
  assert.deepEqual(AUDIO_SLOTS_V77.sfx.slice(0, 10), ['shot', 'tracker', 'hit', 'ui', 'alarm', 'checkpoint', 'locked', 'kill', 'pickup', 'victory']);
  assert.deepEqual(AUDIO_SLOTS_V77.sfx.slice(10), AUDIO_CUE_IDS_V188);
  assert.deepEqual(AUDIO_SLOTS_V77.music, ['menu', 'hub', 'mission', 'travel', 'briefing', 'archives', 'alert', 'boss', 'ending', 'calm']);
  assert.deepEqual(AUDIO_MUSIC_FALLBACK_V184, { travel: 'menu', briefing: 'menu', archives: 'menu', alert: 'mission', boss: 'mission', ending: 'menu', calm: 'hub' });
});

test('rendering is deterministic, audible, bounded and the shipped WAV files are exactly the render', () => {
  const manifest = normalizeAudioManifestV77(JSON.parse(read('assets/audio/manifest.json')));
  for (const { id, family } of AUDIO_CUES_V188) {
    const a = renderAudioCueV188(id), b = renderAudioCueV188(id);
    assert.deepEqual(a.samples, b.samples, id);
    let peak = 0, energy = 0; for (const value of a.samples) { peak = Math.max(peak, Math.abs(value)); energy += value * value; }
    assert.ok(peak > .3 && peak <= .84, `${id} peak ${peak}`);
    assert.ok(Math.sqrt(energy / a.samples.length) > .01, `${id} is audible`);
    const bytes = read(`assets/audio/sfx/${id}.wav`);
    assert.equal(sha(bytes), sha(encodeWaveV132(a)), `${id} file matches its original render`);
    const source = manifest.tracks.sfx[id].sources[0];
    assert.equal(source.path, `/assets/audio/sfx/${id}.wav`); assert.equal(source.sha256, sha(bytes));
    if (family === 'ambience') {
      const { samples } = a; assert.ok(Math.abs(samples[0] - samples.at(-1)) < .9, `${id} loop seam`);
    }
  }
  assert.throws(() => renderAudioCueV188('unknown'), /Invalid audio cue/);
});

test('game events map to cues; castes, weapons and surfaces resolve conservatively', () => {
  assert.equal(cueForGameEventV188({ type: 'door', open: true }), 'door-open');
  assert.equal(cueForGameEventV188({ type: 'door', open: false }), 'door-close');
  assert.equal(cueForGameEventV188({ type: 'lift-arrived-v130' }), 'lift-arrive');
  assert.equal(cueForGameEventV188({ type: 'horde-warning-v132' }), 'alarm-general');
  assert.equal(cueForGameEventV188({ type: 'false-echo-v188' }), 'tracker-false-echo');
  assert.equal(cueForGameEventV188({ type: 'squad-fire' }), 'weapon-m41a-burst');
  assert.equal(cueForGameEventV188({ type: 'reload-started' }), 'weapon-reload');
  assert.equal(cueForGameEventV188({ type: 'kill' }), null);
  assert.equal(casteCueV188({ family: 'xenomorph-queen' }), 'cry-queen');
  assert.equal(casteCueV188({ name: 'Runner' }), 'cry-runner');
  assert.equal(casteCueV188({ name: 'Colonial security' }), null);
  assert.equal(shotCueV188({ weaponMode: 'secondary' }, {}), 'weapon-pistol');
  assert.equal(shotCueV188({ weaponMode: 'primary' }, { id: 'weapon-001-m41a-pulse-rifle' }), null);
  assert.equal(shotCueV188({ weaponMode: 'primary' }, { id: 'weapon-m56-smartgun' }), 'weapon-smartgun');
  assert.equal(surfaceCueV188({ template: 'ship-interior-vertical' }), 'step-metal');
  assert.equal(surfaceCueV188({ template: 'relay-catwalk' }), 'step-grating');
  assert.equal(surfaceCueV188({ hive: true }), 'step-resin');
  assert.equal(surfaceCueV188({ biome: 'colony street' }), 'step-concrete');
  assert.equal(surfaceCueV188({ biome: 'flooded' }), 'step-water');
});

test('AudioDirector plays a known cue (file or synth) and changes mood without stopping effects', () => {
  const audio = new AudioDirector({ fetchImpl: null, AudioContextCtor: null, AudioCtor: null });
  assert.equal(audio.cue('not-a-cue'), false);
  let fallbacks = 0; audio.playEffect = (id, fallback) => { fallbacks += typeof fallback === 'function' ? 1 : 0; return id; };
  for (const id of AUDIO_CUE_IDS_V188) assert.equal(audio.cue(id), id);
  assert.equal(fallbacks, 41);
  let stoppedEffects = 0; audio.stopEffects = () => { stoppedEffects++; }; audio.stopMusic = () => {}; audio.playScene = async () => true;
  assert.equal(audio.setMusicMoodV188('alert'), true); assert.equal(audio.scene, 'alert');
  assert.equal(audio.setMusicMoodV188('alert'), false); assert.equal(audio.setMusicMoodV188('nope'), false);
  assert.equal(stoppedEffects, 0);
  audio.nextShotCueV188 = 'weapon-pistol'; assert.equal(audio.shot(), 'weapon-pistol'); assert.equal(audio.nextShotCueV188, null);
  assert.equal(audio.shot(), 'shot');
});

test('production engine: walking emits surface footsteps every stride, teleports do not', async () => {
  const { engine } = await fixture();
  const cues = []; engine.audio = { cue: id => cues.push(id), shot() {}, tracker() {}, hit() {}, alarm() {} };
  Object.assign(engine.player, { grounded: true, climbing: false, alive: true });
  for (let n = 0; n < 30; n++) { engine.player.x += 10; tick(engine, 1 / 60); engine.player.grounded = true; }
  const steps = cues.filter(id => id.startsWith('step-'));
  assert.ok(steps.length >= 3 && steps.length <= 5, `${steps.length} steps for 300 px at stride ${FOOTSTEP_STRIDE_V188}`);
  assert.ok(steps.every(id => id === 'step-metal'));
  const before = cues.length; engine.player.x += 1500; tick(engine, 1 / 60);
  assert.equal(cues.length, before, 'a teleport is not a step');
  engine.stop();
});

test('app routes cues and music moods from game events', () => {
  const app = read('src/app.js').toString();
  assert.match(app, /const cueV188 = enemyV188 \? casteCueV188\(enemyV188\) : cueForGameEventV188\(event\);/);
  assert.match(app, /audio\.setMusicMoodV188\(event\.phase === 'peak' \? 'alert'/);
  assert.match(app, /audio\.setMusicMoodV188\('boss'\)/);
});
