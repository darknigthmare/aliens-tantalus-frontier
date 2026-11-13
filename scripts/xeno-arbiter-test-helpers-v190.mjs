import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, WEAPONS, ENEMIES } from '../src/content.js';
import { ARBITER_CAMPAIGNS_V190, ARBITER_MISSIONS_V190, normalizeArbiterCampaignProgressV190,
  createArbiterReceiptV190 } from '../src/xeno-arbiter-campaign-v190.js';
import { buildArbiterMissionV190 } from '../src/xeno-arbiter-runtime-v190.js';

// Declared host substitutes: DOM, successful synthetic Image objects, RAF and
// Canvas. All mission travel, holding, collision, completion, receipts and
// snapshot validation below run the production engine. Imported prior returns
// are setup fixtures for selecting a later chapter, never played victories.
function previousProgress(index) {
  return normalizeArbiterCampaignProgressV190({ schema: 190,
    completedCampaignIds: ARBITER_CAMPAIGNS_V190.slice(0, index).map(c => c.id),
    returns: ARBITER_MISSIONS_V190.slice(0, index).map((m, i) => ({ campaignId: m.campaignId,
      operationId: `operation-${i + 1}-${m.campaignId}`, receipt: createArbiterReceiptV190(m) })) });
}
function fixture(index = 0, extra = {}) {
  const host = new EventTarget();
  for (const key of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[key] = host[key].bind(host);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 1024; naturalHeight = 1024; width = 1024; height = 1024;
    decode() { return Promise.resolve(); }
    set src(value) { this._src = value; queueMicrotask(() => this.dispatchEvent(new Event('load'))); }
    get src() { return this._src; }
  };
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  const canvas = Object.assign(new EventTarget(), { getContext: () => ({}), width: 1280, height: 720,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const events = [], campaign = ARBITER_CAMPAIGNS_V190[index], mission = ARBITER_MISSIONS_V190[index];
  const options = { campaign, world: WORLDS.find(w => w.id === campaign.worldId), weapon: WEAPONS[0], enemyCatalog: ENEMIES,
    equipment: [], crew: [], operationId: `operation-${index + 1}-${campaign.id}`, seed: 190 + index, missionLevel: buildArbiterMissionV190({ campaign }),
    arbiterProgressV190: previousProgress(index), ...extra };
  let victory = null;
  const engine = new GameEngine(canvas, { onEvent: event => {
    events.push(event); if (event.type === 'mission-complete') victory = { event: structuredClone(event), resumeState: engine.captureResumeState(), report: engine.getGameplayReport() };
  } });
  engine.start(options);
  const key = (type, code) => {
    const event = new Event(type, { cancelable: true }); Object.assign(event, { code, repeat: false, ctrlKey: false, altKey: false, metaKey: false });
    host.dispatchEvent(event);
  };
  return { engine, campaign, mission, events, options, key, victory: () => victory };
}
function tick(engine, seconds) {
  for (let remaining = seconds; remaining > 1e-9;) { const dt = Math.min(1 / 60, remaining); engine.update(dt); remaining -= dt; }
}
function walk(f, target) {
  const direction = target > f.engine.player.x + f.engine.player.w / 2 ? 'KeyD' : 'KeyA';
  f.key('keydown', direction);
  for (let frame = 0; frame < 2000 && Math.abs(f.engine.player.x + f.engine.player.w / 2 - target) > 12; frame++) tick(f.engine, 1 / 60);
  f.key('keyup', direction); tick(f.engine, .25);
  assert.ok(Math.abs(f.engine.player.x + f.engine.player.w / 2 - target) < 40, `Native walk missed ${target}: ${f.engine.player.x}`);
}
function hold(f, station, seconds = station.seconds + .1) {
  walk(f, station.x); f.key('keydown', 'KeyE'); tick(f.engine, seconds); f.key('keyup', 'KeyE'); tick(f.engine, .05);
}
function finish(f) {
  for (const station of f.mission.stations) hold(f, station);
  hold(f, f.mission.extraction);
  assert.equal(f.engine.mission.state, 'complete'); assert.equal(f.engine.arbiterV190.complete, true);
}

export { previousProgress, fixture, tick, walk, hold, finish };
