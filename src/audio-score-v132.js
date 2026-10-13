// Original compositions and sound design authored for this project. No samples
// or melodies taken from films, games, or commercial sound libraries.
export const AUDIO_SCORE_V132 = Object.freeze([
  { id: 'shot', kind: 'sfx', seconds: .24, seed: 13201 },
  { id: 'tracker', kind: 'sfx', seconds: .18, seed: 13202 },
  { id: 'hit', kind: 'sfx', seconds: .32, seed: 13203 },
  { id: 'ui', kind: 'sfx', seconds: .14, seed: 13204 },
  { id: 'alarm', kind: 'sfx', seconds: 1.2, seed: 13205 },
  { id: 'menu', kind: 'music', seconds: 24, seed: 13206,
    chords: [[38, 45, 53], [34, 41, 50], [43, 50, 58], [33, 40, 52]], beat: .75 },
  { id: 'hub', kind: 'music', seconds: 24, seed: 13207,
    chords: [[48, 55, 62], [45, 52, 60], [41, 48, 57], [43, 50, 59]], beat: .75 },
  { id: 'mission', kind: 'music', seconds: 24, seed: 13208,
    chords: [[38, 45, 50], [38, 46, 53], [36, 43, 50], [33, 40, 50]], beat: .5 }
].map(Object.freeze));

export const AUDIO_PROVENANCE_V132 = Object.freeze({
  origin: 'Original offline synthesis and composition for Tantalus Frontier',
  samples: 'None', renderer: 'renderOriginalAudioV132', revision: 132
});
const tau = Math.PI * 2;
const hz = midi => 440 * 2 ** ((midi - 69) / 12);
const env = (t, duration, attack = .008) => t < 0 || t >= duration ? 0
  : Math.min(1, t / attack) * Math.min(1, (duration - t) / Math.min(.4, duration * .25));

export function renderOriginalAudioV132(id, sampleRate = 44100) {
  const score = AUDIO_SCORE_V132.find(track => track.id === id);
  if (!score || !Number.isSafeInteger(sampleRate) || sampleRate < 8000 || sampleRate > 96000) throw new Error('Invalid audio score');
  const frames = Math.round(score.seconds * sampleRate), channels = score.kind === 'music' ? 2 : 1;
  const samples = new Float32Array(frames * channels);
  let seed = score.seed, previousNoise = 0;
  const noise = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2147483648 - 1; };
  const notes = [];
  if (score.kind === 'music') for (let chord = 0; chord < 4; chord++) {
    const tones = score.chords[chord], start = chord * 6;
    tones.forEach((midi, voice) => notes.push({ start, duration: 6, frequency: hz(midi), amp: .034, pan: (voice - 1) * .52, pad: true }));
    for (let step = 0; step < 6 / score.beat; step++) {
      const midi = tones[(step * 2 + chord) % tones.length] + 24;
      notes.push({ start: start + step * score.beat, duration: Math.min(1.15, 6 - step * score.beat),
        frequency: hz(midi), amp: id === 'mission' ? .034 : .023, pan: step % 2 ? .45 : -.45, pad: false });
    }
  }
  for (let i = 0; i < frames; i++) {
    const t = i / sampleRate;
    if (channels === 1) {
      const n = noise(), high = n - previousNoise; previousNoise = n;
      let value = 0;
      if (id === 'shot') value = env(t, score.seconds) * (.47 * high * Math.exp(-t * 48)
        + .37 * Math.sin(tau * (130 * t - 125 * t * t)) * Math.exp(-t * 25)
        + .13 * Math.sin(tau * 1120 * t) * Math.exp(-t * 62));
      if (id === 'hit') value = env(t, score.seconds) * (.24 * n * Math.exp(-t * 35)
        + .32 * Math.sin(tau * 78 * t) * Math.exp(-t * 17)
        + .16 * Math.sin(tau * 413 * t) * Math.exp(-t * 30));
      if (id === 'tracker') value = env(t, score.seconds) * (.38 * Math.sin(tau * 940 * t)
        + .1 * Math.sin(tau * 1880 * t)) * Math.exp(-t * 16);
      if (id === 'ui') value = env(t, score.seconds) * (.24 * Math.sin(tau * 660 * t) * Math.exp(-t * 36)
        + (t > .042 ? .22 * Math.sin(tau * 990 * (t - .042)) * Math.exp(-(t - .042) * 50) * Math.min(1, (t - .042) / .004) : 0));
      if (id === 'alarm') {
        const phase = t % .6;
        value = env(phase, .46, .035) * (.24 * Math.sin(tau * (380 * t + 17 * Math.sin(tau * t / .6)))
          + .1 * Math.sin(tau * 760 * t));
      }
      samples[i] = value;
    } else {
      // Integer cycle drones and contained note tails keep the loop seam quiet.
      const base = id === 'hub' ? 65 : 49;
      const droneFrequency = Math.round(base * score.seconds) / score.seconds;
      const drone = .023 * Math.sin(tau * droneFrequency * t) * (1 + .22 * Math.sin(tau * t / 6));
      let left = drone, right = drone;
      for (const note of notes) {
        const age = t - note.start;
        if (age < 0 || age >= note.duration) continue;
        const envelope = env(age, note.duration, note.pad ? .7 : .006);
        const decay = note.pad ? 1 : Math.exp(-age * (id === 'mission' ? 6 : 3.5));
        const harmonic = Math.sin(tau * note.frequency * age)
          + (note.pad ? .18 : .32) * Math.sin(tau * note.frequency * 2 * age);
        const value = note.amp * envelope * decay * harmonic;
        left += value * (1 - note.pan * .45); right += value * (1 + note.pan * .45);
      }
      if (id === 'mission') {
        const beatAge = t % score.beat;
        const pulse = .045 * Math.sin(tau * (58 * beatAge - 18 * beatAge ** 2)) * Math.exp(-beatAge * 19) * env(beatAge, .23, .004);
        left += pulse; right += pulse;
      }
      samples[i * 2] = left; samples[i * 2 + 1] = right;
    }
  }
  let peak = 0; for (const value of samples) peak = Math.max(peak, Math.abs(value));
  const gain = channels === 1 ? .78 / Math.max(peak, .01) : 1;
  for (let i = 0; i < samples.length; i++) samples[i] = Math.max(-.84, Math.min(.84, samples[i] * gain));
  return { samples, sampleRate, channels, frames, seconds: score.seconds };
}
