import { mkdir, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { AUDIO_SCORE_V132, renderOriginalAudioV132 } from '../src/audio-score-v132.js';
import { writeAudioManifestV77 } from './audio-scan-v77.mjs';

export function encodeWaveV132({ samples, sampleRate, channels, frames }) {
  const output = Buffer.alloc(44 + frames * channels * 2);
  output.write('RIFF', 0); output.writeUInt32LE(output.length - 8, 4); output.write('WAVEfmt ', 8);
  output.writeUInt32LE(16, 16); output.writeUInt16LE(1, 20); output.writeUInt16LE(channels, 22);
  output.writeUInt32LE(sampleRate, 24); output.writeUInt32LE(sampleRate * channels * 2, 28);
  output.writeUInt16LE(channels * 2, 32); output.writeUInt16LE(16, 34); output.write('data', 36);
  output.writeUInt32LE(output.length - 44, 40);
  for (let i = 0; i < samples.length; i++) output.writeInt16LE(Math.round(samples[i] * 32767), 44 + i * 2);
  return output;
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const root = process.cwd(), temporary = await mkdtemp(join(tmpdir(), 'atf-audio-v132-'));
  try {
    for (const score of AUDIO_SCORE_V132) {
      const directory = join(root, 'assets/audio', score.kind); await mkdir(directory, { recursive: true });
      const wave = encodeWaveV132(renderOriginalAudioV132(score.id));
      if (score.kind === 'sfx') await writeFile(join(directory, `${score.id}.wav`), wave);
      else {
        const source = join(temporary, `${score.id}.wav`); await writeFile(source, wave);
        execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', source,
          '-c:a', 'libvorbis', '-q:a', '5', '-map_metadata', '-1', '-metadata',
          'comment=Original Tantalus Frontier score; no external samples', join(directory, `${score.id}.ogg`)]);
      }
    }
    await writeAudioManifestV77(root);
    console.log('Eight original audio banks generated; ffmpeg is only required for regeneration.');
  } finally { await rm(temporary, { recursive: true, force: true }); }
}
