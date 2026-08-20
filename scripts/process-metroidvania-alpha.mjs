import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9225';
const appUrl = process.env.APP_URL || 'http://127.0.0.1:4173/';
const publicPath = process.env.ATF_ALPHA_ASSET || '/assets/openai/metroidvania/tantalus-mission-foreground.png';
if (!/^\/assets\/openai\/metroidvania\/[a-z0-9-]+\.png$/.test(publicPath)) throw new Error(`Unsupported asset path: ${publicPath}`);
const outputDir = resolve('.alpha-output', 'metroidvania-final');
const downloadName = publicPath.split('/').at(-1);
await mkdir(outputDir, { recursive: true });

const target = await fetch(`${endpoint}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' }).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolveSocket, reject) => {
  socket.addEventListener('open', resolveSocket, { once: true });
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
const command = (method, params = {}) => {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolveCommand, reject) => pending.set(id, { resolve: resolveCommand, reject }));
};

await command('Page.enable');
await command('Runtime.enable');
await command('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: outputDir });
await command('Page.navigate', { url: appUrl });
await new Promise((resolveWait) => setTimeout(resolveWait, 700));
const expression = `(async () => {
  const image = await createImageBitmap(await fetch('${publicPath}?alpha=' + Date.now(), { cache: 'no-store' }).then(response => response.blob()));
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = pixels;
  let transparent = 0;
  for (let offset = 0; offset < data.length; offset += 4) {
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const checker = Math.min(red, green, blue) >= 205 && Math.max(red, green, blue) - Math.min(red, green, blue) <= 24;
    if (!checker) continue;
    data[offset + 3] = 0;
    transparent += 1;
  }
  context.putImageData(pixels, 0, 0);
  const blob = await new Promise(resolveBlob => canvas.toBlob(resolveBlob, 'image/png'));
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = '${downloadName}';
  document.body.append(link);
  link.click();
  link.remove();
  await new Promise(resolveDownload => setTimeout(resolveDownload, 500));
  URL.revokeObjectURL(href);
  image.close();
  return { width: canvas.width, height: canvas.height, transparent, ratio: transparent / (canvas.width * canvas.height) };
})()`;
const evaluated = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
if (evaluated.exceptionDetails) throw new Error(evaluated.exceptionDetails.exception?.description || evaluated.exceptionDetails.text);
const downloaded = resolve(outputDir, downloadName);
for (let attempt = 0; attempt < 50; attempt += 1) {
  try {
    await access(downloaded);
    break;
  } catch {
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
}
await writeFile(resolve(`.${publicPath}`), await readFile(downloaded));
socket.close();
console.log(JSON.stringify({ file: publicPath, ...evaluated.result.value }, null, 2));
