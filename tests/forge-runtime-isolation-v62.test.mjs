import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const browserQa = await readFile(new URL('../scripts/browser-qa-v52.mjs', import.meta.url), 'utf8');

test('le runtime Forge consomme son namespace dédié et plus editor dans la campagne', () => {
  assert.match(app, /new ForgeSaveSystemV62/);
  assert.match(app, /forgeSaveSystem\.upsert\(record\)/);
  assert.doesNotMatch(app, /saveSystem\.data\.editor/);
  assert.match(app, /editorProject: null,/);
});

test('les playtests mission et vaisseau restent dans le contexte forge-playtest', () => {
  assert.match(app, /standaloneContext = 'forge-playtest'/);
  assert.match(app, /function launchForgeMissionPlaytest/);
  assert.match(app, /context: 'forge-playtest'/);
  assert.match(app, /if \(standaloneContext === 'forge-playtest'\) \{\s*handleForgePlaytestEvent\(event\);\s*return;/);
  assert.match(app, /if \(standaloneContext === 'forge-playtest' && forgePlaytest\)/);
});

test('les surfaces développeur ne figurent plus dans la navigation joueur', () => {
  const navigation = html.match(/<nav id="nav">([\s\S]*?)<\/nav>/)?.[1] || '';
  assert.doesNotMatch(navigation, /Frontier Forge|Contrat v1|data-view="editor"|data-view="codex"/);
  assert.match(html, /id="title-forge"/);
});

test('le gate V62 franchit l’insertion et ouvre Forge depuis son vrai menu autonome', () => {
  assert.match(browserQa, /shell\.schema === 52/);
  assert.match(browserQa, /completeMissionInsertionV62\('Mission principale'\)/);
  assert.match(browserQa, /completeMissionInsertionV62\('Mission holdout'\)/);
  assert.match(browserQa, /await click\('#title-forge'\)/);
  assert.match(browserQa, /snapshot\?\.context === 'forge'/);
  assert.match(browserQa, /campaignAfterForge === campaignBeforeForge/);
  assert.doesNotMatch(browserQa, /click\('\[data-view="editor"\]'\)/);
});
