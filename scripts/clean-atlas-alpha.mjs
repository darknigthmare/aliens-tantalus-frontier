import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9225';
const appUrl = process.env.APP_URL || 'http://127.0.0.1:4173/';
const names = ['echo9-sprite-sheet.png', 'xenomorph-sprite-sheet.png', 'arsenal-props-atlas.png'];
const output = resolve('.alpha-output');
await mkdir(output, { recursive: true });
const target = await fetch(`${endpoint}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' }).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });

let sequence = 0;
const pending = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const request = pending.get(message.id); pending.delete(message.id);
  message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
});
function command(method, params = {}) {
  const id = ++sequence; socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

await command('Page.enable');
await command('Runtime.enable');
await command('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: output });
await command('Page.navigate', { url: appUrl });
await new Promise((resolve) => setTimeout(resolve, 1200));
const expression = `(async () => {
  const names = ${JSON.stringify(names)};
  const results = [];
  const candidate = (data, p) => {
    const r = data[p], g = data[p + 1], b = data[p + 2];
    return Math.min(r, g, b) >= 214 && Math.max(r, g, b) - Math.min(r, g, b) <= 18;
  };
  for (const name of names) {
    const image = await createImageBitmap(await fetch('/assets/openai/' + name, { cache: 'no-store' }).then(response => response.blob()));
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext('2d', { willReadFrequently: true }); context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height); const data = pixels.data;
    const count = canvas.width * canvas.height; const mask = new Uint8Array(count); const queue = new Int32Array(count);
    let head = 0, tail = 0;
    const enqueue = (x, y) => {
      if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
      const index = y * canvas.width + x; if (mask[index] || !candidate(data, index * 4)) return;
      mask[index] = 1; queue[tail++] = index;
    };
    for (let x = 0; x < canvas.width; x++) { enqueue(x, 0); enqueue(x, canvas.height - 1); }
    for (let y = 0; y < canvas.height; y++) { enqueue(0, y); enqueue(canvas.width - 1, y); }
    while (head < tail) {
      const index = queue[head++], x = index % canvas.width, y = Math.floor(index / canvas.width);
      enqueue(x - 1, y); enqueue(x + 1, y); enqueue(x, y - 1); enqueue(x, y + 1);
    }
    let transparent = 0;
    for (let index = 0; index < count; index++) if (mask[index]) { data[index * 4 + 3] = 0; transparent++; }
    context.putImageData(pixels, 0, 0);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const href = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = href; link.download = name; document.body.append(link); link.click(); link.remove();
    await new Promise(resolve => setTimeout(resolve, 300)); URL.revokeObjectURL(href); image.close();
    results.push({ name, width: canvas.width, height: canvas.height, transparent, ratio: transparent / count });
  }
  return results;
})()`;
const keepAlive = setInterval(() => {}, 1000);
const evaluated = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
clearInterval(keepAlive);
if (evaluated.exceptionDetails) throw new Error(evaluated.exceptionDetails.text);
const results = evaluated.result.value;
for (const result of results) {
  const source = join(output, result.name);
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try { await access(source); break; } catch { await new Promise((resolve) => setTimeout(resolve, 200)); }
  }
  await writeFile(`assets/openai/${result.name}`, await readFile(source));
}
socket.close();
console.log(JSON.stringify(results.map(({ dataUrl, ...result }) => result), null, 2));
