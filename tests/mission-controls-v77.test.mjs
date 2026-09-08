import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('les commandes mobiles sont hors du contexte transformé et restent cachées pendant insertion', async () => {
  const html = await readFile('index.html', 'utf8');
  const css = await readFile('runtime-level.css', 'utf8');
  assert.match(html, /id="alien-survival-dock-v70"[^>]*><\/section>\s*<\/div>\s*<div class="mission-touch-controls/);
  assert.match(css, /#mission-runtime-v62\[hidden\] ~ \.mission-touch-controls \{ display: none; \}/);
  assert.match(css, /\.mission-mode \.mission-log \{ pointer-events: none; \}/);
  assert.match(css, /grid-template-columns: repeat\(10, minmax\(44px, 52px\)\)/);
});

test('le réglage musique a une commande, une restauration et une sauvegarde distinctes des effets', async () => {
  const html = await readFile('index.html', 'utf8');
  const app = await readFile('src/app.js', 'utf8');
  assert.match(html, /MUSIQUE<input id="setting-music" type="range" min="0" max="1" step="0.05"/);
  assert.match(app, /byId\('setting-music'\)\.value = saveSystem.data.settings.music \?\? 0.45/);
  assert.match(app, /'setting-music': \['music', \(element\) => Number\(element.value\)\]/);
});
