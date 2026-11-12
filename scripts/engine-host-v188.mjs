// V188 shared engine host for Node tests: the production GameEngine with only
// browser APIs replaced; real PNG/WebP byte dimensions are preserved.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content-core-v50.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';

// Production composition, admitted sprites, actual combat and physical maps.
// Only browser APIs are replaced; real PNG/WebP byte dimensions are preserved.
const sizes = new Map();
function size(path) {
  if (sizes.has(path)) return sizes.get(path);
  let result;
  try {
    const bytes = readFileSync(new URL(`..${new URL(path, 'http://qa.invalid').pathname}`, import.meta.url));
    if (bytes.subarray(1, 4).toString() === 'PNG') result = [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
    else if (bytes.subarray(0, 4).toString() === 'RIFF') for (let offset = 12; offset + 8 < bytes.length;) {
      const kind = bytes.subarray(offset, offset + 4).toString(), length = bytes.readUInt32LE(offset + 4), data = offset + 8;
      if (kind === 'VP8X') result = [bytes.readUIntLE(data + 4, 3) + 1, bytes.readUIntLE(data + 7, 3) + 1];
      if (kind === 'VP8L' && bytes[data] === 0x2f) { const packed = bytes.readUInt32LE(data + 1); result = [(packed & 0x3fff) + 1, (packed >>> 14 & 0x3fff) + 1]; }
      if (kind === 'VP8 ' && bytes.subarray(data + 3, data + 6).equals(Buffer.from([0x9d, 1, 0x2a]))) result = [bytes.readUInt16LE(data + 6) & 0x3fff, bytes.readUInt16LE(data + 8) & 0x3fff];
      if (result) break; offset = data + length + (length & 1);
    }
  } catch {}
  if (result) sizes.set(path, result); return result;
}
export function host() {
  const window = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = window[name].bind(window);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, hasFocus: () => true });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 0; naturalHeight = 0;
    set src(path) { this._src = path; const dimensions = size(path); this.naturalWidth = dimensions?.[0] || 0; this.naturalHeight = dimensions?.[1] || 0;
      queueMicrotask(() => { const event = new Event(dimensions ? 'load' : 'error'); this.dispatchEvent(event); this[`on${event.type}`]?.(event); }); }
    get src() { return this._src; } async decode() { if (!this.naturalWidth) throw Error('Missing shipped bitmap'); }
  };
  const text = [], draws = [], stack = [], gradient = { addColorStop() {} };
  const ctx = new Proxy({ globalAlpha: 1, save() { stack.push(this.globalAlpha); }, restore() { assert.ok(stack.length); this.globalAlpha = stack.pop(); },
    fillText(value) { text.push(String(value)); }, drawImage(image, ...args) { assert.ok(image.naturalWidth > 0); draws.push({ path: image.src, args }); },
    measureText: value => ({ width: String(value).length * 7 }), createLinearGradient: () => gradient, createRadialGradient: () => gradient,
    getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 }) }, { get: (object, key) => key in object ? object[key] : () => {} });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  return { canvas, ctx, text, draws, stack };
}
export async function prepare(engine) {
  for (let n = 0; n < 8; n++) await Promise.resolve();
  await Promise.all((engine.getVisibleEnemyAtlasSheetsV65?.() || []).map(sheet => engine.ensureEnemyAtlas(sheet)));
  for (let n = 0; n < 8; n++) await Promise.resolve(); engine.refreshEnemyAtlasAvailabilityV65();
  assert.equal(engine.enemyAtlasLoadingPausedV65, false);
}
export function tick(engine, seconds, rate = 60) {
  for (let remaining = seconds; remaining > 1e-9;) { const dt = Math.min(remaining, 1 / rate); engine.update(dt); remaining -= dt; }
}
export async function fixture({ campaign = CAMPAIGNS[0], seed = 1321, options: extra = {} } = {}) {
  const browser = host(), events = [];
  const options = { world: WORLDS[0], campaign, weapon: WEAPONS[0], enemyCatalog: ENEMIES, equipment: [], crew: [], seed, ...extra };
  options.missionLevel = buildMissionLevelV52({ ...options, templateId: 'ship-interior-vertical', levelSeeds: LEVEL_SEEDS });
  const engine = new GameEngine(browser.canvas, { onEvent: event => events.push(event) }); engine.start(options); await prepare(engine);
  engine.enemies = []; engine.squadActors = []; engine.hazards = []; engine.coopEnabled = false;
  return { ...browser, engine, events };
}
