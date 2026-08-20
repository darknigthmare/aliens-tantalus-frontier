import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png',
  '.webmanifest': 'application/manifest+json; charset=utf-8', '.md': 'text/markdown; charset=utf-8'
};

function safePath(url) {
  const requested = decodeURIComponent((url || '/').split('?')[0]);
  const relative = normalize(requested === '/' ? 'index.html' : requested.replace(/^\/+/, ''));
  if (relative.startsWith('..')) return null;
  return join(root, relative);
}

createServer(async (request, response) => {
  let file = safePath(request.url);
  if (!file) { response.writeHead(403).end('Forbidden'); return; }
  try {
    const info = await stat(file);
    if (info.isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    response.writeHead(200, {
      'content-type': mime[extname(file)] || 'application/octet-stream',
      'cache-control': extname(file) === '.html' ? 'no-store' : 'public, max-age=60',
      'x-content-type-options': 'nosniff'
    });
    response.end(body);
  } catch {
    try {
      const body = await readFile(join(root, 'index.html'));
      response.writeHead(200, { 'content-type': mime['.html'], 'cache-control': 'no-store' });
      response.end(body);
    } catch { response.writeHead(404).end('Not found'); }
  }
}).listen(port, '127.0.0.1', () => console.log(`ALIENS: TANTALUS FRONTIER running at http://127.0.0.1:${port}`));
