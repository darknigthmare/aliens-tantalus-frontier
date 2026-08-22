import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const appPath = new URL('../src/app.js', import.meta.url);
const indexPath = new URL('../index.html', import.meta.url);
const stylesPath = new URL('../styles.css', import.meta.url);
const [app, html, styles] = await Promise.all([
  readFile(appPath, 'utf8'),
  readFile(indexPath, 'utf8'),
  readFile(stylesPath, 'utf8')
]);

test('le point d’entrée v52 branche niveaux, escouade, hub et conséquences de production', () => {
  for (const contract of [
    "from './game-production-runtime.js'",
    "from './mission-levels-v52.js'",
    "from './hub-v52-runtime.js'",
    "from './world-crisis.js'",
    "from './campaign-consequences.js'",
    "from './advanced-systems.js'",
    "from './save.js'"
  ]) assert.match(app, new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  for (const action of [
    'executeStrategicAction', 'completeResearchProject', 'installShipModule', 'repairShipModule',
    'procureCatalogItem', 'equipCatalogItem', 'selectStrategicVehicle', 'assignCrewMember',
    'treatCrewMember', 'applyCostume', 'performDiplomacy', 'selectNeuroProfile',
    'selectApexDossier', 'beginOperation', 'resolveOperation', 'applyCampaignConsequence',
    'advanceGalaxy', 'resolveHubCrisisEvent', 'buildMissionLevelV52'
  ]) assert.match(app, new RegExp(`\\b${action}\\b`), `${action} doit être raccordé`);

  assert.match(app, /missionLevel,/);
  assert.match(app, /missionTemplateId:/);
  assert.match(app, /mission-level-event/);
  assert.match(app, /squad-action/);
  assert.match(app, /squad-lost/);
  assert.match(app, /editor\.validate\(\)/);
  assert.match(app, /editor\.undo\(\)/);
  assert.match(app, /editor\.redo\(\)/);
  assert.match(app, /editorProject: currentEditorProject\('mission'\)/);
  assert.match(app, /hubEngine\.start\(saveSystem\.data\.hub, \{ editorProject: project \}\)/);
  assert.match(app, /engine\.useEquipment\(id\)/);
  assert.match(app, /engine\.activateNeuroCountermeasure\(engine\.player\)/);
  assert.match(app, /function retreatMission\(\)/);
  assert.match(app, /globalThis\.__ATF_V51__/);
});

test('index public expose chaque contrôle actionnable sans écran catalogue mort', () => {
  const requiredIds = [
    'strategy-resources', 'strategy-actions', 'research-projects', 'strategy-log',
    'module-summary', 'module-search', 'module-list', 'star-map', 'world-detail',
    'campaign-list', 'operation-plan', 'neuro-profile-select', 'apex-dossier-select',
    'armory-list', 'enemy-list', 'vehicle-list', 'crew-list', 'costume-list',
    'hub-canvas', 'hub-system-readout', 'editor-canvas', 'editor-validation',
    'editor-undo', 'editor-redo', 'editor-validate', 'editor-play', 'game-canvas',
    'retreat-mission', 'mission-equipment-controls', 'mission-interact', 'mission-tracker',
    'mission-vehicle', 'mission-reload', 'mission-medkit', 'mission-neuro-counter', 'setting-difficulty',
    'setting-coop', 'setting-motion', 'setting-subtitles', 'setting-quality',
    'setting-contrast', 'setting-effects', 'promise-matrix'
  ];
  for (const id of requiredIds) assert.match(html, new RegExp(`id=["']${id}["']`), `#${id} manque`);

  for (const control of ['left', 'right', 'jump', 'crouch', 'fire', 'interact']) {
    assert.match(html, new RegExp(`data-hub-control=["']${control}["']`));
  }
  for (const code of ['KeyA', 'KeyD', 'Space', 'KeyF']) assert.match(html, new RegExp(`data-mission-key=["']${code}["']`));
  assert.match(html, /src=["']\/src\/app\.js["']/);
  assert.match(html, /href=["']\/styles\.css["']/);
  assert.match(html, /v53\.0\.0/);
});

test('la couche visuelle v52 reste modulaire, tactile et accessible', () => {
  assert.match(styles, /@import url\('\/styles-v50\.css'\)/);
  assert.match(styles, /\.strategy-grid/);
  assert.match(styles, /\.operations-layout/);
  assert.match(styles, /\.runtime-touch/);
  assert.match(styles, /@media \(pointer: coarse\)/);
  assert.match(styles, /html\[data-subtitles='off'\]/);
  assert.match(styles, /html\[data-contrast='high'\]/);
  assert.match(html, /aria-live=["']polite["']/);
  assert.match(html, /class=["']skip-link["']/);
});
