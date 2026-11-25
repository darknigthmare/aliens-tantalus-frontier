import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// This harness draws the delivered PNGs through the production renderer on a
// real Skia Canvas. It neither changes the source pixels nor simulates a browser.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const prefix = '/assets/openai/sprites/alien3-fiorina-v115/';
const manifestPath = `${prefix}manifest.json`;
const output = resolve(process.argv[2] || '/tmp/fiorina-sprites-v115-qa');
const require = createRequire(import.meta.url);
const canvasModule = process.env.CANVAS_MODULE || '@napi-rs/canvas';
const { createCanvas, Image } = require(canvasModule);
const preloadAll = process.env.FIORINA_QA_PRELOAD_ALL === '1';
const report = {
  schemaVersion: 1,
  scope: 'Real offscreen Canvas/Skia rendering of the delivered PNGs through drawAlien3SpriteV115. Not a browser journey or a film-likeness certification.',
  sourcePixelsModified: false,
  preloadAll,
  engine: '@napi-rs/canvas',
  nodeVersion: process.version,
  checks: [],
  assets: [],
  previews: [],
};
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const check = (name, fn) => {
  try { fn(); report.checks.push({ name, passed: true }); }
  catch (error) { report.checks.push({ name, passed: false, error: error.message }); }
};

class LocalImage extends Image {
  set src(value) {
    // PNGs are read from the exact admitted repository path. Do not resolve
    // network URLs, traversal or arbitrary local paths in a visual test.
    let localPath = null;
    try {
      const url = new URL(value);
      if (url.protocol === 'file:' && !url.search && !url.hash) localPath = fileURLToPath(url);
    } catch { /* Rejected by the same local-path contract below. */ }
    const assetPath = localPath ? relative(root, localPath) : '';
    if (!assetPath.startsWith(prefix.slice(1))
      || !/^[a-z0-9-]+\.png$/.test(assetPath.slice(prefix.length - 1))) {
      queueMicrotask(() => this.onerror?.(new Error('Unapproved local sprite path')));
      return;
    }
    super.src = localPath;
  }
  get src() { return super.src; }
}

function alphaStats(ctx, width, height) {
  const pixels = ctx.getImageData(0, 0, width, height).data;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  let visible = 0, transparent = 0, opaque = 0, alphaSum = 0;
  for (let y = 0, i = 3; y < height; y++) {
    for (let x = 0; x < width; x++, i += 4) {
      const alpha = pixels[i];
      alphaSum += alpha;
      if (alpha === 0) transparent++;
      if (alpha === 255) opaque++;
      if (alpha < 8) continue;
      visible++;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
  }
  return {
    visible, transparent, opaque, alphaSum,
    bounds: visible ? { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 } : null,
  };
}

const matrix = ctx => {
  const m = ctx.getTransform();
  return ['a', 'b', 'c', 'd', 'e', 'f'].map(key => m[key]);
};

function drawSample(draw, bank, id, asset, facing, depthScale, frameIndex = 0) {
  const frame = asset.frames[frameIndex];
  const width = Math.max(256, Math.ceil(frame.world.w * 2 + 64));
  const height = Math.max(256, Math.ceil(frame.world.h * 2 + 64));
  assert.ok(width <= 4096 && height <= 4096, `${id}: unreasonable world dimensions for QA`);
  const canvas = createCanvas(width, height), ctx = canvas.getContext('2d');
  const anchor = { x: Math.floor(width / 2), y: Math.floor(height / 2) };
  const receipt = draw(ctx, bank, id, { ...anchor, depthScale, facing, time: (frameIndex + 0.1) / asset.fps, reducedMotion: false });
  const alpha = alphaStats(ctx, width, height);
  canvas.width = 1; canvas.height = 1;
  return { receipt, anchor, alpha };
}

function assertMirrored(right, left, id) {
  assert.equal(right.receipt.drawn, true, `${id}: right draw was rejected`);
  assert.equal(left.receipt.drawn, true, `${id}: left draw was rejected`);
  const r = right.alpha.bounds, l = left.alpha.bounds;
  assert.ok(r && l, `${id}: renderer produced no visible pixels`);
  assert.ok(Math.abs(l.minX - (2 * right.anchor.x - 1 - r.maxX)) <= 2, `${id}: mirrored left edge drift`);
  assert.ok(Math.abs(l.maxX - (2 * right.anchor.x - 1 - r.minX)) <= 2, `${id}: mirrored right edge drift`);
  assert.ok(Math.abs(l.minY - r.minY) <= 1 && Math.abs(l.maxY - r.maxY) <= 1, `${id}: mirrored vertical anchor drift`);
  assert.ok(Math.abs(left.alpha.alphaSum - right.alpha.alphaSum) <= Math.max(255, right.alpha.alphaSum * 0.02), `${id}: mirrored silhouette loses pixels`);
}

async function renderContactSheets(draw, bank, entries) {
  const cols = 4, rows = 3, cellW = 360, cellH = 300, headerH = 62;
  const frames = entries.flatMap(([id, asset]) => asset.frames.map((frame, index) => ({ id, asset, frame, index })));
  for (const [theme, background, foreground, guide] of [
    ['light', '#eee9df', '#25272a', '#aa4951'],
    ['dark', '#13191d', '#eee9df', '#63b8b4'],
  ]) {
    for (let page = 0; page * 6 < frames.length; page++) {
      const canvas = createCanvas(cols * cellW, rows * cellH + headerH), ctx = canvas.getContext('2d');
      ctx.fillStyle = background; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = foreground; ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`FIORINA V115 · ${theme} · ${page + 1}`, 24, 28);
      ctx.font = '13px sans-serif';
      ctx.fillText('Delivered PNGs / production draw function · cross = measured pivot · dashed frame = world rectangle', 24, 49);
      const list = frames.slice(page * 6, page * 6 + 6);
      for (let index = 0; index < list.length; index++) {
        const { id, asset, frame, index: frameIndex } = list[index];
        await bank.request(id);
        assert.equal(bank.status(id).state, 'ready', `${id}: contact-sheet source did not decode`);
        for (const [sideIndex, facing] of [[0, 1], [1, -1]]) {
          const slot = index * 2 + sideIndex;
          const left = (slot % cols) * cellW, top = Math.floor(slot / cols) * cellH + headerH;
          const scale = Math.min(2.5, 280 / frame.world.w, 180 / frame.world.h);
          const w = frame.world.w * scale, h = frame.world.h * scale;
          const x0 = left + (cellW - w) / 2, y0 = top + 52 + (180 - h);
          const mirror = asset.facing === 'left' ? -facing : facing;
          const x = x0 + (mirror === 1 ? frame.pivot.x / frame.w : 1 - frame.pivot.x / frame.w) * w;
          const y = y0 + frame.pivot.y / frame.h * h;
          ctx.fillStyle = foreground; ctx.font = 'bold 13px sans-serif';
          ctx.fillText(`${id} · ${frameIndex + 1}/${asset.frames.length}`, left + 16, top + 23, cellW - 32);
          ctx.font = '12px sans-serif'; ctx.fillText(facing === 1 ? 'right' : 'left', left + 16, top + 41);
          const receipt = draw(ctx, bank, id, { x, y, facing, depthScale: scale, time: (frameIndex + 0.1) / asset.fps, reducedMotion: false });
          assert.equal(receipt.drawn, true, `${id}: contact sheet draw failed`);
          ctx.save(); ctx.strokeStyle = guide; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
          ctx.strokeRect(x0, y0, w, h); ctx.setLineDash([]);
          ctx.beginPath(); ctx.moveTo(left + 16, y); ctx.lineTo(left + cellW - 16, y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.moveTo(x, y - 6); ctx.lineTo(x, y + 6); ctx.stroke();
          ctx.restore(); ctx.fillStyle = foreground; ctx.font = '11px monospace';
          ctx.fillText(`pivot ${frame.pivot.x},${frame.pivot.y} · scale ${scale.toFixed(3)}`, left + 16, top + 264, cellW - 32);
          ctx.fillText(`${frame.world.w}×${frame.world.h} world · ${frame.w}×${frame.h} source`, left + 16, top + 282, cellW - 32);
        }
      }
      const name = `sprites-${theme}-${String(page + 1).padStart(2, '0')}.png`;
      const bytes = canvas.toBuffer('image/png'); await writeFile(join(output, name), bytes);
      report.previews.push({ name, sha256: sha256(bytes), width: canvas.width, height: canvas.height });
      canvas.width = 1; canvas.height = 1;
      globalThis.gc?.();
    }
  }
}

async function main() {
  await mkdir(output, { recursive: true });
  const manifestBytes = await readFile(join(root, manifestPath.slice(1)));
  const manifest = JSON.parse(manifestBytes);
  report.manifest = { path: manifestPath, sha256: sha256(manifestBytes) };
  report.renderer = { path: 'src/alien3-sprites-v115.js', sha256: sha256(await readFile(join(root, 'src/alien3-sprites-v115.js'))) };
  try { report.engineVersion = require(`${canvasModule}/package.json`).version; } catch { report.engineVersion = 'unavailable'; }
  const { createAlien3SpriteBankV115, drawAlien3SpriteV115: draw } = await import('../src/alien3-sprites-v115.js');
  assert.equal(manifest.schemaVersion, 1);
  assert.ok(Object.keys(manifest.assets || {}).length > 0, 'No delivered sprites in the manifest');
  const bank = createAlien3SpriteBankV115(manifest, { imageFactory: () => new LocalImage(), preloadAll,
    maxCachedImages: 4, maxConcurrentImages: 1 });
  await bank.ready;
  report.bankInitial = bank.report();
  assert.deepEqual(report.bankInitial.errors, [], 'Every requested image must decode; vector fallback is not a passing raster test');
  const selection = process.env.FIORINA_QA_IDS ? JSON.parse(process.env.FIORINA_QA_IDS) : null;
  const entries = Object.entries(bank.manifest.assets).filter(([id]) => !selection || selection.includes(id));
  if (selection) assert.deepEqual(entries.map(([id]) => id).sort(), [...selection].sort());
  report.selection = entries.map(([id]) => id);
  report.sources = [];
  const sourceHashes = new Map();
  for (const [id, asset] of entries) {
    globalThis.gc?.();
    if (process.env.FIORINA_QA_TRACE === '1') console.error(id, process.memoryUsage().rss, bank.report().cachedImages);
    await bank.request(id);
    const status = bank.status(id);
    assert.equal(status.state, 'ready', `${id}: image was not ready`);
    const admitted = bank.get(id);
    const frameReports = [];
    for (let frameIndex = 0; frameIndex < asset.frames.length; frameIndex++) {
      const frame = asset.frames[frameIndex], image = admitted.frameImages[frameIndex];
      if (!sourceHashes.has(frame.src)) {
        const bytes = await readFile(join(root, frame.src));
        assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
        const measured = { src: frame.src, sha256: sha256(bytes), bytes: bytes.length, width: image.width, height: image.height };
        sourceHashes.set(frame.src, measured); report.sources.push(measured);
      }
      const frameCanvas = createCanvas(frame.w, frame.h), frameCtx = frameCanvas.getContext('2d');
      frameCtx.drawImage(image, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);
      const originalAlpha = alphaStats(frameCtx, frame.w, frame.h);
      frameCanvas.width = 1; frameCanvas.height = 1;
      const right = drawSample(draw, bank, id, asset, 1, 1, frameIndex);
      const left = drawSample(draw, bank, id, asset, -1, 1, frameIndex);
      const smaller = drawSample(draw, bank, id, asset, 1, 0.6, frameIndex);
      frameReports.push({ frameIndex, frame, originalAlpha, right, left, depthScale06: smaller,
        worldContactGap: originalAlpha.bounds ? (frame.pivot.y - originalAlpha.bounds.maxY - 1) * frame.world.h / frame.h : null });
      check(`${id}[${frameIndex}]: source integrity`, () => {
        const bytes = sourceHashes.get(frame.src);
        if (frame.src === asset.src && asset.sha256) assert.equal(bytes.sha256, asset.sha256);
        assert.ok(originalAlpha.visible > 0, 'Empty source frame');
        assert.ok(originalAlpha.transparent > 0, 'Opaque rectangular source frame');
        assert.ok(frame.pivot.x >= 0 && frame.pivot.x <= frame.w && frame.pivot.y >= 0 && frame.pivot.y <= frame.h, 'Pivot lies outside the delivered source frame');
        assert.equal(right.receipt.frameIndex, frameIndex, 'Wrong real PNG frame rendered');
      });
      check(`${id}[${frameIndex}]: mirrored pivot`, () => assertMirrored(right, left, id));
      check(`${id}[${frameIndex}]: depth scale`, () => {
        assert.equal(smaller.receipt.drawn, true);
        for (const dimension of ['width', 'height']) {
          assert.ok(Math.abs(smaller.alpha.bounds[dimension] - right.alpha.bounds[dimension] * 0.6) <= 3,
            `${dimension} did not follow depth scale`);
        }
      });
    }
    report.assets.push({ id, decoded: status, frames: frameReports });
    check(`${id}: context restored`, () => {
      const canvas = createCanvas(500, 500), ctx = canvas.getContext('2d');
      ctx.translate(7, 11); ctx.scale(1.1, 0.9); ctx.globalAlpha = 0.83;
      const before = { transform: matrix(ctx), alpha: ctx.globalAlpha };
      assert.equal(draw(ctx, bank, id, { x: 200, y: 200, facing: -1, depthScale: 0.7, time: 0, reducedMotion: true }).drawn, true);
      assert.deepEqual({ transform: matrix(ctx), alpha: ctx.globalAlpha }, before);
      canvas.width = 1; canvas.height = 1;
    });
    check(`${id}: reduced motion uses the first real frame`, () => {
      const canvas = createCanvas(500, 500), ctx = canvas.getContext('2d');
      const result = draw(ctx, bank, id, { x: 200, y: 200, facing: 1, time: 100, reducedMotion: true });
      assert.equal(result.drawn, true); assert.equal(result.frameIndex, 0);
      canvas.width = 1; canvas.height = 1;
    });
  }
  check('Unknown sprite leaves the canvas empty', () => {
    const canvas = createCanvas(32, 32), ctx = canvas.getContext('2d');
    const result = draw(ctx, bank, '__missing__', { x: 16, y: 16, depthScale: 1, facing: 1 });
    assert.equal(result.drawn, false); assert.equal(alphaStats(ctx, 32, 32).visible, 0);
  });
  await renderContactSheets(draw, bank, entries);
  report.bank = bank.report();
  check('All requested images decoded', () => assert.deepEqual(report.bank.errors, []));
  bank.dispose();
  report.bankAfterDispose = bank.report();
  report.passed = report.checks.every(result => result.passed);
  await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ passed: report.passed, assets: report.assets.length, checks: report.checks.length, failed: report.checks.filter(c => !c.passed), previews: report.previews.map(p => p.name) }, null, 2));
  if (!report.passed) process.exitCode = 1;
}

// Native graphics allocators can retain decoded buffers after JS releases them.
// Keep complete coverage reproducible in constrained CI hosts by inspecting six
// entries per fresh process. The optional full-preload mode remains explicit.
async function inspectCompletePack() {
  if (process.env.FIORINA_QA_IDS || preloadAll) return main();
  await mkdir(output, { recursive: true });
  const bytes = await readFile(join(root, manifestPath.slice(1)));
  const manifest = JSON.parse(bytes), ids = Object.keys(manifest.assets);
  const temporary = await mkdtemp(join(tmpdir(), 'fiorina-pixel-parts-'));
  const full = { ...report, scope: report.scope + ' Six entries per independent process; all entries and PNGs are checked.',
    manifest: { path: manifestPath, sha256: sha256(bytes) },
    renderer: { path: 'src/alien3-sprites-v115.js', sha256: sha256(await readFile(join(root, 'src/alien3-sprites-v115.js'))) },
    sources: [], partitions: [], checks: [], assets: [], previews: [] };
  const sources = new Map();
  try {
    for (let offset = 0; offset < ids.length; offset += 6) {
      const selection = ids.slice(offset, offset + 6), part = String(offset / 6 + 1).padStart(2, '0');
      const partOutput = join(temporary, part);
      await new Promise((resolveChild, rejectChild) => {
        const child = spawn(process.execPath, ['--expose-gc', fileURLToPath(import.meta.url), partOutput], {
          cwd: root, env: { ...process.env, FIORINA_QA_IDS: JSON.stringify(selection) }, stdio: ['ignore', 'pipe', 'pipe'] });
        let detail = '';
        child.stdout.on('data', chunk => { detail += chunk; });
        child.stderr.on('data', chunk => { detail += chunk; });
        child.on('error', rejectChild);
        child.on('close', (code, signal) => code === 0 ? resolveChild() : rejectChild(new Error(`Pixel partition ${part} failed (${signal || code}): ${detail}`)));
      });
      const result = JSON.parse(await readFile(join(partOutput, 'report.json'), 'utf8'));
      assert.equal(result.passed, true);
      assert.deepEqual(result.manifest, full.manifest, 'Manifest changed during pixel QA');
      assert.deepEqual(result.renderer, full.renderer, 'Renderer changed during pixel QA');
      assert.deepEqual(result.selection, selection);
      full.engineVersion = result.engineVersion;
      full.partitions.push({ part, selection, bankInitial: result.bankInitial, bank: result.bank, bankAfterDispose: result.bankAfterDispose });
      full.checks.push(...result.checks.map(check => ({ ...check, partition: part })));
      full.assets.push(...result.assets);
      for (const source of result.sources) {
        if (sources.has(source.src)) assert.deepEqual(sources.get(source.src), source, 'PNG changed during pixel QA');
        sources.set(source.src, source);
      }
      for (const preview of result.previews) {
        const name = preview.name.replace(/-(\d+)\.png$/, `-part${part}-$1.png`);
        await copyFile(join(partOutput, preview.name), join(output, name));
        full.previews.push({ ...preview, name });
      }
    }
    full.sources = [...sources.values()];
    assert.deepEqual(full.assets.map(asset => asset.id).sort(), ids.sort());
    const declared = [...new Set(Object.values(manifest.assets).flatMap(asset => [asset.src, ...(asset.frames || []).map(frame => frame.src || asset.src)]))].sort();
    assert.deepEqual(full.sources.map(source => source.src).sort(), declared, 'Every delivered PNG must be decoded and rendered');
    full.passed = full.checks.every(check => check.passed);
    await writeFile(join(output, 'report.json'), JSON.stringify(full, null, 2) + '\n');
    console.log(JSON.stringify({ passed: full.passed, assets: full.assets.length, sources: full.sources.length,
      checks: full.checks.length, partitions: full.partitions.length, previews: full.previews.length }, null, 2));
  } finally { await rm(temporary, { recursive: true, force: true }); }
}

inspectCompletePack().catch(async error => {
  report.passed = false; report.error = error.stack || String(error);
  await mkdir(output, { recursive: true });
  await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.error(error); process.exitCode = 1;
});
