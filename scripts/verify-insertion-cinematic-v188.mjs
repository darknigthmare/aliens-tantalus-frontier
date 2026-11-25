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
  InsertionAssetLoaderV188, getInsertionAssetSlotV188, insertionTargetArtV188, INSERTION_TARGET_SHIPS_BY_WORLD_V188,
  INSERTION_ORIGINAL_TARGET_WORLD_IDS_V188, INSERTION_ASSET_REUSED_V188 } from '../src/insertion-asset-slots-v188.js';
import { APC_MISSION_TEMPLATE_IDS_V188 } from '../src/game-v52-level-runtime.js';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { EN_CATALOG_V185 } from '../src/i18n-en-catalog-v185.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const world = id => WORLDS.find(entry => entry.id === id);
function recorder() {
  const calls = { text: [], images: 0, imageDraws: [], fillRect: 0, fills: [], clips: [], events: [], radialGradients: [] }, stack = [];
  const gradient = () => ({ addColorStop() {} });
  const stateKeys = ['globalAlpha', 'globalCompositeOperation', 'fillStyle', 'strokeStyle', 'lineWidth', 'font', 'textAlign', 'textBaseline'];
  let path = [], outline = [], clips = [], clipPaths = [];
  const state = { globalAlpha: 1, globalCompositeOperation: 'source-over',
    measureText: value => ({ width: String(value).length * 9 }), createLinearGradient: gradient,
    createRadialGradient(...args) { calls.radialGradients.push(args); return gradient(); },
    save() { stack.push({ values: Object.fromEntries(stateKeys.map(key => [key, state[key]])), clips: [...clips], clipPaths: [...clipPaths] }); },
    restore() { const saved = stack.pop(); assert.ok(saved, 'balanced canvas restore'); Object.assign(state, saved.values); clips = saved.clips; clipPaths = saved.clipPaths; },
    beginPath() { path = []; outline = []; }, rect(...box) { path.push(box); outline.push(['rect', ...box]); },
    moveTo(...point) { outline.push(['moveTo', ...point]); }, lineTo(...point) { outline.push(['lineTo', ...point]); }, closePath() { outline.push(['closePath']); },
    clip(rule = 'nonzero') { clips.push(...path); calls.clips.push(...path); clipPaths.push({ rule, commands: [...outline] }); },
    fillText(value) { calls.text.push(String(value)); calls.events.push({ type: 'text', text: String(value) }); },
    drawImage(image, ...box) { const draw = { type: 'image', image, box, alpha: state.globalAlpha, composite: state.globalCompositeOperation, clips: [...clips], clipPaths: [...clipPaths] }; calls.images++; calls.imageDraws.push(draw); calls.events.push(draw); },
    fillRect(...box) { const fill = { type: 'fill', box, alpha: state.globalAlpha, composite: state.globalCompositeOperation, colour: state.fillStyle }; calls.fillRect++; calls.fills.push(fill); calls.events.push(fill); }
  };
  const ctx = new Proxy(state, { get: (object, key) => key in object ? object[key] : () => {}, set: (object, key, value) => { object[key] = value; return true; } });
  return { ctx, calls, stack };
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
    assert.match(profile.coordinates, /^\d+°\d\d′[NS] \d+°\d\d′[EW]$/); assert.match(profile.localTime, /^[0-9]{2}:[0-9]{2}$/);
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
  assert.deepEqual(Object.keys(INSERTION_ASSET_REUSED_V188).sort(), ['comms-pilot', 'ud4l-front'], 'only the two reviewed references override a slot path');
  for (const entry of INSERTION_ASSET_SLOTS_V188) {
    assert.ok(INSERTION_ASSET_LAYERS_V188.includes(entry.layer), entry.id);
    assert.ok(entry.width > 0 && entry.height > 0 && entry.purpose.length > 20 && entry.brief.length > 40, entry.id);
    assert.equal(entry.path, INSERTION_ASSET_REUSED_V188[entry.id]?.path || `/assets/insertion/v188/${entry.id}.png`);
    assert.ok(!/1:1|certif(ied|ié)/i.test(entry.brief.replace(/would not certify/g, '')), `${entry.id}: no fidelity claim`);
  }
  const sw = read('sw.js');
  for (const id of INSERTION_ASSET_FILES_PRESENT_V188) {
    const path = getInsertionAssetSlotV188(id).path, file = new URL(`..${path}`, import.meta.url);
    assert.ok(existsSync(file), `${id} file committed`);
    const bytes = readFileSync(file);
    assert.ok(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${id}: actual PNG`);
    assert.ok(bytes.readUInt32BE(16) > 0 && bytes.readUInt32BE(20) > 0, `${id}: nonempty bitmap`);
    assert.ok(sw.includes(`'${path}'`), `${id}: available offline`);
  }
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

// These tests exercise loaded images in complete frames. Image decoding itself is
// covered by the separate native Canvas pixel inspection; this fixture records the
// destination geometry, compositing state and clipping sent to Canvas.
class RasterImageFixture {
  constructor() { this.complete = true; }
  set src(path) {
    this.path = path;
    const entry = INSERTION_ASSET_SLOTS_V188.find(slot => slot.path === path);
    const reused = INSERTION_ASSET_REUSED_V188[entry?.id];
    this.naturalWidth = reused?.width || entry?.width || 1507; this.naturalHeight = reused?.height || entry?.height || 1044;
  }
  get src() { return this.path; }
}
function rasterAssets(ids, createCanvas = () => null) {
  const assets = new InsertionAssetLoaderV188({ ImageCtor: RasterImageFixture, present: ids, createCanvas });
  assets.preload(); return assets;
}
function slotDraws(calls, id) { return calls.imageDraws.filter(draw => draw.image.src === getInsertionAssetSlotV188(id)?.path); }

test('loaded planet discs keep orbital position and radius instead of covering the full frame', () => {
  for (const [place, id] of [['atmosphere', 'planet-limb'], ['airless', 'moon-limb']]) {
    const assets = rasterAssets([id]), sequence = buildInsertionSequenceV188({ profile: insertionWorldProfileV188(SAMPLE[place]) });
    const release = sequence.shots.find(shot => shot.kind === 'release');
    const first = recorder(); drawInsertionFrameV188(first.ctx, sequence, release.start + release.seconds / 2, { assets });
    assert.deepEqual(slotDraws(first.calls, id).map(draw => draw.box), [[-460, 600, 2200, 2200]], `${place}: release horizon follows r=1100, cy=1700`);
    const orbit = sequence.shots.find(shot => shot.kind === 'orbit');
    const second = recorder(); drawInsertionFrameV188(second.ctx, sequence, orbit.start + orbit.seconds / 2, { assets });
    assert.deepEqual(slotDraws(second.calls, id).map(draw => draw.box), [[-220, 490, 1720, 1720]], `${place}: orbital radius changes with flight progress`);
    assert.equal(first.stack.length + second.stack.length, 0, 'frame leaves no saved canvas state');
  }
});

test('loaded cloud and terrain layers retain alpha, aspect ratio and different parallax speeds', () => {
  const assets = rasterAssets(['cloud-far', 'terrain-far']), sequence = buildInsertionSequenceV188({ profile: insertionWorldProfileV188(SAMPLE.atmosphere) });
  const approach = sequence.shots.find(shot => shot.kind === 'approach'), start = approach.start + 1;
  const frames = [start, start + .1].map(time => { const frame = recorder(); drawInsertionFrameV188(frame.ctx, sequence, time, { assets }); return frame; });
  const clouds = frames.map(frame => slotDraws(frame.calls, 'cloud-far')), terrain = frames.map(frame => slotDraws(frame.calls, 'terrain-far'));
  for (const draws of clouds) {
    assert.ok(draws.length >= 2, 'cloud strip repeats to cover the screen');
    assert.ok(draws.every(draw => draw.alpha === .55), 'raster respects the cloud opacity');
    assert.ok(draws.every(draw => draw.box[2] / draw.box[3] === 4), 'native cloud ratio');
    assert.ok(draws[0].clips.some(box => box.join(',') === '0,50,1280,200'), 'repeating strip is clipped');
    assert.ok(draws[0].box[0] <= 0 && draws.at(-1).box[0] + draws.at(-1).box[2] >= 1280, 'no gap across the viewport');
  }
  assert.ok(Math.abs((clouds[0][0].box[0] - clouds[1][0].box[0]) - 6) < 1e-8, 'far cloud moves 60 px/s');
  assert.ok(Math.abs((terrain[0][0].box[0] - terrain[1][0].box[0]) - 3) < 1e-8, 'far terrain moves 30 px/s');
  assert.ok(terrain.flat().every(draw => draw.alpha === 1 && Math.abs(draw.box[2] / draw.box[3] - 5.12) < 1e-8));
  // Real Canvas can cache a blended cloud period and paint it without separate
  // drawImage edges. This guards the visible fractional-boundary seam regression.
  const surfaces = [], createCanvas = (width, height) => { const surface = { ...recorder(), width, height }; surface.getContext = () => surface.ctx; surfaces.push(surface); return surface; };
  const blended = rasterAssets(['cloud-far'], createCanvas), destination = recorder();
  destination.ctx.createPattern = (image, repeat) => ({ image, repeat }); destination.ctx.globalAlpha = .8;
  for (const scroll of [17.25, 20.25]) blended.draw(destination.ctx, 'cloud-far', 0, 50, 800, 200, null, { alpha: .55, scroll, repeatWidth: 1280, seamlessRepeat: true });
  assert.equal(surfaces.length, 2, 'one fade surface and one retained period, reused across frames');
  assert.equal(surfaces[0].calls.fills[0].composite, 'destination-in', 'edge fades preserve source colour');
  assert.ok(surfaces[1].width < blended.image('cloud-far').naturalWidth, 'neighbouring strips overlap');
  assert.deepEqual(surfaces[1].calls.imageDraws.map(draw => draw.composite), ['lighter', 'lighter'], 'complementary alpha is added instead of darkened');
  const bands = destination.calls.fills; assert.equal(bands.length, 2); assert.equal(destination.calls.images, 0, 'one continuous pattern fill per frame, no individual tile cracks');
  assert.ok(bands.every(fill => fill.colour.image === surfaces[1] && fill.colour.repeat === 'repeat-x' && Math.abs(fill.alpha - .44) < 1e-8));
  assert.ok(Math.abs((bands[1].box[0] - bands[0].box[0]) * 800 / 2048 - 3) < 1e-8, 'blending preserves world-space scroll speed');
  assert.equal(destination.ctx.globalAlpha, .8); assert.equal(destination.ctx.globalCompositeOperation, 'source-over'); assert.equal(destination.stack.length, 0);
  const previousPeriod = blended.repeating.get('cloud-far').canvas;
  blended.draw(destination.ctx, 'cloud-far', 0, 50, 800, 200, null, { tint: '#7788aa', repeatWidth: 1280, seamlessRepeat: true });
  assert.notEqual(blended.repeating.get('cloud-far').canvas, previousPeriod); assert.equal(blended.repeating.size, 1, 'a new world tint replaces the cached period');
});

test('bay art leaves the live aperture active for planets, moons and open space', () => {
  for (const [place, id] of [['atmosphere', 'planet-limb'], ['airless', 'moon-limb'], ['space', null]]) {
    const assets = rasterAssets(['tantalus-drop-bay', ...(id ? [id] : [])]);
    const sequence = buildInsertionSequenceV188({ profile: insertionWorldProfileV188(SAMPLE[place]) }), frame = recorder();
    drawInsertionFrameV188(frame.ctx, sequence, 1, { assets });
    assert.equal(slotDraws(frame.calls, 'tantalus-drop-bay').length, 1, 'bay raster is used');
    assert.ok(frame.calls.clips.some(box => box.join(',') === '160,520,960,200'), 'live view is clipped inside the physical aperture');
    if (id) {
      const body = slotDraws(frame.calls, id)[0];
      assert.deepEqual(body.box, [-260, 600, 1800, 1800]);
      assert.ok(body.clips.some(box => box.join(',') === '160,520,960,200'));
      assert.ok(frame.calls.imageDraws.indexOf(body) > frame.calls.imageDraws.findIndex(draw => draw.image.src.endsWith('/tantalus-drop-bay.png')), 'planet view is drawn after the bay raster');
    }
  }
});

test('named franchise ships reuse their own art and original vessel art is restricted to original locations', () => {
  const assets = rasterAssets(['target-vessel']), sw = read('sw.js');
  for (const [worldId, shipId] of Object.entries(INSERTION_TARGET_SHIPS_BY_WORLD_V188)) {
    const target = insertionTargetArtV188(worldId);
    assert.equal(target.kind, 'reference'); assert.ok(target.path.endsWith(`/${shipId}-reference-v87.png`));
    assert.ok(existsSync(new URL(`..${target.path}`, import.meta.url))); assert.ok(sw.includes(`'${target.path}'`));
    assets.preloadWorld(worldId);
    const sequence = buildInsertionSequenceV188({ profile: insertionWorldProfileV188(world(worldId)) });
    const shot = sequence.shots.find(shot => shot.kind === 'transit'), frame = recorder();
    drawInsertionFrameV188(frame.ctx, sequence, shot.start + shot.seconds / 2, { assets });
    assert.ok(frame.calls.imageDraws.some(draw => draw.image.src === target.path), `${worldId}: own ship is drawn`);
    assert.ok(!slotDraws(frame.calls, 'target-vessel').length, 'generic station does not replace a named ship');
  }
  assert.equal(assets.worldImages.size, 3, 'Nostromo and its depths share one loaded bitmap');
  for (const id of INSERTION_ORIGINAL_TARGET_WORLD_IDS_V188) {
    assert.ok(world(id)); assert.equal(insertionTargetArtV188(id).kind, 'original');
    assert.equal(assets.image('target-vessel', id), assets.image('target-vessel'));
  }
  for (const id of ['world-04-sevastopol', 'world-07-katanga', 'world-13-renaissance-station', 'world-17-gateway-station', 'world-39-katanga-depths', 'unknown-world']) {
    assert.equal(insertionTargetArtV188(id).kind, 'placeholder'); assert.equal(assets.image('target-vessel', id), null, `${id}: no invented attribution`);
  }
});

test('ship raster fitting preserves its ratio and the centre anchor across native resolutions', () => {
  const assets = rasterAssets(['tantalus-hull-exterior']), image = assets.image('tantalus-hull-exterior');
  for (const [nativeWidth, nativeHeight] of [[2172, 724], [800, 200], [400, 400]]) {
    image.naturalWidth = nativeWidth; image.naturalHeight = nativeHeight;
    const frame = recorder(); assets.draw(frame.ctx, 'tantalus-hull-exterior', -800, -250, 1600, 500, null, { fit: 'contain' });
    const [x, y, width, height] = frame.calls.imageDraws[0].box;
    assert.equal(width / height, nativeWidth / nativeHeight, 'no silhouette stretching');
    assert.equal(x + width / 2, 0); assert.equal(y + height / 2, 0, 'same local ship anchor');
    assert.ok(width <= 1600 && height <= 500, 'contained within the camera envelope');
  }
});

test('tint cache preserves source alpha, refreshes per world and does not alter the destination context', () => {
  const surfaces = [], createCanvas = (width, height) => {
    const surface = { ...recorder(), width, height }; surface.getContext = () => surface.ctx; surfaces.push(surface); return surface;
  };
  const assets = rasterAssets(['cloud-far'], createCanvas), destination = recorder();
  destination.ctx.globalAlpha = .4; destination.ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 2; i++) assets.draw(destination.ctx, 'cloud-far', 0, 0, 200, 50, null, { tint: '#7788aa', alpha: .5 });
  assert.equal(surfaces.length, 1, 'same image and tint reuse one raster');
  assert.deepEqual(surfaces[0].calls.imageDraws.map(draw => draw.composite), ['source-over', 'destination-in'], 'source mask restores semi-transparent edges after colour blending');
  assert.equal(surfaces[0].calls.fills[0].composite, 'color');
  assert.equal(destination.ctx.globalAlpha, .4); assert.equal(destination.ctx.globalCompositeOperation, 'lighter');
  assert.ok(destination.calls.imageDraws.every(draw => draw.alpha === .2));
  assets.draw(destination.ctx, 'cloud-far', 0, 0, 200, 50, null, { tint: '#aa8866' });
  assert.equal(surfaces.length, 2); assert.equal(assets.tinted.size, 1, 'old world tint is replaced, not accumulated');
  destination.ctx.drawImage = () => { throw new Error('draw failed'); };
  assert.throws(() => assets.draw(destination.ctx, 'cloud-far', 0, 0, 200, 50, null, { alpha: .1 }), /draw failed/);
  assert.equal(destination.ctx.globalAlpha, .4); assert.equal(destination.ctx.globalCompositeOperation, 'lighter'); assert.equal(destination.stack.length, 0);
});

test('loaded stars drift and fade above the sky while entry plasma follows heat with additive light', () => {
  const assets = rasterAssets(['starfield-deep', 'entry-plasma', 'ud4l-front']);
  const sequence = buildInsertionSequenceV188({ profile: insertionWorldProfileV188(SAMPLE.atmosphere) });
  const shot = sequence.shots.find(entry => entry.kind === 'entry');
  const frames = [.2, .5].map(progress => {
    const frame = recorder(), time = shot.start + shot.seconds * progress;
    frame.result = drawInsertionFrameV188(frame.ctx, sequence, time, { assets, reducedMotion: true }); return frame;
  });
  const starDraws = frames.map(frame => slotDraws(frame.calls, 'starfield-deep'));
  assert.ok(starDraws.flat().every(draw => draw.composite === 'screen' && draw.alpha > 0 && draw.alpha < 1), 'black star pixels cannot erase the atmospheric sky');
  assert.ok(starDraws[1][0].alpha < starDraws[0][0].alpha, 'stars disappear into the atmosphere');
  assert.notEqual(starDraws[0][0].box[0], starDraws[1][0].box[0], 'loaded star layer scrolls');
  for (const draws of starDraws) assert.ok(draws[0].box[0] <= 0 && draws.at(-1).box[0] + draws.at(-1).box[2] >= 1280, 'star tiles cover the view');
  const plasmaDraws = frames.map(frame => slotDraws(frame.calls, 'entry-plasma')[0]);
  assert.ok(plasmaDraws[1].alpha > plasmaDraws[0].alpha, 'hotter hull produces brighter plasma');
  frames.forEach((frame, i) => {
    const draw = plasmaDraws[i]; assert.equal(draw.composite, 'lighter'); assert.equal(draw.alpha, frame.result.state.heat);
    assert.equal(draw.box[0] + draw.box[2] / 2, 640); assert.equal(draw.box[1] + draw.box[3] / 2, 330, 'plasma is centred on the entering ship');
    assert.ok(slotDraws(frame.calls, 'ud4l-front').every(draw => draw.composite === 'source-over' && draw.alpha === 1), 'glow does not leak into the airframe');
    assert.equal(frame.ctx.globalAlpha, 1); assert.equal(frame.ctx.globalCompositeOperation, 'source-over'); assert.equal(frame.stack.length, 0);
  });
});

test('loaded vehicles retain native proportions and live actuators; close interior crews fit the seats', () => {
  const ids = ['ud4l-side', 'm577-side', 'moon-limb', 'ud4l-front', 'ud4l-troop-bay', 'marine-seated'], assets = rasterAssets(ids);
  for (const [id, w, h] of [['ud4l-side', 2172, 724], ['m577-side', 1942, 809], ['ud4l-front', 1490, 1055], ['marine-seated', 1024, 1536]]) {
    Object.assign(assets.image(id), { naturalWidth: w, naturalHeight: h });
  }
  const sequence = buildInsertionSequenceV188({ profile: insertionWorldProfileV188(SAMPLE.airless), mode: 'apc' });
  const render = (kind, progress) => { const shot = sequence.shots.find(entry => entry.kind === kind), frame = recorder(); drawInsertionFrameV188(frame.ctx, sequence, shot.start + shot.seconds * progress, { assets, reducedMotion: true }); return frame; };
  const orbit = render('orbit', .5), contact = render('approach', .995);
  assert.ok(orbit.calls.radialGradients.some(args => args[5] > 0), 'loaded dropship still has powered exhaust');
  const gear = frame => frame.calls.fills.filter(fill => fill.colour === '#121411' && fill.box[2] === 6 && fill.box[3] === 32);
  assert.equal(gear(orbit).length, 0); assert.equal(gear(contact).length, 2, 'landing struts deploy with flight state');
  assert.ok(contact.calls.fills.some(fill => fill.box[2] === 90 && fill.box[3] === 8), 'open ramp is drawn with the raster');
  for (const frame of [orbit, contact]) for (const id of ['ud4l-side', 'm577-side']) for (const draw of slotDraws(frame.calls, id)) {
    const image = assets.image(id), box = draw.box.slice(-4);
    assert.ok(Math.abs(box[2] / box[3] - image.naturalWidth / image.naturalHeight) < 1e-8, `${id}: contain preserves silhouette`);
  }
  const atmosphere = buildInsertionSequenceV188({ profile: insertionWorldProfileV188(SAMPLE.atmosphere) }), entry = atmosphere.shots.find(shot => shot.kind === 'entry'), front = recorder();
  drawInsertionFrameV188(front.ctx, atmosphere, entry.start + entry.seconds / 2, { assets });
  const frontBox = slotDraws(front.calls, 'ud4l-front')[0].box;
  assert.ok(Math.abs(frontBox[2] / frontBox[3] - 1490 / 1055) < 1e-8);
  for (const [mode, count] of [['apc', 4], ['foot', 6]]) {
    const sequence = buildInsertionSequenceV188({ profile: insertionWorldProfileV188(SAMPLE.airless), mode }), shot = sequence.shots.find(entry => entry.kind === 'troop-bay'), frame = recorder();
    drawInsertionFrameV188(frame.ctx, sequence, shot.start + shot.seconds / 2, { assets, reducedMotion: true });
    const crew = slotDraws(frame.calls, 'marine-seated'); assert.equal(crew.length, count);
    assert.ok(crew.every(draw => draw.box[3] > 200 && draw.box[2] / draw.box[3] === 2 / 3), 'close camera keeps the full seated silhouette in proportion');
    assert.ok(crew.every(draw => draw.box[0] >= 0 && draw.box[0] + draw.box[2] <= 1280 && draw.box[1] + draw.box[3] < 560), 'crew stays above the belly bay');
    assert.ok(frame.calls.text.includes('STATUS'), 'interior status remains live'); assert.equal(frame.stack.length, 0);
  }
});

test('cockpit art keeps a protected canopy and is cached around live CRT rectangles', () => {
  const surfaces = [], createCanvas = (width, height) => { const surface = { ...recorder(), width, height }; surface.getContext = () => surface.ctx; surfaces.push(surface); return surface; };
  const assets = rasterAssets(['ud4l-cockpit', 'crt-bezel'], createCanvas);
  const sequence = buildInsertionSequenceV188({ profile: insertionWorldProfileV188(SAMPLE.atmosphere) }), shot = sequence.shots.find(entry => entry.kind === 'cockpit-descent');
  const frames = [1, 2].map(local => { const frame = recorder(); drawInsertionFrameV188(frame.ctx, sequence, shot.start + local, { assets }); return frame; });
  assert.equal(surfaces.length, 1, 'authored frame projection is prepared once for this image');
  assert.ok(slotDraws(surfaces[0].calls, 'ud4l-cockpit').length > 1, 'measured openings are projected into the live layout');
  for (const frame of frames) {
    const projected = frame.calls.imageDraws.find(draw => draw.image === surfaces[0]); assert.ok(projected);
    const mask = projected.clipPaths.find(clip => clip.rule === 'evenodd'); assert.ok(mask, 'opaque exported pixels cannot overwrite the live canopy');
    assert.ok(mask.commands.some(command => command[0] === 'moveTo') && mask.commands.filter(command => command[0] === 'rect').length === 2, 'mask retains the centre strut inside the opening');
    const bezels = slotDraws(frame.calls, 'crt-bezel'); assert.equal(bezels.length, 5);
    for (const bezel of bezels) {
      const index = frame.calls.events.indexOf(bezel), [x, y, width, height] = bezel.box;
      const screen = frame.calls.events[index + 1];
      assert.equal(screen.type, 'fill'); assert.deepEqual(screen.box, [x + 8, y + 8, width - 16, height - 16], 'screen is cleared after its bezel');
    }
    for (const title of ['NAV', 'TERRAIN', 'TELEMETRY', 'SYSTEMS', 'COMMS']) assert.ok(frame.calls.text.includes(title), title);
    assert.equal(frame.stack.length, 0);
  }
});

test('the radio uses the reviewed Orlov atlas crop only while Orlov is speaking', () => {
  const reference = INSERTION_ASSET_REUSED_V188['comms-pilot'];
  assert.equal(reference.crewId, 'crew-08-maksim-orlov'); assert.deepEqual(reference.rect, [95, 9, 80, 82]);
  const assets = rasterAssets(['comms-pilot']), sequence = buildInsertionSequenceV188({ profile: insertionWorldProfileV188(SAMPLE.atmosphere) });
  const cockpit = sequence.shots.find(shot => shot.kind === 'cockpit-release'), time = cockpit.start + cockpit.seconds / 2;
  const pilot = recorder(); drawInsertionFrameV188(pilot.ctx, sequence, time, { assets });
  const portrait = slotDraws(pilot.calls, 'comms-pilot'); assert.equal(portrait.length, 1);
  assert.deepEqual(portrait[0].box.slice(0, 4), reference.rect, 'one face crop, never the complete locomotion atlas');
  const [, , width, height] = portrait[0].box.slice(-4); assert.ok(Math.abs(width / height - 80 / 82) < 1e-8); assert.ok(width <= 56 + 1e-8 && height <= 56 + 1e-8);
  for (const line of [null, sequence.shots.find(shot => shot.kind === 'bay').line, sequence.shots.find(shot => shot.kind === 'troop-bay').line]) {
    const variant = { ...sequence, shots: sequence.shots.map(shot => shot === cockpit ? { ...shot, line } : shot) }, frame = recorder();
    drawInsertionFrameV188(frame.ctx, variant, time, { assets });
    assert.equal(slotDraws(frame.calls, 'comms-pilot').length, 0, 'Ops, Tamsin and an idle channel do not show Orlov');
    assert.ok(frame.calls.text.includes('COMMS'));
  }
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
