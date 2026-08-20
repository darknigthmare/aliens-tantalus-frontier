import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

test('application shell exposes all required production surfaces', async () => {
  const html = await readFile('index.html', 'utf8');
  for (const marker of ['data-panel="galaxy"', 'data-panel="operations"', 'data-panel="hub"', 'data-panel="armory"', 'data-panel="bestiary"', 'data-panel="vehicles"', 'data-panel="crew"', 'data-panel="editor"', 'data-panel="codex"', 'id="game-canvas"']) assert.ok(html.includes(marker), marker);
});

test('OpenAI production masters are physically integrated', async () => {
  for (const file of ['tantalus-base-environment.png', 'echo9-sprite-sheet.png', 'xenomorph-sprite-sheet.png', 'arsenal-props-atlas.png']) await access(`assets/openai/${file}`);
});

test('PWA shell has a manifest and offline service worker', async () => {
  const manifest = JSON.parse(await readFile('manifest.webmanifest', 'utf8'));
  const worker = await readFile('sw.js', 'utf8');
  assert.match(manifest.name, /TANTALUS FRONTIER/i); assert.match(worker, /caches\.open/); assert.equal(manifest.display, 'standalone');
});
