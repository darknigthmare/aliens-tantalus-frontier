import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';
import { TITLE_SCREEN_SCHEMA, resolveTitleContinueTarget } from '../src/title-screen-v61.js';

const readText = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('the V61 title screen resolves an honest continuation target', () => {
  assert.equal(TITLE_SCREEN_SCHEMA, 61);
  assert.equal(resolveTitleContinueTarget({ scene: 'title', strategy: {} }), 'hub');
  assert.equal(resolveTitleContinueTarget({ scene: 'hub', strategy: {} }), 'hub');
  assert.equal(resolveTitleContinueTarget({ scene: 'command', strategy: {} }), 'command');
  assert.equal(resolveTitleContinueTarget({ scene: 'mission', strategy: {} }), 'operations');
  assert.equal(resolveTitleContinueTarget({
    scene: 'hub',
    strategy: { currentOperation: { id: 'operation-active' } }
  }), 'operations');
});

test('the title shell uses a real OpenAI bitmap and accessible live controls', async () => {
  const [html, css, build, serviceWorker] = await Promise.all([
    readText('index.html'),
    readText('title-screen-v61.css'),
    readText('scripts/build.mjs'),
    readText('sw.js')
  ]);
  const assetUrl = new URL('../assets/openai/ui/title/tantalus-frontier-title-background-v61.png', import.meta.url);
  const [asset, details] = await Promise.all([readFile(assetUrl), stat(assetUrl)]);
  const width = asset.readUInt32BE(16);
  const height = asset.readUInt32BE(20);

  assert.match(html, /<section id="title-screen"[^>]+aria-label="Écran titre"[^>]+hidden>/);
  assert.match(html, /class="title-background" src="\/assets\/openai\/ui\/title\/tantalus-frontier-title-background-v61\.png"/);
  for (const id of ['title-start', 'title-continue', 'title-new', 'title-forge', 'title-options']) {
    assert.match(html, new RegExp('<button id="' + id + '"[^>]+type="button"'));
  }
  assert.match(html, /id="title-continue"[^>]*>CONTINUER<\/button>/);
  assert.match(html, /id="title-new"[^>]*>NOUVELLE PARTIE<\/button>/);
  assert.match(html, /id="title-forge"[^>]*>FRONTIER FORGE<\/button>/);
  assert.match(html, /id="title-options"[^>]*>SYSTÈME<\/button>/);
  assert.doesNotMatch(html, /class="nav-button"[^>]+data-view="(?:editor|codex)"/);
  assert.doesNotMatch(html, /Contrat v1[–-]v61/);
  assert.match(html, /id="title-live-status"[^>]+aria-live="polite"/);
  assert.match(css, /\.title-background\s*\{[^}]*object-fit:\s*cover/s);
  assert.match(css, /html\.forge-mode \.rail\s*\{[^}]*display:\s*none/s);
  assert.match(css, /html\.forge-mode \.shell\s*\{[^}]*margin-left:\s*0/s);
  assert.ok(details.size > 500_000, 'le fond titre ne doit pas être un placeholder minuscule');
  assert.ok(width >= 1600 && height >= 900 && Math.abs(width / height - 16 / 9) < 0.02, width + 'x' + height);
  assert.match(build, /title-screen-v61\.css/);
  assert.match(serviceWorker, /\/src\/title-screen-v61\.js/);
  assert.match(serviceWorker, /tantalus-frontier-title-background-v61\.png/);
});
