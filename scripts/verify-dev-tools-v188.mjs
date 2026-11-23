// Spec 012 — developer tools (hidden scene launcher, shooting range): shipped hidden in the public
// build since the owner decision of 2026-11-23 (isolated, not linked, not precached).
// Fixtures: every enabled launcher entry is built from createDefaultSave() by
// devtools/dev-fixtures-v188.js (game rules + migrateSave + inspectSaveSlotV78); no other
// injection than the ones each fixture declares in `injections`. The inline bootstrap (the
// storage shim behind the dev-query test) is run in a vm with a fake window whose localStorage
// holds a "real" profile; the build step is run on a temporary directory with a copy of index.html.
import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { buildDevCatalogV188, filterDevCatalogV188, expectedLandedV188, DEV_CATEGORIES_V188, DEV_RANGE_CAMPAIGN_V188 } from '../devtools/dev-catalog-v188.js';
import { buildDevSessionV188, buildDevSaveV188, devCampaignBlockV188, devFixtureFactsV188, DEV_PROFILE_KEY_V188, DEV_PROLOGUE_STEPS_V188 } from '../devtools/dev-fixtures-v188.js';
import { observedFireRateV188, windowDpsV188, theoreticalDpsV188, theoreticalTtkV188, ttkByCasteV188, spreadStatsV188, reloadStatsV188,
  rangeDistancePxV188, rangeDistanceMetresV188, applyTuningV188, tuningDiffV188 } from '../devtools/dev-range-metrics-v188.js';
import { isDevSessionRequestV188 } from './dev-tools-server-v188.mjs';
import { DEV_SESSION_SEARCH_TEST_V188, DEV_TOOLS_DEFAULT_PATH_V188, DEV_TOOLS_FILES_V188, devBootstrapScriptV188, extractDevBootstrapV188, findBuiltDevToolsPathV188,
  injectDevBootstrapHtmlV188, resolveDevToolsPathV188, shipDevToolsV188, splitDevToolsManifestV188 } from './build-dev-tools-v188.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { inspectSaveSlotV78 } from '../src/save-profile-v78.js';
import { migrateSave } from '../src/save.js';
import { CAMPAIGNS, WEAPONS, ENEMIES } from '../src/content.js';
import { CINEMATIC_IDS_V188 } from '../src/story-cinematics-v188.js';
import { HUB_DECKS } from '../src/hub-opening-v88.js';
import { ASPHODELE_ROOM_IDS_V188, resolveAsphodeleHubV188 } from '../src/asphodele-hub-v188.js';
import { COLONY_LEVEL_PHASES_V188 } from '../src/colony-mission-levels-v188.js';
import { STATION_LEVEL_PHASES_V188 } from '../src/station-mission-levels-v188.js';
import { act5StateV188 } from '../src/story-act5-v188.js';
import { normalizeStoryCampaignV188 } from '../src/story-campaign-v188.js';
import { confrontationStateV188 } from '../src/confrontation-v188.js';
import { queensStateV188, QUEENS_NACRE_WORLD_ID_V188, QUEENS_ECHO_WORLD_ID_V188, QUEENS_TR0_WORLD_ID_V188, QUEENS_ARCS_V188, QUEENS_CHAPTER_IDS_V188,
  queensReturnSceneDueV188, queensDebriefDueV188, queensLockReasonV188, queensPendingChoiceV188, queensCampaignCompleteV188 } from '../src/side-campaign-queens-v188.js';
import { QUEENS_CREW_QUESTS_V188 } from '../src/queens-crew-quests-v188.js';
import { crewQuestActionsV188 } from '../src/crew-quests-v188.js';

const catalog = buildDevCatalogV188();
const sessions = new Map(catalog.filter(entry => !entry.blocked).map(entry => [entry.id, buildDevSessionV188(entry, { language: 'fr' })]));
const saveOf = id => JSON.parse(sessions.get(id).storage[DEV_PROFILE_KEY_V188]);

test('every enabled launcher entry yields a valid save, the expected scene id and an isolated storage', () => {
  assert.ok(catalog.length > 600, `catalogue size ${catalog.length}`);
  for (const entry of catalog) {
    if (entry.blocked) { assert.throws(() => buildDevSessionV188(entry), /not available/); continue; }
    const session = sessions.get(entry.id);
    assert.equal(session.sceneId, entry.sceneId, entry.id);
    assert.equal(session.inspection, 'ready', entry.id);
    assert.deepEqual(Object.keys(session.storage).sort(), ['atf-language-v185', 'atf-v47-profile-1', 'atf-v78-selected-profile'], entry.id);
    const raw = session.storage[DEV_PROFILE_KEY_V188];
    assert.equal(inspectSaveSlotV78(raw).status, 'ready', entry.id);
    // The page migrates it again on load: the result must stay valid.
    assert.equal(inspectSaveSlotV78(JSON.stringify(migrateSave(JSON.parse(raw), 1))).status, 'ready', entry.id);
    const save = JSON.parse(raw), launch = entry.launch;
    assert.doesNotMatch(expectedLandedV188(launch, save), /unknown/, `${entry.id}: the landed scene is known`);
    if (launch.kind === 'mission' || launch.kind === 'range') {
      assert.equal(devCampaignBlockV188(save, launch.campaignId), null, `${entry.id}: ${launch.campaignId} must be launchable`);
      assert.equal(save.strategy.plannedCampaignId, launch.campaignId, entry.id);
      assert.equal(save.strategy.currentOperation, null, entry.id);
      assert.match(entry.sceneId, launch.kind === 'range' ? /^range$/ : new RegExp(`^mission:${launch.campaignId}(#|$)`));
    }
    if (launch.kind === 'hub' && launch.hub) assert.equal(save.hub.roomId, launch.hub.roomId, entry.id);
    if (launch.kind === 'hub' && launch.asphodele) {
      const hub = resolveAsphodeleHubV188(save);
      assert.equal(hub.location, 'station', entry.id); assert.equal(hub.roomId, launch.asphodele, entry.id);
    }
    if (launch.kind === 'title' || launch.kind === 'creator' || launch.kind === 'intro') assert.equal(save.needsPlayerCreationV84, true, entry.id);
    else assert.equal(save.needsPlayerCreationV84, false, entry.id);
  }
});

test('prologue steps are reached with the game\'s own advance functions', () => {
  for (const step of DEV_PROLOGUE_STEPS_V188) {
    const save = saveOf(`prologue-${step.id}`), facts = devFixtureFactsV188(save);
    assert.equal(facts.step, step.step, step.id);
    if (step.opening) assert.equal(save.openingV88.phase, step.opening, step.id);
    if (step.port) assert.equal(save.portMeridienV90.phase, step.port, step.id);
    if (step.exercise) assert.equal(save.openingExerciseV89.phase, step.exercise, step.id);
  }
  assert.equal(saveOf('prologue-p1-wake').onboardingV84.phase, 'wake');
  assert.deepEqual(saveOf('prologue-p2-relay').hub.annexOperationsV71.provingGround.qualificationReceiptIdsV81, ['m41a-qualification-v81:session-1:qualification']);
});

test('story states: Interlude, council, hearing, each ending, epilogue, Saison des Reines', () => {
  assert.equal(normalizeStoryCampaignV188(saveOf('main-interlude-alert').storyCampaignV188).interlude.phase, 'alert');
  assert.equal(normalizeStoryCampaignV188(saveOf('main-interlude-choice').storyCampaignV188).interlude.phase, 'choice');
  assert.equal(act5StateV188(saveOf('main-council')).phase, 'council');
  assert.ok(confrontationStateV188(saveOf('main-halloran-hearing'), 'act5-halloran-quay'), 'the quay hearing is open');
  for (const ending of ['relay-speaks', 'living-without-proof', 'freight-first']) {
    const state = act5StateV188(saveOf(`ending-${ending}`));
    assert.equal(state.phase, 'ending', ending); assert.equal(state.decision.ending, ending, ending);
  }
  assert.equal(act5StateV188(saveOf('ending-epilogue')).phase, 'epilogue');
  assert.equal(act5StateV188(saveOf('ending-credits')).phase, 'credits');
  assert.equal(act5StateV188(saveOf('ending-free-play')).phase, 'complete');
  assert.equal(queensStateV188(saveOf('queens-call')).phase, 'call');
  assert.equal(saveOf('queens-travel').galaxy.jumpV116.phase, 'charging');
  assert.ok(queensStateV188(saveOf('queens-arrival')).arrivedDay, 'arrival recorded by recordQueensArrivalV188');
  assert.equal(saveOf('queens-arrival').galaxy.shipWorldIdV116, QUEENS_NACRE_WORLD_ID_V188, 'the jump was settled by confirmJumpV115');
  // Spec 011, second lot: every new step of Arcs 2 and 3 is reachable, built with the campaign's own rules.
  const ids = new Set(catalog.map(entry => entry.id));
  for (const arc of QUEENS_ARCS_V188) {
    for (const id of arc.order) assert.ok(ids.has(`queens-arc${arc.arc}-${id}`), `${id}: story entry`);
    for (const item of [...arc.sides, ...arc.contracts]) assert.ok(ids.has(`queens-side-${item.id}`), `${item.id}: side entry`);
  }
  assert.equal(saveOf('queens-arc2-arrival').galaxy.shipWorldIdV116, QUEENS_ECHO_WORLD_ID_V188);
  assert.equal(queensReturnSceneDueV188(saveOf('queens-arc2-arrival')), 'echo-arrival');
  assert.equal(saveOf('queens-arc3-arrival').galaxy.shipWorldIdV116, QUEENS_TR0_WORLD_ID_V188);
  assert.equal(queensReturnSceneDueV188(saveOf('queens-arc3-arrival')), 'tr0-arrival', 'CQ-04 then the arrival scene');
  assert.equal(queensDebriefDueV188(saveOf('queens-arc1-debrief')), 'arc1-debrief');
  assert.equal(queensDebriefDueV188(saveOf('queens-arc2-debrief')), 'arc2-debrief');
  assert.ok(saveOf('queens-tr0-map').galaxy.unlockedWorldIds.includes(QUEENS_TR0_WORLD_ID_V188), 'TR-0 revealed by 2.5');
  assert.equal(saveOf('queens-arrival').galaxy.unlockedWorldIds.includes(QUEENS_TR0_WORLD_ID_V188), false, 'TR-0 hidden before Arc 3');
  assert.equal(queensStateV188(saveOf('queens-side-queens-a-rask')).raskEgg, 'release', 'Rask calls only those who let him go');
  assert.equal(queensLockReasonV188(saveOf('queens-side-queens-a-grue'), 'queens-a-grue'), null, 'Grue is an ally in that fixture');
  const crisis = saveOf('queens-egg-crisis');
  assert.equal(queensStateV188(crisis).eggCrisis.phase, 'alert');
  assert.deepEqual([crisis.hub.activeCrisis.id, crisis.hub.activeCrisis.deck, crisis.hub.activeCrisis.roomId, crisis.hub.activeCrisis.resolved],
    [queensStateV188(crisis).eggCrisis.crisisId, 2, 'quarantine', false], 'the hub crisis created by createHubCrisis');
  assert.equal(queensStateV188(saveOf('queens-egg-after')).eggCrisis.outcome, 'neutralised');
  assert.equal(queensReturnSceneDueV188(saveOf('queens-egg-after')), 'egg-crisis-after');
  assert.equal(queensPendingChoiceV188(saveOf('queens-specimen-choice'))?.id, 'specimen');
  for (const choice of ['inez', 'bishop']) {
    const ending = saveOf(`queens-ending-${choice}`);
    assert.equal(queensStateV188(ending).specimen, choice); assert.equal(queensCampaignCompleteV188(ending), true);
    assert.equal(queensDebriefDueV188(ending), 'campaign-debrief', choice);
  }
  assert.equal(queensStateV188(saveOf('queens-ending-egg')).eggCrisis.outcome, 'extracted');
  assert.equal(queensDebriefDueV188(saveOf('queens-ending-egg')), 'campaign-debrief');
  const quests = saveOf('queens-crew-quests');
  for (const quest of QUEENS_CREW_QUESTS_V188) assert.ok(crewQuestActionsV188(quests, quest.crewId, 'fr').some(entry => entry.id === quest.id && entry.action === 'accept'), `${quest.id} is offered`);
  // The moved chapters are listed with their arc, not among the special operations.
  for (const id of QUEENS_CHAPTER_IDS_V188) assert.equal(catalog.filter(entry => entry.launch.campaignId === id).every(entry => entry.category === 'queens'), true, id);
  assert.equal(saveOf('colony-c4-decision').colonyMissionsV188.c4, null);
  assert.equal(saveOf('station-cassius-choice').stationV188.cassius, null);
  assert.equal(saveOf('station-intro').stationV188.introHeard, false);
});

test('catalogue covers the requested parts of the game', () => {
  const ids = new Set(catalog.map(entry => entry.id));
  for (const category of DEV_CATEGORIES_V188) assert.ok(catalog.some(entry => entry.category === category.id), category.id);
  for (const id of CINEMATIC_IDS_V188) assert.ok(ids.has(`cinematic-${id}`), id);
  for (const deck of HUB_DECKS) for (const room of deck.rooms) assert.ok(ids.has(`hub-${room.id}`), room.id);
  for (const room of ASPHODELE_ROOM_IDS_V188) assert.ok(ids.has(`asphodele-${room}`), room);
  for (const [campaignId, phases] of [...Object.entries(COLONY_LEVEL_PHASES_V188), ...Object.entries(STATION_LEVEL_PHASES_V188)])
    for (const phase of phases) assert.ok(ids.has(`checkpoint-${campaignId}-${phase.id}`), `${campaignId}#${phase.id}`);
  const launched = new Set(catalog.map(entry => entry.launch.campaignId).filter(Boolean));
  for (const campaign of CAMPAIGNS) assert.ok(launched.has(campaign.id), `campaign ${campaign.id} has an entry`);
  assert.ok(ids.has('range') && !catalog.find(entry => entry.id === 'range').blocked);
  assert.equal(CAMPAIGNS.find(c => c.id === DEV_RANGE_CAMPAIGN_V188)?.mode, 'FRONTIER', 'the range runs on a normal mission (squad doctrine active)');
  assert.equal(filterDevCatalogV188(catalog, { query: 'cin-cq-01' }).length, 1);
  assert.ok(filterDevCatalogV188(catalog, { category: 'campaigns', query: 'mire' }).length > 100);
  assert.ok(filterDevCatalogV188(catalog, { query: 'hopital' }).length >= 0);
  for (const entry of catalog.filter(item => item.blocked)) assert.match(entry.blocked, /\S/, entry.id);
});

test('a prerequisite is never marked done before the game would let it start', () => {
  assert.throws(() => buildDevSaveV188({ kind: 'mission', campaignId: 'station-s2' }), /station-s2 blocked/);
  assert.throws(() => buildDevSaveV188({ kind: 'mission', campaignId: 'act5-port-walls', milestone: 'council' }), /blocked \(act5:/);
  assert.throws(() => buildDevSaveV188({ kind: 'view', before: ['colony-c2'] }), /colony-c2 is not launchable yet/);
});

test('admissions: the tools are shipped under one hidden directory; scripts, specs and docs stay source-only', () => {
  const files = readdirSync(new URL('../devtools/', import.meta.url)).sort();
  assert.deepEqual(files, [...DEV_TOOLS_FILES_V188].sort(), 'the shipped list is the whole devtools directory');
  for (const path of ['devtools', ...files.map(file => `devtools/${file}`)]) {
    const directory = !path.includes('.');
    assert.equal(isPublicDistributionPathV86(path, { directory }), true, `source admits ${path}`);
    assert.equal(isPublicDistributionPathV86(path, { directory, built: true }), false, `a build never carries the source directory name: ${path}`);
  }
  for (const path of ['scripts/dev-tools-server-v188.mjs', 'scripts/build-dev-tools-v188.mjs', 'scripts/verify-dev-tools-v188.mjs', 'scripts/qa-dev-tools-v188.mjs', 'scripts/qa-dev-tools-built-v188.mjs',
    'specs/012-outils-dev', 'specs/012-outils-dev/spec.md', 'specs/012-outils-dev/plan.md', 'specs/012-outils-dev/tasks.md']) {
    const directory = !path.includes('.');
    assert.equal(isPublicDistributionPathV86(path, { directory }), true, `source admits ${path}`);
    assert.equal(isPublicDistributionPathV86(path, { directory, built: true }), false, `build rejects ${path}`);
  }
  for (const hidden of [DEV_TOOLS_DEFAULT_PATH_V188, 'k3-quai-nord-0417']) {
    assert.equal(isPublicDistributionPathV86(hidden, { directory: true, built: true }), true, hidden);
    assert.equal(isPublicDistributionPathV86(hidden, { directory: true }), false, 'the hidden directory exists in a build only');
    for (const file of DEV_TOOLS_FILES_V188) assert.equal(isPublicDistributionPathV86(`${hidden}/${file}`, { built: true }), true, file);
    for (const stray of ['notes.md', 'dev-extra-v188.js', 'sub/dev-launcher-v188.js', 'sub']) assert.equal(isPublicDistributionPathV86(`${hidden}/${stray}`, { built: true, directory: stray === 'sub' }), false, stray);
  }
  for (const refused of ['docs', 'scripts', 'devtools', 'tests', 'short', 'Labo-Tantalus', 'a/b-c-d-e-f-g'])
    assert.equal(isPublicDistributionPathV86(`${refused}/dev-launcher-v188.js`, { built: true }), false, refused);
});

test('the access path is configurable at build time, with a documented default', () => {
  assert.equal(resolveDevToolsPathV188({}), DEV_TOOLS_DEFAULT_PATH_V188);
  assert.equal(resolveDevToolsPathV188({ ATF_DEV_TOOLS_PATH: '' }), DEV_TOOLS_DEFAULT_PATH_V188);
  assert.equal(resolveDevToolsPathV188({ ATF_DEV_TOOLS_PATH: 'k3-quai-nord-0417' }), 'k3-quai-nord-0417');
  for (const refused of ['dev', 'devtools', 'scripts', 'src', 'assets', 'a/b/c/d/e/f', '../outside1', 'UPPERCASE1', 'with space1', 'trailing-dash-', '-leading-dash', 'double--dash1', 'x'.repeat(65), 'node_modules', 'reference-masters'])
    assert.throws(() => resolveDevToolsPathV188({ ATF_DEV_TOOLS_PATH: refused }), /ATF_DEV_TOOLS_PATH/, refused);
  for (const text of ['AGENTS.md', 'specs/012-outils-dev/plan.md'].map(path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'))) {
    assert.ok(text.includes(DEV_TOOLS_DEFAULT_PATH_V188) && text.includes('ATF_DEV_TOOLS_PATH'), 'the default and the variable are documented');
    assert.match(text, /aucun contrôle d[’']accès/, 'hidden is stated as obscurity only');
  }
});

test('not linked: no player file names the tools; the bootstrap is the only addition to the shell', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /devtools|atf-dev/, 'the source shell is unchanged: the bootstrap is added when served or built');
  const mention = new RegExp(`devtools/|atf-dev(?!ice)|${DEV_TOOLS_DEFAULT_PATH_V188}|ATF_DEV_TOOLS`);
  for (const file of readdirSync(new URL('../src/', import.meta.url)).filter(name => /\.(?:js|css)$/.test(name)))
    assert.doesNotMatch(readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8'), mention, file);
  for (const file of readdirSync(new URL('../', import.meta.url)).filter(name => /\.(?:css|webmanifest)$/.test(name) || name === 'sw.js' || name === 'vercel.json'))
    assert.doesNotMatch(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'), mention, file);
  // The tools find their own directory; nothing hard-codes the source name.
  for (const file of DEV_TOOLS_FILES_V188.filter(name => name.endsWith('.js')))
    assert.doesNotMatch(readFileSync(new URL(`../devtools/${file}`, import.meta.url), 'utf8'), /['"`]\/devtools\//, file);
  assert.match(readFileSync(new URL('../devtools/dev-launcher-v188.js', import.meta.url), 'utf8'), /session\.base = DEV_BASE_PATH_V188/);
  assert.match(readFileSync(new URL('../devtools/index.html', import.meta.url), 'utf8'), /<meta name="robots" content="noindex,nofollow">/);
  // build.mjs (the game copy) is untouched; the release builder ships the tools afterwards.
  assert.doesNotMatch(readFileSync(new URL('./build.mjs', import.meta.url), 'utf8'), /devtools|dev-tools/);
  assert.match(readFileSync(new URL('./build-release-v143.mjs', import.meta.url), 'utf8'), /await shipDevToolsV188\(root, output\)/);
});

test('not precached: the service worker neither lists nor caches the tools or a dev URL', () => {
  const worker = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  const origin = 'https://atf.test';
  const context = vm.createContext({ self: { addEventListener() {}, location: { origin } }, URL, Request, Response, Headers });
  vm.runInContext(`${worker};globalThis.api={SHELL,cacheableRequestV143};`, context);
  assert.ok(context.api.SHELL.includes('/src/app.js'));
  assert.equal(context.api.SHELL.some(path => /devtools|dev-(?:catalog|fixtures|launcher|range|session|storage)-v188/.test(path)), false);
  const cacheable = path => context.api.cacheableRequestV143(new Request(origin + path));
  assert.equal(cacheable('/src/app.js'), true, 'control: a shell module is cacheable');
  for (const file of DEV_TOOLS_FILES_V188) for (const directory of ['devtools', DEV_TOOLS_DEFAULT_PATH_V188, 'k3-quai-nord-0417']) assert.equal(cacheable(`/${directory}/${file}`), false, `${directory}/${file}`);
  for (const path of [`/${DEV_TOOLS_DEFAULT_PATH_V188}/`, '/?atf-dev=v188', '/index.html?atf-dev=v188']) assert.equal(cacheable(path), false, path);
});

test('bootstrap: first script of the shell, inert without the exact dev query', () => {
  const shim = readFileSync(new URL('../devtools/dev-storage-v188.js', import.meta.url), 'utf8');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const injected = injectDevBootstrapHtmlV188(html, shim), boot = extractDevBootstrapV188(injected);
  assert.equal(boot, devBootstrapScriptV188(shim));
  assert.equal(injected.indexOf('<script'), injected.indexOf(boot), 'before intro-boot and every game script');
  assert.equal(injected.replace(`\n  ${boot}`, ''), html, 'nothing else changes in the shell');
  assert.ok(boot.startsWith(`<script data-atf-dev-boot="v188">if (${DEV_SESSION_SEARCH_TEST_V188}) {\n`), 'one test, then the shim');
  assert.ok(boot.length < 5000, `inline size ${boot.length}`);
  assert.doesNotMatch(boot, /^\s*\/\//m, 'comments are not shipped inline');
  assert.doesNotMatch(boot, new RegExp(`devtools|${DEV_TOOLS_DEFAULT_PATH_V188}`), 'the shell does not name the hidden directory');
  assert.throws(() => injectDevBootstrapHtmlV188(injected, shim), /already present/);
  assert.throws(() => injectDevBootstrapHtmlV188('<html></html>', shim), /anchor/);
  assert.throws(() => injectDevBootstrapHtmlV188(html.replace('<meta charset="UTF-8">', '<script></script><meta charset="UTF-8">'), shim), /preceded by a script/);
  assert.throws(() => devBootstrapScriptV188('alert(1)'), /unexpected storage shim/);
  const matches = search => new Function('location', `return ${DEV_SESSION_SEARCH_TEST_V188}`)({ search });
  for (const search of ['?atf-dev=v188', '?x=1&atf-dev=v188', '?atf-dev=v188&x=1']) { assert.equal(matches(search), true, search); assert.equal(isDevSessionRequestV188('/' + search), true, search); }
  for (const search of ['', '?', '?atf-dev=1', '?atf-dev=v1880', '?atf-dev', '?xatf-dev=v188', '?atf-dev=V188', '?q=atf-dev%3Dv188']) { assert.equal(matches(search), false, search); assert.equal(isDevSessionRequestV188('/' + search), false, search); }
  assert.equal(isDevSessionRequestV188('/any/path?atf-dev=v188'), true, 'whatever path serves the shell (rewrite fallback), the query isolates');
});

/** A fake page: `real` is the player's storage, `session` this tab's sessionStorage. */
function fakePage({ search = '?atf-dev=v188', session = null, lockedStorage = false } = {}) {
  const real = new Map([['atf-v47-profile-1', '{"real":true}'], ['atf-language-v185', 'en']]);
  const touched = { reads: 0, writes: 0 };
  const realStorage = { getItem: key => { touched.reads += 1; return real.get(key) ?? null; }, setItem: (key, value) => { touched.writes += 1; real.set(key, value); }, removeItem: key => { touched.writes += 1; real.delete(key); } };
  const sessionMap = new Map(session ? [['atf-dev-session-v188', JSON.stringify(session)]] : []);
  const listeners = [], ready = [], appended = [], navigations = [];
  const element = tag => ({ tag, style: {}, attributes: {}, setAttribute(name, value) { this.attributes[name] = value; } });
  const window = { sessionStorage: { getItem: key => sessionMap.get(key) ?? null, setItem: (key, value) => sessionMap.set(key, value), removeItem: key => sessionMap.delete(key) },
    addEventListener: (...args) => listeners.push(args), stop() { navigations.push('stop'); }, location: { search, replace: url => navigations.push(url) }, indexedDB: { open() { throw new Error('real IndexedDB opened'); } } };
  Object.defineProperty(window, 'localStorage', { configurable: !lockedStorage, get: () => realStorage });
  const document = { documentElement: { dataset: {} }, addEventListener: (type, listener) => { if (type === 'DOMContentLoaded') ready.push(listener); }, createElement: element,
    head: { appendChild: node => appended.push(node) }, body: { appendChild: node => appended.push(node) } };
  const context = vm.createContext({ window, document, location: window.location, Map, JSON, Object, Array, String, Boolean });
  return { window, document, context, real, touched, sessionMap, listeners, appended, navigations, domReady: () => ready.forEach(listener => listener()) };
}
const SHIM = readFileSync(new URL('../devtools/dev-storage-v188.js', import.meta.url), 'utf8');
const BOOT = devBootstrapScriptV188(SHIM).replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');

test('isolated storage: the real localStorage is neither read nor written', () => {
  const page = fakePage({ session: { entryId: 'hub-armory', launch: { kind: 'hub' }, base: '/k3-quai-nord-0417/', storage: { 'atf-v47-profile-1': '{"dev":true}' } } });
  vm.runInContext(BOOT, page.context);
  const { window } = page;
  assert.equal(window.localStorage.getItem('atf-v47-profile-1'), '{"dev":true}');
  assert.equal(window.localStorage.getItem('atf-language-v185'), null, 'nothing is copied from the real storage');
  window.localStorage.setItem('atf-v47-profile-1', '{"dev":2}'); window.localStorage.removeItem('x');
  assert.equal(page.real.get('atf-v47-profile-1'), '{"real":true}');
  assert.deepEqual(page.touched, { reads: 0, writes: 0 }, 'the real storage object is never used');
  assert.equal(JSON.parse(page.sessionMap.get('atf-dev-session-v188')).storage['atf-v47-profile-1'], '{"dev":2}', 'session persists in this tab only');
  assert.ok(page.listeners.some(([type, , capture]) => type === 'storage' && capture === true), 'cross-tab storage events are stopped');
  assert.equal(window.indexedDB, undefined, 'the field photo gallery database is withheld');
  assert.equal(window.__ATF_DEV_SESSION_V188__.isolated, true); assert.equal(window.__ATF_DEV_SESSION_V188__.base, '/k3-quai-nord-0417/');
  // The session bridge is loaded after the game's scripts, from the launcher's own directory.
  assert.equal(page.appended.length, 0); page.domReady();
  assert.deepEqual(page.appended.map(node => [node.tag, node.type, node.src]), [['script', 'module', '/k3-quai-nord-0417/dev-session-v188.js']]);
  // « Quitter »: a later write does not bring the session back.
  window.__ATF_DEV_SESSION_V188__.discard(); window.localStorage.setItem('late', '1');
  assert.equal(page.sessionMap.has('atf-dev-session-v188'), false);
});

test('isolated storage: inert without the dev query; isolated and empty without a session', () => {
  const normal = fakePage({ search: '?x=1' });
  vm.runInContext(BOOT, normal.context);
  assert.equal(normal.window.__ATF_DEV_SESSION_V188__, undefined);
  assert.equal(normal.window.localStorage.getItem('atf-language-v185'), 'en', 'the normal page keeps the real storage');
  assert.equal(typeof normal.window.indexedDB.open, 'function');
  assert.deepEqual([normal.listeners.length, normal.document.documentElement.dataset.atfDevSession], [0, undefined]);
  normal.domReady(); assert.equal(normal.appended.length, 0);

  const empty = fakePage();
  vm.runInContext(BOOT, empty.context);
  assert.equal(empty.window.localStorage.length, 0);
  assert.equal(empty.document.documentElement.dataset.atfDevSession, 'empty');
  empty.window.localStorage.setItem('atf-v47-profile-1', '{"new":true}');
  assert.deepEqual(empty.touched, { reads: 0, writes: 0 }); assert.equal(empty.sessionMap.size, 0, 'nothing is persisted without a session');
  empty.domReady();
  assert.deepEqual(empty.appended.map(node => node.tag), ['p'], 'a note, and no script: the launcher address is not disclosed');
});

test('isolated storage: a session cannot name a foreign or nested script directory; an unisolable page does not run', () => {
  for (const base of ['//evil.example/', 'https://evil.example/', '/a/b/', '/../', '/UPPER/', 'labo/', '/labo', '', null, 42, '/' + 'x'.repeat(65) + '/']) {
    const page = fakePage({ session: { entryId: 'x', storage: {}, base } });
    vm.runInContext(BOOT, page.context); page.domReady();
    assert.equal(page.window.__ATF_DEV_SESSION_V188__.base, null, String(base));
    assert.deepEqual(page.appended.map(node => node.tag), ['p'], String(base));
  }
  const locked = fakePage({ lockedStorage: true, session: { entryId: 'x', storage: {} } });
  vm.runInContext(BOOT, locked.context);
  assert.deepEqual(locked.navigations, ['stop', 'about:blank'], 'fail closed');
  assert.equal(locked.window.__ATF_DEV_SESSION_V188__, undefined); assert.deepEqual(locked.touched, { reads: 0, writes: 0 });
});

test('build: the tools are copied under the configured path and fingerprinted without naming it', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  for (const env of [{}, { ATF_DEV_TOOLS_PATH: 'k3-quai-nord-0417' }]) {
    const output = mkdtempSync(join(tmpdir(), 'atf-dev-tools-'));
    try {
      mkdirSync(join(output, 'src')); mkdirSync(join(output, 'assets'));
      copyFileSync(join(root, 'index.html'), join(output, 'index.html'));
      const shipped = await shipDevToolsV188(root, output, { env });
      const path = env.ATF_DEV_TOOLS_PATH || DEV_TOOLS_DEFAULT_PATH_V188;
      assert.deepEqual(shipped, { path, files: DEV_TOOLS_FILES_V188.length });
      assert.equal(await findBuiltDevToolsPathV188(output), path);
      assert.deepEqual(readdirSync(join(output, path)).sort(), [...DEV_TOOLS_FILES_V188].sort());
      const page = readFileSync(join(output, path, 'index.html'), 'utf8');
      assert.equal(page.includes('/devtools/'), false); assert.ok(page.includes(`src="/${path}/dev-launcher-v188.js"`) && page.includes(`href="/${path}/dev-v188.css"`));
      for (const file of DEV_TOOLS_FILES_V188.filter(name => name !== 'index.html')) assert.deepEqual(readFileSync(join(output, path, file)), readFileSync(join(root, 'devtools', file)), file);
      const shell = readFileSync(join(output, 'index.html'), 'utf8');
      assert.equal(extractDevBootstrapV188(shell), devBootstrapScriptV188(SHIM)); assert.equal(shell.includes(path), false, 'the shell does not name the hidden directory');
      const rows = [{ path: 'index.html', bytes: 1, sha256: 'a' }, { path: `${path}/index.html`, bytes: 2, sha256: 'b' }, { path: `${path}/dev-v188.css`, bytes: 3, sha256: 'c' }];
      const split = splitDevToolsManifestV188(rows, path);
      assert.deepEqual(split.files, [rows[0]]); assert.equal(split.devTools.files, 2); assert.equal(JSON.stringify(split).includes(path), false, 'the published manifest does not name the hidden directory');
      assert.equal(split.devTools.sha256, splitDevToolsManifestV188(rows.map(row => ({ ...row, path: row.path.replace(path, 'another-hidden-name') })), 'another-hidden-name').devTools.sha256, 'same tools, same fingerprint, whatever the name');
      mkdirSync(join(output, 'second-hidden-dir'));
      await assert.rejects(findBuiltDevToolsPathV188(output), /exactly one hidden directory/);
    } finally { rmSync(output, { recursive: true, force: true }); }
  }
});

test('range metrics math', () => {
  assert.deepEqual(observedFireRateV188([0, 0.1, 0.2, 0.3, 0.4, 2.0, 2.1]), { shots: 7, intervals: 5, rate: 10, interval: 0.1 });
  assert.equal(observedFireRateV188([]).rate, null);
  assert.deepEqual(windowDpsV188([{ t: 1, applied: 30 }, { t: 2.5, applied: 30 }, { t: 3.9, applied: 30 }], { now: 4, window: 3 }), { dps: 20, damage: 60, hits: 2 });
  assert.deepEqual(theoreticalDpsV188({ damage: 20, fireRate: 10, magazine: 30, reload: 2 }), { burst: 200, sustained: 120 });
  assert.deepEqual(theoreticalTtkV188({ damage: 20, fireRate: 10, magazine: 3, reload: 2 }, 100), { shots: 5, reloads: 1, seconds: 2.4 });
  assert.deepEqual(theoreticalTtkV188({ damage: 0, fireRate: 10 }, 100), { shots: null, seconds: null, reloads: null });
  assert.deepEqual(ttkByCasteV188([{ caste: 'drone', firstHit: 1, death: 2 }, { caste: 'drone', firstHit: 1, death: 4 }, { caste: 'egg', firstHit: 0, death: 0.5 }, { caste: 'x', firstHit: null, death: 3 }]),
    { drone: { kills: 2, mean: 2, min: 1, max: 3, median: 2 }, egg: { kills: 1, mean: 0.5, min: 0.5, max: 0.5, median: 0.5 } });
  const spread = spreadStatsV188([0, 0.01, 0.02].map(angle => ({ angle, aim: 0 })));
  assert.equal(spread.shots, 3); assert.ok(Math.abs(spread.meanDeg - 0.57) < 0.01); assert.ok(spread.climbDeg > 0.5);
  assert.equal(spreadStatsV188([{ angle: Math.PI + 0.01, aim: Math.PI }]).maxDeg, 0.57, 'angles wrap around ±180°');
  assert.deepEqual(reloadStatsV188([{ start: 1, end: 2.5 }, { start: 5, end: 6.5 }, { start: 9, end: null }]), { count: 2, mean: 1.5, last: 1.5 });
  assert.equal(rangeDistancePxV188(10), 510); assert.equal(rangeDistanceMetresV188(-255), 5);
  const rifle = WEAPONS.find(w => w.id === 'weapon-001-m41a-pulse-rifle');
  assert.equal(applyTuningV188('weapon', rifle, { damage: 9999, magazine: 30.6, reload: 'x' }).damage, 500, 'clamped to the runtime bounds');
  assert.equal(applyTuningV188('weapon', rifle, { magazine: 30.6 }).magazine, 31);
  const diff = tuningDiffV188({ weapon: WEAPONS, equipment: [], enemy: ENEMIES }, { weapon: { [rifle.id]: { damage: 24, fireRate: rifle.fireRate } }, enemy: { 'enemy-001-ovomorph': { health: 90 } }, bogus: { a: {} } }, { note: 'test' });
  assert.deepEqual(diff.changes.weapon[rifle.id], { damage: { from: rifle.damage, to: 24 } }, 'unchanged fields are not exported');
  assert.equal(diff.changes.enemy['enemy-001-ovomorph'].health.to, 90);
  assert.equal(diff.count, 2); assert.equal(diff.note, 'test'); assert.equal(diff.schema, 188);
});

test('the shooting range reuses the real runtime and catalogues', () => {
  const source = readFileSync(new URL('../devtools/dev-range-v188.js', import.meta.url), 'utf8');
  for (const hook of ['engine.createEnemy(', 'engine.start({', 'engine.applyEnemyDamage', 'engine.fire', 'engine.reload', 'performSquadActionV132', 'useEquipment', 'getPlaceablesSnapshotV86', 'resolvePlayerWeaponPoseV125'])
    assert.ok(source.includes(hook), hook);
  for (const catalogue of ['WEAPONS', 'EQUIPMENT', 'ENEMIES', 'SQUAD_ORDERS_V132', 'PLACEABLE_CATALOG_V86']) assert.ok(source.includes(catalogue), catalogue);
  assert.doesNotMatch(source, /writeFile|localStorage\.setItem/, 'tuning is exported for review, never written to the sources or the profile');
});
