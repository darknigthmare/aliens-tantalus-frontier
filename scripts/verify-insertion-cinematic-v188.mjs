// V188 — insertion / extraction cinematics (specs/003-insertion-extraction-cinematiques).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { WORLDS, CAMPAIGNS, VEHICLES } from '../src/content.js';
import {
  deriveInsertionPlaceTypeV188, insertionWorldProfileV188, resolveInsertionModeV188, selectInsertionLengthV188, markInsertionWorldSeenV188,
  insertionSeenWorldIdsV188, buildInsertionHandoverV188, buildInsertionSequenceV188, insertionShotAtV188, insertionFlightStateV188,
  insertionScreenModelV188, insertionWarningsV188, drawInsertionFrameV188, InsertionCinematicPlayerV188, insertionCameraV188,
  createExtractionFlowV188, extractionFlowOnEventV188, readBoardingEventV188, insertionLevelColourV188, INSERTION_LEVEL_SHAPES_V188,
  INSERTION_PLACE_OVERRIDES_V188, INSERTION_APC_TEMPLATE_IDS_V188, INSERTION_LINE_IDS_V188, INSERTION_SHOT_KINDS_V188, M577_VEHICLE_IDS_V188,
  INSERTION_BOARDING_EVENT_V188
} from '../src/insertion-cinematic-v188.js';
import { INSERTION_ASSET_SLOTS_V188, INSERTION_ASSET_SLOT_IDS_V188, INSERTION_ASSET_FILES_PRESENT_V188, INSERTION_ASSET_LAYERS_V188,
  InsertionAssetLoaderV188, getInsertionAssetSlotV188 } from '../src/insertion-asset-slots-v188.js';
import { APC_MISSION_TEMPLATE_IDS_V188 } from '../src/game-v52-level-runtime.js';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { EN_CATALOG_V185 } from '../src/i18n-en-catalog-v185.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const world = id => WORLDS.find(entry => entry.id === id);
function recorder() {
  const calls = { text: [], images: 0, fillRect: 0 };
  const gradient = () => ({ addColorStop() {} });
  const ctx = new Proxy({ measureText: value => ({ width: String(value).length * 9 }), createLinearGradient: gradient, createRadialGradient: gradient,
    fillText(value) { calls.text.push(String(value)); }, drawImage() { calls.images++; }, fillRect() { calls.fillRect++; } },
  { get: (object, key) => key in object ? object[key] : () => {}, set: (object, key, value) => { object[key] = value; return true; } });
  return { ctx, calls };
}
const SAMPLE = { atmosphere: world('world-01-acheron-lv-426'), airless: world('world-11-freya-s-prospect'), space: world('world-15-uscss-nostromo') };

test('place type derives for every world from its data, with the [PROPOSÉ] overrides', () => {
  const counts = { atmosphere: 0, airless: 0, space: 0 };
  for (const entry of WORLDS) {
    const place = deriveInsertionPlaceTypeV188({ world: entry });
    assert.ok(Object.hasOwn(counts, place), entry.id); counts[place] += 1;
    if (INSERTION_PLACE_OVERRIDES_V188[entry.id]) assert.equal(place, INSERTION_PLACE_OVERRIDES_V188[entry.id], entry.id);
    else if (['orbital', 'shipyard'].includes(entry.biomes[0])) assert.equal(place, 'space', entry.id);
    else assert.equal(place, entry.atmosphere === 'vacuum' ? 'airless' : 'atmosphere', entry.id);
    const profile = insertionWorldProfileV188(entry);
    assert.equal(profile.placeType, place); assert.equal(profile.name, entry.name);
    assert.match(profile.coordinates, /^\d+°\d\d′[NS] \d+°\d\d′[EW]$/); assert.match(profile.localTime, /^\d\d:\d\d$/);
    if (place !== 'atmosphere') assert.equal(profile.weather, 'none', `${entry.id}: no weather without air`);
    else assert.notEqual(profile.weather, 'none', entry.id);
  }
  assert.ok(counts.atmosphere && counts.airless && counts.space, JSON.stringify(counts));
  for (const id of Object.keys(INSERTION_PLACE_OVERRIDES_V188)) assert.ok(world(id), `${id} exists`);
  assert.equal(deriveInsertionPlaceTypeV188({ world: SAMPLE.atmosphere }), 'atmosphere');
  assert.equal(deriveInsertionPlaceTypeV188({ world: SAMPLE.airless }), 'airless');
  assert.equal(deriveInsertionPlaceTypeV188({ world: SAMPLE.space }), 'space');
  assert.equal(deriveInsertionPlaceTypeV188({ world: world('world-05-lethe') }), 'atmosphere', 'Cocyte rains in CIN-00/CIN-03');
  assert.equal(insertionWorldProfileV188(SAMPLE.atmosphere).weather, 'storm'); assert.equal(insertionWorldProfileV188(SAMPLE.atmosphere).timeOfDay, 'night');
  // A boarding operation meets a vessel in space whatever world it is filed under.
  assert.equal(deriveInsertionPlaceTypeV188({ world: SAMPLE.atmosphere, campaign: { objective: 'board a drifting vessel' } }), 'space');
  for (const campaign of CAMPAIGNS) assert.ok(['atmosphere', 'airless', 'space'].includes(deriveInsertionPlaceTypeV188({ world: world(campaign.worldId) || {}, campaign })), campaign.id);
});

test('the M577 rides under the belly only when the mission deploys it', () => {
  assert.deepEqual([...INSERTION_APC_TEMPLATE_IDS_V188], [...APC_MISSION_TEMPLATE_IDS_V188], 'mirror of the engine APC template list');
  for (const id of M577_VEHICLE_IDS_V188) assert.ok(VEHICLES.some(entry => entry.id === id), id);
  const m577 = VEHICLES.find(entry => entry.id === M577_VEHICLE_IDS_V188[0]);
  assert.equal(resolveInsertionModeV188({ vehicle: m577, templateId: 'colony-multiroute', placeType: 'atmosphere' }), 'apc');
  assert.equal(resolveInsertionModeV188({ vehicle: m577, templateId: 'planet-exterior', placeType: 'airless' }), 'apc');
  assert.equal(resolveInsertionModeV188({ vehicle: m577, templateId: 'ship-interior-vertical', placeType: 'atmosphere' }), 'foot');
  assert.equal(resolveInsertionModeV188({ vehicle: m577, templateId: 'colony-multiroute', placeType: 'space' }), 'foot');
  assert.equal(resolveInsertionModeV188({ vehicle: VEHICLES.find(entry => entry.family === 'exosuit'), templateId: 'colony-multiroute' }), 'foot');
  assert.equal(resolveInsertionModeV188({ vehicle: null }), 'foot');
  assert.equal(resolveInsertionModeV188({ vehicle: { ...m577, deploymentReady: false }, templateId: 'colony-multiroute' }), 'foot');
});

test('full sequence on the first visit (45–60 s), short afterwards (12–15 s), always full with the option', () => {
  for (const [place, entry] of Object.entries(SAMPLE)) {
    const profile = insertionWorldProfileV188(entry);
    for (const direction of ['insertion', 'extraction']) {
      const full = buildInsertionSequenceV188({ direction, profile, mode: 'apc' }), short = buildInsertionSequenceV188({ direction, profile, mode: 'apc', short: true });
      assert.ok(full.duration >= 45 && full.duration <= 60, `${place} ${direction} full ${full.duration}`);
      assert.ok(short.duration >= 12 && short.duration <= 15, `${place} ${direction} short ${short.duration}`);
      assert.equal(full.placeType, place); assert.equal(full.mode, place === 'space' ? 'foot' : 'apc');
    }
  }
  const save = createDefaultSave(), id = SAMPLE.atmosphere.id;
  assert.deepEqual(insertionSeenWorldIdsV188(save), []);
  assert.deepEqual(selectInsertionLengthV188({ worldId: id, seenWorldIds: insertionSeenWorldIdsV188(save) }), { short: false, firstVisit: true });
  assert.equal(markInsertionWorldSeenV188(save, id), true); assert.equal(markInsertionWorldSeenV188(save, id), false);
  assert.deepEqual(selectInsertionLengthV188({ worldId: id, seenWorldIds: insertionSeenWorldIdsV188(save) }), { short: true, firstVisit: false });
  assert.equal(selectInsertionLengthV188({ worldId: id, seenWorldIds: insertionSeenWorldIdsV188(save), alwaysFull: true }).short, false);
  assert.equal(selectInsertionLengthV188({ worldId: id, seenWorldIds: insertionSeenWorldIdsV188(save, 'extraction') }).short, false, 'extraction tracked apart');
  markInsertionWorldSeenV188(save, id, 'extraction'); assert.deepEqual(save.strategy.extractionSeenWorldIdsV188, [id]);
  // Additive save fields: kept by a round trip, absent in an older save, sanitised.
  const kept = migrateSave(JSON.parse(JSON.stringify(save)));
  assert.deepEqual(kept.strategy.insertionSeenWorldIdsV188, [id]); assert.deepEqual(kept.strategy.extractionSeenWorldIdsV188, [id]);
  const older = JSON.parse(JSON.stringify(createDefaultSave()));
  delete older.strategy.insertionSeenWorldIdsV188; delete older.strategy.extractionSeenWorldIdsV188; delete older.settings.insertionAlwaysFullV188;
  const migrated = migrateSave(older);
  assert.deepEqual(migrated.strategy.insertionSeenWorldIdsV188, []); assert.equal(migrated.settings.insertionAlwaysFullV188, false);
  const dirty = createDefaultSave(); dirty.strategy.insertionSeenWorldIdsV188 = [id, 42, '<b>', id]; dirty.settings.insertionAlwaysFullV188 = 'yes';
  const cleaned = migrateSave(dirty);
  assert.deepEqual(cleaned.strategy.insertionSeenWorldIdsV188, [id]); assert.equal(cleaned.settings.insertionAlwaysFullV188, false);
});

test('the screens read the flight state: altitude falls, speed and heading follow, warnings react', () => {
  for (const [place, entry] of Object.entries(SAMPLE)) {
    const sequence = buildInsertionSequenceV188({ profile: insertionWorldProfileV188(entry), mode: place === 'space' ? 'foot' : 'apc' });
    let previous = Infinity;
    for (let time = 0; time < sequence.duration; time += .5) {
      const state = insertionFlightStateV188(sequence, time), model = insertionScreenModelV188(state, sequence, 'en');
      const distance = place === 'space' ? state.range : state.altitude;
      assert.ok(distance <= previous + 1e-6, `${place} distance never rises at ${time}`); previous = distance;
      if (place === 'space') assert.equal(model.range, `RNG ${state.range >= 10000 ? `${(state.range / 1000).toFixed(1)} KM` : `${String(state.range).replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009')} M`}`);
      else assert.ok(model.altitude.startsWith('ALT '), model.altitude);
      assert.equal(model.heading, `HDG ${String(state.heading).padStart(3, '0')}`);
      assert.deepEqual(model.warnings.map(warning => warning.id), insertionWarningsV188(state, sequence).map(warning => warning.id));
      assert.equal(model.world, entry.name);
    }
    assert.ok(previous <= 50, `${place} ends near the ground or the collar (${previous})`);
    const extraction = buildInsertionSequenceV188({ direction: 'extraction', profile: sequence.profile, mode: sequence.mode });
    const start = insertionFlightStateV188(extraction, .1), end = insertionFlightStateV188(extraction, extraction.duration - .1);
    assert.ok((place === 'space' ? end.range > start.range : end.altitude > start.altitude), `${place} extraction climbs away`);
  }
  const atmosphere = buildInsertionSequenceV188({ profile: insertionWorldProfileV188(SAMPLE.atmosphere), mode: 'apc' });
  const entryShot = atmosphere.shots.find(entry => entry.kind === 'entry');
  const hot = insertionFlightStateV188(atmosphere, entryShot.start + entryShot.seconds * .5);
  assert.ok(hot.heat > .55 && hot.warnings.some(entry => entry.id === 'hull-temp' && entry.level === 'warning'));
  assert.ok(hot.turbulence > .45, 'entry shakes');
  const bay = insertionFlightStateV188(atmosphere, 1); assert.equal(bay.heat, 0); assert.ok(bay.releaseIn > 0);
  assert.match(insertionScreenModelV188(bay, atmosphere, 'fr').countdown, /^LARGAGE T−\d\d$/);
  const final = insertionFlightStateV188(atmosphere, atmosphere.duration - .2);
  assert.ok(final.gearDown && final.rampOpen && final.warnings.some(entry => entry.id === 'gear-down'));
  // The drawn screens show the same strings as the screen model.
  const cockpit = atmosphere.shots.find(entry => entry.kind === 'cockpit-descent'), time = cockpit.start + 4;
  const { ctx, calls } = recorder();
  drawInsertionFrameV188(ctx, atmosphere, time, { language: 'en' });
  const model = insertionScreenModelV188(insertionFlightStateV188(atmosphere, time), atmosphere, 'en');
  for (const text of [model.altitude, model.speed, model.heading, model.countdown, ...model.warnings.map(entry => entry.text)]) assert.ok(calls.text.some(drawn => drawn.includes(text)), text);
  assert.ok(calls.text.some(text => text.includes('ACHERON')));
});

test('colour-blind safe warnings carry a shape as well as a colour', () => {
  assert.deepEqual(Object.keys(INSERTION_LEVEL_SHAPES_V188), ['nominal', 'caution', 'warning']);
  assert.equal(new Set(Object.values(INSERTION_LEVEL_SHAPES_V188)).size, 3);
  for (const level of Object.keys(INSERTION_LEVEL_SHAPES_V188)) assert.notEqual(insertionLevelColourV188(level, false), insertionLevelColourV188(level, true));
  assert.equal(insertionLevelColourV188('warning', true), '#d55e00');
});

test('reduced motion removes the shake and softens the camera move', () => {
  const state = { turbulence: 1 };
  const normal = insertionCameraV188('entry', .7, state, { time: 3.3 }), reduced = insertionCameraV188('entry', .7, state, { reducedMotion: true, time: 3.3 });
  assert.ok(normal.magnitude > 0); assert.equal(reduced.magnitude, 0); assert.equal(reduced.shakeX, 0); assert.equal(reduced.shakeY, 0);
  assert.ok(Math.abs(reduced.zoom - 1) < Math.abs(normal.zoom - 1));
  assert.equal(insertionCameraV188('entry', .7, state, { shake: 0, time: 3.3 }).magnitude, 0, 'the screen-shake setting at 0 also stops it');
  const source = read('src/insertion-cinematic-v188.js');
  assert.match(source, /storm' && !reducedMotion/, 'lightning flash is gated by reduced motion');
});

test('every visual goes through a named art slot; a missing image falls back to primitives', () => {
  assert.equal(new Set(INSERTION_ASSET_SLOT_IDS_V188).size, INSERTION_ASSET_SLOTS_V188.length);
  for (const entry of INSERTION_ASSET_SLOTS_V188) {
    assert.ok(INSERTION_ASSET_LAYERS_V188.includes(entry.layer), entry.id);
    assert.ok(entry.width > 0 && entry.height > 0 && entry.purpose.length > 20 && entry.brief.length > 40, entry.id);
    assert.equal(entry.path, `/assets/insertion/v188/${entry.id}.png`);
    assert.ok(!/1:1|certif(ied|ié)/i.test(entry.brief.replace(/would not certify/g, '')), `${entry.id}: no fidelity claim`);
  }
  for (const id of INSERTION_ASSET_FILES_PRESENT_V188) assert.ok(existsSync(new URL(`..${getInsertionAssetSlotV188(id).path}`, import.meta.url)), `${id} file committed`);
  // No committed file: nothing is requested, every draw uses the primitive fallback.
  class FakeImage { constructor() { this.complete = true; this.naturalWidth = 64; } }
  const empty = new InsertionAssetLoaderV188({ ImageCtor: FakeImage, present: [] });
  assert.deepEqual(empty.preload(), []);
  for (const [place, entry] of Object.entries(SAMPLE)) for (const direction of ['insertion', 'extraction']) {
    const sequence = buildInsertionSequenceV188({ direction, profile: insertionWorldProfileV188(entry), mode: place === 'space' ? 'foot' : 'apc' });
    for (const shot of sequence.shots) { const { ctx, calls } = recorder(); drawInsertionFrameV188(ctx, sequence, shot.start + shot.seconds / 2, { assets: empty }); assert.equal(calls.images, 0); }
  }
  assert.ok(Object.values(empty.usage).every(source => source === 'primitive'));
  assert.ok(Object.keys(empty.usage).length >= 15, `slots exercised: ${Object.keys(empty.usage).length}`);
  for (const id of Object.keys(empty.usage)) assert.ok(INSERTION_ASSET_SLOT_IDS_V188.includes(id));
  // A committed file is requested at its slot path and drawn instead of the primitive.
  const present = new InsertionAssetLoaderV188({ ImageCtor: FakeImage, present: ['ud4l-side'] });
  assert.deepEqual(present.preload(), ['/assets/insertion/v188/ud4l-side.png']);
  const { ctx, calls } = recorder(); let fallback = 0;
  assert.equal(present.draw(ctx, 'ud4l-side', 0, 0, 10, 10, () => fallback++), 'image'); assert.equal(calls.images, 1); assert.equal(fallback, 0);
  assert.equal(present.draw(ctx, 'm577-side', 0, 0, 10, 10, () => fallback++), 'primitive'); assert.equal(fallback, 1);
  assert.throws(() => present.draw(ctx, 'not-a-slot', 0, 0, 1, 1), /Unknown insertion art slot/);
  const doc = read('docs/development/INSERTION_ART_SLOTS_V188.md');
  for (const id of INSERTION_ASSET_SLOT_IDS_V188) assert.ok(doc.includes(`\`${id}\``), `${id} documented`);
});

function fakeDocument() {
  const listeners = new Map(), body = { children: [], append(node) { this.children.push(node); node.parent = this; } };
  const element = tag => ({ tag, children: [], dataset: {}, attributes: {}, className: '', parent: null,
    setAttribute(key, value) { this.attributes[key] = value; }, append(...nodes) { this.children.push(...nodes); },
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(node => node !== this); this.parent = null; },
    getContext: () => recorder().ctx });
  return { body, createElement: element, listeners,
    addEventListener(type, fn) { listeners.set(type, fn); }, removeEventListener(type) { listeners.delete(type); },
    key(code) { let prevented = false; listeners.get('keydown')?.({ code, preventDefault() { prevented = true; }, stopImmediatePropagation() {} }); return prevented; } };
}
test('skip with Escape, Enter or the 44 px touch button; Space goes to the next shot; frame stats are kept', async () => {
  const sequence = buildInsertionSequenceV188({ profile: insertionWorldProfileV188(SAMPLE.atmosphere), mode: 'foot', short: true });
  for (const how of ['Escape', 'Enter', 'button']) {
    const document = fakeDocument(); let clock = 0; const frames = [], cues = [];
    const player = new InsertionCinematicPlayerV188({ document, now: () => clock, requestFrame: fn => frames.push(fn), ImageCtor: null });
    const done = player.play(sequence, { language: 'en', onCue: id => cues.push(id) });
    const overlay = document.body.children[0];
    assert.equal(overlay.dataset.length, 'short'); assert.equal(overlay.dataset.placeType, 'atmosphere');
    const skip = overlay.children[1]; assert.equal(skip.textContent, 'SKIP (ESC)'); assert.match(skip.className, /insertion-skip-v188/);
    clock = 16; frames.shift()();
    if (how === 'button') skip.onclick(); else assert.equal(document.key(how), true);
    assert.equal(await done, 'skipped'); assert.equal(document.body.children.length, 0, 'overlay removed'); assert.equal(document.listeners.size, 0);
    assert.ok(cues.includes('insertion-start') && cues.includes('insertion-skip'));
    assert.ok(player.lastStats.frames >= 2);
  }
  const document = fakeDocument(); let clock = 0; const frames = [];
  const player = new InsertionCinematicPlayerV188({ document, now: () => clock, requestFrame: fn => frames.push(fn), ImageCtor: null });
  const done = player.play(sequence, { language: 'fr' });
  assert.equal(document.body.children[0].children[1].textContent, 'PASSER (ÉCHAP)');
  document.key('Space'); clock = 1; frames.shift()();
  assert.ok(insertionShotAtV188(sequence, 0 + sequence.shots[0].seconds + .001).index >= 1);
  while (frames.length) { clock += 1000; frames.shift()(); }
  assert.equal(await done, 'complete');
  assert.ok(read('styles.css').includes('.insertion-cinematic-v188 .insertion-skip-v188 { min-height: 44px; min-width: 44px;'));
});

test('subtitles are always drawn and every line exists in French and English', () => {
  for (const [place, entry] of Object.entries(SAMPLE)) for (const direction of ['insertion', 'extraction']) for (const short of [false, true]) for (const mode of ['foot', 'apc']) {
    const sequence = buildInsertionSequenceV188({ direction, profile: insertionWorldProfileV188(entry), mode, short });
    for (const shot of sequence.shots) {
      assert.ok(shot.caption === null || (shot.caption.fr && shot.caption.en), `${place} ${shot.kind} caption`);
      if (!shot.line) continue;
      assert.ok(shot.line.text.fr && shot.line.text.en && shot.line.speaker.fr && shot.line.speaker.en, `${place} ${shot.lineId}`);
      assert.notEqual(shot.line.text.fr, shot.line.text.en);
      for (const [language, reducedMotion] of [['fr', false], ['en', true]]) {
        const { ctx, calls } = recorder(); drawInsertionFrameV188(ctx, sequence, shot.start + shot.seconds * .6, { language, reducedMotion });
        assert.ok(calls.text.some(text => shot.line.text[language].startsWith(text)), `${place} ${direction} ${shot.kind} ${language} subtitle drawn`);
      }
    }
  }
  assert.ok(INSERTION_LINE_IDS_V188.length >= 15); assert.ok(INSERTION_SHOT_KINDS_V188.length >= 20);
});

test('i18n: the new settings label is in the reviewed English catalog; the module carries both languages', () => {
  const label = 'Insertions : toujours la version complète';
  assert.ok(read('index.html').includes(`<input id="setting-insertion-full-v188" type="checkbox"> ${label}</label>`));
  assert.equal(EN_CATALOG_V185[label], 'Insertions: always the full version');
  const catalog = read('src/i18n-en-catalog-v185.js');
  assert.ok(catalog.includes('// V188 insertion / extraction cinematics'), 'appended as a commented block');
});

test('app wiring: insertionHandoverV188 reaches engine.start; the extraction waits for the boarding event, else nothing changes', () => {
  const app = read('src/app.js');
  assert.match(app, /engine\.start\(\{[\s\S]*?\n {4}insertionHandoverV188,\n[\s\S]*?\}\);/, 'additive option passed to engine.start');
  assert.match(app, /function startMissionRuntimeNowV62\(context, insertionHandoverV188 = null\)/);
  assert.match(app, /if \(!context\?\.world \|\| context\.operationLoadout\?\.resumeState \|\| standaloneContext\) return null;/, 'resume and Forge play no cinematic');
  assert.match(app, /extractionFlowOnEventV188\(extractionFlowV188, event\)/);
  assert.match(app, /'setting-insertion-full-v188': \['insertionAlwaysFullV188'/);
  for (const engineFile of ['src/game-v51-runtime.js', 'src/game-v52-level-runtime.js', 'src/game-production-runtime.js']) assert.ok(!read(engineFile).includes('insertion-cinematic-v188'), engineFile);
  const handover = buildInsertionHandoverV188({ world: SAMPLE.atmosphere, campaign: CAMPAIGNS.find(entry => entry.id === 'pair-001-frontier'),
    templateId: 'colony-multiroute', vehicle: VEHICLES.find(entry => entry.id === M577_VEHICLE_IDS_V188[0]), short: true });
  assert.deepEqual(handover, { mode: 'apc', placeType: 'atmosphere', dropshipId: 'ud4l', short: true });
  assert.deepEqual(buildInsertionHandoverV188({ world: SAMPLE.space, templateId: 'ship-interior-vertical', vehicle: VEHICLES[0] }),
    { mode: 'foot', placeType: 'space', dropshipId: 'ud4l', short: false });
  // Extraction state machine.
  const flow = createExtractionFlowV188();
  assert.deepEqual(extractionFlowOnEventV188(flow, { type: 'mission-complete' }), { action: 'debrief-now' }, 'no boarding event: unchanged flow');
  assert.equal(readBoardingEventV188({ type: 'kill' }), null);
  const boarded = extractionFlowOnEventV188(flow, { type: INSERTION_BOARDING_EVENT_V188, mode: 'apc', placeType: 'airless' });
  assert.deepEqual(boarded, { action: 'play-extraction', boarding: { mode: 'apc', placeType: 'airless' } });
  flow.played = true;
  assert.equal(extractionFlowOnEventV188(flow, { type: INSERTION_BOARDING_EVENT_V188, mode: 'x' }).action, 'none', 'played once');
  assert.deepEqual(extractionFlowOnEventV188(flow, { type: 'mission-complete' }), { action: 'debrief-after-cinematic' });
  assert.deepEqual(readBoardingEventV188({ type: INSERTION_BOARDING_EVENT_V188, mode: 'tank', placeType: 'moon' }), { mode: 'foot', placeType: null });
});

test('the new modules are cached by the service worker and admitted as source-only docs/specs', () => {
  const sw = read('sw.js');
  for (const path of ['/src/insertion-cinematic-v188.js', '/src/insertion-asset-slots-v188.js']) assert.ok(sw.includes(`'${path}'`), path);
  const release = read('scripts/verify-public-release-v86.mjs');
  for (const path of ['docs/development/INSERTION_ART_SLOTS_V188.md', 'scripts/verify-insertion-cinematic-v188.mjs',
    'specs/003-insertion-extraction-cinematiques/spec.md', 'specs/003-insertion-extraction-cinematiques/plan.md', 'specs/003-insertion-extraction-cinematiques/tasks.md'])
    assert.ok(release.includes(`'${path}'`), path);
  assert.ok(JSON.parse(read('package.json')).scripts['test:priorities:v188'].includes('scripts/verify-insertion-cinematic-v188.mjs'));
  const bible = read('docs/narrative/CAMPAGNE_PRINCIPALE.md');
  assert.match(bible, /Insertion et extraction : tableau de fidélité/);
  assert.ok(!/\b1:1\b(?! n’est pas)/.test(bible.slice(bible.indexOf('Insertion et extraction : tableau de fidélité'))
    .split('\n').slice(0, 40).join('\n').replace(/ne revendique pas de fidélité « 1:1 »/g, '')), 'no 1:1 claim in the table');
});
