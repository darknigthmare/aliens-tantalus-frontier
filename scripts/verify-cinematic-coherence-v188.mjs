// Coherence of the prologue / Act I cinematics and staged beats with the
// canon (bible §4, §5.1, §56.11) and with the places as they are drawn in game.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { CINEMATICS_V188, NORTH_QUAY_NAMES_V188, cinematicSetLayoutV188, CINEMATIC_SET_SCENES_V188, QUAY_CAST_IDS_V188,
  drawCinematicFrameV188, CinematicPlayerV188, LETTERBOX_V188 } from '../src/story-cinematics-v188.js';
import { STATION_CINEMATIC_ART_V188, STATION_CINEMATIC_NEW_ART_IDS_V188, STATION_CINEMATIC_ART_SOURCE_RECTS_V188,
  STATION_CINEMATIC_ART_ANCHORS_V188, STATION_CINEMATIC_ORBIT_V188, STATION_CINEMATIC_HELMET_V188,
  drawStationShotV188, drawStationTerminalV188, drawStationHelmetV188, stationCinematicSourcesV188, stationArtFitV188 } from '../src/station-cinematics-v188.js';
import { STAGED_BEATS_V188 } from '../src/ingame-staging-v188.js';
import { PROLOGUE_ART_V188, PROLOGUE_ART_SOURCE_RECTS_V188, PROLOGUE_ART_ANCHORS_V188,
  prologueArtFitV188, prologueArtAnchorV188, drawPrologueSetArtV188, drawPrologueShotV188 } from '../src/prologue-art-v188.js';
import { ECHO8_LOCKER_V188 } from '../src/hub-echo8-locker-v188.js';
import { ONBOARDING_SPAWN_V84 } from '../src/hub-onboarding-v84.js';
import { PORT_POSTS_V90 } from '../src/port-meridien-v90.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const kinds = (layout, kind) => layout.items.filter(entry => entry.kind === kind);
const near = (actual, expected, tolerance, message) => assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} vs ${expected}`);
function recorder() {
  const calls = { text: [] };
  const ctx = new Proxy({ measureText: value => ({ width: String(value).length * 9 }), createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }), fillText(value) { calls.text.push(String(value)); } }, { get: (object, key) => key in object ? object[key] : () => {} });
  return { ctx, calls };
}
const shotsOf = id => CINEMATICS_V188[id].shots;
function textsAt(id, index, language = 'fr') {
  const start = shotsOf(id).slice(0, index).reduce((sum, entry) => sum + entry.seconds, 0);
  const { ctx, calls } = recorder(); drawCinematicFrameV188(ctx, id, start + shotsOf(id)[index].seconds * .5, { language, reducedMotion: true }); return calls.text;
}

test('every set keeps one scale and plausible human proportions', () => {
  assert.deepEqual([...CINEMATIC_SET_SCENES_V188].sort(), ['control', 'cradle', 'cryo', 'hologram', 'locker', 'lowerdeck', 'quay', 'triage']); // V188 spec 007: + control, lowerdeck
  for (const scene of CINEMATIC_SET_SCENES_V188) for (const cast of [null, ...QUAY_CAST_IDS_V188]) {
    const layout = cinematicSetLayoutV188(scene, { cast });
    for (const entry of layout.items) {
      near(entry.px.w, entry.metres[0] * layout.scale, 1, `${scene} ${entry.kind} width`);
      near(entry.px.h, entry.metres[1] * layout.scale, 1, `${scene} ${entry.kind} height`);
      if (['person', 'resident'].includes(entry.kind)) assert.ok(entry.h >= 1.2 && entry.h <= 1.95, `${scene} ${entry.who} is human-sized`);
      // Everything standing on the floor stays inside the 2.39:1 picture.
      if (!['table', 'patient', 'shelf'].includes(entry.kind)) assert.ok(layout.floor - entry.px.h * (entry.stack || 1) >= 0, `${scene} ${entry.kind} fits`);
    }
  }
});

test('CIN-01 matches the hub cryo bay: ECHO-8 locker, DAVID-8R left of capsule 03 open, capsules 01/02/04 on the near floor', () => {
  const cryo = cinematicSetLayoutV188('cryo');
  const all = kinds(cryo, 'capsule'); assert.deepEqual(all.map(entry => entry.number).sort(), ['01', '02', '03', '04'], 'four capsules, as in the room');
  assert.deepEqual(all.filter(entry => entry.open).map(entry => entry.number), ['03'], 'only Echo-9’s capsule is open');
  assert.ok(all.filter(entry => entry.number !== '03').every(entry => entry.px.drop > 0), 'the others stand on the near floor');
  const capsules = all.filter(entry => entry.number === '03');
  for (const entry of all) assert.deepEqual(entry.metres, [2.3, 1.1], 'capsule ≈ 2.3 × 1.1 m');
  const [david] = kinds(cryo, 'person'); assert.equal(david.who, 'DAVID-8R'); assert.equal(david.h, 1.8);
  assert.ok(david.px.x < capsules[0].px.x, 'DAVID-8R waits to the left of the capsule (toast after the wake)');
  assert.ok(capsules[0].px.w > david.px.h, 'a capsule is longer than a standing person');
  const [locker] = kinds(cryo, 'locker'); assert.equal(locker.label, 'ECHO-8'); assert.equal(locker.sealed, true);
  assert.ok(locker.px.x < david.px.x, 'the ECHO-8 locker stands to the west, as in the room');
  // In game: the locker west of the wake point, the wake contact at the capsule (x 4736).
  assert.ok(ECHO8_LOCKER_V188.x < ONBOARDING_SPAWN_V84.positionX);
  assert.match(read('src/hub-onboarding-v84.js'), /room\.id === 'cryo-bay' && Math\.abs\(center - 4736\)/);
  assert.match(read('src/app.js'), /DAVID-8R vous attend à gauche de la capsule/);
  // The game locker is 46 × 112 px at 51 px/m ≈ 0.9 × 2.2 m; the close-up keeps that ratio.
  const close = kinds(cinematicSetLayoutV188('locker'), 'locker'); assert.equal(close.length, 1);
  near(close[0].metres[1] / close[0].metres[0], ECHO8_LOCKER_V188.h / ECHO8_LOCKER_V188.w, .05, 'locker ratio');
  const drawn = textsAt('cin-01', 0); assert.ok(drawn.includes('CAPSULE 03 · OUVERTE'));
  for (const number of ['01', '02', '04']) assert.ok(drawn.includes(`CAPSULE ${number}`), `capsule ${number} is labelled, closed`);
  assert.ok(textsAt('cin-01', 1).includes('ECHO-8'));
});

test('CIN-02: Vega, Harlow and Velez are present with Echo-9 around the table', () => {
  const room = cinematicSetLayoutV188('hologram'), people = kinds(room, 'person');
  assert.deepEqual(people.map(entry => entry.who).sort(), ['ECHO-9', 'INEZ HARLOW', 'LT. MARA VEGA', 'TAMSIN VELEZ']);
  const speakers = new Set(shotsOf('cin-02').map(entry => entry.line.crewId));
  for (const crewId of speakers) assert.ok(people.some(entry => entry.crewId === crewId), `${crewId} stands at the table`);
  const [table] = kinds(room, 'table'); assert.ok(table.metres[0] >= 2.5 && table.metres[1] < 1.1);
});

test('the quay: Wren and the three residents, Ferro and the bandaged patient on a 2 m stretcher, QZ17 marks', () => {
  const arrival = cinematicSetLayoutV188('quay', { cast: 'arrival' });
  assert.equal(shotsOf('cin-p3-wren')[0].cast, 'arrival');
  assert.equal(kinds(arrival, 'resident').length, 3, 'three residents to escort');
  assert.deepEqual(kinds(arrival, 'person').map(entry => entry.who), ['TOMAS WREN']);
  const containers = kinds(arrival, 'container');
  assert.ok(containers.every(entry => entry.metres[0] === 2.99 && entry.metres[1] === 2.59), '10-ft containers');
  assert.ok(containers.every(entry => !entry.label || entry.label === 'QZ17') && containers.some(entry => entry.label === 'QZ17'));
  assert.ok(containers.every(entry => entry.px.h > kinds(arrival, 'person')[0].px.h), 'a container is taller than a person');
  assert.ok(textsAt('cin-p3-wren', 0).includes('QZ17'));
  const elder = cinematicSetLayoutV188('quay', { cast: 'elder' });
  assert.deepEqual(kinds(elder, 'person').map(entry => entry.who), ['ASHA MBAYE', 'ADÈLE SARRAZIN']);
  assert.ok(shotsOf('cin-doyenne').filter(entry => entry.scene === 'quay').every(entry => entry.cast === 'elder'));
  const triage = cinematicSetLayoutV188('triage');
  const [stretcher] = kinds(triage, 'stretcher'), [patient] = kinds(triage, 'patient');
  assert.equal(stretcher.metres[0], 2); assert.equal(patient.bandaged, true);
  assert.ok(patient.metres[0] < stretcher.metres[0] && patient.px.x >= stretcher.px.x && patient.px.x + patient.px.w <= stretcher.px.x + stretcher.px.w, 'the patient lies on the stretcher');
  assert.deepEqual(kinds(triage, 'person').map(entry => entry.who), ['LUCIA FERRO']);
  assert.ok(shotsOf('cin-p3-ferro').every(entry => entry.scene === 'triage'));
  assert.deepEqual([...NORTH_QUAY_NAMES_V188], ['E. Okonjo', 'P. Lindqvist', 'S. Arenas', 'D. Haddad', 'K. Brandt']);
  assert.match(shotsOf('cin-p2')[0].caption.fr, /37 MESSAGES/); assert.match(shotsOf('cin-p2')[0].caption.en, /37 DELAYED MESSAGES/);
  const burst = textsAt('cin-p2', 0); const { ctx, calls } = recorder();
  drawCinematicFrameV188(ctx, 'cin-p2', 8.9, { reducedMotion: true }); assert.equal(calls.text.filter(text => /RELAIS DE DÉTRESSE #/.test(text)).length, 37);
  assert.ok(burst.length > 0);
});

test('Act I: four accesses on Rook’s radio, a cradle for a human-sized occupant torn open from inside', () => {
  const rook = shotsOf('cin-10')[1]; assert.equal(rook.radio, true, 'Rook is the radio voice of every sortie'); assert.match(rook.line.text.fr, /^Quatre accès\./);
  const set = cinematicSetLayoutV188('cradle'), [cradle] = kinds(set, 'cradle'), [marine] = kinds(set, 'person');
  assert.ok(cradle.metres[0] >= 2 && cradle.metres[0] > marine.metres[1], 'longer than the marine is tall');
  assert.equal(cradle.label, 'QZ17'); assert.equal(cradle.torn, true); assert.ok(cradle.restraints >= 2);
  assert.ok(shotsOf('cin-11').every(entry => entry.kind === 'cradle' || entry.scene === 'cradle'), 'the radio line stays on the cradle');
  assert.ok(textsAt('cin-11', 1).includes('QZ17-04'), 'the same missing cradle as the physical maintenance alcove');
});

test('staged beats play where the game puts them', () => {
  const place = id => STAGED_BEATS_V188[id].place;
  assert.deepEqual({ ...place('beat-wake') }, { scene: 'hub', roomId: 'cryo-bay', prop: 'capsule-03', x: 4736 });
  assert.match(STAGED_BEATS_V188['beat-wake'].terminal.fr, /CAPSULE 03/); assert.match(STAGED_BEATS_V188['beat-wake'].terminal.en, /CAPSULE 03/);
  assert.equal(place('beat-exercise-interrupt').annexId, 'proving-ground'); assert.match(read('src/hub-annex-art-layout-v72.js'), /'proving-ground':/);
  assert.match(STAGED_BEATS_V188['beat-exercise-interrupt'].lines[0].text.fr, /console du pas de tir/);
  assert.equal(place('beat-port-arrival').x, PORT_POSTS_V90.unload.x); assert.equal(place('beat-port-report').x, PORT_POSTS_V90.report.x);
  assert.match(STAGED_BEATS_V188['beat-port-arrival'].lines[0].text.fr, /rampe/); assert.match(STAGED_BEATS_V188['beat-port-report'].lines[0].text.fr, /de trois\./);
  assert.match(read('src/app.js'), /trois habitants secourus/);
  for (const beat of Object.values(STAGED_BEATS_V188)) for (const entry of beat.lines) assert.ok(entry.text.fr && entry.text.en);
});

// Explicit source-image fixtures and a small transform recorder let these tests
// exercise production composition without pretending to be a browser journey.
function stationImages() {
  return Object.fromEntries(Object.values(STATION_CINEMATIC_ART_V188).map(({ path }) => {
    const file = new URL('..' + path, import.meta.url); assert.ok(existsSync(file), path);
    const bytes = readFileSync(file);
    return [path, { src: path, complete: true, naturalWidth: bytes.readUInt32BE(16), naturalHeight: bytes.readUInt32BE(20) }];
  }));
}
function stationRecorder() {
  const calls = { images: [], text: [], fills: [] }, stack = []; let m = [1, 0, 0, 1, 0, 0];
  const ctx = new Proxy({
    save() { stack.push([...m]); }, restore() { m = stack.pop() || [1, 0, 0, 1, 0, 0]; },
    translate(x, y) { m[4] += m[0] * x + m[2] * y; m[5] += m[1] * x + m[3] * y; },
    scale(x, y) { m[0] *= x; m[1] *= x; m[2] *= y; m[3] *= y; },
    rotate(angle) { const [a, b, c, d] = m, co = Math.cos(angle), si = Math.sin(angle); m[0] = a * co + c * si; m[1] = b * co + d * si; m[2] = c * co - a * si; m[3] = d * co - b * si; },
    measureText: value => ({ width: String(value).length * 9 }), createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }),
    drawImage(image, ...args) { calls.images.push({ path: image.src, args, matrix: [...m] }); },
    fillText(value, x, y) { calls.text.push({ value: String(value), x, y, matrix: [...m] }); },
    fillRect(...args) { calls.fills.push({ args, color: ctx.fillStyle, matrix: [...m] }); }
  }, { get: (object, key) => key in object ? object[key] : () => {} });
  return { ctx, calls };
}
const artPath = id => STATION_CINEMATIC_ART_V188[id].path;
const sourcePoint = (call, [px, py]) => {
  const [sx, sy, sw, sh, x, y, w, h] = call.args, [a, b, c, d, e, f] = call.matrix;
  const dx = x + (px - sx) * w / sw, dy = y + (py - sy) * h / sh;
  return [a * dx + c * dy + e, b * dx + d * dy + f];
};

test('station cinematic art: only the selected sequence is preloaded, once, with existing portrait identities', () => {
  const requests = [], player = new CinematicPlayerV188({ document: null, ImageCtor: class { set src(value) { requests.push(value); } } });
  player.preload('cin-70'); const count = requests.length;
  assert.ok(requests.includes(artPath('asph-cin-ring')) && requests.includes(artPath('asph-cin-hub')) && requests.includes(artPath('ud4l-troop-bay')));
  assert.ok(!requests.includes(artPath('asph-cin-helmet-corridor')) && !requests.includes(artPath('asph-cassius-core')));
  assert.ok(!requests.some(path => /asph-msn-|act5\//.test(path)), 'neither mission objects nor Act V plates are requested');
  player.preload('cin-70'); assert.equal(requests.length, count, 'same sequence never repeats a request');
  player.preload('cin-71'); assert.ok(requests.includes(artPath('asph-cassius-core')) && requests.includes(artPath('echo9-idle')));
  assert.ok(!requests.includes(artPath('asph-cin-ceiling-drone')));
  player.preload('cin-72'); assert.ok(requests.includes(artPath('asph-cin-ceiling-drone')) && requests.includes(artPath('asph-cin-bent-door')));
  assert.equal(new Set(requests).size, requests.length, 'shared bezel is not requested twice');
  assert.equal(stationCinematicSourcesV188('cin-50'), null, 'other cinematics retain their existing policy');
});

test('station cinematic art: final files and measured windows are valid; fits preserve every source ratio', () => {
  const images = stationImages(); assert.equal(STATION_CINEMATIC_NEW_ART_IDS_V188.length, 6);
  for (const [id, entry] of Object.entries(STATION_CINEMATIC_ART_V188)) {
    const image = images[entry.path], rect = STATION_CINEMATIC_ART_SOURCE_RECTS_V188[id] || [0, 0, image.naturalWidth, image.naturalHeight];
    assert.ok(rect[0] >= 0 && rect[1] >= 0 && rect[2] > 0 && rect[3] > 0 && rect[0] + rect[2] <= image.naturalWidth && rect[1] + rect[3] <= image.naturalHeight, id);
    const fit = stationArtFitV188(images, id, [20, 30, 420, 300]); assert.ok(fit, id);
    near(fit.w / fit.sw, fit.h / fit.sh, 1e-12, `${id} uniform scale`);
    for (const [key, anchor] of Object.entries(STATION_CINEMATIC_ART_ANCHORS_V188[id] || {})) {
      assert.ok(anchor[0] >= rect[0] && anchor[1] >= rect[1] && anchor[0] + (anchor[2] || 0) <= rect[0] + rect[2] && anchor[1] + (anchor[3] || 0) <= rect[1] + rect[3], `${id} ${key}`);
    }
  }
});

test('station cinematic orbit: only ring and docked craft rotate; the hub, pivot and reduced-motion frame stay fixed', () => {
  const images = stationImages(), entry = shotsOf('cin-70')[2], orbit = STATION_CINEMATIC_ORBIT_V188;
  const at = (time, reducedMotion = false, selected = images) => { const trace = stationRecorder(); drawStationShotV188(trace.ctx, entry, { images: selected, local: time, progress: .5, reducedMotion }); return trace.calls; };
  const first = at(0), second = at(8);
  const find = (calls, id) => calls.images.find(call => call.path === artPath(id));
  const ring0 = find(first, 'asph-cin-ring'), ring8 = find(second, 'asph-cin-ring'), hub0 = find(first, 'asph-cin-hub'), hub8 = find(second, 'asph-cin-hub');
  assert.notDeepEqual(ring0.matrix, ring8.matrix); assert.deepEqual(hub0, hub8, 'hub is sampled outside the rotation');
  for (const draw of [ring0, ring8, hub0, hub8]) {
    const point = sourcePoint(draw, [627, 627]); near(point[0], orbit.center[0], 1e-9, 'common x pivot'); near(point[1], orbit.center[1], 1e-9, 'common y pivot');
  }
  assert.deepEqual(at(0, true), at(8, true), 'reduced motion freezes orbit and quarantine lamp');
  for (const keep of ['asph-cin-ring', 'asph-cin-hub']) {
    const calls = at(3, false, { [artPath(keep)]: images[artPath(keep)] });
    assert.ok(find(calls, keep)); assert.equal(calls.images.length, 1, 'the absent layer uses its own primitive fallback');
  }
});

test('station cinematic evidence: waveform and QZ17 orders stay native, translated and readable with or without bezel', () => {
  const images = stationImages(), terminal = shotsOf('cin-71')[2], waveform = shotsOf('cin-70')[1];
  for (const selected of [images, {}]) for (const lang of ['fr', 'en']) {
    const term = stationRecorder(); drawStationTerminalV188(term.ctx, terminal, { images: selected, progress: .9, local: 6, lang, reducedMotion: true });
    const text = term.calls.text.map(entry => entry.value).join(' ');
    assert.ok(text.includes(lang === 'en' ? 'ASPHODÈLE · QZ17 ARCHIVES · S2' : 'ASPHODÈLE · ARCHIVES QZ17 · S2'));
    assert.ok(!text.includes('QZ-18') && !text.includes('FILE DE DÉTRESSE'));
    assert.ok(text.includes(terminal.lines[0][lang]) && text.includes(terminal.lines[1][lang]) && text.includes(terminal.status[lang]));
    const wave = stationRecorder(); drawStationShotV188(wave.ctx, waveform, { images: selected, progress: .9, lang, reducedMotion: true });
    assert.deepEqual(wave.calls.text.map(entry => entry.value), ['05:58', '06:00', lang === 'en' ? 'CUT' : 'COUPURE']);
  }
});

test('station helmet camera: threat timing is preserved and REC stays outside the pushed camera and letterbox', () => {
  const images = stationImages(), entry = shotsOf('cin-72')[0];
  for (const progress of [.1, .55, .5501, .82]) {
    const trace = stationRecorder(); drawStationHelmetV188(trace.ctx, entry, { images, progress, local: progress * 12 });
    assert.equal(trace.calls.images.some(call => call.path === artPath('asph-cin-ceiling-drone')), progress > .55);
    if (progress > .55) {
      const corridor = trace.calls.images.find(call => call.path === artPath('asph-cin-helmet-corridor'));
      const drone = trace.calls.images.find(call => call.path === artPath('asph-cin-ceiling-drone'));
      const beam = STATION_CINEMATIC_ART_ANCHORS_V188['asph-cin-helmet-corridor'].ceilingBeam;
      const beamBottom = sourcePoint(corridor, [beam[0], beam[1] + beam[3]])[1];
      for (const contact of Object.values(STATION_CINEMATIC_ART_ANCHORS_V188['asph-cin-ceiling-drone'])) {
        near(sourcePoint(drone, contact)[1], beamBottom, 8, 'hands and feet meet the underside of the measured ceiling beam');
      }
    }
  }
  for (const progress of [.1, .5, .82]) for (const reducedMotion of [false, true]) {
    const trace = stationRecorder(); drawCinematicFrameV188(trace.ctx, 'cin-72', progress * 12, { images, reducedMotion });
    const rec = trace.calls.text.find(entry => entry.value === '● REC'); assert.ok(rec);
    assert.deepEqual(rec.matrix, [1, 0, 0, 1, 0, 0], 'REC is screen-space, not moved by the scene camera');
    assert.deepEqual([rec.x, rec.y], STATION_CINEMATIC_HELMET_V188.rec);
    assert.ok(rec.y - 16 > LETTERBOX_V188 && rec.y < 720 - LETTERBOX_V188);
  }
  const before = stationRecorder(), after = stationRecorder();
  drawStationHelmetV188(before.ctx, entry, { images, progress: .7, local: 7, reducedMotion: true });
  drawStationHelmetV188(after.ctx, entry, { images, progress: .8, local: 9, reducedMotion: true });
  assert.deepEqual(before.calls, after.calls, 'reduced motion freezes the degraded feed once the same threat phase is reached');
});

function prologueImages() {
  return Object.fromEntries(Object.values(PROLOGUE_ART_V188).map(({ path }) => {
    const bytes = readFileSync(new URL(`..${path}`, import.meta.url)); let naturalWidth, naturalHeight;
    if (bytes.subarray(1, 4).toString() === 'PNG') { naturalWidth = bytes.readUInt32BE(16); naturalHeight = bytes.readUInt32BE(20); }
    else { assert.equal(bytes.subarray(8, 16).toString(), 'WEBPVP8L', path); const bits = bytes.readUInt32LE(21);
      naturalWidth = (bits & 0x3fff) + 1; naturalHeight = ((bits >>> 14) & 0x3fff) + 1; }
    return [path, { src: path, complete: true, naturalWidth, naturalHeight }];
  }));
}
const prologuePath = id => PROLOGUE_ART_V188[id].path;

test('opening source windows retain valid pixels and uniform static transforms in Object and Map caches', () => {
  const images = prologueImages();
  for (const selected of [images, new Map(Object.entries(images))]) for (const id of Object.keys(PROLOGUE_ART_V188)) {
    const fit = prologueArtFitV188(selected, id, [20, 30, 420, 300]); assert.ok(fit, id);
    near(fit.w / fit.sw, fit.h / fit.sh, 1e-12, `${id} uniform scale`);
    const image = images[prologuePath(id)]; assert.ok(fit.sx >= 0 && fit.sy >= 0 && fit.sx + fit.sw <= image.naturalWidth && fit.sy + fit.sh <= image.naturalHeight, id);
    for (const anchor of Object.values(PROLOGUE_ART_ANCHORS_V188[id] || {})) {
      const rect = PROLOGUE_ART_SOURCE_RECTS_V188[id] || [0, 0, image.naturalWidth, image.naturalHeight];
      assert.ok(anchor[0] >= rect[0] && anchor[1] >= rect[1] && anchor[0] + (anchor[2] || 0) <= rect[0] + rect[2] && anchor[1] + (anchor[3] || 0) <= rect[1] + rect[3], id);
    }
  }
  // Rectangles can be in-bounds yet cut a transparent globe into a straight
  // edge. Check the actual orbital compositions, including partial loading.
  const planetPath = prologuePath('planet'), planet = images[planetPath];
  for (const kind of ['orbit-station', 'tantalus-orbit']) {
    assert.deepEqual(Object.values(CINEMATICS_V188).filter(cin => cin.shots.some(shot => shot.kind === kind)).map(cin => cin.id), ['cin-00']);
    const index = shotsOf('cin-00').findIndex(shot => shot.kind === kind), shot = shotsOf('cin-00')[index];
    const time = shotsOf('cin-00').slice(0, index).reduce((sum, entry) => sum + entry.seconds, 0) + shot.seconds * .5;
    for (const selected of [images, { [planetPath]: planet }]) for (const reducedMotion of [false, true]) {
      const trace = stationRecorder(); drawCinematicFrameV188(trace.ctx, 'cin-00', time, { images: selected, reducedMotion });
      const call = trace.calls.images.find(entry => entry.path === planetPath); assert.ok(call, kind);
      assert.deepEqual(call.args.slice(0, 4), [0, 0, planet.naturalWidth, planet.naturalHeight], `${kind} retains the entire transparent globe`);
      near(call.args[6] / planet.naturalWidth, call.args[7] / planet.naturalHeight, 1e-12, `${kind} cannot flatten the globe`);
      near(call.args[6], kind === 'orbit-station' && selected === images ? 980 : 900, 1e-9, 'existing orbital width');
    }
  }
});

test('CIN01 art retains 03 open then 01/02/04 closed, David on the back deck, the escape door and the crossed ECHO-8 seal', () => {
  const images = prologueImages(), trace = stationRecorder(), strokes = []; let path = [];
  trace.ctx.beginPath = () => { path = []; }; trace.ctx.moveTo = (x, y) => path.push(['M', x, y]); trace.ctx.lineTo = (x, y) => path.push(['L', x, y]);
  trace.ctx.stroke = () => strokes.push({ path: [...path], color: trace.ctx.strokeStyle });
  drawCinematicFrameV188(trace.ctx, 'cin-01', 4, { images, reducedMotion: true });
  const podCalls = trace.calls.images.filter(call => call.path === prologuePath('cryopod'));
  const bodies = podCalls.filter(call => call.args[0] === 8 && call.args[1] === 9);
  assert.equal(bodies.length, 4); assert.equal(podCalls.length, 5, 'only the single open canopy is sampled a second time');
  for (let i = 0; i < bodies.length; i++) near(sourcePoint(bodies[i], [120, 123])[1], i ? 601 : 510, 1e-9, 'back and near deck order');
  assert.deepEqual(trace.calls.text.filter(entry => /^CAPSULE \d/.test(entry.value)).map(entry => entry.value),
    ['CAPSULE 03 · OUVERTE', 'CAPSULE 01', 'CAPSULE 02', 'CAPSULE 04']);
  const david = trace.calls.images.find(call => call.path === prologuePath('david'));
  assert.deepEqual(sourcePoint(david, [128, 240]), [640, 510]);
  assert.ok(trace.calls.images.some(call => call.path === prologuePath('escape-bay-door')));
  assert.ok(trace.calls.text.some(entry => entry.value === 'CAPSULES DE SAUVETAGE'));
  assert.ok(strokes.some(stroke => stroke.color === '#e9d07a' && stroke.path.length === 4 && stroke.path.map(p => p[0]).join() === 'M,L,M,L'), 'the sealed locker still has both crossing bands');
  assert.ok(!trace.calls.images.some(call => /command-cryo(?:-far|-mid)?\.png$/.test(call.path)), 'no extra painted vertical pods behind the four horizontal ones');
});

test('quay bodies keep their own feet and native heights; the third resident is a child and Sarrazin faces Asha', () => {
  const images = prologueImages();
  for (const [cinematicId, cast, expected] of [['cin-p3-wren', 'arrival', [
    ['tomas-wren-standing', 470, 144], ['resident-docker', 820, 140], ['resident-merchant', 868, 128], ['resident-child-standing', 906, 104]]],
  ['cin-doyenne', 'elder', [['asha', 480, 140], ['adele-sarrazin-standing', 860, 130]]]]) {
    const layout = cinematicSetLayoutV188('quay', { cast }), trace = stationRecorder();
    for (const entry of layout.items) drawPrologueSetArtV188(trace.ctx, entry, { images, cinematicId, scene: 'quay', layout });
    for (const [id, x, height] of expected) {
      const call = trace.calls.images.find(call => call.path === prologuePath(id)); assert.ok(call, id);
      const foot = PROLOGUE_ART_ANCHORS_V188[id].foot, rect = PROLOGUE_ART_SOURCE_RECTS_V188[id];
      near(sourcePoint(call, foot)[0], x, 1e-9, id); near(sourcePoint(call, foot)[1], 520, 1e-9, id);
      near(sourcePoint(call, foot)[1] - sourcePoint(call, [foot[0], rect[1]])[1], height, 1e-9, `${id} body height`);
      assert.equal(call.matrix[0] < 0, id === 'adele-sarrazin-standing', 'only Sarrazin is mirrored toward the left');
    }
    assert.equal(trace.calls.text.filter(entry => entry.value === 'QZ17').length, 2);
  }
});

test('locker supplies retain the wall mount and the empty service trolley rests on its wheels without stretching', () => {
  const images = prologueImages(), layout = cinematicSetLayoutV188('locker'), trace = stationRecorder();
  for (const entry of layout.items) drawPrologueSetArtV188(trace.ctx, entry, { images, cinematicId: 'cin-01', scene: 'locker', layout });
  const shelf = trace.calls.images.find(call => call.path === prologuePath('cryo-supply-shelf')),
    trolley = trace.calls.images.find(call => call.path === prologuePath('cryo-service-trolley'));
  near(sourcePoint(shelf, [665, 1079])[1], 610 - 1.3 * 190, 1e-9, 'shelf mount 1.3 m above deck');
  near(sourcePoint(trolley, [662, 1105])[1], 610, 1e-9, 'front wheel contact');
  for (const call of [shelf, trolley]) near(call.args[6] / call.args[2], call.args[7] / call.args[3], 1e-12, 'authored aspect ratio');
  assert.equal(trace.calls.text.filter(row => row.value !== 'ECHO-8').length, 0, 'the supplies add no label or invented contents');
});

test('triage keeps the 2 m mattress and wheel contacts fixed while only the thorax breathes; head and heels touch its depth', () => {
  const images = prologueImages(), layout = cinematicSetLayoutV188('triage');
  const render = (time, reducedMotion = false) => { const trace = stationRecorder();
    for (const entry of layout.items) drawPrologueSetArtV188(trace.ctx, entry, { images, cinematicId: 'cin-p3-ferro', scene: 'triage', layout, time, reducedMotion }); return trace.calls; };
  const first = render(0), inhale = render(Math.PI / 4.4), second = render(3, true), still = render(0, true);
  const bed0 = first.images.find(call => call.path === prologuePath('medical-stretcher')), bed1 = inhale.images.find(call => call.path === prologuePath('medical-stretcher'));
  assert.deepEqual(bed0, bed1); near(sourcePoint(bed0, [961, 812])[1], 560, 1e-9, 'wheel ground');
  near(sourcePoint(bed0, [1829, 87])[0] - sourcePoint(bed0, [96, 87])[0], 360, 1e-9, '2 m mattress');
  const patient0 = first.images.filter(call => call.path === prologuePath('north-quay-patient')),
    patient1 = inhale.images.filter(call => call.path === prologuePath('north-quay-patient'));
  assert.deepEqual(patient0[0], patient1[0], 'legs stay still'); assert.deepEqual(patient0.at(-2), patient1.at(-2), 'head stays still');
  assert.deepEqual(patient0.at(-1), patient1.at(-1), 'hands and lower contact edge stay still');
  assert.notDeepEqual(patient0[4], patient1[4], 'chest rises during inhalation'); assert.deepEqual(still, second, 'reduced motion freezes respiration');
  near(sourcePoint(patient0.at(-1), [2025, 455])[1], sourcePoint(bed0, [1700, 87])[1], 1, 'back of head at rear mattress edge');
  near(sourcePoint(patient0.at(-1), [100, 583])[1], sourcePoint(bed0, [150, 175])[1], 1, 'heels at front mattress edge');
  assert.ok(!first.images.some(call => /colony-screening/.test(call.path)), 'triage supplies no unestablished diagnosis');
});

test('relay hand enters after 45 percent, follows the original 620 px reach and touches the fixed badge without exposing its cut sleeve', () => {
  const images = prologueImages(), current = shotsOf('cin-00')[3], traces = [];
  for (const progress of [.45, .45001, .65, .85, 1]) {
    const trace = stationRecorder(); drawPrologueShotV188(trace.ctx, 'cin-00', current, { images, progress, local: progress * 8 }); traces.push(trace.calls);
    const badge = trace.calls.images.find(call => call.path === prologuePath('relay-access-badge'));
    assert.ok(badge); if (traces.length > 1) assert.deepEqual(badge, traces[0].images.find(call => call.path === badge.path));
    const hand = trace.calls.images.find(call => call.path === prologuePath('relay-reaching-hand'));
    assert.equal(!!hand, progress > .45);
    if (hand) {
      const tip = sourcePoint(hand, [54, 453]); near(tip[0], 1280 - Math.min(1, (progress - .45) / .4) * 620, 1e-9, 'native reach'); near(tip[1], 490, 1e-9, 'contact height');
      near(hand.args[6] / hand.args[2], hand.args[7] / hand.args[3], 1e-12, 'hand proportions');
      assert.ok(sourcePoint(hand, [2164, 350])[0] > 1280, 'authored sleeve cut remains outside the frame');
      if (progress >= .85) assert.ok(tip[0] >= badge.args[4] && tip[0] <= badge.args[4] + badge.args[6] && tip[1] >= badge.args[5] && tip[1] <= badge.args[5] + badge.args[7]);
    }
  }
  near(traces[3].images.at(-1).args[4], traces[4].images.at(-1).args[4], 1e-9, 'reach holds at the end of the shot');
});

test('native messages, clocks and names keep their reveal thresholds, and the full 37-message list survives the letterbox', () => {
  const images = prologueImages();
  for (const selected of [images, {}]) for (const language of ['fr', 'en']) for (const reducedMotion of [false, true]) {
    for (const [index, start, clock, status] of [[2, 14, '18:42', language === 'en' ? 'ON HOLD' : 'EN ATTENTE'], [4, 32, '18:54', '18:54']]) {
      const entry = shotsOf('cin-00')[index];
      for (const progress of [.5, .5001, .9]) {
        const trace = stationRecorder(); drawCinematicFrameV188(trace.ctx, 'cin-00', start + entry.seconds * progress, { images: selected, language, reducedMotion });
        assert.ok(trace.calls.text.some(row => row.value === `QZ-18 · FILE DE DÉTRESSE · ${clock}`));
        assert.equal(trace.calls.text.some(row => row.value === status), progress > .5);
        assert.ok(trace.calls.text.some(row => row.value === entry.lines[0][language]));
      }
    }
    const trace = stationRecorder(); drawCinematicFrameV188(trace.ctx, 'cin-p2', 8.8, { images: selected, language, reducedMotion });
    const rows = trace.calls.text.filter(row => /#\d\d$/.test(row.value)); assert.equal(rows.length, 37);
    assert.ok(rows[36].value.includes('4 H') && rows[36].value.endsWith('#37'));
    for (const row of rows) { const [, b, , d, , f] = row.matrix, y = b * row.x + d * row.y + f;
      assert.ok(y - 16 * d >= LETTERBOX_V188 && y < 720 - LETTERBOX_V188, row.value); }
    for (const progress of [.01, .17, .34, .51, .68, .9]) {
      const names = stationRecorder(); drawCinematicFrameV188(names.ctx, 'cin-20', 14 + 14 * progress, { images: selected, language, reducedMotion });
      assert.deepEqual(names.calls.text.filter(row => NORTH_QUAY_NAMES_V188.includes(row.value)).map(row => row.value), NORTH_QUAY_NAMES_V188.filter((_, index) => progress > index / 6));
    }
    const briefing = stationRecorder(); drawCinematicFrameV188(briefing.ctx, 'cin-02', 12, { images: selected, language, reducedMotion });
    const cocyte = briefing.calls.text.find(row => row.value === 'COCYTE'), [, b, , d, , f] = cocyte.matrix;
    assert.ok(b * cocyte.x + d * (cocyte.y - 13) + f > LETTERBOX_V188, 'Cocyte label remains below the upper bar');
  }
});

test('port approach keeps eight alternating native lamps on the measured painted landing-pad edge', () => {
  const images = prologueImages(), current = shotsOf('cin-03')[3];
  const render = (local, reducedMotion = false) => { const trace = stationRecorder();
    drawPrologueShotV188(trace.ctx, 'cin-03', current, { images, local, progress: .6, reducedMotion }); return trace.calls; };
  const a = render(0), b = render(.34), lamps = calls => calls.fills.filter(call => call.args[2] === 6 && call.args[3] === 6);
  assert.equal(lamps(a).length, 8); assert.equal(lamps(b).length, 8);
  const fit = prologueArtFitV188(images, 'port-meridien-night-approach', [0, 92, 1280, 536], { cover: true }), [x, y, w, h] = prologueArtAnchorV188(fit, 'pad');
  lamps(a).forEach((lamp, index) => {
    assert.notEqual(lamp.color, lamps(b)[index].color); assert.deepEqual(lamp.args, lamps(b)[index].args);
    const dx = lamp.args[0] + 3 - x - w / 2, dy = lamp.args[1] + 3 - y - h / 2 + dx * .018;
    near((dx / (w / 2)) ** 2 + (dy / (h / 2)) ** 2, 1, 1e-9, 'lamp lies on pad ellipse');
  });
  assert.deepEqual(render(0, true), render(8, true));
});

test('the relay lamp keeps its native cadence on the painted lamp and freezes in reduced motion', () => {
  const images = prologueImages(), current = shotsOf('cin-00')[1];
  const render = (local, reducedMotion = false) => { const trace = stationRecorder(), lamps = [];
    trace.ctx.ellipse = (...args) => lamps.push({ args, color: trace.ctx.fillStyle });
    drawPrologueShotV188(trace.ctx, 'cin-00', current, { images, local, reducedMotion }); return lamps; };
  const off = render(0), on = render(1); assert.equal(off.length, 1); assert.equal(on.length, 1);
  assert.deepEqual(off[0].args, on[0].args); assert.notEqual(off[0].color, on[0].color);
  assert.deepEqual(render(0, true), render(8, true));
  const fit = prologueArtFitV188(images, 'relay', [0, 92, 1280, 536], { cover: true, alignY: 0 }), [x, y, w, h] = prologueArtAnchorV188(fit, 'lamp');
  near(on[0].args[0], x + w / 2, 1e-9, 'lamp x'); near(on[0].args[1], y + h / 2, 1e-9, 'lamp y');
});
