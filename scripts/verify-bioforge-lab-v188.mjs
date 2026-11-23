// V188 Bioforge containment lab (spec 013): layout rules, geometry and access, the walk
// without session, the physical exit with decontamination, persistence boundaries,
// presentation and texts. The engine runs headless (no animation loop); images are the
// shipped files measured from disk.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openSync, readSync, closeSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BioforgeRuntimeV80 } from '../src/bioforge-runtime-v80.js';
import {
  BIOFORGE_ROOM_IDS_V80, BIOFORGE_DOOR_IDS_V80, createBioforgeLevelV80, validateBioforgeLevelV80
} from '../src/bioforge-level-v80.js';
import { createBioforgeV80, startBioforgeSessionV80, advanceBioforgeSessionV80, sanitizeBioforgeV80 } from '../src/bioforge-session-v80.js';
import {
  BIOFORGE_LAB_ZONES_V188, BIOFORGE_LAB_PROPS_V188, BIOFORGE_LAB_INTERACTIONS_V188, BIOFORGE_LAB_PROP_SLOTS_V188,
  BIOFORGE_OBSERVATION_GALLERY_V188, BIOFORGE_EXIT_DECON_SECONDS_V188, BIOFORGE_LAB_PHASE_LABELS_V188,
  validateBioforgeLabLayoutV188, getBioforgeLabZoneV188, resolveBioforgeLabInteractionV188, getBioforgeTankDisplayV188,
  getBioforgeAdmissionBoardV188, buildBioforgeColdStorageReportV188, buildBioforgeAnalysisReportV188,
  buildBioforgeIncineratorReportV188, createBioforgeExitDeconV188, stepBioforgeExitDeconV188
} from '../src/bioforge-lab-layout-v188.js';
import { createBioforgeLabVfxV188, stepBioforgeLabAmbienceV188 } from '../src/bioforge-lab-render-v188.js';
import { VFX_KINDS_V188 } from '../src/vfx-v188.js';
import { getVfxSlotV188 as getSlot } from '../src/vfx-slots-v188.js';
import { AUDIT_DEFERRED_FORGE_SOURCES_V163 } from './audit-succession-v163.mjs';
import { AUDIT_DEFERRED_FORGE_SOURCES_V162 } from './audit-succession-v162.mjs';
import { useCatalogV185, autoTranslateV185 } from '../src/i18n-auto-v185.js';
import * as catalog from '../src/i18n-en-catalog-v185.js';
import { setLanguageV185 } from '../src/i18n-v185.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(resolve(root, path), 'utf8');

function imageSize(source) {
  let descriptor;
  try {
    descriptor = openSync(resolve(root, `.${new URL(source, 'http://qa.invalid').pathname}`), 'r');
    const header = Buffer.alloc(32); readSync(descriptor, header, 0, 32, 0);
    if (header.subarray(1, 4).toString() === 'PNG') return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
    if (header.subarray(0, 4).toString() === 'RIFF' && header.subarray(12, 16).toString() === 'VP8X')
      return { width: header.readUIntLE(24, 3) + 1, height: header.readUIntLE(27, 3) + 1 };
    if (header.subarray(0, 4).toString() === 'RIFF' && header.subarray(12, 16).toString() === 'VP8L' && header[20] === 0x2f) {
      const bits = header.readUInt32LE(21); return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    }
    if (header.subarray(0, 4).toString() === 'RIFF' && header.subarray(12, 16).toString() === 'VP8 ')
      return { width: header.readUInt16LE(26) & 0x3fff, height: header.readUInt16LE(28) & 0x3fff };
    return null;
  } catch { return null; } finally { if (descriptor !== undefined) closeSync(descriptor); }
}

function host() {
  const windowEvents = new EventTarget(), stack = [], texts = [];
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = windowEvents[name].bind(windowEvents);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  globalThis.Image = class extends EventTarget {
    complete = false; naturalWidth = 0; naturalHeight = 0; width = 0; height = 0;
    set src(source) {
      this._src = String(source); const size = imageSize(this._src); this.complete = true;
      this.naturalWidth = this.width = size?.width || 0; this.naturalHeight = this.height = size?.height || 0;
      queueMicrotask(() => { const event = new Event(size ? 'load' : 'error'); this.dispatchEvent(event); this[`on${event.type}`]?.(event); });
    }
    get src() { return this._src; }
    async decode() {}
  };
  const gradient = { addColorStop() {} };
  const ctx = new Proxy({ globalAlpha: 1, save() { stack.push(this.globalAlpha); },
    restore() { assert.ok(stack.length, 'Balanced rendering context.'); this.globalAlpha = stack.pop(); },
    fillText(text) { texts.push(String(text)); }, measureText: text => ({ width: String(text).length * 7 }),
    createLinearGradient: () => gradient, createRadialGradient: () => gradient,
    getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 }) },
  { get(target, property) { return property in target ? target[property] : () => {}; } });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const key = (type, code) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { code, repeat: false, ctrlKey: false, metaKey: false, altKey: false, isComposing: false });
    windowEvents.dispatchEvent(event);
  };
  return { canvas, ctx, stack, texts, key };
}

async function settle(engine) {
  for (let count = 0; count < 40; count++) await Promise.resolve();
  await Promise.all(engine.getVisibleEnemyAtlasSheetsV65().map(sheet => engine.ensureEnemyAtlas(sheet)));
  for (let count = 0; count < 40; count++) await Promise.resolve();
  engine.refreshEnemyAtlasAvailabilityV65();
}
function simulate(engine, seconds) {
  for (let remaining = seconds; remaining > 1e-9; remaining -= Math.min(1 / 60, remaining)) engine.update(Math.min(1 / 60, remaining));
}
function prepared() {
  const browser = host(), events = [], commits = [];
  const engine = new BioforgeRuntimeV80(browser.canvas, { autoLoop: false, onEvent: event => events.push(event),
    onPersist: state => { commits.push(structuredClone(state)); return true; } });
  engine.prepare(null);
  return { ...browser, engine, events, commits };
}
async function walk(subject, x, { max = 1200 } = {}) {
  const { engine, key } = subject, right = x > engine.player.x, code = right ? 'KeyD' : 'KeyA';
  key('keydown', code);
  let steps = 0;
  while ((right ? engine.player.x < x : engine.player.x > x) && engine.running && steps++ < max) {
    engine.update(1 / 60);
    if (engine.enemyAtlasLoadingPausedV65) await settle(engine);
  }
  key('keyup', code);
  engine.update(1 / 60);
  return engine.player.x;
}
const press = (subject, code = 'KeyE') => { subject.key('keydown', code); subject.key('keyup', code); };

test('layout: eight zones cover the historical ribbon, each inside its room; ids, doors, arena and spawns unchanged', () => {
  const level = createBioforgeLevelV80();
  assert.equal(validateBioforgeLevelV80(level).valid, true);
  const report = validateBioforgeLabLayoutV188(level);
  assert.deepEqual(report.errors, []);
  assert.deepEqual(BIOFORGE_LAB_ZONES_V188.map(zone => zone.id), ['cold-storage', 'control', 'airlock-decon', 'admission-prep',
    'tank-hall', 'containment-cell', 'analysis-incinerator', 'exit-decon']);
  assert.deepEqual(level.rooms.map(room => room.id), [...BIOFORGE_ROOM_IDS_V80]);
  assert.deepEqual(level.doors.map(door => [door.id, door.x, door.w, door.h]), [
    ['control-seal', 420, 40, 536], ['inner-interlock', 650, 40, 536], ['arena-containment', 1260, 40, 536],
    ['arena-return', 2440, 40, 536], ['hub-return', 2820, 40, 536]]);
  assert.deepEqual(level.doors.map(door => door.id), [...BIOFORGE_DOOR_IDS_V80]);
  assert.deepEqual(level.world, { x: 0, y: 0, width: 2880, height: 720, ceilingY: 84, floorY: 620 });
  assert.deepEqual(level.arenaBounds, { x: 1300, y: 104, w: 1140, h: 516 });
  assert.deepEqual(level.spawnSlots.map(slot => [slot.x, slot.groundY]), [[1440, 620], [1605, 620], [1770, 620], [1980, 620], [2145, 620],
    [2310, 620], [1495, 470], [1655, 470], [1815, 470], [1975, 470], [2135, 470], [2295, 470]]);
  // Stations keep their ids and types; only the control, purge and return consoles moved (positions are not saved).
  assert.deepEqual(level.stations.map(station => [station.id, station.type, station.x]), [
    ['bioforge-control', 'control', 200], ['bioforge-printer', 'printer', 1080], ['bioforge-purge', 'purge', 2527], ['bioforge-return', 'return', 2688]]);
  for (const zone of BIOFORGE_LAB_ZONES_V188) assert.equal(getBioforgeLabZoneV188(zone.x + 1).id, zone.id);
  // Enclosed rooms have a human-scale visual ceiling (5 to 6 m at 51 px/m); halls stay open.
  for (const zone of BIOFORGE_LAB_ZONES_V188.filter(entry => entry.ceilingY != null)) {
    const metres = (level.world.floorY - zone.ceilingY) / 51;
    assert.ok(metres >= 5 && metres <= 6, `${zone.id} ${metres} m`);
  }
  assert.equal(BIOFORGE_OBSERVATION_GALLERY_V188.walkable, false);
  assert.ok(BIOFORGE_LAB_PROP_SLOTS_V188.every(slot => slot.startsWith('bioforge-lab-')));
});

test('validation refuses a lab that no longer matches its level', () => {
  const level = createBioforgeLevelV80();
  level.returnTrigger.x = 2400;
  assert.ok(validateBioforgeLabLayoutV188(level).errors.includes('exit-console-outside-booth'));
  const moved = createBioforgeLevelV80();
  moved.stations.find(station => station.id === 'bioforge-purge').x = 2300;
  assert.ok(validateBioforgeLabLayoutV188(moved).errors.some(error => error.startsWith('prop-station-mismatch:purge-console')));
  const shrunk = createBioforgeLevelV80();
  shrunk.rooms.find(room => room.id === 'return-lock').w = 300;
  assert.ok(validateBioforgeLabLayoutV188(shrunk).errors.includes('zone-outside-room:exit-decon'));
});

test('access: lab interactions sit on the floor before the airlock, exit ones after the cell, never at a door leaf', () => {
  const level = createBioforgeLevelV80();
  const seal = level.doors.find(door => door.id === 'control-seal'), cellExit = level.doors.find(door => door.id === 'arena-return');
  for (const interaction of BIOFORGE_LAB_INTERACTIONS_V188) {
    if (interaction.mode === 'lab') assert.ok(interaction.x < seal.x, interaction.id);
    else assert.ok(interaction.x > cellExit.x + cellExit.w, interaction.id);
    for (const door of level.doors) assert.ok(Math.abs(interaction.x - door.x - door.w / 2) >= 75, `${interaction.id} / ${door.id}`);
  }
  const actor = (center) => ({ x: center - 21, y: 528, w: 42, h: 92, alive: true });
  assert.equal(resolveBioforgeLabInteractionV188(level, actor(84), { mode: 'standby' }).kind, 'cold-storage');
  assert.equal(resolveBioforgeLabInteractionV188(level, actor(238), { mode: 'standby' }).kind, 'terminal');
  assert.equal(resolveBioforgeLabInteractionV188(level, actor(2565), { mode: 'standby' }), null, 'no exit interaction before a purge');
  assert.equal(resolveBioforgeLabInteractionV188(level, actor(84), { mode: 'egress' }), null);
  assert.equal(resolveBioforgeLabInteractionV188(level, actor(2565), { mode: 'egress' }).kind, 'incinerator');
  assert.equal(resolveBioforgeLabInteractionV188(level, actor(2631), { mode: 'egress' }).kind, 'analysis');
  assert.equal(resolveBioforgeLabInteractionV188(level, actor(2720), { mode: 'egress' }).kind, 'exit-decon');
  // The historical stage tests are kept: E near the seal at stage 0 is the door, not the console.
  assert.equal(resolveBioforgeLabInteractionV188(level, actor(356), { mode: 'session', stage: 0 }).id, 'stage-control-seal');
  assert.equal(resolveBioforgeLabInteractionV188(level, actor(586), { mode: 'session', stage: 1 }).id, 'stage-inner-interlock');
  assert.equal(resolveBioforgeLabInteractionV188(level, actor(1086), { mode: 'session', stage: 2 }).id, 'stage-printer');
  assert.equal(resolveBioforgeLabInteractionV188(level, actor(586), { mode: 'session', stage: 0 }), null);
  assert.equal(resolveBioforgeLabInteractionV188(level, { ...actor(84), alive: false }, { mode: 'standby' }), null);
});

test('admission flow: board and tanks follow the real queue; reports read the save without changing it', () => {
  const rootState = createBioforgeV80();
  assert.equal(getBioforgeTankDisplayV188(rootState)[0].state, 'configured');
  assert.equal(getBioforgeTankDisplayV188(rootState)[1].state, 'empty');
  const started = startBioforgeSessionV80(rootState, { composition: [
    { lineId: 'a', profileId: 'enemy-004-drone-big-chap', quantity: 1 }, { lineId: 'b', profileId: 'enemy-007-praetorian', quantity: 2 }],
  maxConcurrent: 12 }, { now: 1 }).state;
  let tanks = getBioforgeTankDisplayV188(started);
  assert.deepEqual(tanks.map(tank => [tank.lineId, tank.state, tank.waiting]), [['a', 'stasis', 1], ['b', 'stasis', 2]]);
  let state = started;
  for (let step = 0; step < 4 && state.activeSession.printedCount < 1; step++) state = advanceBioforgeSessionV80(state, { now: 2 + step }).state;
  assert.equal(state.activeSession.printedCount, 1);
  tanks = getBioforgeTankDisplayV188(state);
  assert.deepEqual(tanks.map(tank => [tank.lineId, tank.state]), [['b', 'stasis'], [null, 'empty']], 'a drained line leaves the tanks');
  assert.deepEqual(getBioforgeAdmissionBoardV188(state).map(row => [row.lineId, row.printed, row.waiting]), [['a', 1, 0], ['b', 0, 2]]);
  const saved = sanitizeBioforgeV80(structuredClone(state));
  saved.records['enemy-004-drone-big-chap'].kills = 3; saved.records['enemy-007-praetorian'].kills = 1;
  saved.history = [{ sessionId: 'x', outcome: 'cleared', printed: 4, kills: 4 }];
  const frozen = JSON.stringify(saved);
  assert.equal(buildBioforgeColdStorageReportV188(saved).samples, 4);
  assert.match(buildBioforgeColdStorageReportV188(saved).text, /4 ÉCHANTILLON\(S\) · 2 PROFIL\(S\)/);
  assert.match(buildBioforgeAnalysisReportV188(saved).text, /CONFINEMENT TENU · 4 IMPRIMÉ\(S\) · 4 NEUTRALISÉ\(S\)/);
  assert.equal(JSON.stringify(saved), frozen, 'reports are read-only');
  assert.match(buildBioforgeIncineratorReportV188({ completed: true, report: {} }).text, /CYCLE CONFIRMÉ/);
  assert.match(buildBioforgeIncineratorReportV188(null).text, /AUCUN CYCLE/);
});

test('exit decontamination: a timed cycle inside the booth, interrupted when leaving it', () => {
  const decon = createBioforgeExitDeconV188();
  stepBioforgeExitDeconV188(decon, { dt: 1, inside: true });
  assert.equal(decon.clock, 0, 'nothing runs before E');
  decon.active = true;
  stepBioforgeExitDeconV188(decon, { dt: 1, inside: true });
  stepBioforgeExitDeconV188(decon, { dt: .5, inside: false });
  assert.deepEqual([decon.active, decon.clock, decon.complete, decon.interrupted], [false, 0, false, 1]);
  decon.active = true;
  for (let t = 0; t < BIOFORGE_EXIT_DECON_SECONDS_V188 + .1; t += .1) stepBioforgeExitDeconV188(decon, { dt: .1, inside: true });
  assert.equal(decon.complete, true);
  stepBioforgeExitDeconV188(decon, { dt: 1, inside: false });
  assert.equal(decon.complete, true, 'a finished cycle stays finished');
});

test('walk without session: armed by the view, confined by the safety doors, never saved', async () => {
  const subject = prepared(), { engine, events, commits } = subject;
  subject.key('keydown', 'KeyA'); subject.key('keyup', 'KeyA');
  assert.equal(engine.running, false, 'an unarmed engine (hub or title) never starts a walk');
  engine.armBioforgeAmbulatoryV188(true);
  await walk(subject, 40);
  assert.equal(engine.bioforgeAmbulatoryV188, 'standby');
  assert.ok(engine.player.x <= 50);
  assert.equal(engine.bioforgeRootV80.activeSession, null);
  press(subject);
  assert.match(engine.bioforgeLabCaptionV188.text, /STOCKAGE FROID/);
  assert.ok(events.some(event => event.type === 'bioforge-lab-report' && event.kind === 'cold-storage'));
  await walk(subject, 217);
  press(subject);
  assert.ok(events.some(event => event.type === 'bioforge-terminal-requested'));
  await walk(subject, 900);
  const seal = engine.doors.find(door => door.id === 'control-seal');
  assert.ok(engine.player.x + engine.player.w <= seal.x + .01, 'the closed seal stops the walk');
  simulate(engine, 3);
  assert.equal(commits.length, 0, 'no periodic checkpoint without a session');
  engine.stop({ reason: 'view-change' });
  assert.equal(engine.running, false); assert.equal(engine.bioforgeAmbulatoryArmedV188, false);
});

test('session from the walk: same place, historical entry stages, sealing and printing unchanged', async () => {
  const subject = prepared(), { engine } = subject;
  engine.armBioforgeAmbulatoryV188(true);
  await walk(subject, 220);
  const x = engine.player.x;
  const started = engine.start({ configuration: { profileId: 'enemy-007-praetorian', quantity: 1, maxConcurrent: 12 }, seed: 188 });
  assert.equal(started.started, true);
  assert.equal(engine.bioforgeAmbulatoryV188, null);
  assert.equal(engine.player.x, x, 'the operator keeps their place in the control room');
  await settle(engine);
  for (const [target, stage] of [[335, 1], [565, 2], [1065, 3]]) {
    await walk(subject, target); press(subject);
    assert.equal(engine.bioforgeTransferStageV80, stage);
    if (stage === 2) assert.ok(engine.bioforgeEntryMistV188 > 0, 'decontamination mist when the interlock cycles');
  }
  await walk(subject, 1310);
  assert.equal(engine.bioforgeRootV80.activeSession.phase, 'sealing');
  simulate(engine, .8); await settle(engine); simulate(engine, .5); await settle(engine);
  assert.equal(engine.enemies.length, 1);
});

async function purgedInCell() {
  const subject = prepared(), { engine } = subject;
  engine.armBioforgeAmbulatoryV188(true);
  engine.start({ configuration: { profileId: 'enemy-007-praetorian', quantity: 1, maxConcurrent: 12 }, seed: 188 });
  await settle(engine);
  for (const [target] of [[335], [565], [1065]]) { await walk(subject, target); press(subject); }
  await walk(subject, 1310);
  simulate(engine, .8); await settle(engine); simulate(engine, .5); await settle(engine);
  const hooks = engine.getBioforgeQaHooksV80();
  assert.equal(hooks.kill(engine.enemies[0].id), true);
  simulate(engine, 1);
  assert.equal(engine.bioforgeRootV80.activeSession.phase, 'return');
  assert.equal(engine.running, false);
  return subject;
}

test('physical exit: purge, walk, reports, interrupted then complete decontamination, door, hub return', async () => {
  const subject = await purgedInCell(), { engine, events, commits } = subject;
  const savedBefore = commits.length, durable = JSON.stringify(engine.bioforgeRootV80);
  subject.key('keydown', 'KeyD');
  assert.equal(engine.bioforgeAmbulatoryV188, 'egress');
  assert.equal(engine.running, true);
  const exit = engine.doors.find(door => door.id === 'hub-return');
  assert.deepEqual([exit.open, exit.reason], [false, 'decontamination-required']);
  assert.equal(engine.doors.find(door => door.id === 'arena-return').open, true);
  assert.equal(engine.doors.find(door => door.id === 'arena-containment').open, false);
  subject.key('keyup', 'KeyD');
  await walk(subject, 2544); press(subject);
  assert.match(engine.bioforgeLabCaptionV188.text, /INCINÉRATEUR · CYCLE CONFIRMÉ/);
  await walk(subject, 2610); press(subject);
  assert.match(engine.bioforgeLabCaptionV188.text, /ANALYSE · CONFINEMENT TENU/);
  await walk(subject, 2900);
  assert.ok(engine.player.x + engine.player.w <= exit.x + .01, 'the closed exit holds before decontamination');
  await walk(subject, 2700); press(subject);
  assert.equal(engine.bioforgeExitDeconV188.active, true);
  simulate(engine, 1);
  await walk(subject, 2600);
  assert.equal(engine.bioforgeExitDeconV188.interrupted, 1);
  assert.ok(events.some(event => event.type === 'bioforge-exit-decon-interrupted'));
  await walk(subject, 2700); press(subject);
  simulate(engine, BIOFORGE_EXIT_DECON_SECONDS_V188 + .2);
  assert.equal(engine.bioforgeExitDeconV188.complete, true);
  assert.equal(exit.open, true);
  await walk(subject, 2900);
  assert.ok(events.some(event => event.type === 'bioforge-egress-complete'));
  assert.equal(engine.running, false);
  assert.equal(commits.length, savedBefore, 'the exit walk writes nothing');
  assert.equal(JSON.stringify(engine.bioforgeRootV80), durable, 'the session state is unchanged by the walk');
  subject.key('keydown', 'KeyD'); subject.key('keyup', 'KeyD');
  assert.equal(engine.running, false, 'a finished exit is not walked again');
});

test('no exit walk for a downed operator, outside the cell, or after a failed commit', async () => {
  const down = await purgedInCell();
  down.engine.player.alive = false;
  down.key('keydown', 'KeyD'); down.key('keyup', 'KeyD');
  assert.equal(down.engine.running, false);
  const airlock = prepared();
  airlock.engine.armBioforgeAmbulatoryV188(true);
  airlock.engine.start({ configuration: { profileId: 'enemy-007-praetorian', quantity: 1, maxConcurrent: 12 }, seed: 188 });
  await walk(airlock, 335); press(airlock);
  airlock.engine.purgeBioforgeV80('operator-emergency-purge');
  airlock.key('keydown', 'KeyD'); airlock.key('keyup', 'KeyD');
  assert.equal(airlock.engine.running, false, 'from the airlock, the exit stays the terminal');
  const failed = await purgedInCell();
  failed.engine.bioforgeLastErrorV80 = 'persistence-failed';
  failed.key('keydown', 'KeyD'); failed.key('keyup', 'KeyD');
  assert.equal(failed.engine.running, false);
});

test('resume: a session saved during the entry resumes on a fresh engine at the same stage and place', async () => {
  const subject = prepared(), { engine } = subject;
  engine.start({ configuration: { profileId: 'enemy-007-praetorian', quantity: 1, maxConcurrent: 12 }, seed: 188 });
  await walk(subject, 335); press(subject);
  const saved = structuredClone(engine.captureBioforgeResumeStateV80());
  const other = prepared();
  const resumed = other.engine.start({ resumeState: saved.state });
  assert.equal(resumed.started, true);
  assert.equal(other.engine.bioforgeTransferStageV80, 1);
  assert.equal(other.engine.player.x, engine.player.x);
  assert.equal(other.engine.bioforgeAmbulatoryV188, null);
});

test('presentation: balanced drawing, zone signs and tanks drawn, catwalks visible, lab ambience through the V188 VFX pool', async () => {
  const subject = prepared(), { engine, stack, texts } = subject;
  await settle(engine);
  engine.camera.x = 0; engine.draw();
  assert.equal(stack.length, 0);
  for (const label of ['STOCKAGE FROID', 'SALLE DE CONTRÔLE', 'SAS BIOLOGIQUE', 'ADMISSION', 'FILE D’ADMISSION']) assert.ok(texts.includes(label), label);
  texts.length = 0; engine.camera.x = 1300; engine.draw();
  assert.ok(texts.includes('CELLULE DE CONFINEMENT') && texts.includes('PASSERELLE · SPÉCIMENS'));
  texts.length = 0; engine.camera.x = 1600; engine.draw();
  for (const label of ['BAIE D’ANALYSE', 'SAS DE SORTIE', 'INCINÉRATEUR']) assert.ok(texts.includes(label), label);
  assert.ok(texts.some(text => text.startsWith('BIOFORGE · CONFIGURATION')), 'HUD');
  assert.equal(VFX_KINDS_V188.bubble.slot, 'liquid-bubble');
  assert.ok(getSlot('liquid-bubble'));
  const pool = createBioforgeLabVfxV188(), random = (() => { let seed = 7; return () => (seed = (seed * 16807) % 2147483647) / 2147483647; })();
  const view = { cameraX: 800, tanks: [{ state: 'stasis' }, { state: 'drained' }], reducedMotion: false };
  for (let i = 0; i < 120; i++) stepBioforgeLabAmbienceV188(pool, 1 / 60, view, random);
  assert.ok(pool.stats.byKind.bubble > 0, 'bubbles in a filled tank');
  const empty = createBioforgeLabVfxV188();
  for (let i = 0; i < 120; i++) stepBioforgeLabAmbienceV188(empty, 1 / 60, { cameraX: 800, tanks: [{ state: 'drained' }, { state: 'empty' }] }, random);
  assert.equal(empty.stats.byKind.bubble || 0, 0, 'no bubbles in drained or empty tanks');
  assert.ok(pool.count <= pool.cap);
});

test('texts: every lab string the canvas or the status line shows has an English translation', () => {
  useCatalogV185(catalog);
  setLanguageV185('en', { storage: null, document: null, persist: false });
  try {
    const strings = [
      ...BIOFORGE_LAB_ZONES_V188.filter(zone => zone.label !== 'ADMISSION').map(zone => zone.label), ...BIOFORGE_LAB_ZONES_V188.map(zone => zone.detail),
      ...BIOFORGE_LAB_INTERACTIONS_V188.map(entry => entry.prompt), 'E — OUVRIR LE SAS A', 'E — CYCLE D’INTERLOCK', 'E — ARMER L’IMPRIMANTE',
      'PASSERELLE · SPÉCIMENS', 'CUVE VIDE', 'EN STASE ×3', 'PRÉVU ×2', 'IMPRIMÉE', 'FILE D’ADMISSION', 'AUCUNE LIGNE', 'INCINÉRATEUR',
      'STOCKAGE FROID · AUCUN ÉCHANTILLON CONSERVÉ', 'STOCKAGE FROID · 4 ÉCHANTILLON(S) · 2 PROFIL(S)', 'ANALYSE · AUCUNE SESSION ENREGISTRÉE',
      'ANALYSE · CONFINEMENT TENU · 1 IMPRIMÉ(S) · 1 NEUTRALISÉ(S)', 'INCINÉRATEUR · CYCLE CONFIRMÉ · CELLULE STÉRILE', 'DÉCONTAMINATION 53 %',
      'DÉCONTAMINATION TERMINÉE · RETOUR AU TANTALUS AUTORISÉ', 'PURGE CONFIRMÉE · D : REJOINDRE LE SAS DE SORTIE',
      'LABORATOIRE · CONSOLE (E) OU TERMINAL : LANCER LE CYCLE', 'RETOUR AU TANTALUS PAR LE SAS DE SORTIE',
      // Phase labels are read inside the HUD line, split on « · » by the canvas translation.
      ...Object.values(BIOFORGE_LAB_PHASE_LABELS_V188).filter(label => !['CONFIGURATION', 'COMBAT', 'PURGE'].includes(label))
        .map(label => `BIOFORGE · ${label} · CELLULE DE CONFINEMENT`)
    ];
    for (const text of strings) {
      const english = autoTranslateV185(text);
      assert.notEqual(english, text, text);
      assert.doesNotMatch(english, /[ÉÈÀÔÛ]|STOCKAGE|CUVE|SAS |SPÉCIMEN/u, `${text} → ${english}`);
    }
  } finally { setLanguageV185('fr', { storage: null, document: null, persist: false }); }
});

test('integration: composition order, shell, admission and frozen Forge sources', () => {
  const runtime = read('src/bioforge-runtime-v80.js');
  assert.match(runtime, /const BioforgeGameEngineV80 = withBioforgeContainmentLabV188\(withBioforgeRuntimeV80\(GameEngine\)\);/);
  const sw = read('sw.js');
  for (const file of ['bioforge-lab-layout-v188.js', 'bioforge-lab-render-v188.js', 'bioforge-lab-runtime-v188.js']) assert.ok(sw.includes(`'/src/${file}'`), file);
  const release = read('scripts/verify-public-release-v86.mjs');
  for (const path of ['docs/development/BIOFORGE_AUDIT_V188.md', 'scripts/verify-bioforge-lab-v188.mjs', 'scripts/qa-bioforge-lab-v188.mjs',
    'specs/013-bioforge/spec.md', 'specs/013-bioforge/plan.md', 'specs/013-bioforge/tasks.md']) assert.ok(release.includes(`'${path}'`), path);
  assert.match(JSON.parse(read('package.json')).scripts['test:priorities:v188'], /scripts\/verify-bioforge-lab-v188\.mjs/);
  const app = read('src/app.js');
  assert.match(app, /bioforgeRuntimeV80\.armBioforgeAmbulatoryV188\?\.\(true\)/);
  assert.match(app, /event\?\.type === 'bioforge-egress-complete'\) setTimeout\(\(\) => returnBioforgeToHubV80\(\), 0\)/);
  const touched = ['src/bioforge-lab-layout-v188.js', 'src/bioforge-lab-render-v188.js', 'src/bioforge-lab-runtime-v188.js',
    'src/bioforge-runtime-v80.js', 'src/bioforge-level-v80.js', 'src/bioforge-ui-v80.js', 'bioforge-v80.css', 'src/vfx-v188.js', 'src/vfx-slots-v188.js'];
  for (const path of touched) {
    assert.equal(Object.hasOwn(AUDIT_DEFERRED_FORGE_SOURCES_V163, path), false, path);
    assert.equal(Object.hasOwn(AUDIT_DEFERRED_FORGE_SOURCES_V162, path), false, path);
  }
});
