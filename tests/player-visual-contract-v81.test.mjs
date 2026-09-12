import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

import {
  PLAYER_VISUAL_CONTRACT_V81,
  PLAYER_VISUAL_ASSETS_V81,
  drawPlayerSpriteV81,
  enforcePlayerAnimationRequestV81,
  normalizePlayerFacingV81,
  validatePlayerSpriteSampleV81
} from '../src/player-visual-contract-v81.js';
import {
  SPRITE_PIVOTS,
  SPRITE_SHEETS,
  enforceHumanoidAnimationIdentity,
  resolvePlayerAnimation,
  resolveSpriteSheet
} from '../src/sprite-animation-runtime.js';
import { resolveIdentitySafePlayerAnimationV57 } from '../src/game-v52-runtime.js';
import { migrateSave } from '../src/save.js';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const paeth = (left, above, upperLeft) => {
  const prediction = left + above - upperLeft;
  const leftDistance = Math.abs(prediction - left);
  const aboveDistance = Math.abs(prediction - above);
  const upperLeftDistance = Math.abs(prediction - upperLeft);
  return leftDistance <= aboveDistance && leftDistance <= upperLeftDistance
    ? left
    : aboveDistance <= upperLeftDistance ? above : upperLeft;
};

function decodeRgbaPng(bytes) {
  assert.ok(bytes.subarray(0, 8).equals(PNG_SIGNATURE), 'signature PNG invalide');
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const chunks = [];
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') chunks.push(data);
    offset += length + 12;
    if (type === 'IEND') break;
  }
  assert.equal(bitDepth, 8);
  assert.equal(colorType, 6, 'les feuilles joueur doivent rester RGBA');
  assert.equal(interlace, 0, 'les feuilles joueur doivent rester non entrelacées');
  const packed = inflateSync(Buffer.concat(chunks));
  const stride = width * 4;
  const pixels = Buffer.alloc(stride * height);
  let sourceOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = packed[sourceOffset++];
    const rowOffset = y * stride;
    for (let x = 0; x < stride; x += 1) {
      const raw = packed[sourceOffset + x];
      const left = x >= 4 ? pixels[rowOffset + x - 4] : 0;
      const above = y ? pixels[rowOffset - stride + x] : 0;
      const upperLeft = y && x >= 4 ? pixels[rowOffset - stride + x - 4] : 0;
      if (filter === 0) pixels[rowOffset + x] = raw;
      else if (filter === 1) pixels[rowOffset + x] = (raw + left) & 255;
      else if (filter === 2) pixels[rowOffset + x] = (raw + above) & 255;
      else if (filter === 3) pixels[rowOffset + x] = (raw + Math.floor((left + above) / 2)) & 255;
      else if (filter === 4) pixels[rowOffset + x] = (raw + paeth(left, above, upperLeft)) & 255;
      else assert.fail(`filtre PNG non pris en charge: ${filter}`);
    }
    sourceOffset += stride;
  }
  return { width, height, pixels };
}

test('le contrat V81 autorise exactement les cinq feuilles Echo-9 cohérentes', () => {
  assert.deepEqual(PLAYER_VISUAL_CONTRACT_V81.sheetIds, [
    'player.echo9-marine.locomotion',
    'player.echo9-marine.combat',
    'player.echo9-marine.melee',
    'player.echo9-marine.interaction',
    'player.echo9-marine.tool-use'
  ]);
  for (const sheetId of PLAYER_VISUAL_CONTRACT_V81.sheetIds) {
    const sheet = resolveSpriteSheet(sheetId);
    const asset = PLAYER_VISUAL_ASSETS_V81.find((entry) => entry.sheetId === sheetId);
    assert.ok(asset);
    assert.equal(sheet.imageKey, asset.imageKey);
    assert.equal(sheet.path, asset.path);
    assert.equal(sheet.family, 'player');
    assert.deepEqual([sheet.columns, sheet.rows, sheet.cellWidth, sheet.cellHeight], [4, 4, 256, 256]);
    assert.equal(sheet.sourceFacing, 1);
    assert.equal(sheet.pivot, 'humanoid-feet');
    assert.equal(sheet.hitbox, 'player-standing');
    assert.deepEqual([sheet.renderWidth, sheet.renderHeight], [110, 148]);
    assert.equal(sheet.identityVerified, true);
  }
});

test('le moteur de production et le cache hors ligne chargent les cinq feuilles autorisées', async () => {
  const [engineSource, workerSource] = await Promise.all([
    readFile(resolve(ROOT, 'src/game-v51-runtime.js'), 'utf8'),
    readFile(resolve(ROOT, 'sw.js'), 'utf8')
  ]);
  for (const sheetId of PLAYER_VISUAL_CONTRACT_V81.sheetIds) {
    const sheet = resolveSpriteSheet(sheetId);
    assert.match(engineSource, new RegExp(`\\b${sheet.imageKey}: ['\"]${sheet.path.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}['\"]`), `${sheet.imageKey} absent du préchargement moteur`);
    assert.ok(workerSource.includes(`'${sheet.path}'`), `${sheet.path} absent du cache hors ligne`);
  }
});

test('tous les états joueur, y compris Neuro et les requêtes forgées, restent player-only', () => {
  const base = { alive: true, grounded: true, visualForm: 'marine', playerClass: 'marine', vx: 0 };
  const states = [
    {},
    { vx: 80 },
    { grounded: false },
    { crouching: true },
    { climbing: true },
    { v52FireClock: 0.3 },
    { fireClock: 0.3 },
    { reloading: true },
    { v52HurtClock: 0.3 },
    { alive: false },
    { meleeClock: 0.3, meleeKind: 'rifle-bash' },
    { toolUseClock: 0.3, toolId: 'cutter' },
    { interactionClock: 0.3, interactionKind: 'control-use' },
    { visualForm: 'xenomorph', playerClass: 'neuro-xeno', neuroActive: true }
  ];
  for (const state of states) {
    const actor = { ...base, ...state };
    const request = resolveIdentitySafePlayerAnimationV57(actor, state.neuroActive === true);
    assert.ok(PLAYER_VISUAL_CONTRACT_V81.sheetIds.includes(request.sheetId), request.sheetId);
    assert.equal(resolveSpriteSheet(request.sheetId).family, 'player');
    assert.doesNotMatch(request.sheetId, /^(?:enemy|npc)[.]/);
  }
  for (const forged of [
    { sheetId: 'enemy.xenomorph-drone.combat', clipId: 'hurt-death' },
    { sheetId: 'npc.mara-vega.locomotion', clipId: 'idle' },
    { sheetId: 'player.forged.locomotion', clipId: 'idle' }
  ]) {
    const safe = enforceHumanoidAnimationIdentity(base, forged, { role: 'player', neuroActive: true });
    assert.ok(PLAYER_VISUAL_CONTRACT_V81.sheetIds.includes(safe.sheetId));
    assert.match(safe.degraded, /rejected-v81/);
  }
  assert.equal(enforcePlayerAnimationRequestV81(null).sheetId, PLAYER_VISUAL_CONTRACT_V81.fallback.sheetId);
});

test('la source, le pivot, la taille et le facing sont validés avant tout drawImage', () => {
  const sheet = resolveSpriteSheet('player.echo9-marine.locomotion');
  const image = { complete: true, naturalWidth: 1024, naturalHeight: 1024 };
  const entity = { x: 100, y: 200, w: 44, h: 92, facing: 1 };
  const sample = { sheet, column: 2, row: 1 };
  const right = validatePlayerSpriteSampleV81({ sheet, image, sample, pivot: SPRITE_PIVOTS[sheet.pivot], entity, surface: 'hub' });
  const left = validatePlayerSpriteSampleV81({ sheet, image, sample, pivot: SPRITE_PIVOTS[sheet.pivot], entity: { ...entity, facing: -1 }, surface: 'hub' });
  assert.equal(right.ok, true);
  assert.deepEqual(right.source, { x: 512, y: 256, width: 256, height: 256 });
  assert.deepEqual([right.sprite.width, right.sprite.height], [95, 128]);
  assert.deepEqual(right.pivot, left.pivot, 'le miroir ne doit pas déplacer les pieds');
  assert.equal(right.flip, false);
  assert.equal(left.flip, true);
  assert.equal(validatePlayerSpriteSampleV81({ sheet, image: { ...image, naturalWidth: 768 }, sample, pivot: SPRITE_PIVOTS[sheet.pivot], entity }).reason, 'player-source-size-mismatch');
  assert.equal(validatePlayerSpriteSampleV81({ sheet, image, sample: { ...sample, column: 4 }, pivot: SPRITE_PIVOTS[sheet.pivot], entity }).reason, 'player-source-cell-out-of-range');

  const calls = { images: 0, fills: 0 };
  const ctx = new Proxy({
    drawImage() { calls.images += 1; },
    fillRect() { calls.fills += 1; }
  }, { get: (target, key) => key in target ? target[key] : () => {}, set: (target, key, value) => { target[key] = value; return true; } });
  const enemySheet = SPRITE_SHEETS['enemy.xenomorph-drone.combat'];
  const result = drawPlayerSpriteV81(ctx, { sheet: enemySheet, image, sample: { sheet: enemySheet, column: 0, row: 0 }, pivot: SPRITE_PIVOTS[enemySheet.pivot], entity, surface: 'mission' });
  assert.equal(result.fallback, true);
  assert.equal(result.sheetId, 'player.echo9-marine.locomotion');
  assert.equal(calls.images, 0);
  assert.ok(calls.fills >= 5, 'le fallback Echo-9 doit rester visible sans autre bitmap');
});

test('la migration V81 conserve le facing hub et supprime toute identité visuelle injectée par une sauvegarde', () => {
  const migrated = migrateSave({
    schema: 52,
    hub: { facing: -1 },
    player: {
      visualSheetId: 'enemy.xenomorph-drone.combat',
      spriteKey: 'xenoDrone',
      visualForm: 'xenomorph',
      neuroVisualContract: { sheetId: 'npc.mara-vega.locomotion' }
    }
  });
  assert.equal(migrated.hub.facing, -1);
  for (const key of ['visualSheetId', 'spriteKey', 'visualForm', 'neuroVisualContract']) assert.equal(Object.hasOwn(migrated.player, key), false);
  for (const facing of [0, 1, 2, 'gauche', null]) assert.equal(migrateSave({ schema: 52, hub: { facing } }).hub.facing, 1);
  assert.equal(normalizePlayerFacingV81(-1), -1);
});

test('les 80 cellules Echo-9 RGBA restent occupées et sans alpha dans la garde de 16 px', async () => {
  const { source } = PLAYER_VISUAL_CONTRACT_V81;
  for (const sheetId of PLAYER_VISUAL_CONTRACT_V81.sheetIds) {
    const sheet = resolveSpriteSheet(sheetId);
    const decoded = decodeRgbaPng(await readFile(resolve(ROOT, sheet.path.slice(1))));
    assert.deepEqual([decoded.width, decoded.height], [source.width, source.height], sheetId);
    for (let row = 0; row < source.rows; row += 1) {
      for (let column = 0; column < source.columns; column += 1) {
        let occupied = 0;
        let guardLeak = 0;
        for (let localY = 0; localY < source.cellHeight; localY += 1) {
          for (let localX = 0; localX < source.cellWidth; localX += 1) {
            const x = column * source.cellWidth + localX;
            const y = row * source.cellHeight + localY;
            const alpha = decoded.pixels[(y * decoded.width + x) * 4 + 3];
            if (!alpha) continue;
            occupied += 1;
            if (localX < source.guard || localX >= source.cellWidth - source.guard
              || localY < source.guard || localY >= source.cellHeight - source.guard) guardLeak += 1;
          }
        }
        assert.ok(occupied > 0, `${sheetId} cellule ${column},${row} vide`);
        assert.equal(guardLeak, 0, `${sheetId} cellule ${column},${row} déborde de sa garde`);
      }
    }
  }
});
