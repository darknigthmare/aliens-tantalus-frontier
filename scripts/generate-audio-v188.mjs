// V188 — renders the 40 priority cues (bible §56.4) as 22.05 kHz mono WAV.
// Original offline synthesis, no samples. Requires no external tool.
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { AUDIO_CUES_V188, renderAudioCueV188 } from '../src/audio-cues-v188.js';
import { encodeWaveV132 } from './generate-audio-v132.mjs';
import { writeAudioManifestV77 } from './audio-scan-v77.mjs';

export async function generateAudioCuesV188(root = process.cwd()) {
  const directory = join(root, 'assets/audio/sfx'); await mkdir(directory, { recursive: true });
  for (const { id } of AUDIO_CUES_V188) await writeFile(join(directory, `${id}.wav`), encodeWaveV132(renderAudioCueV188(id)));
  await writeAudioManifestV77(root);
  return AUDIO_CUES_V188.length;
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  console.log(`${await generateAudioCuesV188()} original V188 cues generated.`);
}
