import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

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
  let fills = 0;
  const base = {
    drawImage: (image, ...args) => draws.push({ path: image?.currentSrc, args }),
    fillRect: () => { fills += 1; }
  };
  const ctx = new Proxy(base, {
    get: (target, key) => key in target ? target[key] : () => {},
    set: (target, key, value) => { target[key] = value; return true; }
  });
  return { ctx, draws, fillCount: () => fills, reset: () => { draws.length = 0; fills = 0; } };
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
