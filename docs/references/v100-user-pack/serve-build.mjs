import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';

// Read-only loopback serving of the actual build; no source fallback or manifest writes.
const root = await realpath(process.env.QA_STATIC_ROOT || resolve('dist'));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.md': 'text/markdown', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.mp3': 'audio/mpeg' };
createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405).end(); return; }
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let target = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    const rel = relative(root, target);
    if (isAbsolute(rel) || rel === '..' || rel.startsWith('..' + sep)) { response.writeHead(403).end(); return; }
    if (!extname(target)) {
      try { if ((await stat(target + '.html')).isFile()) target += '.html'; } catch { /* Unknown routes stay 404. */ }
    }
    const info = await stat(target);
    if (!info.isFile()) { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'content-type': mime[extname(target)] || 'application/octet-stream',
      'content-length': info.size, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
    if (request.method === 'HEAD') response.end();
    else createReadStream(target).on('error', () => response.destroy()).pipe(response);
  } catch { response.writeHead(404, { 'content-type': 'text/plain' }).end('Not found'); }
}).listen(Number(process.env.PORT || 4309), '127.0.0.1', () => console.log('Read-only build ready: ' + root));
