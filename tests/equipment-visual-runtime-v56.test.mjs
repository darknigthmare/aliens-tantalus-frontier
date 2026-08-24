import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { EQUIPMENT } from '../src/content-core-v50.js';
import {
  EQUIPMENT_SHEET_GRID_V56,
  EQUIPMENT_SHEET_STATES_V56,
  EQUIPMENT_VISUAL_BASE_COUNT_V56,
  EQUIPMENT_VISUAL_BLOCKED_V56,
  EQUIPMENT_VISUAL_DEDICATED_ATLAS_COUNT_V56,
  EQUIPMENT_VISUAL_PROFILES_V56,
  resolveEquipmentVisualProfileV56,
  resolveEquipmentVisualStateV56
} from '../src/equipment-visual-runtime-v56.js';
import { MISSION_TOOL_PICKUP_VISUAL_V56 } from '../src/game-v51-runtime.js';
import { SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';

const matrix = JSON.parse(await readFile(new URL('../docs/references/V56_REMAINING_ASSET_MATRIX.json', import.meta.url), 'utf8'));
const matrixEntries = matrix.domains.toolsEquipment.entries;
const catalogNumber = (source) => Number(source.id.slice('equipment-'.length, 'equipment-000'.length));
const baseNumber = (source) => ((catalogNumber(source) - 1) % 30) + 1;
const localUrl = (webPath) => new URL(`..${webPath}`, import.meta.url);

function readPngHeader(buffer) {
  assert.deepEqual([...buffer.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bitDepth: buffer[24],
    colorType: buffer[25]
  };
}

test('le registre partitionne les 30 bases entre profils vérifiés et blocages explicites', async () => {
  const readyNumbers = new Set(EQUIPMENT_VISUAL_PROFILES_V56.map((entry) => entry.baseNumber));
  const blockedNumbers = new Set(EQUIPMENT_VISUAL_BLOCKED_V56.map((entry) => entry.baseNumber));
  assert.equal(EQUIPMENT_VISUAL_BASE_COUNT_V56, 30);
  assert.equal(EQUIPMENT_VISUAL_BASE_COUNT_V56, readyNumbers.size);
  assert.equal(EQUIPMENT_VISUAL_DEDICATED_ATLAS_COUNT_V56, 29);
  assert.equal(EQUIPMENT_VISUAL_BLOCKED_V56.length, 0);
  assert.equal(EQUIPMENT_VISUAL_BASE_COUNT_V56 + blockedNumbers.size, 30);
  assert.equal(EQUIPMENT_VISUAL_DEDICATED_ATLAS_COUNT_V56, EQUIPMENT_VISUAL_PROFILES_V56.filter((entry) => !entry.manifestAlias).length);
  for (let number = 1; number <= 30; number += 1) {
    assert.notEqual(readyNumbers.has(number), blockedNumbers.has(number), `base ${number}`);
  }
  assert.deepEqual(EQUIPMENT_SHEET_GRID_V56, {
    width: 512,
    height: 512,
    columns: 2,
    rows: 2,
    cellWidth: 256,
    cellHeight: 256
  });
  assert.deepEqual(EQUIPMENT_SHEET_STATES_V56.map((state) => state.id), ['packed', 'ready', 'use', 'spent']);

  for (const profile of EQUIPMENT_VISUAL_PROFILES_V56) {
    const matrixEntry = matrixEntries.find((entry) => entry.label === profile.name);
    assert.ok(matrixEntry, profile.name);
    assert.ok(profile.referenceStatus === matrixEntry.status || profile.referenceStatus.startsWith(`${matrixEntry.status}_`), profile.name);
    assert.equal(profile.width, profile.columns * profile.cellWidth, profile.name);
    assert.equal(profile.height, profile.rows * profile.cellHeight, profile.name);

    const [raw, normalized] = await Promise.all([
      readFile(localUrl(profile.rawPath)),
      readFile(localUrl(profile.path))
    ]);
    const rawHeader = readPngHeader(raw);
    const normalizedHeader = readPngHeader(normalized);
    assert.equal(rawHeader.width, profile.width, `${profile.name} raw width`);
    assert.equal(rawHeader.height, profile.height, `${profile.name} raw height`);
    assert.deepEqual(normalizedHeader, {
      width: profile.width,
      height: profile.height,
      bitDepth: 8,
      colorType: 6
    }, profile.name);

    const sheet = SPRITE_SHEETS[profile.sheetId];
    assert.ok(sheet, `${profile.name}: atlas runtime absent`);
    assert.equal(sheet.path, profile.path, profile.name);
    assert.equal(sheet.columns, profile.columns, profile.name);
    assert.equal(sheet.rows, profile.rows, profile.name);
    assert.equal(sheet.family, profile.manifestAlias ? 'weapon' : 'equipment', profile.name);
  }
});

test('les grades réutilisent honnêtement leur famille et conservent le nom canonique runtime', () => {
  for (const profile of EQUIPMENT_VISUAL_PROFILES_V56) {
    const family = EQUIPMENT.filter((entry) => baseNumber(entry) === profile.baseNumber);
    assert.ok(family.length >= 3, profile.name);

    for (const source of family) {
      const visual = resolveEquipmentVisualProfileV56(source);
      assert.ok(visual, source.id);
      assert.equal(visual.baseNumber, profile.baseNumber, source.id);
      assert.equal(visual.referenceStatus, profile.referenceStatus, source.id);
      const isBase = catalogNumber(source) === profile.baseNumber;
      assert.equal(visual.identityVerified, isBase, source.id);
      assert.equal(visual.approximate, !isBase, source.id);
      if (isBase) assert.equal(visual.fallbackReason, null, source.id);
      else {
        assert.equal(visual.identityStatus, 'authored-family', source.id);
        assert.match(visual.fallbackReason, /réutilise la plaque validée/, source.id);
      }
      assert.ok(visual.displayName.startsWith(profile.canonicalName), source.id);
    }
  }

  const ape = resolveEquipmentVisualProfileV56(EQUIPMENT.find((entry) => entry.id.startsWith('equipment-010-')));
  assert.equal(ape.displayName, 'APEsuit Mk.3 (Aliens: Fireteam Elite)');
  assert.equal(ape.referenceStatus, 'CANON_REFERENCE_VISIBLE_ANGLES');
  assert.equal(ape.canonExact, false);
  assert.equal(ape.turnaroundExact, false);

  const m314 = resolveEquipmentVisualProfileV56(EQUIPMENT.find((entry) => entry.id.startsWith('equipment-001-')));
  assert.equal(m314.displayName, 'M314 Motion Tracker');
  assert.equal(m314.referenceStatus, 'CANON_REFERENCE_LICENSED_MULTIANGLE');
  assert.equal(m314.canonExact, true);
  assert.equal(m314.turnaroundExact, true);

  for (const name of ['Access Tuner', 'Maintenance Jack', 'APE Suit']) {
    const source = EQUIPMENT.find((entry) => entry.name === name);
    const visual = source && resolveEquipmentVisualProfileV56(source);
    if (!visual) continue;
    assert.equal(visual.identityStatus, 'canon-visible-angle', name);
    assert.equal(visual.canonExact, false, name);
    assert.equal(visual.turnaroundExact, false, name);
  }
});

test('le Cutting Torch équipement alias sa plaque canon 4x4 sans doubler son atlas', () => {
  const source = EQUIPMENT.find((entry) => entry.name === 'Cutting Torch');
  const visual = resolveEquipmentVisualProfileV56(source);
  assert.ok(visual);
  assert.equal(visual.sheetId, 'weapon.cutting-torch.action');
  assert.equal(visual.imageKey, 'weaponV56:29');
  assert.equal(visual.path, '/assets/openai/sprites/normalized/weapons/cutting-torch-action-sheet.png');
  assert.equal(visual.contractId, 'WEAPON_TOOL_4X4');
  assert.equal(visual.columns, 4);
  assert.equal(visual.rows, 4);
  assert.equal(visual.manifestAlias, true);
  assert.equal(resolveEquipmentVisualStateV56({ ...source, using: true }).frame.frame, 4);
  assert.equal(resolveEquipmentVisualStateV56({ ...source, spent: true }).frame.frame, 12);
  assert.equal(MISSION_TOOL_PICKUP_VISUAL_V56.sheetId, visual.sheetId);
  assert.equal(MISSION_TOOL_PICKUP_VISUAL_V56.path, visual.path);
});

test('les quatre états 2x2 résolvent packed, ready, use et spent', () => {
  const source = EQUIPMENT.find((entry) => entry.name === 'Flashlight');
  assert.equal(resolveEquipmentVisualStateV56(source).stateId, 'packed');
  assert.equal(resolveEquipmentVisualStateV56({ ...source, ready: true }).stateId, 'ready');
  assert.equal(resolveEquipmentVisualStateV56({ ...source, using: true }).stateId, 'use');
  assert.equal(resolveEquipmentVisualStateV56({ ...source, spent: true }).stateId, 'spent');
  assert.deepEqual(resolveEquipmentVisualStateV56({ ...source, using: true }).frame, { id: 'use', column: 0, row: 1 });
});

test('aucune base bloquée ou ID étranger ne reçoit un chemin de remplacement', () => {
  for (const blocked of EQUIPMENT_VISUAL_BLOCKED_V56) {
    const family = EQUIPMENT.filter((entry) => baseNumber(entry) === blocked.baseNumber);
    assert.ok(family.length >= 3, blocked.name);
    for (const source of family) assert.equal(resolveEquipmentVisualProfileV56(source), null, source.id);
  }
  assert.equal(resolveEquipmentVisualProfileV56({ id: 'equipment-999-faux', name: 'Flashlight' }), null);
  assert.equal(resolveEquipmentVisualProfileV56({ id: 'weapon-005-faux', name: 'Flashlight' }), null);
});

test('armurerie et pickup consomment les bitmaps réels sans placeholder CSS', async () => {
  const [app, game] = await Promise.all([
    readFile(new URL('../src/app.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/game-v51-runtime.js', import.meta.url), 'utf8')
  ]);
  assert.match(app, /from '\.\/equipment-visual-runtime-v56\.js'/);
  assert.match(app, /resolveEquipmentVisualProfileV56\(item\)/);
  assert.match(app, /112 \* \(Number\(visual\.columns\) \|\| 4\)/);
  assert.match(app, /112 \* \(Number\(visual\.rows\) \|\| 4\)/);
  assert.match(app, /première cellule de la plaquette dédiée/);
  assert.match(app, /heading\.textContent = visual\.displayName/);
  assert.doesNotMatch(app, /equipment-placeholder|placeholder-equipment/);

  const method = game.slice(game.lastIndexOf('  drawToolPickup(ctx) {'), game.indexOf('  drawVehicle(ctx) {'));
  assert.match(method, /MISSION_TOOL_PICKUP_VISUAL_V56/);
  assert.match(method, /drawSheetCell/);
  assert.doesNotMatch(method, /drawWorldProp|fillRect/);
});
