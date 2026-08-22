import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { CREW } from '../src/content.js';
import {
  CREW_MISSION_SPRITE_IDS,
  CREW_SPRITE_IDS,
  SPRITE_CLIP_SETS,
  SPRITE_GRID,
  SPRITE_HITBOXES,
  SPRITE_PIVOTS,
  SPRITE_SHEETS,
  SpriteAnimationController,
  resolveSpriteClip,
  resolveSpriteSheet,
  spriteRuntimeReport
} from '../src/sprite-animation-runtime.js';

const localPath = (webPath) => `.${webPath}`;

test('le registre v52 relie chaque membre d’équipage à une feuille normalisée réelle', async () => {
  const report = spriteRuntimeReport();
  assert.equal(report.invalid.length, 0);
  assert.equal(report.runtimeReady, report.sheets);
  assert.equal(report.sheets, 51);

  const crewIds = new Set(CREW.map((member) => member.id));
  assert.deepEqual(new Set(Object.keys(CREW_SPRITE_IDS)), crewIds);
  assert.equal(new Set(Object.values(CREW_SPRITE_IDS)).size, CREW.length);
  assert.equal(Object.keys(CREW_MISSION_SPRITE_IDS).length, 8);
  assert.equal(new Set(Object.values(CREW_MISSION_SPRITE_IDS)).size, 8);

  for (const member of CREW) {
    const sheetId = CREW_SPRITE_IDS[member.id];
    const sheet = resolveSpriteSheet(sheetId);
    assert.ok(sheet, `${member.id} n’a aucune feuille résoluble`);
    assert.equal(sheet.family, 'npc');
    await access(localPath(sheet.path));
  }

  for (const sheet of Object.values(SPRITE_SHEETS)) {
    const png = await readFile(localPath(sheet.path));
    assert.equal(png.readUInt32BE(16), SPRITE_GRID.columns * SPRITE_GRID.cellWidth, sheet.path);
    assert.equal(png.readUInt32BE(20), SPRITE_GRID.rows * SPRITE_GRID.cellHeight, sheet.path);
  }
});

test('chaque feuille utilise des clips, pivots et hitboxes bornés dans une cellule 4x4', () => {
  for (const sheet of Object.values(SPRITE_SHEETS)) {
    const clips = SPRITE_CLIP_SETS[sheet.clipSet];
    const pivot = SPRITE_PIVOTS[sheet.pivot];
    const hitbox = SPRITE_HITBOXES[sheet.hitbox];
    assert.ok(clips?.length, `${sheet.id}: clips absents`);
    assert.ok(pivot, `${sheet.id}: pivot absent`);
    assert.ok(hitbox, `${sheet.id}: hitbox absente`);
    assert.ok(pivot.x >= 0 && pivot.x <= SPRITE_GRID.cellWidth, `${sheet.id}: pivot x`);
    assert.ok(pivot.y >= 0 && pivot.y <= SPRITE_GRID.cellHeight, `${sheet.id}: pivot y`);
    assert.ok(hitbox.x >= 0 && hitbox.y >= 0, `${sheet.id}: origine hitbox`);
    assert.ok(hitbox.x + hitbox.width <= SPRITE_GRID.cellWidth, `${sheet.id}: largeur hitbox`);
    assert.ok(hitbox.y + hitbox.height <= SPRITE_GRID.cellHeight, `${sheet.id}: hauteur hitbox`);
    for (const clip of clips) {
      assert.equal(resolveSpriteClip(sheet.id, clip.id), clip);
      assert.ok(clip.frames.every((frame) => Number.isInteger(frame) && frame >= 0 && frame < 16), `${sheet.id}:${clip.id}`);
      assert.ok(clip.events.every((event) => clip.frames.includes(event.frame)), `${sheet.id}:${clip.id}: événement hors clip`);
    }
  }
});

test('le contrôleur émet chaque événement de frame une seule fois par transition', () => {
  const emitted = [];
  const controller = new SpriteAnimationController({ onEvent: (event) => emitted.push(event) });
  const request = { sheetId: 'player.echo9-marine.combat', clipId: 'primary-fire' };

  const first = controller.sample('player', request, 10);
  assert.equal(first.frame, 4);
  assert.deepEqual(first.events.map((event) => event.event), ['weapon:shot']);

  controller.sample('player', request, 10.08);
  controller.sample('player', request, 10.08);
  controller.sample('player', request, 10.16);
  controller.sample('player', request, 10.16);
  const complete = controller.sample('player', request, 11);
  controller.sample('player', request, 11);

  assert.equal(complete.complete, true);
  assert.deepEqual(emitted.map((event) => event.event), ['weapon:shot', 'weapon:recoil']);
  assert.equal(emitted.filter((event) => event.event === 'weapon:shot').length, 1);
  assert.equal(emitted.filter((event) => event.event === 'weapon:recoil').length, 1);

  controller.reset('player');
  assert.equal(controller.snapshot().length, 0);
});

test('les deux plaques ennemies v54 exposent le contrat action QA-validé', () => {
  for (const id of ['enemy.pathogen-mimic.action', 'enemy.pale-crucible-hunter.action']) {
    const sheet = resolveSpriteSheet(id);
    assert.equal(sheet.sourceFacing, 1);
    assert.equal(sheet.identityVerified, true);
    assert.deepEqual(SPRITE_CLIP_SETS[sheet.clipSet].map((clip) => [clip.id, clip.row]), [['idle', 0], ['chase', 1], ['attack', 2], ['death', 3]]);
    assert.ok(SPRITE_HITBOXES[sheet.hitbox].width >= 192);
  }
});
