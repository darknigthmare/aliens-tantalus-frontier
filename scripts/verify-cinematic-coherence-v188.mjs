// Coherence of the prologue / Act I cinematics and staged beats with the
// canon (bible §4, §5.1, §56.11) and with the places as they are drawn in game.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CINEMATICS_V188, NORTH_QUAY_NAMES_V188, cinematicSetLayoutV188, CINEMATIC_SET_SCENES_V188, QUAY_CAST_IDS_V188,
  drawCinematicFrameV188 } from '../src/story-cinematics-v188.js';
import { STAGED_BEATS_V188 } from '../src/ingame-staging-v188.js';
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
  assert.deepEqual([...CINEMATIC_SET_SCENES_V188].sort(), ['cradle', 'cryo', 'hologram', 'locker', 'quay', 'triage']);
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

test('CIN-01 matches the hub cryo bay: ECHO-8 locker, DAVID-8R left of the single open capsule 03', () => {
  const cryo = cinematicSetLayoutV188('cryo');
  const capsules = kinds(cryo, 'capsule'); assert.equal(capsules.length, 1, 'the cryo bay shows one hypersleep capsule');
  assert.equal(capsules[0].number, '03'); assert.equal(capsules[0].open, true);
  assert.deepEqual(capsules[0].metres, [2.3, 1.1], 'capsule ≈ 2.3 × 1.1 m');
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
  const drawn = textsAt('cin-01', 0); assert.ok(drawn.includes('CAPSULE 03 · OUVERTE')); assert.ok(!drawn.some(text => /CAPSULE 0[124]/.test(text)));
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
  assert.ok(textsAt('cin-11', 1).includes('QZ17'));
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
