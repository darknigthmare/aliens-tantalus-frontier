import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { HUB_DECKS, HUB_WORLD } from '../src/hub-game.js';

const readText = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

async function pngHeader(path) {
  const data = await readFile(new URL(`../${path}`, import.meta.url));
  assert.equal(data.toString('ascii', 1, 4), 'PNG');
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
    colorType: data[25]
  };
}

test('V61 opens physical hub stations through a dialogue without replacing the level', async () => {
  const [html, app, hub] = await Promise.all([
    readText('index.html'),
    readText('src/app.js'),
    readText('src/hub-game.js')
  ]);

  assert.match(html, /id="hub-dialogue"/);
  assert.match(html, /data-close-hub-station/);
  assert.match(app, /HUB_STATION_DIALOGUES_V61/);
  assert.match(app, /openHubDialogue\(interaction\)/);
  assert.match(app, /openHubStation\(view\)/);
  assert.match(hub, /pause\(\)/);
  assert.match(hub, /resume\(\)/);
});

test('briefing et armurerie conservent leurs bitmaps originaux à une échelle cohérente avec un acteur de92px', async () => {
  const [hub, profiles, sw] = await Promise.all([
    readText('src/hub-game.js'),
    readText('src/hub-profiles-v53.js'),
    readText('sw.js')
  ]);

  assert.match(hub, /operations-table-v61/);
  assert.match(hub, /armory-counter-v61/);
  const briefing = HUB_DECKS.flatMap((deck) => deck.rooms).find((room) => room.id === 'briefing');
  const armory = HUB_DECKS.flatMap((deck) => deck.rooms).find((room) => room.id === 'armory');
  assert.equal(briefing.propRenderBounds.w, 520);
  assert.ok(briefing.propRenderBounds.h >= 80 && briefing.propRenderBounds.h <= 90);
  assert.equal(briefing.prop, '/assets/openai/hub/props/operations-table-side-v72.webp');
  assert.equal(armory.propRenderBounds.h, 200);
  assert.equal(briefing.propRenderBounds.y + briefing.propRenderBounds.h, HUB_WORLD.floorY);
  assert.ok(briefing.propCollisionBounds.h <= 92);
  assert.equal(armory.propCollisionBounds.h, 80, 'seul le comptoir bas est solide, pas son râtelier mural');
  assert.deepEqual(briefing.profile.propCollider, { width: 480, height: 142, collisionMode: 'one-way-top' });
  assert.match(profiles, /armory: defineRoomProfile\([^\n]+340, 80\)/);
  assert.match(sw, /operations-table-side-v72\.webp/);
  assert.match(sw, /armory-counter-v61\.png/);
  assert.match(sw, /hangar-control-booth-v61\.png/);

  assert.deepEqual(await pngHeader('assets/openai/hub/props/operations-table-v61.png'), {
    width: 1024, height: 512, colorType: 6
  });
  assert.deepEqual(await pngHeader('assets/openai/hub/props/armory-counter-v61.png'), {
    width: 1024, height: 512, colorType: 6
  });
  assert.deepEqual(await pngHeader('assets/openai/hub/props/hangar-control-booth-v61.png'), {
    width: 1024, height: 512, colorType: 6
  });
});

test('V61 ships dedicated dialogue portraits, customization art and corrected MID layers', async () => {
  const [html, sw] = await Promise.all([readText('index.html'), readText('sw.js')]);
  assert.match(html, /echo9-customization-mannequin-v61\.png/);
  assert.match(html, /costume-part-filter/);
  assert.match(html, /costume-palette-filter/);
  assert.match(sw, /mara-vega-operations-v61\.png/);
  assert.match(sw, /sanaa-doyle-armory-v61\.png/);

  for (const path of [
    'assets/openai/hub/layers/habitat-medical-mid.png',
    'assets/openai/hub/layers/habitat-lab-mid.png',
    'assets/openai/hub/layers/industrial-quarantine-mid.png',
    'assets/openai/hub/layers/engineering-life-support-mid.png'
  ]) {
    assert.deepEqual(await pngHeader(path), { width: 1774, height: 887, colorType: 6 }, path);
  }

  const mannequin = await pngHeader('assets/openai/ui/customization/echo9-customization-mannequin-v61.png');
  assert.equal(mannequin.colorType, 6);
  assert.ok(mannequin.height > mannequin.width);
});
