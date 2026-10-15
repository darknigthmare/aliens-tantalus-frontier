import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, WEAPONS, EQUIPMENT, ENEMIES, CREW, LEVEL_SEEDS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { attachCrewDeploymentV85 } from '../src/crew-runtime-v85.js';
import { createDefaultSave, migrateSave, sanitizeOperationResumeState } from '../src/save.js';
import { createNarrativeArchivesV68, discoverNarrativeCollectableV68, markNarrativeCollectableReadV68,
  NARRATIVE_COLLECTABLES_V68, recordNarrativeDecisionV68 } from '../src/narrative-collectables-v68.js';
import { ARCHIVE_RELAY_DOCUMENT_IDS_V122, ARCHIVE_RELAY_CAMPAIGN_V122 } from '../src/archive-relay-state-v122.js';
import { buildArchiveRelayLevelV122, ARCHIVE_RELAY_PROPS_V122 } from '../src/archive-relay-runtime-v122.js';
import { normalizeNarrativeArchivesUiStateV68 } from '../src/narrative-archives-ui-v68.js';
import { FIELD_EVIDENCE_V132, NARRATIVE_EVIDENCE_RECORDS_V132, NARRATIVE_EVIDENCE_CHAINS_V132,
  NARRATIVE_EVIDENCE_RELATIONS_V132, createNarrativeEvidenceV132, normalizeNarrativeEvidenceV132,
  validateNarrativeEvidenceV132, getNarrativeEvidenceModelV132, markNarrativeEvidenceReadV132,
  recordNarrativeEvidenceDecisionV132, markNarrativeMediaPlayedV132, resolveNarrativeMediaPlaybackV132 } from '../src/narrative-evidence-v132.js';

const scanner = EQUIPMENT.find(item => item.name === 'Pathogen Scanner');
const campaign = CAMPAIGNS.find(item => !item.id.startsWith('special-'));
function fixture(template = 'ship-interior-vertical', save = { narrativeArchives: createNarrativeArchivesV68() }, options = {}) {
  const windowEvents = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = windowEvents[name].bind(windowEvents);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 1024; naturalHeight = 1024; width = 1024; height = 1024;
    async decode() {}
    set src(value) {
      this._src = value;
      try { const data = readFileSync(new URL(`..${new URL(value, 'http://qa.invalid').pathname}`, import.meta.url));
        if (data.subarray(1, 4).toString() === 'PNG') {
          this.naturalWidth = this.width = data.readUInt32BE(16); this.naturalHeight = this.height = data.readUInt32BE(20);
        }
      } catch { /* Browser APIs only. */ }
      queueMicrotask(() => { this.dispatchEvent(new Event('load')); this.onload?.(); });
    }
    get src() { return this._src; }
  };
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  const context = new Proxy({ measureText: value => ({ width: String(value).length * 7 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) },
  { get: (target, property) => property in target ? target[property] : () => {} });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => context,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const events = [], world = WORLDS.find(item => item.id === 'world-05-lethe') || WORLDS[0];
  const chosen = options.campaign || campaign;
  const level = options.missionLevel || buildMissionLevelV52({ campaign: chosen, world, templateId: template, levelSeeds: LEVEL_SEEDS, seed: 132 });
  const engine = new GameEngine(canvas, { onEvent: event => events.push(event) });
  const mutations = [];
  const start = { campaign: chosen, world, missionLevel: level, weapon: WEAPONS[0], enemyCatalog: ENEMIES.slice(0, 1),
    crew: [], equipment: [scanner], seed: 132, narrativeArchiveSave: save,
    onNarrativeArchivesChange: (...value) => mutations.push(value), ...options };
  engine.start(start);
  return { engine, save, events, mutations, start };
}
function near(engine, item, actor = engine.player) {
  Object.assign(actor, { x: item.x - 36, y: item.y + item.h - actor.h, vx: 0, vy: 0, grounded: true,
    reloading: false, fireClock: 0, interactionClock: 0, toolUseClock: 0, meleeClock: 0 });
}
function simulate(engine, duration) {
  for (let remaining = duration; remaining > 1e-9;) { const delta = Math.min(remaining, 1 / 120); engine.update(delta); remaining -= delta; }
}
function quiet(engine) {
  engine.enemies = []; engine.hazards = []; engine.missionLevelSpawns?.clear(); engine.missionLevelEvents?.clear();
}
function legacyQz17(save) {
  for (const entry of NARRATIVE_COLLECTABLES_V68) {
    assert.equal(discoverNarrativeCollectableV68(save, entry.id).applied, true);
    assert.equal(markNarrativeCollectableReadV68(save, entry.id).applied, true);
  }
}
function qz18Archive() {
  return { schema: 122, case: { id: 'qz18-last-relay', operationId: 'operation-1-special-archive-relay',
    verdict: 'delayed-distress', documentIds: [...ARCHIVE_RELAY_DOCUMENT_IDS_V122], completedDay: 1, completedHour: 9 } };
}

test('six new records form three exact linked investigations with explicit original provenance and qualified identity limits', () => {
  assert.equal(FIELD_EVIDENCE_V132.length, 6); assert.equal(NARRATIVE_EVIDENCE_RECORDS_V132.length, 16);
  assert.equal(NARRATIVE_EVIDENCE_CHAINS_V132.length, 3);
  const ids = new Set(NARRATIVE_EVIDENCE_RECORDS_V132.map(entry => entry.id));
  const claims = new Set(NARRATIVE_EVIDENCE_RECORDS_V132.flatMap(entry => entry.claims.map(item => item.id)));
  for (const chain of NARRATIVE_EVIDENCE_CHAINS_V132) {
    assert.equal(chain.requirements.length, 6); assert.ok(chain.requirements.every(id => ids.has(id)));
    assert.ok(Object.isFrozen(chain));
  }
  for (const relation of NARRATIVE_EVIDENCE_RELATIONS_V132) {
    assert.ok(claims.has(relation.fromClaimId)); assert.ok(claims.has(relation.toClaimId));
  }
  for (const record of NARRATIVE_EVIDENCE_RECORDS_V132) {
    assert.equal(record.canonExact, false); assert.equal(record.provenance, 'tantalus-project-original');
    assert.ok(Object.isFrozen(record)); assert.equal(record.audioPath, undefined); assert.equal(record.videoPath, undefined);
  }
  assert.match(NARRATIVE_EVIDENCE_CHAINS_V132.find(entry => entry.id === 'distress-audit-v132').conclusion, /non identifié/);
});

test('old QZ-17 discoveries/routes and the six permanent QZ-18 records migrate without granting a new currency bonus', () => {
  const save = createDefaultSave(); legacyQz17(save);
  assert.equal(recordNarrativeDecisionV68(save, 'follow-maintenance-trace').applied, true);
  save.archiveRelayArchivesV122 = qz18Archive();
  const resources = JSON.stringify(save.resources), oldFlags = [...save.narrativeArchives.unlockedFlags];
  save.narrativeEvidenceV132 = normalizeNarrativeEvidenceV132(null, save);
  assert.equal(Object.keys(save.narrativeEvidenceV132.discovered).length, 10);
  assert.equal(save.narrativeEvidenceV132.readIds.length, 10);
  assert.equal(recordNarrativeEvidenceDecisionV132(save, 'record-distress-audit-v132').applied, true);
  assert.equal(recordNarrativeEvidenceDecisionV132(save, 'record-distress-audit-v132').applied, false);
  const restored = migrateSave(JSON.parse(JSON.stringify(save)));
  assert.deepEqual(restored.narrativeArchives.unlockedFlags, oldFlags);
  assert.equal(restored.narrativeEvidenceV132.decisions['distress-audit-v132'], 'record-distress-audit-v132');
  assert.equal(JSON.stringify(save.resources), resources);
  assert.deepEqual(restored.narrativeEvidenceV132, save.narrativeEvidenceV132);
});

test('hidden or uncollected records and unavailable media do not leak into the archive reader', () => {
  const state = normalizeNarrativeArchivesUiStateV68(getNarrativeEvidenceModelV132({}));
  assert.equal(state.entries.length, 0); assert.equal(state.relations.length, 0); assert.equal(state.qualifications.length, 0);
  assert.equal(state.decisions.filter(entry => entry.available).length, 0);
  assert.equal(markNarrativeMediaPlayedV132({}, 'echo9-blackbox-v132').applied, false);
  assert.equal(resolveNarrativeMediaPlaybackV132({ id: 'echo9-blackbox-v132', available: true, audioPath: '/fake.mp3' }), null);
});

test('all six ordinary-mission clues sit on real supports, avoid native interactions, and appear as optional local goals', () => {
  const all = new Set();
  for (const template of ['ship-interior-vertical', 'colony-multiroute', 'planet-exterior']) {
    const { engine } = fixture(template); assert.equal(engine.evidenceActorsV132.length, 2, template);
    const objectivesBefore = { ...engine.mission.objectives };
    for (const item of engine.evidenceActorsV132) {
      const surface = engine.platforms.find(entry => entry.id === item.surfaceId); assert.ok(surface);
      assert.equal(item.y + item.h, surface.y); assert.ok(item.x >= surface.x && item.x + item.w <= surface.x + surface.w);
      all.add(item.id);
    }
    assert.equal(engine.getNarrativeEvidenceObjectivesV132().length, 2);
    const map = engine.missionNavigationMapV121(); assert.ok(map.goals.filter(goal => goal.optional).length >= 2);
    assert.deepEqual(engine.mission.objectives, objectivesBefore);
  }
  assert.equal(all.size, 6);
});

test('real E collection requires proximity and a clear path, records once, opens the matching archive and grants no intel', () => {
  const { engine, save, events, mutations } = fixture(); quiet(engine);
  const item = engine.evidenceActorsV132.find(entry => entry.id === 'cargo-service-queue-v132'), intel = engine.inventory.intel;
  assert.equal(engine.collectNarrativeEvidenceV132(engine.player, item.id), false);
  near(engine, item);
  engine.walls.push({ id: 'evidence-occluder', x: item.x - 10, y: item.y - 150, w: 4, h: 150 });
  assert.equal(engine.collectNarrativeEvidenceV132(engine.player, item.id), false);
  engine.walls = engine.walls.filter(wall => wall.id !== 'evidence-occluder');
  assert.match(engine.getInteractionPrompt(), /RÉCUPÉRER/); assert.equal(engine.interact(), true);
  assert.ok(save.narrativeEvidenceV132.discovered[item.id]); assert.equal(engine.inventory.intel, intel);
  assert.equal(engine.getNarrativeEvidenceObjectivesV132().length, 1); assert.equal(mutations.length, 1);
  assert.ok(events.some(event => event.type === 'archive-reader-open' && event.collectableId === item.id));
  engine.player.interactionClock = 0; assert.equal(engine.collectNarrativeEvidenceV132(engine.player, item.id), false);
  assert.equal(mutations.length, 1); assert.equal(engine.inventory.intel, intel);
});

test('pause, loading, reload, climb and inactive coop cannot record physical evidence through a direct action', () => {
  for (const condition of ['pause', 'loading', 'reload', 'climb', 'coop']) {
    const { engine, save } = fixture(); const item = engine.evidenceActorsV132[0];
    const actor = condition === 'coop' ? engine.coop : engine.player; near(engine, item, actor);
    if (condition === 'pause') engine.togglePause();
    if (condition === 'loading') engine.enemyAtlasLoadingPausedV65 = true;
    if (condition === 'reload') actor.reloading = true;
    if (condition === 'climb') actor.climbing = true;
    assert.equal(engine.collectNarrativeEvidenceV132(actor, item.id), false, condition);
    assert.equal(Object.keys(save.narrativeEvidenceV132.discovered).length, 0);
  }
});

test('the field residue is obtained only after the real native scanner transaction, using exactly one charge', () => {
  const { engine, save } = fixture('planet-exterior'); quiet(engine);
  const item = engine.evidenceActorsV132.find(entry => entry.requiresAction), equipment = engine.equipmentActions.get(scanner.id);
  assert.equal(equipment.action, 'deep-scan'); near(engine, item); const remaining = equipment.remaining;
  assert.equal(engine.collectNarrativeEvidenceV132(engine.player, item.id), false);
  assert.equal(engine.collectNarrativeEvidenceV132(engine.player, item.id, { scan: true }), false, 'A caller-provided scan flag cannot certify analysis.');
  assert.equal(engine.interact(), true); assert.equal(equipment.remaining, remaining);
  simulate(engine, .4); engine.togglePause(); const progress = engine.fieldActionsV124.get(engine.player).elapsed;
  simulate(engine, 1); assert.equal(engine.fieldActionsV124.get(engine.player).elapsed, progress);
  engine.togglePause(); simulate(engine, .6);
  assert.equal(equipment.remaining, remaining - 1); assert.equal(engine.fieldEffects.scans, 1);
  assert.ok(save.narrativeEvidenceV132.discovered[item.id]); assert.equal(engine.fieldActionsV124.size, 0);
});

test('cancelled and occluded native scans do not grant a sample or consume a scanner charge', () => {
  for (const condition of ['movement', 'wall', 'resume']) {
    const { engine, save } = fixture('planet-exterior'); quiet(engine);
    const item = engine.evidenceActorsV132.find(entry => entry.requiresAction), equipment = engine.equipmentActions.get(scanner.id);
    near(engine, item); const remaining = equipment.remaining;
    assert.equal(engine.interact(), true); simulate(engine, .2);
    if (condition === 'movement') engine.keys.add('KeyD');
    if (condition === 'wall') engine.walls.push({ id: 'scan-wall', x: item.x - 10, y: item.y - 130, w: 5, h: 130 });
    if (condition === 'resume') assert.equal(engine.applyResumeState(JSON.parse(JSON.stringify(engine.captureResumeState()))).applied, true);
    simulate(engine, 1);
    assert.equal(equipment.remaining, remaining); assert.equal(save.narrativeEvidenceV132.discovered[item.id], undefined, condition);
  }
});

test('J2 with a personal scan kit spends that actual kit charge instead of the global equipment stock', () => {
  const { engine, save, events } = fixture('planet-exterior'); quiet(engine); engine.setCoop(true);
  assert.equal(attachCrewDeploymentV85(engine.coop, { ...CREW[1], gearV85: [
    { instanceId: 'personal-scan-v132', catalogId: 'equipment-001-motion-tracker', kind: 'equipment' }
  ] }), true);
  const item = engine.evidenceActorsV132.find(entry => entry.requiresAction), equipment = engine.equipmentActions.get(scanner.id);
  near(engine, item, engine.coop);
  const remaining = equipment.remaining, personal = engine.coop.crewV85.charges['personal-scan-v132'];
  assert.equal(engine.interact(engine.coop), true); simulate(engine, 1);
  assert.equal(engine.coop.crewV85.charges['personal-scan-v132'], personal - 1,
    JSON.stringify(events.filter(event => event.type.startsWith('field-action')))); assert.equal(equipment.remaining, remaining);
  assert.ok(save.narrativeEvidenceV132.discovered[item.id]);
});

test('evidence and reads persist across ordinary ship/colony/planet deployments and conclusions demand every linked record', () => {
  const save = { narrativeArchives: createNarrativeArchivesV68() }; legacyQz17(save);
  for (const template of ['ship-interior-vertical', 'colony-multiroute', 'planet-exterior']) {
    const { engine } = fixture(template, save); quiet(engine);
    for (const item of engine.evidenceActorsV132) {
      near(engine, item); assert.equal(engine.interact(), true);
      if (item.requiresAction) simulate(engine, 1);
      assert.equal(markNarrativeEvidenceReadV132(save, item.id).applied, true);
    }
    engine.stop();
  }
  assert.equal(Object.keys(save.narrativeEvidenceV132.discovered).length, 10);
  for (const option of ['record-cargo-route-v132', 'record-quarantine-custody-v132']) assert.equal(recordNarrativeEvidenceDecisionV132(save, option).applied, true);
  const model = getNarrativeEvidenceModelV132(save), ui = normalizeNarrativeArchivesUiStateV68(model);
  assert.ok(ui.relations.length >= 4); assert.ok(ui.qualifications.length >= 2);
  assert.ok(model.chains.filter(chain => chain.complete).length === 2);
  const restarted = fixture('ship-interior-vertical', save).engine;
  assert.equal(restarted.getNarrativeEvidenceObjectivesV132().length, 0);
  const restored = migrateSave({ ...createDefaultSave(), ...save });
  assert.deepEqual(restored.narrativeEvidenceV132.decisions, save.narrativeEvidenceV132.decisions);
});

test('actual black-box frames stop on pause/loading, remain seekable after JSON/save migration, and are never an invented audio/video file', () => {
  const { engine, save } = fixture(); quiet(engine); const item = engine.evidenceActorsV132.find(entry => entry.id === 'qz17-service-cache-v132');
  near(engine, item); simulate(engine, .6);
  const before = JSON.stringify(engine.evidenceFrameBufferV132);
  engine.togglePause(); simulate(engine, 1); assert.equal(JSON.stringify(engine.evidenceFrameBufferV132), before); engine.togglePause();
  engine.enemyAtlasLoadingPausedV65 = true; engine.update(.6); assert.equal(JSON.stringify(engine.evidenceFrameBufferV132), before);
  engine.enemyAtlasLoadingPausedV65 = false;
  assert.equal(engine.interact(), true);
  const media = normalizeNarrativeArchivesUiStateV68(getNarrativeEvidenceModelV132(save)).entries.find(entry => entry.id === item.id).media;
  assert.ok(media); assert.equal(media.capture.origin, 'live-game-telemetry'); assert.ok(media.capture.frames.length >= 2);
  const observation = media.capture.frames.at(-1).actors.find(actor => actor.role === 'operator');
  assert.equal(observation.x, engine.player.x); assert.equal(observation.y, engine.player.y);
  assert.equal(media.audioPath, undefined); assert.equal(media.videoPath, undefined);
  assert.equal(markNarrativeMediaPlayedV132(save, media.id).applied, true);
  const native = JSON.parse(JSON.stringify(engine.captureResumeState())), normalized = sanitizeOperationResumeState(native);
  assert.deepEqual(normalized.narrativeEvidenceV132.mediaCaptures, save.narrativeEvidenceV132.mediaCaptures);
  assert.equal(engine.applyResumeState(normalized).applied, true);
  const migrated = migrateSave({ ...createDefaultSave(), ...save });
  assert.deepEqual(migrated.narrativeEvidenceV132.mediaCaptures, save.narrativeEvidenceV132.mediaCaptures);
  assert.deepEqual(migrated.narrativeEvidenceV132.playedIds, [media.id]);
});

test('injected records, false conclusions and malformed captures are rejected before changing any resumed gameplay state', () => {
  const { engine, save } = fixture(); const health = engine.player.health, intel = engine.inventory.intel;
  for (const injected of ['record', 'decision', 'media', 'journal']) {
    const raw = JSON.parse(JSON.stringify(engine.captureResumeState())); raw.player.health = 1; raw.inventory.intel = 999999;
    if (injected === 'record') raw.narrativeEvidenceV132.discovered['unknown-record'] = { id: 'unknown-record' };
    if (injected === 'decision') raw.narrativeEvidenceV132.decisions['distress-audit-v132'] = 'record-distress-audit-v132';
    if (injected === 'media') raw.narrativeEvidenceV132.mediaCaptures['echo9-blackbox-v132'] = { schema: 132, audioPath: '/not-present.mp3' };
    if (injected === 'journal') raw.narrativeEvidenceV132.journal.push('conclusion:invented');
    assert.equal(validateNarrativeEvidenceV132(raw.narrativeEvidenceV132, save).valid, false, injected);
    assert.equal(engine.applyResumeState(raw).applied, false, injected);
    assert.equal(engine.player.health, health); assert.equal(engine.inventory.intel, intel);
  }
});

test('a rewind keeps committed global evidence while an old save without the V132 namespace remains compatible', () => {
  const { engine, save } = fixture(); quiet(engine);
  const earlier = JSON.parse(JSON.stringify(engine.captureResumeState())), item = engine.evidenceActorsV132[1];
  near(engine, item); assert.equal(engine.interact(), true); assert.equal(markNarrativeEvidenceReadV132(save, item.id).applied, true);
  assert.equal(engine.applyResumeState(earlier).applied, true);
  assert.ok(save.narrativeEvidenceV132.discovered[item.id]); assert.ok(save.narrativeEvidenceV132.readIds.includes(item.id));
  delete earlier.narrativeEvidenceV132;
  assert.equal(engine.applyResumeState(earlier).applied, true); assert.ok(save.narrativeEvidenceV132.discovered[item.id]);
});

test('failed storage commit rolls back the evidence ledger and leaves the physical pickup available for a concrete retry', () => {
  const { engine, save } = fixture('ship-interior-vertical', {}, { onNarrativeArchivesChange() { throw new Error('Storage unavailable'); } });
  const item = engine.evidenceActorsV132[1]; near(engine, item);
  assert.equal(engine.interact(), false); assert.equal(save.narrativeEvidenceV132.discovered[item.id], undefined);
  assert.equal(engine.getNarrativeEvidenceObjectivesV132().length, 2);
  engine.evidencePersistV132 = () => {};
  assert.equal(engine.interact(), true); assert.ok(save.narrativeEvidenceV132.discovered[item.id]);
});

test('dedicated QZ-18 terminal reads feed the transverse journal through their native proximity/power/reader contract', () => {
  const world = WORLDS.find(item => item.id === ARCHIVE_RELAY_CAMPAIGN_V122.worldId);
  const plan = buildArchiveRelayLevelV122({ campaign: ARCHIVE_RELAY_CAMPAIGN_V122, world, levelSeeds: LEVEL_SEEDS, seed: 132 });
  const { engine, save } = fixture('colony-multiroute', {}, { campaign: ARCHIVE_RELAY_CAMPAIGN_V122, missionLevel: plan });
  assert.equal(engine.evidenceActorsV132.length, 0, 'Dedicated stations remain the source of truth.');
  const point = ARCHIVE_RELAY_PROPS_V122.pda;
  Object.assign(engine.player, { x: point.x - engine.player.w / 2, y: point.groundY - engine.player.h, grounded: true });
  assert.equal(engine.interact(), true);
  assert.equal(engine.markArchiveRelayReadV122('pda-custody').applied, true);
  assert.ok(save.narrativeEvidenceV132.discovered['qz18-pda-custody']);
  assert.ok(save.narrativeEvidenceV132.readIds.includes('qz18-pda-custody'));
  assert.equal(engine.markArchiveRelayReadV122('freight-draft').applied, false);
  assert.equal(save.narrativeEvidenceV132.discovered['qz18-freight-draft'], undefined);
});
