import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

import { GameEngine } from '../src/game-v51-runtime.js';
import {
  MISSION_ARCHIVE_ART_V56,
  MISSION_DROP_ART_V56,
  MISSION_HAZARD_ART_V56,
  MISSION_INTERACTIVE_ART_ASSET_COUNT_V56,
  MISSION_INTERACTIVE_ART_FILES_V56
} from '../src/mission-interactive-art-v56.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1024;
    this.naturalHeight = 1024;
  }
  set src(value) {
    this.currentSrc = value;
    if (value.includes('/drops/') || value.includes('/terminals/')) {
      this.naturalWidth = 512;
      this.naturalHeight = 512;
    } else if (value.endsWith('flood-waterline-tiles.png')) {
      this.naturalHeight = 512;
    } else if (value.endsWith('vacuum-frost-debris-overlay.png')) {
      this.naturalWidth = 1280;
      this.naturalHeight = 720;
    }
  }
}

function contextLog() {
  const draws = [];
  const operations = [];
  let fills = 0;
  const base = {
    drawImage: (image, ...args) => draws.push({ path: image?.currentSrc, args }),
    fillRect: () => { fills += 1; },
    ...Object.fromEntries(['save', 'restore', 'beginPath', 'rect', 'clip'].map(name =>
      [name, (...args) => operations.push([name, ...args])]))
  };
  const ctx = new Proxy(base, {
    get: (target, key) => key in target ? target[key] : () => {},
    set: (target, key, value) => { target[key] = value; return true; }
  });
  return { ctx, draws, operations, fillCount: () => fills,
    reset: () => { draws.length = 0; operations.length = 0; fills = 0; } };
}

// Read-only native PNG decoding: protect measured water bands against an asset
// replacement, without accepting mocked dimensions or a duplicated manifest.
function decodeRgbaPng(bytes) {
  assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.equal(bytes[24], 8); assert.equal(bytes[25], 6); assert.equal(bytes[28], 0);
  const chunks = [];
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const size = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8);
    assert.ok(offset + size + 12 <= bytes.length);
    if (type === 'IDAT') chunks.push(bytes.subarray(offset + 8, offset + 8 + size));
    offset += size + 12;
    if (type === 'IEND') break;
  }
  const packed = inflateSync(Buffer.concat(chunks)), stride = width * 4, pixels = Buffer.alloc(stride * height);
  assert.equal(packed.length, (stride + 1) * height);
  const paeth = (a, b, c) => {
    const p = a + b - c, da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c);
    return da <= db && da <= dc ? a : db <= dc ? b : c;
  };
  let source = 0;
  for (let y = 0; y < height; y++) {
    const filter = packed[source++]; assert.ok(filter <= 4);
    for (let x = 0; x < stride; x++) {
      const pos = y * stride + x, a = x >= 4 ? pixels[pos - 4] : 0, b = y ? pixels[pos - stride] : 0;
      const c = y && x >= 4 ? pixels[pos - stride - 4] : 0;
      pixels[pos] = (packed[source + x] + [0, a, b, Math.floor((a + b) / 2), paeth(a, b, c)][filter]) & 255;
    }
    source += stride;
  }
  return { width, height, pixels };
}

function withImages(run) {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame
  };
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try { return run(); }
  finally { Object.assign(globalThis, previous); }
}

test('les seize assets interactifs v56 ont des contrats de grille uniques et des fichiers réels', () => {
  const files = Object.values(MISSION_INTERACTIVE_ART_FILES_V56);
  assert.equal(MISSION_INTERACTIVE_ART_ASSET_COUNT_V56, 16);
  assert.equal(files.length, 16);
  assert.equal(new Set(files).size, 16);
  assert.deepEqual(Object.keys(MISSION_HAZARD_ART_V56), ['fire', 'steam', 'radiation', 'darkness', 'flood', 'vacuum']);
  assert.deepEqual(Object.keys(MISSION_DROP_ART_V56), ['ammo', 'armor', 'medkit', 'salvage', 'security-key']);
  assert.deepEqual(Object.keys(MISSION_ARCHIVE_ART_V56), ['ship-interior-vertical', 'colony-multiroute', 'planet-exterior']);
  for (const file of files) assert.ok(existsSync(path.join(ROOT, file.slice(1))), file);
});

test('Ceto measured water bands match the visible alpha of all eight native bitmap cells', () => {
  const profile = MISSION_HAZARD_ART_V56.flood;
  const image = decodeRgbaPng(readFileSync(path.join(ROOT, profile.world.path.slice(1))));
  assert.deepEqual([image.width, image.height], [1024, 512]);
  assert.equal(profile.cetoHorizontalInset, 2, 'Omit only the baked two-pixel pale cell boundaries');
  assert.equal(profile.cetoVisibleBands.length, profile.world.frameCount);
  assert.ok(Object.isFrozen(profile.cetoVisibleBands));
  for (let frame = 0; frame < profile.world.frameCount; frame++) {
    let top = 256, bottom = 0;
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      const px = frame % 4 * 256 + x, py = Math.floor(frame / 4) * 256 + y;
      if (image.pixels[(py * image.width + px) * 4 + 3] < 16) continue;
      top = Math.min(top, y); bottom = Math.max(bottom, y + 1);
    }
    assert.deepEqual(profile.cetoVisibleBands[frame], [top, bottom], `native frame ${frame}`);
    assert.ok(Object.isFrozen(profile.cetoVisibleBands[frame]));
  }
});

test('Ceto deep water aligns each measured native bitmap band with the real habitat surface and bed', () => withImages(() => {
  const log = contextLog(), game = new GameEngine({ width: 1280, height: 720, getContext: () => log.ctx, addEventListener() {} });
  const profile = MISSION_HAZARD_ART_V56.flood;
  const bands = [[150, 198], [148, 200], [144, 205], [143, 205], [142, 207], [149, 200], [137, 211], [151, 197]];
  for (let frame = 0; frame < 8; frame++) {
    log.reset(); game.animationTime = frame / profile.fps; game.reducedMotion = false;
    game.drawHazard(log.ctx, { kind: 'flood', active: true, x: 100, y: 413, w: 957, h: 136, cetoHabitatId: 'ceto-cave-tidal-basin-v75' });
    const water = log.draws.filter(draw => draw.path === profile.world.path);
    assert.equal(water.length, 4);
    water.forEach((draw, tile) => assert.deepEqual(draw.args, [(frame % 4) * 256 + 2, Math.floor(frame / 4) * 256 + bands[frame][0],
      252, bands[frame][1] - bands[frame][0], 100 + tile * 256, 413, 256, 136]));
    assert.deepEqual(log.operations, [['save'], ['beginPath'], ['rect', 100, 413, 957, 136], ['clip'], ['restore']],
      'The final partial tile and surface ripples stay clipped to the authored habitat');
    assert.equal(log.fillCount(), 0, 'Reuse native bitmap, not a replacement procedural water asset');
  }
  log.reset(); game.animationTime = 0;
  game.drawHazard(log.ctx, { kind: 'flood', active: true, x: 100, y: 500, w: 220, h: 20 });
  assert.deepEqual(log.draws[0].args.slice(0, 4), [256, 0, 256, 256], 'Unrelated shallow flood cells and spatial frame offsets remain unchanged');
}));

test('Ceto water respects reduced motion, wraps frames and safely falls back for a different or unavailable atlas', () => withImages(() => {
  const log = contextLog(), game = new GameEngine({ width: 1280, height: 720, getContext: () => log.ctx, addEventListener() {} });
  const profile = MISSION_HAZARD_ART_V56.flood;
  const hazard = { kind: 'flood', active: true, x: 100, y: 413, w: 190, h: 136, cetoHabitatId: 'ceto-cave-tidal-basin-v75' };
  game.animationTime = 9 / profile.fps;
  game.drawHazard(log.ctx, hazard);
  assert.deepEqual(log.draws[0].args.slice(0, 4), [258, 148, 252, 52]);
  log.reset(); game.reducedMotion = true;
  game.drawHazard(log.ctx, hazard);
  assert.deepEqual(log.draws[0].args.slice(0, 4), [2, 150, 252, 48]);
  const image = game.images.get(profile.world.key);
  log.reset(); image.naturalWidth = 2048; image.naturalHeight = 1024;
  game.drawHazard(log.ctx, hazard);
  assert.deepEqual(log.draws[0].args.slice(0, 4), [0, 0, 512, 512], 'Native measured bands must not crop an unknown atlas size');
  log.reset(); image.complete = false;
  game.drawHazard(log.ctx, hazard);
  assert.equal(log.draws.filter(draw => draw.path === profile.world.path).length, 0);
  assert.equal(log.draws.filter(draw => draw.path === profile.accent.path).length, 1);
  log.reset(); game.drawHazard(log.ctx, { ...hazard, active: false });
  assert.equal(log.draws.length, 0); assert.equal(log.operations.length, 0);
  log.reset(); game.drawHazard(log.ctx, { ...hazard, kind: 'fire', cetoHabitatId: undefined });
  const regularFire = structuredClone(log.draws);
  log.reset(); game.drawHazard(log.ctx, { ...hazard, kind: 'fire' });
  assert.deepEqual(log.draws, regularFire, 'A habitat marker cannot turn a non-water hazard into deep water');
}));

test('le runtime dessine hazards, drops et terminaux dédiés sans rectangle quand les bitmaps sont prêts', () => withImages(() => {
  const log = contextLog();
  const canvas = { width: 1280, height: 720, getContext: () => log.ctx, addEventListener() {} };
  const game = new GameEngine(canvas);
  game.animationTime = 1.25;
  game.reducedMotion = false;
  game.player = { x: 120, y: 400, w: 42, h: 92 };

  for (const [kind, profile] of Object.entries(MISSION_HAZARD_ART_V56)) {
    log.reset();
    game.drawHazard(log.ctx, { kind, active: true, x: 100, y: 500, w: 220, h: 20 });
    assert.ok(log.draws.some((entry) => entry.path === profile.world.path), kind);
    if (profile.accent) assert.ok(log.draws.some((entry) => entry.path === profile.accent.path), kind);
    assert.equal(log.fillCount(), 0, kind);
  }

  log.reset();
  game.hazards = [{ kind: 'vacuum', active: true, x: 100, y: 500, w: 220, h: 20 }];
  assert.equal(game.drawHazardForegroundOverlays(log.ctx), 1);
  assert.equal(log.draws.at(-1).path, MISSION_HAZARD_ART_V56.vacuum.foreground.path);

  for (const [type, descriptor] of Object.entries(MISSION_DROP_ART_V56)) {
    log.reset();
    game.drawDrop(log.ctx, { type, x: 120, y: 500, w: 30, h: 24 });
    assert.equal(log.draws.at(-1).path, descriptor.path, type);
    assert.equal(log.fillCount(), 0, type);
  }

  for (const [templateId, descriptor] of Object.entries(MISSION_ARCHIVE_ART_V56)) {
    log.reset();
    game.missionLevelRuntime = { templateId };
    game.archiveTerminal = { x: 220, y: 420, w: 58, h: 76, recovered: false };
    game.drawArchiveTerminal(log.ctx);
    assert.equal(log.draws.at(-1).path, descriptor.path, templateId);
    assert.equal(log.fillCount(), 0, templateId);
  }

  const report = game.getAssetReport();
  assert.equal(report.interactiveArtCount, 16);
  assert.equal(report.interactiveArtReady, 16);
}));
