import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = resolve(repoRoot, 'assets/openai/sprites/manifest.json');
const checkOnly = process.argv.includes('--check');
const originalText = await readFile(manifestPath, 'utf8');
const manifest = JSON.parse(originalText);

if (manifest.sheets.length !== 27) throw new Error(`Expected 27 sprite sheets, received ${manifest.sheets.length}.`);

const runtimeConsumers = (sheet) => {
  const consumers = new Set(['src/sprite-animation-runtime.js', 'src/game-v52-runtime.js']);
  if (['player', 'enemy', 'vehicle', 'weapon'].includes(sheet.family)) consumers.add('src/game.js');
  if (sheet.family === 'npc') consumers.add('src/hub-v52-runtime.js');
  if (sheet.id === 'player.echo9-marine.locomotion' || (sheet.family === 'npc' && sheet.wave !== 'v52')) consumers.add('src/hub-game.js');
  if (sheet.wave === 'v52') consumers.add('src/v50-visuals.js');
  return [...consumers];
};

manifest.sheets = manifest.sheets.map((source) => {
  const sheet = { ...source };
  if (sheet.id === 'npc.leila-sorensen.locomotion') sheet.id = 'npc.leila-s-rensen.locomotion';
  sheet.sourceFacing = sheet.id === 'enemy.xenomorph-drone.combat' ? 'left' : 'right';
  sheet.identityVerified = sheet.id !== 'player.echo9-marine.combat';
  sheet.runtime = {
    status: 'referenced',
    consumers: runtimeConsumers(sheet)
  };
  return sheet;
});

const requiredIds = [
  'player.echo9-marine.locomotion',
  'player.echo9-marine.combat',
  'enemy.xenomorph-drone.locomotion',
  'enemy.xenomorph-drone.combat',
  'npc.leila-s-rensen.locomotion',
  'vehicle.m577-apc.action',
  'weapon.m41a-pulse-rifle.action'
];
const ids = new Set(manifest.sheets.map((sheet) => sheet.id));
for (const id of requiredIds) if (!ids.has(id)) throw new Error(`Required sprite sheet missing: ${id}`);
if (ids.size !== manifest.sheets.length) throw new Error('Duplicate sprite sheet id after v53 synchronization.');

const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
const normalizedOriginal = `${JSON.stringify(JSON.parse(originalText), null, 2)}\n`;
if (checkOnly) {
  if (serialized !== normalizedOriginal) {
    throw new Error('Sprite manifest v53 is out of sync; run node scripts/sync-sprite-manifest-v53.mjs.');
  }
  console.log('Sprite manifest v53 is synchronized.');
} else {
  await writeFile(manifestPath, serialized, 'utf8');
  console.log(`Synchronized ${manifest.sheets.length} sprite sheets for v53 runtime truth.`);
}
