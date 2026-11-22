// Spec 012 — developer tools (hidden scene launcher, shooting range), source-only.
// Fixtures: every enabled launcher entry is built from createDefaultSave() by
// devtools/dev-fixtures-v188.js (game rules + migrateSave + inspectSaveSlotV78); no other
// injection than the ones each fixture declares in `injections`. The storage shim is run
// in a vm with a fake window whose localStorage holds a "real" profile.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import { buildDevCatalogV188, filterDevCatalogV188, expectedLandedV188, DEV_CATEGORIES_V188, DEV_RANGE_CAMPAIGN_V188 } from '../devtools/dev-catalog-v188.js';
import { buildDevSessionV188, buildDevSaveV188, devCampaignBlockV188, devFixtureFactsV188, DEV_PROFILE_KEY_V188, DEV_PROLOGUE_STEPS_V188 } from '../devtools/dev-fixtures-v188.js';
import { observedFireRateV188, windowDpsV188, theoreticalDpsV188, theoreticalTtkV188, ttkByCasteV188, spreadStatsV188, reloadStatsV188,
  rangeDistancePxV188, rangeDistanceMetresV188, applyTuningV188, tuningDiffV188 } from '../devtools/dev-range-metrics-v188.js';
import { injectDevSessionHtmlV188, isDevSessionRequestV188 } from './dev-tools-server-v188.mjs';
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
import { queensStateV188, QUEENS_NACRE_WORLD_ID_V188 } from '../src/side-campaign-queens-v188.js';

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

test('public build exclusion: devtools and its server module are source-only', () => {
  const files = readdirSync(new URL('../devtools/', import.meta.url));
  assert.ok(files.length >= 8);
  for (const path of ['devtools', ...files.map(file => `devtools/${file}`), 'scripts/dev-tools-server-v188.mjs', 'scripts/verify-dev-tools-v188.mjs', 'scripts/qa-dev-tools-v188.mjs',
    'specs/012-outils-dev', 'specs/012-outils-dev/spec.md', 'specs/012-outils-dev/plan.md', 'specs/012-outils-dev/tasks.md']) {
    const directory = !path.includes('.');
    assert.equal(isPublicDistributionPathV86(path, { directory }), true, `source admits ${path}`);
    assert.equal(isPublicDistributionPathV86(path, { directory, built: true }), false, `build rejects ${path}`);
  }
  // Nothing shipped references the dev tools; the build copies only its listed roots.
  const build = readFileSync(new URL('./build.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(build, /devtools/);
  assert.doesNotMatch(readFileSync(new URL('../index.html', import.meta.url), 'utf8'), /devtools|atf-dev/);
  assert.doesNotMatch(readFileSync(new URL('../sw.js', import.meta.url), 'utf8'), /devtools/);
  for (const file of readdirSync(new URL('../src/', import.meta.url)).filter(name => name.endsWith('.js')))
    assert.doesNotMatch(readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8'), /devtools\//, file);
});

test('dev server: injection only on /?atf-dev=v188, at exact anchors', () => {
  assert.equal(isDevSessionRequestV188('/?atf-dev=v188'), true);
  assert.equal(isDevSessionRequestV188('/index.html?atf-dev=v188&x=1'), true);
  for (const url of ['/', '/?atf-dev=1', '/devtools/?atf-dev=v188', '/src/app.js?atf-dev=v188']) assert.equal(isDevSessionRequestV188(url), false, url);
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const injected = injectDevSessionHtmlV188(html);
  const storage = injected.indexOf('/devtools/dev-storage-v188.js'), first = injected.indexOf('<script');
  assert.equal(storage > 0 && injected.lastIndexOf('<script', storage) === first, true, 'the isolated storage is the first script');
  assert.ok(injected.indexOf('/devtools/dev-session-v188.js') > injected.indexOf('/src/app.js'));
  assert.throws(() => injectDevSessionHtmlV188('<html></html>'), /anchors/);
});

test('isolated storage: the real localStorage is neither read nor written', () => {
  const real = new Map([['atf-v47-profile-1', '{"real":true}'], ['atf-language-v185', 'en']]);
  const realStorage = { getItem: key => real.get(key) ?? null, setItem: (key, value) => real.set(key, value), removeItem: key => real.delete(key) };
  const session = new Map([['atf-dev-session-v188', JSON.stringify({ entryId: 'hub-armory', launch: { kind: 'hub' }, storage: { 'atf-v47-profile-1': '{"dev":true}' } })]]);
  const listeners = [];
  const window = { sessionStorage: { getItem: key => session.get(key) ?? null, setItem: (key, value) => session.set(key, value) }, addEventListener: (...args) => listeners.push(args) };
  Object.defineProperty(window, 'localStorage', { configurable: true, get: () => realStorage });
  const context = vm.createContext({ window, document: { documentElement: { dataset: {} } }, Map, JSON, Object, Array, String });
  vm.runInContext(readFileSync(new URL('../devtools/dev-storage-v188.js', import.meta.url), 'utf8'), context);
  assert.equal(window.localStorage.getItem('atf-v47-profile-1'), '{"dev":true}');
  assert.equal(window.localStorage.getItem('atf-language-v185'), null, 'nothing is copied from the real storage');
  window.localStorage.setItem('atf-v47-profile-1', '{"dev":2}'); window.localStorage.removeItem('x');
  assert.equal(real.get('atf-v47-profile-1'), '{"real":true}');
  assert.equal(JSON.parse(session.get('atf-dev-session-v188')).storage['atf-v47-profile-1'], '{"dev":2}', 'session persists in this tab only');
  assert.ok(listeners.some(([type, , capture]) => type === 'storage' && capture === true), 'cross-tab storage events are stopped');
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
