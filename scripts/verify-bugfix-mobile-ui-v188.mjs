// V188 bug hunt — phone UI: galaxy map labels, archive list layout and the
// hub navigation QA timing. Source and structure assertions (CSS is checked
// by its rules; the browser screenshots are recorded in the PR notes).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WORLDS } from '../src/content-core-v50.js';
import { GALAXY_PHONE_COLUMNS_V188, GALAXY_PHONE_QUERY_V188, snapWorldsToPhoneGridV188, worldShortCodeV188 } from '../src/galaxy-map-mobile-v188.js';
import { EN_CATALOG_V185 } from '../src/i18n-en-catalog-v185.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const app = read('src/app.js');
const styles = read('styles.css');
const qa = read('scripts/qa-hub-navigation-v133.mjs');

// Same spiral as app.js worldPosition (kept unchanged for desktop).
const spiral = index => {
  const angle = index * 2.39996, radius = Math.min(44, 8 + 5.1 * Math.sqrt(index));
  return { left: 50 + Math.cos(angle) * radius, top: 50 + Math.sin(angle) * Math.min(42, radius) };
};
const phoneRule = () => {
  const start = styles.indexOf('/* V188 galaxy map');
  assert.ok(start > 0, 'V188 galaxy map block present');
  return styles.slice(start, styles.indexOf('@keyframes world-sheet-v188', start));
};

test('galaxy short codes are unique, compact and keep designations readable', () => {
  const codes = WORLDS.map(world => worldShortCodeV188(world.name));
  assert.equal(new Set(codes).size, WORLDS.length, 'one code per world');
  assert.ok(codes.every(code => code.length >= 2 && code.length <= 8), 'codes fit a 51 px phone cell');
  assert.equal(worldShortCodeV188('Acheron / LV-426'), 'LV426');
  assert.equal(worldShortCodeV188('Acheron / LV-426 — Prime'), 'LV426·P');
  assert.equal(worldShortCodeV188('Fiorina 161'), 'FIO161');
  assert.equal(worldShortCodeV188('Sevastopol'), 'SEV');
  assert.equal(worldShortCodeV188('Sulaco Drift — Frontier'), 'SDR·F');
});

test('phone grid gives every world its own cell with a touch target of at least 44 px', () => {
  const grid = snapWorldsToPhoneGridV188(WORLDS.map((world, index) => ({ id: world.id, ...spiral(index) })));
  assert.equal(grid.columns, GALAXY_PHONE_COLUMNS_V188);
  assert.equal(grid.cells.size, WORLDS.length);
  const keys = [...grid.cells.values()].map(cell => `${cell.col}:${cell.row}`);
  assert.equal(new Set(keys).size, WORLDS.length, 'no two worlds share a cell');
  // 390 px viewport: 16 px page padding each side, 1 px border each side.
  const mapWidth = 390 - 32 - 2, mapHeight = 520 - 2;
  assert.ok(mapWidth / grid.columns >= 44, `cell width ${mapWidth / grid.columns}`);
  assert.ok(mapHeight / grid.rows >= 44, `cell height ${mapHeight / grid.rows}`);
  // A filtered search keeps the geometry valid.
  const few = snapWorldsToPhoneGridV188(WORLDS.slice(0, 3).map((world, index) => ({ id: world.id, ...spiral(index) })));
  assert.equal(few.cells.size, 3);
});

test('galaxy map markup keeps desktop positions and the full accessible name', () => {
  assert.match(app, /style="left:\$\{point\.left\}%;top:\$\{point\.top\}%;--cell-col:\$\{cell\.col\};--cell-row:\$\{cell\.row\}"/);
  assert.match(app, /<span class="world-node-code-v188" aria-hidden="true">/);
  assert.match(app, /<span class="world-node-name-v188">\$\{escapeHtml\(world\.name\)\}/);
  assert.match(app, /aria-controls="world-detail"/);
  assert.match(app, /openWorldSheetV188\(\);\n\s*\}\n\s*if \(target\.hasAttribute\('data-world-sheet-close-v188'\)\) closeWorldSheetV188\(\);/);
  assert.match(app, /event\.key !== 'Escape' \|\| !worldSheetOpenV188/);
  assert.match(app, /if \(name !== 'galaxy'\) closeWorldSheetV188\(\{ restoreFocus: false \}\);/);
  assert.match(app, /detail\.setAttribute\('role', 'dialog'\)/);
  assert.match(app, /byId\('world-detail-title-v188'\)\?\.focus/);
  assert.match(app, /aria-label="Fermer le détail du monde">FERMER<\/button>/);
  assert.equal(GALAXY_PHONE_QUERY_V188, '(max-width: 760px)');
});

test('galaxy phone CSS: codes, hidden-but-readable names, 44 px targets, bottom sheet; desktop hides the phone parts', () => {
  const block = phoneRule();
  assert.match(block, /\.world-node-code-v188,\n\.world-sheet-close-v188 \{ display: none; \}/, 'desktop hides code and close button');
  assert.match(block, /@media \(max-width: 760px\)/);
  assert.match(block, /min-width: 44px;\n\s*min-height: 44px;/);
  assert.match(block, /\.world-node-name-v188 \{[^}]*clip-path: inset\(50%\)/, 'name visually hidden, not display:none');
  assert.doesNotMatch(block, /\.world-node-name-v188 \{[^}]*display: none/);
  assert.match(block, /world-sheet-open-v188 #world-detail \{[^}]*position: fixed;[^}]*inset: auto 0 0 0;/);
  assert.match(block, /world-sheet-open-v188 #world-detail \.button \{ min-height: 44px; \}/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\) \{ \.galaxy-layout\.world-sheet-open-v188 #world-detail \{ animation: none; \} \}/);
});

test('new galaxy text exists in French and English', () => {
  assert.equal(EN_CATALOG_V185['Fermer le détail du monde'], 'Close the world details');
  assert.equal(EN_CATALOG_V185.FERMER, 'CLOSE');
});

test('archive list stacks entries as a column so long titles never spill into the next entry', () => {
  const list = styles.match(/\.archives-list-v68 \{([^}]*)\}/)[1];
  assert.match(list, /display: flex;/);
  assert.match(list, /flex-direction: column;/);
  assert.doesNotMatch(list, /display: grid/);
  const entry = styles.match(/\.archive-entry-v68 \{([^}]*)\}/)[1];
  assert.match(entry, /flex: none;/, 'entries never shrink inside the scrolling list');
  assert.match(entry, /min-height: 116px;/);
  assert.match(entry, /overflow-wrap: anywhere;/);
});

test('hub navigation QA waits for the runtime instead of fixed delays', () => {
  assert.doesNotMatch(qa, /waitForTimeout/, 'no fixed pauses');
  assert.match(qa, /h\.annexTransitionV71&&!h\.hubDoorClosingV142\s*&&!h\.hubDoorBlockedV142&&!h\.hubLiftTransitV163\?\.trip/);
  assert.match(qa, /h\.state\.deck===d&&!h\.hubLiftTransitV163\?\.trip/, 'lift ready = destination deck and trip finished');
  assert.match(qa, /pressUntilStarted\('KeyS'/);
  assert.match(qa, /pressUntilStarted\('KeyE'/);
  // Tolerance derived from the hub movement constants (sprint 370, acceleration 15).
  const runtime = read('src/hub-v71-runtime.js');
  assert.match(runtime, /const SPRINT_SPEED = 370;/);
  assert.match(runtime, /const acceleration = this\.player\.grounded \? 15 : 8;/);
  assert.match(qa, /SPRINT_SPEED_V188=370,GROUND_ACCELERATION_V188=15/);
  // The annex-exit wait passes its options as options, not as the page argument.
  assert.match(qa, /annexTransitionV71,null,\{timeout:12000\}\);await waitHubReady\(\);/);
});
