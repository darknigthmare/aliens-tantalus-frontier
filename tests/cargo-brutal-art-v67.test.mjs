import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import { withCargoBrutalRuntimeV67 } from '../src/cargo-brutal-runtime-v67.js';
import {
  CARGO_BRUTAL_PROP_CELLS_V67,
  CARGO_BRUTAL_PROPS_SHEET_V67,
  CARGO_BRUTAL_SURVIVORS_SHEET_V67,
  CARGO_BRUTAL_VISUAL_REGISTRY_V67,
  cargoBrutalVisualRuntimeReportV67,
  resolveCargoBrutalSurvivorFrameV67
} from '../src/cargo-brutal-visuals-v67.js';

const EXPECTED_ASSETS = Object.freeze([
  Object.freeze({
    sheet: CARGO_BRUTAL_PROPS_SHEET_V67,
    sha256: 'b237706cbb7807260c54788db2a96c21392c45c04cff0c6df0d0f49cb40c4830'
  }),
  Object.freeze({
    sheet: CARGO_BRUTAL_SURVIVORS_SHEET_V67,
    sha256: '14a8e7ce335b2513fb6b8743719417814a158c84c160c0a98fb6c74f39f132fd'
  })
]);

const paeth = (left, above, upperLeft) => {
  const prediction = left + above - upperLeft;
  const leftDistance = Math.abs(prediction - left);
  const aboveDistance = Math.abs(prediction - above);
  const upperLeftDistance = Math.abs(prediction - upperLeft);
  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left;
  return aboveDistance <= upperLeftDistance ? above : upperLeft;
};

function decodeRgbaPng(bytes) {
  assert.ok(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])));
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idat = [];
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') idat.push(data);
    offset += 12 + length;
    if (type === 'IEND') break;
  }
  assert.equal(bitDepth, 8, 'profondeur PNG inattendue');
  assert.equal(colorType, 6, 'le PNG doit être RGBA');
  assert.equal(interlace, 0, 'le PNG de runtime ne doit pas être entrelacé');
  const packed = inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  assert.equal(packed.length, (stride + 1) * height);
  const pixels = Buffer.alloc(stride * height);
  let sourceOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = packed[sourceOffset];
    sourceOffset += 1;
    const rowOffset = y * stride;
    for (let x = 0; x < stride; x += 1) {
      const raw = packed[sourceOffset + x];
      const left = x >= 4 ? pixels[rowOffset + x - 4] : 0;
      const above = y > 0 ? pixels[rowOffset - stride + x] : 0;
      const upperLeft = y > 0 && x >= 4 ? pixels[rowOffset - stride + x - 4] : 0;
      if (filter === 0) pixels[rowOffset + x] = raw;
      else if (filter === 1) pixels[rowOffset + x] = (raw + left) & 255;
      else if (filter === 2) pixels[rowOffset + x] = (raw + above) & 255;
      else if (filter === 3) pixels[rowOffset + x] = (raw + Math.floor((left + above) / 2)) & 255;
      else if (filter === 4) pixels[rowOffset + x] = (raw + paeth(left, above, upperLeft)) & 255;
      else assert.fail(`filtre PNG ${filter} non pris en charge`);
    }
    sourceOffset += stride;
  }
  return { width, height, pixels };
}

test('les deux atlas Cargo V67 sont des PNG RGBA immuables, cadrés et réellement transparents', async () => {
  for (const { sheet, sha256 } of EXPECTED_ASSETS) {
    const bytes = await readFile(`.${sheet.path}`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), sha256, sheet.id);
    const decoded = decodeRgbaPng(bytes);
    assert.equal(decoded.width, sheet.columns * sheet.cellWidth, sheet.id);
    assert.equal(decoded.height, sheet.rows * sheet.cellHeight, sheet.id);
    let transparent = 0;
    let hiddenRgb = 0;
    for (let pixel = 0; pixel < decoded.pixels.length; pixel += 4) {
      if (decoded.pixels[pixel + 3] !== 0) continue;
      transparent += 1;
      if (decoded.pixels[pixel] || decoded.pixels[pixel + 1] || decoded.pixels[pixel + 2]) hiddenRgb += 1;
    }
    assert.ok(transparent > decoded.width * decoded.height * 0.4, `${sheet.id}: transparence insuffisante`);
    assert.equal(hiddenRgb, 0, `${sheet.id}: RGB caché sous alpha zéro`);

    for (let row = 0; row < sheet.rows; row += 1) {
      for (let column = 0; column < sheet.columns; column += 1) {
        let opaque = 0;
        let guardLeak = 0;
        for (let localY = 0; localY < sheet.cellHeight; localY += 1) {
          for (let localX = 0; localX < sheet.cellWidth; localX += 1) {
            const x = column * sheet.cellWidth + localX;
            const y = row * sheet.cellHeight + localY;
            const alpha = decoded.pixels[(y * decoded.width + x) * 4 + 3];
            if (alpha > 0) opaque += 1;
            if (alpha > 0 && (
              localX < sheet.guard || localX >= sheet.cellWidth - sheet.guard
              || localY < sheet.guard || localY >= sheet.cellHeight - sheet.guard
            )) guardLeak += 1;
          }
        }
        assert.ok(opaque > 500, `${sheet.id} cellule ${column},${row}: vide`);
        assert.equal(guardLeak, 0, `${sheet.id} cellule ${column},${row}: fuite dans la garde`);
      }
    }
  }
});

test('le registre Cargo expose les huit props et trois identités sans approximation', () => {
  const report = cargoBrutalVisualRuntimeReportV67();
  assert.deepEqual(report, { schema: 67, sheets: 2, runtimeReady: 2, invalid: [] });
  assert.equal(Object.keys(CARGO_BRUTAL_VISUAL_REGISTRY_V67).length, 2);
  assert.equal(Object.keys(CARGO_BRUTAL_PROP_CELLS_V67).length, 8);
  assert.deepEqual(CARGO_BRUTAL_PROP_CELLS_V67['cargo-block-alpha'], { column: 0, row: 0 });
  assert.deepEqual(CARGO_BRUTAL_PROP_CELLS_V67['convoy-capsule'], { column: 3, row: 1 });

  const identities = [
    ['cargo-survivor-shaw', 0],
    ['cargo-survivor-ruiz', 1],
    ['cargo-survivor-kessler', 2]
  ];
  for (const [id, row] of identities) {
    assert.deepEqual(resolveCargoBrutalSurvivorFrameV67({ id, alive: true, action: 'waiting' }, 0), { row, column: 0, action: 'waiting' });
    assert.deepEqual(resolveCargoBrutalSurvivorFrameV67({ id, alive: true, action: 'walk' }), { row, column: 1, action: 'walk' });
    assert.deepEqual(resolveCargoBrutalSurvivorFrameV67({ id, alive: true, action: 'hurt' }), { row, column: 2, action: 'hurt' });
    for (const time of [0, 0.15, 0.3, 12.7]) {
      assert.deepEqual(resolveCargoBrutalSurvivorFrameV67({ id, alive: true, action: 'evacuation' }, time), { row, column: 3, action: 'evacuation' });
    }
    assert.deepEqual(resolveCargoBrutalSurvivorFrameV67({ id, alive: false, downed: true }, 0), { row, column: 2, action: 'downed' });
  }
  assert.equal(resolveCargoBrutalSurvivorFrameV67({ id: 'crew-01-mara-vega' }, 0), null, 'aucune identité étrangère ne doit être empruntée');
});

class CargoArtBaseEngine {
  constructor() {
    this.images = new Map();
    this.animationTime = 0;
    this.audio = {};
    this.accessibilityRuntime = { reducedMotion: false };
  }

  start(options = {}) {
    this.campaign = options.campaign;
    this.player = { id: 'player', x: 100, y: 380, w: 44, h: 90, alive: true, inVehicle: false };
    this.coop = null;
    this.powerNode = { id: 'power', x: 470, y: 388, w: 62, h: 82, active: false };
    this.vehicle = { id: 'vehicle-007-p-5000-powered-work-loader', x: 820, y: 278, w: 150, h: 192, driver: null, passengers: [], occupied: false, destroyed: false, facing: 1 };
    this.objective = { id: 'cargo-extraction', x: 5700, y: 374, w: 86, h: 96, complete: false };
    this.mission = { state: 'active', objectives: {} };
    this.enemies = [{ id: 'cargo-matriarch', x: 4740, y: 300, w: 224, h: 170, alive: true, health: 780, maxHealth: 780, isBoss: true }];
    this.platforms = [];
    this.doors = [];
    return {};
  }

  drawWorld() {}
  getSnapshot() { return {}; }
  onEvent() {}
}

const CargoArtEngine = withCargoBrutalRuntimeV67(CargoArtBaseEngine);

test('le runtime charge puis dessine chaque cellule Cargo dédiée sans passer par un PNJ générique', () => {
  const previousImage = globalThis.Image;
  class MockImage {
    constructor() {
      this.complete = true;
      this.naturalWidth = 1024;
      this.naturalHeight = 512;
    }
    set src(value) {
      this.currentSrc = value;
      if (value === CARGO_BRUTAL_SURVIVORS_SHEET_V67.path) this.naturalHeight = 768;
    }
  }
  globalThis.Image = MockImage;
  try {
    const engine = new CargoArtEngine();
    engine.drawSquadActor = () => assert.fail('Cargo Brutal ne doit jamais emprunter le rendu d’un autre PNJ');
    engine.start({ campaign: { id: 'special-cargo-brutal' }, enemyCatalog: [] });
    assert.equal(engine.images.get(CARGO_BRUTAL_PROPS_SHEET_V67.imageKey)?.currentSrc, CARGO_BRUTAL_PROPS_SHEET_V67.path);
    assert.equal(engine.images.get(CARGO_BRUTAL_SURVIVORS_SHEET_V67.imageKey)?.currentSrc, CARGO_BRUTAL_SURVIVORS_SHEET_V67.path);

    const calls = [];
    const ctx = {
      save() {}, restore() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, arc() {}, fill() {},
      fillRect() {}, strokeRect() {},
      drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh) {
        calls.push({ path: image.currentSrc, sx, sy, sw, sh, dx, dy, dw, dh });
      }
    };
    engine.drawWorld(ctx);
    const propCalls = calls.filter((entry) => entry.path === CARGO_BRUTAL_PROPS_SHEET_V67.path);
    const survivorCalls = calls.filter((entry) => entry.path === CARGO_BRUTAL_SURVIVORS_SHEET_V67.path);
    assert.equal(propCalls.length, 6, '3 obstacles + noyau + coupleur + capsule');
    assert.equal(survivorCalls.length, 3, 'Shaw + Ruiz + Kessler');
    assert.deepEqual(propCalls.map(({ sx, sy }) => [sx, sy]), [
      [0, 0], [256, 0], [512, 0], [768, 0], [256, 256], [768, 256]
    ]);
    assert.deepEqual(survivorCalls.map(({ sx, sy }) => [sx, sy]), [
      [0, 0], [0, 256], [0, 512]
    ]);
    assert.ok(calls.every((entry) => entry.sw === 256 && entry.sh === 256), 'chaque draw doit rester dans sa cellule 256 px');

    calls.length = 0;
    const shaw = engine.cargoSurvivorsV67[0];
    shaw.action = 'evacuation';
    engine.animationTime = 0.3;
    assert.equal(engine.drawCargoSurvivorV67(ctx, shaw), true);
    assert.deepEqual([calls[0].sx, calls[0].sy], [768, 0], 'Shaw conserve sa rangée et utilise uniquement la pose sprint');
    assert.notEqual(calls[0].sx, 512, 'la pose hurt/brace ne doit jamais être cyclée pendant l’évacuation');
  } finally {
    globalThis.Image = previousImage;
  }
});

test('le service worker précache le module et les deux atlas Cargo, sans Matriarche rejetée', async () => {
  const worker = await readFile('sw.js', 'utf8');
  assert.match(worker, /\/src\/cargo-brutal-visuals-v67\.js/);
  assert.match(worker, /\/assets\/openai\/sprites\/normalized\/props\/cargo-brutal-props-atlas-v67\.png/);
  assert.match(worker, /\/assets\/openai\/sprites\/normalized\/npcs\/cargo-survivors-shaw-ruiz-kessler-v67\.png/);
  assert.doesNotMatch(worker, /matriarche-soute/);
});

test('le rapport art sépare les masters chroma des anciens damiers et conserve chaque SHA-256', async () => {
  const report = await readFile('docs/V67_CARGO_BRUTAL_ART_QA.md', 'utf8');
  for (const evidence of [
    ['cargo-brutal-atlas-4x2-chroma-ff00ff.png', '0f6212a2af6775cf066041c9d4e2799f913800a9ed8907b70275f1793c2cb621'],
    ['cargo-survivors-shaw-ruiz-kessler-4x3-chroma-ff00ff.png', '1d33a0dab8f8e695d00a6fb99e66b2a0431326a90d14a16822a4f4d9baa1dc9c'],
    ['matriarche-soute-4x4-chroma-ff00ff.png', '3c86f41edc5397670170d781d9df5e6bbb8153bb0c38b8f7fcfc7e135982e53f']
  ]) {
    assert.ok(report.includes(evidence[0]), `${evidence[0]} absent du rapport`);
    assert.ok(report.includes(evidence[1]), `${evidence[0]} SHA-256 absent du rapport`);
  }
  assert.match(report, /Historique rejeté distinct/);
  assert.match(report, /Ils ne dérivent pas des anciens candidats à damier peint/);
});
