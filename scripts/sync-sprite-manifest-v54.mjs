import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = resolve(repoRoot, 'assets/openai/sprites/manifest.json');
const checkOnly = process.argv.includes('--check');
const originalText = await readFile(manifestPath, 'utf8');
const manifest = JSON.parse(originalText);
manifest.release = 'v54';

const clip = (id, row, fps, loop, events) => ({
  id,
  row,
  frames: [row * 4, row * 4 + 1, row * 4 + 2, row * 4 + 3],
  fps,
  loop,
  events
});

manifest.contracts.hitboxes['runner-ground'] = {
  x: 28,
  y: 134,
  width: 200,
  height: 106,
  unit: 'cell-pixel'
};

manifest.contracts.hitboxes['pathogen-mimic-large'] = {
  x: 24,
  y: 52,
  width: 208,
  height: 188,
  unit: 'cell-pixel'
};

manifest.contracts.hitboxes['pale-crucible-hunter-large'] = {
  x: 32,
  y: 42,
  width: 192,
  height: 198,
  unit: 'cell-pixel'
};

manifest.clipSets['runner-action'] = [
  clip('idle-prowl', 0, 5, true, [{ frame: 2, type: 'creature:breath' }]),
  clip('sprint', 1, 12, true, [{ frame: 4, type: 'audio:claw-step-right' }, { frame: 6, type: 'audio:claw-step-left' }]),
  clip('pounce-bite', 2, 11, false, [{ frame: 9, type: 'movement:takeoff' }, { frame: 10, type: 'combat:pounce-window' }, { frame: 11, type: 'combat:bite-hit' }]),
  clip('hurt-death', 3, 8, false, [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'state:death-lock' }])
];

manifest.clipSets['ripper-queen-action'] = [
  clip('threat-idle', 0, 4, true, [{ frame: 2, type: 'creature:crown-lift' }]),
  clip('royal-advance', 1, 7, true, [{ frame: 4, type: 'audio:heavy-step-right' }, { frame: 6, type: 'audio:heavy-step-left' }]),
  clip('claw-tail', 2, 9, false, [{ frame: 9, type: 'combat:claw-hit' }, { frame: 11, type: 'combat:tail-hit' }]),
  clip('wounded-death', 3, 7, false, [{ frame: 12, type: 'state:hurt' }, { frame: 13, type: 'audio:roar' }, { frame: 15, type: 'state:death-lock' }])
];

manifest.clipSets['enemy-action-v54'] = [
  clip('idle', 0, 4, true, [{ frame: 2, type: 'creature:breathe' }]),
  clip('chase', 1, 10, true, [{ frame: 4, type: 'audio:step-right' }, { frame: 6, type: 'audio:step-left' }]),
  clip('attack', 2, 10, false, [{ frame: 10, type: 'combat:attack-hit' }]),
  clip('death', 3, 7, false, [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'state:death-lock' }])
];

const playerFire = manifest.clipSets['player-combat']?.find((entry) => entry.id === 'primary-fire');
if (!playerFire) throw new Error('Missing player primary-fire clip.');
playerFire.events = [{ frame: 4, type: 'weapon:shot' }, { frame: 5, type: 'weapon:recoil' }];

const runtimeConsumers = (sheet) => {
  const consumers = new Set(['src/sprite-animation-runtime.js', 'src/game-v52-runtime.js']);
  if (sheet.family === 'enemy') consumers.add('src/enemy-visual-runtime-v53.js');
  if (['player', 'enemy', 'vehicle', 'weapon'].includes(sheet.family)) consumers.add('src/game.js');
  if (sheet.family === 'npc') consumers.add('src/hub-v52-runtime.js');
  if (sheet.id === 'player.echo9-marine.locomotion' || (sheet.family === 'npc' && sheet.wave !== 'v52')) consumers.add('src/hub-game.js');
  if (sheet.wave === 'v52') consumers.add('src/v50-visuals.js');
  return [...consumers];
};

const authoredSheets = [
  {
    id: 'enemy.xenomorph-runner.action',
    family: 'enemy',
    subject: 'Xenomorph Runner',
    files: {
      raw: '/assets/openai/sprites/enemies/xenomorph-runner-action-sheet.png',
      normalized: '/assets/openai/sprites/normalized/enemies/xenomorph-runner-action-sheet.png',
      normalizedStatus: 'ready'
    },
    grid: 'v50-4x4',
    clips: 'runner-action',
    pivot: 'creature-ground',
    hitbox: 'runner-ground',
    sourceFacing: 'right',
    identityVerified: true
  },
  {
    id: 'enemy.ripper-queen.action',
    family: 'enemy',
    subject: 'Ripper Queen',
    files: {
      raw: '/assets/openai/sprites/enemies/ripper-queen-action-sheet.png',
      normalized: '/assets/openai/sprites/normalized/enemies/ripper-queen-action-sheet.png',
      normalizedStatus: 'ready'
    },
    grid: 'v50-4x4',
    clips: 'ripper-queen-action',
    pivot: 'creature-ground',
    hitbox: 'queen-standing',
    sourceFacing: 'right',
    identityVerified: true
  },
  {
    id: 'enemy.pathogen-mimic.action',
    family: 'enemy',
    subject: 'Pathogen Mimic',
    files: {
      raw: '/assets/openai/sprites/enemies/pathogen-mimic-action-sheet.png',
      normalized: '/assets/openai/sprites/normalized/enemies/pathogen-mimic-action-sheet.png',
      normalizedStatus: 'ready'
    },
    grid: 'v50-4x4',
    clips: 'enemy-action-v54',
    pivot: 'creature-ground',
    hitbox: 'pathogen-mimic-large',
    sourceFacing: 'right',
    identityVerified: true
  },
  {
    id: 'enemy.pale-crucible-hunter.action',
    family: 'enemy',
    subject: 'Pale Crucible Hunter',
    files: {
      raw: '/assets/openai/sprites/enemies/pale-crucible-hunter-action-sheet.png',
      normalized: '/assets/openai/sprites/normalized/enemies/pale-crucible-hunter-action-sheet.png',
      normalizedStatus: 'ready'
    },
    grid: 'v50-4x4',
    clips: 'enemy-action-v54',
    pivot: 'creature-ground',
    hitbox: 'pale-crucible-hunter-large',
    sourceFacing: 'right',
    identityVerified: true
  }
];

for (const authored of authoredSheets) {
  const index = manifest.sheets.findIndex((sheet) => sheet.id === authored.id);
  if (index >= 0) manifest.sheets[index] = { ...manifest.sheets[index], ...authored };
  else manifest.sheets.push(authored);
}

manifest.sheets = manifest.sheets
  .map((source) => {
    const sheet = { ...source };
    if (sheet.id === 'npc.leila-sorensen.locomotion') sheet.id = 'npc.leila-s-rensen.locomotion';
    sheet.sourceFacing = sheet.id === 'enemy.xenomorph-drone.combat' ? 'left' : 'right';
    sheet.identityVerified = true;
    sheet.runtime = { status: 'referenced', consumers: runtimeConsumers(sheet) };
    return sheet;
  })
  .sort((left, right) => left.id.localeCompare(right.id));

const requiredIds = [
  'player.echo9-marine.locomotion',
  'player.echo9-marine.combat',
  'enemy.xenomorph-drone.locomotion',
  'enemy.xenomorph-drone.combat',
  'enemy.xenomorph-runner.action',
  'enemy.ripper-queen.action',
  'enemy.pathogen-mimic.action',
  'enemy.pale-crucible-hunter.action',
  'npc.leila-s-rensen.locomotion',
  'vehicle.m577-apc.action',
  'weapon.m41a-pulse-rifle.action'
];
const ids = new Set(manifest.sheets.map((sheet) => sheet.id));
for (const id of requiredIds) if (!ids.has(id)) throw new Error(`Required sprite sheet missing: ${id}`);
if (ids.size !== manifest.sheets.length) throw new Error('Duplicate sprite sheet id after v54 synchronization.');
if (manifest.sheets.length !== 31) throw new Error(`Expected 31 sprite sheets, received ${manifest.sheets.length}.`);

const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
const normalizedOriginal = `${JSON.stringify(JSON.parse(originalText), null, 2)}\n`;
if (checkOnly) {
  if (serialized !== normalizedOriginal) throw new Error('Sprite manifest v54 is out of sync; run node scripts/sync-sprite-manifest-v54.mjs.');
  console.log('Sprite manifest v54 is synchronized.');
} else {
  await writeFile(manifestPath, serialized, 'utf8');
  console.log(`Synchronized ${manifest.sheets.length} sprite sheets for v54 runtime truth.`);
}
