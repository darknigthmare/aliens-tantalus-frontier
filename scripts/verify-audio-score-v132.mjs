import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { AUDIO_SCORE_V132, AUDIO_PROVENANCE_V132, renderOriginalAudioV132 } from '../src/audio-score-v132.js';
import { normalizeAudioManifestV77 } from '../src/audio-assets-v77.js';

test('all eight optional banks are genuine files admitted by the existing manifest', async () => {
  const raw = JSON.parse(await readFile(new URL('../assets/audio/manifest.json', import.meta.url)));
  const manifest = normalizeAudioManifestV77(raw);
  assert.equal(AUDIO_SCORE_V132.length, 8); assert.equal(AUDIO_PROVENANCE_V132.samples, 'None');
  for (const track of AUDIO_SCORE_V132) {
    const sources = manifest.tracks[track.kind][track.id].sources;
    assert.equal(sources.length, 1, track.id);
    const source = sources[0], bytes = await readFile(new URL(`..${source.path}`, import.meta.url));
    assert.equal(bytes.length, source.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256);
    assert.equal(bytes.subarray(0, 4).toString(), track.kind === 'music' ? 'OggS' : 'RIFF');
  }
});

test('authored score is deterministic, audible, bounded, and music loops have quiet seams', () => {
  for (const track of AUDIO_SCORE_V132) {
    const audio = renderOriginalAudioV132(track.id, 22050), again = renderOriginalAudioV132(track.id, 22050);
    assert.deepEqual(audio.samples, again.samples);
    let squares = 0, peak = 0;
    for (const value of audio.samples) { assert(Number.isFinite(value)); peak = Math.max(peak, Math.abs(value)); squares += value ** 2; }
    const rms = Math.sqrt(squares / audio.samples.length);
    assert(rms > .014 && rms < .4, `${track.id}: RMS ${rms}`); assert(peak <= .841);
    if (track.kind === 'music') for (let channel = 0; channel < 2; channel++) {
      assert(Math.abs(audio.samples[channel] - audio.samples[audio.samples.length - 2 + channel]) < .01, track.id);
    }
  }
});

test('unrecognized audio requests and invalid sample rates are rejected', () => {
  assert.throws(() => renderOriginalAudioV132('not-a-track'));
  assert.throws(() => renderOriginalAudioV132('shot', Infinity));
});
