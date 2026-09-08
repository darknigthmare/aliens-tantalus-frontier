import { readdir, readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { AUDIO_FORMATS_V77, AUDIO_SLOTS_V77, emptyAudioManifestV77 } from '../src/audio-assets-v77.js';

export async function scanAudioV77(root = process.cwd()) {
  const manifest = emptyAudioManifestV77();
  for (const [kind, ids] of Object.entries(AUDIO_SLOTS_V77)) {
    const directory = join(root, 'assets', 'audio', kind);
    let files = [];
    try { files = await readdir(directory, { withFileTypes: true }); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    for (const id of ids) for (const format of AUDIO_FORMATS_V77) {
      const name = `${id}.${format.extension}`;
      if (!files.some(file => file.name === name && file.isFile() && !file.isSymbolicLink())) continue;
      const path = join(directory, name), info = await stat(path);
      if (!info.size || info.size > 24 * 1024 * 1024) continue;
      const bytes = await readFile(path);
      manifest.tracks[kind][id].sources.push({ path: `/assets/audio/${kind}/${name}`, mime: format.mime,
        bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
    }
  }
  return manifest;
}

export async function writeAudioManifestV77(root = process.cwd(), { check = false } = {}) {
  const manifest = await scanAudioV77(root), output = JSON.stringify(manifest, null, 2) + '\n';
  const path = join(root, 'assets', 'audio', 'manifest.json');
  if (check) { if (await readFile(path, 'utf8').catch(() => '') !== output) throw new Error('Audio manifest stale: run audio:scan.'); }
  else { await mkdir(join(root, 'assets', 'audio'), { recursive: true }); await writeFile(path, output); }
  return manifest;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const manifest = await writeAudioManifestV77(process.cwd(), { check: process.argv.includes('--check') });
  const slots = Object.values(manifest.tracks).flatMap(group => Object.values(group));
  console.log(`Audio: ${slots.filter(slot => slot.sources.length).length}/${slots.length} slots with real files; remaining slots use synth/silence.`);
}
