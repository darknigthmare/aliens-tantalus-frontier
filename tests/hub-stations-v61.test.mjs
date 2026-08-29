import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

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

test('V61 gives briefing and armory large original bitmap landmarks', async () => {
  const [hub, profiles, sw] = await Promise.all([
    readText('src/hub-game.js'),
    readText('src/hub-profiles-v53.js'),
    readText('sw.js')
  ]);

  assert.match(hub, /operations-table-v61/);
  assert.match(hub, /armory-counter-v61/);
  assert.match(hub, /'briefing'.*'operations-table-v61'.*260/);
  assert.match(hub, /'armory'.*'armory-counter-v61'.*290/);
  assert.match(profiles, /briefing: defineRoomProfile\([^\n]+480, 142\)/);
  assert.match(profiles, /armory: defineRoomProfile\([^\n]+520, 136\)/);
  assert.match(sw, /operations-table-v61\.png/);
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
