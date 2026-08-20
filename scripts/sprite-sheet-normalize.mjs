import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { NEW_SPRITE_SHEETS } from '../src/visuals.js';

const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9225';
const appUrl = process.env.APP_URL || 'http://127.0.0.1:4173/';
const names = NEW_SPRITE_SHEETS.map((asset) => asset.file.split('/').at(-1));
const output = resolve('.sprite-output');

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const target = await fetch(`${endpoint}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' }).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let sequence = 0;
const pending = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const request = pending.get(message.id);
  pending.delete(message.id);
  message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
});

function command(method, params = {}) {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

await command('Page.enable');
await command('Runtime.enable');
await command('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: output });
await command('Page.navigate', { url: appUrl });
await new Promise((resolve) => setTimeout(resolve, 1000));

const expression = `(async () => {
  const names = ${JSON.stringify(names)};
  const size = 1024;
  const columns = 4;
  const rows = 4;
  const guard = 8;
  const reports = [];

  const isBackground = (data, offset) => {
    const alpha = data[offset + 3];
    if (alpha < 16) return true;
    const red = data[offset], green = data[offset + 1], blue = data[offset + 2];
    return Math.min(red, green, blue) >= 215 && Math.max(red, green, blue) - Math.min(red, green, blue) <= 22;
  };

  const clearPixel = (data, offset) => {
    data[offset] = 0;
    data[offset + 1] = 0;
    data[offset + 2] = 0;
    data[offset + 3] = 0;
  };

  for (const name of names) {
    const response = await fetch('/assets/openai/' + name, { cache: 'no-store' });
    if (!response.ok) throw new Error(name + ': HTTP ' + response.status);
    const image = await createImageBitmap(await response.blob());
    const source = document.createElement('canvas');
    source.width = image.width;
    source.height = image.height;
    const sourceContext = source.getContext('2d', { willReadFrequently: true });
    sourceContext.drawImage(image, 0, 0);
    const sourcePixels = sourceContext.getImageData(0, 0, source.width, source.height);
    const sourceData = sourcePixels.data;
    const sourceCount = source.width * source.height;
    const mask = new Uint8Array(sourceCount);
    const queue = new Int32Array(sourceCount);
    let head = 0;
    let tail = 0;

    const enqueue = (x, y) => {
      if (x < 0 || y < 0 || x >= source.width || y >= source.height) return;
      const index = y * source.width + x;
      if (mask[index] || !isBackground(sourceData, index * 4)) return;
      mask[index] = 1;
      queue[tail++] = index;
    };

    for (let x = 0; x < source.width; x++) {
      enqueue(x, 0);
      enqueue(x, source.height - 1);
    }
    for (let y = 0; y < source.height; y++) {
      enqueue(0, y);
      enqueue(source.width - 1, y);
    }
    while (head < tail) {
      const index = queue[head++];
      const x = index % source.width;
      const y = Math.floor(index / source.width);
      enqueue(x - 1, y);
      enqueue(x + 1, y);
      enqueue(x, y - 1);
      enqueue(x, y + 1);
    }
    for (let index = 0; index < sourceCount; index++) if (mask[index]) clearPixel(sourceData, index * 4);
    sourceContext.putImageData(sourcePixels, 0, 0);

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(source, 0, 0, size, size);
    const pixels = context.getImageData(0, 0, size, size);
    const data = pixels.data;

    const inGuard = (x, y) => {
      if (x < guard || y < guard || x >= size - guard || y >= size - guard) return true;
      for (const boundary of [256, 512, 768]) {
        if (Math.abs(x - boundary) < guard || Math.abs(y - boundary) < guard) return true;
      }
      return false;
    };

    let transparent = 0;
    let hiddenRgb = 0;
    let guardViolations = 0;
    const occupancy = Array(columns * rows).fill(0);
    const hashes = Array(columns * rows).fill(2166136261);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const offset = (y * size + x) * 4;
        if (inGuard(x, y)) clearPixel(data, offset);
        const alpha = data[offset + 3];
        if (alpha === 0) {
          transparent++;
          if (data[offset] || data[offset + 1] || data[offset + 2]) hiddenRgb++;
          continue;
        }
        if (inGuard(x, y)) guardViolations++;
        const cell = Math.floor(y / 256) * columns + Math.floor(x / 256);
        occupancy[cell]++;
        if (x % 8 === 0 && y % 8 === 0) {
          hashes[cell] ^= data[offset] + data[offset + 1] * 3 + data[offset + 2] * 7 + alpha * 11;
          hashes[cell] = Math.imul(hashes[cell], 16777619) >>> 0;
        }
      }
    }
    context.putImageData(pixels, 0, 0);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    await new Promise((resolve) => setTimeout(resolve, 250));
    URL.revokeObjectURL(href);
    image.close();
    reports.push({
      name,
      sourceWidth: source.width,
      sourceHeight: source.height,
      width: size,
      height: size,
      transparent,
      transparentRatio: Number((transparent / (size * size)).toFixed(4)),
      hiddenRgb,
      guardViolations,
      occupiedCells: occupancy.filter((value) => value > 100).length,
      minCellPixels: Math.min(...occupancy),
      distinctCellHashes: new Set(hashes).size
    });
  }
  return reports;
})()`;

const keepAlive = setInterval(() => {}, 1000);
const evaluated = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
clearInterval(keepAlive);
if (evaluated.exceptionDetails) throw new Error(evaluated.exceptionDetails.exception?.description || evaluated.exceptionDetails.text);
const reports = evaluated.result.value;

for (const report of reports) {
  const source = join(output, report.name);
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      await access(source);
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  await writeFile(join('assets', 'openai', report.name), await readFile(source));
  if (report.width !== 1024 || report.height !== 1024) throw new Error(`${report.name}: invalid dimensions`);
  if (report.hiddenRgb || report.guardViolations) throw new Error(`${report.name}: alpha guard violation`);
  if (report.occupiedCells !== 16 || report.distinctCellHashes !== 16) throw new Error(`${report.name}: incomplete or duplicated cells`);
}

await writeFile('assets/openai/sprite-normalization-report.json', JSON.stringify({
  generatedAt: new Date().toISOString(),
  pipeline: 'OpenAI ImageGen + deterministic Canvas alpha cleanup/normalization',
  grid: { columns: 4, rows: 4, cellSize: 256, guard: 8 },
  reports
}, null, 2));

await rm(output, { recursive: true, force: true });
socket.close();
console.log(JSON.stringify(reports, null, 2));
